#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  run-qa-suite.sh — Full QA Test Suite Runner
#
#  Usage:
#    ./scripts/run-qa-suite.sh
#
#  What this does:
#    1. Resets all app data (clears SQLite + AsyncStorage)
#    2. Enables emulator auto-rotation
#    3. Launches the app fresh via Expo Go deep link
#    4. Runs Maestro tests qa_01 through qa_05 (portrait phases)
#    5. Rotates emulator to landscape
#    6. Runs qa_06 (landscape order)
#    7. Rotates back to portrait
#    8. Runs qa_07 (kitchen ops)
#    9. Outputs a pass/fail summary with screenshot locations
#
#  Prerequisites:
#    - Android emulator running (POS_Tablet AVD)
#    - Expo server running: bun expo start --clear
#    - Maestro installed: https://maestro.mobile.dev/
#    - adb in PATH
#
#  Test Data:
#    Categories:  Drinks, Mains, Starters
#    Items:       Latte, Cappuccino, Beef Burger, Grilled Salmon,
#                 Spring Rolls, Garlic Bread
#    Modifiers:   Cup Size, Protein
# ─────────────────────────────────────────────────────────────────────────────

set +e  # Don't exit on failure — collect all results

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MAESTRO_DIR="$PROJECT_DIR/.maestro"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="$PROJECT_DIR/qa-results/$TIMESTAMP"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0
failed_tests=()

log_step() {
  echo -e "\n${BLUE}━━━ $1 ━━━${NC}"
}

log_pass() {
  echo -e "${GREEN}  ✓ PASS: $1${NC}"
  pass_count=$((pass_count + 1))
}

log_fail() {
  echo -e "${RED}  ✗ FAIL: $1${NC}"
  fail_count=$((fail_count + 1))
  failed_tests+=("$1")
}

