// app/(auth)/reset-password.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
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
  emerald: {
    500: "#10B981",
    400: "#34D399",
  },
  gray: {
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
  },
  white: "#FFFFFF",
  black: "#000000",
};

export default function ResetPassword() {
  const { token: urlToken } = useLocalSearchParams();

  const [token, setToken] = useState(urlToken || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!token) {
      if (!token) {
        showAlert({
          title: "Error",
          message: "Please enter the reset token from your email",
          type: "error",
        });
        return;
      }
    }

    if (!password) {
      if (!password) {
        showAlert({
          title: "Error",
          message: "Please enter a new password",
          type: "error",
        });
        return;
      }
    }

    if (password.length < 6) {
      if (password.length < 6) {
        showAlert({
          title: "Error",
          message: "Password must be at least 6 characters",
          type: "error",
        });
        return;
      }
    }

    if (password !== confirmPassword) {
      if (password !== confirmPassword) {
        showAlert({
          title: "Error",
          message: "Passwords do not match",
          type: "error",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setResetSuccess(true);
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.message || "Failed to reset password. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resetSuccess) {
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
                colors={[COLORS.emerald[400], COLORS.emerald[500]]}
                style={styles.successIconGradient}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={50}
                  color={COLORS.white}
                />
              </LinearGradient>
            </View>

            <Text style={styles.successTitle}>Password Reset! 🎉</Text>
            <Text style={styles.successSubtitle}>
              Your password has been successfully reset. You can now log in with
              your new password.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.emerald[400], COLORS.emerald[500]]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buttonText, { color: COLORS.white }]}>
                  Go to Login
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </LinearGradient>
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                <Ionicons name="key" size={40} color={COLORS.navy[900]} />
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code from your email and create a new
                password.
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Token Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reset Code</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "token" && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="keypair-outline"
                    size={20}
                    color={
                      focusedInput === "token"
                        ? COLORS.gold[500]
                        : COLORS.gray[400]
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={COLORS.gray[500]}
                    value={token}
                    onChangeText={setToken}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setFocusedInput("token")}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* New Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "password" && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedInput === "password"
                        ? COLORS.gold[500]
                        : COLORS.gray[400]
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.gray[500]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "confirm" && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedInput === "confirm"
                        ? COLORS.gold[500]
                        : COLORS.gray[400]
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.gray[500]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setFocusedInput("confirm")}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={COLORS.gray[400]}
                    />
                  </TouchableOpacity>
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
                      <Text style={styles.buttonText}>Reset Password</Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.navy[900]}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={COLORS.gray[400]}
                />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    marginBottom: 20,
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
  eyeIcon: {
    padding: 4,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginTop: 8,
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
    shadowColor: COLORS.emerald[500],
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
