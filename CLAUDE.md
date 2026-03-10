# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL ERROR PREVENTION - READ FIRST

### "Cannot read property 'colors' of undefined" Error

**THIS ERROR HAS CAUSED EXTREME HAVOC IN THE PAST. ALWAYS CHECK THIS FIRST.**

#### Error Message:
```
ERROR [runtime not ready]: TypeError: Cannot read property 'colors' of undefined
```

#### Root Causes (CHECK ALL):

1. **Missing Theme Export** (MOST COMMON)
   - Components import `{ theme }` from `@/constants/theme`
   - But `/src/constants/theme.ts` doesn't export `theme`
   - **FIX**: Add `export const theme = ProfessionalTheme;` to theme.ts

2. **Missing ThemeProvider Wrapper**
   - Component uses `useTheme()` hook but isn't wrapped in ThemeProvider
   - **FIX**: Ensure App.tsx has ThemeProvider wrapping NavigationContainer

3. **Export/Import Pattern Mismatch**
   - Component uses `export const` but imported with `export default`
   - Or vice versa
   - **FIX**: Match export/import patterns (use default exports for settings components)

4. **StyleSheet Outside Component**
   - StyleSheet.create() at module level accessing theme
   - Theme not available at module parse time
   - **FIX**: Move StyleSheet.create() inside component after useTheme()

#### Diagnostic Steps:

1. **Check theme.ts exports:**
   ```bash
   grep "export.*theme" src/constants/theme.ts
   ```
   Should show: `export const theme = ProfessionalTheme;`

2. **Check component imports:**
   ```bash
   grep "import.*theme" src/screens/settings/components/*.tsx
   ```
   Verify all imports match available exports

3. **Check App.tsx provider chain:**
   ```bash
   grep -A10 "ThemeProvider" App.tsx
   ```
   Verify ThemeProvider wraps all components

4. **Check for module-level StyleSheet:**
   ```bash
   grep -B5 "const styles = StyleSheet.create" src/screens/settings/components/*.tsx
   ```
   Should be inside component function, not at module level

#### Quick Fix Checklist:

- [ ] Add `export const theme = ProfessionalTheme;` to `/src/constants/theme.ts`
- [ ] Kill all Metro bundlers: `pkill -9 -f "expo\|metro"`
- [ ] Clear all caches: `rm -rf node_modules/.cache .expo`
- [ ] Restart: `bun expo start --clear`
- [ ] If still failing, check provider chain in App.tsx
- [ ] If still failing, check export/import patterns

#### Prevention Rules:

1. **ALWAYS** export `theme` from theme.ts for backward compatibility
2. **NEVER** use StyleSheet.create() at module level with theme colors
3. **ALWAYS** use default exports for settings components
4. **ALWAYS** wrap app in ThemeProvider before any theme-consuming components

---

## CRITICAL CODING RULES - MUST FOLLOW

### 🚨 NEVER VIOLATE THESE RULES
1. **SOLID Principles**: Every class/function has ONE responsibility. Open for extension, closed for modification.
2. **No Over-Engineering**: Write the simplest solution that works. Don't add features "just in case".
3. **No `any` Types**: Use proper TypeScript typing. Use `unknown` if type is truly unknown.
4. **Performance First**: Component render time < 16ms. Use React.memo, useMemo, useCallback appropriately.
5. **Security**: NEVER log sensitive data. NEVER hardcode secrets. ALWAYS validate inputs.

### 📏 Component Rules
- Maximum 300 lines per component file
- Break into smaller components at 200+ lines
- Props interface must be explicit and typed
- No inline functions in JSX (performance rule)
- Use FlatList for 10+ items, always optimize with proper props

### 🔧 Service Layer Rules
- One service class per microservice/domain
- All API calls go through service layer only
- Services return typed responses only
- Error handling in service layer, not components
- No direct API calls from components

### 🎯 State Management Rules
- Context API only for truly global state
- Local state (useState) for component-specific data
- No prop drilling beyond 2 levels
- State updates must be immutable
- No direct state mutation ever

### 🏗️ Architecture & Integration Rules
- **interfaces/ folder**: All service and client interfaces
- **types/ folder**: All TypeScript type definitions
- **Dependency Injection**: Use constructor injection for services
- **Circular Dependencies**: NEVER create circular dependencies, use dependency injection
- **API Integration**: All API calls through gateway only (port 4000)
- **Service Composition**: Large services composed of smaller, focused services
- **Error Boundaries**: Implement proper error boundaries for API failures
- **Token Management**: Centralized token storage and refresh logic

