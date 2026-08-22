# MindMitra (माइंडमित्र / మైండ్‌మిత్ర) 🧠✨
### AI-Powered Cognitive Gaming, Adaptive Behavioral Tracking & Memory Assistance Platform for Elderly Users

<p align="center">
  <a href="https://mind-mitra-sigma.vercel.app/">
    <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-mind--mitra--sigma.vercel.app-blueviolet?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo on Vercel" />
  </a>
  <a href="https://github.com/pavankarthikeyaatchyuta-lab/MindMitra">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" />
  </a>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Production Status" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Scikit--Learn-1.4.0-F7931E.svg?logo=scikit-learn&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_2.0_Flash-Explainable_AI-8E75B2.svg?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg?logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-33%20Passed-brightgreen.svg" />
</p>

---

> 🌐 **Live Web Application**: [https://mind-mitra-sigma.vercel.app/](https://mind-mitra-sigma.vercel.app/)  
> 💬 **Tagline**: *"An AI companion for cognitive wellbeing."*

MindMitra is an AI/ML-assisted cognitive wellness and memory companion designed specifically for older adults and their caregivers. By combining dignified, accessible games with continuous telemetry capture, MindMitra observes *how* a user interacts with daily cognitive tasks, personalizes difficulty dynamically, monitors longitudinal baseline deviations across distinct cognitive domains, and provides caregivers with transparent, plain-language insights.

---

## 📸 Interactive System Previews & Visual Design

### 🎮 The 4 Cognitive Activities
```
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│        🧠 Activity 1: Memory Match    │   │     📋 Activity 2: Daily Routine      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │  [1. 🌅 Wake up in the morning]       │
│  │ ⭐  │ │ ❓  │ │ 🌙  │ │ ⭐  │      │   │  [2. 🪥 Brush teeth & wash hands]     │
│  └─────┘ └─────┘ └─────┘ └─────┘      │   │  [3. 🍳 Enjoy healthy breakfast]     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │  [4. 💊 Take prescribed morning meds] │
│  │ ❓  │ │ 🌙  │ │ 🌺  │ │ 🌺  │      │   │  ✓ Reorder daily tasks correctly      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │   │  ⏱️ Latency & Drag Corrections Logged │
│  Short-Term Working Memory stimulation│   │  Sequential Reasoning & Routine Recall│
└───────────────────────────────────────┘   └───────────────────────────────────────┘
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│     🔍 Activity 3: Object & Face Rec  │   │       ✨ Activity 4: Pattern Recall   │
│   "Which one is the Cup of Tea? ☕"   │   │  Memorize:  ★  ✦  ⬤  ▲                │
│                                       │   │  ───────────────────────────────────  │
│  ┌───────────┐     ┌───────────┐      │   │  Which pattern was displayed?         │
│  │   🍎      │     │   ☕ [✓]  │      │   │  [A] ★  ✦  ⬤  ▲   (Correct)           │
│  │  Apple    │     │  Tea Cup  │      │   │  [B] ★  ⬤  ✦  ▲   (Distractor)        │
│  └───────────┘     └───────────┘      │   │  [C] ◆  ✦  ⬤  ▲   (Distractor)        │
│  + Optional Family Photo Recognition  │   │  Constellation Pattern & Attention    │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

---

## 🌟 Key Highlights & Innovations

| Pillar | Features & Architecture |
|---|---|
| 🎮 **Elderly-First Gameplay** | Large touch targets ($\ge 56\text{px}$), high contrast, calm cosmic aesthetics, dignified phrasing, and no punishing timers. |
| 🤖 **Adaptive Machine Learning** | Supervised `RandomForestClassifier` running on gameplay telemetry that calibrates difficulty (`Level 1–5`) in real-time. |
| 📈 **Longitudinal Personal Baselines** | Rolling 5–10 session personal median baseline tracking to identify genuine behavioral variation without population bias. |
| 💡 **3-Tier Explainable AI (XAI)** | **Tier 1:** Gemini 2.0 Flash ➔ **Tier 2:** Nemotron-3 Super ➔ **Tier 3:** Deterministic rule engine with strict non-diagnostic guardrails. |
| 🗣️ **Multilingual Speech & Voice** | Native browser Web Speech + server-side audio fallback for **English (`en-IN`)**, **Hindi (`hi-IN`)**, and **Telugu (`te-IN`)**. |
| 🛡️ **Caregiver Multi-Profile Isolation** | Strict data isolation (PBKDF2 + JWT). One caregiver account can manage multiple elderly profiles independently. |
| 📶 **Offline-First Resilience** | IndexedDB / LocalStorage telemetry queues allow full offline gameplay with automatic sync upon reconnection. |

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
  │  - Web Speech API + Cloud Voice Fallback Engine                              │
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
  │ ├── sessions & game_sessions       │   │ Vercel Serverless Edge Runtime      │
  │ ├── game_events & telemetry        │   └─────────────────────────────────────┘
  │ ├── adaptive_decisions             │
  │ ├── familiar_people & reminders    │
  │ └── sync_queue                     │
  └────────────────────────────────────┘
```

---

## 🧠 Cognitive Activities & Telemetry Matrix

| Activity | Icon | Cognitive Domain | Telemetry Captured | Cold-Start Level |
|---|:---:|---|---|:---:|
| **Memory Match** | 🧠 | Working & Visual Recall | Flips, match latency, repeat card errors, pair completion time | Level 1 (3 pairs) |
| **Daily Routine** | 📋 | Sequential & Episodic Reasoning | Step order accuracy, sequence correction rate, step latency | Level 1 (3 steps) |
| **Object Recognition** | 🔍 | Visual & Semantic Categorization | Response speed, distractor discrimination, semantic confusion | Level 1 (3 options) |
| **Familiar Recognition**| 👨‍👩‍👧 | Facial Recognition & Personal Memory | Family photo recognition, name recall (caregiver consent secured) | Optional (3+ photos) |
| **Pattern Recall** | ✨ | Pattern Attention & Spatial Recall | Symbol pattern accuracy, observation time, response latency | Level 1 (3 symbols) |

---

## 🤖 Machine Learning Pipeline (`ml/`)

The adaptive difficulty system uses a supervised **Random Forest Classifier** trained on gameplay telemetry data to prevent cognitive fatigue and maintain optimal engagement.

```
[ Gameplay Telemetry ] ──▶ [ Feature Extraction ] ──▶ [ RandomForestClassifier ] ──▶ [ Difficulty Decision ]
- accuracy                  - Normalization            - 100 Estimators              - DECREASE (0)
- response_time_ms          - Outlier Clipping         - Max Depth: 8                - MAINTAIN (1)
- repeat_error_rate         - Trend Vectorization      - 90.1% Validation Acc        - INCREASE (2)
```

- **Features Extracted**: `accuracy`, `mean_response_time_ms`, `response_time_variance`, `repeat_error_rate`, `correction_rate`, `completion_time_ms`, `current_difficulty`, `previous_session_accuracy`, `recent_trend`.
- **Target Output**:
  - `DECREASE (0)`: Lowers difficulty to prevent cognitive fatigue or frustration.
  - `MAINTAIN (1)`: Keeps difficulty steady when performance matches expected range.
  - `INCREASE (2)`: Challenges the senior when high speed, low errors, and high accuracy are sustained.
- **Model Files**:
  - `ml/data/synthetic_gameplay.csv` (5,000+ realistic behavioral sessions).
  - `ml/model.pkl` (Trained model artifact).
  - `ml/model_metadata.json` (90.1% evaluation accuracy on test split).

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

- **Zero Cross-Profile Leakage**: Profile records belong strictly to the logged-in caregiver (`caregiver_id`).
- **Sub-Resource Authorization Guard**: Endpoints (`/api/analytics/trends`, `/api/familiar-people`, `/api/reminders`) strictly verify profile ownership with `HTTP 403 Forbidden` checks.
- **Cascading Lifecycle Cleanup**: Deleting a profile automatically cascades and cleans up all associated telemetry, historical sessions, adaptive logs, and reminders.

---

## 🚀 Quickstart Guide

### 1. Live Deployment (Instant Access)
Open **[https://mind-mitra-sigma.vercel.app/](https://mind-mitra-sigma.vercel.app/)** to explore the live application immediately.

---

### 2. Local Development Setup

#### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & **npm**

```bash
# Clone the repository
git clone https://github.com/pavankarthikeyaatchyuta-lab/MindMitra.git
cd MindMitra

# Backend Setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY in backend/.env
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend Setup (in a new terminal)
cd ../frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
- Open UI: **http://localhost:3000**
- API Documentation: **http://127.0.0.1:8000/docs**

---

### 3. Run Automated Test Suite
```bash
cd backend
python -m pytest -v
```
*(33 automated unit, integration, and security tests — all passing)*.

---

## 📡 Core API Endpoints

### 🔐 Authentication & Caregiver Hub
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

### 🛠️ Diagnostics & Database Health
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/debug/ping` | Service health check |
| `GET` | `/api/debug/auth-health` | Production DB connectivity & schema verification |
| `GET` | `/api/debug/db-init` | Trigger DB schema initialization |
| `GET` | `/api/debug/persistence` | Active database engine & profile persistence status |

---

## ⚖️ Ethical & Medical Guardrails

MindMitra is strictly an **assistive cognitive engagement and behavioral observation prototype** — **NOT** a clinical diagnostic system.

- 🚫 **Never Diagnoses**: Does not claim to detect, diagnose, or treat dementia, Alzheimer's, or clinical cognitive decline.
- 🚫 **No Invented Numbers**: Trend observations are derived directly from actual recorded gameplay telemetry.
- 🛡️ **Mandatory Medical Disclaimer**: Every AI-generated summary and caregiver report displays:
  > *"Prototype behavioral insight — not a medical diagnosis. Cognitive engagement metrics track activity variance. Always consult a qualified healthcare professional for persistent health concerns."*
- 🔒 **Data Privacy & Consent**: Family member photos require explicit caregiver consent and are never shared with external LLM models.

---

## 👥 Contributors
- **Team MindMitra**: Developed for elderly wellbeing, dignified aging, and caregiver peace of mind.
- **GitHub Repository**: [https://github.com/pavankarthikeyaatchyuta-lab/MindMitra](https://github.com/pavankarthikeyaatchyuta-lab/MindMitra)
- **Live Vercel Application**: [https://mind-mitra-sigma.vercel.app/](https://mind-mitra-sigma.vercel.app/)
