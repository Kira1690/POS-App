/**
 * Mock Restaurant Data
 * Comprehensive restaurant information for multi-restaurant support
 */

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  isActive: boolean;
  type: 'fast-casual' | 'fine-dining' | 'cafe' | 'pizzeria' | 'asian' | 'american';
  cuisine: string[];
  capacity: {
    seatingCapacity: number;
    tableCount: number;
    privateRooms: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  features: string[];
  paymentMethods: string[];
  taxRate: number;
  timezone: string;
  manager: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  settings: {
    allowOnlineOrders: boolean;
    allowReservations: boolean;
    autoAcceptOrders: boolean;
    requireCustomerInfo: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    theme: 'light' | 'dark';
  };
}

// Sample restaurants for testing
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_001',
    name: 'The Food Corner',
    address: '123 Main Street',
    city: 'Cityville',
    state: 'CA',
    zipCode: '12345',
    phone: '+1 (555) 123-4567',
    email: 'info@foodcorner.com',
    website: 'https://foodcorner.com',
    isActive: true,
    type: 'fine-dining',
    cuisine: ['American', 'Continental', 'Mediterranean'],
    capacity: {
      seatingCapacity: 120,
      tableCount: 25,
      privateRooms: 2,
    },
    operatingHours: {
      monday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      tuesday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      wednesday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      thursday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      friday: { open: '11:00 AM', close: '11:00 PM', isOpen: true },
      saturday: { open: '10:00 AM', close: '11:00 PM', isOpen: true },
      sunday: { open: '10:00 AM', close: '9:00 PM', isOpen: true },
    },
    features: [
      'Wi-Fi',
      'Parking Available',
      'Wheelchair Accessible',
      'Outdoor Seating',
      'Private Dining',
      'Full Bar',
      'Live Music',
    ],
    paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay', 'Gift Cards'],
    taxRate: 8.75,
    timezone: 'America/Los_Angeles',
    manager: {
      id: 'manager_001',
      name: 'Alice Johnson',
      email: 'alice@foodcorner.com',
      phone: '+1 (555) 123-4568',
    },
    settings: {
      allowOnlineOrders: true,
      allowReservations: true,
      autoAcceptOrders: false,
      requireCustomerInfo: true,
    },
    branding: {
      primaryColor: '#1A1D21',
      secondaryColor: '#007bff',
      theme: 'light',
    },
  },
  {
    id: 'rest_002',
    name: 'Pizza Palace',
    address: '456 Oak Avenue',
    city: 'Cityville',
    state: 'CA',
    zipCode: '12346',
    phone: '+1 (555) 987-6543',
    email: 'info@pizzapalace.com',
    website: 'https://pizzapalace.com',
    isActive: true,
    type: 'pizzeria',
    cuisine: ['Italian', 'Pizza', 'Mediterranean'],
    capacity: {
      seatingCapacity: 80,
      tableCount: 18,
      privateRooms: 1,
    },
    operatingHours: {
      monday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      tuesday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      wednesday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      thursday: { open: '11:00 AM', close: '10:00 PM', isOpen: true },
      friday: { open: '11:00 AM', close: '11:00 PM', isOpen: true },
      saturday: { open: '11:00 AM', close: '11:00 PM', isOpen: true },
      sunday: { open: '12:00 PM', close: '9:00 PM', isOpen: true },
    },
    features: [
      'Wi-Fi',
      'Delivery Available',
      'Takeout',
      'Family Friendly',
      'Parking Available',
      'Wheelchair Accessible',
    ],
    paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'],
    taxRate: 8.75,
    timezone: 'America/Los_Angeles',
    manager: {
      id: 'manager_002',
      name: 'Bob Martinez',
      email: 'bob@pizzapalace.com',
      phone: '+1 (555) 987-6544',
    },
    settings: {
      allowOnlineOrders: true,
      allowReservations: false,
      autoAcceptOrders: true,
      requireCustomerInfo: false,
    },
    branding: {
      primaryColor: '#dc3545',
      secondaryColor: '#ffc107',
      theme: 'light',
    },
  },
  {
    id: 'rest_003',
    name: 'Burger House',
    address: '789 Pine Street',
    city: 'Cityville',
    state: 'CA',
    zipCode: '12347',
    phone: '+1 (555) 456-7890',
    email: 'info@burgerhouse.com',
    isActive: true,
    type: 'fast-casual',
    cuisine: ['American', 'Burgers', 'Fast Food'],
    capacity: {
      seatingCapacity: 60,
      tableCount: 15,
      privateRooms: 0,
    },
    operatingHours: {
      monday: { open: '10:00 AM', close: '9:00 PM', isOpen: true },
      tuesday: { open: '10:00 AM', close: '9:00 PM', isOpen: true },
      wednesday: { open: '10:00 AM', close: '9:00 PM', isOpen: true },
      thursday: { open: '10:00 AM', close: '9:00 PM', isOpen: true },
      friday: { open: '10:00 AM', close: '10:00 PM', isOpen: true },
      saturday: { open: '10:00 AM', close: '10:00 PM', isOpen: true },
      sunday: { open: '11:00 AM', close: '8:00 PM', isOpen: true },
    },
    features: [
      'Wi-Fi',
      'Drive-Through',
      'Takeout',
      'Quick Service',
      'Parking Available',
    ],
    paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay'],
    taxRate: 8.75,
    timezone: 'America/Los_Angeles',
    manager: {
      id: 'manager_003',
      name: 'Carol Wilson',
      email: 'carol@burgerhouse.com',
      phone: '+1 (555) 456-7891',
    },
    settings: {
      allowOnlineOrders: true,
      allowReservations: false,
      autoAcceptOrders: true,
      requireCustomerInfo: false,
    },
    branding: {
      primaryColor: '#28a745',
      secondaryColor: '#ffc107',
      theme: 'light',
    },
  },
  {
    id: 'rest_004',
    name: 'Sakura Sushi',
    address: '321 Bamboo Lane',
    city: 'Cityville',
    state: 'CA',
    zipCode: '12348',
    phone: '+1 (555) 654-3210',
    email: 'info@sakurasushi.com',
    website: 'https://sakurasushi.com',
    isActive: true,
    type: 'asian',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    capacity: {
      seatingCapacity: 90,
      tableCount: 20,
      privateRooms: 3,
    },
    operatingHours: {
      monday: { open: '5:00 PM', close: '10:00 PM', isOpen: true },
      tuesday: { open: '5:00 PM', close: '10:00 PM', isOpen: true },
      wednesday: { open: '5:00 PM', close: '10:00 PM', isOpen: true },
      thursday: { open: '5:00 PM', close: '10:00 PM', isOpen: true },
      friday: { open: '5:00 PM', close: '11:00 PM', isOpen: true },
      saturday: { open: '12:00 PM', close: '11:00 PM', isOpen: true },
      sunday: { open: '12:00 PM', close: '9:00 PM', isOpen: true },
    },
    features: [
      'Wi-Fi',
      'Sushi Bar',
      'Sake Bar',
      'Private Dining',
      'Wheelchair Accessible',
      'Valet Parking',
    ],
    paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Pay', 'Gift Cards'],
    taxRate: 8.75,
    timezone: 'America/Los_Angeles',
    manager: {
      id: 'manager_004',
      name: 'Takeshi Yamamoto',
      email: 'takeshi@sakurasushi.com',
      phone: '+1 (555) 654-3211',
    },
    settings: {
      allowOnlineOrders: true,
      allowReservations: true,
      autoAcceptOrders: false,
      requireCustomerInfo: true,
    },
    branding: {
      primaryColor: '#6610f2',
      secondaryColor: '#fd7e14',
      theme: 'dark',
    },
  },
  {
    id: 'rest_005',
    name: 'Brew & Bites Cafe',
    address: '567 Coffee Street',
    city: 'Cityville',
    state: 'CA',
    zipCode: '12349',
    phone: '+1 (555) 789-0123',
    email: 'hello@brewbites.com',
    website: 'https://brewbites.com',
    isActive: false, // Temporarily closed
    type: 'cafe',
    cuisine: ['Coffee', 'Breakfast', 'Light Meals'],
    capacity: {
      seatingCapacity: 45,
      tableCount: 12,
      privateRooms: 0,
    },
    operatingHours: {
      monday: { open: '6:00 AM', close: '6:00 PM', isOpen: false },
      tuesday: { open: '6:00 AM', close: '6:00 PM', isOpen: false },
      wednesday: { open: '6:00 AM', close: '6:00 PM', isOpen: false },
      thursday: { open: '6:00 AM', close: '6:00 PM', isOpen: false },
      friday: { open: '6:00 AM', close: '8:00 PM', isOpen: false },
      saturday: { open: '7:00 AM', close: '8:00 PM', isOpen: false },
      sunday: { open: '7:00 AM', close: '5:00 PM', isOpen: false },
    },
    features: [
      'Wi-Fi',
      'Coffee Shop',
      'Study Space',
      'Outdoor Seating',
      'Pet Friendly',
    ],
    paymentMethods: ['Cash', 'Credit Card', 'Mobile Pay'],
    taxRate: 8.75,
    timezone: 'America/Los_Angeles',
    manager: {
      id: 'manager_005',
      name: 'Emma Thompson',
      email: 'emma@brewbites.com',
      phone: '+1 (555) 789-0124',
    },
    settings: {
      allowOnlineOrders: false,
      allowReservations: false,
      autoAcceptOrders: false,
      requireCustomerInfo: false,
    },
    branding: {
      primaryColor: '#20c997',
      secondaryColor: '#ffc107',
      theme: 'light',
    },
  },
];

