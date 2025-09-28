# Database Caching Architecture

**Project**: Multi-Restaurant POS Database Architecture
**Date**: September 28, 2025
**Status**: COMPREHENSIVE STRATEGY

## 🎯 CACHING STRATEGY OVERVIEW

### Strategic Goals

**ULTRATHINK Analysis**: A multi-layered caching strategy for a high-volume, multi-tenant POS system must balance data consistency, performance optimization, memory efficiency, and real-time requirements across 13 microservices with sub-second response time requirements.

#### Performance Targets
- **Cache Hit Ratio**: >90% for frequently accessed data
- **Cache Response Time**: <5ms for Redis operations
- **Database Load Reduction**: 70% reduction in database queries
- **Real-time Consistency**: <100ms for cache invalidation
- **Memory Efficiency**: <2GB Redis memory per restaurant

#### Caching Layers
1. **Application-Level Caching**: In-memory caching within microservices
2. **Distributed Caching**: Redis cluster for cross-service data sharing
3. **Database Query Caching**: PostgreSQL query result caching
4. **CDN Caching**: Static asset and API response caching
5. **Browser Caching**: Client-side caching for UI optimization

## 🏗️ REDIS DISTRIBUTED CACHING ARCHITECTURE

### Redis Cluster Configuration

#### Multi-Tenant Cache Design
```redis
# Restaurant-specific cache namespaces
rest:001:menu:*        # The Food Corner menu data
rest:001:tables:*      # The Food Corner table status
rest:001:orders:*      # The Food Corner active orders
rest:001:staff:*       # The Food Corner staff data

rest:002:menu:*        # Pizza Palace menu data
rest:002:tables:*      # Pizza Palace table status
# ... etc for each restaurant
```

#### Global Shared Cache
```redis
# Cross-restaurant shared data
global:auth:sessions:*     # User session data
global:auth:users:*        # User profile cache
global:config:*            # System configuration
global:analytics:*         # Cross-restaurant analytics
```

### Cache Key Naming Convention

#### Hierarchical Structure
```
{service}:{restaurant_id}:{entity}:{id}:{version}
```

#### Examples
```redis
menu:rest_001:items:uuid123:v2          # Menu item with version
order:rest_001:active:uuid456            # Active order
auth:global:session:token_hash           # User session
table:rest_001:status:all               # All table statuses
payment:rest_001:processing:uuid789      # Payment in progress
```

## 📊 SERVICE-SPECIFIC CACHING STRATEGIES

### 1. Authentication Service Caching

#### User Session Caching (Critical Performance)
```typescript
interface SessionCache {
  key: string;        // 'auth:session:{token_hash}'
  ttl: number;        // 30 minutes
  data: {
    userId: string;
    restaurantId: string;
    role: string;
    permissions: string[];
    lastActivity: string;
  };
}

// Implementation
class AuthCacheService {
  async cacheUserSession(tokenHash: string, sessionData: SessionCache['data']): Promise<void> {
    const key = `auth:session:${tokenHash}`;
    await redis.setex(key, 1800, JSON.stringify(sessionData)); // 30 min TTL
  }

  async getUserSession(tokenHash: string): Promise<SessionCache['data'] | null> {
    const key = `auth:session:${tokenHash}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async extendSession(tokenHash: string): Promise<void> {
    const key = `auth:session:${tokenHash}`;
    await redis.expire(key, 1800); // Extend TTL to 30 minutes
  }
}
```

#### User Profile Caching
```typescript
interface UserProfileCache {
  key: string;        // 'auth:user:{user_id}'
  ttl: number;        // 4 hours
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
    restaurantAccess: string[];
    preferences: Record<string, any>;
  };
}

// Cache invalidation on profile updates
class UserProfileCache {
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `auth:user:${userId}`,
      `auth:user:${userId}:*`,
      `rest:*:staff:${userId}` // Invalidate staff data across restaurants
    ];

    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}
```

### 2. Menu Management Service Caching

#### Menu Data Caching (High Read Volume)
```typescript
interface MenuCache {
  categories: {
    key: string;      // 'menu:rest_001:categories'
    ttl: number;      // 2 hours
    data: MenuCategory[];
  };
  items: {
    key: string;      // 'menu:rest_001:items:category_{id}'
    ttl: number;      // 1 hour
    data: MenuItem[];
  };
  availability: {
    key: string;      // 'menu:rest_001:availability'
    ttl: number;      // 5 minutes
    data: Record<string, boolean>;
  };
}

