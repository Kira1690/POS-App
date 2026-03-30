/**
 * Menu Storage Service - SQLite Implementation
 * Handles persistence of menu management data via expo-sqlite.
 */

import { MenuCategory } from '@/types/menu.types';
import { CategoryWithStats } from '@/types/menu-management.types';
import {
  MenuItemExtended,
  ModifierGroup,
  ComboDeal,
  KitchenStation,
} from '@/types/menu-management-extended.types';
import { databaseService } from '@/services/database/DatabaseService';
import { fromSqlBool, toSqlBool, parseJsonColumn, now } from '@/services/database/helpers';
import { DEV_FLAGS } from '@/constants/config';
import type { SQLiteDatabase } from 'expo-sqlite';

// Menu data structure for storage
export interface MenuStorageData {
  categories: CategoryWithStats[];
  menuItems: MenuItemExtended[];
  modifierGroups: ModifierGroup[];
  combos: ComboDeal[];
  lastUpdated: string;
  restaurantId: string;
}

// Row types
interface CategoryRow {
  id: string; restaurant_id: string; name: string; description: string | null;
  sort_order: number; is_active: number; color: string | null; icon: string | null;
  item_count: number; available_count: number;
  created_at: string; updated_at: string;
}

interface MenuItemRow {
  id: string; restaurant_id: string; category_id: string;
  name: string; description: string | null; price: number; image_url: string | null;
  is_available: number; preparation_time_minutes: number | null;
  sort_order: number; cost_price: number | null; tax_rate: number | null;
  calories: number | null; sku: string | null;
  dietary_tags: string | null; allergens: string | null;
  kitchen_station: string | null;
  created_at: string; updated_at: string;
}

interface ModifierGroupRow {
  id: string; restaurant_id: string; name: string; selection_type: string;
  is_required: number; min_selections: number | null; max_selections: number | null;
  is_active: number; sort_order: number; options: string | null;
  created_at: string; updated_at: string;
}

interface ComboRow {
  id: string; restaurant_id: string; name: string; description: string | null;
  image_url: string | null; regular_price: number; combo_price: number;
  savings_amount: number; savings_percentage: number; is_active: number;
  availability: string | null; items: string | null;
  created_at: string; updated_at: string;
}

interface AssignmentRow {
  id: string; menu_item_id: string; modifier_group_id: string;
  sort_order: number; created_at: string;
}

class MenuStorageService {
  private _db: SQLiteDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Async DB getter — waits for DatabaseService to finish initialization.
   * Eliminates the race condition where getDatabase() throws before DB is ready.
   */
  private async ensureDb(): Promise<SQLiteDatabase> {
    if (!this._db) {
      this._db = await databaseService.initialize();
    }
    return this._db;
  }

  // ============== CONVERTERS ==============

