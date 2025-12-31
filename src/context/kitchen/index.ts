/**
 * Kitchen Context Module Exports
 * Provides clean interface for kitchen operations functionality
 */

// Legacy kitchen context (for backward compatibility)
export { KitchenProvider, useKitchen } from './KitchenContext';
export type { KitchenState, KitchenContextValue, KitchenNotification } from './KitchenContext';

// Enhanced kitchen context (ticket-based)
export {
  EnhancedKitchenProvider,
  useEnhancedKitchen,
  useKitchenTickets,
  useKitchenFilters,
  useKitchenActions,
} from './EnhancedKitchenContext';
export type { EnhancedKitchenContextValue } from './EnhancedKitchenContext';

// Kitchen reducer
export { kitchenReducer, initialKitchenState } from './kitchenReducer';
export type { KitchenState as EnhancedKitchenState, KitchenAction } from './kitchenReducer';