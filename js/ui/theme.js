// =============================================================
// MonsterQuest v2 — MQ.UI.Theme (ui): shared look & feel for every
// menu screen. Colours, panels, header bar, footer hint bar with
// button glyphs by MQ.Input.lastSource, touch-friendly lists.
// Owned by ui-a; used by both UI workstreams. Access at RUNTIME
// (MQ.UI.Theme.x inside a function), never at parse time.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;

  // ---- palette: Cheshire brick, slate, brass, brine, moor, cyber ----
  const C = {
    ink: "#171425", inkSoft: "#241f36", night: "#0e0c18",
    paper: "#f6efdd", parch: "#e8dcc0",
    panel: "rgba(22,18,34,0.90)", panelLit: "rgba(40,34,62,0.94)", panelFlat: "rgba(14,12,24,0.72)",
    edge: "#8b7cc0", edgeDim: "rgba(139,124,192,0.45)",
    brass: "#c9a34a", brassLit: "#f2d68a", brassDim: "#7a6430",
    oxblood: "#8e2f2a", slate: "#54657a", canal: "#3f6b52",
    salt: "#dfe6ee", moor: "#6b5a86", cyber: "#3fe0c8", signal: "#7ce0ff",
    good: "#5fc96a", warn: "#e0a63c", bad: "#e05252", dim: "#8b88a4",
    text: "#f2eee2", textDim: "#a8a2be", textInk: "#221c33",
    hpHigh: "#5fc96a", hpMid: "#e6c24a", hpLow: "#e05252", exp: "#5aa9e6",
    grin: "#f4dc9a", sel: "rgba(201,163,74,0.30)", selEdge: "#f2d68a"
  };

  const TYPE_COLOURS = {
    normal: "#a8a090", fire: "#e2492f", water: "#3f7fd0", grass: "#4f9d4f",
    electric: "#e6c24a", flying: "#8fa8d8", bug: "#8ba63f", poison: "#9a52b5",
    rock: "#a08a5c", ground: "#c2a35e", psychic: "#d95f92", ghost: "#6a5a9a", cyber: "#3fe0c8"
  };
  const STATUS = {
    psn: { name: "PSN", col: "#9a52b5" }, tox: { name: "TOX", col: "#7a3a95" },
    par: { name: "PAR", col: "#e6c24a" }, brn: { name: "BRN", col: "#e2703f" },
    slp: { name: "SLP", col: "#6f7f9a" }, frz: { name: "FRZ", col: "#7cd6e6" },
    cnf: { name: "CNF", col: "#d95f92" }
  };

  const Theme = { C: C, TYPE_COLOURS: TYPE_COLOURS, STATUS: STATUS, VERSION: 1 };

  // ---- metrics (one cached object; never allocates per frame) ----
  const M = { w: 960, h: 540, l: 0, r: 960, t: 0, b: 540, cw: 960, ch: 540, cx: 480, cy: 270, pad: 16, rowH: 42, k: 1, touch: false, wide: false };
  Theme.m = function () {
    const V = MQ.View;
    const w = V.w || 960, h = V.h || 540;
    const s = V.safe || { top: 0, right: 0, bottom: 0, left: 0 };
    M.w = w; M.h = h;
    M.l = s.left + 12; M.t = s.top + 10;
    M.r = w - s.right - 12; M.b = h - s.bottom - 10;
    M.cw = M.r - M.l; M.ch = M.b - M.t;
    M.cx = w / 2; M.cy = h / 2;
    M.k = U.clamp(h / 540, 0.9, 1.4);
    M.touch = !!(MQ.Input && MQ.Input.touchVisible);
    M.wide = w / h > 1.85;
    M.pad = Math.round(14 * M.k);
    M.rowH = Math.round((M.touch ? 46 : 40) * M.k);
    return M;
  };

  // ---- sound (ROSTER §8 ids, falling back to the core's five) ----
  const SFX_FALLBACK = { ui_move: "cursor", ui_select: "confirm", ui_back: "deny", ui_error: "deny", ui_open: "confirm", ui_close: "deny", coin: "item", achievement: "item" };
  Theme.sfx = function (id) {
    try {
      if (MQ.Sfx && MQ.Sfx.play) { MQ.Sfx.play(id); return; }
      if (MQ.SFX && MQ.SFX.play) { MQ.SFX.play(id); return; }
      if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx(SFX_FALLBACK[id] || id);
    } catch (e) { /* audio is optional */ }
  };
  Theme.music = function (id) {
    try { if (MQ.Audio && MQ.Audio.playSong) MQ.Audio.playSong(id); else if (MQ.Songs && MQ.Songs.play) MQ.Songs.play(id); } catch (e) { /* optional */ }
  };
  Theme.buzz = function (ms) { if (MQ.Input && MQ.Input.vibrate) MQ.Input.vibrate(ms || 10); };

  // ---- backgrounds -------------------------------------------------
  Theme.backdrop = function (ctx, o) {
    const m = Theme.m();
    const top = (o && o.top) || "#1b1730", bot = (o && o.bottom) || "#0d1a18";
    const g = ctx.createLinearGradient(0, 0, 0, m.h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, m.w, m.h);
    // faint loom-weave lattice — Macclesfield silk, cheap to draw
    ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 1;
    const step = 48;
    ctx.beginPath();
    for (let x = -m.h; x < m.w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x + m.h, m.h); }
    for (let x = 0; x < m.w + m.h; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x - m.h, m.h); }
    ctx.stroke();
  };
  Theme.scrim = function (ctx, alpha) {
    const m = Theme.m();
    ctx.fillStyle = "rgba(8,6,16," + (alpha === undefined ? 0.72 : alpha) + ")";
    ctx.fillRect(0, 0, m.w, m.h);
  };

  // ---- panels ------------------------------------------------------
  Theme.panel = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = o.radius === undefined ? 10 : o.radius;
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    ctx.fillStyle = o.fill || (o.lit ? C.panelLit : o.flat ? C.panelFlat : C.panel);
    UI.roundRect(ctx, x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = o.border || (o.accent || C.edgeDim);
    ctx.lineWidth = o.selected ? 3 : 2;
    UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r); ctx.stroke();
    if (o.accent) { ctx.fillStyle = o.accent; ctx.fillRect(x + 2, y + r, 3, h - r * 2); }
    if (o.title) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      UI.roundRect(ctx, x + 1, y + 1, w - 2, 26, r); ctx.fill();
      T.draw(ctx, o.title, x + 12, y + 5, { size: "s", color: C.brassLit });
    }
    ctx.restore();
  };

  // ---- header bar --------------------------------------------------
  const headerRect = { x: 0, y: 0, w: 0, h: 0 };
  const backRect = { x: 0, y: 0, w: 0, h: 0 };
  Theme.HEADER_H = 46;
  Theme.header = function (ctx, o) {
    o = o || {};
    const m = Theme.m();
    const h = Math.round(Theme.HEADER_H * m.k);
    const x = m.l, y = m.t, w = m.cw;
    headerRect.x = x; headerRect.y = y; headerRect.w = w; headerRect.h = h;
    const accent = o.accent || C.brass;
    ctx.save();
    ctx.fillStyle = "rgba(16,13,28,0.92)";
    UI.roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = accent; ctx.fillRect(x + 3, y + 8, 4, h - 16);
    let tx = x + 16;
    if (o.back !== false) {
      backRect.x = x + 6; backRect.y = y + 4; backRect.w = Math.round(40 * m.k); backRect.h = h - 8;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      UI.roundRect(ctx, backRect.x, backRect.y, backRect.w, backRect.h, 8); ctx.fill();
      ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 1;
      UI.roundRect(ctx, backRect.x + 0.5, backRect.y + 0.5, backRect.w - 1, backRect.h - 1, 8); ctx.stroke();
      ctx.fillStyle = C.text;
      const bx = backRect.x + backRect.w / 2 + 3, by = backRect.y + backRect.h / 2;
      ctx.beginPath(); ctx.moveTo(bx, by - 8); ctx.lineTo(bx - 9, by); ctx.lineTo(bx, by + 8); ctx.closePath(); ctx.fill();
      tx = backRect.x + backRect.w + 12;
    } else { backRect.w = 0; }
    if (o.icon && UI.hasIcon && UI.hasIcon(o.icon)) { UI.icon(ctx, o.icon, tx, y + (h - 18) / 2, 1.1); tx += 26; }
    T.draw(ctx, String(o.title || ""), tx, y + (o.sub ? 5 : (h - 26) / 2), { size: "l", color: C.brassLit, shadow: true });
    if (o.sub) T.draw(ctx, String(o.sub), tx + 2, y + h - 20, { size: "s", color: C.textDim });
    if (o.right) T.draw(ctx, String(o.right), x + w - 14, y + (h - 18) / 2, { size: "m", align: "right", color: C.text });
    ctx.restore();
    return h;
  };
  Theme.headerBottom = function () { return headerRect.y + headerRect.h + 8; };
  Theme.backRect = function () { return backRect; };

  // ---- button glyphs by input source ------------------------------
  const GLYPHS = {
    key: { a: "Z", b: "X", start: "ESC", select: "TAB", run: "SHIFT", dir: "ARROWS", up: "W", down: "S", left: "A", right: "D", lr: "< >" },
    pad: { a: "A", b: "B", start: "START", select: "SELECT", run: "LB", dir: "STICK", up: "UP", down: "DN", left: "LT", right: "RT", lr: "L/R" },
    touch: { a: "A", b: "B", start: "MENU", select: "SEL", run: "RUN", dir: "STICK", up: "UP", down: "DN", left: "LT", right: "RT", lr: "SWIPE" }
  };
  Theme.source = function () { return (MQ.Input && MQ.Input.lastSource) || "key"; };
  Theme.glyph = function (btn) {
    const g = GLYPHS[Theme.source()] || GLYPHS.key;
    return g[btn] || String(btn).toUpperCase();
  };

  // ---- footer hint bar (tappable) ---------------------------------
  const hintRects = [];
  Theme.FOOTER_H = 30;
  Theme.footer = function (ctx, hints) {
    if (!hints || !hints.length) return 0;
    const m = Theme.m();
    const h = Math.round(Theme.FOOTER_H * m.k);
    const y = m.b - h;
    ctx.save();
    ctx.fillStyle = "rgba(12,10,22,0.86)";
    UI.roundRect(ctx, m.l, y, m.cw, h, 8); ctx.fill();
    let x = m.l + 10;
    const tp = (MQ.Input && MQ.Input.tapAt) ? MQ.Input.tapAt() : null;
    for (let i = 0; i < hints.length; i++) {
      const hint = hints[i];
      if (!hint) continue;
      const g = Theme.glyph(hint.btn);
      const gw = T.width(g, "s") + 12;
      const lw = T.width(hint.label || "", "s");
      const total = gw + 8 + lw;
      if (x + total > m.r - 10) break;
      const r = hintRects[i] || (hintRects[i] = { x: 0, y: 0, w: 0, h: 0, btn: null });
      r.x = x - 6; r.y = y; r.w = total + 12; r.h = h; r.btn = hint.btn;
      ctx.fillStyle = hint.btn === "a" ? "rgba(198,40,40,0.5)" : hint.btn === "b" ? "rgba(42,79,168,0.5)" : "rgba(120,120,150,0.35)";
      UI.roundRect(ctx, x, y + 4, gw, h - 8, 6); ctx.fill();
      T.draw(ctx, g, x + gw / 2, y + (h - 14) / 2, { size: "s", align: "center", color: "#ffffff" });
      T.draw(ctx, hint.label || "", x + gw + 8, y + (h - 14) / 2, { size: "s", color: C.textDim });
      // tapping a hint injects its action, so every screen has on-screen buttons
      if (tp && hint.btn && U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) {
        MQ.Input.inject(hint.btn); MQ.Input.consumeAll(); Theme.sfx("ui_select");
      }
      x += total + 20;
    }
    for (let i = hints.length; i < hintRects.length; i++) hintRects[i].btn = null;
    ctx.restore();
    return h;
  };
  Theme.footerTop = function () { const m = Theme.m(); return m.b - Math.round(Theme.FOOTER_H * m.k) - 8; };

  // Pooled hint arrays so screens don't allocate per frame.
  Theme.hints = function (spec) { return spec; };

  // ---- taps --------------------------------------------------------
  Theme.tapped = function (rect) {
    if (!rect || !rect.w) return false;
    const tp = MQ.Input && MQ.Input.tapAt ? MQ.Input.tapAt() : null;
    if (!tp) return false;
    if (!U.inRect(tp.x, tp.y, rect.x, rect.y, rect.w, rect.h)) return false;
    MQ.Input.consumeAll();
    return true;
  };
  // Back = B button, header chevron tap, or hardware back (which injects 'b').
  Theme.backPressed = function () {
    const I = MQ.Input;
    if (!I) return false;
    if (I.pressed("b")) { I.consume("b"); Theme.sfx("ui_back"); return true; }
    if (Theme.tapped(backRect)) { Theme.sfx("ui_back"); return true; }
    return false;
  };

  // ---- buttons -----------------------------------------------------
  Theme.button = function (ctx, label, x, y, w, h, o) {
    o = o || {};
    const on = !!o.active, dis = !!o.disabled;
    ctx.save();
    ctx.fillStyle = dis ? "rgba(60,58,78,0.5)" : on ? C.brass : "rgba(46,40,72,0.92)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = dis ? "rgba(120,118,140,0.4)" : on ? C.brassLit : C.edgeDim;
    ctx.lineWidth = on ? 3 : 2;
    UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 8); ctx.stroke();
    const size = o.size || "m";
    T.draw(ctx, label, x + w / 2, y + (h - T.px(size)) / 2, { size: size, align: "center", color: dis ? "rgba(160,158,180,0.7)" : on ? C.textInk : C.text });
    ctx.restore();
  };

  // ---- gauges, chips, colours -------------------------------------
  Theme.hpColour = function (ratio) { return ratio > 0.5 ? C.hpHigh : ratio > 0.2 ? C.hpMid : C.hpLow; };
  Theme.typeColour = function (type) {
    try { if (MQ.Data && MQ.Data.types && MQ.Data.types[type] && MQ.Data.types[type].color) return MQ.Data.types[type].color; } catch (e) { /* ignore */ }
    return TYPE_COLOURS[type] || C.dim;
  };
  Theme.typeChip = function (ctx, type, x, y, w, h) {
    w = w || 62; h = h || 18;
    ctx.fillStyle = Theme.typeColour(type);
    UI.roundRect(ctx, x, y, w, h, 4); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x, y + h - 3, w, 3);
    T.draw(ctx, String(type || "").toUpperCase(), x + w / 2, y + (h - 14) / 2, { size: "s", align: "center", color: "#12101c" });
    return w;
  };
  Theme.statusChip = function (ctx, status, x, y) {
    if (!status) return 0;
    const s = STATUS[status] || { name: String(status).toUpperCase().slice(0, 3), col: C.dim };
    const w = 40;
    ctx.fillStyle = s.col;
    UI.roundRect(ctx, x, y, w, 18, 4); ctx.fill();
    T.draw(ctx, s.name, x + w / 2, y + 2, { size: "s", align: "center", color: "#12101c" });
    return w;
  };
  Theme.hpBar = function (ctx, x, y, w, h, cur, max) {
    const ratio = max > 0 ? U.clamp(cur / max, 0, 1) : 0;
    UI.gauge(ctx, x, y, w, h, ratio, { color: Theme.hpColour(ratio), bg: "rgba(0,0,0,0.5)", border: "rgba(255,255,255,0.25)" });
  };

  // ---- GRINMALKIN grin motif --------------------------------------
  // openness 0..1; a smile with no cat behind it.
  Theme.grin = function (ctx, cx, cy, size, o) {
    o = o || {};
    const a = o.alpha === undefined ? 1 : o.alpha;
    if (a <= 0) return;
    const col = o.color || C.grin;
    const open = o.open === undefined ? 1 : U.clamp(o.open, 0, 1);
    const w = size, h = size * 0.46 * open;
    ctx.save();
    ctx.globalAlpha = a;
    // the arc of the smile
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, size * 0.055); ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy - h * 0.35);
    ctx.quadraticCurveTo(cx, cy + h * 1.15, cx + w / 2, cy - h * 0.35);
    ctx.stroke();
    // teeth
    const teeth = 7;
    ctx.fillStyle = col;
    for (let i = 0; i < teeth; i++) {
      const t = (i + 0.5) / teeth;
      const px = cx - w / 2 + w * t;
      const py = cy - h * 0.35 + (2 * (1 - t) * t) * h * 1.5 * 0.75 + h * 0.06;
      const tw = size * 0.055, th = size * 0.10 * (0.55 + 0.45 * Math.sin(Math.PI * t));
      ctx.beginPath();
      ctx.moveTo(px - tw, py - th * 0.1);
      ctx.lineTo(px + tw, py - th * 0.1);
      ctx.lineTo(px, py + th);
      ctx.closePath(); ctx.fill();
    }
    // eyes: two lazy crescents above
    if (o.eyes !== false) {
      const ey = cy - size * 0.44, ex = size * 0.26;
      ctx.lineWidth = Math.max(2, size * 0.05);
      for (let s = -1; s <= 1; s += 2) {
        ctx.beginPath();
        ctx.arc(cx + s * ex, ey, size * 0.11, Math.PI * 0.15, Math.PI * 0.85, true);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // ---- themed scrolling list (rows drawn by the caller) ------------
  // st = MQ.UI.menuState(items, {visible}); this fills st.rects so
  // st.update() taps work, and draws a scrollbar. render(ctx,item,x,y,w,h,sel,i)
  Theme.list = function (st, ctx, o) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    const rowH = o.rowH || Theme.m().rowH;
    const gap = o.gap === undefined ? 4 : o.gap;
    const n = st.items.length;
    const visible = Math.max(1, Math.floor((h + gap) / (rowH + gap)));
    st.visible = visible;
    st.cols = 1;
    if (st.scroll > Math.max(0, n - visible)) st.scroll = Math.max(0, n - visible);
    if (st.cursor < st.scroll) st.scroll = st.cursor;
    else if (st.cursor >= st.scroll + visible) st.scroll = st.cursor - visible + 1;
    for (let i = 0; i < st.rects.length; i++) st.rects[i].on = false;
    if (n === 0) {
      T.draw(ctx, o.empty || "Nothing here.", x + w / 2, y + 20, { size: "m", align: "center", color: C.textDim });
      return;
    }
    const end = Math.min(n, st.scroll + visible);
    for (let i = st.scroll; i < end; i++) {
      const ry = y + (i - st.scroll) * (rowH + gap);
      let r = st.rects[i];
      if (!r) r = st.rects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      r.x = x; r.y = ry; r.w = w; r.h = rowH; r.on = true;
      const sel = i === st.cursor;
      if (o.render) o.render(ctx, st.items[i], x, ry, w, rowH, sel, i);
      else Theme.row(ctx, st.items[i], x, ry, w, rowH, sel);
    }
    // scrollbar
    if (n > visible) {
      const trackH = h;
      const barH = Math.max(20, trackH * visible / n);
      const barY = y + (trackH - barH) * (st.scroll / (n - visible));
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(x + w + 4, y, 4, trackH);
      ctx.fillStyle = C.brass; ctx.fillRect(x + w + 4, barY, 4, barH);
    }
  };
  // default row renderer for {label,right,icon,color,disabled}
  Theme.row = function (ctx, item, x, y, w, h, sel) {
    const label = typeof item === "string" ? item : (item && item.label !== undefined ? item.label : String(item));
    const dis = !!(item && item.disabled);
    ctx.fillStyle = sel ? C.sel : "rgba(255,255,255,0.045)";
    UI.roundRect(ctx, x, y, w, h, 7); ctx.fill();
    if (sel) { ctx.strokeStyle = C.selEdge; ctx.lineWidth = 2; UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 7); ctx.stroke(); }
    let tx = x + 12;
    const icon = item && item.icon;
    if (icon && UI.hasIcon && UI.hasIcon(icon)) { UI.icon(ctx, icon, tx, y + (h - 16) / 2); tx += 22; }
    const col = dis ? "rgba(150,148,170,0.65)" : (item && item.color) || C.text;
    T.draw(ctx, String(label), tx, y + (h - 18) / 2, { size: "m", color: col, maxWidth: w - (tx - x) - 90 });
    const right = item && item.right;
    if (right !== undefined && right !== null && right !== "") T.draw(ctx, String(right), x + w - 12, y + (h - 18) / 2, { size: "m", align: "right", color: dis ? "rgba(150,148,170,0.65)" : C.brassLit });
    const sub = item && item.sub;
    if (sub && h > 40) T.draw(ctx, String(sub), tx, y + h - 17, { size: "s", color: C.textDim, maxWidth: w - (tx - x) - 20 });
  };

  // ---- tab strip (touch: tap a tab; pad/keys: left/right) ----------
  const tabRects = [];
  Theme.tabStrip = function (ctx, labels, active, o) {
    const m = Theme.m();
    const x = o.x, y = o.y, w = o.w, h = o.h || Math.round(34 * m.k);
    const n = labels.length;
    const tw = w / n;
    ctx.save();
    ctx.fillStyle = "rgba(12,10,22,0.75)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    for (let i = 0; i < n; i++) {
      const tx = x + i * tw;
      let r = tabRects[i] || (tabRects[i] = { x: 0, y: 0, w: 0, h: 0 });
      r.x = tx; r.y = y; r.w = tw; r.h = h;
      const on = i === active;
      const lab = typeof labels[i] === "string" ? labels[i] : labels[i].label;
      const pip = typeof labels[i] === "object" && labels[i].pip;
      if (on) {
        ctx.fillStyle = C.brass;
        UI.roundRect(ctx, tx + 2, y + 2, tw - 4, h - 4, 6); ctx.fill();
      }
      T.draw(ctx, lab, tx + tw / 2, y + (h - 14) / 2, { size: "s", align: "center", color: on ? C.textInk : C.textDim, maxWidth: tw - 8 });
      if (pip) { ctx.fillStyle = pip === true ? C.bad : pip; ctx.beginPath(); ctx.arc(tx + tw - 8, y + 8, 3.5, 0, 6.3); ctx.fill(); }
    }
    ctx.restore();
    tabRects.length = n;
    return h;
  };
  Theme.tabTapped = function () {
    const tp = MQ.Input && MQ.Input.tapAt ? MQ.Input.tapAt() : null;
    if (!tp) return -1;
    for (let i = 0; i < tabRects.length; i++) {
      const r = tabRects[i];
      if (U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) { MQ.Input.consumeAll(); return i; }
    }
    return -1;
  };

  // ---- little formatters ------------------------------------------
  Theme.money = function (n) { return (U.fmtNum ? U.fmtNum(n || 0) : String(n || 0)) + "cr"; };
  Theme.playtime = function (ms) {
    const total = Math.floor((ms || 0) / 1000);
    const hh = Math.floor(total / 3600), mm = Math.floor((total % 3600) / 60);
    return hh + "h " + (mm < 10 ? "0" : "") + mm + "m";
  };
  Theme.date = function (ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    const p = function (v) { return (v < 10 ? "0" : "") + v; };
    return p(d.getDate()) + " " + mon + "  " + p(d.getHours()) + ":" + p(d.getMinutes());
  };
  Theme.titleCase = function (s) {
    s = String(s || "").replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // ---- ask/confirm sugar that degrades without MQ.Dialog ----------
  Theme.confirm = function (question, opts) {
    if (MQ.Dialog && MQ.Dialog.confirm) return MQ.Dialog.confirm(question, opts);
    return Promise.resolve(true);
  };
  Theme.say = function (pages, opts) {
    if (MQ.Dialog && MQ.Dialog.say) return MQ.Dialog.say(pages, opts);
    return Promise.resolve();
  };
  Theme.toast = function (text, ms) { if (UI.toast) UI.toast(text, ms); };

  // ---- flag helpers used by several screens ------------------------
  Theme.flag = function (id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } };
  Theme.walletOf = function () { try { return MQ.Inventory && MQ.Inventory.money !== undefined ? MQ.Inventory.money : 0; } catch (e) { return 0; } };

  UI.Theme = Theme;
  MQ.UI = UI;
})();
