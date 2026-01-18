/**
 * Unified Order Context - Exports
 *
 * Single unified context for all order management
 * Replaces: OrderContext, EnhancedOrderContext, OrderManagementContext
 */

export {
  UnifiedOrderProvider,
  useUnifiedOrder,
  useUnifiedCart,
  useUnifiedKitchen,
  useUnifiedOrderManagement,
  useUnifiedBilling,
  orderEventEmitter,
  type UnifiedOrderContextValue,
} from './UnifiedOrderContext';

// Re-export event types from the unified event emitter
export type { OrderEventType, OrderEventData } from '@/services/events/OrderEventEmitter';

export {
  unifiedOrderReducer,
  initialUnifiedOrderState,
  type UnifiedOrderState,
  type UnifiedOrderAction,
} from './unifiedOrderReducer';
