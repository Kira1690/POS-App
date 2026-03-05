/**
 * EditStationModal - Edit an existing kitchen station
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useKitchenConfig } from '@/context/kitchen/KitchenConfigContext';
import type { StationConfig } from '@/types/kitchen-ticket.types';

const PRESET_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
];

interface EditStationModalProps {
  visible: boolean;
  station: StationConfig | null;
  onClose: () => void;
}

export const EditStationModal: React.FC<EditStationModalProps> = ({
  visible,
  station,
  onClose,
}) => {
  const { theme } = useTheme();
  const { updateStation } = useKitchenConfig();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [defaultPrepTime, setDefaultPrepTime] = useState('15');
  const [alertThreshold, setAlertThreshold] = useState('20');
  const [isSaving, setIsSaving] = useState(false);

  // Populate fields when station changes
  useEffect(() => {
    if (station) {
      setName(station.name);
      setSelectedColor(station.color || PRESET_COLORS[0]);
      setDefaultPrepTime(String(station.defaultPrepTime ?? 15));
      setAlertThreshold(String(station.alertThreshold ?? 20));
    }
  }, [station]);

  const handleSave = useCallback(async () => {
    if (!station) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation', 'Station name is required.');
      return;
    }

    const prepTime = parseInt(defaultPrepTime, 10);
    const threshold = parseInt(alertThreshold, 10);
    if (isNaN(prepTime) || prepTime < 1) {
      Alert.alert('Validation', 'Default prep time must be a positive number.');
      return;
    }
    if (isNaN(threshold) || threshold < 1) {
      Alert.alert('Validation', 'Alert threshold must be a positive number.');
      return;
    }

    setIsSaving(true);
    try {
      await updateStation(station.station, {
        name: trimmedName,
        color: selectedColor,
        defaultPrepTime: prepTime,
        alertThreshold: threshold,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update station. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [station, name, selectedColor, defaultPrepTime, alertThreshold, updateStation, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      maxWidth: 480,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 15,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surfaceVariant,
    },
    colorRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    colorSwatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    colorSwatchSelected: {
      borderWidth: 3,
      borderColor: theme.colors.onSurface,
    },
    footer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    saveBtn: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    saveBtnText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Station</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.onSurfaceSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Station Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Station name"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSwatchSelected,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.label}>Default Prep Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={defaultPrepTime}
              onChangeText={setDefaultPrepTime}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
            />

            <Text style={styles.label}>Alert Threshold (minutes)</Text>
            <TextInput
              style={styles.input}
              value={alertThreshold}
              onChangeText={setAlertThreshold}
              keyboardType="numeric"
              placeholder="20"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSaving}
              testID="btn-update-station"
            >
              <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditStationModal;
