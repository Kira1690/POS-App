/**
 * Table Management Settings Container
 * Unified floor plan editor - no tabs, single application-like interface
 * Following SOLID principles and Apple design system
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

// Unified floor plan component
import FloorPlanSettings from './FloorPlanSettings';

interface TableManagementSettingsContainerProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const TableManagementSettingsContainer: React.FC<TableManagementSettingsContainerProps> = ({
  onChangesDetected
}) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <FloorPlanSettings onChangesDetected={onChangesDetected} />
    </View>
  );
};

export default TableManagementSettingsContainer;
