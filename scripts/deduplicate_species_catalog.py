#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path
from typing import Any

from normalize_species_categories import load_fish_data, write_fish_data


ROOT = Path(__file__).resolve().parents[1]
FISH_DATA_TS = ROOT / "src/data/fishData.ts"
ALIASES_TS = ROOT / "src/modules/species/speciesAliases.ts"
EXPECTED_ALIAS_COUNT = 28

FINGERPRINT_FIELDS = (
    "name",
    "scientificName",
    "category",
    "difficulty",
    "waterTemperature",
    "phLevel",
    "tankSize",
    "temperament",
    "size",
    "housingMode",
    "housingReason",
)


def normalize(value: Any) -> Any:
    if isinstance(value, str):
        return " ".join(value.strip().lower().split())
    return value


def business_fingerprint(item: dict[str, Any]) -> tuple[Any, ...]:
    return tuple(normalize(item.get(field)) for field in FINGERPRINT_FIELDS)


def load_aliases(path: Path = ALIASES_TS) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    block_match = re.search(
        r"export const speciesIdAliases: Record<string, string> = \{(.*?)\n\};",
        text,
        re.S,
    )
    if not block_match:
        raise RuntimeError(f"Could not parse speciesIdAliases from {path}")
    pairs = re.findall(r"\b(sp_\d+)\s*:\s*['\"](sp_\d+)['\"]", block_match.group(1))
    aliases = dict(pairs)
    if len(aliases) != len(pairs):
        raise RuntimeError("Duplicate alias keys detected")
    return aliases


def validate_aliases(items: list[dict[str, Any]], aliases: dict[str, str]) -> tuple[str, list[dict[str, str]]]:
    if len(aliases) != EXPECTED_ALIAS_COUNT:
        raise RuntimeError(
            f"Refusing migration: expected exactly {EXPECTED_ALIAS_COUNT} aliases, got {len(aliases)}"
        )

    by_id = {str(item.get("id", "")): item for item in items}
    if len(by_id) != len(items):
        raise RuntimeError("Refusing migration: catalog contains duplicate species IDs")

    duplicate_ids_present = [duplicate_id for duplicate_id in aliases if duplicate_id in by_id]
    if duplicate_ids_present and len(duplicate_ids_present) != EXPECTED_ALIAS_COUNT:
        raise RuntimeError(
            f"Refusing migration: partial duplicate deletion detected; "
            f"{len(duplicate_ids_present)}/{EXPECTED_ALIAS_COUNT} legacy IDs remain"
        )

    for duplicate_id, canonical_id in aliases.items():
        if duplicate_id == canonical_id:
            raise RuntimeError(f"Refusing migration: self-alias detected: {duplicate_id}")
        if canonical_id in aliases:
            raise RuntimeError(
                f"Refusing migration: canonical ID {canonical_id} is itself an alias; flatten aliases first"
            )
        if canonical_id not in by_id:
            raise RuntimeError(f"Refusing migration: canonical ID missing from catalog: {canonical_id}")

    if not duplicate_ids_present:
        return "already_deduplicated", []

    plan: list[dict[str, str]] = []
    for duplicate_id, canonical_id in sorted(aliases.items()):
        duplicate = by_id[duplicate_id]
        canonical = by_id[canonical_id]
        if business_fingerprint(duplicate) != business_fingerprint(canonical):
            raise RuntimeError(
                f"Refusing migration: {duplicate_id} no longer exactly matches canonical {canonical_id}"
            )
        plan.append({
            "duplicateId": duplicate_id,
            "canonicalId": canonical_id,
            "name": str(duplicate.get("name", "")),
            "scientificName": str(duplicate.get("scientificName", "")),
        })
    return "ready", plan


def deduplicate_file(path: Path = FISH_DATA_TS, *, dry_run: bool = False) -> tuple[str, list[dict[str, str]]]:
    items = load_fish_data(path)
    aliases = load_aliases()
    state, plan = validate_aliases(items, aliases)
    if not dry_run and state == "ready":
        duplicate_ids = set(aliases)
        remaining = [item for item in items if str(item.get("id", "")) not in duplicate_ids]
        if len(items) - len(remaining) != EXPECTED_ALIAS_COUNT:
            raise RuntimeError("Refusing migration: deletion count changed unexpectedly")
        write_fish_data(remaining, path)
    return state, plan


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Guarded removal of exact duplicate catalog records after stable species-ID aliases exist."
    )
    parser.add_argument("--check", action="store_true", help="Validate pre- or post-migration catalog state without writing.")
    parser.add_argument("--dry-run", action="store_true", help="Print the deletion plan without writing.")
    args = parser.parse_args()

    dry_run = args.check or args.dry_run
    state, plan = deduplicate_file(dry_run=dry_run)
    print(json.dumps({
        "state": state,
        "validatedDuplicateDeletions": len(plan),
        "plan": plan,
        "written": state == "ready" and bool(plan) and not dry_run,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
