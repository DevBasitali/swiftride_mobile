import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import bookingService from '../../../services/bookingService';
import carService from '../../../services/carService'; 

export default function HostBookings() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); 
  
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getHostBookings();
      const allBookings = response.items || [];

      // Filter pending vs others
      const pending = allBookings.filter(b => b.status === 'pending');
      const others = allBookings.filter(b => b.status !== 'pending');

      setRequests(pending);
      setHistory(others);
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const originalRequests = [...requests];
    setRequests(prev => prev.filter(b => b.id !== bookingId)); // Optimistic update

    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      Alert.alert('Success', `Booking ${newStatus === 'confirmed' ? 'Accepted' : 'Rejected'}`);
      fetchBookings(); 
    } catch (error) {
      setRequests(originalRequests); 
      Alert.alert('Error', 'Failed to update booking status.');
    }
  };

  const confirmAction = (id, status) => {
    Alert.alert(
      status === 'confirmed' ? 'Accept Booking' : 'Reject Booking',
      `Are you sure you want to ${status === 'confirmed' ? 'accept' : 'reject'} this request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: status === 'confirmed' ? 'default' : 'destructive', onPress: () => handleStatusUpdate(id, status) }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isPending = item.status === 'pending';
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.dateBox}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.dateText}>
                    {new Date(item.startDateTime).toLocaleDateString()} - {new Date(item.endDateTime).toLocaleDateString()}
                </Text>
            </View>
            <View style={[styles.badge, styles[`badge_${item.status}`]]}>
                <Text style={[styles.badgeText, styles[`text_${item.status}`]]}>{item.status}</Text>
            </View>
        </View>

        <View style={styles.cardBody}>
            <Image 
                source={{ uri: carService.getImageUrl(item.car?.primaryPhoto || item.car?.photos?.[0]) }} 
                style={styles.carImage} 
            />
            <View style={styles.infoCol}>
                <Text style={styles.carName}>{item.car?.make} {item.car?.model} {item.car?.year}</Text>
                <Text style={styles.customerName}>Customer: {item.customer?.name || 'User'}</Text>
                <Text style={styles.price}>${item.totalPrice} <Text style={styles.duration}>({item.durationHours} hrs)</Text></Text>
            </View>
        </View>

        {isPending && (
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => confirmAction(item.id, 'cancelled')}>
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => confirmAction(item.id, 'confirmed')}>
                    <LinearGradient colors={['#141E30', '#243B55']} style={styles.gradientBtn}>
                        <Text style={styles.acceptText}>Accept Request</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#141E30', '#243B55']} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking Manager</Text>
            <View style={{width: 40}} />
        </SafeAreaView>

        <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'requests' && styles.activeTab]} 
                onPress={() => setActiveTab('requests')}
            >
                <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Requests ({requests.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
                onPress={() => setActiveTab('history')}
            >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
            <ActivityIndicator size="large" color="#141E30" style={{marginTop: 50}} />
        ) : (
            <FlatList
                data={activeTab === 'requests' ? requests : history}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <FontAwesome name={activeTab === 'requests' ? "inbox" : "history"} size={50} color="#ddd" />
                        <Text style={styles.emptyText}>
                            {activeTab === 'requests' ? "No new requests." : "No booking history."}
                        </Text>
                    </View>
                }
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  activeTab: { backgroundColor: '#fff' },
  tabText: { color: '#ffffff80', fontWeight: '600' },
  activeTabText: { color: '#141E30', fontWeight: 'bold' },
  content: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 12, color: '#666', fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badge_pending: { backgroundColor: '#FFF3E0' },
  badge_confirmed: { backgroundColor: '#E8F5E9' },
  badge_cancelled: { backgroundColor: '#FFEBEE' },
  badge_completed: { backgroundColor: '#E3F2FD' },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  text_pending: { color: '#FF9800' },
  text_confirmed: { color: '#4CAF50' },
  text_cancelled: { color: '#F44336' },
  text_completed: { color: '#2196F3' },
  cardBody: { flexDirection: 'row', gap: 15 },
  carImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#eee' },
  infoCol: { flex: 1, justifyContent: 'center' },
  carName: { fontSize: 16, fontWeight: 'bold', color: '#141E30' },
  customerName: { fontSize: 13, color: '#888', marginTop: 2 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#141E30', marginTop: 6 },
  duration: { fontSize: 12, color: '#888', fontWeight: '400' },
  actionRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FFEBEE', alignItems: 'center', backgroundColor: '#FFF5F5' },
  rejectText: { color: '#D32F2F', fontWeight: 'bold' },
  acceptBtn: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 13, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 15, color: '#888', fontSize: 16 }
});