// MonsterQuest v2 — the device-matrix layout maths.
// A logical pixel is not a fixed physical size: on a 19.5:9 phone it draws at
// 0.73 CSS px, on a 1280x800 tablet at 1.2. MQ.View.tokens() is the one place
// that knows how to turn "comfortable" into logical px on either, and
// MQ.Text/MQ.UI/MQ.UI.Theme all measure off it.
"use strict";
const H = require("../headless");

// The three screens this build is actually played on, as CSS px + DPR.
const DEVICES = {
  phone:   { W: 851, H: 393, dpr: 2.75 },     // Pixel 4a, landscape
  phonep:  { W: 393, H: 851, dpr: 2.75 },     // …and portrait
  fire:    { W: 1280, H: 800, dpr: 1 },       // Amazon Fire tablet
  desktop: { W: 1600, H: 900, dpr: 1 }
};

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const V = MQ.View, T = MQ.Text;

  function tokensFor(name, uiScale) {
    const d = DEVICES[name];
    const c = V.compute(d.W, d.H, d.dpr);
    return V.tokens(c.S, uiScale === undefined ? V.suggestUiScale(c.S) : uiScale, c.h);
  }

  t("the three target screens land on the logical sizes the UI is written for", function () {
    const p = V.compute(851, 393, 2.75);
    assert.ok(Math.round(p.w) === 1169 && Math.round(p.h) === 540, "phone " + Math.round(p.w) + "x" + Math.round(p.h));
    const f = V.compute(1280, 800, 1);
    assert.ok(Math.round(f.w) === 960 && Math.round(f.h) === 600, "fire " + Math.round(f.w) + "x" + Math.round(f.h));
    const d = V.compute(1600, 900, 1);
    assert.ok(Math.round(d.w) === 960 && Math.round(d.h) === 540, "desktop");
  });

  t("tokens(): text and touch targets step UP on a small physical screen, never down", function () {
    const phone = tokensFor("phone");
    const fire = tokensFor("fire");
    const desktop = tokensFor("desktop");

    assert.ok(phone.text > 1.15, "phone text scale " + phone.text);
    assert.strictEqual(fire.text, 1, "a roomy tablet is left alone");
    assert.strictEqual(desktop.text, 1, "so is a desktop window");
    assert.ok(phone.touch > fire.touch, "phone " + phone.touch + " vs fire " + fire.touch);
    assert.ok(phone.dense === true && fire.dense === false);
    assert.ok(phone.short === true && fire.short === false, "540 logical is short, 600 is not");
  });

  t("tokens(): a comfortable row is at least 40 CSS px of real screen everywhere", function () {
    // Landscape is the supported orientation (portrait gets the rotate prompt),
    // so these three have to come out right in real, physical terms.
    const names = ["phone", "fire", "desktop"];
    for (let i = 0; i < names.length; i++) {
      const d = DEVICES[names[i]];
      const c = V.compute(d.W, d.H, d.dpr);
      const tk = V.tokens(c.S, V.suggestUiScale(c.S), c.h);
      const cssRow = tk.touch * c.S;          // back into CSS px ≈ device-independent px
      assert.ok(cssRow >= 39.5, names[i] + " row is only " + cssRow.toFixed(1) + " css px");
      const cssText = 18 * tk.text * c.S;
      assert.ok(cssText >= 15, names[i] + " body text is only " + cssText.toFixed(1) + " css px");
    }
    // Portrait on a phone is an extreme: the logical viewport is 960x2079, so
    // the tokens run into their ceilings rather than growing without limit.
    const pp = tokensFor("phonep");
    assert.ok(pp.touch >= 100 && pp.touch <= 130, "portrait touch " + pp.touch);
    assert.strictEqual(pp.text, 1.45 * 1.06 > 1.9 ? 1.9 : Math.round(1.45 * 1.06 * 100) / 100, "text hits its ceiling");
  });

  t("tokens(): the UI scale setting moves text and touch together and is bounded", function () {
    const c = V.compute(1280, 800, 1);
    const small = V.tokens(c.S, V.UI_SCALES.small, c.h);
    const normal = V.tokens(c.S, V.UI_SCALES.normal, c.h);
    const large = V.tokens(c.S, V.UI_SCALES.large, c.h);
    assert.ok(small.text < normal.text && normal.text < large.text, "text ladder");
    assert.ok(small.touch < normal.touch && normal.touch < large.touch, "touch ladder");
    assert.ok(small.pad <= normal.pad && normal.pad <= large.pad, "padding ladder");
    // absurd input is clamped rather than trusted
    const silly = V.tokens(c.S, 99, c.h);
    assert.ok(silly.text <= 1.9 && silly.touch <= 76 * 99, "text clamped, got " + silly.text);
    const zero = V.tokens(0, 0, 0);
    assert.ok(isFinite(zero.text) && zero.text > 0 && isFinite(zero.touch));
  });

  t("suggestUiScale(): a nudge on a small phone, nothing on a tablet or desktop", function () {
    assert.ok(V.suggestUiScale(V.compute(851, 393, 2.75).S) > 1, "phone gets a nudge");
    assert.strictEqual(V.suggestUiScale(V.compute(1280, 800, 1).S), 1);
    assert.strictEqual(V.suggestUiScale(V.compute(1600, 900, 1).S), 1);
  });

  t("MQ.Text sizes follow the scale, and setUiScale re-lays everything out", function () {
    V.init();
    const base = T.px("m");
    V.setUiScale("large");
    const big = T.px("m");
    V.setUiScale("small");
    const small = T.px("m");
    V.setUiScale("auto");
    assert.ok(big > base && base > small, small + " < " + base + " < " + big);
    assert.strictEqual(T.px("m"), base, "auto comes back to where it started on this screen");
    // line height and the reported scale follow the same size
    V.setUiScale("large");
    assert.strictEqual(T.lineHeight("m"), Math.round(T.px("m") * 1.3));
    assert.ok(T.scale() > 1);
    assert.ok(T.px("l") > T.px("m") && T.px("m") > T.px("s"), "the ladder keeps its order");
    assert.ok(T.wrap("one two three four five six seven", 200, "m").length >= 2);
    V.setUiScale("auto");
  });

  t("setUiScale emits a resize so live scenes re-measure", function () {
    V.init();
    let seen = 0;
    MQ.Events.on("resize", function () { seen++; });
    V.setUiScale("large");
    V.setUiScale("auto");
    assert.strictEqual(seen, 2);
  });

  t("Theme.m(): the content box lives inside the safe insets at every size", function () {
    const Theme = MQ.UI.Theme;
    V.init();
    V.w = 1169; V.h = 540; V.S = 393 / 540;
    V.refreshTokens();
    V.safe.left = 46; V.safe.bottom = 22; V.safe.top = 0; V.safe.right = 0;
    const m = Theme.m();
    assert.ok(m.l >= 46, "left column clears the camera cutout, l=" + m.l);
    assert.ok(m.b <= 540 - 22, "bottom clears the gesture bar, b=" + m.b);
    assert.ok(m.rowH >= V.ui.touch, "rows are at least a finger, " + m.rowH);
    assert.ok(Theme.footerTop() < m.b, "the footer fits above the bottom edge");
    assert.ok(Theme.headerHeight(true) > Theme.headerHeight(false), "a subtitle makes the bar taller");
    // …and a title with a subtitle must not be drawn through it
    assert.ok(Theme.headerHeight(true) >= T.px("l") + T.px("s") + 9);
    V.safe.left = 0; V.safe.bottom = 0;
  });

  t("long lists scroll under a thumb (and a wheel), not just a d-pad", function () {
    const Theme = MQ.UI.Theme;
    V.init();
    MQ.Input.init(V.canvas);
    V.w = 960; V.h = 540; V.S = 1; V.refreshTokens();
    const dr = MQ.Input.dragState();
    dr.active = false; dr.dx = dr.dy = 0;
    const items = [];
    for (let i = 0; i < 40; i++) items.push({ label: "row " + i });
    const st = MQ.UI.menuState(items);
    const ctx = V.ctx || V.canvas.getContext("2d");
    const box = { x: 20, y: 20, w: 300, h: 400, rowH: 44, gap: 4 };
    Theme.list(st, ctx, box);
    const step = Math.max(box.rowH, V.ui.touch) + box.gap;
    assert.ok(st.visible < 40, "the list cannot show all 40 rows");
    assert.strictEqual(st.scroll, 0);

    // a thumb dragged upwards inside the list scrolls it down
    dr.active = true; dr.x0 = 100; dr.y0 = 100; dr.dy = -step * 3; dr.dx = 0;
    Theme.list(st, ctx, box);
    assert.strictEqual(st.scroll, 3, "dragged three rows, got " + st.scroll);
    assert.ok(st.cursor >= st.scroll, "the cursor came along, cursor=" + st.cursor);

    // a hard flick past the end stops at the end, and does not leave holes
    dr.dy = -step * 99;
    Theme.list(st, ctx, box);
    assert.strictEqual(st.scroll, 40 - st.visible, "clamped to the last page");
    Theme.list(st, ctx, box);   // the very next frame must not throw on a gap

    // and back up, stopping at the top rather than running off it
    dr.dy = step * 999;
    Theme.list(st, ctx, box);
    assert.strictEqual(st.scroll, 0);

    // a drag that starts outside the list is somebody else's business
    dr.x0 = 900; dr.y0 = 900; dr.dy = -step * 2;
    Theme.list(st, ctx, box);
    assert.strictEqual(st.scroll, 0);
    dr.active = false; dr.dy = 0;
  });

  t("Theme.list floors its rows at a finger, unless the caller opts out", function () {
    const Theme = MQ.UI.Theme;
    V.init();
    MQ.Input.dragState().active = false;
    V.w = 1169; V.h = 540; V.S = 393 / 540;
    V.refreshTokens();
    const items = [];
    for (let i = 0; i < 20; i++) items.push({ label: "row " + i });
    const st = MQ.UI.menuState(items);
    const ctx = V.ctx || V.canvas.getContext("2d");
    Theme.list(st, ctx, { x: 0, y: 0, w: 300, h: 400, rowH: 30, gap: 4 });
    const floored = st.visible;
    Theme.list(st, ctx, { x: 0, y: 0, w: 300, h: 400, rowH: 30, gap: 4, minRow: false });
    assert.ok(st.visible > floored, "opting out packs more rows in: " + st.visible + " vs " + floored);
  });

  t("Input: the pad scales up on a small screen and reports what it stands on", function () {
    V.init();
    MQ.Input.init(V.canvas);
    V.w = 1169; V.h = 540; V.S = 393 / 540;
    V.refreshTokens();
    MQ.Input.setTouchScale(1);
    const phoneK = MQ.Input.effectiveScale();
    V.w = 960; V.h = 600; V.S = 800 / 600;
    V.refreshTokens();
    MQ.Input.setTouchScale(1);
    const tabletK = MQ.Input.effectiveScale();
    assert.ok(phoneK > tabletK, "phone pad " + phoneK + " vs tablet " + tabletK);
    assert.strictEqual(tabletK, 1, "the tablet keeps the sizes the art was drawn for");
    // the Settings "touch layout size" choice still multiplies through
    MQ.Input.setTouchScale(1.24);
    assert.ok(MQ.Input.effectiveScale() > tabletK, "large touch layout is larger");
    MQ.Input.setTouchScale(0.82);
    assert.ok(MQ.Input.effectiveScale() < tabletK, "small touch layout is smaller");
    MQ.Input.setTouchScale(1);
    const r = MQ.Input.reserve();
    assert.ok(r.padW > 0 && r.padH > 0 && r.stickW > 0, "the pad reports a footprint");
  });
};
