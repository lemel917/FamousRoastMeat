# 名門燒臘電子菜單

兩頁式靜態網站，部署於 GitHub Pages，賣完狀態透過 Firebase Realtime Database 即時同步。

- **菜單頁**：`index.html` — 給客人看，賣完品項自動變灰並蓋「已賣完」章，含進場與蓋章微動效
- **後台頁**：`admin.html` — 老闆登入後切換供應狀態

## 開關模型

後台共 19 個開關：

- **飯類主餐**：6 個「食材」開關（叉燒、燒肉、燒鴨、油雞、鴨腿飯、臘腸）。任一食材賣完，含該食材的所有飯類品項都會標「賣完」。自選三寶飯不受開關影響，永遠供應。
- **燒臘拼盤與單點**：13 個品項各自一個開關。叉燒/燒肉/油雞的拼盤單品同時受對應食材開關連動（雙重控制）。

食材與品項的對照表在 `menu-data.js` 的 `INGREDIENTS`，賣完換算邏輯在 `js/soldout.js`。

## 常見維護

| 要做什麼 | 改哪裡 |
|---|---|
| 改品名 / 價格 / 徽章 | `menu-data.js` 的 `MENU_DATA`（不要動既有 id） |
| 改食材連動哪些品項 | `menu-data.js` 的 `INGREDIENTS` |
| 改後台帳密 | `js/admin.js` 最上方 `ADMIN_USER` / `ADMIN_PASS` |
| 換 Firebase 專案 | `js/firebase-config.js` |

## 本機開發與測試

    npx http-server -p 8000

開 http://localhost:8000/ 與 http://localhost:8000/admin.html （ES Modules 不能用 file:// 直接開檔）。

換算邏輯單元測試：

    node --test test/soldout.test.mjs

## 部署

push 上 GitHub 後，GitHub Pages 會自動更新。**首次改版部署後**，到後台按一次「全部恢復供應」清掉舊版（品項層級）的賣完資料即可，殘留舊鍵對新版無害。

## 已知限制

後台帳密為前端檢查、資料庫 `soldOut` 開放寫入——僅防路人誤入，非資安防護（詳見 `docs/superpowers/specs/`）。
