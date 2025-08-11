import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Welcome: undefined;
  StaffLogin: undefined;
  ManagerLogin: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Tables: NavigatorScreenParams<TablesStackParamList>;
  Kitchen: NavigatorScreenParams<KitchenStackParamList>;
  Menu: undefined;
  Settings: undefined;
};

export type TablesStackParamList = {
  TableManagement: undefined;
  POSOrder: {
    table: {
      id: string;
      table_number: string;
      capacity: number;
      status: string;
      restaurant_id: string;
      created_at: string;
      updated_at: string;
      location?: string;
      section?: string;
      current_order_id?: string;
      reserved_until?: string;
      last_cleaned?: string;
      notes?: string;
    };
  };
};

// Professional order management stack
export type OrdersStackParamList = {
  OrderManagement: undefined;
  OrderDetails: {
    orderId: string;
  };
  POSOrder: {
    table?: {
      id: string;
      table_number: string;
      capacity: number;
      status: string;
      restaurant_id: string;
      created_at: string;
      updated_at: string;
      location?: string;
      section?: string;
      current_order_id?: string;
      reserved_until?: string;
      last_cleaned?: string;
      notes?: string;
    };
  };
  PaymentProcessing: {
    order: any;
    orderId: string;
  };
  PaymentConfirmation: {
    payment: any;
    order: any;
    orderId: string;
  };
};

// Kitchen operations stack
export type KitchenStackParamList = {
  KitchenDisplay: undefined;
  OrderDetails: {
    orderId: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Export individual param types for easier access
export type OrderDetailsScreenParams = OrdersStackParamList['OrderDetails'];
export type POSOrderScreenParams = OrdersStackParamList['POSOrder'];
export type TablePOSOrderScreenParams = TablesStackParamList['POSOrder'];