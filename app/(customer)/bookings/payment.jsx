import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
  gold: { 500: "#F59E0B" },
  white: "#FFFFFF",
  gray: { 400: "#9CA3AF", 500: "#6B7280" },
  green: { 500: "#10B981" },
  easypaisa: "#23A455", // EasyPaisa brand color
};

export default function PaymentScreen() {
  const { bookingId, amount, carName } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("easypaisa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber && selectedMethod === "easypaisa") {
      Alert.alert("Required", "Please enter your EasyPaisa number");
      return;
    }

    if (phoneNumber && phoneNumber.length !== 11) {
      Alert.alert("Invalid", "Please enter a valid 11-digit phone number");
      return;
    }

    setLoading(true);

    // 🎯 Simulate Payment Processing (like real gateway)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setLoading(false);

    Alert.alert(
      "✅ Payment Successful",
      `PKR ${amount} paid via ${
        selectedMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"
      }.\n\nYour booking is now pending host confirmation.`,
      [
        {
          text: "View My Trips",
          onPress: () => router.replace("/(customer)/(tabs)/bookings"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800]]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="car-sport" size={20} color={COLORS.gold[500]} />
            <Text style={styles.summaryText}>{carName || "Your Booking"}</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceValue}>PKR {amount}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

        {/* EasyPaisa */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === "easypaisa" && styles.methodActive,
          ]}
          onPress={() => setSelectedMethod("easypaisa")}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIcon, { backgroundColor: "#E8F5E9" }]}>
            <MaterialCommunityIcons
              name="wallet"
              size={28}
              color={COLORS.easypaisa}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>EasyPaisa</Text>
            <Text style={styles.methodDesc}>
              Pay with your EasyPaisa account
            </Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === "easypaisa" && styles.radioActive,
            ]}
          >
            {selectedMethod === "easypaisa" && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>

        {/* JazzCash */}
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === "jazzcash" && styles.methodActive,
          ]}
          onPress={() => setSelectedMethod("jazzcash")}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIcon, { backgroundColor: "#FFF3E0" }]}>
            <MaterialCommunityIcons name="cash" size={28} color="#FF6F00" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>JazzCash</Text>
            <Text style={styles.methodDesc}>Pay with your JazzCash wallet</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              selectedMethod === "jazzcash" && styles.radioActive,
            ]}
          >
            {selectedMethod === "jazzcash" && (
              <View style={styles.radioInner} />
            )}
          </View>
        </TouchableOpacity>

        {/* Payment Details Form */}
        {selectedMethod && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>
              {selectedMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"}{" "}
              Details
            </Text>

            <Text style={styles.inputLabel}>Mobile Account Number</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.prefix}>+92</Text>
              <TextInput
                style={styles.input}
                placeholder="3XXXXXXXXX"
                placeholderTextColor={COLORS.gray[500]}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle"
                size={18}
                color={COLORS.gold[500]}
              />
              <Text style={styles.infoText}>
                You'll receive a confirmation code on this number
              </Text>
            </View>
          </View>
        )}

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={COLORS.green[500]}
          />
          <Text style={styles.securityText}>Secured by SSL Encryption</Text>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Ionicons name="code-slash" size={18} color={COLORS.gold[500]} />
          <Text style={styles.demoText}>
            <Text style={{ fontWeight: "700" }}>Demo Mode:</Text> No actual
            payment will be charged. This simulates the payment flow for
            demonstration.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              loading
                ? [COLORS.gray[500], COLORS.gray[500]]
                : [COLORS.green[500], "#059669"]
            }
            style={styles.gradientBtn}
          >
            {loading ? (
              <>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.btnText}>Processing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={20} color={COLORS.white} />
                <Text style={styles.btnText}>Pay PKR {amount}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy[900] },

  header: {
    padding: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: { padding: 20, paddingBottom: 140 },

  summaryCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryText: { fontSize: 15, color: COLORS.white, fontWeight: "600" },
  priceBadge: {
    backgroundColor: COLORS.navy[700],
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  priceLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
  priceValue: { fontSize: 28, fontWeight: "700", color: COLORS.gold[500] },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gray[400],
    marginBottom: 16,
    letterSpacing: 1.2,
  },

  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.navy[700],
  },
  methodActive: {
    borderColor: COLORS.gold[500],
    backgroundColor: COLORS.navy[700],
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  methodDesc: { fontSize: 12, color: COLORS.gray[400] },

  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[500],
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderColor: COLORS.gold[500] },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold[500],
  },

  detailsCard: {
    backgroundColor: COLORS.navy[800],
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.gray[400],
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  prefix: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    height: "100%",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  infoText: { flex: 1, fontSize: 12, color: COLORS.gray[400], lineHeight: 18 },

  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  securityText: { fontSize: 13, color: COLORS.gray[400], fontWeight: "600" },

  demoNotice: {
    flexDirection: "row",
    backgroundColor: COLORS.navy[800],
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.navy[700],
    gap: 12,
  },
  demoText: { flex: 1, fontSize: 12, color: COLORS.gray[400], lineHeight: 18 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.navy[900],
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy[700],
  },
  btn: { borderRadius: 14, overflow: "hidden" },
  gradientBtn: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
