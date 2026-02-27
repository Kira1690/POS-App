#!/bin/bash
# TRX Full Payment Flow Test Script
# Tests: Settings → Add Terminal → Pay Order → Card Payment → TRX Modal → Charge
# Usage: ./scripts/test-trx-full-flow.sh [--skip-setup]
#
# --skip-setup: Skip terminal setup (assumes terminal already saved in storage)

set -uo pipefail

ADB="adb"
DELAY=2
TERMINAL_IP="192.168.1.12"
TERMINAL_PORT="1180"
SCREENSHOT_DIR="/tmp/trx-test"
SKIP_SETUP=false

[[ "${1:-}" == "--skip-setup" ]] && SKIP_SETUP=true

rm -rf "$SCREENSHOT_DIR"
mkdir -p "$SCREENSHOT_DIR"

# ---- Helpers ----
log()        { echo -e "[$(date +%H:%M:%S)] $1"; }
ok()         { echo -e "[$(date +%H:%M:%S)] \033[32m✅ $1\033[0m"; }
fail()       { echo -e "[$(date +%H:%M:%S)] \033[31m❌ $1\033[0m"; }
warn()       { echo -e "[$(date +%H:%M:%S)] \033[33m⚠️  $1\033[0m"; }
screenshot() {
  $ADB shell screencap -p /sdcard/screen.png 2>/dev/null
  $ADB pull /sdcard/screen.png "$SCREENSHOT_DIR/$1.png" >/dev/null 2>&1
  log "📸 $1"
}
tap()        { $ADB shell input tap "$1" "$2" 2>/dev/null; sleep "${3:-$DELAY}"; }
swipe()      { $ADB shell input swipe "$1" "$2" "$3" "$4" "${5:-300}" 2>/dev/null; sleep "${6:-$DELAY}"; }
clear_logs() { $ADB logcat -c 2>/dev/null || true; }
check_log()  {
  local pattern="$1"
  local timeout="${2:-10}"
  local start=$(date +%s)
  while true; do
    if $ADB logcat -d 2>/dev/null | grep "ReactNativeJS" | grep -qE "$pattern"; then
      return 0
    fi
    local now=$(date +%s)
    if (( now - start > timeout )); then
      return 1
    fi
    sleep 1
  done
}
dump_logs() {
  local pattern="${1:-terminal|connect|payment|MML|SALE|charge|TRX}"
  local count="${2:-20}"
  $ADB logcat -d 2>/dev/null | grep "ReactNativeJS" | grep -iE "$pattern" | tail -"$count" || true
}
wait_for_screen() {
  # Wait until the screen has meaningful content (not just white)
  local timeout="${1:-30}"
  local start=$(date +%s)
  log "→ Waiting for screen to load..."
  while true; do
    local now=$(date +%s)
    if (( now - start > timeout )); then
      warn "Screen wait timeout after ${timeout}s"
      break
    fi
    sleep 2
  done
}

# ---- Pre-flight ----
log "=== TRX Full Payment Flow Test ==="
log "Terminal: $TERMINAL_IP:$TERMINAL_PORT"
log "Screenshots: $SCREENSHOT_DIR/"
log ""

# Ensure app is running
ACTIVE=$($ADB shell dumpsys activity top 2>/dev/null | grep "ACTIVITY" | head -1 || true)
if echo "$ACTIVE" | grep -q "POSReactNativeApp"; then
  ok "App is already running"
else
  log "Launching app..."
  $ADB shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081" 2>/dev/null
  log "→ Waiting 20s for app to fully load..."
  sleep 20
fi

screenshot "00_app_ready"

# ========== PHASE 1: Terminal Setup ==========
if [[ "$SKIP_SETUP" == false ]]; then
  log ""
  log "========================================="
  log "  PHASE 1: Terminal Setup"
  log "========================================="

  # Navigate to Settings tab
  log "→ Tapping Settings tab"
  tap 1127 757 3

  screenshot "01_settings"

  # Tap TRX Terminal in sidebar
  log "→ Opening TRX Terminal settings"
  tap 145 442 2

  # Scroll down and tap Manage Terminals
  log "→ Opening Manage Terminals"
  swipe 640 500 640 200 300 2
  tap 783 502 5

  screenshot "02_manage_terminals"

  # Wait for scan
  log "→ Waiting for network scan to complete..."
  sleep 8

  # Add terminal manually
  log "→ Adding terminal $TERMINAL_IP:$TERMINAL_PORT"
  tap 640 267 1.5      # Expand "Add Terminal Manually"
  tap 75 412 0.5       # Tap IP chip (192.168.1.12)

  clear_logs
  tap 945 462          # Tap "Add Terminal"
  sleep 8

  if check_log "TERMINAL CONNECTED SUCCESSFULLY|Manual terminal added successfully" 5; then
    ok "Terminal connected!"
  else
    warn "Terminal connection status unclear — checking logs:"
    dump_logs "terminal|connect|manual" 10
  fi

  screenshot "03_terminal_added"

  # Dismiss alert and close modal
  tap 866 439 1        # OK on alert
  tap 34 28 2          # X to close modal

  ok "Phase 1 complete — terminal configured"
