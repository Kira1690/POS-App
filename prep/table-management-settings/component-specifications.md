# Component Specifications - Table Management Settings

## Critical Pattern: Theme Hook Usage

**ALL components MUST follow this exact pattern**:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';

const ComponentName: React.FC<Props> = (props) => {
  // 1. THEME HOOK FIRST (at component root)
  const { theme } = useTheme();

  // 2. State and other hooks
  const [state, setState] = useState();

  // 3. Event handlers
  const handleAction = () => { /* ... */ };

  // 4. StyleSheet AFTER theme hook (theme accessible)
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,      // ✅ CORRECT
      borderRadius: borderRadius.lg,              // ✅ CORRECT
      padding: spacing.lg,                        // ✅ CORRECT
      // ❌ WRONG: backgroundColor: '#FFFFFF'
      // ❌ WRONG: borderRadius: 20
    },
    text: {
      ...typography.bodyMedium,                   // ✅ CORRECT
      color: theme.colors.onSurface,              // ✅ CORRECT
      // ❌ WRONG: fontSize: 14, color: '#000'
    }
  });

  // 5. JSX render
  return <View style={styles.container}>...</View>;
};
```

---

## Component Specifications

### 1. TableCard.tsx
**Purpose**: Display individual table representation
**Lines**: ~120
**Path**: `/src/components/table-management/table-card/TableCard.tsx`

```typescript
interface TableCardProps {
  table: Table;
  selected?: boolean;
  onPress: (tableId: string) => void;
  onLongPress?: (tableId: string) => void;
}

const TableCard: React.FC<TableCardProps> = React.memo(
  ({ table, selected, onPress, onLongPress }) => {
    const { theme } = useTheme();

    const statusColor = getStatusColor(table.status, theme);

    const styles = StyleSheet.create({
      card: {
        backgroundColor: theme.colors.surface,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
        borderWidth: selected ? 2 : 0,
        borderColor: selected ? theme.colors.primary : 'transparent',
        padding: spacing.md,
        minHeight: touchTargets.pos,
        ...shadows.apple.card,
      },
      tableNumber: {
        ...typography.headlineMedium,
        fontWeight: '700',
        color: theme.colors.onSurface,
      },
    });

    return (
      <Pressable
        onPress={() => onPress(table.id)}
        onLongPress={() => onLongPress?.(table.id)}
      >
        <AppleCard layer="surface" size="medium" style={styles.card}>
          <Text style={styles.tableNumber}>Table {table.table_number}</Text>
          <CapacityBadge capacity={table.capacity} />
        </AppleCard>
      </Pressable>
    );
  }
);
```

**Theme Usage**:
- `theme.colors.surface` for background
- `theme.colors.onSurface` for text
- `theme.colors.primary` for selection border
- `getStatusColor()` helper for status-specific colors
- `spacing.md` for padding
- `borderRadius.lg` for corners
- `shadows.apple.card` for elevation

---

### 2. FloorPlanView.tsx
**Purpose**: Main floor plan layout composition
**Lines**: ~250
**Path**: `/src/components/table-management/floor-plan/FloorPlanView.tsx`

```typescript
interface FloorPlanViewProps {
  onTableSelect: (tableId: string) => void;
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({ onTableSelect }) => {
  const { theme } = useTheme();
  const { state, setFilter, setSearchQuery } = useTableManagement();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    gridSection: {
      flex: 1,
      padding: spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <FilterBar activeFilter={state.activeFilter} onFilterChange={setFilter} />
        <TableSearchBar query={state.searchQuery} onQueryChange={setSearchQuery} />
      </View>

      <View style={styles.gridSection}>
        <FloorPlanGrid tables={filteredTables} onTableSelect={onTableSelect} />
      </View>

      <TableLegend />
    </View>
  );
};
```

**Theme Usage**:
- All colors from `theme.colors.*`
- All spacing from `spacing.*`
- No hardcoded values

---

### 3. TableMergeModal.tsx
**Purpose**: Multi-step table merge workflow
**Lines**: ~280
**Path**: `/src/components/table-management/operations/TableMergeModal.tsx`

```typescript
interface TableMergeModalProps {
  visible: boolean;
  selectedTableIds: string[];
  onClose: () => void;
  onComplete: (config: MergeConfig) => Promise<void>;
}

const TableMergeModal: React.FC<TableMergeModalProps> = ({
  visible,
  selectedTableIds,
  onClose,
  onComplete,
}) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<MergeConfig>>({});

