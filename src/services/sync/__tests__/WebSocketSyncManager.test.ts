/**
 * WebSocketSyncManager Unit Tests
 * Validates order and kitchen WS message handling
 */

// ─── Mocks must be declared before imports (hoisted by jest) ────────────────

// Mock expo virtual env (babel-preset-expo injects this for process.env references)
jest.mock('expo/virtual/env', () => ({ env: {} }));

// Mock expo-sqlite to prevent native module loading
jest.mock('expo-sqlite', () => ({}));

// Mock storage barrel — prevents transitive expo-sqlite imports
jest.mock('@/services/storage', () => ({
  menuStorageService: {
    addMenuItem: jest.fn().mockReturnValue(Promise.resolve()),
    deleteMenuItem: jest.fn().mockReturnValue(Promise.resolve()),
  },
  tableStorageService: {
    updateTable: jest.fn().mockReturnValue(Promise.resolve()),
  },
  kitchenStorageService: {
    saveTicket: jest.fn().mockResolvedValue(undefined),
    updateTicket: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/services/storage/UnifiedOrderStorageService', () => ({
  unifiedOrderStorageService: {
    saveOrder: jest.fn().mockResolvedValue(undefined),
    updateOrder: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/services/events/OrderEventEmitter', () => ({
  orderEventEmitter: { emit: jest.fn() },
}));

jest.mock('../mappers', () => ({
  mapServerOrderToUnified: (data: Record<string, unknown>) => ({
    id: data.id,
    orderNumber: data.order_number || 'ORD-TEST',
    status: data.status || 'confirmed',
    paymentStatus: data.payment_status || 'pending',
    preparingAt: data.preparing_at,
    readyAt: data.ready_at,
    servedAt: data.served_at,
    paidAt: data.paid_at,
    cancelledAt: data.cancelled_at,
    updatedAt: data.updated_at || new Date().toISOString(),
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    items: [],
  }),
  mapServerTicketToKitchenTicket: (data: Record<string, unknown>) => ({
    id: data.id,
    orderId: data.order_id,
    status: data.status || 'pending',
    completedItemCount: data.completed_item_count || 0,
    startedAt: data.started_at,
    completedAt: data.completed_at,
    servedAt: data.served_at,
    actualPrepTime: data.actual_prep_time,
    pendingSync: false,
    syncedAt: new Date().toISOString(),
    items: [],
  }),
}));

// Mock database service to prevent any native sqlite initialization
jest.mock('@/services/database/DatabaseService', () => ({
  databaseService: {
    getDatabase: jest.fn(),
    initialize: jest.fn(),
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { WebSocketSyncManager } from '../WebSocketSyncManager';
import { unifiedOrderStorageService } from '@/services/storage/UnifiedOrderStorageService';
import { kitchenStorageService } from '@/services/storage';
import { orderEventEmitter } from '@/services/events/OrderEventEmitter';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Access private handleMessage via casting.
 * We test message routing without needing a real WebSocket connection.
 */
function sendMessage(
  manager: WebSocketSyncManager,
  channel: string,
  event: string,
  data: Record<string, unknown>
) {
  (manager as Record<string, unknown>)['handleMessage']
    .call(manager, { channel, event, data });
}

// Re-type for convenience
const mockSaveOrder = unifiedOrderStorageService.saveOrder as jest.Mock;
const mockUpdateOrder = unifiedOrderStorageService.updateOrder as jest.Mock;
const mockSaveTicket = (kitchenStorageService as Record<string, unknown>).saveTicket as jest.Mock;
const mockUpdateTicket = (kitchenStorageService as Record<string, unknown>).updateTicket as jest.Mock;
const mockEmit = orderEventEmitter.emit as jest.Mock;

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('WebSocketSyncManager — Order handling', () => {
  let manager: WebSocketSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new WebSocketSyncManager();
  });

  it('routes "orders" channel to handleOrderUpdate', () => {
    sendMessage(manager, 'orders', 'created', { id: 'o1', status: 'confirmed' });

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'o1', pendingSync: false })
    );
  });

  it('handles status_changed event with partial update', async () => {
    sendMessage(manager, 'orders', 'status_changed', {
      id: 'o2',
      status: 'ready',
      payment_status: 'pending',
      ready_at: '2026-03-18T11:00:00.000Z',
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockUpdateOrder).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrder).toHaveBeenCalledWith(
      'o2',
      expect.objectContaining({
        status: 'ready',
        pendingSync: false,
      })
    );
  });

  it('emits ORDER_STATUS_CHANGED after status_changed update', async () => {
    sendMessage(manager, 'orders', 'status_changed', {
      id: 'o3',
      status: 'preparing',
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockEmit).toHaveBeenCalledWith('ORDER_STATUS_CHANGED', 'o3', { status: 'preparing' });
  });

  it('emits ORDER_CREATED for "created" event', async () => {
    sendMessage(manager, 'orders', 'created', { id: 'o4', status: 'confirmed' });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockEmit).toHaveBeenCalledWith('ORDER_CREATED', 'o4', {});
  });

  it('emits ORDER_SYNC_COMPLETE for "updated" event', async () => {
    sendMessage(manager, 'orders', 'updated', { id: 'o5', status: 'served' });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockEmit).toHaveBeenCalledWith('ORDER_SYNC_COMPLETE', 'o5', {});
  });

  it('ignores order messages with no id', () => {
    sendMessage(manager, 'orders', 'created', { status: 'confirmed' });

    expect(mockSaveOrder).not.toHaveBeenCalled();
    expect(mockUpdateOrder).not.toHaveBeenCalled();
  });

  it('full upsert for non-status_changed events', () => {
    sendMessage(manager, 'orders', 'updated', { id: 'o6', status: 'paid' });

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrder).not.toHaveBeenCalled();
  });
});

