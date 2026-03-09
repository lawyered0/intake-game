# Lawyered's Intake Training Fun Game

Static browser game for law students and junior lawyers. The player works multiple intake days at a small firm, chooses `Accept`, `Decline`, or `Request More Info`, and gets immediate feedback on why the signal pattern mattered.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Static JSON content validated with `zod`
- Vitest + Testing Library

## Scripts

```bash
npm run dev
npm run lint
npm run audit:content
npm test
npm run build
```

## Routes

- `/` landing page
- `/play/[dayId]` dynamic intake-day route

## Project shape

- `app/` app routes and global styling
- `components/intake/` gameplay UI
- `data/intake/` authored intake days
- `lib/` schema validation, state logic, and scoring
- `scripts/audit-intake-content.mjs` quick content QA report
- `types/` shared TypeScript types
- `tests/` schema, content, engine, and flow coverage

## Notes

- The app is static. There is no backend, auth, or database.
- The app uses `localStorage` for persistent best-score progress, with migration from the older session-only storage.
- Each day ships with 10 files: 3 `Accept`, 4 `Request More Info`, and 3 `Decline` best-path outcomes.
- There are 3 authored days and 30 total scenarios.
- Scorecards include a built-in share action for copying or sharing your result.
- The old negotiation spec remains in the repo as historical reference only.