log_info() {
  echo -e "${YELLOW}  → $1${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
echo -e "\n${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          POS APP — FULL QA SUITE RUNNER              ║${NC}"
echo -e "${BLUE}║          Timestamp: $TIMESTAMP           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"

mkdir -p "$RESULTS_DIR"

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 1: Pre-flight checks"

if ! command -v adb &> /dev/null; then
  echo -e "${RED}ERROR: adb not found. Add Android SDK platform-tools to PATH.${NC}"
  exit 1
fi

if ! command -v maestro &> /dev/null; then
  echo -e "${RED}ERROR: maestro not found. Install from https://maestro.mobile.dev/${NC}"
  exit 1
fi

DEVICE=$(adb devices | grep -v "List" | grep "device$" | head -1 | cut -f1)
if [ -z "$DEVICE" ]; then
  echo -e "${RED}ERROR: No Android device/emulator connected.${NC}"
  exit 1
fi
log_info "Device: $DEVICE"

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 2: Reset app data (clean slate)"

# pm clear wipes ALL Expo Go data including the JS bundle cache.
# After clearing, the app must re-download the bundle from Metro (10.0.2.2:8081).
# This REQUIRES the Metro server to be running: bun expo start --clear
#
# NOTE: If Metro is NOT running when this script executes, pm clear will cause
# "Failed to download remote update" error. Start Metro first.
log_info "Clearing Expo Go data (bundle will re-download from Metro)..."
adb -s "$DEVICE" shell pm clear host.exp.exponent || true
log_info "App data cleared ✓"

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 3: Configure emulator rotation (portrait)"

adb -s "$DEVICE" shell settings put system accelerometer_rotation 1
adb -s "$DEVICE" shell settings put system user_rotation 0
log_info "Rotation set to portrait (user_rotation=0)"

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 4: Launch app and wait for bundle download"

# Open the deep link using 10.0.2.2 — the emulator's permanent alias for host localhost.
# This works regardless of the host machine's WiFi IP address.
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" host.exp.exponent || true

log_info "Waiting 45s for bundle to download from Metro..."
sleep 45
log_info "Bundle load wait complete ✓"

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 5: Running QA Phase 1 — Categories"

if maestro test "$MAESTRO_DIR/qa_01_setup_categories.yaml" \
  --output "$RESULTS_DIR/qa_01_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_01.log"; then
  log_pass "QA 01 - Categories (Drinks/Mains/Starters)"
else
  log_fail "QA 01 - Categories"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 6: Running QA Phase 2 — Menu Items"

if maestro test "$MAESTRO_DIR/qa_02_add_items.yaml" \
  --output "$RESULTS_DIR/qa_02_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_02.log"; then
  log_pass "QA 02 - Items (6 items added)"
else
  log_fail "QA 02 - Items"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 7: Running QA Phase 3 — Modifier Groups"

if maestro test "$MAESTRO_DIR/qa_03_add_modifiers.yaml" \
  --output "$RESULTS_DIR/qa_03_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_03.log"; then
  log_pass "QA 03 - Modifiers (Cup Size/Protein)"
else
  log_fail "QA 03 - Modifiers"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 8: Running QA Phase 4 — Assign Modifiers"

if maestro test "$MAESTRO_DIR/qa_04_assign_modifiers.yaml" \
  --output "$RESULTS_DIR/qa_04_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_04.log"; then
  log_pass "QA 04 - Modifier Assignments"
else
  log_fail "QA 04 - Modifier Assignments"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 9: Running QA Phase 5 — POS Order (Portrait)"

if maestro test "$MAESTRO_DIR/qa_05_pos_portrait.yaml" \
  --output "$RESULTS_DIR/qa_05_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_05.log"; then
  log_pass "QA 05 - POS Portrait Order (Table A-1, Latte Large + Spring Rolls)"
else
  log_fail "QA 05 - POS Portrait Order"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 10: Rotate emulator to LANDSCAPE"

adb -s "$DEVICE" shell settings put system user_rotation 1
log_info "Rotated to landscape. Waiting 3s for UI to reflow..."
sleep 3

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 11: Running QA Phase 6 — POS Order (Landscape)"

if maestro test "$MAESTRO_DIR/qa_06_pos_landscape.yaml" \
  --output "$RESULTS_DIR/qa_06_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_06.log"; then
  log_pass "QA 06 - POS Landscape Order (Table A-2, Beef Burger Extra + Garlic Bread)"
else
  log_fail "QA 06 - POS Landscape Order"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 12: Rotate back to PORTRAIT"

adb -s "$DEVICE" shell settings put system user_rotation 0
log_info "Rotated back to portrait. Waiting 2s..."
sleep 2

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 13: Running QA Phase 7 — Kitchen Operations"

if maestro test "$MAESTRO_DIR/qa_07_kitchen_ops.yaml" \
  --output "$RESULTS_DIR/qa_07_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_07.log"; then
  log_pass "QA 07 - Kitchen Ops (Confirmed → Preparing → Ready → Served)"
else
  log_fail "QA 07 - Kitchen Ops"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "STEP 14: Running QA Phase 8 — Billing & Payment"

if maestro test "$MAESTRO_DIR/qa_08_billing_payment.yaml" \
  --output "$RESULTS_DIR/qa_08_results.xml" 2>&1 | tee "$RESULTS_DIR/qa_08.log"; then
  log_pass "QA 08 - Billing & Cash Payment (Pay → Confirm → PAID)"
else
  log_fail "QA 08 - Billing & Payment"
fi

# ─────────────────────────────────────────────────────────────────────────────
log_step "RESULTS SUMMARY"

TOTAL=$((pass_count + fail_count))
echo -e "\n  Tests run:    $TOTAL"
echo -e "  ${GREEN}Passed:       $pass_count${NC}"
echo -e "  ${RED}Failed:       $fail_count${NC}"

if [ ${#failed_tests[@]} -gt 0 ]; then
  echo -e "\n  ${RED}Failed tests:${NC}"
  for t in "${failed_tests[@]}"; do
    echo -e "    ${RED}✗ $t${NC}"
  done
fi

echo -e "\n  Results saved to: $RESULTS_DIR"
echo -e "  Screenshots:      ~/.maestro/tests/ (latest run)"

# Write summary report
cat > "$RESULTS_DIR/SUMMARY.md" << SUMMARY
# QA Test Suite Results
**Run:** $TIMESTAMP
**Device:** $DEVICE

## Test Data
- Categories: Drinks, Mains, Starters
- Items: Latte \$5.00, Cappuccino \$4.75, Beef Burger \$12.99, Grilled Salmon \$15.50, Spring Rolls \$6.50, Garlic Bread \$4.00
- Modifiers: Cup Size (S/M/L), Protein (Regular/Extra)

## Results
| Phase | Test | Status |
|-------|------|--------|
| QA 01 | Categories (Drinks/Mains/Starters) | $([ ${failed_tests[*]} =~ "QA 01" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 02 | 6 Menu Items | $([ ${failed_tests[*]} =~ "QA 02" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 03 | Modifier Groups (Cup Size/Protein) | $([ ${failed_tests[*]} =~ "QA 03" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 04 | Assign Modifiers to Items | $([ ${failed_tests[*]} =~ "QA 04" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 05 | POS Portrait Order (Latte Large + Spring Rolls) | $([ ${failed_tests[*]} =~ "QA 05" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 06 | POS Landscape Order (Beef Burger Extra + Garlic Bread) | $([ ${failed_tests[*]} =~ "QA 06" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 07 | Kitchen Ops (Confirmed → Serving → SERVED) | $([ ${failed_tests[*]} =~ "QA 07" ] && echo "❌ FAIL" || echo "✅ PASS") |
| QA 08 | Billing & Cash Payment (Pay → Confirm → PAID) | $([ ${failed_tests[*]} =~ "QA 08" ] && echo "❌ FAIL" || echo "✅ PASS") |

**Total: $pass_count/$TOTAL passed**
SUMMARY

echo -e "\n  Summary report: $RESULTS_DIR/SUMMARY.md"

if [ $fail_count -eq 0 ]; then
  echo -e "\n${GREEN}  ✓ ALL TESTS PASSED ✓${NC}\n"
  exit 0
else
  echo -e "\n${RED}  ✗ $fail_count TEST(S) FAILED${NC}\n"
  exit 1
fi
