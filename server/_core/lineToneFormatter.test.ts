import { describe, expect, it } from "vitest";
import { formatLineToneForMochi } from "./lineToneFormatter";

describe("formatLineToneForMochi", () => {
  it("adds a clear tone mark to the first content line", () => {
    expect(formatLineToneForMochi("你其實有機會\n但不是馬上看到結果")).toBe(
      "你其實有機會！\n但不是馬上看到結果～"
    );
  });

  it("softens dry consecutive lines without changing existing emoji lines", () => {
    expect(
      formatLineToneForMochi("對方現在還在觀察你的反應\n他不是完全沒感覺\n只是行動會比較慢😅")
    ).toBe("對方現在還在觀察你的反應！\n他不是完全沒感覺～\n只是行動會比較慢😅");
  });

  it("keeps lines that already have tone marks unchanged", () => {
    expect(formatLineToneForMochi("是！他有喜歡你\n只是現在還不敢靠近～")).toBe(
      "是！他有喜歡你\n只是現在還不敢靠近～"
    );
  });
});
