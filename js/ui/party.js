// =============================================================
// MonsterQuest v2 — MQ.UI.Party (ui): the party list, summary
// pages, reorder, gear, nicknames and the cat reserve toggle.
// MQ.UI.Party.open({mode}) -> Promise<index|null>
//   mode 'menu'   full party management (from the pause hub)
//   mode 'select' pick one and resolve with its index
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const CATS = { meadow: true, bigboy: true };
  const artCache = {};

  // ---- data helpers (everything degrades if content is absent) -----
  function list() { return (MQ.Party && MQ.Party.list) ? MQ.Party.list : []; }
  function species(m) {
    try { return (MQ.Data && MQ.Data.species && MQ.Data.species[m.species]) || null; } catch (e) { return null; }
  }
  function speciesName(m) { const s = species(m); return (s && s.name) || String(m.species || "?").toUpperCase(); }
  function dispName(m) { return m.nickname || speciesName(m); }
  function maxHp(m) { return (m.stats && m.stats.hp) || m.maxHp || 1; }
  function types(m) { const s = species(m); return (s && s.types) || m.types || []; }
  function itemName(id) {
    try { const it = MQ.Data && MQ.Data.items && MQ.Data.items[id]; if (it && it.name) return it.name; } catch (e) { /* ignore */ }
    return TH().titleCase(id);
  }
  function moveData(id) { try { return (MQ.Data && MQ.Data.moves && MQ.Data.moves[id]) || null; } catch (e) { return null; } }
  function abilityData(id) { try { return (MQ.Data && MQ.Data.abilities && MQ.Data.abilities[id]) || null; } catch (e) { return null; } }
  function expProgress(m) {
    try { if (MQ.Data && MQ.Data.expProgress) return MQ.Data.expProgress(m); } catch (e) { /* ignore */ }
    try { if (MQ.Party && MQ.Party.expProgress) return MQ.Party.expProgress(m); } catch (e) { /* ignore */ }
    return null;
  }
  function traitsVisible() {
    try {
      if (MQ.Trainer && MQ.Trainer.level >= 20) return true;
      if (MQ.Trainer && MQ.Trainer.perks && MQ.Trainer.perks.has && MQ.Trainer.perks.has("perk_adjudicate_fingerprint")) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  function monsterArt(id) {
    if (artCache[id] !== undefined) return artCache[id];
    let cv = null;
    try {
      const MA = MQ.MonsterArt;
      if (MA) {
        if (MA.get) cv = MA.get(id);
        else if (MA.sprite) cv = MA.sprite(id);
        else if (MA.render) cv = MA.render(id);
      }
    } catch (e) { cv = null; }
    artCache[id] = cv || null;
    return artCache[id];
  }
  function drawMon(ctx, m, x, y, size) {
    const cv = monsterArt(m.species);
    if (cv && cv.width) { ctx.drawImage(cv, x, y, size, size); return; }
    const Theme = TH();
    const t = types(m)[0] || "normal";
    ctx.fillStyle = Theme.typeColour(t);
    UI.roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 6); ctx.fill();
    T.draw(ctx, speciesName(m).charAt(0), x + size / 2, y + size / 2 - 9, { size: "m", align: "center", color: "#12101c" });
  }

  // =============================================================
  // Summary scene (four pages)
  // =============================================================
  const PAGES = ["Stats", "Moves", "Dex", "Ribbons"];
  const sum = { id: "party_summary", page: 0, idx: 0, moveSt: null, mons: null };
  const SUM_HINTS = [{ btn: "b", label: "Back" }, { btn: "lr", label: "Page" }, { btn: "select", label: "Next mon" }];

  sum.enter = function (params) {
    params = params || {};
    sum.mons = params.mons || list();
    sum.idx = params.index || 0;
    sum.page = params.page || 0;
    if (!sum.moveSt) sum.moveSt = UI.menuState([], { visible: 4, cancel: false });
    TH().sfx("ui_open");
  };
  sum.mon = function () { return sum.mons[sum.idx]; };
  sum.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("left")) { I.consume("left"); sum.page = (sum.page + PAGES.length - 1) % PAGES.length; Theme.sfx("ui_move"); }
    if (I.pressed("right")) { I.consume("right"); sum.page = (sum.page + 1) % PAGES.length; Theme.sfx("ui_move"); }
    if (I.pressed("select") || I.pressed("down")) { I.consume("select"); I.consume("down"); if (sum.mons.length) { sum.idx = (sum.idx + 1) % sum.mons.length; Theme.sfx("ui_move"); } }
    if (I.pressed("up")) { I.consume("up"); if (sum.mons.length) { sum.idx = (sum.idx + sum.mons.length - 1) % sum.mons.length; Theme.sfx("ui_move"); } }
    const tab = Theme.tabTapped();
    if (tab >= 0) { sum.page = tab; Theme.sfx("ui_move"); }
    if (I.pressed("a")) { I.consume("a"); sum.page = (sum.page + 1) % PAGES.length; Theme.sfx("ui_move"); }
  };

  function statRow(ctx, label, value, best, x, y, w, col) {
    const Theme = TH(), C = Theme.C;
    T.draw(ctx, label, x, y, { size: "s", color: C.textDim });
    T.draw(ctx, String(value), x + 62, y, { size: "s", align: "right", color: C.text });
    const bw = w - 74;
    UI.gauge(ctx, x + 70, y + 3, bw, 9, U.clamp(value / (best || 200), 0, 1), { color: col || C.brass, bg: "rgba(0,0,0,0.45)", noBorder: true });
  }

  sum.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1a1730", bottom: "#101a20" });
    const mon = sum.mon();
    if (!mon) {
      Theme.header(ctx, { title: "Summary", icon: "book" });
      T.draw(ctx, "Nobody to look at.", m.cx, m.cy, { size: "m", align: "center", color: C.textDim });
      Theme.footer(ctx, SUM_HINTS);
      return;
    }
    Theme.header(ctx, {
      title: dispName(mon),
      sub: speciesName(mon) + "   Lv " + (mon.level || 1) + (mon.shiny ? "   rare palette" : ""),
      right: (sum.idx + 1) + "/" + sum.mons.length,
      icon: "book"
    });
    const top = Theme.headerBottom();
    Theme.tabStrip(ctx, PAGES, sum.page, { x: m.l, y: top, w: m.cw });
    const y0 = top + Math.round(34 * m.k) + 8;
    const bot = Theme.footerTop() - 6;
    const h = bot - y0;
    // left card: portrait + hp
    const cw = Math.min(240 * m.k, m.cw * 0.30);
    Theme.panel(ctx, m.l, y0, cw, h, { flat: true });
    drawMon(ctx, mon, m.l + (cw - 96) / 2, y0 + 14, 96);
    let ty = y0 + 122;
    const ts = types(mon);
    let tx = m.l + 12;
    for (let i = 0; i < ts.length; i++) { Theme.typeChip(ctx, ts[i], tx, ty, (cw - 32) / 2 - 4, 18); tx += (cw - 32) / 2 + 4; }
    ty += 26;
    T.draw(ctx, "HP", m.l + 12, ty, { size: "s", color: C.textDim });
    T.draw(ctx, (mon.hp === undefined ? maxHp(mon) : mon.hp) + "/" + maxHp(mon), m.l + cw - 12, ty, { size: "s", align: "right", color: C.text });
    Theme.hpBar(ctx, m.l + 12, ty + 18, cw - 24, 10, mon.hp === undefined ? maxHp(mon) : mon.hp, maxHp(mon));
    ty += 34;
    if (mon.status) Theme.statusChip(ctx, mon.status, m.l + 12, ty);
    const ep = expProgress(mon);
    if (ep) {
      T.draw(ctx, "EXP", m.l + 12, ty + 24, { size: "s", color: C.textDim });
      UI.gauge(ctx, m.l + 12, ty + 42, cw - 24, 7, U.clamp(ep.ratio || 0, 0, 1), { color: C.exp, bg: "rgba(0,0,0,0.45)", noBorder: true });
    } else {
      T.draw(ctx, "EXP " + (mon.exp || 0), m.l + 12, ty + 24, { size: "s", color: C.textDim });
    }
    if (mon.gear) T.draw(ctx, "Holds " + itemName(mon.gear), m.l + 12, y0 + h - 24, { size: "s", color: C.brassLit, maxWidth: cw - 24 });

    // right panel: the page
    const px = m.l + cw + 12, pw = m.r - px;
    Theme.panel(ctx, px, y0, pw, h, {});
    const ix = px + 16, iw = pw - 32;
    if (sum.page === 0) {
      const st = mon.stats || {};
      const sp = species(mon);
      const base = (sp && sp.base) || {};
      let sy = y0 + 18;
      const names = ["hp", "atk", "def", "spa", "spd", "spe"];
      const labels = ["HP", "Attack", "Defence", "Sp.Atk", "Sp.Def", "Speed"];
      const cols = [C.hpHigh, C.bad, C.slate, C.moor, C.canal, C.warn];
      for (let i = 0; i < names.length; i++) {
        statRow(ctx, labels[i], st[names[i]] || 0, 220, ix, sy, iw * 0.55, cols[i]);
        sy += 24;
      }
      const rx = ix + iw * 0.60;
      let ry = y0 + 18;
      const ab = abilityData(mon.ability);
      T.draw(ctx, "Ability", rx, ry, { size: "s", color: C.textDim }); ry += 18;
      T.draw(ctx, ab ? ab.name : Theme.titleCase(mon.ability || "unknown"), rx, ry, { size: "m", color: C.brassLit }); ry += 22;
      if (ab && ab.desc) { T.drawWrapped(ctx, ab.desc, rx, ry, iw * 0.40, { size: "s", color: C.textDim }); ry += 52; }
      T.draw(ctx, "Temperament", rx, ry, { size: "s", color: C.textDim }); ry += 18;
      T.draw(ctx, Theme.titleCase(mon.temperament || "even"), rx, ry, { size: "m", color: C.text }); ry += 26;
      T.draw(ctx, "Traits", rx, ry, { size: "s", color: C.textDim }); ry += 18;
      if (traitsVisible() && mon.ivs) {
        let tstr = "";
        for (let i = 0; i < names.length; i++) tstr += labels[i].slice(0, 3).toUpperCase() + " " + (mon.ivs[names[i]] || 0) + "  ";
        T.drawWrapped(ctx, tstr, rx, ry, iw * 0.40, { size: "s", color: C.text });
      } else {
        T.drawWrapped(ctx, "Not legible yet. Trainer level 20, or the Fingerprint perk.", rx, ry, iw * 0.40, { size: "s", color: C.dim });
      }
      // base stat footnote
      if (base.hp) T.draw(ctx, "Base spread " + base.hp + "/" + base.atk + "/" + base.def + "/" + base.spa + "/" + base.spd + "/" + base.spe, ix, y0 + h - 26, { size: "s", color: C.dim });
    } else if (sum.page === 1) {
      const moves = mon.moves || [];
      let my = y0 + 14;
      const rowH = Math.round(46 * m.k);
      for (let i = 0; i < 4; i++) {
        const mv = moves[i];
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        UI.roundRect(ctx, ix, my, iw, rowH - 6, 6); ctx.fill();
        if (!mv) { T.draw(ctx, "-", ix + 12, my + 10, { size: "m", color: C.dim }); my += rowH; continue; }
        const md = moveData(mv.id);
        Theme.typeChip(ctx, md ? md.type : "normal", ix + 8, my + 8, 58, 18);
        T.draw(ctx, md ? md.name : Theme.titleCase(mv.id), ix + 76, my + 8, { size: "m", color: C.text, maxWidth: iw * 0.4 });
        const pp = "PP " + (mv.pp === undefined ? "-" : mv.pp) + "/" + (mv.ppMax === undefined ? "-" : mv.ppMax);
        T.draw(ctx, pp, ix + iw - 12, my + 8, { size: "s", align: "right", color: mv.pp === 0 ? C.bad : C.textDim });
        if (md) {
          const info = (md.cat || "").toUpperCase() + "   POW " + (md.power || "-") + "   ACC " + (md.acc === null ? "--" : md.acc || "-");
          T.draw(ctx, info, ix + 76, my + 28, { size: "s", color: C.textDim });
        }
        my += rowH;
      }
      const first = moves[0] && moveData(moves[0].id);
      if (first && first.desc) T.drawWrapped(ctx, first.desc, ix, my + 6, iw, { size: "s", color: C.textDim });
    } else if (sum.page === 2) {
      const sp = species(mon);
      const dex = (sp && sp.dex) || {};
      let dy = y0 + 18;
      T.draw(ctx, dex.genus || "Unclassified", ix, dy, { size: "m", color: C.brassLit }); dy += 26;
      const facts = "Height " + (dex.height || "?") + "   Weight " + (dex.weight || "?") + "   Habitat " + Theme.titleCase((sp && sp.habitat) || "?") + "   " + Theme.titleCase((sp && sp.rarity) || "");
      T.draw(ctx, facts, ix, dy, { size: "s", color: C.textDim }); dy += 26;
      T.drawWrapped(ctx, dex.text || "No entry written yet. Catch more of them and someone will get round to it.", ix, dy, iw, { size: "m", color: C.text });
      dy += 120;
      const met = mon.metAt || {};
      T.draw(ctx, "Met at " + (met.map ? Theme.titleCase(met.map) : "somewhere") + (met.level ? " at level " + met.level : ""), ix, dy, { size: "s", color: C.textDim });
      if (sp && sp.evolutions && sp.evolutions.length) {
        const ev = sp.evolutions[0];
        T.draw(ctx, "Evolves by " + ev.method + (ev.level ? " " + ev.level : "") + (ev.item ? " (" + itemName(ev.item) + ")" : ""), ix, dy + 20, { size: "s", color: C.dim });
      }
    } else {
      let ry = y0 + 18;
      T.draw(ctx, "Friendship", ix, ry, { size: "s", color: C.textDim });
      UI.gauge(ctx, ix + 100, ry + 3, iw - 110, 10, U.clamp((mon.friendship || 0) / 255, 0, 1), { color: "#e05f8a", bg: "rgba(0,0,0,0.45)" });
      ry += 32;
      T.draw(ctx, "Ribbons", ix, ry, { size: "m", color: C.brassLit }); ry += 24;
      const ribbons = mon.ribbons || [];
      if (!ribbons.length) T.draw(ctx, "None yet. There is no shame in that.", ix, ry, { size: "s", color: C.dim });
      for (let i = 0; i < ribbons.length; i++) {
        const r = ribbons[i];
        ctx.fillStyle = "rgba(224,95,138,0.25)";
        UI.roundRect(ctx, ix, ry, iw, 26, 5); ctx.fill();
        UI.icon(ctx, "star", ix + 6, ry + 5);
        T.draw(ctx, Theme.titleCase(typeof r === "string" ? r : r.id || r.name), ix + 28, ry + 5, { size: "s", color: C.text });
        ry += 30;
        if (ry > y0 + h - 40) break;
      }
      const met = mon.metAt || {};
      if (met.ts) T.draw(ctx, "With you since " + Theme.date(met.ts), ix, y0 + h - 26, { size: "s", color: C.dim });
    }
    Theme.footer(ctx, SUM_HINTS);
  };
  sum.open = function (opts) { return MQ.Scenes.pushP(sum, opts); };
  UI.PartySummary = sum;

  // =============================================================
  // The party list
  // =============================================================
  const sc = { id: "party", mode: "menu", st: null, mons: [], reorder: -1, busy: false, title: "", filter: null };
  const HINTS_MENU = [{ btn: "a", label: "Options" }, { btn: "b", label: "Back" }, { btn: "select", label: "Summary" }];
  const HINTS_SELECT = [{ btn: "a", label: "Choose" }, { btn: "b", label: "Cancel" }];
  const HINTS_MOVE = [{ btn: "a", label: "Place" }, { btn: "b", label: "Cancel" }];

  sc.refresh = function () {
    sc.mons = list();
    if (!sc.st) sc.st = UI.menuState(sc.mons, { visible: 6 });
    else sc.st.setItems(sc.mons);
  };
  sc.enter = function (params) {
    params = params || {};
    sc.mode = params.mode || "menu";
    sc.title = params.title || (sc.mode === "select" ? "Choose a monster" : "Party");
    sc.filter = params.filter || null;
    sc.reorder = -1;
    sc.busy = false;
    sc.refresh();
    TH().sfx("ui_open");
  };
  sc.resume = function () { sc.busy = false; sc.refresh(); };

  function isCat(m) { return !!CATS[m.species]; }

  sc.actions = function (i) {
    const mon = sc.mons[i];
    if (!mon) return;
    const Theme = TH();
    const choices = [
      { label: "Summary", value: "summary" },
      { label: mon.gear ? "Take " + itemName(mon.gear) : "Give gear", value: "gear" },
      { label: "Nickname", value: "nick" },
      { label: "Move in the order", value: "move" }
    ];
    if (i !== 0) choices.push({ label: "Send to the front", value: "lead" });
    if (isCat(mon)) choices.push({ label: mon.reserve ? "Bring back out" : "Keep in reserve", value: "reserve" });
    choices.push({ label: "Back", value: null });
    sc.busy = true;
    Theme.say(dispName(mon) + " - what's needed?", { choices: choices, name: dispName(mon), position: "bottom" }).then(function (v) {
      sc.busy = false;
      if (!v) return;
      if (v === "summary") { sc.busy = true; sum.open({ mons: sc.mons, index: i }).then(function () { sc.busy = false; }); return; }
      if (v === "lead") {
        const mv = sc.mons.splice(i, 1)[0];
        sc.mons.unshift(mv);
        sc.st.setCursor(0);
        Theme.sfx("ui_select");
        Theme.toast(dispName(mv) + " leads.");
        return;
      }
      if (v === "move") { sc.reorder = i; Theme.sfx("ui_select"); return; }
      if (v === "reserve") {
        mon.reserve = !mon.reserve;
        try { if (MQ.Cats && MQ.Cats.setReserve) MQ.Cats.setReserve(mon.species, !!mon.reserve); } catch (e) { /* ignore */ }
        Theme.toast(mon.reserve ? dispName(mon) + " stays in the basket." : dispName(mon) + " is out and unimpressed.");
        Theme.sfx("cat_meow");
        return;
      }
      if (v === "nick") {
        sc.busy = true;
        UI.NameEntry.open({ title: "Nickname", subtitle: "Leave it blank to go back to " + speciesName(mon) + ".", initial: mon.nickname || "", max: 12 }).then(function (nm) {
          sc.busy = false;
          if (nm === null) return;
          mon.nickname = nm === speciesName(mon) ? "" : nm;
          Theme.toast("Noted.");
        });
        return;
      }
      if (v === "gear") {
        if (mon.gear) {
          const id = mon.gear;
          mon.gear = null;
          try { if (MQ.Inventory && MQ.Inventory.add) MQ.Inventory.add(id, 1); } catch (e) { /* ignore */ }
          Theme.sfx("ui_select");
          Theme.toast("Took the " + itemName(id) + ".");
          return;
        }
        if (!(UI.Bag && UI.Bag.open)) { Theme.toast("The bag is not to hand."); return; }
        sc.busy = true;
        UI.Bag.open({ mode: "give", target: mon, title: "Give what?" }).then(function (res) {
          sc.busy = false;
          if (!res || !res.item) return;
          const old = mon.gear;
          mon.gear = res.item;
          try {
            if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(res.item, 1);
            if (old && MQ.Inventory && MQ.Inventory.add) MQ.Inventory.add(old, 1);
          } catch (e) { /* ignore */ }
          Theme.toast(dispName(mon) + " is holding the " + itemName(res.item) + ".");
        });
        return;
      }
    });
  };

  sc.update = function () {
    if (sc.busy) return;
    const Theme = TH(), I = MQ.Input;
    const res = sc.st.update();
    if (sc.reorder >= 0) {
      if (res) {
        if (res.cancel) { sc.reorder = -1; Theme.sfx("ui_back"); return; }
        if (res.selected !== undefined) {
          const from = sc.reorder, to = res.selected;
          if (from !== to) {
            const mv = sc.mons.splice(from, 1)[0];
            sc.mons.splice(to, 0, mv);
            Theme.sfx("ui_select");
          }
          sc.reorder = -1;
          sc.st.setCursor(to);
          return;
        }
      }
      if (Theme.backPressed()) sc.reorder = -1;
      return;
    }
    if (res) {
      if (res.cancel) { Theme.sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) {
        if (sc.filter && !sc.filter(sc.mons[res.selected])) { Theme.sfx("ui_error"); Theme.toast("Not that one."); return; }
        if (sc.mode === "select") { Theme.sfx("ui_select"); MQ.Scenes.pop(res.selected); return; }
        sc.actions(res.selected);
        return;
      }
    }
    if (I.pressed("select")) {
      I.consume("select");
      if (sc.mons.length) { sc.busy = true; sum.open({ mons: sc.mons, index: sc.st.cursor }).then(function () { sc.busy = false; }); }
      return;
    }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };

  function drawRow(ctx, mon, x, y, w, h, sel, i) {
    const Theme = TH(), C = Theme.C;
    const moving = sc.reorder === i;
    const dis = sc.filter && !sc.filter(mon);
    ctx.fillStyle = moving ? "rgba(63,224,200,0.20)" : sel ? C.sel : "rgba(255,255,255,0.05)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.strokeStyle = moving ? C.cyber : sel ? C.selEdge : "rgba(139,124,192,0.25)";
    ctx.lineWidth = sel || moving ? 3 : 1;
    UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 8); ctx.stroke();
    if (i === 0) { ctx.fillStyle = C.brass; ctx.fillRect(x + 2, y + 8, 3, h - 16); }
    const s = Math.min(h - 8, 56);
    drawMon(ctx, mon, x + 8, y + (h - s) / 2, s);
    const tx = x + 8 + s + 10;
    const fainted = (mon.hp !== undefined && mon.hp <= 0);
    T.draw(ctx, dispName(mon), tx, y + 8, { size: "m", color: dis ? C.dim : fainted ? C.bad : C.text, maxWidth: w * 0.36 });
    T.draw(ctx, "Lv " + (mon.level || 1), tx, y + h - 26, { size: "s", color: C.textDim });
    if (mon.reserve) T.draw(ctx, "reserve", tx + 60, y + h - 26, { size: "s", color: C.cyber });
    const bx = x + w * 0.52, bw = w * 0.36;
    const hp = mon.hp === undefined ? maxHp(mon) : mon.hp;
    T.draw(ctx, hp + "/" + maxHp(mon), bx + bw, y + 8, { size: "s", align: "right", color: C.textDim });
    Theme.hpBar(ctx, bx, y + 28, bw, 9, hp, maxHp(mon));
    if (mon.status) Theme.statusChip(ctx, mon.status, bx, y + h - 26);
    if (mon.gear) UI.icon(ctx, "shield", x + w - 26, y + h - 26, 0.9);
    if (mon.overdrive >= 100) { ctx.fillStyle = C.cyber; ctx.fillRect(x + w - 8, y + 8, 4, h - 16); }
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#191833", bottom: "#12201c" });
    Theme.header(ctx, {
      title: sc.reorder >= 0 ? "Where does " + dispName(sc.mons[sc.reorder]) + " go?" : sc.title,
      sub: sc.mode === "select" ? "Tap a row to choose." : "Tap a row for options, hold the order together.",
      icon: "heart",
      right: sc.mons.length + "/6"
    });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop() - 6;
    const h = bot - top;
    const rowH = Math.min(Math.round(74 * m.k), Math.floor((h - 5 * 6) / 6));
    Theme.list(sc.st, ctx, {
      x: m.l, y: top, w: m.cw - 8, h: h, rowH: rowH, gap: 6,
      empty: "Nobody yet. Alder Labs will see to that.",
      render: drawRow
    });
    Theme.footer(ctx, sc.reorder >= 0 ? HINTS_MOVE : sc.mode === "select" ? HINTS_SELECT : HINTS_MENU);
  };

  sc.open = function (opts) { return MQ.Scenes.pushP(sc, opts || {}); };
  UI.Party = sc;
})();
