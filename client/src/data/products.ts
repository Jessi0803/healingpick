/**
 * SOUL EASE | Mochi．crystal — Product Data
 * Elegant collection of energy crystals and luxury items
 */

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number | null;
  category: string;
  type: 'self' | 'partner';
  chakra: string;
  hz: string;
  element: string;
  origin: string;
  size: string;
  weight: string;
  tag: string | null;
  img: string;
  properties: string[];
  description: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: '薰衣草紫水晶簇',
    subtitle: 'Amethyst Cluster',
    price: 1280,
    originalPrice: 1580,
    category: 'amethyst',
    type: 'self',
    chakra: '頂輪',
    hz: '432Hz',
    element: '風',
    origin: '烏拉圭',
    size: '約 8–12cm',
    weight: '約 200–350g',
    tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['淨化空間能量', '改善睡眠品質', '增強直覺力', '緩解焦慮'],
    description: '烏拉圭天然紫水晶簇，色澤飽滿，晶體清透。紫水晶對應頂輪，能有效淨化空間中的負面能量，同時幫助使用者沉澱思緒、提升靈性感知。適合放置於臥室或冥想空間。',
  },
  {
    id: 2,
    name: '馬達加斯加粉晶球',
    subtitle: 'Rose Quartz Sphere',
    price: 980,
    originalPrice: null,
    category: 'rose',
    type: 'partner',
    chakra: '心輪',
    hz: '528Hz',
    element: '水',
    origin: '馬達加斯加',
    size: '直徑約 5–6cm',
    weight: '約 150–200g',
    tag: '新品',
    img: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=80',
    properties: ['開啟心輪', '吸引愛情', '療癒情傷', '增進人際關係'],
    description: '來自馬達加斯加的天然粉晶球，色澤柔和如玫瑰晨光。粉晶是愛之石，對應心輪，能溫柔地開啟你接受愛的能力，同時療癒過去感情留下的傷痕。',
  },
  {
    id: 3,
    name: '天然黃水晶原礦',
    subtitle: 'Citrine Raw Crystal',
    price: 760,
    originalPrice: null,
    category: 'citrine',
    type: 'partner',
    chakra: '太陽神經叢輪',
    hz: '396Hz',
    element: '火',
    origin: '巴西',
    size: '約 6–10cm',
    weight: '約 100–180g',
    tag: null,
    img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    properties: ['顯化豐盛', '提升自信', '增強行動力', '財富磁場'],
    description: '巴西天然黃水晶原礦，保留最原始的晶體形態。黃水晶被稱為「商人之石」，對應太陽神經叢輪，能激活你的意志力與行動力，幫助顯化財富與成功。',
  },
  {
    id: 4,
    name: '白水晶能量棒',
    subtitle: 'Clear Quartz Wand',
    price: 1580,
    originalPrice: 1980,
    category: 'clear',
    type: 'self',
    chakra: '全脈輪',
    hz: '全頻段',
    element: '光',
    origin: '巴西',
    size: '長約 10–14cm',
    weight: '約 80–120g',
    tag: '精選',
    img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    properties: ['淨化全脈輪', '放大意圖', '增強冥想效果', '萬用療癒'],
    description: '天然白水晶能量棒，晶體清澈透明，內含天然冰裂紋。白水晶是所有水晶中最萬用的療癒石，能放大使用者的意圖，並與任何其他水晶搭配使用，增強整體能量效果。',
  },
  {
    id: 5,
    name: '黑碧璽原礦',
    subtitle: 'Black Tourmaline Raw',
    price: 680,
    originalPrice: null,
    category: 'tourmaline',
    type: 'partner',
    chakra: '根輪',
    hz: '396Hz',
    element: '土',
    origin: '巴西',
    size: '約 5–8cm',
    weight: '約 80–150g',
    tag: null,
    img: 'https://images.unsplash.com/photo-1583341612423-c52b5c4c8d4e?w=600&q=80',
    properties: ['防護負能量', '接地氣', '消除電磁波', '穩定情緒'],
    description: '黑碧璽是最強力的防護石之一，對應根輪，能在你周圍形成能量保護場，阻擋負面能量與電磁波干擾。特別適合情緒敏感、容易受環境影響的人。',
  },
  {
    id: 6,
    name: '月光石橢圓裸石',
    subtitle: 'Moonstone Cabochon',
    price: 1180,
    originalPrice: null,
    category: 'moonstone',
    type: 'partner',
    chakra: '冠輪',
    hz: '528Hz',
    element: '水',
    origin: '斯里蘭卡',
    size: '約 2–3cm',
    weight: '約 10–20g',
    tag: '熱銷',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    properties: ['增強直覺', '平衡情緒', '促進轉變', '女性能量'],
    description: '斯里蘭卡頂級月光石，呈現迷人的藍色螢光（adularescence）。月光石與月亮能量共鳴，能增強直覺力，幫助你在人生轉折點找到方向，特別適合女性佩戴。',
  },
  {
    id: 7,
    name: '青金石圓珠手串',
    subtitle: 'Lapis Lazuli Bracelet',
    price: 880,
    originalPrice: 1080,
    category: 'lapis',
    type: 'self',
    chakra: '喉輪',
    hz: '741Hz',
    element: '風',
    origin: '阿富汗',
    size: '8mm 珠徑',
    weight: '約 200–250g', // Adjusted to match original or correct typical bracelet weight
    tag: '特價',
    img: 'https://images.unsplash.com/photo-1524673450801-b5aa9b621b76?w=600&q=80',
    properties: ['增強溝通力', '提升智慧', '開啟第三眼', '真誠表達'],
    description: '阿富汗天然青金石手串，深邃的藍色中點綴著金色黃鐵礦，如同夜空繁星。青金石對應喉輪，能幫助你更清晰、真誠地表達自我，同時增強智慧與洞察力。',
  },
  {
    id: 8,
    name: '綠幽靈水晶球',
    subtitle: 'Phantom Quartz Sphere',
    price: 2280,
    originalPrice: null,
    category: 'phantom',
    type: 'self',
    chakra: '心輪',
    hz: '528Hz',
    element: '木',
    origin: '巴西',
    size: '直徑約 6–7cm',
    weight: '約 200–280g',
    tag: '限量',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    properties: ['財富顯化', '事業助力', '心輪療癒', '豐盛能量'],
    description: '巴西天然綠幽靈水晶球，內含天然綠色幻影，每一顆都是獨一無二的藝術品。綠幽靈被稱為「財富之石」，能強力吸引財富與事業機遇，同時療癒心輪，帶來豐盛感。',
  },
  {
    id: 9,
    name: '心願九尾狐',
    subtitle: '幻彩靈狐・九尾守護琉璃',
    price: 980,
    originalPrice: 1280,
    category: 'glass',
    type: 'self',
    chakra: '全脈輪',
    hz: '528Hz',
    element: '光',
    origin: '幻彩琉璃工藝',
    size: '高約 5–6cm',
    weight: '約 90–120g',
    tag: '熱銷',
    img: '/shop-3258.jpg',
    properties: ['桃花能量', '愛自己', '好人緣', '願願顯化'],
    description: `在光影流轉之間，收藏一份屬於自己的溫柔能量。

九尾狐自古象徵智慧、魅力、幸運與守護。這款《幻彩靈狐・九尾守護琉璃》以夢幻彩虹琉璃打造，隨著光線變化折射出不同色彩，彷彿將美好的祝福悄悄封存其中。

九條尾巴象徵圓滿與豐盛，也提醒著我們：真正吸引美好事物的開始，不是追逐，而是先看見自己的光。

無論擺放在書桌、床頭櫃、工作空間或療癒角落，都能為日常增添一份溫柔而療癒的儀式感。

─── ♡ 商品特色 ♡ ───
🌈 幻彩琉璃工藝：不同角度呈現迷人的彩虹光澤，每一眼都能發現新的細節與美感。
🦊 九尾狐守護意象：象徵智慧、自信、魅力、好運與願望顯化。
🌷 療癒空間擺飾：為生活空間注入柔和氛圍，成為陪伴日常的小小能量夥伴。
🎀 精緻送禮首選：適合作為生日禮物、紀念禮物，或送給努力生活的自己。

─── ♡ 能量寓意 ♡ ───
🤍 愛自己：把溫柔留給自己，也把愛留給自己。
♡ 桃花能量：願你遇見喜歡的人，也願你成為自己喜歡的樣子。
🌸 好人緣：吸引讓你感到舒服、自在的人事物。
🦋 幸運陪伴：在重要時刻提醒你相信自己、勇敢前進。
☁️ 自我療癒：在忙碌與壓力之中，找回內心的平靜與力量。
🫧 願望顯化：陪伴你專注於想完成的目標與夢想。

─── ♡ 適合這樣的你 ♡ ───
🌷 希望提升自信與個人魅力
🌷 正在期待新的緣分與人際關係
🌷 喜歡療癒系居家擺飾
🌷 想為自己準備一份充滿儀式感的小禮禮物
🌷 相信美好能量與內在成長

─── ♡ HealingPick 想對你說 ♡ ───
「你不需要變成別人喜歡的樣子。九尾狐的能量，不是追逐愛，而是找回自己的光。當你開始喜歡自己，適合的人、關係與機會，也會慢慢被吸引而來。願這隻幻彩靈狐陪伴你，在每一次迷惘與期待之間，依然相信自己的美好。」`,
  },
];
