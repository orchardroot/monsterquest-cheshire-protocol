// =============================================================
// MonsterQuest v2 — tools/playtest.js
//
// A headless *player*. The unit tests poke one subsystem at a time; this
// boots the real game through the real title screen, walks the real
// overworld with injected input, fights real battles, and watches a set of
// invariants every frame that no single-subsystem test can see:
//
//   battle-with-wiped-party   a battle started while nobody could fight
//   wiped-freewalk            walking about with every monster fainted
//   no-respawn-after-loss     a lost battle did not end at a kettle, healed
//   inside-wall               the player is standing in a solid tile
//   softlock                  the overworld has been locked for too long
//   stuck-scene               a menu/scene ignored input for too long
//   scene-depth               the scene stack is growing without bound
//   party-sanity              NaN / negative / over-max HP, negative money
//   warn                      MQ.warn said something "failed"
//   unhandled-rejection       a promise in the game blew up
//
// Used by tools/fuzz.js (random play) and tools/test/test-playtest*.js
// (scripted regressions). Node only.
//
//   const PT = require("./playtest");
//   const s = await PT.boot({ seed: 7 });
//   await s.walkTo(10, 12);            // BFS over the current map
//   await s.pump(120);                 // 120 frames, promises flushed each frame
//   s.violations                       // [] if the game behaved
//
//   node tools/playtest.js [--seed=N] [--frames=N]   quick smoke
// =============================================================
"use strict";
const H = require("./headless");

const STEP = 16.667;
const DIFFICULTY_INDEX = { story: 0, normal: 1, hard: 2, nightmare: 3 };

// -------------------------------------------------------------
// deterministic Math for the game's own Math.random() calls
// (encounter rolls, AI, damage). vm scripts resolve `Math` through
// the context global at call time, so swapping the property works.
// -------------------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededMath(seed) {
  const m = Object.create(Math);   // inherits PI, floor, ... ; only random is ours
  Object.defineProperty(m, "random", { value: mulberry32(seed >>> 0), writable: true, configurable: true });
  return m;
}

function nextTick() { return new Promise(function (r) { setImmediate(r); }); }

function Session(env, opts) {
  this.env = env;
  this.MQ = env.MQ;
  this.opts = opts;
  this.frame = 0;
  this.violations = [];
  this.warnings = [];
  this.battles = [];
  this.actions = [];           // ring buffer of what the driver did (fuzz uses it)
  this.rng = mulberry32((opts.seed || 1) >>> 0);
  this._lossPending = null;
  this._wipedEpisode = false;
  this._wallKey = null;
  this._lockedIdle = 0;
  this._lockedAny = 0;
  this._awayFrames = 0;
  this._awayScene = null;
  this._rig = null;
  this._hook();
}

// ---- wiring ---------------------------------------------------------------
Session.prototype._hook = function () {
  const self = this, MQ = this.MQ;
  // quiet MQ.warn, but remember it
  const origWarn = MQ.warn;
  MQ.warn = function () {
    const parts = [];
    for (let i = 0; i < arguments.length; i++) {
      const a = arguments[i];
      parts.push(a && a.stack ? a.stack : (typeof a === "string" ? a : safeJson(a)));
    }
    const msg = parts.join(" ");
    self.warnings.push({ frame: self.frame, msg: msg });
    if (/failed|error|exception/i.test(msg)) self.violate("warn", msg);
    if (self.opts.verbose) origWarn.apply(MQ, arguments);
  };
  this._onRejection = function (err) {
    self.violate("unhandled-rejection", err && err.stack ? err.stack : String(err));
  };
  process.on("unhandledRejection", this._onRejection);

  // Every battle in the game goes through Battle.start: wild, trainer,
  // scripted, arena, fishing. Wrap it once and we see them all.
  if (MQ.Battle && MQ.Battle.start) {
    const origStart = MQ.Battle.start;
    MQ.Battle.start = function (opts) {
      opts = opts || {};
      const party = opts.playerParty || (MQ.Party && MQ.Party.list) || [];
      const alive = party.filter(function (m) { return m && m.hp > 0; }).length;
      const rec = { frame: self.frame, kind: opts.kind || "?", alive: alive, size: party.length, map: self.mapId(), outcome: null };
      self.battles.push(rec);
      if (party.length && !alive) self.violate("battle-with-wiped-party", "a " + rec.kind + " battle started on " + rec.map + " with all " + party.length + " monsters fainted");
      if (self._rig) self._rig(opts, party);
      return Promise.resolve(origStart.call(MQ.Battle, opts)).then(function (r) {
        rec.outcome = r && r.outcome;
        rec.turns = r && r.turns;
        if (r && r.outcome === "lose") self._lossPending = { frame: self.frame, map: self.mapId(), tile: self.tile(), kind: rec.kind };
        return r;
      });
    };
  }
};

