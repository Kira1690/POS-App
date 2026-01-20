/**
 * Order Modals Index
 * Exports all modal components for order management
 */

// Item Notes Modal
export { ItemNotesModal } from './ItemNotesModal';
export type { ItemNotesModalProps } from './ItemNotesModal';

// Discount Modal
export { DiscountModal } from './DiscountModal';
export type { DiscountModalProps, DiscountData } from './DiscountModal';

// Combo Selection Modal
export { ComboSelectionModal } from './ComboSelectionModal';
export type {
  ComboSelectionModalProps,
  ComboItemSelection,
  ComboSelectionResult,
} from './ComboSelectionModal';

// Re-export ComboDeal from menu types for convenience
export type { ComboDeal } from '@/types/menu-management-extended.types';

// Quantity Modal
export { QuantityModal } from './QuantityModal';
export type { QuantityModalProps } from './QuantityModal';
