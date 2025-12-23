import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
  },
  gold: {
    500: "#F59E0B",
    400: "#FBBF24",
  },
  emerald: {
    500: "#10B981",
  },
  red: {
    500: "#EF4444",
  },
  blue: {
    500: "#3B82F6",
  },
  gray: {
    400: "#9CA3AF",
    500: "#6B7280",
  },
  white: "#FFFFFF",
};

const CustomAlert = ({
  visible,
  title,
  message,
  type = "info", // success, error, warning, info
  buttons = [], // [{ text: 'OK', onPress: () => {} }]
  onClose,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: COLORS.emerald[500] };
      case "error":
        return { name: "alert-circle", color: COLORS.red[500] };
      case "warning":
        return { name: "warning", color: COLORS.gold[500] };
      default:
        return { name: "information-circle", color: COLORS.blue[500] };
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case "success":
        return [COLORS.emerald[500], "#059669"];
      case "error":
        return [COLORS.red[500], "#DC2626"];
      case "warning":
        return [COLORS.gold[400], COLORS.gold[500]];
      default:
        return [COLORS.blue[500], "#2563EB"];
    }
  };

  const { name, color } = getIcon();
  const iconGradient = getGradientColors();

  // Default button if none provided
  const actionButtons = buttons && buttons.length > 0 ? buttons : [{ text: "OK", onPress: onClose }];

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          {/* Icon Header */}
          <View style={styles.iconCircleOuter}>
            <LinearGradient colors={iconGradient} style={styles.iconCircle}>
              <Ionicons name={name} size={48} color={COLORS.white} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {actionButtons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.btn,
                  actionButtons.length > 1 && styles.btnFlex,
                  btn.style === "cancel" ? styles.btnCancel : styles.btnPrimary,
                ]}
                onPress={() => {
                  btn.onPress && btn.onPress();
                  // For simple alerts, we typically close after press unless handled by caller
                  // But usually the provider handles close. Assuming caller closes or provider wraps it.
                }}
                activeOpacity={0.8}
              >
                {/* Only apply gradient to primary buttons excluding 'cancel' style */}
                {btn.style !== "cancel" ? (
                  <LinearGradient
                    colors={iconGradient}
                    style={[styles.btnInner, { opacity: 0.9 }]} // Slight transparency for visual blend
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.btnTextPrimary}>{btn.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.btnInner}>
                    <Text style={styles.btnTextCancel}>{btn.text}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 22, 40, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: COLORS.navy[800],
    borderRadius: 24,
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: COLORS.navy[700],
  },
  iconCircleOuter: {
    marginTop: -70,
    marginBottom: 16,
    padding: 6,
    backgroundColor: COLORS.navy[900], // Matches background to create "cutout" effect
    borderRadius: 50,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: COLORS.gray[400],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  btn: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 100,
  },
  btnFlex: {
    flex: 1,
  },
  btnPrimary: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  btnCancel: {
    backgroundColor: COLORS.navy[700],
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  btnInner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextPrimary: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  btnTextCancel: {
    color: COLORS.gray[400],
    fontSize: 15,
    fontWeight: "600",
  },
});

export default CustomAlert;
