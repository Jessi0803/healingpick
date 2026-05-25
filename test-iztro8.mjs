import pkg from 'iztro';
const { data, util } = pkg;

// 找到 zh-TW 的翻譯
// 嘗試找 locale 資料夾
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 嘗試直接讀取 iztro 的 locale 檔案
try {
  const locale = require('iztro/lib/i18n/zh_TW.json');
  console.log('zh_TW locale keys:', Object.keys(locale).slice(0, 20));
  console.log('palaces:', locale.palaces || locale.PALACES);
  console.log('zodiac:', locale.zodiac || locale.ZODIAC);
} catch(e) {
  console.log('no zh_TW.json:', e.message);
}

// 嘗試其他路徑
try {
  const locale = require('iztro/lib/i18n/zh-TW.json');
  console.log('zh-TW locale:', Object.keys(locale).slice(0, 10));
} catch(e) {
  console.log('no zh-TW.json:', e.message);
}

// 查看 iztro 的 node_modules 結構
import { readdirSync } from 'fs';
try {
  const files = readdirSync('/home/ubuntu/soul-ease/node_modules/iztro/lib');
  console.log('\niztro/lib files:', files);
} catch(e) {
  console.log('error:', e.message);
}
