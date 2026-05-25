# SOUL EASE ｜ 椛．crystal — 設計方向

## 選定方案：「燕麥奶茶靈境」

### Design Movement
**Wabi-Sabi Luxe** — 不完美的奢華，融合日式侘寂美學與法式精品極簡主義。
不追求完美對稱，而是在留白、紋理與溫柔光暈中找到靈性的安定感。

### Core Principles
1. **呼吸感優先**：大量留白，讓每個元素都有空間「呼吸」
2. **溫度感材質**：米白紙張質感、毛玻璃、金屬燙金線條
3. **動態儀式感**：每個互動都像一個小小的儀式，緩慢而有意義
4. **文字即設計**：極細中文字體（Noto Serif TC 200-300）作為視覺主角

### Color Philosophy
莫蘭迪燕麥奶茶色系，傳遞「溫柔、安全、靈性」的情感：
- `#FAF7F4` — 主背景，極淡燕麥白
- `#F2EDE8` — 次背景，溫暖奶茶米
- `#D1BE9B` — 金色點綴，燙金質感
- `#E5DFEE` — 薰衣草霧，靈性紫調
- `#3D4144` — 炭灰文字，溫柔而不刺眼
- `#EDE8E2` — 卡片底色，手工紙感

### Layout Paradigm
**非對稱詩意排版**：
- 文字靠左，留白在右（或反之），製造視覺張力
- 垂直節奏：大標題 → 細線分隔 → 小標籤 → 內文
- 卡片不使用統一圓角，部分用直角強調精品感

### Signature Elements
1. **流光粒子背景**：飄落的星芒與葉片，極低透明度
2. **燙金細線框**：1px 金色邊框，搭配角落裝飾符文
3. **毛玻璃面板**：`backdrop-blur` + 半透明白，層次感

### Interaction Philosophy
每個點擊都是一次「儀式」：
- 按鈕按下時有輕微縮放（scale 0.97）
- 頁面切換用淡入淡出（300ms ease-out）
- 占卜結果出現時用緩慢上升動畫（translateY + opacity）

### Animation
- 背景極光流動：22s 無限循環
- 粒子飄落：各自獨立速度，自然感
- 卡片懸停：輕微上移 (-4px) + 陰影加深
- 占卜翻牌：3D rotateY，1.2s cubic-bezier(0.22, 1, 0.36, 1)

### Typography System
- 標題：`Noto Serif TC` weight 200-300，極細，字距 0.2-0.3em
- 英文標題：`Cormorant Garamond` italic，優雅古典
- 內文：`Noto Sans TC` weight 300，字距 0.1em，行距 1.8
- 裝飾標籤：`Noto Serif TC` weight 200，字距 0.4em，全大寫
