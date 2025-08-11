# Table Management Service Architecture

## API Integration Patterns

### 1. Microservice Integration Strategy

Based on the existing microservices architecture, the table management feature will integrate with multiple backend services:

#### Primary Services
- **Table Management Service** - Core table operations
- **Order Processing Service** - Order creation and management  
- **Menu Management Service** - Menu items and categories
- **Customer Management Service** - Customer data
- **Kitchen Operations Service** - Real-time order updates
- **Notification Service** - WebSocket events

#### API Gateway Integration
All requests will go through the API Gateway (port 4000) which handles:
- JWT authentication
- Request routing to appropriate microservices
- Rate limiting and security
- Automatic token refresh

### 2. Service Layer Implementation

#### TableService Implementation
```typescript
// src/services/tables/TableService.ts
import { SimpleApiClient } from '../api/base/SimpleApiClient';
import { Table, TableReservation, UpdateTableStatusRequest } from '../../types/table.types';

export class TableService {
  private apiClient: SimpleApiClient;
  private wsConnection: WebSocket | null = null;
  private updateCallbacks: Set<(tables: Table[]) => void> = new Set();

  constructor() {
    this.apiClient = new SimpleApiClient('/api/tables');
  }

  // Core table operations
  async getTables(restaurantId: string): Promise<Table[]> {
    const response = await this.apiClient.get<Table[]>('/', {
      params: { restaurant_id: restaurantId }
    });
    return response.data;
  }

  async getTable(tableId: string): Promise<Table> {
    const response = await this.apiClient.get<Table>(`/${tableId}`);
    return response.data;
  }

  async createTable(tableData: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
    const response = await this.apiClient.post<Table>('/', tableData);
    return response.data;
  }

  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    const response = await this.apiClient.patch<Table>(`/${tableId}/status`, updateData);
    return response.data;
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.apiClient.delete(`/${tableId}`);
  }

  // Real-time subscription management
  subscribeToTableUpdates(restaurantId: string, callback: (tables: Table[]) => void): void {
    this.updateCallbacks.add(callback);
    
    if (!this.wsConnection) {
      this.connectWebSocket(restaurantId);
    }
  }

  unsubscribeFromTableUpdates(callback: (tables: Table[]) => void): void {
    this.updateCallbacks.delete(callback);
    
    if (this.updateCallbacks.size === 0) {
      this.disconnectWebSocket();
    }
  }

  private connectWebSocket(restaurantId: string): void {
    const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL}/tables/${restaurantId}`;
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleTableUpdate(update);
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Implement reconnection logic
      setTimeout(() => this.connectWebSocket(restaurantId), 5000);
    };
  }

  private handleTableUpdate(update: any): void {
    // Notify all subscribers of table updates
    this.updateCallbacks.forEach(callback => {
      // This would typically receive the updated table data
      // and the callback would update the local state
      callback(update.tables || []);
    });
  }

  private disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Reservation management
  async createReservation(reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>): Promise<TableReservation> {
    const response = await this.apiClient.post<TableReservation>('/reservations', reservation);
    return response.data;
  }

  async getReservations(tableId: string, date?: string): Promise<TableReservation[]> {
    const response = await this.apiClient.get<TableReservation[]>(`/${tableId}/reservations`, {
      params: date ? { date } : undefined
    });
    return response.data;
  }

  async updateReservation(reservationId: string, updates: Partial<TableReservation>): Promise<TableReservation> {
    const response = await this.apiClient.patch<TableReservation>(`/reservations/${reservationId}`, updates);
    return response.data;
  }

  async cancelReservation(reservationId: string): Promise<void> {
    await this.apiClient.delete(`/reservations/${reservationId}`);
  }
}
```

#### Enhanced OrderService Integration
```typescript
// src/services/orders/OrderService.ts (enhanced for table management)
import { SimpleApiClient } from '../api/base/SimpleApiClient';
import { Order, CreateOrderRequest, OrderItem } from '../../types/order.types';

export class OrderService {
  private apiClient: SimpleApiClient;

  constructor() {
    this.apiClient = new SimpleApiClient('/api/orders');
  }

  // Table-specific order operations
  async createOrderForTable(tableId: string, orderData: CreateOrderRequest): Promise<Order> {
    const response = await this.apiClient.post<Order>('/', {
      ...orderData,
      table_id: tableId,
      order_type: 'dine_in'
    });
    return response.data;
  }

