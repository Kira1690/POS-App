/**
 * Staff Management Integration Dashboard Mock Data
 * Comprehensive data for Staff Management Dashboard (2.4 Staff Management Integration Dashboard)
 */

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  role: 'super_admin' | 'system_admin' | 'store_admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen_staff' | 'self_order';
  department: string;
  avatar?: string;
  status: 'on-duty' | 'off-duty' | 'break' | 'late' | 'absent';
  shiftStart: string;
  shiftEnd: string;
  currentTask?: string;
  location: string;
  performance: {
    rating: number;
    efficiency: number;
    punctuality: number;
    customerRating: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    totalDays: number;
  };
  payroll: {
    hourlyRate: number;
    hoursWorked: number;
    overtime: number;
    tips: number;
    totalEarnings: number;
  };
}

export interface ShiftSchedule {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  department: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  actualStart?: string;
  actualEnd?: string;
  breakTime?: string;
  notes?: string;
}

export interface TaskAssignment {
  id: string;
  employeeId: string;
  taskType: 'cleaning' | 'setup' | 'service' | 'inventory' | 'training' | 'maintenance';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedBy: string;
  assignedAt: string;
  dueTime?: string;
  estimatedDuration: number;
  location: string;
}

export interface PerformanceMetric {
  employeeId: string;
  period: 'today' | 'week' | 'month';
  ordersServed: number;
  averageServiceTime: number;
  customerRating: number;
  efficiency: number;
  sales: number;
  tips: number;
  complaints: number;
  compliments: number;
  attendance: number;
  punctuality: number;
}

export interface StaffAlert {
  id: number;
  type: 'attendance' | 'performance' | 'schedule' | 'payroll' | 'training' | 'disciplinary';
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  employeeId: string;
  employeeName: string;
  title: string;
  message: string;
  time: string;
  actionRequired: boolean;
  resolved: boolean;
}

export interface StaffCommunication {
  id: number;
  type: 'announcement' | 'schedule_change' | 'policy_update' | 'training' | 'recognition';
  title: string;
  message: string;
  from: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  targetRoles: string[];
  acknowledged: string[];
  totalRecipients: number;
}

export interface StaffManagementMetrics {
  totalStaff: number;
  onDutyNow: number;
  scheduledToday: number;
  absentToday: number;
  lateToday: number;
  averageRating: number;
  turnoverRate: number;
  overtimeHours: number;
  laborCost: number;
  productivity: number;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingType: string;
  title: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'expired';
  scheduledDate: string;
  completionDate?: string;
  score?: number;
  certificateIssued: boolean;
  expiryDate?: string;
  trainer: string;
}

export interface StaffManagementDashboardData {
  restaurant: {
    id: string;
    name: string;
    manager: string;
  };
  currentDate: string;
  currentTime: string;
  staff: StaffMember[];
  todaySchedule: ShiftSchedule[];
  taskAssignments: TaskAssignment[];
  performanceMetrics: PerformanceMetric[];
  alerts: StaffAlert[];
  communications: StaffCommunication[];
  metrics: StaffManagementMetrics;
  trainingRecords: TrainingRecord[];
  recentActivity: {
    id: number;
    type: 'clock-in' | 'clock-out' | 'break' | 'task-completed' | 'performance-update';
    employeeId: string;
    employeeName: string;
    description: string;
    time: string;
  }[];
}

