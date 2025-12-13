# Bug Fixes Session 01 - Floor Plan Editor Issues

**Session:** Week 4, Day 1
**Status:** REVERTED - All changes stashed for review
**Duration:** ~2 hours

---

## Bugs Reported

| # | Issue | Severity |
|---|-------|----------|
| 1 | App crashes when clicking table in select mode | CRITICAL |
| 2 | Settings modal content not visible/scrollable | HIGH |
| 3 | Resize handles not appearing on selected tables | HIGH |
| 4 | No drag/resize option for zones | MEDIUM |
| 5 | Move mode not working after simplification | HIGH |

---

## Root Causes Identified

### Bug 1: App Crash on Table Selection

**File:** `TableGestureOverlay.tsx`
**Lines:** 68-69 and 174-183

**Root Cause:** Reanimated worklet violation

```typescript
// Lines 68-69: Regular JavaScript variables
const overlayWidth = totalSpace.width + 20;
const overlayHeight = totalSpace.height + 20;

// Lines 174-183: useAnimatedStyle WORKLET
const animatedStyle = useAnimatedStyle(() => {
  'worklet';  // <-- Runs on NATIVE THREAD
  return {
    transform: [
      { translateX: translateX.value * zoom - overlayWidth / 2 },  // CRASH!
      { translateY: translateY.value * zoom - overlayHeight / 2 }, // CRASH!
    ],
  };
});
```

**Why it crashes:**
- `useAnimatedStyle` with `'worklet'` directive runs on the native UI thread
- `overlayWidth` and `overlayHeight` are JavaScript thread variables
- Worklets cannot access JS-thread variables directly
- `zoom` prop is also a JS variable used in worklet

---

### Bug 2: Settings Modal Content Invisible

**File:** `SettingsModal.tsx`
**Line:** 88

**Root Cause:** Flex layout conflicts

```typescript
modalContainer: {
  width: '90%',
  maxWidth: 600,
  maxHeight: Dimensions.get('window').height - 100,
  backgroundColor: theme.colors.surface,
  flex: 0,  // <-- PROBLEM: Container cannot flex!
},
```

**Layout hierarchy issue:**
```
modalContainer (flex: 0, maxHeight: window-100)  <- CANNOT EXPAND
├── header (fixed)
├── tabBar (fixed)
├── contentContainer (flex: 1)  <- Wants to expand but parent is flex:0
│   └── ScrollView (flex: 1)    <- Can't determine height
└── footer (fixed)
```

---

### Bug 3: Resize Handles Not Appearing

**File:** `FloorPlanCanvas.tsx`

**Root Cause:** Cascade effect from Bug 1

The resize handles code was correctly structured inside the transform. However:
1. The app crashed BEFORE handles could render (Bug 1)
2. When clicking table → crash → handles never appear

Additionally, the `handleTableResize` callback only passed width/height but not position:

```typescript
// Only updates width/height, ignores position change for corner handles
const handleTableResize = useCallback(
  (tableId: string, bounds: { x: number; y: number; width: number; height: number }) => {
    if (onTableResize) {
      onTableResize(tableId, bounds.width, bounds.height);  // Missing position update!
    }
  },
  [onTableResize]
);
```

---

### Bug 4: Zone Drag/Resize Not Working

**File:** `FloorPlanCanvas.tsx`

**Root Cause:** No ZoneGestureOverlay component exists

- `TableGestureOverlay` handles table selection/drag
- There is **no equivalent `ZoneGestureOverlay`** for zones
- Zones are rendered in SVG layer only (visual, no touch)
- `selectedZoneId` prop exists but no way to set it interactively

---

## Fixes Attempted

### Attempt 1: Convert JS Variables to Shared Values

**File:** `TableGestureOverlay.tsx`

Added shared values for overlay dimensions:

```typescript
// Added shared values
const overlayWidthSV = useSharedValue(totalSpace.width + 20);
const overlayHeightSV = useSharedValue(totalSpace.height + 20);

// Update effect
React.useEffect(() => {
  overlayWidthSV.value = totalSpace.width + 20;
  overlayHeightSV.value = totalSpace.height + 20;
}, [totalSpace.width, totalSpace.height]);

// Updated animated style
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    transform: [
      { translateX: translateX.value * zoom - overlayWidthSV.value / 2 },
      { translateY: translateY.value * zoom - overlayHeightSV.value / 2 },
    ],
  };
});
```

**Result:** Still crashed - `zoom` prop still JS variable in worklet

---

### Attempt 2: Complete Simplification (Remove Reanimated)

**File:** `TableGestureOverlay.tsx`

Rewrote component to use simple Pressable:

```typescript
// Before: 237 lines with Reanimated, GestureHandler
// After: 104 lines with simple Pressable

return (
  <Pressable
    style={[
      styles.overlay,
      mode === 'move' && styles.moveMode,
      isSelected && styles.selected,
    ]}
    onPress={handlePress}
  />
);
```

