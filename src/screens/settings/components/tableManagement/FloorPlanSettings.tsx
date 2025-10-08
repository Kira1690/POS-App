/**
 * Floor Plan Settings Component
 * Interactive floor plan editor integrated from TablesDashboard
 * Following SOLID principles and theme system
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/design-system/theme/spacing';
import { typography } from '@/design-system/theme/typography';
import { AppleCard } from '@/components/apple';

// NOTE: This will integrate the TablesDashboard floor plan component
// For now, we'll create a placeholder that can be replaced with the actual floor plan

interface FloorPlanSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const FloorPlanSettings: React.FC<FloorPlanSettingsProps> = ({ onChangesDetected }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
    },
    placeholder: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      ...typography.bodyLarge,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <AppleCard layer="surface" size="large">
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            📍 Interactive Floor Plan Editor
            {'\n\n'}
            This will display the visual floor plan from TablesDashboard
            {'\n'}
            with drag-and-drop table positioning.
            {'\n\n'}
            Features:
            {'\n'}• Visual restaurant layout
            {'\n'}• Drag-and-drop tables
            {'\n'}• Special areas (Kitchen, Bar, Entrance)
            {'\n'}• Save layout configurations
          </Text>
        </View>
      </AppleCard>
    </View>
  );
};

export default FloorPlanSettings;
