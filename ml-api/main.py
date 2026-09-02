"""
AquaMitra ML Microservice
=========================
Rule-based aquaculture pond health risk prediction.

Designed to be API-compatible with the Node.js backend defined in:
  - src/services/ml.service.js   (HTTP client contract)
  - src/controllers/ml.controller.js  (response field usage)

Endpoints
---------
  GET  /health   -- liveness probe consumed by checkMlServiceHealth()
  POST /predict  -- risk prediction consumed by predictPondHealth()

Response contract for POST /predict (must match ml.service.js JSDoc):
  {
    "risk_level":      "LOW" | "MODERATE" | "HIGH",
    "confidence":      0.0 - 1.0,
    "message":         "Human-readable summary",
    "risk_score":      0 - 100,
    "parameter_flags": { ... },
    "recommendations": [ ... ]
  }
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

# ---------------------------------------------------------------------------
# App bootstrap
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AquaMitra ML Service",
    description="Rule-based pond health risk prediction for shrimp/prawn aquaculture.",
    version="1.0.0",
)

# Allow requests from the Node.js backend (localhost:5000) and the
# React frontend (localhost:5173). In production, restrict this list.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    """
    Matches the body that ml.service.js sends to POST /predict.

    Node validation rules (from ml.routes.js):
      temperature      optional, float, 0-50
      ph               optional, float, 0-14
      dissolved_oxygen optional, float, >= 0
      salinity         optional, float, >= 0
      ammonia          optional, float, >= 0
      pond_id          optional, UUID string (informational only)
    """

    pond_id: Optional[str] = Field(None, description="UUID of the pond (informational only)")
    temperature: Optional[float] = Field(None, ge=0, le=50, description="Water temperature in C")
    ph: Optional[float] = Field(None, ge=0, le=14, description="pH value")
    dissolved_oxygen: Optional[float] = Field(None, ge=0, description="Dissolved oxygen in mg/L")
    salinity: Optional[float] = Field(None, ge=0, description="Salinity in ppt")
    ammonia: Optional[float] = Field(None, ge=0, description="Total ammonia nitrogen in mg/L")

    @model_validator(mode="after")
    def at_least_one_parameter(self) -> "PredictRequest":
        params = [self.temperature, self.ph, self.dissolved_oxygen, self.salinity, self.ammonia]
        if all(p is None for p in params):
            raise ValueError(
                "At least one water quality parameter (temperature, ph, dissolved_oxygen, "
                "salinity, or ammonia) must be provided."
            )
        return self


class ParameterFlags(BaseModel):
    temperature: str = "ok"
    ph: str = "ok"
    dissolved_oxygen: str = "ok"
    salinity: str = "ok"
    ammonia: str = "ok"


class PredictResponse(BaseModel):
    """
    Response consumed by ml.service.js -> predictPondHealth().

    Required fields (read by ml.controller.js):
      risk_level  -- "LOW" | "MODERATE" | "HIGH"
      confidence  -- float 0.0-1.0
      message     -- human-readable summary

    Extra fields forwarded to frontend inside prediction{}:
      risk_score, parameter_flags, recommendations
    """

    risk_level: str
    confidence: float
    message: str
    risk_score: float
    parameter_flags: ParameterFlags
    recommendations: list[str]


# ---------------------------------------------------------------------------
# Aquaculture domain knowledge - ideal ranges for Pacific white shrimp (L. vannamei)
# ---------------------------------------------------------------------------

# Each tuple: (optimal_low, optimal_high, critical_low, critical_high)
PARAM_RANGES: dict[str, tuple[float, float, float, float]] = {
    "temperature":      (26.0, 30.0, 22.0, 34.0),  # C
    "ph":               (7.5,   8.5,  6.5,  9.0),  # pH units
    "dissolved_oxygen": (5.0,  12.0,  3.0, 14.0),  # mg/L
    "salinity":         (10.0, 25.0,  5.0, 35.0),  # ppt
    "ammonia":          (0.0,   0.1,  0.0,  0.5),  # mg/L (lower is better)
}

RECOMMENDATIONS: dict[tuple[str, str], str] = {
    ("temperature", "low"):           "Water temperature is below optimal. Consider reducing aeration or adding a cover to retain heat.",
    ("temperature", "high"):          "Water temperature is too high. Increase aeration and consider shading or water exchange.",
    ("temperature", "critical_low"):  "CRITICAL: Temperature is dangerously low. Shrimp may become lethargic. Immediate intervention required.",
    ("temperature", "critical_high"): "CRITICAL: Temperature is dangerously high. Risk of mass mortality. Perform emergency water exchange.",
    ("ph", "low"):                    "pH is below optimal. Add lime (CaCO3) cautiously to raise pH and stabilise alkalinity.",
    ("ph", "high"):                   "pH is above optimal. Check for algae blooms which consume CO2. Manage phytoplankton density.",
    ("ph", "critical_low"):           "CRITICAL: pH is dangerously acidic. Shrimp are under severe stress. Apply limestone immediately.",
    ("ph", "critical_high"):          "CRITICAL: pH is dangerously alkaline. Severe algal bloom likely. Reduce fertilisation and increase water exchange.",
    ("dissolved_oxygen", "low"):      "Dissolved oxygen is below optimal. Increase aeration, reduce stocking density, or limit feeding temporarily.",
    ("dissolved_oxygen", "critical_low"): "CRITICAL: Dissolved oxygen is critically low. Risk of mass mortality. Activate emergency aerators immediately.",
    ("salinity", "low"):              "Salinity is below optimal range for L. vannamei. Monitor for osmoregulation stress.",
    ("salinity", "high"):             "Salinity is above optimal range. Dilute with freshwater if possible.",
    ("salinity", "critical_low"):     "CRITICAL: Salinity is dangerously low. Perform controlled saline water addition.",
    ("salinity", "critical_high"):    "CRITICAL: Salinity is dangerously high. Immediate freshwater dilution required.",
    ("ammonia", "high"):              "Ammonia is above safe threshold. Reduce feeding rate, perform partial water exchange, and check for dead organisms.",
    ("ammonia", "critical_high"):     "CRITICAL: Ammonia is at toxic levels. Stop feeding immediately, perform emergency water exchange, and apply zeolite.",
}


# ---------------------------------------------------------------------------
# Rule-based prediction engine
# ---------------------------------------------------------------------------

def _classify_parameter(name: str, value: float) -> str:
    """Returns: 'ok' | 'low' | 'high' | 'critical_low' | 'critical_high'"""
    opt_low, opt_high, crit_low, crit_high = PARAM_RANGES[name]

    if name == "ammonia":  # only upper thresholds matter
        if value <= opt_high:
            return "ok"
        if value <= crit_high:
            return "high"
        return "critical_high"

    if value < crit_low:
        return "critical_low"
    if value > crit_high:
        return "critical_high"
    if value < opt_low:
        return "low"
    if value > opt_high:
        return "high"
    return "ok"


def _parameter_penalty(flag: str) -> float:
    """Maps a flag to a risk-score contribution (per parameter, 0-100 scale)."""
    return {
        "ok":            0.0,
        "low":          15.0,
        "high":         15.0,
        "critical_low":  45.0,
        "critical_high": 45.0,
    }.get(flag, 0.0)


def run_prediction(req: PredictRequest) -> PredictResponse:
    params = {
        "temperature":      req.temperature,
        "ph":               req.ph,
        "dissolved_oxygen": req.dissolved_oxygen,
        "salinity":         req.salinity,
        "ammonia":          req.ammonia,
    }

    flags: dict[str, str] = {}
    supplied_count = 0
    total_penalty = 0.0

    for name, value in params.items():
        if value is None:
            flags[name] = "ok"  # unknown -> assume ok to avoid false alarms
            continue
        supplied_count += 1
        flag = _classify_parameter(name, value)
        flags[name] = flag
        total_penalty += _parameter_penalty(flag)

    # Normalise: maximum possible penalty = 5 params x 45 = 225
    max_penalty = len(params) * 45.0
    risk_score = round(min((total_penalty / max_penalty) * 100.0, 100.0), 1) if max_penalty > 0 else 0.0

    if risk_score < 20:
        risk_level = "LOW"
    elif risk_score < 50:
        risk_level = "MODERATE"
    else:
        risk_level = "HIGH"

    # Confidence increases with more parameters supplied and clear deviations
    param_coverage = supplied_count / len(params)
    borderline_penalty = 0.0
    for name, value in params.items():
        if value is None:
            continue
        opt_low, opt_high, crit_low, crit_high = PARAM_RANGES[name]
        span = crit_high - crit_low if crit_high != crit_low else 1.0
        min_dist = min(abs(value - opt_low), abs(value - opt_high)) / span
        if min_dist < 0.05:
            borderline_penalty += 0.05

    confidence = round(max(0.50, min(0.60 + (param_coverage * 0.35) - borderline_penalty, 0.98)), 2)

    recommendations: list[str] = []
    for name, flag in flags.items():
        rec = RECOMMENDATIONS.get((name, flag))
        if rec:
            recommendations.append(rec)

    if not recommendations:
        recommendations.append("All measured parameters are within healthy ranges. Maintain current management practices.")

    messages = {
        "LOW":      "Pond conditions are healthy. Continue current management practices.",
        "MODERATE": "Some parameters are outside ideal ranges. Monitor closely and consider corrective action.",
        "HIGH":     "Pond is at high risk! Immediate corrective action is strongly recommended.",
    }

    return PredictResponse(
        risk_level=risk_level,
        confidence=confidence,
        message=messages[risk_level],
        risk_score=risk_score,
        parameter_flags=ParameterFlags(**flags),
        recommendations=recommendations,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", summary="Liveness probe")
def health():
    """
    Called by the Node.js checkMlServiceHealth() in ml.service.js.
    The entire response is stored as result.status and forwarded to the
    frontend as the 'details' field inside GET /api/ml/health.
    """
    return {
        "status": "ok",
        "service": "AquaMitra ML Service",
        "version": "1.0.0",
        "model": "rule-based-v1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/predict", response_model=PredictResponse, summary="Pond health risk prediction")
def predict(req: PredictRequest):
    """
    Called by predictPondHealth() in ml.service.js.

    The Node.js ml.controller.js reads:
      - risk_level  -> saved to DB as "LOW RISK" / "MODERATE RISK" / "HIGH RISK"
      - confidence  -> saved to DB
      - message     -> shown to user (Node has a fallback if this is absent)
    All other fields are forwarded to the frontend inside prediction{}.
    """
    try:
        return run_prediction(req)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction engine error: {exc}") from exc
