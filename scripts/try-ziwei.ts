import { ziweiRouter } from "../server/routers/ziwei";

const ctx = {
  req: { headers: {}, socket: {} },
  res: {},
  user: null,
  anonId: null,
  ipHash: null,
} as any;

const main = async () => {
  const caller = ziweiRouter.createCaller(ctx);
  const res = await caller.interpret({
    solarDate: "1995-03-28",
    timeIndex: 5, // 巳時
    gender: "女",
    focusArea: "我跟他合適嗎？",
    partnerSolarDate: "1992-11-15",
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
