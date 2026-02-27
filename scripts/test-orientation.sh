#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# test-orientation.sh
# Tests POS app layout in PORTRAIT and LANDSCAPE orientations
# Uses adb screenshots + emu sensor commands
# ──────────────────────────────────────────────────────────────────────────────

set -e
SCREENSHOTS_DIR="/tmp/orientation-test-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$SCREENSHOTS_DIR"
APP_PACKAGE="com.ajinkya123.POSReactNativeApp"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  POS App Orientation Test"
echo "  Screenshots: $SCREENSHOTS_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

screenshot() {
  local name=$1
  adb shell screencap /sdcard/screen.png
  adb pull /sdcard/screen.png "$SCREENSHOTS_DIR/${name}.png" 2>/dev/null
  echo "  📸 $name"
}

wait_for() {
  sleep "$1"
}

# ── Portrait Mode ────────────────────────────────────────
echo ""
echo "▶ Testing PORTRAIT mode..."

# Set portrait (sensor pointing up = natural portrait)
adb emu sensor set acceleration 0:0:9.8
wait_for 2

# Navigate to Order Management
adb shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081"
wait_for 6

screenshot "01_portrait_home"

# Navigate via bottom tab - Order Management
adb shell input tap 308 1257  # Order Management tab (portrait coords)
wait_for 2
screenshot "02_portrait_order_management"

# Tap New Order
adb shell input tap 611 55
wait_for 2
screenshot "03_portrait_table_selector"

# Select first table
adb shell input tap 280 270
wait_for 2
screenshot "04_portrait_pos_screen"

echo "  ✓ Portrait: POS screen layout captured"
echo "    Expected: search bar top, horizontal category chips, 2-col menu, bill panel bottom"

# ── Landscape Mode ───────────────────────────────────────
echo ""
echo "▶ Testing LANDSCAPE mode..."
echo "  ⚠  For emulator: use Ctrl+F11/F12 in emulator window OR run:"
echo "     adb emu rotate"
echo "  Then re-run this script section manually"
echo ""
echo "  For automated landscape test, the emulator sensor must support rotation."
echo "  Try: adb emu sensor set acceleration 9.8:0:0"

adb emu sensor set acceleration 9.8:0:0
wait_for 3

ROTATION=$(adb shell dumpsys window | grep mCurrentRotation | tr -d ' ')
echo "  Current rotation: $ROTATION"

screenshot "05_landscape_attempt"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Orientation test screenshots saved to:"
echo "  $SCREENSHOTS_DIR"
echo ""
echo "  Open each screenshot and verify:"
echo "  Portrait:  horizontal chips, 2-col menu, bill panel at bottom"
echo "  Landscape: vertical sidebar (left), 3-col menu (center), bill panel (right)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
