/**
 * iztro 繁體中文翻譯對照表
 * iztro 回傳的是英文 key，需要手動翻譯成繁體中文
 */

// 宮位名稱
export const PALACE_NAMES: Record<string, string> = {
  soulPalace: '命宮',
  bodyPalace: '身宮',
  siblingsPalace: '兄弟',
  spousePalace: '夫妻',
  childrenPalace: '子女',
  wealthPalace: '財帛',
  healthPalace: '疾厄',
  surfacePalace: '遷移',
  friendsPalace: '僕役',
  careerPalace: '官祿',
  propertyPalace: '田宅',
  spiritPalace: '福德',
  parentsPalace: '父母',
  originalPalace: '來因',
};

// 天干
export const HEAVENLY_STEMS: Record<string, string> = {
  jiaHeavenly: '甲',
  yiHeavenly: '乙',
  bingHeavenly: '丙',
  dingHeavenly: '丁',
  wuHeavenly: '戊',
  jiHeavenly: '己',
  gengHeavenly: '庚',
  xinHeavenly: '辛',
  renHeavenly: '壬',
  guiHeavenly: '癸',
};

// 地支
export const EARTHLY_BRANCHES: Record<string, string> = {
  ziEarthly: '子',
  chouEarthly: '丑',
  yinEarthly: '寅',
  maoEarthly: '卯',
  chenEarthly: '辰',
  siEarthly: '巳',
  wuEarthly: '午',
  weiEarthly: '未',
  shenEarthly: '申',
  youEarthly: '酉',
  xuEarthly: '戌',
  haiEarthly: '亥',
};

// 生肖
export const ZODIAC: Record<string, string> = {
  rat: '鼠',
  ox: '牛',
  tiger: '虎',
  rabbit: '兔',
  dragon: '龍',
  snake: '蛇',
  horse: '馬',
  sheep: '羊',
  monkey: '猴',
  rooster: '雞',
  dog: '狗',
  pig: '豬',
};

// 星座
export const SIGNS: Record<string, string> = {
  aries: '白羊座',
  taurus: '金牛座',
  gemini: '雙子座',
  cancer: '巨蟹座',
  leo: '獅子座',
  virgo: '處女座',
  libra: '天秤座',
  scorpio: '天蠍座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  aquarius: '水瓶座',
  pisces: '雙魚座',
};

// 時辰
export const TIME_NAMES: Record<string, string> = {
  earlyRatHour: '早子時',
  oxHour: '丑時',
  tigerHour: '寅時',
  rabbitHour: '卯時',
  dragonHour: '辰時',
  snakeHour: '巳時',
  horseHour: '午時',
  goatHour: '未時',
  monkeyHour: '申時',
  roosterHour: '酉時',
  dogHour: '戌時',
  pigHour: '亥時',
  lateRatHour: '晚子時',
};

// 五行局
export const FIVE_ELEMENTS: Record<string, string> = {
  water2nd: '水二局',
  wood3rd: '木三局',
  metal4th: '金四局',
  earth5th: '土五局',
  fire6th: '火六局',
};

// 亮度
export const BRIGHTNESS: Record<string, string> = {
  miao: '廟',
  wang: '旺',
  de: '得',
  li: '利',
  ping: '平',
  bu: '不',
  xian: '陷',
};

// 四化
export const MUTAGEN: Record<string, string> = {
  sihuaLu: '祿',
  sihuaQuan: '權',
  sihuaKe: '科',
  sihuaJi: '忌',
};

// 長生十二神
export const CHANGSHENG12: Record<string, string> = {
  changsheng: '長生',
  muyu: '沐浴',
  guandai: '冠帶',
  linguan: '臨官',
  diwang: '帝旺',
  shuai: '衰',
  bing: '病',
  si: '死',
  mu: '墓',
  jue: '絕',
  tai: '胎',
  yang: '養',
};

// 主星名稱
export const MAJOR_STARS: Record<string, string> = {
  ziweiMaj: '紫微',
  tianjiMaj: '天機',
  taiyangMaj: '太陽',
  wuquMaj: '武曲',
  tiantongMaj: '天同',
  lianzhenMaj: '廉貞',
  tianfuMaj: '天府',
  taiyinMaj: '太陰',
  tanlangMaj: '貪狼',
  jumenMaj: '巨門',
  tianxiangMaj: '天相',
  tianliangMaj: '天梁',
  qishaMaj: '七殺',
  pojunMaj: '破軍',
};

