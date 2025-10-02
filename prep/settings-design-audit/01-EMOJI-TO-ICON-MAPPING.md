# Emoji to Vector Icon Mapping Guide

**Purpose**: Replace all emojis with professional vector icons from React Native Vector Icons
**Icon Libraries**: MaterialCommunityIcons (primary), Ionicons (secondary), Feather (tertiary)

---

## Installation Required

```bash
npm install react-native-vector-icons
# OR
bun add react-native-vector-icons
```

**Configuration**: Already included in most React Native projects via Expo

---

## Settings Navigation Icons

### Current → Recommended Replacement

| Current Emoji | Context | Recommended Icon | Library | Icon Name | Reasoning |
|--------------|---------|------------------|---------|-----------|-----------|
| 🏪 | Restaurant Profile | `store` | MaterialCommunityIcons | `store` | Professional storefront icon |
| 👥 | User Management | `account-group` | MaterialCommunityIcons | `account-group` | Standard for user management |
| 📱 | Device & Hardware | `devices` | MaterialCommunityIcons | `devices` | Represents multiple devices |
| 💳 | Payment Configuration | `credit-card-outline` | MaterialCommunityIcons | `credit-card-outline` | Standard payment icon |
| 🔗 | Integrations | `link-variant` | MaterialCommunityIcons | `link-variant` | Professional link icon |
| 🔒 | Security & Backup | `shield-lock-outline` | MaterialCommunityIcons | `shield-lock-outline` | Security standard icon |
| 📊 | System Logs | `chart-line` | MaterialCommunityIcons | `chart-line` | Analytics/logs standard |
| ❓ | Help & Support | `help-circle-outline` | MaterialCommunityIcons | `help-circle-outline` | Universal help icon |

---

## Action Button Icons

### Save, Edit, Reset Actions

| Current Emoji | Context | Recommended Icon | Library | Icon Name | Size | Color |
|--------------|---------|------------------|---------|-----------|------|-------|
| 💾 | Save | `content-save` | MaterialCommunityIcons | `content-save` | 16-20px | theme.colors.onSuccess |
| 🔄 | Reset | `refresh` | MaterialCommunityIcons | `refresh` | 16-20px | theme.colors.onWarning |
| 📷 | Upload Logo | `camera-outline` | MaterialCommunityIcons | `camera-outline` | 16-20px | theme.colors.onPrimary |
| ✏️ | Edit (implied) | `pencil-outline` | MaterialCommunityIcons | `pencil-outline` | 16-18px | theme.colors.onSurface |

---

## Status Indicators

### Connection, Activity, State Icons

| Current Emoji | Context | Recommended Icon | Library | Icon Name | Color Mapping |
|--------------|---------|------------------|---------|-----------|---------------|
| 🔘 | Active/Connected | `checkbox-marked-circle` | MaterialCommunityIcons | `checkbox-marked-circle` | theme.colors.success |
| ⚪ | Inactive/Disconnected | `checkbox-blank-circle-outline` | MaterialCommunityIcons | `checkbox-blank-circle-outline` | theme.colors.onSurfaceVariant |
| ⚠️ | Error/Warning | `alert-circle` | MaterialCommunityIcons | `alert-circle` | theme.colors.error |
| ✓ | Success/Checkmark | `check` | MaterialCommunityIcons | `check` | theme.colors.success |

---

## Payment & Transaction Icons

| Current Emoji | Context | Recommended Icon | Library | Icon Name |
|--------------|---------|------------------|---------|-----------|
| 💳 | Card Payment | `credit-card-outline` | MaterialCommunityIcons | `credit-card-outline` |
| 💵 | Cash Payment | `cash` | MaterialCommunityIcons | `cash` |
| 🔄 | Split Payment | `shuffle-variant` | MaterialCommunityIcons | `shuffle-variant` |
| 🎁 | Gift Card | `gift-outline` | MaterialCommunityIcons | `gift-outline` |
| 🧪 | Test Payment | `test-tube` | MaterialCommunityIcons | `test-tube` |

---

## Device & Hardware Icons

| Current Emoji | Context | Recommended Icon | Library | Icon Name |
|--------------|---------|------------------|---------|-----------|
| 💳 | VP3350 Card Reader | `credit-card-scan-outline` | MaterialCommunityIcons | `credit-card-scan-outline` |
| 📦 | Cash Drawer | `package-variant` | MaterialCommunityIcons | `package-variant` |
| 🧾 | Receipt Printer | `receipt` | MaterialCommunityIcons | `receipt` |
| 👨‍🍳 | Kitchen Printer | `chef-hat` | MaterialCommunityIcons | `chef-hat` |
| 💻 | System Health | `monitor-dashboard` | MaterialCommunityIcons | `monitor-dashboard` |
| 📶 | Network Status | `wifi` | MaterialCommunityIcons | `wifi` |

---

## API & Integration Icons

| Current Emoji | Context | Recommended Icon | Library | Icon Name |
|--------------|---------|------------------|---------|-----------|
| 🔧 | Backend API | `api` | MaterialCommunityIcons | `api` |
| ⚡ | Real-time WebSocket | `flash` | MaterialCommunityIcons | `flash` |
| 🔗 | Delivery Platforms | `truck-delivery-outline` | MaterialCommunityIcons | `truck-delivery-outline` |

---

## UI Element Icons

