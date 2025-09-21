/**
 * Cart Context - Focused on POS cart operations only
 * Follows Single Responsibility Principle - handles cart state and operations
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { MenuItem } from '@/types/menu.types';
import { Table } from '@/types/table.types';

// Cart item interface for POS operations
export interface CartItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  selectedTable: Table | null;
  isProcessing: boolean;
  error: string | null;
}

interface CartActions {
  // Cart operations
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  updateItem: (itemId: string, quantity: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  
  // Table selection
  setSelectedTable: (table: Table | null) => void;
  
  // Error handling
  setError: (error: string) => void;
  clearError: () => void;
  setProcessing: (processing: boolean) => void;
  
  // Calculations
  calculateTotal: () => number;
}

export interface CartContextValue extends CartState, CartActions {}

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: CartItem } }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SELECTED_TABLE'; payload: { table: Table | null } }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PROCESSING'; payload: { processing: boolean } }
  | { type: 'RECALCULATE_TOTALS' };

const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  selectedTable: null,
  isProcessing: false,
  error: null,
};

function calculateCartTotals(items: CartItem[]) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  return { total, itemCount };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.menu_item_id === action.payload.item.menu_item_id
      );
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.item.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload.item];
      }
      
      const { total, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity, notes: action.payload.notes }
          : item
      ).filter(item => item.quantity > 0);
      
      const { total, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId);
      const { total, itemCount } = calculateCartTotals(newItems);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };
    }
    
    case 'SET_SELECTED_TABLE':
      return {
        ...state,
        selectedTable: action.payload.table,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isProcessing: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.processing,
      };
    
    case 'RECALCULATE_TOTALS': {
      const { total, itemCount } = calculateCartTotals(state.items);
      return {
        ...state,
        total,
        itemCount,
      };
    }
    
    default:
      return state;
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  
  const addItem = useCallback((menuItem: MenuItem, quantity = 1, notes?: string) => {
    const cartItem: CartItem = {
      id: `item_${Date.now()}_${menuItem.id}`,
      order_id: '', // Will be set when order is created
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
      notes,
      category: menuItem.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_ITEM', payload: { item: cartItem } });
  }, []);
  
  const updateItem = useCallback((itemId: string, quantity: number, notes?: string) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity, notes } });
  }, []);
  
  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);
  
  const setSelectedTable = useCallback((table: Table | null) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: { table } });
  }, []);
  
  const calculateTotal = useCallback(() => {
    return state.total;
  }, [state.total]);
  
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { error } });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  
  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: { processing } });
  }, []);
  
  const contextValue: CartContextValue = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    setSelectedTable,
    calculateTotal,
    setError,
    clearError,
    setProcessing,
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
