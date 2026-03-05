# Bug Report: TRX Terminal Connection Failures

> **Status**: ✅ All fixed (2026-02-28)
> **Branch**: feature/testing-01
> **Terminal tested**: 192.168.1.12:1180
> **Total bugs**: 6 (Bugs 1-5 fixed in session 4, Bug 6 fixed in session 5)

---

## Overview

The TRX payment terminal was successfully processing payments in the reference codebase
(`Food-MobileApp-Frontend/paymentprocessor`) but completely failed to connect in the POS App.
Six separate bugs were identified and fixed across two sessions. Each is documented below in isolation.

**Bug 6 was the most persistent** — it was misdiagnosed 5 times before the true root cause
was found by matching the working reference implementation exactly.

---

## Bug 1 — TCP Module Null at Bundle Parse Time (New Architecture)

### Severity: CRITICAL — blocks all TCP connections

### Symptom
```
LOG  [TRX][ERROR] TCP socket unavailable — requires a custom dev build, not Expo Go.
// OR in custom dev build with newArchEnabled=true:
TypeError: Cannot read property 'createConnection' of null
```

### Root Cause
`react-native-tcp-socket@6.4.1` initialised `NativeModules.TcpSockets` at **module parse time**:

```js
// BEFORE (Globals.js — evaluated when bundle loads)
import { NativeModules } from 'react-native';
const Sockets = NativeModules.TcpSockets;   // ← NULL in New Architecture
```

With `newArchEnabled: true` (bridgeless mode / TurboModules), `NativeModules.TcpSockets` is
`null` at parse time because TurboModule registry is not populated until after the JS bundle
finishes loading. The `Sockets` reference is permanently null — every `createConnection()`
call throws.

### Why It Worked in Reference App
The reference app (`Food-MobileApp-Frontend`) had `newArchEnabled: false`. Old Architecture
populates `NativeModules` synchronously before JS bundle execution. The POS App cannot disable
New Architecture because `react-native-reanimated` worklets require it.

### Fix Applied
**File**: `node_modules/react-native-tcp-socket/src/Globals.js`
**Patch**: `patches/react-native-tcp-socket@6.4.1.patch`

Changed from module-level constant to a lazy getter called at use-time:

```js
// AFTER — lazy getter, called when socket is actually needed
import { NativeModules, TurboModuleRegistry } from 'react-native';

export const getTcpSockets = () =>
  (TurboModuleRegistry.get && TurboModuleRegistry.get('TcpSockets')) ||
  NativeModules.TcpSockets;
```

All four files updated to call `getTcpSockets()` at the point of use:
- `Globals.js`
- `Socket.js`
- `Server.js`
- `TLSSocket.js`

### Verification
Metro log after fix:
```
LOG  [TRX][INFO][initializeNativeModule] Native TCP socket module loaded: turbo=true legacy=true
```

---

## Bug 2 — Socket ID Conflict After Hot Reload

### Severity: HIGH — breaks all connections after any hot reload

### Symptom
After `Cmd+R` / Metro hot reload, every TCP connection attempt silently times out:
```
LOG  [NetworkScanner] FAILED — connection timeout
// OR
LOG  [SimpleTCPTester] method1_simpleConnect: timeout at 3000ms
LOG  [SimpleTCPTester] method2_quickConnect: timeout at 1500ms
LOG  [SimpleTCPTester] method3_immediateClose: timeout at 3000ms
```
The terminal itself is reachable (nc confirms it). The failure is only in the app after
hot reload.

### Root Cause
`Globals.js` used a **module-level variable** for the socket ID counter:

```js
// BEFORE (resets to 0 on every hot reload)
let instanceNumber = 0;
function getNextId() {
    return instanceNumber++;
}
```

On Android, **native modules are NOT reset during hot reload** — the JS bundle re-evaluates
but the native TcpSockets module retains its internal socket map from the previous session.

Sequence of failure:
1. First run: JS creates socket with ID=0, native side tracks it → OK
2. Hot reload: `instanceNumber` resets to 0, JS creates NEW socket with ID=0
3. Native side already has a socket at ID=0 (from step 1, not garbage-collected yet)
4. Native's `connect` callback targets the OLD socket, new socket never receives the event
5. The connection timeout fires → "connection failed"

### Fix Applied
**File**: `node_modules/react-native-tcp-socket/src/Globals.js`
**Patch**: `patches/react-native-tcp-socket@6.4.1.patch`

