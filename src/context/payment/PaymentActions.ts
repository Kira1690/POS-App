/**
 * Payment Context Actions
 * Action types and creators for professional payment state management
 */

import {
  ProfessionalPayment,
  PaymentProcessingStatus,
  VP3350DeviceStatus,
  VP3350DeviceConfig,
  Receipt,
  ProcessPaymentRequest,
  RefundPaymentRequest,
} from '@/types/payment.types';

// Payment Action Types
export enum PaymentActionType {
  // Payment Processing
  SET_CURRENT_PAYMENT = 'SET_CURRENT_PAYMENT',
  SET_PROCESSING_STATUS = 'SET_PROCESSING_STATUS',
  ADD_PAYMENT = 'ADD_PAYMENT',
  UPDATE_PAYMENT = 'UPDATE_PAYMENT',
  CLEAR_CURRENT_PAYMENT = 'CLEAR_CURRENT_PAYMENT',
  
  // VP3350 Device Management
  SET_VP3350_STATUS = 'SET_VP3350_STATUS',
  SET_VP3350_CONFIG = 'SET_VP3350_CONFIG',
  ADD_CONNECTED_DEVICE = 'ADD_CONNECTED_DEVICE',
  REMOVE_CONNECTED_DEVICE = 'REMOVE_CONNECTED_DEVICE',
  
  // Receipt Management
  ADD_RECEIPT = 'ADD_RECEIPT',
  UPDATE_RECEIPT = 'UPDATE_RECEIPT',
  
  // UI State Management
  SET_SHOW_PAYMENT_MODAL = 'SET_SHOW_PAYMENT_MODAL',
  SET_SHOW_RECEIPT_PREVIEW = 'SET_SHOW_RECEIPT_PREVIEW',
  SET_SHOW_SPLIT_PAYMENT_MODAL = 'SET_SHOW_SPLIT_PAYMENT_MODAL',
  
  // Loading and Error States
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  
  // Configuration
  SET_TAX_RATE = 'SET_TAX_RATE',
  SET_TIP_RATES = 'SET_TIP_RATES',
  UPDATE_RECEIPT_SETTINGS = 'UPDATE_RECEIPT_SETTINGS',
  
  // Reset State
  RESET_PAYMENT_STATE = 'RESET_PAYMENT_STATE',
}

// Payment Action Interfaces
export interface SetCurrentPaymentAction {
  type: PaymentActionType.SET_CURRENT_PAYMENT;
  payload: ProfessionalPayment;
}

export interface SetProcessingStatusAction {
  type: PaymentActionType.SET_PROCESSING_STATUS;
  payload: PaymentProcessingStatus;
}

export interface AddPaymentAction {
  type: PaymentActionType.ADD_PAYMENT;
  payload: ProfessionalPayment;
}

export interface UpdatePaymentAction {
  type: PaymentActionType.UPDATE_PAYMENT;
  payload: { id: string; updates: Partial<ProfessionalPayment> };
}

export interface ClearCurrentPaymentAction {
  type: PaymentActionType.CLEAR_CURRENT_PAYMENT;
}

export interface SetVP3350StatusAction {
  type: PaymentActionType.SET_VP3350_STATUS;
  payload: VP3350DeviceStatus;
}

export interface SetVP3350ConfigAction {
  type: PaymentActionType.SET_VP3350_CONFIG;
  payload: VP3350DeviceConfig | null;
}

export interface AddConnectedDeviceAction {
  type: PaymentActionType.ADD_CONNECTED_DEVICE;
  payload: VP3350DeviceConfig;
}

export interface RemoveConnectedDeviceAction {
  type: PaymentActionType.REMOVE_CONNECTED_DEVICE;
  payload: string; // Device ID
}

export interface AddReceiptAction {
  type: PaymentActionType.ADD_RECEIPT;
  payload: Receipt;
}

export interface UpdateReceiptAction {
  type: PaymentActionType.UPDATE_RECEIPT;
  payload: { id: string; updates: Partial<Receipt> };
}

export interface SetShowPaymentModalAction {
  type: PaymentActionType.SET_SHOW_PAYMENT_MODAL;
  payload: boolean;
}

export interface SetShowReceiptPreviewAction {
  type: PaymentActionType.SET_SHOW_RECEIPT_PREVIEW;
  payload: boolean;
}

export interface SetShowSplitPaymentModalAction {
  type: PaymentActionType.SET_SHOW_SPLIT_PAYMENT_MODAL;
  payload: boolean;
}

export interface SetLoadingAction {
  type: PaymentActionType.SET_LOADING;
  payload: boolean;
}

export interface SetErrorAction {
  type: PaymentActionType.SET_ERROR;
  payload: string | null;
}

export interface ClearErrorAction {
  type: PaymentActionType.CLEAR_ERROR;
}

export interface SetTaxRateAction {
  type: PaymentActionType.SET_TAX_RATE;
  payload: number;
}

export interface SetTipRatesAction {
  type: PaymentActionType.SET_TIP_RATES;
  payload: number[];
}

