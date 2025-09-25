import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Supplier } from '@/types/inventory.types';
import { theme } from '@/constants/theme';

interface SuppliersPanelProps {
  suppliers: Supplier[];
  onRefresh: () => void;
}

export default function SuppliersPanel({ suppliers, onRefresh }: SuppliersPanelProps) {
  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    return stars.padEnd(5, '☆');
  };

  const renderSupplier = ({ item: supplier }: { item: Supplier }) => (
    <TouchableOpacity style={styles.supplierCard}>
      <View style={styles.supplierHeader}>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.contactPerson}>{supplier.contact_person}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>{getRatingStars(supplier.rating)}</Text>
            <Text style={styles.ratingValue}>{supplier.rating.toFixed(1)}</Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: supplier.active ? theme.colors.success : theme.colors.error }
        ]}>
          <Text style={styles.statusText}>
            {supplier.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>📧</Text>
          <Text style={styles.contactText}>{supplier.email}</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>📞</Text>
          <Text style={styles.contactText}>{supplier.phone}</Text>
        </View>
      </View>

      <Text style={styles.address}>📍 {supplier.address}</Text>

      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryLabel}>Delivery Days:</Text>
        <View style={styles.deliveryDays}>
          {supplier.delivery_days.map((day, index) => (
            <View key={index} style={styles.dayBadge}>
              <Text style={styles.dayText}>{day.slice(0, 3)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.supplierFooter}>
        <View style={styles.paymentTerms}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text style={styles.paymentValue}>{supplier.payment_terms}</Text>
        </View>
        
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>📋 View Orders</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏢 Suppliers ({suppliers.length})</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Supplier</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={suppliers}
        renderItem={renderSupplier}
        keyExtractor={(item) => item.id}
        style={styles.suppliersList}
        contentContainerStyle={styles.suppliersContent}
        showsVerticalScrollIndicator={false}
        refreshing={false}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  suppliersList: {
    flex: 1,
  },
  suppliersContent: {
    padding: 15,
    gap: 15,
  },
  supplierCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  contactPerson: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 6,
  },
  ratingValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  contactInfo: {
    gap: 6,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 12,
    marginRight: 8,
    width: 16,
  },
  contactText: {
    fontSize: 11,
    color: theme.colors.text,
  },
  address: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  deliveryInfo: {
    marginBottom: 12,
  },
  deliveryLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  deliveryDays: {
    flexDirection: 'row',
    gap: 4,
  },
  dayBadge: {
    backgroundColor: theme.colors.lightGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayText: {
    fontSize: 9,
    color: theme.colors.text,
    fontWeight: '600',
  },
  supplierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTerms: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginRight: 6,
  },
  paymentValue: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewButtonText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
});