import type { DiagnosisOutput, DiagnosisProblemType, DiagnosisQuestion } from './diagnosis.types';

type DiagnosisProblemPresentation = { label: string; description: string };
export type DiagnosisQuestionPresentation = {
  question: string;
  options: Array<{ value: string; label: string }>;
};

const problemEnglish: Record<DiagnosisProblemType, DiagnosisProblemPresentation> = {
  '鱼浮头 / 呼吸急促': { label: 'Gasping / Rapid Breathing', description: 'Check oxygen, water-quality swings, and short-term stress.' },
  '拒食': { label: 'Not Eating', description: 'Check acclimation stress, chasing pressure, feeding, and water quality.' },
  '躲藏不动': { label: 'Hiding / Inactive', description: 'Check stress, harassment, temperature, and water-quality changes.' },
  '追咬打架': { label: 'Chasing / Fighting', description: 'Check territory, stocking pressure, hiding space, and introduction order.' },
  '死亡 / 异常死亡': { label: 'Death / Sudden Death', description: 'Respond to a death, repeated losses, and contamination risk.' },
  '水质浑浊 / 异味': { label: 'Cloudy Water / Odor', description: 'Check leftovers, filtration, water changes, and organic load.' },
  '虾类死亡': { label: 'Shrimp Death', description: 'Check water-change shock, copper, water quality, and molting risk.' },
  '水草黄叶 / 烂叶': { label: 'Yellowing / Melting Plants', description: 'Check lighting, nutrients, CO₂, and acclimation.' },
  '巡检': { label: 'Daily Check', description: 'Review livestock behavior, water appearance, feeding, and maintenance.' },
  '水质异常': { label: 'Water Quality Issue', description: 'For cloudy/green water, odor, surface film, or gasping.' },
  '鱼只异常': { label: 'Fish Health Issue', description: 'For lethargy, gasping, not eating, spots, or fin damage.' },
  '新鱼入缸': { label: 'New Fish Acclimation', description: 'For hiding, not eating, harassment, or instability after introduction.' },
  '喂食问题': { label: 'Feeding Issue', description: 'Check portion size, leftovers, cloudy water, and bloating risk.' },
  '怀孕/鱼苗': { label: 'Pregnancy / Fry', description: 'Support gravid fish, newborn fry, first feeding, and separation.' },
  '死亡处理': { label: 'Death Response', description: 'Remove dead livestock and check repeated-loss and water-quality risks.' },
  '换水': { label: 'Water Change', description: 'Check whether to change water, how much, and how to do it safely.' },
  '设备异常': { label: 'Equipment Issue', description: 'Troubleshoot filter, heater, aeration, and lighting problems.' },
};

