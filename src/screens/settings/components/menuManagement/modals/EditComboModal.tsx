/**
 * EditComboModal Component
 * Tabbed interface for editing an existing combo deal
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  ComboDeal,
  ComboAvailability,
  UpdateComboRequest,
  ComboItemCategory,
  MenuItemExtended,
} from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';
import ComboItemSelector from '../components/ComboItemSelector';
import ComboAvailabilityEditor from '../components/ComboAvailabilityEditor';

interface SelectedComboItem {
  menu_item_id?: string;
  category_choice?: string;
  quantity: number;
  is_substitutable: boolean;
  substitution_options: string[];
  price_override?: number;
  item_category: ComboItemCategory;
}

export interface ComboUpdateData extends UpdateComboRequest {
  id: string;
}

interface EditComboModalProps {
  visible: boolean;
  combo: ComboDeal | null;
  menuItems: MenuItemExtended[];
  categories: CategoryWithStats[];
  onClose: () => void;
  onSave: (id: string, data: UpdateComboRequest) => Promise<void>;
}

type TabType = 'basic' | 'items' | 'pricing' | 'availability';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'basic', label: 'Basic', icon: 'information' },
  { id: 'items', label: 'Items', icon: 'food-variant' },
  { id: 'pricing', label: 'Pricing', icon: 'cash-multiple' },
  { id: 'availability', label: 'Schedule', icon: 'clock-outline' },
];

export const EditComboModal: React.FC<EditComboModalProps> = ({
  visible,
  combo,
  menuItems,
  categories,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>([]);
  const [comboPrice, setComboPrice] = useState('');
  const [availability, setAvailability] = useState<ComboAvailability>({
    always_available: true,
  });

  // Populate form when combo changes
  useEffect(() => {
    if (combo) {
      setName(combo.name);
      setDescription(combo.description || '');
      setImageUrl(combo.image_url || '');
      setIsActive(combo.is_active);
      setComboPrice(combo.combo_price.toString());
      setAvailability(combo.availability);

      // Convert combo items to selected items format
      const items: SelectedComboItem[] = combo.combo_items.map(item => ({
        menu_item_id: item.menu_item_id,
        category_choice: item.category_choice,
        quantity: item.quantity,
        is_substitutable: item.is_substitutable,
        substitution_options: item.substitution_options || [],
        price_override: item.price_override,
        item_category: item.item_category,
      }));
      setSelectedItems(items);

      setActiveTab('basic');
      setErrors({});
    }
  }, [combo]);

  // Calculate regular price
  const regularPrice = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      if (item.menu_item_id) {
        const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
        return total + (menuItem?.price || 0) * item.quantity;
      }
      if (item.category_choice) {
        const categoryItems = menuItems.filter(mi => {
          const cat = categories.find(c => c.name === item.category_choice);
          return cat && mi.category_id === cat.id;
        });
        const avgPrice = categoryItems.length > 0
          ? categoryItems.reduce((sum, i) => sum + i.price, 0) / categoryItems.length
          : 0;
        return total + avgPrice * item.quantity;
      }
      return total;
    }, 0);
  }, [selectedItems, menuItems, categories]);

  const savings = useMemo(() => {
    const price = parseFloat(comboPrice) || 0;
    const amount = regularPrice - price;
    const percentage = regularPrice > 0 ? (amount / regularPrice) * 100 : 0;
    return { amount, percentage };
  }, [regularPrice, comboPrice]);

  const handleClose = useCallback(() => {
    setErrors({});
    onClose();
  }, [onClose]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Combo name is required';
    }

    if (selectedItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    const price = parseFloat(comboPrice);
    if (!comboPrice || isNaN(price) || price <= 0) {
      newErrors.comboPrice = 'Valid combo price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, selectedItems, comboPrice]);

  const handleSave = useCallback(async () => {
    if (!validateForm() || !combo) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateComboRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        is_active: isActive,
        combo_price: parseFloat(comboPrice),
        availability,
        combo_items: selectedItems.map(item => ({
          menu_item_id: item.menu_item_id,
          category_choice: item.category_choice,
          quantity: item.quantity,
          is_substitutable: item.is_substitutable,
          substitution_options: item.substitution_options,
          price_override: item.price_override,
          item_category: item.item_category,
        })),
      };

      await onSave(combo.id, updateData);
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to update combo. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    combo,
    name,
    description,
    imageUrl,
    isActive,
    comboPrice,
    availability,
    selectedItems,
    onSave,
    handleClose,
  ]);

  const renderTab = (tab: typeof TABS[0]) => {
    const isActive = activeTab === tab.id;
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => setActiveTab(tab.id)}
        accessibilityLabel={`${tab.label} tab`}
        accessibilityState={{ selected: isActive }}
      >
        <MaterialCommunityIcons
          name={tab.icon as any}
          size={16}
          color={isActive ? theme.colors.primary : theme.colors.onSurfaceSecondary}
        />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBasicTab = () => (
    <View style={styles.tabContent}>
      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{selectedItems.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${combo?.combo_price.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Price</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {combo?.savings_percentage.toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Savings</Text>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchLabel}>
          <Text style={styles.switchTitle}>Active</Text>
          <Text style={styles.switchDescription}>
            Show this combo to customers
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{
            false: theme.colors.outline,
            true: theme.colors.primaryLight,
          }}
          thumbColor={isActive ? theme.colors.primary : theme.colors.surface}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Combo Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Family Meal Deal"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          maxLength={60}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what's included"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          multiline
          maxLength={200}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={theme.colors.onSurfaceSecondary}
          keyboardType="url"
        />
      </View>
    </View>
  );

  const renderItemsTab = () => (
    <View style={styles.tabContent}>
      {errors.items && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errors.items}</Text>
        </View>
      )}

      <ComboItemSelector
        menuItems={menuItems}
        categories={categories}
        selectedItems={selectedItems}
        onItemsChange={setSelectedItems}
      />
    </View>
  );

  const renderPricingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.pricingCard}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Regular Price (total)</Text>
          <Text style={styles.pricingValue}>${regularPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Combo Price *</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.pricePrefix}>$</Text>
            <TextInput
              style={[styles.input, styles.priceInput, errors.comboPrice && styles.inputError]}
              value={comboPrice}
              onChangeText={setComboPrice}
              placeholder="0.00"
              placeholderTextColor={theme.colors.onSurfaceSecondary}
              keyboardType="decimal-pad"
            />
          </View>
          {errors.comboPrice && <Text style={styles.errorText}>{errors.comboPrice}</Text>}
        </View>

        {savings.amount > 0 && (
          <View style={styles.savingsRow}>
            <MaterialCommunityIcons name="sale" size={18} color={theme.colors.success} />
            <Text style={styles.savingsText}>
              Customers save ${savings.amount.toFixed(2)} ({savings.percentage.toFixed(0)}% off)
            </Text>
          </View>
        )}

        {savings.amount <= 0 && parseFloat(comboPrice) > 0 && (
          <View style={[styles.savingsRow, { backgroundColor: theme.colors.errorLight }]}>
            <MaterialCommunityIcons name="alert" size={18} color={theme.colors.error} />
            <Text style={[styles.savingsText, { color: theme.colors.error }]}>
              Combo price should be less than regular price
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information" size={18} color={theme.colors.primary} />
        <Text style={styles.infoText}>
          A good combo deal typically offers 15-30% savings compared to buying items separately.
          This encourages customers to choose the combo over individual items.
        </Text>
      </View>
    </View>
  );

  const renderAvailabilityTab = () => (
    <View style={styles.tabContent}>
      <ComboAvailabilityEditor
        availability={availability}
        onChange={setAvailability}
      />
    </View>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '95%',
      maxWidth: 600,
      height: '85%',
      minHeight: 500,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      gap: theme.spacing.xs,
    },
    tabActive: {
      backgroundColor: theme.colors.surface,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onSurfaceSecondary,
    },
    tabTextActive: {
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
    tabContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    switchLabel: {
      flex: 1,
    },
    switchTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceSecondary,
      marginTop: 2,
    },
    inputContainer: {
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    errorBox: {
      backgroundColor: theme.colors.errorLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    pricingCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    pricingLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceSecondary,
    },
    pricingValue: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pricePrefix: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginRight: theme.spacing.xs,
    },
    priceInput: {
      flex: 1,
    },
    savingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.successLight,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    savingsText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.success,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.primaryLight,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.primary,
      lineHeight: 18,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      gap: theme.spacing.sm,
    },
    cancelButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    saveButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.onSurfaceSecondary,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

  if (!combo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Combo Deal</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityLabel="Close modal"
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            {TABS.map(renderTab)}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'items' && renderItemsTab()}
            {activeTab === 'pricing' && renderPricingTab()}
            {activeTab === 'availability' && renderAvailabilityTab()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditComboModal;
