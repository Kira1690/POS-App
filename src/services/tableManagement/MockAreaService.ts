/**
 * Mock Area Service
 * Now uses TableStorageService for persistence
 * Data synced with Order Management
 * Following SOLID principles - Single Responsibility
 */

import {
  Area,
  CreateAreaRequest,
  UpdateAreaRequest,
} from '@/types/settings/table-management.types';
import { IAreaService } from './interfaces';
import { tableStorageService, StoredArea } from '@/services/storage';
import { MOCK_AREAS } from './mockData';

export class MockAreaService implements IAreaService {
  private initialized = false;
  private cachedAreas: Area[] = [];
  private delay = 100; // Reduced delay since we're using storage

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Convert StoredArea to Settings Area format
   */
  private storedToSettingsArea(stored: StoredArea, index: number, restaurantId: string): Area {
    return {
      id: stored.id,
      restaurant_id: restaurantId,
      name: stored.name,
      description: stored.description,
      color: stored.color || '#4CAF50',
      display_order: index + 1,
      is_active: stored.isActive,
      allow_reservations: true,
      table_count: 0,
      total_capacity: 0,
      available_tables: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  /**
   * Convert Settings Area to StoredArea format
   */
  private settingsToStoredArea(area: Area): StoredArea {
    return {
      id: area.id,
      name: area.name,
      icon: 'table-furniture', // Default icon
      description: area.description || '',
      isActive: area.is_active,
      color: area.color,
    };
  }

  /**
   * Initialize from storage
   */
  private async ensureInitialized(restaurantId: string): Promise<void> {
    if (this.initialized && this.cachedAreas.length > 0) {
      return;
    }

    try {
      await tableStorageService.initialize(restaurantId);
      const storedAreas = await tableStorageService.getAreas();

      // Convert stored areas to settings format
      this.cachedAreas = storedAreas.map((a, i) =>
        this.storedToSettingsArea(a, i, restaurantId)
      );
      this.initialized = true;

      if (__DEV__) {
        console.log(`[MockAreaService] Loaded ${this.cachedAreas.length} areas from storage`);
      }
    } catch {
      // Fallback to mock data
      this.cachedAreas = [...MOCK_AREAS];
      this.initialized = true;
    }
  }

  /**
   * Persist changes to storage
   */
  private async persistToStorage(): Promise<void> {
    const storedAreas = this.cachedAreas.map(a => this.settingsToStoredArea(a));
    await tableStorageService.saveAreas(storedAreas);
  }

  async getAreas(restaurantId: string): Promise<Area[]> {
    await this.ensureInitialized(restaurantId);
    await this.simulateDelay();
    return this.cachedAreas
      .filter((a) => a.restaurant_id === restaurantId)
      .sort((a, b) => a.display_order - b.display_order);
  }

  async getArea(areaId: string): Promise<Area> {
    await this.simulateDelay();
    const area = this.cachedAreas.find((a) => a.id === areaId);
    if (!area) {
      throw new Error(`Area not found: ${areaId}`);
    }
    return area;
  }

  async createArea(data: CreateAreaRequest): Promise<Area> {
    await this.simulateDelay();

    const maxOrder = Math.max(
      ...this.cachedAreas
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

    this.cachedAreas.push(newArea);
    await this.persistToStorage();
    return newArea;
  }

  async updateArea(areaId: string, data: UpdateAreaRequest): Promise<Area> {
    await this.simulateDelay();

    const index = this.cachedAreas.findIndex((a) => a.id === areaId);
    if (index === -1) {
      throw new Error(`Area not found: ${areaId}`);
    }

    this.cachedAreas[index] = {
      ...this.cachedAreas[index],
      ...data,
      updated_at: new Date(),
    };

    await this.persistToStorage();
    return this.cachedAreas[index];
  }

  async deleteArea(areaId: string): Promise<void> {
    await this.simulateDelay();

    const index = this.cachedAreas.findIndex((a) => a.id === areaId);
    if (index === -1) {
      throw new Error(`Area not found: ${areaId}`);
    }

    this.cachedAreas.splice(index, 1);
    await this.persistToStorage();
  }

  async reorderAreas(areaIds: string[]): Promise<void> {
    await this.simulateDelay();

    areaIds.forEach((areaId, index) => {
      const areaIndex = this.cachedAreas.findIndex((a) => a.id === areaId);
      if (areaIndex !== -1) {
        this.cachedAreas[areaIndex] = {
          ...this.cachedAreas[areaIndex],
          display_order: index + 1,
          updated_at: new Date(),
        };
      }
    });

    await this.persistToStorage();
  }

  /**
   * Force refresh from storage
   */
  async forceRefresh(restaurantId: string): Promise<void> {
    this.initialized = false;
    await this.ensureInitialized(restaurantId);
  }
}
