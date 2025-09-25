/**
 * Kitchen Dashboard Mock Data
 * Comprehensive data for Kitchen Dashboard (2.3 Kitchen Dashboard)
 */

export interface ChefInfo {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  specialization: string;
  shiftStart: string;
  efficiency: number;
}

export interface KitchenStation {
  name: string;
  count: number;
  color: string;
  emoji: string;
  status: 'normal' | 'busy' | 'critical' | 'idle';
  avgPrepTime: number;
  staffAssigned: number;
  equipmentStatus: 'operational' | 'maintenance' | 'offline';
}

export interface PriorityOrder {
  id: number;
  type: string;
  timeInfo: string;
  items: string[];
  color: string;
  bgColor: string;
  tableNumber?: number;
  orderNumber?: string;
  customerName?: string;
  specialInstructions?: string[];
  allergyInfo?: string[];
  estimatedCompletion: string;
  actualStartTime: string;
  isOverdue: boolean;
}

export interface ActiveOrder {
  id: number;
  title: string;
  time: string;
  items: string[];
  status: 'ready' | 'cooking' | 'preparing' | 'queue' | 'plating';
  bgColor: string;
  borderColor: string;
  tableNumber?: number;
  orderNumber?: string;
  customerName?: string;
  specialInstructions?: string[];
  startTime: string;
  estimatedCompletion: string;
  priority: 'high' | 'normal' | 'low';
}

export interface KitchenControl {
  label: string;
  icon: string;
  color: string;
  action?: string;
  badge?: number;
}

export interface KitchenMetrics {
  averagePrepTime: number;
  ordersCompleted: number;
  ordersInProgress: number;
  ordersPending: number;
  efficiency: number;
  customerSatisfaction: number;
  wasteLevel: number;
}

export interface KitchenDashboardData {
  restaurant: {
    id: string;
    name: string;
  };
  chef: ChefInfo;
  currentTime: string;
  stations: KitchenStation[];
  priorityOrders: PriorityOrder[];
  activeOrders: ActiveOrder[];
  controls: KitchenControl[];
  metrics: KitchenMetrics;
  inventory: {
    lowStock: string[];
    outOfStock: string[];
    freshDeliveries: string[];
  };
  equipmentAlerts: {
    id: number;
    equipment: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    time: string;
  }[];
  teamCommunication: {
    id: number;
    from: string;
    message: string;
    time: string;
    type: 'info' | 'urgent' | 'question';
  }[];
}

