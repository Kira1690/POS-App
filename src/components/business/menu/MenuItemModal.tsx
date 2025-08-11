/**
 * Menu Item Modal - Professional item customization modal
 * Handles quantity selection, modifiers, and special instructions
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Button,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { MenuItem } from '@/types/menu.types';

interface MenuItemModalProps {
  menuItem: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, notes?: string) => void;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  menuItem,
  onAddToCart,
  onClose,
}) => {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(menuItem, quantity, notes.trim() || undefined);
  };

  const totalPrice = menuItem.price * quantity;

  return (
    <Surface 
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface }
      ]}
      elevation={4}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text 
          variant="titleLarge"
          style={[
            styles.title,
            { color: theme.colors.onSurface }
          ]}
        >
          Customize Item
        </Text>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
          iconColor={theme.colors.onSurface}
          style={styles.closeButton}
        />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Details */}
        <View style={styles.itemSection}>
          <View style={[
            styles.itemImagePlaceholder,
            { backgroundColor: theme.colors.primary + '20' }
          ]}>
            <MaterialIcons 
              name="restaurant"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          
          <View style={styles.itemInfo}>
            <Text 
              variant="headlineSmall"
              style={[
                styles.itemName,
                { color: theme.colors.onSurface }
              ]}
            >
              {menuItem.name}
            </Text>
            
            {menuItem.description && (
              <Text 
                variant="bodyMedium"
                style={[
                  styles.itemDescription,
                  { color: theme.colors.onSurface + 'CC' }
                ]}
              >
                {menuItem.description}
              </Text>
            )}
            
            <View style={styles.itemMeta}>
              <Text 
                variant="titleLarge"
                style={[
                  styles.itemPrice,
                  { color: theme.colors.primary }
                ]}
              >
                ₹{menuItem.price.toFixed(2)}
              </Text>
              
              {menuItem.preparation_time_minutes && (
                <View style={styles.prepTimeContainer}>
                  <MaterialIcons 
                    name="schedule"
                    size={16}
                    color={theme.colors.onSurface + 'AA'}
                  />
                  <Text 
                    variant="bodySmall"
                    style={[
                      styles.prepTime,
                      { color: theme.colors.onSurface + 'AA' }
                    ]}
                  >
                    {menuItem.preparation_time_minutes}m prep time
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quantity Selection */}
        <View style={styles.section}>
          <Text 
            variant="titleMedium"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Quantity
          </Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: quantity <= 1 ? 0.5 : 1,
                }
              ]}
              onPress={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <MaterialIcons 
                name="remove"
                size={24}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
            
            <Text 
              variant="headlineMedium"
              style={[
                styles.quantityText,
                { color: theme.colors.onSurface }
              ]}
            >
              {quantity}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                { 
                  backgroundColor: theme.colors.primary,
                  opacity: quantity >= 99 ? 0.5 : 1,
                }
              ]}
              onPress={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 99}
            >
              <MaterialIcons 
                name="add"
                size={24}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text 
            variant="titleMedium"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Special Instructions (Optional)
          </Text>
          
          <TextInput
            mode="outlined"
            placeholder="E.g., No onions, extra spicy, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
            contentStyle={styles.notesContent}
            maxLength={200}
            right={
              <TextInput.Affix 
                text={`${notes.length}/200`} 
                textStyle={{ 
                  color: theme.colors.onSurface + '88',
                  fontSize: 12,
                }}
              />
            }
          />
        </View>

        {/* Common Modifiers (Mock - would be dynamic in real implementation) */}
        <View style={styles.section}>
          <Text 
            variant="titleMedium"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface }
            ]}
          >
            Quick Options
          </Text>
          
          <View style={styles.modifiersGrid}>
            {['No Onions', 'Extra Spicy', 'Less Salt', 'Extra Sauce'].map((modifier) => (
              <TouchableOpacity
                key={modifier}
                style={[
                  styles.modifierChip,
                  { 
                    backgroundColor: notes.includes(modifier)
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  }
                ]}
                onPress={() => {
                  if (notes.includes(modifier)) {
                    setNotes(notes.replace(modifier, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim());
                  } else {
                    const newNotes = notes.trim() ? `${notes.trim()}, ${modifier}` : modifier;
                    if (newNotes.length <= 200) {
                      setNotes(newNotes);
                    }
                  }
                }}
              >
                <Text 
                  variant="bodyMedium"
                  style={[
                    styles.modifierText,
                    {
                      color: notes.includes(modifier)
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    }
                  ]}
                >
                  {modifier}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Price Display */}
        <Surface 
          style={[
            styles.totalSection,
            { backgroundColor: theme.colors.primaryContainer }
          ]}
          elevation={2}
        >
          <View style={styles.totalRow}>
            <Text 
              variant="titleMedium"
              style={[
                styles.totalLabel,
                { color: theme.colors.onPrimaryContainer }
              ]}
            >
              Total ({quantity} × ₹{menuItem.price.toFixed(2)}):
            </Text>
            <Text 
              variant="headlineMedium"
              style={[
                styles.totalPrice,
                { color: theme.colors.onPrimaryContainer }
              ]}
            >
              ₹{totalPrice.toFixed(2)}
            </Text>
          </View>
        </Surface>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={[
            styles.actionButton,
            styles.cancelButton,
          ]}
          contentStyle={styles.actionButtonContent}
        >
          Cancel
        </Button>
        
        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={[
            styles.actionButton,
            styles.addButton,
            { backgroundColor: theme.colors.primary }
          ]}
          contentStyle={styles.actionButtonContent}
          icon="cart-plus"
        >
          Add to Cart
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    maxHeight: '90%',
    minHeight: 400,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {
    margin: 0,
  },

  // Content
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },

  // Item details
  itemSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  itemDescription: {
    lineHeight: 20,
    marginBottom: 12,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontWeight: '700',
  },
  prepTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepTime: {
    marginLeft: 4,
  },

  // Quantity selection
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  quantityText: {
    fontWeight: '700',
    marginHorizontal: 32,
    minWidth: 60,
    textAlign: 'center',
  },

  // Notes input
  notesInput: {
    marginTop: 8,
  },
  notesContent: {
    paddingTop: 12,
  },

  // Modifiers
  modifiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  modifierChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  modifierText: {
    fontWeight: '500',
  },

  // Total section
  totalSection: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalPrice: {
    fontWeight: '700',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    marginRight: 12,
  },
  addButton: {
    marginLeft: 12,
    elevation: 4,
  },
});