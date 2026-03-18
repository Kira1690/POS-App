/**
 * Mock Menu Management Service
 * Provides realistic data for menu management UI development
 * TODO: Replace with real MenuManagementService when backend is ready
 */

import {
  CategoryWithStats,
  MenuItemWithStats,
  MenuManagementStats,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  BulkMenuOperation,
  MenuImportData,
} from '@/types/menu-management.types';

export class MockMenuManagementService {
  private static instance: MockMenuManagementService;
  
  public static getInstance(): MockMenuManagementService {
    if (!MockMenuManagementService.instance) {
      MockMenuManagementService.instance = new MockMenuManagementService();
    }
    return MockMenuManagementService.instance;
  }

  // Empty by default — tests create their own data (strict no-mock-data policy)
  private mockCategories: CategoryWithStats[] = [];

  // Empty by default — tests create their own data (strict no-mock-data policy)
  private mockMenuItems: MenuItemWithStats[] = [];

  /**
   * Get all categories with stats
   */
  async getCategories(restaurantId: string): Promise<CategoryWithStats[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockCategories.filter(cat => cat.restaurant_id === restaurantId);
  }

  /**
   * Get menu management stats
   */
  async getMenuStats(restaurantId: string): Promise<MenuManagementStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const categories = this.mockCategories.filter(cat => cat.restaurant_id === restaurantId);
    const activeCategories = categories.filter(cat => cat.is_active);
    const inactiveCategories = categories.filter(cat => !cat.is_active);
    
    const totalItems = categories.reduce((sum, cat) => sum + cat.stats.itemCount, 0);
    const todayRevenue = categories.reduce((sum, cat) => sum + cat.stats.todayRevenue, 0);
    
    // Find top performer (handle empty array)
    const topPerformer = categories.length > 0
      ? categories.reduce((top, cat) =>
          cat.stats.todayRevenue > top.stats.todayRevenue ? cat : top
        )
      : null;

    return {
      totalCategories: categories.length,
      activeCategories: activeCategories.length,
      inactiveCategories: inactiveCategories.length,
      totalItems,
      todayRevenue,
      topPerformer: topPerformer?.name || 'None',
    };
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<CategoryWithStats> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCategory: CategoryWithStats = {
      id: `cat_${Date.now()}`,
      restaurant_id: data.restaurant_id,
      name: data.name,
      description: data.description || '',
      sort_order: data.sort_order || this.mockCategories.length + 1,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        itemCount: 0,
        todayRevenue: 0,
        avgPrice: 0,
        popularItems: [],
        lastUpdated: new Date().toISOString(),
      },
    };

    this.mockCategories.push(newCategory);
    return newCategory;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryWithStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    const category = this.mockCategories[categoryIndex];
    this.mockCategories[categoryIndex] = {
      ...category,
      ...data,
      updated_at: new Date().toISOString(),
    };

    return this.mockCategories[categoryIndex];
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    this.mockCategories.splice(categoryIndex, 1);
  }

  /**
   * Toggle category status
   */
  async toggleCategoryStatus(id: string): Promise<CategoryWithStats> {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    this.mockCategories[categoryIndex].is_active = !this.mockCategories[categoryIndex].is_active;
    this.mockCategories[categoryIndex].updated_at = new Date().toISOString();

    return this.mockCategories[categoryIndex];
  }

  /**
   * Get menu items for category
   */
  async getMenuItems(categoryId?: string): Promise<MenuItemWithStats[]> {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    if (categoryId) {
      return this.mockMenuItems.filter(item => item.category_id === categoryId);
    }
    
    return this.mockMenuItems;
  }

  /**
   * Create menu item
   */
  async createMenuItem(data: CreateMenuItemRequest): Promise<MenuItemWithStats> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newItem: MenuItemWithStats = {
      id: `item_${Date.now()}`,
      restaurant_id: data.restaurant_id,
      category_id: data.category_id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      image_url: data.image_url,
      is_available: data.is_available !== undefined ? data.is_available : true,
      preparation_time_minutes: data.preparation_time_minutes,
      dietary_info: data.dietary_info || [],
      ingredients: data.ingredients || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        todayOrders: 0,
        todayRevenue: 0,
        avgOrderTime: data.preparation_time_minutes || 10,
        customerRating: 0,
        lastOrdered: '',
      },
    };

    this.mockMenuItems.push(newItem);

    // Update category stats
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === data.category_id);
    if (categoryIndex !== -1) {
      this.mockCategories[categoryIndex].stats.itemCount += 1;
      this.mockCategories[categoryIndex].updated_at = new Date().toISOString();
    }

    return newItem;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<MenuItemWithStats> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const itemIndex = this.mockMenuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Menu item not found');
    }

    const item = this.mockMenuItems[itemIndex];
    this.mockMenuItems[itemIndex] = {
      ...item,
      ...data,
      updated_at: new Date().toISOString(),
    };

    return this.mockMenuItems[itemIndex];
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const itemIndex = this.mockMenuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Menu item not found');
    }

    // Update category stats
    const item = this.mockMenuItems[itemIndex];
    const categoryIndex = this.mockCategories.findIndex(cat => cat.id === item.category_id);
    if (categoryIndex !== -1) {
      this.mockCategories[categoryIndex].stats.itemCount -= 1;
      this.mockCategories[categoryIndex].updated_at = new Date().toISOString();
    }

    this.mockMenuItems.splice(itemIndex, 1);
  }

  /**
   * Perform bulk operations
   */
  async performBulkOperation(operation: BulkMenuOperation): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    switch (operation.operation) {
      case 'enable':
        operation.itemIds.forEach(itemId => {
          const item = this.mockMenuItems.find(i => i.id === itemId);
          if (item) item.is_available = true;
        });
        break;
        
      case 'disable':
        operation.itemIds.forEach(itemId => {
          const item = this.mockMenuItems.find(i => i.id === itemId);
          if (item) item.is_available = false;
        });
        break;
        
      case 'delete':
        this.mockMenuItems = this.mockMenuItems.filter(
          item => !operation.itemIds.includes(item.id)
        );
        break;
        
      case 'update_price':
        if (operation.data?.price_adjustment !== undefined) {
          const priceAdjustment = operation.data.price_adjustment;
          const adjustmentType = operation.data.price_adjustment_type;
          operation.itemIds.forEach(itemId => {
            const item = this.mockMenuItems.find(i => i.id === itemId);
            if (item) {
              if (adjustmentType === 'percentage') {
                item.price = item.price * (1 + priceAdjustment / 100);
              } else {
                item.price += priceAdjustment;
              }
            }
          });
        }
        break;
    }
  }

  /**
   * Search categories
   */
  async searchCategories(
    restaurantId: string,
    query: string,
    filters: { activeOnly?: boolean } = {}
  ): Promise<CategoryWithStats[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let categories = this.mockCategories.filter(cat => cat.restaurant_id === restaurantId);
    
    if (query) {
      categories = categories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase()) ||
        cat.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (filters.activeOnly) {
      categories = categories.filter(cat => cat.is_active);
    }
    
    return categories;
  }
}