import { BaseEntity } from './common.types';

export interface MenuCategory extends BaseEntity {
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  color?: string;
  icon?: string;
}

export interface MenuItem extends BaseEntity {
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  preparation_time_minutes?: number;
  dietary_info?: string[];
  ingredients?: string[];
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