import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveSoldOutIds } from "../js/soldout.js";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "../menu-data.js"), "utf8");
const { INGREDIENTS } = new Function(src + "; return { MENU_DATA, INGREDIENTS };")();

test("空狀態不標任何品項", () => {
  assert.equal(resolveSoldOutIds({}, INGREDIENTS).size, 0);
  assert.equal(resolveSoldOutIds(null, INGREDIENTS).size, 0);
});

test("叉燒賣完會標到所有含叉燒的飯類，且不誤標燒鴨飯或拼盤叉燒一份", () => {
  const s = resolveSoldOutIds({ chashao: true }, INGREDIENTS);
  for (const id of ["b01", "b03", "b04", "b05", "b06", "b09", "b16", "b18"]) {
    assert.ok(s.has(id), `應含 ${id}`);
  }
  assert.ok(!s.has("b02"), "不應含 b02 燒鴨飯");
  assert.ok(!s.has("p07"), "食材開關不連動拼盤，不應含 p07 叉燒一份");
});

test("三寶飯(b05)受叉燒/燒鴨/油雞任一影響", () => {
  assert.ok(resolveSoldOutIds({ shaoya: true }, INGREDIENTS).has("b05"));
  assert.ok(resolveSoldOutIds({ youji: true }, INGREDIENTS).has("b05"));
});

test("叉燒恢復但燒鴨仍賣完：三寶飯仍標、叉燒飯恢復", () => {
  const s = resolveSoldOutIds({ shaoya: true }, INGREDIENTS);
  assert.ok(s.has("b05"), "三寶飯仍賣完（燒鴨管到）");
  assert.ok(!s.has("b01"), "叉燒飯恢復（只有叉燒管到）");
});

test("拼盤單品只由自身開關控制，不受食材開關連動", () => {
  // 油雞賣完不應連動油雞腿一隻(p09)；叉燒不連動叉燒一份(p07)；燒肉不連動燒肉一份(p08)
  assert.ok(!resolveSoldOutIds({ youji: true }, INGREDIENTS).has("p09"), "油雞不應連動 p09");
  assert.ok(!resolveSoldOutIds({ chashao: true }, INGREDIENTS).has("p07"), "叉燒不應連動 p07");
  assert.ok(!resolveSoldOutIds({ shaorou: true }, INGREDIENTS).has("p08"), "燒肉不應連動 p08");
  // 但自身開關仍可獨立標賣完
  assert.ok(resolveSoldOutIds({ p09: true }, INGREDIENTS).has("p09"));
  assert.ok(resolveSoldOutIds({ p07: true }, INGREDIENTS).has("p07"));
});

test("臘腸賣完連動 5 項", () => {
  const s = resolveSoldOutIds({ lachang: true }, INGREDIENTS);
  for (const id of ["b12", "b13", "b14", "b15", "b16"]) assert.ok(s.has(id), `應含 ${id}`);
});

test("自選三寶飯 b20 不受任何食材開關影響", () => {
  const all = {};
  for (const ing of INGREDIENTS) all[ing.id] = true;
  assert.ok(!resolveSoldOutIds(all, INGREDIENTS).has("b20"));
});

test("直接品項鍵（紅茶 p12）可獨立標賣完", () => {
  assert.ok(resolveSoldOutIds({ p12: true }, INGREDIENTS).has("p12"));
});

test("值為 false/缺鍵不算賣完", () => {
  assert.equal(resolveSoldOutIds({ chashao: false }, INGREDIENTS).size, 0);
});
