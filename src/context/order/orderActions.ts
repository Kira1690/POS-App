/**
 * Order Actions - Action creators for Order Context
 * Provides typed action creators for all order operations
 */

import { Dispatch } from 'react';
import {
  ExtendedOrder,
  ExtendedOrderItem,
  ExtendedOrderStatus,
  ExtendedPaymentStatus,
  OrderDraft,
  DateRange,
  SelectedModifier,
  generateOrderItemId,
  generateOrderNumber,
  calculateItemTotal,
  getStationForCategory,
} from '@/types/order-extended.types';
import { KitchenTicket, generateTicketId, formatModifiersForDisplay } from '@/types/kitchen-ticket.types';
import { Table } from '@/types/table.types';
import { MenuItemExtended, ModifierGroup, ComboDeal, AllergenType, DietaryTag } from '@/types/menu-management-extended.types';
import { OrderAction, OrderState } from './orderReducer';
import { orderStorageService, kitchenStorageService, syncQueueService } from '@/services/storage';

// ============== ACTION CREATORS ==============

/**
 * Create action creator functions that dispatch actions
 */
export const createOrderActions = (dispatch: Dispatch<OrderAction>, getState: () => OrderState) => {
  // ============== ORDER SESSION ==============

  const createOrder = (table: Table, guestCount?: number): void => {
    dispatch({ type: 'CREATE_ORDER', payload: { table, guestCount } });
  };

  const setCurrentOrder = (order: ExtendedOrder): void => {
    dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
  };

  const clearCurrentOrder = (): void => {
    dispatch({ type: 'CLEAR_CURRENT_ORDER' });
  };

  const setSelectedTable = (table: Table | null): void => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: table });
  };

  // ============== CART OPERATIONS ==============

  const addToCart = (
    menuItem: MenuItemExtended,
    selectedModifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string
  ): void => {
    const state = getState();
    const orderId = state.currentOrder?.id || '';

    // Calculate modifier total
    const { modifierTotal, itemTotal } = calculateItemTotal(
      menuItem.price,
      selectedModifiers,
      quantity
    );

    // Determine kitchen station
    const kitchenStation = getStationForCategory(
      menuItem.category_id,
      menuItem.category_id // Use category name if available
    );

    // Extract allergens and dietary tags
    const allergens: AllergenType[] = menuItem.allergens || [];
    const dietaryTags: DietaryTag[] = menuItem.dietary_tags || [];

    const orderItem: ExtendedOrderItem = {
      id: generateOrderItemId(),
      orderId,
      menuItemId: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      category: menuItem.category_id,
      categoryId: menuItem.category_id,
      imageUrl: menuItem.image_url,
      basePrice: menuItem.price,
      quantity,
      modifierTotal,
      itemTotal,
      selectedModifiers,
      dietaryTags,
      allergens,
      hasAllergenWarning: allergens.length > 0,
      kitchenStation,
      status: 'pending',
      estimatedPrepTime: menuItem.preparation_time_minutes,
      specialInstructions,
      isComboItem: false,
      addedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TO_CART', payload: orderItem });
  };

  const addComboToCart = (
    combo: ComboDeal,
    selections: Array<{
      comboItemId: string;
      menuItem: MenuItemExtended;
      modifiers?: SelectedModifier[];
    }>
  ): void => {
    const state = getState();
    const orderId = state.currentOrder?.id || '';
    const comboId = `combo_${Date.now()}`;

    // Add each combo item
    for (const selection of selections) {
      const { modifierTotal, itemTotal } = calculateItemTotal(
        selection.menuItem.price,
        selection.modifiers || [],
        1
      );

      const kitchenStation = getStationForCategory(
        selection.menuItem.category_id,
        selection.menuItem.category_id
      );

      const orderItem: ExtendedOrderItem = {
        id: generateOrderItemId(),
        orderId,
        menuItemId: selection.menuItem.id,
        name: selection.menuItem.name,
        description: selection.menuItem.description,
        category: selection.menuItem.category_id,
        categoryId: selection.menuItem.category_id,
        imageUrl: selection.menuItem.image_url,
        basePrice: 0, // Combo items use combo price
        quantity: 1,
        modifierTotal,
        itemTotal: 0, // Will be calculated with combo discount
        selectedModifiers: selection.modifiers || [],
        dietaryTags: selection.menuItem.dietary_tags || [],
        allergens: selection.menuItem.allergens || [],
        hasAllergenWarning: (selection.menuItem.allergens || []).length > 0,
        kitchenStation,
        status: 'pending',
        estimatedPrepTime: selection.menuItem.preparation_time_minutes,
        isComboItem: true,
        comboId,
        comboName: combo.name,
        comboDiscount: combo.savings_amount / selections.length,
        addedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TO_CART', payload: orderItem });
    }
  };

  const updateCartItem = (itemId: string, updates: Partial<ExtendedOrderItem>): void => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, updates } });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number): void => {
    dispatch({ type: 'UPDATE_CART_ITEM_QUANTITY', payload: { itemId, quantity } });
  };

  const updateCartItemModifiers = (
    itemId: string,
    modifiers: SelectedModifier[],
    basePrice: number
  ): void => {
    const { modifierTotal, itemTotal } = calculateItemTotal(
      basePrice,
      modifiers,
      1 // Will be recalculated with actual quantity
    );

    dispatch({
      type: 'UPDATE_CART_ITEM',
      payload: {
        itemId,
        updates: {
          selectedModifiers: modifiers,
          modifierTotal,
          // itemTotal will be recalculated in reducer based on quantity
        },
      },
    });
  };

  const removeFromCart = (itemId: string): void => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const clearCart = (): void => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setCartTaxRate = (rate: number): void => {
    dispatch({ type: 'SET_CART_TAX_RATE', payload: rate });
  };

  const setCartDiscount = (amount: number): void => {
    dispatch({ type: 'SET_CART_DISCOUNT', payload: amount });
  };

  // ============== ORDER SUBMISSION ==============

  const submitOrderToKitchen = async (): Promise<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    ticketIds?: string[];
    error?: string;
  }> => {
    const state = getState();

    if (!state.selectedTable || state.cart.length === 0) {
      return { success: false, error: 'No items in cart or table not selected' };
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const now = new Date().toISOString();
      const orderNumber = generateOrderNumber();

      // Create the order
      const order: ExtendedOrder = {
        id: state.currentOrder?.id || `order_${Date.now()}`,
        orderNumber,
        restaurantId: state.selectedTable.restaurant_id,
        tableId: state.selectedTable.id,
        tableName: state.selectedTable.table_number,
        guestCount: state.currentOrder?.guestCount || 1,
        createdBy: state.currentOrder?.createdBy || 'current_user',
        createdByName: state.currentOrder?.createdByName || 'Current User',
        items: state.cart,
        subtotal: state.cartSubtotal,
        taxRate: state.cartTaxRate,
        taxAmount: state.cartTaxAmount,
        discountAmount: state.cartDiscountAmount,
        tipAmount: 0,
        totalAmount: state.cartTotal,
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: state.currentOrder?.createdAt || now,
        updatedAt: now,
        submittedAt: now,
        kitchenTicketIds: [],
        pendingSync: true,
        created_at: state.currentOrder?.createdAt || now,
        updated_at: now,
      };

      // Generate kitchen tickets by station
      const ticketsByStation = new Map<string, ExtendedOrderItem[]>();
      for (const item of state.cart) {
        const station = item.kitchenStation;
        if (!ticketsByStation.has(station)) {
          ticketsByStation.set(station, []);
        }
        ticketsByStation.get(station)!.push(item);
      }

      const tickets: KitchenTicket[] = [];
      for (const [station, items] of ticketsByStation) {
        const hasAllergens = items.some((item) => item.hasAllergenWarning);
        const allergenItems = items
          .filter((item) => item.hasAllergenWarning)
          .map((item) => item.name);

        const maxPrepTime = Math.max(...items.map((i) => i.estimatedPrepTime || 10));

        const ticket: KitchenTicket = {
          id: generateTicketId(),
          orderId: order.id,
          orderNumber,
          tableId: state.selectedTable.id,
          tableName: state.selectedTable.table_number,
          guestCount: order.guestCount,
          station: station as any,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            modifiers: formatModifiersForDisplay(item.selectedModifiers),
            modifierDetails: item.selectedModifiers,
            status: 'pending',
            allergens: item.allergens,
            hasAllergenWarning: item.hasAllergenWarning,
            specialInstructions: item.specialInstructions,
            estimatedPrepTime: item.estimatedPrepTime,
          })),
          itemCount: items.length,
          completedItemCount: 0,
          status: 'pending',
          priority: 'normal',
          createdAt: now,
          estimatedPrepTime: maxPrepTime,
          hasAllergens,
          allergenItems,
          isRush: false,
          isOverdue: false,
          pendingSync: true,
        };

        tickets.push(ticket);
        order.kitchenTicketIds.push(ticket.id);
      }

      // Save to storage
      await orderStorageService.saveOrder(order);
      await kitchenStorageService.saveTickets(tickets);

      // Add to sync queue
      await syncQueueService.enqueue('order', order.id, 'create', order as any);
      for (const ticket of tickets) {
        await syncQueueService.enqueue('kitchen_ticket', ticket.id, 'create', ticket as any);
      }

      // Update state
      dispatch({ type: 'ADD_ORDER', payload: order });
      dispatch({ type: 'ADD_KITCHEN_TICKETS', payload: tickets });
      dispatch({ type: 'CLEAR_CURRENT_ORDER' });
      dispatch({ type: 'SET_SUBMITTING', payload: false });

      return {
        success: true,
        orderId: order.id,
        orderNumber,
        ticketIds: tickets.map((t) => t.id),
      };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      return { success: false, error: String(error) };
    }
  };

  const addItemsToExistingOrder = async (orderId: string): Promise<void> => {
    const state = getState();

    if (state.cart.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No items in cart' });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const existingOrder = await orderStorageService.getOrder(orderId);
      if (!existingOrder) {
        throw new Error('Order not found');
      }

      const now = new Date().toISOString();
      const updatedItems = [...existingOrder.items, ...state.cart];

      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.itemTotal, 0);
      const taxAmount = subtotal * existingOrder.taxRate;
      const total = subtotal + taxAmount - existingOrder.discountAmount;

      const updatedOrder: ExtendedOrder = {
        ...existingOrder,
        items: updatedItems,
        subtotal,
        taxAmount,
        totalAmount: total,
        updatedAt: now,
        pendingSync: true,
      };

      // Generate new tickets for new items only
      // Similar logic to submitOrderToKitchen...

      await orderStorageService.saveOrder(updatedOrder);
      await syncQueueService.enqueue('order', updatedOrder.id, 'update', updatedOrder as any);

      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      dispatch({ type: 'CLEAR_CART' });
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // ============== ORDER MANAGEMENT ==============

  const loadOrders = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await orderStorageService.initialize();
      const [activeOrders, historyOrders] = await Promise.all([
        orderStorageService.getActiveOrders(),
        orderStorageService.getOrderHistory(),
      ]);

      dispatch({ type: 'SET_ACTIVE_ORDERS', payload: activeOrders });
      dispatch({ type: 'SET_ORDER_HISTORY', payload: historyOrders });
      dispatch({ type: 'SET_ORDERS', payload: [...activeOrders, ...historyOrders] });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  };

  const loadActiveOrders = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const activeOrders = await orderStorageService.getActiveOrders();
      dispatch({ type: 'SET_ACTIVE_ORDERS', payload: activeOrders });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  };

  const refreshOrders = async (): Promise<void> => {
    await loadOrders();
  };

  const updateOrderStatus = async (
    orderId: string,
    status: ExtendedOrderStatus
  ): Promise<void> => {
    try {
      const updatedOrder = await orderStorageService.updateOrder(orderId, {
        status,
        updatedAt: new Date().toISOString(),
      });

      if (updatedOrder) {
        dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
        await syncQueueService.enqueue('order', orderId, 'update', { status });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  };

  const cancelOrder = async (orderId: string, reason: string): Promise<void> => {
    try {
      const updatedOrder = await orderStorageService.updateOrder(orderId, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (updatedOrder) {
        dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
        await syncQueueService.enqueue('order', orderId, 'update', {
          status: 'cancelled',
          cancellationReason: reason,
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  };

  // ============== ITEM STATUS ==============

  const updateItemStatus = async (
    orderId: string,
    itemId: string,
    status: string
  ): Promise<void> => {
    dispatch({
      type: 'UPDATE_ITEM_STATUS',
      payload: { orderId, itemId, status },
    });

    // Also update in storage
    const order = await orderStorageService.getOrder(orderId);
    if (order) {
      const updatedItems = order.items.map((item) =>
        item.id === itemId ? { ...item, status: status as any } : item
      );
      await orderStorageService.updateOrder(orderId, { items: updatedItems });
    }
  };

  // ============== KITCHEN TICKETS ==============

  const loadKitchenTickets = async (): Promise<void> => {
    try {
      await kitchenStorageService.initialize();
      const tickets = await kitchenStorageService.getActiveTickets();
      dispatch({ type: 'SET_KITCHEN_TICKETS', payload: tickets });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    }
  };

  // ============== FILTERS ==============

  const setSearchQuery = (query: string): void => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setStatusFilter = (status: ExtendedOrderStatus | 'all'): void => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  };

  const setPaymentStatusFilter = (status: ExtendedPaymentStatus | 'all'): void => {
    dispatch({ type: 'SET_PAYMENT_STATUS_FILTER', payload: status });
  };

  const setDateFilter = (range: DateRange | null): void => {
    dispatch({ type: 'SET_DATE_FILTER', payload: range });
  };

  const clearFilters = (): void => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // ============== UI STATE ==============

  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const setSelectedOrderId = (orderId: string | null): void => {
    dispatch({ type: 'SET_SELECTED_ORDER_ID', payload: orderId });
  };

  // ============== MODALS ==============

  const openModifierModal = (): void => {
    dispatch({ type: 'OPEN_MODIFIER_MODAL' });
  };

  const closeModifierModal = (): void => {
    dispatch({ type: 'CLOSE_MODIFIER_MODAL' });
  };

  const openComboModal = (): void => {
    dispatch({ type: 'OPEN_COMBO_MODAL' });
  };

  const closeComboModal = (): void => {
    dispatch({ type: 'CLOSE_COMBO_MODAL' });
  };

  const openSendToKitchenModal = (): void => {
    dispatch({ type: 'OPEN_SEND_TO_KITCHEN_MODAL' });
  };

  const closeSendToKitchenModal = (): void => {
    dispatch({ type: 'CLOSE_SEND_TO_KITCHEN_MODAL' });
  };

  // ============== DRAFTS ==============

  const saveDraft = async (): Promise<void> => {
    dispatch({ type: 'SAVE_DRAFT' });

    const state = getState();
    if (state.currentDraft) {
      await orderStorageService.saveDraft(state.currentDraft);
    }
  };

  const loadDraft = async (tableId: string): Promise<void> => {
    const draft = await orderStorageService.getDraftForTable(tableId);
    if (draft) {
      dispatch({ type: 'SET_CURRENT_DRAFT', payload: draft });
      // Restore cart from draft
      for (const item of draft.items) {
        dispatch({ type: 'ADD_TO_CART', payload: item });
      }
    }
  };

  const deleteDraft = async (draftId: string): Promise<void> => {
    await orderStorageService.deleteDraft(draftId);
    dispatch({ type: 'SET_CURRENT_DRAFT', payload: null });
  };

  // ============== SYNC ==============

  const syncOrders = async (): Promise<void> => {
    dispatch({ type: 'SET_SYNCING', payload: true });

    try {
      // Get unsynced items
      const unsyncedOrders = await orderStorageService.getUnsyncedOrders();
      const unsyncedTickets = await kitchenStorageService.getUnsyncedTickets();

      // In the future, this would call the API
      // For now, just mark as synced
      if (unsyncedOrders.length > 0) {
        await orderStorageService.markAsSynced(unsyncedOrders.map((o) => o.id));
      }
      if (unsyncedTickets.length > 0) {
        await kitchenStorageService.markAsSynced(unsyncedTickets.map((t) => t.id));
      }

      dispatch({ type: 'SET_LAST_SYNCED', payload: new Date().toISOString() });
      dispatch({ type: 'SET_PENDING_SYNC_COUNT', payload: 0 });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: String(error) });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  return {
    // Order Session
    createOrder,
    setCurrentOrder,
    clearCurrentOrder,
    setSelectedTable,

    // Cart Operations
    addToCart,
    addComboToCart,
    updateCartItem,
    updateCartItemQuantity,
    updateCartItemModifiers,
    removeFromCart,
    clearCart,
    setCartTaxRate,
    setCartDiscount,

    // Order Submission
    submitOrderToKitchen,
    addItemsToExistingOrder,

    // Order Management
    loadOrders,
    loadActiveOrders,
    refreshOrders,
    updateOrderStatus,
    cancelOrder,

    // Item Status
    updateItemStatus,

    // Kitchen Tickets
    loadKitchenTickets,

    // Filters
    setSearchQuery,
    setStatusFilter,
    setPaymentStatusFilter,
    setDateFilter,
    clearFilters,

    // UI State
    setError,
    clearError,
    setSelectedOrderId,

    // Modals
    openModifierModal,
    closeModifierModal,
    openComboModal,
    closeComboModal,
    openSendToKitchenModal,
    closeSendToKitchenModal,

    // Drafts
    saveDraft,
    loadDraft,
    deleteDraft,

    // Sync
    syncOrders,
  };
};

export type OrderActions = ReturnType<typeof createOrderActions>;