const questionEnglish: Record<string, string> = {
  '是否看到鱼浮头或呼吸急促？': 'Are any fish gasping at the surface or breathing rapidly?',
  '水体是否浑浊、发白或有异味？': 'Is the water cloudy, whitish, or unusually smelly?',
  '最近 48 小时是否换水或清洗过滤？': 'Did you change water or clean the filter in the last 48 hours?',
  '最近投喂量如何？': 'How much have you been feeding recently?',
  '是否有死亡个体？': 'Has any livestock died?',
  '拒食程度如何？': 'How severe is the loss of appetite?',
  '最近 7 天是否新增生物？': 'Did you add any new livestock in the last 7 days?',
  '是否有追咬或抢食压力？': 'Is there chasing or strong feeding competition?',
  '水体是否异常？': 'Does the water look or smell abnormal?',
  '躲藏或不动的程度？': 'How much is the fish hiding or staying inactive?',
  '是否有追咬或被压迫？': 'Is there chasing or harassment?',
  '水温是否波动？': 'Has the water temperature been unstable?',
  '追咬程度如何？': 'How severe is the chasing or aggression?',
  '最近是否新增生物？': 'Was any livestock added recently?',
  '缸里躲避空间是否足够？': 'Is there enough hiding space in the tank?',
  '当前密度看起来如何？': 'How crowded does the tank look?',
  '死了几条？': 'How many animals died?',
  '水有没有异常？': 'Does the water look or smell abnormal?',
  '最近 48 小时做过什么？': 'What changed in the last 48 hours?',
  '其他生物是否异常？': 'Are any other animals showing abnormal behavior?',
  '水体主要问题是什么？': 'What is the main water problem?',
  '最近是否过量喂食？': 'Has the tank been overfed recently?',
  '过滤是否正常运行？': 'Is the filter running normally?',
  '生物状态是否异常？': 'Is livestock behavior abnormal?',
  '虾类死亡数量？': 'How many shrimp have died?',
  '最近 48 小时是否换水？': 'Was there a water change in the last 48 hours?',
  '最近是否用药或除藻剂？': 'Have you used medication or algaecide recently?',
  '水草主要表现？': 'What is the main plant symptom?',
  '灯光情况如何？': 'What is the current lighting situation?',
  '底床或肥力情况？': 'What is the substrate or nutrient situation?',
  '是否有生物啃草或翻底？': 'Is any livestock eating plants or disturbing the substrate?',
  '鱼是否浮头或呼吸急促？': 'Are fish gasping at the surface or breathing rapidly?',
  '水体是否发白、发绿或浑浊？': 'Is the water whitish, green, or cloudy?',
  '水面是否有持续泡沫或油膜？': 'Is there persistent foam or an oily film on the surface?',
  '鱼缸是否出现异味？': 'Does the aquarium have an unusual odor?',
  '鱼是否拒食、趴底、躲藏或追咬？': 'Are fish not eating, resting on the bottom, hiding, or fighting?',
  '还有其他情况想补充吗？': 'Anything else you want to add?',
  '你看到的主要问题是什么？': 'What is the main problem you see?',
  '这个问题出现多久了？': 'How long has this problem been present?',
  '最近做过什么？': 'What changed recently?',
  '鱼有没有异常？': 'Are the fish showing abnormal behavior?',
  '鱼主要是什么表现？': 'What is the main symptom?',
  '是一条鱼还是多条鱼？': 'Is one fish affected or multiple fish?',
  '最近 7 天是否加过新鱼？': 'Were any new fish added in the last 7 days?',
  '水看起来是否异常？': 'Does the water look abnormal?',
  '新鱼入缸多久了？': 'How long has the new fish been in the tank?',
  '入缸前有没有过水？': 'Was the new fish acclimated before release?',
  '新鱼现在状态？': 'How is the new fish doing now?',
  '原缸鱼有没有追咬？': 'Are established fish chasing the newcomer?',
  '你遇到的是什么情况？': 'What feeding problem are you seeing?',
  '投喂后多久吃完？': 'How long does it take for the food to be eaten?',
  '鱼现在状态？': 'How are the fish doing now?',
  '你现在是哪种情况？': 'Which situation best matches what you see?',
  '是新鱼还是养了一段时间的鱼？': 'Was the fish newly added or established?',
  '这次准备换多少水？': 'How much water are you planning to change?',
  '新水准备好了吗？': 'Is the replacement water prepared?',
  '新水和缸内水温接近吗？': 'Is the replacement water close to the tank temperature?',
  '鱼现在状态如何？': 'How are the fish behaving right now?',
  '哪个设备异常？': 'Which device has a problem?',
  '异常持续多久？': 'How long has the equipment problem lasted?',
  '鱼是否有异常表现？': 'Are the fish showing abnormal behavior?',
  '是否已经恢复设备？': 'Has the equipment been restored?',
  '母鱼状态怎么样？': 'How is the mother fish behaving?',
  '缸里有没有躲避物？': 'Does the tank have dense cover or a nursery area?',
  '同缸有没有会吃鱼苗的成鱼？': 'Are there adult tankmates that may eat the fry?',
  '小鱼出生多久了？': 'How old are the fry?',
  '小鱼现在在哪里？': 'Where are the fry now?',
  '鱼苗有没有开始吃东西？': 'Have the fry started eating?',
  '母鱼肚子形状更像哪种？': 'Which shape best describes the abdomen?',
  '母鱼最近行为怎么样？': 'How has the mother fish been behaving recently?',
  '是哪类鱼？': 'What type of fish is it?',
};

