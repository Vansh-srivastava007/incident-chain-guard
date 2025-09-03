# Blockchain Tourist Incident Management System - Demo Prototype

A minimal, demo-ready prototype showcasing end-to-end incident reporting, emergency response coordination, and blockchain evidence anchoring for tourist safety.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:8080`

### Demo Script (45 seconds)

Follow these steps for a complete demonstration:

1. **Landing Page**: Start at `/` - Review the system overview and value proposition
2. **Report Incident**: Click "Start Demo - Report Incident" 
   - Fill out incident form (theft/medical/etc.)
   - Set severity level with slider
   - Click "Capture Location" (uses demo coordinates)
   - Upload a test image (generates SHA-256 hash)
   - Click "Preview Report" then "Submit & Anchor (Mock)"
3. **Operations Dashboard**: Navigate to `/dashboard`
   - View incident on interactive map with severity-coded pins
   - Click incident pin to see popup details
   - Select incident from left panel for full details
4. **Emergency Response**: In right panel
   - Click "Call Police (Mock)" to simulate PSTN integration
   - Click "Call Hospital (Mock)" to test emergency services
   - Click "Acknowledge" to update incident status
5. **Blockchain Anchoring**: 
   - Click "Anchor Evidence (Mock)" to simulate blockchain anchoring
   - Watch status change from "Not Anchored" → "Anchoring..." → "Anchored"
   - Click "Verify Hash" to simulate evidence integrity check
   - Click "Explorer" to see mock blockchain transaction

## 🎯 Architecture Overview

### Pages & Components
- **Landing Page** (`/`): System overview, value proposition, demo instructions
- **Report Incident** (`/report`): Mobile-first incident reporting form with file upload
- **Operations Dashboard** (`/dashboard`): Desktop incident management with map and response tools

### Key Features
- ✅ **Real-time incident mapping** with OpenStreetMap (no API key required)
- ✅ **Client-side file hashing** using SHA-256 for evidence integrity
- ✅ **Mock emergency integrations** (Twilio PSTN simulation)
- ✅ **Mock blockchain anchoring** (Polygon simulation with fake TX IDs)
- ✅ **Complete audit trail** for all incident lifecycle events
- ✅ **Severity-based incident prioritization**
- ✅ **Evidence privacy controls** (blur/unblur functionality)

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap tiles)
- **Storage**: Client-side localStorage (demo purposes)
- **Crypto**: Web Crypto API for SHA-256 hashing
- **Routing**: React Router
- **UI**: shadcn/ui components with custom design system

## 🔧 Mock Integrations

**All external services are mocked for demo purposes:**

### PSTN/Twilio Integration (Mock)
```javascript
// Replace with real Twilio integration
const makeEmergencyCall = async (phoneNumber, incidentId) => {
  const call = await twilio.calls.create({
    twiml: '<Response><Say>Emergency call for incident ' + incidentId + '</Say></Response>',
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER
  });
  return call.sid;
};
```

### Blockchain Anchoring (Mock)
```javascript
// Replace with real Polygon integration
const anchorToBlockchain = async (evidenceHash) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const tx = await contract.anchorEvidence(evidenceHash, {
    gasLimit: 100000
  });
  return tx.hash;
};
```

### File Storage (Mock)
```javascript
// Replace with MinIO or AWS S3
const uploadEvidence = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

## 🔍 5-Step Judge Checklist

1. **System Overview**: Navigate landing page, read value proposition
2. **Incident Reporting**: Create new incident with file upload, observe hash generation
3. **Map Visualization**: View incident on interactive map with severity indicators
4. **Emergency Response**: Test mock emergency calling and status updates
5. **Evidence Integrity**: Demonstrate blockchain anchoring and hash verification

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── IncidentMap.tsx     # Leaflet map with incident pins
│   └── StatusBadge.tsx     # Custom status indicators
├── pages/
│   ├── Landing.tsx         # System overview and demo instructions
│   ├── ReportIncident.tsx  # Mobile-first incident reporting
│   └── OpsDashboard.tsx    # Desktop operations management
├── types/
│   └── incident.ts         # TypeScript type definitions
├── utils/
│   ├── store.ts           # localStorage incident management
│   └── crypto.ts          # Client-side hashing utilities
└── index.css              # Design system with semantic tokens
```

## 🌐 Production Deployment

For production deployment, replace mocks with real integrations:

1. **Twilio Account**: Set up PSTN calling capabilities
2. **Polygon Node**: Deploy smart contract for evidence anchoring
3. **Object Storage**: Configure MinIO or AWS S3 for file storage
4. **Database**: Replace localStorage with PostgreSQL/MongoDB
5. **Authentication**: Implement proper admin authentication

## 🔒 Security Notes

- All file hashing happens client-side using Web Crypto API
- Mock integrations clearly marked with "MOCK" badges
- Evidence preview includes privacy controls (blur/unblur)
- Incident data persists in localStorage for demo purposes only

## 🎨 Design System

Custom design system optimized for emergency response:
- **Primary Colors**: Professional blue for authority and trust
- **Alert Colors**: Severity-based color coding (green/yellow/orange/red)
- **Status Indicators**: Clear visual feedback for all system states
- **Typography**: Clean, readable fonts optimized for crisis situations

## 💾 Export Ready

This codebase is designed for easy export and deployment:
- No external API dependencies (all mocked)
- Minimal bundle size with tree-shaking
- Clear separation between demo and production code
- Comprehensive documentation for integration

---

**Demo Budget**: Optimized for minimal credits - uses client-side mocks instead of real API calls while demonstrating full functionality.

**Performance**: Initial load under 3s on typical laptop, mobile-responsive design.

**Compatibility**: Modern browsers with Web Crypto API support required for file hashing.
