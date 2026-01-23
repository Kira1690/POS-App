# 🚀 POS App - Testing Guide

Quick reference for testing the POS application on Android tablet emulator.

## 📋 Available Scripts

### Main Testing Script
```bash
./test-on-emulator.sh
```
Starts emulator (if not running) and deploys the app.

**Options:**
- `--clean` - Clean build (removes cache)
- `--restart` - Restart emulator before running
- `--logs` - Show app logs after deployment

**Examples:**
```bash
./test-on-emulator.sh                    # Normal run
./test-on-emulator.sh --clean            # Clean build
./test-on-emulator.sh --restart          # Restart emulator first
./test-on-emulator.sh --clean --logs     # Clean build + show logs
```

---

### Helper Scripts

#### Stop Emulator
```bash
./stop-emulator.sh
```
Stops the Android emulator gracefully.

#### View Logs
```bash
./view-logs.sh              # All logs
./view-logs.sh error        # Only errors
./view-logs.sh auth         # Auth-related logs
```
View real-time app logs with color coding.

#### Clean Everything
```bash
./clean-all.sh
```
Removes all build caches and artifacts (requires confirmation).

---

## 🎯 Quick Start

### First Time Setup
```bash
# Make scripts executable
chmod +x *.sh

# Run the app
./test-on-emulator.sh
```

### Daily Testing
```bash
# If emulator is already running
./test-on-emulator.sh

# If you made code changes
./test-on-emulator.sh --clean
```

### Troubleshooting
```bash
# Complete fresh start
./stop-emulator.sh
./clean-all.sh
./test-on-emulator.sh --restart --clean
```

---

## 📱 Test Credentials

### Restaurant Staff
- **Employee ID:** `EMP001`
- **Password:** `staff123`
- **Access:** Order management, tables, payments

### Manager
- **Email:** `manager@foodcorner.com`
- **Password:** `manager123`
- **Access:** Staff features + menu, reports, settings

### Admin
- **Email:** `admin@foodcorner.com`
- **Password:** `admin123`
- **Access:** Full system access

---

## ⏱️ Expected Timings

| Action | Time |
|--------|------|
| Emulator Start | 30-40 seconds |
| First Build | 5-10 minutes |
| Subsequent Builds | 2-3 minutes |
| Clean Build | 5-10 minutes |
| App Launch | ~30 seconds |

---

## 🐛 Common Issues

### Issue: "No space left on device"
**Solution:**
```bash
./clean-all.sh
# Or manually clean Gradle cache:
rm -rf ~/.gradle/caches/*
```

### Issue: Emulator not starting
**Solution:**
```bash
./stop-emulator.sh
./test-on-emulator.sh --restart
```

### Issue: Build fails
**Solution:**
```bash
./clean-all.sh
./test-on-emulator.sh --clean
```

### Issue: App crashes on launch
**Solution:**
```bash
# View logs to see the error
./view-logs.sh error

# Or rebuild
./test-on-emulator.sh --clean
```

---

## 📦 Manual Commands (if needed)

### Start Emulator Only
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_AVD_HOME=$HOME/.android/avd
/usr/lib/android-sdk/emulator/emulator -avd POS_Tablet -no-snapshot \
  -gpu swiftshader_indirect -memory 1024 > /tmp/emulator.log 2>&1 &
```

### Build Only (emulator must be running)
```bash
cd /home/kira/Documents/Github/POS/POS-App
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
bun expo run:android
```

### Check Emulator Status
```bash
$HOME/Android/Sdk/platform-tools/adb devices
```

---

## 💡 Tips

1. **Keep emulator running** between tests - it's faster
2. **First build always takes longest** - be patient
3. **Use `--clean` sparingly** - only when needed
4. **Monitor disk space** - builds need ~3-5GB free
5. **View logs** to debug issues quickly

---

## 🎓 Testing Workflow

### Basic Flow
1. Start emulator: `./test-on-emulator.sh`
2. Test the app in emulator window
3. View logs if needed: `./view-logs.sh`
4. Stop when done: `./stop-emulator.sh`

### Development Flow (with code changes)
1. Make code changes
2. Rebuild: `./test-on-emulator.sh --clean`
3. Test changes
4. View logs: `./view-logs.sh`
5. Repeat

### Fresh Start Flow (when having issues)
1. Stop everything: `./stop-emulator.sh`
2. Clean all: `./clean-all.sh`
3. Fresh start: `./test-on-emulator.sh --restart --clean`

---

## 📞 Need Help?

Check the logs first:
```bash
./view-logs.sh error
```

Or view emulator logs:
```bash
tail -f /tmp/emulator.log
```

---

**Happy Testing! 🚀**