const optionEnglish: Record<string, string> = {
  '没有': 'No',
  '偶尔浮头': 'Occasional surface gasping',
  '经常浮头': 'Frequent surface gasping',
  '呼吸明显急促': 'Clearly rapid breathing',
  '不确定': 'Not sure',
  '清澈无异味': 'Clear, no unusual odor',
  '轻微浑浊': 'Slightly cloudy',
  '明显浑浊': 'Clearly cloudy',
  '有异味': 'Unusual odor',
  '少量换水': 'Small water change',
  '大比例换水': 'Large water change',
  '清洗过滤': 'Cleaned the filter',
  '正常': 'Normal',
  '偏多': 'More than usual',
  '有残饵': 'Uneaten food remains',
  '今天没喂': 'Not fed today',
  '死亡 1 条': '1 fish died',
  '死亡多条': 'Multiple fish died',
  '偶尔不吃': 'Occasionally refuses food',
  '连续一天不吃': 'Not eating for 1 day',
  '连续多天不吃': 'Not eating for several days',
  '全缸都不吃': 'The whole tank is not eating',
  '有新增生物': 'New livestock added',
  '刚入缸 1-3 天': 'Added 1–3 days ago',
  '偶尔追': 'Occasional chasing',
  '明显追咬': 'Obvious chasing / biting',
  '抢食严重': 'Severe feeding competition',
  '清澈': 'Clear',
  '发白': 'Whitish',
  '水面油膜': 'Surface oil film',
  '偶尔躲藏': 'Occasional hiding',
  '长时间躲藏': 'Hiding for long periods',
  '趴底不动': 'Inactive on the bottom',
  '全缸都异常': 'Whole tank affected',
  '稳定': 'Stable',
  '略有波动': 'Slight fluctuations',
  '明显波动': 'Large fluctuations',
  '偶尔追逐': 'Occasional chasing',
  '咬伤鳍条': 'Fin damage from biting',
  '持续霸占区域': 'Continuously guarding territory',
  '刚调整鱼缸布局': 'Tank layout was just changed',
  '足够': 'Enough',
  '一般': 'Somewhat limited',
  '几乎没有': 'Almost none',
  '不拥挤': 'Not crowded',
  '略拥挤': 'Slightly crowded',
  '很拥挤': 'Very crowded',
  '1 条': '1 fish',
  '连续死了多条': 'Repeated multiple deaths',
  '换水': 'Water change',
  '加药': 'Medication added',
  '新鱼入缸': 'New fish added',
  '喂多了': 'Overfed',
  '浮头': 'Surface gasping',
  '拒食': 'Not eating',
  '趴缸': 'Resting on the bottom',
  '多条异常': 'Multiple animals abnormal',
  '发绿': 'Green water',
  '水流变弱': 'Flow is weaker',
  '刚清洗过滤': 'Filter was just cleaned',
  '停过过滤': 'Filter stopped recently',
  '死亡': 'Death',
  '1 只': '1 shrimp',
  '多只': 'Multiple shrimp',
  '连续死亡': 'Repeated deaths',
  '用过药': 'Medication used',
  '用过除藻剂': 'Algaecide used',
  '黄叶': 'Yellow leaves',
  '烂叶': 'Rotting leaves',
  '融叶': 'Leaf melt',
  '长藻': 'Algae growth',
  '停止生长': 'Growth stopped',
  '正常 6-8 小时': 'Normal, 6–8 hours',
  '时间太短': 'Too short',
  '时间太长': 'Too long',
  '刚换灯': 'Light was recently changed',
  '水草泥/根肥正常': 'Aquasoil / root fertilizer is adequate',
  '没有肥力底床': 'No nutrient substrate',
  '刚翻动底床': 'Substrate was recently disturbed',
  '有啃草': 'Plants are being nibbled',
  '有翻底': 'Substrate is being disturbed',
  '没有泡沫或油膜': 'No foam or oil film',
  '少量短暂泡沫': 'Small, temporary foam',
  '持续泡沫': 'Persistent foam',
  '没有异味': 'No unusual odor',
  '轻微腥味': 'Mild fishy smell',
  '明显异味': 'Strong unusual odor',
  '正常游动和进食': 'Swimming and eating normally',
  '持续躲藏': 'Persistent hiding',
  '追咬打架': 'Chasing / fighting',
  '没有特别操作': 'No notable changes',
  '新增生物': 'Added livestock',
  '跳过': 'Skip',
  '水发白': 'Whitish water',
  '水发绿': 'Green water',
  '鱼浮头喘气': 'Fish gasping at the surface',
  '今天刚出现': 'Started today',
  '1-2 天': '1–2 days',
  '3 天以上': '3+ days',
  '浮头喘气': 'Surface gasping',
  '不吃食': 'Not eating',
  '多条鱼异常': 'Multiple fish affected',
  '身上白点': 'White spots',
  '烂尾烂鳍': 'Fin / tail rot',
  '擦缸蹭缸': 'Flashing / rubbing',
  '一条鱼': 'One fish',
  '多条鱼': 'Multiple fish',
  '是': 'Yes',
  '今天刚入缸': 'Added today',
  '1-3 天': '1–3 days',
  '4-7 天': '4–7 days',
  '超过一周': 'More than a week',
  '过温和过水都做了': 'Temperature and water acclimation completed',
  '只泡袋对温': 'Temperature acclimation only',
  '直接入缸': 'Added directly',
  '躲藏': 'Hiding',
  '被追赶': 'Being chased',
  '不知道喂多少': 'Not sure how much to feed',
  '鱼不吃': 'Fish will not eat',
  '吃不完剩很多': 'A lot of food remains',
  '水变浑': 'Water becomes cloudy',
  '2 分钟内': 'Within 2 minutes',
  '5 分钟内': 'Within 5 minutes',
  '吃不完沉底': 'Food sinks uneaten',
  '腹胀': 'Bloating',
  '抢食明显': 'Strong feeding competition',
  '母鱼肚子变大': 'Female abdomen is enlarged',
  '已经看到小鱼': 'Fry are already visible',
  '不知道是不是怀孕': 'Not sure if she is pregnant',
  '2-3 条': '2–3 fish',
  '新鱼': 'New fish',
  '养了一段时间': 'Established fish',
  '都有': 'Both',
  '10%': '10%',
  '20%': '20%',
  '30%': '30%',
  '已困水': 'Water has been conditioned / rested',
  '使用除氯剂': 'Dechlorinator used',
  '还没处理': 'Not treated yet',
  '接近': 'Very close',
  '可能差 1-2°C': 'May differ by 1–2°C',
  '温差较大': 'Large temperature difference',
  '浮头/呼吸急促': 'Gasping / rapid breathing',
  '趴缸/躲藏': 'Bottom resting / hiding',
  '过滤': 'Filter',
  '加热棒': 'Heater',
  '氧气/气泵': 'Aeration / air pump',
  '灯光': 'Lighting',
  '刚发现': 'Just noticed',
  '几小时': 'A few hours',
  '一天以上': 'More than a day',
  '急促呼吸': 'Rapid breathing',
  '已恢复': 'Restored',
  '未恢复': 'Not restored',
  '正常游动': 'Swimming normally',
  '躲在角落': 'Hiding in a corner',
  '呼吸急促': 'Rapid breathing',
  '有密集水草': 'Dense plants available',
  '有隔离盒': 'Nursery / breeder box available',
  '有': 'Yes',
  '今天刚出生': 'Born today',
  '隔离盒': 'Nursery / breeder box',
  '主缸水草里': 'In plants in the main tank',
  '被成鱼追': 'Being chased by adult fish',
  '看不到几条了': 'Only a few can still be seen',
  '还没喂': 'Not fed yet',
  '会吃': 'Eating',
  '不会吃': 'Not eating yet',
  '明显变方': 'Noticeably boxy / squared abdomen',
  '只是变圆': 'Only looks rounder',
  '看不出来': 'Cannot tell',
  '被追': 'Being chased',
  '孔雀/月光/玛丽': 'Guppy / platy / molly',
  '灯鱼/卵生鱼': 'Tetra / egg-laying fish',
};

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

