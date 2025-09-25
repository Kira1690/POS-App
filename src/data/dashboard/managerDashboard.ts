/**
 * Manager Dashboard Mock Data
 * Comprehensive data for Manager Dashboard (2.1 Visual Dashboard Overview)
 */

export interface DashboardStats {
  todaysSales: {
    value: string;
    change: string;
    trend: 'up' | 'down';
    previousValue: string;
    percentageChange: number;
  };
  activeOrders: {
    value: string;
    breakdown: string;
    dineIn: number;
    takeaway: number;
    delivery: number;
    total: number;
  };
  tableOccupancy: {
    value: string;
    percentage: string;
    occupied: number;
    total: number;
    occupancyRate: number;
  };
  staffOnDuty: {
    value: string;
    breakdown: string;
    servers: number;
    kitchen: number;
    managers: number;
    total: number;
  };
}

export interface RecentOrder {
  id: number;
  table: string;
  amount: string;
  status: 'Preparing' | 'Ready' | 'Pending' | 'Served' | 'Cancelled';
  statusColor: string;
  time: string;
  items: string[];
  customerId?: string;
  customerName?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
}

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
  route?: string;
  onPress?: () => void;
}

export interface SalesChartData {
  day: string;
  sales: number;
  orders: number;
}

export interface ManagerDashboardData {
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  currentDate: string;
  currentTime: string;
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  salesChartData: SalesChartData[];
  quickActions: QuickAction[];
  notifications: number;
  weatherInfo?: {
    temperature: string;
    condition: string;
    emoji: string;
  };
  dailyGoals: {
    salesGoal: number;
    currentSales: number;
    ordersGoal: number;
    currentOrders: number;
  };
}

// Sample data for manager dashboard
export const MANAGER_DASHBOARD_DATA: ManagerDashboardData = {
  restaurant: {
    id: 'rest_001',
    name: 'The Food Corner',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
  },
  currentDate: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }),
  currentTime: new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }),
  stats: {
    todaysSales: {
      value: '$2,847.50',
      change: '+12.5%',
      trend: 'up',
      previousValue: '$2,530.00',
      percentageChange: 12.5,
    },
    activeOrders: {
      value: '23',
      breakdown: '12 Dine-in | 8 Takeaway | 3 Delivery',
      dineIn: 12,
      takeaway: 8,
      delivery: 3,
      total: 23,
    },
    tableOccupancy: {
      value: '16/25',
      percentage: '64% occupancy rate',
      occupied: 16,
      total: 25,
      occupancyRate: 64,
    },
    staffOnDuty: {
      value: '8',
      breakdown: '5 Servers | 2 Kitchen | 1 Manager',
      servers: 5,
      kitchen: 2,
      managers: 1,
      total: 8,
    },
  },
  recentOrders: [
    {
      id: 1,
      table: 'Table 12',
      amount: '$45.50',
      status: 'Preparing',
      statusColor: '#ffc107',
      time: '2:45 PM',
      items: ['Grilled Salmon', 'Caesar Salad', 'Garlic Bread'],
      customerName: 'John Smith',
      orderType: 'dine-in',
    },
    {
      id: 2,
      table: 'Takeaway',
      amount: '$28.75',
      status: 'Ready',
      statusColor: '#28a745',
      time: '2:40 PM',
      items: ['Chicken Teriyaki Bowl', 'Miso Soup'],
      customerName: 'Maria Garcia',
      orderType: 'takeaway',
    },
    {
      id: 3,
      table: 'Table 8',
      amount: '$67.25',
      status: 'Pending',
      statusColor: '#dc3545',
      time: '2:35 PM',
      items: ['Beef Ribeye', 'Roasted Vegetables', 'Red Wine'],
      customerName: 'David Johnson',
      orderType: 'dine-in',
    },
    {
      id: 4,
      table: 'Delivery',
      amount: '$52.00',
      status: 'Preparing',
      statusColor: '#ffc107',
      time: '2:30 PM',
      items: ['Margherita Pizza', 'Caesar Salad', 'Tiramisu'],
      customerName: 'Sarah Wilson',
      orderType: 'delivery',
    },
    {
      id: 5,
      table: 'Table 15',
      amount: '$89.50',
      status: 'Ready',
      statusColor: '#28a745',
      time: '2:25 PM',
      items: ['Surf & Turf', 'Lobster Bisque', 'Chocolate Cake'],
      customerName: 'Robert Brown',
      orderType: 'dine-in',
    },
  ],
  salesChartData: [
    { day: 'Mon', sales: 2450, orders: 89 },
    { day: 'Tue', sales: 2680, orders: 95 },
    { day: 'Wed', sales: 2920, orders: 102 },
    { day: 'Thu', sales: 3150, orders: 118 },
    { day: 'Fri', sales: 3850, orders: 142 },
    { day: 'Sat', sales: 4200, orders: 165 },
    { day: 'Sun', sales: 2847, orders: 98 }, // Today (partial)
  ],
  quickActions: [
    { label: 'New Order', icon: 'add', color: '#28a745', route: '/orders/new' },
    { label: 'View Tables', icon: 'table-restaurant', color: '#007bff', route: '/tables' },
    { label: 'Kitchen Display', icon: 'kitchen', color: '#fd7e14', route: '/kitchen' },
    { label: 'Daily Report', icon: 'assessment', color: '#6610f2', route: '/reports/daily' },
    { label: 'Menu Management', icon: 'restaurant-menu', color: '#20c997', route: '/menu' },
    { label: 'Settings', icon: 'settings', color: '#6c757d', route: '/settings' },
  ],
  notifications: 5,
  weatherInfo: {
    temperature: '72°F',
    condition: 'Partly Cloudy',
    emoji: '⛅',
  },
  dailyGoals: {
    salesGoal: 4000,
    currentSales: 2847,
    ordersGoal: 150,
    currentOrders: 98,
  },
};

// Utility functions for manager dashboard
export const getManagerDashboardData = (restaurantId?: string) => {
  // In a real app, this would filter by restaurant ID
  return MANAGER_DASHBOARD_DATA;
};

export const getSalesGrowthPercentage = () => {
  const data = MANAGER_DASHBOARD_DATA.salesChartData;
  if (data.length < 2) return 0;

  const today = data[data.length - 1].sales;
  const yesterday = data[data.length - 2].sales;

  return ((today - yesterday) / yesterday * 100).toFixed(1);
};

export const getOrderCompletionRate = () => {
  const totalOrders = MANAGER_DASHBOARD_DATA.stats.activeOrders.total +
    MANAGER_DASHBOARD_DATA.recentOrders.filter(order => order.status === 'Served').length;
  const completedOrders = MANAGER_DASHBOARD_DATA.recentOrders.filter(order =>
    order.status === 'Ready' || order.status === 'Served'
  ).length;

  return totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
};

export default MANAGER_DASHBOARD_DATA;