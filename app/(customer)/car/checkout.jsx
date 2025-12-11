import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Checkout() {
  const { carId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: 'Dec 12', end: 'Dec 15', days: 3 });
  
  // Dummy Price Calculation (Will connect to Backend later)
  const pricePerDay = 50; 
  const total = pricePerDay * dates.days;
  const serviceFee = 15;
  const grandTotal = total + serviceFee;

  const handlePayment = async () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Booking Successful', 'Your ride is confirmed!', [
        { text: 'View Trip', onPress: () => router.replace('/(customer)/(tabs)/bookings') }
      ]);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Confirm Booking', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* CAR SUMMARY */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Ride</Text>
            <View style={styles.carRow}>
                <View style={styles.placeholderImg}>
                    <FontAwesome name="car" size={30} color="#888" />
                </View>
                <View>
                    <Text style={styles.carTitle}>Toyota Camry</Text>
                    <Text style={styles.carSub}>Automatic • 4 Seats</Text>
                </View>
            </View>
        </View>

        {/* DATES */}
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.label}>Dates</Text>
                <TouchableOpacity>
                    <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.dateBox}>
                <Text style={styles.dateText}>{dates.start}  →  {dates.end}</Text>
                <Text style={styles.daysText}>({dates.days} days)</Text>
            </View>
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>${pricePerDay} x {dates.days} days</Text>
                <Text style={styles.priceValue}>${total}</Text>
            </View>
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service Fee</Text>
                <Text style={styles.priceValue}>${serviceFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${grandTotal}</Text>
            </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Pay ${grandTotal}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  
  carRow: { flexDirection: 'row', alignItems: 'center' },
  placeholderImg: { width: 60, height: 60, backgroundColor: '#eee', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  carTitle: { fontSize: 18, fontWeight: 'bold' },
  carSub: { color: '#666' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600' },
  editLink: { color: '#007AFF', fontWeight: 'bold' },
  dateBox: { backgroundColor: '#f0f9ff', padding: 15, borderRadius: 8 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  daysText: { color: '#666', marginTop: 5 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 15, color: '#666' },
  priceValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },

  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  payBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  payText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});