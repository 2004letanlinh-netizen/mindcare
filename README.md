# MindCare

Starter project for an anonymous mental-health support platform. The current foundation includes a static HTML/CSS/JavaScript frontend, an Express API, Supabase Auth/Database wiring, daily check-ins, and a moderated community-post flow.

## Requirements

- Node.js 20 or newer
- A Supabase project

## Start locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`, then add your Supabase project URL and **anon/publishable key**.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Run `npm run dev` and open `http://localhost:3000`.

The Supabase service-role key must never be put in `.env` for this app or exposed to the browser. The API uses the anon key and verifies member access tokens; database access is constrained by Row Level Security.

## Project map

```text
public/                 Static frontend (HTML, CSS, browser ES modules)
  js/pages/              Dashboard, community, check-in, library and sign-in screens
server/src/
  config/                Supabase client configuration
  middleware/            Authentication and error handling
  routes/                Health, auth, posts and check-in API routes
supabase/schema.sql      Initial tables, constraints, RLS and profile trigger
```

## API starter

- `GET /api/health`
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/posts`, `POST /api/posts` (new posts enter moderation as `pending`)
- `GET /api/check-ins`, `POST /api/check-ins` (one check-in per member per day)

Anonymous posts deliberately store `author_user_id = null`. This makes them unlinkable to a profile through the post row, including after publication. Do not add IP/device logging or expose database identifiers in public post responses if the product promise is complete anonymity.

AI risk detection, AI moderation, clinician recommendations, follows/friends, reputation rules, reports, weekly summaries/PDF export, panic escalation, and audio uploads are product extensions, not implemented clinical features in this starter. Treat check-ins and wellness content as supportive tools, not diagnosis or emergency care. Review privacy, consent, security, and clinical safety before a public launch.
