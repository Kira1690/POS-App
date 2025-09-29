/**
 * Kitchen Staff Dashboard Mock Data
 * Comprehensive data for Kitchen Dashboard according to wireframes
 */

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
  preparationTime: number; // minutes
  category: 'appetizer' | 'main' | 'side' | 'dessert' | 'beverage';
  allergens?: string[];
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customerName: string;
  items: KitchenOrderItem[];
  totalItems: number;
  estimatedTime: number; // minutes
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'ready' | 'served';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  serverName: string;
  specialNotes?: string;
  timeElapsed: number; // minutes since order received
  isOverdue: boolean;
}

export interface KitchenStats {
  activeOrders: number;
  pendingOrders: number;
  completedToday: number;
  averageTime: number; // minutes
  efficiency: number; // percentage
  overdueOrders: number;
}

export interface KitchenStation {
  id: string;
  name: string;
  chef: string;
  status: 'active' | 'busy' | 'break' | 'offline';
  currentOrders: string[]; // order IDs
  specialty: string[];
  efficiency: number; // percentage
}

export interface KitchenDashboardData {
  orders: KitchenOrder[];
  stats: KitchenStats;
  stations: KitchenStation[];
  lastUpdated: string;
}

// Mock kitchen orders
export const MOCK_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: 'kitchen_ord_001',
    orderNumber: 'ORD-2024-001',
    tableNumber: 'Table 12',
    orderType: 'dine-in',
    customerName: 'John Smith',
    items: [
      {
        id: 'item_001',
        name: 'Grilled Salmon',
        quantity: 1,
        specialInstructions: 'Well-done, no lemon',
        preparationTime: 15,
        category: 'main',
        allergens: ['fish'],
        priority: 'normal',
        status: 'preparing',
      },
      {
        id: 'item_002',
        name: 'Caesar Salad',
        quantity: 1,
        preparationTime: 5,
        category: 'side',
        allergens: ['dairy', 'eggs'],
        priority: 'normal',
        status: 'ready',
      },
      {
        id: 'item_003',
        name: 'Garlic Bread',
        quantity: 2,
        preparationTime: 8,
        category: 'side',
        allergens: ['gluten'],
        priority: 'normal',
        status: 'ready',
      },
    ],
    totalItems: 4,
    estimatedTime: 18,
    priority: 'normal',
    status: 'preparing',
    createdAt: '2024-09-28T14:45:00Z',
    startedAt: '2024-09-28T14:47:00Z',
    serverName: 'Alice Johnson',
    specialNotes: 'Customer has fish allergy - please be careful with preparation',
    timeElapsed: 25,
    isOverdue: true,
  },
  {
    id: 'kitchen_ord_002',
    orderNumber: 'ORD-2024-002',
    orderType: 'takeaway',
    customerName: 'Maria Garcia',
    items: [
      {
        id: 'item_004',
        name: 'Chicken Teriyaki Bowl',
        quantity: 1,
        specialInstructions: 'Extra sauce',
        preparationTime: 12,
        category: 'main',
        priority: 'normal',
        status: 'ready',
      },
      {
        id: 'item_005',
        name: 'Miso Soup',
        quantity: 1,
        preparationTime: 3,
        category: 'appetizer',
        allergens: ['soy'],
        priority: 'normal',
        status: 'ready',
      },
    ],
    totalItems: 2,
    estimatedTime: 12,
    priority: 'normal',
    status: 'ready',
    createdAt: '2024-09-28T14:40:00Z',
    startedAt: '2024-09-28T14:42:00Z',
    completedAt: '2024-09-28T14:54:00Z',
    serverName: 'Bob Wilson',
    timeElapsed: 32,
    isOverdue: false,
  },
  {
    id: 'kitchen_ord_003',
    orderNumber: 'ORD-2024-003',
    tableNumber: 'Table 8',
    orderType: 'dine-in',
    customerName: 'David Johnson',
    items: [
      {
        id: 'item_006',
        name: 'Beef Ribeye',
        quantity: 1,
        specialInstructions: 'Medium-rare',
        preparationTime: 20,
        category: 'main',
        priority: 'high',
        status: 'pending',
      },
      {
        id: 'item_007',
        name: 'Roasted Vegetables',
        quantity: 1,
        preparationTime: 15,
        category: 'side',
        priority: 'high',
        status: 'pending',
      },
    ],
    totalItems: 2,
    estimatedTime: 25,
    priority: 'high',
    status: 'pending',
    createdAt: '2024-09-28T14:35:00Z',
    serverName: 'Carol Davis',
    specialNotes: 'VIP customer - priority service',
    timeElapsed: 37,
    isOverdue: true,
  },
  {
    id: 'kitchen_ord_004',
    orderNumber: 'ORD-2024-004',
    orderType: 'delivery',
    customerName: 'Sarah Wilson',
    items: [
      {
        id: 'item_009',
        name: 'Margherita Pizza',
        quantity: 1,
        preparationTime: 18,
        category: 'main',
        allergens: ['gluten', 'dairy'],
        priority: 'normal',
        status: 'preparing',
      },
      {
        id: 'item_010',
        name: 'Caesar Salad',
        quantity: 1,
        preparationTime: 5,
        category: 'side',
        allergens: ['dairy', 'eggs'],
        priority: 'normal',
        status: 'ready',
      },
      {
        id: 'item_011',
        name: 'Tiramisu',
        quantity: 1,
        preparationTime: 2,
        category: 'dessert',
        allergens: ['dairy', 'eggs'],
        priority: 'normal',
        status: 'pending',
      },
    ],
    totalItems: 3,
    estimatedTime: 20,
    priority: 'normal',
    status: 'preparing',
    createdAt: '2024-09-28T14:30:00Z',
    startedAt: '2024-09-28T14:32:00Z',
    serverName: 'Eve Thompson',
    timeElapsed: 42,
    isOverdue: true,
  },
  {
    id: 'kitchen_ord_005',
    orderNumber: 'ORD-2024-005',
    tableNumber: 'Table 6',
    orderType: 'dine-in',
    customerName: 'Lisa Anderson',
    items: [
      {
        id: 'item_015',
        name: 'Fish Tacos',
        quantity: 3,
        specialInstructions: 'Spicy sauce',
        preparationTime: 12,
        category: 'main',
        allergens: ['fish', 'gluten'],
        priority: 'urgent',
        status: 'pending',
      },
      {
        id: 'item_016',
        name: 'Guacamole',
        quantity: 1,
        preparationTime: 3,
        category: 'appetizer',
        priority: 'urgent',
        status: 'pending',
      },
    ],
    totalItems: 4,
    estimatedTime: 15,
    priority: 'urgent',
    status: 'pending',
    createdAt: '2024-09-28T15:15:00Z',
    serverName: 'Frank Miller',
    specialNotes: 'Customer complained about wait time - urgent',
    timeElapsed: 2,
    isOverdue: false,
  },
];