class MenuCacheService {
  async cacheMenuCategories(restaurantId: string, categories: MenuCategory[]): Promise<void> {
    const key = `menu:${restaurantId}:categories`;
    await redis.setex(key, 7200, JSON.stringify(categories)); // 2 hours
  }

  async cacheMenuItems(restaurantId: string, categoryId: string, items: MenuItem[]): Promise<void> {
    const key = `menu:${restaurantId}:items:category_${categoryId}`;
    await redis.setex(key, 3600, JSON.stringify(items)); // 1 hour
  }

  async updateItemAvailability(restaurantId: string, itemId: string, isAvailable: boolean): Promise<void> {
    const key = `menu:${restaurantId}:availability`;
    await redis.hset(key, itemId, isAvailable.toString());
    await redis.expire(key, 300); // 5 minutes TTL
  }

  // Cache invalidation on menu changes
  async invalidateMenuCache(restaurantId: string, categoryId?: string): Promise<void> {
    const patterns = [
      `menu:${restaurantId}:categories`,
      `menu:${restaurantId}:availability`,
      categoryId ? `menu:${restaurantId}:items:category_${categoryId}` : `menu:${restaurantId}:items:*`
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) await redis.del(...keys);
      } else {
        await redis.del(pattern);
      }
    }
  }
}
```

### 3. Order Processing Service Caching

#### Active Orders Caching (Real-Time Operations)
```typescript
interface OrderCache {
  activeOrders: {
    key: string;      // 'order:rest_001:active'
    ttl: number;      // 10 minutes
    data: Order[];
  };
  orderStatus: {
    key: string;      // 'order:rest_001:status:{order_id}'
    ttl: number;      // 5 minutes
    data: OrderStatus;
  };
  kitchenQueue: {
    key: string;      // 'order:rest_001:kitchen:queue'
    ttl: number;      // 2 minutes
    data: KitchenOrder[];
  };
}

class OrderCacheService {
  async cacheActiveOrders(restaurantId: string, orders: Order[]): Promise<void> {
    const key = `order:${restaurantId}:active`;
    await redis.setex(key, 600, JSON.stringify(orders)); // 10 minutes
  }

  async updateOrderStatus(restaurantId: string, orderId: string, status: OrderStatus): Promise<void> {
    const key = `order:${restaurantId}:status:${orderId}`;
    await redis.setex(key, 300, JSON.stringify(status)); // 5 minutes

    // Update active orders cache
    await this.invalidateActiveOrdersCache(restaurantId);
  }

  async cacheKitchenQueue(restaurantId: string, kitchenOrders: KitchenOrder[]): Promise<void> {
    const key = `order:${restaurantId}:kitchen:queue`;
    await redis.setex(key, 120, JSON.stringify(kitchenOrders)); // 2 minutes
  }

  // Real-time cache invalidation
  async invalidateOrderCache(restaurantId: string, orderId: string): Promise<void> {
    const patterns = [
      `order:${restaurantId}:active`,
      `order:${restaurantId}:status:${orderId}`,
      `order:${restaurantId}:kitchen:queue`,
      `table:${restaurantId}:status:*` // Table status may be affected
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) await redis.del(...keys);
      } else {
        await redis.del(pattern);
      }
    }
  }
}
```

### 4. Table Management Service Caching

#### Real-Time Table Status Caching
```typescript
interface TableCache {
  allTables: {
    key: string;      // 'table:rest_001:all'
    ttl: number;      // 30 minutes
    data: Table[];
  };
  tableStatus: {
    key: string;      // 'table:rest_001:status'
    ttl: number;      // 1 minute
    data: Record<string, TableStatus>;
  };
  availability: {
    key: string;      // 'table:rest_001:available'
    ttl: number;      // 30 seconds
    data: Table[];
  };
}

class TableCacheService {
  async cacheAllTables(restaurantId: string, tables: Table[]): Promise<void> {
    const key = `table:${restaurantId}:all`;
    await redis.setex(key, 1800, JSON.stringify(tables)); // 30 minutes
  }

  async updateTableStatus(restaurantId: string, tableId: string, status: TableStatus): Promise<void> {
    const statusKey = `table:${restaurantId}:status`;
    await redis.hset(statusKey, tableId, JSON.stringify(status));
    await redis.expire(statusKey, 60); // 1 minute TTL

    // Invalidate availability cache as it depends on status
    await redis.del(`table:${restaurantId}:available`);
  }

