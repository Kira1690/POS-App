/**
 * PullSyncService Unit Tests
 * Validates order pull sync logic: API call → SQLite upsert → event emission
 */

import { PullSyncService } from '../PullSyncService';

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const mockPost = jest.fn();
jest.mock('@/services/api/apiClient', () => ({
  apiClient: { post: (...args: unknown[]) => mockPost(...args) },
}));

const mockGetLastSyncTime = jest.fn();
jest.mock('@/services/storage', () => ({
  menuStorageService: {
    addCategory: jest.fn(),
    deleteCategory: jest.fn(),
    addMenuItem: jest.fn(),
    deleteMenuItem: jest.fn(),
    addModifierGroup: jest.fn(),
    deleteModifierGroup: jest.fn(),
    addCombo: jest.fn(),
    deleteCombo: jest.fn(),
  },
  tableStorageService: {
    addTable: jest.fn(),
    addArea: jest.fn(),
  },
  syncQueueService: {
    getLastSyncTime: () => mockGetLastSyncTime(),
  },
}));

const mockSaveOrder = jest.fn().mockResolvedValue(undefined);
const mockGetOrder = jest.fn().mockResolvedValue(null);
const mockDeleteOrder = jest.fn().mockResolvedValue(undefined);
jest.mock('@/services/storage/UnifiedOrderStorageService', () => ({
  unifiedOrderStorageService: {
    saveOrder: (...args: unknown[]) => mockSaveOrder(...args),
    getOrder: (...args: unknown[]) => mockGetOrder(...args),
    deleteOrder: (...args: unknown[]) => mockDeleteOrder(...args),
  },
}));

jest.mock('@/services/storage/CustomerStorageService', () => ({
  customerStorageService: { upsertAll: jest.fn() },
}));

const mockEmit = jest.fn();
jest.mock('@/services/events/OrderEventEmitter', () => ({
  orderEventEmitter: { emit: (...args: unknown[]) => mockEmit(...args) },
}));

