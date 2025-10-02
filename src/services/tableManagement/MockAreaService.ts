/**
 * Mock Area Service
 * In-memory implementation for area management
 * Following SOLID principles - Single Responsibility
 */

import {
  Area,
  CreateAreaRequest,
  UpdateAreaRequest,
} from '@/types/settings/table-management.types';
import { IAreaService } from './interfaces';
import { MOCK_AREAS } from './mockData';

export class MockAreaService implements IAreaService {
  private areas: Area[] = [...MOCK_AREAS];
  private delay = 500; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async getAreas(restaurantId: string): Promise<Area[]> {
    await this.simulateDelay();
    return this.areas
      .filter((a) => a.restaurant_id === restaurantId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  async getArea(areaId: string): Promise<Area> {
    await this.simulateDelay();
    const area = this.areas.find((a) => a.id === areaId);
    if (!area) {
      throw new Error(`Area not found: ${areaId}`);
    }
    return area;
  }

  async createArea(data: CreateAreaRequest): Promise<Area> {
    await this.simulateDelay();

    const maxOrder = Math.max(
      ...this.areas
        .filter((a) => a.restaurant_id === data.restaurant_id)
        .map((a) => a.display_order),
      0
    );

    const newArea: Area = {
      id: `area_${Date.now()}`,
      ...data,
      display_order: maxOrder + 1,
      is_active: data.is_active ?? true,
      allow_reservations: data.allow_reservations ?? true,
      table_count: 0,
      total_capacity: 0,
      available_tables: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.areas.push(newArea);
    return newArea;
  }

  async updateArea(areaId: string, data: UpdateAreaRequest): Promise<Area> {
    await this.simulateDelay();

    const index = this.areas.findIndex((a) => a.id === areaId);
    if (index === -1) {
      throw new Error(`Area not found: ${areaId}`);
    }

    this.areas[index] = {
      ...this.areas[index],
      ...data,
      updated_at: new Date(),
    };

    return this.areas[index];
  }

  async deleteArea(areaId: string): Promise<void> {
    await this.simulateDelay();

    const index = this.areas.findIndex((a) => a.id === areaId);
    if (index === -1) {
      throw new Error(`Area not found: ${areaId}`);
    }

    this.areas.splice(index, 1);
  }

  async reorderAreas(areaIds: string[]): Promise<void> {
    await this.simulateDelay();

    areaIds.forEach((areaId, index) => {
      const areaIndex = this.areas.findIndex((a) => a.id === areaId);
      if (areaIndex !== -1) {
        this.areas[areaIndex] = {
          ...this.areas[areaIndex],
          display_order: index + 1,
          updated_at: new Date(),
        };
      }
    });
  }
}
