import { test, expect, futureStay, uniqueGuest } from '../fixtures/booking-fixtures.js';
import type { BookingRequest } from './types.js';

const successfulCases = [
  { label: 'reserva Individual', dateOffset: 28 },
  { label: 'reserva Double', dateOffset: 35 },
];

test.describe('API de reservas', () => {
  for (const scenario of successfulCases) {
    test(`crea y consulta una ${scenario.label}`, async ({ api }) => {
      const stay = futureStay(scenario.dateOffset);
      const availableRooms = await api.rooms.getAvailableRooms(stay.checkin, stay.checkout);
      expect(availableRooms.rooms.length).toBeGreaterThan(0);

      const room = availableRooms.rooms[0];
      const guest = uniqueGuest(scenario.label);
      const payload: BookingRequest = {
        roomid: room.roomid,
        ...guest,
        depositpaid: false,
        bookingdates: stay,
        email: `${guest.firstname.toLowerCase()}@example.com`,
        phone: '01234567890',
      };

      const createResponse = await api.bookings.createBooking(payload);
      const createBody = await createResponse.text();
      expect(
        createResponse.status(),
        `Room ${room.roomid}, stay ${stay.checkin}..${stay.checkout}: ${createBody}`,
      ).toBe(201);

      const created = await api.bookings.findBooking(room.roomid, guest.firstname, guest.lastname);
      if (!created) {
        throw new Error('Created booking was not found in the room booking list.');
      }
      expect(created).toMatchObject({
        roomid: room.roomid,
        firstname: guest.firstname,
        lastname: guest.lastname,
        depositpaid: false,
        bookingdates: stay,
      });
      expect(created.bookingid).toBeGreaterThan(0);
    });
  }

  test('rechaza el nombre obligatorio ausente y no persiste la reserva', async ({ api }) => {
    const stay = futureStay(49);
    const availableRooms = await api.rooms.getAvailableRooms(stay.checkin, stay.checkout);
    expect(availableRooms.rooms.length).toBeGreaterThan(0);

    const room = availableRooms.rooms[0];
    const guest = uniqueGuest('missing-name');
    const invalidPayload = {
      roomid: room.roomid,
      lastname: guest.lastname,
      depositpaid: false,
      bookingdates: stay,
      email: `${guest.firstname.toLowerCase()}@example.com`,
      phone: '01234567890',
    };

    const response = await api.bookings.createBooking(invalidPayload);
    expect(response.status()).toBe(400);
    const errorBody: { errors?: string[] } = await response.json();
    expect(errorBody.errors).toContain('Firstname should not be blank');

    const roomBookings = await api.bookings.listBookings(room.roomid);
    expect(
      roomBookings.some(
        (booking) =>
          booking.lastname === guest.lastname &&
          booking.bookingdates.checkin === stay.checkin &&
          booking.bookingdates.checkout === stay.checkout,
      ),
    ).toBe(false);
  });
});
