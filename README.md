# 名門燒臘電子菜單

兩頁式靜態網站，部署於 GitHub Pages，賣完狀態透過 Firebase Realtime Database 即時同步。

- **菜單頁**：`index.html` — 給客人看，賣完品項自動變灰並蓋「已賣完」章
- **後台頁**：`admin.html` — 老闆登入後切換各品項「供應中／已賣完」

## 常見維護

| 要做什麼 | 改哪裡 |
|---|---|
| 改品名 / 價格 / 標籤 | `menu-data.js`（改完 push 即生效，不要動 id） |
| 改後台帳密 | `js/admin.js` 最上方 `ADMIN_USER` / `ADMIN_PASS` |
| 換 Firebase 專案 | `js/firebase-config.js` |

## 本機開發

    python -m http.server 8000

開 http://localhost:8000/ 與 http://localhost:8000/admin.html （ES Modules 不能用 file:// 直接開檔）。

## 已知限制

後台帳密為前端檢查、資料庫 `soldOut` 開放寫入——僅防路人誤入，非資安防護（詳見 `docs/superpowers/specs/`）。
