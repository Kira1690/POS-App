# Phase 2: Backend Schema Alignment

## Objective
Ensure the PostgreSQL backend schemas (Prisma/Drizzle) match the SQLite mobile schema field-for-field, so sync works without data transformation. **NO changes to SQLite schema.**

---

## The Rule

> SQLite is the reference. Backend adapts to match it.

The POS app SQLite schema has been built and tested. The backend Prisma/Drizzle schemas must produce data that maps 1:1 to SQLite rows.

---

## Field-by-Field Comparison

### Orders Table

| SQLite Field | Type | Core Service Prisma | Match? | Action |
|-------------|------|-------------------|--------|--------|
| id | TEXT PK | id (String @id) | Yes | - |
| order_number | TEXT | order_number (String) | Yes | - |
| restaurant_id | TEXT | restaurant_id (Int) | **NO** | SQLite uses TEXT, Prisma uses Int. Sync layer must convert. |
| table_id | TEXT | table_id (Int) | **NO** | Same issue — Int vs TEXT |
| table_name | TEXT | *missing* | **NO** | Add to Prisma or include in sync response |
| guest_count | INTEGER | guest_count (Int) | Yes | - |
| customer_id | TEXT | customer_id (Int?) | Partial | Type mismatch (TEXT vs Int) |
| created_by | TEXT | created_by (Int) | **NO** | Type mismatch |
| created_by_name | TEXT | *missing* | **NO** | Add to Prisma or denormalize in sync |
| served_by | TEXT | *missing* | **NO** | Add to Prisma |
| served_by_name | TEXT | *missing* | **NO** | Add to Prisma |
| subtotal | REAL | subtotal (Decimal) | Yes (convertible) | - |
| tax_rate | REAL | tax_rate (Decimal) | Yes | - |
| tax_amount | REAL | tax_amount (Decimal) | Yes | - |
| discount_type | TEXT | discount_type (String?) | Yes | - |
| discount_value | REAL | discount_value (Decimal?) | Yes | - |
| discount_amount | REAL | discount_amount (Decimal) | Yes | - |
| tip_amount | REAL | tip_amount (Decimal) | Yes | - |
| total_amount | REAL | total_amount (Decimal) | Yes | - |
| status | TEXT | status (OrderStatus enum) | Yes | Map enum to string |
| payment_status | TEXT | *via transactions* | Partial | SQLite stores directly, Prisma derives |
| special_instructions | TEXT | special_instructions (String?) | Yes | - |
| cancellation_reason | TEXT | cancellation_reason (String?) | Yes | - |
| submitted_at | TEXT | *missing* | **NO** | Add to Prisma |
| paid_at | TEXT | paid_at (DateTime?) | Yes (format) | - |
| cancelled_at | TEXT | cancelled_at (DateTime?) | Yes | - |
| preparing_at | TEXT | *missing* | **NO** | Add to Prisma |
| ready_at | TEXT | *missing* | **NO** | Add to Prisma |
| served_at | TEXT | *missing* | **NO** | Add to Prisma |
| estimated_prep_time | INTEGER | estimated_prep_time (Int?) | Yes | - |
| actual_prep_time | INTEGER | actual_prep_time (Int?) | Yes | - |
| pending_sync | INTEGER | *N/A* | N/A | Local-only field, never synced |
| synced_at | TEXT | *N/A* | N/A | Local-only field |
| created_at | TEXT | created_at (DateTime) | Yes (format) | - |
| updated_at | TEXT | updated_at (DateTime) | Yes (format) | - |

### Order Items Table

| SQLite Field | Type | Core Service Prisma | Match? | Action |
|-------------|------|-------------------|--------|--------|
| id | TEXT PK | id (String @id) | Yes | - |
| order_id | TEXT | order_id (String) | Yes | - |
| menu_item_id | TEXT | menu_item_id (Int) | **NO** | Type mismatch |
| name | TEXT | *from relation* | Partial | SQLite denormalizes, Prisma uses join |
| category | TEXT | *missing* | **NO** | Add or denormalize in sync |
| category_id | TEXT | *missing* | **NO** | Add or denormalize |
| base_price | REAL | unit_price (Decimal) | Yes (rename) | Sync layer maps field name |
| quantity | INTEGER | quantity (Int) | Yes | - |
| modifier_total | REAL | modifier_total (Decimal?) | Yes | - |
| item_total | REAL | total_price (Decimal) | Yes (rename) | Sync layer maps |
| selected_modifiers | TEXT (JSON) | *via relation* | **NO** | SQLite stores JSON, Prisma uses relation table |
| dietary_tags | TEXT (JSON) | *missing* | **NO** | Add to Prisma or include in sync |
| allergens | TEXT (JSON) | *missing* | **NO** | Add to Prisma |
| has_allergen_warning | INTEGER | *missing* | **NO** | Add to Prisma |
| kitchen_station | TEXT | kitchen_station (KitchenStation?) | Yes | - |
| item_status | TEXT | status (OrderItemStatus) | Yes | - |
| special_instructions | TEXT | special_instructions (String?) | Yes | - |
| kitchen_notes | TEXT | kitchen_notes (String?) | Yes | - |
| is_combo_item | INTEGER | *missing* | **NO** | Add to Prisma |
| combo_id | TEXT | *missing* | **NO** | Add to Prisma |
| combo_name | TEXT | *missing* | **NO** | Add to Prisma |
| added_at | TEXT | created_at (DateTime) | Yes (rename) | - |
| modified_at | TEXT | updated_at (DateTime) | Yes (rename) | - |

