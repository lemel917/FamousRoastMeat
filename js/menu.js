// 菜單頁：先用本地 MENU_DATA 渲染（離線也看得到菜單），賣完狀態由 Firebase 即時套用（Task 4）。

function renderMenu() {
  const root = document.getElementById("menu-root");
  root.append(renderCategory(MENU_DATA.bento), renderCategory(MENU_DATA.platter));
}

function renderCategory(cat) {
  const section = document.createElement("section");
  section.className = "category";

  const head = document.createElement("div");
  head.className = "category-head";
  head.innerHTML =
    `<span class="category-badge">${cat.badge}</span>` +
    `<h2 class="category-title">${cat.title}</h2>`;
  section.append(head);

  // 便當在寬螢幕分成左右兩欄（各自帶「一般｜加肉」欄位標頭），拼盤單欄
  const groups = cat.columns
    ? [cat.items.slice(0, Math.ceil(cat.items.length / 2)), cat.items.slice(Math.ceil(cat.items.length / 2))]
    : [cat.items];

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
    for (const item of group) ul.append(renderItem(item, Boolean(cat.columns)));
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

// 依 Firebase soldOut 物件（如 {b01:true}）切換每列的 .sold-out
function applySoldOut(soldOut) {
  document.querySelectorAll(".item").forEach((el) => {
    el.classList.toggle("sold-out", soldOut[el.dataset.id] === true);
  });
}

renderMenu();

export { renderMenu, applySoldOut };
