# Pocket Planner

Pocket Planner is a full-stack personal finance and travel planning platform built with React, Express, and MongoDB. It combines expense tracking, linked bank and card accounts, AI-assisted trip planning, family connection flows, split expenses, and PocketGuide support in one production-ready app.

## What It Does

- Track income and expenses in MongoDB.
- Link bank accounts and cards, including SBI and popular Indian banks.
- Send SMS-based connection invites for family and payment contacts.
- Plan group trips with invitees, a shared trip chat, and a PocketGuide AI assistant.
- Split bills, manage goals, and view analytics from protected API routes.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Express, MongoDB, Mongoose, JWT auth
- Integrations: Twilio-ready SMS invites, Gemini-ready PocketGuide AI, deployment config for Netlify and Vercel

## Local Setup

1. Copy [.env.example](.env.example) to `.env` and set `VITE_API_URL`.
2. Copy [server/.env.example](server/.env.example) to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and any provider keys you want to use.
3. Install dependencies with `npm install` in the root and `npm install` in `server/`.
4. Run the frontend with `npm run dev`.
5. Run the backend from `server/` with `npm run dev`.

## Deployment

Frontend deployment is supported on Netlify and Vercel.

- Netlify: deploy the root project with [netlify.toml](netlify.toml) and publish `dist`.
- Vercel: deploy the root project with [vercel.json](vercel.json).

Backend deployment should be a separate Node service connected to MongoDB and configured with the values from [server/.env.example](server/.env.example). Set `VITE_API_URL` to the deployed backend before building the frontend.

## Production Notes

- The app now uses Mongo-backed APIs instead of local-only state for the core finance and account flows.
- IntelliTrack exposes a linked account panel for bank and card records in the UI.
- Live bank aggregation still depends on your chosen banking provider credentials.
- SMS invites require Twilio variables, and PocketGuide AI requires `GEMINI_API_KEY`.

## Resume Highlights

- Built a full-stack finance planner with authenticated CRUD, analytics, and deployment-ready configuration.
- Added Mongo-backed linked bank/card accounts and transaction sourcing.
- Implemented trip collaboration with SMS invites, chat, and AI-assisted planning.
- Prepared the app for Netlify/Vercel frontend deployment and separate backend hosting.
