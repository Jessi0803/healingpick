/**
 * fortune router tests
 * Tests the moon phase calculation logic and fortune router structure
 */
import { describe, it, expect } from "vitest";
import { buildFallbackFortune, getDailyFortuneVariant, parseFortuneResult } from "./fortune";

// ─── 月相計算邏輯（從 fortune.ts 複製，以便獨立測試）─────────────────────────
function getMoonPhase(date: Date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const lunarCycle = 29.53058867;
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle;

  let name: string;
  let symbol: string;

  if (phase < 0.0625 || phase >= 0.9375) {
    name = '新月'; symbol = '🌑';
  } else if (phase < 0.1875) {
    name = '眉月'; symbol = '🌒';
  } else if (phase < 0.3125) {
    name = '上弦月'; symbol = '🌓';
  } else if (phase < 0.4375) {
    name = '盈凸月'; symbol = '🌔';
  } else if (phase < 0.5625) {
    name = '滿月'; symbol = '🌕';
  } else if (phase < 0.6875) {
    name = '虧凸月'; symbol = '🌖';
  } else if (phase < 0.8125) {
    name = '下弦月'; symbol = '🌗';
  } else {
    name = '殘月'; symbol = '🌘';
  }

  return { phase, name, symbol };
}

describe("getMoonPhase", () => {
  it("應該在已知新月日期（2000-01-06）回傳新月", () => {
    const newMoonDate = new Date('2000-01-06T18:14:00Z');
    const result = getMoonPhase(newMoonDate);
    expect(result.name).toBe('新月');
    expect(result.symbol).toBe('🌑');
    expect(result.phase).toBeCloseTo(0, 2);
  });

  it("應該在新月後約 14.76 天（滿月）回傳滿月", () => {
    // 2000-01-06 + 14.76 days ≈ 2000-01-21
    const fullMoonDate = new Date('2000-01-21T00:00:00Z');
    const result = getMoonPhase(fullMoonDate);
    expect(result.name).toBe('滿月');
    expect(result.symbol).toBe('🌕');
    expect(result.phase).toBeGreaterThan(0.4375);
    expect(result.phase).toBeLessThan(0.5625);
  });

  it("月相值應在 0-1 之間", () => {
    const dates = [
      new Date('2024-01-01'),
      new Date('2024-06-15'),
      new Date('2024-12-31'),
      new Date('2025-03-20'),
      new Date('2026-05-24'),
    ];
    dates.forEach(date => {
      const result = getMoonPhase(date);
      expect(result.phase).toBeGreaterThanOrEqual(0);
      expect(result.phase).toBeLessThan(1);
    });
  });

  it("應該回傳有效的月相名稱", () => {
    const validNames = ['新月', '眉月', '上弦月', '盈凸月', '滿月', '虧凸月', '下弦月', '殘月'];
    const testDates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date('2024-01-01');
      d.setDate(d.getDate() + i);
      return d;
    });
    testDates.forEach(date => {
      const result = getMoonPhase(date);
      expect(validNames).toContain(result.name);
    });
  });

  it("同一天的月相計算結果應該一致（冪等性）", () => {
    const date = new Date('2026-05-24T12:00:00Z');
    const result1 = getMoonPhase(date);
    const result2 = getMoonPhase(date);
    expect(result1.phase).toBe(result2.phase);
    expect(result1.name).toBe(result2.name);
    expect(result1.symbol).toBe(result2.symbol);
  });

  it("不同日期應該有不同的月相值", () => {
    const date1 = new Date('2026-05-01T12:00:00Z');
    const date2 = new Date('2026-05-15T12:00:00Z');
    const result1 = getMoonPhase(date1);
    const result2 = getMoonPhase(date2);
    expect(result1.phase).not.toBe(result2.phase);
  });
});

