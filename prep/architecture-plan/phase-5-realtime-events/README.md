# Phase 5: Real-Time Event Pipeline

## Objective
Ensure that when data changes anywhere (web dashboard, POS app, another POS device), ALL connected clients receive the update in real-time via WebSocket, backed by Kafka for reliability.

---

## Event Pipeline

```
Data Change (any source)
       │
       ▼
API Endpoint (Core/Menu Service)
       │
       ▼
Save to PostgreSQL
       │
       ├──▶ Kafka Topic (reliable delivery)
       │         │
       │         ▼
       │    Consumer Services (other services that need the event)
       │
       └──▶ WebSocket Broadcast (real-time to clients)
                 │
         ┌───────┼───────┐
         ▼       ▼       ▼
      POS App  POS App  Web Dashboard
      (Tab 1)  (Tab 2)  (Browser)
```

---

## Events That Need Real-Time Push

| Event | Source | Kafka Topic | WebSocket Channel | Subscribers |
|-------|--------|-------------|-------------------|-------------|
| Menu item created/updated/deleted | Web or Mobile | menu-events | menu | All POS devices |
| Category created/updated/deleted | Web or Mobile | menu-events | menu | All POS devices |
| Modifier changed | Web or Mobile | menu-events | menu | All POS devices |
| Table status changed | POS App | core-table-events | tables | Web dashboard, other POS |
| Table created/deleted | Web | core-table-events | tables | All POS devices |
| Order created | POS App | core-order-events | orders | Web dashboard, kitchen |
| Order status changed | POS/Kitchen | core-order-events | orders | Web dashboard, POS devices |
| Kitchen ticket updated | Kitchen staff | core-kitchen-events | kitchen | Web dashboard, waiters |
| Payment processed | POS App | core-billing-events | billing | Web dashboard |
| Settings changed | Web | settings-events | settings | All POS devices |

---

## Implementation

### 5.1 Ensure Kafka Publishing on All Write Operations

**Core Service** — verify each controller publishes after write:

```typescript
// orderController.createOrder
const order = await prisma.orders.create({ data: orderData });
await kafkaService.publish('core-order-events', {
  event: 'ORDER_CREATED',
  data: order,
  restaurant_id: order.restaurant_id,
  timestamp: new Date().toISOString(),
});
```

### 5.2 WebSocket Broadcast on Kafka Consume

**Core Service** — Kafka consumer triggers WebSocket:

```typescript
kafkaService.subscribe('menu-events', async (message) => {
  // When Menu Service publishes a menu change,
  // Core Service broadcasts via WebSocket to all connected clients
  webSocketService.broadcast('menu', {
    event: message.event,
    data: message.data,
    restaurant_id: message.restaurant_id,
  });
});
```

### 5.3 API Gateway WebSocket Proxy

If WebSocket runs on Core Service (port 5005), the API Gateway should proxy WebSocket connections:

```typescript
// API Gateway — proxy WebSocket to Core Service
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/ws', createProxyMiddleware({
  target: 'ws://localhost:5005',
  ws: true,
  changeOrigin: true,
}));
```

This way clients connect to `ws://gateway:8080/ws` and get proxied to Core Service.

---

## Success Criteria

- [ ] Menu changes on web → WebSocket → POS app updates within 2 seconds
- [ ] Order creation on POS → WebSocket → web dashboard shows new order
- [ ] Kitchen ticket status → WebSocket → waiter POS shows "ready"
- [ ] Table status → WebSocket → web dashboard shows occupied/available
- [ ] Payment → WebSocket → web dashboard shows completed
- [ ] No events lost (Kafka ensures at-least-once delivery)
- [ ] WebSocket reconnects automatically after disconnect
