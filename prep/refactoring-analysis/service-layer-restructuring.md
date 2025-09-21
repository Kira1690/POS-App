# Service Layer Restructuring Plan

## Overview

This document outlines the comprehensive restructuring of the service layer to achieve SOLID principle compliance, proper dependency injection, and enterprise-grade architecture patterns while maintaining 100% functionality.

## Current Service Layer Issues

### Critical Problems Identified

#### 1. PaymentService.ts (601 lines)
**VIOLATIONS:**
- Handles ALL payment methods (Card, Cash, VP3350, Split)
- Receipt generation AND printing
- Device management AND transaction processing  
- Analytics AND error handling
- **Single Responsibility Violation:** 8 distinct responsibilities

#### 2. orderService.ts (412 lines)
**VIOLATIONS:**
- Order CRUD AND business logic
- Kitchen operations AND customer operations
- Status management AND item management
- **Open/Closed Violation:** Adding new order types requires service modification

#### 3. PerformanceAnalyticsService.ts (456 lines)  
**VIOLATIONS:**
- Performance tracking AND business analytics
- Event collection AND reporting
- Multiple analytics domains in single service

### Architecture Problems

#### 1. No Dependency Injection
- Components directly import and instantiate services
- Hard-coded service dependencies
- Difficult to test and mock services

#### 2. Service Coupling
- Services directly call other services
- Circular dependencies between domains
- No clear service boundaries

#### 3. Interface Violations
- No interfaces for service contracts
- Mock services incompatible with real services
- No abstraction layer

## Restructuring Strategy

## Phase 1: Service Decomposition

### 1.1 PaymentService Decomposition (601 lines → 6 focused services)

#### CardPaymentService.ts (80 lines)
**Single Responsibility:** Credit/debit card payment processing only
```typescript
// src/services/payment/card/CardPaymentService.ts
interface ICardPaymentService {
  processPayment(request: CardPaymentRequest): Promise<CardPaymentResult>;
  refundPayment(refundRequest: RefundRequest): Promise<RefundResult>;
  validateCardInfo(cardInfo: CardInfo): Promise<ValidationResult>;
}

class CardPaymentService implements ICardPaymentService {
  private cardGateway: ICardGateway;
  private logger: ILogger;
  
  constructor(
    cardGateway: ICardGateway,
    logger: ILogger
  ) {
    this.cardGateway = cardGateway;
    this.logger = logger;
  }

  async processPayment(request: CardPaymentRequest): Promise<CardPaymentResult> {
    try {
      this.logger.info('Processing card payment', { amount: request.amount });
      
      const validationResult = await this.validateCardInfo(request.cardInfo);
      if (!validationResult.isValid) {
        throw new PaymentValidationError(validationResult.errors);
      }

      const gatewayResult = await this.cardGateway.processPayment({
        cardInfo: request.cardInfo,
        amount: request.amount,
        currency: request.currency,
        merchantId: request.merchantId
      });

      return {
        success: gatewayResult.success,
        transactionId: gatewayResult.transactionId,
        authCode: gatewayResult.authorizationCode,
        amount: request.amount,
        timestamp: new Date().toISOString(),
        cardLast4: request.cardInfo.last4,
        cardType: request.cardInfo.type
      };
    } catch (error) {
      this.logger.error('Card payment failed', error);
      throw new CardPaymentError(error.message);
    }
  }
  
  // Additional methods...
}
```

#### CashPaymentService.ts (60 lines)
**Single Responsibility:** Cash transaction handling only
```typescript
// src/services/payment/cash/CashPaymentService.ts
interface ICashPaymentService {
  processCashPayment(request: CashPaymentRequest): Promise<CashPaymentResult>;
  calculateChange(orderAmount: number, cashReceived: number): ChangeCalculation;
  validateCashAmount(amount: number): ValidationResult;
}

class CashPaymentService implements ICashPaymentService {
  private logger: ILogger;
  
  constructor(logger: ILogger) {
    this.logger = logger;
  }

  async processCashPayment(request: CashPaymentRequest): Promise<CashPaymentResult> {
    this.logger.info('Processing cash payment', { amount: request.amount });
    
    const validation = this.validateCashAmount(request.cashReceived);
    if (!validation.isValid) {
      throw new CashPaymentError(validation.errors.join(', '));
    }

    const change = this.calculateChange(request.amount, request.cashReceived);
    
    return {
      success: true,
      transactionId: this.generateTransactionId(),
      amount: request.amount,
      cashReceived: request.cashReceived,
      change: change.changeAmount,
      timestamp: new Date().toISOString()
    };
  }

  calculateChange(orderAmount: number, cashReceived: number): ChangeCalculation {
    if (cashReceived < orderAmount) {
      throw new InsufficientCashError('Cash received is less than order amount');
    }

    const changeAmount = cashReceived - orderAmount;
    return {
      changeAmount,
      denominations: this.calculateDenominations(changeAmount)
    };
  }
  
  // Additional methods...
}
```

