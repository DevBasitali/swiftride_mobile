// app/(auth)/register.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { Link, Stack, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SuccessModal from "../../components/common/SuccessModal";

const { width, height } = Dimensions.get("window");

// ============================================
// 🎨 INLINE THEME COLORS
// ============================================
const COLORS = {
  navy: {
    900: '#0A1628',
    800: '#0F2137',
    700: '#152A46',
    600: '#1E3A5F',
    500: '#2A4A73',
  },
  gold: {
    600: '#D99413',
    500: '#F59E0B',
    400: '#FBBF24',
    300: '#FCD34D',
  },
  gray: {
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF',
    300: '#D1D5DB',
  },
  emerald: {
    500: '#10B981',
    400: '#34D399',
  },
  white: '#FFFFFF',
  black: '#000000',
};

export default function Register() {
  // ============================================
  // 🔒 ORIGINAL LOGIC - COMPLETELY UNTOUCHED
  // ============================================
  const [role, setRole] = useState("customer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const result = await register(fullName, email, phoneNumber, password, role);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
    } else {
      alert(result.msg);
    }
  };

  const handleSuccessNavigation = () => {
    setShowSuccess(false);
  };
  // ============================================
  // END ORIGINAL LOGIC
  // ============================================

  // UI Enhancement States
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const roleAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.spring(roleAnim, {
      toValue: role === 'customer' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }, [role]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy[900]} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.navy[900], COLORS.navy[800], COLORS.navy[900]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      {/* SUCCESS MODAL */}
      <SuccessModal
        visible={showSuccess}
        title="Welcome Aboard!"
        message={`Your ${
          role === "host" ? "Host" : "Traveler"
        } account has been created successfully. Let's verify your identity to get started.`}
        buttonText="Start Verification"
        onNext={handleSuccessNavigation}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* HEADER */}
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <View style={styles.backBtnInner}>
                  <Ionicons name="chevron-back" size={24} color={COLORS.white} />
                </View>
              </TouchableOpacity>

              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Choose your journey below</Text>
              </View>
            </View>

            {/* ROLE SELECTION CARDS */}
            <View style={styles.roleContainer}>
              {/* Customer Card */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "customer" && styles.roleCardActive,
                ]}
                onPress={() => setRole("customer")}
                activeOpacity={0.8}
              >
                {role === "customer" && (
                  <LinearGradient
                    colors={[COLORS.gold[500] + '15', COLORS.gold[600] + '05']}
                    style={styles.roleCardGradient}
                  />
                )}
                <View
                  style={[
                    styles.iconBox,
                    role === "customer" && styles.iconBoxActive,
                  ]}
                >
                  {role === "customer" ? (
                    <LinearGradient
                      colors={[COLORS.gold[400], COLORS.gold[600]]}
                      style={styles.iconBoxGradient}
                    >
                      <FontAwesome5 name="car" size={20} color={COLORS.navy[900]} />
                    </LinearGradient>
                  ) : (
                    <FontAwesome5 name="car" size={20} color={COLORS.gray[400]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    role === "customer" && styles.roleTextActive,
                  ]}
                >
                  Rent a Car
                </Text>
                <Text style={styles.roleDesc}>I want to book rides</Text>
                
                {/* Selection Indicator */}
                <View style={[
                  styles.selectionIndicator,
                  role === "customer" && styles.selectionIndicatorActive
                ]}>
                  {role === "customer" && (
                    <Ionicons name="checkmark" size={14} color={COLORS.navy[900]} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Host Card */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "host" && styles.roleCardActive,
                ]}
                onPress={() => setRole("host")}
                activeOpacity={0.8}
              >
                {role === "host" && (
                  <LinearGradient
                    colors={[COLORS.gold[500] + '15', COLORS.gold[600] + '05']}
                    style={styles.roleCardGradient}
                  />
                )}
                <View
                  style={[
                    styles.iconBox,
                    role === "host" && styles.iconBoxActive,
                  ]}
                >
                  {role === "host" ? (
                    <LinearGradient
                      colors={[COLORS.gold[400], COLORS.gold[600]]}
                      style={styles.iconBoxGradient}
                    >
                      <FontAwesome5 name="hand-holding-usd" size={18} color={COLORS.navy[900]} />
                    </LinearGradient>
                  ) : (
                    <FontAwesome5 name="hand-holding-usd" size={18} color={COLORS.gray[400]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    role === "host" && styles.roleTextActive,
                  ]}
                >
                  Earn Money
                </Text>
                <Text style={styles.roleDesc}>I want to list my car</Text>
                
                {/* Selection Indicator */}
                <View style={[
                  styles.selectionIndicator,
                  role === "host" && styles.selectionIndicatorActive
                ]}>
                  {role === "host" && (
                    <Ionicons name="checkmark" size={14} color={COLORS.navy[900]} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* FORM */}
            <View style={styles.formContainer}>
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'fullName' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedInput === 'fullName' ? COLORS.gold[500] : COLORS.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.gray[500]}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedInput('fullName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedInput === 'email' ? COLORS.gold[500] : COLORS.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.gray[500]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'phone' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={focusedInput === 'phone' ? COLORS.gold[500] : COLORS.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={COLORS.gray[500]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'password' ? COLORS.gold[500] : COLORS.gray[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor={COLORS.gray[500]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={COLORS.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Text */}
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleRegister}
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
                      <Text style={styles.buttonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.navy[900]} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.divider} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-google" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-apple" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Log In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================
// 💅 STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy[900],
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -height * 0.15,
    left: -width * 0.25,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },

  // Header
  headerContainer: {
    marginBottom: 28,
  },
  backBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },
  headerTextContainer: {},
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray[400],
  },

  // Role Selection
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.navy[700],
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.navy[600],
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  roleCardActive: {
    borderColor: COLORS.gold[500],
    backgroundColor: COLORS.navy[700],
  },
  roleCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.navy[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBoxActive: {
    backgroundColor: 'transparent',
  },
  iconBoxGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  roleTextActive: {
    color: COLORS.gold[500],
  },
  roleDesc: {
    fontSize: 12,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.navy[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: COLORS.gold[500],
    borderColor: COLORS.gold[500],
  },

  // Form
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray[400],
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy[800],
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.navy[600],
    height: 52,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold[500],
    backgroundColor: COLORS.navy[700],
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.gold[500],
    fontWeight: '500',
  },

  // Button
  button: {
    borderRadius: 12,
    overflow: 'hidden',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy[900],
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.navy[600],
  },
  dividerText: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Social Buttons
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.navy[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.navy[600],
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray[400],
  },
  link: {
    fontSize: 14,
    color: COLORS.gold[500],
    fontWeight: '600',
  },
});