import {
  OnlineOrder,
  OnlineOrderStats,
  PlatformStatus,
  OrderFilters,
  AutoAcceptSettings,
  OnlineOrderService,
  DeliveryPlatform,
  OrderStatus,
} from '@/types/online-orders.types';

export class MockOnlineOrderService implements OnlineOrderService {
  private static instance: MockOnlineOrderService;
  private orders: OnlineOrder[] = [];
  private platformStatuses: PlatformStatus[] = [];
  private autoAcceptSettings: AutoAcceptSettings;

  private constructor() {
    this.initializeMockData();
    this.autoAcceptSettings = {
      enabled: true,
      platforms: ['ubereats', 'doordash'],
      max_prep_time: 30,
      minimum_order_value: 10,
    };
  }

  static getInstance(): MockOnlineOrderService {
    if (!MockOnlineOrderService.instance) {
      MockOnlineOrderService.instance = new MockOnlineOrderService();
    }
    return MockOnlineOrderService.instance;
  }

  private initializeMockData(): void {
    this.orders = [
      {
        id: 'order_001',
        platform_order_id: 'UE-2024-0892',
        platform: 'ubereats',
        status: 'new',
        type: 'delivery',
        customer: {
          name: 'Sarah Johnson',
          phone: '+1 (555) 123-4567',
          email: 'sarah.j@email.com',
          delivery_address: '123 Oak Street, Apt 4B, New York, NY 10001',
        },
        items: [
          { id: 'item_1', name: 'Orange Juice', quantity: 2, price: 3.50 },
          { id: 'item_2', name: 'Chicken Burger', quantity: 1, price: 11.50 },
        ],
        subtotal: 18.50,
        tax: 1.85,
        delivery_fee: 3.99,
        platform_fee: 2.50,
        total: 26.84,
        estimated_prep_time: 25,
        estimated_delivery_time: 35,
        special_instructions: 'Leave at door, ring bell',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        progress_percentage: 0,
      },
      {
        id: 'order_002',
        platform_order_id: 'DD-789456',
        platform: 'doordash',
        status: 'preparing',
        type: 'pickup',
        customer: {
          name: 'Mike Chen',
          phone: '+1 (555) 987-6543',
          email: 'mike.chen@email.com',
        },
        items: [
          { id: 'item_3', name: 'Fried Rice', quantity: 1, price: 12.99 },
          { id: 'item_4', name: 'Spring Rolls', quantity: 2, price: 4.99 },
        ],
        subtotal: 22.97,
        tax: 2.30,
        delivery_fee: 0,
        platform_fee: 1.50,
        total: 26.77,
        estimated_prep_time: 20,
        special_instructions: 'Extra spicy please',
        created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 minutes ago
        accepted_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        progress_percentage: 60,
      },
      {
        id: 'order_003',
        platform_order_id: 'GH-445821',
        platform: 'grubhub',
        status: 'ready',
        type: 'delivery',
        customer: {
          name: 'Lisa Martinez',
          phone: '+1 (555) 246-8135',
          delivery_address: '456 Pine Avenue, Brooklyn, NY 11201',
        },
        items: [
          { id: 'item_5', name: 'Pizza Margherita', quantity: 1, price: 16.99 },
        ],
        subtotal: 16.99,
        tax: 1.70,
        delivery_fee: 2.99,
        platform_fee: 1.50,
        total: 23.18,
        estimated_prep_time: 15,
        estimated_delivery_time: 25,
        created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 minutes ago
        accepted_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        ready_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        progress_percentage: 100,
      },
      {
        id: 'order_004',
        platform_order_id: 'UE-2024-0893',
        platform: 'ubereats',
        status: 'accepted',
        type: 'delivery',
        customer: {
          name: 'John Davis',
          phone: '+1 (555) 159-7531',
          delivery_address: '789 Elm Street, Manhattan, NY 10002',
        },
        items: [
          { id: 'item_6', name: 'Caesar Salad', quantity: 1, price: 9.99 },
          { id: 'item_7', name: 'Grilled Chicken', quantity: 1, price: 15.99 },
        ],
        subtotal: 25.98,
        tax: 2.60,
        delivery_fee: 3.99,
        platform_fee: 2.50,
        total: 35.07,
        estimated_prep_time: 30,
        estimated_delivery_time: 40,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        accepted_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        progress_percentage: 15,
      },
    ];

    this.platformStatuses = [
      {
        platform: 'ubereats',
        connected: true,
        status: 'online',
        last_order_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        daily_orders: 42,
        daily_revenue: 1247.83,
      },
      {
        platform: 'doordash',
        connected: true,
        status: 'online',
        last_order_time: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        daily_orders: 38,
        daily_revenue: 1098.45,
      },
      {
        platform: 'grubhub',
        connected: true,
        status: 'paused',
        last_order_time: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        daily_orders: 24,
        daily_revenue: 567.22,
      },
      {
        platform: 'postmates',
        connected: false,
        status: 'offline',
        daily_orders: 0,
        daily_revenue: 0,
      },
    ];
  }