export const getDiagnosisProblemPresentation = (
  problemType: DiagnosisProblemType,
  isEnglish: boolean,
): DiagnosisProblemPresentation => {
  if (isEnglish) return problemEnglish[problemType];
  return { label: problemType, description: '' };
};

export const getDiagnosisQuestionPresentation = (
  question: DiagnosisQuestion,
  isEnglish: boolean,
): DiagnosisQuestionPresentation => {
  if (!isEnglish) {
    return {
      question: question.question,
      options: question.options.map(value => ({ value, label: value })),
    };
  }
  return {
    question: questionEnglish[question.question] || question.question,
    options: question.options.map(value => ({ value, label: optionEnglish[value] || value })),
  };
};

export const getDiagnosisProblemEnglishCoverage = () => problemEnglish;
export const getDiagnosisQuestionEnglishCoverage = () => ({ questions: questionEnglish, options: optionEnglish });
export const isDiagnosisPresentationEnglishComplete = (question: DiagnosisQuestion) => {
  const localized = getDiagnosisQuestionPresentation(question, true);
  return !hasCjk(localized.question) && localized.options.every(option => !hasCjk(option.label));
};

type DiagnosisRuleEnglishPresentation = {
  summary: string;
  actions: string[];
  avoidActions: string[];
  possibleCauses: string[];
  observeItems: string[];
  missingInfo: string[];
};

const fixedRule = (presentation: DiagnosisRuleEnglishPresentation) => () => presentation;