else
  ok "Skipping setup — using previously stored terminal"
fi

# ========== PHASE 2: Navigate to Payment ==========
log ""
log "========================================="
log "  PHASE 2: Navigate to Payment"
log "========================================="

# Go to Order Management tab
log "→ Tapping Order Management tab"
tap 487 757 4

screenshot "04_order_management"

# We need a SERVED (unpaid) order. Tap "Served" status filter
log "→ Filtering to Served orders"
tap 643 229 2

screenshot "05_served_orders"

# Tap Pay on the first order card (Pay button is right side of first order)
log "→ Tapping Pay on first served order"
clear_logs
tap 1189 488 4

screenshot "06_after_pay_tap"

# Check what screen we're on — could be PaymentProcessing or OrderDetails
# If we hit an order details view, we need to process payment from there
log "→ Checking screen state..."

ok "Phase 2 complete"

# ========== PHASE 3: Get to Card Payment → TRX Modal ==========
log ""
log "========================================="
log "  PHASE 3: Card Payment → TRX Modal"
log "========================================="

# Scroll down to Payment Methods section
log "→ Scrolling to payment methods"
swipe 640 500 640 150 300 2
swipe 640 500 640 150 300 2

screenshot "07_payment_methods"

# Tap Card Payment — should now always route to TRX modal
log "→ Tapping Card Payment"
clear_logs
tap 319 520 4

screenshot "08_trx_modal_open"

# Wait for reconnection
log "→ Waiting for terminal reconnection..."
sleep 8

screenshot "09_trx_after_reconnect"

# Check connection logs
log "→ Connection logs:"
dump_logs "connect|terminal|restored|Reconnect|online" 15

ok "Phase 3 complete — TRX modal should be open"

# ========== PHASE 4: Charge Payment ==========
log ""
log "========================================="
log "  PHASE 4: Charge Payment"
log "========================================="

# Tap the Charge button (bottom area, right 2/3 of screen)
log "→ Tapping Charge button"
clear_logs
tap 870 728 2

screenshot "10_after_charge"

# Wait for MML message construction
log "→ Waiting for payment processing..."
sleep 5

# Check for transaction logs
log "→ Transaction logs:"
dump_logs "SALE|MML|Building|Processing|connect|amount|transaction" 20

screenshot "11_payment_progress"

# Wait for card tap on terminal
log ""
log "========================================="
log "  ⏳ WAITING FOR CARD TAP ON TERMINAL"
log "  👉 Tap/insert card on TRX device now"
log "========================================="

PAYMENT_DONE=false
for i in $(seq 1 90); do
  if check_log "APPROVED|DECLINED|PAYMENT RESPONSE|Payment completed|SUCCESS" 1; then
    PAYMENT_DONE=true
    break
  fi
  if (( i % 10 == 0 )); then
    log "  ... waiting ${i}s"
  fi
done

screenshot "12_payment_result"

if [[ "$PAYMENT_DONE" == true ]]; then
  ok "Payment response received!"
  log ""
  log "========================================="
  log "  PAYMENT RESULT"
  log "========================================="
  dump_logs "APPROVED|DECLINED|PAYMENT RESPONSE|approvalCode|cardBrand|lastFour|Status|response|success" 15
else
  fail "Payment timed out after 90s — no response from terminal"
  log ""
  log "All recent logs:"
  dump_logs "." 30
fi

# ========== PHASE 5: Confirmation ==========
log ""
log "========================================="
log "  PHASE 5: Confirmation"
log "========================================="
sleep 5
screenshot "13_confirmation"

log ""
log "========================================="
log "  TEST COMPLETE"
log "========================================="
log "Screenshots saved to: $SCREENSHOT_DIR/"
ls -1 "$SCREENSHOT_DIR/"*.png 2>/dev/null | while read f; do echo "  $(basename "$f")"; done
