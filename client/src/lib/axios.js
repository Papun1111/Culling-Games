import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor (The Security Guard)
// This runs BEFORE every request is sent
api.interceptors.request.use(
  async (config) => {
    // Get the current user session from NextAuth
    const session = await getSession();

    // If user is logged in, attach their ID Token
    if (session?.id_token) {
      config.headers.Authorization = `Bearer ${session.id_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (The Error Handler)
// This runs AFTER every response is received
api.interceptors.response.use(
  (response) => {
    // If request was successful, just return the data
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error("🔒 Session expired or unauthorized. Logging out...");
      
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;

      // Force sign out and redirect to login page
      await signOut({ callbackUrl: "/" });
    }

    // Return the error so the specific page can handle it (e.g., show a toast)
    return Promise.reject(error);
  }
);

export default api;