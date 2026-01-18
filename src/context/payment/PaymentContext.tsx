/**
 * Payment Context
 * Professional payment state management context
 */

import React, { createContext, useContext } from 'react';
import {
  PaymentContextState,
  ProfessionalPayment,
  PaymentProcessingStatus,
  VP3350DeviceStatus,
  VP3350DeviceConfig,
  Receipt,
  ProcessPaymentRequest,
  RefundPaymentRequest,
} from '@/types/payment.types';
import { PaymentAction } from './PaymentActions';

// Payment Context Interface
export interface PaymentContextInterface extends PaymentContextState {
  // State Management
  dispatch: React.Dispatch<PaymentAction>;
  
  // Payment Processing Methods
  processCardPayment: (request: ProcessPaymentRequest) => Promise<ProfessionalPayment>;
  processCashPayment: (request: ProcessPaymentRequest) => Promise<ProfessionalPayment>;
  processSplitPayment: (request: ProcessPaymentRequest) => Promise<ProfessionalPayment>;
  
  // VP3350 Device Management
  connectVP3350Device: (config: VP3350DeviceConfig) => Promise<void>;
  disconnectVP3350Device: () => Promise<void>;
  processVP3350Payment: (amount: number) => Promise<void>;
  getVP3350DeviceStatus: () => Promise<VP3350DeviceStatus>;
  
  // Receipt Management
  generateReceipt: (paymentId: string, type: string) => Promise<Receipt>;
  printReceipt: (receiptId: string) => Promise<void>;
  emailReceipt: (receiptId: string, email: string) => Promise<void>;
  smsReceipt: (receiptId: string, phone: string) => Promise<void>;
  
  // Payment History and Analytics
  getPaymentHistory: (orderId?: string) => Promise<ProfessionalPayment[]>;
  refundPayment: (request: RefundPaymentRequest) => Promise<ProfessionalPayment>;
  voidPayment: (paymentId: string, reason: string) => Promise<void>;
  
  // UI Actions
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openReceiptPreview: () => void;
  closeReceiptPreview: () => void;
  openSplitPaymentModal: () => void;
  closeSplitPaymentModal: () => void;
  
  // Configuration Actions
  updateTaxRate: (rate: number) => void;
  updateTipRates: (rates: number[]) => void;
  updateReceiptSettings: (settings: any) => void;
  
  // Error Management
  clearError: () => void;

  // State Reset
  resetPaymentState: () => void;
  resetProcessingStatus: () => void;
}

// Create Payment Context
export const PaymentContext = createContext<PaymentContextInterface | undefined>(undefined);

// Payment Context Hook
export const usePayment = (): PaymentContextInterface => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Payment Hook Aliases for different use cases
export const usePaymentProcessing = () => {
  const context = usePayment();
  return {
    currentPayment: context.currentPayment,
    processingStatus: context.processingStatus,
    processCardPayment: context.processCardPayment,
    processCashPayment: context.processCashPayment,
    processSplitPayment: context.processSplitPayment,
    isLoading: context.isLoading,
    error: context.error,
    clearError: context.clearError,
    resetProcessingStatus: context.resetProcessingStatus,
  };
};

export const useVP3350Device = () => {
  const context = usePayment();
  return {
    vp3350Status: context.vp3350Status,
    vp3350Config: context.vp3350Config,
    connectedDevices: context.connectedDevices,
    connectVP3350Device: context.connectVP3350Device,
    disconnectVP3350Device: context.disconnectVP3350Device,
    processVP3350Payment: context.processVP3350Payment,
    getVP3350DeviceStatus: context.getVP3350DeviceStatus,
  };
};

export const useReceiptManagement = () => {
  const context = usePayment();
  return {
    receipts: context.receipts,
    receiptSettings: context.receiptSettings,
    generateReceipt: context.generateReceipt,
    printReceipt: context.printReceipt,
    emailReceipt: context.emailReceipt,
    smsReceipt: context.smsReceipt,
    showReceiptPreview: context.showReceiptPreview,
    openReceiptPreview: context.openReceiptPreview,
    closeReceiptPreview: context.closeReceiptPreview,
    updateReceiptSettings: context.updateReceiptSettings,
  };
};

export const usePaymentHistory = () => {
  const context = usePayment();
  return {
    payments: context.payments,
    getPaymentHistory: context.getPaymentHistory,
    refundPayment: context.refundPayment,
    voidPayment: context.voidPayment,
  };
};

export const usePaymentUI = () => {
  const context = usePayment();
  return {
    showPaymentModal: context.showPaymentModal,
    showSplitPaymentModal: context.showSplitPaymentModal,
    showReceiptPreview: context.showReceiptPreview,
    openPaymentModal: context.openPaymentModal,
    closePaymentModal: context.closePaymentModal,
    openSplitPaymentModal: context.openSplitPaymentModal,
    closeSplitPaymentModal: context.closeSplitPaymentModal,
    openReceiptPreview: context.openReceiptPreview,
    closeReceiptPreview: context.closeReceiptPreview,
    isLoading: context.isLoading,
    error: context.error,
  };
};

export const usePaymentConfiguration = () => {
  const context = usePayment();
  return {
    taxRate: context.taxRate,
    defaultTipRates: context.defaultTipRates,
    minimumTipAmount: context.minimumTipAmount,
    maximumCashPayment: context.maximumCashPayment,
    receiptSettings: context.receiptSettings,
    updateTaxRate: context.updateTaxRate,
    updateTipRates: context.updateTipRates,
    updateReceiptSettings: context.updateReceiptSettings,
  };
};