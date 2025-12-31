# Order Management - Kitchen Integration

## Overview

This document details how the Order Management system integrates with Kitchen Management, including ticket routing, station configuration, status updates, and real-time synchronization.

---

## Kitchen Station Architecture

### Station Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         KITCHEN STATION LAYOUT                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐        │
│   │    HOT KITCHEN    │   │   COLD KITCHEN    │   │      GRILL        │        │
│   │   ─────────────   │   │   ─────────────   │   │   ─────────────   │        │
│   │                   │   │                   │   │                   │        │
│   │   • Soups         │   │   • Salads        │   │   • Steaks        │        │
│   │   • Pasta         │   │   • Cold Apps     │   │   • Burgers       │        │
│   │   • Fried Items   │   │   • Sandwiches    │   │   • Grilled Items │        │
│   │   • Curries       │   │   • Sushi         │   │   • BBQ           │        │
│   │   • Rice Dishes   │   │   • Ceviche       │   │   • Kebabs        │        │
│   │                   │   │                   │   │                   │        │
│   └───────────────────┘   └───────────────────┘   └───────────────────┘        │
│                                                                                  │
│   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐        │
│   │     DESSERTS      │   │    BEVERAGES      │   │       BAR         │        │
│   │   ─────────────   │   │   ─────────────   │   │   ─────────────   │        │
│   │                   │   │                   │   │                   │        │
│   │   • Cakes         │   │   • Soft Drinks   │   │   • Cocktails     │        │
│   │   • Ice Cream     │   │   • Coffee        │   │   • Beer          │        │
│   │   • Pastries      │   │   • Tea           │   │   • Wine          │        │
│   │   • Puddings      │   │   • Juices        │   │   • Spirits       │        │
│   │   • Fruit Plates  │   │   • Smoothies     │   │   • Mocktails     │        │
│   │                   │   │                   │   │                   │        │
│   └───────────────────┘   └───────────────────┘   └───────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Station Configuration

```typescript
// src/config/kitchenStations.ts

interface StationConfig {
  id: KitchenStation;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  categories: string[];               // Category IDs mapped to this station
  defaultPrepTime: number;            // Default prep time in minutes
  priority: number;                   // Display order
  isActive: boolean;
}

const STATION_CONFIG: StationConfig[] = [
  {
    id: 'hot_kitchen',
    name: 'Hot Kitchen',
    shortName: 'HOT',
    icon: 'fire',
    color: '#FF5722',
    categories: ['soups', 'pasta', 'curries', 'rice', 'fried'],
    defaultPrepTime: 15,
    priority: 1,
    isActive: true,
  },
  {
    id: 'cold_kitchen',
    name: 'Cold Kitchen',
    shortName: 'COLD',
    icon: 'snowflake',
    color: '#2196F3',
    categories: ['salads', 'cold_appetizers', 'sandwiches', 'sushi'],
    defaultPrepTime: 10,
    priority: 2,
    isActive: true,
  },
  {
    id: 'grill',
    name: 'Grill Station',
    shortName: 'GRILL',
    icon: 'grill',
    color: '#795548',
    categories: ['grilled', 'steaks', 'burgers', 'bbq', 'kebabs'],
    defaultPrepTime: 18,
    priority: 3,
    isActive: true,
  },
  {
    id: 'desserts',
    name: 'Desserts',
    shortName: 'DESSERT',
    icon: 'cake',
    color: '#E91E63',
    categories: ['desserts', 'cakes', 'ice_cream', 'pastries'],
    defaultPrepTime: 8,
    priority: 5,
    isActive: true,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    shortName: 'BEV',
    icon: 'glass-water',
    color: '#00BCD4',
    categories: ['beverages', 'soft_drinks', 'coffee', 'tea', 'juices'],
    defaultPrepTime: 3,
    priority: 4,
    isActive: true,
  },
  {
    id: 'bar',
    name: 'Bar',
    shortName: 'BAR',
    icon: 'glass-cocktail',
    color: '#9C27B0',
    categories: ['cocktails', 'beer', 'wine', 'spirits', 'mocktails'],
    defaultPrepTime: 5,
    priority: 6,
    isActive: true,
  },
];
```

