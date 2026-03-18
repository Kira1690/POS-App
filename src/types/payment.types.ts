/**
 * Professional Payment Processing Types
 * Complete payment system with VP3350 integration, split payments, and receipt management
 */

import { BaseEntity, PaymentStatus, PaymentMethod } from './common.types';
import { Order } from './order.types';

// Re-export PaymentMethod for backward compatibility
export { PaymentMethod } from './common.types';

// Enhanced Payment Methods for Professional POS
export enum ProfessionalPaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  SPLIT = 'split',
  VP3350 = 'vp3350',
  TRX = 'trx',
  GIFT_CARD = 'gift_card',
  LOYALTY_POINTS = 'loyalty_points',
  HOUSE_ACCOUNT = 'house_account',
}

// Payment Processing Status
export enum PaymentProcessingStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

// VP3350 Device Status
export enum VP3350DeviceStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  READY = 'ready',
  PROCESSING = 'processing',
  UPDATING = 'updating',
  ERROR = 'error',
}

// Receipt Types
export enum ReceiptType {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  KITCHEN = 'kitchen',
  MANAGER = 'manager',
}

// Split Payment Item
export interface SplitPaymentItem {
  id: string;
  amount: number;
  method: ProfessionalPaymentMethod;
  percentage?: number;
  description: string;
  status: PaymentProcessingStatus;
  
  // Payment specific details
  transactionId?: string;
  authorizationCode?: string;
  cardLast4?: string;
  cashTendered?: number;
  changeAmount?: number;
  giftCardNumber?: string;
  loyaltyPointsUsed?: number;
}

// Professional Payment Interface
export interface ProfessionalPayment extends BaseEntity {
  orderId: string;
  amount: number;
  method: ProfessionalPaymentMethod;
  status: PaymentProcessingStatus;
  
  // Payment Details
  transactionId?: string;
  authorizationCode?: string;
  cardLast4?: string;
  cardType?: string; // VISA, MASTERCARD, AMEX, etc.
  
  // Cash Payment Details
  cashTendered?: number;
  changeAmount?: number;
  
  // Split Payment Details
  splitPayments?: SplitPaymentItem[];
  isSplitPayment: boolean;
  
  // VP3350 Specific
  vp3350Response?: VP3350PaymentResult;
  deviceId?: string;
  
  // Professional Tracking
  processedAt?: string;
  processedBy: string; // Staff member ID
  
  // Receipt Information
  receiptId?: string;
  receiptPrinted: boolean;
  receiptEmailed: boolean;
  receiptSmsed: boolean;
  receiptPrintedAt?: string;
  receiptEmailedAt?: string;
  receiptSmsedAt?: string;

  // Refund Information
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;

  // Void Information
  voidReason?: string;
  voidedAt?: string;

  // Error and Recovery
  errorMessage?: string;
  retryCount: number;
  originalAmount?: number; // For partial refunds
  
  // Audit Trail
  createdBy: string;
  approvedBy?: string; // For high-value transactions
  managerOverride?: boolean;
  
  // Additional Metadata
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  
  // Tax and Tip Information
  taxAmount: number;
  tipAmount: number;
  tipPercentage?: number;
  processingFee?: number;
  
  // Loyalty and Promotions
  loyaltyPointsEarned?: number;
  loyaltyPointsUsed?: number;
  discountApplied?: number;
  promoCode?: string;
}

// VP3350 Payment Result
export interface VP3350PaymentResult {
  success: boolean;
  transactionId: string;
  authorizationCode: string;
  cardLast4: string;
  cardType: string;
  amount: number;
  currency: string;
  responseCode: string;
  responseMessage: string;
  signature?: string;
  receiptData?: string;
  errorMessage?: string;
  
  // Device Information
  deviceSerial?: string;
  terminalId?: string;
  merchantId?: string;
  
  // Transaction Metadata
  processedAt: string;
  emvData?: Record<string, any>;
  contactlessUsed?: boolean;
  pinVerified?: boolean;
  signatureRequired?: boolean;
}

// VP3350 Device Configuration
export interface VP3350DeviceConfig {
  deviceName: string;
  bluetoothId: string;
  terminalId: string;
  merchantId: string;
  currency: string;
  timeout: number; // seconds
  autoConnect: boolean;
  enableContactless: boolean;
  enableChip: boolean;
  enableSwipe: boolean;
  enablePin: boolean;
  connectionType?: 'bluetooth' | 'usb' | 'serial';
}

// Receipt Data Structure
export interface Receipt {
  id: string;
  orderId: string;
  paymentId: string;
  type: ReceiptType;
  
  // Receipt Content
  header: ReceiptHeader;
  orderItems: ReceiptOrderItem[];
  totals: ReceiptTotals;
  payment: ReceiptPaymentInfo;
  footer: ReceiptFooter;
  
  // Receipt Metadata
  generatedAt: string;
  generatedBy: string;
  printedAt?: string;
  emailedAt?: string;
  smsedAt?: string;
  
  // Formatting
  format: 'thermal' | 'standard' | 'email' | 'sms';
  width: number; // Characters for thermal printers
  template: string;
}

// Receipt Components
export interface ReceiptHeader {
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantEmail?: string;
  logo?: string;
  
