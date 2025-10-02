# Integration Plan - Table Management Settings

## Integration Overview

This document outlines the step-by-step process for integrating the Table Management Settings system into the existing POS App.

---

## Pre-Integration Checklist

- [ ] All Phase 1-4 components completed
- [ ] All services tested and working
- [ ] Context provider tested
- [ ] Mock data validated
- [ ] All files under 300 lines
- [ ] TypeScript strict mode passing
- [ ] ESLint warnings resolved

---

## Step 1: Context Provider Integration

### 1.1 Add to App.tsx

**File**: `/src/App.tsx`

**Action**: Wrap app with TableManagementProvider

```typescript
// BEFORE
import { AuthProvider } from '@/context/auth/AuthContext';
import { TableProvider } from '@/context/table/TableContext';

export default function App() {
  return (
    <AuthProvider>
      <TableProvider>
        {/* App content */}
      </TableProvider>
    </AuthProvider>
  );
}

// AFTER
import { AuthProvider } from '@/context/auth/AuthContext';
import { TableProvider } from '@/context/table/TableContext';
import { TableManagementProvider } from '@/context/table-management'; // ADD THIS

export default function App() {
  return (
    <AuthProvider>
      <TableProvider>
        <TableManagementProvider>  {/* ADD THIS */}
          {/* App content */}
        </TableManagementProvider>
      </TableProvider>
    </AuthProvider>
  );
}
```

**Lines Added**: ~3
**Testing**: App should still load without errors

---

## Step 2: Settings Screen Integration

### 2.1 Add Table Management Category

**File**: `/src/screens/settings/SettingsScreen.tsx`

**Action 1**: Add category to `SETTINGS_CATEGORIES` array

```typescript
// BEFORE
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    label: 'Restaurant Profile',
    icon: '🏪',
    iconBackground: '#FF453A',
  },
  // ... other categories
  {
    id: 'help_support',
    label: 'Help & Support',
    icon: '❓',
    iconBackground: '#8E8E93',
  },
];

// AFTER - Add table_management category
const SETTINGS_CATEGORIES: AppleSidebarItem[] = [
  {
    id: 'restaurant_profile',
    label: 'Restaurant Profile',
    icon: '🏪',
    iconBackground: '#FF453A',
  },
  // ... other categories
  {
    id: 'table_management',  // ADD THIS ENTRY
    label: 'Table Management',
    icon: '🪑',
    iconBackground: '#FF9500', // Apple orange
  },
  {
    id: 'help_support',
    label: 'Help & Support',
    icon: '❓',
    iconBackground: '#8E8E93',
  },
];
```

**Action 2**: Import TableManagementSettings component

```typescript
// At top of file, add import
import TableManagementSettings from './components/TableManagementSettings';
```

**Action 3**: Add to `renderCategoryContent()` switch

```typescript
// BEFORE
const renderCategoryContent = () => {
  switch (activeCategory) {
    case 'restaurant_profile':
      return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
    // ... other cases
    case 'help_support':
      return <HelpSupportSettings onChangesDetected={setHasUnsavedChanges} />;
    default:
      return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
  }
};

// AFTER - Add table_management case
const renderCategoryContent = () => {
  switch (activeCategory) {
    case 'restaurant_profile':
      return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
    // ... other cases
    case 'table_management':  // ADD THIS CASE
      return <TableManagementSettings onChangesDetected={setHasUnsavedChanges} />;
    case 'help_support':
      return <HelpSupportSettings onChangesDetected={setHasUnsavedChanges} />;
    default:
      return <RestaurantProfileSettings onChangesDetected={setHasUnsavedChanges} />;
  }
};
```

**Lines Added**: ~10 total
**Testing**: Navigate to Settings → Table Management should load

---

## Step 3: TypeScript Configuration

### 3.1 Verify Path Aliases

**File**: `tsconfig.json`