jest.mock('@/services/menu/MenuEventEmitter', () => ({
  menuEventEmitter: { emitEvent: jest.fn() },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeServerOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-s1',
    order_number: 'ORD-S1',
    restaurant_id: '1',
    table_id: 'tbl-1',
    table_name: 'T-1',
    guest_count: 2,
    created_by: 'u1',
    created_by_name: 'Alice',
    subtotal: 20,
    tax_rate: 0.1,
    tax_amount: 2,
    total_amount: 22,
    status: 'confirmed',
    payment_status: 'pending',
    order_items: [],
    created_at: '2026-03-18T10:00:00.000Z',
    updated_at: '2026-03-18T10:00:00.000Z',
    ...overrides,
  };
}

function makePullResponse(orders: { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] }) {
  return {
    data: {
      data: {
        orders: {
          created: orders.created || [],
          updated: orders.updated || [],
          deleted: orders.deleted || [],
        },
      },
    },
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('PullSyncService.pullOrders', () => {
  let service: PullSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLastSyncTime.mockResolvedValue(null);
    service = new PullSyncService();
  });

  it('calls the sync/pull endpoint with correct body', async () => {
    mockPost.mockResolvedValue({ data: { data: null } });

    await service.pullOrders('rest-1');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/sync/pull',
      expect.objectContaining({
        restaurant_id: 'rest-1',
        entity_types: ['orders'],
        last_sync_timestamp: '1970-01-01T00:00:00.000Z',
        page_size: 100,
      }),
      expect.anything()
    );
  });

  it('uses stored lastSync timestamp when available', async () => {
    mockGetLastSyncTime.mockResolvedValue('2026-03-18T08:00:00.000Z');
    mockPost.mockResolvedValue({ data: { data: null } });

    await service.pullOrders('rest-1');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/orders/sync/pull',
      expect.objectContaining({
        last_sync_timestamp: '2026-03-18T08:00:00.000Z',
      }),
      expect.anything()
    );
  });

  it('saves created orders to SQLite', async () => {
    const order = makeServerOrder();
    mockPost.mockResolvedValue(makePullResponse({ created: [order] }));

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-s1',
        orderNumber: 'ORD-S1',
        status: 'confirmed',
        pendingSync: false,
      })
    );
  });

  it('saves updated orders to SQLite', async () => {
    const order = makeServerOrder({ id: 'order-u1', status: 'preparing' });
    mockPost.mockResolvedValue(makePullResponse({ updated: [order] }));

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'order-u1', status: 'preparing' })
    );
  });

  it('skips server order when local has pending changes with newer timestamp', async () => {
    const serverOrder = makeServerOrder({ updated_at: '2026-03-18T10:00:00.000Z' });
    mockPost.mockResolvedValue(makePullResponse({ created: [serverOrder] }));

    // Local order has newer timestamp AND pending sync
    mockGetOrder.mockResolvedValue({
      id: 'order-s1',
      pendingSync: true,
      updatedAt: '2026-03-18T10:05:00.000Z',
    });

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).not.toHaveBeenCalled();
  });

  it('overwrites local order when server is newer even if local has pending sync', async () => {
    const serverOrder = makeServerOrder({ updated_at: '2026-03-18T10:10:00.000Z' });
    mockPost.mockResolvedValue(makePullResponse({ updated: [serverOrder] }));

    mockGetOrder.mockResolvedValue({
      id: 'order-s1',
      pendingSync: true,
      updatedAt: '2026-03-18T10:05:00.000Z',
    });

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
  });

  it('overwrites local order when local has no pending sync', async () => {
    const serverOrder = makeServerOrder({ updated_at: '2026-03-18T10:00:00.000Z' });
    mockPost.mockResolvedValue(makePullResponse({ updated: [serverOrder] }));

    mockGetOrder.mockResolvedValue({
      id: 'order-s1',
      pendingSync: false,
      updatedAt: '2026-03-18T10:05:00.000Z',
    });

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
  });

  it('deletes server-deleted orders from SQLite', async () => {
    mockPost.mockResolvedValue(makePullResponse({
      deleted: [{ id: 'order-del' }],
    }));
    mockGetOrder.mockResolvedValue(null);

    await service.pullOrders('rest-1');

    expect(mockDeleteOrder).toHaveBeenCalledWith('order-del');
  });

  it('does NOT delete locally-pending orders even if server says deleted', async () => {
    mockPost.mockResolvedValue(makePullResponse({
      deleted: [{ id: 'order-local' }],
    }));
    mockGetOrder.mockResolvedValue({ id: 'order-local', pendingSync: true });

    await service.pullOrders('rest-1');

    expect(mockDeleteOrder).not.toHaveBeenCalled();
  });

  it('emits ORDER_SYNC_COMPLETE after applying changes', async () => {
    mockPost.mockResolvedValue(makePullResponse({ created: [makeServerOrder()] }));

    await service.pullOrders('rest-1');

    expect(mockEmit).toHaveBeenCalledWith('ORDER_SYNC_COMPLETE', '', {});
  });

  it('emits ORDER_SYNC_COMPLETE even when response has no orders', async () => {
    mockPost.mockResolvedValue(makePullResponse({}));

    await service.pullOrders('rest-1');

    expect(mockEmit).toHaveBeenCalledWith('ORDER_SYNC_COMPLETE', '', {});
  });

  it('handles multiple created and updated orders in one pull', async () => {
    const c1 = makeServerOrder({ id: 'c1' });
    const c2 = makeServerOrder({ id: 'c2' });
    const u1 = makeServerOrder({ id: 'u1', status: 'ready' });
    mockPost.mockResolvedValue(makePullResponse({ created: [c1, c2], updated: [u1] }));

    await service.pullOrders('rest-1');

    expect(mockSaveOrder).toHaveBeenCalledTimes(3);
  });

  it('does not throw on API error — fails silently', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    await expect(service.pullOrders('rest-1')).resolves.toBeUndefined();
    expect(mockSaveOrder).not.toHaveBeenCalled();
    expect(mockEmit).not.toHaveBeenCalled();
  });

  it('does not throw when response.data.data is null', async () => {
    mockPost.mockResolvedValue({ data: { data: null } });

    await expect(service.pullOrders('rest-1')).resolves.toBeUndefined();
    expect(mockSaveOrder).not.toHaveBeenCalled();
  });

  it('handles flat outer data (no double-wrap)', async () => {
    // Some endpoints don't double-wrap
    mockPost.mockResolvedValue({
      data: {
        data: {
          orders: {
            created: [makeServerOrder()],
            updated: [],
            deleted: [],
          },
        },
      },
    });

    await service.pullOrders('rest-1');
    expect(mockSaveOrder).toHaveBeenCalledTimes(1);
  });
});