### Kitchen Tickets Table

| SQLite Field | Type | Core Service Prisma | Match? | Action |
|-------------|------|-------------------|--------|--------|
| id | TEXT PK | id (String @id) | Yes | - |
| order_id | TEXT | order_id (String) | Yes | - |
| order_number | TEXT | order_number (String?) | Yes | - |
| table_id | TEXT | *missing* | **NO** | Add to Prisma |
| table_name | TEXT | *missing* | **NO** | Add to Prisma |
| station | TEXT | station (KitchenStation) | Yes | - |
| items | TEXT (JSON) | *via relation* | **NO** | SQLite stores JSON, Prisma uses relation |
| item_count | INTEGER | *calculated* | Partial | Compute in sync |
| completed_item_count | INTEGER | *missing* | **NO** | Add or compute |
| status | TEXT | status (KitchenTicketStatus) | Yes | - |
| priority | TEXT | priority (String?) | Yes | - |
| has_allergens | INTEGER | *missing* | **NO** | Add to Prisma |
| allergen_items | TEXT (JSON) | *missing* | **NO** | Add to Prisma |
| is_rush | INTEGER | *missing* | **NO** | Add to Prisma |
| is_overdue | INTEGER | *computed* | N/A | Compute client-side |
| overdue_by | INTEGER | *computed* | N/A | Compute client-side |
| special_instructions | TEXT | special_instructions (String?) | Yes | - |
| delay_reason | TEXT | *missing* | **NO** | Add to Prisma |
| assigned_to | TEXT | *missing* | **NO** | Add to Prisma |
| assigned_to_name | TEXT | *missing* | **NO** | Add to Prisma |
| estimated_prep_time | INTEGER | estimated_prep_time (Int?) | Yes | - |
| actual_prep_time | INTEGER | actual_prep_time (Int?) | Yes | - |
| started_at | TEXT | started_at (DateTime?) | Yes | - |
| completed_at | TEXT | completed_at (DateTime?) | Yes | - |
| served_at | TEXT | *missing* | **NO** | Add to Prisma |
| pending_sync | INTEGER | *N/A* | N/A | Local-only |
| synced_at | TEXT | *N/A* | N/A | Local-only |
| created_at | TEXT | created_at (DateTime) | Yes | - |
| updated_at | TEXT | updated_at (DateTime?) | Yes | - |

---

## Resolution Strategy

There are TWO approaches. We recommend **Approach B**.

### Approach A: Modify Backend Prisma Schemas
Add missing fields to Prisma schemas so they match SQLite exactly.

**Pros**: Clean 1:1 mapping, simple sync code
**Cons**: Requires database migration, may break existing backend logic

### Approach B: Sync Transformation Layer (Recommended)
Keep backend schemas as-is. Build a transformation layer in the sync processors that maps between formats.

**Pros**: No schema changes anywhere, both sides keep working
**Cons**: Slightly more sync code

### Transformation Layer Design

```typescript
// POS-App/src/services/sync/transformers/OrderTransformer.ts

class OrderTransformer {

  // SQLite → API (for push)
  static toApiFormat(localOrder: LocalOrder): ApiOrderPayload {
    return {
      id: localOrder.id,
      order_number: localOrder.order_number,
      restaurant_id: parseInt(localOrder.restaurant_id), // TEXT → INT
      table_id: parseInt(localOrder.table_id),           // TEXT → INT
      guest_count: localOrder.guest_count,
      customer_id: localOrder.customer_id ? parseInt(localOrder.customer_id) : null,
      created_by: parseInt(localOrder.created_by),
      // Denormalized fields sent as metadata (not stored in Prisma relations)
      metadata: {
        table_name: localOrder.table_name,
        created_by_name: localOrder.created_by_name,
        served_by: localOrder.served_by,
        served_by_name: localOrder.served_by_name,
      },
      subtotal: localOrder.subtotal,
      tax_rate: localOrder.tax_rate,
      tax_amount: localOrder.tax_amount,
      total_amount: localOrder.total_amount,
      status: localOrder.status,
      payment_status: localOrder.payment_status,
      items: localOrder.items?.map(item => OrderItemTransformer.toApiFormat(item)),
      // ... remaining fields
    };
  }

  // API → SQLite (for pull)
  static toLocalFormat(apiOrder: ApiOrderResponse): LocalOrder {
    return {
      id: apiOrder.id,
      order_number: apiOrder.order_number,
      restaurant_id: String(apiOrder.restaurant_id), // INT → TEXT
      table_id: String(apiOrder.table_id),           // INT → TEXT
      table_name: apiOrder.table?.table_number || apiOrder.metadata?.table_name || '',
      guest_count: apiOrder.guest_count,
      created_by: String(apiOrder.created_by),
      created_by_name: apiOrder.creator?.name || apiOrder.metadata?.created_by_name || '',
      // ... map all fields
      pending_sync: 0,  // Came from server, already synced
      synced_at: new Date().toISOString(),
    };
  }
}
```