  orderNumber: string;
  tableNumber?: string;
  serverName?: string;
  date: string;
  time: string;
}

export interface ReceiptOrderItem {
  quantity: number;
  name: string;
  unitPrice: number;
  totalPrice: number;
  modifiers?: string[];
  specialInstructions?: string;
}

export interface ReceiptTotals {
  subtotal: number;
  tax: number;
  taxRate: number;
  tip: number;
  tipRate?: number;
  discount?: number;
  total: number;
}

export interface ReceiptPaymentInfo {
  method: string;
  amount: number;
  cardLast4?: string;
  authCode?: string;
  transactionId?: string;
  cashTendered?: number;
  changeGiven?: number;
  splitPayments?: ReceiptSplitPayment[];
}

export interface ReceiptSplitPayment {
  method: string;
  amount: number;
  details?: string;
}

export interface ReceiptFooter {
  thankYouMessage: string;
  returnPolicy?: string;
  website?: string;
  socialMedia?: string;
  surveyUrl?: string;
  loyaltyInfo?: string;
}

// Payment Processing Request Interfaces
export interface ProcessPaymentRequest {
  orderId: string;
  order?: string; // Alias for orderId (backward compatibility)
  orderData?: Order; // Full order object for receipt generation
  amount: number;
  method: ProfessionalPaymentMethod;

  // Payment Method Specific
  cashTendered?: number;
  tipAmount?: number;
  tipPercentage?: number;

  // Customer Information
  customerEmail?: string;
  customerPhone?: string;

  // Split Payment
  splitPayments?: Omit<SplitPaymentItem, 'id' | 'status'>[];

  // Receipt Options
  printReceipt?: boolean;
  emailReceipt?: boolean;
  smsReceipt?: boolean;

  // Professional Options
  notes?: string;
  managerApproval?: boolean;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
  refundedBy: string;
  managerApproval?: boolean;
  notifyCustomer?: boolean;
}

// Payment Context State
export interface PaymentContextState {
  // Current Payment Processing
  currentPayment: ProfessionalPayment | null;
  processingStatus: PaymentProcessingStatus;
  
  // VP3350 Device Management
  vp3350Status: VP3350DeviceStatus;
  vp3350Config: VP3350DeviceConfig | null;
  connectedDevices: VP3350DeviceConfig[];
  
  // Payment History
  payments: ProfessionalPayment[];
  receipts: Receipt[];
  
  // UI State
  showPaymentModal: boolean;
  showReceiptPreview: boolean;
  showSplitPaymentModal: boolean;
  
  // Error and Loading States
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  taxRate: number;
  defaultTipRates: number[]; // [15, 18, 20, 25]
  minimumTipAmount: number;
  maximumCashPayment: number;
  
  // Receipt Settings
  receiptSettings: {
    printAutomatically: boolean;
    emailByDefault: boolean;
    thermalPrinterWidth: number;
    receiptTemplate: string;
  };
}

// Payment Service Interface
export interface PaymentServiceInterface {
  // Payment Processing
  processCardPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment>;
  processCashPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment>;
  processSplitPayment(request: ProcessPaymentRequest): Promise<ProfessionalPayment>;
  
  // VP3350 Integration
  connectVP3350(config: VP3350DeviceConfig): Promise<void>;
  disconnectVP3350(): Promise<void>;
  processVP3350Payment(amount: number): Promise<VP3350PaymentResult>;
  getVP3350Status(): Promise<VP3350DeviceStatus>;
  
  // Receipt Management
  generateReceipt(paymentId: string, type: ReceiptType): Promise<Receipt>;
  printReceipt(receiptId: string): Promise<void>;
  emailReceipt(receiptId: string, email: string): Promise<void>;
  smsReceipt(receiptId: string, phone: string): Promise<void>;
  
  // Payment Management
  getPaymentHistory(orderId?: string): Promise<ProfessionalPayment[]>;
  refundPayment(request: RefundPaymentRequest): Promise<ProfessionalPayment>;
  voidPayment(paymentId: string, reason: string): Promise<void>;
  
  // Reporting
  getPaymentAnalytics(dateFrom: string, dateTo: string): Promise<PaymentAnalytics>;
}

// Payment Analytics Interface
export interface PaymentAnalytics {
  totalTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  
  paymentMethodBreakdown: {
    method: ProfessionalPaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }[];
  
  dailyTotals: {
    date: string;
    transactions: number;
    amount: number;
  }[];
  
  tipAnalytics: {
    totalTips: number;
    averageTip: number;
    averageTipPercentage: number;
    tipDistribution: {
      range: string;
      count: number;
    }[];
  };
  
  refundAnalytics: {
    totalRefunds: number;
    refundAmount: number;
    refundRate: number;
  };

  dateRange?: {
    from: string;
    to: string;
  };

  peakHours?: {
    hour: number;
    transactions: number;
    amount: number;
  }[];
}

// Error Types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
  userMessage: string;
}

// Mock Payment Types (for development)
export interface MockPaymentConfig {
  simulateDelay: boolean;
  defaultDelay: number;
  simulateFailures: boolean;
  failureRate: number;
  vp3350Available: boolean;
}