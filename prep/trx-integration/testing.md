# TRX Payment Terminal — How to Test

> Last updated: 2026-02-27

---

## Prerequisites

1. **Android emulator/device** connected via ADB
2. **Expo dev server** running: `bun expo start --clear` (port 8081)
3. **TRX terminal** powered on at `192.168.1.12:1180` (same WiFi subnet)
4. **At least one SERVED (unpaid) order** in the system
5. **Test credentials**: `EMP001` / `staff123` or `manager@foodcorner.com` / `manager123`

---

## Quick Test (Automated Script)

### Full flow (first time — includes terminal setup)
```bash
./scripts/test-trx-full-flow.sh
```

### Payment only (terminal already configured)
```bash
./scripts/test-trx-full-flow.sh --skip-setup
```

Screenshots saved to `/tmp/trx-test/`. The script waits up to 90 seconds for a card tap on the terminal.

---

## Manual Testing Steps

### Test 1: Terminal Connection

1. Open app → **Settings** tab (bottom right)
2. Tap **TRX Terminal** in sidebar
3. Scroll down → tap **Manage Terminals**
4. Wait for network scan (8-10 seconds)
5. If terminal not found: tap **Add Terminal Manually** → tap the `192.168.1.12` chip → tap **Add Terminal**
6. Expected: Alert "Terminal connected" → green "Connected" status

**Verify:**
- Terminal shows as "Connected to 192.168.1.12" with green dot
- ADB logs: `TERMINAL CONNECTED SUCCESSFULLY`

### Test 2: Terminal Persistence After Reload

1. After Test 1, reload the app (shake → Reload, or force-stop + relaunch)
2. Navigate to **Settings** → **TRX Terminal**
3. Expected: Terminal still shows as connected (restored from AsyncStorage)

**Verify:**
- ADB logs: `Terminal restored from storage on init`

### Test 3: Card Payment → TRX Routing

1. Navigate to **Order Management** tab
2. Find a SERVED order → tap **Pay**
3. Scroll down to **Payment Methods**
4. Tap **Card Payment**
5. Expected: **TRX Terminal Payment** modal opens (NOT a mock card confirmation)

**Verify:**
- Modal title: "TRX Terminal Payment"
- Status: "Connected to 192.168.1.12" (green dot)
- Shows amount breakdown: Subtotal, Tax, CC Surcharge, Total

### Test 4: Full Payment Transaction

1. Complete Test 3 (TRX modal open, terminal connected)
2. Optionally select a tip percentage
3. Tap **Charge $X.XX** button
4. Expected: Payment progress modal appears: "Processing payment..." with spinning icon
5. Tap/insert card on the physical TRX terminal
6. Expected after ~10 seconds:
   - Progress modal shows "Approved!" with green checkmark
   - Auto-dismisses after 3 seconds
   - Navigates to **Payment Confirmation** screen

**Verify in ADB logs:**
```
SALE|ID:...|amount|<j1><Z2>tax</Z2></j1>||
✅ Data sent successfully, waiting for response...
✅ Complete MML message received!
🎉 PAYMENT RESPONSE:
   • Status: ✅ APPROVED
   • Approval Code: TRX377
   • Card Brand: Visa
   • Last 4: 3619
```

### Test 5: No Terminal Connected

1. Clear terminal from storage (or use fresh app install)
2. Navigate to Order Management → Pay → Card Payment
3. Expected: TRX modal opens with "Disconnected" status
4. Reconnect button visible → tap to attempt reconnect
5. Charge button should be disabled (grayed out)

### Test 6: Payment Progress Modal (ExpoBlurView Fix)

1. Start a payment (Test 4 steps 1-3)
2. Expected: Dark semi-transparent overlay with white card
3. Animated icons: rotating, pulsing, or static based on state
4. Timer counts up (10s, 11s, 12s...)
5. **No crash** — no red screen about ExpoBlurView

---

## Test Suites (Detailed)

### Suite 1 — Dependency & Build

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1.1 | `bun install` completes | No errors; tcp-socket + buffer in bun.lock | ✅ |
| 1.2 | `npx expo prebuild --clean` | android/ regenerated; no gradle errors | ✅ |
| 1.3 | `npx expo run:android` | App launches without native module errors | ✅ |
| 1.4 | Open Settings → TRX Terminal | TRXSettingsPanel renders | ✅ |

### Suite 2 — Settings Persistence

| # | Test | Expected | Status |
|---|------|----------|--------|
| 2.1 | Set Tax Rate to `9.5` → close → reopen | Value shows `9.5` | ✅ |
| 2.2 | Enable CC Surcharge → set fee → close → reopen | Toggle ON, fee persists | ✅ |
| 2.3 | Enable Gratuity → select rates → close → reopen | Toggle ON, rates persist | ✅ |
| 2.4 | "Reset TRX to Defaults" button | All fields reset | ⏳ |
| 2.5 | Update tax rate while payment modal open | Live reload via EventEmitter | ⏳ |

### Suite 3 — Terminal Discovery & Persistence

