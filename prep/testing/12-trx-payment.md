# TRX Payment Terminal Tests

## Feature Overview
TRX/Verifone VP3350 payment terminal integration using MML (Merchant Mobile Link) TCP/IP protocol.

## Live Terminal (Confirmed — PAYMENTS WORKING)
- **IP**: `192.168.1.12`
- **Port**: `1180`
- **Status**: ✅ Payments approved (Visa ****3619, approval code TRX377)
- **Host machine**: `192.168.1.9` (same /24 subnet ✅)
- **First successful payment**: 2026-02-27, $5.44 SALE → 00 Approved in 10.5s

## Direct TCP Test (from host — no app needed)
```bash
# BALANCE inquiry — test terminal connectivity
python3 -c "
import sys, time
tranId = str(int(time.time() * 1000))
msg = f'BALANCE|ID:{tranId}'
content = msg.encode('ascii')
data = content + bytes([0x03])
lrc = 0
for b in data: lrc ^= b
packet = bytes([0x02]) + content + bytes([0x03, lrc])
sys.stdout.buffer.write(packet)
" | nc -w 10 192.168.1.12 1180 | python3 -c "
import sys
data = sys.stdin.buffer.read()
print('Response:', ''.join(chr(b) if 32<=b<=126 else f'[{b:02x}]' for b in data))
"
```

## Protocol Notes
- **STX**: `0x02` — start of every message
- **ETX**: `0x03` — end of message body
- **LRC**: XOR of all bytes after STX up to and including ETX
- **Builder LRC**: XOR of content+ETX (excludes STX) — terminal accepts both
- **Timeout**: 360 seconds (terminal waits for card tap)
- **Connection**: New TCP connection per transaction (no persistent socket)

---

## Unit Tests (Jest)

### MMLMessageBuilder (`src/services/trx/__tests__/MMLMessageBuilder.test.ts`)
| Test | Description | Status |
|------|-------------|--------|
| SALE starts with STX (0x02) | Message framing | ✅ Written |
| SALE ends with ETX then LRC | Message framing | ✅ Written |
| SALE has ≥4 bytes | Minimum length | ✅ Written |
| SALE content starts with "SALE\|" | Command encoding | ✅ Written |
| Transaction ID prefixed with "ID:" | ID encoding | ✅ Written |
| Amount formatted to 2 decimal places | Currency encoding | ✅ Written |
| Integer amount formatted as X.XX | e.g. 100 → "100.00" | ✅ Written |
| clientId included when provided | 532120298 | ✅ Written |
| Level2 tax data encoded in \<Z2\> tag | \<j1\>\<Z2\>3.44\</Z2\>\</j1\> | ✅ Written |
| Customer code in Level2 \<L1\> tag | \<L1\>CUST001\</L1\> | ✅ Written |
| validateMessage passes for valid SALE | No errors | ✅ Written |
| BALANCE starts with STX | Message framing | ✅ Written |
| BALANCE contains "BALANCE\|" | Command | ✅ Written |
| BALANCE contains "ID:" prefix | ID encoding | ✅ Written |
| validateMessage: detects missing STX | Tampered byte | ✅ Written |
| validateMessage: detects missing ETX | Tampered byte | ✅ Written |
| validateMessage: detects LRC mismatch | Bit flip | ✅ Written |
| validateMessage: rejects <4 bytes | Minimum length | ✅ Written |
| generateTransactionId returns string | Non-empty | ✅ Written |
| AccountData firstName/lastName encoded | S8/Y0 tags | ✅ Written |
| IndustryData hotel fields encoded | W2/I3/I5/L6 tags | ✅ Written |

### MMLResponseParser (`src/services/trx/__tests__/MMLResponseParser.test.ts`)
| Test | Description | Status |
|------|-------------|--------|
| success=true for status "00" | Approved | ✅ Written |
| extracts transactionId from field[0] | Parts parsing | ✅ Written |
| extracts status code from field[1] | Parts parsing | ✅ Written |
| extracts approvalCode from \<D3\> tag | Field extraction | ✅ Written |
| extracts cardBrand from \<A3\> tag | Field extraction | ✅ Written |
| extracts lastFour from \<X9\> tag | Field extraction | ✅ Written |
| extracts GUID from \<U8\> tag | Field extraction | ✅ Written |
| responseText="Approved" for "00" | Status mapping | ✅ Written |
| success=false for status "05" | Declined | ✅ Written |
| success=false for status "51" | Insufficient funds | ✅ Written |
| success=false for status "54" | Expired card | ✅ Written |
| X3 = "Account not configured" (LIVE) | **Real terminal response** | ✅ Written |
| X1 = "Invalid message format" | Error mapping | ✅ Written |
| X2 = "Communication error" | Error mapping | ✅ Written |
| X4 = "System error" | Error mapping | ✅ Written |
| X5 = "Invalid amount" | Error mapping | ✅ Written |
| X8 = "Transaction timeout" | Error mapping | ✅ Written |
| Unknown X-code = "Transaction declined" | Fallback | ✅ Written |
| Unknown non-X code = "Unknown status" | Fallback | ✅ Written |
| Error response for missing STX | Malformed input | ✅ Written |
| Error response for empty string | Empty input | ✅ Written |
| Error response for too short (<4) | Length check | ✅ Written |
| rawResponse preserved in all results | Debug field | ✅ Written |
| parseSaleResponse same as parseResponse | Delegation | ✅ Written |
| parseBalanceResponse with AvailableBalance | Balance tag | ✅ Written |
| EMV tags extracted from \<BL\> elements | Multiple tags | ✅ Written |
| emvTags=undefined when no BL tags | Absent tags | ✅ Written |

