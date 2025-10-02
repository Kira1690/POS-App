# POS App Troubleshooting Guide

## 🚨 CRITICAL ERRORS

### 1. "Cannot read property 'colors' of undefined"

**Severity:** CRITICAL - Has caused extreme havoc in the past

**Error Message:**
```
ERROR [runtime not ready]: TypeError: Cannot read property 'colors' of undefined
```

**Symptoms:**
- App crashes on startup or when navigating to certain screens
- Runtime error mentioning `theme.colors` or `theme.spacing`
- White screen with error overlay
- Metro bundler shows the error continuously

---

### Root Causes and Fixes

#### Cause 1: Missing Theme Export (MOST COMMON ⭐)

**Problem:** Components import `{ theme }` but it's not exported from theme.ts

**Diagnosis:**
```bash
# Check if theme is exported
grep "export.*theme" src/constants/theme.ts

# Should show: export const theme = ProfessionalTheme;
# If not found, this is your problem!
```

**Fix:**
1. Open `/src/constants/theme.ts`
2. Add at the end of the file:
   ```typescript
   // Default theme export for backward compatibility
   export const theme = ProfessionalTheme;
   ```
3. Kill Metro bundler: `pkill -9 -f "expo\|metro"`
4. Clear caches: `rm -rf node_modules/.cache .expo`
5. Restart: `bun expo start --clear`

**Why This Happens:**
Legacy components import `{ theme }` directly from constants/theme.ts for module-level StyleSheet definitions. If this export is missing, theme is undefined.

---

#### Cause 2: Missing ThemeProvider Wrapper

**Problem:** Components use `useTheme()` hook but aren't wrapped in ThemeProvider

**Diagnosis:**
```bash
# Check App.tsx provider chain
grep -A10 "ThemeProvider" App.tsx

# Should show ThemeProvider wrapping NavigationContainer
```

**Fix:**
Ensure `App.tsx` has correct provider hierarchy:
```typescript
<ThemeProvider>
  <AuthProvider>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </AuthProvider>
</ThemeProvider>
```

**Why This Happens:**
React Context requires Provider to be an ancestor of all consuming components. If a new provider is added in the wrong order, theme context becomes undefined.

---

#### Cause 3: Export/Import Pattern Mismatch

**Problem:** Component exports as `export const` but imported as default, or vice versa

**Diagnosis:**
```bash
# Check component exports
grep -n "export" src/screens/settings/components/YourComponent.tsx

# Check how it's imported
grep "import.*YourComponent" src/screens/settings/components/index.ts
```

**Fix:**
**Settings components MUST use default exports:**
```typescript
// ✅ CORRECT
const MySettingsComponent: React.FC<Props> = (props) => { ... };
export default MySettingsComponent;

// And import as:
export { default as MySettingsComponent } from './MySettingsComponent';
```

```typescript
// ❌ WRONG
export const MySettingsComponent: React.FC<Props> = (props) => { ... };

// This causes undefined imports!
```

**Why This Happens:**
When export pattern doesn't match import pattern, the imported value is undefined. Accessing `.colors` on undefined crashes.

---

#### Cause 4: StyleSheet at Module Level

**Problem:** StyleSheet.create() used at module level (outside component) with theme

**Diagnosis:**
```bash
# Find module-level StyleSheets
grep -B10 "const styles = StyleSheet.create" src/screens/settings/components/*.tsx | grep -A5 "import.*theme"
```

**Fix:**
Move StyleSheet inside component:
```typescript
// ❌ WRONG - at module level
import { theme } from '@/constants/theme';
const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.surface }
});

// ✅ CORRECT - inside component
const MyComponent = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.surface }
  });

  return <View style={styles.container} />;
};
```

**Why This Happens:**
Module-level code executes during import, before React context is initialized. Theme is undefined at that time.

---

## Quick Fix Flowchart

```
1. Add export const theme = ProfessionalTheme; to theme.ts
   ↓
2. Kill all Metro processes: pkill -9 -f "expo\|metro"
   ↓
3. Clear all caches: rm -rf node_modules/.cache .expo android/app/build
   ↓
4. Restart Metro: bun expo start --clear
   ↓
5. Still failing? Check App.tsx provider hierarchy
   ↓
6. Still failing? Check component export/import patterns
   ↓
7. Still failing? Search for module-level StyleSheet with theme
```

---

## Prevention Checklist

When adding new components or modifying theme:

- [ ] Always export `theme` from theme.ts
- [ ] Never use StyleSheet.create() at module level with theme
- [ ] Always use default exports for settings components
- [ ] Always match export/import patterns
- [ ] Keep ThemeProvider as root-level wrapper
- [ ] Use `useTheme()` hook for dynamic theming
- [ ] Clear cache after theme.ts modifications

---

## Other Common Errors

### Metro Bundler Cache Issues

**Symptoms:** Changes not reflected, stale imports, random crashes

**Fix:**
```bash
# Nuclear option - clear everything
pkill -9 -f "expo\|metro"
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android/app/build
rm -rf ios/build
bun expo start --clear
```

### Port Already in Use

**Symptoms:** Metro won't start, port 8081 in use

**Fix:**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
bun expo start --port 8082 --clear
```

### TypeScript Errors After Theme Changes

**Symptoms:** TS errors about missing properties on theme

**Fix:**
1. Restart TypeScript server in VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Run type check: `npm run type-check`
3. If persistent, regenerate types: `rm -rf node_modules/.cache && npm install`

---

## Emergency Recovery

If nothing works and you need to restore working state:

```bash
# 1. Stash all changes
git stash

# 2. Clean everything
rm -rf node_modules .expo android/app/build
rm -rf node_modules/.cache

# 3. Reinstall
npm install

# 4. Clear and restart
bun expo start --clear

# 5. If working, carefully reapply changes one by one
git stash pop
```

---

## Getting Help

If this guide doesn't solve your issue:

1. Check git history for recent theme.ts changes: `git log -p src/constants/theme.ts`
2. Compare with last working commit: `git diff <commit-hash> src/constants/theme.ts`
3. Search codebase for theme imports: `grep -r "import.*theme" src/`
4. Check this guide is up to date in CLAUDE.md

**Last Updated:** 2025-10-02
**Error Last Occurred:** 2025-10-02 (Fixed by adding theme export)
