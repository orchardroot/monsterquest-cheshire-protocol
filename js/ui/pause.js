// =============================================================
// MonsterQuest v2 — MQ.UI.Pause (ui): the pause hub. Tabs down the
// left, a status card on the right, four quick-slots along the
// bottom, the CUTOVER counter and the SIGNAL pip when the story
// has switched them on.
// MQ.UI.Pause.open() -> Promise; MQ.UI.Pause.toggle()
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const BADGES = [
    { flag: "badge_packet", name: "PACKET", town: "Wilmslow" },
    { flag: "badge_cipher", name: "CIPHER", town: "Knutsford" },
    { flag: "badge_bear", name: "BEAR", town: "Congleton" },
    { flag: "badge_kernel", name: "KERNEL", town: "Crewe" },
    { flag: "badge_token", name: "TOKEN", town: "Nantwich" },
    { flag: "badge_daemon", name: "DAEMON", town: "Northwich" },
    { flag: "badge_proxy", name: "PROXY", town: "Runcorn" },
    { flag: "badge_admin", name: "ADMIN", town: "Warrington" }
  ];

  // tab id -> the scene (or opener) another team may provide
  const TABS = [
    { id: "party", name: "Party", icon: "heart", get: function () { return UI.Party; } },
    { id: "bag", name: "Bag", icon: "bag", get: function () { return UI.Bag; } },
    { id: "dex", name: "Dex", icon: "book", get: function () { return UI.Dex; } },
    { id: "casebook", name: "Casebook", icon: "quest", get: function () { return UI.Casebook; }, need: "casebook" },
    { id: "map", name: "Map", icon: "map", get: function () { return UI.WorldMap || UI.Map; } },
    { id: "trainer", name: "Trainer", icon: "star", get: function () { return UI.TrainerCard || UI.Trainer; } },
    { id: "perks", name: "Perks", icon: "cog", get: function () { return UI.Perks; } },
    { id: "settings", name: "Settings", icon: "cog", get: function () { return UI.Settings; } },
    { id: "save", name: "Save", icon: "save", get: function () { return UI.Save; }, params: { mode: "save" } }
  ];

  const quick = [null, null, null, null];   // item ids

  function flag(id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } }
  function itemName(id) {
    try { const it = MQ.Data && MQ.Data.items && MQ.Data.items[id]; if (it && it.name) return it.name; } catch (e) { /* ignore */ }
    return TH().titleCase(id);
  }
  function itemCount(id) { try { return (MQ.Inventory && MQ.Inventory.count) ? MQ.Inventory.count(id) : 0; } catch (e) { return 0; } }
  function party() { return (MQ.Party && MQ.Party.list) ? MQ.Party.list : []; }
  function badgeCount() { let n = 0; for (let i = 0; i < BADGES.length; i++) if (flag(BADGES[i].flag)) n++; return n; }

  // ---- save provider for the quick slots ---------------------------
  if (MQ.Save && MQ.Save.register) {
    MQ.Save.register("ui_quick", {
      save: function () { return { quick: quick.slice(0) }; },
      load: function (o) {
        for (let i = 0; i < 4; i++) quick[i] = (o && o.quick && o.quick[i]) || null;
      }
    });
  }

  const sc = { id: "pause", transparent: true, touchPad: false, focus: 0, tab: 0, slot: 0, busy: false, t: 0, st: null, items: [] };
  const HINTS = [{ btn: "a", label: "Open" }, { btn: "b", label: "Close" }, { btn: "select", label: "Quick slots" }];
  const slotRects = [{ x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 }];

  sc.rebuild = function () {
    const items = sc.items;
    items.length = 0;
    for (let i = 0; i < TABS.length; i++) {
      const tab = TABS[i];
      const available = !!tab.get();
      let locked = false;
      if (tab.need && MQ.Flags) locked = !(itemCount(tab.need) > 0 || flag(tab.need));
      items.push({ label: tab.name, icon: tab.icon, value: tab.id, disabled: !available, sub: available ? "" : "not fitted" });
      if (locked && available) items[i].disabled = false;   // the tab itself decides what to show
    }
    if (!sc.st) sc.st = UI.menuState(items, { visible: TABS.length });
    else sc.st.setItems(items);
  };

  sc.enter = function () {
    sc.focus = 0;
    sc.busy = false;
    sc.t = 0;
    sc.rebuild();
    TH().sfx("ui_open");
  };
  sc.resume = function () { sc.busy = false; sc.rebuild(); };

  sc.openTab = function (i) {
    const tab = TABS[i];
    const Theme = TH();
    if (!tab) return;
    const target = tab.get();
    if (!target) { Theme.sfx("ui_error"); Theme.toast(tab.name + " is not fitted in this build yet."); return; }
    sc.busy = true;
    sc.tab = i;
    Theme.sfx("ui_select");
    let p;
    try {
      if (typeof target.open === "function") p = target.open(tab.params || {});
      else p = MQ.Scenes.pushP(target, tab.params || {});
    } catch (e) {
      MQ.warn("[Pause] opening " + tab.id + " failed", e);
      sc.busy = false;
      Theme.toast("That screen threw a wobbly.");
      return;
    }
    if (p && p.then) p.then(function () { sc.busy = false; }, function () { sc.busy = false; });
    else sc.busy = false;
  };

  sc.useSlot = function (i) {
    const Theme = TH();
    const id = quick[i];
    if (!id) {
      sc.busy = true;
      if (!(UI.Bag && UI.Bag.open)) { sc.busy = false; Theme.toast("No bag to pick from."); return; }
      UI.Bag.open({ mode: "pick", title: "Register to quick slot " + (i + 1) }).then(function (res) {
        sc.busy = false;
        if (res && res.item) { quick[i] = res.item; Theme.sfx("ui_select"); Theme.toast(itemName(res.item) + " on slot " + (i + 1) + "."); }
      });
      return;
    }
    if (itemCount(id) <= 0) { Theme.sfx("ui_error"); Theme.toast("None left."); return; }
    let handled = false;
    try {
      if (MQ.Items && MQ.Items.use) { MQ.Items.use(id, null); handled = true; }
      else if (MQ.Inventory && MQ.Inventory.use) { MQ.Inventory.use(id, null); handled = true; }
    } catch (e) { MQ.warn("[Pause] quick use failed", e); }
    Theme.sfx(handled ? "ui_select" : "ui_error");
    Theme.toast(handled ? "Used " + itemName(id) + "." : "Nothing to use it on.");
  };
  sc.clearSlot = function (i) {
    if (!quick[i]) return;
    TH().sfx("ui_back");
    TH().toast(itemName(quick[i]) + " off the slot.");
    quick[i] = null;
  };

  sc.update = function (dt) {
    sc.t += dt;
    if (sc.busy) return;
    const I = MQ.Input, Theme = TH();
    // quick slot taps work whatever has focus
    for (let i = 0; i < 4; i++) {
      if (Theme.tapped(slotRects[i])) { sc.focus = 1; sc.slot = i; sc.useSlot(i); return; }
    }
    if (I.pressed("select")) { I.consume("select"); sc.focus = sc.focus ? 0 : 1; Theme.sfx("ui_move"); return; }
    if (sc.focus === 1) {
      if (I.pressed("left")) { I.consume("left"); sc.slot = (sc.slot + 3) % 4; Theme.sfx("ui_move"); }
      if (I.pressed("right")) { I.consume("right"); sc.slot = (sc.slot + 1) % 4; Theme.sfx("ui_move"); }
      if (I.pressed("up") || I.pressed("down")) { I.consume("up"); I.consume("down"); sc.focus = 0; Theme.sfx("ui_move"); }
      if (I.pressed("a")) { I.consume("a"); sc.useSlot(sc.slot); return; }
      if (I.pressed("run")) { I.consume("run"); sc.clearSlot(sc.slot); return; }
      if (Theme.backPressed()) { sc.focus = 0; }
      return;
    }
    const res = sc.st.update();
    if (res) {
      if (res.cancel) { Theme.sfx("ui_close"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) { sc.openTab(res.selected); return; }
    }
    if (I.pressed("start")) { I.consume("start"); Theme.sfx("ui_close"); MQ.Scenes.pop(null); return; }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };

  // ---- drawing ------------------------------------------------------
  function cutoverText() {
    const v = flag("cutover_days");
    if (v === undefined || v === false || v === null) return null;
    if (v === "stopped") return "STOPPED";
    if (typeof v === "string" && v.charAt(0) === "t") return "T-" + v.slice(1);
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return n <= 0 ? "T-0" : n + (n === 1 ? " day" : " days");
  }

  function drawStatus(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    Theme.panel(ctx, x, y, w, h, { lit: true });
    const name = (MQ.Trainer && MQ.Trainer.name) || flag("player_name") || "JIM";
    const lvl = (MQ.Trainer && MQ.Trainer.level) || 1;
    T.draw(ctx, String(name), x + 16, y + 12, { size: "l", color: C.brassLit });
    T.draw(ctx, "Trainer L" + lvl, x + w - 16, y + 16, { size: "m", align: "right", color: C.text });
    let ry = y + 46;
    // badges
    T.draw(ctx, "Badges", x + 16, ry, { size: "s", color: C.textDim });
    for (let i = 0; i < BADGES.length; i++) {
      const got = !!flag(BADGES[i].flag);
      const bx = x + 86 + i * 26;
      ctx.fillStyle = got ? C.brass : "rgba(255,255,255,0.10)";
      ctx.beginPath(); ctx.arc(bx, ry + 7, 9, 0, 6.3); ctx.fill();
      if (got) { ctx.fillStyle = "rgba(0,0,0,0.4)"; T.draw(ctx, BADGES[i].name.charAt(0), bx, ry + 1, { size: "s", align: "center", color: "#1a1508" }); }
    }
    T.draw(ctx, badgeCount() + "/8", x + w - 16, ry, { size: "s", align: "right", color: C.textDim });
    ry += 30;
    // money, playtime, place
    const money = Theme.walletOf();
    T.draw(ctx, Theme.money(money), x + 16, ry, { size: "m", color: C.brassLit });
    const pt = MQ.Save ? Theme.playtime(MQ.Save.playtime) : "";
    T.draw(ctx, pt, x + w - 16, ry, { size: "m", align: "right", color: C.textDim });
    ry += 28;
    const map = (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.map) || "";
    const chap = MQ.Flags ? MQ.Flags.chapter : 0;
    T.draw(ctx, (map ? Theme.titleCase(map) : "Somewhere in Cheshire") + (chap ? "   Chapter " + chap : ""), x + 16, ry, { size: "s", color: C.textDim, maxWidth: w - 32 });
    if (MQ.Clock && MQ.Clock.timeString) T.draw(ctx, MQ.Clock.timeString() + "  " + MQ.Clock.phase, x + w - 16, ry, { size: "s", align: "right", color: C.dim });
    ry += 26;
    // party strip
    const pl = party();
    const pw = (w - 32) / 6;
    for (let i = 0; i < 6; i++) {
      const px = x + 16 + i * pw;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      UI.roundRect(ctx, px, ry, pw - 4, 44, 5); ctx.fill();
      const mon = pl[i];
      if (!mon) continue;
      const nm = mon.nickname || String(mon.species || "").toUpperCase();
      T.draw(ctx, nm, px + 5, ry + 4, { size: "s", color: C.text, maxWidth: pw - 14 });
      const mx = (mon.stats && mon.stats.hp) || 1;
      const hp = mon.hp === undefined ? mx : mon.hp;
      Theme.hpBar(ctx, px + 5, ry + 24, pw - 14, 7, hp, mx);
      T.draw(ctx, "L" + (mon.level || 1), px + 5, ry + 32, { size: "s", color: C.dim });
      if (mon.status) { ctx.fillStyle = (Theme.STATUS[mon.status] || {}).col || C.dim; ctx.fillRect(px + pw - 12, ry + 4, 6, 6); }
    }
    ry += 54;
    // quest tracker
    let tracked = null;
    try { if (MQ.Quests && MQ.Quests.tracked) tracked = MQ.Quests.tracked(); } catch (e) { tracked = null; }
    if (tracked) {
      const label = tracked.name || tracked.title || String(tracked);
      const step = tracked.text || tracked.stageText || "";
      T.draw(ctx, "Open case: " + label, x + 16, ry, { size: "s", color: C.cyber, maxWidth: w - 32 });
      if (step) T.draw(ctx, step, x + 16, ry + 18, { size: "s", color: C.textDim, maxWidth: w - 32 });
      ry += 40;
    }
    // cats
    const tm = flag("trust_meadow"), tb = flag("trust_bigboy");
    if (tm !== undefined || tb !== undefined) {
      T.draw(ctx, "MEADOW " + (tm || 0) + "/5    BIGBOY " + (tb || 0) + "/5", x + 16, y + h - 26, { size: "s", color: C.dim });
    }
  }

  function drawCutover(ctx, x, y, w) {
    const Theme = TH(), C = Theme.C;
    const txt = cutoverText();
    if (!flag("cutover_started") && txt === null) return 0;
    const h = 52;
    const urgent = txt === "T-0" || txt === "T-3" || (txt && txt.indexOf("T-") === 0);
    const pulse = 0.6 + 0.4 * Math.sin(sc.t / 320);
    Theme.panel(ctx, x, y, w, h, { accent: urgent ? C.bad : C.warn, flat: true });
    ctx.globalAlpha = urgent ? pulse : 1;
    T.draw(ctx, "CUTOVER", x + 14, y + 8, { size: "s", color: urgent ? C.bad : C.warn });
    T.draw(ctx, txt === null ? "scheduled" : txt, x + w - 14, y + 18, { size: "l", align: "right", color: urgent ? C.bad : C.brassLit });
    ctx.globalAlpha = 1;
    T.draw(ctx, txt === "STOPPED" ? "Somebody pulled it." : "The county goes over to the new system.", x + 14, y + 30, { size: "s", color: C.textDim, maxWidth: w - 28 });
    return h + 8;
  }

  function drawSignal(ctx, x, y, w) {
    const Theme = TH(), C = Theme.C;
    if (!flag("signal_meter")) return 0;
    const h = 44;
    let level = 0;
    try { if (MQ.Signal && MQ.Signal.level !== undefined) level = MQ.Signal.level; } catch (e) { level = 0; }
    Theme.panel(ctx, x, y, w, h, { accent: C.signal, flat: true });
    const pulse = 0.45 + 0.55 * Math.abs(Math.sin(sc.t / 480));
    ctx.globalAlpha = pulse;
    ctx.fillStyle = C.signal;
    ctx.beginPath(); ctx.arc(x + 20, y + h / 2, 7, 0, 6.3); ctx.fill();
    ctx.globalAlpha = 1;
    T.draw(ctx, "SIGNAL", x + 36, y + 8, { size: "s", color: C.signal });
    T.draw(ctx, level ? "reading " + level : "carrying, faintly", x + 36, y + 24, { size: "s", color: C.textDim, maxWidth: w - 50 });
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < level ? C.signal : "rgba(124,224,255,0.18)";
      ctx.fillRect(x + w - 16 - i * 10, y + h - 14 - i * 4, 6, 8 + i * 4);
    }
    return h + 8;
  }

  function drawQuick(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const sw = (w - 3 * 8) / 4;
    for (let i = 0; i < 4; i++) {
      const sx = x + i * (sw + 8);
      const r = slotRects[i];
      r.x = sx; r.y = y; r.w = sw; r.h = h;
      const sel = sc.focus === 1 && sc.slot === i;
      ctx.fillStyle = sel ? C.sel : "rgba(255,255,255,0.05)";
      UI.roundRect(ctx, sx, y, sw, h, 7); ctx.fill();
      ctx.strokeStyle = sel ? C.selEdge : "rgba(139,124,192,0.25)";
      ctx.lineWidth = sel ? 3 : 1;
      UI.roundRect(ctx, sx + 1, y + 1, sw - 2, h - 2, 7); ctx.stroke();
      T.draw(ctx, String(i + 1), sx + 6, y + 4, { size: "s", color: C.dim });
      const id = quick[i];
      if (!id) { T.draw(ctx, "empty", sx + sw / 2, y + h / 2 - 8, { size: "s", align: "center", color: C.dim }); continue; }
      const n = itemCount(id);
      T.draw(ctx, itemName(id), sx + sw / 2, y + 12, { size: "s", align: "center", color: n > 0 ? C.text : C.dim, maxWidth: sw - 12 });
      T.draw(ctx, "x" + n, sx + sw / 2, y + h - 20, { size: "s", align: "center", color: n > 0 ? C.brassLit : C.bad });
    }
  }

  // The tab rail. One column when the screen has the height for nine
  // finger-sized rows; two when it does not (a 19.5:9 phone in landscape has
  // width to spare and no height at all), so every tab stays on screen.
  function drawTabRail(ctx, x, y, w, h, cols) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    const st = sc.st, items = sc.items, n = items.length;
    const gap = 6;
    const rows = Math.ceil(n / cols) || 1;
    const fit = Math.floor((h - (rows - 1) * gap) / rows);
    const rowH = Math.max(m.minTouch, Math.min(Math.round(46 * m.k * m.ui), fit));
    const visible = Math.max(1, Math.floor((h + gap) / (rowH + gap)));
    const maxScroll = Math.max(0, rows - visible);
    st.cols = cols;
    st.visible = visible;
    if (maxScroll) {
      const dr = (MQ.Input && MQ.Input.dragState) ? MQ.Input.dragState() : null;
      if (dr && dr.active && dr.dy && U.inRect(dr.x0, dr.y0, x, y, w, h)) {
        st.dragAcc = (st.dragAcc || 0) + dr.dy;
        while (st.dragAcc >= rowH + gap && st.scroll > 0) { st.scroll--; st.dragAcc -= rowH + gap; }
        while (st.dragAcc <= -(rowH + gap) && st.scroll < maxScroll) { st.scroll++; st.dragAcc += rowH + gap; }
      } else st.dragAcc = 0;
    } else st.scroll = 0;
    const curRow = Math.floor(st.cursor / cols);
    if (curRow < st.scroll) st.scroll = curRow;
    else if (curRow >= st.scroll + visible) st.scroll = curRow - visible + 1;
    if (st.scroll > maxScroll) st.scroll = maxScroll;
    const colW = (w - (cols - 1) * gap) / cols;
    for (let i = 0; i < st.rects.length; i++) { if (st.rects[i]) st.rects[i].on = false; }
    for (let i = 0; i < n; i++) {
      const r0 = Math.floor(i / cols), c0 = i % cols;
      if (r0 < st.scroll || r0 >= st.scroll + visible) continue;
      const ix = x + c0 * (colW + gap), iy = y + (r0 - st.scroll) * (rowH + gap);
      let r = st.rects[i];
      if (!r) r = st.rects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      r.x = ix; r.y = iy; r.w = colW; r.h = rowH; r.on = true;
      const item = items[i];
      const focused = i === st.cursor && sc.focus === 0;
      ctx.fillStyle = focused ? C.sel : "rgba(255,255,255,0.05)";
      UI.roundRect(ctx, ix, iy, colW, rowH, 7); ctx.fill();
      if (focused) { ctx.strokeStyle = C.selEdge; ctx.lineWidth = 3; UI.roundRect(ctx, ix + 1, iy + 1, colW - 2, rowH - 2, 7); ctx.stroke(); }
      if (item.icon && UI.hasIcon(item.icon)) UI.icon(ctx, item.icon, ix + 10, iy + (rowH - 16) / 2, 1);
      const mh = T.px("m");
      T.draw(ctx, item.label, ix + 34, iy + (rowH - mh) / 2, {
        size: "m", color: item.disabled ? "rgba(150,148,170,0.6)" : focused ? C.brassLit : C.text, maxWidth: colW - 46
      });
      if (item.disabled) T.draw(ctx, "-", ix + colW - 12, iy + (rowH - mh) / 2, { size: "s", align: "right", color: C.dim });
    }
    if (maxScroll) {
      const barH = Math.max(20, h * visible / rows);
      const barY = y + (h - barH) * (st.scroll / maxScroll);
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(x + w + 4, y, 4, h);
      ctx.fillStyle = C.brass; ctx.fillRect(x + w + 4, barY, 4, barH);
    }
  }

  sc.draw = function (ctx) {
    const Theme = TH(), m = Theme.m();
    Theme.scrim(ctx, 0.78);
    Theme.header(ctx, { title: "Pause", sub: "Everything you carry, know and owe.", icon: "cog", back: true });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop() - 6;
    const quickH = Math.max(Math.round(52 * m.k), Math.round(m.minTouch * 0.9));
    const n = sc.items.length || TABS.length;
    // would nine finger-sized rows fit in one column, with the quick slots
    // under them as usual?
    const oneCol = Math.floor((bot - top - quickH - 10 + 4) / (m.rowH + 4)) >= n;
    const cols = oneCol ? 1 : 2;
    // In two columns the rail wants every pixel of height it can get, so the
    // quick slots move under the status card instead of across the bottom.
    const bodyH = oneCol ? (bot - top - quickH - 10) : (bot - top);
    const tabW = oneCol ? Math.min(210 * m.k, m.cw * 0.26) : Math.min(430, m.cw * 0.44);
    drawTabRail(ctx, m.l, top, tabW, bodyH, cols);
    // right column
    const rx = m.l + tabW + 16, rw = m.r - rx;
    let ry = top;
    ry += drawCutover(ctx, rx, ry, rw);
    ry += drawSignal(ctx, rx, ry, rw);
    if (oneCol) {
      drawStatus(ctx, rx, ry, rw, top + bodyH - ry);
      drawQuick(ctx, m.l, top + bodyH + 10, m.cw - 8, quickH);
    } else {
      drawStatus(ctx, rx, ry, rw, bot - quickH - 10 - ry);
      drawQuick(ctx, rx, bot - quickH, rw, quickH);
    }
    Theme.footer(ctx, HINTS);
  };

  sc.open = function () { return MQ.Scenes.pushP(sc); };
  sc.toggle = function () {
    if (MQ.Scenes.top() === sc) { MQ.Scenes.pop(null); return null; }
    return sc.open();
  };
  sc.quick = quick;
  sc.TABS = TABS;
  sc.BADGES = BADGES;
  UI.Pause = sc;
})();
