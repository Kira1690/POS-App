# Database Migration Strategy

**Project**: Multi-Restaurant POS Database Architecture
**Date**: September 28, 2025
**Status**: COMPREHENSIVE MIGRATION PLAN

## 🎯 MIGRATION OVERVIEW

### Migration Scope

**ULTRATHINK Analysis**: Migrating from current mock/development data structures to a production-ready, multi-tenant, 13-microservice database architecture requires a carefully orchestrated approach that minimizes downtime, ensures data integrity, and provides complete rollback capabilities.

#### Current State Assessment
- **Mock Data Implementation**: Currently using TypeScript mock services
- **Data Volume**: Minimal development data
- **Services**: Basic service stubs with temporary data storage
- **Architecture**: Single-service application with mock data providers

#### Target State
- **Production Database**: Multi-tenant PostgreSQL with 13 service schemas
- **Data Volume**: Production-ready with real restaurant data
- **Services**: Full microservice architecture with database isolation
- **Architecture**: Distributed system with proper data persistence

## 🏗️ MIGRATION PHASES

### Phase 1: Infrastructure Preparation (Week 1)

#### Database Infrastructure Setup
```sql
-- Create production PostgreSQL instance
-- AWS RDS PostgreSQL 15.x with Multi-AZ deployment

-- Global schemas for shared services
CREATE SCHEMA auth_global;
CREATE SCHEMA system_core;
CREATE SCHEMA analytics_global;

-- Shared service schemas
CREATE SCHEMA notification_shared;
CREATE SCHEMA integration_shared;
CREATE SCHEMA print_shared;

-- Restaurant-specific schemas (example for first restaurant)
CREATE SCHEMA rest_001_menu;
CREATE SCHEMA rest_001_orders;
CREATE SCHEMA rest_001_payment;
CREATE SCHEMA rest_001_kitchen;
CREATE SCHEMA rest_001_inventory;
CREATE SCHEMA rest_001_customer;
CREATE SCHEMA rest_001_staff;
CREATE SCHEMA rest_001_table;
```

#### Schema Creation Automation
```typescript
interface RestaurantSchemaConfig {
  restaurantId: string;
  restaurantName: string;
  services: string[];
}

class DatabaseMigrationService {
  async createRestaurantSchemas(config: RestaurantSchemaConfig): Promise<void> {
    const { restaurantId, services } = config;

    for (const service of services) {
      const schemaName = `rest_${restaurantId}_${service}`;

      try {
        // Create schema
        await this.executeSQL(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);

        // Create service-specific tables
        await this.createServiceTables(schemaName, service);

        // Create indexes
        await this.createServiceIndexes(schemaName, service);

        // Set up permissions
        await this.setupSchemaPermissions(schemaName, restaurantId);

        console.log(`✅ Created schema: ${schemaName}`);
      } catch (error) {
        console.error(`❌ Failed to create schema ${schemaName}:`, error);
        throw error;
      }
    }
  }

  private async createServiceTables(schemaName: string, service: string): Promise<void> {
    const tableDefinitions = this.getTableDefinitions(service);

    for (const tableDef of tableDefinitions) {
      const sql = this.generateCreateTableSQL(schemaName, tableDef);
      await this.executeSQL(sql);
    }
  }

  private getTableDefinitions(service: string): TableDefinition[] {
    switch (service) {
      case 'menu':
        return [
          { name: 'categories', definition: menuCategoryTableDef },
          { name: 'items', definition: menuItemTableDef },
          { name: 'item_modifiers', definition: menuModifierTableDef }
        ];
      case 'orders':
        return [
          { name: 'orders', definition: orderTableDef },
          { name: 'order_items', definition: orderItemTableDef },
          { name: 'order_events', definition: orderEventTableDef }
        ];
      // ... additional services
      default:
        return [];
    }
  }
}
```

