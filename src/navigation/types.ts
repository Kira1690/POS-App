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
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Kitchen: NavigatorScreenParams<KitchenStackParamList>;
  Settings: undefined;
};

export type DashboardStackParamList = {
  Overview: undefined;
  OrdersDashboard: undefined;
  TablesDashboard: undefined;
  KitchenDashboard: undefined;
  ReportsDashboard: undefined;
  // Fallback screens
  OrderManagement: undefined;
  TableManagement: undefined;
  KitchenDisplay: undefined;
  Reports: undefined;
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
    editOrderId?: string;  // NEW: if set, editing an existing order
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
    editOrderId?: string;  // if set, editing an existing order (add more items)
  };
  // Enhanced ordering screen with 3-panel layout
  Ordering: {
    tableId: string;
    tableName: string;
    guestCount?: number;
    existingOrderId?: string;
  };
  // Bill screen with splitting options
  Bill: {
    orderId: string;
    order?: any;
  };
  // Bill split screen
  BillSplit: {
    orderId: string;
    splitType: 'equal' | 'by_items' | 'by_payment_method';
    guestCount?: number;
  };
  PaymentProcessing: {
    order: any;
    orderId: string;
    splitId?: string;
    guestIndex?: number;
    splitPayment?: {
      guestId: string;
      guestName: string;
      amount: number;
    };
    splitPayments?: Array<{
      id: string;
      method: string;
      amount: number;
      status: string;
    }>;
  };
  PaymentConfirmation: {
    payment: any;
    order: any;
    orderId: string;
    splitId?: string;
    splitPayment?: {
      guestId: string;
      guestName: string;
      amount: number;
    };
  };
  // Receipt screen
  Receipt: {
    orderId: string;
    paymentId?: string;
    receiptId?: string;
    payment?: any;
    order?: any;
  };
};

// Kitchen operations stack
export type KitchenStackParamList = {
  KitchenDisplay: undefined;
  // Enhanced Kanban-style kitchen display
  KitchenKanban: {
    station?: 'hot_kitchen' | 'cold_kitchen' | 'grill' | 'desserts' | 'beverages' | 'bar';
  };
  // Ticket details view
  TicketDetails: {
    ticketId: string;
  };
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

// Enhanced Order Management screen params
export type OrderingScreenParams = OrdersStackParamList['Ordering'];
export type BillScreenParams = OrdersStackParamList['Bill'];
export type BillSplitScreenParams = OrdersStackParamList['BillSplit'];
export type ReceiptScreenParams = OrdersStackParamList['Receipt'];

// Kitchen screen params
export type KitchenKanbanScreenParams = KitchenStackParamList['KitchenKanban'];
export type TicketDetailsScreenParams = KitchenStackParamList['TicketDetails'];