import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import carService from "../services/carService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7; // 70% of screen width

const COLORS = {
    navy: {
        800: "#0F2137",
        700: "#152A46",
    },
    gold: {
        500: "#F59E0B",
    },
    white: "#FFFFFF",
    gray: {
        300: "#D1D5DB",
        400: "#9CA3AF",
    },
    emerald: {
        500: "#10B981",
    }
};

export default function HorizontalCarCard({ item }) {
    if (!item) return null;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/(customer)/car/${item._id}`)}
            style={styles.container}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={["transparent", "rgba(10, 22, 40, 0.8)"]}
                    style={styles.gradient}
                />

                {/* Price Badge */}
                <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>PKR {item.pricePerDay}</Text>
                </View>

                {/* Status Badge */}
                {item.isActive && (
                    <View style={styles.statusBadge}>
                        <View style={styles.dot} />
                    </View>
                )}
            </View>

            {/* Info Section */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.make} {item.model}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {item.year} • {item.transmission || "Auto"}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={COLORS.gold[500]} />
                        <Text style={styles.ratingText}>5.0</Text>
                    </View>
                    <View style={styles.location}>
                        <Ionicons name="location-outline" size={12} color={COLORS.gray[400]} />
                        <Text style={styles.locationText} numberOfLines={1}>{item.location?.address || "City"}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.navy[800],
        borderRadius: 16,
        marginRight: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    imageContainer: {
        height: 140,
        width: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    priceBadge: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(15, 33, 55, 0.9)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    priceText: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 12,
    },
    statusBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(16, 185, 129, 0.9)",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.white,
    },
    content: {
        padding: 12,
    },
    title: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    subtitle: {
        color: COLORS.gray[400],
        fontSize: 12,
        marginBottom: 8,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ratingText: {
        color: COLORS.gold[500],
        fontSize: 10,
        fontWeight: "700",
    },
    location: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        maxWidth: '60%'
    },
    locationText: {
        color: COLORS.gray[400],
        fontSize: 10,
    }
});