  async getActiveOrderForTable(tableId: string): Promise<Order | null> {
    try {
      const response = await this.apiClient.get<Order>(`/table/${tableId}/active`);
      return response.data;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async addItemToOrder(orderId: string, item: Omit<OrderItem, 'id'>): Promise<Order> {
    const response = await this.apiClient.post<Order>(`/${orderId}/items`, item);
    return response.data;
  }

  async updateOrderItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<Order> {
    const response = await this.apiClient.patch<Order>(`/${orderId}/items/${itemId}`, updates);
    return response.data;
  }

  async removeItemFromOrder(orderId: string, itemId: string): Promise<Order> {
    const response = await this.apiClient.delete<Order>(`/${orderId}/items/${itemId}`);
    return response.data;
  }

  async updateOrderCustomer(orderId: string, customerId: string): Promise<Order> {
    const response = await this.apiClient.patch<Order>(`/${orderId}/customer`, { customer_id: customerId });
    return response.data;
  }

  async updateOrderNotes(orderId: string, notes: string): Promise<Order> {
    const response = await this.apiClient.patch<Order>(`/${orderId}/notes`, { notes });
    return response.data;
  }
}
```

#### Enhanced MenuService Integration
```typescript
// src/services/menu/MenuService.ts (enhanced for table management)
import { SimpleApiClient } from '../api/base/SimpleApiClient';
import { MenuItem, MenuCategory } from '../../types/menu.types';

export class MenuService {
  private apiClient: SimpleApiClient;

  constructor() {
    this.apiClient = new SimpleApiClient('/api/menu');
  }

  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    const response = await this.apiClient.get<MenuCategory[]>('/categories', {
      params: { restaurant_id: restaurantId }
    });
    return response.data;
  }

  async getMenuByCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    const response = await this.apiClient.get<MenuItem[]>('/items', {
      params: { 
        restaurant_id: restaurantId,
        category_id: categoryId,
        status: 'available'
      }
    });
    return response.data;
  }

  async searchMenuItems(restaurantId: string, query: string): Promise<MenuItem[]> {
    const response = await this.apiClient.get<MenuItem[]>('/items/search', {
      params: { 
        restaurant_id: restaurantId,
        q: query,
        status: 'available'
      }
    });
    return response.data;
  }

  async getPopularItems(restaurantId: string, limit: number = 10): Promise<MenuItem[]> {
    const response = await this.apiClient.get<MenuItem[]>('/items/popular', {
      params: { 
        restaurant_id: restaurantId,
        limit
      }
    });
    return response.data;
  }

  async getItemDetails(itemId: string): Promise<MenuItem> {
    const response = await this.apiClient.get<MenuItem>(`/items/${itemId}`);
    return response.data;
  }
}
```

### 3. Error Handling Strategy

#### Service-Level Error Handling
```typescript
// src/services/base/ErrorHandler.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// Enhanced error handling in services
export const handleServiceError = (error: any): ServiceError => {
  if (error.response) {
    const { status, data } = error.response;
    return new ServiceError(
      data.message || 'An error occurred',
      status,
      data.error_code,
      data.details
    );
  }
  
  if (error.request) {
    return new ServiceError('Network error occurred', 0, 'NETWORK_ERROR');
  }
  
  return new ServiceError(error.message || 'Unknown error', -1, 'UNKNOWN_ERROR');
};
```

#### Component-Level Error Handling
```typescript
// Custom hook for error handling
export const useErrorHandler = () => {
  const showToast = useToast();
  
  const handleError = useCallback((error: ServiceError) => {
    switch (error.statusCode) {
      case 401:
        // Handle authentication errors
        showToast('Session expired. Please login again.', 'error');
        // Navigate to login
        break;
      case 403:
        showToast('You do not have permission to perform this action.', 'error');
        break;
      case 404:
        showToast('Resource not found.', 'error');
        break;
      case 409:
        showToast('Conflict occurred. Please refresh and try again.', 'warning');
        break;
      case 500:
        showToast('Server error occurred. Please try again later.', 'error');
        break;
      default:
        showToast(error.message || 'An unexpected error occurred.', 'error');
    }
  }, [showToast]);
  
  return { handleError };
};
```

### 4. Caching Strategy

#### Service-Level Caching
```typescript
// src/services/cache/CacheManager.ts
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage in services
export class TableService {
  private cacheManager = new CacheManager();
  
