import { expect, futureStay, test, uniqueGuest } from '../fixtures/booking-fixtures.js';
import { BookingPage } from '../pages/booking-page.js';

test('crea una reserva desde la UI y la verifica por API', async ({ api, page }) => {
  const stay = futureStay(63, 2);
  const availableRooms = await api.rooms.getAvailableRooms(stay.checkin, stay.checkout);
  expect(availableRooms.rooms.length).toBeGreaterThan(0);

  const room = availableRooms.rooms[0];
  const guestName = uniqueGuest('UI');
  const guest = {
    ...guestName,
    email: `${guestName.firstname.toLowerCase()}.${guestName.lastname.toLowerCase()}@example.com`,
    phone: '01234567890',
  };
  const bookingPage = new BookingPage(page);

  await test.step('abre la reserva para la habitación disponible', async () => {
    await bookingPage.open(room.roomid, stay.checkin, stay.checkout);
    await expect(bookingPage.initialHeading).toBeVisible();
  });

  await test.step('completa y confirma la reserva en la interfaz', async () => {
    await bookingPage.continueToGuestForm();
    await expect(bookingPage.firstnameInput).toBeVisible();
    await bookingPage.fillGuestDetails(guest);
    await bookingPage.reserve();
    await expect(bookingPage.confirmationHeading).toBeVisible();
    await expect(page.getByText(`${stay.checkin} - ${stay.checkout}`, { exact: true })).toBeVisible();
  });

  await test.step('comprueba por API la reserva confirmada', async () => {
    const booking = await api.bookings.findBooking(room.roomid, guest.firstname, guest.lastname);
    if (!booking) {
      throw new Error('The confirmed UI booking was not found through the booking API.');
    }
    expect(booking).toMatchObject({
      roomid: room.roomid,
      firstname: guest.firstname,
      lastname: guest.lastname,
      bookingdates: stay,
    });
  });
});
