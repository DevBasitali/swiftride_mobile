import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { initSafepayPayment } from "../../../services/bookingService";

const COLORS = {
    navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46", 600: "#1E3A5F" },
    gold: { 500: "#F59E0B" },
    white: "#FFFFFF",
    gray: { 400: "#9CA3AF", 500: "#6B7280" },
    green: { 500: "#10B981" },
    safepay: "#6366F1",
};

export default function PaymentScreen() {
    const { bookingId, amount, carName } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!bookingId) {
            Alert.alert("Error", "Booking ID is missing. Please try again.");
            return;
        }

        setLoading(true);

        try {
            const response = await initSafepayPayment(bookingId);

            if (response?.data?.url) {
                const checkoutUrl = response.data.url;
                console.log("Got Safepay checkout URL:", checkoutUrl);

                // Navigate to WebView checkout screen
                router.push({
                    pathname: "/(customer)/bookings/safepay-checkout",
                    params: {
                        checkoutUrl,
                        bookingId,
                        amount,
                        carName,
                    },
                });
            } else {
                throw new Error("Failed to get checkout URL");
            }
        } catch (error) {
            console.error("Payment initialization error:", error);
            const errorMessage = error?.message || error?.msg || "Something went wrong. Please try again.";
            Alert.alert("Payment Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={[COLORS.navy[900], COLORS.navy[800]]}
                style={styles.header}
            >
                <SafeAreaView edges={["top"]} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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

                {/* Safepay Method */}
                <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
                <View style={[styles.methodCard, styles.methodActive]}>
                    <View style={[styles.methodIcon, { backgroundColor: "#EEF2FF" }]}>
                        <MaterialCommunityIcons name="credit-card-check" size={28} color={COLORS.safepay} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.methodName}>Safepay</Text>
                        <Text style={styles.methodDesc}>Cards, JazzCash, Easypaisa & more</Text>
                    </View>
                    <View style={[styles.radioOuter, styles.radioActive]}>
                        <View style={styles.radioInner} />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.green[500]} />
                        <Text style={styles.infoText}>Bank-level encryption</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="phone-portrait-outline" size={20} color={COLORS.gold[500]} />
                        <Text style={styles.infoText}>Payment opens within the app</Text>
                    </View>
                </View>

                <View style={styles.securityBadge}>
                    <Ionicons name="shield-checkmark" size={20} color={COLORS.green[500]} />
                    <Text style={styles.securityText}>Secured by Safepay</Text>
                </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.btn} onPress={handlePayment} disabled={loading} activeOpacity={0.9}>
                    <LinearGradient
                        colors={loading ? [COLORS.gray[500], COLORS.gray[500]] : [COLORS.safepay, "#4F46E5"]}
                        style={styles.gradientBtn}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color={COLORS.white} size="small" />
                                <Text style={styles.btnText}>Connecting...</Text>
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
    header: { padding: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
    backBtn: { width: 40, height: 40, backgroundColor: COLORS.navy[700], borderRadius: 12, justifyContent: "center", alignItems: "center" },
    scroll: { padding: 20, paddingBottom: 140 },
    summaryCard: { backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.navy[700] },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    summaryText: { fontSize: 15, color: COLORS.white, fontWeight: "600" },
    priceBadge: { backgroundColor: COLORS.navy[700], padding: 16, borderRadius: 12, alignItems: "center" },
    priceLabel: { fontSize: 12, color: COLORS.gray[400], marginBottom: 4 },
    priceValue: { fontSize: 28, fontWeight: "700", color: COLORS.gold[500] },
    sectionTitle: { fontSize: 11, fontWeight: "700", color: COLORS.gray[400], marginBottom: 16, letterSpacing: 1.2 },
    methodCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.navy[800], padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: COLORS.navy[700] },
    methodActive: { borderColor: COLORS.gold[500], backgroundColor: COLORS.navy[700] },
    methodIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 16 },
    methodName: { fontSize: 16, fontWeight: "700", color: COLORS.white, marginBottom: 4 },
    methodDesc: { fontSize: 12, color: COLORS.gray[400] },
    radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.gray[500], justifyContent: "center", alignItems: "center" },
    radioActive: { borderColor: COLORS.gold[500] },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gold[500] },
    infoCard: { backgroundColor: COLORS.navy[800], borderRadius: 16, padding: 20, marginTop: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.navy[700], gap: 16 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoText: { flex: 1, fontSize: 13, color: COLORS.gray[400], lineHeight: 18 },
    securityBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
    securityText: { fontSize: 13, color: COLORS.gray[400], fontWeight: "600" },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: COLORS.navy[900], padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: COLORS.navy[700] },
    btn: { borderRadius: 14, overflow: "hidden" },
    gradientBtn: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    btnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