| Current Emoji | Context | Recommended Icon | Library | Icon Name |
|--------------|---------|------------------|---------|-----------|
| 🔍 | Search | `magnify` | MaterialCommunityIcons | `magnify` |
| 📅 | Calendar/Schedule | `calendar-outline` | MaterialCommunityIcons | `calendar-outline` |
| 🌙 | Dark Mode | `weather-night` | MaterialCommunityIcons | `weather-night` |
| ☀️ | Light Mode | `weather-sunny` | MaterialCommunityIcons | `weather-sunny` |
| ▼ | Dropdown Indicator | `chevron-down` | MaterialCommunityIcons | `chevron-down` |

---

## Implementation Pattern

### ❌ Current Pattern (Emoji)

```typescript
<View style={styles.iconContainer}>
  <Text style={styles.iconText}>💳</Text>
</View>
```

### ✅ New Pattern (Vector Icon)

```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@/hooks/useTheme';

export const Component: React.FC<Props> = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.iconContainer}>
      <Icon
        name="credit-card-outline"
        size={20}
        color={theme.colors.onSurface}
      />
    </View>
  );
};
```

---

## Reusable Icon Component Pattern

### Create Universal Icon Wrapper

```typescript
// src/components/common/Icon.tsx
import React from 'react';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@/hooks/useTheme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: 'material' | 'ionicons';
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  library = 'material'
}) => {
  const { theme } = useTheme();
  const iconColor = color || theme.colors.onSurface;

  if (library === 'ionicons') {
    return <IonIcon name={name} size={size} color={iconColor} />;
  }

  return <MCIcon name={name} size={size} color={iconColor} />;
};
```

### Usage Example

```typescript
import { Icon } from '@/components/common/Icon';
import { useTheme } from '@/hooks/useTheme';

export const SettingsButton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={styles.button}>
      <Icon name="content-save" size={18} color={theme.colors.onSuccess} />
      <Text style={styles.buttonText}>Save</Text>
    </TouchableOpacity>
  );
};
```

---

## Icon Sizing Standards

### Consistent Size Hierarchy

| Context | Size (px) | Usage |
|---------|-----------|-------|
| Navigation Icons | 24 | Settings sidebar icons |
| Button Icons | 18-20 | Action buttons (Save, Reset, etc.) |
| Status Icons | 16-18 | Status indicators (Active, Inactive) |
| Small Indicators | 14-16 | Inline status, badges |
| Large Display Icons | 32-40 | Device cards, feature highlights |

---

## Color Application Rules

### Per CLAUDE.md Color Reference Standards (STRICT)

```typescript
// ✅ CORRECT: Use theme colors for all icons
<Icon name="check" color={theme.colors.success} />
<Icon name="alert-circle" color={theme.colors.error} />
<Icon name="information" color={theme.colors.primary} />

// ❌ FORBIDDEN: Never hardcode icon colors
<Icon name="check" color="#34C759" />
<Icon name="alert-circle" color="red" />
```

---

## Icon Background Patterns

### Settings Navigation Icon Backgrounds

**Current Hardcoded Pattern (❌ FORBIDDEN):**
```typescript
iconBackground: '#FF453A', // Apple red
iconBackground: '#007AFF', // Apple blue
```

**Correct Theme-Based Pattern (✅ REQUIRED):**
```typescript
// Map to theme colors
const ICON_BACKGROUND_MAP = {
  restaurant_profile: theme.colors.error,      // Red
  user_management: theme.colors.info,          // Blue
  device_hardware: theme.colors.success,       // Green
  payment_config: theme.colors.warning,        // Orange
  integrations: theme.colors.purple,           // Purple
  security_backup: theme.colors.cyan,          // Cyan
  system_logs: theme.colors.error,             // Red
  help_support: theme.colors.onSurfaceVariant, // Gray
};
```

---

## Testing Checklist

Before considering emoji replacement complete, verify:

- [ ] All emojis replaced with vector icons
- [ ] All icons use theme colors (no hardcoded colors)
- [ ] Icon sizes follow standardized hierarchy
- [ ] Icons render correctly in both light and dark mode
- [ ] Icons have proper accessibility labels
- [ ] Icon library imports are optimized (tree-shaking works)
- [ ] No console warnings about icon names
- [ ] Icons scale properly on different screen densities

---

## Accessibility Improvements

### Icon Accessibility Labels

```typescript
// ✅ Add accessibility labels for screen readers
<Icon
  name="content-save"
  size={20}
  color={theme.colors.onSuccess}
  accessibilityLabel="Save settings"
/>

// For icon buttons
<TouchableOpacity accessibilityLabel="Save configuration" accessibilityRole="button">
  <Icon name="content-save" size={20} color={theme.colors.onSuccess} />
  <Text>Save</Text>
</TouchableOpacity>
```

---

## Migration Priority Order

### Phase 1: CRITICAL (Settings Navigation)
1. Settings sidebar category icons (8 icons)
2. Primary action buttons (Save, Reset, Upload) (3 icons)

### Phase 2: HIGH (Status Indicators)
3. Connection status icons (Active, Inactive, Error) (3 icons)
4. Device type icons (Card Reader, Printers, Drawer) (4 icons)

### Phase 3: MEDIUM (Feature Icons)
5. Payment method icons (Card, Cash, Gift Card, Split) (4 icons)
6. API/Network icons (API, WebSocket, Network) (3 icons)
7. UI element icons (Search, Calendar, Theme) (4 icons)

### Phase 4: LOW (Remaining Icons)
8. All remaining contextual icons (10+ icons)

---

**Total Emoji Replacement Count**: 35+ icons
**Estimated Time per Icon**: 15-20 minutes (including testing)
**Total Estimated Time**: 8-12 hours