// 輔星名稱
export const MINOR_STARS: Record<string, string> = {
  zuofuMin: '左輔',
  youbiMin: '右弼',
  wenchangMin: '文昌',
  wenquMin: '文曲',
  lucunMin: '祿存',
  tianmaMin: '天馬',
  qingyangMin: '擎羊',
  tuoluoMin: '陀羅',
  huoxingMin: '火星',
  lingxingMin: '鈴星',
  tiankuiMin: '天魁',
  tianyueMin: '天鉞',
  dikongMin: '地空',
  dijieMin: '地劫',
};

// 雜曜名稱
export const ADJECTIVE_STARS: Record<string, string> = {
  jieshaAdj: '劫殺',
  tiankong: '天空',
  tianxing: '天刑',
  tianyao: '天姚',
  jieshen: '解神',
  yinsha: '陰煞',
  tianxi: '天喜',
  tianguan: '天官',
  tianfu: '天福',
  tianku: '天哭',
  tianxu: '天虛',
  longchi: '龍池',
  fengge: '鳳閣',
  hongluan: '紅鸞',
  guchen: '孤辰',
  guasu: '寡宿',
  feilian: '蜚廉',
  posui: '破碎',
  taifu: '台輔',
  fenggao: '封誥',
  tianwu: '天巫',
  tianyue: '天月',
  santai: '三台',
  bazuo: '八座',
  engguang: '恩光',
  tiangui: '天貴',
  tiancai: '天才',
  tianshou: '天壽',
  jiekong: '截空',
  xunkong: '旬空',
  tianshang: '天傷',
  tianzhi: '天使',
  boshi: '博士',
  lishi: '力士',
  qinglong: '青龍',
  xiaohao: '小耗',
  jiangjun: '將軍',
  zhoushu: '奏書',
  feilianStar: '蜚廉',
  xishen: '喜神',
  bingfu: '病符',
  dahao: '大耗',
  fubing: '伏兵',
  guanfu: '官府',
  suijian: '歲建',
  huiqi: '晦氣',
  sangmen: '喪門',
  guansuo: '貫索',
  guanfu2: '官符',
  xiaohao2: '小耗',
  dahao2: '大耗',
  longshen: '龍德',
  baihu: '白虎',
  tiandestar: '天德',
  diaokestar: '弔客',
  shengqi: '生氣',
  poli: '破裂',
  changshengstar: '長生',
  muyustar: '沐浴',
  guandaistar: '冠帶',
  linguanstar: '臨官',
  diwangstar: '帝旺',
  shuaistar: '衰',
  bingstar: '病',
  sistar: '死',
  mustar: '墓',
  juestar: '絕',
  taistar: '胎',
  yangstar: '養',
};

// 命主/身主（主星名稱）
export const ALL_STARS: Record<string, string> = {
  ...MAJOR_STARS,
  ...MINOR_STARS,
  ...ADJECTIVE_STARS,
};

// 四柱翻譯（天干地支組合）
export function translateChineseDate(chineseDate: string): string {
  let result = chineseDate;
  // 替換天干
  for (const [key, val] of Object.entries(HEAVENLY_STEMS)) {
    result = result.replace(new RegExp(key, 'g'), val);
  }
  // 替換地支
  for (const [key, val] of Object.entries(EARTHLY_BRANCHES)) {
    result = result.replace(new RegExp(key, 'g'), val);
  }
  // 移除多餘空格，統一格式
  result = result.replace(/\s*-\s*/g, ' ');
  return result;
}

// 通用翻譯函數
export function t(key: string): string {
  return (
    PALACE_NAMES[key] ??
    HEAVENLY_STEMS[key] ??
    EARTHLY_BRANCHES[key] ??
    ZODIAC[key] ??
    SIGNS[key] ??
    TIME_NAMES[key] ??
    FIVE_ELEMENTS[key] ??
    BRIGHTNESS[key] ??
    MUTAGEN[key] ??
    CHANGSHENG12[key] ??
    ALL_STARS[key] ??
    key // 找不到就回傳原始值
  );
}
