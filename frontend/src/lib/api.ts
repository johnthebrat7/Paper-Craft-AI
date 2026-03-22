import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("vedaai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("vedaai_token");
      localStorage.removeItem("vedaai_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/signin", { email, password }),
  signup: (name: string, email: string, password: string, institution?: string) =>
    api.post("/auth/signup", { name, email, password, institution }),
};

// ─── Assignments ───────────────────────────────────────────────────────────────
export const assignmentsApi = {
  getAll: () => api.get("/assignments"),
  getById: (id: string) => api.get(`/assignments/${id}`),
  create: (data: object) => api.post("/assignments", data),
  generate: (id: string) => api.post(`/assignments/${id}/generate`),
  refine: (id: string, prompt: string) =>
    api.post(`/assignments/${id}/refine`, { prompt }),
  delete: (id: string) => api.delete(`/assignments/${id}`),
  downloadPdf: (id: string) =>
    api.get(`/assignments/${id}/download`, { responseType: "blob" }),
};

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsApi = {
  getStatus: (assignmentId: string) => api.get(`/jobs/${assignmentId}`),
};

// ─── Groups ───────────────────────────────────────────────────────────────────
export const groupsApi = {
  getAll: () => api.get("/groups"),
  create: (name: string, subject: string, standardClass: string) =>
    api.post("/groups", { name, subject, standardClass }),
  addStudent: (groupId: string, studentEmail: string) =>
    api.post(`/groups/${groupId}/students`, { studentEmail }),
};

// ─── Library ──────────────────────────────────────────────────────────────────
export const libraryApi = {
  getAll: () => api.get("/library"),
  save: (assignmentId: string, customTitle?: string) =>
    api.post("/library/save", { assignmentId, customTitle }),
  delete: (itemId: string) => api.delete(`/library/${itemId}`),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  getProfile: () => api.get("/settings/profile"),
  updateProfile: (name: string, institution: string) =>
    api.put("/settings/profile", { name, institution }),
};

export default api;
