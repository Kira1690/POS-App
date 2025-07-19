import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/constants';
import { MenuItem, MenuCategory, PaginatedResponse } from '@/types';

export class MenuService {
  async getMenuItems(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    restaurantId?: string;
    available?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<MenuItem>> {
    const response = await apiClient.get<MenuItem[]>(
      API_ENDPOINTS.MENU.ITEMS,
      { params }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get menu items');
    }
    
    return response.data as PaginatedResponse<MenuItem>;
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(
      `${API_ENDPOINTS.MENU.ITEMS}/${itemId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu item');
    }
    
    return response.data.data;
  }

  async getMenuCategories(restaurantId?: string): Promise<MenuCategory[]> {
    const response = await apiClient.get<MenuCategory[]>(
      API_ENDPOINTS.MENU.CATEGORIES,
      { params: { restaurantId } }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get menu categories');
    }
    
    return response.data.data;
  }

  async getCategory(categoryId: string): Promise<MenuCategory> {
    const response = await apiClient.get<MenuCategory>(
      `${API_ENDPOINTS.MENU.CATEGORIES}/${categoryId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get category');
    }
    
    return response.data.data;
  }

  async searchMenuItems(query: string, restaurantId?: string): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>(
      API_ENDPOINTS.MENU.SEARCH,
      { 
        params: { 
          q: query, 
          restaurantId 
        } 
      }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to search menu items');
    }
    
    return response.data.data;
  }

  async createMenuItem(itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const response = await apiClient.post<MenuItem>(
      API_ENDPOINTS.MENU.ITEMS,
      itemData
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create menu item');
    }
    
    return response.data.data;
  }

  async updateMenuItem(
    itemId: string, 
    updates: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<MenuItem> {
    const response = await apiClient.patch<MenuItem>(
      `${API_ENDPOINTS.MENU.ITEMS}/${itemId}`,
      updates
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update menu item');
    }
    
    return response.data.data;
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.MENU.ITEMS}/${itemId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete menu item');
    }
  }

  async createCategory(categoryData: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    const response = await apiClient.post<MenuCategory>(
      API_ENDPOINTS.MENU.CATEGORIES,
      categoryData
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create category');
    }
    
    return response.data.data;
  }

  async updateCategory(
    categoryId: string, 
    updates: Partial<Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<MenuCategory> {
    const response = await apiClient.patch<MenuCategory>(
      `${API_ENDPOINTS.MENU.CATEGORIES}/${categoryId}`,
      updates
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update category');
    }
    
    return response.data.data;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.MENU.CATEGORIES}/${categoryId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete category');
    }
  }

  async updateItemAvailability(itemId: string, available: boolean): Promise<MenuItem> {
    const response = await apiClient.patch<MenuItem>(
      `${API_ENDPOINTS.MENU.ITEMS}/${itemId}/availability`,
      { is_available: available }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update item availability');
    }
    
    return response.data.data;
  }

  async bulkUpdateAvailability(items: { id: string; available: boolean }[]): Promise<void> {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.MENU.ITEMS}/bulk-availability`,
      { items }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to bulk update availability');
    }
  }
}

export const menuService = new MenuService();