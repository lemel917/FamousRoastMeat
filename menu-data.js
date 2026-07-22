// 菜單資料：要改菜單（品名/價格/標籤）就改這個檔案，改完 push 上 GitHub 即生效。
// id 是品項的固定編號，Firebase 的賣完狀態靠它對應，「不要」更動既有 id。
var MENU_DATA = {
  bento: {
    title: "飯類主餐",
    columns: ["一般", "加肉"],
    items: [
      { id: "b01", name: "叉燒飯", price: 130, priceExtra: 190, tag: "人氣" },
      { id: "b02", name: "燒鴨飯", price: 135, priceExtra: 195 },
      { id: "b03", name: "叉鴨飯", price: 135, priceExtra: 195 },
      { id: "b04", name: "叉雞飯", price: 135, priceExtra: 195 },
      { id: "b05", name: "三寶飯", price: 135, priceExtra: 195, tag: "人氣" },
      { id: "b06", name: "三燒飯", price: 135, priceExtra: 195 },
      { id: "b20", name: "自選三寶飯", price: 135, priceExtra: 195 },
      { id: "b07", name: "雞鴨飯", price: 135, priceExtra: 195 },
      { id: "b08", name: "燒肉飯", price: 135, priceExtra: 195 },
      { id: "b09", name: "燒肉叉燒飯", price: 135, priceExtra: 195 },
      { id: "b10", name: "燒肉雞飯", price: 135, priceExtra: 195 },
      { id: "b11", name: "燒肉鴨飯", price: 135, priceExtra: 195 },
      { id: "b12", name: "燒肉臘腸飯", price: 135, priceExtra: 195 },
      { id: "b13", name: "臘味飯", price: 135, priceExtra: 195 },
      { id: "b14", name: "臘腸鴨飯", price: 135, priceExtra: 195 },
      { id: "b15", name: "臘腸雞飯", price: 135, priceExtra: 195 },
      { id: "b16", name: "臘腸叉燒飯", price: 135, priceExtra: 195 },
      { id: "b17", name: "油雞腿飯", price: 140, priceExtra: 200 },
      { id: "b18", name: "招牌飯", price: 170, priceExtra: 230, tag: "招牌" },
      { id: "b19", name: "鴨腿飯", price: 170, priceExtra: 230 },
    ],
  },
  platter: {
    title: "燒臘拼盤與單點",
    items: [
      { id: "p01", name: "美味雙拼", price: 280, tag: "人氣" },
      { id: "p02", name: "美味三拼", price: 380, note: "三人份" },
      { id: "p03", name: "美味四拼", price: 480, note: "四人份" },
      { id: "p04", name: "燒鴨 1/4隻", price: 350, note: "三人份" },
      { id: "p05", name: "燒鴨 半隻", price: 700, note: "六人份" },
      { id: "p06", name: "燒鴨 一隻", price: 1400, note: "十二人份" },
      { id: "p07", name: "叉燒 一份", price: 350, note: "三人份" },
      { id: "p08", name: "燒肉 一份", price: 350, note: "三人份" },
      { id: "p09", name: "油雞腿 一隻", price: 110 },
      { id: "p10", name: "鴨腿 一隻", price: 140 },
      { id: "p11", name: "滷蛋 一顆", price: 15 },
      { id: "p12", name: "優選二號紅茶", price: 40, sectionBreak: true },
      { id: "p13", name: "每日例湯", price: 40 },
    ],
  },
};

// 食材開關 → 連動品項對照表（賣完換算的單一事實來源）。
// 任一食材賣完，其 items 內所有品項都標賣完；b20 自選三寶飯不屬任何食材，永遠供應。
// 食材開關只管「飯類主餐」；拼盤與單點（含叉燒一份/燒肉一份/油雞腿一隻）一律由拼盤區自己的開關控制，不連動。
var INGREDIENTS = [
  { id: "chashao", name: "叉燒", items: ["b01", "b03", "b04", "b05", "b06", "b09", "b16", "b18"] },
  { id: "shaorou", name: "燒肉", items: ["b06", "b08", "b09", "b10", "b11", "b12"] },
  { id: "shaoya", name: "燒鴨", items: ["b02", "b03", "b05", "b06", "b07", "b11", "b14", "b18"] },
  { id: "youji", name: "油雞", items: ["b04", "b05", "b07", "b10", "b15", "b17", "b18"] },
  { id: "yatui", name: "鴨腿飯", items: ["b19"] },
  { id: "lachang", name: "臘腸", items: ["b12", "b13", "b14", "b15", "b16"] },
];
