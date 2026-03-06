# Production QA Manifest — Phase 2
Generated: 2026-03-04

## Restaurant
- Name: QA Blueplate Production
- Contact Email: qa-prod@blueplate.io
- Store ID: (fill in after creation)
- Created via: e2e/qa/production-setup.spec.ts

## Credentials

| Role         | Email                              | Password        | Auth Role   | POS Role     |
|--------------|------------------------------------|-----------------| ------------|--------------|
| Store Admin  | qa-prod-admin@blueplate.io         | QAProd2026!     | store_admin | store_admin  |
| Manager      | qa-prod-manager@blueplate.io       | QAProdMgr2026!  | user        | manager      |
| Waiter       | qa-prod-waiter@blueplate.io        | QAProdWtr2026!  | user        | waiter       |
| Kitchen      | qa-prod-kitchen@blueplate.io       | QAProdKit2026!  | user        | kitchen_staff|
| Cashier      | qa-prod-cashier@blueplate.io       | QAProdCsh2026!  | user        | cashier      |

## Seeded Menu Data (from 00_prod_seed.yaml)

### Categories
| ID | Name          |
|----|---------------|
| -  | Prod-Drinks   |
| -  | Prod-Mains    |
| -  | Prod-Starters |

### Menu Items
| ID | Name         | Price  | Category     |
|----|--------------|--------|--------------|
| -  | Prod-Coffee  | $3.50  | Prod-Drinks  |
| -  | Prod-Juice   | $4.00  | Prod-Drinks  |
| -  | Prod-Burger  | $12.99 | Prod-Mains   |
| -  | Prod-Salad   | $9.50  | Prod-Starters|

### Modifier Groups
| ID | Name       | Options |
|----|------------|---------|
| -  | Prod-Size  | S/M/L   |

### Tables
| ID | Name  | Seats | Section    |
|----|-------|-------|------------|
| -  | P-T1  | 4     | Prod-Floor |
| -  | P-T2  | 2     | Prod-Floor |
| -  | B-T1  | 2     | Prod-Bar   |
| -  | B-T2  | 4     | Prod-Bar   |

### Sections
| ID | Name       |
|----|------------|
| -  | Prod-Floor |
| -  | Prod-Bar   |

---

## Test Run Log
(Appended by production-setup.spec.ts on each run)
