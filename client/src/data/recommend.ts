/**
 * Shared product recommender.
 * Maps signals from Tarot / Ziwei to the real 7-product catalogue.
 *
 * Scoring:
 *  - direct category match  → +5
 *  - keyword hit anywhere in name/tagline/meanings/suitedFor/story → +2 per hit
 *  - tie-break by stable order in PRODUCTS
 */

import { PRODUCTS, getProductCategories, type Product } from './products';

export type RecommendationCategory =
  | 'protect'
  | 'love'
  | 'career'
  | 'wealth'
  | 'healing'
  | 'sleep'
  | 'courage';

type Signal = {
  categories?: string[];
  keywords?: string[];
  preferSlugs?: string[];
};

function scoreProduct(p: Product, sig: Signal): number {
  let score = 0;
  if (sig.preferSlugs?.includes(p.slug)) score += 100;
  if (sig.categories?.includes(p.category)) score += 5;
  if (
    sig.categories?.some(
      (category) => category !== p.category && getProductCategories(p).includes(category),
    )
  ) {
    score += 3;
  }

  const haystack = [
    p.name,
    p.subtitle,
    p.tagline,
    p.material,
    p.story ?? '',
    p.closing,
    ...p.suitedFor,
    ...p.meanings.map((m) => `${m.title} ${m.desc}`),
    ...p.features.map((m) => `${m.title} ${m.desc}`),
  ]
    .join(' ')
    .toLowerCase();

  sig.keywords?.forEach((kw) => {
    if (kw && haystack.includes(kw.toLowerCase())) score += 2;
  });

  return score;
}

// 手鍊優先：擺飾/擺件/礦柱等展示品排在手鍊之後。
function isBracelet(p: Product): boolean {
  if (/柱|礦$/.test(p.name)) return false;
  const text = [
    p.name,
    ...p.suitedFor,
    ...p.features.flatMap((f) => [f.title, f.desc]),
    ...p.meanings.flatMap((m) => [m.title, m.desc]),
  ].join(' ');
  return !['擺飾', '擺件', '擺設'].some((hint) => text.includes(hint));
}

// 有相關性的手鍊額外加權，讓主推優先落在手鍊上。
const BRACELET_BONUS = 100;

