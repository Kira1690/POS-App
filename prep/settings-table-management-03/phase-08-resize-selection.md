# Phase 8: Table/Zone Selection & Resize Handles

**Date:** 2025-12-05
**Status:** IN PROGRESS (Changes Stashed)

---

## Objective

Implement proper table and zone selection with resize handles for the floor plan editor.

---

## Issues Addressed

| # | Issue | Status |
|---|-------|--------|
| 1 | Tables cannot be selected in select mode | INVESTIGATED |
| 2 | Settings modal content not visible | INVESTIGATED |
| 3 | Resize handles not appearing | INVESTIGATED |
| 4 | Zone selection not available | IDENTIFIED |

---

## Root Cause Analysis

### Issue 1: Table Selection Crash

**File:** `TableGestureOverlay.tsx` (Lines 68-69, 174-183)

**Finding:** Reanimated worklet accessing JavaScript thread variables

```typescript
// Problem: JS variables used inside worklet
const overlayWidth = totalSpace.width + 20;
const overlayHeight = totalSpace.height + 20;

const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    transform: [
      { translateX: translateX.value * zoom - overlayWidth / 2 },
      { translateY: translateY.value * zoom - overlayHeight / 2 },
    ],
  };
});
```

**Solution Required:** Convert `overlayWidth`, `overlayHeight`, and `zoom` to shared values

---

### Issue 2: Settings Modal Layout

**File:** `SettingsModal.tsx` (Line 88)

**Finding:** `flex: 0` on modalContainer prevents content expansion

```typescript
modalContainer: {
  flex: 0,  // Prevents child flex items from expanding
}
```

**Solution Required:** Remove `flex: 0` or change to `flex: 1`

---

### Issue 3: Resize Handles

**File:** `FloorPlanCanvas.tsx`

**Finding:** Two issues identified:
1. Handles don't render due to table selection crash
2. `handleTableResize` only updates width/height, not position

```typescript
// Current: Missing position update for corner handles
const handleTableResize = useCallback(
  (tableId, bounds) => {
    onTableResize(tableId, bounds.width, bounds.height);
    // Missing: position update when resizing from corners
  }
);
```

**Solution Required:**
1. Fix table selection crash first
2. Update `handleTableResize` to also call `onTableMove` with new center position

---

### Issue 4: Zone Selection

**File:** `FloorPlanCanvas.tsx`

**Finding:** No `ZoneGestureOverlay` component exists
- `TableGestureOverlay` handles table selection/drag
- Zones are SVG-only (visual, no touch interaction)
- `selectedZoneId` prop exists but cannot be set interactively

**Solution Required:** Create `ZoneGestureOverlay` component similar to `TableGestureOverlay`

---

## Code Changes Made

### 1. TableGestureOverlay.tsx

**Original:** 237 lines with Reanimated GestureHandler
**Modified:** Added shared values for worklet-safe access

```typescript
// Added shared values
const overlayWidthSV = useSharedValue(totalSpace.width + 20);
const overlayHeightSV = useSharedValue(totalSpace.height + 20);

// Update effect
React.useEffect(() => {
  overlayWidthSV.value = totalSpace.width + 20;
  overlayHeightSV.value = totalSpace.height + 20;
}, [totalSpace.width, totalSpace.height]);
```

**Alternative approach tested:** PanResponder-based implementation

```typescript
const panResponder = useMemo(
  () => PanResponder.create({
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
    onPanResponderRelease: (_, gesture) => {
      // Snap to grid logic
    },
  }),
  [dependencies]
);
```

---

### 2. ResizeHandle.tsx

**Original:** 309 lines with Reanimated animated transforms
**Modified:** PanResponder-based implementation

```typescript
const panResponder = useMemo(
  () => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startBoundsRef.current = { ...elementBounds };
    },
    onPanResponderMove: (_, gestureState) => {
      const deltaX = gestureState.dx / zoom;
      const deltaY = gestureState.dy / zoom;

      // Calculate new bounds based on handle position
      // Apply min width/height constraints
      // Apply snap to grid if enabled

      onResize({ x: newX, y: newY, width: newWidth, height: newHeight });
    },
    onPanResponderRelease: () => {
      onResizeEnd?.();
    },
  }),
  [dependencies]
);
```

---

### 3. FloorPlanCanvas.tsx

**Modified:** `handleTableResize` to update position

```typescript
const handleTableResize = useCallback(
  (tableId: string, bounds: { x: number; y: number; width: number; height: number }) => {
    // Calculate new center from top-left bounds
    const newCenterX = bounds.x + bounds.width / 2;
    const newCenterY = bounds.y + bounds.height / 2;

    // Update position
    onTableMove(tableId, newCenterX, newCenterY);

    // Update size
    if (onTableResize) {
      onTableResize(tableId, bounds.width, bounds.height);
    }
  },
  [onTableMove, onTableResize]
);
```

---

### 4. SettingsModal.tsx

**Modified:** Removed `flex: 0` from modalContainer style

```typescript
modalContainer: {
  width: '90%',
  maxWidth: 600,
  maxHeight: Dimensions.get('window').height - 100,
  backgroundColor: theme.colors.surface,
  // Removed: flex: 0
}
```

---

## Files Modified

| File | Lines Changed | Description |
|------|---------------|-------------|
| `TableGestureOverlay.tsx` | ~100 | Added shared values / PanResponder |
| `ResizeHandle.tsx` | ~80 | Converted to PanResponder |
| `FloorPlanCanvas.tsx` | ~15 | Fixed handleTableResize |
| `SettingsModal.tsx` | ~2 | Removed flex: 0 |

**Total Lines Changed:** ~197

---

## File Structure

```
/src/screens/settings/components/tableManagement/floorPlan/
├── FloorPlanCanvas.tsx        # Modified - handleTableResize fix
├── TableGestureOverlay.tsx    # Modified - worklet fix / PanResponder
├── ResizeHandle.tsx           # Modified - PanResponder implementation
├── SettingsModal.tsx          # Modified - flex layout fix
└── [Future] ZoneGestureOverlay.tsx  # To be created
```

---

## Technical Notes

### Reanimated Worklet Rules

1. Variables accessed in worklets must be:
   - Shared values (`useSharedValue`)
   - Derived values (`useDerivedValue`)
   - Or constants defined outside component

2. Props are captured at worklet creation time, not live values

3. To access props in worklets, either:
   - Convert to shared value and sync with useEffect
   - Use `runOnJS` to call JS functions

### Coordinate Systems

| System | Origin | Used By |
|--------|--------|---------|
| Center-based | Table center (x, y) | `FloorPlanTablePosition` |
| Top-left based | Top-left corner (x, y) | Resize bounds, zones |

When resizing tables from corners, must convert:
```typescript
// From top-left bounds to center position
const centerX = bounds.x + bounds.width / 2;
const centerY = bounds.y + bounds.height / 2;
```

---

## Next Steps

1. [ ] Finalize worklet variable handling approach
2. [ ] Test table selection without crash
3. [ ] Verify resize handles appear and function
4. [ ] Create `ZoneGestureOverlay` component
5. [ ] Test Settings modal content visibility