#### Environment Configuration
```typescript
interface MigrationEnvironment {
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  backup: {
    s3Bucket: string;
    retentionDays: number;
  };
}

const environments: Record<string, MigrationEnvironment> = {
  development: {
    database: {
      host: 'localhost',
      port: 5432,
      database: 'pos_development',
      username: 'pos_dev',
      password: process.env.DEV_DB_PASSWORD || '',
      ssl: false
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    backup: {
      s3Bucket: 'pos-dev-backups',
      retentionDays: 7
    }
  },
  staging: {
    database: {
      host: 'pos-staging.cluster-xyz.us-east-1.rds.amazonaws.com',
      port: 5432,
      database: 'pos_staging',
      username: 'pos_staging',
      password: process.env.STAGING_DB_PASSWORD || '',
      ssl: true
    },
    redis: {
      host: 'pos-staging.cache.amazonaws.com',
      port: 6379,
      password: process.env.STAGING_REDIS_PASSWORD
    },
    backup: {
      s3Bucket: 'pos-staging-backups',
      retentionDays: 14
    }
  },
  production: {
    database: {
      host: 'pos-prod.cluster-xyz.us-east-1.rds.amazonaws.com',
      port: 5432,
      database: 'pos_production',
      username: 'pos_production',
      password: process.env.PROD_DB_PASSWORD || '',
      ssl: true
    },
    redis: {
      host: 'pos-prod.cache.amazonaws.com',
      port: 6379,
      password: process.env.PROD_REDIS_PASSWORD
    },
    backup: {
      s3Bucket: 'pos-production-backups',
      retentionDays: 30
    }
  }
};
```

### Phase 2: Data Mapping and Transformation (Week 2)

#### Mock Data Analysis
```typescript
class MockDataAnalyzer {
  async analyzeMockDataStructures(): Promise<DataMappingPlan> {
    const mockDataSources = [
      'src/constants/dummyData.ts',
      'src/services/auth/dummyAuthService.ts',
      'src/services/api/*/Mock*.ts'
    ];

    const mappingPlan: DataMappingPlan = {
      dataSources: [],
      transformations: [],
      validationRules: []
    };

    for (const source of mockDataSources) {
      const analysis = await this.analyzeDataSource(source);
      mappingPlan.dataSources.push(analysis);
    }

    return mappingPlan;
  }

  private async analyzeDataSource(filePath: string): Promise<DataSourceAnalysis> {
    const content = await fs.readFile(filePath, 'utf-8');

    return {
      filePath,
      entities: this.extractEntities(content),
      relationships: this.extractRelationships(content),
      dataVolume: this.estimateDataVolume(content),
      transformationComplexity: this.assessComplexity(content)
    };
  }
}
```

#### Data Transformation Rules
```typescript
interface DataTransformationRule {
  sourceEntity: string;
  targetTable: string;
  targetSchema: string;
  fieldMappings: FieldMapping[];
  validationRules: ValidationRule[];
  transformationFunction?: (data: any) => any;
}

const transformationRules: DataTransformationRule[] = [
  {
    sourceEntity: 'dummyUsers',
    targetTable: 'users',
    targetSchema: 'auth_global',
    fieldMappings: [
      { source: 'id', target: 'id', type: 'direct' },
      { source: 'email', target: 'email', type: 'direct' },
      { source: 'firstName', target: 'first_name', type: 'direct' },
      { source: 'lastName', target: 'last_name', type: 'direct' },
      { source: 'role', target: 'role', type: 'enum_mapping' },
      { source: 'restaurantId', target: 'default_restaurant_id', type: 'direct' }
    ],
    validationRules: [
      { field: 'email', rule: 'valid_email' },
      { field: 'role', rule: 'valid_enum_value' }
    ],
    transformationFunction: (data) => ({
      ...data,
      password_hash: bcrypt.hashSync('temp_password_123', 10),
      created_at: new Date().toISOString(),
      is_active: true,
      is_deleted: false
    })
  },
  {
    sourceEntity: 'dummyRestaurants',
    targetTable: 'restaurants',
    targetSchema: 'auth_global',
    fieldMappings: [
      { source: 'id', target: 'id', type: 'direct' },
      { source: 'name', target: 'name', type: 'direct' },
      { source: 'address', target: 'address', type: 'direct' },
      { source: 'phone', target: 'phone', type: 'direct' }
    ],
    validationRules: [
      { field: 'name', rule: 'required_string' },
      { field: 'id', rule: 'valid_restaurant_id_format' }
    ]
  }
  // ... additional transformation rules for menu items, tables, etc.
];
```

