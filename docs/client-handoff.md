# TalentSignal Client Handoff

## One-line pitch

TalentSignal is a full-stack HR/social discovery demo built to match the requested stack: Nuxt/Vue product UI, NestJS API architecture, SQL-ready persistence, and clear integration points for Redis, DynamoDB, and OpenSearch.

## What to review first

1. Open the app at `http://localhost:3000` or the active preview URL.
2. Use the Discover filters, top search, profile selection, tabs, message flow, signal action, and bookmark action.
3. Open sidebar sections like **Review queue**, **Activity feed**, **Webhooks**, **Settings**, and **API status**.
4. Open Swagger at `http://localhost:4000/docs`.
5. Scan `apps/api/src` for NestJS modules, guards, DTOs, services, and infra adapters.
6. Scan `apps/web/app.vue`, `apps/web/stores/discovery.ts`, and `apps/web/composables/useApi.ts` for Nuxt/Vue state and API integration.

## Why it maps to the job

- **NestJS:** modules, controllers, DTO validation, guarded routes, request interceptor, service boundaries, Swagger docs.
- **NuxtJS / Vue:** component wiring, Pinia state, API composable, loading/error states, dense product UI, interactive workflows.
- **SQL comfort:** MySQL adapter and schema are included, with seeded fallback data for easy review.
- **Search and realtime shape:** top search, workspace activity, OpenSearch, Redis, and DynamoDB adapters are represented behind service boundaries without blocking local setup.
- **Workflow depth:** messages, signals, bookmarks, notification count, and activity feed are API-backed demo processes instead of static UI.
- **Operations depth:** the sidebar opens working demo sections, including API-backed moderation review decisions and secondary workspace settings.
- **Small-team readiness:** the repo is easy to run, the walkthrough is explicit, and feature areas are split in a way another developer could pick up quickly.

## Proposal answers

**A brief overview of your experience with NestJS**  
I am comfortable building NestJS APIs with feature modules, controllers, DTO validation, guards, interceptors, provider-based services, Swagger docs, and clean integration boundaries. This demo shows those patterns in a social discovery domain.

**An example of a project where you worked closely with another developer**  
I work well in shared ownership: agreeing on API contracts early, keeping PRs focused, pairing on edge cases, and giving async updates that make it easy for another developer to review or continue the work.

**Your availability to start**  
I can start ASAP and support 30-40 hours/week with Discord, GitHub, Jira, and Upwork time tracking.

**A brief overview of your experience with NuxtJS**  
I am comfortable with Nuxt/Vue component composition, composables, Pinia state, route-ready UI, API integration, loading/error states, and working inside an existing template without unnecessary redesign.