  async getOrders(filters?: Partial<OrderFilters>): Promise<OnlineOrder[]> {
    await this.simulateDelay();
    
    let filteredOrders = [...this.orders];

    if (filters?.platform && filters.platform !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.platform === filters.platform);
    }

    if (filters?.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    if (filters?.search_query) {
      const query = filters.search_query.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.platform_order_id.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    if (filters?.time_range && filters.time_range !== 'all') {
      const now = Date.now();
      const timeThresholds = {
        'last_hour': 60 * 60 * 1000,
        'last_2_hours': 2 * 60 * 60 * 1000,
        'today': 24 * 60 * 60 * 1000,
      };
      
      const threshold = timeThresholds[filters.time_range];
      if (threshold) {
        filteredOrders = filteredOrders.filter(order => 
          now - new Date(order.created_at).getTime() <= threshold
        );
      }
    }

    return filteredOrders.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getOrderStats(): Promise<OnlineOrderStats> {
    await this.simulateDelay();
    
    const activeOrders = this.orders.filter(o => 
      ['new', 'accepted', 'preparing'].includes(o.status)
    ).length;
    
    const readyForPickup = this.orders.filter(o => o.status === 'ready').length;
    
    const outForDelivery = this.orders.filter(o => 
      o.status === 'picked_up' || (o.status === 'ready' && o.type === 'delivery')
    ).length;

    const todaysRevenue = this.platformStatuses.reduce((sum, platform) => 
      sum + platform.daily_revenue, 0
    );

    const ordersByPlatform = this.orders.reduce((acc, order) => {
      acc[order.platform] = (acc[order.platform] || 0) + 1;
      return acc;
    }, {} as Record<DeliveryPlatform, number>);

    return {
      active_orders: activeOrders,
      ready_for_pickup: readyForPickup,
      out_for_delivery: outForDelivery,
      todays_revenue: todaysRevenue,
      orders_by_platform: ordersByPlatform,
    };
  }

  async getPlatformStatuses(): Promise<PlatformStatus[]> {
    await this.simulateDelay();
    return [...this.platformStatuses];
  }

  async acceptOrder(orderId: string): Promise<void> {
    await this.simulateDelay();
    
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'new') {
      order.status = 'accepted';
      order.accepted_at = new Date().toISOString();
      order.progress_percentage = 10;
    }
  }

  async rejectOrder(orderId: string, reason?: string): Promise<void> {
    await this.simulateDelay();
    
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1 && this.orders[orderIndex].status === 'new') {
      this.orders[orderIndex].status = 'cancelled';
      console.log(`Order ${orderId} rejected. Reason: ${reason || 'No reason provided'}`);
    }
  }