### AmountCalculatorService (`src/services/trx/__tests__/AmountCalculatorService.test.ts`)
| Test | Description | Status |
|------|-------------|--------|
| 8.875% tax on $100 → $8.88 | Standard tax | ✅ Written |
| 8.875% tax on $38.75 → $3.44 | Real order amount | ✅ Written |
| 0% tax → $0 | Zero rate | ✅ Written |
| tax on $0 → $0 | Zero amount | ✅ Written |
| taxRate > 1 → $0 (invalid) | Validation | ✅ Written |
| Negative amount → $0 | Validation | ✅ Written |
| calculateTotal: $38.75 + $3.44 → $42.19 | Sum | ✅ Written |
| calculateTotal: zero tax | Zero | ✅ Written |
| validateAmount: $38.75 valid | Happy path | ✅ Written |
| validateAmount: $0.01 min | Boundary | ✅ Written |
| validateAmount: $999999.99 max | Boundary | ✅ Written |
| validateAmount: $0.00 rejected | Below min | ✅ Written |
| validateAmount: $1000000.00 rejected | Above max | ✅ Written |
| validateAmount: 3 decimals rejected | Precision | ✅ Written |
| validateAmount: NaN rejected | Invalid type | ✅ Written |
| formatCurrency: $38.75 → "$38.75" | Display | ✅ Written |
| formatCurrency: $100 → "$100.00" | Display | ✅ Written |
| formatCurrency: negative → "$0.00" | Invalid | ✅ Written |
| parseAmountFromString: "$38.75" → 38.75 | Parsing | ✅ Written |
| parseAmountFromString: "1,234.56" | Commas | ✅ Written |
| parseAmountFromString: non-numeric → 0 | Invalid | ✅ Written |
| splitAmount: $100 ÷ 4 = $25 each | Equal split | ✅ Written |
| splitAmount: $10 ÷ 3 remainder | Remainder dist. | ✅ Written |
| splitAmount: $38.75 ÷ 2 guests | Real split | ✅ Written |
| splitAmount: 0 parts → [] | Edge case | ✅ Written |
| splitAmount: 1 part | Full amount | ✅ Written |
| calculatePercentage: 15% of $38.75 → $5.81 | Tip calc | ✅ Written |
| calculatePercentage: 18% of $50 → $9.00 | Tip calc | ✅ Written |
| calculatePercentage: 20% of $100 → $20.00 | Tip calc | ✅ Written |
| calculatePercentage: 25% of $80 → $20.00 | Tip calc | ✅ Written |
| calculatePercentage: 0% → $0 | No tip | ✅ Written |
| calculatePercentage: >100% → $0 | Invalid | ✅ Written |

---

## Integration Tests (Jest)

| Test | Description | Status |
|------|-------------|--------|
| VP3350PaymentModal renders with amount | Snapshot/render test | ⏳ Pending |
| Charge button disabled when `isConnected=false` | UI state | ⏳ Pending |
| Charge button enabled when `isConnected=true` | UI state | ⏳ Pending |
| Tip selector hidden when `gratuityEnabled=false` | Settings flag | ⏳ Pending |
| Tip selector shows when `gratuityEnabled=true` | Settings flag | ⏳ Pending |
| Selecting tip % updates grand total | State update | ⏳ Pending |
| Deselecting active tip chip resets to $0 | Toggle | ⏳ Pending |
| TRXAmountDisplay shows correct tax line | Tax display | ⏳ Pending |
| TRXAmountDisplay hides surcharge when disabled | Conditional display | ⏳ Pending |
| TRXAmountDisplay shows surcharge when enabled | Conditional display | ⏳ Pending |
| TRXSettingsPanel saves tax rate to storage | Storage integration | ⏳ Pending |
| TRXSettingsPanel toggles CC surcharge | Toggle + storage | ⏳ Pending |
| TRXSettingsPanel resets to defaults | Reset action | ⏳ Pending |

---

## E2E Tests — Offline (Maestro)

