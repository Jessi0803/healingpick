import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Gift,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export type MoodPlushieScene = "dream" | "tarot" | "ziwei" | "fortune" | "chat";

export type MoodPlushie = {
  id: string;
  name: string;
  role: string;
  message: string;
  openings?: Record<MoodPlushieScene, string>;
};

type Plushie = MoodPlushie & {
  openings: Record<MoodPlushieScene, string>;
  color: string;
  accent: string;
  /**
   * Optional cut-out (transparent PNG) photo of the real plush toy. When set,
   * the figure renders this image instead of the CSS-shape doll. Drop the file
   * in `client/public/plushies/` and point here, e.g. "/plushies/hug-bear.png".
   * If the image is missing or fails to load, it falls back to the CSS doll.
   */
  image?: string;
};

type DisplayPlushie = Plushie & {
  x: number;
};

type PlushieRecord = MoodPlushie & {
  caughtAt: string;
};

const COLLECTION_STORAGE_KEY = "mochi-mood-plushie-collection";

const makeOpenings = (
  name: string,
  role: string,
  image: string
): Record<MoodPlushieScene, string> => ({
  dream: `${name}帶著「${role}」進來了。這個夢先不用想太難，我們先從${image}的感覺開始看。`,
  tarot: `${name}坐到牌桌旁邊了。牌面不用一次看懂，我們先用「${role}」的角度看最重要的提醒。`,
  ziwei: `${name}陪你一起看命盤。命盤資訊很多沒關係，我們先抓出跟「${role}」最有關的重點。`,
  fortune: `${name}來幫今天加一點「${role}」。運勢不用看得太緊張，我們先看今天哪裡可以順一點。`,
  chat: `${name}先陪你把心情放穩一點。你不用一次說清楚，我們先從「${role}」這個方向慢慢聊。`,
});

