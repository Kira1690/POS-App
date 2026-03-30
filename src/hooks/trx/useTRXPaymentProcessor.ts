import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AmountCalculatorService } from '@/services/trx/pos/AmountCalculatorService';
import { PaymentStateManager } from '@/services/trx/pos/PaymentStateManager';
import { PaymentState } from '@/services/trx/interfaces/IPaymentProcessor';
import { ConfigurationServiceFactory } from '@/services/trx/ConfigurationService';
import { LoggerFactory } from '@/services/trx/logging/LoggingService';
import { TransactionStorageService } from '@/services/trx/storage/TransactionStorageService';
import { TransactionRecord } from '@/types/trx/storage/TransactionStorage';
import { TRXSettingsEventEmitter } from '@/services/trx/TRXSettingsEventEmitter';

interface UseTRXPaymentProcessorReturn {
  // Amount state
  amount: string;
  displayAmount: string;
  taxRate: number;
  ccSurchargeRate: number;

  // Calculation methods
  calculateTax: () => string;
  calculateTotal: () => string;
  calculateSurcharge: () => string;
  calculateGrandTotal: () => string;

  // Input handlers
  handleNumberPress: (num: string) => void;
  handleDecimal: () => void;
  handleDelete: () => void;

  // Transaction state
  transactionStatus: PaymentState;
  transactionResult: string;
  isProcessing: boolean;
  error: string | null;

  // Payment progress tracking
  paymentStartTime: Date | null;
  approvalCode: string | null;
  cardBrand: string | null;
  lastFour: string | null;
  errorMessage: string | null;
  transactionAmount: string;

  // Transaction handlers
  handleProcessPayment: (processSale: (amount: number, tax: number) => Promise<unknown>) => Promise<void>;
  handleBalanceInquiry: (processBalanceInquiry: () => Promise<unknown>) => Promise<void>;
  processPayment: (processSale: (amount: number, tax: number) => Promise<unknown>) => Promise<void>;
  clearTransaction: () => void;
  dismissPaymentModal: () => void;

  // Debug/utility methods
  forceResetPaymentState: () => void;
}

