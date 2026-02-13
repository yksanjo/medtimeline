import axios from 'axios';
import type { 
  TimelineEvent, 
  PatientProfile, 
  HealthSummary, 
  LabTrend,
  MedicationSchedule,
  TimelineFilter 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const patientApi = {
  getProfile: () => api.get<PatientProfile>('/patient/profile'),
};

export const timelineApi = {
  getEvents: (filters?: Partial<TimelineFilter>) => 
    api.get<TimelineEvent[]>('/timeline', { params: filters }),
  
  getSummary: () => 
    api.get<HealthSummary>('/timeline/summary'),
  
  getLabTrend: (labCode: string) => 
    api.get<LabTrend>(`/trends/${labCode}`),
  
  getMedications: (activeOnly = false) => 
    api.get<MedicationSchedule[]>(`/medications?active_only=${activeOnly}`),
  
  exportPdf: () => 
    api.get('/export/pdf'),
};

export const fhirApi = {
  connect: (fhirUrl: string, accessToken: string) =>
    api.post('/fhir/connect', { fhir_url: fhirUrl, access_token: accessToken }),
  
  getTimeline: (patientId: string, fhirUrl: string, accessToken: string) =>
    api.get(`/fhir/patient/${patientId}/timeline`, {
      params: { fhir_url: fhirUrl, access_token: accessToken }
    }),
};

export default api;
