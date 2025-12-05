/**
 * Floor Plan Export/Import Utilities
 * Functions for exporting and importing floor plan configurations
 */

import {
  Floor,
  FloorZone,
  FloorPlanTablePosition,
  FloorPlanExportData,
} from '@/types/settings/table-management.types';

// ==================== CONSTANTS ====================

const EXPORT_VERSION = '1.0.0';

// ==================== EXPORT FUNCTIONS ====================

/**
 * Create export data from floor plan state
 */
export const createExportData = (
  restaurantId: string,
  floors: Floor[],
  tablePositions: FloorPlanTablePosition[],
  zones: FloorZone[],
  settings: {
    gridSize: number;
    snapToGrid: boolean;
    showChairs: boolean;
  }
): FloorPlanExportData => {
  return {
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    restaurant_id: restaurantId,
    floors,
    tables: tablePositions,
    zones,
    settings: {
      grid_size: settings.gridSize,
      snap_to_grid: settings.snapToGrid,
      show_chairs: settings.showChairs,
    },
  };
};

/**
 * Convert export data to JSON string
 */
export const exportToJson = (data: FloorPlanExportData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (restaurantName?: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedName = restaurantName
    ? restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    : 'floor-plan';
  return `${sanitizedName}-${date}.json`;
};

// ==================== IMPORT FUNCTIONS ====================

/**
 * Validation result type
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parse JSON string to export data
 */
export const parseImportJson = (jsonString: string): FloorPlanExportData | null => {
  try {
    return JSON.parse(jsonString) as FloorPlanExportData;
  } catch {
    return null;
  }
};

/**
 * Validate imported data structure
 */
export const validateImportData = (data: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: expected object');
    return { valid: false, errors, warnings };
  }

  const exportData = data as Partial<FloorPlanExportData>;

  // Check required fields
  if (!exportData.version) {
    errors.push('Missing required field: version');
  }

  if (!exportData.restaurant_id) {
    errors.push('Missing required field: restaurant_id');
  }

  if (!Array.isArray(exportData.floors)) {
    errors.push('Missing or invalid field: floors (expected array)');
  }

  if (!Array.isArray(exportData.tables)) {
    errors.push('Missing or invalid field: tables (expected array)');
  }

  if (!Array.isArray(exportData.zones)) {
    errors.push('Missing or invalid field: zones (expected array)');
  }

  // Version check
  if (exportData.version && exportData.version !== EXPORT_VERSION) {
    warnings.push(
      `Version mismatch: file version ${exportData.version}, expected ${EXPORT_VERSION}`
    );
  }

  // Validate floors structure
  if (Array.isArray(exportData.floors)) {
    exportData.floors.forEach((floor, index) => {
      if (!floor.id) {
        errors.push(`Floor at index ${index} is missing id`);
      }
      if (!floor.name) {
        errors.push(`Floor at index ${index} is missing name`);
      }
      if (typeof floor.canvas_width !== 'number') {
        warnings.push(`Floor "${floor.name || index}" has invalid canvas_width`);
      }
      if (typeof floor.canvas_height !== 'number') {
        warnings.push(`Floor "${floor.name || index}" has invalid canvas_height`);
      }
    });
  }

  // Validate table positions structure
  if (Array.isArray(exportData.tables)) {
    exportData.tables.forEach((table, index) => {
      if (!table.table_id) {
        errors.push(`Table position at index ${index} is missing table_id`);
      }
      if (!table.floor_id) {
        errors.push(`Table position at index ${index} is missing floor_id`);
      }
      if (typeof table.x !== 'number' || typeof table.y !== 'number') {
        errors.push(`Table position at index ${index} has invalid coordinates`);
      }
    });
  }

  // Validate zones structure
  if (Array.isArray(exportData.zones)) {
    exportData.zones.forEach((zone, index) => {
      if (!zone.id) {
        errors.push(`Zone at index ${index} is missing id`);
      }
      if (!zone.floor_id) {
        errors.push(`Zone at index ${index} is missing floor_id`);
      }
      if (!zone.bounds) {
        errors.push(`Zone at index ${index} is missing bounds`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Merge imported data with existing data
 */
export const mergeImportData = (
  existingFloors: Floor[],
  existingZones: FloorZone[],
  existingTablePositions: FloorPlanTablePosition[],
  importData: FloorPlanExportData,
  options: {
    overwriteExisting?: boolean;
    generateNewIds?: boolean;
  } = {}
): {
  floors: Floor[];
  zones: FloorZone[];
  tablePositions: FloorPlanTablePosition[];
} => {
  const { overwriteExisting = false, generateNewIds = true } = options;

  if (overwriteExisting) {
    return {
      floors: importData.floors,
      zones: importData.zones,
      tablePositions: importData.tables,
    };
  }

  // Generate new IDs to avoid conflicts
  const idSuffix = generateNewIds ? `-imported-${Date.now()}` : '';

  const newFloors = importData.floors.map(floor => ({
    ...floor,
    id: `${floor.id}${idSuffix}`,
    is_default: false, // Never overwrite default
  }));

  const floorIdMap = new Map(
    importData.floors.map((f, i) => [f.id, newFloors[i].id])
  );

  const newZones = importData.zones.map(zone => ({
    ...zone,
    id: `${zone.id}${idSuffix}`,
    floor_id: floorIdMap.get(zone.floor_id) || zone.floor_id,
  }));

  const newTablePositions = importData.tables.map(pos => ({
    ...pos,
    table_id: `${pos.table_id}${idSuffix}`,
    floor_id: floorIdMap.get(pos.floor_id) || pos.floor_id,
  }));

  return {
    floors: [...existingFloors, ...newFloors],
    zones: [...existingZones, ...newZones],
    tablePositions: [...existingTablePositions, ...newTablePositions],
  };
};

// ==================== FILE HANDLING ====================

/**
 * Download export data as file (web only)
 * Note: For React Native, you would use expo-file-system or similar
 */
export const downloadExportFile = (data: FloorPlanExportData, filename: string): void => {
  const jsonString = exportToJson(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read file content (for React Native, use expo-document-picker)
 */
export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
