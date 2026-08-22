# MindMitra (माइंडमित्र / మైండ్‌మిత్ర)
### AI-Powered Cognitive Gaming, Adaptive Behavioral Tracking & Memory Assistance Platform for Elderly Users

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4.0-F7931E.svg?logo=scikit-learn)](https://scikit-learn.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-30%20Passed-brightgreen.svg)](https://pytest.org)

> **"An AI companion for cognitive wellbeing."**

MindMitra is an AI/ML-assisted cognitive wellness and memory companion designed specifically for older adults and their caregivers. By combining dignified, accessible games with continuous telemetry capture, MindMitra observes *how* a user interacts with daily cognitive tasks, personalizes difficulty dynamically, monitors longitudinal baseline deviations across distinct cognitive domains, and provides caregivers with transparent, plain-language insights.

---

## 🌟 Key Highlights & Innovations

1. **Four Evidence-Informed Cognitive Activities**:
   - **Memory Match**: Working memory & visual recall using celestial and familiar symbols.
   - **Daily Routine Recall**: Sequential reasoning & episodic ordering of morning/evening rituals.
   - **Object & Familiar Recognition**: Visual categorization and caregiver-uploaded family photo recognition with strict consent.
   - **Pattern Recall**: Spatial pattern recall and sustained attention.
2. **Real-Time Machine Learning Adaptive Engine**:
   - Trained `RandomForestClassifier` (90.1% accuracy) that dynamically adapts game difficulty (`Level 1–5`) based on latency, error recurrence, and accuracy.
3. **Longitudinal Behavioral Baseline Calibration**:
   - Calculates rolling 5–10 session personal baselines to track individual variance over time without relying on population averages.
4. **3-Tier Explainable AI (XAI) System**:
   - **Tier 1**: Google Gemini 2.0 Flash (Primary explanation model).
   - **Tier 2**: NVIDIA Nemotron-3 Super 70B via OpenRouter (Cloud fallback).
   - **Tier 3**: Deterministic Rule-Based Engine (Zero-network fallback).
5. **Multilingual & Native Voice Interface**:
   - Full localized UI and Text-to-Speech (TTS) support for **English (`en-IN`)**, **Hindi (`hi-IN`)**, and **Telugu (`te-IN`)** with server-side cloud speech fallback.
6. **Multi-Caregiver Account Hierarchy & Complete Profile Data Isolation**:
   - Secure caregiver authentication (PBKDF2 password hashing, JWT authorization) with isolated elderly profiles, independent sessions, photo galleries, and reminders.
7. **Offline-First & PWA Resilience**:
   - Full local gameplay capability via IndexedDB/localStorage telemetry queue, synchronizing seamlessly upon reconnection.

---

## 🔄 The MindMitra Cognitive Wellness Loop

```
  ┌─────────────────────────────────────────────────────────────┐
  │                            PLAY                             │
  │     Dignified, high-contrast, elderly-friendly games        │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                           OBSERVE                           │
  │     Captures response latency, errors, and corrections      │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                            LEARN                            │
  │     RandomForest classifier evaluates behavioral signals    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                            ADAPT                            │
  │     Calibrates difficulty level (Decrease/Maintain/Increase)│
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                            TRACK                            │
  │     Compares against 5-10 session rolling personal baseline │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                           EXPLAIN                           │
  │     Gemini / Nemotron synthesize non-clinical summaries     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                           SUPPORT                           │
  │     Assists caregivers with reminders & family memory cues  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
                                    CLIENT LAYER
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Recharts     │
  │  - Elderly Touch Interface (Large targets ≥ 48px, high contrast, warm theme) │
  │  - Multilingual Translation Provider (English, Hindi, Telugu)                │
  │  - Web Speech API + Cloud Voice Fallback                                     │
  │  - Offline Storage & Telemetry Queue (IndexedDB / LocalStorage)              │
  └──────────────────────────────────────┬───────────────────────────────────────┘
                                         │ HTTPS / REST JSON
                                         ▼
                                   BACKEND LAYER
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  FastAPI (Python 3.10+)                                                      │
  │  ├── Auth & Profile Isolation: PBKDF2 Hashing + JWT Token Verification       │
  │  ├── Session Orchestration: Multi-activity game state manager                │
  │  ├── Adaptive ML Engine: Scikit-Learn RandomForest Pipeline (model.pkl)      │
  │  ├── Longitudinal Trend Engine: Personal baseline calculation & deviation    │
  │  └── Explainability Gateway: Gemini 2.0 Flash / Nemotron / Guardrail Rules   │
  └──────────────────┬────────────────────────────────────────┬──────────────────┘
                     │                                        │
                     ▼                                        ▼
             DATA PERSISTENCE                         EXTERNAL SERVICES
  ┌────────────────────────────────────┐   ┌─────────────────────────────────────┐
  │ SQLite / PostgreSQL Local DB       │   │ Google Gemini 2.0 Flash API         │
  │ ├── caregivers                     │   │ OpenRouter Nemotron-3 Super API     │
  │ ├── elderly_profiles               │   │ Web Speech Synthesis Audio Engine   │
  │ ├── sessions & game_sessions       │   └─────────────────────────────────────┘
  │ ├── game_events & telemetry        │
  │ ├── adaptive_decisions             │
  │ ├── familiar_people & reminders    │
  │ └── sync_queue                     │
  └────────────────────────────────────┘
```

---

## 🧠 Cognitive Activities & Telemetry Collection

| Activity | Cognitive Domain | Target Metrics Collected | Cold-Start Default |
|---|---|---|---|
| **Memory Match** | Working & Short-Term Memory | Flip count, match latency, repeat mistakes, pair completion time | Level 1 (3 pairs) |
| **Daily Routine Recall** | Sequential Reasoning & Episodic Memory | Reordering accuracy, drag/touch correction rate, step latency | Level 1 (3 steps) |
| **Object Recognition** | Visual & Semantic Processing | Object identification speed, distractor discrimination | Level 1 (3 choices) |
| **Familiar Person Recognition** | Facial Recognition & Personal Memory | Name identification of caregiver-uploaded photos (requires consent) | Optional (3+ photos) |
| **Pattern Recall** | Pattern Recognition & Sustained Attention | Matrix recall accuracy, pattern observation time, response latency | Level 1 (3 symbols) |

---

## 🤖 Machine Learning Pipeline (`ml/`)

The adaptive difficulty system uses a supervised **Random Forest Classifier** trained on gameplay telemetry data to prevent cognitive fatigue and maintain optimal engagement.

```
[ Gameplay Telemetry ] ──▶ [ Feature Extraction ] ──▶ [ RandomForestClassifier ] ──▶ [ Difficulty Decision ]
- accuracy                  - Normalization            - 100 Estimators              - DECREASE (0)
- response_time_ms          - Outlier Clipping         - Max Depth: 8                - MAINTAIN (1)
- repeat_error_rate         - Trend Vectorization      - 90.1% Validation Acc        - INCREASE (2)
```

- **Features Used**: `accuracy`, `mean_response_time_ms`, `response_time_variance`, `repeat_error_rate`, `correction_rate`, `completion_time_ms`, `current_difficulty`, `previous_session_accuracy`, `recent_trend`.
- **Training Artifacts**:
  - Dataset: `ml/data/synthetic_gameplay.csv` (5,000+ telemetry rows).
  - Serialized Model: `ml/model.pkl`.
  - Model Metadata: `ml/model_metadata.json`.

---

## 🛡️ Caregiver Account Hierarchy & Data Isolation

```
                              CAREGIVER ACCOUNT
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
        ELDERLY PROFILE A                       ELDERLY PROFILE B
        ├── Game Sessions                       ├── Game Sessions
        ├── Personal Baselines                  ├── Personal Baselines
        ├── Adaptive History                    ├── Adaptive History
        ├── Familiar People Photos              ├── Familiar People Photos
        └── Daily Reminders                     └── Daily Reminders
```

- **Zero Global Leakage**: Profiles belong strictly to their authenticated caregiver account (`caregiver_id`).
- **Sub-Resource Ownership Guard**: Endpoints (`/api/analytics/trends`, `/api/familiar-people`, `/api/reminders`) strictly enforce ownership with `HTTP 403 Forbidden` checks against cross-caregiver access.
- **Cascading Lifecycle Management**: Archiving or deleting a senior profile permanently cleans up associated telemetry, adaptive decisions, reminders, and family photos.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & **npm**

---

### 1. Clone Repository
```bash
git clone https://github.com/pavankarthikeyaatchyuta-lab/MindMitra.git
cd MindMitra
```

---

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Set GEMINI_API_KEY (optional: OPENROUTER_API_KEY) in backend/.env

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be accessible at: **http://127.0.0.1:8000/docs**

---

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
Application interface will be accessible at: **http://localhost:3000**

---

### 4. Run Automated Test Suite
```bash
cd ../backend
python -m pytest test_session_and_games_launch.py test_multi_caregiver_isolation_verification.py test_caregiver_isolation.py test_trend_engine.py test_backend.py -v
```
*(All 30 unit, integration, and security isolation tests run in under 3 seconds)*.

---

## 📡 Core API Endpoints

### 🔐 Authentication & Profiles
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new caregiver account |
| `POST` | `/api/auth/login` | Login caregiver & issue JWT bearer token |
| `GET` | `/api/profiles` | List elderly profiles for authenticated caregiver |
| `POST` | `/api/profiles` | Create new elderly profile |
| `PUT` | `/api/profiles/{id}` | Update elderly profile |
| `POST` | `/api/profiles/{id}/archive` | Archive elderly profile |
| `DELETE` | `/api/profiles/{id}` | Permanently delete profile & cascade data |

### 🎮 Sessions & Cognitive Games
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sessions/start` | Start daily cognitive session |
| `POST` | `/api/sessions/{id}/complete` | Complete session & trigger analytics |
| `POST` | `/api/games/session/start` | Start specific game session |
| `POST` | `/api/games/session/{id}/complete` | Record game metrics & telemetry |
| `POST` | `/api/adaptive/recommend` | Request ML adaptive difficulty recommendation |

### 📊 Analytics, Trends & Explainability
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/trends/{user_id}` | Compute domain-level baseline deviations |
| `GET` | `/api/analytics/overall-trend/{user_id}` | Calculate overall multi-session status |
| `POST` | `/api/explain/insight` | Generate 3-tier caregiver insight explanation |
| `GET` | `/api/explain/insights/{user_id}` | Retrieve all explainable insights for a profile |

### 👨‍👩‍👧 Familiar People & Reminders
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/familiar-people/{user_id}` | List caregiver-uploaded family members |
| `POST` | `/api/familiar-people` | Add family member with consent confirmation |
| `GET` | `/api/reminders/{user_id}` | List profile medication & daily reminders |
| `POST` | `/api/reminders` | Create recurring reminder |

---

## ⚖️ Ethical & Medical Guardrails

MindMitra is strictly an **assistive cognitive engagement and behavioral observation prototype** — **NOT** a clinical diagnostic system.

- 🚫 **Never Diagnoses**: Does not claim to detect, diagnose, or treat dementia, Alzheimer's, or clinical cognitive decline.
- 🚫 **No Invented Clinical Numbers**: All trend observations are based strictly on recorded gameplay telemetry.
- 🛡️ **Medical Disclaimer**: Every AI-generated summary, caregiver screen, and export contains the explicit disclaimer:
  > *"Prototype behavioral insight — not a medical diagnosis. Cognitive engagement metrics track activity variance. Always consult a qualified healthcare professional for persistent health concerns."*
- 🔒 **Data Privacy & Consent**: Familiar person photos require explicit caregiver consent and are never shared with third-party LLM providers.

---

## 👥 Contributors & Hackathon Prototype
- **Team MindMitra**: Developed for elderly wellbeing, dignified aging, and caregiver peace of mind.
- **Repository**: [https://github.com/pavankarthikeyaatchyuta-lab/MindMitra](https://github.com/pavankarthikeyaatchyuta-lab/MindMitra)
