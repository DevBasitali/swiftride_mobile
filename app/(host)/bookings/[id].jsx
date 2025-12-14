import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import bookingService from '../../../services/bookingService';
import carService from '../../../services/carService';

// Premium Theme
const COLORS = {
  navy: { 900: '#0A1628', 800: '#0F2137', 700: '#152A46' },
  gold: { 500: '#F59E0B' },
  white: '#FFFFFF',
  gray: { 400: '#9CA3AF', 500: '#6B7280' },
  emerald: { 500: '#10B981' },
  red: { 500: '#EF4444' },
};

export default function BookingDetails() {
  const { id } = useLocalSearchParams(); // This is the booking ID
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await bookingService.getBookingDetails(id);
      setBooking(response.data?.booking || response.booking);
    } catch (error) {
      Alert.alert('Error', 'Could not load booking details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      // ✅ Status must be 'confirmed' or 'cancelled'
      console.log(`Updating booking ${id} to ${status}`);
      
      await bookingService.updateBookingStatus(id, status);
      
      Alert.alert('Success', `Booking ${status} successfully!`, [
        { text: 'OK', onPress: () => fetchDetails() }
      ]);
    } catch (error) {
      console.log("Update Error:", error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.gold[500]} />
      </View>
    );
  }

  if (!booking) return null;

  const startDate = new Date(booking.startDateTime).toLocaleDateString();
  const startTime = new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endDate = new Date(booking.endDateTime).toLocaleDateString();
  const endTime = new Date(booking.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient colors={[COLORS.navy[900], COLORS.navy[800]]} style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(booking.status) }]}>
            {booking.status.toUpperCase()}
          </Text>
          {booking.status === 'pending' && (
            <Text style={styles.statusSub}>Waiting for your approval</Text>
          )}
        </View>

        {/* Car Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VEHICLE</Text>
          <View style={styles.carCard}>
            <Image 
              source={{ uri: carService.getImageUrl(booking.car?.photos?.[0]) }} 
              style={styles.carImage} 
            />
            <View style={styles.carInfo}>
              <Text style={styles.carName}>{booking.car?.make} {booking.car?.model}</Text>
              <Text style={styles.carYear}>{booking.car?.year}</Text>
              <Text style={styles.plate}>{booking.car?.plateNumber}</Text>
            </View>
          </View>
        </View>

        {/* Renter Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RENTER</Text>
          <View style={styles.renterCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{booking.customer?.fullName?.[0]}</Text>
            </View>
            <View>
              <Text style={styles.renterName}>{booking.customer?.fullName}</Text>
              <Text style={styles.renterEmail}>{booking.customer?.email}</Text>
              <View style={styles.kycBadge}>
                <Ionicons name="checkmark-circle" size={12} color={COLORS.emerald[500]} />
                <Text style={styles.kycText}>KYC Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRIP SCHEDULE</Text>
          <View style={styles.tripCard}>
            <View style={styles.tripRow}>
              <View style={styles.tripDot} />
              <View>
                <Text style={styles.tripLabel}>Pickup</Text>
                <Text style={styles.tripDate}>{startDate} • {startTime}</Text>
              </View>
            </View>
            <View style={styles.tripLine} />
            <View style={styles.tripRow}>
              <View style={[styles.tripDot, { backgroundColor: COLORS.red[500] }]} />
              <View>
                <Text style={styles.tripLabel}>Return</Text>
                <Text style={styles.tripDate}>{endDate} • {endTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT</Text>
          <View style={styles.earningsCard}>
            <View style={styles.earningRow}>
              <Text style={styles.earningLabel}>Total Price</Text>
              <Text style={styles.earningValue}>${booking.totalPrice}</Text>
            </View>
            <View style={styles.earningDivider} />
            <View style={styles.earningRow}>
              <Text style={styles.netLabel}>Your Earnings</Text>
              <Text style={styles.netValue}>${booking.ownerEarningAmount}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Action Footer */}
      {booking.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.declineBtn} 
            onPress={() => handleStatusUpdate('cancelled')}
            disabled={actionLoading}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptBtn} 
            onPress={() => handleStatusUpdate('confirmed')}
            disabled={actionLoading}
          >
            <LinearGradient colors={[COLORS.gold[500], '#FBBF24']} style={styles.gradientBtn}>
              {actionLoading ? (
                <ActivityIndicator color={COLORS.navy[900]} />
              ) : (
                <Text style={styles.acceptText}>Accept Request</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return COLORS.emerald[500];
    case 'pending': return COLORS.gold[500];
    case 'completed': return COLORS.gray[400];
    case 'cancelled': return COLORS.red[500];
    default: return COLORS.white;
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.navy[900] },
  
  header: { paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, backgroundColor: COLORS.navy[700], borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  scroll: { padding: 20, paddingBottom: 100 },

  statusCard: { backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.navy[700], alignItems: 'center' },
  statusLabel: { color: COLORS.gray[400], fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  statusValue: { fontSize: 24, fontWeight: '800' },
  statusSub: { color: COLORS.gray[400], marginTop: 4, fontSize: 13 },

  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.gray[400], fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },

  carCard: { flexDirection: 'row', backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.navy[700] },
  carImage: { width: 80, height: 80, borderRadius: 12, marginRight: 15 },
  carInfo: { justifyContent: 'center' },
  carName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  carYear: { color: COLORS.gray[400], fontSize: 13, marginTop: 2 },
  plate: { color: COLORS.gold[500], fontSize: 12, marginTop: 4, fontWeight: '600', backgroundColor: COLORS.navy[700], alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  renterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.navy[700] },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.gold[500], justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: COLORS.navy[900], fontSize: 20, fontWeight: '700' },
  renterName: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  renterEmail: { color: COLORS.gray[400], fontSize: 13 },
  kycBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  kycText: { color: COLORS.emerald[500], fontSize: 12, fontWeight: '600' },

  tripCard: { backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.navy[700] },
  tripRow: { flexDirection: 'row', alignItems: 'center' },
  tripDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.emerald[500], marginRight: 15 },
  tripLine: { width: 2, height: 30, backgroundColor: COLORS.navy[600], marginLeft: 5, my: 4 },
  tripLabel: { color: COLORS.gray[400], fontSize: 12 },
  tripDate: { color: COLORS.white, fontSize: 15, fontWeight: '600', marginTop: 2 },

  earningsCard: { backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.navy[700] },
  earningRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningLabel: { color: COLORS.gray[400], fontSize: 14 },
  earningValue: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  earningDivider: { height: 1, backgroundColor: COLORS.navy[700], marginVertical: 12 },
  netLabel: { color: COLORS.gold[500], fontSize: 16, fontWeight: '700' },
  netValue: { color: COLORS.gold[500], fontSize: 20, fontWeight: '800' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.navy[900], padding: 20, borderTopWidth: 1, borderTopColor: COLORS.navy[700], flexDirection: 'row', gap: 15 },
  declineBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.red[500], justifyContent: 'center', alignItems: 'center' },
  declineText: { color: COLORS.red[500], fontWeight: '700' },
  acceptBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
  gradientBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  acceptText: { color: COLORS.navy[900], fontWeight: '700' },
});