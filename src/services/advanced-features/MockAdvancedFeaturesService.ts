import {
  ManagerPerformanceMetrics,
  StaffMember,
  SystemHealthItem,
  SystemAlert,
  HappyHourSchedule,
  PricingRule,
  AdvancedFeaturesService,
  OverrideType,
} from '@/types/advanced-features.types';

export class MockAdvancedFeaturesService implements AdvancedFeaturesService {
  private static instance: MockAdvancedFeaturesService;
  private staffMembers: StaffMember[] = [];
  private systemAlerts: SystemAlert[] = [];
  private happyHourSchedules: HappyHourSchedule[] = [];
  private pricingRules: PricingRule[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MockAdvancedFeaturesService {
    if (!MockAdvancedFeaturesService.instance) {
      MockAdvancedFeaturesService.instance = new MockAdvancedFeaturesService();
    }
    return MockAdvancedFeaturesService.instance;
  }

  private initializeMockData(): void {
    this.staffMembers = [
      {
        id: 'staff_001',
        name: 'John Doe',
        role: 'server',
        status: 'break',
        shift_start: '2:00 PM',
        sales_today: 1247,
        avatar_color: '#1976D2',
      },
      {
        id: 'staff_002',
        name: 'Sarah Kim',
        role: 'cashier',
        status: 'active',
        shift_start: '3:00 PM',
        sales_today: 892,
        avatar_color: '#9C27B0',
      },
      {
        id: 'staff_003',
        name: 'Mike Chen',
        role: 'kitchen',
        status: 'active',
        shift_start: '1:00 PM',
        sales_today: 0,
        avatar_color: '#FF9800',
      },
      {
        id: 'staff_004',
        name: 'Emma Wilson',
        role: 'server',
        status: 'active',
        shift_start: '4:00 PM',
        sales_today: 634,
        avatar_color: '#4CAF50',
      },
    ];

    this.systemAlerts = [
      {
        id: 'alert_001',
        type: 'warning',
        title: 'Kitchen Printer Low Paper',
        message: 'Kitchen printer paper is running low. Please replace soon.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert_002',
        type: 'warning',
        title: 'High Order Volume',
        message: 'Current order volume is 25% above average for this time.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert_003',
        type: 'info',
        title: 'Happy Hour Starting',
        message: 'Happy hour pricing will begin in 15 minutes.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
    ];

    this.happyHourSchedules = [
      {
        id: 'hh_001',
        name: 'Weekday Happy Hour',
        description: '25% off all beverages',
        start_time: '15:00',
        end_time: '18:00',
        days_of_week: [1, 2, 3, 4, 5], // Monday to Friday
        discount_percentage: 25,
        applicable_categories: ['beverages', 'cocktails'],
        is_active: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'hh_002',
        name: 'Weekend Brunch Special',
        description: '15% off total bill',
        start_time: '10:00',
        end_time: '14:00',
        days_of_week: [0, 6], // Saturday and Sunday
        discount_percentage: 15,
        applicable_categories: ['all'],
        is_active: true,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.pricingRules = [
      {
        id: 'rule_001',
        name: 'Lunch Special BOGO',
        type: 'lunch_special',
        discount_type: 'bogo',
        discount_value: 1,
        start_time: '11:00',
        end_time: '15:00',
        days_active: [1, 2, 3, 4, 5],
        applicable_items: ['appetizers'],
        is_active: true,
        priority: 1,
      },
      {
        id: 'rule_002',
        name: 'Senior Citizen Discount',
        type: 'custom',
        discount_type: 'percentage',
        discount_value: 10,
        start_time: '00:00',
        end_time: '23:59',
        days_active: [0, 1, 2, 3, 4, 5, 6],
        applicable_items: ['all'],
        is_active: true,
        priority: 2,
      },
    ];
  }

  async getManagerMetrics(): Promise<ManagerPerformanceMetrics> {
    await this.simulateDelay();
    
    return {
      todays_revenue: 8247,
      revenue_trend: 12,
      orders_processed: 247,
      orders_trend: 8,
      avg_service_time: '12:45',
      service_time_trend: -5,
      staff_on_duty: this.staffMembers.filter(s => s.status !== 'offline').length,
      total_staff: 12,
      active_alerts: this.systemAlerts.filter(a => !a.acknowledged).length,
    };
  }

  async getStaffOnDuty(): Promise<StaffMember[]> {
    await this.simulateDelay();
    return [...this.staffMembers.filter(s => s.status !== 'offline')];
  }

  async getSystemHealth(): Promise<SystemHealthItem[]> {
    await this.simulateDelay();
    
    return [
      {
        name: 'POS System',
        status: 'online',
        details: 'Online',
        icon: '🟢',
      },
      {
        name: 'Payment Gateway',
        status: 'online',
        details: 'Connected',
        icon: '🟢',
      },
      {
        name: 'Network',
        status: 'online',
        details: 'Stable (98ms)',
        icon: '🟢',
      },
      {
        name: 'Kitchen Printer',
        status: 'warning',
        details: 'Low Paper',
        icon: '🟡',
      },
    ];
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    await this.simulateDelay();
    return [...this.systemAlerts];
  }

  async getHappyHourSchedules(): Promise<HappyHourSchedule[]> {
    await this.simulateDelay();
    return [...this.happyHourSchedules];
  }

  async getPricingRules(): Promise<PricingRule[]> {
    await this.simulateDelay();
    return [...this.pricingRules];
  }

  async clockInStaff(staffId: string): Promise<void> {
    await this.simulateDelay();
  }

  async sendStaffBreak(staffId: string): Promise<void> {
    await this.simulateDelay();
    
    const staff = this.staffMembers.find(s => s.id === staffId);
    if (staff) {
      staff.status = staff.status === 'break' ? 'active' : 'break';
    }
  }

  async sendStaffAlert(message: string): Promise<void> {
    await this.simulateDelay();
  }

  async priceOverride(itemId: string, newPrice: number, managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async applyDiscount(orderId: string, discountPercent: number, managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async voidTransaction(transactionId: string, reason: string, managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async compItem(itemId: string, reason: string, managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async forceOpenCashDrawer(managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async backupNow(): Promise<void> {
    await this.simulateDelay(2000);
  }

  async syncData(): Promise<void> {
    await this.simulateDelay(1500);
  }

  async closeBusinessDay(): Promise<void> {
    await this.simulateDelay(3000);
  }

  async generateDailyReport(): Promise<void> {
    await this.simulateDelay(2000);
  }

  async cashCountReconciliation(): Promise<void> {
    await this.simulateDelay(1000);
  }

  async createHappyHourSchedule(schedule: Omit<HappyHourSchedule, 'id' | 'created_at'>): Promise<void> {
    await this.simulateDelay();
    
    const newSchedule: HappyHourSchedule = {
      ...schedule,
      id: `hh_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    this.happyHourSchedules.push(newSchedule);
  }

  async updateHappyHourSchedule(id: string, schedule: Partial<HappyHourSchedule>): Promise<void> {
    await this.simulateDelay();
    
    const index = this.happyHourSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.happyHourSchedules[index] = { ...this.happyHourSchedules[index], ...schedule };
    }
  }

  async toggleHappyHour(id: string, active: boolean): Promise<void> {
    await this.simulateDelay();
    
    const schedule = this.happyHourSchedules.find(s => s.id === id);
    if (schedule) {
      schedule.is_active = active;
    }
  }

  async overridePricing(managerPin: string): Promise<void> {
    await this.simulateDelay();
    if (managerPin !== '1234') {
      throw new Error('Invalid manager PIN');
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.simulateDelay();
    
    const alert = this.systemAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}