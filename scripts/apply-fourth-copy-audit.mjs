import { readFileSync, writeFileSync } from 'node:fs';

const edit = (path, transform) => {
  const original = readFileSync(path, 'utf8');
  const next = transform(original);
  if (next !== original) writeFileSync(path, next, 'utf8');
};

const replaceAll = (source, from, to) => source.split(from).join(to);

edit('src/i18n/index.ts', source => {
  const enMarker = source.search(/\n\s*en\s*:\s*\{/);
  if (enMarker < 0) throw new Error('English locale marker not found');
  let zh = source.slice(0, enMarker);
  const en = source.slice(enMarker);

  const replacements = [
    ["welcomeSubtitle: 'AquaGuide 会带你完成第一个小目标，不需要先学完所有养鱼知识。'", "welcomeSubtitle: '选择一个目标开始。'"],
    ["buildSubtitle: '先记录尺寸、水体和设备，后续建议会结合这些条件。'", "buildSubtitle: '记录鱼缸基础信息，获得更准确的建议。'"],
    ["browseTitle: '先浏览适合新手的物种'", "browseTitle: '先看看适合的物种'"],
    ["browseSubtitle: '先看图片和关键养护要求，收藏感兴趣的物种后再慢慢决定。'", "browseSubtitle: '查看物种和主要养护要求。'"],
    ["taskSubtitle: '完成一件就会自动更新，不需要手动领取。'", "taskSubtitle: ''"],
    ["completeTitle: '你已完成起步路线'", "completeTitle: '基础设置已完成'"],
    ["completeSubtitle: '现在可以按今日行动继续养护。'", "completeSubtitle: ''"],
    ["showSteps: '查看全部 4 步'", "showSteps: '查看全部步骤'"],
    ["dismiss: '隐藏新手起步'", "dismiss: '暂时隐藏'"],
    ["syncFailed: '新手引导已保存在本机，云端同步暂时失败。'", "syncFailed: '新手引导已保存在本机。'"],
    ["onboardingHint: '可以重新选择“先建缸”或“先看物种”，不会删除已有记录。'", "onboardingHint: '重新选择首次使用引导。'"],
    ["title: '拍照识别与状态判断'", "title: '拍照识别'"],
    ["subtitle: '先识别候选并由你确认物种，再结合当前鱼缸做风险分诊。结果不是疾病确诊。'", "subtitle: '识别物种后，可继续查看健康风险。'"],
    ["progress: '识别进度'", "progress: ''"],
    ["photoHint: '支持 JPEG、PNG、WebP，最大 10MB。尽量只拍一个主体。'", "photoHint: '请尽量只拍一个主体，图片不超过 10MB。'"],
    ["privacy: '图片只在服务端内存中处理，推理后立即释放，不保存原图或 EXIF。'", "privacy: '图片仅用于本次识别，不保存原图。'"],
    ["recognizingHint: '先生成候选，不会自动认定物种或判断疾病。'", "recognizingHint: '识别后请确认物种。'"],
    ["uploadPreview: '待识别图片预览'", "uploadPreview: '图片预览'"],
    ["confirmHint: '图片相似度只是候选依据。确认后先查看物种结果，再选择下一步。'", "confirmHint: '请选择最符合的物种。'"],
    ["manualFallback: '视觉模型未配置或暂不可用，请使用手动物种搜索继续。'", "manualFallback: '暂时无法识别，可以手动搜索物种。'"],
    ["cloudNotRecorded: '云端未记录，本次未命中仅保留在当前会话。'", "cloudNotRecorded: ''"],
    ["tankContextReady: '已关联“{{name}}”，可以先检查与缸内生物的混养关系。'", "tankContextReady: '当前鱼缸：{{name}}'"],
    ["needTankForCompatibility: '建立或选择鱼缸后，才能结合真实环境做完整混养判断。'", "needTankForCompatibility: '选择鱼缸后可查看混养结果。'"],
    ["startHealthTriage: '它有异常？进入健康分诊'", "startHealthTriage: '发现异常？检查健康状态'"],
    ["healthTriageFishOnly: '健康分诊第一版仅支持鱼类'", "healthTriageFishOnly: '健康判断暂仅支持鱼类'"],
    ["healthTriageTitle: '物种健康分诊'", "healthTriageTitle: '健康状态检查'"],
    ["healthTriageSubtitle: '这是识别后的独立任务：描述异常，最多回答三个关键问题，再查看风险排序。'", "healthTriageSubtitle: '描述异常并回答几个关键问题，查看风险和处理建议。'"],
    ["withTank: '已带入：{{name}}'", "withTank: '当前鱼缸：{{name}}'"],
    ["noTankContext: '尚未选择鱼缸，将只按已知信息判断'", "noTankContext: '未选择鱼缸，结果可能不够准确。'"],
    ["describeHint: '用自己的话描述，例如“不动了”“全缸都在水面喘气”。'", "describeHint: '描述你观察到的异常。'"],
    ["noDiagnosisPromise: '不会直接确诊或自动推荐用药'", "noDiagnosisPromise: '仅提供风险判断，不提供疾病确诊或自动用药建议。'"],
    ["questionCount: '关键问题 {{current}} / 最多 {{total}}'", "questionCount: '问题 {{current}} / {{total}}'"],
    ["supportingEvidence: '支持这个判断'", "supportingEvidence: '判断依据'"],
    ["missingEvidence: '还缺什么信息'", "missingEvidence: '还需要确认'"],
    ["needMoreEvidence: '目前证据不足，需要结合下一项观察。'", "needMoreEvidence: '信息还不够，再确认一项情况。'"],
    ["loadingHint: '国内网络首次打开可能需要几秒'", "loadingHint: ''"],
    ["pageError: '页面加载异常'", "pageError: '页面暂时无法加载'"],
    ["renderError: 'AquaGuide 暂时没有渲染出来'", "renderError: '页面暂时无法显示'"],
    ["renderErrorHint: '页面遇到暂时性问题。可以重试一次，或先返回我的鱼缸继续使用其他功能。'", "renderErrorHint: '请重试，或返回我的鱼缸。'"],
  ];
  for (const [from, to] of replacements) zh = replaceAll(zh, from, to);
  return zh + en;
});

edit('src/pages/Settings.tsx', source => {
  source = source.replace(/\n\s*<p className="mt-1 text-xs font-semibold leading-5 text-slate-400">\{isEn \? 'Share links and privacy controls are being completed\.' : '分享链接与隐私管理正在完善。'\}<\/p>/, '');
  source = replaceAll(source, "{isEn ? 'View details' : '查看说明'}", "{isEn ? 'Learn about feature' : '了解功能'}");
  source = replaceAll(source, "{isEn ? 'Tell us what is difficult or missing. Do not include contact details, aquarium privacy, or diagnosis text.' : '告诉我们哪里难用或希望增加什么。请不要填写联系方式、鱼缸隐私或诊断原文。'}", "{isEn ? 'Tell us what is difficult or what you would like us to add.' : '告诉我们哪里难用，或希望增加什么功能。'}");
  source = replaceAll(source, "setFeedbackError(isEn ? 'Write at least 10 characters so we can understand the issue.' : '请至少写 10 个字，方便我们理解问题。');", "setFeedbackError(isEn ? 'Please enter at least 10 characters.' : '请至少填写 10 个字。');");
  source = source.replace(/\{feedbackDeliveryStatus === 'sent' \? \(isEn \? 'Saved and delivered to the feedback email\.' : '已保存并发送到反馈邮箱。'\) : \(isEn \? 'Saved successfully\. Email delivery is temporarily unavailable\.' : '反馈已保存，邮件暂未送达。'\)\}/g, "{isEn ? 'Feedback submitted.' : '反馈已提交。'}");
  return source;
});
