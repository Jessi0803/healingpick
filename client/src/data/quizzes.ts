/**
 * SOUL EASE | Mochi．crystal — Quiz Catalog
 * Hand-crafted spiritual quizzes (Zero Running Cost).
 */

export interface QuizOption {
  text: string;
  scoreKey: string; // Key to track the choice: "A", "B", "C", "D", "E"
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  key: string;
  title: string;
  subtitle?: string;
  description: string;
  crystalSlug: string; // The matching product's slug in PRODUCTS
}

export interface Quiz {
  slug: string;
  name: string;
  subtitle: string;
  desc: string;
  emoji: string;
  colorGrad: string; // Morandi color gradient for the background blob
  questions: QuizQuestion[];
  results: Record<string, QuizResult>;
}

export const QUIZZES: Quiz[] = [
  // ── 1. Niche Fragrance Scent Quiz ──────────────────────────────────────────
  {
    slug: 'scent',
    name: '你在別人眼中是什麼香味？',
    subtitle: 'Your Soul Fragrance',
    desc: '從日常與深層直覺中，探尋你給人留下的第一印象與靈魂香氣。',
    emoji: '🌷',
    colorGrad: 'from-[#FAF0EC]/60 to-[#FCEEE9]/40',
    questions: [
      {
        question: '當你步入一間光線溫暖的咖啡店，你直覺會選擇哪個角落坐下？',
        options: [
          { text: '靠窗、能看見街景與落雨的單人沙發', scoreKey: 'C' },
          { text: '吧檯旁、能聞到現磨咖啡與溫潤木頭香氣的木椅', scoreKey: 'B' },
          { text: '落地窗旁、有盎然綠意盆栽環繞的雙人圓桌', scoreKey: 'A' },
          { text: '角落裡、亮著一盞復古黃光檯燈的沙發座', scoreKey: 'D' },
        ],
      },
      {
        question: '清晨醒來，最能讓你感到靈魂甦醒的日常環境音是？',
        options: [
          { text: '微風吹動風鈴，傳來清脆悅耳的叮噹聲', scoreKey: 'A' },
          { text: '窗外傳來輕柔均勻的淅淅瀝瀝雨聲', scoreKey: 'C' },
          { text: '磨豆機運轉的低沉嗡嗡聲與烘焙豆香', scoreKey: 'B' },
          { text: '窗邊微弱但溫暖的晨光鳥鳴與樹葉沙沙聲', scoreKey: 'D' },
        ],
      },
      {
        question: '在一個悠閒的午後，你最想拆開哪一封「宇宙的信件」？',
        options: [
          { text: '繫著柔粉色絲帶、散發淡淡蜜桃果香的精緻信封', scoreKey: 'A' },
          { text: '用黃銅火漆印章封口、沉甸甸而溫潤的古老羊皮紙信', scoreKey: 'B' },
          { text: '夾著一片乾燥綠葉、摸起來粗糙素雅的米白棉紙信', scoreKey: 'C' },
          { text: '鑲著暗金邊框、印有精緻復古玫瑰壓紋的暗紅色信封', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '白桃烏龍',
        subtitle: 'White Peach Oolong',
        description: '甜而不膩，純真溫柔。你就像一杯初夏的白桃烏龍，散發著淡淡的清甜茶香與明朗能量。你天生帶有治癒他人的親和力，讓人感到溫暖且不自覺想要靠近。',
        crystalSlug: 'wish-fox',
      },
      B: {
        key: 'B',
        title: '白麝香',
        subtitle: 'White Musk',
        description: '純粹乾淨，沉穩安心。你給人的感覺像是剛洗淨的棉被曬過太陽後的溫暖質感，低調、柔和，卻能讓人感到無比的放鬆與信任，是不經意間最溫柔的陪伴。',
        crystalSlug: 'wish-bunny',
      },
      C: {
        key: 'C',
        title: '雨後森林',
        subtitle: 'Forest After Rain',
        description: '清新冷冽，獨立深邃。你擁有一個無比廣闊的內在精神世界，像是一場暴雨過後初醒的松針深林，帶著草木與露水的清冷氣息，神祕、冷靜且充滿靈性魅力。',
        crystalSlug: 'calm-light',
      },
      D: {
        key: 'D',
        title: '玫瑰花園',
        subtitle: 'Rose Garden',
        description: '高雅浪漫，靈魂優雅。你天生帶有一種迷人的浪漫氣場，像是一座在月光下盛開的午夜玫瑰花園，高貴、精緻，靈魂中洋溢著藝術與追求生命極致美的內在力量。',
        crystalSlug: 'moonlight-wings',
      },
    },
  },

  // ── 2. Soul Home Quiz ──────────────────────────────────────────────────────
  {
    slug: 'soul-home',
    name: '你的靈魂住在哪裡？',
    subtitle: 'Where Your Soul Dwells',
    desc: '穿過潛意識的迷霧，追尋那處能讓你感到絕對平靜與歸屬的精神原鄉。',
    emoji: '☁︎',
    colorGrad: 'from-[#E5DFEE]/60 to-[#F0EBF8]/40',
    questions: [
      {
        question: '當你走進夢境的森林，眼前出現四條光影小路，你會直覺走上哪一條？',
        options: [
          { text: '灑滿藍色月光、漂浮著淡金色螢光粒子的銀砂小徑', scoreKey: 'A' },
          { text: '能聽到遠處溫柔潮汐起伏聲、鋪滿貝殼的細沙路', scoreKey: 'B' },
          { text: '巨木參天、飄著清香松針與青苔氣息的古老泥土路', scoreKey: 'C' },
          { text: '兩旁點綴著復古暖黃街燈、鋪著磚石的精緻街道', scoreKey: 'D' },
        ],
      },
      {
        question: '如果能在房間裡擁有一扇看見宇宙任何風景的魔法窗戶，你希望窗外是？',
        options: [
          { text: '浩瀚無垠的寂靜深空，與遠處緩緩旋轉的淡藍星雲', scoreKey: 'A' },
          { text: '拍打著礁石的金色碎浪，以及永不落幕的絕美夕陽地平線', scoreKey: 'B' },
          { text: '晨霧繚繞的紅杉木樹冠，偶爾還能看見在枝頭跳躍的小動物', scoreKey: 'C' },
          { text: '炊煙裊裊的橘瓦屋頂群，以及街角盛開的彩色繡球花叢', scoreKey: 'D' },
        ],
      },
      {
        question: '在漫長而疲憊的日常旅途中，最能徹底釋放你內在壓力的療癒狀態是？',
        options: [
          { text: '一個人在深夜安靜的房間裡，完全沉浸於不受干擾的冥想或閱讀', scoreKey: 'A' },
          { text: '漫步在海風吹拂的沙灘上，將雙腳浸泡在溫暖的海水中聆聽潮起潮落', scoreKey: 'B' },
          { text: '踩在厚厚的落葉上，大口呼吸森林深處清新且略帶微涼的草木空氣', scoreKey: 'C' },
          { text: '在街角溫馨明亮的茶館裡，與懂得自己的三五好友聊著溫柔的生活日常', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '靜謐月球',
        subtitle: 'The Lunar Sanctuary',
        description: '你的靈魂居住在浩瀚星空的靜謐月球。你擁有極強的直覺力與神祕的內在洞察力，擅長在安靜的獨處中與自己對話，不隨波逐流，是個優雅的心靈探索者。',
        crystalSlug: 'moonlight-wings',
      },
      B: {
        key: 'B',
        title: '溫柔海邊',
        subtitle: 'The Seaside Retreat',
        description: '你的靈魂居住在海風輕撫的溫柔沙灘。你熱愛自由、胸懷寬廣，感情豐富且帶有如水一般的包容治癒力，能在潮汐的起伏中，溫柔地與生命中的一切和解。',
        crystalSlug: 'wish-fox',
      },
      C: {
        key: 'C',
        title: '巨木森林',
        subtitle: 'The Ancient Forest',
        description: '你的靈魂居住在參天古木守護的靜謐森林。你踏實、穩重，擁有與大自然深深連結的沉靜力量，自我修復能力極強，能像大樹一般，成為身邊朋友最安心的港灣。',
        crystalSlug: 'glimmer-fox',
      },
      D: {
        key: 'D',
        title: '童話小鎮',
        subtitle: 'The Fairy-tale Town',
        description: '你的靈魂居住在溫馨和諧的童話小鎮。你細膩體貼，特別熱愛生活中精緻的小儀式感，懂得在柴米油鹽的日常裡發現小確幸，用溫度的光芒溫暖身邊的每一個人。',
        crystalSlug: 'courage-cat',
      },
    },
  },

  // ── 3. Past Life Quiz ──────────────────────────────────────────────────────
  {
    slug: 'past-life',
    name: '你的前世在忙什麼？',
    subtitle: 'Your Past Life Chronicles',
    desc: '喚醒埋藏在靈魂最深處的記憶碎片，窺探前世引領你前行的精神宿命。',
    emoji: '🔮',
    colorGrad: 'from-[#D4E0CE]/60 to-[#E1EDDB]/40',
    questions: [
      {
        question: '在神祕夢境中，你被引導進入一間古老寶庫，只能帶走一件工具，你會選擇？',
        options: [
          { text: '一卷記載著星象與宇宙奧秘軌跡的羊皮紙星圖', scoreKey: 'C' },
          { text: '一只裝滿神祕種子與乾燥花草、能調配秘藥的藤編包', scoreKey: 'B' },
          { text: '一支筆尖亮著微光、能將心中所想繪成真實的魔法畫筆', scoreKey: 'D' },
          { text: '一把象徵著榮譽與智慧、用古老原礦打造的精緻配劍', scoreKey: 'A' },
          { text: '一幅標記著未知邊境大陸與海洋、有些斑駁的航海圖', scoreKey: 'E' },
        ],
      },
      {
        question: '如果能穿越回到過去某個理想時代度過一天，你最想置身於哪種環境？',
        options: [
          { text: '宏偉寧靜的王宮圖書館，與智者共同翻閱古老的歷史文獻', scoreKey: 'A' },
          { text: '隱居在迷霧山谷裡的林間木屋，在陽光下研磨花草的藥效', scoreKey: 'B' },
          { text: '高聳的尖頂占星塔，在萬籟俱寂的深夜用望遠鏡記錄星軌', scoreKey: 'C' },
          { text: '繁華街角的文藝復興露天畫室，在悠揚樂聲中自由揮灑畫筆', scoreKey: 'D' },
          { text: '搭乘一艘迎風啟航的帆船，航行在充滿風暴與機遇的未知航道', scoreKey: 'E' },
        ],
      },
      {
        question: '前世沉睡在你靈魂中的那個自己，最常對生活說的一句座右銘是？',
        options: [
          { text: '「世間權衡皆需清明，用智慧指引迷茫的人群。」', scoreKey: 'A' },
          { text: '「世間萬物皆有靈性，用愛與自然去治癒每一道傷痛。」', scoreKey: 'B' },
          { text: '「與星軌共振，宇宙會把所有答案在最合適的時刻告訴你。」', scoreKey: 'C' },
          { text: '「色彩與詩意是靈魂唯一的救贖，將剎那的浪漫化為永恆。」', scoreKey: 'D' },
          { text: '「遠方的風在不停呼喚我，生命就是一場永無止境的冒險！」', scoreKey: 'E' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '王室顧問',
        subtitle: 'The Royal Sage',
        description: '前世的你是運籌帷幄、充滿謀略與智慧的王室賢者。你性格冷靜理智，擁有極強的大局觀與洞察力，擅長看透事物本質，在混亂與危機中給予他人最堅定的智慧指引。',
        crystalSlug: 'glimmer-fox',
      },
      B: {
        key: 'B',
        title: '神祕草藥師',
        subtitle: 'The Forest Herbalist',
        description: '前世的你是隱居世外、能夠與花草林木對話的療癒者。你用大自然的能量與慈悲心腸，治癒了無數疲憊與受傷的旅人，靈魂中洋溢著純粹、無私的大地滋養能量。',
        crystalSlug: 'calm-light',
      },
      C: {
        key: 'C',
        title: '皇家占星師',
        subtitle: 'The Star Gazing Scholar',
        description: '前世的你是觀測繁星、解讀宿命波動的神祕學者。你透過群星的軌跡與星盤來窺探未來的走向，直覺敏銳，能與宇宙高頻能量產生深深共鳴，充滿探索未知的光芒。',
        crystalSlug: 'moonlight-wings',
      },
      D: {
        key: 'D',
        title: '自由藝術家',
        subtitle: 'The Renaissance Soul',
        description: '前世的你是自由浪漫、追尋極致生命之美的藝術靈魂。你敏銳、情感豐富，對世界萬物的波動極有共感，用浪漫的筆觸與線條解讀生命，散發著優雅且獨樹一幟的魅力。',
        crystalSlug: 'wish-fox',
      },
      E: {
        key: 'E',
        title: '流浪冒險家',
        subtitle: 'The Borderland Voyager',
        description: '前世的你是放蕩不羈、四海為家的勇敢旅人。你熱愛冒險，無懼風暴與困難，擁有強悍的行動力與百折不撓的內在勇氣。今生的你，依然保留著靈魂深處對自由與探索的強烈渴望。',
        crystalSlug: 'courage-cat',
      },
    },
  },

  // ── 4. Love Magnet Quiz ────────────────────────────────────────────────────
  {
    slug: 'love-magnet',
    name: '哪種人最容易愛上你？',
    subtitle: 'Your Romantic Magnetism',
    desc: '揭秘你氣場中潛藏的情感魅力，探索哪種性格特質的靈魂會對你一見傾心。',
    emoji: '🦋',
    colorGrad: 'from-[#EDE5D4]/60 to-[#F5EEDD]/40',
    questions: [
      {
        question: '在一個格外寂靜的雨後午後，一隻小巧的森林動物突然走向你，直覺中牠是？',
        options: [
          { text: '一隻步伐緩慢沉穩、眼神無比溫和的老金毛獵犬', scoreKey: 'A' },
          { text: '一隻性格大大咧咧、直接跳進你懷裡打滾撒嬌的小橘貓', scoreKey: 'B' },
          { text: '一隻腳步輕盈優雅、遠遠朝你點頭並送上一片落葉的白色小鹿', scoreKey: 'C' },
          { text: '一隻眼神堅定銳利、嘴裡叼著一枚晶瑩寶石的黑鷹', scoreKey: 'D' },
        ],
      },
      {
        question: '你最嚮往哪一種充滿溫柔與心靈共鳴的理想約會情境？',
        options: [
          { text: '在下雨的午後，兩人在溫馨的壁爐旁看老電影、分享熱可可', scoreKey: 'A' },
          { text: '一起去星光遊樂園挑戰最刺激的過山車，在夜空中大聲歡笑', scoreKey: 'B' },
          { text: '漫步在落日染紅的無人海灘上，伴著潮汐聲聊到深夜', scoreKey: 'C' },
          { text: '一起參觀精緻幽靜的藝廊藝術展，隨後在法式小館共進晚餐', scoreKey: 'D' },
        ],
      },
      {
        question: '當你面臨壓力或感到脆弱、很想流淚時，你最希望另一半給予你什麼樣的安撫？',
        options: [
          { text: '什麼都不多問，只是溫柔地將你緊緊抱入懷中，輕輕拍著你的背', scoreKey: 'A' },
          { text: '帶你去吃一頓治癒的大餐，並直率地對你說「有我在，什麼都不用怕」', scoreKey: 'B' },
          { text: '為你手寫一封溫潤溫柔的短信，用詩意而懂你的話語包裹你的脆弱', scoreKey: 'C' },
          { text: '冷靜而可靠地幫你剖析問題，並以絕對的安全感替你解決所有後顧之憂', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '成熟治癒型',
        subtitle: 'The Safe Harbor Soul',
        description: '溫潤踏實、懂你脆弱的成熟靈魂。這類人性格沉穩有包容力，最容易被你溫柔、精緻的內在氣質吸引，希望能成為替你遮風擋雨的港灣，默默守護你所有的脆弱與美好。',
        crystalSlug: 'glimmer-fox',
      },
      B: {
        key: 'B',
        title: '熱烈直球型',
        subtitle: 'The Direct Light',
        description: '熱情坦率、愛得毫無保留的陽光達人。這類人性格真誠不拐彎抹角，最容易被你純真、熱愛生活細節的一面打動，一旦被你吸引，便會奉上最炙熱與直接的愛意。',
        crystalSlug: 'wish-bunny',
      },
      C: {
        key: 'C',
        title: '浪漫靈性型',
        subtitle: 'The Poetic Dreamer',
        description: '注重精神契合、心思極其細膩的藝術靈魂。這類人生活充滿儀式感與想像力，最容易被你獨特的空靈氣息與優雅內在深深折服，渴望與你展開一場靈魂深處的浪漫探尋。',
        crystalSlug: 'wish-fox',
      },
      D: {
        key: 'D',
        title: '專注事業型',
        subtitle: 'The Grounded Achiever',
        description: '幹練優秀、極有責任感與可靠的實踐家。這類人行事果斷專注，最容易被你特立獨行、獨立且充滿內在力量的一面吸引，渴望與你在人生旅途中攜手並肩、共同前行。',
        crystalSlug: 'wealth-stone',
      },
    },
  },
];
