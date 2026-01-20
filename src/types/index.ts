// Re-export all types for easier imports
export * from './auth.types';
export * from './api.types';
export * from './common.types';
export * from './table.types';
export * from './menu.types';

// Order types - selectively export from order.types to avoid duplicate PaginatedResponse
// then selectively from order-extended.types to avoid duplicate UpdateOrderStatusRequest/UpdateOrderItemStatusRequest
export {
  OrderItemStatus,
  OrderItemModifier,
  OrderItem,
  Order,
  Payment,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  UpdateOrderItemStatusRequest,
  OrderFilterOptions,
  OrderManagementState,
  KitchenOrder,
  CancelOrderRequest,
  // Note: PaginatedResponse is excluded - use the one from common.types
} from './order.types';
export {
  // Kitchen Station types
  KitchenStation,
  KITCHEN_STATION_LABELS,
  KITCHEN_STATION_ICONS,
  // Status types
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
  ExtendedOrderItemStatus,
  // Modifier types
  SelectedModifierOption,
  SelectedModifier,
  // Combo types
  ComboItemSelection,
  SelectedCombo,
  // Order types
  ExtendedOrderItem,
  ExtendedOrder,
  SplitPaymentRecord,
  OrderDraft,
  // Filter types
  DateRange,
  ExtendedOrderFilters,
  // Request types
  CreateExtendedOrderRequest,
  AddOrderItemRequest,
  // Use Extended versions explicitly with aliases to avoid conflicts
  UpdateOrderStatusRequest as ExtendedUpdateOrderStatusRequest,
  UpdateOrderItemStatusRequest as ExtendedUpdateOrderItemStatusRequest,
  // Result types
  SubmitOrderResult,
  CartState,
  // Station mapping
  CategoryStationMapping,
  DEFAULT_CATEGORY_STATION_MAP,
  // Helper functions
  generateOrderNumber,
  generateOrderItemId,
  calculateItemTotal,
  getStationForCategory,
} from './order-extended.types';

export * from './kitchen-ticket.types';
export * from './billing.types';

// Payment types - export from payment.types, then selectively from payment-extended.types
// to avoid duplicate exports of Receipt, ReceiptPaymentInfo, and ReceiptType
export * from './payment.types';
export {
  // Status types
  PaymentTransactionStatus,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  // Transaction types
  PaymentTransaction,
  PaymentRecord,
  // Receipt types - use aliases to avoid conflicts with payment.types
  ReceiptLineItem,
  ReceiptPaymentInfo as ExtendedReceiptPaymentInfo,
  Receipt as ExtendedReceipt,
  ReceiptType as ExtendedReceiptType,
  ReceiptTemplate,
  DEFAULT_RECEIPT_TEMPLATES,
  // Processing types
  ProcessingStep,
  PROCESSING_STEP_MESSAGES,
  PaymentProcessingState,
  // Request types
  ProcessCashPaymentRequest,
  ProcessCardPaymentRequest,
  ProcessUPIPaymentRequest,
  ProcessGiftCardPaymentRequest,
  ProcessSplitPaymentRequest,
  // Result types
  PaymentResult,
  RefundRequest,
  RefundResult,
  // Helper functions
  generateReceiptNumber,
  generateTransactionId,
  formatCurrency,
  calculateChange,
  maskCardNumber,
  getCardBrand,
  createReceiptFromOrder,
} from './payment-extended.types';