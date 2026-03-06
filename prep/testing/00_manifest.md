# QA Test Manifest — QA Blueplate 2026

## Status
- [x] Restaurant created (Blue Plate Bistro)
- [x] Admin accounts available (system_admin, store_admin, bistro staff)
- [x] Mobile data seeded (tables, menu, orders synced)
- [x] Web dashboard fully operational (15 pages verified)
- [x] Playwright e2e: 74/74 passed
- [x] Discount + Split Bill: Wired and functional

**Last tested:** 2026-03-06

---

## Active Test Credentials

| Role | Email | Password | Status |
|------|-------|----------|--------|
| system_admin | `qa.sysadmin@pos.test` | `Test1234` | ✅ |
| system_admin | `admin@system.com` | `SuperAdmin123!` | ✅ |
| super_admin | `superadmin@pos.com` | `SuperAdmin123!` | ✅ |
| store_admin | `admin@blueplatebistro.io` | (bistro admin) | ✅ |

---

## Verified Data Summary

### Menu (8 categories, 20+ items)
| Category | Items | Status |
|----------|-------|--------|
| Appetizers | Garlic Bread ($4.50), Chicken Wings ($12.99), Mozzarella Sticks ($8.99), Calamari ($11.99) | ✅ |
| Salads | Caesar Salad ($10.99), Greek Salad ($11.99) | ✅ |
| Burgers & Sandwiches | Classic Cheeseburger ($14.99), BBQ Bacon Burger ($16.99), Grilled Chicken Sandwich ($13.99) | ✅ |
| Mains | Grilled Salmon ($24.99), Chicken Parmesan ($19.99) | ✅ |
| Sides | French Fries ($4.99) | ✅ |
| Beverages | Draft Beer ($6.99), Cappuccino ($4.50), Espresso ($3.50), Sparkling Water ($2.99) | ✅ |
| Desserts | Chocolate Lava Cake ($7.99) | ✅ |
| QA Cat | (test category) | ✅ |

### Tables (22 total, 3 sections)
| Section | Tables | Status |
|---------|--------|--------|
| Main Floor | M1-d4tc through M6-d4tc (6) | ✅ |
| Patio | P-01, P1-d4tc through P4-d4tc (5) | ✅ |
| Bar | B-01, B1-d4tc through B3-d4tc, T-69, V-01, T-0001, T-0175, T-3321, T-6933, T-7721 (11) | ✅ |

### Orders (55+ in DB)
| Recent Orders | Table | Total | Status |
|---------------|-------|-------|--------|
| ORD-20260305-6607 | M3-d4tc | $30.77 | Paid ✅ |
| ORD-20260305-2646 | P1-d4tc | $15.38 | Served ✅ |
| ORD-20260305-9699 | P-01 | $12.09 | Confirmed ✅ |

### Billing
| Transaction | Order | Amount | Method | Status |
|-------------|-------|--------|--------|--------|
| TXN-20260303-5827-001 | ORD-20260303-5827 | $16.49 | Cash | Completed ✅ |

### Discounts (API CRUD verified)
| Operation | Result |
|-----------|--------|
| Create (Test 10% Off, code: TEST10) | ✅ id=9 created |
| Read (list all) | ✅ 2 discounts returned |
| Update (10% → 15%, rename) | ✅ Updated |
| Delete (id=9) | ✅ Deleted |

---

## Feature Verification

| Feature | Mobile POS | Web Dashboard | Status |
|---------|-----------|---------------|--------|
| Menu browsing | ✅ Categories + item grid | ✅ 4-tab CRUD | ✅ |
| Order creation | ✅ POS → Send to Kitchen | ✅ Orders page (live) | ✅ |
| Table selection w/ areas | ✅ 4 area tabs (Main Dining, Patio, Bar Seating + All) | ✅ Floor plan grid | ✅ |
| Discount (order-level) | ✅ DiscountModal with presets + reasons | ✅ /discounts CRUD page | ✅ |
| Split Bill | ✅ Equal/By Items/Payment modes | N/A (mobile-only) | ✅ |
| Kitchen display | ✅ Kitchen Operations tab | ✅ Kanban board | ✅ |
| Billing | ✅ Payment flow (Cash/Card) | ✅ Transaction list + status update | ✅ |
| Customers | ✅ Customer search in POS | ✅ Customer directory | ✅ |
| Reports | N/A | ✅ Sales/Top Items/Staff tabs + CSV export | ✅ |
| Staff management | N/A | ✅ Staff list with role filter | ✅ |
| Sync (App → Web) | ✅ SyncEngine pushing every 10s | ✅ Data visible on web | ✅ |

---

## Bugs Found During Testing

| # | Description | File | Severity | Status |
|---|-------------|------|----------|--------|
| 1 | `table.section.toLowerCase is not a function` — section undefined on some tables | `TableSelectionModal.tsx:114` | Medium | ✅ Fixed |
| 2 | Discount modal shows Original Amount $0.00 in edit mode | `POSOrderScreen.tsx` | Low | Known |
| 3 | "Already Ordered" item shows $NaN in edit mode | `POSOrderScreen.tsx` | Low | Known |

---

## Notes

- All IDs populated from running services (Auth, Core, Menu all healthy)
- Mobile app running on Android emulator (emulator-5554)
- SyncEngine active: push interval 10s, queue empty (all synced)
- API Gateway uptime: 23,000+ seconds
- Last updated: 2026-03-06
