# TRX Connection & Payment Fixes

**Date**: 2026-02-27
**Branch**: `feature/ordermanagement-03`
**Status**: COMPLETE - End-to-end payment working

---

## Problem Statement

The TRX payment terminal integration was copied from an **old branch** of the reference app (`Food-MobileApp-Frontend/paymentprocessor`). The new branch had critical fixes that were missing, causing:

1. Terminal connections failing on multi-interface Android devices
2. Terminal state lost after app reload (no persistence)
3. Card Payment button using mock data instead of real TRX terminal
4. ExpoBlurView crash killing the payment progress modal

## Root Cause

`ConnectAndSendService.createTcpClient()` did NOT bind to the device's local IP address (`localAddress`), causing TCP sockets to route incorrectly on multi-interface Android devices.

---

## Fixes Applied

### Fix 1: TCP Socket `localAddress` Binding (Critical)

**Files Modified:**
- `src/services/trx/pos/TcpSocketWrapper.ts` — Added `localAddress`, `reuseAddress`, `interface`, `localPort` to `SocketOptions`
- `src/services/trx/pos/ConnectAndSendService.ts` — Added `getDeviceIPAddress()`, passes `localAddress` + `reuseAddress` to `createTcpClient()`

**What it does:** Before connecting to the terminal, the app now detects the device's WiFi IP address via `expo-network` and binds the TCP socket to it. This ensures the socket routes through the correct network interface.

```typescript
// ConnectAndSendService.ts
private async getDeviceIPAddress(): Promise<string | undefined> {
  const deviceIP = await Network.getIpAddressAsync();
  return deviceIP;
}

private async createTcpClient(config: ConnectionConfig) {
  const deviceIP = await this.getDeviceIPAddress();
  const options: SocketOptions = {
    host: config.host,
    port: config.port,
    timeout: config.sendTimeout,
    localAddress: deviceIP,   // CRITICAL: Bind to device's IP
    reuseAddress: true,       // Allow rapid reconnections
  };
}
```

### Fix 2: Terminal Persistence (`TerminalStorage`)

**Files Created:**
- `src/services/trx/pos/TerminalStorage.ts` — AsyncStorage singleton

**Files Modified:**
- `src/services/trx/pos/TerminalDiscoveryService.ts` — Wired TerminalStorage for persistence + eager restore in constructor
- `src/hooks/trx/useTRXTerminalConnection.ts` — Restore from storage on mount instead of auto-scanning

**What it does:** When a terminal is connected, its IP/port is saved to AsyncStorage. On app reload, the TerminalDiscoveryService singleton restores from storage in its constructor, so `isTerminalOnline()` returns `true` immediately.

**Storage keys:**
- `@pos_selected_terminal` — Currently selected terminal (ip, port, connectedAt)
- `@pos_discovered_terminals` — Cached scan results
- `@pos_network_info` — Device IP/gateway for network change detection

### Fix 3: `SimpleTCPTester` (Connection Validation)

**Files Created:**
- `src/services/trx/pos/SimpleTCPTester.ts` — Pure TCP test (like `nc -z`)

**Files Modified:**
- `src/services/trx/pos/NetworkScanner.ts` — Uses SimpleTCPTester instead of inline tests

**What it does:** Separated TCP connection testing from `ConnectAndSendService`. Uses 3 fallback methods with decreasing timeouts. Used during terminal scanning and validation.

### Fix 4: Hook Behavior — Restore Instead of Auto-Scan

**Files Modified:**
- `src/hooks/trx/useTRXTerminalConnection.ts` — Complete rewrite

**Before:** On mount, the hook called `scanForTerminals()` which scanned the entire /24 subnet. This was slow and overwrote state.

**After:** On mount, the hook restores from AsyncStorage. `addManualTerminal()` updates local state directly (no re-scan). Network change detection clears state when WiFi changes.

### Fix 5: Card Payment Routes to TRX Terminal

**Files Modified:**
- `src/screens/payment/PaymentProcessingScreen.tsx` — Card Payment always opens TRX modal