const PLUSHIES: Plushie[] = [
  {
    id: "hug-bear",
    image: "/plushies/hug-bear.png",
    name: "抱抱熊",
    role: "被接住",
    message: "抱抱熊來了。你現在不用解釋太多，先被好好接住也可以。",
    openings: {
      dream: "抱抱熊先陪你坐一下。這個夢不用急著解釋清楚，我們先看看它哪一段讓你最有感覺。",
      tarot: "抱抱熊坐到牌桌旁邊了。先不用怕牌面太直接，我們慢慢看它想提醒你什麼。",
      ziwei: "抱抱熊幫你把命盤放輕一點。命盤不是考卷，我們先看幾個最重要的地方就好。",
      fortune: "抱抱熊先幫你開啟省力模式。今天不用什麼都撐住，我們看看哪裡可以放鬆一點。",
      chat: "抱抱熊來陪你了。你不用把話說得很完整，我會從你現在說得出口的地方開始陪你看。",
    },
    color: "#caa884",
    accent: "#f3d6c4",
  },
  {
    id: "brave-bunny",
    image: "/plushies/brave-bunny.png",
    name: "勇氣兔",
    role: "下一小步",
    message: "勇氣兔陪你先走一小步，不需要一下子變得很堅強。",
    openings: {
      dream: "勇氣兔準備好了。這個夢不用一次看懂，我們先找一個你現在可以面對的小線索。",
      tarot: "勇氣兔把牌面推近一點點。先別急著做大決定，我們先看看下一步可以怎麼走。",
      ziwei: "勇氣兔在旁邊點頭。命盤不是要你馬上衝，我們先找一個現在做得到的小方向。",
      fortune: "勇氣兔幫你把鞋帶綁好了。今天不用很勇敢，先試著做一件小事就好。",
      chat: "勇氣兔把小旗子插在你旁邊了。你不用馬上有答案，我們先找一個比較不難的開始。",
    },
    color: "#e7d8c9",
    accent: "#c5a6b8",
  },
  {
    id: "tea-cat",
    image: "/plushies/tea-cat.png",
    name: "熱茶貓",
    role: "慢慢放鬆",
    message: "熱茶貓幫你把節奏放慢一點，先讓心裡緊繃的地方鬆一下。",
    openings: {
      dream: "熱茶貓幫你把節奏放慢。這個夢先不要急著找答案，我們慢慢看它在提醒你什麼。",
      tarot: "熱茶貓把牌桌變成下午茶桌了。今天的牌慢慢看就好，不用每張都看得很緊張。",
      ziwei: "熱茶貓端著茶坐到命盤旁。命盤資訊很多沒關係，我們先看最需要注意的幾個重點。",
      fortune: "熱茶貓幫今天調成慢速模式。運勢可以看，但不用看完就逼自己馬上改變。",
      chat: "熱茶貓先把回覆放涼一點。等一下我們不用急著找標準答案，慢慢說就好。",
    },
    color: "#d8b58d",
    accent: "#9f775a",
  },
  {
    id: "lamp-penguin",
    image: "/plushies/lamp-penguin.png",
    name: "小夜燈企鵝",
    role: "一點方向",
    message: "小夜燈企鵝陪你看見一點點路，不用一次看完整條。",
    openings: {
      dream: "小夜燈企鵝幫你開了一點光。這個夢不用全部看懂，我們先看最明顯的那個訊號。",
      tarot: "小夜燈企鵝站在牌陣旁邊發光。牌面不用一次看懂，我們先看哪張牌最像在提醒你。",
      ziwei: "小夜燈企鵝幫命盤開了一盞小燈。人生方向很大，我們先看現在最需要注意的地方。",
      fortune: "小夜燈企鵝今天負責照路。運勢不是催你快跑，是先讓你知道哪裡比較有方向。",
      chat: "小夜燈企鵝把燈調到剛剛好。你不用立刻看清全部，我們先看懂一點點就好。",
    },
    color: "#6e7f88",
    accent: "#f1cf7a",
  },
  {
    id: "cloud-sheep",
    image: "/plushies/cloud-sheep.png",
    name: "雲朵羊",
    role: "允許柔軟",
    message: "雲朵羊提醒你，今天柔軟一點也沒有關係。",
    openings: {
      dream: "雲朵羊先把這個夢放軟一點。就算夢有點亂，我們也可以用比較溫柔的方式看它。",
      tarot: "雲朵羊把牌面旁邊墊軟了。今天不用對自己太嚴格，我們先看牌裡比較溫和的提醒。",
      ziwei: "雲朵羊幫命盤蓋上一層雲。那些複雜的地方不是要壓你，是幫你更了解自己。",
      fortune: "雲朵羊幫今天調成軟著陸。運勢如果有提醒，也會用比較溫柔的方式靠近你。",
      chat: "雲朵羊把句子變柔軟了。你可以脆弱一點，我會用不讓你更累的方式回應。",
    },
    color: "#e9e2d8",
    accent: "#b9a6c5",
  },
  {
    id: "reset-otter",
    image: "/plushies/reset-otter.png",
    name: "重開機水獺",
    role: "重新整理",
    message: "重開機水獺提醒你，卡住時可以先重整一下，不一定要硬撐。",
    openings: makeOpenings("重開機水獺", "重新整理", "先重開機一下"),
    color: "#9f8a7a",
    accent: "#d9c4b2",
  },
  {
    id: "blanket-dog",
    image: "/plushies/blanket-dog.png",
    name: "毛毯狗",
    role: "先休息",
    message: "毛毯狗把休息遞給你。你可以先不用急著處理全部。",
    openings: makeOpenings("毛毯狗", "先休息", "躲進毛毯裡喘口氣"),
    color: "#b78f6f",
    accent: "#f1d7bd",
  },
  {
    id: "battery-hamster",
    image: "/plushies/battery-hamster.png",
    name: "低電量倉鼠",
    role: "保留力氣",
    message: "低電量倉鼠說，電量不多時先省著用，這很合理。",
    openings: makeOpenings("低電量倉鼠", "保留力氣", "電量只剩一格"),
    color: "#d2ad7b",
    accent: "#f0dcaa",
  },
  {
    id: "umbrella-duck",
    image: "/plushies/umbrella-duck.png",
    name: "小傘鴨",
    role: "擋一下",
    message: "小傘鴨幫你擋一下外面的雨，先不用什麼都淋在身上。",
    openings: makeOpenings("小傘鴨", "擋一下", "把小傘撐開"),
    color: "#e0bd5f",
    accent: "#7fa6b8",
  },
  {
    id: "map-fox",
    image: "/plushies/map-fox.png",
    name: "地圖狐狸",
    role: "找路線",
    message: "地圖狐狸不是要你立刻出發，是先陪你看有哪些路可以走。",
    openings: makeOpenings("地圖狐狸", "找路線", "攤開一張小地圖"),
    color: "#c77d55",
    accent: "#f0c79d",
  },
  {
    id: "pillow-koala",
    image: "/plushies/pillow-koala.png",
    name: "枕頭無尾熊",
    role: "不要硬撐",
    message: "枕頭無尾熊提醒你，累了就靠一下，不會因此變差。",
    openings: makeOpenings("枕頭無尾熊", "不要硬撐", "靠在枕頭上"),
    color: "#a9a6a0",
    accent: "#e7dfd2",
  },
  {
    id: "tiny-captain",
    image: "/plushies/tiny-captain.png",
    name: "小隊長海豹",
    role: "穩住節奏",
    message: "小隊長海豹幫你喊一聲集合。先穩住，再看下一步。",
    openings: makeOpenings("小隊長海豹", "穩住節奏", "把隊伍排好"),
    color: "#8fa4ad",
    accent: "#d8e6e8",
  },
  {
    id: "snack-squirrel",
    image: "/plushies/snack-squirrel.png",
    name: "點心松鼠",
    role: "補一點能量",
    message: "點心松鼠帶了小點心。你可以先補一點能量再繼續。",
    openings: makeOpenings("點心松鼠", "補一點能量", "拿出藏好的點心"),
    color: "#b78355",
    accent: "#e5c38c",
  },
  {
    id: "bubble-fish",
    image: "/plushies/bubble-fish.png",
    name: "泡泡魚",
    role: "慢慢呼吸",
    message: "泡泡魚吐了一串泡泡。先吸一口氣，再慢慢吐掉。",
    openings: makeOpenings("泡泡魚", "慢慢呼吸", "吐出一串泡泡"),
    color: "#7fb7c7",
    accent: "#d6eef1",
  },
  {
    id: "memo-frog",
    image: "/plushies/memo-frog.png",
    name: "便利貼青蛙",
    role: "整理重點",
    message: "便利貼青蛙幫你貼好重點。事情可以一張一張看。",
    openings: makeOpenings("便利貼青蛙", "整理重點", "貼上第一張便利貼"),
    color: "#8aaa78",
    accent: "#d9e8a8",
  },
  {
    id: "tiny-lion",
    image: "/plushies/tiny-lion.png",
    name: "小獅子",
    role: "一點自信",
    message: "小獅子小聲吼一下。你不需要很大聲，也可以有一點自信。",
    openings: makeOpenings("小獅子", "一點自信", "練習一聲小小的吼"),
    color: "#d4a24f",
    accent: "#f0d486",
  },
  {
    id: "music-whale",
    image: "/plushies/music-whale.png",
    name: "哼歌鯨魚",
    role: "放鬆心情",
    message: "哼歌鯨魚用很低的聲音陪你放鬆一下。",
    openings: makeOpenings("哼歌鯨魚", "放鬆心情", "哼一段低低的歌"),
    color: "#6f8fa8",
    accent: "#c8dbea",
  },
  {
    id: "paper-plane-bird",
    image: "/plushies/paper-plane-bird.png",
    name: "紙飛機鳥",
    role: "把話送出去",
    message: "紙飛機鳥提醒你，有些話可以先輕輕送出去，不用一次說完。",
    openings: makeOpenings("紙飛機鳥", "把話送出去", "摺好一架紙飛機"),
    color: "#9bb7c8",
    accent: "#f3f0df",
  },
  {
    id: "compass-turtle",
    image: "/plushies/compass-turtle.png",
    name: "指南針烏龜",
    role: "慢慢找方向",
    message: "指南針烏龜走很慢，但方向感很好。慢也可以有進度。",
    openings: makeOpenings("指南針烏龜", "慢慢找方向", "慢慢轉動指南針"),
    color: "#7d936d",
    accent: "#d8c38a",
  },
  {
    id: "moon-moth",
    image: "/plushies/moon-moth.png",
    name: "月光蛾",
    role: "看見細節",
    message: "月光蛾幫你看見那些很小、但其實很重要的感覺。",
    openings: makeOpenings("月光蛾", "看見細節", "停在一點月光旁"),
    color: "#b7a9c9",
    accent: "#eee4a6",
  },
  {
    id: "pocket-elephant",
    image: "/plushies/pocket-elephant.png",
    name: "口袋象",
    role: "記得自己",
    message: "口袋象提醒你，不要只記得別人的感受，也要記得自己。",
    openings: makeOpenings("口袋象", "記得自己", "從口袋探出頭"),
    color: "#9aa4aa",
    accent: "#e1c6c0",
  },
  {
    id: "eraser-panda",
    image: "/plushies/eraser-panda.png",
    name: "橡皮擦熊貓",
    role: "擦掉自責",
    message: "橡皮擦熊貓想幫你擦掉一點自責，不用全都算在自己頭上。",
    openings: makeOpenings("橡皮擦熊貓", "擦掉自責", "拿出一小塊橡皮擦"),
    color: "#3f4447",
    accent: "#f4efe7",
  },
  {
    id: "sunny-alpaca",
    image: "/plushies/sunny-alpaca.png",
    name: "小太陽羊駝",
    role: "補一點光",
    message: "小太陽羊駝帶來一點光，不多，但剛好夠你看清下一步。",
    openings: makeOpenings("小太陽羊駝", "補一點光", "把小太陽放到桌上"),
    color: "#d7b36b",
    accent: "#f3e0a0",
  },
  {
    id: "quiet-owl",
    image: "/plushies/quiet-owl.png",
    name: "安靜貓頭鷹",
    role: "先觀察",
    message: "安靜貓頭鷹說，先觀察一下也很好，不用立刻反應。",
    openings: makeOpenings("安靜貓頭鷹", "先觀察", "安靜地眨一下眼"),
    color: "#8b7564",
    accent: "#e4d5b8",
  },
  {
    id: "raincoat-mouse",
    image: "/plushies/raincoat-mouse.png",
    name: "雨衣小鼠",
    role: "保護自己",
    message: "雨衣小鼠把扣子扣好。照顧自己不是太敏感，是很必要。",
    openings: makeOpenings("雨衣小鼠", "保護自己", "扣好雨衣扣子"),
    color: "#9c8fb6",
    accent: "#f2d36e",
  },
  {
    id: "anchor-crab",
    image: "/plushies/anchor-crab.png",
    name: "小錨螃蟹",
    role: "穩定下來",
    message: "小錨螃蟹把你拉回地面。先穩一點，再想下一步。",
    openings: makeOpenings("小錨螃蟹", "穩定下來", "把小錨放下來"),
    color: "#c98274",
    accent: "#6e8792",
  },
  {
    id: "starlight-deer",
    image: "/plushies/starlight-deer.png",
    name: "星光鹿",
    role: "相信直覺",
    message: "星光鹿提醒你，有些感覺不用馬上證明，也值得被聽見。",
    openings: makeOpenings("星光鹿", "相信直覺", "抬頭看一點星光"),
    color: "#b79778",
    accent: "#efe3a8",
  },
  {
    id: "laundry-bear",
    image: "/plushies/laundry-bear.png",
    name: "曬衣熊",
    role: "把心晾一晾",
    message: "曬衣熊說，心情太濕的時候，可以先晾一下，不用馬上收好。",
    openings: makeOpenings("曬衣熊", "把心晾一晾", "把心情掛到陽台"),
    color: "#b49a82",
    accent: "#dfe8cf",
  },
  {
    id: "toolbox-beaver",
    image: "/plushies/toolbox-beaver.png",
    name: "工具箱河狸",
    role: "找方法",
    message: "工具箱河狸打開工具箱。事情不一定完美，但一定可以先修一點。",
    openings: makeOpenings("工具箱河狸", "找方法", "打開小工具箱"),
    color: "#8f684e",
    accent: "#d1b58f",
  },
  {
    id: "seed-hedgehog",
    image: "/plushies/seed-hedgehog.png",
    name: "種子刺蝟",
    role: "慢慢長大",
    message: "種子刺蝟帶了一顆小種子。現在很小，也可以慢慢長大。",
    openings: makeOpenings("種子刺蝟", "慢慢長大", "把小種子放進土裡"),
    color: "#8a7764",
    accent: "#9fb884",
  },
  {
    id: "clock-sloth",
    image: "/plushies/clock-sloth.png",
    name: "慢時鐘樹懶",
    role: "給自己時間",
    message: "慢時鐘樹懶提醒你，慢一點不是落後，是還在路上。",
    openings: makeOpenings("慢時鐘樹懶", "給自己時間", "把時鐘調慢一格"),
    color: "#9b8b75",
    accent: "#d8caa7",
  },
  {
    id: "postcard-gull",
    image: "/plushies/postcard-gull.png",
    name: "明信片海鷗",
    role: "說出想法",
    message: "明信片海鷗帶來一句話：你可以先說一點，不用一次說滿。",
    openings: makeOpenings("明信片海鷗", "說出想法", "叼來一張明信片"),
    color: "#d9d9d2",
    accent: "#83a9bd",
  },
  {
    id: "lantern-rabbit",
    image: "/plushies/lantern-rabbit.png",
    name: "燈籠兔",
    role: "照亮盲點",
    message: "燈籠兔提著小燈籠，幫你看見剛剛沒注意到的地方。",
    openings: makeOpenings("燈籠兔", "照亮盲點", "提起一盞小燈籠"),
    color: "#d8c8b8",
    accent: "#e6a06f",
  },
  {
    id: "cushion-pig",
    image: "/plushies/cushion-pig.png",
    name: "靠墊豬",
    role: "先靠一下",
    message: "靠墊豬說，靠一下沒關係，沒有人規定你要一直站著。",
    openings: makeOpenings("靠墊豬", "先靠一下", "把靠墊拍鬆"),
    color: "#d6a5a8",
    accent: "#f2d1c8",
  },
  {
    id: "bookmark-goat",
    image: "/plushies/bookmark-goat.png",
    name: "書籤山羊",
    role: "先停在這裡",
    message: "書籤山羊幫你做記號。想不完的事，可以先停在這裡。",
    openings: makeOpenings("書籤山羊", "先停在這裡", "夾上一張書籤"),
    color: "#b7b0a0",
    accent: "#9f8764",
  },
  {
    id: "soup-bear",
    image: "/plushies/soup-bear.png",
    name: "熱湯小熊",
    role: "照顧身體",
    message: "熱湯小熊端來一碗湯。心累的時候，身體也要被照顧。",
    openings: makeOpenings("熱湯小熊", "照顧身體", "端來一碗熱湯"),
    color: "#7e7b75",
    accent: "#d7a061",
  },
  {
    id: "kite-kangaroo",
    image: "/plushies/kite-kangaroo.png",
    name: "風箏袋鼠",
    role: "放開一點",
    message: "風箏袋鼠把線放鬆一點。有些事抓太緊，反而不好飛。",
    openings: makeOpenings("風箏袋鼠", "放開一點", "把風箏線放鬆"),
    color: "#b88763",
    accent: "#89a9c2",
  },
  {
    id: "mirror-swan",
    image: "/plushies/mirror-swan.png",
    name: "鏡子天鵝",
    role: "看見自己",
    message: "鏡子天鵝提醒你，別只看問題，也要看看自己其實已經很努力。",
    openings: makeOpenings("鏡子天鵝", "看見自己", "把鏡子擦亮一點"),
    color: "#e6e0d5",
    accent: "#c0a8c8",
  },
  {
    id: "sock-monkey",
    image: "/plushies/sock-monkey.png",
    name: "襪子猴",
    role: "輕鬆一點",
    message: "襪子猴跳出來提醒你，事情可以認真，但不用把自己繃到不能動。",
    openings: makeOpenings("襪子猴", "輕鬆一點", "穿著不成對的襪子登場"),
    color: "#a07a68",
    accent: "#d9b5a3",
  },
  {
    id: "garden-snail",
    image: "/plushies/garden-snail.png",
    name: "花園蝸牛",
    role: "慢慢來",
    message: "花園蝸牛說，慢慢來也會到，只是路上多看幾朵花。",
    openings: makeOpenings("花園蝸牛", "慢慢來", "慢慢爬過一片葉子"),
    color: "#8f9f72",
    accent: "#d6b38a",
  },
];

