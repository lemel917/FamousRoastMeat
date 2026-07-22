// 菜單頁（舊瀏覽器相容版）
// 店內螢幕的內建瀏覽器是舊版引擎，不支援 ES module / 頂層 await / 動態 import / ?. / ??，
// 會讓整支程式不執行、菜單空白。因此這裡改用「傳統 <script>」載入，並全面採用 ES5 寫法
// （var、function、字串串接、appendChild），Firebase 改用命名空間版 SDK（見 index.html）。
// 賣完換算 resolveSoldOutIds 與 js/soldout.js 是同一套規則（soldout.js 供 Node 測試用），
// 若要改規則，兩邊都要一起改。
(function () {
  "use strict";

  // ===== 賣完換算（與 js/soldout.js 同規則）=====
  function resolveSoldOutIds(soldOut, ingredients) {
    var result = new Set();
    if (!soldOut) return result;

    // 1) 直接命中的鍵（拼盤/單點品項，或任何被直接設 true 的鍵）
    var key;
    for (key in soldOut) {
      if (Object.prototype.hasOwnProperty.call(soldOut, key) && soldOut[key] === true) {
        result.add(key);
      }
    }
    // 2) 食材展開：食材賣完 → 其連動品項全數賣完
    for (var i = 0; i < ingredients.length; i++) {
      var ing = ingredients[i];
      if (soldOut[ing.id] === true) {
        for (var j = 0; j < ing.items.length; j++) result.add(ing.items[j]);
      }
    }
    return result;
  }

  // ===== 1. 菜單渲染機制 =====
  function renderMenu() {
    var root = document.getElementById("menu-root");

    if (!root) {
      console.error("找不到 #menu-root 節點");
      return;
    }

    try {
      // 檢查 MENU_DATA 是否存在
      if (typeof MENU_DATA === "undefined") {
        throw new Error("MENU_DATA 資料庫未載入，請確認 menu-data.js 檔案是否正常引用");
      }

      root.innerHTML = ""; // 清空舊內容
      root.appendChild(renderCategory(MENU_DATA.bento));
      root.appendChild(renderCategory(MENU_DATA.platter));
    } catch (error) {
      console.error("菜單渲染失敗：", error);

      // 畫面顯示紅色錯誤提示區塊
      root.innerHTML =
        '<div style="color:#d8000c;background-color:#ffd2d2;padding:20px;border:2px solid #d8000c;margin:20px;border-radius:8px;text-align:center;font-family:sans-serif;">' +
        '<h2 style="margin-top:0;">⚠️ 菜單畫面渲染失敗</h2>' +
        "<p>" + error.message + "</p>" +
        "</div>";
    }
  }

  function renderCategory(cat) {
    if (!cat) return document.createElement("section");

    var section = document.createElement("section");
    section.className = "category";

    var head = document.createElement("div");
    head.className = "category-head";
    head.innerHTML = '<h2 class="category-title">' + (cat.title || "") + "</h2>";
    section.appendChild(head);

    // 兩大分類內部都再分左右兩子欄（近乎對半）
    var items = cat.items || [];
    var half = Math.ceil(items.length / 2);
    var groups = [items.slice(0, half), items.slice(half)];

    var lists = document.createElement("div");
    lists.className = "item-lists";

    for (var g = 0; g < groups.length; g++) {
      var group = groups[g];
      var ul = document.createElement("ul");
      ul.className = "item-list";

      if (cat.columns) {
        var cols = document.createElement("li");
        cols.className = "price-cols";
        cols.innerHTML =
          "<span></span><span>" + cat.columns[0] + "</span><span>" + cat.columns[1] + "</span>";
        ul.appendChild(cols);
      }

      for (var k = 0; k < group.length; k++) {
        var item = group[k];
        if (item.sectionBreak) {
          var br = document.createElement("li");
          br.className = "section-break";
          ul.appendChild(br);
        }
        ul.appendChild(renderItem(item, Boolean(cat.columns)));
      }
      lists.appendChild(ul);
    }

    section.appendChild(lists);
    return section;
  }

  function renderItem(item, hasTwoPrices) {
    var li = document.createElement("li");
    li.className = hasTwoPrices ? "item" : "item platter";
    li.setAttribute("data-id", item.id);

    var tag = item.tag
      ? '<span class="tag' +
        (item.tag === "招牌" ? " tag-signature" : "") +
        '">' + item.tag + "</span>"
      : "";
    var note = item.note ? '<span class="note">（' + item.note + "）</span>" : "";
    var prices = hasTwoPrices
      ? '<span class="price">' + item.price + '</span><span class="price">' + item.priceExtra + "</span>"
      : '<span class="price">' + item.price + "</span>";

    li.innerHTML =
      '<span class="item-name">' + item.name + tag + note + "</span>" +
      prices +
      '<span class="stamp">已賣完</span>';

    return li;
  }

  var firstApply = true; // 開頁第一次套用不播蓋章（避免一排章亂蓋）

  // 依 Firebase soldOut 物件換算後，切換每列的 .sold-out；狀態轉為賣完時播蓋章動畫
  function applySoldOut(soldOut) {
    try {
      // 加上 INGREDIENTS 的相容保護，防止全域變數遺失導致整個函數崩潰
      var ingredientsData = typeof INGREDIENTS !== "undefined" ? INGREDIENTS : [];
      var soldSet = resolveSoldOutIds(soldOut, ingredientsData);

      var els = document.querySelectorAll(".item");
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var nowSold = soldSet.has(el.getAttribute("data-id"));
        var wasSold = el.classList.contains("sold-out");
        el.classList.toggle("sold-out", nowSold);

        if (nowSold && !wasSold && !firstApply) {
          el.classList.remove("stamping");
          void el.offsetWidth; // 強制 reflow，讓動畫可重複觸發
          el.classList.add("stamping");
        }
      }
      firstApply = false;
    } catch (error) {
      console.error("套用賣完狀態時發生錯誤：", error);
    }
  }

  // ===== 執行畫面初始渲染 =====
  renderMenu();
  var itemEls = document.querySelectorAll(".item");
  for (var n = 0; n < itemEls.length; n++) {
    itemEls[n].style.setProperty("--i", n);
  }

  // ===== 2. Firebase 即時同步（命名空間版 SDK，相容舊瀏覽器） =====
  // SDK 以 <script> 標籤載入（見 index.html）；就算 CDN 連不上或瀏覽器太舊載不動，
  // 菜單本身仍照常顯示，只在上方留同步提示，不跳 alert 打擾客人。
  var banner = document.getElementById("sync-banner");

  function showSyncError(logMessage) {
    if (banner) {
      banner.textContent = "賣完狀態同步失敗，顯示的供應狀態可能不是最新，請重新整理頁面";
      banner.hidden = false;
    }
    console.error(logMessage);
  }

  try {
    if (typeof firebase === "undefined") {
      throw new Error("Firebase SDK 未載入（螢幕瀏覽器可能不支援或網路異常）");
    }
    if (typeof FIREBASE_CONFIG === "undefined") {
      throw new Error("找不到 FIREBASE_CONFIG，請確認 firebase-config.js 檔案");
    }

    firebase.initializeApp(FIREBASE_CONFIG);
    var db = firebase.database();

    db.ref("soldOut").on(
      "value",
      function (snapshot) {
        if (banner) banner.hidden = true;
        var val = snapshot.val();
        applySoldOut(val ? val : {});
      },
      function (error) {
        showSyncError("Firebase 同步錯誤：" + error.message);
      }
    );
  } catch (error) {
    showSyncError("Firebase SDK 載入/初始化失敗：" + error.message);
  }
})();
