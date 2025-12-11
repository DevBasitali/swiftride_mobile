import React, { useState } from "react";
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
} from "react-native";
import { Link, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import SuccessModal from "../../components/common/SuccessModal";

const { width } = Dimensions.get("window");

export default function Register() {
  const [role, setRole] = useState("customer"); // 'customer' or 'host'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      alert("Please fill in all fields"); // Keeping basic alert only for validation errors
      return;
    }

    setIsSubmitting(true);
    const result = await register(fullName, email, phoneNumber, password, role);
    setIsSubmitting(false);

    if (result.success) {
      // Show the beautiful modal instead of standard alert
      setShowSuccess(true);
    } else {
      alert(result.msg);
    }
  };

  const handleSuccessNavigation = () => {
    setShowSuccess(false);
    // The AuthContext will automatically redirect to /kyc because status is 'missing'
    // We just close the modal here to let the redirect happen visually
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <FontAwesome name="angle-left" size={30} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Choose your journey below.</Text>
        </View>

        {/* ROLE SELECTION CARDS */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              role === "customer" && styles.roleCardActive,
            ]}
            onPress={() => setRole("customer")}
          >
            <View
              style={[
                styles.iconBox,
                role === "customer" && styles.iconBoxActive,
              ]}
            >
              <FontAwesome
                name="car"
                size={24}
                color={role === "customer" ? "#fff" : "#666"}
              />
            </View>
            <Text
              style={[
                styles.roleTitle,
                role === "customer" && styles.roleTextActive,
              ]}
            >
              Rent a Car
            </Text>
            <Text style={styles.roleDesc}>I want to book rides.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, role === "host" && styles.roleCardActive]}
            onPress={() => setRole("host")}
          >
            <View
              style={[styles.iconBox, role === "host" && styles.iconBoxActive]}
            >
              <FontAwesome
                name="money"
                size={24}
                color={role === "host" ? "#fff" : "#666"}
              />
            </View>
            <Text
              style={[
                styles.roleTitle,
                role === "host" && styles.roleTextActive,
              ]}
            >
              Earn Money
            </Text>
            <Text style={styles.roleDesc}>I want to list my car.</Text>
          </TouchableOpacity>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          <InputField
            icon="user"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <InputField
            icon="envelope"
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <InputField
            icon="phone"
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <InputField
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper Component for Inputs
function InputField({ icon, ...props }) {
  return (
    <View style={styles.inputWrapper}>
      <FontAwesome
        name={icon}
        size={20}
        color="#999"
        style={styles.inputIcon}
      />
      <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { padding: 24, paddingBottom: 50 },

  headerContainer: { marginBottom: 25, marginTop: 10 },
  title: { fontSize: 28, fontWeight: "800", color: "#1a1a1a", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666" },

  // Role Cards
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  roleCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleCardActive: { borderColor: "#007AFF", backgroundColor: "#F0F9FF" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBoxActive: { backgroundColor: "#007AFF" },
  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  roleTextActive: { color: "#007AFF" },
  roleDesc: { fontSize: 12, color: "#888", textAlign: "center" },

  // Form
  formContainer: { width: "100%" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#eee",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", fontSize: 16, color: "#333" },

  button: {
    backgroundColor: "#1a1a1a",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 25 },
  footerText: { color: "#666", fontSize: 15 },
  link: { color: "#007AFF", fontSize: 15, fontWeight: "bold" },
});