  async getAvailableTables(restaurantId: string): Promise<Table[]> {
    const key = `table:${restaurantId}:available`;
    const cached = await redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - need to calculate from database
    return null;
  }

  async cacheAvailableTables(restaurantId: string, availableTables: Table[]): Promise<void> {
    const key = `table:${restaurantId}:available`;
    await redis.setex(key, 30, JSON.stringify(availableTables)); // 30 seconds
  }
}
```

### 5. Payment Processing Service Caching

#### Payment Processing Cache
```typescript
interface PaymentCache {
  processingPayments: {
    key: string;      // 'payment:rest_001:processing'
    ttl: number;      // 5 minutes
    data: Record<string, PaymentStatus>;
  };
  deviceStatus: {
    key: string;      // 'payment:rest_001:devices'
    ttl: number;      // 2 minutes
    data: Record<string, DeviceStatus>;
  };
  dailyTotals: {
    key: string;      // 'payment:rest_001:daily:{date}'
    ttl: number;      // 24 hours
    data: DailyPaymentSummary;
  };
}

class PaymentCacheService {
  async cachePaymentProcessing(restaurantId: string, paymentId: string, status: PaymentStatus): Promise<void> {
    const key = `payment:${restaurantId}:processing`;
    await redis.hset(key, paymentId, JSON.stringify(status));
    await redis.expire(key, 300); // 5 minutes
  }

  async removeProcessingPayment(restaurantId: string, paymentId: string): Promise<void> {
    const key = `payment:${restaurantId}:processing`;
    await redis.hdel(key, paymentId);
  }

  async cacheDeviceStatus(restaurantId: string, deviceId: string, status: DeviceStatus): Promise<void> {
    const key = `payment:${restaurantId}:devices`;
    await redis.hset(key, deviceId, JSON.stringify(status));
    await redis.expire(key, 120); // 2 minutes
  }

  async cacheDailyTotals(restaurantId: string, date: string, totals: DailyPaymentSummary): Promise<void> {
    const key = `payment:${restaurantId}:daily:${date}`;
    await redis.setex(key, 86400, JSON.stringify(totals)); // 24 hours
  }
}
```

## 🔄 CACHE INVALIDATION STRATEGIES

### Event-Driven Invalidation

#### Cache Invalidation Events
```typescript
interface CacheInvalidationEvent {
  eventType: 'CREATE' | 'UPDATE' | 'DELETE';
  service: string;
  entityType: string;
  entityId: string;
  restaurantId: string;
  affectedCaches: string[];
}

class CacheInvalidationService {
  async handleEntityChange(event: CacheInvalidationEvent): Promise<void> {
    const { service, entityType, entityId, restaurantId, affectedCaches } = event;

    // Service-specific invalidation logic
    switch (service) {
      case 'menu':
        await this.invalidateMenuCaches(restaurantId, entityType, entityId);
        break;
      case 'order':
        await this.invalidateOrderCaches(restaurantId, entityType, entityId);
        break;
      case 'table':
        await this.invalidateTableCaches(restaurantId, entityType, entityId);
        break;
      case 'payment':
        await this.invalidatePaymentCaches(restaurantId, entityType, entityId);
        break;
    }

    // Invalidate explicitly specified caches
    for (const cachePattern of affectedCaches) {
      await this.invalidateCachePattern(cachePattern);
    }
  }

  private async invalidateMenuCaches(restaurantId: string, entityType: string, entityId: string): Promise<void> {
    if (entityType === 'category') {
      // Invalidate category and related item caches
      const patterns = [
        `menu:${restaurantId}:categories`,
        `menu:${restaurantId}:items:category_${entityId}`
      ];
      await this.invalidatePatterns(patterns);
    } else if (entityType === 'item') {
      // Invalidate item availability and category caches
      const patterns = [
        `menu:${restaurantId}:availability`,
        `menu:${restaurantId}:items:*`
      ];
      await this.invalidatePatterns(patterns);
    }
  }

