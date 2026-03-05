/**
 * Kitchen Context Module Exports
 * Provides clean interface for kitchen operations functionality
 */

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
export type { KitchenState, KitchenAction } from './kitchenReducer';

// Kitchen config context (station settings)
export { KitchenConfigProvider, useKitchenConfig } from './KitchenConfigContext';
export type { KitchenConfigContextValue } from './KitchenConfigContext';
