/**
 * KitchenManagementScreen - Manage kitchen stations and KOT settings
 * Accessible from Settings > Kitchen Management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useKitchenConfig } from '@/context/kitchen/KitchenConfigContext';
import type { StationConfig } from '@/types/kitchen-ticket.types';
import { AddStationModal } from './AddStationModal';
import { EditStationModal } from './EditStationModal';

const KitchenManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const { stations, isLoading, refreshStations, toggleStation, deleteStation, allowEditWhenReady, setAllowEditWhenReady } = useKitchenConfig();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState<StationConfig | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshStations();
    }, [refreshStations])
  );

  const handleToggle = useCallback(
    (station: StationConfig, value: boolean) => {
      toggleStation(station.station, value).catch(() => {
        Alert.alert('Error', 'Failed to update station status.');
      });
    },
    [toggleStation]
  );

  const handleDelete = useCallback(
    (station: StationConfig) => {
      Alert.alert(
        'Delete Station',
        `Are you sure you want to delete "${station.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteStation(station.station).catch(() => {
                Alert.alert('Error', 'Failed to delete station.');
              });
            },
          },
        ]
      );
    },
    [deleteStation]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
      fontSize: 14,
    },
    listContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    stationCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      ...theme.shadows.sm,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      flex: 1,
    },
    colorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    stationName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    stationMeta: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      marginLeft: 16 + theme.spacing.md,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.sm,
    },
    badgeText: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconBtn: {
      padding: theme.spacing.xs,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: theme.spacing.md,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceSecondary,
    },
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    settingsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    settingsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.md,
    },
    settingsTitle: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
    },
    settingsSubtitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
  });

  const renderStation = useCallback(
    ({ item }: { item: StationConfig }) => (
      <View style={styles.stationCard}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <View style={[styles.colorDot, { backgroundColor: item.color || theme.colors.primary }]} />
            <Text style={[styles.stationName, !item.isActive && { color: theme.colors.onSurfaceSecondary }]}>
              {item.name}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Switch
              value={item.isActive}
              onValueChange={(val) => handleToggle(item, val)}
              testID={`switch-station-${item.station}`}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={item.isActive ? theme.colors.onPrimary : theme.colors.onSurfaceSecondary}
            />
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setEditingStation(item)}
              testID={`btn-edit-station-${item.station}`}
            >
              <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(item)}
              testID={`btn-delete-station-${item.station}`}
            >
              <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.stationMeta}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.defaultPrepTime ?? 15}min prep</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Alert at {item.alertThreshold ?? 20}min</Text>
          </View>
        </View>
      </View>
    ),
    [styles, theme, handleToggle, handleDelete]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingState]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <MaterialIcons name="restaurant" size={22} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Kitchen Management</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
          testID="btn-add-station"
        >
          <MaterialIcons name="add" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.addButtonText}>Add Station</Text>
        </TouchableOpacity>
      </View>

      {/* Station list */}
      <Text style={styles.sectionLabel}>Kitchen Stations ({stations.length})</Text>

      <FlatList
        data={stations}
        keyExtractor={(item) => item.station}
        renderItem={renderStation}
        contentContainerStyle={[
          styles.listContent,
          stations.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="restaurant" size={48} color={theme.colors.outline} />
            <Text style={styles.emptyText}>No kitchen stations configured</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddModalVisible(true)}
            >
              <MaterialIcons name="add" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.addButtonText}>Add First Station</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* Kitchen Lock Setting */}
      <View style={styles.settingsCard}>
        <View style={styles.settingsRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingsTitle}>Allow editing ready orders</Text>
            <Text style={styles.settingsSubtitle}>
              When off, orders marked Ready cannot be modified
            </Text>
          </View>
          <Switch
            value={allowEditWhenReady}
            onValueChange={(val) => setAllowEditWhenReady(val).catch(() => {})}
            testID="toggle-allow-edit-when-ready"
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            thumbColor={allowEditWhenReady ? theme.colors.onPrimary : theme.colors.onSurfaceSecondary}
          />
        </View>
      </View>

      {/* Modals */}
      <AddStationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
      <EditStationModal
        visible={editingStation !== null}
        station={editingStation}
        onClose={() => setEditingStation(null)}
      />
    </View>
  );
};

export default KitchenManagementScreen;
