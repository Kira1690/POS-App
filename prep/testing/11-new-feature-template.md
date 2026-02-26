# [Feature Name] Tests

> Copy this template for every new feature. Fill in ALL sections before shipping.
> File name: `NN-feature-name.md` where NN is the next number in the sequence.

## Screens Covered
- `FeatureScreen` — main screen description
- `FeatureService` — data persistence / API service
- `FeatureContext` — state management (if applicable)
- `FeatureComponent` — reusable component (if applicable)

## Feature Flow (if applicable)
```
step 1 → step 2 → step 3
                     ↓
               error/cancel path
```

---

## Unit Tests (Jest)

### [ServiceName]
| Test | Description | Status |
|------|-------------|--------|
| `methodName()` happy path | Description of what is checked | pending |
| `methodName()` edge case — empty input | pending |
| `methodName()` error case — invalid input | pending |
| `methodName()` is idempotent (if applicable) | Call twice, same result | pending |

### [ContextName / reducer]
| Test | Description | Status |
|------|-------------|--------|
| `actionName` action updates state correctly | Dispatch, check state | pending |
| `actionName` with invalid payload is ignored | No crash | pending |
| Selector returns correct derived value | Computed field test | pending |

### Calculations / Business Logic
| Test | Description | Status |
|------|-------------|--------|
| Core calculation — happy path | Input → expected output | pending |
| Core calculation — zero/null edge case | pending |
| Validation — minimum value enforcement | pending |
| Validation — maximum value enforcement | pending |

---

## Integration Tests (Jest)

> Use `@testing-library/react-native`. Mount the screen with mocked providers.

| Test | Description | Status |
|------|-------------|--------|
| [Screen] renders without crash — empty state | No orders/data | pending |
| [Screen] renders with mock data | 3 items visible | pending |
| Primary action button is visible | assert button present | pending |
| Primary action calls the correct service method | fireEvent.press, mock service | pending |
| Form validation — required field empty | Submit, error shown | pending |
| Form validation — invalid format | Enter bad data, error shown | pending |
| Form submit — success → navigates or closes modal | fireEvent, nav check | pending |
| Form submit — error → shows error message | Mock service error | pending |
| Search/filter works as expected | Type query, list updates | pending |
| Empty state shown when list is empty | 0 items → empty component | pending |
| Loading state shown while fetching | isLoading=true → spinner | pending |

---

## E2E Tests — Offline (Maestro)

> File: `.maestro/pending/NN_feature_name_offline.yaml`

| Test | Flow file | Status |
|------|-----------|--------|
| [Feature] screen loads from main navigation | `full_offline_test.yaml` or own file | pending |
| Primary user flow — happy path | `pending/NN_happy_path.yaml` | pending |
| Secondary user flow (if applicable) | `pending/NN_secondary.yaml` | pending |
| Error/edge case flow | `pending/NN_error_case.yaml` | pending |
| Data persists after app restart | `pending/NN_persistence.yaml` | pending |

---

## E2E Tests — Online (Maestro)

> File: `.maestro/online/NN_feature_name_online.yaml`
> Requires backend running at `localhost:4000`.

| Test | Flow file | Status |
|------|-----------|--------|
| Data loads from backend API | `online/NN_data_load.yaml` | pending |
| Create/update syncs to backend | `online/NN_sync.yaml` | pending |
| Real-time update via WebSocket | `online/NN_realtime.yaml` | pending |
| Offline-created data syncs on reconnect | pending |

---

## Acceptance Criteria

> These MUST all pass before the feature is considered done.

- [ ] Feature works completely offline with SQLite
- [ ] Data persists across app restarts
- [ ] Form validation prevents invalid submissions
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error states display meaningful messages
- [ ] Feature accessible to correct roles only (RBAC)
- [ ] Data syncs to backend when online
- [ ] Unit test coverage ≥ 70%
- [ ] No TypeScript errors (`bun run type-check`)
- [ ] No linting errors (`bun run lint`)

---

## Checklist Before Shipping

- [ ] Test plan file created (this file, filled in)
- [ ] Jest unit tests written and passing
- [ ] Jest integration tests written and passing
- [ ] Maestro offline flow written (even if pending)
- [ ] `progress.md` updated with new feature row
- [ ] CLAUDE.md Project Status section updated
