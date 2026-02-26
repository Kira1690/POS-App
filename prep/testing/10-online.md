# Online / API Tests

> Online mode = real backend at `localhost:4000` + real JWT + real PostgreSQL database.
> Run these tests after the backend is running and seeded.

---

## Prerequisites

```bash
# 1. Start backend API gateway
cd ../backend
docker-compose up -d
# OR
npm run dev  # starts all 13 microservices

# 2. Seed backend database
npm run db:seed

# 3. Confirm backend health
curl http://localhost:4000/health

# 4. Start Expo bundler (pointing to backend)
EXPO_PUBLIC_API_URL=http://localhost:4000 bun expo start --clear

# 5. Enable network on emulator
adb shell svc data enable
adb shell svc wifi enable
```

---

## Authentication (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Real API login — valid credentials | `online/01_real_login.yaml` | JWT returned from API | pending |
| Real API login — invalid credentials | `online/02_real_login_invalid.yaml` | 401 error shown in UI | pending |
| Token refresh automatically on expiry | `online/03_token_refresh.yaml` | Wait for expiry, verify auto-refresh | pending |
| Logout invalidates token on server | `online/04_logout_server.yaml` | POST /auth/logout, 401 on reuse | pending |
| MFA flow for manager login | `online/05_mfa_flow.yaml` | OTP entry screen | pending |

**Jest API Tests:**

| Test | Description | Status |
|------|-------------|--------|
| `CoreAuthService.login()` hits real API | Integration with real network | pending |
| `CoreAuthService.refreshToken()` hits real API | Non-dummy user refresh | pending |
| 401 response triggers logout | Interceptor test | pending |
| Network timeout shows user-friendly error | Slow API simulation | pending |

---

## Dashboard (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Today's sales from real orders | `online/dashboard_real_data.yaml` | KPI matches backend | pending |
| Active order count from backend | same | Count matches | pending |
| 7-day revenue chart from real data | same | Chart populated | pending |
| Overdue notification badge from backend | same | Badge count correct | pending |

---

## Order Management (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Create order syncs to backend | `online/create_order_online.yaml` | POST /orders | pending |
| Backend status update reflected in app | WebSocket event | pending |
| Order conflict resolution (2 devices same table) | pending | Conflict UI shown | pending |
| Payment processed online | `online/payment_online.yaml` | Payment gateway call | pending |
| Receipt returned from backend | same | Receipt data from API | pending |

**Jest API Tests:**

| Test | Description | Status |
|------|-------------|--------|
| `OrderService.createOrder()` → 201 response | pending |
| `OrderService.updateOrderStatus()` → 200 response | pending |
| `OrderService.getActiveOrders()` → paginated list | pending |
| WebSocket event `order.status_changed` updates context | Mock WS | pending |

---

## Kitchen (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Kitchen ticket via WebSocket when order confirmed | `online/kitchen_websocket.yaml` | WS event received | pending |
| Status update syncs to backend | pending | PATCH /kitchen/tickets/:id | pending |
| Overdue count on Manager badge matches backend | pending | pending |

---

## Table Management (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Table status change syncs to backend | `online/table_status_sync.yaml` | PATCH /tables/:id | pending |
| Real-time table status via WebSocket | pending | 2 devices | pending |
| New table saved to backend | pending | POST /tables | pending |

---

## Menu (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Categories load from backend API | `online/menu_load.yaml` | GET /menu/categories | pending |
| Add menu item syncs to backend | pending | POST /menu/items | pending |
| Price update syncs to backend | pending | PATCH /menu/items/:id | pending |
| Availability toggle syncs to backend | pending | PATCH /menu/items/:id | pending |

---

## Payment (Online)

| Test | Flow File | Description | Status |
|------|-----------|-------------|--------|
| Card payment via payment gateway | `online/card_payment_online.yaml` | Real gateway call | pending |
| Receipt data from backend | same | GET /receipts/:id | pending |
| Refund via backend | `online/refund_online.yaml` | POST /payments/refund | pending |
| Payment syncs when reconnecting after offline | pending | Sync queue flush | pending |

---

## Sync Queue (Offline → Online)

| Test | Description | Status |
|------|-------------|--------|
| Order created offline syncs when online | `SyncQueueService` drains queue on reconnect | pending |
| Status change offline syncs when online | pending |
| Conflict detected when server has newer version | pending |
| Failed sync retried with backoff | pending |
| Sync queue visible in debug/settings screen | pending |

**Jest Tests:**

| Test | Description | Status |
|------|-------------|--------|
| `SyncQueueService.enqueue()` adds to SQLite queue | pending |
| `SyncQueueService.flush()` processes all queued items | pending |
| `SyncQueueService.flush()` retries on 5xx errors | pending |
| `SyncQueueService.flush()` removes item on 200 | pending |
| Connectivity listener triggers flush on reconnect | pending |

---

## How to Run Online E2E

```bash
# Run individual online flow
maestro test .maestro/online/01_real_login.yaml

# Run all online flows
maestro test .maestro/online/

# Run Jest API integration tests
bun test --testPathPattern online
```

---

## Online Acceptance Criteria

- [ ] Real login returns valid JWT from backend
- [ ] Token refresh works via API for real users
- [ ] All order CRUD syncs to backend in real time
- [ ] WebSocket events update UI without manual refresh
- [ ] Offline-created data syncs to backend on reconnect
- [ ] Conflict resolution handles concurrent edits gracefully
- [ ] Payment gateway processes card payments correctly
- [ ] All API errors show meaningful messages in UI
