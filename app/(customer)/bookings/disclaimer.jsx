
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// Premium Theme Colors
const COLORS = {
    navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
    gold: { 500: "#F59E0B" },
    white: "#FFFFFF",
    gray: { 400: "#9CA3AF" },
    green: { 500: "#10B981" },
};

export default function BookingDisclaimer() {
    const { carId } = useLocalSearchParams();

    const handleAgree = () => {
        router.replace({
            pathname: "/(customer)/bookings/create",
            params: { carId },
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="close" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rental Agreement</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={64} color={COLORS.gold[500]} />
                    </View>

                    <Text style={styles.title}>Important Notice</Text>
                    <Text style={styles.subtitle}>
                        Please read the following terms carefully before proceeding with your booking.
                    </Text>

                    <View style={styles.termsContainer}>
                        <View style={styles.termItem}>
                            <Ionicons name="car-sport-outline" size={20} color={COLORS.gold[500]} />
                            <Text style={styles.termText}>
                                The vehicle must be returned with the same fuel level as at pick-up.
                            </Text>
                        </View>

                        <View style={styles.termItem}>
                            <Ionicons name="time-outline" size={20} color={COLORS.gold[500]} />
                            <Text style={styles.termText}>
                                Late returns will incur additional charges as per the hourly rate.
                            </Text>
                        </View>

                        <View style={styles.termItem}>
                            <Ionicons name="warning-outline" size={20} color={COLORS.gold[500]} />
                            <Text style={styles.termText}>
                                Any damage to the vehicle during the rental period is the renter's responsibility.
                            </Text>
                        </View>

                        <View style={styles.termItem}>
                            <Ionicons name="document-text-outline" size={20} color={COLORS.gold[500]} />
                            <Text style={styles.termText}>
                                A valid driving license and ID must be presented at the time of pick-up.
                            </Text>
                        </View>

                        <View style={styles.termItem}>
                            <Ionicons name="ban-outline" size={20} color={COLORS.gold[500]} />
                            <Text style={styles.termText}>
                                Smoking and pets are strictly prohibited inside the vehicle.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.footerNote}>
                        By continuing, you acknowledge that you have read and agree to these terms.
                    </Text>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btn} onPress={handleAgree}>
                        <LinearGradient
                            colors={[COLORS.gold[500], "#FBBF24"]}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.btnText}>I Agree & Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.navy[900]} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.navy[900] },

    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.navy[700],
    },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
    backBtn: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.navy[800],
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    content: { padding: 24, paddingBottom: 100 },

    iconContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.white,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.gray[400],
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 20,
    },

    termsContainer: {
        backgroundColor: COLORS.navy[800],
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.navy[700],
        marginBottom: 24,
    },
    termItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
        gap: 12,
    },
    termText: {
        flex: 1,
        color: COLORS.white,
        fontSize: 14,
        lineHeight: 20,
    },

    footerNote: {
        textAlign: "center",
        color: COLORS.gray[400],
        fontSize: 12,
        fontStyle: "italic",
    },

    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.navy[700],
        backgroundColor: COLORS.navy[900],
    },
    btn: { borderRadius: 14, overflow: "hidden" },
    gradientBtn: {
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    btnText: { color: COLORS.navy[900], fontSize: 16, fontWeight: "700" },
});