describe('WebSocketSyncManager — Kitchen handling', () => {
  let manager: WebSocketSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new WebSocketSyncManager();
  });

  it('routes "kitchen" channel to handleKitchenUpdate', () => {
    sendMessage(manager, 'kitchen', 'ticket_created', {
      id: 'tk1',
      order_id: 'o1',
      status: 'pending',
    });

    expect(mockSaveTicket).toHaveBeenCalledTimes(1);
    expect(mockSaveTicket).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tk1', pendingSync: false })
    );
  });

  it('handles status_changed with partial update', () => {
    sendMessage(manager, 'kitchen', 'status_changed', {
      id: 'tk2',
      order_id: 'o1',
      status: 'preparing',
      started_at: '2026-03-18T11:00:00.000Z',
    });

    expect(mockUpdateTicket).toHaveBeenCalledTimes(1);
    expect(mockUpdateTicket).toHaveBeenCalledWith(
      'tk2',
      expect.objectContaining({
        status: 'preparing',
        pendingSync: false,
      })
    );
  });

  it('full upsert for non-status_changed kitchen events', () => {
    sendMessage(manager, 'kitchen', 'ticket_created', {
      id: 'tk3',
      order_id: 'o2',
      status: 'pending',
    });

    expect(mockSaveTicket).toHaveBeenCalledTimes(1);
    expect(mockUpdateTicket).not.toHaveBeenCalled();
  });

  it('ignores kitchen messages with no id', () => {
    sendMessage(manager, 'kitchen', 'status_changed', { order_id: 'o1' });

    expect(mockSaveTicket).not.toHaveBeenCalled();
    expect(mockUpdateTicket).not.toHaveBeenCalled();
  });
});

describe('WebSocketSyncManager — Channel routing', () => {
  let manager: WebSocketSyncManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new WebSocketSyncManager();
  });

  it('unknown channel messages are silently dropped', () => {
    sendMessage(manager, 'billing', 'payment_received', { id: 'p1' });

    expect(mockSaveOrder).not.toHaveBeenCalled();
    expect(mockSaveTicket).not.toHaveBeenCalled();
  });

  it('routes menu channel correctly (existing behavior)', () => {
    sendMessage(manager, 'menu', 'updated', { id: 'mi-1' });

    expect(mockSaveOrder).not.toHaveBeenCalled();
    expect(mockSaveTicket).not.toHaveBeenCalled();
  });

  it('routes tables channel correctly (existing behavior)', () => {
    sendMessage(manager, 'tables', 'updated', { id: 'tbl-1' });

    expect(mockSaveOrder).not.toHaveBeenCalled();
    expect(mockSaveTicket).not.toHaveBeenCalled();
  });
});