// Sample data for different kitchen staff members
export const KITCHEN_DASHBOARD_DATA: Record<string, KitchenDashboardData> = {
  'CHEF001': {
    restaurant: {
      id: 'rest_001',
      name: 'The Food Corner',
    },
    chef: {
      id: 'kitchen_001',
      name: 'Chef Mike Wilson',
      employeeId: 'CHEF001',
      role: 'Head Chef',
      specialization: 'International Cuisine',
      shiftStart: '8:00 AM',
      efficiency: 92,
    },
    currentTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    stations: [
      {
        name: 'APPETIZERS',
        count: 3,
        color: '#28a745',
        emoji: '🥗',
        status: 'normal',
        avgPrepTime: 8,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
      {
        name: 'MAIN COURSE',
        count: 7,
        color: '#dc3545',
        emoji: '🍖',
        status: 'busy',
        avgPrepTime: 22,
        staffAssigned: 2,
        equipmentStatus: 'operational',
      },
      {
        name: 'SUSHI',
        count: 2,
        color: '#007bff',
        emoji: '🍣',
        status: 'normal',
        avgPrepTime: 15,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
      {
        name: 'DESSERTS',
        count: 1,
        color: '#6610f2',
        emoji: '🍰',
        status: 'idle',
        avgPrepTime: 10,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
      {
        name: 'BEVERAGES',
        count: 4,
        color: '#20c997',
        emoji: '🥤',
        status: 'normal',
        avgPrepTime: 3,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
    ],
    priorityOrders: [
      {
        id: 1,
        type: 'TABLE 7 - URGENT',
        timeInfo: '⏰ 45 min overdue',
        items: ['• Grilled Salmon', '• Caesar Salad', '• Garlic Bread'],
        color: '#dc3545',
        bgColor: '#f8d7da',
        tableNumber: 7,
        orderNumber: 'ORD1234',
        customerName: 'Johnson Family',
        specialInstructions: ['No onions on salmon', 'Extra dressing on side'],
        allergyInfo: ['Shellfish allergy'],
        estimatedCompletion: '3:15 PM',
        actualStartTime: '1:30 PM',
        isOverdue: true,
      },
      {
        id: 2,
        type: 'TAKEAWAY #T001',
        timeInfo: '⏰ 30 min prep time',
        items: ['• Chicken Teriyaki', '• Miso Soup', '• Steamed Rice'],
        color: '#ffc107',
        bgColor: '#fff3cd',
        orderNumber: 'T001',
        customerName: 'Maria Garcia',
        specialInstructions: ['Extra teriyaki sauce', 'Brown rice instead of white'],
        estimatedCompletion: '3:00 PM',
        actualStartTime: '2:15 PM',
        isOverdue: false,
      },
      {
        id: 3,
        type: 'DELIVERY #D003 - VIP',
        timeInfo: '⏰ 25 min remaining',
        items: ['• Wagyu Beef Steak', '• Truffle Risotto', '• Wine Pairing'],
        color: '#fd7e14',
        bgColor: '#ffe8d6',
        orderNumber: 'D003',
        customerName: 'Premium Client',
        specialInstructions: ['Medium-rare steak', 'Extra truffles'],
        allergyInfo: ['Dairy-free wine only'],
        estimatedCompletion: '3:10 PM',
        actualStartTime: '2:20 PM',
        isOverdue: false,
      },
    ],
    activeOrders: [
      {
        id: 1,
        title: 'TABLE 12',
        time: '⏱️ 8 min',
        items: ['• Mushroom Risotto (Ready)', '• Garlic Bread (Ready)', '• House Salad (Plating)'],
        status: 'ready',
        bgColor: '#d4edda',
        borderColor: '#28a745',
        tableNumber: 12,
        orderNumber: 'ORD1235',
        customerName: 'Smith Family',
        startTime: '2:37 PM',
        estimatedCompletion: '2:50 PM',
        priority: 'normal',
      },
      {
        id: 2,
        title: 'TABLE 5',
        time: '⏱️ 15 min',
        items: ['• Beef Steak (Cooking)', '• Roasted Vegetables (Prep)', '• Red Wine Sauce (Ready)'],
        status: 'cooking',
        bgColor: '#fff3cd',
        borderColor: '#ffc107',
        tableNumber: 5,
        orderNumber: 'ORD1236',
        customerName: 'Davis Couple',
        specialInstructions: ['Medium-well steak'],
        startTime: '2:30 PM',
        estimatedCompletion: '3:00 PM',
        priority: 'normal',
      },
      {
        id: 3,
        title: 'DELIVERY #D003',
        time: '⏱️ 22 min',
        items: ['• Sushi Platter (Prep)', '• Miso Soup (Ready)', '• Edamame (Ready)'],
        status: 'preparing',
        bgColor: '#cce5ff',
        borderColor: '#007bff',
        orderNumber: 'D003',
        customerName: 'Wilson Corp',
        startTime: '2:23 PM',
        estimatedCompletion: '3:05 PM',
        priority: 'high',
      },
      {
        id: 4,
        title: 'TABLE 18',
        time: '⏱️ Just received',
        items: ['• Fish & Chips (Queue)', '• Coleslaw (Queue)', '• Tartar Sauce (Queue)'],
        status: 'queue',
        bgColor: '#e2e3e5',
        borderColor: '#6c757d',
        tableNumber: 18,
        orderNumber: 'ORD1237',
        customerName: 'Miller Family',
        startTime: '2:45 PM',
        estimatedCompletion: '3:15 PM',
        priority: 'normal',
      },
      {
        id: 5,
        title: 'TAKEAWAY #T002',
        time: '⏱️ 12 min',
        items: ['• Pad Thai (Cooking)', '• Spring Rolls (Ready)', '• Thai Iced Tea (Ready)'],
        status: 'cooking',
        bgColor: '#fff3cd',
        borderColor: '#ffc107',
        orderNumber: 'T002',
        customerName: 'Brown',
        specialInstructions: ['Spicy level: Medium'],
        startTime: '2:33 PM',
        estimatedCompletion: '2:55 PM',
        priority: 'normal',
      },
      {
        id: 6,
        title: 'TABLE 9',
        time: '⏱️ 5 min',
        items: ['• Chocolate Lava Cake (Plating)', '• Vanilla Ice Cream (Ready)', '• Berry Sauce (Ready)'],
        status: 'plating',
        bgColor: '#d1ecf1',
        borderColor: '#17a2b8',
        tableNumber: 9,
        orderNumber: 'ORD1238',
        customerName: 'Anderson',
        startTime: '2:40 PM',
        estimatedCompletion: '2:50 PM',
        priority: 'low',
      },
    ],
    controls: [
      { label: 'Mark as Ready', icon: 'check-circle', color: '#28a745', action: 'mark_ready', badge: 3 },
      { label: 'Report Delay', icon: 'schedule', color: '#ffc107', action: 'report_delay' },
      { label: 'Need Help', icon: 'help', color: '#dc3545', action: 'need_help', badge: 1 },
      { label: 'Station Status', icon: 'analytics', color: '#007bff', action: 'station_status' },
      { label: 'Check Inventory', icon: 'inventory', color: '#6610f2', action: 'check_inventory', badge: 2 },
      { label: 'Call Manager', icon: 'call', color: '#fd7e14', action: 'call_manager' },
    ],
    metrics: {
      averagePrepTime: 18,
      ordersCompleted: 42,
      ordersInProgress: 13,
      ordersPending: 8,
      efficiency: 92,
      customerSatisfaction: 4.7,
      wasteLevel: 3.2,
    },
    inventory: {
      lowStock: ['Salmon fillets', 'Truffle oil', 'Organic greens'],
      outOfStock: ['Wagyu beef', 'Fresh basil'],
      freshDeliveries: ['Seasonal vegetables', 'Fresh herbs', 'Daily fish'],
    },
    equipmentAlerts: [
      {
        id: 1,
        equipment: 'Grill Station 2',
        issue: 'Temperature inconsistency detected',
        severity: 'medium',
        time: '2:30 PM',
      },
      {
        id: 2,
        equipment: 'Dishwasher',
        issue: 'Maintenance due in 2 hours',
        severity: 'low',
        time: '1:00 PM',
      },
    ],
    teamCommunication: [
      {
        id: 1,
        from: 'Server Jane',
        message: 'Table 7 is asking about their order - any ETA?',
        time: '2:42 PM',
        type: 'question',
      },
      {
        id: 2,
        from: 'Manager Alice',
        message: 'VIP customer at Table 15 - prioritize their dessert order',
        time: '2:38 PM',
        type: 'urgent',
      },
      {
        id: 3,
        from: 'Kitchen David',
        message: 'Prep station is running low on fresh herbs',
        time: '2:35 PM',
        type: 'info',
      },
    ],
  },

  'CHEF002': {
    restaurant: {
      id: 'rest_002',
      name: 'Pizza Palace',
    },
    chef: {
      id: 'kitchen_002',
      name: 'Chef Sarah Brown',
      employeeId: 'CHEF002',
      role: 'Pizza Specialist',
      specialization: 'Italian Cuisine',
      shiftStart: '10:00 AM',
      efficiency: 88,
    },
    currentTime: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    stations: [
      {
        name: 'PIZZA PREP',
        count: 5,
        color: '#dc3545',
        emoji: '🍕',
        status: 'busy',
        avgPrepTime: 15,
        staffAssigned: 2,
        equipmentStatus: 'operational',
      },
      {
        name: 'OVEN',
        count: 3,
        color: '#fd7e14',
        emoji: '🔥',
        status: 'critical',
        avgPrepTime: 12,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
      {
        name: 'SALADS',
        count: 2,
        color: '#28a745',
        emoji: '🥗',
        status: 'normal',
        avgPrepTime: 6,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
      {
        name: 'APPETIZERS',
        count: 1,
        color: '#6610f2',
        emoji: '🧄',
        status: 'idle',
        avgPrepTime: 8,
        staffAssigned: 1,
        equipmentStatus: 'operational',
      },
    ],
    priorityOrders: [
      {
        id: 1,
        type: 'TABLE 3 - BIRTHDAY PARTY',
        timeInfo: '⏰ 20 min overdue',
        items: ['• Large Pepperoni Pizza', '• Garlic Knots', '• Caesar Salad'],
        color: '#dc3545',
        bgColor: '#f8d7da',
        tableNumber: 3,
        orderNumber: 'ORD2001',
        customerName: 'Birthday Party - 8 guests',
        specialInstructions: ['Extra cheese', 'Cut into squares'],
        estimatedCompletion: '2:30 PM',
        actualStartTime: '1:45 PM',
        isOverdue: true,
      },
    ],
    activeOrders: [
      {
        id: 1,
        title: 'TABLE 7',
        time: '⏱️ 10 min',
        items: ['• Margherita Pizza (Oven)', '• Caprese Salad (Ready)'],
        status: 'cooking',
        bgColor: '#fff3cd',
        borderColor: '#ffc107',
        tableNumber: 7,
        orderNumber: 'ORD2002',
        customerName: 'Romantic Dinner',
        startTime: '2:35 PM',
        estimatedCompletion: '2:55 PM',
        priority: 'normal',
      },
    ],
    controls: [
      { label: 'Mark as Ready', icon: 'check-circle', color: '#28a745', action: 'mark_ready', badge: 1 },
      { label: 'Report Delay', icon: 'schedule', color: '#ffc107', action: 'report_delay' },
      { label: 'Need Help', icon: 'help', color: '#dc3545', action: 'need_help' },
      { label: 'Oven Status', icon: 'local-fire-department', color: '#fd7e14', action: 'oven_status' },
      { label: 'Check Dough', icon: 'inventory', color: '#6610f2', action: 'check_dough' },
      { label: 'Call Manager', icon: 'call', color: '#fd7e14', action: 'call_manager' },
    ],
    metrics: {
      averagePrepTime: 16,
      ordersCompleted: 28,
      ordersInProgress: 11,
      ordersPending: 5,
      efficiency: 88,
      customerSatisfaction: 4.5,
      wasteLevel: 2.8,
    },
    inventory: {
      lowStock: ['Mozzarella cheese', 'Pepperoni', 'Pizza dough'],
      outOfStock: ['Prosciutto'],
      freshDeliveries: ['Fresh basil', 'San Marzano tomatoes'],
    },
    equipmentAlerts: [],
    teamCommunication: [
      {
        id: 1,
        from: 'Manager Bob',
        message: 'Large order coming in at 6 PM - prep extra dough',
        time: '2:40 PM',
        type: 'info',
      },
    ],
  },
};

// Default kitchen data for unknown chef IDs
export const DEFAULT_KITCHEN_DATA: KitchenDashboardData = KITCHEN_DASHBOARD_DATA['CHEF001'];

// Utility functions for kitchen dashboard
export const getKitchenDashboardData = (employeeId: string): KitchenDashboardData => {
  return KITCHEN_DASHBOARD_DATA[employeeId] || DEFAULT_KITCHEN_DATA;
};

export const getOrdersByStatus = (orders: ActiveOrder[]) => {
  return {
    ready: orders.filter(order => order.status === 'ready'),
    cooking: orders.filter(order => order.status === 'cooking'),
    preparing: orders.filter(order => order.status === 'preparing'),
    plating: orders.filter(order => order.status === 'plating'),
    queue: orders.filter(order => order.status === 'queue'),
  };
};

export const getStationEfficiency = (station: KitchenStation) => {
  const baseEfficiency = station.status === 'critical' ? 60 :
                        station.status === 'busy' ? 80 :
                        station.status === 'normal' ? 95 : 100;

  return station.equipmentStatus === 'offline' ? 0 :
         station.equipmentStatus === 'maintenance' ? baseEfficiency * 0.7 :
         baseEfficiency;
};

export const getOverdueOrders = (orders: PriorityOrder[]) => {
  return orders.filter(order => order.isOverdue);
};

export const getKitchenAlerts = (data: KitchenDashboardData) => {
  const alerts = [];

  // Equipment alerts
  alerts.push(...data.equipmentAlerts.filter(alert => alert.severity === 'high'));

  // Overdue orders
  const overdueCount = getOverdueOrders(data.priorityOrders).length;
  if (overdueCount > 0) {
    alerts.push({
      id: 999,
      equipment: 'Order Management',
      issue: `${overdueCount} overdue order(s) need immediate attention`,
      severity: 'high' as const,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
  }

  // Low efficiency stations
  const criticalStations = data.stations.filter(station => station.status === 'critical');
  if (criticalStations.length > 0) {
    alerts.push({
      id: 998,
      equipment: 'Station Management',
      issue: `${criticalStations.length} station(s) at critical capacity`,
      severity: 'medium' as const,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });
  }

  return alerts;
};

export default KITCHEN_DASHBOARD_DATA;