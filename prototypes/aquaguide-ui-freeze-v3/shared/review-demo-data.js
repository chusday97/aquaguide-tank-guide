const species = [
  { id: 'cardinal', base: '宝莲灯', name: '宝莲灯标准款', latin: 'Paracheirodon axelrodi', image: '../assets/cardinal-tetra.png', layer: '中层', tags: ['群游', '淡水'] },
  { id: 'cardinal-red', base: '宝莲灯', name: '宝莲灯红线', latin: 'Paracheirodon axelrodi var.', image: '../assets/cardinal-tetra.webp', layer: '中层', tags: ['群游', '小型'] },
  { id: 'neon', base: '霓虹灯', name: '霓虹灯标准款', latin: 'Paracheirodon innesi', image: '../assets/neon-tetra.png', layer: '中层', tags: ['群游', '小型'] },
  { id: 'oscar', base: '虎鱼', name: '虎鱼标准款', latin: 'Astronotus ocellatus', image: '../assets/oscar.png', layer: '底层', tags: ['大型', '领地'] },
];

const careTopics = {
  water: [
    { id: 'water-cloudy', title: '水体变浑', summary: '先确认过滤与最近一次换水，再观察是否持续。', image: '../assets/water-care.webp', urgency: '观察' },
    { id: 'water-temp', title: '温度波动', summary: '检查加热设备和昼夜温差，避免突然调整。', image: '../assets/acclimation.webp', urgency: '优先' },
  ],
  livestock: [
    { id: 'fish-surface', title: '频繁浮到水面', summary: '记录发生时间、呼吸状态和同缸生物反应。', image: '../assets/water-care.webp', urgency: '优先' },
    { id: 'fish-appetite', title: '突然不进食', summary: '先减少干扰，核对水质与最近的饲喂变化。', image: '../assets/acclimation.webp', urgency: '观察' },
    { id: 'fish-new', title: '新生物入缸', summary: '完成隔离、适应和前24小时观察记录。', image: '../assets/cardinal-tetra.webp', urgency: '计划' },
  ],
  filter: [
    { id: 'filter-flow', title: '水流变弱', summary: '查看进水口、滤材和泵体，先不要一次性更换全部滤材。', image: '../assets/water-care.webp', urgency: '优先' },
  ],
};

window.ReviewDemoData = { species, careTopics };