**Result:** Fixed crash but broke move/drag functionality

---

### Attempt 3: Add PanResponder for Drag

**File:** `TableGestureOverlay.tsx`

Added PanResponder for drag support:

```typescript
const panResponder = useMemo(
  () =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return mode === 'move' && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5);
      },
      onPanResponderGrant: () => {
        startPosRef.current = { x: position.x, y: position.y };
        onSelect();
      },
      onPanResponderMove: (_, gesture) => {
        if (mode === 'move') {
          const newX = startPosRef.current.x + gesture.dx / zoom;
          const newY = startPosRef.current.y + gesture.dy / zoom;
          onMove(newX, newY);
        }
      },
      // ...
    }),
  [/* deps */]
);
```

**Result:** Added back drag but introduced new issues

---

### Attempt 4: Simplify ResizeHandle

**File:** `ResizeHandle.tsx`

Removed Reanimated, used PanResponder:

```typescript
// Before: Complex Reanimated with useAnimatedStyle worklet
// After: Simple View with PanResponder

const panResponder = useMemo(
  () =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startBoundsRef.current = { ...elementBounds };
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new bounds
        onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
      },
      onPanResponderRelease: () => {
        onResizeEnd?.();
      },
    }),
  [/* deps */]
);
```

**Result:** Handles visible but resize not working

---

### Attempt 5: Fix handleTableResize

**File:** `FloorPlanCanvas.tsx`

Updated to also update position:

```typescript
const handleTableResize = useCallback(
  (tableId: string, bounds: { x: number; y: number; width: number; height: number }) => {
    // Calculate new center position from bounds (bounds.x/y is top-left)
    const newCenterX = bounds.x + bounds.width / 2;
    const newCenterY = bounds.y + bounds.height / 2;

    // Update position (center-based)
    onTableMove(tableId, newCenterX, newCenterY);

    // Update size
    if (onTableResize) {
      onTableResize(tableId, bounds.width, bounds.height);
    }
  },
  [onTableMove, onTableResize]
);
```

**Result:** Still not working - overall system unstable

---

## Files Modified (Before Revert)

| File | Original LOC | Modified LOC | Change |
|------|--------------|--------------|--------|
| `TableGestureOverlay.tsx` | 237 | 136 | -101 (simplified) |
| `ResizeHandle.tsx` | 309 | 227 | -82 (simplified) |
| `FloorPlanCanvas.tsx` | 447 | 411 | -36 (removed Layer 3) |
| `SettingsModal.tsx` | 587 | 587 | ~0 (style change only) |

**Total LOC Changed:** ~220 lines modified/removed

---

## File Structure (No New Files)

All changes were modifications to existing files:

```
/src/screens/settings/components/tableManagement/floorPlan/
├── FloorPlanCanvas.tsx      # Modified - removed ResizeHandle imports, simplified
├── TableGestureOverlay.tsx  # Modified - removed Reanimated, used PanResponder
├── ResizeHandle.tsx         # Modified - removed Reanimated, used PanResponder
└── SettingsModal.tsx        # Modified - removed flex: 0 from modalContainer
```

---

## Key Learnings

### 1. Reanimated Worklet Limitations
- JS variables cannot be accessed inside worklets
- Must use `useSharedValue` or `useDerivedValue`
- Props are captured at worklet creation time, not live

### 2. Coordinate System Complexity
- Tables use center-based positioning (x, y = center)
- Resize bounds use top-left based positioning (x, y = top-left)
- Must convert between systems when resizing corner handles

### 3. Two-Layer Architecture Challenges
- Layer 1 (SVG): Visual only, no touch
- Layer 2 (Views): Gesture handling
- Keeping them in sync is complex

### 4. PanResponder vs GestureHandler
- PanResponder: Simpler, works with View, no worklet issues
- GestureHandler: More powerful, but requires careful worklet handling

---

## Recommended Next Steps

1. **Keep original Reanimated code** - it's more performant
2. **Fix worklet issues properly** by converting ALL accessed variables to shared values
3. **Test incrementally** - fix one issue at a time
4. **Add ZoneGestureOverlay** for zone selection (similar pattern to TableGestureOverlay)

---

## Commands to Restore

If the stashed changes are needed:

```bash
git stash list  # Find the stash
git stash show -p stash@{0}  # View changes
git stash apply stash@{0}  # Apply without dropping
# OR
git stash pop stash@{0}  # Apply and drop
```

---

## Session Summary

**Started:** Investigating 4 bugs
**Identified:** Root causes for all 4
**Attempted:** 5 different fix approaches
**Result:** REVERTED - fixes introduced regressions
**Status:** Need fresh approach with incremental fixes
