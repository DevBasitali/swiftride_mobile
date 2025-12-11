import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If logged in, go to correct area
  if (user) {
    return user.role === 'host' || user.role === 'showroom' 
      ? <Redirect href="/(host)/(tabs)" /> 
      : <Redirect href="/(customer)/(tabs)" />;
  }

  // Otherwise, go to login
  return <Redirect href="/(auth)/login" />;
}