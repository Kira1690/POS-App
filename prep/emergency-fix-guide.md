# EMERGENCY FIX GUIDE
**TypeError: property is not configurable**

🚨 **CRITICAL**: Execute these fixes in exact order to resolve runtime error

---

## STEP 1: VERSION ROLLBACK (CRITICAL - 30 minutes)

### Fix React Version Incompatibility
```bash
# Navigate to project directory
cd /home/kira/Documents/GitHub/Food-Application/POS-App

# CRITICAL: Rollback React to compatible version
npm install react@18.2.0 react-dom@18.2.0 --save

# Update React Native to more compatible version
npm install react-native@0.73.6 --save

# Rollback Reanimated to compatible version
npm install react-native-reanimated@3.8.1 --save

# Update Expo SDK to compatible version
npm install expo@~52.0.0 --save

# Clear all caches
npm run clean
rm -rf node_modules
npm install
```

### Verify Package Compatibility
```bash
# Check versions after rollback
cat package.json | grep -E "(react|expo)"

# Expected output:
# "react": "18.2.0",
# "react-native": "0.73.6",
# "expo": "~52.0.0",
# "react-native-reanimated": "3.8.1",
```

---

## STEP 2: FIX OBJECT.DEFINEPROPERTY CONFLICT (15 minutes)

### Replace Problematic Test Code
**File**: `src/utils/__tests__/performance.test.ts`

**REMOVE LINES 18-21:**
```typescript
// REMOVE THIS PROBLEMATIC CODE
Object.defineProperty(global, 'performance', {
  writable: true,
  value: mockPerformance,
});
```

**REPLACE WITH SAFE MOCK:**
```typescript
// SAFE PROPERTY MOCKING
const originalPerformance = global.performance;

beforeEach(() => {
  // Safe assignment without property descriptors
  (global as any).performance = mockPerformance;
  performanceMonitor.clearMetrics();
  jest.clearAllMocks();
  mockPerformance.now.mockReturnValue(0);
});

afterEach(() => {
  // Restore original performance object
  (global as any).performance = originalPerformance;
});
```

---

## STEP 3: CREATE METRO CONFIGURATION (10 minutes)

### Add Missing Metro Config
**Create**: `metro.config.js` in project root

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent property descriptor conflicts
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle React Native compatibility
config.resolver.alias = {
  'react-native-svg': 'react-native-svg',
  'react-native-reanimated': 'react-native-reanimated',
};

// Transformer configuration for property safety
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_descriptors: true, // Preserve property descriptors
  },
};

module.exports = config;
```

---

## STEP 4: UPDATE BABEL CONFIGURATION (5 minutes)

### Fix Babel Plugin Order
**Update**: `babel.config.js`

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // CRITICAL: Reanimated plugin must be LAST
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/context': './src/context',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@/navigation': './src/navigation',
            '@/assets': './src/assets',
          },
        },
      ],
      'react-native-reanimated/plugin', // MUST BE LAST
    ],
  };
};
```

---

## STEP 5: CLEAR ALL CACHES (5 minutes)

### Nuclear Cache Clear
```bash
# Clear React Native caches
npx react-native start --reset-cache

# Clear Expo caches
expo start --clear

# Clear npm caches
npm cache clean --force

# Clear Babel cache
rm -rf .babel-cache

# Clear Metro cache
rm -rf /tmp/metro-*

# Clear Node modules (nuclear option)
rm -rf node_modules
npm install
```

---

## STEP 6: TEST APPLICATION LAUNCH (10 minutes)

### Validation Commands
```bash
# Start Metro bundler with clean slate
expo start --clear

# In separate terminal, check for errors
npx react-native log-android 2>&1 | grep -i "property.*configurable"

# Expected output: No property configurable errors
```

### Success Indicators
- ✅ Metro bundler starts without errors
- ✅ App launches on device/simulator
- ✅ No "property is not configurable" errors in logs
- ✅ Core functionality works (login, navigation)

---

## STEP 7: VERIFY FIXES (15 minutes)

### Component-Level Testing
```bash
# Test each major component loads
# 1. Authentication screens
# 2. Dashboard
# 3. Table management
# 4. Order processing
```

### Performance Validation
```bash
# Check React Native info
npx react-native info

# Verify no property descriptor warnings
npx react-native log-android | head -50
```

---

## EMERGENCY ROLLBACK (If fixes fail)

### If Version Rollback Causes Issues
```bash
# Restore original versions
git checkout package.json
git checkout package-lock.json
npm install

# Try alternative compatible versions
npm install react@18.0.0 react-native@0.72.10
```

### If Test Fix Causes Issues
```bash
# Temporarily disable performance tests
mv src/utils/__tests__/performance.test.ts src/utils/__tests__/performance.test.ts.disabled

# Run app without test conflicts
expo start --clear
```

---

## MONITORING AFTER FIXES

### Log Monitoring
```bash
# Monitor for property descriptor issues
tail -f ~/.expo/logs/* | grep -i "property"

# Monitor for React compatibility issues
npx react-native log-android | grep -i "react.*version"
```

### Performance Checks
- App startup time < 5 seconds
- Component render time < 16ms
- Memory usage stable
- No crashes during navigation

---

## SUCCESS CRITERIA CHECKLIST

- [ ] Package versions rolled back to compatible set
- [ ] Object.defineProperty test code replaced with safe mocking
- [ ] Metro configuration added with property descriptor safety
- [ ] Babel plugin order corrected (Reanimated last)
- [ ] All caches cleared
- [ ] App launches without runtime errors
- [ ] Navigation works between screens
- [ ] No property configurable errors in logs
- [ ] Performance within acceptable ranges

---

## POST-FIX ACTIONS

### Immediate (next 2 hours)
1. Test all major user flows
2. Check memory usage patterns
3. Monitor error logging
4. Document working configuration

### Short-term (next week)
1. Complete StyleSheet migration for remaining 89 files
2. Implement version compatibility checks
3. Add automated property descriptor validation
4. Update team documentation

### Long-term (next month)
1. Establish dependency update process
2. Implement compatibility testing pipeline
3. Create property descriptor safety guidelines
4. Plan React Native version upgrade strategy

---

**CRITICAL NOTE**: Execute steps 1-6 in exact order. Do not skip steps. Each step builds on the previous one to resolve the property descriptor conflicts.

**Emergency Contact**: If fixes fail, immediately rollback all changes and contact senior architect.

**Estimated Total Time**: 75 minutes for complete fix and validation.