  private categoryFromRow(row: CategoryRow): CategoryWithStats {
    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      name: row.name,
      description: row.description || undefined,
      sort_order: row.sort_order,
      is_active: fromSqlBool(row.is_active),
      color: row.color || undefined,
      icon: row.icon || undefined,
      item_count: row.item_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
      stats: {
        itemCount: row.item_count,
        todayRevenue: 0,
        avgPrice: 0,
        popularItems: [],
        lastUpdated: row.updated_at,
      },
    } as CategoryWithStats;
  }

  private menuItemFromRow(
    row: MenuItemRow,
    assignments: AssignmentRow[],
    modifierGroups: ModifierGroup[]
  ): MenuItemExtended {
    const itemAssignments = assignments.filter((a) => a.menu_item_id === row.id);
    const itemModifierGroups = itemAssignments
      .map((a) => modifierGroups.find((g) => g.id === a.modifier_group_id))
      .filter((g): g is ModifierGroup => g !== undefined);

    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      category_id: row.category_id,
      name: row.name,
      description: row.description || undefined,
      price: row.price,
      image_url: row.image_url || undefined,
      is_available: fromSqlBool(row.is_available),
      preparation_time_minutes: row.preparation_time_minutes || undefined,
      sort_order: row.sort_order,
      cost_price: row.cost_price || undefined,
      tax_rate: row.tax_rate || undefined,
      calories: row.calories || undefined,
      sku: row.sku || undefined,
      dietary_tags: parseJsonColumn(row.dietary_tags, []),
      allergens: parseJsonColumn(row.allergens, []),
      kitchen_station: (row.kitchen_station as KitchenStation) || undefined,
      modifier_groups: itemModifierGroups,
      modifier_assignments: itemAssignments.map((a) => ({
        id: a.id,
        menu_item_id: a.menu_item_id,
        modifier_group_id: a.modifier_group_id,
        sort_order: a.sort_order,
        created_at: a.created_at,
      })),
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as MenuItemExtended;
  }

  private modifierGroupFromRow(row: ModifierGroupRow): ModifierGroup {
    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      name: row.name,
      selection_type: row.selection_type,
      is_required: fromSqlBool(row.is_required),
      min_selections: row.min_selections || undefined,
      max_selections: row.max_selections || undefined,
      is_active: fromSqlBool(row.is_active),
      sort_order: row.sort_order,
      options: parseJsonColumn(row.options, []),
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as ModifierGroup;
  }

  private comboFromRow(row: ComboRow): ComboDeal {
    return {
      id: row.id,
      restaurant_id: row.restaurant_id,
      name: row.name,
      description: row.description || undefined,
      image_url: row.image_url || undefined,
      regular_price: row.regular_price,
      combo_price: row.combo_price,
      savings_amount: row.savings_amount,
      savings_percentage: row.savings_percentage,
      is_active: fromSqlBool(row.is_active),
      availability: parseJsonColumn(row.availability, { always_available: true }),
      combo_items: parseJsonColumn(row.items, []),
      created_at: row.created_at,
      updated_at: row.updated_at,
    } as ComboDeal;
  }

  // ============== FULL MENU DATA ==============

  async saveMenuData(data: MenuStorageData): Promise<void> {
    await this.saveCategories(data.categories);
    await this.saveMenuItems(data.menuItems);
    await this.saveModifierGroups(data.modifierGroups);
    await this.saveCombos(data.combos);
  }

  async getMenuData(restaurantId: string): Promise<MenuStorageData | null> {
    const [categories, modifierGroups, combos] = await Promise.all([
      this.getCategories(),
      this.getModifierGroups(),
      this.getCombos(),
    ]);

    // Get all items with modifier assemblies
    const itemRows = await (await this.ensureDb()).getAllAsync<MenuItemRow>(
      'SELECT * FROM menu_items ORDER BY sort_order, name'
    );
    const assignmentRows = await (await this.ensureDb()).getAllAsync<AssignmentRow>(
      'SELECT * FROM menu_item_modifier_assignments ORDER BY sort_order'
    );

    const menuItems = itemRows.map((r) => this.menuItemFromRow(r, assignmentRows, modifierGroups));

    if (categories.length === 0 && menuItems.length === 0) return null;

    return {
      categories,
      menuItems,
      modifierGroups,
      combos,
      lastUpdated: now(),
      restaurantId,
    };
  }

  async hasMenuData(): Promise<boolean> {
    const row = await (await this.ensureDb()).getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM menu_categories'
    );
    return (row?.cnt || 0) > 0;
  }

  async getLastSyncTime(): Promise<string | null> {
    const row = await (await this.ensureDb()).getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'menu_last_sync'`
    );
    return row?.value || null;
  }

  // ============== CATEGORIES ==============

  async saveCategories(categories: CategoryWithStats[]): Promise<void> {
    for (const c of categories) {
      await (await this.ensureDb()).runAsync(
        `INSERT OR REPLACE INTO menu_categories (id, restaurant_id, name, description, sort_order, is_active, color, icon, item_count, available_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c.id, c.restaurant_id || 'rest_001', c.name, c.description || null,
        c.sort_order || 0, toSqlBool(c.is_active), c.color || null, c.icon || null,
        c.stats?.itemCount || c.item_count || 0, c.stats?.itemCount || c.item_count || 0,
        c.created_at || now(), c.updated_at || now()
      );
    }
    await this.updateLastSync();
  }

  async getCategories(): Promise<CategoryWithStats[]> {
    const rows = await (await this.ensureDb()).getAllAsync<CategoryRow>(
      'SELECT * FROM menu_categories ORDER BY sort_order, name'
    );
    return rows.map((r) => this.categoryFromRow(r));
  }

  async addCategory(category: CategoryWithStats): Promise<void> {
    await (await this.ensureDb()).runAsync(
      `INSERT OR REPLACE INTO menu_categories (id, restaurant_id, name, description, sort_order, is_active, color, icon, item_count, available_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      category.id, category.restaurant_id || 'rest_001', category.name, category.description || null,
      category.sort_order || 0, toSqlBool(category.is_active), category.color || null, category.icon || null,
      category.stats?.itemCount || category.item_count || 0, category.stats?.itemCount || category.item_count || 0,
      category.created_at || now(), category.updated_at || now()
    );
    await this.updateLastSync();
  }

  async updateCategory(id: string, data: Partial<CategoryWithStats>): Promise<void> {
    const existing = await (await this.ensureDb()).getFirstAsync<CategoryRow>(
      'SELECT * FROM menu_categories WHERE id = ?', id
    );
    if (!existing) return;

    const current = this.categoryFromRow(existing);
    const updated = { ...current, ...data, updated_at: now() };
    await this.addCategory(updated as CategoryWithStats);
  }

  async deleteCategory(id: string): Promise<void> {
    await (await this.ensureDb()).runAsync('DELETE FROM menu_categories WHERE id = ?', id);
    await this.updateLastSync();
  }

  // ============== MENU ITEMS ==============

  async saveMenuItems(items: MenuItemExtended[]): Promise<void> {
    for (const item of items) {
      await (await this.ensureDb()).runAsync(
        `INSERT OR REPLACE INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, preparation_time_minutes, sort_order, cost_price, tax_rate, calories, sku, dietary_tags, allergens, kitchen_station, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item.id, item.restaurant_id || 'rest_001', item.category_id,
        item.name, item.description || null, item.price, item.image_url || null,
        toSqlBool(item.is_available), item.preparation_time_minutes || null,
        item.sort_order || 0, item.cost_price || null, item.tax_rate || null,
        item.calories || null, item.sku || null,
        item.dietary_tags ? JSON.stringify(item.dietary_tags) : null,
        item.allergens ? JSON.stringify(item.allergens) : null,
        item.kitchen_station || null,
        item.created_at || now(), item.updated_at || now()
      );

      // Save modifier assignments
      if (item.modifier_assignments) {
        // Clear existing assignments for this item
        await (await this.ensureDb()).runAsync(
          'DELETE FROM menu_item_modifier_assignments WHERE menu_item_id = ?', item.id
        );

        for (const assignment of item.modifier_assignments) {
          await (await this.ensureDb()).runAsync(
            `INSERT OR REPLACE INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            assignment.id, assignment.menu_item_id || item.id,
            assignment.modifier_group_id, assignment.sort_order || 0,
            assignment.created_at || now()
          );
        }
      }
    }
    await this.updateLastSync();
  }

  async getMenuItems(): Promise<MenuItemExtended[]> {
    const db = await this.ensureDb();
    const [itemRows, assignmentRows, modifierGroups] = await Promise.all([
      db.getAllAsync<MenuItemRow>('SELECT * FROM menu_items ORDER BY sort_order, name'),
      db.getAllAsync<AssignmentRow>('SELECT * FROM menu_item_modifier_assignments ORDER BY sort_order'),
      this.getModifierGroups(),
    ]);
    return itemRows.map((r) => this.menuItemFromRow(r, assignmentRows, modifierGroups));
  }

  async addMenuItem(item: MenuItemExtended): Promise<void> {
    // When syncing from server, modifier_groups comes as Prisma nested relation
    // (e.g. { modifier_group_id, modifier_group: { id, name, options } })
    // but saveMenuItems expects modifier_assignments. Convert if needed.
    if ((!item.modifier_assignments || item.modifier_assignments.length === 0) && (item as any).modifier_groups) {
      const serverGroups = (item as any).modifier_groups as any[];
      if (serverGroups.length > 0 && serverGroups[0]?.modifier_group_id) {
        item.modifier_assignments = serverGroups.map((sg: any, idx: number) => ({
          id: `${item.id}_${String(sg.modifier_group_id)}`,
          menu_item_id: String(item.id),
          modifier_group_id: String(sg.modifier_group_id),
          sort_order: idx,
        }));
      }
    }
    await this.saveMenuItems([item]);
  }

  async updateMenuItem(id: string, data: Partial<MenuItemExtended>): Promise<void> {
    const existing = await (await this.ensureDb()).getFirstAsync<MenuItemRow>(
      'SELECT * FROM menu_items WHERE id = ?', id
    );
    if (!existing) return;

    const modifierGroups = await this.getModifierGroups();
    const assignments = await (await this.ensureDb()).getAllAsync<AssignmentRow>(
      'SELECT * FROM menu_item_modifier_assignments WHERE menu_item_id = ?', id
    );
    const current = this.menuItemFromRow(existing, assignments, modifierGroups);
    const updated = { ...current, ...data, updated_at: now() };
    await this.saveMenuItems([updated as MenuItemExtended]);
  }

  async deleteMenuItem(id: string): Promise<void> {
    await (await this.ensureDb()).runAsync('DELETE FROM menu_items WHERE id = ?', id);
    await (await this.ensureDb()).runAsync('DELETE FROM menu_item_modifier_assignments WHERE menu_item_id = ?', id);
    await this.updateLastSync();
  }

  async getMenuItemById(id: string): Promise<MenuItemExtended | null> {
    const db = await this.ensureDb();
    const row = await db.getFirstAsync<MenuItemRow>(
      'SELECT * FROM menu_items WHERE id = ?', id
    );
    if (!row) return null;

    const [assignments, modifierGroups] = await Promise.all([
      db.getAllAsync<AssignmentRow>(
        'SELECT * FROM menu_item_modifier_assignments WHERE menu_item_id = ?', id
      ),
      this.getModifierGroups(),
    ]);
    return this.menuItemFromRow(row, assignments, modifierGroups);
  }

  async getMenuItemsByIds(ids: string[]): Promise<Map<string, MenuItemExtended>> {
    const items = await this.getMenuItems();
    const itemMap = new Map<string, MenuItemExtended>();
    for (const item of items) {
      if (ids.includes(item.id)) {
        itemMap.set(item.id, item);
      }
    }
    return itemMap;
  }

  // ============== MODIFIER GROUPS ==============

  async saveModifierGroups(groups: ModifierGroup[]): Promise<void> {
    for (const g of groups) {
      await (await this.ensureDb()).runAsync(
        `INSERT OR REPLACE INTO modifier_groups (id, restaurant_id, name, selection_type, is_required, min_selections, max_selections, is_active, sort_order, options, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        g.id, g.restaurant_id || 'rest_001', g.name, g.selection_type || 'single',
        toSqlBool(g.is_required), g.min_selections || null, g.max_selections || null,
        toSqlBool(g.is_active), g.sort_order || 0,
        g.options ? JSON.stringify(g.options) : null,
        g.created_at || now(), g.updated_at || now()
      );
    }
    await this.updateLastSync();
  }

  async getModifierGroups(): Promise<ModifierGroup[]> {
    const rows = await (await this.ensureDb()).getAllAsync<ModifierGroupRow>(
      'SELECT * FROM modifier_groups ORDER BY sort_order, name'
    );
    return rows.map((r) => this.modifierGroupFromRow(r));
  }

  async addModifierGroup(group: ModifierGroup): Promise<void> {
    await this.saveModifierGroups([group]);
  }

  async updateModifierGroup(id: string, data: Partial<ModifierGroup>): Promise<void> {
    const existing = await (await this.ensureDb()).getFirstAsync<ModifierGroupRow>(
      'SELECT * FROM modifier_groups WHERE id = ?', id
    );
    if (!existing) return;

    const current = this.modifierGroupFromRow(existing);
    const updated = { ...current, ...data, updated_at: now() };
    await this.saveModifierGroups([updated as ModifierGroup]);
  }

  async deleteModifierGroup(id: string): Promise<void> {
    await (await this.ensureDb()).runAsync('DELETE FROM modifier_groups WHERE id = ?', id);
    await (await this.ensureDb()).runAsync('DELETE FROM menu_item_modifier_assignments WHERE modifier_group_id = ?', id);
    await this.updateLastSync();
  }

  // ============== COMBOS ==============

  async saveCombos(combos: ComboDeal[]): Promise<void> {
    for (const combo of combos) {
      await (await this.ensureDb()).runAsync(
        `INSERT OR REPLACE INTO combo_deals (id, restaurant_id, name, description, image_url, regular_price, combo_price, savings_amount, savings_percentage, is_active, availability, items, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        combo.id, combo.restaurant_id || 'rest_001', combo.name, combo.description || null,
        combo.image_url || null, combo.regular_price || 0, combo.combo_price || 0,
        combo.savings_amount || 0, combo.savings_percentage || 0,
        toSqlBool(combo.is_active), combo.availability ? JSON.stringify(combo.availability) : null,
        combo.combo_items ? JSON.stringify(combo.combo_items) : null,
        combo.created_at || now(), combo.updated_at || now()
      );
    }
    await this.updateLastSync();
  }

  async getCombos(): Promise<ComboDeal[]> {
    const rows = await (await this.ensureDb()).getAllAsync<ComboRow>(
      'SELECT * FROM combo_deals ORDER BY name'
    );
    return rows.map((r) => this.comboFromRow(r));
  }

  async addCombo(combo: ComboDeal): Promise<void> {
    await this.saveCombos([combo]);
  }

  async updateCombo(id: string, data: Partial<ComboDeal>): Promise<void> {
    const existing = await (await this.ensureDb()).getFirstAsync<ComboRow>(
      'SELECT * FROM combo_deals WHERE id = ?', id
    );
    if (!existing) return;

    const current = this.comboFromRow(existing);
    const updated = { ...current, ...data, updated_at: now() };
    await this.saveCombos([updated as ComboDeal]);
  }

  async deleteCombo(id: string): Promise<void> {
    await (await this.ensureDb()).runAsync('DELETE FROM combo_deals WHERE id = ?', id);
    await this.updateLastSync();
  }

  // ============== MODIFIER ASSIGNMENTS ==============

  async getModifierAssignments(menuItemId: string): Promise<AssignmentRow[]> {
    return (await this.ensureDb()).getAllAsync<AssignmentRow>(
      'SELECT * FROM menu_item_modifier_assignments WHERE menu_item_id = ? ORDER BY sort_order',
      menuItemId
    );
  }

  async getModifiersForMenuItem(menuItemId: string): Promise<ModifierGroup[]> {
    const assignments = await this.getModifierAssignments(menuItemId);
    if (assignments.length === 0) return [];

    const allGroups = await this.getModifierGroups();
    return assignments
      .map((a) => allGroups.find((g) => g.id === a.modifier_group_id))
      .filter((g): g is ModifierGroup => g !== undefined);
  }

  async assignModifiersToMenuItem(menuItemId: string, modifierGroupIds: string[]): Promise<void> {
    // Clear existing assignments
    await (await this.ensureDb()).runAsync(
      'DELETE FROM menu_item_modifier_assignments WHERE menu_item_id = ?', menuItemId
    );

    // Insert new assignments
    for (let i = 0; i < modifierGroupIds.length; i++) {
      const groupId = modifierGroupIds[i];
      await (await this.ensureDb()).runAsync(
        `INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        `assignment_${menuItemId}_${groupId}_${Date.now()}`,
        menuItemId, groupId, i, now()
      );
    }
    await this.updateLastSync();
  }

  async addModifierToMenuItem(menuItemId: string, modifierGroupId: string): Promise<void> {
    const existing = await (await this.ensureDb()).getFirstAsync<AssignmentRow>(
      'SELECT * FROM menu_item_modifier_assignments WHERE menu_item_id = ? AND modifier_group_id = ?',
      menuItemId, modifierGroupId
    );
    if (existing) return; // Already assigned

    const countRow = await (await this.ensureDb()).getFirstAsync<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM menu_item_modifier_assignments WHERE menu_item_id = ?',
      menuItemId
    );

    await (await this.ensureDb()).runAsync(
      `INSERT INTO menu_item_modifier_assignments (id, menu_item_id, modifier_group_id, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      `assignment_${menuItemId}_${modifierGroupId}_${Date.now()}`,
      menuItemId, modifierGroupId, countRow?.cnt || 0, now()
    );
    await this.updateLastSync();
  }

  async removeModifierFromMenuItem(menuItemId: string, modifierGroupId: string): Promise<void> {
    await (await this.ensureDb()).runAsync(
      'DELETE FROM menu_item_modifier_assignments WHERE menu_item_id = ? AND modifier_group_id = ?',
      menuItemId, modifierGroupId
    );
    await this.updateLastSync();
  }

  async clearModifierAssignments(menuItemId: string): Promise<void> {
    await (await this.ensureDb()).runAsync(
      'DELETE FROM menu_item_modifier_assignments WHERE menu_item_id = ?', menuItemId
    );
    await this.updateLastSync();
  }

  // ============== INITIALIZATION ==============

  /**
   * Initialize menu storage - seeds mock data on first launch.
   * Uses mutex to prevent concurrent initialization calls.
   */
  async initialize(restaurantId: string = 'rest_001'): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize(restaurantId);
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async doInitialize(restaurantId: string): Promise<void> {
    if (__DEV__) {
      console.log('[MenuStorageService] Initializing...');
    }

    const hasData = await this.hasMenuData();
    if (hasData) {
      if (__DEV__) {
        const info = await this.getStorageInfo();
        console.log(`[MenuStorageService] Loaded ${info.categoriesCount} categories, ${info.itemsCount} items`);
      }
      return;
    }

    if (!DEV_FLAGS.SEED_DEMO_DATA) {
      if (__DEV__) {
        console.log('[MenuStorageService] No menu data found. SEED_DEMO_DATA=false — starting empty.');
      }
      return;
    }
    if (__DEV__) {
      console.log('[MenuStorageService] No menu data found. Seeding mock data...');
    }
    await this.seedMockMenuData(restaurantId);
  }

  /**
   * Seed mock menu categories and items into SQLite.
   * Uses the same data as MockMenuApiClient for consistency.
   */
  private async seedMockMenuData(restaurantId: string): Promise<void> {
    const categories: CategoryWithStats[] = [
      { id: 'cat_1', restaurant_id: restaurantId, name: 'BEVERAGES', description: 'Hot and cold beverages', sort_order: 1, is_active: true, item_count: 2, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z', stats: { itemCount: 2, todayRevenue: 0, avgPrice: 3.75, popularItems: [], lastUpdated: now() } },
      { id: 'cat_2', restaurant_id: restaurantId, name: 'CHINESE', description: 'Chinese cuisine', sort_order: 2, is_active: true, item_count: 0, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z', stats: { itemCount: 0, todayRevenue: 0, avgPrice: 0, popularItems: [], lastUpdated: now() } },
      { id: 'cat_3', restaurant_id: restaurantId, name: 'NON VEG', description: 'Non-vegetarian dishes', sort_order: 3, is_active: true, item_count: 2, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z', stats: { itemCount: 2, todayRevenue: 0, avgPrice: 20.49, popularItems: [], lastUpdated: now() } },
      { id: 'cat_4', restaurant_id: restaurantId, name: 'SPECIAL', description: 'Chef special dishes', sort_order: 4, is_active: true, item_count: 0, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z', stats: { itemCount: 0, todayRevenue: 0, avgPrice: 0, popularItems: [], lastUpdated: now() } },
      { id: 'cat_5', restaurant_id: restaurantId, name: 'VEG', description: 'Vegetarian dishes', sort_order: 5, is_active: true, item_count: 3, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z', stats: { itemCount: 3, todayRevenue: 0, avgPrice: 11.16, popularItems: [], lastUpdated: now() } },
    ] as CategoryWithStats[];

    const menuItems: MenuItemExtended[] = [
      { id: 'item_1', restaurant_id: restaurantId, category_id: 'cat_1', name: 'Coffee', description: 'Hot black coffee', price: 4.50, is_available: true, preparation_time_minutes: 5, sort_order: 1, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_2', restaurant_id: restaurantId, category_id: 'cat_1', name: 'Tea', description: 'Hot chai tea', price: 3.00, is_available: true, preparation_time_minutes: 3, sort_order: 2, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_3', restaurant_id: restaurantId, category_id: 'cat_5', name: 'Paneer Butter Masala', description: 'Creamy paneer curry', price: 16.99, is_available: true, preparation_time_minutes: 15, sort_order: 1, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_4', restaurant_id: restaurantId, category_id: 'cat_5', name: 'Dal Makhani', description: 'Rich black lentil curry', price: 13.99, is_available: true, preparation_time_minutes: 12, sort_order: 2, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_5', restaurant_id: restaurantId, category_id: 'cat_5', name: 'Roti', description: 'Fresh wheat bread', price: 2.50, is_available: true, preparation_time_minutes: 3, sort_order: 3, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_6', restaurant_id: restaurantId, category_id: 'cat_3', name: 'Chicken Curry', description: 'Spicy chicken curry', price: 18.99, is_available: true, preparation_time_minutes: 20, sort_order: 1, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
      { id: 'item_7', restaurant_id: restaurantId, category_id: 'cat_3', name: 'Fish Fry', description: 'Crispy fried fish', price: 21.99, is_available: true, preparation_time_minutes: 18, sort_order: 2, created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z' },
    ] as MenuItemExtended[];

    // Modifier groups with options
    const modifierGroups: ModifierGroup[] = [
      {
        id: 'mod_1', restaurant_id: restaurantId, name: 'Spice Level',
        description: 'Choose your spice level', selection_type: 'single',
        is_required: false, min_selections: 0, max_selections: 1,
        is_active: true, sort_order: 1,
        created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z',
        options: [
          { id: 'opt_1a', modifier_group_id: 'mod_1', name: 'Mild', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1 },
          { id: 'opt_1b', modifier_group_id: 'mod_1', name: 'Medium', price_adjustment: 0, is_default: false, is_available: true, sort_order: 2 },
          { id: 'opt_1c', modifier_group_id: 'mod_1', name: 'Hot', price_adjustment: 0, is_default: false, is_available: true, sort_order: 3 },
          { id: 'opt_1d', modifier_group_id: 'mod_1', name: 'Extra Hot', price_adjustment: 0.50, is_default: false, is_available: true, sort_order: 4 },
        ],
      },
      {
        id: 'mod_2', restaurant_id: restaurantId, name: 'Add-ons',
        description: 'Extra toppings and sides', selection_type: 'multiple',
        is_required: false, min_selections: 0, max_selections: 4,
        is_active: true, sort_order: 2,
        created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z',
        options: [
          { id: 'opt_2a', modifier_group_id: 'mod_2', name: 'Extra Cheese', price_adjustment: 1.50, is_default: false, is_available: true, sort_order: 1 },
          { id: 'opt_2b', modifier_group_id: 'mod_2', name: 'Extra Sauce', price_adjustment: 0.75, is_default: false, is_available: true, sort_order: 2 },
          { id: 'opt_2c', modifier_group_id: 'mod_2', name: 'Extra Butter', price_adjustment: 0.50, is_default: false, is_available: true, sort_order: 3 },
          { id: 'opt_2d', modifier_group_id: 'mod_2', name: 'Raita', price_adjustment: 2.00, is_default: false, is_available: true, sort_order: 4 },
        ],
      },
      {
        id: 'mod_3', restaurant_id: restaurantId, name: 'Drink Size',
        description: 'Choose your drink size', selection_type: 'single',
        is_required: true, min_selections: 1, max_selections: 1,
        is_active: true, sort_order: 3,
        created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z',
        options: [
          { id: 'opt_3a', modifier_group_id: 'mod_3', name: 'Small', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1 },
          { id: 'opt_3b', modifier_group_id: 'mod_3', name: 'Medium', price_adjustment: 1.00, is_default: false, is_available: true, sort_order: 2 },
          { id: 'opt_3c', modifier_group_id: 'mod_3', name: 'Large', price_adjustment: 2.00, is_default: false, is_available: true, sort_order: 3 },
        ],
      },
      {
        id: 'mod_4', restaurant_id: restaurantId, name: 'Cooking Preference',
        description: 'How would you like it cooked', selection_type: 'single',
        is_required: false, min_selections: 0, max_selections: 1,
        is_active: true, sort_order: 4,
        created_at: '2025-07-20T00:00:00Z', updated_at: '2025-07-20T00:00:00Z',
        options: [
          { id: 'opt_4a', modifier_group_id: 'mod_4', name: 'Grilled', price_adjustment: 0, is_default: true, is_available: true, sort_order: 1 },
          { id: 'opt_4b', modifier_group_id: 'mod_4', name: 'Deep Fried', price_adjustment: 1.00, is_default: false, is_available: true, sort_order: 2 },
          { id: 'opt_4c', modifier_group_id: 'mod_4', name: 'Steamed', price_adjustment: 0, is_default: false, is_available: true, sort_order: 3 },
        ],
      },
    ];

    // Assignments: which items get which modifier groups
    // Beverages (Coffee, Tea) → Drink Size
    // Curries (Paneer, Dal, Chicken) → Spice Level + Add-ons
    // Fish Fry → Cooking Preference + Spice Level
    // Roti → Add-ons (extra butter)
    const assignments: Array<{ menuItemId: string; modifierGroupIds: string[] }> = [
      { menuItemId: 'item_1', modifierGroupIds: ['mod_3'] },              // Coffee → Drink Size
      { menuItemId: 'item_2', modifierGroupIds: ['mod_3'] },              // Tea → Drink Size
      { menuItemId: 'item_3', modifierGroupIds: ['mod_1', 'mod_2'] },     // Paneer Butter Masala → Spice Level + Add-ons
      { menuItemId: 'item_4', modifierGroupIds: ['mod_1', 'mod_2'] },     // Dal Makhani → Spice Level + Add-ons
      { menuItemId: 'item_5', modifierGroupIds: ['mod_2'] },              // Roti → Add-ons
      { menuItemId: 'item_6', modifierGroupIds: ['mod_1', 'mod_2'] },     // Chicken Curry → Spice Level + Add-ons
      { menuItemId: 'item_7', modifierGroupIds: ['mod_1', 'mod_4'] },     // Fish Fry → Spice Level + Cooking Preference
    ];

    await this.saveCategories(categories);
    await this.saveMenuItems(menuItems);
    await this.saveModifierGroups(modifierGroups);
    for (const a of assignments) {
      await this.assignModifiersToMenuItem(a.menuItemId, a.modifierGroupIds);
    }

    if (__DEV__) {
      console.log(`[MenuStorageService] Seeded ${categories.length} categories, ${menuItems.length} items, ${modifierGroups.length} modifier groups`);
    }
  }

  // ============== UTILITIES ==============

  private async updateLastSync(): Promise<void> {
    await (await this.ensureDb()).runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('menu_last_sync', ?, ?)`,
      now(), now()
    );
  }

  async clearMenuData(): Promise<void> {
    await (await this.ensureDb()).execAsync('DELETE FROM menu_categories');
    await (await this.ensureDb()).execAsync('DELETE FROM menu_items');
    await (await this.ensureDb()).execAsync('DELETE FROM modifier_groups');
    await (await this.ensureDb()).execAsync('DELETE FROM modifier_options');
    await (await this.ensureDb()).execAsync('DELETE FROM menu_item_modifier_assignments');
    await (await this.ensureDb()).execAsync('DELETE FROM combo_deals');
    await (await this.ensureDb()).runAsync(`DELETE FROM sync_metadata WHERE key = 'menu_last_sync'`);
  }

  async getStorageInfo(): Promise<{
    hasData: boolean;
    lastSync: string | null;
    categoriesCount: number;
    itemsCount: number;
    modifiersCount: number;
    combosCount: number;
  }> {
    const db = await this.ensureDb();
    const [cats, items, mods, combos, lastSync] = await Promise.all([
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM menu_categories'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM menu_items'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM modifier_groups'),
      db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM combo_deals'),
      this.getLastSyncTime(),
    ]);

    return {
      hasData: (cats?.cnt || 0) > 0,
      lastSync,
      categoriesCount: cats?.cnt || 0,
      itemsCount: items?.cnt || 0,
      modifiersCount: mods?.cnt || 0,
      combosCount: combos?.cnt || 0,
    };
  }
}

// Export singleton instance
export const menuStorageService = new MenuStorageService();
