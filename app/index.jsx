import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  // ✅ 1. If Logged In: Go to Dashboard
  if (user) {
    return user.role === 'host' || user.role === 'showroom' 
      ? <Redirect href="/(host)/(tabs)" /> 
      : <Redirect href="/(customer)/(tabs)" />;
  }

  // ✅ 2. If Not Logged In: Start the App Flow (Splash -> Onboarding)
  // OLD: return <Redirect href="/(auth)/login" />;
  return <Redirect href="/splash" />;
}