---

## Ticket Routing Engine

### Category to Station Mapping

```typescript
// src/services/kitchen/TicketRoutingService.ts

interface CategoryStationMapping {
  categoryId: string;
  categoryName: string;
  station: KitchenStation;
  overrideStation?: KitchenStation;  // For special cases
}

class TicketRoutingService {
  private categoryMappings: Map<string, KitchenStation>;

  constructor() {
    this.loadMappings();
  }

  /**
   * Determine which station an item should go to
   */
  getStationForItem(item: OrderItem): KitchenStation {
    // 1. Check for explicit category mapping
    const categoryStation = this.categoryMappings.get(item.categoryId);
    if (categoryStation) {
      return categoryStation;
    }

    // 2. Check for tag-based routing
    if (item.dietaryTags.includes('grilled')) {
      return 'grill';
    }

    // 3. Check for item name patterns
    if (this.isDesertItem(item.name)) {
      return 'desserts';
    }

    if (this.isBeverageItem(item.name)) {
      return 'beverages';
    }

    // 4. Default to hot kitchen
    return 'hot_kitchen';
  }

  /**
   * Generate kitchen tickets from order items
   */
  generateTickets(order: Order): KitchenTicket[] {
    // Group items by station
    const itemsByStation = new Map<KitchenStation, OrderItem[]>();

    for (const item of order.items) {
      const station = this.getStationForItem(item);
      const items = itemsByStation.get(station) || [];
      items.push(item);
      itemsByStation.set(station, items);
    }

    // Create ticket for each station
    const tickets: KitchenTicket[] = [];

    for (const [station, items] of itemsByStation) {
      const ticket = this.createTicket(order, station, items);
      tickets.push(ticket);
    }

    return tickets;
  }

  private createTicket(
    order: Order,
    station: KitchenStation,
    items: OrderItem[]
  ): KitchenTicket {
    const stationConfig = this.getStationConfig(station);

    // Calculate estimated prep time (max of all items)
    const estimatedPrepTime = Math.max(
      ...items.map(item => item.estimatedPrepTime || stationConfig.defaultPrepTime)
    );

    // Determine priority
    const priority = this.calculatePriority(order, items);

    // Check for allergens
    const allergenItems = items.filter(item => item.hasAllergenWarning);
    const hasAllergens = allergenItems.length > 0;

    return {
      id: generateId('TKT'),
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableName: order.tableName,
      station,
      items: items.map(item => this.toTicketItem(item)),
      itemCount: items.length,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
      estimatedPrepTime,
      hasAllergens,
      allergenItems: allergenItems.map(item => item.name),
      isRush: order.specialInstructions?.toLowerCase().includes('rush') || false,
      isOverdue: false,
      specialInstructions: order.specialInstructions,
    };
  }

  private calculatePriority(order: Order, items: OrderItem[]): TicketPriority {
    // Rush order
    if (order.specialInstructions?.toLowerCase().includes('rush')) {
      return 'urgent';
    }

    // VIP table (could be configured per table)
    if (order.tableName.toLowerCase().includes('vip')) {
      return 'high';
    }

    // Long wait time
    const waitTimeMinutes = this.getWaitTime(order.createdAt);
    if (waitTimeMinutes > 20) {
      return 'urgent';
    }
    if (waitTimeMinutes > 10) {
      return 'high';
    }

    // Perishable items (seafood, raw items)
    const hasPerishable = items.some(item =>
      item.category.toLowerCase().includes('seafood') ||
      item.category.toLowerCase().includes('sushi')
    );
    if (hasPerishable) {
      return 'high';
    }

    return 'normal';
  }

  private toTicketItem(item: OrderItem): KitchenTicketItem {
    // Format modifiers for display
    const modifiers: string[] = [];

    for (const modifier of item.selectedModifiers) {
      for (const option of modifier.options) {
        if (option.priceAdjustment > 0) {
          modifiers.push(`+ ${option.optionName}`);
        } else if (option.priceAdjustment < 0) {
          modifiers.push(`- ${option.optionName}`);
        } else if (option.optionName.toLowerCase().startsWith('no ')) {
          modifiers.push(option.optionName);
        } else {
          modifiers.push(`${option.optionName}`);
        }
      }
    }

    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      modifiers,
      status: 'pending',
      allergens: item.allergens,
      hasAllergenWarning: item.hasAllergenWarning,
      specialInstructions: item.specialInstructions,
    };
  }
}
```

