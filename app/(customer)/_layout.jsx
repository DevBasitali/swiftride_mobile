// app/(customer)/_layout.jsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getMyBookings } from '../../services/bookingService';
import { useLocationTracking } from '../../hooks/useLocationTracking';

// Background component that auto-tracks location for ongoing bookings
function BackgroundLocationTracker() {
  const [ongoingBookingId, setOngoingBookingId] = useState(null);

  // Fetch bookings to check for ongoing trip
  useEffect(() => {
    const checkOngoingBooking = async () => {
      try {
        // console.log('🔍 Checking for ongoing bookings...');
        const response = await getMyBookings();

        // getMyBookings returns response.data, which contains { data: { items: [...] } }
        let bookings = [];
        if (response?.data?.items) {
          bookings = response.data.items;
        } else if (Array.isArray(response?.data)) {
          bookings = response.data;
        } else if (Array.isArray(response)) {
          bookings = response;
        }

        // console.log('📋 Found bookings:', bookings.length);

        const ongoing = bookings.find(b => b.status === 'ongoing');

        if (ongoing) {
          const bookingIdToUse = ongoing.id || ongoing._id;
          // console.log('🚗 Found ongoing booking:', bookingIdToUse);
          setOngoingBookingId(bookingIdToUse);
        } else {
          console.log('ℹ️ No ongoing booking found');
          setOngoingBookingId(null);
        }
      } catch (error) {
        console.log('❌ Error checking bookings:', error.message);
      }
    };

    // Check immediately on mount
    checkOngoingBooking();

    // Check every 30 seconds for status changes
    const interval = setInterval(checkOngoingBooking, 30000);

    return () => clearInterval(interval);
  }, []);

  // Use the location tracking hook - this continuously tracks when ongoingBookingId exists
  // This hook uses watchPositionAsync which sends updates every 10 seconds automatically
  const { isTracking, error } = useLocationTracking(ongoingBookingId, !!ongoingBookingId);

  useEffect(() => {
    if (ongoingBookingId) {
      console.log(`📍 Location tracking status: ${isTracking ? 'ACTIVE' : 'STARTING'}, Booking: ${ongoingBookingId}`);
      if (error) {
        console.log('⚠️ Tracking error:', error);
      }
    }
  }, [isTracking, error, ongoingBookingId]);

  return null; // This component doesn't render anything
}

export default function CustomerLayout() {
  return (
    <>
      {/* Background tracker - always runs when customer is logged in */}
      <BackgroundLocationTracker />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="bookings/create"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}