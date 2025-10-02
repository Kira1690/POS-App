# Before & After Code Examples

**Purpose**: Visual side-by-side comparisons showing correct vs incorrect patterns
**Audience**: Developers implementing fixes

---

## Example 1: Settings Navigation Icons

### ❌ BEFORE (Incorrect - Multiple Violations)

```typescript
// File: SettingsScreen.tsx

// ❌ VIOLATION 1: Array defined OUTSIDE component (can't access theme)
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    label: 'Restaurant Profile',
    icon: '🏪', // ❌ VIOLATION 2: Emoji instead of vector icon
    iconBackground: '#FF453A', // ❌ VIOLATION 3: Hardcoded color
  },
  {
    id: 'user_management',
    label: 'User Management',
    icon: '👥', // ❌ VIOLATION 2: Emoji
    iconBackground: '#007AFF', // ❌ VIOLATION 3: Hardcoded color
  },
  // ... 6 more categories with same violations
];

export default function SettingsScreen() {
  const { theme, isDark } = useTheme(); // Theme hook is here but too late

  // Can't use theme in SETTINGS_CATEGORIES above
  return (
    <SafeAreaView>
      <AppleSidebar items={sidebarItems} />
    </SafeAreaView>
  );
}
```

**Problems:**
1. 🚨 Array outside component = can't access theme
2. 🚨 Emojis (8 total) = unprofessional
3. 🚨 Hardcoded colors (8 total) = breaks dark mode

---

### ✅ AFTER (Correct - All Issues Fixed)

```typescript
// File: SettingsScreen.tsx
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsScreen() {
  // ✅ FIX 1: useTheme hook at component root
  const { theme, isDark } = useTheme();

  // ✅ FIX 2: Array INSIDE component (can access theme now)
  const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
    {
      id: 'restaurant_profile',
      label: 'Restaurant Profile',
      icon: 'store', // ✅ FIX 3: Vector icon name
      iconBackground: theme.colors.error, // ✅ FIX 4: Theme color (red)
    },
    {
      id: 'user_management',
      label: 'User Management',
      icon: 'account-group', // ✅ Vector icon
      iconBackground: theme.colors.info, // ✅ Theme color (blue)
    },
    {
      id: 'device_hardware',
      label: 'Device & Hardware',
      icon: 'devices', // ✅ Vector icon
      iconBackground: theme.colors.success, // ✅ Theme color (green)
    },
    {
      id: 'payment_config',
      label: 'Payment Configuration',
      icon: 'credit-card-outline', // ✅ Vector icon
      iconBackground: theme.colors.warning, // ✅ Theme color (orange)
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'link-variant', // ✅ Vector icon
      iconBackground: theme.colors.purple, // ✅ Theme color (purple)
    },
    {
      id: 'security_backup',
      label: 'Security & Backup',
      icon: 'shield-lock-outline', // ✅ Vector icon
      iconBackground: theme.colors.cyan, // ✅ Theme color (cyan)
    },
    {
      id: 'system_logs',
      label: 'System Logs',
      icon: 'chart-line', // ✅ Vector icon
      iconBackground: theme.colors.error, // ✅ Theme color (red)
    },
    {
      id: 'help_support',
      label: 'Help & Support',
      icon: 'help-circle-outline', // ✅ Vector icon
      iconBackground: theme.colors.onSurfaceVariant, // ✅ Theme color (gray)
    },
  ];

  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background }}>
      <AppleSidebar items={sidebarItems} />
    </SafeAreaView>
  );
}
```

**Improvements:**
1. ✅ Array inside component with theme access
2. ✅ All 8 emojis replaced with professional vector icons
3. ✅ All 8 hardcoded colors now use theme.colors
4. ✅ Dark mode will work correctly

---

## Example 2: Component with StyleSheet Violations

### ❌ BEFORE (RestaurantProfileSettings.tsx - Incorrect)

