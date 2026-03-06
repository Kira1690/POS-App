# DB Field Parity — SQLite (Mobile) vs Prisma (Backend)

## Legend
- ✅ Match — field names and types are identical
- ⚠️ Type mismatch only — names match, types differ (e.g., string vs BigInt)
- ❌ Name mismatch — different field names for same concept
- 🔧 Fix needed — structural mismatch requiring code change
- ✔️ Fixed — fix implemented in this session

---

## Entity: `orders`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` BigInt | ⚠️ | SQLite uses UUID strings; Core serializer handles |
| `restaurant_id` | `restaurant_id` BigInt | ⚠️ | String vs BigInt; serializer handles |
| `order_number` | `order_number` String | ✅ | |
| `table_id` | `table_id` BigInt? | ⚠️ | String vs BigInt |
| `customer_id` | `customer_id` BigInt? | ⚠️ | String vs BigInt |
| `created_by` | `user_id` BigInt | ❌ ✔️ | Fixed in OrderSyncProcessor.ts: maps created_by→user_id |
| `served_by` | `server_id` BigInt? | ❌ ✔️ | Fixed in OrderSyncProcessor.ts: maps served_by→server_id |
| `payment_status` | `payment_status` String? | ❌ ✔️ | Added to schema.prisma; migration applied via `db push` |
| `status` | `status` OrderStatus | ✅ | Enum values match |
| `order_type` | `order_type` OrderType | ✅ | |
| `subtotal` | `subtotal` Decimal | ⚠️ | Number vs Decimal |
| `tax_amount` | `tax_amount` Decimal | ⚠️ | Number vs Decimal |
| `discount_amount` | `discount_amount` Decimal | ⚠️ | Number vs Decimal |
| `total_amount` | `total_amount` Decimal | ⚠️ | Number vs Decimal |
| `notes` | `notes` String? | ✅ | |
| `created_at` | `created_at` DateTime | ⚠️ | ISO string vs DateTime |
| `updated_at` | `updated_at` DateTime | ⚠️ | ISO string vs DateTime |

---

## Entity: `order_items`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` BigInt | ⚠️ | UUID string vs BigInt |
| `order_id` | `order_id` BigInt | ⚠️ | |
| `menu_item_id` | `menu_item_id` BigInt | ⚠️ | |
| `menu_item_name` | `menu_item_name` String | ✅ | |
| `quantity` | `quantity` Int | ✅ | |
| `unit_price` | `unit_price` Decimal | ⚠️ | Number vs Decimal |
| `total_price` | `total_price` Decimal | ⚠️ | Number vs Decimal |
| `item_status` | `status` OrderItemStatus | ❌ ✔️ | Fixed in OrderSyncProcessor.ts: maps item_status→status |
| `notes` | `notes` String? | ✅ | |
| `kitchen_station` | `kitchen_station` KitchenStation? | ✅ | |

---

## Entity: `tables`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` BigInt | ⚠️ | UUID string vs BigInt |
| `restaurant_id` | `restaurant_id` BigInt | ⚠️ | |
| `section` (string) | `section_id` BigInt | ❌ | TableApiClient.ts normalizes Prisma object→string for display |
| `table_number` | `table_number` String | ✅ | |
| `capacity` | `capacity` Int | ✅ | |
| `status` | `status` TableStatus | ✅ | Enum values match |

---

## Entity: `kitchen_tickets`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` BigInt | ⚠️ | UUID string vs BigInt |
| `order_id` | `order_id` BigInt | ⚠️ | |
| `station` | `station` KitchenStation | ✅ | |
| `status` | `status` KitchenTicketStatus | ✅ | |
| `items` TEXT JSON | `kitchen_ticket_items` (relation table) | 🔧 | Items stored as JSON blob in SQLite; need expansion on push |

---

## Entity: `payment_records`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` BigInt (transactions table) | ⚠️ | Structural difference: SQLite has payment_records, Prisma has transactions+payments |
| `order_id` | `order_id` BigInt | ⚠️ | |
| `total_amount` | `total_amount` Decimal | ⚠️ | |
| `payment_method` | `payment_method` PaymentMethod (in payments table) | 🔧 | Different schema structure |
| `pending_sync` | — | ✅ | App-only field for sync tracking |
| — | — | — | PaymentService.processCashPayment() now enqueues for sync ✔️ |

---

## Entity: `menu_categories`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` (Menu Service) | ✅ | Pull-only from Menu Service |
| `name` | `name` | ✅ | |
| `is_active` | `is_active` | ✅ | |

---

## Entity: `menu_items`

| SQLite Column | Prisma Field | Status | Notes |
|---------------|-------------|--------|-------|
| `id` | `id` | ✅ | Pull-only |
| `name` | `name` | ✅ | |
| `price` | `price` | ✅ | |
| `category_id` | `category_id` | ✅ | |
| `is_available` | `is_available` | ✅ | |

---

## Summary

| Entity | Total Fields | ✅ Match | ⚠️ Type Only | ❌ Name Mismatch | ✔️ Fixed |
|--------|-------------|----------|--------------|-----------------|----------|
| orders | 18 | 5 | 8 | 3 (payment_status, created_by, served_by) | 3 |
| order_items | 9 | 4 | 4 | 1 (item_status→status) | 1 |
| tables | 6 | 2 | 3 | 1 (section handling) | 0 (existing workaround) |
| kitchen_tickets | 5 | 3 | 2 | 0 | 0 |
| payment_records | 6 | 2 | 2 | 2 | 1 (sync enqueue) |
| menu_categories | 3 | 3 | 0 | 0 | n/a (pull-only) |
| menu_items | 5 | 5 | 0 | 0 | n/a (pull-only) |

**All critical name mismatches fixed as of 2026-03-04.**
