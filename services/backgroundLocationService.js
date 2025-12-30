// services/backgroundLocationService.js
// Background location tracking that works even when app is closed or phone is locked

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const BACKGROUND_LOCATION_TASK = 'background-location-tracking';
const API_BASE = process.env.EXPO_PUBLIC_SERVER_IP
    ? `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT || 5000}/api`
    : 'http://localhost:5000/api';

// Store the current booking ID for background task
let currentBookingId = null;

// Define the background task - this runs even when app is closed
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('🔴 Background location error:', error);
        return;
    }

    if (data) {
        const { locations } = data;
        const location = locations[0];

        if (location && currentBookingId) {
            console.log('📍 [Background] Location update:', location.coords.latitude, location.coords.longitude);

            // Get auth token from secure store
            try {
                const token = await SecureStore.getItemAsync('accessToken');

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
                        }
                    );
                    console.log('✅ [Background] Location sent successfully');
                }
            } catch (err) {
                console.log('⚠️ [Background] Location send failed:', err.message);
            }
        }
    }
});

// Start background location tracking
export const startBackgroundTracking = async (bookingId) => {
    try {
        console.log('🚗 Starting background tracking for booking:', bookingId);

        // Request foreground permission first
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
            console.log('❌ Foreground location permission denied');
            return false;
        }

        // Request background permission
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
            console.log('❌ Background location permission denied - tracking will only work when app is open');
            // Continue anyway with foreground-only tracking
        }

        // Store booking ID for the task
        currentBookingId = bookingId;

        // Check if already tracking
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (hasStarted) {
            console.log('ℹ️ Background tracking already running');
            return true;
        }

        // Start background location updates
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // 10 seconds
            distanceInterval: 20, // 20 meters
            deferredUpdatesInterval: 10000,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: 'SwiftRide Tracking',
                notificationBody: 'Your car location is being shared for safety',
                notificationColor: '#4F46E5',
            },
        });

        console.log('✅ Background location tracking started');
        return true;
    } catch (error) {
        console.error('❌ Failed to start background tracking:', error);
        return false;
    }
};

// Stop background location tracking
export const stopBackgroundTracking = async () => {
    try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
            console.log('🛑 Background location tracking stopped');
        }
        currentBookingId = null;
    } catch (error) {
        console.error('❌ Failed to stop background tracking:', error);
    }
};

// Check if background tracking is running
export const isBackgroundTrackingRunning = async () => {
    try {
        return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
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