```typescript
// File: RestaurantProfileSettings.tsx

// ❌ VIOLATION 1: Direct theme import
import { theme } from '@/constants/theme';

export default function RestaurantProfileSettings({ onChangesDetected }: Props) {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);

  // ... component logic

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant Profile</Text>
      {/* ... JSX */}
    </ScrollView>
  );
}

// ❌ VIOLATION 2: StyleSheet OUTSIDE component (module level)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text, // ❌ Static theme, won't update
    marginBottom: 25,
  },
  sameAsMonday: {
    backgroundColor: '#E8F5E8', // ❌ VIOLATION 3: Hardcoded color
    borderRadius: 15,
    borderColor: theme.colors.success,
  },
  sameAsMondayText: {
    fontSize: 11,
    color: '#2E7D32', // ❌ VIOLATION 3: Hardcoded color
  },
  // ... 50+ more styles
});
```

**Problems:**
1. 🚨 Direct theme import (violates CLAUDE.md)
2. 🚨 StyleSheet outside component (dark mode won't work)
3. 🚨 Hardcoded colors (2 instances in this example, more in full file)

---

### ✅ AFTER (RestaurantProfileSettings.tsx - Correct)

```typescript
// File: RestaurantProfileSettings.tsx

// ✅ FIX 1: Import useTheme hook instead
import { useTheme } from '@/hooks/useTheme';

export default function RestaurantProfileSettings({ onChangesDetected }: Props) {
  // ✅ FIX 2: useTheme hook FIRST at component root
  const { theme } = useTheme();

  // Then state hooks
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Then all handler functions
  const handleUpdateProfile = async () => { /* ... */ };
  const handleResetChanges = () => { /* ... */ };
  const handleUploadLogo = async () => { /* ... */ };
  const updateProfile = (field: keyof RestaurantProfile, value: any) => { /* ... */ };

  // ✅ FIX 3: StyleSheet INSIDE component (after hooks, before return)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface, // ✅ Dynamic theme access
      marginBottom: 25,
    },
    sameAsMonday: {
      backgroundColor: theme.colors.successLight, // ✅ FIX 4: Theme color
      borderRadius: 15,
      borderColor: theme.colors.success,
    },
    sameAsMondayText: {
      fontSize: 11,
      color: theme.colors.success, // ✅ FIX 4: Theme color
    },
    // ... all other styles with theme access
  });

  // Early returns
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading restaurant profile...</Text>
      </View>
    );
  }

  // Main render
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Restaurant Profile</Text>
      {/* ... JSX */}
    </ScrollView>
  );
}

// ✅ FIX 5: No StyleSheet outside component anymore
```

**Improvements:**
1. ✅ useTheme hook replaces direct import
2. ✅ StyleSheet inside component with dynamic theme access
3. ✅ All hardcoded colors replaced with theme.colors
4. ✅ Dark mode toggle will now work instantly

---

## Example 3: Icon Replacement in Buttons

### ❌ BEFORE (Action Buttons with Emojis)

```typescript
// Multiple files with this pattern

<TouchableOpacity
  style={styles.saveButton}
  onPress={handleSave}
>
  <Text style={styles.saveButtonText}>
    💾 Save Changes  {/* ❌ Emoji in text */}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.resetButton}
  onPress={handleReset}
>
  <Text style={styles.resetButtonText}>
    🔄 Reset  {/* ❌ Emoji in text */}
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.uploadButton}
  onPress={handleUpload}
>
  <Text style={styles.uploadButtonText}>
    📷 Upload Logo  {/* ❌ Emoji in text */}
  </Text>
</TouchableOpacity>
```

**Problems:**
1. 🚨 Emojis in buttons = unprofessional
2. ⚠️ No icon size control
3. ⚠️ No accessibility labels

---

### ✅ AFTER (Action Buttons with Vector Icons)

```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

export default function Component() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row', // ✅ Row for icon + text
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: theme.borderRadius.md,
      gap: 8, // ✅ Spacing between icon and text
    },
    saveButton: {
      backgroundColor: theme.colors.success,
    },
    resetButton: {
      backgroundColor: theme.colors.warning,
    },
    uploadButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onSuccess,
    },
  });

  return (
    <>
      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={handleSave}
        accessibilityLabel="Save changes" // ✅ Accessibility
        accessibilityRole="button"
      >
        {/* ✅ Vector icon with proper sizing and color */}
        <Icon name="content-save" size={18} color={theme.colors.onSuccess} />
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.resetButton]}
        onPress={handleReset}
        accessibilityLabel="Reset changes"
        accessibilityRole="button"
      >
        {/* ✅ Vector icon */}
        <Icon name="refresh" size={18} color={theme.colors.onWarning} />
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.uploadButton]}
        onPress={handleUpload}
        accessibilityLabel="Upload logo"
        accessibilityRole="button"
      >
        {/* ✅ Vector icon */}
        <Icon name="camera-outline" size={18} color={theme.colors.onPrimary} />
        <Text style={styles.buttonText}>Upload Logo</Text>
      </TouchableOpacity>
    </>
  );
}
```

**Improvements:**
1. ✅ Professional vector icons instead of emojis
2. ✅ Consistent icon sizing (18px for buttons)
3. ✅ Proper color usage from theme
4. ✅ Accessibility labels added
5. ✅ Flexbox layout for icon + text alignment

---

## Example 4: Status Indicators

### ❌ BEFORE (Emoji Status Indicators)

```typescript
// UserManagementSettings.tsx, DeviceHardwareSettings.tsx

<Text style={styles.userStatus}>
  {item.status === 'active' ? '🔘 Active' : '⚪ Inactive'}
  {/* ❌ Emojis for status */}
</Text>

<Text style={styles.deviceStatus}>
  {device.status === 'connected' ? '🔘 Connected' :
   device.status === 'disconnected' ? '⚪ Not Connected' : '⚠️ Error'}
  {/* ❌ Emojis for status */}
</Text>
```

**Problems:**
1. 🚨 Emojis inconsistent across platforms
2. ⚠️ No semantic color coding
3. ⚠️ Hard to scan visually

---

### ✅ AFTER (Vector Icon Status Indicators)

```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

export default function Component() {
  const { theme } = useTheme();

  // Helper function for status rendering
  const renderStatus = (status: 'active' | 'inactive' | 'connected' | 'disconnected' | 'error') => {
    const statusConfig = {
      active: {
        icon: 'checkbox-marked-circle',
        color: theme.colors.success,
        label: 'Active'
      },
      inactive: {
        icon: 'checkbox-blank-circle-outline',
        color: theme.colors.onSurfaceVariant,
        label: 'Inactive'
      },
      connected: {
        icon: 'checkbox-marked-circle',
        color: theme.colors.success,
        label: 'Connected'
      },
      disconnected: {
        icon: 'checkbox-blank-circle-outline',
        color: theme.colors.error,
        label: 'Not Connected'
      },
      error: {
        icon: 'alert-circle',
        color: theme.colors.error,
        label: 'Error'
      }
    };

    const config = statusConfig[status];

    return (
      <View style={styles.statusContainer}>
        <Icon name={config.icon} size={16} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  return (
    <>
      {/* ✅ User status */}
      {renderStatus(item.status)}

      {/* ✅ Device status */}
      {renderStatus(device.status)}
    </>
  );
}
```

**Improvements:**
1. ✅ Professional vector icons
2. ✅ Semantic color coding (green=active, red=error, gray=inactive)
3. ✅ Consistent sizing and spacing
4. ✅ Reusable helper function
5. ✅ Theme-based colors

---

## Example 5: Color-Coded Tags

### ❌ BEFORE (Hardcoded Background Colors)

```typescript
// UserManagementSettings.tsx

const styles = StyleSheet.create({
  roleTagmanager: {
    backgroundColor: '#FFF3E0', // ❌ Hardcoded light orange
    borderColor: theme.colors.warning,
    borderWidth: 1,
  },
  roleTagstaff: {
    backgroundColor: '#E8F5E8', // ❌ Hardcoded light green
    borderColor: theme.colors.success,
    borderWidth: 1,
  },
  permissionToggleActive: {
    backgroundColor: '#E8F5E8', // ❌ Hardcoded light green
    borderColor: theme.colors.success,
  },
  permissionToggleText: {
    fontSize: 10,
    color: '#2E7D32', // ❌ Hardcoded dark green
  },
});
```

**Problems:**
1. 🚨 Hardcoded hex colors (4 instances)
2. 🚨 Won't work in dark mode
3. ⚠️ Mixed hardcoded and theme usage

---

### ✅ AFTER (Theme-Based Colors)

```typescript
import { useTheme } from '@/hooks/useTheme';

export default function Component() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    roleTagmanager: {
      backgroundColor: theme.colors.warningLight, // ✅ Theme color
      borderColor: theme.colors.warning,
      borderWidth: 1,
    },
    roleTagstaff: {
      backgroundColor: theme.colors.successLight, // ✅ Theme color
      borderColor: theme.colors.success,
      borderWidth: 1,
    },
    permissionToggleActive: {
      backgroundColor: theme.colors.successLight, // ✅ Theme color
      borderColor: theme.colors.success,
    },
    permissionToggleText: {
      fontSize: 10,
      color: theme.colors.success, // ✅ Theme color
    },
  });

  return (
    <>
      <View style={[styles.roleTag, styles.roleTagmanager]}>
        <Text style={styles.roleText}>MANAGER</Text>
      </View>
      <View style={[styles.roleTag, styles.roleTagstaff]}>
        <Text style={styles.roleText}>STAFF</Text>
      </View>
    </>
  );
}
```

**Improvements:**
1. ✅ All colors from theme
2. ✅ Works in both light and dark mode
3. ✅ Consistent with theme color palette
4. ✅ Semantic color usage (warningLight for warning, successLight for success)

---

## Example 6: Icon in Card Headers

### ❌ BEFORE (Emoji Icon Headers)

```typescript
// DeviceHardwareSettings.tsx

<View style={styles.deviceCard}>
  <View style={styles.deviceIcon}>
    <Text style={styles.deviceIconText}>💳</Text> {/* ❌ Emoji */}
  </View>
  <View style={styles.deviceInfo}>
    <Text style={styles.deviceName}>VP3350 Card Reader</Text>
    <Text style={styles.deviceStatus}>🔘 Connected</Text> {/* ❌ Emoji */}
  </View>
</View>
```

---

### ✅ AFTER (Vector Icon Headers)

```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

export default function Component() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    deviceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
    },
    deviceIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    deviceInfo: {
      flex: 1,
    },
    deviceName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    statusText: {
      fontSize: 12,
      color: theme.colors.success,
    },
  });

  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceIcon}>
        {/* ✅ Vector icon with proper sizing */}
        <Icon
          name="credit-card-scan-outline"
          size={20}
          color={theme.colors.onPrimary}
        />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>VP3350 Card Reader</Text>
        <View style={styles.statusContainer}>
          {/* ✅ Vector icon for status */}
          <Icon
            name="checkbox-marked-circle"
            size={14}
            color={theme.colors.success}
          />
          <Text style={styles.statusText}>Connected</Text>
        </View>
      </View>
    </View>
  );
}
```

**Improvements:**
1. ✅ Professional vector icons in card headers
2. ✅ Proper icon sizing (20px for header, 14px for status)
3. ✅ Theme-based colors throughout
4. ✅ Better visual hierarchy with spacing

---

## Summary of Changes

### Pattern Changes Required:

| Before | After |
|--------|-------|
| `import { theme } from '@/constants/theme'` | `import { useTheme } from '@/hooks/useTheme'` |
| StyleSheet outside component | StyleSheet inside component (after useTheme) |
| `icon: '🏪'` | `icon: 'store'` (vector icon name) |
| `iconBackground: '#FF453A'` | `iconBackground: theme.colors.error` |
| `<Text>💾 Save</Text>` | `<Icon name="content-save" /> <Text>Save</Text>` |
| `backgroundColor: '#E8F5E8'` | `backgroundColor: theme.colors.successLight` |
| `color: '#2E7D32'` | `color: theme.colors.success` |

### Testing Verification:

After making changes, verify:
```bash
# 1. No hardcoded colors
grep -r "#[0-9A-Fa-f]{6}" src/screens/settings/
# Expected: 0 matches

# 2. No direct theme imports
grep -r "import.*{ theme }.*from '@/constants/theme'" src/screens/settings/
# Expected: 0 matches

# 3. No emojis in UI code (approximate check)
grep -r "icon.*'[🔒💾🔄]'" src/screens/settings/
# Expected: 0 matches
```

---

**Use these examples as reference when implementing fixes!**
