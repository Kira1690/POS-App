# Database Indexing Strategy

**Project**: Multi-Restaurant POS Database Architecture
**Date**: September 28, 2025
**Status**: COMPREHENSIVE STRATEGY

## 🎯 INDEXING OVERVIEW

### Strategic Goals

**ULTRATHINK Analysis**: A comprehensive indexing strategy for a multi-tenant, high-volume POS system requires balancing query performance, write performance, storage overhead, and maintenance complexity across 13 microservices handling 1000+ orders/day per restaurant.

#### Performance Targets
- **Query Response Time**: <100ms for 95% of queries
- **Order Processing**: <50ms for order creation and updates
- **Real-time Operations**: <25ms for kitchen and payment operations
- **Reporting Queries**: <2 seconds for complex analytics
- **Write Performance**: Minimal impact on insert/update operations

#### Index Categories
1. **Primary Performance Indexes**: Critical for core operations
2. **Multi-Tenant Indexes**: Restaurant-specific data isolation
3. **Composite Indexes**: Complex query optimization
4. **Partial Indexes**: Conditional indexing for active data
5. **Specialized Indexes**: GIN, GiST for JSONB and arrays

## 📊 SERVICE-SPECIFIC INDEXING STRATEGIES

### 1. Authentication Service (Global Multi-Tenant)

#### Critical Performance Indexes
```sql
-- User login optimization (high frequency)
CREATE INDEX CONCURRENTLY idx_users_email_active
ON auth_global.users(email)
WHERE is_active = true AND is_deleted = false;

CREATE INDEX CONCURRENTLY idx_users_employee_id_active
ON auth_global.users(employee_id)
WHERE employee_id IS NOT NULL AND is_active = true AND is_deleted = false;

-- Multi-restaurant user access
CREATE INDEX CONCURRENTLY idx_user_restaurant_access_active
ON auth_global.user_restaurant_access(user_id, restaurant_id)
WHERE is_active = true;

-- Session management (very high frequency)
CREATE INDEX CONCURRENTLY idx_user_sessions_active
ON auth_global.user_sessions(user_id, expires_at)
WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_user_sessions_token_family
ON auth_global.user_sessions(token_family)
WHERE status = 'active';

-- Device management
CREATE INDEX CONCURRENTLY idx_registered_devices_user_active
ON auth_global.registered_devices(user_id, is_active, is_trusted)
WHERE is_active = true;
```

#### Composite Indexes for Complex Queries
```sql
-- Authentication event analysis
CREATE INDEX CONCURRENTLY idx_auth_events_user_type_time
ON auth_global.auth_events(user_id, event_type, occurred_at DESC);

-- Restaurant-specific user queries
CREATE INDEX CONCURRENTLY idx_users_restaurant_role_active
ON auth_global.users(default_restaurant_id, role)
WHERE is_active = true AND is_deleted = false;
```

### 2. Order Processing Service (Per Restaurant)

#### High-Frequency Operation Indexes
```sql
-- Order status tracking (extremely high frequency)
CREATE INDEX CONCURRENTLY idx_orders_status_created_rest_001
ON rest_001_orders.orders(status, created_at DESC)
WHERE is_deleted = false;

-- Kitchen operations
CREATE INDEX CONCURRENTLY idx_orders_kitchen_active_rest_001
ON rest_001_orders.orders(status, submitted_at)
WHERE status IN ('confirmed', 'preparing', 'ready') AND is_deleted = false;

-- Table-based queries (dine-in operations)
CREATE INDEX CONCURRENTLY idx_orders_table_active_rest_001
ON rest_001_orders.orders(table_id, status)
WHERE table_id IS NOT NULL AND status NOT IN ('completed', 'cancelled');

-- Order items kitchen workflow
CREATE INDEX CONCURRENTLY idx_order_items_status_station_rest_001
ON rest_001_orders.order_items(status, kitchen_station, prep_started_at)
WHERE status IN ('pending', 'preparing');

-- Staff performance queries
CREATE INDEX CONCURRENTLY idx_orders_staff_date_rest_001
ON rest_001_orders.orders(created_by, created_at::date)
WHERE is_deleted = false;
```

