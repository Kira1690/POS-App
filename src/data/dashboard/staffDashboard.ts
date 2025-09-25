/**
 * Staff Dashboard Mock Data
 * Comprehensive data for Staff Dashboard (2.2 Staff Dashboard)
 */

export interface StaffInfo {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  avatar?: string;
  rating: string;
  status: 'excellent' | 'good' | 'average' | 'needs-improvement';
}

export interface ShiftInfo {
  startTime: string;
  duration: string;
  scheduledEnd: string;
  actualStart?: string;
  isLate: boolean;
  breakTime?: string;
  remainingHours: string;
  overtimeHours?: number;
}

export interface StaffPerformance {
  rating: string;
  status: string;
  ordersServed: number;
  averageOrderTime: string;
  customerRating: number;
  tips: string;
  efficiency: number;
}

export interface OrderMetrics {
  count: number;
  totalValue: string;
  averageOrder: string;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface AssignedTables {
  tables: number[];
  occupied: number;
  available: number;
  totalAssigned: number;
  reservations: number;
}

export interface Task {
  id: number;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  color: string;
  bgColor: string;
  time?: string;
  tableNumber?: number;
  orderId?: string;
  estimatedTime?: string;
  isCompleted: boolean;
}

export interface StaffQuickAction {
  label: string;
  icon: string;
  color: string;
  route?: string;
  badge?: number;
}

export interface StaffDashboardData {
  restaurant: {
    id: string;
    name: string;
  };
  staff: StaffInfo;
  shift: ShiftInfo;
  performance: StaffPerformance;
  myOrders: OrderMetrics;
  assignedTables: AssignedTables;
  tasks: Task[];
  quickActions: StaffQuickAction[];
  colleagues: {
    onDuty: number;
    total: number;
    names: string[];
  };
  recentAnnouncements: {
    id: number;
    message: string;
    time: string;
    type: 'info' | 'warning' | 'success';
  }[];
}

// Sample data for different staff members
export const STAFF_DASHBOARD_DATA: Record<string, StaffDashboardData> = {
  'EMP001': {
    restaurant: {
      id: 'rest_001',
      name: 'The Food Corner',
    },
    staff: {
      id: 'staff_001',
      name: 'John Doe',
      employeeId: 'EMP001',
      role: 'Restaurant Staff',
      rating: '4.8/5.0',
      status: 'excellent',
    },
    shift: {
      startTime: '9:00 AM',
      duration: '5h 30m',
      scheduledEnd: '6:00 PM',
      actualStart: '8:58 AM',
      isLate: false,
      breakTime: '1:00 PM - 1:30 PM',
      remainingHours: '3h 15m',
      overtimeHours: 0,
    },
    performance: {
      rating: '4.8/5.0',
      status: 'Excellent',
      ordersServed: 18,
      averageOrderTime: '12 min',
      customerRating: 4.9,
      tips: '$47.50',
      efficiency: 94,
    },
    myOrders: {
      count: 18,
      totalValue: '$456.75',
      averageOrder: '$25.38',
      completedOrders: 15,
      pendingOrders: 3,
      cancelledOrders: 0,
    },
    assignedTables: {
      tables: [1, 3, 5, 7, 9, 11, 13, 15],
      occupied: 5,
      available: 3,
      totalAssigned: 8,
      reservations: 2,
    },
    tasks: [
      {
        id: 1,
        priority: 'urgent',
        message: 'Table 7 - Order #1234 ready for pickup from kitchen',
        color: '#dc3545',
        bgColor: '#f8d7da',
        time: '2:45 PM',
        tableNumber: 7,
        orderId: 'ORD1234',
        estimatedTime: '2 min',
        isCompleted: false,
      },
      {
        id: 2,
        priority: 'medium',
        message: 'Table 3 - Customer requesting extra napkins and condiments',
        color: '#ffc107',
        bgColor: '#fff3cd',
        time: '2:40 PM',
        tableNumber: 3,
        estimatedTime: '1 min',
        isCompleted: false,
      },
      {
        id: 3,
        priority: 'low',
        message: 'Table 11 - Ready to take dessert order',
        color: '#28a745',
        bgColor: '#d4edda',
        time: '2:35 PM',
        tableNumber: 11,
        estimatedTime: '5 min',
        isCompleted: false,
      },
      {
        id: 4,
        priority: 'info',
        message: 'Table 15 - Check if customer needs drink refills',
        color: '#007bff',
        bgColor: '#cce5ff',
        time: '2:30 PM',
        tableNumber: 15,
        estimatedTime: '2 min',
        isCompleted: false,
      },
      {
        id: 5,
        priority: 'high',
        message: 'Table 1 - Customer complaint about food temperature',
        color: '#fd7e14',
        bgColor: '#ffe8d6',
        time: '2:20 PM',
        tableNumber: 1,
        estimatedTime: '10 min',
        isCompleted: false,
      },
    ],
    quickActions: [
      { label: 'Take Order', icon: 'edit', color: '#28a745', badge: 3 },
      { label: 'Check My Tables', icon: 'table-restaurant', color: '#007bff', badge: 5 },
      { label: 'Send to Kitchen', icon: 'kitchen', color: '#fd7e14', badge: 2 },
      { label: 'Process Payment', icon: 'payment', color: '#6610f2' },
      { label: 'Call Manager', icon: 'call', color: '#dc3545' },
      { label: 'Break Time', icon: 'schedule', color: '#6c757d' },
    ],
    colleagues: {
      onDuty: 8,
      total: 12,
      names: ['Jane Smith', 'Mike Wilson', 'Sarah Brown', 'David Johnson'],
    },
    recentAnnouncements: [
      {
        id: 1,
        message: 'Special menu item: Grilled Salmon is 20% off today!',
        time: '2:00 PM',
        type: 'success',
      },
      {
        id: 2,
        message: 'Kitchen is running slow on pasta orders - inform customers',
        time: '1:30 PM',
        type: 'warning',
      },
      {
        id: 3,
        message: 'New POS system training scheduled for tomorrow at 10 AM',
        time: '12:00 PM',
        type: 'info',
      },
    ],
  },

  'EMP002': {
    restaurant: {
      id: 'rest_001',
      name: 'The Food Corner',
    },
    staff: {
      id: 'staff_002',
      name: 'Jane Smith',
      employeeId: 'EMP002',
      role: 'Restaurant Staff',
      rating: '4.6/5.0',
      status: 'good',
    },
    shift: {
      startTime: '10:00 AM',
      duration: '8h 0m',
      scheduledEnd: '6:00 PM',
      actualStart: '10:05 AM',
      isLate: true,
      breakTime: '2:00 PM - 2:30 PM',
      remainingHours: '2h 55m',
      overtimeHours: 0,
    },
    performance: {
      rating: '4.6/5.0',
      status: 'Good',
      ordersServed: 22,
      averageOrderTime: '14 min',
      customerRating: 4.7,
      tips: '$52.25',
      efficiency: 87,
    },
    myOrders: {
      count: 22,
      totalValue: '$589.50',
      averageOrder: '$26.80',
      completedOrders: 20,
      pendingOrders: 2,
      cancelledOrders: 0,
    },
    assignedTables: {
      tables: [2, 4, 6, 8, 10, 12, 14],
      occupied: 4,
      available: 3,
      totalAssigned: 7,
      reservations: 1,
    },
    tasks: [
      {
        id: 1,
        priority: 'high',
        message: 'Table 6 - VIP customer needs immediate attention',
        color: '#fd7e14',
        bgColor: '#ffe8d6',
        time: '2:50 PM',
        tableNumber: 6,
        estimatedTime: '5 min',
        isCompleted: false,
      },
      {
        id: 2,
        priority: 'medium',
        message: 'Table 12 - Order ready for serving',
        color: '#ffc107',
        bgColor: '#fff3cd',
        time: '2:45 PM',
        tableNumber: 12,
        orderId: 'ORD1235',
        estimatedTime: '3 min',
        isCompleted: false,
      },
      {
        id: 3,
        priority: 'info',
        message: 'Table 4 - Check on drink refills',
        color: '#007bff',
        bgColor: '#cce5ff',
        time: '2:40 PM',
        tableNumber: 4,
        estimatedTime: '2 min',
        isCompleted: false,
      },
    ],
    quickActions: [
      { label: 'Take Order', icon: 'edit', color: '#28a745', badge: 2 },
      { label: 'Check My Tables', icon: 'table-restaurant', color: '#007bff', badge: 4 },
      { label: 'Send to Kitchen', icon: 'kitchen', color: '#fd7e14', badge: 1 },
      { label: 'Process Payment', icon: 'payment', color: '#6610f2' },
      { label: 'Call Manager', icon: 'call', color: '#dc3545' },
      { label: 'Break Time', icon: 'schedule', color: '#6c757d' },
    ],
    colleagues: {
      onDuty: 8,
      total: 12,
      names: ['John Doe', 'Mike Wilson', 'Sarah Brown', 'David Johnson'],
    },
    recentAnnouncements: [
      {
        id: 1,
        message: 'Special menu item: Grilled Salmon is 20% off today!',
        time: '2:00 PM',
        type: 'success',
      },
      {
        id: 2,
        message: 'Kitchen is running slow on pasta orders - inform customers',
        time: '1:30 PM',
        type: 'warning',
      },
    ],
  },
};

// Default staff data for unknown employee IDs
export const DEFAULT_STAFF_DATA: StaffDashboardData = STAFF_DASHBOARD_DATA['EMP001'];

// Utility functions for staff dashboard
export const getStaffDashboardData = (employeeId: string): StaffDashboardData => {
  return STAFF_DASHBOARD_DATA[employeeId] || DEFAULT_STAFF_DATA;
};

export const getTasksByPriority = (tasks: Task[]) => {
  return {
    urgent: tasks.filter(task => task.priority === 'urgent' && !task.isCompleted),
    high: tasks.filter(task => task.priority === 'high' && !task.isCompleted),
    medium: tasks.filter(task => task.priority === 'medium' && !task.isCompleted),
    low: tasks.filter(task => task.priority === 'low' && !task.isCompleted),
    info: tasks.filter(task => task.priority === 'info' && !task.isCompleted),
  };
};

export const getShiftProgress = (shift: ShiftInfo) => {
  const startTime = new Date(`1970-01-01 ${shift.actualStart || shift.startTime}`);
  const endTime = new Date(`1970-01-01 ${shift.scheduledEnd}`);
  const currentTime = new Date();
  currentTime.setFullYear(1970, 0, 1);

  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const elapsedMinutes = (currentTime.getTime() - startTime.getTime()) / (1000 * 60);

  return Math.min(Math.max((elapsedMinutes / totalMinutes) * 100, 0), 100);
};

export const getEfficiencyBadge = (efficiency: number) => {
  if (efficiency >= 95) return { label: 'Excellent', color: '#28a745' };
  if (efficiency >= 85) return { label: 'Good', color: '#20c997' };
  if (efficiency >= 70) return { label: 'Average', color: '#ffc107' };
  return { label: 'Needs Improvement', color: '#dc3545' };
};

export default STAFF_DASHBOARD_DATA;