  const styles = StyleSheet.create({
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      maxWidth: 600,
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingBottom: spacing.md,
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.headlineMedium,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      gap: spacing.md,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <AppleCard layer="surface" size="large" style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Merge Tables</Text>
            <StepIndicator currentStep={step} totalSteps={3} />
          </View>

          {step === 1 && <TableSelectionGrid />}
          {step === 2 && <MergeConfigForm config={config} onChange={setConfig} />}
          {step === 3 && <MergeConfirmation config={config} />}

          <View style={styles.footer}>
            {step > 1 && (
              <AppleButton title="Back" variant="secondary" onPress={() => setStep(step - 1)} />
            )}
            <AppleButton
              title={step === 3 ? 'Confirm Merge' : 'Next'}
              variant="primary"
              onPress={step === 3 ? handleConfirm : () => setStep(step + 1)}
            />
          </View>
        </AppleCard>
      </View>
    </Modal>
  );
};
```

**Theme Usage**:
- Modal background: `theme.colors.surface`
- Border: `theme.colors.outline`
- Text: `theme.colors.onSurface`
- All spacing from `spacing.*`
- Border radius from `borderRadius.xl`

---

### 4. TableConfigurationForm.tsx
**Purpose**: Add/edit table form
**Lines**: ~280
**Path**: `/src/components/table-management/configuration/TableConfigurationForm.tsx`

```typescript
interface TableConfigurationFormProps {
  table?: Table; // Optional for edit mode
  onSubmit: (data: CreateTableRequest | UpdateTableRequest) => Promise<void>;
  onCancel: () => void;
}

const TableConfigurationForm: React.FC<TableConfigurationFormProps> = ({
  table,
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<TableFormData>(
    table || DEFAULT_TABLE_FORM_DATA
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = StyleSheet.create({
    form: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.titleLarge,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: spacing.md,
    },
    inputCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    inputLabel: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
      marginBottom: spacing.xs,
    },
    input: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      paddingVertical: spacing.sm,
    },
    error: {
      ...typography.bodySmall,
      color: theme.colors.error,
      marginTop: spacing.xs,
    },
  });

  return (
    <ScrollView style={styles.form}>
      {/* Basic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Table Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1, A1, VIP-1"
            value={formData.tableNumber}
            onChangeText={(value) => handleChange('tableNumber', value)}
          />
          {errors.tableNumber && <Text style={styles.error}>{errors.tableNumber}</Text>}
        </View>
      </View>

      {/* More sections... */}

      <View style={styles.footer}>
        <AppleButton title="Cancel" variant="secondary" onPress={onCancel} />
        <AppleButton
          title={table ? 'Update Table' : 'Create Table'}
          variant="primary"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
};
```

**Theme Usage**:
- Form background: `theme.colors.background`
- Card background: `theme.colors.surfaceVariant`
- Text colors: `theme.colors.onSurface`, `theme.colors.onSurfaceVariant`
- Error color: `theme.colors.error`
- Border: `theme.colors.outline`
- All typography from `typography.*`
- All spacing from `spacing.*`

---

## Universal Component Usage

### AppleCard
```typescript
<AppleCard
  layer="surface"           // surface | surfaceVariant | layer1 | layer2 | layer3
  size="medium"             // small | medium | large
  style={customStyles}      // Optional custom styles
  onPress={handlePress}     // Optional press handler
>
  {children}
</AppleCard>
```

### AppleButton
```typescript
<AppleButton
  title="Button Text"
  variant="primary"         // primary | secondary | success | warning | error
  size="medium"             // small | medium | large
  icon="🔄"                // Optional emoji icon
  onPress={handlePress}
  disabled={isDisabled}
  style={customStyles}
/>
```

### AppleStatusPill
```typescript
<AppleStatusPill
  status="available"        // available | occupied | reserved | cleaning
  text="Available"          // Optional custom text
  size="small"              // small | medium | large
  onPress={handlePress}     // Optional press handler
/>
```

### ApplePill
```typescript
<ApplePill
  text="Filter Text"
  selected={isSelected}
  color="primary"           // primary | success | warning | error | neutral
  size="small"              // small | medium | large
  onPress={handlePress}
  onClose={handleClose}     // Optional close button
/>
```

---

## Status Color Helper

```typescript
// Helper function used across all components
const getStatusColor = (status: TableStatus, theme: Theme): string => {
  switch (status) {
    case TableStatus.AVAILABLE:
      return theme.colors.success;
    case TableStatus.OCCUPIED:
      return theme.colors.error;
    case TableStatus.RESERVED:
      return theme.colors.warning;
    case TableStatus.CLEANING:
      return theme.colors.tertiary;
    case TableStatus.OUT_OF_SERVICE:
      return theme.colors.outline;
    default:
      return theme.colors.outline;
  }
};
```

---

## Performance Optimization Patterns

### React.memo
```typescript
export const TableCard = React.memo<TableCardProps>(
  ({ table, onPress }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.table.id === nextProps.table.id &&
      prevProps.table.status === nextProps.table.status &&
      prevProps.table.updated_at === nextProps.table.updated_at
    );
  }
);
```

### useCallback
```typescript
const handleTableSelect = useCallback((tableId: string) => {
  selectTable(tableId);
}, [selectTable]);
```

### useMemo
```typescript
const filteredTables = useMemo(() => {
  return tables.filter(table => {
    const matchesFilter = filter === 'all' || table.status === filter;
    const matchesSearch = table.table_number.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });
}, [tables, filter, searchQuery]);
```

---

## Error Handling Pattern

```typescript
const ComponentName = () => {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setError(null);
      await someAsyncOperation();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setError(message);
      showToast({ type: 'error', message });
    }
  };

  if (error) {
    return (
      <AppleCard layer="surface">
        <Text style={{ color: theme.colors.error }}>{error}</Text>
        <AppleButton title="Retry" onPress={handleAction} />
      </AppleCard>
    );
  }

  // Normal render
};
```

---

## Loading State Pattern

```typescript
const ComponentName = () => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Normal render
};
```

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Pattern Compliance**: 100% theme hook usage
**Component Count**: 35+ components
**All Under 300 Lines**: ✅ YES
