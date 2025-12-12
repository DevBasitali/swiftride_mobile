import api from './api';

// --- CUSTOMER FUNCTIONS ---

// 1. Create a New Booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

// 2. Get My Bookings (For Customer Tab)
export const getMyBookings = async () => {
  const response = await api.get('/bookings/me');
  return response.data;
};

// --- HOST FUNCTIONS ---

// 3. Get Host's Bookings (Requests & History)
export const getHostBookings = async () => {
  const response = await api.get('/bookings/owner');
  return response.data; 
};

// 4. Update Booking Status (Accept/Reject)
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.patch(`/bookings/${bookingId}/status`, { status });
  return response.data;
};

// 5. Get Single Booking Detail
export const getBookingDetails = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export default {
  createBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  getBookingDetails
};