# Multi-Tenant Architecture Design

**Project**: Multi-Restaurant POS Database Architecture
**Date**: September 28, 2025
**Status**: IN PROGRESS

## 🏗️ MULTI-TENANCY STRATEGY OVERVIEW

### Selected Architecture: Hybrid Multi-Tenant Approach

**ULTRATHINK Analysis**: After comprehensive analysis of the requirements for a 5-restaurant POS system with 13 microservices, a hybrid multi-tenant approach provides the optimal balance of data isolation, performance, cost-effectiveness, and operational complexity.

#### Architecture Decision Matrix

| Criteria | Shared DB/Schema | Shared DB/Separate Schemas | Separate Databases | **Selected: Hybrid** |
|----------|------------------|----------------------------|-------------------|---------------------|
| **Data Isolation** | ❌ Poor | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Cost Efficiency** | ✅ Excellent | ✅ Good | ❌ Poor | ✅ Good |
| **Operational Complexity** | ✅ Low | 🟡 Medium | ❌ High | 🟡 Medium |
| **Performance** | 🟡 Variable | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Scalability** | ❌ Limited | 🟡 Medium | ✅ High | ✅ High |
| **Compliance (PCI, etc.)** | ❌ Difficult | 🟡 Moderate | ✅ Easy | ✅ Easy |
| **Backup/Recovery** | 🟡 Complex | ✅ Moderate | ✅ Simple | ✅ Simple |

### Hybrid Architecture Components

#### 1. Shared Core Infrastructure
```sql
-- Global system schemas (single instance per cluster)
CREATE SCHEMA system_core;        -- System configuration, global settings
CREATE SCHEMA auth_global;        -- User authentication, system roles
CREATE SCHEMA analytics_global;   -- Cross-restaurant analytics, reporting
```

#### 2. Restaurant-Specific Service Schemas
```sql
-- Restaurant-specific operational data
CREATE SCHEMA rest_001_menu;      -- The Food Corner - Menu data
CREATE SCHEMA rest_001_orders;    -- The Food Corner - Order processing
CREATE SCHEMA rest_001_payment;   -- The Food Corner - Payment data
CREATE SCHEMA rest_001_kitchen;   -- The Food Corner - Kitchen operations
CREATE SCHEMA rest_001_inventory; -- The Food Corner - Inventory management
-- ... repeat for each restaurant (001-005)
```

#### 3. Service-Specific Shared Schemas
```sql
-- Services with limited tenant-specific data
CREATE SCHEMA notification_shared;  -- Templates, system notifications
CREATE SCHEMA integration_shared;   -- External API configurations
CREATE SCHEMA print_shared;         -- Printer configurations, templates
```

## 🎯 RESTAURANT DATA ISOLATION STRATEGY

### Primary Isolation Mechanisms

#### 1. Schema-Level Isolation
**Implementation**: Each restaurant has dedicated schemas for core business data
**Benefits**:
- Complete logical separation of restaurant data
- Independent backup and recovery per restaurant
- Schema-level permissions and access control
- Easy restaurant-specific maintenance operations

```sql
-- Example: Restaurant schema naming convention
-- Format: rest_{restaurant_id}_{service}
CREATE SCHEMA rest_001_orders;    -- The Food Corner orders
CREATE SCHEMA rest_002_orders;    -- Pizza Palace orders
CREATE SCHEMA rest_003_orders;    -- Burger House orders
```

#### 2. Application-Level Isolation
**Implementation**: Microservices enforce restaurant context in all operations
**Benefits**:
- Double validation of data access
- Runtime prevention of cross-restaurant data access
- Comprehensive audit trail of restaurant-specific operations

```typescript
// Example: Restaurant context enforcement
interface DatabaseContext {
  restaurantId: string;
  userId: string;
  schema: string; // Computed from restaurantId
}

class OrderService {
  async getOrders(context: DatabaseContext): Promise<Order[]> {
    // Automatically enforces restaurant schema
    const schema = `rest_${context.restaurantId}_orders`;
    return this.db.query(`SELECT * FROM ${schema}.orders WHERE ...`);
  }
}
```

#### 3. Database-Level Row Security (Where Applicable)
**Implementation**: RLS policies for shared tables that contain multi-restaurant data
**Use Cases**: Limited to shared lookup tables and system configurations

```sql
-- Example: RLS for shared configuration tables
CREATE POLICY restaurant_isolation ON system_config
  USING (restaurant_id = current_setting('app.current_restaurant_id'));
```

### Isolation Validation Procedures

