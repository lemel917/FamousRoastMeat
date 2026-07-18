// 賣完換算：把「開關」層級的賣完狀態，換算成「品項」層級的賣完集合。
// 純函式、無 DOM、無全域相依 —— 瀏覽器（menu.js）與 Node 測試共用。
// 規則：品項賣完 = 管到它的任一食材開關賣完 OR soldOut[品項id] 存在。
export function resolveSoldOutIds(soldOut, ingredients) {
  const result = new Set();
  if (!soldOut) return result;

  // 1) 直接命中的鍵（拼盤/單點品項，或任何被直接設 true 的鍵）
  for (const key of Object.keys(soldOut)) {
    if (soldOut[key] === true) result.add(key);
  }
  // 2) 食材展開：食材賣完 → 其連動品項全數賣完
  for (const ing of ingredients) {
    if (soldOut[ing.id] === true) {
      for (const itemId of ing.items) result.add(itemId);
    }
  }
  return result;
}