---

## Kitchen Display System

### Multi-Station View

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  KITCHEN DISPLAY                                                    12:35 PM    [Refresh] [Settings]   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │  STATION TABS                                                                                       ││
│  │                                                                                                     ││
│  │  ┌───────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐          ││
│  │  │  ALL  │ │HOT KITCHEN│ │  GRILL   │ │  COLD    │ │ DESSERTS │ │BEVERAGES │ │   BAR   │          ││
│  │  │  (8)  │ │    (3)    │ │   (2)    │ │   (1)    │ │   (1)    │ │   (1)    │ │   (0)   │          ││
│  │  │  ●    │ │           │ │          │ │          │ │          │ │          │ │         │          ││
│  │  └───────┘ └───────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘          ││
│  │                                                                                                     ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │  STATS BAR                                                                                          ││
│  │                                                                                                     ││
│  │  Pending: 3  │  Preparing: 4  │  Ready: 1  │  Avg Prep: 12 min  │  Overdue: 0                      ││
│  │                                                                                                     ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                                          │
│  KANBAN VIEW                                                                                             │
│  ┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐ │
│  │ PENDING                    3  │ │ PREPARING                   4  │ │ READY                       1  │ │
│  │ ═══════════════════════════════│ │ ═══════════════════════════════│ │ ═══════════════════════════════│ │
│  │                               │ │                               │ │                               │ │
│  │ ┌───────────────────────────┐ │ │ ┌───────────────────────────┐ │ │ ┌───────────────────────────┐ │ │
│  │ │ ⚡ URGENT   HOT KITCHEN   │ │ │ │ ▓▓▓▓▓░░░░░ 50%  GRILL    │ │ │ │ ✓ READY      BEVERAGES   │ │ │
│  │ │ ─────────────────────────│ │ │ │ ─────────────────────────│ │ │ │ ─────────────────────────│ │ │
│  │ │ #001234  T1  Main Dining │ │ │ │ #001232  T5  VIP Lounge  │ │ │ │ #001230  T3  Patio       │ │ │
│  │ │ ─────────────────────────│ │ │ │ ─────────────────────────│ │ │ │ ─────────────────────────│ │ │
│  │ │ 1x Classic Burger        │ │ │ │ 2x Ribeye Steak          │ │ │ │ 3x Coca Cola             │ │ │
│  │ │   + Bacon, Jalapeño      │ │ │ │   Medium Rare            │ │ │ │ 1x Orange Juice          │ │ │
│  │ │   "Well done"            │ │ │ │ 1x Grilled Salmon        │ │ │ │                           │ │ │
│  │ │ 1x Grilled Chicken       │ │ │ │                           │ │ │ │ ─────────────────────────│ │ │
│  │ │   ⚠️ NUTS                │ │ │ │ ─────────────────────────│ │ │ │ Ready: 2 min ago          │ │ │
│  │ │ ─────────────────────────│ │ │ │ Est: 8 min remaining      │ │ │ │                           │ │ │
│  │ │ ⏱️ 4:30 waiting          │ │ │ │ ─────────────────────────│ │ │ │ [Mark Served]             │ │ │
│  │ │ ─────────────────────────│ │ │ │ [Item Ready] [All Ready] │ │ │ └───────────────────────────┘ │ │
│  │ │ [START]        [DELAY]   │ │ │ └───────────────────────────┘ │ │                               │ │
│  │ └───────────────────────────┘ │ │                               │ │                               │ │
│  │                               │ │ ┌───────────────────────────┐ │ │                               │ │
│  │ ┌───────────────────────────┐ │ │ │ ▓▓▓▓▓▓▓▓░░ 80%  HOT      │ │ │                               │ │
│  │ │ 🔴 HIGH     COLD KITCHEN  │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ #001233  T7  Main Dining │ │ │                               │ │
│  │ │ #001235  T2  Main Dining │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ 1x Pasta Alfredo         │ │ │                               │ │
│  │ │ 1x Caesar Salad          │ │ │ │ 1x Mushroom Risotto      │ │ │                               │ │
│  │ │   + Extra Dressing       │ │ │ │                           │ │ │                               │ │
│  │ │   - No Croutons          │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ Est: 2 min remaining      │ │ │                               │ │
│  │ │ ⏱️ 2:15 waiting          │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ [Item Ready] [All Ready] │ │ │                               │ │
│  │ │ [START]        [DELAY]   │ │ │ └───────────────────────────┘ │ │                               │ │
│  │ └───────────────────────────┘ │ │                               │ │                               │ │
│  │                               │ │ ┌───────────────────────────┐ │ │                               │ │
│  │ ┌───────────────────────────┐ │ │ │ ▓▓▓░░░░░░░ 30%  DESSERT  │ │ │                               │ │
│  │ │ 🟢 NORMAL     DESSERTS    │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ #001236  T10 Bar Seating │ │ │                               │ │
│  │ │ #001237  T8  Patio       │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ 1x Chocolate Lava Cake   │ │ │                               │ │
│  │ │ 2x Tiramisu              │ │ │ │                           │ │ │                               │ │
│  │ │ 1x Ice Cream Sundae      │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ Est: 5 min remaining      │ │ │                               │ │
│  │ │ ⏱️ 0:45 waiting          │ │ │ │ ─────────────────────────│ │ │                               │ │
│  │ │ ─────────────────────────│ │ │ │ [Mark Ready]              │ │ │                               │ │
│  │ │ [START]        [DELAY]   │ │ │ └───────────────────────────┘ │ │                               │ │
│  │ └───────────────────────────┘ │ │                               │ │                               │ │
│  │                               │ │                               │ │                               │ │
│  └───────────────────────────────┘ └───────────────────────────────┘ └───────────────────────────────┘ │
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Ticket Card States

