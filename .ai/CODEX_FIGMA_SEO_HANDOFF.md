# Codex Handoff — AquaGuide Figma / Species SEO

Updated: 2026-08-28
Branch: `feature/admin-content-v0`
Repository: `chusday97/aquaguide-tank-guide`

## 1. Immediate mission

Take over the AquaGuide Species SEO design work in Figma through Figwright. The current Figma draft already contains desktop and mobile Fish Landing frames. Do **not** redesign from scratch. First read the current selected frames, preserve the existing AquaGuide visual language, then improve the page system in coherent batches.

Current phase is **design continuation / validation first**. Do not merge to `main`, do not write Production Supabase, and do not deploy Production while this Figma round is being refined.

## 2. Required context to read before changing anything

Read these repository sources first:

- `.ai/CURRENT_GOAL.md`
- `.ai/TASK_QUEUE.md`
- `.ai/DECISION_LOG.md`
- `CONTRACT.md`
- `HANDOFF.md`
- `PROGRESS.md`
- `PROJECT_STRUCTURE.md`
- relevant `docs/rules/`, `docs/cases/`, `docs/decisions/`
- current Species / Encyclopedia / Aquarium code only as needed to understand existing product behavior

Do not treat `PROGRESS.md` as source of truth where it conflicts with contracts/decisions.

## 3. Current implemented Admin / SEO state

The isolated `apps/admin-content` companion app already includes or has decisions for:

- Supabase Auth + admin role + RLS
- Category → Base Species → Variant hierarchy
- 486 source catalog rows projected into 276 Base Species groups + Variant members
- Base Species shared SEO inheritance + Variant Override
- review queues for category conflicts and suspected duplicates
- Chinese source editorial workflow with separate English Draft lifecycle
- deterministic route/canonical/hreflang/index/noindex contract
- static Species generator and runtime SEO/sitemap verification
- revision history + rollback safety
- staging-only publish verification / production deny-lists

Published remains fail-closed until a real dedicated AquaGuide staging Supabase and staging host pass the verifier.

## 4. Product requirements already agreed in conversation

### Species grouping

- The Admin/content model is `Category → Base Species → Variant`, not a flat fish list.
- Similar variants share Base Species content where appropriate.
- Variants store only explicit differences/overrides; blank override inherits Base content.
- Do not duplicate the full Base copy into every Variant.
- Cross-category conflicts and suspected duplicates must be visibly review-blocked.

### SEO authority boundary

Batch SEO may operate on editorial SEO fields such as:

- SEO Title
- Meta Description
- H1

It must **not** rewrite Product Truth such as water parameters, compatibility, size, temperament, safety logic, or catalog identity.

Not every Variant automatically deserves an indexable landing page. Index/noindex/canonical decisions are explicit SEO decisions.

### Localization

- Chinese is the source editorial locale for this phase.
- English is a separate localized Draft/Publish lifecycle, not an in-place replacement.
- AI translation is suggestion-only; human review is the publication gate.
- Scientific names, `catalog_key`, and template tokens must be preserved.

### Admin UX requirements

The Admin needs to support, visually and structurally:

- login-protected admin access
- Category / Base Species / Variant navigation and filtering
- Base shared content vs Variant override distinction
- batch SEO operations for safe fields
- Draft / Preview / Published state clarity
- data-quality blockers and review status
- Chinese → English suggestion/review flow
- version/revision history and rollback visibility
- a clear preview of how entered SEO/content changes will affect the public Fish Landing page
- desktop and mobile public-page preview

The preview requirement is important: an editor should not have to imagine what the final page will look like after filling the Admin form.

## 5. Current Figma direction

The existing Figma draft already has Desktop and Mobile Fish Landing frames. Preserve the current AquaGuide direction rather than introducing a new brand system.

Current visual direction visible in the draft:

- restrained white / warm-off-white surfaces
- deep aquarium green as the primary emphasis color
- pale aqua/mint information cards
- editorial, content-first layout rather than dashboard-heavy styling
- desktop and mobile versions of the same narrative
- Fish Landing is meant to answer more than “what fish is this”; it should help a user judge whether the fish is appropriate for their aquarium

The page should be designed as a reusable Species SEO template, not as a one-off static marketing page.

## 6. Public Fish Landing design goals

The Figma refinement should make the information hierarchy support both user intent and SEO without becoming a long undifferentiated article.

The system should clearly make room for:

- species identity / common name / scientific name
- fast suitability summary
- essential husbandry facts
- aquarium-fit / compatibility judgment entry points
- distinction between shared Base Species information and Variant-specific differences
- related variants / sibling discovery where appropriate
- internal navigation / related Species links where useful
- clear primary actions connected to AquaGuide product flows
- editorial sections that can support search intent without overwhelming the first screen
- deterministic desktop/mobile responsive behavior

Do not fabricate biological facts inside Figma. Use placeholders or existing verified Product Truth where the exact copy is not available.

## 7. Figwright status

Figwright Figma Development Plugin v0.4.0 has been installed and the Figma plugin currently shows `Connected` on local port `3055`.

Codex MCP config has been prepared at `~/.codex/config.toml` with:

```toml
[mcp_servers.figwright]
command = "/usr/local/bin/npx"
args = ["-y", "@figwright/mcp@latest"]
```

When Codex starts a fresh session:

1. Verify that the `figwright` MCP tools are exposed.
2. Run the Figwright ping/connection check.
3. Read the currently selected Figma frames before modifying anything.
4. If the frames are readable, audit the current structure and components first.

## 8. First execution batch

Do this as one coherent batch rather than stopping after every tiny edit:

1. Verify Figwright connection.
2. Read the selected Desktop + Mobile Fish Landing frames.
3. Inventory frames, sections, components, text styles, spacing, repeated patterns, and responsive differences.
4. Identify the most important hierarchy/UX/SEO-template problems in the current draft.
5. Duplicate or otherwise preserve the current draft before destructive changes.
6. Refine the Figma design while preserving the AquaGuide design language.
7. Ensure Desktop and Mobile represent the same information architecture rather than two unrelated layouts.
8. Produce a concise change summary and list unresolved product/content questions.
9. Update `.ai/CURRENT_GOAL.md`, `.ai/TASK_QUEUE.md`, and relevant execution/change logs after meaningful progress.

## 9. Hard constraints

- Do not merge this work into `main` without explicit approval.
- Do not modify Production Supabase.
- Do not deploy Production.
- Do not silently change compatibility / safety / biological Product Truth.
- Do not make every Variant independently indexable by default.
- Do not flatten Base Species and Variant into duplicate pages.
- Do not let AI translation overwrite reviewed Published content.
- Do not replace the current visual language with a wholesale redesign unless explicitly requested.
- Avoid one-change-one-stop behavior; work in meaningful batches and checkpoint after a coherent unit of progress.

## 10. Definition of a successful Figma handoff round

A successful first round means Codex can:

- demonstrably read the current Figma frames through Figwright,
- explain the existing page system accurately,
- improve the Fish Landing template without destroying the existing AquaGuide identity,
- show a consistent Desktop + Mobile design,
- make Base-vs-Variant and suitability intent clearer,
- leave a traceable handoff in `.ai/` for the later implementation phase.

Only after the Figma direction is approved should implementation work be planned against the isolated Admin/public Species branch.