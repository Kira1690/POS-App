# Manual ADB Testing Guide

> Maestro is too slow and unreliable. Use this guide for manual ADB-based QA runs.
> All interactive elements have `testID` props — see `testid-reference.md`.

---

## Setup

```bash
# Start POS_Tablet emulator (landscape 1280x800)
ANDROID_SDK_ROOT=~/Android/Sdk ~/Android/Sdk/emulator/emulator -avd POS_Tablet &

# Enable auto-rotate
adb shell settings put system accelerometer_rotation 1

# Start Expo server (port 8081)
cd ~/Documents/Github/POS/POS-App
bun expo start --clear

# Launch app
adb shell am start -a android.intent.action.VIEW -d "exp://192.168.1.9:8081"
```

---

## Core Commands

### Screenshots
```bash
# Capture to local file
adb shell screencap /sdcard/screen.png && adb pull /sdcard/screen.png /tmp/screen.png

# Quick alias (add to ~/.bashrc)
alias ss='adb shell screencap /sdcard/s.png && adb pull /sdcard/s.png /tmp/s.png && echo /tmp/s.png'
```

### Tap by coordinates
```bash
# Portrait coords: 800w x 1280h
adb shell input tap X Y

# Landscape coords: 1280w x 800h
adb shell input tap X Y
```

### Text input
```bash
# Type text into focused field
adb shell input text "EMP001"

# Clear field first (select all + delete)
adb shell input keyevent KEYCODE_CTRL_A
adb shell input keyevent KEYCODE_DEL

# Submit / keyboard Done button
adb shell input keyevent KEYCODE_ENTER
```

### Scroll
```bash
# Swipe up (scroll down)
adb shell input swipe 640 800 640 400 300

# Swipe down (scroll up)
adb shell input swipe 640 400 640 800 300
```

### Key events
```bash
adb shell input keyevent KEYCODE_BACK     # Back button
adb shell input keyevent KEYCODE_HOME     # Home button
adb shell input keyevent KEYCODE_ENTER    # Enter / Done
```

---

## Finding Coordinates

1. Take a screenshot: `ss`
2. Open in image viewer: `eog /tmp/s.png`
3. Hover to read pixel coordinates
4. Portrait emulator: width=800, height=1280

---

## ADB Selector by testID

React Native `testID` maps to Android `content-desc` in instrumented tests,
but for manual ADB tapping, use coordinates from screenshots.

For Maestro automation:
```yaml
- tapOn:
    id: "btn-apply-discount"
```

For manual:
```bash
# First screenshot to find coords, then:
adb shell input tap 400 900
```

---

## Common Test Flows — Quick Commands

### Login as Staff
```bash
adb shell input tap 400 400   # tap Employee ID field
adb shell input text "EMP001"
adb shell input tap 400 600   # tap Password field
adb shell input text "staff123"
adb shell input tap 400 800   # tap Login button
```

### Navigate tabs
```bash
# Tab bar is at bottom: y ≈ 1220 (portrait)
# Dashboard: x ≈ 100
# Orders: x ≈ 300
# Kitchen: x ≈ 500
# Settings: x ≈ 700
adb shell input tap 100 1220  # Dashboard
adb shell input tap 300 1220  # Orders
adb shell input tap 500 1220  # Kitchen
adb shell input tap 700 1220  # Settings
```

---

## Emulator Control

```bash
# Kill all Metro/Expo processes
pkill -9 -f "expo\|metro"

# Clear caches
rm -rf node_modules/.cache .expo

# Restart with clean cache
bun expo start --clear

# Wipe emulator data (nuclear option)
~/Android/Sdk/emulator/emulator -avd POS_Tablet -wipe-data
```
