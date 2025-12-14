// app/(customer)/_layout.jsx
import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="car/[id]" options={{ headerShown: false }} />
      <Stack.Screen 
        name="bookings/create" 
        options={{ presentation: 'modal', headerShown: false }} 
      />
    </Stack>
  );
}