  private async invalidateOrderCaches(restaurantId: string, entityType: string, entityId: string): Promise<void> {
    // Order changes affect multiple caches
    const patterns = [
      `order:${restaurantId}:active`,
      `order:${restaurantId}:status:${entityId}`,
      `order:${restaurantId}:kitchen:queue`,
      `table:${restaurantId}:status:*`, // Table status may change
      `payment:${restaurantId}:processing` // Payment status may change
    ];
    await this.invalidatePatterns(patterns);
  }
}
```

### Time-Based Invalidation

#### Scheduled Cache Refresh
```typescript
class ScheduledCacheRefresh {
  async scheduleRefreshJobs(): Promise<void> {
    // Menu data refresh every hour
    setInterval(async () => {
      await this.refreshMenuCaches();
    }, 3600000); // 1 hour

    // Table status refresh every 30 seconds
    setInterval(async () => {
      await this.refreshTableStatusCaches();
    }, 30000); // 30 seconds

    // Daily analytics refresh every 6 hours
    setInterval(async () => {
      await this.refreshAnalyticsCaches();
    }, 21600000); // 6 hours
  }

  private async refreshMenuCaches(): Promise<void> {
    const restaurants = await this.getActiveRestaurants();

    for (const restaurant of restaurants) {
      try {
        const categories = await menuService.getCategories(restaurant.id);
        await menuCacheService.cacheMenuCategories(restaurant.id, categories);

        for (const category of categories) {
          const items = await menuService.getItemsByCategory(restaurant.id, category.id);
          await menuCacheService.cacheMenuItems(restaurant.id, category.id, items);
        }
      } catch (error) {
        console.error(`Failed to refresh menu cache for ${restaurant.id}:`, error);
      }
    }
  }
}
```

## 🔧 APPLICATION-LEVEL CACHING

### In-Memory Caching for Microservices

#### Service-Level Cache Implementation
```typescript
class ServiceLevelCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private maxSize = 1000;
  private defaultTTL = 300000; // 5 minutes

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Usage in microservices
class MenuService {
  private cache = new ServiceLevelCache();

  async getMenuItem(restaurantId: string, itemId: string): Promise<MenuItem> {
    const cacheKey = `menu:${restaurantId}:item:${itemId}`;

    // Check application cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check Redis cache
    const redisCached = await redis.get(cacheKey);
    if (redisCached) {
      const item = JSON.parse(redisCached);
      this.cache.set(cacheKey, item, 300000); // 5 minutes
      return item;
    }

    // Fetch from database
    const item = await this.database.getMenuItem(restaurantId, itemId);

    // Cache in both layers
    await redis.setex(cacheKey, 1800, JSON.stringify(item)); // 30 minutes in Redis
    this.cache.set(cacheKey, item, 300000); // 5 minutes in memory

    return item;
  }
}
```

## 📊 CACHE PERFORMANCE MONITORING

### Redis Performance Metrics

#### Key Performance Indicators
```typescript
class CacheMonitoringService {
  async getCacheMetrics(): Promise<CacheMetrics> {
    const info = await redis.info();

    return {
      hitRatio: this.calculateHitRatio(info),
      memoryUsage: this.getMemoryUsage(info),
      connectionsCount: this.getConnectionsCount(info),
      operationsPerSecond: this.getOperationsPerSecond(info),
      averageResponseTime: await this.measureResponseTime(),
      keyCount: await redis.dbsize(),
      expiredKeys: this.getExpiredKeys(info)
    };
  }

  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    await redis.ping();
    return Date.now() - start;
  }

  async analyzeKeyDistribution(): Promise<KeyDistribution> {
    const keys = await redis.keys('*');
    const distribution: Record<string, number> = {};

    for (const key of keys) {
      const service = key.split(':')[0];
      distribution[service] = (distribution[service] || 0) + 1;
    }

    return distribution;
  }

  async identifyHotKeys(): Promise<string[]> {
    // Monitor key access patterns
    const hotKeys: string[] = [];

    // Implementation would use Redis's MONITOR command or
    // custom tracking to identify frequently accessed keys

    return hotKeys;
  }
}
```

### Cache Health Monitoring

#### Automated Cache Health Checks
```typescript
class CacheHealthService {
  async performHealthCheck(): Promise<CacheHealthReport> {
    const checks = await Promise.all([
      this.checkRedisConnectivity(),
      this.checkCacheHitRatio(),
      this.checkMemoryUsage(),
      this.checkKeyExpiration(),
      this.checkReplicationLag()
    ]);

    return {
      overall: checks.every(check => check.status === 'healthy') ? 'healthy' : 'degraded',
      checks
    };
  }

