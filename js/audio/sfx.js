// =============================================================
// MonsterQuest v2 — MQ.SFX (audio workstream)
// Data-driven SFX table. Every entry is a list of "grains" rendered
// by MQ.Audio.renderPatch; nothing here makes a sound at load time.
//
// grain fields (all optional except a source):
//   i      'osc' (default) | 'noise' | 'fm'
//   w      wave: 'sine' 'square' 'triangle' 'sawtooth' 'pulse12/25/50'
//   n      MIDI note (69 = A4 = 440 Hz)   f  raw Hz instead of n
//   to     MIDI note to glide to over the grain (toF for raw Hz)
//   t      start offset in seconds        d  duration in seconds
//   v      peak level (0-1)               a  attack seconds
//   lp/hp/bp  filter cutoff in Hz  q  filter Q  sweep  cutoff to glide to
//   sus    true = sustained ADSR instead of a percussive tail
//   ratio/index  FM operator ratio and index
//   vib/vibHz    vibrato depth (cents) and rate
//   pink   use pink noise      rate  noise playback rate
//   drum   fire a kit patch instead ('k s h H t T m c r w b x n d g p z')
//   rep    {n, every, dn (semitone step), dv (gain factor), dd (dur factor)}
//
// entry fields: {grains, dur, vol, pitch, rand, minGap, duck}
//   dur    total length used for voice bookkeeping
//   rand   random pitch spread (0.06 = +/-3%) — stops footsteps machine-gunning
//   minGap seconds before the same id may retrigger
//   duck   0-1: how far to dip the music while this plays
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ || (window.MQ = {});
  const X = {};
  MQ.SFX = X;
  MQ.Sfx = X;                       // ROSTER spells it MQ.Sfx

  const TABLE = {};
  // Core (js/core/*) uses short generic names; map them onto the roster ids.
  const ALIAS = {
    cursor: "ui_move", blip: "ui_move", move: "ui_move",
    confirm: "ui_select", select: "ui_select", ok: "ui_select",
    cancel: "ui_back", back: "ui_back",
    deny: "ui_error", error: "ui_error", buzz: "ui_error",
    open: "ui_open", close: "ui_close",
    text: "text_tick", type: "text_tick",
    item: "coin", money: "coin", pickup: "coin",
    hit: "hit_normal", hit2: "hit_super", levelup: "achievement",
    step: "step_stone", throw: "capsule_throw", shake: "capsule_shake",
    catch: "capsule_catch", bell: "bell_toll", meow: "cat_meow"
  };
  X.ALIAS = ALIAS;

  X.define = function (id, spec) {
    spec.id = id;
    if (!spec.dur) {
      let end = 0.2;
      const g = spec.grains || [];
      for (let i = 0; i < g.length; i++) {
        const reps = g[i].rep ? (g[i].rep.n || 1) : 1;
        const e = (g[i].t || 0) + (g[i].d || 0.12) + (g[i].rep ? (reps - 1) * (g[i].rep.every || 0.08) : 0);
        if (e > end) end = e;
      }
      spec.dur = end;
    }
    TABLE[id] = spec;
    return spec;
  };
  X.get = function (id) {
    if (TABLE[id]) return TABLE[id];
    if (ALIAS[id]) return TABLE[ALIAS[id]] || null;
    return null;
  };
  X.has = function (id) { return !!X.get(id); };
  X.ids = function () { return Object.keys(TABLE); };
  X.each = function (fn) { for (const k in TABLE) if (Object.prototype.hasOwnProperty.call(TABLE, k)) fn(TABLE[k], k); };
  X.table = TABLE;
  X.play = function (id, opts) { return MQ.Audio ? MQ.Audio.sfx(id, opts) : false; };

  const d = X.define;

  // ---- interface -------------------------------------------------
  d("ui_move", { vol: 0.5, minGap: 0.03, grains: [
    { w: "pulse25", n: 93, d: 0.035, v: 0.4, a: 0.001 }
  ]});
  d("ui_select", { vol: 0.6, grains: [
    { w: "pulse25", n: 88, d: 0.045, v: 0.42 },
    { w: "pulse25", n: 95, t: 0.045, d: 0.08, v: 0.4 }
  ]});
  d("ui_back", { vol: 0.55, grains: [
    { w: "pulse25", n: 81, to: 74, d: 0.09, v: 0.38 }
  ]});
  d("ui_error", { vol: 0.6, grains: [
    { w: "square", n: 58, d: 0.07, v: 0.34 },
    { w: "square", n: 57, t: 0.06, d: 0.13, v: 0.34 }
  ]});
  d("ui_open", { vol: 0.5, grains: [
    { i: "noise", hp: 2600, sweep: 7000, d: 0.11, v: 0.18, a: 0.004 },
    { w: "pulse12", n: 79, to: 91, d: 0.09, v: 0.16 }
  ]});
  d("ui_close", { vol: 0.5, grains: [
    { i: "noise", hp: 6500, sweep: 2200, d: 0.1, v: 0.16, a: 0.002 },
    { w: "pulse12", n: 91, to: 79, d: 0.08, v: 0.14 }
  ]});
  d("text_tick", { vol: 0.28, minGap: 0.012, rand: 0.05, grains: [
    { w: "pulse12", n: 96, d: 0.018, v: 0.22, a: 0.001 }
  ]});

  // ---- footsteps (rand keeps repeats from sounding mechanical) ----
  d("step_grass", { vol: 0.5, rand: 0.14, minGap: 0.05, grains: [
    { i: "noise", pink: true, bp: 2400, q: 1.2, d: 0.06, v: 0.2, a: 0.002 }
  ]});
  d("step_stone", { vol: 0.5, rand: 0.12, minGap: 0.05, grains: [
    { i: "noise", lp: 1400, d: 0.045, v: 0.2, a: 0.001 },
    { w: "sine", n: 45, to: 36, d: 0.05, v: 0.12 }
  ]});
  d("step_wood", { vol: 0.5, rand: 0.12, minGap: 0.05, grains: [
    { w: "triangle", n: 57, to: 48, d: 0.07, v: 0.2 },
    { i: "noise", bp: 900, q: 2.2, d: 0.04, v: 0.14 }
  ]});
  d("step_water", { vol: 0.55, rand: 0.16, minGap: 0.05, grains: [
    { i: "noise", pink: true, bp: 1200, q: 0.9, sweep: 3200, d: 0.14, v: 0.22, a: 0.004 },
    { w: "sine", n: 62, to: 74, d: 0.08, v: 0.1 }
  ]});
  d("step_salt", { vol: 0.5, rand: 0.15, minGap: 0.05, grains: [
    { i: "noise", hp: 5200, d: 0.06, v: 0.22, a: 0.001 },
    { i: "noise", hp: 7500, t: 0.03, d: 0.04, v: 0.12 }
  ]});

  // ---- traversal ---------------------------------------------------
  d("door", { vol: 0.7, grains: [
    { i: "noise", pink: true, bp: 700, q: 1.4, sweep: 320, d: 0.34, v: 0.2, a: 0.02 },
    { w: "triangle", n: 43, to: 38, d: 0.3, v: 0.14 },
    { w: "square", n: 55, t: 0.3, d: 0.06, v: 0.14 }
  ]});
  d("warp", { vol: 0.8, duck: 0.3, grains: [
    { w: "pulse12", n: 60, to: 96, d: 0.42, v: 0.22, vib: 30, vibHz: 14 },
    { w: "sine", n: 48, to: 84, t: 0.05, d: 0.4, v: 0.18 },
    { i: "noise", hp: 1800, sweep: 9000, d: 0.45, v: 0.12, a: 0.06 }
  ]});
  d("ledge_hop", { vol: 0.6, grains: [
    { w: "pulse25", n: 72, to: 84, d: 0.1, v: 0.24 },
    { i: "noise", pink: true, bp: 2000, t: 0.22, d: 0.07, v: 0.2 }
  ]});
  d("bike_bell", { vol: 0.7, grains: [
    { i: "fm", n: 96, ratio: 3.47, index: 4, d: 0.7, v: 0.3, a: 0.002 },
    { i: "fm", n: 103, ratio: 2.76, index: 3, t: 0.06, d: 0.5, v: 0.18 }
  ]});
  d("boat_chug", { vol: 0.6, grains: [
    { w: "sine", n: 33, to: 28, d: 0.16, v: 0.34, rep: { n: 4, every: 0.22, dv: 0.94 } },
    { i: "noise", pink: true, lp: 600, d: 0.12, v: 0.1, t: 0.05, rep: { n: 4, every: 0.22 } }
  ]});
  d("train_pass", { vol: 0.75, duck: 0.25, grains: [
    { i: "noise", pink: true, bp: 700, q: 0.7, sweep: 2400, d: 1.4, v: 0.26, a: 0.35 },
    { w: "sawtooth", n: 34, to: 31, d: 1.4, v: 0.1, a: 0.4 },
    { drum: "x", t: 0.15, v: 0.4, rep: { n: 8, every: 0.15 } }
  ]});
  d("train_whistle", { vol: 0.8, duck: 0.3, grains: [
    { w: "sawtooth", n: 81, d: 0.85, v: 0.16, a: 0.05, lp: 3000, sus: true, r: 0.3 },
    { w: "sawtooth", n: 85, d: 0.85, v: 0.13, a: 0.06, lp: 3000, sus: true, r: 0.3 },
    { i: "noise", hp: 4000, d: 0.85, v: 0.05, a: 0.06 }
  ]});
  d("level_crossing", { vol: 0.65, grains: [
    { w: "sine", n: 88, d: 0.22, v: 0.24, rep: { n: 6, every: 0.34 } },
    { w: "sine", n: 84, t: 0.17, d: 0.22, v: 0.24, rep: { n: 6, every: 0.34 } }
  ]});

  // ---- weather / atmosphere ---------------------------------------
  d("rain", { vol: 0.5, grains: [
    { i: "noise", pink: true, hp: 3200, d: 2.6, v: 0.16, a: 0.6 },
    { i: "noise", pink: true, lp: 900, d: 2.6, v: 0.08, a: 0.8 }
  ]});
  d("wind", { vol: 0.55, grains: [
    { i: "noise", pink: true, bp: 620, q: 1.6, sweep: 1500, d: 2.8, v: 0.2, a: 0.9 }
  ]});
  d("fog_hum", { vol: 0.5, grains: [
    { w: "sawtooth", n: 33, d: 3.0, v: 0.12, a: 1.0, lp: 380, sus: true, r: 1.2 },
    { w: "sawtooth", n: 40, d: 3.0, v: 0.07, a: 1.2, lp: 420, sus: true, r: 1.2 }
  ]});
  d("thunder", { vol: 0.95, duck: 0.4, grains: [
    { i: "noise", pink: true, lp: 260, sweep: 90, d: 2.2, v: 0.5, a: 0.02 },
    { i: "noise", lp: 1600, sweep: 300, d: 0.5, v: 0.3, a: 0.005 },
    { w: "sine", n: 24, to: 19, d: 1.6, v: 0.3, a: 0.01 }
  ]});

  // ---- signal / ORACLE / agents ------------------------------------
  d("signal_pulse", { vol: 0.6, grains: [
    { i: "fm", n: 88, ratio: 1.41, index: 2.5, d: 0.13, v: 0.24, rep: { n: 3, every: 0.14, dn: 4, dv: 0.8 } }
  ]});
  d("oracle_tag", { vol: 0.85, duck: 0.5, duckMs: 1400, grains: [
    { i: "fm", n: 72, ratio: 1.41, index: 3, d: 0.3, v: 0.3, a: 0.01 },
    { i: "fm", n: 79, ratio: 1.41, index: 3, t: 0.3, d: 0.24, v: 0.3, a: 0.01 },
    { i: "fm", n: 78, ratio: 1.41, index: 3.4, t: 0.54, d: 0.3, v: 0.3, a: 0.01 },
    { i: "fm", n: 73, ratio: 1.41, index: 4, t: 0.84, d: 0.7, v: 0.32, a: 0.01 }
  ]});
  // The Agent Trio (plus Pippin, who is a cat and does as he likes).
  d("agent_sleet", { vol: 0.75, grains: [
    { i: "noise", hp: 5200, sweep: 11000, d: 0.3, v: 0.24, a: 0.01 },
    { w: "pulse12", n: 96, to: 108, d: 0.2, v: 0.16 },
    { w: "sine", n: 60, to: 72, d: 0.3, v: 0.12 }
  ]});
  d("agent_vigil", { vol: 0.75, grains: [
    { w: "sawtooth", n: 55, to: 67, d: 0.36, v: 0.2, lp: 900, sweep: 4200, sus: true },
    { i: "fm", n: 79, ratio: 2, index: 1.6, t: 0.1, d: 0.4, v: 0.16 }
  ]});
  d("agent_arbiter", { vol: 0.8, duck: 0.3, grains: [
    { w: "square", n: 48, d: 0.5, v: 0.2, lp: 700, sweep: 2600, sus: true },
    { i: "fm", n: 60, ratio: 1.5, index: 3, t: 0.05, d: 0.5, v: 0.2 },
    { drum: "g", t: 0, v: 0.6 }
  ]});
  d("agent_pippin", { vol: 0.7, grains: [
    { w: "triangle", n: 76, to: 83, d: 0.16, v: 0.22, vib: 30, vibHz: 12 },
    { w: "triangle", n: 83, to: 79, t: 0.16, d: 0.2, v: 0.2, vib: 30, vibHz: 12 },
    { i: "noise", pink: true, bp: 3200, t: 0.02, d: 0.1, v: 0.08 }
  ]});

  // ---- battle -------------------------------------------------------
  d("overdrive_ready", { vol: 0.8, grains: [
    { w: "pulse25", n: 72, d: 0.09, v: 0.24, rep: { n: 4, every: 0.09, dn: 4 } },
    { i: "noise", hp: 3000, sweep: 9000, t: 0.1, d: 0.3, v: 0.14, a: 0.12 }
  ]});
  d("overdrive_fire", { vol: 1.0, duck: 0.5, grains: [
    { w: "sawtooth", n: 84, to: 36, d: 0.5, v: 0.3, lp: 6000, sweep: 500 },
    { i: "noise", lp: 900, sweep: 140, d: 0.7, v: 0.4, a: 0.005 },
    { w: "sine", n: 36, to: 24, d: 0.8, v: 0.4, a: 0.004 },
    { drum: "c", t: 0, v: 0.9 }
  ]});
  d("hit_normal", { vol: 0.8, rand: 0.08, grains: [
    { i: "noise", lp: 1800, sweep: 500, d: 0.14, v: 0.34, a: 0.001 },
    { w: "square", n: 45, to: 33, d: 0.12, v: 0.22 }
  ]});
  d("hit_super", { vol: 0.95, rand: 0.06, grains: [
    { i: "noise", lp: 3400, sweep: 380, d: 0.24, v: 0.42, a: 0.001 },
    { w: "square", n: 50, to: 26, d: 0.2, v: 0.28 },
    { w: "sawtooth", n: 38, to: 22, t: 0.02, d: 0.24, v: 0.2 }
  ]});
  d("hit_weak", { vol: 0.6, rand: 0.08, grains: [
    { i: "noise", lp: 900, sweep: 400, d: 0.09, v: 0.2, a: 0.002 },
    { w: "triangle", n: 43, to: 38, d: 0.09, v: 0.14 }
  ]});
  d("crit", { vol: 1.0, duck: 0.35, grains: [
    { i: "noise", hp: 2400, sweep: 600, d: 0.3, v: 0.4, a: 0.001 },
    { w: "square", n: 62, to: 26, d: 0.26, v: 0.28 },
    { w: "pulse12", n: 96, to: 72, d: 0.12, v: 0.2 }
  ]});
  d("faint", { vol: 0.85, duck: 0.35, grains: [
    { w: "square", n: 64, to: 33, d: 0.6, v: 0.24 },
    { w: "pulse25", n: 57, to: 28, t: 0.06, d: 0.6, v: 0.18 },
    { i: "noise", pink: true, lp: 1400, sweep: 260, t: 0.1, d: 0.5, v: 0.16, a: 0.02 }
  ]});
  d("status_apply", { vol: 0.7, grains: [
    { w: "pulse12", n: 67, to: 60, d: 0.16, v: 0.22, vib: 40, vibHz: 16 },
    { i: "noise", bp: 1500, q: 3, d: 0.2, v: 0.14, a: 0.01 }
  ]});
  d("stage_up", { vol: 0.7, grains: [
    { w: "pulse25", n: 69, d: 0.07, v: 0.22, rep: { n: 4, every: 0.055, dn: 3 } }
  ]});
  d("stage_down", { vol: 0.7, grains: [
    { w: "pulse25", n: 81, d: 0.07, v: 0.22, rep: { n: 4, every: 0.055, dn: -3 } }
  ]});

  // ---- capsules -----------------------------------------------------
  d("capsule_throw", { vol: 0.7, grains: [
    { w: "pulse25", n: 64, to: 79, d: 0.22, v: 0.22 },
    { i: "noise", pink: true, hp: 3000, d: 0.18, v: 0.1, a: 0.03 }
  ]});
  d("capsule_shake", { vol: 0.7, rand: 0.05, minGap: 0.1, grains: [
    { w: "square", n: 52, to: 47, d: 0.07, v: 0.24 },
    { i: "noise", bp: 2200, q: 3, t: 0.02, d: 0.06, v: 0.14 }
  ]});
  d("capsule_catch", { vol: 0.9, duck: 0.45, grains: [
    { w: "pulse25", n: 72, d: 0.11, v: 0.26 },
    { w: "pulse25", n: 76, t: 0.11, d: 0.11, v: 0.26 },
    { w: "pulse25", n: 79, t: 0.22, d: 0.11, v: 0.26 },
    { w: "pulse25", n: 84, t: 0.33, d: 0.4, v: 0.3 },
    { i: "fm", n: 96, ratio: 3.47, index: 3, t: 0.33, d: 0.7, v: 0.16 }
  ]});
  d("capsule_break", { vol: 0.8, grains: [
    { i: "noise", hp: 4000, sweep: 1200, d: 0.28, v: 0.32, a: 0.001 },
    { w: "square", n: 79, to: 55, d: 0.22, v: 0.2 },
    { w: "pulse12", n: 91, to: 60, t: 0.04, d: 0.2, v: 0.14 }
  ]});

  // ---- items, growth, curiosities ------------------------------------
  d("heal", { vol: 0.75, grains: [
    { w: "sine", n: 76, d: 0.12, v: 0.22, rep: { n: 4, every: 0.085, dn: 4 } },
    { i: "fm", n: 88, ratio: 2, index: 1.2, t: 0.26, d: 0.5, v: 0.14 }
  ]});
  d("evolve", { vol: 0.9, duck: 0.4, grains: [
    { w: "pulse12", n: 60, to: 96, d: 0.9, v: 0.2, vib: 25, vibHz: 9 },
    { i: "noise", hp: 1600, sweep: 11000, d: 1.0, v: 0.16, a: 0.5 },
    { i: "fm", n: 84, ratio: 3.47, index: 4, t: 0.85, d: 0.8, v: 0.24 }
  ]});
  d("coin", { vol: 0.65, grains: [
    { w: "pulse25", n: 96, d: 0.05, v: 0.24 },
    { w: "pulse25", n: 103, t: 0.055, d: 0.13, v: 0.24 }
  ]});
  d("achievement", { vol: 0.85, duck: 0.35, grains: [
    { w: "pulse25", n: 72, d: 0.09, v: 0.24 },
    { w: "pulse25", n: 76, t: 0.09, d: 0.09, v: 0.24 },
    { w: "pulse25", n: 79, t: 0.18, d: 0.09, v: 0.24 },
    { w: "pulse25", n: 84, t: 0.27, d: 0.34, v: 0.28 },
    { i: "fm", n: 91, ratio: 2, index: 2, t: 0.27, d: 0.6, v: 0.16 }
  ]});
  d("bell_toll", { vol: 0.85, grains: [
    { i: "fm", n: 55, ratio: 3.47, index: 5, d: 2.4, v: 0.3, a: 0.004 },
    { i: "fm", n: 62, ratio: 2.76, index: 3, t: 0.02, d: 1.8, v: 0.16 },
    { w: "sine", n: 43, d: 2.4, v: 0.14, a: 0.01 }
  ]});
  d("camera_shutter", { vol: 0.7, grains: [
    { i: "noise", hp: 4200, d: 0.03, v: 0.3, a: 0.001 },
    { i: "noise", hp: 3000, t: 0.055, d: 0.05, v: 0.26, a: 0.001 },
    { w: "square", n: 84, t: 0.05, d: 0.03, v: 0.12 }
  ]});
  d("fish_bite", { vol: 0.75, grains: [
    { w: "sine", n: 60, to: 76, d: 0.1, v: 0.24 },
    { i: "noise", pink: true, bp: 1400, q: 1.2, sweep: 3600, t: 0.06, d: 0.18, v: 0.2, a: 0.006 },
    { drum: "d", t: 0.14, v: 0.7 }
  ]});
  d("brew_bubble", { vol: 0.6, rand: 0.18, grains: [
    { w: "sine", n: 55, to: 79, d: 0.09, v: 0.2, rep: { n: 3, every: 0.13, dn: 3, dv: 0.85 } }
  ]});

  // ---- cats (MEADOW, BIGBOY and every stray in the county) ------------
  d("cat_meow", { vol: 0.8, rand: 0.1, grains: [
    { w: "sawtooth", n: 72, to: 79, d: 0.16, v: 0.16, lp: 1600, sweep: 2600, vib: 25, vibHz: 7 },
    { w: "sawtooth", n: 79, to: 69, t: 0.16, d: 0.3, v: 0.16, lp: 2400, sweep: 900, vib: 35, vibHz: 6 },
    { i: "noise", pink: true, bp: 1800, q: 2, d: 0.4, v: 0.05, a: 0.05 }
  ]});
  d("cat_purr", { vol: 0.7, grains: [
    { w: "triangle", n: 31, d: 1.6, v: 0.24, a: 0.2, lp: 300, sus: true, r: 0.4, vib: 300, vibHz: 24 },
    { i: "noise", pink: true, lp: 260, d: 1.6, v: 0.12, a: 0.25 }
  ]});
  d("cat_sit", { vol: 0.55, rand: 0.12, grains: [
    { i: "noise", pink: true, lp: 1200, d: 0.1, v: 0.16, a: 0.01 },
    { w: "triangle", n: 50, to: 45, d: 0.09, v: 0.1 }
  ]});
})();
