# ProfessionalTheme Usage Audit Results

**Audit Date**: September 28, 2025
**Total Files Found**: 14 files
**Total Usage Count**: ~715 occurrences

## 📊 Usage Breakdown by Priority

### 🔴 **CRITICAL PRIORITY** (High Usage - Menu Management)
**Target for Day 1-2 Migration**

| File | Usage Count | File Type | Priority Reason |
|------|-------------|-----------|-----------------|
| `MenuItemCard.tsx` | 96 | Component | Highest individual usage |
| `MenuItemFiltersBar.tsx` | 89 | Component | Second highest usage |
| `AddMenuItemModal.tsx` | 75 | Modal | Complex component |
| `MenuStatsPanel.tsx` | 71 | Panel | Stats dashboard |
| `SearchFilterBar.tsx` | 61 | Filter | Search functionality |
| `CategoryCard.tsx` | 49 | Component | Category display |

**Subtotal**: 441 usages (62% of total usage)

### 🟡 **HIGH PRIORITY** (Menu Management Core)
**Target for Day 2 Migration**

| File | Usage Count | File Type | Priority Reason |
|------|-------------|-----------|-----------------|
| `MenuItemsScreen.tsx` | 45 | Screen | Main menu management screen |

**Subtotal**: 45 usages (6% of total usage)

### 🟢 **MEDIUM PRIORITY** (Dashboard Components)
**Target for Day 2-3 Migration**

| File | Usage Count | File Type | Priority Reason |
|------|-------------|-----------|-----------------|
| `ChartsSection.tsx` | 34 | Component | Chart visualization |
| `QuickActionsSection.tsx` | 26 | Component | Action buttons |
| `KPICard.tsx` | 17 | Component | KPI display |
| `SimpleChart.tsx` | 19 | Component | Chart component |
| `KPISection.tsx` | 13 | Component | KPI section |

**Subtotal**: 109 usages (15% of total usage)

### 🔵 **LOW PRIORITY** (Theme Definition)
**Target for Day 3 Migration**

| File | Usage Count | File Type | Priority Reason |
|------|-------------|-----------|-----------------|
| `constants/theme.ts` | 37 | Config | Theme definition file |

**Subtotal**: 37 usages (5% of total usage)

## 🎯 Migration Strategy

### Phase 1: Menu Management Core (Day 1)
**Focus**: Highest-impact files with most usage
- `MenuItemCard.tsx` (96 usages)
- `MenuItemFiltersBar.tsx` (89 usages)
- `AddMenuItemModal.tsx` (75 usages)

**Expected Impact**: 260 usages migrated (36% of total)

### Phase 2: Menu Management Extended (Day 2)
**Focus**: Complete menu management consistency
- `MenuStatsPanel.tsx` (71 usages)
- `SearchFilterBar.tsx` (61 usages)
- `CategoryCard.tsx` (49 usages)
- `MenuItemsScreen.tsx` (45 usages)

**Expected Impact**: 226 usages migrated (32% of total)

### Phase 3: Dashboard Components (Day 2-3)
**Focus**: Dashboard consistency and visual validation
- All dashboard component files (109 total usages)

**Expected Impact**: 109 usages migrated (15% of total)

### Phase 4: Theme Definition Cleanup (Day 3)
**Focus**: Remove ProfessionalTheme source
- `constants/theme.ts` (37 usages)

**Expected Impact**: 37 usages migrated (5% of total)

## 🔧 Technical Migration Pattern

### Current Anti-Pattern
```typescript
import { ProfessionalTheme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: ProfessionalTheme.colors.surface,
    color: ProfessionalTheme.colors.text,
    borderRadius: ProfessionalTheme.borderRadius.md,
  }
});
```

### Target Pattern
```typescript
import { useTheme } from '@/hooks/useTheme';

const Component = () => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurface,
      borderRadius: theme.borderRadius.md,
    }
  });

  return <View style={styles.container} />;
};
```

## 📋 Common Replacements Needed

### Color Mappings
- `ProfessionalTheme.colors.surface` → `theme.colors.surface`
- `ProfessionalTheme.colors.text` → `theme.colors.onSurface`
- `ProfessionalTheme.colors.textSecondary` → `theme.colors.onSurfaceVariant`
- `ProfessionalTheme.colors.primary` → `theme.colors.primary`
- `ProfessionalTheme.colors.error` → `theme.colors.error`
- `ProfessionalTheme.colors.success` → `theme.colors.success`

### Spacing Mappings
- `ProfessionalTheme.spacing.xs` → `theme.spacing.xs`
- `ProfessionalTheme.spacing.sm` → `theme.spacing.sm`
- `ProfessionalTheme.spacing.md` → `theme.spacing.md`
- `ProfessionalTheme.spacing.lg` → `theme.spacing.lg`
- `ProfessionalTheme.spacing.xl` → `theme.spacing.xl`

### Border Radius Mappings
- `ProfessionalTheme.borderRadius.sm` → `theme.borderRadius.sm`
- `ProfessionalTheme.borderRadius.md` → `theme.borderRadius.md`
- `ProfessionalTheme.borderRadius.lg` → `theme.borderRadius.lg`

## ⚠️ Migration Risks

### High Risk Files
- **MenuItemCard.tsx**: 96 usages, complex component, business-critical
- **MenuItemFiltersBar.tsx**: 89 usages, filtering logic, user interaction
- **AddMenuItemModal.tsx**: 75 usages, form component, data validation

### Mitigation Strategies
1. **Incremental Migration**: One component at a time
2. **Visual Validation**: Screenshot comparison before/after
3. **Functional Testing**: Ensure all interactions work
4. **Rollback Plan**: Git commits for easy reversion

## 📈 Success Metrics

### Day 1 Target
- [ ] 3 menu management files migrated (260 usages, 36%)
- [ ] Visual consistency validated
- [ ] No functional regressions

### Day 2 Target
- [ ] 7 menu management files migrated (486 usages, 68%)
- [ ] Dashboard component migration started
- [ ] Performance impact assessed

### Day 3 Target
- [ ] All 14 files migrated (715 usages, 100%)
- [ ] ProfessionalTheme completely removed
- [ ] Theme consolidation complete

---

**Status**: ✅ Audit Complete
**Next Action**: Create automated migration script
**Timeline**: Begin Phase 1 migration today