#### VP3350DeviceService.ts (120 lines)
**Single Responsibility:** VP3350 Bluetooth device integration only
```typescript
// src/services/payment/vp3350/VP3350DeviceService.ts
interface IVP3350DeviceService {
  connectDevice(): Promise<VP3350Connection>;
  disconnectDevice(): Promise<void>;
  processPayment(request: VP3350PaymentRequest): Promise<VP3350PaymentResult>;
  getDeviceStatus(): Promise<VP3350DeviceStatus>;
}

class VP3350DeviceService implements IVP3350DeviceService {
  private deviceConnection: VP3350Connection | null = null;
  private eventEmitter: EventEmitter;
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.eventEmitter = new EventEmitter();
    this.setupDeviceEventListeners();
  }

  async connectDevice(): Promise<VP3350Connection> {
    try {
      this.logger.info('Attempting VP3350 device connection');
      
      const connection = await VP3350SDK.connect({
        deviceName: 'VP3350',
        timeout: 10000
      });

      this.deviceConnection = connection;
      this.eventEmitter.emit('device:connected', connection);
      
      return connection;
    } catch (error) {
      this.logger.error('VP3350 connection failed', error);
      throw new VP3350ConnectionError(error.message);
    }
  }

  async processPayment(request: VP3350PaymentRequest): Promise<VP3350PaymentResult> {
    if (!this.deviceConnection || !this.deviceConnection.isConnected) {
      throw new VP3350DeviceNotConnectedError();
    }

    try {
      const result = await this.deviceConnection.processPayment({
        amount: request.amount,
        transactionType: request.transactionType,
        timeout: 60000
      });

      return {
        success: result.success,
        transactionId: result.transactionId,
        authCode: result.authorizationCode,
        cardType: result.cardType,
        last4: result.cardLast4,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('VP3350 payment failed', error);
      throw new VP3350PaymentError(error.message);
    }
  }
  
  // Additional methods...
}
```

#### SplitPaymentService.ts (90 lines)
**Single Responsibility:** Split payment coordination only
```typescript
// src/services/payment/split/SplitPaymentService.ts
interface ISplitPaymentService {
  processSplitPayment(items: SplitPaymentItem[]): Promise<SplitPaymentResult>;
  validateSplitItems(items: SplitPaymentItem[]): ValidationResult;
  calculateSplitAmounts(totalAmount: number, splits: PaymentSplit[]): SplitCalculation;
}

class SplitPaymentService implements ISplitPaymentService {
  private cardService: ICardPaymentService;
  private cashService: ICashPaymentService;
  private logger: ILogger;

  constructor(
    cardService: ICardPaymentService,
    cashService: ICashPaymentService,
    logger: ILogger
  ) {
    this.cardService = cardService;
    this.cashService = cashService;
    this.logger = logger;
  }

  async processSplitPayment(items: SplitPaymentItem[]): Promise<SplitPaymentResult> {
    const validation = this.validateSplitItems(items);
    if (!validation.isValid) {
      throw new SplitPaymentValidationError(validation.errors);
    }

    const results: PaymentResult[] = [];
    let totalProcessed = 0;

    for (const item of items) {
      let result: PaymentResult;
      
      switch (item.method) {
        case 'CARD':
          result = await this.cardService.processPayment(item.cardRequest);
          break;
        case 'CASH':
          result = await this.cashService.processCashPayment(item.cashRequest);
          break;
        default:
          throw new UnsupportedPaymentMethodError(item.method);
      }

      results.push(result);
      totalProcessed += result.amount;
    }

    return {
      success: results.every(r => r.success),
      paymentResults: results,
      totalAmount: totalProcessed,
      transactionId: this.generateSplitTransactionId(),
      timestamp: new Date().toISOString()
    };
  }
  
  // Additional methods...
}
```

