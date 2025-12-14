import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🎨 Swift Ride Premium Theme
const COLORS = {
  background: '#0A1628',
  card: '#1E3A5F',
  gold: '#F59E0B',
  goldDark: '#D97706',
  white: '#FFFFFF',
  gray: '#94A3B8',
  success: '#10B981',
  danger: '#EF4444',
  border: '#2A4A73'
};

// 💰 Mock Data for Transactions
const TRANSACTIONS = [
  { id: '1', title: 'Payout for BMW X5', date: 'Today, 10:30 AM', amount: '+$450.00', type: 'credit' },
  { id: '2', title: 'Withdrawal to Bank', date: 'Yesterday, 4:00 PM', amount: '-$1,200.00', type: 'debit' },
  { id: '3', title: 'Payout for Tesla Model 3', date: 'Oct 24, 2023', amount: '+$320.00', type: 'credit' },
  { id: '4', title: 'Insurance Deduction', date: 'Oct 22, 2023', amount: '-$45.00', type: 'debit' },
  { id: '5', title: 'Payout for Audi A4', date: 'Oct 20, 2023', amount: '+$210.00', type: 'credit' },
];

export default function HostWallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 💳 PREMIUM BALANCE CARD */}
        <LinearGradient
          colors={[COLORS.gold, COLORS.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Total Balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <Ionicons 
                name={balanceVisible ? "eye" : "eye-off"} 
                size={20} 
                color="rgba(255,255,255,0.8)" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceVisible ? '$2,450.00' : '•••••••'}
          </Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>Pending</Text>
              <Text style={styles.footerValue}>$120.00</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>+12% this week</Text>
            </View>
          </View>
          
          {/* Decorative Circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </LinearGradient>

        {/* ⚡ QUICK ACTIONS */}
        <View style={styles.actionsContainer}>
          <ActionButton icon="arrow-down-circle-outline" label="Withdraw" />
          <ActionButton icon="document-text-outline" label="Statement" />
          <ActionButton icon="card-outline" label="Cards" />
          <ActionButton icon="settings-outline" label="Settings" />
        </View>

        {/* 📝 RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {TRANSACTIONS.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transLeft}>
                <View style={[styles.iconBox, item.type === 'debit' ? styles.debitIcon : styles.creditIcon]}>
                  <Ionicons 
                    name={item.type === 'credit' ? "arrow-down" : "arrow-up"} 
                    size={18} 
                    color={COLORS.white} 
                  />
                </View>
                <View>
                  <Text style={styles.transTitle}>{item.title}</Text>
                  <Text style={styles.transDate}>{item.date}</Text>
                </View>
              </View>
              <Text style={[styles.transAmount, item.type === 'credit' ? styles.textSuccess : styles.textDanger]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Buttons
const ActionButton = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBtn}>
    <View style={styles.actionIconBox}>
      <Ionicons name={icon} size={24} color={COLORS.gold} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  footerValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionBtn: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconBox: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
  },

  // Transactions
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  seeAll: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditIcon: {
    backgroundColor: COLORS.success,
  },
  debitIcon: {
    backgroundColor: COLORS.danger, // Red for withdrawals
  },
  transTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transDate: {
    color: COLORS.gray,
    fontSize: 12,
  },
  transAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSuccess: {
    color: COLORS.success,
  },
  textDanger: {
    color: COLORS.white, // Keep deduction text white or slightly muted
  }
});