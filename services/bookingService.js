// services/bookingService.js
import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};


export const getMyBookings = async () => {
  const response = await api.get('/bookings/me');
  return response.data;
};

export const getHostBookings = async () => {
  const response = await api.get('/bookings/owner'); // ✅ Check this endpoint
  return response.data; 
};

export const updateBookingStatus = async (bookingId, status, note = '') => {
  // ✅ Ensure URL is correct
  const response = await api.patch(`/bookings/${bookingId}/status`, { status, note });
  return response.data;
};

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