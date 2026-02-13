# MedTimeline

> **Patient Health Record Timeline Viewer** - Consumer-facing medical record aggregator with FHIR integration and chronological narrative visualization.

![MedTimeline Screenshot](docs/screenshot.png)

## Overview

MedTimeline is a modern healthcare application that empowers patients to view, understand, and track their complete health history in a unified, chronological timeline. It aggregates medical records from multiple sources using FHIR R4 standards and presents them in an intuitive, narrative format.

### Key Features

- **Unified Timeline View**: See all health events chronologically (diagnoses, medications, lab results, procedures, visits)
- **Lab Trend Analysis**: Track lab results over time with interactive charts
- **Medication Management**: View active and historical medications with schedules
- **FHIR R4 Compatible**: Connects to Epic, Cerner, and other major EHR systems
- **Smart Filtering**: Filter by event type, date range, provider, or search terms
- **PDF Export**: Generate reports for specialist visits
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **FHIR R4** - Healthcare data standard support
- **Pydantic** - Data validation and serialization
- **HTTPX** - Async HTTP client for FHIR connections

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive data visualization
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/medtimeline.git
cd medtimeline
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**
```bash
# In frontend directory
cp .env.example .env

# Edit .env with your configuration
VITE_API_URL=http://localhost:8000/api
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

3. **Open your browser**
Navigate to `http://localhost:3000`

The application will load with demo patient data. You can explore the timeline, lab trends, and medications without any external connections.

## FHIR Integration

MedTimeline supports connecting to external FHIR servers using the SMART on FHIR protocol.

### Supported EHR Systems
- Epic (MyChart)
- Cerner
- Allscripts
- Any FHIR R4 compliant system

### Connecting to a FHIR Server

1. Obtain OAuth 2.0 credentials from your healthcare provider
2. Use the FHIR connect endpoint:

```bash
curl -X POST http://localhost:8000/api/fhir/connect \
  -H "Content-Type: application/json" \
  -d '{
    "fhir_url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
    "access_token": "your_access_token"
  }'
```

### FHIR Resources Supported

| Resource Type | Description |
|--------------|-------------|
| `Patient` | Demographics and identifiers |
| `Condition` | Diagnoses and problems |
| `MedicationRequest` | Prescribed medications |
| `Observation` | Lab results and vital signs |
| `Encounter` | Visits and appointments |
| `Procedure` | Medical procedures |
| `DiagnosticReport` | Lab reports |
| `AllergyIntolerance` | Allergies and intolerances |

## API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

```
GET  /api/patient/profile          # Patient demographics
GET  /api/timeline                  # All timeline events
GET  /api/timeline/summary          # Summary statistics
GET  /api/trends/{lab_code}         # Lab trend data
GET  /api/medications               # Medication list
POST /api/fhir/connect              # Connect to FHIR server
GET  /api/export/pdf                # Export timeline to PDF
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React         │────▶│   FastAPI        │────▶│   FHIR Server   │
│   Frontend      │◄────│   Backend        │◄────│   (Epic/Cerner) │
│   (Port 3000)   │     │   (Port 8000)    │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│   Recharts      │     │   FHIRClient     │
│   Timeline Viz  │     │   Transformer    │
└─────────────────┘     └──────────────────┘
```

## Revenue Models

### B2C Subscription ($9.99/month)
- Individual patients managing chronic conditions
- Caregivers coordinating care for family members
- Health-conscious consumers tracking wellness

### B2B2C Partnerships
- **Employers**: Wellness program add-on (~$3-5/employee/month)
- **Health Systems**: Patient portal enhancement
- **Medicare Advantage**: Quality measure improvement ($30/member/year)
- **TPAs**: Claims data enrichment

## Compliance

MedTimeline is designed with healthcare compliance in mind:

- **HIPAA**: Patient-directed access reduces provider liability
- **21st Century Cures Act**: Supports information blocking compliance
- **FHIR R4**: Industry standard for healthcare data exchange
- **OAuth 2.0 / SMART**: Secure authentication

## Roadmap

### Phase 1 (MVP) ✓
- [x] Basic timeline view
- [x] Demo patient data
- [x] Lab trends chart
- [x] Medication tracking

### Phase 2 (Beta)
- [ ] Real FHIR server connections
- [ ] SMART on FHIR launch
- [ ] PDF export functionality
- [ ] Mobile app (React Native)

### Phase 3 (Production)
- [ ] Multi-provider aggregation
- [ ] Caregiver accounts
- [ ] Appointment scheduling
- [ ] Insurance claims integration

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Documentation: [docs.medtimeline.io](https://docs.medtimeline.io)
- Issues: [GitHub Issues](https://github.com/yourusername/medtimeline/issues)
- Email: support@medtimeline.io

---

Built with ❤️ for patients who deserve to own their health data.