| Test | Flow file | Status |
|------|-----------|--------|
| TRX settings panel renders | `trx_settings_smoke.yaml` | ✅ Written |
| CC surcharge toggle works | included in smoke test | ✅ Written |
| Gratuity toggle shows tip chips | included in smoke test | ✅ Written |
| Manage Terminals button opens modal | included in smoke test | ✅ Written |
| TRX option visible in payment selector | `trx_payment_flow.yaml` | ✅ Written |
| VP3350Modal opens on TRX tap | `trx_payment_flow.yaml` | ✅ Written |
| Terminal auto-scan runs on modal open | `trx_payment_flow.yaml` | ✅ Written |
| Charge button disabled before connect | ⏳ Pending — needs terminal | ⏳ Pending |
| Progress modal appears on Charge tap | `trx_payment_flow.yaml` (partial) | ✅ Written |

---

## E2E Tests — Online / Live Terminal (Maestro)

> Terminal at `192.168.1.12:1180` — payments approved (merchant account active).

| Test | Flow file | Status |
|------|-----------|--------|
| Full SALE: card tap → APPROVED | Manual via `test-trx-full-flow.sh` | ✅ Passed — Visa 3619, TRX377 |
| Card Payment → TRX routing (no mock) | Manual test | ✅ Passed |
| Terminal restore after app reload | Manual test | ✅ Passed |
| Payment progress modal renders (no crash) | Manual test | ✅ Passed — ExpoBlurView fix |
| Decline: card tap → DECLINED (05) | `online/trx_decline.yaml` | ⏳ Pending |
| Timeout: no card tap in 360s | `online/trx_timeout.yaml` | ⏳ Pending |
| Tip-included SALE: correct amount to terminal | `online/trx_tip_payment.yaml` | ⏳ Pending |
| Surcharge-included SALE | `online/trx_surcharge_payment.yaml` | ⏳ Pending |
| Retry after failure | `online/trx_retry.yaml` | ⏳ Pending |

---

## Automated Test Script

**Script**: `scripts/test-trx-full-flow.sh`

Runs the full flow: Settings → Add Terminal → Order Management → Pay → Card Payment → TRX Modal → Charge → Wait for card tap → Confirm.

```bash
# Full flow (includes terminal setup)
./scripts/test-trx-full-flow.sh

# Skip terminal setup (terminal already saved in AsyncStorage)
./scripts/test-trx-full-flow.sh --skip-setup
```

**What it does:**
1. Navigates to Settings → TRX Terminal → Manage Terminals
2. Adds terminal 192.168.1.12:1180 manually
3. Navigates to Order Management → taps Pay on served order
4. Scrolls to Card Payment → taps it (opens TRX modal)
5. Taps Charge button
6. Waits up to 90s for card tap on terminal
7. Captures logs for APPROVED/DECLINED response
8. Screenshots saved to `/tmp/trx-test/`

**Requirements:**
- Android emulator/device connected via ADB
- Expo dev server running on port 8081
- TRX terminal powered on at 192.168.1.12:1180
- At least one unpaid SERVED order in the system

---

## Direct TCP Test Cases (from host machine, no app required)

| Test | Command | Expected |
|------|---------|----------|
| TCP connectivity | `nc -z -w2 192.168.1.12 1180` | Exits 0 |
| BALANCE with protocol LRC | See script in protocol notes | Response received |
| SALE $1.00 | Full SALE packet via python | `00` APPROVED |

---

## Acceptance Criteria

- [x] TRX option visible in payment method selector
- [x] TRXPaymentModal opens when Card Payment or TRX selected
- [x] Terminal auto-discovery scans 192.168.1.x subnet
- [x] Status shows "Connected to 192.168.1.12" (green dot) when terminal found
- [x] Charge button disabled until terminal connected
- [x] Amount breakdown: subtotal + tax + surcharge (when enabled) = total
- [x] Tip selector appears when `gratuityEnabled=true`
- [x] Charge amount includes tip when selected
- [x] TRXPaymentProgressModal shows PROCESSING animation (no ExpoBlurView crash)
- [x] On SUCCESS: `onPayment()` called with approval code + card brand + last 4
- [x] Terminal state persists after app reload (AsyncStorage)
- [x] Card Payment routes directly to TRX (no mock card fallback)
- [ ] On FAILURE: progress modal shows error; retry possible
- [ ] Live settings reload: tax/surcharge change in settings reflected in open modal
- [ ] Network change detection clears terminal state

---

## Known Bugs (Non-Critical)

| Bug | Severity | File |
|-----|----------|------|
| "Order #undefined" in PaymentProcessing header subtitle | Low | PaymentProcessingScreen.tsx |
| "Processed At: Invalid Date Invalid Date" on confirmation | Low | PaymentConfirmationScreen.tsx |
| "Receipt generation failed" toast on payment confirmation | Low | Receipt service |
| VP3350 Device button shows "Device Not Connected" in PaymentMethodSelector | Low | PaymentMethodSelector.tsx |