```
PENDING STATE:                          PREPARING STATE:
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│ ⚡ URGENT        HOT KITCHEN      │   │ ▓▓▓▓▓░░░░░ 50%    GRILL          │
│ ═══════════════════════════════════│   │ ═══════════════════════════════════│
│                                   │   │                                   │
│ #001234  Table T1  Main Dining    │   │ #001232  Table T5  VIP Lounge     │
│ ─────────────────────────────────│   │ ─────────────────────────────────│
│                                   │   │                                   │
│ ITEMS:                            │   │ ITEMS:                            │
│ ○ 1x Classic Burger               │   │ ● 2x Ribeye Steak [PREPARING]     │
│     + Bacon                       │   │     Medium Rare                   │
│     + Jalapeño                    │   │ ○ 1x Grilled Salmon [PENDING]     │
│     "Well done patty"             │   │                                   │
│ ○ 1x Grilled Chicken              │   │ ─────────────────────────────────│
│     ⚠️ CONTAINS NUTS              │   │                                   │
│                                   │   │ Started: 6 min ago                │
│ ─────────────────────────────────│   │ Est: 8 min remaining              │
│                                   │   │                                   │
│ ⏱️ WAITING: 4:30                  │   │ ─────────────────────────────────│
│    Est Prep: 15 min               │   │                                   │
│                                   │   │ [Item Ready]    [All Ready]       │
│ ─────────────────────────────────│   │                                   │
│                                   │   └───────────────────────────────────┘
│ [START]              [DELAY]      │
│                                   │
└───────────────────────────────────┘


READY STATE:                            OVERDUE STATE:
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│ ✓ READY           BEVERAGES       │   │ ⏰ OVERDUE        HOT KITCHEN     │
│ ═══════════════════════════════════│   │ ═══════════════════════════════════│
│                                   │   │ █████████████████████████████████│
│ #001230  Table T3  Patio          │   │ RED PULSING BORDER                │
│ ─────────────────────────────────│   │ █████████████████████████████████│
│                                   │   │                                   │
│ ITEMS:                            │   │ #001238  Table T6  Main Dining    │
│ ✓ 3x Coca Cola [READY]            │   │ ─────────────────────────────────│
│ ✓ 1x Orange Juice [READY]         │   │                                   │
│                                   │   │ ITEMS:                            │
│ ─────────────────────────────────│   │ ● 1x Fish & Chips [PREPARING]     │
│                                   │   │     5 min OVERDUE                 │
│ Completed: 2 min ago              │   │                                   │
│ Actual Prep: 4 min                │   │ ─────────────────────────────────│
│                                   │   │                                   │
│ ─────────────────────────────────│   │ ⏱️ OVERDUE: 5 min                 │
│                                   │   │    Total Wait: 25 min             │
│ [Mark Served]        [Recall]     │   │                                   │
│                                   │   │ ─────────────────────────────────│
└───────────────────────────────────┘   │                                   │
                                        │ [URGENT!]        [Notify Manager] │
                                        │                                   │
                                        └───────────────────────────────────┘
```

