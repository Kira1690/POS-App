/**
 * Mock Table Management Service
 * In-memory implementation for UI development
 * Following SOLID principles - Single Responsibility
 */

import {
  Table,
  TableStatus,
  Position,
  CreateTableRequest,
  UpdateTableRequest,
} from '@/types/settings/table-management.types';
import { ITableManagementService } from './interfaces';
import { MOCK_TABLES } from './mockData';

export class MockTableManagementService implements ITableManagementService {
  private tables: Table[] = [...MOCK_TABLES];
  private delay = 500; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async getTables(restaurantId: string): Promise<Table[]> {
    await this.simulateDelay();
    return this.tables.filter((t) => t.restaurant_id === restaurantId);
  }

  async getTable(tableId: string): Promise<Table> {
    await this.simulateDelay();
    const table = this.tables.find((t) => t.id === tableId);
    if (!table) {
      throw new Error(`Table not found: ${tableId}`);
    }
    return table;
  }

  async getTablesByArea(areaId: string): Promise<Table[]> {
    await this.simulateDelay();
    return this.tables.filter((t) => t.area_id === areaId);
  }

  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    await this.simulateDelay();
    return this.tables.filter((t) => t.status === status);
  }

  async createTable(data: CreateTableRequest): Promise<Table> {
    await this.simulateDelay();

    const newTable: Table = {
      id: `table_${Date.now()}`,
      ...data,
      status: TableStatus.AVAILABLE,
      is_active: data.is_active ?? true,
      allow_online_booking: data.allow_online_booking ?? true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'current_user',
      updated_by: 'current_user',
    };

    this.tables.push(newTable);
    return newTable;
  }

  async updateTable(
    tableId: string,
    data: UpdateTableRequest
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.tables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.tables[index] = {
      ...this.tables[index],
      ...data,
      updated_at: new Date(),
      updated_by: 'current_user',
    };

    return this.tables[index];
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.simulateDelay();

    const index = this.tables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.tables.splice(index, 1);
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.tables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.tables[index] = {
      ...this.tables[index],
      status,
      updated_at: new Date(),
      updated_by: 'current_user',
      // Clear occupancy data if becoming available
      ...(status === TableStatus.AVAILABLE && {
        current_order_id: undefined,
        current_reservation_id: undefined,
        assigned_server_id: undefined,
        customer_name: undefined,
        occupied_since: undefined,
      }),
    };

    return this.tables[index];
  }

  async updateTablePosition(
    tableId: string,
    position: Position
  ): Promise<Table> {
    await this.simulateDelay();

    const index = this.tables.findIndex((t) => t.id === tableId);
    if (index === -1) {
      throw new Error(`Table not found: ${tableId}`);
    }

    this.tables[index] = {
      ...this.tables[index],
      position,
      updated_at: new Date(),
      updated_by: 'current_user',
    };

    return this.tables[index];
  }

  async bulkUpdateStatus(
    tableIds: string[],
    status: TableStatus
  ): Promise<void> {
    await this.simulateDelay();

    tableIds.forEach((tableId) => {
      const index = this.tables.findIndex((t) => t.id === tableId);
      if (index !== -1) {
        this.tables[index] = {
          ...this.tables[index],
          status,
          updated_at: new Date(),
          updated_by: 'current_user',
        };
      }
    });
  }

  async bulkUpdateArea(tableIds: string[], areaId: string): Promise<void> {
    await this.simulateDelay();

    tableIds.forEach((tableId) => {
      const index = this.tables.findIndex((t) => t.id === tableId);
      if (index !== -1) {
        this.tables[index] = {
          ...this.tables[index],
          area_id: areaId,
          updated_at: new Date(),
          updated_by: 'current_user',
        };
      }
    });
  }
}