#### ReceiptService.ts (120 lines)
**Single Responsibility:** Receipt generation and printing only
```typescript
// src/services/receipt/ReceiptService.ts
interface IReceiptService {
  generateReceipt(order: Order, payment: Payment): Promise<Receipt>;
  printReceipt(receipt: Receipt): Promise<PrintResult>;
  formatReceiptData(data: ReceiptData): FormattedReceipt;
}

class ReceiptService implements IReceiptService {
  private printerService: IPrinterService;
  private templateEngine: ITemplateEngine;
  private logger: ILogger;

  constructor(
    printerService: IPrinterService,
    templateEngine: ITemplateEngine,
    logger: ILogger
  ) {
    this.printerService = printerService;
    this.templateEngine = templateEngine;
    this.logger = logger;
  }

  async generateReceipt(order: Order, payment: Payment): Promise<Receipt> {
    this.logger.info('Generating receipt', { orderId: order.id });

    const receiptData: ReceiptData = {
      header: this.buildReceiptHeader(order),
      items: this.buildReceiptItems(order.items),
      totals: this.buildReceiptTotals(order),
      payment: this.buildReceiptPayment(payment),
      footer: this.buildReceiptFooter()
    };

    const formattedReceipt = this.formatReceiptData(receiptData);
    
    return {
      id: this.generateReceiptId(),
      orderId: order.id,
      content: formattedReceipt.content,
      format: 'text/plain',
      timestamp: new Date().toISOString()
    };
  }

  async printReceipt(receipt: Receipt): Promise<PrintResult> {
    try {
      this.logger.info('Printing receipt', { receiptId: receipt.id });
      
      const printResult = await this.printerService.print({
        content: receipt.content,
        copies: 1,
        paperSize: 'thermal_80mm'
      });

      return {
        success: printResult.success,
        printerId: printResult.printerId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Receipt printing failed', error);
      throw new ReceiptPrintError(error.message);
    }
  }
  
  // Additional methods...
}
```

#### PaymentAnalyticsService.ts (80 lines)
**Single Responsibility:** Payment analytics and reporting only
```typescript
// src/services/payment/analytics/PaymentAnalyticsService.ts
interface IPaymentAnalyticsService {
  trackPaymentEvent(event: PaymentEvent): Promise<void>;
  generatePaymentReport(params: PaymentReportParams): Promise<PaymentReport>;
  getPaymentMetrics(timeRange: TimeRange): Promise<PaymentMetrics>;
}

class PaymentAnalyticsService implements IPaymentAnalyticsService {
  private analyticsClient: IAnalyticsClient;
  private logger: ILogger;

  constructor(
    analyticsClient: IAnalyticsClient,
    logger: ILogger
  ) {
    this.analyticsClient = analyticsClient;
    this.logger = logger;
  }

  async trackPaymentEvent(event: PaymentEvent): Promise<void> {
    try {
      await this.analyticsClient.track({
        event: event.type,
        properties: {
          amount: event.amount,
          method: event.method,
          success: event.success,
          timestamp: event.timestamp
        },
        context: {
          restaurantId: event.restaurantId,
          userId: event.userId
        }
      });
    } catch (error) {
      this.logger.error('Failed to track payment event', error);
      // Don't throw - analytics failures shouldn't break payment flow
    }
  }
  
  // Additional methods...
}
```

### 1.2 OrderService Decomposition (412 lines → 4 focused services)

#### OrderCRUDService.ts (120 lines)
**Single Responsibility:** Order CRUD operations only
```typescript
// src/services/order/crud/OrderCRUDService.ts
interface IOrderCRUDService {
  createOrder(request: CreateOrderRequest): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  updateOrder(orderId: string, updates: OrderUpdateRequest): Promise<Order>;
  deleteOrder(orderId: string): Promise<void>;
}

class OrderCRUDService implements IOrderCRUDService {
  private apiClient: IApiClient;
  private logger: ILogger;

  constructor(
    apiClient: IApiClient,
    logger: ILogger
  ) {
    this.apiClient = apiClient;
    this.logger = logger;
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    this.logger.info('Creating order', { tableId: request.tableId });
    
    const response = await this.apiClient.post<Order>('/orders', request);
    
    if (!response.success) {
      throw new OrderCreationError(response.message);
    }
    
    return response.data;
  }
  
  // Additional CRUD methods...
}
```

