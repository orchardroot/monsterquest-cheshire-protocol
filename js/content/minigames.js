// =============================================================
// MonsterQuest v2 — MQ.Minigames (content-activities)
// The cabinets and the puzzles. SIDE-CONTENT §2.11, DESIGN-INDEX §8.
//
//   arcade_packet_run    Warrington Wire — lane runner
//   arcade_salt_rush     Warrington Wire — salt cascade
//   arcade_type_trainer  Warrington Wire — type reflex drill
//   knutsford_quiz       Madam Gaskell's rooms — five questions
//   lift_puzzle          Anderton — balance the caissons
//   timetable_puzzle     Crewe — platform allocation
//   fruit_machine        any tap room — three reels and regret
//
// Every game is a small canvas scene, playable with a thumb: taps are
// the primary control, the d-pad and A/B do the same job. Each resolves
// with {id, score, won, tokens}. High scores are saved.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const M = MQ.Minigames || {};
  function A() { return MQ.Activities; }

  M.auto = false;
  M.state = { scores: {}, plays: {}, tokens: 0, quizDay: 0, quizBest: 0, liftLevel: 1, ttLevel: 1, redeemed: {} };

  M.GAMES = {};
  M.define = function (id, def) { def.id = id; M.GAMES[id] = def; return def; };
  M.list = function () {
    const ids = Object.keys(M.GAMES).sort(), out = [];
    for (let i = 0; i < ids.length; i++) {
      const g = M.GAMES[ids[i]];
      out.push({ id: ids[i], name: g.name, place: g.place, blurb: g.blurb, best: M.highScore(ids[i]), plays: M.state.plays[ids[i]] || 0 });
    }
    return out;
  };
  M.highScore = function (id) { return M.state.scores[id] || 0; };
  M.record = function (id, score) {
    M.state.plays[id] = (M.state.plays[id] || 0) + 1;
    if (score > (M.state.scores[id] || 0)) { M.state.scores[id] = score; return true; }
    return false;
  };
  // Friday is double tokens at the Wire. It always has been.
  M.tokenRate = function () { return A().dow() === 5 ? 2 : 1; };
  M.addTokens = function (n) {
    if (n <= 0) return 0;
    const paid = n * M.tokenRate();
    M.state.tokens += paid;
    A().setFlag("arcade_tokens", M.state.tokens);
    A().emit("minigame:tokens", { n: paid, total: M.state.tokens });
    return paid;
  };
  M.tokens = function () { return M.state.tokens; };
  M.spendTokens = function (n) { if (M.state.tokens < n) return false; M.state.tokens -= n; A().setFlag("arcade_tokens", M.state.tokens); return true; };

  // ---- shared scene plumbing -------------------------------------------
  function finish(g, result) {
    if (g.finished) return;
    g.finished = true;
    const a = A();
    result = result || {};
    result.id = g.gameId;
    result.score = result.score || 0;
    const pb = M.record(g.gameId, result.score);
    result.best = M.highScore(g.gameId);
    result.pb = pb;
    const tk = result.tokens || 0;
    result.tokens = tk ? M.addTokens(tk) : 0;
    a.emit("minigame:end", result);
    g.result = result;
    g.over = true;
    g.overT = 0;
  }
  // Tap helpers that never allocate in the draw loop.
  const TMP = { x: 0, y: 0, w: 0, h: 0 };
  function rect(x, y, w, h) { TMP.x = x; TMP.y = y; TMP.w = w; TMP.h = h; return TMP; }
  function tapIn(x, y, w, h) { return A().tapped(rect(x, y, w, h)); }

  function base(id, def) {
    const scene = {
      id: "mg_" + id, touchPad: false, gameId: id, over: false, overT: 0, finished: false, result: null,
      enter: function (params) {
        this.p = params || {};
        this.over = false; this.overT = 0; this.finished = false; this.result = null;
        this.t = 0;
        this.rnd = A().rng(this.p.seed === undefined ? (Date.now() & 0xffffff) : this.p.seed);
        A().sfx("ui_open");
        if (def.init) def.init.call(this, this.p);
      },
      exit: function () { A().sfx("ui_close"); },
      update: function (dt) {
        const a = A();
        this.t += dt;
        // Headless/skip mode (tests, MQ.Dialog.auto): play out honourably rather
        // than sitting here waiting for a button nobody is going to press.
        if (M.auto === true) {
          if (this.over) { MQ.Scenes.pop(this.result); return; }
          if (def.auto) { def.auto.call(this, finish); return; }
          finish(this, { score: this.score || 0, won: true, auto: true });
          return;
        }
        if (this.over) {
          this.overT += dt;
          if (this.overT > 350 && (a.confirmPressed() || a.anyTap() || a.backPressed())) MQ.Scenes.pop(this.result);
          else if (this.overT > 12000) MQ.Scenes.pop(this.result);
          return;
        }
        if (a.backPressed()) { finish(this, { score: this.score || 0, won: false, quit: true }); return; }
        if (def.update) def.update.call(this, dt);
      },
      draw: function (ctx) {
        const a = A(), C = a.C(), m = a.m();
        a.backdrop(ctx, def.backdrop || { top: "#181428", bottom: "#0a0812" });
        a.header(ctx, { title: def.name, sub: def.place, accent: def.accent || "#3fe0c8", right: def.right ? def.right.call(this) : "" });
        if (def.draw) def.draw.call(this, ctx);
        if (this.over && this.result) {
          a.scrim(ctx, 0.72);
          const w = Math.min(460, m.cw), x = m.cx - w / 2, y = m.cy - 110 * m.k, h = 220 * m.k;
          a.panel(ctx, x, y, w, h, { lit: true, accent: def.accent || "#3fe0c8" });
          a.text(ctx, this.result.won ? "CLEARED" : this.result.quit ? "WALKED AWAY" : "GAME OVER",
            m.cx, y + 18, { size: "l", align: "center", color: this.result.won ? C.good : C.brassLit });
          a.text(ctx, "Score " + this.result.score, m.cx, y + 62, { size: "l", align: "center", color: C.text });
          if (this.result.pb) a.text(ctx, "New best.", m.cx, y + 98, { size: "m", align: "center", color: C.good });
          else a.text(ctx, "Best " + this.result.best, m.cx, y + 98, { size: "s", align: "center", color: C.textDim });
          if (this.result.tokens) a.text(ctx, "+" + this.result.tokens + " tokens" + (M.tokenRate() > 1 ? " (Friday double)" : ""),
            m.cx, y + 126, { size: "m", align: "center", color: C.brass });
          if (this.result.line) a.text(ctx, this.result.line, m.cx, y + 158, { size: "s", align: "center", color: C.textDim, maxWidth: w - 30 });
          a.footer(ctx, [{ btn: "a", label: "Done" }]);
          return;
        }
        a.footer(ctx, def.hints ? def.hints.call(this) : [{ btn: "b", label: "Quit" }]);
      }
    };
    // every other key on the game definition (geom, helpers, tables) becomes
    // a method on the scene, so a game can be written as one plain object.
    const RESERVED = { init: 1, update: 1, draw: 1, name: 1, place: 1, blurb: 1, accent: 1, backdrop: 1, right: 1, hints: 1, id: 1 };
    const keys = Object.keys(def);
    for (let i = 0; i < keys.length; i++) if (!RESERVED[keys[i]]) scene[keys[i]] = def[keys[i]];
    scene.defName = def.name;
    scene.def = def;
    return scene;
  }

  // =============================================================
  // 1. PACKET RUN — the endless runner
  // =============================================================
  const LANES = 3;
  M.define("arcade_packet_run", {
    name: "Packet Run", place: "Warrington Wire Arcade", accent: "#3fe0c8",
    blurb: "Three lanes, one packet, and a network that does not want you.",
    init: function () {
      this.lane = 1; this.score = 0; this.dist = 0; this.speed = 0.20; this.spawn = 0;
      this.obs = []; this.acks = []; this.jump = 0; this.lives = 1; this.combo = 0;
      A().music("town_warrington");
    },
    right: function () { return "score " + Math.floor(this.score); },
    hints: function () { return [{ btn: "dir", label: "Lane" }, { btn: "a", label: "Hop" }, { btn: "b", label: "Quit" }]; },
    update: function (dt) {
      const a = A(), I = MQ.Input;
      const step = dt / 16.67;
      this.speed = Math.min(0.62, 0.20 + this.dist / 24000);
      this.dist += this.speed * step * 8;
      this.score += this.speed * step * 1.1;
      if (this.jump > 0) this.jump -= dt;
      // controls: swipe-free — tap a third of the screen, or the d-pad
      if (I && I.pressed("left")) { I.consume("left"); this.lane = Math.max(0, this.lane - 1); a.sfx("ui_move"); }
      if (I && I.pressed("right")) { I.consume("right"); this.lane = Math.min(LANES - 1, this.lane + 1); a.sfx("ui_move"); }
      if (a.confirmPressed() && this.jump <= 0) { this.jump = 520; a.sfx("ledge_hop"); }
      const tp = a.anyTap();
      if (tp) {
        const m = a.m();
        if (tp.y > m.h * 0.72) { if (this.jump <= 0) { this.jump = 520; a.sfx("ledge_hop"); } }
        else if (tp.x < m.w / 3) this.lane = Math.max(0, this.lane - 1);
        else if (tp.x > m.w * 2 / 3) this.lane = Math.min(LANES - 1, this.lane + 1);
      }
      // spawn
      this.spawn -= dt;
      if (this.spawn <= 0) {
        this.spawn = Math.max(280, 900 - this.dist / 40);
        const lane = Math.floor(this.rnd() * LANES);
        const kind = this.rnd() < 0.25 ? "low" : "block";
        this.obs.push({ lane: lane, y: -0.08, kind: kind });
        if (this.rnd() < 0.55) {
          let l2 = Math.floor(this.rnd() * LANES);
          if (l2 === lane) l2 = (l2 + 1) % LANES;
          this.acks.push({ lane: l2, y: -0.20 });
        }
      }
      const dy = this.speed * step * 0.017;
      for (let i = this.obs.length - 1; i >= 0; i--) {
        const o = this.obs[i];
        o.y += dy;
        if (o.y > 0.78 && o.y < 0.90 && o.lane === this.lane) {
          if (o.kind === "low" && this.jump > 0) { /* hopped it */ }
          else { this.hit(); this.obs.splice(i, 1); continue; }
        }
        if (o.y > 1.1) this.obs.splice(i, 1);
      }
      for (let i = this.acks.length - 1; i >= 0; i--) {
        const o = this.acks[i];
        o.y += dy;
        if (o.y > 0.78 && o.y < 0.92 && o.lane === this.lane) {
          this.acks.splice(i, 1);
          this.combo++;
          this.score += 25 + this.combo * 5;
          a.sfx("coin");
          continue;
        }
        if (o.y > 1.1) { this.acks.splice(i, 1); this.combo = 0; }
      }
    },
    hit: function () {
      const a = A();
      a.sfx("hit_normal"); a.buzz(60);
      this.lives--;
      if (this.lives <= 0) {
        finish(this, {
          score: Math.floor(this.score), won: Math.floor(this.score) > 500,
          tokens: Math.floor(this.score / 150),
          line: this.score > 1200 ? "\"Fastest packet in the county,\" says the machine, lying." : "Dropped. Retransmit?"
        });
      }
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const top = a.headerBottom(), bot = a.footerTop();
      const h = bot - top, laneW = Math.min(120 * m.k, m.cw / 5);
      const cx = m.cx;
      // the wire
      for (let l = 0; l < LANES; l++) {
        const x = cx + (l - 1) * laneW - laneW / 2;
        ctx.fillStyle = l === this.lane ? "rgba(63,224,200,0.10)" : "rgba(255,255,255,0.03)";
        ctx.fillRect(x, top, laneW, h);
        ctx.strokeStyle = "rgba(63,224,200,0.25)"; ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, top + 0.5, laneW - 1, h - 1);
      }
      // scrolling rungs
      const off = (this.dist * 6) % 40;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      for (let yy = top - 40 + off; yy < bot; yy += 40) { ctx.beginPath(); ctx.moveTo(cx - laneW * 1.5, yy); ctx.lineTo(cx + laneW * 1.5, yy); ctx.stroke(); }
      // obstacles
      for (let i = 0; i < this.obs.length; i++) {
        const o = this.obs[i];
        const x = cx + (o.lane - 1) * laneW - laneW / 2 + 8, y = top + o.y * h;
        ctx.fillStyle = o.kind === "low" ? "#8e2f2a" : "#e05252";
        ctx.fillRect(x, y, laneW - 16, o.kind === "low" ? 12 : 26);
      }
      for (let i = 0; i < this.acks.length; i++) {
        const o = this.acks[i];
        const x = cx + (o.lane - 1) * laneW, y = top + o.y * h;
        ctx.fillStyle = C.brassLit;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.3); ctx.fill();
      }
      // the packet
      const py = top + h * 0.84 - (this.jump > 0 ? 22 : 0);
      const px = cx + (this.lane - 1) * laneW;
      ctx.fillStyle = this.jump > 0 ? "#ffffff" : C.cyber;
      ctx.fillRect(px - 14, py - 10, 28, 20);
      ctx.fillStyle = C.ink;
      MQ.Text.draw(ctx, "PKT", px, py - 8, { size: "s", align: "center", color: C.ink });
      a.text(ctx, "combo ×" + (1 + this.combo), m.l + 6, top + 6, { size: "s", color: C.textDim });
      a.text(ctx, "best " + M.highScore("arcade_packet_run"), m.r - 6, top + 6, { size: "s", align: "right", color: C.dim });
    }
  });

  // =============================================================
  // 2. SALT RUSH — match three with cascades
  // =============================================================
  const SR_W = 7, SR_H = 8, SR_COLS = ["#dfe6ee", "#7cc0d8", "#c9a34a", "#9a52b5", "#5fc96a"];
  M.define("arcade_salt_rush", {
    name: "Salt Rush", place: "Warrington Wire Arcade", accent: "#dfe6ee",
    blurb: "Crystals fall, crystals go. Ninety seconds of it.",
    init: function () {
      this.grid = new Array(SR_W * SR_H);
      this.score = 0; this.left = 90000; this.sel = -1; this.cascade = 0; this.settle = 0;
      for (let i = 0; i < this.grid.length; i++) this.grid[i] = Math.floor(this.rnd() * SR_COLS.length);
      while (this.clearMatches(true)) { /* deal a board with no free matches */ }
      A().music("town_warrington");
    },
    right: function () { return Math.ceil(this.left / 1000) + "s"; },
    hints: function () { return [{ btn: "a", label: "Swap" }, { btn: "b", label: "Quit" }]; },
    at: function (x, y) { return this.grid[y * SR_W + x]; },
    set: function (x, y, v) { this.grid[y * SR_W + x] = v; },
    // returns true if anything matched
    clearMatches: function (reseedOnly) {
      const gone = [];
      for (let y = 0; y < SR_H; y++) {
        for (let x = 0; x < SR_W - 2; x++) {
          const v = this.at(x, y);
          if (v < 0) continue;
          if (this.at(x + 1, y) === v && this.at(x + 2, y) === v) {
            let n = 3;
            while (x + n < SR_W && this.at(x + n, y) === v) n++;
            for (let i = 0; i < n; i++) gone.push((x + i) + y * SR_W);
          }
        }
      }
      for (let x = 0; x < SR_W; x++) {
        for (let y = 0; y < SR_H - 2; y++) {
          const v = this.at(x, y);
          if (v < 0) continue;
          if (this.at(x, y + 1) === v && this.at(x, y + 2) === v) {
            let n = 3;
            while (y + n < SR_H && this.at(x, y + n) === v) n++;
            for (let i = 0; i < n; i++) gone.push(x + (y + i) * SR_W);
          }
        }
      }
      if (!gone.length) return false;
      if (reseedOnly) {
        for (let i = 0; i < gone.length; i++) this.grid[gone[i]] = Math.floor(this.rnd() * SR_COLS.length);
        return true;
      }
      for (let i = 0; i < gone.length; i++) this.grid[gone[i]] = -1;
      this.cascade++;
      this.score += gone.length * 10 * this.cascade;
      A().sfx(this.cascade > 1 ? "stage_up" : "ui_select");
      return true;
    },
    fall: function () {
      for (let x = 0; x < SR_W; x++) {
        let write = SR_H - 1;
        for (let y = SR_H - 1; y >= 0; y--) {
          const v = this.at(x, y);
          if (v >= 0) { this.set(x, write, v); write--; }
        }
        for (let y = write; y >= 0; y--) this.set(x, y, Math.floor(this.rnd() * SR_COLS.length));
      }
    },
    swap: function (a1, b1) {
      const t = this.grid[a1]; this.grid[a1] = this.grid[b1]; this.grid[b1] = t;
    },
    trySwap: function (i, j) {
      this.swap(i, j);
      this.cascade = 0;
      if (!this.clearMatches()) { this.swap(i, j); A().sfx("ui_error"); return false; }
      this.settle = 120;
      return true;
    },
    update: function (dt) {
      const a = A();
      this.left -= dt;
      if (this.left <= 0) {
        finish(this, { score: this.score, won: this.score >= 1500, tokens: Math.floor(this.score / 300),
          line: this.score >= 1500 ? "The cabinet plays four notes it saves for good days." : "\"Salt's cheap,\" says the cabinet." });
        return;
      }
      if (this.settle > 0) {
        this.settle -= dt;
        if (this.settle <= 0) { this.fall(); if (this.clearMatches()) this.settle = 120; }
        return;
      }
      const tp = a.anyTap();
      const g = this.geom();
      if (tp && tp.x >= g.x && tp.y >= g.y && tp.x < g.x + g.cell * SR_W && tp.y < g.y + g.cell * SR_H) {
        const cx = Math.floor((tp.x - g.x) / g.cell), cy = Math.floor((tp.y - g.y) / g.cell);
        const idx = cy * SR_W + cx;
        if (this.sel < 0) { this.sel = idx; a.sfx("ui_move"); }
        else if (this.sel === idx) this.sel = -1;
        else {
          const sx = this.sel % SR_W, sy = Math.floor(this.sel / SR_W);
          if (Math.abs(sx - cx) + Math.abs(sy - cy) === 1) { this.trySwap(this.sel, idx); this.sel = -1; }
          else { this.sel = idx; a.sfx("ui_move"); }
        }
        return;
      }
      // cursor for pads and keys
      const I = MQ.Input;
      if (!I) return;
      if (this.cur === undefined) this.cur = Math.floor(SR_W * SR_H / 2);
      let cx = this.cur % SR_W, cy = Math.floor(this.cur / SR_W);
      let moved = false;
      if (I.pressed("left")) { I.consume("left"); cx = Math.max(0, cx - 1); moved = true; }
      if (I.pressed("right")) { I.consume("right"); cx = Math.min(SR_W - 1, cx + 1); moved = true; }
      if (I.pressed("up")) { I.consume("up"); cy = Math.max(0, cy - 1); moved = true; }
      if (I.pressed("down")) { I.consume("down"); cy = Math.min(SR_H - 1, cy + 1); moved = true; }
      if (moved) { this.cur = cy * SR_W + cx; a.sfx("ui_move"); }
      if (a.confirmPressed()) {
        if (this.sel < 0) this.sel = this.cur;
        else if (this.sel === this.cur) this.sel = -1;
        else {
          const sx = this.sel % SR_W, sy = Math.floor(this.sel / SR_W);
          if (Math.abs(sx - cx) + Math.abs(sy - cy) === 1) this.trySwap(this.sel, this.cur);
          this.sel = -1;
        }
      }
    },
    geom: function () {
      const a = A(), m = a.m();
      const top = a.headerBottom() + 6, bot = a.footerTop() - 6;
      const cell = Math.floor(Math.min((bot - top) / SR_H, m.cw / (SR_W + 3)));
      return { cell: cell, x: Math.round(m.cx - cell * SR_W / 2), y: top, top: top, bot: bot };
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const g = this.geom();
      a.panel(ctx, g.x - 8, g.y - 8, g.cell * SR_W + 16, g.cell * SR_H + 16, { flat: true });
      for (let y = 0; y < SR_H; y++) {
        for (let x = 0; x < SR_W; x++) {
          const v = this.at(x, y);
          const px = g.x + x * g.cell, py = g.y + y * g.cell;
          if (v >= 0) {
            ctx.fillStyle = SR_COLS[v];
            ctx.fillRect(px + 3, py + 3, g.cell - 6, g.cell - 6);
          }
          const idx = y * SR_W + x;
          if (idx === this.sel) { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.strokeRect(px + 2, py + 2, g.cell - 4, g.cell - 4); }
          else if (idx === this.cur) { ctx.strokeStyle = C.brassLit; ctx.lineWidth = 2; ctx.strokeRect(px + 2, py + 2, g.cell - 4, g.cell - 4); }
        }
      }
      const bx = g.x + g.cell * SR_W + 16;
      a.text(ctx, "SCORE", bx, g.y + 4, { size: "s", color: C.brass });
      a.text(ctx, String(this.score), bx, g.y + 24, { size: "l", color: C.text });
      a.text(ctx, "best " + M.highScore("arcade_salt_rush"), bx, g.y + 60, { size: "s", color: C.dim });
      a.meter(ctx, g.x, g.bot - 10, g.cell * SR_W, 8, this.left / 90000, this.left < 15000 ? C.bad : C.salt);
    }
  });

  // =============================================================
  // 3. TYPE TRAINER — the reflex drill
  // =============================================================
  const TT_ANSWERS = [
    { label: "Super effective", lo: 1.9, hi: 9 },
    { label: "Normal", lo: 0.9, hi: 1.1 },
    { label: "Not very", lo: 0.2, hi: 0.6 },
    { label: "No effect", lo: -1, hi: 0.01 }
  ];
  M.define("arcade_type_trainer", {
    name: "Type Trainer", place: "Warrington Wire Arcade", accent: "#e6c24a",
    blurb: "Twelve matchups. Three seconds each. The cabinet does not repeat itself.",
    init: function () {
      this.qn = 0; this.score = 0; this.right = 0; this.left = 3000; this.streak = 0;
      this.types = (MQ.Data && MQ.Data.typeIds) || ["normal", "fire", "water", "grass", "electric"];
      this.next();
      A().music("town_warrington");
    },
    right: function () { return this.qn + "/12"; },
    hints: function () { return [{ btn: "dir", label: "Pick" }, { btn: "a", label: "Answer" }, { btn: "b", label: "Quit" }]; },
    next: function () {
      this.qn++;
      if (this.qn > 12) {
        finish(this, {
          score: this.score, won: this.right >= 10, correct: this.right,
          tokens: Math.floor(this.right / 3),
          line: this.right === 12 ? "Twelve from twelve. The cabinet prints a receipt." : this.right + " of 12."
        });
        return;
      }
      const t = this.types;
      this.atk = t[Math.floor(this.rnd() * t.length)];
      const d1 = t[Math.floor(this.rnd() * t.length)];
      this.def = [d1];
      if (this.rnd() < 0.4) { const d2 = t[Math.floor(this.rnd() * t.length)]; if (d2 !== d1) this.def.push(d2); }
      this.mult = MQ.Data && MQ.Data.typeMultiplier ? MQ.Data.typeMultiplier(this.atk, this.def) : 1;
      this.answer = 1;
      for (let i = 0; i < TT_ANSWERS.length; i++) if (this.mult > TT_ANSWERS[i].lo && this.mult <= TT_ANSWERS[i].hi) { this.answer = i; break; }
      if (this.mult === 0) this.answer = 3;
      else if (this.mult >= 2) this.answer = 0;
      else if (this.mult < 1) this.answer = 2;
      else this.answer = 1;
      this.pick = 0;
      this.left = Math.max(1400, 3000 - this.qn * 110);
      this.flash = 0;
    },
    update: function (dt) {
      const a = A(), I = MQ.Input;
      this.left -= dt;
      if (this.flash > 0) this.flash -= dt;
      if (this.left <= 0) { this.answerWith(-1); return; }
      if (I) {
        if (I.pressed("up")) { I.consume("up"); this.pick = (this.pick + 3) % 4; a.sfx("ui_move"); }
        if (I.pressed("down")) { I.consume("down"); this.pick = (this.pick + 1) % 4; a.sfx("ui_move"); }
      }
      if (a.confirmPressed()) { this.answerWith(this.pick); return; }
      const g = this.geom();
      for (let i = 0; i < 4; i++) if (tapIn(g.x, g.y + i * g.rh, g.w, g.rh - 6)) { this.answerWith(i); return; }
    },
    answerWith: function (i) {
      const a = A();
      if (i === this.answer) {
        this.right++; this.streak++;
        this.score += 100 + Math.round(this.left / 20) + this.streak * 10;
        a.sfx("ui_select");
      } else { this.streak = 0; a.sfx("ui_error"); a.buzz(40); }
      this.next();
    },
    geom: function () {
      const a = A(), m = a.m();
      const top = a.headerBottom() + 120;
      const w = Math.min(420, m.cw - 40);
      const rh = Math.round(52 * m.k);
      return { x: m.cx - w / 2, y: top, w: w, rh: rh };
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const top = a.headerBottom();
      a.text(ctx, U.capitalise(this.atk) + "  →  " + this.def.map(U.capitalise).join(" / "),
        m.cx, top + 30, { size: "l", align: "center", color: C.brassLit });
      a.text(ctx, "streak ×" + this.streak + " · score " + this.score, m.cx, top + 74, { size: "s", align: "center", color: C.textDim });
      const g = this.geom();
      for (let i = 0; i < 4; i++) {
        const y = g.y + i * g.rh;
        a.panel(ctx, g.x, y, g.w, g.rh - 6, { lit: i === this.pick, accent: i === this.pick ? C.brass : null });
        a.text(ctx, TT_ANSWERS[i].label, g.x + 16, y + (g.rh - 6 - 18) / 2, { size: "m", color: i === this.pick ? C.brassLit : C.text });
      }
      a.meter(ctx, g.x, g.y + 4 * g.rh + 10, g.w, 8, this.left / 3000, this.left < 800 ? C.bad : C.cyber);
    }
  });

  // =============================================================
  // 4. THE KNUTSFORD QUIZ — Madam Gaskell's rooms
  // =============================================================
  // q(question, [answers], correctIndex, tag)
  const QUIZ = [];
  function q(text, answers, right, tag) { QUIZ.push({ q: text, a: answers, r: right, tag: tag || "cheshire" }); }

  q("Knutsford's May Day parade traditionally decorates the pavements with what?", ["Sand patterns", "Chalk hopscotch", "Rose petals", "Salt lines"], 0);
  q("Which Knutsford resident wrote 'Cranford'?", ["Elizabeth Gaskell", "Mary Shelley", "Charlotte Brontë", "Frances Hodgson Burnett"], 0, "gaskell");
  q("What is the tower on Kerridge Hill above Bollington called?", ["White Nancy", "Black Sarah", "Grey Alice", "Blue Peggy"], 0);
  q("Macclesfield made its name and its money from what?", ["Silk", "Salt", "Cotton", "Coal"], 0);
  q("The Anderton Boat Lift connects the Trent & Mersey Canal to which river?", ["The Weaver", "The Dane", "The Bollin", "The Dee"], 0);
  q("What was found preserved in Lindow Moss in 1984?", ["A bog body", "A Roman villa", "A Viking longship", "A silver hoard"], 0);
  q("The Jodrell Bank dish is properly named after which scientist?", ["Lovell", "Hoyle", "Ryle", "Bell Burnell"], 0);
  q("Which Cheshire town's coat of arms features a bear?", ["Congleton", "Nantwich", "Frodsham", "Neston"], 0);
  q("Congleton famously sold its bible to buy what?", ["A bear", "A church bell", "A bridge", "A fire engine"], 0);
  q("The Sandbach Crosses are from which period?", ["Saxon", "Roman", "Norman", "Tudor"], 0);
  q("Nantwich's wealth came from what, before the railways?", ["Salt", "Wool", "Silk", "Cheese"], 0);
  q("What is the correct name for Chester's raised covered walkways?", ["The Rows", "The Tiers", "The Galleries", "The Steps"], 0);
  q("Chester's racecourse is known as the what?", ["Roodee", "Roodle", "Rood Field", "Rowdy"], 0);
  q("Little Moreton Hall is famous for being what?", ["Alarmingly crooked", "Entirely round", "Underground", "Made of brick"], 0);
  q("Beeston Castle sits on top of what?", ["A sandstone crag", "A salt dome", "A motte", "A gravel pit"], 0);
  q("The Cheshire Cat is associated with which author?", ["Lewis Carroll", "Beatrix Potter", "Kenneth Grahame", "Roald Dahl"], 0);
  q("Which Cheshire village grew around a model estate for mill workers?", ["Styal", "Rostherne", "Aldford", "Bunbury"], 0);
  q("Quarry Bank Mill was powered originally by what?", ["A waterwheel", "A steam beam engine", "Horses", "Wind"], 0);
  q("What runs beneath much of mid-Cheshire and keeps collapsing?", ["Salt workings", "Coal seams", "Chalk mines", "Slate quarries"], 0);
  q("Winsford's 'Flashes' are what?", ["Subsidence lakes", "Reservoirs", "Ox-bow lakes", "Tidal pools"], 0);
  q("Crewe grew up around which industry?", ["Railway works", "Textiles", "Shipbuilding", "Brewing"], 0);
  q("The Bridgewater Canal ends at which Cheshire town?", ["Runcorn", "Northwich", "Warrington", "Widnes"], 0);
  q("Frodsham's hill is topped with what landmark?", ["A war memorial", "A castle keep", "A folly tower", "A lighthouse"], 0);
  q("The Weaver Navigation was built to carry what?", ["Salt", "Silk", "Slate", "Steel"], 0);
  q("Tatton Park is best known for its herds of what?", ["Deer", "Highland cattle", "Wild boar", "Ponies"], 0);
  q("Which river runs through Wilmslow and Styal?", ["The Bollin", "The Dane", "The Weaver", "The Gowy"], 0);
  q("Alderley Edge's legend concerns a wizard and what?", ["Sleeping knights", "A drowned bell", "A silver stag", "A stone giant"], 0);
  q("The Cat and Fiddle is famous as what?", ["A high moorland pub", "A canal lock", "A railway halt", "A stone circle"], 0);
  q("Lymm's centre is marked by what?", ["A stone cross", "A market hall", "A mill wheel", "A war memorial arch"], 0);
  q("Which of these is a genuine Cheshire cheese-making town?", ["Nantwich", "Neston", "Tarvin", "Handforth"], 0);
  q("Mow Cop's summit carries what?", ["A ruined folly castle", "A radio mast", "A trig point only", "A chapel"], 0);
  q("Marbury and Budworth Meres are examples of what?", ["Glacial lakes", "Reservoirs", "Salt flashes", "Fish ponds"], 0);
  q("Ellesmere Port is home to the National Museum of what?", ["Waterways", "Railways", "Salt", "Silk"], 0);
  q("What does the Cheshire 'Sandstone Trail' mostly follow?", ["A ridge", "A canal", "A river", "A disused railway"], 0);
  q("Gaskell's 'North and South' contrasts industrial Milton with where?", ["The rural south", "Scotland", "Ireland", "London"], 0, "gaskell");
  q("Gaskell wrote a biography of which fellow novelist?", ["Charlotte Brontë", "Jane Austen", "George Eliot", "Mary Shelley"], 0, "gaskell");
  q("'Cranford' is largely a portrait of what kind of community?", ["A small town of women", "A shipyard", "A mining village", "A university"], 0, "gaskell");
  q("Which Gaskell novel is set partly in Knutsford as 'Hollingford'?", ["Wives and Daughters", "Ruth", "Mary Barton", "Sylvia's Lovers"], 0, "gaskell");

  q("Fire is super effective against which type?", ["Grass", "Water", "Rock", "Fire"], 0, "types");
  q("Electric moves do nothing at all to which type?", ["Ground", "Rock", "Grass", "Bug"], 0, "types");
  q("Which type resists both Fire and Water?", ["Water", "Grass", "Rock", "Bug"], 0, "types");
  q("Ghost moves are ineffective against which type?", ["Normal", "Psychic", "Bug", "Poison"], 0, "types");
  q("Cyber moves are the county's own. What are they strong against?", ["Machinery and minds", "Rock and Ground", "Fire and Water", "Nothing much"], 0, "types");
  q("Which type takes double from both Rock and Electric?", ["Flying", "Ground", "Grass", "Poison"], 0, "types");
  q("A Water move against a Rock/Ground creature is what?", ["Four times effective", "Twice effective", "Halved", "No effect"], 0, "types");
  q("Grass moves are resisted by which of these?", ["Bug", "Ground", "Rock", "Water"], 0, "types");

  q("Somebody rings claiming to be from your bank and asks for a code. You should:", ["Hang up and ring the bank yourself", "Read the code out", "Ask them to prove it by text", "Give half the code"], 0, "security");
  q("A website tells you to paste a command to 'fix' your browser. That is:", ["A ClickFix lure", "Standard maintenance", "A browser update", "A cookie notice"], 0, "security");
  q("The safest password is:", ["Three unrelated words, unique to that site", "Your postcode", "The site's name plus 123", "Your cat's name"], 0, "security");
  q("Two-factor authentication is strongest when it is:", ["A hardware key or passkey", "An SMS code", "A security question", "A memorable date"], 0, "security");
  q("An email is urgent, secret, and wants a payment moved. That pattern is:", ["Business email compromise", "Normal finance", "A newsletter", "Spam only"], 0, "security");
  q("Credential stuffing works because people do what?", ["Reuse passwords", "Use long passwords", "Change passwords often", "Use passkeys"], 0, "security");
  q("Before plugging in a found USB stick you should:", ["Not plug it in", "Scan it and plug it in", "Plug it into a spare laptop", "Format it first"], 0, "security");
  q("'Zero trust' means, roughly:", ["Verify every request, every time", "Trust nobody at all", "Block the internet", "Trust the internal network"], 0, "security");
  q("A signed driver from a real company can still be dangerous because:", ["The signature says who, not what", "Signatures are fake", "Drivers cannot be signed", "It only matters online"], 0, "security");
  q("The best first action in an incident is usually to:", ["Preserve evidence and scope it", "Reboot everything", "Wipe the machine", "Tell nobody"], 0, "security");
  q("Deepfake voice on a call asking for access should be met with:", ["A known callback number", "A password over the phone", "Immediate compliance", "A friendly chat"], 0, "security");
  q("Patching matters most for:", ["Internet-facing services", "Printers only", "Test machines", "Offline laptops"], 0, "security");
  q("A 'shadow IT' system is one that is:", ["Unmanaged and unowned", "Encrypted", "Air-gapped", "Owned by security"], 0, "security");
  q("Logs are useful chiefly because they let you:", ["Reconstruct what happened", "Fill disks", "Prove innocence", "Satisfy auditors only"], 0, "security");
  q("A phishing page's surest tell is:", ["The address bar", "A spelling mistake", "A missing logo", "Bad grammar"], 0, "security");
  q("Least privilege means:", ["Only the access the job needs", "One admin for everything", "No access for anyone", "Access reviewed yearly"], 0, "security");
  q("The Cheshire word for a small stream is:", ["Brook", "Beck", "Burn", "Gill"], 0);
  q("Cheshire's county town is:", ["Chester", "Crewe", "Warrington", "Macclesfield"], 0);
  q("Which motorway crosses the Thelwall Viaduct?", ["M6", "M56", "M53", "M62"], 0);
  q("Wybunbury's church tower is notable for:", ["Leaning", "Being round", "Being wooden", "Having no bells"], 0);
  q("The Shropshire Union Canal passes through which Cheshire town?", ["Nantwich", "Poynton", "Bollington", "Alsager"], 0);
  q("Hack Green, near Nantwich, was a what?", ["Secret nuclear bunker", "Airfield", "Salt works", "Silk mill"], 0);
  q("Delamere is Cheshire's largest what?", ["Forest", "Lake", "Moor", "Quarry"], 0);
  q("Which is a real Cheshire hill?", ["Shutlingsloe", "Shuttlecock", "Slaughterstone", "Shrike Fell"], 0);
  q("The Middlewood Way was formerly a what?", ["Railway line", "Canal", "Roman road", "Drovers' path"], 0);
  q("Which bird is Rostherne Mere best known for?", ["Wintering wildfowl", "Puffins", "Golden eagles", "Ostriches"], 0);
  M.QUIZ = QUIZ;

  M.define("knutsford_quiz", {
    name: "Madam Gaskell's Quiz", place: "Knutsford, the rooms above the bookshop", accent: "#d95f92",
    blurb: "Five questions. She writes your answers down either way.",
    init: function (p) {
      const a = A();
      const n = (p && p.rounds) || 5;
      const idx = [];
      for (let i = 0; i < QUIZ.length; i++) idx.push(i);
      U.shuffle(idx, this.rnd);
      this.qs = [];
      for (let i = 0; i < n; i++) {
        const src = QUIZ[idx[i]];
        const order = [0, 1, 2, 3];
        U.shuffle(order, this.rnd);
        const answers = [];
        let right = 0;
        for (let k = 0; k < order.length; k++) { answers.push(src.a[order[k]]); if (order[k] === src.r) right = k; }
        this.qs.push({ q: src.q, a: answers, r: right, tag: src.tag });
      }
      this.i = 0; this.pick = 0; this.right = 0; this.score = 0; this.wrongOn = -1; this.reveal = 0;
      a.music("town_knutsford");
    },
    right: function () { return (this.i + 1) + "/" + this.qs.length; },
    auto: function () { while (!this.over && this.i < this.qs.length) { this.answerWith(this.qs[this.i].r); this.reveal = 0; this.advance(); } },
    hints: function () { return [{ btn: "dir", label: "Choose" }, { btn: "a", label: "Answer" }, { btn: "b", label: "Leave" }]; },
    update: function (dt) {
      const a = A(), I = MQ.Input;
      if (this.reveal > 0) {
        this.reveal -= dt;
        if (this.reveal <= 0) this.advance();
        return;
      }
      if (I) {
        if (I.pressed("up")) { I.consume("up"); this.pick = (this.pick + 3) % 4; a.sfx("ui_move"); }
        if (I.pressed("down")) { I.consume("down"); this.pick = (this.pick + 1) % 4; a.sfx("ui_move"); }
      }
      if (a.confirmPressed()) { this.answerWith(this.pick); return; }
      const g = this.geom();
      for (let i = 0; i < 4; i++) if (tapIn(g.x, g.y + i * g.rh, g.w, g.rh - 6)) { this.answerWith(i); return; }
    },
    answerWith: function (i) {
      const a = A();
      this.chosen = i;
      const cur = this.qs[this.i];
      if (i === cur.r) { this.right++; this.score += 200; a.sfx("ui_select"); }
      else { this.wrongOn = this.i; a.sfx("ui_error"); a.buzz(40); }
      this.reveal = 900;
    },
    advance: function () {
      this.i++; this.chosen = -1; this.pick = 0;
      if (this.i >= this.qs.length) this.finishRound();
    },
    finishRound: function () {
      const a = A();
      const perfect = this.right === this.qs.length;
      let marks = 0, line;
      if (perfect) {
        const today = a.dayKey();
        a.setFlag("quiz_perfect_knutsford", true);
        if (M.state.quizDay !== today) { M.state.quizDay = today; marks = 3; a.addMarks(3); }
        line = marks ? "\"Five from five. Three Marks, and don't be smug.\"" : "\"Five from five again. I've already paid you today.\"";
      } else {
        line = "\"" + this.right + " out of " + this.qs.length + ". You'll do better when you've walked further.\"";
      }
      if (this.right > M.state.quizBest) M.state.quizBest = this.right;
      a.emit("quiz:round", { right: this.right, of: this.qs.length, perfect: perfect, marks: marks });
      finish(this, { score: this.score + (perfect ? 500 : 0), won: perfect, correct: this.right, marks: marks, line: line });
    },
    geom: function () {
      const a = A(), m = a.m();
      const w = Math.min(560, m.cw - 30);
      return { x: m.cx - w / 2, y: a.headerBottom() + 116, w: w, rh: Math.round(50 * m.k) };
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const cur = this.qs[Math.min(this.i, this.qs.length - 1)];
      const top = a.headerBottom();
      a.panel(ctx, m.l, top, m.cw, 100, { flat: true });
      a.text(ctx, cur.q, m.l + 16, top + 16, { size: "m", color: C.text, maxWidth: m.cw - 32 });
      a.text(ctx, cur.tag.toUpperCase(), m.r - 16, top + 76, { size: "s", align: "right", color: C.dim });
      const g = this.geom();
      for (let i = 0; i < 4; i++) {
        const y = g.y + i * g.rh;
        let accent = null;
        if (this.reveal > 0) { if (i === cur.r) accent = C.good; else if (i === this.chosen) accent = C.bad; }
        a.panel(ctx, g.x, y, g.w, g.rh - 6, { lit: i === this.pick && this.reveal <= 0, accent: accent });
        a.text(ctx, "ABCD".charAt(i) + ".  " + cur.a[i], g.x + 16, y + (g.rh - 6 - 18) / 2,
          { size: "m", color: accent || (i === this.pick ? C.brassLit : C.text), maxWidth: g.w - 32 });
      }
      let dots = "";
      for (let i = 0; i < this.qs.length; i++) dots += i < this.i ? "● " : "○ ";
      a.text(ctx, dots, m.cx, g.y + 4 * g.rh + 12, { size: "m", align: "center", color: C.brass });
    }
  });

  // =============================================================
  // 5. THE BOAT LIFT — balance the caissons
  // =============================================================
  M.define("lift_puzzle", {
    name: "Balance the Caissons", place: "Anderton Boat Lift", accent: "#7cc0d8",
    blurb: "Two tanks, one answer. Later rounds add crates that drink.",
    init: function (p) {
      const lvl = U.clamp((p && p.level) || M.state.liftLevel, 1, 5);
      this.level = lvl;
      this.tol = Math.max(1, 5 - lvl);
      this.moves = 0;
      this.maxMoves = 8 + lvl * 2;
      this.wet = lvl >= 3;
      this.crates = [];
      const n = 5 + lvl;
      for (let i = 0; i < n; i++) {
        this.crates.push({
          w: 4 + Math.floor(this.rnd() * (6 + lvl * 2)),
          side: this.rnd() < 0.5 ? 0 : 1,
          wet: this.wet && this.rnd() < 0.35
        });
      }
      this.sel = 0;
      this.score = 0;
      A().music("town_northwich");
    },
    right: function () { return "L" + this.level + " · " + (this.maxMoves - this.moves) + " moves"; },
    hints: function () { return [{ btn: "dir", label: "Crate" }, { btn: "a", label: "Shift" }, { btn: "b", label: "Leave" }]; },
    weight: function (side) {
      let n = 0;
      for (let i = 0; i < this.crates.length; i++) if (this.crates[i].side === side) n += this.crates[i].w;
      return n;
    },
    diff: function () { return Math.abs(this.weight(0) - this.weight(1)); },
    update: function () {
      const a = A(), I = MQ.Input;
      if (I) {
        if (I.pressed("up")) { I.consume("up"); this.sel = (this.sel + this.crates.length - 1) % this.crates.length; a.sfx("ui_move"); }
        if (I.pressed("down")) { I.consume("down"); this.sel = (this.sel + 1) % this.crates.length; a.sfx("ui_move"); }
        if (I.pressed("left")) { I.consume("left"); this.shift(this.sel, 0); }
        if (I.pressed("right")) { I.consume("right"); this.shift(this.sel, 1); }
      }
      if (a.confirmPressed()) this.shift(this.sel, this.crates[this.sel].side === 0 ? 1 : 0);
      const g = this.geom();
      for (let i = 0; i < this.crates.length; i++) {
        const r = this.crateRect(g, i);
        if (tapIn(r.x, r.y, r.w, r.h)) { this.sel = i; this.shift(i, this.crates[i].side === 0 ? 1 : 0); return; }
      }
    },
    shift: function (i, side) {
      const a = A();
      const c = this.crates[i];
      if (c.side === side) { a.sfx("ui_error"); return; }
      c.side = side;
      this.moves++;
      a.sfx("step_stone");
      // wet crates take on water every move — the lift's real problem
      for (let k = 0; k < this.crates.length; k++) if (this.crates[k].wet) this.crates[k].w++;
      if (this.diff() <= this.tol) return this.solved();
      if (this.moves >= this.maxMoves) return this.failed();
    },
    solved: function () {
      const a = A();
      const spare = this.maxMoves - this.moves;
      this.score = 400 + spare * 60 + this.level * 120;
      M.state.liftLevel = Math.min(5, this.level + 1);
      a.setFlag("lift_level", M.state.liftLevel);
      if (this.level >= 3) a.setFlag("caissons_balanced", true);
      a.sfx("achievement");
      a.emit("minigame:solved", { id: "lift_puzzle", level: this.level });
      finish(this, {
        score: this.score, won: true, level: this.level, tokens: 0,
        line: this.diff() === 0 ? "Dead level. The keeper says nothing, which is praise." : "Within tolerance. The gates open."
      });
    },
    failed: function () {
      finish(this, { score: Math.max(0, 200 - this.diff() * 10), won: false, level: this.level,
        line: "The caissons sulk at " + this.diff() + " tonnes apart. Try it again." });
    },
    geom: function () {
      const a = A(), m = a.m();
      const top = a.headerBottom() + 8, bot = a.footerTop() - 8;
      return { top: top, bot: bot, cx: m.cx, lx: m.l + 20, rx: m.r - 20, m: m };
    },
    crateRect: function (g, i) {
      const c = this.crates[i];
      const listX = c.side === 0 ? g.lx : g.cx + 30;
      let n = 0;
      for (let k = 0; k < i; k++) if (this.crates[k].side === c.side) n++;
      const w = Math.min(200, (g.m.cw / 2) - 50);
      return { x: listX, y: g.top + 90 + n * 34, w: w, h: 28 };
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const g = this.geom();
      const w0 = this.weight(0), w1 = this.weight(1);
      const tilt = U.clamp((w0 - w1) / 40, -1, 1);
      // the two caissons on a beam
      const beamY = g.top + 46;
      ctx.strokeStyle = C.brass; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(m.cx - 200, beamY + tilt * 22); ctx.lineTo(m.cx + 200, beamY - tilt * 22); ctx.stroke();
      ctx.fillStyle = C.slate;
      ctx.fillRect(m.cx - 240, beamY + tilt * 26, 90, 26);
      ctx.fillRect(m.cx + 150, beamY - tilt * 26, 90, 26);
      a.text(ctx, w0 + "t", m.cx - 195, beamY + tilt * 26 + 4, { size: "m", align: "center", color: C.text });
      a.text(ctx, w1 + "t", m.cx + 195, beamY - tilt * 26 + 4, { size: "m", align: "center", color: C.text });
      a.text(ctx, "difference " + this.diff() + "t · tolerance " + this.tol + "t",
        m.cx, g.top + 6, { size: "s", align: "center", color: this.diff() <= this.tol ? C.good : C.textDim });
      a.text(ctx, "WEST", g.lx, g.top + 70, { size: "s", color: C.brass });
      a.text(ctx, "EAST", g.cx + 30, g.top + 70, { size: "s", color: C.brass });
      for (let i = 0; i < this.crates.length; i++) {
        const c = this.crates[i], r = this.crateRect(g, i);
        a.panel(ctx, r.x, r.y, r.w, r.h, { lit: i === this.sel, accent: i === this.sel ? C.brassLit : (c.wet ? C.canal : null) });
        a.text(ctx, (c.wet ? "~ " : "") + c.w + " tonnes", r.x + 10, r.y + 5, { size: "s", color: c.wet ? C.signal : C.text });
      }
      if (this.wet) a.text(ctx, "~ crates take on water with every move.", m.l + 8, g.bot - 20, { size: "s", color: C.signal });
    }
  });

  // =============================================================
  // 6. THE TIMETABLE — Crewe platform allocation
  // =============================================================
  M.define("timetable_puzzle", {
    name: "Platform Allocation", place: "Crewe, the panel above the concourse", accent: "#e6c24a",
    blurb: "Every service needs a road. Late rounds hand you a delay card.",
    init: function (p) {
      const lvl = U.clamp((p && p.level) || M.state.ttLevel, 1, 5);
      this.level = lvl;
      this.platforms = 3 + Math.floor(lvl / 2);
      const n = 4 + lvl;
      this.trains = [];
      const heads = ["Manchester", "Liverpool", "Chester", "Stoke", "Shrewsbury", "London", "Holyhead", "Cardiff", "Glasgow", "Derby"];
      for (let i = 0; i < n; i++) {
        const at = Math.floor(this.rnd() * 22);
        this.trains.push({
          id: i, to: heads[Math.floor(this.rnd() * heads.length)],
          at: at, dur: 2 + Math.floor(this.rnd() * 3),
          plat: -1, delayed: false
        });
      }
      this.trains.sort(function (a, b) { return a.at - b.at; });
      this.sel = 0;
      this.delayLeft = lvl >= 3 ? 1 : 0;
      this.delayed = false;
      this.score = 0;
      A().music("place_station");
    },
    right: function () { return "L" + this.level + " · " + this.platforms + " roads"; },
    hints: function () {
      return [{ btn: "dir", label: "Service / road" }, { btn: "a", label: "Set" }, { btn: "b", label: "Leave" }];
    },
    clash: function (i) {
      const t = this.trains[i];
      if (t.plat < 0) return false;
      for (let k = 0; k < this.trains.length; k++) {
        if (k === i) continue;
        const o = this.trains[k];
        if (o.plat !== t.plat) continue;
        if (t.at < o.at + o.dur && o.at < t.at + t.dur) return true;
      }
      return false;
    },
    clashes: function () {
      let n = 0;
      for (let i = 0; i < this.trains.length; i++) if (this.clash(i)) n++;
      return n;
    },
    allSet: function () {
      for (let i = 0; i < this.trains.length; i++) if (this.trains[i].plat < 0) return false;
      return true;
    },
    update: function () {
      const a = A(), I = MQ.Input;
      if (I) {
        if (I.pressed("up")) { I.consume("up"); this.sel = (this.sel + this.trains.length - 1) % this.trains.length; a.sfx("ui_move"); }
        if (I.pressed("down")) { I.consume("down"); this.sel = (this.sel + 1) % this.trains.length; a.sfx("ui_move"); }
        if (I.pressed("left")) { I.consume("left"); this.setPlat(this.sel, this.trains[this.sel].plat - 1); }
        if (I.pressed("right")) { I.consume("right"); this.setPlat(this.sel, this.trains[this.sel].plat + 1); }
      }
      if (a.confirmPressed()) { if (this.allSet()) this.submit(); else this.setPlat(this.sel, this.trains[this.sel].plat + 1); }
      const g = this.geom();
      for (let i = 0; i < this.trains.length; i++) {
        for (let pl = 0; pl < this.platforms; pl++) {
          const x = g.gx + pl * g.pw, y = g.gy + i * g.rh;
          if (tapIn(x, y, g.pw - 3, g.rh - 3)) { this.sel = i; this.setPlat(i, pl); return; }
        }
      }
      if (this.allSet() && tapIn(g.bx, g.by, g.bw, g.bh)) this.submit();
    },
    setPlat: function (i, pl) {
      const a = A();
      if (pl < -1) pl = this.platforms - 1;
      if (pl >= this.platforms) pl = -1;
      this.trains[i].plat = pl;
      a.sfx("ui_move");
      // the delay card: the moment everything is placed, one service slips
      if (this.delayLeft > 0 && this.allSet() && !this.delayed) {
        this.delayLeft--; this.delayed = true;
        const k = Math.floor(this.rnd() * this.trains.length);
        this.trains[k].at += 2; this.trains[k].delayed = true;
        a.sfx("train_whistle");
        a.toast("DELAY: the " + this.trains[k].to + " is running two late.");
      }
    },
    submit: function () {
      const a = A();
      const bad = this.clashes();
      if (bad) {
        a.sfx("ui_error");
        a.toast(bad + " conflict" + (bad === 1 ? "" : "s") + " on the panel.");
        return;
      }
      this.score = 500 + this.level * 150 + (this.delayed ? 200 : 0);
      a.setFlag("timetable_perfect", true);
      M.state.ttLevel = Math.min(5, this.level + 1);
      a.setFlag("timetable_level", M.state.ttLevel);
      a.sfx("achievement");
      a.emit("minigame:solved", { id: "timetable_puzzle", level: this.level });
      finish(this, { score: this.score, won: true, level: this.level,
        line: this.delayed ? "Delay absorbed. Nobody on the concourse will ever know." : "Every road clear. On time, every time." });
    },
    geom: function () {
      const a = A(), m = a.m();
      const gy = a.headerBottom() + 46;
      const labelW = Math.round(m.cw * 0.38);
      const gx = m.l + labelW;
      const pw = Math.floor((m.cw - labelW - 10) / this.platforms);
      const rh = Math.round(Math.min(40 * m.k, (a.footerTop() - gy - 60) / this.trains.length));
      return { gx: gx, gy: gy, pw: pw, rh: rh, labelW: labelW, m: m,
        bx: m.cx - 90, by: a.footerTop() - 46, bw: 180, bh: 36 };
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const g = this.geom();
      for (let pl = 0; pl < this.platforms; pl++) {
        a.text(ctx, "P" + (pl + 1), g.gx + pl * g.pw + g.pw / 2, g.gy - 22, { size: "s", align: "center", color: C.brass });
      }
      for (let i = 0; i < this.trains.length; i++) {
        const t = this.trains[i], y = g.gy + i * g.rh;
        const sel = i === this.sel;
        const bad = this.clash(i);
        a.text(ctx, (t.delayed ? "* " : "") + fmtTime(t.at) + " " + t.to,
          m.l + 4, y + 4, { size: "s", color: bad ? C.bad : sel ? C.brassLit : C.text, maxWidth: g.labelW - 12 });
        a.text(ctx, t.dur + " min", m.l + 4, y + 20, { size: "s", color: C.dim });
        for (let pl = 0; pl < this.platforms; pl++) {
          const x = g.gx + pl * g.pw;
          const on = t.plat === pl;
          ctx.fillStyle = on ? (bad ? "rgba(224,82,82,0.55)" : "rgba(95,201,106,0.45)") : "rgba(255,255,255,0.05)";
          ctx.fillRect(x, y, g.pw - 3, g.rh - 3);
          if (sel) { ctx.strokeStyle = C.brassLit; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, g.pw - 4, g.rh - 4); }
        }
      }
      const ok = this.allSet() && !this.clashes();
      a.button(ctx, ok ? "SEND IT" : this.allSet() ? this.clashes() + " CONFLICTS" : "ALLOCATE ALL", g.bx, g.by, g.bw, g.bh, { active: ok, disabled: !ok });
      if (this.delayLeft > 0) a.text(ctx, "A delay card is in the pack.", m.l + 4, g.by + 8, { size: "s", color: C.warn });
    }
  });
  function fmtTime(n) {
    const h = 9 + Math.floor(n / 12), mm = (n % 12) * 5;
    return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }

  // =============================================================
  // 7. FRUIT MACHINE — the county's oldest tragedy
  // =============================================================
  const FM = ["BELL", "LEMON", "CAT", "SALT", "SEVEN"];
  M.define("fruit_machine", {
    name: "The Fruit Machine", place: "Any tap room, any evening", accent: "#e05252",
    blurb: "Two bells and a lemon, forever.",
    init: function () {
      this.reels = [0, 0, 0]; this.spin = [0, 0, 0]; this.stage = "idle"; this.score = 0; this.spins = 0; this.credits = 3;
    },
    right: function () { return this.credits + " goes left"; },
    hints: function () { return [{ btn: "a", label: this.stage === "idle" ? "Pull" : "Stop" }, { btn: "b", label: "Leave" }]; },
    update: function (dt) {
      const a = A();
      if (this.stage === "spin") {
        for (let i = 0; i < 3; i++) if (this.spin[i] > 0) { this.spin[i] -= dt; this.reels[i] = Math.floor(this.rnd() * FM.length); }
        if (this.spin[0] <= 0 && this.spin[1] <= 0 && this.spin[2] <= 0) this.settle();
        return;
      }
      if (a.confirmPressed() || a.anyTap()) {
        if (this.credits <= 0) { finish(this, { score: this.score, won: this.score > 0, line: "\"That's your lot,\" says the landlord, not unkindly." }); return; }
        this.credits--; this.spins++;
        this.stage = "spin";
        this.spin = [700, 1000, 1400];
        a.sfx("ui_select");
      }
    },
    settle: function () {
      const a = A();
      this.stage = "idle";
      const [x, y, z] = this.reels;
      if (x === y && y === z) { this.score += 500; a.sfx("achievement"); a.toast("Three " + FM[x] + "! The room looks over."); this.credits += 2; }
      else if (x === y || y === z || x === z) { this.score += 50; a.sfx("coin"); }
      else a.sfx("ui_error");
      if (this.credits <= 0) finish(this, { score: this.score, won: this.score >= 500, tokens: Math.floor(this.score / 250), line: this.score >= 500 ? "You leave while you're ahead. Nobody does that." : "Two bells and a lemon. The county's oldest tragedy." });
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      const y = m.cy - 40;
      for (let i = 0; i < 3; i++) {
        const x = m.cx - 190 + i * 130;
        a.panel(ctx, x, y, 120, 80, { lit: this.spin[i] > 0 });
        a.text(ctx, FM[this.reels[i]], x + 60, y + 30, { size: "m", align: "center", color: this.spin[i] > 0 ? C.textDim : C.brassLit });
      }
      a.text(ctx, "Score " + this.score, m.cx, y + 110, { size: "m", align: "center", color: C.text });
    }
  });

  // =============================================================
  // Prizes — what the tokens are for
  // =============================================================
  M.PRIZES = [
    { id: "tm_static_wave", price: 40, name: "Skill Card: Static Wave" },
    { id: "tm_agility", price: 40, name: "Skill Card: Agility" },
    { id: "tm_encrypt", price: 55, name: "Skill Card: Encrypt" },
    { id: "capsule_quick", price: 12, name: "Quick Capsule", repeat: true },
    { id: "capsule_net", price: 12, name: "Net Capsule", repeat: true },
    { id: "lucky_coin", price: 90, name: "Lucky Coin" },
    { id: "arcade_pass", price: 150, name: "Arcade Pass", flag: "arcade_pass" }
  ];
  M.prizes = function () {
    const out = [];
    for (let i = 0; i < M.PRIZES.length; i++) {
      const p = M.PRIZES[i];
      out.push({ id: p.id, name: p.name || A().itemName(p.id), price: p.price,
        taken: !p.repeat && !!M.state.redeemed[p.id] });
    }
    return out;
  };
  M.redeem = function (id) {
    const a = A();
    let p = null;
    for (let i = 0; i < M.PRIZES.length; i++) if (M.PRIZES[i].id === id) p = M.PRIZES[i];
    if (!p) return { ok: false, msg: "The counter doesn't stock it." };
    if (!p.repeat && M.state.redeemed[id]) return { ok: false, msg: "You've had one of those." };
    if (!M.spendTokens(p.price)) return { ok: false, msg: "Not enough tokens. Play something." };
    M.state.redeemed[id] = (M.state.redeemed[id] || 0) + 1;
    if (p.flag) a.setFlag(p.flag, true);
    else a.give(id, 1);
    a.sfx("coin");
    return { ok: true, msg: "\"" + (p.name || A().itemName(id)) + ". Go on then.\"" };
  };


  // =============================================================
  // The arcade front-of-house: pick a cabinet, spend your tokens
  // =============================================================
  M.CABINETS = ["arcade_packet_run", "arcade_salt_rush", "arcade_type_trainer"];
  M.arcadeScene = {
    id: "arcade", touchPad: false,
    enter: function (params) {
      this.p = params || {};
      this.tab = 0;
      this.cabs = A().menuState(M.cabinetItems(this.p.only));
      this.shop = A().menuState(M.prizeItems());
      this.busy = false;
      A().sfx("ui_open");
      A().music("town_warrington");
    },
    exit: function () { A().sfx("ui_close"); },
    resume: function () { this.cabs.setItems(M.cabinetItems(this.p.only)); this.shop.setItems(M.prizeItems()); this.busy = false; },
    update: function () {
      if (this.busy) return;
      const a = A();
      const tp = a.tabTapped();
      if (tp >= 0) { this.tab = tp; a.sfx("ui_move"); return; }
      if (a.backPressed()) { MQ.Scenes.pop(null); return; }
      const st = this.tab === 0 ? this.cabs : this.shop;
      const r = st.update();
      if (!r) return;
      if (r.cancel) { MQ.Scenes.pop(null); return; }
      const item = r.item || st.items[r.selected];
      if (!item || item.disabled) { if (item) a.sfx("ui_error"); return; }
      const self = this;
      self.busy = true;
      if (this.tab === 0) {
        M.start(item.value).then(function () { self.resume(); });
      } else {
        const res = M.redeem(item.value);
        a.sfx(res.ok ? "coin" : "ui_error");
        a.say([res.msg], { name: "Prize Counter" }).then(function () { self.resume(); });
      }
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#1a1030", bottom: "#08060f" });
      a.header(ctx, {
        title: "Warrington Wire Arcade", accent: "#3fe0c8",
        sub: M.tokenRate() > 1 ? "Friday — double tokens all day" : "Three cabinets and a prize counter",
        right: M.tokens() + " tokens"
      });
      const top = a.headerBottom();
      const th = a.tabStrip(ctx, ["Cabinets", "Prizes"], this.tab, { x: m.l, y: top, w: m.cw });
      const y = top + th + 8;
      const h = a.footerTop() - y - 4;
      const listW = Math.round(m.cw * 0.55) - 12;
      const st = this.tab === 0 ? this.cabs : this.shop;
      a.list(st, ctx, { x: m.l, y: y, w: listW, h: h, rowH: Math.round(56 * m.k) });
      const px = m.l + listW + 20, pw = m.r - px;
      a.panel(ctx, px, y, pw, h, { flat: true });
      const item = st.items[st.cursor];
      if (item && this.tab === 0) {
        const g = M.GAMES[item.value];
        a.text(ctx, g.name, px + 14, y + 12, { size: "l", color: g.accent || C.brassLit, maxWidth: pw - 28 });
        a.text(ctx, g.blurb, px + 14, y + 48, { size: "s", color: C.text, maxWidth: pw - 28 });
        a.text(ctx, "Best: " + M.highScore(item.value), px + 14, y + 108, { size: "m", color: C.brass });
        a.text(ctx, (M.state.plays[item.value] || 0) + " goes so far", px + 14, y + 136, { size: "s", color: C.textDim });
      } else if (item) {
        a.text(ctx, item.label, px + 14, y + 12, { size: "l", color: C.brassLit, maxWidth: pw - 28 });
        a.text(ctx, item.price + " tokens (you have " + M.tokens() + ")", px + 14, y + 52,
          { size: "m", color: M.tokens() >= item.price ? C.good : C.bad });
        if (item.disabled) a.text(ctx, "You have had one of those.", px + 14, y + 84, { size: "s", color: C.dim });
      }
      a.footer(ctx, [{ btn: "a", label: this.tab === 0 ? "Play" : "Take it" }, { btn: "b", label: "Out" }, { btn: "lr", label: "Tab" }]);
    }
  };
  M.cabinetItems = function (only) {
    const ids = only || M.CABINETS, out = [];
    for (let i = 0; i < ids.length; i++) {
      const g = M.GAMES[ids[i]];
      if (!g) continue;
      out.push({ label: g.name, value: ids[i], right: M.highScore(ids[i]) ? "best " + M.highScore(ids[i]) : "", sub: g.blurb });
    }
    return out;
  };
  M.prizeItems = function () {
    const p = M.prizes(), out = [];
    for (let i = 0; i < p.length; i++) {
      out.push({ label: p[i].name, value: p[i].id, price: p[i].price,
        right: p[i].taken ? "taken" : p[i].price + "tk", disabled: p[i].taken,
        sub: p[i].taken ? "Already yours." : "" });
    }
    return out;
  };
  M.arcade = function (params) { return A().open(M.arcadeScene, params || {}); };

  // =============================================================
  // Public entry
  // =============================================================
  // MQ.Interact calls MQ.Minigames.start(id) at a cabinet or a panel.
  M.start = function (id, opts) {
    const a = A();
    if (id === "arcade" || id === undefined) return M.arcade(opts);
    const def = M.GAMES[id];
    if (!def) return a.say(["It's out of order. There's a note on it in biro."]);
    const scene = base(id, def);
    return a.open(scene, opts || {}).then(function (res) {
      if (res && res.line && !res.quit) a.toast(res.line);
      return res;
    });
  };
  M.play = M.start;
  M.has = function (id) { return !!M.GAMES[id]; };

  A().provider(M, "minigames", {
    save: function () {
      return { scores: M.state.scores, plays: M.state.plays, tokens: M.state.tokens,
        quizDay: M.state.quizDay, quizBest: M.state.quizBest,
        liftLevel: M.state.liftLevel, ttLevel: M.state.ttLevel, redeemed: M.state.redeemed };
    },
    load: function (o) {
      M.state = { scores: {}, plays: {}, tokens: 0, quizDay: 0, quizBest: 0, liftLevel: 1, ttLevel: 1, redeemed: {} };
      if (!o) return;
      M.state.scores = o.scores || {}; M.state.plays = o.plays || {};
      M.state.tokens = o.tokens || 0; M.state.quizDay = o.quizDay || 0; M.state.quizBest = o.quizBest || 0;
      M.state.liftLevel = o.liftLevel || 1; M.state.ttLevel = o.ttLevel || 1;
      M.state.redeemed = o.redeemed || {};
    }
  });

  MQ.Minigames = M;
})();
