# AquaGuide Care Decision Badcases — 2026-08-16

> Executable correctness failures found while closing the read-only Care decision path. Draft/CI success is not production rollout.

| Badcase | Status | Guard / consequence |
|---|---|---|
| `WATER-TEXT-001` bare `蝶鱼` substring inside freshwater common name `蝴蝶鱼` creates saltwater certainty | ✅ fixed #57 | ambiguous text token removed; explicit freshwater evidence for `Pseudogastromyzon fangi`; regression protects true marine butterflyfish |
| `WATER-CATEGORY-001` known Lake Tanganyika freshwater cichlids retain `category='海水鱼'` | ✅ fixed #58 | corrected 3 catalog rows + explicit freshwater taxon evidence + general reviewed-freshwater/marine-category contradiction invariant |
| `EVIDENCE-FIXTURE-002` lionfish regression dynamically chooses the first record that appears Small+marine, allowing another classification bug to validate the test | ✅ fixed | control pinned to audited `sp_0297` Pseudochromis marine record |
| `EVIDENCE-TEXT-001` display name is inserted into an unescaped RegExp and parentheses change test meaning | ✅ fixed | evidence assertion uses literal string inclusion instead of `new RegExp(displayName)` |
| `CARE-CERTAINTY-001` destination aquariums are supplied before canonical Care hydration is proven | ✅ staged correctly | #59 intentionally omitted `allAquariums`; only #60 enables it after #34 merged-tree hydration + unknown-facts contracts passed |
| `CARE-BROWSER-001` browser test assumes a meta/design CTA label instead of the real product text | ✅ fixed | locator uses real `开始快速检查`; product code unchanged |
| `CARE-BROWSER-002` Playwright answer locator depends on Tailwind wrapper depth | ✅ fixed | verify both real question texts and select exact answer buttons without structural parent chaining |
| `CARE-READ-001` modules are green but user cannot traverse Quick Diagnosis → conflict → comparison → destination | ✅ closed | standalone production-preview browser Golden Path passed, then same script passed on disposable canonical merged tree |
| `CARE-MUTATION-001` executable relocation UI exists before atomic backend semantics | 🟡 prevented by design | #59/#60/#61 remain read-only; next step is backend mutation contract before any “move now” button |

## Browser acceptance interpretation

The browser Golden Path proves **reachability and read-path composition**, not production cloud rollout.

It verifies:
- real Care entry CTA;
- real user choices/questions;
- base diagnosis remains visible;
- conflict augmentation appears only when appropriate;
- Intervention Comparison opens;
- destination verdicts render;
- no mutation controls are exposed;
- no horizontal overflow.

The canonical integration run additionally proves the same UI can coexist with #34 repository-hydration/unknown-facts semantics in one temporary merged tree.

It does not verify real authentication, Vercel production, or an actual two-tank mutation.

## Next mutation badcase matrix

Before a relocation RPC/repository method can be considered valid, executable tests must cover at least:

- `MOVE-001`: source == destination → reject without mutation;
- `MOVE-002`: source livestock record missing → reject;
- `MOVE-003`: quantity <= 0 → reject;
- `MOVE-004`: quantity > source quantity → reject;
- `MOVE-005`: user owns source but not destination → RLS/ownership reject;
- `MOVE-006`: user owns destination but not source → reject;
- `MOVE-007`: destination compatibility is `not_recommended` → API/repository rejects before DB mutation;
- `MOVE-008`: destination compatibility is `insufficient_data` because destination has unresolved livestock → reject formal relocation;
- `MOVE-009`: source or destination version changed after compatibility calculation → stale decision rejected;
- `MOVE-010`: partial quantity move decrements source and adds/merges exactly once at destination;
- `MOVE-011`: full quantity move removes source active row and adds/merges destination exactly once;
- `MOVE-012`: repeated operation ID returns the same result and does not double-move;
- `MOVE-013`: destination write failure rolls back source decrement;
- `MOVE-014`: source write failure leaves destination unchanged;
- `MOVE-015`: verified species identity is preserved exactly;
- `MOVE-016`: unresolved identity is never promoted to a catalog species;
- `MOVE-017`: timeline/audit event points to source, destination, moved quantity and operation ID;
- `MOVE-018`: local compatibility mirror changes only after repository success;
- `MOVE-019`: two concurrent relocation attempts cannot move more quantity than exists;
- `MOVE-020`: post-move aquarium decision state is recomputed rather than reusing the pre-move verdict.
