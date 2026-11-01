# RiWA — Rewa Intelligence For Watch and Action

[![Smart Rewa 2030](https://img.shields.io/badge/Smart%20Rewa-2030%20Initiative-06B6D4?style=for-the-badge)](https://riwa-sable.vercel.app)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20%7C%20Embedding-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%206.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase & PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Next-Generation AI Civic Governance & Incident Intelligence Platform**  
> Fusing scattered citizen complaints into unified, explainable civic incidents to eliminate duplicate fatigue and accelerate municipal action across Rewa, Madhya Pradesh. Conceived and demonstrated for **iComputex Tech Fest 2026** under the **Smart Rewa 2030** roadmap.

---

## 📌 Table of Contents

- [Overview & The Problem Solved](#-overview--the-problem-solved)
- [Key Features](#-key-features)
- [How AI is Implemented in RiWA (Deep Dive)](#-how-ai-is-implemented-in-riwa-deep-dive)
  - [1. Multilingual Understanding (Hindi, Hinglish, English)](#1-multilingual-zero-shot-nlu-hindi-hinglish-english)
  - [2. Root-Cause-First Civic Classification](#2-root-cause-first-civic-classification)
  - [3. High-Dimensional Vector Embeddings & Centroid Clustering](#3-high-dimensional-vector-embeddings--centroid-clustering)
  - [4. Explainable Multi-Signal Mathematical Fusion Engine](#4-explainable-multi-signal-mathematical-fusion-engine)
  - [5. Status-Aware Lifecycle Fusion (30-Day Defect Window)](#5-status-aware-lifecycle-fusion-30-day-defect-window)
  - [6. Generative Incident Intelligence Briefs & Action Checklists](#6-generative-incident-intelligence-briefs--action-checklists)
  - [7. Safety-First Dynamic Priority Escalation & Trend Detection](#7-safety-first-dynamic-priority-escalation--trend-detection)
  - [8. Zero-Downtime Rule-Based Heuristic Fallback](#8-zero-downtime-rule-based-heuristic-fallback)
  - [9. Multimodal Vision Clustering (Shadow Pipeline)](#9-multimodal-vision-clustering-shadow-pipeline)
- [Mathematical Fusion Formulation](#-mathematical-fusion-formulation)
- [System Architecture & Workflow](#-system-architecture--workflow)
- [User Roles & Interfaces](#-user-roles--interfaces)
  - [Citizen Portal](#citizen-portal)
  - [Municipal Authority Command Center](#municipal-authority-command-center)
- [Technology Stack](#-technology-stack)
- [Database Schema & Data Model](#-database-schema--data-model)
- [Getting Started / Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#-api-reference)
- [Verification & Regression Testing](#-verification--regression-testing)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🏙️ Overview & The Problem Solved

In fast-growing Indian cities like Rewa, Madhya Pradesh, municipal grievance systems suffer from **complaint duplication fatigue** and **cross-departmental misrouting**:

1. **The Duplicate Ticket Storm**: When a deep pothole opens on Sirmour Chauraha or a sewer overflows in Civil Lines, 50 different citizens submit separate grievances over several days across multiple helplines. Municipal engineers receive 50 distinct work orders, dispatch teams redundantly, and waste critical administrative bandwidth.
2. **Symptom vs. Root-Cause Misclassification**: A waterlogged road filled with submerged potholes creates severe traffic jams. Citizens often write *"Heavy traffic jam at College Chauraha due to flooded street"*. Traditional portals route this ticket to **Traffic Police** instead of **Municipal Engineering** or **Public Works**, leaving the actual root defect unaddressed.
3. **Multilingual Fragmentation**: Citizens report issues in formal English, Hindi Devanagari (*सड़क पर बड़ा गड्ढा*), or colloquial Hinglish (*"road me bahut paani aur kachra bhara hai"*). Rule-based keywords frequently fail on colloquial grammar and mixed spelling variations.
4. **Stale Defect Isolation**: Many civic defects (e.g., broken tarmac or drainage blockages) take 10 to 20 days to be scheduled and repaired. Standard 24–48 hour temporal clustering windows discard older active incidents, causing new complaints for the same unresolved pothole to spawn duplicate incident clusters.

### The RiWA Solution

**RiWA (Rewa Intelligence For Watch and Action)** changes this paradigm:
- **Fuses 50 raw complaints into 1 unified incident** with explainable mathematical confidence (semantic, spatial, temporal, and categorical compatibility).
- **Enforces Root-Cause-First Routing**, directing tickets to the primary physical repair agency while linking secondary agencies (e.g., Traffic Police) as supporting departments.
- **Provides Explainable AI to Municipal Officers**: Every merged incident displays an exact score breakdown (e.g., *94% Semantic, 94% Proximity, 92% Confidence*), showing why complaints were fused and where reports originated on an interactive geospatial map.
- **Generates Actionable Incident Briefs**: Automatically synthesizes multi-citizen descriptions into executive situational appraisals and step-by-step mitigation checklists for municipal teams.

---

## ✨ Key Features

- 🧠 **Google Gemini AI Engine**: Native integration with `gemini-3.5-flash-lite` and `gemini-embedding-001` with strict Zod schema validation.
- 📐 **Vector Cosine & Centroid Matching**: 768-dimensional embeddings comparing new reports against both individual complaint vectors and dynamic cluster centroids.
- 🛡️ **Zero Cross-Category Auto-Merge Gate**: Mathematically prevents waterlogging or road damage from ever erroneously auto-merging into pure traffic or animal control tickets.
- ⏳ **Status-Aware Lifecycle Fusion**: Dynamically expands candidate fusion windows up to **30 days (720 hours)** for active unresolved persistent defects (`road_damage`, `drainage`, `garbage`) while strictly locking transient issues at 48 hours.
- 🚨 **Safety Overrides & Volume Escalation**: Immediate elevation to `CRITICAL` for live electrical wires or hazards near schools/hospitals, with automated trend calculation (`RAPIDLY_RISING`, `RISING`, `STABLE`).
- 🗺️ **Interactive Geospatial Command Center**: Leaflet-powered city intelligence map rendering real-time incidents, clustered report markers, and dynamic civic hotspot radii.
- 📊 **Executive Analytics & Ward Insights**: Recharts visualizations for department workload distribution, category breakdowns, resolution KPIs, and volume trends.
- 🔄 **Deterministic Fallback Engine**: Comprehensive offline rule-based heuristic parser with full Hindi Devanagari and Hinglish support, ensuring 100% operational uptime.

---

## 🧠 How AI is Implemented in RiWA (Deep Dive)

The AI architecture in RiWA is purposefully engineered for mission-critical civic governance. It does not treat the Large Language Model as an opaque chat interface; instead, **AI is deeply embedded into a multi-stage, deterministic pipeline**.

```
                           CITIZEN REPORT
              (English / Devanagari Hindi / Hinglish)
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │         1. GEMINI NLU & CLASSIFICATION       │
         │  • Root-cause vs secondary symptom analysis  │
         │  • 7-Department routing & severity tagging   │
         │  • Hazard & sensitive location extraction    │
         │  • Strict Zod Schema JSON validation         │
         │  • (Graceful Fallback Heuristic on timeout)  │
         └──────────────────────┬───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │        2. GEMINI VECTOR EMBEDDING ENGINE      │
         │  • 768-dim float vector embedding generation │
         │  • Cosine similarity against cluster members │
         │  • Cluster Centroid vector calculation       │
         └──────────────────────┬───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │       3. MULTI-SIGNAL MATHEMATICAL FUSION    │
         │  • Hard Gate 1: Category Compatibility       │
         │  • Hard Gate 2: Geographic Radius (<= 500m)  │
         │  • Hard Gate 3: Status-Aware Time Window     │
         │  • 4-Signal Weighted Scoring:                │
         │    35% Semantic + 35% Geo + 15% Time + 15% Cat │
         └──────────────────────┬───────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
        [ Score >= 0.85 ]             [ 0.65 <= Score < 0.85 ]
         AUTO_MERGE to                  Flagged for Authority
        Existing Incident                   HUMAN REVIEW
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │     4. GENERATIVE BRIEF & ACTION ENGINE      │
         │  • Executive Incident Intelligence Brief     │
         │  • Strategic municipal urgency appraisal     │
         │  • 3 to 5-step concrete actionable checklist │
         └──────────────────────────────────────────────┘
```

---

### 1. Multilingual Zero-Shot NLU (Hindi, Hinglish, English)

Citizens in Madhya Pradesh articulate public infrastructure issues in colloquial local phrasing. RiWA's AI service ([`aiService.ts`](file:///backend/src/services/aiService.ts)) processes raw text across language variations without requiring the citizen to choose technical categories:

| Input Text | Language | Extracted Category | Primary Department | Secondary Dept |
| :--- | :--- | :--- | :--- | :--- |
| *"College Chauraha ki road me bahut gaddhe hai bike se girte girte bache"* | Hinglish | `road_damage` | Public Works | Traffic Police |
| *"सिरमौर चौराहे पर बारिश के बाद भारी जलभराव है और सड़क के गड्ढे छिप गए हैं"* | Hindi | `drainage` | Municipal Engineering | Public Works |
| *"Live sparking wire hanging from street pole near Girls School"* | English | `electrical_hazard` | Electrical | None (`CRITICAL`) |
| *"Market area garbage dump overflowing into the street causing foul smell"* | English | `garbage` | Sanitation | Traffic Police |

---

### 2. Root-Cause-First Civic Classification

A fundamental defect in standard NLP ticket systems is confusing consequences with causes. When rainwater floods a road and slows down traffic, citizen complaints frequently say *"terrible traffic jam"*.
- **RiWA's Root-Cause Rule**: The AI prompt explicitly prompts Gemini to distinguish **root physical defects** from **secondary commuter consequences**:
  - Potholes / Broken Tarmac $\to$ `road_damage` (Public Works)
  - Clogged Drains / Waterlogging $\to$ `drainage` (Municipal Engineering)
  - Spilled Waste / Trash Dumps $\to$ `garbage` (Sanitation)
  - Broken Light / Dangling Wire $\to$ `electrical_hazard` (Electrical)
  - Pure Signal Fault / Illegal Parking $\to$ `other` (Traffic Police)
- **Secondary Department Routing**: The AI simultaneously assigns a `supportingDepartment: "Traffic Police"` so traffic units are notified while the primary physical engineering team receives the core repair ticket.
- **Type-Safe Zod Enforcement**: All LLM outputs are validated against a strict Zod schema (`AIAnalysisSchema`). If the model outputs extraneous formatting or missing keys, the system detects it immediately and falls back safely.

---

### 3. High-Dimensional Vector Embeddings & Centroid Clustering

Text matching in RiWA goes beyond superficial keyword search using Google's `gemini-embedding-001` ([`embeddingService.ts`](file:///backend/src/services/embeddingService.ts)):
1. Generates dense 768-dimensional float vectors for every submitted complaint.
2. **Member & Centroid Dual-Evaluation**:
   - The engine computes the **normalized unit centroid** of all complaints currently attached to an active incident cluster:
     $$\mathbf{C} = \frac{\sum_{i=1}^{n} \mathbf{v}_i}{\|\sum_{i=1}^{n} \mathbf{v}_i\|}$$
   - The new complaint vector $\mathbf{u}$ is scored against both the maximum member similarity and the cluster centroid:
     $$S_{\text{semantic}} = \max\left(\max_{i \in [1,n]} \cos(\mathbf{u}, \mathbf{v}_i),\, \cos(\mathbf{u}, \mathbf{C})\right)$$
3. This ensures that as an incident grows from 3 to 15 reports, its semantic identity remains stable and representative of the entire defect site.

---

### 4. Explainable Multi-Signal Mathematical Fusion Engine

Incident clustering is never a "black box" in RiWA ([`fusionEngine.ts`](file:///backend/src/services/fusionEngine.ts)). It combines 4 distinct signals:
- **Semantic Score (35%)**: Vector cosine similarity against existing cluster embeddings (or Hinglish-aware token overlap in fallback mode).
- **Location Proximity (35%)**: Linear decay over the maximum allowed geographic radius ($D_{\max} = 500\text{m}$):
  $$S_{\text{location}} = \max\left(0,\, 1 - \frac{\text{Distance (km)}}{0.5\text{ km}}\right)$$
- **Temporal Proximity (15%)**: Non-linear decay representing civic complaint arrival dynamics:
  - $0 - 6\text{ hours}$: $1.00 \to 0.90$
  - $6 - 24\text{ hours}$: $0.90 \to 0.70$
  - $24 - 48\text{ hours}$ (or up to $720\text{ hours}$ for active defects): $0.70 \to 0.35$
- **Category Compatibility (15%)**: Strict hard gate. Incompatible civic domains evaluate to $0.0$, immediately disqualifying the pair.

**Decision Thresholds**:
- $\text{Score} \ge 0.85$: **`AUTO_MERGE`** (complaint is merged into the existing incident; report count and confidence update in real time).
- $0.65 \le \text{Score} < 0.85$: **`REVIEW`** (recommended for municipal officer review; prevents false merges).
- $\text{Score} < 0.65$: **`SEPARATE`** (a clean new civic incident is instantiated).

---

### 5. Status-Aware Lifecycle Fusion (30-Day Defect Window)

In municipal reality, infrastructure defects like massive asphalt craters or overflowing drains remain active on city streets for weeks before repair crews arrive. 
- **The Problem**: A standard 48-hour window causes a complaint filed on Day 20 to spawn a brand new duplicate incident, fracturing history and metrics.
- **RiWA's Status-Aware Solution**:
  - **Resolved / Closed Defect**: Strictly capped at 48 hours to preserve historical closure and prevent stale re-merges.
  - **Transient Incidents** (`electrical_hazard`, pure traffic congestion): Strictly capped at 48 hours.
  - **Active Persistent Defect** (`road_damage`, `drainage`, `garbage` with status `OPEN`, `ASSIGNED`, `IN_PROGRESS`): The temporal window smoothly extends up to **30 days (720 hours)**. If strong semantic and spatial proximity align, late-arriving complaints correctly merge into the open work order.

---

### 6. Generative Incident Intelligence Briefs & Action Checklists

When multiple citizen reports fuse into an incident, municipal officers need immediate situational clarity rather than scrolling through dozens of raw complaints ([`aiService.ts#generateIncidentBrief`](file:///backend/src/services/aiService.ts#L390)):
- **Executive Summary**: A concise 1–2 sentence operational digest.
- **Strategic Situational Appraisal**: Explains escalation potential, pedestrian/traffic risk, and impending weather risks (e.g., rainfall worsening an open sewer).
- **Tactical Action Checklist**: Generates 3 to 5 concrete remediation tasks for the designated municipal team (e.g., *"1. Deploy de-watering pump at Sirmour Chauraha; 2. Clear debris from culvert mouth; 3. Coordinate traffic diversion with Traffic Police"*).

---

### 7. Safety-First Dynamic Priority Escalation & Trend Detection

RiWA implements deterministic safety overrides on top of raw AI severity scores ([`priorityEngine.ts`](file:///backend/src/services/priorityEngine.ts)):
- **Life-Safety Overrides**: If an `electrical_hazard` mentions `live_wire` or `sparking`, or is situated near a `school` or `hospital`, the priority is automatically forced to **`CRITICAL`** regardless of report volume.
- **Volume Escalation**:
  - $\ge 10\text{ reports}$: Promoted to `CRITICAL`
  - $\ge 6\text{ reports}$: Promoted to `HIGH`
  - $\ge 3\text{ reports}$: Promoted to `MEDIUM`
- **Velocity / Surge Detection**:
  - $\ge 4\text{ reports/hour}$: Trend becomes `RAPIDLY_RISING` (escalation warning triggered on authority dashboard)
  - $\ge 2\text{ reports/hour}$: Trend becomes `RISING`
  - Otherwise: `STABLE`

---

### 8. Zero-Downtime Rule-Based Heuristic Fallback

Civic infrastructure platforms cannot halt operations during external API outages, rate limits, or network timeouts.
- If Gemini API is unreachable or `GEMINI_API_KEY` is not supplied, RiWA smoothly switches to its built-in **Civic Heuristic Fallback Engine**.
- Features comprehensive tokenizers and keyword dictionaries in **Devanagari Hindi** (`गड्ढा`, `सड़क`, `पानी`, `जलभराव`, `नाला`, `सीवर`, `कचरा`, `कूड़ा`, `बिजली`, `तार`), **Hinglish** (`sadak`, `gaddha`, `paani`, `naali`, `kachra`, `bijli`), and English.
- Evaluates root causes, department routing, severity, hazards, and text similarity with complete parity, guaranteeing that citizen submissions never fail.

---

### 9. Multimodal Vision Clustering (Shadow Pipeline)

In advanced configurations, RiWA includes a dedicated, least-privilege **Vision Clustering Shadow Worker** ([`shadowFusionWorker.ts`](file:///backend/src/workers/shadowFusionWorker.ts)):
- Runs offline on citizen-uploaded photographs pairwise.
- Prompts Gemini Vision to compare physical textures, asphalt fracture patterns, water accumulation markers, and background street furniture.
- Strict PII redaction: automatically scrubs phone numbers, emails, and credentials before evaluation.
- Runs in an isolated, read-only shadow evaluation table without mutating live production data.

---

## 📐 Mathematical Fusion Formulation

The composite fusion score between an incoming citizen report $C$ and an existing candidate incident cluster $I$ is defined as:

$$\Phi(C, I) = w_s \cdot S_{\text{semantic}} + w_l \cdot S_{\text{location}} + w_t \cdot S_{\text{time}} + w_c \cdot S_{\text{category}}$$

$$\text{Subject to: } \quad w_s = 0.35, \quad w_l = 0.35, \quad w_t = 0.15, \quad w_c = 0.15$$

### Hard Gates (Pre-Condition Requirements)

An incident is only scored if all three hard gates pass:

1. **Category Hard Gate**:
   $$\text{Gate}_{\text{category}} = 
   \begin{cases} 
   \text{PASS} & \text{if } \text{Category}(C) = \text{Category}(I) \text{ and sub-domains match} \\
   \text{REJECT} & \text{otherwise} \quad (\Phi = 0.0)
   \end{cases}$$

2. **Geospatial Hard Gate (Haversine Distance)**:
   $$\text{Dist}(C, I) \le 0.50\text{ km} \quad (\approx 500\text{ meters})$$

3. **Lifecycle-Aware Temporal Hard Gate**:
   $$\Delta t = |t_C - t_I| \le 
   \begin{cases} 
   720\text{ hours (30 days)} & \text{if } I \text{ is Active Persistent Defect} \\
   48\text{ hours} & \text{if } I \text{ is Resolved or Transient Defect}
   \end{cases}$$

### Deterministic Tie-Breaking Protocol

If two different candidate incidents $I_1$ and $I_2$ both exceed the `AUTO_MERGE` threshold ($0.85$) with a marginal score difference:

$$|\Phi(C, I_1) - \Phi(C, I_2)| < 0.03$$

The fusion engine **demotes the decision to `REVIEW`** and alerts the municipal officer, guaranteeing that no report is assigned to an arbitrary cluster when ambiguity exists.

---

## 🏛️ System Architecture & Workflow

```
                                      CLIENT TIER
             ┌────────────────────────────────────────────────────────┐
             │      React 19 + TypeScript + Vite + Tailwind CSS v4     │
             │   Citizen Submission Portal  │  Authority Dashboard    │
             └──────────────────────────┬─────────────────────────────┘
                                        │ HTTPS / REST API
                                        ▼
                                   SERVER TIER
             ┌────────────────────────────────────────────────────────┐
             │            Node.js / Express Backend Engine            │
             │  ├── JWT Authentication & Role-Based Middleware        │
             │  ├── Multer Photo Storage Pipeline                     │
             │  ├── AI Service (Google Gemini 3.5 Flash Lite)         │
             │  ├── Vector Embedding Service (gemini-embedding-001)   │
             │  ├── Multi-Signal Fusion Engine & Status-Aware Gating  │
             │  └── Priority Escalation & Dynamic Trend Engine        │
             └──────────────────────────┬─────────────────────────────┘
                                        │ PostgreSQL Client / Supabase SDK
                                        ▼
                                  DATABASE TIER
             ┌────────────────────────────────────────────────────────┐
             │             Supabase Managed PostgreSQL                │
             │  • incidents        • complaints       • ai_analyses   │
             │  • departments      • incident_reports • status_logs   │
             │  • users            • hotspots                         │
             │  (Spatial & Temporal B-Tree / PostGIS Indexing)        │
             └────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Interfaces

### Citizen Portal
- **Zero Friction Reporting**: Clean, mobile-friendly interface designed for citizens on the street.
- **Interactive Map Pinning**: Click-to-pin geolocation over Rewa municipal boundaries with automatic reverse-coordinated lat/long capture.
- **Photo Upload**: Attach real-time camera captures or gallery photos.
- **Live AI Processing Indicator**: Displays real-time steps while Gemini analyzes language, extracts categories, and queries spatial clusters.
- **Transparent Status Tracking**: Citizens can monitor their complaint code (`R-XXX`), track department assignment, and follow resolution milestones.

### Municipal Authority Command Center
- **City Intelligence Map**: Live interactive map with custom Leaflet markers color-coded by priority (`CRITICAL`: Red, `HIGH`: Amber, `MEDIUM`: Blue, `LOW`: Slate) and dynamic hotspot radius circles.
- **AI Explainability Drawer**: Shows municipal engineers the exact mathematical reasons why citizen reports were grouped together (*Semantic 94%, Proximity 94%, Time 100%, Category 100%*).
- **Incident Intelligence Briefing**: Displays the executive situation brief, urgency assessment, and recommended action steps.
- **Department Reassignment & Status Control**: Allows authorities to reassign incidents between the 7 municipal departments or progress statuses (`OPEN` $\to$ `ASSIGNED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`).
- **City Analytics Dashboard**: High-level charts tracking incident volume over time, department workloads, resolution percentages, and ward breakdown.

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite | Ultra-fast, type-safe reactive user interface |
| **Styling & UI** | Tailwind CSS v4, Lucide React | Modern civic design system with responsive layouts |
| **Mapping & Geospatial** | Leaflet, React-Leaflet, OpenStreetMap | Interactive spatial incident plotting and hotspot heat circles |
| **Data Visualization** | Recharts | Department workload, trend velocity, and category charts |
| **State & API Client** | TanStack React Query, Axios | Efficient client caching, optimistic updates, and API calls |
| **Backend Runtime** | Node.js, Express, TypeScript (`tsc`, `tsx`) | Robust REST API with modular MVC architecture |
| **Artificial Intelligence**| Google Gemini (`gemini-3.5-flash-lite`) | Multilingual classification, hazard extraction, and incident briefs |
| **Vector Embeddings** | Google Gemini (`gemini-embedding-001`) | 768-dimensional semantic embeddings & cluster centroid calculation |
| **Validation** | Zod | Runtime type validation for API payloads and LLM outputs |
| **Database & Auth** | Supabase (PostgreSQL), Custom JWT, bcryptjs | Persistent relational database, spatial indexes, and role-based auth |
| **File Storage** | Supabase Storage / Local Multer | Citizen defect photo uploads with URL resolution |

---

## 🗄️ Database Schema & Data Model

The database runs on PostgreSQL (Supabase) with UUID primary keys and spatial indexes:

- **`departments`**: The 7 municipal divisions (*Municipal Engineering, Sanitation, Public Works, Electrical, Animal Control, Traffic Police, Other Civic Services*).
- **`users`**: Role-based identities (`CITIZEN`, `AUTHORITY`, `ADMIN`) with bcrypt hashed credentials.
- **`incidents`**: Unified, fused civic defects containing geographic coordinates, priority, status, fusion confidence, summary, AI brief, and action checklists.
- **`complaints`**: Individual raw citizen grievance submissions with original text, image URLs, coordinates, and link to parent incident.
- **`ai_analyses`**: Stores structured Gemini extractions, confidence scores, detected hazards, sensitive locations, and 768-dim vector embeddings.
- **`incident_reports`**: Many-to-many junction table recording the explainable fusion score breakdown (*semantic, location, time, category*) for every merged complaint.
- **`status_logs`**: Full immutable audit trail recording every state transition, actor ID, timestamp, and operational note.
- **`hotspots`**: Dynamic geographic clusters representing recurring civic problem areas across Rewa's municipal grid.

---

## 🚀 Getting Started / Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key** (optional for local fallback mode, required for full LLM embeddings and briefs)
- **Supabase Project** (optional for fallback in-memory store, required for live persistence)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
4. Configure `.env` variables:
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=riwa_civic_intelligence_jwt_secret_key_2026_rewa
   JWT_EXPIRES_IN=7d

   # Supabase Configuration (Optional: fallback in-memory store used if blank)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Google Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   GEMINI_MODEL=gemini-3.5-flash-lite
   GEMINI_EMBEDDING_MODEL=gemini-embedding-001

   # Production Fusion Parameters
   FUSION_AUTO_MERGE_THRESHOLD=0.85
   FUSION_REVIEW_THRESHOLD=0.65
   FUSION_MAX_DISTANCE_KM=0.5
   FUSION_MAX_TIME_HOURS=48
   ```
5. Build and start the backend:
   ```bash
   # Development mode with live reload
   npm run dev

   # Or compile and run
   npm run build
   npm start
   ```
   The backend API will be live at `http://localhost:5000`.

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the frontend environment file:
   ```bash
   cp .env.example .env
   ```
4. Set the API target:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
5. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173` to access RiWA.

---

## 📡 API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status and API health check |
| `POST` | `/api/auth/register` | Public | Register citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT |
| `GET` | `/api/reports` | Authenticated | List citizen reports (filtered by user or city-wide) |
| `POST` | `/api/reports` | Authenticated | Submit new complaint with AI analysis & fusion |
| `GET` | `/api/reports/:id` | Authenticated | Get detailed complaint metadata and timeline |
| `GET` | `/api/incidents` | Public / Authority | List active and historical fused civic incidents |
| `GET` | `/api/incidents/:id` | Public / Authority | Get incident intelligence, fused complaints, and brief |
| `PATCH` | `/api/incidents/:id/status` | Authority | Update incident lifecycle status with audit logging |
| `PATCH` | `/api/incidents/:id/department`| Authority | Reassign incident department queue |
| `GET` | `/api/hotspots` | Public / Authority | List detected civic hotspots and report densities |
| `GET` | `/api/departments` | Public | List the 7 municipal departments and metadata |
| `GET` | `/api/analytics/overview` | Authority | Get city-wide KPI metrics, workload, and trends |

---

## 🧪 Verification & Regression Testing

RiWA features a comprehensive suite of automated regression tests validating that the fusion engine, AI classification, safety overrides, and temporal windows function flawlessly under all edge cases.

To execute the test suite:
```bash
npx tsx backend/tests/test_critical_fusion_accuracy.ts
```

### Verified Test Scenarios

- **Scenario A**: Waterlogging report vs. Traffic Congestion incident $\to$ Strict cross-category separation (**PASSED**).
- **Scenario B**: Road damage mentioning traffic delays vs. Traffic incident $\to$ Root cause prioritized, cross-category merge blocked (**PASSED**).
- **Scenario C**: Two pure traffic congestion complaints at same intersection $\to$ Clean auto-merge (**PASSED**).
- **Scenario D**: Multilingual Devanagari Hindi (*"सड़क पर बड़ा गड्ढा"*) vs. English pothole incident $\to$ Seamless auto-merge (**PASSED**).
- **Scenario E**: Two waterlogging reports at same location within temporal window $\to$ Clean auto-merge (**PASSED**).
- **Scenario F**: Garbage spilled onto road vs. Traffic incident $\to$ Sanitation prioritized, cross-category blocked (**PASSED**).
- **Scenario G**: Different categories at same coordinates $\to$ Categorical hard gate blocks merge (**PASSED**).
- **Scenario H**: Uncertain or low-confidence classification $\to$ Auto-merge inhibited, safely routed to human review (**PASSED**).
- **Scenario I**: Geographic boundary enforcement $\to$ Reports $>500\text{m}$ strictly separated (**PASSED**).
- **Scenario J**: Status-Aware Lifecycle Fusion $\to$ Active pothole at Day 20 merges cleanly; resolved pothole at Day 20 rejected (**PASSED**).
- **Scenario K**: Idempotent re-submissions & retries $\to$ Zero duplicate report counts or split clusters (**PASSED**).
- **Scenario L**: Complete Gemini API outage fallback $\to$ Offline heuristic engine takes over with 100% accuracy (**PASSED**).

---

## 📄 License & Acknowledgments

- **Brand**: **RiWA** (Rewa Intelligence For Watch and Action)
- **Initiative**: Smart Rewa 2030
- **Demonstration**: Conceived and engineered for the **iComputex Tech Fest 2026**, Rewa, Madhya Pradesh.
- **License**: Released under the [MIT License](LICENSE).

---

<p align="center">
  <b>RiWA — Rewa Intelligence For Watch and Action</b><br>
  <i>Empowering Citizens • Accelerating Municipal Governance • Smart Rewa 2030</i>
</p>
