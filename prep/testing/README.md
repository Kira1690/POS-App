# FoodPOS Test Suite — Master Plan

> **Rule:** Every new feature shipped must have a corresponding test added here before it is considered complete.

## Folder Structure

```
prep/testing/
├── README.md                          ← this file (overview + rules)
├── 01-auth.md                         ← Authentication (login, session, roles)
├── 02-dashboard.md                    ← All dashboard screens
├── 03-order-management.md             ← Order lifecycle (create → pay)
├── 04-kitchen.md                      ← Kitchen display & ticket management
├── 05-tables.md                       ← Table management & floor plan
├── 06-menu.md                         ← Menu & category management
├── 07-payment.md                      ← Payment processing & billing
├── 08-settings.md                     ← All settings screens
├── 09-offline.md                      ← Full offline test suite
├── 10-online.md                       ← Online / API-connected tests
├── 11-new-feature-template.md         ← Template to copy for every new feature
└── progress.md                        ← Which tests are implemented vs pending
```

## Test Layers

Every feature is tested at **three layers**:

| Layer | Tool | What it tests | When it runs |
|-------|------|--------------|-------------|
| **Unit** | Jest + `@testing-library/react-native` | Service logic, context reducers, utility functions, individual components | Every commit (fast, <30s) |
| **Integration** | Jest + mocked providers | Full screen render with context/hooks wired up | Every PR |
| **E2E** | Maestro on `POS_Tablet` AVD | Real user flows, visible on emulator screen | Before every release |

## Offline vs Online

| Mode | How to run | What is different |
|------|-----------|-------------------|
| **Offline** | Airplane mode on device, `bun expo start` on host | SQLite only, dummy users, no API calls |
| **Online (local)** | Backend running at `localhost:4000` | Real JWT, real database, real microservices |
| **Online (staging)** | `EXPO_PUBLIC_API_URL` pointed at staging server | Full production-like environment |

## How to Add Tests for a New Feature

1. Copy `11-new-feature-template.md` → name it after the feature (e.g., `12-reservations.md`)
2. Fill in every section: unit, integration, E2E offline, E2E online
3. Write the Maestro `.yaml` files in `.maestro/` named `NN_feature_name.yaml`
4. Write the Jest test files in `__tests__/` next to the source files
5. Update `progress.md` with the new feature row

## Running the Tests

```bash
# Unit + Integration (Jest)
bun test                          # run all
bun test --testPathPattern auth   # run one module

# E2E Offline (Maestro on running emulator)
maestro test .maestro/full_offline_test.yaml
maestro test .maestro/            # run all flows

# E2E Full Suite
maestro test .maestro/ --format junit --output reports/maestro-results.xml

# Type check (must pass before committing)
bun run type-check

# Lint
bun run lint
```
