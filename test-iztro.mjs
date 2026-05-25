import { astro } from 'iztro';

const a = astro.bySolar('1990-05-15', 10, '女', true, 'zh_TW');
console.log('zodiac:', a.zodiac);
console.log('sign:', a.sign);
console.log('fiveElementsClass:', a.fiveElementsClass);
console.log('earthlyBranchOfSoulPalace:', a.earthlyBranchOfSoulPalace);
console.log('palaces[0].name:', a.palaces[0].name);
console.log('palaces[0].majorStars[0]?.name:', a.palaces[0].majorStars[0]?.name);
console.log('palaces[0].majorStars[0]?.brightness:', a.palaces[0].majorStars[0]?.brightness);
