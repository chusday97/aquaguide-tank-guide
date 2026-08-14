# Non-livestock detail fixtures

Current regression fixtures:

- `sp_0304` — 绿宫廷 / `Rotala rotundifolia 'Green'` — canonical life type `plant`.
- `sp_0343` — 青龙石 / `Hardscape - Seiryu Stone` — canonical life type `hardscape`.

The regression clones each fixture with intentionally hostile legacy fields (`tankSize = 至少 800 升`, `housingMode = 建议单养`, `temperament = Aggressive`). The detail route must still remain non-livestock and the canonical evaluator must not emit volume, predator, density, or single-housing rules.
