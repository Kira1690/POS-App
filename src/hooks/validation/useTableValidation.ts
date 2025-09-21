/**
 * Table Validation Hook
 * Uses TableService for validation operations
 * Follows Single Responsibility Principle - table validation only
 * Uses Dependency Injection - delegates to services
 */

import { useCallback } from 'react';
import { useTableService } from '@/hooks/services';
import { Table, CreateTableRequest, UpdateTableStatusRequest } from '@/types/table.types';
import { TableStatus } from '@/types/common.types';

export interface TableValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UseTableValidationResult {
  validateTable: (table: Table) => TableValidationResult;
  validateTableCreation: (request: CreateTableRequest) => TableValidationResult;
  validateStatusChange: (table: Table, newStatus: TableStatus) => TableValidationResult;
  validatePartySize: (partySize: number, table: Table) => TableValidationResult;
  validateTableCapacity: (capacity: number) => TableValidationResult;
}

/**
 * Hook for table validation operations
 * Delegates to TableService via dependency injection
 * 
 * @returns Validation functions that use DI services
 */
export function useTableValidation(): UseTableValidationResult {
  // Use DI service - no business logic duplication
  const tableService = useTableService();

  // Validate complete table
  const validateTable = useCallback((table: Table): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!table.id || table.id.trim() === '') {
      errors.push('Table ID is required');
    }

    if (!table.table_number || table.table_number.trim() === '') {
      errors.push('Table number is required');
    }

    if (table.capacity <= 0) {
      errors.push('Table capacity must be greater than zero');
    }

    if (table.capacity > 20) {
      warnings.push('Very large table capacity - verify configuration');
    }

    // Table number validation
    const tableNumber = parseInt(table.table_number);
    if (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 999) {
      errors.push('Table number must be between 1 and 999');
    }

    // Service area validation
    if (!table.service_area || table.service_area.trim() === '') {
      warnings.push('Service area not specified - may affect efficiency');
    }

    // Status validation
    const validStatuses = Object.values(TableStatus);
    if (!validStatuses.includes(table.status)) {
      errors.push('Invalid table status');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate table creation request
  const validateTableCreation = useCallback((request: CreateTableRequest): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.table_number || request.table_number.trim() === '') {
      errors.push('Table number is required');
    }

    if (request.capacity <= 0) {
      errors.push('Table capacity must be greater than zero');
    }

    if (request.capacity > 20) {
      warnings.push('Large table capacity - ensure space is available');
    }

    if (request.capacity < 2) {
      warnings.push('Single-seat table - consider bar seating instead');
    }

    if (!request.service_area || request.service_area.trim() === '') {
      warnings.push('Service area should be specified for optimal service');
    }

    // Table number format validation
    const tableNumber = parseInt(request.table_number);
    if (isNaN(tableNumber) || tableNumber < 1) {
      errors.push('Table number must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate status change
  const validateStatusChange = useCallback((table: Table, newStatus: TableStatus): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (table.status === newStatus) {
      warnings.push('Table is already in the requested status');
      return { isValid: true, errors, warnings };
    }

    // Define valid transitions
    const validTransitions: Record<TableStatus, TableStatus[]> = {
      [TableStatus.AVAILABLE]: [TableStatus.OCCUPIED, TableStatus.RESERVED, TableStatus.OUT_OF_SERVICE],
      [TableStatus.OCCUPIED]: [TableStatus.AVAILABLE],
      [TableStatus.RESERVED]: [TableStatus.OCCUPIED, TableStatus.AVAILABLE],
      [TableStatus.OUT_OF_SERVICE]: [TableStatus.AVAILABLE],
    };

    const allowedTransitions = validTransitions[table.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      errors.push(`Cannot change status from ${table.status} to ${newStatus}`);
    }

    // Business rule checks
    if (newStatus === TableStatus.OCCUPIED && table.capacity === 0) {
      errors.push('Cannot occupy a table with zero capacity');
    }

    if (newStatus === TableStatus.RESERVED) {
      // Check if table needs cleaning
      if (table.last_occupied_at && !table.last_cleaned_at) {
        warnings.push('Table may need cleaning before reservation');
      }
    }

    if (newStatus === TableStatus.OUT_OF_SERVICE) {
      if (table.status === TableStatus.OCCUPIED) {
        warnings.push('Taking occupied table out of service - verify with management');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate party size for table
  const validatePartySize = useCallback((partySize: number, table: Table): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (partySize <= 0) {
      errors.push('Party size must be greater than zero');
    }

    if (partySize > 20) {
      errors.push('Party size too large for standard seating');
    }

    if (partySize > table.capacity) {
      errors.push(`Party size (${partySize}) exceeds table capacity (${table.capacity})`);
    }

    if (partySize < table.capacity / 2) {
      warnings.push('Party size is much smaller than table capacity - consider smaller table');
    }

    if (table.status !== TableStatus.AVAILABLE) {
      errors.push(`Table is ${table.status} and cannot accommodate new party`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  // Validate table capacity
  const validateTableCapacity = useCallback((capacity: number): TableValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (capacity <= 0) {
      errors.push('Table capacity must be greater than zero');
    }

    if (capacity > 20) {
      warnings.push('Very large table capacity - ensure adequate space');
    }

    if (capacity === 1) {
      warnings.push('Single-seat capacity - bar seating may be more appropriate');
    }

    if (capacity > 12) {
      warnings.push('Large capacity table - may require special service arrangements');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  return {
    validateTable,
    validateTableCreation,
    validateStatusChange,
    validatePartySize,
    validateTableCapacity,
  };
}

/**
 * Helper hook for quick table validation checks
 * Provides simplified boolean results for UI components
 */
export function useTableValidationChecks() {
  const validation = useTableValidation();

  const isValidTable = useCallback((table: Table): boolean => {
    const result = validation.validateTable(table);
    return result.isValid;
  }, [validation]);

  const canChangeStatus = useCallback((table: Table, newStatus: TableStatus): boolean => {
    const result = validation.validateStatusChange(table, newStatus);
    return result.isValid;
  }, [validation]);

  const canAccommodateParty = useCallback((partySize: number, table: Table): boolean => {
    const result = validation.validatePartySize(partySize, table);
    return result.isValid;
  }, [validation]);

  const isValidCapacity = useCallback((capacity: number): boolean => {
    const result = validation.validateTableCapacity(capacity);
    return result.isValid;
  }, [validation]);

  return {
    isValidTable,
    canChangeStatus,
    canAccommodateParty,
    isValidCapacity,
  };
}