---

## Real-Time Status Updates

### Status Flow

```
                    ORDER SUBMITTED
                          │
                          ▼
            ┌─────────────────────────────┐
            │     Generate Tickets        │
            │     Per Station             │
            └─────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  TICKET   │   │  TICKET   │   │  TICKET   │
    │  HOT      │   │  GRILL    │   │  BEV      │
    │  PENDING  │   │  PENDING  │   │  PENDING  │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          ▼               ▼               ▼
    [Start Ticket]  [Start Ticket]  [Start Ticket]
          │               │               │
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ PREPARING │   │ PREPARING │   │ PREPARING │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          │               │               │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │Item Ready │   │Item Ready │   │Item Ready │
    │Item Ready │   │Item Ready │   │           │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   READY   │   │   READY   │   │   READY   │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │  ALL TICKETS READY?         │
            │  Update Order Status        │
            │  Order.status = READY       │
            │  Notify Server              │
            └─────────────────────────────┘
                          │
                          ▼
                    ORDER READY
                          │
                          ▼
                  [Mark Served]
                          │
                          ▼
            ┌─────────────────────────────┐
            │  Order.status = SERVED      │
            │  All Tickets = SERVED       │
            └─────────────────────────────┘
```

### Event System

```typescript
// src/services/kitchen/KitchenEventService.ts

type KitchenEventType =
  | 'TICKET_CREATED'
  | 'TICKET_STARTED'
  | 'TICKET_COMPLETED'
  | 'TICKET_DELAYED'
  | 'ITEM_STATUS_CHANGED'
  | 'TICKET_OVERDUE'
  | 'ORDER_READY'
  | 'ALLERGEN_ALERT';

interface KitchenEvent {
  type: KitchenEventType;
  ticketId: string;
  orderId: string;
  orderNumber: string;
  tableId: string;
  station: KitchenStation;
  timestamp: string;
  payload: any;
}

class KitchenEventService {
  private subscribers: Map<KitchenEventType, Set<EventHandler>>;

  subscribe(type: KitchenEventType, handler: EventHandler): () => void {
    // Add handler to subscribers
    // Return unsubscribe function
  }

  emit(event: KitchenEvent): void {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // Also emit to 'ALL' subscribers
    const allHandlers = this.subscribers.get('ALL' as any);
    if (allHandlers) {
      allHandlers.forEach(handler => handler(event));
    }
  }

  // Specific event emitters
  ticketCreated(ticket: KitchenTicket): void {
    this.emit({
      type: 'TICKET_CREATED',
      ticketId: ticket.id,
      orderId: ticket.orderId,
      orderNumber: ticket.orderNumber,
      tableId: ticket.tableId,
      station: ticket.station,
      timestamp: new Date().toISOString(),
      payload: { ticket },
    });
  }

  ticketStarted(ticket: KitchenTicket): void {
    this.emit({
      type: 'TICKET_STARTED',
      // ...
      payload: { ticket },
    });
  }

  itemStatusChanged(ticket: KitchenTicket, itemId: string, status: OrderItemStatus): void {
    this.emit({
      type: 'ITEM_STATUS_CHANGED',
      // ...
      payload: { ticket, itemId, status },
    });
  }

  orderReady(orderId: string, orderNumber: string, tableId: string): void {
    this.emit({
      type: 'ORDER_READY',
      ticketId: '',
      orderId,
      orderNumber,
      tableId,
      station: 'hot_kitchen', // n/a
      timestamp: new Date().toISOString(),
      payload: { orderId, orderNumber, tableId },
    });

    // Also trigger notification to server
    NotificationService.notifyServer({
      type: 'ORDER_READY',
      orderId,
      orderNumber,
      tableId,
    });
  }
}
```

