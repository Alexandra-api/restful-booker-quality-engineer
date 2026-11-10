import { test as base } from '@playwright/test';
import { AuthApiClient, BookingApiClient, RoomApiClient } from '../api/booking-api.js';

export interface ApiClients {
  bookings: BookingApiClient;
  rooms: RoomApiClient;
}

interface TestFixtures {
  api: ApiClients;
}

const baseUrl = process.env.BASE_URL ?? 'https://automationintesting.online';

export const test = base.extend<TestFixtures>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: baseUrl,
      extraHTTPHeaders: { Accept: 'application/json' },
      timeout: 15_000,
    });

    const auth = new AuthApiClient(request);
    const token = await auth.login(
      process.env.BOOKING_USERNAME ?? 'admin',
      process.env.BOOKING_PASSWORD ?? 'password',
    );

    await use({
      bookings: new BookingApiClient(request, token),
      rooms: new RoomApiClient(request),
    });
    await request.dispose();
  },
});

export { expect } from '@playwright/test';

export function futureStay(startOffsetDays: number, nights = 2): {
  checkin: string;
  checkout: string;
} {
  const checkin = new Date();
  checkin.setUTCHours(0, 0, 0, 0);
  checkin.setUTCDate(checkin.getUTCDate() + startOffsetDays);
  const checkout = new Date(checkin);
  checkout.setUTCDate(checkout.getUTCDate() + nights);

  return {
    checkin: checkin.toISOString().slice(0, 10),
    checkout: checkout.toISOString().slice(0, 10),
  };
}

export function uniqueGuest(seed: string): { firstname: string; lastname: string } {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const safeSeed = seed.replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
  return {
    firstname: `QA${safeSeed}${suffix.slice(0, 6)}`.slice(0, 18),
    lastname: `Test${suffix}`.slice(0, 30),
  };
}
