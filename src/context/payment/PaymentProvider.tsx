/**
 * Payment Provider
 * Professional payment state management provider with comprehensive payment processing
 */

import React, { useReducer, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { PaymentContext, PaymentContextInterface } from './PaymentContext';
import { paymentReducer, initialPaymentState } from './PaymentReducer';
import { PaymentActions } from './PaymentActions';
import { paymentService } from '@/services/payment';
import { paymentStorageService } from '@/services/storage/PaymentStorageService';
import {
  ProfessionalPayment,
  PaymentProcessingStatus,
  VP3350DeviceStatus,
  VP3350DeviceConfig,
  Receipt,
  ReceiptType,
  ProcessPaymentRequest,
  RefundPaymentRequest,
} from '@/types/payment.types';
import { showToast } from '@/utils/toast';
import { useUnifiedOrder } from '@/context/unified-order';
import { ProfessionalPaymentMethod } from '@/types/payment.types';

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  const { processPayment: markOrderPaid } = useUnifiedOrder();
  // Use direct service instance to avoid DI registration issues
  const paymentServiceInstance = paymentService;

  // Load tax rate from storage on mount + reload when sync updates it
  const loadPaymentConfig = useCallback(async () => {
    try {
      const config = await paymentStorageService.getPaymentConfig();
      if (config) {
        if (config.taxRate !== undefined) {
          dispatch(PaymentActions.setTaxRate(config.taxRate));
        }
        if (config.defaultTipRates) {
          dispatch(PaymentActions.setTipRates(config.defaultTipRates));
        }
        if (config.receiptSettings) {
          dispatch(PaymentActions.updateReceiptSettings(config.receiptSettings));
        }
        if (__DEV__) {
          console.log('[PaymentProvider] Loaded payment config:', { taxRate: config.taxRate });
        }
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadPaymentConfig();
  }, [loadPaymentConfig]);

  // Re-read tax rate from storage every 10s (picks up sync changes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rate = await paymentStorageService.getTaxRate();
        if (rate !== null && rate !== state.taxRate) {
          dispatch(PaymentActions.setTaxRate(rate));
          if (__DEV__) {
            console.log(`[PaymentProvider] Tax rate updated from sync: ${state.taxRate} → ${rate}`);
          }
        }
      } catch { /* silent */ }
    }, 10_000);
    return () => clearInterval(interval);
  }, [state.taxRate]);

  // Payment Processing Methods
  const processCardPayment = useCallback(async (request: ProcessPaymentRequest): Promise<ProfessionalPayment> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.PROCESSING));
      dispatch(PaymentActions.clearError());

      const payment = await paymentServiceInstance.processCardPayment(request);

      dispatch(PaymentActions.addPayment(payment));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.COMPLETED));

      // Mark order as paid in unified order context (sets status + paymentStatus)
      if (request.orderId) {
        markOrderPaid(String(request.orderId), String(request.method || 'cash'), String(payment.id || '')).catch((e) => {
          if (__DEV__) console.log('[PaymentProvider] markOrderPaid error:', e);
        });
      }

      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Card payment failed';
      dispatch(PaymentActions.setError(errorMessage));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.FAILED));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const processCashPayment = useCallback(async (request: ProcessPaymentRequest): Promise<ProfessionalPayment> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.PROCESSING));
      dispatch(PaymentActions.clearError());

      const payment = await paymentServiceInstance.processCashPayment(request);

      dispatch(PaymentActions.addPayment(payment));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.COMPLETED));

      // Mark order as paid in unified order context (sets status + paymentStatus)
      if (request.orderId) {
        markOrderPaid(String(request.orderId), String(request.method || 'cash'), String(payment.id || '')).catch((e) => {
          if (__DEV__) console.log('[PaymentProvider] markOrderPaid error:', e);
        });
      }

      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cash payment failed';
      dispatch(PaymentActions.setError(errorMessage));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.FAILED));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const processSplitPayment = useCallback(async (request: ProcessPaymentRequest): Promise<ProfessionalPayment> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.PROCESSING));
      dispatch(PaymentActions.clearError());

      const payment = await paymentServiceInstance.processSplitPayment(request);
      
      dispatch(PaymentActions.addPayment(payment));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.COMPLETED));
      
      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Split payment failed';
      dispatch(PaymentActions.setError(errorMessage));
      dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.FAILED));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  // VP3350 Device Management
  const connectVP3350Device = useCallback(async (config: VP3350DeviceConfig): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.CONNECTING));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.connectVP3350(config);
      
      dispatch(PaymentActions.setVP3350Config(config));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.CONNECTED));
      dispatch(PaymentActions.addConnectedDevice(config));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect VP3350 device';
      dispatch(PaymentActions.setError(errorMessage));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.ERROR));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const disconnectVP3350Device = useCallback(async (): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.disconnectVP3350();
      
      const currentDeviceName = state.vp3350Config?.deviceName;
      if (currentDeviceName) {
        dispatch(PaymentActions.removeConnectedDevice(currentDeviceName));
      }
      
      dispatch(PaymentActions.setVP3350Config(null));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.DISCONNECTED));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect VP3350 device';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, [state.vp3350Config]);

  const processVP3350Payment = useCallback(async (amount: number): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.PROCESSING));
      dispatch(PaymentActions.clearError());

      const result = await paymentServiceInstance.processVP3350Payment(amount);
      
      // Create payment record from VP3350 result
      const payment: ProfessionalPayment = {
        id: `vp3350_${Date.now()}`,
        orderId: 'current-order-id', // Replace with actual order ID
        amount: result.amount,
        method: 'vp3350' as any,
        status: PaymentProcessingStatus.COMPLETED,
        transactionId: result.transactionId,
        authorizationCode: result.authorizationCode,
        cardLast4: result.cardLast4,
        cardType: result.cardType,
        vp3350Response: result,
        processedAt: result.processedAt,
        processedBy: 'current-user', // Replace with actual user ID
        createdBy: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isSplitPayment: false,
        receiptPrinted: false,
        receiptEmailed: false,
        receiptSmsed: false,
        retryCount: 0,
        taxAmount: 0,
        tipAmount: 0,
      };
      
      dispatch(PaymentActions.addPayment(payment));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.READY));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'VP3350 payment processing failed';
      dispatch(PaymentActions.setError(errorMessage));
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.ERROR));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const getVP3350DeviceStatus = useCallback(async (): Promise<VP3350DeviceStatus> => {
    try {
      const status = await paymentServiceInstance.getVP3350Status();
      dispatch(PaymentActions.setVP3350Status(status));
      return status;
    } catch (error) {
      dispatch(PaymentActions.setVP3350Status(VP3350DeviceStatus.ERROR));
      return VP3350DeviceStatus.ERROR;
    }
  }, []);

  // Receipt Management
  const generateReceipt = useCallback(async (paymentId: string, type: string): Promise<Receipt> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      const receipt = await paymentServiceInstance.generateReceipt(paymentId, type as ReceiptType);
      
      dispatch(PaymentActions.addReceipt(receipt));
      
      return receipt;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Receipt generation failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const printReceipt = useCallback(async (receiptId: string): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.printReceipt(receiptId);
      
      dispatch(PaymentActions.updateReceipt(receiptId, {
        printedAt: new Date().toISOString(),
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Receipt printing failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const emailReceipt = useCallback(async (receiptId: string, email: string): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.emailReceipt(receiptId, email);
      
      dispatch(PaymentActions.updateReceipt(receiptId, {
        emailedAt: new Date().toISOString(),
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Receipt email failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const smsReceipt = useCallback(async (receiptId: string, phone: string): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.smsReceipt(receiptId, phone);
      
      dispatch(PaymentActions.updateReceipt(receiptId, {
        smsedAt: new Date().toISOString(),
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Receipt SMS failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  // Payment History and Analytics
  const getPaymentHistory = useCallback(async (orderId?: string): Promise<ProfessionalPayment[]> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      const payments = await paymentServiceInstance.getPaymentHistory(orderId);
      
      return payments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve payment history';
      dispatch(PaymentActions.setError(errorMessage));
      return [];
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const refundPayment = useCallback(async (request: RefundPaymentRequest): Promise<ProfessionalPayment> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      const refund = await paymentServiceInstance.refundPayment(request);
      
      dispatch(PaymentActions.addPayment(refund));
      
      return refund;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment refund failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  const voidPayment = useCallback(async (paymentId: string, reason: string): Promise<void> => {
    try {
      dispatch(PaymentActions.setLoading(true));
      dispatch(PaymentActions.clearError());

      await paymentServiceInstance.voidPayment(paymentId, reason);
      
      dispatch(PaymentActions.updatePayment(paymentId, {
        status: PaymentProcessingStatus.CANCELLED,
        notes: `Voided: ${reason}`,
      }));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment void failed';
      dispatch(PaymentActions.setError(errorMessage));
      throw error;
    } finally {
      dispatch(PaymentActions.setLoading(false));
    }
  }, []);

  // UI Actions
  const openPaymentModal = useCallback(() => {
    dispatch(PaymentActions.setShowPaymentModal(true));
  }, []);

  const closePaymentModal = useCallback(() => {
    dispatch(PaymentActions.setShowPaymentModal(false));
  }, []);

  const openReceiptPreview = useCallback(() => {
    dispatch(PaymentActions.setShowReceiptPreview(true));
  }, []);

  const closeReceiptPreview = useCallback(() => {
    dispatch(PaymentActions.setShowReceiptPreview(false));
  }, []);

  const openSplitPaymentModal = useCallback(() => {
    dispatch(PaymentActions.setShowSplitPaymentModal(true));
  }, []);

  const closeSplitPaymentModal = useCallback(() => {
    dispatch(PaymentActions.setShowSplitPaymentModal(false));
  }, []);

  // Configuration Actions
  const updateTaxRate = useCallback(async (rate: number) => {
    dispatch(PaymentActions.setTaxRate(rate));
    // Persist to storage
    try {
      await paymentStorageService.updateTaxRate(rate);
      if (__DEV__) {
        console.log('[PaymentProvider] Tax rate saved to storage:', rate);
      }
    } catch { /* silent */ }
  }, []);

  const updateTipRates = useCallback((rates: number[]) => {
    dispatch(PaymentActions.setTipRates(rates));
  }, []);

  const updateReceiptSettings = useCallback((settings: any) => {
    dispatch(PaymentActions.updateReceiptSettings(settings));
  }, []);

  // Error Management
  const clearError = useCallback(() => {
    dispatch(PaymentActions.clearError());
  }, []);

  // State Reset
  const resetPaymentState = useCallback(() => {
    dispatch(PaymentActions.resetPaymentState());
  }, []);

  const resetProcessingStatus = useCallback(() => {
    dispatch(PaymentActions.setProcessingStatus(PaymentProcessingStatus.IDLE));
    dispatch(PaymentActions.clearError());
  }, []);

  // Context Value — memoized to prevent cascading re-renders
  const contextValue: PaymentContextInterface = useMemo(() => ({
    ...state,
    dispatch,
    processCardPayment,
    processCashPayment,
    processSplitPayment,
    connectVP3350Device,
    disconnectVP3350Device,
    processVP3350Payment,
    getVP3350DeviceStatus,
    generateReceipt,
    printReceipt,
    emailReceipt,
    smsReceipt,
    getPaymentHistory,
    refundPayment,
    voidPayment,
    openPaymentModal,
    closePaymentModal,
    openReceiptPreview,
    closeReceiptPreview,
    openSplitPaymentModal,
    closeSplitPaymentModal,
    updateTaxRate,
    updateTipRates,
    updateReceiptSettings,
    clearError,
    resetPaymentState,
    resetProcessingStatus,
  }), [
    state,
    processCardPayment, processCashPayment, processSplitPayment,
    connectVP3350Device, disconnectVP3350Device, processVP3350Payment, getVP3350DeviceStatus,
    generateReceipt, printReceipt, emailReceipt, smsReceipt,
    getPaymentHistory, refundPayment, voidPayment,
    openPaymentModal, closePaymentModal, openReceiptPreview, closeReceiptPreview,
    openSplitPaymentModal, closeSplitPaymentModal,
    updateTaxRate, updateTipRates, updateReceiptSettings,
    clearError, resetPaymentState, resetProcessingStatus,
  ]);

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};