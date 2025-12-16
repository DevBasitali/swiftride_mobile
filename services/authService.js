// // services/authService.js
// import api from './api';

// const authService = {
//   // Login User
//   login: async (email, password) => {
//     const response = await api.post('/auth/login', { email, password });
//     return response.data; // Returns { success, message, data: { user, token } }
//   },

//   // Register User
//   register: async (userData) => {
//     // userData = { fullName, email, phoneNumber, password, role }
//     const response = await api.post('/auth/signup', userData);
//     return response.data;
//   },

//   // Get Current User
//   getCurrentUser: async () => {
//     const response = await api.get('/auth/me');
//     return response.data;
//   },

//   // Logout
//   logout: async () => {
//     const response = await api.post('/auth/logout');
//     return response.data;
//   },
// };

// export default authService;

// services/authService.js
import api from "./api";

// 1. Define the Google Login function separately so we can export it as a named export
export const googleLoginRequest = async (idToken, role) => {
  const response = await api.post("/auth/google-login", { idToken, role });
  return response.data;
};

const authService = {
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