Used `global.__tcpSocketInstanceNumber` which survives hot reload (module re-evaluation
doesn't reset JS globals):

```js
// AFTER — counter survives hot reload
if (!global.__tcpSocketInstanceNumber) {
  global.__tcpSocketInstanceNumber = 0;
}
function getNextId() {
    return global.__tcpSocketInstanceNumber++;
}
```

### Verification
Before fix: socket IDs restart at 0 after every hot reload → conflict
After fix: IDs increment monotonically across hot reloads (e.g. 0→1→2 before reload, 3→4→5 after)

---

## Bug 3 — NativeEventEmitter Initialised with null

### Severity: MEDIUM — events unreliable after hot reload in some scenarios

### Symptom
TCP connection events (`connect`, `data`, `close`, `error`) sometimes not received after
hot reload, causing silent hangs rather than the timeout-based failure in Bug 2.

### Root Cause
`NativeEventEmitter` was constructed with `null` as its module argument:

```js
// BEFORE
const nativeEventEmitter = new NativeEventEmitter(null);
```

`NativeEventEmitter(null)` falls back to `DeviceEventEmitter` (global channel). While
the native module emits events via `RCTDeviceEventEmitter`, subscriptions created with
a stale emitter instance from a previous JS session do not receive events from the new session.

### Fix Applied
**File**: `node_modules/react-native-tcp-socket/src/Globals.js`

Changed to a lazy proxy object that creates a fresh `NativeEventEmitter` with the actual
`TcpSockets` module on first use, and is re-created on each hot reload:

```js
// AFTER — lazy proxy, fresh emitter per JS session
let _eventEmitter = null;
const nativeEventEmitter = {
  addListener(eventType, listener, context) {
    if (!_eventEmitter) {
      _eventEmitter = new NativeEventEmitter(getTcpSockets());
    }
    return _eventEmitter.addListener(eventType, listener, context);
  },
  removeAllListeners(eventType) {
    _eventEmitter?.removeAllListeners(eventType);
  },
};
```

---

## Bug 4 — TCP Connection Validation: No Retry (Root Cause of "Connection Failed")

### Severity: HIGH — terminal fails to connect even when reachable

### Symptom
```
LOG  [TerminalDiscovery] MANUAL CONNECTION
LOG  [TerminalDiscovery] Target: 192.168.1.12:1180
// ... long pause ...
LOG  Terminal unreachable at 192.168.1.12:1180
// Alert: "Failed to connect to terminal"
```

Despite the terminal being powered on and `nc -z 192.168.1.12 1180` returning exit 0.

### Root Cause
`TerminalDiscoveryService.addManualTerminal()` called:
```typescript
// BEFORE
const terminal = await this.networkScanner.addManualTerminal(ip, port);
```

`NetworkScanner.addManualTerminal()` internally called:
```typescript
// NetworkScanner — single-attempt, no retry
const testResult = await this.tcpTester.testConnection(ip, port, timeout);
// if fails → return null
```

`SimpleTCPTester.testConnection()` tries 3 connection methods in sequence. If ALL 3 fail
(e.g. because the terminal is busy or the first packet is dropped), it returns failure
immediately. **There is no retry**.

The reference codebase used `NetworkScanner.testManualIP()` → `SimpleTCPTester.validateTerminal(ip, port, 2)`:
```typescript
// Reference — 2 retries × 3 methods = 6 total attempts
validateTerminal(host: string, port: number, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = this.testConnection(host, port, timeout);
    if (result.success) return result;
    await sleep(500); // between retry rounds
  }
}
```

With 6 attempts vs 3, the connection succeeds on a noisy WiFi network.

### Fix Applied

**File**: `src/services/trx/pos/NetworkScanner.ts`

Added `testManualIP()` method that uses the retry-based validation path:

```typescript
async testManualIP(ip: string, port: number = this.defaultPort): Promise<TerminalDevice | null> {
  if (!this.isValidIPAddress(ip)) return null;

  // 2 retries × 3 methods = 6 total attempts
  const result = await this.tcpTester.validateTerminal(ip, port, 2);

  if (result.success) {
    return { ip, port, isOnline: true, responseTime: result.responseTimeMs };
  }
  return null;
}
```

**File**: `src/services/trx/pos/TerminalDiscoveryService.ts`

Updated both `addManualTerminal()` and `selectTerminal()` to use retry path:

```typescript
// BEFORE — single attempt
const terminal = await this.networkScanner.addManualTerminal(ip, port);

// AFTER — retry-based (6 attempts)
const terminal = await this.networkScanner.testManualIP(ip, port);
```

```typescript
// BEFORE — single attempt in selectTerminal()
const testResult = await this.connectAndSend.testConnection(ip, port, 5000);

// AFTER — retry-based
const testResult = await this.networkScanner.testManualIP(ip, port);
```

### Verification
```
LOG  [NetworkScanner] MANUAL IP TEST (with retries)
LOG  [NetworkScanner] Testing: 192.168.1.12:1180
LOG  [SimpleTCPTester] method1_simpleConnect: 192.168.1.12:1180 → CONNECTED (4647ms)
LOG  [NetworkScanner] SUCCESS — 192.168.1.12:1180 responded in 4647ms
LOG  [TerminalDiscovery] MANUAL CONNECTION SUCCESS
```

---

## Bug 5 — Terminal Persistence: AsyncStorage vs SQLite

### Severity: MEDIUM — terminal state lost after app restart on some devices

### Symptom
After force-stop + restart, the TRX terminal screen shows no connected terminal.
The user must re-enter the IP and re-connect every session.

### Root Cause
`TerminalDiscoveryService.restoreFromStorage()` read from `TerminalStorage` which used
`AsyncStorage`:
```typescript
// BEFORE — AsyncStorage (unreliable)
import { TerminalStorage } from '../storage/TerminalStorage';
const stored = await TerminalStorage.getSelectedTerminal(); // AsyncStorage key
```

AsyncStorage on Android is:
- Stored in a plain key-value SQLite DB (`AsyncStorage-default`)
- Known to have data-loss issues on emulator when app data is cleared
- Not transactional — partial writes possible on crash

The app already had `TerminalStorageService` using the main SQLite database — but it was
only used for connection history, not for the selected terminal.

### Fix Applied

**File**: `src/services/trx/storage/TerminalStorageService.ts`

Added `saveSelectedTerminal()`, `getSelectedTerminal()`, `clearSelectedTerminal()` methods
that write to the `terminal_settings` table in the main SQLite database.

**File**: `src/services/database/DatabaseService.ts`

Added `terminal_settings` table to schema:
```sql
CREATE TABLE IF NOT EXISTS terminal_settings (
  id INTEGER PRIMARY KEY,
  ip TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 1180,
  is_selected INTEGER NOT NULL DEFAULT 1,
  connected_at TEXT,
  last_ping_success TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**File**: `src/services/trx/pos/TerminalDiscoveryService.ts`

Replaced `TerminalStorage` (AsyncStorage) references with `TerminalStorageService` (SQLite):
```typescript
// BEFORE — AsyncStorage
await TerminalStorage.saveSelectedTerminal({ ip, port });

// AFTER — SQLite
await this.terminalStorageService.saveSelectedTerminal({
  ip, port, isSelected: true,
  connectedAt: new Date().toISOString(),
  lastPingSuccess: new Date().toISOString(),
});
```

Also added **eager restore on singleton creation**:
```typescript
private constructor() {
  // Restore from SQLite immediately so isTerminalOnline() is accurate after reload
  this.storageRestorePromise = this.restoreFromStorage();
}
```

### Verification
```
# Force-stop + restart log:
LOG  [TRX][INFO][restoreFromStorage] Terminal restored from SQLite on init: 192.168.1.12:1180
LOG  [TerminalDiscovery] SELECTING TERMINAL
LOG  [TRX][INFO][testConnection] Connection test passed (method 1)
LOG  [TerminalDiscovery] TERMINAL CONNECTED SUCCESSFULLY
```

```
# SQLite direct check:
adb shell su 0 sqlite3 \
  /data/data/com.ajinkya123.POSReactNativeApp/files/SQLite/pos_app.db \
  "SELECT ip, port, connected_at FROM terminal_settings;"
# → 192.168.1.12|1180|2026-02-28T...
```

---

## Bug 6 — NativeTcpSocket Registry Checks: Permanent False Negative (THE RECURRING BREAK)

### Severity: CRITICAL — TCP connections permanently broken, survived 5 attempted fixes

### History

This bug was the root cause of **6 consecutive "connection failed" bugs** across 5 fix attempts.
Each attempt tried increasingly complex solutions (lazy retry init, global singletons, delayed
checks) but all failed because they still included `TurboModuleRegistry.get('TcpSockets')` or
`NativeModules.TcpSockets` verification checks.

### Symptom
```
[TRX][ERROR][isTcpSocketAvailable] react-native-tcp-socket module not available Module not found
// Alert: "Connection Failed — Failed to connect to terminal at 192.168.1.12:1180"
```

This error appeared **every time** — fresh start, after hot reload, after emulator restart.
The terminal was physically reachable (`nc -z 192.168.1.12 1180` returns exit 0).

### Root Cause

`NativeTcpSocket.ts` contained native module registry verification checks:

```typescript
// BROKEN — all 5 failed fix attempts included some variant of this
private initializeNativeModule(): void {
  // Attempt 1: Direct check
  const nativeModule = NativeModules.TcpSockets;

  // Attempt 2: TurboModule fallback
  const nativeModule = TurboModuleRegistry.get('TcpSockets') || NativeModules.TcpSockets;

  // Attempt 3: Lazy retry on each isAvailable() call
  private tryInitialize(): boolean {
    const viaInterop = TurboModuleRegistry.get && TurboModuleRegistry.get('TcpSockets');
    const viaLegacy = NativeModules.TcpSockets;
    if (!viaInterop && !viaLegacy) return false; // ← ALWAYS returns false
  }

  // Attempt 4: Expo Go detection + retry
  // Same TurboModuleRegistry check → same false negative

  // Attempt 5: Global singleton caching
  // Cached the BROKEN instance globally → new code never ran after hot reload
}
```

**Why ALL checks return null:**

The `react-native-tcp-socket@6.4.1.patch` replaces ALL `NativeModules.TcpSockets` references
in the library source with `getTcpSockets()` — a lazy getter function:

```js
// In patched Globals.js:
export const getTcpSockets = () =>
  (TurboModuleRegistry.get && TurboModuleRegistry.get('TcpSockets')) ||
  NativeModules.TcpSockets;
```

This lazy getter is called **at socket use-time** (inside `Socket.js`, `Server.js`, etc.),
NOT at module parse time. By use-time, TurboModule registry IS populated and the getter works.

But our `NativeTcpSocket.ts` was checking the registry **directly** (not through the patched
library code). At the time our check runs (constructor or `tryInitialize()`), the registry
is still empty because:

1. New Architecture uses TurboModules with lazy initialization
2. `TurboModuleRegistry.get('TcpSockets')` only returns non-null AFTER the native module
   has been actually requested by the patched library code (which uses lazy getters)
3. `NativeModules.TcpSockets` is always null in New Architecture (bridgeless mode)

**The check was a permanent false negative — it could NEVER return true.**

### What the Reference Implementation Does

The working reference at `Food-MobileApp-Frontend/paymentprocessor/services/pos/NativeTcpSocket.ts`
has **ZERO registry checks**:

```typescript
// REFERENCE — working code
import TcpSocket from 'react-native-tcp-socket';

class NativeTcpSocket {
  private tcpSocket: TcpSocketLib | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeNativeModule();
  }

  private initializeNativeModule(): void {
    try {
      if (!TcpSocket) {
        throw new Error('react-native-tcp-socket module not available');
      }
      // Trust TcpSocket directly — no registry verification
      this.tcpSocket = TcpSocket as unknown as TcpSocketLib;
      this.isInitialized = true;
    } catch (error) {
      this.tcpSocket = null;
      this.isInitialized = false;
    }
  }
}

