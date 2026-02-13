import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Shield,
  CreditCard,
  AlertCircle,
  Edit3,
  Check,
  X
} from 'lucide-react';
import type { PatientProfile } from '../types';
import { formatAge, formatDate } from '../utils/formatters';
import { patientApi } from '../services/api';

export const PatientHeader = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadPatient();
  }, []);
  
  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getProfile();
      setPatient(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load patient profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-48 h-6 bg-gray-200 rounded"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !patient) {
    return (
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error || 'Patient not found'}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Patient Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              <div className="flex items-center gap-3 text-blue-100 text-sm mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatAge(patient.birth_date)} • {formatDate(patient.birth_date)}
                </span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            {patient.primary_care_provider && (
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-blue-200 text-xs">Primary Care</p>
                <p className="font-medium">{patient.primary_care_provider}</p>
              </div>
            )}
            {patient.insurance && (
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <p className="text-blue-200 text-xs">Insurance</p>
                <p className="font-medium">{patient.insurance.provider}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap gap-4 text-sm">
          {patient.phone && (
            <a href={`tel:${patient.phone}`} className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              {patient.phone}
            </a>
          )}
          {patient.email && (
            <a href={`mailto:${patient.email}`} className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              {patient.email}
            </a>
          )}
          {patient.address && (
            <span className="flex items-center gap-1 text-blue-100">
              <MapPin className="w-4 h-4" />
              {patient.address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
