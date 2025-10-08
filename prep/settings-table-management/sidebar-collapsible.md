# Collapsible Sidebar Design - Detailed Specification

**Project:** POS Settings - Table Management System
**Created:** 2025-10-08
**Component:** AppleSidebar Enhancement

---

## Overview

The collapsible sidebar allows users to maximize screen real estate by collapsing the settings navigation to icon-only mode while maintaining full functionality through tooltips.

### Key Features
- **Two States:** Expanded (280px) and Collapsed (64px)
- **Smooth Animation:** 300ms transition with easing
- **Persistent State:** Remembers user preference
- **Tooltips:** Show labels when hovering over icons in collapsed state
- **Responsive:** Auto-collapses on mobile, manual toggle on tablet/desktop

---

## Visual Design

### Expanded State (Default)
```
┌─────────────────────────────────┐
│  Settings Categories            │  ← Header
│  ─────────────────────────────  │
│  🔍 Search settings...          │  ← Search (optional)
│  ─────────────────────────────  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [🏪] Restaurant Profile  │  │  ← Item (not selected)
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [👥] User Management     │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [📱] Device & Hardware   │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [💳] Payment Config      │  │
│  └──────────────────────────┘  │
│                                 │
│  ╔══════════════════════════╗  │
│  ║ [🍽️] Table Management    ║  │  ← SELECTED (highlighted)
│  ╚══════════════════════════╝  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [🔗] Integrations        │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [🔒] Security & Backup   │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [📊] System Logs         │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [❓] Help & Support      │  │
│  └──────────────────────────┘  │
│                                 │
│  ─────────────────────────────  │
│  [◀] Collapse                   │  ← Collapse button
└─────────────────────────────────┘
Width: 280px
```

### Collapsed State
```
┌───────┐
│   ≡   │  ← Menu icon
│  ───  │
│       │
│ ┌───┐ │
│ │🏪 │ │  ← Icon only
│ └───┘ │
│       │
│ ┌───┐ │
│ │👥 │ │
│ └───┘ │
│       │
│ ┌───┐ │
│ │📱 │ │
│ └───┘ │
│       │
│ ┌───┐ │
│ │💳 │ │
│ └───┘ │
│       │
│ ╔═══╗ │  ← SELECTED (highlighted border)
│ ║🍽️ ║ │
│ ╚═══╝ │
│       │
│ ┌───┐ │
│ │🔗 │ │
│ └───┘ │
│       │
│ ┌───┐ │
│ │🔒 │ │
│ └───┘ │
│       │
│ ┌───┐ │
│ │📊 │ │
│ └───┘ │
│       │
│ ┌───┐ │
│ │❓ │ │
│ └───┘ │
│       │
│  ───  │
│   ▶   │  ← Expand button
└───────┘
Width: 64px
```

**CRITICAL NOTE:** Icons shown (🏪, 👥, etc.) are VISUAL REPRESENTATION only!
**MUST USE MaterialCommunityIcons in implementation!**

---

## MaterialCommunityIcons Mapping

### Icon Reference (NO EMOJIS!)
```typescript
const SIDEBAR_ICONS = {
  restaurantProfile: 'store',                    // 🏪
  userManagement: 'account-group',               // 👥
  deviceHardware: 'devices',                     // 📱
  paymentConfig: 'credit-card-outline',          // 💳
  tableManagement: 'table-furniture',            // 🍽️
  integrations: 'link-variant',                  // 🔗
  security: 'shield-lock-outline',               // 🔒
  systemLogs: 'chart-line',                      // 📊
  help: 'help-circle-outline',                   // ❓
  menu: 'menu',                                  // ≡
  collapseLeft: 'chevron-left',                  // ◀
  expandRight: 'chevron-right',                  // ▶
};
```

---

## Component Structure

### Enhanced AppleSidebar Props
```typescript
interface AppleSidebarProps {
  items: AppleSidebarItem[];
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  variant?: 'default' | 'settings';
  width?: number;

  // NEW: Collapsible props
  collapsible?: boolean;              // Enable collapse feature
  defaultCollapsed?: boolean;         // Initial state
  onCollapseChange?: (collapsed: boolean) => void;  // State callback
  persistState?: boolean;             // Save to storage
  storageKey?: string;                // AsyncStorage key
  collapseBreakpoint?: number;        // Auto-collapse width (px)
}

interface AppleSidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;              // Icon component
  iconBackground?: string;            // Background color for expanded
  selected?: boolean;
  onPress?: () => void;
  badge?: number | string;            // Optional badge
  disabled?: boolean;
}
```

---

## Implementation Details

