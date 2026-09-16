// Generated from Aquapedia care_guides_master_34.json + care_guides_master_34_en.json.
// Do not hand-edit guide content; regenerate from the authority files instead.
export type LatestCareGuideStep = {
  step: number; title: string; titleEn: string; how: string; howEn: string; why: string; whyEn: string; imageUrl: string;
};
export type LatestCareGuide = {
  id: string; category: string; categoryEn: string; title: string; titleEn: string; condition: string; conditionEn: string; avoid: string; avoidEn: string; imageUrl: string; coverUrl: string; steps: LatestCareGuideStep[];
};

export const latestCareGuides: LatestCareGuide[] = [
  {
    "id": "care_01",
    "category": "入缸与转水",
    "categoryEn": "Acclimatization & Introduction",
    "title": "新买的鱼到家入缸（过水定水）",
    "titleEn": "Acclimatizing and Introducing New Fish into the Tank",
    "condition": "刚买回家的鱼装在塑料袋里，袋内水温与鱼缸不同，且装满了几个小时积攒的鱼便与有害细菌，直接倒缸会导致温差休克或整缸水发臭。",
    "conditionEn": "Newly purchased fish arrive home inside a plastic transport bag. Directly dumping them into the aquarium causes severe osmotic shock, pH shock, and rapid mortality due to sudden temperature and water chemistry discrepancies.",
    "avoid": "切勿直接解袋倒鱼；切勿把袋子里的水倒入鱼缸。",
    "avoidEn": "Never pour transport bag water into your aquarium; never release new fish into an uncycled tank with active ammonia or nitrite.",
    "imageUrl": "/care-guides-handdrawn/01_new_fish_acclimation.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/01_new_fish_acclimatization_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "整袋泡水20分钟",
        "titleEn": "Float the sealed bag for 20 minutes to equalize temperature",
        "how": "不解开袋子，直接丢在鱼缸水面上漂浮20分钟。",
        "howEn": "Place the unopened plastic transport bag directly onto the aquarium water surface to float undisturbed for 20 to 30 minutes.",
        "why": "依靠水温自然传导，让塑料袋内外的水温完全一致，防止鱼被温差冻死或热死。",
        "whyEn": "Water conducts heat gradually. Floating equalizes the internal and external water temperatures, preventing thermal shock to the fish's swim bladder and organs.",
        "imageUrl": "/care-guides-handdrawn/01_new_fish_acclimation_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "舀鱼缸水倒进袋中",
        "titleEn": "Add small amounts of tank water in stages over 3 times",
        "how": "解开袋口，用小量杯舀一点鱼缸里的水倒进袋里，每隔8分钟加一次，分3次完成。",
        "howEn": "Cut open the bag, fold the rim to keep it buoyant, and use a small cup to add 1/4 volume of aquarium water into the bag every 10 minutes, repeating 3 times.",
        "why": "让鱼鳃缓慢适应主缸的pH值和渗透压，避免急性水质酸碱休克。",
        "whyEn": "Slowly introducing aquarium water gently balances water hardness and pH levels, giving the fish's gills and osmoregulatory system time to adapt.",
        "imageUrl": "/care-guides-handdrawn/01_new_fish_acclimation_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "只把鱼捞进缸，旧水倒掉",
        "titleEn": "Net the fish into the tank and discard transport bag water",
        "how": "一手拿小鱼网把鱼捞进鱼缸，另一手把塑料袋里的脏水全部倒进水桶扔掉。",
        "howEn": "Use a soft dip net to gently scoop the fish out of the bag and release them into the aquarium. Pour the remaining transport bag water down the drain.",
        "why": "绝不把运输袋里充满排泄物和细菌的陈旧水倒进主缸，阻断外来污染。",
        "whyEn": "Transport water contains high levels of accumulated fish waste, ammonia, and potential pathogens. Never allow bag water into your main display tank.",
        "imageUrl": "/care-guides-handdrawn/01_new_fish_acclimation_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_02",
    "category": "入缸与转水",
    "categoryEn": "Acclimatization & Introduction",
    "title": "新买的水草除螺除藻消毒",
    "titleEn": "Sterilizing New Aquatic Plants (Pest Snail & Algae Removal)",
    "condition": "新买的水草往往藏有极其微小的蜗牛卵、寄生虫卵或黑毛藻丝，直接放进鱼缸2周后就会爆发成百上千只爆缸杂螺。",
    "conditionEn": "Freshly bought aquatic plants from stores or farms often carry pest snails, gelatinous snail egg clutches, and stubborn filamentous algae spores that can overrun a clean tank if planted directly.",
    "avoid": "切勿用浓药水长时间浸泡，会烧焦水草娇嫩叶片。",
    "avoidEn": "Do not soak plants in concentrated dark purple solutions; avoid soaking extremely delicate mosses or Cryptocoryne species for longer than 3 minutes.",
    "imageUrl": "/care-guides-handdrawn/02_plant_disinfection.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/02_plant_dip_disinfection_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "自来水下冲洗修剪烂叶",
        "titleEn": "Rinse plants under running tap water to remove visible dirt and snails",
        "how": "打开水龙头轻微流水，用手轻轻搓洗叶面，用小剪刀剪掉变黄发黑的烂根烂叶。",
        "howEn": "Hold the plants under a gentle lukewarm tap water stream, carefully inspecting the undersides of leaves and stems to pick off any visible snails or gelatinous egg clusters with tweezers.",
        "why": "物理剥离大颗粒泥沙杂质，并剔除腐烂组织防止败水。",
        "whyEn": "Physical rinsing dislodges loose detritus and superficial pests before chemical disinfection.",
        "imageUrl": "/care-guides-handdrawn/02_plant_disinfection_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "泡在稀释的高锰酸钾浅粉水5分钟",
        "titleEn": "Dip in diluted potassium permanganate solution for 5 minutes",
        "how": "在水盆里滴入微量消毒液调成浅粉色，把整棵水草完全泡入浸泡5分钟。",
        "howEn": "Dissolve potassium permanganate crystals in a white basin of water until it turns a light rose-pink color. Immerse the entire plant for 3 to 5 minutes.",
        "why": "利用弱氧化杀灭潜伏在叶背的蜗牛卵囊和寄生虫胞囊。",
        "whyEn": "The mild oxidizing solution penetrates cell walls to kill snail eggs, parasite cysts, and soft algae strands without burning delicate plant foliage.",
        "imageUrl": "/care-guides-handdrawn/02_plant_disinfection_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "清水反复漂洗3遍后再种进缸",
        "titleEn": "Thoroughly rinse in clean dechlorinated water before planting",
        "how": "捞出水草，在干净的自来水盆里来回涮洗3遍冲掉残留药液，再用镊子夹入缸中栽种。",
        "howEn": "Transfer the sanitized plants into a basin of clean dechlorinated water and swish them gently back and forth for 1 minute before trimming roots and planting.",
        "why": "彻底去除消毒药物残留，保护鱼虾不受药物刺激。",
        "whyEn": "Completely washes off residual disinfectant chemicals so no oxidizing agents enter the main aquarium water.",
        "imageUrl": "/care-guides-handdrawn/02_plant_disinfection_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_03",
    "category": "入缸与转水",
    "categoryEn": "Acclimatization & Introduction",
    "title": "新鱼缸开缸养水（建立硝化系统）",
    "titleEn": "Cycling a New Aquarium (Establishing the Biological Filter)",
    "condition": "刚买回来的新鱼缸加满水虽然看似透明清澈，但水里没有任何益生菌，是无法分解鱼便的‘生水’，直接放鱼会导致鱼群中毒死亡。",
    "conditionEn": "In a newly set up aquarium without beneficial nitrifying bacteria, toxic ammonia excreted by fish cannot be broken down, turning the water into an invisible chemical death trap for any fish introduced on day one.",
    "avoid": "开缸第1周严禁大量放鱼；水发白发雾时切勿频繁全缸换水。",
    "avoidEn": "Never introduce delicate or expensive fish on day one; do not perform large water changes or rinse filter media during the initial cycling phase.",
    "imageUrl": "/care-guides-handdrawn/03_new_tank_cycling.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/03_tank_cycling_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "加满水后开过滤器空转3天",
        "titleEn": "Run filter and aeration continuously for 48 hours",
        "how": "缸内装满静置除氯过的水，插上水泵过滤器让水流连续循环流动72小时。",
        "howEn": "Fill the tank with conditioned water, turn on the filter, powerhead, and air stone, and let the system run empty 24/7.",
        "why": "挥发水里的微量自来水余氯，并激活滤材中的孔隙。",
        "whyEn": "Constant water circulation expels residual dissolved chlorine and enriches the water with dissolved oxygen required by aerobic bacteria.",
        "imageUrl": "/care-guides-handdrawn/03_new_tank_cycling_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "倒入硝化细菌液体并扔几粒鱼粮",
        "titleEn": "Dose nitrifying bacteria culture and add a small pinch of fish food",
        "how": "往水流最急的出水口倒入一盖硝化细菌液，同时丢入3-5粒鱼饲料。",
        "howEn": "Shake the bottle of liquid nitrifying bacteria well, pour the recommended dose directly into the filter intake, and drop 3 to 5 grains of fish food onto the gravel.",
        "why": "饲料腐烂产生微量氨氮，作为有益硝化菌生长繁殖的‘食物’。",
        "whyEn": "The decaying fish food releases organic ammonia, providing the necessary food source for the seeded bacteria colonies to multiply on filter media.",
        "imageUrl": "/care-guides-handdrawn/03_new_tank_cycling_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "耐心等待7-10天直到水彻底变清",
        "titleEn": "Wait 14 to 21 days until ammonia and nitrite drop to zero",
        "how": "中间水体会短暂变白发雾，不要关机也不要换水，静候7-10天直到水变通透再放鱼。",
        "howEn": "Keep the filter running continuously for 2 to 3 weeks without adding fish. Test water weekly with test strips or liquid test kits until ammonia and nitrite read 0 ppm.",
        "why": "水质由雾转透标志着有益生态菌群建立完成，水质具备分解能力。",
        "whyEn": "Nitrosomonas and Nitrobacter bacteria require 2 to 3 weeks to colonize ceramic rings and complete the biological nitrogen cycle.",
        "imageUrl": "/care-guides-handdrawn/03_new_tank_cycling_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_04",
    "category": "水质与环境突发",
    "categoryEn": "Water Quality & Emergencies",
    "title": "水质突发发白变浑浊、发臭",
    "titleEn": "Sudden Milky Cloudy Water and Foul Odor (Bacterial Bloom)",
    "condition": "鱼缸水突然从清澈变得像米汤一样浑浊发白，水面漂浮着久久不散的白泡沫，水有腥臭味。多因投喂过量或生化滤材被破坏引起有益菌崩溃。",
    "conditionEn": "The tank water suddenly turns foggy white or milky overnight and develops a stale fishy smell, caused by a massive bacterial bloom competing with fish for oxygen, signaling an imminent bio-filter collapse.",
    "avoid": "切勿全缸100%换水；切勿直接用自来水搓洗生化陶瓷环。",
    "avoidEn": "Do not empty and replace 100% of the water (this resets the cycle); do not dump chemical algaecides or harsh clarifiers into the tank.",
    "imageUrl": "/care-guides-handdrawn/04_cloudy_water_fix.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/04_cloudy_water_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "暂停喂食整整一天",
        "titleEn": "Immediately stop all feeding and reduce lighting",
        "how": "盖紧饲料瓶盖收好，24小时内不要往鱼缸里扔一粒鱼粮。",
        "howEn": "Do not drop any food into the tank for the next 48 to 72 hours, and turn off high-intensity plant lights.",
        "why": "切断水质恶化源，避免过剩饵料加剧水中细菌狂暴滋生。",
        "whyEn": "Decaying uneaten food fuels runaway bacterial reproduction. Cutting off nutrients starves the suspended bacteria quickly.",
        "imageUrl": "/care-guides-handdrawn/04_cloudy_water_fix_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "吸走底便，换四分之一水",
        "titleEn": "Increase aeration to prevent nighttime suffocation",
        "how": "用洗沙换水器贴紧底砂吸走堆积的鱼粪，抽掉1/4脏水，补入等温度的新水。",
        "howEn": "Turn the air pump to maximum or elevate the filter outflow pipe above the water surface to create vigorous bubbling and surface agitation.",
        "why": "移走有机脏污并稀释水中有害浓度，切忌全部换完导致鱼渗透压崩溃。",
        "whyEn": "Billions of multiplying bacteria consume vast quantities of dissolved oxygen, putting fish at severe risk of nighttime asphyxiation.",
        "imageUrl": "/care-guides-handdrawn/04_cloudy_water_fix_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "开启打氧，洗干净过滤棉",
        "titleEn": "Perform a 25% water change and add fresh nitrifying bacteria",
        "how": "调大氧气泵气石冲出大量微气泡，取下过滤器最上面的白色脏滤棉搓洗干净装回。",
        "howEn": "Siphon out 25% of murky water from the middle water column, refill slowly with conditioned water of equal temperature, and dose biological booster into the filter.",
        "why": "强力充氧能帮助崩溃的硝化菌迅速复苏，物理洗棉阻断污物回流。",
        "whyEn": "Dilutes suspended bacterial turbidity while reinforcing beneficial biofilm colonies on the biological filter media.",
        "imageUrl": "/care-guides-handdrawn/04_cloudy_water_fix_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_05",
    "category": "水质与环境突发",
    "categoryEn": "Water Quality & Emergencies",
    "title": "冬季水温突降 / 加热棒故障断电",
    "titleEn": "Winter Temperature Plunge / Heater Failure or Power Outage",
    "condition": "冬天加热棒坏掉或突发停电，水温骤跌至18°C以下，热带鱼趴在水底僵硬不动、鱼鳍收拢，若不及时回温会导致严重感冒甚至冻死。",
    "conditionEn": "In winter, an electrical outage or heater malfunction causes tank water to drop rapidly below 18°C (64°F). Tropical fish freeze into lethargy, sink to the bottom, and can suffer shock and death within hours.",
    "avoid": "严禁直接往缸里加热水；严禁将冻僵的鱼直接捞进高温热水中。",
    "avoidEn": "Never pour boiling hot water directly into the aquarium; do not blast fish with high-heat water near the filter outlet.",
    "imageUrl": "/care-guides-handdrawn/05_temp_drop_emergency.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/05_temperature_drop_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "用塑料瓶装温水浮在水面缓释热量",
        "titleEn": "Wrap tank exterior with a blanket or foam insulation to trap heat",
        "how": "耐热塑料瓶装满约40°C的温水拧紧，漂浮在水面上让热量自然散发。",
        "howEn": "Immediately cover the sides and top of the aquarium glass with a thick wool blanket, towel, or styrofoam panels.",
        "why": "温和渐进升温，绝对禁止直接向鱼缸倒开水烫伤鱼体黏膜。",
        "whyEn": "Trapping ambient thermal energy slows down heat dissipation through the glass walls.",
        "imageUrl": "/care-guides-handdrawn/05_temp_drop_emergency_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "用毛毯或厚泡沫板包裹鱼缸四周",
        "titleEn": "Float a sealed bottle of warm water to slowly restore temperature",
        "how": "用厚被子、毛毯或发泡塑料板将鱼缸的正面除外的三面牢牢裹住。",
        "howEn": "Fill a clean plastic water bottle with warm water (around 40°C / 104°F), cap it tightly, and float it in the tank. Replace with new warm water every 30 minutes.",
        "why": "阻断室内寒冷空气从玻璃侧壁带走热量，形成保温屏障。",
        "whyEn": "Slowly transfers gentle heat into the water without localized scalding, giving fish time to adjust.",
        "imageUrl": "/care-guides-handdrawn/05_temp_drop_emergency_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "接通新加热棒，每两小时只调高1度",
        "titleEn": "Reinstall a working heater and raise temperature by no more than 2°C per hour",
        "how": "换上备用加热棒，每隔2小时转动温控旋钮上调1°C，慢速恢复至26°C。",
        "howEn": "Plug in a calibrated aquarium heater and adjust the dial to raise water temperature gradually by only 1 to 2°C (2 to 4°F) per hour until reaching 25°C (77°F).",
        "why": "剧烈升温与剧烈降温同样致命，阶梯式回温能保护鱼的心脏负荷。",
        "whyEn": "Rapid temperature increases cause fatal shock and gill organ spasms. Gradual warming ensures safe biological recovery.",
        "imageUrl": "/care-guides-handdrawn/05_temp_drop_emergency_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_06",
    "category": "水质与环境突发",
    "categoryEn": "Water Quality & Emergencies",
    "title": "水面产生大量难消泡沫与油膜",
    "titleEn": "Excessive Surface Foam, Bubbles, and Oily Protein Slick",
    "condition": "鱼缸水面上飘着一层反光的彩色油污膜，或者过滤器砸出的水泡聚集成堆不破灭，阻碍了空气溶氧，水质开始变腥。",
    "conditionEn": "An iridescent oily sheen and persistent foamy bubbles cover the water surface, blocking gas exchange and causing fish to gasp at the surface.",
    "avoid": "切勿使用任何洗洁精或化学去油剂。",
    "avoidEn": "Never spray household kitchen degreasers or detergents anywhere near the tank; do not use scented or wet chemical wipes on water.",
    "imageUrl": "/care-guides-handdrawn/06_oil_film_removal.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/06_surface_oil_film_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "拿一张干净纸巾平铺在水面上吸走油膜",
        "titleEn": "Lay a clean kitchen paper towel flat on the water surface to lift oil",
        "how": "拿一张普通厨房抽纸，平平摊在水面上停滞2秒，捏住纸角快速提走丢弃。",
        "howEn": "Take an unprinted, fragrance-free kitchen paper towel, lay it flat across the water surface for 3 seconds, and lift it by the corners to discard. Repeat 2 to 3 times.",
        "why": "纸张纤维微孔能依靠毛细现象快速吸附表层油性蛋白质浮层。",
        "whyEn": "Pure wood-pulp paper absorbs surface lipid and protein molecules rapidly without leaving fibers.",
        "imageUrl": "/care-guides-handdrawn/06_oil_film_removal_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "用杯子舀走角落堆积的大泡沫",
        "titleEn": "Install an active surface skimmer attachment on the filter",
        "how": "用敞口小杯子贴着水面斜倾，把聚集在缸角的黏稠泡沫连带少量表层水舀掉。",
        "howEn": "Attach a floating surface skimmer pipe to your filter intake or add a compact electric surface skimmer to draw in surface water.",
        "why": "快速物理移走聚集在泡沫中的老化蛋白质和有机死质。",
        "whyEn": "Continuously pulls the protein slick into mechanical filter floss to break down foam permanently.",
        "imageUrl": "/care-guides-handdrawn/06_oil_film_removal_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "调高过滤器出水口，砸破水面张力",
        "titleEn": "Reduce feeding amount and frequency by half",
        "how": "把过滤出水口抬高至高出水面1厘米，让水流跌落冲碎水面油层。",
        "howEn": "Cut the daily food ration in half, ensuring all food is completely eaten within 60 seconds.",
        "why": "打破水面静止表面张力，加速气体交换与油膜向过滤槽回收。",
        "whyEn": "Excess dietary oils and decomposing food proteins are the primary root cause of surface slick buildup.",
        "imageUrl": "/care-guides-handdrawn/06_oil_film_removal_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_07",
    "category": "水质与环境突发",
    "categoryEn": "Water Quality & Emergencies",
    "title": "鱼缸水体突然变绿（绿水爆发）",
    "titleEn": "Sudden Pea-Soup Green Water (Planktonic Algae Outbreak)",
    "condition": "阳光长时间直射或开灯过久，水中的微小单细胞绿藻疯长，整缸水变成浓绿茶汤样，鱼群被完全遮挡。",
    "conditionEn": "The entire water column turns opaque emerald green like pea soup within days due to a massive bloom of suspended single-celled cyanobacteria and green algae.",
    "avoid": "严禁将UV杀菌灯直接放在鱼缸主水体照射鱼群，会灼伤鱼眼及体表。",
    "avoidEn": "Never expose fish or human eyes directly to bare UV light; avoid dumping toxic copper sulfate algaecides into community tanks.",
    "imageUrl": "/care-guides-handdrawn/07_green_water_fix.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/07_green_water_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "彻底遮光3天（关灯并拉上窗帘）",
        "titleEn": "Completely blackout the aquarium with thick black cloth for 4 days",
        "how": "用遮光布或大黑塑料袋将鱼缸全面罩住，连续72小时严禁任何光照。",
        "howEn": "Turn off all aquarium lights and wrap the tank in dark cardboard or a black blackout blanket for 4 full days, without peeking.",
        "why": "小球藻极其依赖光合作用，阻断光线即可切断其能量供给导致枯竭。",
        "whyEn": "Single-celled green algae are obligate autotrophs. Cutting off 100% of light starves and destroys their chloroplasts.",
        "imageUrl": "/care-guides-handdrawn/07_green_water_fix_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "把打氧泵开到最大，持续充氧",
        "titleEn": "Install an enclosed in-line UV sterilizer inside the filter chamber",
        "how": "开启气石打出暴密气泡，24小时不间断打氧。",
        "howEn": "Connect an internal UV clarifier lamp into the filter flow path, running the ultraviolet light 24 hours a day.",
        "why": "大量绿藻在黑暗中会停止产氧转为吸氧，打氧防止藻类死亡耗尽氧气导致鱼窒息。",
        "whyEn": "254nm ultraviolet radiation penetrates the water to shatter algae cellular DNA, killing suspended plankton instantly as water passes through.",
        "imageUrl": "/care-guides-handdrawn/07_green_water_fix_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "在过滤槽暗格加装UV杀菌灯",
        "titleEn": "Perform a 30% water change and pack fine filter floss to trap dead algae",
        "how": "在完全遮光的密闭过滤槽内安装专用紫外线灭藻灯管进行水循环消毒。",
        "howEn": "After 4 days, siphon out 30% of water and pack dense white filter floss into the first stage of the filter, replacing the floss once it clogs.",
        "why": "紫外光能直接破坏随水流通过的游离藻类细胞核，彻底清除绿水。",
        "whyEn": "Quickly exports decaying dead algae cells from the water to prevent secondary ammonia spikes.",
        "imageUrl": "/care-guides-handdrawn/07_green_water_fix_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_08",
    "category": "水质与环境突发",
    "categoryEn": "Water Quality & Emergencies",
    "title": "缸壁与水草大面积爆发褐色/黑色藻类",
    "titleEn": "Heavy Brown Diatom and Black Algae Outbreak on Glass and Plants",
    "condition": "鱼缸玻璃上长满一层发黄的褐斑泥膜（褐藻），或者水草叶边与沉木上附着顽固的刷状黑毛（黑毛藻），影响美观且阻碍水草呼吸。",
    "conditionEn": "Aquarium glass, plant leaves, and rocks become coated in an unsightly, dusty brown slime layer of diatoms and black brush algae.",
    "avoid": "严禁盲目大剂量乱倒化学除藻剂，容易导致水草融叶和敏感虾类团灭。",
    "avoidEn": "Do not use metal scouring pads that scratch glass; do not dose harsh chemical algaecides with live ornamental invertebrates.",
    "imageUrl": "/care-guides-handdrawn/08_algae_control.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/08_brown_algae_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "用磁力刮藻刀把玻璃上的斑块刮除",
        "titleEn": "Use a magnetic scraper or clean razor blade to scrape glass clean",
        "how": "手持磁力刷贴紧玻璃来回推动，将附着的藻类刮落到水中。",
        "howEn": "Slide a magnetic algae cleaner or stainless-steel scraper firmly down the glass to peel off the brown algae film.",
        "why": "清除玻璃观赏面的顽固藻斑，改善光照通透度。",
        "whyEn": "Physical removal instantly clears aesthetic viewing glass and prevents diatoms from hardening into stubborn crusts.",
        "imageUrl": "/care-guides-handdrawn/08_algae_control_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "用长弯剪直接剪掉长满黑毛的老叶",
        "titleEn": "Introduce a cleanup crew of Nerite snails and Otocinclus catfish",
        "how": "拿起水草修剪剪刀，沿着黑毛藻密布的老叶根部直接剪断捞出。",
        "howEn": "Add 2 to 3 Nerite snails or a pair of Otocinclus catfish to the aquarium.",
        "why": "黑毛藻与水草组织紧密纠缠难以剥除，修剪老叶是阻断其扩散的最快方法。",
        "whyEn": "Otocinclus catfish and Nerite snails have specialized rasping mouthparts that actively consume diatoms from delicate plant leaves without harming foliage.",
        "imageUrl": "/care-guides-handdrawn/08_algae_control_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "放入3-5只黑壳虾与工具鱼清理残藻",
        "titleEn": "Reduce lighting duration to 6 hours daily",
        "how": "引入黑壳虾、鲍鱼螺或黑线飞狐，并将日常开灯时间压缩至每天5-6小时。",
        "howEn": "Set the light timer to run for only 5 to 6 hours per day and move the tank away from direct window sunlight.",
        "why": "利用生物天性啃食微小藻丝，并通过减少光照时间压制藻类复发。",
        "whyEn": "Diatom and nuisance algae reproduction is directly triggered by excessive photoperiods and ambient window light.",
        "imageUrl": "/care-guides-handdrawn/08_algae_control_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_09",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼群浮头大口喘气（严重缺氧）",
    "titleEn": "Fish Gasping at Surface with Rapid Breathing (Severe Hypoxia)",
    "condition": "所有鱼聚集在水面附近，嘴巴伸出水面急速开合喘气，反应迟钝甚至侧翻，表明水体溶氧耗尽或氨氮中毒，若不抢救几小时内全缸覆灭。",
    "conditionEn": "All fish gather at the water surface with mouths opening and closing rapidly, gulping for air, indicating depleted dissolved oxygen or acute ammonia poisoning that will wipe out the tank within hours.",
    "avoid": "缺氧时严禁喂食；严禁在浮头未缓解时大量下药。",
    "avoidEn": "Strictly prohibit feeding during oxygen depletion; do not dose medications into the tank until gasping symptoms have completely subsided.",
    "imageUrl": "/care-guides-handdrawn/09_gasping_fish_emergency.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/09_gasping_fish_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "立即开启大流量打氧",
        "titleEn": "Immediately turn on high-flow aeration",
        "how": "立刻将气泵气石放入水中开至最大，或将过滤器出水口抬出水面剧烈冲砸出白色气泡水花。",
        "howEn": "Place an air stone on maximum output or raise the filter outflow pipe above the water surface to create crashing white foam ripples.",
        "why": "水面水花剧烈震荡能最快速将空气中的氧分子压入水体，解除窒息。",
        "whyEn": "Violent surface water agitation rapidly drives atmospheric oxygen molecules into the water column to relieve asphyxiation.",
        "imageUrl": "/care-guides-handdrawn/09_gasping_fish_emergency_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "捞走吃不完的残饵",
        "titleEn": "Net out uneaten food and organic debris",
        "how": "用细网把漂浮在水面和沉在底部的残余饲料迅速捞出丢掉。",
        "howEn": "Use a fine mesh net to quickly scoop out all floating and settled food particles from the substrate and discard them.",
        "why": "残留饲料在水中分解会疯狂吞噬宝贵氧气，捞走残饵即刻遏制耗氧。",
        "whyEn": "Decomposing food consumes enormous amounts of dissolved oxygen; removing it stops ongoing biochemical oxygen depletion immediately.",
        "imageUrl": "/care-guides-handdrawn/09_gasping_fish_emergency_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "换少量温水，关灯静养",
        "titleEn": "Perform a 20% water change with conditioned water and turn off lights",
        "how": "换出20%水体带走溶存毒素，关闭鱼缸照明灯保持昏暗。",
        "howEn": "Siphon out 20% of tank water to remove dissolved toxins, refill gently, and switch off aquarium lights to keep the tank dim.",
        "why": "昏暗环境能让受惊休克的鱼减慢心跳和呼吸耗氧，平稳度过危机。",
        "whyEn": "A dim, tranquil environment slows fish heart rates and respiration demands, helping stressed fish stabilize safely.",
        "imageUrl": "/care-guides-handdrawn/09_gasping_fish_emergency_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_10",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼体布满密密麻麻的小白点（白点病）",
    "titleEn": "Fish Covered in Fine White Sugar-Like Dots (Ich / White Spot Disease)",
    "condition": "鱼身上和鱼鳍上布满像细盐粒一样的小白点，鱼精神萎靡，不时在沉木和沙石上疯狂蹭痒，这是小瓜虫寄生病。",
    "conditionEn": "Fish body, fins, and gills are sprinkled with countless tiny white salt-like spots caused by the ciliate parasite Ichthyophthirius multifiliis, accompanied by clamped fins and shivering swimming behavior.",
    "avoid": "严禁使用加碘食用盐；严禁突然直接从24°C一口气升到30°C。",
    "avoidEn": "Never use iodized table salt with anti-caking agents; do not stop heat treatment immediately when spots disappear (continue for at least 3 extra days to kill juvenile cysts).",
    "imageUrl": "/care-guides-handdrawn/10_ich_white_spot.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/10_white_spot_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "加热棒缓慢升温恒定在30°C",
        "titleEn": "Gradually raise water temperature to 30°C (86°F)",
        "how": "每2小时将加热棒旋钮上调1度，最终设定在30°C，连续保持5-7天。",
        "howEn": "Adjust the aquarium heater upward by 1°C every 2 hours until the tank reaches a stable 30°C (86°F), maintaining this temperature for 7 days.",
        "why": "小瓜虫在28°C以上停止分裂繁殖，30°C高温会使其自然脱落死亡。",
        "whyEn": "Ich parasites cannot survive or replicate at temperatures above 28°C (82°F); heat accelerates their life cycle, forcing them to drop off the fish.",
        "imageUrl": "/care-guides-handdrawn/10_ich_white_spot_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "往缸中加入千分之三专用无碘粗盐",
        "titleEn": "Add aquarium coarse salt at a concentration of 0.3%",
        "how": "按100升水放300克大颗粒粗盐，化开后分两次沿出水口倒入。",
        "howEn": "Weigh 3 grams of non-iodized aquarium coarse sea salt per 1 liter of water, dissolve it in a cup of tank water, and pour it gradually into the filter outflow.",
        "why": "微量盐度能调节水体渗透压，刺激鱼体分泌健康黏液保护皮肤创口。",
        "whyEn": "Mild saline water alters osmotic pressure, puncturing the cell walls of free-swimming theront parasites while assisting fish slime coat repair.",
        "imageUrl": "/care-guides-handdrawn/10_ich_white_spot_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "每天换掉五分之一水并吸走缸底脱落虫体",
        "titleEn": "Increase aeration to compensate for reduced oxygen in warm water",
        "how": "每天用换水管吸走底沙表面的沉积残渣，并补充等温无氯新水。",
        "howEn": "Turn the air pump output to maximum throughout the heat treatment period.",
        "why": "将脱落到底部的休眠虫胞物理吸除，阻止其二次孵化重新寄生。",
        "whyEn": "High water temperatures substantially reduce dissolved oxygen capacity; strong aeration prevents fish suffocation during treatment.",
        "imageUrl": "/care-guides-handdrawn/10_ich_white_spot_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_11",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼鳍裂开、边缘发白腐烂（烂尾烂鳍）",
    "titleEn": "Frayed, Whitish, Eroded Fin Margins (Bacterial Fin and Tail Rot)",
    "condition": "鱼尾巴或背鳍开裂破损呈流苏状，边缘有一圈发红充血或发白发霉的腐烂白边，多因外伤后水质太脏被细菌感染所致。",
    "conditionEn": "Fish caudal and dorsal fins show ragged, torn edges with cloudy white necrosis and bloody red streaks, caused by opportunistic Aeromonas or Pseudomonas bacterial infection in degraded water.",
    "avoid": "严禁在水草主缸中大剂量泼洒抗生素破坏整个生化过滤系统。",
    "avoidEn": "Avoid grabbing fish with dry hands which strips protective mucus; never pour antibiotics directly into the main display tank as it destroys nitrifying bacteria.",
    "imageUrl": "/care-guides-handdrawn/11_fin_rot_treatment.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/11_fin_rot_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "用捞网把病鱼捞入独立小药盆隔离",
        "titleEn": "Perform daily 20% water changes for 3 consecutive days",
        "how": "用小塑料盒装入原缸老水，用网兜把烂鳍病鱼单独转移至小盒中。",
        "howEn": "Siphon out 20% of bottom water daily and refill with conditioned, temperature-matched fresh water.",
        "why": "建立独立治疗环境，防止病菌在主缸蔓延，且利于精确控制药量。",
        "whyEn": "Pristine water quality with minimal organic waste is the most critical foundation for stopping bacterial spread and promoting fin tissue regeneration.",
        "imageUrl": "/care-guides-handdrawn/11_fin_rot_treatment_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "滴入微量抗菌药（黄粉或杀菌水）药浴",
        "titleEn": "Isolate the sick fish and dab fin edges with diluted povidone-iodine",
        "how": "滴入专用黄粉溶液至水呈微淡黄色，浸泡病鱼药浴20-30分钟。",
        "howEn": "Net the fish into a shallow damp towel, use a fine cotton swab dipped in diluted povidone-iodine to lightly touch the frayed fin edges, then return the fish to water within 10 seconds.",
        "why": "针对革兰氏阳性/阴性菌进行外用杀菌，阻止尾鳍组织继续坏死溃烂。",
        "whyEn": "Topical antiseptic application directly sterilizes active bacterial infection sites on the fins without polluting the main tank filter.",
        "imageUrl": "/care-guides-handdrawn/11_fin_rot_treatment_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "主缸彻底换掉三分之一新水",
        "titleEn": "Dose mild aquarium broad-spectrum antiseptic solution into the isolation tank",
        "how": "主鱼缸抽出1/3陈水，慢慢补入温和新水并洗净过滤棉。",
        "howEn": "Add yellow powder (nitrofurazone) or methylene blue into an isolation quarantine tank at the recommended dosage.",
        "why": "烂尾的根本诱因是水质菌群超标，优化主缸水质才能彻底断绝复发。",
        "whyEn": "Inhibits secondary fungal infection (Saprolegnia) and protects raw exposed fin rays while healing.",
        "imageUrl": "/care-guides-handdrawn/11_fin_rot_treatment_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_12",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼肚子朝天漂浮或沉底翻滚（失鳔病）",
    "titleEn": "Fish Floating Upside Down or Rolling at Bottom (Swim Bladder Disorder)",
    "condition": "鱼游动失控，头朝下肚子朝上倒立漂浮在水面，或侧翻躺在缸底像石头一样，但鱼鳃依然在快速起伏呼吸，此为鱼鳔调节失调。",
    "conditionEn": "Round-bodied fancy goldfish or bettas lose buoyancy control, floating helplessly belly-up at the surface or tumbling sideways on the bottom gravel, usually caused by overfeeding, constipation, or cold water.",
    "avoid": "失鳔期间严禁投喂硬质干燥膨胀饲料；严禁留在深水大缸中强水流冲刷。",
    "avoidEn": "Strictly avoid feeding dry, expanding pellet food directly; never leave floating belly-up fish exposed to air without lowering water or providing floating support.",
    "imageUrl": "/care-guides-handdrawn/12_swim_bladder_care.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/12_swim_bladder_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "把病鱼放入浅水盒，水位仅没过鱼背5厘米",
        "titleEn": "Lower water level to 15 cm and raise temperature to 28°C",
        "how": "将鱼转移到水深只有5-8厘米的平底隔离盒中静养。",
        "howEn": "Drain tank water down to a shallow depth of 12 to 15 cm (5 to 6 inches) and raise heater temperature to 28°C (82°F).",
        "why": "极浅水深能大幅减轻水压负担，防止病鱼因拼命挣扎调整平衡而力竭虚脱。",
        "whyEn": "Shallow water reduces hydrostatic pressure on the abdomen and lets the fish rest upright without exhausting itself swimming.",
        "imageUrl": "/care-guides-handdrawn/12_swim_bladder_care_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "彻底停食整整3天",
        "titleEn": "Fast the fish completely for 3 days",
        "how": "连续72小时完全断食，不喂任何饲料颗粒。",
        "howEn": "Do not feed any food for 3 consecutive days.",
        "why": "大部分失鳔由于暴食干粮膨胀挤压鱼鳔，断食能促使消化道排空积食与肠气。",
        "whyEn": "Allows the compacted digestive tract to empty naturally, relieving physical pressure exerted on the adjacent swim bladder organ.",
        "imageUrl": "/care-guides-handdrawn/12_swim_bladder_care_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "喂食一小颗煮熟剥皮的甜豌豆泥",
        "titleEn": "Feed a boiled, peeled green pea",
        "how": "水煮一颗青豌豆至软烂，剥掉外皮捏成微小泥末，投喂米粒大的一点点。",
        "howEn": "Boil a fresh green pea until soft, remove the fibrous outer skin, crush the soft interior into tiny flakes, and feed a small portion to the fish.",
        "why": "熟豌豆富含天然植物水溶性纤维，能帮助鱼类肠道润滑通便解除胀气。",
        "whyEn": "Green pea fiber acts as a natural, gentle laxative that clears intestinal blockage and restores normal swim bladder inflation.",
        "imageUrl": "/care-guides-handdrawn/12_swim_bladder_care_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_13",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼鳞片像松果一样炸开、腹部水肿（炸鳞腹水）",
    "titleEn": "Scales Flared Out Like a Pinecone with Abdominal Swelling (Dropsy)",
    "condition": "从正上方看，鱼身体两边的鳞片全部像打开的松果一样外立支棱，腹部肿胀发亮，表明体内严重细菌感染并发肾衰竭水肿。",
    "conditionEn": "Fish belly swells like a balloon and body scales stick straight out like an open pinecone, accompanied by bulging eyes, signaling acute internal kidney failure and fluid accumulation.",
    "avoid": "切勿拖延至全身严重炸鳞才隔离；切勿在强水流直冲环境下药浴。",
    "avoidEn": "Do not use table salt or high-sodium salt (which worsens fluid retention); do not wait until scales are 100% flared before starting treatment.",
    "imageUrl": "/care-guides-handdrawn/13_dropsy_pinecone.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/13_dropsy_pinecone_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "单独隔离，加入千分之五泻盐水",
        "titleEn": "Immediately transfer sick fish to an isolation hospital tank",
        "how": "在小治疗盒中按每升水放5克硫酸镁（泻盐），化匀后放入病鱼。",
        "howEn": "Set up a dedicated 10-liter hospital container with an air stone and heater set to 28°C (82°F), and transfer the sick fish using a water-filled container.",
        "why": "泻盐能通过高渗透压原理将鱼体内腹腔蓄积的多余组织液吸拔出来。",
        "whyEn": "Dropsy often stems from internal bacterial infection; isolation prevents contagion and allows precise medication.",
        "imageUrl": "/care-guides-handdrawn/13_dropsy_pinecone_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "水温恒定在28°C并提供柔和微打氧",
        "titleEn": "Prepare an Epsom salt (Magnesium Sulfate) therapeutic bath",
        "how": "用小加热棒维持28°C水温，出气石调至极其柔和微细气泡。",
        "howEn": "Dissolve pure Epsom salt (magnesium sulfate) at 2 grams per liter of water in the hospital tank.",
        "why": "恒温能减轻病鱼代谢负荷，微弱水流避免扰动其衰弱的体躯。",
        "whyEn": "Magnesium sulfate draws excess retained fluid out of the fish's body tissues via gentle osmotic dehydration, reducing internal abdominal pressure.",
        "imageUrl": "/care-guides-handdrawn/13_dropsy_pinecone_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "配合水产广谱抗菌药连续药浴5天",
        "titleEn": "Dose veterinary internal antibacterial medication (Kanamycin / Enrofloxacin)",
        "how": "在药盒中加入杀菌消炎药，每天换掉半盒药水补入新配制等温药液。",
        "howEn": "Dissolve aquatic-grade antibacterial medication into the hospital tank according to exact veterinary dosing guidelines.",
        "why": "从根源遏制攻击内脏腺体的产气单胞菌等致病菌株。",
        "whyEn": "Targets internal systemic bacterial infections in the kidneys and abdominal cavity to arrest organ failure.",
        "imageUrl": "/care-guides-handdrawn/13_dropsy_pinecone_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_14",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼眼睛蒙上一层白雾甚至向外突出（蒙眼凸眼）",
    "titleEn": "Opaque Whitish Film Covering Fish Eyes (Cloudy Eye / Cataract Disease)",
    "condition": "鱼眼球表面蒙上一层发白的混浊毛玻璃样白膜，甚至眼球整个向外肿胀凸出，多由于水质长时间偏酸腐败引发的角膜细菌感染。",
    "conditionEn": "One or both eyes of the fish turn foggy white with a translucent haze or protruding swelling, caused by poor water quality, mechanical corneal injury, or bacterial infection.",
    "avoid": "严禁直接用干手用力抓鱼摩擦眼球；切勿把药膏大团大块挤入鱼鳃中。",
    "avoidEn": "Never hold fish with dry hands or rub the delicate cornea; do not smear thick clumps of ointment into the sensitive gill operculum.",
    "imageUrl": "/care-guides-handdrawn/14_cloudy_popeye.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/14_cloudy_eye_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "连续3天每天换掉五分之一水",
        "titleEn": "Perform a 30% water change and clean mechanical filter floss",
        "how": "每天抽取缸底20%老水，补入等温新水，稀释全缸细菌密度。",
        "howEn": "Change 30% of tank water and replace dirty mechanical filter floss to restore water clarity.",
        "why": "蒙眼最主要的病原是水质脏，清新水质是角膜自我愈合的基础环境。",
        "whyEn": "High nitrate levels and dirty water irritate the eye cornea; clean water provides the foundation for natural tissue recovery.",
        "imageUrl": "/care-guides-handdrawn/14_cloudy_popeye_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "用细棉签蘸取微量红霉素眼膏抹在眼球表面",
        "titleEn": "Apply a tiny dab of veterinary antibiotic eye ointment with a sterile cotton swab",
        "how": "用湿透的柔和纸巾托住鱼身，用医用棉签在突出发白眼球上涂薄薄一层眼膏后迅速放回水里。",
        "howEn": "Rest the fish on a moist soft towel, use a cotton swab to apply a whisper-thin layer of erythromycin or terramycin eye ointment onto the cloudy eye, and return fish to water immediately.",
        "why": "抗生素油膏附着在角膜上进行针对性消炎，防止眼球溃破失明。",
        "whyEn": "Antibiotic ointment adheres to the cornea to suppress localized bacterial infection and prevent corneal perforation.",
        "imageUrl": "/care-guides-handdrawn/14_cloudy_popeye_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "关掉强光射灯，保持柔和弱光环境",
        "titleEn": "Dim aquarium lights and provide a calm, low-stress environment",
        "how": "暂时熄灭高亮度鱼缸水草灯，避免直射光线刺激受损眼睛。",
        "howEn": "Turn off bright plant lighting or reduce fixture brightness to ambient room levels.",
        "why": "发炎的眼球对光极其敏感，暗光环境能消除应激加速组织再生。",
        "whyEn": "Inflamed eyes are hypersensitive to intense light; dim lighting prevents photophobia stress and accelerates corneal healing.",
        "imageUrl": "/care-guides-handdrawn/14_cloudy_popeye_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_15",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Disease & Physical Emergencies",
    "title": "鱼在水底沙石上疯狂擦身摩擦（体外寄生虫）",
    "titleEn": "Fish Frantically Flashing and Rubbing Body Against Gravel (External Parasites)",
    "condition": "鱼在水中游动时身体剧烈摆动打挺，像发疯一样用身体侧面撞击缸底沙石或沉木摩擦，表明有锚头鳋、指环虫等体外寄生虫叮咬刺痛皮肉。",
    "conditionEn": "Fish swims erratically, darting and scratching its flanks against gravel, rocks, or driftwood to relieve intense itching, caused by skin flukes (Gyrodactylus) or anchor worms.",
    "avoid": "切勿擅自超剂量倒药；家里有观赏虾、螺类需提前捞出，杀虫药会毒死甲壳类。",
    "avoidEn": "Never exceed recommended medication doses; remove pet snails and ornamental shrimp before dosing, as antiparasitics are fatal to invertebrates.",
    "imageUrl": "/care-guides-handdrawn/15_fluke_parasite.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/15_flukes_scratch_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "捞入透明杯仔细观察体表并用小镊子拔除可见大虫",
        "titleEn": "Inspect the fish in a clear cup and manually pluck large visible parasites with tweezers",
        "how": "用透明小量杯盛鱼，手电照射体表，若有类似白色细线或小锚状虫体插在鱼鳞间，用圆头镊子轻轻夹出拔除。",
        "howEn": "Place fish in a clear specimen cup under good light. If white thread-like anchor worms or fish lice are visible, gently pluck them off with blunt tweezers.",
        "why": "直观清除已钻入肌肉深处的大型成虫，阻止其持续吸血。",
        "whyEn": "Manually removes adult parasites that have deeply burrowed into the skin, preventing continuous blood loss and wound ulceration.",
        "imageUrl": "/care-guides-handdrawn/15_fluke_parasite_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "按剂量全缸泼洒体外寄生虫杀虫药水",
        "titleEn": "Dose external antiparasitic medication (Praziquantel) across the entire tank",
        "how": "按说明书称量杀虫液，先在小量杯中用水稀释化开，然后均匀倒在过滤器出水口冲散。",
        "howEn": "Dissolve praziquantel or anti-fluke medication in a cup of water and pour evenly into the filter outflow.",
        "why": "杀死潜伏在鱼鳃深处与水体底砂中肉眼不可见的水蚤与幼虫。",
        "whyEn": "Eradicates microscopic fluke larvae and cysts dwelling deep inside the gill filaments and substrate.",
        "imageUrl": "/care-guides-handdrawn/15_fluke_parasite_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "48小时后换水三分之一并在过滤器中塞入活性炭",
        "titleEn": "Change 1/3 of the water after 48 hours and add activated carbon to filter",
        "how": "用药满两天后抽换1/3水，在过滤槽中放入一包净水活性炭包。",
        "howEn": "48 hours after dosing, siphon out 1/3 of the water and insert an activated carbon pouch into the filter compartment.",
        "why": "活性炭能强效吸除水体中残存的化学农药成分，防止鱼群药物蓄积中毒。",
        "whyEn": "Activated carbon adsorbs remaining chemical residues, preventing toxic accumulation in fish organs.",
        "imageUrl": "/care-guides-handdrawn/15_fluke_parasite_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_16",
    "category": "繁殖、争斗与日常维护",
    "categoryEn": "Breeding, Conflicts & Maintenance",
    "title": "母鱼怀孕临产与鱼苗抢救",
    "titleEn": "Pregnant Mother Fish Giving Birth and Newborn Fry Rescue",
    "condition": "胎生观赏鱼（孔雀、玛丽、剑尾）母鱼肚子呈90度方形胀满，肛门处胎斑呈暗黑色，独自缩在角落急促呼吸，即将生产鱼苗。",
    "conditionEn": "Female livebearer (guppy, platy, molly, swordtail) exhibits a distended boxy 90-degree abdomen, dark black gravid spot near the vent, and retreats to tank corners breathing rapidly, ready to deliver fry.",
    "avoid": "严禁在无遮挡透明盒中强光照射临产母鱼；生完后绝不能将母鱼与幼苗同层混养。",
    "avoidEn": "Never shine harsh direct flashlights onto laboring females; never leave mother and fry in the same undivided container after birth.",
    "imageUrl": "/care-guides-handdrawn/16_pregnant_fish_care.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/16_guppy_birth_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "把大肚子母鱼捞进隔离盒",
        "titleEn": "Transfer pregnant female into a floating nursery breeding box",
        "how": "将带隔网的漂浮双层亚克力繁殖盒固定在缸壁水面，用软捞网把母鱼轻柔放入上层。",
        "howEn": "Mount a dual-chamber acrylic breeding box to the tank wall and gently guide the mother fish into the upper compartment using a soft net.",
        "why": "小鱼生出后会自动通过格栅漏到下层保护仓，避免被母鱼自己吃掉。",
        "whyEn": "Newborn fry automatically drop through the slotted V-shaped divider into the lower chamber, preventing the mother from consuming her young.",
        "imageUrl": "/care-guides-handdrawn/16_pregnant_fish_care_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "盒内放点水草保持安静",
        "titleEn": "Place a sprig of live moss inside the box to keep the mother calm",
        "how": "往盒中丢入一小簇莫斯水草或几片浮草，周围不要有强光或人影晃动。",
        "howEn": "Drop a small clump of Java moss or floating hornwort into the box and avoid bright room lights or sudden movements nearby.",
        "why": "提供隐蔽遮蔽感，防止母鱼在陌生封闭盒中高度紧张导致难产或跳缸。",
        "whyEn": "Provides natural shelter and security, preventing high stress that causes premature labor or jumping.",
        "imageUrl": "/care-guides-handdrawn/16_pregnant_fish_care_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "生完把母鱼捞走留小鱼",
        "titleEn": "Return the mother fish to the main tank once labor is finished",
        "how": "母鱼腹部明显变瘪排空后，用网将母鱼捞回大缸，小鱼苗继续留在盒中单独投喂。",
        "howEn": "After the female's abdomen flattens and no new fry appear, gently net the mother back into the main tank, keeping fry in the nursery box.",
        "why": "生完后的母鱼极度饥饿会伺机捕食鱼苗；小鱼单独隔离方便精准喂养。",
        "whyEn": "Post-labor females are voraciously hungry; separating her immediately safeguards the newborn fry for targeted feeding.",
        "imageUrl": "/care-guides-handdrawn/16_pregnant_fish_care_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_17",
    "category": "繁殖、争斗与日常维护",
    "categoryEn": "Breeding, Conflicts & Maintenance",
    "title": "刚出生的小鱼苗开口喂食（育苗保活）",
    "titleEn": "Feeding Newly Hatched Fish Fry (First Food & Survival Care)",
    "condition": "小鱼刚出生第2天，腹部金黄色卵黄囊吸收干净，像缝衣针般大小游动觅食，因嘴巴极其微小吞不下常规大颗粒饲料，面临饥饿死亡危机。",
    "conditionEn": "On day 2 after birth, newborn fry absorb their golden yolk sacs and start swimming actively to forage. Because their mouths are needle-thin, they cannot ingest standard dry fish flakes and risk starvation.",
    "avoid": "严禁一次性倒入大团蛋黄导致整盒水发臭浑浊；严禁投喂硬质大颗粒干饲料。",
    "avoidEn": "Never dump large chunks of egg yolk into the water; never feed uncrushed, hard adult dry pellets to newborn fry.",
    "imageUrl": "/care-guides-handdrawn/17_fry_feeding_care.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/17_fry_feeding_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "煮熟鸡蛋取出微量蛋黄化成水",
        "titleEn": "Boil a chicken egg and dissolve a pinch of yolk in warm water",
        "how": "剥取米粒大小的纯熟蛋黄，放在小汤匙里滴入几滴温水搅拌碾成淡黄色蛋黄水。",
        "howEn": "Extract a grain-of-rice-sized speck of hard-boiled egg yolk, place it in a spoon, and mix with a few drops of warm water into a pale yellow suspension.",
        "why": "蛋黄微粒细小如粉尘，是小鱼初生阶段天然的高营养开口饵料。",
        "whyEn": "Egg yolk particles disperse into fine microscopic dust, serving as an ideal protein-dense starter food for tiny fry mouths.",
        "imageUrl": "/care-guides-handdrawn/17_fry_feeding_care_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "用胶头滴管在小鱼嘴边轻滴一滴",
        "titleEn": "Use a glass pipette dropper to deliver 1 to 2 droplets near fry",
        "how": "吸取微量蛋黄水，将管口探入小鱼游动的水层轻轻挤出1-2滴雾状颗粒。",
        "howEn": "Draw a tiny amount of yolk liquid into a pipette and gently release 1 to 2 clouds directly near the swimming fry.",
        "why": "微粒悬浮在鱼苗吻部方便其吞食，看到小鱼透明肚子里呈现微黄颗粒即刻停止投喂。",
        "whyEn": "Suspended micro-particles allow fry to feed effortlessly. Stop feeding as soon as the fry's translucent bellies turn slightly golden.",
        "imageUrl": "/care-guides-handdrawn/17_fry_feeding_care_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "两小时后用小细管把盒底残渣吸走",
        "titleEn": "Siphon out uneaten debris from the nursery box bottom after 2 hours",
        "how": "投喂2小时后，用长吸管对准隔离盒底吸除沉积下来的白絮状未吃完残渣。",
        "howEn": "Two hours after feeding, use a thin air tube to siphon away white fluffy settled yolk waste from the container bottom.",
        "why": "蛋黄极其容易变质发臭滋生大量水霉菌，必须及时清理保护稚嫩鳃丝。",
        "whyEn": "Egg yolk spoils rapidly and promotes lethal water mold (Saprolegnia); keeping the bottom clean protects delicate fry gills.",
        "imageUrl": "/care-guides-handdrawn/17_fry_feeding_care_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_18",
    "category": "繁殖、争斗与日常维护",
    "categoryEn": "Breeding, Conflicts & Maintenance",
    "title": "两只鱼疯狂打架追咬、咬烂鱼鳞（领地争斗）",
    "titleEn": "Aggressive Fish Fighting and Biting (Territorial Disputes & Fin Damage)",
    "condition": "缸内体型大或凶猛的鱼满缸狂追撕咬另一只弱小鱼，受害者背鳍撕裂、鳞片脱落，缩在过滤器管道后颤抖不敢游出，面临被咬死风险。",
    "conditionEn": "A dominant or aggressive fish relentlessly chases and nips a weaker tankmate, resulting in shredded fins, dislodged scales, and the victim shivering in fear behind filter pipes.",
    "avoid": "严禁对暴力追咬坐视不管；严禁在没有任何躲避物的空旷裸缸中混养好斗鱼种。",
    "avoidEn": "Never ignore persistent violent fin-nipping; never house semi-aggressive species in barren, empty tanks without shelter.",
    "imageUrl": "/care-guides-handdrawn/18_fish_fighting_isolation.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/18_fish_fighting_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "立即把受伤弱小鱼捞进隔离盒保护",
        "titleEn": "Immediately isolate the injured, weaker fish in a perforated floating box",
        "how": "先将挨打的弱小鱼捞出移入带孔透明漂浮盒中，单独投喂优质饲料恢复伤势。",
        "howEn": "Gently net the battered fish into a floating transparent nursery box inside the tank and feed it high-protein food to recover.",
        "why": "物理隔断伤害源，让受惊受创的鱼只迅速脱离死亡恐惧。",
        "whyEn": "Physically removes the target from danger, allowing the traumatized fish to heal safely without fear of predation.",
        "imageUrl": "/care-guides-handdrawn/18_fish_fighting_isolation_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "彻底打乱鱼缸里的沉木与石头摆放",
        "titleEn": "Completely rearrange driftwood, rocks, and plant layout in the tank",
        "how": "伸手将缸内的沉木、石块与植物全部挪换朝向与位置，重构缸底造景格局。",
        "howEn": "Move every piece of driftwood, rock, and plant to new orientations and locations, reconfiguring the entire hardscape.",
        "why": "强势鱼的领地占领基于视觉记忆，重布造景能彻底瓦解其既有地盘认知。",
        "whyEn": "Territorial aggression relies on spatial visual memory. Redecorating completely resets established boundary claims.",
        "imageUrl": "/care-guides-handdrawn/18_fish_fighting_isolation_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "多放几个带孔陶罐或茂密水草增加隐蔽洞穴",
        "titleEn": "Add ceramic caves or dense plant thickets to provide visual barriers",
        "how": "在缸底角落增设2-3个小异型瓦罐、陶管或密植蜈蚣草丛。",
        "howEn": "Place 2 to 3 hollow ceramic tubes or dense stem plants in corners of the tank.",
        "why": "提供视线阻隔屏障与钻入避险空间，让弱势鱼在遭遇追逐时能瞬时躲避。",
        "whyEn": "Creates line-of-sight visual barriers and escape tunnels, allowing chased fish to slip out of sight instantaneously.",
        "imageUrl": "/care-guides-handdrawn/18_fish_fighting_isolation_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_19",
    "category": "繁殖、争斗与日常维护",
    "categoryEn": "Breeding, Conflicts & Maintenance",
    "title": "清洗过滤器滤材（防止整缸水崩溃）",
    "titleEn": "Cleaning Filter Media Safely (Preventing Total Biological Collapse)",
    "condition": "过滤器出水水流明显变慢减弱，滤盒内堆积了厚厚一层黑泥鱼便，很多新手盲目整盒端到自来水龙头下猛冲，导致益生菌全军覆没而暴毙倒缸。",
    "conditionEn": "Filter outflow weakens significantly due to heavy black sludge and organic muck accumulation. Beginners often rinse media under tap water, accidentally slaughtering beneficial bacteria and wiping out the tank.",
    "avoid": "绝对禁止用自来水直接冲洗生化陶瓷环；绝对禁止使用任何洗洁精或肥皂水洗滤材。",
    "avoidEn": "Absolutely forbid rinsing ceramic bio-rings under chlorinated tap water; never use dishwashing detergent or soap on any aquarium equipment.",
    "imageUrl": "/care-guides-handdrawn/19_filter_cleaning_proper.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/19_filter_cleaning_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "拔掉电源，盛一盆鱼缸老水备用",
        "titleEn": "Unplug power and draw a bucket of old aquarium tank water",
        "how": "拔掉过滤器插头，从鱼缸里抽出一小塑料盆原缸旧水放置在身旁。",
        "howEn": "Disconnect filter power and siphon a plastic basin of old tank water into a bucket placed beside you.",
        "why": "生化滤材上的硝化细菌极其脆弱，必须用与缸水完全等温等质的水体清洗。",
        "whyEn": "Nitrifying bacteria colonies on biological media are delicate and must only be rinsed in water of identical temperature and chemistry.",
        "imageUrl": "/care-guides-handdrawn/19_filter_cleaning_proper_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "白色物理过滤棉用自来水搓洗干净或换新",
        "titleEn": "Wash mechanical filter floss thoroughly under tap water or replace with new floss",
        "how": "取出最表层挡大便的白色棉垫，在水龙头下猛烈冲洗揉搓，或直接换上一张新白棉。",
        "howEn": "Remove the top mechanical white wool pad, scrub it under running tap water, or discard and replace with a fresh white pad.",
        "why": "物理滤棉只负责阻拦大颗粒粪便，自来水彻底洗净不会影响底层生化系统。",
        "whyEn": "Mechanical floss only traps coarse physical debris; washing it in tap water has zero adverse effect on the biological system.",
        "imageUrl": "/care-guides-handdrawn/19_filter_cleaning_proper_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "生化陶瓷环只在老水盆里轻轻晃荡两下",
        "titleEn": "Gently swish biological ceramic rings in the bucket of tank water twice",
        "how": "装有生化球或陶瓷环的网袋放进刚刚盛出的原缸老水盆中，轻轻漂洗抖落表面浮泥即可装回。",
        "howEn": "Dip the mesh bag containing ceramic rings or bio-balls into the bucket of old aquarium water, gently shake off surface loose silt, and reinstall immediately.",
        "why": "严禁搓洗或自来水直冲，最大限度保留寄宿在陶瓷孔隙中的有益硝化菌群。",
        "whyEn": "Never scrub or wash under chlorinated tap water. Gentle rinsing preserves dense colonies of nitrifying bacteria dwelling in micropores.",
        "imageUrl": "/care-guides-handdrawn/19_filter_cleaning_proper_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_20",
    "category": "繁殖、争斗与日常维护",
    "categoryEn": "Breeding, Conflicts & Maintenance",
    "title": "出差或长假外出数天不在家（长假托养准备）",
    "titleEn": "Preparing Tank for Long Holidays and Vacations (Safe Care While Away)",
    "condition": "长假或春节需要外出7-10天，家里无人看管照顾鱼缸，极度担忧鱼饿死、水发黑发臭或设备突发断电故障。",
    "conditionEn": "Going away on vacation for 7 to 10 days with no one home to feed fish or monitor equipment, creating anxiety about starvation, water fouling, or power cuts.",
    "avoid": "外出期间切勿盲目加大投喂量‘喂饱’鱼只；切勿将灯光常开不关。",
    "avoidEn": "Never overfeed 'extra food' before departure to make up for future days; never leave lights continuously on 24/7.",
    "imageUrl": "/care-guides-handdrawn/20_holiday_vacation_care.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/20_holiday_care_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "出发前2天换水三分之一并吸除底便",
        "titleEn": "Perform a 30% water change and siphon bottom waste 2 days prior to departure",
        "how": "启程前48小时给鱼缸彻底大扫除，换掉30%水体，把沉底污垢吸净。",
        "howEn": "48 hours before leaving, thoroughly clean the aquarium, siphon 30% of water from the substrate, and replenish with fresh conditioned water.",
        "why": "提前给水体储备足够的清洁缓冲容量，稀释长假期间可能积攒的代谢物。",
        "whyEn": "Builds a substantial clean buffer capacity, diluting any metabolic waste that accumulates during your absence.",
        "imageUrl": "/care-guides-handdrawn/20_holiday_vacation_care_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "严禁投入所谓几天慢慢融化的自动投食块",
        "titleEn": "Strictly forbid using vacation slow-release white feeding blocks",
        "how": "外出期间不要在水里丢任何石膏投食块或大量自动投放饲料，让成鱼自然断食。",
        "howEn": "Do not drop plaster vacation feeding blocks or excessive automatic food into the tank; allow healthy adult fish to fast naturally.",
        "why": "市面所谓的缓释投食砖极易在缸底发霉腐败败坏整缸水；健康成鱼饿7-10天完全无性命之忧。",
        "whyEn": "Vacation feeder blocks disintegrate into rotting fungal muck that suffocates the tank. Healthy adult fish can easily fast for 7 to 10 days safely.",
        "imageUrl": "/care-guides-handdrawn/20_holiday_vacation_care_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "将鱼缸照明灯插在定时插座上设定每天开5小时",
        "titleEn": "Plug aquarium lighting into a timer set for 5 hours daily",
        "how": "给水草灯配一个机械或智能插座，设置每天定时开灯5小时，夜间保持黑暗。",
        "howEn": "Connect the light fixture to an analog mechanical or smart digital timer set to run for 5 hours per day, keeping the tank dark at night.",
        "why": "防止长时间全天亮灯导致全缸爆发灾难性绿藻，同时维持动植物自然昼夜节律。",
        "whyEn": "Prevents catastrophic green algae blooms caused by 24-hour continuous lighting while maintaining the biological circadian rhythm.",
        "imageUrl": "/care-guides-handdrawn/20_holiday_vacation_care_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_21",
    "category": "日常维护与基础运维",
    "categoryEn": "Routine Maintenance",
    "title": "鱼缸日常科学换水（每周例行吸污换水）",
    "titleEn": "Routine Aquarium Water Change (Weekly Siphon & Safe Refill)",
    "condition": "鱼缸长时间不换水会导致无色无味的硝酸盐和酸性老化物质剧烈累积，水质酸化且生长停滞；但若换水过猛或直接加生冷生自来水，残留余氯会瞬间灼伤鱼鳃致死。",
    "conditionEn": "Neglecting regular water changes causes invisible toxic nitrates and organic acids to accumulate, stunting fish growth and causing chronic acidosis. However, dumping raw cold tap water into the tank will instantly burn delicate gills with chlorine and cause lethal thermal shock.",
    "avoid": "切勿全缸100%彻底换水；切勿直接冲入未除氯的生冷自来水；切勿在换水时把鱼捞出。",
    "avoidEn": "Never perform 100% water changes; never pour raw unconditioned cold tap water directly into the tank; never net fish out during routine water changes.",
    "imageUrl": "/care-guides-handdrawn/21_routine_water_change.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/21_routine_water_change_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "脸盆静置晾水24小时",
        "titleEn": "Rest tap water in an open basin for 24 hours to evaporate chlorine",
        "how": "接满一盆自来水，敞口放在室内避光处静置24小时（有气泵可打气2小时加速挥发）。",
        "howEn": "Fill a clean basin with tap water and leave it uncovered indoors for 24 hours (or aerate for 2 hours) to let chlorine gas fully dissipate naturally.",
        "why": "让自来水中的残留余氯自然挥发，且让水温与室内鱼缸温度完全平衡。",
        "whyEn": "Allows lethal chlorine gas to evaporate completely and equalizes water temperature with the aquarium.",
        "imageUrl": "/care-guides-handdrawn/21_routine_water_change_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "洗砂器吸底换水1/4",
        "titleEn": "Siphon debris from substrate and drain 1/4 water",
        "how": "虹吸洗砂头插到底砂深处翻吸沉淀的鱼粪和残饵，抽走整缸四分之一的水位后停止。",
        "howEn": "Insert the gravel siphon vacuum deep into the substrate to extract settled fish waste and debris, stopping precisely when 1/4 of total water volume is drained.",
        "why": "物理移走氨氮毒素的温床，且只换四分之一绝不伤及原有硝化生态和鱼的渗透压。",
        "whyEn": "Physically eliminates the primary source of toxic ammonia while preserving 75% of established biological filter and osmotic balance.",
        "imageUrl": "/care-guides-handdrawn/21_routine_water_change_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "沿缸壁极慢注入新水",
        "titleEn": "Slowly pour temperature-matched clean water along glass wall",
        "how": "用小水瓢舀晾好的新水，贴着鱼缸侧壁缓缓滑入，分5分钟慢速加满至原水位。",
        "howEn": "Use a small ladle to gently glide the dechlorinated water down the aquarium glass wall over 5 minutes until normal water level is restored.",
        "why": "防止猛烈冲水激起底泥粉尘，并确保温差变动小于1°C，避免鱼只感冒缩鳍。",
        "whyEn": "Prevents substrate dust clouds and ensures water temperature fluctuation is strictly under 1°C, preventing thermal shock.",
        "imageUrl": "/care-guides-handdrawn/21_routine_water_change_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_22",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Diseases & Emergencies",
    "title": "鱼鳍紧缩夹拢、趴在缸底不动（夹尾缩鳍）",
    "titleEn": "Clamped Fins and Bottom Sitting (Thermal Shock & Stress)",
    "condition": "鱼背鳍、尾鳍像收拢的折扇一样紧缩成一条线，独处在缸底角落或加热棒后面不游动，食欲废绝，这是鱼体处于极度不适或急性温差应激的最早预警信号。",
    "conditionEn": "The fish holds its dorsal, ventral, and tail fins tightly clamped against its body like a closed folding fan, resting motionlessly at the bottom corner or behind the heater. This is the earliest physiological distress signal of severe stress, chill, or water deterioration.",
    "avoid": "缩鳍期间严禁盲目大剂量乱下猛药；严禁突然升温超过3度；严禁强行喂食。",
    "avoidEn": "Do not dose harsh antibiotics blindly; do not raise temperature by more than 3°C rapidly; do not force-feed.",
    "imageUrl": "/care-guides-handdrawn/22_clamped_fins_bottom_sitting.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/22_clamped_fins_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "加热棒升温至26-28度",
        "titleEn": "Gradually raise heater temperature to 26-28°C",
        "how": "检查水温表，转动加热棒旋钮每两小时调高1度，最终恒定在26-28°C舒适区间。",
        "howEn": "Check thermometer and adjust heater knob by 1°C every two hours until water stabilizes at an optimal 26-28°C range.",
        "why": "温和升温能激活鱼体自身的新陈代谢与免疫防御力，缓解急性感冒僵直。",
        "whyEn": "Gentle warming activates the fish's natural metabolic enzymes and immune response, relieving cold-induced stiffness.",
        "imageUrl": "/care-guides-handdrawn/22_clamped_fins_bottom_sitting_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "换出五分之一等温老水",
        "titleEn": "Siphon out 1/5 aged bottom water and add fresh conditioned water",
        "how": "吸走底层少许沉积残渣并换出五分之一老水，缓慢补入等温除氯新水。",
        "howEn": "Gently vacuum bottom debris and drain 1/5 of aged water, replenishing with temperature-matched dechlorinated water.",
        "why": "稀释水体中累积的刺激性亚硝酸盐，减轻水质酸碱对受损神经的物理刺激。",
        "whyEn": "Dilutes irritating nitrites and chemical waste, relieving toxic nerve irritation on stressed fish.",
        "imageUrl": "/care-guides-handdrawn/22_clamped_fins_bottom_sitting_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "关灯停食静养48小时",
        "titleEn": "Turn off tank lights and fast fish for 48 hours",
        "how": "关闭鱼缸主照明灯，拉好盖板，连续两天不投喂任何饲料，保持环境昏暗安静。",
        "howEn": "Switch off display lights, secure the tank cover, and withhold all food for 48 hours in a peaceful, dim room.",
        "why": "昏暗环境能大幅减慢鱼的心率与耗氧负荷，避免消化食物消耗宝贵抵抗力。",
        "whyEn": "Darkness minimizes adrenaline and oxygen consumption, allowing the fish to redirect all metabolic energy toward cellular recovery.",
        "imageUrl": "/care-guides-handdrawn/22_clamped_fins_bottom_sitting_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_23",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Diseases & Emergencies",
    "title": "鱼体长出白色棉絮团毛毛（水霉真菌病）",
    "titleEn": "White Cotton Wool Fungus on Fish Body (Saprolegnia / Fungus)",
    "condition": "鱼体表刮伤或受寒后，伤口边缘长出一簇簇灰白色、毛茸茸像发霉米饭一样的絮状菌丝，随着水流飘动，病鱼食欲减退、消瘦衰弱。",
    "conditionEn": "After mechanical trauma, netting injury, or cold exposure, fluffy off-white cotton-like fungal tufts grow across the fish's body, fins, or mouth, swaying in the current as the fish becomes lethargic and loses weight.",
    "avoid": "严禁用镊子硬拔白色菌丝（会撕裂皮肉致大出血溃烂）；严禁在水草主缸泼洒甲基蓝（会染蓝硅胶并杀灭水草）。",
    "avoidEn": "Never forcefully pull fungal tufts with tweezers; never pour methylene blue directly into planted display tanks (it permanently stains silicone and destroys plants).",
    "imageUrl": "/care-guides-handdrawn/23_cotton_wool_fungus.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/23_cotton_wool_fungus_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "棉签蘸淡碘伏点涂白毛",
        "titleEn": "Dab white fungal tuft with diluted povidone-iodine on cotton swab",
        "how": "将病鱼捞入湿毛巾浅托盘，用医用棉签蘸微量淡碘伏轻点菌丝处（避开鱼眼和鱼鳃）。",
        "howEn": "Rest the fish on a moist cloth in a shallow tray and use a sterile cotton swab dipped in mild povidone-iodine to gently dab the fungus (strictly avoid eyes and gills).",
        "why": "碘伏具有极强的局部触杀真菌能力，能直达菌丝根部切断感染蔓延。",
        "whyEn": "Povidone-iodine provides powerful local contact fungicidal action, penetrating fungal roots without burning surrounding tissue.",
        "imageUrl": "/care-guides-handdrawn/23_cotton_wool_fungus_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "隔离盒滴入甲基蓝溶液",
        "titleEn": "Dose quarantine tank with methylene blue until pale sky-blue",
        "how": "将鱼转移至带微打氧的隔离小盒中，滴入甲基蓝杀菌液调至水体呈通透淡天蓝色。",
        "howEn": "Transfer the fish into a lightly aerated isolation container and add drops of methylene blue until water reaches a clear sky-blue tint.",
        "why": "甲基蓝能广谱抑制游离水霉真菌孢子着床，并保护受损表皮免受二次细菌侵染。",
        "whyEn": "Methylene blue effectively inhibits free-swimming water mold spores and protects exposed dermis from secondary bacterial infection.",
        "imageUrl": "/care-guides-handdrawn/23_cotton_wool_fungus_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "恒温28度真菌自然脱落",
        "titleEn": "Maintain constant 28°C until fungal hyphae detach naturally",
        "how": "加热棒锁定在28°C恒温3-5天，静待白色菌丝发白萎缩后自行脱落。",
        "howEn": "Lock water temperature at 28°C for 3 to 5 days, waiting for the white hyphae to shrivel and detach on their own.",
        "why": "水霉真菌嗜冷（最适繁殖温度在15-20°C），28°C高温会彻底抑制其菌丝活性促其脱水脱落。",
        "whyEn": "Saprolegnia is a cold-water fungus; sustained 28°C temperatures completely halt fungal reproduction, causing mycelia to dehydrate and drop off.",
        "imageUrl": "/care-guides-handdrawn/23_cotton_wool_fungus_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_24",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Diseases & Emergencies",
    "title": "鱼拖着长长的白色透明细丝便（肠炎与内寄）",
    "titleEn": "Fish Trailing Long White Stringy Feces (Enteritis & Indigestion)",
    "condition": "鱼屁股后面拖着一根很长的透明、空心白色黏液状细线便，久久不脱落，鱼腹部轻微凹陷或微胀，食欲减退甚至拒食，多因吃变质饲料或受寒引起消化道炎症。",
    "conditionEn": "The fish trails a persistent, hollow, translucent white mucous filament from its vent that refuses to detach. Accompanied by a sunken or mildly bloated belly and loss of appetite, this signals gastrointestinal enteritis or flagellate infection.",
    "avoid": "白便期间严禁继续投喂高蛋白活饵或油性大颗粒硬粮；严禁盲目大剂量下人用抗生素破坏鱼肝脏。",
    "avoidEn": "Do not feed high-protein live worms or oily pellets during enteritis; avoid heavy dosing of human antibiotics that induce organ toxicity.",
    "imageUrl": "/care-guides-handdrawn/24_white_stringy_poop.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/24_white_stringy_poop_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "彻底停食3天捞净残饵",
        "titleEn": "Completely fast fish for 3 days and scoop out all leftover food",
        "how": "拧紧饲料罐盖，连续整整72小时完全断粮，并用细网捞干净缸内漂浮和沉底的一切残渣。",
        "howEn": "Seal food jars tightly, enforce a strict 72-hour fast, and net out any visible organic remnants or uneaten food particles.",
        "why": "切断胃肠消化负荷，防止肠道因持续发酵产气加重黏膜充血水肿。",
        "whyEn": "Relieves gastrointestinal workload and halts intestinal fermentation, allowing swollen gut mucosa to rest and decompress.",
        "imageUrl": "/care-guides-handdrawn/24_white_stringy_poop_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "换水四分之一并升温28度",
        "titleEn": "Drain 1/4 water and raise temperature to 28°C",
        "how": "抽走底部四分之一陈水换入新水，温控旋钮上调至28°C加速血液循环。",
        "howEn": "Vacuum out 1/4 of aged bottom water and raise water temperature to 28°C to stimulate internal blood circulation.",
        "why": "优化水质降低病菌浓度，同时高温能刺激鱼的肠胃蠕动排空体内腐败积食。",
        "whyEn": "Dilutes pathogenic bacteria while optimal heat accelerates intestinal motility, expelling decaying gut toxins.",
        "imageUrl": "/care-guides-handdrawn/24_white_stringy_poop_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "稀释大蒜汁抑菌调理",
        "titleEn": "Mix diluted fresh garlic juice with feed or in quarantine bath",
        "how": "将新鲜大蒜瓣捣碎压汁，取两滴用纯净水稀释后拌入微量鱼粮喂食，或滴入隔离水体中。",
        "howEn": "Crush fresh garlic to extract juice, dilute 2 drops in clean water, and soak a tiny pinch of dry pellets (or add into quarantine water).",
        "why": "大蒜素是天然强效广谱植物杀菌剂，能温和抑制六鞭毛虫与肠道致病杆菌，且无耐药性。",
        "whyEn": "Allicin in fresh garlic acts as a potent natural antibacterial agent, suppressing intestinal flagellates and bacteria without chemical toxicity.",
        "imageUrl": "/care-guides-handdrawn/24_white_stringy_poop_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_25",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Diseases & Emergencies",
    "title": "鱼突然惊慌乱撞与跳出鱼缸（惊缸与跳缸急救）",
    "titleEn": "Fish Darting into Glass & Jumping Out (Acute Panic & Rescue)",
    "condition": "平时温顺的鱼突然疯狂冲刺狂撞玻璃壁、急速翻滚，甚至在夜间或受惊时跳出鱼缸跌落地板，体表粘上灰尘且处于严重脱水窒息休克状态。",
    "conditionEn": "Fish suddenly dart wildly across the tank, slamming violently into glass walls, or panic and jump clear out of the aquarium onto the floor, becoming coated in carpet dust and suffering acute dehydration and asphyxiation.",
    "avoid": "发现跳缸鱼时严禁直接用干燥粗糙的手用力抓捏；严禁在惊缸期间开大灯查看或敲击鱼缸玻璃。",
    "avoidEn": "Never grab dry jumped fish with bare dry abrasive hands; never tap tank glass or flash bright room lights during panic episodes.",
    "imageUrl": "/care-guides-handdrawn/25_fish_jumping_panic.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/25_fish_jumping_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "湿纸巾包裹扶正人工打氧",
        "titleEn": "Wrap fish in damp tissue and hold upright near filter outlet stream",
        "how": "双手沾湿原缸水，用湿纸巾轻轻托起脱水鱼体送回鱼缸，在出水口大水流处用手扶正鱼身助其鳃部呼吸。",
        "howEn": "Wet hands in tank water, cradle the dehydrated fish in a moist paper towel, and gently hold it upright facing the filter outlet current to force oxygen through gills.",
        "why": "湿毛巾保护残存黏膜防止窒息，正向水流冲刷能迅速强行将溶解氧灌入缺氧僵死的鱼鳃。",
        "whyEn": "Damp cloth preserves remaining epidermal slime coat, while the direct current forces oxygen-rich water across parched gills to jumpstart respiration.",
        "imageUrl": "/care-guides-handdrawn/25_fish_jumping_panic_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "缸顶加装防跳网盖板",
        "titleEn": "Install anti-jump mesh net or transparent acrylic cover on tank top",
        "how": "测量鱼缸顶部尺寸，牢牢盖上高透气防跳网罩或亚克力带孔顶盖，不留任何跳跃缝隙。",
        "howEn": "Secure a breathable anti-jump mesh screen or fitted acrylic lid across the aquarium rim, eliminating all perimeter escape gaps.",
        "why": "物理封死鱼只受惊向上跃起的逃逸路线，提供永久性防跳物理屏障。",
        "whyEn": "Establishes an absolute physical perimeter barrier, preventing frightened fish from launching above the water line.",
        "imageUrl": "/care-guides-handdrawn/25_fish_jumping_panic_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "避光防惊扰静养24小时",
        "titleEn": "Eliminate light and keep surrounding room silent for 24 hours",
        "how": "关掉鱼缸灯与室内强光源，远离震动和走动频繁区域，让受惊鱼只在昏暗中慢慢缓神。",
        "howEn": "Extinguish all aquarium and room lights, minimize footsteps and vibrations nearby, and leave the fish undisturbed in dim quietness.",
        "why": "视觉刺激与震动是诱发惊缸跳跃的主因，昏暗无干扰能让中枢神经系统迅速平复。",
        "whyEn": "Darkness and silence remove sensory overload, calming hyperactive neurological panic reflexes.",
        "imageUrl": "/care-guides-handdrawn/25_fish_jumping_panic_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_26",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Fish Abnormalities & Emergency Care",
    "title": "鳃丝发白腐烂、急促呼吸吞气（细菌性烂鳃病）",
    "titleEn": "Pale Rotting Gill Filaments & Rapid Gasping (Bacterial Gill Rot)",
    "condition": "柱状黄杆菌侵蚀鱼鳃娇嫩组织，鳃丝失去鲜红色变成灰白或带有粘稠黏液，鳃盖骨外翻常有缺损，病鱼呼吸极其微弱困难，靠在水面急促吞水或聚集在出水口处。",
    "conditionEn": "Flavobacterium columnare invades sensitive gill filaments, turning healthy red tissue pale, grey, and eroded with sticky mucus. The fish breathes rapidly at the surface or hangs desperately by the water outlet.",
    "avoid": "切勿在主缸全缸倾倒大剂量抗生素杀灭硝化菌；切勿用手或棉签粗暴擦拭发炎鳃丝。",
    "avoidEn": "Never dump heavy antibiotics directly into the display tank crashing the biological cycle; never physically scrape inflamed gill filaments.",
    "imageUrl": "/care-guides-handdrawn/26_bacterial_gill_rot.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/26_bacterial_gill_rot_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "隔离病鱼深层药浴",
        "titleEn": "Isolate for Medicated Antibacterial Bath",
        "how": "将病鱼捞入静水隔离缸，使用黄粉（呋喃西林1-2mg/L）或聚维酮碘进行温和药浴15~20分钟后放回调养缸。",
        "howEn": "Transfer the fish into a bare-bottom quarantine container. Administer a gentle bath with Nitrofurazone (Furan-2, 1-2mg/L) or Povidone-iodine for 15-20 minutes before returning to observation.",
        "why": "快速杀灭附着在鳃丝表层的柱状黄杆菌，阻断致病菌向深层鳃弓软骨蔓延溃烂。",
        "whyEn": "Rapidly eradicates bacterial colonies clinging to gill surfaces, halting necrotic decay before it reaches deep cartilaginous arches.",
        "imageUrl": "/care-guides-handdrawn/26_bacterial_gill_rot_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "调大气泵强力爆氧",
        "titleEn": "Maximize Aeration & Dissolved Oxygen",
        "how": "主缸与隔离缸气泵调至最大档位，使用细化气石打出密集微气泡维持高溶氧环境。",
        "howEn": "Turn the air pump to maximum output in both tanks, using fine air stones to create a dense curtain of oxygen micro-bubbles.",
        "why": "鳃丝溃烂导致气体交换面积暴跌50%以上，极高溶氧能维持病鱼基础血氧浓度保命。",
        "whyEn": "Damaged gills lose over 50% of respiratory efficiency; super-saturated oxygen keeps blood oxygen levels sufficient to sustain life.",
        "imageUrl": "/care-guides-handdrawn/26_bacterial_gill_rot_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "洗砂换水排查污底",
        "titleEn": "Deep Substrate Vacuum & 25% Water Flush",
        "how": "换水1/4，用洗砂器彻底吸出底砂深层腐烂的残饵和积聚鱼便，清洗生化过滤第一层白棉。",
        "howEn": "Perform a 25% water change, plunging a gravel vacuum deep into the substrate to siphon decomposing debris, and rinse mechanical filter floss.",
        "why": "柱状菌在底泥腐殖物中极易暴增，清理底砂能从源头上掐断致病菌的滋生温床。",
        "whyEn": "Columnaris bacteria proliferate exponentially in organic bottom mulm; gravel cleaning removes the biological breeding reservoir.",
        "imageUrl": "/care-guides-handdrawn/26_bacterial_gill_rot_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_27",
    "category": "鱼体异常与疾病急救",
    "categoryEn": "Fish Abnormalities & Emergency Care",
    "title": "眼球单侧/双侧突出充血、角膜蒙白（凸眼病 / 气泡眼）",
    "titleEn": "Swollen Bulging Eye & Corneal Cloudiness (Popeye Disease / Exophthalmia)",
    "condition": "细菌感染引起的眼球后部脓肿或水质恶化（亚硝酸盐超标）导致的眼后液体渗出，单侧或双侧眼球严重外突像气泡，常伴有角膜发白浑浊，食欲减退。",
    "conditionEn": "Retrobulbar bacterial infection or extreme osmotic distress from dirty water leads to severe fluid buildup behind the eye, causing one or both eyes to protrude dramatically with milky white haze.",
    "avoid": "切勿使用普通食用碘盐代替泻盐（硫酸镁）；切勿用手或棉签挤压外突的眼球。",
    "avoidEn": "Never use iodized table salt in place of pure Epsom salt; never manually squeeze or manipulate the bulging eye.",
    "imageUrl": "/care-guides-handdrawn/27_popeye_disease.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/27_popeye_disease_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "捞入静水避光隔离缸",
        "titleEn": "Isolate in a Dim Bare Hospital Tank",
        "how": "用柔软捞网将病鱼移入微水流、光线昏暗的隔离缸，缸内不放尖锐沉木假山。",
        "howEn": "Gently transfer into a dimly lit, gentle-flow hospital tank free of rough rocks or abrasive ornaments.",
        "why": "突出眼球的结膜极度薄脆，强水流或同伴追啄会导致眼球破裂发生永久失明。",
        "whyEn": "The swollen eye's cornea is paper-thin and fragile; high currents or nippy tankmates can cause traumatic rupture and permanent blindness.",
        "imageUrl": "/care-guides-handdrawn/27_popeye_disease_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "添加泻盐促进眼眶消肿",
        "titleEn": "Administer Epsom Salt Osmotic Soak",
        "how": "每10升隔离水加入1茶匙（约5克）泻盐（硫酸镁MgSO4），搅拌至完全溶解。",
        "howEn": "Add 1 level teaspoon (~5g) of Epsom Salt (Magnesium Sulfate, MgSO4) per 10 liters of hospital water, dissolving thoroughly.",
        "why": "泻盐能提供安全的高渗透压，促使眼球后部积存的炎性组织液自然向外渗析消除水肿。",
        "whyEn": "Epsom salt establishes safe osmotic tension, drawing accumulated intraocular inflammatory fluid out of the orbital socket.",
        "imageUrl": "/care-guides-handdrawn/27_popeye_disease_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "配合广谱水溶抗菌药浴",
        "titleEn": "Targeted Broad-Spectrum Antibacterial Soak",
        "how": "按说明书滴加温和广谱抗菌药剂（如红霉素或水溶黄粉），连续药浴3-5天并保持水质恒温。",
        "howEn": "Dose a reliable aquatic antibacterial medication (such as Erythromycin or Kanamycin) per directions for 3-5 days at a stable 26-28°C.",
        "why": "彻底杀灭造成眼球后腔化脓感染的细菌，杜绝感染波及大脑中枢神经。",
        "whyEn": "Eradicates the systemic bacterial culprits responsible for internal orbital abscesses and swelling.",
        "imageUrl": "/care-guides-handdrawn/27_popeye_disease_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_28",
    "category": "行为与神经异常排查",
    "categoryEn": "Behavioral & Neurological Issues",
    "title": "鱼原地像蛇一样左右摇摆、游不动（蛇游 / 摇摆病）",
    "titleEn": "Stationary Body Wobble & S-Curve Swaying (The Shimmies / Body Swaying)",
    "condition": "鱼停在原地剧烈像蛇一样扭动身体却无法向前游动，常见于花鳉类（孔雀鱼、玛丽鱼、剑尾鱼），核心起因是水温急降受凉、水质严重酸化（pH跌破软水下限）或体内缺乏矿物质。",
    "conditionEn": "The fish hovers in place undulating its body in an exaggerated snake-like S-pattern without moving forward. Very common in livebearers (guppies, mollies, platies), triggered by temperature drops, extreme acidification (pH crash), or severe mineral deficiency.",
    "avoid": "切勿直接粗暴加小苏打等化学强碱导致pH剧烈震荡；切勿误当成普通肠炎盲目下猛药。",
    "avoidEn": "Never dump chemical baking soda recklessly causing brutal pH swings; never mistake this for bacterial enteritis and overdose antibiotics.",
    "imageUrl": "/care-guides-handdrawn/28_the_shimmies.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/28_the_shimmies_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "缓慢提温至26-28度",
        "titleEn": "Gradually Warm Water to 26-28°C",
        "how": "转动加热棒旋钮每2小时调高1度，将水温从低温逐步恒定至26-28°C舒适区间。",
        "howEn": "Adjust the heater dial upward by 1°C every 2 hours until reaching a stable 26-28°C target.",
        "why": "温和提温能唤醒鱼体神经肌肉活力，解除因低温引起的背部肌肉痉挛僵直。",
        "whyEn": "Gentle warming relaxes chilled neuromuscular spasming and restores basal metabolic activity.",
        "imageUrl": "/care-guides-handdrawn/28_the_shimmies_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "添加水族千分之二粗盐",
        "titleEn": "Add 0.2% Non-Iodized Aquarium Salt",
        "how": "按每10升水加入20克无碘天然海盐或水族专用粗盐，充分溶解后沿缸壁缓慢倒入。",
        "howEn": "Dissolve 20g of pure aquarium salt or mineral sea salt per 10 liters of tank water, pouring slowly near filter discharge.",
        "why": "微量盐分能调节渗透压，改善花鳉类鱼因软水脱矿导致的神经反射异常与体表不适。",
        "whyEn": "Supplements vital electrolytes and relieves neurological reflex irritation caused by demineralized soft water.",
        "imageUrl": "/care-guides-handdrawn/28_the_shimmies_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "检测并缓慢回调水质pH",
        "titleEn": "Check & Rebalance pH toward Neutral-Alkaline",
        "how": "使用试纸或测试笔检测水质pH，若低于6.8，微量换水1/5并补充矿物质微量元素。",
        "howEn": "Test pH levels; if below 6.8, perform a gentle 20% water change with mineral-rich buffered water.",
        "why": "老水过度酸化会严重灼伤鱼体神经表皮，恢复中性弱碱（pH 7.2-7.8）是治愈根基。",
        "whyEn": "Old acidic water strips away protective skin slime and agitates nerve endings; restoring pH 7.2-7.8 cures the underlying stress.",
        "imageUrl": "/care-guides-handdrawn/28_the_shimmies_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_29",
    "category": "行为与神经异常排查",
    "categoryEn": "Behavioral & Neurological Issues",
    "title": "鱼失去方向感高速打转、螺旋翻滚（旋转病 / 前庭神经受损）",
    "titleEn": "Rapid Corkscrew Swimming & Loss of Balance (Whirling Disease / Vestibular Disorientation)",
    "condition": "鱼突然在水中像螺旋桨一样飞速打转、追尾巴狂游或侧身翻滚失控，多因急性水质氨氮/亚硝酸盐中毒导致脑前庭麻痹，或寄生虫（如脑粘孢子虫）侵害内耳前庭神经。",
    "conditionEn": "The fish frantically spins like a corkscrew, chases its own tail, or cartwheels out of control. Typically triggered by acute ammonia/nitrite intoxication causing central nervous shutdown, or myxosporean parasites invading the vestibular auditory organ.",
    "avoid": "切勿将打转病鱼与凶猛鱼类混养以防被啄食；切勿下敌百虫等神经毒性杀虫猛药以免加速死亡。",
    "avoidEn": "Never house a whirling fish with aggressive tankmates that will attack it; never dose neurotoxic organophosphate pesticides.",
    "imageUrl": "/care-guides-handdrawn/29_whirling_disease.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/29_whirling_disease_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "降低水位至15cm防撞伤",
        "titleEn": "Lower Water Level to 15cm to Prevent Collisions",
        "how": "将打转病鱼捞入浅水隔离盒，水深降低至10~15厘米，避免缸底放置硬物。",
        "howEn": "Transfer the spiraling fish to a shallow bare quarantine box with water depth limited to 10-15cm.",
        "why": "失控打转极易造成头部撞缸和鳞片脱落，浅水能限制其翻滚幅度，减少体力透支。",
        "whyEn": "Uncontrolled whirling causes violent collisions against glass and scale tearing; shallow water restricts spinning and preserves energy.",
        "imageUrl": "/care-guides-handdrawn/29_whirling_disease_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "紧急换水1/3排查毒素",
        "titleEn": "Immediate 1/3 Water Change for Ammonia Flush",
        "how": "立即抽取1/3原水并缓缓补入等温除氯新水，滴加硝化细菌并全开气石暴气。",
        "howEn": "Instantly siphon out 30% of tank water, slowly refilling with fresh conditioned water while maximizing aeration.",
        "why": "排查并清除水中突发的致命氨氮毒素，终止毒素对鱼类神经中枢的持续毒害。",
        "whyEn": "Flushes out acute, neurotoxic ammonia or nitrite surges that poison brain vestibular centers.",
        "imageUrl": "/care-guides-handdrawn/29_whirling_disease_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "补充复合维生素B族调养",
        "titleEn": "Dose Vitamin B Complex for Nerve Recovery",
        "how": "在隔离水体中溶入极微量维生素B1/B12（或浸泡饲料投喂），关灯静养数日。",
        "howEn": "Dissolve aquatic Vitamin B1 & B12 supplements into the quarantine water and keep lights completely off.",
        "why": "维生素B族具有修复受损髓鞘和末梢神经的关键营养功能，促进前庭平衡恢复。",
        "whyEn": "Vitamin B aids myelin sheath repair and neurotransmitter rebuilding, supporting equilibrium recovery.",
        "imageUrl": "/care-guides-handdrawn/29_whirling_disease_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_30",
    "category": "行为与神经异常排查",
    "categoryEn": "Behavioral & Neurological Issues",
    "title": "鱼头朝下倒立悬停、尾巴浮起（头下尾上异常悬停）",
    "titleEn": "Head-Down Tail-Up Hovering (Forward Tilt / Early Swim Bladder & Digestive Impaction)",
    "condition": "鱼身体呈45°~90°垂直倒立，头部朝下竭力向下划水，一旦停止划水尾部就往上漂，属于鱼鳔前室受压、便秘胀气、消化道饱食压迫或内脏受冷痉挛的早期典型征兆。",
    "conditionEn": "The fish rests at a 45° to 90° angle, tilting steeply head-down with its tail floating upward. It paddles vigorously downward to stay level. A classic early sign of swim bladder compression from digestive impaction, dry food swelling, or gut chilling.",
    "avoid": "切勿在倒立期间继续喂食遇水膨胀的劣质干硬饲料；切勿用手硬掰鱼身强行矫正姿势。",
    "avoidEn": "Never continue feeding dry unsoaked pellets that swell inside the gut; never physically force or bend the fish's body.",
    "imageUrl": "/care-guides-handdrawn/30_head_down_hovering.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/30_head_down_hovering_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "严格停食排空肠道气体",
        "titleEn": "Enforce Strict 3-Day Complete Fasting",
        "how": "立即停止投喂所有人工颗粒和冻干红虫，保持停食断粮3天，观察排便。",
        "howEn": "Immediately suspend all dry pellets, freeze-dried worms, and flake feeding for 72 hours.",
        "why": "饱食便秘会导致后肠胀气向上压迫鱼鳔前室，停食排空能消除胃肠物理压迫。",
        "whyEn": "Full intestinal blockage and gas exert mechanical pressure onto the swim bladder; fasting clears digestive tract congestion.",
        "imageUrl": "/care-guides-handdrawn/30_head_down_hovering_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "升温至28度促进胃肠蠕动",
        "titleEn": "Warm to 28°C to Accelerate Peristalsis",
        "how": "将鱼缸加热棒调高至28°C恒温，并加大水流溶氧量。",
        "howEn": "Elevate aquarium water temperature to a steady 28°C and maintain generous air stone bubbling.",
        "why": "适当提高基础代谢率能加速胃肠道平滑肌蠕动，帮助滞留宿便与积气排出体外。",
        "whyEn": "Increased temperature boosts metabolic rates and accelerates gut smooth muscle contraction to expel gas.",
        "imageUrl": "/care-guides-handdrawn/30_head_down_hovering_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "喂食煮熟去皮豌豆泥",
        "titleEn": "Feed Peeled Boiled Green Pea Mash",
        "how": "停食3天后，煮熟一颗新鲜青豌豆，剥去外皮，将内瓤捏成米粒大小微量投喂。",
        "howEn": "Boil a single green pea until tender, discard the outer skin, crush the soft inside into tiny bits, and feed sparingly.",
        "why": "豌豆含有丰富天然植物膳食纤维，是水族界公认最温和有效的天然通便清肠圣品。",
        "whyEn": "Green peas are rich in gentle dietary fiber, acting as nature's most effective aquatic laxative to flush impaction.",
        "imageUrl": "/care-guides-handdrawn/30_head_down_hovering_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_31",
    "category": "繁殖与特定体征养护",
    "categoryEn": "Breeding & Special Anatomy Care",
    "title": "幼鱼苗尾鳍聚拢成针尖、批量衰竭（鱼苗针尾病）",
    "titleEn": "Pinched Tail Fins & Lethargy in Fry (Needle Tail Disease in Guppy/Betta Fry)",
    "condition": "刚出生的孔雀鱼、斗鱼苗尾巴无法展开，缩聚成一根尖细的“绣花针”，在水面摇晃无力，若不干预24小时内可能全窝夭折，核心根源是育苗缸水质酸化、氨氮堆积与三代虫/水霉合并侵袭。",
    "conditionEn": "Newborn fry are unable to fan out their caudal fins, which clump tightly into needle-like points. Fry wobble weakly near the surface and can suffer total brood mortality within 24 hours if unmanaged.",
    "avoid": "切勿用大水流直接猛冲苗缸导致幼鱼折断脊柱；切勿对娇嫩幼鱼直接下高浓度孔雀石绿等烈性毒药。",
    "avoidEn": "Never blast nursery tanks with strong filter currents; never dose harsh dyes like Malachite Green on delicate newborn fry.",
    "imageUrl": "/care-guides-handdrawn/31_needle_tail_in_fry.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/31_needle_tail_in_fry_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "滴流法极慢换水1/3",
        "titleEn": "Slow Drip-Feed 1/3 Water Renewal",
        "how": "用医用输液管或调节阀以每秒1-2滴的速度，缓慢换出1/3老水并补入等温除氯新水。",
        "howEn": "Using airline tubing with an adjustment valve, replace 1/3 of the nursery water at a rate of 1-2 drops per second.",
        "why": "幼鱼对渗透压和温差极度敏感，滴流换水可在零应激前提下快速稀释水中毒素。",
        "whyEn": "Delicate fry cannot tolerate abrupt shifts in chemistry or temperature; drip-feeding eliminates stress while purging toxins.",
        "imageUrl": "/care-guides-handdrawn/31_needle_tail_in_fry_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "维持千分之二微盐环境",
        "titleEn": "Establish 0.2% Mild Salt Sanctuary",
        "how": "按每10升水溶入20克水族粗盐，分两次加入幼鱼缸中，水温恒定在27-28°C。",
        "howEn": "Dissolve 20g of pure aquarium salt per 10 liters of fry water, adding in two stages with temp held at 27-28°C.",
        "why": "千分之二的微盐能迅速杀灭寄生在幼鱼娇嫩尾膜上的三代虫与水霉真菌，促使尾鳍展开。",
        "whyEn": "A 0.2% salt concentration effectively suppresses Gyrodactylus flukes and fungus, letting fry fins reopen naturally.",
        "imageUrl": "/care-guides-handdrawn/31_needle_tail_in_fry_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "每日吸尽死卵与残余活饵",
        "titleEn": "Daily Bottom Siphon of Dead Food & Waste",
        "how": "每次投喂刚孵化的丰年虾幼虫30分钟后，用吸管吸净缸底未吃完的残饵和沉底死卵。",
        "howEn": "Thirty minutes after feeding baby brine shrimp, use a turkey baster to siphon unconsumed nauplii and debris.",
        "why": "育苗容器小、水体脆弱，死虾极易在几个小时内败坏水质引发细菌爆发。",
        "whyEn": "Small nursery volumes foul within hours from decaying protein, triggering lethal bacterial blooms.",
        "imageUrl": "/care-guides-handdrawn/31_needle_tail_in_fry_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_32",
    "category": "繁殖与特定体征养护",
    "categoryEn": "Breeding & Special Anatomy Care",
    "title": "背脊消瘦如刀片、腹部深陷营养耗竭（刀片背 / 严重消瘦病）",
    "titleEn": "Razor-Thin Spine & Sunken Belly (Knifeback / Severe Wasting Disease)",
    "condition": "鱼背部肌肉极度萎缩，背脊骨薄如刀片刃口，腹部凹陷见骨，尽管偶有摄食但日渐枯槁无力，多因六鞭毛虫、体内蠕虫寄生虫长期掠夺营养，或慢性内脏结核细菌感染所致。",
    "conditionEn": "Extreme wasting of dorsal muscle mass leaves the spinal ridge sharp and thin as a razor blade. The belly is hollow and sunken. Caused by internal parasites (Hexamita, nematodes) or chronic mycobacteriosis consuming host calories.",
    "avoid": "切勿在主缸一次性投入大量油腻颗粒饲料恶化水质；切勿让严重虚弱的刀片背病鱼在强造浪泵水流中挣扎。",
    "avoidEn": "Never foul the tank with excessive oily pellets that the weakened fish cannot eat; never subject knifeback fish to turbulent water jets.",
    "imageUrl": "/care-guides-handdrawn/32_wasting_disease_knifeback.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/32_wasting_disease_knifeback_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "隔离排查排泄物状态",
        "titleEn": "Quarantine & Inspect Fecal Threads",
        "how": "捞入观察缸，铺白色底板仔细观察鱼便是否呈白色半透明拉丝或脓冻状。",
        "howEn": "Place in an observation container with a clean white bottom to inspect whether feces are white, hollow, and stringy.",
        "why": "排查确定是否为六鞭毛虫或肠道蠕虫感染，为针对性用药提供确切依据。",
        "whyEn": "Determines whether internal flagellates or gut nematodes are present, guiding medication choice.",
        "imageUrl": "/care-guides-handdrawn/32_wasting_disease_knifeback_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "投喂甲硝唑药饵杀灭内寄",
        "titleEn": "Feed Metronidazole-Medicated Feed",
        "how": "取少量易消化的颗粒饲料，浸润甲硝唑药液（约1%药饵比例），晾干后少食多餐投喂。",
        "howEn": "Soak high-quality sinking micro-pellets in Metronidazole medication (approx 1% ratio) and feed in tiny, frequent meals.",
        "why": "口服药饵能直接抵达病灶肠道深处，彻底杀灭消耗宿主血肉的体内寄生鞭毛虫。",
        "whyEn": "Medicated food delivers the active agent directly into the infected gut lumen, wiping out flagellates.",
        "imageUrl": "/care-guides-handdrawn/32_wasting_disease_knifeback_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "补充鲜活高蛋白易消化营养",
        "titleEn": "Replenish with High-Protein Live Foods",
        "how": "驱虫见效后，逐步投喂鲜活干净的丰年虾幼虫或剪碎红虫，搭配少许复合维生素滴剂。",
        "howEn": "Once parasite shedding subsides, introduce live freshly hatched baby brine shrimp or daphnia fortified with multivitamins.",
        "why": "鲜活高营养食料极易被虚弱肠胃吸收，快速帮助背部肌群重建与体力复苏。",
        "whyEn": "Nutrient-dense live foods are effortlessly digested, rapidly rebuilding lost dorsal muscle bulk.",
        "imageUrl": "/care-guides-handdrawn/32_wasting_disease_knifeback_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_33",
    "category": "繁殖与特定体征养护",
    "categoryEn": "Breeding & Special Anatomy Care",
    "title": "胎生鳉科母鱼腹大如鼓、迟迟未产（母鱼难产急救）",
    "titleEn": "Swollen Black Gravid Spot & Labor Arrest (Pregnant Livebearer Dystocia Emergency)",
    "condition": "临产的母孔雀鱼、玛丽鱼腹部膨大呈方形，胎斑漆黑如墨，但长时间静止趴在草丛或出水口，数小时未能产出幼鱼，母鱼呼吸急促，随时有憋死爆卵风险。",
    "conditionEn": "A heavily pregnant female guppy or molly develops a boxy, bloated belly and pitch-black gravid spot, but remains motionless in plants or by outlets for hours unable to deliver fry, risking egg-binding suffocation.",
    "avoid": "切勿用手或棉签直接暴力挤压母鱼腹部物理催产，否则必死无疑；切勿将公鱼混在产房内持续追咬。",
    "avoidEn": "Never physically squeeze the mother's abdomen to force fry out (fatal hemorrhage); never leave aggressive males chasing her in labor.",
    "imageUrl": "/care-guides-handdrawn/33_pregnant_fish_dystocia.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/33_pregnant_fish_dystocia_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "提供密植水草暗光静养",
        "titleEn": "Provide Dense Moss Sanctuary & Dim Lighting",
        "how": "将母鱼移入密植蜈蚣草或莫斯的水草缸，遮挡强光，提供充分的安全隐蔽藏身所。",
        "howEn": "Transfer the expectant mother into a tank rich in hornwort, java moss, or floating plants, dimming all illumination.",
        "why": "母鱼在受惊或光照过强时会因应激反射分泌肾上腺素阻碍宫缩，暗处能放松肌肉自然生产。",
        "whyEn": "Stress hormones (adrenaline) inhibit natural uterine contractions; a dark, sheltered sanctuary induces calming endorphins.",
        "imageUrl": "/care-guides-handdrawn/33_pregnant_fish_dystocia_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "注入微量2度温差新水刺激",
        "titleEn": "Stimulate Labor with Fresh 2°C Temp Shift",
        "how": "缓慢滴入比原缸水温高或低1.5~2°C的除氯新水（约总水量的15%），微调水流。",
        "howEn": "Slowly introduce conditioned fresh water that is 1.5-2°C cooler or warmer (around 15% volume) to create subtle fresh water flow.",
        "why": "微弱温差与新鲜溶解氧可模拟大自然雨后新水环境，刺激母鱼垂体激素分泌诱发催产分娩。",
        "whyEn": "Simulates natural rain runoff, triggering pituitary hormonal surges that stimulate maternal labor contractions.",
        "imageUrl": "/care-guides-handdrawn/33_pregnant_fish_dystocia_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "大容积产房避免紧迫狭窄",
        "titleEn": "Use Spacious Mesh Trap Instead of Cramped Plastic",
        "how": "放弃狭小拥挤的巴掌大亚克力产卵盒，改用大容积带格栅隔离网箱（不少于5升水体）。",
        "howEn": "Ditch tiny plastic breeding traps and use a roomy mesh breeding enclosure (at least 5 liters capacity).",
        "why": "狭窄压抑空间会让母鱼窒息撞盒，大水体确保充足游动空间与良好水循环，避免幼鱼窒息。",
        "whyEn": "Tight confinement causes panic collisions and asphyxiation; adequate volume maintains water exchange and swimming freedom.",
        "imageUrl": "/care-guides-handdrawn/33_pregnant_fish_dystocia_step_3_1x1.jpg"
      }
    ]
  },
  {
    "id": "care_34",
    "category": "繁殖与特定体征养护",
    "categoryEn": "Breeding & Special Anatomy Care",
    "title": "鱼体侧面呈S形弯曲、驼背游动吃力（脊柱畸形 / 骨骼发育异常）",
    "titleEn": "S-Shaped Spine Curvature & Stiff Locomotion (Scoliosis / Vertebral Deformity)",
    "condition": "鱼脊椎骨向左右弯曲呈S形或向上隆起呈驼背状，游动吃力摆动不协调。多由多代近亲繁殖基因缺陷、幼年期严重缺乏维生素C/钙质，或电击漏电肌肉痉挛后骨骼变形所致。",
    "conditionEn": "The fish's spine curves sideways in a pronounced S-shape or arches upward into a humpback. Locomotion is clumsy and jerky. Caused by generational inbreeding, juvenile Vitamin C / calcium deficiency, or stray electrical voltage spasms.",
    "avoid": "严重近亲畸形属于不可逆病变，切勿盲目乱投药物；畸形个体切勿继续作为亲鱼近亲繁殖。",
    "avoidEn": "Severe inbreeding scoliosis is biologically irreversible, never dump toxic medications; never breed deformed individuals.",
    "imageUrl": "/care-guides-handdrawn/34_spine_deformity_scoliosis.jpg",
    "coverUrl": "/care-guides-handdrawn/covers/34_spine_deformity_scoliosis_cover.jpg",
    "steps": [
      {
        "step": 1,
        "title": "排查排查水族器材防漏电",
        "titleEn": "Audit Electrical Gear for Stray Voltage",
        "how": "用感应电笔逐一排查水下加热棒、水泵电线是否有微弱感应漏电，拔除损坏设备。",
        "howEn": "Use a digital multimeter or voltage sensor to test submersible heaters and pumps, replacing compromised equipment immediately.",
        "why": "水中微弱杂散电流会导致鱼体神经肌肉长期强直收缩，进而拉扯脊椎骨永久畸形弯曲。",
        "whyEn": "Micro-currents leaking into water cause involuntary muscular spasms, physically pulling malleable juvenile spines out of alignment.",
        "imageUrl": "/care-guides-handdrawn/34_spine_deformity_scoliosis_step_1_1x1.jpg"
      },
      {
        "step": 2,
        "title": "补充复合维生素C与钙质",
        "titleEn": "Enrich Diet with Vitamin C & Bio-Available Calcium",
        "how": "在投喂的饲料中拌入水溶性维生素C与矿物质骨粉，促进软骨组织健康新陈代谢。",
        "howEn": "Fortify regular feed with water-soluble Vitamin C and mineral bone meal to bolster bone collagen metabolism.",
        "why": "维生素C是鱼类脊椎胶原蛋白合成的核心辅酶，充足矿物质能有效遏制骨质进一步疏松恶化。",
        "whyEn": "Vitamin C is a mandatory cofactor in vertebrate collagen synthesis; adequate minerals halt progressive bone demineralization.",
        "imageUrl": "/care-guides-handdrawn/34_spine_deformity_scoliosis_step_2_1x1.jpg"
      },
      {
        "step": 3,
        "title": "调缓水流提供平坦觅食区",
        "titleEn": "Baffle Current & Create Barrier-Free Feeding Zone",
        "how": "调小过滤出水口造浪力度，在缸底设置平坦缓流开阔区，投喂沉底缓慢的适口食料。",
        "howEn": "Turn down flow nozzles to create a serene, calm lower zone with slow-sinking appetizing food.",
        "why": "脊柱变形鱼游泳能力受限，柔和水流能避免其体力枯竭，确保其能轻松获得每日食物。",
        "whyEn": "Deformed fish have compromised swimming endurance; gentle flow ensures they feed effortlessly without exhausting themselves.",
        "imageUrl": "/care-guides-handdrawn/34_spine_deformity_scoliosis_step_3_1x1.jpg"
      }
    ]
  }
] as LatestCareGuide[];

const latestCareGuideById = new Map(latestCareGuides.map((guide) => [guide.id, guide]));
export const getLatestCareGuide = (id: string | undefined | null) => id ? latestCareGuideById.get(id) || null : null;
