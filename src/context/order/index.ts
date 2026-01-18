// Legacy exports (for backward compatibility)
export { OrderProvider, useOrder, useOrderManagement } from './OrderContext';
export type { OrderContextValue, OrderContextState } from './OrderContext';

// Enhanced Order Context exports
export {
  EnhancedOrderProvider,
  useEnhancedOrder,
  useCart,
  useCurrentOrder,
  useOrderManagement as useEnhancedOrderManagement,
  useKitchenTickets,
  useOrderModals,
  useOrderSync,
} from './EnhancedOrderContext';
export type { EnhancedOrderContextValue } from './EnhancedOrderContext';

// Reducer exports
export { orderReducer, initialOrderState } from './orderReducer';
export type { OrderState, OrderAction } from './orderReducer';

// Actions exports
export { createOrderActions } from './orderActions';
export type { OrderActions } from './orderActions';

// Selectors exports
export { createOrderSelectors } from './orderSelectors';
export type { OrderSelectors } from './orderSelectors';