describe("parseFortuneResult", () => {
  const validFortune = {
    overall: "今天適合先整理節奏。",
    overallScore: "8",
    love: "感情上不要急著腦補。",
    loveScore: 7,
    career: "工作先收斂最重要的三件事。",
    careerScore: 8,
    health: "早點休息，少硬撐。",
    healthScore: 6,
    luckyColor: "月白色",
    luckyNumber: "18",
    crystal: "月光石",
    crystalReason: "適合陪你整理今天的情緒節奏。",
    advice: "先寫下今天最重要的一件事。",
    moonPhase: "滿月",
    moonSymbol: "🌕",
  };

  it("parses JSON wrapped in a markdown code block", () => {
    const result = parseFortuneResult(`\`\`\`json\n${JSON.stringify(validFortune)}\n\`\`\``);
    expect(result.overallScore).toBe(8);
    expect(result.luckyNumber).toBe(18);
    expect(result.crystal).toBe("月光石");
  });

  it("extracts JSON when the model adds surrounding text", () => {
    const result = parseFortuneResult(`好的，這是今天的運勢：\n${JSON.stringify(validFortune)}\n祝你今天順利。`);
    expect(result.moonPhase).toBe("滿月");
    expect(result.loveScore).toBe(7);
  });
});

describe("buildFallbackFortune", () => {
  const fallbackInput = {
    signName: "雙魚座",
    moonPhase: {
      phase: 0.5,
      name: "滿月",
      nameEn: "Full Moon",
      energy: "滿月能量：適合看清情緒。",
      symbol: "🌕",
    },
    traits: {
      element: "水",
      modality: "變動",
      ruler: "海王星/木星",
      traits: "夢幻、同情心、靈性",
      strengths: "直覺、藝術才能、慈悲",
      challenges: "逃避現實、邊界模糊",
    },
  };

  it("returns a complete fortune result when the LLM is unavailable", () => {
    const result = buildFallbackFortune({
      ...fallbackInput,
      date: "2026-05-30",
    });

    expect(result.overall).toContain("雙魚座");
    expect(result.moonPhase).toBe("滿月");
    expect(result.moonSymbol).toBe("🌕");
    expect(result.crystal.length).toBeGreaterThan(0);
    expect(result.crystalReason).toContain(result.crystal);
    expect(result.overallScore).toBeGreaterThanOrEqual(1);
    expect(result.luckyNumber).toBeGreaterThanOrEqual(1);
  });

  it("varies fallback wording by date", () => {
    const first = buildFallbackFortune({
      ...fallbackInput,
      date: "2026-05-30",
    });
    const second = buildFallbackFortune({
      ...fallbackInput,
      date: "2026-05-31",
    });

    expect([
      first.overall,
      first.love,
      first.career,
      first.health,
      first.advice,
    ]).not.toEqual([
      second.overall,
      second.love,
      second.career,
      second.health,
      second.advice,
    ]);
  });

  it("can vary fallback wording with different daily variants", () => {
    const first = buildFallbackFortune({
      ...fallbackInput,
      date: "2026-05-30",
      variant: getDailyFortuneVariant("2026-05-30", "pisces"),
    });
    const second = buildFallbackFortune({
      ...fallbackInput,
      date: "2026-05-30",
      variant: getDailyFortuneVariant("2026-05-30", "aries"),
    });

    expect(first.overall).not.toBe(second.overall);
    expect(first.advice).not.toBe(second.advice);
  });
});

describe("getDailyFortuneVariant", () => {
  it("returns the same daily variant for the same date and sign", () => {
    const first = getDailyFortuneVariant("2026-07-07", "pisces");
    const second = getDailyFortuneVariant("2026-07-07", "pisces");

    expect(first).toEqual(second);
  });

  it("varies the daily material by date", () => {
    const first = getDailyFortuneVariant("2026-07-07", "pisces");
    const second = getDailyFortuneVariant("2026-07-08", "pisces");

    expect([
      first.theme,
      first.loveScene,
      first.workScene,
      first.bodySignal,
      first.luckyColor,
      first.crystal,
    ]).not.toEqual([
      second.theme,
      second.loveScene,
      second.workScene,
      second.bodySignal,
      second.luckyColor,
      second.crystal,
    ]);
  });

  it("varies the daily material by sign on the same date", () => {
    const first = getDailyFortuneVariant("2026-07-11", "pisces");
    const second = getDailyFortuneVariant("2026-07-11", "aries");

    expect([
      first.theme,
      first.loveScene,
      first.workScene,
      first.bodySignal,
      first.luckyColor,
      first.crystal,
    ]).not.toEqual([
      second.theme,
      second.loveScene,
      second.workScene,
      second.bodySignal,
      second.luckyColor,
      second.crystal,
    ]);
  });
});