---

## Allergen Warning System

### Allergen Display

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ALLERGEN WARNING DISPLAY                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TICKET WITH ALLERGEN WARNING:                                                   │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │ ████████████████████████████████████████████████████████████████████████│ │
│  │ █                           ⚠️ ALLERGEN ALERT                          █│ │
│  │ ████████████████████████████████████████████████████████████████████████│ │
│  │                                                                          │ │
│  │ #001234  Table T1                                        HOT KITCHEN    │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │                                                                          │ │
│  │ ITEMS:                                                                   │ │
│  │                                                                          │ │
│  │ ○ 1x Classic Burger                                                      │ │
│  │     + Bacon                                                              │ │
│  │     "Well done"                                                          │ │
│  │                                                                          │ │
│  │ ┌────────────────────────────────────────────────────────────────────┐  │ │
│  │ │ ⚠️ 1x Grilled Chicken with Almond Crust                            │  │ │
│  │ │ ─────────────────────────────────────────────────────────────────  │  │ │
│  │ │                                                                    │  │ │
│  │ │ CONTAINS: 🥜 TREE NUTS (Almonds)                                   │  │ │
│  │ │                                                                    │  │ │
│  │ │ Please ensure:                                                     │  │ │
│  │ │ • Use clean equipment                                              │  │ │
│  │ │ • No cross-contamination                                           │  │ │
│  │ │ • Verify with customer before serving                              │  │ │
│  │ │                                                                    │  │ │
│  │ └────────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                          │ │
│  │ ────────────────────────────────────────────────────────────────────── │ │
│  │                                                                          │ │
│  │ [Acknowledge Alert]                              [START]      [DELAY]   │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Allergen Types

```typescript
type AllergenType =
  | 'gluten'
  | 'dairy'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'tree_nuts'
  | 'peanuts'
  | 'soy'
  | 'sesame'
  | 'sulfites';

const ALLERGEN_CONFIG: Record<AllergenType, AllergenInfo> = {
  gluten: {
    name: 'Gluten',
    icon: '🌾',
    color: '#FFC107',
    severity: 'high',
  },
  dairy: {
    name: 'Dairy',
    icon: '🥛',
    color: '#FFFFFF',
    severity: 'high',
  },
  eggs: {
    name: 'Eggs',
    icon: '🥚',
    color: '#FFEB3B',
    severity: 'medium',
  },
  fish: {
    name: 'Fish',
    icon: '🐟',
    color: '#03A9F4',
    severity: 'high',
  },
  shellfish: {
    name: 'Shellfish',
    icon: '🦐',
    color: '#FF5722',
    severity: 'high',
  },
  tree_nuts: {
    name: 'Tree Nuts',
    icon: '🥜',
    color: '#795548',
    severity: 'high',
  },
  peanuts: {
    name: 'Peanuts',
    icon: '🥜',
    color: '#8D6E63',
    severity: 'high',
  },
  soy: {
    name: 'Soy',
    icon: '🫘',
    color: '#8BC34A',
    severity: 'medium',
  },
  sesame: {
    name: 'Sesame',
    icon: '⚪',
    color: '#FFE0B2',
    severity: 'high',
  },
  sulfites: {
    name: 'Sulfites',
    icon: '⚗️',
    color: '#9E9E9E',
    severity: 'medium',
  },
};
```

---

## Prep Time Management

### Time Tracking

