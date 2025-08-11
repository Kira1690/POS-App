/**
 * Payment Context Reducer
 * Professional payment state management with VP3350 integration
 */

import {
  PaymentContextState,
  VP3350DeviceStatus,
  PaymentProcessingStatus,
} from '@/types/payment.types';
import { PaymentAction, PaymentActionType } from './PaymentActions';

// Initial Payment State
export const initialPaymentState: PaymentContextState = {
  // Current Payment Processing
  currentPayment: null,
  processingStatus: PaymentProcessingStatus.IDLE,
  
  // VP3350 Device Management
  vp3350Status: VP3350DeviceStatus.DISCONNECTED,
  vp3350Config: null,
  connectedDevices: [],
  
  // Payment History
  payments: [],
  receipts: [],
  
  // UI State
  showPaymentModal: false,
  showReceiptPreview: false,
  showSplitPaymentModal: false,
  
  // Error and Loading States
  isLoading: false,
  error: null,
  
  // Configuration
  taxRate: 0.0825, // 8.25% default
  defaultTipRates: [15, 18, 20, 25],
  minimumTipAmount: 0,
  maximumCashPayment: 1000,
  
  // Receipt Settings
  receiptSettings: {
    printAutomatically: true,
    emailByDefault: false,
    thermalPrinterWidth: 40,
    receiptTemplate: 'standard',
  },
};

/**
 * Payment Reducer
 */
export const paymentReducer = (
  state: PaymentContextState = initialPaymentState,
  action: PaymentAction
): PaymentContextState => {
  switch (action.type) {
    // Payment Processing Actions
    case PaymentActionType.SET_CURRENT_PAYMENT:
      return {
        ...state,
        currentPayment: action.payload,
        error: null,
      };

    case PaymentActionType.SET_PROCESSING_STATUS:
      return {
        ...state,
        processingStatus: action.payload,
        isLoading: action.payload === PaymentProcessingStatus.PROCESSING,
      };

    case PaymentActionType.ADD_PAYMENT:
      return {
        ...state,
        payments: [action.payload, ...state.payments],
        currentPayment: action.payload,
        error: null,
      };

    case PaymentActionType.UPDATE_PAYMENT:
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.updates }
            : payment
        ),
        currentPayment: state.currentPayment?.id === action.payload.id
          ? { ...state.currentPayment, ...action.payload.updates }
          : state.currentPayment,
      };

    case PaymentActionType.CLEAR_CURRENT_PAYMENT:
      return {
        ...state,
        currentPayment: null,
        processingStatus: PaymentProcessingStatus.IDLE,
        error: null,
      };

    // VP3350 Device Actions
    case PaymentActionType.SET_VP3350_STATUS:
      return {
        ...state,
        vp3350Status: action.payload,
        error: action.payload === VP3350DeviceStatus.ERROR ? state.error : null,
      };

    case PaymentActionType.SET_VP3350_CONFIG:
      return {
        ...state,
        vp3350Config: action.payload,
        vp3350Status: action.payload 
          ? VP3350DeviceStatus.CONNECTED 
          : VP3350DeviceStatus.DISCONNECTED,
      };

    case PaymentActionType.ADD_CONNECTED_DEVICE:
      return {
        ...state,
        connectedDevices: [
          ...state.connectedDevices.filter(device => device.deviceName !== action.payload.deviceName),
          action.payload,
        ],
      };

    case PaymentActionType.REMOVE_CONNECTED_DEVICE:
      return {
        ...state,
        connectedDevices: state.connectedDevices.filter(
          device => device.deviceName !== action.payload
        ),
        vp3350Config: state.vp3350Config?.deviceName === action.payload ? null : state.vp3350Config,
        vp3350Status: state.vp3350Config?.deviceName === action.payload 
          ? VP3350DeviceStatus.DISCONNECTED 
          : state.vp3350Status,
      };

    // Receipt Actions
    case PaymentActionType.ADD_RECEIPT:
      return {
        ...state,
        receipts: [action.payload, ...state.receipts],
      };

    case PaymentActionType.UPDATE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.map(receipt =>
          receipt.id === action.payload.id
            ? { ...receipt, ...action.payload.updates }
            : receipt
        ),
      };

    // UI State Actions
    case PaymentActionType.SET_SHOW_PAYMENT_MODAL:
      return {
        ...state,
        showPaymentModal: action.payload,
      };

    case PaymentActionType.SET_SHOW_RECEIPT_PREVIEW:
      return {
        ...state,
        showReceiptPreview: action.payload,
      };

    case PaymentActionType.SET_SHOW_SPLIT_PAYMENT_MODAL:
      return {
        ...state,
        showSplitPaymentModal: action.payload,
      };

    // Loading and Error Actions
    case PaymentActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error when starting new operation
      };

    case PaymentActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        processingStatus: action.payload ? PaymentProcessingStatus.FAILED : state.processingStatus,
      };

    case PaymentActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Configuration Actions
    case PaymentActionType.SET_TAX_RATE:
      return {
        ...state,
        taxRate: action.payload,
      };

    case PaymentActionType.SET_TIP_RATES:
      return {
        ...state,
        defaultTipRates: action.payload,
      };

    case PaymentActionType.UPDATE_RECEIPT_SETTINGS:
      return {
        ...state,
        receiptSettings: {
          ...state.receiptSettings,
          ...action.payload,
        },
      };

    // Reset Action
    case PaymentActionType.RESET_PAYMENT_STATE:
      return {
        ...initialPaymentState,
        // Preserve device configurations and settings
        vp3350Config: state.vp3350Config,
        connectedDevices: state.connectedDevices,
        taxRate: state.taxRate,
        defaultTipRates: state.defaultTipRates,
        receiptSettings: state.receiptSettings,
      };

    default:
      return state;
  }
};