  async getTables(restaurantId: string): Promise<Table[]> {
    const cacheKey = `tables_${restaurantId}`;
    const cached = this.cacheManager.get<Table[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const tables = await this.apiClient.get<Table[]>('/', {
      params: { restaurant_id: restaurantId }
    });
    
    this.cacheManager.set(cacheKey, tables.data, 60000); // 1 minute cache
    return tables.data;
  }
  
  async updateTableStatus(tableId: string, updateData: UpdateTableStatusRequest): Promise<Table> {
    const result = await this.apiClient.patch<Table>(`/${tableId}/status`, updateData);
    
    // Invalidate related caches
    this.cacheManager.invalidate('tables_');
    
    return result.data;
  }
}
```

### 5. Offline Support Strategy

#### Offline Queue Management
```typescript
// src/services/offline/OfflineManager.ts
interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: 'table' | 'order' | 'customer';
  data: any;
  timestamp: number;
  retries: number;
}

export class OfflineManager {
  private queue: QueuedOperation[] = [];
  private isOnline: boolean = true;
  
  constructor() {
    this.setupNetworkListener();
    this.loadQueueFromStorage();
  }
  
  private setupNetworkListener(): void {
    // Monitor network status
    addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    
    addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.queue.push(queuedOp);
    this.saveQueueToStorage();
    
    if (this.isOnline) {
      this.processQueue();
    }
  }
  
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && this.isOnline) {
      const operation = this.queue[0];
      
      try {
        await this.executeOperation(operation);
        this.queue.shift();
      } catch (error) {
        operation.retries++;
        if (operation.retries >= 3) {
          this.queue.shift(); // Remove failed operation
        }
        break; // Stop processing on error
      }
    }
    
    this.saveQueueToStorage();
  }
  
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    // Execute queued operations based on type and resource
    // This would call the appropriate service methods
  }
}
```

### 6. WebSocket Integration

#### Real-time Updates Manager
```typescript
// src/services/websocket/WebSocketManager.ts
export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  
  connect(channel: string, url: string): void {
    if (this.connections.has(channel)) {
      return; // Already connected
    }
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log(`Connected to ${channel}`);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifyListeners(channel, data);
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error on ${channel}:`, error);
    };
    
    ws.onclose = () => {
      this.connections.delete(channel);
      // Implement reconnection logic
      setTimeout(() => this.connect(channel, url), 5000);
    };
    
    this.connections.set(channel, ws);
  }
  
  subscribe(channel: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    
    this.listeners.get(channel)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(listener);
    };
  }
  
  private notifyListeners(channel: string, data: any): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(listener => listener(data));
    }
  }
  
  disconnect(channel: string): void {
    const ws = this.connections.get(channel);
    if (ws) {
      ws.close();
      this.connections.delete(channel);
    }
  }
  
  disconnectAll(): void {
    this.connections.forEach((ws, channel) => {
      ws.close();
    });
    this.connections.clear();
  }
}
```

### 7. Performance Optimization

#### API Response Optimization
```typescript
// Implement request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    const promise = requestFn();
    this.pendingRequests.set(key, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }
}
```

#### Batch Operations
```typescript
// Batch API requests for better performance
class BatchRequestManager {
  private batchQueue: Array<{ resource: string; id: string; resolve: (data: any) => void }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  
  batchGet(resource: string, id: string): Promise<any> {
    return new Promise((resolve) => {
      this.batchQueue.push({ resource, id, resolve });
      
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, 50); // 50ms batch window
      }
    });
  }
  
  private async processBatch(): Promise<void> {
    const currentBatch = [...this.batchQueue];
    this.batchQueue.length = 0;
    this.batchTimeout = null;
    
    // Group by resource type
    const groupedRequests = currentBatch.reduce((acc, item) => {
      if (!acc[item.resource]) acc[item.resource] = [];
      acc[item.resource].push(item);
      return acc;
    }, {} as Record<string, typeof currentBatch>);
    
    // Execute batch requests
    for (const [resource, requests] of Object.entries(groupedRequests)) {
      try {
        const ids = requests.map(r => r.id);
        const results = await this.executeBatchRequest(resource, ids);
        
        requests.forEach((request, index) => {
          request.resolve(results[index]);
        });
      } catch (error) {
        requests.forEach(request => {
          request.resolve(null);
        });
      }
    }
  }
  
  private async executeBatchRequest(resource: string, ids: string[]): Promise<any[]> {
    // Implementation for batch API calls
    // This would make a single API call with multiple IDs
    return [];
  }
}
```

This service architecture provides a robust foundation for the table management feature with proper error handling, caching, offline support, and performance optimization while maintaining consistency with the existing codebase patterns.