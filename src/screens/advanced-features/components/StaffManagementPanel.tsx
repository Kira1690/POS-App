import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StaffMember } from '@/types/advanced-features.types';
import { theme } from '@/constants/theme';

interface StaffManagementPanelProps {
  staffMembers: StaffMember[];
  onStaffAction: (action: string, staffId: string) => void;
}

export default function StaffManagementPanel({ staffMembers, onStaffAction }: StaffManagementPanelProps) {
  const getAvatarIcon = (role: string) => {
    switch (role) {
      case 'server': return '👨';
      case 'cashier': return '👩';
      case 'kitchen': return '👨‍🍳';
      case 'manager': return '👩‍💼';
      case 'host': return '👨‍💼';
      default: return '👤';
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const renderStaffMember = (staff: StaffMember, index: number) => (
    <View key={staff.id} style={[styles.staffItem, index % 2 === 0 ? styles.staffItemEven : styles.staffItemOdd]}>
      <View style={[styles.staffAvatar, { backgroundColor: staff.avatar_color }]}>
        <Text style={styles.avatarText}>{getAvatarIcon(staff.role)}</Text>
      </View>
      
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>
          {staff.name} ({staff.role.charAt(0).toUpperCase() + staff.role.slice(1)})
        </Text>
        <Text style={styles.staffShift}>Since {staff.shift_start}</Text>
      </View>
      
      <View style={styles.staffMetrics}>
        <Text style={styles.staffSales}>{formatCurrency(staff.sales_today)}</Text>
        {staff.status === 'break' ? (
          <TouchableOpacity 
            style={styles.breakButton} 
            onPress={() => onStaffAction('break', staff.id)}
          >
            <Text style={styles.breakButtonText}>🕐 Break</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.activeStatus}>🟢 Active</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Management</Text>
      
      <Text style={styles.subtitle}>Currently On Duty ({staffMembers.length})</Text>
      
      <ScrollView style={styles.staffList} nestedScrollEnabled>
        {staffMembers.map((staff, index) => renderStaffMember(staff, index))}
      </ScrollView>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onStaffAction('clock_in', '')}
        >
          <Text style={styles.actionButtonText}>⏰ Clock In Staff</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.scheduleButton]}
          onPress={() => onStaffAction('schedule', '')}
        >
          <Text style={styles.actionButtonText}>📅 View Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.performanceButton]}
          onPress={() => onStaffAction('performance', '')}
        >
          <Text style={styles.actionButtonText}>📊 Performance</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertActions}>
        <TouchableOpacity 
          style={styles.alertButton}
          onPress={() => onStaffAction('alerts', '')}
        >
          <Text style={styles.alertButtonText}>📢 Staff Alerts & Announcements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => onStaffAction('emergency_contact', '')}
        >
          <Text style={styles.emergencyButtonText}>🚨 Emergency Contact</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  staffList: {
    flex: 1,
    marginBottom: 15,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  staffItemEven: {
    backgroundColor: theme.colors.lightGray,
  },
  staffItemOdd: {
    backgroundColor: theme.colors.white,
  },
  staffAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    color: theme.colors.white,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  staffShift: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  staffMetrics: {
    alignItems: 'flex-end',
  },
  staffSales: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    marginBottom: 2,
  },
  breakButton: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  breakButtonText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '600',
  },
  activeStatus: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: theme.colors.primary,
  },
  performanceButton: {
    backgroundColor: '#9C27B0',
  },
  actionButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    backgroundColor: theme.colors.warning,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  emergencyButton: {
    backgroundColor: '#C62828',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
});