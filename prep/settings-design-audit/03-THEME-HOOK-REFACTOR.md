# Theme Hook Refactoring Guide

**Purpose**: Fix all components violating CLAUDE.md Theme Hook Pattern (MANDATORY)
**Rule**: NEVER use `import { theme }` - ALWAYS use `useTheme()` hook
**Priority**: CRITICAL - Automatic code rejection if violated

---

## The Critical Violation

### ❌ FORBIDDEN PATTERN (Current State)

```typescript
// ❌ WRONG: Direct theme import from constants
import { theme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
  },
});

export default function Component() {
  return <View style={styles.container}>...</View>;
}
```

**Why This is Wrong:**
1. ❌ Theme is evaluated at module load time (doesn't support dynamic theme switching)
2. ❌ Dark mode toggle won't work (theme is static)
3. ❌ StyleSheet created before component renders (no access to runtime theme)
4. ❌ Violates CLAUDE.md Component Structure Pattern (MANDATORY)

---

## The Correct Pattern

### ✅ REQUIRED PATTERN (Per CLAUDE.md)

```typescript
// ✅ CORRECT: Use useTheme hook
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function Component() {
  // 1. Theme hook FIRST (REQUIRED at component root)
  const { theme } = useTheme();

  // 2. State and other hooks
  const [state, setState] = useState();

  // 3. Event handlers
  const handleAction = () => { /* ... */ };

  // 4. StyleSheet AFTER theme hook (CRITICAL)
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface, // theme available here
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
  });

  // 5. JSX render
  return <View style={styles.container}>...</View>;
}
```

---

## Files Requiring Refactoring

### File 1: RestaurantProfileSettings.tsx

**Current Violations:**
- Line 13: Direct theme import
- Line 361: StyleSheet.create() at module level

#### Step-by-Step Fix

**Step 1: Update imports**
```typescript
// ❌ REMOVE THIS
import { theme } from '@/constants/theme';

// ✅ ADD THIS
import { useTheme } from '@/hooks/useTheme';
```

**Step 2: Add useTheme hook at component start**
```typescript
export default function RestaurantProfileSettings({ onChangesDetected }: RestaurantProfileSettingsProps) {
  // ✅ ADD THIS IMMEDIATELY at component root
  const { theme } = useTheme();

  // Existing state hooks remain below
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  // ... rest of hooks
```

**Step 3: Move StyleSheet.create() from line 361 into component**
```typescript
export default function RestaurantProfileSettings({ onChangesDetected }: RestaurantProfileSettingsProps) {
  const { theme } = useTheme(); // Hook first
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  // ... all other hooks

  // All handler functions
  const handleUpdateProfile = async () => { /* ... */ };
  const handleResetChanges = () => { /* ... */ };
  // ... all handlers

  // ✅ MOVE STYLESHEET HERE (before return statement)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary, // theme available
    },
    // ... all other styles
  });

  // Early returns for loading/error states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading restaurant profile...</Text>
      </View>
    );
  }

  // Main render
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ... existing JSX */}
    </ScrollView>
  );
}

// ❌ DELETE the StyleSheet that's currently at line 361 (outside component)
```

---

### File 2: UserManagementSettings.tsx

**Current Violations:**
- Line 13: Direct theme import
- Line 192: StyleSheet.create() at module level

#### Step-by-Step Fix

Follow same pattern as RestaurantProfileSettings:

```typescript
// ❌ REMOVE line 13
import { theme } from '@/constants/theme';

// ✅ ADD THIS instead
import { useTheme } from '@/hooks/useTheme';

export default function UserManagementSettings({ onChangesDetected }: UserManagementSettingsProps) {
  // ✅ ADD THIS FIRST
  const { theme } = useTheme();

  // Existing hooks
  const [users, setUsers] = useState<UserProfile[]>([]);
  // ... rest of hooks

  // All handler functions
  const loadUsers = async () => { /* ... */ };
  const handleAddUser = () => { /* ... */ };
  // ... all handlers

  // Helper functions
  const renderUserItem = ({ item }: { item: UserProfile }) => (
    // ... existing render logic
  );

  // ✅ MOVE STYLESHEET HERE (after all hooks and functions, before return)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary, // theme available
    },
    // ... all other styles with theme access
  });

  // Early returns
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      {/* ... existing JSX */}
    </View>
  );
}

// ❌ DELETE the StyleSheet currently at line 192
```

---

### File 3: PaymentConfigurationSettings.tsx

**Current Violations:**
- Line 12: Direct theme import
- Line 200: StyleSheet.create() at module level

#### Step-by-Step Fix

Same pattern:

```typescript
// ❌ REMOVE line 12
import { theme } from '@/constants/theme';

// ✅ ADD THIS
import { useTheme } from '@/hooks/useTheme';

export default function PaymentConfigurationSettings({ onChangesDetected }: PaymentConfigurationSettingsProps) {
  // ✅ ADD THIS FIRST
  const { theme } = useTheme();

  // Existing state
  const [config, setConfig] = useState<PaymentConfiguration>({ /* ... */ });

  // All handlers
  const handleMethodToggle = (method: string) => { /* ... */ };
  const handleConfigChange = (section: string, field: string, value: any) => { /* ... */ };
  const handleTestPayment = () => { /* ... */ };
  const handleSaveConfiguration = () => { /* ... */ };

  // ✅ MOVE STYLESHEET HERE
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text, // theme available
      marginBottom: 25,
    },
    // ... all other styles
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ... existing JSX */}
    </ScrollView>
  );
}

// ❌ DELETE the StyleSheet currently at line 200
```

---

### File 4: SettingsScreen.tsx

**Special Case**: This file uses useTheme correctly BUT has hardcoded colors in the SETTINGS_CATEGORIES array.

#### Current Issue

```typescript
// Line 26-75: Array defined OUTSIDE component
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    iconBackground: '#FF453A', // ❌ Can't use theme here (outside component)
  },
  // ...
];

export default function SettingsScreen() {
  const { theme, isDark } = useTheme(); // ✅ Hook is correct
  // ❌ But can't access theme in SETTINGS_CATEGORIES above
```

#### Solution: Move Array Inside Component

```typescript
export default function SettingsScreen() {
  const { theme, isDark } = useTheme(); // ✅ Hook first

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('restaurant_profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ✅ MOVE SETTINGS_CATEGORIES INSIDE COMPONENT (after useTheme)
  const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
    {
      id: 'restaurant_profile',
      label: 'Restaurant Profile',
      icon: 'store', // Vector icon
      iconBackground: theme.colors.error, // ✅ Can access theme now
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: 'account-group',
      iconBackground: theme.colors.info, // ✅ Theme available
    },
    // ... all other categories with theme.colors
  ];

  // Rest of component logic
  const handleCategoryChange = (category: SettingsCategory) => { /* ... */ };
  // ...
}

// ❌ DELETE the SETTINGS_CATEGORIES constant from lines 26-75 (outside component)
```

---

## Complete Refactoring Checklist

### For Each File:

#### RestaurantProfileSettings.tsx
- [ ] Line 13: Change import from `{ theme }` to `{ useTheme }`
- [ ] Add `const { theme } = useTheme();` at component start (before all state)
- [ ] Move StyleSheet.create() from line 361 to inside component (before return)
- [ ] Delete old StyleSheet that's outside component
- [ ] Fix hardcoded colors (use theme.colors)
- [ ] Test component renders correctly
- [ ] Test dark mode toggle works

#### UserManagementSettings.tsx
- [ ] Line 13: Change import from `{ theme }` to `{ useTheme }`
- [ ] Add `const { theme } = useTheme();` at component start
- [ ] Move StyleSheet.create() from line 192 to inside component
- [ ] Delete old StyleSheet outside component
- [ ] Fix hardcoded colors (use theme.colors)
- [ ] Test component renders correctly
- [ ] Test dark mode toggle works

#### PaymentConfigurationSettings.tsx
- [ ] Line 12: Change import from `{ theme }` to `{ useTheme }`
- [ ] Add `const { theme } = useTheme();` at component start
- [ ] Move StyleSheet.create() from line 200 to inside component
- [ ] Delete old StyleSheet outside component
- [ ] Test component renders correctly
- [ ] Test dark mode toggle works

#### SettingsScreen.tsx
- [ ] Move SETTINGS_CATEGORIES array from lines 26-75 into component
- [ ] Replace all hardcoded iconBackground colors with theme.colors
- [ ] Test component renders correctly
- [ ] Test dark mode toggle works

---

## Performance Considerations

### ⚠️ Common Concern: "Won't StyleSheet.create() inside component recreate styles on every render?"

**Answer**: No, React Native optimizes StyleSheet.create() internally.

**However, for maximum performance, you can memoize:**

```typescript
export default function Component() {
  const { theme } = useTheme();

  // Option 1: useMemo for styles (if performance is critical)
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
    },
  }), [theme]); // Recreate only when theme changes

  return <View style={styles.container}>...</View>;
}
```

**Recommendation**: Start without useMemo. Only add if profiling shows performance issues.

---

## Testing After Refactoring

### Test 1: Component Renders in Light Mode
```bash
# Run component in light mode
npm start
# Navigate to Settings
# Verify all styles render correctly
```

### Test 2: Component Renders in Dark Mode
```bash
# Toggle to dark mode
# Navigate to Settings
# Verify all styles adapt to dark theme
# Check no hardcoded colors visible
```

### Test 3: Theme Toggle Works
```bash
# In Settings, go to Device & Hardware
# Toggle dark mode switch
# Verify instant theme change
# No console errors
# No flash of unstyled content
```

### Test 4: TypeScript Validation
```bash
npm run type-check
# Should pass with no errors
```

### Test 5: ESLint Validation
```bash
npm run lint
# Should pass with no errors
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting to move StyleSheet inside component
```typescript
// ❌ WRONG: StyleSheet still outside
const styles = StyleSheet.create({ /* ... */ });

export default function Component() {
  const { theme } = useTheme(); // Hook added but styles still outside
  return <View style={styles.container}>...</View>;
}
```

### ❌ Mistake 2: Moving StyleSheet but not moving style definitions
```typescript
export default function Component() {
  const { theme } = useTheme();

  // ❌ WRONG: Empty StyleSheet.create() inside
  const styles = StyleSheet.create({});

  return <View style={styles.container}>...</View>;
}

// ❌ Old styles still outside
const styles = StyleSheet.create({ /* ... */ });
```

### ❌ Mistake 3: Not deleting old StyleSheet
```typescript
export default function Component() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({ /* ... */ }); // New one inside

  return <View style={styles.container}>...</View>;
}

// ❌ Old StyleSheet still exists outside (duplicate variable name error)
const styles = StyleSheet.create({ /* ... */ });
```

---

## Verification Script

```bash
# After refactoring, verify no direct theme imports remain
grep -r "import.*{ theme }.*from '@/constants/theme'" src/screens/settings/

# Expected: No matches

# Verify all StyleSheets are inside components (harder to automate, manual review needed)
```

---

**Total Files to Refactor**: 4 files
**Estimated Time per File**: 30-45 minutes
**Total Estimated Time**: 2-3 hours
**Priority**: CRITICAL
