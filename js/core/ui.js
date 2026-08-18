// =============================================================
// MonsterQuest v2 — MQ.UI (core): boxes, menus, gauges, icons,
// toasts, tabs, type chips. All positions in logical px.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const T = MQ.Text;

  const STYLES = {
    default: { fill: "#f4f0e0", border: "#202030", inner: "#c9a34a", text: "#202030", radius: 8 },
    dark:    { fill: "rgba(16,16,28,0.86)", border: "#8888aa", inner: "#3a3a58", text: "#f0f0f8", radius: 8 },
    flat:    { fill: "rgba(20,20,32,0.7)", border: null, inner: null, text: "#f0f0f8", radius: 6 },
    paper:   { fill: "#fff8e6", border: "#6a5030", inner: "#e0c890", text: "#3a2a10", radius: 4 },
    danger:  { fill: "#3a1414", border: "#e06060", inner: "#802020", text: "#ffe0e0", radius: 8 }
  };

  const UI = { STYLES: STYLES };

  UI.roundRect = function (ctx, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  };

  // 9-slice-ish box: fill, dark border, inner accent line
  UI.box = function (ctx, x, y, w, h, o) {
    const st = STYLES[(o && o.style) || "default"] || STYLES.default;
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (o && o.alpha !== undefined) { ctx.save(); ctx.globalAlpha = o.alpha; }
    ctx.fillStyle = (o && o.fill) || st.fill;
    UI.roundRect(ctx, x, y, w, h, st.radius);
    ctx.fill();
    if (st.border) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = (o && o.border) || st.border;
      UI.roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, st.radius);
      ctx.stroke();
    }
    if (st.inner) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = st.inner;
      UI.roundRect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(0, st.radius - 3));
      ctx.stroke();
    }
    if (o && o.alpha !== undefined) ctx.restore();
    if (o && o.title) {
      T.draw(ctx, o.title, x + 14, y - 9, { size: "s", color: st.text, shadow: st === STYLES.default ? false : true });
    }
    return st;
  };

  UI.gauge = function (ctx, x, y, w, h, ratio, o) {
    ratio = U.clamp(ratio || 0, 0, 1);
    x = Math.round(x); y = Math.round(y);
    ctx.fillStyle = (o && o.bg) || "#303040";
    ctx.fillRect(x, y, w, h);
    let col = o && o.color;
    if (!col) col = ratio > 0.5 ? "#4caf50" : ratio > 0.2 ? "#f0c030" : "#e04040";
    ctx.fillStyle = col;
    const fw = Math.round((w - 2) * ratio);
    if (fw > 0) ctx.fillRect(x + 1, y + 1, fw, h - 2);
    if (!(o && o.noBorder)) {
      ctx.strokeStyle = (o && o.border) || "#101018";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }
  };

  // ---- blinking cursor / arrow ----------------------------------
  UI.pointer = function (ctx, x, y, color) {
    const bob = Math.floor((MQ.Loop ? MQ.Loop.time : 0) / 250) % 2;
    ctx.fillStyle = color || "#c62828";
    ctx.beginPath();
    ctx.moveTo(x + bob, y); ctx.lineTo(x + 10 + bob, y + 6); ctx.lineTo(x + bob, y + 12);
    ctx.closePath(); ctx.fill();
  };
  UI.advanceArrow = function (ctx, x, y, color) {
    const bob = Math.floor((MQ.Loop ? MQ.Loop.time : 0) / 300) % 2;
    ctx.fillStyle = color || "#c62828";
    ctx.beginPath();
    ctx.moveTo(x, y + bob * 3); ctx.lineTo(x + 16, y + bob * 3); ctx.lineTo(x + 8, y + 11 + bob * 3);
    ctx.closePath(); ctx.fill();
  };

  // ---- icons (16x16 vector-ish) --------------------------------
  const ICONS = {
    heart: function (c) { c.fillStyle = "#e04060"; c.fillRect(2, 3, 5, 5); c.fillRect(9, 3, 5, 5); c.fillRect(1, 5, 14, 4); c.fillRect(3, 9, 10, 2); c.fillRect(5, 11, 6, 2); c.fillRect(7, 13, 2, 1); },
    star: function (c) { c.fillStyle = "#f4d03f"; c.fillRect(7, 1, 2, 4); c.fillRect(1, 6, 14, 2); c.fillRect(3, 8, 10, 2); c.fillRect(4, 10, 3, 4); c.fillRect(9, 10, 3, 4); c.fillRect(5, 4, 6, 3); },
    coin: function (c) { c.fillStyle = "#c9a34a"; c.beginPath(); c.arc(8, 8, 7, 0, 6.3); c.fill(); c.fillStyle = "#f8e08a"; c.beginPath(); c.arc(8, 8, 5, 0, 6.3); c.fill(); c.fillStyle = "#a07020"; c.fillRect(7, 4, 2, 8); },
    check: function (c) { c.strokeStyle = "#40c060"; c.lineWidth = 3; c.beginPath(); c.moveTo(2, 8); c.lineTo(6, 12); c.lineTo(14, 3); c.stroke(); },
    cross: function (c) { c.strokeStyle = "#e04040"; c.lineWidth = 3; c.beginPath(); c.moveTo(3, 3); c.lineTo(13, 13); c.moveTo(13, 3); c.lineTo(3, 13); c.stroke(); },
    ball: function (c) { c.fillStyle = "#e03030"; c.beginPath(); c.arc(8, 8, 7, Math.PI, 0); c.fill(); c.fillStyle = "#f4f4f4"; c.beginPath(); c.arc(8, 8, 7, 0, Math.PI); c.fill(); c.fillStyle = "#202020"; c.fillRect(1, 7, 14, 2); c.beginPath(); c.arc(8, 8, 2.5, 0, 6.3); c.fill(); },
    sword: function (c) { c.fillStyle = "#c0c8d8"; c.fillRect(7, 1, 2, 9); c.fillStyle = "#806040"; c.fillRect(4, 10, 8, 2); c.fillRect(7, 12, 2, 3); },
    shield: function (c) { c.fillStyle = "#4070c0"; c.fillRect(3, 2, 10, 7); c.fillRect(4, 9, 8, 3); c.fillRect(6, 12, 4, 2); c.fillStyle = "#a0c0f0"; c.fillRect(5, 4, 2, 5); },
    bag: function (c) { c.fillStyle = "#a06030"; c.fillRect(3, 6, 10, 9); c.fillStyle = "#c08050"; c.fillRect(5, 3, 6, 3); c.fillRect(6, 8, 4, 3); },
    map: function (c) { c.fillStyle = "#e8d8a8"; c.fillRect(2, 3, 12, 10); c.fillStyle = "#6090c0"; c.fillRect(4, 5, 3, 3); c.fillStyle = "#c04040"; c.fillRect(9, 8, 2, 2); },
    book: function (c) { c.fillStyle = "#803030"; c.fillRect(2, 2, 12, 12); c.fillStyle = "#f0e8d0"; c.fillRect(4, 4, 8, 8); c.fillStyle = "#803030"; c.fillRect(7, 2, 2, 12); },
    cog: function (c) { c.fillStyle = "#909098"; c.fillRect(6, 1, 4, 14); c.fillRect(1, 6, 14, 4); c.fillRect(3, 3, 10, 10); c.fillStyle = "#303038"; c.fillRect(6, 6, 4, 4); },
    save: function (c) { c.fillStyle = "#3050a0"; c.fillRect(2, 2, 12, 12); c.fillStyle = "#f0f0f0"; c.fillRect(4, 3, 8, 4); c.fillStyle = "#c0c8e0"; c.fillRect(5, 9, 6, 4); },
    arrowR: function (c) { c.fillStyle = "#f0f0f8"; c.beginPath(); c.moveTo(4, 2); c.lineTo(13, 8); c.lineTo(4, 14); c.closePath(); c.fill(); },
    arrowL: function (c) { c.fillStyle = "#f0f0f8"; c.beginPath(); c.moveTo(12, 2); c.lineTo(3, 8); c.lineTo(12, 14); c.closePath(); c.fill(); },
    dot: function (c) { c.fillStyle = "#f0f0f8"; c.beginPath(); c.arc(8, 8, 3, 0, 6.3); c.fill(); },
    cat: function (c) { c.fillStyle = "#e0a040"; c.fillRect(3, 5, 10, 8); c.fillRect(3, 2, 2, 3); c.fillRect(11, 2, 2, 3); c.fillStyle = "#202020"; c.fillRect(5, 7, 2, 2); c.fillRect(9, 7, 2, 2); },
    fish: function (c) { c.fillStyle = "#60a0d0"; c.beginPath(); c.moveTo(2, 8); c.lineTo(9, 3); c.lineTo(9, 13); c.closePath(); c.fill(); c.fillRect(9, 5, 5, 6); c.fillStyle = "#202020"; c.fillRect(11, 6, 1, 1); },
    quest: function (c) { c.fillStyle = "#f4d03f"; c.fillRect(6, 1, 4, 9); c.fillRect(6, 12, 4, 3); }
  };
  const iconCache = {};
  UI.icon = function (ctx, name, x, y, scale) {
    const p = ICONS[name];
    if (!p) return;
    scale = scale || 1;
    let cv = iconCache[name];
    if (!cv) {
      cv = document.createElement("canvas"); cv.width = 16; cv.height = 16;
      const c = cv.getContext("2d");
      p(c);
      iconCache[name] = cv;
    }
    ctx.drawImage(cv, Math.round(x), Math.round(y), 16 * scale, 16 * scale);
  };
  UI.hasIcon = function (name) { return !!ICONS[name]; };
  UI.ICONS = ICONS;

  UI.typeChip = function (ctx, type, x, y, o) {
    let col = "#888", name = type;
    if (MQ.Data && MQ.Data.types && MQ.Data.types[type]) { col = MQ.Data.types[type].color || col; name = MQ.Data.types[type].name || type; }
    else if (type) name = U.capitalise(type);
    const w = (o && o.w) || 78, h = (o && o.h) || 20;
    ctx.fillStyle = col;
    UI.roundRect(ctx, x, y, w, h, 5); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5; UI.roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 5); ctx.stroke();
    T.draw(ctx, String(name).toUpperCase(), x + w / 2, y + 3, { size: "s", align: "center", color: "#fff", shadow: true });
    return w;
  };

  // ---- tabs ------------------------------------------------------
  UI.tabs = function (ctx, labels, active, o) {
    const x = o.x, y = o.y, w = o.w, h = o.h || 30;
    const tw = w / labels.length;
    for (let i = 0; i < labels.length; i++) {
      const tx = x + i * tw;
      ctx.fillStyle = i === active ? "#f4f0e0" : "rgba(40,40,60,0.8)";
      UI.roundRect(ctx, tx + 1, y, tw - 2, h, 6); ctx.fill();
      T.draw(ctx, labels[i], tx + tw / 2, y + (h - 14) / 2, { size: "s", align: "center", color: i === active ? "#202030" : "#c0c0d0" });
    }
  };
  UI.tabsHit = function (labels, o, px, py) {
    if (!U.inRect(px, py, o.x, o.y, o.w, o.h || 30)) return -1;
    return Math.min(labels.length - 1, Math.floor((px - o.x) / (o.w / labels.length)));
  };

  // ---- menus -----------------------------------------------------
  // state = menuState(items, {cols, visible, wrap, cancel})
  // state.update() → {selected:i, item} | {cancel:true} | null   (consumes MQ.Input)
  // UI.menu(state, ctx, items, {x,y,w,cols,rowH,visible,style,pad}) draws + records hit rects
  function itemLabel(it) { return typeof it === "string" ? it : (it.label !== undefined ? it.label : String(it.value)); }
  function itemDisabled(it) { return typeof it === "object" && it && it.disabled; }

  UI.menuState = function (items, o) {
    const st = {
      items: items || [],
      cursor: 0,
      scroll: 0,
      cols: (o && o.cols) || 1,
      visible: (o && o.visible) || 0,     // rows visible (0 = all)
      wrap: !(o && o.wrap === false),
      allowCancel: !(o && o.cancel === false),
      repeat: 0,
      rects: [],                            // hit rects from last draw
      geo: { x: 0, y: 0, w: 0, rowH: 0, cols: 1, count: 0 },
      hover: -1
    };
    st.setItems = function (its) {
      st.items = its || [];
      if (st.cursor >= st.items.length) st.cursor = Math.max(0, st.items.length - 1);
      return st;
    };
    st.setCursor = function (i) { st.cursor = U.clamp(i, 0, Math.max(0, st.items.length - 1)); return st; };
    st.current = function () { return st.items[st.cursor]; };
    st.value = function () { const it = st.items[st.cursor]; return (it && typeof it === "object" && it.value !== undefined) ? it.value : it; };
    st.update = function () {
      const I = MQ.Input;
      const n = st.items.length;
      if (!I) return null;
      // taps
      const tp = I.tapAt();
      if (tp) {
        for (let i = 0; i < st.rects.length && i < n; i++) {
          const r = st.rects[i];
          if (r && r.on && U.inRect(tp.x, tp.y, r.x, r.y, r.w, r.h)) {
            if (itemDisabled(st.items[i])) return null;
            st.cursor = i;
            I.consumeAll();
            return { selected: i, item: st.items[i], value: st.value(), tap: true };
          }
        }
      }
      if (n === 0) {
        if (st.allowCancel && I.pressed("b")) { I.consume("b"); return { cancel: true }; }
        return null;
      }
      const cols = st.cols;
      let moved = false;
      // digital nav with hold-repeat
      let dir = null;
      if (I.pressed("up")) dir = "up"; else if (I.pressed("down")) dir = "down";
      else if (I.pressed("left")) dir = "left"; else if (I.pressed("right")) dir = "right";
      if (!dir) {
        const heldDir = I.held("up") ? "up" : I.held("down") ? "down" : I.held("left") ? "left" : I.held("right") ? "right" : null;
        if (heldDir) { st.repeat += MQ.Loop ? MQ.Loop.STEP : 16; if (st.repeat > 340) { dir = heldDir; st.repeat = 340 - 70; } }
        else st.repeat = 0;
      } else st.repeat = 0;
      if (dir) {
        let c = st.cursor;
        if (dir === "up") { if (c - cols >= 0) c -= cols; else if (st.wrap) { c = c + Math.floor((n - 1 - c) / cols) * cols; } }
        else if (dir === "down") { if (c + cols < n) c += cols; else if (st.wrap) { c = c % cols; if (c >= n) c = 0; } }
        else if (dir === "left") { if (cols > 1) { if (c % cols > 0) c -= 1; else if (st.wrap) c = Math.min(n - 1, c + cols - 1); } }
        else if (dir === "right") { if (cols > 1) { if (c % cols < cols - 1 && c + 1 < n) c += 1; else if (st.wrap) c = c - (c % cols); } }
        if (c !== st.cursor) { st.cursor = c; moved = true; if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("cursor"); }
        I.consume(dir);
      }
      // scroll to keep cursor visible
      if (st.visible > 0) {
        const row = Math.floor(st.cursor / cols);
        if (row < st.scroll) st.scroll = row;
        else if (row >= st.scroll + st.visible) st.scroll = row - st.visible + 1;
      }
      if (I.pressed("a")) {
        I.consume("a");
        if (itemDisabled(st.items[st.cursor])) { if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("deny"); return null; }
        return { selected: st.cursor, item: st.items[st.cursor], value: st.value() };
      }
      if (st.allowCancel && I.pressed("b")) { I.consume("b"); return { cancel: true }; }
      return moved ? { moved: true } : null;
    };
    return st;
  };

  UI.menu = function (st, ctx, items, o) {
    if (items) st.items = items;
    const its = st.items;
    const n = its.length;
    const cols = o.cols || st.cols || 1;
    st.cols = cols;
    const rowH = o.rowH || 30;
    const pad = o.pad === undefined ? 14 : o.pad;
    const x = o.x, y = o.y, w = o.w;
    const colW = (w - pad * 2) / cols;
    const rowsTotal = Math.ceil(n / cols);
    const visible = o.visible || st.visible || rowsTotal;
    st.visible = o.visible || st.visible;
    const style = STYLES[o.style || "default"] || STYLES.default;
    const textCol = o.color || style.text;
    const size = o.size || "m";
    const boxH = o.h || (visible * rowH + pad * 2);
    if (o.box !== false) UI.box(ctx, x, y, w, boxH, { style: o.style, title: o.title });
    const start = st.scroll * cols;
    const end = Math.min(n, start + visible * cols);
    // ensure rects array sized; mark all off
    for (let i = 0; i < st.rects.length; i++) st.rects[i].on = false;
    for (let i = start; i < end; i++) {
      const it = its[i];
      const col = i % cols, row = Math.floor(i / cols) - st.scroll;
      const ix = x + pad + col * colW, iy = y + pad + row * rowH;
      let r = st.rects[i];
      if (!r) r = st.rects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      r.x = ix; r.y = iy; r.w = colW; r.h = rowH; r.on = true;
      const dis = itemDisabled(it);
      const sel = i === st.cursor;
      if (sel && o.highlight !== false) {
        ctx.fillStyle = o.hlColor || (style === STYLES.default ? "rgba(201,163,74,0.35)" : "rgba(255,255,255,0.12)");
        ctx.fillRect(ix, iy, colW, rowH);
      }
      if (sel) UI.pointer(ctx, ix + 4, iy + (rowH - 12) / 2, o.cursorColor);
      const icon = typeof it === "object" && it && it.icon;
      let tx = ix + 22;
      if (icon) { UI.icon(ctx, icon, tx, iy + (rowH - 16) / 2); tx += 22; }
      const col2 = dis ? "rgba(128,128,140,0.9)" : ((typeof it === "object" && it && it.color) || textCol);
      T.draw(ctx, itemLabel(it), tx, iy + (rowH - T.px(size)) / 2, { size: size, color: col2, maxWidth: colW - (tx - ix) - 6 });
      const right = typeof it === "object" && it && it.right;
      if (right !== undefined && right !== null) T.draw(ctx, String(right), ix + colW - 6, iy + (rowH - T.px(size)) / 2, { size: size, align: "right", color: col2 });
    }
    // scroll arrows
    if (st.scroll > 0) UI.icon(ctx, "arrowR", x + w - 26, y + 2, 0.7);
    if (end < n) UI.icon(ctx, "arrowR", x + w - 26, y + boxH - 14, 0.7);
    st.geo.x = x; st.geo.y = y; st.geo.w = w; st.geo.rowH = rowH; st.geo.cols = cols; st.geo.count = n;
    return boxH;
  };

  // ---- toasts ---------------------------------------------------
  const toasts = [];
  UI.toast = function (text, ms) {
    toasts.push({ text: String(text), ms: ms || 2200, t: 0 });
    if (toasts.length > 4) toasts.shift();
  };
  UI.toasts = toasts;
  UI.update = function (dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].t += dt;
      if (toasts[i].t >= toasts[i].ms) toasts.splice(i, 1);
    }
  };
  UI.draw = function (ctx) {
    if (!toasts.length) return;
    const V = MQ.View;
    const w = V.w;
    let y = V.safe.top + 14;
    for (let i = 0; i < toasts.length; i++) {
      const t = toasts[i];
      const k = t.t < 200 ? t.t / 200 : t.t > t.ms - 300 ? Math.max(0, (t.ms - t.t) / 300) : 1;
      const tw = T.width(t.text, "s") + 28;
      ctx.globalAlpha = k;
      UI.box(ctx, (w - tw) / 2, y, tw, 30, { style: "dark" });
      T.draw(ctx, t.text, w / 2, y + 8, { size: "s", align: "center", color: "#f0f0f8" });
      ctx.globalAlpha = 1;
      y += 36;
    }
  };

  // ---- misc helpers --------------------------------------------
  UI.button = function (ctx, label, x, y, w, h, o) {
    const active = o && o.active;
    ctx.fillStyle = active ? "#f4f0e0" : "rgba(60,60,90,0.9)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = "rgba(220,220,240,0.7)"; ctx.lineWidth = 2; UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 8); ctx.stroke();
    T.draw(ctx, label, x + w / 2, y + (h - 18) / 2, { size: "m", align: "center", color: active ? "#202030" : "#f0f0f8" });
  };
  UI.hit = function (o, px, py) { return U.inRect(px, py, o.x, o.y, o.w, o.h); };

  MQ.UI = UI;
})();
// ---- location banner (appended; drawn by UI.draw) ---------------
(function () {
  "use strict";
  const MQ = window.MQ, UI = MQ.UI, T = MQ.Text;
  const banner = { title: "", sub: "", t: 0, ms: 0 };
  UI.banner = function (title, sub, ms) { banner.title = title || ""; banner.sub = sub || ""; banner.t = 0; banner.ms = ms || 2600; };
  UI.bannerActive = function () { return banner.t < banner.ms; };
  const prevUpdate = UI.update, prevDraw = UI.draw;
  UI.update = function (dt) { prevUpdate(dt); if (banner.t < banner.ms) banner.t += dt; };
  UI.draw = function (ctx) {
    if (banner.t < banner.ms) {
      const V = MQ.View;
      const k = banner.t < 250 ? banner.t / 250 : banner.t > banner.ms - 400 ? Math.max(0, (banner.ms - banner.t) / 400) : 1;
      const w = Math.max(240, T.width(banner.title, "l") + 60);
      const x = V.safe.left + 24, y = V.safe.top + 24 - (1 - k) * 20;
      ctx.globalAlpha = k;
      UI.box(ctx, x, y, w, banner.sub ? 74 : 52, { style: "dark" });
      T.draw(ctx, banner.title, x + 20, y + 12, { size: "l", color: "#fff8e0", shadow: true });
      if (banner.sub) T.draw(ctx, banner.sub, x + 22, y + 46, { size: "s", color: "#c8c8e0" });
      ctx.globalAlpha = 1;
    }
    prevDraw(ctx);
  };
})();