#### OrderStatusService.ts (90 lines)
**Single Responsibility:** Order status management only
```typescript
// src/services/order/status/OrderStatusService.ts
interface IOrderStatusService {
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  getStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
  canTransitionToStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean;
}

class OrderStatusService implements IOrderStatusService {
  private apiClient: IApiClient;
  private businessRules: IOrderBusinessRules;
  private logger: ILogger;

  constructor(
    apiClient: IApiClient,
    businessRules: IOrderBusinessRules,
    logger: ILogger
  ) {
    this.apiClient = apiClient;
    this.businessRules = businessRules;
    this.logger = logger;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    if (!this.canTransitionToStatus(order.status, status)) {
      throw new InvalidStatusTransitionError(order.status, status);
    }

    const response = await this.apiClient.patch<Order>(`/orders/${orderId}/status`, {
      status,
      updatedAt: new Date().toISOString()
    });

    return response.data;
  }
  
  // Additional status methods...
}
```

#### KitchenOrderService.ts (100 lines)
**Single Responsibility:** Kitchen operations only
```typescript
// src/services/order/kitchen/KitchenOrderService.ts
interface IKitchenOrderService {
  getKitchenOrders(): Promise<KitchenOrder[]>;
  updateItemStatus(orderId: string, itemId: string, status: OrderItemStatus): Promise<void>;
  markItemComplete(orderId: string, itemId: string): Promise<void>;
  getKitchenMetrics(): Promise<KitchenMetrics>;
}

class KitchenOrderService implements IKitchenOrderService {
  private apiClient: IApiClient;
  private websocket: IWebSocketService;
  private logger: ILogger;

  constructor(
    apiClient: IApiClient,
    websocket: IWebSocketService,
    logger: ILogger
  ) {
    this.apiClient = apiClient;
    this.websocket = websocket;
    this.logger = logger;
  }
  
  // Kitchen-specific methods...
}
```

#### OrderBusinessRulesService.ts (80 lines)
**Single Responsibility:** Order business logic validation only
```typescript
// src/services/order/rules/OrderBusinessRulesService.ts
interface IOrderBusinessRulesService {
  validateOrder(order: Order): ValidationResult;
  canModifyOrder(order: Order): boolean;
  calculateOrderTotals(items: OrderItem[]): OrderTotals;
}

class OrderBusinessRulesService implements IOrderBusinessRulesService {
  private taxCalculator: ITaxCalculator;
  
  constructor(taxCalculator: ITaxCalculator) {
    this.taxCalculator = taxCalculator;
  }
  
  // Business rules methods...
}
```

## Phase 2: Dependency Injection Implementation

### 2.1 Service Container

#### ServiceContainer.ts (150 lines)
```typescript
// src/services/core/ServiceContainer.ts
interface ServiceRegistration<T = any> {
  name: string;
  factory: () => T;
  singleton?: boolean;
  dependencies?: string[];
}

class ServiceContainer {
  private services = new Map<string, ServiceRegistration>();
  private singletonInstances = new Map<string, any>();

  register<T>(registration: ServiceRegistration<T>): void {
    this.services.set(registration.name, registration);
  }

  resolve<T>(serviceName: string): T {
    const registration = this.services.get(serviceName);
    if (!registration) {
      throw new ServiceNotRegisteredError(serviceName);
    }

    // Handle singleton instances
    if (registration.singleton) {
      if (this.singletonInstances.has(serviceName)) {
        return this.singletonInstances.get(serviceName);
      }
      
      const instance = this.createInstance<T>(registration);
      this.singletonInstances.set(serviceName, instance);
      return instance;
    }

    return this.createInstance<T>(registration);
  }

  private createInstance<T>(registration: ServiceRegistration<T>): T {
    // Resolve dependencies first
    const dependencies: any[] = [];
    
    if (registration.dependencies) {
      for (const depName of registration.dependencies) {
        dependencies.push(this.resolve(depName));
      }
    }

    return registration.factory();
  }

  createScope(): ServiceScope {
    return new ServiceScope(this);
  }
}

class ServiceScope {
  private scopedInstances = new Map<string, any>();
  
  constructor(private container: ServiceContainer) {}

  resolve<T>(serviceName: string): T {
    if (this.scopedInstances.has(serviceName)) {
      return this.scopedInstances.get(serviceName);
    }

    const instance = this.container.resolve<T>(serviceName);
    this.scopedInstances.set(serviceName, instance);
    return instance;
  }

  dispose(): void {
    // Cleanup scoped instances
    this.scopedInstances.clear();
  }
}
```

