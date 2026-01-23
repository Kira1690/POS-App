#!/bin/bash

##############################################################################
# Stop Android Emulator
# Usage: ./stop-emulator.sh
##############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ANDROID_HOME="$HOME/Android/Sdk"

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Stopping Android Emulator${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if emulator is running
if ! pgrep -f "qemu-system" > /dev/null 2>&1; then
    print_warning "No emulator is currently running"
    exit 0
fi

# Try graceful shutdown first
print_info "Attempting graceful shutdown..."
$ANDROID_HOME/platform-tools/adb -s emulator-5554 emu kill 2>/dev/null

sleep 3

# Force kill if still running
if pgrep -f "qemu-system" > /dev/null 2>&1; then
    print_info "Force killing emulator..."
    pkill -9 qemu-system
    sleep 1
fi

# Verify stopped
if pgrep -f "qemu-system" > /dev/null 2>&1; then
    print_warning "Emulator may still be running"
else
    print_success "Emulator stopped successfully"
fi

# Kill ADB server
print_info "Stopping ADB server..."
$ANDROID_HOME/platform-tools/adb kill-server 2>/dev/null || true

print_success "Done!"
