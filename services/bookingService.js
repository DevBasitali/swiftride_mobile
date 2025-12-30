// services/bookingService.js
import api from "./api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { alertService } from "../context/AlertContext";

export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/me");
  return response.data;
};

export const getHostBookings = async () => {
  const response = await api.get("/bookings/owner"); // ✅ Check this endpoint
  return response.data;
};

export const updateBookingStatus = async (bookingId, status, note = "") => {
  // ✅ Ensure URL is correct
  const response = await api.patch(`/bookings/${bookingId}/status`, {
    status,
    note,
  });
  return response.data;
};

export const getBookingDetails = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * Initialize Safepay Payment
 * Calls the backend to create a Safepay checkout session
 * Returns the redirect URL to open in browser
 */
export const initSafepayPayment = async (bookingId) => {
  // Pass platform=mobile so backend returns deep link redirect URLs
  const response = await api.post(`/payments/booking/${bookingId}/safepay/init?platform=mobile`);
  return response.data;
};

export const downloadInvoice = async (bookingId) => {
  try {
    // Get the base URL from your api config
    const baseURL = api.defaults.baseURL || "http://your-api-url.com";
    const invoiceUrl = `${baseURL}/bookings/invoice/${bookingId}`;

    // Get auth token
    const token = api.defaults.headers.common["Authorization"];

    // Download file to local storage
    const fileUri = FileSystem.documentDirectory + `invoice_${bookingId}.pdf`;

    const downloadResult = await FileSystem.downloadAsync(invoiceUrl, fileUri, {
      headers: {
        Authorization: token,
      },
    });

    if (downloadResult.status === 200) {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Download Invoice",
        });
        return { success: true };
      } else {
        if (alertService.current) {
          alertService.current({
            title: "Success",
            message: "Invoice saved to: " + downloadResult.uri,
            type: "success"
          });
        }
        return { success: true, path: downloadResult.uri };
      }
    } else {
      throw new Error("Download failed");
    }
  } catch (error) {
    console.error("Invoice download error:", error);
    throw error;
  }
};

export default {
  createBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  getBookingDetails,
  downloadInvoice,
  initSafepayPayment,
};
