import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthorized to automatically clean state
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

/* ==================== API SERVICES ==================== */

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const resumeAPI = {
  upload: (formData: FormData) =>
    api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  update: (id: string, data: any) => api.patch(`/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

export const jobAPI = {
  create: (data: any) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  getById: (id: string) => api.get(`/jobs/${id}`),
  delete: (id: string) => api.delete(`/jobs/${id}`),
};

export const matchAPI = {
  analyze: (data: { resumeId: string; jobDescriptionId: string }) =>
    api.post('/matches/analyze', data),
  getAll: () => api.get('/matches'),
  getById: (id: string) => api.get(`/matches/${id}`),
};

export const skillAPI = {
  getAll: () => api.get('/skills'),
  add: (data: any) => api.post('/skills', data),
  update: (id: string, data: any) => api.patch(`/skills/${id}`, data),
  getGaps: () => api.get('/skills/gaps'),
};

export const roadmapAPI = {
  generate: (data: any) => api.post('/roadmaps/generate', data),
  getAll: () => api.get('/roadmaps'),
  getById: (id: string) => api.get(`/roadmaps/${id}`),
  updateMilestone: (roadmapId: string, milestoneId: string, isCompleted: boolean) =>
    api.patch(`/roadmaps/${roadmapId}/milestones/${milestoneId}`, { isCompleted }),
};

export const projectAPI = {
  recommend: (data: any) => api.post('/projects/recommend', data),
  getAll: () => api.get('/projects'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/projects/${id}`, { status }),
};

export const interviewAPI = {
  startSession: (data: any) => api.post('/interviews', data),
  getAll: () => api.get('/interviews'),
  getById: (id: string) => api.get(`/interviews/${id}`),
  submitAnswer: (sessionId: string, data: { questionId: string; userText: string }) =>
    api.post(`/interviews/${sessionId}/answers`, data),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getProgress: () => api.get('/analytics/progress'),
};
