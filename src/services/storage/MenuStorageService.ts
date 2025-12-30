/**
 * Menu Storage Service
 * Handles persistence of menu management data
 *
 * Current: Uses AsyncStorage for local persistence
 * Future: Can integrate with Menu Management API
 */

import { MenuCategory } from '@/types/menu.types';
import { CategoryWithStats } from '@/types/menu-management.types';
import {
  MenuItemExtended,
  ModifierGroup,
  ComboDeal,
} from '@/types/menu-management-extended.types';
import { storageService, STORAGE_KEYS } from './StorageService';

// Menu data structure for storage
export interface MenuStorageData {
  categories: CategoryWithStats[];
  menuItems: MenuItemExtended[];
  modifierGroups: ModifierGroup[];
  combos: ComboDeal[];
  lastUpdated: string;
  restaurantId: string;
}

/**
 * MenuStorageService - Manages menu data persistence
 * Designed to work with both local storage and future API integration
 */
class MenuStorageService {
  /**
   * Save all menu data
   */
  async saveMenuData(data: MenuStorageData): Promise<void> {
    const dataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    // Save all data together
    await storageService.multiSet([
      { key: STORAGE_KEYS.MENU_CATEGORIES, value: data.categories },
      { key: STORAGE_KEYS.MENU_ITEMS, value: data.menuItems },
      { key: STORAGE_KEYS.MENU_MODIFIERS, value: data.modifierGroups },
      { key: STORAGE_KEYS.MENU_COMBOS, value: data.combos },
      { key: STORAGE_KEYS.MENU_LAST_SYNC, value: dataWithTimestamp.lastUpdated },
    ]);
  }

  /**
   * Get all menu data
   */
  async getMenuData(restaurantId: string): Promise<MenuStorageData | null> {
    const [categories, menuItems, modifierGroups, combos, lastUpdated] =
      await Promise.all([
        storageService.get<CategoryWithStats[]>(STORAGE_KEYS.MENU_CATEGORIES),
        storageService.get<MenuItemExtended[]>(STORAGE_KEYS.MENU_ITEMS),
        storageService.get<ModifierGroup[]>(STORAGE_KEYS.MENU_MODIFIERS),
        storageService.get<ComboDeal[]>(STORAGE_KEYS.MENU_COMBOS),
        storageService.get<string>(STORAGE_KEYS.MENU_LAST_SYNC),
      ]);

    if (!categories || !menuItems) {
      return null;
    }

    return {
      categories: categories || [],
      menuItems: menuItems || [],
      modifierGroups: modifierGroups || [],
      combos: combos || [],
      lastUpdated: lastUpdated || new Date().toISOString(),
      restaurantId,
    };
  }

