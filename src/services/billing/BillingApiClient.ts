/**
 * Billing API Client
 * Handles all billing-related backend API calls
 */

import { apiClient } from '@/services/api/apiClient';

export interface SplitBillRequest {
  split_type: 'equal' | 'by_items' | 'by_payment';
  guest_count?: number;
  guests?: Array<{
    name: string;
    amount: number;
    items?: Array<{ item_id: string; quantity: number }>;
  }>;
}

export const billingApiClient = {
  /**
   * Find the active transaction for an order
   */
  getTransactionByOrderId: async (orderId: string): Promise<{ id: string } | null> => {
    try {
      const response = await apiClient.get<any>(`/api/billing/transactions?order_id=${orderId}&limit=1`);
      const data = response.data?.data;
      const items: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.transactions)
        ? data.transactions
        : Array.isArray(data?.data)
        ? data.data
        : [];
      if (items.length > 0) {
        return items[0] as { id: string };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Create a bill split for a transaction
   */
  splitBill: async (transactionId: string, data: SplitBillRequest): Promise<void> => {
    await apiClient.post(`/api/billing/transactions/${transactionId}/split`, data);
  },

  /**
   * Add a payment to a transaction
   */
  addPayment: async (transactionId: string, paymentData: { payment_method: string; amount: number }): Promise<void> => {
    await apiClient.post(`/api/billing/transactions/${transactionId}/payments`, paymentData);
  },

  /**
   * Fetch store billing configuration (tax rate, CC surcharge, etc.)
   */
  getStoreConfig: async (restaurantId: string): Promise<{ taxRate: number; taxName: string; ccPercentage: number }> => {
    try {
      const response = await apiClient.get(`/api/billing/store-config`, {
        params: { restaurant_id: restaurantId },
      });
      return response.data?.data || { taxRate: 0, taxName: 'Sales Tax', ccPercentage: 0 };
    } catch {
      return { taxRate: 0, taxName: 'Sales Tax', ccPercentage: 0 };
    }
  },
};
