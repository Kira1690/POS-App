/**
 * ItemNotesModal - Add special instructions to order items
 *
 * Features:
 * - Free-form text input for special instructions
 * - Kitchen notes separate from customer-visible notes
 * - Quick selection for common modifications
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface ItemNotesModalProps {
  visible: boolean;
  itemName: string;
  currentNotes?: string;
  currentKitchenNotes?: string;
  onSave: (notes: string, kitchenNotes: string) => void;
  onCancel: () => void;
}

const COMMON_NOTES = [
  'No onions',
  'Extra sauce',
  'Well done',
  'Medium rare',
  'Gluten-free',
  'Dairy-free',
  'No salt',
  'Extra spicy',
  'Mild',
  'On the side',
];

export const ItemNotesModal: React.FC<ItemNotesModalProps> = ({
  visible,
  itemName,
  currentNotes = '',
  currentKitchenNotes = '',
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState(currentNotes);
  const [kitchenNotes, setKitchenNotes] = useState(currentKitchenNotes);
  const [activeTab, setActiveTab] = useState<'customer' | 'kitchen'>('customer');

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      ...theme.typography.h4,
      color: theme.colors.onSurface,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    itemName: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    tabs: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    tabActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
    },
    tabTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    content: {
      padding: theme.spacing.md,
    },
    quickNotesSection: {
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.body2,
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    quickNotesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    quickNoteChip: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    quickNoteChipActive: {
      backgroundColor: theme.colors.primaryContainer,
      borderColor: theme.colors.primary,
    },
    quickNoteText: {
      ...theme.typography.caption,
      color: theme.colors.onSurface,
    },
    quickNoteTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    textInputSection: {
      marginBottom: theme.spacing.md,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.typography.body1,
      color: theme.colors.onSurface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    characterCount: {
      ...theme.typography.caption,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'right',
      marginTop: theme.spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    cancelButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...theme.typography.button,
      color: theme.colors.onSurface,
    },
    saveButton: {
      flex: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
      marginLeft: theme.spacing.xs,
    },
  });

  useEffect(() => {
    if (visible) {
      setNotes(currentNotes);
      setKitchenNotes(currentKitchenNotes);
    }
  }, [visible, currentNotes, currentKitchenNotes]);

  const handleQuickNoteToggle = useCallback(
    (note: string) => {
      const currentText = activeTab === 'customer' ? notes : kitchenNotes;
      const setter = activeTab === 'customer' ? setNotes : setKitchenNotes;

      if (currentText.includes(note)) {
        setter(currentText.replace(note, '').replace(/,\s*,/g, ', ').replace(/^,\s*|,\s*$/g, '').trim());
      } else {
        setter(currentText ? `${currentText}, ${note}` : note);
      }
    },
    [activeTab, notes, kitchenNotes]
  );

  const handleSave = useCallback(() => {
    onSave(notes.trim(), kitchenNotes.trim());
  }, [notes, kitchenNotes, onSave]);

  const currentText = activeTab === 'customer' ? notes : kitchenNotes;
  const setCurrentText = activeTab === 'customer' ? setNotes : setKitchenNotes;
  const maxLength = 200;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Special Instructions</Text>
              <Text style={styles.itemName}>{itemName}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'customer' && styles.tabActive]}
              onPress={() => setActiveTab('customer')}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={18}
                color={activeTab === 'customer' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.tabText, activeTab === 'customer' && styles.tabTextActive]}>
                Customer Notes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'kitchen' && styles.tabActive]}
              onPress={() => setActiveTab('kitchen')}
            >
              <MaterialCommunityIcons
                name="chef-hat"
                size={18}
                color={activeTab === 'kitchen' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.tabText, activeTab === 'kitchen' && styles.tabTextActive]}>
                Kitchen Notes
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Quick Notes */}
            <View style={styles.quickNotesSection}>
              <Text style={styles.sectionTitle}>Quick Add</Text>
              <View style={styles.quickNotesGrid}>
                {COMMON_NOTES.map((note) => {
                  const isActive = currentText.toLowerCase().includes(note.toLowerCase());
                  return (
                    <TouchableOpacity
                      key={note}
                      style={[styles.quickNoteChip, isActive && styles.quickNoteChipActive]}
                      onPress={() => handleQuickNoteToggle(note)}
                    >
                      <Text style={[styles.quickNoteText, isActive && styles.quickNoteTextActive]}>
                        {note}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Text Input */}
            <View style={styles.textInputSection}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'customer' ? 'Customer Instructions' : 'Kitchen Instructions'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={currentText}
                onChangeText={setCurrentText}
                placeholder={
                  activeTab === 'customer'
                    ? 'Add special instructions for this item...'
                    : 'Add notes for the kitchen...'
                }
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                maxLength={maxLength}
              />
              <Text style={styles.characterCount}>
                {currentText.length}/{maxLength}
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <MaterialCommunityIcons name="check" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.saveButtonText}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default ItemNotesModal;