  async markOrderReady(orderId: string): Promise<void> {
    await this.simulateDelay();
    
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'preparing') {
      order.status = 'ready';
      order.ready_at = new Date().toISOString();
      order.progress_percentage = 100;
    }
  }

  async markOrderPickedUp(orderId: string): Promise<void> {
    await this.simulateDelay();
    
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.status === 'ready') {
      order.status = 'picked_up';
      order.picked_up_at = new Date().toISOString();
    }
  }

  async updateOrderProgress(orderId: string, percentage: number): Promise<void> {
    await this.simulateDelay();
    
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.progress_percentage = Math.max(0, Math.min(100, percentage));
      
      if (percentage >= 100 && order.status === 'preparing') {
        order.status = 'ready';
        order.ready_at = new Date().toISOString();
      }
    }
  }

  async pauseNewOrders(platforms?: DeliveryPlatform[]): Promise<void> {
    await this.simulateDelay();
    
    const targetPlatforms = platforms || ['ubereats', 'doordash', 'grubhub', 'postmates'];
    
    this.platformStatuses.forEach(status => {
      if (targetPlatforms.includes(status.platform) && status.connected) {
        status.status = 'paused';
      }
    });
  }

  async resumeNewOrders(platforms?: DeliveryPlatform[]): Promise<void> {
    await this.simulateDelay();
    
    const targetPlatforms = platforms || ['ubereats', 'doordash', 'grubhub', 'postmates'];
    
    this.platformStatuses.forEach(status => {
      if (targetPlatforms.includes(status.platform) && status.connected) {
        status.status = 'online';
      }
    });
  }

  async syncMenuItems(platforms?: DeliveryPlatform[]): Promise<void> {
    await this.simulateDelay();
    console.log('Syncing menu items with platforms:', platforms || 'all');
  }

  async bulkAcceptOrders(orderIds: string[]): Promise<void> {
    await this.simulateDelay();
    
    for (const orderId of orderIds) {
      await this.acceptOrder(orderId);
    }
  }

  async getAutoAcceptSettings(): Promise<AutoAcceptSettings> {
    await this.simulateDelay();
    return { ...this.autoAcceptSettings };
  }

  async updateAutoAcceptSettings(settings: AutoAcceptSettings): Promise<void> {
    await this.simulateDelay();
    this.autoAcceptSettings = { ...settings };
  }

  // Helper method to generate new mock order (for testing real-time updates)
  generateMockOrder(): OnlineOrder {
    const platforms: DeliveryPlatform[] = ['ubereats', 'doordash', 'grubhub'];
    const customers = ['John Smith', 'Emma Wilson', 'David Brown', 'Sarah Davis'];
    const items = [
      { name: 'Chicken Sandwich', price: 12.99 },
      { name: 'Beef Burger', price: 14.50 },
      { name: 'Caesar Salad', price: 9.99 },
      { name: 'Fish Tacos', price: 13.75 },
    ];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;

    return {
      id: `order_${Date.now()}`,
      platform_order_id: `${platform.toUpperCase()}-${Math.floor(Math.random() * 999999)}`,
      platform,
      status: 'new',
      type: Math.random() > 0.3 ? 'delivery' : 'pickup',
      customer: {
        name: customer,
        phone: '+1 (555) 123-4567',
        delivery_address: '123 Test Street, Test City, TS 12345',
      },
      items: [{
        id: `item_${Date.now()}`,
        name: item.name,
        quantity,
        price: item.price,
      }],
      subtotal: item.price * quantity,
      tax: (item.price * quantity) * 0.1,
      delivery_fee: 3.99,
      platform_fee: 2.50,
      total: (item.price * quantity) * 1.1 + 6.49,
      estimated_prep_time: Math.floor(Math.random() * 20) + 15,
      estimated_delivery_time: Math.floor(Math.random() * 15) + 25,
      created_at: new Date().toISOString(),
      progress_percentage: 0,
    };
  }

  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}