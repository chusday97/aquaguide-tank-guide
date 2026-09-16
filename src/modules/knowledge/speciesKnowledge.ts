import type { Fish } from '../../types';
import type { SpeciesKnowledgeProfile } from './knowledge.types';
import { getBaseSpeciesScientificName } from '../species/speciesTaxonomy';
import { phase2Batch02Knowledge } from './phase2Batch02Authority';
import { phase2Batch03Knowledge } from './phase2Batch03Authority';
import { phase2Batch04Knowledge } from './phase2Batch04Authority';
import { phase2Batch05Knowledge } from './phase2Batch05Authority';
import { phase2Batch06Knowledge } from './phase2Batch06Authority';
import { phase2Batch07Knowledge } from './phase2Batch07Authority';
import { phase2Batch08Knowledge } from './phase2Batch08Authority';
import { phase2Batch09Knowledge } from './phase2Batch09Authority';
import { phase2Batch10Knowledge } from './phase2Batch10Authority';
import { phase2Batch11Knowledge } from './phase2Batch11Authority';
import { phase2Batch12Knowledge } from './phase2Batch12Authority';
import { phase2Batch13Knowledge } from './phase2Batch13Authority';
import { phase2Batch14Knowledge } from './phase2Batch14Authority';
import { phase2Batch15Knowledge } from './phase2Batch15Authority';
import { phase2Batch16Knowledge } from './phase2Batch16Authority';
import { phase2Batch17Knowledge } from './phase2Batch17Authority';
import { phase2Batch18Knowledge } from './phase2Batch18Authority';
import { phase2Batch19Knowledge } from './phase2Batch19Authority';
import { phase2Batch20Knowledge } from './phase2Batch20Authority';
import { phase2Batch21Knowledge } from './phase2Batch21Authority';
import { phase2Batch22Knowledge } from './phase2Batch22Authority';
import { phase2Batch23Knowledge } from './phase2Batch23Authority';
import { phase2Batch24Knowledge } from './phase2Batch24Authority';
import { phase2Batch25Knowledge } from './phase2Batch25Authority';
import { phase2Batch26Knowledge } from './phase2Batch26Authority';
import { phase2Batch27Knowledge } from './phase2Batch27Authority';
import { phase2Batch28Knowledge } from './phase2Batch28Authority';
import { phase2Batch29Knowledge } from './phase2Batch29Authority';
import { phase2Batch30Knowledge } from './phase2Batch30Authority';
import { phase2Batch31Knowledge } from './phase2Batch31Authority';
import { phase2Batch32Knowledge } from './phase2Batch32Authority';

const completionOnlyDirectKnowledgeIds = new Set([
  'sp_0006', 'sp_0035', 'sp_0430', 'sp_0457', 'sp_0003', 'sp_0029',
  'sp_0004', 'sp_0032', 'sp_0036',
  'sp_0052', 'sp_0112', 'sp_0115', 'sp_0141', 'sp_0143', 'sp_0144', 'sp_0145', 'sp_0154', 'sp_0155', 'sp_0167',
  'sp_0170', 'sp_0204', 'sp_0205', 'sp_0206', 'sp_0212', 'sp_0225', 'sp_0226', 'sp_0231', 'sp_0232', 'sp_0244',
  'sp_0245', 'sp_0246', 'sp_0255', 'sp_0287', 'sp_0339', 'sp_0358', 'sp_0360', 'sp_0362', 'sp_0375', 'sp_0002',
  'sp_0005', 'sp_0051', 'sp_0018', 'sp_0019', 'sp_0023', 'sp_0024', 'sp_0026', 'sp_0033', 'sp_0034', 'sp_0042',
  'sp_0054', 'sp_0055', 'sp_0056', 'sp_0057', 'sp_0058', 'sp_0062', 'sp_0069', 'sp_0070', 'sp_0121', 'sp_0122',
  'sp_0123', 'sp_0125', 'sp_0129', 'sp_0146', 'sp_0152', 'sp_0157', 'sp_0158', 'sp_0163', 'sp_0173', 'sp_0174',
  'sp_0175', 'sp_0176', 'sp_0177', 'sp_0178', 'sp_0182', 'sp_0187', 'sp_0201', 'sp_0202', 'sp_0207', 'sp_0208',
  'sp_0211', 'sp_0214', 'sp_0217', 'sp_0218', 'sp_0219', 'sp_0220', 'sp_0221', 'sp_0227', 'sp_0228', 'sp_0235',
  'sp_0236', 'sp_0240', 'sp_0241', 'sp_0243', 'sp_0247', 'sp_0249', 'sp_0250', 'sp_0251', 'sp_0256', 'sp_0257',
  'sp_0263', 'sp_0264', 'sp_0265', 'sp_0266', 'sp_0270', 'sp_0271', 'sp_0272', 'sp_0273', 'sp_0282', 'sp_0288',
  'sp_0289', 'sp_0290', 'sp_0291', 'sp_0294', 'sp_0338', 'sp_0340', 'sp_0341', 'sp_0359', 'sp_0363', 'sp_0364',
  'sp_0372', 'sp_0373', 'sp_0374', 'sp_0376', 'sp_0388', 'sp_0393', 'sp_0394', 'sp_0399', 'sp_0414', 'sp_0415',
  'sp_0416', 'sp_0417', 'sp_0419', 'sp_0421', 'sp_0428', 'sp_0429', 'sp_0449', 'sp_0450', 'sp_0452', 'sp_0456',
  'sp_0001', 'sp_0007', 'sp_0008', 'sp_0009', 'sp_0015', 'sp_0022', 'sp_0038', 'sp_0043', 'sp_0044', 'sp_0047',
  'sp_0048', 'sp_0050', 'sp_0059', 'sp_0103', 'sp_0104', 'sp_0105', 'sp_0108', 'sp_0109', 'sp_0110', 'sp_0116',
  'sp_0117', 'sp_0118', 'sp_0119', 'sp_0120', 'sp_0127', 'sp_0130', 'sp_0131', 'sp_0138', 'sp_0139', 'sp_0140',
  'sp_0151', 'sp_0156', 'sp_0179', 'sp_0181', 'sp_0183', 'sp_0184', 'sp_0185', 'sp_0197', 'sp_0198', 'sp_0199',
  'sp_0200', 'sp_0216', 'sp_0229', 'sp_0234', 'sp_0242', 'sp_0248', 'sp_0268', 'sp_0269', 'sp_0283', 'sp_0284',
  'sp_0285', 'sp_0286', 'sp_0296', 'sp_0297', 'sp_0318', 'sp_0319', 'sp_0321', 'sp_0322', 'sp_0323', 'sp_0325',
  'sp_0333', 'sp_0334', 'sp_0365', 'sp_0368', 'sp_0370', 'sp_0379', 'sp_0382', 'sp_0384', 'sp_0400', 'sp_0401',
  'sp_0402', 'sp_0407', 'sp_0408', 'sp_0409', 'sp_0410', 'sp_0411', 'sp_0412', 'sp_0420', 'sp_0441', 'sp_0442',
  'sp_0445', 'sp_0453', 'sp_0459', 'sp_0037', 'sp_0041', 'sp_0046', 'sp_0063', 'sp_0064', 'sp_0065', 'sp_0066',
  'sp_0067', 'sp_0068', 'sp_0077', 'sp_0089', 'sp_0111', 'sp_0124', 'sp_0142', 'sp_0149', 'sp_0150', 'sp_0159',
  'sp_0160', 'sp_0161', 'sp_0162', 'sp_0168', 'sp_0169', 'sp_0180', 'sp_0188', 'sp_0189', 'sp_0190', 'sp_0196',
  'sp_0203', 'sp_0209', 'sp_0213', 'sp_0215', 'sp_0230', 'sp_0237', 'sp_0253', 'sp_0254', 'sp_0280', 'sp_0281',
  'sp_0292', 'sp_0293', 'sp_0348', 'sp_0349', 'sp_0350', 'sp_0351', 'sp_0385', 'sp_0386', 'sp_0387', 'sp_0392',
  'sp_0395', 'sp_0418', 'sp_0025', 'sp_0039', 'sp_0040', 'sp_0060', 'sp_0061', 'sp_0106', 'sp_0107', 'sp_0113',
  'sp_0128', 'sp_0132', 'sp_0134', 'sp_0135', 'sp_0136', 'sp_0137', 'sp_0153', 'sp_0171', 'sp_0172', 'sp_0186',
  'sp_0014', 'sp_0049', 'sp_0431', 'sp_0432', 'sp_0436', 'sp_0443', 'sp_0435', 'sp_0191', 'sp_0192', 'sp_0193',
  'sp_0194', 'sp_0195', 'sp_0210', 'sp_0233', 'sp_0252', 'sp_0267', 'sp_0295', 'sp_0320', 'sp_0324', 'sp_0326',
]);



const redRainbowfishKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后公鱼体型更高、红色更强',
    summary: '成熟公鱼背部更高并发展出典型红色；成熟母鱼体型相对低、颜色更朴素。',
    points: ['公鱼：成熟后背部更高，典型红色更明显。', '母鱼：体型相对低，颜色更朴素。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-glossolepis-incisus'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'egg_scatterer',
    plainLanguageLabel: '持续散卵型',
    summary: '可持续数周分批产卵，鱼卵以细丝附着在植物或产卵拖把上；没有稳定亲代照护。',
    fertilization: 'external',
    parentalCare: 'none',
    gestationOrIncubation: { minDays: 7, maxDays: 8, label: '鱼卵通常约 7–8 天孵化' },
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-glossolepis-incisus'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 25 },
    phRange: { min: 7.0, max: 8.0 },
    hardnessDgh: { min: 10, max: 20 },
    notes: ['长期更适合中硬到硬、接近中性到偏碱性的淡水；Seriously Fish 的日常养护范围作为本轮 authority。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-glossolepis-incisus', 'fishbase-glossolepis-incisa'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'shoal',
    minimumGroupSize: 6,
    recommendedGroupSize: { min: 6, max: 8 },
    swimmingZone: 'middle',
    territoriality: 'none',
    finNipping: 'none',
    swimmingPace: 'fast',
    predationRisk: 'low',
    summary: '非常和平但游速快、体型较大；至少 6–8 条群养，避免用活跃体型去压迫特别小或慢游的同缸鱼。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-glossolepis-incisus', 'fishbase-glossolepis-incisa'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 15, measurement: 'SL' },
    minVolumeLiters: 108,
    minTankLengthCm: 120,
    activityLevel: 'high',
    swimmingZone: 'middle',
    needsCover: true,
    spaceNotes: ['长期群养按至少 120 × 30 cm 缸底、约 108 L 规划；FishBase 的 100 cm / 5+ 作为交叉支持，不用于降低 Seriously Fish 的长期群游空间建议。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-glossolepis-incisus', 'fishbase-glossolepis-incisa'], reviewedAt: '2026-09-13' },
  },
};

const clownLoachKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供稳定的外观公母硬判断',
    summary: '当前 reviewed 来源足以支持环境、群体与空间规则，但不足以把外观性别差异作为稳定的用户判断依据。',
    points: ['若需要繁殖或性别管理，优先依据成熟个体的可靠繁育记录，不凭单一外观猜测。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 24, max: 30 },
    phRange: { min: 5.0, max: 7.0 },
    hardnessDgh: { min: 1, max: 12 },
    notes: ['长期需要成熟、洁净、富氧且有一定水流的水体；Seriously Fish 的长期养护范围优先于旧 catalog 的更窄空间规划。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-chromobotia-macracanthus', 'fishbase-chromobotia-macracanthus'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'shoal',
    minimumGroupSize: 5,
    recommendedGroupSize: { min: 10 },
    swimmingZone: 'bottom',
    territoriality: 'low',
    finNipping: 'medium',
    swimmingPace: 'fast',
    predationRisk: 'low',
    summary: '明显群居并形成复杂群体等级；至少 5–6 条，最好 10 条以上。总体并非高攻击鱼，但活跃体型与追鳍倾向使其不适合慢游长鳍鱼。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-chromobotia-macracanthus', 'fishbase-chromobotia-macracanthus'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 40, measurement: 'SL' },
    minVolumeLiters: 648,
    minTankLengthCm: 180,
    activityLevel: 'high',
    swimmingZone: 'bottom',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: ['长期群养按至少 180 × 60 cm 缸底、约 648 L 规划；幼鱼暂养在小缸不等于成体长期空间足够。FishBase 记录最大约 30.5 cm TL，而 Seriously Fish 记录可达约 40 cm SL，本产品采用更保守的长期规划上界。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-chromobotia-macracanthus', 'fishbase-chromobotia-macracanthus'], reviewedAt: '2026-09-13' },
  },
};

const hillstreamLoachKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后可从俯视体型和胸鳍结构辅助判断',
    summary: '成熟母鱼体型更宽、吻部轮廓更连续；成熟公鱼更纤细、吻部更方，并可在胸鳍前部和头部出现软质突起。',
    points: ['母鱼：俯视通常更宽，吻部与胸鳍轮廓更连续。', '公鱼：通常更纤细、吻部更方，成熟后胸鳍与头部可见软质突起。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sewellia-lineolata'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 20, max: 24 },
    phRange: { min: 6.0, max: 7.5 },
    hardnessDgh: { min: 1, max: 10 },
    notes: ['需要成熟、洁净、富氧并有明显水流的水体；高流/高氧需求当前作为 reviewed husbandry evidence 展示，不把气泵开关误当作溶氧的唯一代理。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sewellia-lineolata'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'shoal',
    minimumGroupSize: 6,
    recommendedGroupSize: { min: 6 },
    swimmingZone: 'bottom',
    territoriality: 'low',
    finNipping: 'none',
    swimmingPace: 'slow',
    predationRisk: 'low',
    summary: '野外常成群出现，建议至少 6 条；同种个体会围绕优质觅食位发生支配与领地争夺，但通常不会把这种同形底栖竞争扩大成对异形社区鱼的普遍攻击。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sewellia-lineolata'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 6.5, measurement: 'SL' },
    minVolumeLiters: 68,
    minTankLengthCm: 75,
    activityLevel: 'medium',
    swimmingZone: 'bottom',
    needsCover: true,
    needsHidingPlaces: true,
    substrateNotes: ['优先提供岩石、圆润砾石与可形成生物膜的硬表面，并保留开放的高流通区域。'],
    spaceNotes: ['长期群养按至少 75 × 30 cm 缸底、约 68 L 规划；空间不足会放大同形底栖鱼之间的觅食位竞争。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sewellia-lineolata'], reviewedAt: '2026-09-13' },
  },
};

const oscarKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供外观公母硬判断',
    summary: '当前来源支持物种身份与养护边界，但不足以把外观差异作为稳定的用户性别判断规则。',
    points: ['需要繁殖配对时，优先依据成熟个体行为和专门繁育来源，不凭体色或头型猜测。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 25 },
    notes: ['水体和温度沿用当前 Catalog Review 的 FishBase authority；生态来源同时记录其可见于淡水与半咸水环境，单值 catalog waterType 不扩展为半咸水结论。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['batch03-fishbase-astronotus-ocellatus', 'fishbase-astronotus-ocellatus-ecology'], reviewedAt: '2026-09-16' },
  },
  socialBehavior: {
    mode: 'solitary',
    territoriality: 'unknown',
    finNipping: 'unknown',
    predationRisk: 'high',
    summary: 'FishBase 记录其通常独居并取食小型鱼；Seriously Fish 明确指出其捕食性决定了不应与明显更小的鱼混养。该 authority 只支持 small_fish 边界，不把地图鱼对所有鱼类一律判为禁止。',
    evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['fishbase-astronotus-ocellatus-ecology', 'seriouslyfish-astronotus-ocellatus'], reviewedAt: '2026-09-16' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 45.7, measurement: 'SL' },
    activityLevel: 'medium',
    spaceNotes: ['成体体型很大；Seriously Fish 的 150 × 60 cm 缸底建议仅作为大型单只成体的空间边界，不将此处的水族箱容量建议误当作兼容性 pair rule。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['batch03-fishbase-astronotus-ocellatus', 'seriouslyfish-astronotus-ocellatus'], reviewedAt: '2026-09-16' },
  },
};

const pygmyCoryKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后可从俯视体型辅助判断',
    summary: '成熟母鱼通常更圆、更宽并略大；公鱼相对纤细。',
    points: ['母鱼：成熟后通常更圆、更宽，体型略大。', '公鱼：通常相对纤细。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-pygmaeus'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 26 },
    phRange: { min: 6.4, max: 7.4 },
    hardnessDgh: { min: 0, max: 8 },
    notes: ['采用 Seriously Fish 较保守的长期养护范围；FishBase 提供更宽的 pH/硬度生态范围，不作为本轮日常养护上限。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-pygmaeus', 'fishbase-corydoras-pygmaeus'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'shoal',
    minimumGroupSize: 6,
    recommendedGroupSize: { min: 10 },
    swimmingZone: 'middle',
    territoriality: 'none',
    finNipping: 'none',
    swimmingPace: 'moderate',
    predationRisk: 'low',
    predationVulnerability: 'high',
    summary: '非常和平且明显群居，至少 6 条、最好 10 条以上；体型极小，容易被大型鱼压制、抢食或直接捕食。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-pygmaeus', 'fishbase-corydoras-pygmaeus'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 3, measurement: 'SL' },
    minVolumeLiters: 41,
    minTankLengthCm: 45,
    activityLevel: 'medium',
    swimmingZone: 'middle',
    needsCover: true,
    substrateNotes: ['底床优先使用细砂或保持洁净的圆润底材。'],
    spaceNotes: ['群养按至少 45 × 30 cm 缸底、约 41 L 规划；不要因为体型小就忽略群体空间和抢食压力。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-pygmaeus', 'fishbase-corydoras-pygmaeus'], reviewedAt: '2026-09-13' },
  },
};

const discusKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供外观公母硬判断',
    summary: '当前 reviewed 来源足以支持水质、群体和繁殖期行为，但不足以把外观性别差异作为稳定的用户判断规则。',
    points: ['若需要繁殖配对，优先依据已形成配对的成熟个体与可靠繁育记录，不凭单一外观特征猜测。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 26, max: 30 },
    phRange: { min: 5.0, max: 8.0 },
    hardnessDgh: { min: 0, max: 12 },
    notes: ['Reviewed FishBase 范围优先于旧 catalog 的 28–32°C / pH 5.0–6.5；长期仍应保持稳定、洁净的高温淡水环境。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-symphysodon-aequifasciatus', 'fishbase-symphysodon-aequifasciatus'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 5,
    territoriality: 'none',
    finNipping: 'none',
    predationRisk: 'low',
    swimmingPace: 'moderate',
    summary: '平时以群体活动为主，FishBase 建议至少 5 条；繁殖时形成配对并出现领地行为，因此不能把繁殖期冲突泛化成全年社区攻击性。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-symphysodon-aequifasciatus', 'fishbase-symphysodon-aequifasciatus'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 14, measurement: 'SL' },
    minVolumeLiters: 255,
    minTankLengthCm: 120,
    activityLevel: 'medium',
    swimmingZone: 'middle',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: ['Seriously Fish 建议约 120 × 45 × 45 cm / 255 L 用于少量幼鱼或一对繁殖成鱼；FishBase 同样给出 120 cm 最小缸长。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-symphysodon-aequifasciatus', 'fishbase-symphysodon-aequifasciatus'], reviewedAt: '2026-09-13' },
  },
};

const ramireziKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成体可用体型、鳍形和腹部颜色辅助判断',
    summary: '成熟公鱼通常体型更大、鳍条更延长且颜色更强；多数母鱼腹部可见粉红色区域，但观赏品系可能弱化这一特征。',
    points: ['公鱼：成熟后通常更大，鳍条更延长、体色更强。', '母鱼：多数成体腹部可见粉红色区域。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['成熟后通常更大', '鳍条更延长', '体色更强'],
    femaleTraits: ['多数成体腹部可见粉红色区域'],
    limitations: ['商业观赏品系可能削弱腹部颜色等性别特征，不应只凭单一外观判断。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'substrate_spawner',
    plainLanguageLabel: '基质产卵型',
    summary: '成熟后形成配对，在平石、沉木、宽叶或其他硬质表面产卵；双亲共同护卵护幼。',
    fertilization: 'external',
    parentalCare: 'fry_guarding',
    gestationOrIncubation: { minDays: 2, maxDays: 3, label: '鱼卵通常约 2–3 天孵化' },
    breedingBehavior: ['成熟后形成配对并建立繁殖领地', '在硬质表面产卵', '双亲共同护卵护幼'],
    breedingAggression: 'medium',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi', 'fishbase-mikrogeophagus-ramirezi'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 27, max: 30 },
    phRange: { min: 4.0, max: 7.0 },
    hardnessDgh: { min: 1, max: 10 },
    notes: ['需要成熟、洁净且稳定的高温淡水环境；不应把旧 catalog 的 26°C 下限当作 reviewed 结论。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi', 'fishbase-mikrogeophagus-ramirezi'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'pair',
    territoriality: 'none',
    finNipping: 'none',
    predationRisk: 'low',
    swimmingPace: 'moderate',
    summary: '成熟后以配对为主；日常不把它视为永久领地鱼，但繁殖时配对会建立领地并可能追逐其它鱼。与和平、能适应高温且不抢食的伴游鱼更合适。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi', 'fishbase-mikrogeophagus-ramirezi'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 4.2, measurement: 'SL' },
    minVolumeLiters: 54,
    minTankLengthCm: 60,
    activityLevel: 'medium',
    swimmingZone: 'bottom',
    needsCover: true,
    needsHidingPlaces: true,
    substrateNotes: ['偏好柔软沙质底床，便于底栖筛食。'],
    spaceNotes: ['单对长期规划按至少 60 × 30 cm 缸底、约 54 L；社区环境还要为底层觅食和繁殖领地留空间。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-mikrogeophagus-ramirezi', 'fishbase-mikrogeophagus-ramirezi'], reviewedAt: '2026-09-13' },
  },
};

const agassiziiKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后公母体型和鳍形差异明显',
    summary: '成熟公鱼通常更大、颜色更强并发展出更延长的鳍；母鱼体型更小。',
    points: ['公鱼：成熟后通常更大、更鲜艳，鳍条更延长。', '母鱼：成熟后体型通常更小。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['成熟后通常更大、更鲜艳', '鳍条更延长'],
    femaleTraits: ['成熟后体型通常更小'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-apistogramma-agassizii'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'cave_spawner',
    plainLanguageLabel: '洞穴产卵型',
    summary: '通常在洞穴或缝隙顶部产卵，由母鱼负责护卵和照顾鱼苗；繁殖期需要避免把护域行为当成日常社区行为。',
    fertilization: 'external',
    parentalCare: 'fry_guarding',
    breedingBehavior: ['在洞穴或缝隙内产卵', '母鱼负责护卵和鱼苗'],
    breedingAggression: 'medium',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-apistogramma-agassizii', 'fishbase-apistogramma-agassizii'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 22, max: 29 },
    phRange: { min: 5.0, max: 7.0 },
    hardnessDgh: { min: 0, max: 10 },
    notes: ['一般饲养采用 FishBase 的 pH 5–7 作为 reviewed 范围；部分野生繁殖群体可能需要更低 pH，不把该极端繁殖条件当成普通长期目标。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-apistogramma-agassizii', 'fishbase-apistogramma-agassizii'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'harem',
    territoriality: 'low',
    finNipping: 'none',
    predationRisk: 'low',
    summary: '人工繁育个体可作为有条件的社区鱼；FishBase 记录可按一雄多雌管理。野生个体更适合单独或与小型伴游鱼谨慎搭配。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-apistogramma-agassizii', 'fishbase-apistogramma-agassizii'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 7.5, measurement: 'SL' },
    minVolumeLiters: 54,
    minTankLengthCm: 60,
    activityLevel: 'medium',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: ['单对至少按 60 × 30 cm 缸底、约 54 L 规划；多鱼组合需要更大空间和更多洞穴/遮挡。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-apistogramma-agassizii', 'fishbase-apistogramma-agassizii'], reviewedAt: '2026-09-13' },
  },
};

const emberTetraKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后可通过体色与腹部轮廓辅助判断',
    summary: '成熟公鱼通常颜色更强，尤其繁殖状态更明显；母鱼腹部通常更圆。',
    points: ['公鱼：成熟后体色通常更强。', '母鱼：成熟后腹部通常更圆。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['成熟后体色通常更强'],
    femaleTraits: ['成熟后腹部通常更圆'],
    limitations: ['仅作为成熟个体辅助特征，幼鱼或状态变化时不要据此做确定判断。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-hyphessobrycon-amandae'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'egg_scatterer',
    plainLanguageLabel: '散卵型',
    summary: '散卵繁殖且没有亲代照护；繁殖布置通常用网格、细叶植物或产卵拖把让鱼卵与成鱼分离。',
    fertilization: 'external',
    parentalCare: 'none',
    parentFryRisk: ['没有亲代照护，繁殖时应让鱼卵尽快与成鱼分离。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-hyphessobrycon-amandae'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 20, max: 28 },
    phRange: { min: 5.0, max: 7.0 },
    hardnessDgh: { min: 1, max: 10 },
    notes: ['Reviewed 水质范围优先于旧 catalog 的 24–29°C；长期保持稳定、偏软到中等硬度的淡水环境。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-hyphessobrycon-amandae', 'fishbase-hyphessobrycon-amandae'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 8,
    recommendedGroupSize: { min: 8, max: 10 },
    territoriality: 'none',
    finNipping: 'none',
    predationRisk: 'low',
    summary: '非常温和的小型群游鱼；建议至少 8–10 条，数量足够时更不胆怯、群游表现也更自然。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-hyphessobrycon-amandae'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 2, measurement: 'SL' },
    minVolumeLiters: 41,
    minTankLengthCm: 45,
    activityLevel: 'medium',
    needsCover: true,
    spaceNotes: ['长期群养按至少 45 × 30 cm 缸底、约 41 L 规划；这是空间规划参考，不是硬阈值。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-hyphessobrycon-amandae', 'fishbase-hyphessobrycon-amandae'], reviewedAt: '2026-09-13' },
  },
};

const denisonBarbKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成熟后可用体型与体色作辅助判断',
    summary: 'Seriously Fish 记录成熟母鱼通常稍大、体型更厚实，体色也比公鱼略淡；这些只适合作为成熟个体的辅助特征。',
    points: ['母鱼：成熟后通常稍大、体型更厚实。', '公鱼：相对更纤细，体色通常更鲜明。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['相对更纤细', '体色通常更鲜明'],
    femaleTraits: ['成熟后通常稍大', '体型更厚实', '体色通常略淡'],
    limitations: ['仅适合成熟个体辅助判断，不应作为单一确定性别依据。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sahyadria-denisonii'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 15, max: 25 },
    phRange: { min: 6.5, max: 7.8 },
    hardnessDgh: { min: 5, max: 25 },
    notes: ['偏好洁净、高溶氧并有一定水流的环境；Reviewed 范围优先于泛化 catalog 数据。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sahyadria-denisonii', 'fishbase-sahyadria-denisonii'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 6,
    recommendedGroupSize: { min: 6, max: 10 },
    territoriality: 'none',
    finNipping: 'unknown',
    predationRisk: 'unknown',
    swimmingPace: 'fast',
    summary: '总体和平但属于活跃群游鱼；建议至少 6–10 条，并为整群提供足够长的游泳空间。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sahyadria-denisonii', 'fishbase-sahyadria-denisonii'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 11, measurement: 'SL' },
    minVolumeLiters: 243,
    minTankLengthCm: 120,
    activityLevel: 'high',
    spaceNotes: ['长期群养按至少 120 × 45 cm 缸底、约 243 L 规划；FishBase 另记录最大约 15 cm TL，测量口径不同，不直接混成同一精确值。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-sahyadria-denisonii', 'fishbase-sahyadria-denisonii'], reviewedAt: '2026-09-13' },
  },
};

const congoTetraKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成体公鱼体型更大、鳍条延长且颜色更强',
    summary: '成熟公鱼通常更大、更鲜艳，并发展出明显延长的背鳍与尾鳍鳍条；母鱼体型较小、鳍形更朴素。',
    points: ['公鱼：成熟后体型更大、色彩更强，背鳍和尾鳍可出现明显延长鳍条。', '母鱼：通常更小，缺少公鱼夸张的延长鳍条。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['成熟后体型更大、色彩更强', '背鳍与尾鳍鳍条明显延长'],
    femaleTraits: ['通常体型更小', '缺少公鱼夸张的延长鳍条'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-phenacogrammus-interruptus'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'egg_scatterer',
    plainLanguageLabel: '散卵型',
    summary: '散卵繁殖，没有亲代照护；鱼卵通常约 6 天孵化，繁殖缸用网格或植物让鱼卵与成鱼分离。',
    fertilization: 'external',
    parentalCare: 'none',
    gestationOrIncubation: { minDays: 6, maxDays: 6, label: '鱼卵通常约 6 天孵化' },
    parentFryRisk: ['没有亲代照护，繁殖时应让鱼卵与成鱼分离以减少吞卵风险。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-phenacogrammus-interruptus'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 23, max: 28 },
    phRange: { min: 6.0, max: 7.5 },
    hardnessDgh: { min: 3, max: 18 },
    notes: ['对水质较敏感，长期饲养需要稳定、清洁且有良好循环的淡水环境。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-phenacogrammus-interruptus', 'fishbase-phenacogrammus-interruptus'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 5,
    territoriality: 'none',
    finNipping: 'none',
    predationRisk: 'low',
    summary: '和平但活跃的群游鱼，单独或数量太少时更容易受惊；FishBase 明确建议至少 5 条群养。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-phenacogrammus-interruptus', 'fishbase-phenacogrammus-interruptus'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 8, measurement: 'SL' },
    minVolumeLiters: 108,
    minTankLengthCm: 120,
    activityLevel: 'high',
    needsCover: true,
    spaceNotes: ['成鱼群长期规划按至少 120 × 30 cm 缸底、约 108 L；长度用于提供持续游动空间。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-phenacogrammus-interruptus', 'fishbase-phenacogrammus-interruptus'], reviewedAt: '2026-09-13' },
  },
};

const pearlGouramiKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '成体公鱼喉胸更红、背鳍和臀鳍延长',
    summary: '成熟公鱼通常色彩更强，喉胸呈橙红色，并有更明显的背鳍/臀鳍延长；母鱼颜色更朴素、腹部更丰满。',
    points: ['公鱼：成熟后喉胸橙红、背鳍和臀鳍延长更明显。', '母鱼：颜色较朴素，成熟时腹部通常更丰满。'],
    confidence: 'verified',
    source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
    reliableFromLifeStage: 'adult',
    maleTraits: ['喉胸橙红色更明显', '背鳍与臀鳍延长'],
    femaleTraits: ['颜色较朴素', '成熟时腹部更丰满'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trichopodus-leerii'], reviewedAt: '2026-09-13' },
  },
  reproduction: {
    mode: 'bubble_nester',
    plainLanguageLabel: '泡巢型',
    summary: '公鱼在浮水植物附近筑泡巢并照护鱼卵；繁殖期会追逐母鱼，因此需要足够躲避空间。',
    fertilization: 'external',
    parentalCare: 'egg_guarding',
    breedingBehavior: ['公鱼筑泡巢并护卵', '繁殖期公鱼会追逐母鱼'],
    breedingAggression: 'medium',
    parentFryRisk: ['鱼苗自由游动后应结束公鱼护巢阶段，避免继续把繁殖期领地行为视为长期社区状态。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trichopodus-leerii', 'fishbase-trichopodus-leerii'], reviewedAt: '2026-09-13' },
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 24, max: 30 },
    phRange: { min: 5.5, max: 8.0 },
    hardnessDgh: { min: 2, max: 30 },
    notes: ['Seriously Fish 的详细饲养范围作为环境 authority；FishBase 提供更窄的 24–28°C / pH 6–8 生态记录，未用于扩大范围。', '属于迷鳃鱼，FishBase 记录其为强制空气呼吸鱼类。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trichopodus-leerii'], reviewedAt: '2026-09-13' },
  },
  socialBehavior: {
    mode: 'pair',
    territoriality: 'none',
    finNipping: 'none',
    predationRisk: 'low',
    summary: '总体是非常和平的社区鱼；雄鱼之间及繁殖期会出现同种领地/追逐行为，但不把这一繁殖情境泛化成全年对所有社区鱼的领地压力。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trichopodus-leerii'], reviewedAt: '2026-09-13' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 12, measurement: 'SL' },
    minVolumeLiters: 81,
    minTankLengthCm: 120,
    activityLevel: 'medium',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: ['Seriously Fish 给出 90 × 30 cm / ~81 L；FishBase 的 aquarium reference 给出 120 cm 最小长度，本轮采用更保守的 120 cm 长度规划，同时保留 81 L 作为体积参考。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trichopodus-leerii', 'fishbase-trichopodus-leerii'], reviewedAt: '2026-09-13' },
  },
};

const rummyNoseKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供外观公母硬判断',
    summary: '当前已审核来源足以支持环境、社交和混养规划，但不足以把外观性别特征作为稳定的用户判断规则。',
    points: ['若有繁殖需求，优先结合成熟个体长期观察或可靠繁育来源，不凭单一外观特征下结论。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 24, max: 27 },
    phRange: { min: 5.5, max: 7.0 },
    hardnessDgh: { min: 2, max: 15 },
    notes: ['当前 catalog 使用旧属名 Hemigrammus rhodostomus；FishBase 当前接受名为 Petitella rhodostoma。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-petitella-rhodostoma', 'fishbase-petitella-rhodostoma'], reviewedAt: '2026-09-16' },
  },
  socialBehavior: {
    mode: 'school',
    minimumGroupSize: 10,
    recommendedGroupSize: { min: 10 },
    swimmingZone: 'middle',
    territoriality: 'none',
    finNipping: 'none',
    swimmingPace: 'fast',
    summary: '非常和平且紧密群游，建议至少 10 条；不适合与明显更大、强势或抢食激烈的鱼搭配。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-petitella-rhodostoma', 'fishbase-petitella-rhodostoma'], reviewedAt: '2026-09-16' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 5, measurement: 'SL' },
    minTankLengthCm: 90,
    activityLevel: 'high',
    swimmingZone: 'middle',
    needsCover: true,
    spaceNotes: ['群体活跃游动，长期规划至少 90 cm 缸长。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-petitella-rhodostoma', 'fishbase-petitella-rhodostoma'], reviewedAt: '2026-09-16' },
  },
};

const otocinclusVittatusKnowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供外观公母硬判断',
    summary: '当前已审核来源足以支持环境、社交和混养规划，但不足以把外观性别特征作为稳定的用户判断规则。',
    points: ['若有繁殖需求，优先结合成熟个体长期观察或可靠繁育来源，不凭单一外观特征下结论。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 20, max: 25 },
    phRange: { min: 6.0, max: 7.5 },
    notes: ['优先使用成熟、稳定且有持续藻膜/生物膜的水族箱；不要把“除藻鱼”理解为可以在新缸里缺食生存。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-otocinclus-vittatus', 'aquariumcoop-otocinclus-catfish', 'scotcat-otocinclus-vittatus'], reviewedAt: '2026-09-16' },
  },
  socialBehavior: {
    mode: 'group',
    swimmingZone: 'bottom',
    territoriality: 'none',
    finNipping: 'none',
    swimmingPace: 'slow',
    predationVulnerability: 'high',
    summary: '性情非常和平并有明显群体性，适合与体型接近、温和且不会抢食的鱼同缸；应避开大型或攻击性强、可能吞食它们的同伴。不同 husbandry 来源对固定最低群体数量建议不一致，因此本轮不设硬性 minimumGroupSize。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquariumcoop-otocinclus-catfish', 'scotcat-otocinclus-vittatus'], reviewedAt: '2026-09-16' },
  },
  spaceAndGrowth: {
    adultLengthCm: { max: 3.3, measurement: 'unknown' },
    activityLevel: 'low',
    swimmingZone: 'bottom',
    needsCover: true,
    needsHidingPlaces: true,
    spaceNotes: ['比固定升数更重要的是成熟缸、足够觅食表面和避免与强势鱼抢食。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-otocinclus-vittatus', 'aquariumcoop-otocinclus-catfish'], reviewedAt: '2026-09-16' },
  },
};

const phase2UnknownEvidence = (sourceIds: string[], note: string): NonNullable<NonNullable<SpeciesKnowledgeProfile['knowledge']['environment']>['evidence']> => ({
  confidence: 'unknown',
  reviewStatus: 'reviewed',
  sourceIds,
  note,
  reviewedAt: '2026-09-16',
});

const goldRamPhase2Knowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供金波子品系的稳定公母硬判断',
    summary: 'Aquarium Industries 记录金波子属于 Mikrogeophagus ramirezi 的颜色品系，但未给出足以支持本品系独立性别规则的证据。',
    points: ['不凭颜色品系或单一鳍形推断公母。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '金波子品系性别证据不足', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
    evidence: phase2UnknownEvidence(['aquarium-industries-ramirezi-care-sheet'], '来源确认 gold ram 为颜色品系，但未提供可单独验证的品系性别规则。'),
  },
  environment: {
    waterType: 'freshwater',
    temperatureRangeC: { min: 24, max: 28 },
    phRange: { min: 5, max: 7.2 },
    notes: ['Aquarium Industries 的 Ramirezi care sheet 明确列出 gold ram 为颜色品系，并给出该物种的 24–28°C、pH 5.0–7.2 养护范围；不再从 legacy gold 文案继承范围。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquarium-industries-ramirezi-care-sheet'], reviewedAt: '2026-09-16' },
  },
  socialBehavior: {
    mode: 'pair',
    territoriality: 'medium',
    finNipping: 'none',
    predationRisk: 'low',
    summary: '同一份专业 care sheet 说明繁殖期才明显攻击，并建议与和平、开放水域群游鱼搭配；该结论保留为金波子品系直接 authority。',
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquarium-industries-ramirezi-care-sheet'], reviewedAt: '2026-09-16' },
  },
  spaceAndGrowth: {
    adultLengthCm: { min: 4, max: 6, measurement: 'unknown' },
    activityLevel: 'medium',
    spaceNotes: ['来源给出 Ramirezi 成体约 4–6 cm；未给出金波子品系独立的最低缸体升数，因此不补写固定升数。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquarium-industries-ramirezi-care-sheet'], reviewedAt: '2026-09-16' },
  },
};

const platinumSnakeheadPhase2Knowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供白金品系公母判断',
    summary: '现有 Channa argus 物种来源不确认 Platinum 观赏品系的独立性别特征。',
    points: ['不以白化/白金体色推断公母。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '白金雷龙品系性别证据不足', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
    evidence: phase2UnknownEvidence(['batch03-fishbase-channa-argus'], 'FishBase 物种页不确认 Platinum 品系性别特征。'),
  },
  environment: { waterType: 'unknown', notes: ['Channa argus 物种页不能替代白金品系的直接养护证据；温度、水体和 pH 保持 unknown。'], evidence: phase2UnknownEvidence(['batch03-fishbase-channa-argus'], '禁止把基础种字段自动继承为品系 authority。') },
  socialBehavior: { mode: 'unknown', territoriality: 'unknown', finNipping: 'unknown', predationRisk: 'unknown', summary: '没有白金雷龙品系的直接行为来源；保持 fail-closed。', evidence: phase2UnknownEvidence(['batch03-fishbase-channa-argus'], '没有品系级混养或行为证据。') },
  spaceAndGrowth: { activityLevel: 'unknown', spaceNotes: ['不能把基础种的尺寸或缸体建议自动外推到白金品系。'], evidence: phase2UnknownEvidence(['batch03-fishbase-channa-argus'], '没有品系级空间来源。') },
};

const rosyBitterlingPhase2Knowledge: SpeciesKnowledgeProfile['knowledge'] = {
  sexIdentification: {
    title: '本轮不提供稳定外观公母硬判断',
    summary: 'FishBase 和 J-STAGE 资料支持物种生态与繁殖周期，但不足以形成日常外观性别规则。',
    points: ['不凭发色或体型单一特征判断公母。'],
    confidence: 'unknown',
    source: { type: 'unknown', label: '高体鳑鲏性别字段待补充', confidence: 'unknown' },
    reliableFromLifeStage: 'unknown',
    evidence: phase2UnknownEvidence(['batch03-fishbase-rhodeus-ocellatus', 'jstage-rhodeus-ocellatus-reproductive-cycle'], '来源没有给出稳定的水族箱外观性别识别规则。'),
  },
  environment: {
    waterType: 'unknown',
    temperatureRangeC: { min: 18, max: 24 },
    notes: ['FishBase 同时记录 freshwater 与 brackish；保留 waterType unknown。FishBase 给出 18–24°C，J-STAGE 研究讨论 22–28°C 的繁殖季温度响应，后者不替代日常温度范围。'],
    evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['batch03-fishbase-rhodeus-ocellatus', 'jstage-rhodeus-ocellatus-reproductive-cycle'], reviewedAt: '2026-09-16' },
  },
  socialBehavior: { mode: 'unknown', summary: '现有专业来源没有确认适用于水族箱的群体最低数量或稳定社会模式。', evidence: phase2UnknownEvidence(['batch03-fishbase-rhodeus-ocellatus', 'jstage-rhodeus-ocellatus-reproductive-cycle'], '不把繁殖研究外推为社区混养行为。') },
  spaceAndGrowth: { adultLengthCm: { max: 9.2, measurement: 'SL' }, activityLevel: 'unknown', spaceNotes: ['FishBase 给出最大 9.2 cm SL；没有足以支持最低缸长或升数的物种专属专业来源。'], evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['batch03-fishbase-rhodeus-ocellatus'], reviewedAt: '2026-09-16' } },
};

