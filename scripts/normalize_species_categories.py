#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path
from typing import Any

from species_taxonomy_rules import infer_category


ROOT = Path(__file__).resolve().parents[1]
FISH_DATA_TS = ROOT / "src/data/fishData.ts"

# These labels represent high-confidence life/taxonomy classes. We only migrate
# across these class boundaries automatically; ordinary fish subcategories are
# otherwise preserved to avoid flattening curated taxonomy.
STRONG_NON_FISH_CATEGORIES = {
    "水草",
    "硬景/底床",
    "珊瑚/海水无脊椎",
    "虾螺蟹",
    "两栖/爬宠",
}

FISH_CATEGORIES = {
    "鱼类",
    "海水鱼",
    "慈鲷/斗鱼",
    "灯科鱼",
    "鲶鱼/异型",
}


def load_fish_data(path: Path = FISH_DATA_TS) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"export const fishData: Fish\[] = (\[.*\]);\s*$", text, re.S)
    if not match:
        raise RuntimeError(f"Could not parse fishData from {path}")
    return json.loads(match.group(1))


def write_fish_data(items: list[dict[str, Any]], path: Path = FISH_DATA_TS) -> None:
    text = "import { Fish } from '../types';\n\n"
    text += "export const fishData: Fish[] = "
    text += json.dumps(items, ensure_ascii=False, indent=2)
    text += ";\n"
    path.write_text(text, encoding="utf-8")


def item_to_source_row(item: dict[str, Any]) -> dict[str, str]:
    return {
        "Common_Name": str(item.get("name", "") or ""),
        "Scientific_Name": str(item.get("scientificName", "") or ""),
        "Family": "",
        "Origin": "",
        "Care_Guide": str(item.get("description", "") or ""),
        "Basic_Prompt": "",
        "Enhanced_Prompt": "",
    }


def normalized_category(item: dict[str, Any]) -> str:
    current = str(item.get("category", "") or "")
    inferred = infer_category(item_to_source_row(item))

    # A positive plant/hardscape/coral/invertebrate/reptile identity is strong
    # enough to repair an incompatible legacy category.
    if inferred in STRONG_NON_FISH_CATEGORIES:
        return inferred

    # Conversely, if a record is currently stored in a non-fish class but its
    # identity is confidently fish-like, repair the class while retaining the
    # source rule's fish subcategory where available.
    if current in {"水草", "硬景/底床", "珊瑚/海水无脊椎"} and inferred in FISH_CATEGORIES:
        return inferred

    # Preserve existing fish subcategories and other curated labels when there
    # is no high-confidence life-class contradiction.
    return current


def plan_category_changes(items: list[dict[str, Any]]) -> list[dict[str, str]]:
    changes: list[dict[str, str]] = []
    for item in items:
        before = str(item.get("category", "") or "")
        after = normalized_category(item)
        if before == after:
            continue
        changes.append({
            "id": str(item.get("id", "")),
            "name": str(item.get("name", "")),
            "scientificName": str(item.get("scientificName", "")),
            "before": before,
            "after": after,
        })
    return changes


def normalize_file(path: Path = FISH_DATA_TS, *, dry_run: bool = False) -> list[dict[str, str]]:
    items = load_fish_data(path)
    changes = plan_category_changes(items)
    if not dry_run and changes:
        by_id = {change["id"]: change["after"] for change in changes}
        for item in items:
            species_id = str(item.get("id", ""))
            if species_id in by_id:
                item["category"] = by_id[species_id]
        write_fish_data(items, path)
    return changes


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize high-confidence legacy species category contradictions.")
    parser.add_argument("--check", action="store_true", help="Do not write; exit 1 when normalization is still pending.")
    parser.add_argument("--dry-run", action="store_true", help="Print pending normalization without writing.")
    args = parser.parse_args()

    dry_run = args.check or args.dry_run
    changes = normalize_file(dry_run=dry_run)
    print(json.dumps({
        "pendingCategoryChanges": len(changes),
        "changes": changes,
        "written": bool(changes) and not dry_run,
    }, ensure_ascii=False, indent=2))

    if args.check and changes:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
