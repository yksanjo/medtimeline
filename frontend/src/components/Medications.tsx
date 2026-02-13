import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, 
  Clock, 
  User, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { timelineApi } from '../services/api';
import type { MedicationSchedule } from '../types';
import { formatDate } from '../utils/formatters';

export const Medications = () => {
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  
  useEffect(() => {
    loadMedications();
  }, []);
  
  const loadMedications = async () => {
    try {
      setLoading(true);
      const response = await timelineApi.getMedications(false);
      setMedications(response.data);
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const activeMeds = medications.filter(m => m.status === 'active');
  const inactiveMeds = medications.filter(m => m.status !== 'active');
  const displayMeds = showInactive ? medications : activeMeds;
  
  const getFrequencyIcon = (frequency: string) => {
    const freq = frequency.toLowerCase();
    if (freq.includes('daily') || freq.includes('day')) return '1x/day';
    if (freq.includes('bid') || freq.includes('twice')) return '2x/day';
    if (freq.includes('tid') || freq.includes('three')) return '3x/day';
    if (freq.includes('qid') || freq.includes('four')) return '4x/day';
    if (freq.includes('weekly')) return '1x/week';
    return frequency;
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-48 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{activeMeds.length}</p>
              <p className="text-sm text-blue-600">Active Medications</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {activeMeds.filter(m => m.frequency.toLowerCase().includes('daily')).length}
              </p>
              <p className="text-sm text-green-600">Daily Meds</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(activeMeds.map(m => m.prescribed_by)).size}
              </p>
              <p className="text-sm text-purple-600">Prescribing Providers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {showInactive ? 'All Medications' : 'Active Medications'}
        </h2>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showInactive ? 'Show active only' : `Show all (${medications.length})`}
        </button>
      </div>
      
      {/* Medications List */}
      {displayMeds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No medications</h3>
          <p className="text-gray-500 mt-1">
            {showInactive ? 'No medication history found' : 'No active medications'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayMeds.map((med, index) => (
            <motion.div
              key={med.medication_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
                med.status === 'active' 
                  ? 'border-gray-200' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    med.status === 'active' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{med.name}</h3>
                      {med.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {med.status}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {med.dosage} • {med.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Started {formatDate(med.start_date)}
                      </span>
                    </div>
                    
                    {med.instructions && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        {med.instructions}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      Prescribed by {med.prescribed_by}
                    </div>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Add Medication Button */}
      <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Add Medication (Coming Soon)
      </button>
    </div>
  );
};
