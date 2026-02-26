/**
 * Sidebar Helper Utilities
 * Utilities for managing collapsible sidebar state and behavior
 * Following SOLID principles - Single Responsibility
 */

import { databaseService } from '@/services/database/DatabaseService';
import { now } from '@/services/database/helpers';
import { Easing } from 'react-native';

// Constants
export const SIDEBAR_EXPANDED_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 64; // Per wireframe specification
export const SIDEBAR_ANIMATION_DURATION = 300;

/**
 * Get sidebar width based on collapsed state
 */
export const getSidebarWidth = (isCollapsed: boolean): number => {
  return isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
};

/**
 * Get animation configuration for sidebar transitions
 */
export const getSidebarTransition = () => {
  return {
    duration: SIDEBAR_ANIMATION_DURATION,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: false, // Width animations require non-native driver
  };
};

/**
 * Save sidebar collapsed state to SQLite sync_metadata
 */
export const saveSidebarState = async (isCollapsed: boolean): Promise<void> => {
  try {
    if (!databaseService.isInitialized()) return;
    const db = databaseService.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('sidebar_collapsed', ?, ?)`,
      JSON.stringify(isCollapsed), now()
    );
  } catch (error) {
    console.error('Failed to save sidebar state:', error);
  }
};

/**
 * Load sidebar collapsed state from SQLite
 * Returns null if no saved state (so caller can use defaultCollapsed)
 */
export const loadSidebarState = async (): Promise<boolean | null> => {
  try {
    if (!databaseService.isInitialized()) return null;
    const db = databaseService.getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM sync_metadata WHERE key = 'sidebar_collapsed'`
    );
    if (row?.value) {
      return JSON.parse(row.value);
    }
    return null;
  } catch (error) {
    console.error('Failed to load sidebar state:', error);
    return null;
  }
};

/**
 * Clear sidebar state from SQLite
 * Useful for resetting to default behavior
 */
export const clearSidebarState = async (): Promise<void> => {
  try {
    if (!databaseService.isInitialized()) return;
    const db = databaseService.getDatabase();
    await db.runAsync(`DELETE FROM sync_metadata WHERE key = 'sidebar_collapsed'`);
  } catch (error) {
    console.error('Failed to clear sidebar state:', error);
  }
};

/**
 * Get text opacity for fade animation
 */
export const getTextOpacity = (isCollapsed: boolean): number => {
  return isCollapsed ? 0 : 1;
};

/**
 * Get icon position for animation
 * Centers icon when collapsed, left-aligns when expanded
 */
export const getIconPosition = (isCollapsed: boolean): 'center' | 'flex-start' => {
  return isCollapsed ? 'center' : 'flex-start';
};

/**
 * Calculate content panel width based on sidebar state
 */
export const getContentPanelWidth = (
  screenWidth: number,
  isCollapsed: boolean,
  sidebarMargin: number = 16
): number => {
  const sidebarWidth = getSidebarWidth(isCollapsed);
  return screenWidth - sidebarWidth - sidebarMargin * 2; // Account for margins on both sides
};

/**
 * Debounce function for search
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
