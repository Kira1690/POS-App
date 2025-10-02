/**
 * Mock Table Operations Service
 * Handles merge, split, and transfer operations
 * Following SOLID principles - Single Responsibility
 */

import {
  MergeTablesRequest,
  MergeTablesResult,
  MergeValidationResult,
  SplitTableRequest,
  SplitTableResult,
  SplitConfig,
  TransferTableRequest,
  TransferTableResult,
  TransferValidationResult,
  ValidationResult,
  TableStatus,
} from '@/types/settings/table-management.types';
import { ITableOperationsService } from './interfaces';
import { MOCK_TABLES } from './mockData';

export class MockTableOperationsService implements ITableOperationsService {
  private delay = 500; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async mergeTables(
    request: MergeTablesRequest
  ): Promise<MergeTablesResult> {
    await this.simulateDelay();

    // Validate tables exist
    const tables = MOCK_TABLES.filter((t) =>
      request.table_ids.includes(t.id)
    );

    if (tables.length !== request.table_ids.length) {
      return {
        merged_table_id: '',
        original_table_ids: request.table_ids,
        combined_capacity: 0,
        success: false,
        message: 'One or more tables not found',
      };
    }

    const combined_capacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    // Simulate successful merge
    return {
      merged_table_id: request.primary_table_id,
      original_table_ids: request.table_ids,
      combined_capacity,
      created_order_id: `order_merged_${Date.now()}`,
      success: true,
      message: `Successfully merged ${request.table_ids.length} tables`,
    };
  }

  async splitTable(request: SplitTableRequest): Promise<SplitTableResult> {
    await this.simulateDelay();

    // Simulate successful split
    const split_orders = request.split_config.splits.map((split, index) => ({
      order_id: `order_split_${Date.now()}_${index}`,
      amount: split.amount,
      payment_status: split.payment_status,
    }));

    return {
      original_order_id: request.order_id,
      split_orders,
      success: true,
      message: `Successfully split bill into ${split_orders.length} parts`,
    };
  }

  async transferTable(
    request: TransferTableRequest
  ): Promise<TransferTableResult> {
    await this.simulateDelay();

    // Simulate successful transfer
    return {
      source_table_id: request.source_table_id,
      destination_table_id: request.destination_table_id,
      order_id: request.order_id,
      reservation_id: request.reservation_id,
      success: true,
      message: 'Table transfer completed successfully',
    };
  }

  async validateMerge(tableIds: string[]): Promise<MergeValidationResult> {
    await this.simulateDelay();

    const tables = MOCK_TABLES.filter((t) => tableIds.includes(t.id));
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation checks
    if (tables.length < 2) {
      errors.push('At least 2 tables required for merge');
    }

    const unavailableTables = tables.filter(
      (t) =>
        t.status !== TableStatus.AVAILABLE &&
        t.status !== TableStatus.OCCUPIED
    );
    if (unavailableTables.length > 0) {
      errors.push('Some tables are not available for merge');
    }

    const differentAreas = new Set(tables.map((t) => t.area_id));
    if (differentAreas.size > 1) {
      warnings.push('Tables are from different areas');
    }

    const combined_capacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const suggested_primary_table = tables.reduce((prev, current) =>
      prev.capacity > current.capacity ? prev : current
    ).id;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      combined_capacity,
      suggested_primary_table,
    };
  }

  async validateSplit(
    tableId: string,
    splitConfig: SplitConfig
  ): Promise<ValidationResult> {
    await this.simulateDelay();

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation checks
    if (splitConfig.splits.length < 2) {
      errors.push('At least 2 splits required');
    }

    const totalSplitAmount = splitConfig.splits.reduce(
      (sum, s) => sum + s.amount,
      0
    );
    if (Math.abs(totalSplitAmount - splitConfig.total_amount) > 0.01) {
      errors.push('Split amounts do not match total amount');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateTransfer(
    sourceId: string,
    destId: string
  ): Promise<TransferValidationResult> {
    await this.simulateDelay();

    const sourceTable = MOCK_TABLES.find((t) => t.id === sourceId);
    const destTable = MOCK_TABLES.find((t) => t.id === destId);

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!sourceTable) {
      errors.push('Source table not found');
    }

    if (!destTable) {
      errors.push('Destination table not found');
    }

    const destination_available =
      destTable?.status === TableStatus.AVAILABLE;
    if (!destination_available) {
      errors.push('Destination table is not available');
    }

    const capacity_compatible =
      !sourceTable ||
      !destTable ||
      destTable.capacity >= sourceTable.capacity;
    if (!capacity_compatible) {
      warnings.push(
        'Destination table has smaller capacity than source table'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      capacity_compatible,
      destination_available,
    };
  }
}