Session.prototype.close = function () {
  process.removeListener("unhandledRejection", this._onRejection);
};

// Rig battles: `partyHp` sets every fighter's HP before the fight,
// `enemyLevel` replaces the foe with one at that level. {partyHp:1,
// enemyLevel:60} guarantees a loss; {enemyLevel:1} guarantees a win.
Session.prototype.rig = function (r) {
  const MQ = this.MQ;
  if (!r) { this._rig = null; return; }
  this._rig = function (opts, party) {
    if (r.partyHp !== undefined) for (let i = 0; i < party.length; i++) if (party[i]) party[i].hp = Math.min(r.partyHp, party[i].stats ? party[i].stats.hp : r.partyHp);
    if (r.enemyLevel !== undefined) {
      const src = (opts.enemyParty && opts.enemyParty[0]) || null;
      const species = (src && src.species) || opts.species || (opts.trainer && opts.trainer.party && opts.trainer.party[0] && opts.trainer.party[0].species) || "flitchick";
      const foe = MQ.Battle.makeMonster(species, r.enemyLevel, {});
      if (foe) { opts.enemyParty = [foe]; opts.trainer = opts.trainer ? MQ.U.merge({}, opts.trainer, { party: [{ species: species, level: r.enemyLevel }] }) : opts.trainer; }
    }
  };
};

// ---- state ----------------------------------------------------------------
Session.prototype.topId = function () { const s = this.MQ.Scenes.top(); return s ? s.id : null; };
Session.prototype.mapId = function () { return this.MQ.Overworld && this.MQ.Overworld.state ? this.MQ.Overworld.state.map : null; };
Session.prototype.map = function () { return this.MQ.Overworld && this.MQ.Overworld.currentMap ? this.MQ.Overworld.currentMap() : null; };
Session.prototype.tile = function () {
  const st = this.MQ.Overworld.state, T = this.MQ.TILE;
  return { x: Math.floor(st.px / T), y: Math.floor(st.py / T) };
};
Session.prototype.locked = function () { return this.MQ.Overworld.locked(); };
Session.prototype.party = function () { return (this.MQ.Party && this.MQ.Party.list) || []; };
Session.prototype.alive = function () { return this.party().filter(function (m) { return m && m.hp > 0; }).length; };
Session.prototype.walkable = function (x, y) {
  const O = this.MQ.Overworld, map = this.map();
  if (!map) return false;
  if (this.MQ.World.blocked(map, x, y, O.state.abilities)) return false;
  const n = O.npcAt(x, y);
  return !(n && n.solid && this.MQ.NPC.visible(n));
};
Session.prototype.state = function () {
  const MQ = this.MQ, t = this.tile();
  return {
    frame: this.frame, top: this.topId(), depth: MQ.Scenes.depth(), map: this.mapId(), x: t.x, y: t.y,
    locked: this.locked(), script: !!(MQ.Script && MQ.Script.busy()), dialog: !!(MQ.Dialog && MQ.Dialog.isOpen()),
    covered: !!(MQ.Scenes.isCovered && MQ.Scenes.isCovered()),
    respawn: MQ.Overworld.state.respawn,
    money: MQ.Inventory ? MQ.Inventory.money : null,
    party: this.party().map(function (m) { return { species: m.species, lv: m.level, hp: m.hp, max: m.stats ? m.stats.hp : null }; })
  };
};

// ---- driving --------------------------------------------------------------
Session.prototype.note = function (a) { this.actions.push(this.frame + ":" + a); if (this.actions.length > 60) this.actions.shift(); };

Session.prototype.step = function () {
  this.MQ.Loop.step(STEP);
  this.frame++;
  if (this.opts.renderEvery && this.frame % this.opts.renderEvery === 0) {
    try { this.MQ.Loop.render(); } catch (e) { this.violate("render-throw", e && e.stack ? e.stack : String(e)); }
  }
  this.check();
};

