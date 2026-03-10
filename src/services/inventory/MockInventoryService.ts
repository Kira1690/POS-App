import {
  InventoryItem,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockMovement,
  WasteRecord,
  InventoryAlert,
  InventoryFilters,
  InventoryAnalytics,
  InventoryService,
} from '@/types/inventory.types';

export class MockInventoryService implements InventoryService {
  private static instance: MockInventoryService;

  public static getInstance(): MockInventoryService {
    if (!MockInventoryService.instance) {
      MockInventoryService.instance = new MockInventoryService();
    }
    return MockInventoryService.instance;
  }

  private mockInventoryItems: InventoryItem[] = [
    {
      id: 'inv_001',
      name: 'Tomatoes',
      sku: 'VEG-TOM-001',
      category: 'Vegetables',
      unit: 'kg',
      current_stock: 25,
      minimum_stock: 10,
      maximum_stock: 50,
      reorder_point: 15,
      cost_per_unit: 3.50,
      supplier_id: 'sup_001',
      supplier_name: 'Fresh Produce Co.',
      last_ordered: '2024-12-20',
      expiry_date: '2024-12-30',
      location: 'Cold Storage',
      status: 'in_stock',
      usage_rate: 8.5,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-20T14:30:00Z',
    },
    {
      id: 'inv_002',
      name: 'Ground Beef',
      sku: 'MEAT-BEF-001',
      category: 'Meat',
      unit: 'kg',
      current_stock: 5,
      minimum_stock: 15,
      maximum_stock: 40,
      reorder_point: 20,
      cost_per_unit: 12.99,
      supplier_id: 'sup_002',
      supplier_name: 'Premium Meats Ltd.',
      last_ordered: '2024-12-18',
      expiry_date: '2024-12-25',
      location: 'Freezer A',
      status: 'low_stock',
      usage_rate: 12.3,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-20T14:30:00Z',
    },
    {
      id: 'inv_003',
      name: 'Mozzarella Cheese',
      sku: 'DAIRY-MOZ-001',
      category: 'Dairy',
      unit: 'kg',
      current_stock: 0,
      minimum_stock: 8,
      maximum_stock: 25,
      reorder_point: 12,
      cost_per_unit: 15.75,
      supplier_id: 'sup_003',
      supplier_name: 'Dairy Fresh Supplies',
      last_ordered: '2024-12-15',
      expiry_date: '2024-12-22',
      location: 'Refrigerator',
      status: 'out_of_stock',
      usage_rate: 6.8,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-20T14:30:00Z',
    },
    {
      id: 'inv_004',
      name: 'Olive Oil',
      sku: 'OIL-OLV-001',
      category: 'Oils & Condiments',
      unit: 'liters',
      current_stock: 45,
      minimum_stock: 8,
      maximum_stock: 20,
      reorder_point: 12,
      cost_per_unit: 8.50,
      supplier_id: 'sup_004',
      supplier_name: 'Gourmet Ingredients Inc.',
      last_ordered: '2024-12-10',
      location: 'Pantry',
      status: 'overstock',
      usage_rate: 2.1,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-20T14:30:00Z',
    },
    {
      id: 'inv_005',
      name: 'Lettuce',
      sku: 'VEG-LET-001',
      category: 'Vegetables',
      unit: 'pieces',
      current_stock: 8,
      minimum_stock: 20,
      maximum_stock: 50,
      reorder_point: 25,
      cost_per_unit: 1.25,
      supplier_id: 'sup_001',
      supplier_name: 'Fresh Produce Co.',
      last_ordered: '2024-12-19',
      expiry_date: '2024-12-21',
      location: 'Cold Storage',
      status: 'expired',
      usage_rate: 15.2,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-20T14:30:00Z',
    },
  ];

  async getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
    await this.delay(400);
    
    let items = [...this.mockInventoryItems];
    
    if (filters) {
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
      
      if (filters.status && filters.status.length > 0) {
        items = items.filter(item => filters.status!.includes(item.status));
      }
      
      if (filters.location) {
        items = items.filter(item => item.location === filters.location);
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
        );
      }
      