#### 1. Automated Testing Framework
```sql
-- Test procedure: Verify no cross-restaurant data access
CREATE OR REPLACE FUNCTION test_restaurant_isolation()
RETURNS TABLE(test_name text, passed boolean, details text) AS $$
BEGIN
  -- Test 1: Verify schema access restrictions
  -- Test 2: Validate row-level security policies
  -- Test 3: Check application-level enforcement
  -- Test 4: Audit cross-schema relationship constraints
END;
$$ LANGUAGE plpgsql;
```

#### 2. Regular Security Audits
- **Weekly**: Automated isolation validation tests
- **Monthly**: Comprehensive cross-restaurant data access audit
- **Quarterly**: Penetration testing of multi-tenant boundaries

#### 3. Real-time Monitoring
```sql
-- Monitor for unexpected cross-restaurant queries
CREATE VIEW cross_tenant_access_monitor AS
SELECT
  session_user,
  current_database(),
  query_start,
  query,
  state
FROM pg_stat_activity
WHERE query LIKE '%rest_%'
  AND query NOT LIKE '%' || current_setting('app.current_restaurant_schema') || '%';
```

## 🏢 RESTAURANT SCHEMA ORGANIZATION

### Schema Naming Convention

#### Format: `rest_{restaurant_id}_{service}`
```
rest_001_auth      - The Food Corner - Authentication data
rest_001_menu      - The Food Corner - Menu management
rest_001_orders    - The Food Corner - Order processing
rest_001_payment   - The Food Corner - Payment processing
rest_001_kitchen   - The Food Corner - Kitchen operations
rest_001_inventory - The Food Corner - Inventory management
rest_001_customer  - The Food Corner - Customer management
rest_001_staff     - The Food Corner - Staff management
rest_001_table     - The Food Corner - Table management
```

#### Shared Schema Naming
```
auth_global        - Global authentication and user management
analytics_global   - Cross-restaurant analytics and reporting
system_core        - System configuration and global settings
notification_shared - Notification templates and delivery
integration_shared  - External system integrations
print_shared       - Print management and templates
```

### Restaurant Onboarding Procedure

#### 1. Automated Schema Creation
```sql
-- Procedure: Create schemas for new restaurant
CREATE OR REPLACE FUNCTION create_restaurant_schemas(
  p_restaurant_id text,
  p_restaurant_name text
) RETURNS boolean AS $$
DECLARE
  schema_name text;
  service_names text[] := ARRAY[
    'auth', 'menu', 'orders', 'payment', 'kitchen',
    'inventory', 'customer', 'staff', 'table'
  ];
  service_name text;
BEGIN
  -- Create schemas for each service
  FOREACH service_name IN ARRAY service_names LOOP
    schema_name := 'rest_' || p_restaurant_id || '_' || service_name;
    EXECUTE 'CREATE SCHEMA ' || quote_ident(schema_name);

    -- Set appropriate permissions
    EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(schema_name) ||
            ' TO restaurant_' || p_restaurant_id || '_users';
  END LOOP;

  -- Create restaurant-specific database roles
  EXECUTE 'CREATE ROLE restaurant_' || p_restaurant_id || '_admin';
  EXECUTE 'CREATE ROLE restaurant_' || p_restaurant_id || '_users';

  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Service-Specific Table Creation
```sql
-- Each service has its own table creation script
-- Example: Order service tables for new restaurant
CREATE OR REPLACE FUNCTION create_order_service_tables(
  p_restaurant_schema text
) RETURNS boolean AS $$
BEGIN
  -- Create orders table in restaurant-specific schema
  EXECUTE format('
    CREATE TABLE %I.orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id text NOT NULL DEFAULT %L,
      order_number text NOT NULL,
      table_id uuid,
      status order_status NOT NULL DEFAULT ''pending'',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      -- Additional columns...
      CONSTRAINT orders_restaurant_check CHECK (restaurant_id = %L)
    )', p_restaurant_schema, extract_restaurant_id(p_restaurant_schema), extract_restaurant_id(p_restaurant_schema));

  -- Create indexes
  EXECUTE format('CREATE INDEX idx_%I_orders_status ON %I.orders(status)',
                 p_restaurant_schema, p_restaurant_schema);

  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

## 🔗 CROSS-SCHEMA RELATIONSHIP MANAGEMENT

### Relationship Types and Strategies

#### 1. No Cross-Restaurant Relationships
**Principle**: Restaurant operational data never references other restaurants
**Implementation**: All foreign keys remain within restaurant-specific schemas
**Example**: Orders → OrderItems → MenuItems (all within same restaurant schema)

#### 2. Global Reference Data
**Principle**: Shared lookup tables and system configuration
**Implementation**: Restaurant schemas can reference global/shared schemas
**Example**: Restaurant-specific data → Global user roles, system settings