// n frames, flushing the game's promise chains between each
Session.prototype.pump = async function (n) {
  for (let i = 0; i < (n || 1); i++) { this.step(); await nextTick(); }
};

Session.prototype.until = async function (pred, max, label) {
  for (let i = 0; i < max; i++) {
    if (pred()) { this.check(); return i; }   // judge the settled state, not the frame before it
    this.step(); await nextTick();
  }
  throw new Error("timed out after " + max + " frames waiting for " + (label || "condition") + " — " + safeJson(this.state()));
};

// wait until the overworld takes input again (battle over, dialogue closed)
Session.prototype.settle = function (max) {
  const self = this;
  return this.until(function () { return self.topId() === "overworld" && !self.locked(); }, max || 1200, "the overworld to unlock");
};

Session.prototype.press = async function (action, n) {
  for (let i = 0; i < (n || 1); i++) { this.note(action); this.MQ.Input.inject(action); this.step(); await nextTick(); }
};

Session.prototype.hold = async function (dir, frames) {
  this.note(dir + "x" + frames);
  for (let i = 0; i < frames; i++) { this.MQ.Input.inject(dir); this.step(); await nextTick(); }
};

// Breadth-first path over the current map's walkable tiles.
Session.prototype.path = function (tx, ty, from) {
  const map = this.map();
  if (!map) return null;
  const start = from || this.tile();
  const W = map.width, Hh = map.height;
  const prev = new Int32Array(W * Hh).fill(-1);
  const seen = new Uint8Array(W * Hh);
  const q = [start.y * W + start.x];
  seen[q[0]] = 1;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length) {
    const cur = q.shift();
    const cx = cur % W, cy = (cur / W) | 0;
    if (cx === tx && cy === ty) {
      const out = [];
      const startIdx = start.y * W + start.x;
      for (let i = cur; i !== startIdx && i >= 0; i = prev[i]) out.push({ x: i % W, y: (i / W) | 0 });
      out.reverse();
      return out;
    }
    for (let d = 0; d < 4; d++) {
      const nx = cx + D[d][0], ny = cy + D[d][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= Hh) continue;
      const ni = ny * W + nx;
      if (seen[ni]) continue;
      seen[ni] = 1;
      if (!this.walkable(nx, ny)) continue;
      // don't path *through* warps (doors/edges) unless that is the goal
      const w = this.MQ.World.warpAt(map, nx, ny);
      if (w && w.kind !== "look" && !(nx === tx && ny === ty)) continue;
      prev[ni] = cur;
      q.push(ni);
    }
  }
  return null;
};

// Nearest walkable tile satisfying pred(x, y, map), by walking distance.
Session.prototype.nearestTile = function (pred, from) {
  const map = this.map();
  if (!map) return null;
  const start = from || this.tile();
  const W = map.width, Hh = map.height;
  const seen = new Uint8Array(W * Hh);
  const q = [start];
  seen[start.y * W + start.x] = 1;
  const D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (q.length) {
    const c = q.shift();
    if (pred(c.x, c.y, map) && !(c.x === start.x && c.y === start.y)) return c;
    for (let d = 0; d < 4; d++) {
      const nx = c.x + D[d][0], ny = c.y + D[d][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= Hh) continue;
      const ni = ny * W + nx;
      if (seen[ni]) continue;
      seen[ni] = 1;
      if (!this.walkable(nx, ny)) continue;
      const w = this.MQ.World.warpAt(map, nx, ny);
      if (w && w.kind !== "look") continue;
      q.push({ x: nx, y: ny });
    }
  }
  return null;
};

