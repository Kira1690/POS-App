/**
 * useUndoRedo Hook
 * History management for floor plan undo/redo functionality
 */

import { useState, useCallback, useMemo } from 'react';
import {
  FloorPlanHistoryEntry,
  FloorPlanAction,
  FloorPlanSnapshot,
} from '@/types/settings/table-management.types';

const MAX_HISTORY_SIZE = 50;

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  onUndo?: (snapshot: FloorPlanSnapshot) => void;
  onRedo?: (snapshot: FloorPlanSnapshot) => void;
}

interface UseUndoRedoReturn {
  history: FloorPlanHistoryEntry[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (
    action: FloorPlanAction,
    description: string,
    before: FloorPlanSnapshot,
    after: FloorPlanSnapshot
  ) => void;
  undo: () => FloorPlanSnapshot | null;
  redo: () => FloorPlanSnapshot | null;
  clearHistory: () => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

/**
 * Hook for managing undo/redo history in the floor plan editor
 */
export const useUndoRedo = (options: UseUndoRedoOptions = {}): UseUndoRedoReturn => {
  const {
    maxHistorySize = MAX_HISTORY_SIZE,
    onUndo,
    onRedo,
  } = options;

  const [history, setHistory] = useState<FloorPlanHistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  /**
   * Whether undo is available
   */
  const canUndo = useMemo(() => currentIndex >= 0, [currentIndex]);

  /**
   * Whether redo is available
   */
  const canRedo = useMemo(
    () => currentIndex < history.length - 1,
    [currentIndex, history.length]
  );

  /**
   * Push a new history entry
   */
  const pushHistory = useCallback(
    (
      action: FloorPlanAction,
      description: string,
      before: FloorPlanSnapshot,
      after: FloorPlanSnapshot
    ) => {
      const newEntry: FloorPlanHistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        action,
        description,
        before,
        after,
      };

      setHistory(prev => {
        // Remove any entries after current index (discard redo stack when new action occurs)
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newEntry);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          return newHistory;
        }

        return newHistory;
      });

      setCurrentIndex(prev => {
        const newIndex = prev + 1;
        return Math.min(newIndex, maxHistorySize - 1);
      });
    },
    [currentIndex, maxHistorySize]
  );

  /**
   * Undo the last action
   */
  const undo = useCallback((): FloorPlanSnapshot | null => {
    if (!canUndo) {
      return null;
    }

    const entry = history[currentIndex];
    if (!entry) {
      return null;
    }

    setCurrentIndex(prev => prev - 1);

    if (onUndo) {
      onUndo(entry.before);
    }

    return entry.before;
  }, [canUndo, currentIndex, history, onUndo]);

  /**
   * Redo the previously undone action
   */
  const redo = useCallback((): FloorPlanSnapshot | null => {
    if (!canRedo) {
      return null;
    }

    const entry = history[currentIndex + 1];
    if (!entry) {
      return null;
    }

    setCurrentIndex(prev => prev + 1);

    if (onRedo) {
      onRedo(entry.after);
    }

    return entry.after;
  }, [canRedo, currentIndex, history, onRedo]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  /**
   * Get description of action that would be undone
   */
  const getUndoDescription = useCallback((): string | null => {
    if (!canUndo) {
      return null;
    }
    return history[currentIndex]?.description ?? null;
  }, [canUndo, currentIndex, history]);

  /**
   * Get description of action that would be redone
   */
  const getRedoDescription = useCallback((): string | null => {
    if (!canRedo) {
      return null;
    }
    return history[currentIndex + 1]?.description ?? null;
  }, [canRedo, currentIndex, history]);

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    clearHistory,
    getUndoDescription,
    getRedoDescription,
  };
};

export default useUndoRedo;