```typescript
interface PrepTimeTracking {
  ticketId: string;

  // Timestamps
  createdAt: string;
  startedAt?: string;
  completedAt?: string;

  // Calculated Times
  waitTime: number;           // Time from created to started (seconds)
  prepTime: number;           // Time from started to completed (seconds)
  totalTime: number;          // Total from created to completed (seconds)

  // Estimates
  estimatedPrepTime: number;  // Original estimate (seconds)
  remainingTime?: number;     // Real-time remaining (seconds)

  // Status
  isOverdue: boolean;
  overdueBy?: number;         // Seconds overdue
}

class PrepTimeService {
  /**
   * Calculate remaining time for a ticket
   */
  getRemainingTime(ticket: KitchenTicket): number {
    if (!ticket.startedAt) {
      return ticket.estimatedPrepTime * 60; // Return full estimate
    }

    const elapsedSeconds = this.getElapsedSeconds(ticket.startedAt);
    const estimatedSeconds = ticket.estimatedPrepTime * 60;
    const remaining = estimatedSeconds - elapsedSeconds;

    return Math.max(0, remaining);
  }

  /**
   * Check if ticket is overdue
   */
  isOverdue(ticket: KitchenTicket): boolean {
    if (ticket.status === 'ready' || ticket.status === 'served') {
      return false;
    }

    const totalWait = this.getElapsedSeconds(ticket.createdAt);
    const maxAllowedTime = ticket.estimatedPrepTime * 60 * 1.5; // 150% of estimate

    return totalWait > maxAllowedTime;
  }

  /**
   * Get display color based on time status
   */
  getTimeColor(ticket: KitchenTicket): string {
    if (ticket.status === 'pending') {
      const waitMinutes = this.getElapsedMinutes(ticket.createdAt);
      if (waitMinutes > 5) return '#FF9800'; // Orange - attention needed
      if (waitMinutes > 10) return '#F44336'; // Red - overdue
      return '#4CAF50'; // Green - OK
    }

    if (ticket.status === 'preparing') {
      const remaining = this.getRemainingTime(ticket);
      const estimate = ticket.estimatedPrepTime * 60;
      const percentage = (estimate - remaining) / estimate;

      if (percentage > 1) return '#F44336';   // Red - overdue
      if (percentage > 0.8) return '#FF9800'; // Orange - almost done or late
      return '#4CAF50'; // Green - on track
    }

    return '#2196F3'; // Blue - ready/served
  }

  /**
   * Format time for display
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
```

---

## Kitchen-Order Synchronization

### Bidirectional Updates

```
                    ORDER CONTEXT                              KITCHEN CONTEXT
                    ═════════════                              ═══════════════

                    ┌───────────────┐                         ┌───────────────┐
                    │    Order      │   Create Tickets        │   Tickets     │
                    │   Submitted   │ ─────────────────────▶  │   Created     │
                    └───────────────┘                         └───────────────┘
                           │                                         │
                           │                                         │
                           │         Ticket Status Updates           │
                    ┌──────┴──────┐  ◀────────────────────────┌──────┴──────┐
                    │             │                           │             │
                    │ Order Items │   Item status changes     │  Tickets    │
                    │   Status    │   (pending→preparing→     │  Processing │
                    │   Updated   │    ready)                 │             │
                    │             │                           │             │
                    └──────┬──────┘                           └──────┬──────┘
                           │                                         │
                           │                                         │
                    ┌──────┴──────┐   All Tickets Ready       ┌──────┴──────┐
                    │             │  ◀────────────────────────│             │
                    │Order Status │                           │All Tickets  │
                    │   = READY   │                           │   Ready     │
                    │             │                           │             │
                    └──────┬──────┘                           └──────┬──────┘
                           │                                         │
                           │                                         │
                           │         Mark Served                     │
                    ┌──────┴──────┐  ────────────────────────▶┌──────┴──────┐
                    │             │                           │             │
                    │Order Status │                           │  Tickets    │
                    │  = SERVED   │                           │   Served    │
                    │             │                           │             │
                    └─────────────┘                           └─────────────┘
```

### Sync Service