### 2.2 Service Registration

#### serviceRegistration.ts (200 lines)
```typescript
// src/services/core/serviceRegistration.ts
import { ServiceContainer } from './ServiceContainer';

export function registerServices(container: ServiceContainer): void {
  // Core services
  registerCoreServices(container);
  
  // Payment services
  registerPaymentServices(container);
  
  // Order services
  registerOrderServices(container);
  
  // Infrastructure services
  registerInfrastructureServices(container);
}

function registerPaymentServices(container: ServiceContainer): void {
  // Card Payment Service
  container.register({
    name: 'cardPaymentService',
    factory: () => new CardPaymentService(
      container.resolve('cardGateway'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['cardGateway', 'logger']
  });

  // Cash Payment Service
  container.register({
    name: 'cashPaymentService',
    factory: () => new CashPaymentService(
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['logger']
  });

  // VP3350 Device Service
  container.register({
    name: 'vp3350DeviceService',
    factory: () => new VP3350DeviceService(
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['logger']
  });

  // Split Payment Service
  container.register({
    name: 'splitPaymentService',
    factory: () => new SplitPaymentService(
      container.resolve('cardPaymentService'),
      container.resolve('cashPaymentService'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['cardPaymentService', 'cashPaymentService', 'logger']
  });

  // Receipt Service
  container.register({
    name: 'receiptService',
    factory: () => new ReceiptService(
      container.resolve('printerService'),
      container.resolve('templateEngine'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['printerService', 'templateEngine', 'logger']
  });

  // Composite Payment Service
  container.register({
    name: 'paymentService',
    factory: () => new CompositePaymentService(
      container.resolve('cardPaymentService'),
      container.resolve('cashPaymentService'),
      container.resolve('vp3350DeviceService'),
      container.resolve('splitPaymentService'),
      container.resolve('receiptService')
    ),
    singleton: true,
    dependencies: [
      'cardPaymentService', 
      'cashPaymentService', 
      'vp3350DeviceService',
      'splitPaymentService',
      'receiptService'
    ]
  });
}

function registerOrderServices(container: ServiceContainer): void {
  // Order CRUD Service
  container.register({
    name: 'orderCRUDService',
    factory: () => new OrderCRUDService(
      container.resolve('apiClient'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['apiClient', 'logger']
  });

  // Order Status Service
  container.register({
    name: 'orderStatusService',
    factory: () => new OrderStatusService(
      container.resolve('apiClient'),
      container.resolve('orderBusinessRules'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['apiClient', 'orderBusinessRules', 'logger']
  });

  // Kitchen Order Service
  container.register({
    name: 'kitchenOrderService',
    factory: () => new KitchenOrderService(
      container.resolve('apiClient'),
      container.resolve('websocketService'),
      container.resolve('logger')
    ),
    singleton: true,
    dependencies: ['apiClient', 'websocketService', 'logger']
  });

  // Composite Order Service
  container.register({
    name: 'orderService',
    factory: () => new CompositeOrderService(
      container.resolve('orderCRUDService'),
      container.resolve('orderStatusService'),
      container.resolve('kitchenOrderService'),
      container.resolve('orderBusinessRules')
    ),
    singleton: true,
    dependencies: [
      'orderCRUDService',
      'orderStatusService', 
      'kitchenOrderService',
      'orderBusinessRules'
    ]
  });
}

// Additional registration functions...
```

## Phase 3: Service Composition Patterns

### 3.1 Composite Services

