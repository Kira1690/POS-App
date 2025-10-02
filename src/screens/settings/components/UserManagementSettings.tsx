import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { UserProfile, UserPermission } from '@/types/settings.types';
import { MockSettingsService } from '@/services/settings/MockSettingsService';
import { useTheme } from '@/hooks/useTheme';
import { Icon, StatusIndicator } from '@/components/common';

interface UserManagementSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

export default function UserManagementSettings({ onChangesDetected }: UserManagementSettingsProps) {
  // Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme } = useTheme();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const settingsService = MockSettingsService.getInstance();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await settingsService.getUsers('rest_001');
      setUsers(usersData);
      if (usersData.length > 0) {
        setSelectedUser(usersData[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    Alert.alert('Add User', 'Add user functionality will be implemented with the backend integration.');
  };

  const handleBulkActions = () => {
    Alert.alert('Bulk Actions', 'Select bulk action functionality.');
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    Alert.alert('Edit User', `Edit user: ${user.name}`);
  };

  const handlePermissionChange = (permission: string) => {
    Alert.alert('Permission Change', `Toggle permission: ${permission}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={[styles.userItem, selectedUser?.id === item.id && styles.userItemSelected]}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={[styles.roleTag, styles[`roleTag${item.role}`]]}>
        <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
      </View>
      <View style={{ width: 95 }}>
        <StatusIndicator
          status={item.status === 'active' ? 'active' : 'inactive'}
          textSize={12}
          iconSize={14}
        />
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditUser(item)}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // StyleSheet AFTER hooks and handlers, BEFORE return (REQUIRED per CLAUDE.md)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    addUserButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addUserButtonText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    bulkActionsButton: {
      backgroundColor: theme.colors.gray,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
    },
    bulkActionsButtonText: {
      color: theme.colors.white,
      fontSize: 14,
    },
    searchSection: {
      marginBottom: 20,
    },
    searchInput: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 14,
      marginBottom: 10,
    },
    filters: {
      flexDirection: 'row',
      gap: 10,
    },
    filterButton: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    content: {
      flexDirection: 'row',
      flex: 1,
      gap: 20,
    },
    usersList: {
      flex: 1,
    },
    usersTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
    },
    usersContainer: {
      flex: 1,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      marginBottom: 5,
    },
    userItemSelected: {
      backgroundColor: theme.colors.lightGray,
      borderColor: theme.colors.primary,
    },
    userAvatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    userAvatarText: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    userEmail: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    roleTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginHorizontal: 10,
    },
    roleTagmanager: {
      backgroundColor: theme.colors.warningLight, // Fixed: was hardcoded '#FFF3E0'
      borderColor: theme.colors.warning,
      borderWidth: 1,
    },
    roleTagstaff: {
      backgroundColor: theme.colors.successLight, // Fixed: was hardcoded '#E8F5E8'
      borderColor: theme.colors.success,
      borderWidth: 1,
    },
    roleText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    userStatus: {
      fontSize: 12,
      marginHorizontal: 10,
      width: 80,
    },
    editButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    editButtonText: {
      fontSize: 10,
      color: theme.colors.primary,
    },
    detailsPanel: {
      width: 270,
      backgroundColor: theme.colors.lightGray,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 10,
    },
    selectedUserText: {
      fontSize: 12,
      color: theme.colors.primary,
      marginBottom: 20,
    },
    permissionsContainer: {
      marginBottom: 20,
    },
    permissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    permissionLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    permissionToggle: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    permissionToggleActive: {
      backgroundColor: theme.colors.successLight, // Fixed: was hardcoded '#E8F5E8'
      borderColor: theme.colors.success,
    },
    permissionToggleText: {
      fontSize: 10,
      color: theme.colors.success, // Fixed: was hardcoded '#2E7D32'
    },
    workingHours: {
      marginBottom: 20,
    },
    workingHoursTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginBottom: 5,
    },
    workingHoursText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    detailsActions: {
      gap: 10,
    },
    savePermissionsButton: {
      backgroundColor: theme.colors.success,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    savePermissionsButtonText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    resetPasswordButton: {
      backgroundColor: theme.colors.warning,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: 'center',
    },
    resetPasswordButtonText: {
      color: theme.colors.white,
      fontSize: 12,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.addUserButton} onPress={handleAddUser}>
          <Text style={styles.addUserButtonText}>+ Add User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkActionsButton} onPress={handleBulkActions}>
          <Text style={styles.bulkActionsButtonText}>Bulk Actions ▼</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Search users..."
        />
        <View style={styles.filters}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>All Roles ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Active ▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Users List */}
        <View style={styles.usersList}>
          <Text style={styles.usersTitle}>Users ({filteredUsers.length})</Text>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={styles.usersContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* User Details Panel */}
        {selectedUser && (
          <View style={styles.detailsPanel}>
            <Text style={styles.detailsTitle}>User Permissions</Text>
            <Text style={styles.selectedUserText}>Selected: {selectedUser.name}</Text>

            <View style={styles.permissionsContainer}>
              {selectedUser.permissions.map((permission) => (
                <View key={permission.module} style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>{permission.module}</Text>
                  <TouchableOpacity
                    style={[styles.permissionToggle, permission.level === 'full' && styles.permissionToggleActive]}
                    onPress={() => handlePermissionChange(permission.module)}
                  >
                    <Text style={styles.permissionToggleText}>
                      🔘 {permission.level === 'full' ? 'Full Access' : 'Limited'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.workingHours}>
              <Text style={styles.workingHoursTitle}>Working Hours</Text>
              <Text style={styles.workingHoursText}>Mon-Fri: 08:00-22:00</Text>
              <Text style={styles.workingHoursText}>Sat-Sun: 09:00-23:00</Text>
            </View>

            <View style={styles.detailsActions}>
              <TouchableOpacity
                style={styles.savePermissionsButton}
                accessibilityRole="button"
                accessibilityLabel="Save permissions"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Icon name="content-save" size={14} color={theme.colors.white} />
                  <Text style={styles.savePermissionsButtonText}>Save Permissions</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetPasswordButton}
                accessibilityRole="button"
                accessibilityLabel="Reset password"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <Icon name="lock-reset" size={14} color={theme.colors.white} />
                  <Text style={styles.resetPasswordButtonText}>Reset Password</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}