const reviewedKnowledgeBySpeciesId: Partial<Record<string, SpeciesKnowledgeProfile['knowledge']>> = {
  ...phase2Batch02Knowledge,
  ...phase2Batch03Knowledge,
  ...phase2Batch04Knowledge,
  ...phase2Batch05Knowledge,
  ...phase2Batch06Knowledge,
  ...phase2Batch07Knowledge,
  ...phase2Batch08Knowledge,
  ...phase2Batch09Knowledge,
  ...phase2Batch10Knowledge,
  ...phase2Batch11Knowledge,
  ...phase2Batch12Knowledge,
  ...phase2Batch13Knowledge,
  ...phase2Batch14Knowledge,
  ...phase2Batch15Knowledge,
  ...phase2Batch16Knowledge,
  ...phase2Batch17Knowledge,
  ...phase2Batch18Knowledge,
  ...phase2Batch19Knowledge,
  ...phase2Batch20Knowledge,
  ...phase2Batch21Knowledge,
  ...phase2Batch22Knowledge,
  ...phase2Batch23Knowledge,
  ...phase2Batch24Knowledge,
  ...phase2Batch25Knowledge,
  ...phase2Batch26Knowledge,
  ...phase2Batch27Knowledge,
  ...phase2Batch28Knowledge,
  ...phase2Batch29Knowledge,
  ...phase2Batch30Knowledge,
  ...phase2Batch31Knowledge,
  ...phase2Batch32Knowledge,
  sp_0016: goldRamPhase2Knowledge,
  sp_0224: platinumSnakeheadPhase2Knowledge,
  sp_0475: rosyBitterlingPhase2Knowledge,
  sp_0433: rummyNoseKnowledge,
  sp_0013: otocinclusVittatusKnowledge,
  sp_0133: redRainbowfishKnowledge,
  sp_0126: clownLoachKnowledge,
  sp_0045: hillstreamLoachKnowledge,
  sp_0053: pygmyCoryKnowledge,
  sp_0447: discusKnowledge,
  sp_0451: oscarKnowledge,
  sp_0448: ramireziKnowledge,
  sp_0017: agassiziiKnowledge,
  sp_0444: pearlGouramiKnowledge,
  sp_0020: congoTetraKnowledge,
  sp_0440: denisonBarbKnowledge,
  sp_0114: emberTetraKnowledge,
  sp_0469: emberTetraKnowledge,
  sp_0011: {
    sexIdentification: {
      title: '成体公鱼可通过交接器识别',
      summary: 'FishBase 记录公鱼具有由臀鳍特化形成的交接器；雌鱼成体体型可更大。',
      points: ['公鱼：臀鳍特化形成交接器。', '母鱼：不具有公鱼的交接器，成体体型可更大。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'FishBase', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['臀鳍特化形成交接器'],
      femaleTraits: ['不具有公鱼的交接器', '成体体型可更大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '胎生型 / 直接产仔',
      summary: 'FishBase 将其记录为体内受精的胎生型鱼类，常见妊娠期约 24–30 天，随后直接产下幼鱼。',
      fertilization: 'internal',
      parentalCare: 'unknown',
      gestationOrIncubation: { minDays: 24, maxDays: 30, label: '常见妊娠期约 24–30 天' },
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 20, max: 26 },
      phRange: { min: 7.0, max: 8.2 },
      hardnessDgh: { min: 10, max: 30 },
      notes: ['偏好中等硬度或更硬的水；不要把旧 catalog 的更宽范围当作 reviewed 结论。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus', 'fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'none',
      finNipping: 'unknown',
      predationRisk: 'unknown',
      summary: '总体非常温和，适合多数和平社区鱼；Seriously Fish 明确记录公鱼之间也能互相容忍，因此不设置虚构的最低群体数量。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'TL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      spaceNotes: ['长期规划按至少 60 × 30 cm 缸底；约 54 L 仅作为规划参考，不做差 1 L 即失败的硬阈值。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-maculatus', 'fishbase-xiphophorus-maculatus'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0437: {
    sexIdentification: {
      title: '成体公鱼可通过交接器识别',
      summary: '成体公鱼通常更小、更鲜艳，并具有由臀鳍特化形成的交接器；母鱼不具交接器。',
      points: ['公鱼：臀鳍形成交接器，通常体型更小、颜色更强。', '母鱼：不具有公鱼的交接器。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['臀鳍特化为交接器', '通常体型更小、颜色更强'],
      femaleTraits: ['不具有公鱼的交接器'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '胎生型 / 直接产仔',
      summary: '按常见胎生鳉方式繁殖；公鱼会持续追逐母鱼，亲鱼也可能捕食刚出生的幼鱼。不同来源对妊娠时长记载不一致，本轮不提供单一固定天数。',
      fertilization: 'internal',
      parentalCare: 'none',
      breedingBehavior: ['公鱼可能持续追逐母鱼', '繁殖群体建议一公搭配多母以分散追逐压力'],
      fryCare: ['密植环境可为幼鱼提供躲避'],
      parentFryRisk: ['成鱼可能捕食刚出生的幼鱼'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 21, max: 28 },
      phRange: { min: 7.0, max: 8.5 },
      hardnessDgh: { min: 15, max: 30 },
      notes: ['长期更适合中硬到硬、偏碱性的水；不把“加盐”当作替代硬度管理的通用规则。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'variable',
      sexRatioGuidance: '繁殖群体建议一公搭配多母，减少单只母鱼被持续追逐。',
      territoriality: 'none',
      finNipping: 'unknown',
      predationRisk: 'low',
      summary: '总体温和，但长期混养对象也应能适应相同的硬、偏碱水环境；不设置没有直接证据支持的最低群体数量。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 8, measurement: 'SL' },
      minVolumeLiters: 81,
      minTankLengthCm: 90,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['标准型成体约 8 cm SL，长期规划参考至少 90 × 30 cm 缸底和约 81L 水体。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-sphenops'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0438: {
    sexIdentification: {
      title: '成体公鱼可通过交接器和尾剑辅助识别',
      summary: '成体公鱼通常较小，具有明显交接器和下尾鳍延长形成的“剑”；观赏品系可能改变鳍形，因此优先结合交接器判断。',
      points: ['公鱼：具有交接器，典型成体下尾鳍延长形成尾剑。', '母鱼：通常更大，不具有公鱼的交接器。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['具有交接器', '典型成体下尾鳍形成尾剑'],
      femaleTraits: ['通常体型更大', '不具有公鱼的交接器'],
      limitations: ['高鳍、琴尾等人工品系会改变鳍形，不能只凭“尾鳍长”判断性别。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-hellerii'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '胎生型 / 直接产仔',
      summary: '体内受精的胎生型鱼类；FishBase 记录常见妊娠期约 24–30 天，雌鱼还可储存具有活性的精子。',
      fertilization: 'internal',
      parentalCare: 'unknown',
      gestationOrIncubation: { minDays: 24, maxDays: 30, label: '常见妊娠期约 24–30 天' },
      breedingBehavior: ['雄鱼会争夺支配位置并竞争配偶', '雌鱼可长期储存具有活性的精子'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-hellerii', 'fishbase-xiphophorus-hellerii'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 16, max: 28 },
      phRange: { min: 7.0, max: 8.0 },
      hardnessDgh: { min: 10, max: 25 },
      notes: ['偏好中硬到硬、接近中性到偏碱性的水；较宽温度范围不代表可以忽略长期稳定性。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-hellerii'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'shoal',
      territoriality: 'unknown',
      finNipping: 'unknown',
      predationRisk: 'low',
      summary: '可作为社区鱼，但狭小空间内多个雄鱼会形成支配等级并投入较多时间维持位置；这属于同种雄性竞争，不直接等价成对所有异种鱼的高领地攻击。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-hellerii', 'fishbase-xiphophorus-hellerii'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 14, measurement: 'SL' },
      minVolumeLiters: 108,
      minTankLengthCm: 120,
      activityLevel: 'high',
      needsCover: true,
      spaceNotes: ['标准型长期规划参考至少 120 × 30 cm 缸底和约 108L 水体；水平活动空间比仅看升数更重要。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-xiphophorus-hellerii'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0436: {
    sexIdentification: {
      title: '成体公母较容易区分',
      summary: '成年公鱼通常更鲜艳，并具有由臀鳍特化形成的交接器；母鱼通常体型更大、更丰满。',
      points: ['公鱼：颜色通常更鲜艳，臀鳍形成细长的交接器。', '母鱼：通常更大、更丰满，腹部后方可见孕斑。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish + FishBase', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['颜色通常更鲜艳', '臀鳍特化为交接器'],
      femaleTraits: ['通常体型更大、更丰满', '腹部后方可见孕斑'],
      limitations: ['人工选育品系的颜色差异可能弱化“公鱼更鲜艳”这一特征，应优先看交接器。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata', 'fishbase-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'livebearer',
      plainLanguageLabel: '卵胎生 / 直接产仔',
      summary: '孔雀鱼为内受精的胎生型鳉鱼，母鱼可储存精子，并在妊娠后直接产下可游动幼鱼。',
      fertilization: 'internal',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 28, maxDays: 42, label: '常见妊娠期约 4–6 周' },
      breedingBehavior: ['公鱼会持续追逐求偶', '建议避免单只母鱼长期承受高频追逐'],
      breedingAggression: 'low',
      fryCare: ['提供密植或浮水植物可提高幼鱼存活率'],
      parentFryRisk: ['亲鱼可能捕食幼鱼'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata', 'fishbase-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      sexRatioGuidance: '繁殖群体中建议一公搭配多母，减少单只母鱼被持续追逐。',
      territoriality: 'low',
      finNipping: 'low',
      finNipVulnerability: 'high',
      swimmingPace: 'unknown',
      predationRisk: 'low',
      summary: '总体温和，适合温和社区缸；成年公鱼和观赏品系常有延长鳍条，对追鳍鱼更脆弱；繁殖群体还需管理公鱼持续追逐母鱼的问题。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'SL' },
      minVolumeLiters: 41,
      minTankLengthCm: 45,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['以成体约 6 cm 标准体长和至少 45 × 30 cm 缸底作为空间规划参考。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-poecilia-reticulata'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0431: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '性成熟母鱼通常腹部更圆、体型略大；幼鱼阶段不建议仅凭体型判断。',
      points: ['成熟母鱼通常更圆润、略大。', '公鱼通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常相对更纤细'],
      femaleTraits: ['成熟后腹部更圆', '通常略大于公鱼'],
      limitations: ['饱食、健康状态和个体差异会影响体型判断，不能单凭一次观察确认。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '繁殖时会将卵散落在细叶植物、产卵拖把或网格附近；成鱼有吃卵风险。',
      fertilization: 'external',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '卵通常约 24–36 小时孵化' },
      breedingTriggers: ['繁殖缸通常使用较暗环境和偏软、偏酸的水'],
      fryCare: ['刚开口阶段需要非常细小的初生饵料，随后再过渡到微虫或丰年虾无节幼体'],
      parentFryRisk: ['亲鱼可能吃卵，应在发现卵后移出亲鱼或提供隔离结构'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      minimumGroupSize: 8,
      recommendedGroupSize: { min: 8, max: 10 },
      swimmingZone: 'middle',
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '温和群游鱼，建议至少 8–10 条成群饲养，并避免与明显更大的捕食性鱼混养。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      swimmingZone: 'middle',
      needsCover: true,
      spaceNotes: ['成体约 3 cm 标准体长，但群游与水平活动空间使 60 × 30 cm 缸底比单看体长更重要。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-innesi'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0432: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '性成熟母鱼通常腹部更圆、体型略大；幼鱼阶段不建议仅凭体型判断。',
      points: ['成熟母鱼通常更圆润、略大。', '公鱼通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常相对更纤细'],
      femaleTraits: ['成熟后腹部更圆', '通常略大于公鱼'],
      limitations: ['体型只能作为成熟个体的辅助判断，不应当作绝对性别结论。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '繁殖需要单独、偏暗的环境，并提供细叶植物、产卵拖把或网格作为产卵位置。',
      fertilization: 'external',
      parentalCare: 'unknown',
      breedingTriggers: ['繁殖环境通常需要较暗光线'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal',
      minimumGroupSize: 8,
      recommendedGroupSize: { min: 8, max: 10 },
      swimmingZone: 'middle',
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '温和群游鱼，建议至少 8–10 条成群饲养，并选择体型相近、非捕食性的混养对象。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3.5, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      swimmingZone: 'middle',
      needsCover: true,
      spaceNotes: ['成体约 3.5 cm 标准体长，长期群养按至少 60 × 30 cm 缸底规划。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-paracheirodon-axelrodi'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0014: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断',
      summary: '成熟母鱼通常更大、腹部更圆更宽；公鱼相对纤细。',
      points: ['母鱼：成熟后通常更大、更圆宽。', '公鱼：通常相对更纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal', minimumGroupSize: 4, recommendedGroupSize: { min: 6 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', predationRisk: 'low',
      summary: '温和平和、明显群居，长期建议至少 4–6 条；主要在底层觅食，不应被当作“只吃残饵的清洁工具”。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 7.5, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'medium', swimmingZone: 'bottom', needsCover: true,
      spaceNotes: ['长期饲养优先按至少 80 × 30 cm 缸底规划，底床以细砂或保持洁净的圆润底材更合适。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-aeneus'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0443: {
    sexIdentification: {
      title: '成熟后可从俯视体型辅助判断',
      summary: '成熟母鱼通常腹部更圆、体型略大；俯视时差异更容易观察。',
      points: ['母鱼：通常更圆、更宽，体型略大。', '公鱼：通常相对纤细。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'shoal', minimumGroupSize: 6, recommendedGroupSize: { min: 6 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', predationRisk: 'low',
      summary: '非常温和的底栖群居鱼，建议至少 6 条；不要和明显大型或攻击性强的鱼搭配。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 5, measurement: 'SL' }, minVolumeLiters: 41, minTankLengthCm: 45, activityLevel: 'medium', swimmingZone: 'bottom', needsCover: true,
      spaceNotes: ['小群可按至少 45 × 30 cm 缸底规划；细砂底床更符合其长期底栖觅食方式。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-corydoras-panda'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0010: {
    sexIdentification: {
      title: '成熟后可通过体型和鳍形辅助判断',
      summary: '成熟公鱼通常更小、更纤细，背鳍和臀鳍更尖；母鱼通常体型更大、腹部更丰满。',
      points: ['公鱼：通常更小、更纤细，背鳍和臀鳍更尖。', '母鱼：通常体型更大，成熟后腹部更丰满。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常更小、更纤细', '背鳍和臀鳍通常更尖'],
      femaleTraits: ['通常体型更大', '成熟后腹部更丰满'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-gymnocorymbus-ternetzi'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '体外受精、无亲代照护；成鱼会吃卵，繁殖后应尽快隔离成鱼。',
      fertilization: 'external',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '卵通常约 18–36 小时孵化' },
      parentFryRisk: ['成鱼会吃卵，产卵后应尽快移走成鱼或使用隔离结构。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-gymnocorymbus-ternetzi'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 20, max: 26 },
      phRange: { min: 6.0, max: 7.0 },
      hardnessDgh: { min: 5, max: 20 },
      notes: ['Seriously Fish 的长期养护范围比旧 catalog 更窄；FishBase 记录更宽的 pH 6–8，本产品使用较保守的 reviewed 养护区间。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'school',
      minimumGroupSize: 12,
      recommendedGroupSize: { min: 12 },
      swimmingZone: 'middle',
      territoriality: 'none',
      finNipping: 'medium',
      predationRisk: 'low',
      summary: '总体是活跃的和平群游鱼，但有追鳍倾向；至少 12 条更能把争执限制在群体内部，减少对同缸长鳍鱼的骚扰。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 7.5, measurement: 'SL' },
      minVolumeLiters: 68,
      minTankLengthCm: 75,
      activityLevel: 'high',
      swimmingZone: 'middle',
      needsCover: true,
      spaceNotes: ['长期群养按至少 75 × 30 cm 缸底和约 68L 水体规划；Seriously Fish 常见成体约 6cm SL，FishBase 记录可达 7.5cm SL，因此尺寸采用保守上界而不伪装成单一精确值。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-gymnocorymbus-ternetzi', 'fishbase-gymnocorymbus-ternetzi'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0012: {
    sexIdentification: {
      title: '成熟后可结合体型与体色辅助判断',
      summary: '成熟公鱼通常更小、更纤细且颜色更鲜艳；母鱼通常体型更厚实、颜色相对柔和。',
      points: ['公鱼：通常更小、更纤细，繁殖状态下颜色更强。', '母鱼：通常体型更厚实，颜色相对柔和。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常更小、更纤细', '繁殖状态下颜色更强'],
      femaleTraits: ['通常体型更厚实', '颜色相对柔和'],
      limitations: ['幼鱼或未进入成熟体色的个体不宜仅凭颜色判断性别。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntius-titteya'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'egg_scatterer',
      plainLanguageLabel: '散卵型',
      summary: '体外受精、散卵繁殖且无亲代照护；成鱼可能吃掉找到的鱼卵。',
      fertilization: 'external',
      parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '鱼卵通常约 24–48 小时孵化' },
      parentFryRisk: ['成鱼可能吃卵，繁殖时可用细叶植物、产卵拖把或网格降低损失。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntius-titteya', 'fishbase-puntius-titteya'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 20, max: 27 },
      phRange: { min: 6, max: 8 },
      hardnessDgh: { min: 2, max: 20 },
      notes: ['养殖群体对水化学适应范围较宽；野生来源个体更偏向范围的软水、弱酸到中性一侧。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntius-titteya', 'fishbase-puntius-titteya'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'school',
      minimumGroupSize: 6,
      recommendedGroupSize: { min: 6, max: 10 },
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '和平群游鱼；至少 6 条、通常 6–10 条的群体可降低紧张，并让公鱼呈现更自然的展示行为。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntius-titteya', 'fishbase-puntius-titteya'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 5, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['长期群养按至少 60 × 30 cm 缸底和约 54L 水体规划；该值用于空间规划，不作为差 1L 即失败的硬阈值。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntius-titteya', 'fishbase-puntius-titteya'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0468: {
    sexIdentification: {
      title: '成熟后可通过体型和三角斑形状辅助判断',
      summary: '成熟母鱼通常腹部更圆、体型略大；公鱼通常更纤细、颜色更强，体侧黑色楔形斑轮廓也往往更尖锐。',
      points: ['母鱼：成熟后腹部更圆，通常略大。', '公鱼：通常更纤细、颜色更强，黑色楔形斑轮廓较尖。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常更纤细、颜色更强', '黑色楔形斑轮廓通常更尖锐'],
      femaleTraits: ['成熟后腹部更圆', '通常略大'],
      limitations: ['体型和斑纹只能作为成熟个体的辅助特征，幼鱼或状态不佳时不要据此下确定结论。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trigonostigma-heteromorpha'], reviewedAt: '2026-09-12' },
    },
    reproduction: {
      mode: 'other',
      plainLanguageLabel: '叶背黏卵型',
      summary: '体外受精，鱼卵会黏附在宽叶植物或类似物体的下表面；成鱼不护卵，繁殖时通常需要隔离或防止成鱼接触鱼卵。',
      fertilization: 'external',
      parentalCare: 'none',
      breedingBehavior: ['鱼卵通常黏附在宽叶植物或类似物体的下表面。'],
      parentFryRisk: ['无亲代照护，繁殖布置通常需要避免成鱼继续接触鱼卵。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trigonostigma-heteromorpha', 'fishbase-trigonostigma-heteromorpha'], reviewedAt: '2026-09-12' },
    },
    environment: {
      waterType: 'freshwater',
      temperatureRangeC: { min: 21, max: 28 },
      phRange: { min: 5.0, max: 7.5 },
      hardnessDgh: { min: 1, max: 12 },
      notes: ['长期以稳定、偏软到中等硬度、弱酸到中性的淡水环境为主；reviewed 范围优先于旧 catalog 的较窄温度/pH 字符串。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trigonostigma-heteromorpha', 'fishbase-trigonostigma-heteromorpha'], reviewedAt: '2026-09-12' },
    },
    socialBehavior: {
      mode: 'school',
      minimumGroupSize: 8,
      recommendedGroupSize: { min: 8, max: 10 },
      territoriality: 'none',
      finNipping: 'low',
      predationRisk: 'low',
      summary: '非常温和的群游鱼；长期建议至少 8–10 条，足够群体能降低紧张并呈现更自然的展示行为。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trigonostigma-heteromorpha', 'fishbase-trigonostigma-heteromorpha'], reviewedAt: '2026-09-12' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 4.5, measurement: 'SL' },
      minVolumeLiters: 54,
      minTankLengthCm: 60,
      activityLevel: 'medium',
      needsCover: true,
      spaceNotes: ['长期群养按至少 60 × 30 cm 缸底和约 54L 水体规划；这是空间规划参考，不是差 1L 就失败的硬阈值。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-trigonostigma-heteromorpha', 'fishbase-trigonostigma-heteromorpha'], reviewedAt: '2026-09-12' },
    },
  },
  sp_0434: {
    sexIdentification: {
      title: '成熟后可通过体型和颜色辅助判断',
      summary: '成熟母鱼通常腹部更圆、略大；公鱼更纤细，繁殖状态下颜色往往更鲜明。',
      points: ['母鱼：成熟后腹部通常更圆、体型略大。', '公鱼：通常更纤细，竞争展示时颜色更明显。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['通常更纤细', '繁殖展示时颜色更明显'],
      femaleTraits: ['成熟后腹部更圆', '通常略大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '持续散卵型', summary: '状态良好时可频繁散卵，不护卵也不护幼。',
      fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 2, maxDays: 3, label: '卵通常约 48–60 小时孵化' },
      parentFryRisk: ['成鱼可能吃卵，应使用密植、网格或产卵拖把降低损失。'],
      fryCare: ['初期开口需要微小饵料，之后再过渡到微虫或丰年虾无节幼体。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'school', minimumGroupSize: 10, recommendedGroupSize: { min: 10 }, swimmingZone: 'middle', territoriality: 'none', finNipping: 'low', predationRisk: 'low',
      summary: '天然群游，建议 10 条以上；足够群体能减少紧张并让公鱼呈现更自然的展示行为。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 4, measurement: 'SL' }, minVolumeLiters: 54, minTankLengthCm: 60, activityLevel: 'medium', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['长期群养按至少 60 × 30 cm 缸底规划。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-tanichthys-albonubes'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0435: {
    sexIdentification: {
      title: '成熟后可通过体型辅助判断', summary: '成熟母鱼通常腹部更圆、略大且颜色稍淡；公鱼相对纤细，繁殖状态下颜色更强。',
      points: ['母鱼：成熟后腹部更圆，通常略大。', '公鱼：相对纤细，繁殖状态下颜色更强。'], confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' }, reliableFromLifeStage: 'adult',
      maleTraits: ['相对纤细', '繁殖状态下颜色更强'], femaleTraits: ['腹部更圆', '通常略大'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '散卵型', summary: '散卵繁殖且不护卵，成鱼会吃掉找到的卵。', fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '常见孵化约 24–36 小时' },
      parentFryRisk: ['成鱼会吃卵，繁殖时应使用网格、细叶植物或在产卵后移走成鱼。'],
      fryCare: ['初期使用极细小饵料，幼鱼长大后再过渡到丰年虾无节幼体等。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'school', minimumGroupSize: 8, recommendedGroupSize: { min: 8, max: 10 }, swimmingZone: 'middle', territoriality: 'none', finNipping: 'low', predationRisk: 'low',
      summary: '活跃群游鱼，建议至少 8–10 条；足够群体能降低紧张并呈现更自然的活动。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 5, measurement: 'SL' }, minVolumeLiters: 81, minTankLengthCm: 90, activityLevel: 'high', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['斑马鱼活动量高，即使小群也优先保证至少 90 × 30 cm 的水平游动空间。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-danio-rerio'], reviewedAt: '2026-09-11' },
    },
  },
  sp_0439: {
    sexIdentification: {
      title: '成体公母通常可通过体型和颜色辅助判断', summary: '成年公鱼通常更小、更纤细且颜色更强；母鱼通常更丰满。',
      points: ['公鱼：通常更小、更纤细、颜色更强。', '母鱼：通常腹部更丰满。'], confidence: 'verified',
      source: { type: 'species_data', label: 'SeriouslyFish', confidence: 'verified' }, reliableFromLifeStage: 'adult',
      maleTraits: ['更小、更纤细', '颜色通常更强'], femaleTraits: ['腹部通常更丰满'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'egg_scatterer', plainLanguageLabel: '散卵型', summary: '自由散卵且不护卵，繁殖后应避免成鱼继续接触鱼卵。', fertilization: 'external', parentalCare: 'none',
      gestationOrIncubation: { minDays: 1, maxDays: 2, label: '卵通常约 24–48 小时孵化' },
      parentFryRisk: ['成鱼会吃卵，产卵后应移出成鱼或使用隔离结构。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 8, recommendedGroupSize: { min: 8, max: 10 }, swimmingZone: 'middle', territoriality: 'low', finNipping: 'medium', predationRisk: 'low',
      summary: '群体内会形成松散等级并互相追逐；至少 8–10 条更能把注意力留在同类之间，减少骚扰同缸鱼。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 6, measurement: 'SL' }, minVolumeLiters: 72, minTankLengthCm: 80, activityLevel: 'high', swimmingZone: 'middle', needsCover: true,
      spaceNotes: ['按至少 80 × 30 cm 缸底规划，并为群体追逐和等级互动留出水平空间。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-puntigrus-tetrazona'], reviewedAt: '2026-09-11' },
    },
  },

  sp_0446: {
    sexIdentification: {
      title: '平时很难可靠分公母',
      summary: '普通体态差异不可靠；进入繁殖状态后，可结合生殖乳突和配对行为辅助判断。',
      points: ['繁殖期公鱼生殖乳突通常更小、更尖。', '非繁殖期不要只凭额头、体型或鳍形下结论。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      limitations: ['生殖乳突通常只有在繁殖时更容易观察，行为只能作为辅助。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', territoriality: 'medium', finNipping: 'low', finNipVulnerability: 'high', swimmingPace: 'moderate', predationRisk: 'medium',
      summary: '总体可做社区鱼，但成年后会有同类争斗和繁殖领地行为；长鳍使其不适合与习惯追鳍的鱼同缸，同时可能捕食很小的鱼。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare', 'tamu-pterophyllum-scalare-reproduction'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 15, measurement: 'SL' }, minVolumeLiters: 200, minTankLengthCm: 100, activityLevel: 'medium', needsCover: true,
      spaceNotes: ['成体按约 100 × 40 × 50 cm 以上规划；除了缸长，还要保留足够高度让背鳍和臀鳍舒展。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-pterophyllum-scalare'], reviewedAt: '2026-09-11' },
    },
  },
};

const reviewedKnowledgeByBaseSpeciesKey: Partial<Record<string, SpeciesKnowledgeProfile['knowledge']>> = {

  'Neocaridina davidi': {
    sexIdentification: {
      title: '成体公母可结合体型与腹部形态判断',
      summary: '几何形态研究显示，成体母虾整体更大，第二腹节侧板更宽更延长；但公虾体型与幼年母虾存在重叠，幼体阶段不宜只凭外形下结论。',
      points: ['成体母虾：通常更大，腹部第二节侧板更宽、更延长。', '公虾通常更小，但外形会与尚未成熟的母虾重叠。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Zootaxa', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      maleTraits: ['成体通常体型较小'],
      femaleTraits: ['成体整体更大', '第二腹节侧板更宽、更延长'],
      limitations: ['幼年母虾与公虾外形可重叠，未成熟个体不宜仅凭体型定性。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['zootaxa-neocaridina-sexual-dimorphism'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'other',
      plainLanguageLabel: '抱卵孵化',
      summary: 'Neocaridina davidi 可在完整淡水生命周期中繁殖；母虾完成卵巢成熟、抱卵和幼体孵化，成熟生物膜可为幼虾提供持续食物来源。',
      parentalCare: 'carrying',
      breedingAggression: 'none',
      fryCare: ['成熟生物膜和细密表面有助于幼虾取食与存活', '过滤进水口应避免吸入幼虾'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['aquaculture-research-neocaridina-life-cycle'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 6, recommendedGroupSize: { min: 6, max: 10 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow', predationVulnerability: 'high',
      summary: '该种属于高度群居、和平的淡水米虾。最低群体数量来自水族养护共识而非福利实验硬阈值，因此用于规划提醒，不作为差 1 只就失败的硬边界。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neocaridina-davidi', 'zootaxa-neocaridina-sexual-dimorphism'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 20, minTankLengthCm: 30, activityLevel: 'low', swimmingZone: 'bottom', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['成熟生物膜、植物和躲避结构比单纯追求更大的升数更重要。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neocaridina-davidi'], reviewedAt: '2026-09-11' },
    },
  },
  'Caridina cantonensis': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前纳入审核的来源足以支持群体和空间规划，但不足以把外观公母特征作为稳定的用户判断规则。',
      points: ['如需要繁殖配组，优先使用可靠繁育来源或成熟个体长期观察。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'group', minimumGroupSize: 10, recommendedGroupSize: { min: 10 }, swimmingZone: 'bottom', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow', predationVulnerability: 'high',
      summary: '水晶虾属于和平、群居的淡水米虾；更重要的限制通常是软酸水、稳定温度与成熟环境，而不是与同类争斗。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquendium-caridina-cantonensis'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 19, activityLevel: 'low', swimmingZone: 'bottom', needsCover: true, needsHidingPlaces: true,
      spaceNotes: ['优先保证稳定、成熟的软酸水环境和生物膜；参考水体不是单一硬阈值。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquendium-caridina-cantonensis'], reviewedAt: '2026-09-11' },
    },
  },
  'Neritina natalensis': {
    sexIdentification: {
      title: '外观公母不适合日常快速判断',
      summary: '斑马螺雌雄分开，但日常外观辨别并不稳定；当前不把颜色或壳纹当作性别依据。',
      points: ['如果不是繁殖目的，无需为了日常饲养强行判断公母。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '外观性别判断不作为当前产品规则', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'variable', swimmingZone: 'all', territoriality: 'none', finNipping: 'none', swimmingPace: 'slow',
      summary: '可单独或多只饲养，不设置最低群体数量；主要约束是成熟藻膜、硬度和足够的刮食表面。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neritina-natalensis'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 3, measurement: 'unknown' }, minVolumeLiters: 20, minTankLengthCm: 30, activityLevel: 'low', swimmingZone: 'all',
      spaceNotes: ['可用刮食面积和藻膜供给比“每只固定多少升”更重要。'],
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['aquariumhq-neritina-natalensis'], reviewedAt: '2026-09-11' },
    },
  },
  'Amatitlania nigrofasciata': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前已审核资料足以确认领地与攻击行为，但不足以把外观性别特征作为稳定的用户判断规则。',
      points: ['如果需要繁殖配对，优先结合可靠繁育来源与成熟个体的持续行为观察。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'variable',
      territoriality: 'high',
      finNipping: 'medium',
      swimmingPace: 'unknown',
      predationRisk: 'unknown',
      summary: '领地性与攻击行为是主要混养边界；进入繁殖和护域状态后风险会进一步上升，因此不能把“平时暂时和平”当作长期兼容。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['convict-cichlid-territory-study'], reviewedAt: '2026-09-12' },
    },
  },
  'Channa asiatica': {
    sexIdentification: {
      title: '本轮不提供外观公母硬判断',
      summary: '当前已审核资料足以支持捕食、单养和领地风险判断，但不足以把外观性别特征作为稳定的用户规则。',
      points: ['如果需要繁殖配对，优先使用有明确繁育记录的成熟个体来源，不凭颜色或头型猜测。'],
      confidence: 'unknown',
      source: { type: 'unknown', label: '公母辨别字段待补充专门来源', confidence: 'unknown' },
      reliableFromLifeStage: 'unknown',
    },
    socialBehavior: {
      mode: 'solitary',
      territoriality: 'unknown',
      finNipping: 'unknown',
      swimmingPace: 'unknown',
      predationRisk: 'high',
      summary: '已审核 Compatibility authority 将其视为捕食性、需要单养且有领地行为的鱼；小型鱼属于明确捕食目标，因此不能用短期未追逐来推断长期安全。',
      evidence: { confidence: 'derived', reviewStatus: 'reviewed', sourceIds: ['small-snakehead-fws-assessment'], reviewedAt: '2026-09-12' },
    },
  },
  'Betta splendens': {
    sexIdentification: {
      title: '成体公母通常较容易区分',
      summary: '成体公鱼通常颜色更强、鳍更延长；母鱼鳍通常较短。观赏品系差异很大，应结合多个特征判断。',
      points: ['公鱼：通常颜色更强，非成对鳍更延长。', '母鱼：通常鳍较短，体色表现相对收敛。'],
      confidence: 'verified',
      source: { type: 'species_data', label: 'Seriously Fish', confidence: 'verified' },
      reliableFromLifeStage: 'adult',
      limitations: ['短鳍品系会削弱“公鱼鳍更长”这一特征，不能只看鳍长。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    reproduction: {
      mode: 'bubble_nester', plainLanguageLabel: '泡巢繁殖', summary: '公鱼会建立泡巢并在繁殖过程中照护巢区；繁殖配对需要单独管理和大量躲避。',
      fertilization: 'external', parentalCare: 'egg_guarding', breedingAggression: 'high',
      breedingBehavior: ['公鱼筑泡巢并守巢', '繁殖前后需要给母鱼足够躲避空间'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    socialBehavior: {
      mode: 'solitary', territoriality: 'high', finNipping: 'medium', finNipVulnerability: 'high', swimmingPace: 'unknown', predationRisk: 'low',
      summary: '观赏斗鱼通常不适合作为普通社区鱼；同类和外形相似、长鳍对象都可能触发争斗，而自身延长鳍也容易成为追鳍目标。',
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
    spaceAndGrowth: {
      adultLengthCm: { max: 7, measurement: 'SL' }, minTankLengthCm: 45, activityLevel: 'low', needsCover: true,
      spaceNotes: ['至少按 45 × 30 cm 缸底作为基础空间参考，并优先使用缓流、带遮蔽的环境。'],
      evidence: { confidence: 'verified', reviewStatus: 'reviewed', sourceIds: ['seriouslyfish-betta-splendens'], reviewedAt: '2026-09-11' },
    },
  },
};

const parseRange = (value?: string) => {
  const matches = value?.match(/(\d+(?:\.\d+)?)/g);
  if (!matches?.length) return undefined;
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return undefined;
  return { min: Math.min(...values), max: Math.max(...values) };
};

const parseMinLiters = (value?: string) => {
  const range = parseRange(value);
  return range?.min;
};

const getWaterType = (fish: Fish): SpeciesKnowledgeProfile['facts']['waterType'] => {
  const text = `${fish.name} ${fish.scientificName} ${fish.category} ${fish.description}`;
  if (/汽水|brackish/i.test(text)) return 'brackish';
  if (/海水|珊瑚|海葵|水母|marine|coral|anemone|jellyfish/i.test(text)) return 'saltwater';
  if (/淡水|水草|虾|螺|鱼|freshwater/i.test(text)) return 'freshwater';
  return 'unknown';
};

export const getReviewedSpeciesKnowledge = (speciesId: string) => reviewedKnowledgeBySpeciesId[speciesId];

export const getReviewedSpeciesKnowledgeForFish = (fish: Pick<Fish, 'id' | 'scientificName'>) => {
  // Channa argus Platinum has a direct Phase 2 completion record, but the
  // existing reviewed Compatibility Profile remains the runtime authority for
  // its predator/solitary boundary. The completion matrix reads the direct
  // record explicitly and never counts this as inherited Knowledge.
  if (fish.id === 'sp_0016' || fish.id === 'sp_0224') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Mini-parrot already has an independent reviewed compatibility behavior
  // authority. Preserve that runtime inheritance; the direct completion
  // record is intentionally matrix-only until variant care is reviewed.
  if (fish.id === 'sp_0021') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Crystal Shrimp has a direct taxonomic completion record, but its
  // commercial form is not identified by that record. Keep runtime detail
  // inheritance for the existing base-species behavior; the matrix still
  // reads the direct record explicitly.
  if (fish.id === 'sp_0002') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Neritina natalensis has an existing reviewed compatibility profile. Keep
  // its runtime base authority for the duplicate launch-catalog object; the
  // direct completion record remains matrix-only and fail-closed.
  if (fish.id === 'sp_0428') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Neocaridina davidi Red is an existing reviewed shrimp runtime variant;
  // preserve its established runtime behavior while keeping this completion
  // record matrix-only and fail-closed for object-specific evidence.
  if (fish.id === 'sp_0001') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Neocaridina davidi wild type is also covered by an existing reviewed
  // shrimp runtime authority; keep that behavior while this direct catalog
  // completion record remains matrix-only and fail-closed.
  if (fish.id === 'sp_0459') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Guppy has an established reviewed runtime profile used by Species Detail;
  // keep that behavior while the direct completion record remains matrix-only.
  if (fish.id === 'sp_0436') {
    if (reviewedKnowledgeBySpeciesId[fish.id]) return reviewedKnowledgeBySpeciesId[fish.id];
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // The snakehead runtime authority is keyed by its base scientific name;
  // preserve that existing predator/solitary profile for Species Detail.
  if (fish.id === 'sp_0049') {
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // These catalog objects also have established Species Detail runtime
  // profiles; keep those profiles while their Batch 31 completion claims
  // remain matrix-only and fail-closed.
  if (['sp_0014', 'sp_0049', 'sp_0431', 'sp_0432', 'sp_0443', 'sp_0435'].includes(fish.id)) {
    if (reviewedKnowledgeBySpeciesId[fish.id]) return reviewedKnowledgeBySpeciesId[fish.id];
    const baseKey = getBaseSpeciesScientificName(fish.scientificName);
    return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
  }
  // Phase 2 completion records are direct evidence for the matrix and
  // Species Detail, but do not become Compatibility authority by existence.
  if (completionOnlyDirectKnowledgeIds.has(fish.id)) return undefined;
  const direct = reviewedKnowledgeBySpeciesId[fish.id];
  if (direct) return direct;
  const baseKey = getBaseSpeciesScientificName(fish.scientificName);
  return baseKey ? reviewedKnowledgeByBaseSpeciesKey[baseKey] : undefined;
};

export const buildSpeciesKnowledgeProfile = (fish: Fish): SpeciesKnowledgeProfile => {
  const reviewedKnowledge = getReviewedSpeciesKnowledgeForFish(fish);
  const reviewedEnvironment = reviewedKnowledge?.environment?.evidence.reviewStatus === 'reviewed'
    ? reviewedKnowledge.environment
    : undefined;
  const topTags = [
    fish.category,
    fish.housingMode,
    fish.difficulty === 'Easy' ? '新手友好' : fish.difficulty === 'Hard' ? '困难' : '中等',
  ].filter(Boolean).slice(0, 3) as string[];

  return {
    speciesId: fish.id,
    displayName: fish.name,
    scientificName: fish.scientificName,
    category: fish.category,
    topTags,
    facts: {
      waterType: reviewedEnvironment?.waterType ?? getWaterType(fish),
      temperatureRange: reviewedEnvironment?.temperatureRangeC ?? parseRange(fish.waterTemperature),
      phRange: reviewedEnvironment?.phRange ?? parseRange(fish.phLevel),
      minVolumeLiters: parseMinLiters(fish.tankSize),
      temperament: fish.temperament || 'unknown',
      housingMode: fish.housingMode || 'unknown',
      difficulty: fish.difficulty || 'unknown',
    },
    knowledge: reviewedKnowledge || {
      sexIdentification: {
        title: '暂无可靠的公母辨别资料',
        summary: '当前图鉴没有经过人工审核的公母辨别字段，系统不会仅凭名称或品类猜测公母。',
        points: [
          '可先按健康状态、体型完整度和活性挑选个体。',
          '如果确实需要配对繁殖，建议向可靠商家确认性别来源。',
          '后续补充人工审核资料后，这里会显示具体辨别要点。',
        ],
        confidence: 'unknown',
        source: {
          type: 'unknown',
          label: '缺少结构化公母辨别字段',
          confidence: 'unknown',
        },
      },
    },
    source: {
      type: 'species_data',
      label: '本地图鉴物种字段',
      confidence: 'derived',
    },
  };
};

export const getSpeciesKnowledgeTags = (profile: SpeciesKnowledgeProfile) => profile.topTags.slice(0, 3);
