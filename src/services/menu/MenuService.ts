/**
 * Menu Service - Simple, focused menu management
 * Under 200 lines, single responsibility for menu operations
 */

import { IMenuService } from '@/interfaces';
import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '@/types/menu.types';
import { menuApiClient } from '../api/menu';

export class MenuService implements IMenuService {

  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    try {
      const categories = await menuApiClient.getCategories(restaurantId);
      
      if (__DEV__) {
        console.log(`[MenuService] Retrieved ${categories.length} categories for restaurant ${restaurantId}`);
      }
      
      return categories;
    } catch (error: any) {
      console.error('[MenuService] Failed to get categories:', error.message);
      throw new Error(error.message || 'Failed to get menu categories');
    }
  }

  async getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    try {
      const items = await menuApiClient.getMenuByCategory(restaurantId, categoryId);
      
      if (__DEV__) {
        console.log(`[MenuService] Retrieved ${items.length} items for category ${categoryId}`);
      }
      
      return items;
    } catch (error: any) {
      console.error('[MenuService] Failed to get menu by category:', error.message);
      throw new Error(error.message || 'Failed to get menu items');
    }
  }

  async searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse> {
    try {
      const result = await menuApiClient.searchMenuItems(request);
      
      if (__DEV__) {
        console.log(`[MenuService] Found ${result.items.length} items for query "${request.query}"`);
      }
      
      return result;
    } catch (error: any) {
      console.error('[MenuService] Failed to search menu items:', error.message);
      throw new Error(error.message || 'Failed to search menu items');
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    try {
      return await menuApiClient.getMenuItem(itemId);
    } catch (error: any) {
      console.error('[MenuService] Failed to get menu item:', error.message);
      throw new Error(error.message || 'Failed to get menu item');
    }
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    try {
      const items = await menuApiClient.getPopularItems(restaurantId, limit);
      
      if (__DEV__) {
        console.log(`[MenuService] Retrieved ${items.length} popular items`);
      }
      
      return items;
    } catch (error: any) {
      console.error('[MenuService] Failed to get popular items:', error.message);
      throw new Error(error.message || 'Failed to get popular items');
    }
  }
}

// Create and export singleton instance
export const menuService = new MenuService();

// Export the class for testing and custom instances
export { MenuService as MenuServiceClass };