**Verify these entries exist**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/context/*": ["./src/context/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### 3.2 Add New Types Export

**File**: `/src/types/index.ts`

```typescript
// Add export for table management types
export * from './table-management.types';
```

---

## Step 4: Service Configuration

### 4.1 Configure API Client

**File**: `/src/services/api/apiClient.ts`

**Verify base URL configured**:
```typescript
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000',
  timeout: 10000,
});
```

### 4.2 Register Services

**File**: `/src/services/index.ts`

```typescript
// Add exports for table management services
export * from './table-management';
```

---

## Step 5: Navigation Configuration (if needed)

If Table Management needs its own navigation stack:

**File**: `/src/navigation/types.ts`

```typescript
export type SettingsStackParamList = {
  Settings: undefined;
  TableManagement: undefined; // Add if needed
  // ... other screens
};
```

---

## Step 6: Mock vs Real API Configuration

### Development Mode (Mock Data)

**File**: `/src/context/table-management/TableManagementProvider.tsx`

```typescript
// Use mock services for development
const USE_MOCK_DATA = __DEV__; // or process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true'

const tableService = USE_MOCK_DATA
  ? new MockTableManagementService()
  : new TableManagementService(apiClient);
```

### Production Mode (Real API)

```typescript
// Always use real services in production
const tableService = new TableManagementService(apiClient);
const areaService = new AreaService(apiClient);
const operationsService = new TableOperationsService(apiClient);
```

---

## Step 7: Environment Variables

### .env File

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_USE_MOCK_DATA=true

# WebSocket Configuration
EXPO_PUBLIC_WS_URL=ws://localhost:4000/ws
```

### app.json

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:4000",
      "useMockData": true
    }
  }
}
```

---

## Step 8: Testing Integration

### 8.1 Manual Testing Checklist

- [ ] Navigate to Settings screen
- [ ] Click on Table Management category
- [ ] TableManagementSettings component loads
- [ ] Floor plan displays mock tables
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] Can select tables
- [ ] Table details panel shows info
- [ ] Can open merge modal
- [ ] Can open split modal
- [ ] Can open transfer modal
- [ ] Can open table configuration form
- [ ] Can create new table
- [ ] Can edit existing table
- [ ] Can delete table
- [ ] Area management works
- [ ] Settings save correctly
- [ ] Back navigation works
- [ ] Theme switching works (light/dark)

### 8.2 Automated Tests

```bash
# Run integration tests
npm test -- integration/table-management.test.tsx

# Run E2E tests
npm test -- e2e/table-management-workflow.test.tsx
```

---

## Step 9: Performance Validation

### 9.1 Performance Checklist

- [ ] Initial render < 16ms
- [ ] Table grid scrolls smoothly (60fps)
- [ ] Filter updates < 100ms
- [ ] Search debounce working (300ms)
- [ ] Modal animations smooth
- [ ] Form input responsive
- [ ] No memory leaks
- [ ] Handles 50+ tables efficiently

### 9.2 Performance Profiling

```bash
# Profile React components
npx react-native-performance-monitor

# Check bundle size
npx react-native-bundle-visualizer
```

---

## Step 10: Error Handling Verification

### 10.1 Error Scenarios to Test

- [ ] Network error (no internet)
- [ ] API timeout
- [ ] 401 Unauthorized
- [ ] 404 Not Found
- [ ] 500 Server Error
- [ ] Invalid data format
- [ ] WebSocket disconnection
- [ ] Context not provided
- [ ] Service initialization failure

### 10.2 Error Boundary Testing

```typescript
// Manually trigger error to test boundary
throw new Error('Test error boundary');
```

---

## Step 11: Accessibility Testing

### 11.1 Accessibility Checklist

- [ ] All interactive elements have labels
- [ ] Touch targets >= 56px
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader support
- [ ] Keyboard navigation (web)
- [ ] Focus indicators visible
- [ ] Error messages announced

---

## Step 12: Documentation Updates

### 12.1 Update CLAUDE.md

**File**: `/CLAUDE.md` (root)

```markdown
## Table Management Settings (Added 2025-10-02)

### Location
`/POS-App/src/screens/settings/components/TableManagementSettings.tsx`

### Purpose
Comprehensive table configuration and management system for restaurant floor plans.

### Features
- Visual floor plan editor
- Table CRUD operations
- Merge, split, transfer operations
- Area management
- Reservation integration
- Real-time updates

### Documentation
`/POS-App/prep/table-management-settings/`

### Status
✅ Complete and integrated
```

### 12.2 Update Project README

Add to project README:
- Feature description
- Usage instructions
- Screenshots (optional)

---

## Step 13: Git Workflow

### 13.1 Create Feature Branch

```bash
git checkout -b feature/table-management-settings
```

### 13.2 Commit Strategy

```bash
# Phase 1
git add src/types src/services src/context
git commit -m "feat: Add table management foundation (types, services, context)"

# Phase 2
git add src/components/table-management/floor-plan
git add src/components/table-management/table-card
git commit -m "feat: Add floor plan view components"

# Phase 3
git add src/components/table-management/operations
git commit -m "feat: Add table operations (merge, split, transfer)"

# Phase 4
git add src/components/table-management/configuration
git commit -m "feat: Add table configuration and settings"

# Phase 5 - Integration
git add src/screens/settings
git add src/App.tsx
git commit -m "feat: Integrate table management into settings"

# Tests
git add src/**/__tests__
git commit -m "test: Add comprehensive tests for table management"
```

### 13.3 Pull Request

```bash
git push origin feature/table-management-settings

