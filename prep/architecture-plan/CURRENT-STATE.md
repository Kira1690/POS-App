# POS Application - Current State Summary

## Tech Stack

| Component | Technology | Port |
|-----------|-----------|------|
| API Gateway | Express.js (Bun ready) | 8080 |
| Auth Service | Bun + Drizzle ORM + PostgreSQL | 3000 |
| Auth Service (Legacy) | Express + Prisma + PostgreSQL | 5001 |
| Core Service | Express + Prisma + PostgreSQL + WebSocket | 5005 |
| Menu Service | Express + Prisma + PostgreSQL | 5003 |
| Integration Service | Express + Prisma | 5006 |
| Notification Service | Express + Prisma | 5004 |
| SBOS Backend | Express + Prisma (payroll/scheduling) | - |
| Mobile POS App | React Native + Expo SDK 54 | 8081 |
| Web Dashboard | React 19 + Vite + Tailwind + Zustand | 5173 |
| Food Ordering App | React Native + Expo SDK 53 | - |
| Database | PostgreSQL | 5432 |
| Cache | Redis | 6379 |
| Message Queue | Kafka | 9092 |

## Database: ~114 models across services

| Service | ORM | Models | Schema Location |
|---------|-----|--------|----------------|
| POS-Authentication | Drizzle | 13 | `POS-Authentication/src/db/schema.ts` |
| POS-Core-Service | Prisma | 26 | `POS-Services/POS-Core-Service/prisma/schema.prisma` |
| POS-Menu-Service | Prisma | 16 | `POS-Services/POS-Menu-Service/prisma/schema.prisma` |
| POS-Auth-Service | Prisma | 9 | `POS-Services/POS-Auth-Service/prisma/schema.prisma` |
| POS-Integration-Service | Prisma | 3 | `POS-Services/POS-Integration-Service/prisma/schema.prisma` |
| SBOS Backend | Prisma | 47 | `SBOS/sbos-backend/src/prisma/schema.prisma` |

## Current Roles (Inconsistent Across Services)

| Service | Roles |
|---------|-------|
| POS-Authentication | system_admin, store_admin, user |
| POS-Auth-Service | restaurant_staff, kitchen_staff, manager, customer, admin, superadmin |
| SBOS | superadmin, admin, manager, employee, vendor |

## What Works
- JWT authentication with access/refresh tokens
- Basic user and store CRUD
- API Gateway routing for auth, users, stores, settings, audit, reports, payments
- Order CRUD with kitchen tickets
- Table and section management
- Menu CRUD with categories, modifiers, combos
- Inventory tracking
- WebSocket real-time on Core Service
- Kafka event streaming (partially)
- Redis caching and rate limiting
- Audit logging with correlation IDs
- Report subscription system
- Mobile POS app with 14 context providers
- Web dashboard with auth, users, stores, settings, transactions

## What Needs Work
- Unified role system across all services
- Complete RBAC with granular permissions
- Full API Gateway route coverage (kitchen, tables, customers, inventory missing)
- Robust sync engine with version tracking and conflict resolution
- Web dashboard: menu, tables, orders, kitchen, inventory, staff, customers pages
- Mobile app: replace mock services with real API calls
- Notification service connection
- Integration service completion (Uber Eats, DoorDash)
- Docker Compose for full stack
- CI/CD pipeline
- Comprehensive testing

> **SBOS (Payroll/Scheduling) is OUT OF SCOPE.** Simple user management via Auth Service is sufficient.
