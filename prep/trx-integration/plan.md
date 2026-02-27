# TRX Payment Device Integration — Master Plan

## Overview
Integrates the TRX payment terminal into the POS app using the MML (Merchant Mobile Link) TCP/IP protocol.

**Source app**: `~/Documents/Github/POS/Food-MobileApp-Frontend/paymentprocessor`
**Target app**: `~/Documents/Github/POS/POS-App`
**Status**: ✅ COMPLETE — End-to-end payment approved (Visa ****3619, TRX377)

---

## Architecture

```
PaymentProcessingScreen
  └── Card Payment tap → opens TRXPaymentModal (always, no mock fallback)

TRXPaymentModal (UI)
  ├── useTRXTerminalConnection      → TerminalDiscoveryService (singleton)
  │     ├── TerminalStorage         → AsyncStorage (persist terminal IP/port)
  │     ├── NetworkScanner          → expo-network + SimpleTCPTester
  │     └── ConnectAndSendService   → react-native-tcp-socket (localAddress binding)
  └── useTRXPaymentProcessor        → AmountCalculatorService + PaymentStateManager
        ├── TransactionStorageService → SQLite (trx_payment_processor.db)
        ├── ConfigurationService      → AsyncStorage (@trx_ keys)
        └── TRXSettingsEventEmitter   → Observer (live settings reload)

TRXPaymentProgressModal (overlay)
  └── Shows: BUILDING → CONNECTING → SENDING → PROCESSING → SUCCESS/FAILED
  └── Uses plain View with rgba(0,0,0,0.6) overlay (NOT expo-blur)
```

## Payment Flow (End-to-End)

```
1. User taps "Card Payment" on PaymentProcessingScreen
2. TRXPaymentModal opens
3. If not connected: auto-reconnect from AsyncStorage
4. User taps "Charge $X.XX"
5. useTRXPaymentProcessor.handleProcessPayment() called
6. TerminalDiscoveryService.processPayment(amount, tax):
   a. Reads terminal from storage if in-memory state empty
   b. Builds MML SALE message (STX/ETX/LRC)
   c. ConnectAndSendService:
      - Gets device IP via expo-network
      - Creates TCP socket with localAddress binding
      - Listens BEFORE sending (critical)
      - Sends MML message
      - Waits for response (360s timeout)
      - Closes connection
   d. Parses MML response (approvalCode, cardBrand, lastFour)
7. TRXPaymentProgressModal shows result (SUCCESS/FAILED)
8. On SUCCESS → auto-dismiss → onPayment() → PaymentConfirmation screen
```

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Add npm dependencies | ✅ Complete |
| 2 | Copy services/types/hooks/components | ✅ Complete |
| 3 | Wire TRX into payment flow | ✅ Complete |
| 4 | Settings screen + TRXTerminalScreen | ✅ Complete |
| 5 | Gratuity integration | ✅ Complete |
| 6 | Documentation | ✅ Complete |
| 7 | Connection & Payment Fixes | ✅ Complete |
| 8 | End-to-end payment test | ✅ Complete |

## Key Files

| File | Purpose |
|------|---------|
| `src/services/trx/pos/ConnectAndSendService.ts` | TCP connect-and-send with localAddress binding |
| `src/services/trx/pos/MMLMessageBuilder.ts` | STX/ETX/LRC message building |
| `src/services/trx/pos/MMLResponseParser.ts` | XML response parsing |
| `src/services/trx/pos/TerminalDiscoveryService.ts` | Terminal scan + payment + eager restore |
| `src/services/trx/pos/TerminalStorage.ts` | AsyncStorage persistence for terminal state |
| `src/services/trx/pos/SimpleTCPTester.ts` | Pure TCP connection tester (3 fallback methods) |
| `src/hooks/trx/useTRXTerminalConnection.ts` | Terminal connection hook (restore from storage) |
| `src/hooks/trx/useTRXPaymentProcessor.ts` | Payment processing hook (displayAmount sync) |
| `src/hooks/trx/useTRXSettings.ts` | Settings management hook |
| `src/components/business/payment/TRXPaymentModal.tsx` | Main payment modal with reconnect logic |
| `src/components/business/payment/trx/TRXPaymentProgressModal.tsx` | Payment progress overlay (no expo-blur) |
| `src/screens/settings/components/TRXSettingsPanel.tsx` | TRX settings UI |
| `src/screens/settings/TRXTerminalScreen.tsx` | Terminal management |
| `src/screens/payment/PaymentProcessingScreen.tsx` | Card → TRX routing |
