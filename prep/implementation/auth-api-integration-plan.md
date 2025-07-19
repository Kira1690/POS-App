# POS-App Auth API Integration Plan

## 🎯 Project Overview

**Goal**: Integrate all authentication APIs from POS-Auth-Service through POS-API-Gateway  
**Architecture**: POS-App → API Gateway (port 4000) → Auth Service (port 5001)  
**Current Status**: Phase 1 Complete (dummy auth), Phase 2 In Progress (real API integration)

## 📊 Architecture Understanding

### Current Architecture
```
POS-App (React Native) → POS-API-Gateway (port 4000) → POS-Auth-Service (port 5001)
```

### Key Components
- **POS-Auth-Service**: Comprehensive auth service with JWT, multi-tenant, RBAC
- **POS-API-Gateway**: Centralized routing with JWT validation and automatic refresh
- **POS-App**: React Native frontend with complete UI foundation

### Authentication Flow
1. App sends requests to API Gateway (localhost:4000)
2. Gateway routes `/api/auth/*` to Auth Service
3. Gateway handles JWT validation and automatic token refresh
4. Gateway sets HTTP-only cookies and response headers
5. App receives user data and manages auth state

## 🔗 Available Auth APIs

### Public APIs (No Authentication Required)
```
POST /api/auth/register                 - User registration
POST /api/auth/login                   - User login
POST /api/auth/forgot-password         - Password reset request
POST /api/auth/reset-password          - Password reset with token
POST /api/auth/refreshtoken           - Refresh access token
GET  /api/auth/verify-email           - Email verification (GET)
POST /api/auth/verify-email           - Email verification (POST)
POST /api/auth/resend-verification    - Resend verification email
GET  /api/auth/validate-token         - Token validation
```

### Protected APIs (Require JWT)
```
GET  /api/auth/me                      - Get current user info
POST /api/auth/logout                  - Logout user
PUT  /api/auth/update                  - Update user profile
PUT  /api/auth/update-password         - Change password
DELETE /api/auth/soft-delete           - Soft delete user
DELETE /api/auth/hard-delete           - Hard delete user

# Session Management
GET  /api/auth/sessions                - Get user sessions
POST /api/auth/revoke-other-sessions   - Revoke other sessions
DELETE /api/auth/sessions              - Revoke all sessions
GET  /api/auth/session/:id             - Get session info
DELETE /api/auth/session/:id           - Revoke specific session

# Admin Management
POST /api/auth/admin/register          - Admin user registration
GET  /api/auth/list                    - List users (admin)
GET  /api/auth/my-registered-users     - Users registered by current admin
PUT  /api/auth/admin/user/:id          - Update user by admin
DELETE /api/auth/admin/user/:id        - Delete user by admin
```

### Restaurant Management APIs
```
POST /api/restaurants                  - Create restaurant
GET  /api/restaurants                  - Get restaurants
GET  /api/restaurants/:id              - Get restaurant
PUT  /api/restaurants/:id              - Update restaurant
DELETE /api/restaurants/:id            - Delete restaurant
POST /api/restaurants/:id/assign-manager - Assign manager
POST /api/restaurants/:id/users        - Add user to restaurant
GET  /api/restaurants/:id/users        - Get restaurant users
```

### Device Management APIs
```
POST /api/devices/register             - Register device
GET  /api/devices                      - Get devices
GET  /api/devices/:id                  - Get device
PUT  /api/devices/:id                  - Update device
DELETE /api/devices/:id                - Deactivate device
GET  /api/devices/restaurant/:id       - Get restaurant devices
POST /api/devices/:id/heartbeat        - Device heartbeat (no auth)
GET  /api/devices/:id/status           - Device status (no auth)
```

### Shift Management APIs
```
POST /api/shifts/start                 - Start shift
POST /api/shifts/end                   - End shift
GET  /api/shifts/current               - Get current shift
GET  /api/shifts/history               - Get shift history
POST /api/shifts/break/start           - Start break
POST /api/shifts/break/end             - End break
GET  /api/shifts/restaurant/:id        - Get restaurant shifts
PUT  /api/shifts/:id                   - Update shift
```

## 🔐 Security Features

### JWT Token Management
- **Access Token**: 15-minute expiry, HTTP-only cookies
- **Refresh Token**: 7-day expiry, HTTP-only cookies
- **Automatic Refresh**: Gateway handles token refresh transparently
- **Multiple Token Sources**: Bearer header, cookies, custom headers

