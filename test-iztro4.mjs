import pkg from 'iztro';
const { astro, util } = pkg;

// 測試 util 有哪些功能
console.log('util keys:', Object.keys(util));

// 嘗試用 locale 方法
const a = astro.bySolar('1990-05-15', 10, '女', true, 'zh_TW');

// 看看 palace 的原始物件有哪些屬性
const p = a.palaces[0];
console.log('\npalace keys:', Object.keys(p));
console.log('palace.name:', p.name);

// 嘗試 locale 方法
if (typeof p.name === 'object') {
  console.log('name is object:', p.name);
} else {
  // 嘗試用 util 轉換
  if (util.convertToLocalizedData) {
    console.log('has convertToLocalizedData');
  }
  // 嘗試 iztro 的 t 函數
  const star = a.palaces[0].majorStars[0];
  console.log('\nstar keys:', star ? Object.keys(star) : 'no star');
  if (star) {
    console.log('star.name:', star.name);
    // 嘗試 locale 方法
    if (typeof star.name === 'string') {
      // 看看是否有 locale 方法
      console.log('star methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(star)));
    }
  }
}
