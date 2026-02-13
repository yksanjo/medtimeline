"""
MedTimeline Backend API
FHIR-enabled patient health record aggregator with timeline visualization
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MedTimeline API",
    description="Patient Health Record Timeline Visualization",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ENUMS AND MODELS
# ============================================================================

class ResourceType(str, Enum):
    CONDITION = "Condition"
    MEDICATION = "MedicationRequest"
    OBSERVATION = "Observation"
    ENCOUNTER = "Encounter"
    PROCEDURE = "Procedure"
    DIAGNOSTIC_REPORT = "DiagnosticReport"
    ALLERGY_INTOLERANCE = "AllergyIntolerance"

class TimelineEventType(str, Enum):
    DIAGNOSIS = "diagnosis"
    MEDICATION = "medication"
    LAB_RESULT = "lab_result"
    VITALS = "vitals"
    PROCEDURE = "procedure"
    ENCOUNTER = "encounter"
    IMMUNIZATION = "immunization"
    ALLERGY = "allergy"

class Severity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class TimelineEvent(BaseModel):
    id: str
    type: TimelineEventType
    title: str
    description: Optional[str] = None
    date: datetime
    provider: Optional[str] = None
    facility: Optional[str] = None
    severity: Optional[Severity] = None
    status: Optional[str] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    category: Optional[str] = None
    codes: Dict[str, Any] = Field(default_factory=dict)
    source: str = "EHR"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class HealthSummary(BaseModel):
    total_events: int
    date_range: Dict[str, datetime]
    conditions_count: int
    medications_count: int
    providers: List[str]
    facilities: List[str]

class TimelineFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    event_types: List[TimelineEventType] = []
    providers: List[str] = []
    search_query: Optional[str] = None

class PatientProfile(BaseModel):
    id: str
    name: str
    birth_date: date
    gender: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    preferred_pharmacy: Optional[str] = None
    primary_care_provider: Optional[str] = None
    insurance: Optional[Dict[str, str]] = None

class LabTrend(BaseModel):
    code: str
    name: str
    unit: str
    data_points: List[Dict[str, Any]]
    trend: str  # "increasing", "decreasing", "stable"
    latest_value: str
    latest_date: datetime

class MedicationSchedule(BaseModel):
    medication_id: str
    name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    prescribed_by: str
    status: str
    instructions: Optional[str] = None

# ============================================================================
# FHIR CLIENT
# ============================================================================

class FHIRClient:
    """Client for interacting with FHIR R4 APIs"""
    
    def __init__(self, base_url: str, access_token: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.access_token = access_token
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, *args):
        await self.client.aclose()
    
    def _headers(self):
        headers = {"Accept": "application/fhir+json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    async def get_patient(self, patient_id: str) -> Dict:
        """Fetch patient demographics"""
        url = f"{self.base_url}/Patient/{patient_id}"
        response = await self.client.get(url, headers=self._headers())
        response.raise_for_status()
        return response.json()
    
    async def get_conditions(self, patient_id: str) -> List[Dict]:
        """Fetch patient conditions"""
        url = f"{self.base_url}/Condition"
        params = {"patient": patient_id, "_sort": "-date"}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_medications(self, patient_id: str) -> List[Dict]:
        """Fetch medication requests"""
        url = f"{self.base_url}/MedicationRequest"
        params = {"patient": patient_id, "_sort": "-authoredon"}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_observations(self, patient_id: str, category: Optional[str] = None) -> List[Dict]:
        """Fetch observations (labs, vitals)"""
        url = f"{self.base_url}/Observation"
        params = {"patient": patient_id, "_sort": "-date", "_count": 100}
        if category:
            params["category"] = category
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_encounters(self, patient_id: str) -> List[Dict]:
        """Fetch encounters/visits"""
        url = f"{self.base_url}/Encounter"
        params = {"patient": patient_id, "_sort": "-date"}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_procedures(self, patient_id: str) -> List[Dict]:
        """Fetch procedures"""
        url = f"{self.base_url}/Procedure"
        params = {"patient": patient_id, "_sort": "-date"}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_diagnostic_reports(self, patient_id: str) -> List[Dict]:
        """Fetch diagnostic reports"""
        url = f"{self.base_url}/DiagnosticReport"
        params = {"patient": patient_id, "_sort": "-date"}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])
    
    async def get_allergy_intolerances(self, patient_id: str) -> List[Dict]:
        """Fetch allergies"""
        url = f"{self.base_url}/AllergyIntolerance"
        params = {"patient": patient_id}
        response = await self.client.get(url, params=params, headers=self._headers())
        response.raise_for_status()
        data = response.json()
        return data.get("entry", [])

# ============================================================================
# FHIR TO TIMELINE TRANSFORMERS
# ============================================================================

class FHIRTransformer:
    """Transform FHIR resources to timeline events"""
    
    @staticmethod
    def parse_name(name_resource: Dict) -> str:
        """Extract human-readable name from FHIR name"""
        if not name_resource:
            return "Unknown"
        given = " ".join(name_resource.get("given", []))
        family = name_resource.get("family", "")
        return f"{given} {family}".strip()
    
    @staticmethod
    def parse_date(date_str: Optional[str]) -> Optional[datetime]:
        """Parse FHIR date/datetime strings"""
        if not date_str:
            return None
        formats = [
            "%Y-%m-%dT%H:%M:%S.%f%z",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d"
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
    
    @staticmethod
    def transform_condition(entry: Dict) -> Optional[TimelineEvent]:
        """Convert FHIR Condition to timeline event"""
        resource = entry.get("resource", {})
        code = resource.get("code", {})
        
        onset = FHIRTransformer.parse_date(
            resource.get("onsetDateTime") or resource.get("onsetPeriod", {}).get("start")
        )
        if not onset:
            return None
        
        severity = None
        if resource.get("severity"):
            severity_text = resource["severity"].get("text", "").lower()
            if "severe" in severity_text or "critical" in severity_text:
                severity = Severity.SEVERE
            elif "moderate" in severity_text:
                severity = Severity.MODERATE
            elif "mild" in severity_text:
                severity = Severity.MILD
        
        return TimelineEvent(
            id=resource.get("id", ""),
            type=TimelineEventType.DIAGNOSIS,
            title=code.get("text", "Unknown Condition"),
            description=resource.get("note", [{}])[0].get("text") if resource.get("note") else None,
            date=onset,
            provider=FHIRTransformer.parse_name(resource.get("asserter", {}).get("display", "")),
            severity=severity,
            status=resource.get("clinicalStatus", {}).get("coding", [{}])[0].get("code"),
            codes={"icd10": [c.get("code") for c in code.get("coding", []) if c.get("system", "").endswith("icd10")]},
            source="EHR"
        )
    
    @staticmethod
    def transform_medication(entry: Dict) -> Optional[TimelineEvent]:
        """Convert FHIR MedicationRequest to timeline event"""
        resource = entry.get("resource", {})
        med_code = resource.get("medicationCodeableConcept", {})
        
        authored = FHIRTransformer.parse_date(resource.get("authoredOn"))
        if not authored:
            return None
        
        dosage = resource.get("dosageInstruction", [{}])[0]
        dosage_text = dosage.get("text", "")
        
        return TimelineEvent(
            id=resource.get("id", ""),
            type=TimelineEventType.MEDICATION,
            title=med_code.get("text", "Unknown Medication"),
            description=dosage_text,
            date=authored,
            provider=FHIRTransformer.parse_name(resource.get("requester", {}).get("display", "")),
            status=resource.get("status"),
            codes={"rxnorm": [c.get("code") for c in med_code.get("coding", []) if "rxnorm" in c.get("system", "")]},
            source="EHR",
            metadata={
                "intent": resource.get("intent"),
                "dosage": dosage_text,
                "duration": dosage.get("timing", {}).get("repeat", {}).get("boundsDuration", {}).get("value")
            }
        )
    
    @staticmethod
    def transform_observation(entry: Dict) -> Optional[TimelineEvent]:
        """Convert FHIR Observation to timeline event"""
        resource = entry.get("resource", {})
        code = resource.get("code", {})
        
        effective = FHIRTransformer.parse_date(
            resource.get("effectiveDateTime") or resource.get("effectivePeriod", {}).get("start")
        )
        if not effective:
            return None
        
        value = resource.get("valueQuantity", {})
        value_str = f"{value.get('value', '')}" if value else resource.get("valueString", "")
        unit = value.get("unit", "")
        
        # Determine event type based on category
        category = resource.get("category", [{}])[0].get("text", "")
        event_type = TimelineEventType.LAB_RESULT if "laboratory" in category.lower() else TimelineEventType.VITALS
        
        reference_range = None
        if resource.get("referenceRange"):
            rr = resource["referenceRange"][0]
            low = rr.get("low", {}).get("value", "")
            high = rr.get("high", {}).get("value", "")
            if low and high:
                reference_range = f"{low}-{high}"
        
        return TimelineEvent(
            id=resource.get("id", ""),
            type=event_type,
            title=code.get("text", "Unknown Observation"),
            date=effective,
            value=value_str,
            unit=unit,
            reference_range=reference_range,
            category=category,
            status=resource.get("status"),
            codes={"loinc": [c.get("code") for c in code.get("coding", []) if "loinc" in c.get("system", "")]},
            source="EHR",
            metadata={
                "interpretation": resource.get("interpretation", [{}])[0].get("text"),
                "body_site": resource.get("bodySite", {}).get("text")
            }
        )
    
    @staticmethod
    def transform_encounter(entry: Dict) -> Optional[TimelineEvent]:
        """Convert FHIR Encounter to timeline event"""
        resource = entry.get("resource", {})
        period = resource.get("period", {})
        
        start = FHIRTransformer.parse_date(period.get("start"))
        if not start:
            return None
        
        type_coding = resource.get("type", [{}])[0].get("coding", [{}])[0]
        encounter_type = type_coding.get("display", type_coding.get("code", "Visit"))
        
        return TimelineEvent(
            id=resource.get("id", ""),
            type=TimelineEventType.ENCOUNTER,
            title=encounter_type,
            description=resource.get("reasonCode", [{}])[0].get("text"),
            date=start,
            provider=FHIRTransformer.parse_name(resource.get("participant", [{}])[0].get("individual", {}).get("display", "")),
            facility=resource.get("location", [{}])[0].get("location", {}).get("display"),
            status=resource.get("status"),
            source="EHR",
            metadata={
                "class": resource.get("class", {}).get("code"),
                "priority": resource.get("priority", {}).get("text"),
                "length": resource.get("length", {}).get("value")
            }
        )
    
    @staticmethod
    def transform_procedure(entry: Dict) -> Optional[TimelineEvent]:
        """Convert FHIR Procedure to timeline event"""
        resource = entry.get("resource", {})
        code = resource.get("code", {})
        
        performed = FHIRTransformer.parse_date(
            resource.get("performedDateTime") or resource.get("performedPeriod", {}).get("start")
        )
        if not performed:
            return None
        
        return TimelineEvent(
            id=resource.get("id", ""),
            type=TimelineEventType.PROCEDURE,
            title=code.get("text", "Unknown Procedure"),
            description=resource.get("note", [{}])[0].get("text") if resource.get("note") else None,
            date=performed,
            provider=FHIRTransformer.parse_name(resource.get("performer", [{}])[0].get("actor", {}).get("display", "")),
            facility=resource.get("location", {}).get("display"),
            status=resource.get("status"),
            source="EHR",
            metadata={
                "category": resource.get("category", {}).get("text"),
                "outcome": resource.get("outcome", {}).get("text")
            }
        )

# ============================================================================
# API ENDPOINTS
# ============================================================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Demo patient data for testing without real FHIR server
DEMO_PATIENT = PatientProfile(
    id="demo-patient-001",
    name="Sarah Johnson",
    birth_date=date(1985, 3, 15),
    gender="female",
    address="123 Main St, Boston, MA 02101",
    phone="(555) 123-4567",
    email="sarah.j@email.com",
    emergency_contact={
        "name": "Michael Johnson",
        "relationship": "spouse",
        "phone": "(555) 987-6543"
    },
    primary_care_provider="Dr. Emily Chen, MD",
    insurance={
        "provider": "Blue Cross Blue Shield",
        "plan": "PPO",
        "member_id": "BC123456789"
    }
)

DEMO_TIMELINE = [
    TimelineEvent(
        id="cond-001",
        type=TimelineEventType.DIAGNOSIS,
        title="Type 2 Diabetes Mellitus",
        description="Patient presents with elevated HbA1c of 8.2%. Started on metformin 500mg BID. Dietary counseling provided.",
        date=datetime(2023, 6, 15, 10, 30),
        provider="Dr. Emily Chen",
        facility="Boston General Hospital",
        severity=Severity.MODERATE,
        status="active",
        codes={"icd10": ["E11.9"]},
        source="EHR"
    ),
    TimelineEvent(
        id="med-001",
        type=TimelineEventType.MEDICATION,
        title="Metformin",
        description="500mg twice daily with meals",
        date=datetime(2023, 6, 15, 11, 0),
        provider="Dr. Emily Chen",
        status="active",
        codes={"rxnorm": ["6809"]},
        source="EHR",
        metadata={"dosage": "500mg", "frequency": "BID"}
    ),
    TimelineEvent(
        id="lab-001",
        type=TimelineEventType.LAB_RESULT,
        title="HbA1c",
        date=datetime(2023, 6, 10, 8, 15),
        value="8.2",
        unit="%",
        reference_range="4.0-5.6",
        status="final",
        codes={"loinc": ["4548-4"]},
        source="LabCorp"
    ),
    TimelineEvent(
        id="enc-001",
        type=TimelineEventType.ENCOUNTER,
        title="Office Visit - Endocrinology",
        description="Follow-up for diabetes management. Patient reports adherence to medication. No hypoglycemic episodes.",
        date=datetime(2023, 9, 20, 14, 0),
        provider="Dr. Emily Chen",
        facility="Boston General Hospital",
        status="finished",
        source="EHR"
    ),
    TimelineEvent(
        id="lab-002",
        type=TimelineEventType.LAB_RESULT,
        title="HbA1c",
        date=datetime(2023, 9, 18, 9, 30),
        value="7.1",
        unit="%",
        reference_range="4.0-5.6",
        status="final",
        codes={"loinc": ["4548-4"]},
        source="Quest Diagnostics"
    ),
    TimelineEvent(
        id="med-002",
        type=TimelineEventType.MEDICATION,
        title="Lisinopril",
        description="10mg once daily for blood pressure",
        date=datetime(2023, 9, 20, 14, 30),
        provider="Dr. Emily Chen",
        status="active",
        codes={"rxnorm": ["29046"]},
        source="EHR",
        metadata={"dosage": "10mg", "frequency": "daily"}
    ),
    TimelineEvent(
        id="proc-001",
        type=TimelineEventType.PROCEDURE,
        title="Comprehensive Metabolic Panel",
        date=datetime(2024, 1, 15, 8, 0),
        provider="Dr. Emily Chen",
        facility="Boston General Hospital",
        status="completed",
        source="EHR"
    ),
    TimelineEvent(
        id="lab-003",
        type=TimelineEventType.LAB_RESULT,
        title="Glucose, Fasting",
        date=datetime(2024, 1, 15, 10, 0),
        value="118",
        unit="mg/dL",
        reference_range="70-100",
        status="final",
        codes={"loinc": ["1558-6"]},
        source="Boston General Lab"
    ),
    TimelineEvent(
        id="lab-004",
        type=TimelineEventType.LAB_RESULT,
        title="HbA1c",
        date=datetime(2024, 1, 15, 10, 0),
        value="6.8",
        unit="%",
        reference_range="4.0-5.6",
        status="final",
        codes={"loinc": ["4548-4"]},
        source="Boston General Lab"
    ),
    TimelineEvent(
        id="enc-002",
        type=TimelineEventType.ENCOUNTER,
        title="Annual Physical",
        description="Patient doing well. Diabetes well-controlled. Continue current regimen. Next visit in 6 months.",
        date=datetime(2024, 1, 15, 11, 0),
        provider="Dr. Emily Chen",
        facility="Boston General Hospital",
        status="finished",
        source="EHR"
    ),
    TimelineEvent(
        id="vitals-001",
        type=TimelineEventType.VITALS,
        title="Blood Pressure",
        date=datetime(2024, 1, 15, 10, 45),
        value="128/82",
        unit="mmHg",
        status="final",
        source="EHR"
    ),
    TimelineEvent(
        id="vitals-002",
        type=TimelineEventType.VITALS,
        title="Weight",
        date=datetime(2024, 1, 15, 10, 45),
        value="165",
        unit="lbs",
        status="final",
        source="EHR"
    ),
    TimelineEvent(
        id="allergy-001",
        type=TimelineEventType.ALLERGY,
        title="Penicillin Allergy",
        description="Rash and hives",
        date=datetime(2010, 5, 20, 0, 0),
        severity=Severity.MODERATE,
        status="active",
        source="EHR"
    ),
]

@app.get("/")
async def root():
    return {"message": "MedTimeline API", "version": "1.0.0"}

@app.get("/api/patient/profile", response_model=PatientProfile)
async def get_patient_profile():
    """Get current patient profile"""
    return DEMO_PATIENT

@app.get("/api/timeline", response_model=List[TimelineEvent])
async def get_timeline(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None
):
    """Get timeline events with optional filtering"""
    events = DEMO_TIMELINE.copy()
    
    # Apply date filters
    if start_date:
        events = [e for e in events if e.date.date() >= start_date]
    if end_date:
        events = [e for e in events if e.date.date() <= end_date]
    
    # Apply event type filter
    if event_type:
        try:
            filter_type = TimelineEventType(event_type)
            events = [e for e in events if e.type == filter_type]
        except ValueError:
            pass
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        events = [
            e for e in events 
            if search_lower in e.title.lower() 
            or (e.description and search_lower in e.description.lower())
            or (e.provider and search_lower in e.provider.lower())
        ]
    
    # Sort by date descending
    events.sort(key=lambda x: x.date, reverse=True)
    
    return events

@app.get("/api/timeline/summary", response_model=HealthSummary)
async def get_timeline_summary():
    """Get summary statistics for timeline"""
    events = DEMO_TIMELINE
    
    dates = [e.date for e in events if e.date]
    providers = list(set(e.provider for e in events if e.provider))
    facilities = list(set(e.facility for e in events if e.facility))
    
    conditions = len([e for e in events if e.type == TimelineEventType.DIAGNOSIS])
    medications = len([e for e in events if e.type == TimelineEventType.MEDICATION])
    
    return HealthSummary(
        total_events=len(events),
        date_range={
            "start": min(dates) if dates else datetime.now(),
            "end": max(dates) if dates else datetime.now()
        },
        conditions_count=conditions,
        medications_count=medications,
        providers=providers,
        facilities=facilities
    )

@app.get("/api/trends/{lab_code}", response_model=LabTrend)
async def get_lab_trend(lab_code: str):
    """Get trend data for a specific lab test"""
    # Filter observations by LOINC code
    lab_events = [e for e in DEMO_TIMELINE if e.type == TimelineEventType.LAB_RESULT and lab_code in str(e.codes)]
    
    if not lab_events:
        raise HTTPException(status_code=404, detail="Lab test not found")
    
    # Sort by date
    lab_events.sort(key=lambda x: x.date)
    
    data_points = [
        {"date": e.date, "value": float(e.value) if e.value else None}
        for e in lab_events
        if e.value
    ]
    
    # Calculate trend
    if len(data_points) >= 2:
        first_val = data_points[0]["value"]
        last_val = data_points[-1]["value"]
        diff = last_val - first_val
        threshold = first_val * 0.05  # 5% threshold
        
        if abs(diff) < threshold:
            trend = "stable"
        elif diff > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
    else:
        trend = "insufficient_data"
    
    latest = lab_events[-1]
    
    return LabTrend(
        code=lab_code,
        name=latest.title,
        unit=latest.unit or "",
        data_points=data_points,
        trend=trend,
        latest_value=latest.value or "",
        latest_date=latest.date
    )

@app.get("/api/medications", response_model=List[MedicationSchedule])
async def get_medications(active_only: bool = False):
    """Get medication schedule"""
    med_events = [e for e in DEMO_TIMELINE if e.type == TimelineEventType.MEDICATION]
    
    medications = []
    for e in med_events:
        med = MedicationSchedule(
            medication_id=e.id,
            name=e.title,
            dosage=e.metadata.get("dosage", ""),
            frequency=e.metadata.get("frequency", ""),
            start_date=e.date.date(),
            prescribed_by=e.provider or "Unknown",
            status=e.status or "unknown",
            instructions=e.description
        )
        if not active_only or med.status == "active":
            medications.append(med)
    
    return medications

@app.post("/api/fhir/connect")
async def connect_fhir(fhir_url: str, access_token: str):
    """Connect to external FHIR server"""
    try:
        async with FHIRClient(fhir_url, access_token) as client:
            # Test connection by fetching metadata
            response = await client.client.get(f"{fhir_url}/metadata")
            response.raise_for_status()
            return {"status": "connected", "server": fhir_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to connect: {str(e)}")

@app.get("/api/fhir/patient/{patient_id}/timeline")
async def get_fhir_timeline(patient_id: str, fhir_url: str, access_token: str):
    """Fetch timeline from external FHIR server"""
    events = []
    
    async with FHIRClient(fhir_url, access_token) as client:
        # Fetch all resource types concurrently
        conditions = await client.get_conditions(patient_id)
        medications = await client.get_medications(patient_id)
        observations = await client.get_observations(patient_id)
        encounters = await client.get_encounters(patient_id)
        procedures = await client.get_procedures(patient_id)
        
        # Transform to timeline events
        for entry in conditions:
            event = FHIRTransformer.transform_condition(entry)
            if event:
                events.append(event)
        
        for entry in medications:
            event = FHIRTransformer.transform_medication(entry)
            if event:
                events.append(event)
        
        for entry in observations:
            event = FHIRTransformer.transform_observation(entry)
            if event:
                events.append(event)
        
        for entry in encounters:
            event = FHIRTransformer.transform_encounter(entry)
            if event:
                events.append(event)
        
        for entry in procedures:
            event = FHIRTransformer.transform_procedure(entry)
            if event:
                events.append(event)
    
    # Sort by date
    events.sort(key=lambda x: x.date, reverse=True)
    
    return events

@app.get("/api/export/pdf")
async def export_pdf():
    """Export timeline to PDF format"""
    # This would integrate with a PDF generation library
    # For now, return a mock response
    return {
        "message": "PDF export functionality",
        "note": "Integrate with ReportLab or WeasyPrint for PDF generation",
        "timeline_events": len(DEMO_TIMELINE)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
