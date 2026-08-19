// =============================================================
// MonsterQuest v2 — MQ.UI.Bag (ui): pockets, use/give/toss, key
// items, and the Skill Card teaching flow with move replacement.
// Also publishes MQ.UI.Quantity and MQ.UI.MoveReplace (shared).
// MQ.UI.Bag.open({mode}) -> Promise<{item, n}|null>
//   mode 'field' | 'battle' | 'give' | 'sell' | 'pick'
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  // ---- pockets (kinds from ROSTER §4) ------------------------------
  const POCKETS = [
    { id: "items", name: "Items", kinds: ["consumable", "evo", "misc", ""], icon: "bag" },
    { id: "medicine", name: "Medicine", kinds: ["heal", "cure"], icon: "heart" },
    { id: "capsules", name: "Capsules", kinds: ["capsule"], icon: "ball" },
    { id: "gear", name: "Gear", kinds: ["gear", "held_consumable"], icon: "shield" },
    { id: "cards", name: "Cards", kinds: ["tm"], icon: "book" },
    { id: "brewing", name: "Brewing", kinds: ["ingredient", "brew"], icon: "fish" },
    { id: "keys", name: "Keys", kinds: ["key", "rod"], icon: "quest" }
  ];
  function pocketOf(kind) {
    for (let i = 0; i < POCKETS.length; i++) if (POCKETS[i].kinds.indexOf(kind || "") >= 0) return i;
    return 0;
  }
  function itemData(id) { try { return (MQ.Data && MQ.Data.items && MQ.Data.items[id]) || null; } catch (e) { return null; } }
  function itemName(id) { const it = itemData(id); return (it && it.name) || TH().titleCase(id); }
  function moveData(id) { try { return (MQ.Data && MQ.Data.moves && MQ.Data.moves[id]) || null; } catch (e) { return null; } }

  // Normalise whatever the inventory offers into [{id, n}]
  function entries() {
    const out = [];
    const inv = MQ.Inventory;
    if (!inv) return out;
    let raw = null;
    try {
      if (inv.list && typeof inv.list === "function") raw = inv.list();
      else if (inv.entries && typeof inv.entries === "function") raw = inv.entries();
      else if (inv.all && typeof inv.all === "function") raw = inv.all();
      else if (inv.items) raw = inv.items;
      else if (inv.bag) raw = inv.bag;
    } catch (e) { raw = null; }
    if (!raw) return out;
    if (Object.prototype.toString.call(raw) === "[object Array]") {
      for (let i = 0; i < raw.length; i++) {
        const e = raw[i];
        if (!e) continue;
        if (typeof e === "string") out.push({ id: e, n: 1 });
        else out.push({ id: e.id, n: e.n === undefined ? (e.count === undefined ? 1 : e.count) : e.n });
      }
    } else if (raw instanceof Map) {
      raw.forEach(function (n, id) { out.push({ id: id, n: n }); });
    } else if (typeof raw === "object") {
      const ks = Object.keys(raw);
      for (let i = 0; i < ks.length; i++) if (raw[ks[i]] > 0) out.push({ id: ks[i], n: raw[ks[i]] });
    }
    return out;
  }

  // =============================================================
  // Quantity picker (shared with the shop)
  // =============================================================
  const qty = { id: "quantity", n: 1, max: 99, min: 1, price: 0, label: "", sub: "", unit: "" };
  qty.enter = function (p) {
    p = p || {};
    qty.max = Math.max(1, p.max || 1);
    qty.min = p.min || 1;
    qty.n = U.clamp(p.start || qty.min, qty.min, qty.max);
    qty.price = p.price || 0;
    qty.label = p.label || "How many?";
    qty.sub = p.sub || "";
    qty.unit = p.unit || "cr";
    TH().sfx("ui_open");
  };
  qty.rects = { minus: { x: 0, y: 0, w: 0, h: 0 }, plus: { x: 0, y: 0, w: 0, h: 0 }, ok: { x: 0, y: 0, w: 0, h: 0 }, cancel: { x: 0, y: 0, w: 0, h: 0 } };
  qty.step = function (d) {
    const before = qty.n;
    qty.n = U.clamp(qty.n + d, qty.min, qty.max);
    if (qty.n !== before) TH().sfx("ui_move"); else TH().sfx("ui_error");
  };
  qty.update = function () {
    const I = MQ.Input, Theme = TH();
    if (I.pressed("up")) { I.consume("up"); qty.step(1); }
    if (I.pressed("down")) { I.consume("down"); qty.step(-1); }
    if (I.pressed("right")) { I.consume("right"); qty.step(10); }
    if (I.pressed("left")) { I.consume("left"); qty.step(-10); }
    if (Theme.tapped(qty.rects.plus)) qty.step(1);
    else if (Theme.tapped(qty.rects.minus)) qty.step(-1);
    else if (Theme.tapped(qty.rects.ok)) { Theme.sfx("ui_select"); MQ.Scenes.pop(qty.n); return; }
    else if (Theme.tapped(qty.rects.cancel)) { Theme.sfx("ui_back"); MQ.Scenes.pop(null); return; }
    if (I.pressed("a")) { I.consume("a"); Theme.sfx("ui_select"); MQ.Scenes.pop(qty.n); return; }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };
  qty.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.scrim(ctx, 0.6);
    const w = Math.min(460, m.cw * 0.8), h = 210;
    const x = m.cx - w / 2, y = m.cy - h / 2;
    Theme.panel(ctx, x, y, w, h, { lit: true, accent: C.brass });
    T.draw(ctx, qty.label, x + w / 2, y + 16, { size: "m", align: "center", color: C.brassLit, maxWidth: w - 24 });
    if (qty.sub) T.draw(ctx, qty.sub, x + w / 2, y + 40, { size: "s", align: "center", color: C.textDim, maxWidth: w - 24 });
    const by = y + 70, bw = 54, bh = 54;
    qty.rects.minus.x = x + 30; qty.rects.minus.y = by; qty.rects.minus.w = bw; qty.rects.minus.h = bh;
    qty.rects.plus.x = x + w - 30 - bw; qty.rects.plus.y = by; qty.rects.plus.w = bw; qty.rects.plus.h = bh;
    Theme.button(ctx, "-", qty.rects.minus.x, by, bw, bh, { size: "l" });
    Theme.button(ctx, "+", qty.rects.plus.x, by, bw, bh, { size: "l" });
    T.draw(ctx, "x" + qty.n, x + w / 2, by + 12, { size: "l", align: "center", color: C.text });
    if (qty.price) T.draw(ctx, (qty.price * qty.n) + qty.unit, x + w / 2, by + 40, { size: "m", align: "center", color: C.brassLit });
    const oy = y + h - 58, ow = (w - 80) / 2;
    qty.rects.ok.x = x + 30; qty.rects.ok.y = oy; qty.rects.ok.w = ow; qty.rects.ok.h = 42;
    qty.rects.cancel.x = x + w - 30 - ow; qty.rects.cancel.y = oy; qty.rects.cancel.w = ow; qty.rects.cancel.h = 42;
    Theme.button(ctx, "Confirm", qty.rects.ok.x, oy, ow, 42, { active: true });
    Theme.button(ctx, "Cancel", qty.rects.cancel.x, oy, ow, 42, {});
    Theme.footer(ctx, [{ btn: "a", label: "Confirm" }, { btn: "b", label: "Cancel" }, { btn: "dir", label: "+/-  (x10 sideways)" }]);
  };
  qty.open = function (o) { return MQ.Scenes.pushP(qty, o || {}); };
  UI.Quantity = qty;

  // =============================================================
  // Move replacement (Skill Cards, level-up learning)
  // MQ.UI.MoveReplace.open({mon, moveId}) -> Promise<index|null>
  // =============================================================
  const rep = { id: "move_replace", mon: null, moveId: null, st: null };
  rep.enter = function (p) {
    p = p || {};
    rep.mon = p.mon; rep.moveId = p.moveId;
    const items = [];
    const moves = (rep.mon && rep.mon.moves) || [];
    for (let i = 0; i < moves.length; i++) items.push({ label: (moveData(moves[i].id) || {}).name || moves[i].id, value: i });
    items.push({ label: "Don't learn it", value: -1, color: TH().C.textDim });
    if (!rep.st) rep.st = UI.menuState(items, { visible: 5 });
    else rep.st.setItems(items);
    rep.st.setCursor(0);
    TH().sfx("ui_open");
  };
  rep.update = function () {
    const res = rep.st.update();
    if (res) {
      if (res.cancel) { TH().sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) {
        const v = rep.st.items[res.selected].value;
        TH().sfx("ui_select");
        MQ.Scenes.pop(v < 0 ? null : v);
        return;
      }
    }
    if (TH().backPressed()) MQ.Scenes.pop(null);
  };
  function moveCard(ctx, id, x, y, w, h, sel, badge) {
    const Theme = TH(), C = Theme.C;
    const md = moveData(id) || {};
    ctx.fillStyle = sel ? C.sel : "rgba(255,255,255,0.05)";
    UI.roundRect(ctx, x, y, w, h, 7); ctx.fill();
    if (sel) { ctx.strokeStyle = C.selEdge; ctx.lineWidth = 2; UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 7); ctx.stroke(); }
    Theme.typeChip(ctx, md.type || "normal", x + 8, y + 8, 56, 18);
    T.draw(ctx, md.name || TH().titleCase(id), x + 72, y + 8, { size: "m", color: C.text, maxWidth: w - 150 });
    T.draw(ctx, (md.cat || "").toUpperCase() + "  POW " + (md.power || "-") + "  ACC " + (md.acc === null ? "--" : md.acc || "-") + "  PP " + (md.pp || "-"), x + 72, y + 30, { size: "s", color: C.textDim });
    if (badge) T.draw(ctx, badge, x + w - 10, y + 8, { size: "s", align: "right", color: C.cyber });
  }
  rep.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1c1730", bottom: "#101c22" });
    const name = rep.mon ? (rep.mon.nickname || String(rep.mon.species || "").toUpperCase()) : "";
    Theme.header(ctx, { title: "Teach " + ((moveData(rep.moveId) || {}).name || rep.moveId), sub: name + " already knows four. Something has to go.", icon: "book" });
    const top = Theme.headerBottom();
    moveCard(ctx, rep.moveId, m.l, top, m.cw - 8, 54, false, "NEW");
    const y0 = top + 66;
    const listH = Theme.footerTop() - y0 - 6;
    Theme.list(rep.st, ctx, {
      x: m.l, y: y0, w: m.cw - 8, h: listH, rowH: 54, gap: 6,
      render: function (c, item, x, y, w, h, sel) {
        if (item.value < 0) { Theme.row(c, item, x, y, w, h, sel); return; }
        moveCard(c, rep.mon.moves[item.value].id, x, y, w, h, sel, "PP " + rep.mon.moves[item.value].pp + "/" + rep.mon.moves[item.value].ppMax);
      }
    });
    const md = moveData(rep.moveId);
    if (md && md.desc) T.draw(ctx, md.desc, m.l, Theme.footerTop() - 4, { size: "s", color: C.textDim, maxWidth: m.cw });
    Theme.footer(ctx, [{ btn: "a", label: "Forget this one" }, { btn: "b", label: "Cancel" }]);
  };
  rep.open = function (o) { return MQ.Scenes.pushP(rep, o); };
  UI.MoveReplace = rep;

  // =============================================================
  // The bag
  // =============================================================
  const sc = { id: "bag", mode: "field", pocket: 0, st: null, rows: [], busy: false, target: null, title: "", cursorPer: [0, 0, 0, 0, 0, 0, 0] };
  const HINTS_FIELD = [{ btn: "a", label: "Options" }, { btn: "b", label: "Back" }, { btn: "lr", label: "Pocket" }];
  const HINTS_PICK = [{ btn: "a", label: "Choose" }, { btn: "b", label: "Cancel" }, { btn: "lr", label: "Pocket" }];

  function allowed(id) {
    const it = itemData(id);
    const kind = it ? it.kind : "";
    if (sc.mode === "give") return kind === "gear" || kind === "held_consumable";
    if (sc.mode === "sell") return !it || it.sellable !== false;
    if (sc.mode === "battle") return !it || it.usableInBattle !== false;
    return true;
  }

  sc.rebuild = function () {
    const all = entries();
    const rows = sc.rows;
    rows.length = 0;
    const pk = POCKETS[sc.pocket];
    for (let i = 0; i < all.length; i++) {
      const e = all[i];
      const it = itemData(e.id);
      const kind = it ? it.kind : "";
      if (pocketOf(kind) !== sc.pocket) continue;
      if (!allowed(e.id)) continue;
      rows.push({ id: e.id, n: e.n, label: itemName(e.id), right: pk.id === "keys" ? "" : "x" + e.n, item: it });
    }
    rows.sort(function (a, b) { return a.label < b.label ? -1 : a.label > b.label ? 1 : 0; });
    if (!sc.st) sc.st = UI.menuState(rows, { visible: 8 });
    else sc.st.setItems(rows);
    sc.st.setCursor(Math.min(sc.cursorPer[sc.pocket] || 0, Math.max(0, rows.length - 1)));
  };
  sc.setPocket = function (i) {
    sc.cursorPer[sc.pocket] = sc.st ? sc.st.cursor : 0;
    sc.pocket = (i + POCKETS.length) % POCKETS.length;
    sc.rebuild();
    TH().sfx("ui_move");
  };
  sc.enter = function (params) {
    params = params || {};
    sc.mode = params.mode || "field";
    sc.target = params.target || null;
    sc.title = params.title || (sc.mode === "sell" ? "Sell what?" : sc.mode === "give" ? "Give what?" : "Bag");
    sc.busy = false;
    if (params.pocket !== undefined) sc.pocket = params.pocket;
    else if (sc.mode === "give") sc.pocket = pocketOf("gear");
    else if (sc.mode === "battle") sc.pocket = pocketOf("heal");
    sc.rebuild();
    TH().sfx("ui_open");
  };
  sc.resume = function () { sc.busy = false; sc.rebuild(); };

  // ---- Skill Card teaching ----------------------------------------
  function teach(row) {
    const Theme = TH();
    const it = row.item || {};
    const moveId = it.teaches || String(row.id).replace(/^tm_/, "");
    const md = moveData(moveId);
    sc.busy = true;
    UI.Party.open({ mode: "select", title: "Teach " + ((md && md.name) || Theme.titleCase(moveId)) + " to whom?" }).then(function (idx) {
      if (idx === null || idx === undefined) { sc.busy = false; return; }
      const mon = (MQ.Party && MQ.Party.list) ? MQ.Party.list[idx] : null;
      if (!mon) { sc.busy = false; return; }
      const known = mon.moves || (mon.moves = []);
      for (let i = 0; i < known.length; i++) {
        if (known[i].id === moveId) {
          sc.busy = false;
          Theme.sfx("ui_error");
          Theme.say([(mon.nickname || mon.species) + " already knows that one."], { name: "Skill Card" });
          return;
        }
      }
      const learn = function (slot) {
        const entry = { id: moveId, pp: (md && md.pp) || 15, ppMax: (md && md.pp) || 15 };
        if (slot === null) known.push(entry); else known[slot] = entry;
        try { if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, 1); } catch (e) { /* ignore */ }
        Theme.sfx("ui_select");
        Theme.toast((mon.nickname || String(mon.species).toUpperCase()) + " learned " + ((md && md.name) || moveId) + ".");
        sc.busy = false;
        sc.rebuild();
      };
      if (known.length < 4) { learn(null); return; }
      UI.MoveReplace.open({ mon: mon, moveId: moveId }).then(function (slot) {
        if (slot === null || slot === undefined) { sc.busy = false; Theme.toast("Left as it was."); return; }
        const old = known[slot].id;
        Theme.confirm("Forget " + ((moveData(old) || {}).name || old) + " for " + ((md && md.name) || moveId) + "?").then(function (yes) {
          if (yes) learn(slot); else { sc.busy = false; }
        });
      });
    });
  }

  // ---- item actions -------------------------------------------------
  function useInField(row) {
    const Theme = TH();
    const it = row.item || {};
    if (it.kind === "tm") { teach(row); return; }
    if (it.kind === "key" || it.kind === "rod") {
      Theme.say([it.desc || "You look at it. It looks back, in its way."], { name: itemName(row.id) });
      return;
    }
    if (it.usableInField === false) { Theme.sfx("ui_error"); Theme.toast("Not out here."); return; }
    // hand off to whoever owns item effects; otherwise report honestly
    sc.busy = true;
    const finish = function (msg) {
      sc.busy = false;
      sc.rebuild();
      if (msg) Theme.toast(msg);
    };
    const needsTarget = it.kind === "heal" || it.kind === "cure" || it.kind === "evo";
    if (needsTarget) {
      UI.Party.open({ mode: "select", title: "Use " + itemName(row.id) + " on whom?" }).then(function (idx) {
        if (idx === null || idx === undefined) { sc.busy = false; return; }
        const mon = (MQ.Party && MQ.Party.list) ? MQ.Party.list[idx] : null;
        let handled = false;
        try {
          if (MQ.Items && MQ.Items.use) { MQ.Items.use(row.id, mon); handled = true; }
          else if (MQ.Inventory && MQ.Inventory.use) { MQ.Inventory.use(row.id, mon); handled = true; }
        } catch (e) { MQ.warn("[Bag] item use failed", e); }
        if (!handled && mon && it.kind === "heal" && it.amount) {
          const mx = (mon.stats && mon.stats.hp) || 1;
          const before = mon.hp === undefined ? mx : mon.hp;
          mon.hp = Math.min(mx, before + it.amount);
          try { if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, 1); } catch (e2) { /* ignore */ }
          handled = true;
          finish((mon.nickname || mon.species) + " recovered " + (mon.hp - before) + " HP.");
          return;
        }
        if (!handled && mon && it.kind === "cure") {
          if (mon.status) { mon.status = null; try { if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, 1); } catch (e3) { /* ignore */ } finish("Cleared up."); return; }
          finish("Nothing to cure.");
          return;
        }
        finish(handled ? null : "Nothing happened. Yet.");
      });
      return;
    }
    let handled = false;
    try {
      if (MQ.Items && MQ.Items.use) { MQ.Items.use(row.id, null); handled = true; }
      else if (MQ.Inventory && MQ.Inventory.use) { MQ.Inventory.use(row.id, null); handled = true; }
    } catch (e) { MQ.warn("[Bag] item use failed", e); }
    finish(handled ? null : "Nothing happened. Yet.");
  }

  function toss(row) {
    const Theme = TH();
    const it = row.item || {};
    if (it.kind === "key" || it.kind === "rod") { Theme.sfx("ui_error"); Theme.toast("Better keep that."); return; }
    sc.busy = true;
    UI.Quantity.open({ max: row.n, label: "Throw away how many " + row.label + "?", sub: "There is no bin between here and Bollington." }).then(function (n) {
      if (!n) { sc.busy = false; return; }
      return Theme.confirm("Throw away " + n + " " + row.label + "?").then(function (yes) {
        sc.busy = false;
        if (!yes) return;
        try { if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, n); } catch (e) { /* ignore */ }
        Theme.sfx("ui_back");
        Theme.toast("Gone.");
        sc.rebuild();
      });
    });
  }

  function give(row) {
    const Theme = TH();
    sc.busy = true;
    UI.Party.open({ mode: "select", title: "Give " + row.label + " to whom?" }).then(function (idx) {
      sc.busy = false;
      if (idx === null || idx === undefined) return;
      const mon = (MQ.Party && MQ.Party.list) ? MQ.Party.list[idx] : null;
      if (!mon) return;
      const old = mon.gear;
      mon.gear = row.id;
      try {
        if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, 1);
        if (old && MQ.Inventory && MQ.Inventory.add) MQ.Inventory.add(old, 1);
      } catch (e) { /* ignore */ }
      Theme.sfx("ui_select");
      Theme.toast((mon.nickname || String(mon.species).toUpperCase()) + " is holding the " + row.label + (old ? ", and handed back the " + itemName(old) : "") + ".");
      sc.rebuild();
    });
  }

  sc.actions = function (i) {
    const row = sc.rows[i];
    if (!row) return;
    const Theme = TH();
    const it = row.item || {};
    if (sc.mode !== "field") { MQ.Scenes.pop({ item: row.id, n: 1, data: it }); return; }
    const choices = [];
    if (it.kind === "tm") choices.push({ label: "Teach it", value: "use" });
    else if (it.kind !== "key" && it.kind !== "rod") choices.push({ label: "Use", value: "use" });
    else choices.push({ label: "Look at it", value: "use" });
    if (it.kind === "gear" || it.kind === "held_consumable") choices.push({ label: "Give to a monster", value: "give" });
    choices.push({ label: "What is it?", value: "info" });
    if (it.kind !== "key" && it.kind !== "rod") choices.push({ label: "Throw away", value: "toss" });
    choices.push({ label: "Back", value: null });
    sc.busy = true;
    Theme.say(row.label + (row.n > 1 ? " x" + row.n : ""), { choices: choices, name: "Bag" }).then(function (v) {
      sc.busy = false;
      if (!v) return;
      if (v === "use") useInField(row);
      else if (v === "give") give(row);
      else if (v === "toss") toss(row);
      else if (v === "info") Theme.say([it.desc || "No note has been written about this one."], { name: row.label });
    });
  };

  sc.update = function () {
    if (sc.busy) return;
    const I = MQ.Input, Theme = TH();
    if (I.pressed("select")) { I.consume("select"); sc.setPocket(sc.pocket + 1); return; }
    const tab = Theme.tabTapped();
    if (tab >= 0) { sc.setPocket(tab); return; }
    // left/right change pocket (the list is single-column, so they are free)
    if (I.pressed("left")) { I.consume("left"); sc.setPocket(sc.pocket - 1); return; }
    if (I.pressed("right")) { I.consume("right"); sc.setPocket(sc.pocket + 1); return; }
    const res = sc.st.update();
    if (res) {
      if (res.cancel) { Theme.sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) { sc.actions(res.selected); return; }
    }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1d1a2e", bottom: "#141c18" });
    const money = Theme.walletOf();
    Theme.header(ctx, { title: sc.title, sub: POCKETS[sc.pocket].name, icon: "bag", right: Theme.money(money) });
    const top = Theme.headerBottom();
    const labels = [];
    for (let i = 0; i < POCKETS.length; i++) labels.push(POCKETS[i].name);
    const th = Theme.tabStrip(ctx, labels, sc.pocket, { x: m.l, y: top, w: m.cw });
    const y0 = top + th + 8;
    const bot = Theme.footerTop() - 6;
    const descH = 54;
    const listW = m.cw * 0.60;
    Theme.list(sc.st, ctx, {
      x: m.l, y: y0, w: listW, h: bot - y0, rowH: Math.round(40 * m.k), gap: 4,
      empty: sc.mode === "give" ? "No gear to hand." : "This pocket is empty."
    });
    // detail panel
    const px = m.l + listW + 20, pw = m.r - px;
    const row = sc.rows[sc.st.cursor];
    Theme.panel(ctx, px, y0, pw, bot - y0, { flat: true });
    if (row) {
      const it = row.item || {};
      T.draw(ctx, row.label, px + 14, y0 + 14, { size: "m", color: C.brassLit, maxWidth: pw - 28 });
      T.draw(ctx, Theme.titleCase(it.kind || "item") + (row.n > 1 ? "   x" + row.n : ""), px + 14, y0 + 38, { size: "s", color: C.textDim });
      T.drawWrapped(ctx, it.desc || "No note written.", px + 14, y0 + 62, pw - 28, { size: "s", color: C.text });
      if (it.price) T.draw(ctx, "Shop price " + it.price + "cr" + (it.sellable === false ? " (not sold on)" : "  |  sells for " + Math.floor(it.price / 2) + "cr"), px + 14, y0 + (bot - y0) - 26, { size: "s", color: C.dim, maxWidth: pw - 28 });
      if (it.kind === "tm") {
        const mv = moveData(it.teaches || String(row.id).replace(/^tm_/, ""));
        if (mv) T.draw(ctx, "Teaches " + mv.name + "  (" + mv.type + ", " + (mv.cat || "") + ")", px + 14, y0 + (bot - y0) - 48, { size: "s", color: C.cyber, maxWidth: pw - 28 });
      }
    } else {
      T.draw(ctx, "Nothing selected.", px + 14, y0 + 14, { size: "s", color: C.dim });
    }
    Theme.footer(ctx, sc.mode === "field" ? HINTS_FIELD : HINTS_PICK);
  };

  sc.open = function (opts) { return MQ.Scenes.pushP(sc, opts || {}); };
  sc.POCKETS = POCKETS;
  sc.entries = entries;
  UI.Bag = sc;
})();
