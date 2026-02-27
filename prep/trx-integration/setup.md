# TRX Integration — Setup & Dependency Install

## Dependencies Added

### `package.json` additions
```json
"react-native-tcp-socket": "^6.3.0",
"buffer": "^6.0.3",
"expo-network": "~8.0.7"
```

> `expo-network` is used for subnet detection in `NetworkScanner.ts`.
> `react-native-tcp-socket` provides native TCP for `NativeTcpSocket.ts`.
> `buffer` polyfills Node.js `Buffer` for Uint8Array encoding in `MMLMessageBuilder.ts`.

---

## Install Steps

### 1. Install dependencies
```bash
bun install
```

### 2. Prebuild (required for react-native-tcp-socket native module)
```bash
npx expo prebuild --clean
```

> This regenerates `android/` and `ios/` folders with the native TCP socket module linked.
> Must be run after adding `react-native-tcp-socket` to package.json.
> Use `--clean` to wipe stale native build artifacts.

### 3. Rebuild the app

**Android:**
```bash
npx expo run:android
```

**iOS:**
```bash
npx expo run:ios
```

> Running via `bun expo start` / Expo Go will NOT work after prebuild —
> the native TCP socket module requires a custom dev client build.

---

## Verify Installation

Check that the native module linked correctly:

```bash
# Android: check for tcp socket in build config
grep -r "react-native-tcp-socket" android/settings.gradle
grep -r "TcpSocket" android/app/src/main/java
```

Expected: `react-native-tcp-socket` appears in gradle settings.

---

## Polyfill Setup

`buffer` polyfill must be imported once at app entry point. Check `App.tsx` or `index.ts`:

```typescript
import { Buffer } from 'buffer';
global.Buffer = Buffer;
```

If this import is missing, `MMLMessageBuilder.ts` will fail when building the STX/ETX/LRC message.

---

## Network Permissions

### Android (`android/app/src/main/AndroidManifest.xml`)
These should already be present; verify:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### iOS (`ios/[AppName]/Info.plist`)
For local network discovery (terminal scanning):
```xml
<key>NSLocalNetworkUsageDescription</key>
<string>Used to discover payment terminals on the local network.</string>
<key>NSBonjourServices</key>
<array>
  <string>_tcp.local.</string>
</array>
```

---

## Terminal Network Requirements

- POS device and VP3350 terminal must be on the **same LAN/WiFi subnet**
- Terminal listens on **port 1180** (default)
- No firewall blocking between device and terminal
- Static IP recommended for terminal (avoids re-scan on every restart)

---

## AsyncStorage Keys Used

All TRX settings use `@trx_` prefix to avoid collision with existing POS AsyncStorage keys:

| Key | Purpose |
|-----|---------|
| `@trx_store_settings` | Store name, tax rate |
| `@trx_cc_surcharge_settings` | CC surcharge enable/rate |
| `@trx_gratuity_settings` | Tip enable/rates |
| `@trx_terminal_settings` | Preferred port |
| `@trx_preferred_terminal` | Last-used terminal IP |
| `@trx_discovered_terminals` | Cached terminal list |

---

## SQLite Database

- Database name: `trx_payment_processor.db`
- Location: app documents directory (managed by `expo-sqlite`)
- Schema defined in: `src/services/trx/storage/database/SchemaSQL.ts`
- Tables: `transactions`, `terminals`, `settings`

Database is auto-initialized on first use by `DatabaseManager.ts`.
No manual migration steps required for fresh install.