### Role-Based Access Control
```typescript
enum UserRole {
  RESTAURANT_STAFF = 'restaurant_staff',
  KITCHEN_STAFF = 'kitchen_staff', 
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}
```

### Session Management
- **Multi-device Support**: Up to 3 concurrent sessions
- **Device Fingerprinting**: MAC address, IP tracking
- **Session Tracking**: Device info, location, timestamps
- **Security Features**: Session revocation, audit logging

## 💻 Implementation Plan

### Phase 1: Foundation ✅ COMPLETED
- [x] Project setup with TypeScript and Expo
- [x] API client with interceptors
- [x] Token manager with secure storage
- [x] Basic auth service structure
- [x] Complete authentication UI
- [x] Navigation with role-based access
- [x] Dummy authentication for testing

### Phase 2: Core Auth API Integration 🔄 IN PROGRESS

#### Step 1: Enhanced API Client Architecture
**Objective**: Create specialized API clients for different service domains

**Implementation Tasks**:
1. **Create Base API Client** (`src/services/api/baseApiClient.ts`)
   - Centralized axios configuration
   - Request/response interceptors
   - Error handling with user-friendly messages
   - Automatic token refresh capability
   - Support for both Bearer and cookie authentication

2. **Create Auth-Specific API Client** (`src/services/api/authApiClient.ts`)
   - Extends base client with auth-specific logic
   - Handles login/logout token management
   - Session management capabilities
   - Cookie and header token synchronization

3. **Update Generic API Client** (`src/services/api/apiClient.ts`)
   - Generic client for non-auth services
   - Uses auth client for token validation
   - Shared interceptor logic

#### Step 2: Enhanced Token Management
**Objective**: Complete token manager with real API integration

**Implementation Tasks**:
1. **Update TokenManager** (`src/utils/tokenManager.ts`)
   - Real refresh token implementation
   - Cookie and header synchronization
   - Automatic token validation
   - Session expiry handling
   - Multi-device session support

2. **Add Device Management** (`src/utils/deviceManager.ts`)
   - Device fingerprinting
   - Device registration with auth service
   - Device ID generation and storage

#### Step 3: Complete Auth Service Implementation
**Objective**: Replace dummy service with real API integration

**Implementation Tasks**:
1. **Enhanced Auth Service** (`src/services/auth/authService.ts`)
   - All authentication endpoints
   - User profile management  
   - Password management
   - Session management
   - Admin user management

2. **Restaurant Service** (`src/services/auth/restaurantService.ts`)
   - Restaurant CRUD operations
   - User-restaurant associations
   - Manager assignments
   - Multi-tenant support

3. **Device Service** (`src/services/auth/deviceService.ts`)
   - Device registration and management
   - Device status monitoring
   - Restaurant device management

4. **Shift Service** (`src/services/auth/shiftService.ts`)
   - Shift start/end functionality
   - Break management
   - Shift history and reporting

#### Step 4: AuthContext and State Management
**Objective**: Global authentication state with real API integration

**Implementation Tasks**:
1. **AuthContext** (`src/context/AuthContext.tsx`)
   - Global authentication state
   - User profile management
   - Restaurant selection for multi-tenant users
   - Session management
   - Automatic token refresh handling

2. **Auth Hooks** (`src/hooks/useAuth.ts`)
   - Custom authentication hooks
   - Login/logout functionality
   - User profile hooks
   - Session management hooks

#### Step 5: UI Integration and Enhancement
**Objective**: Connect UI components to real authentication system

**Implementation Tasks**:
1. **Update Auth Screens**
   - Connect login screens to real auth service
   - Add error handling and validation
   - Implement loading states
   - Add success/error feedback

2. **Add Missing Features**
   - Password reset flow
   - Email verification flow
   - Multi-factor authentication (future)
   - Device management screens

#### Step 6: Advanced Features
**Objective**: Implement advanced authentication features

**Implementation Tasks**:
1. **Session Management**
   - Active sessions display
   - Session revocation
   - Device management
   - Security settings

2. **Admin Features**
   - User management screens
   - Restaurant management
   - Device monitoring
   - Audit logging

3. **Multi-tenant Support**
   - Restaurant selection flow
   - Role-based UI adaptation
   - Restaurant switching

### Phase 3: Testing and Optimization