// Walk to a tile on the current map. Resolves {reached, interrupted, map}:
// interrupted means something took over (battle, dialogue, warp, respawn).
Session.prototype.walkTo = async function (tx, ty, opts) {
  opts = opts || {};
  const startMap = this.mapId();
  const route = this.path(tx, ty);
  if (!route) return { reached: false, interrupted: false, reason: "no path", map: startMap };
  this.note("walkTo " + tx + "," + ty + " (" + route.length + ")");
  for (let i = 0; i < route.length; i++) {
    const wp = route[i];
    let guard = 0;
    while (true) {
      const t = this.tile();
      if (t.x === wp.x && t.y === wp.y) break;
      if (this.locked() || this.topId() !== "overworld") {
        if (opts.wait === false) return { reached: false, interrupted: true, map: this.mapId() };
        try { await this.settle(opts.settle || 1500); } catch (e) { return { reached: false, interrupted: true, reason: "never settled", map: this.mapId() }; }
        if (this.mapId() !== startMap) return { reached: false, interrupted: true, map: this.mapId() };
        const t2 = this.tile();
        if (Math.abs(t2.x - wp.x) + Math.abs(t2.y - wp.y) > 1) return { reached: false, interrupted: true, map: this.mapId() };
      }
      const dx = wp.x - t.x, dy = wp.y - t.y;
      const dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      this.MQ.Input.inject(dir);
      this.step(); await nextTick();
      if (++guard > 240) return { reached: false, interrupted: false, reason: "stuck at " + t.x + "," + t.y + " heading " + dir, map: this.mapId() };
    }
  }
  return { reached: true, interrupted: false, map: this.mapId() };
};

// ---- invariants -----------------------------------------------------------
Session.prototype.violate = function (id, detail) {
  const v = { id: id, frame: this.frame, detail: detail, state: this.state(), actions: this.actions.slice(-12) };
  this.violations.push(v);
  if (this.opts.onViolation) this.opts.onViolation(v);
};

Session.prototype.check = function () {
  const MQ = this.MQ, O = MQ.Overworld;
  if (!O || !O.state || !MQ.Party) return;
  const top = this.topId();
  const party = this.party(), alive = this.alive();
  const onWorld = top === "overworld";
  const locked = onWorld ? this.locked() : true;

  // 1. free to walk with nobody able to fight (the encounter loop)
  if (onWorld && !locked && party.length && alive === 0) {
    if (!this._wipedEpisode) this.violate("wiped-freewalk", "the player is free to walk " + this.mapId() + " with every monster fainted");
    this._wipedEpisode = true;
  } else if (alive > 0) this._wipedEpisode = false;

  // 2. a lost battle must end at a kettle: healed, on the ground, in control
  if (this._lossPending && onWorld && !locked) {
    const lp = this._lossPending;
    this._lossPending = null;
    const t = this.tile();
    const healed = party.length > 0 && alive === party.length;
    if (!healed) this.violate("no-respawn-after-loss", "lost a " + lp.kind + " battle on " + lp.map + " at frame " + lp.frame + "; back in control on " + this.mapId() + " with " + alive + "/" + party.length + " able to fight");
    else if (!this.walkable(t.x, t.y)) this.violate("no-respawn-after-loss", "respawned on a blocked tile " + this.mapId() + " " + t.x + "," + t.y);
  }

  // 3. inside a wall
  if (onWorld && !locked && !O.state.boating) {
    const t = this.tile();
    const key = this.mapId() + ":" + t.x + "," + t.y;
    if (O.blockedTile(t.x, t.y)) { if (this._wallKey !== key) this.violate("inside-wall", "standing in a solid tile at " + key); this._wallKey = key; }
    else this._wallKey = null;
  }

  // 4. soft locks: the overworld held with nothing running, or held for ages
  if (onWorld && locked && !(MQ.Dialog && MQ.Dialog.isOpen()) && !(MQ.Script && MQ.Script.busy()) && !(MQ.Scenes.isCovered && MQ.Scenes.isCovered()) && !O.frozen()) this._lockedIdle++;
  else this._lockedIdle = 0;
  if (this._lockedIdle === (this.opts.idleLock || 600)) this.violate("softlock", "the overworld has been held busy for " + this._lockedIdle + " frames with no dialogue, script or transition running");
  if (locked) this._lockedAny++; else this._lockedAny = 0;
  if (this._lockedAny === (this.opts.maxLock || 6000)) this.violate("softlock", "no player control for " + this._lockedAny + " frames (top scene " + top + ")");

  // 5. a scene that will not go away under input (only meaningful when driven)
  if (this.opts.driven) {
    if (!onWorld && top === this._awayScene) this._awayFrames++; else { this._awayFrames = 0; this._awayScene = top; }
    if (this._awayFrames === (this.opts.maxAway || 4000)) this.violate("stuck-scene", "scene '" + top + "' has been on top for " + this._awayFrames + " frames of input");
  }

  // 6. stack growth
  if (MQ.Scenes.depth() > 8) this.violate("scene-depth", "scene stack depth " + MQ.Scenes.depth() + ": " + describeStack(MQ));

  // 7. party sanity
  for (let i = 0; i < party.length; i++) {
    const m = party[i];
    if (!m) continue;
    const max = m.stats ? m.stats.hp : null;
    if (typeof m.hp !== "number" || isNaN(m.hp) || m.hp < 0 || (max !== null && m.hp > max)) this.violate("party-sanity", m.species + " hp=" + m.hp + " max=" + max);
  }
  if (MQ.Inventory && typeof MQ.Inventory.money === "number" && (MQ.Inventory.money < 0 || isNaN(MQ.Inventory.money))) this.violate("party-sanity", "money=" + MQ.Inventory.money);
};

