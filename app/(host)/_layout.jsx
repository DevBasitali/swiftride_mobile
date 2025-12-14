// app/(host)/_layout.jsx
import { Stack } from "expo-router";

export default function HostLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="car/create"
        options={{ presentation: "modal", title: "List a Car" }}
      />
      <Stack.Screen name="car/[id]" />
      <Stack.Screen name="car/edit/[id]" />
      <Stack.Screen
        name="car/location-picker"
        options={{ presentation: "fullScreenModal", headerShown: false }}
      />
      <Stack.Screen
        name="bookings/index"
        options={{ title: "Bookings", headerShown: false }}
      />
    </Stack>
  );
}