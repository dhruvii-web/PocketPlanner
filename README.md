# Pocket Planner

Pocket Planner is a Vite + React frontend with an Express + MongoDB backend for expense tracking, goals, trips, splits, and payment connections.

## Local setup

1. Copy [.env.example](.env.example) to `.env` and set `VITE_API_URL`.
2. Copy [server/.env.example](server/.env.example) to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and any payment provider keys you actually use.
3. Run the frontend with `npm run dev`.
4. Run the backend from `server/` with `npm run dev`.

## Deployment

The frontend is ready for Vercel or Netlify. Set `VITE_API_URL` to your deployed API base URL before building.

- Vercel: use [vercel.json](vercel.json) and deploy the project root as a static Vite app.
- Netlify: use [netlify.toml](netlify.toml) and deploy the `dist` directory produced by `npm run build`.

The Express backend should be deployed as a separate Node service with the values from [server/.env.example](server/.env.example). The payment layer currently supports provider metadata plus bank presets for SBI and common Indian banks, while live bank/card linking still depends on your chosen provider credentials.

For real SMS invites, set the Twilio variables in [server/.env.example](server/.env.example). For PocketGuide trip AI, set `GEMINI_API_KEY`.
