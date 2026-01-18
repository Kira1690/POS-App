/**
 * OrderEventEmitter - Simple pub/sub pattern for cross-context communication
 * Enables real-time sync between Kitchen and Order Management contexts
 */

export type OrderEventType =
  | 'ORDER_STATUS_CHANGED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'ORDER_CREATED'
  | 'ORDER_CANCELLED'
  | 'ORDER_PAID'
  | 'SYSTEM_RESET';

export interface OrderEventData {
  status?: string;
  paymentStatus?: string;
  paidAt?: string;
  tableId?: string;
  method?: string;
  amount?: number;
  reason?: string;
  orderNumber?: string;
  [key: string]: unknown;
}

type OrderEventCallback = (orderId: string, data: OrderEventData) => void;

class OrderEventEmitter {
  private listeners: Map<OrderEventType, Set<OrderEventCallback>> = new Map();

  /**
   * Subscribe to an order event
   * @param event The event type to listen for
   * @param callback The callback function to invoke when event fires
   * @returns Unsubscribe function
   */
  subscribe(event: OrderEventType, callback: OrderEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function for cleanup
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an order event to all subscribers
   * @param event The event type to emit
   * @param orderId The ID of the order that changed
   * @param data Additional data about the change
   */
  emit(event: OrderEventType, orderId: string, data: OrderEventData): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(orderId, data);
        } catch (error) {
          console.error(`[OrderEventEmitter] Error in callback for ${event}:`, error);
        }
      });
    }

    if (__DEV__) {
      console.log(`[OrderEventEmitter] Emitted ${event} for order ${orderId}:`, data);
    }
  }

  /**
   * Get the number of listeners for an event (useful for debugging)
   */
  listenerCount(event: OrderEventType): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Clear all listeners (useful for testing)
   */
  clearAll(): void {
    this.listeners.clear();
  }
}

// Singleton instance for app-wide use
export const orderEventEmitter = new OrderEventEmitter();
