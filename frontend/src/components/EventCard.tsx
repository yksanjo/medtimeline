import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Activity, 
  Scissors,
  Calendar,
  Shield,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useState } from 'react';
import type { TimelineEvent, TimelineEventType, Severity } from '../types';
import { 
  formatDateTime, 
  formatRelativeTime,
  getEventTypeColor, 
  getEventTypeLabel,
  getSeverityColor 
} from '../utils/formatters';

const iconMap: Record<TimelineEventType, React.ComponentType<{ className?: string }>> = {
  diagnosis: Stethoscope,
  medication: Pill,
  lab_result: FlaskConical,
  vitals: Activity,
  procedure: Scissors,
  encounter: Calendar,
  immunization: Shield,
  allergy: AlertTriangle,
};

interface EventCardProps {
  event: TimelineEvent;
  isCompact?: boolean;
}

export const EventCard = ({ event, isCompact = false }: EventCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const Icon = iconMap[event.type] || FileText;
  const typeColorClass = getEventTypeColor(event.type);
  const severityColorClass = getSeverityColor(event.severity);
  
  const isAbnormalLab = event.type === 'lab_result' && event.reference_range && event.value;
  
  // Check if lab value is outside reference range (simplified)
  const checkAbnormal = () => {
    if (!event.value || !event.reference_range) return false;
    const range = event.reference_range;
    const value = parseFloat(event.value);
    if (isNaN(value)) return false;
    
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseFloat(v.trim()));
      return value < min || value > max;
    }
    return false;
  };
  
  const isAbnormal = checkAbnormal();
  
  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className={`p-2 rounded-lg ${typeColorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{event.title}</p>
          <p className="text-xs text-gray-500">{formatRelativeTime(event.date)}</p>
        </div>
        {event.value && (
          <div className={`text-right ${isAbnormal ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
            <span className="text-sm">{event.value}</span>
            {event.unit && <span className="text-xs text-gray-500 ml-1">{event.unit}</span>}
          </div>
        )}
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${typeColorClass} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColorClass}`}>
                    {getEventTypeLabel(event.type)}
                  </span>
                  {event.severity && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColorClass}`}>
                      {event.severity}
                    </span>
                  )}
                  {isAbnormal && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Abnormal
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mt-1">{event.title}</h3>
                
                {event.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{event.description}</p>
                )}
              </div>
              
              <button className="text-gray-400 hover:text-gray-600 shrink-0">
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Value Display (for labs/vitals) */}
            {event.value && (
              <div className="mt-3 flex items-center gap-3">
                <div className={`text-2xl font-bold ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>
                  {event.value}
                  {event.unit && <span className="text-base font-normal text-gray-500 ml-1">{event.unit}</span>}
                </div>
                {event.reference_range && (
                  <div className="text-sm text-gray-500">
                    Reference: {event.reference_range} {event.unit}
                  </div>
                )}
                {event.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {event.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                {event.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
              </div>
            )}
            
            {/* Footer Info */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateTime(event.date)}
              </span>
              {event.provider && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {event.provider}
                </span>
              )}
              {event.facility && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {event.facility}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-gray-100 bg-gray-50 px-4 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.codes && Object.keys(event.codes).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Codes</h4>
                <div className="space-y-1">
                  {Object.entries(event.codes).map(([system, codes]) => (
                    <div key={system} className="text-sm">
                      <span className="text-gray-500 capitalize">{system}:</span>{' '}
                      <span className="font-mono text-gray-700">
                        {Array.isArray(codes) ? codes.join(', ') : codes}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Additional Details</h4>
                <div className="space-y-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>{' '}
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Source</h4>
              <p className="text-sm text-gray-700">{event.source}</p>
              {event.status && (
                <p className="text-sm mt-1">
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className="capitalize text-gray-700">{event.status}</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
