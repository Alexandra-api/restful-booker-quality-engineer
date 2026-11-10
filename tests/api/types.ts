export interface BookingRequest {
  roomid: number;
  firstname: string;
  lastname: string;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  email: string;
  phone: string;
}

export interface BookingRecord extends BookingRequest {
  bookingid: number;
}

export interface BookingsResponse {
  bookings: BookingRecord[];
}

export interface Room {
  roomid: number;
  roomName: string;
  type: string;
  roomPrice: number;
}

export interface RoomsResponse {
  rooms: Room[];
}