const diagnosisRuleEnglish: Record<string, (result: DiagnosisOutput) => DiagnosisRuleEnglishPresentation> = {
  'water-breathing-high-risk': fixedRule({
    summary: 'Surface gasping together with abnormal water suggests low oxygen or deteriorating water quality.',
    actions: ['Increase aeration or surface agitation immediately', 'Stop feeding today', 'Change 20–30% of the water'],
    avoidActions: ['Do not replace all tank water at once', 'Do not medicate without a clear reason', 'Do not continue heavy feeding'],
    possibleCauses: ['Low dissolved oxygen', 'Deteriorating water quality', 'Waste or leftover-food pollution'],
    observeItems: ['Whether breathing improves', 'Whether surface gasping continues', 'Whether the water still smells abnormal'],
    missingInfo: ['If there is no improvement, add water-test results or a clear photo/video'],
  }),
  'frequent-breathing-warning': fixedRule({
    summary: 'Frequent surface gasping or clearly rapid breathing needs prompt checks for oxygen, temperature, and filtration problems.',
    actions: ['Increase aeration or surface agitation immediately', 'Check that the filter is flowing normally', 'Pause feeding for 12–24 hours'],
    avoidActions: ['Do not add more fish', 'Do not medicate without a clear reason', 'Do not make multiple major tank changes at once'],
    possibleCauses: ['Low dissolved oxygen', 'Abnormal filter flow', 'Temperature or water-quality swings'],
    observeItems: ['Whether breathing improves within 30–60 minutes after aeration', 'Whether multiple fish are gasping', 'Whether the water becomes cloudy or develops an odor'],
    missingInfo: ['Ammonia / nitrite readings', 'Filter-flow status', 'Recent temperature changes'],
  }),
  'occasional-breathing-watch': fixedRule({
    summary: 'Occasional surface gasping is more consistent with mild oxygen shortage, short-term stress, or an environmental fluctuation.',
    actions: ['Increase surface agitation or add short-term aeration', 'Check whether filter flow has weakened', 'Reduce the next feeding amount'],
    avoidActions: ['Do not medicate immediately', 'Do not perform a large water change at once', 'Do not add more livestock yet'],
    possibleCauses: ['Mild oxygen shortage', 'Short-term stress', 'Higher water load after feeding'],
    observeItems: ['Whether gasping becomes frequent', 'Whether appetite loss or bottom resting appears', 'Whether the water becomes cloudy'],
    missingInfo: ['How long it has lasted', 'Recent feeding amount', 'Filter and aeration status'],
  }),
  'multiple-death-high-risk': fixedRule({
    summary: 'Repeated deaths or multiple affected animals are high risk; control possible pollution first and watch the remaining tankmates.',
    actions: ['Remove dead livestock immediately', 'Stop feeding today', 'Check for cloudiness or unusual odor'],
    avoidActions: ['Do not leave dead livestock in the tank', 'Do not dose the whole tank aggressively without a clear cause', 'Do not add new livestock'],
    possibleCauses: ['Water-quality risk', 'Potential infectious disease', 'Stress from water changes or medication'],
    observeItems: ['Whether other fish are gasping', 'Whether deaths continue', 'Whether white spots or fin damage appear'],
    missingInfo: ['Recent water-change, medication, and new-livestock history'],
  }),
  'after-water-change-stress': fixedRule({
    summary: 'This looks more like short-term stress or a water-quality swing after a water change.',
    actions: ['Increase aeration', 'Keep temperature stable', 'Observe for 2–4 hours first'],
    avoidActions: ['Do not immediately perform another large water change', 'Do not repeatedly net the fish', 'Do not medicate without a clear reason'],
    possibleCauses: ['Temperature shock', 'Insufficient dechlorination', 'Water-quality fluctuation'],
    observeItems: ['Whether breathing returns to normal', 'Whether bottom resting continues', 'Whether multiple fish are affected'],
    missingInfo: ['Water-change percentage and old/new water temperature difference'],
  }),
  'new-fish-stress': fixedRule({
    summary: 'Hiding or refusing food soon after introduction is most often consistent with acclimation stress.',
    actions: ['Dim or turn off the light for half a day', 'Reduce disturbance', 'Feed lightly or skip feeding today'],
    avoidActions: ['Do not repeatedly net the new fish for inspection', 'Do not rush to medicate', 'Do not perform a large water change on the same day'],
    possibleCauses: ['Introduction stress', 'Incomplete acclimation', 'Harassment from tankmates'],
    observeItems: ['Whether the fish becomes active within 24–72 hours', 'Whether it is being chased', 'Whether gasping or white spots appear'],
    missingInfo: ['How the fish was acclimated', 'Whether established tankmates are chasing it'],
  }),
  'appetite-behavior-watch': fixedRule({
    summary: 'Loss of appetite needs to be interpreted with breathing, activity, and recent changes; check water quality and stress first.',
    actions: ['Stop extra feeding and remove leftovers', 'Check temperature, filter flow, and water odor', 'Watch for bottom resting, hiding, or rapid breathing'],
    avoidActions: ['Do not keep offering food repeatedly as a test', 'Do not medicate without a clear cause', 'Do not repeatedly net the fish'],
    possibleCauses: ['Environmental stress', 'Water-quality or temperature fluctuation', 'Early disease signs'],
    observeItems: ['Whether normal feeding resumes next time', 'Whether bottom resting or gasping appears', 'Whether only one fish is affected'],
    missingInfo: ['How long appetite loss has lasted', 'Recent water-change, medication, or new-livestock history'],
  }),
  'overfeeding-cloudy-water': fixedRule({
    summary: 'This is more consistent with overfeeding or leftover food increasing the water-quality load.',
    actions: ['Remove visible leftover food', 'Pause feeding for 12–24 hours', 'If needed, change 10–20% of the water'],
    avoidActions: ['Do not add another feeding', 'Do not leave leftovers overnight', 'Do not replace all tank water at once'],
    possibleCauses: ['Leftover-food pollution', 'Higher filtration load', 'Excess feeding'],
    observeItems: ['Whether the water clears', 'Whether the abdomen remains swollen', 'Whether food continues to remain uneaten'],
    missingInfo: ['How long each feeding takes to finish'],
  }),
  'aggression-space-pressure': (result) => ({
    summary: result.riskLevel === 'high'
      ? 'Chasing is affecting safety; reduce territory and space pressure first.'
      : 'There is chasing or feeding pressure; add cover and identify the affected animal first.',
    actions: ['Add plants, wood, or rock gaps as hiding areas', 'Pause adding new livestock', 'Watch whether the chased animal stops eating or is injured'],
    avoidActions: ['Do not expand the mixed-species group yet', 'Do not repeatedly chase and net all livestock', 'Do not rely on extra food alone to solve competition'],
    possibleCauses: ['Territorial pressure', 'High stocking density', 'Recent introduction-order changes'],
    observeItems: ['Whether the same animal is repeatedly targeted', 'Whether fin damage or hiding appears', 'Whether feeding competition is severe'],
    missingInfo: ['Which animal is being chased', 'Tank length and hiding space', 'Whether livestock was added recently'],
  }),
  'water-clarity-check': (result) => ({
    summary: result.riskLevel === 'medium'
      ? 'The water shows a clear abnormality; reduce the load and check filtration first.'
      : 'The water is mildly abnormal; check leftovers, filtration, and recent changes first.',
    actions: ['Remove visible leftovers and decaying material', 'Check that filtration is running normally', 'If needed, change 10–20% of the water'],
    avoidActions: ['Do not replace all tank water at once', 'Do not continue overfeeding', 'Do not clean all filter media at the same time'],
    possibleCauses: ['Leftover-food pollution', 'Higher filtration load', 'Microbial-balance fluctuation'],
    observeItems: ['Whether cloudiness worsens', 'Whether gasping or appetite loss appears', 'Whether odor becomes stronger'],
    missingInfo: ['Recent feeding amount', 'Filter status', 'Ammonia / nitrite readings'],
  }),
  'fry-care-flow': fixedRule({
    summary: 'The priority is safe cover, first feeding, and gentle water flow for the fry.',
    actions: ['Provide a nursery area or dense plants', 'Feed tiny portions of fine food / brine shrimp several times', 'Remove leftovers and avoid strong flow'],
    avoidActions: ['Do not direct strong flow at the fry', 'Do not feed a large amount of powder at once', 'Do not repeatedly move the mother fish'],
    possibleCauses: ['Breeding-stage changes', 'Predation risk from adults', 'Flow or leftover-food risk'],
    observeItems: ['Whether adults chase the fry', 'Whether the fry begin feeding', 'Whether the water becomes cloudy'],
    missingInfo: ['Species', 'Time since birth'],
  }),
  'pregnancy-care-flow': fixedRule({
    summary: 'The priority is confirming whether birth is near while reducing stress on the mother fish.',
    actions: ['Provide cover or a nursery box', 'Reduce chasing and disturbance', 'Watch for signs that birth is near'],
    avoidActions: ['Do not direct strong flow at fry', 'Do not feed excessive powder', 'Do not repeatedly move the mother fish'],
    possibleCauses: ['Breeding-stage changes', 'Predation risk from adults', 'Flow or leftover-food risk'],
    observeItems: ['Whether the mother is being chased', 'Whether fry appear and begin feeding', 'Whether the water becomes cloudy'],
    missingInfo: ['Species', 'Expected / actual birth timing'],
  }),
  'normal-patrol': (result) => ({
    summary: result.riskLevel === 'medium'
      ? 'There are current tank reminders; start with a light observation check.'
      : 'No obvious abnormality was found; continue normal observation.',
    actions: result.riskLevel === 'medium'
      ? ['Watch for surface gasping or bottom resting', 'Check for unusual water odor', 'Record today’s status']
      : ['Continue normal observation', 'Record feeding or water changes', 'Open the relevant check if a new abnormality appears'],
    avoidActions: ['Do not medicate without symptoms', 'Do not perform frequent large water changes'],
    possibleCauses: result.riskLevel === 'medium' ? ['Existing compatibility or water-condition reminders'] : ['No obvious abnormality at this time'],
    observeItems: ['Breathing rate', 'Feeding response', 'Water odor'],
    missingInfo: [],
  }),
  'generic-symptom-check': (result) => ({
    summary: result.riskLevel === 'unknown'
      ? 'There is not enough information yet; add observation and water-condition details first.'
      : 'No high-risk rule was triggered; start with a light check and short-term observation.',
    actions: ['Record when the abnormality started and how much of the tank is affected', 'Check filter flow, temperature, and water odor', 'Keep the next feeding small enough to finish within 2–3 minutes'],
    avoidActions: ['Do not medicate without a clear reason', 'Do not repeatedly net the fish', 'Do not suddenly perform a large water change'],
    possibleCauses: ['Insufficient information', 'Mild stress', 'Environmental fluctuation'],
    observeItems: ['Whether breathing becomes rapid', 'Whether appetite loss continues', 'Whether the water becomes abnormal'],
    missingInfo: ['How long the abnormality has lasted', 'Photo or video description'],
  }),
  'static-no-aquarium': fixedRule({
    summary: 'Select an aquarium before running a diagnosis.',
    actions: ['Select or create an aquarium first'],
    avoidActions: ['Do not make a diagnosis without aquarium data'],
    possibleCauses: [],
    observeItems: [],
    missingInfo: ['Aquarium data'],
  }),
  'static-no-livestock': fixedRule({
    summary: 'There is no recorded livestock in this aquarium, so livestock health cannot be assessed.',
    actions: ['Confirm that filtration, temperature, and water conditions are stable', 'If the issue is only cloudy water or equipment, choose the matching problem type', 'Add livestock records before running a livestock diagnosis'],
    avoidActions: ['Do not diagnose fish disease without a livestock record', 'Do not apply species-specific advice from another fish'],
    possibleCauses: ['There is not enough livestock data to assess animal condition'],
    observeItems: ['Whether filter flow is normal', 'Whether the water is cloudy or smells abnormal', 'Whether temperature is stable'],
    missingInfo: ['Livestock records'],
  }),
  'static-no-shrimp': fixedRule({
    summary: 'There is no shrimp recorded in this aquarium, so a shrimp-death diagnosis cannot be generated.',
    actions: ['Confirm that the correct aquarium is selected', 'If shrimp are present, add them to the aquarium record', 'If the issue is water quality, switch to the water-quality check'],
    avoidActions: ['Do not apply shrimp molting or copper-risk conclusions to a tank without shrimp'],
    possibleCauses: ['There is not enough livestock data to assess shrimp condition'],
    observeItems: ['Whether the livestock record is complete', 'Whether the water is cloudy or smells abnormal'],
    missingInfo: ['Shrimp livestock record'],
  }),
  'static-no-plants': fixedRule({
    summary: 'There is no recorded plant setup in this aquarium, so yellowing or melting plants cannot be assessed.',
    actions: ['Confirm whether plants are recorded in the aquarium', 'Check lighting duration and filter stability', 'If plants are present, add them to the aquarium setup first'],
    avoidActions: ['Do not apply plant-deficiency conclusions to a tank with no recorded plants'],
    possibleCauses: ['There is not enough plant-setup data to assess plant condition'],
    observeItems: ['Whether lighting is normal', 'Whether the water is cloudy', 'Whether the substrate was disturbed recently'],
    missingInfo: ['Plant setup record'],
  }),
};

