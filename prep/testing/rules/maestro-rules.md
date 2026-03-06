# Maestro Testing Rules & Standards

## Core Principles

1. **Helper-first** — all login flows live in `helpers/`. Never duplicate login steps inside a test.
2. **Explicit waits** — always use `extendedWaitUntil` or `waitForAnimationToEnd`. Never use raw `wait` except for animation transitions.
3. **Screenshot every phase** — call `takeScreenshot` at the end of every major action.
4. **Self-contained tests** — each QA file must clean up its own test data before asserting. Use `reset_app_data.yaml` or the inline pm clear approach.
5. **Optional for flaky UI** — wrap optional developer-menu dismissals and transition animations in `optional:` blocks.
6. **Tags for filtering** — every test must have `tags:` with at least one of: `auth`, `offline`, `pos`, `kitchen`, `billing`, `payment`, `menu`, `sync`, `qa`.

---

## File Naming Convention

```
.maestro/
├── helpers/              Reusable sub-flows (no appId header needed)
│   ├── manager_login.yaml
│   ├── fresh_login.yaml
│   ├── open_app.yaml
│   └── reset_app_data.yaml
├── NN_<feature>_<scenario>.yaml    Main tests (NN = 2-digit sequence)
├── qa_NN_<scenario>.yaml           QA suite members
├── qa_full_suite.yaml              Orchestrator (runFlow references)
└── split-payment-tests/            Grouped by feature
```

---

## Test File Header Template

```yaml
appId: host.exp.exponent
name: "QA NN — Short Description"
tags:
  - qa
  - <feature-tag>
---
```

---

## Login Helpers Usage

```yaml
# Use runFlow to avoid duplicating login steps
- runFlow: helpers/manager_login.yaml

# After login, always assert the expected landing screen
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 30000
```

---

## Wait Strategy

```yaml
# ✅ CORRECT: Semantic wait
- extendedWaitUntil:
    visible: "Latte"
    timeout: 15000

# ✅ CORRECT: Animation wait before asserting
- waitForAnimationToEnd
- assertVisible: "Order Summary"

# ✅ CORRECT: Short wait for UI transition only
- wait: 800

# ❌ WRONG: Arbitrary long sleep
- wait: 5000

# ❌ WRONG: No wait before asserting dynamic content
- tapOn: "Add Item"
- assertVisible: "Item Added"   # may fail — no wait!
```

---

## Screenshots

```yaml
# At the end of every major phase:
- takeScreenshot: "NN_<feature>_<phase>"

# Example naming:
- takeScreenshot: "qa_07_kitchen_preparing_state"
- takeScreenshot: "qa_08_cash_payment_success"
```

---

## Developer Menu Handling

The Expo developer menu appears after `pm clear` + `openLink`. Always handle it:

```yaml
# Pattern 1: Dismiss with optional block
- optional:
    - extendedWaitUntil:
        visible: "developer menu"
        timeout: 3000
    - tapOn:
        text: "Continue"

# Pattern 2: Double-tap (used in fresh_login.yaml)
# First tap → dismisses transparent backdrop
# Second tap → actually performs the action
- tapOn:
    text: ".*Manager Login.*"
- waitForAnimationToEnd
- tapOn:
    text: ".*Manager Login.*"
```

---

## ID-Based vs Text-Based Selectors

Prefer testID/id selectors when available (stable across text changes):

```yaml
# ✅ PREFERRED: testID
- tapOn:
    id: "email-input"

# ✅ ACCEPTABLE: text with regex (stable for translations)
- tapOn:
    text: ".*Sign In.*"

# ❌ AVOID: exact text (brittle)
- tapOn:
    text: "Sign In"
```

---

## Scroll for Off-Screen Elements

```yaml
- scrollUntilVisible:
    element:
      text: "Garlic Bread"
    direction: DOWN
    timeout: 10000
```

---

## Modifier Modal Handling

Modifier dialogs are common across menu and POS tests. Always use the helper:

```yaml
- runFlow: helpers/handle_modifier_modal.yaml
```

---

## Suite Orchestration

The `qa_full_suite.yaml` orchestrates all sub-tests via `runFlow`:

```yaml
# Run sub-tests in sequence
- runFlow: qa_01_setup_categories.yaml
- runFlow: qa_02_add_items.yaml
# ...
```

Individual files can also be run standalone — they must work without relying on prior suite state.

---

## Android Device Setup

```bash
# Before any Maestro run:
adb shell pm clear host.exp.exponent      # clear app data
adb shell settings put system accelerometer_rotation 1
adb shell settings put system user_rotation 0  # portrait

# For landscape tests:
adb shell settings put system user_rotation 1  # landscape
```

---

## Adding a New Test

1. Choose the next available `NN` prefix
2. Create `NN_<feature>_<scenario>.yaml`
3. Start with `runFlow: helpers/manager_login.yaml` (or appropriate role)
4. Use `extendedWaitUntil` for every UI transition
5. End with `takeScreenshot`
6. Add to `qa_full_suite.yaml` under the correct phase
7. Add tags

---

## Forbidden Patterns

```yaml
# ❌ Never hardcode absolute coordinates
- tapOn:
    point: "50%,75%"

# ❌ Never use sleep > 2000ms without comment
- wait: 5000

# ❌ Never assert without waiting
- assertVisible: "Loading..."   # right after navigation

# ❌ Never leave test data in a dirty state
# Always reset or clean up created items
```
