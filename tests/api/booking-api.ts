import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { BookingRequest, BookingRecord, BookingsResponse, RoomsResponse } from './types.js';

export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(username: string, password: string): Promise<string> {
    const response = await this.request.post('/api/auth/login', {
      data: { username, password },
    });

    if (!response.ok()) {
      throw new Error(`Demo API login failed with HTTP ${response.status()}.`);
    }

    const body: { token?: string } = await response.json();
    if (!body.token) {
      throw new Error('Demo API login succeeded without returning a token.');
    }
    return body.token;
  }
}

export class RoomApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getRooms(checkin: string, checkout: string): Promise<APIResponse> {
    const query = new URLSearchParams({ checkin, checkout });
    return this.request.get(`/api/room?${query.toString()}`);
  }

  async getAvailableRooms(checkin: string, checkout: string): Promise<RoomsResponse> {
    const response = await this.getRooms(checkin, checkout);
    if (!response.ok()) {
      throw new Error(`Room availability request failed with HTTP ${response.status()}.`);
    }
    const body: unknown = await response.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('rooms' in body) ||
      !Array.isArray(body.rooms)
    ) {
      throw new Error('Room availability response does not contain a rooms array.');
    }
    return body as RoomsResponse;
  }
}

export class BookingApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  createBooking(payload: object): Promise<APIResponse> {
    return this.request.post('/api/booking', { data: payload });
  }

  getBookings(roomId: number): Promise<APIResponse> {
    const query = new URLSearchParams({ roomid: String(roomId) });
    return this.request.get(`/api/booking?${query.toString()}`, {
      headers: { Cookie: `token=${this.token}` },
    });
  }

  getBooking(bookingId: number): Promise<APIResponse> {
    return this.request.get(`/api/booking/${bookingId}`, {
      headers: { Cookie: `token=${this.token}` },
    });
  }

  async listBookings(roomId: number): Promise<BookingRecord[]> {
    const response = await this.getBookings(roomId);
    if (!response.ok()) {
      throw new Error(`Booking lookup failed with HTTP ${response.status()}.`);
    }
    const body: unknown = await response.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('bookings' in body) ||
      !Array.isArray(body.bookings)
    ) {
      throw new Error('Booking lookup response does not contain a bookings array.');
    }
    return (body as BookingsResponse).bookings;
  }

  async findBooking(roomId: number, firstname: string, lastname: string): Promise<BookingRecord | undefined> {
    const bookings = await this.listBookings(roomId);
    return bookings.find(
      (booking) => booking.firstname === firstname && booking.lastname === lastname,
    );
  }
}

export type { BookingRequest };
