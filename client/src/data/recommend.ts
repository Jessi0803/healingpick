/**
 * Shared product recommender.
 * Maps signals from Tarot / Ziwei / Treehole to the real 7-product catalogue.
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

// ─── Treehole ────────────────────────────────────────────────────────────────
const MOOD_SIGNAL: Record<string, Signal> = {
  anxious: {
    categories: ['calm', 'protect'],
    keywords: ['焦慮', '不安', '睡', '想太多', '緊張', '靜不下來', '喘息'],
    preferSlugs: ['calm-light', 'glimmer-fox'],
  },
  sad: {
    categories: ['calm', 'wish'],
    keywords: ['難過', '低落', '哭', '想哭', '溫柔', '療癒'],
    preferSlugs: ['calm-light', 'wish-bunny'],
  },
  lonely: {
    categories: ['wish', 'protect'],
    keywords: ['孤單', '寂寞', '一個人', '陪伴', '愛'],
    preferSlugs: ['wish-fox', 'glimmer-fox'],
  },
  angry: {
    categories: ['protect', 'calm'],
    keywords: ['委屈', '生氣', '不公平', '界線', '受傷'],
    preferSlugs: ['glimmer-fox', 'calm-light'],
  },
  confused: {
    categories: ['protect', 'calm'],
    keywords: ['迷茫', '迷惘', '方向', '直覺', '不知道', '猶豫'],
    preferSlugs: ['moonlight-wings', 'calm-light'],
  },
  stressed: {
    categories: ['calm', 'courage'],
    keywords: ['壓力', '加班', '太累', '撐不住', '喘息', '慢下來'],
    preferSlugs: ['calm-light', 'courage-cat'],
  },
  heartbroken: {
    categories: ['wish', 'calm'],
    keywords: ['心碎', '失戀', '分手', '愛', '想念', '溫柔'],
    preferSlugs: ['wish-fox', 'calm-light'],
  },
  lost: {
    categories: ['protect', 'courage'],
    keywords: ['方向', '迷惘', '直覺', '不知道要幹嘛', '勇氣'],
    preferSlugs: ['moonlight-wings', 'courage-cat'],
  },
};

export function recommendForMood(mood: string | null, text: string): Product[] {
  const base = (mood && MOOD_SIGNAL[mood]) || { categories: ['calm', 'protect'], keywords: [] };
  return pickTop(
    { ...base, keywords: [...(base.keywords ?? []), ...extractKeywords(text)] },
    2,
    base.categories?.[0],
  );
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

// ─── Helpers ────────────────────────────────────────────────────────────────
function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Just split on common punctuation; we're matching substrings later.
  return text
    .split(/[\s,、,。.!?！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 8);
}
