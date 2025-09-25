import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { OrderFilters } from '@/types/online-orders.types';
import { theme } from '@/constants/theme';

interface OrderFiltersBarProps {
  filters: OrderFilters;
  onFiltersChange: (filters: Partial<OrderFilters>) => void;
  autoAcceptEnabled: boolean;
  onAutoAcceptToggle: (enabled: boolean) => void;
}

export default function OrderFiltersBar({
  filters,
  onFiltersChange,
  autoAcceptEnabled,
  onAutoAcceptToggle,
}: OrderFiltersBarProps) {
  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'all': return 'All Platforms';
      case 'ubereats': return 'UberEats';
      case 'doordash': return 'DoorDash';
      case 'grubhub': return 'GrubHub';
      case 'postmates': return 'Postmates';
      default: return platform;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'all': return 'All Status';
      case 'new': return 'New Orders';
      case 'accepted': return 'Accepted';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getTimeRangeLabel = (timeRange: string) => {
    switch (timeRange) {
      case 'last_hour': return 'Last Hour';
      case 'last_2_hours': return 'Last 2 Hours';
      case 'today': return 'Today';
      case 'all': return 'All Time';
      default: return timeRange;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        {/* Platform Filter */}
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {getPlatformLabel(filters.platform)} ▼
          </Text>
        </TouchableOpacity>

        {/* Status Filter */}
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {getStatusLabel(filters.status)} ▼
          </Text>
        </TouchableOpacity>

        {/* Time Range Filter */}
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>
            {getTimeRangeLabel(filters.time_range)} ▼
          </Text>
        </TouchableOpacity>

        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search orders..."
          value={filters.search_query}
          onChangeText={(text) => onFiltersChange({ search_query: text })}
        />

        {/* Auto-Accept Toggle */}
        <TouchableOpacity
          style={[
            styles.autoAcceptButton,
            autoAcceptEnabled ? styles.autoAcceptEnabled : styles.autoAcceptDisabled
          ]}
          onPress={() => onAutoAcceptToggle(!autoAcceptEnabled)}
        >
          <Text style={[
            styles.autoAcceptText,
            autoAcceptEnabled ? styles.autoAcceptTextEnabled : styles.autoAcceptTextDisabled
          ]}>
            🔄 Auto-Accept: {autoAcceptEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightGray,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 12,
    flex: 1,
    minWidth: 150,
  },
  autoAcceptButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  autoAcceptEnabled: {
    backgroundColor: '#E8F5E8',
    borderColor: theme.colors.success,
  },
  autoAcceptDisabled: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
  },
  autoAcceptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  autoAcceptTextEnabled: {
    color: '#2E7D32',
  },
  autoAcceptTextDisabled: {
    color: theme.colors.textSecondary,
  },
});