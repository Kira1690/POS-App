# TRX Integration — Settings Specification

## Overview

TRX settings live under **Settings → TRX Terminal** (`SettingsCategory = 'trx_payment'`).
They are managed by `useTRXSettings` hook → `TRXSettingsService` → AsyncStorage (`@trx_` keys).

---

## Settings Sections

### 1. Store & Tax

| Field | Type | Default | Storage Key |
|-------|------|---------|-------------|
| Store Name | string | `''` | `@trx_store_settings` |
| Tax Rate % | number (0–15) | `8.875` | `@trx_store_settings` |

**Used in:**
- `TRXAmountDisplay` — shows tax line: `Tax (8.9%): $X.XX`
- `AmountCalculatorService.calculateTax(subtotal, taxRate)`
- `MMLMessageBuilder.buildSaleMessage()` — `<LocalTaxAmount>` in Level2Data

---

### 2. CC Surcharge

| Field | Type | Default | Storage Key |
|-------|------|---------|-------------|
| Enable CC Surcharge | boolean | `false` | `@trx_cc_surcharge_settings` |
| CC Processing Fee % | number (0–10) | `3.5` | `@trx_cc_surcharge_settings` |
| Show Itemized Breakdown | boolean | `true` | `@trx_cc_surcharge_settings` |

**Used in:**
- `AmountCalculatorService.calculateSurcharge(subtotal + tax, rate)`
- `TRXAmountDisplay` — shows surcharge line when enabled
- `VP3350PaymentModal` — `surchargeAmount` included in `grandTotal` sent to terminal
- `MMLMessageBuilder` — surcharge folded into total amount (not separate field)

**Compliance note:** CC surcharge regulations vary by state. The POS does not enforce limits — operators are responsible for compliance.

---

### 3. Gratuity (New — not in source paymentprocessor)

| Field | Type | Default | Storage Key |
|-------|------|---------|-------------|
| Enable Tip/Gratuity | boolean | `false` | `@trx_gratuity_settings` |
| Default Tip Rates | number[] | `[15, 18, 20, 25]` | `@trx_gratuity_settings` |
| Allow Custom Tip | boolean | `false` | `@trx_gratuity_settings` |

**Used in:**
- `VP3350PaymentModal` — shows tip chip selector row when `gratuityEnabled`
- Tip amount added to terminal charge: `terminalProcessPayment(subtotal + tax + surcharge + tip, tax)`
- `MMLMessageBuilder.buildSaleMessage()` — tip passed as `<TipAmount>` in Level2Data XML

**Tip selector behavior:**
- Each chip shows `{pct}%` + formatted dollar amount (e.g., `18% / $3.24`)
- Tapping active chip deselects (sets tip to 0)
- "No Tip" chip always present
- Custom tip input shown when `allowCustomTip = true` (text field)

**Level2Data with tip:**
```xml
<Level2Data>
  <LocalTaxAmount>250</LocalTaxAmount>
  <TipAmount>300</TipAmount>
</Level2Data>
```
Amounts are in **cents** (integer).

---

### 4. Terminal Management

| Field | Type | Default | Storage Key |
|-------|------|---------|-------------|
| Preferred Port | number | `1180` | `@trx_terminal_settings` |

**UI elements:**
- "Current Terminal" — shows `{IP}:{port}` of preferred terminal or "None selected"
- "Manage Terminals" button — opens `TRXTerminalScreen` modal (scan + manual IP entry)
- "Reset TRX to Defaults" button — restores all settings to defaults

**Auto-scan behavior:**
- `useTRXTerminalConnection` auto-scans on mount
- Scans subnet from device's WiFi IP (e.g., `192.168.1.x`)
- Attempts port 1180 on each IP in /24 range (parallel probes with 2s timeout)
- First responding terminal auto-connects; sets as preferred terminal

---

## StoreSettings Type

```typescript
// src/types/trx/Settings.ts
export interface StoreSettings {
  storeName: string;
  taxRate: number;
  ccSurchargeEnabled: boolean;
  ccProcessingFee: number;
  showItemizedBreakdown: boolean;
  gratuityEnabled: boolean;
  defaultTipRates: number[];
  allowCustomTip: boolean;
  preferredPort: number;
}
```

---

## Settings Hook API

```typescript
const {
  settings,           // StoreSettings — current values
  isLoading,          // boolean — initial load
  updateSettings,     // (partial: Partial<StoreSettings>) => Promise<void>
  resetToDefaults,    // () => Promise<void>
} = useTRXSettings();
```

---

## Live Reload

`TRXSettingsEventEmitter` broadcasts `'settingsUpdated'` event whenever `updateSettings()` is called.
`useTRXPaymentProcessor` subscribes to this event and reloads `taxRate` and `ccSurchargeRate` without requiring app restart.

```typescript
// In useTRXPaymentProcessor:
useEffect(() => {
  const subscription = TRXSettingsEventEmitter.addListener('settingsUpdated', loadSettings);
  return () => subscription.remove();
}, []);
```