#### Event Sourcing Optimization
```sql
-- Order events (high write volume)
CREATE INDEX CONCURRENTLY idx_order_events_order_sequence_rest_001
ON rest_001_orders.order_events(order_id, sequence_number);

-- Event publishing status
CREATE INDEX CONCURRENTLY idx_order_events_unpublished_rest_001
ON rest_001_orders.order_events(published, occurred_at)
WHERE published = false;
```

### 3. Payment Processing Service (Per Restaurant)

#### Transaction Processing Indexes
```sql
-- Payment status tracking (high frequency)
CREATE INDEX CONCURRENTLY idx_payments_status_method_rest_001
ON rest_001_payment.payments(status, payment_method, processed_at DESC);

-- Gateway transaction lookups
CREATE INDEX CONCURRENTLY idx_payments_gateway_transaction_rest_001
ON rest_001_payment.payments(gateway_transaction_id)
WHERE gateway_transaction_id IS NOT NULL;

-- VP3350 device tracking
CREATE INDEX CONCURRENTLY idx_payments_vp3350_device_rest_001
ON rest_001_payment.payments(vp3350_device_id, processed_at DESC)
WHERE vp3350_device_id IS NOT NULL;

-- Split payment management
CREATE INDEX CONCURRENTLY idx_payments_split_group_rest_001
ON rest_001_payment.payments(split_payment_group_id)
WHERE is_split_payment = true;

-- Daily reconciliation
CREATE INDEX CONCURRENTLY idx_payments_business_date_method_rest_001
ON rest_001_payment.payments(business_date, payment_method, status)
WHERE status = 'completed';
```

#### Financial Reporting Indexes
```sql
-- Revenue analysis
CREATE INDEX CONCURRENTLY idx_payments_date_amount_rest_001
ON rest_001_payment.payments(business_date, net_amount)
WHERE status = 'completed';

-- Refund tracking
CREATE INDEX CONCURRENTLY idx_payment_refunds_date_rest_001
ON rest_001_payment.payment_refunds(requested_at::date, refund_amount)
WHERE status IN ('completed', 'processed');
```

### 4. Menu Management Service (Per Restaurant)

#### Menu Browsing Optimization
```sql
-- Category browsing (high read frequency)
CREATE INDEX CONCURRENTLY idx_menu_categories_active_sort_rest_001
ON rest_001_menu.categories(is_active, sort_order)
WHERE is_deleted = false;

-- Item availability queries
CREATE INDEX CONCURRENTLY idx_menu_items_category_available_rest_001
ON rest_001_menu.items(category_id, availability_status, sort_order)
WHERE is_deleted = false;

-- Featured and popular items
CREATE INDEX CONCURRENTLY idx_menu_items_featured_popular_rest_001
ON rest_001_menu.items(featured, popular, sort_order)
WHERE is_available = true AND is_deleted = false;

-- Price range filtering
CREATE INDEX CONCURRENTLY idx_menu_items_price_range_rest_001
ON rest_001_menu.items(base_price, category_id)
WHERE is_available = true AND is_deleted = false;
```

#### Search and Filter Indexes
```sql
-- Full-text search on menu items
CREATE INDEX CONCURRENTLY idx_menu_items_search_rest_001
ON rest_001_menu.items USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Dietary restrictions (GIN for array queries)
CREATE INDEX CONCURRENTLY idx_menu_items_dietary_tags_rest_001
ON rest_001_menu.items USING GIN(dietary_tags);

-- Allergen filtering
CREATE INDEX CONCURRENTLY idx_menu_items_allergens_rest_001
ON rest_001_menu.items USING GIN(allergens);

-- Ingredient search
CREATE INDEX CONCURRENTLY idx_menu_items_ingredients_rest_001
ON rest_001_menu.items USING GIN(ingredients);
```

