/**
 * Bill Repository - Bill data access implementation
 * Uses AsyncStorageAdapter for local persistence
 * API-ready: Can be swapped to use ApiAdapter when backend is ready
 */

import {
  IBillRepository,
  BillFilters,
  QueryOptions,
  QueryFilter,
  PaginatedResult,
} from './interfaces/IRepository';
import { AsyncStorageAdapter } from './adapters/AsyncStorageAdapter';
import {
  Bill,
  BillSplit,
  PaymentMethodSplit,
  SplitType,
  GuestSplit,
  generateGuestId,
  getGuestColor,
} from '@/types/billing.types';

const STORAGE_KEYS = {
  BILLS: 'all',
  UNPAID: 'unpaid',
  LAST_SYNC: 'last_sync',
};

export class BillRepository implements IBillRepository {
  private adapter: AsyncStorageAdapter;

  constructor(adapter?: AsyncStorageAdapter) {
    this.adapter = adapter || new AsyncStorageAdapter({ prefix: 'pos_bills_' });
  }

  // ============== BASE CRUD OPERATIONS ==============

  async getAll(): Promise<Bill[]> {
    const bills = await this.adapter.get<Bill[]>(STORAGE_KEYS.BILLS);
    return bills || [];
  }

  async getById(id: string): Promise<Bill | null> {
    const bills = await this.getAll();
    return bills.find((b) => b.orderId === id || b.orderId === id) || null;
  }

  async getByIds(ids: string[]): Promise<Bill[]> {
    const bills = await this.getAll();
    return bills.filter((b) => ids.includes(b.orderId));
  }

  async create(data: Partial<Bill>): Promise<Bill> {
    const bills = await this.getAll();

    const newBill: Bill = {
      orderId: data.orderId || '',
      orderNumber: data.orderNumber || '',
      tableId: data.tableId || '',
      tableName: data.tableName || '',
      guestCount: data.guestCount || 1,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      taxRate: data.taxRate || 0.0825,
      taxAmount: data.taxAmount || 0,
      discountAmount: data.discountAmount || 0,
      tipAmount: data.tipAmount || 0,
      totalAmount: data.totalAmount || 0,
      paymentStatus: data.paymentStatus || 'pending',
      paidAmount: data.paidAmount || 0,
      remainingAmount: data.totalAmount || 0,
      splitType: data.splitType || 'none',
      servedBy: data.servedBy || '',
      servedByName: data.servedByName || '',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    bills.push(newBill);
    await this.adapter.set(STORAGE_KEYS.BILLS, bills);
    await this.updateUnpaidBills(bills);

    return newBill;
  }

  async update(id: string, data: Partial<Bill>): Promise<Bill> {
    const bills = await this.getAll();
    const index = bills.findIndex((b) => b.orderId === id);

    if (index === -1) {
      throw new Error(`Bill for order ${id} not found`);
    }

    const updatedBill: Bill = {
      ...bills[index],
      ...data,
    };

    // Recalculate remaining amount
    updatedBill.remainingAmount = updatedBill.totalAmount - updatedBill.paidAmount;

    bills[index] = updatedBill;
    await this.adapter.set(STORAGE_KEYS.BILLS, bills);
    await this.updateUnpaidBills(bills);

    return updatedBill;
  }

  async delete(id: string): Promise<void> {
    const bills = await this.getAll();
    const filtered = bills.filter((b) => b.orderId !== id);
    await this.adapter.set(STORAGE_KEYS.BILLS, filtered);
    await this.updateUnpaidBills(filtered);
  }

  // ============== QUERY OPERATIONS ==============

  async query(options: QueryOptions<Bill>): Promise<Bill[]> {
    let bills = await this.getAll();

    if (options.filters) {
      bills = this.applyFilters(bills, options.filters);
    }

    if (options.sortBy) {
      bills = this.sortBills(bills, options.sortBy, options.sortOrder || 'desc');
    }

    if (options.offset !== undefined) {
      bills = bills.slice(options.offset);
    }
    if (options.limit !== undefined) {
      bills = bills.slice(0, options.limit);
    }

    return bills;
  }

  async queryPaginated(
    options: QueryOptions<Bill>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<Bill>> {
    let bills = await this.getAll();

    if (options.filters) {
      bills = this.applyFilters(bills, options.filters);
    }

    if (options.sortBy) {
      bills = this.sortBills(bills, options.sortBy, options.sortOrder || 'desc');
    }

    const total = bills.length;
    const offset = (page - 1) * pageSize;
    const items = bills.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    };
  }

  async count(filters?: QueryFilter<Bill>[]): Promise<number> {
    let bills = await this.getAll();
    if (filters) {
      bills = this.applyFilters(bills, filters);
    }
    return bills.length;
  }

  async exists(id: string): Promise<boolean> {
    const bill = await this.getById(id);
    return bill !== null;
  }

  // ============== BILL-SPECIFIC OPERATIONS ==============

  async getByOrderId(orderId: string): Promise<Bill | null> {
    const bills = await this.getAll();
    return bills.find((b) => b.orderId === orderId) || null;
  }

  async getByTable(tableId: string): Promise<Bill[]> {
    const bills = await this.getAll();
    return bills.filter((b) => b.tableId === tableId);
  }

  async getUnpaidBills(): Promise<Bill[]> {
    const unpaid = await this.adapter.get<Bill[]>(STORAGE_KEYS.UNPAID);
    return unpaid || [];
  }

  async getFiltered(filters: BillFilters): Promise<Bill[]> {
    let bills = await this.getAll();

    if (filters.orderId) {
      bills = bills.filter((b) => b.orderId === filters.orderId);
    }

    if (filters.tableId) {
      bills = bills.filter((b) => b.tableId === filters.tableId);
    }

    if (filters.paymentStatus) {
      bills = bills.filter((b) => b.paymentStatus === filters.paymentStatus);
    }

    if (filters.splitType) {
      bills = bills.filter((b) => b.splitType === filters.splitType);
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate).getTime();
      const end = new Date(filters.endDate).getTime();
      bills = bills.filter((b) => {
        const date = new Date(b.createdAt).getTime();
        return date >= start && date <= end;
      });
    }

    return bills.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateTip(id: string, tipAmount: number, tipPercentage?: number): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    const newTotal = bill.subtotal + bill.taxAmount - bill.discountAmount + tipAmount;

    return this.update(id, {
      tipAmount,
      tipPercentage,
      totalAmount: newTotal,
      remainingAmount: newTotal - bill.paidAmount,
    });
  }

