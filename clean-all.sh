#!/bin/bash

##############################################################################
# Clean All Build Artifacts and Caches
# Usage: ./clean-all.sh
# WARNING: This will remove all build caches and node_modules
##############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/kira/Documents/Github/POS/POS-App"

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header "Clean All Build Artifacts"

print_warning "This will remove:"
echo "  - Android build folders"
echo "  - Gradle cache"
echo "  - Node modules cache"
echo "  - Expo cache"
echo ""

read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cancelled"
    exit 0
fi

cd "$PROJECT_DIR"

# Clean Android build
print_info "Cleaning Android build artifacts..."
rm -rf android/app/build
rm -rf android/.gradle
rm -rf .gradle
print_success "Android artifacts cleaned"

# Clean node modules cache
print_info "Cleaning node modules cache..."
rm -rf node_modules/.cache
print_success "Node modules cache cleaned"

# Clean Expo cache
print_info "Cleaning Expo cache..."
rm -rf .expo
print_success "Expo cache cleaned"

# Clean Metro bundler cache
print_info "Cleaning Metro bundler cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
print_success "Metro cache cleaned"

# Show disk space freed
print_header "Cleanup Complete"
print_success "All caches cleaned!"
print_info "Run './test-on-emulator.sh' to rebuild and test"

# Show current disk space
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))
print_info "Available disk space: ${AVAILABLE_GB}GB"
