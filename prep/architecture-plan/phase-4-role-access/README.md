# Phase 4: Role-Based Access Control

## Objective
Enforce proper role-based permissions across the API Gateway, backend services, web dashboard, and mobile app. Use the existing role system — just make it consistent and enforced.

---

## Existing Roles (Keep These)

### POS-Authentication Service (Primary)
```
system_admin  → Full system access (creates stores)
store_admin   → Full store access (creates staff)
user          → Basic access (catch-all for staff)
```

### POS-Auth-Service (Legacy — to align)
```
superadmin        → Maps to system_admin
admin             → Maps to store_admin
manager           → New: keep as distinct role
restaurant_staff  → Maps to user (waiter/host)
kitchen_staff     → Maps to user (kitchen)
customer          → External, not POS staff
```

### Target: Add Sub-Roles via `user_restaurants.role`

Instead of changing the auth enum, use the **User_Restaurants** junction table's `role` field for restaurant-specific roles:

```
users.role = 'store_admin'                    → System-level role
user_restaurants.role = 'manager'             → Restaurant-level role

users.role = 'user'                           → System-level role
user_restaurants.role = 'waiter'              → Restaurant-level role
user_restaurants.role = 'kitchen_staff'       → Restaurant-level role
user_restaurants.role = 'cashier'             → Restaurant-level role
user_restaurants.role = 'host'                → Restaurant-level role
user_restaurants.role = 'bartender'           → Restaurant-level role
```

This means:
- **Auth service** checks `system_admin` / `store_admin` / `user`
- **Restaurant operations** check `user_restaurants.role` for granular permissions
- **No schema changes needed** — `user_restaurants` table already exists in POS-Auth-Service

---

## Permission Enforcement Points

### API Gateway (First Line)
```
1. Authenticate token → extract user.role
2. For system routes (/stores, /audit, /settings):
   → Check user.role directly (system_admin, store_admin)
3. For restaurant routes (/orders, /menu, /tables):
   → Forward x-user-role header to downstream service
   → Service checks restaurant-specific role
```

### Backend Services (Second Line)
```
Each service route has middleware:
router.post('/orders', requireRole(['manager', 'waiter', 'cashier']), createOrder);
router.delete('/orders/:id', requireRole(['manager', 'store_admin']), deleteOrder);
router.get('/reports/*', requireRole(['manager', 'store_admin', 'system_admin']), getReport);
```

### Web Dashboard (UI Filtering)
```
Sidebar items hidden based on role.
Buttons disabled based on permissions.
API returns 403 → show "Not authorized" toast.
```

### Mobile App (UI Filtering)
```
Navigation screens filtered by role.
Actions disabled based on permissions.
usePermission('orders.create') hook.
```

---

## Implementation Steps

### 4.1 API Gateway Middleware Update

**File**: `POS-API-Gateway/src/middleware/authorization.ts`

Currently the gateway forwards user data headers. Enhance to also check minimum role:

```typescript
function requireMinRole(minRole: string) {
  const roleHierarchy = ['user', 'store_admin', 'system_admin'];
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(minRole)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
  };
}

// Usage in gateway routes:
app.use('/api/stores', requireMinRole('store_admin'), storeProxy);
app.use('/api/audit', requireMinRole('system_admin'), auditProxy);
app.use('/api/orders', requireMinRole('user'), orderProxy); // Service does fine-grained check
```

### 4.2 Service-Level Role Checking

**File**: `POS-Services/POS-Core-Service/src/middleware/authorization.ts`

```typescript
function requireRestaurantRole(allowedRoles: string[]) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];        // System role
    const restaurantRole = req.headers['x-user-restaurant-role']; // Restaurant role

    // System admins and store admins bypass restaurant role check
    if (['system_admin', 'store_admin'].includes(userRole)) {
      return next();
    }

    // Check restaurant-specific role
    if (allowedRoles.includes(restaurantRole)) {
      return next();
    }

    res.status(403).json({ success: false, message: 'Insufficient permissions for this operation' });
  };
}
```

### 4.3 Mobile App Permission Hook

**File**: `POS-App/src/hooks/usePermission.ts`

```typescript
export function usePermission(action: string): boolean {
  const { user } = useAuth();
  if (!user) return false;

  const role = user.restaurantRole || user.role;
  return PERMISSION_MAP[action]?.includes(role) ?? false;
}

const PERMISSION_MAP: Record<string, string[]> = {
  'orders.create':    ['manager', 'waiter', 'cashier', 'bartender'],
  'orders.delete':    ['manager', 'store_admin', 'system_admin'],
  'menu.edit':        ['manager', 'store_admin', 'system_admin'],
  'tables.manage':    ['manager', 'host', 'store_admin'],
  'kitchen.update':   ['kitchen_staff', 'manager'],
  'payments.process': ['cashier', 'waiter', 'manager', 'bartender'],
  'reports.view':     ['manager', 'store_admin', 'system_admin'],
  'staff.manage':     ['store_admin', 'system_admin'],
  'settings.edit':    ['store_admin', 'system_admin'],
};
```

### 4.4 Web Dashboard Permission Hook

**File**: `POS-Authentication-Frontend/src/hooks/usePermission.ts`

Same `PERMISSION_MAP` as mobile, shared logic.

---

## Success Criteria

- [ ] API Gateway blocks unauthorized system-level access
- [ ] Services check restaurant-specific roles
- [ ] Web dashboard hides unauthorized nav items
- [ ] Mobile app hides unauthorized screens/actions
- [ ] 403 responses shown as user-friendly messages
- [ ] No schema changes needed
