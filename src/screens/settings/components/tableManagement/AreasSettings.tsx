/**
 * Areas Settings Component
 * Section and area management for restaurant tables
 * Following SOLID principles and theme system
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';
import { Icon } from '@/components/common';
import { getAreaStats } from '@/data/tables';

interface AreasSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const AreasSettings: React.FC<AreasSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Use centralized area statistics
  const sections = getAreaStats();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    sectionCard: {
      marginBottom: spacing.md,
      padding: spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderRadius: borderRadius.lg as number,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    sectionHeaderText: {
      ...typography.headlineSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    sectionStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    statText: {
      ...typography.bodyMedium,
      color: theme.colors.onSurfaceVariant,
    },
    sectionActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    addButton: {
      marginTop: spacing.lg,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {sections.map((section) => (
        <AppleCard key={section.id} layer="surface" size="large" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name={section.icon} size={24} color={theme.colors.primary} accessibilityLabel={`${section.name} icon`} />
            <Text style={styles.sectionHeaderText}>{section.name}</Text>
          </View>

          <View style={styles.sectionStats}>
            <Text style={styles.statText}>Tables: {section.tables}</Text>
            <Text style={styles.statText}>Capacity: {section.capacity}</Text>
            <Text style={styles.statText}>Available: {section.available}</Text>
          </View>

          <View style={styles.sectionActions}>
            <AppleButton
              title="Edit"
              variant="secondary"
              size="small"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
            <AppleButton
              title="Delete"
              variant="destructive"
              size="small"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
            <AppleButton
              title="View Tables"
              variant="primary"
              size="small"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
          </View>
        </AppleCard>
      ))}

      <View style={styles.addButton}>
        <AppleButton
          title="Add New Section"
          variant="primary"
          size="medium"
          icon={<Icon name="plus" size={18} color={theme.colors.onPrimary} accessibilityLabel="Add new section icon" />}
          iconPosition="left"
          onPress={() => {}}
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

export default AreasSettings;
