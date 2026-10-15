---
applyTo: 'supabase/**'
---

# Supabase

- Every table has RLS enabled and no policy for the `anon` role.
- Functions are `security definer` with `set search_path = public`, and check `auth.uid()`, the user's role and the edition state.
- Every migration has its own pgTAP test in `supabase/tests`.
- Migration file names use a timestamp and a description (e.g. `20261015120000_add_assignments_table.sql`).
- Edge Functions are written in Deno and validate both the input and the JWT.
