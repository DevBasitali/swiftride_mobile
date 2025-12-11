import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="car/[id]" />
      <Stack.Screen name="car/checkout" />
    </Stack>
  );
}