const diagnosisRiskEnglish: Record<DiagnosisOutput['riskLevel'], string> = {
  low: 'Low risk',
  medium: 'Needs attention',
  high: 'High risk',
  unknown: 'Insufficient information',
};

const diagnosisSummaryEnglish: Record<string, string> = {
  '鱼浮头并伴随水体异常，优先怀疑缺氧或水质恶化。': diagnosisRuleEnglish['water-breathing-high-risk']({ riskLevel: 'high' } as DiagnosisOutput).summary,
  '经常浮头或呼吸明显急促需要优先按缺氧、水温或过滤异常排查。': diagnosisRuleEnglish['frequent-breathing-warning']({ riskLevel: 'high' } as DiagnosisOutput).summary,
  '偶尔浮头更像轻微缺氧、短期应激或环境波动，需要先观察并排查供氧。': diagnosisRuleEnglish['occasional-breathing-watch']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '连续死亡或多条异常属于高风险，需要先控制污染源和观察同缸鱼。': diagnosisRuleEnglish['multiple-death-high-risk']({ riskLevel: 'high' } as DiagnosisOutput).summary,
  '更像是换水后的短期应激或水质波动。': diagnosisRuleEnglish['after-water-change-stress']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '新鱼刚入缸躲藏或拒食，多数是应激。': diagnosisRuleEnglish['new-fish-stress']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '拒食需要结合呼吸、活动和近期操作继续观察，先排除水质与应激因素。': diagnosisRuleEnglish['appetite-behavior-watch']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '更像是投喂过量或残饵导致的水质负担。': diagnosisRuleEnglish['overfeeding-cloudy-water']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '追咬已经影响安全，需要优先降低领地和空间压力。': diagnosisRuleEnglish['aggression-space-pressure']({ riskLevel: 'high' } as DiagnosisOutput).summary,
  '当前有追逐或抢食压力，需要先增加躲避和观察对象。': diagnosisRuleEnglish['aggression-space-pressure']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '水体已经有明显异常，需要先减负并检查过滤。': diagnosisRuleEnglish['water-clarity-check']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '水体轻微异常，先排查残饵、过滤和近期操作。': diagnosisRuleEnglish['water-clarity-check']({ riskLevel: 'low' } as DiagnosisOutput).summary,
  '当前重点是鱼苗躲避、开口和水流安全。': diagnosisRuleEnglish['fry-care-flow']({ riskLevel: 'low' } as DiagnosisOutput).summary,
  '当前重点是确认是否临产，并减少母鱼应激。': diagnosisRuleEnglish['pregnancy-care-flow']({ riskLevel: 'low' } as DiagnosisOutput).summary,
  '当前鱼缸有提醒，建议先做轻量观察。': diagnosisRuleEnglish['normal-patrol']({ riskLevel: 'medium' } as DiagnosisOutput).summary,
  '当前未发现明显异常，可以正常观察。': diagnosisRuleEnglish['normal-patrol']({ riskLevel: 'low' } as DiagnosisOutput).summary,
  '当前信息不足，建议先补充观察和水质信息。': diagnosisRuleEnglish['generic-symptom-check']({ riskLevel: 'unknown' } as DiagnosisOutput).summary,
  '目前没有命中高风险规则，先做轻量排查和短期观察。': diagnosisRuleEnglish['generic-symptom-check']({ riskLevel: 'low' } as DiagnosisOutput).summary,
};

