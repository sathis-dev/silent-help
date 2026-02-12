# Silent Help

> **"Invisible Intervention"** - A fortress for the mind.

A mental health support application designed for the UK market with a singular focus: reducing the "time-to-calm" for users in high-stress states to **under 60 seconds**.

---

## 🎯 The Vision

We are building a tool that does not demand attention but earns it through **absolute reliability**.

**Philosophy:** "Low-load UX" - If the user has to think about how to use the app, we have already failed.

**In the world of mental health, silence is a feature.** Most developers try to fill the silence with noise. We fill it with support.

---

## 🏗️ Architecture: The Three-Tier Engine

The entire application state revolves around three contextual pathways:

### 🔴 HIGH Pathway (Priority Zero)
**Context:** Panic, acute anxiety, crisis

| Requirement | Implementation |
|-------------|----------------|
| Zero Generative AI | All content is deterministic, pre-rendered |
| Fitts's Law | Large touch targets (min 80px) |
| Haptic Feedback | Interactive vibration patterns |
| One-tap Crisis Lines | Direct tel: links to 999, 111, Samaritans |
| Offline-first | Pre-rendered SVGs, CSS animations only |
| Performance | Accessible in <1.5 seconds |

### 🟡 MID Pathway (The Bridge)
**Context:** Overwhelmed, "stuck," brain fog

| Feature | Purpose |
|---------|---------|
| Body Scan Interface | Help user identify tension areas |
| Guided Labels | Name the feeling without pressure |
| 3 Specific Actions | 5-4-3-2-1 Grounding, Write one sentence, Cold water splash |
| Box Breathing | Visual, haptic-guided breathing |

### 🟢 LOW Pathway (Maintenance)
**Context:** Calm, reflective, "maintenance" mode

| Feature | Purpose |
|---------|---------|
| Semantic Journal | Free-form reflective writing |
| Pattern Recognition | pgvector-powered 30-day analysis |
| AI Connection | "You felt similar 3 days ago..." |
| Tool Effectiveness | Track what actually helps |

---

## 🛡️ UK Compliance & Privacy

### Data Protection
- **GDPR & Data Protection Act 2018** compliant
- **UK Data Protection and Digital Information Act 2025** ready
- **Field-level encryption** (AES-256-GCM) for journal content
- **PII scrubbing** before any AI processing
- **Data sovereignty** - AWS eu-west-2 (London) only

### Clinical Safety
- **DCB0129/DCB0160** hazard logging
- **Dual-gate safety system** (Keyword + LLM intent classification)
- **Clinical Safety Cards** replace AI when risk detected
- **MHRA SaMD guidance** considered

### Documentation
- [DPIA Template](./docs/legal/DPIA-Template.md)
- [Hazard Log Template](./docs/legal/Hazard-Log-Template.md)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Docker (optional, for database)

### Environment Setup

1. **Clone and install dependencies:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

2. **Configure environment variables:**

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/silenthelp?schema=public"
ENCRYPTION_MASTER_KEY="your-32-character-minimum-secret-key"
OPENAI_API_KEY="sk-..."
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

3. **Start the database (Docker):**
```bash
cd docker && docker-compose up -d
```

4. **Run migrations:**
```bash
cd backend && npx prisma migrate dev
```

5. **Start development servers:**
```bash
# Terminal 1: Backend (port 4000)
cd backend && npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend && npm run dev
```

---

## 📁 Project Structure

