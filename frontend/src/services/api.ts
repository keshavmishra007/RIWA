import axios from 'axios';
import type {
  Incident,
  Complaint,
  Hotspot,
  AnalyticsOverview,
  User,
  FusionExplanation,
  IncidentStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if available
apiClient.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('riwa_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (err) {
    console.error('Error attaching auth token:', err);
  }
  return config;
});

// ─── AUTH API ────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await apiClient.post('/auth/login', { email: email.trim(), password });
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string }): Promise<{ token: string; user: User }> => {
    const res = await apiClient.post('/auth/register', {
      ...data,
      email: data.email.trim(),
    });
    return res.data;
  },
  demoLogin: async (role: string): Promise<{ token: string; user: User }> => {
    const res = await apiClient.post('/auth/demo-login', { role });
    return res.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

// ─── INCIDENTS API ───────────────────────────────────────────────────

export const incidentsApi = {
  getAll: async (filters?: { category?: string; priority?: string; status?: string; search?: string }): Promise<Incident[]> => {
    try {
      const res = await apiClient.get('/incidents', { params: filters });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch incidents from backend:', err);
      return [];
    }
  },

  getById: async (
    id: string
  ): Promise<{
    incident: Incident;
    relatedReports: any[];
    fusionExplanation: FusionExplanation;
    statusLogs: any[];
  }> => {
    const res = await apiClient.get(`/incidents/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: IncidentStatus, note?: string): Promise<Incident> => {
    const res = await apiClient.patch(`/incidents/${id}/status`, { status, note });
    return res.data.incident;
  },

  assignDepartment: async (id: string, departmentName: string, departmentId?: string, note?: string): Promise<Incident> => {
    const res = await apiClient.patch(`/incidents/${id}/assign`, { departmentName, departmentId, note });
    return res.data.incident;
  },
};

// ─── CITIZEN REPORTS API ─────────────────────────────────────────────

export const reportsApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.imageUrl;
  },

  submit: async (data: {
    description: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
  }): Promise<{
    success: boolean;
    complaint: Complaint;
    incident: Incident;
    isAutoMerged: boolean;
    aiAnalysis: any;
    fusionResult: any;
  }> => {
    const res = await apiClient.post('/reports', data);
    return res.data;
  },

  getMyReports: async (): Promise<Complaint[]> => {
    try {
      const res = await apiClient.get('/reports/my');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch citizen reports:', err);
      return [];
    }
  },

  getById: async (id: string): Promise<{ report: Complaint; incident?: Incident }> => {
    const res = await apiClient.get(`/reports/${id}`);
    return res.data;
  },
};

// ─── HOTSPOTS API ────────────────────────────────────────────────────

export const hotspotsApi = {
  getAll: async (): Promise<Hotspot[]> => {
    try {
      const res = await apiClient.get('/hotspots');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch hotspots:', err);
      return [];
    }
  },
};

// ─── ANALYTICS API ───────────────────────────────────────────────────

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },
};

// ─── DEPARTMENTS API ─────────────────────────────────────────────────

export const departmentsApi = {
  getAll: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/departments');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      return [];
    }
  },
};
