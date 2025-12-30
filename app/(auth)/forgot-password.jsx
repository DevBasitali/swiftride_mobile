// app/(auth)/forgot-password.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import authService from "../../services/authService";
import { useAlert } from "../../context/AlertContext";

const { width, height } = Dimensions.get("window");

const COLORS = {
  navy: {
    900: "#0A1628",
    800: "#0F2137",
    700: "#152A46",
    600: "#1E3A5F",
    500: "#2A4A73",
  },
  gold: {
    600: "#D99413",
    500: "#F59E0B",
    400: "#FBBF24",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
  black: "#000000",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const { showAlert } = useAlert();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email) {
      if (!email) {
        showAlert({
          title: "Error",
          message: "Please enter your email address",
          type: "error",
        });
        return;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (!emailRegex.test(email)) {
        showAlert({
          title: "Error",
          message: "Please enter a valid email address",
          type: "error",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
    } catch (error) {
      // Don't reveal if email exists or not for security
      setEmailSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.navy[900]}
        />
        <Stack.Screen options={{ headerShown: false }} />

        <LinearGradient
          colors={[COLORS.navy[900], COLORS.navy[800], COLORS.navy[900]]}
          style={styles.gradient}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={[COLORS.gold[400], COLORS.gold[600]]}
                style={styles.successIconGradient}
              >
                <Ionicons name="mail-open" size={50} color={COLORS.navy[900]} />
              </LinearGradient>
            </View>

            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              If an account exists with that email, we've sent password reset
              instructions to your inbox.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/(auth)/reset-password")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.gold[500], COLORS.gold[600]]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>I Have a 6-Digit Code</Text>
                <Ionicons name="keypad" size={20} color={COLORS.navy[900]} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.gray[400]} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800], COLORS.navy[900]]}
        style={styles.gradient}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[COLORS.gold[400], COLORS.gold[600]]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="lock-open" size={40} color={COLORS.navy[900]} />
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you reset
              instructions.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === "email" && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    focusedInput === "email"
                      ? COLORS.gold[500]
                      : COLORS.gray[400]
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray[500]}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isSubmitting
                    ? [COLORS.gray[600], COLORS.gray[600]]
                    : [COLORS.gold[500], COLORS.gold[600]]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.navy[900]} size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    <Ionicons name="send" size={20} color={COLORS.navy[900]} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.gray[400]} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(245, 158, 11, 0.05)",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 0,
    padding: 12,
    backgroundColor: COLORS.navy[700],
    borderRadius: 12,
  },
  headerIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.gray[400],
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.navy[600],
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: COLORS.gold[500],
    backgroundColor: COLORS.navy[700],
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    height: "100%",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.navy[900],
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 6,
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontWeight: "500",
  },
  // Success state styles
  successIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
});
