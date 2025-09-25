import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OverrideType } from '@/types/advanced-features.types';
import { theme } from '@/constants/theme';

interface SystemOverridesPanelProps {
  onOverride: (type: OverrideType) => void;
}

const OVERRIDE_OPTIONS = [
  {
    type: 'price' as OverrideType,
    title: '💰 Price Override',
    description: 'Modify item prices for special cases',
    color: '#FFF3E0',
    borderColor: theme.colors.warning,
    textColor: '#E65100',
  },
  {
    type: 'discount' as OverrideType,
    title: '🎫 Apply Custom Discount',
    description: 'Apply percentage or fixed amount discount',
    color: '#E3F2FD',
    borderColor: theme.colors.primary,
    textColor: '#0D47A1',
  },
  {
    type: 'void' as OverrideType,
    title: '❌ Void Transaction',
    description: 'Cancel completed transaction',
    color: '#FFEBEE',
    borderColor: '#C62828',
    textColor: '#B71C1C',
  },
  {
    type: 'comp' as OverrideType,
    title: '🆓 Comp Item/Order',
    description: 'Complimentary item for customer satisfaction',
    color: '#E8F5E8',
    borderColor: theme.colors.success,
    textColor: '#2E7D32',
  },
  {
    type: 'cash_drawer' as OverrideType,
    title: '💵 Force Open Cash Drawer',
    description: 'Manually open cash drawer',
    color: '#F3E5F5',
    borderColor: '#9C27B0',
    textColor: '#6A1B9A',
  },
];

export default function SystemOverridesPanel({ onOverride }: SystemOverridesPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Overrides</Text>
        <Text style={styles.warning}>⚠️ Requires Manager PIN</Text>
      </View>
      
      <View style={styles.overridesList}>
        {OVERRIDE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.overrideItem,
              {
                backgroundColor: option.color,
                borderColor: option.borderColor,
              }
            ]}
            onPress={() => onOverride(option.type)}
          >
            <Text style={[styles.overrideTitle, { color: option.textColor }]}>
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 360,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 350,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  warning: {
    fontSize: 11,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  overridesList: {
    flex: 1,
    gap: 10,
  },
  overrideItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  overrideTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
  },
});