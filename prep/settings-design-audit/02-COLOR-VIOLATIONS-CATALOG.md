# Color Violations Catalog

**Purpose**: Document all hardcoded color violations and provide theme-based replacements
**Rule**: Per CLAUDE.md - ALL colors MUST use theme.colors, NO hardcoded hex/rgb values

---

## Critical Color Violations by File

### 1. SettingsScreen.tsx

**Location**: Lines 26-74 (SETTINGS_CATEGORIES array)

#### ❌ CURRENT VIOLATIONS

```typescript
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    label: 'Restaurant Profile',
    icon: '🏪',
    iconBackground: '#FF453A', // ❌ FORBIDDEN - Hardcoded Apple red
  },
  {
    id: 'user_management',
    label: 'User Management',
    icon: '👥',
    iconBackground: '#007AFF', // ❌ FORBIDDEN - Hardcoded Apple blue
  },
  {
    id: 'device_hardware',
    label: 'Device & Hardware',
    icon: '📱',
    iconBackground: '#32D74B', // ❌ FORBIDDEN - Hardcoded Apple green
  },
  {
    id: 'payment_config',
    label: 'Payment Configuration',
    icon: '💳',
    iconBackground: '#FF9500', // ❌ FORBIDDEN - Hardcoded Apple orange
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: '🔗',
    iconBackground: '#BF5AF2', // ❌ FORBIDDEN - Hardcoded Apple purple
  },
  {
    id: 'security_backup',
    label: 'Security & Backup',
    icon: '🔒',
    iconBackground: '#64D2FF', // ❌ FORBIDDEN - Hardcoded Apple cyan
  },
  {
    id: 'system_logs',
    label: 'System Logs',
    icon: '📊',
    iconBackground: '#FF453A', // ❌ FORBIDDEN - Hardcoded Apple red
  },
  {
    id: 'help_support',
    label: 'Help & Support',
    icon: '❓',
    iconBackground: '#8E8E93', // ❌ FORBIDDEN - Hardcoded Apple gray
  },
];
```

#### ✅ CORRECTED VERSION

```typescript
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  const { theme } = useTheme(); // REQUIRED at component root

  // SETTINGS_CATEGORIES must be INSIDE component to access theme
  const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
    {
      id: 'restaurant_profile',
      label: 'Restaurant Profile',
      icon: 'store', // Vector icon name
      iconBackground: theme.colors.error, // ✅ Using theme error (red)
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: 'account-group',
      iconBackground: theme.colors.info, // ✅ Using theme info (blue)
    },
    {
      id: 'device_hardware',
      label: 'Device & Hardware',
      icon: 'devices',
      iconBackground: theme.colors.success, // ✅ Using theme success (green)
    },
    {
      id: 'payment_config',
      label: 'Payment Configuration',
      icon: 'credit-card-outline',
      iconBackground: theme.colors.warning, // ✅ Using theme warning (orange)
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'link-variant',
      iconBackground: theme.colors.purple, // ✅ Using theme purple
    },
    {
      id: 'security_backup',
      label: 'Security & Backup',
      icon: 'shield-lock-outline',
      iconBackground: theme.colors.cyan, // ✅ Using theme cyan
    },
    {
      id: 'system_logs',
      label: 'System Logs',
      icon: 'chart-line',
      iconBackground: theme.colors.error, // ✅ Using theme error (red)
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: 'help-circle-outline',
      iconBackground: theme.colors.onSurfaceVariant, // ✅ Using theme gray
    },
  ];

  // ... rest of component
}
```

**Changes Required:**
1. Move SETTINGS_CATEGORIES array INSIDE component function
2. Replace all hardcoded hex colors with theme.colors
3. Replace emojis with vector icon names

---

### 2. RestaurantProfileSettings.tsx

**Location**: Multiple violations throughout StyleSheet

#### ❌ CURRENT VIOLATIONS

