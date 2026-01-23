#!/bin/bash

##############################################################################
# View POS App Logs
# Usage: ./view-logs.sh [filter]
# Examples:
#   ./view-logs.sh              # View all app logs
#   ./view-logs.sh error        # View only errors
#   ./view-logs.sh auth         # View auth-related logs
##############################################################################

ANDROID_HOME="$HOME/Android/Sdk"
FILTER="${1:-LOG|WARN|ERROR}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}POS App Logs (Ctrl+C to exit)${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if emulator is running
if ! $ANDROID_HOME/platform-tools/adb devices 2>/dev/null | grep -q "emulator.*device$"; then
    echo -e "${RED}✗ No emulator connected${NC}"
    echo -e "${YELLOW}ℹ Start the emulator first: ./test-on-emulator.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Connected to emulator${NC}"
echo -e "${BLUE}ℹ Filtering for: $FILTER${NC}\n"

# Clear logcat buffer first
$ANDROID_HOME/platform-tools/adb logcat -c 2>/dev/null

# Stream logs with color coding
$ANDROID_HOME/platform-tools/adb logcat | grep -iE "$FILTER" | while IFS= read -r line; do
    if echo "$line" | grep -q "ERROR"; then
        echo -e "${RED}$line${NC}"
    elif echo "$line" | grep -q "WARN"; then
        echo -e "${YELLOW}$line${NC}"
    elif echo "$line" | grep -q "LOG"; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done
