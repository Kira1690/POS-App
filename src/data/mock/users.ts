/**
 * Mock User Data
 * Enhanced user data based on existing dummy data but with additional information
 */

import { UserRole } from '@/types/auth.types';

export interface MockUser {
  id: string;
  email?: string;
  employeeId?: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  employment: {
    hireDate: string;
    department: string;
    position: string;
    status: 'active' | 'inactive' | 'terminated' | 'on-leave';
    hourlyRate?: number;
    salary?: number;
    benefits: string[];
  };
  permissions: string[];
  preferences: {
    language: 'en' | 'es' | 'fr';
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  schedule?: {
    monday?: { start: string; end: string; };
    tuesday?: { start: string; end: string; };
    wednesday?: { start: string; end: string; };
    thursday?: { start: string; end: string; };
    friday?: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
  };
  performance?: {
    rating: number;
    reviewDate: string;
    strengths: string[];
    improvements: string[];
    goals: string[];
  };
  training: {
    completed: string[];
    inProgress: string[];
    required: string[];
    certifications: {
      name: string;
      issueDate: string;
      expiryDate: string;
      isValid: boolean;
    }[];
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Enhanced user data with comprehensive information
export const MOCK_USERS: MockUser[] = [
  // Restaurant Staff
  {
    id: 'staff_001',
    employeeId: 'EMP001',
    password: 'staff123',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.WAITER,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-0001',
    address: {
      street: '789 Staff Lane',
      city: 'Cityville',
      state: 'CA',
      zipCode: '12345',
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-0002',
    },
    employment: {
      hireDate: '2024-06-15',
      department: 'Service',
      position: 'Senior Server',
      status: 'active',
      hourlyRate: 18.50,
      benefits: ['Health Insurance', 'Paid Time Off', 'Employee Meals', '401k'],
    },
    permissions: ['pos_access', 'table_management', 'customer_service', 'order_taking'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'light',
    },
    schedule: {
      monday: { start: '9:00 AM', end: '6:00 PM' },
      tuesday: { start: '9:00 AM', end: '6:00 PM' },
      wednesday: { start: '9:00 AM', end: '6:00 PM' },
      thursday: { start: '9:00 AM', end: '6:00 PM' },
      friday: { start: '9:00 AM', end: '6:00 PM' },
    },
    performance: {
      rating: 4.8,
      reviewDate: '2025-08-15',
      strengths: ['Customer service', 'Team collaboration', 'Attention to detail'],
      improvements: ['Upselling techniques', 'Wine knowledge'],
      goals: ['Complete sommelier training', 'Mentor new staff'],
    },
    training: {
      completed: ['Customer Service Excellence', 'POS System Training', 'Food Safety Basics'],
      inProgress: ['Wine Fundamentals'],
      required: ['Advanced Customer Service'],
      certifications: [
        {
          name: 'Food Safety Handler',
          issueDate: '2024-09-01',
          expiryDate: '2026-09-01',
          isValid: true,
        },
      ],
    },
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T09:15:00Z',
  },

  {
    id: 'staff_002',
    employeeId: 'EMP002',
    password: 'staff456',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.WAITER,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-0003',
    address: {
      street: '456 Server Street',
      city: 'Cityville',
      state: 'CA',
      zipCode: '12345',
    },
    emergencyContact: {
      name: 'Robert Smith',
      relationship: 'Father',
      phone: '+1 (555) 123-0004',
    },
    employment: {
      hireDate: '2024-07-01',
      department: 'Service',
      position: 'Server',
      status: 'active',
      hourlyRate: 17.50,
      benefits: ['Health Insurance', 'Paid Time Off', 'Employee Meals'],
    },
    permissions: ['pos_access', 'table_management', 'customer_service', 'order_taking'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'light',
    },
    schedule: {
      tuesday: { start: '10:00 AM', end: '7:00 PM' },
      wednesday: { start: '10:00 AM', end: '7:00 PM' },
      thursday: { start: '10:00 AM', end: '7:00 PM' },
      friday: { start: '10:00 AM', end: '7:00 PM' },
      saturday: { start: '10:00 AM', end: '7:00 PM' },
    },
    performance: {
      rating: 4.6,
      reviewDate: '2025-08-01',
      strengths: ['Punctuality', 'Menu knowledge', 'Teamwork'],
      improvements: ['Speed of service', 'Conflict resolution'],
      goals: ['Improve service speed', 'Learn bartending skills'],
    },
    training: {
      completed: ['POS System Training', 'Food Safety Basics'],
      inProgress: ['Customer Service Excellence'],
      required: ['Alcohol Service Certification'],
      certifications: [
        {
          name: 'Food Safety Handler',
          issueDate: '2024-07-15',
          expiryDate: '2026-07-15',
          isValid: true,
        },
      ],
    },
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T08:45:00Z',
  },

  // Kitchen Staff
  {
    id: 'kitchen_001',
    employeeId: 'CHEF001',
    password: 'kitchen123',
    name: 'Chef Mike Wilson',
    firstName: 'Mike',
    lastName: 'Wilson',
    role: UserRole.KITCHEN_STAFF,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-0005',
    address: {
      street: '321 Chef Avenue',
      city: 'Cityville',
      state: 'CA',
      zipCode: '12345',
    },
    emergencyContact: {
      name: 'Lisa Wilson',
      relationship: 'Spouse',
      phone: '+1 (555) 123-0006',
    },
    employment: {
      hireDate: '2023-03-15',
      department: 'Kitchen',
      position: 'Head Chef',
      status: 'active',
      salary: 65000,
      benefits: ['Health Insurance', 'Paid Time Off', 'Employee Meals', '401k', 'Professional Development'],
    },
    permissions: ['kitchen_access', 'inventory_management', 'menu_management', 'staff_supervision', 'order_management'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'dark',
    },
    schedule: {
      monday: { start: '8:00 AM', end: '5:00 PM' },
      tuesday: { start: '8:00 AM', end: '5:00 PM' },
      wednesday: { start: '8:00 AM', end: '5:00 PM' },
      thursday: { start: '8:00 AM', end: '5:00 PM' },
      friday: { start: '8:00 AM', end: '6:00 PM' },
      saturday: { start: '10:00 AM', end: '8:00 PM' },
    },
    performance: {
      rating: 4.9,
      reviewDate: '2025-03-15',
      strengths: ['Leadership', 'Culinary expertise', 'Innovation', 'Team management'],
      improvements: ['Cost control', 'Inventory efficiency'],
      goals: ['Reduce food waste by 10%', 'Train 3 new kitchen staff'],
    },
    training: {
      completed: ['ServSafe Manager', 'Kitchen Leadership', 'HACCP Training', 'Cost Control'],
      inProgress: ['Sustainable Cooking Practices'],
      required: [],
      certifications: [
        {
          name: 'ServSafe Manager',
          issueDate: '2024-03-01',
          expiryDate: '2029-03-01',
          isValid: true,
        },
        {
          name: 'HACCP Certification',
          issueDate: '2024-01-15',
          expiryDate: '2027-01-15',
          isValid: true,
        },
      ],
    },
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T07:30:00Z',
  },

  // Managers
  {
    id: 'manager_001',
    email: 'manager@foodcorner.com',
    password: 'manager123',
    name: 'Alice Johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: UserRole.MANAGER,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-0007',
    address: {
      street: '123 Manager Drive',
      city: 'Cityville',
      state: 'CA',
      zipCode: '12345',
    },
    emergencyContact: {
      name: 'Tom Johnson',
      relationship: 'Spouse',
      phone: '+1 (555) 123-0008',
    },
    employment: {
      hireDate: '2022-01-15',
      department: 'Management',
      position: 'Restaurant Manager',
      status: 'active',
      salary: 75000,
      benefits: ['Health Insurance', 'Paid Time Off', 'Employee Meals', '401k', 'Professional Development', 'Management Bonus'],
    },
    permissions: ['all_access', 'staff_management', 'financial_reports', 'inventory_management', 'menu_management', 'schedule_management'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'auto',
    },
    schedule: {
      monday: { start: '8:00 AM', end: '6:00 PM' },
      tuesday: { start: '8:00 AM', end: '6:00 PM' },
      wednesday: { start: '8:00 AM', end: '6:00 PM' },
      thursday: { start: '8:00 AM', end: '6:00 PM' },
      friday: { start: '8:00 AM', end: '7:00 PM' },
      saturday: { start: '9:00 AM', end: '8:00 PM' },
    },
    performance: {
      rating: 4.7,
      reviewDate: '2025-01-15',
      strengths: ['Leadership', 'Financial management', 'Staff development', 'Customer relations'],
      improvements: ['Work-life balance', 'Delegation'],
      goals: ['Increase revenue by 15%', 'Reduce staff turnover by 20%', 'Implement new training program'],
    },
    training: {
      completed: ['Management Fundamentals', 'Financial Management', 'HR Basics', 'Customer Service Leadership'],
      inProgress: ['Advanced Analytics'],
      required: [],
      certifications: [
        {
          name: 'Restaurant Management Certificate',
          issueDate: '2022-06-01',
          expiryDate: '2027-06-01',
          isValid: true,
        },
      ],
    },
    createdAt: '2022-01-15T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T07:00:00Z',
  },

  // Admin
  {
    id: 'admin_001',
    email: 'admin@foodcorner.com',
    password: 'admin123',
    name: 'David Admin',
    firstName: 'David',
    lastName: 'Admin',
    role: UserRole.STORE_ADMIN,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    phone: '+1 (555) 123-0009',
    employment: {
      hireDate: '2021-05-01',
      department: 'Administration',
      position: 'System Administrator',
      status: 'active',
      salary: 80000,
      benefits: ['Health Insurance', 'Paid Time Off', 'Employee Meals', '401k', 'Professional Development', 'Tech Allowance'],
    },
    permissions: ['system_admin', 'all_access', 'user_management', 'system_configuration', 'backup_restore', 'security_management'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'dark',
    },
    training: {
      completed: ['System Administration', 'Security Fundamentals', 'Database Management'],
      inProgress: ['Advanced Security'],
      required: [],
      certifications: [
        {
          name: 'System Administrator Certification',
          issueDate: '2021-08-01',
          expiryDate: '2026-08-01',
          isValid: true,
        },
      ],
    },
    createdAt: '2021-05-01T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T06:45:00Z',
  },

  // Superadmin
  {
    id: 'superadmin_001',
    email: 'superadmin@foodpos.com',
    password: 'super123',
    name: 'System Superadmin',
    firstName: 'System',
    lastName: 'Superadmin',
    role: UserRole.SUPER_ADMIN,
    restaurantId: 'rest_001', // Default restaurant
    restaurantName: 'FoodPOS System',
    isActive: true,
    employment: {
      hireDate: '2020-01-01',
      department: 'System Administration',
      position: 'System Superadmin',
      status: 'active',
      salary: 120000,
      benefits: ['Full Benefits Package'],
    },
    permissions: ['superadmin_access', 'multi_restaurant_access', 'system_configuration', 'global_reports'],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      theme: 'dark',
    },
    training: {
      completed: ['System Architecture', 'Multi-tenant Management'],
      inProgress: [],
      required: [],
      certifications: [],
    },
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2025-09-23T10:30:00Z',
    lastLogin: '2025-09-23T06:00:00Z',
  },
];

// Utility functions
export const findUserByCredentials = (
  identifier: string,
  password: string,
  isStaffLogin: boolean = false
): MockUser | null => {
  return MOCK_USERS.find(user => {
    if (isStaffLogin) {
      // Staff login uses employee ID
      return user.employeeId === identifier && user.password === password && user.isActive;
    } else {
      // Manager/Admin login uses email
      return user.email === identifier && user.password === password && user.isActive;
    }
  }) || null;
};

export const getUserById = (id: string): MockUser | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getUsersByRestaurant = (restaurantId: string): MockUser[] => {
  return MOCK_USERS.filter(user => user.restaurantId === restaurantId && user.isActive);
};

export const getUsersByRole = (role: UserRole): MockUser[] => {
  return MOCK_USERS.filter(user => user.role === role && user.isActive);
};

export const getActiveUsers = (): MockUser[] => {
  return MOCK_USERS.filter(user => user.isActive);
};

export const getUsersForSuperadmin = () => {
  // Superadmin can see users from all restaurants
  return MOCK_USERS.filter(user => user.isActive);
};

export const generateDummyTokens = (user: MockUser) => ({
  accessToken: `dummy_access_token_${user.id}_${Date.now()}`,
  refreshToken: `dummy_refresh_token_${user.id}_${Date.now()}`,
  expiresIn: 3600, // 1 hour
});

export const getUserPermissions = (user: MockUser): string[] => {
  return user.permissions;
};

export const hasPermission = (user: MockUser, permission: string): boolean => {
  return user.permissions.includes(permission) || user.permissions.includes('all_access') || user.permissions.includes('superadmin_access');
};

export default MOCK_USERS;