const FEATURED_PLUSHIE_IDS = [
  "hug-bear",
  "brave-bunny",
  "tea-cat",
  "lamp-penguin",
  "cloud-sheep",
  "compass-turtle",
  "starlight-deer",
  "raincoat-mouse",
  "anchor-crab",
  "moon-moth",
];

type MachinePhase = "ready" | "dropping" | "lifting" | "won" | "missed";

const CONFETTI_COLORS = ["#F1CF7A", "#EAA8AC", "#B9A6C5", "#F3D88D", "#C5A6B8"];

const CONFETTI_PIECES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 2 ? 0.2 : -0.2);
  const distance = 54 + (i % 4) * 24;
  return {
    id: i,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - 24,
    rotate: (i % 2 ? 1 : -1) * (140 + i * 14),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    isStar: i % 3 === 0,
    size: 5 + (i % 3) * 3,
    delay: (i % 6) * 0.035,
  };
});

function WinConfetti() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[40%] z-20 -translate-x-1/2">
      {CONFETTI_PIECES.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute left-0 top-0 block leading-none"
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: [0, piece.dx],
            y: [0, piece.dy, piece.dy + 78],
            rotate: [0, piece.rotate],
            scale: [0, 1, 0.6],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.2, delay: piece.delay, ease: "easeOut" }}
          style={
            piece.isStar
              ? {
                  color: piece.color,
                  fontSize: piece.size + 9,
                  textShadow: "0 0 10px rgba(241,207,122,0.5)",
                }
              : {
                  width: piece.size,
                  height: piece.size,
                  borderRadius: 2,
                  backgroundColor: piece.color,
                }
          }
        >
          {piece.isStar ? "✦" : ""}
        </motion.span>
      ))}
    </div>
  );
}

type MoodClawMachineProps = {
  onPrizeCaught?: (plushie: MoodPlushie) => void;
};

export function getMoodPlushieOpening(
  plushie: MoodPlushie,
  scene: MoodPlushieScene
) {
  const fullPlushie = PLUSHIES.find((item) => item.id === plushie.id);
  return (
    plushie.openings?.[scene] ??
    fullPlushie?.openings[scene] ??
    `${plushie.name}剛剛陪你把「${plushie.role}」放到身邊，我們先慢慢看這段訊息。`
  );
}