### State Management
```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppleSidebar: React.FC<AppleSidebarProps> = ({
  items,
  collapsible = true,
  defaultCollapsed = false,
  persistState = true,
  storageKey = 'settings_sidebar_collapsed',
  onCollapseChange,
  ...props
}) => {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isReady, setIsReady] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    if (persistState) {
      loadCollapsedState();
    } else {
      setIsReady(true);
    }
  }, []);

  const loadCollapsedState = async () => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
    } finally {
      setIsReady(true);
    }
  };

  const toggleCollapse = async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    if (persistState) {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
      }
    }

    onCollapseChange?.(newState);
  };

  if (!isReady) {
    return <View style={{ width: props.width || 280 }} />;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: isCollapsed ? 64 : (props.width || 280),
        },
      ]}
    >
      {/* Sidebar content */}
    </Animated.View>
  );
};
```

### Animation Implementation
```typescript
import { Animated, Easing } from 'react-native';

const AppleSidebar: React.FC<AppleSidebarProps> = (props) => {
  const widthAnim = useRef(new Animated.Value(
    props.defaultCollapsed ? 64 : (props.width || 280)
  )).current;

  const textOpacityAnim = useRef(new Animated.Value(
    props.defaultCollapsed ? 0 : 1
  )).current;

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    // Animate width
    Animated.timing(widthAnim, {
      toValue: newState ? 64 : (props.width || 280),
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // Width cannot use native driver
    }).start();

    // Animate text opacity
    Animated.timing(textOpacityAnim, {
      toValue: newState ? 0 : 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // ... rest of toggle logic
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: widthAnim },
      ]}
    >
      {/* Content */}
    </Animated.View>
  );
};
```

### Tooltip Component
```typescript
interface TooltipProps {
  label: string;
  visible: boolean;
  position: { x: number; y: number };
}

const Tooltip: React.FC<TooltipProps> = ({ label, visible, position }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.tooltip,
        {
          position: 'absolute',
          left: position.x + 10,
          top: position.y - 20,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <Text style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Sidebar Item Rendering
```typescript
const renderItem = (item: AppleSidebarItem, index: number) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePress = () => {
    if (item.disabled) return;
    item.onPress?.();
  };

  const handleHoverIn = (event: GestureResponderEvent) => {
    if (isCollapsed) {
      const { pageX, pageY } = event.nativeEvent;
      setTooltipPosition({ x: pageX, y: pageY });
      setShowTooltip(true);
    }
  };

  const handleHoverOut = () => {
    setShowTooltip(false);
  };

  return (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.item,
        {
          backgroundColor: item.selected
            ? theme.colors.primary
            : 'transparent',
          paddingHorizontal: isCollapsed ? 0 : theme.spacing.md,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        },
      ]}
      onPress={handlePress}
      onMouseEnter={handleHoverIn}  // Web only
      onMouseLeave={handleHoverOut} // Web only
      disabled={item.disabled}
    >
      {/* Icon container */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isCollapsed
              ? 'transparent'
              : (item.iconBackground || theme.colors.surface),
            width: 40,
            height: 40,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        {item.icon}
      </View>

      {/* Label (only in expanded state) */}
      {!isCollapsed && (
        <Animated.View
          style={{
            opacity: textOpacityAnim,
            marginLeft: theme.spacing.sm,
            flex: 1,
          }}
        >
          <Text
            style={[
              styles.label,
              {
                color: item.selected
                  ? theme.colors.white
                  : theme.colors.onSurface,
              },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </Animated.View>
      )}

      {/* Badge (optional) */}
      {item.badge && !isCollapsed && (
        <View
          style={[
            styles.badge,
            { backgroundColor: theme.colors.error },
          ]}
        >
          <Text style={[styles.badgeText, { color: theme.colors.white }]}>
            {item.badge}
          </Text>
        </View>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <Tooltip
          label={item.label}
          visible={showTooltip}
          position={tooltipPosition}
        />
      )}
    </TouchableOpacity>
  );
};
```

### Collapse Button
```typescript
const renderCollapseButton = () => {
  return (
    <TouchableOpacity
      style={[
        styles.collapseButton,
        {
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          paddingVertical: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={toggleCollapse}
    >
      {!isCollapsed ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            name="chevron-left"
            size={20}
            color={theme.colors.onSurface}
            accessibilityLabel="Collapse sidebar"
          />
          <Animated.Text
            style={[
              styles.collapseText,
              {
                opacity: textOpacityAnim,
                marginLeft: theme.spacing.xs,
                color: theme.colors.onSurface,
              },
            ]}
          >
            Collapse
          </Animated.Text>
        </View>
      ) : (
        <Icon
          name="chevron-right"
          size={20}
          color={theme.colors.onSurface}
          accessibilityLabel="Expand sidebar"
        />
      )}
    </TouchableOpacity>
  );
};
```

---

## Responsive Behavior

### Breakpoint Logic
```typescript
import { Dimensions } from 'react-native';

const AppleSidebar: React.FC<AppleSidebarProps> = ({
  collapseBreakpoint = 768, // Default tablet breakpoint
  ...props
}) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);

      // Auto-collapse on mobile
      if (window.width < collapseBreakpoint) {
        setIsCollapsed(true);
      }
    });

    return () => subscription?.remove();
  }, [collapseBreakpoint]);

  // Auto-collapse on mount if mobile
  useEffect(() => {
    if (dimensions.width < collapseBreakpoint) {
      setIsCollapsed(true);
    }
  }, []);

  // ... rest of component
};
```

---

## Accessibility

### Screen Reader Support
```typescript
<View
  style={styles.container}
  accessibilityRole="navigation"
  accessibilityLabel="Settings navigation"
  accessibilityState={{
    expanded: !isCollapsed,
  }}
