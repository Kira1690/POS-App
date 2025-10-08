# Sidebar State Reset Instructions

## Issue
The sidebar was previously saved in collapsed state. To reset it to expanded (default) state:

## Quick Fix

### Option 1: Clear App Data (Recommended)
1. Close the app completely
2. Clear app data/cache:
   - **Android**: Settings → Apps → Expo Go → Storage → Clear Data
   - **iOS**: Delete app and reinstall
3. Restart the app
4. Sidebar will now default to expanded state

### Option 2: Use Expo Developer Menu
1. In the running app, shake the device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Reload"
3. The sidebar should now start in expanded state

### Option 3: Programmatic Clear (Already Fixed)
The code has been updated to:
- Respect the `defaultCollapsed={false}` prop
- Return `null` from AsyncStorage when no saved state exists
- Use default value when `null` is returned

## What Was Changed

### 1. Fixed `sidebarHelpers.ts`
```typescript
// Before: Always returned boolean
export const loadSidebarState = async (): Promise<boolean>

// After: Returns null when no saved state
export const loadSidebarState = async (): Promise<boolean | null>
```

### 2. Fixed `AppleSidebarCollapsible.tsx`
```typescript
// Now respects defaultCollapsed prop
const initialCollapsed = savedCollapsed !== null ? savedCollapsed : defaultCollapsed;
```

### 3. Reduced Whitespace in `SettingsScreen.tsx`
- Reduced `paddingHorizontal` from 24 to 12
- Reduced `paddingTop` from 24 to 12
- Reduced `gap` from 20 to 12
- Reduced breadcrumb `paddingVertical` from 12 to 8

## Testing
After clearing app data:
1. Open Settings
2. Sidebar should be **expanded** (280px wide)
3. Click chevron icon to collapse (64px wide)
4. Click again to expand
5. State should persist across Settings navigation

## Expected Behavior
- **First time opening Settings**: Expanded (280px)
- **After collapsing**: Collapsed state saved and persists
- **After expanding**: Expanded state saved and persists
- **After clearing app data**: Reset to expanded (default)