```typescript
// src/services/kitchen/KitchenOrderSyncService.ts

class KitchenOrderSyncService {
  private orderContext: OrderContextValue;
  private kitchenContext: KitchenContextValue;

  /**
   * Update order when all tickets are ready
   */
  checkOrderReady(orderId: string): void {
    const order = this.orderContext.getOrder(orderId);
    const tickets = this.kitchenContext.getTicketsForOrder(orderId);

    const allReady = tickets.every(
      ticket => ticket.status === 'ready' || ticket.status === 'served'
    );

    if (allReady && order.status === 'preparing') {
      this.orderContext.updateOrderStatus(orderId, 'ready');
      this.orderContext.setReadyAt(orderId, new Date().toISOString());

      // Notify server
      KitchenEventService.orderReady(orderId, order.orderNumber, order.tableId);
    }
  }

  /**
   * Update order item status from kitchen
   */
  syncItemStatus(ticketId: string, itemId: string, status: OrderItemStatus): void {
    const ticket = this.kitchenContext.getTicket(ticketId);
    const order = this.orderContext.getOrder(ticket.orderId);

    // Update order item
    this.orderContext.updateItemStatus(ticket.orderId, itemId, status);

    // Check if order should move to "preparing"
    if (status === 'preparing' && order.status === 'confirmed') {
      this.orderContext.updateOrderStatus(ticket.orderId, 'preparing');
      this.orderContext.setPreparingAt(ticket.orderId, new Date().toISOString());
    }
  }

  /**
   * Sync served status
   */
  markOrderServed(orderId: string): void {
    // Update all tickets
    const tickets = this.kitchenContext.getTicketsForOrder(orderId);
    for (const ticket of tickets) {
      this.kitchenContext.updateTicketStatus(ticket.id, 'served');
    }

    // Update order
    this.orderContext.updateOrderStatus(orderId, 'served');
    this.orderContext.setServedAt(orderId, new Date().toISOString());
  }
}
```

---

## Print Integration (KOT)

### Kitchen Order Ticket Print Format

```
┌─────────────────────────────────────┐
│         KITCHEN ORDER TICKET        │
│              KOT #001234            │
├─────────────────────────────────────┤
│                                     │
│  Order: #ORD-20251231-0001          │
│  Table: T1 - Main Dining            │
│  Server: John Doe                   │
│  Time: 12:35:22 PM                  │
│                                     │
│  Station: HOT KITCHEN               │
│                                     │
├─────────────────────────────────────┤
│  ITEMS                              │
├─────────────────────────────────────┤
│                                     │
│  1x CLASSIC BURGER                  │
│     + Bacon                         │
│     + Jalapeño                      │
│     "Well done patty"               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  1x GRILLED CHICKEN                 │
│     + Extra Sauce                   │
│                                     │
│  ╔═════════════════════════════════╗│
│  ║ ⚠️  ALLERGEN: TREE NUTS        ║│
│  ╚═════════════════════════════════╝│
│                                     │
├─────────────────────────────────────┤
│  Est. Prep Time: 15 min             │
│  Priority: URGENT                   │
└─────────────────────────────────────┘
```

### Print Service

```typescript
// src/services/print/KitchenPrintService.ts

interface KOTPrintData {
  kotNumber: string;
  orderNumber: string;
  tableName: string;
  serverName: string;
  timestamp: string;
  station: KitchenStation;
  items: KOTItem[];
  estimatedPrepTime: number;
  priority: TicketPriority;
  hasAllergens: boolean;
  allergenTypes: AllergenType[];
  specialInstructions?: string;
}

class KitchenPrintService {
  async printKOT(ticket: KitchenTicket): Promise<void> {
    const printData = this.formatKOTData(ticket);

    // Send to appropriate printer based on station
    const printer = this.getStationPrinter(ticket.station);

    await printer.print(printData);
  }

  async printAllKOTs(order: Order, tickets: KitchenTicket[]): Promise<void> {
    // Print one KOT per station
    for (const ticket of tickets) {
      await this.printKOT(ticket);
    }
  }

  private getStationPrinter(station: KitchenStation): Printer {
    // Return configured printer for station
    // Could be network printer, thermal printer, etc.
    return PrinterConfig.getPrinter(station);
  }
}
```

---

## Related Documents

- [Master Plan](./plan.md)
- [User Flow Documentation](./user-flow.md)
- [Wireframes](./wireframes.md)
- [Data Flow Architecture](./data-flow.md)
- [Bill Splitting](./bill-splitting.md)
- [Implementation Phases](./implementation-phases.md)
