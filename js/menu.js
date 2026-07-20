// 菜單頁：先用本地 MENU_DATA 渲染（離線也看得到菜單），賣完狀態由 Firebase 即時套用（Task 4）。
import { resolveSoldOutIds } from "./soldout.js";

// ===== 1. 菜單渲染機制 =====
function renderMenu() {
  const root = document.getElementById("menu-root");

  if (!root) {
    console.error("找不到 #menu-root 節點");
    alert("⚠️ 錯誤：找不到 #menu-root 節點");
    return;
  }

  try {
    // 檢查 MENU_DATA 是否存在
    if (typeof MENU_DATA === "undefined") {
      throw new Error("MENU_DATA 資料庫未載入，請確認 menu-data.js 檔案是否正常引用");
    }

    root.innerHTML = ""; // 清空舊內容
    root.append(renderCategory(MENU_DATA.bento), renderCategory(MENU_DATA.platter));
  } catch (error) {
    console.error("菜單渲染失敗：", error);
    alert("菜單渲染失敗：\n" + error.message);

    // 畫面顯示紅色錯誤提示區塊
    root.innerHTML = `
      <div style="color: #d8000c; background-color: #ffd2d2; padding: 20px; border: 2px solid #d8000c; margin: 20px; border-radius: 8px; text-align: center; font-family: sans-serif;">
        <h2 style="margin-top: 0;">⚠️ 菜單畫面渲染失敗</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderCategory(cat) {
  if (!cat) return document.createElement("section");

  const section = document.createElement("section");
  section.className = "category";

  const head = document.createElement("div");
  head.className = "category-head";
  head.innerHTML = `<h2 class="category-title">${cat.title || ""}</h2>`;
  section.append(head);

  // 兩大分類內部都再分左右兩子欄（近乎對半）
  const items = cat.items || [];
  const half = Math.ceil(items.length / 2);
  const groups = [items.slice(0, half), items.slice(half)];

  const lists = document.createElement("div");
  lists.className = "item-lists";

  for (const group of groups) {
    const ul = document.createElement("ul");
    ul.className = "item-list";

    if (cat.columns) {
      const cols = document.createElement("li");
      cols.className = "price-cols";
      cols.innerHTML = `<span></span><span>${cat.columns[0]}</span><span>${cat.columns[1]}</span>`;
      ul.append(cols);
    }

    for (const item of group) {
      if (item.sectionBreak) {
        const br = document.createElement("li");
        br.className = "section-break";
        ul.append(br);
      }
      ul.append(renderItem(item, Boolean(cat.columns)));
    }
    lists.append(ul);
  }

  section.append(lists);
  return section;
}

function renderItem(item, hasTwoPrices) {
  const li = document.createElement("li");
  li.className = hasTwoPrices ? "item" : "item platter";
  li.dataset.id = item.id;

  const tag = item.tag
    ? `<span class="tag${item.tag === "招牌" ? " tag-signature" : ""}">${item.tag}</span>`
    : "";
  const note = item.note ? `<span class="note">（${item.note}）</span>` : "";
  const prices = hasTwoPrices
    ? `<span class="price">${item.price}</span><span class="price">${item.priceExtra}</span>`
    : `<span class="price">${item.price}</span>`;

  li.innerHTML =
    `<span class="item-name">${item.name}${tag}${note}</span>` +
    prices +
    `<span class="stamp">已賣完</span>`;

  return li;
}

let firstApply = true; // 開頁第一次套用不播蓋章（避免一排章亂蓋）

// 依 Firebase soldOut 物件換算後，切換每列的 .sold-out；狀態轉為賣完時播蓋章動畫
function applySoldOut(soldOut) {
  try {
    // 加上 INGREDIENTS 的相容保護，防止全域變數遺失導致整個函數崩潰
    const ingredientsData = typeof INGREDIENTS !== "undefined" ? INGREDIENTS : {};
    const soldSet = resolveSoldOutIds(soldOut, ingredientsData);

    document.querySelectorAll(".item").forEach((el) => {
      const nowSold = soldSet.has(el.dataset.id);
      const wasSold = el.classList.contains("sold-out");
      el.classList.toggle("sold-out", nowSold);

      if (nowSold && !wasSold && !firstApply) {
        el.classList.remove("stamping");
        void el.offsetWidth; // 強制 reflow，讓動畫可重複觸發
        el.classList.add("stamping");
      }
    });
    firstApply = false;
  } catch (error) {
    console.error("套用賣完狀態時發生錯誤：", error);
    alert("套用賣完狀態時發生錯誤：\n" + error.message);
  }
}

// ===== 執行畫面初始渲染 =====
renderMenu();
document.querySelectorAll(".item").forEach((el, i) => el.style.setProperty("--i", i));

// ===== 2. Firebase 即時同步（頂層 await 寫法） =====
// SDK 以動態載入：就算 CDN 連不上，菜單本身仍照常顯示，只留同步提示。
const banner = document.getElementById("sync-banner");

try {
  if (typeof FIREBASE_CONFIG === "undefined") {
    throw new Error("找不到 FIREBASE_CONFIG，請確認 firebase-config.js 檔案");
  }

  const [{ initializeApp }, { getDatabase, ref, onValue }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js"),
  ]);

  const app = initializeApp(FIREBASE_CONFIG);
  const db = getDatabase(app);

  onValue(
    ref(db, "soldOut"),
    (snapshot) => {
      if (banner) banner.hidden = true;
      applySoldOut(snapshot.val() ?? {});
    },
    (error) => {
      if (banner) {
        banner.textContent = "賣完狀態同步失敗，顯示的供應狀態可能不是最新，請重新整理頁面";
        banner.hidden = false;
      }
      console.error("Firebase 同步錯誤：", error);
      alert("Firebase 同步錯誤：\n" + error.message);
    }
  );
} catch (error) {
  if (banner) {
    banner.textContent = "賣完狀態同步失敗，顯示的供應狀態可能不是最新，請重新整理頁面";
    banner.hidden = false;
  }
  console.error("Firebase SDK 載入失敗：", error);
  alert("Firebase SDK 載入失敗：\n" + error.message);
}

export { renderMenu, applySoldOut };