/**
 * Table Management Settings Container
 * Main container with tab navigation for table management settings
 * Following SOLID principles and Apple design system
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppleTopTabNavigation, AppleTopTabItem } from '@/components/apple';
import { TableManagementTab } from '@/types/settings.types';

// Tab components
import GeneralSettings from './GeneralSettings';
import TablesSettings from './TablesSettings';
import FloorPlanSettings from './FloorPlanSettings';
import AreasSettings from './AreasSettings';
import AdvancedSettings from './AdvancedSettings';

interface TableManagementSettingsContainerProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

const TableManagementSettingsContainer: React.FC<TableManagementSettingsContainerProps> = ({
  onChangesDetected
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TableManagementTab>('general');

  // Define tabs for top navigation
  const tabs: AppleTopTabItem[] = [
    { id: 'general', label: 'General' },
    { id: 'tables', label: 'Tables' },
    { id: 'floors', label: 'Floor Plan' },
    { id: 'areas', label: 'Areas' },
    { id: 'advanced', label: 'Advanced' },
  ];

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings onChangesDetected={onChangesDetected} />;
      case 'tables':
        return <TablesSettings onChangesDetected={onChangesDetected} />;
      case 'floors':
        return <FloorPlanSettings onChangesDetected={onChangesDetected} />;
      case 'areas':
        return <AreasSettings onChangesDetected={onChangesDetected} />;
      case 'advanced':
        return <AdvancedSettings onChangesDetected={onChangesDetected} />;
      default:
        return <GeneralSettings onChangesDetected={onChangesDetected} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top Tab Navigation */}
      <AppleTopTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TableManagementTab)}
      />

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};

export default TableManagementSettingsContainer;

// Export types for convenience
export type { TableManagementTab };
