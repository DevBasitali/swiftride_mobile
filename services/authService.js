import api from "./api";

// 1. Define the Google Login function separately
export const googleLoginRequest = async (idToken, role) => {
  const response = await api.post("/auth/google-login", { idToken, role });
  return response.data;
};

const authService = {
  // ✅ NEW: Helper to set the token in API headers
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },

  // Login User
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Register User
  register: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  googleLoginRequest: googleLoginRequest,
};

export default authService;