#### Data Validation Framework
```typescript
class DataValidator {
  async validateTransformation(
    sourceData: any[],
    transformationRule: DataTransformationRule
  ): Promise<ValidationResult> {
    const results: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      statistics: {
        totalRecords: sourceData.length,
        validRecords: 0,
        invalidRecords: 0
      }
    };

    for (const record of sourceData) {
      try {
        const transformedRecord = this.applyTransformation(record, transformationRule);
        const validationResult = await this.validateRecord(transformedRecord, transformationRule.validationRules);

        if (validationResult.isValid) {
          results.statistics.validRecords++;
        } else {
          results.statistics.invalidRecords++;
          results.errors.push({
            recordId: record.id,
            errors: validationResult.errors
          });
        }
      } catch (error) {
        results.errors.push({
          recordId: record.id,
          errors: [`Transformation failed: ${error.message}`]
        });
        results.statistics.invalidRecords++;
      }
    }

    results.isValid = results.statistics.invalidRecords === 0;
    return results;
  }

  private async validateRecord(record: any, rules: ValidationRule[]): Promise<RecordValidationResult> {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = record[rule.field];

      switch (rule.rule) {
        case 'valid_email':
          if (!this.isValidEmail(value)) {
            errors.push(`Invalid email format: ${value}`);
          }
          break;
        case 'required_string':
          if (!value || typeof value !== 'string' || value.trim().length === 0) {
            errors.push(`Required string field is empty: ${rule.field}`);
          }
          break;
        case 'valid_enum_value':
          if (!this.isValidEnumValue(value, rule.allowedValues)) {
            errors.push(`Invalid enum value: ${value} for field: ${rule.field}`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### Phase 3: Service Migration (Weeks 3-4)

#### Service-by-Service Migration Plan

#### Step 1: Authentication Service Migration
```typescript
class AuthServiceMigration {
  async migrateAuthenticationData(): Promise<void> {
    console.log('🔐 Starting Authentication Service Migration...');

    // 1. Migrate users
    await this.migrateUsers();

    // 2. Migrate restaurants
    await this.migrateRestaurants();

    // 3. Set up user-restaurant relationships
    await this.migrateUserRestaurantAccess();

    // 4. Validate authentication flows
    await this.validateAuthenticationFlows();

    console.log('✅ Authentication Service Migration Complete');
  }

  private async migrateUsers(): Promise<void> {
    const mockUsers = await this.loadMockUsers();
    const transformationRule = this.getTransformationRule('dummyUsers');

    for (const mockUser of mockUsers) {
      try {
        const transformedUser = this.applyTransformation(mockUser, transformationRule);
        await this.insertUser(transformedUser);
        console.log(`✓ Migrated user: ${transformedUser.email}`);
      } catch (error) {
        console.error(`✗ Failed to migrate user ${mockUser.email}:`, error);
        throw error;
      }
    }
  }

  private async validateAuthenticationFlows(): Promise<void> {
    // Test login flows for each user type
    const testUsers = [
      { email: 'manager@foodcorner.com', password: 'manager123' },
      { employeeId: 'EMP001', password: 'staff123' }
    ];

    for (const testUser of testUsers) {
      try {
        const loginResult = await this.authService.login(testUser);
        if (!loginResult.success) {
          throw new Error(`Login failed for ${testUser.email || testUser.employeeId}`);
        }
        console.log(`✓ Validated login for: ${testUser.email || testUser.employeeId}`);
      } catch (error) {
        console.error(`✗ Login validation failed:`, error);
        throw error;
      }
    }
  }
}
```

#### Step 2: Menu Service Migration
```typescript
class MenuServiceMigration {
  async migrateMenuData(): Promise<void> {
    console.log('🍽️ Starting Menu Service Migration...');

    const restaurants = await this.getRestaurants();

    for (const restaurant of restaurants) {
      await this.migrateRestaurantMenu(restaurant.id);
    }

    console.log('✅ Menu Service Migration Complete');
  }

  private async migrateRestaurantMenu(restaurantId: string): Promise<void> {
    const mockMenuData = await this.loadMockMenuData(restaurantId);

    // 1. Migrate categories
    const categoryMappings = await this.migrateMenuCategories(restaurantId, mockMenuData.categories);

    // 2. Migrate menu items
    await this.migrateMenuItems(restaurantId, mockMenuData.items, categoryMappings);

    // 3. Migrate modifiers
    await this.migrateMenuModifiers(restaurantId, mockMenuData.modifiers);

    console.log(`✓ Migrated menu for restaurant: ${restaurantId}`);
  }

