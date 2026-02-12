# Silent Help

> **"Invisible Intervention"** - a quiet digital space for emotional support.

Silent Help is a mental wellness project with a Next.js frontend and a Next.js API backend.
The current product focuses on a practical MVP: onboarding, personalized recommendations, chat support, journaling, and mood logging.

---

## 🎯 Current Product Status

### What is implemented now

- JWT-based authentication (register, login, current user)
- 6-step dynamic onboarding flow
- Personalized wellness profile generation (rule-based + optional AI insight)
- Dashboard with tailored tools and AI tone/profile settings
- Conversation system (create/list/view/delete conversations)
- Chat messaging with SSE streaming and OpenAI integration
- Crisis keyword detection with UK support resources
- Journal entries and mood logging APIs + frontend pages

### What is planned / in-progress

- Field-level journal encryption
- Semantic embeddings + similarity search (pgvector)
- Expanded safety orchestration and richer clinical audit flows
- Production compliance hardening and formal sign-offs

---

## 🏗️ Architecture

- **Frontend:** Next.js app router (`frontend/`) on port `3000`
- **Backend:** Next.js API service (`backend/`) on port `4000`
- **Database:** PostgreSQL via Prisma (`backend/prisma/schema.prisma`)
- **AI:** OpenAI chat completions for onboarding insight + chat responses

---

## 🛡️ Safety (Current Implementation)

- Every chat message passes through deterministic crisis keyword checks.
- Crisis-aware prompting is added to assistant behavior.
- When risk language is detected, UK crisis resources are returned in the response context.

### UK Crisis Resources surfaced in app

- **999** - Emergency Services
- **111** - NHS 111
- **116 123** - Samaritans
- **85258** - Shout (text)
- **0800 58 58 58** - CALM

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment variables

Backend (`backend/.env`):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/silenthelp?schema=public"
OPENAI_API_KEY="sk-..."
JWT_SECRET="replace-with-strong-secret"
```

Frontend (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Run

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

---

## 📁 Project Structure (Current)

```text
Silent-Help/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app/api/
│       │   ├── auth/
│       │   ├── chat/
│       │   ├── conversations/
│       │   ├── health/
│       │   ├── journal/
│       │   ├── mood/
│       │   └── onboarding/
│       └── lib/
│           ├── auth.ts
│           ├── crisis.ts
│           ├── prisma.ts
│           └── recommendations.ts
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
└── docs/
    ├── design/
    └── legal/
```

---

## 📊 Data Model (Current Prisma Tables)

- `users`
- `wellness_profiles`
- `conversations`
- `messages`
- `journal_entries`
- `mood_logs`

---

## 📚 Compliance Docs

Legal and clinical templates are available in `docs/legal/`:

- `DPIA-Template.md`
- `Hazard-Log-Template.md`
- `AI-Module-Hazard-Log.md`

---

## 📝 License

Private - all rights reserved.
