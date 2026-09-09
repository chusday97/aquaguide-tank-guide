window.AQUA_DEMO = {
  tank: { name: '客厅生态缸', volume: '82 L', water: '淡水', temperature: '25°C', speciesCount: '3 种 · 18 只' },
  species: [
    { id: 'sp_0001', name: '红绿灯', latin: 'Paracheirodon innesi', image: '../assets/neon-tetra.webp', tags: ['淡水', '群游'], facts: ['23–27°C', '60 L+', '中层活动'] },
    { id: 'sp_0002', name: '宝莲灯', latin: 'Paracheirodon axelrodi', image: '../assets/cardinal-tetra.webp', tags: ['淡水', '群游'], facts: ['24–28°C', '60 L+', '中层活动'] },
    { id: 'sp_0041', name: '地图鱼', latin: 'Astronotus ocellatus', image: '../assets/oscar.png', tags: ['大型慈鲷', '领地性'], facts: ['23–28°C', '300 L+', '中下层'] }
  ],
  care: [
    { id: 'water', title: '水体发白或浑浊', summary: '先区分白浊、绿水与悬浮物，再决定处理强度。' },
    { id: 'breath', title: '鱼浮头或呼吸急促', summary: '先确认水流和溶氧，避免直接加药。' },
    { id: 'chase', title: '追咬或领地冲突', summary: '记录持续时间、受影响个体和是否有伤口。' }
  ],
  changelog: [
    { kind: 'feature', title: '混养判断加入分层结果', date: '2026-09-02', major: true },
    { kind: 'bugfix', title: '修复窄屏物种详情被裁切', date: '2026-09-01', major: false },
    { kind: 'data_update', title: '首批物种资料更新', date: '2026-08-30', major: false }
  ]
};
