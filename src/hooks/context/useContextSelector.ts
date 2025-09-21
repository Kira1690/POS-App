/**
 * Context Selector Hook - Performance optimization for React Context
 * Allows components to subscribe to only specific parts of context state
 * Prevents unnecessary re-renders when unrelated context data changes
 */

import { useContext, useMemo, useState, useEffect, useRef } from 'react';

/**
 * Hook for selecting specific data from a React Context
 * Only triggers re-render when the selected data actually changes
 * 
 * @param context - React Context to select from
 * @param selector - Function to select specific data from context
 * @param isEqual - Optional custom equality comparison function
 * @returns Selected data from context
 */
export function useContextSelector<TContext, TSelected>(
  context: React.Context<TContext>,
  selector: (state: TContext) => TSelected,
  isEqual?: (a: TSelected, b: TSelected) => boolean
): TSelected {
  // Get full context value
  const contextValue = useContext(context);
  
  if (contextValue === undefined) {
    throw new Error('useContextSelector must be used within a context provider');
  }
  
  // Memoize selector to avoid unnecessary recalculations
  const memoizedSelector = useMemo(() => selector, [selector]);
  
  // Select the specific data we need
  const selectedValue = useMemo(
    () => memoizedSelector(contextValue),
    [contextValue, memoizedSelector]
  );
  
  // Track previous value for comparison
  const prevSelectedValue = useRef<TSelected>(selectedValue);
  const [state, setState] = useState<TSelected>(selectedValue);
  
  // Update state only if selected value actually changed
  useEffect(() => {
    const hasChanged = isEqual 
      ? !isEqual(prevSelectedValue.current, selectedValue)
      : prevSelectedValue.current !== selectedValue;
    
    if (hasChanged) {
      prevSelectedValue.current = selectedValue;
      setState(selectedValue);
    }
  }, [selectedValue, isEqual]);
  
  return state;
}

/**
 * Default deep equality comparison for objects and arrays
 * Use for complex state selections that need deep comparison
 */
export function deepEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => 
      keysB.includes(key) && deepEqual((a as any)[key], (b as any)[key])
    );
  }
  
  return false;
}

/**
 * Shallow equality comparison for objects
 * Use for simple state selections with object values
 */
export function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  if (a === b) return true;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => a[key] === b[key]);
}