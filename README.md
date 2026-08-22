# MindMitra
## AI-Powered Cognitive Gaming & Memory Assistance Platform for Elderly Users

> **"Your AI-powered cognitive companion."**

MindMitra observes HOW an elderly user interacts with cognitive games, learns their individual behavioral patterns, dynamically adapts difficulty, tracks longitudinal changes against the user's own baseline, and converts structured observations into understandable caregiver-facing explanations.

> ⚠️ **Disclaimer**: MindMitra is a prototype for AI-assisted cognitive engagement and caregiver support — NOT a medical diagnostic system. All insights are behavioral observations, not medical diagnoses.

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 2. ML Pipeline
```bash
cd ml
python synthetic_data.py --samples 5000
python train.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the App
Navigate to http://localhost:3000

---

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   React + Vite  │────▶│   FastAPI     │────▶│   SQLite     │
│   TypeScript    │     │   Python      │     │   Local DB   │
│   Tailwind CSS  │     │              │     └──────────────┘
│   Recharts      │     │   Gemini API  │
└─────────────────┘     │   ML Model   │
                        └──────────────┘
```

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for analytics
- Offline-first with IndexedDB/localStorage

### Backend
- Python FastAPI + SQLite
- RESTful API endpoints
- Gemini API integration (with template fallback)

### ML Pipeline
- scikit-learn RandomForestClassifier
- Synthetic gameplay data (5000+ samples)
- 90% accuracy on prototype evaluation
- Deterministic fallback rules

---

## Features

### P0 — Core
1. ✅ Elderly-friendly UI (large buttons, high contrast, calm design)
2. ✅ Three cognitive games (Memory Match, Daily Routine, Object Recognition)
3. ✅ Gameplay telemetry capture
4. ✅ Adaptive difficulty engine (ML + fallback)
5. ✅ Personal baseline tracking
6. ✅ Longitudinal trends
7. ✅ Caregiver dashboard
8. ✅ Explainable insights
9. ✅ Gemini explanation layer
10. ✅ Offline-first persistence

### P1 — Important
11. ✅ Voice interaction (Web Speech API)
12. ✅ English + Hindi
13. ✅ Reminders (medication, hydration, appointments)
14. ✅ Demo mode
15. ✅ Polished charts & UX

---

## Datasets

### Primary: MindMitra Gameplay Dataset
- Synthetic gameplay data for adaptive difficulty model training
- Generated via `ml/synthetic_data.py`
- NOT a clinical dataset

### Reference Datasets (if present)
1. Alzheimer's Disease Dataset (~2,149 records)
2. Dementia Dataset (~373 records)
3. Cognitive Impairment Dataset (~1,200+ records)

> These datasets are used for research/reference only and are NOT used to claim clinical diagnosis or validation.

---

## Demo Mode

Navigate to `/demo` to run the complete demonstration scenario:
1. Seed demo data with historical sessions
2. View stable and changing performance patterns
3. Play cognitive games with adaptive difficulty
4. View caregiver dashboard with trends
5. See AI-generated explanations
6. Test offline/sync functionality

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for caregiver explanations |

---

## Ethical & Medical Disclaimer

MindMitra is a **prototype** for AI-assisted cognitive engagement and caregiver support. It is NOT a medical diagnostic system.

- ❌ Does NOT diagnose dementia, Alzheimer's, or any medical condition
- ❌ Does NOT provide clinically validated cognitive decline detection
- ❌ Does NOT offer medical risk predictions
- ✅ Provides cognitive engagement activities
- ✅ Tracks behavioral performance against personal baselines
- ✅ Offers caregiver-friendly explanations of observed changes
- ✅ Recommends consulting healthcare professionals for persistent concerns

---

## License
Hackathon prototype — not for clinical use.
>>>>>>> 0448a1d (feat: complete MindMitra cognitive gaming platform with ML adaptive difficulty, caregiver isolation, and longitudinal behavioral tracking)