### 5. Kitchen Operations Service (Per Restaurant)

#### Real-Time Kitchen Display Indexes
```sql
-- Kitchen order status (sub-second queries required)
CREATE INDEX CONCURRENTLY idx_kitchen_orders_status_priority_rest_001
ON rest_001_kitchen.kitchen_orders(kitchen_status, priority, received_at)
WHERE kitchen_status IN ('received', 'acknowledged', 'in_progress');

-- Station-specific workload
CREATE INDEX CONCURRENTLY idx_kitchen_order_items_station_status_rest_001
ON rest_001_kitchen.kitchen_order_items(assigned_station_id, item_status, prep_started_at)
WHERE item_status IN ('pending', 'assigned', 'preparing');

-- Staff assignment queries
CREATE INDEX CONCURRENTLY idx_kitchen_order_items_assigned_status_rest_001
ON rest_001_kitchen.kitchen_order_items(assigned_to, item_status)
WHERE assigned_to IS NOT NULL;

-- Timing performance tracking
CREATE INDEX CONCURRENTLY idx_kitchen_orders_ready_time_rest_001
ON rest_001_kitchen.kitchen_orders(estimated_ready_time)
WHERE kitchen_status IN ('in_progress', 'ready');
```

#### Staff and Equipment Management
```sql
-- Staff shift queries
CREATE INDEX CONCURRENTLY idx_kitchen_staff_shifts_date_staff_rest_001
ON rest_001_kitchen.kitchen_staff_shifts(shift_date, staff_id, is_present);

-- Equipment status monitoring
CREATE INDEX CONCURRENTLY idx_kitchen_equipment_status_station_rest_001
ON rest_001_kitchen.kitchen_equipment(current_status, station_id)
WHERE is_active = true;
```

### 6. Table Management Service (Per Restaurant)

#### Real-Time Table Status
```sql
-- Table availability (high frequency)
CREATE INDEX CONCURRENTLY idx_tables_status_capacity_rest_001
ON rest_001_table.tables(current_status, capacity)
WHERE is_active = true AND is_deleted = false;

-- Section-based queries
CREATE INDEX CONCURRENTLY idx_tables_section_status_rest_001
ON rest_001_table.tables(section, current_status)
WHERE is_active = true;

-- Server assignment
CREATE INDEX CONCURRENTLY idx_tables_server_status_rest_001
ON rest_001_table.tables(assigned_server_id, current_status)
WHERE assigned_server_id IS NOT NULL;
```

#### Reservation Management
```sql
-- Reservation lookups (high frequency)
CREATE INDEX CONCURRENTLY idx_reservations_datetime_status_rest_001
ON rest_001_table.table_reservations(reservation_datetime, status)
WHERE status IN ('confirmed', 'arrived', 'seated');

-- Customer reservation history
CREATE INDEX CONCURRENTLY idx_reservations_customer_phone_rest_001
ON rest_001_table.table_reservations(customer_phone, reservation_date DESC);

-- Wait list management
CREATE INDEX CONCURRENTLY idx_reservations_waitlist_rest_001
ON rest_001_table.table_reservations(wait_list_position, reservation_datetime)
WHERE status = 'waitlist' AND wait_list_position IS NOT NULL;
```

### 7. Inventory Management Service (Per Restaurant)

#### Stock Level Monitoring
```sql
-- Low stock alerts (frequent automated queries)
CREATE INDEX CONCURRENTLY idx_inventory_items_reorder_alerts_rest_001
ON rest_001_inventory.inventory_items(current_stock, minimum_stock, is_tracked)
WHERE is_tracked = true AND status = 'active';

-- Stock movements tracking
CREATE INDEX CONCURRENTLY idx_stock_movements_item_date_rest_001
ON rest_001_inventory.stock_movements(item_id, movement_date DESC);

-- Supplier performance
CREATE INDEX CONCURRENTLY idx_stock_movements_supplier_date_rest_001
ON rest_001_inventory.stock_movements(supplier_id, movement_date)
WHERE movement_type = 'receiving';
```