const diagnosisMetricEnglish: Record<string, string> = {
  '问题类型': 'Problem type',
  '风险等级': 'Risk level',
  '最近换水': 'Recent water change',
  '最近喂食': 'Recent feeding',
  '当前鱼缸': 'Aquarium',
  '活体数量': 'Livestock count',
};

const diagnosisEvidencePrefixEnglish: Record<string, string> = {
  '来自当前鱼缸': 'Current aquarium',
  '当前鱼缸': 'Aquarium',
  '当前真实活体': 'Current livestock',
  '当前活体': 'Current livestock',
  '水体': 'Water',
  '入口': 'Entry',
  '最近诊断': 'Recent diagnosis',
  '匹配百科': 'Matched care guide',
  '体态观察重点': 'Observation focus',
};

const diagnosisAnswerKeyEnglish: Record<string, string> = {
  breathing: 'Breathing',
  waterLook: 'Water appearance',
  surfaceLook: 'Water surface',
  odor: 'Odor',
  behavior: 'Fish behavior',
  recentActions: 'Recent changes',
};

const uniqueEnglish = (values: string[]) => [...new Set(values.filter(Boolean))];

export const getDiagnosisCanonicalValuePresentation = (value: string, isEnglish: boolean) => {
  if (!isEnglish) return value;
  if (optionEnglish[value]) return optionEnglish[value];
  if (Object.prototype.hasOwnProperty.call(problemEnglish, value)) {
    return problemEnglish[value as DiagnosisProblemType].label;
  }
  if (value === '低风险') return diagnosisRiskEnglish.low;
  if (value === '需要关注') return diagnosisRiskEnglish.medium;
  if (value === '高风险') return diagnosisRiskEnglish.high;
  if (value === '信息不足') return diagnosisRiskEnglish.unknown;
  if (value === '今天') return 'Today';
  if (value === '昨天') return 'Yesterday';
  if (value === '无' || value === '暂无') return 'None';
  if (value === '未知' || value === '不确定') return 'Unknown';
  if (value === '未记录' || value === '暂无记录') return 'Not recorded';
  const daysAgo = value.match(/^(\d+)\s*天前$/);
  if (daysAgo) return `${daysAgo[1]} days ago`;
  const livestockCount = value.match(/^(\d+)\s*只\/条$/);
  if (livestockCount) return `${livestockCount[1]} animals`;
  return value;
};

