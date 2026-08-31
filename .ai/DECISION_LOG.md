# Decision Log

## 2026-08-28 — Species grouping for SEO

1. Admin hierarchy is `Category → Base Species → Variant`, not a flat 486-row list.
2. “Family” is not used for this product grouping because Family is a biological taxonomic rank.
3. Stable `catalog_key` (`sp_xxxx`) remains the record identity; Base Species grouping is an additional content-management layer.
4. First-pass grouping uses explicit scientific-name evidence: exact scientific name, `var.`, cultivar quotes, and `wild type`.
5. Ambiguous data must fail closed; grouping is not allowed to silently rewrite Product Truth.
6. Groups whose members disagree on category are marked `需复核` and cannot use batch SEO writes.
7. Batch SEO may change SEO Title, Meta Description and H1 templates only; water parameters, compatibility and other Product Truth are outside its authority.
8. Batch output is Draft-only. If any selected row is already Published, bulk overwrite is blocked until true versioned Draft/Publish is implemented.
9. Similar variants may share a Base Species template, but each variant can later add an override. Full duplicate copy generation is not the target architecture.
10. Not every catalog variant is automatically an indexable SEO page; canonical/noindex strategy will be decided in a later SEO strategy phase.

## Existing Admin safety decisions retained

- One monorepo, isolated `apps/admin-content` companion app.
- Supabase Auth + `user_roles` + RLS enforce admin access.
- No service-role key in browser code.
- Remote Preview is read-only and noindex.
- No merge to `main` and no Production Supabase migration without explicit later approval.

## 2026-08-28 — Base inheritance, not bulk text duplication
- Base Species owns shared SEO templates and shared editorial intro.
- Variant rows store only explicit overrides/differences; blank override means inherit Base.
- Batch selection creates Draft shells only; it must not materialize copied Base Title/Description/H1 into every Variant row.
- Effective SEO is resolved at read/preview time: `Variant Override ?? Base Template`.
- This reduces future maintenance: changing shared wording once updates all non-overridden Variants.
- Category-conflict groups remain publish-blocked even if the inheritance UI can render them.

## 2026-08-28 — Bilingual SEO translation workflow
- UI i18n and Species content localization are separate concerns; this Admin milestone manages localized content rows.
- Chinese remains the source editorial locale; English is an independent Draft/Publish lifecycle, not an in-place replacement.
- Borrow Payload CMS's locale-specific content model and Tolgee's suggestion/context/review workflow without adding either platform as a runtime dependency.
- AI translation is suggestion-only and Draft-only. Human review is the publication gate.
- Empty Variant Overrides remain empty after translation so inheritance is preserved instead of materializing Base content into every Variant.
- Scientific names, catalog keys and `{{template_tokens}}` are protected; token mismatch fails closed.
- English common/display names live in `species_seo.localized_name`; Product Truth names remain untouched.
- Published English cannot be silently overwritten until versioned Draft/Preview/Publish is implemented.

## 2026-08-28 — Public Species route / indexing contract
- Reuse the existing AquaGuide multilingual SEO pattern: English default path, Chinese `/zh/`, reciprocal hreflang, English `x-default`.
- Base Species is a content-inheritance layer, not automatically a public landing page.
- Variant/public page identity uses stable Base Scientific Name slug + `catalog_key`; translated/common names do not control URLs.
- New Species SEO is `noindex` by default. A catalog row existing does not imply Google should index it.
- `canonical_to_sibling` is a manual SEO decision and the Admin only offers targets inside the same Base Species group.
- Category-conflict groups and suspected duplicates fail closed for independent Index until reviewed.
- Canonical URLs are derived from the route contract, not free-text editorial fields.
- Published remains disabled after generator verification until revision/rollback and staging publication are proven end-to-end; a local generator alone is not a release signal.


