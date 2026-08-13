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

# Reef/coral wording in care text is habitat context, not evidence that a fish
# itself is coral.
assert_category(
    "海水鱼",
    Common_Name="公子小丑",
    Scientific_Name="Amphiprion ocellaris",
    Family="Pomacentridae",
    Care_Guide="常见珊瑚礁鱼，可在成熟珊瑚缸中饲养",
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

# `水草泥` contains the broad token 水草 but is substrate, so hardscape must
# win before plant matching.
assert_category(
    "硬景/底床",
    Common_Name="水草泥 (底床)",
    Scientific_Name="Hardscape - Aqua Soil",
    Family="Hardscape",
)

assert_category(
    "硬景/底床",
    Common_Name="杜鹃根",
    Scientific_Name="Hardscape - Azalea Root",
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

# These real legacy records were previously stored as 硬景/底床. The safe
# generator must keep them in fish taxonomy when the catalog is refreshed.
assert_category(
    "慈鲷/斗鱼",
    Common_Name="红宝石鱼",
    Scientific_Name="Hemichromis bimaculatus",
    Family="Cichlidae",
)

assert_category(
    "慈鲷/斗鱼",
    Common_Name="黑白大理石神仙",
    Scientific_Name="Pterophyllum scalare var. Marble",
    Family="Cichlidae",
)

assert_category(
    "慈鲷/斗鱼",
    Common_Name="球形蓝宝石鱼",
    Scientific_Name="Andinoacara pulcher var. Balloon",
    Family="Cichlidae",
)

# `Thor` is a marine shrimp genus, but it must not match the prefix of the
# freshwater cichlid genus `Thorichthys`.
assert_category(
    "慈鲷/斗鱼",
    Common_Name="大点火口",
    Scientific_Name="Thorichthys meeki",
    Family="Cichlidae",
)

# A second legacy corruption class stored aquatic plants as 鱼类. These source
# identities must resolve to 水草 before a regenerated catalog is accepted.
for common_name, scientific_name, family in [
    ("牛毛毡", "Eleocharis acicularis", "Cyperaceae"),
    ("凤尾藓", "Fissidens fontanus", "Fissidentaceae"),
    ("迷你矮珍珠", "Hemianthus callitrichoides", "Linderniaceae"),
    ("铁皇冠", "Microsorum pteropus", "Polypodiaceae"),
    ("绿羽毛", "Myriophyllum aquaticum", "Haloragaceae"),
    ("红宫廷", "Rotala rotundifolia 'Red'", "Lythraceae"),
    ("南美叉柱花", "Staurogyne repens", "Acanthaceae"),
]:
    assert_category(
        "水草",
        Common_Name=common_name,
        Scientific_Name=scientific_name,
        Family=family,
    )

print("species taxonomy source rules passed: 22 fixtures")