// Simple module export — NO global singleton
export const nativeTcpSocket = new NativeTcpSocket();
```

It trusts the `import TcpSocket from 'react-native-tcp-socket'` — the imported module object
is non-null if the package is installed. The actual native binding resolution happens lazily
inside the patched library when `createConnection()` is called.

Expo Go detection is handled in `TcpSocketWrapper.ts` (NOT in `NativeTcpSocket.ts`):
```typescript
// TcpSocketWrapper.ts — Expo Go detection via expo-constants
function isDevelopmentEnvironment(): boolean {
  try {
    const Constants = require('expo-constants');
    const isExpoGo = Constants.default?.appOwnership === 'expo';
    if (isExpoGo) return false; // TCP not available in Expo Go
    return true;
  } catch {
    return true; // Not Expo → assume native modules available
  }
}
```

### Fix Applied

**File**: `src/services/trx/pos/NativeTcpSocket.ts` — **Complete rewrite** to match reference

Key changes:
1. **Removed ALL `TurboModuleRegistry` and `NativeModules` imports and checks**
2. **Removed global singleton pattern** (`global.__nativeTcpSocketInstance`) — was caching
   the broken instance across hot reloads, preventing new fixed code from running
3. **Trust `TcpSocket` import directly** — if the package is installed, the import is non-null
4. **Simple `export const nativeTcpSocket = new NativeTcpSocket()`** — matches reference exactly

```typescript
// AFTER — matches reference implementation exactly
import TcpSocket from 'react-native-tcp-socket';
import { LoggerFactory } from '../logging/LoggingService';

