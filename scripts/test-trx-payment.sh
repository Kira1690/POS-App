#!/bin/bash
# TRX Payment Test Script - Tests terminal connection and payment flow
# Usage: ./scripts/test-trx-payment.sh [--no-launch] [--ip 192.168.1.12] [--port 1180]
#
# Options:
#   --no-launch   Skip app launch (app already running)
#   --ip IP       Terminal IP address (default: 192.168.1.12)
#   --port PORT   Terminal port (default: 1180)

set -euo pipefail

ADB="adb"
TERMINAL_IP="192.168.1.12"
TERMINAL_PORT="1180"
LAUNCH_APP=true
SCREENSHOT_DIR="/tmp/trx_test_$(date +%Y%m%d_%H%M%S)"
LOGCAT_TAG="ReactNativeJS"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-launch) LAUNCH_APP=false; shift ;;
    --ip) TERMINAL_IP="$2"; shift 2 ;;
    --port) TERMINAL_PORT="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

mkdir -p "$SCREENSHOT_DIR"

# --- Helpers ---
log()        { echo "[$(date +%H:%M:%S)] $1"; }
ok()         { echo "[$(date +%H:%M:%S)] ✅ $1"; }
warn()       { echo "[$(date +%H:%M:%S)] ⚠️  $1"; }
fail()       { echo "[$(date +%H:%M:%S)] ❌ $1"; exit 1; }

screenshot() {
  local name="$1"
  $ADB shell screencap -p /sdcard/screen.png
  $ADB pull /sdcard/screen.png "$SCREENSHOT_DIR/$name.png" 2>/dev/null
  log "Screenshot saved: $SCREENSHOT_DIR/$name.png"
}

tap() {
  $ADB shell input tap "$1" "$2"
  sleep "${3:-1}"
}

swipe_up() {
  $ADB shell input swipe 640 600 640 200 300
  sleep 1
}

wait_log() {
  local pattern="$1"
  local timeout="${2:-20}"
  local start; start=$(date +%s)
  log "Waiting for log: '$pattern' (${timeout}s timeout)"
  while true; do
    if $ADB logcat -d | grep "$LOGCAT_TAG" | grep -q "$pattern" 2>/dev/null; then
      return 0
    fi
    local now; now=$(date +%s)
    if (( now - start > timeout )); then
      warn "Timeout waiting for log pattern: $pattern"
      return 1
    fi
    sleep 1
  done
}

get_recent_logs() {
  $ADB logcat -d | grep "$LOGCAT_TAG" | grep -i "${1:-trx\|tcp\|terminal\|connect}" | tail -20
}

# ============================================================
# PHASE 0: Pre-flight checks
# ============================================================
log "=== Phase 0: Pre-flight Checks ==="

# Check ADB device
if ! $ADB devices | grep -q "device$"; then
  fail "No ADB device connected. Start emulator first."
fi
ok "ADB device found"

# Check Metro is running
if ! curl -s --max-time 3 "http://localhost:8081/status" | grep -q "packager-status:running" 2>/dev/null; then
  warn "Metro bundler not responding on :8081, check if it's running"
else
  ok "Metro bundler running on :8081"
fi

# Check terminal TCP reachability from host
if nc -z -w 3 "$TERMINAL_IP" "$TERMINAL_PORT" 2>/dev/null; then
  ok "Terminal $TERMINAL_IP:$TERMINAL_PORT is reachable from host machine"
else
  warn "Terminal $TERMINAL_IP:$TERMINAL_PORT not reachable from host (may still work from device)"
fi

# ============================================================
# PHASE 1: Launch App
# ============================================================
log "=== Phase 1: App Launch ==="

if $LAUNCH_APP; then
  log "Launching app..."
  $ADB shell am start -n com.ajinkya123.POSReactNativeApp/.MainActivity
  sleep 6
fi

# Check app is in foreground
ACTIVE=$($ADB shell dumpsys activity top 2>/dev/null | grep "ACTIVITY" | head -1 || echo "")
if echo "$ACTIVE" | grep -q "POSReactNativeApp"; then
  ok "App is in foreground"
else
  warn "App may not be in foreground: $ACTIVE"
fi

$ADB logcat -c 2>/dev/null
log "Logcat cleared"

# ============================================================
# PHASE 2: Check TcpSockets native module init
# ============================================================
log "=== Phase 2: TcpSockets Native Module Check ==="

# Trigger a hot reload to force module re-init
$ADB shell input keyevent 82 2>/dev/null  # Menu key for dev menu
sleep 2