# Create PR with description:
# - Feature overview
# - Changes summary
# - Testing performed
# - Screenshots/videos
# - Breaking changes (if any)
```

---

## Step 14: Deployment Checklist

### 14.1 Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript strict mode passing
- [ ] ESLint no warnings
- [ ] Bundle size acceptable
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Code review approved

### 14.2 Deployment Steps

```bash
# 1. Merge to main
git checkout main
git merge feature/table-management-settings

# 2. Tag release
git tag v1.5.0-table-management
git push origin v1.5.0-table-management

# 3. Build for production
npm run build:ios
npm run build:android

# 4. Deploy to staging
# (staging deployment commands)

# 5. QA testing on staging

# 6. Deploy to production
# (production deployment commands)
```

---

## Step 15: Post-Deployment Monitoring

### 15.1 Monitoring Checklist

- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Monitor API usage
- [ ] Monitor WebSocket connections

### 15.2 Metrics to Track

- Feature adoption rate
- Average session duration in Table Management
- Most used operations (merge/split/transfer)
- Error frequency by operation
- Performance metrics (render time, API latency)

---

## Rollback Plan

If integration causes issues:

### Quick Rollback

```bash
# 1. Revert integration commit
git revert <commit-hash>

# 2. Remove from SettingsScreen
# Comment out table_management category

# 3. Remove provider from App.tsx
# Comment out TableManagementProvider wrapper

# 4. Redeploy
npm run build && deploy
```

### Full Rollback

```bash
# 1. Checkout previous stable branch
git checkout v1.4.0-stable

# 2. Create hotfix branch
git checkout -b hotfix/remove-table-management

# 3. Deploy hotfix
npm run build && deploy
```

---

## Success Criteria

### Technical
- ✅ All components render without errors
- ✅ All API calls working (or mocks working)
- ✅ Theme integration complete
- ✅ Performance targets met
- ✅ Test coverage >= 70%
- ✅ No TypeScript errors
- ✅ No ESLint warnings

### Functional
- ✅ Users can create/edit/delete tables
- ✅ Users can manage dining areas
- ✅ Users can perform table operations
- ✅ Real-time updates working
- ✅ Settings persist correctly

### UX
- ✅ Interface intuitive and easy to use
- ✅ No confusing error messages
- ✅ Loading states clear
- ✅ Responsive on tablet and mobile
- ✅ Theme switching works seamlessly

---

**Document Status**: Complete
**Last Updated**: 2025-10-02
**Integration Complexity**: Medium
**Estimated Integration Time**: 2-3 hours