## 2026-08-28 — Fail-closed Species static publishing generator
- The generator consumes an explicit publication snapshot; it does not query Production Supabase and never writes into `public/` implicitly.
- Accepted snapshot environments are `local`, `test`, `preview` and `staging`; `production` is rejected by code.
- Generation requires a Published Variant and same-locale Published Base row plus non-empty editorial title/meta/H1/intro; English additionally requires `localized_name`.
- Index/canonical safety is revalidated at build time, not trusted from the Admin UI. This protects against direct database writes or future UI regressions.
- Only self-canonical `index,follow` pages enter the Species sitemap. Canonical-to-sibling and noindex pages are emitted only when explicitly present in the snapshot and are omitted from sitemap discovery.
- Runtime regression is part of `test:contract`; it verifies HTML language, title, meta, H1, robots, canonical, hreflang/x-default and sitemap membership.

## 2026-08-28 — Revision history and rollback safety
- Every Base Species and Variant insert/update/delete is captured by database trigger in `content_revisions`; history is not a browser-only undo stack.
- Revision rows are admin-readable only through RLS and are not directly writable by authenticated clients.
- Rollback is a guarded SECURITY DEFINER RPC that re-checks `is_admin()`.
- A rollback always restores as Draft, clears `published_at`, and records a new `rollback` revision pointing to its source revision. Rollback is never a republish mechanism.
- The Admin requires a second click before executing restore, but database authorization and Draft coercion remain the real safety boundary.
- Local verification alone is insufficient for release: the same chain must also pass on the pinned GitHub Actions ephemeral Supabase gate. A persistent Supabase development branch is optional, not required.

## 2026-08-28 — Staging identity is part of the publishing contract
- A non-production snapshot flag alone is insufficient; the database project identity and public canonical host must also be explicitly non-production.
- Staging export therefore requires an expected staging Supabase project ref plus a Production project-ref deny-list.
- Staging page verification requires a staging public URL plus a Production public URL deny-list.
- The static generator no longer has a Production site URL fallback. Omitting `siteUrl` is an error.
- A release-gate PASS requires at least one bilingual self-canonical Index pair; zero Published rows or no bilingual pair is a hard failure.
- Existing unrelated staging projects must not be reused across AquaGuide/IceGlide merely to avoid provisioning cost or setup time.

## 2026-08-28 — Staging schema proof must not require privileged data access
- Release verification may expose a data-free schema readiness RPC to anon/authenticated, but must not grant anon access to `content_revisions` or admin write paths.
- The readiness probe is authoritative only when all expected flags are true and `schema_version >= 6`; otherwise staging publication fails closed.

## 2026-08-28 — A+B stable development model
- Use B (Mac local Supabase) for fast iteration and A (GitHub Actions ephemeral Supabase) as the reproducible release gate.
- A and B must execute the same `test:supabase-gate` command; do not maintain separate local/CI database logic.
- CI versions are pinned instead of `latest`: Ubuntu 24.04, Node 24.14.0, Supabase CLI 2.115.0, npm lockfile via `npm ci`.
- CI has `contents: read` only and receives no Production Supabase or Vercel deployment credentials.
- The temporary database loads only core schema + current Admin migrations 001–007 to avoid unrelated historical migration conflicts; extend this explicit allow-list intentionally when a new Admin migration is added.
- Test fixture preparation may use the ephemeral PostgreSQL superuser, but all product behavior assertions must run through normal Supabase JWT/RLS clients.
- A paid persistent Supabase development branch is optional, not a prerequisite for current Admin validation.

## 2026-08-28 — Ready is not Production Published
- After A+B passed, the next state is `publish-ready` / Preview eligibility, not automatic Production publication.
- Data-quality review decisions are first-class release inputs; category conflicts and duplicate candidates remain fail-closed until a human decision is recorded.
- Preview Publish must reuse the same generator and A+B verification path as release safety; no parallel publishing implementation.
- Persistent paid staging is optional convenience, not a release requirement.