  private async migrateMenuCategories(
    restaurantId: string,
    mockCategories: any[]
  ): Promise<Map<string, string>> {
    const categoryMappings = new Map<string, string>();

    for (const mockCategory of mockCategories) {
      const transformedCategory = {
        id: uuid(),
        restaurant_id: restaurantId,
        name: mockCategory.name,
        description: mockCategory.description,
        sort_order: mockCategory.sortOrder || 0,
        is_active: true,
        created_at: new Date().toISOString(),
        created_by: this.getSystemUserId(),
        updated_at: new Date().toISOString(),
        is_deleted: false
      };

      await this.insertMenuCategory(restaurantId, transformedCategory);
      categoryMappings.set(mockCategory.id, transformedCategory.id);
    }

    return categoryMappings;
  }
}
```

#### Step 3: Remaining Services Migration
```typescript
class ComprehensiveServiceMigration {
  async migrateAllServices(): Promise<void> {
    const migrationPlan = [
      { service: 'auth', priority: 1, dependencies: [] },
      { service: 'menu', priority: 2, dependencies: ['auth'] },
      { service: 'table', priority: 3, dependencies: ['auth'] },
      { service: 'order', priority: 4, dependencies: ['auth', 'menu', 'table'] },
      { service: 'payment', priority: 5, dependencies: ['auth', 'order'] },
      { service: 'kitchen', priority: 6, dependencies: ['auth', 'order', 'menu'] },
      { service: 'inventory', priority: 7, dependencies: ['auth'] },
      { service: 'customer', priority: 8, dependencies: ['auth'] },
      { service: 'staff', priority: 9, dependencies: ['auth'] },
      { service: 'analytics', priority: 10, dependencies: ['auth', 'order', 'payment'] },
      { service: 'notification', priority: 11, dependencies: ['auth'] },
      { service: 'integration', priority: 12, dependencies: ['auth'] },
      { service: 'print', priority: 13, dependencies: ['auth', 'order', 'payment'] }
    ];

    for (const { service, dependencies } of migrationPlan.sort((a, b) => a.priority - b.priority)) {
      console.log(`🔄 Starting migration for service: ${service}`);

      // Verify dependencies are completed
      await this.verifyDependencies(dependencies);

      // Execute service migration
      await this.migrateService(service);

      console.log(`✅ Completed migration for service: ${service}`);
    }
  }

  private async migrateService(serviceName: string): Promise<void> {
    const migrator = this.getMigrator(serviceName);
    await migrator.migrate();
  }

  private getMigrator(serviceName: string): ServiceMigrator {
    switch (serviceName) {
      case 'auth':
        return new AuthServiceMigration();
      case 'menu':
        return new MenuServiceMigration();
      case 'table':
        return new TableServiceMigration();
      case 'order':
        return new OrderServiceMigration();
      // ... additional service migrators
      default:
        throw new Error(`No migrator found for service: ${serviceName}`);
    }
  }
}
```

### Phase 4: Data Validation and Testing (Week 5)

#### Comprehensive Data Validation
```typescript
class PostMigrationValidation {
  async validateMigration(): Promise<ValidationReport> {
    const validationTasks = [
      this.validateDataIntegrity(),
      this.validateRelationalIntegrity(),
      this.validateBusinessRules(),
      this.validatePerformance(),
      this.validateSecurity()
    ];

    const results = await Promise.all(validationTasks);

    return {
      overall: results.every(r => r.success) ? 'PASS' : 'FAIL',
      details: results,
      timestamp: new Date().toISOString()
    };
  }

  private async validateDataIntegrity(): Promise<ValidationResult> {
    const checks = [
      this.validateRecordCounts(),
      this.validateRequiredFields(),
      this.validateDataTypes(),
      this.validateUniqueConstraints()
    ];

    const results = await Promise.all(checks);

    return {
      testName: 'Data Integrity',
      success: results.every(r => r.success),
      details: results
    };
  }