### 📦 File Organization Rules (STRICT)
- **Maximum File Size**: 300 lines per file (components), 200 lines (services)
- **Folder Structure**: Group by feature, not by file type
- **Index Files**: Use index.ts files for clean exports
- **Naming Convention**: PascalCase for components, camelCase for services/hooks
- **Import Organization**: Group imports (React, external libs, internal)
- **Export Strategy**: Named exports preferred over default exports

## 🎨 UI ARCHITECTURE & THEME SYSTEM RULES (MANDATORY)

### 🚨 CRITICAL UI CONSISTENCY RULES - NEVER VIOLATE

#### **Theme Hook Pattern (REQUIRED)**
```typescript
// ✅ CORRECT: Always use useTheme hook at component root
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const MyComponent: React.FC<Props> = ({ ...props }) => {
  const { theme } = useTheme(); // MUST be at component root

  const styles = StyleSheet.create({
    // Styles INSIDE component to access theme
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
  });

  return <View style={styles.container}>...</View>;
};

// ❌ WRONG: Never use ProfessionalTheme or external imports
import { ProfessionalTheme } from '@/constants/theme'; // FORBIDDEN
```

#### **Component Structure Pattern (MANDATORY)**
```typescript
// ✅ REQUIRED STRUCTURE: Follow this exact pattern
export const ComponentName: React.FC<Props> = (props) => {
  // 1. Theme hook FIRST
  const { theme } = useTheme();

  // 2. State and hooks
  const [state, setState] = useState();

  // 3. Event handlers and logic
  const handleAction = () => { /* ... */ };

  // 4. StyleSheet AFTER theme hook
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      // ... all styles use theme variables
    },
  });

  // 5. JSX render
  return <View style={styles.container}>...</View>;
};
```

#### **Color Reference Standards (STRICT)**
```typescript
// ✅ CORRECT: Use standardized theme color references
theme.colors.surface          // Background surfaces
theme.colors.surfaceLight     // Light background surfaces
theme.colors.onSurface        // Text on surfaces
theme.colors.onSurfaceSecondary // Secondary text
theme.colors.primary          // Primary brand color
theme.colors.success          // Success states
theme.colors.error            // Error states
theme.colors.outline          // Borders and dividers

// ✅ CORRECT: Spacing and sizing
theme.spacing.xs, theme.spacing.sm, theme.spacing.md, theme.spacing.lg
theme.borderRadius.sm, theme.borderRadius.md, theme.borderRadius.xl
theme.typography.h1, theme.typography.h2, theme.typography.body1

// ❌ FORBIDDEN: Never use hardcoded values
backgroundColor: '#ffffff'     // FORBIDDEN
color: '#000000'              // FORBIDDEN
borderRadius: 8               // FORBIDDEN - use theme.borderRadius.md
padding: 16                   // FORBIDDEN - use theme.spacing.md
```

#### **Automatic Rejection Triggers**
- **ProfessionalTheme import**: Automatic code rejection
- **Hardcoded colors**: Automatic code rejection
- **External StyleSheet with theme**: Automatic code rejection
- **Missing useTheme hook**: Automatic code rejection

## Development Commands

### React Native with Expo
```bash
npm start                    # Start Metro bundler
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS device/simulator
npm run web                 # Run on web browser
npm test                    # Run Jest tests
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript type checking
```

### MANDATORY Pre-Commit Checks
```bash
npm test                     # Tests must pass
npm run type-check           # No TypeScript errors
npm run lint                 # No ESLint errors
```

## Testing Credentials (TEMPORARY - FOR UI DEVELOPMENT)

⚠️ **IMPORTANT**: These are temporary dummy credentials for UI testing only. Remove when backend is integrated.

### Staff Login (Employee ID + Password)
- **Restaurant Staff**: `EMP001` / `staff123` (John Doe - The Food Corner)
- **Kitchen Staff**: `CHEF001` / `kitchen123` (Chef Mike Wilson - The Food Corner)

### Manager Login (Email + Password)
- **Manager**: `manager@foodcorner.com` / `manager123` (Alice Johnson - The Food Corner)
- **Admin**: `admin@foodcorner.com` / `admin123` (David Admin - The Food Corner)
- **Superadmin**: `superadmin@foodpos.com` / `super123` (System Superadmin)

### Test Restaurant
- **The Food Corner** (ID: rest_001) - 123 Main Street, City, State 12345 - +1 (555) 123-4567

**Files to Remove When Integrating Backend:**
- `src/constants/dummyData.ts`
- `src/services/auth/dummyAuthService.ts`
- Update `src/services/auth/authService.ts` to use real AuthService

## Architecture Overview

