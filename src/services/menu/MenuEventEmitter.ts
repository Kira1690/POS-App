/**
 * Menu Event Emitter Service
 * Provides event-based communication for menu changes across the application
 * Enables real-time sync between Menu Management Settings and Order Screen
 */

import { MenuEvent, MenuEventHandler, MenuEventType } from '@/interfaces/context/menu.interface';

class MenuEventEmitterService {
  private static instance: MenuEventEmitterService;
  private handlers: Set<MenuEventHandler> = new Set();
  private eventLog: MenuEvent[] = [];
  private readonly maxLogSize = 100;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MenuEventEmitterService {
    if (!MenuEventEmitterService.instance) {
      MenuEventEmitterService.instance = new MenuEventEmitterService();
    }
    return MenuEventEmitterService.instance;
  }

  /**
   * Subscribe to menu events
   * @param handler - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe(handler: MenuEventHandler): () => void {
    this.handlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Emit a menu event to all subscribers
   * @param event - The menu event to emit
   */
  emit(event: MenuEvent): void {
    // Add to event log
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Notify all subscribers
    this.handlers.forEach((handler) => {
      try {
        handler(event);
      } catch {
        // Silent — handler errors shouldn't crash emitter
      }
    });
  }

  /**
   * Create and emit an event with automatic timestamp
   * @param type - Event type
   * @param payload - Event payload (without timestamp)
   */
  emitEvent(
    type: MenuEventType,
    payload: Omit<MenuEvent['payload'], 'timestamp'>
  ): void {
    this.emit({
      type,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get recent events for debugging
   * @param count - Number of events to retrieve
   */
  getRecentEvents(count: number = 10): MenuEvent[] {
    return this.eventLog.slice(-count);
  }

  /**
   * Get all events of a specific type
   * @param type - Event type to filter by
   */
  getEventsByType(type: MenuEventType): MenuEvent[] {
    return this.eventLog.filter((event) => event.type === type);
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Get subscriber count (for debugging)
   */
  getSubscriberCount(): number {
    return this.handlers.size;
  }

  /**
   * Remove all subscribers (for cleanup/testing)
   */
  clearSubscribers(): void {
    this.handlers.clear();
  }
}

// Export singleton instance
export const menuEventEmitter = MenuEventEmitterService.getInstance();

// Export class for type reference
export { MenuEventEmitterService };