#### CompositePaymentService.ts (120 lines)
```typescript
// src/services/payment/CompositePaymentService.ts
interface IPaymentService {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<RefundResult>;
  generateReceipt(order: Order, payment: Payment): Promise<Receipt>;
  printReceipt(receipt: Receipt): Promise<PrintResult>;
}

class CompositePaymentService implements IPaymentService {
  private cardService: ICardPaymentService;
  private cashService: ICashPaymentService;
  private vp3350Service: IVP3350DeviceService;
  private splitService: ISplitPaymentService;
  private receiptService: IReceiptService;

  constructor(
    cardService: ICardPaymentService,
    cashService: ICashPaymentService,
    vp3350Service: IVP3350DeviceService,
    splitService: ISplitPaymentService,
    receiptService: IReceiptService
  ) {
    this.cardService = cardService;
    this.cashService = cashService;
    this.vp3350Service = vp3350Service;
    this.splitService = splitService;
    this.receiptService = receiptService;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    switch (request.method) {
      case ProfessionalPaymentMethod.CARD:
        return await this.cardService.processPayment(request as CardPaymentRequest);
        
      case ProfessionalPaymentMethod.CASH:
        return await this.cashService.processCashPayment(request as CashPaymentRequest);
        
      case ProfessionalPaymentMethod.VP3350:
        return await this.vp3350Service.processPayment(request as VP3350PaymentRequest);
        
      case ProfessionalPaymentMethod.SPLIT:
        return await this.splitService.processSplitPayment(request.splitItems);
        
      default:
        throw new UnsupportedPaymentMethodError(request.method);
    }
  }

  async generateReceipt(order: Order, payment: Payment): Promise<Receipt> {
    return await this.receiptService.generateReceipt(order, payment);
  }

  async printReceipt(receipt: Receipt): Promise<PrintResult> {
    return await this.receiptService.printReceipt(receipt);
  }
}
```

#### CompositeOrderService.ts (100 lines)
```typescript
// src/services/order/CompositeOrderService.ts
interface IOrderService {
  // CRUD operations
  createOrder(request: CreateOrderRequest): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  updateOrder(orderId: string, updates: OrderUpdateRequest): Promise<Order>;
  
  // Status operations
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  
  // Kitchen operations
  getKitchenOrders(): Promise<KitchenOrder[]>;
  updateItemStatus(orderId: string, itemId: string, status: OrderItemStatus): Promise<void>;
}

class CompositeOrderService implements IOrderService {
  private crudService: IOrderCRUDService;
  private statusService: IOrderStatusService;
  private kitchenService: IKitchenOrderService;
  private businessRules: IOrderBusinessRulesService;

  constructor(
    crudService: IOrderCRUDService,
    statusService: IOrderStatusService,
    kitchenService: IKitchenOrderService,
    businessRules: IOrderBusinessRulesService
  ) {
    this.crudService = crudService;
    this.statusService = statusService;
    this.kitchenService = kitchenService;
    this.businessRules = businessRules;
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Validate request using business rules
    const validation = this.businessRules.validateCreateOrderRequest(request);
    if (!validation.isValid) {
      throw new OrderValidationError(validation.errors);
    }

    return await this.crudService.createOrder(request);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return await this.statusService.updateOrderStatus(orderId, status);
  }

  async getKitchenOrders(): Promise<KitchenOrder[]> {
    return await this.kitchenService.getKitchenOrders();
  }
  
  // Delegate other methods to appropriate services...
}
```

### 3.2 Service Factory Pattern

#### PaymentServiceFactory.ts (60 lines)
```typescript
// src/services/payment/factories/PaymentServiceFactory.ts
class PaymentServiceFactory {
  private container: ServiceContainer;

  constructor(container: ServiceContainer) {
    this.container = container;
  }

  createPaymentService(method: ProfessionalPaymentMethod): IPaymentMethodService {
    switch (method) {
      case ProfessionalPaymentMethod.CARD:
        return this.container.resolve<ICardPaymentService>('cardPaymentService');
        
      case ProfessionalPaymentMethod.CASH:
        return this.container.resolve<ICashPaymentService>('cashPaymentService');
        
      case ProfessionalPaymentMethod.VP3350:
        return this.container.resolve<IVP3350DeviceService>('vp3350DeviceService');
        
      default:
        throw new UnsupportedPaymentMethodError(method);
    }
  }

  createCompositePaymentService(): IPaymentService {
    return this.container.resolve<IPaymentService>('paymentService');
  }
}
```

