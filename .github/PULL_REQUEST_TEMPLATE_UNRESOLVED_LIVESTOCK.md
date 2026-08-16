## Scope
- [x] `record_existing` may preserve unresolved real-world livestock.
- [x] `planned_addition` remains catalog-grounded.
- [x] unresolved current livestock downgrades compatibility to insufficient data.
- [x] unresolved records remain visible/removable without fake species detail.
- [x] canonical DB identity stores raw name, not a synthetic species key.

## Verification
- [x] core unresolved contract
- [x] UI static contract
- [x] legacy livestock recording
- [x] atomic livestock regression
- [x] core-flow regression
- [x] TypeScript / API typecheck
- [x] production build
- [x] existing livestock drawer browser regression
- [x] unresolved record-existing browser path
- [x] unresolved planned-addition bypass rejected
- [ ] remote Supabase migration applied and verified
- [ ] post-migration security/performance advisors reviewed

Keep Draft until the remote migration and cloud persistence acceptance pass. Do not merge solely on code CI.
