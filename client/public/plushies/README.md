# 抓娃娃機 — 真實娃娃圖片

把每隻娃娃的「去背 PNG」放這裡,檔名 = 娃娃 id,例如 `hug-bear.png`。
然後在 `client/src/components/MoodClawMachine.tsx` 的 `PLUSHIES` 裡，
幫那一筆加上 `image: "/plushies/hug-bear.png"`。

- 圖片**透明背景**、正方形(建議 512×512），娃娃置中、底部留一點空間。
- 沒放圖、或圖載入失敗的娃娃，會自動沿用原本的 CSS 娃娃(不會壞)。
- 一次補一隻也可以，不用一次到齊。

## 娃娃清單（檔名 → 名稱）

| 檔名 | 名稱 |
| --- | --- |
| hug-bear.png | 抱抱熊 |
| brave-bunny.png | 勇氣兔 |
| tea-cat.png | 熱茶貓 |
| lamp-penguin.png | 小夜燈企鵝 |
| cloud-sheep.png | 雲朵羊 |
| reset-otter.png | 重開機水獺 |
| blanket-dog.png | 毛毯狗 |
| battery-hamster.png | 低電量倉鼠 |
| umbrella-duck.png | 小傘鴨 |
| map-fox.png | 地圖狐狸 |
| pillow-koala.png | 枕頭無尾熊 |
| tiny-captain.png | 小隊長海豹 |
| snack-squirrel.png | 點心松鼠 |
| bubble-fish.png | 泡泡魚 |
| memo-frog.png | 便利貼青蛙 |
| tiny-lion.png | 小獅子 |
| music-whale.png | 哼歌鯨魚 |
| paper-plane-bird.png | 紙飛機鳥 |
| compass-turtle.png | 指南針烏龜 |
| moon-moth.png | 月光蛾 |

## AI 生成 prompt（讓整組風格一致 — 逐隻替換主角）

> A cute soft plush toy of **<主角，例：a honey-brown teddy bear hugging itself>**,
> studio product photo, fuzzy felt fabric texture, soft volumetric lighting from
> top-left, matte (no shiny plastic), visible stitching and seams, sitting upright,
> centered, **transparent background**, kawaii but realistic, pastel muted palette,
> high detail, 1:1 square.
