import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
  navy: {
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  emerald: {
    500: "#10B981",
  },
  white: "#FFFFFF",
  gray: {
    400: "#9CA3AF",
  }
};

const ActiveTripCard = ({ booking }) => {
  if (!booking) return null;

  const { car, status, totalAmount } = booking;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push(`/(customer)/bookings/${booking.id || booking._id}`)}
      style={styles.container}
    >
      <LinearGradient
        colors={[COLORS.navy[700], COLORS.navy[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header Badge */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>Active Trip</Text>
          </View>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.carName} numberOfLines={1}>
              {car?.make} {car?.model}
            </Text>
            <Text style={styles.plateNumber}>{car?.plateNumber}</Text>
            
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.gold[500]} />
              <Text style={styles.metaText}>Drop-off pending</Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
             <Image 
                source={{ uri: car?.photos?.[0] || 'https://via.placeholder.com/150' }} 
                style={styles.carImage}
                resizeMode="cover"
             />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/(customer)/bookings/${booking.id || booking._id}`)}
        >
            <Text style={styles.actionBtnText}>View Trip Details</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.navy[800]} />
        </TouchableOpacity>

      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald[500] + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald[500],
  },
  badgeText: {
    color: COLORS.emerald[500],
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    color: COLORS.gray[400],
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  carName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  plateNumber: {
    color: COLORS.gray[400],
    fontSize: 13,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.gold[500],
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    width: 100,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.navy[600],
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  actionBtn: {
    backgroundColor: COLORS.gold[500],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: COLORS.navy[800],
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ActiveTripCard;