```typescript
// Line 485-490
sameAsMonday: {
  backgroundColor: '#E8F5E8', // ❌ FORBIDDEN - Hardcoded light green
  borderRadius: 15,
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderWidth: 1,
  borderColor: theme.colors.success, // ⚠️ Mixed hardcoded and theme
},

// Line 492-495
sameAsMondayText: {
  fontSize: 11,
  color: '#2E7D32', // ❌ FORBIDDEN - Hardcoded dark green
},
```

#### ✅ CORRECTED VERSION

```typescript
// Inside component, after useTheme() hook
const styles = StyleSheet.create({
  sameAsMonday: {
    backgroundColor: theme.colors.successLight, // ✅ Using theme successLight
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: theme.colors.success, // ✅ Consistent theme usage
  },
  sameAsMondayText: {
    fontSize: 11,
    color: theme.colors.success, // ✅ Using theme success for text
  },
});
```

**Additional Issues in This File:**
- StyleSheet.create() at LINE 361 (module level) - MUST move inside component
- Direct theme import at LINE 13 - MUST use useTheme() hook instead

---

### 3. UserManagementSettings.tsx

**Location**: Lines 330-342 (role tag styling)

#### ❌ CURRENT VIOLATIONS

```typescript
// Lines 330-339
roleTagmanager: {
  backgroundColor: '#FFF3E0', // ❌ FORBIDDEN - Hardcoded light orange
  borderColor: theme.colors.warning,
  borderWidth: 1,
},
roleTagstaff: {
  backgroundColor: '#E8F5E8', // ❌ FORBIDDEN - Hardcoded light green
  borderColor: theme.colors.success,
  borderWidth: 1,
},

// Lines 399-404
permissionToggleActive: {
  backgroundColor: '#E8F5E8', // ❌ FORBIDDEN - Hardcoded light green
  borderColor: theme.colors.success,
},
permissionToggleText: {
  fontSize: 10,
  color: '#2E7D32', // ❌ FORBIDDEN - Hardcoded dark green
},
```

#### ✅ CORRECTED VERSION

```typescript
// Move StyleSheet.create() inside component after useTheme()
const styles = StyleSheet.create({
  roleTagmanager: {
    backgroundColor: theme.colors.warningLight, // ✅ Using theme warningLight
    borderColor: theme.colors.warning,
    borderWidth: 1,
  },
  roleTagstaff: {
    backgroundColor: theme.colors.successLight, // ✅ Using theme successLight
    borderColor: theme.colors.success,
    borderWidth: 1,
  },
  permissionToggleActive: {
    backgroundColor: theme.colors.successLight, // ✅ Using theme successLight
    borderColor: theme.colors.success,
  },
  permissionToggleText: {
    fontSize: 10,
    color: theme.colors.success, // ✅ Using theme success
  },
});
```

---

### 4. PaymentConfigurationSettings.tsx

**No hardcoded color violations detected** ✅ (but still has theme import violation at line 12)

---

## Theme Color Mapping Reference

### Light Background Colors (for badges, tags, highlights)

| Hardcoded Color | Theme Replacement | Usage Context |
|----------------|-------------------|---------------|
| `#E8F5E8` | `theme.colors.successLight` | Success state backgrounds |
| `#FFF3E0` | `theme.colors.warningLight` | Warning state backgrounds |
| `#FFEBEE` | `theme.colors.errorLight` | Error state backgrounds |
| `#E3F2FD` | `theme.colors.infoLight` | Info state backgrounds |
| `#FFF4E6` | `theme.colors.warningLight` | Alternative warning bg |

### Dark Text Colors (for emphasized text)

| Hardcoded Color | Theme Replacement | Usage Context |
|----------------|-------------------|---------------|
| `#2E7D32` | `theme.colors.success` | Success state text |
| `#E65100` | `theme.colors.warning` | Warning state text |
| `#C62828` | `theme.colors.error` | Error state text |
| `#1565C0` | `theme.colors.info` | Info state text |

