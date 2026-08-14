#!/usr/bin/env python3
from normalize_species_categories import normalized_category


def species(name: str, scientific_name: str, category: str, description: str = "") -> dict[str, str]:
    return {
        "id": "fixture",
        "name": name,
        "scientificName": scientific_name,
        "category": category,
        "description": description,
    }


cases = [
    (
        "legacy plant stored as fish",
        species("绿菊", "Cabomba caroliniana", "鱼类"),
        "水草",
    ),
    (
        "legacy hardscape stored as fish",
        species("杜鹃根", "Hardscape - Azalea Root", "鱼类"),
        "硬景/底床",
    ),
    (
        "aquasoil stored as plant",
        species("水草泥 (底床)", "Hardscape - Aqua Soil", "水草"),
        "硬景/底床",
    ),
    (
        "marine shrimp stored as marine fish",
        species("性感虾", "Thor amboinensis", "海水鱼", "Marine reef cleaner shrimp"),
        "虾螺蟹",
    ),
    (
        "marine coral-like animal stored as marine fish",
        species("管虫 (硬管)", "Protula bispiralis", "海水鱼"),
        "珊瑚/海水无脊椎",
    ),
    (
        "freshwater fish stored as hardscape",
        species("红宝石鱼", "Hemichromis bimaculatus", "硬景/底床", "淡水慈鲷"),
        "鱼类",
    ),
    (
        "ordinary curated fish category is preserved",
        species("宝莲灯", "Paracheirodon axelrodi", "灯科鱼", "淡水群游灯鱼"),
        "灯科鱼",
    ),
    (
        "Thorichthys is not normalized as shrimp",
        species("大点火口", "Thorichthys meeki", "慈鲷/斗鱼", "淡水慈鲷"),
        "慈鲷/斗鱼",
    ),
    (
        "reef wording in fish care text cannot turn a fish into coral",
        species("公子小丑", "Amphiprion ocellaris", "海水鱼", "适合成熟珊瑚礁缸饲养"),
        "海水鱼",
    ),
    (
        "jellyfish specialized category is preserved",
        species("海月水母", "Aurelia aurita", "水母"),
        "水母",
    ),
    (
        "turtle specialized category is preserved",
        species("巴西龟", "Trachemys scripta elegans", "龟类"),
        "龟类",
    ),
    (
        "dragonet common name is not migrated to amphibian",
        species("五彩青蛙 (改良型)", "Synchiropus splendidus", "海水鱼"),
        "海水鱼",
    ),
]

for label, item, expected in cases:
    actual = normalized_category(item)
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected}, got {actual}: {item}")

print(f"species category normalizer passed: {len(cases)} fixtures")