export function MoodClawMachine({ onPrizeCaught }: MoodClawMachineProps) {
  const [clawX, setClawX] = useState(50);
  const [phase, setPhase] = useState<MachinePhase>("ready");
  const [caught, setCaught] = useState<DisplayPlushie | null>(null);
  const [clawClosed, setClawClosed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPrize, setShowPrize] = useState(false);
  const [collection, setCollection] = useState<PlushieRecord[]>([]);
  const [isMachineVisible, setIsMachineVisible] = useState(false);
  const [useCompactScene, setUseCompactScene] = useState(false);
  const reduceMotion = useReducedMotion();
  const [clawScope, animateClaw] = useAnimate();
  const machineRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const pendingClawXRef = useRef<number | null>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const shouldAnimateAmbient = !reduceMotion && isMachineVisible && !isDragging;
  const visiblePlushies = useMemo<DisplayPlushie[]>(() => {
    const positions = useCompactScene ? [16, 32, 50, 68, 84] : [12, 24, 37, 50, 63, 76, 88];
    return [...PLUSHIES]
      .sort(() => Math.random() - 0.5)
      .slice(0, positions.length)
      .map((plushie, index) => ({
        ...plushie,
        x: positions[index],
      }));
  }, [useCompactScene]);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 640px), (prefers-reduced-motion: reduce)");
    const updateCompactScene = () => setUseCompactScene(compactQuery.matches);

    updateCompactScene();
    compactQuery.addEventListener("change", updateCompactScene);
    return () => compactQuery.removeEventListener("change", updateCompactScene);
  }, []);

  useEffect(() => {
    const el = machineRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setIsMachineVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsMachineVisible(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLECTION_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setCollection(parsed.slice(0, 80));
      }
    } catch {
      setCollection([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pointerFrameRef.current !== null) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  const nearestPlushie = useMemo(() => {
    return visiblePlushies.reduce((nearest, plushie) => {
      const nearestDistance = Math.abs(nearest.x - clawX);
      const currentDistance = Math.abs(plushie.x - clawX);
      return currentDistance < nearestDistance ? plushie : nearest;
    }, visiblePlushies[0]);
  }, [clawX, visiblePlushies]);

  const recordWin = useCallback(
    (target: DisplayPlushie) => {
      const prize: PlushieRecord = {
        id: target.id,
        name: target.name,
        role: target.role,
        message: target.message,
        openings: target.openings,
        caughtAt: new Date().toISOString(),
      };

      onPrizeCaught?.(prize);
      setCollection((current) => {
        const next = [prize, ...current].slice(0, 80);
        window.localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [onPrizeCaught]
  );

  const grab = useCallback(async () => {
    if (phase === "dropping" || phase === "lifting") return;

    const target = nearestPlushie;
    const isCloseEnough = Math.abs(target.x - clawX) <= 7;

    setCaught(null);
    setShowPrize(false);
    setPhase("dropping");

    if (reduceMotion) {
      setCaught(isCloseEnough ? target : null);
      setClawClosed(isCloseEnough);
      setPhase(isCloseEnough ? "won" : "missed");
      if (isCloseEnough) {
        recordWin(target);
        setShowPrize(true);
      }
      setClawClosed(false);
      return;
    }

    // 下降
    await animateClaw(
      clawScope.current,
      { y: 121 },
      { type: "spring", stiffness: 130, damping: 18 }
    );
    // 夾合：爪子收合 + 觸底一頓
    setCaught(isCloseEnough ? target : null);
    setClawClosed(true);
    setPhase("lifting");
    await animateClaw(clawScope.current, { y: 128 }, { duration: 0.12 });
    // 上升回到頂端
    await animateClaw(
      clawScope.current,
      { y: 0 },
      { type: "spring", stiffness: 90, damping: 16 }
    );
    // 收尾：鬆開爪子、揭曉結果
    setClawClosed(false);
    setPhase(isCloseEnough ? "won" : "missed");
    if (isCloseEnough) {
      recordWin(target);
      setShowPrize(true);
    }
  }, [animateClaw, clawScope, clawX, nearestPlushie, phase, reduceMotion, recordWin]);

  const setClawFromPointer = useCallback((clientX: number) => {
    const el = playAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    pendingClawXRef.current = Math.min(88, Math.max(12, pct));

    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const next = pendingClawXRef.current;
      if (next !== null) {
        setClawX(next);
      }
    });
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (phase === "dropping" || phase === "lifting") return;
      setCaught(null);
      setShowPrize(false);
      setPhase("ready");
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      setClawFromPointer(event.clientX);
    },
    [phase, setClawFromPointer]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setClawFromPointer(event.clientX);
    },
    [isDragging, setClawFromPointer]
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // pointer already released
      }
    },
    [isDragging]
  );

  const isMoving = phase === "dropping" || phase === "lifting";
  const todayKey = new Date().toDateString();
  const todayCollection = collection.filter(
    (item) => new Date(item.caughtAt).toDateString() === todayKey
  );

  return (
    <div
      ref={machineRef}
      className="relative w-full max-w-[500px] overflow-hidden rounded-[28px] border border-[#D1BE9B]/35 bg-[#FFFDF8]/82 text-[#31353A] shadow-[0_18px_46px_rgba(122,99,72,0.13)] backdrop-blur-sm"
      style={{ contentVisibility: "auto", containIntrinsicSize: "560px", contain: "layout paint style" }}
    >
      <div className="relative flex items-center justify-between gap-3 border-b border-[#D1BE9B]/20 bg-[linear-gradient(180deg,rgba(255,253,248,0.98),rgba(243,235,221,0.82))] px-5 py-4">
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D1BE9B]/70 to-transparent" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium tracking-[0.12em] text-[#6F5A3A]"
            style={{ fontFamily: "Noto Serif TC, serif" }}>
            心情抓娃娃機
          </p>
          <p className="truncate text-[12px] leading-relaxed tracking-[0.08em] text-[#31353A]/52">
            先夾隻娃娃等待吧
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#D1BE9B]/35 bg-white/70 px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#A38D6B] shadow-[0_8px_18px_rgba(209,190,155,0.16)]">
          <Sparkles className="size-3.5 fill-[#F3D88D]/40" />
          <span>解析生成中</span>
        </div>
      </div>

      <div
        ref={playAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative h-[288px] touch-none select-none overflow-hidden bg-[radial-gradient(circle_at_50%_6%,rgba(255,245,214,0.94),rgba(243,235,221,0.72)_38%,rgba(232,223,238,0.32)_100%)]",
          isMoving ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <div className="absolute left-6 right-6 top-5 h-[204px] rounded-[24px] border border-white/75 bg-white/38 shadow-[inset_0_1px_14px_rgba(255,255,255,0.68),inset_0_-12px_22px_rgba(209,190,155,0.1),0_12px_24px_rgba(111,90,58,0.07)]" />
        <div className="absolute left-10 right-10 top-9 h-2 rounded-full bg-gradient-to-r from-transparent via-[#D1BE9B]/36 to-transparent" />
        <div className="absolute left-12 top-9 h-36 w-16 rotate-12 rounded-full bg-white/30" />
        <div className="absolute right-12 top-12 h-28 w-10 rotate-12 rounded-full bg-white/20" />
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[#D1BE9B]/28 bg-[#FFFDF8]/78 px-3 py-1 text-[10px] tracking-[0.18em] text-[#A38D6B] shadow-sm">
          <span className="size-1.5 rounded-full bg-[#EAA8AC]/70" />
          <span className="size-1.5 rounded-full bg-[#F1CF7A]/80" />
          <span className="size-1.5 rounded-full bg-[#B9A6C5]/70" />
          <span className="ml-1">MOCHI PRIZE</span>
        </div>
        <div className="absolute left-12 right-12 top-[58px] h-7 rounded-full border border-[#D1BE9B]/20 bg-[#FFFDF8]/42 shadow-[inset_0_1px_8px_rgba(255,255,255,0.72)]">
          <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#D1BE9B]/28" />
          <div className="absolute left-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#D1BE9B]/46" />
          <div className="absolute right-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#D1BE9B]/46" />
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#A38D6B]/35 bg-[#FFFDF8] shadow-[0_4px_10px_rgba(111,90,58,0.14)] transition-all duration-500"
            style={{ left: `${clawX}%` }}
          />
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.18em] text-[#A38D6B]/70">
            拖曳移動爪子
          </div>
        </div>

        <motion.div
          className="absolute z-20 flex flex-col items-center will-change-transform"
          style={{ left: `${clawX}%`, x: "-50%", top: "16%" }}
          initial={false}
          animate={{ left: `${clawX}%` }}
          transition={
            reduceMotion || isDragging || !isMachineVisible
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 14 }
          }
        >
          <motion.div
            ref={clawScope}
            className="flex flex-col items-center will-change-transform"
            style={{ transformOrigin: "top center" }}
          >
            <div className="h-14 w-[2px] rounded-full bg-gradient-to-b from-[#D1BE9B]/20 via-[#A38D6B]/55 to-[#A38D6B]/20" />
            <div className="relative size-12 drop-shadow-[0_6px_10px_rgba(111,90,58,0.14)]">
              <div className="absolute left-1/2 top-1 size-6 -translate-x-1/2 rounded-b-full border border-[#A38D6B]/36 bg-[#FFFDF8]" />
              <div className="absolute left-1/2 top-2.5 h-4 w-7 -translate-x-1/2 rounded-full border border-[#D1BE9B]/30 bg-[#F3EBDD]" />
              <motion.div
                className="absolute bottom-1 left-1/2 h-8 w-[2px] origin-top rounded-full bg-[#A38D6B]/70"
                initial={false}
                animate={{ rotate: clawClosed ? -20 : -35 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              />
              <motion.div
                className="absolute bottom-1 left-1/2 h-8 w-[2px] origin-top rounded-full bg-[#A38D6B]/70"
                initial={false}
                animate={{ rotate: clawClosed ? 20 : 35 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              />
              <div className="absolute bottom-0 left-[14px] size-2 rounded-full bg-[#A38D6B]/72" />
              <div className="absolute bottom-0 right-[14px] size-2 rounded-full bg-[#A38D6B]/72" />
            </div>
            {caught && phase === "lifting" && (
              <MiniPlushie
                plushie={caught}
                className="mt-[-10px] scale-75 drop-shadow-[0_12px_18px_rgba(111,90,58,0.28)]"
              />
            )}
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-7 bottom-[58px] h-20 rounded-[100%_100%_18%_18%] bg-[#D1BE9B]/10" />
        <div className="absolute inset-x-10 bottom-[53px] h-6 rounded-full bg-[#A38D6B]/12" />

        {visiblePlushies.map((plushie, index) => {
          const isHidden = caught?.id === plushie.id && phase === "lifting";

          return (
            <motion.div
              key={plushie.id}
              className={cn(
                "pointer-events-none absolute bottom-[66px] transition-opacity will-change-transform",
                isHidden && "opacity-0"
              )}
              style={{ left: `${plushie.x}%`, x: "-50%" }}
              animate={!shouldAnimateAmbient || isHidden || isMoving ? { y: 0 } : { y: [0, -3, 0] }}
              transition={
                !shouldAnimateAmbient || isHidden || isMoving
                  ? { duration: 0 }
                  : {
                      duration: 3 + (index % 3) * 0.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.18,
                    }
              }
            >
              <div
                style={{ transform: `rotate(${index % 2 === 0 ? -5 : 4}deg)` }}
              >
                <MiniPlushie plushie={plushie} />
              </div>
            </motion.div>
          );
        })}

        <div className="absolute bottom-0 left-0 right-0 h-[62px] border-t border-[#D1BE9B]/24 bg-[linear-gradient(180deg,rgba(255,253,248,0.92),rgba(231,216,201,0.82))]">
          <div className="absolute left-1/2 top-2 h-10 w-32 -translate-x-1/2 rounded-b-2xl border border-[#D1BE9B]/30 bg-[#FFFDF8]/86 shadow-[inset_0_6px_12px_rgba(111,90,58,0.06)]" />
          <div className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-1 text-[11px] tracking-[0.12em] text-[#A38D6B]">
            <Gift className="size-3.5" />
            <span>出口</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-[#D1BE9B]/20 bg-[#FFFDF8]/86 p-4">
        <div className="relative min-h-[76px] overflow-hidden rounded-2xl border border-[#D1BE9B]/18 bg-white/58 px-4 py-3 shadow-[0_8px_22px_rgba(111,90,58,0.06)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase === "won" ? "won" : phase === "missed" ? "missed" : "aim"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }}
            >
              {phase === "won" && caught ? (
                <>
                  <p className="text-[14px] font-medium tracking-[0.08em] text-[#6F5A3A]">
                    你抓到了：{caught.name}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed tracking-[0.04em] text-[#A38D6B]">
                    已收進 Mochi 小收藏 ✦
                  </p>
                </>
              ) : phase === "missed" ? (
                <>
                  <p className="text-[14px] font-medium tracking-[0.08em] text-[#6F5A3A]">差一點就抓到了</p>
                  <p className="mt-1 text-[12px] leading-relaxed tracking-[0.04em] text-[#31353A]/62">
                    小傢伙滑走了一點點。再調整位置，答案也正在路上。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium tracking-[0.08em] text-[#6F5A3A]">
                    拖曳爪子找位置
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed tracking-[0.04em] text-[#31353A]/62">
                    移到想抓的位置後，再按下降抓取。
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>


        <div className="flex justify-center rounded-[22px] border border-[#D1BE9B]/18 bg-[#F8F4EC]/58 p-2 shadow-[inset_0_1px_8px_rgba(255,255,255,0.54)]">
          <Button
            type="button"
            size="sm"
            disabled={isMoving}
            onClick={grab}
            className="h-11 min-w-28 rounded-full bg-[#6F5A3A] text-[#FFFDF8] shadow-[0_10px_22px_rgba(111,90,58,0.18)] hover:bg-[#A38D6B]"
          >
            <ChevronDown className="size-4" />
            下降抓取
          </Button>
        </div>

        {todayCollection.length > 0 && (
          <div className="rounded-2xl border border-[#D1BE9B]/18 bg-white/52 px-4 py-3">
            <p className="text-[12px] font-medium tracking-[0.1em] text-[#6F5A3A]">
              今日心情娃娃 · {todayCollection.length}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {todayCollection.slice(0, 6).map((item) => (
                <span
                  key={`${item.id}-${item.caughtAt}`}
                  className="rounded-full border border-[#D1BE9B]/16 bg-[#F8F4EC]/72 px-2.5 py-1 text-[11px] text-[#31353A]/58"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPrize && caught && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="關閉"
              onClick={() => setShowPrize(false)}
              className="absolute inset-0 cursor-default bg-[#31353A]/35 backdrop-blur-[3px]"
            />
            {!reduceMotion && <WinConfetti />}
            <motion.div
              className="relative z-10 w-full max-w-[300px] overflow-hidden rounded-[26px] border border-[#D1BE9B]/35 bg-[linear-gradient(160deg,rgba(255,253,248,0.98),rgba(243,235,221,0.92))] p-5 text-center shadow-[0_24px_60px_rgba(111,90,58,0.28)]"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 14 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 22 }}
            >
              <button
                type="button"
                aria-label="關閉"
                onClick={() => setShowPrize(false)}
                className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full border border-[#D1BE9B]/30 bg-white/70 text-[#A38D6B] shadow-sm transition hover:bg-[#F3EBDD]"
              >
                <X className="size-4" />
              </button>
              <p
                className="text-[10px] tracking-[0.28em] text-[#D1BE9B]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                TODAY'S COMPANION
              </p>
              <div className="relative mx-auto mt-3 flex h-32 w-32 items-center justify-center rounded-[24px] border border-white/70 bg-white/56 shadow-[inset_0_1px_14px_rgba(255,255,255,0.72)]">
                <div className="absolute inset-4 rounded-full bg-[#F1CF7A]/14 blur-md" />
                <motion.div
                  className="relative z-10"
                  initial={reduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1.3 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 320, damping: 15, delay: 0.1 }
                  }
                >
                  <MiniPlushie plushie={caught} />
                </motion.div>
              </div>
              <p
                className="mt-4 text-[17px] font-medium tracking-[0.1em] text-[#6F5A3A]"
                style={{ fontFamily: "Noto Serif TC, serif" }}
              >
                {caught.name}
              </p>
              <p className="mt-1.5 inline-flex rounded-full border border-[#D1BE9B]/24 bg-white/64 px-3 py-1 text-[11px] tracking-[0.1em] text-[#A38D6B]">
                {caught.role}
              </p>
              <p className="mx-auto mt-3 max-w-[240px] text-[12px] leading-[1.9] tracking-[0.05em] text-[#31353A]/68">
                {caught.message}
              </p>
              <p className="mt-3 text-[11px] tracking-[0.08em] text-[#A38D6B]">
                已收進 Mochi 小收藏，答案開頭也會帶著它一起出現。
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowPrize(false)}
                className="mt-4 h-10 w-full rounded-full bg-[#6F5A3A] text-[#FFFDF8] shadow-[0_10px_22px_rgba(111,90,58,0.18)] hover:bg-[#A38D6B]"
              >
                繼續抓娃娃
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type MiniPlushieProps = {
  plushie: Plushie;
  className?: string;
  style?: React.CSSProperties;
};

type PlushieLook = {
  silhouette: "round" | "long-ear" | "point-ear" | "winged" | "fin" | "shell" | "soft";
  accessory:
    | "none"
    | "glow"
    | "note"
    | "cup"
    | "map"
    | "shield"
    | "tool"
    | "leaf"
    | "direction"
    | "soft"
    | "battery";
};

const PLUSHIE_BADGES: Record<string, string> = {
  "hug-bear": "♡",
  "brave-bunny": "⚑",
  "tea-cat": "☕",
  "lamp-penguin": "✦",
  "cloud-sheep": "☁",
  "reset-otter": "↻",
  "blanket-dog": "∿",
  "battery-hamster": "▭",
  "umbrella-duck": "☂",
  "map-fox": "◇",
  "pillow-koala": "◐",
  "tiny-captain": "⚓",
  "snack-squirrel": "◒",
  "bubble-fish": "○",
  "memo-frog": "□",
  "tiny-lion": "♕",
  "music-whale": "♪",
  "paper-plane-bird": "✈",
  "compass-turtle": "⌖",
  "moon-moth": "☽",
  "pocket-elephant": "◔",
  "eraser-panda": "▱",
  "sunny-alpaca": "☀",
  "quiet-owl": "◉",
  "raincoat-mouse": "☂",
  "anchor-crab": "⚓",
  "starlight-deer": "✦",
  "laundry-bear": "⌁",
  "toolbox-beaver": "⚒",
  "seed-hedgehog": "◌",
  "clock-sloth": "◷",
  "postcard-gull": "✉",
  "lantern-rabbit": "✧",
  "cushion-pig": "▰",
  "bookmark-goat": "▯",
  "soup-bear": "◡",
  "kite-kangaroo": "⌁",
  "mirror-swan": "◈",
  "sock-monkey": "≋",
  "garden-snail": "⌒",
};

function getPlushiePattern(id: string) {
  const patterns = ["scarf", "belly", "stripe", "pocket", "spark"] as const;
  const total = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return patterns[total % patterns.length];
}

function getPlushieLook(id: string): PlushieLook {
  if (/(bunny|rabbit)/u.test(id)) {
    return { silhouette: "long-ear", accessory: id.includes("lantern") ? "glow" : "none" };
  }

  if (/(cat|fox|lion)/u.test(id)) {
    return { silhouette: "point-ear", accessory: id.includes("map") ? "map" : "none" };
  }

  if (/(penguin|duck|bird|owl|moth|swan|gull)/u.test(id)) {
    return {
      silhouette: "winged",
      accessory: /(paper|postcard|bookmark)/u.test(id) ? "note" : id.includes("moon") ? "glow" : "none",
    };
  }

  if (/(fish|whale)/u.test(id)) {
    return { silhouette: "fin", accessory: id.includes("music") ? "note" : "none" };
  }

  if (/(turtle|snail|crab)/u.test(id)) {
    return { silhouette: "shell", accessory: /(compass|anchor)/u.test(id) ? "direction" : "none" };
  }

  if (/(sheep|alpaca|koala|sloth|pig|dog|pillow|blanket|cushion)/u.test(id)) {
    return { silhouette: "soft", accessory: /(pillow|blanket|cushion)/u.test(id) ? "soft" : id.includes("sunny") ? "glow" : "none" };
  }

  if (/(tea|soup|snack)/u.test(id)) {
    return { silhouette: "round", accessory: "cup" };
  }

  if (/(memo|postcard|bookmark|eraser)/u.test(id)) {
    return { silhouette: "round", accessory: "note" };
  }

  if (/(umbrella|raincoat)/u.test(id)) {
    return { silhouette: "round", accessory: "shield" };
  }

  if (/(toolbox)/u.test(id)) {
    return { silhouette: "round", accessory: "tool" };
  }

  if (/(seed|garden)/u.test(id)) {
    return { silhouette: "round", accessory: "leaf" };
  }

  if (/(compass|anchor|plane|kite)/u.test(id)) {
    return { silhouette: "round", accessory: "direction" };
  }

  if (/(battery)/u.test(id)) {
    return { silhouette: "round", accessory: "battery" };
  }

  if (/(lamp|starlight|sunny|lantern|moon)/u.test(id)) {
    return { silhouette: "round", accessory: "glow" };
  }

  return { silhouette: "round", accessory: "none" };
}

function FeaturedMiniPlushie({ plushie, className, style }: MiniPlushieProps) {
  const isBear = plushie.id === "hug-bear";
  const isBunny = plushie.id === "brave-bunny";
  const isCat = plushie.id === "tea-cat";
  const isPenguin = plushie.id === "lamp-penguin";
  const isSheep = plushie.id === "cloud-sheep";
  const isTurtle = plushie.id === "compass-turtle";
  const isDeer = plushie.id === "starlight-deer";
  const isMouse = plushie.id === "raincoat-mouse";
  const isCrab = plushie.id === "anchor-crab";
  const isMoth = plushie.id === "moon-moth";

  return (
    <div
      className={cn("flex w-[78px] flex-col items-center", className)}
      style={style}
      aria-label={plushie.name}
    >
      <div className="relative h-[78px] w-[70px] drop-shadow-[0_10px_14px_rgba(111,90,58,0.18)]">
        <div className="absolute bottom-0 left-1/2 h-2.5 w-12 -translate-x-1/2 rounded-full bg-[#6F5A3A]/10 blur-[1px]" />

        {isBear && (
          <>
            <div className="absolute left-2 top-4 size-5 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-2 top-4 size-5 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-5 h-[52px] w-14 -translate-x-1/2 rounded-[48%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.18)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-10 h-6 w-9 -translate-x-1/2 rounded-full border border-white/45" style={{ backgroundColor: plushie.accent }} />
            <div className="absolute left-[23px] top-[35px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[23px] top-[35px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute left-1/2 top-[45px] h-px w-4 -translate-x-1/2 bg-[#31353A]/45" />
            <div className="absolute left-1/2 bottom-2 flex h-5 w-7 -translate-x-1/2 items-center justify-center rounded-[45%_45%_55%_55%] border border-white/65 bg-[#FFF4F2] text-[10px] text-[#EAA8AC] shadow-sm">♡</div>
          </>
        )}

        {isBunny && (
          <>
            <div className="absolute left-4 top-0 h-10 w-3.5 -rotate-12 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-4 top-0 h-10 w-3.5 rotate-12 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-[19px] top-2 h-6 w-1.5 rounded-full bg-white/40" />
            <div className="absolute right-[19px] top-2 h-6 w-1.5 rounded-full bg-white/40" />
            <div className="absolute left-1/2 top-8 h-11 w-[52px] -translate-x-1/2 rounded-[50%_50%_44%_44%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.2)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute left-1/2 top-[50px] h-px w-4 -translate-x-1/2 bg-[#31353A]/45" />
            <div className="absolute right-1 bottom-4 h-9 w-px -rotate-12 bg-[#A38D6B]/70" />
            <div className="absolute right-[-2px] bottom-10 h-4 w-5 rounded-[2px_8px_8px_2px] border border-white/65 bg-[#EAA8AC]/80 text-[8px]" />
          </>
        )}

        {isCat && (
          <>
            <div className="absolute left-2 top-5 size-5 rotate-45 rounded-[45%_0_45%_0] border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-2 top-5 size-5 rotate-45 rounded-[45%_0_45%_0] border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-7 h-11 w-14 -translate-x-1/2 rounded-[48%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.18)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-[23px] top-[39px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[23px] top-[39px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute left-1/2 top-[47px] h-1.5 w-2 -translate-x-1/2 rounded-full bg-[#9F775A]" />
            <div className="absolute left-2 top-[48px] h-px w-5 rotate-12 bg-[#31353A]/30" />
            <div className="absolute right-2 top-[48px] h-px w-5 -rotate-12 bg-[#31353A]/30" />
            <div className="absolute right-0 bottom-2 flex size-6 items-center justify-center rounded-full border border-white/70 bg-[#FFFDF8] text-[11px] text-[#9F775A] shadow-sm">☕</div>
          </>
        )}

        {isPenguin && (
          <>
            <div className="absolute left-1/2 top-4 h-14 w-[52px] -translate-x-1/2 rounded-[50%_50%_46%_46%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.14)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-10 h-7 w-9 -translate-x-1/2 rounded-full bg-white/70" />
            <div className="absolute left-[24px] top-[31px] size-2 rounded-full bg-[#31353A]/80" />
            <div className="absolute right-[24px] top-[31px] size-2 rounded-full bg-[#31353A]/80" />
            <div className="absolute left-1/2 top-[40px] size-2 -translate-x-1/2 rotate-45 rounded-[0_70%_0_70%]" style={{ backgroundColor: plushie.accent }} />
            <div className="absolute left-1/2 bottom-4 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-[#FFF8D8] text-[11px] text-[#D1A84D] shadow-[0_0_14px_rgba(241,207,122,0.48)]">✦</div>
          </>
        )}

        {isSheep && (
          <>
            {[8, 17, 27, 38, 48].map((left, index) => (
              <div key={left} className="absolute top-4 size-5 rounded-full border border-white/65 bg-white/78" style={{ left, transform: `translateY(${index % 2 ? 3 : 0}px)` }} />
            ))}
            <div className="absolute left-1/2 top-8 h-11 w-14 -translate-x-1/2 rounded-[50%_50%_46%_46%] border border-white/60 shadow-[inset_0_8px_0_rgba(255,255,255,0.24)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/70" />
            <div className="absolute right-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/70" />
            <div className="absolute left-1/2 top-[50px] h-px w-4 -translate-x-1/2 bg-[#31353A]/35" />
            <div className="absolute left-2 bottom-3 size-4 rounded-full bg-white/72" />
            <div className="absolute right-2 bottom-3 size-4 rounded-full bg-white/72" />
          </>
        )}

        {isTurtle && (
          <>
            <div className="absolute left-1/2 top-3 h-10 w-11 -translate-x-1/2 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-9 h-12 w-[60px] -translate-x-1/2 rounded-[48%] border border-white/55 shadow-[inset_0_-8px_0_rgba(255,255,255,0.16)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-11 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/60 text-[15px] text-[#6F5A3A]" style={{ backgroundColor: plushie.accent }}>⌖</div>
            <div className="absolute left-[25px] top-[23px] size-1.5 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[25px] top-[23px] size-1.5 rounded-full bg-[#31353A]/75" />
            <div className="absolute left-0 bottom-5 size-4 rounded-full border border-white/45" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-0 bottom-5 size-4 rounded-full border border-white/45" style={{ backgroundColor: plushie.color }} />
          </>
        )}

        {isDeer && (
          <>
            <div className="absolute left-5 top-0 h-8 w-px -rotate-25 bg-[#8A7250]/65" />
            <div className="absolute left-[17px] top-2 h-4 w-px rotate-35 bg-[#8A7250]/65" />
            <div className="absolute right-5 top-0 h-8 w-px rotate-25 bg-[#8A7250]/65" />
            <div className="absolute right-[17px] top-2 h-4 w-px -rotate-35 bg-[#8A7250]/65" />
            <div className="absolute left-2 top-6 size-5 rounded-full border border-white/50" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-2 top-6 size-5 rounded-full border border-white/50" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-6 h-12 w-[52px] -translate-x-1/2 rounded-[48%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.16)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-8 -translate-x-1/2 text-[13px] text-[#F3E0A0]">✦</div>
            <div className="absolute left-[24px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[24px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
          </>
        )}

        {isMouse && (
          <>
            <div className="absolute left-1 top-5 size-6 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-1 top-5 size-6 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-6 h-12 w-14 -translate-x-1/2 rounded-[52%_52%_45%_45%] border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-5 h-9 w-12 -translate-x-1/2 rounded-t-full border border-white/65 bg-[#F2D36E]/88" />
            <div className="absolute left-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[23px] top-[40px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-0 bottom-5 h-8 w-8 rounded-t-full border-2 border-[#F2D36E]/90 border-b-0" />
          </>
        )}

        {isCrab && (
          <>
            <div className="absolute left-0 top-7 size-6 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-0 top-7 size-6 rounded-full border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-7 h-12 w-14 -translate-x-1/2 rounded-[52%_52%_42%_42%] border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.16)]" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-[23px] top-[39px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute right-[23px] top-[39px] size-2 rounded-full bg-[#31353A]/75" />
            <div className="absolute left-1/2 bottom-4 flex size-6 -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-[#FFFDF8]/90 text-[12px] text-[#6E8792] shadow-sm">⚓</div>
          </>
        )}

        {isMoth && (
          <>
            <div className="absolute left-0 top-7 h-10 w-8 -rotate-12 rounded-[85%_30%_80%_36%] border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute right-0 top-7 h-10 w-8 rotate-12 rounded-[30%_85%_36%_80%] border border-white/55" style={{ backgroundColor: plushie.color }} />
            <div className="absolute left-1/2 top-5 h-[52px] w-9 -translate-x-1/2 rounded-full border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.14)]" style={{ backgroundColor: plushie.accent }} />
            <div className="absolute left-[28px] top-[35px] size-1.5 rounded-full bg-[#31353A]/70" />
            <div className="absolute right-[28px] top-[35px] size-1.5 rounded-full bg-[#31353A]/70" />
            <div className="absolute left-3 top-10 text-[10px] text-[#EEE4A6]">☽</div>
            <div className="absolute right-3 top-10 text-[10px] text-[#EEE4A6]">☾</div>
          </>
        )}
      </div>
    </div>
  );
}

const MiniPlushie = memo(function MiniPlushie({ plushie, className, style }: MiniPlushieProps) {
  const [imageBroken, setImageBroken] = useState(false);

  // Photo-real path: a cut-out PNG of the actual plush toy. Falls back to the
  // CSS doll below if no image is set or the file fails to load.
  if (plushie.image && !imageBroken) {
    return (
      <div
        className={cn("flex w-[78px] flex-col items-center", className)}
        style={style}
        aria-label={plushie.name}
      >
        <div className="relative h-[78px] w-[70px] will-change-transform drop-shadow-[0_12px_16px_rgba(111,90,58,0.22)]">
          {/* Soft contact shadow so the toy reads as sitting on the machine floor. */}
          <div className="absolute bottom-0 left-1/2 h-2.5 w-12 -translate-x-1/2 rounded-full bg-[#6F5A3A]/14 blur-[2px]" />
          <img
            src={plushie.image}
            alt={plushie.name}
            width={512}
            height={512}
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => setImageBroken(true)}
            className="absolute inset-0 h-full w-full select-none object-contain will-change-transform"
          />
        </div>
      </div>
    );
  }

  if (FEATURED_PLUSHIE_IDS.includes(plushie.id)) {
    return <FeaturedMiniPlushie plushie={plushie} className={className} style={style} />;
  }

  const look = getPlushieLook(plushie.id);
  const headRadius =
    look.silhouette === "fin"
      ? "54% 46% 52% 48%"
      : look.silhouette === "shell"
        ? "50% 50% 44% 44%"
        : "48% 48% 46% 46%";
  const badge = PLUSHIE_BADGES[plushie.id] ?? "✦";
  const pattern = getPlushiePattern(plushie.id);

  return (
    <div
      className={cn("flex w-[76px] flex-col items-center", className)}
      style={style}
      aria-label={plushie.name}
    >
      <div className="relative h-[74px] w-[66px] drop-shadow-[0_10px_14px_rgba(111,90,58,0.18)]">
        <div className="absolute bottom-0 left-1/2 h-2 w-11 -translate-x-1/2 rounded-full bg-[#6F5A3A]/10 blur-[1px]" />
        {look.silhouette === "long-ear" ? (
          <>
            <div
              className="absolute left-[13px] top-0 h-9 w-3.5 -rotate-12 rounded-full border border-white/45 shadow-sm"
              style={{ backgroundColor: plushie.color, boxShadow: `inset 0 7px 0 rgba(255,255,255,0.22)` }}
            />
            <div
              className="absolute right-[13px] top-0 h-9 w-3.5 rotate-12 rounded-full border border-white/45 shadow-sm"
              style={{ backgroundColor: plushie.color, boxShadow: `inset 0 7px 0 rgba(255,255,255,0.22)` }}
            />
            <div className="absolute left-[17px] top-2 h-5 w-1.5 rounded-full bg-white/38" />
            <div className="absolute right-[17px] top-2 h-5 w-1.5 rounded-full bg-white/38" />
          </>
        ) : look.silhouette === "point-ear" ? (
          <>
            <div
              className="absolute left-2 top-2 size-5 rotate-45 rounded-[45%_0_45%_0] border border-white/45 shadow-sm"
              style={{ backgroundColor: plushie.color }}
            />
            <div
              className="absolute right-2 top-2 size-5 rotate-45 rounded-[45%_0_45%_0] border border-white/45 shadow-sm"
              style={{ backgroundColor: plushie.color }}
            />
          </>
        ) : look.silhouette === "winged" ? (
          <>
            <div
              className="absolute left-0 top-9 h-7 w-5 -rotate-12 rounded-[90%_20%_80%_30%] border border-white/45"
              style={{ backgroundColor: plushie.accent }}
            />
            <div
              className="absolute right-0 top-9 h-7 w-5 rotate-12 rounded-[20%_90%_30%_80%] border border-white/45"
              style={{ backgroundColor: plushie.accent }}
            />
          </>
        ) : look.silhouette === "fin" ? (
          <>
            <div
              className="absolute right-0 top-9 size-6 rotate-45 rounded-[0_80%_0_80%] border border-white/45"
              style={{ backgroundColor: plushie.accent }}
            />
            <div
              className="absolute left-1 top-10 h-4 w-3 -rotate-12 rounded-full border border-white/45"
              style={{ backgroundColor: plushie.color }}
            />
          </>
        ) : (
          <>
            <div
              className="absolute left-2 top-4 size-5 rounded-full border border-white/45"
              style={{ backgroundColor: plushie.color }}
            />
            <div
              className="absolute right-2 top-4 size-5 rounded-full border border-white/45"
              style={{ backgroundColor: plushie.color }}
            />
          </>
        )}
        <div
          className="absolute left-1/2 top-5 h-12 w-14 -translate-x-1/2 border border-white/55 shadow-[inset_0_8px_0_rgba(255,255,255,0.18),0_8px_16px_rgba(111,90,58,0.12)]"
          style={{ backgroundColor: plushie.color, borderRadius: headRadius }}
        />
        {look.silhouette === "shell" && (
          <div
            className="absolute left-1/2 top-8 h-8 w-11 -translate-x-1/2 rounded-[48%] border border-white/55 bg-white/22"
            style={{ boxShadow: `inset 0 -7px 0 ${plushie.accent}` }}
          />
        )}
        <div
          className="absolute left-1/2 top-9 h-5 w-8 -translate-x-1/2 rounded-full border border-white/36"
          style={{ backgroundColor: plushie.accent }}
        />
        {pattern === "scarf" && (
          <div
            className="absolute left-1/2 top-[52px] h-2.5 w-10 -translate-x-1/2 rounded-full border border-white/45 shadow-sm"
            style={{ backgroundColor: plushie.accent }}
          />
        )}
        {pattern === "belly" && (
          <div className="absolute left-1/2 top-[49px] size-5 -translate-x-1/2 rounded-full border border-white/55 bg-white/32" />
        )}
        {pattern === "stripe" && (
          <>
            <div className="absolute left-1/2 top-[51px] h-px w-8 -translate-x-1/2 rounded-full bg-white/45" />
            <div className="absolute left-1/2 top-[56px] h-px w-7 -translate-x-1/2 rounded-full bg-white/35" />
          </>
        )}
        {pattern === "pocket" && (
          <div className="absolute left-1/2 top-[50px] h-4 w-5 -translate-x-1/2 rounded-b-full border border-white/55 bg-[#FFFDF8]/34" />
        )}
        {pattern === "spark" && (
          <div className="absolute left-1/2 top-[52px] -translate-x-1/2 text-[11px] leading-none text-white/74">{badge}</div>
        )}
        <div className="absolute left-[23px] top-9 size-2 rounded-full bg-[#31353A]/75" />
        <div className="absolute right-[23px] top-9 size-2 rounded-full bg-[#31353A]/75" />
        <div className="absolute left-[18px] top-[43px] size-2 rounded-full bg-[#EAA8AC]/34" />
        <div className="absolute right-[18px] top-[43px] size-2 rounded-full bg-[#EAA8AC]/34" />
        {look.silhouette === "winged" && (
          <div
            className="absolute left-1/2 top-[45px] h-2.5 w-4 -translate-x-1/2 rounded-[0_0_80%_80%] bg-white/45"
          />
        )}
        <div className="absolute left-1/2 top-[47px] h-px w-4 -translate-x-1/2 rounded-full bg-[#31353A]/45" />
        <div
          className="absolute bottom-2 left-[14px] h-3 w-2.5 -rotate-12 rounded-full border border-white/36"
          style={{ backgroundColor: plushie.color }}
        />
        <div
          className="absolute bottom-2 right-[14px] h-3 w-2.5 rotate-12 rounded-full border border-white/36"
          style={{ backgroundColor: plushie.color }}
        />
        <div
          className="absolute bottom-0 left-[19px] h-2.5 w-4 rounded-full border border-white/36"
          style={{ backgroundColor: plushie.accent }}
        />
        <div
          className="absolute bottom-0 right-[19px] h-2.5 w-4 rounded-full border border-white/36"
          style={{ backgroundColor: plushie.accent }}
        />
        {look.accessory !== "none" && (
          <div
            className="absolute bottom-3 right-1 flex size-5 items-center justify-center rounded-full border border-white/70 bg-[#FFFDF8]/94 text-[10px] leading-none shadow-[0_5px_10px_rgba(111,90,58,0.16)]"
            style={{ color: plushie.accent }}
            aria-hidden="true"
          >
            {badge}
          </div>
        )}
        {look.accessory === "none" && (
          <div
            className="absolute bottom-3 right-1 flex size-5 items-center justify-center rounded-full border border-white/70 bg-[#FFFDF8]/94 text-[10px] leading-none shadow-[0_5px_10px_rgba(111,90,58,0.16)]"
            style={{ color: plushie.accent }}
            aria-hidden="true"
          >
            {badge}
          </div>
        )}
      </div>
    </div>
  );
});
