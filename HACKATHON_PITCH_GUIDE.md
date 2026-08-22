# RentGuard AI — Hackathon Walkthrough & Team Roles

## 1. Problem

When a tenant moves into a room, the room may already have small marks, scratches, stains or defects.

Months later, when the tenant moves out, disputes can happen:
- *"Was this damage already there?"*
- *"Should the tenant lose part of their security deposit?"*
- *"How much damage actually happened?"*

Usually there is no structured evidence.

---

## 2. Solution

RentGuard AI creates a digital evidence trail for the room.

1. The tenant photographs the room at move-in.
2. When leaving, they photograph it again.
3. RentGuard compares the two states using AI and produces:
   - **Visual evidence**
   - **Damage classification**
   - **Confidence score**
   - **Repair-cost estimate**
   - **Deposit impact**
   - **Statutory explanation**
   - **Final printable inspection report**

---

## 3. Live Hackathon Demo (2–3 Minutes Script)

### Scene 1 — Dashboard (15 Seconds)
- **Open RentGuard AI** at `http://localhost:3000`
- **Say**: *"RentGuard is an AI-powered room handover platform designed to make security-deposit assessments transparent and mathematically fair."*
- **Show**: New Inspection, Inspection History, Deposit Report.

### Scene 2 — Start Inspection (30 Seconds)
- **Click**: *"Start New Inspection"*
- **Enter**: Property: *DLF CyberCity Towers / Flat 1204* · Room: *Modular Kitchen* · Security Deposit: *₹50,000*
- **Upload**: The **MOVE-IN** baseline image.
- **Explain**: *"This is the baseline condition recorded when the tenant entered the property."*

### Scene 3 — Move-Out Evidence & Scrubber (30 Seconds)
- **Upload**: The **MOVE-OUT** image.
- **Show**: The interactive tape-measure comparison scrubber.
- **Say**: *"Now we capture the same room at move-out."*
- **Interaction**: Drag the slider back and forth to reveal the baseline delta.

### Scene 4 — AI Analysis (25 Seconds)
- **Click**: *"Run AI Audit"*
- **Show**: The staged loading animation (*Aligning angles → Detecting fractures → Checking tenancy statutes*).
- **Reveal**:
  - *Finding*: Granite Countertop Chip
  - *Classification*: Moderate Damage (Tenant Responsibility)
  - *Confidence*: 88%
  - *Estimated Repair*: ₹4,500
- **Explain**: *"The AI isn't simply detecting that the images are different. It evaluates what changed and distinguishes normal wear and tear from actual tenant-caused damage."*

### Scene 5 — Deposit Assessment (20 Seconds)
- **Navigate to**: *Deposit Report*
- **Show**:
  - Security Deposit: **₹50,000**
  - Estimated Repair: **₹4,500**
  - Recommended Deduction: **₹4,500**
  - Potential Refund: **₹45,500** (91% Preserved)
- **Click**: *"Why?"* to expand the statutory reasoning.
- **Say**: *"Instead of an arbitrary deduction, RentGuard produces an evidence-backed settlement."*

### Scene 6 — Evidence Report (15 Seconds)
- **Open**: Final Settlement Dossier.
- **Show**: Before/After photos, timestamp, itemized findings, inspection ID (`INSP-7F2A1`).
- **Say**: *"This report acts as an immutable certified record of the handover."*

### Scene 7 — Secondary Features (15 Seconds)
- **Briefly show**:
  - **Property Listing Mode**: *"Landlords can also use the same visual intelligence to turn room photos into property listings."*
  - **Admin Analytics**: *"On the administrative side, the platform monitors user behavior and retention risk."*

---

## 4. Strong Closing Statement

> *"RentGuard doesn't just detect damage. It creates a visual history of a property, helping both tenants and landlords understand what actually changed and making security-deposit decisions transparent."*

---

## 👥 Team Role Division

### 4-Person Hackathon Team:

| Member | Role | Key Responsibilities |
|---|---|---|
| **Member 1** | **Frontend / UI Lead** | Dashboard, Navigation, 3-Step Workflow, Comparison Slider, Result Cards, Deposit Breakdown, UI Polish. |
| **Member 2** | **Backend / API Lead** | `/api/inspect`, Image validation, Max-deduction capping logic, Mock fallback, Error handling. |
| **Member 3** | **AI / ML Lead** | `lib/prompts.ts`, Wear vs. Damage prompt rules, Vision API integration, Confidence scoring, ML Churn models. |
| **Member 4** | **Testing / Presentation Lead** | Jest test suites (103/103 passing), Edge cases, Pitch deck, Demo rehearsal, Live timer management. |

---

## 🎯 Feature Prioritization

- **P0 (MUST WORK & DEMO)**:
  - Move-in photo
  - Move-out photo
  - Before/after comparison slider
  - AI damage detection
  - Normal wear vs. damage distinction
  - Repair cost estimate
  - Deposit calculation & refund
  - Evidence report preview

- **P1 (SHOULD WORK)**:
  - Inspection history & search
  - Multiple room presets
  - Camera capture
  - Print / Export PDF

- **P2 (NICE TO HAVE)**:
  - Property listing generator
  - Admin ML churn analytics
  - Retention interventions
