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
  /** 材質中文,顯示在卡片角落 */
  material: string;
  price: number;
  originalPrice: number | null;
  tag: string | null;
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

export const PRODUCTS: Product[] = [
  // ── 微光守護狐 (茶晶琉璃) ─────────────────────────────────────────────────
  {
    slug: 'glimmer-fox',
    name: '微光守護狐',
    subtitle: 'Glimmer Guardian Fox',
    tagline: '有些力量,不是讓你發光。\n而是在你疲憊的時候,依然能穩穩接住你。',
    category: 'protect',
    material: '茶晶琉璃',
    price: 1280,
    originalPrice: null,
    tag: '療癒',
    images: imgs('glimmer-fox', 4),
    img: '/products/glimmer-fox/1.jpg',
    features: [
      { emoji: '🤎', title: '茶晶琉璃質感', desc: '溫潤透亮的茶晶色澤,在光線下散發低調而迷人的光彩。' },
      { emoji: '☁️', title: '九尾守護能量', desc: '象徵智慧、守護、勇氣與內在力量。' },
      { emoji: '🌙', title: '靜心療癒擺飾', desc: '適合放置於書桌、床頭、工作區或療癒空間。' },
      { emoji: '🎀', title: '儀式感小物', desc: '陪伴日常生活的每一個重要時刻。' },
    ],
    meanings: [
      { emoji: '🤍', title: '安定情緒', desc: '在混亂與焦慮中找回平衡。' },
      { emoji: '☁️', title: '保護能量', desc: '幫助建立屬於自己的安全感與界線。' },
      { emoji: '🌙', title: '內在力量', desc: '相信自己的選擇與步伐。' },
      { emoji: '🦋', title: '穩定前進', desc: '一步一步朝著理想生活靠近。' },
      { emoji: '🌷', title: '自我療癒', desc: '學會照顧自己、理解自己、接納自己。' },
    ],
    suitedFor: [
      '在生活與工作之間感到疲憊',
      '希望有一個能安定心情的小擺件',
      '喜歡九尾狐的溫柔守護氣質',
      '想送自己或重要的人一份儀式感',
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
      '在光影流轉之間,收藏一份屬於自己的溫柔能量。\n九尾狐自古象徵智慧、魅力、幸運與守護。',
    category: 'wish',
    material: '幻彩琉璃',
    price: 980,
    originalPrice: 1280,
    tag: '熱銷',
    images: imgs('wish-fox', 8),
    img: '/products/wish-fox/1.jpg',
    features: [
      { emoji: '🌈', title: '幻彩琉璃工藝', desc: '不同角度呈現迷人的彩虹光澤,每一眼都能發現新的細節與美感。' },
      { emoji: '🦊', title: '九尾狐守護意象', desc: '象徵智慧、自信、魅力、好運與願望顯化。' },
      { emoji: '🌷', title: '療癒空間擺飾', desc: '為生活空間注入柔和氛圍,成為陪伴日常的小小能量夥伴。' },
      { emoji: '🎀', title: '精緻送禮首選', desc: '適合作為生日禮物、紀念禮物,或送給努力生活的自己。' },
    ],
    meanings: [
      { emoji: '🤍', title: '愛自己', desc: '把溫柔留給自己,也把愛留給自己。' },
      { emoji: '♡', title: '桃花能量', desc: '願你遇見喜歡的人,也願你成為自己喜歡的樣子。' },
      { emoji: '🌸', title: '好人緣', desc: '吸引讓你感到舒服、自在的人事物。' },
      { emoji: '🦋', title: '幸運陪伴', desc: '在重要時刻提醒你相信自己、勇敢前進。' },
      { emoji: '☁️', title: '自我療癒', desc: '在忙碌與壓力之中,找回內心的平靜與力量。' },
      { emoji: '🫧', title: '願望顯化', desc: '陪伴你專注於想完成的目標與夢想。' },
    ],
    suitedFor: [
      '希望提升自信與個人魅力',
      '正在期待新的緣分與人際關係',
      '喜歡療癒系居家擺飾',
      '想為自己準備一份充滿儀式感的小禮物',
      '相信美好能量與內在成長',
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
    material: '虎眼石',
    price: 600,
    originalPrice: null,
    tag: '推薦',
    images: imgs('courage-cat', 6),
    img: '/products/courage-cat/1.jpg',
    features: [
      { emoji: '🐾', title: '天然虎眼石雕刻', desc: '保留天然礦石紋理,每一隻都有獨一無二的光澤與花紋。' },
      { emoji: '🤎', title: '溫暖守護能量', desc: '象徵勇氣、自信與穩定力量。' },
      { emoji: '☁️', title: '療癒系桌面擺飾', desc: '適合放在書桌、床頭、工作空間或閱讀角落。' },
      { emoji: '🎀', title: '可愛收藏小物', desc: '精緻小巧,無論送禮或自用都充滿儀式感。' },
    ],
    meanings: [
      { emoji: '🤎', title: '勇氣與自信', desc: '提醒自己相信內在力量。' },
      { emoji: '🌷', title: '行動力', desc: '陪伴你朝目標一步一步前進。' },
      { emoji: '☁️', title: '穩定情緒', desc: '在忙碌生活中找回平衡感。' },
      { emoji: '🍀', title: '好運能量', desc: '以正向心態迎接新的機會。' },
      { emoji: '🤍', title: '溫柔陪伴', desc: '像小貓一樣安靜地守護著你。' },
    ],
    suitedFor: [
      '正在努力追逐夢想',
      '希望提升自信與行動力',
      '容易因壓力而感到焦慮',
      '喜歡可愛療癒系擺飾',
      '想送自己一份鼓勵與祝福',
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
    category: 'wish',
    material: '白水晶',
    price: 660,
    originalPrice: null,
    tag: '新品',
    images: imgs('wish-bunny', 5),
    img: '/products/wish-bunny/1.jpg',
    features: [
      { emoji: '🤍', title: '白水晶雕刻', desc: '溫潤透亮的質感,散發純淨柔和的光澤。' },
      { emoji: '🐰', title: '可愛兔兔造型', desc: '象徵希望、幸運與美好未來。' },
      { emoji: '☁️', title: '療癒系擺飾', desc: '適合放在書桌、床頭、閱讀角落或工作空間。' },
      { emoji: '🎀', title: '儀式感小物', desc: '陪伴日常生活中的每個重要時刻。' },
    ],
    meanings: [
      { emoji: '🤍', title: '純淨能量', desc: '幫助自己回歸初心,專注於真正重要的事。' },
      { emoji: '🌷', title: '新的開始', desc: '為人生新篇章帶來祝福與勇氣。' },
      { emoji: '☁️', title: '心靈平靜', desc: '在忙碌生活中找到屬於自己的小小喘息空間。' },
      { emoji: '🫧', title: '願望顯化', desc: '提醒自己持續朝夢想前進。' },
      { emoji: '🦋', title: '幸福陪伴', desc: '將生活中的小確幸一點一滴收藏起來。' },
    ],
    suitedFor: [
      '正準備開始新的計畫',
      '希望為自己帶來好心情',
      '喜歡療癒系動物擺飾',
      '想送自己一份溫柔的鼓勵',
      '相信願望與美好會慢慢靠近',
    ],
    story:
      '小時候許願都很大膽:「我想當太空人」、「我想吃糖吃到飽」。\n\n長大以後,願望變得很小聲—— 希望下週不要加班、希望媽媽身體健康、希望今晚能好好睡一覺。\n\n願望變小,不代表你變沒夢想了。是你開始懂得「什麼真正重要」。\n\n這隻白水晶小兔,陪你把那些小小但珍貴的願望好好收著,讓你記得:你還是那個會許願的人。',
    closing:
      '長大的世界很忙。\n但別忘了,心裡還可以留一個位置,給夢想、給期待,也給那個依然相信美好的自己。\n願這隻願望小兔陪伴著你,在每一個平凡的日子裡,依然保有對幸福的想像。 🐰🤍',
  },

  // ── 靜心之光・白菘石柱 (白菘石) ───────────────────────────────────────────
  {
    slug: 'calm-light',
    name: '靜心之光・白菘石柱',
    subtitle: 'Selenite Calm Tower',
    tagline: '有些力量,不是讓你變得更快。\n而是提醒你,慢下來也沒關係。',
    category: 'calm',
    material: '白菘石',
    price: 430,
    originalPrice: null,
    tag: '精選',
    images: imgs('calm-light', 8),
    img: '/products/calm-light/1.jpg',
    features: [
      { emoji: '☁️', title: '天然白菘石', desc: '保留獨特天然紋理,每一顆皆擁有專屬的美麗印記。' },
      { emoji: '🤍', title: '療癒系白色能量', desc: '柔和純淨的色澤,為空間增添平靜氛圍。' },
      { emoji: '🫧', title: '柱形能量設計', desc: '象徵專注、穩定與內在力量的凝聚。' },
      { emoji: '🎀', title: '儀式感擺飾', desc: '適合放置於床頭、書桌、閱讀角落或療癒空間。' },
    ],
    meanings: [
      { emoji: '🤍', title: '放下焦慮', desc: '當思緒過於繁雜時,提醒自己回到當下。' },
      { emoji: '☁️', title: '心靈平靜', desc: '陪伴你找回內在的穩定感。' },
      { emoji: '🌙', title: '舒緩壓力', desc: '在忙碌生活中保留喘息的空間。' },
      { emoji: '🫧', title: '提升耐心', desc: '幫助自己以更溫柔的方式面對生活。' },
      { emoji: '🌷', title: '自我療癒', desc: '學會照顧自己的情緒與感受。' },
    ],
    suitedFor: [
      '經常容易想太多',
      '希望減少焦慮與壓力',
      '喜歡冥想、閱讀或寫日記',
      '想打造療癒放鬆的居家空間',
      '正在學習愛自己與照顧自己',
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
    material: '拉長石',
    price: 260,
    originalPrice: null,
    tag: '靈感',
    images: imgs('moonlight-wings', 3),
    img: '/products/moonlight-wings/1.jpg',
    features: [
      { emoji: '☽', title: '拉長石天然光澤', desc: '在光線下展現夢幻藍光,每個角度都有不同魅力。' },
      { emoji: '🪽', title: '羽翼守護設計', desc: '象徵陪伴、守護與勇氣。' },
      { emoji: '✨', title: '星月元素', desc: '代表希望、願望與宇宙的祝福。' },
      { emoji: '🎀', title: '日常穿搭療癒飾品', desc: '適合日常佩戴或作為儀式感配件收藏。' },
    ],
    meanings: [
      { emoji: '☁️', title: '提升直覺力', desc: '幫助傾聽內心真正的聲音。' },
      { emoji: '🌙', title: '自我探索', desc: '陪伴你認識更真實的自己。' },
      { emoji: '🦋', title: '靈感與創造力', desc: '激發新的想法與可能性。' },
      { emoji: '🤍', title: '能量守護', desc: '成為陪伴自己的溫柔力量。' },
      { emoji: '✨', title: '願望與希望', desc: '在迷惘時依然相信未來。' },
    ],
    suitedFor: [
      '喜歡塔羅與靈性探索',
      '經常依靠直覺做決定',
      '想增加自信與安全感',
      '喜歡月亮與星空元素',
      '尋找具有意義的療癒飾品',
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
    material: '天然礦石',
    price: 780,
    originalPrice: null,
    tag: '招財',
    images: imgs('wealth-stone', 8),
    img: '/products/wealth-stone/1.jpg',
    features: [
      { emoji: '💛', title: '天然礦石原貌', desc: '保留礦體最自然的紋理與結晶,擺著就像一塊小小的能量場。' },
      { emoji: '✨', title: '聚財氣場設計', desc: '叢聚的結晶象徵能量凝聚,有「招進來、留得住」的寓意。' },
      { emoji: '🏠', title: '居家招財擺件', desc: '適合放在客廳財位、辦公桌、收銀台或玄關。' },
      { emoji: '🎀', title: '儀式感入手', desc: '搬新家、開新店、新的職涯起點都很適合。' },
    ],
    meanings: [
      { emoji: '💰', title: '招財納福', desc: '幫助提升金錢流動的順暢度。' },
      { emoji: '🌟', title: '把握機會', desc: '帶來新的合作、客戶與貴人。' },
      { emoji: '🛡️', title: '守住財氣', desc: '減少不必要的破耗與衝動消費。' },
      { emoji: '💼', title: '事業穩定', desc: '陪伴你在工作裡穩穩往前走。' },
      { emoji: '☀️', title: '自信顯化', desc: '提醒自己:你值得擁有富足的生活。' },
    ],
    suitedFor: [
      '想為新事業或新工作開個好頭',
      '希望提升金錢敏感度與行動力',
      '喜歡天然礦石的原始質感',
      '想送給創業中的朋友一份祝福',
    ],
    story:
      '有人說財運是運氣,其實更像「你願不願意相信自己值得」。\n\n有時候機會就在眼前,你卻覺得「應該是別人的」、「我不配」。\n\n這塊礦石擺在桌上,不是真的會讓錢從天上掉下來。\n而是每次你看到它,會被輕輕提醒:\n\n「你做的每一件小事,都在替未來的自己存『運氣』。」\n能不能富足,從你開始相信自己值得,那一刻起算。',
    closing:
      '財富從來不是運氣。\n是你日復一日把自己照顧好、把該做的事做好,宇宙才能把該到你身邊的東西,慢慢送過來。\n願這塊財運礦陪你,把每一次努力都被好好看見。 💛✨',
  },
];

export function getProductFeatureSummary(product: Product, limit = 2): string {
  return product.features
    .slice(0, limit)
    .map((feature) => `${feature.title}：${feature.desc}`)
    .join(' ');
}

export const CATEGORY_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: '全部商品' },
  { id: 'protect', label: '守護平安' },
  { id: 'wish', label: '心願祈福' },
  { id: 'courage', label: '勇氣行動' },
  { id: 'calm', label: '靜心紓壓' },
  { id: 'wealth', label: '招財豐盛' },
];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
