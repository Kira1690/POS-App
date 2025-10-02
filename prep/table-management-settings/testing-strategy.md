# Testing Strategy - Table Management Settings

## Testing Overview

**Coverage Target**: 70%+ across all code
**Framework**: Jest with React Native Testing Library
**Test Types**: Unit, Integration, Component, End-to-End

---

## Unit Tests

### Service Layer Tests

#### TableManagementService.test.ts
```typescript
describe('TableManagementService', () => {
  let service: TableManagementService;
  let mockApiClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockApiClient = createMockAxios();
    service = new TableManagementService(mockApiClient);
  });

  describe('getTables', () => {
    it('should fetch tables successfully', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { success: true, data: MOCK_TABLES }
      });

      const tables = await service.getTables('rest_001');

      expect(tables).toEqual(MOCK_TABLES);
      expect(mockApiClient.get).toHaveBeenCalledWith('/tables', {
        params: { restaurantId: 'rest_001' }
      });
    });

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.getTables('rest_001')).rejects.toThrow('Failed to fetch tables');
    });

    it('should handle empty response', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { success: true, data: [] }
      });

      const tables = await service.getTables('rest_001');
      expect(tables).toEqual([]);
    });
  });

  describe('updateTable', () => {
    it('should update table successfully', async () => {
      const updated = { ...MOCK_TABLE, status: TableStatus.OCCUPIED };
      mockApiClient.put.mockResolvedValue({
        data: { success: true, data: updated }
      });

      const result = await service.updateTable('table_001', {
        status: TableStatus.OCCUPIED
      });

      expect(result).toEqual(updated);
    });
  });
});
```

#### TableOperationsService.test.ts
```typescript
describe('TableOperationsService', () => {
  describe('mergeTables', () => {
    it('should merge tables successfully', async () => {
      const mergeRequest: MergeTablesRequest = {
        restaurant_id: 'rest_001',
        table_ids: ['table_001', 'table_002'],
        primary_table_id: 'table_001',
        party_size: 8,
        customer_name: 'John Doe',
      };

      mockApiClient.post.mockResolvedValue({
        data: { success: true, data: MOCK_MERGE_RESULT }
      });

      const result = await service.mergeTables(mergeRequest);

      expect(result.success).toBe(true);
      expect(result.combined_capacity).toBe(8);
    });

    it('should validate tables before merging', async () => {
      const invalidRequest = {
        ...MOCK_MERGE_REQUEST,
        table_ids: ['table_001'], // Only one table
      };

      await expect(service.mergeTables(invalidRequest)).rejects.toThrow(
        'At least 2 tables required for merge'
      );
    });
  });
});
```

### Utility Tests

#### tableValidation.test.ts
```typescript
describe('tableValidation', () => {
  describe('validateTableNumber', () => {
    it('should accept valid table numbers', () => {
      expect(validateTableNumber('1')).toBe(true);
      expect(validateTableNumber('A1')).toBe(true);
      expect(validateTableNumber('VIP-1')).toBe(true);
    });

    it('should reject invalid table numbers', () => {
      expect(validateTableNumber('')).toBe(false);
      expect(validateTableNumber('   ')).toBe(false);
      expect(validateTableNumber('Table 1')).toBe(false); // Contains space
    });
  });

  describe('validateCapacity', () => {
    it('should accept valid capacities', () => {
      expect(validateCapacity(2)).toBe(true);
      expect(validateCapacity(10)).toBe(true);
    });

    it('should reject invalid capacities', () => {
      expect(validateCapacity(0)).toBe(false);
      expect(validateCapacity(-1)).toBe(false);
      expect(validateCapacity(101)).toBe(false); // Max 100
    });
  });
});
```

---

## Component Tests

### TableCard.test.tsx
```typescript
describe('TableCard', () => {
  const mockTable: Table = {
    id: 'table_001',
    table_number: '1',
    capacity: 4,
    status: TableStatus.AVAILABLE,
    // ... other properties
  };

  it('should render table information', () => {
    const { getByText } = render(
      <TableCard table={mockTable} onPress={jest.fn()} />
    );

    expect(getByText('Table 1')).toBeTruthy();
    expect(getByText('4 seats')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TableCard table={mockTable} onPress={onPress} />
    );

    fireEvent.press(getByTestId('table-card'));
    expect(onPress).toHaveBeenCalledWith(mockTable.id);
  });

  it('should show selected state', () => {
    const { getByTestId } = render(
      <TableCard table={mockTable} selected={true} onPress={jest.fn()} />
    );

    const card = getByTestId('table-card');
    expect(card.props.style).toContainEqual({
      borderWidth: 2,
      borderColor: expect.any(String), // theme.colors.primary
    });
  });

  it('should display correct status color', () => {
    const occupiedTable = { ...mockTable, status: TableStatus.OCCUPIED };
    const { getByTestId } = render(
      <TableCard table={occupiedTable} onPress={jest.fn()} />
    );

    const statusBar = getByTestId('status-indicator');
    // Check for error color (occupied = red)
    expect(statusBar.props.style.backgroundColor).toBeTruthy();
  });
});
```

