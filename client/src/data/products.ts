/**
 * SOUL EASE | Mochi．crystal — Product Catalogue
 * Hand-crafted healing pieces. Copy mostly transcribed from 商品功效.pdf.
 */

export type ProductBullet = { emoji: string; title: string; desc: string };

export interface Product {
  /** URL slug — also matches the folder under /products/<slug>/ */
  slug: string;
  name: string;
  subtitle: string;
  /** Poetic opening lines, separated by \n */
  tagline: string;
  /** Filter key (purpose-based). */
  category: string;
  /** Filter keys where this product should appear. First item should match category. */
  categories?: string[];
  /** 材質中文,顯示在卡片角落 */
  material: string;
  price: number;
  priceLabel?: string;
  href?: string;
  originalPrice: number | null;
  tag: string | null;
  /** Short, customer-facing fit cue for shop cards. */
  fitSummary: string;
  /** Gentle recommendation copy used after readings. */
  gentleRecommendation: string;
  /** Secondary recommendation copy when shown as a paired option. */
  pairingReason: string;
  /** Display zoom for product photos, keeping the image frame size unchanged. */
  imageZoom: number;
  /** Display fit for product photos. Defaults to cover. */
  imageFit?: 'cover' | 'contain';
  /** Display focus point for cropped product photos. */
  imagePosition: string;
  /** All photos under /products/<slug>/ */
  images: string[];
  /** Cover image (= images[0]). Kept so existing card code still works. */
  img: string;
  features: ProductBullet[];
  meanings: ProductBullet[];
  /** "適合這樣的你" 列表 */
  suitedFor: string[];
  /** 一段白話文的小故事,幾段組成,寫得貼近日常 */
  story?: string;
  /** "HealingPick 想對你說" 結尾 */
  closing: string;
}

