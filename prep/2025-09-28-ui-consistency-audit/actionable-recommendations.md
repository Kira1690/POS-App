# Actionable Recommendations with Code Examples

## 🎯 Quick Wins (Can be implemented immediately)

### 1. Theme Import Consolidation
**Impact**: High | **Effort**: Low | **Timeline**: 2-3 hours

#### Problem Example:
```typescript
// Current inconsistency across files
import { ProfessionalTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Some components use ProfessionalTheme
const styles = StyleSheet.create({
  card: {
    backgroundColor: ProfessionalTheme.colors.surface,
    color: ProfessionalTheme.colors.text,
  }
});

// Others use useTheme
const { theme } = useTheme();
const dynamicStyle = {
  backgroundColor: theme.colors.surface,
  color: theme.colors.onSurface,
};
```

#### Solution Implementation:
```typescript
// STEP 1: Create migration utility
export const migrateProfessionalTheme = (filePath: string) => {
  const replacements = {
    'ProfessionalTheme.colors.surface': 'theme.colors.surface',
    'ProfessionalTheme.colors.text': 'theme.colors.onSurface',
    'ProfessionalTheme.colors.textSecondary': 'theme.colors.onSurfaceVariant',
    'ProfessionalTheme.colors.primary': 'theme.colors.primary',
    'ProfessionalTheme.spacing.md': 'theme.spacing.md',
    'ProfessionalTheme.borderRadius.md': 'theme.borderRadius.md',
  };

  // Apply replacements...
};

// STEP 2: Update component pattern
// Before
import { ProfessionalTheme } from '@/constants/theme';
const styles = StyleSheet.create({
  container: {
    backgroundColor: ProfessionalTheme.colors.surface,
  }
});

// After
import { useTheme } from '@/hooks/useTheme';
const Component = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
    }
  });

  return <View style={styles.container} />;
};
```

#### Automated Migration Script:
```bash
#!/bin/bash
# migrate-theme.sh - Run this to migrate all ProfessionalTheme usage

# Find all files using ProfessionalTheme
files=$(grep -r "ProfessionalTheme" src/ --include="*.tsx" -l)

for file in $files; do
  echo "Migrating $file..."

  # Add useTheme import if not present
  if ! grep -q "import.*useTheme" "$file"; then
    sed -i '/import.*React/a import { useTheme } from '\''@/hooks/useTheme'\'';' "$file"
  fi

  # Replace common ProfessionalTheme patterns
  sed -i 's/ProfessionalTheme\.colors\.surface/theme.colors.surface/g' "$file"
  sed -i 's/ProfessionalTheme\.colors\.text/theme.colors.onSurface/g' "$file"
  sed -i 's/ProfessionalTheme\.colors\.textSecondary/theme.colors.onSurfaceVariant/g' "$file"
  sed -i 's/ProfessionalTheme\.spacing\.md/theme.spacing.md/g' "$file"

  # Remove ProfessionalTheme import
  sed -i '/import.*ProfessionalTheme/d' "$file"

  echo "Migrated $file ✓"
done
```

### 2. Hardcoded Color Elimination
**Impact**: Medium | **Effort**: Low | **Timeline**: 1-2 hours

#### Find and Replace Common Colors:
```bash
# Script to replace most common hardcoded colors
find src -name "*.tsx" -exec sed -i 's/#FFFFFF/theme.colors.surface/g' {} \;
find src -name "*.tsx" -exec sed -i 's/#1C1C1E/theme.colors.onSurface/g' {} \;
find src -name "*.tsx" -exec sed -i 's/#F2F2F7/theme.colors.background/g' {} \;
find src -name "*.tsx" -exec sed -i 's/#8E8E93/theme.colors.onSurfaceVariant/g' {} \;
find src -name "*.tsx" -exec sed -i 's/#007AFF/theme.colors.primary/g' {} \;
```

## 🔧 Component Standardization

### 3. Card Component Migration
**Impact**: High | **Effort**: Medium | **Timeline**: 1 week

#### Current Problem:
```typescript
// 3 different card implementations across the app

// StatsCard.tsx (Dashboard)
<StatsCard
  title="Revenue"
  value="$1,234"
  trend="up"
  trendValue="12%"
  style={customStyle}
/>

// MenuItemCard.tsx (Menu Management) - 579 lines!
<MenuItemCard
  item={menuItem}
  isSelected={selected}
  onSelect={handleSelect}
  onAction={handleAction}
  viewMode="grid"
/>

// Custom card implementations (Various screens)
<View style={styles.customCard}>
  <Text>Content</Text>
</View>
```