```typescript
// OrderItemTransformer.ts
class OrderItemTransformer {
  static toApiFormat(item: LocalOrderItem): ApiOrderItem {
    return {
      id: item.id,
      menu_item_id: parseInt(item.menu_item_id),
      quantity: item.quantity,
      unit_price: item.base_price,    // field name mapping
      total_price: item.item_total,   // field name mapping
      special_instructions: item.special_instructions,
      kitchen_notes: item.kitchen_notes,
      kitchen_station: item.kitchen_station,
      status: item.item_status,
      // JSON fields → structured data
      modifiers: JSON.parse(item.selected_modifiers || '[]'),
      // Denormalized fields as metadata
      metadata: {
        name: item.name,
        category: item.category,
        category_id: item.category_id,
        dietary_tags: JSON.parse(item.dietary_tags || '[]'),
        allergens: JSON.parse(item.allergens || '[]'),
        is_combo_item: item.is_combo_item,
        combo_id: item.combo_id,
        combo_name: item.combo_name,
      },
    };
  }

  static toLocalFormat(apiItem: ApiOrderItem, menuData?: any): LocalOrderItem {
    return {
      id: apiItem.id,
      menu_item_id: String(apiItem.menu_item_id),
      name: apiItem.menu_item?.name || apiItem.metadata?.name || '',
      category: apiItem.menu_item?.category?.name || apiItem.metadata?.category || '',
      base_price: apiItem.unit_price,
      quantity: apiItem.quantity,
      item_total: apiItem.total_price,
      selected_modifiers: JSON.stringify(apiItem.modifiers || []),
      item_status: apiItem.status,
      // ... map remaining
    };
  }
}
```

---

## Key Type Mismatches to Handle

| Issue | SQLite | PostgreSQL/Prisma | Transform |
|-------|--------|-------------------|-----------|
| IDs as text vs int | TEXT (UUIDs or string numbers) | Int (BIGSERIAL) or String | `String()` / `parseInt()` |
| DateTime format | ISO string TEXT | DateTime object | `.toISOString()` / `new Date()` |
| Boolean | INTEGER (0/1) | Boolean | `!!value` / `value ? 1 : 0` |
| JSON arrays | TEXT (JSON string) | Relation tables | `JSON.parse()` / `JSON.stringify()` |
| Decimal | REAL (float) | Decimal (exact) | Direct (close enough for money) |
| Denormalized fields | Stored inline | Via JOINs | Include in API response |
| Enum values | TEXT string | Prisma enum | Direct string match |

---

## Backend API Response Enhancement

The sync pull endpoints should return **denormalized** data that includes all fields the mobile app needs without extra queries:

```typescript
// Core Service: GET /api/orders/:id response should include:
{
  id: "order-123",
  order_number: "ORD-001",
  restaurant_id: 1,
  table_id: 5,
  table: {                         // ← Include relation
    table_number: "T5",
  },
  created_by: 42,
  creator: {                       // ← Include relation
    name: "John Doe",
  },
  served_by: 43,
  server: {                        // ← Include relation
    name: "Jane Smith",
  },
  items: [
    {
      id: "item-1",
      menu_item_id: 10,
      menu_item: {                 // ← Include relation
        name: "Burger",
        category: { name: "Main Course", id: 3 },
      },
      quantity: 2,
      unit_price: 12.99,
      modifiers: [                 // ← Include relation
        { name: "Extra Cheese", price_adjustment: 1.50 }
      ],
    }
  ],
}
```

This way the transformer can extract denormalized fields without additional API calls.

---

## Files to Create

```
POS-App/src/services/sync/transformers/
├── OrderTransformer.ts
├── OrderItemTransformer.ts
├── KitchenTicketTransformer.ts
├── PaymentTransformer.ts
├── MenuTransformer.ts
├── TableTransformer.ts
└── index.ts
```

## Files to Modify (Backend — minimal)

```
POS-Services/POS-Core-Service/src/routes/sync.routes.ts
  → Ensure pull responses include full relations (Prisma include)

POS-Services/POS-Core-Service/src/controllers/order.controller.ts
  → Ensure order responses include table, creator, server relations

POS-Services/POS-Menu-Service/src/controllers/menu.controller.ts
  → Ensure menu responses include category, modifiers relations
```

---

## Success Criteria

- [ ] Every SQLite field has a mapping defined in transformers
- [ ] Push: SQLite data converts cleanly to API format
- [ ] Pull: API response converts cleanly to SQLite format
- [ ] No data loss during transformation
- [ ] Type mismatches handled (TEXT↔INT, JSON↔Relations, REAL↔Decimal)
- [ ] Denormalized fields populated correctly from relations
- [ ] Round-trip test: create on mobile → push → pull on different device → identical data
