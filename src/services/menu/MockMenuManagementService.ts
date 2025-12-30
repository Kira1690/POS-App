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

  private mockCategories: CategoryWithStats[] = [
    {
      id: 'cat_1',
      restaurant_id: 'rest_001',
      name: 'Beverages',
      description: 'Hot and cold beverages',
      sort_order: 1,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T10:30:00Z',
      stats: {
        itemCount: 2, // Actual items: Fresh Coffee, Fresh Orange Juice
        todayRevenue: 0,
        avgPrice: 5.38,
        popularItems: ['Coffee', 'Fresh Juice'],
        lastUpdated: '2025-09-23T10:30:00Z',
      },
    },
    {
      id: 'cat_2',
      restaurant_id: 'rest_001',
      name: 'Chinese',
      description: 'Chinese cuisine specialties',
      sort_order: 2,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T09:15:00Z',
      stats: {
        itemCount: 1, // Actual items: Chicken Fried Rice
        todayRevenue: 0,
        avgPrice: 14.75,
        popularItems: ['Fried Rice'],
        lastUpdated: '2025-09-23T09:15:00Z',
      },
    },
    {
      id: 'cat_3',
      restaurant_id: 'rest_001',
      name: 'Non Veg',
      description: 'Non-vegetarian dishes',
      sort_order: 3,
      is_active: false,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-22T16:45:00Z',
      stats: {
        itemCount: 0, // No items yet
        todayRevenue: 0,
        avgPrice: 0,
        popularItems: [],
        lastUpdated: '2025-09-22T16:45:00Z',
      },
    },
    {
      id: 'cat_4',
      restaurant_id: 'rest_001',
      name: 'Vegetarian',
      description: 'Vegetarian specialties',
      sort_order: 4,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T11:20:00Z',
      stats: {
        itemCount: 0, // No items yet
        todayRevenue: 0,
        avgPrice: 0,
        popularItems: [],
        lastUpdated: '2025-09-23T11:20:00Z',
      },
    },
    {
      id: 'cat_5',
      restaurant_id: 'rest_001',
      name: 'Desserts',
      description: 'Sweet treats and desserts',
      sort_order: 5,
      is_active: true,
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T12:00:00Z',
      stats: {
        itemCount: 0, // No items yet
        todayRevenue: 0,
        avgPrice: 0,
        popularItems: [],
        lastUpdated: '2025-09-23T12:00:00Z',
      },
    },
  ];

  private mockMenuItems: MenuItemWithStats[] = [
    // Beverages
    {
      id: 'item_1',
      restaurant_id: 'rest_001',
      category_id: 'cat_1',
      name: 'Fresh Coffee',
      description: 'Premium arabica coffee beans',
      price: 4.50,
      image_url: 'https://example.com/coffee.jpg',
      is_available: true,
      preparation_time_minutes: 5,
      dietary_info: ['Vegan Option'],
      ingredients: ['Coffee Beans', 'Water', 'Optional Milk'],
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T10:30:00Z',
      stats: {
        todayOrders: 25,
        todayRevenue: 112.50,
        avgOrderTime: 5.2,
        customerRating: 4.7,
        lastOrdered: '2025-09-23T12:15:00Z',
      },
    },
    {
      id: 'item_2',
      restaurant_id: 'rest_001',
      category_id: 'cat_1',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 6.25,
      is_available: true,
      preparation_time_minutes: 3,
      dietary_info: ['Vegan', 'Gluten-Free'],
      ingredients: ['Fresh Oranges'],
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T10:30:00Z',
      stats: {
        todayOrders: 18,
        todayRevenue: 112.50,
        avgOrderTime: 3.1,
        customerRating: 4.9,
        lastOrdered: '2025-09-23T11:45:00Z',
      },
    },
    // Chinese
    {
      id: 'item_3',
      restaurant_id: 'rest_001',
      category_id: 'cat_2',
      name: 'Chicken Fried Rice',
      description: 'Wok-fried rice with chicken and vegetables',
      price: 14.75,
      is_available: true,
      preparation_time_minutes: 12,
      dietary_info: ['Contains Gluten'],
      ingredients: ['Rice', 'Chicken', 'Vegetables', 'Soy Sauce'],
      created_at: '2025-07-20T00:00:00Z',
      updated_at: '2025-09-23T09:15:00Z',
      stats: {
        todayOrders: 32,
        todayRevenue: 472.00,
        avgOrderTime: 11.8,
        customerRating: 4.6,
        lastOrdered: '2025-09-23T12:30:00Z',
      },
    },
  ];

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
    
    // Find top performer
    const topPerformer = categories.reduce((top, cat) => 
      cat.stats.todayRevenue > top.stats.todayRevenue ? cat : top
    );

    return {
      totalCategories: categories.length,
      activeCategories: activeCategories.length,
      inactiveCategories: inactiveCategories.length,
      totalItems,
      todayRevenue,
      topPerformer: topPerformer.name,
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
        if (operation.data?.price_adjustment) {
          operation.itemIds.forEach(itemId => {
            const item = this.mockMenuItems.find(i => i.id === itemId);
            if (item && operation.data) {
              if (operation.data.price_adjustment_type === 'percentage') {
                item.price = item.price * (1 + operation.data.price_adjustment / 100);
              } else {
                item.price += operation.data.price_adjustment;
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