function describeStack(MQ) {
  return "(top " + (MQ.Scenes.top() && MQ.Scenes.top().id) + ")";
}
function safeJson(o) { try { return JSON.stringify(o); } catch (e) { return String(o); } }

// -------------------------------------------------------------
// boot: real title screen → New Game → the opening → the overworld
// -------------------------------------------------------------
async function boot(opts) {
  opts = opts || {};
  const env = H.load({ boot: true });
  const MQ = env.MQ;
  if (opts.seed !== undefined) env.window.Math = seededMath(opts.seed);
  if (opts.ui) { MQ.HEADLESS = false; env.window.__MQ_HEADLESS = false; }   // real BattleScene instead of autoRun
  MQ.Dialog.auto = true;
  MQ.Dialog.autoChoice = opts.autoChoice || 0;
  const s = new Session(env, opts);
  if (opts.quick) {
    // skip the title: the story's own hand-off, no opening script
    MQ.Events.emit("boot", {});
    MQ.Story.startNewGame({ name: opts.name || "Jim", difficulty: opts.difficulty || "normal", script: opts.script === undefined ? false : opts.script });
    await s.pump(3);
    if (!s.party().length && MQ.Party && MQ.Data && MQ.Data.makeMonster) MQ.Party.add(MQ.Data.makeMonster(opts.starter || "flitchick", opts.level || 8, {}));
    return s;
  }
  MQ.Boot.start();
  s.step(); await nextTick();
  if (s.topId() !== "title") throw new Error("Boot did not push the title (top " + s.topId() + ")");
  await s.press("a");                                                   // New Game
  await s.until(function () { return s.topId() === "name_entry"; }, 60, "name entry");
  env.fire("keydown", { key: "Enter", code: "Enter", preventDefault: function () {} });
  await s.until(function () { return s.topId() === "difficulty"; }, 60, "difficulty picker");
  const want = DIFFICULTY_INDEX[opts.difficulty || "normal"];
  const cur = DIFFICULTY_INDEX.normal;
  if (want !== undefined && want !== cur) await s.press(want > cur ? "down" : "up", Math.abs(want - cur));
  await s.press("a");
  await s.until(function () { return s.topId() === "overworld" && s.party().length > 0; }, 600, "the hand-off into the overworld with a starter");
  await s.settle(1500);
  return s;
}

module.exports = { boot: boot, Session: Session, seededMath: seededMath, mulberry32: mulberry32, STEP: STEP };

if (require.main === module) {
  const args = {};
  process.argv.slice(2).forEach(function (a) { const m = /^--([^=]+)=(.*)$/.exec(a); if (m) args[m[1]] = m[2]; else if (a.slice(0, 2) === "--") args[a.slice(2)] = true; });
  (async function () {
    const s = await boot({ seed: Number(args.seed) || 1, renderEvery: 15, verbose: !!args.verbose });
    console.log("booted:", JSON.stringify(s.state()));
    await s.pump(Number(args.frames) || 300);
    console.log("after " + s.frame + " frames:", JSON.stringify(s.state()));
    console.log("violations:", s.violations.length);
    s.violations.forEach(function (v) { console.log("  " + v.id + " @" + v.frame + ": " + v.detail); });
    s.close();
    process.exit(s.violations.length ? 1 : 0);
  })().catch(function (e) { console.error(e && e.stack || e); process.exit(2); });
}