  async updateDiscount(
    id: string,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    const discountAmount =
      discountType === 'percentage'
        ? Math.round(bill.subtotal * (discountValue / 100) * 100) / 100
        : discountValue;

    const newTotal = bill.subtotal + bill.taxAmount - discountAmount + bill.tipAmount;

    return this.update(id, {
      discountType,
      discountValue,
      discountAmount,
      totalAmount: newTotal,
      remainingAmount: newTotal - bill.paidAmount,
    });
  }

  async initializeSplit(
    id: string,
    splitType: SplitType,
    guestCount: number
  ): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    // Create guest splits based on type
    const guests: GuestSplit[] = [];

    if (splitType === 'equal' || splitType === 'by_items') {
      const amountPerGuest = Math.floor((bill.totalAmount * 100) / guestCount) / 100;
      const taxPerGuest = Math.floor((bill.taxAmount * 100) / guestCount) / 100;
      const remainder =
        Math.round((bill.totalAmount - amountPerGuest * guestCount) * 100) / 100;

      for (let i = 0; i < guestCount; i++) {
        guests.push({
          id: generateGuestId(),
          name: `Guest ${i + 1}`,
          color: getGuestColor(i),
          assignedItems: [],
          sharedItemsAmount: 0,
          subtotal: amountPerGuest - taxPerGuest,
          taxAmount: taxPerGuest,
          tipAmount: 0,
          total: i === 0 ? amountPerGuest + remainder : amountPerGuest,
          paymentStatus: 'pending',
        });
      }
    }

    const splitDetails: BillSplit = {
      orderId: bill.orderId,
      orderNumber: bill.orderNumber,
      splitType,
      originalSubtotal: bill.subtotal,
      originalTaxAmount: bill.taxAmount,
      originalTipAmount: bill.tipAmount,
      originalTotal: bill.totalAmount,
      guestCount,
      amountPerGuest:
        splitType === 'equal'
          ? Math.floor((bill.totalAmount * 100) / guestCount) / 100
          : undefined,
      guests,
      unassignedItems: bill.items.map((item) => item.id),
      totalAmount: bill.totalAmount,
      paidAmount: 0,
      remainingAmount: bill.totalAmount,
      isComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.update(id, {
      splitType,
      guestCount,
      splitDetails,
    });
  }