#### Cost Analysis Indexes
```sql
-- Cost variance analysis
CREATE INDEX CONCURRENTLY idx_stock_movements_cost_variance_rest_001
ON rest_001_inventory.stock_movements(movement_date, cost_variance)
WHERE cost_variance IS NOT NULL;

-- Purchase order tracking
CREATE INDEX CONCURRENTLY idx_purchase_orders_status_date_rest_001
ON rest_001_inventory.purchase_orders(status, order_date DESC);
```

## 🏗️ ADVANCED INDEXING TECHNIQUES

### Partial Indexes for Active Data

#### Active Records Only
```sql
-- Index only active, non-deleted records
CREATE INDEX CONCURRENTLY idx_menu_items_active_only_rest_001
ON rest_001_menu.items(category_id, sort_order)
WHERE is_available = true AND is_deleted = false;

-- Index only current business day orders
CREATE INDEX CONCURRENTLY idx_orders_today_rest_001
ON rest_001_orders.orders(status, created_at)
WHERE created_at >= CURRENT_DATE AND is_deleted = false;
```

#### Time-Based Partial Indexes
```sql
-- Recent orders (last 30 days) for performance
CREATE INDEX CONCURRENTLY idx_orders_recent_rest_001
ON rest_001_orders.orders(status, customer_id, created_at DESC)
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Active sessions only
CREATE INDEX CONCURRENTLY idx_sessions_active_only
ON auth_global.user_sessions(user_id, last_activity_at DESC)
WHERE status = 'active' AND expires_at > NOW();
```

### Composite Indexes for Complex Queries

#### Multi-Column Performance Indexes
```sql
-- Order processing workflow
CREATE INDEX CONCURRENTLY idx_orders_workflow_rest_001
ON rest_001_orders.orders(restaurant_id, status, priority, created_at DESC)
WHERE is_deleted = false;

-- Payment reconciliation
CREATE INDEX CONCURRENTLY idx_payments_reconciliation_rest_001
ON rest_001_payment.payments(business_date, payment_method, status, net_amount)
WHERE status = 'completed';

-- Kitchen performance analysis
CREATE INDEX CONCURRENTLY idx_kitchen_performance_rest_001
ON rest_001_kitchen.kitchen_order_items(
  assigned_station_id,
  prep_started_at::date,
  item_status,
  actual_prep_time
) WHERE prep_started_at IS NOT NULL;
```

### Specialized Indexes for JSON and Arrays

#### JSONB Indexes
```sql
-- Menu item customizations
CREATE INDEX CONCURRENTLY idx_order_items_customizations_rest_001
ON rest_001_orders.order_items USING GIN(customizations);

-- Payment gateway responses
CREATE INDEX CONCURRENTLY idx_payments_gateway_response_rest_001
ON rest_001_payment.payments USING GIN(gateway_response);

-- Restaurant settings
CREATE INDEX CONCURRENTLY idx_restaurants_settings
ON auth_global.restaurants USING GIN(settings);
```

#### Array Indexes
```sql
-- Menu item allergens and dietary tags
CREATE INDEX CONCURRENTLY idx_menu_items_allergens_gin_rest_001
ON rest_001_menu.items USING GIN(allergens);

CREATE INDEX CONCURRENTLY idx_menu_items_dietary_gin_rest_001
ON rest_001_menu.items USING GIN(dietary_tags);

-- Kitchen capabilities
CREATE INDEX CONCURRENTLY idx_kitchen_stations_capabilities_rest_001
ON rest_001_kitchen.kitchen_stations USING GIN(capabilities);
```

