#!/usr/bin/env python3
import prepare_species_assets_and_data as pipeline
from normalize_species_categories import normalize_file
from species_taxonomy_rules import infer_category


# Keep the image/data pipeline intact, but replace its legacy category heuristic
# before main() runs. In particular, pH is no longer treated as evidence that a
# species is marine.
pipeline.category = infer_category


if __name__ == "__main__":
    pipeline.main()
    changes = normalize_file()
    print(f"normalized_legacy_categories={len(changes)}")