## 2026-08-28 — Publish readiness is database-backed, not a UI badge
- Editorial review state is stored on both Base and Variant rows and is separate from `draft/published/archived`.
- `approved` is invalidated by any editorial or indexing change at the PostgreSQL trigger layer; browser state is not trusted.
- Rollback always restores `draft + editing`; historical approval is evidence of an older revision, not approval of restored content.
- Data-quality decisions live in `species_data_reviews` and never rewrite Product Truth from this Admin.
- Duplicate review may designate one canonical catalog key; only that reviewed canonical may independently Index while confirmed duplicates must canonicalize or remain noindex.
- Public generation may read only the minimal review-resolution RPC, never admin notes or reviewer identity.
- Base Species authoring applies to all 276 groups, including single-member groups, so generator requirements and editor capabilities stay consistent.
- `publish-ready` means eligible for Controlled Preview Publish only; Production Published remains a distinct later approval.


## 2026-08-28 — Controlled Preview Publish is intentionally non-indexable
- Preview may consume Approved Draft content; release/staging continues to require Published content.
- The same static generator is reused with an explicit Preview mode; do not create a second renderer.
- Preview actual robots are always `noindex,nofollow` regardless of intended future Index strategy. Planned robots remain visible in preview metadata/banner for editorial review.
- Preview writes `robots.txt` with `Disallow: /` and intentionally omits the release Species sitemap.
- Preview output may not target root/app `public/` or Admin `dist/`; accidental deployable output is a hard error.
- Preview requires explicit selected catalog keys so an approval state cannot silently generate every Species.
- Admin Preview Snapshot export strips reviewer identity and review notes; only minimal review resolutions are carried into generation.

## 2026-08-30 — AI Studio is visual source, AquaGuide Admin remains logic authority
- `chusday97/aqua-fronted-cms` is accepted only as a UI/reference source for layout, spacing, navigation and preview presentation.
- Do not merge its mock domain model, random preview tokens, fake `preview.aquaguide.co` URLs, client-side Data Review resolution, client-side Publish Readiness or delete handlers into the real Admin.
- The authoritative logic remains `aquaguide-tank-guide/feature/admin-content-v0`: Supabase RLS, migrations, Base/Variant inheritance, revision/rollback, Data Review decisions, readiness assessment and static generator.
- The persistent workspace rule is `left = choose content`, `center = edit`, `right = live frontend result`.
- Base Species and Variant are distinct editor contexts. A Base parent click edits shared content; a Variant child click edits only that page's overrides.
- Secondary systems (Data Review, readiness details, translation, history, batch queues) should use progressive disclosure and must not displace the primary editor/preview relationship.
- Product Truth facts in the preview must come from the catalog projection and remain read-only; the UI may not invent missing water/tank/difficulty values.

## 2026-08-31 — Interface language and content language are separate
- `appLocale` is a presentation preference for Admin chrome, navigation, controls and system messages.
- `contentLocale` is an editorial state for Species SEO content and the live public-page preview.
- Changing interface language must never silently mutate or switch unsaved content.
- The interface preference persists in localStorage; content locale remains explicit per editing session.
- Do not introduce a heavy i18n dependency until the lightweight dictionary becomes materially difficult to maintain.
- Product Truth preview data stays outside Species Group JSON and is loaded on demand from the existing catalog projection.

## 2026-08-31 — Preview Inspector is mapped, not freeform
- Treat the right pane as a real frontend preview with an optional inspection overlay, not as a WYSIWYG DOM editor.
- Use a stable element registry to map center fields to preview elements and preview elements back to center fields.
- Center focus/edit may switch Preview mode and scroll/highlight the mapped element. Preview click selects/highlights and locates the editor field, but does not immediately force text input focus.
- Product Truth may be inspectable for explanation but remains read-only; Inspector must never create a hidden Product Truth edit path.
- Workflow status colors are semantic and restrained: Data Review amber, Awaiting Review blue, Preview-ready green.
## 2026-08-31 — Preview Inspector uses a stable registry, not ad-hoc DOM editing
- `editorElementRegistry.js` is the mapping authority for editor ↔ preview elements.
- Preview click selects/navigation only; it never directly mutates content and never auto-focuses the editor input.
- Product Truth elements are inspectable read-only and cannot acquire fake SEO controls.
- Base/Variant routing is source-aware so the UI does not imply that a Base field changes an already-custom Variant override.
## 2026-08-31 — Inheritance is a state, not an empty input
- Default inherited fields display the effective Base value instead of an empty editable control.
- Override is explicit and local to the Variant.
- Returning to Base means clearing the override, never copying Base text into Variant storage.