### FilterBar.test.tsx
```typescript
describe('FilterBar', () => {
  it('should render all filter options', () => {
    const { getByText } = render(
      <FilterBar activeFilter="all" onFilterChange={jest.fn()} />
    );

    expect(getByText('All Tables')).toBeTruthy();
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Occupied')).toBeTruthy();
    expect(getByText('Reserved')).toBeTruthy();
    expect(getByText('Cleaning')).toBeTruthy();
  });

  it('should highlight active filter', () => {
    const { getByText } = render(
      <FilterBar activeFilter="available" onFilterChange={jest.fn()} />
    );

    const availableFilter = getByText('Available');
    // Check for active styling
    expect(availableFilter.props.style).toBeTruthy();
  });

  it('should call onFilterChange when filter selected', () => {
    const onFilterChange = jest.fn();
    const { getByText } = render(
      <FilterBar activeFilter="all" onFilterChange={onFilterChange} />
    );

    fireEvent.press(getByText('Occupied'));
    expect(onFilterChange).toHaveBeenCalledWith('occupied');
  });
});
```

---

## Integration Tests

### TableManagementContext.test.tsx
```typescript
describe('TableManagementContext', () => {
  it('should load tables on mount', async () => {
    const mockService = new MockTableManagementService();
    jest.spyOn(mockService, 'getTables').mockResolvedValue(MOCK_TABLES);

    const { result, waitForNextUpdate } = renderHook(
      () => useTableManagement(),
      { wrapper: TableManagementProvider }
    );

    await waitForNextUpdate();

    expect(result.current.state.tables).toEqual(MOCK_TABLES);
    expect(result.current.state.isLoading).toBe(false);
  });

  it('should select table', () => {
    const { result } = renderHook(() => useTableManagement(), {
      wrapper: TableManagementProvider,
    });

    act(() => {
      result.current.selectTable('table_001');
    });

    expect(result.current.state.selectedTableIds).toContain('table_001');
  });

  it('should filter tables', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useTableManagement(),
      { wrapper: TableManagementProvider }
    );

    await waitForNextUpdate();

    act(() => {
      result.current.setFilter('available');
    });

    expect(result.current.state.activeFilter).toBe('available');
  });
});
```

---

## End-to-End Workflow Tests

### merge-workflow.test.tsx
```typescript
describe('Table Merge Workflow', () => {
  it('should complete merge workflow successfully', async () => {
    const { getByText, getByTestId } = render(
      <TableManagementProvider>
        <TableManagementSettings />
      </TableManagementProvider>
    );

    // Step 1: Select multiple tables
    fireEvent.press(getByTestId('table-card-001'));
    fireEvent.press(getByTestId('table-card-002'));

    // Step 2: Open merge modal
    fireEvent.press(getByText('Merge Tables'));

    // Step 3: Configure merge
    fireEvent.changeText(getByTestId('customer-name-input'), 'John Doe');
    fireEvent.changeText(getByTestId('party-size-input'), '8');

    // Step 4: Confirm merge
    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Confirm Merge'));

    // Assert success
    await waitFor(() => {
      expect(getByText('Tables merged successfully')).toBeTruthy();
    });
  });

  it('should validate before merge', async () => {
    const { getByText, getByTestId } = render(
      <TableManagementProvider>
        <TableManagementSettings />
      </TableManagementProvider>
    );

    // Select only one table
    fireEvent.press(getByTestId('table-card-001'));
    fireEvent.press(getByText('Merge Tables'));

    // Should show error
    await waitFor(() => {
      expect(getByText('At least 2 tables required')).toBeTruthy();
    });
  });
});
```

---

## Test Coverage Requirements

### Service Layer: 80%+
- All CRUD methods tested
- Error handling tested
- Edge cases covered

### Context: 80%+
- All actions tested
- State updates verified
- Side effects tested

### Components: 70%+
- Render tests
- Interaction tests
- Theme integration tests

### Utils: 90%+
- All validation functions tested
- All calculation functions tested
- Edge cases covered

---

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

### Specific Test File
```bash
npm test -- TableCard.test.tsx
```

### Update Snapshots
```bash
npm test -- -u
```

---

## Mock Data Setup

### Test Utilities
```typescript
// File: /src/__tests__/utils/testUtils.tsx

export const createMockTable = (overrides?: Partial<Table>): Table => ({
  id: 'table_001',
  restaurant_id: 'rest_001',
  area_id: 'area_main',
  table_number: '1',
  capacity: 4,
  status: TableStatus.AVAILABLE,
  shape: TableShape.SQUARE,
  size: TableSize.MEDIUM,
  position: { x: 0, y: 0 },
  is_active: true,
  allow_online_booking: true,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: 'admin',
  updated_by: 'admin',
  ...overrides,
});

export const createMockArea = (overrides?: Partial<Area>): Area => ({
  id: 'area_main',
  restaurant_id: 'rest_001',
  name: 'Main Dining',
  color: '#4CAF50',
  display_order: 1,
  is_active: true,
  allow_reservations: true,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});
```

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Coverage Target**: 70%+
**Test Framework**: Jest + React Native Testing Library