```
Silent Help/
├── backend/                 # Next.js API backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema with pgvector
│   └── src/
│       ├── app/api/        # API routes
│       │   ├── crisis/     # Safety detection
│       │   ├── journal/    # Encrypted journal
│       │   ├── mood/       # Mood logging
│       │   ├── pathway/    # Three-tier router
│       │   ├── search/     # Semantic search
│       │   └── sos/        # Edge-optimized crisis
│       └── lib/
│           ├── contextual-router.ts   # Three-tier engine
│           ├── encryption.ts          # AES-256-GCM
│           ├── pii-scrubber.ts        # GDPR compliance
│           ├── safety-guardrails.ts   # Dual-gate system
│           └── semantic-search.ts     # pgvector patterns
│
├── frontend/                # Next.js client application
│   └── src/
│       ├── app/            # App router pages
│       ├── components/
│       │   ├── breathing/  # Breathing exercises
│       │   ├── crisis/     # Safety cards, contacts
│       │   ├── grounding/  # 5-4-3-2-1, body scan
│       │   ├── journal/    # Semantic journal
│       │   ├── pathways/   # HIGH, MID, LOW views
│       │   └── shared/     # SOS button, selector
│       └── lib/
│           ├── api.ts      # Backend client
│           ├── haptics.ts  # Vibration patterns
│           └── types.ts    # Shared types
│
├── docker/                  # Docker configuration
│   └── docker-compose.yml  # PostgreSQL + pgvector
│
└── docs/                    # Documentation
    └── legal/
        ├── DPIA-Template.md
        └── Hazard-Log-Template.md
```

---

## 🔐 Safety System

### Dual-Gate Architecture

```
User Input
    │
    ▼
┌──────────────────┐
│  GATE 1: KEYWORD │  ◄── Instant, no API calls
│  Pattern Match   │      UK-specific crisis terms
└────────┬─────────┘
         │
         │ If uncertain (0.6-0.9 confidence)
         ▼
┌──────────────────┐
│  GATE 2: LLM     │  ◄── Low-latency intent check
│  Intent Classify │      Self-harm / Medical advice
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  DECISION        │
│  ┌────────────┐  │
│  │ Safe       │──┼──► Continue session
│  │ Show Card  │──┼──► Display resources
│  │ Kill       │──┼──► Safety card, end AI
│  └────────────┘  │
└──────────────────┘
```

### UK Crisis Resources
- **999** - Emergency Services
- **111** - NHS 111
- **116 123** - Samaritans (24/7)
- **85258** - Shout (Text SHOUT)
- **0800 068 4141** - PAPYRUS (under 35)
- **0800 58 58 58** - CALM (men, 5pm-midnight)

---

## 📊 Data Model

### Key Tables

| Table | Purpose |
|-------|---------|
| `users` | Account + current pathway state |
| `user_preferences` | Safety contacts, trigger opt-outs |
| `mood_logs` | Intensity tracking with resolution metrics |
| `journal_entries` | Encrypted content (AES-256-GCM) |
| `semantic_embeddings` | pgvector for pattern recognition |
| `clinical_hazard_logs` | Safety trigger audit trail |
| `tool_usage_logs` | Track what works for each user |

### Resolution Efficiency
Unlike simple mood tracking, we measure tool effectiveness:
- `intensity_start` → `intensity_end` = Delta
- `tool_used` + `tool_duration_seconds`
- `time_to_calm` (seconds to feel better)

---

## 🎨 Design Principles

### AI Tone
- **Grounded** - No false positivity
- **Quiet** - No exclamation marks
- **Connecting** - "You felt similar 3 days ago..." not just summarizing

### Accessibility
- **WCAG 2.1 AA** compliance
- **Reduced motion** support
- **High contrast** mode support
- **Screen reader** friendly

### Performance Targets
- **Lighthouse 95+** across all metrics
- **HIGH pathway** <1.5s from launch
- **Zero cold starts** for crisis routes (edge-optimized)

---

## 🧪 Definition of Done (Phase 1)

- [x] HIGH flow accessible in <1.5 seconds from app launch
- [x] Semantic Search retrieves entries by "feeling" not keywords
- [x] UK Legal Pack (DPIA + Hazard Log) integrated
- [x] AI Tone is grounded, quiet, no exclamation marks
- [x] Field-level encryption for journal content
- [x] PII scrubbing before AI processing
- [x] Dual-gate safety system implemented
- [x] Clinical Safety Cards replace AI when triggered
- [x] Three-Tier Pathway UI complete

---

## 📝 License

Private - All rights reserved.

---

## 🤝 Contributing

This is a private mental health application. Contributions require signed NDA and clinical safety training.

---

*Don't build an app. Build a fortress for the mind.*