  private async checkCacheHitRatio(): Promise<HealthCheck> {
    const metrics = await this.getCacheMetrics();
    const threshold = 0.8; // 80% hit ratio threshold

    return {
      name: 'cache_hit_ratio',
      status: metrics.hitRatio >= threshold ? 'healthy' : 'warning',
      value: metrics.hitRatio,
      threshold,
      message: `Cache hit ratio: ${(metrics.hitRatio * 100).toFixed(2)}%`
    };
  }

  private async checkMemoryUsage(): Promise<HealthCheck> {
    const info = await redis.info('memory');
    const usedMemory = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0');
    const maxMemory = parseInt(info.match(/maxmemory:(\d+)/)?.[1] || '0');

    const usageRatio = maxMemory > 0 ? usedMemory / maxMemory : 0;
    const threshold = 0.9; // 90% memory usage threshold

    return {
      name: 'memory_usage',
      status: usageRatio < threshold ? 'healthy' : 'critical',
      value: usageRatio,
      threshold,
      message: `Memory usage: ${(usageRatio * 100).toFixed(2)}%`
    };
  }
}
```

## 🎯 PERFORMANCE OPTIMIZATION STRATEGIES

### Cache Warming Strategies

#### Predictive Cache Warming
```typescript
class CacheWarmingService {
  async warmCriticalCaches(): Promise<void> {
    const restaurants = await this.getActiveRestaurants();

    // Warm menu caches before peak hours
    await this.warmMenuCaches(restaurants);

    // Warm table status caches
    await this.warmTableStatusCaches(restaurants);

    // Warm user session caches for active staff
    await this.warmUserSessionCaches(restaurants);
  }

  private async warmMenuCaches(restaurants: Restaurant[]): Promise<void> {
    for (const restaurant of restaurants) {
      try {
        // Pre-load menu categories
        const categories = await menuService.getCategories(restaurant.id);
        await menuCacheService.cacheMenuCategories(restaurant.id, categories);

        // Pre-load popular menu items
        const popularItems = await menuService.getPopularItems(restaurant.id);
        for (const item of popularItems) {
          await menuCacheService.cacheMenuItem(restaurant.id, item);
        }
      } catch (error) {
        console.error(`Failed to warm menu cache for ${restaurant.id}:`, error);
      }
    }
  }

  async schedulePreHoursWarming(): Promise<void> {
    // Schedule cache warming 30 minutes before restaurant opening
    const restaurants = await this.getActiveRestaurants();

    for (const restaurant of restaurants) {
      const openingTime = restaurant.operatingHours.open;
      const warmingTime = this.subtractMinutes(openingTime, 30);

      this.scheduleAt(warmingTime, async () => {
        await this.warmRestaurantCaches(restaurant.id);
      });
    }
  }
}
```

### Memory Optimization

#### Cache Size Optimization
```typescript
class CacheOptimizationService {
  async optimizeCacheSize(): Promise<void> {
    // Analyze memory usage by key pattern
    const keyPatterns = await this.analyzeKeyPatterns();

    // Identify memory-hungry keys
    const largeKeys = await this.identifyLargeKeys();

    // Optimize data structures
    await this.optimizeDataStructures(largeKeys);

    // Implement compression for large values
    await this.implementCompression(keyPatterns);
  }

  private async identifyLargeKeys(): Promise<string[]> {
    const keys = await redis.keys('*');
    const largeKeys: string[] = [];

    for (const key of keys) {
      const memory = await redis.memory('usage', key);
      if (memory > 1024 * 1024) { // 1MB threshold
        largeKeys.push(key);
      }
    }

    return largeKeys;
  }

  private async optimizeDataStructures(keys: string[]): Promise<void> {
    for (const key of keys) {
      const type = await redis.type(key);

      if (type === 'string') {
        // Consider using hashes for structured data
        await this.convertToHash(key);
      } else if (type === 'list') {
        // Consider using streams for append-only data
        await this.convertToStream(key);
      }
    }
  }
}
```

---

**Next Steps**: Implement Redis cluster setup and begin with authentication service caching as the foundation for all other caching layers.

**Dependencies**:
- Redis cluster with at least 3 nodes for high availability
- Redis Modules: RedisJSON for complex data structures
- Application-level cache libraries for each microservice
- Monitoring tools for cache performance analysis