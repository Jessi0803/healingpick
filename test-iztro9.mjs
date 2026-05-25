import pkg from 'iztro';
const { astro } = pkg;

const a = astro.bySolar('1990-05-15', 10, '女', true, 'zh_TW');
console.log('soul:', a.soul);
console.log('body:', a.body);
console.log('time:', a.time);
console.log('timeRange:', a.timeRange);
console.log('lunarDate:', a.lunarDate);
console.log('chineseDate:', a.chineseDate);

// 看看 palaces 的 changsheng12 值
a.palaces.forEach((p, i) => {
  if (p.changsheng12) {
    console.log(`palace[${i}] ${p.name} changsheng12:`, p.changsheng12);
  }
});

// 看看 stage 的 heavenlyStem
const p0 = a.palaces[0];
console.log('\npalace[0] stage:', p0.stage);
