import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { TimelineEventType, Severity, type TimelineEvent } from '../types';

export const formatDate = (dateString: string, formatStr = 'MMM d, yyyy'): string => {
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return format(date, formatStr);
};

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return format(date, 'MMM d, yyyy • h:mm a');
};

export const formatRelativeTime = (dateString: string): string => {
  const date = parseISO(dateString);
  if (!isValid(date)) return 'Invalid date';
  return formatDistanceToNow(date, { addSuffix: true });
};

export const formatAge = (birthDateString: string): string => {
  const birthDate = parseISO(birthDateString);
  if (!isValid(birthDate)) return 'Unknown';
  
  const now = new Date();
  const years = now.getFullYear() - birthDate.getFullYear();
  const months = now.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
    return `${years - 1} years`;
  }
  return `${years} years`;
};

export const getEventTypeIcon = (type: TimelineEventType): string => {
  const icons: Record<TimelineEventType, string> = {
    [TimelineEventType.DIAGNOSIS]: 'Stethoscope',
    [TimelineEventType.MEDICATION]: 'Pill',
    [TimelineEventType.LAB_RESULT]: 'FlaskConical',
    [TimelineEventType.VITALS]: 'Activity',
    [TimelineEventType.PROCEDURE]: 'Scissors',
    [TimelineEventType.ENCOUNTER]: 'Calendar',
    [TimelineEventType.IMMUNIZATION]: 'Shield',
    [TimelineEventType.ALLERGY]: 'AlertTriangle',
  };
  return icons[type] || 'FileText';
};

export const getEventTypeColor = (type: TimelineEventType): string => {
  const colors: Record<TimelineEventType, string> = {
    [TimelineEventType.DIAGNOSIS]: 'bg-red-100 text-red-700 border-red-200',
    [TimelineEventType.MEDICATION]: 'bg-blue-100 text-blue-700 border-blue-200',
    [TimelineEventType.LAB_RESULT]: 'bg-purple-100 text-purple-700 border-purple-200',
    [TimelineEventType.VITALS]: 'bg-green-100 text-green-700 border-green-200',
    [TimelineEventType.PROCEDURE]: 'bg-orange-100 text-orange-700 border-orange-200',
    [TimelineEventType.ENCOUNTER]: 'bg-gray-100 text-gray-700 border-gray-200',
    [TimelineEventType.IMMUNIZATION]: 'bg-teal-100 text-teal-700 border-teal-200',
    [TimelineEventType.ALLERGY]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

export const getEventTypeLabel = (type: TimelineEventType): string => {
  const labels: Record<TimelineEventType, string> = {
    [TimelineEventType.DIAGNOSIS]: 'Diagnosis',
    [TimelineEventType.MEDICATION]: 'Medication',
    [TimelineEventType.LAB_RESULT]: 'Lab Result',
    [TimelineEventType.VITALS]: 'Vitals',
    [TimelineEventType.PROCEDURE]: 'Procedure',
    [TimelineEventType.ENCOUNTER]: 'Visit',
    [TimelineEventType.IMMUNIZATION]: 'Immunization',
    [TimelineEventType.ALLERGY]: 'Allergy',
  };
  return labels[type] || type;
};

export const getSeverityColor = (severity?: Severity): string => {
  if (!severity) return 'bg-gray-100 text-gray-600';
  
  const colors: Record<Severity, string> = {
    [Severity.MILD]: 'bg-yellow-100 text-yellow-700',
    [Severity.MODERATE]: 'bg-orange-100 text-orange-700',
    [Severity.SEVERE]: 'bg-red-100 text-red-700',
    [Severity.CRITICAL]: 'bg-red-200 text-red-800 font-semibold',
  };
  return colors[severity];
};

export const groupEventsByDate = (events: TimelineEvent[]): Map<string, TimelineEvent[]> => {
  const groups = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    const dateKey = formatDate(event.date, 'yyyy-MM-dd');
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(event);
  });
  
  return groups;
};

export const groupEventsByMonth = (events: TimelineEvent[]): Map<string, TimelineEvent[]> => {
  const groups = new Map<string, TimelineEvent[]>();
  
  events.forEach(event => {
    const date = parseISO(event.date);
    const monthKey = format(date, 'MMMM yyyy');
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(event);
  });
  
  return groups;
};

export const filterEvents = (
  events: TimelineEvent[],
  searchTerm: string,
  selectedTypes: TimelineEventType[]
): TimelineEvent[] => {
  return events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.facility?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.type);
    
    return matchesSearch && matchesType;
  });
};
