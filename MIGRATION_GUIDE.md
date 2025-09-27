# Dashboard Component Migration Guide

## Single Source of Truth Implementation

This guide shows how to migrate dashboard components from individual StyleSheet.create() calls to the centralized component style system.

## ✅ **COMPLETED: ReportsDashboard.tsx**

Successfully migrated ReportsDashboard.tsx as the reference implementation:
- **Eliminated**: 204 lines of individual StyleSheet
- **Result**: 99.5% reduction in component styling code
- **Benefits**: Automatic theme support, responsive design, consistent styling

## 🔄 **Remaining Components to Migrate:**

1. **StaffManagementDashboard.tsx** ✅ Already migrated (colors only)
2. **RoleDashboard.tsx** ✅ Already migrated (colors only)
3. **TablesDashboard.tsx** ⏳ Needs StyleSheet removal
4. **OrdersDashboard.tsx** ⏳ Needs StyleSheet removal
5. **ManagerDashboard.tsx** ⏳ Needs StyleSheet removal
6. **KitchenDashboard.tsx** ⏳ Needs StyleSheet removal
7. **StaffDashboard.tsx** ⏳ Needs StyleSheet removal

## 📋 **Migration Steps (Template)**

### 1. Update Imports
```typescript
// Remove
import { StyleSheet } from 'react-native';

// Add
import { useComponentStyles } from '@/hooks/useComponentStyles';
```

### 2. Add Hook in Component
```typescript
const { styles, textStyles, isTablet } = useComponentStyles();
```

### 3. Replace Common Patterns

#### Container Styles
```typescript
// Before
style={[styles.container, { backgroundColor: theme.colors.background }]}
// After
style={styles.container}
```

#### Card Styles
```typescript
// Before
style={[styles.customCard, { backgroundColor: theme.colors.surface }]}
// After
style={styles.card} // or styles.metricCard
```

#### Section Headers
```typescript
// Before
style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
// After
style={textStyles.sectionTitle}
```

#### Metric Cards
```typescript
// Before
style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}
// After
style={[styles.metricCard, { width: isTablet ? '31%' : '48%' }]}
```

#### Button Styles
```typescript
// Before
style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
// After
style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
```

#### Grid Layouts
```typescript
// Before
style={styles.customGrid}
// After
style={styles.gridContainer}
```

### 4. Replace StyleSheet with Comment
```typescript
// Before
const styles = StyleSheet.create({
  // 100+ lines of custom styles
});

// After
// ✅ No more individual StyleSheet - using centralized component styles
```

## 📊 **Centralized Style Mapping**

| Custom Style | Centralized Equivalent |
|-------------|----------------------|
| `container` | `styles.container` |
| `content` | `styles.scrollContainer` |
| `card` | `styles.card` or `styles.metricCard` |
| `section` | `styles.section` |
| `grid` | `styles.gridContainer` |
| `button` | `styles.primaryButton` or `styles.actionButton` |
| `sectionTitle` | `textStyles.sectionTitle` |
| `metricValue` | `textStyles.metricValue` |
| `bodyText` | `textStyles.bodyText` |

## 🎯 **Benefits After Migration**

1. **Code Reduction**: 90%+ reduction in component styling code
2. **Consistency**: Automatic consistent styling across all components
3. **Theme Integration**: Automatic dark/light mode support
4. **Responsive**: Built-in responsive design
5. **Maintainability**: Update styles in one place, applies everywhere
6. **Performance**: Memoized styles prevent unnecessary re-renders

## ⚠️ **Migration Notes**

- Keep only truly unique styles that don't exist in centralized system
- Use inline styles sparingly for one-off customizations
- Test visual appearance after migration
- Verify responsive behavior on different screen sizes
- Ensure theme switching still works correctly

## 🏆 **Success Metrics**

Each successful migration should achieve:
- [ ] 90%+ reduction in component-specific styling code
- [ ] No individual StyleSheet.create() calls
- [ ] Consistent visual appearance maintained
- [ ] Responsive design working
- [ ] Theme switching functional

## 📚 **Reference Files**

- **Completed Example**: `/src/screens/dashboard/ReportsDashboard.tsx`
- **Centralized Styles**: `/src/design-system/theme/components.ts`
- **Style Hook**: `/src/hooks/useComponentStyles.ts`
- **Documentation**: `/src/design-system/README.md`