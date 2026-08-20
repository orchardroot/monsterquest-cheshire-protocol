// =============================================================
// MonsterQuest v2 — MQ.UI.Save (ui): the save / load slot screen.
// Three slots + autosave, overwrite confirmation, legacy & corrupt
// envelopes shown honestly and never loaded. Touch-first cards.
// MQ.UI.Save.open({mode:'save'|'load'}) -> Promise<entry|null>
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  function speciesName(id) {
    try {
      const s = MQ.Data && MQ.Data.species && MQ.Data.species[id];
      if (s && s.name) return s.name;
    } catch (e) { /* ignore */ }
    return String(id || "").toUpperCase();
  }

  // ---- a slot card, shared with the title screen -------------------
  function card(ctx, e, x, y, w, h, sel, mode) {
    const Theme = TH(), C = Theme.C;
    const bad = e.corrupt || e.legacy;
    const usable = mode === "save" ? (e.slot !== "auto") : (!e.empty && !bad);
    Theme.panel(ctx, x, y, w, h, {
      lit: sel, selected: sel,
      accent: sel ? C.brassLit : bad ? C.bad : e.empty ? "rgba(139,124,192,0.30)" : C.canal,
      alpha: usable ? 1 : 0.72
    });
    const name = e.slot === "auto" ? "AUTOSAVE" : "SLOT " + e.slot;
    T.draw(ctx, name, x + 14, y + 10, { size: "m", color: sel ? C.brassLit : C.textDim });
    if (e.ts) T.draw(ctx, Theme.date(e.ts), x + w - 14, y + 10, { size: "s", align: "right", color: C.textDim });

    if (e.empty) {
      T.draw(ctx, mode === "save" ? "Empty - write here" : "Empty", x + 14, y + h / 2 - 4, { size: "m", color: C.dim });
      return;
    }
    if (e.corrupt) {
      T.draw(ctx, "Damaged data", x + 14, y + 36, { size: "m", color: C.bad });
      T.draw(ctx, "Nothing in here survived. Starting fresh is the only option.", x + 14, y + 60, { size: "s", color: C.textDim, maxWidth: w - 28 });
      return;
    }
    if (e.legacy) {
      T.draw(ctx, "Old save (version " + (e.env && e.env.version || 0) + ")", x + 14, y + 36, { size: "m", color: C.warn });
      T.draw(ctx, "From an older Cheshire. It cannot be read; a new game can be started over it.", x + 14, y + 60, { size: "s", color: C.textDim, maxWidth: w - 28 });
      return;
    }
    const s = e.summary || {};
    T.draw(ctx, (s.name || "JIM"), x + 14, y + 34, { size: "l", color: C.text });
    const right = "Ch." + (s.chapter || 1) + "   TL" + (s.level || 1);
    T.draw(ctx, right, x + w - 14, y + 38, { size: "m", align: "right", color: C.brassLit });
    // badges as pips
    const bx = x + 14, by = y + 66;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i < (s.badges || 0) ? C.brass : "rgba(255,255,255,0.12)";
      ctx.beginPath(); ctx.arc(bx + 8 + i * 18, by + 7, 6, 0, 6.3); ctx.fill();
    }
    T.draw(ctx, Theme.playtime(e.playtime), x + w - 14, y + 62, { size: "s", align: "right", color: C.textDim });
    // party line
    const party = s.party || [];
    let px = x + 14, py = y + 88;
    for (let i = 0; i < party.length && i < 6; i++) {
      const label = speciesName(party[i]);
      const pw = T.width(label, "s") + 12;
      if (px + pw > x + w - 14) break;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      UI.roundRect(ctx, px, py, pw, 18, 4); ctx.fill();
      T.draw(ctx, label, px + 6, py + 2, { size: "s", color: C.textDim });
      px += pw + 6;
    }
    if (s.map) T.draw(ctx, Theme.titleCase(s.map), x + 14, y + h - 22, { size: "s", color: C.dim, maxWidth: w - 28 });
  }

  // ---- the scene ---------------------------------------------------
  const sc = { id: "save_screen", touchPad: false, mode: "save", entries: [], st: null, busy: false, t: 0 };
  const HINTS_SAVE = [{ btn: "a", label: "Write" }, { btn: "b", label: "Back" }];
  const HINTS_LOAD = [{ btn: "a", label: "Load" }, { btn: "b", label: "Back" }];

  sc.refresh = function () {
    sc.entries = (MQ.Save && MQ.Save.slots) ? MQ.Save.slots() : [];
    if (sc.mode === "save") {
      // autosave is written by the game, not by hand
      for (let i = 0; i < sc.entries.length; i++) if (sc.entries[i].slot === "auto") sc.entries[i].disabled = true;
    }
    if (!sc.st) sc.st = UI.menuState(sc.entries, { visible: 4 });
    else sc.st.setItems(sc.entries);
  };

  sc.enter = function (params) {
    params = params || {};
    sc.mode = params.mode === "load" ? "load" : "save";
    sc.busy = false;
    sc.t = 0;
    sc.refresh();
    if (params.slot !== undefined) {
      for (let i = 0; i < sc.entries.length; i++) if (sc.entries[i].slot === params.slot) sc.st.setCursor(i);
    }
    TH().sfx("ui_open");
  };

  sc.choose = function (e) {
    const Theme = TH();
    if (sc.mode === "load") {
      if (e.empty) { Theme.sfx("ui_error"); Theme.toast("That slot is empty."); return; }
      MQ.Scenes.pop(e);
      return;
    }
    if (e.slot === "auto") { Theme.sfx("ui_error"); Theme.toast("The game keeps that one for itself."); return; }
    sc.busy = true;
    const write = function () {
      const ok = MQ.Save && MQ.Save.write ? MQ.Save.write(e.slot) : false;
      sc.busy = false;
      if (ok) {
        Theme.sfx("ui_select");
        Theme.toast("Saved to slot " + e.slot + ".");
        sc.refresh();
        MQ.Scenes.pop(e);
      } else {
        Theme.sfx("ui_error");
        Theme.say(["The save would not write. Storage may be full or locked."], { name: "Notebook" });
      }
    };
    if (e.empty) { write(); return; }
    const who = e.summary && e.summary.name ? e.summary.name : "someone";
    Theme.confirm("Slot " + e.slot + " already holds " + who + "'s run. Write over it?").then(function (yes) {
      if (yes) write(); else { sc.busy = false; Theme.sfx("ui_back"); }
    });
  };

  sc.update = function () {
    if (sc.busy) return;
    sc.t += 16.667;
    const Theme = TH();
    const res = sc.st.update();
    if (res) {
      if (res.cancel) { Theme.sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) { sc.choose(sc.entries[res.selected]); return; }
    }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };

  sc.draw = function (ctx) {
    const Theme = TH(), m = Theme.m();
    Theme.backdrop(ctx, { top: "#191531", bottom: "#101c1a" });
    Theme.header(ctx, {
      title: sc.mode === "load" ? "Load Game" : "Save Game",
      sub: sc.mode === "load" ? "Pick up where you left it" : "Write the day down before you lose it",
      icon: "save",
      right: MQ.Save && MQ.Save.currentSlot ? "Current: " + MQ.Save.currentSlot : ""
    });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop();
    const listH = bot - top - 6;
    const rowH = Math.min(Math.round(112 * m.k), Math.floor((listH - 3 * 8) / 4));
    Theme.list(sc.st, ctx, {
      x: m.l, y: top, w: m.cw - 8, h: listH, rowH: rowH, gap: 8,
      render: function (c, item, x, y, w, h, sel) { card(c, item, x, y, w, h, sel, sc.mode); }
    });
    Theme.footer(ctx, sc.mode === "load" ? HINTS_LOAD : HINTS_SAVE);
  };

  sc.open = function (opts) { return MQ.Scenes.pushP(sc, opts || {}); };
  sc.card = card;

  UI.Save = sc;
})();