This is a comprehensive Point of Sale (POS) React Native application built with Expo SDK 53 and TypeScript, designed to integrate with a 13-microservice backend architecture for complete restaurant operations management.

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript with strict mode enabled
- **Navigation**: React Navigation 6 (Stack, Bottom Tabs, Drawer)
- **State Management**: Context API + useReducer pattern
- **HTTP Client**: Axios with interceptors and automatic token refresh
- **UI Library**: React Native Paper
- **Testing**: Jest with React Native Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Required File Structure (MUST FOLLOW)
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic UI components only
│   ├── forms/          # Form components only
│   ├── navigation/     # Navigation components only
│   └── business/       # Domain-specific components only
├── screens/            # Screen components by feature module
│   ├── auth/          # Authentication screens
│   ├── dashboard/     # Dashboard screens
│   ├── orders/        # Order management screens
│   ├── tables/        # Table management screens
│   ├── menu/          # Menu management screens
│   ├── kitchen/       # Kitchen operations screens
│   ├── customers/     # Customer management screens
│   ├── inventory/     # Inventory screens
│   ├── staff/         # Staff management screens
│   ├── reports/       # Reports and analytics screens
│   └── settings/      # Settings screens
├── services/           # API services for microservices
│   ├── api/           # Base API configuration (apiClient.ts)
│   └── [feature]/     # Individual service classes per microservice
├── context/           # Global state management only
├── hooks/             # Custom React hooks only
├── navigation/        # Navigation configuration only
├── utils/             # Pure functions only
├── types/             # TypeScript type definitions only
├── constants/         # App constants and configuration only
└── assets/           # Images, fonts, etc.
```

### Microservices Integration
The app integrates with 13 backend microservices:
- Authentication Service (JWT, RBAC)
- Menu Management Service
- Order Processing Service
- Table Management Service
- Kitchen Operations Service
- Customer Management Service
- Inventory Management Service
- Staff Management Service
- Reports & Analytics Service
- Notification Service
- Integration Service
- Billing & Payment Service
- Print Management Service

### API Client Configuration
- **Base Configuration**: Centralized in `src/services/api/apiClient.ts`
- **Authentication**: Automatic JWT token attachment and refresh
- **Error Handling**: Global interceptors with user-friendly error messages
- **Timeout**: 10 seconds with retry logic
- **Token Management**: Automatic refresh on 401 responses

### Required TypeScript Patterns
```typescript
// REQUIRED: API response typing
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// REQUIRED: Component props typing
interface ComponentProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
}

