import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
    navy: { 900: "#0A1628", 800: "#0F2137", 700: "#152A46" },
    gold: { 500: "#F59E0B" },
    white: "#FFFFFF",
    gray: { 400: "#9CA3AF" },
};

export default function SafepayCheckoutScreen() {
    const { checkoutUrl, bookingId, amount, carName } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const webViewRef = useRef(null);
    const hasHandledRedirect = useRef(false); // Prevent multiple triggers

    // Handle success
    const handleSuccess = () => {
        if (hasHandledRedirect.current) return;
        hasHandledRedirect.current = true;

        Alert.alert(
            "✅ Payment Successful",
            `Your payment of PKR ${amount} has been processed.\n\nYour booking is now pending host confirmation.`,
            [
                {
                    text: "View My Trips",
                    onPress: () => router.replace("/(customer)/(tabs)/bookings"),
                },
            ]
        );
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasHandledRedirect.current) return;
        hasHandledRedirect.current = true;

        Alert.alert(
            "Payment Cancelled",
            "Your payment was cancelled. You can try again.",
            [
                {
                    text: "Go Back",
                    onPress: () => router.back(),
                },
            ]
        );
    };

    // Check if URL is a redirect URL
    const isSuccessUrl = (url) => {
        return url.includes("swiftride://payment/success") ||
            (url.includes("/payment/success") && !url.includes("safepay"));
    };

    const isCancelUrl = (url) => {
        return url.includes("swiftride://payment/cancel") ||
            (url.includes("/payment/cancel") && !url.includes("safepay"));
    };

    // Handle requests before they load (iOS/Android)
    const handleShouldStartLoad = (request) => {
        const { url } = request;
        console.log("WebView request:", url);

        // Check for deep links or redirect URLs
        if (isSuccessUrl(url)) {
            handleSuccess();
            return false; // Block navigation
        }

        if (isCancelUrl(url)) {
            handleCancel();
            return false;
        }

        // Block deep links that aren't payment related
        if (url.startsWith("swiftride://")) {
            console.log("Blocking non-payment deep link:", url);
            return false;
        }

        return true;
    };

    // Backup check on navigation state change (some URLs slip through)
    const handleNavigationChange = (navState) => {
        const { url } = navState;

        if (hasHandledRedirect.current) return;

        if (isSuccessUrl(url)) {
            handleSuccess();
        } else if (isCancelUrl(url)) {
            handleCancel();
        }
    };

    const handleClose = () => {
        Alert.alert(
            "Cancel Payment?",
            "Are you sure you want to cancel this payment?",
            [
                { text: "Continue Payment", style: "cancel" },
                {
                    text: "Cancel",
                    style: "destructive",
                    onPress: () => router.back(),
                },
            ]
        );
    };

    if (!checkoutUrl) {
        return (
            <View style={styles.errorContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="alert-circle" size={60} color={COLORS.gold[500]} />
                <Text style={styles.errorText}>Checkout URL not provided</Text>
                <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
                    <Text style={styles.errorBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <SafeAreaView edges={["top"]} style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Ionicons name="lock-closed" size={14} color={COLORS.gold[500]} />
                    <Text style={styles.headerTitle}>Secure Payment</Text>
                </View>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {/* WebView */}
            <WebView
                ref={webViewRef}
                source={{ uri: checkoutUrl }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationChange}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                originWhitelist={["https://*", "http://*", "swiftride://*"]}
                renderLoading={() => (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.gold[500]} />
                        <Text style={styles.loadingText}>Loading Safepay...</Text>
                    </View>
                )}
            />

            {/* Loading overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.gold[500]} />
                    <Text style={styles.loadingText}>Connecting to Safepay...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.navy[900],
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.navy[800],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.navy[700],
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.navy[700],
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "600",
    },
    webview: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.navy[900],
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: COLORS.gray[400],
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: COLORS.navy[900],
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        padding: 40,
    },
    errorText: {
        color: COLORS.white,
        fontSize: 16,
        textAlign: "center",
    },
    errorBtn: {
        backgroundColor: COLORS.gold[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorBtnText: {
        color: COLORS.navy[900],
        fontWeight: "700",
    },
});