#### Solution: Universal AppleCard Pattern
```typescript
// STEP 1: Create specialized Apple components for common patterns

// AppleStatsCard.tsx - Wrapper around AppleCard
interface AppleStatsCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
}

export const AppleStatsCard: React.FC<AppleStatsCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <AppleCard
      layer="surface"
      size="medium"
      interactive={!!onPress}
      onPress={onPress}
    >
      <View style={styles.statsContent}>
        <Text style={[theme.typography.titleMedium, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <Text style={[theme.typography.headlineMedium, { color: theme.colors.primary }]}>
          {value}
        </Text>
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Text style={{
              color: trend === 'up' ? theme.colors.success :
                     trend === 'down' ? theme.colors.error :
                     theme.colors.onSurfaceVariant
            }}>
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'} {trendValue}
            </Text>
          </View>
        )}
      </View>
    </AppleCard>
  );
};

// STEP 2: Replace existing usage
// Before
<StatsCard title="Revenue" value="$1,234" trend="up" trendValue="12%" />

// After
<AppleStatsCard title="Revenue" value="$1,234" trend="up" trendValue="12%" />
```

#### Menu Item Card Migration:
```typescript
// STEP 1: Break down 579-line component into smaller pieces

// MenuItemContent.tsx - Pure presentation component
interface MenuItemContentProps {
  item: MenuItemWithStats;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
}

export const MenuItemContent: React.FC<MenuItemContentProps> = ({
  item,
  viewMode,
  isSelected
}) => {
  const { theme } = useTheme();

  if (viewMode === 'grid') {
    return (
      <View style={styles.gridContent}>
        <MenuItemImage item={item} />
        <MenuItemInfo item={item} />
        <MenuItemStats item={item} />
      </View>
    );
  }

  return (
    <View style={styles.listContent}>
      <MenuItemImage item={item} size="small" />
      <MenuItemDetails item={item} />
      <MenuItemPrice item={item} />
    </View>
  );
};

// MenuItemActions.tsx - Action buttons component
interface MenuItemActionsProps {
  itemId: string;
  isAvailable: boolean;
  onAction: (itemId: string, action: string) => void;
}

export const MenuItemActions: React.FC<MenuItemActionsProps> = ({
  itemId,
  isAvailable,
  onAction,
}) => (
  <View style={styles.actions}>
    <AppleButton
      title="Edit"
      variant="secondary"
      size="small"
      onPress={() => onAction(itemId, 'edit')}
    />
    <AppleButton
      title={isAvailable ? 'Disable' : 'Enable'}
      variant={isAvailable ? 'destructive' : 'primary'}
      size="small"
      onPress={() => onAction(itemId, 'toggle')}
    />
  </View>
);

// STEP 2: Compose with AppleCard
export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  isSelected,
  onSelect,
  onAction,
  viewMode,
}) => (
  <AppleCard
    layer="surface"
    size={viewMode === 'grid' ? 'large' : 'medium'}
    interactive
    onPress={onSelect}
    style={[
      viewMode === 'grid' ? styles.gridCard : styles.listCard,
      isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
    ]}
  >
    <MenuItemContent item={item} viewMode={viewMode} isSelected={isSelected} />
    <MenuItemActions
      itemId={item.id}
      isAvailable={item.is_available}
      onAction={onAction}
    />
  </AppleCard>
);
```

### 4. Button Standardization
**Impact**: Medium | **Effort**: Low | **Timeline**: 2-3 days

#### Current Anti-Pattern:
```typescript
// Scattered throughout the codebase
<TouchableOpacity
  style={{
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  }}
  onPress={handlePress}
>
  <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
    Custom Button
  </Text>
</TouchableOpacity>

// AuthButton - custom implementation
<AuthButton
  title="Sign In"
  variant="primary"
  onPress={handleSignIn}
/>
```

#### Solution: AppleButton Everywhere
```typescript
// Replace all custom buttons with AppleButton
<AppleButton
  title="Sign In"
  variant="primary"
  size="large"
  onPress={handleSignIn}
/>

// For specialized cases, extend AppleButton
interface AuthButtonProps extends Omit<AppleButtonProps, 'variant'> {
  authVariant?: 'login' | 'register' | 'forgot';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  authVariant = 'login',
  ...props
}) => {
  const getVariant = () => {
    switch (authVariant) {
      case 'login': return 'primary';
      case 'register': return 'secondary';
      case 'forgot': return 'ghost';
    }
  };

  return (
    <AppleButton
      variant={getVariant()}
      size="large"
      {...props}
    />
  );
};
```

