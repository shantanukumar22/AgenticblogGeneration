import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post("/api/auth/register", {
      email,
      username,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

// Blog API calls
export const blogApi = {
  createBlog: async (topic: string) => {
    const response = await api.post("/api/blogs", { topic });
    return response.data;
  },

  getBlogs: async () => {
    const response = await api.get("/api/blogs");
    return response.data;
  },

  getBlog: async (id: number) => {
    const response = await api.get(`/api/blogs/${id}`);
    return response.data;
  },

  deleteBlog: async (id: number) => {
    await api.delete(`/api/blogs/${id}`);
  },
};
