# AquaMitra ML Microservice

Rule-based aquaculture pond health risk prediction service for shrimp/prawn farming.
Built with **FastAPI** and designed to be fully compatible with the AquaMitra Node.js backend.

---

## Endpoints

| Method | Path       | Auth | Description                        |
|--------|-----------|------|------------------------------------|
| GET    | /health   | None | Liveness probe for the Node backend |
| POST   | /predict  | None | Pond health risk prediction         |
| GET    | /docs     | None | Interactive Swagger UI              |

---

## Setup (Windows — VS Code Terminal)

### 1. Open a NEW terminal inside the ml-api folder

`
cd ml-api
`

### 2. Create a virtual environment

`
python -m venv venv
`

### 3. Activate the virtual environment

`
venv\Scripts\activate
`

You will see (venv) at the start of your prompt.

### 4. Install dependencies

`
pip install -r requirements.txt
`

### 5. Run the service

`
uvicorn main:app --reload --host 0.0.0.0 --port 8000
`

The service will start at: **http://localhost:8000**

---

## Testing

### Test GET /health (liveness probe)

Open your browser or run in a new terminal:

`
curl http://localhost:8000/health
`

Expected response:
`json
{
  "status": "ok",
  "service": "AquaMitra ML Service",
  "version": "1.0.0",
  "model": "rule-based-v1",
  "timestamp": "2026-08-30T10:00:00+00:00"
}
`

### Test POST /predict

`
curl -X POST http://localhost:8000/predict 
  -H "Content-Type: application/json" 
  -d "{\"temperature\": 28, \"ph\": 7.5, \"dissolved_oxygen\": 6.2, \"salinity\": 15, \"ammonia\": 0.1}"
`

Expected response:
`json
{
  "risk_level": "LOW",
  "confidence": 0.95,
  "message": "Pond conditions are healthy. Continue current management practices.",
  "risk_score": 0.0,
  "parameter_flags": {
    "temperature": "ok",
    "ph": "ok",
    "dissolved_oxygen": "ok",
    "salinity": "ok",
    "ammonia": "ok"
  },
  "recommendations": [
    "All measured parameters are within healthy ranges. Maintain current management practices."
  ]
}
`

### Test the Node.js bridge endpoint (with Node backend running on port 5000)

`
curl http://localhost:5000/api/ml/health
`

Expected response when ML service is running:
`json
{
  "success": true,
  "data": {
    "mlService": "available",
    "details": {
      "status": "ok",
      "service": "AquaMitra ML Service",
      "version": "1.0.0",
      "model": "rule-based-v1",
      "timestamp": "..."
    }
  }
}
`

### Interactive Swagger UI

Open in browser: **http://localhost:8000/docs**

---

## Risk Level Logic

Parameters are evaluated against ideal ranges for *L. vannamei* (Pacific white shrimp):

| Parameter        | Optimal Range | Critical Low | Critical High |
|-----------------|---------------|-------------|---------------|
| Temperature     | 26 – 30 °C   | < 22 °C     | > 34 °C      |
| pH              | 7.5 – 8.5    | < 6.5       | > 9.0        |
| Dissolved O₂    | 5 – 12 mg/L  | < 3 mg/L    | > 14 mg/L   |
| Salinity        | 10 – 25 ppt  | < 5 ppt     | > 35 ppt    |
| Ammonia (TAN)   | 0 – 0.1 mg/L | —           | > 0.5 mg/L  |

**Risk score thresholds:**
- **LOW** — score < 20
- **MODERATE** — score 20–49
- **HIGH** — score >= 50

---

## Architecture

`
Frontend (React) --> Node.js Express (port 5000) --> FastAPI ML (port 8000)
                         |
                     Supabase DB
`

The Node.js backend calls this service via:
- GET  http://localhost:8000/health   (src/services/ml.service.js)
- POST http://localhost:8000/predict  (src/services/ml.service.js)
