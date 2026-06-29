/**
 * SOUL EASE | Mochi．crystal — Tarot Reading Page
 * Design: Wabi-Sabi Luxe × Morandi Oat Milk
 * Features:
 *   - Celtic Cross 10-card spread (凱爾特十字牌陣)
 *   - Morandi-style card faces with gold line art
 *   - Step-by-step reveal with flip animation
 *   - AI-style interpretation (static demo)
 *   - Crystal recommendation based on reading
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties, type FormEvent, type PointerEvent, type RefObject } from 'react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { CatWaving, CatListening } from '@/components/CatElements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReadingFeedback from '@/components/ReadingFeedback';
import { getMoodPlushieOpening, MoodClawMachine, type MoodPlushie } from '@/components/MoodClawMachine';
import { ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { recommendForCategory, recommendForTarot, type RecommendationCategory } from '@/data/recommend';
import { getContextualRecommendationReason, getProductImageStyle, type Product } from '@/data/products';
import { useRotatingText } from '@/hooks/useRotatingText';

const OFFICIAL_LINE_URL = 'https://lin.ee/6PBHLFX';

// ─── Tarot Card Data ──────────────────────────────────────────────────────────
type TarotCard = {
  id: number;
  name: string;
  en: string;
  symbol: string;
  meaning: string;
  reversed: string;
};

const MAJOR_ARCANA: TarotCard[] = [
  { id: 0,  name: '愚者',     en: 'The Fool',         symbol: '☽', meaning: '新的開始、純真、冒險、自由精神', reversed: '魯莽、缺乏計畫、天真過頭' },
  { id: 1,  name: '魔術師',   en: 'The Magician',     symbol: '✦', meaning: '意志力、技巧、資源豐富、顯化能力', reversed: '操縱、技巧不足、資源浪費' },
  { id: 2,  name: '女祭司',   en: 'The High Priestess',symbol: '◈', meaning: '直覺、神秘、內在智慧、潛意識', reversed: '壓抑直覺、秘密、表面化' },
  { id: 3,  name: '女皇',     en: 'The Empress',      symbol: '♡', meaning: '豐盛、母性、創造力、自然之美', reversed: '依賴、創意阻塞、過度保護' },
  { id: 4,  name: '皇帝',     en: 'The Emperor',      symbol: '♔', meaning: '權威、穩定、結構、父性保護', reversed: '獨裁、缺乏彈性、控制欲強' },
  { id: 5,  name: '教皇',     en: 'The Hierophant',   symbol: '✙', meaning: '傳統、信仰、精神指引、社會規範', reversed: '反傳統、個人信念、打破規則' },
  { id: 6,  name: '戀人',     en: 'The Lovers',       symbol: '♥', meaning: '愛情、選擇、和諧、價值觀一致', reversed: '不和諧、錯誤選擇、價值觀衝突' },
  { id: 7,  name: '戰車',     en: 'The Chariot',      symbol: '⚔', meaning: '意志力、勝利、自律、克服障礙', reversed: '失控、侵略性、缺乏方向' },
  { id: 8,  name: '力量',     en: 'Strength',         symbol: '∞', meaning: '內在力量、勇氣、耐心、溫柔的控制', reversed: '懷疑自我、缺乏信心、情緒失控' },
  { id: 9,  name: '隱士',     en: 'The Hermit',       symbol: '☆', meaning: '內省、孤獨、智慧、靈性探索', reversed: '孤立、拒絕幫助、過度內省' },
  { id: 10, name: '命運之輪', en: 'Wheel of Fortune',  symbol: '⊕', meaning: '命運、轉折點、循環、好運', reversed: '壞運、抗拒改變、命運失控' },
  { id: 11, name: '正義',     en: 'Justice',          symbol: '⚖', meaning: '公平、真理、因果、法律', reversed: '不公正、逃避責任、不誠實' },
  { id: 12, name: '倒吊人',   en: 'The Hanged Man',   symbol: '⊗', meaning: '暫停、犧牲、新視角、等待', reversed: '拖延、無謂犧牲、固執' },
  { id: 13, name: '死神',     en: 'Death',            symbol: '☩', meaning: '結束、轉變、放下、新生', reversed: '抗拒改變、停滯、無法放手' },
  { id: 14, name: '節制',     en: 'Temperance',       symbol: '△', meaning: '平衡、耐心、調和、中庸之道', reversed: '不平衡、過度、缺乏耐心' },
  { id: 15, name: '惡魔',     en: 'The Devil',        symbol: '◆', meaning: '束縛、物質主義、陰暗面、上癮', reversed: '解脫、覺醒、打破束縛' },
  { id: 16, name: '高塔',     en: 'The Tower',        symbol: '⚡', meaning: '突然改變、混亂、啟示、重建', reversed: '避免災難、延遲崩潰、內部動盪' },
  { id: 17, name: '星星',     en: 'The Star',         symbol: '✧', meaning: '希望、靈感、平靜、信念', reversed: '絕望、失去信念、不切實際' },
  { id: 18, name: '月亮',     en: 'The Moon',         symbol: '☾', meaning: '幻象、恐懼、潛意識、不確定', reversed: '困惑消散、恐懼面對、清晰浮現' },
  { id: 19, name: '太陽',     en: 'The Sun',          symbol: '☀', meaning: '喜悅、成功、活力、清晰', reversed: '悲觀、缺乏活力、過度自信' },
  { id: 20, name: '審判',     en: 'Judgement',        symbol: '♦', meaning: '覺醒、重生、召喚、反思', reversed: '自我懷疑、拒絕覺醒、過去的包袱' },
  { id: 21, name: '世界',     en: 'The World',        symbol: '○', meaning: '完成、整合、成就、旅程終點', reversed: '未完成、缺乏閉合、停滯' },
];

const MINOR_SUITS = [
  {
    name: '權杖',
    en: 'Wands',
    symbol: '✦',
    theme: '行動、熱情、創造力、目標推進',
    cards: [
      ['一', 'Ace', '新的動力、靈感萌芽、主動開始、熱情點燃', '衝勁不足、計畫延遲、熱情消退、難以啟動'],
      ['二', 'Two', '規劃未來、選擇方向、掌握主導、等待時機', '猶豫不決、視野受限、計畫卡住、害怕跨出去'],
      ['三', 'Three', '拓展機會、遠方消息、初步成果、向外發展', '進展延誤、合作不順、期待落空、視野太窄'],
      ['四', 'Four', '穩定喜悅、慶祝成果、關係安定、階段完成', '安全感不足、表面和諧、聚會延遲、根基不穩'],
      ['五', 'Five', '競爭摩擦、意見衝突、各自用力、需要協調', '避免衝突、內耗減少、勝負心退、重新找共識'],
      ['六', 'Six', '被看見、勝利回應、公開肯定、局勢好轉', '認可不足、過度在意評價、短暫勝利、自信動搖'],
      ['七', 'Seven', '守住立場、面對壓力、堅持界線、逆勢而上', '防衛過度、疲於抵抗、立場鬆動、不想再撐'],
      ['八', 'Eight', '快速推進、訊息往來、行動加速、局勢明朗', '消息延遲、節奏混亂、衝太快、溝通卡住'],
      ['九', 'Nine', '保持警覺、累積疲憊、最後防線、仍有韌性', '戒心太重、身心耗竭、放下防備、撐不下去'],
      ['十', 'Ten', '責任沉重、壓力過載、獨自承擔、接近終點', '卸下負擔、分工求助、過勞警訊、責任重新分配'],
      ['侍者', 'Page', '新訊息、好奇探索、嘗試行動、熱情邀請', '三分鐘熱度、消息不穩、幼稚衝動、缺乏後續'],
      ['騎士', 'Knight', '積極追求、快速行動、熱烈表達、冒險精神', '衝動躁進、忽冷忽熱、承諾不足、來得快去得快'],
      ['皇后', 'Queen', '自信魅力、溫暖支持、創造力旺盛、吸引力強', '情緒化控制、嫉妒心、過度付出、自我價值不穩'],
      ['國王', 'King', '成熟領導、明確目標、掌控局面、穩定推進', '強勢固執、控制欲、急於主導、行動缺乏彈性'],
    ],
  },
  {
    name: '聖杯',
    en: 'Cups',
    symbol: '♡',
    theme: '情感、關係、直覺、內在需求',
    cards: [
      ['一', 'Ace', '情感開始、心意流動、溫柔靠近、療癒感受', '情緒封閉、愛意受阻、心意未表達、感受混亂'],
      ['二', 'Two', '互相吸引、真誠連結、關係靠近、情感交換', '失衡關係、誤會疏離、單方面付出、連結變弱'],
      ['三', 'Three', '朋友支持、愉快聚會、情緒分享、共同慶祝', '小圈摩擦、第三方干擾、過度玩樂、情感不專注'],
      ['四', 'Four', '情緒倦怠、提不起勁、錯過機會、需要整理心', '重新打開、願意接受、厭倦感退、看見新可能'],
      ['五', 'Five', '失落遺憾、看著失去、情緒低潮、仍有未看見的支持', '走出難過、接受現實、慢慢修復、重新看見希望'],
      ['六', 'Six', '回憶牽動、舊人舊事、單純善意、過去影響現在', '走出懷舊、放下過去、童年課題、舊情難續'],
      ['七', 'Seven', '選項太多、幻想投射、難以決定、需要看清現實', '幻想落地、做出選擇、看清真相、減少混亂'],
      ['八', 'Eight', '離開消耗、尋找更深意義、情感抽離、轉身前進', '放不下、反覆回頭、害怕離開、停在不滿足裡'],
      ['九', 'Nine', '心願滿足、情緒享受、個人滿意、願望有機會', '滿足感空洞、貪心期待、表面快樂、願望延遲'],
      ['十', 'Ten', '情感圓滿、家庭和諧、關係穩定、幸福感累積', '理想落差、關係失和、期待過高、幸福感不穩'],
      ['侍者', 'Page', '曖昧訊息、溫柔示好、情感萌芽、直覺提醒', '情緒幼稚、訊息不明、害羞逃避、心意不成熟'],
      ['騎士', 'Knight', '浪漫邀約、情感表達、靠近示好、心意流動', '甜言蜜語、行動不足、情緒化追求、承諾模糊'],
      ['皇后', 'Queen', '溫柔共感、情緒包容、深度照顧、直覺敏銳', '過度敏感、情緒淹沒、界線不足、照顧到失衡'],
      ['國王', 'King', '成熟情感、穩定支持、理性溫柔、情緒掌握', '壓抑感受、冷處理、情緒控制、愛得不表達'],
    ],
  },
  {
    name: '寶劍',
    en: 'Swords',
    symbol: '◇',
    theme: '思考、溝通、判斷、壓力與真相',
    cards: [
      ['一', 'Ace', '清楚判斷、真相浮現、理性切入、明確溝通', '判斷混亂、話說不清、真相延遲、想法卡住'],
      ['二', 'Two', '僵持不決、封閉心門、兩難選擇、暫時不表態', '逃避結束、被迫面對、做出選擇、防衛鬆動'],
      ['三', 'Three', '心碎失望、刺痛真相、關係受傷、需要接受現實', '傷口修復、痛感減輕、釋放悲傷、慢慢復原'],
      ['四', 'Four', '休息暫停、抽離恢復、沉澱思緒、暫不行動', '重新啟動、休息不足、焦慮回來、該醒來面對'],
      ['五', 'Five', '爭執勝負、口舌傷害、贏了也失去、關係消耗', '停止爭勝、和解可能、退一步、承認代價'],
      ['六', 'Six', '離開混亂、慢慢過渡、換環境、走向平靜', '過渡受阻、難以放下、舊問題跟隨、移動延遲'],
      ['七', 'Seven', '隱瞞策略、保留真相、迂迴處理、需要防備', '真相揭露、計畫失手、坦白面對、停止逃避'],
      ['八', 'Eight', '自我限制、看不見出口、焦慮綁住、困在想法裡', '限制鬆開、找到出口、停止自困、重新掌握'],
      ['九', 'Nine', '焦慮失眠、過度擔心、內疚壓力、腦中反覆', '焦慮緩解、求助支持、放過自己、壓力下降'],
      ['十', 'Ten', '結束低谷、痛到谷底、無法再撐、舊局告終', '谷底回升、痛苦收尾、慢慢復原、避免重蹈覆轍'],
      ['侍者', 'Page', '觀察打探、訊息敏銳、謹慎開口、學習分析', '多疑窺探、話語尖銳、資訊不足、溝通幼稚'],
      ['騎士', 'Knight', '快速決斷、直接溝通、衝向目標、突破阻礙', '言語衝動、魯莽決定、爭辯過度、缺乏耐心'],
      ['皇后', 'Queen', '清醒界線、理性判斷、誠實溝通、不被情緒左右', '過度冷淡、批判尖銳、防衛太強、難以信任'],
      ['國王', 'King', '專業判斷、權威決策、邏輯清楚、公正理性', '冷酷控制、固執己見、濫用權威、缺乏同理'],
    ],
  },
  {
    name: '錢幣',
    en: 'Pentacles',
    symbol: '○',
    theme: '金錢、工作、身體、承諾與實際成果',
    cards: [
      ['一', 'Ace', '實際機會、金錢起點、穩定種子、可落地的開始', '機會延遲、資源不足、沒有落地、錯過好開端'],
      ['二', 'Two', '平衡安排、多工調度、彈性應變、收支起伏', '失去平衡、顧此失彼、節奏混亂、壓力過載'],
      ['三', 'Three', '合作建設、專業被看見、共同完成、技術累積', '合作不順、品質不足、分工混亂、努力未被認可'],
      ['四', 'Four', '保守守成、抓住安全感、控制資源、害怕失去', '願意鬆手、資源流動、放下控制、花費失衡'],
      ['五', 'Five', '匱乏感、現實壓力、被排除感、需要求助', '找到支持、困境改善、走出匱乏、願意接受幫忙'],
      ['六', 'Six', '資源互助、公平給予、收到支援、金錢往來', '付出失衡、人情壓力、資源不公、依賴或控制'],
      ['七', 'Seven', '等待成果、長期耕耘、評估投入、耐心觀察', '耐心不足、成果延遲、投資失準、想放棄'],
      ['八', 'Eight', '專注練習、技能累積、穩定工作、細節打磨', '敷衍疲乏、重複無聊、技能停滯、缺少品質'],
      ['九', 'Nine', '獨立富足、自我價值、享受成果、生活穩定', '依賴感、財務不安、表面富足、自我價值動搖'],
      ['十', 'Ten', '長期穩定、家庭資源、累積成果、關係承諾', '家族壓力、穩定破口、資源分配問題、承諾不穩'],
      ['侍者', 'Page', '學習新技能、實際消息、慢慢開始、腳踏實地', '進度慢、缺乏規劃、學習分心、機會未成熟'],
      ['騎士', 'Knight', '穩定前進、負責承擔、務實執行、可靠但慢', '停滯固執、效率低、過度保守、缺乏彈性'],
      ['皇后', 'Queen', '照顧生活、豐盛穩定、務實溫柔、身心滋養', '過度操心、物質焦慮、照顧失衡、缺少安全感'],
      ['國王', 'King', '財務掌控、成熟承諾、事業穩定、可靠資源', '物質控制、固執保守、貪心壓力、承諾變沉重'],
    ],
  },
] as const;

const MINOR_ARCANA: TarotCard[] = MINOR_SUITS.flatMap((suit, suitIndex) =>
  suit.cards.map(([rank, rankEn, meaning, reversed], rankIndex) => ({
    id: 22 + suitIndex * 14 + rankIndex,
    name: `${suit.name}${rank}`,
    en: `${rankEn} of ${suit.en}`,
    symbol: suit.symbol,
    meaning: `${meaning}；${suit.theme}`,
    reversed,
  }))
);

const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

// Star spread positions (5 cards)
const SPREAD_POSITIONS = [
  {
    id: 0,
    label: '第 1 張',
    readingLabel: '核心訊息',
    desc: '這次問題最主要的牌面重點',
  },
  {
    id: 1,
    label: '第 2 張',
    readingLabel: '情緒狀態',
    desc: '你或對方在這件事裡的真實感受',
  },
  {
    id: 2,
    label: '第 3 張',
    readingLabel: '需要看清的盲點',
    desc: '容易誤判、忽略或反覆卡住的地方',
  },
  {
    id: 3,
    label: '第 4 張',
    readingLabel: '可能走向',
    desc: '如果照目前狀態發展，較可能出現的方向',
  },
  {
    id: 4,
    label: '第 5 張',
    readingLabel: '行動提醒',
    desc: '接下來可以觀察或實際採取的一小步',
  },
];

const TAROT_WAITING_MESSAGES = [
  'Mochi 正在整理線索，但看起來像在發呆。',
  'Mochi 正在用貓掌把混亂拍成重點。',
  'Mochi 正在分析中，眼神很空，腦袋很忙。',
  'Mochi 正在把腦內毛線球慢慢解開。',
  'Mochi 正在看起來沒在想，其實很有想法。',
  'Mochi 正在慢慢靠近重點，像靠近一個紙箱。',
];

const TAROT_FOLLOW_UP_WAITING_MESSAGES = [
  'Mochi 正在整理線索，但看起來像在發呆。',
  'Mochi 正在用貓掌把混亂拍成重點。',
  'Mochi 正在分析中，眼神很空，腦袋很忙。',
  'Mochi 正在把腦內毛線球慢慢解開。',
  'Mochi 正在看起來沒在想，其實很有想法。',
  'Mochi 正在慢慢靠近重點，像靠近一個紙箱。',
];

// Rider-Waite-Smith Tarot card images (public domain), self-hosted in
// client/public/tarot to avoid Wikimedia hotlink rate-limiting (HTTP 429).
const CARD_IMAGES: Record<number, string> = Object.fromEntries(
  Array.from({ length: 78 }, (_, id) => [id, `/tarot/${String(id).padStart(2, '0')}.jpg`])
);

const CARD_BACK_IMAGE = '/tarot/back.jpg';
const TAROT_CARD_IMAGE_URLS = [...Object.values(CARD_IMAGES), CARD_BACK_IMAGE];
const preloadedTarotImages = new Set<string>();

function getCardKeywords(card: TarotCard, reversed: boolean) {
  return (reversed ? card.reversed : card.meaning)
    .split(/[、；]/u)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function preloadTarotCardImages(urls: string[]) {
  if (typeof window === 'undefined') return Promise.resolve();

  return Promise.all(urls.map((url) => {
    if (preloadedTarotImages.has(url)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        preloadedTarotImages.add(url);
        resolve();
      };
      image.onerror = () => resolve();
      image.src = url;
    });
  })).then(() => undefined);
}

function preloadTarotCardImagesWithTimeout(urls: string[], timeoutMs = 1200) {
  return Promise.race([
    preloadTarotCardImages(urls),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}

// Card face using real Rider-Waite-Smith images
const CardFace = ({ card, reversed = false }: { card: TarotCard; reversed?: boolean }) => {
  const imgUrl = CARD_IMAGES[card.id];
  const keywords = getCardKeywords(card, reversed);
  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-lg border border-[#D1BE9B]/30"
      style={{ transition: 'transform 0.3s ease', background: '#F5EFE8' }}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={card.name}
          className={`w-full h-full object-cover ${reversed ? 'rotate-180' : ''}`}
          loading="eager"
          decoding="async"
        />
      ) : (
        <div className="relative w-full h-full overflow-hidden bg-[#F3EBDD] px-2 py-2 text-[#31353A]/76">
          <div className="absolute inset-1 rounded-md border border-[#D1BE9B]/45" />
          <div className="absolute inset-2 rounded-[4px] border border-[#F8F0DC]/85" />
          <div className="relative z-10 flex h-full flex-col items-center justify-between text-center">
            <div>
              <p className="text-[9px] leading-tight tracking-[0.12em] text-[#6F5A3A]"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {card.name}
              </p>
              <p className="mt-0.5 text-[6.5px] leading-tight tracking-[0.1em] text-[#A38D6B]"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
                {card.en}
              </p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="mb-1 flex items-center justify-center rounded-full border border-[#D1BE9B]/35 bg-[#FFFDF8]/55 text-[22px] leading-none text-[#6F5A3A]/76 shadow-[0_6px_14px_rgba(209,190,155,0.18)]"
                style={{ width: '34%', aspectRatio: '1 / 1', fontFamily: 'Noto Serif TC, serif' }}>
                {card.symbol}
              </div>
              <div className="flex flex-wrap justify-center gap-0.5 px-1">
                {keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-[#D1BE9B]/20 bg-[#FFFDF8]/50 px-1 py-[1px] text-[6.5px] leading-tight tracking-[0.05em] text-[#31353A]/58"
                    style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex w-full items-center justify-between px-1 text-[8px] text-[#D1BE9B]/85">
              <span>{card.symbol}</span>
              <span>{card.symbol}</span>
            </div>
          </div>
        </div>
      )}
      {reversed && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <span className="text-[9px] tracking-wider text-[#EAA8AC] bg-black/30 px-1.5 py-0.5 rounded-full"
            style={{ fontFamily: 'Noto Serif TC, serif' }}>逆位</span>
        </div>
      )}
    </div>
  );
};

// Card back — custom deck back image
const CardBack = () => (
  <div className="w-full h-full overflow-hidden rounded-[11px] bg-[#31353A] drop-shadow-[0_12px_24px_rgba(49,53,58,0.18)]">
    <img
      src={CARD_BACK_IMAGE}
      alt="塔羅牌背面"
      className="w-full h-full object-cover"
      loading="eager"
      decoding="async"
      draggable={false}
    />
  </div>
);

// Shuffle and draw cards
function drawCards(): Array<{ card: TarotCard; reversed: boolean }> {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map(card => ({
    card,
    reversed: Math.random() > 0.7,
  }));
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
  context,
  role = 'primary',
}: {
  product: Product;
  context?: string;
  role?: 'primary' | 'secondary';
}) {
  const meanings = product.meanings.slice(0, 3).map((m) => m.title);
  const recommendationReason = getContextualRecommendationReason(product, context, role);
  const roleLabel = role === 'primary' ? '最呼應此刻' : '想加強也可看';
  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-[#D1BE9B]/25 bg-white/40 hover:border-[#D1BE9B]/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
        <div className="w-full h-52 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0EBE3]/40">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" style={getProductImageStyle(product)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              {product.tag && (
                <span className="text-[10px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-[#D1BE9B]/20 text-[#A38D6B] mr-1.5"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  {product.tag}
                </span>
              )}
              <span className="text-[10px] tracking-[0.15em] px-1.5 py-0.5 rounded-full bg-white/70 text-[#6F5A3A] border border-[#D1BE9B]/20"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {roleLabel}
              </span>
              <p className="text-[15px] tracking-[0.08em] text-[#31353A]/88 mt-1 truncate"
                style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                {product.name}
              </p>
              <p className="text-[11px] text-[#31353A]/50 tracking-wider italic truncate"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {product.subtitle}
              </p>
            </div>
            <p className="text-sm font-light text-[#D1BE9B] flex-shrink-0"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              NT$ {product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {meanings.map((m) => (
              <span key={m} className="text-[10px] tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#F0EBE3]/70 text-[#31353A]/62 border border-[#D1BE9B]/15"
                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                {m}
              </span>
            ))}
          </div>
          <div className="mb-2 rounded-xl border border-[#D1BE9B]/15 bg-[#F8F4EC]/45 px-3 py-2">
            <p className="text-[12px] tracking-[0.14em] text-[#A38D6B] mb-1"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
              為什麼 Mochi 想到它
            </p>
            <p className="text-[13px] leading-[1.85] tracking-[0.05em] text-[#31353A]/68"
              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
              {recommendationReason}
            </p>
          </div>
          <span className="text-[11px] tracking-[0.15em] text-[#A38D6B]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            看看這款商品 →
          </span>
        </div>
      </div>
    </Link>
  );
}

type Step = 'intro' | 'question' | 'shuffle' | 'pick' | 'spread' | 'reading';
type FollowUpExchange = {
  question: string;
  answer: string;
};

type ReadingRecommendation = {
  category: RecommendationCategory;
  message: string;
  reason: string;
};

const QUESTION_PROMPTS: Record<string, string[]> = {
  love: [
    '他現在對我的真實想法是什麼？',
    '他喜歡我嗎？',
    '我們還有機會嗎？',
    '他會主動聯絡我嗎？',
    '他會回來找我嗎？',
    '這段關係接下來會怎麼發展？',
    '我該主動傳訊息給他嗎？',
    '我現在該等他，還是放下？',
    '他是不是有新對象？',
    '他對這段關係是認真的嗎？',
    '我們適合在一起嗎？',
    '這段曖昧會有結果嗎？',
    '復合的機會高嗎？',
    '我現在的感情盲點是什麼？',
    '我該怎麼做，關係才會往前？',
    '我們之間最大的阻礙是什麼？',
    '這段關係現在最真實的狀態是什麼？',
    '我們之間還有沒有值得努力的空間？',
    '我該放慢腳步，還是勇敢表達？',
    '這段感情接下來三個月會有變化嗎？',
  ],
  career: [
    '我適合現在換工作嗎？',
    '這份工作適合我嗎？',
    '我目前的工作運勢如何？',
    '我該繼續撐，還是離開？',
    '這個合作或案子會順利嗎？',
    '我現在工作卡住的原因是什麼？',
    '我接下來工作上該注意什麼？',
    '未來 30 天工作會有什麼變化？',
    '我適合接受眼前這個工作機會嗎？',
    '接下來事業上該衝刺，還是先穩住？',
    '我和主管或同事之間該注意什麼？',
    '我的職涯方向哪裡需要重新整理？',
    '我適合創業、接案，還是穩定上班？',
    '近期工作上會出現新的轉機嗎？',
    '我該怎麼提升自己在工作中的價值？',
    '我現在的工作壓力真正來自哪裡？',
    '我該不該向主管提出自己的想法？',
    '我適合轉換跑道或學新技能嗎？',
    '我目前的努力會被看見嗎？',
    '我未來三個月工作重點是什麼？',
  ],
  wealth: [
    '我最近財運怎麼樣？',
    '我該不該投資或花這筆錢？',
    '這個收入機會值得我投入嗎？',
    '我近期有沒有破財風險？',
    '我該先增加收入，還是整理支出？',
    '這個副業方向值得做嗎？',
    '我現在的金錢盲點是什麼？',
    '接下來 30 天財務要注意什麼？',
    '最近財務和安全感該注意什麼？',
    '我適合開始副業或增加收入來源嗎？',
    '現在適合投資、存錢，還是先觀望？',
    '這筆花費或合作值得我投入嗎？',
    '我該如何改善自己的金錢安全感？',
    '我最近適合做比較大的金錢決定嗎？',
    '這個投資方向目前對我有利嗎？',
    '我該怎麼讓收入更穩定？',
    '我適合和別人談金錢合作嗎？',
    '我對金錢的焦慮真正來自哪裡？',
    '這個副業方向值得我長期經營嗎？',
    '我該如何提升自己吸引資源的能力？',
  ],
  growth: [
    '我現在真正卡住的原因是什麼？',
    '我目前的情緒狀態是什麼？',
    '我現在最需要看清楚什麼？',
    '我一直重複的模式是什麼？',
    '我現在最需要放下的是什麼？',
    '我該如何停止消耗自己？',
    '我下一步最適合做的小改變是什麼？',
    '今天牌想給我的核心訊息是什麼？',
    '我現在最需要學會的課題是什麼？',
    '我該如何找回自己的自信和力量？',
    '我近期適合培養哪一種能力？',
    '我該如何面對目前的迷惘感？',
    '我該怎麼和過去的自己和解？',
    '我最近反覆焦慮的核心原因是什麼？',
    '我該如何重新建立生活節奏？',
    '我該怎麼讓內心更安定？',
    '我適合開始一個新的生活習慣嗎？',
    '我現在最需要被提醒的一句話是什麼？',
    '我該如何停止被別人的期待影響？',
    '接下來我適合把能量放在哪裡？',
  ],
  other: [
    '這件事接下來可能會怎麼發展？',
    '這個選擇對我來說比較適合嗎？',
    '目前影響這件事的關鍵因素是什麼？',
    '這個人或這件事值得我投入心力嗎？',
    '我該繼續觀察，還是做出決定？',
    '如果我往前一步，可能會遇到什麼？',
    '這件事現在最好的處理方式是什麼？',
    '接下來 30 天會有什麼變化？',
    '我現在最需要看清楚什麼？',
    '我可以用什麼心態面對目前的狀況？',
    '我該相信直覺，還是再多觀察？',
    '目前這個狀況對我最大的提醒是什麼？',
    '我是不是該換一個角度看這件事？',
    '我現在最該保護自己的哪一部分？',
    '我近期會遇到什麼新的機會嗎？',
    '這個選擇可能帶我走向哪裡？',
    '我該如何讓事情慢慢回到正軌？',
    '這件事背後真正想提醒我什麼？',
    '我近期最容易忽略的訊息是什麼？',
    '我需要注意身邊哪一種人際能量？',
  ],
};

const QUESTION_CATEGORIES = [
  { id: 'love',   label: '感情', icon: '♥', questions: QUESTION_PROMPTS.love },
  { id: 'career', label: '工作', icon: '✦', questions: QUESTION_PROMPTS.career },
  { id: 'wealth', label: '財運', icon: '◇', questions: QUESTION_PROMPTS.wealth },
  { id: 'growth', label: '自我提升', icon: '☽', questions: QUESTION_PROMPTS.growth },
  { id: 'other', label: '其他', icon: '○', questions: QUESTION_PROMPTS.other },
];

const TAROT_RECOMMENDATION_MESSAGES: Record<string, string> = {
  love: '先看清關係裡真正讓你不安的地方。',
  career: '先整理方向，再決定下一步要不要衝。',
  wealth: '先穩住金錢節奏，再評估新的機會。',
  growth: '先把情緒照顧好，再要求自己前進。',
  other: '先看清真正困住你的核心，再決定下一步。',
};

const TAROT_PENDING_FOLLOW_UP_KEY = 'healingpick:tarot-pending-follow-up';
const TAROT_PENDING_START_KEY = 'healingpick:tarot-pending-start';
const FOLLOW_UP_LOGIN_PROMPT = {
  title: '登入會員，獲得更準確的個人解析',
  subtitle: '加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。',
};
const REPEAT_READING_LOGIN_PROMPT = {
  title: '登入會員，獲得更準確的個人解析',
  subtitle: '加入會員後，系統能依據你過往的資料與使用紀錄，讓每次解析更符合你的狀態與脈絡。',
};

export default function TarotPage() {
  const { isAuthenticated, login } = useAuth();
  const creditsQuery = trpc.credits.state.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Pre-check the user's remaining quota before letting them start. Saves them
  // from walking through the whole flow only to be blocked at the last step.
  const handleStart = () => {
    const c = creditsQuery.data;
    if (
      c?.enabled &&
      !isAuthenticated &&
      c.dailyFreeQuota > 0 &&
      c.freeRemaining <= 0
    ) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(TAROT_PENDING_START_KEY, '1');
      }
      setPendingStartAfterLogin(true);
      void login(REPEAT_READING_LOGIN_PROMPT);
      return;
    }
    if (c?.enabled && (isAuthenticated || c.dailyFreeQuota > 0) && c.freeRemaining <= 0 && c.credits <= 0) {
      toast.error('今日免費額度已用完 🐾', {
        description: isAuthenticated
          ? '可購買點數繼續算,或等每日 00:00 免費額度重置'
          : '註冊登入就能購買點數繼續算,或等每日 00:00 免費額度重置',
        action: {
          label: isAuthenticated ? '購買點數' : '註冊登入',
          onClick: () => {
            if (isAuthenticated) {
              window.location.href = '/buy';
            } else {
              void login();
            }
          },
        },
        duration: 6000,
      });
      return;
    }
    setStep('shuffle');
  };

  const [step, setStep] = useState<Step>('intro');
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('love');
  const [activeQuestionCategory, setActiveQuestionCategory] = useState('love');
  const [drawnCards, setDrawnCards] = useState<ReturnType<typeof drawCards>>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [isShufflingActive, setIsShufflingActive] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [llmInterpretation, setLlmInterpretation] = useState<string>('');
  const [caughtMoodPlushie, setCaughtMoodPlushie] = useState<MoodPlushie | null>(null);
  const [readingRecommendation, setReadingRecommendation] = useState<ReadingRecommendation | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpExchanges, setFollowUpExchanges] = useState<FollowUpExchange[]>([]);
  const [pendingStartAfterLogin, setPendingStartAfterLogin] = useState(false);
  const [pendingFollowUpAfterLogin, setPendingFollowUpAfterLogin] = useState(false);
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const moodClawSectionRef = useRef<HTMLDivElement | null>(null);
  const readingResultRef = useRef<HTMLDivElement | null>(null);
  const tarotStardustCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const followUpRequestInFlightRef = useRef<string | null>(null);
  const completedFollowUpRequestKeysRef = useRef(new Set<string>());

  useEffect(() => {
    void preloadTarotCardImages(TAROT_CARD_IMAGE_URLS);
  }, []);

  useEffect(() => {
    if (step !== 'intro' || typeof window === 'undefined') return;
    const canvas = tarotStardustCanvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    const stars = Array.from({ length: 72 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.15 + 0.35,
      alpha: Math.random() * 0.38 + 0.16,
      speed: Math.random() * 0.18 + 0.04,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.y -= star.speed / Math.max(height, 1);
        star.phase += 0.018;
        if (star.y < -0.02) {
          star.y = 1.02;
          star.x = Math.random();
        }
        const twinkle = Math.sin(star.phase) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(176, 146, 85, ${(star.alpha * twinkle).toFixed(3)})`;
        ctx.fill();
      });
      animationFrame = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [step]);

  const scrollToSection = useCallback((ref: RefObject<HTMLDivElement | null>, block: ScrollLogicalPosition = 'center') => {
    const scroll = () => ref.current?.scrollIntoView({ behavior: 'smooth', block });
    window.requestAnimationFrame(() => {
      scroll();
      window.requestAnimationFrame(scroll);
    });
    window.setTimeout(scroll, 80);
    window.setTimeout(scroll, 220);
    window.setTimeout(scroll, 420);
  }, []);

  const interpretMutation = trpc.tarot.interpret.useMutation({
    onSuccess: (data) => {
      setLlmInterpretation(data.interpretation);
      setReadingRecommendation(data.recommendation ?? null);
    },
    onError: (error) => {
      if (error.message === 'NOT_SIGNED_IN') {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(TAROT_PENDING_START_KEY, '1');
        }
        setPendingStartAfterLogin(true);
        void login(REPEAT_READING_LOGIN_PROMPT);
      }
    },
  });
  const followUpMutation = trpc.tarot.followUp.useMutation({
    onSuccess: (data, variables) => {
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      completedFollowUpRequestKeysRef.current.add(requestKey);
      setFollowUpExchanges(prev => [
        ...prev,
        {
          question: variables.followUpQuestion,
          answer: data.answer,
        },
      ]);
      setFollowUpQuestion('');
      void creditsQuery.refetch();
    },
    onError: (error, variables) => {
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      completedFollowUpRequestKeysRef.current.delete(requestKey);

      if (error.message === 'NOT_SIGNED_IN') {
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return;
      }

      if (error.message === 'INSUFFICIENT_CREDITS') {
        toast.error('可用次數不足', {
          description: '可以先購買點數，或稍後再回來問 Mochi。',
          action: {
            label: '購買點數',
            onClick: () => {
              window.location.href = '/buy';
            },
          },
          duration: 6000,
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      if (!variables) {
        followUpRequestInFlightRef.current = null;
        return;
      }
      const requestKey = JSON.stringify([
        variables.question,
        variables.questionType,
        variables.followUpQuestion,
        variables.interpretation,
        variables.cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
      ]);
      if (followUpRequestInFlightRef.current === requestKey) {
        followUpRequestInFlightRef.current = null;
      }
    },
  });
  const tarotWaitingMessage = useRotatingText(TAROT_WAITING_MESSAGES, interpretMutation.isPending);
  const tarotFollowUpWaitingMessage = useRotatingText(
    TAROT_FOLLOW_UP_WAITING_MESSAGES,
    followUpMutation.isPending
  );

  useEffect(() => {
    if (interpretMutation.isPending) {
      setCaughtMoodPlushie(null);
    }
  }, [interpretMutation.isPending]);

  useEffect(() => {
    if (!interpretMutation.isPending && llmInterpretation) {
      scrollToSection(readingResultRef, 'start');
    }
  }, [interpretMutation.isPending, llmInterpretation, scrollToSection]);

  const getReadingCardsPayload = (cards = drawnCards) =>
    cards.map((d, i) => ({
      name: d.card.name,
      en: d.card.en,
      symbol: d.card.symbol,
      meaning: d.reversed ? d.card.reversed : d.card.meaning,
      reversed: d.reversed,
      position: SPREAD_POSITIONS[i].readingLabel,
      positionDesc: SPREAD_POSITIONS[i].desc,
    }));

  const submitFollowUp = useCallback((trimmedQuestion: string, creditState = creditsQuery.data) => {
    if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending) return false;

    if (creditState?.enabled) {
      if (!isAuthenticated) {
        setPendingFollowUpAfterLogin(true);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(TAROT_PENDING_FOLLOW_UP_KEY, JSON.stringify({
            question,
            questionType,
            cards: getReadingCardsPayload(),
            drawnCards,
            interpretation: llmInterpretation,
            followUpQuestion: trimmedQuestion,
            readingRecommendation,
          }));
        }
        void login(FOLLOW_UP_LOGIN_PROMPT);
        return false;
      }

      // Auth may have just changed, so the credits query can briefly still
      // reflect the previous visitor/session. Let the server be the source of
      // truth for available quota and surface INSUFFICIENT_CREDITS there.
    }

    const cards = getReadingCardsPayload();
    const requestKey = JSON.stringify([
      question,
      questionType,
      trimmedQuestion,
      llmInterpretation,
      cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
    ]);
    if (
      followUpRequestInFlightRef.current === requestKey ||
      completedFollowUpRequestKeysRef.current.has(requestKey)
    ) {
      return true;
    }
    followUpRequestInFlightRef.current = requestKey;

    followUpMutation.mutate({
      question,
      questionType,
      cards,
      interpretation: llmInterpretation,
      followUpQuestion: trimmedQuestion,
    });
    return true;
  }, [
    creditsQuery.data,
    followUpMutation,
    getReadingCardsPayload,
    isAuthenticated,
    llmInterpretation,
    login,
    question,
    questionType,
  ]);

  const startReading = (cards = drawnCards) => {
    setStep('reading');
    setLlmInterpretation('');
    setReadingRecommendation(null);
    setFollowUpQuestion('');
    setFollowUpExchanges([]);
    setPendingFollowUpAfterLogin(false);
    interpretMutation.mutate({
      question,
      questionType,
      cards: getReadingCardsPayload(cards),
    });
  };

  const handleFollowUpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion || !llmInterpretation || followUpMutation.isPending) return;

    submitFollowUp(trimmedQuestion);
  };

  useEffect(() => {
    if (!pendingFollowUpAfterLogin || !isAuthenticated || followUpMutation.isPending) return;
    const trimmedQuestion = followUpQuestion.trim();
    if (!trimmedQuestion) {
      setPendingFollowUpAfterLogin(false);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);
    }

    void creditsQuery.refetch().then((result) => {
      const submitted = submitFollowUp(trimmedQuestion, result.data);
      if (submitted || isAuthenticated) setPendingFollowUpAfterLogin(false);
    });
  }, [
    creditsQuery,
    followUpMutation.isPending,
    followUpQuestion,
    isAuthenticated,
    pendingFollowUpAfterLogin,
    submitFollowUp,
  ]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const hasPendingStart = pendingStartAfterLogin || window.sessionStorage.getItem(TAROT_PENDING_START_KEY) === '1';
    if (!hasPendingStart) return;

    window.sessionStorage.removeItem(TAROT_PENDING_START_KEY);
    setPendingStartAfterLogin(false);
    setStep('shuffle');
  }, [isAuthenticated, pendingStartAfterLogin]);

  useEffect(() => {
    if (!isAuthenticated || followUpMutation.isPending || typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(TAROT_PENDING_FOLLOW_UP_KEY);
    if (!raw) return;
    window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);

    try {
      const pending = JSON.parse(raw) as {
        question?: string;
        questionType?: string;
        cards?: ReturnType<typeof getReadingCardsPayload>;
        drawnCards?: ReturnType<typeof drawCards>;
        interpretation?: string;
        followUpQuestion?: string;
        readingRecommendation?: ReadingRecommendation | null;
      };
      const trimmedQuestion = pending.followUpQuestion?.trim();
      if (!trimmedQuestion || !pending.interpretation || !pending.cards?.length) return;

      setStep('reading');
      setQuestion(pending.question ?? '');
      setQuestionType(pending.questionType ?? 'love');
      setDrawnCards(pending.drawnCards ?? []);
      setLlmInterpretation(pending.interpretation);
      setReadingRecommendation(pending.readingRecommendation ?? null);
      setFollowUpQuestion(trimmedQuestion);

      void creditsQuery.refetch().then((result) => {
        const cards = pending.cards ?? [];
        const requestKey = JSON.stringify([
          pending.question ?? '',
          pending.questionType ?? 'love',
          trimmedQuestion,
          pending.interpretation ?? '',
          cards.map(card => `${card.position}:${card.name}:${card.reversed}`).join('|'),
        ]);
        if (
          followUpRequestInFlightRef.current === requestKey ||
          completedFollowUpRequestKeysRef.current.has(requestKey)
        ) {
          return;
        }
        followUpRequestInFlightRef.current = requestKey;

        followUpMutation.mutate({
          question: pending.question ?? '',
          questionType: pending.questionType ?? 'love',
          cards,
          interpretation: pending.interpretation ?? '',
          followUpQuestion: trimmedQuestion,
        });
      });
    } catch {
      window.sessionStorage.removeItem(TAROT_PENDING_FOLLOW_UP_KEY);
    }
  }, [creditsQuery, followUpMutation, isAuthenticated]);

  // 開始持續洗牌動畫
  const handleStartShuffle = useCallback(() => {
    setIsShufflingActive(true);
  }, []);

  // 停止洗牌，展開牌組讓使用者選牌
  const handleStopShuffle = useCallback(() => {
    setIsShufflingActive(false);
    // 最終洗牌結果
    const finalDeck = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    setShuffledDeck(finalDeck);
    setPickedIndices([]);
    setStep('pick');
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);

  // 使用者選牌
  function handlePickCard(deckIdx: number) {
    if (pickedIndices.includes(deckIdx)) return;
    if (pickedIndices.length >= 5) return;
    const newPicked = [...pickedIndices, deckIdx];
    setPickedIndices(newPicked);
    if (newPicked.length === 5) {
      // 將選出的牌轉換為 drawnCards 格式
      const cards = newPicked.map(i => ({
        card: shuffledDeck[i],
        reversed: Math.random() > 0.7,
      }));
      const selectedImageUrls = cards
        .map(({ card }) => CARD_IMAGES[card.id])
        .filter(Boolean);
      setDrawnCards(cards);
      setRevealedCards(new Set([0, 1, 2, 3, 4]));
      setSelectedCard(0);
      void preloadTarotCardImagesWithTimeout(selectedImageUrls).then(() => {
        startReading(cards);
      });
    }
  }

  // 舊的 handleShuffle 保留相容性（不再使用）
  function handleShuffle() {
    setShuffling(true);
    setTimeout(() => {
      setDrawnCards(drawCards());
      setRevealedCards(new Set([0, 1, 2, 3, 4]));
      setSelectedCard(0);
      setShuffling(false);
      setStep('spread');
    }, 2000);
  }

  function handleRevealCard(idx: number) {
    setRevealedCards(prev => new Set(Array.from(prev).concat(idx)));
    setSelectedCard(idx);
  }

  const recommendedProducts = step === 'reading'
    ? readingRecommendation
      ? recommendForCategory(readingRecommendation.category)
      : recommendForTarot(questionType, question)
    : [];
  const tarotRecommendationMessage =
    readingRecommendation?.message ??
    TAROT_RECOMMENDATION_MESSAGES[questionType] ??
    TAROT_RECOMMENDATION_MESSAGES.growth;
  const handleTarotChoiceMove = (event: PointerEvent<HTMLElement>) => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const maxTilt = 7;
    card.style.setProperty('--choice-ry', `${((px - 0.5) * maxTilt * 2).toFixed(2)}deg`);
    card.style.setProperty('--choice-rx', `${(-(py - 0.5) * maxTilt * 2).toFixed(2)}deg`);
    card.style.setProperty('--choice-mx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--choice-my', `${(py * 100).toFixed(1)}%`);
  };

  const handleTarotChoiceLeave = (event: PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.setProperty('--choice-rx', '0deg');
    card.style.setProperty('--choice-ry', '0deg');
    card.style.setProperty('--choice-mx', '50%');
    card.style.setProperty('--choice-my', '50%');
  };

  const handlePopularQuestionClick = (prompt: string, type: string, nextStep?: Step) => {
    setQuestion(prompt.slice(0, 300));
    setQuestionType(type);
    setActiveQuestionCategory(type);
    if (nextStep) setStep(nextStep);
    if (typeof window === 'undefined') return;

    const jumpToQuestionInput = () => {
      const input = questionInputRef.current;
      if (!input) return;
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => input.focus({ preventScroll: true }), 180);
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(jumpToQuestionInput);
    });
  };

  const renderPopularQuestions = (nextStep?: Step) => {
    const activeCategory =
      QUESTION_CATEGORIES.find(category => category.id === activeQuestionCategory) ??
      QUESTION_CATEGORIES[0];

    return (
      <div className="border-t border-[#D1BE9B]/14 pt-5 text-left">
        <div className="mb-4 text-center">
          <p className="text-[11px] tracking-[0.34em] text-[#D1BE9B] uppercase"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            Popular Questions
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-[#D1BE9B]/12 bg-[#FAF7F4]/42 p-1.5 sm:grid-cols-5">
          {QUESTION_CATEGORIES.map((category) => {
            const isActive = activeCategory.id === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveQuestionCategory(category.id)}
                className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-center transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'border-[#D1BE9B]/60 bg-white/78 text-[#8A7250] shadow-sm'
                    : 'border-transparent bg-transparent text-[#31353A]/58 hover:bg-white/50 hover:text-[#8A7250]'
                }`}
                aria-pressed={isActive}
              >
                <span className={`text-[13px] leading-none ${isActive ? 'text-[#A38D6B]' : 'text-[#D1BE9B]/70'}`}>
                  {category.icon}
                </span>
                <span className="text-[10.5px] tracking-[0.12em]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: isActive ? 500 : 300 }}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#D1BE9B]/14 bg-[#FFFDF8]/58 p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] tracking-[0.22em] text-[#8A7250]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
              {activeCategory.icon} {activeCategory.label}
            </p>
            <span className="text-[10px] tracking-[0.16em] text-[#A38D6B]"
              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
              向下滑看更多 ↓
            </span>
          </div>
          <div className="relative">
            <div className="animate-fade-in-up grid max-h-[318px] gap-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#D1BE9B66_transparent]">
              {activeCategory.questions.map(prompt => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePopularQuestionClick(prompt, activeCategory.id, nextStep)}
                  className="min-h-[54px] w-full rounded-xl border border-[#D1BE9B]/14 bg-white/62 px-3 py-2.5 text-left text-[11.5px] leading-[1.65] tracking-[0.06em] text-[#31353A]/72 transition-all duration-200 hover:border-[#D1BE9B]/55 hover:bg-[#D1BE9B]/10 hover:text-[#8A7250] active:scale-[0.99]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-1 h-10 rounded-b-xl bg-gradient-to-t from-[#FFFDF8] to-transparent" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">

          {/* ── INTRO ──────────────────────────────────────────────────────── */}
          {step === 'intro' && (
            <div className="tarot-choice-stage animate-fade-in-up">
              <style>{`
                .tarot-choice-stage {
                  --choice-bg: #ebe7dc;
                  --choice-bg-2: #f6f2e8;
                  --choice-ink: #35383a;
                  --choice-ink-soft: #6f6d62;
                  --choice-gold: #b09255;
                  --choice-gold-soft: #d8c79b;
                  --choice-sage: #6f8a6a;
                  --choice-sage-soft: #b8cdb2;
                  --choice-card: #fbf8f0;
                  --choice-card-2: #f0ede4;
                  --choice-line: rgba(120, 110, 80, 0.18);
                  position: relative;
                  overflow: hidden;
                  border-radius: 26px;
                  margin: 0 auto;
                  padding: 42px 18px 52px;
                  text-align: center;
                  background:
                    radial-gradient(920px 620px at 50% -18%, rgba(255, 253, 248, 0.92), rgba(235, 231, 220, 0.44) 62%, transparent),
                    linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0));
                }
                .tarot-choice-stardust {
                  position: absolute;
                  inset: 0;
                  width: 100%;
                  height: 100%;
                  pointer-events: none;
                  opacity: 0.78;
                }
                .tarot-choice-content {
                  position: relative;
                  z-index: 1;
                }
                .tarot-choice-pill {
                  display: inline-flex;
                  max-width: min(100%, 620px);
                  align-items: center;
                  justify-content: center;
                  border-radius: 999px;
                  border: 1px solid rgba(176, 146, 85, 0.42);
                  background: linear-gradient(180deg, rgba(255, 253, 247, 0.94), rgba(241, 231, 207, 0.72));
                  padding: 14px 32px;
                  color: #4f3f28;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 15px;
                  font-weight: 700;
                  letter-spacing: 0.12em;
                  line-height: 1.8;
                  box-shadow: inset 0 1px 0 rgba(255,255,255,0.88), 0 16px 38px rgba(120, 102, 70, 0.16);
                  backdrop-filter: blur(8px);
                }
                .tarot-choice-grid {
                  display: grid;
                  grid-template-columns: minmax(0, 1fr);
                  gap: 26px;
                  margin: 40px auto 0;
                  max-width: 1060px;
                  text-align: left;
                  perspective: 1400px;
                }
                .tarot-choice-card {
                  --choice-rx: 0deg;
                  --choice-ry: 0deg;
                  --choice-mx: 50%;
                  --choice-my: 50%;
                  position: relative;
                  display: flex;
                  min-height: 100%;
                  flex-direction: column;
                  overflow: hidden;
                  border-radius: 26px;
                  border: 1px solid var(--choice-line);
                  background: linear-gradient(165deg, var(--choice-card), var(--choice-card-2));
                  padding: 34px 28px 30px;
                  box-shadow: 0 14px 36px rgba(80, 72, 45, 0.1);
                  transform: rotateX(var(--choice-rx)) rotateY(var(--choice-ry)) translateZ(0);
                  transform-style: preserve-3d;
                  transition: transform 420ms cubic-bezier(.22,.61,.36,1), box-shadow 420ms ease, border-color 420ms ease;
                  will-change: transform;
                }
                .tarot-choice-card::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  z-index: 2;
                  border-radius: inherit;
                  background: radial-gradient(420px circle at var(--choice-mx) var(--choice-my), rgba(255,255,255,0.58), rgba(255,255,255,0) 46%);
                  opacity: 0;
                  pointer-events: none;
                  mix-blend-mode: soft-light;
                  transition: opacity 360ms ease;
                }
                .tarot-choice-card:hover::before {
                  opacity: 1;
                }
                .tarot-choice-card--free:hover {
                  border-color: rgba(216, 199, 155, 0.72);
                  box-shadow: 0 28px 62px rgba(176, 146, 85, 0.28);
                }
                .tarot-choice-card--human:hover {
                  border-color: rgba(184, 205, 178, 0.78);
                  box-shadow: 0 28px 62px rgba(111, 138, 106, 0.28);
                }
                .tarot-choice-layer {
                  position: relative;
                  z-index: 3;
                  transform: translateZ(var(--choice-z, 0));
                  transition: transform 420ms cubic-bezier(.22,.61,.36,1);
                }
                .tarot-choice-badge {
                  position: absolute;
                  right: 28px;
                  top: 30px;
                  z-index: 4;
                  overflow: hidden;
                  border-radius: 999px;
                  border: 1px solid;
                  padding: 7px 17px;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 11px;
                  font-weight: 500;
                  letter-spacing: 0.22em;
                }
                .tarot-choice-badge::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -150%;
                  width: 60%;
                  height: 100%;
                  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.82), transparent);
                  transform: skewX(-20deg);
                  animation: tarot-choice-sheen 3.7s ease-in-out infinite;
                }
                .tarot-choice-card--free .tarot-choice-badge {
                  border-color: var(--choice-gold-soft);
                  background: rgba(216, 199, 155, 0.18);
                  color: var(--choice-gold);
                }
                .tarot-choice-card--human .tarot-choice-badge {
                  border-color: var(--choice-sage-soft);
                  background: rgba(184, 205, 178, 0.18);
                  color: var(--choice-sage);
                }
                .tarot-choice-eyebrow {
                  margin-bottom: 14px;
                  font-family: 'Cormorant Garamond', serif;
                  font-size: 13px;
                  letter-spacing: 0.36em;
                  text-transform: uppercase;
                }
                .tarot-choice-card--free .tarot-choice-eyebrow,
                .tarot-choice-card--free .tarot-choice-accent {
                  color: var(--choice-gold);
                }
                .tarot-choice-card--human .tarot-choice-eyebrow,
                .tarot-choice-card--human .tarot-choice-accent {
                  color: var(--choice-sage);
                }
                .tarot-choice-title {
                  margin: 0 92px 22px 0;
                  color: var(--choice-ink);
                  font-family: 'Noto Serif TC', serif;
                  font-size: 28px;
                  font-weight: 300;
                  letter-spacing: 0.16em;
                  line-height: 1.35;
                }
                .tarot-choice-desc {
                  color: rgba(49, 53, 58, 0.68);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 13px;
                  font-weight: 300;
                  letter-spacing: 0.08em;
                  line-height: 2;
                }
                .tarot-choice-mochi-visual {
                  position: relative;
                  z-index: 3;
                  margin: 0 0 24px;
                  min-height: 154px;
                  overflow: visible;
                  transform: translateZ(var(--choice-z, 0));
                }
                .tarot-choice-mochi-main {
                  position: absolute;
                  right: -18px;
                  bottom: -24px;
                  width: min(64%, 252px);
                  height: 184px;
                  object-fit: contain;
                  object-position: center;
                  filter: drop-shadow(0 14px 22px rgba(80, 72, 45, 0.12));
                }
                .tarot-choice-mochi-caption {
                  position: absolute;
                  left: 24px;
                  top: 24px;
                  z-index: 3;
                  max-width: 170px;
                  color: #8a7250;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 12px;
                  font-weight: 300;
                  letter-spacing: 0.12em;
                  line-height: 1.9;
                }
                .tarot-choice-mochi-caption strong {
                  display: block;
                  color: #8a7250;
                  font-size: 15px;
                  font-weight: 500;
                  letter-spacing: 0.12em;
                  line-height: 1.5;
                  margin-bottom: 5px;
                }
                .tarot-choice-human-visual {
                  position: relative;
                  z-index: 3;
                  margin: 0 0 24px;
                  min-height: 144px;
                  overflow: visible;
                  transform: translateZ(var(--choice-z, 0));
                }
                .tarot-choice-human-mochi {
                  position: absolute;
                  right: -14px;
                  bottom: -28px;
                  width: min(54%, 204px);
                  height: 184px;
                  object-fit: contain;
                  object-position: center bottom;
                  filter: drop-shadow(0 14px 22px rgba(80, 72, 45, 0.12));
                }
                .tarot-choice-human-caption {
                  position: absolute;
                  left: 20px;
                  top: 24px;
                  z-index: 3;
                  max-width: 190px;
                  color: #5f7d5a;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 12px;
                  font-weight: 300;
                  letter-spacing: 0.12em;
                  line-height: 1.9;
                }
                .tarot-choice-human-caption strong {
                  display: block;
                  color: #267345;
                  font-size: 18px;
                  font-weight: 500;
                  letter-spacing: 0.08em;
                  line-height: 1.4;
                  margin: 2px 0 7px;
                }
                .tarot-choice-list {
                  display: grid;
                  gap: 12px;
                  margin: 26px 0 30px;
                  padding: 0;
                  list-style: none;
                }
                .tarot-choice-list li,
                .tarot-choice-note,
                .tarot-choice-price-box,
                .tarot-choice-reviews {
                  border: 1px solid var(--choice-line);
                  border-radius: 14px;
                  background: rgba(255,255,255,0.56);
                  box-shadow: inset 0 1px 0 rgba(255,255,255,0.58);
                }
                .tarot-choice-list li {
                  position: relative;
                  padding: 14px 17px 14px 38px;
                  color: rgba(49, 53, 58, 0.72);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 12px;
                  font-weight: 300;
                  letter-spacing: 0.08em;
                  line-height: 1.8;
                }
                .tarot-choice-list li::before {
                  content: '';
                  position: absolute;
                  left: 18px;
                  top: 24px;
                  width: 7px;
                  height: 7px;
                  border-radius: 999px;
                }
                .tarot-choice-card--free .tarot-choice-list li::before {
                  background: var(--choice-gold);
                }
                .tarot-choice-card--human .tarot-choice-list li::before {
                  background: var(--choice-sage);
                }
                .tarot-choice-ai-proof {
                  display: grid;
                  gap: 10px;
                  margin: 24px 0 30px;
                }
                .tarot-choice-ai-proof-title {
                  color: #8a7250;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 12px;
                  font-weight: 400;
                  letter-spacing: 0.18em;
                  line-height: 1.8;
                }
                .tarot-choice-ai-proof-card {
                  position: relative;
                  border: 1px solid rgba(216, 199, 155, 0.28);
                  border-radius: 14px;
                  background: rgba(255, 255, 255, 0.5);
                  padding: 14px 15px 14px 42px;
                  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
                }
                .tarot-choice-ai-proof-card::before {
                  content: attr(data-mark);
                  position: absolute;
                  left: 15px;
                  top: 15px;
                  color: var(--choice-gold);
                  font-family: 'Noto Serif TC', serif;
                  font-size: 14px;
                  line-height: 1;
                }
                .tarot-choice-ai-proof-card h3 {
                  margin: 0;
                  color: #4f4638;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 13px;
                  font-weight: 400;
                  letter-spacing: 0.12em;
                  line-height: 1.7;
                }
                .tarot-choice-ai-proof-card p {
                  margin: 4px 0 0;
                  color: rgba(49, 53, 58, 0.62);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 11.5px;
                  font-weight: 300;
                  letter-spacing: 0.06em;
                  line-height: 1.8;
                }
                .tarot-choice-ai-proof-card ul {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 8px;
                  margin: 10px 0 0;
                  padding: 0;
                  list-style: none;
                }
                .tarot-choice-ai-proof-card li {
                  border: 1px solid rgba(216, 199, 155, 0.22);
                  border-radius: 12px;
                  background: rgba(255, 253, 248, 0.5);
                  padding: 10px 11px;
                  color: rgba(49, 53, 58, 0.62);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 11.5px;
                  font-weight: 300;
                  letter-spacing: 0.06em;
                  line-height: 1.8;
                }
                .tarot-choice-ai-proof-card li strong {
                  display: block;
                  margin-bottom: 2px;
                  color: #4f4638;
                  font-weight: 400;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 12px;
                  letter-spacing: 0.1em;
                }
                @media (min-width: 720px) {
                  .tarot-choice-ai-proof-card ul {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                  }
                }
                .tarot-choice-inline-link {
                  display: inline-flex;
                  margin-left: 8px;
                  border-bottom: 1px solid rgba(138, 114, 80, 0.42);
                  color: #8a7250;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 11px;
                  font-weight: 400;
                  letter-spacing: 0.08em;
                  line-height: 1.6;
                  text-decoration: none;
                  transition: color 180ms ease, border-color 180ms ease;
                }
                .tarot-choice-inline-link:hover {
                  color: #5f7d5a;
                  border-color: rgba(95, 125, 90, 0.55);
                }
                .tarot-choice-note {
                  margin-bottom: 22px;
                  padding: 15px 17px;
                }
                .tarot-choice-price-box {
                  margin: 22px 0 18px;
                  padding: 18px 19px;
                }
                .tarot-choice-price-label {
                  margin-bottom: 10px;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 12px;
                  font-weight: 400;
                  letter-spacing: 0.22em;
                }
                .tarot-choice-price-row {
                  display: flex;
                  align-items: baseline;
                  justify-content: space-between;
                  gap: 18px;
                  padding: 9px 0;
                  color: rgba(49, 53, 58, 0.76);
                  font-family: 'Noto Serif TC', serif;
                  font-size: 13px;
                  font-weight: 300;
                  letter-spacing: 0.1em;
                }
                .tarot-choice-price-row + .tarot-choice-price-row {
                  border-top: 1px dashed rgba(120, 110, 80, 0.18);
                }
                .tarot-choice-price-row strong {
                  color: var(--choice-sage);
                  font-size: 20px;
                  font-weight: 500;
                  letter-spacing: 0.06em;
                  white-space: nowrap;
                }
                .tarot-choice-reviews {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 18px;
                  margin-bottom: 20px;
                  padding: 16px 17px;
                  text-decoration: none;
                  transition: transform 240ms ease, border-color 240ms ease, background 240ms ease, box-shadow 240ms ease;
                }
                .tarot-choice-reviews:hover {
                  border-color: rgba(216, 199, 155, 0.72);
                  background: rgba(255,255,255,0.74);
                  box-shadow: 0 12px 30px rgba(180, 160, 130, 0.13);
                  transform: translateY(-2px);
                }
                .tarot-choice-review-title {
                  color: #8a7250;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 13px;
                  font-weight: 500;
                  letter-spacing: 0.2em;
                }
                .tarot-choice-review-subtitle {
                  margin-top: 4px;
                  color: rgba(49, 53, 58, 0.58);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 11px;
                  font-weight: 300;
                  letter-spacing: 0.08em;
                  line-height: 1.7;
                }
                .tarot-choice-review-cta {
                  display: inline-flex;
                  flex: 0 0 auto;
                  align-items: center;
                  justify-content: center;
                  border-radius: 999px;
                  border: 1px solid rgba(209, 190, 155, 0.38);
                  background: rgba(209, 190, 155, 0.14);
                  padding: 10px 15px;
                  color: #8a7250;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 11px;
                  font-weight: 400;
                  letter-spacing: 0.14em;
                  white-space: nowrap;
                }
                .tarot-choice-chips {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin: 0 0 28px;
                }
                .tarot-choice-chips span {
                  border-radius: 999px;
                  border: 1px solid rgba(111, 138, 106, 0.18);
                  background: rgba(255,255,255,0.54);
                  padding: 7px 11px;
                  color: rgba(49, 53, 58, 0.66);
                  font-family: 'Noto Sans TC', sans-serif;
                  font-size: 11px;
                  font-weight: 300;
                  letter-spacing: 0.06em;
                  line-height: 1.5;
                }
                .tarot-choice-cta {
                  position: relative;
                  z-index: 3;
                  display: inline-flex;
                  width: 100%;
                  min-height: 48px;
                  align-items: center;
                  justify-content: center;
                  border: 0;
                  border-radius: 14px;
                  padding: 15px 18px;
                  color: #fff;
                  font-family: 'Noto Serif TC', serif;
                  font-size: 13px;
                  font-weight: 300;
                  letter-spacing: 0.18em;
                  line-height: 1.4;
                  text-decoration: none;
                  transition: transform 220ms ease, filter 220ms ease;
                }
                .tarot-choice-card--free .tarot-choice-cta {
                  background: linear-gradient(135deg, var(--choice-gold), #967943);
                }
                .tarot-choice-card--human .tarot-choice-cta {
                  background: linear-gradient(135deg, #06c755, #5a7556);
                }
                .tarot-choice-cta:hover {
                  filter: brightness(1.06);
                  transform: translateY(-2px);
                }
                .tarot-choice-cta:active {
                  transform: translateY(0);
                }
                @keyframes tarot-choice-sheen {
                  0%, 62% { left: -150%; }
                  100% { left: 160%; }
                }
                @media (min-width: 980px) {
                  .tarot-choice-grid {
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 34px;
                  }
                  .tarot-choice-card {
                    padding: 42px 38px 36px;
                  }
                  .tarot-choice-badge {
                    right: 38px;
                    top: 36px;
                  }
                }
                @media (max-width: 640px) {
                  .tarot-choice-stage {
                    border-radius: 22px;
                    padding: 34px 12px 42px;
                  }
                  .tarot-choice-title {
                    margin-right: 70px;
                    font-size: 23px;
                    letter-spacing: 0.12em;
                  }
                  .tarot-choice-card {
                    padding: 30px 20px 24px;
                  }
                  .tarot-choice-badge {
                    right: 20px;
                    top: 26px;
                  }
                  .tarot-choice-mochi-visual {
                    min-height: 136px;
                  }
                  .tarot-choice-mochi-main {
                    width: 62%;
                    height: 154px;
                    right: -26px;
                  }
                  .tarot-choice-mochi-caption {
                    left: 18px;
                    top: 20px;
                    max-width: 132px;
                    font-size: 11px;
                  }
                  .tarot-choice-mochi-caption strong {
                    font-size: 13px;
                  }
                  .tarot-choice-human-visual {
                    min-height: 132px;
                  }
                  .tarot-choice-human-mochi {
                    width: 52%;
                    height: 158px;
                    right: -18px;
                  }
                  .tarot-choice-human-caption {
                    left: 16px;
                    top: 20px;
                    max-width: 156px;
                    font-size: 11px;
                  }
                  .tarot-choice-human-caption strong {
                    font-size: 16px;
                  }
                  .tarot-choice-reviews {
                    align-items: stretch;
                    flex-direction: column;
                  }
                  .tarot-choice-review-cta {
                    width: 100%;
                  }
                }
                @media (prefers-reduced-motion: reduce) {
                  .tarot-choice-stardust {
                    display: none;
                  }
                  .tarot-choice-card,
                  .tarot-choice-layer,
                  .tarot-choice-cta,
                  .tarot-choice-reviews {
                    transition: none !important;
                  }
                  .tarot-choice-badge::after {
                    display: none;
                    animation: none;
                  }
                }
              `}</style>
              <canvas ref={tarotStardustCanvasRef} className="tarot-choice-stardust" aria-hidden="true" />
              <div className="tarot-choice-content">
              {/* Header */}
              <div className="mb-10 text-center w-full">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase block"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Tarot Reading
                </span>
                
                {/* flex justify-center keeps h1 perfectly centred; envelope is absolute so it never shifts the title */}
                <div className="relative mt-3 mb-10 md:mb-8 flex justify-center items-center">
                  <h1 className="text-xl md:text-2xl tracking-[0.2em] font-extralight text-[#31353A] m-0"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    塔羅牌占卜
                  </h1>

                  {/* Envelope anchored at a fixed distance from centre — absolute so h1 centering is never disturbed */}
                  {/* Float lives on the outer div so hover:scale / active:scale on the button don't fight the animation */}
                  <div className="absolute right-4 md:right-12 top-[calc(50%+0.5rem)] -translate-y-1/2 animate-float-envelope">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="relative flex flex-col items-center justify-center group bg-transparent focus:outline-none border-none hover:scale-105 active:scale-[0.92] transition-transform duration-150 ease-out">
                          <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#FDFBF7] to-[#F0E8DC] border border-[#D1BE9B]/60 shadow-[0_4px_16px_rgba(209,190,155,0.25)] hover:shadow-[0_8px_24px_rgba(163,141,107,0.35)] transition-shadow duration-500 overflow-visible">
                            {/* Ping ripple — plays once on page load */}
                            <div className="absolute inset-0 rounded-full border border-[#D1BE9B]/50 animate-envelope-ping pointer-events-none" />
                            {/* Decorative spinning inner ring */}
                            <div className="absolute inset-0.5 md:inset-1 rounded-full border border-[#D1BE9B]/40 border-dashed animate-[spin_30s_linear_infinite] pointer-events-none" />
                            {/* Glint — clips to the circle, sweeps every 8 s */}
                            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
                              <div className="absolute top-0 left-0 h-full w-1/2 animate-wax-glint"
                                style={{ background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)' }} />
                            </div>
                            {/* Wax seal style envelope icon */}
                            <div className="relative z-10 flex items-center justify-center text-[#A38D6B] group-hover:text-[#8A7250] transition-colors drop-shadow-sm scale-75 md:scale-90">
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                                {/* Gold wax seal */}
                                <circle cx="12" cy="13.2" r="3" fill="#D1BE9B" className="group-hover:fill-[#C9A86A] transition-colors" />
                                <path d="M11 13.2H13M12 12.2V14.2" stroke="#FDFBF7" strokeWidth="0.8" strokeLinecap="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Always visible tooltip positioned absolutely to avoid layout shift */}
                          <span className="absolute top-[110%] bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#D1BE9B]/20 text-[#8A7250] text-[9px] md:text-[10px] tracking-[0.1em] px-2 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            塔羅小教室
                          </span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-[#FDFBF7] border-[#D1BE9B]/30" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                      <DialogHeader>
                        <DialogTitle className="text-center text-lg tracking-[0.2em] font-extralight text-[#31353A] mb-2 mt-2">
                          ✦ 為什麼 AI 算的也可以很準？ ✦
                        </DialogTitle>
                      </DialogHeader>
                      <div className="text-[13px] text-[#31353A]/80 leading-[2.2] tracking-wider space-y-6 mt-2" style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        <p>
                          很多人一開始會覺得：「AI 真的懂塔羅嗎？會不會只是隨便生成一段話？」<br/><br/>
                          其實塔羅不是隨便感覺一下而已。它會看牌義、牌陣位置、正逆位，也會搭配你的問題背景一起整理。
                        </p>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>✦ AI 厲害在哪裡？</h4>
                          <p>
                            AI 最強的地方，就是很會把大量規則和細節快速整理出來。它可以在很短時間內，把牌面、位置、組合關係和你的問題放在一起看。<br/><br/>
                            它會依照同一套解讀架構，把牌面中重複出現的訊號、需要注意的地方和可能性整理得更清楚。
                          </p>
                        </div>

                        <div>
                          <h4 className="text-[#A38D6B] text-[15px] font-medium tracking-[0.1em] mb-2" style={{ fontFamily: 'Noto Serif TC, serif' }}>✦ 不是亂給答案，而是照規則分析</h4>
                          <p>AI 算命不是隨便丟一段話給你，而是依照牌義、牌陣邏輯和你的問題去整理分析。</p>
                          <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong className="font-medium">穩定：</strong>每次都照同一套邏輯整理，不會忽略基本規則。</li>
                            <li><strong className="font-medium">細心：</strong>可以同時檢查很多細節，減少漏看的機會。</li>
                            <li><strong className="font-medium">完整：</strong>會把明顯的線索、需要注意的地方和可能性一起整理出來。</li>
                          </ul>
                        </div>

                        <div className="bg-[#D1BE9B]/10 p-5 rounded-2xl border border-[#D1BE9B]/20 text-[#31353A]/80 mt-8 shadow-sm">
                          <div className="font-medium text-[#A38D6B] mb-2 flex items-center gap-2 text-[14px]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
                            <CatListening className="w-7 h-7" /> Mochi 的悄悄話：
                          </div>
                          <p className="text-[13px] leading-[2.2] tracking-wider italic" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            「在整理資料、比對規則、避免漏看這件事上，AI 真的很有優勢。<br/>
                            如果你想要的是穩定、完整、有依據的分析，AI 可以先幫你把牌面訊息整理成一個清楚的方向。」
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
                <p className="text-sm italic text-[#31353A]/54 tracking-[0.15em]"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  "The cards don't predict the future — they illuminate the present."
                </p>
                <p className="tarot-choice-pill mt-5">
                  我們提供兩種塔羅占卜方式 ✦
                </p>
              </div>

              <div className="tarot-choice-grid">
                <article
                  className="tarot-choice-card tarot-choice-card--free"
                  onPointerMove={handleTarotChoiceMove}
                  onPointerLeave={handleTarotChoiceLeave}
                  style={{
                    '--choice-rx': '0deg',
                    '--choice-ry': '0deg',
                    '--choice-mx': '50%',
                    '--choice-my': '50%',
                  } as CSSProperties}
                >
                  <span className="tarot-choice-badge tarot-choice-layer" style={{ '--choice-z': '50px' } as CSSProperties}>
                    免費
                  </span>
                  <p className="tarot-choice-eyebrow tarot-choice-layer" style={{ '--choice-z': '30px' } as CSSProperties}>
                    FREE AI TAROT
                  </p>
                  <h2 className="tarot-choice-title tarot-choice-layer" style={{ '--choice-z': '42px' } as CSSProperties}>
                    AI 免費塔羅占卜
                  </h2>
                  <div className="tarot-choice-mochi-visual tarot-choice-layer" style={{ '--choice-z': '24px' } as CSSProperties}>
                    <img
                      src="/tarot-mochi-cards.png"
                      alt="Mochi 拿著塔羅牌"
                      className="tarot-choice-mochi-main"
                    />
                    <p className="tarot-choice-mochi-caption">讓 Mochi 來幫你把打結的毛球打開</p>
                  </div>
                  <div className="tarot-choice-ai-proof tarot-choice-layer" style={{ '--choice-z': '18px' } as CSSProperties}>
                    <div className="tarot-choice-ai-proof-card" data-mark="✦">
                      <h3>免費即時，不用預約</h3>
                      <p>想知道答案時，現在就能開始抽牌。</p>
                    </div>
                    <div className="tarot-choice-ai-proof-card" data-mark="◇">
                      <h3>先看感情、事業與目前走向</h3>
                      <p>適合想知道對方想法、曖昧關係、復合機會、工作選擇、事業方向與下一步的人。</p>
                    </div>
                    <div className="tarot-choice-ai-proof-card" data-mark="☽">
                      <h3>一次整理大量牌面資訊</h3>
                      <p>AI 會同時分析牌義、正逆位、牌陣位置與牌面之間的連動，幫你看見容易忽略的訊號。</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('question')}
                    className="tarot-choice-cta tarot-choice-layer mt-auto"
                    style={{ '--choice-z': '26px' } as CSSProperties}
                  >
                    開始免費 AI 塔羅
                  </button>
                </article>

                <article
                  className="tarot-choice-card tarot-choice-card--human"
                  onPointerMove={handleTarotChoiceMove}
                  onPointerLeave={handleTarotChoiceLeave}
                  style={{
                    '--choice-rx': '0deg',
                    '--choice-ry': '0deg',
                    '--choice-mx': '50%',
                    '--choice-my': '50%',
                  } as CSSProperties}
                >
                  <span className="tarot-choice-badge tarot-choice-layer" style={{ '--choice-z': '50px' } as CSSProperties}>
                    付費
                  </span>
                  <p className="tarot-choice-eyebrow tarot-choice-layer" style={{ '--choice-z': '30px' } as CSSProperties}>
                    HUMAN TAROT
                  </p>
                  <h2 className="tarot-choice-title tarot-choice-layer" style={{ '--choice-z': '42px' } as CSSProperties}>
                    真人塔羅占卜
                  </h2>

                  <div className="tarot-choice-human-visual tarot-choice-layer" style={{ '--choice-z': '24px' } as CSSProperties}>
                    <img
                      src="/tarot-mochi.png"
                      alt="Mochi 戴著塔羅牌"
                      className="tarot-choice-human-mochi"
                    />
                    <p className="tarot-choice-human-caption">
                      30 分鐘問到飽
                      <strong>NT$500</strong>
                      單題解讀
                      <strong>NT$300</strong>
                    </p>
                  </div>

                  <ul className="tarot-choice-list tarot-choice-layer" style={{ '--choice-z': '18px' } as CSSProperties}>
                    <li>
                      師承白中道博士，30 年占卜經驗
                      <Link href="/tarot/teacher" className="tarot-choice-inline-link">
                        塔羅師資歷 →
                      </Link>
                    </li>
                    <li>一對一視訊深度解析</li>
                    <li>
                      以靈性感知，感受牌的能量流動，讀出更貼近個人處境的訊息
                      <Link href="/tarot/reviews" className="tarot-choice-inline-link">
                        顧客好評 →
                      </Link>
                    </li>
                  </ul>

                  <a
                    href={OFFICIAL_LINE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="tarot-choice-cta tarot-choice-layer mt-auto"
                    style={{ '--choice-z': '26px' } as CSSProperties}
                  >
                    LINE 諮詢真人塔羅
                  </a>
                </article>
              </div>

              </div>
            </div>
          )}

          {/* ── QUESTION ───────────────────────────────────────────────────── */}
          {step === 'question' && (
            <div className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="text-center mb-10">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 1
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  設定你的問題
                </h2>
                <p className="mt-2 text-[12px] text-[#31353A]/58 tracking-wider leading-[1.9]"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  先從常用題組開始，或直接寫下你自己的問題。
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20">
                <div className="mb-5 rounded-2xl border border-[#D1BE9B]/18 bg-[#FFFDF8]/62 px-5 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[12px] tracking-[0.22em] text-[#8A7250]"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                        AI 免費塔羅占卜
                      </p>
                      <p className="mt-1 text-[11px] leading-[1.8] tracking-[0.08em] text-[#31353A]/55"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        24 小時即時回覆，免費先看方向。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('intro')}
                      className="self-start rounded-full border border-[#D1BE9B]/30 bg-white/60 px-4 py-2 text-[11px] tracking-[0.16em] text-[#8A7250] transition-all duration-300 hover:bg-white sm:self-center"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                    >
                      重新選擇
                    </button>
                  </div>
                </div>

                {renderPopularQuestions()}

                {/* Question input */}
                <div className="mb-6 mt-6">
                  <label className="block text-[11px] tracking-[0.25em] text-[#D1BE9B] mb-3"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    你的問題
                  </label>
                  <textarea
                    ref={questionInputRef}
                    value={question}
                    onChange={e => setQuestion(e.target.value.slice(0, 300))}
                    maxLength={300}
                    placeholder="例如：我跟他還有機會嗎？&#10;例如：我現在適合換工作嗎？"
                    rows={3}
                    className="w-full bg-white/50 border border-[#D1BE9B]/25 rounded-xl px-4 py-3 text-xs text-[#31353A]/80 tracking-wider leading-[1.9] resize-none focus:outline-none focus:border-[#D1BE9B]/50 placeholder:text-[#31353A]/46"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                  />
                  <div className="mt-1 text-right text-[10px] tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif', color: question.length >= 300 ? '#C9837A' : question.length >= 250 ? '#A38D6B' : '#31353A66' }}>
                    {question.length} / 300
                  </div>
                  <p className="mt-2 text-[11px] text-[#31353A]/50 tracking-wider"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    ✦ 問題越具體，解讀越精準。也可以不填，讓牌自由說話。
                  </p>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  帶著這個問題抽牌
                </button>

                {creditsQuery.data?.enabled && (
                  <p className="mt-4 text-center text-[11px] leading-[1.8] tracking-[0.12em] text-[#31353A]/45"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    每天免費 2 次，00:00 重置；用完後完整解讀消耗 1 點。
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── SHUFFLE ────────────────────────────────────────────────────── */}
          {step === 'shuffle' && (
            <div className="text-center animate-fade-in-up">
              <div className="mb-8">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 2
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  洗牌
                </h2>
                <p className="mt-2 text-[15px] text-[#31353A]/58 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200, fontSize: '15px' }}>
                  {isShufflingActive ? '牌正在流動中，心裡默念你的問題；感覺到了就停下' : '深呼吸三次，把問題放在心裡，準備好後開始洗牌'}
                </p>
              </div>

              {/* Shuffling card animation */}
              <div className="relative flex justify-center items-center mb-12" style={{ height: '220px' }}>
                <div className={`absolute w-52 h-52 rounded-full border border-[#D1BE9B]/18 transition-all duration-700 ${
                  isShufflingActive ? 'scale-110 opacity-100 shadow-[0_0_42px_rgba(209,190,155,0.20)]' : 'scale-95 opacity-50'
                }`} />
                <div className="absolute w-32 h-32 rounded-full bg-[#D1BE9B]/8 blur-2xl" />
                {Array.from({ length: 9 }).map((_, i) => {
                  return (
                    <div
                      key={i}
                      className={`tarot-shuffle-card absolute w-[66px] h-[110px] md:w-[74px] md:h-[123px] drop-shadow-[0_12px_18px_rgba(49,53,58,0.24)] ${
                        isShufflingActive ? 'tarot-shuffle-card--active' : ''
                      }`}
                      style={{
                        '--tarot-idle-x': `${(i - 4) * 18}px`,
                        '--tarot-idle-y': `${Math.abs(i - 4) * 5}px`,
                        '--tarot-idle-rot': `${(i - 4) * 6}deg`,
                        '--tarot-shuffle-delay': `${i * -0.13}s`,
                        zIndex: i,
                        opacity: isShufflingActive ? 0.72 + (i % 3) * 0.1 : 1,
                      } as CSSProperties}
                    >
                      <CardBack />
                    </div>
                  );
                })}
              </div>

              {/* Shuffle cat */}
              <div className="flex justify-center mt-6 mb-4">
                {isShufflingActive ? (
                  <div className="flex flex-col items-center gap-1">
                    <CatWaving className="w-16 h-20" />
                    <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Mochi 在幫你洗牌 ♡</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <CatListening className="w-14 h-18" />
                    <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>Mochi 在等你 ✦</span>
                  </div>
                )}
              </div>

              {!isShufflingActive ? (
                <button
                  onClick={handleStartShuffle}
                  className="px-10 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  開始洗牌
                </button>
              ) : (
                <button
                  onClick={handleStopShuffle}
                  className="px-10 py-3 text-xs tracking-[0.25em] bg-[#D1BE9B] text-[#31353A] rounded-full hover:bg-[#3D4144] hover:text-[#FAF7F4] transition-all duration-500 active:scale-95 animate-pulse"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                  停止洗牌，選牌
                </button>
              )}
            </div>
          )}

          {/* ── PICK ───────────────────────────────────────────────────────── */}
          {step === 'pick' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Step 3
                </span>
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  選出你的五張牌
                </h2>
                <p className="mt-3 text-[12px] text-[#31353A]/58 tracking-wider"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  憑直覺選 5 張，不用想太久
                </p>

                {/* 位置進度：讓使用者知道每一張代表哪個位置 */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {SPREAD_POSITIONS.map((p, i) => {
                    const done = i < pickedIndices.length;
                    const current = i === pickedIndices.length;
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] tracking-[0.15em] transition-all duration-300 ${
                          done
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/15 text-[#A38D6B]'
                            : current
                            ? 'border-[#D1BE9B] bg-[#D1BE9B]/10 text-[#A38D6B] scale-110 shadow-[0_4px_14px_rgba(209,190,155,0.35)]'
                            : 'border-[#D1BE9B]/20 text-[#31353A]/50'
                        }`}
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          done ? 'bg-[#D1BE9B] text-white' : current ? 'bg-[#D1BE9B]/50 text-white' : 'bg-[#D1BE9B]/15 text-[#31353A]/54'
                        }`}>
                          {done ? '✓' : i + 1}
                        </span>
                        {p.label}
                      </div>
                    );
                  })}
                </div>

                {/* 目前要選的牌代表什麼 */}
                {pickedIndices.length < 5 ? (
                  <div className="mt-4 inline-block px-5 py-2.5 rounded-2xl bg-[#D1BE9B]/8 border border-[#D1BE9B]/20">
                    <p className="text-[12px] tracking-[0.15em] text-[#A38D6B]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      🐾 第 {pickedIndices.length + 1} 張 · <span className="text-[#31353A]/86">{SPREAD_POSITIONS[pickedIndices.length].label}</span>
                    </p>
                    <p className="mt-1 text-[11px] leading-[1.7] text-[#31353A]/58 tracking-wider"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {SPREAD_POSITIONS[pickedIndices.length].desc}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-[12px] tracking-[0.2em] text-[#A38D6B] animate-pulse"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    🐾 五張牌都選好了，正在為你攤開牌陣…
                  </p>
                )}
              </div>

              {/* Card grid — full 78-card deck face down */}
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-[repeat(13,minmax(0,1fr))] gap-2.5 max-w-5xl mx-auto px-4">
                {shuffledDeck.map((_, deckIdx) => {
                  const pickOrder = pickedIndices.indexOf(deckIdx);
                  const isPicked = pickOrder !== -1;
                  return (
                    <div
                      key={deckIdx}
                      onClick={() => handlePickCard(deckIdx)}
                      className={`group relative cursor-pointer transition-all duration-300 ${
                        isPicked
                          ? 'opacity-95 scale-95 pointer-events-none'
                          : 'hover:scale-110 hover:-translate-y-2 hover:drop-shadow-[0_12px_26px_rgba(209,190,155,0.52)]'
                      }`}
                    >
                      <div
                        className="relative w-full aspect-[3/5] tarot-pick-float rounded-[11px]"
                        style={{ animationDelay: `${(deckIdx % 11) * 0.18}s` }}
                      >
                        <CardBack />
                        {!isPicked && (
                          <div className="pointer-events-none absolute inset-0 rounded-[11px] border border-[#F3E7CC]/0 transition-all duration-300 group-hover:border-[#F3E7CC]/80 group-hover:shadow-[0_0_0_3px_rgba(209,190,155,0.16)]" />
                        )}
                        {!isPicked && (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F8F0DC]/92 px-2.5 py-1 text-[10px] tracking-[0.16em] text-[#3D4144] opacity-0 shadow-[0_8px_18px_rgba(49,53,58,0.22)] transition-all duration-300 group-hover:opacity-100"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                            選這張
                          </div>
                        )}
                      </div>
                      {isPicked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[11px] border border-[#F3E7CC]/70 bg-[#31353A]/72 shadow-[0_0_0_3px_rgba(209,190,155,0.12)] backdrop-blur-[1px] animate-fade-in-up">
                          <span className="w-6 h-6 rounded-full bg-[#D1BE9B] text-white text-[11px] flex items-center justify-center shadow-[0_4px_12px_rgba(209,190,155,0.45)]">
                            {pickOrder + 1}
                          </span>
                          <span className="text-[11px] tracking-[0.1em] text-white/95 px-1 text-center leading-tight"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                            {SPREAD_POSITIONS[pickOrder]?.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cat reaction during pick */}
              <div className="flex justify-center mt-6 mb-2">
                <div className="flex flex-col items-center gap-1">
                  <CatWaving className="w-14 h-18" />
                  <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B]/50"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                    {pickedIndices.length === 0
                      ? '跟著直覺，選出第一張牌吧 🐾'
                      : pickedIndices.length < 5
                      ? `已選 ${pickedIndices.length} 張，接下來選「${SPREAD_POSITIONS[pickedIndices.length].label}」🐾`
                      : '五張都選好了，我很期待 ♡'}
                  </span>
                </div>
              </div>

              {pickedIndices.length > 0 && pickedIndices.length < 5 && (
                <p className="text-center mt-2 text-[11px] text-[#31353A]/50 tracking-wider animate-pulse"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  還需選 {5 - pickedIndices.length} 張牌
                </p>
              )}
            </div>
          )}

          {/* ── SPREAD ─────────────────────────────────────────────────────── */}
          {step === 'spread' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl tracking-[0.2em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  你抽到的牌
                </h2>
                {question && (
                  <p className="mt-2 text-xs italic text-[#31353A]/62 tracking-wider"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    「{question}」
                  </p>
                )}
              </div>

              {/* Mobile + Desktop responsive layout */}
              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">

                {/* ── Cards area ── */}
                <div className="w-full xl:flex-1 min-w-0">

                  {/* Mobile (< xl): horizontal scroll row */}
                  <div className="xl:hidden">
                    <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {drawnCards.map((_, idx) => (
                        <div key={idx} className="flex-shrink-0 snap-center flex flex-col items-center gap-2">
                          <span className="text-[11px] tracking-[0.15em] text-[#D1BE9B] whitespace-nowrap"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                            {SPREAD_POSITIONS[idx].label}
                          </span>
                          <CardSlot idx={idx} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                        </div>
                      ))}
                    </div>
                    <p className="text-center mt-1 text-[11px] text-[#31353A]/46 tracking-wider"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      ← 左右滑動查看全部牌面 →
                    </p>
                  </div>

                  {/* Desktop (≥ xl): tidy diamond layout — centre + 上下左右 */}
                  <div className="hidden xl:block">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-fit mx-auto place-items-center">
                      {/* Top centre */}
                      <div className="col-start-2 row-start-1 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[1].label}</span>
                        <CardSlot idx={1} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Left */}
                      <div className="col-start-1 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[4].label}</span>
                        <CardSlot idx={4} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Centre */}
                      <div className="col-start-2 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#D1BE9B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>{SPREAD_POSITIONS[0].label}</span>
                        <CardSlot idx={0} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Right */}
                      <div className="col-start-3 row-start-2 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[2].label}</span>
                        <CardSlot idx={2} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                      {/* Bottom centre */}
                      <div className="col-start-2 row-start-3 flex flex-col items-center gap-1.5">
                        <span className="text-[11px] tracking-[0.2em] text-[#A38D6B]" style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>{SPREAD_POSITIONS[3].label}</span>
                        <CardSlot idx={3} drawnCards={drawnCards} revealedCards={revealedCards} onReveal={handleRevealCard} selectedCard={selectedCard} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── Card detail panel ── */}
                <div className="w-full xl:w-72 2xl:w-80 flex-shrink-0">
                  {selectedCard !== null && revealedCards.has(selectedCard) ? (
                    <CardDetailPanel
                      position={SPREAD_POSITIONS[selectedCard]}
                      drawn={drawnCards[selectedCard]}
                    />
                  ) : (
                    <div className="glass-panel rounded-2xl p-6 border border-[#D1BE9B]/15 text-center">
                      <div className="text-2xl mb-3 opacity-30">✦</div>
                      <p className="text-xs tracking-[0.15em] text-[#31353A]/50"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        點擊牌面<br />查看解讀
                      </p>
                    </div>
                  )}

                  {/* Reading button */}
                  {revealedCards.size >= 5 && (
                    <button
                      onClick={() => startReading()}
                      className="w-full mt-4 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      查看完整解讀
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

                    {/* ── READING ────────────────────────────────────────────────────── */}
          {step === 'reading' && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <span className="text-[11px] tracking-[0.4em] text-[#D1BE9B] uppercase"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  Your Reading
                </span>
                <h2 className="text-[15px] tracking-[0.14em] font-extralight text-[#31353A] mt-2"
                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                  完整解讀
                </h2>
              </div>

              {/* Cards summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                {drawnCards.map((drawn, idx) => (
                  <div key={idx} className="glass-panel rounded-xl p-3 border border-[#D1BE9B]/15 text-center">
                    <div className="text-[9px] tracking-[0.14em] text-[#D1BE9B] mb-1"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                      {SPREAD_POSITIONS[idx].label}
                    </div>
                    <div className="mx-auto mb-2 w-20 sm:w-24 aspect-[2/3]">
                      <CardFace card={drawn.card} reversed={drawn.reversed} />
                    </div>
                    <div className="text-[11px] tracking-[0.1em] text-[#31353A]/82"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {drawn.card.name}
                    </div>
                    {drawn.reversed && (
                      <div className="text-[10px] text-[#EAA8AC] mt-0.5"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
                        逆位
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI interpretation */}
              <div className="glass-panel rounded-2xl p-8 border border-[#D1BE9B]/20 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-[#D1BE9B]">✦</span>
                  <h3 className="text-[14px] tracking-[0.14em] text-[#31353A]/86"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    五牌陣星形解讀
                  </h3>
                </div>
                {question.trim() && (
                  <div className="mb-5 rounded-2xl border border-[#D1BE9B]/35 bg-[#FFFDF9] px-4 py-3 shadow-[0_8px_24px_rgba(209,190,155,0.12)]">
                    <p className="mb-1.5 text-[11px] tracking-[0.22em] text-[#8A7250]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                      你剛剛問的是：
                    </p>
                    <p className="text-[13px] leading-[1.9] tracking-[0.08em] text-[#31353A]/86"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 350 }}>
                      「{question.trim()}」
                    </p>
                  </div>
                )}
                {interpretMutation.isPending && (
                  <div ref={moodClawSectionRef} className="flex flex-col items-center justify-center py-8 gap-4">
                    <p className="text-xs tracking-[0.2em] text-[#31353A]/58"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      {tarotWaitingMessage}
                    </p>
                    <MoodClawMachine onPrizeCaught={setCaughtMoodPlushie} />
                  </div>
                )}
                {interpretMutation.isError && (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#EAA8AC] tracking-wider">解讀暫時無法取得，請稍後再試。</p>
                  </div>
                )}
                {llmInterpretation && (
                  <div ref={readingResultRef}>
                    <div className="prose max-w-none text-[16px] leading-[2.15] text-[#31353A]/80 tracking-wider
                      prose-headings:font-normal prose-headings:tracking-[0.08em] prose-headings:text-[#A38D6B]
                      prose-h1:text-[16px] prose-h1:font-medium prose-h1:mt-8 prose-h1:mb-2 prose-h1:pb-1 prose-h1:border-b prose-h1:border-[#D1BE9B]/25
                      prose-h2:text-[16px] prose-h2:font-medium prose-h2:mt-8 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-[#D1BE9B]/25
                      prose-h3:text-[15px] prose-h3:font-medium prose-h3:mt-8 prose-h3:mb-2 prose-h3:pb-1 prose-h3:border-b prose-h3:border-[#D1BE9B]/25
                      [&_h1]:!text-[16px] [&_h1]:!leading-[2.1] [&_h1]:!font-medium [&_h1]:!tracking-[0.08em] [&_h1]:!text-[#A38D6B] [&_h1]:!mt-8 [&_h1]:!mb-2 [&_h1]:!pb-1 [&_h1]:!border-b [&_h1]:!border-[#D1BE9B]/25
                      [&_h2]:!text-[16px] [&_h2]:!leading-[2.1] [&_h2]:!font-medium [&_h2]:!tracking-[0.08em] [&_h2]:!text-[#A38D6B] [&_h2]:!mt-8 [&_h2]:!mb-2 [&_h2]:!pb-1 [&_h2]:!border-b [&_h2]:!border-[#D1BE9B]/25
                      [&_h3]:!text-[15px] [&_h3]:!leading-[2.1] [&_h3]:!font-medium [&_h3]:!tracking-[0.08em] [&_h3]:!text-[#A38D6B] [&_h3]:!mt-8 [&_h3]:!mb-2 [&_h3]:!pb-1 [&_h3]:!border-b [&_h3]:!border-[#D1BE9B]/25
                      prose-p:my-3 prose-p:text-[#31353A]/80
                      [&_p]:!text-[16px]
                      prose-strong:text-[#31353A]/90 prose-strong:font-medium
                      prose-ul:my-1.5 prose-li:my-0.5 prose-li:marker:text-[#D1BE9B]"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      {caughtMoodPlushie && (
                        <p className="rounded-2xl border border-[#D1BE9B]/20 bg-[#FFFDF9]/75 px-4 py-3 text-[#6F5A3A]/82">
                          {getMoodPlushieOpening(caughtMoodPlushie, 'tarot')}
                        </p>
                      )}
                      <Streamdown>{llmInterpretation}</Streamdown>
                    </div>

                    {recommendedProducts.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-[#D1BE9B]/15">
                        <p className="text-[14px] tracking-[0.24em] text-[#6F5A3A] mb-3"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 500 }}>
                          ◎ Mochi 為你挑的今日商品
                        </p>
                        <div className="mb-4 rounded-2xl border border-[#D1BE9B]/15 bg-white/35 px-4 py-3">
                          <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/70"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                            根據你的牌面：{tarotRecommendationMessage}
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          {recommendedProducts.map((product, index) => (
                            <ProductCard
                              key={product.slug}
                              product={product}
                              context={tarotRecommendationMessage}
                              role={index === 0 ? 'primary' : 'secondary'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {llmInterpretation && (
                <div className="mb-8">
                  <div className="mb-4">
                    <h3 className="text-[18px] leading-[1.7] tracking-[0.14em] text-[#31353A]"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      針對結果還有問題嗎？
                    </h3>
                    <p className="mt-2 text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/62"
                      style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                      選一種方式繼續看下去。
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="glass-panel rounded-2xl border border-[#D1BE9B]/20 p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-[14px] tracking-[0.16em] text-[#8A7250]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                          Mochi 回覆
                        </p>
                        <span className="shrink-0 rounded-full border border-[#D1BE9B]/28 bg-white/55 px-3 py-1 text-[11px] tracking-[0.14em] text-[#8A7250]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          免費
                        </span>
                      </div>
                      <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/62"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        根據剛剛的牌面，免費補充回答一個追問。
                      </p>

                      <div className="mt-4">
                        <form onSubmit={handleFollowUpSubmit} className="flex flex-col gap-3">
                          <textarea
                            value={followUpQuestion}
                            onChange={(event) => setFollowUpQuestion(event.target.value.slice(0, 300))}
                            maxLength={300}
                            placeholder="例如：他現在還喜歡我嗎？我接下來該主動嗎？"
                            className="min-h-[82px] resize-none rounded-xl border border-[#D1BE9B]/20 bg-white/55 px-3.5 py-2.5 text-[12px] leading-[1.7] tracking-[0.06em] text-[#31353A]/80 outline-none transition-all duration-300 placeholder:text-[#31353A]/35 focus:border-[#D1BE9B]/55 focus:bg-white/75"
                            style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}
                          />
                          <div className="flex flex-col items-stretch gap-3">
                            <span className="text-[11px] tracking-[0.1em] text-[#31353A]/45"
                              style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                              {followUpQuestion.length}/300
                            </span>
                            <button
                              type="submit"
                              disabled={!followUpQuestion.trim() || followUpMutation.isPending}
                              className="w-full rounded-full bg-[#3D4144] px-6 py-3 text-[11px] tracking-[0.18em] text-[#FAF7F4] transition-all duration-300 hover:bg-[#D1BE9B] hover:text-[#31353A] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                              style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                            >
                              {followUpMutation.isPending
                                ? tarotFollowUpWaitingMessage
                                : '請 Mochi 回應'}
                            </button>
                          </div>
                        </form>
                      </div>

                      {followUpMutation.isError && (
                        <p className="mt-3 text-[12px] tracking-[0.08em] text-[#EAA8AC]"
                          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                          追問暫時無法送出，請稍後再試。
                        </p>
                      )}

                      {followUpExchanges.length > 0 && (
                        <div className="mt-5 flex flex-col gap-3">
                          {followUpExchanges.map((item, index) => (
                            <div key={`${index}-${item.question}`} className="rounded-2xl border border-[#D1BE9B]/18 bg-white/45 px-5 py-4">
                              <div className="mb-3 flex flex-col gap-1">
                                <p className="text-[11px] tracking-[0.24em] text-[#A38D6B]"
                                  style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                                  Mochi 的補充回應
                                </p>
                                <p className="text-[12px] leading-[1.8] tracking-[0.08em] text-[#31353A]/55"
                                  style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                  你的追問：{item.question}
                                </p>
                              </div>
                              <p className="text-[14.5px] leading-[2.1] tracking-[0.08em] text-[#31353A]/78 whitespace-pre-wrap"
                                style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                                {item.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#06C755]/22 bg-[#F7FFF9]/72 p-5 shadow-[0_14px_38px_rgba(38,115,69,0.07)] backdrop-blur-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-[#267345]">
                          <MessageCircle className="h-4 w-4" />
                          <p className="text-[14px] tracking-[0.16em]"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                            真人塔羅
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-[#06C755]/24 bg-white/70 px-3 py-1 text-[11px] tracking-[0.14em] text-[#267345]"
                          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                          付費
                        </span>
                      </div>
                      <p className="text-[12px] leading-[1.9] tracking-[0.08em] text-[#31353A]/66"
                        style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
                        真人塔羅師重新開牌，適合深入看關係走向、對方想法、下一步行動。
                      </p>
                      <p className="mt-3 text-[12px] tracking-[0.1em] text-[#267345]"
                        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 400 }}>
                        單題 NT$300｜30 分鐘問到飽 NT$500
                      </p>
                      <div className="mt-4 flex flex-col gap-3">
                        <a href={OFFICIAL_LINE_URL} target="_blank" rel="noreferrer">
                          <button
                            type="button"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-5 py-3 text-[11px] tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#05B84F] active:scale-95"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                          >
                            官方 LINE 諮詢預約
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </a>
                        <Link href="/tarot/teacher">
                          <button
                            type="button"
                            className="inline-flex w-full items-center justify-center rounded-full border border-[#267345]/25 bg-white/60 px-5 py-3 text-[11px] tracking-[0.16em] text-[#267345] transition-all duration-300 hover:bg-white active:scale-95"
                            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}
                          >
                            查看塔羅師資歷
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {llmInterpretation && (
                <ReadingFeedback
                  source="tarot"
                  context={question.trim() ? `問題：${question.trim()}` : '未填寫具體問題'}
                />
              )}

              {llmInterpretation && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setStep('intro');
                      setDrawnCards([]);
                      setRevealedCards(new Set());
                      setSelectedCard(null);
                      setQuestion('');
                      setFollowUpQuestion('');
                      setFollowUpExchanges([]);
                    }}
                    className="w-full sm:w-44 px-8 py-3 text-xs tracking-[0.25em] border border-[#3D4144]/15 rounded-full hover:bg-[#3D4144] hover:text-white transition-all duration-500 active:scale-95"
                    style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                    重新占卜
                  </button>
                  <Link href="/quiz" className="w-full sm:w-44">
                    <button className="w-full px-8 py-3 text-xs tracking-[0.25em] bg-[#3D4144] text-[#FAF7F4] rounded-full hover:bg-[#D1BE9B] hover:text-[#31353A] transition-all duration-500 active:scale-95"
                      style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
                      進行心理測驗 ✦
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CardSlot({
  idx, drawnCards, revealedCards, onReveal, selectedCard
}: {
  idx: number;
  drawnCards: ReturnType<typeof drawCards>;
  revealedCards: Set<number>;
  onReveal: (idx: number) => void;
  selectedCard: number | null;
}) {
  const revealed = revealedCards.has(idx);
  const isSelected = selectedCard === idx;
  const drawn = drawnCards[idx];

  return (
    <div
      className={`group relative w-28 h-40 cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-110 drop-shadow-[0_10px_28px_rgba(209,190,155,0.48)]' : 'hover:scale-105 hover:-translate-y-1'
      }`}
      onClick={() => onReveal(idx)}
      style={{ perspective: '600px' }}
    >
      <div className={`pointer-events-none absolute -inset-1 rounded-[14px] border transition-all duration-300 ${
        isSelected
          ? 'border-[#D1BE9B]/70 bg-[#D1BE9B]/10'
          : 'border-transparent group-hover:border-[#D1BE9B]/35'
      }`} />
      <div
        className="relative w-full h-full transition-all duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back */}
        <div className="absolute inset-0 rounded-[11px]" style={{ backfaceVisibility: 'hidden' }}>
          <CardBack />
        </div>
        {/* Front */}
        <div className="absolute inset-0 rounded-[11px] drop-shadow-[0_10px_24px_rgba(49,53,58,0.16)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {drawn && <CardFace card={drawn.card} reversed={drawn.reversed} />}
        </div>
      </div>
    </div>
  );
}

function CardDetailPanel({
  position, drawn
}: {
  position: typeof SPREAD_POSITIONS[0];
  drawn: ReturnType<typeof drawCards>[0];
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#D1BE9B]/20 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] tracking-[0.2em] px-2.5 py-1 rounded-full border border-[#D1BE9B]/30 text-[#D1BE9B]"
          style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
          {position.label}
        </span>
        {drawn.reversed && (
          <span className="text-[11px] tracking-[0.1em] text-[#EAA8AC]"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            逆位
          </span>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <div className="w-32 flex-shrink-0">
          <CardFace card={drawn.card} reversed={drawn.reversed} />
        </div>
        <div>
          <div className="text-xl mb-1 opacity-60">{drawn.card.symbol}</div>
          <h4 className="text-sm tracking-[0.15em] text-[#31353A]/86 mb-0.5"
            style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 300 }}>
            {drawn.card.name}
          </h4>
          <p className="text-[11px] italic text-[#D1BE9B] tracking-wider"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {drawn.card.en}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-[#31353A]/58 tracking-wider mb-3 leading-[1.8]"
        style={{ fontFamily: 'Noto Serif TC, serif', fontWeight: 200 }}>
        {position.desc}
      </p>

      <div className="border-t border-[#D1BE9B]/15 pt-3">
        <p className="text-[12px] leading-[1.9] text-[#31353A]/72 tracking-wider"
          style={{ fontFamily: 'Noto Sans TC, sans-serif', fontWeight: 300 }}>
          {drawn.reversed ? drawn.card.reversed : drawn.card.meaning}
        </p>
      </div>
    </div>
  );
}
