# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### 🔄 Service Layer Patterns (MANDATORY)
- **Single Responsibility**: Each service class has ONE domain responsibility
- **Interface Segregation**: Small, focused interfaces over large ones
- **Composition over Inheritance**: Use composition to build complex services
- **Method Naming**: Use clear, descriptive method names (getProfile, updatePassword)
- **Return Types**: Always return typed responses, never `any`
- **Error Handling**: Consistent error handling across all services
- **Async/Await**: Use async/await consistently, avoid promise chains

### 📦 File Organization Rules (STRICT)
- **Maximum File Size**: 300 lines per file (components), 200 lines (services)
- **Folder Structure**: Group by feature, not by file type
- **Index Files**: Use index.ts files for clean exports
- **Naming Convention**: PascalCase for components, camelCase for services/hooks
- **Import Organization**: Group imports (React, external libs, internal)
- **Export Strategy**: Named exports preferred over default exports

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
- **Restaurant Staff 1**: `EMP001` / `staff123` (John Doe - The Food Corner)
- **Restaurant Staff 2**: `EMP002` / `staff456` (Jane Smith - The Food Corner)
- **Kitchen Staff 1**: `CHEF001` / `kitchen123` (Chef Mike Wilson - The Food Corner)
- **Kitchen Staff 2**: `CHEF002` / `kitchen456` (Chef Sarah Brown - Pizza Palace)

### Manager Login (Email + Password)
- **Manager 1**: `manager@foodcorner.com` / `manager123` (Alice Johnson - The Food Corner)
- **Manager 2**: `manager@pizzapalace.com` / `manager456` (Bob Martinez - Pizza Palace)

### Admin Login (Email + Password)
- **Admin 1**: `admin@foodcorner.com` / `admin123` (David Admin - The Food Corner)
- **Admin 2**: `admin@pizzapalace.com` / `admin456` (Emma Administrator - Pizza Palace)

### Superadmin Login (Email + Password)
- **Superadmin**: `superadmin@foodpos.com` / `super123` (System Superadmin - Multi-restaurant access)

### Test Restaurants
- **The Food Corner** (ID: rest_001) - 123 Main Street, City, State 12345 - +1 (555) 123-4567
- **Pizza Palace** (ID: rest_002) - 456 Oak Avenue, City, State 12345 - +1 (555) 987-6543
- **Burger House** (ID: rest_003) - 789 Pine Street, City, State 12345 - +1 (555) 456-7890

### Usage Instructions
1. Use **Staff Login** screen for staff/kitchen roles (Employee ID required)
2. Use **Manager Login** screen for manager/admin/superadmin roles (Email required)
3. All credentials have role-based navigation and feature access
4. Test different roles to see permission-based UI changes

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
- And similar mappings for all major directories

### Role-Based Access Control
- **restaurant_staff**: Basic POS operations
- **kitchen_staff**: Kitchen order management
- **manager**: Restaurant management features
- **admin**: System administration
- **superadmin**: Multi-restaurant management

Permission system controls access to features like order management, menu management, table operations, kitchen operations, staff management, and reports.

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

## Project Progress Tracking

### Current Status: 🚀 Phase 1 COMPLETE
**Start Date**: 2025-07-12  
**Current Phase**: Phase 2 - Core POS Features
**Overall Progress**: 25% Complete

### Phase 1: Foundation & Authentication ✅ COMPLETE
- ✅ Project planning and architecture design
- ✅ Expo project setup with TypeScript
- ✅ Complete API service layer foundation
- ✅ Authentication service with JWT token management
- ✅ Type definitions system
- ✅ Configuration and constants setup

### Phase 2: Core POS Features 🔄 IN PROGRESS
**Target Completion**: Day 8
- [ ] Dashboard with real-time metrics
- [ ] Order management system
- [ ] Table management interface
- [ ] Basic menu browsing
- [ ] Payment integration (bridge to existing VP3350 app)

### Phase 3: Advanced Features ⏳ PENDING
**Target Completion**: Day 12
- [ ] Kitchen operations module
- [ ] Customer management
- [ ] Basic inventory tracking
- [ ] Staff shift management
- [ ] Print integration for receipts

### Phase 4: Management & Analytics ⏳ PENDING
**Target Completion**: Day 16
- [ ] Menu management (admin features)
- [ ] Advanced inventory management
- [ ] Reports and analytics
- [ ] Advanced staff management
- [ ] System settings and configuration

## Feature Implementation Checklist

### Authentication & User Management ✅ COMPLETE
- [x] Multi-role login system (restaurant_staff, kitchen_staff, manager, admin, superadmin)
- [x] JWT token management with auto-refresh
- [x] Restaurant selection for multi-restaurant users
- [x] Role-based navigation and feature access
- [x] Device registration and tracking
- [x] Secure logout and session management

### Dashboard Features 🔄 IN PROGRESS
- [ ] Role-specific dashboard layouts
- [ ] Real-time metrics and KPIs
- [ ] Today's sales summary
- [ ] Active orders count
- [ ] Table occupancy status
- [ ] Staff on-duty overview
- [ ] Quick action buttons
- [ ] Notification center

### Order Management ⏳ NEXT
- [ ] Create new orders with table assignment
- [ ] Add/remove items to orders
- [ ] Order modifications (special requests, substitutions)
- [ ] Order status tracking (pending, preparing, ready, served)
- [ ] Split bill functionality
- [ ] Order cancellation with authorization
- [ ] Order history and search
- [ ] Print order receipts

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

### Development Notes
- Uses Expo SDK 53 with React Native 0.79.5
- Node.js 18+ required
- All API services follow consistent patterns
- Component testing with React Native Testing Library
- Comprehensive TypeScript coverage
- Service layer abstraction for all backend integrations

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