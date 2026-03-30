/**
 * Refund API Service
 * Handles refund operations through the backend API gateway
 */

import { apiClient } from './apiClient';

export interface CreateRefundRequest {
  transaction_id: number;
  restaurant_id: number;
  amount: number;
  reason: string;
  method: 'original_payment' | 'cash' | 'store_credit';
  requested_by: number;
}

export interface RefundRecord {
  id: number;
  restaurant_id: number;
  transaction_id: number;
  amount: number;
  reason: string;
  method: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  requested_by: number;
  approved_by?: number;
  processed_by?: number;
  approved_at?: string;
  processed_at?: string;
  reference_number?: string;
  refund_guid?: string;
  approval_code?: string;
  gateway_error?: string;
  payment_method?: string;
  card_brand?: string;
  card_last_four?: string;
  created_at: string;
  transaction?: {
    id: number;
    order_number?: string;
    total_amount: number;
    status: string;
  };
}

export interface RefundListResponse {
  refunds: RefundRecord[];
  total: number;
}

/** Max refund amount per request (matches reference implementation) */
const MAX_REFUND_AMOUNT = 10000;

/** Validate refund amount client-side before sending to API */
export function validateRefundAmount(amount: number, maxRefundable: number): string | null {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return 'Invalid refund amount';
  }
  if (amount <= 0) {
    return 'Refund amount must be greater than $0.00';
  }
  if (amount > maxRefundable) {
    return `Refund amount exceeds remaining refundable amount ($${maxRefundable.toFixed(2)})`;
  }
  if (amount > MAX_REFUND_AMOUNT) {
    return `Refund amount exceeds maximum limit of $${MAX_REFUND_AMOUNT.toFixed(2)}`;
  }
  // Check decimal precision (max 2 decimal places)
  const parts = amount.toString().split('.');
  if (parts[1] && parts[1].length > 2) {
    return 'Refund amount cannot have more than 2 decimal places';
  }
  return null;
}

class RefundApiService {
  /**
   * Create a new refund request
   */
  async createRefund(data: CreateRefundRequest): Promise<RefundRecord> {
    const response = await apiClient.post<RefundRecord>('/api/billing/refunds', data);
    return response.data.data;
  }

  /**
   * Get a refund by ID
   */
  async getRefund(id: number): Promise<RefundRecord> {
    const response = await apiClient.get<RefundRecord>(`/api/billing/refunds/${id}`);
    return response.data.data;
  }

  /**
   * List refunds with optional filters
   */
  async getRefunds(
    filters?: { status?: string; transaction_id?: number; limit?: number; offset?: number }
  ): Promise<RefundListResponse> {
    const response = await apiClient.get<RefundListResponse>('/api/billing/refunds', {
      params: filters,
    });
    return response.data.data;
  }

  /**
   * Approve a pending refund (manager only)
   * Backend extracts restaurantId and userId from auth context
   */
  async approveRefund(id: number): Promise<RefundRecord> {
    const response = await apiClient.patch<RefundRecord>(
      `/api/billing/refunds/${id}/approve`
    );
    return response.data.data;
  }

  /**
   * Process an approved refund (manager only — triggers TRX gateway for card refunds)
   * Backend extracts restaurantId and userId from auth context
   */
  async processRefund(id: number): Promise<RefundRecord> {
    const response = await apiClient.patch<RefundRecord>(
      `/api/billing/refunds/${id}/process`
    );
    return response.data.data;
  }
}

export const refundService = new RefundApiService();
