/**
 * Mock Menu API Client - For UI-only development
 * Returns dummy menu data without backend calls
 */

import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '@/types/menu.types';

export class MockMenuApiClient {
  
  // Empty by default — strict no-mock-data policy. Tests create their own data.
  private mockCategories: MenuCategory[] = [];

  // Empty by default — strict no-mock-data policy. Tests create their own data.
  private mockMenuItems: MenuItem[] = [];

  private delay(ms: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    await this.delay();
    
    if (__DEV__) {
      console.log('[MockMenuApi] getCategories called for restaurant:', restaurantId);
    }
    
    return this.mockCategories.filter(cat => cat.restaurant_id === restaurantId);
  }

  async getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    await this.delay();
    
    if (__DEV__) {
      console.log('[MockMenuApi] getMenuByCategory called:', categoryId);
    }
    
    return this.mockMenuItems.filter(item => 
      item.restaurant_id === restaurantId && 
      item.category_id === categoryId &&
      item.is_available
    );
  }

  async searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse> {
    await this.delay();
    
    const { restaurant_id, query, category_id, available_only } = request;
    
    let filteredItems = this.mockMenuItems.filter(item => 
      item.restaurant_id === restaurant_id
    );
    
    if (category_id) {
      filteredItems = filteredItems.filter(item => item.category_id === category_id);
    }
    
    if (available_only) {
      filteredItems = filteredItems.filter(item => item.is_available);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (__DEV__) {
      console.log('[MockMenuApi] searchMenuItems found:', filteredItems.length, 'items');
    }
    
    return {
      items: filteredItems,
      total: filteredItems.length,
      has_more: false,
    };
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    await this.delay();
    
    const item = this.mockMenuItems.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    
    return item;
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    await this.delay();
    
    const availableItems = this.mockMenuItems.filter(item => 
      item.restaurant_id === restaurantId && item.is_available
    );
    
    // Return random items as "popular" for demo
    const shuffled = availableItems.sort(() => 0.5 - Math.random());
    
    if (__DEV__) {
      console.log('[MockMenuApi] getPopularItems returning:', Math.min(limit, shuffled.length), 'items');
    }
    
    return shuffled.slice(0, limit);
  }
}