// Utility functions
export const getRestaurantById = (id: string): Restaurant | undefined => {
  return MOCK_RESTAURANTS.find(restaurant => restaurant.id === id);
};

export const getActiveRestaurants = (): Restaurant[] => {
  return MOCK_RESTAURANTS.filter(restaurant => restaurant.isActive);
};

export const getRestaurantsByType = (type: string): Restaurant[] => {
  return MOCK_RESTAURANTS.filter(restaurant => restaurant.type === type);
};

export const getRestaurantsByCuisine = (cuisine: string): Restaurant[] => {
  return MOCK_RESTAURANTS.filter(restaurant =>
    restaurant.cuisine.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
  );
};

export const isRestaurantOpen = (restaurant: Restaurant, day?: string): boolean => {
  if (!restaurant.isActive) return false;

  const today = day || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const schedule = restaurant.operatingHours[today];

  return schedule ? schedule.isOpen : false;
};

export const getRestaurantCurrentStatus = (restaurant: Restaurant) => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const schedule = restaurant.operatingHours[currentDay];

  if (!restaurant.isActive) {
    return { status: 'closed', reason: 'Restaurant temporarily closed' };
  }

  if (!schedule || !schedule.isOpen) {
    return { status: 'closed', reason: 'Closed today' };
  }

  // Simple time comparison (in a real app, you'd handle timezones properly)
  return { status: 'open', message: `Open until ${schedule.close}` };
};

export default MOCK_RESTAURANTS;