# Check for our diagnostic log
screenshot "01_app_launched"

if wait_log "turbo=" 10; then
  INIT_LOG=$($ADB logcat -d | grep "$LOGCAT_TAG" | grep "turbo=" | tail -2)
  log "Module init: $INIT_LOG"
  if echo "$INIT_LOG" | grep -q "turbo=true"; then
    ok "TcpSockets resolved via TurboModuleRegistry (interop layer working!)"
  elif echo "$INIT_LOG" | grep -q "legacy=true"; then
    ok "TcpSockets resolved via legacy NativeModules"
  else
    warn "TcpSockets may not be resolved: $INIT_LOG"
  fi
else
  warn "Module init log not found (module may not have loaded yet)"
fi

# ============================================================
# PHASE 3: Navigate to Settings > TRX Settings
# ============================================================
log "=== Phase 3: Navigate to TRX Settings ==="

# Dismiss dev menu if open
$ADB shell input keyevent 4 2>/dev/null  # Back
sleep 1

screenshot "02_before_nav"

# Tap Settings tab (bottom right)
tap 1127 729 2
screenshot "03_settings_open"

# Tap TRX Terminal in sidebar
tap 145 442 1.5
screenshot "04_trx_panel"

# ============================================================
# PHASE 4: Add Terminal Manually
# ============================================================
log "=== Phase 4: Add Terminal at $TERMINAL_IP:$TERMINAL_PORT ==="

# Scroll down to Manage Terminals button
swipe_up
sleep 1

# Tap Manage Terminals button
tap 783 502 3
screenshot "05_terminal_mgmt"

# Tap Manual IP input field
tap 640 267 1
screenshot "06_manual_input"

# Tap the suggested IP chip (192.168.1.12)
tap 75 412 0.5

# Clear logcat before add
$ADB logcat -c 2>/dev/null

# Tap Add Terminal
tap 945 462 1
screenshot "07_adding_terminal"

log "Waiting for connection result (15s)..."
sleep 5

# Check logs for connection result
CONN_LOGS=$($ADB logcat -d | grep "$LOGCAT_TAG" | tail -30)

if echo "$CONN_LOGS" | grep -qi "turbo=true\|turbo = true"; then
  ok "TurboModuleRegistry interop confirmed"
fi

if echo "$CONN_LOGS" | grep -qi "Cannot read property.*null\|connect.*null\|null.*connect"; then
  fail "TCP connection still failing: NativeModules.TcpSockets is null. Patch did not work."
fi

if echo "$CONN_LOGS" | grep -qi "Manual terminal added\|terminal.*connected\|TERMINAL_CONNECTED"; then
  ok "Terminal added and connected successfully!"
elif echo "$CONN_LOGS" | grep -qi "Connection.*failed\|Failed.*connect\|ECONNREFUSED\|ETIMEDOUT"; then
  warn "TCP connection to terminal failed (network issue, not null module):"
  echo "$CONN_LOGS" | grep -i "fail\|error\|refused\|timeout" | tail -5
else
  warn "Connection result unclear. Recent logs:"
  echo "$CONN_LOGS" | grep -i "trx\|tcp\|terminal\|connect\|socket" | tail -10
fi

screenshot "08_after_add"

# Dismiss alert if present
tap 866 439 1  # OK button
sleep 1

# Close terminal management modal
tap 34 28 1
screenshot "09_modal_closed"

# ============================================================
# PHASE 5: Process a Payment via TRX
# ============================================================
log "=== Phase 5: TRX Payment Flow ==="

# Navigate to Order Management
tap 489 729 1.5
screenshot "10_order_management"

$ADB logcat -c 2>/dev/null

# Tap Pay on first served order
tap 1189 488 2
screenshot "11_payment_processing"

# Scroll to TRX Terminal payment method
swipe_up
sleep 1
screenshot "12_payment_methods"

# Tap TRX Terminal
tap 319 498 3
screenshot "13_trx_modal"

# Check TRX modal state
log "TRX modal logs:"
$ADB logcat -d | grep "$LOGCAT_TAG" | grep -i "trx\|terminal\|connect\|online" | tail -10

screenshot "14_trx_modal_state"

# ============================================================
# Summary
# ============================================================
log ""
log "=== Test Complete ==="
log "Screenshots saved to: $SCREENSHOT_DIR/"
ls "$SCREENSHOT_DIR/"
log ""
log "Key diagnostic logs:"
$ADB logcat -d | grep "$LOGCAT_TAG" | grep -i "turbo\|tcp\|terminal\|connect\|socket" | tail -15
