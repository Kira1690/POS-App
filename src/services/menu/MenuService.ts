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
      throw new Error(error.message || 'Failed to get menu categories');
    }
  }

  async getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    try {
      return await menuApiClient.getMenuByCategory(restaurantId, categoryId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get menu items');
    }
  }

  async searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse> {
    try {
      return await menuApiClient.searchMenuItems(request);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search menu items');
    }
  }

  async getMenuItemsByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    // Alias for getMenuByCategory
    return this.getMenuByCategory(restaurantId, categoryId);
  }

  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const categories = await this.getCategories(restaurantId);
      const allItems: MenuItem[] = [];

      for (const category of categories) {
        const items = await this.getMenuByCategory(restaurantId, category.id);
        allItems.push(...items);
      }

      return allItems;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get menu items');
    }
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    try {
      return await menuApiClient.getMenuItem(itemId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get menu item');
    }
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    try {
      return await menuApiClient.getPopularItems(restaurantId, limit);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get popular items');
    }
  }
}

// Create and export singleton instance
export const menuService = new MenuService();

// Export the class for testing and custom instances
export { MenuService as MenuServiceClass };