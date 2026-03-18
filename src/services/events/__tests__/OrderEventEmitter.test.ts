/**
 * OrderEventEmitter Unit Tests
 * Validates pub/sub behavior including the new ORDER_SYNC_COMPLETE event
 */

import { orderEventEmitter, OrderEventType } from '../OrderEventEmitter';

describe('OrderEventEmitter', () => {
  beforeEach(() => {
    orderEventEmitter.clearAll();
  });

  it('subscribes and receives events', () => {
    const cb = jest.fn();
    orderEventEmitter.subscribe('ORDER_CREATED', cb);

    orderEventEmitter.emit('ORDER_CREATED', 'o1', { orderNumber: 'ORD-1' });

    expect(cb).toHaveBeenCalledWith('o1', { orderNumber: 'ORD-1' });
  });

  it('unsubscribe stops receiving events', () => {
    const cb = jest.fn();
    const unsub = orderEventEmitter.subscribe('ORDER_STATUS_CHANGED', cb);

    orderEventEmitter.emit('ORDER_STATUS_CHANGED', 'o1', { status: 'ready' });
    expect(cb).toHaveBeenCalledTimes(1);

    unsub();
    orderEventEmitter.emit('ORDER_STATUS_CHANGED', 'o2', { status: 'paid' });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('multiple subscribers receive the same event', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', cb1);
    orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', cb2);

    orderEventEmitter.emit('ORDER_SYNC_COMPLETE', '', {});

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  it('ORDER_SYNC_COMPLETE is a valid event type', () => {
    const cb = jest.fn();
    orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', cb);
    orderEventEmitter.emit('ORDER_SYNC_COMPLETE', '', {});

    expect(cb).toHaveBeenCalledWith('', {});
  });

  it('events do not leak across event types', () => {
    const cbSync = jest.fn();
    const cbCreated = jest.fn();
    orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', cbSync);
    orderEventEmitter.subscribe('ORDER_CREATED', cbCreated);

    orderEventEmitter.emit('ORDER_SYNC_COMPLETE', '', {});

    expect(cbSync).toHaveBeenCalledTimes(1);
    expect(cbCreated).not.toHaveBeenCalled();
  });

  it('callback errors do not crash the emitter', () => {
    const badCb = jest.fn(() => { throw new Error('boom'); });
    const goodCb = jest.fn();
    orderEventEmitter.subscribe('ORDER_CANCELLED', badCb);
    orderEventEmitter.subscribe('ORDER_CANCELLED', goodCb);

    expect(() => {
      orderEventEmitter.emit('ORDER_CANCELLED', 'o1', { reason: 'test' });
    }).not.toThrow();

    expect(goodCb).toHaveBeenCalledTimes(1);
  });

  it('listenerCount reflects active subscriptions', () => {
    expect(orderEventEmitter.listenerCount('ORDER_SYNC_COMPLETE')).toBe(0);

    const unsub1 = orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', jest.fn());
    const unsub2 = orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', jest.fn());
    expect(orderEventEmitter.listenerCount('ORDER_SYNC_COMPLETE')).toBe(2);

    unsub1();
    expect(orderEventEmitter.listenerCount('ORDER_SYNC_COMPLETE')).toBe(1);

    unsub2();
    expect(orderEventEmitter.listenerCount('ORDER_SYNC_COMPLETE')).toBe(0);
  });

  it('clearAll removes all listeners', () => {
    orderEventEmitter.subscribe('ORDER_CREATED', jest.fn());
    orderEventEmitter.subscribe('ORDER_SYNC_COMPLETE', jest.fn());
    orderEventEmitter.subscribe('SYSTEM_RESET', jest.fn());

    orderEventEmitter.clearAll();

    expect(orderEventEmitter.listenerCount('ORDER_CREATED')).toBe(0);
    expect(orderEventEmitter.listenerCount('ORDER_SYNC_COMPLETE')).toBe(0);
    expect(orderEventEmitter.listenerCount('SYSTEM_RESET')).toBe(0);
  });

  it('emitting to event with no subscribers does not throw', () => {
    expect(() => {
      orderEventEmitter.emit('TABLE_SYNC_COMPLETE', '', {});
    }).not.toThrow();
  });

  it('all event types are valid (compile-time + runtime check)', () => {
    const allTypes: OrderEventType[] = [
      'ORDER_STATUS_CHANGED',
      'PAYMENT_STATUS_CHANGED',
      'ORDER_CREATED',
      'ORDER_CANCELLED',
      'ORDER_PAID',
      'SYSTEM_RESET',
      'TABLE_SYNC_COMPLETE',
      'ORDER_SYNC_COMPLETE',
    ];

    for (const eventType of allTypes) {
      const cb = jest.fn();
      orderEventEmitter.subscribe(eventType, cb);
      orderEventEmitter.emit(eventType, 'test-id', {});
      expect(cb).toHaveBeenCalledTimes(1);
    }
  });
});