#### Step 7: Comprehensive Testing
1. **Unit Tests**
   - Auth service methods
   - Token manager functionality
   - API client behavior
   - Context state management

2. **Integration Tests**
   - Full authentication flows
   - Token refresh scenarios
   - Error handling
   - Multi-device sessions

3. **End-to-End Tests**
   - Complete user workflows
   - Cross-platform testing
   - Performance testing

#### Step 8: Security and Performance
1. **Security Enhancements**
   - Secure token storage validation
   - API key management
   - Input validation and sanitization
   - Error message security

2. **Performance Optimization**
   - API call optimization
   - Caching strategies
   - Background token refresh
   - Connection pooling

## 🛠️ Technical Implementation Details

### API Client Configuration
```typescript
// Base API URL (API Gateway)
const API_BASE_URL = 'http://localhost:4000';

// Auth endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout', 
  REFRESH: '/api/auth/refreshtoken',
  PROFILE: '/api/auth/me',
  REGISTER: '/api/auth/register',
  // ... all other endpoints
};
```

### Token Management Strategy
```typescript
// Multiple token sources support
const tokenSources = [
  'Authorization Bearer header',
  'HTTP-only cookies (primary)',
  'Custom headers (x-access-token)',
  'Signed cookies (enhanced security)'
];
```

### Error Handling Strategy
```typescript
// Comprehensive error handling
const errorMappings = {
  401: 'Authentication required',
  403: 'Permission denied', 
  404: 'Resource not found',
  409: 'Conflict (duplicate data)',
  422: 'Validation failed',
  500: 'Server error',
  503: 'Service unavailable'
};
```

## 📋 Implementation Checklist

### Core Authentication APIs ✅ Priority 1
- [ ] **Auth Service Integration**
  - [ ] Login/logout with JWT tokens
  - [ ] User registration and verification
  - [ ] Password reset flow
  - [ ] Profile management
  - [ ] Session management

### Advanced Authentication ⏳ Priority 2  
- [ ] **Admin Features**
  - [ ] Admin user management
  - [ ] User registration by admin
  - [ ] Role-based access control

### Multi-tenant Support ⏳ Priority 3
- [ ] **Restaurant Management**
  - [ ] Restaurant CRUD operations
  - [ ] User-restaurant associations
  - [ ] Manager assignments
  - [ ] Restaurant switching UI

### Device Management ⏳ Priority 4
- [ ] **Device Registration**
  - [ ] Device fingerprinting
  - [ ] Device status monitoring
  - [ ] Restaurant device management

### Shift Management ⏳ Priority 5
- [ ] **Shift Operations**
  - [ ] Shift start/end
  - [ ] Break management
  - [ ] Shift history and reporting

## 🎯 Success Criteria

### Functional Requirements
1. **Authentication Flow**: Complete login/logout with JWT tokens
2. **Token Management**: Automatic refresh without user intervention
3. **Multi-tenant**: Support for multiple restaurant access
4. **Role-based Access**: UI adapts based on user roles
5. **Session Management**: Multi-device session support
6. **Error Handling**: User-friendly error messages
7. **Security**: Secure token storage and transmission

### Technical Requirements  
1. **Performance**: < 200ms API response times
2. **Reliability**: 99.9% uptime with proper error handling
3. **Security**: No sensitive data in logs or local storage
4. **Scalability**: Support for concurrent users
5. **Maintainability**: SOLID principles and clean architecture

### User Experience Requirements
1. **Seamless**: No authentication interruptions for users
2. **Responsive**: Fast login/logout operations
3. **Intuitive**: Clear error messages and feedback
4. **Accessible**: Support for different user roles
5. **Reliable**: Consistent behavior across devices

## 🚀 Next Steps

### Immediate Actions (Day 1)
1. Create enhanced API client architecture
2. Update token manager with real API integration
3. Implement core authentication service methods
4. Create AuthContext with real API integration

### Short-term Goals (Week 1)
1. Complete all authentication API integrations
2. Implement session management
3. Add restaurant and device management
4. Update UI components to use real APIs

### Long-term Goals (Week 2-4)
1. Add comprehensive testing
2. Implement advanced security features
3. Add admin and multi-tenant features
4. Performance optimization and monitoring

---

*This integration plan ensures a complete, secure, and scalable authentication system that leverages all the capabilities of the POS-Auth-Service through the API Gateway while maintaining the clean architecture established in Phase 1.*