class NativeTcpSocket {
  private tcpSocket: TcpSocketLib | null = null;
  private logger = LoggerFactory.createLogger('NativeTcpSocket');
  private isInitialized = false;

  constructor() {
    this.initializeNativeModule();
  }

  private initializeNativeModule(): void {
    try {
      if (!TcpSocket) {
        throw new Error('react-native-tcp-socket module not available');
      }
      // Trust TcpSocket directly — no registry verification.
      // The patched module resolves native bindings lazily at actual use time.
      this.tcpSocket = TcpSocket as unknown as TcpSocketLib;
      this.isInitialized = true;
      this.logger.info(
        'Native TCP socket module loaded successfully',
        'initializeNativeModule'
      );
    } catch (error) {
      this.logger.warn(
        'Failed to load react-native-tcp-socket module',
        'initializeNativeModule'
      );
      this.tcpSocket = null;
      this.isInitialized = false;
    }
  }

  public isAvailable(): boolean {
    return this.isInitialized && this.tcpSocket !== null;
  }
  // ... rest of methods unchanged
}

// Export singleton instance — NO global pattern, matches reference implementation
export const nativeTcpSocket = new NativeTcpSocket();
```

**File**: `src/services/trx/pos/TcpSocketWrapper.ts` — Updated Expo Go detection

Changed `isDevelopmentEnvironment()` to use `expo-constants` (matching reference):
```typescript
function isDevelopmentEnvironment(): boolean {
  try {
    const Constants = require('expo-constants');
    const isExpoGo = Constants.default?.appOwnership === 'expo';
    if (isExpoGo) {
      logger.warn('Expo Go detected - native TCP sockets not available',
        'isDevelopmentEnvironment');
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
```

**File**: `src/services/trx/pos/TerminalDiscoveryService.ts` — Global singleton + payment retry

Added `global.__terminalDiscoveryServiceInstance` to survive hot reload module re-evaluation
(TerminalDiscoveryService DOES need global singleton because it holds in-memory terminal state):
```typescript
const GLOBAL_DISCOVERY_KEY = '__terminalDiscoveryServiceInstance';

public static getInstance(): TerminalDiscoveryService {
  const globalInstance = (global as Record<string, unknown>)[GLOBAL_DISCOVERY_KEY];
  if (globalInstance) return globalInstance as TerminalDiscoveryService;
  if (!TerminalDiscoveryService.instance) {
    TerminalDiscoveryService.instance = new TerminalDiscoveryService();
  }
  (global as Record<string, unknown>)[GLOBAL_DISCOVERY_KEY] =
    TerminalDiscoveryService.instance;
  return TerminalDiscoveryService.instance;
}
```

Added payment retry logic (3 attempts with 500ms delay between failures):
```typescript
async processPayment(amount: number, tax: number): Promise<unknown> {
  // ... existing setup ...
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await this.connectAndSend.connectAndSend({...}, messageData);
      if (response.success) { /* ... return result ... */ }
      if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      if (attempt < maxAttempts) await new Promise(r => setTimeout(r, 500));
    }
  }
  throw lastError || new Error('Payment failed after 3 attempts');
}
```

**File**: `src/services/trx/pos/SimpleTCPTester.ts` — localAddress binding

Added device IP binding (`localAddress`) and `reuseAddress: true` to all socket options
for consistency with `ConnectAndSendService`:
```typescript
import * as Network from 'expo-network';

private async getDeviceIP(): Promise<string | undefined> {
  try { return await Network.getIpAddressAsync(); } catch { return undefined; }
}

async testConnection(host, port, timeoutMs) {
  const localAddress = await this.getDeviceIP();
  const methods = [
    () => this.method1_simpleConnect(host, port, timeoutMs, localAddress),
    () => this.method2_quickConnect(host, port, timeoutMs, localAddress),
    () => this.method3_immediateClose(host, port, timeoutMs, localAddress),
  ];
  // ...
}
```

### Why Previous Fixes Failed — Post-Mortem

| Attempt | Approach | Why It Failed |
|---------|----------|---------------|
| 1 | Add `TurboModuleRegistry.get` fallback | Still null — lazy getter patch bypasses registry |
| 2 | Lazy retry `tryInitialize()` on every `isAvailable()` | Same check, same false negative on every retry |
| 3 | Expo Go detection + delayed init | Correctly detected dev build, but still did registry check |
| 4 | Remove registry check, add global singleton | Global singleton cached OLD broken instance from before fix |
| 5 | Clear global on init failure | Race condition — old module evaluated before new code |
| **6** | **Match reference: zero checks, trust import** | **WORKS — native binding resolves lazily at use time** |

### Key Lesson

> **NEVER verify `TurboModuleRegistry.get('TcpSockets')` or `NativeModules.TcpSockets` when
> using the patched `react-native-tcp-socket`.** The patch replaces all native module access
> with lazy getters. Direct registry checks bypass the patch and always return null.
>
> Trust the `import TcpSocket from 'react-native-tcp-socket'` — the imported object is the
> patched wrapper that resolves native bindings lazily at actual socket creation time.

### Verification

**All 5 test scenarios passed:**

| Test | Result | Details |
|------|--------|---------|
| Fresh TCP connection | ✅ PASSED | "Terminal 192.168.1.12:1180 added successfully" |
| Hot reload x2 | ✅ PASSED | Terminal shows "Connected to 192.168.1.12" after each reload |
| Full app restart (force-stop) | ✅ PASSED | Terminal restored from SQLite, shows connected |
| TCP reconnection after restart | ✅ PASSED | "Terminal 192.168.1.12:1180 added successfully" |
| **Full emulator restart** | ✅ PASSED | Killed emulator, restarted fresh (`-no-snapshot-load`), terminal restored from SQLite |

---

## Files Changed Summary

| File | Bug Fixed | Change |
|------|-----------|--------|
| `node_modules/react-native-tcp-socket/src/Globals.js` | 1, 2, 3 | Lazy getter + global counter + lazy emitter |
| `patches/react-native-tcp-socket@6.4.1.patch` | 1, 2, 3 | Patch file updated to reflect Globals.js changes |
| `src/services/trx/pos/NativeTcpSocket.ts` | **6** | **Complete rewrite — removed all registry checks, match reference** |
| `src/services/trx/pos/TcpSocketWrapper.ts` | **6** | Updated Expo Go detection via expo-constants |
| `src/services/trx/pos/NetworkScanner.ts` | 4 | Added `testManualIP()` with retry validation |
| `src/services/trx/pos/TerminalDiscoveryService.ts` | 4, 5, **6** | Use `testManualIP()`; SQLite storage; global singleton; payment retry |
| `src/services/trx/pos/SimpleTCPTester.ts` | **6** | Added `localAddress` binding + `reuseAddress` to socket options |
| `src/services/database/DatabaseService.ts` | 5 | Added `terminal_settings` table to schema |
| `src/services/trx/storage/TerminalStorageService.ts` | 5 | Added selected terminal CRUD methods |
| `app.json` | n/a | Added `"scheme": "posapp"` for dev client deep linking |

---

## Test Results After All Fixes (Including Bug 6)

| Scenario | Result | Time |
|----------|--------|------|
| Fresh connect (192.168.1.12:1180) | ✅ CONNECTED | method 1 |
| Hot reload x2 (Metro Fast Refresh) | ✅ PERSISTED — terminal stays connected | instant |
| Force-stop + restart | ✅ RESTORED from SQLite | auto |
| TCP reconnection after restart | ✅ CONNECTED | method 1 |
| **Full emulator restart** | ✅ RESTORED from SQLite | auto |
| Payment: Visa ****3619, $5.44 | ✅ APPROVED (TRX377) | 10.5s end-to-end |

---

## How to Regenerate TCP Patch

If `react-native-tcp-socket` is upgraded or `node_modules` is deleted:

```bash
# 1. Install fresh copy
bun install

# 2. Apply patch
bun patch-package

# If patch fails (version mismatch):
# 3. Manually apply changes to node_modules/react-native-tcp-socket/src/Globals.js
#    (see changes documented in Bug 1, 2, 3 above)

# 4. Regenerate patch
diff -u \
  ~/.bun/install/cache/react-native-tcp-socket@6.4.1@@@1/src/Globals.js \
  node_modules/react-native-tcp-socket/src/Globals.js \
  > patches/react-native-tcp-socket@6.4.1.patch
```