>
  {items.map((item) => (
    <TouchableOpacity
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{
        selected: item.selected,
        disabled: item.disabled,
      }}
      accessibilityHint={`Navigate to ${item.label}`}
      onPress={item.onPress}
    >
      {/* Item content */}
    </TouchableOpacity>
  ))}
</View>
```

### Keyboard Navigation
```typescript
// Web-only keyboard support
useEffect(() => {
  if (Platform.OS === 'web') {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle with keyboard shortcut (e.g., Cmd/Ctrl + B)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }
}, [isCollapsed]);
```

---

## Styling

### Theme-Based Styles
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.outline,
    paddingVertical: theme.spacing.lg,
    // Width animated, not in static styles
  },

  header: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  headerTitle: {
    ...theme.typography.headline,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minHeight: 48, // Touch target
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    ...theme.typography.body,
    fontWeight: '500',
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    ...theme.typography.caption2,
    fontWeight: '600',
  },

  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },

  collapseText: {
    ...theme.typography.body2,
    marginLeft: theme.spacing.xs,
  },
});
```

---

## Usage Example

### In SettingsScreen.tsx
```typescript
import { AppleSidebar } from '@/components/apple';
import { Icon } from '@/components/common';

const SettingsScreen = () => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('table_management');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarItems: AppleSidebarItem[] = [
    {
      id: 'restaurant_profile',
      label: 'Restaurant Profile',
      icon: <Icon name="store" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.error,
      selected: activeCategory === 'restaurant_profile',
      onPress: () => setActiveCategory('restaurant_profile'),
    },
    {
      id: 'table_management',
      label: 'Table Management',
      icon: <Icon name="table-furniture" size={20} color={theme.colors.white} />,
      iconBackground: theme.colors.success,
      selected: activeCategory === 'table_management',
      onPress: () => setActiveCategory('table_management'),
      badge: 3, // Optional badge
    },
    // ... more items
  ];

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <AppleSidebar
        items={sidebarItems}
        title="Settings Categories"
        searchable={true}
        collapsible={true}
        defaultCollapsed={false}
        persistState={true}
        storageKey="settings_sidebar_collapsed"
        onCollapseChange={(collapsed) => {
          setSidebarCollapsed(collapsed);
          console.log('Sidebar collapsed:', collapsed);
        }}
      />

      <View
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? 0 : theme.spacing.lg,
        }}
      >
        {/* Main content */}
      </View>
    </View>
  );
};
```

---

## Testing Checklist

### Functional Testing
- [ ] Sidebar collapses to 64px
- [ ] Sidebar expands to 280px
- [ ] Animation is smooth (300ms)
- [ ] Text fades correctly
- [ ] Icons remain visible when collapsed
- [ ] Tooltips appear on hover (collapsed state)
- [ ] Selected state visible in both modes
- [ ] State persists across app restarts
- [ ] Collapse/expand button works

### Responsive Testing
- [ ] Auto-collapses on mobile (<768px)
- [ ] Manual toggle on tablet/desktop
- [ ] Handles orientation changes
- [ ] Content panel adjusts width

### Accessibility Testing
- [ ] Screen reader announces state
- [ ] Keyboard shortcut works (web)
- [ ] Touch targets ≥ 44x44
- [ ] Focus indicators visible
- [ ] All icons have labels

### Performance Testing
- [ ] Animation runs at 60fps
- [ ] No memory leaks
- [ ] AsyncStorage errors handled
- [ ] Smooth on low-end devices

---

**Collapsible Sidebar Status:** COMPLETE
**Last Updated:** 2025-10-08
**Ready for Implementation:** YES
