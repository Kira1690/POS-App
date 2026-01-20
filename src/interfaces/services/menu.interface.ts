import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '../../types/menu.types';

export interface IMenuService {
  getCategories(restaurantId: string): Promise<MenuCategory[]>;
  getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]>;
  getMenuItemsByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]>; // Alias for getMenuByCategory
  searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse>;
  getMenuItem(itemId: string): Promise<MenuItem>;
  getMenuItems(restaurantId: string): Promise<MenuItem[]>; // Get all menu items
  getPopularItems(restaurantId: string, limit?: number): Promise<MenuItem[]>;
}