// Comprehensive sample data for staff management
export const STAFF_MANAGEMENT_DASHBOARD_DATA: StaffManagementDashboardData = {
  restaurant: {
    id: 'rest_001',
    name: 'The Food Corner',
    manager: 'Alice Johnson',
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
  staff: [
    {
      id: 'staff_001',
      employeeId: 'EMP001',
      name: 'John Doe',
      role: 'waiter',
      department: 'Service',
      status: 'on-duty',
      shiftStart: '9:00 AM',
      shiftEnd: '6:00 PM',
      currentTask: 'Serving tables 1-8',
      location: 'Dining Area',
      performance: {
        rating: 4.8,
        efficiency: 94,
        punctuality: 98,
        customerRating: 4.9,
      },
      attendance: {
        present: 28,
        absent: 1,
        late: 2,
        totalDays: 31,
      },
      payroll: {
        hourlyRate: 18.50,
        hoursWorked: 168,
        overtime: 8,
        tips: 1247.50,
        totalEarnings: 4455.50,
      },
    },
    {
      id: 'staff_002',
      employeeId: 'EMP002',
      name: 'Jane Smith',
      role: 'waiter',
      department: 'Service',
      status: 'on-duty',
      shiftStart: '10:00 AM',
      shiftEnd: '7:00 PM',
      currentTask: 'Serving tables 9-16',
      location: 'Dining Area',
      performance: {
        rating: 4.6,
        efficiency: 87,
        punctuality: 95,
        customerRating: 4.7,
      },
      attendance: {
        present: 27,
        absent: 2,
        late: 3,
        totalDays: 32,
      },
      payroll: {
        hourlyRate: 18.50,
        hoursWorked: 172,
        overtime: 6,
        tips: 1189.25,
        totalEarnings: 4367.25,
      },
    },
    {
      id: 'kitchen_001',
      employeeId: 'CHEF001',
      name: 'Chef Mike Wilson',
      role: 'kitchen_staff',
      department: 'Kitchen',
      status: 'on-duty',
      shiftStart: '8:00 AM',
      shiftEnd: '5:00 PM',
      currentTask: 'Main course station',
      location: 'Kitchen',
      performance: {
        rating: 4.9,
        efficiency: 96,
        punctuality: 100,
        customerRating: 4.8,
      },
      attendance: {
        present: 31,
        absent: 0,
        late: 0,
        totalDays: 31,
      },
      payroll: {
        hourlyRate: 24.00,
        hoursWorked: 176,
        overtime: 12,
        tips: 0,
        totalEarnings: 4656.00,
      },
    },
    {
      id: 'staff_003',
      employeeId: 'EMP003',
      name: 'Sarah Wilson',
      role: 'waiter',
      department: 'Service',
      status: 'break',
      shiftStart: '11:00 AM',
      shiftEnd: '8:00 PM',
      currentTask: 'Lunch break',
      location: 'Break Room',
      performance: {
        rating: 4.3,
        efficiency: 82,
        punctuality: 88,
        customerRating: 4.4,
      },
      attendance: {
        present: 25,
        absent: 3,
        late: 5,
        totalDays: 33,
      },
      payroll: {
        hourlyRate: 17.50,
        hoursWorked: 165,
        overtime: 4,
        tips: 978.30,
        totalEarnings: 3866.30,
      },
    },
    {
      id: 'staff_004',
      employeeId: 'EMP004',
      name: 'David Johnson',
      role: 'waiter',
      department: 'Service',
      status: 'late',
      shiftStart: '2:00 PM',
      shiftEnd: '10:00 PM',
      currentTask: 'Expected at 2:00 PM',
      location: 'Not checked in',
      performance: {
        rating: 3.9,
        efficiency: 75,
        punctuality: 82,
        customerRating: 4.1,
      },
      attendance: {
        present: 24,
        absent: 4,
        late: 8,
        totalDays: 36,
      },
      payroll: {
        hourlyRate: 17.00,
        hoursWorked: 152,
        overtime: 2,
        tips: 845.75,
        totalEarnings: 3429.75,
      },
    },
    {
      id: 'kitchen_002',
      employeeId: 'CHEF002',
      name: 'Maria Garcia',
      role: 'kitchen_staff',
      department: 'Kitchen',
      status: 'off-duty',
      shiftStart: '5:00 PM',
      shiftEnd: '1:00 AM',
      currentTask: 'Evening shift prep',
      location: 'Kitchen',
      performance: {
        rating: 4.7,
        efficiency: 91,
        punctuality: 96,
        customerRating: 4.6,
      },
      attendance: {
        present: 29,
        absent: 1,
        late: 1,
        totalDays: 31,
      },
      payroll: {
        hourlyRate: 22.00,
        hoursWorked: 168,
        overtime: 8,
        tips: 0,
        totalEarnings: 4048.00,
      },
    },
  ],
  todaySchedule: [
    {
      id: 'shift_001',
      employeeId: 'EMP001',
      date: new Date().toISOString().split('T')[0],
      startTime: '9:00 AM',
      endTime: '6:00 PM',
      role: 'Server',
      department: 'Service',
      status: 'confirmed',
      actualStart: '8:58 AM',
      notes: 'Training new staff member',
    },
    {
      id: 'shift_002',
      employeeId: 'EMP002',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '7:00 PM',
      role: 'Server',
      department: 'Service',
      status: 'confirmed',
      actualStart: '10:05 AM',
    },
    {
      id: 'shift_003',
      employeeId: 'CHEF001',
      date: new Date().toISOString().split('T')[0],
      startTime: '8:00 AM',
      endTime: '5:00 PM',
      role: 'Head Chef',
      department: 'Kitchen',
      status: 'confirmed',
      actualStart: '7:55 AM',
    },
    {
      id: 'shift_004',
      employeeId: 'EMP003',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:00 AM',
      endTime: '8:00 PM',
      role: 'Server',
      department: 'Service',
      status: 'confirmed',
      actualStart: '11:02 AM',
      breakTime: '2:30 PM - 3:00 PM',
    },
    {
      id: 'shift_005',
      employeeId: 'EMP004',
      date: new Date().toISOString().split('T')[0],
      startTime: '2:00 PM',
      endTime: '10:00 PM',
      role: 'Server',
      department: 'Service',
      status: 'no-show',
      notes: 'No call, no show - 15 minutes late',
    },
  ],
  taskAssignments: [
    {
      id: 'task_001',
      employeeId: 'EMP001',
      taskType: 'training',
      description: 'Train new server on POS system and menu basics',
      priority: 'high',
      status: 'in-progress',
      assignedBy: 'Alice Johnson',
      assignedAt: '9:00 AM',
      dueTime: '12:00 PM',
      estimatedDuration: 180,
      location: 'Training Room',
    },
    {
      id: 'task_002',
      employeeId: 'EMP002',
      taskType: 'cleaning',
      description: 'Deep clean dining area tables and chairs',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'Alice Johnson',
      assignedAt: '10:30 AM',
      dueTime: '11:30 AM',
      estimatedDuration: 60,
      location: 'Dining Area',
    },
    {
      id: 'task_003',
      employeeId: 'CHEF001',
      taskType: 'inventory',
      description: 'Check and update kitchen inventory for weekend prep',
      priority: 'high',
      status: 'completed',
      assignedBy: 'Alice Johnson',
      assignedAt: '8:30 AM',
      dueTime: '10:00 AM',
      estimatedDuration: 90,
      location: 'Kitchen Storage',
    },
    {
      id: 'task_004',
      employeeId: 'EMP003',
      taskType: 'setup',
      description: 'Set up private dining room for 6 PM reservation',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'Alice Johnson',
      assignedAt: '3:00 PM',
      dueTime: '5:30 PM',
      estimatedDuration: 45,
      location: 'Private Dining Room',
    },
    {
      id: 'task_005',
      employeeId: 'EMP004',
      taskType: 'service',
      description: 'Cover tables for David Johnson until he arrives',
      priority: 'urgent',
      status: 'overdue',
      assignedBy: 'Alice Johnson',
      assignedAt: '2:15 PM',
      estimatedDuration: 30,
      location: 'Tables 17-24',
    },
  ],
  performanceMetrics: [
    {
      employeeId: 'EMP001',
      period: 'today',
      ordersServed: 18,
      averageServiceTime: 12,
      customerRating: 4.9,
      efficiency: 94,
      sales: 456.75,
      tips: 47.50,
      complaints: 0,
      compliments: 3,
      attendance: 100,
      punctuality: 100,
    },
    {
      employeeId: 'EMP002',
      period: 'today',
      ordersServed: 22,
      averageServiceTime: 14,
      customerRating: 4.7,
      efficiency: 87,
      sales: 589.50,
      tips: 52.25,
      complaints: 1,
      compliments: 2,
      attendance: 100,
      punctuality: 95,
    },
    {
      employeeId: 'CHEF001',
      period: 'today',
      ordersServed: 42,
      averageServiceTime: 18,
      customerRating: 4.8,
      efficiency: 96,
      sales: 1247.80,
      tips: 0,
      complaints: 0,
      compliments: 5,
      attendance: 100,
      punctuality: 100,
    },
  ],
  alerts: [
    {
      id: 1,
      type: 'attendance',
      severity: 'urgent',
      employeeId: 'EMP004',
      employeeName: 'David Johnson',
      title: 'No Show Alert',
      message: 'Employee scheduled at 2:00 PM has not checked in. Last seen yesterday.',
      time: '2:15 PM',
      actionRequired: true,
      resolved: false,
    },
    {
      id: 2,
      type: 'performance',
      severity: 'warning',
      employeeId: 'EMP003',
      employeeName: 'Sarah Wilson',
      title: 'Performance Decline',
      message: 'Customer rating dropped to 4.4 this month. Consider additional training.',
      time: '1:00 PM',
      actionRequired: true,
      resolved: false,
    },
    {
      id: 3,
      type: 'schedule',
      severity: 'info',
      employeeId: 'CHEF002',
      employeeName: 'Maria Garcia',
      title: 'Overtime Alert',
      message: 'Employee approaching overtime threshold this week (8 hours).',
      time: '12:30 PM',
      actionRequired: false,
      resolved: false,
    },
    {
      id: 4,
      type: 'training',
      severity: 'warning',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      title: 'Certification Expiring',
      message: 'Food safety certification expires in 15 days. Schedule renewal.',
      time: '10:00 AM',
      actionRequired: true,
      resolved: false,
    },
  ],
  communications: [
    {
      id: 1,
      type: 'announcement',
      title: 'New Menu Items Available',
      message: 'Grilled Salmon special is 20% off today. Please inform all customers.',
      from: 'Alice Johnson (Manager)',
      time: '2:00 PM',
      priority: 'medium',
      targetRoles: ['waiter'],
      acknowledged: ['EMP001', 'EMP002'],
      totalRecipients: 4,
    },
    {
      id: 2,
      type: 'schedule_change',
      title: 'Weekend Schedule Update',
      message: 'Saturday evening shift extended due to private event booking.',
      from: 'Alice Johnson (Manager)',
      time: '1:30 PM',
      priority: 'high',
      targetRoles: ['waiter', 'kitchen_staff'],
      acknowledged: ['EMP001', 'CHEF001'],
      totalRecipients: 6,
    },
    {
      id: 3,
      type: 'recognition',
      title: 'Employee of the Month',
      message: 'Congratulations to Chef Mike Wilson for outstanding performance!',
      from: 'Management',
      time: '12:00 PM',
      priority: 'low',
      targetRoles: ['waiter', 'kitchen_staff', 'manager'],
      acknowledged: ['EMP001', 'EMP002', 'CHEF001'],
      totalRecipients: 8,
    },
  ],
  metrics: {
    totalStaff: 6,
    onDutyNow: 4,
    scheduledToday: 5,
    absentToday: 0,
    lateToday: 1,
    averageRating: 4.5,
    turnoverRate: 8.5,
    overtimeHours: 32,
    laborCost: 2847.50,
    productivity: 89,
  },
  trainingRecords: [
    {
      id: 'train_001',
      employeeId: 'EMP001',
      trainingType: 'Customer Service',
      title: 'Advanced Customer Service Excellence',
      status: 'completed',
      scheduledDate: '2025-09-01',
      completionDate: '2025-09-01',
      score: 95,
      certificateIssued: true,
      trainer: 'Alice Johnson',
    },
    {
      id: 'train_002',
      employeeId: 'EMP002',
      trainingType: 'Food Safety',
      title: 'Food Safety and Hygiene Certification',
      status: 'expired',
      scheduledDate: '2024-09-15',
      completionDate: '2024-09-15',
      score: 88,
      certificateIssued: true,
      expiryDate: '2025-09-15',
      trainer: 'External Certified Trainer',
    },
    {
      id: 'train_003',
      employeeId: 'EMP003',
      trainingType: 'POS System',
      title: 'New POS System Training',
      status: 'scheduled',
      scheduledDate: '2025-09-26',
      trainer: 'Tech Support Team',
      certificateIssued: false,
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: 'clock-in',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      description: 'Clocked in for shift',
      time: '10:05 AM',
    },
    {
      id: 2,
      type: 'task-completed',
      employeeId: 'CHEF001',
      employeeName: 'Chef Mike Wilson',
      description: 'Completed kitchen inventory check',
      time: '9:45 AM',
    },
    {
      id: 3,
      type: 'break',
      employeeId: 'EMP003',
      employeeName: 'Sarah Wilson',
      description: 'Started lunch break',
      time: '2:30 PM',
    },
    {
      id: 4,
      type: 'performance-update',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      description: 'Received excellent customer review',
      time: '2:15 PM',
    },
    {
      id: 5,
      type: 'clock-in',
      employeeId: 'CHEF001',
      employeeName: 'Chef Mike Wilson',
      description: 'Clocked in 5 minutes early',
      time: '7:55 AM',
    },
  ],
};

// Utility functions for staff management dashboard
export const getStaffManagementDashboardData = (restaurantId?: string) => {
  // In a real app, this would filter by restaurant ID
  return STAFF_MANAGEMENT_DASHBOARD_DATA;
};

export const getStaffByStatus = (staff: StaffMember[]) => {
  return {
    'on-duty': staff.filter(s => s.status === 'on-duty'),
    'off-duty': staff.filter(s => s.status === 'off-duty'),
    'break': staff.filter(s => s.status === 'break'),
    'late': staff.filter(s => s.status === 'late'),
    'absent': staff.filter(s => s.status === 'absent'),
  };
};

export const getAlertsByType = (alerts: StaffAlert[]) => {
  return {
    attendance: alerts.filter(alert => alert.type === 'attendance'),
    performance: alerts.filter(alert => alert.type === 'performance'),
    schedule: alerts.filter(alert => alert.type === 'schedule'),
    training: alerts.filter(alert => alert.type === 'training'),
    disciplinary: alerts.filter(alert => alert.type === 'disciplinary'),
  };
};

export const getTasksByStatus = (tasks: TaskAssignment[]) => {
  return {
    pending: tasks.filter(task => task.status === 'pending'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed'),
    overdue: tasks.filter(task => task.status === 'overdue'),
  };
};

export const getAveragePerformance = (metrics: PerformanceMetric[]) => {
  if (metrics.length === 0) return 0;

  const totalEfficiency = metrics.reduce((sum, metric) => sum + metric.efficiency, 0);
  return Math.round(totalEfficiency / metrics.length);
};

export const getAttendanceRate = (staff: StaffMember[]) => {
  const totalAttendance = staff.reduce((sum, member) => {
    const rate = (member.attendance.present / member.attendance.totalDays) * 100;
    return sum + rate;
  }, 0);

  return staff.length > 0 ? Math.round(totalAttendance / staff.length) : 0;
};

export const getTopPerformers = (staff: StaffMember[], limit: number = 3) => {
  return [...staff]
    .sort((a, b) => b.performance.rating - a.performance.rating)
    .slice(0, limit);
};

export const getStaffNeedingAttention = (staff: StaffMember[], alerts: StaffAlert[]) => {
  const alertEmployeeIds = new Set(alerts.filter(alert => alert.severity === 'urgent' || alert.severity === 'critical').map(alert => alert.employeeId));

  return staff.filter(member =>
    alertEmployeeIds.has(member.employeeId) ||
    member.status === 'late' ||
    member.status === 'absent' ||
    member.performance.rating < 4.0 ||
    member.attendance.present / member.attendance.totalDays < 0.9
  );
};

export default STAFF_MANAGEMENT_DASHBOARD_DATA;