  /**
   * Check if menu data exists in storage
   */
  async hasMenuData(): Promise<boolean> {
    const lastSync = await storageService.get<string>(STORAGE_KEYS.MENU_LAST_SYNC);
    return lastSync !== null;
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<string | null> {
    return storageService.get<string>(STORAGE_KEYS.MENU_LAST_SYNC);
  }

  // ============== CATEGORIES ==============

  /**
   * Save categories
   */
  async saveCategories(categories: CategoryWithStats[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.MENU_CATEGORIES, categories);
    await this.updateLastSync();
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<CategoryWithStats[]> {
    const categories = await storageService.get<CategoryWithStats[]>(
      STORAGE_KEYS.MENU_CATEGORIES
    );
    return categories || [];
  }

  /**
   * Add a category
   */
  async addCategory(category: CategoryWithStats): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  }

  /**
   * Update a category
   */
  async updateCategory(
    id: string,
    data: Partial<CategoryWithStats>
  ): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...data };
      await this.saveCategories(categories);
    }
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    await this.saveCategories(filtered);
  }

  // ============== MENU ITEMS ==============

  /**
   * Save menu items
   */
  async saveMenuItems(items: MenuItemExtended[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.MENU_ITEMS, items);
    await this.updateLastSync();
  }

  /**
   * Get menu items
   */
  async getMenuItems(): Promise<MenuItemExtended[]> {
    const items = await storageService.get<MenuItemExtended[]>(
      STORAGE_KEYS.MENU_ITEMS
    );
    return items || [];
  }

  /**
   * Add a menu item
   */
  async addMenuItem(item: MenuItemExtended): Promise<void> {
    const items = await this.getMenuItems();
    items.push(item);
    await this.saveMenuItems(items);
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(
    id: string,
    data: Partial<MenuItemExtended>
  ): Promise<void> {
    const items = await this.getMenuItems();
    const index = items.findIndex((i) => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...data };
      await this.saveMenuItems(items);
    }
  }

  /**
   * Delete a menu item
   */
  async deleteMenuItem(id: string): Promise<void> {
    const items = await this.getMenuItems();
    const filtered = items.filter((i) => i.id !== id);
    await this.saveMenuItems(filtered);
  }

  // ============== MODIFIER GROUPS ==============

  /**
   * Save modifier groups
   */
  async saveModifierGroups(groups: ModifierGroup[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.MENU_MODIFIERS, groups);
    await this.updateLastSync();
  }

  /**
   * Get modifier groups
   */
  async getModifierGroups(): Promise<ModifierGroup[]> {
    const groups = await storageService.get<ModifierGroup[]>(
      STORAGE_KEYS.MENU_MODIFIERS
    );
    return groups || [];
  }

  /**
   * Add a modifier group
   */
  async addModifierGroup(group: ModifierGroup): Promise<void> {
    const groups = await this.getModifierGroups();
    groups.push(group);
    await this.saveModifierGroups(groups);
  }

  /**
   * Update a modifier group
   */
  async updateModifierGroup(
    id: string,
    data: Partial<ModifierGroup>
  ): Promise<void> {
    const groups = await this.getModifierGroups();
    const index = groups.findIndex((g) => g.id === id);
    if (index !== -1) {
      groups[index] = { ...groups[index], ...data };
      await this.saveModifierGroups(groups);
    }
  }

  /**
   * Delete a modifier group
   */
  async deleteModifierGroup(id: string): Promise<void> {
    const groups = await this.getModifierGroups();
    const filtered = groups.filter((g) => g.id !== id);
    await this.saveModifierGroups(filtered);
  }

  // ============== COMBOS ==============

  /**
   * Save combos
   */
  async saveCombos(combos: ComboDeal[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.MENU_COMBOS, combos);
    await this.updateLastSync();
  }

  /**
   * Get combos
   */
  async getCombos(): Promise<ComboDeal[]> {
    const combos = await storageService.get<ComboDeal[]>(STORAGE_KEYS.MENU_COMBOS);
    return combos || [];
  }

  /**
   * Add a combo
   */
  async addCombo(combo: ComboDeal): Promise<void> {
    const combos = await this.getCombos();
    combos.push(combo);
    await this.saveCombos(combos);
  }

  /**
   * Update a combo
   */
  async updateCombo(id: string, data: Partial<ComboDeal>): Promise<void> {
    const combos = await this.getCombos();
    const index = combos.findIndex((c) => c.id === id);
    if (index !== -1) {
      combos[index] = { ...combos[index], ...data };
      await this.saveCombos(combos);
    }
  }

  /**
   * Delete a combo
   */
  async deleteCombo(id: string): Promise<void> {
    const combos = await this.getCombos();
    const filtered = combos.filter((c) => c.id !== id);
    await this.saveCombos(filtered);
  }

  // ============== UTILITIES ==============

  /**
   * Update last sync timestamp
   */
  private async updateLastSync(): Promise<void> {
    await storageService.set(
      STORAGE_KEYS.MENU_LAST_SYNC,
      new Date().toISOString()
    );
  }

  /**
   * Clear all menu data
   */
  async clearMenuData(): Promise<void> {
    await Promise.all([
      storageService.remove(STORAGE_KEYS.MENU_CATEGORIES),
      storageService.remove(STORAGE_KEYS.MENU_ITEMS),
      storageService.remove(STORAGE_KEYS.MENU_MODIFIERS),
      storageService.remove(STORAGE_KEYS.MENU_COMBOS),
      storageService.remove(STORAGE_KEYS.MENU_LAST_SYNC),
    ]);
  }

  /**
   * Get storage info (for debugging)
   */
  async getStorageInfo(): Promise<{
    hasData: boolean;
    lastSync: string | null;
    categoriesCount: number;
    itemsCount: number;
    modifiersCount: number;
    combosCount: number;
  }> {
    const [categories, items, modifiers, combos, lastSync] = await Promise.all([
      this.getCategories(),
      this.getMenuItems(),
      this.getModifierGroups(),
      this.getCombos(),
      this.getLastSyncTime(),
    ]);

    return {
      hasData: lastSync !== null,
      lastSync,
      categoriesCount: categories.length,
      itemsCount: items.length,
      modifiersCount: modifiers.length,
      combosCount: combos.length,
    };
  }
}

// Export singleton instance
export const menuStorageService = new MenuStorageService();
