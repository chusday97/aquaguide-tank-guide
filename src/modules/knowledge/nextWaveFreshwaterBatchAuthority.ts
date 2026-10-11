import type { SpeciesKnowledgeProfile } from './knowledge.types';

const reviewedAt = '2026-10-11';

const reviewedEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'verified' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownEvidence = (sourceIds: string[], note: string) => ({
  confidence: 'unknown' as const,
  reviewStatus: 'reviewed' as const,
  sourceIds,
  reviewedAt,
  note,
});

const unknownSex = (sourceIds: string[], label: string): SpeciesKnowledgeProfile['knowledge']['sexIdentification'] => ({
  title: '本轮不提供稳定的公母外观判断',
  summary: label,
  points: ['不依据未经本轮审核的体色、体型或旧模板描述判断性别。'],
  confidence: 'unknown',
  source: { type: 'unknown', label: '缺少稳定的对象级性别鉴别规则', confidence: 'unknown' },
  reliableFromLifeStage: 'unknown',
  evidence: unknownEvidence(sourceIds, label),
});

export const nextWaveFreshwaterBatchKnowledge: Record<string, SpeciesKnowledgeProfile['knowledge']> = {
  sp_0047: {
    sexIdentification: unknownSex(
      ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
      '已核验物种身份、环境与繁殖行为，但本轮证据不足以形成家庭水族箱可稳定执行的公母外观规则。',
    ),
    reproduction: {
      mode: 'cave_spawner',
      plainLanguageLabel: '巢穴产卵 / 雄鱼护卵护幼',
      summary: 'FishBase 记录雄鱼会在河岸洞穴或巢中守护卵和仔鱼。该行为只作为繁殖期护巢事实，不外推成全年永久领地性。',
      fertilization: 'external',
      parentalCare: 'fry_guarding',
      breedingBehavior: ['雄鱼建立或占用巢穴。', '雄鱼守护卵和仔鱼。'],
      breedingAggression: 'unknown',
      evidence: reviewedEvidence(
        ['batch18-fishbase-tachysurus-fulvidraco'],
        'FishBase directly records male nest guarding of eggs and larvae; aggression intensity outside breeding remains unresolved.',
      ),
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 16, max: 25 },
      notes: [
        'FishBase 与 USFWS 均支持淡水环境。',
        'USFWS ERSS 明确将 FishBase 的 16–25°C 作为 assumed recommended aquarium temperature，因此本轮允许进入规划温度范围。',
      ],
      evidence: reviewedEvidence(
        ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
        'Freshwater and the 16–25°C aquarium planning range are directly supported by reviewed FishBase/USFWS evidence.',
      ),
    },
    socialBehavior: {
      mode: 'unknown',
      territoriality: 'unknown',
      predationRisk: 'unknown',
      summary: '已审核来源记录其偶尔摄食鱼类，也记录繁殖期雄鱼护巢，但没有建立稳定的家庭水族箱群居模式、社区性或可安全映射到 Small/Medium/Large 的猎物体型阈值。',
      evidence: unknownEvidence(
        ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
        'Targeted review reached an evidence ceiling for stable aquarium social mode and prey-size scope; keep community compatibility fail-closed.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 34.5, measurement: 'TL' },
      activityLevel: 'unknown',
      swimmingZone: 'bottom',
      spaceNotes: ['最大记录 34.5 cm TL。', '没有经过审核的家庭水族箱最小体积或缸长，不从体长反推最低缸体。'],
      evidence: reviewedEvidence(
        ['batch18-fishbase-tachysurus-fulvidraco', 'fws-tachysurus-fulvidraco-erss'],
        'Maximum total length is reviewed-supported; household minimum tank dimensions remain unknown.',
      ),
    },
  },

  sp_0048: {
    sexIdentification: unknownSex(
      ['batch19-fishbase-mastacembelus-armatus', 'seriouslyfish-mastacembelus-armatus'],
      '本轮资料重点支持环境、体型与混养边界，不提供未经充分核验的外观性别判断。',
    ),
    environment: {
      waterType: 'freshwater',
      waterTypes: ['freshwater', 'brackish'],
      temperatureRangeC: { min: 24, max: 28 },
      phRange: { min: 6.0, max: 7.0 },
      notes: ['FishBase 记录淡水与半咸水出现；Seriously Fish 的家庭饲养范围用于温度与 pH。'],
      evidence: reviewedEvidence(
        ['batch19-fishbase-mastacembelus-armatus', 'seriouslyfish-mastacembelus-armatus'],
        'Reviewed FishBase and husbandry authority support multi-water occurrence plus the aquarium temperature/pH range.',
      ),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'medium',
      predationRisk: 'high',
      swimmingZone: 'bottom',
      summary: '对多数异种大型同伴通常较温和，但会捕食可被视为猎物的小鱼；同种之间可能出现明显攻击，因此不推导固定群养数量。',
      evidence: reviewedEvidence(
        ['seriouslyfish-mastacembelus-armatus'],
        'Seriously Fish supports peaceful heterospecific community behavior with sufficiently large tankmates, conspecific aggression, and live-fish predation risk.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 91, measurement: 'SL' },
      minVolumeLiters: 432,
      minTankLengthCm: 120,
      activityLevel: 'medium',
      swimmingZone: 'bottom',
      needsHidingPlaces: true,
      substrateNotes: ['底栖、夜行，需考虑躲藏空间与底部活动面积。'],
      evidence: reviewedEvidence(
        ['seriouslyfish-mastacembelus-armatus'],
        'Reviewed husbandry authority supplies 910 mm SL and a minimum 120 × 60 cm footprint, approximately 432 L.',
      ),
    },
  },

  sp_0050: {
    sexIdentification: unknownSex(
      ['batch19-fishbase-channa-barca', 'seriouslyfish-channa-barca'],
      '本轮没有足够稳定的对象级公母外观证据，不根据商业养殖经验自行补充。',
    ),
    reproduction: {
      mode: 'unknown',
      plainLanguageLabel: '繁殖方式尚未形成可执行 authority',
      summary: 'Seriously Fish 将其繁殖记录描述为未确认，可能的口孵推测不进入产品规则。',
      fertilization: 'unknown',
      parentalCare: 'unknown',
      breedingAggression: 'unknown',
      evidence: unknownEvidence(
        ['seriouslyfish-channa-barca'],
        'Reproduction is reported as unrecorded; probable mouthbrooding is not promoted into compatibility logic.',
      ),
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 10, max: 28 },
      phRange: { min: 6.0, max: 8.0 },
      notes: ['家庭规划范围来自 reviewed husbandry authority。'],
      evidence: reviewedEvidence(
        ['batch19-fishbase-channa-barca', 'seriouslyfish-channa-barca'],
        'Freshwater identity and reviewed aquarium temperature/pH range are supported.',
      ),
    },
    socialBehavior: {
      mode: 'pair',
      territoriality: 'high',
      predationRisk: 'high',
      summary: '不是普通社区鱼，应按物种专缸规划；可以形成配对，但同种之间也可能突然发生严重冲突。其为专性捕食者，较小鱼类属于明确风险对象。',
      evidence: reviewedEvidence(
        ['seriouslyfish-channa-barca'],
        'Seriously Fish explicitly describes a species-specific aquarium, pair social form, severe conspecific aggression risk, and obligate predation on smaller fishes/insects.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 105, measurement: 'TL' },
      activityLevel: 'unknown',
      spaceNotes: ['FishBase 最大记录 105 cm TL。', '来源仅说明需要公共展示级或极大型私人水族箱，本轮不编造数字最低缸体。'],
      evidence: reviewedEvidence(
        ['batch19-fishbase-channa-barca', 'seriouslyfish-channa-barca'],
        'Maximum size is supported; numeric minimum tank dimensions are intentionally not inferred.',
      ),
    },
  },

  sp_0051: {
    sexIdentification: unknownSex(
      ['batch08-fishbase-acrossocheilus-fasciatus', 'doi-acrossocheilus-fasciatus-behavior-2024'],
      '本轮不把婚姻色或实验条件中的表型差异扩展为稳定的家庭性别鉴别规则。',
    ),
    environment: {
      waterType: 'freshwater',
      notes: ['确认淡水、溪流型生态；实验温度处理不等同于家庭水族箱目标温度。'],
      evidence: reviewedEvidence(
        ['batch08-fishbase-acrossocheilus-fasciatus'],
        'Freshwater ecology is directly supported; no aquarium temperature or pH target is promoted.',
      ),
    },
    socialBehavior: {
      mode: 'group',
      territoriality: 'unknown',
      predationRisk: 'unknown',
      swimmingPace: 'fast',
      summary: '同行评议行为研究支持群体凝聚与同步活动，但没有给出可安全转换为家庭水族箱 minimumGroupSize 的数量阈值。',
      evidence: reviewedEvidence(
        ['doi-acrossocheilus-fasciatus-behavior-2024'],
        'Peer-reviewed behavioral evidence supports shoal cohesion/synchronization without a household minimum group count.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 19.2, measurement: 'SL' },
      activityLevel: 'high',
      spaceNotes: ['FishBase 最大记录 19.2 cm SL。', '没有 reviewed 家庭最小缸体数据。'],
      evidence: reviewedEvidence(
        ['batch08-fishbase-acrossocheilus-fasciatus'],
        'Maximum standard length is reviewed-supported; household minimum tank dimensions remain unknown.',
      ),
    },
  },

  sp_0054: {
    sexIdentification: unknownSex(
      ['batch09-fishbase-hemichromis-bimaculatus'],
      '当前接受名为 Rubricatochromis bimaculatus；本轮不新增未经单独审核的性别外观规则。',
    ),
    environment: {
      waterType: 'freshwater',
      waterTypes: ['freshwater', 'brackish'],
      temperatureRangeC: { min: 21, max: 23 },
      phRange: { min: 6.5, max: 7.5 },
      evidence: reviewedEvidence(
        ['batch09-fishbase-hemichromis-bimaculatus'],
        'FishBase supports freshwater/brackish occurrence and aquarium-relevant temperature/pH values.',
      ),
    },
    socialBehavior: {
      mode: 'pair',
      territoriality: 'high',
      predationRisk: 'unknown',
      summary: 'FishBase 将该慈鲷描述为攻击性强、以配对方式饲养；不把“攻击性”自动改写成捕食。',
      evidence: reviewedEvidence(
        ['batch09-fishbase-hemichromis-bimaculatus'],
        'Reviewed source supports pair housing and strong territorial/aggressive behavior.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 13.6, measurement: 'SL' },
      minTankLengthCm: 100,
      activityLevel: 'medium',
      spaceNotes: ['FishBase 最大 13.6 cm SL，并给出 100 cm minimum aquarium size。'],
      evidence: reviewedEvidence(
        ['batch09-fishbase-hemichromis-bimaculatus'],
        'Maximum length and minimum aquarium length are directly supported.',
      ),
    },
  },

  sp_0056: {
    sexIdentification: unknownSex(
      ['batch09-fishbase-heros-severus', 'fishipedia-heros-severus'],
      '本轮不把颜色或体型差异扩展为可稳定执行的性别判断。',
    ),
    reproduction: {
      mode: 'substrate_spawner',
      plainLanguageLabel: '开放基质产卵 / 双亲护卵',
      summary: '可在石块、根系等基质上产卵，双亲会守护卵；繁殖期领地性与攻击性会增强。',
      fertilization: 'external',
      parentalCare: 'egg_guarding',
      breedingBehavior: ['开放基质产卵', '双亲守卵', '繁殖期领地防御增强'],
      breedingAggression: 'medium',
      evidence: reviewedEvidence(
        ['batch09-fishbase-heros-severus', 'fishipedia-heros-severus'],
        'Reviewed sources support biparental egg defense and increased territoriality around reproduction.',
      ),
    },
    environment: {
      waterType: 'freshwater',
      waterTypes: ['freshwater', 'brackish'],
      temperatureRangeC: { min: 23, max: 29 },
      phRange: { min: 5.0, max: 6.5 },
      evidence: reviewedEvidence(
        ['batch09-fishbase-heros-severus', 'fishipedia-heros-severus'],
        'Freshwater/brackish occurrence and the reviewed aquarium temperature/pH window are supported.',
      ),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'medium',
      predationRisk: 'unknown',
      summary: '可成对或群体饲养，普通状态下可与和平同伴共存，但同种层级与繁殖期领地压力需要管理。',
      evidence: reviewedEvidence(
        ['fishipedia-heros-severus'],
        'Reviewed husbandry source supports pair/group sociality, territoriality, conspecific hierarchy, and community use with peaceful tankmates.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 20, measurement: 'SL' },
      minVolumeLiters: 450,
      activityLevel: 'medium',
      evidence: reviewedEvidence(
        ['batch09-fishbase-heros-severus', 'fishipedia-heros-severus'],
        'Adult size and a 450 L community minimum are supported; no additional tank-length threshold is inferred.',
      ),
    },
  },

  sp_0057: {
    sexIdentification: unknownSex(
      ['batch09-fishbase-altolamprologus-calvus', 'fishipedia-altolamprologus-calvus'],
      '本轮重点审核环境、社会性与繁殖护卵，不提供未形成稳定规则的性别鉴别。',
    ),
    reproduction: {
      mode: 'substrate_spawner',
      plainLanguageLabel: '缝隙/基质产卵 / 雌鱼护卵',
      summary: 'FishBase 记录雌鱼守护卵；该事实用于繁殖期防御提醒，不把所有时间都升级成高强度领地冲突。',
      fertilization: 'external',
      parentalCare: 'egg_guarding',
      breedingBehavior: ['雌鱼守护卵', '繁殖期空间防御'],
      breedingAggression: 'medium',
      evidence: reviewedEvidence(
        ['batch09-fishbase-altolamprologus-calvus'],
        'Female egg guarding is directly supported by FishBase.',
      ),
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 23, max: 25 },
      phRange: { min: 8.0, max: 9.0 },
      notes: ['坦噶尼喀湖淡水慈鲷，不应被旧 catalog 海水分类影响 Compatibility。'],
      evidence: reviewedEvidence(
        ['batch09-fishbase-altolamprologus-calvus'],
        'Freshwater Lake Tanganyika habitat plus temperature/pH values are directly supported.',
      ),
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'medium',
      predationRisk: 'unknown',
      summary: '可成对或单独饲养，整体较沉稳，但雄鱼尤其会对同种雄鱼防御空间；捕食甲壳类的证据不被粗暴扩展为“所有无脊椎动物都不可混”。',
      evidence: reviewedEvidence(
        ['fishipedia-altolamprologus-calvus'],
        'Reviewed husbandry evidence supports variable pair/solitary sociality and moderate territorial pressure.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 13.5, measurement: 'TL' },
      activityLevel: 'medium',
      needsHidingPlaces: true,
      spaceNotes: ['最大 13.5 cm TL；本轮没有足够可靠的数字最低缸体 authority。'],
      evidence: reviewedEvidence(
        ['batch09-fishbase-altolamprologus-calvus'],
        'Maximum length is supported; numeric household tank minimum remains unknown.',
      ),
    },
  },

  sp_0058: {
    sexIdentification: unknownSex(
      ['batch09-fishbase-neolamprologus-multifasciatus', 'fishipedia-neolamprologus-multifasciatus'],
      '本轮不新增外观性别判断；核心 authority 是群落/贝壳领地结构。',
    ),
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 24, max: 28 },
      phRange: { min: 7.8, max: 9.5 },
      notes: ['坦噶尼喀湖淡水贝壳慈鲷，旧 catalog “海水鱼”分类不得进入混养水型判断。'],
      evidence: reviewedEvidence(
        ['batch09-fishbase-neolamprologus-multifasciatus', 'fishipedia-neolamprologus-multifasciatus'],
        'Reviewed sources support freshwater identity and the aquarium temperature/pH range.',
      ),
    },
    socialBehavior: {
      mode: 'colony',
      minimumGroupSize: 5,
      territoriality: 'medium',
      predationRisk: 'unknown',
      swimmingZone: 'bottom',
      summary: '会形成群落并围绕贝壳建立很小的领地；minimumGroupSize 5 来自 reviewed husbandry source，不把领地性升级成必须单养。',
      evidence: reviewedEvidence(
        ['batch09-fishbase-neolamprologus-multifasciatus', 'fishipedia-neolamprologus-multifasciatus'],
        'FishBase supports large aggregations with very small pair territories; Fishipedia supports a minimum population of five.',
      ),
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 4.0, measurement: 'TL' },
      minVolumeLiters: 100,
      activityLevel: 'medium',
      swimmingZone: 'bottom',
      substrateNotes: ['需要贝壳与可挖掘底床来形成小领地结构。'],
      evidence: reviewedEvidence(
        ['batch09-fishbase-neolamprologus-multifasciatus', 'fishipedia-neolamprologus-multifasciatus'],
        'Maximum size and a 100 L husbandry minimum are reviewed-supported.',
      ),
    },
  },
};
