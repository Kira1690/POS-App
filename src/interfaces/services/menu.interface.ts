import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '../../types/menu.types';

export interface IMenuService {
  getCategories(restaurantId: string): Promise<MenuCategory[]>;
  getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]>;
  searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse>;
  getMenuItem(itemId: string): Promise<MenuItem>;
  getPopularItems(restaurantId: string, limit?: number): Promise<MenuItem[]>;
}