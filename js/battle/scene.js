// =============================================================
// MonsterQuest v2 — MQ.BattleScene
// The battle UI. Reads the engine's event log and renders it;
// feeds player actions back with engine.choose(). Touch-first:
// every control is a tap target as well as a key.
// =============================================================
(function () {
  "use strict";
  const NS = window.MQ;
  const U = NS.U;
  const T = NS.Text;
  const UI = NS.UI;
  const BE = NS.BattleEffects;

  const BASE_W = 960, BASE_H = 540;

  // ---- timing (scaled by Settings.battleSpeed) ------------------
  function speed() {
    const s = NS.Settings && NS.Settings.battleSpeed;
    return s === undefined ? 1 : U.clamp(s, 0.25, 3);
  }
  function ms(n) { return n / speed(); }

  // ---- sfx / music helpers -------------------------------------
  function sfx(id) {
    if (NS.SFX && NS.SFX.play) NS.SFX.play(id);
    else if (NS.Audio && NS.Audio.sfx) NS.Audio.sfx(id);
  }
  function song(id) {
    if (NS.Audio && NS.Audio.playSong) NS.Audio.playSong(id);
  }

  // ---- tap hit-test register (no per-frame allocation) ---------
  const hits = {
    list: [], n: 0,
    reset: function () { this.n = 0; },
    add: function (x, y, w, h, id, arg) {
      let e = this.list[this.n];
      if (!e) e = this.list[this.n] = {};
      e.x = x; e.y = y; e.w = w; e.h = h; e.id = id; e.arg = arg;
      this.n++;
      return e;
    },
    at: function (px, py) {
      for (let i = this.n - 1; i >= 0; i--) {
        const e = this.list[i];
        if (px >= e.x && px <= e.x + e.w && py >= e.y && py <= e.y + e.h) return e;
      }
      return null;
    }
  };

  // ---- monster art ---------------------------------------------
  const artCache = {};
  function typeColour(t) {
    const d = NS.Data && NS.Data.types && NS.Data.types[t];
    return (d && d.color) || "#888";
  }
  function monsterCanvas(species, back, size, types) {
    const key = species + "|" + (back ? "b" : "f") + "|" + size;
    if (artCache[key]) return artCache[key];
    let cv = null;
    const MA = NS.MonsterArt;
    if (MA) {
      try {
        if (MA.get) cv = MA.get(species, { back: !!back, size: size });
        else if (MA.sprite) cv = MA.sprite(species, back, size);
        else if (MA.render) cv = MA.render(species, back, size);
      } catch (e) { cv = null; }
    }
    if (!cv || !cv.width) cv = proceduralMon(species, back, size, types);
    artCache[key] = cv;
    return cv;
  }
  // Fallback: a readable coloured shape with a face, seeded by species id.
  function proceduralMon(species, back, size, types) {
    const cv = document.createElement("canvas");
    cv.width = size; cv.height = size;
    const c = cv.getContext("2d");
    const seed = U.hash(String(species || "unknown"));
    const rnd = U.mulberry32(seed);
    const t1 = (types && types[0]) || "normal";
    const t2 = (types && types[1]) || t1;
    const c1 = typeColour(t1), c2 = typeColour(t2);
    const cx = size / 2, cy = size * 0.58;
    const rx = size * (0.28 + rnd() * 0.08), ry = size * (0.26 + rnd() * 0.08);
    // shadow
    c.fillStyle = "rgba(0,0,0,0.22)";
    c.beginPath(); c.ellipse(cx, size * 0.90, rx * 1.15, ry * 0.28, 0, 0, 6.3); c.fill();
    // body
    const g = c.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    g.addColorStop(0, U.shade ? U.shade(c1, 0.25) : c1);
    g.addColorStop(1, c2);
    c.fillStyle = g;
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 6.3); c.fill();
    // limbs / spines, varied by seed
    const spikes = 3 + Math.floor(rnd() * 4);
    c.fillStyle = c2;
    for (let i = 0; i < spikes; i++) {
      const a = -Math.PI + (i + 0.5) / spikes * Math.PI;
      const px = cx + Math.cos(a) * rx * 0.95, py = cy + Math.sin(a) * ry * 0.95;
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px + Math.cos(a) * size * 0.10, py + Math.sin(a) * size * 0.10);
      c.lineTo(px + Math.cos(a + 0.5) * size * 0.05, py + Math.sin(a + 0.5) * size * 0.05);
      c.closePath(); c.fill();
    }
    // feet
    c.fillStyle = U.shade ? U.shade(c2, -0.25) : c2;
    c.fillRect(cx - rx * 0.7, cy + ry * 0.75, rx * 0.5, size * 0.07);
    c.fillRect(cx + rx * 0.2, cy + ry * 0.75, rx * 0.5, size * 0.07);
    if (!back) {
      // face
      const ey = cy - ry * 0.25, ex = rx * 0.40;
      c.fillStyle = "#fbfbf6";
      c.beginPath(); c.ellipse(cx - ex, ey, size * 0.055, size * 0.062, 0, 0, 6.3); c.fill();
      c.beginPath(); c.ellipse(cx + ex, ey, size * 0.055, size * 0.062, 0, 0, 6.3); c.fill();
      c.fillStyle = "#14141c";
      c.beginPath(); c.ellipse(cx - ex, ey + size * 0.008, size * 0.026, size * 0.030, 0, 0, 6.3); c.fill();
      c.beginPath(); c.ellipse(cx + ex, ey + size * 0.008, size * 0.026, size * 0.030, 0, 0, 6.3); c.fill();
      c.strokeStyle = "#14141c"; c.lineWidth = Math.max(2, size * 0.012);
      c.beginPath(); c.arc(cx, cy + ry * 0.12, size * 0.07, 0.25, Math.PI - 0.25); c.stroke();
    }
    return cv;
  }

  // ---- view models ---------------------------------------------
  function newVm() {
    return {
      uid: null, name: "", species: null, level: 1, hp: 0, hpShown: 0, max: 1,
      status: null, od: 0, odShown: 0, types: null, exp: 0, expShown: 0, expNext: 1,
      alpha: 1, dy: 0, shake: 0, flash: 0, active: false, revealed: false,
      stages: null, gone: false, enterT: 0
    };
  }

  // =============================================================
  const Scene = {
    id: "battle",
    // A battle needs no walking, and the canvas pad's A/B/RUN/START sat right
    // on top of the message box and the move menu on a short screen. Every
    // control here is already a tap target (see `hits`), so the pad stands down.
    touchPad: false,
    engine: null,
    enter: function (params) {
      const S = this;
      params = params || {};
      S.engine = params.engine;
      S.opts = params.opts || {};
      S.queue = [];
      S.mode = "play";
      S.anim = null;
      S.msg = { text: "", shown: 0, t: 0, hold: 0, done: true };
      S.vm = [[newVm(), newVm()], [newVm(), newVm()]];
      S.field = { weather: null, terrain: null, screens: [{}, {}] };
      S.menuIndex = 0; S.moveIndex = 0; S.partyIndex = 0; S.bagIndex = 0; S.agentIndex = 0;
      S.bagTab = 0;
      S.bossPhases = 0; S.bossPhase = 0;
      S.result = null;
      S.finished = false;            // the scene is a singleton: reset every battle
      S.forcedSwitch = false;
      S.options = null;
      S.meadowDodged = false;
      S.time = 0;
      S.fxParticles = [];
      S.catchAnim = null;
      S.timing = null;
      S.intro = null;
      S.log = [];
      S.flashScreen = 0;
      S.shakeScreen = 0;
      S.hint = "";
      if (S.engine) {
        S.engine.start();
        S.pull();
      }
    },
    exit: function () {
      if (NS.Audio && NS.Audio.stopSong) NS.Audio.stopSong();
    },
    onResize: function () { },

    // ---- event pump -------------------------------------------
    pull: function () {
      const S = this;
      if (!S.engine) return;
      const ev = S.engine.drain();
      for (let i = 0; i < ev.length; i++) S.queue.push(ev[i]);
    },

    vmFor: function (side, uid) {
      const S = this;
      const row = S.vm[side];
      for (let i = 0; i < row.length; i++) if (row[i].uid === uid) return row[i];
      return null;
    },
    vmSlot: function (side, slot) { return this.vm[side][slot || 0]; },

    say: function (text, hold) {
      const S = this;
      S.msg.text = text;
      S.msg.shown = 0;
      S.msg.t = 0;
      S.msg.done = false;
      S.msg.hold = hold === undefined ? ms(520) : hold;
      S.log.push(text);
      if (S.log.length > 40) S.log.shift();
    },

    playNext: function () {
      const S = this;
      if (S.anim) return;
      if (!S.queue.length) { S.pull(); }
      if (!S.queue.length) return;
      const e = S.queue.shift();
      switch (e.type) {
        case "intro":
          S.intro = e;
          S.bossPhases = e.bossPhases || 0;
          S.bossPhase = 0;
          song(e.music);
          break;
        case "msg":
          S.say(e.text);
          S.anim = { kind: "msg", t: 0 };
          break;
        case "switch": {
          const vm = S.vmSlot(e.side, e.slot);
          if (vm.uid && vm.uid !== e.uid) { vm.gone = true; }
          vm.uid = e.uid; vm.name = e.name; vm.species = e.species; vm.level = e.level;
          vm.hp = e.hp; vm.hpShown = e.hp; vm.max = e.max; vm.status = e.status;
          vm.od = e.overdrive || 0; vm.odShown = vm.od; vm.types = e.types;
          vm.active = true; vm.gone = false; vm.alpha = 0; vm.dy = e.side === 0 ? 60 : -40;
          vm.enterT = 0; vm.stages = null; vm.revealed = false;
          S.anim = { kind: "enter", t: 0, dur: ms(360), vm: vm };
          sfx(e.side === 0 ? "capsule_throw" : "warp");
          break;
        }
        case "hp": {
          const vm = S.vmFor(e.side, e.uid);
          if (!vm) break;
          vm.hp = e.to; vm.max = e.max || vm.max;
          S.anim = { kind: "hp", t: 0, dur: ms(Math.min(700, 220 + Math.abs(e.from - e.to) * 6)), vm: vm, from: e.from, to: e.to };
          if (e.delta < 0) { vm.shake = ms(220); S.shakeScreen = Math.max(S.shakeScreen, ms(120)); }
          break;
        }
        case "anim":
          S.startFx(e);
          break;
        case "crit":
          sfx("crit");
          S.flashScreen = ms(90);
          break;
        case "effectiveness":
          sfx(e.eff > 1 ? "hit_super" : e.eff < 1 ? "hit_weak" : "hit_normal");
          break;
        case "status": {
          const vm = S.vmFor(e.side, e.uid);
          if (vm) { if (e.status === "cnf") vm.conf = e.on; else vm.status = e.on ? e.status : null; }
          if (e.on) sfx("status_apply");
          break;
        }
        case "stage": {
          const vm = S.vmFor(e.side, e.uid);
          if (vm) {
            if (e.reset || e.copied) vm.stages = null;
            else { vm.stages = vm.stages || {}; vm.stages[e.stat] = e.value; }
          }
          sfx(e.delta > 0 ? "stage_up" : "stage_down");
          S.anim = { kind: "wait", t: 0, dur: ms(120) };
          break;
        }
        case "overdrive": {
          const vm = S.vmFor(e.side, e.uid);
          if (vm) { vm.od = e.value; if (e.value >= 100 && (e.from || 0) < 100) sfx("overdrive_ready"); }
          break;
        }
        case "weather":
          S.field.weather = e.weather;
          break;
        case "terrain":
          S.field.terrain = e.terrain;
          break;
        case "field":
          if (e.side !== undefined && e.screen) S.field.screens[e.side][e.screen] = e.turns;
          break;
        case "faint": {
          const vm = S.vmFor(e.side, e.uid);
          sfx("faint");
          if (vm) S.anim = { kind: "faint", t: 0, dur: ms(520), vm: vm };
          break;
        }
        case "catch":
          S.catchAnim = { t: 0, shakes: e.shakes, success: e.success, critical: e.critical, phase: 0 };
          S.anim = { kind: "catch", t: 0, dur: ms(700 + e.shakes * 520 + (e.success ? 600 : 300)) };
          sfx("capsule_throw");
          break;
        case "levelup":
          sfx("fanfare_evolve");
          S.flashScreen = ms(120);
          break;
        case "reveal": {
          const vm = S.vmFor(e.side, e.uid);
          if (vm) { vm.revealed = true; vm.revealedMoves = e.moves; vm.revealedAbility = e.ability; vm.revealedGear = e.gear; }
          break;
        }
        case "agent":
          if (e.sfx) sfx(e.sfx);
          break;
        case "phase":
          S.bossPhase = e.index;
          S.bossPhases = e.total || S.bossPhases;
          S.flashScreen = ms(200);
          S.shakeScreen = ms(300);
          sfx("oracle_tag");
          break;
        case "guard":
          sfx("ui_select");
          break;
        case "menu":
          // The engine is about to ask for something; nothing to draw.
          break;
        case "end":
          S.result = e.result;
          break;
        default:
          break;
      }
    },

    startFx: function (e) {
      const S = this;
      const vm = S.vmFor(e.side, e.uid);
      const name = e.name;
      if (NS.FX && NS.FX.battleAnim) {
        try { NS.FX.battleAnim(name, { side: e.side, move: e.move, eff: e.eff, crit: e.crit }); } catch (err) { }
      }
      if (name === "use") { S.anim = { kind: "wait", t: 0, dur: ms(140) }; return; }
      if (name === "miss") { S.say("", 0); S.anim = { kind: "wait", t: 0, dur: ms(120) }; return; }
      if (name === "overdrive_fire") { sfx("overdrive_fire"); S.flashScreen = ms(240); S.shakeScreen = ms(320); S.anim = { kind: "wait", t: 0, dur: ms(420) }; return; }
      if (name === "overdrive_ready") { sfx("overdrive_ready"); return; }
      if (vm) {
        vm.flash = ms(200);
        S.spawnBurst(e.side, e.eff, e.crit, e.move);
      }
      S.anim = { kind: "wait", t: 0, dur: ms(180) };
    },

    spawnBurst: function (side, eff, crit, moveId) {
      const S = this;
      const md = moveId && NS.Battle ? NS.Battle.moveData(moveId) : null;
      const col = md ? typeColour(md.type) : "#ffffff";
      const p = S.slotPos(side, 0);
      const n = crit ? 18 : 12;
      for (let i = 0; i < n; i++) {
        S.fxParticles.push({
          x: p.x, y: p.y, vx: (Math.random() - 0.5) * 260, vy: (Math.random() - 0.9) * 220,
          life: 0, max: 420 + Math.random() * 220, col: col, r: 3 + Math.random() * 4
        });
      }
      if (S.fxParticles.length > 160) S.fxParticles.splice(0, S.fxParticles.length - 160);
    },

    // ---- layout ------------------------------------------------
    // Everything else in here measures off this. It works in the safe content
    // box rather than the raw view, so a hole-punch camera or a gesture bar
    // never lands on a gauge, and the message box is as tall as its text needs.
    layout: function () {
      const V = NS.View;
      const w = V ? V.w : BASE_W;
      const h = V ? V.h : BASE_H;
      const safe = (V && V.safe) || { top: 0, right: 0, bottom: 0, left: 0 };
      const L = this._L || (this._L = {});
      L.w = w; L.h = h;
      L.left = safe.left + 12; L.right = w - safe.right - 12;
      L.top = safe.top + 10; L.bottom = h - safe.bottom - 8;
      L.cw = L.right - L.left;
      const line = T.lineHeight("m") + 6;
      L.msgLine = line;
      L.boxH = Math.round(Math.min(Math.max(112, 3 * line + 34), (L.bottom - L.top) * 0.34));
      L.boxY = L.bottom - L.boxH;
      // The monsters are sized against the strip of field that is actually
      // left above the message box, not the whole view — on a 540-high screen
      // the player's sprite used to stand with its feet inside the box.
      const field = Math.max(80, L.boxY - L.top);
      L.playerSize = Math.round(Math.min(field * 0.56, h * 0.38));
      L.enemySize = Math.round(Math.min(field * 0.46, h * 0.30));
      L.enemyX = L.left + L.cw * 0.66; L.enemyY = L.top + 30 + L.enemySize / 2;
      L.playerX = L.left + L.cw * 0.24; L.playerY = L.boxY - 16 - L.playerSize / 2;
      L.infoW = Math.min(360, Math.max(230, L.cw * 0.42));
      L.infoH = Math.round(T.px("m") + T.px("s") + 30);
      L.chipH = Math.max(18, T.px("s") + 4);
      // leave room above the enemy panel for its type chips AND the turn counter
      L.enemyInfoX = L.left; L.enemyInfoY = L.top + T.px("s") + L.chipH + 8;
      L.playerInfoX = L.right - L.infoW; L.playerInfoY = L.boxY - L.infoH - 26;
      return L;
    },
    slotPos: function (side, slot) {
      const L = this.layout();
      const p = this._P || (this._P = { x: 0, y: 0 });
      if (side === 1) { p.x = L.enemyX + slot * 90; p.y = L.enemyY; }
      else { p.x = L.playerX - slot * 90; p.y = L.playerY; }
      return p;
    },

    // ---- update ------------------------------------------------
    update: function (dt) {
      const S = this;
      S.time += dt;
      if (S.flashScreen > 0) S.flashScreen -= dt;
      if (S.shakeScreen > 0) S.shakeScreen -= dt;

      // particles
      for (let i = S.fxParticles.length - 1; i >= 0; i--) {
        const p = S.fxParticles[i];
        p.life += dt;
        if (p.life > p.max) { S.fxParticles.splice(i, 1); continue; }
        p.x += p.vx * dt / 1000;
        p.y += p.vy * dt / 1000;
        p.vy += 620 * dt / 1000;
      }

      // typewriter
      if (!S.msg.done) {
        const cps = (NS.Dialog && NS.Dialog.CPS ? NS.Dialog.CPS : 45) * speed();
        S.msg.t += dt;
        S.msg.shown = Math.min(S.msg.text.length, Math.floor(S.msg.t * cps / 1000));
        if (S.msg.shown >= S.msg.text.length) S.msg.done = true;
      }

      // vm tweens
      for (let s = 0; s < 2; s++) {
        for (let k = 0; k < 2; k++) {
          const vm = S.vm[s][k];
          if (!vm.active) continue;
          vm.hpShown = U.approach ? U.approach(vm.hpShown, vm.hp, Math.max(1, vm.max * dt / 700)) : vm.hp;
          vm.odShown = U.approach ? U.approach(vm.odShown, vm.od, 120 * dt / 700) : vm.od;
          if (vm.shake > 0) vm.shake -= dt;
          if (vm.flash > 0) vm.flash -= dt;
          if (vm.alpha < 1) vm.alpha = Math.min(1, vm.alpha + dt / 300);
          if (vm.dy !== 0) vm.dy = U.approach ? U.approach(vm.dy, 0, 200 * dt / 1000) : 0;
        }
      }

      S.handleInput(dt);
      S.advance(dt);
    },

    advance: function (dt) {
      const S = this;
      if (S.mode !== "play" && S.mode !== "end") return;
      if (S.anim) {
        S.anim.t += dt;
        if (S.anim.kind === "msg") {
          if (S.msg.done) {
            S.anim.hold = (S.anim.hold || 0) + dt;
            if (S.anim.hold >= S.msg.hold) S.anim = null;
          }
        } else if (S.anim.kind === "hp") {
          const vm = S.anim.vm;
          if (Math.abs(vm.hpShown - vm.hp) < 0.6 || S.anim.t > S.anim.dur) { vm.hpShown = vm.hp; S.anim = null; }
        } else if (S.anim.kind === "faint") {
          const vm = S.anim.vm;
          const k = U.clamp(S.anim.t / S.anim.dur, 0, 1);
          vm.dy = k * 70; vm.alpha = 1 - k;
          if (k >= 1) { vm.active = false; S.anim = null; }
        } else if (S.anim.kind === "enter") {
          if (S.anim.t >= S.anim.dur) S.anim = null;
        } else if (S.anim.kind === "catch") {
          S.catchAnim.t += dt;
          if (S.anim.t >= S.anim.dur) {
            if (S.catchAnim.success) sfx("capsule_catch"); else sfx("capsule_break");
            S.catchAnim = null; S.anim = null;
          }
        } else if (S.anim.t >= (S.anim.dur || 0)) S.anim = null;
        return;
      }
      if (S.queue.length) { S.playNext(); return; }
      S.pull();
      if (S.queue.length) { S.playNext(); return; }

      if (S.result) { S.finish(); return; }
      const eng = S.engine;
      if (!eng) return;
      if (eng.done) { S.result = eng.result; S.finish(); return; }
      if (eng.waiting) return;
      if (eng.request) {
        S.options = eng.options();
        S.mode = eng.request.type === "switch" ? "party" : "menu";
        S.forcedSwitch = eng.request.type === "switch";
        S.menuIndex = 0;
        if (S.forcedSwitch) S.partyIndex = firstOkParty(S.options);
      }
    },

    finish: function () {
      const S = this;
      if (S.finished) return;
      S.finished = true;
      const r = S.result;
      if (r && r.outcome === "catch") song("fanfare_catch");
      if (NS.Scenes && NS.Scenes.pop) {
        const t = NS.Scenes.transition ? NS.Scenes.transition("fade", ms(400)) : Promise.resolve();
        Promise.resolve(t).then(function () { NS.Scenes.pop(r); });
      }
    },

    // ---- input --------------------------------------------------
    handleInput: function (dt) {
      const S = this;
      const I = NS.Input;
      if (!I) return;
      const tap = I.tapAt ? I.tapAt() : null;
      const hit = tap ? hits.at(tap.x, tap.y) : null;

      if (S.mode === "play" || S.mode === "end") {
        if (I.pressed("a") || I.pressed("b") || hit) {
          I.consume && I.consume("a");
          if (!S.msg.done) { S.msg.shown = S.msg.text.length; S.msg.done = true; }
          else if (S.anim && S.anim.kind === "msg") S.anim = null;
        }
        return;
      }
      if (S.mode === "timing") { S.updateTiming(dt, hit); return; }

      const up = I.pressed("up"), down = I.pressed("down"), left = I.pressed("left"), right = I.pressed("right");
      const a = I.pressed("a"), bb = I.pressed("b");

      if (S.mode === "menu") {
        const items = S.mainItems();
        if (up) S.menuIndex = (S.menuIndex + items.length - 1) % items.length;
        if (down) S.menuIndex = (S.menuIndex + 1) % items.length;
        if (left || right) S.menuIndex = (S.menuIndex + (right ? 1 : items.length - 1)) % items.length;
        if (up || down || left || right) sfx("ui_move");
        if (hit && hit.id === "main") { S.menuIndex = hit.arg; S.pickMain(items[hit.arg]); return; }
        if (a) { I.consume && I.consume("a"); S.pickMain(items[S.menuIndex]); }
        return;
      }
      if (S.mode === "move") {
        const moves = S.options.moves;
        if (up) S.moveIndex = (S.moveIndex + moves.length - 1) % moves.length;
        if (down) S.moveIndex = (S.moveIndex + 1) % moves.length;
        if (left) S.moveIndex = (S.moveIndex + moves.length - 1) % moves.length;
        if (right) S.moveIndex = (S.moveIndex + 1) % moves.length;
        if (up || down || left || right) sfx("ui_move");
        if (hit && hit.id === "move") { S.moveIndex = hit.arg; S.commit({ type: "move", index: moves[hit.arg].index }); return; }
        if (a) { I.consume && I.consume("a"); S.commit({ type: "move", index: moves[S.moveIndex].index }); return; }
        if (bb || (hit && hit.id === "back")) { sfx("ui_back"); S.mode = "menu"; }
        return;
      }
      if (S.mode === "party") {
        const list = S.options.switches;
        if (up) S.partyIndex = (S.partyIndex + list.length - 1) % list.length;
        if (down) S.partyIndex = (S.partyIndex + 1) % list.length;
        if (up || down) sfx("ui_move");
        if (hit && hit.id === "party") S.partyIndex = hit.arg;
        if (a || (hit && hit.id === "party")) {
          I.consume && I.consume("a");
          const pick = list[S.partyIndex];
          if (pick && pick.ok) {
            if (S.forcedSwitch) { S.forcedSwitch = false; S.mode = "play"; S.engine.choose(pick.index); }
            else S.commit({ type: "switch", index: pick.index });
          } else sfx("ui_error");
          return;
        }
        if ((bb || (hit && hit.id === "back")) && !S.forcedSwitch) { sfx("ui_back"); S.mode = "menu"; }
        return;
      }
      if (S.mode === "bag") {
        const list = S.bagItems();
        if (up) S.bagIndex = (S.bagIndex + list.length - 1) % list.length;
        if (down) S.bagIndex = (S.bagIndex + 1) % list.length;
        if (left || right) { S.bagTab = (S.bagTab + (right ? 1 : 2)) % 3; S.bagIndex = 0; }
        if (up || down || left || right) sfx("ui_move");
        if (hit && hit.id === "bagtab") { S.bagTab = hit.arg; S.bagIndex = 0; return; }
        if (hit && hit.id === "bag") S.bagIndex = hit.arg;
        if (a || (hit && hit.id === "bag")) {
          I.consume && I.consume("a");
          const it = list[S.bagIndex];
          if (!it) { sfx("ui_error"); return; }
          if (it.capsule) {
            if (S.captureTiming()) { S.startTiming(it.id); return; }
            S.commit({ type: "capsule", id: it.id });
          } else {
            const me = S.options.mon;
            S.commit({ type: "item", id: it.id, target: me ? me.uid : null });
          }
          return;
        }
        if (bb || (hit && hit.id === "back")) { sfx("ui_back"); S.mode = "menu"; }
        return;
      }
      if (S.mode === "agents") {
        const list = S.options.agents;
        if (!list.length) { S.mode = "menu"; return; }
        if (up) S.agentIndex = (S.agentIndex + list.length - 1) % list.length;
        if (down) S.agentIndex = (S.agentIndex + 1) % list.length;
        if (up || down) sfx("ui_move");
        if (hit && hit.id === "agent") S.agentIndex = hit.arg;
        if (a || (hit && hit.id === "agent")) {
          I.consume && I.consume("a");
          const ag = list[S.agentIndex];
          if (ag && ag.ok) S.commit({ type: "agent", id: ag.id });
          else sfx("ui_error");
          return;
        }
        if (bb || (hit && hit.id === "back")) { sfx("ui_back"); S.mode = "menu"; }
        return;
      }
    },

    captureTiming: function () {
      const s = NS.Settings && NS.Settings.captureMode;
      return s === "timing";
    },
    startTiming: function (capsuleId) {
      const S = this;
      S.mode = "timing";
      const wide = S.engine.b.perk("perk_adjudicate_steady_hand") ? 1.5 : 1;
      S.timing = { id: capsuleId, t: 0, dur: 1200, green: 0.10 * wide, yellow: 0.22 * wide, done: false, mult: 1 };
    },
    updateTiming: function (dt, hit) {
      const S = this, I = NS.Input;
      const tm = S.timing;
      tm.t += dt;
      const press = I.pressed("a") || !!hit;
      const k = tm.t / tm.dur;
      if (press || k >= 1) {
        I.consume && I.consume("a");
        const d = Math.abs(k - 0.75);          // sweet spot three-quarters in
        let mult = 1;
        if (press && d <= tm.green / 2) { mult = 1.5; sfx("capsule_catch"); I.vibrate && I.vibrate(30); }
        else if (press && d <= tm.yellow / 2) { mult = 1.15; sfx("ui_select"); }
        else mult = 1;
        S.timing = null;
        S.commit({ type: "capsule", id: tm.id, timing: mult });
      }
    },

    mainItems: function () {
      const S = this, o = S.options;
      const items = [{ id: "fight", label: "FIGHT" }];
      if (o.overdrive) items.push({ id: "overdrive", label: "OVERDRIVE" });
      if (o.agents && o.agents.length) items.push({ id: "agents", label: "AGENTS" });
      items.push({ id: "bag", label: "BAG", off: !o.canItems });
      items.push({ id: "party", label: "PARTY" });
      if (o.canGuard) items.push({ id: "guard", label: "GUARD" });
      items.push({ id: "run", label: o.canRun ? "RUN" : "—", off: !o.canRun });
      return items;
    },

    pickMain: function (item) {
      const S = this;
      if (!item || item.off) { sfx("ui_error"); return; }
      sfx("ui_select");
      switch (item.id) {
        case "fight": S.mode = "move"; S.moveIndex = 0; break;
        case "overdrive": S.commit({ type: "overdrive" }); break;
        case "agents": S.mode = "agents"; S.agentIndex = 0; break;
        case "bag": S.mode = "bag"; S.bagIndex = 0; break;
        case "party": S.mode = "party"; S.partyIndex = 0; break;
        case "guard": S.commit({ type: "guard" }); break;
        case "run": S.commit({ type: "run" }); break;
      }
    },

    commit: function (action) {
      const S = this;
      const res = S.engine.choose(action);
      if (res && res.error) { sfx("ui_error"); S.hint = res.error; return; }
      S.hint = "";
      S.mode = "play";
      S.options = null;
    },

    bagItems: function () {
      const S = this;
      const cache = S._bag || (S._bag = { tab: -1, list: [] });
      const tab = S.bagTab;
      const out = [];
      const inv = NS.Inventory;
      const kinds = tab === 0 ? ["heal", "cure"] : tab === 1 ? ["capsule"] : ["consumable", "brew"];
      if (inv && inv.list) {
        const all = inv.list();
        for (let i = 0; i < all.length; i++) {
          const entry = all[i];
          const it = NS.Battle.itemDataOf ? NS.Battle.itemDataOf(entry.id) : (NS.Data && NS.Data.items && NS.Data.items[entry.id]);
          if (!it) continue;
          if (kinds.indexOf(it.kind) < 0) continue;
          if (it.usableInBattle === false) continue;
          out.push({ id: entry.id, name: it.name, n: entry.n, capsule: it.kind === "capsule", desc: it.desc });
        }
      } else {
        // No inventory yet: offer the staples so the UI is testable.
        const stock = tab === 0 ? ["salve", "tonic", "panacea"] : tab === 1 ? ["capsule_basic", "capsule_mesh"] : ["rain_jar", "x_ray_card"];
        for (let i = 0; i < stock.length; i++) out.push({ id: stock[i], name: BE.itemName(stock[i]), n: 1, capsule: tab === 1 });
      }
      if (!out.length) out.push({ id: null, name: "(nothing here)", n: 0, empty: true });
      cache.tab = tab; cache.list = out;
      return out;
    }
  };

  function firstOkParty(o) {
    for (let i = 0; i < o.switches.length; i++) if (o.switches[i].ok) return i;
    return 0;
  }

  // =============================================================
  // Drawing
  // =============================================================
  const SKY = {
    none: ["#8fb8d8", "#d8e6ee"],
    rain: ["#5c6b7a", "#8f9dab"],
    sun: ["#f0c27a", "#ffe9c0"],
    fog: ["#9aa3a8", "#cfd4d6"],
    wind: ["#88a8c0", "#cfe0ea"],
    snow: ["#aab8c8", "#e8eef4"]
  };
  const GROUND = {
    none: "#7ea85f", grass: "#5fa542", wet: "#4e7f96",
    salt: "#d8d2c2", static: "#c8b64a", silk: "#c9bcd6"
  };

  Scene.draw = function (ctx) {
    const S = this;
    const L = S.layout();
    hits.reset();

    ctx.save();
    if (S.shakeScreen > 0) {
      const a = S.shakeScreen / 120 * 4;
      ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a);
    }

    S.drawBackground(ctx, L);
    S.drawPlatform(ctx, L.enemyX, L.enemyY + L.enemySize * 0.30, L.enemySize * 0.82, L.enemySize * 0.19);
    S.drawPlatform(ctx, L.playerX, L.playerY + L.playerSize * 0.30, L.playerSize * 0.82, L.playerSize * 0.19);

    // monsters (enemy behind, player in front)
    for (let k = 1; k >= 0; k--) S.drawMon(ctx, S.vm[1][k], 1, k, L);
    for (let k = 1; k >= 0; k--) S.drawMon(ctx, S.vm[0][k], 0, k, L);

    S.drawParticles(ctx);

    // info panels
    for (let k = 0; k < 2; k++) {
      const ev = S.vm[1][k], pv = S.vm[0][k];
      if (ev.active) S.drawInfo(ctx, ev, L.enemyInfoX, L.enemyInfoY + k * (L.infoH + 12), false, L);
      if (pv.active) S.drawInfo(ctx, pv, L.playerInfoX, L.playerInfoY - k * (L.infoH + 12), true, L);
    }

    S.drawFieldChips(ctx, L);
    if (S.catchAnim) S.drawCatch(ctx, L);

    // The move list covers the whole bottom band, and the message box behind it
    // showed through the panel's translucency.
    if (S.mode !== "move") S.drawMessageBox(ctx, L);

    if (S.mode === "menu") S.drawMainMenu(ctx, L);
    else if (S.mode === "move") S.drawMoveMenu(ctx, L);
    else if (S.mode === "party") S.drawParty(ctx, L);
    else if (S.mode === "bag") S.drawBag(ctx, L);
    else if (S.mode === "agents") S.drawAgents(ctx, L);
    else if (S.mode === "timing") S.drawTiming(ctx, L);

    if (S.flashScreen > 0) {
      ctx.fillStyle = "rgba(255,255,255," + U.clamp(S.flashScreen / 240, 0, 0.75) + ")";
      ctx.fillRect(0, 0, L.w, L.h);
    }
    ctx.restore();
  };

  // Gradients are cached by (what they depend on) so the draw loop
  // allocates nothing per frame.
  const gradCache = {};
  function gradient(ctx, key, x0, y0, x1, y1, c0, c1) {
    const k = key + "|" + Math.round(y0) + "|" + Math.round(y1);
    let g = gradCache[k];
    if (!g) {
      g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      gradCache[k] = g;
    }
    return g;
  }

  Scene.drawBackground = function (ctx, L) {
    const S = this;
    const w = S.field.weather || "none";
    const pal = SKY[w] || SKY.none;
    ctx.fillStyle = gradient(ctx, "sky:" + w, 0, 0, 0, L.boxY, pal[0], pal[1]);
    ctx.fillRect(0, 0, L.w, L.boxY);
    // terrain band
    const tr = S.field.terrain || "none";
    const ground = GROUND[tr] || GROUND.none;
    const gy = L.boxY - L.h * 0.30;
    ctx.fillStyle = gradient(ctx, "ground:" + tr, 0, gy, 0, L.boxY, U.shade ? U.shade(ground, -0.15) : ground, ground);
    ctx.fillRect(0, gy, L.w, L.boxY - gy);
    // horizon hedgerow: Cheshire, obviously
    ctx.fillStyle = "rgba(30,50,30,0.20)";
    ctx.fillRect(0, gy - 6, L.w, 8);
    // weather overlay
    if (w === "rain" || w === "snow") {
      ctx.strokeStyle = w === "rain" ? "rgba(200,220,255,0.35)" : "rgba(255,255,255,0.6)";
      ctx.lineWidth = w === "rain" ? 1.5 : 2.5;
      const t = S.time * (w === "rain" ? 0.9 : 0.25);
      for (let i = 0; i < 46; i++) {
        const x = (i * 137 + t * 0.6) % L.w;
        const y = (i * 61 + t) % L.boxY;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - (w === "rain" ? 6 : 1), y + (w === "rain" ? 16 : 5));
        ctx.stroke();
      }
    } else if (w === "fog") {
      ctx.fillStyle = "rgba(230,232,235,0.42)";
      ctx.fillRect(0, 0, L.w, L.boxY);
    } else if (w === "wind") {
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const y = (i * 53 + (S.time * 0.25) % 60) % L.boxY;
        const x = (S.time * 0.4 + i * 90) % (L.w + 200) - 100;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y - 6); ctx.stroke();
      }
    } else if (w === "sun") {
      ctx.fillStyle = "rgba(255,220,150,0.18)";
      ctx.fillRect(0, 0, L.w, L.boxY);
    }
  };

  Scene.drawPlatform = function (ctx, x, y, rx, ry) {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.3); ctx.stroke();
  };

  Scene.drawMon = function (ctx, vm, side, slot, L) {
    if (!vm.active || !vm.species) return;
    const S = this;
    const size = side === 0 ? (L.playerSize || Math.round(L.h * 0.38)) : (L.enemySize || Math.round(L.h * 0.30));
    const cv = monsterCanvas(vm.species, side === 0, size, vm.types);
    const p = S.slotPos(side, slot);
    let x = p.x - size / 2, y = p.y - size / 2 + vm.dy;
    if (vm.shake > 0) x += (Math.random() - 0.5) * 8;
    ctx.save();
    ctx.globalAlpha = U.clamp(vm.alpha, 0, 1);
    ctx.drawImage(cv, Math.round(x), Math.round(y), size, size);
    if (vm.flash > 0) {
      ctx.globalAlpha = U.clamp(vm.flash / 200, 0, 1) * 0.75;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
    }
    ctx.restore();
    // status pip floating by the sprite
    if (vm.status) {
      ctx.fillStyle = BE.STATUS_COLOR[vm.status];
      const cw = 44, ch = 18;
      const sx = Math.round(x + size * 0.5 - cw / 2), sy = Math.round(y - 6);
      UI.roundRect(ctx, sx, sy, cw, ch, 5); ctx.fill();
      T.draw(ctx, BE.STATUS_SHORT[vm.status], sx + cw / 2, sy + 3, { size: "s", color: "#fff", align: "center" });
    }
  };

  Scene.drawParticles = function (ctx) {
    const S = this;
    for (let i = 0; i < S.fxParticles.length; i++) {
      const p = S.fxParticles[i];
      ctx.globalAlpha = U.clamp(1 - p.life / p.max, 0, 1);
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  Scene.drawInfo = function (ctx, vm, x, y, isPlayer, L) {
    const S = this;
    const w = L.infoW, h = L.infoH;
    const mh = T.px("m"), sh = T.px("s");
    UI.box(ctx, x, y, w, h, { style: "dark", alpha: 0.94 });
    const lvW = T.width("Lv" + vm.level, "s") + 18;
    T.draw(ctx, vm.name, x + 12, y + 8, { size: "m", color: "#f4f4ee", maxWidth: w - 24 - lvW });
    T.draw(ctx, "Lv" + vm.level, x + w - 12, y + 8, { size: "s", color: "#d8d8c8", align: "right" });

    const gy = y + 12 + mh + 4, gw = w - 24;
    const ratio = U.clamp(vm.hpShown / Math.max(1, vm.max), 0, 1);
    UI.gauge(ctx, x + 12, gy, gw, 10, ratio, {});
    // Boss phase ticks: the player can see the breaks coming.
    if (!isPlayer && S.bossPhases > 0) {
      ctx.fillStyle = "rgba(20,20,28,0.85)";
      for (let i = 1; i <= S.bossPhases; i++) {
        const px = x + 12 + gw * (1 - i / (S.bossPhases + 1));
        ctx.fillRect(Math.round(px), gy, 2, 10);
      }
      if (S.bossPhase > 0) T.draw(ctx, "PHASE " + S.bossPhase + "/" + (S.bossPhases + 1), x + 12, gy + 13, { size: "s", color: "#ff9d5c" });
    }
    const showNumbers = isPlayer || (S.engine && S.engine.b && S.engine.b.revealHp) || vm.revealed;
    if (showNumbers) {
      T.draw(ctx, Math.ceil(vm.hpShown) + "/" + vm.max, x + w - 12, gy + 12, { size: "s", color: "#d8d8c8", align: "right", maxWidth: w - 24 });
    }
    // Overdrive strip
    if (vm.odShown > 0) {
      const full = vm.odShown >= 99.5;
      UI.gauge(ctx, x + 12, gy + 14, gw, 5, vm.odShown / 100, { color: full ? "#ffd84d" : "#e0762f", bg: "#2a2a34", noBorder: true });
      if (full) T.draw(ctx, "OVERDRIVE", x + 12, gy + 20, { size: "s", color: "#ffd84d" });
    }
    // type chips
    if (vm.types) {
      const chipH = L.chipH || Math.max(18, sh + 4);
      for (let i = 0; i < vm.types.length && i < 2; i++) UI.typeChip(ctx, vm.types[i], x + 12 + i * 62, y - chipH - 4, { w: 58, h: chipH });
    }
    // stat stage arrows
    if (vm.stages) {
      let sx = x + 12;
      const keys = Object.keys(vm.stages);
      for (let i = 0; i < keys.length; i++) {
        const v = vm.stages[keys[i]];
        if (!v) continue;
        const col = v > 0 ? "#5ad06a" : "#e06a5a";
        T.draw(ctx, keys[i].toUpperCase() + (v > 0 ? "+" : "") + v, sx, y + h + 2, { size: "s", color: col });
        sx += 54;
      }
    }
  };

  Scene.drawFieldChips = function (ctx, L) {
    const S = this;
    let x = L.right, y = L.top;
    if (S.field.weather) {
      const label = BE.WEATHER_NAME[S.field.weather];
      const w = T.width(label, "s") + 20;
      x -= w;
      UI.box(ctx, x, y, w, T.px("s") + 10, { style: "flat", alpha: 0.85 });
      T.draw(ctx, label, x + w / 2, y + 5, { size: "s", color: "#fff", align: "center" });
      x -= 8;
    }
    if (S.field.terrain) {
      const label = BE.TERRAIN_NAME[S.field.terrain];
      const w = T.width(label, "s") + 20;
      x -= w;
      UI.box(ctx, x, y, w, T.px("s") + 10, { style: "flat", alpha: 0.85 });
      T.draw(ctx, label, x + w / 2, y + 5, { size: "s", color: "#fff", align: "center" });
    }
    // turn counter, quietly
    T.draw(ctx, "Turn " + (S.engine && S.engine.b ? S.engine.b.turn : 0), L.left, L.top, { size: "s", color: "rgba(255,255,255,0.55)" });
  };

  Scene.drawMessageBox = function (ctx, L) {
    const S = this;
    const menuW = Math.max(230, Math.min(L.cw * 0.42, 380));
    const boxW = (S.mode === "menu") ? (L.cw - menuW - 10) : L.cw;
    L.menuW = menuW;
    UI.box(ctx, L.left, L.boxY, boxW, L.boxH, { style: "default" });
    const text = S.msg.text.slice(0, S.msg.shown);
    const lines = T.wrap(text, boxW - 44, "m");
    const rows = Math.max(1, Math.floor((L.boxH - 26) / L.msgLine));
    for (let i = 0; i < lines.length && i < rows; i++) {
      T.draw(ctx, lines[i], L.left + 22, L.boxY + 14 + i * L.msgLine, { size: "m", color: "#22222a" });
    }
    if (S.msg.done && S.anim && S.anim.kind === "msg") UI.advanceArrow(ctx, L.left + boxW - 40, L.boxY + L.boxH - 26, "#8c2f2f");
    if (S.mode === "play") hits.add(L.left, L.boxY, boxW, L.boxH, "advance");
    if (S.hint) T.draw(ctx, S.hint, L.left + 22, L.boxY + L.boxH - T.px("s") - 8, { size: "s", color: "#a03030" });
  };

  Scene.drawMainMenu = function (ctx, L) {
    const S = this;
    const items = S.mainItems();
    const w = L.menuW || Math.max(230, Math.min(L.cw * 0.42, 380));
    const x = L.right - w, y = L.boxY, h = L.boxH;
    UI.box(ctx, x, y, w, h, { style: "dark" });
    const cols = 2;
    const rows = Math.ceil(items.length / cols);
    const cw = (w - 24) / cols, ch = (h - 20) / rows;
    const mh = T.px("m");
    for (let i = 0; i < items.length; i++) {
      const cx = x + 12 + (i % cols) * cw, cy = y + 10 + Math.floor(i / cols) * ch;
      const sel = i === S.menuIndex;
      if (sel) {
        ctx.fillStyle = "rgba(255,216,77,0.20)";
        UI.roundRect(ctx, cx + 2, cy + 2, cw - 6, ch - 6, 6); ctx.fill();
      }
      const col = items[i].off ? "#787888" : (items[i].id === "overdrive" ? "#ffd84d" : "#f4f4ee");
      T.draw(ctx, items[i].label, cx + cw / 2, cy + (ch - mh) / 2, { size: "m", color: col, align: "center", maxWidth: cw - 18 });
      if (sel) UI.pointer(ctx, cx + 4, cy + (ch - 12) / 2);
      hits.add(cx, cy, cw, ch, "main", i);
    }
  };

  Scene.drawMoveMenu = function (ctx, L) {
    const S = this;
    const moves = S.options.moves;
    const mh = T.px("m"), sh = T.px("s");
    // A row is a tap target, so it is never smaller than a finger.
    const minTouch = (NS.View && NS.View.ui && NS.View.ui.touch) || 44;
    const ch = Math.max(46, mh + sh + 16, minTouch);
    const rows = Math.ceil(Math.max(1, moves.length) / 2);
    const h = Math.min(rows * ch + 26, L.bottom - L.top - 8);
    const y = L.bottom - h;
    UI.box(ctx, L.left, y, L.cw, h, { style: "dark" });
    // the info panel only earns its place when there is width to spare
    const infoW = L.cw >= 700 ? 264 : 0;
    const cols = 2;
    const cw = (L.cw - 32 - infoW) / cols;
    const foe = S.vm[1][0];
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const cx = L.left + 16 + (i % cols) * cw, cy = y + 12 + Math.floor(i / cols) * ch;
      const sel = i === S.moveIndex;
      if (sel) { ctx.fillStyle = "rgba(255,255,255,0.12)"; UI.roundRect(ctx, cx, cy, cw - 10, ch - 6, 6); ctx.fill(); }
      const col = m.disabled ? "#6c6c7c" : "#f4f4ee";
      const ppW = T.width(m.pp + "/" + m.ppMax, "s") + 10;
      const chipW = Math.min(60, Math.max(34, cw * 0.22));
      T.draw(ctx, m.name, cx + 12, cy + 6, { size: "m", color: col, maxWidth: cw - 22 - chipW - ppW - 24 });
      UI.typeChip(ctx, m.type, cx + cw - 26 - ppW - chipW - 8, cy + 8, { w: chipW, h: Math.max(18, sh + 4) });
      T.draw(ctx, m.pp + "/" + m.ppMax, cx + cw - 26, cy + 10, { size: "s", color: m.pp === 0 ? "#e05a5a" : "#c8c8b8", align: "right" });
      // effectiveness hint against the current foe
      if (foe && foe.types && m.cat !== "status" && NS.Data && NS.Data.typeMultiplier) {
        const eff = NS.Data.typeMultiplier(m.type, foe.types);
        const label = eff === 0 ? "no effect" : eff > 1 ? "strong" : eff < 1 ? "weak" : "";
        if (label) T.draw(ctx, label, cx + 12, cy + 8 + mh + 2, { size: "s", color: eff > 1 ? "#5ad06a" : eff === 0 ? "#888" : "#e0a05a" });
      }
      if (sel) UI.pointer(ctx, cx + 2, cy + (ch - 12) / 2);
      hits.add(cx, cy, cw - 10, ch - 6, "move", i);
    }
    const sel = moves[S.moveIndex];
    if (sel && infoW) {
      const px = L.right - infoW - 6;
      UI.box(ctx, px, y + 10, infoW, h - 22, { style: "flat", alpha: 0.9 });
      T.draw(ctx, sel.cat === "status" ? "Status" : (sel.cat === "phys" ? "Physical" : "Special"), px + 12, y + 20, { size: "s", color: "#e8e8e0" });
      T.draw(ctx, "Power " + (sel.power || "—") + "   Acc " + (sel.acc === null ? "—" : sel.acc), px + 12, y + 24 + sh + 6, { size: "s", color: "#e8e8e0" });
      if (sel.desc) {
        const lines = T.wrap(sel.desc, infoW - 24, "s");
        const room = Math.max(1, Math.floor((h - 22 - (34 + sh * 2)) / (sh + 3)));
        for (let i = 0; i < lines.length && i < room; i++) T.draw(ctx, lines[i], px + 12, y + 34 + sh * 2 + 8 + i * (sh + 3), { size: "s", color: "#c8c8bc" });
      }
    }
    S.drawBackButton(ctx, L);
  };

  Scene.drawParty = function (ctx, L) {
    const S = this;
    const list = S.options.switches;
    const minTouch = (NS.View && NS.View.ui && NS.View.ui.touch) || 44;
    const w = Math.min(560, Math.max(320, L.cw * 0.72)), x = L.left + (L.cw - w) / 2;
    const rowH = Math.max(54, minTouch);
    const h = Math.min(40 + list.length * rowH, L.bottom - L.top);
    const y = L.top + Math.max(0, (L.bottom - L.top - h) / 2);
    UI.box(ctx, x, y, w, h, { style: "dark", title: S.forcedSwitch ? "WHO'S NEXT?" : "PARTY" });
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      const cy = y + 24 + i * rowH;
      const sel = i === S.partyIndex;
      if (sel) { ctx.fillStyle = "rgba(255,255,255,0.12)"; UI.roundRect(ctx, x + 8, cy, w - 16, rowH - 6, 6); ctx.fill(); }
      const col = p.ok ? "#f4f4ee" : (p.active ? "#ffd84d" : "#7a7a88");
      T.draw(ctx, p.name, x + 22, cy + 6, { size: "m", color: col });
      T.draw(ctx, "Lv" + p.level, x + 200, cy + 10, { size: "s", color: "#c8c8bc" });
      UI.gauge(ctx, x + 260, cy + 14, 160, 9, p.hp / Math.max(1, p.max), {});
      T.draw(ctx, p.hp + "/" + p.max, x + w - 22, cy + 10, { size: "s", color: "#c8c8bc", align: "right" });
      if (p.status) T.draw(ctx, BE.STATUS_SHORT[p.status], x + 230, cy + 28, { size: "s", color: BE.STATUS_COLOR[p.status] });
      if (p.active) T.draw(ctx, "OUT", x + 200, cy + 28, { size: "s", color: "#ffd84d" });
      if (sel) UI.pointer(ctx, x + 10, cy + 12);
      hits.add(x + 8, cy, w - 16, rowH - 6, "party", i);
    }
    if (!S.forcedSwitch) S.drawBackButton(ctx, L);
  };

  Scene.drawBag = function (ctx, L) {
    const S = this;
    const list = S.bagItems();
    const minTouch = (NS.View && NS.View.ui && NS.View.ui.touch) || 44;
    const w = Math.min(520, Math.max(320, L.cw * 0.66)), x = L.left + (L.cw - w) / 2;
    const rowH = Math.max(38, minTouch);
    const avail = L.bottom - L.top;
    const shown = Math.max(1, Math.min(6, Math.min(list.length, Math.floor((avail - 78) / rowH))));
    const h = Math.min(78 + shown * rowH, avail);
    const y = L.top + Math.max(0, (avail - h) / 2);
    UI.box(ctx, x, y, w, h, { style: "dark", title: "BAG" });
    const tabs = ["MEDICINE", "CAPSULES", "KIT"];
    for (let i = 0; i < tabs.length; i++) {
      const tx = x + 12 + i * ((w - 24) / 3), tw = (w - 24) / 3 - 6;
      const on = i === S.bagTab;
      ctx.fillStyle = on ? "rgba(255,216,77,0.22)" : "rgba(255,255,255,0.06)";
      UI.roundRect(ctx, tx, y + 18, tw, 26, 5); ctx.fill();
      T.draw(ctx, tabs[i], tx + tw / 2, y + 24, { size: "s", color: on ? "#ffd84d" : "#c8c8bc", align: "center" });
      hits.add(tx, y + 18, tw, 26, "bagtab", i);
    }
    const start = Math.max(0, Math.min(S.bagIndex - Math.floor(shown / 2), list.length - shown));
    for (let i = start; i < list.length && i < start + shown; i++) {
      const it = list[i];
      const cy = y + 54 + (i - start) * rowH;
      const sel = i === S.bagIndex;
      if (sel) { ctx.fillStyle = "rgba(255,255,255,0.12)"; UI.roundRect(ctx, x + 8, cy, w - 16, rowH - 6, 6); ctx.fill(); }
      T.draw(ctx, it.name, x + 22, cy + 6, { size: "m", color: it.empty ? "#7a7a88" : "#f4f4ee" });
      if (!it.empty) T.draw(ctx, "x" + it.n, x + w - 22, cy + 8, { size: "s", color: "#c8c8bc", align: "right" });
      if (sel) UI.pointer(ctx, x + 10, cy + 10);
      hits.add(x + 8, cy, w - 16, rowH - 6, "bag", i);
    }
    S.drawBackButton(ctx, L);
  };

  Scene.drawAgents = function (ctx, L) {
    const S = this;
    const list = S.options.agents;
    const minTouch = (NS.View && NS.View.ui && NS.View.ui.touch) || 44;
    const w = Math.min(560, Math.max(320, L.cw * 0.72)), x = L.left + (L.cw - w) / 2;
    const rowH = Math.max(62, minTouch + 16);
    const h = Math.min(40 + Math.max(1, list.length) * rowH, L.bottom - L.top);
    const y = L.top + Math.max(0, (L.bottom - L.top - h) / 2);
    UI.box(ctx, x, y, w, h, { style: "dark", title: "AGENTS" });
    if (!list.length) T.draw(ctx, "Nobody is picking up.", x + 22, y + 34, { size: "m", color: "#8a8a98" });
    for (let i = 0; i < list.length; i++) {
      const ag = list[i];
      const cy = y + 24 + i * rowH;
      const sel = i === S.agentIndex;
      if (sel) { ctx.fillStyle = "rgba(255,255,255,0.12)"; UI.roundRect(ctx, x + 8, cy, w - 16, rowH - 6, 6); ctx.fill(); }
      T.draw(ctx, ag.name, x + 22, cy + 6, { size: "m", color: ag.ok ? "#8ad8ff" : "#6c6c7c" });
      T.draw(ctx, ag.blurb, x + 22, cy + 30, { size: "s", color: "#b8b8c8" });
      const right = ag.ok ? "READY" : ag.why === "cooldown" ? (ag.turns + " turn" + (ag.turns === 1 ? "" : "s")) : ag.why === "jammed" ? "JAMMED" : ag.why === "silent" ? "SILENT" : "—";
      T.draw(ctx, right, x + w - 22, cy + 14, { size: "s", color: ag.ok ? "#5ad06a" : "#e0a05a", align: "right" });
      if (sel) UI.pointer(ctx, x + 10, cy + 14);
      hits.add(x + 8, cy, w - 16, rowH - 6, "agent", i);
    }
    S.drawBackButton(ctx, L);
  };

  Scene.drawBackButton = function (ctx, L) {
    const minTouch = (NS.View && NS.View.ui && NS.View.ui.touch) || 44;
    const h = Math.max(34, minTouch * 0.8), w = Math.max(96, h * 2.4);
    const x = L.right - w, y = L.top;
    UI.box(ctx, x, y, w, h, { style: "flat", alpha: 0.9 });
    T.draw(ctx, "BACK", x + w / 2, y + (h - T.px("s")) / 2, { size: "s", color: "#f0f0e8", align: "center" });
    hits.add(x, y, w, h, "back");
  };

  Scene.drawCatch = function (ctx, L) {
    const S = this;
    const c = S.catchAnim;
    const p = S.slotPos(1, 0);
    const t = c.t;
    const throwT = ms(500);
    let x = p.x, y = p.y;
    if (t < throwT) {
      const k = t / throwT;
      x = L.playerX + (p.x - L.playerX) * k;
      y = L.playerY + (p.y - L.playerY) * k - Math.sin(k * Math.PI) * 120;
    } else {
      const shakeIdx = Math.floor((t - throwT) / ms(520));
      const phase = ((t - throwT) % ms(520)) / ms(520);
      if (shakeIdx < c.shakes) x += Math.sin(phase * Math.PI * 4) * 14;
    }
    const r = 20;
    ctx.fillStyle = "#e03030";
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#f4f4f4";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#202028";
    ctx.fillRect(x - r, y - 3, r * 2, 6);
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.3); ctx.fill();
    ctx.fillStyle = c.success ? "#ffd84d" : "#8a8a98";
    ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.3); ctx.fill();
    if (c.critical && t < throwT + ms(300)) {
      ctx.strokeStyle = "rgba(255,216,77,0.8)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(x, y, r + 12 + Math.sin(t / 60) * 4, 0, 6.3); ctx.stroke();
    }
  };

  Scene.drawTiming = function (ctx, L) {
    const S = this;
    const tm = S.timing;
    if (!tm) return;
    const ringR = Math.min(90, (L.boxY - L.top) * 0.34);
    const cx = L.w / 2, cy = L.top + (L.boxY - L.top) * 0.42;
    const k = U.clamp(tm.t / tm.dur, 0, 1);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, 6.3); ctx.stroke();
    // green / yellow bands sit around the 75% mark
    const sweet = 0.75;
    ctx.strokeStyle = "rgba(240,200,60,0.8)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, ringR, (sweet - tm.yellow / 2) * 6.283 - 1.571, (sweet + tm.yellow / 2) * 6.283 - 1.571); ctx.stroke();
    ctx.strokeStyle = "rgba(90,208,106,0.95)";
    ctx.beginPath(); ctx.arc(cx, cy, ringR, (sweet - tm.green / 2) * 6.283 - 1.571, (sweet + tm.green / 2) * 6.283 - 1.571); ctx.stroke();
    const r = ringR * (1 - k * 0.75);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.stroke();
    T.draw(ctx, "TAP ON THE GREEN", cx, Math.min(cy + ringR + 20, L.boxY - T.px("m") - 6), { size: "m", color: "#ffffff", align: "center", shadow: true });
    hits.add(0, 0, L.w, L.h, "timing");
  };

  NS.BattleScene = Scene;
})();
