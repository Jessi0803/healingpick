# Soul Ease TODO

## 後端整合
- [x] 建立 drizzle schema：readings（占卜記錄）、treehole_sessions（樹洞對話）
- [x] 建立 tRPC 路由：tarot（塔羅占卜）
- [x] 建立 tRPC 路由：ziwei（紫微斗數）
- [x] 建立 tRPC 路由：fortune（每日運勢）
- [x] 建立 tRPC 路由：treehole（心靈樹洞 AI 對話）
- [x] 修正 LLM response content 型別問題（加入 extractTextContent 輔助函數）

## 前端整合
- [x] 塔羅頁面連接後端 LLM 解讀 API
- [x] 紫微斗數頁面連接後端 LLM 解讀 API
- [x] 每日運勢頁面連接後端 LLM API
- [x] 心靈樹洞頁面連接後端 LLM 對話 API
- [x] 修復 NotFound 頁面（保留原有 Soul Ease 設計風格）
- [x] 修正 Home.tsx 缺少 useAuth import
- [x] 修正 Fortune.tsx 使用不存在的 trpc.fortune.getDaily

## 測試與部署
- [x] 撰寫後端 tRPC 路由 vitest 測試（10/10 通過）
- [x] TypeScript 編譯零錯誤
- [x] 建立 checkpoint

## 待辦（未來功能）
- [x] 商店頁面（Shop.tsx）功能完善（加入 sonner toast，取代 alert）
- [x] 使用者占卜歷史記錄（History.tsx）頁面，需登入，包含占卜記錄和樹洞對話

## 缺口修補
- [x] Tarot / Ziwei / Fortune 成功解讀後呼叫 history.saveReading 儲存紀錄
- [x] Treehole 成功回應後呼叫 history.saveTreeholeSession 儲存對話
- [x] History.tsx 補上 query error state 與重試 UI

## 缺口修補 v2
- [x] 在 Tarot / Ziwei / Treehole 儲存前先檢查 isAuthenticated，未登入則跳過（不觸發全域跳轉）
- [x] 將 Fortune 的自動儲存從 render phase 移到 useEffect，避免重複寫入

## 互動貓咪元素
- [x] 建立全站浮動貓咪助理元件（CatCompanion）：右下角固定位置，點擊展開對話泡泡，顯示隨機療癒語句
- [x] 擴充 CatElements.tsx：新增更多貓咪姿態 SVG（伸懶腰、舉爪打招呼、偷窺、睡覺）
- [x] 首頁加入互動貓咪：點擊貓咪顯示不同表情/語句
- [x] 塔羅頁面加入貓咪陪伴：洗牌時貓咪搖尾巴，選牌時貓咪舉爪
- [x] 紫微斗數頁面加入貓咪：排盤時貓咪盯著命盤看
- [x] 心靈樹洞加入貓咪：貓咪坐在旁邊傾聽，使用者輸入時貓咪豎起耳朵
- [x] 商店頁面加入貓咪：貓咪坐在商品旁邊
- [x] 在 App.tsx 加入全站 CatCompanion 元件

## Mochi 三項優化
- [x] 更新 Navbar 副標題為「Mochi．crystal」
- [x] 更新心靈樹洞輸入框 placeholder 加入「跟 Mochi 說話」
- [x] 建立 Mochi AI 對話後端 tRPC procedure（串流）
- [x] CatCompanion 前端加入 AI 對話輸入框與串流回應顯示

## AI 運勢升級（月相 + 星座特性）
- [x] 後端建立月相計算函式（getMoonPhase）
- [x] 後端建立 AI 運勢 tRPC procedure（fortune.getAIDailyFortune）
- [x] 前端 Fortune.tsx 接入 AI 運勢 API，加入載入狀態與快取