// REQUIRED: Service method typing
class OrderService {
  async createOrder(order: CreateOrderRequest): Promise<ApiResponse<Order>> {
    // Implementation
  }
}
```

### Path Aliases
The project uses TypeScript path aliases configured in both `tsconfig.json` and `babel.config.js`:
- `@/*` maps to `./src/*`
- `@/components/*` maps to `./src/components/*`
- `@/screens/*` maps to `./src/screens/*`
- `@/services/*` maps to `./src/services/*`

### Role-Based Access Control
- **restaurant_staff**: Basic POS operations
- **kitchen_staff**: Kitchen order management
- **manager**: Restaurant management features
- **admin**: System administration
- **superadmin**: Multi-restaurant management

### State Management Pattern
Uses Context API with useReducer for global state:
- **AuthContext**: User authentication and permissions
- **AppContext**: Global app state and settings
- **OrderContext**: Order management state
- **NotificationContext**: Real-time notifications

### Real-time Features
- WebSocket integration for order updates and notifications
- Real-time order status updates
- Kitchen operation notifications
- Table status changes

### Configuration Files
- **Environment**: Uses `EXPO_PUBLIC_*` variables for configuration
- **API URL**: `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000`)
- **WebSocket**: `EXPO_PUBLIC_WS_URL` (defaults to `ws://localhost:3000/ws`)
- **Feature Flags**: Configured in `src/constants/config.ts`

### Testing Requirements (MANDATORY)
- **Framework**: Jest with `jest-expo` preset
- **Environment**: jsdom
- **Coverage**: 70% minimum threshold for branches, functions, lines, and statements
- **Service Layer**: 100% coverage required
- **Test Files**: Located alongside source files or in `__tests__` directories

### Performance Requirements (STRICT)
```typescript
// REQUIRED: Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// REQUIRED: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// REQUIRED: Use useCallback for functions passed as props
const handlePress = useCallback(() => {
  // Handler logic
}, [dependency]);

// REQUIRED: FlatList optimization for 5+ items
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // REQUIRED if fixed height
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={10}
/>
```

### Code Quality Standards (NON-NEGOTIABLE)
- **TypeScript**: Strict mode enabled, NO `any` types allowed
- **ESLint**: Expo + TypeScript ESLint configuration, zero violations
- **Prettier**: Configured with 80-character line width, single quotes, semicolons
- **Path Resolution**: Module resolver for clean imports
- **File Naming**: PascalCase for components, camelCase for services/hooks

### Security & Compliance Rules (CRITICAL)
- NEVER log sensitive data (tokens, passwords, PII)
- NEVER hardcode secrets or API keys
- ALWAYS validate input data
- ALWAYS sanitize user inputs
- Use secure storage for sensitive data only
- Token validation before every API call

### Error Handling Pattern (REQUIRED)
```typescript
// REQUIRED pattern for all service methods
async serviceMethod(): Promise<Result<T, Error>> {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Service error:', error);
    return { success: false, error: error.message };
  }
}
```

## Code Review Requirements

### Before Committing (MANDATORY)
1. ✅ Run all tests (npm test)
2. ✅ Run type checking (npm run type-check)
3. ✅ Run linting (npm run lint)
4. ✅ Check bundle size impact
5. ✅ Verify no console.logs in production code

### Pull Request Rules
- Maximum 500 lines changed
- Include tests for new features
- Update documentation if needed
- Performance impact assessment
- Security review for sensitive changes

**⚠️ VIOLATION CONSEQUENCES**: Critical rule violations result in automatic code rejection. All rules are non-negotiable.

## Project Status

### Current Implementation Status
- ✅ **COMPLETE**: Authentication, Table Management, Order Management, Payment Processing, Kitchen Operations
- ✅ **COMPLETE**: Console.log cleanup (zero unguarded calls in production; all 235 remaining wrapped in `__DEV__`)
- 🔄 **IN PROGRESS**: Dashboard, Menu Management, Settings
- 📋 **PLANNED**: Detailed project plans available in `/prep/` folder

### Console.log / Performance Fixes (completed)
- Removed or `__DEV__`-guarded all 466 console calls across 85 files
- Zero console output in production builds — eliminates JS bridge serialization overhead and GC pressure on 24/7 POS terminals
- Also fixed: timer/interval leaks (DashboardWebSocketService, TableWebSocketService), unbounded state growth (kitchenReducer, unifiedOrderReducer capped), and useMemo on all major context values
- Android emulator: POS_SmallTablet AVD at 800x1340 px, 213 dpi, 2 GB RAM, GPU host mode (`hw.gpu.mode = host`) — keeps memory stable under 350 MB

### UI Fixes Applied (March 2026)
- **DiscountModal** (`src/screens/orders/modals/DiscountModal.tsx`): Added `useSafeAreaInsets` — "Apply Discount" button no longer hidden under Android system nav bar
- **OrderManagementScreen** (`src/screens/orders/OrderManagementScreen.tsx`): Search bar collapsed to icon in header; expands with autoFocus on tap; closes with × — saves vertical space on small tablets
- **BillPanel** (`src/components/business/order/BillPanel.tsx`): Removed inactive "Add Item" and "Split Bill" buttons; kept only Discount + Print KOT in secondary row — more room for order items list
- **MenuEditorTabs** (`src/screens/settings/components/menuManagement/components/MenuEditorTabs.tsx`): Fixed active tab — color changed from teal/tertiary to `theme.colors.primary`; background changed from white (`surface`) to `theme.colors.primaryContainer`

### Settings - Table Management Enhancement (2025-10-08)
**Status:** PLANNING COMPLETE - READY FOR IMPLEMENTATION
**Location:** `/home/kira/Documents/Github/POS/POS-App/prep/settings-table-management/`

**Key Features Planned:**
- Full CRUD operations for tables and areas (Add/Edit/Delete modals)
- Interactive floor plan editor with drag-and-drop
- Collapsible sidebar (280px to 64px with tooltips)
- Proper MaterialCommunityIcons (removing all emojis)
- Centralized data in `/src/data/tables/`
- 100% theme compliance

### Mock Services (TEMPORARY)
Mock implementations are active for UI development:
- **Table Management**: `FixedMockTableApiClient.ts`
- **Menu Management**: `MockMenuApiClient.ts`
- **Authentication**: `dummyAuthService.ts`

**Remove before production**: All mock services must be replaced with real backend integration.

### Development Notes
- Uses Expo SDK 53 with React Native 0.79.5
- Node.js 18+ required
- All API services follow consistent patterns
- Component testing with React Native Testing Library
- Comprehensive TypeScript coverage
- Service layer abstraction for all backend integrations