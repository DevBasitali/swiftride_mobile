import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    white: "#FFFFFF",
    gold: {
        500: "#F59E0B",
    },
    gray: {
        400: "#9CA3AF",
    }
};

const SectionHeader = ({ title, subtitle, onSeeAll }) => {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.gold[500]} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.gray[400],
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingBottom: 2,
    },
    seeAllText: {
        color: COLORS.gold[500],
        fontSize: 13,
        fontWeight: '600',
    },
});

export default SectionHeader;
