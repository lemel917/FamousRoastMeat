// ★★ 後台帳密：直接改下面兩行。 ★★
// 已知限制（需求方知情接受）：這是前端檢查，公開 repo 看得到原始碼，僅防路人誤入。
const ADMIN_USER = "admin";
const ADMIN_PASS = "mingmen2026";
const LOGIN_KEY = "mingmen-admin-login";

// ===== 登入 =====
const loginView = document.getElementById("login-view");
const adminView = document.getElementById("admin-view");
const banner = document.getElementById("sync-banner");

function setLoggedIn(loggedIn) {
  loginView.hidden = loggedIn;
  adminView.hidden = !loggedIn;
  banner.hidden = !loggedIn || bannerDismissed;
}
let bannerDismissed = false;

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok =
    document.getElementById("login-user").value === ADMIN_USER &&
    document.getElementById("login-pass").value === ADMIN_PASS;
  document.getElementById("login-error").hidden = ok;
  if (ok) {
    localStorage.setItem(LOGIN_KEY, "1");
    setLoggedIn(true);
  }
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem(LOGIN_KEY);
  setLoggedIn(false);
});

// ===== 品項清單 =====
const toggles = new Map(); // id -> checkbox element

function renderItems() {
  const rootEl = document.getElementById("admin-root");
  for (const cat of [MENU_DATA.bento, MENU_DATA.platter]) {
    const h2 = document.createElement("h2");
    h2.className = "admin-cat";
    h2.textContent = cat.title;
    const list = document.createElement("ul");
    list.className = "admin-list";
    for (const item of cat.items) {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="admin-name">${item.name}</span>` +
        `<label class="switch">` +
        `<input type="checkbox" data-id="${item.id}">` +
        `<span class="slider"></span>` +
        `<span class="state"></span>` +
        `</label>`;
      const input = li.querySelector("input");
      toggles.set(item.id, input);
      input.addEventListener("change", () => saveToggle(item.id, input));
      list.append(li);
    }
    rootEl.append(h2, list);
  }
}

function saveToggle(id, input) {
  if (!db) {
    input.checked = !input.checked; // 尚未連上同步服務：開關彈回
    alert("儲存失敗，尚未連上同步服務，請重新整理頁面");
    return;
  }
  const target = ref(db, "soldOut/" + id);
  const action = input.checked ? set(target, true) : remove(target);
  action.catch((err) => {
    input.checked = !input.checked; // 寫入失敗：開關彈回
    alert("儲存失敗，請再試一次\n" + err.message);
  });
}

document.getElementById("restore-all").addEventListener("click", () => {
  if (confirm("確定要把全部品項恢復為「供應中」嗎？")) {
    if (!soldOutRef) {
      alert("操作失敗，尚未連上同步服務，請重新整理頁面");
      return;
    }
    remove(soldOutRef).catch((err) => alert("操作失敗\n" + err.message));
  }
});

// ===== 啟動 =====
// 品項清單與登入狀態一律先渲染：就算 CDN 連不上，後台畫面仍照常顯示，只留同步提示。
renderItems();
setLoggedIn(localStorage.getItem(LOGIN_KEY) === "1");

// ===== Firebase 即時同步 =====
// SDK 以動態載入：就算 CDN 連不上，登入與品項清單仍照常顯示，只留同步提示。
let db, soldOutRef, ref, onValue, set, remove;

try {
  const [appModule, dbModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js"),
  ]);
  ({ ref, onValue, set, remove } = dbModule);
  const app = appModule.initializeApp(FIREBASE_CONFIG);
  db = dbModule.getDatabase(app);
  soldOutRef = ref(db, "soldOut");

  // 開關狀態一律以 onValue 快照為準：寫入成功會回推、多裝置同開後台也會同步
  onValue(
    soldOutRef,
    (snap) => {
      bannerDismissed = true;
      banner.hidden = true;
      const soldOut = snap.val() ?? {};
      for (const [id, input] of toggles) input.checked = soldOut[id] === true;
    },
    (error) => {
      banner.textContent = "賣完狀態同步失敗，開關顯示可能不是最新，請重新整理頁面";
      bannerDismissed = false;
      banner.hidden = adminView.hidden;
      console.error("Firebase 同步錯誤：", error);
    }
  );
} catch (error) {
  bannerDismissed = false;
  banner.textContent = "賣完狀態同步失敗，開關顯示可能不是最新，請重新整理頁面";
  banner.hidden = adminView.hidden;
  console.error("Firebase SDK 載入失敗：", error);
}
