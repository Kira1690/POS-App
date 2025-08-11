import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenResponse,
  User,
  Restaurant,
  UserRole 
} from '@/types';
import { 
  IAuthService,
  RegisterUserRequest,
  UpdateProfileRequest, 
  UpdatePasswordRequest
} from '@/interfaces';
import { SessionInfo } from '@/types/api.types';
import { 
  DUMMY_CREDENTIALS, 
  DUMMY_RESTAURANTS, 
  findUserByCredentials,
  getRestaurantsForSuperadmin,
  generateDummyTokens,
  DummyUser
} from '@/constants/dummyData';

// TODO: Remove this dummy service when backend is integrated
export class DummyAuthService implements IAuthService {
  private currentUser: DummyUser | null = null;

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { identifier, password, isStaffLogin } = credentials;
    
    const user = findUserByCredentials(identifier, password, isStaffLogin);
    
    if (!user) {
      throw new Error('Invalid credentials. Please check your login details.');
    }

    this.currentUser = user;
    const tokens = generateDummyTokens(user);

    // Convert DummyUser to User type
    const userData: User = {
      id: user.id,
      first_name: user.name.split(' ')[0] || user.name,
      last_name: user.name.split(' ')[1] || '',
      email: user.email || '',
      phone_number: '+1234567890', // Mock phone number
      role: user.role,
      employee_id: user.employeeId,
      default_restaurant_id: user.restaurantId,
      is_active: user.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const restaurant: Restaurant = {
      id: user.restaurantId,
      name: user.restaurantName,
      address: '123 Main Street, City, State 12345',
      phone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      is_active: true,
    };

    return {
      user: userData,
      restaurant,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = null;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('No active session');
    }

    const tokens = generateDummyTokens(this.currentUser);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  async getProfile(): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    return {
      id: this.currentUser.id,
      first_name: this.currentUser.name.split(' ')[0] || this.currentUser.name,
      last_name: this.currentUser.name.split(' ')[1] || '',
      email: this.currentUser.email || '',
      phone_number: '+1234567890', // Mock phone number
      role: this.currentUser.role,
      employee_id: this.currentUser.employeeId,
      default_restaurant_id: this.currentUser.restaurantId,
      is_active: this.currentUser.isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (this.currentUser.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // In real implementation, this would update the password
    console.log('Password would be changed to:', newPassword);
  }

  async getUserRestaurants(): Promise<Restaurant[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (this.currentUser.role === UserRole.SUPERADMIN) {
      return getRestaurantsForSuperadmin().map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        isActive: restaurant.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        address: restaurant.address,
        phone: restaurant.phone,
      }));
    }

    // For other roles, return only their restaurant
    const restaurant = DUMMY_RESTAURANTS.find(r => r.id === this.currentUser!.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    return [{
      id: restaurant.id,
      name: restaurant.name,
      isActive: restaurant.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      address: restaurant.address,
      phone: restaurant.phone,
    }];
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async register(userData: RegisterUserRequest): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration - in real implementation would create user
    const newUser: User = {
      id: `user_${Date.now()}`,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone_number: userData.phone_number,
      role: userData.role || UserRole.RESTAURANT_STAFF,
      default_restaurant_id: 'rest_001', // Default restaurant for demo
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newUser;
  }

  async updateProfile(userData: UpdateProfileRequest): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Mock profile update
    return this.getProfile();
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (this.currentUser.password !== passwordData.currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Mock password update
    console.log('Password would be updated in real implementation');
  }

  async getSessions(): Promise<SessionInfo[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Mock session data
    return [{
      id: 'session_1',
      deviceInfo: 'Mobile App',
      ipAddress: '192.168.1.100',
      lastActive: new Date().toISOString(),
      isCurrentSession: true,
    }];
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    console.log('Session would be revoked:', sessionId);
  }

  async revokeOtherSessions(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    console.log('Other sessions would be revoked');
  }

  async revokeAllSessions(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    this.currentUser = null;
    console.log('All sessions would be revoked');
  }

  // Helper method to get current user for development/testing
  getCurrentUser(): DummyUser | null {
    return this.currentUser;
  }

  // Helper method to set current user (for testing)
  setCurrentUser(user: DummyUser | null): void {
    this.currentUser = user;
  }
}

export const dummyAuthService = new DummyAuthService();