import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import authService from "../services/authService";
import kycService from "../services/kycService";
import { router, useSegments } from "expo-router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const redirectByRole = (role) => {
    console.log("Redirecting for role:", role);
    if (role === "host" || role === "showroom") {
      router.replace("/(host)/(tabs)");
    } else {
      router.replace("/(customer)/(tabs)");
    }
  };

  // ✅ HELPER: Centralized Auth Finalizer
  // Handles Token Saving + Header Setting + Redirects
  const finalizeAuth = async (token, userData, skipKycCheck = false) => {
    try {
      // 1. Set Header via Service (Fixes "Session Expired")
      authService.setToken(token);

      // 2. Save Token to Storage
      await SecureStore.setItemAsync("accessToken", token);

      // 3. Update User State
      setUser(userData);

      // 4. Refresh KYC Status (if applicable)
      const kycStat = await refreshKycStatus();

      // 5. Check if user needs KYC verification (for new users)
      // If KYC is missing and skipKycCheck is false, redirect to KYC screen
      if (!skipKycCheck && (kycStat === "missing" || kycStat === undefined)) {
        console.log("New user detected, redirecting to KYC with role:", userData.role);
        router.replace(`/kyc?role=${userData.role}`);
      } else {
        // Redirect based on role for verified users
        redirectByRole(userData.role);
      }
    } catch (error) {
      console.error("Finalize Auth Error:", error);
    }
  };

  const checkUserLoggedIn = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        // ✅ Set header immediately on app launch
        authService.setToken(token);

        const userRes = await authService.getCurrentUser();
        setUser(userRes.data.user);
        await refreshKycStatus();
      }
    } catch (error) {
      console.log("Session check failed:", error);
      setUser(null);
      // Optional: Clear token if session check fails
      authService.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshKycStatus = async () => {
    try {
      const kycRes = await kycService.getKycStatus();
      setKycStatus(kycRes.data.status);
      return kycRes.data.status;
    } catch (error) {
      setKycStatus("missing");
    }
  };

  // ✅ Standard Login
  // const login = async (email, password) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await authService.login(email, password);
  //     // Check structure based on your logs: { success: true, token: "...", user: {...} }
  //     // Adapt if your response.data structure is different
  //     const data = response;

  //     // If your API returns data directly inside response, use data.token
  //     // If it's inside a 'data' property, check that.
  //     // Based on your previous logs: login returns { success, token, user } directly.

  //     if (data.token && data.user) {
  //       await finalizeAuth(data.token, data.user);
  //       return { success: true };
  //     } else {
  //       throw new Error("Invalid response from server");
  //     }
  //   } catch (error) {
  //     return { success: false, msg: error.message || "Login failed" };
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ✅ FINAL PRODUCTION VERSION
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Debug: Log the API URL being used
      const Config = require("../constants/Config").default;
      console.log("🔗 Login attempting to:", Config.API_URL);

      const response = await authService.login(email, password);

      // Handle the structure: { success: true, data: { user, token } }
      // OR fallback to flat structure: { user, token }
      const data = response.data || response;

      const token = data.token || data.accessToken;
      const user = data.user;

      if (token && user) {
        // Skip KYC check for normal login (returning users)
        await finalizeAuth(token, user, true);
        return { success: true };
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      // Enhanced error logging for debugging
      console.log("❌ Login Error Details:");
      console.log("- Message:", error.message);
      console.log("- Full Error:", JSON.stringify(error, null, 2));

      // Check if it's a network error
      const errorMsg = error.message?.includes("Network")
        ? "Cannot connect to server. Check your internet connection and server status."
        : error.message || "Login failed";

      return { success: false, msg: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Google Login Helper
  const handleGoogleLogin = async (token, user) => {
    setIsLoading(true);
    try {
      console.log("Processing Google Login in Context...");
      await finalizeAuth(token, user);
      return { success: true };
    } catch (error) {
      console.error("Google Context Error:", error);
      return { success: false, msg: "Google Auth Finalization Failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName, email, phoneNumber, password, role) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        fullName,
        email,
        phoneNumber,
        password,
        role,
      });

      // response structure: { success, message, data: { user, tokens } }
      const { user, tokens } = response.data || {};

      // Handle different token formats
      let finalToken = null;
      if (tokens) {
        finalToken =
          typeof tokens === "string" ? tokens : tokens?.access?.token || tokens?.accessToken;
      }

      if (finalToken && user) {
        await finalizeAuth(finalToken, user);
      } else if (user) {
        // If no token but user exists, just set user
        setUser(user);
        setKycStatus("missing");
      }
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.log("Server logout failed, forcing local logout");
    } finally {
      await SecureStore.deleteItemAsync("accessToken");
      authService.setToken(null); // ✅ Clear header safely
      setUser(null);
      setKycStatus(null);
      router.replace("/(auth)/login");
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userRes = await authService.getCurrentUser();
      if (userRes && userRes.user) {
        const freshUser = userRes.user;
        setUser(freshUser);
        if (freshUser.kycStatus) setKycStatus(freshUser.kycStatus);
      }
    } catch (error) {
      console.log("Failed to refresh user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        kycStatus,
        isLoading,
        login,
        register,
        logout,
        refreshKycStatus,
        redirectByRole,
        refreshUser,
        handleGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