## ⚡ PERFORMANCE OPTIMIZATION STRATEGIES

### Index Maintenance

#### Automated Index Statistics
```sql
-- Ensure statistics are current for optimal query planning
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname LIKE 'rest_%' OR schemaname LIKE '%_global'
  LOOP
    EXECUTE 'ANALYZE ' || quote_ident(table_record.schemaname) || '.' || quote_ident(table_record.tablename);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule to run every 6 hours
SELECT cron.schedule('update-statistics', '0 */6 * * *', 'SELECT update_table_statistics();');
```

#### Index Usage Monitoring
```sql
-- Monitor index usage for optimization
CREATE VIEW index_usage_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  CASE
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 10 THEN 'LOW_USAGE'
    WHEN idx_scan < 100 THEN 'MODERATE_USAGE'
    ELSE 'HIGH_USAGE'
  END as usage_category
FROM pg_stat_user_indexes
WHERE schemaname LIKE 'rest_%' OR schemaname LIKE '%_global'
ORDER BY idx_scan DESC;
```

### Query Performance Monitoring

#### Slow Query Detection
```sql
-- Monitor queries taking longer than 100ms
CREATE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_time,
  mean_time,
  min_time,
  max_time,
  stddev_time
FROM pg_stat_statements
WHERE mean_time > 100  -- 100ms threshold
ORDER BY mean_time DESC;
```

#### Index Effectiveness Analysis
```sql
-- Analyze index effectiveness for order processing
CREATE VIEW order_query_performance AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  seq_scan,
  CASE
    WHEN seq_scan > idx_scan THEN 'INDEX_UNDERUSED'
    WHEN idx_scan > seq_scan * 10 THEN 'INDEX_EFFECTIVE'
    ELSE 'INDEX_MODERATE'
  END as effectiveness
FROM pg_stat_user_tables t
JOIN pg_stat_user_indexes i ON t.relid = i.relid
WHERE schemaname LIKE '%_orders'
ORDER BY seq_scan DESC;
```

## 📋 INDEX IMPLEMENTATION PLAN

### Phase 1: Critical Performance Indexes (Week 1)
```sql
-- Authentication service critical indexes
-- Order processing service critical indexes
-- Payment processing service critical indexes
-- Priority: Indexes supporting >1000 queries/day
```

### Phase 2: Multi-Tenant Optimization (Week 2)
```sql
-- Restaurant-specific composite indexes
-- Cross-service query optimization
-- Partial indexes for active data
```

### Phase 3: Specialized Indexes (Week 3)
```sql
-- JSONB and array indexes
-- Full-text search indexes
-- Geospatial indexes (if needed for delivery)
```

### Phase 4: Performance Monitoring (Week 4)
```sql
-- Index usage monitoring setup
-- Automated statistics updates
-- Performance alerting
```

## 🎯 INDEX NAMING CONVENTIONS

### Standard Format
```
idx_{table_name}_{column_names}_{restaurant_id}
```

### Examples
```sql
-- Single column index
idx_orders_status_rest_001

-- Composite index
idx_orders_status_created_rest_001

-- Partial index
idx_orders_active_rest_001

-- Specialized index
idx_menu_items_search_gin_rest_001
```

### Performance Targets by Index Type

| Index Type | Target Query Time | Use Case |
|------------|------------------|----------|
| **Primary Key** | <1ms | Record lookups |
| **Status Indexes** | <10ms | Order/payment status |
| **Composite Indexes** | <25ms | Complex filtering |
| **Search Indexes** | <50ms | Full-text search |
| **Analytics Indexes** | <100ms | Reporting queries |

---

**Next Steps**: Begin Phase 1 implementation with critical performance indexes for authentication, order, and payment services.

**Dependencies**:
- PostgreSQL 15+ with concurrent index creation capability
- pg_stat_statements extension for query monitoring
- pg_cron extension for automated maintenance