## 🏗️ Architecture Improvements

### 5. Style Utility System
**Impact**: High | **Effort**: Medium | **Timeline**: 1 week

#### Create Theme-Based Utilities:
```typescript
// src/utils/styleUtils.ts
import { Theme } from '@/design-system/theme';
import { ViewStyle, TextStyle } from 'react-native';

// Card utility functions
export const createCardStyle = (
  theme: Theme,
  variant: 'default' | 'elevated' | 'outlined' = 'default'
): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  ...theme.shadows.card,
  ...(variant === 'elevated' && theme.shadows.floating),
  ...(variant === 'outlined' && {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    ...theme.shadows.sm, // Lighter shadow for outlined
  }),
});

// Button utility functions
export const createButtonStyle = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive',
  size: 'small' | 'medium' | 'large' = 'medium'
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...getSizeStyle(theme, size),
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.outline,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    case 'destructive':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.error,
      };
  }
};

// Text utility functions
export const createTextStyle = (
  theme: Theme,
  variant: keyof typeof theme.typography,
  color?: string
): TextStyle => ({
  ...theme.typography[variant],
  color: color || theme.colors.onSurface,
});

// Layout utility functions
export const createLayoutStyle = (
  theme: Theme,
  type: 'container' | 'section' | 'row' | 'column'
): ViewStyle => {
  switch (type) {
    case 'container':
      return {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      };
    case 'section':
      return {
        marginBottom: theme.spacing.xl,
      };
    case 'row':
      return {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
      };
    case 'column':
      return {
        flexDirection: 'column',
        gap: theme.spacing.sm,
      };
  }
};

// Usage in components
const Component = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: createLayoutStyle(theme, 'container'),
    card: createCardStyle(theme, 'elevated'),
    button: createButtonStyle(theme, 'primary', 'large'),
    title: createTextStyle(theme, 'headlineMedium'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Title</Text>
        <TouchableOpacity style={styles.button}>
          <Text>Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

### 6. Component Pattern Guidelines
**Impact**: Medium | **Effort**: Low | **Timeline**: 1-2 days

#### Establish Component Patterns:
```typescript
// src/components/patterns/README.md

// PATTERN 1: Screen Layout
const ScreenComponent = () => {
  const { theme } = useTheme();

  return (
    <AppleContentPanel
      title="Screen Title"
      subtitle="Optional subtitle"
      headerActions={<HeaderActions />}
    >
      <AppleCard layer="surface" size="large">
        <Content />
      </AppleCard>
    </AppleContentPanel>
  );
};

// PATTERN 2: List Item
const ListItemComponent = ({ item, onPress }) => (
  <AppleCard
    layer="surface"
    size="medium"
    interactive
    onPress={onPress}
  >
    <ListItemContent item={item} />
  </AppleCard>
);

// PATTERN 3: Form Section
const FormSectionComponent = ({ title, children }) => {
  const { theme } = useTheme();

  return (
    <AppleCard layer="surfaceVariant" size="large">
      <Text style={[theme.typography.titleMedium, { marginBottom: theme.spacing.md }]}>
        {title}
      </Text>
      {children}
    </AppleCard>
  );
};
```

## 🔍 Quality Assurance

### 7. Visual Regression Prevention
**Impact**: Critical | **Effort**: Medium | **Timeline**: 2-3 days

#### Set Up Screenshot Testing:
```typescript
// src/utils/visualTesting.ts
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const renderWithTheme = (component: React.ReactElement, darkMode = false) => {
  return render(
    <ThemeProvider initialColorScheme={darkMode ? 'dark' : 'light'}>
      {component}
    </ThemeProvider>
  );
};

