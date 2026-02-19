import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    withTiming
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const COLORS = {
    navy: {
        800: "#0F2137",
        700: "#152A46",
    },
    gold: {
        500: "#F59E0B",
    },
    white: "#FFFFFF",
};

export default function MapToggle({ isMapMode, onToggle }) {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12 });
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <AnimatedTouchableOpacity
            style={[styles.container, rStyle]}
            activeOpacity={0.9}
            onPress={onToggle}
        >
            <View style={styles.content}>
                <MaterialCommunityIcons
                    name={isMapMode ? "format-list-bulleted" : "map-outline"}
                    size={22}
                    color={COLORS.white}
                />
                <Text style={styles.text}>
                    {isMapMode ? "List" : "Map"}
                </Text>
            </View>
        </AnimatedTouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90, // Above tabs
        alignSelf: 'center', // Center horizontally
        backgroundColor: COLORS.navy[800],
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 24,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        zIndex: 100, // Ensure it's above everything
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    }
});
