import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import carService from '../../../services/carService';
import bookingService from '../../../services/bookingService';

export default function CreateBooking() {
  const { carId } = useLocalSearchParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Default: Start tomorrow 10 AM, End tomorrow 6 PM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const initialEnd = new Date(tomorrow);
  initialEnd.setHours(18, 0, 0, 0);

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(initialEnd);
  
  // Date Picker Visibility
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'

  useEffect(() => {
    loadCar();
  }, [carId]);

  const loadCar = async () => {
    try {
      const response = await carService.getCarById(carId);
      setCar(response.data?.car || response.car);
    } catch (error) {
      Alert.alert('Error', 'Car not found');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // --- Date Logic ---
  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  const openPicker = (type, mode) => {
    setPickerMode(mode);
    if (type === 'start') setShowStartPicker(true);
    else setShowEndPicker(true);
  };

  // --- Calculations ---
  const calculateTotal = () => {
    if (!car) return 0;
    const diffMs = endDate - startDate;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 0;

    // Use hourly rate if available, otherwise calc from daily
    const hourlyRate = car.pricePerHour || (car.pricePerDay / 24);
    return (diffHours * hourlyRate).toFixed(2);
  };

  const durationHours = () => {
    const diffMs = endDate - startDate;
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  };

  // --- Submit ---
  // Inside app/(customer)/bookings/create.jsx

  const handleConfirm = async () => {
    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ FIX: Use 'startDate' and 'endDate' to match Joi Schema
      const payload = {
        carId: car._id,
        startDate: startDate.toISOString(), // Was startDateTime
        endDate: endDate.toISOString()      // Was endDateTime
      };

      await bookingService.createBooking(payload);

      Alert.alert('Booking Requested!', 'The host has been notified. You can track status in My Bookings.', [
        { text: 'View Bookings', onPress: () => router.replace('/(customer)/(tabs)/bookings') },
        { text: 'Go Home', onPress: () => router.push('/(customer)/(tabs)') }
      ]);

    } catch (error) {
      console.log(error);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#141E30" /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <LinearGradient colors={['#141E30', '#243B55']} style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
             <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review & Book</Text>
          <View style={{width: 40}} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* CAR SUMMARY */}
        <View style={styles.card}>
            <Image source={{ uri: carService.getImageUrl(car.photos?.[0]) }} style={styles.thumb} />
            <View style={{flex: 1}}>
                <Text style={styles.carName}>{car.make} {car.model} {car.year}</Text>
                <Text style={styles.price}>${car.pricePerDay}<Text style={styles.per}>/day</Text></Text>
                <View style={styles.locRow}>
                    <Ionicons name="location-sharp" size={12} color="#888" />
                    <Text style={styles.locText} numberOfLines={1}>{car.location?.address}</Text>
                </View>
            </View>
        </View>

        {/* DATE PICKERS */}
        <View style={styles.section}>
            <Text style={styles.label}>Trip Dates</Text>
            
            {/* Start Date */}
            <View style={styles.dateRow}>
                <View style={styles.dateIcon}><FontAwesome5 name="calendar-alt" size={20} color="#007AFF" /></View>
                <View style={{flex: 1}}>
                    <Text style={styles.dateLabel}>Start Date</Text>
                    <View style={styles.pickerBtns}>
                        <TouchableOpacity onPress={() => openPicker('start', 'date')}><Text style={styles.pickerText}>{startDate.toLocaleDateString()}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openPicker('start', 'time')}><Text style={styles.pickerText}>{startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text></TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.connector} />

            {/* End Date */}
            <View style={styles.dateRow}>
                <View style={[styles.dateIcon, { backgroundColor: '#FFF0F0' }]}><FontAwesome5 name="flag-checkered" size={20} color="#FF3B30" /></View>
                <View style={{flex: 1}}>
                    <Text style={styles.dateLabel}>End Date</Text>
                    <View style={styles.pickerBtns}>
                        <TouchableOpacity onPress={() => openPicker('end', 'date')}><Text style={styles.pickerText}>{endDate.toLocaleDateString()}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => openPicker('end', 'time')}><Text style={styles.pickerText}>{endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.section}>
            <Text style={styles.label}>Price Breakdown</Text>
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Duration</Text>
                <Text style={styles.rowVal}>{durationHours()} Hours</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.rowLabel}>Rate</Text>
                <Text style={styles.rowVal}>${car.pricePerHour ? `${car.pricePerHour}/hr` : `${car.pricePerDay}/day`}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total Estimated</Text>
                <Text style={styles.totalVal}>${calculateTotal()}</Text>
            </View>
        </View>

        {/* --- HIDDEN PICKERS (Android/iOS Logic) --- */}
        {showStartPicker && (
            <DateTimePicker value={startDate} mode={pickerMode} is24Hour={false} onChange={onChangeStart} />
        )}
        {showEndPicker && (
            <DateTimePicker value={endDate} mode={pickerMode} is24Hour={false} onChange={onChangeEnd} />
        )}

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={handleConfirm} disabled={submitting}>
            <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Confirm Request</Text>}
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },

  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  thumb: { width: 80, height: 60, borderRadius: 8, backgroundColor: '#eee', marginRight: 15 },
  carName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginTop: 2 },
  per: { color: '#888', fontWeight: '400', fontSize: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  locText: { color: '#888', fontSize: 12, flex: 1 },

  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#141E30', marginBottom: 15, textTransform: 'uppercase' },
  
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dateLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  pickerBtns: { flexDirection: 'row', gap: 15 },
  pickerText: { fontSize: 16, fontWeight: '600', color: '#333', textDecorationLine: 'underline' },
  
  connector: { height: 20, width: 2, backgroundColor: '#eee', marginLeft: 19, marginVertical: 5 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#666' },
  rowVal: { fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#141E30' },
  totalVal: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  btn: { borderRadius: 12, overflow: 'hidden' },
  gradientBtn: { padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});