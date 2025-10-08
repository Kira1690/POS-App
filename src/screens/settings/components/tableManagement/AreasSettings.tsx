/**
 * Areas Settings Component
 * Section and area management for restaurant tables
 * Following SOLID principles and theme system
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard, AppleButton } from '@/components/apple';

interface AreasSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const AreasSettings: React.FC<AreasSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  // Mock sections data
  const sections = [
    {
      id: '1',
      name: '🍽️  MAIN DINING',
      tables: 12,
      capacity: 48,
      available: 8,
    },
    {
      id: '2',
      name: '🥂  VIP LOUNGE',
      tables: 4,
      capacity: 16,
      available: 2,
    },
    {
      id: '3',
      name: '🌳  PATIO',
      tables: 8,
      capacity: 32,
      available: 5,
    },
    {
      id: '4',
      name: '🍸  BAR SEATING',
      tables: 6,
      capacity: 12,
      available: 4,
    },
  ];

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
      ...typography.headlineSmall,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: spacing.md,
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
    <View style={styles.container}>
      {sections.map((section) => (
        <AppleCard key={section.id} layer="surface" size="large" style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{section.name}</Text>

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
          title="➕ Add New Section"
          variant="primary"
          size="medium"
          onPress={() => {}}
          fullWidth
        />
      </View>
    </View>
  );
};

export default AreasSettings;
