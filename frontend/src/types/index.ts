export enum TimelineEventType {
  DIAGNOSIS = 'diagnosis',
  MEDICATION = 'medication',
  LAB_RESULT = 'lab_result',
  VITALS = 'vitals',
  PROCEDURE = 'procedure',
  ENCOUNTER = 'encounter',
  IMMUNIZATION = 'immunization',
  ALLERGY = 'allergy',
}

export enum Severity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string;
  provider?: string;
  facility?: string;
  severity?: Severity;
  status?: string;
  value?: string;
  unit?: string;
  reference_range?: string;
  category?: string;
  codes: Record<string, any>;
  source: string;
  metadata: Record<string, any>;
}

export interface PatientProfile {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferred_pharmacy?: string;
  primary_care_provider?: string;
  insurance?: {
    provider: string;
    plan: string;
    member_id: string;
  };
}

export interface HealthSummary {
  total_events: number;
  date_range: {
    start: string;
    end: string;
  };
  conditions_count: number;
  medications_count: number;
  providers: string[];
  facilities: string[];
}

export interface LabTrend {
  code: string;
  name: string;
  unit: string;
  data_points: Array<{
    date: string;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  latest_value: string;
  latest_date: string;
}

export interface MedicationSchedule {
  medication_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  prescribed_by: string;
  status: string;
  instructions?: string;
}

export interface TimelineFilter {
  start_date?: string;
  end_date?: string;
  event_types: TimelineEventType[];
  providers: string[];
  search_query?: string;
}
