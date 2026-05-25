import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM, extractTextContent } from "../_core/llm";

export const treeholeRouter = router({
  /**
   * 心靈樹洞：根據心情與心事，給予溫柔的 AI 回應
   */
  comfort: publicProcedure
    .input(
      z.object({
        mood: z.string(),
        moodLabel: z.string(),
        text: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `你是「椛」，一位溫柔、有智慧的心靈陪伴者。
你的特質：
- 充滿同理心，善於傾聽，不評判
- 語氣溫柔、細膩，像一位最好的朋友
- 使用繁體中文，語言優美、有溫度
- 不給過於直接的建議，而是陪伴對方看見自己的感受
- 適時給予正向的力量與鼓勵
- 回應約 200-300 字，分段自然

你的回應結構：
1. 先真誠地回應對方的感受（共情）
2. 溫柔地反映你聽到的（讓對方感到被理解）
3. 給予一個溫暖的視角或小小的洞察
4. 以鼓勵的話語結尾，讓對方感到被支持`;

      const userPrompt = `求助者目前的心情狀態：${input.moodLabel}（${input.mood}）

他們說：
「${input.text}」

請以「椛」的身份，給予溫柔、有深度的回應。`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawComfort = response.choices?.[0]?.message?.content;
      const comfort = rawComfort
        ? extractTextContent(rawComfort as string | Array<{ type: string; text?: string }>)
        : '椛正在傾聽你的心事，請稍後再試。';

      // 根據心情推薦水晶
      const crystalMap: Record<string, { name: string; reason: string; hz: string }> = {
        anxious: { name: "紫水晶", reason: "淨化焦慮能量，帶來平靜", hz: "432Hz" },
        sad: { name: "月光石", reason: "撫慰悲傷，帶來溫柔的光", hz: "528Hz" },
        lonely: { name: "粉晶", reason: "開啟心輪，吸引溫暖連結", hz: "528Hz" },
        angry: { name: "黑碧璽", reason: "吸收負面能量，保護心靈", hz: "396Hz" },
        confused: { name: "白水晶", reason: "淨化思緒，帶來清明", hz: "432Hz" },
        stressed: { name: "綠幽靈", reason: "釋放壓力，帶來平靜", hz: "396Hz" },
        heartbroken: { name: "粉晶", reason: "療癒情傷，重新愛自己", hz: "528Hz" },
        lost: { name: "青金石", reason: "指引方向，連結內在智慧", hz: "432Hz" },
      };

      const crystal = crystalMap[input.mood] ?? { name: "白水晶", reason: "淨化能量，帶來清明", hz: "432Hz" };

      return { comfort, crystal };
    }),

  /**
   * 呼吸練習指引
   */
  breathingGuide: publicProcedure
    .input(
      z.object({
        mood: z.string(),
        moodLabel: z.string(),
      })
    )
    .query(async ({ input }) => {
      const systemPrompt = `你是一位冥想與呼吸練習引導師，擅長用溫柔的語言引導人們放鬆。`;

      const userPrompt = `請為心情${input.moodLabel}的人，設計一個簡短的呼吸練習指引。

以 JSON 格式回傳：
{
  "title": "練習名稱（4-6個字）",
  "description": "練習說明（1-2句話）",
  "steps": ["步驟1", "步驟2", "步驟3", "步驟4"],
  "duration": "建議時長（如：5分鐘）",
  "affirmation": "練習後的肯定語（1句話）"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "breathing_guide",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                steps: { type: "array", items: { type: "string" } },
                duration: { type: "string" },
                affirmation: { type: "string" },
              },
              required: ["title", "description", "steps", "duration", "affirmation"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const content = rawContent ? extractTextContent(rawContent as string | Array<{ type: string; text?: string }>) : null;
      if (!content) {
        return {
          title: "4-7-8 呼吸法",
          description: "一個簡單有效的放鬆呼吸練習",
          steps: ["吸氣4秒", "屏息7秒", "呼氣8秒", "重複4次"],
          duration: "5分鐘",
          affirmation: "我值得被溫柔對待，包括被自己溫柔對待。",
        };
      }

      try {
        return JSON.parse(content) as {
          title: string;
          description: string;
          steps: string[];
          duration: string;
          affirmation: string;
        };
      } catch {
        return {
          title: "4-7-8 呼吸法",
          description: "一個簡單有效的放鬆呼吸練習",
          steps: ["吸氣4秒", "屏息7秒", "呼氣8秒", "重複4次"],
          duration: "5分鐘",
          affirmation: "我值得被溫柔對待，包括被自己溫柔對待。",
        };
      }
    }),
});
