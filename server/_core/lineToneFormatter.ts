const TONE_MARKS = /[～！!?？~]|\p{Extended_Pictographic}/u;
const SENTENCE_ENDING = /[。！？!?～~…]$/u;
const NUMBERED_LINE = /^\d+[.、]/u;

const ASSERTIVE_PATTERN = /(是|有機會|適合|不適合|偏|會|不會|可以|不可以|值得|不值得|能|不能|要|不要|先|記得|注意|停|放掉|選|等|看清楚)/u;
const SOFT_PATTERN = /(但|只是|其實|比較像|有點|慢慢|暫時|目前|現在|不是|如果|可能|容易|心裡|卡|怕|拉扯|觀察|還在)/u;

function stripTrailingSentenceEnding(line: string) {
  return line.replace(/[。！？!?～~]+$/u, "");
}

function appendMark(line: string, mark: "！" | "～") {
  const trimmed = line.trimEnd();
  if (!trimmed || TONE_MARKS.test(trimmed)) return line;
  return `${stripTrailingSentenceEnding(trimmed)}${mark}`;
}

function chooseMark(line: string, isFirstContentLine: boolean): "！" | "～" {
  if (isFirstContentLine) return "！";
  if (SOFT_PATTERN.test(line)) return "～";
  if (ASSERTIVE_PATTERN.test(line)) return "！";
  return "～";
}

export function formatLineToneForMochi(content: string) {
  const lines = content.split("\n");
  let contentLineIndex = 0;
  let dryLineStreak = 0;
  let addedBang = 0;
  let addedWave = 0;
  const maxBang = 7;
  const maxWave = 7;

  const formatted = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      dryLineStreak = 0;
      return line;
    }

    contentLineIndex += 1;

    if (TONE_MARKS.test(trimmed)) {
      dryLineStreak = 0;
      return line;
    }

    dryLineStreak += 1;
    const isFirstContentLine = contentLineIndex === 1;
    const shouldAdd =
      isFirstContentLine ||
      dryLineStreak >= 2 ||
      (contentLineIndex <= 5 && ASSERTIVE_PATTERN.test(trimmed)) ||
      (contentLineIndex <= 5 && SOFT_PATTERN.test(trimmed)) ||
      NUMBERED_LINE.test(trimmed);

    if (!shouldAdd) return line;

    let mark = chooseMark(trimmed, isFirstContentLine);
    if (mark === "！" && addedBang >= maxBang) mark = "～";
    if (mark === "～" && addedWave >= maxWave) mark = "！";
    if (mark === "！" && addedBang >= maxBang) return line;
    if (mark === "～" && addedWave >= maxWave) return line;

    const nextLine = appendMark(line, mark);
    if (nextLine !== line) {
      dryLineStreak = 0;
      if (mark === "！") addedBang += 1;
      else addedWave += 1;
    }
    return nextLine;
  });

  return formatted
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}