const translateEvidence = (item: string) => {
  const delimiter = item.includes('：') ? '：' : item.includes(':') ? ':' : '';
  if (!delimiter) return getDiagnosisCanonicalValuePresentation(item, true);
  const [rawKey, ...rest] = item.split(delimiter);
  const rawValue = rest.join(delimiter).trim();
  const key = rawKey.trim();
  const label = diagnosisEvidencePrefixEnglish[key] || diagnosisAnswerKeyEnglish[key] || key;
  const translatedValue = rawValue
    .split(' · ')
    .map(part => getDiagnosisCanonicalValuePresentation(part, true))
    .join(' · ');
  return `${label}: ${translatedValue}`;
};

export const projectDiagnosisOutputForPresentation = (
  result: DiagnosisOutput,
  isEnglish: boolean,
): DiagnosisOutput => {
  if (!isEnglish) return result;
  const presentations = result.matchedRules
    .map(ruleId => diagnosisRuleEnglish[ruleId]?.(result))
    .filter((item): item is DiagnosisRuleEnglishPresentation => Boolean(item));

  if (presentations.length === 0) {
    return {
      ...result,
      riskLabel: diagnosisRiskEnglish[result.riskLevel],
      keyMetrics: result.keyMetrics.map(metric => ({
        label: diagnosisMetricEnglish[metric.label] || metric.label,
        value: getDiagnosisCanonicalValuePresentation(metric.value, true),
      })),
      evidence: result.evidence.map(translateEvidence),
    };
  }

  const actions = uniqueEnglish(presentations.flatMap(item => item.actions)).slice(0, 3);
  const currentActionIndex = Math.max(0, result.actions.indexOf(result.currentAction));
  return {
    ...result,
    riskLabel: diagnosisRiskEnglish[result.riskLevel],
    summary: diagnosisSummaryEnglish[result.summary] || presentations[0].summary,
    currentAction: actions[currentActionIndex] || actions[0] || result.currentAction,
    actions,
    avoidActions: uniqueEnglish(presentations.flatMap(item => item.avoidActions)).slice(0, 3),
    possibleCauses: uniqueEnglish(presentations.flatMap(item => item.possibleCauses)).slice(0, 3),
    observeItems: uniqueEnglish(presentations.flatMap(item => item.observeItems)).slice(0, 3),
    missingInfo: uniqueEnglish(presentations.flatMap(item => item.missingInfo)).slice(0, 3),
    evidence: result.evidence.map(translateEvidence),
    keyMetrics: result.keyMetrics.map(metric => ({
      label: diagnosisMetricEnglish[metric.label] || metric.label,
      value: getDiagnosisCanonicalValuePresentation(metric.value, true),
    })),
  };
};

export const getDiagnosisResultEnglishCoverage = () => ({
  rules: diagnosisRuleEnglish,
  summaries: diagnosisSummaryEnglish,
});
