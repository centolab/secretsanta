---
applyTo: 'src/**'
---

# App (src/)

- No business logic in components: it lives only in hooks and functions under `src/features/<area>`.
- All writes go through RPC functions, wrapped by typed functions in `src/features/<area>/api.ts`.
- TanStack Query cache keys use the format `['area', id, ...]`.
- Every interactive element has an `accessibilityLabel` in Italian, taken from `src/i18n/it.ts`.
- Colors and spacing come only from the theme (`src/constants/theme.ts`), never hard-coded.
