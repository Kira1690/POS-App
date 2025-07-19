import { UserRole } from '@/types';

export interface DummyUser {
  id: string;
  email?: string;
  employeeId?: string;
  password: string;
  name: string;
  role: UserRole;
  restaurantId: string;
  restaurantName: string;
  isActive: boolean;
}

// Dummy credentials for testing UI flows
// TODO: Remove this when backend integration is complete
export const DUMMY_CREDENTIALS: DummyUser[] = [
  // Restaurant Staff
  {
    id: 'staff_001',
    employeeId: 'EMP001',
    password: 'staff123',
    name: 'John Doe',
    role: UserRole.RESTAURANT_STAFF,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
  },
  {
    id: 'staff_002',
    employeeId: 'EMP002',
    password: 'staff456',
    name: 'Jane Smith',
    role: UserRole.RESTAURANT_STAFF,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
  },
  
  // Kitchen Staff
  {
    id: 'kitchen_001',
    employeeId: 'CHEF001',
    password: 'kitchen123',
    name: 'Chef Mike Wilson',
    role: UserRole.KITCHEN_STAFF,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
  },
  {
    id: 'kitchen_002',
    employeeId: 'CHEF002',
    password: 'kitchen456',
    name: 'Chef Sarah Brown',
    role: UserRole.KITCHEN_STAFF,
    restaurantId: 'rest_002',
    restaurantName: 'Pizza Palace',
    isActive: true,
  },
  
  // Managers
  {
    id: 'manager_001',
    email: 'manager@foodcorner.com',
    password: 'manager123',
    name: 'Alice Johnson',
    role: UserRole.MANAGER,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
  },
  {
    id: 'manager_002',
    email: 'manager@pizzapalace.com',
    password: 'manager456',
    name: 'Bob Martinez',
    role: UserRole.MANAGER,
    restaurantId: 'rest_002',
    restaurantName: 'Pizza Palace',
    isActive: true,
  },
  
  // Admins
  {
    id: 'admin_001',
    email: 'admin@foodcorner.com',
    password: 'admin123',
    name: 'David Admin',
    role: UserRole.ADMIN,
    restaurantId: 'rest_001',
    restaurantName: 'The Food Corner',
    isActive: true,
  },
  {
    id: 'admin_002',
    email: 'admin@pizzapalace.com',
    password: 'admin456',
    name: 'Emma Administrator',
    role: UserRole.ADMIN,
    restaurantId: 'rest_002',
    restaurantName: 'Pizza Palace',
    isActive: true,
  },
  
  // Superadmin
  {
    id: 'superadmin_001',
    email: 'superadmin@foodpos.com',
    password: 'super123',
    name: 'System Superadmin',
    role: UserRole.SUPERADMIN,
    restaurantId: 'rest_001', // Default restaurant
    restaurantName: 'FoodPOS System',
    isActive: true,
  },
];

// Dummy restaurants for multi-restaurant testing
export const DUMMY_RESTAURANTS = [
  {
    id: 'rest_001',
    name: 'The Food Corner',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    isActive: true,
  },
  {
    id: 'rest_002',
    name: 'Pizza Palace',
    address: '456 Oak Avenue, City, State 12345',
    phone: '+1 (555) 987-6543',
    isActive: true,
  },
  {
    id: 'rest_003',
    name: 'Burger House',
    address: '789 Pine Street, City, State 12345',
    phone: '+1 (555) 456-7890',
    isActive: true,
  },
];

// Helper function to find user by credentials
export const findUserByCredentials = (
  identifier: string,
  password: string,
  isStaffLogin: boolean = false
): DummyUser | null => {
  return DUMMY_CREDENTIALS.find(user => {
    if (isStaffLogin) {
      // Staff login uses employee ID
      return user.employeeId === identifier && user.password === password && user.isActive;
    } else {
      // Manager/Admin login uses email
      return user.email === identifier && user.password === password && user.isActive;
    }
  }) || null;
};

// Helper function to get restaurants for a superadmin
export const getRestaurantsForSuperadmin = () => {
  return DUMMY_RESTAURANTS.filter(restaurant => restaurant.isActive);
};

// Dummy JWT tokens for testing
export const generateDummyTokens = (user: DummyUser) => ({
  accessToken: `dummy_access_token_${user.id}_${Date.now()}`,
  refreshToken: `dummy_refresh_token_${user.id}_${Date.now()}`,
  expiresIn: 3600, // 1 hour
});