## Phase 4: Hook Integration

### 4.1 Service Hook Pattern

#### useService Hook
```typescript
// src/hooks/core/useService.ts
import { useContext } from 'react';
import { ServiceContext } from '@/context/ServiceContext';

export function useService<T>(serviceName: string): T {
  const serviceContainer = useContext(ServiceContext);
  
  if (!serviceContainer) {
    throw new Error('useService must be used within ServiceProvider');
  }
  
  return serviceContainer.resolve<T>(serviceName);
}

// Usage in components
const OrderScreen = () => {
  const orderService = useService<IOrderService>('orderService');
  const paymentService = useService<IPaymentService>('paymentService');
  
  // Use services...
};
```

#### Business Logic Hooks with Service Integration
```typescript
// src/hooks/order/useOrderActions.ts
export function useOrderActions() {
  const orderService = useService<IOrderService>('orderService');
  const logger = useService<ILogger>('logger');

  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
    try {
      logger.info('Creating order from hook', { tableId: orderData.tableId });
      return await orderService.createOrder(orderData);
    } catch (error) {
      logger.error('Order creation failed', error);
      throw error;
    }
  }, [orderService, logger]);

  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    return await orderService.updateOrderStatus(orderId, status);
  }, [orderService]);

  return {
    createOrder,
    updateStatus,
    // Other actions...
  };
}
```

## Testing Strategy

### 4.1 Service Unit Testing
```typescript
// __tests__/services/CardPaymentService.test.ts
describe('CardPaymentService', () => {
  let cardService: CardPaymentService;
  let mockCardGateway: jest.Mocked<ICardGateway>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockCardGateway = createMockCardGateway();
    mockLogger = createMockLogger();
    cardService = new CardPaymentService(mockCardGateway, mockLogger);
  });

  describe('processPayment', () => {
    it('should process valid card payment', async () => {
      const request: CardPaymentRequest = {
        cardInfo: { number: '4111111111111111', expiry: '12/25', cvv: '123' },
        amount: 100.00,
        currency: 'USD'
      };

      mockCardGateway.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_123',
        authorizationCode: 'auth_456'
      });

      const result = await cardService.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('txn_123');
      expect(mockLogger.info).toHaveBeenCalledWith('Processing card payment', { amount: 100 });
    });
  });
});
```

### 4.2 Service Integration Testing
```typescript
// __tests__/integration/CompositePaymentService.test.ts
describe('CompositePaymentService Integration', () => {
  let paymentService: CompositePaymentService;
  let serviceContainer: ServiceContainer;

  beforeEach(() => {
    serviceContainer = createTestServiceContainer();
    paymentService = serviceContainer.resolve<CompositePaymentService>('paymentService');
  });

  it('should process card payment through composite service', async () => {
    const request: PaymentRequest = {
      method: ProfessionalPaymentMethod.CARD,
      amount: 50.00,
      orderId: 'order_123'
    };

    const result = await paymentService.processPayment(request);
    expect(result.success).toBe(true);
  });
});
```

## Migration Strategy

### 1. Gradual Service Replacement
- Replace services one domain at a time
- Use feature flags to switch between old and new services
- Maintain backward compatibility during transition

### 2. Dependency Injection Migration
- Introduce service container gradually
- Start with new services using DI
- Migrate existing services to use DI

### 3. Interface Introduction
- Create interfaces for existing services
- Update consuming code to use interfaces
- Replace implementations behind interfaces

## Success Metrics

### Code Quality Targets
- **Service Size**: All services <200 lines
- **Single Responsibility**: Each service has one clear domain
- **Test Coverage**: >90% for all new services
- **Dependency Coupling**: Services only depend on interfaces

### Performance Targets
- **Service Creation**: <5ms service instantiation
- **Memory Usage**: 40% reduction in service memory footprint
- **Error Handling**: Consistent error handling across all services

### Maintainability Improvements
- **Service Testability**: Each service can be tested in isolation
- **Service Reusability**: Services can be reused across different contexts
- **Service Composability**: Services can be easily composed into larger services

---

*Service Layer Restructuring Plan completed on: 2025-08-19*  
*Target: Transform 3 monolithic services into 20+ focused, injectable services*