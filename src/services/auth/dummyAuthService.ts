import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenResponse,
  User,
  Restaurant,
  UserRole 
} from '@/types';
import { 
  DUMMY_CREDENTIALS, 
  DUMMY_RESTAURANTS, 
  findUserByCredentials,
  getRestaurantsForSuperadmin,
  generateDummyTokens,
  DummyUser
} from '@/constants/dummyData';

// TODO: Remove this dummy service when backend is integrated
export class DummyAuthService {
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
      email: user.email || '',
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      isActive: user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeId: user.employeeId,
    };

    const restaurant: Restaurant = {
      id: user.restaurantId,
      name: user.restaurantName,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      email: this.currentUser.email || '',
      name: this.currentUser.name,
      role: this.currentUser.role,
      restaurantId: this.currentUser.restaurantId,
      isActive: this.currentUser.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      employeeId: this.currentUser.employeeId,
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