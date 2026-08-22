// =============================================================
// MonsterQuest v2 — MQ.UI.Dex (ui-b): the field dex.
//   MQ.UI.Dex.open({filter})        grid of icons, seen/caught states
//   MQ.UI.Dex.entry(speciesId)      straight to one entry page
//   MQ.UI.DexEntry.open({species, list, index, page})
//   MQ.UI.DexFilter.open({filter})  type / habitat / region / status
//   MQ.UI.DexMilestones.open()      SIDE-CONTENT §2.8 completion
// Everything degrades: with no MQ.Trainer nothing is seen, with no
// MQ.MonsterArt the icons are typed placeholders, with no MQ.Audio
// the cries are silent. Theme is read at runtime, never at parse.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const Dex = { id: "dex", touchPad: false };
  const iconCache = {};

  // ---- data access, all optional ----------------------------------
  function speciesDef(id) { try { return (MQ.Data && MQ.Data.species && MQ.Data.species[id]) || null; } catch (e) { return null; } }
  function order() {
    try {
      if (MQ.Data && MQ.Data.dexOrder && MQ.Data.dexOrder.length) return MQ.Data.dexOrder;
      const out = [];
      if (MQ.Data && MQ.Data.each) MQ.Data.each("species", function (sp, id) { if (!sp.dexHidden) out.push(id); });
      return out;
    } catch (e) { return []; }
  }
  function entryOf(id) { try { return (MQ.Trainer && MQ.Trainer.dexEntry) ? MQ.Trainer.dexEntry(id) : null; } catch (e) { return null; } }
  function seen(id) { const e = entryOf(id); return !!(e && e.seen); }
  function caught(id) { const e = entryOf(id); return !!(e && e.caught); }
  // Recounted at most a few times a second and into the same object, so the
  // grid can ask for it every frame without allocating.
  const countCache = { seen: 0, caught: 0, total: 0, at: -9999 };
  function counts() {
    const now = (MQ.Loop && MQ.Loop.time) || 0;
    if (countCache.at >= 0 && now - countCache.at < 300) return countCache;
    countCache.at = now;
    let s = 0, c = 0, total = 0;
    const ids = order();
    for (let i = 0; i < ids.length; i++) { total++; if (seen(ids[i])) s++; if (caught(ids[i])) c++; }
    countCache.seen = s; countCache.caught = c; countCache.total = total;
    return countCache;
  }
  Dex.invalidateCounts = function () { countCache.at = -9999; };
  function nameOf(id) { const sp = speciesDef(id); return (sp && sp.name) || String(id).toUpperCase(); }
  function numOf(id) { const sp = speciesDef(id); return (sp && sp.num) || (order().indexOf(id) + 1); }
  function typesOf(id) { const sp = speciesDef(id); return (sp && sp.types) || []; }
  function pad3(n) { return (n < 10 ? "00" : n < 100 ? "0" : "") + n; }
  function cry(id) {
    try { if (MQ.Audio && MQ.Audio.cry) MQ.Audio.cry(id); } catch (e) { /* audio is optional */ }
  }

  function icon(id, shiny) {
    const key = id + (shiny ? "|s" : "");
    if (iconCache[key] !== undefined) return iconCache[key];
    let cv = null;
    try {
      const MA = MQ.MonsterArt;
      if (MA && MA.sprite) cv = MA.sprite(id, "icon", shiny ? { shiny: true } : null);
      else if (MA && MA.get) cv = MA.get(id);
    } catch (e) { cv = null; }
    iconCache[key] = cv || null;
    return iconCache[key];
  }
  // Draws a dex icon in a box: full colour when caught, silhouette when
  // only sighted, a question mark when the player has never met it.
  function drawIcon(ctx, id, x, y, size, state) {
    const Theme = TH(), C = Theme.C;
    if (state === 0) {
      T.draw(ctx, "?", x + size / 2, y + size / 2 - 12, { size: "l", align: "center", color: "rgba(150,148,180,0.45)" });
      return;
    }
    const cv = icon(id);
    if (cv && cv.width) {
      if (state === 1) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(cv, x, y, size, size);
        ctx.fillStyle = "rgba(10,8,20,0.82)";
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillRect(x, y, size, size);
        ctx.restore();
      } else ctx.drawImage(cv, x, y, size, size);
      return;
    }
    const t = typesOf(id)[0] || "normal";
    ctx.fillStyle = state === 1 ? "rgba(40,36,60,0.9)" : Theme.typeColour(t);
    UI.roundRect(ctx, x + 3, y + 3, size - 6, size - 6, 5); ctx.fill();
    T.draw(ctx, state === 1 ? "?" : nameOf(id).charAt(0), x + size / 2, y + size / 2 - 9, { size: "m", align: "center", color: state === 1 ? C.textDim : "#12101c" });
  }
  Dex.drawIcon = drawIcon;

  // =============================================================
  // Where-to-find: species → the maps whose tables list it.
  // Built once per world revision; the dex reads it, nobody else does.
  // =============================================================
  const where = { built: 0, index: {}, regions: {} };
  function buildWhere() {
    const nMaps = (MQ.World && MQ.World.ids) ? MQ.World.ids().length : 0;
    const nTables = (MQ.Data && MQ.Data.encounters) ? Object.keys(MQ.Data.encounters).length : 0;
    const stamp = nMaps * 1000 + nTables;
    if (where.built === stamp) return where;
    where.built = stamp; where.index = {}; where.regions = {};
    if (!MQ.World || !MQ.World.each || !MQ.Data || !MQ.Data.encounters) return where;
    MQ.World.each(function (map, id) {
      const tables = [];
      const enc = map.encounters;
      if (enc) {
        const zs = Object.keys(enc);
        for (let i = 0; i < zs.length; i++) if (enc[zs[i]]) tables.push({ zone: zs[i], table: enc[zs[i]] });
      }
      if (map.fishing) tables.push({ zone: "fishing", table: map.fishing });
      for (let i = 0; i < tables.length; i++) {
        const tb = MQ.Data.encounters[tables[i].table];
        if (!tb || !tb.table) continue;
        const rows = tb.table;
        let wsum = 0;
        for (let r = 0; r < rows.length; r++) wsum += (rows[r].w || 1);
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row.species) continue;
          const list = where.index[row.species] || (where.index[row.species] = []);
          list.push({
            map: id, name: map.name || id, region: map.region || "", zone: tables[i].zone,
            table: tables[i].table, min: row.min || 1, max: row.max || row.min || 1,
            share: wsum ? (row.w || 1) / wsum : 0, rate: tb.rate || 0,
            time: row.time || null, weather: row.weather || null, rare: !!row.rare
          });
          if (map.region) {
            const rr = where.regions[row.species] || (where.regions[row.species] = {});
            rr[map.region] = true;
          }
        }
      }
    });
    return where;
  }
  Dex.whereToFind = function (id) { buildWhere(); return where.index[id] || null; };
  Dex.regionsOf = function (id) { buildWhere(); return where.regions[id] || null; };

  const REGIONS = [
    { id: "east", name: "East" }, { id: "bollin", name: "Bollin" }, { id: "dane", name: "Dane" },
    { id: "south", name: "South" }, { id: "salt", name: "Salt" }, { id: "mersey", name: "Mersey" },
    { id: "west", name: "West" }, { id: "wales", name: "Wales" }
  ];
  Dex.REGIONS = REGIONS;

  function habitatsAll() {
    const out = [];
    const map = {};
    const ids = order();
    for (let i = 0; i < ids.length; i++) {
      const sp = speciesDef(ids[i]);
      if (sp && sp.habitat && !map[sp.habitat]) { map[sp.habitat] = true; out.push(sp.habitat); }
    }
    out.sort();
    return out;
  }
  function typesAll() {
    const out = [];
    try {
      if (MQ.Data && MQ.Data.typeOrder && MQ.Data.typeOrder.length) return MQ.Data.typeOrder.slice();
      if (MQ.Data && MQ.Data.each) MQ.Data.each("types", function (t, id) { out.push(id); });
    } catch (e) { /* ignore */ }
    return out;
  }

  // ---- filter -----------------------------------------------------
  const filter = { status: "all", type: null, habitat: null, region: null, sort: "num" };
  Dex.filter = filter;
  function passes(id) {
    if (filter.status === "seen" && !seen(id)) return false;
    if (filter.status === "caught" && !caught(id)) return false;
    if (filter.status === "missing" && caught(id)) return false;
    const sp = speciesDef(id);
    if (filter.type && (!sp || (sp.types || []).indexOf(filter.type) < 0)) return false;
    if (filter.habitat && (!sp || sp.habitat !== filter.habitat)) return false;
    if (filter.region) {
      const rr = Dex.regionsOf(id);
      if (!rr || !rr[filter.region]) return false;
    }
    return true;
  }
  Dex.listIds = function () {
    buildWhere();
    const ids = order().filter(passes);
    if (filter.sort === "name") ids.sort(function (a, b) { return nameOf(a) < nameOf(b) ? -1 : 1; });
    else if (filter.sort === "type") ids.sort(function (a, b) {
      const ta = typesOf(a)[0] || "", tb = typesOf(b)[0] || "";
      if (ta !== tb) return ta < tb ? -1 : 1;
      return numOf(a) - numOf(b);
    });
    return ids;
  };
  function filterLabel() {
    const bits = [];
    if (filter.status !== "all") bits.push(TH().titleCase(filter.status));
    if (filter.type) bits.push(TH().titleCase(filter.type));
    if (filter.habitat) bits.push(TH().titleCase(filter.habitat));
    if (filter.region) bits.push(TH().titleCase(filter.region));
    return bits.length ? bits.join(" · ") : "All entries";
  }

  // =============================================================
  // The grid scene
  // =============================================================
  const HINTS = [{ btn: "a", label: "Open" }, { btn: "b", label: "Back" }, { btn: "select", label: "Filter" }, { btn: "start", label: "Progress" }];
  Dex.ids = [];
  Dex.st = null;
  Dex.cols = 6;

  Dex.enter = function (params) {
    params = params || {};
    if (params.filter) Object.assign(filter, params.filter);
    Dex.ids = Dex.listIds();
    if (!Dex.st) Dex.st = UI.menuState(Dex.ids, { cols: 6, visible: 4 });
    else Dex.st.setItems(Dex.ids);
    if (params.species) {
      const i = Dex.ids.indexOf(params.species);
      if (i >= 0) Dex.st.setCursor(i);
    }
    TH().sfx("ui_open");
  };
  Dex.refresh = function () {
    const cur = Dex.ids[Dex.st ? Dex.st.cursor : 0];
    Dex.ids = Dex.listIds();
    if (Dex.st) {
      Dex.st.setItems(Dex.ids);
      const i = Dex.ids.indexOf(cur);
      Dex.st.setCursor(i >= 0 ? i : 0);
    }
  };

  Dex.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("select")) {
      I.consume("select");
      UI.DexFilter.open({ filter: filter }).then(function (f) { if (f) { Object.assign(filter, f); Dex.refresh(); } });
      return;
    }
    if (I.pressed("start")) { I.consume("start"); UI.DexMilestones.open(); return; }
    const st = Dex.st;
    st.cols = Dex.cols;
    const r = st.update();
    if (!r) return;
    if (r.cancel) { MQ.Scenes.pop(null); return; }
    if (r.selected !== undefined) {
      const id = Dex.ids[r.selected];
      if (!id) return;
      Theme.sfx("ui_select");
      UI.DexEntry.open({ list: Dex.ids, index: r.selected });
    }
  };

  Dex.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#181a30", bottom: "#101c1a" });
    const c = counts();
    Theme.header(ctx, {
      title: "Field Dex", icon: "book",
      sub: filterLabel(),
      right: "Seen " + c.seen + "  ·  Caught " + c.caught + "/" + c.total
    });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop() - 6;
    // completion bar under the header
    UI.gauge(ctx, m.l, top, m.cw, 6, c.total ? c.caught / c.total : 0, { color: C.brass, bg: "rgba(0,0,0,0.45)", noBorder: true });
    if (c.total) {
      ctx.save(); ctx.globalAlpha = 0.55;
      UI.gauge(ctx, m.l, top, m.cw, 6, c.seen / c.total, { color: C.signal, bg: "rgba(0,0,0,0)", noBorder: true });
      ctx.restore();
    }
    const gy = top + 14;
    const gh = bot - gy;
    const st = Dex.st;
    const ids = Dex.ids;
    // cell size chosen so the grid always fills the width in whole cells
    const target = m.touch ? 92 : 80;
    const cols = Math.max(3, Math.min(10, Math.floor(m.cw / (target * m.k))));
    Dex.cols = cols; st.cols = cols;
    const cw = Math.floor(m.cw / cols);
    const ch = Math.round(cw * 0.86);
    const rows = Math.max(1, Math.floor(gh / ch));
    st.visible = rows;
    const maxScroll = Math.max(0, Math.ceil(ids.length / cols) - rows);
    if (st.scroll > maxScroll) st.scroll = maxScroll;
    // 177 species is a long way to travel with a d-pad you have not got
    if (Theme.dragScroll(st, m.l, gy, m.cw, gh, ch, maxScroll)) {
      st.cursor = U.clamp(st.cursor, st.scroll * cols, Math.min(ids.length - 1, (st.scroll + rows) * cols - 1));
    }
    for (let i = 0; i < st.rects.length; i++) { if (st.rects[i]) st.rects[i].on = false; }
    if (!ids.length) {
      T.draw(ctx, "Nothing matches that. Try a wider net.", m.cx, gy + gh / 2 - 9, { size: "m", align: "center", color: C.textDim });
    }
    const first = st.scroll * cols;
    const last = Math.min(ids.length, first + rows * cols);
    for (let i = first; i < last; i++) {
      const id = ids[i];
      const col = (i - first) % cols, row = Math.floor((i - first) / cols);
      const x = m.l + col * cw, y = gy + row * ch;
      let rc = st.rects[i];
      if (!rc) rc = st.rects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      rc.x = x; rc.y = y; rc.w = cw; rc.h = ch; rc.on = true;
      const sel = i === st.cursor;
      const state = caught(id) ? 2 : seen(id) ? 1 : 0;
      ctx.fillStyle = sel ? C.sel : "rgba(255,255,255,0.04)";
      UI.roundRect(ctx, x + 3, y + 3, cw - 6, ch - 6, 7); ctx.fill();
      if (sel) { ctx.strokeStyle = C.selEdge; ctx.lineWidth = 2; UI.roundRect(ctx, x + 4, y + 4, cw - 8, ch - 8, 7); ctx.stroke(); }
      const isize = Math.min(cw - 22, ch - 34);
      drawIcon(ctx, id, x + (cw - isize) / 2, y + 8, isize, state);
      T.draw(ctx, pad3(numOf(id)), x + 9, y + 7, { size: "s", color: C.textDim });
      if (state === 2) { ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(x + cw - 12, y + 12, 3.5, 0, 6.3); ctx.fill(); }
      T.draw(ctx, state === 0 ? "-----" : nameOf(id), x + cw / 2, y + ch - 22, { size: "s", align: "center", color: state === 0 ? C.dim : state === 1 ? C.textDim : C.text, maxWidth: cw - 10 });
    }
    // scrollbar
    const totalRows = Math.ceil(ids.length / cols);
    if (totalRows > rows) {
      const barH = Math.max(20, gh * rows / totalRows);
      const barY = gy + (gh - barH) * (st.scroll / Math.max(1, totalRows - rows));
      ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(m.r - 4, gy, 4, gh);
      ctx.fillStyle = C.brass; ctx.fillRect(m.r - 4, barY, 4, barH);
    }
    Theme.footer(ctx, HINTS);
  };

  Dex.open = function (params) { return MQ.Scenes.pushP(Dex, params || {}); };
  Dex.entry = function (speciesId, opts) {
    const list = Dex.listIds();
    let i = list.indexOf(speciesId);
    if (i < 0) { return UI.DexEntry.open(Object.assign({ list: [speciesId], index: 0 }, opts || {})); }
    return UI.DexEntry.open(Object.assign({ list: list, index: i }, opts || {}));
  };
  UI.Dex = Dex;

  // =============================================================
  // Entry page — five tabs
  // =============================================================
  const PAGES = ["Profile", "Stats", "Family", "Habitat", "Records"];
  const E_HINTS = [{ btn: "b", label: "Back" }, { btn: "lr", label: "Page" }, { btn: "a", label: "Cry" }, { btn: "select", label: "Next" }];
  const ent = { id: "dex_entry", touchPad: false, page: 0, index: 0, list: null, st: null, scroll: 0 };

  ent.enter = function (p) {
    p = p || {};
    ent.list = p.list && p.list.length ? p.list : Dex.listIds();
    ent.index = p.index || 0;
    ent.page = p.page || 0;
    ent.scroll = 0;
    if (!ent.st) ent.st = UI.menuState([], { visible: 6, cancel: false });
    TH().sfx("ui_open");
    if (seen(ent.species())) cry(ent.species());
  };
  ent.species = function () { return ent.list[ent.index]; };
  ent.setIndex = function (i) {
    const n = ent.list.length;
    ent.index = (i + n) % n;
    ent.scroll = 0;
    if (seen(ent.species())) cry(ent.species());
  };
  ent.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("left")) { I.consume("left"); ent.page = (ent.page + PAGES.length - 1) % PAGES.length; ent.scroll = 0; Theme.sfx("ui_move"); }
    if (I.pressed("right")) { I.consume("right"); ent.page = (ent.page + 1) % PAGES.length; ent.scroll = 0; Theme.sfx("ui_move"); }
    if (I.pressed("select")) { I.consume("select"); ent.setIndex(ent.index + 1); Theme.sfx("ui_move"); }
    if (I.pressed("down")) { I.consume("down"); ent.scroll += 1; }
    if (I.pressed("up")) { I.consume("up"); ent.scroll = Math.max(0, ent.scroll - 1); }
    if (I.pressed("a")) { I.consume("a"); if (seen(ent.species())) { cry(ent.species()); Theme.sfx("ui_select"); } else Theme.sfx("ui_error"); }
    const tab = Theme.tabTapped();
    if (tab >= 0) { ent.page = tab; ent.scroll = 0; Theme.sfx("ui_move"); }
  };

  function bigSprite(ctx, id, cx, by, scale, silhouette) {
    try {
      const MA = MQ.MonsterArt;
      if (MA && MA.draw) { MA.draw(ctx, id, "front", cx, by, scale, silhouette ? { silhouette: true } : null); return; }
      if (MA && MA.sprite) {
        const cv = MA.sprite(id, "front");
        if (cv && cv.width) { ctx.drawImage(cv, cx - cv.width * scale / 2, by - cv.height * scale, cv.width * scale, cv.height * scale); return; }
      }
    } catch (e) { /* fall through to the placeholder */ }
    const Theme = TH();
    const s = 64 * scale;
    ctx.fillStyle = silhouette ? "#26223a" : Theme.typeColour(typesOf(id)[0] || "normal");
    UI.roundRect(ctx, cx - s / 2, by - s, s, s, 10); ctx.fill();
  }

  function chipRow(ctx, id, x, y) {
    const Theme = TH();
    const ts = typesOf(id);
    let cx = x;
    for (let i = 0; i < ts.length; i++) cx += Theme.typeChip(ctx, ts[i], cx, y) + 6;
    return cx;
  }

  function pageProfile(ctx, id, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const sp = speciesDef(id);
    const state = caught(id) ? 2 : seen(id) ? 1 : 0;
    const artW = Math.min(w * 0.42, 210);
    Theme.panel(ctx, x, y, artW, h, { flat: true });
    const scale = Math.min((artW - 24) / 64, (h - 60) / 64, 2.4);
    bigSprite(ctx, id, x + artW / 2, y + h - 34, scale, state === 0);
    T.draw(ctx, state === 0 ? "Never met" : state === 1 ? "Sighted" : "Caught", x + artW / 2, y + h - 26, { size: "s", align: "center", color: state === 2 ? C.brassLit : C.textDim });
    if (state) T.draw(ctx, "A: cry", x + artW / 2, y + h - 12, { size: "s", align: "center", color: C.dim });

    const rx = x + artW + 12, rw = w - artW - 12;
    Theme.panel(ctx, rx, y, rw, h, { flat: true });
    let ry = y + 10;
    T.draw(ctx, pad3(numOf(id)) + "  " + (state === 0 ? "-----" : nameOf(id)), rx + 12, ry, { size: "l", color: C.brassLit });
    ry += 30;
    if (state === 0) {
      T.draw(ctx, "No sighting on file.", rx + 12, ry, { size: "m", color: C.textDim });
      T.draw(ctx, "Walk more. Look up more.", rx + 12, ry + 22, { size: "s", color: C.dim });
      return;
    }
    chipRow(ctx, id, rx + 12, ry);
    ry += 24;
    const dex = (sp && sp.dex) || {};
    T.draw(ctx, dex.genus || "Unclassified", rx + 12, ry, { size: "s", color: C.text });
    ry += 18;
    const facts = [
      ["Height", dex.height !== undefined ? dex.height + " m" : "?"],
      ["Weight", dex.weight !== undefined ? dex.weight + " kg" : "?"],
      ["Habitat", sp && sp.habitat ? Theme.titleCase(sp.habitat) : "?"],
      ["Rarity", sp && sp.rarity ? Theme.titleCase(sp.rarity) : "?"]
    ];
    const colW = rw / 2 - 12;
    for (let i = 0; i < facts.length; i++) {
      const fx = rx + 12 + (i % 2) * colW, fy = ry + Math.floor(i / 2) * 18;
      T.draw(ctx, facts[i][0], fx, fy, { size: "s", color: C.textDim });
      T.draw(ctx, String(facts[i][1]), fx + 70, fy, { size: "s", color: C.text });
    }
    ry += 44;
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(rx + 12, ry, rw - 24, 1);
    ry += 8;
    const text = state === 1 ? "Seen but not held. The notes are thin: " + (MQ.Trainer && MQ.Trainer.habitatNote ? (MQ.Trainer.habitatNote(id) || "a shape, a direction, nothing more.") : "a shape, a direction, nothing more.")
      : (dex.text || "No entry written yet.");
    T.drawWrapped(ctx, text, rx + 12, ry, rw - 24, { size: "s", color: C.text });
  }

  function statBar(ctx, label, value, x, y, w, col) {
    const Theme = TH(), C = Theme.C;
    T.draw(ctx, label, x, y, { size: "s", color: C.textDim });
    T.draw(ctx, String(value), x + 58, y, { size: "s", align: "right", color: C.text });
    UI.gauge(ctx, x + 66, y + 3, w - 66, 9, U.clamp(value / 160, 0, 1), { color: col || C.brass, bg: "rgba(0,0,0,0.45)", noBorder: true });
  }
  function pageStats(ctx, id, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const sp = speciesDef(id);
    if (!sp || !seen(id)) { T.draw(ctx, "Catch one and we will weigh it.", x + w / 2, y + h / 2 - 9, { size: "m", align: "center", color: C.textDim }); return; }
    const half = w / 2 - 8;
    Theme.panel(ctx, x, y, half, h, { flat: true, title: "Base stats" });
    const b = sp.base || {};
    const rows = [["HP", b.hp, C.hpHigh], ["ATK", b.atk, "#e07a4a"], ["DEF", b.def, "#7aa8e0"], ["SP.A", b.spa, "#c07ae0"], ["SP.D", b.spd, "#5fc9a8"], ["SPE", b.spe, C.warn]];
    let ry = y + 36;
    for (let i = 0; i < rows.length; i++) { statBar(ctx, rows[i][0], rows[i][1] || 0, x + 12, ry, half - 24, rows[i][2]); ry += 22; }
    ry += 4;
    T.draw(ctx, "Total", x + 12, ry, { size: "s", color: C.brassLit });
    T.draw(ctx, String(sp.bst || 0), x + half - 12, ry, { size: "s", align: "right", color: C.brassLit });

    const rx = x + half + 16, rw = w - half - 16;
    Theme.panel(ctx, rx, y, rw, h, { flat: true, title: "Field notes" });
    let ay = y + 36;
    const facts = [
      ["Catch rate", String(sp.catchRate === undefined ? "?" : sp.catchRate)],
      ["Base exp", String(sp.baseExp || "?")],
      ["Growth", Theme.titleCase(sp.growth || "medium")],
      ["Tier", sp.tier !== undefined ? String(sp.tier) : "-"]
    ];
    for (let i = 0; i < facts.length; i++) {
      T.draw(ctx, facts[i][0], rx + 12, ay, { size: "s", color: C.textDim });
      T.draw(ctx, facts[i][1], rx + rw - 12, ay, { size: "s", align: "right", color: C.text });
      ay += 18;
    }
    ay += 6;
    const abils = sp.abilities || [];
    for (let i = 0; i < abils.length && ay < y + h - 40; i++) {
      const ab = (MQ.Data && MQ.Data.abilities) ? MQ.Data.abilities[abils[i]] : null;
      T.draw(ctx, (ab && ab.name) || Theme.titleCase(abils[i]), rx + 12, ay, { size: "s", color: C.brassLit });
      ay += 16;
      if (ab && ab.desc) ay += T.drawWrapped(ctx, ab.desc, rx + 12, ay, rw - 24, { size: "s", color: C.textDim }) * 15 + 4;
    }
  }

  function evoMethodText(evo) {
    const Theme = TH();
    if (!evo) return "";
    switch (evo.method) {
      case "level": return "Level " + (evo.level || "?");
      case "item": return "Use " + (MQ.Data && MQ.Data.itemName ? MQ.Data.itemName(evo.item) : Theme.titleCase(evo.item || "?"));
      case "friendship": return "Friendship" + (evo.phase ? ", at " + evo.phase : "");
      case "location": return "At " + Theme.titleCase(evo.map || "somewhere");
      case "time": return "At " + (evo.phase || "night") + (evo.level ? ", Lv " + evo.level : "");
      case "trade": return "Handed on";
      case "move": return "Knowing " + Theme.titleCase(evo.move || "?");
      case "weather": return "In " + (evo.weather || "rain");
      default: return Theme.titleCase(evo.method || "?");
    }
  }
  function pageFamily(ctx, id, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    let chain = null;
    try { if (MQ.Data && MQ.Data.evolutionChain) chain = MQ.Data.evolutionChain(id); } catch (e) { chain = null; }
    if (!chain || !chain.length) chain = [id];
    Theme.panel(ctx, x, y, w, h, { flat: true, title: "Line" });
    const n = chain.length;
    const cell = Math.min(w / Math.max(n, 1), 190);
    const startX = x + (w - cell * n) / 2;
    const iy = y + 46;
    const isize = Math.min(cell - 40, h - 130, 96);
    for (let i = 0; i < n; i++) {
      const cid = chain[i];
      const cx = startX + i * cell;
      const state = caught(cid) ? 2 : seen(cid) ? 1 : 0;
      ctx.fillStyle = cid === id ? "rgba(201,163,74,0.16)" : "rgba(255,255,255,0.03)";
      UI.roundRect(ctx, cx + 6, iy - 6, cell - 12, isize + 44, 8); ctx.fill();
      if (cid === id) { ctx.strokeStyle = C.brass; ctx.lineWidth = 2; UI.roundRect(ctx, cx + 6, iy - 6, cell - 12, isize + 44, 8); ctx.stroke(); }
      drawIcon(ctx, cid, cx + (cell - isize) / 2, iy, isize, state);
      T.draw(ctx, state === 0 ? "?????" : nameOf(cid), cx + cell / 2, iy + isize + 6, { size: "s", align: "center", color: state ? C.text : C.dim, maxWidth: cell - 14 });
      T.draw(ctx, pad3(numOf(cid)), cx + cell / 2, iy + isize + 22, { size: "s", align: "center", color: C.textDim });
      if (i < n - 1) {
        const sp = speciesDef(cid);
        let evo = null;
        const evos = (sp && sp.evolutions) || [];
        for (let e = 0; e < evos.length; e++) if (evos[e].to === chain[i + 1]) evo = evos[e];
        const ax = cx + cell - 6;
        ctx.fillStyle = C.brass;
        ctx.beginPath(); ctx.moveTo(ax - 5, iy + isize / 2 - 6); ctx.lineTo(ax + 7, iy + isize / 2); ctx.lineTo(ax - 5, iy + isize / 2 + 6); ctx.closePath(); ctx.fill();
        T.draw(ctx, evoMethodText(evo), ax + 1, iy + isize / 2 + 10, { size: "s", align: "center", color: C.textDim, maxWidth: cell - 10 });
      }
    }
    // branching evolutions that are not on the straight chain
    const sp = speciesDef(id);
    const evos = (sp && sp.evolutions) || [];
    let ly = iy + isize + 54;
    if (evos.length > 1) {
      T.draw(ctx, "Also becomes:", x + 14, ly, { size: "s", color: C.brassLit }); ly += 17;
      for (let i = 0; i < evos.length && ly < y + h - 16; i++) {
        if (chain.indexOf(evos[i].to) >= 0) continue;
        T.draw(ctx, nameOf(evos[i].to) + " — " + evoMethodText(evos[i]), x + 20, ly, { size: "s", color: C.text });
        ly += 16;
      }
    } else if (n === 1) {
      T.draw(ctx, "Whatever it is, it stays that way.", x + 14, ly, { size: "s", color: C.textDim });
    }
  }

  function habitatsUnlocked() {
    try {
      if (MQ.Flags && MQ.Flags.get("dex_habitats")) return true;
      if (MQ.Inventory && MQ.Inventory.count && MQ.Inventory.count("field_notebook") > 0) return true;
      if (MQ.Settings && MQ.Settings.get && MQ.Settings.get("dexHabitats")) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  function visitedMap(mapId) {
    try {
      if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.visited && MQ.Overworld.state.visited[mapId]) return true;
      if (MQ.Quests && MQ.Quests.visited && MQ.Quests.visited[mapId]) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
  function pageHabitat(ctx, id, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const sp = speciesDef(id);
    const rows = Dex.whereToFind(id);
    const all = habitatsUnlocked();
    Theme.panel(ctx, x, y, w, h, { flat: true, title: "Where to find it" });
    let ry = y + 36;
    if (!seen(id)) {
      T.draw(ctx, "Not sighted, so no notes to give you.", x + 14, ry, { size: "m", color: C.textDim });
      return;
    }
    T.draw(ctx, "Habitat: " + Theme.titleCase((sp && sp.habitat) || "unknown") + "   ·   " + Theme.titleCase((sp && sp.rarity) || "?"), x + 14, ry, { size: "s", color: C.text });
    ry += 20;
    const notes = (MQ.Trainer && MQ.Trainer.habitatNote) ? MQ.Trainer.habitatNote(id) : "";
    if (notes) { ry += T.drawWrapped(ctx, "Your notes: " + notes, x + 14, ry, w - 28, { size: "s", color: C.textDim }) * 15 + 6; }
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(x + 14, ry, w - 28, 1); ry += 8;
    if (!rows || !rows.length) {
      T.draw(ctx, "Nothing in the tables. Story, gift, or somebody's pet.", x + 14, ry, { size: "s", color: C.textDim });
      return;
    }
    const shown = [];
    for (let i = 0; i < rows.length; i++) if (all || visitedMap(rows[i].map)) shown.push(rows[i]);
    if (!shown.length) {
      T.draw(ctx, rows.length + " known sites, none of them anywhere you have walked.", x + 14, ry, { size: "s", color: C.textDim });
      T.draw(ctx, "The Field Notebook (Delamere Watch) would fill this in.", x + 14, ry + 17, { size: "s", color: C.dim });
      return;
    }
    const maxRows = Math.floor((y + h - 12 - ry) / 26);
    const start = U.clamp(ent.scroll, 0, Math.max(0, shown.length - maxRows));
    ent.scroll = start;
    for (let i = start; i < Math.min(shown.length, start + maxRows); i++) {
      const r = shown[i];
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      UI.roundRect(ctx, x + 12, ry, w - 24, 23, 5); ctx.fill();
      T.draw(ctx, r.name, x + 20, ry + 4, { size: "s", color: C.text, maxWidth: w * 0.36 });
      const zone = r.zone === "fishing" ? "rod" : r.zone;
      T.draw(ctx, zone + "  Lv " + r.min + "-" + r.max, x + w * 0.42, ry + 4, { size: "s", color: C.textDim });
      const pct = Math.round(r.share * 100);
      T.draw(ctx, (r.rare ? "rare · " : "") + pct + "%", x + w - 20, ry + 4, { size: "s", align: "right", color: r.rare ? C.warn : C.brassLit });
      const cond = [];
      if (r.time) cond.push([].concat(r.time).join("/"));
      if (r.weather) cond.push([].concat(r.weather).join("/"));
      if (cond.length) T.draw(ctx, cond.join(" · "), x + w * 0.66, ry + 4, { size: "s", align: "right", color: C.signal });
      ry += 26;
    }
    if (shown.length > maxRows) T.draw(ctx, "up/down for more (" + shown.length + " sites)", x + w / 2, y + h - 15, { size: "s", align: "center", color: C.dim });
  }

  function photosOf(id) {
    try {
      const P = MQ.Photo;
      if (!P) return null;
      if (P.photosOf) return P.photosOf(id);
      if (P.of) return P.of(id);
      if (P.album) { const a = P.album(); const out = []; for (let i = 0; i < a.length; i++) if (a[i].species === id) out.push(a[i]); return out; }
    } catch (e) { /* photo mode is another team's */ }
    return null;
  }
  function ownedOf(id) {
    const out = [];
    try {
      const list = (MQ.Party && MQ.Party.list) || [];
      for (let i = 0; i < list.length; i++) if (list[i].species === id) out.push(list[i]);
    } catch (e) { /* ignore */ }
    return out;
  }
  function pageRecords(ctx, id, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    const e = entryOf(id);
    const half = w / 2 - 8;
    Theme.panel(ctx, x, y, half, h, { flat: true, title: "Your record" });
    let ry = y + 36;
    if (!e || !e.seen) {
      T.draw(ctx, "Blank page.", x + 14, ry, { size: "m", color: C.textDim });
    } else {
      const facts = [
        ["Sightings", String(e.seen)],
        ["Caught", String(e.caught || 0)],
        ["First seen", e.firstSeen ? (Theme.titleCase(e.firstSeen.map || "?") + "  " + Theme.date(e.firstSeen.ts)) : "-"],
        ["First caught", e.firstCaught ? (Theme.titleCase(e.firstCaught.map || "?") + "  Lv " + (e.firstCaught.level || "?")) : "-"]
      ];
      for (let i = 0; i < facts.length; i++) {
        T.draw(ctx, facts[i][0], x + 14, ry, { size: "s", color: C.textDim });
        T.draw(ctx, facts[i][1], x + half - 14, ry, { size: "s", align: "right", color: C.text, maxWidth: half - 100 });
        ry += 18;
      }
      const hab = e.habitats ? Object.keys(e.habitats) : [];
      if (hab.length) {
        ry += 6;
        T.draw(ctx, "Met in", x + 14, ry, { size: "s", color: C.brassLit }); ry += 16;
        ry += T.drawWrapped(ctx, hab.map(function (k) { return Theme.titleCase(k); }).join(", "), x + 14, ry, half - 28, { size: "s", color: C.textDim }) * 15;
      }
      const owned = ownedOf(id);
      if (owned.length) {
        ry += 8;
        T.draw(ctx, "In hand: " + owned.length, x + 14, ry, { size: "s", color: C.good });
      }
    }
    const rx = x + half + 16, rw = w - half - 16;
    Theme.panel(ctx, rx, y, rw, h, { flat: true, title: "Photographs" });
    let py = y + 36;
    const ph = photosOf(id);
    if (!MQ.Photo) {
      T.draw(ctx, "Photo mode is not fitted yet.", rx + 14, py, { size: "s", color: C.textDim });
      T.draw(ctx, "Elis at the Wizard's Well hands it over.", rx + 14, py + 17, { size: "s", color: C.dim });
    } else if (!ph || !ph.length) {
      T.draw(ctx, "No photographs. It never held still.", rx + 14, py, { size: "s", color: C.textDim });
    } else {
      for (let i = 0; i < ph.length && py < y + h - 20; i++) {
        const p = ph[i];
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        UI.roundRect(ctx, rx + 12, py, rw - 24, 22, 5); ctx.fill();
        T.draw(ctx, Theme.titleCase(p.map || p.pose || "shot " + (i + 1)), rx + 20, py + 3, { size: "s", color: C.text, maxWidth: rw * 0.5 });
        if (p.score !== undefined) T.draw(ctx, String(p.score) + " pts", rx + rw - 20, py + 3, { size: "s", align: "right", color: C.brassLit });
        py += 25;
      }
    }
  }

  ent.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1a1830", bottom: "#0f1c1e" });
    const id = ent.species();
    const state = caught(id) ? 2 : seen(id) ? 1 : 0;
    Theme.header(ctx, {
      title: state === 0 ? "Unknown entry" : nameOf(id),
      sub: pad3(numOf(id)) + " of " + counts().total,
      icon: "book",
      right: (ent.index + 1) + "/" + ent.list.length
    });
    const top = Theme.headerBottom();
    const th = Theme.tabStrip(ctx, PAGES, ent.page, { x: m.l, y: top, w: m.cw });
    const y = top + th + 8;
    const h = Theme.footerTop() - 6 - y;
    if (ent.page === 0) pageProfile(ctx, id, m.l, y, m.cw, h);
    else if (ent.page === 1) pageStats(ctx, id, m.l, y, m.cw, h);
    else if (ent.page === 2) pageFamily(ctx, id, m.l, y, m.cw, h);
    else if (ent.page === 3) pageHabitat(ctx, id, m.l, y, m.cw, h);
    else pageRecords(ctx, id, m.l, y, m.cw, h);
    Theme.footer(ctx, E_HINTS);
  };
  ent.open = function (p) { return MQ.Scenes.pushP(ent, p || {}); };
  UI.DexEntry = ent;

  // =============================================================
  // Filter screen
  // =============================================================
  const flt = { id: "dex_filter", touchPad: false, st: null, work: null, rows: null };
  const F_HINTS = [{ btn: "lr", label: "Change" }, { btn: "a", label: "Apply" }, { btn: "b", label: "Cancel" }, { btn: "select", label: "Clear" }];
  function optionsFor(kind) {
    if (kind === "status") return ["all", "seen", "caught", "missing"];
    if (kind === "sort") return ["num", "name", "type"];
    if (kind === "type") return [null].concat(typesAll());
    if (kind === "habitat") return [null].concat(habitatsAll());
    if (kind === "region") return [null].concat(REGIONS.map(function (r) { return r.id; }));
    return [null];
  }
  function cycle(kind, dir) {
    const opts = optionsFor(kind);
    const cur = flt.work[kind];
    let i = opts.indexOf(cur === undefined ? null : cur);
    if (i < 0) i = 0;
    i = (i + dir + opts.length) % opts.length;
    flt.work[kind] = opts[i];
  }
  flt.enter = function (p) {
    p = p || {};
    flt.work = Object.assign({}, filter, p.filter || {});
    flt.rows = [
      { kind: "status", label: "Show" },
      { kind: "type", label: "Type" },
      { kind: "habitat", label: "Habitat" },
      { kind: "region", label: "Region" },
      { kind: "sort", label: "Order" }
    ];
    if (!flt.st) flt.st = UI.menuState(flt.rows, { visible: 6 });
    else flt.st.setItems(flt.rows);
    TH().sfx("ui_open");
  };
  flt.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("select")) {
      I.consume("select");
      flt.work = { status: "all", type: null, habitat: null, region: null, sort: "num" };
      Theme.sfx("ui_move");
      return;
    }
    const row = flt.rows[flt.st.cursor];
    if (I.pressed("left")) { I.consume("left"); cycle(row.kind, -1); Theme.sfx("ui_move"); return; }
    if (I.pressed("right")) { I.consume("right"); cycle(row.kind, 1); Theme.sfx("ui_move"); return; }
    const r = flt.st.update();
    if (!r) return;
    if (r.cancel) { MQ.Scenes.pop(null); return; }
    if (r.selected !== undefined) {
      if (r.tap) { cycle(flt.rows[r.selected].kind, 1); Theme.sfx("ui_move"); return; }
      Theme.sfx("ui_select");
      MQ.Scenes.pop(flt.work);
    }
  };
  function valueText(kind, v) {
    const Theme = TH();
    if (v === null || v === undefined) return "Any";
    if (kind === "sort") return v === "num" ? "Dex number" : v === "name" ? "Name" : "Type";
    if (kind === "status") return v === "all" ? "Everything" : v === "missing" ? "Not caught" : Theme.titleCase(v);
    return Theme.titleCase(v);
  }
  flt.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#181a30", bottom: "#101c1a" });
    Theme.header(ctx, { title: "Filter", sub: "Left/right to change, A to apply.", icon: "cog" });
    const top = Theme.headerBottom();
    const w = Math.min(m.cw, 560);
    const x = m.cx - w / 2;
    Theme.list(flt.st, ctx, {
      x: x, y: top + 6, w: w, h: Theme.footerTop() - top - 60, rowH: m.rowH, gap: 6,
      render: function (c2, item, rx, ry, rw, rh, sel) {
        Theme.row(c2, { label: item.label, right: valueText(item.kind, flt.work[item.kind]) }, rx, ry, rw, rh, sel);
      }
    });
    // live count
    const saved = Object.assign({}, filter);
    Object.assign(filter, flt.work);
    let n = 0;
    try { n = Dex.listIds().length; } finally { Object.assign(filter, saved); }
    T.draw(ctx, n + " entries match", m.cx, Theme.footerTop() - 44, { size: "m", align: "center", color: C.brassLit });
    Theme.footer(ctx, F_HINTS);
  };
  flt.open = function (p) { return MQ.Scenes.pushP(flt, p || {}); };
  UI.DexFilter = flt;

  // =============================================================
  // Completion milestones (SIDE-CONTENT §2.8) + habitat/type bars
  // =============================================================
  const FALLBACK_MILESTONES = [
    { id: "seen_25", seen: 25, text: "Seen 25 — the Field Notebook is yours." },
    { id: "caught_25", caught: 25, text: "Caught 25 — 5 Casebook Marks." },
    { id: "caught_50", caught: 50, text: "Caught 50 — a perk point." },
    { id: "cyber_seen", cyberSeen: true, text: "Every Cyber type sighted — the Ghost Lens." },
    { id: "caught_75", caught: 75, text: "Caught 75 — the Dex Bandolier." },
    { id: "caught_100", caught: 100, text: "Caught 100 — a shiny-morph egg at the daycare." },
    { id: "caughtAll", caughtAll: true, text: "The dex is full. Something waits on the elm press." }
  ];
  const mile = { id: "dex_milestones", touchPad: false, tab: 0, scroll: 0 };
  const M_HINTS = [{ btn: "b", label: "Back" }, { btn: "lr", label: "Page" }];
  mile.enter = function () { mile.tab = 0; mile.scroll = 0; TH().sfx("ui_open"); };
  mile.update = function () {
    const I = MQ.Input, Theme = TH();
    if (Theme.backPressed()) { MQ.Scenes.pop(null); return; }
    if (I.pressed("a")) { I.consume("a"); mile.tab = (mile.tab + 1) % 3; Theme.sfx("ui_move"); }
    if (I.pressed("right")) { I.consume("right"); mile.tab = (mile.tab + 1) % 3; Theme.sfx("ui_move"); }
    if (I.pressed("left")) { I.consume("left"); mile.tab = (mile.tab + 2) % 3; Theme.sfx("ui_move"); }
    if (I.pressed("down")) { I.consume("down"); mile.scroll++; }
    if (I.pressed("up")) { I.consume("up"); mile.scroll = Math.max(0, mile.scroll - 1); }
    const tab = Theme.tabTapped();
    if (tab >= 0) { mile.tab = tab; mile.scroll = 0; Theme.sfx("ui_move"); }
  };
  function milestoneList() {
    let list = null;
    try { if (MQ.Trainer && MQ.Trainer.dexMilestones) list = MQ.Trainer.dexMilestones; } catch (e) { list = null; }
    return list && list.length ? list : FALLBACK_MILESTONES;
  }
  function milestoneDone(id) {
    try { if (MQ.Trainer && MQ.Trainer.dexMilestonesDone) return !!MQ.Trainer.dexMilestonesDone[id]; } catch (e) { /* ignore */ }
    return false;
  }
  function groupBars(ctx, x, y, w, h, kind) {
    const Theme = TH(), C = Theme.C;
    const ids = order();
    const groups = {}, names = [];
    for (let i = 0; i < ids.length; i++) {
      const sp = speciesDef(ids[i]);
      if (!sp) continue;
      const keys = kind === "type" ? (sp.types || []) : [sp.habitat || "unknown"];
      for (let k = 0; k < keys.length; k++) {
        const g = keys[k];
        if (!groups[g]) { groups[g] = { total: 0, caught: 0, seen: 0 }; names.push(g); }
        groups[g].total++;
        if (caught(ids[i])) groups[g].caught++;
        if (seen(ids[i])) groups[g].seen++;
      }
    }
    names.sort();
    const perCol = Math.max(1, Math.floor((h - 10) / 22));
    const cols = Math.max(1, Math.ceil(names.length / perCol));
    const colW = w / cols;
    for (let i = 0; i < names.length; i++) {
      const g = groups[names[i]];
      const cx = x + Math.floor(i / perCol) * colW;
      const cy = y + (i % perCol) * 22;
      const col = kind === "type" ? Theme.typeColour(names[i]) : C.brass;
      T.draw(ctx, Theme.titleCase(names[i]), cx, cy, { size: "s", color: C.text, maxWidth: colW * 0.42 });
      T.draw(ctx, g.caught + "/" + g.total, cx + colW - 16, cy, { size: "s", align: "right", color: g.caught >= g.total ? C.good : C.textDim });
      UI.gauge(ctx, cx, cy + 14, colW - 20, 5, g.total ? g.caught / g.total : 0, { color: col, bg: "rgba(0,0,0,0.45)", noBorder: true });
    }
  }
  mile.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#191a2e", bottom: "#111c18" });
    const c = counts();
    Theme.header(ctx, { title: "Dex progress", sub: "Seen " + c.seen + " · Caught " + c.caught + " of " + c.total, icon: "star" });
    const top = Theme.headerBottom();
    const th = Theme.tabStrip(ctx, ["Milestones", "By type", "By habitat"], mile.tab, { x: m.l, y: top, w: m.cw });
    const y = top + th + 8;
    const h = Theme.footerTop() - 6 - y;
    Theme.panel(ctx, m.l, y, m.cw, h, { flat: true });
    if (mile.tab === 0) {
      const list = milestoneList();
      let ry = y + 12;
      for (let i = 0; i < list.length && ry < y + h - 30; i++) {
        const ms = list[i];
        const done = milestoneDone(ms.id);
        let have = 0, need = 1;
        if (ms.seen) { have = c.seen; need = ms.seen; }
        else if (ms.caught) { have = c.caught; need = ms.caught; }
        else if (ms.caughtAll) { have = c.caught; need = c.total || 1; }
        else { have = done ? 1 : 0; need = 1; }
        ctx.fillStyle = done ? "rgba(95,201,106,0.12)" : "rgba(255,255,255,0.04)";
        UI.roundRect(ctx, m.l + 10, ry, m.cw - 20, 34, 6); ctx.fill();
        if (done) UI.icon(ctx, "check", m.l + 18, ry + 9);
        T.draw(ctx, ms.text, m.l + (done ? 40 : 20), ry + 4, { size: "s", color: done ? C.good : C.text, maxWidth: m.cw - 140 });
        T.draw(ctx, Math.min(have, need) + "/" + need, m.r - 18, ry + 4, { size: "s", align: "right", color: C.textDim });
        UI.gauge(ctx, m.l + 20, ry + 22, m.cw - 44, 5, U.clamp(have / need, 0, 1), { color: done ? C.good : C.brass, bg: "rgba(0,0,0,0.45)", noBorder: true });
        ry += 38;
      }
    } else {
      groupBars(ctx, m.l + 14, y + 14, m.cw - 28, h - 20, mile.tab === 1 ? "type" : "habitat");
    }
    Theme.footer(ctx, M_HINTS);
  };
  mile.open = function () { return MQ.Scenes.pushP(mile, {}); };
  UI.DexMilestones = mile;

  if (MQ.Events && MQ.Events.on) {
    MQ.Events.on("dex:seen", function () { Dex.invalidateCounts(); });
    MQ.Events.on("dex:caught", function () { Dex.invalidateCounts(); });
    MQ.Events.on("load", function () { Dex.invalidateCounts(); });
    MQ.Events.on("newgame", function () { Dex.invalidateCounts(); });
  }
})();
