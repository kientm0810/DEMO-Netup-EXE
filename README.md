# NetUp Frontend MVP Demo

## 1) Project Overview
This project is a frontend MVP demo for NetUp.  
Goal: show product UI and key user flows with local mock data only.

This version includes:
- Player / Owner / Admin demo flows
- Discovery List + Map view
- Gray-Red visual theme
- Demo chatbot for feature Q&A and court suggestions
- Player self-assessment for skill-level recommendation

## 2) Problem Summary (from requirement files)
From `pasted.txt`, `pasted1.txt`, and `requirement NetUp.docx`, core target is:
- Help players find sessions quickly, book with transparent pricing, and check-in by QR.
- Help owners manage courts, occupancy, and check-in flow.
- Help admins configure platform rules (fee, matching radius, risk rules).

## 3) New Update Scope (2026-03-24)
Implemented updates requested after first MVP:
- Add map option in Discovery after filtering (`List` / `Map` switch).
- Change primary design language to Gray-Red.
- Add chatbot demo with context file and recommendation logic.
- Add player self-assessment form to classify level and suggest suitable sessions.
- Update README + add dedicated requirement/context docs for future reference.

## 4) Tech Stack
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Local mock data (TS objects)
- React Leaflet + Leaflet (for map)

## 5) Routing
- `/`
- `/player/discovery`
- `/player/session/:sessionId`
- `/player/booking/:sessionId`
- `/player/booking-success/:bookingId`
- `/player/bookings`
- `/player/assessment`
- `/owner/dashboard`
- `/owner/courts`
- `/owner/check-in`
- `/admin/dashboard`
- `/admin/config`
- `/assistant/chatbot`
- `*`

## 6) Folder Structure
```text
src/
  app/
  pages/
    player/
    owner/
    admin/
    assistant/
  features/
  entities/
  mocks/
  shared/
```

## 7) Mock Data Strategy
Main mock datasets:
- `players.ts`
- `courts.ts` (now includes lat/lng for map)
- `sessions.ts`
- `bookings.ts`
- `ownerAnalytics.ts`
- `adminConfig.ts`
- `playerAssessments.ts`
- `chatbotKnowledge.ts`

All pages read from one local app store (`AppStoreProvider`) so data is consistent across flows.

## 8) Chatbot Context
- Context doc file: `CHATBOT_CONTEXT.md`
- Product update notes: `REQUIREMENTS_UPDATE_2026-03-24.md`

Chatbot capabilities in demo:
- Answer feature questions using local knowledge base
- Suggest suitable sessions based on user inputs (sport, district, budget, level)

## 9) Run Project
Requirements:
- Node.js 18+
- npm 9+

Commands:
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
npm run preview
```

## 10) Assumptions
- No real backend/database/auth.
- Current user context is mock (`player-001`, `owner-001`).
- QR is visual demo only.
- Chatbot is rule-based demo (local context), not an LLM integration.
- Assessment level is for recommendation only, not for hard access control.
