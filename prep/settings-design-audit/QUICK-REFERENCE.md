# Settings Design Audit - Quick Reference

**Use this for rapid lookup during implementation**

---

## 🚨 CRITICAL RULES (MUST FOLLOW)

### Rule 1: NEVER use direct theme import
```typescript
// ❌ FORBIDDEN
import { theme } from '@/constants/theme';

// ✅ REQUIRED
import { useTheme } from '@/hooks/useTheme';
const { theme } = useTheme(); // Inside component
```

### Rule 2: NEVER use hardcoded colors
```typescript
// ❌ FORBIDDEN
backgroundColor: '#E8F5E8'
color: '#2E7D32'
iconBackground: '#FF453A'

// ✅ REQUIRED
backgroundColor: theme.colors.successLight
color: theme.colors.success
iconBackground: theme.colors.error
```

### Rule 3: NEVER use emojis in UI
```typescript
// ❌ FORBIDDEN
icon: '🏪'
<Text>💾 Save</Text>

// ✅ REQUIRED
icon: 'store'
<Icon name="content-save" size={18} color={theme.colors.onSuccess} />
<Text>Save</Text>
```

### Rule 4: ALWAYS create StyleSheet inside component
```typescript
// ❌ FORBIDDEN
const styles = StyleSheet.create({ /* ... */ });
export default function Component() { /* ... */ }

// ✅ REQUIRED
export default function Component() {
  const { theme } = useTheme();
  const styles = StyleSheet.create({ /* ... */ });
  return <View style={styles.container}>...</View>;
}
```

---

## 📝 Files to Fix (Priority Order)

### Phase 1: CRITICAL (Must fix first)

1. **SettingsScreen.tsx**
   - Move SETTINGS_CATEGORIES inside component
   - Replace 8 hardcoded iconBackground colors
   - Replace 8 emojis with vector icons

2. **RestaurantProfileSettings.tsx**
   - Change import to useTheme hook
   - Move StyleSheet inside component
   - Fix 2 hardcoded colors

3. **UserManagementSettings.tsx**
   - Change import to useTheme hook
   - Move StyleSheet inside component
   - Fix 4 hardcoded colors

4. **PaymentConfigurationSettings.tsx**
   - Change import to useTheme hook
   - Move StyleSheet inside component

---

## 🎨 Color Mapping Cheat Sheet

| Hardcoded Color | Theme Replacement |
|----------------|-------------------|
| `#FF453A` | `theme.colors.error` |
| `#007AFF` | `theme.colors.info` |
| `#32D74B` | `theme.colors.success` |
| `#FF9500` | `theme.colors.warning` |
| `#BF5AF2` | `theme.colors.purple` |
| `#64D2FF` | `theme.colors.cyan` |
| `#8E8E93` | `theme.colors.onSurfaceVariant` |
| `#E8F5E8` | `theme.colors.successLight` |
| `#FFF3E0` | `theme.colors.warningLight` |
| `#2E7D32` | `theme.colors.success` |

---

## 🎯 Icon Mapping Cheat Sheet

| Emoji | Vector Icon Name | Library |
|-------|-----------------|---------|
| 🏪 | store | MaterialCommunityIcons |
| 👥 | account-group | MaterialCommunityIcons |
| 📱 | devices | MaterialCommunityIcons |
| 💳 | credit-card-outline | MaterialCommunityIcons |
| 🔗 | link-variant | MaterialCommunityIcons |
| 🔒 | shield-lock-outline | MaterialCommunityIcons |
| 📊 | chart-line | MaterialCommunityIcons |
| ❓ | help-circle-outline | MaterialCommunityIcons |
| 💾 | content-save | MaterialCommunityIcons |
| 🔄 | refresh | MaterialCommunityIcons |
| 📷 | camera-outline | MaterialCommunityIcons |
| 🔘 | checkbox-marked-circle | MaterialCommunityIcons |
| ⚪ | checkbox-blank-circle-outline | MaterialCommunityIcons |
| ⚠️ | alert-circle | MaterialCommunityIcons |
| 🔍 | magnify | MaterialCommunityIcons |
| 📅 | calendar-outline | MaterialCommunityIcons |
| 🌙 | weather-night | MaterialCommunityIcons |
| ☀️ | weather-sunny | MaterialCommunityIcons |

