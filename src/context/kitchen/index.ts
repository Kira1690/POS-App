/**
 * Kitchen Context Module Exports
 * Provides clean interface for kitchen station configuration functionality.
 * Order + kitchen display data flows through UnifiedOrderContext (SSOT).
 */

// Kitchen config context (station settings)
export { KitchenConfigProvider, useKitchenConfig } from './KitchenConfigContext';
export type { KitchenConfigContextValue } from './KitchenConfigContext';