const imgs = (slug: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/products/${slug}/${i + 1}.jpg`);

export const CUSTOM_BRACELET_RECOMMENDATION_PRODUCT: Product = {
  slug: 'custom-bracelet-general',
  name: '一般客製化手鍊',
  subtitle: 'Personalized Crystal Bracelet',
  tagline: '如果現有商品都只像靠近一點點,\n也可以把你的近期狀態做成一條專屬手鍊。',
  category: 'healing',
  categories: ['custom-bracelet', 'healing', 'protect', 'love', 'career', 'wealth', 'sleep', 'courage'],
  material: '依照需求客製搭配',
  price: 1580,
  priceLabel: 'NT$ 1,580 起',
  href: '/shop/custom-bracelet',
  originalPrice: null,
  tag: '客製款',
  fitSummary: '依照個人需求加強招財、招桃花、守護、勇氣、智慧或安放心緒等方向。',
  gentleRecommendation:
    '一般客製化手鍊適合想依照個人狀態、手圍、色系與能量需求,做出更貼近日常搭配的人。',
  pairingReason:
    '如果現有款式都只靠近一部分,客製化手鍊可以把你的近期狀態與偏好整理成更專屬的搭配。',
  imageZoom: 1,
  imageFit: 'cover',
  imagePosition: 'center center',
  images: ['/custom-bracelet/general/IMG_4832.PNG'],
  img: '/custom-bracelet/general/IMG_4832.PNG',
  features: [
    { emoji: '✨', title: '依需求客製', desc: '依照想加強的能量、色系、手圍與配戴偏好搭配。' },
    { emoji: '💎', title: '專屬水晶組合', desc: '把近期狀態整理成更貼近自己的水晶手鍊。' },
    { emoji: '🪄', title: '設計可討論', desc: '提供設計圖與修改空間,讓成品更接近你的想像。' },
  ],
  meanings: [
    { emoji: '✨', title: '專屬搭配', desc: '把個人狀態整理成招財、桃花、守護、勇氣或安放心緒等方向,再挑出適合的水晶角色。' },
    { emoji: '💎', title: '能量整合', desc: '把多個功效方向放進同一條手鍊,讓招財、桃花、守護或勇氣各有對應角色。' },
    { emoji: '🌙', title: '需求聚焦', desc: '依照想加強的主軸挑選水晶,避免功效方向太分散。' },
  ],
  suitedFor: [
    '想依照個人需求加強招財、招桃花、避小人、招貴人或勇氣方向',
    '想把多個功效方向整合在同一條手鍊裡,但希望主軸清楚不混亂',
    '想依照占卜結果或近期狀態,挑選更對應自己的水晶功效',
  ],
  story:
    '有時候,你需要的不是剛好某一款現成商品。\n\n而是一條把現在的狀態、喜歡的顏色、配戴習慣和想加強的能量都放進去的手鍊。\n\n客製化手鍊就是為這樣的時候準備的。',
  closing:
    '願這條客製手鍊,把這次解讀裡最重要的提醒,變成每天都能戴在身上的陪伴。 ✨',
};

export function getProductCategories(product: Product): string[] {
  return product.categories ?? [product.category];
}

export const PRODUCTS: Product[] = [
  // ── 測試商品 30 元 ───────────────────────────────────────────────────────
  {
    slug: 'test-product-1-twd',
    name: '測試商品 30 元',
    subtitle: 'Checkout Test Item',
    tagline: '這是一個測試用商品。\n用來確認購物車、結帳與訂單流程是否正常。',
    category: 'healing',
    categories: ['healing'],
    material: '測試用商品',
    price: 30,
    priceLabel: 'NT$ 30',
    originalPrice: null,
    tag: '測試用',
    fitSummary: '測試購物車與結帳流程使用',
    gentleRecommendation:
      '這是測試用商品,適合用來確認購物車、結帳與訂單流程是否能順利完成。',
    pairingReason:
      '這是測試用商品,可協助確認商品加入購物車與結帳流程。',
    imageZoom: 1.2,
    imagePosition: 'center center',
    images: ['/products/glimmer-fox/1.jpg'],
    img: '/products/glimmer-fox/1.jpg',
    features: [
      { emoji: '🧪', title: '流程測試', desc: '用來測試商品頁、購物車與結帳流程。' },
      { emoji: '💳', title: '低金額付款', desc: '價格設定為 30 元,方便進行付款與訂單測試。' },
    ],
    meanings: [
      { emoji: '🧪', title: '測試商品', desc: '此品項僅供測試,不代表實際出貨商品。' },
      { emoji: '✨', title: '流程確認', desc: '協助確認購買流程是否順暢。' },
    ],
    suitedFor: [
      '需要測試購物車加入商品',
      '需要測試結帳與訂單建立',
      '需要確認 30 元付款流程',
    ],
    story:
      '這是一個專門為測試準備的小商品。\n\n它不代表實際出貨品項,主要用來確認從商品頁、購物車到結帳送出訂單的流程。',
    closing:
      '測試完成後,可以安心把流程交給正式商品。 ✨',
  },

  // ── 微光守護狐 (茶晶琉璃) ─────────────────────────────────────────────────
  {
    slug: 'glimmer-fox',
    name: '微光守護狐',
    subtitle: 'Glimmer Guardian Fox',
    tagline: '有些力量,不是讓你發光。\n而是在你疲憊的時候,依然能穩穩接住你。',
    category: 'protect',
    categories: ['protect', 'healing', 'sleep'],
    material: '茶晶琉璃',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '微光守護狐主打守護界線、自我守護與安放心緒,適合想遠離消耗型人事物的人。',
    gentleRecommendation:
      '微光守護狐適合最近覺得容易被外界影響、想把界線感放回來,也想替桌邊或床頭放一份守護寓意的人。',
    pairingReason:
      '如果你想把安全感與自我守護再加強一點,微光守護狐會是比較溫柔、穩定的陪伴選擇。',
    imageZoom: 1.2,
    imagePosition: 'center center',
    images: imgs('glimmer-fox', 4),
    img: '/products/glimmer-fox/1.jpg',
    features: [
      { emoji: '🤎', title: '茶晶琉璃質感', desc: '溫潤透亮的茶晶色澤,在光線下散發低調而迷人的光彩。' },
      { emoji: '☁️', title: '九尾守護能量', desc: '帶來理性與清晰的能量,也寓意守護與內在力量。' },
      { emoji: '🌙', title: '靜心能量擺飾', desc: '適合放置於書桌、床頭、工作區或日常儀式角落。' },
      { emoji: '🎀', title: '儀式感小物', desc: '陪伴日常生活的每一個重要時刻。' },
    ],
    meanings: [
      { emoji: '🤎', title: '茶晶琉璃', desc: '在這款裡負責沉穩與落地感,適合想加強自我守護的人。' },
      { emoji: '☁️', title: '九尾狐', desc: '作為整體守護意象,帶來理性與清晰的能量,也寓意智慧與內在力量。' },
      { emoji: '🌙', title: '守護界線', desc: '把重點放在避開消耗型人事物,提醒你把該保持的距離穩穩站好。' },
      { emoji: '🦋', title: '安放心緒', desc: '在守護之外補上一份安定感,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🌷', title: '內在守護', desc: '加強自我守護與界線感,提醒自己不要被外界消耗牽著走。' },
    ],
    suitedFor: [
      '加強守護界線,遠離消耗型人事物',
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
      '適合想加強守護界線與自我守護寓意的人',
    ],
    story:
      '最近會不會常常覺得「我是不是不夠好」?\n其實你已經把自己活得很努力了。\n\n有一隻小狐狸,牠不發光,但會在夜裡靜靜陪你。你不需要每天都很厲害——有時候只是好好吃一頓飯、好好睡一覺,就已經很勇敢了。\n\n這隻茶晶色的微光守護狐,代表的是那種「不喧囂的力量」:不催促你變更好,只提醒你——你已經做得很好了。',
    closing:
      '不是每一天都要閃閃發亮。\n有時候,能夠好好休息、好好照顧自己,就已經很勇敢了。\n願這隻微光守護狐,在你需要力量的時候,安靜地陪伴著你。 🤎🌙☁️',
  },

  // ── 心願九尾狐 (幻彩琉璃) ─────────────────────────────────────────────────
  {
    slug: 'wish-fox',
    name: '心願九尾狐',
    subtitle: 'Wish-Keeper Nine-Tail Fox',
    tagline:
      '在光影流轉之間,收藏一份屬於自己的溫柔能量。\n九尾狐自古象徵智慧、魅力、幸運與守護,陪伴整理思緒與專注內在。',
    category: 'love',
    categories: ['love', 'protect'],
    material: '幻彩琉璃',
    price: 980,
    originalPrice: 1280,
    tag: null,
    fitSummary: '心願九尾狐把招桃花、好人緣與心願守護收進幻彩光裡,適合正在期待新緣分或新機會的人。',
    gentleRecommendation:
      '心願九尾狐適合想提升魅力、人緣與好運,或正在期待新緣分、新機會的人。',
    pairingReason:
      '如果你想讓桃花、人緣或心願能量更柔和地被看見,心願九尾狐會是一個可以考慮的小加強。',
    imageZoom: 1.2,
    imagePosition: 'center center',
    images: imgs('wish-fox', 8),
    img: '/products/wish-fox/1.jpg',
    features: [
      { emoji: '🌈', title: '幻彩琉璃工藝', desc: '不同角度呈現迷人的彩虹光澤,每一眼都能發現新的細節與美感。' },
      { emoji: '🦊', title: '九尾狐守護意象', desc: '帶來理性與清晰的能量,也象徵自信、魅力、好運與心願成真。' },
      { emoji: '🌷', title: '能量空間擺飾', desc: '為生活空間注入柔和氛圍,成為陪伴日常的小小能量夥伴。' },
      { emoji: '🎀', title: '精緻送禮首選', desc: '適合作為生日禮物、紀念禮物,或送給努力生活的自己。' },
    ],
    meanings: [
      { emoji: '🦊', title: '九尾狐', desc: '在這款裡是魅力與心願的主角,帶來理性與清晰的能量,也象徵自信與好運。' },
      { emoji: '♡', title: '招桃花', desc: '直接對應招桃花與好人緣,讓你的柔軟不是討好,而是自然被看見的吸引力。' },
      { emoji: '🌸', title: '好人緣', desc: '補足關係裡的親和感與善緣,適合想讓互動更舒服的人。' },
      { emoji: '🦋', title: '幸運能量', desc: '把桃花與心願往行動延伸,為自己增添一份勇敢前行的力量感。' },
      { emoji: '☁️', title: '魅力自信', desc: '寓意提升自信與個人魅力,讓你的好感度更自然被看見。' },
      { emoji: '🫧', title: '心願守護', desc: '寓意心願、好運與新的機會,適合正在期待新緣分或新目標的人。' },
    ],
    suitedFor: [
      '招桃花、提升人緣與個人魅力',
      '增加好感度與親和魅力,適合想吸引善緣的人',
      '招貴人與新機會,適合期待新的關係或合作',
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
    ],
    story:
      '據說,九尾狐會把你說出口的願望,一條一條尾巴收起來。\n\n不是替你完成,而是替你「記住」—— 你說過想做的事、想去的地方、想成為的人。\n等哪天你太忙、忘了當初的自己,牠會用尾巴輕輕拍你說:「嘿,你還有這個願望喔。」\n\n這隻幻彩琉璃的小狐狸,陪你把心願收得好好的,直到它們慢慢長大、成真。',
    closing:
      '你不需要變成別人喜歡的樣子。\n九尾狐的能量,不是追逐愛,而是找回自己的光。\n當你開始喜歡自己,適合的人、關係與機會,也會慢慢被吸引而來。\n願這隻幻彩靈狐陪伴你,在每一次迷惘與期待之間,依然相信自己的美好。 🦊🌈',
  },

  // ── 勇氣小貓 (虎眼石) ─────────────────────────────────────────────────────
  {
    slug: 'courage-cat',
    name: '勇氣小貓',
    subtitle: 'Courage Kitten',
    tagline: '有些時候,我們需要的不是更多答案。\n而是一點點相信自己的勇氣。',
    category: 'courage',
    categories: ['courage', 'career'],
    material: '虎眼石',
    price: 600,
    originalPrice: null,
    tag: null,
    fitSummary: '勇氣小貓像桌邊的一個小提醒,在你猶豫要不要開始時,為自己添一點自信與行動力。',
    gentleRecommendation:
      '勇氣小貓適合正在準備開始、需要多一點信心,或想把想法慢慢落到行動上的人。',
    pairingReason:
      '如果你想把想法慢慢落到行動上，勇氣小貓會更像一個提醒你先踏出一小步的陪伴。',
    imageZoom: 1.24,
    imagePosition: 'center center',
    images: imgs('courage-cat', 6),
    img: '/products/courage-cat/1.jpg',
    features: [
      { emoji: '🐾', title: '天然虎眼石雕刻', desc: '保留天然礦石紋理,每一隻都有獨一無二的光澤與花紋。' },
      { emoji: '🤎', title: '溫暖守護能量', desc: '為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
      { emoji: '☁️', title: '日常能量擺飾', desc: '適合放在書桌、床頭、工作空間或閱讀角落。' },
      { emoji: '🎀', title: '可愛收藏小物', desc: '精緻小巧,無論送禮或自用都充滿儀式感。' },
    ],
    meanings: [
      { emoji: '🤎', title: '虎眼石', desc: '在這款裡負責勇氣主軸,為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
      { emoji: '🌷', title: '行動力', desc: '增強行動力,適合想推進目標、開始計畫或突破停滯的人。' },
      { emoji: '☁️', title: '安放心緒', desc: '替勇氣補上一點緩衝,在想太多或猶豫時提醒自己先停一下,再回到可以前進的節奏。' },
      { emoji: '🍀', title: '好運能量', desc: '寓意好運與新機會,適合準備展開新行動的人。' },
      { emoji: '🤍', title: '堅定自信', desc: '寓意堅定、自信與行動力,提醒自己不用低估內在力量。' },
    ],
    suitedFor: [
      '為自己增添一份勇敢前行的力量感',
      '提升自信與行動力,適合準備開始新計畫的人',
      '寓意堅定、自信與行動力,適合想突破猶豫的人',
      '象徵安定與柔和,在猶豫時提醒自己先停一下再行動',
    ],
    story:
      '有時候我們缺的不是答案,是「按下開始」的那一秒鐘。\n\n你有看過小貓跳上桌子的樣子嗎?牠會先蹲下來、晃一下尾巴、深呼吸,然後才跳。\n那一秒鐘的猶豫,其實是牠在累積跳得過去的力氣。\n\n這隻虎眼石小貓,是來陪你做那個「深呼吸」的。\n不用一次變得很勇敢,只要願意再往前一步,就足夠了。',
    closing:
      '你不需要一次變得很勇敢。\n有時候,只是願意再往前一步,就已經很了不起了。\n願這隻勇氣小貓陪伴著你,在每一次猶豫與不安之中,依然相信自己的力量。 🐾🤎',
  },

  // ── 願望小兔 (白水晶) ─────────────────────────────────────────────────────
  {
    slug: 'wish-bunny',
    name: '願望小兔',
    subtitle: 'Wishful Bunny',
    tagline: '有些願望,不需要急著實現。\n只要一直相信,它就會慢慢朝你走來。',
    category: 'healing',
    categories: ['healing', 'courage', 'sleep'],
    material: '白水晶',
    price: 660,
    originalPrice: null,
    tag: null,
    fitSummary: '願望小兔適合心裡有小小期待的人,把好運、新開始與還沒說出口的願望溫柔收好。',
    gentleRecommendation:
      '願望小兔適合心裡有期待、正在準備新的計畫,或想替生活放一份好運寓意的人。',
    pairingReason:
      '如果你想替心裡那個還沒說出口的願望留一個位置，願望小兔會是很輕柔的加強選擇。',
    imageZoom: 1.22,
    imagePosition: 'center center',
    images: imgs('wish-bunny', 5),
    img: '/products/wish-bunny/1.jpg',
    features: [
      { emoji: '🤍', title: '白水晶雕刻', desc: '溫潤透亮的質感,散發純淨柔和的光澤。' },
      { emoji: '🐰', title: '可愛兔兔造型', desc: '象徵希望、幸運與美好未來。' },
      { emoji: '☁️', title: '能量系擺飾', desc: '適合放在書桌、床頭、閱讀角落或工作空間。' },
      { emoji: '🎀', title: '儀式感小物', desc: '陪伴日常生活中的每個重要時刻。' },
    ],
    meanings: [
      { emoji: '🤍', title: '白水晶', desc: '在這款裡負責整理與聚焦,讓心願與新開始的方向更清楚。' },
      { emoji: '🌷', title: '新的開始', desc: '替新計畫放一份祝福,也為自己增添一份勇敢前行的力量感。' },
      { emoji: '☁️', title: '安放心緒', desc: '適合心裡有期待又不想太急的人,陪你讓心緒慢慢沉澱。' },
      { emoji: '🫧', title: '心願守護', desc: '把還沒說出口的小願望好好收著,提醒自己持續朝想去的方向靠近。' },
      { emoji: '🦋', title: '好運寓意', desc: '象徵好運與新的機會,適合想替新計畫加一份祝福的人。' },
    ],
    suitedFor: [
      '好運、新開始與心願守護',
      '適合正準備開始新計畫、新工作或新階段的人',
      '為自己增添一份勇敢前行的力量感',
      '整理思緒與專注目標,讓心願方向更清楚',
    ],
    story:
      '小時候許願都很大膽:「我想當太空人」、「我想吃糖吃到飽」。\n\n長大以後,願望變得很小聲—— 希望這週可以順順利利、希望重要的人都平安、希望自己還能對生活保有期待。\n\n願望變小,不代表你變沒夢想了。是你開始懂得「什麼真正重要」。\n\n這隻白水晶小兔,陪你把那些小小但珍貴的願望好好收著,讓你記得:你還是那個會許願的人。',
    closing:
      '長大的世界很忙。\n但別忘了,心裡還可以留一個位置,給夢想、給期待,也給那個依然相信美好的自己。\n願這隻願望小兔陪伴著你,在每一個平凡的日子裡,依然保有對幸福的想像。 🐰🤍',
  },

  // ── 靜心之光・白菘石柱 (白菘石) ───────────────────────────────────────────
  {
    slug: 'calm-light',
    name: '靜心之光・白菘石柱',
    subtitle: 'Selenite Calm Tower',
    tagline: '有些力量,不是讓你變得更快。\n而是提醒你,慢下來也沒關係。',
    category: 'sleep',
    categories: ['sleep', 'healing'],
    material: '白菘石',
    price: 430,
    originalPrice: null,
    tag: null,
    fitSummary: '靜心之光主打整理思緒、專注內在與安放心緒,適合想讓節奏慢慢沉澱的人。',
    gentleRecommendation:
      '靜心之光適合最近思緒太滿、想替書桌或床邊留一個安靜角落的人。',
    pairingReason:
      '如果你想把心緒和節奏再整理清楚一點，靜心之光會是適合放在桌邊或床邊的小提醒。',
    imageZoom: 1.18,
    imagePosition: 'center center',
    images: imgs('calm-light', 8),
    img: '/products/calm-light/1.jpg',
    features: [
      { emoji: '☁️', title: '天然白菘石', desc: '保留獨特天然紋理,每一顆皆擁有專屬的美麗印記。' },
      { emoji: '🤍', title: '清透白色能量', desc: '柔和純淨的色澤,為空間增添平靜氛圍。' },
      { emoji: '🫧', title: '柱形能量設計', desc: '象徵專注、穩定與內在力量的凝聚。' },
      { emoji: '🎀', title: '儀式感擺飾', desc: '適合放置於床頭、書桌、閱讀角落或安靜小角落。' },
    ],
    meanings: [
      { emoji: '🤍', title: '白菘石', desc: '在這款裡負責留白與整理思緒,適合腦中聲音很多、想讓空間安靜一點的時候。' },
      { emoji: '☁️', title: '安放心緒', desc: '象徵安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🌙', title: '放慢節奏', desc: '帶來安定感的擺放寓意,適合想讓節奏慢慢沉澱的人。' },
      { emoji: '🫧', title: '專注內在', desc: '帶來理性與清晰的能量,有助於整理思緒與專注內在。' },
      { emoji: '🌷', title: '自我照顧', desc: '練習照顧自己的心緒與感受,不急著把所有事情一次處理完。' },
    ],
    suitedFor: [
      '整理思緒,適合腦中資訊很多、想讓方向變清楚的人',
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '帶來安定感的擺放寓意,提醒自己放慢節奏',
    ],
    story:
      '你今天有沒有,連自己有沒有好好呼吸都沒注意到?\n\n這顆白菘石柱不會幫你解決任何事。\n但它會在你坐回書桌、又準備開始下一件事之前,提醒你:\n「先停 30 秒。」\n\n不是叫你別努力,是叫你別忘了——\n努力的人,也要好好活著。\n它像一道很安靜的光,在你最緊繃的時候,陪你慢一拍。',
    closing:
      '世界總是催促我們快一點。\n但你不需要一直趕路。\n有時候,停下來休息、好好照顧自己的心,也是一種前進。\n願這顆白菘石陪伴著你,在每一個疲憊的日子裡,依然保有溫柔與平靜。 🤍☁️🌙',
  },

  // ── 月光守護之翼 (拉長石) ─────────────────────────────────────────────────
  {
    slug: 'moonlight-wings',
    name: '月光守護之翼',
    subtitle: 'Moonlight Guardian Wings',
    tagline: '有些答案,不在別人的聲音裡。\n而是在你願意靜下來傾聽自己的那一刻。',
    category: 'protect',
    categories: ['protect', 'courage'],
    material: '拉長石',
    price: 260,
    originalPrice: null,
    tag: null,
    fitSummary: '月光守護之翼把智慧、直覺與守護方向戴在身上,適合正在確認下一步的人。',
    gentleRecommendation:
      '月光守護之翼適合正在確認下一步、想整理思緒,或想重新相信自己直覺的人。',
    pairingReason:
      '如果你想把直覺與方向感再打開一點，月光守護之翼會是比較輕盈的加強陪伴。',
    imageZoom: 1.26,
    imagePosition: 'center center',
    images: imgs('moonlight-wings', 3),
    img: '/products/moonlight-wings/1.jpg',
    features: [
      { emoji: '☽', title: '拉長石天然光澤', desc: '在光線下展現夢幻藍光,每個角度都有不同魅力。' },
      { emoji: '🪽', title: '羽翼守護設計', desc: '象徵陪伴與守護,也為自己增添一份勇敢前行的力量感。' },
      { emoji: '✨', title: '星月元素', desc: '代表希望、願望與宇宙的祝福。' },
      { emoji: '🎀', title: '日常穿搭能量飾品', desc: '適合日常佩戴或作為儀式感配件收藏。' },
    ],
    meanings: [
      { emoji: '☁️', title: '拉長石', desc: '在這款裡負責智慧與方向感,帶來理性與清晰的能量,有助於整理思緒與專注內在。' },
      { emoji: '🌙', title: '直覺提醒', desc: '替拉長石的智慧能量補上內在聆聽,當外界意見很多時,提醒你先安靜聽見自己真正的想法。' },
      { emoji: '🦋', title: '靈感與創造力', desc: '把方向感延伸成新的想法與可能性,適合正在確認下一步的人。' },
      { emoji: '🤍', title: '羽翼守護', desc: '把智慧與勇氣連在一起,寓意守護方向與勇敢前行的力量感。' },
      { emoji: '✨', title: '願望與希望', desc: '把守護與方向感收在星月意象裡,在迷惘時提醒自己仍然可以相信未來。' },
    ],
    suitedFor: [
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
      '加強智慧、直覺與方向感,適合正在確認下一步的人',
      '為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力',
      '寓意守護方向,提醒自己在選擇裡保持清楚',
    ],
    story:
      '你是不是常常,問別人意見問到最後,反而更迷茫?\n\n其實你心裡早就有答案了,只是不敢相信自己。\n\n拉長石在不同角度,會閃出不一樣的藍光。就像直覺—— 不一定每次都看得清楚,但它一直都在。\n\n這對小翅膀,是來提醒你:\n你不是沒有方向,你只是太久沒聽自己說話了。',
    closing:
      '有時候,你不是找不到答案。\n只是太習慣向外尋找。\n當你願意相信自己的直覺,很多事情其實早已有了方向。\n願這對守護之翼陪伴著你,在每一次選擇與迷惘之間,依然勇敢地相信自己。 🪽☽✨',
  },

  // ── 財運礦 ────────────────────────────────────────────────────────────────
  {
    slug: 'wealth-stone',
    name: '財運礦',
    subtitle: 'Abundance Cluster',
    tagline: '財富不只是一個數字,\n是你願意相信「自己值得更多」的那份篤定。',
    category: 'wealth',
    categories: ['wealth', 'career', 'courage'],
    material: '天然礦石',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '財運礦把招財、聚財與接住機會的寓意放進空間裡,適合替工作、店面或新計畫開一個好頭。',
    gentleRecommendation:
      '財運礦適合正在整理金錢目標、經營事業、副業或想替空間放一份招財寓意的人。',
    pairingReason:
      '如果你想把工作、金錢與自我價值的能量再聚焦一點，財運礦會是比較有行動感的加強選擇。',
    imageZoom: 1.16,
    imagePosition: 'center center',
    images: imgs('wealth-stone', 8),
    img: '/products/wealth-stone/1.jpg',
    features: [
      { emoji: '💛', title: '天然礦石原貌', desc: '保留礦體最自然的紋理與結晶,擺著就像一塊小小的能量場。' },
      { emoji: '✨', title: '聚財氣場設計', desc: '叢聚的結晶象徵能量凝聚,有「招進來、留得住」的寓意。' },
      { emoji: '🏠', title: '居家招財擺件', desc: '適合放在客廳財位、辦公桌、收銀台或玄關。' },
      { emoji: '🎀', title: '儀式感入手', desc: '搬新家、開新店、新的職涯起點都很適合。' },
    ],
    meanings: [
      { emoji: '💰', title: '招財納福', desc: '這款主打招財、聚財與豐盛機會,適合放在辦公桌、玄關或收銀台,替工作與金錢目標放一個明確提醒。' },
      { emoji: '🌟', title: '招貴人', desc: '不只看財氣,也把新的合作、客戶與善緣貴人一起放進寓意裡。' },
      { emoji: '🛡️', title: '守住財氣', desc: '招進來之外也要留得住,提醒自己把資源穩穩留下,不被一時衝動帶著走。' },
      { emoji: '💼', title: '事業累積', desc: '把財運連到實際工作成果,適合正在經營專案、副業或長期目標的人。' },
      { emoji: '☀️', title: '自信行動', desc: '讓招財不只停在等待,也為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
    ],
    suitedFor: [
      '正在開始新工作、新事業或新階段,想用招財寓意替自己開一個好頭',
      '希望加強招財、聚財與招貴人,也提醒自己把機會接住、把資源留下',
      '有店面、辦公桌、工作區或玄關想放一件有財運象徵的天然礦石',
      '適合創業、轉職、副業或正在累積收入目標的人',
    ],
    story:
      '有人說財運是運氣,其實更像「你願不願意相信自己值得」。\n\n有時候機會就在眼前,你卻覺得「應該是別人的」、「我不配」。\n\n這塊礦石擺在桌上,不是真的會讓錢從天上掉下來。\n而是每次你看到它,會被輕輕提醒:\n\n「你做的每一件小事,都在替未來的自己存『運氣』。」\n能不能富足,從你開始相信自己值得,那一刻起算。',
    closing:
      '財富從來不是運氣。\n是你日復一日把自己照顧好、把該做的事做好,宇宙才能把該到你身邊的東西,慢慢送過來。\n願這塊財運礦陪你,把每一次努力都被好好看見。 💛✨',
  },

  // ── 森蘊 ────────────────────────────────────────────────────────────────
  {
    slug: 'forest-bloom',
    name: '森蘊',
    subtitle: 'Forest Verdure Bracelet',
    tagline: '綠色,是一種溫柔的力量。\n像森林的呼吸,讓人慢下來,也重新整理自己。',
    category: 'career',
    categories: ['career', 'wealth'],
    material: '葡萄石貔貅・綠髮晶・綠幽靈・白水晶',
    price: 1880,
    originalPrice: null,
    tag: null,
    fitSummary: '森蘊把招財、旺事業與招貴人的寓意收進一抹綠意裡,適合正在穩穩累積成果的人。',
    gentleRecommendation:
      '森蘊適合正在累積事業、經營收入、準備轉換階段,或希望身邊多一點好機會與貴人運的人。',
    pairingReason:
      '如果你想把財運、貴人與行動力再聚焦一點，森蘊會是溫柔但有累積感的手鍊陪伴。',
    imageZoom: 1.04,
    imagePosition: 'center bottom',
    images: imgs('forest-bloom', 5),
    img: '/products/forest-bloom/1.jpg',
    features: [
      { emoji: '🌿', title: '層層綠意主調', desc: '柔和綠意交織透明層次,像晨霧未散的林間光影。' },
      { emoji: '💚', title: '招財事業能量', desc: '對應招財、旺事業與招貴人的寓意。' },
      { emoji: '✨', title: '天然水晶錯落排列', desc: '溫潤礦石在光線下透出細緻光澤,低調卻富有層次。' },
      { emoji: '🎀', title: '日常配戴手鍊', desc: '適合工作、日常與需要穩定累積感的時刻配戴。' },
    ],
    meanings: [
      { emoji: '🌿', title: '葡萄石貔貅', desc: '在這條裡負責招財與守財主軸,適合想把機會接住、也把重要資源穩穩留下的人。' },
      { emoji: '🌱', title: '綠髮晶', desc: '替事業與財運補上行動力,為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
      { emoji: '🍃', title: '綠幽靈', desc: '負責長期累積與事業成長感,適合正在打造工作基礎、收入基礎的人。' },
      { emoji: '☁️', title: '葡萄石', desc: '在綠色財運裡補上一份安定與柔和,讓努力不只是衝,也能穩穩長出成果。' },
      { emoji: '🤍', title: '白水晶', desc: '負責統整整條手鍊,把招財、事業與招貴人的寓意整理得更集中。' },
    ],
    suitedFor: [
      '正在累積工作成果,想替自己加強招財、事業與招貴人的寓意',
      '有新的合作、轉職、副業或收入目標,希望把機會穩穩接住',
      '不想只靠衝勁前進,也想讓財運與人脈慢慢長出來',
      '招財、守財與招貴人,適合想穩定累積收入與人脈的人',
    ],
    story:
      '有些成長,不是突然發生的。\n\n它比較像森林裡的光,每天一點點穿過葉子,慢慢把路照亮。\n\n森蘊把層層綠意戴在手腕上,不是催你快一點成功,而是提醒你:穩定、累積、相信自己的節奏,也是一種很珍貴的力量。',
    closing:
      '願森蘊陪你在工作與生活之間,慢慢整理自己的步伐。\n把該來的機會收進來,把重要的人事物守住,也把心裡那片森林照顧好。 🌿',
  },

  // ── 靈狐星願 ────────────────────────────────────────────────────────────
  {
    slug: 'starwish-fox-bracelet',
    name: '靈狐星願',
    subtitle: 'Starwish Fox Bracelet',
    tagline: '手腕上的粉嫩小狐狸,\n像一顆藏著星光的小心願。',
    category: 'love',
    categories: ['love', 'wealth'],
    material: '狐仙・粉晶・月光石・白水晶・黃水晶',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '靈狐星願把招桃花、招財與好人緣戴得粉嫩又輕盈,適合想讓自己更柔和被看見的人。',
    gentleRecommendation:
      '靈狐星願適合想提升桃花、人緣、招財與貴人運,也希望讓自己更柔和地被看見的人。',
    pairingReason:
      '如果你想加強魅力、善緣與日常亮點，靈狐星願會把心願感戴得更輕盈。',
    imageZoom: 1.04,
    imagePosition: 'center bottom',
    images: imgs('starwish-fox-bracelet', 2),
    img: '/products/starwish-fox-bracelet/1.jpg',
    features: [
      { emoji: '🦊', title: '粉嫩狐仙主題', desc: '柔霧粉色在光下閃著細緻光澤,甜而不膩。' },
      { emoji: '✨', title: '星願小亮點', desc: '像在人群裡會讓人多看一眼的柔光。' },
      { emoji: '🌸', title: '桃花人緣寓意', desc: '對應桃花、招財與好人緣的日常配戴靈感。' },
      { emoji: '🎀', title: '甜感收藏手鍊', desc: '適合粉色系穿搭、約會、日常與溫柔收藏。' },
    ],
    meanings: [
      { emoji: '🦊', title: '狐仙', desc: '在這條裡是魅力主角,象徵自信與美好緣分,寓意招桃花、吸引善緣與貴人。' },
      { emoji: '🌸', title: '粉晶', desc: '負責招桃花與人緣主軸,讓柔軟變成自然的吸引力,也讓好感度更容易被看見。' },
      { emoji: '🌷', title: '馬粉晶', desc: '用更暖的粉色補足甜感,讓整條手鍊更靠近約會、人緣與溫柔表達。' },
      { emoji: '🌙', title: '奶油月光石與藍月光石', desc: '在甜感之外補上安定與柔和,讓關係互動多一點溫柔節奏。' },
      { emoji: '🤍', title: '白水晶與黃水晶', desc: '白水晶負責調和整體,黃水晶補上招財與自信光芒,讓桃花與財運都能被帶到。' },
    ],
    suitedFor: [
      '想招桃花、提升好人緣與個人吸引力,但希望整體是柔和自然的靠近',
      '除了感情與人緣,也想把招財、貴人與善緣寓意一起戴在身上',
      '招桃花、提升好人緣與親和魅力',
      '招財與招貴人,適合想同時加強善緣與財運的人',
    ],
    story:
      '有時候,你想要的不是很大的幸運。\n\n只是希望自己被溫柔看見,希望遇到舒服的人,也希望心裡那個小願望不要被忙碌弄丟。\n\n靈狐星願像手腕上的小狐狸,把可愛、細膩與一點點浪漫,悄悄替你收好。',
    closing:
      '願靈狐星願陪你把自信戴回身上。\n不用張揚,也可以很有光;不用用力追逐,美好的緣分也會慢慢靠近。 🦊✨',
  },

  // ── 霧裡星光 ────────────────────────────────────────────────────────────
  {
    slug: 'misty-starlight',
    name: '霧裡星光',
    subtitle: 'Misty Starlight Bracelet',
    tagline: '柔軟、純淨、被溫柔守護。\n願每一次配戴,都像月光輕輕落在手腕上。',
    category: 'love',
    categories: ['love', 'protect', 'healing'],
    material: '粉晶・草莓晶・白水晶・藍月光・拉長石',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '霧裡星光主打招桃花、人緣、守護界線與理性清晰,適合想加強關係能量的人。',
    gentleRecommendation:
      '霧裡星光適合想提升桃花、人緣與關係互動,也希望在日常配戴裡保有溫柔守護感的人。',
    pairingReason:
      '如果你想讓感情、人際與自我陪伴都更柔和一點,霧裡星光會是氣質、日常又有守護感的搭配。',
    imageZoom: 1.04,
    imagePosition: 'center bottom',
    images: imgs('misty-starlight', 3),
    img: '/products/misty-starlight/1.jpg',
    features: [
      { emoji: '🌙', title: '柔光氣質款', desc: '粉晶與草莓晶交織溫暖悸動,適合日常、約會與工作佩戴。' },
      { emoji: '🤍', title: '乾淨清透層次', desc: '白水晶帶來清澈純淨,藍月光映照內心平靜。' },
      { emoji: '✨', title: '勇氣與守護', desc: '拉長石為自己增添一份勇敢前行的力量感,在關係裡保有內在力量。' },
      { emoji: '🎀', title: '天然水晶手鍊', desc: '每一顆天然水晶都有獨一無二的紋理與色澤。' },
    ],
    meanings: [
      { emoji: '🤍', title: '粉晶', desc: '在這條裡負責招桃花與親和魅力,讓你的溫柔成為自然的吸引力。' },
      { emoji: '🍓', title: '草莓晶', desc: '補上好人緣與親和魅力,加強關係互動裡的好感度。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和桃花、人緣與守護方向,讓整體功效更集中。' },
      { emoji: '🌙', title: '藍月光', desc: '替桃花與人緣補上一份安定與柔和,提醒自己先停一下,再好好回應。' },
      { emoji: '✨', title: '拉長石', desc: '帶來理性與清晰的能量,有助於整理思緒與專注內在,讓桃花人緣也保有界線。' },
    ],
    suitedFor: [
      '想招桃花、提升感情與人際關係,但也希望自己在關係裡不要失去界線',
      '正在練習先好好愛自己,不想把所有期待都放在別人的回應上',
      '加強桃花、人緣與親和魅力',
      '帶來理性與清晰的能量,在關係裡保有界線與清楚感',
    ],
    story:
      '有些緣分,不是追來的。\n\n它比較像月光,在你願意先好好愛自己的時候,安靜地落到身邊。\n\n霧裡星光把粉晶、草莓晶、白水晶、藍月光與拉長石串在一起,提醒你在期待美好關係之前,也別忘了先把自己抱好。',
    closing:
      '先好好愛自己,美好的緣分自然會慢慢靠近。\n願霧裡星光陪你在每一次配戴時,都記得自己值得被溫柔守護。 🌙🤍',
  },

  // ── 2026 Drive import ───────────────────────────────────────────────────
  {
    slug: 'cheng-guang',
    name: '澄光',
    subtitle: 'Clear Titanium Glow Bracelet',
    tagline: '清澈,是一種力量。\n不是張揚,而是穩定地把光收回自己身上。',
    category: 'courage',
    categories: ['courage', 'career'],
    material: '淨體鈦晶',
    price: 4380,
    originalPrice: null,
    tag: null,
    fitSummary: '澄光適合想把方向看清楚再往前走的人,讓智慧、清晰思緒與勇氣行動一起被戴在手上。',
    gentleRecommendation:
      '澄光適合想把想法整理清楚、提升自信與行動力,或正在準備把目標往前推進的人。',
    pairingReason:
      '如果你想讓行動力更穩、思緒更清楚，澄光會是明亮但不張揚的加強。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('cheng-guang', 2),
    img: '/products/cheng-guang/1.jpg',
    features: [
      { emoji: '✨', title: '淨體鈦晶', desc: '透亮晶體裡帶著細緻金絲光澤,在光影之間低調閃耀。' },
      { emoji: '☀️', title: '清晰思緒', desc: '象徵理性與條理,幫助在混亂時整理想法。' },
      { emoji: '🌟', title: '提升行動力', desc: '為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
      { emoji: '🤍', title: '穩定氣場', desc: '淨體結構清透,常被視為穩定內在節奏的象徵。' },
    ],
    meanings: [
      { emoji: '✨', title: '淨體鈦晶', desc: '在這條裡負責智慧與行動主軸,帶來理性與清晰的能量,有助於整理思緒與專注內在。' },
      { emoji: '☀️', title: '清晰思緒', desc: '加強計畫、判斷與方向感,適合想把下一步看清楚的人。' },
      { emoji: '🌟', title: '行動力量', desc: '在清楚之後推你往前,為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力。' },
      { emoji: '🤍', title: '穩定氣場', desc: '讓明亮感不過度浮躁,提醒自己在忙碌裡先站穩。' },
    ],
    suitedFor: [
      '最近正在整理方向、計畫或下一步,想讓思緒變得更清楚',
      '希望提升行動力與自信,把已經想好的事真正往前推進',
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
      '為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力',
    ],
    story:
      '有些光不是為了被所有人看見。\n\n它比較像你心裡慢慢亮起的那盞燈:不吵、不急,卻能讓你看清楚下一步要往哪裡走。\n\n澄光把清透與金色細光戴在手腕上,提醒你在每一次選擇裡,都可以穩穩地相信自己。',
    closing:
      '願澄光陪你把思緒整理清楚,把步伐慢慢踏穩。\n光,自然會在細節裡顯現。 ✨',
  },
  {
    slug: 'guang-yu-zhi-jing',
    name: '光羽之境',
    subtitle: 'Feathered Light Custom Bracelet',
    tagline: '柔光流轉,如羽落晨曦。\n一抹金與白的交織,讓日常多一點閃耀的溫柔。',
    category: 'protect',
    categories: ['protect'],
    material: '黑金超七・月光石・白水晶・茶晶',
    price: 1880,
    priceLabel: 'NT$ 1,880',
    originalPrice: null,
    tag: null,
    fitSummary: '光羽之境主打避小人、守護界線、沉穩落地與安放心緒。',
    gentleRecommendation:
      '光羽之境適合想加強避小人、守護界線與沉穩感,也喜歡黑金與月光柔色搭配的人。',
    pairingReason:
      '如果你想要更貼近個人狀態的守護搭配,光羽之境會是可以私訊討論的客製方向。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: [
      '/products/guang-yu-zhi-jing/2.jpg',
      '/products/guang-yu-zhi-jing/1.jpg',
      '/products/guang-yu-zhi-jing/3.jpg',
      '/products/guang-yu-zhi-jing/4.jpg',
    ],
    img: '/products/guang-yu-zhi-jing/2.jpg',
    features: [
      { emoji: '🪽', title: '客製化設計', desc: '依照個人狀態與喜好搭配,每一條都有自己的光。' },
      { emoji: '🖤', title: '黑金超七', desc: '呈現深色礦絲交錯的層次,象徵沉穩與守護。' },
      { emoji: '🌙', title: '月光石光澤', desc: '細緻金屬與晶體間閃出柔和光感。' },
      { emoji: '☁️', title: '白水晶調和', desc: '讓整體能量更清透、平衡。' },
    ],
    meanings: [
      { emoji: '🖤', title: '黑金超七', desc: '在這條裡負責避小人與守護主軸,適合想遠離雜亂人事物、把注意力收回自己的人。' },
      { emoji: '🌙', title: '月光石', desc: '在深色守護裡補上一份柔和,提醒你遇到起伏時先停一下。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和避小人、守護與沉穩方向,讓整體功效更集中。' },
      { emoji: '🤎', title: '茶晶', desc: '補上沉穩與落地感,提醒自己把界線站穩,不要被外界拉走。' },
    ],
    suitedFor: [
      '工作或人際環境有點複雜,想加強避小人與守護界線的提醒',
      '容易被別人的情緒、話語或眼光影響,想把注意力收回自己',
      '避小人、守護界線,適合想遠離消耗型人事物的人',
      '象徵安定與柔和,在起伏時提醒自己先停一下',
    ],
    story:
      '每一顆晶石都像一個小小片段,記錄你正在走過的時刻。\n\n光羽之境不是一條制式答案,而是一段被慢慢整理出來的陪伴:把沉穩留下,把光戴上,讓你在日常裡多一點相信自己的力量。',
    closing:
      '願光羽之境陪你把柔軟與堅定放在一起。\n不是退讓,而是帶著光往前走。 🪽',
  },
  {
    slug: 'hu-yu-wei-tian',
    name: '狐語微甜',
    subtitle: 'Sweet Fox Whisper Bracelet',
    tagline: '有些溫柔,是輕輕的。\n像一隻小狐,在你耳邊說:你可以慢慢來。',
    category: 'love',
    categories: ['love', 'protect', 'sleep'],
    material: '白水晶・黃膠花・紅膠花・黃水晶・白瑪瑙',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '狐語微甜主打招桃花、人緣、親和魅力、招財與守護感。',
    gentleRecommendation:
      '狐語微甜適合想提升桃花、人緣與親和魅力,也想讓日常多一點甜感與守護寓意的人。',
    pairingReason:
      '如果你想讓日常多一點甜感、好人緣與安全感,狐語微甜會是很輕盈的搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/hu-yu-wei-tian/1.jpg', '/products/hu-yu-wei-tian/2.jpg'],
    img: '/products/hu-yu-wei-tian/1.jpg',
    features: [
      { emoji: '🦊', title: '狐仙小墜', desc: '以小狐意象帶出溫柔、魅力與守護感。' },
      { emoji: '🤍', title: '清透白水晶', desc: '包裹著細緻感受,讓心慢慢安定。' },
      { emoji: '💛', title: '黃膠花與黃水晶', desc: '帶來明亮、溫暖又不刺眼的光。' },
      { emoji: '🌸', title: '紅膠花點綴', desc: '增添柔和甜感,讓整體更有親和力。' },
    ],
    meanings: [
      { emoji: '🦊', title: '狐仙小墜', desc: '在這條裡是招桃花與魅力主角,象徵自信與美好緣分,也寓意吸引善緣與貴人。' },
      { emoji: '🤍', title: '白水晶', desc: '負責整理甜感與守護感,讓整條手鍊保持清爽,不會過度甜膩。' },
      { emoji: '💛', title: '黃水晶', desc: '補上招財、自信與明亮感,讓狐仙的桃花人緣之外也多一份財氣寓意。' },
      { emoji: '🌸', title: '膠花晶', desc: '增加親和魅力與好感度,加強招桃花與好人緣方向。' },
    ],
    suitedFor: [
      '想招桃花、提升人緣與親和感,但喜歡微甜、不過度張揚的感覺',
      '希望自己在人際互動裡更柔和,也更容易被舒服的人靠近',
      '招財、自信與明亮能量,適合想同時加強桃花與財運的人',
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
    ],
    story:
      '不是每一種陪伴都需要很大聲。\n\n狐語微甜像一隻很懂你的狐狸,不催你、不推你,只是在你低頭時輕輕提醒:今天的自己,也值得被好好疼著。',
    closing:
      '願狐語微甜陪你把柔軟戴在身上。\n慢慢來,也可以走得很好。 🦊',
  },
  {
    slug: 'jiao-tang-ma-qi-duo',
    name: '焦糖瑪奇朵',
    subtitle: 'Caramel Macchiato Bracelet',
    tagline: '像一杯剛剛好的焦糖瑪奇朵。\n柔和不膩,溫潤剛好。',
    category: 'sleep',
    categories: ['sleep'],
    material: '日月同輝・斯里蘭卡藍月光・茶晶',
    price: 1480,
    originalPrice: null,
    tag: null,
    fitSummary: '焦糖瑪奇朵主打安放心緒、沉穩落地與放慢節奏,適合想讓心緒慢慢沉澱的人。',
    gentleRecommendation:
      '焦糖瑪奇朵適合喜歡奶金棕色調、想讓配戴感更溫柔,也想在日常裡放慢節奏的人。',
    pairingReason:
      '如果你想讓配戴感更柔和、氣質更溫潤,焦糖瑪奇朵會是很容易靠近日常的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: [
      '/products/jiao-tang-ma-qi-duo/2.jpg',
      '/products/jiao-tang-ma-qi-duo/1.jpg',
      '/products/jiao-tang-ma-qi-duo/3.jpg',
    ],
    img: '/products/jiao-tang-ma-qi-duo/2.jpg',
    features: [
      { emoji: '☕', title: '焦糖奶金色調', desc: '柔和又帶一點甜,很適合日常配戴。' },
      { emoji: '🌙', title: '藍月光柔光', desc: '搭配茶晶的暖棕色調,在光影中呈現安心節奏。' },
      { emoji: '🤎', title: '茶晶沉穩', desc: '為整體增加不浮躁的落地感。' },
      { emoji: '✨', title: '百搭設計', desc: '不挑風格,日常、約會或工作都能自然融入。' },
    ],
    meanings: [
      { emoji: '🌙', title: '月光石', desc: '在這條裡負責安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🤎', title: '茶晶', desc: '補上沉穩、落地與安心感,讓奶金色調甜而不浮。' },
      { emoji: '☕', title: '放慢節奏', desc: '帶來安定感的配戴寓意,提醒自己在忙碌時先放慢節奏。' },
      { emoji: '🤍', title: '安放心緒', desc: '月光石與茶晶一起加強安定、柔和與沉穩落地的方向。' },
    ],
    suitedFor: [
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '茶晶補上沉穩與落地感,適合想讓狀態穩一點的人',
      '帶來安定感的配戴寓意,在起伏時提醒自己先停一下',
      '適合想加強放慢節奏、整理心緒與穩定感的人',
    ],
    story:
      '有些溫柔不是甜膩,而是剛剛好。\n\n焦糖瑪奇朵像一杯手心裡的暖飲,在你急著趕路時提醒你:可以慢一點,可以溫柔一點,也可以好好陪自己一會兒。',
    closing:
      '願焦糖瑪奇朵陪你在日常裡保留一點甜。\n不張揚,也能很有光。 ☕',
  },
  {
    slug: 'lan-jing-zhi-yao',
    name: '藍境之曜',
    subtitle: 'Blue Realm Luster Bracelet',
    tagline: '靜謐如海的藍色能量。\n在光影之中,綻放柔和而沉穩的光芒。',
    category: 'sleep',
    categories: ['sleep', 'protect', 'wealth'],
    material: '貔貅・藍晶石・海藍寶・霧海藍寶・白水晶',
    price: 1780,
    originalPrice: null,
    tag: null,
    fitSummary: '藍境之曜用貔貅守住招財寓意,再用藍色晶石陪你整理思緒、把話說得更柔和清楚。',
    gentleRecommendation:
      '藍境之曜適合想加強招財守護、整理思緒,也想讓溝通更柔和清楚的人。',
    pairingReason:
      '如果你想讓心緒與溝通更順,藍境之曜會是清爽又沉穩的搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/lan-jing-zhi-yao/3.jpg', '/products/lan-jing-zhi-yao/4.jpg'],
    img: '/products/lan-jing-zhi-yao/3.jpg',
    features: [
      { emoji: '🐉', title: '貔貅守護', desc: '以貔貅意象帶來招財、守護與穩定氣場。' },
      { emoji: '💙', title: '藍晶石綴珠', desc: '帶來理性與清晰的能量,陪伴整理思緒與專注內在。' },
      { emoji: '🌊', title: '海藍寶層次', desc: '藍色晶體交織出如海洋般的寧靜氣息。' },
      { emoji: '🤍', title: '白水晶映照', desc: '純淨光感讓整體更透明、協調。' },
    ],
    meanings: [
      { emoji: '🐉', title: '貔貅', desc: '在這條裡負責招財、守財與守護,適合想把機會與資源穩穩接住的人。' },
      { emoji: '💙', title: '藍晶石', desc: '負責智慧與清晰主軸,帶來理性與清晰的能量,有助於整理思緒與專注內在。' },
      { emoji: '🌊', title: '海藍寶', desc: '把清晰延伸到溝通表達,陪你先整理心裡的話,再慢慢說出口。' },
      { emoji: '☁️', title: '霧海藍寶', desc: '補強溫柔溝通與清楚表達,讓說話更柔和、不尖銳。' },
    ],
    suitedFor: [
      '心裡常有很多話和想法,希望先整理清楚,再好好表達',
      '想要招財守護的寓意,但不想選太強烈或太厚重的款式',
      '希望溝通更柔和清楚,在說真話時也保留溫度',
      '招財守護、整理思緒與溫柔溝通三個方向一起加強',
    ],
    story:
      '當你覺得心裡很吵,也許不是需要更多答案,而是需要一片安靜的藍。\n\n藍境之曜把貔貅守護與海藍色晶石串在一起,像把海戴在手腕上,讓每一次呼吸都慢慢回到自己的節奏。',
    closing:
      '願藍境之曜陪你把心緒放慢,把話說清楚。\n在平靜與力量之間,找到屬於自己的光。 💙',
  },
  {
    slug: 'liu-jin-zhi-yao',
    name: '鎏金之耀',
    subtitle: 'Gilded Radiance Bracelet',
    tagline: '金色,不一定要張揚。\n它也可以溫柔、細緻、剛剛好。',
    category: 'wealth',
    categories: ['wealth', 'courage'],
    material: '鈦晶・黃水晶・茶晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '鎏金之耀把招財、自信與勇氣行動收進溫潤金色裡,適合想讓努力更有光的人。',
    gentleRecommendation:
      '鎏金之耀適合想提升財運、自信與日常亮點,也希望把行動力穩穩戴在身上的人。',
    pairingReason:
      '如果你想讓招財與自信能量更明亮,鎏金之耀會是好搭又有份量的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('liu-jin-zhi-yao', 3),
    img: '/products/liu-jin-zhi-yao/1.jpg',
    features: [
      { emoji: '💛', title: '鈦晶光澤', desc: '細閃如陽光落在礦石上,增加光感與氣勢。' },
      { emoji: '🍯', title: '黃水晶色調', desc: '呈現明亮溫潤的金黃色。' },
      { emoji: '🤎', title: '茶晶沉穩', desc: '為金色調加入穩定與成熟層次。' },
      { emoji: '🤍', title: '白水晶調和', desc: '讓整體更清透協調,日常也容易搭配。' },
    ],
    meanings: [
      { emoji: '💛', title: '鈦晶', desc: '在這條裡負責氣勢與行動力,象徵自信、財氣與光芒,也為自己增添一份勇敢前行的力量感。' },
      { emoji: '🍯', title: '黃水晶', desc: '主打招財、聚財與自我價值,提醒你相信自己的努力值得被看見。' },
      { emoji: '🤎', title: '茶晶', desc: '補上沉穩與落地感,讓金色能量不只亮,也能穩穩留住。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和整體,把招財、自信與行動力整理得更平衡。' },
    ],
    suitedFor: [
      '想提升招財與自信寓意,也希望自己在工作或目標上更敢行動',
      '黃水晶主打招財、聚財與自我價值',
      '鈦晶加強自信、財氣與行動力',
      '正在累積工作成果與金錢目標,想提醒自己值得被看見',
    ],
    story:
      '真正好看的金色,不是用力證明自己多耀眼。\n\n它是你慢慢相信自己值得,然後光自然從細節裡透出來。\n\n鎏金之耀把黃水晶、鈦晶與茶晶串成一種剛剛好的光,陪你穩穩累積。',
    closing:
      '願鎏金之耀陪你把自信與豐盛戴回身上。\n金色不是為了炫耀,是提醒你值得。 💛',
  },
  {
    slug: 'mei-yu-xin-yuan',
    name: '莓語心願',
    subtitle: 'Berry Wish Bracelet',
    tagline: '想為生活添一點甜甜的色彩嗎?\n草莓色調的溫柔光澤,是日常裡很剛好的陪伴。',
    category: 'love',
    categories: ['love', 'healing'],
    material: '草莓晶・綠幽靈・粉晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '莓語心願主打招桃花、好人緣與親和魅力,也加入成長與累積的寓意。',
    gentleRecommendation:
      '莓語心願適合想提升桃花、人緣與好心情,也喜歡甜而不膩的草莓色系的人。',
    pairingReason:
      '如果你想加強關係裡的親和感與好心情,莓語心願會是清甜又不膩的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('mei-yu-xin-yuan', 2),
    img: '/products/mei-yu-xin-yuan/1.jpg',
    features: [
      { emoji: '🍓', title: '草莓晶主調', desc: '像微溫果茶般的色調,柔和又有甜感。' },
      { emoji: '🌿', title: '綠幽靈層次', desc: '帶出自然沉穩的設計感。' },
      { emoji: '🌸', title: '粉晶柔光', desc: '讓整體更親和、更溫柔。' },
      { emoji: '🤍', title: '白水晶清透', desc: '增加清爽平衡,不讓甜感過度厚重。' },
    ],
    meanings: [
      { emoji: '🍓', title: '草莓晶', desc: '在這條裡負責好人緣與親和魅力,加強招桃花與互動好感度。' },
      { emoji: '🌿', title: '綠幽靈', desc: '把桃花人緣之外的成長與累積放進來,適合正在慢慢長出成果的人。' },
      { emoji: '🌸', title: '粉晶', desc: '補強招桃花與親和魅力,讓柔軟變成自然吸引力。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和招桃花、人緣與成長累積方向,讓整體功效更集中。' },
    ],
    suitedFor: [
      '招桃花、提升好人緣與親和魅力',
      '增加好感度,適合想讓人際互動更自然的人',
      '綠幽靈象徵成長、累積與豐盛能量',
      '白水晶調和桃花、人緣與成長累積方向',
    ],
    story:
      '有時候願望不需要很盛大。\n\n它可以只是今天想對自己好一點,想把生活過得柔軟一點,想在手腕上留下一點甜。\n\n莓語心願像一顆小小的莓果糖,提醒你日常也可以很可愛。',
    closing:
      '願莓語心願陪你把甜度留給自己。\n柔軟不是脆弱,是你願意好好生活的證明。 🍓',
  },
  {
    slug: 'nuan-yu',
    name: '暖語',
    subtitle: 'Warm Whisper Bracelet',
    tagline: '有些溫柔,不需要說出口。\n它會慢慢留在你身上。',
    category: 'love',
    categories: ['love', 'healing', 'sleep'],
    material: '茶晶・粉晶・紅石榴・奶油月光・紫光晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '暖語主打人緣、安放心緒與內在力量,適合想讓關係互動更穩的人。',
    gentleRecommendation:
      '暖語適合正在整理人際與心緒,想讓日常多一點溫柔陪伴與安定感的人。',
    pairingReason:
      '如果你想讓配戴感更柔軟、更有人際連結感,暖語會是舒服的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('nuan-yu', 3),
    img: '/products/nuan-yu/1.jpg',
    features: [
      { emoji: '🤎', title: '茶晶穩定', desc: '帶來沉穩安定的象徵。' },
      { emoji: '🌸', title: '粉晶連結', desc: '象徵柔和人際與愛自己的能量。' },
      { emoji: '🌙', title: '奶油月光', desc: '柔和陪伴與安放心緒,讓互動多一點溫柔節奏。' },
      { emoji: '🤍', title: '白水晶協調', desc: '讓整體能量更乾淨平衡。' },
    ],
    meanings: [
      { emoji: '🤎', title: '茶晶', desc: '在這條裡負責沉穩與落地感,適合想慢慢把自己接住的人。' },
      { emoji: '🌸', title: '粉晶', desc: '補上桃花、人緣與親和魅力,讓互動多一點柔和與好感度。' },
      { emoji: '❤️', title: '紅石榴', desc: '加強內在力量與行動力,寓意堅定、自信與勇敢前行。' },
      { emoji: '🌙', title: '奶油月光', desc: '在茶晶與粉晶之間補上安定與柔和,帶來安定感的配戴寓意。' },
    ],
    suitedFor: [
      '提升人緣、桃花與親和魅力',
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '加強內在力量與行動力,寓意堅定、自信與勇敢前行',
      '茶晶補上沉穩與落地感,適合想讓狀態穩一點的人',
    ],
    story:
      '暖語像一段安靜的陪伴。\n\n不是轟轟烈烈地改變你,而是在每個普通日子提醒你:可以先照顧自己,可以慢慢整理,也可以不用急著給所有人答案。',
    closing:
      '願暖語陪你在低潮時也能被自己接住。\n今天的自己,好像剛剛好。 🤍',
  },
  {
    slug: 'wei-lan-wei-guang',
    name: '蔚藍微光',
    subtitle: 'Ocean Blue Glimmer Bracelet',
    tagline: '十月還帶著夏日的氣息。\n就戴上一點海洋色調吧。',
    category: 'sleep',
    categories: ['sleep', 'healing'],
    material: '海藍寶・藍摩根石・藍晶石・蛋白石・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '蔚藍微光主打溫柔溝通、清晰思緒與安放心緒,適合想把話說清楚的人。',
    gentleRecommendation:
      '蔚藍微光適合喜歡海洋色調、想整理思緒,也希望溝通與心緒都更柔和清楚的人。',
    pairingReason:
      '如果你想讓搭配更清透、更有海洋氛圍,蔚藍微光會是很舒服的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('wei-lan-wei-guang', 2),
    img: '/products/wei-lan-wei-guang/1.jpg',
    features: [
      { emoji: '🌊', title: '海藍寶清透', desc: '呈現淺藍色光澤,像海面上的細閃。' },
      { emoji: '💙', title: '藍晶石層次', desc: '帶出深淺交錯的藍色層次。' },
      { emoji: '🫧', title: '蛋白石波光', desc: '細碎閃光如浪面光影。' },
      { emoji: '🤍', title: '白水晶協調', desc: '讓整體更清爽,適合日常搭配。' },
    ],
    meanings: [
      { emoji: '🌊', title: '海藍寶', desc: '在這條裡負責溫柔溝通,不是硬要你很會表達,而是陪你先把心裡的話整理清楚。' },
      { emoji: '💙', title: '藍晶石', desc: '補上智慧與清晰主軸,帶來理性與清晰的能量,有助於整理思緒與專注內在。' },
      { emoji: '🫧', title: '蛋白石', desc: '加強靈感與直覺提醒,適合想讓思緒更有流動感的人。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和溝通、清晰與安放心緒方向,讓整體功效更集中。' },
    ],
    suitedFor: [
      '溫柔溝通與清楚表達,適合心裡有話想整理的人',
      '帶來理性與清晰的能量,有助於整理思緒與專注內在',
      '象徵安定與柔和,在起伏時提醒自己先停一下',
      '白水晶調和溝通、清晰與安放心緒方向',
    ],
    story:
      '有些藍色不是沉重,而是讓人安靜下來的海。\n\n蔚藍微光把海藍寶、藍晶石與蛋白石串成一點點海風,陪你整理思緒、安放心裡的話,也在忙碌日常裡留一口呼吸的空間。',
    closing:
      '願蔚藍微光陪你把心放回平靜的地方。\n像海一樣柔軟,也像海一樣有力量。 🌊',
  },
  {
    slug: 'wen-rou-yue-guang',
    name: '溫柔月光',
    subtitle: 'Tender Moonlight Bracelet',
    tagline: '讓柔柔的月光色調落在手腕上。\n像夜晚的一抹光,安靜卻不失存在感。',
    category: 'sleep',
    categories: ['sleep', 'healing'],
    material: '月光石・奶油月光石・藍月光石・白水晶',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '溫柔月光主打安放心緒、柔和直覺與節奏沉澱,適合想讓心緒慢慢穩下來的人。',
    gentleRecommendation:
      '溫柔月光適合喜歡月光色系、想讓心緒慢慢沉澱,也想要一條乾淨百搭手鍊的人。',
    pairingReason:
      '如果你想要一條乾淨百搭又溫柔的手鍊,溫柔月光會很適合。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('wen-rou-yue-guang', 2),
    img: '/products/wen-rou-yue-guang/1.jpg',
    features: [
      { emoji: '🌙', title: '月光石主調', desc: '呈現柔和霧感與細緻光暈。' },
      { emoji: '🫧', title: '奶油月光石', desc: '代表溫潤與安靜氣質。' },
      { emoji: '💙', title: '藍月光石', desc: '帶有淡淡藍色光暈,增加層次。' },
      { emoji: '🤍', title: '白水晶清透', desc: '為整體注入乾淨、平衡的視覺感。' },
    ],
    meanings: [
      { emoji: '🌙', title: '月光石', desc: '在這條裡負責安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🫧', title: '奶油月光', desc: '加強安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '💙', title: '藍月光', desc: '帶來柔和直覺與感受整理,提醒自己把注意力慢慢收回來。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和月光石的安定、柔和與直覺方向。' },
    ],
    suitedFor: [
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '在起伏時提醒自己先停一下,把注意力慢慢收回來',
      '加強柔和直覺與感受整理',
      '白水晶調和安定、柔和與直覺方向',
    ],
    story:
      '夜晚的月光不會用力照亮全世界。\n\n它只是安靜地落下來,讓人知道黑暗裡也可以有溫柔。\n\n溫柔月光把這種安靜戴在手腕上,陪你在每個需要放鬆的時刻,慢慢回到自己。',
    closing:
      '願溫柔月光陪你把心放柔。\n不需要很耀眼,也可以很有光。 🌙',
  },
  {
    slug: 'xi-guang-zhi-yong',
    name: '曦光之詠',
    subtitle: 'Dawnlight Citrine Bracelet',
    tagline: '光,是一種溫柔的存在。\n黃塔山溫潤的金色光澤,與藍月光映照出細緻的亮。',
    category: 'wealth',
    categories: ['wealth', 'courage'],
    material: '黃塔山・白水晶・藍月光・茶晶',
    price: 1980,
    originalPrice: null,
    tag: null,
    fitSummary: '曦光之詠主打招財、自信光芒與穩定累積,適合想加強財運與自我價值的人。',
    gentleRecommendation:
      '曦光之詠適合想提升財運、自信與自我價值感,但喜歡明亮不刺眼風格的人。',
    pairingReason:
      '如果你想加強豐盛與自我價值感,曦光之詠會是明亮但不刺眼的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xi-guang-zhi-yong', 2),
    img: '/products/xi-guang-zhi-yong/1.jpg',
    features: [
      { emoji: '💛', title: '黃塔山金色光澤', desc: '呈現沉穩溫潤、豐盛而不浮誇的光感。' },
      { emoji: '🤍', title: '白水晶平衡', desc: '清澈透明,象徵純粹與調和。' },
      { emoji: '💙', title: '藍月光層次', desc: '淡淡藍色微光,增添柔和細膩感。' },
      { emoji: '🤎', title: '茶晶沉穩', desc: '溫暖色調低調內斂,讓整體更有質感。' },
    ],
    meanings: [
      { emoji: '💛', title: '黃塔山', desc: '在這條裡負責招財、豐盛與自信光芒,讓金色能量明亮但不浮誇。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和招財、自信與安定方向,讓整體功效更集中。' },
      { emoji: '💙', title: '藍月光', desc: '替金色能量加入安定與細緻層次,讓明亮感不會太急。' },
      { emoji: '🤎', title: '茶晶', desc: '補上沉穩與落地感,提醒自己慢慢累積也很有力量。' },
    ],
    suitedFor: [
      '招財、豐盛與自信光芒',
      '適合正在整理金錢目標、工作方向或自我價值的人',
      '白水晶調和招財、自信與安定方向',
      '茶晶補上沉穩與落地感,適合想慢慢累積的人',
    ],
    story:
      '曦光不是正午的烈陽,而是清晨慢慢亮起的光。\n\n它提醒你不用一下子變得耀眼,只要願意一點一點相信自己,光就會慢慢在你身上留下痕跡。',
    closing:
      '願曦光之詠陪你在柔和之中閃耀。\n讓每一天,都有屬於你的曦光。 💛',
  },
  {
    slug: 'xin-yu-ni-nan',
    name: '心語呢喃',
    subtitle: 'Inner Whisper Bracelet',
    tagline: '有些感受不需要被放大。\n只是輕輕地,在心裡說給自己聽。',
    category: 'healing',
    categories: ['healing', 'sleep'],
    material: '斯里蘭卡藍月光・白幽靈',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '心語呢喃主打安放心緒、內在整理與重新開始,適合想讓狀態慢慢沉澱的人。',
    gentleRecommendation:
      '心語呢喃適合最近有些感受想慢慢整理,也想把重新開始的提醒戴在身上的人。',
    pairingReason:
      '如果你想讓心緒被好好安放,心語呢喃會是很柔軟的陪伴。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xin-yu-ni-nan', 3),
    img: '/products/xin-yu-ni-nan/1.jpg',
    features: [
      { emoji: '🌙', title: '斯里蘭卡藍月光', desc: '象徵溫柔感受與內在直覺,陪你慢慢安放心緒。' },
      { emoji: '🤍', title: '白幽靈', desc: '象徵清透、留白與重新開始。' },
      { emoji: '💗', title: '柔軟陪伴', desc: '不是提醒你振作,而是陪你好好安放。' },
      { emoji: '✨', title: '14K 包金配件', desc: '細緻金色點綴,讓整體更精緻。' },
    ],
    meanings: [
      { emoji: '🌙', title: '藍月光', desc: '在這條裡負責安定與柔和,在起伏時提醒自己先停一下,把注意力慢慢收回來。' },
      { emoji: '🤍', title: '白幽靈', desc: '負責留白與新的開始,適合想慢慢整理內在狀態的人。' },
      { emoji: '💗', title: '安定寓意', desc: '把藍月光與白幽靈的柔和收在一起,帶來安定感的配戴寓意。' },
      { emoji: '✨', title: '重新開始', desc: '加強留白、整理與重新開始的寓意,適合想慢慢回到節奏的人。' },
    ],
    suitedFor: [
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '白幽靈負責留白與新的開始,適合慢慢整理內在狀態',
      '帶來安定感的配戴寓意,在起伏時提醒自己先停一下',
      '加強內在整理與重新開始的寓意',
    ],
    story:
      '不是所有感受都要被說出口。\n\n有時候你只是需要一個安靜的位置,讓心裡的聲音慢慢被自己聽見。\n\n心語呢喃陪你把那些沒說出口的感受,輕輕安放好。',
    closing:
      '願心語呢喃陪你在安靜裡慢慢整理自己。\n你不需要立刻好起來,你只需要被好好陪著。 🤍',
  },
  {
    slug: 'xing-yao-zhi-xing',
    name: '星曜之星',
    subtitle: 'Stellar Black Super Seven Bracelet',
    tagline: '黑金超七不是超十呦。\n柔軟不代表脆弱,沉穩也可以帶著光。',
    category: 'protect',
    categories: ['protect', 'courage'],
    material: '黑金超七',
    price: 1480,
    originalPrice: null,
    tag: null,
    fitSummary: '星曜之星不是要你防備全世界,而是把避小人與守護界線戴在身上,讓深色也有自己的光。',
    gentleRecommendation:
      '星曜之星適合工作環境複雜、容易被人際消耗,或想加強避小人與守護界線寓意的人。',
    pairingReason:
      '如果你想要一條低調卻有避小人、守護感的深色款,星曜之星會很適合。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xing-yao-zhi-xing', 2),
    img: '/products/xing-yao-zhi-xing/1.jpg',
    features: [
      { emoji: '🖤', title: '黑金超七主石', desc: '黑金超七是帶有深色礦絲、金銅髮與多種共生礦物感的水晶,視覺上沉穩又有細緻光澤。' },
      { emoji: '🛡️', title: '避小人寓意', desc: '象徵避小人、守護界線與把注意力收回自己身上。' },
      { emoji: '✨', title: '層層礦絲', desc: '展現沉穩與光澤並存的質感。' },
      { emoji: '🌙', title: '低調設計', desc: '適合喜歡內斂力量感的日常配戴。' },
    ],
    meanings: [
      { emoji: '🖤', title: '黑金超七', desc: '在這條裡負責避小人與守護主軸,適合想遠離雜亂人事物的人。' },
      { emoji: '🛡️', title: '守護界線', desc: '把避小人落到界線感,提醒自己該保持距離的人事物,就不要讓它一直消耗你。' },
      { emoji: '✨', title: '沉穩力量', desc: '加強沉穩與保護感,適合複雜工作或人際場合。' },
      { emoji: '🌙', title: '避小人提醒', desc: '提醒自己該保持距離時就保持距離,不要讓消耗型人事物靠太近。' },
    ],
    suitedFor: [
      '工作或人際環境有點複雜,想加強避小人與界線感',
      '容易被別人的話、情緒或眼光影響,想把注意力慢慢收回自己',
      '加強沉穩與保護感,適合複雜工作或人際場合',
      '想要一條不張揚但有力量的手鍊,提醒自己該保持距離時就保持距離',
    ],
    story:
      '黑金超七不是超十呦。它常見深色礦絲與金銅色髮絲感交織,看起來低調,細看卻有層層光澤。\n\n有些力量不是往外擴張,而是把自己穩穩守住。星曜之星像夜空裡的深色星光,不需要很亮,卻能提醒你:在風景之中,你仍然有自己的節奏。',
    closing:
      '願星曜之星陪你把界線戴好。\n柔軟不是脆弱,沉穩也可以帶著光。 🖤',
  },
  {
    slug: 'xue-jing-wen-rou',
    name: '雪境溫柔',
    subtitle: 'Snowy Tenderness Bracelet',
    tagline: '有一隻白水晶小熊。\n在雪落的季節裡,世界被覆上一層安靜的白。',
    category: 'healing',
    categories: ['healing', 'sleep'],
    material: '白水晶小熊・奶油月光石・白水晶切面珠',
    price: 1380,
    originalPrice: null,
    tag: null,
    fitSummary: '雪境溫柔主打安放心緒、整理狀態與重新開始,適合想讓心緒慢慢沉澱的人。',
    gentleRecommendation:
      '雪境溫柔適合喜歡白色調、清爽百搭,也想要一份安靜溫柔陪伴的人。',
    pairingReason:
      '如果你想要一條乾淨柔白、很適合日常與送禮的款式,雪境溫柔會很適合。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/xue-jing-wen-rou/1.jpg', '/products/xue-jing-wen-rou/2.jpg'],
    img: '/products/xue-jing-wen-rou/1.jpg',
    features: [
      { emoji: '🐻', title: '白水晶小熊', desc: '為整體增添可愛與純白氛圍。' },
      { emoji: '🌙', title: '奶油月光石', desc: '呈現柔霧般的溫柔光感。' },
      { emoji: '🤍', title: '白水晶切面珠', desc: '讓整體更透亮協調。' },
      { emoji: '🎁', title: '送禮日常款', desc: '乾淨百搭,適合送給自己或重要的人。' },
    ],
    meanings: [
      { emoji: '🐻', title: '白水晶小熊', desc: '在這條裡負責整理狀態與重新開始,讓心緒方向更單純。' },
      { emoji: '🌙', title: '奶油月光石', desc: '補上一份安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和整理、安定與重新開始的方向。' },
      { emoji: '❄️', title: '重新開始', desc: '加強留白與重新開始的寓意,提醒自己慢慢回到清楚狀態。' },
    ],
    suitedFor: [
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '白水晶負責整理狀態與重新開始',
      '奶油月光石補上安定與柔和的配戴寓意',
      '適合想加強留白、安定與重新整理的人',
    ],
    story:
      '雪落下來的時候,世界好像會小聲一點。\n\n雪境溫柔把白水晶小熊與奶油月光串在一起,像一份很輕的提醒:你可以慢慢來,可以乾淨地重新開始。',
    closing:
      '願雪境溫柔陪你把心裡的雜音放輕。\n聖誕節、日常、或只是今天,都值得一份溫柔。 ❄️',
  },
  {
    slug: 'yue-ying-rou-guang',
    name: '月映柔光',
    subtitle: 'Moonlit Soft Glow Bracelet',
    tagline: '每顆的光暈都很促咪。\n在月色裡,學會溫柔也堅定。',
    category: 'protect',
    categories: ['protect', 'love', 'courage'],
    material: '彩月光石・五貓守護・琉璃・果果・阿喵・餅餅',
    price: 980,
    originalPrice: null,
    tag: null,
    fitSummary: '主打守護界線、安放心緒、自信提醒與行動力。',
    gentleRecommendation:
      '月映柔光適合喜歡可愛守護元素、彩月光光暈,也想在日常裡多一點安心與自信的人。',
    pairingReason:
      '如果你喜歡可愛守護元素,月映柔光會是一條很有角色感的手鍊。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/yue-ying-rou-guang/1.jpg', '/products/yue-ying-rou-guang/3.jpg'],
    img: '/products/yue-ying-rou-guang/1.jpg',
    features: [
      { emoji: '🌙', title: '彩月光主調', desc: '象徵平衡與安定,每顆光暈都很有個性。' },
      { emoji: '🐱', title: '五貓守護', desc: '陪你走向更穩定、更安心的自己。' },
      { emoji: '✨', title: '晶晶自信之光', desc: '提醒你別低估自己的魅力與價值。' },
      { emoji: '🍪', title: '餅餅純真喜悅', desc: '把生活裡的小確幸與快樂留住。' },
    ],
    meanings: [
      { emoji: '🌙', title: '彩月光', desc: '在這條裡負責安定與柔和,提醒自己先停一下,把注意力慢慢收回來。' },
      { emoji: '🐱', title: '五貓守護', desc: '加強守護界線,提醒自己把注意力收回自己身上。' },
      { emoji: '✨', title: '自信之光', desc: '在柔和之外補上自信提醒,為自己增添一份勇敢前行的力量感。' },
      { emoji: '🍪', title: '輕盈能量', desc: '在守護與安定之外,補上正向感與自信提醒。' },
    ],
    suitedFor: [
      '加強守護界線,適合想把注意力收回自己的人',
      '象徵安定與柔和,適合想讓心緒慢慢沉澱的人',
      '為自己增添一份勇敢前行的力量感,寓意堅定、自信與行動力',
      '適合想同時加強守護、安定與自信的人',
    ],
    story:
      '五貓圍繞,月光不孤單。\n\n月映柔光把彩月光的溫柔與五個小守護串在一起,像一群安靜陪你生活的小提醒:你可以柔軟,也可以堅定。',
    closing:
      '願月映柔光陪你把安心戴在身上。\n月光不孤單,你也不孤單。 🐱🌙',
  },
  {
    slug: 'yue-ying-zhi-hua',
    name: '月影織花',
    subtitle: 'Moonshadow Woven Bloom Bracelet',
    tagline: '月影織花,在木色光影裡靜靜綻放。\n像一朵藏著星光的小花。',
    category: 'protect',
    categories: ['protect', 'sleep'],
    material: '銀曜石・月光石・白水晶',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '月影織花把避小人與守護界線藏進黑白灰星花裡,低調但很有辨識度。',
    gentleRecommendation:
      '月影織花適合喜歡低調深色質感,也想加強避小人、守護界線與安定感的人。',
    pairingReason:
      '如果你想讓避小人與守護感更精緻、穿搭更有個性,月影織花會是很有辨識度的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('yue-ying-zhi-hua', 1),
    img: '/products/yue-ying-zhi-hua/1.jpg',
    features: [
      { emoji: '🌹', title: '月影織花主題', desc: '以星花墜飾與黑白灰色調打造低調光感。' },
      { emoji: '🖤', title: '銀曜石', desc: '象徵避小人、守護界線與沉穩力量。' },
      { emoji: '🌙', title: '月光石柔光', desc: '在深色主調中加入溫柔細節。' },
      { emoji: '🤍', title: '白水晶透亮', desc: '讓整體不沉重,保留清透平衡。' },
    ],
    meanings: [
      { emoji: '🖤', title: '銀曜石', desc: '在這條裡負責避小人、守護與界線,提醒你把自己的位置站穩。' },
      { emoji: '🌙', title: '月光石', desc: '在黑白灰主調中補上安定與柔和,讓守護感不會太冷。' },
      { emoji: '🤍', title: '白水晶', desc: '負責調和避小人、守護與安定方向,讓整體功效更集中。' },
      { emoji: '🌹', title: '星花墜飾', desc: '強化避小人與守護意象,讓界線提醒更明確。' },
    ],
    suitedFor: [
      '避小人、守護與界線感',
      '適合複雜人際或工作場景,提醒自己把位置站穩',
      '偏愛星星、花朵或月光元素,希望守護感也可以有柔和的一面',
      '適合在複雜人際或工作場景裡配戴,提醒自己把位置站穩',
    ],
    story:
      '有些花不是開在白天。\n\n月影織花像夜裡慢慢亮起的一朵小花,深色裡帶著光,安靜卻很有存在感。\n\n它提醒你:低調不代表沒有力量。',
    closing:
      '願月影織花陪你把安定與個性戴在手腕上。\n在陰影裡,也能開出自己的光。 🌹',
  },
  {
    slug: 'xi-guang',
    name: '曦光',
    subtitle: 'Dawn Citrine Glow Bracelet',
    tagline: '像清晨第一束光,\n把豐盛、安定與清澈慢慢帶回日常。',
    category: 'wealth',
    categories: ['wealth', 'sleep'],
    material: '黃水晶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '曦光把招財、豐盛與自信行動戴得明亮清爽,適合正在整理金錢目標與生活節奏的人。',
    gentleRecommendation:
      '曦光適合想提升財運、整理金錢目標,或希望在工作與生活裡多一點明亮行動感的人。',
    pairingReason:
      '如果你想讓日常多一點明亮與豐盛感,曦光會是輕盈、好配戴的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xi-guang', 2),
    img: '/products/xi-guang/1.jpg',
    features: [
      { emoji: '☀️', title: '黃水晶主調', desc: '明亮清透的黃色光感,象徵招財聚富與自信行動。' },
      { emoji: '🌙', title: '月光石柔光', desc: '象徵安定與柔和,為招財能量加入放慢節奏的提醒。' },
      { emoji: '🤍', title: '白阿塞與白水晶', desc: '象徵清透、留白與調和,讓整體能量更清爽。' },
      { emoji: '🎀', title: '天然水晶手鍊', desc: '精心挑選與搭配,成為陪伴自己前進的日常能量。' },
    ],
    meanings: [
      { emoji: '☀️', title: '黃水晶', desc: '在這條裡負責招財、聚財與自我價值,提醒你相信自己的努力值得被看見。' },
      { emoji: '🌙', title: '月光石', desc: '在招財的明亮感之外補上安定與柔和,適合想讓心緒慢慢沉澱的人。' },
      { emoji: '🤍', title: '白阿塞', desc: '像把心裡的雜訊先沉澱下來,讓金錢目標與生活節奏保留一點留白。' },
      { emoji: '✨', title: '白水晶', desc: '負責調和整條手鍊,把黃水晶的明亮與月光石的柔和整理得更平衡。' },
    ],
    suitedFor: [
      '想提升財運、招財聚富與自信感,但喜歡輕盈明亮、不厚重的款式',
      '正在整理工作、金錢或生活節奏,希望努力與機會都能被穩穩接住',
      '希望財運寓意不只是等待好運,也提醒自己勇敢行動、相信價值',
      '黃水晶主打招財、聚財與自我價值',
    ],
    story:
      '清晨的光不會突然把世界照亮。\n\n它是一點一點進來的,先照到窗邊,再慢慢落到你手上。\n\n曦光把黃水晶、月光石、白阿塞與白水晶串在一起,像提醒你:豐盛不是用力追來的,是當你慢慢穩住自己,也開始相信自己值得。',
    closing:
      '願曦光陪你把明亮戴回日常。\n在金錢、工作與生活之間,慢慢迎接屬於你的豐盛。 ☀️',
  },
  {
    slug: 'nuan-ying',
    name: '暖櫻',
    subtitle: 'Warm Sakura Rose Quartz Bracelet',
    tagline: '粉色不是脆弱,\n是願意溫柔表達自己的力量。',
    category: 'love',
    categories: ['love', 'sleep'],
    material: '粉水晶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '暖櫻把一點粉色溫柔戴在手上,讓招桃花、人緣與好好表達自己的勇氣慢慢回來。',
    gentleRecommendation:
      '暖櫻適合想提升好感度、讓關係互動更柔和,或正在練習把自己的感受好好說出口的人。',
    pairingReason:
      '暖櫻適合想讓感情、人際、表達都更順一點的人。不是討好誰,而是把自己的溫柔好好戴回來。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('nuan-ying', 2),
    img: '/products/nuan-ying/1.jpg',
    features: [
      { emoji: '🌸', title: '粉水晶主調', desc: '柔和粉色帶來親和氣息,象徵招桃花、人緣與溫柔表達。' },
      { emoji: '🌙', title: '月光石安定感', desc: '帶來安定感的配戴寓意,陪你在日常中放慢節奏。' },
      { emoji: '🤍', title: '白阿塞留白', desc: '適合把心裡累積的小緊繃慢慢清掉。' },
      { emoji: '✨', title: '白水晶平衡', desc: '讓整體能量更清透,也把粉晶的甜與月光石的柔和整理得更平衡。' },
    ],
    meanings: [
      { emoji: '🌸', title: '粉水晶', desc: '在這條裡負責招桃花與人緣主軸,讓你的溫柔不是委屈,而是一種自然的吸引力。' },
      { emoji: '🌙', title: '月光石', desc: '在粉晶的甜感之外補上一份安定,讓你在關係裡不急著反應,也不急著退讓。' },
      { emoji: '🤍', title: '白阿塞', desc: '像把心裡的雜訊先沉澱下來,適合把累積的小緊繃慢慢放輕。' },
      { emoji: '✨', title: '白水晶', desc: '像整條手鍊的中和角色,把粉晶的甜、月光石的柔和整理得更平衡。' },
    ],
    suitedFor: [
      '想招桃花、提升人緣與好感度,但不想靠討好別人來獲得喜歡',
      '在關係裡常常想很多,想練習把感受說得柔和又清楚',
      '招桃花、提升人緣與好感度',
      '增加親和魅力,適合想讓感情、人際與表達更順的人',
    ],
    story:
      '有時候,最難的不是說話。\n\n是把真正的感受說出口,又不弄疼自己。\n\n暖櫻像手腕上的一點粉色光,提醒你:溫柔不是退讓,而是能更清楚地照顧自己的心。',
    closing:
      '願暖櫻陪你在每一次表達裡,都保有溫柔與清楚。\n你可以柔軟,也可以很有力量。 🌸',
  },
  {
    slug: 'jing-lan',
    name: '靜瀾',
    subtitle: 'Still Aquamarine Ripple Bracelet',
    tagline: '像安靜的海面,\n把想說的話、想整理的心,慢慢帶回清澈。',
    category: 'sleep',
    categories: ['sleep', 'love'],
    material: '海藍寶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '靜瀾適合心裡有話卻不想一開口就太滿的人,陪你先整理思緒,再清楚溫柔地說出口。',
    gentleRecommendation:
      '靜瀾適合心裡有話想說卻不知道怎麼開口,或想先把心緒整理好、再好好說出真正感受的人。',
    pairingReason:
      '如果你想讓溝通、表達與心緒都更順一點,靜瀾會是清爽又穩定的日常搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('jing-lan', 2),
    img: '/products/jing-lan/1.jpg',
    features: [
      { emoji: '🌊', title: '海藍寶主調', desc: '清透藍色帶來安靜感,象徵清楚表達與溫柔溝通。' },
      { emoji: '🌙', title: '月光石柔和光暈', desc: '象徵安定與柔和,在情緒起伏時提醒自己先停一下。' },
      { emoji: '🤍', title: '白阿塞留白', desc: '適合把心裡雜訊慢慢沉澱,留下更清楚的感受。' },
      { emoji: '✨', title: '白水晶平衡', desc: '讓整體能量更清透,也讓溝通與安放心緒的方向更一致。' },
    ],
    meanings: [
      { emoji: '🌊', title: '海藍寶', desc: '在這條裡負責溝通主軸,不是硬要你變得很會表達,而是陪你先把心裡的話整理清楚。' },
      { emoji: '🌙', title: '月光石', desc: '讓表達不要太急,也不要太刺;當你想說真話時,也保留一份溫柔。' },
      { emoji: '🤍', title: '白阿塞', desc: '像把心裡的雜訊先沉澱下來,適合最近資訊很多、需要先空出位置再重新整理的人。' },
      { emoji: '✨', title: '白水晶', desc: '負責調和整條手鍊,讓溝通、安定與整理思緒的方向不互相拉扯。' },
    ],
    suitedFor: [
      '心裡有話想說,但容易悶著、怕說錯,或一開口就太滿',
      '想讓溝通表達更順暢,先把感受整理清楚,再溫柔說出口',
      '希望在起伏時提醒自己先停一下,不要急著反應,也不要急著退讓',
      '溫柔溝通、清楚表達與整理思緒',
    ],
    story:
      '海面真正安靜的時候,不是沒有波浪。\n\n是波浪來了,也知道自己會慢慢回到平穩。\n\n靜瀾把海藍寶、月光石、白阿塞與白水晶串在一起,像陪你練習:先讓心安靜下來,再把真正想說的話說出口。',
    closing:
      '願靜瀾陪你把心裡的波浪慢慢安放。\n清楚地表達,溫柔地前進。 🌊',
  },
];

export function getProductFeatureSummary(product: Product, limit = 2): string {
  return product.features
    .slice(0, limit)
    .map((feature) => `${feature.title}：${feature.desc}`)
    .join(' ');
}

const PRODUCT_RECOMMENDATION_REASONS: Record<string, string> = {
  'glimmer-fox':
    '這款商品對應「安定、保護、界線」的能量，適合你在疲憊或容易被外界影響時，提醒自己先回到內在的安全感。',
  'wish-fox':
    '這款商品對應「魅力、心願、溫柔連結」的能量，適合你在期待關係、人緣或新機會時，陪你把注意力放回自己的光。',
  'courage-cat':
    '這款商品對應「勇氣、行動、突破」的能量，適合你在想前進卻有點猶豫時，提醒自己先踏出一個小小的開始。',
  'wish-bunny':
    '這款商品對應「願望、陪伴、柔軟信念」的能量，適合你在心裡有期待卻還不敢說出口時，陪你慢慢把願望照顧好。',
  'calm-light':
    '這款商品對應「靜心、釐清、放鬆」的能量，適合你在心緒混亂或想太多時，把注意力慢慢收回自己身上。',
  'moonlight-wings':
    '這款商品對應「直覺、守護、重新整理」的能量，適合你在不確定下一步時，陪你安靜聽見心裡真正的方向。',
  'wealth-stone':
    '這款商品對應「豐盛、機會、行動力」的能量，適合你在整理金錢、工作或自我價值時，提醒自己把猶豫轉成實際行動。',
  'forest-bloom':
    '這款商品對應「招財、事業、貴人」的能量，適合你在工作與金錢能量需要穩定累積時，提醒自己用自然節奏迎接機會。',
  'starwish-fox-bracelet':
    '這款商品對應「桃花、招財、好人緣」的能量，適合你在想提升魅力、善緣與日常亮點時，把自信溫柔戴回身上。',
  'misty-starlight':
    '這款商品對應「桃花、感情、人際關係」的能量，適合你在練習愛自己與整理關係時，陪你保有柔軟清透的心。',
};

const CATEGORY_RECOMMENDATION_REASONS: Record<string, string> = {
  protect:
    '這款商品對應「平安、保護、界線」的能量，適合你在需要穩住自己時，提醒內心慢慢回到安全的位置。',
  love:
    '這款商品對應「愛情、人緣、溫柔連結」的能量，適合你在期待關係、善緣或更柔和的互動時，陪你把自信戴回身上。',
  career:
    '這款商品對應「事業、學業、貴人」的能量，適合你在累積成果、準備考試或整理工作方向時，提醒自己穩定前進。',
  courage:
    '這款商品對應「勇氣、自信、突破」的能量，適合你在需要採取行動時，提醒自己不用一次完美，只要先開始。',
  wealth:
    '這款商品對應「財運、招福、豐盛」的能量，適合你在整理金錢、資源與自我價值時，提醒自己值得被看見。',
  healing:
    '這款商品對應「安放、整理、重新開始」的能量，適合你在低潮或需要重新整理自己時，陪你慢慢找回節奏。',
  sleep:
    '這款商品對應「靜心、留白、放鬆」的能量，適合你在思緒很多或壓力偏滿時，陪你把節奏慢慢調回來。',
};

export function getProductRecommendationReason(product: Product): string {
  return (
    PRODUCT_RECOMMENDATION_REASONS[product.slug] ??
    CATEGORY_RECOMMENDATION_REASONS[product.category] ??
    '這款商品適合陪你把今天的提醒落在生活裡，成為一個能看見、能觸碰的小小支持。'
  );
}

export function getProductFitSummary(product: Product): string {
  return product.fitSummary;
}

export function getProductImageStyle(product: Product): {
  objectFit: 'cover' | 'contain';
  objectPosition: string;
  transform: string;
  transformOrigin: string;
} {
  return {
    objectFit: product.imageFit ?? 'cover',
    objectPosition: product.imagePosition,
    transform: `scale(${product.imageZoom})`,
    transformOrigin: product.imagePosition,
  };
}

export function getContextualRecommendationReason(
  product: Product,
  context?: string,
  role: 'primary' | 'secondary' = 'primary',
  includeContext = false,
): string {
  const body = role === 'secondary' ? product.pairingReason : product.gentleRecommendation;
  const contextText = context?.trim();
  if (!includeContext || !contextText) return body;
  return `${contextText}\n\n${body}`;
}

export const CATEGORY_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: '全部商品' },
  { id: 'custom-bracelet', label: '客製款' },
  { id: 'protect', label: '平安守護' },
  { id: 'love', label: '愛情人緣' },
  { id: 'career', label: '事業學業' },
  { id: 'wealth', label: '財運招福' },
  { id: 'courage', label: '勇氣自信' },
];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
