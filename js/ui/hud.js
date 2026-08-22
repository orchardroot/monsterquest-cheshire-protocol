// =============================================================
// MonsterQuest v2 — MQ.UI.HUD (ui-b): the overworld's small print.
// Quest tracker line, SIGNAL METER, CUTOVER counter and the
// mini-map (map tiles at 2 px each, with warps, NPCs and you).
// Every widget is a plain draw call the overworld can place where
// it likes; MQ.UI.HUD.corner(ctx) draws the standard arrangement.
// Nothing here allocates per frame: scratch objects are pooled and
// the mini-map is baked once per map into an offscreen canvas.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const HUD = {
    VERSION: 1,
    MINI_SCALE: 2,          // logical px per tile in the baked map
    miniMapOn: false,
    trackerOn: true
  };

  function setting(id, dflt) {
    try {
      if (MQ.Settings && MQ.Settings.get) { const v = MQ.Settings.get(id); if (v !== undefined) return v; }
    } catch (e) { /* settings are optional */ }
    try {
      if (UI.Settings && UI.Settings.get) { const v = UI.Settings.get(id); if (v !== undefined) return v; }
    } catch (e) { /* ignore */ }
    return dflt;
  }
  function flag(id) { try { return MQ.Flags ? MQ.Flags.get(id) : undefined; } catch (e) { return undefined; } }

  // =============================================================
  // Quest tracker — one line of "what am I doing", from MQ.Quests
  // =============================================================
  const trackCache = { at: -9999, data: null };
  HUD.tracked = function () {
    const now = (MQ.Loop && MQ.Loop.time) || 0;
    if (now - trackCache.at < 400 && trackCache.at >= 0) return trackCache.data;
    trackCache.at = now;
    let d = null;
    try { if (MQ.Quests && MQ.Quests.tracked) d = MQ.Quests.tracked(); } catch (e) { d = null; }
    trackCache.data = d || null;
    return trackCache.data;
  };
  HUD.invalidateTracker = function () { trackCache.at = -9999; trackCache.data = null; };

  // Returns the height drawn (0 when there is nothing to say).
  HUD.tracker = function (ctx, x, y, w) {
    if (!HUD.trackerOn || setting("questTracker", true) === false) return 0;
    const d = HUD.tracked();
    if (!d) return 0;
    const Theme = TH(), C = Theme.C, m = Theme.m();
    const sh = T.px("s"), lh = sh + 3;
    const lines = T.wrap(String(d.text || ""), w - 26, "s");
    const n = Math.min(2, lines.length);
    const prog = d.progress;
    const h = Math.round(8 + sh + 4 + n * lh + (prog ? 12 : 4));
    ctx.save();
    ctx.fillStyle = "rgba(12,10,22,0.74)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.fillStyle = d.kind === "main" ? C.brass : d.kind === "bounty" ? C.oxblood : C.canal;
    ctx.fillRect(x + 2, y + 6, 3, h - 12);
    T.draw(ctx, String(d.name || "Casebook"), x + 12, y + 5, { size: "s", color: C.brassLit, maxWidth: w - 60 });
    if (d.total) T.draw(ctx, (d.stage + 1) + "/" + d.total, x + w - 10, y + 5, { size: "s", align: "right", color: C.textDim });
    for (let i = 0; i < n; i++) T.draw(ctx, lines[i], x + 12, y + 8 + sh + 4 + i * lh, { size: "s", color: C.text, maxWidth: w - 24 });
    if (prog && prog.need) {
      const by = y + 8 + sh + 4 + n * lh + 1;
      UI.gauge(ctx, x + 12, by, w - 60, 6, U.clamp(prog.have / prog.need, 0, 1), { color: C.brass, bg: "rgba(0,0,0,0.5)", noBorder: true });
      T.draw(ctx, prog.have + "/" + prog.need, x + w - 10, by - 4, { size: "s", align: "right", color: C.textDim });
    }
    ctx.restore();
    return h;
  };

  // =============================================================
  // SIGNAL METER — ORACLE's attention, weather-like (STORY-BIBLE §6)
  // =============================================================
  HUD.signalOn = function () { return !!flag("signal_meter"); };
  HUD.signalLevel = function () {
    try { if (MQ.Signal && typeof MQ.Signal.level === "number") return U.clamp(MQ.Signal.level, 0, 1); } catch (e) { /* ignore */ }
    try { if (MQ.Encounters && MQ.Encounters.signalLevel) return U.clamp(MQ.Encounters.signalLevel(), 0, 1); } catch (e) { /* ignore */ }
    if (flag("plug_pulled") && !flag("cutover_restarted")) return 0;
    const days = flag("cutover_days");
    if (typeof days === "number") return U.clamp((38 - days) / 38, 0, 1);
    if (days === "t3") return 0.85;
    if (days === "t0") return 1;
    return flag("cutover_started") ? 0.35 : 0.15;
  };
  HUD.signalWord = function (lvl) {
    return lvl <= 0.02 ? "QUIET" : lvl < 0.25 ? "LOW" : lvl < 0.5 ? "AWAKE" : lvl < 0.75 ? "LISTENING" : lvl < 0.95 ? "INTERESTED" : "LOOKING AT YOU";
  };
  // A ten-pip meter that shimmers with the level. Height is fixed.
  HUD.signal = function (ctx, x, y, w, o) {
    if (!HUD.signalOn() && !(o && o.force)) return 0;
    const Theme = TH(), C = Theme.C;
    const lvl = (o && o.level !== undefined) ? o.level : HUD.signalLevel();
    const t = ((MQ.Loop && MQ.Loop.time) || 0) / 1000;
    const sh = T.px("s");
    const h = sh + 22;
    ctx.save();
    ctx.fillStyle = "rgba(12,10,22,0.74)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    T.draw(ctx, "SIGNAL", x + 10, y + 3, { size: "s", color: C.signal });
    // the word can be "LOOKING AT YOU"; give it whatever is left and no more
    const wordX = x + 10 + T.width("SIGNAL", "s") + 8;
    T.draw(ctx, HUD.signalWord(lvl), x + w - 10, y + 3, { size: "s", align: "right", color: lvl > 0.75 ? C.bad : C.textDim, maxWidth: Math.max(10, x + w - 10 - wordX) });
    const pips = 10, px0 = x + 10, pw = (w - 20) / pips;
    for (let i = 0; i < pips; i++) {
      const on = lvl * pips > i;
      const flick = on ? 0.62 + 0.38 * Math.abs(Math.sin(t * (1.4 + i * 0.23) + i)) : 1;
      ctx.globalAlpha = on ? flick : 0.22;
      ctx.fillStyle = !on ? "#2a2740" : i > 7 ? C.bad : i > 5 ? C.warn : C.signal;
      ctx.fillRect(px0 + i * pw + 1, y + sh + 6, pw - 3, 7);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return h;
  };

  // =============================================================
  // CUTOVER counter — days until the migration, in its own format
  // =============================================================
  const cut = { on: false, text: "", urgent: 0, stopped: false };
  HUD.cutoverState = function () {
    cut.on = !!flag("cutover_started");
    const d = flag("cutover_days");
    cut.stopped = false; cut.urgent = 0;
    if (d === "stopped" || (flag("plug_pulled") && !flag("cutover_restarted"))) { cut.text = "STOPPED"; cut.stopped = true; }
    else if (d === "t3") { cut.text = "T-3"; cut.urgent = 0.7; }
    else if (d === "t0") { cut.text = "T-0"; cut.urgent = 1; }
    else if (typeof d === "number") { cut.text = d + (d === 1 ? " DAY" : " DAYS"); cut.urgent = d <= 7 ? 0.6 : d <= 12 ? 0.3 : 0; }
    else { cut.text = "PENDING"; }
    return cut;
  };
  HUD.cutover = function (ctx, x, y, w, o) {
    const s = HUD.cutoverState();
    if (!s.on && !(o && o.force)) return 0;
    const Theme = TH(), C = Theme.C;
    const t = ((MQ.Loop && MQ.Loop.time) || 0) / 1000;
    const pulse = s.urgent > 0 ? 0.5 + 0.5 * Math.sin(t * (2 + s.urgent * 3)) : 0;
    const sh = T.px("s"), mh = T.px("m");
    // "STACK CUTOVER" and "9 DAYS" used to be drawn on top of one another on any
    // screen narrow enough; stack them when they will not sit side by side.
    const stacked = T.width("STACK CUTOVER", "s") + T.width(s.text, "m") + 30 > w;
    const h = stacked ? (sh + mh + 14) : (mh + 14);
    ctx.save();
    ctx.fillStyle = "rgba(12,10,22,0.78)";
    UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
    if (s.urgent > 0) {
      ctx.globalAlpha = 0.20 + 0.35 * pulse * s.urgent;
      ctx.fillStyle = C.bad;
      UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.globalAlpha = 1;
    }
    T.draw(ctx, "STACK CUTOVER", x + 10, y + (stacked ? 4 : Math.round((h - sh) / 2)), { size: "s", color: s.stopped ? C.good : C.textDim });
    T.draw(ctx, s.text, x + w - 10, stacked ? (y + 6 + sh) : (y + Math.round((h - mh) / 2)), { size: "m", align: "right", color: s.stopped ? C.good : s.urgent > 0.5 ? C.bad : C.warn });
    ctx.restore();
    return h;
  };

  // =============================================================
  // Mini-map — the whole map baked at MINI_SCALE px per tile
  // =============================================================
  const bake = {};            // mapId → {cv, serial, w, h}
  const tileCol = {};         // tileId → colour string
  function colourOf(id) {
    if (!id) return null;
    let c = tileCol[id];
    if (c !== undefined) return c;
    c = null;
    try {
      const p = MQ.Tiles && MQ.Tiles.props ? MQ.Tiles.props(id) : null;
      if (p && p.color) c = p.color;
    } catch (e) { c = null; }
    tileCol[id] = c;
    return c;
  }
  function newCanvas(w, h) {
    const cv = (typeof document !== "undefined" && document.createElement) ? document.createElement("canvas") : null;
    if (!cv) return null;
    cv.width = w; cv.height = h;
    return cv;
  }

  HUD.miniMapCanvas = function (mapId) {
    if (!mapId || !MQ.World || !MQ.World.prepare) return null;
    let rt = null;
    try { rt = MQ.World.prepare(mapId); } catch (e) { rt = null; }
    if (!rt || !rt.w) return null;
    const have = bake[mapId];
    if (have && have.serial === rt.serial) return have;
    const S = HUD.MINI_SCALE;
    const cv = newCanvas(rt.w * S, rt.h * S);
    if (!cv) return null;
    const c = cv.getContext("2d");
    c.fillStyle = "#0b0a14"; c.fillRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < rt.h; y++) {
      for (let x = 0; x < rt.w; x++) {
        const i = y * rt.w + x;
        if (rt.voidCell && rt.voidCell[i]) continue;
        let col = colourOf(rt.deco && rt.deco[i]) || colourOf(rt.ground && rt.ground[i]);
        if (!col) col = rt.solid && rt.solid[i] ? "#3a3550" : "#1c1a2c";
        c.fillStyle = col;
        c.fillRect(x * S, y * S, S, S);
        if (rt.solid && rt.solid[i]) {
          c.fillStyle = "rgba(0,0,0,0.28)";
          c.fillRect(x * S, y * S, S, S);
        }
      }
    }
    const entry = { cv: cv, serial: rt.serial, w: rt.w, h: rt.h };
    bake[mapId] = entry;
    return entry;
  };
  HUD.invalidate = function (mapId) {
    if (mapId) delete bake[mapId];
    else { const ks = Object.keys(bake); for (let i = 0; i < ks.length; i++) delete bake[ks[i]]; }
  };

  // Draw the mini-map inside a box. opts:
  //   {map, tileX, tileY, npcs, warps:false, label, alpha, frame:false}
  const mmScratch = { x: 0, y: 0, w: 0, h: 0 };
  HUD.miniMap = function (ctx, x, y, w, h, o) {
    o = o || {};
    const Theme = TH(), C = Theme.C;
    const mapId = o.map || (MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state.map : null);
    const baked = HUD.miniMapCanvas(mapId);
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    if (o.frame !== false) {
      ctx.fillStyle = "rgba(10,9,20,0.82)";
      UI.roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 2;
      UI.roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 8); ctx.stroke();
    }
    const pad = o.frame === false ? 0 : 5;
    const ix = x + pad, iy = y + pad, iw = w - pad * 2, ih = h - pad * 2;
    if (!baked) {
      T.draw(ctx, "no map", x + w / 2, y + h / 2 - 7, { size: "s", align: "center", color: C.textDim });
      ctx.restore();
      return mmScratch;
    }
    const S = HUD.MINI_SCALE;
    // where is the player, in baked pixels?
    let ptx = o.tileX, pty = o.tileY;
    if (ptx === undefined && MQ.Overworld && MQ.Overworld.player) {
      ptx = MQ.Overworld.player.x; pty = MQ.Overworld.player.y;
    }
    const cxp = (ptx === undefined ? baked.w / 2 : ptx + 0.5) * S;
    const cyp = (pty === undefined ? baked.h / 2 : pty + 0.5) * S;
    let ox = Math.round(ix + iw / 2 - cxp);
    let oy = Math.round(iy + ih / 2 - cyp);
    if (baked.cv.width <= iw) ox = Math.round(ix + (iw - baked.cv.width) / 2);
    else ox = Math.round(U.clamp(ox, ix + iw - baked.cv.width, ix));
    if (baked.cv.height <= ih) oy = Math.round(iy + (ih - baked.cv.height) / 2);
    else oy = Math.round(U.clamp(oy, iy + ih - baked.cv.height, iy));
    ctx.save();
    ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
    ctx.drawImage(baked.cv, ox, oy);
    // warps
    if (o.warps !== false && MQ.World.allWarps) {
      let ws = null;
      try { ws = MQ.World.allWarps(mapId); } catch (e) { ws = null; }
      if (ws) {
        ctx.fillStyle = C.brassLit;
        for (let i = 0; i < ws.length; i++) {
          const wp = ws[i];
          if (wp.kind === "edge") continue;
          ctx.fillRect(ox + wp.x * S - 1, oy + wp.y * S - 1, S + 2, S + 2);
        }
      }
    }
    // NPCs
    const list = o.npcs || (MQ.Overworld && MQ.Overworld.npcs ? MQ.Overworld.npcs() : null);
    if (list) {
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!e || e.hidden || e.active === false) continue;
        ctx.fillStyle = e.trainer ? C.oxblood : e.cat ? C.warn : "#cfd4e4";
        ctx.fillRect(ox + e.x * S - 1, oy + e.y * S - 1, S + 1, S + 1);
      }
    }
    // you: a blinking brass square with a ring
    if (ptx !== undefined) {
      const t = ((MQ.Loop && MQ.Loop.time) || 0) / 1000;
      const blink = 0.55 + 0.45 * Math.sin(t * 5);
      ctx.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * blink;
      ctx.fillStyle = C.brassLit;
      ctx.fillRect(ox + ptx * S - 1, oy + pty * S - 1, S + 2, S + 2);
      ctx.globalAlpha = (o.alpha === undefined ? 1 : o.alpha) * 0.5 * blink;
      ctx.strokeStyle = C.brassLit; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ox + ptx * S + S / 2, oy + pty * S + S / 2, 5 + 2 * blink, 0, 6.3); ctx.stroke();
      ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    }
    ctx.restore();
    if (o.label !== false) {
      const nm = o.label || mapName(mapId);
      if (nm) {
        const sh = T.px("s");
        ctx.fillStyle = "rgba(10,9,20,0.7)";
        ctx.fillRect(x + 4, y + h - sh - 6, w - 8, sh + 2);
        T.draw(ctx, nm, x + w / 2, y + h - sh - 5, { size: "s", align: "center", color: C.textDim, maxWidth: w - 12 });
      }
    }
    ctx.restore();
    mmScratch.x = ix; mmScratch.y = iy; mmScratch.w = iw; mmScratch.h = ih;
    return mmScratch;
  };

  function mapName(id) {
    if (!id) return "";
    try {
      const d = MQ.World && MQ.World.get ? MQ.World.get(id) : null;
      if (d && d.name) return d.name;
    } catch (e) { /* ignore */ }
    return TH().titleCase(id);
  }
  HUD.mapName = mapName;

  // =============================================================
  // The standard arrangement, for the overworld to call in one line
  // =============================================================
  HUD.corner = function (ctx, o) {
    o = o || {};
    const Theme = TH(), m = Theme.m();
    let ty = m.t;
    if (o.tracker !== false) {
      const tw = U.clamp(Math.round(300 * m.k * m.ui), 220, Math.round(m.cw * 0.46));
      ty += HUD.tracker(ctx, m.l, ty, tw);
      if (ty > m.t) ty += 6;
    }
    let ry = m.t;
    // wide enough for the longest thing that goes in it, at whatever text scale
    const rw = U.clamp(Math.round(Math.max(176 * m.k * m.ui, T.width("LOOKING AT YOU", "s") + 24)), 150, Math.round(m.cw * 0.42));
    const rx = m.r - rw;
    if (o.cutover !== false) { const h = HUD.cutover(ctx, rx, ry, rw); if (h) ry += h + 6; }
    if (o.signal !== false) { const h = HUD.signal(ctx, rx, ry, rw); if (h) ry += h + 6; }
    if (o.miniMap !== false && HUD.miniMapOn && setting("miniMap", true) !== false) {
      const mw = Math.round(150 * m.k), mh = Math.round(122 * m.k);
      // The bottom corners belong to the virtual stick and the A/B pad, so on a
      // touch screen the map joins the right-hand column instead of sitting in
      // the corner underneath them.
      const res = (MQ.Input && MQ.Input.reserve) ? MQ.Input.reserve() : null;
      const padded = !!(res && res.on);
      let mx = m.r - mw, my = m.b - mh;
      if (padded) {
        if (res.padSide === "right") { my = Math.min(ry, m.b - mh - res.padH); }
        else { mx = m.r - mw; my = Math.min(ry, m.b - mh - res.stickH); }
        my = Math.max(ry, my);
        if (my + mh > m.b) my = Math.max(m.t, m.b - mh);
      }
      HUD.miniMap(ctx, mx, my, mw, mh, o.miniMapOpts || null);
    }
    return ty;
  };
  HUD.setMiniMap = function (on) { HUD.miniMapOn = on === undefined ? !HUD.miniMapOn : !!on; return HUD.miniMapOn; };

  // Keep the bakes honest when the world changes under us.
  if (MQ.Events && MQ.Events.on) {
    MQ.Events.on("map", function (d) { if (d && d.map) HUD.invalidate(d.map); HUD.invalidateTracker(); });
    MQ.Events.on("quest:start", HUD.invalidateTracker);
    MQ.Events.on("quest:stage", HUD.invalidateTracker);
    MQ.Events.on("quest:complete", HUD.invalidateTracker);
    MQ.Events.on("quest:track", HUD.invalidateTracker);
    MQ.Events.on("newgame", function () { HUD.invalidate(); HUD.invalidateTracker(); });
    MQ.Events.on("load", function () { HUD.invalidate(); HUD.invalidateTracker(); });
  }

  UI.HUD = HUD;
})();
