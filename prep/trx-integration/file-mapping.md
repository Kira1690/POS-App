# TRX Integration — Source → Target File Map

## Source App
`~/Documents/Github/POS/Food-MobileApp-Frontend/paymentprocessor`

## Target App
`~/Documents/Github/POS/POS-App`

---

## Services

| Source | Target |
|--------|--------|
| `services/pos/ConnectAndSendService.ts` | `src/services/trx/pos/ConnectAndSendService.ts` |
| `services/pos/TcpSocketWrapper.ts` | `src/services/trx/pos/TcpSocketWrapper.ts` |
| `services/pos/NativeTcpSocket.ts` | `src/services/trx/pos/NativeTcpSocket.ts` |
| `services/pos/NetworkScanner.ts` | `src/services/trx/pos/NetworkScanner.ts` |
| `services/pos/MMLMessageBuilder.ts` | `src/services/trx/pos/MMLMessageBuilder.ts` |
| `services/pos/MMLResponseParser.ts` | `src/services/trx/pos/MMLResponseParser.ts` |
| `services/pos/MMLCodes.ts` | `src/services/trx/pos/MMLCodes.ts` |
| `services/pos/TerminalDiscoveryService.ts` | `src/services/trx/pos/TerminalDiscoveryService.ts` |
| `services/pos/AmountCalculatorService.ts` | `src/services/trx/pos/AmountCalculatorService.ts` |
| `services/pos/PaymentStateManager.ts` | `src/services/trx/pos/PaymentStateManager.ts` |
| `services/SettingsService.ts` | `src/services/trx/TRXSettingsService.ts` |
| `services/TerminalPreferenceService.ts` | `src/services/trx/TRXTerminalPreferenceService.ts` |
| `services/SettingsEventEmitter.ts` | `src/services/trx/TRXSettingsEventEmitter.ts` |
| `services/storage/SQLiteStorageService.ts` | `src/services/trx/storage/SQLiteStorageService.ts` |
| `services/storage/TransactionStorageService.ts` | `src/services/trx/storage/TransactionStorageService.ts` |
| `services/storage/TerminalStorageService.ts` | `src/services/trx/storage/TerminalStorageService.ts` |
| `services/storage/database/DatabaseManager.ts` | `src/services/trx/storage/database/DatabaseManager.ts` |
| `services/storage/database/schemas/SchemaSQL.ts` | `src/services/trx/storage/database/SchemaSQL.ts` |
| `config/posConfig.ts` | `src/services/trx/config/posConfig.ts` |
| `config/StorageKeys.ts` | `src/services/trx/config/StorageKeys.ts` |

---

## Interfaces

| Source | Target |
|--------|--------|
| `interfaces/IPaymentProcessor.ts` | `src/services/trx/interfaces/IPaymentProcessor.ts` |
| `interfaces/IStorageService.ts` | `src/services/trx/interfaces/IStorageService.ts` |
| `interfaces/ITcpSocket.ts` | `src/services/trx/interfaces/ITcpSocket.ts` |
| `interfaces/IConfigurationService.ts` | `src/services/trx/interfaces/IConfigurationService.ts` |

---

## Constants

| Source | Target |
|--------|--------|
| `constants/DesignSystem.ts` | `src/services/trx/constants/DesignSystem.ts` |

---

## Logging

| Source | Target |
|--------|--------|
| `services/logging/LoggingService.ts` | `src/services/trx/logging/LoggingService.ts` |

---

## Configuration Service

| Source | Target |
|--------|--------|
| `services/ConfigurationService.ts` | `src/services/trx/ConfigurationService.ts` |

---

## Types

| Source | Target |
|--------|--------|
| `types/Transaction.ts` | `src/types/trx/Transaction.ts` |
| `types/Terminal.ts` | `src/types/trx/Terminal.ts` |
| `types/Settings.ts` | `src/types/trx/Settings.ts` |

---

## Hooks

| Source | Target | Notes |
|--------|--------|-------|
| `hooks/usePaymentProcessor.ts` | `src/hooks/trx/useTRXPaymentProcessor.ts` | Added `initialAmount?: number` param |
| `hooks/useTerminalConnection.ts` | `src/hooks/trx/useTRXTerminalConnection.ts` | |
| `hooks/useSettings.ts` | `src/hooks/trx/useTRXSettings.ts` | |
| `hooks/useTerminalPreference.ts` | `src/hooks/trx/useTRXTerminalPreference.ts` | |
| `hooks/useTransactions.ts` | `src/hooks/trx/useTRXTransactions.ts` | |

---

## UI Components

| Source | Target | Notes |
|--------|--------|-------|
| `components/payment/PaymentProgressModal.tsx` | `src/components/business/payment/trx/TRXPaymentProgressModal.tsx` | |
| `components/payment/AmountDisplay.tsx` | `src/components/business/payment/trx/TRXAmountDisplay.tsx` | |
| `components/payment/NumberPad.tsx` | `src/components/business/payment/trx/TRXNumberPad.tsx` | Uses `TRXIconSymbol` |
| `components/payment/ManualIPInput.tsx` | `src/components/business/payment/trx/TRXManualIPInput.tsx` | |
| `components/payment/StatusHeader.tsx` | `src/components/business/payment/trx/TRXStatusHeader.tsx` | Uses `TRXIconSymbol` |
| `components/terminal/TerminalListWithPreference.tsx` | `src/components/business/payment/trx/TRXTerminalList.tsx` | |
| *(new — no source)*  | `src/components/business/payment/trx/TRXIconSymbol.tsx` | Replaces source `IconSymbol` |

---

## Screens

| Source | Target | Notes |
|--------|--------|-------|
| `app/(tabs)/terminals.tsx` (partial) | `src/screens/settings/TRXTerminalScreen.tsx` | New screen, adapted from source terminals tab |

---

## Modified Files (POS App)

| File | Change |
|------|--------|
| `package.json` | Added `react-native-tcp-socket`, `buffer`, `expo-network` dependencies |
| `src/types/payment.types.ts` | Added `TRX = 'trx'` to `ProfessionalPaymentMethod` enum |
| `src/types/settings.types.ts` | Added `'trx_payment'` to `SettingsCategory` union |
| `src/components/business/payment/PaymentMethodSelector.tsx` | Added TRX payment option card |
| `src/components/business/payment/VP3350PaymentModal.tsx` | Replaced placeholder with full TRX flow |
| `src/screens/payment/PaymentProcessingScreen.tsx` | Added `TRX` case → `setShowVP3350Modal(true)` |
| `src/screens/settings/SettingsScreen.tsx` | Added TRX sidebar item + `trx_payment` render case |
| `src/screens/settings/components/index.ts` | Added `TRXSettingsPanel` export |

---

## Import Path Rules

All internal imports within copied TRX files use these paths:

| Pattern | Maps to |
|---------|---------|
| `@/services/trx/pos/...` | TRX TCP/protocol services |
| `@/services/trx/storage/...` | TRX SQLite storage |
| `@/services/trx/config/...` | TRX configuration |
| `@/services/trx/constants/...` | DesignSystem etc. |
| `@/services/trx/logging/...` | LoggingService |
| `@/services/trx/interfaces/...` | TRX interfaces |
| `@/services/trx/TRXSettingsService` | Settings service |
| `@/services/trx/TRXSettingsEventEmitter` | Event emitter |
| `@/services/trx/ConfigurationService` | Config factory |
| `@/types/trx/...` | TRX TypeScript types |
| `@/hooks/trx/...` | TRX hooks |
| `@/components/business/payment/trx/...` | TRX UI components |
