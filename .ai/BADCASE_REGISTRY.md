# Badcase Registry

| ID | Badcase | Prevention |
|---|---|---|
| UI-001 | Preview port shows a different branch/SHA than the working tree | One process per port; compare displayed SHA with `git rev-parse HEAD` |
| UI-002 | Old and new page shells/CSS owners render together | One HTML block → one React Owner → one CSS Owner |
| UI-003 | Mobile controls overlap or are hidden by overflow clipping | Check real element bounds at 390/600px; never use overflow clipping as a fix |
| UI-004 | Risk action unexpectedly opens compatibility | Runtime action contract test; risk stays in detail, compatibility uses explicit route |
| UI-005 | Aquarium actions cover or duplicate the 3D stage | Keep one Canvas and one stage entry group; title/actions remain outside media |
