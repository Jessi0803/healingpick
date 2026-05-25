import pkg from 'iztro';
const { data } = pkg;

// LANGUAGES 有哪些
console.log('LANGUAGES:', JSON.stringify(data.LANGUAGES));

// PALACES 的值
console.log('\nPALACES[0]:', JSON.stringify(data.PALACES[0]));
console.log('PALACES[1]:', JSON.stringify(data.PALACES[1]));

// ZODIAC 的值
console.log('\nZODIAC[0]:', JSON.stringify(data.ZODIAC[0]));

// HEAVENLY_STEMS 的值
console.log('\nHEAVENLY_STEMS[0]:', JSON.stringify(data.HEAVENLY_STEMS[0]));

// STARS_INFO 的值
console.log('\nSTARS_INFO keys:', Object.keys(data.STARS_INFO).slice(0, 5));
const firstStar = Object.values(data.STARS_INFO)[0];
console.log('first star:', JSON.stringify(firstStar));
