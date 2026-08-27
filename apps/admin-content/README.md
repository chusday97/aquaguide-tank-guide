# AquaGuide Content Admin V0

Isolated companion app for editing Species SEO content. It lives in the same monorepo but is not mounted into the public AquaGuide web app.

## Safety boundary

- Branch-only prototype: `feature/admin-content-v0`.
- Do not merge or deploy to production yet.
- Uses only `VITE_SUPABASE_URL` and the browser-safe anon key.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to this app.
- Admin authorization is enforced by the existing `user_roles` table and database RLS, not by hiding the URL.
- The `species_seo` migration in this branch is code-only until explicitly applied to a non-production database.

## Run locally

From the repository root:

```bash
npm install
npm run dev -w @aquaguide/admin-content
```

Open `http://localhost:3010`.

## V0 scope

1. Supabase email/password sign-in.
2. Verify the signed-in user has `user_roles.role = admin`.
3. Read Species from the existing `species` table.
4. Search and select a Species.
5. Edit SEO title, meta description, H1, intro, image alt, canonical path and focus keyword.
6. Preview a search-result snippet.
7. Save SEO content to the branch-defined `species_seo` table once its migration exists in the target environment.
8. Explicitly surface a schema-not-ready state rather than silently failing.

Not included yet: image upload, history/rollback UI, bulk editing, Search Console, AI generation, production deployment, or changes to the public Species page.
