import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/authService';
import kycService from '../services/kycService';
import { router, useSegments } from 'expo-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // 🚦 THE TRAFFIC CONTROLLER
  const redirectByRole = (role) => {
    console.log("Redirecting for role:", role);
    if (role === 'host' || role === 'showroom') {
      router.replace('/(host)/(tabs)'); 
    } else {
      router.replace('/(customer)/(tabs)'); 
    }
  };

  const checkUserLoggedIn = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const userRes = await authService.getCurrentUser();
        setUser(userRes.data.user);
        await refreshKycStatus();
      }
    } catch (error) {
      console.log('Session check failed:', error);
      setUser(null);
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
      setKycStatus('missing');
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const { user, token } = response.data;
      await SecureStore.setItemAsync('accessToken', token);
      setUser(user);
      await refreshKycStatus();
      
      // Redirect based on role
      redirectByRole(user.role);
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName, email, phoneNumber, password, role) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ fullName, email, phoneNumber, password, role });
      const { user, tokens } = response.data;
      if (tokens) {
         const tokenString = typeof tokens === 'string' ? tokens : tokens.access?.token; 
         if(tokenString) await SecureStore.setItemAsync('accessToken', tokenString);
      }
      setUser(user);
      setKycStatus('missing');
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.log('Server logout failed, forcing local logout');
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      setUser(null);
      setKycStatus(null);
      router.replace('/(auth)/login');
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      // Calls your backend to get fresh user details
      // Ensure your backend has a GET /auth/me or GET /users/me endpoint
      const response = await api.get('/auth/me'); 
      
      if (response.data && response.data.user) {
        const freshUser = response.data.user;
        setUser(freshUser);
        setKycStatus(freshUser.kycStatus || 'pending');
        
        // Optional: Update storage
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (error) {
      console.log('Failed to refresh user profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, kycStatus, isLoading, login, register, logout, refreshKycStatus, redirectByRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);