function pickTop(sig: Signal, limit: number, fallbackCategory?: string): Product[] {
  const ranked = PRODUCTS
    .map((p) => {
      const base = scoreProduct(p, sig);
      const score = base > 0 && isBracelet(p) ? base + BRACELET_BONUS : base;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);

  const picks: Product[] = [];
  for (const r of ranked) {
    if (r.score <= 0) break;
    picks.push(r.p);
    if (picks.length >= limit) break;
  }

  if (picks.length < limit && fallbackCategory) {
    const rest = PRODUCTS
      .filter(
        (p) => !picks.some((x) => x.slug === p.slug) && getProductCategories(p).includes(fallbackCategory),
      )
      .sort((a, b) => (isBracelet(b) ? 1 : 0) - (isBracelet(a) ? 1 : 0));
    for (const p of rest) {
      picks.push(p);
      if (picks.length >= limit) break;
    }
  }

  if (picks.length === 0) picks.push(PRODUCTS.find(isBracelet) ?? PRODUCTS[0]);
  return picks;
}


// ─── Tarot ──────────────────────────────────────────────────────────────────
const TAROT_SIGNAL: Record<string, Signal> = {
  love: {
    categories: ['love', 'protect'],
    keywords: ['桃花', '愛', '感情', '人緣', '緣分', '魅力'],
    preferSlugs: ['wish-fox', 'wish-bunny'],
  },
  career: {
    categories: ['career', 'courage'],
    keywords: ['工作', '事業', '錢', '財富', '機會', '行動', '升職', '創業'],
    preferSlugs: ['forest-bloom', 'courage-cat'],
  },
  wealth: {
    categories: ['wealth', 'courage'],
    keywords: ['財運', '金錢', '收入', '投資', '副業', '安全感', '豐盛'],
    preferSlugs: ['wealth-stone', 'courage-cat'],
  },
  growth: {
    categories: ['healing', 'sleep'],
    keywords: ['自我', '成長', '情緒', '照顧', '釐清', '低潮', '節奏'],
    preferSlugs: ['xin-yu-ni-nan', 'calm-light'],
  },
  other: {
    categories: ['protect', 'sleep'],
    keywords: ['問題', '狀況', '選擇', '方向', '看清楚', '面對', '下一步'],
    preferSlugs: ['moonlight-wings', 'calm-light'],
  },
  clarity: {
    categories: ['protect', 'sleep'],
    keywords: ['迷惘', '方向', '直覺', '清晰', '困惑'],
    preferSlugs: ['moonlight-wings', 'calm-light'],
  },
  protection: {
    categories: ['protect', 'sleep'],
    keywords: ['守護', '保護', '安全感', '安定', '界線'],
    preferSlugs: ['glimmer-fox', 'calm-light'],
  },
  change: {
    categories: ['courage', 'protect'],
    keywords: ['改變', '轉變', '勇氣', '新開始', '行動'],
    preferSlugs: ['courage-cat', 'moonlight-wings'],
  },
};

export function recommendForTarot(questionType: string, question: string): Product[] {
  const base = TAROT_SIGNAL[questionType] || TAROT_SIGNAL.clarity;
  return pickTop(
    { ...base, keywords: [...(base.keywords ?? []), ...extractKeywords(question)] },
    5,
    base.categories?.[0],
  );
}

export function recommendForCategory(category: string, limit = 5): Product[] {
  return pickTop({ categories: [category] }, limit, category);
}

// ─── Ziwei ──────────────────────────────────────────────────────────────────
// 12 宮位 → 對應商品方向
const PALACE_SIGNAL: Record<string, Signal> = {
  命宮: { categories: ['protect', 'sleep'], preferSlugs: ['glimmer-fox', 'calm-light'] },
  福德宮: { categories: ['sleep', 'healing'], preferSlugs: ['calm-light', 'wish-bunny'] },
  財帛宮: { categories: ['wealth'], preferSlugs: ['wealth-stone'] },
  田宅宮: { categories: ['wealth', 'protect'], preferSlugs: ['wealth-stone', 'glimmer-fox'] },
  官祿宮: { categories: ['career', 'courage'], preferSlugs: ['forest-bloom', 'courage-cat'] },
  事業宮: { categories: ['career', 'courage'], preferSlugs: ['forest-bloom', 'courage-cat'] },
  夫妻宮: { categories: ['love'], preferSlugs: ['wish-fox', 'misty-starlight'] },
  子女宮: { categories: ['healing', 'protect'], preferSlugs: ['wish-bunny', 'glimmer-fox'] },
  兄弟宮: { categories: ['love', 'protect'], preferSlugs: ['wish-fox', 'glimmer-fox'] },
  遷移宮: { categories: ['courage', 'protect'], preferSlugs: ['courage-cat', 'moonlight-wings'] },
  疾厄宮: { categories: ['healing', 'sleep'], preferSlugs: ['xin-yu-ni-nan', 'calm-light'] },
  父母宮: { categories: ['healing', 'protect'], preferSlugs: ['wish-bunny', 'glimmer-fox'] },
  交友宮: { categories: ['love'], preferSlugs: ['wish-fox', 'misty-starlight'] },
  僕役宮: { categories: ['love'], preferSlugs: ['wish-fox', 'misty-starlight'] },
};

export function recommendForZiwei(palaceName: string | null, gender?: string): Product[] {
  if (palaceName && PALACE_SIGNAL[palaceName]) {
    return pickTop(PALACE_SIGNAL[palaceName], 5);
  }
  // No palace selected — fall back to a gender-flavoured pick that feels human.
  if (gender === '女') {
    return pickTop(
      { categories: ['love', 'sleep'], preferSlugs: ['wish-fox', 'calm-light'] },
      5,
    );
  }
  return pickTop(
    { categories: ['courage', 'career'], preferSlugs: ['courage-cat', 'forest-bloom'] },
    5,
  );
}

// ─── Fortune ────────────────────────────────────────────────────────────────
// 四象元素 → 商品方向
const ELEMENT_SIGNAL: Record<string, Signal> = {
  火: { categories: ['courage', 'wealth'], preferSlugs: ['courage-cat', 'wealth-stone'] },
  土: { categories: ['protect', 'sleep'],  preferSlugs: ['glimmer-fox', 'calm-light'] },
  風: { categories: ['love', 'protect'],   preferSlugs: ['moonlight-wings', 'wish-fox'] },
  水: { categories: ['healing', 'sleep'],  preferSlugs: ['wish-bunny', 'calm-light'] },
};

export function recommendForFortune(element: string): Product[] {
  const sig = ELEMENT_SIGNAL[element] ?? ELEMENT_SIGNAL['土'];
  return pickTop(sig, 5);
}

// ─── Dream ──────────────────────────────────────────────────────────────────
// 常見夢境訊號 → 既有商品方向
const DREAM_SIGNALS: Array<{ patterns: string[]; signal: Signal }> = [
  {
    patterns: ['追', '逃', '躲', '跑不動', '被抓', '攻擊', '怪物', '鬼', '黑影', '害怕', '恐怖'],
    signal: {
      categories: ['protect', 'sleep'],
      keywords: ['安全感', '界線', '安定', '焦慮', '保護', '壓力'],
      preferSlugs: ['glimmer-fox', 'calm-light'],
    },
  },
  {
    patterns: ['迷路', '出口', '門', '走廊', '電梯', '樓梯', '找不到', '困住', '房子', '學校'],
    signal: {
      categories: ['protect', 'sleep'],
      keywords: ['方向', '直覺', '釐清', '迷惘', '選擇', '自我探索'],
      preferSlugs: ['moonlight-wings', 'calm-light'],
    },
  },
  {
    patterns: ['牙齒', '掉牙', '流血', '裸', '考試', '遲到', '失控', '跌倒', '墜落', '掉下去'],
    signal: {
      categories: ['sleep', 'courage'],
      keywords: ['焦慮', '自信', '穩定情緒', '壓力', '相信自己'],
      preferSlugs: ['calm-light', 'courage-cat'],
    },
  },
  {
    patterns: ['前任', '喜歡的人', '戀人', '分手', '曖昧', '結婚', '朋友', '家人', '媽媽', '爸爸', '吵架'],
    signal: {
      categories: ['love', 'protect'],
      keywords: ['關係', '人緣', '愛', '緣分', '陪伴', '溫柔連結'],
      preferSlugs: ['wish-fox', 'wish-bunny'],
    },
  },
  {
    patterns: ['工作', '公司', '老闆', '同事', '錢', '賺錢', '財', '店', '客人', '創業', '面試'],
    signal: {
      categories: ['career', 'wealth'],
      keywords: ['工作', '金錢', '事業', '機會', '行動力', '自我價值'],
      preferSlugs: ['wealth-stone', 'courage-cat'],
    },
  },
  {
    patterns: ['水', '海', '河', '下雨', '淹水', '游泳', '浴室', '洗澡', '哭', '眼淚'],
    signal: {
      categories: ['sleep', 'healing'],
      keywords: ['情緒', '釋放', '平靜', '自我療癒', '照顧'],
      preferSlugs: ['calm-light', 'wish-bunny'],
    },
  },
  {
    patterns: ['飛', '翅膀', '天空', '月亮', '星星', '旅行', '搬家', '車', '火車', '飛機'],
    signal: {
      categories: ['courage', 'protect'],
      keywords: ['方向', '新開始', '勇氣', '希望', '直覺', '前進'],
      preferSlugs: ['moonlight-wings', 'courage-cat'],
    },
  },
];

export function recommendForDream(dreamContent: string, interpretation = ''): Product[] {
  const text = `${dreamContent} ${interpretation}`.toLowerCase();
  const merged: Signal = { categories: [], keywords: [], preferSlugs: [] };

  DREAM_SIGNALS.forEach(({ patterns, signal }) => {
    if (!patterns.some((pattern) => text.includes(pattern.toLowerCase()))) return;
    merged.categories?.push(...(signal.categories ?? []));
    merged.keywords?.push(...(signal.keywords ?? []));
    merged.preferSlugs?.push(...(signal.preferSlugs ?? []));
  });

  if (!merged.categories?.length && !merged.keywords?.length && !merged.preferSlugs?.length) {
    return pickTop(
      {
        categories: ['sleep', 'protect'],
        keywords: [...extractKeywords(dreamContent), ...extractKeywords(interpretation)],
        preferSlugs: ['calm-light', 'moonlight-wings'],
      },
      5,
      'sleep',
    );
  }

  return pickTop(
    {
      categories: [...new Set(merged.categories)],
      keywords: [...new Set([...(merged.keywords ?? []), ...extractKeywords(dreamContent), ...extractKeywords(interpretation)])],
      preferSlugs: [...new Set(merged.preferSlugs)],
    },
    5,
    merged.categories?.[0],
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Just split on common punctuation; we're matching substrings later.
  return text
    .split(/[\s,、,。.!?！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 8);
}
