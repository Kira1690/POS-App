# Role × Feature Access Matrix

## Web Dashboard

| Feature / Route | system_admin | store_admin | user |
|----------------|:---:|:---:|:---:|
| `/` Dashboard | ✅ | ✅ | ✅ |
| `/users` User list | ✅ | ❌ | ❌ |
| `/users/create` Create user | ✅ | ❌ | ❌ |
| `/users/:id` View user | ✅ | ❌ | ❌ |
| `/users/:id/edit` Edit user | ✅ | ❌ | ❌ |
| `/stores` Store list | ✅ | ❌ | ❌ |
| `/stores/create` Create store | ✅ | ❌ | ❌ |
| `/stores/:id` View store | ✅ | ✅ (own store) | ❌ |
| `/stores/:id/edit` Edit store | ✅ | ✅ (own store) | ❌ |
| `/stores/:id/transactions` Transactions | ✅ | ✅ (own store) | ❌ |
| `/menu` Menu management | ✅ | ✅ | ✅ |
| `/orders` Orders | ✅ | ✅ | ✅ |
| `/tables` Tables | ✅ | ✅ | ✅ |
| `/kitchen` Kitchen | ✅ | ✅ | ✅ |
| `/staff` Staff | ✅ | ✅ | ✅ |
| `/reports` Reports | ✅ | ✅ | ✅ |
| `/account` Account settings | ✅ | ✅ | ✅ |
| `/report-emails` Report emails | ✅ | ✅ | ✅ |
| `/logs` System logs | ✅ | ❌ | ❌ |
| `/store-report-settings` Store report config | ✅ | ❌ | ❌ |

---

## Mobile App

| Feature | manager | restaurant_staff | kitchen_staff | admin | superadmin |
|---------|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| POS Order Entry | ✅ | ✅ | ❌ | ✅ | ✅ |
| Table Selection | ✅ | ✅ | ❌ | ✅ | ✅ |
| Kitchen Display | ✅ | ❌ | ✅ | ✅ | ✅ |
| Menu Management | ✅ | ❌ | ❌ | ✅ | ✅ |
| Payment Processing | ✅ | ✅ | ❌ | ✅ | ✅ |
| Split Payment | ✅ | ✅ | ❌ | ✅ | ✅ |
| Reports | ✅ | ❌ | ❌ | ✅ | ✅ |
| Staff Management | ✅ | ❌ | ❌ | ✅ | ✅ |
| Settings | ✅ | ❌ | ❌ | ✅ | ✅ |
| Sync Status | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Test Priority

### P0 — Must Pass (blocker)
- Login / Logout all roles
- Role-based redirect (forbidden routes)
- Create + read a menu item (all roles that can)
- Create a POS order (mobile)
- Process a payment (mobile)

### P1 — High Priority
- User CRUD (system_admin)
- Store CRUD (system_admin)
- Kitchen workflow (mobile)
- Split payment (mobile)
- Dashboard order cards (mobile)

### P2 — Medium Priority
- Session persistence after refresh
- Report subscriptions
- Account settings update
- Combine bills (mobile)
- Maestro sync tests (online mode)

### P3 — Nice to Have
- Log page content (system_admin)
- Store report settings
- All modifier scenarios
- Card payment TRX terminal (mobile)