## 2026-08-31 — Secondary tools are non-modal editor drawers
- Decision: secondary workflows overlay only the center editor grid cell, never the persistent live Preview.
- Reason: Data Review/History/Translation are contextual operations; expanding them inline distorted the main editing flow and hid the edit-to-preview relationship.
- Drawer is intentionally `aria-modal=false`: right Preview remains inspectable. Editable Preview selection closes the drawer and returns to the field; Product Truth stays read-only.
- Species SEO UI exposes only Draft/Published. Do not surface the legacy shared enum value `archived` in this Admin.

## 2026-08-31 — Live Preview follows publication structure
- Decision: the Page tab is a visual projection of `generate-public-species.mjs`, not an independent mock page.
- Shared presentation labels/localization live in `speciesPagePresentation.js` and are imported by both generator and Admin Preview.
- Do not add content sections to Page Preview unless the generator publishes them.
- Below 1180px, preserve Preview through a compact overlay rather than forcing a clipped third column or removing Preview access entirely.

## 2026-08-31 — Primary editor progressive disclosure
- Decision: hide low-frequency Focus Keyword / indexing / canonical / URL controls behind Advanced SEO; automatically open only when an index/canonical blocker needs action.
- Decision: replace repeated lifecycle/inheritance pills with one calm status line and field-level inheritance controls.
- Decision: Preview Inspector click resolves editing ownership before routing. Inherited Base-owned fields route to Base Species; Variant-only/custom fields route to Current page; editor-field focus itself never changes scope.

## 2026-08-31 — Keep low-frequency SEO progressive
- Removed duplicate Variant header status badges in favor of one lifecycle/review summary.
- Advanced SEO is now the single home for keyword/index/canonical/route controls.
- Chromium 1440×900 measured ~936px default editor height; Intro Inspector mapping PASS; pageErrors=[]; B gate PASS.

## 2026-08-31 — Use explicit state-control language
- Base and Variant footer selects now identify review vs content lifecycle explicitly and share the same semantic tones.
- Browser regression: header summary PASS, Preview remains visible, pageErrors=[]; contract/build/B gate PASS.

## 2026-08-31 — One selection language, separate read-only language
- Decision: use one shared selection token family across left navigation, center editor Inspector and right live Preview.
- Decision: Product Truth read-only elements must never use editable green; they use a separate graphite read-only tone.
- Decision: selecting a Variant may emphasize its parent Base relationship, but must not give the Base the same strong active-row treatment.

## 2026-08-31 — Workflow color semantics must travel with the state
- Decision: Data Review issue = amber, editorial review = blue, Preview-ready = green in both top workflow status and left navigation filters.
- Decision: workflow-filter labels follow `appLocale`; do not hardcode mixed Chinese/English labels.

## 2026-08-31 — Navigation counts must state their unit
- Decision: the left Species tree navigates Base groups, so `All` counts Base groups, not raw catalog rows.
- Decision: workflow counts may use their native units (issues/items/pages), but hover help and active banners must make the unit explicit.

## 2026-08-31 — Live Preview must not imply persistence
- Decision: live Preview remains immediate, but every unsaved Base/Variant edit must be visibly marked until a database save succeeds.
- Decision: destructive editor navigation requires explicit discard confirmation; UI-only language switching remains independent.
- Decision: no-op navigation must never mutate parent dirty state. Child editor lifecycle, not navigation helpers, resets dirty state after a real editor-context change.

## 2026-08-31 — Workflow labels are derived UI, not state
Do not persist translated display strings in workflow filter state. Filter state stores semantic keys/status; visible labels are derived from the current interface locale so the global language switch updates active filters immediately.
