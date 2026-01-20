import { BaseEntity } from './common.types';

export interface MenuCategory extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  color?: string;
  icon?: string;
  item_count?: number; // Number of items in this category
  // Optional stats for CategoryWithStats compatibility
  stats?: {
    itemCount: number;
    todayRevenue: number;
    avgPrice: number;
    popularItems: string[];
    lastUpdated: string;
  };
}

export interface MenuItem extends BaseEntity {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  image?: string; // Alias for image_url (backward compatibility)
  is_available: boolean;
  preparation_time_minutes?: number;
  preparation_time?: number; // Alias for preparation_time_minutes (backward compatibility)
  dietary_info?: string[];
  ingredients?: string[];
  // Extended properties for menu management
  sort_order?: number;
  cost_price?: number;
  tax_rate?: number;
  calories?: number;
  sku?: string;
  // Extended properties for kitchen and dietary management
  modifier_assignments?: Array<{
    id: string;
    menu_item_id: string;
    modifier_group_id: string;
    sort_order: number;
  }>;
  dietary_tags?: string[];
  allergens?: string[];
}

export interface MenuItemSearchRequest {
  restaurant_id: string;
  query: string;
  category_id?: string;
  available_only?: boolean;
}

export interface MenuItemsResponse {
  items: MenuItem[];
  total: number;
  has_more: boolean;
}