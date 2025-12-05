/**
 * FloorPlanTabs Component
 * Multi-floor tab navigation for the floor plan editor
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { Icon } from '@/components/common';
import { Floor } from '@/types/settings/table-management.types';

interface FloorPlanTabsProps {
  floors: Floor[];
  activeFloorId: string;
  onFloorSelect: (floorId: string) => void;
  onAddFloor?: () => void;
}

const FloorPlanTabs: React.FC<FloorPlanTabsProps> = ({
  floors,
  activeFloorId,
  onFloorSelect,
  onAddFloor,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    scrollContent: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    tabActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    tabText: {
      ...typography.labelMedium,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    tabTextActive: {
      color: theme.colors.primary,
    },
    addTab: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md as number,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    addTabText: {
      ...typography.labelMedium,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: spacing.xs,
    },
    defaultBadge: {
      ...typography.labelSmall,
      fontSize: 9,
      color: theme.colors.onSurfaceVariant,
      marginLeft: spacing.xs,
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {floors.map(floor => {
          const isActive = floor.id === activeFloorId;
          return (
            <TouchableOpacity
              key={floor.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onFloorSelect(floor.id)}
              accessibilityLabel={`${floor.name} floor`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                name={floor.is_default ? 'home-floor-1' : 'floor-plan'}
                size={18}
                color={isActive ? theme.colors.primary : theme.colors.onSurface}
                accessibilityLabel={floor.name}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {floor.name}
              </Text>
              {floor.is_default && (
                <Text style={styles.defaultBadge}>(default)</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Add floor button */}
        {onAddFloor && (
          <TouchableOpacity
            style={styles.addTab}
            onPress={onAddFloor}
            accessibilityLabel="Add new floor"
            accessibilityRole="button"
          >
            <Icon
              name="plus"
              size={18}
              color={theme.colors.primary}
              accessibilityLabel="Add"
            />
            <Text style={styles.addTabText}>Add Floor</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default React.memo(FloorPlanTabs);
