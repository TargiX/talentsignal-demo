# TalentSignal

TalentSignal is a focused full-stack demo for an HR/social discovery product at `talentsignal.us`.

It is intentionally built around the hiring brief: NuxtJS/Vue on the frontend, NestJS on the backend, MySQL persistence, plus adapters for Redis, DynamoDB, and OpenSearch. The app runs without the external services so it is easy to review, but the integration boundaries are real and ready for local Docker services.

## Live demo

- Web app: https://talentsignal.us
- API docs: https://api.talentsignal.us/docs
- API health: https://api.talentsignal.us/api/health

## Why this works for the client

- **NestJS:** feature modules, DTO validation, guard-based auth, a request interceptor, services, infra adapters, Swagger docs, and typed controllers.
- **NuxtJS:** Pinia state, component wiring, routing-ready app structure, API composable, loading/error states, and a polished product UI.
- **Social discovery domain:** discoverable profiles, intent filters, compatibility signals, match actions, moderation queue, API-backed messages, bookmarks, and realtime-ish activity.
- **Team readiness:** small modules, clear service ownership, async-friendly README, and scripts a teammate can run immediately.

## Run locally

```bash
pnpm install
pnpm dev
```

API: `http://localhost:4000`  
Web: `http://localhost:3000`
Swagger: `http://localhost:4000/docs`

In this Codex preview session the Nuxt server may be running on `http://127.0.0.1:3017/`, but the project default is port `3000`.

## Demo walkthrough

Use this path when reviewing the project as a portfolio piece:

1. Open the Discover screen and select different profiles from **Top picks**.
2. Change **Skills**, **Interests**, **Location**, **Availability**, and **Verified** filters. Empty states are handled and `Clear all` resets the feed.
3. Switch profile tabs: **About**, **Compatibility**, **Activity**, and **Portfolio** each render their own product state.
4. Use the top search for terms like `nestjs` or `figma`; it calls the search endpoint and updates the discovery list.
5. Click **Message**, edit the prefilled intro, and send it. The NestJS workspace endpoint queues the message and updates the realtime activity rail.
6. Click **Send Signal** and bookmark a profile. Both actions persist in the demo workspace state and update the activity stream.
7. Open **Review queue** from the sidebar and approve, dismiss, or escalate an item. The queue and recent decisions update through the NestJS moderation API.
8. Open **Webhooks**, **Settings**, **Activity feed**, or **API status** from the sidebar to verify secondary workspace flows.
9. Open `http://localhost:4000/docs` to inspect the NestJS API contract.

For a short client-facing review note and ready proposal answers, see `docs/client-handoff.md`.

## Architecture proof

```text
apps/web
  Nuxt 4 + Vue 3 + Pinia
  composables/useApi.ts       authenticated API client
  stores/discovery.ts         profile, health, moderation, match state
  app.vue                     social discovery product shell

apps/api
  NestJS modules              health, profiles, matches, moderation, search
  workspace/*                 demo activity, messages, signals, bookmarks
  moderation/*                API-backed review queue and decision history
  auth/demo-auth.guard.ts     guarded API surface
  common/request-context      request timing + context interceptor
  infra/*                     MySQL, Redis, DynamoDB, OpenSearch adapters
  profiles/profile.seed.ts    review-friendly fallback data
```

The app is intentionally demo-friendly: it works with seeded fallback data, but the module boundaries show where real persistence, search, and realtime infrastructure would sit.

## Portfolio checklist

- Nuxt/Vue product UI with dense dashboard-style layout.
- Working filters, top search, selected profile state, profile tabs, empty states, API-backed message flow, signal flow, bookmark state, moderation review flow, sidebar workspace navigation, and realtime activity updates.
- NestJS API with modules, controllers, DTO validation, guard, interceptor, Swagger, and infra adapters.
- Async-team friendly code organization and setup instructions.
- Domain-ready deployment plan for `talentsignal.us` and `api.talentsignal.us`.

Optional services:

```bash
docker compose up -d mysql redis dynamodb opensearch
```

The API falls back to seeded data if MySQL or search services are not running, which keeps review friction low. The SQL schema lives in `apps/api/sql/schema.sql`.

## Domain plan

`talentsignal.us` is the canonical portfolio/demo domain for the TalentSignal product slice. Recommended deployment split:

- `talentsignal.us` -> Nuxt frontend
- `www.talentsignal.us` -> Nuxt frontend
- `api.talentsignal.us` -> NestJS API and Swagger docs at `/docs`

DNS records for the current Namecheap registrar DNS setup:

```text
A      @     76.76.21.21
A      www   76.76.21.21
A      api   76.76.21.21
```

The web build uses `https://api.talentsignal.us` as the primary API host and temporarily falls back to `https://api.charforge.art` while registrar DNS is still propagating.

## Proposal answers

**A brief overview of your experience with NestJS**  
I work comfortably with NestJS modules, controllers, DTO validation, guards, interceptors, provider-driven service layers, and integration boundaries. This demo shows those patterns in a social discovery context, including auth guards, request telemetry, Swagger, MySQL-backed repositories, and service adapters for Redis/OpenSearch/DynamoDB.

**An example of a project where you worked closely with another developer**  
I am used to shared ownership: small PRs, clear contracts between frontend/backend, pair reviews on route/API behavior, and async updates that let teammates keep moving. For this project shape, I would usually align on DTOs first, wire the Nuxt state/API client against those contracts, then review edge cases together before broadening the feature.

**Your availability to start**  
I can start ASAP and work 30-40 hours/week with Discord/GitHub/Jira as the daily loop.

**A brief overview of your experience with NuxtJS**  
I am comfortable with Nuxt/Vue component composition, composables, Pinia state, route-aware UI, API integration, loading/error states, SSR/SPA tradeoffs, and working from an established template without trying to redesign the product.
