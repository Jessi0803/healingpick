import pkg from 'iztro';
const { data } = pkg;

// 查看 data 有哪些
console.log('data keys:', Object.keys(data));

// 嘗試找到翻譯對照
if (data.zh_TW) {
  console.log('zh_TW keys:', Object.keys(data.zh_TW).slice(0, 20));
}
if (data.locale) {
  console.log('locale keys:', Object.keys(data.locale).slice(0, 20));
}

// 直接看 data 的結構
const dataKeys = Object.keys(data);
for (const k of dataKeys.slice(0, 5)) {
  console.log(`\ndata.${k}:`, typeof data[k] === 'object' ? Object.keys(data[k]).slice(0, 10) : data[k]);
}
