// hooks/useLocationTracking.js
import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { sendLocation, connectSocket, disconnectSocket } from "../services/socketService";

/**
 * Hook for tracking and sending location updates
 * Used by CUSTOMER when their trip is ongoing
 */
export const useLocationTracking = (bookingId, isActive = false) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const watchRef = useRef(null);

    useEffect(() => {
        if (!isActive || !bookingId) return;

        let isMounted = true;

        const startTracking = async () => {
            try {
                // Request permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setError("Location permission denied");
                    return;
                }

                // Connect socket
                connectSocket();
                setIsTracking(true);

                // Start watching location
                // Time interval from env (defaults to 10 seconds)
                const intervalMs = Number(process.env.EXPO_PUBLIC_LOCATION_INTERVAL_MS) || 1000;

                watchRef.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: intervalMs,
                        distanceInterval: 10, // Update if moved 10 meters
                    },
                    (newLocation) => {
                        if (!isMounted) return;

                        const coords = newLocation.coords;
                        setLocation(coords);

                        // Send to server
                        sendLocation(bookingId, coords);
                        console.log("📍 Sent location:", coords.latitude, coords.longitude);
                    }
                );
            } catch (err) {
                console.error("Location tracking error:", err);
                setError(err.message);
            }
        };

        startTracking();

        // Cleanup
        return () => {
            isMounted = false;
            if (watchRef.current) {
                watchRef.current.remove();
                watchRef.current = null;
            }
            setIsTracking(false);
        };
    }, [bookingId, isActive]);

    // Stop tracking manually
    const stopTracking = () => {
        if (watchRef.current) {
            watchRef.current.remove();
            watchRef.current = null;
        }
        disconnectSocket();
        setIsTracking(false);
    };

    return {
        location,
        error,
        isTracking,
        stopTracking,
    };
};

export default useLocationTracking;
