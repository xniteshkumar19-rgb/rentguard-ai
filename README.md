# RentGuard AI 🏠🔍

A forensic property-evidence workspace for move-in/move-out comparisons, defensible INR valuations, room-condition ledgers, and tenant churn telemetry. Built with **Next.js 16 App Router**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and OpenAI Vision with a safe demo fallback.

![RentGuard AI](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss) ![OpenAI](https://img.shields.io/badge/OpenAI-Vision-412991?style=flat-square&logo=openai)

---

## ✨ Features

### Evidence journey — Move-in to move-out
- Attach paired move-in and move-out evidence from desktop upload or mobile camera capture.
- Use the touch-friendly, keyboard-operable comparison scrubber to review the condition delta.
- Run Vision analysis for new findings, a confidence score, an INR valuation range, and a concise reasoning record.
- Print the completed finding as a clean audit artifact.
- Keep room-level valuation records with IDs, timestamps, condition status, and financial impact.

### Mode 2 — Rent / Sale Listing (Landlord Utility)
- 🏠 Photograph any clean room, kitchen, or staged area
- ✨ AI extracts 3-5 key selling features (granite tops, hardwood floors, etc.)
- 📊 Estimates competitive monthly rent for the local market
- 📝 Auto-writes a Zillow/Facebook-Marketplace-ready listing headline + description
- 📋 One-click "Copy Listing Text" to clipboard

### Mode 3 — Admin ML Churn & Account Deletion Dashboard 🧠⚡
- 📊 **Executive Overview Metrics**: Total active users (1,248), high churn risk rate (14.0%), predicted 30-day account deletions (18 users), model ROC-AUC / prediction accuracy (94.2%).
- 🔬 **ML Feature Importance Telemetry**: Top signals predicting account deletion (Inactivity Duration 42%, Scan Error Frequency 28%, Unresolved Support Friction 18%, Deposit Dispute Flag 12%).
- 👥 **Interactive Risk Table**: Searchable & filterable user table with inactivity tracking, friction scoring, deletion risk levels, primary drivers, and individual retention actions.
- ⚡ **Automated Retention Interventions**: Proactive 1-click batch campaign dispatch targeting high-risk users with custom discount incentives and priority concierge support.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + Lucide React |
| AI / Vision | OpenAI GPT-4o Vision API |
| Machine Learning | XGBoost / Calibrated Probability Telemetry |
| Testing | Jest + ts-jest |
| Package Manager | npm |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 20.9 or later
- npm v9 or later
- (Optional) An OpenAI API key for real AI analysis

### 2. Clone / Navigate to the Project

```bash
cd rentguard-ai
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

```bash
# Copy the example env file
copy .env.local.example .env.local
```

Open `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-real-key-here
```

> **Note:** If you skip this step or leave the placeholder value, the app runs in **Demo Mode** with realistic mock data — all UI features still work!

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Use **Demo access** when no OAuth provider is configured. The case shown on entry is clearly labelled sample data; attach both of your own evidence photos to run the paired inspection workflow.

---

## 🧪 Running Tests

```bash
# Run all unit tests
npm test

# Run with coverage report
npm test -- --coverage
```

### Test Coverage

| Module | Tests |
|---|---|
| `__tests__/churn.test.ts` | Executive KPIs, feature weights, mock risk scoring, retention logic |
| `__tests__/api.test.ts` | `/api/inspect` route validation, mock fallbacks, GPT-4o vision integration |
| `__tests__/prompts.test.ts` | Vision prompt formatting, message builders, schema constraints |
| `__tests__/mockData.test.ts` | Damage classification, rent estimates, feature lists |
| `__tests__/utils.test.ts` | Formatting, IDs, and date utilities |

---

## 🏗️ Project Structure

```
rentguard-ai/
├── app/
│   ├── layout.tsx                     # Root layout + viewport metadata
│   ├── page.tsx                       # Main UI + mode routing (Scanner / Admin)
│   ├── globals.css                    # Tailwind + custom animations & print styles
│   └── api/inspect/route.ts           # POST /api/inspect — Vision AI endpoint
├── components/
│   ├── Header.tsx                     # Sticky header + Admin ML switcher
│   ├── AdminChurnDashboard.tsx        # Executive KPIs, Feature weights, User Risk table
│   ├── ModeToggle.tsx                 # Animated dual-mode toggle
│   ├── CameraCard.tsx                 # Camera capture + file upload
│   ├── LoadingPulse.tsx               # Animated loading state
│   ├── OutcomeCard.tsx                # AI result renderer (mode-aware)
│   ├── AuditLog.tsx                   # Session inspection log + PDF export
│   └── ui/Badge.tsx                   # Reusable color-coded badge
├── lib/
│   ├── churnData.ts                   # Churn metrics, feature weights, mock users
│   ├── prompts.ts                     # OpenAI vision system prompts
│   ├── mockData.ts                    # Fallback inspection data
│   └── utils.ts                       # cn(), formatUSD(), etc.
├── types/index.ts                     # TypeScript data contracts & interfaces
├── __tests__/                         # Jest unit test suites
├── jest.config.ts                     # Jest configuration
├── .env.local.example                 # Environment variable template
└── README.md
```

---

## 🔌 API Reference

### `POST /api/inspect`

**Request Body:**
```json
{
  "imageBase64": "string (base64-encoded JPEG/PNG, max ~10MB)",
  "mode": "move_out" | "listing"
}
```

**Response — Move-Out Mode:**
```json
{
  "data": {
    "defect_type": "Wall Scuff Mark",
    "classification": "Normal Wear & Tear",
    "badge_color": "green",
    "legal_reasoning": "...",
    "repair_cost_low": 0,
    "repair_cost_high": 0,
    "confidence": 94
  },
  "mode": "move_out"
}
```

**Response — Listing Mode:**
```json
{
  "data": {
    "key_features": ["Hardwood floors", "Natural light", "..."],
    "estimated_monthly_rent": 2400,
    "headline": "Stunning Open-Concept 1BR...",
    "description": "..."
  },
  "mode": "listing"
}
```

---

## 📄 License

MIT — free for personal and commercial use.
