/**
 * Mock Menu API Client - For UI-only development
 * Returns dummy menu data without backend calls
 */

import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '@/types/menu.types';

export class MockMenuApiClient {
  
  private mockCategories: MenuCategory[] = [
    {
      id: 'cat_1',
      restaurant_id: 'rest_001',
      name: 'BEVERAGES',
      description: 'Hot and cold beverages',
      sort_order: 1,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'cat_2',
      restaurant_id: 'rest_001',
      name: 'CHINESE',
      description: 'Chinese cuisine',
      sort_order: 2,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'cat_3',
      restaurant_id: 'rest_001',
      name: 'NON VEG',
      description: 'Non-vegetarian dishes',
      sort_order: 3,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'cat_4',
      restaurant_id: 'rest_001',
      name: 'SPECIAL',
      description: 'Chef special dishes',
      sort_order: 4,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'cat_5',
      restaurant_id: 'rest_001',
      name: 'VEG',
      description: 'Vegetarian dishes',
      sort_order: 5,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
  ];

  private mockMenuItems: MenuItem[] = [
    // Beverages
    {
      id: 'item_1',
      restaurant_id: 'rest_001',
      category_id: 'cat_1',
      name: 'Coffee',
      description: 'Hot black coffee',
      price: 50,
      is_available: true,
      preparation_time_minutes: 5,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'item_2',
      restaurant_id: 'rest_001',
      category_id: 'cat_1',
      name: 'Tea',
      description: 'Hot chai tea',
      price: 30,
      is_available: true,
      preparation_time_minutes: 3,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    
    // VEG
    {
      id: 'item_3',
      restaurant_id: 'rest_001',
      category_id: 'cat_5',
      name: 'Paneer Butter Masala',
      description: 'Creamy paneer curry',
      price: 220,
      is_available: true,
      preparation_time_minutes: 15,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'item_4',
      restaurant_id: 'rest_001',
      category_id: 'cat_5',
      name: 'Dal Makhani',
      description: 'Rich black lentil curry',
      price: 160,
      is_available: true,
      preparation_time_minutes: 12,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'item_5',
      restaurant_id: 'rest_001',
      category_id: 'cat_5',
      name: 'Roti',
      description: 'Fresh wheat bread',
      price: 25,
      is_available: true,
      preparation_time_minutes: 3,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    
    // NON VEG
    {
      id: 'item_6',
      restaurant_id: 'rest_001',
      category_id: 'cat_3',
      name: 'Chicken Curry',
      description: 'Spicy chicken curry',
      price: 280,
      is_available: true,
      preparation_time_minutes: 20,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
    {
      id: 'item_7',
      restaurant_id: 'rest_001',
      category_id: 'cat_3',
      name: 'Fish Fry',
      description: 'Crispy fried fish',
      price: 320,
      is_available: true,
      preparation_time_minutes: 18,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-07-20T00:00:00Z',
    },
  ];

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