```sql
-- Allowed: Restaurant data referencing global data
ALTER TABLE rest_001_orders.orders
ADD CONSTRAINT fk_orders_created_by
FOREIGN KEY (created_by) REFERENCES auth_global.users(id);

-- NOT ALLOWED: Cross-restaurant references
-- This should never exist:
-- ALTER TABLE rest_001_orders.orders
-- ADD CONSTRAINT fk_orders_other_restaurant
-- FOREIGN KEY (some_id) REFERENCES rest_002_orders.orders(id);
```

#### 3. Analytics Aggregation
**Principle**: Analytics schema aggregates data from all restaurants
**Implementation**: ETL processes populate analytics tables with cross-restaurant views

```sql
-- Analytics schema aggregates data from all restaurants
CREATE MATERIALIZED VIEW analytics_global.daily_order_summary AS
SELECT
  date_trunc('day', created_at) as order_date,
  restaurant_id,
  count(*) as order_count,
  sum(total_amount) as total_revenue
FROM (
  SELECT created_at, restaurant_id, total_amount FROM rest_001_orders.orders
  UNION ALL
  SELECT created_at, restaurant_id, total_amount FROM rest_002_orders.orders
  UNION ALL
  SELECT created_at, restaurant_id, total_amount FROM rest_003_orders.orders
  -- ... additional restaurants
) all_orders
GROUP BY 1, 2;
```

### Cross-Schema Constraint Enforcement

#### 1. Application-Level Validation
```typescript
// Service layer enforces restaurant boundaries
class CrossSchemaValidator {
  static validateRestaurantAccess(
    currentRestaurant: string,
    targetSchema: string
  ): boolean {
    const allowedSchemas = [
      `rest_${currentRestaurant}_*`,  // Own restaurant schemas
      'auth_global',                  // Global authentication
      'system_core',                  // System configuration
      'analytics_global'              // Analytics (read-only)
    ];

    return allowedSchemas.some(pattern =>
      new RegExp(pattern.replace('*', '.*')).test(targetSchema)
    );
  }
}
```

#### 2. Database Function Validation
```sql
-- Function to validate cross-schema operations
CREATE OR REPLACE FUNCTION validate_cross_schema_access(
  p_source_schema text,
  p_target_schema text
) RETURNS boolean AS $$
BEGIN
  -- Allow access within same restaurant
  IF extract_restaurant_id(p_source_schema) = extract_restaurant_id(p_target_schema) THEN
    RETURN true;
  END IF;

  -- Allow access to global/shared schemas
  IF p_target_schema IN ('auth_global', 'system_core', 'analytics_global',
                        'notification_shared', 'integration_shared', 'print_shared') THEN
    RETURN true;
  END IF;

  -- Deny all other cross-restaurant access
  RETURN false;
END;
$$ LANGUAGE plpgsql;
```

## 🚀 PERFORMANCE OPTIMIZATION FOR MULTI-TENANCY

### Connection Management

#### 1. Schema-Aware Connection Pooling
```sql
-- Set default schema per connection based on restaurant context
-- This reduces the need for schema-qualified queries
ALTER ROLE restaurant_001_users SET search_path TO rest_001_orders, rest_001_menu, rest_001_payment, public;
ALTER ROLE restaurant_002_users SET search_path TO rest_002_orders, rest_002_menu, rest_002_payment, public;
```

#### 2. Connection Pool Configuration
```typescript
// PgBouncer configuration for multi-tenant pooling
interface ConnectionPoolConfig {
  maxConnections: number;
  poolMode: 'transaction' | 'session';
  defaultSchema: string;  // Set based on restaurant context
  searchPath: string[];   // Restaurant-specific schema search path
}

const createRestaurantPool = (restaurantId: string): ConnectionPoolConfig => ({
  maxConnections: 25,
  poolMode: 'transaction',
  defaultSchema: `rest_${restaurantId}_orders`,
  searchPath: [
    `rest_${restaurantId}_orders`,
    `rest_${restaurantId}_menu`,
    `rest_${restaurantId}_payment`,
    `rest_${restaurantId}_kitchen`,
    'auth_global',
    'public'
  ]
});
```

### Query Optimization

#### 1. Schema-Specific Indexing
```sql
-- Each restaurant schema has optimized indexes for its data volume
-- Example: Restaurant 001 (high volume) vs Restaurant 005 (low volume)

-- High-volume restaurant indexes
CREATE INDEX CONCURRENTLY idx_rest_001_orders_created_at_status
ON rest_001_orders.orders(created_at, status)
WHERE status IN ('pending', 'preparing');

-- Low-volume restaurant may not need the same indexes
-- Indexes are created based on actual usage patterns per restaurant
```

