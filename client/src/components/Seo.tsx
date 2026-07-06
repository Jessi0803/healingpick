import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { findProduct } from '@/data/products';

const SITE_URL = 'https://healingpick.com';
const SITE_NAME = 'HealingPick 癒見好物';
const DEFAULT_DESCRIPTION = '有些心事，可以先放進 Mochi 小宇宙。塔羅占卜、紫微斗數、Mochi 解夢、每日運勢、心靈療癒與能量水晶。';

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  '/tarot': {
    title: `塔羅牌占卜｜${SITE_NAME}`,
    description: '線上抽塔羅牌，透過五牌陣看見感情、工作、人際與內在狀態，得到溫柔但具體的行動提醒。',
  },
  '/ziwei': {
    title: `紫微斗數命盤｜${SITE_NAME}`,
    description: '輸入出生日期與時辰，查看紫微斗數命盤解析，理解自己的個性、優勢、關係與當下適合的方向。',
  },
  '/dream': {
    title: `Mochi 解夢｜${SITE_NAME}`,
    description: '寫下夢境與醒來後的感覺，讓 Mochi 用本站塔羅與紫微的口語解讀風格，陪你看見夢裡的情緒訊號。',
  },
  '/fortune': {
    title: `每日運勢｜${SITE_NAME}`,
    description: '查看今日星座運勢，包含整體能量、感情、工作、財運與今日提醒，陪你整理一天的節奏。',
  },
  '/fortune/daily': {
    title: `每日運勢｜${SITE_NAME}`,
    description: '查看今日星座運勢，包含整體能量、感情、工作、財運與今日提醒，陪你整理一天的節奏。',
  },
  '/quiz': {
    title: `心理測驗｜${SITE_NAME}`,
    description: '用輕鬆的心理測驗看見你的靈魂香氣、心情天氣、壓力模式與專屬能量水晶推薦。',
  },
  '/shop': {
    title: `能量商品｜${SITE_NAME}`,
    description: '挑選水晶、療癒擺飾與能量小物，為生活放進一份安定、守護與儀式感。',
  },
  '/shop/custom-bracelet/general': {
    title: `一般客製化手鍊｜${SITE_NAME}`,
    description: '依照需求、手圍、色系與喜歡的能量客製專屬水晶手鍊，提供顧客回饋實拍圖與客製化需求表單。',
  },
  '/shop/custom-bracelet/numerology': {
    title: `生命靈數客製化手鍊｜${SITE_NAME}`,
    description: '以出生年月日整理生命靈數能量方向，結合近期需求、手圍、色系與偏好客製專屬水晶手鍊。',
  },
  '/about': {
    title: `關於我們｜${SITE_NAME}`,
    description: '認識 HealingPick 癒見好物，一個結合塔羅、紫微、Mochi 解夢、每日運勢、心理測驗與療癒選物的平台。',
  },
  '/buy': {
    title: `購買點數｜${SITE_NAME}`,
    description: '購買 HealingPick 點數，繼續使用塔羅、紫微、Mochi 解夢與每日運勢等療癒解讀服務。',
  },
};

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

function getMeta(pathname: string) {
  const normalizedPath = pathname === '' ? '/' : pathname;
  const productMatch = normalizedPath.match(/^\/shop\/([^/]+)$/);

  if (productMatch) {
    const product = findProduct(productMatch[1]);
    if (product) {
      return {
        title: `${product.name}｜${SITE_NAME}`,
        description: `${product.name}（${product.material}）：${product.tagline.replace(/\s+/g, ' ').slice(0, 120)}`,
        path: `/shop/${product.slug}`,
      };
    }
  }

  const staticMeta = PAGE_META[normalizedPath] ?? PAGE_META['/'];
  return {
    ...staticMeta,
    path: normalizedPath,
  };
}

export default function Seo() {
  const [location] = useLocation();

  useEffect(() => {
    const meta = getMeta(location);
    const canonicalUrl = `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`;

    document.title = meta.title;
    setMeta('description', meta.description);
    setMeta('application-name', SITE_NAME);
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:title', meta.title, 'property');
    setMeta('og:description', meta.description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
    setCanonical(canonicalUrl);
  }, [location]);

  return null;
}
