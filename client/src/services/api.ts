import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Chat API
export const chatAPI = {
  sendMessage: (data: {
    message: string;
    platform: string;
    contactInfo?: {
      name: string;
      phone?: string;
      email?: string;
      platform?: string;
    };
    accountId?: string;
    contactId?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  }) =>
    api.post('/chat/message', data),
  
  getConversations: (params?: {
    page?: number;
    limit?: number;
    platform?: string;
    status?: string;
    search?: string;
  }) =>
    api.get('/chat/conversations', { params }),
  
  getConversation: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}`),
  
  updateConversation: (conversationId: string, data: any) =>
    api.put(`/chat/conversations/${conversationId}`, data),
  
  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`),
};

// Leads API
export const leadsAPI = {
  getLeads: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    platform?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) =>
    api.get('/leads', { params }),
  
  getLead: (leadId: string) =>
    api.get(`/leads/${leadId}`),
  
  updateLead: (leadId: string, data: any) =>
    api.put(`/leads/${leadId}`, data),
  
  deleteLead: (leadId: string) =>
    api.delete(`/leads/${leadId}`),
  
  exportLeads: (params?: {
    status?: string;
    platform?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    api.get('/leads/export/csv', { params, responseType: 'blob' }),
  
  getAnalytics: (period?: string) =>
    api.get('/leads/analytics/overview', { params: { period } }),
  
  bulkUpdate: (leadIds: string[], updates: any) =>
    api.put('/leads/bulk/update', { leadIds, updates }),
  
  assignLeads: (leadIds: string[], assignedTo?: string) =>
    api.put('/leads/assign', { leadIds, assignedTo }),
};

// Templates API
export const templatesAPI = {
  getTemplates: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    language?: string;
    isActive?: boolean;
    search?: string;
  }) =>
    api.get('/templates', { params }),
  
  getTemplate: (templateId: string) =>
    api.get(`/templates/${templateId}`),
  
  createTemplate: (data: any) =>
    api.post('/templates', data),
  
  updateTemplate: (templateId: string, data: any) =>
    api.put(`/templates/${templateId}`, data),
  
  deleteTemplate: (templateId: string) =>
    api.delete(`/templates/${templateId}`),
  
  cloneTemplate: (templateId: string, name: string) =>
    api.post(`/templates/${templateId}/clone`, { name }),
  
  testTemplate: (templateId: string, variables?: any) =>
    api.post(`/templates/${templateId}/test`, { variables }),
  
  getCategories: () =>
    api.get('/templates/meta/categories'),
  
  getTemplateStats: (templateId: string) =>
    api.get(`/templates/${templateId}/stats`),
  
  bulkUpdate: (templateIds: string[], updates: any) =>
    api.put('/templates/bulk/update', { templateIds, updates }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (period?: string) =>
    api.get('/dashboard/overview', { params: { period } }),
  
  getActivity: (params?: { limit?: number; offset?: number }) =>
    api.get('/dashboard/activity', { params }),
  
  getPerformance: (period?: string) =>
    api.get('/dashboard/performance', { params: { period } }),
  
  getHealth: () =>
    api.get('/dashboard/health'),
  
  exportData: (type?: string) =>
    api.get('/dashboard/export', { params: { type }, responseType: 'blob' }),
  
  // Admin routes
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    api.get('/dashboard/admin/users', { params }),
  
  getSystemStats: () =>
    api.get('/dashboard/admin/system-stats'),
};

// Utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

export default api;
