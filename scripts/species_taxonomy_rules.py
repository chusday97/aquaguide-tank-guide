#!/usr/bin/env python3
import re
from typing import Mapping


CORAL_OR_MARINE_INVERTEBRATE = re.compile(
    r"珊瑚|海葵|水母|海星|海参|管虫|海绵|coral|anemone|jellyfish|starfish|sponge|"
    r"Actinodiscus|Acropora|Euphyllia|Clavularia|Zoanthus|Palythoa|Sarcophyton|"
    r"Pachyclavularia|Xenia|Tubastraea|Aurelia|Chrysaora|Cassiopea|Astropecten|Sabellastarte|Protula|Haliclona",
    re.I,
)

INVERTEBRATE = re.compile(
    r"虾|螺|蟹|shrimp|snail|crab|Atyidae|Neritidae|Ampullariidae|"
    r"Lysmata|\bThor\b|Paguristes|Pomacea|Neritina|Clithon|Anentome|Caridina|Neocaridina|Geosesarma|Tylomelania|Vittina",
    re.I,
)

AQUATIC_PLANT = re.compile(
    r"水草|矮珍珠|趴地珍珠|牛毛毡|挖耳草|辣椒榕|水榕|迷你榕|宫廷|莫斯|铁皇冠|黑木蕨|椒草|"
    r"大浪草|浮萍|圆心萍|红根浮萍|蜈蚣草|睡莲|红荷根|虎耳草|绿羽毛|箦藻|水兰|皇冠草|"
    r"Hemianthus|Glossostigma|Eleocharis|Utricularia|Bucephalandra|Anubias|Rotala|Vesicularia|Microsorum|"
    r"Bolbitis|Cryptocoryne|Aponogeton|Lemna|Limnobium|Egeria|Nymphaea|Micranthemum|Echinodorus|Bacopa|"
    r"Myriophyllum|Blyxa|Vallisneria|Staurogyne|Ludwigia|Alternanthera|Hygrophila|Proserpinaca|Phyllanthus|"
    r"Ceratopteris|Sagittaria|Marsilea|Riccia|Fissidens|Cabomba|Limnophila",
    re.I,
)

REPTILE_OR_AMPHIBIAN = re.compile(
    r"龟|角蛙|蛙|蝾螈|六角恐龙|turtle|frog|newt|axolotl|Ambystoma|Ceratophrys|Cynops|Trachemys|Mauremys|Sternotherus",
    re.I,
)

HARDSCAPE = re.compile(
    r"青龙石|松皮石|火山石|沉木|流木|水草泥|溪流砂|化妆砂|景观板|景观组|景观树|底床|"
    r"Hardscape|Seiryu|Ohko|Lava|Driftwood|Aqua Soil|River Sand|Cosmetic Sand|Iwagumi|Bonsai Wood",
    re.I,
)

MARINE_FISH = re.compile(
    r"小丑|倒吊|蓝魔鬼|雀鲷|蝶鱼|炮弹|狮子鱼|泗水玫瑰|五彩青蛙|虾虎|"
    r"Amphiprion|Zebrasoma|Paracanthurus|Chaetodon|Chrysiptera|Pterois|Lutjanus|Pterapogon|"
    r"Xanthichthys|Centropyge|Pomacanthus|Synchiropus|Gobiodon|Pseudochromis",
    re.I,
)

EXPLICIT_MARINE_CONTEXT = re.compile(r"海水|marine|saltwater|reef|珊瑚礁", re.I)

CICHLID_OR_BETTA = re.compile(r"慈鲷|Cichlidae|Pterophyllum|Thorichthys|Betta|斗鱼|Apistogramma|Mikrogeophagus", re.I)
TETRA = re.compile(r"灯|Tetra|Characidae|Paracheirodon|Hemigrammus|Hyphessobrycon|Phenacogrammus", re.I)
CATFISH_OR_PLECO = re.compile(r"异型|鲶|鼠鱼|Loricariidae|Corydoras|Ancistrus|Otocinclus|Panaque|Hypancistrus", re.I)


def _text(row: Mapping[str, str], *fields: str) -> str:
    return " ".join((row.get(field, "") or "").strip() for field in fields)


def infer_category(row: Mapping[str, str]) -> str:
    """Infer display taxonomy without treating pH as habitat evidence.

    The category is a life/taxonomy label. Water chemistry such as pH must not
    independently turn a freshwater species into a marine species.
    """
    identity = _text(row, "Common_Name", "Family", "Scientific_Name")
    context = _text(row, "Origin", "Care_Guide", "Basic_Prompt", "Enhanced_Prompt")
    combined = f"{identity} {context}"

    if CORAL_OR_MARINE_INVERTEBRATE.search(combined):
        return "珊瑚/海水无脊椎"
    if INVERTEBRATE.search(identity):
        return "虾螺蟹"
    if AQUATIC_PLANT.search(identity):
        return "水草"
    if REPTILE_OR_AMPHIBIAN.search(identity):
        return "两栖/爬宠"
    if HARDSCAPE.search(identity):
        return "硬景/底床"
    if MARINE_FISH.search(identity) or EXPLICIT_MARINE_CONTEXT.search(context):
        return "海水鱼"
    if CICHLID_OR_BETTA.search(identity):
        return "慈鲷/斗鱼"
    if TETRA.search(identity):
        return "灯科鱼"
    if CATFISH_OR_PLECO.search(identity):
        return "鲶鱼/异型"
    return "鱼类"
