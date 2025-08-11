/**
 * Menu API Client - Clean, focused menu operations
 * Under 200 lines, single responsibility for menu API calls
 */

import { SimpleApiClient } from '../base/SimpleApiClient';
import { authApiClient } from '../auth';
import { MenuItem, MenuCategory, MenuItemSearchRequest, MenuItemsResponse } from '@/types/menu.types';

export class MenuApiClient extends SimpleApiClient {
  
  constructor() {
    super({}, authApiClient);
  }

  // Menu Categories
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    const response = await this.get<MenuCategory[]>('/api/menu/categories', {
      params: { restaurant_id: restaurantId }
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu categories');
    }
    
    return response.data.data;
  }

  // Menu Items
  async getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    const response = await this.get<MenuItem[]>('/api/menu/items', {
      params: { 
        restaurant_id: restaurantId,
        category_id: categoryId,
        status: 'available'
      }
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu items');
    }
    
    return response.data.data;
  }

  async searchMenuItems(request: MenuItemSearchRequest): Promise<MenuItemsResponse> {
    const params: any = {
      restaurant_id: request.restaurant_id,
      q: request.query
    };
    
    if (request.category_id) params.category_id = request.category_id;
    if (request.available_only) params.status = 'available';
    
    const response = await this.get<MenuItemsResponse>('/api/menu/items/search', { params });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to search menu items');
    }
    
    return response.data.data;
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await this.get<MenuItem>(`/api/menu/items/${itemId}`);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu item');
    }
    
    return response.data.data;
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    const response = await this.get<MenuItem[]>('/api/menu/items/popular', {
      params: { 
        restaurant_id: restaurantId,
        limit
      }
    });
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get popular items');
    }
    
    return response.data.data;
  }
}