**Before:** Card Payment checked `isTerminalOnline()` and fell through to mock card flow when false.

**After:** Card Payment always opens `TRXPaymentModal`. The modal handles reconnect/not-connected states itself. No mock card flow is ever used.

### Fix 6: ExpoBlurView Crash Fix

**Files Modified:**
- `src/components/business/payment/trx/TRXPaymentProgressModal.tsx` — Removed `expo-blur` dependency

**Before:** `BlurView` from `expo-blur` crashed with `Can't find ViewManager 'ViewManagerAdapter_ExpoBlurView'` in the dev build.

**After:** Replaced with a plain `View` with `backgroundColor: 'rgba(0, 0, 0, 0.6)'`. Same visual effect, no native dependency.

### Fix 7: VP3350PaymentModal Rename

**Files Modified:**
- `src/components/business/payment/VP3350PaymentModal.tsx` — Now re-exports `TRXPaymentModal` for backward compatibility
- `src/components/business/payment/TRXPaymentModal.tsx` — The actual component with reconnect logic
- `src/components/business/payment/index.ts` — Added `TRXPaymentModal` export

### Fix 8: `displayAmount` Sync in Payment Processor

**Files Modified:**
- `src/hooks/trx/useTRXPaymentProcessor.ts`

**Before:** `displayAmount` was `'0.00'` when TRX modal opened because `clearTransaction()` (called on modal close) reset it, and `useState` doesn't reinitialize on re-open.

**After:** Added `useEffect` to sync `displayAmount` with `initialAmount` when it changes. `handleClear` resets to `initialAmount` instead of `'0.00'`.

---

## Files Summary

### New Files (3)
| File | Description |
|------|-------------|
| `src/services/trx/pos/TerminalStorage.ts` | AsyncStorage-based terminal persistence |
| `src/services/trx/pos/SimpleTCPTester.ts` | Pure TCP connection tester with 3 fallback methods |
| `src/components/business/payment/TRXPaymentModal.tsx` | TRX payment modal with reconnect logic |

### Modified Files (9)
| File | Changes |
|------|---------|
| `src/services/trx/pos/TcpSocketWrapper.ts` | Added `localAddress`, `reuseAddress` to SocketOptions |
| `src/services/trx/pos/ConnectAndSendService.ts` | Added `getDeviceIPAddress()`, localAddress binding |
| `src/services/trx/pos/TerminalDiscoveryService.ts` | TerminalStorage wiring, eager restore, storage fallback in processPayment |
| `src/services/trx/pos/NetworkScanner.ts` | Uses SimpleTCPTester |
| `src/hooks/trx/useTRXTerminalConnection.ts` | Restore from storage, no auto-scan, network change detection |
| `src/hooks/trx/useTRXPaymentProcessor.ts` | displayAmount sync with initialAmount |
| `src/components/business/payment/VP3350PaymentModal.tsx` | Re-export shim for backward compat |
| `src/components/business/payment/trx/TRXPaymentProgressModal.tsx` | Removed expo-blur, use rgba overlay |
| `src/screens/payment/PaymentProcessingScreen.tsx` | Card Payment → always TRX modal |

---

## Verification Results

### Terminal Connection
- Device IP detected: `192.168.1.9`
- Terminal connected at: `192.168.1.12:1180`
- SimpleTCPTester method 1 passed in ~99ms
- Terminal persisted to AsyncStorage
- Terminal restored after app reload

### Payment Transaction (APPROVED)
- MML SALE message built: `SALE|ID:1772133191095|5.44|<j1><Z2>0.44</Z2></j1>||`
- TCP connection with localAddress binding to 192.168.1.12:1180
- Response received in 10,581ms
- **Status: 00 — Approved**
- **Approval Code: TRX377**
- **Card: Visa ****3619**
- **GUID: EQQ30E28FLV2REW**
- Transaction saved to SQLite database
- Payment confirmation screen shown

### Card Payment Routing
- Tapping "Card Payment" opens TRX Terminal Payment modal
- No mock/dummy card flow used
- Terminal status shown as "Connected to 192.168.1.12" (green dot)