// Single Responsibility Principle - Only handles payment processing business logic
export const useTRXPaymentProcessor = (initialAmount?: number): UseTRXPaymentProcessorReturn => {
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState(initialAmount ? initialAmount.toFixed(2) : '0.00');
  const [transactionResult, setTransactionResult] = useState('');
  const [taxRate, setTaxRate] = useState(0); // Will be set from server on mount
  const [ccSurchargeRate, setCCSurchargeRate] = useState(0); // Will be set from server on mount
  const [merchantConfig, setMerchantConfig] = useState<unknown>(null);
  // Terminal config - will be loaded from ConfigurationService (updated when terminal is discovered)
  const [terminalConfig, setTerminalConfig] = useState({ ip: '', port: 1180, name: 'Main Terminal' });

  // Payment progress tracking
  const [paymentStartTime, setPaymentStartTime] = useState<Date | null>(null);
  const [approvalCode, setApprovalCode] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [lastFour, setLastFour] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store transaction amount separately (won't be cleared when displayAmount resets)
  const [transactionAmount, setTransactionAmount] = useState<string>('0.00');

  // React state to track payment state (triggers re-renders)
  const [currentPaymentState, setCurrentPaymentState] = useState<PaymentState>(PaymentState.IDLE);

  // Sync displayAmount when initialAmount changes (e.g., modal reopened with same/new order)
  useEffect(() => {
    if (initialAmount !== undefined && initialAmount > 0) {
      setDisplayAmount(initialAmount.toFixed(2));
    }
  }, [initialAmount]);

  // Initialize services - Dependency Inversion Principle
  const calculatorService = new AmountCalculatorService();
  const stateManager = new PaymentStateManager();
  const logger = LoggerFactory.createLogger('PaymentProcessor');

  // Synchronized state transition function - updates both stateManager and React state
  const transitionPaymentState = useCallback((newState: PaymentState) => {
    stateManager.transitionTo(newState);
    setCurrentPaymentState(newState);
  }, [stateManager]);

  // Force reset function - updates both stateManager and React state
  const forceResetState = useCallback(() => {
    stateManager.forceReset();
    setCurrentPaymentState(PaymentState.IDLE);
  }, [stateManager]);

  // Add method to force reset payment state (for debugging stuck states)
  const forceResetPaymentState = useCallback(() => {
    logger.info('🔄 Force resetting payment state to IDLE', 'forceResetPaymentState', {
      currentState: currentPaymentState
    });
    forceResetState();
    setTransactionResult('');
  }, [forceResetState, logger, currentPaymentState]);

  // Dismiss payment modal handler - properly resets all state
  const dismissPaymentModal = useCallback(() => {
    logger.info('🚪 Dismissing payment modal', 'dismissPaymentModal', {
      currentState: currentPaymentState,
      displayAmount,
      stateManagerState: stateManager.getCurrentState()
    });

    // Only transition to IDLE if not already IDLE (prevents double-dismissal errors)
    if (currentPaymentState !== PaymentState.IDLE) {
      try {
        transitionPaymentState(PaymentState.IDLE);
        logger.info('🔄 State transitioned to IDLE', 'dismissPaymentModal', {
          previousState: currentPaymentState,
          newState: PaymentState.IDLE
        });
      } catch (error) {
        logger.warn('⚠️ State transition failed, using force reset', 'dismissPaymentModal', {
          error: error instanceof Error ? error.message : String(error),
          attemptedTransition: `${currentPaymentState} -> ${PaymentState.IDLE}`
        });
        // Force reset if transition fails
        forceResetState();
      }
    } else {
      logger.info('ℹ️ Already in IDLE state, skipping transition', 'dismissPaymentModal');
    }

    // Clear all payment progress data
    setPaymentStartTime(null);
    setApprovalCode(null);
    setCardBrand(null);
    setLastFour(null);
    setErrorMessage(null);
    setTransactionAmount('0.00');
    setTransactionResult('');

    // Clear display amount for fresh start
    setDisplayAmount('0.00');

    logger.info('✅ Payment modal dismissed and state reset', 'dismissPaymentModal');
  }, [currentPaymentState, displayAmount, transitionPaymentState, forceResetState, logger, stateManager]);

  // Load configuration on mount — fetch tax/CC rates from SERVER store config API,
  // NOT from local TRX settings. The web dashboard is the single source of truth.
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        // PRIMARY: Fetch tax/CC from server billing API (configured on web dashboard)
        try {
          const { billingApiClient } = await import('@/services/billing/BillingApiClient');
          const storeConfig = await billingApiClient.getStoreConfig('1');
          if (storeConfig.taxRate !== undefined) {
            // Server returns tax as percentage (e.g., 10 for 10%), convert to decimal if needed
            const rate = storeConfig.taxRate >= 1 ? storeConfig.taxRate / 100 : storeConfig.taxRate;
            setTaxRate(rate);
            if (__DEV__) console.log('[TRXPaymentProcessor] Tax rate from server:', rate);
          }
          if (storeConfig.ccPercentage !== undefined) {
            const ccRate = storeConfig.ccPercentage >= 1 ? storeConfig.ccPercentage / 100 : storeConfig.ccPercentage;
            setCCSurchargeRate(ccRate);
            if (__DEV__) console.log('[TRXPaymentProcessor] CC surcharge from server:', ccRate);
          }
        } catch (serverError) {
          logger.warn('Failed to load server store config, falling back to local TRX settings', 'useTRXPaymentProcessor', {
            error: serverError instanceof Error ? serverError.message : String(serverError)
          });
          // FALLBACK: Use local TRX settings if server unreachable
          const configService = ConfigurationServiceFactory.getInstance();
          const taxConfig = await configService.getTaxConfig();
          setTaxRate(taxConfig.defaultTaxRate);
          setCCSurchargeRate(taxConfig.ccProcessingFee);
        }

        // Load merchant and POS terminal configuration (always from local TRX settings)
        const configService = ConfigurationServiceFactory.getInstance();
        const merchantInfo = await configService.getMerchantConfig();
        setMerchantConfig(merchantInfo);

        try {
          const posConfig = await configService.getPOSConfig();
          setTerminalConfig({
            ip: posConfig.host,
            port: posConfig.port,
            name: 'Main Terminal'
          });
        } catch (posError) {
          logger.warn('Failed to load POS config, using defaults', 'useTRXPaymentProcessor', {
            error: posError instanceof Error ? posError.message : String(posError)
          });
        }

        logger.info('Configuration loaded successfully', 'useTRXPaymentProcessor', {
          taxRate, terminalIp: terminalConfig.ip
        });
      } catch (error) {
        logger.error('Failed to load configuration', error instanceof Error ? error : new Error(String(error)));
      }
    };

    loadConfiguration();

    // Listen for settings changes and reload configuration
    const unsubscribe = TRXSettingsEventEmitter.getInstance().onSettingsChange(async (event) => {
      logger.info(`Settings changed: ${event.key}`, 'useTRXPaymentProcessor');

      try {
        // Reload from server first, fallback to local
        try {
          const { billingApiClient } = await import('@/services/billing/BillingApiClient');
          const storeConfig = await billingApiClient.getStoreConfig('1');
          if (storeConfig.taxRate !== undefined) {
            const rate = storeConfig.taxRate >= 1 ? storeConfig.taxRate / 100 : storeConfig.taxRate;
            setTaxRate(rate);
          }
          if (storeConfig.ccPercentage !== undefined) {
            const ccRate = storeConfig.ccPercentage >= 1 ? storeConfig.ccPercentage / 100 : storeConfig.ccPercentage;
            setCCSurchargeRate(ccRate);
          }
        } catch {
          const configService = ConfigurationServiceFactory.getInstance();
          configService.invalidateCache();
          const taxConfig = await configService.getTaxConfig();
          setTaxRate(taxConfig.defaultTaxRate);
          setCCSurchargeRate(taxConfig.ccProcessingFee);
        }

        logger.info(`Configuration reloaded after settings change`, 'useTRXPaymentProcessor');
      } catch (error) {
        logger.error('Failed to reload configuration after settings change', error instanceof Error ? error : new Error(String(error)));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const calculateTax = useCallback(() => {
    const numAmount = parseFloat(displayAmount || '0');
    return calculatorService.calculateTax(numAmount, taxRate).toFixed(2);
  }, [displayAmount, taxRate]); // Remove calculatorService dependency

  const calculateTotal = useCallback(() => {
    const numAmount = parseFloat(displayAmount || '0');
    const tax = calculatorService.calculateTax(numAmount, taxRate);
    return calculatorService.calculateTotal(numAmount, tax).toFixed(2);
  }, [displayAmount, taxRate]); // Remove calculatorService dependency

  // Calculate CC surcharge (applied to subtotal + tax)
  const calculateSurcharge = useCallback(() => {
    const numAmount = parseFloat(displayAmount || '0');
    const tax = calculatorService.calculateTax(numAmount, taxRate);
    const subtotalPlusTax = numAmount + tax;
    const surcharge = subtotalPlusTax * ccSurchargeRate;
    return surcharge.toFixed(2);
  }, [displayAmount, taxRate, ccSurchargeRate]);

  // Calculate grand total (subtotal + tax + surcharge)
  const calculateGrandTotal = useCallback(() => {
    const numAmount = parseFloat(displayAmount || '0');
    const tax = calculatorService.calculateTax(numAmount, taxRate);
    const subtotalPlusTax = numAmount + tax;
    const surcharge = subtotalPlusTax * ccSurchargeRate;
    return (subtotalPlusTax + surcharge).toFixed(2);
  }, [displayAmount, taxRate, ccSurchargeRate]);

  const handleNumberPress = useCallback((num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If display is "0.00" or "0", start fresh
    if (displayAmount === '0.00' || displayAmount === '0') {
      setDisplayAmount(num);
      return;
    }

    // Check if there's a decimal point
    const hasDecimal = displayAmount.includes('.');
    if (hasDecimal) {
      const decimalPart = displayAmount.split('.')[1];
      // Limit to 2 decimal places
      if (decimalPart.length >= 2) {
        return;
      }
    }

    // Limit total length to 10 characters (including decimal)
    if (displayAmount.length >= 10) {
      return;
    }

    setDisplayAmount(displayAmount + num);
  }, [displayAmount]);

  const handleDecimal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Don't add decimal if one already exists
    if (displayAmount.includes('.')) {
      return;
    }

    // If empty or "0.00", start with "0."
    if (!displayAmount || displayAmount === '0.00' || displayAmount === '0') {
      setDisplayAmount('0.');
      return;
    }

    setDisplayAmount(displayAmount + '.');
  }, [displayAmount]);

  const handleClear = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAmount('');
    setDisplayAmount(initialAmount ? initialAmount.toFixed(2) : '0.00');
    stateManager.reset();
  }, [stateManager, initialAmount]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!displayAmount || displayAmount === '0.00' || displayAmount === '0') {
      return;
    }

    const newAmount = displayAmount.slice(0, -1);
    setDisplayAmount(newAmount || '0.00');
  }, [displayAmount]);

  const handleProcessPayment = useCallback(async (
    processSale: (amount: number, tax: number) => Promise<unknown>
  ) => {
    const validation = calculatorService.validateAmount(parseFloat(displayAmount));

    if (!validation.isValid) {
      Alert.alert('Invalid Amount', validation.errors.join('\n'));
      logger.warn('Payment validation failed', 'handleProcessPayment', {
        errors: validation.errors,
        amount: displayAmount
      });
      return;
    }

    // Generate transaction ID
    const transactionId = `${Date.now()}`;
    const now = new Date();

    // Calculate and store transaction amount including CC surcharge
    const subtotalNum = parseFloat(displayAmount);
    const tax = calculatorService.calculateTax(subtotalNum, taxRate);
    const subtotalPlusTax = subtotalNum + tax;
    const ccSurcharge = subtotalPlusTax * ccSurchargeRate;
    const grandTotal = subtotalPlusTax + ccSurcharge;
    setTransactionAmount(grandTotal.toFixed(2));

    // Set payment start time for progress modal
    setPaymentStartTime(now);
    setApprovalCode(null);
    setCardBrand(null);
    setLastFour(null);
    setErrorMessage(null);

    logger.info(`🚀 PAYMENT PROCESSING INITIATED BY HOOK`, 'handleProcessPayment', {
      timestamp: now.toISOString(),
      transactionId,
      amount: displayAmount,
      taxRate: (taxRate * 100).toFixed(1) + '%',
      currentState: stateManager.getCurrentState(),
    });

    try {
      const taxAmount = calculatorService.calculateTax(parseFloat(displayAmount), taxRate);

      // === STEP 1: Create and save pending transaction to SQLite ===
      const transactionRecord: TransactionRecord = {
        id: transactionId,
        created_at: now.toISOString(),
        transaction_date: now.toISOString().split('T')[0],
        transaction_time: now.toISOString().split('T')[1].substring(0, 8),
        transaction_datetime: now.toISOString(),
        amount: grandTotal,
        subtotal: subtotalNum,
        tax: taxAmount,
        processing_fee: ccSurcharge,
        currency: 'USD',
        status: 'pending',
        payment_method: 'card',
        terminal_ip: terminalConfig.ip,
        terminal_port: terminalConfig.port,
        terminal_name: terminalConfig.name,
        is_refunded: 0,
        sync_status: 'local'
      };

      // Save to SQLite (fail-safe - don't block payment if storage fails)
      try {
        const storageService = TransactionStorageService.getInstance();
        const saveResult = await storageService.saveTransaction(transactionRecord);

        if (!saveResult.success) {
          logger.warn('⚠️ Failed to save pending transaction - continuing with payment', 'handleProcessPayment', {
            error: saveResult.error?.message,
            transactionId
          });
        } else {
          logger.info('✅ Pending transaction saved to SQLite', 'handleProcessPayment', {
            transactionId: saveResult.data,
            status: 'pending'
          });
        }
      } catch (storageError) {
        logger.error('💥 Exception saving pending transaction - continuing with payment',
          storageError instanceof Error ? storageError : new Error(String(storageError)),
          'handleProcessPayment',
          { transactionId }
        );
        // Continue with payment anyway
      }

      // === STEP 2: Set UI state to PROCESSING ===
      transitionPaymentState(PaymentState.PROCESSING);
      setTransactionResult('');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      logger.info('📊 AMOUNT CALCULATION COMPLETE', 'handleProcessPayment', {
        timestamp: new Date().toISOString(),
        subtotal: subtotalNum.toFixed(2),
        tax: taxAmount.toFixed(2),
        ccSurcharge: ccSurcharge.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        taxRate: (taxRate * 100).toFixed(1) + '%',
        ccRate: (ccSurchargeRate * 100).toFixed(1) + '%',
      });

      // === STEP 3: Process payment via terminal ===
      // Send grand total (subtotal + tax + CC surcharge) to terminal
      // Terminal receives: amount = subtotal + ccSurcharge, tax = taxAmount
      // So terminal charges: amount + tax = grandTotal
      const amountForTerminal = subtotalNum + ccSurcharge;
      const result = await processSale(amountForTerminal, taxAmount) as Record<string, unknown>;

      logger.info('📨 PAYMENT PROCESSING RESULT RECEIVED', 'handleProcessPayment', {
        timestamp: new Date().toISOString(),
        status: result?.status,
        responseText: result?.responseText,
        approvalCode: result?.approvalCode,
        transactionId: result?.transactionId,
        amount: displayAmount,
        total: (parseFloat(displayAmount) + taxAmount).toFixed(2)
      });

      // === STEP 4: Update transaction with response data ===
      if (result) {
        const updateData: Partial<TransactionRecord> = {
          status: result.status === '00' ? 'approved' : 'declined',
          response_code: String(result.status || ''),
          response_text: String(result.responseText || ''),
          updated_at: new Date().toISOString()
        };

        // Add optional fields if they exist
        if (result.approvalCode) updateData.approval_code = String(result.approvalCode);
        if (result.guid) updateData.guid = String(result.guid);
        if (result.purchaseId) updateData.purchase_id = String(result.purchaseId);
        if (result.cardBrand) updateData.account_brand = String(result.cardBrand);
        if (result.lastFour) updateData.card_last_four = String(result.lastFour);
        if (result.transactionDate) updateData.tran_date = String(result.transactionDate);
        if (result.transactionTime) updateData.tran_time = String(result.transactionTime);

        // Update SQLite (fail-safe)
        try {
          const storageService = TransactionStorageService.getInstance();
          const updateResult = await storageService.updateTransaction(transactionId, updateData);

          if (!updateResult.success) {
            logger.error('❌ Failed to update transaction with response',
              new Error(updateResult.error?.message || 'Unknown error'),
              'handleProcessPayment',
              { transactionId }
            );
          } else {
            logger.info('✅ Transaction updated with terminal response', 'handleProcessPayment', {
              transactionId,
              status: updateData.status,
              approvalCode: updateData.approval_code,
              cardBrand: updateData.account_brand,
              lastFour: updateData.card_last_four
            });
          }
        } catch (storageError) {
          logger.error('💥 Exception updating transaction',
            storageError instanceof Error ? storageError : new Error(String(storageError)),
            'handleProcessPayment',
            { transactionId }
          );
          // Payment already completed, just log the error
        }
      }

      // === STEP 5: Update UI state ===
      if (result && result.status === '00') {
        transitionPaymentState(PaymentState.SUCCESS);
        setTransactionResult(`Transaction approved! Approval: ${result.approvalCode}`);

        // Set transaction details for modal
        setApprovalCode(result.approvalCode ? String(result.approvalCode) : null);
        setCardBrand(result.cardBrand ? String(result.cardBrand) : null);
        setLastFour(result.lastFour ? String(result.lastFour) : null);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        logger.info('✅ Payment approved successfully', 'handleProcessPayment', {
          approvalCode: result.approvalCode,
          transactionId: result.transactionId,
          amount: displayAmount
        });

        // Modal will auto-dismiss after 3 seconds and call dismissPaymentModal()
      } else {
        transitionPaymentState(PaymentState.FAILED);
        const errorMsg = result?.responseText ? String(result.responseText) : 'Transaction declined';
        setTransactionResult(errorMsg);
        setErrorMessage(errorMsg);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        logger.warn('❌ Payment declined', 'handleProcessPayment', {
          status: result?.status,
          responseText: result?.responseText,
          transactionId: result?.transactionId
        });

        // Modal will auto-dismiss after 5 seconds and call dismissPaymentModal()
      }
    } catch (error) {
      transitionPaymentState(PaymentState.FAILED);
      const errorMsg = error instanceof Error ? error.message : 'Transaction failed';
      setTransactionResult(errorMsg);
      setErrorMessage(errorMsg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      logger.error('💥 Payment processing exception', error instanceof Error ? error : new Error(String(error)), 'handleProcessPayment', {
        amount: displayAmount,
        errorMessage
      });

      // Modal will auto-dismiss after 5 seconds and call dismissPaymentModal()
    }
  }, [displayAmount, calculatorService, transitionPaymentState, forceResetState, handleClear, logger, taxRate, ccSurchargeRate, terminalConfig, merchantConfig, currentPaymentState]);

  const handleBalanceInquiry = useCallback(async (
    processBalanceInquiry: () => Promise<unknown>
  ) => {
    logger.info('🔍 Starting balance inquiry', 'handleBalanceInquiry', {
      currentState: currentPaymentState
    });

    try {
      transitionPaymentState(PaymentState.PROCESSING);
      setTransactionResult('');

      const result = await processBalanceInquiry() as Record<string, unknown>;

      logger.info('Balance inquiry result received', 'handleBalanceInquiry', {
        success: result?.success,
        balance: result?.availableBalance,
        status: result?.status,
        responseText: result?.responseText
      });

      if (result && result.success) {
        transitionPaymentState(PaymentState.SUCCESS);
        setTransactionResult(`Balance: $${result.availableBalance || 'N/A'}`);

        logger.info('✅ Balance inquiry successful', 'handleBalanceInquiry', {
          balance: result.availableBalance
        });

        setTimeout(() => {
          transitionPaymentState(PaymentState.IDLE);
          setTransactionResult('');
          logger.debug('Balance inquiry auto-reset to IDLE', 'handleBalanceInquiry');
        }, 5000);
      } else {
        transitionPaymentState(PaymentState.FAILED);
        const errMsg = result?.responseText ? String(result.responseText) : 'Balance inquiry failed';
        setTransactionResult(errMsg);

        logger.warn('❌ Balance inquiry failed', 'handleBalanceInquiry', {
          responseText: result?.responseText,
          status: result?.status
        });

        // Modal will auto-dismiss after 5 seconds and call dismissPaymentModal()
      }
    } catch (error) {
      transitionPaymentState(PaymentState.FAILED);
      const errMsg = 'Balance inquiry failed';
      setTransactionResult(errMsg);

      logger.error('💥 Balance inquiry exception', error instanceof Error ? error : new Error(String(error)), 'handleBalanceInquiry');

      // Modal will auto-dismiss after 5 seconds and call dismissPaymentModal()
    }
  }, [transitionPaymentState, forceResetState, logger, currentPaymentState]);


  return {
    // Amount state
    amount,
    displayAmount,
    taxRate,
    ccSurchargeRate,

    // Calculation methods
    calculateTax,
    calculateTotal,
    calculateSurcharge,
    calculateGrandTotal,

    // Input handlers
    handleNumberPress,
    handleDecimal,
    handleDelete,

    // Transaction state
    transactionStatus: currentPaymentState,
    transactionResult,
    isProcessing: currentPaymentState === PaymentState.PROCESSING,
    error: currentPaymentState === PaymentState.FAILED ? transactionResult : null,

    // Payment progress tracking
    paymentStartTime,
    approvalCode,
    cardBrand,
    lastFour,
    errorMessage,
    transactionAmount,

    // Transaction handlers
    handleProcessPayment,
    handleBalanceInquiry,
    processPayment: handleProcessPayment,
    clearTransaction: handleClear,
    dismissPaymentModal,

    // Debug/utility methods
    forceResetPaymentState,
  };
};
