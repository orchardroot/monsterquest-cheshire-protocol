"use strict";
// ui-a: MQ.UI.Theme — the shared look and feel for every menu screen.
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  const Theme = MQ.UI.Theme;
  const ctx = env.screen.getContext("2d");

  t("Theme publishes on MQ.UI and carries a palette", function () {
    assert.ok(Theme, "MQ.UI.Theme exists");
    assert.ok(Theme.C.brass && Theme.C.text && Theme.C.bad);
    assert.strictEqual(typeof Theme.panel, "function");
    assert.strictEqual(typeof Theme.header, "function");
    assert.strictEqual(typeof Theme.footer, "function");
  });

  t("metrics derive from MQ.View, never a literal 960", function () {
    const m = Theme.m();
    assert.strictEqual(m.w, MQ.View.w);
    assert.strictEqual(m.h, MQ.View.h);
    assert.ok(m.r <= m.w && m.l >= 0 && m.b <= m.h);
    assert.ok(m.cw > 0 && m.ch > 0);
    // same object reused: no per-frame allocation
    assert.strictEqual(Theme.m(), m);
  });

  t("button glyphs follow MQ.Input.lastSource", function () {
    MQ.Input.lastSource = "key";
    assert.strictEqual(Theme.glyph("a"), "Z");
    assert.strictEqual(Theme.glyph("b"), "X");
    MQ.Input.lastSource = "pad";
    assert.strictEqual(Theme.glyph("a"), "A");
    assert.strictEqual(Theme.glyph("start"), "START");
    MQ.Input.lastSource = "touch";
    assert.strictEqual(Theme.glyph("start"), "MENU");
    MQ.Input.lastSource = "key";
  });

  t("header, footer, panels, grin and chips draw without throwing", function () {
    const before = ctx.calls.length;
    Theme.backdrop(ctx, {});
    const hh = Theme.header(ctx, { title: "Party", sub: "six of them", icon: "heart", right: "1,200cr" });
    assert.ok(hh > 20);
    Theme.panel(ctx, 10, 10, 200, 100, { title: "Notes", accent: Theme.C.brass });
    Theme.grin(ctx, 400, 200, 220, { alpha: 0.5 });
    Theme.typeChip(ctx, "cyber", 10, 10);
    Theme.statusChip(ctx, "par", 60, 10);
    Theme.hpBar(ctx, 10, 40, 100, 8, 12, 40);
    const fh = Theme.footer(ctx, [{ btn: "a", label: "Select" }, { btn: "b", label: "Back" }]);
    assert.ok(fh > 10);
    assert.ok(ctx.calls.length > before, "something was drawn");
  });

  t("hpColour changes band with the ratio", function () {
    assert.strictEqual(Theme.hpColour(0.9), Theme.C.hpHigh);
    assert.strictEqual(Theme.hpColour(0.35), Theme.C.hpMid);
    assert.strictEqual(Theme.hpColour(0.05), Theme.C.hpLow);
  });

  t("Theme.list records hit rects so taps reach rows", function () {
    const st = MQ.UI.menuState(["one", "two", "three"], {});
    Theme.list(st, ctx, { x: 20, y: 60, w: 300, h: 200, rowH: 40, gap: 4 });
    assert.strictEqual(st.rects.length >= 3, true);
    assert.ok(st.rects[0].on);
    assert.strictEqual(st.rects[0].x, 20);
    assert.strictEqual(st.rects[1].y, 60 + 44);
    assert.ok(st.visible >= 3);
  });

  t("a long list scrolls and keeps the cursor visible", function () {
    const items = [];
    for (let i = 0; i < 40; i++) items.push("row " + i);
    const st = MQ.UI.menuState(items, {});
    st.setCursor(30);
    Theme.list(st, ctx, { x: 0, y: 0, w: 200, h: 120, rowH: 40, gap: 0 });
    assert.ok(st.scroll > 0, "scrolled to follow the cursor");
    assert.ok(st.rects[30] && st.rects[30].on, "cursor row is on screen");
  });

  t("tab strip reports the tapped tab", function () {
    Theme.tabStrip(ctx, ["A", "B", "C"], 0, { x: 0, y: 0, w: 300, h: 30 });
    assert.strictEqual(Theme.tabTapped(), -1, "no tap, no tab");
  });

  t("formatters are British and terse", function () {
    assert.strictEqual(Theme.playtime(3600000 + 5 * 60000), "1h 05m");
    assert.strictEqual(Theme.titleCase("alderley_edge"), "Alderley edge");
    assert.ok(Theme.money(1200).indexOf("cr") > 0);
  });

  t("sfx and music degrade quietly with no audio team", function () {
    Theme.sfx("ui_select");
    Theme.music("title");
    Theme.buzz(5);
    assert.ok(true);
  });
};