  async updateSplitDetails(id: string, splitDetails: BillSplit): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    // Update paid amount based on guest payments
    const paidAmount = splitDetails.guests.reduce((sum, guest) => {
      return guest.paymentStatus === 'paid' ? sum + guest.total : sum;
    }, 0);

    const isComplete = paidAmount >= bill.totalAmount;

    return this.update(id, {
      splitDetails: {
        ...splitDetails,
        paidAmount,
        remainingAmount: bill.totalAmount - paidAmount,
        isComplete,
        updatedAt: new Date().toISOString(),
      },
      paidAmount,
      remainingAmount: bill.totalAmount - paidAmount,
      paymentStatus: isComplete ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
    });
  }

  async recordPayment(id: string, payment: PaymentMethodSplit): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    const splitDetails = bill.splitDetails;
    if (splitDetails) {
      const paymentSplits = splitDetails.paymentSplits || [];
      paymentSplits.push(payment);

      const totalPaid = paymentSplits
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      return this.update(id, {
        splitDetails: {
          ...splitDetails,
          paymentSplits,
          paidAmount: totalPaid,
          remainingAmount: bill.totalAmount - totalPaid,
          isComplete: totalPaid >= bill.totalAmount,
          updatedAt: new Date().toISOString(),
        },
        paidAmount: totalPaid,
        remainingAmount: bill.totalAmount - totalPaid,
        paymentStatus:
          totalPaid >= bill.totalAmount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
      });
    }

    // No split - direct payment
    const newPaidAmount = bill.paidAmount + payment.amount;
    return this.update(id, {
      paidAmount: newPaidAmount,
      remainingAmount: bill.totalAmount - newPaidAmount,
      paymentStatus: newPaidAmount >= bill.totalAmount ? 'paid' : 'partial',
    });
  }

  async markAsPaid(id: string): Promise<Bill> {
    const bill = await this.getById(id);
    if (!bill) {
      throw new Error(`Bill ${id} not found`);
    }

    return this.update(id, {
      paymentStatus: 'paid',
      paidAmount: bill.totalAmount,
      remainingAmount: 0,
      printedAt: new Date().toISOString(),
    });
  }

  // ============== SYNC OPERATIONS ==============

  async getPendingSync(): Promise<Bill[]> {
    // Bills don't have pendingSync field, return all recent unpaid
    return this.getUnpaidBills();
  }

  async markSynced(id: string, syncedAt: string): Promise<void> {
    // No-op for now - bills don't track sync status
  }

  async markBatchSynced(ids: string[], syncedAt: string): Promise<void> {
    // No-op for now
  }

  async getLastSyncTime(): Promise<string | null> {
    return this.adapter.get<string>(STORAGE_KEYS.LAST_SYNC);
  }

  async setLastSyncTime(time: string): Promise<void> {
    await this.adapter.set(STORAGE_KEYS.LAST_SYNC, time);
  }

  // ============== HELPER METHODS ==============

  private async updateUnpaidBills(allBills: Bill[]): Promise<void> {
    const unpaid = allBills.filter((b) => b.paymentStatus !== 'paid');
    await this.adapter.set(STORAGE_KEYS.UNPAID, unpaid);
  }

  private applyFilters(bills: Bill[], filters: QueryFilter<Bill>[]): Bill[] {
    return bills.filter((bill) => {
      return filters.every((filter) => {
        const value = bill[filter.field as keyof Bill];
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'ne':
            return value !== filter.value;
          case 'gt':
            return (value as number) > (filter.value as number);
          case 'gte':
            return (value as number) >= (filter.value as number);
          case 'lt':
            return (value as number) < (filter.value as number);
          case 'lte':
            return (value as number) <= (filter.value as number);
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return (filter.value as unknown[]).includes(value);
          default:
            return true;
        }
      });
    });
  }

  private sortBills(
    bills: Bill[],
    sortBy: keyof Bill,
    sortOrder: 'asc' | 'desc'
  ): Bill[] {
    return [...bills].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === undefined || aVal === null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal === undefined || bVal === null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }
}

// ============== SINGLETON INSTANCE ==============

export const billRepository = new BillRepository();