  private async validateRecordCounts(): Promise<ValidationCheck> {
    const expectedCounts = {
      'auth_global.users': 12,
      'auth_global.restaurants': 5,
      'rest_001_menu.categories': 5,
      'rest_001_menu.items': 25,
      'rest_001_table.tables': 20
    };

    const actualCounts: Record<string, number> = {};
    const errors: string[] = [];

    for (const [table, expectedCount] of Object.entries(expectedCounts)) {
      const [schema, tableName] = table.split('.');
      const result = await this.db.query(`SELECT COUNT(*) as count FROM ${schema}.${tableName}`);
      const actualCount = parseInt(result.rows[0].count);

      actualCounts[table] = actualCount;

      if (actualCount !== expectedCount) {
        errors.push(`${table}: expected ${expectedCount}, got ${actualCount}`);
      }
    }

    return {
      checkName: 'Record Counts',
      success: errors.length === 0,
      expectedCounts,
      actualCounts,
      errors
    };
  }

  private async validateBusinessRules(): Promise<ValidationResult> {
    const businessRuleChecks = [
      this.validateUserRestaurantAssignments(),
      this.validateMenuItemPricing(),
      this.validateTableCapacities(),
      this.validateOrderWorkflows()
    ];

    const results = await Promise.all(businessRuleChecks);

    return {
      testName: 'Business Rules',
      success: results.every(r => r.success),
      details: results
    };
  }
}
```

#### Performance Validation
```typescript
class PerformanceMigrationValidation {
  async validatePerformanceTargets(): Promise<PerformanceReport> {
    const performanceTests = [
      this.testAuthenticationPerformance(),
      this.testMenuLoadingPerformance(),
      this.testOrderProcessingPerformance(),
      this.testDatabaseQueryPerformance()
    ];

    const results = await Promise.all(performanceTests);

    return {
      summary: results.every(r => r.success) ? 'PASS' : 'FAIL',
      tests: results,
      recommendations: this.generatePerformanceRecommendations(results)
    };
  }

  private async testAuthenticationPerformance(): Promise<PerformanceTest> {
    const iterations = 100;
    const responseTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await this.authService.validateSession('test_token');
      const endTime = Date.now();
      responseTimes.push(endTime - startTime);
    }

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxResponseTime = Math.max(...responseTimes);
    const target = 50; // 50ms target

    return {
      testName: 'Authentication Performance',
      success: averageResponseTime < target,
      averageResponseTime,
      maxResponseTime,
      target,
      iterations
    };
  }
}
```

## 🛡️ ROLLBACK PROCEDURES

### Automated Rollback System
```typescript
class MigrationRollbackService {
  async createRollbackPlan(): Promise<RollbackPlan> {
    return {
      backupTimestamp: new Date().toISOString(),
      steps: [
        {
          step: 1,
          description: 'Stop application services',
          rollbackAction: 'restart_services',
          estimatedTime: '2 minutes'
        },
        {
          step: 2,
          description: 'Restore database from backup',
          rollbackAction: 'restore_database_backup',
          estimatedTime: '15 minutes'
        },
        {
          step: 3,
          description: 'Restore Redis cache',
          rollbackAction: 'clear_redis_cache',
          estimatedTime: '1 minute'
        },
        {
          step: 4,
          description: 'Restart with previous codebase',
          rollbackAction: 'deploy_previous_version',
          estimatedTime: '5 minutes'
        }
      ],
      totalEstimatedTime: '23 minutes'
    };
  }

  async executeRollback(rollbackPlan: RollbackPlan): Promise<void> {
    console.log('🔙 Starting rollback procedure...');

    for (const step of rollbackPlan.steps) {
      try {
        console.log(`Step ${step.step}: ${step.description}`);
        await this.executeRollbackStep(step);
        console.log(`✅ Completed step ${step.step}`);
      } catch (error) {
        console.error(`❌ Failed step ${step.step}:`, error);
        throw new Error(`Rollback failed at step ${step.step}: ${error.message}`);
      }
    }

    console.log('✅ Rollback completed successfully');
  }
}
```

---

**Next Steps**: Begin Phase 1 infrastructure setup and establish comprehensive backup procedures before any migration activities.

**Critical Success Factors**:
- Complete backup strategy before starting migration
- Comprehensive validation at each phase
- Automated rollback procedures tested and ready
- Staged migration with thorough testing at each step