export interface UpdateReceiptSettingsAction {
  type: PaymentActionType.UPDATE_RECEIPT_SETTINGS;
  payload: Partial<{
    printAutomatically: boolean;
    emailByDefault: boolean;
    thermalPrinterWidth: number;
    receiptTemplate: string;
  }>;
}

export interface ResetPaymentStateAction {
  type: PaymentActionType.RESET_PAYMENT_STATE;
}

// Union Type for all Payment Actions
export type PaymentAction =
  | SetCurrentPaymentAction
  | SetProcessingStatusAction
  | AddPaymentAction
  | UpdatePaymentAction
  | ClearCurrentPaymentAction
  | SetVP3350StatusAction
  | SetVP3350ConfigAction
  | AddConnectedDeviceAction
  | RemoveConnectedDeviceAction
  | AddReceiptAction
  | UpdateReceiptAction
  | SetShowPaymentModalAction
  | SetShowReceiptPreviewAction
  | SetShowSplitPaymentModalAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetTaxRateAction
  | SetTipRatesAction
  | UpdateReceiptSettingsAction
  | ResetPaymentStateAction;

// Action Creators
export const PaymentActions = {
  // Payment Processing Actions
  setCurrentPayment: (payment: ProfessionalPayment): SetCurrentPaymentAction => ({
    type: PaymentActionType.SET_CURRENT_PAYMENT,
    payload: payment,
  }),

  setProcessingStatus: (status: PaymentProcessingStatus): SetProcessingStatusAction => ({
    type: PaymentActionType.SET_PROCESSING_STATUS,
    payload: status,
  }),

  addPayment: (payment: ProfessionalPayment): AddPaymentAction => ({
    type: PaymentActionType.ADD_PAYMENT,
    payload: payment,
  }),

  updatePayment: (id: string, updates: Partial<ProfessionalPayment>): UpdatePaymentAction => ({
    type: PaymentActionType.UPDATE_PAYMENT,
    payload: { id, updates },
  }),

  clearCurrentPayment: (): ClearCurrentPaymentAction => ({
    type: PaymentActionType.CLEAR_CURRENT_PAYMENT,
  }),

  // VP3350 Device Actions
  setVP3350Status: (status: VP3350DeviceStatus): SetVP3350StatusAction => ({
    type: PaymentActionType.SET_VP3350_STATUS,
    payload: status,
  }),

  setVP3350Config: (config: VP3350DeviceConfig | null): SetVP3350ConfigAction => ({
    type: PaymentActionType.SET_VP3350_CONFIG,
    payload: config,
  }),

  addConnectedDevice: (device: VP3350DeviceConfig): AddConnectedDeviceAction => ({
    type: PaymentActionType.ADD_CONNECTED_DEVICE,
    payload: device,
  }),

  removeConnectedDevice: (deviceId: string): RemoveConnectedDeviceAction => ({
    type: PaymentActionType.REMOVE_CONNECTED_DEVICE,
    payload: deviceId,
  }),

  // Receipt Actions
  addReceipt: (receipt: Receipt): AddReceiptAction => ({
    type: PaymentActionType.ADD_RECEIPT,
    payload: receipt,
  }),

  updateReceipt: (id: string, updates: Partial<Receipt>): UpdateReceiptAction => ({
    type: PaymentActionType.UPDATE_RECEIPT,
    payload: { id, updates },
  }),

  // UI State Actions
  setShowPaymentModal: (show: boolean): SetShowPaymentModalAction => ({
    type: PaymentActionType.SET_SHOW_PAYMENT_MODAL,
    payload: show,
  }),

  setShowReceiptPreview: (show: boolean): SetShowReceiptPreviewAction => ({
    type: PaymentActionType.SET_SHOW_RECEIPT_PREVIEW,
    payload: show,
  }),

  setShowSplitPaymentModal: (show: boolean): SetShowSplitPaymentModalAction => ({
    type: PaymentActionType.SET_SHOW_SPLIT_PAYMENT_MODAL,
    payload: show,
  }),

  // Loading and Error Actions
  setLoading: (loading: boolean): SetLoadingAction => ({
    type: PaymentActionType.SET_LOADING,
    payload: loading,
  }),

  setError: (error: string | null): SetErrorAction => ({
    type: PaymentActionType.SET_ERROR,
    payload: error,
  }),

  clearError: (): ClearErrorAction => ({
    type: PaymentActionType.CLEAR_ERROR,
  }),

  // Configuration Actions
  setTaxRate: (rate: number): SetTaxRateAction => ({
    type: PaymentActionType.SET_TAX_RATE,
    payload: rate,
  }),

  setTipRates: (rates: number[]): SetTipRatesAction => ({
    type: PaymentActionType.SET_TIP_RATES,
    payload: rates,
  }),

  updateReceiptSettings: (settings: Partial<{
    printAutomatically: boolean;
    emailByDefault: boolean;
    thermalPrinterWidth: number;
    receiptTemplate: string;
  }>): UpdateReceiptSettingsAction => ({
    type: PaymentActionType.UPDATE_RECEIPT_SETTINGS,
    payload: settings,
  }),

  // Reset Action
  resetPaymentState: (): ResetPaymentStateAction => ({
    type: PaymentActionType.RESET_PAYMENT_STATE,
  }),
};