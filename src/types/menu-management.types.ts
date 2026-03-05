/**
 * Menu Management Types - Admin interfaces for menu operations
 * Extends base menu types with management-specific data
 */

import { MenuCategory, MenuItem } from './menu.types';
import { KitchenStation } from './order-extended.types';

export interface CategoryStats {
  itemCount: number;
  todayRevenue: number;
  avgPrice: number;
  popularItems: string[];
  lastUpdated: string;
}

export interface CategoryWithStats extends MenuCategory {
  stats: CategoryStats;
}

export interface MenuManagementStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalItems: number;
  todayRevenue: number;
  topPerformer: string;
}

export interface MenuItemWithStats extends MenuItem {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    avgOrderTime: number;
    customerRating: number;
    lastOrdered: string;
  };
}

export interface CreateCategoryRequest {
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
  color?: string;
  icon?: string;
}

export interface CreateMenuItemRequest {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
  /** IDs of modifier groups to assign to this item */
  modifier_group_ids?: string[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_available?: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
  category_id?: string;
  /** IDs of modifier groups to assign to this item */
  modifier_group_ids?: string[];
  /** Override which kitchen station prepares this item. undefined = auto-derive from category */
  kitchen_station?: KitchenStation;
}

export interface BulkMenuOperation {
  operation: 'enable' | 'disable' | 'delete' | 'update_category' | 'update_price';
  itemIds: string[];
  data?: {
    category_id?: string;
    price_adjustment?: number;
    price_adjustment_type?: 'percentage' | 'fixed';
  };
}

export interface MenuImportData {
  categories: CreateCategoryRequest[];
  items: CreateMenuItemRequest[];
}

export interface MenuManagementFilters {
  searchQuery: string;
  activeOnly: boolean;
  sortBy: 'name' | 'items' | 'revenue' | 'updated';
  sortOrder: 'asc' | 'desc';
}

export interface MenuItemFilters {
  searchQuery: string;
  categoryId?: string;
  availableOnly: boolean;
  sortBy: 'name' | 'price' | 'orders' | 'rating';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

export interface MenuManagementContextType {
  // Categories
  categories: CategoryWithStats[];
  selectedCategory: CategoryWithStats | null;
  
  // Menu Items
  menuItems: MenuItemWithStats[];
  selectedItems: string[];
  
  // Stats
  stats: MenuManagementStats | null;
  
  // Filters
  categoryFilters: MenuManagementFilters;
  itemFilters: MenuItemFilters;
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  itemsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions - Categories
  loadCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<CategoryWithStats>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<CategoryWithStats>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
  
  // Actions - Menu Items
  loadMenuItems: (categoryId?: string) => Promise<void>;
  createMenuItem: (data: CreateMenuItemRequest) => Promise<MenuItemWithStats>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<MenuItemWithStats>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  
  // Actions - Bulk Operations
  performBulkOperation: (operation: BulkMenuOperation) => Promise<void>;
  importMenu: (data: MenuImportData) => Promise<void>;
  exportMenu: (format: 'json' | 'csv' | 'excel') => Promise<void>;
  
  // Actions - Filters
  updateCategoryFilters: (filters: Partial<MenuManagementFilters>) => void;
  updateItemFilters: (filters: Partial<MenuItemFilters>) => void;
  
  // Actions - Selection
  selectCategory: (category: CategoryWithStats | null) => void;
  selectItem: (itemId: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
}