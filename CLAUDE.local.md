# Project-local Rules

## Project identity
- Project: template-b-poc-dev
- Repo: https://github.com/bysontech/template-b-poc-dev
- Owner/Brand: BysonTech

## Tech stack (brief)
- Cloudflare Pages + Vite + React + TypeScript + PWA (vite-plugin-pwa) + IndexedDB (Dexie)

## Allowed change areas
- Safe paths: src/, public/, docs/, .github/, scripts/
- Avoid paths (touch only if asked): (none)

## Commands (must be accurate)
- Install: npm ci
- Lint: npm run lint
- Typecheck: npm run typecheck
- Test: npm test
- Build: npm run build

## Definition of Done
- CI passes
- No secrets added
- PR includes summary + how-to-test
- Docs updated if behavior changes

## Notes
- Template B: Client-only PWA (no server/Workers)
- Data stored locally in IndexedDB via Dexie
- No external API key handling (use Template C if needed)
