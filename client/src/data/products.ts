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
  priceLabel?: string;
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
    tag: null,
    fitSummary: '適合最近很累、想找回安全感的你',
    gentleRecommendation:
      '微光守護狐偏向安定與界線感，如果你最近也想先把自己穩住，它可以是一個安靜陪在身邊的小提醒。',
    pairingReason:
      '如果你想把安全感與自我保護再加強一點，微光守護狐會是比較溫柔、穩定的陪伴選擇。',
    imageZoom: 1.2,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合想提升魅力、人緣與好運的你',
    gentleRecommendation:
      '心願九尾狐偏向魅力、人緣與心願感，如果你最近也在期待新的連結或機會，它可以陪你把注意力放回自己的光。',
    pairingReason:
      '如果你想讓關係、人緣或願望能量更柔和地被看見，心願九尾狐會是一個可以考慮的小加強。',
    imageZoom: 1.2,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合需要開始行動、給自己一點信心的你',
    gentleRecommendation:
      '勇氣小貓偏向信心與行動力，如果你最近也想給自己一點開始的力量，它可以是一個放在身邊的小陪伴。',
    pairingReason:
      '如果你想把想法慢慢落到行動上，勇氣小貓會更像一個提醒你先踏出一小步的陪伴。',
    imageZoom: 1.24,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合心裡有願望、想溫柔守住期待的你',
    gentleRecommendation:
      '願望小兔偏向新的開始與柔軟信念，如果你最近也有想好好照顧的期待，它可以陪你把願望慢慢放穩。',
    pairingReason:
      '如果你想替心裡那個還沒說出口的願望留一個位置，願望小兔會是很輕柔的加強選擇。',
    imageZoom: 1.22,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合想太多、需要放鬆與釐清的你',
    gentleRecommendation:
      '靜心之光偏向放鬆、釐清與慢下來，如果你最近也覺得思緒太滿，它可以提醒你先回到自己的呼吸。',
    pairingReason:
      '如果你想把情緒和節奏再整理清楚一點，靜心之光會是適合放在桌邊或床邊的小提醒。',
    imageZoom: 1.18,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合正在找方向、想重新相信直覺的你',
    gentleRecommendation:
      '月光守護之翼偏向直覺、守護與方向感，如果你最近也在確認下一步，它可以陪你安靜聽見心裡的聲音。',
    pairingReason:
      '如果你想把直覺與方向感再打開一點，月光守護之翼會是比較輕盈的加強陪伴。',
    imageZoom: 1.26,
    imagePosition: 'center center',
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
    tag: null,
    fitSummary: '適合工作、金錢、事業正在重新累積的你',
    gentleRecommendation:
      '財運礦偏向豐盛、機會與行動力，如果你最近也在整理金錢或工作節奏，它可以提醒你相信自己值得更多。',
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

  // ── 森蘊 ────────────────────────────────────────────────────────────────
  {
    slug: 'forest-bloom',
    name: '森蘊',
    subtitle: 'Forest Verdure Bracelet',
    tagline: '綠色,是一種溫柔的力量。\n像森林的呼吸,讓人慢下來,也重新整理自己。',
    category: 'wealth',
    material: '葡萄石貔貅・綠髮晶・綠幽靈・白水晶',
    price: 1880,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想招財、旺事業、提升貴人運的你',
    gentleRecommendation:
      '森蘊偏向豐盛、事業與穩定累積，如果你最近正在整理工作步伐，它可以陪你用更自然的節奏把好運慢慢收進來。',
    pairingReason:
      '如果你想把財運、貴人與行動力再聚焦一點，森蘊會是溫柔但有累積感的手鍊陪伴。',
    imageZoom: 1.04,
    imagePosition: 'center bottom',
    images: imgs('forest-bloom', 5),
    img: '/products/forest-bloom/1.jpg',
    features: [
      { emoji: '🌿', title: '層層綠意主調', desc: '柔和綠意交織透明層次,像晨霧未散的林間光影。' },
      { emoji: '💚', title: '招財事業能量', desc: '對應招財、旺事業與提升貴人運的寓意。' },
      { emoji: '✨', title: '天然水晶錯落排列', desc: '溫潤礦石在光線下透出細緻光澤,低調卻富有層次。' },
      { emoji: '🎀', title: '日常配戴手鍊', desc: '適合工作、日常與需要穩定累積感的時刻配戴。' },
    ],
    meanings: [
      { emoji: '🌿', title: '葡萄石貔貅', desc: '象徵守護與豐盛,寓意匯聚好運、守住珍惜的人事物。' },
      { emoji: '🌱', title: '綠髮晶', desc: '寓意成長、行動力與堅定信念,鼓勵保持積極步伐。' },
      { emoji: '🍃', title: '綠幽靈', desc: '象徵蛻變與豐盛能量,陪伴人生不同階段穩步向前。' },
      { emoji: '☁️', title: '葡萄石', desc: '寓意希望、平靜與信任,提醒自己放慢腳步聽見內心。' },
      { emoji: '🤍', title: '白水晶', desc: '象徵純淨與平衡,也有放大其他水晶寓意的意涵。' },
    ],
    suitedFor: [
      '想提升財運與事業運',
      '希望吸引貴人與新的機會',
      '正在穩定累積工作成果',
      '喜歡自然綠色系與清透層次',
      '需要一份慢慢整理自己的溫柔提醒',
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
    category: 'wish',
    material: '狐仙・粉晶・月光石・白水晶・黃水晶',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想提升桃花、招財與好人緣的你',
    gentleRecommendation:
      '靈狐星願偏向桃花、人緣與貴人能量，如果你最近想讓自己更柔和地被看見，它會是一條帶著甜感的小提醒。',
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
      { emoji: '🦊', title: '狐仙', desc: '象徵魅力、自信與美好緣分,寓意吸引善緣與貴人。' },
      { emoji: '🌸', title: '粉晶', desc: '象徵柔和與浪漫氣息,呈現溫潤甜美的風格。' },
      { emoji: '🌷', title: '馬粉晶', desc: '色澤偏暖,為整體增添親和與柔亮層次。' },
      { emoji: '🌙', title: '奶油月光石與藍月光石', desc: '帶來細緻霧光與淡淡藍光,展現溫潤優雅。' },
      { emoji: '🤍', title: '白水晶與黃水晶', desc: '清澈純淨中點綴明亮色調,讓整體更有活潑光感。' },
    ],
    suitedFor: [
      '希望提升桃花與個人吸引力',
      '想增加好人緣與貴人運',
      '喜歡粉色系、甜感但不張揚的飾品',
      '想替日常穿搭增加一點柔光',
      '正在收藏一個心裡的小願望',
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
    category: 'wish',
    material: '粉晶・草莓晶・白水晶・藍月光・拉長石',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想照顧桃花、感情與人際關係的你',
    gentleRecommendation:
      '霧裡星光偏向愛自己、感情與人際連結，如果你最近想先把心放柔一點，它會像月光一樣提醒你慢慢靠近自己。',
    pairingReason:
      '如果你想讓關係能量更乾淨柔和，霧裡星光會是氣質、日常又有守護感的搭配。',
    imageZoom: 1.04,
    imagePosition: 'center bottom',
    images: imgs('misty-starlight', 3),
    img: '/products/misty-starlight/1.jpg',
    features: [
      { emoji: '🌙', title: '柔光氣質款', desc: '粉晶與草莓晶交織溫暖悸動,適合日常、約會與工作佩戴。' },
      { emoji: '🤍', title: '乾淨清透層次', desc: '白水晶帶來清澈純淨,藍月光映照內心平靜。' },
      { emoji: '✨', title: '勇氣與守護', desc: '拉長石陪伴自己勇敢前行,在關係裡保有內在力量。' },
      { emoji: '🎀', title: '天然水晶手鍊', desc: '每一顆天然水晶都有獨一無二的紋理與色澤。' },
    ],
    meanings: [
      { emoji: '🤍', title: '粉晶', desc: '象徵愛與包容,提醒自己溫柔面對生活。' },
      { emoji: '🍓', title: '草莓晶', desc: '象徵幸福、人緣與喜悅,陪伴珍貴的人際連結。' },
      { emoji: '🤍', title: '白水晶', desc: '象徵純淨、清澈與平衡,是百搭的晶石寓意。' },
      { emoji: '🌙', title: '藍月光', desc: '如月色般柔和,象徵直覺、溫柔與內在平靜。' },
      { emoji: '✨', title: '拉長石', desc: '象徵勇氣、蛻變與探索,鼓勵勇敢迎接新的旅程。' },
    ],
    suitedFor: [
      '想提升桃花、感情與人際關係',
      '正在練習先好好愛自己',
      '喜歡柔光、乾淨、氣質款手鍊',
      '希望在日常配戴裡保有溫柔守護',
      '想送自己一份關係與內在平靜的提醒',
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
    material: '淨體鈦晶',
    price: 4380,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想清晰思緒、穩定行動與提升自信的你',
    gentleRecommendation:
      '澄光偏向清晰、行動與穩定氣場，如果你最近想把想法整理清楚，它會提醒你把光放回自己身上。',
    pairingReason:
      '如果你想讓行動力更穩、思緒更清楚，澄光會是明亮但不張揚的加強。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('cheng-guang', 2),
    img: '/products/cheng-guang/1.jpg',
    features: [
      { emoji: '✨', title: '淨體鈦晶', desc: '透亮晶體裡帶著細緻金絲光澤,在光影之間低調閃耀。' },
      { emoji: '☀️', title: '清晰思緒', desc: '象徵理性與條理,幫助在混亂時整理想法。' },
      { emoji: '🌟', title: '提升行動力', desc: '給人一種往前推進的力量感,適合目標導向的時刻。' },
      { emoji: '🤍', title: '穩定氣場', desc: '淨體結構清透,常被視為穩定內在節奏的象徵。' },
    ],
    meanings: [
      { emoji: '☀️', title: '清晰思緒', desc: '讓思路慢慢回到清楚的位置。' },
      { emoji: '🌟', title: '行動力量', desc: '陪你把想做的事一步一步推進。' },
      { emoji: '🤍', title: '穩定氣場', desc: '在忙碌裡提醒自己先站穩。' },
      { emoji: '✨', title: '增強自信', desc: '把內在光芒溫柔地帶出來。' },
    ],
    suitedFor: [
      '最近想整理思緒與方向',
      '希望提升行動力與自信',
      '喜歡清透但有金色光澤的手鍊',
      '想要一條穩定又有存在感的日常款',
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
    material: '黑金超七・月光石・白水晶・茶晶',
    price: 0,
    priceLabel: '私訊詢價',
    originalPrice: null,
    tag: null,
    fitSummary: '適合想要溫柔守護、沉穩能量與客製設計的你',
    gentleRecommendation:
      '光羽之境是客製感很強的守護款,偏向溫柔自信、沉穩與內在保護。',
    pairingReason:
      '如果你想要更貼近個人狀態的搭配,光羽之境會是可以私訊討論的客製方向。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('guang-yu-zhi-jing', 4),
    img: '/products/guang-yu-zhi-jing/1.jpg',
    features: [
      { emoji: '🪽', title: '客製化設計', desc: '依照個人狀態與喜好搭配,每一條都有自己的光。' },
      { emoji: '🖤', title: '黑金超七', desc: '呈現深色礦絲交錯的層次,象徵沉穩與守護。' },
      { emoji: '🌙', title: '月光石光澤', desc: '細緻金屬與晶體間閃出柔和光感。' },
      { emoji: '☁️', title: '白水晶調和', desc: '讓整體能量更清透、平衡。' },
    ],
    meanings: [
      { emoji: '🖤', title: '黑金超七', desc: '象徵保護、靈感與內在力量。' },
      { emoji: '🌙', title: '月光石', desc: '帶來柔和直覺與情緒安定。' },
      { emoji: '🤍', title: '白水晶', desc: '協調整體能量,讓心更清明。' },
      { emoji: '🤎', title: '茶晶', desc: '增加沉穩與落地感。' },
    ],
    suitedFor: [
      '想要客製化水晶手鍊',
      '喜歡黑金、白色與月光感搭配',
      '希望提升穩定感與守護感',
      '想把自己的狀態整理成一條專屬手鍊',
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
    category: 'wish',
    material: '白水晶・黃膠花・紅膠花・黃水晶・白瑪瑙',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想要柔軟陪伴、安心感與微甜日常的你',
    gentleRecommendation:
      '狐語微甜偏向安心、微甜與柔軟陪伴,適合把緊繃的心慢慢放鬆。',
    pairingReason:
      '如果你想讓日常多一點甜感與安全感,狐語微甜會是很輕盈的搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/hu-yu-wei-tian/1.jpg', '/products/hu-yu-wei-tian/2.jpg'],
    img: '/products/hu-yu-wei-tian/1.jpg',
    features: [
      { emoji: '🦊', title: '狐仙小墜', desc: '以小狐意象帶出溫柔、魅力與守護感。' },
      { emoji: '🤍', title: '清透白水晶', desc: '包裹著細緻情緒,讓心慢慢安定。' },
      { emoji: '💛', title: '黃膠花與黃水晶', desc: '帶來明亮、溫暖又不刺眼的光。' },
      { emoji: '🌸', title: '紅膠花點綴', desc: '增添柔和甜感,讓整體更有親和力。' },
    ],
    meanings: [
      { emoji: '🦊', title: '狐語陪伴', desc: '提醒你不用急著變成誰期待的樣子。' },
      { emoji: '🤍', title: '白水晶', desc: '象徵清透、整理與安定。' },
      { emoji: '💛', title: '黃水晶', desc: '帶來溫暖自信與明亮心情。' },
      { emoji: '🌸', title: '膠花晶', desc: '讓日常多一點柔軟色彩。' },
    ],
    suitedFor: [
      '喜歡微甜但不過度張揚的手鍊',
      '希望提升安心感與人緣',
      '想要一條有狐仙意象的設計款',
      '容易緊繃,想提醒自己慢慢來',
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
    category: 'calm',
    material: '日月同輝・斯里蘭卡藍月光・茶晶',
    price: 1480,
    originalPrice: null,
    tag: null,
    fitSummary: '適合日常百搭、喜歡奶金色調與溫柔光感的你',
    gentleRecommendation:
      '焦糖瑪奇朵偏向溫柔、安心與日常百搭,適合把情緒慢慢調回舒服的狀態。',
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
      { emoji: '🌙', title: '月光石', desc: '象徵溫柔直覺與情緒流動。' },
      { emoji: '🤎', title: '茶晶', desc: '協助安定、沉穩與安心。' },
      { emoji: '☕', title: '奶金色調', desc: '帶來剛剛好的暖意。' },
      { emoji: '🤍', title: '柔和存在', desc: '不張揚,卻讓人越看越舒服。' },
    ],
    suitedFor: [
      '喜歡奶茶、焦糖與溫柔棕金色系',
      '想要日常百搭不挑風格',
      '希望情緒多一點安定感',
      '偏愛柔和但有細節的設計',
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
    category: 'calm',
    material: '貔貅・藍晶石・海藍寶・霧海藍寶・白水晶',
    price: 1780,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想穩定情緒、安定表達與回到內在平靜的你',
    gentleRecommendation:
      '藍境之曜偏向平靜、表達與沉穩清晰,適合需要讓心慢慢安靜下來的時候。',
    pairingReason:
      '如果你想讓情緒與溝通更順,藍境之曜會是清爽又沉穩的搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: ['/products/lan-jing-zhi-yao/3.jpg', '/products/lan-jing-zhi-yao/4.jpg'],
    img: '/products/lan-jing-zhi-yao/3.jpg',
    features: [
      { emoji: '🐉', title: '貔貅守護', desc: '以貔貅意象帶來招財、守護與穩定氣場。' },
      { emoji: '💙', title: '藍晶石綴珠', desc: '象徵守護與延展好運,帶著清晰安定的能量。' },
      { emoji: '🌊', title: '海藍寶層次', desc: '藍色晶體交織出如海洋般的寧靜氣息。' },
      { emoji: '🤍', title: '白水晶映照', desc: '純淨光感讓整體更透明、協調。' },
    ],
    meanings: [
      { emoji: '🐉', title: '貔貅', desc: '象徵招財、守護與穩定能量。' },
      { emoji: '💙', title: '藍晶石', desc: '象徵清晰、守護與平衡。' },
      { emoji: '🌊', title: '海藍寶', desc: '對應平靜、溝通與舒緩。' },
      { emoji: '☁️', title: '霧海藍寶', desc: '帶來柔霧般的溫和色澤。' },
    ],
    suitedFor: [
      '容易想太多,想讓心靜下來',
      '希望溝通更柔和清楚',
      '喜歡藍色、海洋感與清透層次',
      '想要一條安靜但有質感的手鍊',
    ],
    story:
      '當你覺得心裡很吵,也許不是需要更多答案,而是需要一片安靜的藍。\n\n藍境之曜把貔貅守護與海藍色晶石串在一起,像把海戴在手腕上,讓每一次呼吸都慢慢回到自己的節奏。',
    closing:
      '願藍境之曜陪你把情緒放慢,把話說清楚。\n在平靜與力量之間,找到屬於自己的光。 💙',
  },
  {
    slug: 'liu-jin-zhi-yao',
    name: '鎏金之耀',
    subtitle: 'Gilded Radiance Bracelet',
    tagline: '金色,不一定要張揚。\n它也可以溫柔、細緻、剛剛好。',
    category: 'wealth',
    material: '鈦晶・黃水晶・茶晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想提升財運、自信與日常亮點的你',
    gentleRecommendation:
      '鎏金之耀偏向金色能量、財運與自信,適合想把光芒穩穩戴在身上的你。',
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
      { emoji: '💛', title: '鈦晶', desc: '象徵自信、財氣與光芒。' },
      { emoji: '🍯', title: '黃水晶', desc: '對應豐盛、明亮與好運。' },
      { emoji: '🤎', title: '茶晶', desc: '增加沉穩與安全感。' },
      { emoji: '🤍', title: '白水晶', desc: '協調整體能量。' },
    ],
    suitedFor: [
      '想提升財運與自信',
      '喜歡金色但不想太浮誇',
      '希望日常搭配多一點亮點',
      '正在累積工作與金錢能量',
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
    category: 'wish',
    material: '草莓晶・綠幽靈・粉晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡甜而不膩、柔和桃花與清透層次的你',
    gentleRecommendation:
      '莓語心願偏向甜美、人緣與溫柔心願,適合想讓日常多一點柔光的你。',
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
      { emoji: '🍓', title: '草莓晶', desc: '象徵幸福、人緣與愉悅。' },
      { emoji: '🌿', title: '綠幽靈', desc: '帶來自然層次與成長感。' },
      { emoji: '🌸', title: '粉晶', desc: '柔和心緒與關係能量。' },
      { emoji: '🤍', title: '白水晶', desc: '清透平衡,讓能量更協調。' },
    ],
    suitedFor: [
      '想為生活添一點甜甜的色彩',
      '喜歡草莓色系與柔光質感',
      '希望提升人緣與好心情',
      '想要一條清甜但不膩的日常款',
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
    category: 'calm',
    material: '茶晶・粉晶・紅石榴・奶油月光・紫光晶・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想要溫柔陪伴、人際連結與內在安放的你',
    gentleRecommendation:
      '暖語偏向安靜陪伴、粉晶能量與內在力量,適合在日常中慢慢安放自己。',
    pairingReason:
      '如果你想讓配戴感更柔軟、更有人際連結感,暖語會是舒服的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('nuan-yu', 3),
    img: '/products/nuan-yu/1.jpg',
    features: [
      { emoji: '🤎', title: '茶晶穩定', desc: '帶來沉穩安定的象徵。' },
      { emoji: '🌸', title: '粉晶連結', desc: '象徵柔和人際與愛自己的能量。' },
      { emoji: '🌙', title: '奶油月光', desc: '柔和陪伴與情緒平衡。' },
      { emoji: '🤍', title: '白水晶協調', desc: '讓整體能量更乾淨平衡。' },
    ],
    meanings: [
      { emoji: '🤎', title: '茶晶', desc: '沉穩與安定的象徵。' },
      { emoji: '🌸', title: '粉晶', desc: '溫柔與人際連結。' },
      { emoji: '❤️', title: '紅石榴', desc: '帶來內在力量與熱度。' },
      { emoji: '🌙', title: '奶油月光', desc: '柔和陪伴與平衡。' },
    ],
    suitedFor: [
      '希望多一點溫柔陪伴',
      '正在整理人際與情緒',
      '喜歡茶晶、粉晶與月光石搭配',
      '想把今天的自己好好接住',
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
    category: 'calm',
    material: '海藍寶・藍摩根石・藍晶石・蛋白石・白水晶',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡海洋色調、清爽不單調與溫柔氣場的你',
    gentleRecommendation:
      '蔚藍微光偏向海洋般的平靜、清爽與氣質感,適合想放慢情緒的人。',
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
      { emoji: '🌊', title: '海藍寶', desc: '象徵平靜、舒緩與溝通。' },
      { emoji: '💙', title: '藍晶石', desc: '呈現清晰與安定的層次。' },
      { emoji: '🫧', title: '蛋白石', desc: '細碎閃光如浪面光影。' },
      { emoji: '🤍', title: '白水晶', desc: '讓整體更加清透協調。' },
    ],
    suitedFor: [
      '喜歡清爽海洋色系',
      '想要低調但有細節的手鍊',
      '希望情緒更平靜穩定',
      '偏愛清爽穿搭風格',
    ],
    story:
      '有些藍色不是憂鬱,而是讓人安靜下來的海。\n\n蔚藍微光把海藍寶、藍晶石與蛋白石串成一點點海風,讓你在忙碌日常裡,也能留一口呼吸的空間。',
    closing:
      '願蔚藍微光陪你把心放回平靜的地方。\n像海一樣柔軟,也像海一樣有力量。 🌊',
  },
  {
    slug: 'wen-rou-yue-guang',
    name: '溫柔月光',
    subtitle: 'Tender Moonlight Bracelet',
    tagline: '讓柔柔的月光色調落在手腕上。\n像夜晚的一抹光,安靜卻不失存在感。',
    category: 'calm',
    material: '月光石・奶油月光石・藍月光石・白水晶',
    price: 1580,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡月光色系、溫柔氣質與百搭設計的你',
    gentleRecommendation:
      '溫柔月光偏向情緒平衡、氣質與柔和陪伴,適合想把節奏放慢一點的你。',
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
      { emoji: '🌙', title: '月光能量', desc: '象徵溫柔、直覺與情緒平衡。' },
      { emoji: '🫧', title: '奶油月光', desc: '帶來安靜柔和的氣質。' },
      { emoji: '💙', title: '藍月光', desc: '增添細緻層次與神秘感。' },
      { emoji: '🤍', title: '白水晶', desc: '讓整體更透明、協調。' },
    ],
    suitedFor: [
      '喜歡月光色系與溫柔風格',
      '想要一條日常百搭手鍊',
      '希望情緒更平衡安定',
      '偏愛細緻、乾淨的設計',
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
    material: '黃塔山・白水晶・藍月光・茶晶',
    price: 1980,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想提升財運、自信光芒與溫柔氣質的你',
    gentleRecommendation:
      '曦光之詠偏向金色豐盛、自信與柔和穩定,適合想讓自己慢慢亮起來的你。',
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
      { emoji: '💛', title: '黃塔山', desc: '金色質感溫潤細膩,呈現沉穩而優雅的光感。' },
      { emoji: '🤍', title: '白水晶', desc: '象徵純粹與平衡之美。' },
      { emoji: '💙', title: '藍月光', desc: '增添柔和與細膩層次。' },
      { emoji: '🤎', title: '茶晶', desc: '為整體帶來沉穩質感。' },
    ],
    suitedFor: [
      '想提升財運與自信感',
      '喜歡金色但偏溫柔的設計',
      '想要明亮又不張揚的手鍊',
      '希望在日常中多一點光',
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
    tagline: '有些情緒不需要被放大。\n只是輕輕地,在心裡說給自己聽。',
    category: 'calm',
    material: '斯里蘭卡藍月光・白幽靈',
    price: 1280,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想安撫情緒、整理內在與重新開始的你',
    gentleRecommendation:
      '心語呢喃偏向溫柔安撫、內在整理與重新開始,適合低潮時陪自己慢慢復原。',
    pairingReason:
      '如果你想讓情緒被好好接住,心語呢喃會是很柔軟的陪伴。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xin-yu-ni-nan', 3),
    img: '/products/xin-yu-ni-nan/1.jpg',
    features: [
      { emoji: '🌙', title: '斯里蘭卡藍月光', desc: '象徵溫柔感受與內在直覺。' },
      { emoji: '🤍', title: '白幽靈', desc: '象徵純淨、整理與重新開始。' },
      { emoji: '💗', title: '柔軟陪伴', desc: '不是提醒你振作,而是陪你好好安放。' },
      { emoji: '✨', title: '14K 包金配件', desc: '細緻金色點綴,讓整體更精緻。' },
    ],
    meanings: [
      { emoji: '🌙', title: '藍月光', desc: '陪伴敏感情緒,讓心慢慢放鬆。' },
      { emoji: '🤍', title: '白幽靈', desc: '象徵純淨、整理與新的開始。' },
      { emoji: '💗', title: '內在安撫', desc: '給低潮的自己一點柔軟空間。' },
      { emoji: '✨', title: '細緻配件', desc: '以精緻感陪伴日常穿搭。' },
    ],
    suitedFor: [
      '最近有些情緒想慢慢整理',
      '希望被溫柔陪伴與安撫',
      '喜歡月光石與白幽靈的清透感',
      '想把重新開始的提醒戴在身上',
    ],
    story:
      '不是所有情緒都要被說出口。\n\n有時候你只是需要一個安靜的位置,讓心裡的聲音慢慢被自己聽見。\n\n心語呢喃陪你把那些沒說出口的感受,輕輕安放好。',
    closing:
      '願心語呢喃陪你在安靜裡慢慢整理自己。\n你不需要立刻好起來,你只需要被好好陪著。 🤍',
  },
  {
    slug: 'xing-yao-zhi-xing',
    name: '星曜之星',
    subtitle: 'Stellar Black Super Seven Bracelet',
    tagline: '黑金超七不是超十呦。\n柔軟不代表脆弱,沉穩也可以帶著光。',
    category: 'protect',
    material: '黑金超七',
    price: 1480,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想要防護能量、穩定氣場與低調深色質感的你',
    gentleRecommendation:
      '星曜之星偏向防護、穩定與自我力量,適合想在混亂裡保有自己節奏的人。',
    pairingReason:
      '如果你想要一條低調卻有保護感的深色款,星曜之星會很適合。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xing-yao-zhi-xing', 2),
    img: '/products/xing-yao-zhi-xing/1.jpg',
    features: [
      { emoji: '🖤', title: '黑金超七主石', desc: '黑金超七是帶有深色礦絲、金銅髮與多種共生礦物感的水晶,視覺上沉穩又有細緻光澤。' },
      { emoji: '🛡️', title: '防護意象', desc: '象徵能量保護與正向流動。' },
      { emoji: '✨', title: '層層礦絲', desc: '展現沉穩與光澤並存的質感。' },
      { emoji: '🌙', title: '低調設計', desc: '適合喜歡內斂力量感的日常配戴。' },
    ],
    meanings: [
      { emoji: '🖤', title: '黑金超七', desc: '象徵防護、穩定與內在力量。' },
      { emoji: '🛡️', title: '能量守護', desc: '在混亂中提醒自己保有界線。' },
      { emoji: '✨', title: '沉穩帶光', desc: '不張揚,但仍有自己的光。' },
      { emoji: '🌙', title: '深色質感', desc: '低調且適合日常搭配。' },
    ],
    suitedFor: [
      '希望提升防護與界線感',
      '喜歡深色、沉穩、有光澤的設計',
      '容易被外界影響,想回到自己',
      '想要一條低調但有力量的手鍊',
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
    category: 'calm',
    material: '白水晶小熊・奶油月光石・白水晶切面珠',
    price: 1380,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡白色調、純淨氣質與送禮日常搭配的你',
    gentleRecommendation:
      '雪境溫柔偏向純淨、柔和與安靜陪伴,適合想讓生活變得清爽一點的你。',
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
      { emoji: '🐻', title: '白水晶小熊', desc: '象徵純白氣圍與溫柔陪伴。' },
      { emoji: '🌙', title: '奶油月光石', desc: '呈現柔霧般的光感。' },
      { emoji: '🤍', title: '白水晶', desc: '讓整體更透亮清新。' },
      { emoji: '❄️', title: '雪境感', desc: '像一層安靜的白,讓心慢慢沉澱。' },
    ],
    suitedFor: [
      '喜歡白色調與純淨氣質',
      '想要清爽百搭的手鍊',
      '正在尋找日常送禮款',
      '希望有一份安靜溫柔的陪伴',
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
    category: 'wish',
    material: '彩月光石・五貓守護・琉璃・果果・阿喵・餅餅',
    price: 980,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡彩月光、可愛守護與溫柔堅定能量的你',
    gentleRecommendation:
      '月映柔光偏向彩月光的平衡、可愛守護與自信提醒,適合想被溫柔陪伴的人。',
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
      { emoji: '🌙', title: '彩月光', desc: '象徵平衡、安定與溫柔氣場。' },
      { emoji: '🐱', title: '五貓守護', desc: '給你安心、提醒與陪伴。' },
      { emoji: '✨', title: '自信之光', desc: '提醒自己值得被看見。' },
      { emoji: '🍪', title: '純真喜悅', desc: '提醒生活裡仍有小確幸。' },
    ],
    suitedFor: [
      '喜歡可愛守護系設計',
      '想要彩月光石的溫柔光暈',
      '希望多一點安心與自信',
      '想收藏有角色故事的手鍊',
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
    material: '銀曜石・月光石・白水晶',
    price: 1380,
    originalPrice: null,
    tag: null,
    fitSummary: '適合喜歡黑白灰色調、星花墜飾與穩定守護感的你',
    gentleRecommendation:
      '月影織花偏向安定、守護與深色質感,適合想要低調但有亮點的手鍊。',
    pairingReason:
      '如果你想讓守護感更精緻、穿搭更有個性,月影織花會是很有辨識度的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('yue-ying-zhi-hua', 1),
    img: '/products/yue-ying-zhi-hua/1.jpg',
    features: [
      { emoji: '🌹', title: '月影織花主題', desc: '以星花墜飾與黑白灰色調打造低調光感。' },
      { emoji: '🖤', title: '銀曜石', desc: '帶來沉穩、界線與守護的象徵。' },
      { emoji: '🌙', title: '月光石柔光', desc: '在深色主調中加入溫柔細節。' },
      { emoji: '🤍', title: '白水晶透亮', desc: '讓整體不沉重,保留清透平衡。' },
    ],
    meanings: [
      { emoji: '🖤', title: '銀曜石', desc: '象徵守護、界線與穩定。' },
      { emoji: '🌙', title: '月光石', desc: '帶來柔和直覺與微光。' },
      { emoji: '🤍', title: '白水晶', desc: '協調整體能量與視覺。' },
      { emoji: '🌹', title: '星花墜飾', desc: '讓低調設計中保有亮點。' },
    ],
    suitedFor: [
      '喜歡黑白灰、低調中有細節的手鍊',
      '想要穩定守護與界線感',
      '偏愛星星、花朵或月光元素',
      '希望日常穿搭更有個性亮點',
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
    material: '黃水晶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想招財聚富、穩定情緒與整理能量的你',
    gentleRecommendation:
      '曦光偏向招財、安定與能量淨化,適合想把金錢與生活節奏慢慢整理清楚的你。',
    pairingReason:
      '如果你想讓日常多一點明亮與豐盛感,曦光會是輕盈、好配戴的選擇。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('xi-guang', 2),
    img: '/products/xi-guang/1.jpg',
    features: [
      { emoji: '☀️', title: '黃水晶主調', desc: '明亮清透的黃色光感,象徵招財聚富與自信行動。' },
      { emoji: '🌙', title: '月光石柔光', desc: '在豐盛能量中加入溫柔安定的平衡。' },
      { emoji: '🤍', title: '白阿塞與白水晶', desc: '協助淨化能量、平衡磁場,讓整體更清爽。' },
      { emoji: '🎀', title: '天然水晶手鍊', desc: '精心挑選與搭配,成為陪伴自己前進的日常能量。' },
    ],
    meanings: [
      { emoji: '☀️', title: '黃水晶', desc: '招財聚富,提醒自己相信豐盛值得靠近。' },
      { emoji: '🌙', title: '月光石', desc: '安定情緒,讓心在變動裡慢慢穩下來。' },
      { emoji: '🤍', title: '白阿塞', desc: '淨化能量,把雜訊與疲憊輕輕放下。' },
      { emoji: '✨', title: '白水晶', desc: '平衡磁場,協調整體能量與日常節奏。' },
    ],
    suitedFor: [
      '想提升財運與豐盛感',
      '希望穩定情緒與生活節奏',
      '喜歡明亮清透的手鍊',
      '想要一條日常好配戴的能量款',
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
    category: 'wish',
    material: '粉水晶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想練習溝通表達、安定情緒與溫柔連結的你',
    gentleRecommendation:
      '暖櫻偏向溝通、柔軟與人際連結,適合想讓心情放鬆、把話說得更溫柔清楚的你。',
    pairingReason:
      '如果你想讓關係裡多一點柔和與安心感,暖櫻會是甜而不膩的日常陪伴。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('nuan-ying', 2),
    img: '/products/nuan-ying/1.jpg',
    features: [
      { emoji: '🌸', title: '粉水晶主調', desc: '柔和粉色帶來親和氣息,象徵溝通表達與溫柔連結。' },
      { emoji: '🌙', title: '月光石安定感', desc: '協助情緒慢慢回到平衡,讓表達更穩。' },
      { emoji: '🤍', title: '白阿塞淨化', desc: '讓心裡的雜訊被整理,保留更清澈的感受。' },
      { emoji: '✨', title: '白水晶平衡', desc: '協調整體能量,讓日常配戴更輕盈。' },
    ],
    meanings: [
      { emoji: '🌸', title: '粉水晶', desc: '溝通表達,讓溫柔也能被好好說出口。' },
      { emoji: '🌙', title: '月光石', desc: '安定情緒,陪你在關係裡保持柔軟與清醒。' },
      { emoji: '🤍', title: '白阿塞', desc: '淨化能量,把不必要的緊繃慢慢放下。' },
      { emoji: '✨', title: '白水晶', desc: '平衡磁場,讓內在狀態更協調。' },
    ],
    suitedFor: [
      '想練習把感受說清楚',
      '希望人際與關係更柔和',
      '喜歡粉色系與溫柔氣質',
      '需要安定情緒與淨化能量的陪伴',
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
    category: 'calm',
    material: '海藍寶・月光石・白阿塞・白水晶',
    price: 780,
    originalPrice: null,
    tag: null,
    fitSummary: '適合想加強溝通表達、安定情緒與清理雜訊的你',
    gentleRecommendation:
      '靜瀾偏向溝通、安定與清澈感,適合想把情緒整理好,再好好說出心裡話的你。',
    pairingReason:
      '如果你想讓心更安靜、表達更順,靜瀾會是清爽又穩定的日常搭配。',
    imageZoom: 1,
    imagePosition: 'center center',
    images: imgs('jing-lan', 2),
    img: '/products/jing-lan/1.jpg',
    features: [
      { emoji: '🌊', title: '海藍寶主調', desc: '清透藍色帶來安靜感,象徵溝通表達與心緒整理。' },
      { emoji: '🌙', title: '月光石柔和光暈', desc: '為清爽藍色中加入溫柔安定的節奏。' },
      { emoji: '🤍', title: '白阿塞淨化', desc: '協助把雜訊慢慢沉澱,讓能量更乾淨。' },
      { emoji: '✨', title: '白水晶平衡', desc: '調和整體能量,讓配戴感更清澈輕盈。' },
    ],
    meanings: [
      { emoji: '🌊', title: '海藍寶', desc: '溝通表達,陪你把心裡的話說得更清楚。' },
      { emoji: '🌙', title: '月光石', desc: '安定情緒,在起伏裡保留溫柔的空間。' },
      { emoji: '🤍', title: '白阿塞', desc: '淨化能量,協助放下多餘的疲憊與干擾。' },
      { emoji: '✨', title: '白水晶', desc: '平衡磁場,讓內外狀態慢慢回到一致。' },
    ],
    suitedFor: [
      '想讓溝通表達更順暢',
      '容易把情緒悶在心裡',
      '喜歡清爽藍白色系',
      '希望有一條安靜、乾淨、日常的水晶手鍊',
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
    '這款商品對應「靜心、釐清、放鬆」的能量，適合你在情緒混亂或想太多時，把注意力慢慢收回自己身上。',
  'moonlight-wings':
    '這款商品對應「直覺、守護、重新整理」的能量，適合你在不確定下一步時，陪你安靜聽見心裡真正的方向。',
  'wealth-stone':
    '這款商品對應「豐盛、機會、行動力」的能量，適合你在整理金錢、工作或自我價值時，提醒自己把焦慮轉成實際行動。',
  'forest-bloom':
    '這款商品對應「招財、事業、貴人」的能量，適合你在工作與金錢能量需要穩定累積時，提醒自己用自然節奏迎接機會。',
  'starwish-fox-bracelet':
    '這款商品對應「桃花、招財、好人緣」的能量，適合你在想提升魅力、善緣與日常亮點時，把自信溫柔戴回身上。',
  'misty-starlight':
    '這款商品對應「桃花、感情、人際關係」的能量，適合你在練習愛自己與整理關係時，陪你保有柔軟清透的心。',
};

const CATEGORY_RECOMMENDATION_REASONS: Record<string, string> = {
  protect:
    '這款商品對應「安定、保護、界線」的能量，適合你在需要穩住自己時，提醒內心慢慢回到安全的位置。',
  wish:
    '這款商品對應「心願、吸引力、溫柔連結」的能量，適合你在期待新的關係、機會或祝福時，陪你守住心裡的願望。',
  courage:
    '這款商品對應「勇氣、突破、開始」的能量，適合你在需要採取行動時，提醒自己不用一次完美，只要先開始。',
  calm:
    '這款商品對應「靜心、釐清、放鬆」的能量，適合你在思緒很多時，陪你把節奏慢慢調回來。',
  wealth:
    '這款商品對應「豐盛、機會、行動力」的能量，適合你在面對工作、金錢與自我價值時，提醒自己值得被看見。',
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
  _context?: string,
  role: 'primary' | 'secondary' = 'primary',
): string {
  const body = role === 'secondary' ? product.pairingReason : product.gentleRecommendation;
  return body;
}

export const CATEGORY_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: '全部商品' },
  { id: 'custom-bracelet', label: '客製化水晶手鍊' },
  { id: 'protect', label: '守護平安' },
  { id: 'wish', label: '心願祈福' },
  { id: 'courage', label: '勇氣行動' },
  { id: 'calm', label: '靜心紓壓' },
  { id: 'wealth', label: '招財豐盛' },
];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
