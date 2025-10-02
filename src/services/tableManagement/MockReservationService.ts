/**
 * Mock Reservation Service
 * In-memory implementation for reservation management
 * Following SOLID principles - Single Responsibility
 */

import {
  Reservation,
  CreateReservationRequest,
  Table,
  TableStatus,
  ReservationStatus,
} from '@/types/settings/table-management.types';
import { IReservationService } from './interfaces';
import { MOCK_RESERVATIONS, MOCK_TABLES } from './mockData';

export class MockReservationService implements IReservationService {
  private reservations: Reservation[] = [...MOCK_RESERVATIONS];
  private delay = 500; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async getReservations(
    restaurantId: string,
    date: Date
  ): Promise<Reservation[]> {
    await this.simulateDelay();

    const dateStr = date.toISOString().split('T')[0];
    return this.reservations.filter(
      (r) =>
        r.restaurant_id === restaurantId &&
        r.reservation_date.toISOString().split('T')[0] === dateStr
    );
  }

  async getReservation(reservationId: string): Promise<Reservation> {
    await this.simulateDelay();

    const reservation = this.reservations.find(
      (r) => r.id === reservationId
    );
    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`);
    }
    return reservation;
  }

  async createReservation(
    data: CreateReservationRequest
  ): Promise<Reservation> {
    await this.simulateDelay();

    const newReservation: Reservation = {
      id: `res_${Date.now()}`,
      ...data,
      table_id: data.table_id || 'auto_assigned',
      status: ReservationStatus.PENDING,
      send_confirmation: data.send_confirmation ?? true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'current_user',
    };

    this.reservations.push(newReservation);
    return newReservation;
  }

  async updateReservation(
    id: string,
    data: Partial<Reservation>
  ): Promise<Reservation> {
    await this.simulateDelay();

    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reservation not found: ${id}`);
    }

    this.reservations[index] = {
      ...this.reservations[index],
      ...data,
      updated_at: new Date(),
    };

    return this.reservations[index];
  }

  async cancelReservation(id: string, reason: string): Promise<void> {
    await this.simulateDelay();

    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error(`Reservation not found: ${id}`);
    }

    this.reservations[index] = {
      ...this.reservations[index],
      status: ReservationStatus.CANCELLED,
      special_requests: `${this.reservations[index].special_requests || ''}\nCancellation reason: ${reason}`,
      updated_at: new Date(),
    };
  }

  async checkAvailability(
    restaurantId: string,
    partySize: number,
    dateTime: Date
  ): Promise<Table[]> {
    await this.simulateDelay();

    // Find tables with enough capacity and available
    const availableTables = MOCK_TABLES.filter(
      (t) =>
        t.restaurant_id === restaurantId &&
        t.capacity >= partySize &&
        t.status === TableStatus.AVAILABLE &&
        t.allow_online_booking
    );

    // Sort by capacity (smaller suitable tables first)
    return availableTables.sort((a, b) => a.capacity - b.capacity);
  }
}
