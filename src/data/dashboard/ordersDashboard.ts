/**
 * Orders Dashboard Mock Data
 * Comprehensive data for Orders Dashboard according to wireframes
 */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number; // minutes
  urgencyLevel: 'normal' | 'urgent' | 'priority';
  serverName?: string;
  notes?: string;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  completionRate: number;
  ordersByType: {
    dineIn: number;
    takeaway: number;
    delivery: number;
  };
  ordersByStatus: {
    pending: number;
    preparing: number;
    ready: number;
    served: number;
    cancelled: number;
  };
}

export interface OrderFilters {
  status: string[];
  orderType: string[];
  dateRange: {
    start: string;
    end: string;
  };
  searchQuery: string;
}

export interface OrdersDashboardData {
  orders: DashboardOrder[];
  analytics: OrderAnalytics;
  filters: OrderFilters;
  lastUpdated: string;
}

// Mock orders data
export const MOCK_ORDERS: DashboardOrder[] = [
  {
    id: 'ord_001',
    orderNumber: 'ORD-2024-001',
    status: 'preparing',
    orderType: 'dine-in',
    tableNumber: 'Table 12',
    customer: {
      id: 'cust_001',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
    },
    items: [
      { id: 'item_001', name: 'Grilled Salmon', quantity: 1, price: 24.99 },
      { id: 'item_002', name: 'Caesar Salad', quantity: 1, price: 12.99 },
      { id: 'item_003', name: 'Garlic Bread', quantity: 2, price: 5.99 },
    ],
    totalAmount: 49.97,
    createdAt: '2024-09-28T14:45:00Z',
    updatedAt: '2024-09-28T14:50:00Z',
    estimatedTime: 25,
    urgencyLevel: 'normal',
    serverName: 'Alice Johnson',
    notes: 'Customer requested well-done salmon',
  },
  {
    id: 'ord_002',
    orderNumber: 'ORD-2024-002',
    status: 'ready',
    orderType: 'takeaway',
    customer: {
      id: 'cust_002',
      name: 'Maria Garcia',
      phone: '+1 (555) 234-5678',
    },
    items: [
      { id: 'item_004', name: 'Chicken Teriyaki Bowl', quantity: 1, price: 15.99 },
      { id: 'item_005', name: 'Miso Soup', quantity: 1, price: 4.99 },
    ],
    totalAmount: 20.98,
    createdAt: '2024-09-28T14:40:00Z',
    updatedAt: '2024-09-28T15:10:00Z',
    estimatedTime: 15,
    urgencyLevel: 'normal',
    serverName: 'Bob Wilson',
  },
  {
    id: 'ord_003',
    orderNumber: 'ORD-2024-003',
    status: 'pending',
    orderType: 'dine-in',
    tableNumber: 'Table 8',
    customer: {
      id: 'cust_003',
      name: 'David Johnson',
      phone: '+1 (555) 345-6789',
    },
    items: [
      { id: 'item_006', name: 'Beef Ribeye', quantity: 1, price: 34.99 },
      { id: 'item_007', name: 'Roasted Vegetables', quantity: 1, price: 8.99 },
      { id: 'item_008', name: 'Red Wine Glass', quantity: 1, price: 12.99 },
    ],
    totalAmount: 56.97,
    createdAt: '2024-09-28T14:35:00Z',
    updatedAt: '2024-09-28T14:35:00Z',
    estimatedTime: 35,
    urgencyLevel: 'urgent',
    serverName: 'Carol Davis',
    notes: 'VIP customer, priority service',
  },
  {
    id: 'ord_004',
    orderNumber: 'ORD-2024-004',
    status: 'preparing',
    orderType: 'delivery',
    customer: {
      id: 'cust_004',
      name: 'Sarah Wilson',
      phone: '+1 (555) 456-7890',
      email: 'sarah.wilson@email.com',
    },
    items: [
      { id: 'item_009', name: 'Margherita Pizza', quantity: 1, price: 18.99 },
      { id: 'item_010', name: 'Caesar Salad', quantity: 1, price: 12.99 },
      { id: 'item_011', name: 'Tiramisu', quantity: 1, price: 7.99 },
    ],
    totalAmount: 39.97,
    createdAt: '2024-09-28T14:30:00Z',
    updatedAt: '2024-09-28T14:45:00Z',
    estimatedTime: 45,
    urgencyLevel: 'normal',
    serverName: 'Eve Thompson',
  },
  {
    id: 'ord_005',
    orderNumber: 'ORD-2024-005',
    status: 'served',
    orderType: 'dine-in',
    tableNumber: 'Table 15',
    customer: {
      id: 'cust_005',
      name: 'Robert Brown',
      phone: '+1 (555) 567-8901',
    },
    items: [
      { id: 'item_012', name: 'Surf & Turf', quantity: 1, price: 45.99 },
      { id: 'item_013', name: 'Lobster Bisque', quantity: 1, price: 12.99 },
      { id: 'item_014', name: 'Chocolate Cake', quantity: 1, price: 8.99 },
    ],
    totalAmount: 67.97,
    createdAt: '2024-09-28T13:25:00Z',
    updatedAt: '2024-09-28T14:20:00Z',
    estimatedTime: 40,
    urgencyLevel: 'normal',
    serverName: 'Alice Johnson',
  },
  {
    id: 'ord_006',
    orderNumber: 'ORD-2024-006',
    status: 'pending',
    orderType: 'takeaway',
    customer: {
      id: 'cust_006',
      name: 'Lisa Anderson',
      phone: '+1 (555) 678-9012',
    },
    items: [
      { id: 'item_015', name: 'Fish Tacos', quantity: 3, price: 4.99 },
      { id: 'item_016', name: 'Guacamole', quantity: 1, price: 5.99 },
    ],
    totalAmount: 20.96,
    createdAt: '2024-09-28T15:15:00Z',
    updatedAt: '2024-09-28T15:15:00Z',
    estimatedTime: 20,
    urgencyLevel: 'priority',
    serverName: 'Frank Miller',
  },
];

// Mock analytics data
export const MOCK_ORDER_ANALYTICS: OrderAnalytics = {
  totalOrders: 47,
  totalRevenue: 1809.50,
  avgOrderValue: 38.50,
  completionRate: 94.2,
  ordersByType: {
    dineIn: 28,
    takeaway: 12,
    delivery: 7,
  },
  ordersByStatus: {
    pending: 8,
    preparing: 15,
    ready: 6,
    served: 16,
    cancelled: 2,
  },
};

// Complete dashboard data
export const ORDERS_DASHBOARD_DATA: OrdersDashboardData = {
  orders: MOCK_ORDERS,
  analytics: MOCK_ORDER_ANALYTICS,
  filters: {
    status: [],
    orderType: [],
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    searchQuery: '',
  },
  lastUpdated: new Date().toISOString(),
};

// Utility functions
export const getOrdersByStatus = (status: string) => {
  return MOCK_ORDERS.filter(order => order.status === status);
};

export const getOrdersByType = (type: string) => {
  return MOCK_ORDERS.filter(order => order.orderType === type);
};

export const getUrgentOrders = () => {
  return MOCK_ORDERS.filter(order => order.urgencyLevel === 'urgent' || order.urgencyLevel === 'priority');
};

export const getOrderCompletionRate = () => {
  const totalOrders = MOCK_ORDERS.length;
  const completedOrders = MOCK_ORDERS.filter(order => order.status === 'served').length;
  return totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
};

export default ORDERS_DASHBOARD_DATA;