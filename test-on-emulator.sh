#!/bin/bash

##############################################################################
# POS App - Android Tablet Emulator Testing Script
# Usage: ./test-on-emulator.sh [options]
# Options:
#   --clean     Clean build (removes build cache)
#   --restart   Restart emulator before running
#   --logs      Show app logs after deployment
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ANDROID_HOME="$HOME/Android/Sdk"
ANDROID_AVD_HOME="$HOME/.android/avd"
AVD_NAME="POS_Tablet"
PROJECT_DIR="/home/kira/Documents/Github/POS/POS-App"
EMULATOR_LOG="/tmp/emulator.log"

# Parse arguments
CLEAN_BUILD=false
RESTART_EMULATOR=false
SHOW_LOGS=false

for arg in "$@"; do
    case $arg in
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --restart)
            RESTART_EMULATOR=true
            shift
            ;;
        --logs)
            SHOW_LOGS=true
            shift
            ;;
        --help)
            echo "Usage: ./test-on-emulator.sh [options]"
            echo ""
            echo "Options:"
            echo "  --clean     Clean build (removes build cache)"
            echo "  --restart   Restart emulator before running"
            echo "  --logs      Show app logs after deployment"
            echo ""
            echo "Examples:"
            echo "  ./test-on-emulator.sh                 # Normal run"
            echo "  ./test-on-emulator.sh --clean         # Clean build"
            echo "  ./test-on-emulator.sh --restart       # Restart emulator"
            echo "  ./test-on-emulator.sh --clean --logs  # Clean build with logs"
            exit 0
            ;;
    esac
done

# Helper Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_disk_space() {
    AVAILABLE=$(df / | tail -1 | awk '{print $4}')
    AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))

    if [ $AVAILABLE_GB -lt 2 ]; then
        print_error "Low disk space: ${AVAILABLE_GB}GB available"
        print_warning "At least 2GB recommended for building"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Disk space: ${AVAILABLE_GB}GB available"
    fi
}

is_emulator_running() {
    pgrep -f "qemu-system.*$AVD_NAME" > /dev/null 2>&1
}

wait_for_emulator() {
    print_info "Waiting for emulator to boot..."
    local count=0
    local max_wait=60

    while [ $count -lt $max_wait ]; do
        if $ANDROID_HOME/platform-tools/adb devices 2>/dev/null | grep -q "emulator.*device$"; then
            print_success "Emulator is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        count=$((count + 1))
    done

    print_error "Emulator failed to start within ${max_wait} seconds"
    return 1
}

# Main Script
print_header "POS App - Android Tablet Testing"

# Check prerequisites
print_info "Checking prerequisites..."

if [ ! -d "$ANDROID_HOME" ]; then
    print_error "Android SDK not found at $ANDROID_HOME"
    exit 1
fi

if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found at $PROJECT_DIR"
    exit 1
fi

print_success "Prerequisites check passed"

# Set environment variables
export ANDROID_HOME
export ANDROID_AVD_HOME
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

# Check disk space
check_disk_space

# Handle emulator
print_header "Step 1: Emulator Setup"

if [ "$RESTART_EMULATOR" = true ]; then
    print_info "Restarting emulator..."
    if is_emulator_running; then
        print_info "Stopping existing emulator..."
        $ANDROID_HOME/platform-tools/adb -s emulator-5554 emu kill 2>/dev/null || pkill -9 qemu-system
        sleep 3
    fi
fi

if is_emulator_running; then
    print_success "Emulator is already running"

    # Check if connected via ADB
    if $ANDROID_HOME/platform-tools/adb devices 2>/dev/null | grep -q "emulator.*device$"; then
        print_success "Emulator is connected via ADB"
    else
        print_warning "Emulator running but not connected via ADB"
        print_info "Restarting ADB server..."
        $ANDROID_HOME/platform-tools/adb kill-server
        $ANDROID_HOME/platform-tools/adb start-server
        sleep 2
    fi
else
    print_info "Starting Android emulator: $AVD_NAME"

    # Start emulator in background
    /usr/lib/android-sdk/emulator/emulator -avd "$AVD_NAME" \
        -no-snapshot \
        -gpu swiftshader_indirect \
        -memory 1024 \
        > "$EMULATOR_LOG" 2>&1 &

    EMULATOR_PID=$!
    print_info "Emulator started (PID: $EMULATOR_PID)"

    # Wait for emulator to be ready
    if ! wait_for_emulator; then
        print_error "Failed to start emulator. Check logs: $EMULATOR_LOG"
        exit 1
    fi
fi

# Show connected devices
print_info "Connected devices:"
$ANDROID_HOME/platform-tools/adb devices

# Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
    print_header "Step 2: Cleaning Build Cache"
    print_info "Removing build artifacts..."

    cd "$PROJECT_DIR"
    rm -rf android/app/build android/.gradle .gradle node_modules/.cache 2>/dev/null || true

    print_success "Build cache cleaned"
fi

# Build and deploy app
print_header "Step 3: Building and Deploying App"
print_info "This may take 5-10 minutes on first build..."
print_info "Subsequent builds will be faster (2-3 minutes)"

cd "$PROJECT_DIR"

# Run build
if bun expo run:android; then
    print_success "App deployed successfully!"
else
    print_error "Build/deployment failed"
    print_info "Check the output above for errors"
    exit 1
fi

# Show logs if requested
if [ "$SHOW_LOGS" = true ]; then
    print_header "Step 4: App Logs"
    print_info "Showing app logs (Ctrl+C to exit)..."
    sleep 2
    $ANDROID_HOME/platform-tools/adb logcat | grep -E "ReactNative|Expo|POS|LOG"
fi

# Success message
print_header "🎉 Success!"
echo -e "${GREEN}POS App is now running on the emulator!${NC}\n"

print_info "Test Credentials:"
echo "  Restaurant Staff: EMP001 / staff123"
echo "  Manager: manager@foodcorner.com / manager123"
echo "  Admin: admin@foodcorner.com / admin123"

echo ""
print_info "Useful commands:"
echo "  View logs:        $ANDROID_HOME/platform-tools/adb logcat"
echo "  Stop emulator:    ./stop-emulator.sh"
echo "  Restart fresh:    ./test-on-emulator.sh --restart --clean"

echo ""
print_success "Happy testing! 🚀"
