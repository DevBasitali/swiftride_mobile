import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from 'expo-haptics';

import carService from "../../../services/carService";
import favoritesService from "../../../services/favoritesService";

const COLORS = {
    navy: {
        900: "#0A1628",
        800: "#0F2137",
        700: "#152A46",
    },
    gold: {
        500: "#F59E0B",
    },
    white: "#FFFFFF",
    gray: {
        400: "#9CA3AF",
        300: "#D1D5DB",
    },
    red: {
        500: "#EF4444",
    },
    emerald: {
        500: "#10B981",
    }
};

export default function FavoritesScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [favoriteCars, setFavoriteCars] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const fetchFavorites = async () => {
        try {
            const ids = await favoritesService.getFavorites();
            setFavoriteIds(ids);

            if (ids.length === 0) {
                setFavoriteCars([]);
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Fetch all cars and filter (Efficient for < 100 items, pagination recommended for scale)
            const res = await carService.getAllCars({});
            let allCars = [];
            if (res.data && Array.isArray(res.data)) allCars = res.data;
            else if (Array.isArray(res)) allCars = res;
            else if (res.cars) allCars = res.cars;

            const filtered = allCars.filter(car => ids.includes(car._id));
            setFavoriteCars(filtered);

        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const removeFavorite = async (carId) => {
        // Optimistic Update
        setFavoriteCars(prev => prev.filter(c => c._id !== carId));
        setFavoriteIds(prev => prev.filter(id => id !== carId));

        await Haptics.selectionAsync();
        await favoritesService.toggleFavorite(carId);
    };

    const renderCarItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => router.push(`/(customer)/car/${item._id}`)}
            style={styles.card}
        >
            <Image
                source={{ uri: carService.getImageUrl(item.photos?.[0]) }}
                style={styles.cardBg}
                resizeMode="cover"
            />

            <LinearGradient
                colors={["transparent", "rgba(10, 22, 40, 0.4)", "rgba(10, 22, 40, 0.95)"]}
                locations={[0, 0.5, 1]}
                style={styles.cardOverlay}
            />

            <View style={styles.topBadges}>
                {item.isActive ? (
                    <View style={styles.statusBadge}>
                        <View style={styles.dot} />
                        <Text style={styles.statusText}>AVAILABLE</Text>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.red[500] }]}>
                        <Text style={styles.statusText}>UNAVAILABLE</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={(e) => {
                        e.stopPropagation();
                        removeFavorite(item._id);
                    }}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.red[500]} />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.carName}>{item.make} {item.model}</Text>
                    <Text style={styles.carSub}>{item.year} • {item.transmission || "Auto"}</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.currency}>PKR</Text>
                    <Text style={styles.price}>{item.pricePerDay}</Text>
                    <Text style={styles.perDay}>/day</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />

            <LinearGradient
                colors={[COLORS.navy[900], COLORS.navy[800]]}
                style={styles.header}
            >
                <SafeAreaView edges={["top", "left", "right"]} style={styles.headerContent}>
                    <Text style={styles.title}>My Saved Cars</Text>
                    <Text style={styles.subtitle}>{favoriteCars.length} cars saved</Text>
                </SafeAreaView>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.gold[500]} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={favoriteCars}
                    keyExtractor={item => item._id}
                    renderItem={renderCarItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchFavorites();
                            }}
                            tintColor={COLORS.gold[500]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-dislike-outline" size={64} color={COLORS.navy[700]} />
                            <Text style={styles.emptyText}>No favorites yet</Text>
                            <Text style={styles.emptySub}>Tap the heart on any car to save it here.</Text>
                        </View>
                    }
                />
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
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 10,
        zIndex: 10,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    title: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: "700",
    },
    subtitle: {
        color: COLORS.gray[400],
        fontSize: 14,
        marginTop: 4,
    },
    card: {
        height: 240,
        borderRadius: 24,
        marginBottom: 24,
        overflow: "hidden",
        position: "relative",
        backgroundColor: COLORS.navy[800],
        elevation: 8,
    },
    cardBg: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    cardOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topBadges: {
        position: "absolute",
        top: 16,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statusBadge: {
        backgroundColor: "rgba(16, 185, 129, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backdropFilter: "blur(10px)",
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "white",
    },
    statusText: {
        color: "white",
        fontSize: 10,
        fontWeight: "700",
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(15, 33, 55, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(4px)",
    },
    cardContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    carName: {
        color: "white",
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 4,
    },
    carSub: {
        color: COLORS.gray[300],
        fontSize: 14,
        fontWeight: "500",
    },
    priceContainer: {
        alignItems: "flex-end",
    },
    currency: {
        color: COLORS.gold[500],
        fontSize: 12,
        fontWeight: "700",
        marginBottom: -2,
    },
    price: {
        color: "white",
        fontSize: 24,
        fontWeight: "800",
    },
    perDay: {
        color: COLORS.gray[400],
        fontSize: 12,
        fontWeight: "500",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 80,
        opacity: 0.7,
    },
    emptyText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "700",
        marginTop: 16,
    },
    emptySub: {
        color: COLORS.gray[400],
        fontSize: 14,
        marginTop: 8,
    },
});
