// services/backgroundLocationService.js
// Background location tracking that works even when app is closed or phone is locked

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import Config from "../constants/Config";

const BACKGROUND_LOCATION_TASK = "background-location-tracking";
const API_BASE = Config.API_URL.replace("/api", "") + "/api"; // Use centralized config

// Store the current booking ID for background task
let currentBookingId = null;

// Define the background task - this runs even when app is closed
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("🔴 Background location error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location && currentBookingId) {
      console.log(
        "📍 [Background] Location update:",
        location.coords.latitude,
        location.coords.longitude,
      );

      // Get auth token from secure store
      try {
        const token = await SecureStore.getItemAsync("accessToken");

        if (token) {
          // Send via HTTP POST (sockets don't work in background)
          await axios.post(
            `${API_BASE}/bookings/${currentBookingId}/location`,
            {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              heading: location.coords.heading || 0,
              speed: location.coords.speed || 0,
              timestamp: new Date().toISOString(),
            },
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            },
          );
          console.log("✅ [Background] Location sent successfully");
        }
      } catch (err) {
        console.log("⚠️ [Background] Location send failed:", err.message);
      }
    }
  }
});

// Start background location tracking
export const startBackgroundTracking = async (bookingId) => {
  try {
    console.log("🚗 Starting background tracking for booking:", bookingId);

    // Request foreground permission first
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      console.log("❌ Foreground location permission denied");
      return false;
    }

    // Optional: Request background permission (can be skipped for Foreground Service in many cases)
    // We try it, but don't block if it fails or requires manual intervention
    try {
      await Location.requestBackgroundPermissionsAsync();
    } catch (e) {
      console.log("Bg permission request skipped/failed:", e.message);
    }

    // Store booking ID for the task
    currentBookingId = bookingId;

    // Check if already tracking
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
    if (hasStarted) {
      console.log("ℹ️ Background tracking already running");
      return true;
    }

    // 🕒 Small delay to ensure app is fully foregrounded after permission dialogs
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start background location updates with minimal notification
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: parseInt(
        process.env.EXPO_PUBLIC_LOCATION_INTERVAL_MS || "60000",
        10,
      ),
      distanceInterval: parseInt(
        process.env.EXPO_PUBLIC_LOCATION_DISTANCE_M || "50",
        10,
      ),
      deferredUpdatesInterval: parseInt(
        process.env.EXPO_PUBLIC_LOCATION_INTERVAL_MS || "60000",
        10,
      ),
      showsBackgroundLocationIndicator: false, // Hide iOS indicator
      foregroundService: {
        notificationTitle: "SwiftRide",
        notificationBody: "Trip in progress",
        notificationColor: "#1E3A5F", // Dark navy - subtle
      },
      // Android: Make notification as minimal as possible
      activityType: Location.ActivityType.AutomotiveNavigation,
      pausesUpdatesAutomatically: false,
    });

    console.log("✅ Background location tracking started");
    return true;
  } catch (error) {
    // ⚠️ Swallowing RedBox: "Foreground service cannot be started..."
    // This happens if app is backgrounded during start. We just log a warning.
    if (error.message && error.message.includes("Foreground service")) {
      console.warn("⚠️ Could not start background tracking (App in background). Will retry later.");
    } else {
      console.log("❌ Failed to start background tracking:", error.message);
    }
    return false;
  }
};

// Stop background location tracking
export const stopBackgroundTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log("🛑 Background location tracking stopped");
    }
    currentBookingId = null;
  } catch (error) {
    console.error("❌ Failed to stop background tracking:", error);
  }
};

// Check if background tracking is running
export const isBackgroundTrackingRunning = async () => {
  try {
    return await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    );
  } catch {
    return false;
  }
};

// Get current booking being tracked
export const getCurrentTrackingBookingId = () => currentBookingId;

// Set booking ID (used when restoring from storage)
export const setTrackingBookingId = (bookingId) => {
  currentBookingId = bookingId;
};

export default {
  startBackgroundTracking,
  stopBackgroundTracking,
  isBackgroundTrackingRunning,
  getCurrentTrackingBookingId,
  setTrackingBookingId,
  BACKGROUND_LOCATION_TASK,
};
