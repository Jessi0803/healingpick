import { tarotRouter } from "../server/routers/tarot";

const ctx = {
  req: { headers: {}, socket: {} },
  res: {},
  user: null,
  anonId: null,
  ipHash: null,
} as any;

const cards = [
  { name: "寶劍三", en: "Three of Swords", symbol: "💔", meaning: "心碎、分離、傷痛", reversed: true, position: "核心", positionDesc: "問題核心" },
  { name: "月亮", en: "The Moon", symbol: "🌙", meaning: "不安、曖昧不明、潛在情緒", reversed: false, position: "對方狀態", positionDesc: "他現在的心境" },
  { name: "聖杯二", en: "Two of Cups", symbol: "🏆", meaning: "連結、和好、互相吸引", reversed: false, position: "你們之間", positionDesc: "關係能量" },
  { name: "節制", en: "Temperance", symbol: "🍶", meaning: "磨合、調和、慢慢來", reversed: false, position: "建議", positionDesc: "可以怎麼做" },
  { name: "戀人", en: "The Lovers", symbol: "💞", meaning: "選擇、結合、重新連結", reversed: true, position: "結果", positionDesc: "可能的走向" },
];

const main = async () => {
  const caller = tarotRouter.createCaller(ctx);
  const res = await caller.interpret({
    question: "我跟前任會不會復合？我們上個月剛分手，他到現在都沒主動聯絡我",
    questionType: "感情/復合",
    cards,
  });
  console.log("======== 解讀 ========\n");
  console.log(res.interpretation);
  console.log("\n======== 商品推薦訊號 ========\n");
  console.log(JSON.stringify(res.recommendation, null, 2));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
