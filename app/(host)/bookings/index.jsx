import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import bookingService from '../../../services/bookingService';

// Premium Theme
const COLORS = {
  navy: { 900: '#0A1628', 800: '#0F2137', 700: '#152A46' },
  gold: { 500: '#F59E0B' },
  emerald: { 500: '#10B981' },
  orange: { 500: '#F97316' },
  red: { 500: '#EF4444' },
  blue: { 500: '#3B82F6' },
  gray: { 400: '#9CA3AF', 500: '#6B7280' },
  white: '#FFFFFF',
};

const TABS = [
  { id: 'pending', label: 'Requests' },
  { id: 'confirmed', label: 'Upcoming' },
  { id: 'history', label: 'History' },
];

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

   const fetchBookings = async () => {
    try {
      const response = await bookingService.getHostBookings();
      
      // console.log("DEBUG HOST BOOKINGS:", JSON.stringify(response, null, 2));

      // ✅ FIX: Access the nested 'data.items'
      let items = [];
      
      // Case 1: Standard API Response { success: true, data: { items: [...] } }
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }
      // Case 2: Direct array (unlikely based on logs)
      else if (Array.isArray(response)) {
        items = response;
      }
      // Case 3: Items at root (unlikely)
      else if (response.items && Array.isArray(response.items)) {
        items = response.items;
      }

      // console.log("Parsed Items Length:", items.length);

      setBookings(items || []); // Ensure it's always an array
    } catch (error) {
      console.log('Error fetching bookings:', error);
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'confirmed':
        return bookings.filter(b => ['confirmed', 'ongoing'].includes(b.status));
      case 'history':
        return bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
      default:
        return bookings;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.emerald[500];
      case 'pending': return COLORS.orange[500];
      case 'ongoing': return COLORS.blue[500];
      case 'completed': return COLORS.gray[400];
      case 'cancelled': return COLORS.red[500];
      default: return COLORS.gray[500];
    }
  };

  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const startDate = new Date(item.startDateTime).toLocaleDateString();
    const endDate = new Date(item.endDateTime).toLocaleDateString();

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/(host)/bookings/${item.id || item._id}`)}
        style={styles.card}
      >
        <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
        
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{startDate}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          </View>

          {/* Car Info */}
          <Text style={styles.carName}>
            {item.car?.make} {item.car?.model} {item.car?.year}
          </Text>

          {/* Renter Info */}
          <View style={styles.renterRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.customer?.name?.[0] || 'G'}</Text>
            </View>
            <View>
              <Text style={styles.renterName}>{item.customer?.name || 'Guest'}</Text>
              <Text style={styles.durationText}>{item.durationHours} Hours Trip</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.totalPrice}</Text>
            </View>
          </View>

          {/* Action Hint */}
          {item.status === 'pending' && (
            <View style={styles.actionRow}>
              <Text style={styles.actionHint}>Review Request</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.gold[500]} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.navy[900], COLORS.navy[800]]} style={styles.header}>
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.headerContent}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Bookings</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* List */}
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.gold[500]} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={getFilteredBookings()}
            keyExtractor={(item) => item.id || item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchBookings(); }}
                tintColor={COLORS.gold[500]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-remove" size={60} color={COLORS.gray[500]} />
                <Text style={styles.emptyText}>No bookings found</Text>
                <Text style={styles.emptySub}>When you get bookings, they'll appear here.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },
  
  header: { paddingBottom: 15, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { paddingHorizontal: 20, paddingTop: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.navy[700], borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.white },

  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.navy[700], borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.navy[900] },
  tabText: { color: COLORS.gray[400], fontWeight: '600', fontSize: 13 },
  activeTabText: { color: COLORS.gold[500], fontWeight: '700' },

  body: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 50 },

  card: { backgroundColor: COLORS.navy[800], borderRadius: 16, marginBottom: 16, overflow: 'hidden', flexDirection: 'row', borderWidth: 1, borderColor: COLORS.navy[700] },
  statusStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 16 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateBadge: { backgroundColor: COLORS.navy[700], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dateText: { color: COLORS.gray[400], fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  carName: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 12 },

  renterRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.navy[700], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  renterName: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  durationText: { fontSize: 12, color: COLORS.gray[400] },
  
  priceContainer: { flex: 1, alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '700', color: COLORS.gold[500] },

  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12, gap: 4 },
  actionHint: { fontSize: 12, color: COLORS.gold[500], fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginTop: 16 },
  emptySub: { fontSize: 14, color: COLORS.gray[400], marginTop: 8 },
});