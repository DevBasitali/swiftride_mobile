// services/api.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Config from "../constants/Config";
import { router } from "expo-router";

import { alertService } from "../context/AlertContext";

// Create Axios Instance
const api = axios.create({
  baseURL: Config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Included since your backend uses cookie-parser
});

// 1. Request Interceptor: Attaches Token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      // We assume you will save the token as 'accessToken' on login
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handles global errors (401, 500)
api.interceptors.response.use(
  (response) => response, // Return response if successful
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Prevent infinite loops
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Clear token and redirect to login
        await SecureStore.deleteItemAsync("accessToken");
        if (alertService.current) {
          alertService.current({
            title: "Session Expired",
            message: "Please login again.",
            type: "error"
          });
        }
        router.replace("/(auth)/login");
      }
    }

    // Return a clean error message to the UI
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
