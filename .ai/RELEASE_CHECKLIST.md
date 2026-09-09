# Release Checklist

## Before UI merge

- Combined HTML Freeze accepted for all five core pages.
- SHA256 manifest, screenshots and HTML→React/CSS Owner mapping saved.
- 390/600/1024/1440/1920px layout and action checks pass.
- Final PR Head passes lint, typecheck, build, Golden, Visual and history checks.
- Independent Critic reviews and rechecks the final diff.

## Before production

- Final main SHA equals Preview SHA.
- User accepts Aquarium, Encyclopedia, Care, Compatibility and Collection.
- Production migration 27 is separately authorized and verified.
- Catalog release and three-way checksum are separately verified.
- SEO noindex removal is separately authorized.
- `release/production` fast-forward and deployment are separately authorized, with rollback deployment retained.
