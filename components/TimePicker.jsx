// components/TimePicker.jsx
// Beautiful 12-hour time picker with AM/PM selection
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
    navy: { 900: '#0A1628', 800: '#0F2137', 700: '#152A46', 600: '#1E3A5F' },
    gold: { 500: '#F59E0B', 400: '#FBBF24' },
    white: '#FFFFFF',
    gray: { 400: '#9CA3AF', 500: '#6B7280' },
};

// Convert 24h to 12h format for display
const to12Hour = (time24) => {
    if (!time24) return { hour: 9, minute: 0, period: 'AM' };

    const [hourStr, minStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10) || 0;

    let period = 'AM';
    if (hour >= 12) {
        period = 'PM';
        if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;

    return { hour, minute, period };
};

// Convert 12h to 24h format for storage
const to24Hour = (hour, minute, period) => {
    let h = hour;
    if (period === 'PM' && hour < 12) h = hour + 12;
    if (period === 'AM' && hour === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

export default function TimePicker({ label, value, onChange, icon }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [tempTime, setTempTime] = useState(to12Hour(value));

    const displayTime = to12Hour(value);
    const displayString = `${displayTime.hour}:${displayTime.minute.toString().padStart(2, '0')} ${displayTime.period}`;

    const openPicker = () => {
        setTempTime(to12Hour(value));
        setModalVisible(true);
    };

    const handleConfirm = () => {
        const time24 = to24Hour(tempTime.hour, tempTime.minute, tempTime.period);
        onChange(time24);
        setModalVisible(false);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    return (
        <View style={[styles.container, { flex: 1 }]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity style={styles.inputContainer} onPress={openPicker}>
                <Ionicons name={icon || "time-outline"} size={20} color={COLORS.gold[500]} />
                <Text style={styles.inputText}>{displayString}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.gray[400]} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <LinearGradient
                            colors={[COLORS.navy[800], COLORS.navy[900]]}
                            style={styles.modalHeader}
                        >
                            <Text style={styles.modalTitle}>Select Time</Text>
                            <Text style={styles.modalSubtitle}>{label}</Text>
                        </LinearGradient>

                        {/* Time Display */}
                        <View style={styles.timeDisplay}>
                            <Text style={styles.timeDisplayText}>
                                {tempTime.hour}:{tempTime.minute.toString().padStart(2, '0')}
                            </Text>
                            <View style={styles.periodDisplay}>
                                <Text style={styles.periodDisplayText}>{tempTime.period}</Text>
                            </View>
                        </View>

                        {/* Picker Wheels */}
                        <View style={styles.pickersContainer}>
                            {/* Hours */}
                            <View style={styles.pickerColumn}>
                                <Text style={styles.pickerLabel}>Hour</Text>
                                <ScrollView
                                    style={styles.picker}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.pickerContent}
                                >
                                    {HOURS.map((h) => (
                                        <TouchableOpacity
                                            key={h}
                                            style={[
                                                styles.pickerItem,
                                                tempTime.hour === h && styles.pickerItemActive,
                                            ]}
                                            onPress={() => setTempTime({ ...tempTime, hour: h })}
                                        >
                                            <Text
                                                style={[
                                                    styles.pickerItemText,
                                                    tempTime.hour === h && styles.pickerItemTextActive,
                                                ]}
                                            >
                                                {h}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Minutes */}
                            <View style={styles.pickerColumn}>
                                <Text style={styles.pickerLabel}>Minute</Text>
                                <ScrollView
                                    style={styles.picker}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.pickerContent}
                                >
                                    {MINUTES.map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[
                                                styles.pickerItem,
                                                tempTime.minute === m && styles.pickerItemActive,
                                            ]}
                                            onPress={() => setTempTime({ ...tempTime, minute: m })}
                                        >
                                            <Text
                                                style={[
                                                    styles.pickerItemText,
                                                    tempTime.minute === m && styles.pickerItemTextActive,
                                                ]}
                                            >
                                                {m.toString().padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* AM/PM */}
                            <View style={styles.pickerColumn}>
                                <Text style={styles.pickerLabel}>Period</Text>
                                <View style={styles.periodPicker}>
                                    <TouchableOpacity
                                        style={[
                                            styles.periodButton,
                                            tempTime.period === 'AM' && styles.periodButtonActive,
                                        ]}
                                        onPress={() => setTempTime({ ...tempTime, period: 'AM' })}
                                    >
                                        <Text
                                            style={[
                                                styles.periodButtonText,
                                                tempTime.period === 'AM' && styles.periodButtonTextActive,
                                            ]}
                                        >
                                            AM
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.periodButton,
                                            tempTime.period === 'PM' && styles.periodButtonActive,
                                        ]}
                                        onPress={() => setTempTime({ ...tempTime, period: 'PM' })}
                                    >
                                        <Text
                                            style={[
                                                styles.periodButtonText,
                                                tempTime.period === 'PM' && styles.periodButtonTextActive,
                                            ]}
                                        >
                                            PM
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                                <LinearGradient
                                    colors={[COLORS.gold[500], COLORS.gold[400]]}
                                    style={styles.confirmGradient}
                                >
                                    <Ionicons name="checkmark" size={20} color={COLORS.navy[900]} />
                                    <Text style={styles.confirmBtnText}>Confirm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 0 },
    label: { color: COLORS.gray[400], fontSize: 13, marginBottom: 8, fontWeight: '600' },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.navy[700],
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: COLORS.navy[600],
        gap: 10,
    },
    inputText: { flex: 1, color: COLORS.white, fontSize: 15, fontWeight: '600' },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.navy[800],
        borderRadius: 24,
        width: '100%',
        maxWidth: 360,
        overflow: 'hidden',
    },
    modalHeader: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    modalTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
    modalSubtitle: { color: COLORS.gray[400], fontSize: 14, marginTop: 4 },

    // Time Display
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    timeDisplayText: {
        color: COLORS.gold[500],
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: 2,
    },
    periodDisplay: {
        backgroundColor: COLORS.gold[500] + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    periodDisplayText: { color: COLORS.gold[500], fontSize: 18, fontWeight: '700' },

    // Pickers
    pickersContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
    pickerColumn: { flex: 1, alignItems: 'center' },
    pickerLabel: { color: COLORS.gray[400], fontSize: 12, fontWeight: '600', marginBottom: 10 },

    picker: { height: 150, width: '100%' },
    pickerContent: { paddingVertical: 40 },

    pickerItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 2,
    },
    pickerItemActive: { backgroundColor: COLORS.gold[500] },
    pickerItemText: { color: COLORS.gray[400], fontSize: 18, fontWeight: '600' },
    pickerItemTextActive: { color: COLORS.navy[900] },

    // Period Buttons
    periodPicker: { gap: 8, flex: 1, justifyContent: 'center' },
    periodButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: COLORS.navy[700],
        borderWidth: 1,
        borderColor: COLORS.navy[600],
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: COLORS.gold[500],
        borderColor: COLORS.gold[500],
    },
    periodButtonText: { color: COLORS.gray[400], fontSize: 16, fontWeight: '700' },
    periodButtonTextActive: { color: COLORS.navy[900] },

    // Actions
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.navy[700],
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray[500],
        alignItems: 'center',
    },
    cancelBtnText: { color: COLORS.gray[400], fontSize: 16, fontWeight: '600' },
    confirmBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
    },
    confirmBtnText: { color: COLORS.navy[900], fontSize: 16, fontWeight: '700' },
});