      if (filters.sort_by) {
        items.sort((a, b) => {
          let aValue, bValue;
          
          switch (filters.sort_by) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'stock_level':
              aValue = a.current_stock;
              bValue = b.current_stock;
              break;
            case 'cost':
              aValue = a.cost_per_unit;
              bValue = b.cost_per_unit;
              break;
            case 'usage_rate':
              aValue = a.usage_rate;
              bValue = b.usage_rate;
              break;
            case 'last_updated':
              aValue = new Date(a.updated_at);
              bValue = new Date(b.updated_at);
              break;
            default:
              return 0;
          }
          
          if (aValue < bValue) return filters.sort_order === 'desc' ? 1 : -1;
          if (aValue > bValue) return filters.sort_order === 'desc' ? -1 : 1;
          return 0;
        });
      }
    }
    
    return items;
  }

  async getInventoryItem(id: string): Promise<InventoryItem> {
    await this.delay(300);
    
    const item = this.mockInventoryItems.find(item => item.id === id);
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    return item;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    await this.delay(500);
    
    const itemIndex = this.mockInventoryItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Inventory item not found');
    }
    
    this.mockInventoryItems[itemIndex] = {
      ...this.mockInventoryItems[itemIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return this.mockInventoryItems[itemIndex];
  }

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    await this.delay(600);
    
    const newItem: InventoryItem = {
      ...item,
      id: 'inv_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.mockInventoryItems.push(newItem);
    return newItem;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.delay(400);
    
    const itemIndex = this.mockInventoryItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Inventory item not found');
    }
    
    this.mockInventoryItems.splice(itemIndex, 1);
  }

  async adjustStock(item_id: string, quantity: number, reason: string): Promise<StockMovement> {
    await this.delay(500);
    
    const item = await this.getInventoryItem(item_id);
    
    const movement: StockMovement = {
      id: 'mov_' + Date.now(),
      item_id,
      item_name: item.name,
      movement_type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      unit: item.unit,
      reason,
      cost_impact: Math.abs(quantity) * item.cost_per_unit,
      performed_by: 'current_user',
      timestamp: new Date().toISOString(),
    };
    
    // Update stock
    await this.updateInventoryItem(item_id, {
      current_stock: item.current_stock + quantity,
    });
    
    return movement;
  }

  async recordWaste(waste: Omit<WasteRecord, 'id'>): Promise<WasteRecord> {
    await this.delay(450);
    
    const wasteRecord: WasteRecord = {
      ...waste,
      id: 'waste_' + Date.now(),
    };
    
    // Adjust stock
    await this.adjustStock(waste.item_id, -waste.quantity_wasted, `Waste: ${waste.reason}`);
    
    return wasteRecord;
  }

  async getSuppliers(): Promise<Supplier[]> {
    await this.delay(350);
    
    return [
      {
        id: 'sup_001',
        name: 'Fresh Produce Co.',
        contact_person: 'John Farmers',
        email: 'john@freshproduce.com',
        phone: '+1 (555) 123-4567',
        address: '123 Farm Road, Green Valley, CA 90210',
        delivery_days: ['Monday', 'Wednesday', 'Friday'],
        payment_terms: 'Net 30',
        rating: 4.5,
        active: true,
      },
      {
        id: 'sup_002',
        name: 'Premium Meats Ltd.',
        contact_person: 'Sarah Butcher',
        email: 'sarah@premiummeats.com',
        phone: '+1 (555) 234-5678',
        address: '456 Meat Street, Butcher Town, CA 90211',
        delivery_days: ['Tuesday', 'Thursday'],
        payment_terms: 'Net 15',
        rating: 4.8,
        active: true,
      },
      {
        id: 'sup_003',
        name: 'Dairy Fresh Supplies',
        contact_person: 'Mike Dairy',
        email: 'mike@dairyfresh.com',
        phone: '+1 (555) 345-6789',
        address: '789 Dairy Lane, Milk City, CA 90212',
        delivery_days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        payment_terms: 'Net 30',
        rating: 4.2,
        active: true,
      },
    ];
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await this.delay(500);
    
    return [
      {
        id: 'po_001',
        order_number: 'PO-2024-001',
        supplier_id: 'sup_001',
        supplier_name: 'Fresh Produce Co.',
        items: [
          {
            item_id: 'inv_001',
            item_name: 'Tomatoes',
            quantity_ordered: 30,
            quantity_received: 30,
            unit_cost: 3.50,
            total_cost: 105.00,
            unit: 'kg',
          },
          {
            item_id: 'inv_005',
            item_name: 'Lettuce',
            quantity_ordered: 50,
            quantity_received: 45,
            unit_cost: 1.25,
            total_cost: 62.50,
            unit: 'pieces',
          },
        ],
        total_amount: 167.50,
        status: 'received',
        order_date: '2024-12-18',
        expected_delivery: '2024-12-20',
        actual_delivery: '2024-12-20',
        notes: 'Partial delivery - 5 lettuce missing',
        created_by: 'manager_001',
      },
    ];
  }

  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'order_number'>): Promise<PurchaseOrder> {
    await this.delay(700);
    
    const newOrder: PurchaseOrder = {
      ...order,
      id: 'po_' + Date.now(),
      order_number: `PO-2024-${String(Date.now()).slice(-3)}`,
    };
    
    return newOrder;
  }

  async getStockMovements(item_id?: string): Promise<StockMovement[]> {
    await this.delay(400);
    
    const movements: StockMovement[] = [
      {
        id: 'mov_001',
        item_id: 'inv_001',
        item_name: 'Tomatoes',
        movement_type: 'in',
        quantity: 30,
        unit: 'kg',
        reason: 'Purchase order PO-2024-001',
        reference_number: 'PO-2024-001',
        cost_impact: 105.00,
        performed_by: 'staff_001',
        timestamp: '2024-12-20T09:00:00Z',
      },
      {
        id: 'mov_002',
        item_id: 'inv_001',
        item_name: 'Tomatoes',
        movement_type: 'out',
        quantity: 12,
        unit: 'kg',
        reason: 'Kitchen usage',
        cost_impact: 42.00,
        performed_by: 'chef_001',
        timestamp: '2024-12-20T14:30:00Z',
      },
    ];
    
    if (item_id) {
      return movements.filter(movement => movement.item_id === item_id);
    }
    
    return movements;
  }

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    await this.delay(300);
    
    return [
      {
        id: 'alert_001',
        type: 'low_stock',
        item_id: 'inv_002',
        item_name: 'Ground Beef',
        current_quantity: 5,
        threshold_quantity: 15,
        priority: 'high',
        message: 'Ground Beef stock is below minimum threshold (5kg remaining)',
        created_at: '2024-12-20T15:00:00Z',
        acknowledged: false,
      },
      {
        id: 'alert_002',
        type: 'out_of_stock',
        item_id: 'inv_003',
        item_name: 'Mozzarella Cheese',
        current_quantity: 0,
        threshold_quantity: 8,
        priority: 'critical',
        message: 'Mozzarella Cheese is completely out of stock',
        created_at: '2024-12-20T12:00:00Z',
        acknowledged: false,
      },
      {
        id: 'alert_003',
        type: 'expired',
        item_id: 'inv_005',
        item_name: 'Lettuce',
        current_quantity: 8,
        threshold_quantity: 0,
        priority: 'high',
        message: 'Lettuce has expired and should be removed from inventory',
        created_at: '2024-12-21T08:00:00Z',
        acknowledged: false,
      },
    ];
  }

  async acknowledgeAlert(alert_id: string): Promise<void> {
    await this.delay(200);
  }

  async getInventoryAnalytics(): Promise<InventoryAnalytics> {
    await this.delay(600);
    
    return {
      total_items: this.mockInventoryItems.length,
      total_value: this.mockInventoryItems.reduce((sum, item) => 
        sum + (item.current_stock * item.cost_per_unit), 0
      ),
      low_stock_items: this.mockInventoryItems.filter(item => item.status === 'low_stock').length,
      out_of_stock_items: this.mockInventoryItems.filter(item => item.status === 'out_of_stock').length,
      expired_items: this.mockInventoryItems.filter(item => item.status === 'expired').length,
      waste_this_month: {
        quantity: 25,
        cost: 127.50,
      },
      turnover_rate: 8.5,
      reorder_suggestions: [
        'Ground Beef - Critically low (5kg remaining)',
        'Mozzarella Cheese - Out of stock',
        'Lettuce - Expired items need replacement',
      ],
    };
  }

  async generateReorderSuggestions(): Promise<PurchaseOrderItem[]> {
    await this.delay(800);
    
    return [
      {
        item_id: 'inv_002',
        item_name: 'Ground Beef',
        quantity_ordered: 25,
        unit_cost: 12.99,
        total_cost: 324.75,
        unit: 'kg',
      },
      {
        item_id: 'inv_003',
        item_name: 'Mozzarella Cheese',
        quantity_ordered: 15,
        unit_cost: 15.75,
        total_cost: 236.25,
        unit: 'kg',
      },
      {
        item_id: 'inv_005',
        item_name: 'Lettuce',
        quantity_ordered: 40,
        unit_cost: 1.25,
        total_cost: 50.00,
        unit: 'pieces',
      },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}