// Mock kitchen stats
export const MOCK_KITCHEN_STATS: KitchenStats = {
  activeOrders: 5,
  pendingOrders: 3,
  completedToday: 42,
  averageTime: 18.5,
  efficiency: 87.2,
  overdueOrders: 3,
};

// Mock kitchen stations
export const MOCK_KITCHEN_STATIONS: KitchenStation[] = [
  {
    id: 'station_grill',
    name: 'Grill Station',
    chef: 'Chef Mike Wilson',
    status: 'busy',
    currentOrders: ['kitchen_ord_001', 'kitchen_ord_003'],
    specialty: ['steaks', 'salmon', 'grilled items'],
    efficiency: 92.5,
  },
  {
    id: 'station_saute',
    name: 'Sauté Station',
    chef: 'Chef Sarah Chen',
    status: 'active',
    currentOrders: ['kitchen_ord_004'],
    specialty: ['pasta', 'sauces', 'vegetables'],
    efficiency: 88.7,
  },
  {
    id: 'station_cold',
    name: 'Cold Station',
    chef: 'Chef David Park',
    status: 'active',
    currentOrders: ['kitchen_ord_005'],
    specialty: ['salads', 'cold appetizers', 'desserts'],
    efficiency: 94.2,
  },
  {
    id: 'station_pizza',
    name: 'Pizza Station',
    chef: 'Chef Tony Romano',
    status: 'busy',
    currentOrders: ['kitchen_ord_004'],
    specialty: ['pizzas', 'bread', 'baked items'],
    efficiency: 85.3,
  },
  {
    id: 'station_fry',
    name: 'Fry Station',
    chef: 'Chef Kim Lee',
    status: 'break',
    currentOrders: [],
    specialty: ['fried items', 'sides', 'appetizers'],
    efficiency: 91.8,
  },
];

// Complete dashboard data
export const KITCHEN_STAFF_DASHBOARD_DATA: KitchenDashboardData = {
  orders: MOCK_KITCHEN_ORDERS,
  stats: MOCK_KITCHEN_STATS,
  stations: MOCK_KITCHEN_STATIONS,
  lastUpdated: new Date().toISOString(),
};

// Utility functions
export const getOrdersByStatus = (status: KitchenOrder['status']): KitchenOrder[] => {
  return MOCK_KITCHEN_ORDERS.filter(order => order.status === status);
};

export const getOrdersByPriority = (priority: KitchenOrder['priority']): KitchenOrder[] => {
  return MOCK_KITCHEN_ORDERS.filter(order => order.priority === priority);
};

export const getOverdueOrders = (): KitchenOrder[] => {
  return MOCK_KITCHEN_ORDERS.filter(order => order.isOverdue);
};

export const getUrgentOrders = (): KitchenOrder[] => {
  return getOrdersByPriority('urgent');
};

export const getActiveStations = (): KitchenStation[] => {
  return MOCK_KITCHEN_STATIONS.filter(station => station.status === 'active' || station.status === 'busy');
};

export const getStationByChef = (chefName: string): KitchenStation | undefined => {
  return MOCK_KITCHEN_STATIONS.find(station => station.chef === chefName);
};

export const getOrderById = (orderId: string): KitchenOrder | undefined => {
  return MOCK_KITCHEN_ORDERS.find(order => order.id === orderId);
};

export const getAveragePreparationTime = (): number => {
  const completedOrders = MOCK_KITCHEN_ORDERS.filter(order => order.completedAt);
  if (completedOrders.length === 0) return 0;

  const totalTime = completedOrders.reduce((sum, order) => {
    const startTime = new Date(order.startedAt!).getTime();
    const endTime = new Date(order.completedAt!).getTime();
    return sum + (endTime - startTime) / (1000 * 60); // Convert to minutes
  }, 0);

  return totalTime / completedOrders.length;
};

export const getStationEfficiency = (stationId: string): number => {
  const station = MOCK_KITCHEN_STATIONS.find(s => s.id === stationId);
  return station?.efficiency || 0;
};

export const sortOrdersByPriority = (orders: KitchenOrder[]): KitchenOrder[] => {
  const priorityOrder = { urgent: 3, high: 2, normal: 1 };
  return orders.sort((a, b) => {
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    return bPriority - aPriority;
  });
};

export const getNextOrderInQueue = (): KitchenOrder | undefined => {
  const pendingOrders = getOrdersByStatus('pending');
  const sortedOrders = sortOrdersByPriority(pendingOrders);
  return sortedOrders[0];
};

export default KITCHEN_STAFF_DASHBOARD_DATA;