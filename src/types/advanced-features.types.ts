export interface ManagerPerformanceMetrics {
  todays_revenue: number;
  revenue_trend: number; // percentage change
  orders_processed: number;
  orders_trend: number;
  avg_service_time: string; // in format "MM:SS"
  service_time_trend: number;
  staff_on_duty: number;
  total_staff: number;
  active_alerts: number;
}

export type StaffRole = 'server' | 'cashier' | 'kitchen' | 'manager' | 'host';
export type StaffStatus = 'active' | 'break' | 'offline';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  shift_start: string;
  sales_today: number;
  avatar_color: string;
}

export type OverrideType = 'price' | 'discount' | 'void' | 'comp' | 'cash_drawer';

export interface SystemOverride {
  type: OverrideType;
  title: string;
  description: string;
  requires_pin: boolean;
  color: string;
  icon: string;
}

export type SystemStatus = 'online' | 'warning' | 'offline' | 'error';

export interface SystemHealthItem {
  name: string;
  status: SystemStatus;
  details?: string;
  icon: string;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source?: string; // Source of the alert (e.g., system, module name)
}

export interface HappyHourSchedule {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  days_of_week: number[]; // 0-6, Sunday to Saturday
  discount_percentage: number;
  applicable_categories: string[];
  is_active: boolean;
  created_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'happy_hour' | 'lunch_special' | 'weekend_brunch' | 'custom';
  discount_type: 'percentage' | 'fixed_amount' | 'bogo';
  discount_value: number;
  start_time: string;
  end_time: string;
  days_active: number[];
  applicable_items: string[];
  is_active: boolean;
  priority: number;
}

export interface EndOfDayOperation {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  last_executed?: string;
  icon: string;
  action: () => Promise<void>;
}

// Service interfaces
export interface AdvancedFeaturesService {
  getManagerMetrics(): Promise<ManagerPerformanceMetrics>;
  getStaffOnDuty(): Promise<StaffMember[]>;
  getSystemHealth(): Promise<SystemHealthItem[]>;
  getSystemAlerts(): Promise<SystemAlert[]>;
  getHappyHourSchedules(): Promise<HappyHourSchedule[]>;
  getPricingRules(): Promise<PricingRule[]>;
  
  // Staff management
  clockInStaff(staffId: string): Promise<void>;
  sendStaffBreak(staffId: string): Promise<void>;
  sendStaffAlert(message: string): Promise<void>;
  
  // System overrides
  priceOverride(itemId: string, newPrice: number, managerPin: string): Promise<void>;
  applyDiscount(orderId: string, discountPercent: number, managerPin: string): Promise<void>;
  voidTransaction(transactionId: string, reason: string, managerPin: string): Promise<void>;
  compItem(itemId: string, reason: string, managerPin: string): Promise<void>;
  forceOpenCashDrawer(managerPin: string): Promise<void>;
  
  // System operations
  backupNow(): Promise<void>;
  syncData(): Promise<void>;
  closeBusinessDay(): Promise<void>;
  generateDailyReport(): Promise<void>;
  cashCountReconciliation(): Promise<void>;
  
  // Pricing management
  createHappyHourSchedule(schedule: Omit<HappyHourSchedule, 'id' | 'created_at'>): Promise<void>;
  updateHappyHourSchedule(id: string, schedule: Partial<HappyHourSchedule>): Promise<void>;
  toggleHappyHour(id: string, active: boolean): Promise<void>;
  overridePricing(managerPin: string): Promise<void>;
}

export interface AdvancedFeaturesContextType {
  metrics: ManagerPerformanceMetrics | null;
  staffOnDuty: StaffMember[];
  systemHealth: SystemHealthItem[];
  systemAlerts: SystemAlert[];
  happyHourSchedules: HappyHourSchedule[];
  pricingRules: PricingRule[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadManagerData: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  handleStaffAction: (action: string, staffId: string) => Promise<void>;
  handleSystemOverride: (type: OverrideType, params: any) => Promise<void>;
  handleSystemOperation: (operation: string) => Promise<void>;
  handlePricingAction: (action: string, params: any) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}