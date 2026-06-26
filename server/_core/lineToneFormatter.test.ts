import { describe, expect, it } from "vitest";
import { formatLineToneForMochi } from "./lineToneFormatter";

describe("formatLineToneForMochi", () => {
  it("adds a clear tone mark to an assertive first content line only", () => {
    expect(formatLineToneForMochi("你其實有機會\n但不是馬上看到結果")).toBe(
      "你其實有機會！\n但不是馬上看到結果"
    );
  });

  it("does not force tone marks every few short lines", () => {
    expect(
      formatLineToneForMochi("對方現在還在觀察你的反應\n他不是完全沒感覺\n只是行動會比較慢😅")
    ).toBe("對方現在還在觀察你的反應\n他不是完全沒感覺\n只是行動會比較慢😅");
  });

  it("softens a long dry run sparingly", () => {
    expect(
      formatLineToneForMochi(
        "對方現在還在觀察你的反應\n他不是完全沒感覺\n只是行動會比較慢\n短期不會突然衝過來"
      )
    ).toBe("對方現在還在觀察你的反應\n他不是完全沒感覺\n只是行動會比較慢\n短期不會突然衝過來～");
  });

  it("keeps lines that already have tone marks unchanged", () => {
    expect(formatLineToneForMochi("是！他有喜歡你\n只是現在還不敢靠近～")).toBe(
      "是！他有喜歡你\n只是現在還不敢靠近～"
    );
  });
});
