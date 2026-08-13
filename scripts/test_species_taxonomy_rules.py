#!/usr/bin/env python3
from species_taxonomy_rules import infer_category


def assert_category(expected: str, **row: str) -> None:
    actual = infer_category(row)
    if actual != expected:
        raise AssertionError(f"expected {expected}, got {actual}: {row}")


# High pH alone must never turn a freshwater fish into a marine species.
assert_category(
    "慈鲷/斗鱼",
    Common_Name="非洲慈鲷",
    Scientific_Name="Labidochromis caeruleus",
    Family="Cichlidae",
    pH_Range="8.0-8.5",
    Care_Guide="硬水淡水慈鲷",
)

# Explicit marine identity/context remains marine.
assert_category(
    "海水鱼",
    Common_Name="公子小丑",
    Scientific_Name="Amphiprion ocellaris",
    Family="Pomacentridae",
    pH_Range="8.1-8.4",
    Origin="Marine reef",
)

# Marine context must not collapse shrimp into the fish category.
assert_category(
    "虾螺蟹",
    Common_Name="清洁虾",
    Scientific_Name="Lysmata amboinensis",
    Family="Lysmatidae",
    Origin="Marine reef",
)

assert_category(
    "珊瑚/海水无脊椎",
    Common_Name="鹿角珊瑚",
    Scientific_Name="Acropora millepora",
    Family="Acroporidae",
)

assert_category(
    "水草",
    Common_Name="绿菊",
    Scientific_Name="Cabomba caroliniana",
    Family="Cabombaceae",
)

assert_category(
    "硬景/底床",
    Common_Name="青龙石",
    Scientific_Name="Seiryu Stone",
    Family="Hardscape",
)

assert_category(
    "两栖/爬宠",
    Common_Name="六角恐龙",
    Scientific_Name="Ambystoma mexicanum",
    Family="Ambystomatidae",
)

assert_category(
    "灯科鱼",
    Common_Name="宝莲灯",
    Scientific_Name="Paracheirodon axelrodi",
    Family="Characidae",
)

print("species taxonomy source rules passed: 8 fixtures")
