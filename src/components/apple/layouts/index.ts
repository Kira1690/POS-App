// UNIVERSAL APPLE LAYOUT COMPONENTS
// Following SOLID principles for maximum reusability and maintainability

// CORE LAYOUT COMPONENTS
export { AppleSidebar } from './AppleSidebar';
export type { AppleSidebarItem } from './AppleSidebar';

export { AppleTopTabNavigation } from './AppleTopTabNavigation';
export type { AppleTopTabItem } from './AppleTopTabNavigation';

export {
  AppleContentPanel,
  AppleSettingsPanel,
  AppleDashboardPanel,
  AppleFormPanel,
  AppleListPanel,
  AppleDetailPanel,
} from './AppleContentPanel';

// LAYOUT COMBINATIONS (following Apple reference images)
// These represent the complete layout patterns seen in the 5 Apple reference images:
//
// SETTINGS LAYOUT (from Apple Settings reference):
// <View style={{ flexDirection: 'row', backgroundColor: layer0 }}>
//   <AppleSidebar items={settingsItems} title="Settings Categories" searchable />
//   <AppleSettingsPanel title="General">
//     {settingsContent}
//   </AppleSettingsPanel>
// </View>
//
// DASHBOARD LAYOUT (inspired by Apple's structured content):
// <AppleDashboardPanel
//   title="Restaurant Dashboard"
//   subtitle="Overview of today's operations"
//   headerActions={<AppleButton title="Refresh" />}
// >
//   {dashboardCards}
// </AppleDashboardPanel>
//
// MENU MANAGEMENT LAYOUT:
// <View style={{ flexDirection: 'row' }}>
//   <AppleSidebar items={menuCategories} title="Categories" />
//   <AppleListPanel title="Menu Items">
//     {menuItemsList}
//   </AppleListPanel>
// </View>
//
// ORDER DETAIL LAYOUT:
// <AppleDetailPanel
//   title="Order #1234"
//   subtitle="Table 5 • John Doe"
//   headerActions={orderActions}
// >
//   {orderDetails}
// </AppleDetailPanel>