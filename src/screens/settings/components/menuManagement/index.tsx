/**
 * Menu Management Settings Container
 * Entry point for Menu Management in Settings tab
 * Follows the Table Management pattern for full-screen application
 */

import React from 'react';
import MenuEditorSettings from './MenuEditorSettings';

interface MenuManagementSettingsContainerProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

const MenuManagementSettingsContainer: React.FC<MenuManagementSettingsContainerProps> = ({
  onChangesDetected,
}) => {
  return <MenuEditorSettings onChangesDetected={onChangesDetected} />;
};

export default MenuManagementSettingsContainer;
