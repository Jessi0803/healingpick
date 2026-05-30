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
        description: '你給人的感覺很舒服，不是那種很用力討好人的甜，而是自然、乾淨、靠近了會覺得心情變輕。你通常不一定會主動站到最前面，但身邊的人很容易因為你的反應、你的笑、你願意聽人說話，而慢慢放下戒心。\n\n有時候你也會太在意氣氛，怕自己掃興，於是把真正的累藏起來。其實你不需要一直保持可愛或溫柔，偶爾直接說「我今天沒力氣」也沒有關係，真正喜歡你的人會接得住。',
        crystalSlug: 'wish-fox',
      },
      B: {
        key: 'B',
        title: '白麝香',
        subtitle: 'White Musk',
        description: '你給人的第一印象很安定，像是事情再亂，只要你在旁邊，大家就會覺得可以慢慢來。你不一定話很多，也不一定很會製造驚喜，但你有一種很實在的可靠感，讓人想把真心話交給你。\n\n只是你常常把「穩住」當成習慣，連自己不舒服也先忍著。你可以練習不要每次都當那個最懂事的人，因為你的需求也值得被照顧，不用等到撐不住才說。',
        crystalSlug: 'wish-bunny',
      },
      C: {
        key: 'C',
        title: '雨後森林',
        subtitle: 'Forest After Rain',
        description: '你身上有一種安靜的距離感，不是冷漠，而是你很需要自己的空間。你觀察事情很細，也很常在心裡把很多感覺消化完，才會真正說出口，所以別人會覺得你有點神祕，也有點難懂。\n\n你適合慢慢建立關係，不適合被催著表態。當你願意讓人靠近時，那份信任其實很珍貴；只是別把所有情緒都關在心裡，偶爾讓人知道你在想什麼，會讓你沒那麼孤單。',
        crystalSlug: 'calm-light',
      },
      D: {
        key: 'D',
        title: '玫瑰花園',
        subtitle: 'Rose Garden',
        description: '你給人的感覺很有氛圍，細節感很強，喜歡的東西也常常帶著自己的品味。你不只是想要漂亮而已，你其實很在意「感覺對不對」，所以人、地方、關係，只要少了一點真誠，你都會很快察覺。\n\n你很適合把生活過得有質感，但也容易因為期待太高而失望。試著把浪漫留給自己一點，不要只等別人懂；當你自己也願意好好對待自己，你的魅力會更穩。',
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
        description: '你的靈魂很需要安靜。比起一直待在人群裡，你更像是要有一段自己的時間，才會慢慢恢復力氣、聽見心裡真正的聲音。你直覺很強，很多事情嘴上說不出理由，但心裡其實早就有答案。\n\n你不太適合被逼著立刻反應，也不需要勉強自己變得很外向。給自己一點空白，你會更清楚下一步要怎麼走；真正適合你的人，也會尊重你慢慢整理自己的節奏。',
        crystalSlug: 'moonlight-wings',
      },
      B: {
        key: 'B',
        title: '溫柔海邊',
        subtitle: 'The Seaside Retreat',
        description: '你的靈魂很像海邊，表面看起來溫柔好相處，心裡其實有很多起伏。你很會包容別人，也願意站在對方角度想，但你也需要自由，不喜歡被管得太緊或被情緒勒住。\n\n你最需要的是一種可以呼吸的關係。有人理解你、陪你，但不把你綁住，你就會變得很柔軟也很有力量。記得不要把所有人的情緒都收進來，海再大也需要退潮休息。',
        crystalSlug: 'wish-fox',
      },
      C: {
        key: 'C',
        title: '巨木森林',
        subtitle: 'The Ancient Forest',
        description: '你的靈魂很穩，像森林一樣，不一定吵鬧，但會讓人覺得安心。你做事通常不喜歡太浮誇，會一步一步來，也很重視長久累積出來的安全感。身邊的人遇到事，常常會想找你商量。\n\n不過你也可能太習慣自己扛，覺得麻煩別人很不好意思。你可以把「我也需要支持」當成一件正常的事，不用一直當那個最堅強的樹。',
        crystalSlug: 'glimmer-fox',
      },
      D: {
        key: 'D',
        title: '童話小鎮',
        subtitle: 'The Fairy-tale Town',
        description: '你的靈魂住在很有生活感的地方。你會被小小的可愛細節打動，像是一頓好吃的飯、一句剛好的關心、房間裡剛整理好的角落，這些都能讓你重新有力氣。\n\n你很會照顧生活，也很會照顧人，但有時候會期待別人也用同樣細膩的方式回應你。可以試著把需求講清楚一點，不要只等對方自己發現；你值得被明白地珍惜。',
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
        description: '前世的你很像站在重要位置旁邊出主意的人，不一定是最張揚的主角，但常常是看得最清楚的那個。你擅長分析局勢，也很會在混亂裡抓重點，所以今生遇到問題時，你通常會先想「怎麼做才最合理」。\n\n這份能力很好，但你也容易把自己逼得太理性，好像情緒不該影響判斷。其實偶爾承認自己受傷、害怕、失望，不會讓你變弱，反而會讓你的選擇更完整。',
        crystalSlug: 'glimmer-fox',
      },
      B: {
        key: 'B',
        title: '神祕草藥師',
        subtitle: 'The Forest Herbalist',
        description: '前世的你像是懂得照顧傷口的人，知道有些痛不能催，只能慢慢陪。今生的你也很容易感受到別人的不舒服，可能對方還沒說，你就已經知道他其實很累、很需要被安慰。\n\n但你要小心，不要把照顧別人變成自己的責任。你可以溫柔，但不用拯救所有人；把一部分力氣留給自己，你的善意才不會變成消耗。',
        crystalSlug: 'calm-light',
      },
      C: {
        key: 'C',
        title: '皇家占星師',
        subtitle: 'The Star Gazing Scholar',
        description: '前世的你像是一直在研究答案的人，對看不見的規律、命運的安排、事情為什麼會這樣，都有很強的好奇心。今生的你可能也常常想很多，會把一件小事往深處想，想知道背後真正的原因。\n\n你的直覺通常很準，但不要讓想太多變成壓力。答案有時候不是一次就看懂，而是走一段路才會慢慢明白；你可以相信感覺，也可以給自己一點時間。',
        crystalSlug: 'moonlight-wings',
      },
      D: {
        key: 'D',
        title: '自由藝術家',
        subtitle: 'The Renaissance Soul',
        description: '前世的你很像把感覺活得很用力的人，會被一段旋律、一個眼神、一個黃昏打動。今生的你也很敏感，情緒來的時候很真，喜歡的東西也通常不是因為大家都喜歡，而是它真的碰到你心裡。\n\n敏感不是麻煩，它是你的天線。只是你需要找到能讓情緒流動的出口，不管是寫下來、做作品、整理房間，或只是好好哭一場，讓感覺有地方去，你會輕很多。',
        crystalSlug: 'wish-fox',
      },
      E: {
        key: 'E',
        title: '流浪冒險家',
        subtitle: 'The Borderland Voyager',
        description: '前世的你像是一直往遠方走的人，不太能忍受人生只剩下固定路線。今生的你心裡也有一塊很愛自由的地方，當生活太無聊、太被限制，你就會開始覺得悶，想換個環境或重新開始。\n\n你的行動力是優點，但也容易因為想快點離開不舒服的狀態，而忽略真正要處理的問題。自由不是一直逃走，而是知道自己去哪裡都能站穩。',
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
        description: '最容易喜歡上你的，是那種穩定、成熟、願意慢慢了解你的人。他們不一定會一開始就很高調，但會默默記得你的習慣，也會在你累的時候用實際行動照顧你。\n\n你吸引他們的地方，是你看起來柔軟，但其實心裡很有自己的想法。這類人會想保護你，也會欣賞你的細膩；只是你要確認，對方的照顧是尊重你，而不是替你做所有決定。',
        crystalSlug: 'glimmer-fox',
      },
      B: {
        key: 'B',
        title: '熱烈直球型',
        subtitle: 'The Direct Light',
        description: '最容易喜歡上你的，是很直接、很熱情、藏不住感覺的人。他們可能會主動找你聊天、約你吃飯，甚至有點笨拙地把喜歡表現得很明顯，因為你身上有讓他們覺得輕鬆的可愛感。\n\n你吸引他們的地方，是你讓生活變得有趣，也讓人覺得靠近你不需要太多防備。不過熱烈很好，節奏也要舒服；如果對方太快太滿，你可以溫柔但明確地說出自己的步調。',
        crystalSlug: 'wish-bunny',
      },
      C: {
        key: 'C',
        title: '浪漫靈性型',
        subtitle: 'The Poetic Dreamer',
        description: '最容易喜歡上你的，是很重視精神交流、也很吃氛圍的人。他們會被你的想法、品味、說話方式吸引，不只是覺得你好看或好相處，而是覺得你身上有一種想慢慢讀懂的東西。\n\n這類關係一開始常常很有感覺，像是聊天聊到忘記時間。但你也要看清楚，浪漫之外，對方能不能好好面對現實問題；真正適合你的愛，不只會心動，也會負責。',
        crystalSlug: 'wish-fox',
      },
      D: {
        key: 'D',
        title: '專注事業型',
        subtitle: 'The Grounded Achiever',
        description: '最容易喜歡上你的，是有目標、有責任感、很欣賞獨立感的人。他們會被你的自我要求和內在力量吸引，覺得你不是只需要被照顧的人，而是可以一起往前走的伴侶。\n\n這類人通常很務實，愛你的方式也可能比較偏行動，不一定每天講很多甜言蜜語。你可以觀察他是否願意理解你的感受，而不只是把關係當成計畫表；你需要的是一起努力，也需要被溫柔對待。',
        crystalSlug: 'wealth-stone',
      },
    },
  },
  // ── 5. Stress Style Quiz ──────────────────────────────────────────────────
  {
    slug: 'stress-style',
    name: '你累的時候最需要什麼？',
    subtitle: 'Your Rest Pattern',
    desc: '看懂你真正需要的休息方式，不再只用硬撐處理疲憊。',
    emoji: '🕯️',
    colorGrad: 'from-[#E8EFE7]/60 to-[#F7F0E8]/40',
    questions: [
      {
        question: '最近覺得累的時候，你最常出現哪種狀態？',
        options: [
          { text: '不想講話，只想一個人安靜一下', scoreKey: 'A' },
          { text: '很想有人聽我說，但又怕自己太負面', scoreKey: 'B' },
          { text: '看到房間或待辦很亂，心也跟著煩', scoreKey: 'C' },
          { text: '明明很累，卻更想找點事做轉移注意力', scoreKey: 'D' },
        ],
      },
      {
        question: '如果今晚可以完全照顧自己，你會先做哪件事？',
        options: [
          { text: '關掉訊息，洗澡後躺著放空', scoreKey: 'A' },
          { text: '找一個信任的人好好講完心裡話', scoreKey: 'B' },
          { text: '整理桌面、換床單，讓空間先乾淨一點', scoreKey: 'C' },
          { text: '出門走走、買杯飲料，讓身體動起來', scoreKey: 'D' },
        ],
      },
      {
        question: '壓力大的時候，你最怕別人怎麼對你？',
        options: [
          { text: '一直追問我怎麼了，讓我更想躲起來', scoreKey: 'A' },
          { text: '很快給建議，卻沒有真的聽懂我的感受', scoreKey: 'B' },
          { text: '把事情弄得更混亂，讓我沒有掌控感', scoreKey: 'C' },
          { text: '叫我不要想太多，卻不給我任何出口', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '你需要安靜充電',
        subtitle: 'Quiet Recharge',
        description: '你累的時候，最需要的不是被鼓勵，也不是立刻被拉出去玩，而是一段不被打擾的空白。你的能量像手機電量一樣，太多人、太多訊息、太多聲音都會讓你耗得很快，所以獨處對你來說不是冷漠，是恢復。\n\n你可以試著把休息安排得更明確一點，例如睡前半小時不回訊息、週末留一段完全沒約的時間。當你把安靜還給自己，你反而會更有力氣面對人，也比較不會突然情緒爆掉。',
        crystalSlug: 'calm-light',
      },
      B: {
        key: 'B',
        title: '你需要被好好理解',
        subtitle: 'Soft Listening',
        description: '你累的時候，其實很需要有人聽你把話說完。你不一定要對方立刻幫你解決問題，你更需要的是「我懂，你真的辛苦了」這種被接住的感覺。只要有人願意慢慢聽，你的心就會鬆很多。\n\n但你常常怕自己麻煩別人，所以講到一半又收回去。可以從找一兩個真的安全的人開始，不用對所有人解釋自己；你不是太敏感，你只是需要一個能放心說真話的地方。',
        crystalSlug: 'wish-bunny',
      },
      C: {
        key: 'C',
        title: '你需要重新整理生活',
        subtitle: 'Gentle Reset',
        description: '你累的時候，外在環境很容易影響心情。桌面亂、訊息堆著、待辦太多，會讓你覺得整個人都被壓住。對你來說，整理不是潔癖，而是一種把生活重新拿回來的方式。\n\n不用一次把所有事情做好，你適合從很小的地方開始，比如只整理包包、只清一個抽屜、只寫下明天三件事。當眼前的混亂少一點，你會比較能呼吸，也會更相信自己有辦法慢慢處理。',
        crystalSlug: 'glimmer-fox',
      },
      D: {
        key: 'D',
        title: '你需要一點行動感',
        subtitle: 'Move The Energy',
        description: '你累的時候，越躺著想越容易卡住。你的壓力需要透過身體或行動被帶走，像是散步、洗澡、換個地方坐、做一件很小但有完成感的事，都能讓你從悶住的狀態裡出來。\n\n不過行動不是要你繼續硬撐，而是給情緒一個出口。你可以做很輕量的事，不需要把自己逼成高效率的人；只要讓身體動一點，心裡的結也會比較容易鬆開。',
        crystalSlug: 'courage-cat',
      },
    },
  },
  // ── 6. Decision Style Quiz ────────────────────────────────────────────────
  {
    slug: 'decision-style',
    name: '你做選擇時最容易卡在哪？',
    subtitle: 'Your Decision Block',
    desc: '從你的猶豫方式裡，看見真正讓你停住的原因。',
    emoji: '🗝️',
    colorGrad: 'from-[#EFE8DA]/60 to-[#E8EDF0]/40',
    questions: [
      {
        question: '面對重要選擇時，你最常冒出的第一個念頭是？',
        options: [
          { text: '如果我選了，別人會不會失望？', scoreKey: 'A' },
          { text: '萬一有更好的選項，我現在決定會不會太早？', scoreKey: 'B' },
          { text: '這樣做夠安全嗎？會不會讓生活不穩？', scoreKey: 'C' },
          { text: '我還沒有準備好，等狀態更好再說', scoreKey: 'D' },
        ],
      },
      {
        question: '你最容易因為哪種情況遲遲不敢決定？',
        options: [
          { text: '牽涉到家人、朋友或另一半的感受', scoreKey: 'A' },
          { text: '資訊太多，每個說法都有道理', scoreKey: 'B' },
          { text: '結果會影響金錢、工作或長期安全感', scoreKey: 'C' },
          { text: '我覺得自己還不夠好，怕開始了也做不好', scoreKey: 'D' },
        ],
      },
      {
        question: '如果有人要幫你做決定，你最希望他提醒你什麼？',
        options: [
          { text: '你的人生也需要先照顧你自己', scoreKey: 'A' },
          { text: '沒有百分之百正確，先選一個方向也可以', scoreKey: 'B' },
          { text: '可以慢慢來，但要看清楚真正的風險', scoreKey: 'C' },
          { text: '不用等完美，你現在就可以開始一小步', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '你卡在怕讓人失望',
        subtitle: 'People First Heart',
        description: '你做選擇時，很容易先想到別人的感受。這不是壞事，代表你重情、懂得體貼，也不想因為自己的決定傷到重要的人。只是當你每次都把別人排在前面，自己的聲音就會越來越小。\n\n你可以問自己一句很實際的話：如果我不用先顧慮所有人，我真正想選什麼？不一定要立刻照做，但至少先把答案聽見。你的人生不是只能當一個讓大家都滿意的人，你也可以選擇讓自己安心。',
        crystalSlug: 'wish-bunny',
      },
      B: {
        key: 'B',
        title: '你卡在想找到最好答案',
        subtitle: 'Overthinking Loop',
        description: '你很會分析，也很怕錯過更好的可能，所以一個選擇常常會被你拆成很多層。你不是沒想法，而是想得太完整，反而每個方向都看得到優缺點，最後就卡在原地。\n\n對你來說，重點不是找到完美答案，而是選一個目前最能往前走的版本。人生很多事情是邊做邊修正，不是考卷只有一次作答機會；先走一步，你才會得到新的資訊。',
        crystalSlug: 'moonlight-wings',
      },
      C: {
        key: 'C',
        title: '你卡在需要安全感',
        subtitle: 'Need A Ground',
        description: '你做選擇時很重視穩定，尤其牽涉到錢、工作、長期生活，你會本能地先想最壞情況。這份謹慎能保護你，讓你不容易衝動踩坑，但也可能讓你錯過其實可以嘗試的機會。\n\n你適合用「保留退路」的方式前進。不是逼自己冒險，而是先設好底線、預算、時間範圍，讓自己知道就算不完美也不會崩盤。有安全感時，你的行動力會比自己想像中更強。',
        crystalSlug: 'wealth-stone',
      },
      D: {
        key: 'D',
        title: '你卡在等自己準備好',
        subtitle: 'Waiting Mode',
        description: '你常常覺得還沒到時候，想等自己更有自信、更有能力、狀態更好再開始。你對自己有期待，所以不想隨便做，也不想一開始就失敗。可是有些準備感，其實是在開始之後才會長出來的。\n\n你可以把選擇拆小一點，不要一次要求自己做出巨大改變。先試一週、先問一個人、先做一個版本，這些都算開始。你不需要完全準備好才配往前，你是在往前的路上變準備好的。',
        crystalSlug: 'courage-cat',
      },
    },
  },
  // ── 7. Heart Weather Quiz ────────────────────────────────────────────────
  {
    slug: 'heart-weather',
    name: '你最近的心情天氣是什麼？',
    subtitle: 'Your Inner Weather',
    desc: '用一種輕鬆的方式，看看你最近心裡真正的天氣。',
    emoji: '🌦️',
    colorGrad: 'from-[#E7EEF2]/60 to-[#F3E7E2]/40',
    questions: [
      {
        question: '如果把最近的生活變成一張照片，你覺得最像哪一張？',
        options: [
          { text: '早晨有霧，看得不遠，但光慢慢出來了', scoreKey: 'A' },
          { text: '下著小雨，沒有大崩潰，但心裡悶悶的', scoreKey: 'B' },
          { text: '雲散開一點，開始有想重新整理的念頭', scoreKey: 'C' },
          { text: '深夜很安靜，很多話只想先放在心裡', scoreKey: 'D' },
        ],
      },
      {
        question: '最近最容易讓你心裡動一下的是什麼？',
        options: [
          { text: '有人很平常地關心我一句', scoreKey: 'A' },
          { text: '突然想起一件還沒真正放下的事', scoreKey: 'B' },
          { text: '看到別人開始前進，我也想把自己拉起來', scoreKey: 'C' },
          { text: '一個人待著時，才發現自己其實想很多', scoreKey: 'D' },
        ],
      },
      {
        question: '如果 Mochi 今天要給你一句提醒，你最想聽到哪一句？',
        options: [
          { text: '不用急，慢慢看清楚也可以', scoreKey: 'A' },
          { text: '你可以難過，不用假裝沒事', scoreKey: 'B' },
          { text: '你已經在變好了，哪怕只是一點點', scoreKey: 'C' },
          { text: '有些答案，安靜下來才會浮上來', scoreKey: 'D' },
        ],
      },
    ],
    results: {
      A: {
        key: 'A',
        title: '微霧早晨',
        subtitle: 'Misty Morning',
        description: '你最近的狀態像微霧早晨，不是完全迷路，但也還沒看得很清楚。你可能正在整理某些感覺，想知道自己到底要什麼，或是某段關係、某個方向還值不值得繼續投入。\n\n這段時間不用逼自己立刻有答案。霧散開需要時間，你只要先照顧好今天的自己，把能做的小事做好，很多原本看不清的東西，會在你沒那麼緊繃的時候慢慢清楚。',
        crystalSlug: 'calm-light',
      },
      B: {
        key: 'B',
        title: '安靜小雨',
        subtitle: 'Soft Rain',
        description: '你最近心裡可能有一點悶，不一定是很大的崩潰，但就是有些事一直壓著。你也許還能正常生活、工作、回訊息，可是一停下來，就會感覺心裡有一塊濕濕重重的地方。\n\n你不用急著把自己變開朗，也不用否定這份低落。小雨不是壞天氣，它只是提醒你該慢一點、暖一點，給自己一點被照顧的時間。能說出口的話，就找安全的人說；說不出口，也可以先寫下來。',
        crystalSlug: 'wish-fox',
      },
      C: {
        key: 'C',
        title: '雲後放晴',
        subtitle: 'Clearing Sky',
        description: '你最近其實已經開始有一點想往前的感覺了。可能事情還沒全部變好，但你心裡有一個小小的聲音在說：我是不是可以重新整理一下？是不是可以不要一直停在原地？\n\n這是很好的訊號。你不用一次變得很積極，只要抓住那一點點想變好的念頭，做一件會讓未來的你感謝現在的自己的小事。整理一個角落、預約一件事、好好睡一覺，都算是放晴的開始。',
        crystalSlug: 'glimmer-fox',
      },
      D: {
        key: 'D',
        title: '深夜月光',
        subtitle: 'Quiet Moonlight',
        description: '你最近的心情比較內收，很多事可能不想急著講，也不想被太多人打擾。你需要一個安靜的地方，把心裡那些還沒成形的想法放一放，等它們慢慢變成你能理解的句子。\n\n這不是退縮，而是你在跟自己對話。只是別把自己關太久，如果有某個人讓你覺得安全，可以試著透露一點點。你不用一次說完，能被理解一小部分，也會讓夜晚沒有那麼長。',
        crystalSlug: 'moonlight-wings',
      },
    },
  },
];
