import type { Page } from '@playwright/test';

export interface BookingGuestDetails {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export class BookingPage {
  constructor(private readonly page: Page) {}

  get initialHeading() {
    return this.page.getByRole('heading', { name: 'Book This Room' });
  }

  get firstnameInput() {
    return this.page.getByRole('textbox', { name: 'Firstname' });
  }

  get lastnameInput() {
    return this.page.getByRole('textbox', { name: 'Lastname' });
  }

  get emailInput() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get phoneInput() {
    return this.page.getByRole('textbox', { name: 'Phone' });
  }

  get confirmationHeading() {
    return this.page.getByRole('heading', { name: 'Booking Confirmed' });
  }

  async open(roomId: number, checkin: string, checkout: string): Promise<void> {
    const query = new URLSearchParams({ checkin, checkout });
    await this.page.goto(`/reservation/${roomId}?${query.toString()}`);
  }

  async continueToGuestForm(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reserve Now' }).click();
  }

  async fillGuestDetails(guest: BookingGuestDetails): Promise<void> {
    await this.firstnameInput.fill(guest.firstname);
    await this.lastnameInput.fill(guest.lastname);
    await this.emailInput.fill(guest.email);
    await this.phoneInput.fill(guest.phone);
  }

  async reserve(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reserve Now' }).click();
  }
}
