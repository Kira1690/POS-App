/**
 * MenuEditorSettings Component
 * Main orchestrator for Menu Management Settings
 * Combines tabs, toolbar, sidebar, grid, stats panel, and modals
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useMenuContext } from '@/context/menu';
import { useMenuManagementState } from './hooks/useMenuManagementState';
import MenuEditorTabs from './components/MenuEditorTabs';
import MenuEditorToolbar from './components/MenuEditorToolbar';
import CategorySidebar from './components/CategorySidebar';
import MenuItemGrid from './components/MenuItemGrid';
import StatsPanel from './components/StatsPanel';
import BulkActionsBar from './components/BulkActionsBar';
import ModifierGroupList from './components/ModifierGroupList';
import ComboList from './components/ComboList';
import {
  AddCategoryModal,
  EditCategoryModal,
  DeleteConfirmDialog,
  AddMenuItemModal,
  EditMenuItemModal,
  BulkEditModal,
  AddModifierGroupModal,
  EditModifierGroupModal,
  AddModifierOptionModal,
  AddComboModal,
  EditComboModal,
} from './modals';
import { MenuItemExtended, ModifierGroup, ComboDeal } from '@/types/menu-management-extended.types';
import { CategoryWithStats } from '@/types/menu-management.types';

interface MenuEditorSettingsProps {
  onChangesDetected?: (hasChanges: boolean) => void;
}

export const MenuEditorSettings: React.FC<MenuEditorSettingsProps> = ({
  onChangesDetected,
}) => {
  const { theme } = useTheme();
  const menuContext = useMenuContext();

  // State from hook
  const {
    activeTab, setActiveTab, viewMode, setViewMode,
    searchQuery, setSearchQuery, sortField, sortOrder, setSorting,
    categories, filteredItems, selectedItem, selectedCategory,
    selectedCategoryId, selectCategory, selectedItemIds,
    isMultiSelectMode, selectItem, toggleItemSelection,
    selectAllItems, clearSelection, itemsCount, selectedCount, isLoading, itemFilters,
  } = useMenuManagementState({ onChangesDetected });

  // Modal visibility states - Categories & Items
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showDeleteItem, setShowDeleteItem] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Modal visibility states - Modifiers
  const [showAddModifierGroup, setShowAddModifierGroup] = useState(false);
  const [showEditModifierGroup, setShowEditModifierGroup] = useState(false);
  const [showDeleteModifierGroup, setShowDeleteModifierGroup] = useState(false);
  const [showAddModifierOption, setShowAddModifierOption] = useState(false);

  // Modal visibility states - Combos
  const [showAddCombo, setShowAddCombo] = useState(false);
  const [showEditCombo, setShowEditCombo] = useState(false);
  const [showDeleteCombo, setShowDeleteCombo] = useState(false);

  // Item to edit/delete
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithStats | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithStats | null>(null);
  const [itemToEdit, setItemToEdit] = useState<MenuItemExtended | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItemExtended | null>(null);

  // Modifier state
  const [selectedModifierGroup, setSelectedModifierGroup] = useState<ModifierGroup | null>(null);
  const [modifierGroupToEdit, setModifierGroupToEdit] = useState<ModifierGroup | null>(null);
  const [modifierGroupToDelete, setModifierGroupToDelete] = useState<ModifierGroup | null>(null);

  // Combo state
  const [selectedCombo, setSelectedCombo] = useState<ComboDeal | null>(null);
  const [comboToEdit, setComboToEdit] = useState<ComboDeal | null>(null);
  const [comboToDelete, setComboToDelete] = useState<ComboDeal | null>(null);

  // UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Computed values
  const availableItems = filteredItems.filter((i) => i.is_available).length;
  const unavailableItems = filteredItems.filter((i) => !i.is_available).length;
  const hasActiveFilters = itemFilters.availableOnly || itemFilters.unavailableOnly ||
    itemFilters.categoryIds.length > 0 || itemFilters.dietaryTags.length > 0;

  // Category handlers
  const handleAddCategory = useCallback(() => setShowAddCategory(true), []);
  const handleEditCategory = useCallback((cat: CategoryWithStats) => {
    setCategoryToEdit(cat);
    setShowEditCategory(true);
  }, []);
  const handleDeleteCategory = useCallback((cat: CategoryWithStats) => {
    setCategoryToDelete(cat);
    setShowDeleteCategory(true);
  }, []);

  const handleSaveNewCategory = useCallback(async (data: any) => {
    await menuContext.createCategory(data);
  }, [menuContext]);

  const handleUpdateCategory = useCallback(async (id: string, data: any) => {
    await menuContext.updateCategory(id, data);
  }, [menuContext]);

  const handleConfirmDeleteCategory = useCallback(async () => {
    if (categoryToDelete) {
      await menuContext.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setShowDeleteCategory(false);
    }
  }, [categoryToDelete, menuContext]);

  // Item handlers
  const handleAddItem = useCallback(() => setShowAddItem(true), []);
  const handleEditItem = useCallback((item: MenuItemExtended) => {
    setItemToEdit(item);
    setShowEditItem(true);
  }, []);
  const handleDeleteItem = useCallback((item: MenuItemExtended) => {
    setItemToDelete(item);
    setShowDeleteItem(true);
  }, []);

  const handleItemPress = useCallback((item: MenuItemExtended) => {
    if (isMultiSelectMode) {
      toggleItemSelection(item.id);
    } else {
      selectItem(item.id);
    }
  }, [isMultiSelectMode, toggleItemSelection, selectItem]);

  const handleItemLongPress = useCallback((item: MenuItemExtended) => {
    if (!isMultiSelectMode) {
      selectItem(item.id);
    }
  }, [isMultiSelectMode, selectItem]);

  const handleSaveNewItem = useCallback(async (data: any) => {
    await menuContext.createMenuItem(data);
  }, [menuContext]);

  const handleUpdateItem = useCallback(async (id: string, data: any) => {
    await menuContext.updateMenuItem(id, data);
  }, [menuContext]);

  const handleConfirmDeleteItem = useCallback(async () => {
    if (itemToDelete) {
      await menuContext.deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
      setShowDeleteItem(false);
      clearSelection();
    }
  }, [itemToDelete, menuContext, clearSelection]);

  const handleDuplicateItem = useCallback(async () => {
    if (!selectedItem) return;
    const newItem = { ...selectedItem, id: undefined, name: `${selectedItem.name} (Copy)` };
    await menuContext.createMenuItem(newItem as any);
  }, [selectedItem, menuContext]);

  const handleToggleAvailability = useCallback(async () => {
    if (!selectedItem) return;
    await menuContext.updateMenuItem(selectedItem.id, { is_available: !selectedItem.is_available });
  }, [selectedItem, menuContext]);

  // Bulk handlers
  const handleBulkEdit = useCallback(() => setShowBulkEdit(true), []);
  const handleBulkDelete = useCallback(() => setShowBulkDelete(true), []);

  const handleBulkAvailable = useCallback(async () => {
    await Promise.all(selectedItemIds.map((id) => menuContext.updateMenuItem(id, { is_available: true })));
    clearSelection();
  }, [selectedItemIds, menuContext, clearSelection]);

  const handleBulkUnavailable = useCallback(async () => {
    await Promise.all(selectedItemIds.map((id) => menuContext.updateMenuItem(id, { is_available: false })));
    clearSelection();
  }, [selectedItemIds, menuContext, clearSelection]);

  const handleBulkChangeCategory = useCallback(() => setShowBulkEdit(true), []);

  const handleApplyBulkEdit = useCallback(async (changes: any) => {
    const updates: any = {};
    if (changes.category_id) updates.category_id = changes.category_id;
    if (changes.is_available !== undefined) updates.is_available = changes.is_available;
    if (changes.tax_rate !== undefined) updates.tax_rate = changes.tax_rate;
    await Promise.all(selectedItemIds.map((id) => menuContext.updateMenuItem(id, updates)));
    clearSelection();
  }, [selectedItemIds, menuContext, clearSelection]);

  const handleConfirmBulkDelete = useCallback(async () => {
    await Promise.all(selectedItemIds.map((id) => menuContext.deleteMenuItem(id)));
    clearSelection();
    setShowBulkDelete(false);
  }, [selectedItemIds, menuContext, clearSelection]);

  // Modifier Group handlers
  const handleAddModifierGroup = useCallback(() => setShowAddModifierGroup(true), []);

  const handleSelectModifierGroup = useCallback((group: ModifierGroup) => {
    setSelectedModifierGroup(group);
  }, []);

  const handleEditModifierGroup = useCallback((group: ModifierGroup) => {
    setModifierGroupToEdit(group);
    setShowEditModifierGroup(true);
  }, []);

  const handleDeleteModifierGroup = useCallback((group: ModifierGroup) => {
    setModifierGroupToDelete(group);
    setShowDeleteModifierGroup(true);
  }, []);

  const handleAddOptionToGroup = useCallback((group: ModifierGroup) => {
    setSelectedModifierGroup(group);
    setShowAddModifierOption(true);
  }, []);

  const handleToggleModifierGroupStatus = useCallback(async (group: ModifierGroup) => {
    await menuContext.updateModifierGroup(group.id, { is_active: !group.is_active });
  }, [menuContext]);

  const handleSaveNewModifierGroup = useCallback(async (data: any) => {
    await menuContext.createModifierGroup(data);
  }, [menuContext]);

  const handleUpdateModifierGroup = useCallback(async (id: string, data: any) => {
    await menuContext.updateModifierGroup(id, data);
  }, [menuContext]);

  const handleConfirmDeleteModifierGroup = useCallback(async () => {
    if (modifierGroupToDelete) {
      await menuContext.deleteModifierGroup(modifierGroupToDelete.id);
      setModifierGroupToDelete(null);
      setShowDeleteModifierGroup(false);
      if (selectedModifierGroup?.id === modifierGroupToDelete.id) {
        setSelectedModifierGroup(null);
      }
    }
  }, [modifierGroupToDelete, menuContext, selectedModifierGroup]);

  const handleSaveModifierOption = useCallback(async (groupId: string, data: any) => {
    await menuContext.addModifierOption(groupId, data);
  }, [menuContext]);

  // Combo handlers
  const handleAddCombo = useCallback(() => setShowAddCombo(true), []);

  const handleSelectCombo = useCallback((combo: ComboDeal) => {
    setSelectedCombo(combo);
  }, []);

  const handleEditCombo = useCallback((combo: ComboDeal) => {
    setComboToEdit(combo);
    setShowEditCombo(true);
  }, []);

  const handleDeleteCombo = useCallback((combo: ComboDeal) => {
    setComboToDelete(combo);
    setShowDeleteCombo(true);
  }, []);

  const handleToggleComboStatus = useCallback(async (combo: ComboDeal) => {
    await menuContext.toggleComboStatus(combo.id);
  }, [menuContext]);

  const handleDuplicateCombo = useCallback(async (combo: ComboDeal) => {
    const newCombo = {
      name: `${combo.name} (Copy)`,
      description: combo.description,
      combo_items: combo.combo_items,
      regular_price: combo.regular_price,
      combo_price: combo.combo_price,
      savings_amount: combo.savings_amount,
      savings_percentage: combo.savings_percentage,
      image_url: combo.image_url,
      availability: combo.availability,
      is_active: false,
    };
    await menuContext.createCombo(newCombo);
  }, [menuContext]);

  const handleSaveNewCombo = useCallback(async (data: any) => {
    await menuContext.createCombo(data);
  }, [menuContext]);

  const handleUpdateCombo = useCallback(async (id: string, data: any) => {
    await menuContext.updateCombo(id, data);
  }, [menuContext]);

  const handleConfirmDeleteCombo = useCallback(async () => {
    if (comboToDelete) {
      await menuContext.deleteCombo(comboToDelete.id);
      setComboToDelete(null);
      setShowDeleteCombo(false);
      if (selectedCombo?.id === comboToDelete.id) {
        setSelectedCombo(null);
      }
    }
  }, [comboToDelete, menuContext, selectedCombo]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    tabsContainer: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, backgroundColor: theme.colors.surface },
    mainContent: { flex: 1, flexDirection: 'row' },
    centerContent: { flex: 1, flexDirection: 'column' },
    modifiersContent: { flex: 1 },
    combosContent: { flex: 1 },
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <MenuEditorTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          itemsCount={menuContext.menuItemsExtended.length}
          modifiersCount={menuContext.modifierGroups.length}
          combosCount={menuContext.combos.length}
        />
      </View>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && activeTab === 'items' && (
        <BulkActionsBar
          selectedCount={selectedCount}
          totalCount={filteredItems.length}
          onSelectAll={selectAllItems}
          onClearSelection={clearSelection}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onBulkAvailable={handleBulkAvailable}
          onBulkUnavailable={handleBulkUnavailable}
          onBulkChangeCategory={handleBulkChangeCategory}
        />
      )}

      <View style={styles.mainContent}>
        {activeTab === 'items' && (
          <>
            <CategorySidebar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={selectCategory}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <View style={styles.centerContent}>
              <MenuEditorToolbar
                searchQuery={searchQuery} onSearchChange={setSearchQuery}
                viewMode={viewMode} onViewModeChange={setViewMode}
                sortField={sortField} sortOrder={sortOrder} onSortChange={setSorting}
                onFilterPress={() => {}} onImportPress={() => {}} onExportPress={() => {}}
                onAddItem={handleAddItem}
                hasActiveFilters={hasActiveFilters} itemCount={itemsCount} selectedCount={selectedCount}
              />
              <MenuItemGrid
                items={filteredItems} viewMode={viewMode}
                selectedItemIds={selectedItemIds} isMultiSelectMode={isMultiSelectMode}
                onItemPress={handleItemPress} onItemLongPress={handleItemLongPress}
                onEditItem={handleEditItem} onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem} isLoading={isLoading}
                emptyMessage={selectedCategoryId ? 'No items in this category' : 'No menu items found'}
              />
            </View>
            <StatsPanel
              selectedItem={selectedItem} selectedCategory={selectedCategory}
              totalItems={menuContext.menuItemsExtended.length} totalCategories={categories.length}
              availableItems={availableItems} unavailableItems={unavailableItems}
              onEditItem={selectedItem ? () => handleEditItem(selectedItem) : undefined}
              onDeleteItem={selectedItem ? () => handleDeleteItem(selectedItem) : undefined}
              onDuplicateItem={handleDuplicateItem} onToggleAvailability={handleToggleAvailability}
            />
          </>
        )}

        {activeTab === 'modifiers' && (
          <View style={styles.modifiersContent}>
            <ModifierGroupList
              groups={menuContext.modifierGroups}
              selectedGroupId={selectedModifierGroup?.id}
              onGroupSelect={handleSelectModifierGroup}
              onAddGroup={handleAddModifierGroup}
              onEditGroup={handleEditModifierGroup}
              onDeleteGroup={handleDeleteModifierGroup}
              onAddOption={handleAddOptionToGroup}
              onToggleGroupStatus={handleToggleModifierGroupStatus}
              isLoading={isLoading}
              emptyMessage="No modifier groups yet. Add your first group to customize menu items."
            />
          </View>
        )}

        {activeTab === 'combos' && (
          <View style={styles.combosContent}>
            <ComboList
              combos={menuContext.combos}
              selectedComboId={selectedCombo?.id}
              onComboSelect={handleSelectCombo}
              onAddCombo={handleAddCombo}
              onEditCombo={handleEditCombo}
              onDeleteCombo={handleDeleteCombo}
              onToggleComboStatus={handleToggleComboStatus}
              onDuplicateCombo={handleDuplicateCombo}
              isLoading={isLoading}
              emptyMessage="No combo deals yet. Create your first combo to offer bundled savings."
            />
          </View>
        )}
      </View>

      {/* Category & Item Modals */}
      <AddCategoryModal visible={showAddCategory} onClose={() => setShowAddCategory(false)} onSave={handleSaveNewCategory} />
      <EditCategoryModal visible={showEditCategory} category={categoryToEdit} onClose={() => { setShowEditCategory(false); setCategoryToEdit(null); }} onSave={handleUpdateCategory} />
      <DeleteConfirmDialog
        visible={showDeleteCategory} title="Delete Category"
        message="Are you sure you want to delete this category?"
        itemName={categoryToDelete?.name} warningMessage="Items in this category will become uncategorized."
        onConfirm={handleConfirmDeleteCategory} onCancel={() => { setShowDeleteCategory(false); setCategoryToDelete(null); }}
      />
      <AddMenuItemModal visible={showAddItem} categories={categories} modifierGroups={menuContext.modifierGroups} onClose={() => setShowAddItem(false)} onSave={handleSaveNewItem} />
      <EditMenuItemModal visible={showEditItem} item={itemToEdit} categories={categories} modifierGroups={menuContext.modifierGroups} onClose={() => { setShowEditItem(false); setItemToEdit(null); }} onSave={handleUpdateItem} />
      <DeleteConfirmDialog
        visible={showDeleteItem} title="Delete Item"
        message="Are you sure you want to delete this menu item?"
        itemName={itemToDelete?.name} onConfirm={handleConfirmDeleteItem}
        onCancel={() => { setShowDeleteItem(false); setItemToDelete(null); }}
      />
      <BulkEditModal visible={showBulkEdit} selectedCount={selectedCount} categories={categories} onClose={() => setShowBulkEdit(false)} onApply={handleApplyBulkEdit} />
      <DeleteConfirmDialog
        visible={showBulkDelete} title="Delete Multiple Items"
        message={`Are you sure you want to delete ${selectedCount} items?`}
        warningMessage="This action cannot be undone." confirmText="Delete All"
        onConfirm={handleConfirmBulkDelete} onCancel={() => setShowBulkDelete(false)}
      />

      {/* Modifier Modals */}
      <AddModifierGroupModal
        visible={showAddModifierGroup}
        onClose={() => setShowAddModifierGroup(false)}
        onSave={handleSaveNewModifierGroup}
      />
      <EditModifierGroupModal
        visible={showEditModifierGroup}
        group={modifierGroupToEdit}
        onClose={() => { setShowEditModifierGroup(false); setModifierGroupToEdit(null); }}
        onSave={handleUpdateModifierGroup}
      />
      <DeleteConfirmDialog
        visible={showDeleteModifierGroup}
        title="Delete Modifier Group"
        message="Are you sure you want to delete this modifier group?"
        itemName={modifierGroupToDelete?.name}
        warningMessage="All options in this group will be removed. Items using this modifier will no longer have it."
        onConfirm={handleConfirmDeleteModifierGroup}
        onCancel={() => { setShowDeleteModifierGroup(false); setModifierGroupToDelete(null); }}
      />
      <AddModifierOptionModal
        visible={showAddModifierOption}
        group={selectedModifierGroup}
        onClose={() => setShowAddModifierOption(false)}
        onSave={handleSaveModifierOption}
      />

      {/* Combo Modals */}
      <AddComboModal
        visible={showAddCombo}
        menuItems={menuContext.menuItemsExtended}
        categories={categories}
        onClose={() => setShowAddCombo(false)}
        onSave={handleSaveNewCombo}
      />
      <EditComboModal
        visible={showEditCombo}
        combo={comboToEdit}
        menuItems={menuContext.menuItemsExtended}
        categories={categories}
        onClose={() => { setShowEditCombo(false); setComboToEdit(null); }}
        onSave={handleUpdateCombo}
      />
      <DeleteConfirmDialog
        visible={showDeleteCombo}
        title="Delete Combo Deal"
        message="Are you sure you want to delete this combo deal?"
        itemName={comboToDelete?.name}
        warningMessage="This combo will no longer be available for ordering."
        onConfirm={handleConfirmDeleteCombo}
        onCancel={() => { setShowDeleteCombo(false); setComboToDelete(null); }}
      />
    </View>
  );
};

export default MenuEditorSettings;