| # | Test | Expected | Status |
|---|------|----------|--------|
| 3.1 | Settings → Manage Terminals → Scan | Terminals appear in list | ✅ |
| 3.2 | Add manual terminal 192.168.1.12:1180 | Connected, saved to AsyncStorage | ✅ |
| 3.3 | TRXPaymentModal opens | Auto-reconnect from storage | ✅ |
| 3.4 | App reload → terminal still connected | AsyncStorage restore in constructor | ✅ |
| 3.5 | No terminal on network | "Disconnected" status, Charge disabled | ✅ |
| 3.6 | Network change (WiFi switch) | Terminal state cleared | ⏳ |

### Suite 4 — Payment Flow (Happy Path)

| # | Step | Expected | Status |
|---|------|----------|--------|
| 4.1 | SERVED order → Pay | PaymentProcessingScreen opens | ✅ |
| 4.2 | Tap **Card Payment** | TRXPaymentModal opens (no mock fallback) | ✅ |
| 4.3 | Modal shows amount breakdown | Subtotal + Tax + Surcharge = Total | ✅ |
| 4.4 | Terminal status green "Connected" | Charge button enabled | ✅ |
| 4.5 | Tap **Charge $X.XX** | Progress modal: "Processing payment..." | ✅ |
| 4.6 | Tap card on terminal | MML SALE sent, response received | ✅ |
| 4.7 | Terminal approves | Modal: "Approved!" + green checkmark | ✅ |
| 4.8 | Auto-dismiss → Confirmation | PaymentConfirmation screen shown | ✅ |

### Suite 5 — Payment Flow (Error Cases)

| # | Test | Expected | Status |
|---|------|----------|--------|
| 5.1 | Terminal declines (status 05) | Modal: "Transaction declined" | ⏳ |
| 5.2 | Network timeout (360s) | Modal: timeout message | ⏳ |
| 5.3 | Terminal not reachable | Modal: connection error | ⏳ |
| 5.4 | "Try Again" on failure | Returns to IDLE, can retry | ⏳ |
| 5.5 | Close during processing | Close button disabled | ✅ |

### Suite 6 — Gratuity

| # | Test | Expected | Status |
|---|------|----------|--------|
| 6.1 | Gratuity disabled | No tip selector in modal | ✅ |
| 6.2 | Gratuity enabled | Tip chips: 15%, 18%, 20%, 25%, No Tip | ✅ |
| 6.3 | Tap 20% on $50 order | Total includes $10 tip | ⏳ |
| 6.4 | Tap active chip again | Tip resets to $0 | ⏳ |
| 6.5 | Charge with tip | Terminal charged subtotal + tax + surcharge + tip | ⏳ |

### Suite 7 — CC Surcharge

| # | Test | Expected | Status |
|---|------|----------|--------|
| 7.1 | Surcharge disabled | No surcharge line | ✅ |
| 7.2 | Surcharge enabled (2.9%) | Surcharge line in amount display | ✅ |
| 7.3 | Terminal amount includes surcharge | MML amount correct | ✅ |

### Suite 8 — Transaction Storage

| # | Test | Expected | Status |
|---|------|----------|--------|
| 8.1 | Complete a payment | Transaction in SQLite `transactions` table | ✅ |
| 8.2 | Multiple payments | All records with unique GUIDs | ⏳ |
| 8.3 | App restart | Transaction history accessible | ⏳ |

---

## Unit Tests

```bash
# Run all TRX unit tests (91 tests)
bun test -- --testPathPattern="src/services/trx/__tests__"

# Individual suites
bun test -- --testPathPattern="MMLMessageBuilder"     # 21 tests
bun test -- --testPathPattern="MMLResponseParser"      # 28 tests
bun test -- --testPathPattern="AmountCalculatorService" # 42 tests
```

---

## Direct TCP Test (No App Required)

```bash
# Basic connectivity check
nc -z -w2 192.168.1.12 1180 && echo "OK" || echo "FAIL"

# BALANCE inquiry with MML protocol
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

---

## ADB Log Monitoring

```bash
# All TRX logs
adb logcat -s "ReactNativeJS" | grep -iE "TRX|terminal|connect|MML|SALE|payment|charge"

# Connection only
adb logcat -s "ReactNativeJS" | grep -iE "connect|terminal|restore|storage"

# Payment only
adb logcat -s "ReactNativeJS" | grep -iE "SALE|MML|APPROVED|DECLINED|response|amount"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| White screen after reload | Force stop: `adb shell am force-stop com.ajinkya123.POSReactNativeApp` then relaunch |
| Terminal not connecting | Check WiFi — device and terminal must be on same /24 subnet |
| "Invalid Amount" on Charge | Check useTRXPaymentProcessor — displayAmount may be 0.00 |
| Card Payment uses mock data | Should be fixed — Card always routes to TRX modal now |
| Terminal lost after reload | Should be fixed — TerminalStorage restores in constructor |
| Charge button disabled | Terminal not connected — check green dot, try Reconnect |
| Payment times out | Check terminal display — may need card tap |
| "Receipt generation failed" | Known non-critical bug — receipt service issue |

---

## Known Limitations

- `react-native-tcp-socket` does NOT work in Expo Go — requires custom dev client build
- Auto-scan scans full /24 subnet (255 IPs) — can take 10-30 seconds
- Terminal has 360-second card-wait timeout — app mirrors this
- Terminal must be on same LAN segment; VPN/VLAN separation will prevent connection