#### 2. Partitioning Strategy per Restaurant
```sql
-- Large restaurants may benefit from table partitioning
-- Small restaurants use simple tables

-- High-volume restaurant: Partitioned by month
CREATE TABLE rest_001_orders.orders_y2025m10
PARTITION OF rest_001_orders.orders
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Low-volume restaurant: Single table
-- No partitioning needed for rest_005_orders.orders
```

## 🔒 SECURITY AND COMPLIANCE

### Role-Based Access Control

#### 1. Restaurant-Specific Roles
```sql
-- Role hierarchy per restaurant
CREATE ROLE restaurant_001_superadmin;  -- Full restaurant access
CREATE ROLE restaurant_001_manager;     -- Management operations
CREATE ROLE restaurant_001_staff;       -- Operational access
CREATE ROLE restaurant_001_kitchen;     -- Kitchen-specific access
CREATE ROLE restaurant_001_readonly;    -- Read-only access for analytics

-- Grant appropriate schema access
GRANT ALL ON SCHEMA rest_001_orders TO restaurant_001_superadmin;
GRANT USAGE, SELECT, INSERT, UPDATE ON SCHEMA rest_001_orders TO restaurant_001_staff;
GRANT USAGE, SELECT ON SCHEMA rest_001_orders TO restaurant_001_readonly;
```

#### 2. Service-Specific Permissions
```sql
-- Kitchen staff only access kitchen and order schemas
GRANT USAGE ON SCHEMA rest_001_kitchen TO restaurant_001_kitchen;
GRANT USAGE ON SCHEMA rest_001_orders TO restaurant_001_kitchen;
REVOKE ALL ON SCHEMA rest_001_payment FROM restaurant_001_kitchen;
REVOKE ALL ON SCHEMA rest_001_staff FROM restaurant_001_kitchen;
```

### Audit and Compliance

#### 1. Multi-Tenant Audit Trail
```sql
-- Audit table tracks all cross-schema access attempts
CREATE TABLE audit_global.cross_schema_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_user text NOT NULL,
  source_schema text,
  target_schema text,
  operation text,
  timestamp timestamptz DEFAULT now(),
  allowed boolean,
  query_text text
);

-- Trigger function to log cross-schema access
CREATE OR REPLACE FUNCTION log_cross_schema_access()
RETURNS event_trigger AS $$
BEGIN
  -- Log any DDL or DML that crosses restaurant boundaries
  INSERT INTO audit_global.cross_schema_access (/* ... */);
END;
$$ LANGUAGE plpgsql;
```

#### 2. Compliance Validation
```sql
-- Regular compliance checks
CREATE OR REPLACE FUNCTION validate_multi_tenant_compliance()
RETURNS TABLE(check_name text, passed boolean, details text) AS $$
BEGIN
  -- Check 1: No cross-restaurant foreign keys
  -- Check 2: All restaurant data properly isolated
  -- Check 3: Audit trail completeness
  -- Check 4: Role and permission correctness
END;
$$ LANGUAGE plpgsql;
```

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation Setup
- [ ] Create global schemas (auth_global, system_core, analytics_global)
- [ ] Create shared service schemas (notification_shared, integration_shared, print_shared)
- [ ] Implement restaurant schema creation procedures
- [ ] Set up role-based access control framework
- [ ] Create cross-schema validation functions

### Phase 2: Restaurant Schema Implementation
- [ ] Create schemas for all 5 restaurants
- [ ] Implement service-specific table creation procedures
- [ ] Set up restaurant-specific roles and permissions
- [ ] Configure connection pooling with schema awareness
- [ ] Implement audit trail for multi-tenant operations

### Phase 3: Performance Optimization
- [ ] Create restaurant-specific indexes based on data volume
- [ ] Implement partitioning for high-volume restaurants
- [ ] Optimize connection pool configuration
- [ ] Set up schema-aware search paths
- [ ] Performance test cross-schema query patterns

### Phase 4: Security and Compliance
- [ ] Implement comprehensive access control policies
- [ ] Set up audit trail monitoring and alerting
- [ ] Create compliance validation procedures
- [ ] Implement security monitoring and anomaly detection
- [ ] Document security procedures and incident response

### Phase 5: Testing and Validation
- [ ] Comprehensive multi-tenant isolation testing
- [ ] Performance testing under load
- [ ] Security penetration testing
- [ ] Disaster recovery testing per restaurant
- [ ] Documentation and training completion

---

**Next Steps**: Begin implementation of Phase 1 foundation setup with global schema creation and restaurant schema procedures.

**Dependencies**:
- PostgreSQL 15+ environment with appropriate permissions
- Prisma CLI for schema management
- Connection pooling infrastructure (PgBouncer)
- Monitoring and alerting infrastructure