// Component visual test
describe('AppleCard Visual Tests', () => {
  it('should render consistently across themes', async () => {
    const component = (
      <AppleCard layer="surface" size="medium">
        <Text>Test Content</Text>
      </AppleCard>
    );

    // Light theme
    const lightRender = renderWithTheme(component, false);
    expect(lightRender).toMatchSnapshot('apple-card-light');

    // Dark theme
    const darkRender = renderWithTheme(component, true);
    expect(darkRender).toMatchSnapshot('apple-card-dark');
  });
});
```

### 8. Linting Rules for Consistency
**Impact**: Medium | **Effort**: Low | **Timeline**: 1 day

#### ESLint Rules:
```javascript
// .eslintrc.js - Add custom rules
module.exports = {
  rules: {
    // Prevent hardcoded colors
    'no-hardcoded-colors': [
      'error',
      {
        properties: ['backgroundColor', 'color', 'borderColor'],
        excludePattern: '^(transparent|inherit)$',
      },
    ],

    // Require theme usage
    'require-theme-import': [
      'error',
      {
        message: 'Use theme colors instead of hardcoded values',
      },
    ],

    // Prevent ProfessionalTheme usage
    'no-deprecated-theme': [
      'error',
      {
        deprecatedImports: ['ProfessionalTheme'],
        message: 'Use useTheme hook instead of ProfessionalTheme',
      },
    ],
  },
};
```

## 📊 Monitoring and Validation

### 9. Consistency Metrics Dashboard
**Impact**: Medium | **Effort**: Medium | **Timeline**: 2-3 days

#### Create Monitoring Script:
```typescript
// scripts/audit-consistency.ts
import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface ConsistencyMetrics {
  themeUsage: {
    useTheme: number;
    professionalTheme: number;
    hardcoded: number;
  };
  componentUsage: {
    appleComponents: number;
    legacyComponents: number;
    inlineStyles: number;
  };
  styleSheetCount: number;
  duplicatePatterns: number;
}

export const auditConsistency = (): ConsistencyMetrics => {
  const srcPath = join(process.cwd(), 'src');
  const files = getAllTsxFiles(srcPath);

  const metrics: ConsistencyMetrics = {
    themeUsage: {
      useTheme: 0,
      professionalTheme: 0,
      hardcoded: 0,
    },
    componentUsage: {
      appleComponents: 0,
      legacyComponents: 0,
      inlineStyles: 0,
    },
    styleSheetCount: 0,
    duplicatePatterns: 0,
  };

  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');

    // Count theme usage patterns
    if (content.includes('useTheme')) metrics.themeUsage.useTheme++;
    if (content.includes('ProfessionalTheme')) metrics.themeUsage.professionalTheme++;
    if (content.match(/#[0-9A-Fa-f]{6}/)) metrics.themeUsage.hardcoded++;

    // Count component patterns
    if (content.includes('Apple')) metrics.componentUsage.appleComponents++;
    if (content.includes('StyleSheet.create')) metrics.styleSheetCount++;
  });

  return metrics;
};

// Run audit and display results
const metrics = auditConsistency();
console.log('🎯 UI Consistency Audit Results:');
console.log(`Theme Usage Score: ${calculateThemeScore(metrics.themeUsage)}/10`);
console.log(`Component Consistency: ${calculateComponentScore(metrics.componentUsage)}/10`);
console.log(`Overall Score: ${calculateOverallScore(metrics)}/10`);
```

### 10. Automated Migration Validation
**Impact**: High | **Effort**: Low | **Timeline**: 1 day

#### Pre-commit Hook:
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running UI consistency checks..."

# Check for ProfessionalTheme usage
if grep -r "ProfessionalTheme" src/ --include="*.tsx" > /dev/null; then
  echo "❌ Found ProfessionalTheme usage - please migrate to useTheme"
  exit 1
fi

# Check for hardcoded colors
if grep -r "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" > /dev/null; then
  echo "⚠️  Found hardcoded colors - consider using theme colors"
  # Don't block commit, just warn
fi

# Check for StyleSheet.create count
stylesheet_count=$(grep -r "StyleSheet.create" src/ --include="*.tsx" | wc -l)
if [ $stylesheet_count -gt 30 ]; then
  echo "⚠️  High number of StyleSheet instances ($stylesheet_count) - consider consolidation"
fi

echo "✅ UI consistency checks passed"
```

## 🚀 Quick Implementation Checklist

### Immediate Actions (Next 24 hours):
- [ ] Run theme consolidation script on menu management files
- [ ] Replace 5 highest-usage ProfessionalTheme files
- [ ] Set up visual regression testing for AppleCard
- [ ] Create AppleStatsCard wrapper component

### Week 1 Goals:
- [ ] Eliminate all ProfessionalTheme usage (13 files)
- [ ] Migrate dashboard cards to AppleCard
- [ ] Create style utility functions
- [ ] Set up consistency monitoring

### Month 1 Goals:
- [ ] Achieve 9/10 consistency score
- [ ] Reduce StyleSheet instances to <30
- [ ] Complete component migration
- [ ] Establish design system guidelines

This comprehensive approach ensures systematic improvement of UI consistency while maintaining functionality and minimizing risk of regressions.