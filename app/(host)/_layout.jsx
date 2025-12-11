import { Stack } from 'expo-router';

export default function HostLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      
      {/* Create Modal */}
      <Stack.Screen 
        name="car/create" 
        options={{ presentation: 'modal', title: 'List a Car' }} 
      />
      
      {/* Details Screen */}
      <Stack.Screen name="car/[id]" />

      {/* ✅ NEW: Edit Screen */}
      <Stack.Screen 
        name="car/edit/[id]" 
        options={{ title: 'Edit Car', headerShown: false }} 
      />
    </Stack>
  );
}