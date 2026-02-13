import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  Scissors,
  Shield,
  AlertTriangle,
  X
} from 'lucide-react';
import { EventCard } from './EventCard';
import { timelineApi } from '../services/api';
import type { TimelineEvent, TimelineEventType, HealthSummary } from '../types';
import { 
  formatDate, 
  groupEventsByMonth, 
  getEventTypeColor,
  getEventTypeLabel,
  filterEvents 
} from '../utils/formatters';

const eventTypeFilters: { type: TimelineEventType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: 'diagnosis', icon: Stethoscope, label: 'Diagnoses' },
  { type: 'medication', icon: Pill, label: 'Medications' },
  { type: 'lab_result', icon: FlaskConical, label: 'Lab Results' },
  { type: 'vitals', icon: Activity, label: 'Vitals' },
  { type: 'procedure', icon: Scissors, label: 'Procedures' },
  { type: 'encounter', icon: Calendar, label: 'Visits' },
  { type: 'immunization', icon: Shield, label: 'Immunizations' },
  { type: 'allergy', icon: AlertTriangle, label: 'Allergies' },
];

export const Timeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TimelineEventType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, summaryRes] = await Promise.all([
        timelineApi.getEvents(),
        timelineApi.getSummary()
      ]);
      setEvents(eventsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredEvents = useMemo(() => {
    return filterEvents(events, searchTerm, selectedTypes);
  }, [events, searchTerm, selectedTypes]);
  
  const groupedEvents = useMemo(() => {
    return groupEventsByMonth(filteredEvents);
  }, [filteredEvents]);
  
  const toggleEventType = (type: TimelineEventType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
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
      {/* Header & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records, providers, facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || selectedTypes.length > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {selectedTypes.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedTypes.length}
              </span>
            )}
          </button>
          
          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
        
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Filter by type</span>
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {eventTypeFilters.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => toggleEventType(type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedTypes.includes(type)
                          ? getEventTypeColor(type)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{events.length}</span> records
        </p>
        {summary && (
          <p className="text-sm text-gray-500">
            {formatDate(summary.date_range.start)} - {formatDate(summary.date_range.end)}
          </p>
        )}
      </div>
      
      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No records found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || selectedTypes.length > 0
              ? 'Try adjusting your filters'
              : 'Your health timeline will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groupedEvents.entries()).map(([month, monthEvents]) => (
            <div key={month} className="relative">
              {/* Month Header */}
              <div className="sticky top-0 z-10 flex items-center gap-4 mb-4 bg-gray-50/95 backdrop-blur-sm py-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{month}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">{monthEvents.length} events</span>
              </div>
              
              {/* Events */}
              <div className="space-y-4">
                {monthEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
