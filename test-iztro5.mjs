import pkg from 'iztro';
const { astro, util } = pkg;

// 嘗試 locale 方法
const a = astro.bySolar('1990-05-15', 10, '女', true, 'zh_TW');

// 看看 palace 的 locale 方法
const p = a.palaces[0];
console.log('palace.name:', p.name);

// 嘗試 locale 方法
if (typeof p.locale === 'function') {
  console.log('locale zh_TW:', p.locale('zh_TW'));
}

// 查看 astrolabe 的 locale 方法
console.log('\nastrolabe keys:', Object.keys(a).filter(k => !['palaces', 'rawDates', 'chineseDate'].includes(k)));

// 嘗試 astrolabe.locale
if (typeof a.locale === 'function') {
  const localized = a.locale('zh_TW');
  console.log('localized zodiac:', localized.zodiac);
  console.log('localized sign:', localized.sign);
  console.log('localized palaces[0].name:', localized.palaces[0].name);
  console.log('localized palaces[0].majorStars[0]?.name:', localized.palaces[0].majorStars[0]?.name);
} else {
  console.log('no locale method on astrolabe');
  // 看看 astrolabe 有哪些方法
  console.log('astrolabe methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(a)));
}
