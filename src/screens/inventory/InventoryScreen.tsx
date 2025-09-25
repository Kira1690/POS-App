import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  InventoryItem,
  InventoryAlert,
  InventoryAnalytics,
  InventoryFilters,
  Supplier,
  PurchaseOrder,
} from '@/types/inventory.types';
import { MockInventoryService } from '@/services/inventory/MockInventoryService';
import {
  InventoryOverview,
  InventoryItemsList,
  InventoryAlerts,
  SuppliersPanel,
  PurchaseOrdersPanel,
  InventoryFiltersBar,
} from './components';
import { theme } from '@/constants/theme';

const TABS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'items', label: 'Items', icon: '📦' },
  { key: 'suppliers', label: 'Suppliers', icon: '🏪' },
  { key: 'orders', label: 'Orders', icon: '📋' },
  { key: 'alerts', label: 'Alerts', icon: '⚠️' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({});

  const inventoryService = MockInventoryService.getInstance();

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    if (activeTab === 'items') {
      loadInventoryItems();
    }
  }, [filters, activeTab]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      const [analyticsData, alertsData, suppliersData, ordersData] = await Promise.all([
        inventoryService.getInventoryAnalytics(),
        inventoryService.getInventoryAlerts(),
        inventoryService.getSuppliers(),
        inventoryService.getPurchaseOrders(),
      ]);

      setAnalytics(analyticsData);
      setAlerts(alertsData);
      setSuppliers(suppliersData);
      setPurchaseOrders(ordersData);
      
      // Load initial inventory items
      const itemsData = await inventoryService.getInventoryItems();
      setInventoryItems(itemsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const itemsData = await inventoryService.getInventoryItems(filters);
      setInventoryItems(itemsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory items');
    }
  };

  const handleRefresh = () => {
    loadInventoryData();
  };

  const handleTabChange = (tabKey: TabKey) => {
    setActiveTab(tabKey);
  };

  const handleFilterChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
  };

  const handleStockAdjustment = async (itemId: string, quantity: number, reason: string) => {
    try {
      await inventoryService.adjustStock(itemId, quantity, reason);
      Alert.alert('Success', 'Stock adjustment recorded');
      loadInventoryItems();
      loadInventoryData(); // Refresh analytics
    } catch (error) {
      Alert.alert('Error', 'Failed to adjust stock');
    }
  };

  const handleWasteRecord = async (itemId: string, quantity: number, reason: string) => {
    try {
      const item = inventoryItems.find(i => i.id === itemId);
      if (!item) return;

      await inventoryService.recordWaste({
        item_id: itemId,
        item_name: item.name,
        quantity_wasted: quantity,
        unit: item.unit,
        reason: reason as any,
        cost_impact: quantity * item.cost_per_unit,
        reported_by: 'current_user',
        date: new Date().toISOString().split('T')[0],
        notes: `Waste recorded via inventory management`,
      });

      Alert.alert('Success', 'Waste recorded and stock adjusted');
      loadInventoryItems();
      loadInventoryData();
    } catch (error) {
      Alert.alert('Error', 'Failed to record waste');
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await inventoryService.acknowledgeAlert(alertId);
      loadInventoryData();
    } catch (error) {
      Alert.alert('Error', 'Failed to acknowledge alert');
    }
  };

  const getTabBadgeCount = (tabKey: TabKey) => {
    switch (tabKey) {
      case 'alerts':
        return alerts.filter(alert => !alert.acknowledged).length;
      case 'items':
        return inventoryItems.filter(item => 
          item.status === 'low_stock' || item.status === 'out_of_stock'
        ).length;
      default:
        return 0;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return analytics ? (
          <InventoryOverview 
            analytics={analytics}
            alerts={alerts}
            onRefresh={handleRefresh}
            onViewAlerts={() => setActiveTab('alerts')}
            onViewItems={() => setActiveTab('items')}
          />
        ) : null;

      case 'items':
        return (
          <View style={styles.tabContent}>
            <InventoryFiltersBar
              filters={filters}
              onFilterChange={handleFilterChange}
              itemsCount={inventoryItems.length}
            />
            <InventoryItemsList
              items={inventoryItems}
              onStockAdjustment={handleStockAdjustment}
              onWasteRecord={handleWasteRecord}
              onRefresh={loadInventoryItems}
            />
          </View>
        );

      case 'suppliers':
        return (
          <SuppliersPanel
            suppliers={suppliers}
            onRefresh={loadInventoryData}
          />
        );

      case 'orders':
        return (
          <PurchaseOrdersPanel
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            onRefresh={loadInventoryData}
          />
        );

      case 'alerts':
        return (
          <InventoryAlerts
            alerts={alerts}
            onAcknowledge={handleAlertAcknowledge}
            onRefresh={loadInventoryData}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Inventory Management</Text>
          <Text style={styles.headerSubtitle}>
            Track stock levels, suppliers, and purchase orders
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          <View style={styles.tabs}>
            {TABS.map((tab) => {
              const badgeCount = getTabBadgeCount(tab.key);
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.activeTab
                  ]}
                  onPress={() => handleTabChange(tab.key)}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text style={[
                    styles.tabLabel,
                    activeTab === tab.key && styles.activeTabLabel
                  ]}>
                    {tab.label}
                  </Text>
                  {badgeCount > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{badgeCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    height: 80,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsScroll: {
    paddingHorizontal: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.lightGray,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activeTabLabel: {
    color: theme.colors.white,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 9,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
});