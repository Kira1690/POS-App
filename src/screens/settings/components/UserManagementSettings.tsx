import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile, UserPermissions } from '@/types/settings.types';
import { apiClient } from '@/services/api/apiClient';
import { authStorageService } from '@/services/storage';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon, StatusIndicator } from '@/components/common';

const permissionsToArray = (perms: UserPermissions): { module: string; enabled: boolean }[] =>
  Object.entries(perms).map(([module, enabled]) => ({ module, enabled: enabled as boolean }));

interface UserManagementSettingsProps {
  onChangesDetected: (hasChanges: boolean) => void;
}

export default function UserManagementSettings({ onChangesDetected }: UserManagementSettingsProps) {
  // 1. Theme hook FIRST (REQUIRED per CLAUDE.md)
  const { theme } = useTheme();
  const {
    isPhone, isSmallTablet, isPortrait,
    headingSize, subheadingSize, bodySize, captionSize,
    sectionGap, contentPadding,
  } = useResponsive();

  // Small tablets use phone layout (settings uses phone master-detail on smallTablet)
  const useCompactLayout = isPhone || isSmallTablet;

  // 2. State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showPhoneDetail, setShowPhoneDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { state: authState } = useAuth();

  // 3. Layout decisions derived from responsive values
  const isTabletLandscape = !useCompactLayout && !isPortrait;
  const isTabletPortrait = !useCompactLayout && isPortrait;

  // Map Auth Service role names to the roles the UI expects
  const mapRole = (role: string): UserProfile['role'] => {
    const roleMap: Record<string, UserProfile['role']> = {
      system_admin: 'superadmin',
      store_admin: 'manager',
      user: 'restaurant_staff',
    };
    return roleMap[role] || (role as UserProfile['role']);
  };

  // Default permissions based on role
  const defaultPermissions = (role: string): UserPermissions => {
    const base: UserPermissions = {
      dashboard: true, orders: false, tables: false, menu: false,
      kitchen: false, customers: false, inventory: false, staff: false,
      reports: false, settings: false, payments: false, advanced: false,
    };
    if (role === 'superadmin' || role === 'admin') return { ...base, orders: true, tables: true, menu: true, kitchen: true, customers: true, inventory: true, staff: true, reports: true, settings: true, payments: true, advanced: true };
    if (role === 'manager') return { ...base, orders: true, tables: true, menu: true, kitchen: true, customers: true, inventory: true, staff: true, reports: true, settings: true, payments: true };
    if (role === 'restaurant_staff') return { ...base, orders: true, tables: true, customers: true, payments: true };
    if (role === 'kitchen_staff') return { ...base, orders: true, menu: true, kitchen: true, inventory: true };
    return base;
  };

  // 4. Role color helper (uses theme, so inside component)
  const getRoleColors = useCallback((role: UserProfile['role']) => {
    switch (role) {
      case 'manager':          return { bg: theme.colors.warningLight,     border: theme.colors.warning };
      case 'restaurant_staff': return { bg: theme.colors.successLight,     border: theme.colors.success };
      case 'kitchen_staff':    return { bg: theme.colors.infoLight,        border: theme.colors.info };
      case 'admin':            return { bg: theme.colors.errorLight,       border: theme.colors.error };
      case 'superadmin':       return { bg: theme.colors.primaryContainer, border: theme.colors.primary };
      default:                 return { bg: theme.colors.surfaceVariant,   border: theme.colors.outline };
    }
  }, [theme]);

  // 5. Data loading — fetch real users from Auth Service via gateway (8s timeout)
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    (async () => {
      try {
        // Skip API for dummy/offline credentials
        const session = await authStorageService.getSession();
        if (session?.accessToken?.startsWith('dummy_')) {
          setError('User management unavailable in offline mode.');
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        const response = await apiClient.get<{ users: Array<Record<string, unknown>>; total: number }>(
          '/api/users?limit=50',
          { signal: controller.signal },
        );
        const rawUsers = response.data?.data?.users || [];
        const mapped: UserProfile[] = rawUsers.map((u: Record<string, unknown>) => {
          const mappedRole = mapRole(u.role as string);
          return {
            id: u.id as string,
            restaurant_id: (u.store_id as string) || authState.restaurant?.id || '',
            employee_id: undefined,
            name: (u.username as string) || (u.email as string),
            email: u.email as string,
            phone: undefined,
            role: mappedRole,
            permissions: defaultPermissions(mappedRole),
            is_active: u.is_active as boolean,
            last_login: u.last_login_at ? new Date(u.last_login_at as string).toISOString() : undefined,
            created_at: new Date(u.created_at as string).toISOString(),
            updated_at: new Date(u.updated_at as string).toISOString(),
          };
        });
        setUsers(mapped);
        if (mapped.length > 0) setSelectedUser(mapped[0]);
      } catch (err) {
        if (__DEV__) console.warn('[UserManagement] Failed to load users:', err);
        const isTimeout = err instanceof DOMException && err.name === 'AbortError';
        setError(isTimeout ? 'Request timed out. Check network connection.' : 'Failed to load users.');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    })();

    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  // 6. Handlers
  const handleAddUser = useCallback(() =>
    Alert.alert('Add User', 'Will be implemented with backend integration.'), []);

  const handleBulkActions = useCallback(() =>
    Alert.alert('Bulk Actions', 'Select bulk action.'), []);

  const handleEditUser = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    Alert.alert('Edit User', `Edit user: ${user.name}`);
  }, []);

  const handlePermissionChange = useCallback((perm: string) =>
    Alert.alert('Permission Change', `Toggle: ${perm}`), []);

  // 7. Computed values
  const filteredUsers = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [users, searchQuery]);

  // 8. StyleSheet AFTER all hooks (REQUIRED per CLAUDE.md)
  const styles = StyleSheet.create({
    container:        { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText:      { fontSize: bodySize, color: theme.colors.onSurfaceVariant },
    // Title hidden in landscape — panel header already shows "User Management" subtitle
    title: {
      fontSize: headingSize, fontWeight: 'bold',
      color: theme.colors.onSurface, marginBottom: theme.spacing.sm,
    },
    // Portrait: stacked actions + search; Landscape: single compact row
    headerActions: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
    // Landscape compact header: actions + search in one row
    compactHeader: {
      flexDirection: 'row', alignItems: 'center',
      gap: theme.spacing.sm, marginBottom: theme.spacing.xs,
    },
    addUserButton: {
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm, flexShrink: 0,
    },
    addUserButtonText: { color: theme.colors.white, fontSize: bodySize, fontWeight: 'bold' },
    bulkActionsButton: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.outline,
      flexShrink: 0,
    },
    bulkActionsButtonText: { color: theme.colors.onSurface, fontSize: bodySize },
    searchSection: { marginBottom: theme.spacing.sm },
    searchContainer: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.input,
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    // Inline search for landscape — flex:1 to take remaining row space
    searchContainerInline: {
      flex: 1,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.inputBorder,
      borderRadius: theme.borderRadius.input,
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
    },
    searchIcon:  { marginRight: theme.spacing.xs },
    searchInput: { flex: 1, fontSize: bodySize, color: theme.colors.onSurface },
    filters: {
      flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap',
      marginBottom: isTabletLandscape ? theme.spacing.xs : theme.spacing.sm,
    },
    filterButton: {
      backgroundColor: theme.colors.surface, borderWidth: 1,
      borderColor: theme.colors.inputBorder, borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
    },
    filterButtonText: { fontSize: captionSize, color: theme.colors.onSurface },
    // Content area: side-by-side in landscape tablet, stacked otherwise
    content: {
      flexDirection: isTabletLandscape ? 'row' : 'column',
      flex: 1,
      gap: isTabletLandscape ? theme.spacing.md : 0,
    },
    usersList:  { flex: 1 },
    usersTitle: {
      fontSize: subheadingSize, fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: isTabletLandscape ? theme.spacing.xs : theme.spacing.sm,
    },
    userItem: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: contentPadding, paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.xs,
    },
    userItemSelected: { backgroundColor: theme.colors.primaryContainer, borderColor: theme.colors.primary },
    userAvatar: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center', alignItems: 'center',
      marginRight: theme.spacing.sm, flexShrink: 0,
    },
    userAvatarText: { color: theme.colors.white, fontSize: bodySize, fontWeight: 'bold' },
    userInfo:   { flex: 1, minWidth: 0 },
    userName:   { fontSize: bodySize, fontWeight: 'bold', color: theme.colors.onSurface },
    userEmail:  { fontSize: captionSize, color: theme.colors.onSurfaceVariant, marginTop: 2 },
    roleTag: {
      paddingHorizontal: theme.spacing.xs, paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
      marginHorizontal: theme.spacing.xs, flexShrink: 1,
    },
    roleText:   { fontSize: captionSize - 1, fontWeight: 'bold', color: theme.colors.onSurface },
    statusCell: { width: 70, flexShrink: 0 },
    editButton: { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, flexShrink: 0 },
    editButtonText: { fontSize: captionSize, color: theme.colors.primary },
    // Detail panel base styles (conditional layout applied inline)
    detailsPanel: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    detailsPanelScroll: { padding: contentPadding },
    detailsTitle: {
      fontSize: subheadingSize, fontWeight: 'bold',
      color: theme.colors.onSurface, marginBottom: theme.spacing.xs,
    },
    selectedUserText: { fontSize: captionSize, color: theme.colors.primary, marginBottom: theme.spacing.sm },
    permissionsContainer: { marginBottom: theme.spacing.sm },
    permissionRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    permissionLabel: { fontSize: captionSize, color: theme.colors.onSurfaceVariant, flex: 1 },
    permissionToggle: {
      paddingHorizontal: theme.spacing.sm, paddingVertical: 3,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    },
    permissionToggleActive: { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success },
    permissionToggleText: { fontSize: captionSize - 1, color: theme.colors.success },
    workingHours:      { marginBottom: theme.spacing.sm },
    workingHoursTitle: {
      fontSize: captionSize, fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant, marginBottom: theme.spacing.xs,
    },
    workingHoursText: { fontSize: captionSize, color: theme.colors.onSurfaceVariant, marginBottom: 2 },
    detailsActions:   { gap: theme.spacing.sm },
    saveBtn: {
      backgroundColor: theme.colors.success, borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.xs, alignItems: 'center',
      flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm,
    },
    saveBtnText:   { color: theme.colors.white, fontSize: captionSize, fontWeight: 'bold' },
    resetBtn: {
      backgroundColor: theme.colors.warning, borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.xs, alignItems: 'center',
      flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.sm,
    },
    resetBtnText: { color: theme.colors.white, fontSize: captionSize },
    // Phone detail navigation
    phoneDetailHeader: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
      minHeight: 48, borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline, backgroundColor: theme.colors.surface,
    },
    phoneBackBtn: {
      flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm, paddingRight: theme.spacing.sm, minWidth: 72,
    },
    phoneBackText:  { fontSize: bodySize, fontWeight: '500', color: theme.colors.primary },
    phoneDetailBody:{ padding: contentPadding },
  });

  // 9. Render helpers (after styles, so styles is in scope)
  const renderDetailContent = () => {
    if (!selectedUser) return null;
    return (
      <>
        <Text style={styles.detailsTitle}>Permissions</Text>
        <Text style={styles.selectedUserText}>
          {selectedUser.name} · {selectedUser.role.replace('_', ' ').toUpperCase()}
        </Text>
        <View style={styles.permissionsContainer}>
          {permissionsToArray(selectedUser.permissions).map((p) => (
            <View key={p.module} style={styles.permissionRow}>
              <Text style={styles.permissionLabel}>
                {p.module.charAt(0).toUpperCase() + p.module.slice(1)}
              </Text>
              <TouchableOpacity
                style={[styles.permissionToggle, p.enabled && styles.permissionToggleActive]}
                onPress={() => handlePermissionChange(p.module)}
              >
                <Text style={styles.permissionToggleText}>{p.enabled ? 'Enabled' : 'Off'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.workingHours}>
          <Text style={styles.workingHoursTitle}>Working Hours</Text>
          <Text style={styles.workingHoursText}>Mon–Fri: 08:00–22:00</Text>
          <Text style={styles.workingHoursText}>Sat–Sun: 09:00–23:00</Text>
        </View>
        <View style={styles.detailsActions}>
          <TouchableOpacity style={styles.saveBtn} accessibilityRole="button" accessibilityLabel="Save permissions">
            <Icon name="content-save" size={14} color={theme.colors.white} accessibilityLabel="" />
            <Text style={styles.saveBtnText}>Save Permissions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} accessibilityRole="button" accessibilityLabel="Reset password">
            <Icon name="lock-reset" size={14} color={theme.colors.white} accessibilityLabel="" />
            <Text style={styles.resetBtnText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    const rc = getRoleColors(item.role);
    const isSel = selectedUser?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.userItem, isSel && styles.userItemSelected]}
        onPress={() => {
          setSelectedUser(item);
          if (useCompactLayout) setShowPhoneDetail(true);
        }}
        accessibilityLabel={`${item.name}, ${item.role}`}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, flexWrap: 'nowrap' }}>
            <Text style={[styles.userName, { flexShrink: 1 }]} numberOfLines={1}>{item.name}</Text>
            {!isTabletLandscape && (
              <View style={[styles.roleTag, { backgroundColor: rc.bg, borderColor: rc.border, borderWidth: 1 }]}>
                <Text style={styles.roleText}>{item.role.replace('_', ' ').toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        </View>
        {isTabletLandscape && (
          <View style={styles.statusCell}>
            <StatusIndicator status={item.is_active ? 'active' : 'inactive'} textSize={12} iconSize={14} />
          </View>
        )}
        {useCompactLayout ? (
          <Icon name="chevron-right" size={16} color={theme.colors.onSurfaceVariant} accessibilityLabel="" />
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditUser(item)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // 10. Render
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.error, marginBottom: theme.spacing.sm }]}>{error}</Text>
        <TouchableOpacity
          style={{ backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.sm }}
          onPress={() => { setError(null); setLoading(true); }}
        >
          <Text style={{ color: theme.colors.white, fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Phone: push-nav detail view
  if (useCompactLayout && showPhoneDetail && selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.phoneDetailHeader}>
          <TouchableOpacity
            style={styles.phoneBackBtn}
            onPress={() => setShowPhoneDetail(false)}
            accessibilityLabel="Back to users list"
          >
            <Icon name="arrow-left" size={20} color={theme.colors.primary} accessibilityLabel="" />
            <Text style={styles.phoneBackText}>Users</Text>
          </TouchableOpacity>
          <Text style={[styles.userName, { flex: 1, textAlign: 'center', marginRight: 72 }]} numberOfLines={1}>
            {selectedUser.name}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.phoneDetailBody}>
          {renderDetailContent()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title: hide in landscape — panel header already shows "User Management" subtitle */}
      {!isTabletLandscape && <Text style={styles.title}>User Management</Text>}

      {isTabletLandscape ? (
        /* Landscape: compact single row — actions + inline search */
        <View style={styles.compactHeader}>
          <TouchableOpacity style={styles.addUserButton} onPress={handleAddUser}>
            <Text style={styles.addUserButtonText}>+ Add User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionsButton} onPress={handleBulkActions}>
            <Text style={styles.bulkActionsButtonText}>Bulk Actions ▼</Text>
          </TouchableOpacity>
          <View style={styles.searchContainerInline}>
            <MaterialCommunityIcons
              name="magnify" size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>
      ) : (
        /* Portrait: stacked actions + search */
        <>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addUserButton} onPress={handleAddUser}>
              <Text style={styles.addUserButtonText}>+ Add User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bulkActionsButton} onPress={handleBulkActions}>
              <Text style={styles.bulkActionsButtonText}>Bulk Actions ▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify" size={18}
                color={theme.colors.onSurfaceVariant}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search users..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>
        </>
      )}

      {/* Filters — always visible */}
      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>All Roles ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Active ▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Users list — always visible */}
        <View style={styles.usersList}>
          <Text style={styles.usersTitle}>Users ({filteredUsers.length})</Text>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!useCompactLayout}
          />
        </View>

        {/* Detail panel — tablet only
            Landscape: flex:0.6 side panel (scrollable independently)
            Portrait:  stacked below with maxHeight cap */}
        {!useCompactLayout && selectedUser && (
          <ScrollView
            style={[
              styles.detailsPanel,
              isTabletLandscape
                ? { flex: 0.6 }
                : { maxHeight: 300, marginTop: theme.spacing.sm },
            ]}
            contentContainerStyle={styles.detailsPanelScroll}
            showsVerticalScrollIndicator={false}
          >
            {renderDetailContent()}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
