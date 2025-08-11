# Mock Implementations Tracking

## Overview
This document tracks all mock implementations created for UI-only development. These should be removed or replaced when backend integration is complete.

## Current Status: RUNTIME ERROR RESOLVED
- **Issue**: MockTableApiClient runtime import error in Metro bundler
- **Root Cause**: Constructor was calling methods during class instantiation
- **Solution**: Created FixedMockTableApiClient with static data, no constructor method calls
- **Status**: Now using FixedMockTableApiClient with full 25-table dataset

## Mock Services Created

### 1. Table API Services
**Location**: `src/services/api/table/`

#### FixedMockTableApiClient.ts ✅ WORKING
- **Purpose**: Mock table management API calls (fixed version)
- **Status**: Currently active - resolved import issues
- **Features**:
  - 25 mock tables with different statuses (static data)
  - Simulated API delay (300ms)
  - Full CRUD operations for tables
  - Reservation management mock
  - Console logging for debugging
  - No constructor method calls (prevents Metro bundler issues)

#### MockTableApiClient.ts ❌ DEPRECATED
- **Purpose**: Original mock with constructor issues
- **Status**: Deprecated - caused runtime import error
- **Issue**: Constructor called `this.getRandomStatus()` during instantiation

#### SimpleMockTableApiClient.ts ❌ DEPRECATED
- **Purpose**: Simplified debugging version
- **Status**: Deprecated - replaced by FixedMockTableApiClient

#### MockTableWebSocketService.ts ✅ WORKING
- **Purpose**: Mock real-time table updates
- **Status**: Active
- **Features**:
  - Simulates WebSocket connection
  - Random table status updates every 10 seconds
  - Subscription/unsubscription management
  - Console logging for debugging

### 2. Menu API Services
**Location**: `src/services/api/menu/`

#### MockMenuApiClient.ts ✅ WORKING
- **Purpose**: Mock menu data for UI development
- **Status**: Active
- **Features**:
  - 5 menu categories (BEVERAGES, CHINESE, NON VEG, SPECIAL, VEG)
  - 25+ menu items with realistic prices
  - Search functionality simulation
  - Popular items simulation

### 3. Authentication Services
**Location**: `src/services/auth/`

#### dummyAuthService.ts ✅ WORKING
- **Purpose**: Mock authentication for UI testing
- **Status**: Active (temporary for UI development)
- **Features**:
  - Multiple user roles (staff, kitchen, manager, admin, superadmin)
  - Test credentials for each role
  - Restaurant selection simulation
  - JWT token simulation

## Files Modified for Mock Support

### Service Exports
- `src/services/api/table/index.ts` - Modified to export mock implementations
- `src/services/api/menu/index.ts` - Modified to export mock menu API
- `src/services/auth/authService.ts` - Modified to use dummy auth

### Context Providers
- `src/context/table/TableProvider.tsx` - Updated for mock WebSocket service
- `src/context/table/TableActions.ts` - Updated for mock service integration

### Component Updates
- `src/components/business/table/TableCard.tsx` - Fixed theme access for mock data
- `src/components/business/table/TableGrid.tsx` - Fixed theme access for mock data
- `src/screens/tables/TableManagementScreen.tsx` - Fixed theme access for mock data

## Mock Data Structures

### Table Mock Data
```typescript
{
  id: 'table_1',
  restaurant_id: 'rest_001',
  table_number: 'Table1',
  capacity: 4,
  status: TableStatus.AVAILABLE,
  location: 'Main Floor',
  section: 'A',
  created_at: '2025-07-20T00:00:00Z',
  updated_at: '2025-07-20T00:00:00Z',
  is_active: true,
  is_deleted: false,
}
```

### Menu Mock Data
```typescript
{
  id: 'item_1',
  restaurant_id: 'rest_001',
  category_id: 'cat_1',
  name: 'Hot Coffee',
  description: 'Freshly brewed hot coffee',
  price: 50,
  is_available: true,
  created_at: '2025-07-20T00:00:00Z',
  updated_at: '2025-07-20T00:00:00Z',
}
```

### Auth Mock Data
```typescript
// Staff Login
{ employeeId: 'EMP001', password: 'staff123', role: 'restaurant_staff' }

// Manager Login  
{ email: 'manager@foodcorner.com', password: 'manager123', role: 'manager' }
```

## Removal Instructions

### When Backend is Ready:

1. **Remove Mock Files**:
   ```bash
   rm src/services/api/table/MockTableApiClient.ts
   rm src/services/api/table/SimpleMockTableApiClient.ts
   rm src/services/api/table/MockTableWebSocketService.ts
   rm src/services/api/menu/MockMenuApiClient.ts
   rm src/services/auth/dummyAuthService.ts
   ```

2. **Update Service Exports**:
   - Update `src/services/api/table/index.ts` to use real implementations
   - Update `src/services/api/menu/index.ts` to use real implementations
   - Update `src/services/auth/authService.ts` to use real auth

3. **Remove Mock Constants**:
   - Remove `src/constants/dummyData.ts`
   - Update `src/constants/auth.ts` with real endpoints

4. **Update Environment Variables**:
   - Set real API URLs in environment configuration
   - Remove mock feature flags

## Current Issues to Resolve

### High Priority
1. **MockTableApiClient Import Error**: 
   - Runtime error preventing app from loading
   - Temporarily using SimpleMockTableApiClient
   - Need to investigate class instantiation or import chain

### Medium Priority
1. **Type Safety**: Some mock implementations use `any` types
2. **Data Consistency**: Mock data should match real API structure exactly
3. **Performance**: Mock delays should be configurable

## Testing Status

### ✅ Working Components
- Table grid display with mock data
- Theme system integration
- Menu category display
- Authentication flow with dummy credentials

### ⚠️ Needs Testing
- Real-time table updates simulation
- Order creation flow with mock data
- WebSocket subscription/unsubscription

### ❌ Known Issues
- MockTableApiClient runtime import error
- Some TypeScript type mismatches in auth service
- Menu service import path issues

## Notes
- All mock implementations include console logging for debugging
- Mock data includes realistic restaurant data for "The Food Corner" (rest_001)
- WebSocket simulation runs every 10 seconds when connected
- Authentication mock includes all required user roles for testing UI