---

## 📦 Code Templates

### Template 1: Component Structure
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  onChangesDetected: (hasChanges: boolean) => void;
}

export default function ComponentName({ onChangesDetected }: Props) {
  // 1. Theme hook FIRST
  const { theme } = useTheme();

  // 2. State hooks
  const [state, setState] = useState();

  // 3. Handler functions
  const handleAction = () => { /* ... */ };

  // 4. StyleSheet AFTER theme hook
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
  });

  // 5. Render
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Content</Text>
    </View>
  );
}
```

### Template 2: Button with Icon
```typescript
<TouchableOpacity
  style={styles.button}
  onPress={handleAction}
  accessibilityLabel="Action description"
  accessibilityRole="button"
>
  <Icon name="icon-name" size={18} color={theme.colors.onPrimary} />
  <Text style={styles.buttonText}>Button Text</Text>
</TouchableOpacity>
```

### Template 3: Status Indicator
```typescript
<View style={styles.statusContainer}>
  <Icon
    name={status === 'active' ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
    size={16}
    color={status === 'active' ? theme.colors.success : theme.colors.onSurfaceVariant}
  />
  <Text style={[styles.statusText, {
    color: status === 'active' ? theme.colors.success : theme.colors.onSurfaceVariant
  }]}>
    {status === 'active' ? 'Active' : 'Inactive'}
  </Text>
</View>
```

---

## ✅ Pre-Commit Checklist

Before committing settings changes:

- [ ] No `import { theme }` statements (use useTheme hook)
- [ ] StyleSheet.create() is inside component (after useTheme)
- [ ] No hardcoded hex colors (#RRGGBB)
- [ ] No emojis in UI code
- [ ] All icons use theme.colors
- [ ] All icons have proper size (24px nav, 18px buttons, 16px status)
- [ ] Run `npm run type-check` (must pass)
- [ ] Run `npm run lint` (must pass)
- [ ] Test light mode rendering
- [ ] Test dark mode rendering
- [ ] Test theme toggle works

---

## 🧪 Quick Tests

### Test 1: No Hardcoded Colors
```bash
grep -r "#[0-9A-Fa-f]{6}" src/screens/settings/components/
# Expected: 0 matches
```

### Test 2: No Direct Theme Imports
```bash
grep -r "import.*{ theme }.*from '@/constants/theme'" src/screens/settings/
# Expected: 0 matches
```

### Test 3: Component Renders
```bash
npm start
# Navigate to Settings → Test each category
```

---

## 🆘 Common Mistakes

### Mistake 1: Forgot to move StyleSheet
**Symptom**: Dark mode doesn't work
**Fix**: Move StyleSheet.create() inside component after useTheme()

### Mistake 2: Mixed hardcoded and theme colors
**Symptom**: Some elements don't change color in dark mode
**Fix**: Replace ALL hardcoded colors with theme.colors

### Mistake 3: Icon not rendering
**Symptom**: Empty space where icon should be
**Fix**: Check icon name spelling, ensure react-native-vector-icons installed

### Mistake 4: SETTINGS_CATEGORIES outside component
**Symptom**: Can't access theme in array
**Fix**: Move entire array inside SettingsScreen component

---

## 📞 Where to Get Help

- **Theme hook questions**: See `03-THEME-HOOK-REFACTOR.md`
- **Icon replacement**: See `01-EMOJI-TO-ICON-MAPPING.md`
- **Color fixes**: See `02-COLOR-VIOLATIONS-CATALOG.md`
- **Examples**: See `07-BEFORE-AFTER-EXAMPLES.md`
- **Timeline**: See `06-IMPLEMENTATION-ROADMAP.md`

---

**Keep this document open while coding!**