### Icon Background Colors

| Hardcoded Color | Theme Replacement | Apple Reference |
|----------------|-------------------|-----------------|
| `#FF453A` | `theme.colors.error` | Apple Red |
| `#007AFF` | `theme.colors.info` | Apple Blue |
| `#32D74B` | `theme.colors.success` | Apple Green |
| `#FF9500` | `theme.colors.warning` | Apple Orange |
| `#BF5AF2` | `theme.colors.purple` | Apple Purple |
| `#64D2FF` | `theme.colors.cyan` | Apple Cyan |
| `#8E8E93` | `theme.colors.onSurfaceVariant` | Apple Gray |

---

## Verification Checklist

Use this checklist to verify all color violations are fixed:

### Per File:

#### SettingsScreen.tsx
- [ ] All 8 hardcoded iconBackground colors replaced with theme colors
- [ ] SETTINGS_CATEGORIES array moved inside component function
- [ ] useTheme() hook added at component root
- [ ] All emojis replaced with vector icons

#### RestaurantProfileSettings.tsx
- [ ] Line 13: Replace `import { theme }` with `import { useTheme }`
- [ ] Add `const { theme } = useTheme();` at component root
- [ ] Move StyleSheet.create() from line 361 to inside component (after useTheme)
- [ ] Line 485: Replace `#E8F5E8` with `theme.colors.successLight`
- [ ] Line 494: Replace `#2E7D32` with `theme.colors.success`

#### UserManagementSettings.tsx
- [ ] Line 13: Replace `import { theme }` with `import { useTheme }`
- [ ] Add `const { theme } = useTheme();` at component root
- [ ] Move StyleSheet.create() from line 192 to inside component
- [ ] Line 331: Replace `#FFF3E0` with `theme.colors.warningLight`
- [ ] Line 336: Replace `#E8F5E8` with `theme.colors.successLight`
- [ ] Line 399: Replace `#E8F5E8` with `theme.colors.successLight`
- [ ] Line 404: Replace `#2E7D32` with `theme.colors.success`

#### PaymentConfigurationSettings.tsx
- [ ] Line 12: Replace `import { theme }` with `import { useTheme }`
- [ ] Add `const { theme } = useTheme();` at component root
- [ ] Move StyleSheet.create() from line 200 to inside component

#### DeviceHardwareSettings.tsx
- [x] Already using useTheme() hook correctly ✅
- [x] StyleSheet.create() already inside component ✅
- [ ] Replace emojis with vector icons

---

## Testing Requirements

After all color violations are fixed:

1. **Light Mode Test**
   - [ ] All colors render correctly
   - [ ] Text contrast meets WCAG AA standards
   - [ ] No hardcoded colors visible

2. **Dark Mode Test**
   - [ ] All colors adapt to dark theme correctly
   - [ ] No hardcoded colors causing contrast issues
   - [ ] Success/warning/error colors maintain semantic meaning

3. **Theme Toggle Test**
   - [ ] Switch between light and dark mode
   - [ ] Verify all colors transition correctly
   - [ ] No flash of unstyled content

4. **Accessibility Test**
   - [ ] Run contrast checker on all color combinations
   - [ ] Verify 4.5:1 minimum contrast ratio
   - [ ] Test with screen reader

---

## Automated Verification Script

```bash
# Search for hardcoded hex colors in settings components
grep -r "#[0-9A-Fa-f]\{6\}" src/screens/settings/components/

# Expected result after fix: No matches (or only in comments)
```

```bash
# Search for direct theme imports (should use useTheme hook instead)
grep -r "import.*theme.*from '@/constants/theme'" src/screens/settings/

# Expected result after fix: No matches
```

---

**Total Color Violations**: 12+ instances
**Estimated Fix Time**: 4-6 hours (including testing)
**Priority**: CRITICAL (blocks dark mode support)
