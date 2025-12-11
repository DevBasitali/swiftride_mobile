import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HostDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Host Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your business</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
           <Text style={styles.statNumber}>$0</Text>
           <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statCard}>
           <Text style={styles.statNumber}>0</Text>
           <Text style={styles.statLabel}>Active Bookings</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, marginHorizontal: 5, alignItems: 'center', shadowOpacity: 0.05 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  statLabel: { fontSize: 12, color: '#666' }
});