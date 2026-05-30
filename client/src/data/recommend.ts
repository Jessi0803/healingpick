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
  romance: {
    categories: ['wish', 'protect'],
    keywords: ['喜歡', '曖昧', '桃花', '感情', '關係發展', '緣分', '魅力'],
    preferSlugs: ['wish-fox', 'wish-bunny'],
  },
  reconciliation: {
    categories: ['wish', 'calm'],
    keywords: ['前任', '復合', '冷戰', '修復', '放不下', '和好', '關係'],
    preferSlugs: ['wish-bunny', 'calm-light'],
  },
  careerChoice: {
    categories: ['courage', 'protect'],
    keywords: ['換工作', '職涯', '升遷', '方向', '卡住', '選擇'],
    preferSlugs: ['courage-cat', 'moonlight-wings'],
  },
  moneyOpportunity: {
    categories: ['wealth', 'courage'],
    keywords: ['投資', '接案', '收入', '金錢', '財務', '機會', '決策'],
    preferSlugs: ['wealth-stone', 'courage-cat'],
  },
  issueClarity: {
    categories: ['protect', 'calm'],
    keywords: ['釐清', '問題', '原因', '卡住', '困境', '不知道', '壓力'],
    preferSlugs: ['glimmer-fox', 'calm-light'],
  },
  choice: {
    categories: ['courage', 'protect'],
    keywords: ['選項', '抉擇', '選擇', '決定', '要不要', '比較'],
    preferSlugs: ['courage-cat', 'moonlight-wings'],
  },
  boundaries: {
    categories: ['protect', 'calm'],
    keywords: ['同事', '朋友', '家人', '界線', '拒絕', '被消耗', '壓力'],
    preferSlugs: ['glimmer-fox', 'moonlight-wings'],
  },
  emotions: {
    categories: ['calm', 'wish'],
    keywords: ['焦慮', '低潮', '情緒', '整理', '難過', '找回自己'],
    preferSlugs: ['calm-light', 'wish-bunny'],
  },
};

export function recommendForTarot(questionType: string, question: string): Product[] {
  const base = TAROT_SIGNAL[questionType] || TAROT_SIGNAL.issueClarity;
  return pickTop(
    { ...base, keywords: [...(base.keywords ?? []), ...extractKeywords(question)] },
    2,
    base.categories?.[0],
  );
}

// ─── Ziwei ──────────────────────────────────────────────────────────────────
// 12 宮位 → 對應商品方向
const PALACE_SIGNAL: Record<string, Signal> = {
  命宮: { categories: ['protect', 'calm'], preferSlugs: ['glimmer-fox', 'calm-light'] },
  福德宮: { categories: ['calm', 'wish'], preferSlugs: ['calm-light', 'wish-bunny'] },
  財帛宮: { categories: ['wealth', 'courage'], preferSlugs: ['wealth-stone', 'courage-cat'] },
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
