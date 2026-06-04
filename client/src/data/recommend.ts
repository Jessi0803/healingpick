/**
 * Shared product recommender.
 * Maps signals from Tarot / Ziwei to the real 7-product catalogue.
 *
 * Scoring:
 *  - direct category match  → +5
 *  - keyword hit anywhere in name/tagline/meanings/suitedFor/story → +2 per hit
 *  - tie-break by stable order in PRODUCTS
 */

import { PRODUCTS, type Product } from './products';

export type RecommendationCategory = 'protect' | 'wish' | 'courage' | 'calm' | 'wealth';

type Signal = {
  categories?: string[];
  keywords?: string[];
  preferSlugs?: string[];
};

function scoreProduct(p: Product, sig: Signal): number {
  let score = 0;
  if (sig.preferSlugs?.includes(p.slug)) score += 100;
  if (sig.categories?.includes(p.category)) score += 5;

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

function pickTop(sig: Signal, limit: number, fallbackCategory?: string): Product[] {
  const ranked = PRODUCTS
    .map((p) => ({ p, score: scoreProduct(p, sig) }))
    .sort((a, b) => b.score - a.score);

  const picks: Product[] = [];
  for (const r of ranked) {
    if (r.score <= 0) break;
    picks.push(r.p);
    if (picks.length >= limit) break;
  }

  if (picks.length < limit && fallbackCategory) {
    for (const p of PRODUCTS) {
      if (picks.find((x) => x.slug === p.slug)) continue;
      if (p.category === fallbackCategory) {
        picks.push(p);
        if (picks.length >= limit) break;
      }
    }
  }

  if (picks.length === 0) picks.push(PRODUCTS[0]);
  return picks;
}


// ─── Tarot ──────────────────────────────────────────────────────────────────
const TAROT_SIGNAL: Record<string, Signal> = {
  love: {
    categories: ['wish', 'protect'],
    keywords: ['桃花', '愛', '感情', '人緣', '緣分', '魅力'],
    preferSlugs: ['wish-fox', 'wish-bunny'],
  },
  career: {
    categories: ['wealth', 'courage'],
    keywords: ['工作', '事業', '錢', '財富', '機會', '行動', '升職', '創業'],
    preferSlugs: ['wealth-stone', 'courage-cat'],
  },
  wealth: {
    categories: ['wealth', 'courage'],
    keywords: ['財運', '金錢', '收入', '投資', '副業', '安全感', '豐盛'],
    preferSlugs: ['wealth-stone', 'courage-cat'],
  },
  growth: {
    categories: ['calm', 'protect'],
    keywords: ['自我', '成長', '情緒', '照顧', '釐清', '低潮', '節奏'],
    preferSlugs: ['calm-light', 'moonlight-wings'],
  },
  other: {
    categories: ['protect', 'calm'],
    keywords: ['問題', '狀況', '選擇', '方向', '看清楚', '面對', '下一步'],
    preferSlugs: ['moonlight-wings', 'calm-light'],
  },
  clarity: {
    categories: ['protect', 'calm'],
    keywords: ['迷惘', '方向', '直覺', '清晰', '困惑'],
    preferSlugs: ['moonlight-wings', 'calm-light'],
  },
  protection: {
    categories: ['protect', 'calm'],
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
    2,
    base.categories?.[0],
  );
}

export function recommendForCategory(category: string, limit = 2): Product[] {
  return pickTop({ categories: [category] }, limit, category);
}

// ─── Ziwei ──────────────────────────────────────────────────────────────────
// 12 宮位 → 對應商品方向
const PALACE_SIGNAL: Record<string, Signal> = {
  命宮: { categories: ['protect', 'calm'], preferSlugs: ['glimmer-fox', 'calm-light'] },
  福德宮: { categories: ['calm', 'wish'], preferSlugs: ['calm-light', 'wish-bunny'] },
  財帛宮: { categories: ['wealth'], preferSlugs: ['wealth-stone'] },
  田宅宮: { categories: ['wealth', 'protect'], preferSlugs: ['wealth-stone', 'glimmer-fox'] },
  官祿宮: { categories: ['wealth', 'courage'], preferSlugs: ['wealth-stone', 'courage-cat'] },
  事業宮: { categories: ['wealth', 'courage'], preferSlugs: ['wealth-stone', 'courage-cat'] },
  夫妻宮: { categories: ['wish'], preferSlugs: ['wish-fox', 'wish-bunny'] },
  子女宮: { categories: ['wish', 'protect'], preferSlugs: ['wish-bunny', 'glimmer-fox'] },
  兄弟宮: { categories: ['wish', 'protect'], preferSlugs: ['wish-fox', 'glimmer-fox'] },
  遷移宮: { categories: ['courage', 'protect'], preferSlugs: ['courage-cat', 'moonlight-wings'] },
  疾厄宮: { categories: ['calm', 'protect'], preferSlugs: ['calm-light', 'glimmer-fox'] },
  父母宮: { categories: ['wish', 'protect'], preferSlugs: ['wish-bunny', 'glimmer-fox'] },
  交友宮: { categories: ['wish'], preferSlugs: ['wish-fox', 'wish-bunny'] },
  僕役宮: { categories: ['wish'], preferSlugs: ['wish-fox', 'wish-bunny'] },
};

export function recommendForZiwei(palaceName: string | null, gender?: string): Product[] {
  if (palaceName && PALACE_SIGNAL[palaceName]) {
    return pickTop(PALACE_SIGNAL[palaceName], 2);
  }
  // No palace selected — fall back to a gender-flavoured pick that feels human.
  if (gender === '女') {
    return pickTop(
      { categories: ['wish', 'calm'], preferSlugs: ['wish-fox', 'calm-light'] },
      2,
    );
  }
  return pickTop(
    { categories: ['courage', 'wealth'], preferSlugs: ['courage-cat', 'wealth-stone'] },
    2,
  );
}

// ─── Fortune ────────────────────────────────────────────────────────────────
// 四象元素 → 商品方向
const ELEMENT_SIGNAL: Record<string, Signal> = {
  火: { categories: ['courage', 'wealth'], preferSlugs: ['courage-cat', 'wealth-stone'] },
  土: { categories: ['protect', 'calm'],   preferSlugs: ['glimmer-fox', 'calm-light'] },
  風: { categories: ['wish', 'protect'],   preferSlugs: ['moonlight-wings', 'wish-fox'] },
  水: { categories: ['wish', 'calm'],      preferSlugs: ['wish-bunny', 'calm-light'] },
};

export function recommendForFortune(element: string): Product[] {
  const sig = ELEMENT_SIGNAL[element] ?? ELEMENT_SIGNAL['土'];
  return pickTop(sig, 2);
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
