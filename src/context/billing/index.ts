/**
 * Billing Context Module Exports
 * Provides bill splitting and payment management functionality
 */

export {
  BillSplitProvider,
  useBillSplit,
  useSplitConfiguration,
  useGuestSplits,
  useItemAssignments,
  usePaymentSplits,
} from './BillSplitContext';
export type { BillSplitContextValue } from './BillSplitContext';

export { billSplitReducer, initialBillSplitState } from './billSplitReducer';
export type { BillSplitState, BillSplitAction } from './billSplitReducer';
