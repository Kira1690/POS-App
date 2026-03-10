# Printer Connection Code Analysis

## Current TCP Connection Flow

### EpsonPrinterService.sendBytes() -- Core Method

```
Call sendBytes(ip, port, bytes)
  |
  +-- Check isTcpSocketAvailable()
  |     +-- false --> throw "TCP socket unavailable"
  |     +-- true  --> continue
  |
  +-- Create Buffer from byte array
  |
  +-- Start 3000ms timeout timer
  |
  +-- nativeTcpSocket.createConnection({ host: ip, port, timeout: 3000 })
  |     |
  |     +-- on 'connect' callback:
  |     |     +-- client.write(buffer)
  |     |     +-- on write complete:
  |     |           +-- clearTimeout(timer)
  |     |           +-- client.destroy()
  |     |           +-- resolve()
  |     |
  |     +-- on 'error' callback:
  |           +-- clearTimeout(timer)
  |           +-- reject(error)
  |
  +-- If client is null (createConnection failed):
        +-- clearTimeout(timer)
        +-- reject("Failed to create TCP connection")
```

### Issues Found

#### 1. Socket cleanup on timeout -- RESOURCE LEAK
**Line 46-47**: When timeout fires, `reject()` is called but `client.destroy()` is NOT called.
The socket remains open until GC collects it or the OS closes it.

**Fix needed**:
```typescript
const timer = setTimeout(() => {
  if (client) client.destroy();  // <-- ADD THIS
  reject(new Error('Printer connection timeout'));
}, TIMEOUT_MS);
```

#### 2. No retry on transient failures
**Current**: Single attempt. If the printer is momentarily busy (common with thermal printers
processing a previous job), the connection fails permanently.

**Fix**: Add retry with backoff:
```typescript
async sendBytesWithRetry(ip: string, port: number, bytes: number[], maxRetries = 2): Promise<void> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await this.sendBytes(ip, port, bytes);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));  // 500ms, 1000ms backoff
      }
    }
  }
  throw lastError;
}
```

#### 3. Write callback error parameter is ignored
**Line 52**: `client!.write(buffer, undefined, (_err?: Error) => { ... })`

The `_err` parameter is captured but never checked. If `write()` fails (printer
buffer full, connection reset), the promise resolves successfully anyway.

**Fix**:
```typescript
client!.write(buffer, undefined, (err?: Error) => {
  clearTimeout(timer);
  client!.destroy();
  if (err) {
    reject(err);
  } else {
    resolve();
  }
});
```

#### 4. Double-reject possible on error + timeout race
If the socket emits 'error' AND the timeout fires at the same time, `reject()`
is called twice. The second call is ignored by Promise but it's sloppy.

**Fix**: Use a `settled` flag:
```typescript
let settled = false;
const settle = (fn: () => void) => { if (!settled) { settled = true; fn(); } };

const timer = setTimeout(() => settle(() => {
  if (client) client.destroy();
  reject(new Error('Printer connection timeout'));
}), TIMEOUT_MS);

client.on('error', (err) => settle(() => {
  clearTimeout(timer);
  reject(err instanceof Error ? err : new Error(String(err)));
}));
```

#### 5. No connection keep-alive or pooling
Each print job opens a new TCP connection. For burst printing (send-to-kitchen
printing to 3+ stations), this means 3+ TCP handshakes in rapid succession.

**Assessment**: This is actually CORRECT for ESC/POS printers. Epson thermal
printers expect short-lived connections. Connection pooling would cause issues
with printer state (ESC/POS init command resets the printer). No change needed.

#### 6. testConnection sends INIT to printer
**Line 73-81**: `testConnection()` sends ESC/POS INIT bytes to the printer.
This is harmless (INIT just resets the print buffer) but it could interrupt
a print job in progress on the printer.

**Improvement**: For a pure connection test, could just open and close the
TCP socket without sending any data. But the current approach is fine --
ESC/POS INIT is the standard way to test printer readiness.

---

## NativeTcpSocket Wrapper Analysis

**File**: `src/services/trx/pos/NativeTcpSocket.ts`

### Lazy Initialization Pattern
```
import time: Module loads, no native module access
  |
First call to createConnection() or isValidIPv4():
  |
  +-- initializeNativeModule()
  |     +-- Check NativeModules.TcpSockets
  |     +-- Check TurboModuleRegistry.get('TcpSockets')
  |     +-- If both null (Expo Go): throw, isInitialized = false
  |     +-- If found: nativeModule = ref, isInitialized = true
  |
  +-- isTcpSocketAvailable() returns isInitialized
```

### Key Points
- Works with New Architecture (TurboModules) via lazy getter
- Falls back gracefully in Expo Go (returns null, shows warning)
- Socket options support `localAddress` binding (important for multi-NIC devices)
- Singleton pattern via module-level state
- The `createConnection` wrapper adds `nodelay: true` by default (good for real-time printing)

### Compatibility
- Requires `react-native-tcp-socket` native module
- Requires custom dev build (NOT Expo Go)
- Patched for New Architecture: `patches/react-native-tcp-socket@6.4.1.patch`

---

## Printer Protocol (ESC/POS)

### Byte Sequences Used

| Command | Bytes | Purpose |
|---------|-------|---------|
| INIT | `1B 40` | Reset printer to defaults |
| CUT | `1D 56 41 00` | Full cut paper |
| BOLD_ON | `1B 45 01` | Enable bold text |
| BOLD_OFF | `1B 45 00` | Disable bold text |
| CENTER | `1B 61 01` | Center alignment |
| LEFT | `1B 61 00` | Left alignment |
| LARGE_ON | `1B 21 30` | Double width + double height |
| LARGE_OFF | `1B 21 00` | Normal size |
| LF | `0A` | Line feed |

### Character Encoding
**Line 24-25**: Uses basic ASCII (charCode & 0xff). Does NOT support Unicode.
Non-ASCII characters (accents, CJK) will print as garbage.

**Assessment**: Fine for English-only POS. If internationalization is needed later,
would need to add codepage selection (`ESC t n`) commands.

### Paper Size Handling
- 58mm: 32 characters per line
- 80mm: 40 characters per line (default)
- Dynamic column width calculation in `printReceipt()`
- Kitchen tickets use hardcoded 32-char separator (should also be dynamic)

---

## Recommendations for Connection Code

### Priority 1 (Must Fix)
1. Fix socket cleanup on timeout (resource leak)
2. Fix write callback error handling (silent failures)
3. Add settled flag to prevent double-reject

### Priority 2 (Should Fix)
4. Add retry with backoff for transient failures
5. Add connection status caching for settings UI
6. Kitchen ticket separator should use paper size

### Priority 3 (Nice to Have)
7. Add print queue for burst printing (Promise.allSettled)
8. Add last-connected timestamp per IP
9. Kitchen ticket station header customization
