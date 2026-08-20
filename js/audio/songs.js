// =============================================================
// MonsterQuest v2 — MQ.Songs (audio workstream)
// The song book. Every tune is data: patterns of scale degrees
// rendered to the MQ.Audio pattern DSL at load time (no game logic
// runs here — this file only registers data).
//
// House style
//   * A COUNTY THEME (an 8-bar tune) is the leitmotif of Cheshire.
//     Towns quote it in the mode that suits them (Macclesfield's
//     Dorian gloom, Chester's Ionian pomp), routes run it as a
//     walking pulse, the battle themes shred it, credits reprise it.
//   * Regional families: east/bollin share a flute-and-strings
//     colour, dane/south share the rail snare, salt/mersey/west
//     share the wind pads, wales stands alone with the harp.
//   * Every song is 32-64 bars with real chord changes and a B
//     section, except the stingers.
//
// Pattern helpers (all lengths in BEATS; tracks use step 0.25):
//   m(scale, "0 2 4:1.5 2:0.5")     degrees -> semitone pattern
//   bl(scale, [0,3,4,0], 'walk')    bass line from a progression
//   ch(scale, prog, 'stab')         chord/pad comping
//   ap(scale, prog, [0,2,4,2])      arpeggio
//   rp("k...s...", 4)               repeat a drum string
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ || (window.MQ = {});
  const S = {};
  MQ.Songs = S;

  const TABLE = {};
  const ALIAS = { battle_rival: "battle_vex", town_poynton: "town_prestbury", town_sandbach: "town_congleton", town_runcorn: "town_frodsham", town_lymm: "town_warrington", ending: "credits" };
  S.ALIAS = ALIAS;

  S.define = function (id, def) {
    def.id = id;
    TABLE[id] = def;
    return def;
  };
  S.get = function (id) {
    if (TABLE[id]) return TABLE[id];
    if (ALIAS[id]) return TABLE[ALIAS[id]] || null;
    return null;
  };
  S.has = function (id) { return !!S.get(id); };
  S.ids = function () { return Object.keys(TABLE); };
  S.each = function (fn) { for (const k in TABLE) if (Object.prototype.hasOwnProperty.call(TABLE, k)) fn(TABLE[k], k); };
  S.table = TABLE;
  S.compile = function (id) {
    const d = S.get(id);
    return d && MQ.Audio ? MQ.Audio.compile(d, id) : null;
  };

  // ---------------------------------------------------------------
  // helpers
  // ---------------------------------------------------------------
  const SCALES = {
    ionian: [0, 2, 4, 5, 7, 9, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    melodic: [0, 2, 3, 5, 7, 9, 11],
    pentMaj: [0, 2, 4, 7, 9],
    pentMin: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    whole: [0, 2, 4, 6, 8, 10]
  };
  S.SCALES = SCALES;

  function degSemi(sc, d) {
    const n = sc.length;
    const o = Math.floor(d / n);
    return sc[d - o * n] + o * 12;
  }

  const RX = /^([!,]*)([^:>]+)(?:>(-?\d+))?(?::([0-9.]+))?$/;

  // degrees -> the MQ.Audio semitone pattern DSL (lengths beats -> steps)
  function m(scale, str) {
    const sc = SCALES[scale] || SCALES.ionian;
    const toks = String(str).replace(/\|/g, " ").trim().split(/\s+/);
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i];
      if (!tk) continue;
      const mm = RX.exec(tk);
      if (!mm) { MQ.warn("[Songs] bad token: " + tk); continue; }
      const acc = mm[1] || "";
      const body = mm[2];
      const gl = mm[3];
      const len = mm[4] === undefined ? 1 : parseFloat(mm[4]);
      const steps = Math.round(len * 4 * 1000) / 1000;
      if (body === "." || body === "-") { out.push(acc + body + ":" + steps); continue; }
      const parts = body.split("+");
      const semis = [];
      let base = null;
      for (let j = 0; j < parts.length; j++) {
        const pm = /^(-?\d+)([#b]?)$/.exec(parts[j]);
        if (!pm) { MQ.warn("[Songs] bad degree: " + parts[j]); continue; }
        const d = parseInt(pm[1], 10);
        let s = degSemi(sc, d);
        if (pm[2] === "#") s += 1; else if (pm[2] === "b") s -= 1;
        if (base === null) base = { d: d, s: s };
        semis.push(s);
      }
      if (!semis.length) { out.push(".:" + steps); continue; }
      let tok = acc + semis.join("+");
      if (gl !== undefined && base) tok += ">" + (degSemi(sc, base.d + parseInt(gl, 10)) - base.s);
      out.push(tok + ":" + steps);
    }
    return out.join(" ");
  }
  S.m = m;

  // bass lines from a bar-per-entry degree progression
  function bl(scale, prog, style, beats) {
    beats = beats || 4;
    const P = [];
    for (let i = 0; i < prog.length; i++) {
      const r = prog[i];
      const fifth = r + 4;
      const oct = r + 7;
      let k;
      switch (style) {
        case "root": P.push(r + ":" + beats); break;
        case "half": P.push(r + ":" + (beats / 2), r + ":" + (beats / 2)); break;
        case "root5": P.push(r + ":" + (beats / 2), fifth + ":" + (beats / 2)); break;
        case "march": for (k = 0; k < beats; k++) P.push((k % 2 ? fifth : r) + ":1"); break;
        case "pump": for (k = 0; k < beats * 2; k++) P.push(r + ":0.5"); break;
        case "drive": for (k = 0; k < beats * 2; k++) P.push((k % 8 === 6 ? r + 2 : r) + ":0.5"); break;
        case "oct": for (k = 0; k < beats; k++) { P.push(r + ":0.5"); P.push(oct + ":0.5"); } break;
        case "walk": P.push(r + ":1", (r + 1) + ":1", (r + 2) + ":1", fifth + ":1"); break;
        case "rail": for (k = 0; k < beats; k++) { P.push(r + ":0.5", ".:0.5"); } break;
        case "off": for (k = 0; k < beats; k++) { P.push(".:0.5", (k % 2 ? fifth : r) + ":0.5"); } break;
        case "tick": for (k = 0; k < beats * 2; k++) P.push((k % 2 ? "." : r) + ":0.5"); break;
        case "swell": P.push(r + ":" + beats); break;
        default: P.push(r + ":" + beats);
      }
    }
    return m(scale, P.join(" "));
  }
  S.bl = bl;

  // triadic comping
  function ch(scale, prog, style, beats) {
    beats = beats || 4;
    const P = [];
    for (let i = 0; i < prog.length; i++) {
      const r = prog[i];
      const c = r + "+" + (r + 2) + "+" + (r + 4);
      const c7 = r + "+" + (r + 2) + "+" + (r + 4) + "+" + (r + 6);
      let k;
      switch (style) {
        case "whole": P.push(c + ":" + beats); break;
        case "whole7": P.push(c7 + ":" + beats); break;
        case "half": P.push(c + ":" + (beats / 2), c + ":" + (beats / 2)); break;
        case "stab": for (k = 0; k < beats; k++) P.push(k % 2 ? c + ":1" : ".:1"); break;
        case "off": for (k = 0; k < beats; k++) { P.push(".:0.5", c + ":0.5"); } break;
        case "waltz": P.push(".:1", c + ":1", c + ":1"); break;
        case "push": for (k = 0; k < beats * 2; k++) P.push(c + ":0.5"); break;
        case "swell": P.push(c + ":" + beats); break;
        default: P.push(c + ":" + beats);
      }
    }
    return m(scale, P.join(" "));
  }
  S.ch = ch;

  // arpeggios: shape is a list of degree offsets from the bar's root
  function ap(scale, prog, shape, beats, step) {
    beats = beats || 4;
    step = step || 0.5;
    const per = Math.round(beats / step);
    const P = [];
    for (let i = 0; i < prog.length; i++) {
      for (let k = 0; k < per; k++) P.push((prog[i] + shape[k % shape.length]) + ":" + step);
    }
    return m(scale, P.join(" "));
  }
  S.ap = ap;

  function rp(s, n) { let o = s; for (let i = 1; i < n; i++) o += s; return o; }
  S.rp = rp;

  // ---------------------------------------------------------------
  // shared motifs
  // ---------------------------------------------------------------
  // The county theme: eight bars that belong to the whole game.
  const COUNTY_A = "0 2 4:1.5 2:0.5 | 3:2 2:2 | 4 6 7:1.5 6:0.5 | 4:2 2:1 0:1";
  const COUNTY_B = "-3 0 2:1.5 0:0.5 | 1:2 2:2 | 4 2 1:1.5 0:0.5 | -1:2 0:2";
  const COUNTY_HEAD = "0 2 4:1.5 2:0.5 | 3:2 2:2";
  const PROG_COUNTY = [0, 3, 4, 0, 5, 1, 4, 0];
  S.COUNTY_A = COUNTY_A; S.COUNTY_B = COUNTY_B; S.PROG_COUNTY = PROG_COUNTY;

  // ORACLE's four-note tag — chromatic, deliberately outside the mode.
  const ORACLE_TAG = "0:2 7:1 6:2 1:3";           // raw semitones
  const ORACLE_TAG_SLOW = "0:4 7:2 6:4 1:6";
  S.ORACLE_TAG = ORACLE_TAG;

  // Cat motifs (MEADOW is a rising third, BIGBOY a lumbering fifth).
  const MEADOW = "0:0.5 4:0.5 7:1";
  const BIGBOY = "0:1 -5:1 0:2";

  // Common drum cells (one bar of 4/4 at step 0.25 = 16 chars)
  const D_ROCK = "k...s...k...s...";
  const D_ROCK2 = "k...s...k..ks...";
  const D_MARCH = "k.k.s...k.k.s..S";
  const D_HAT8 = "h.h.h.h.h.h.h.h.";
  const D_HAT16 = "hhhhhhhhhhhhhhhh";
  const D_HATSW = "h..hh..hh..hh..h";
  const D_RAIL = "x.x.x.x.x.x.x.x.";
  const D_RAIL16 = "xxxxxxxxxxxxxxxx";
  const D_SHAKE = "z.z.z.z.z.z.z.z.";
  const D_DRIVE = "k.k.s...k.k.s.k.";
  const D_BREAK = "k..ks..kk..ks.ss";

  // ===============================================================
  // TITLE
  // ===============================================================
  S.define("title", {
    title: "The Cheshire Protocol",
    bpm: 76, key: "d", beats: 4, bars: 40,
    loop: { from: 8, to: 40 },
    patterns: {
      pad_i: ch("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      pad_a: ch("aeolian", PROG_COUNTY, "whole"),
      pad_b: ch("aeolian", [5, 3, 1, 4, 5, 3, 4, 0], "whole"),
      lead_a: m("aeolian", COUNTY_A),
      lead_b: m("aeolian", COUNTY_B),
      lead_c: m("aeolian", "4:2 6:2 | 7:3 6:1 | 5:2 4:2 | 2:4 | 0:2 2:2 | 4:3 2:1 | 1:2 0:2 | 0:4"),
      harp_i: ap("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], [0, 4, 7, 4, 2, 4, 7, 9], 4, 0.5),
      harp_a: ap("aeolian", PROG_COUNTY, [0, 2, 4, 7, 4, 2], 4, 0.5),
      harp_b: ap("aeolian", [5, 3, 1, 4, 5, 3, 4, 0], [0, 4, 2, 7, 4, 2], 4, 0.5),
      bass_i: bl("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "root"),
      bass_a: bl("aeolian", PROG_COUNTY, "half"),
      bass_b: bl("aeolian", [5, 3, 1, 4, 5, 3, 4, 0], "half"),
      rain: rp("z..z.z..z..zz.z.", 1),
      rain2: rp("z.zzz..zz.z.z.zz", 1)
    },
    tracks: [
      { id: "pad", inst: "pad", oct: 0, vol: 1.1, send: 0.35, seq: "pad_i pad_a pad_b pad_a pad_b" },
      { id: "lead", inst: "flute", oct: 2, vol: 1.0, pan: -0.15, send: 0.3, layer: 0, seq: "_*8 lead_a lead_b lead_c lead_a lead_b lead_c" },
      { id: "harp", inst: "harp", oct: 1, vol: 0.75, pan: 0.25, seq: "harp_i harp_a harp_b harp_a harp_b" },
      { id: "bass", inst: "sub", oct: -1, vol: 1.0, seq: "bass_i bass_a bass_b bass_a bass_b" },
      { id: "rain", inst: "drums", vol: 0.5, step: 0.25, seq: "rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2 rain rain2" }
    ]
  });

  // ===============================================================
  // TOWNS — each quotes the county theme in its own mode
  // ===============================================================

  // Macclesfield: loom-clack percussion, oxblood brass, Dorian.
  S.define("town_macc", {
    title: "Silk, Soot and Steps",
    bpm: 106, key: "d", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("dorian", COUNTY_A),
      lead_b: m("dorian", COUNTY_B),
      lead_c: m("dorian", "2:0.5 4:0.5 5:1 4:0.5 2:0.5 0:1 | 2:2 4:1 2:1 | 5:0.5 4:0.5 2:1 0:1 -1:1 | 0:4"),
      lead_d: m("dorian", "4:1 5:1 6:1.5 5:0.5 | 4:2 2:2 | 0:0.5 2:0.5 4:1 2:1 0:1 | -3:2 0:2"),
      brass_a: ch("dorian", PROG_COUNTY, "stab"),
      brass_b: ch("dorian", [2, 5, 3, 4, 2, 5, 4, 0], "stab"),
      bass_a: bl("dorian", PROG_COUNTY, "march"),
      bass_b: bl("dorian", [2, 5, 3, 4, 2, 5, 4, 0], "march"),
      loom: "x..x..x.x..x..x.",
      loom2: "x..x..x.x..xx.x.",
      kit: D_ROCK,
      kit2: D_ROCK2,
      hats: D_HAT8
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.0, pan: -0.12, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "counter", inst: "pulse12", oct: 1, vol: 0.55, pan: 0.3, layer: 1, seq: "_*12 lead_a lead_b lead_c lead_d _*12" },
      { id: "brass", inst: "brass", oct: 0, vol: 0.9, seq: "brass_a brass_a brass_b brass_a brass_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b" },
      { id: "loom", inst: "drums", vol: 0.7, seq: "loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2 loom loom loom loom2" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "hats", inst: "drums", vol: 0.4, layer: 1, seq: "hats*40" }
    ]
  });

  // Bollington: brass band on Kerridge Hill, tuba oom-pah.
  S.define("town_bollington", {
    title: "White Nancy March",
    bpm: 118, key: "bb", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      fan: m("ionian", "0:0.5 2:0.5 4:1 4:0.5 2:0.5 4:1 | 7:2 4:2 | 0:0.5 2:0.5 4:1 7:1 6:1 | 4:4"),
      tune_a: m("ionian", "4:1 4:0.5 5:0.5 6:1 4:1 | 7:1.5 6:0.5 4:2 | 2:1 4:1 5:1.5 4:0.5 | 2:2 0:2"),
      tune_b: m("ionian", "0:1 2:1 4:1.5 2:0.5 | 3:1 4:1 5:2 | 6:1 5:1 4:1 2:1 | 4:4"),
      tune_c: m("ionian", COUNTY_A),
      tune_d: m("ionian", COUNTY_B),
      horn_a: ch("ionian", [0, 4, 0, 4, 3, 0, 4, 0], "off"),
      horn_b: ch("ionian", [0, 3, 5, 4, 0, 3, 4, 0], "off"),
      tuba_a: bl("ionian", [0, 4, 0, 4, 3, 0, 4, 0], "root5"),
      tuba_b: bl("ionian", [0, 3, 5, 4, 0, 3, 4, 0], "root5"),
      tuba_c: bl("ionian", PROG_COUNTY, "root5"),
      snare: "k.s.k.s.k.s.k.sS",
      snare2: "k.s.k.s.k.ssksss",
      cym: "c...............",
      cym2: "................"
    },
    tracks: [
      { id: "cornet", inst: "brass", oct: 2, vol: 1.0, pan: -0.2, seq: "fan tune_a tune_b tune_a tune_c tune_d tune_a tune_b tune_c tune_d" },
      { id: "horn", inst: "brass", oct: 0, vol: 0.6, pan: 0.25, seq: "horn_a horn_a horn_b horn_a horn_b horn_a horn_b horn_a horn_b horn_a" },
      { id: "tuba", inst: "tuba", oct: -1, vol: 1.0, seq: "tuba_a tuba_a tuba_b tuba_a tuba_c tuba_c tuba_a tuba_b tuba_c tuba_c" },
      { id: "snare", inst: "drums", vol: 0.8, seq: "snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2" },
      { id: "cym", inst: "drums", vol: 0.5, layer: 1, seq: "cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3 cym cym2*3" }
    ]
  });

  // Prestbury: gravel drives, box hedges, money and CCTV.
  // Variant 'poynton' bolts an engine chug underneath.
  S.define("town_prestbury", {
    title: "Gravel and Hedges",
    bpm: 86, key: "e", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      str_a: ch("ionian", [0, 5, 3, 4, 0, 5, 1, 4], "whole"),
      str_b: ch("ionian", [3, 4, 2, 5, 3, 4, 0, 0], "whole"),
      lead_a: m("ionian", "4:2 2:1 4:1 | 5:3 4:1 | 2:2 0:1 2:1 | 1:4"),
      lead_b: m("ionian", "0:1 2:1 4:2 | 6:2 4:2 | 5:1 4:1 2:1 1:1 | 0:4"),
      lead_c: m("ionian", COUNTY_HEAD + " | 4:2 2:2 | 0:4"),
      harp_a: ap("ionian", [0, 5, 3, 4, 0, 5, 1, 4], [0, 4, 7, 4], 4, 0.5),
      harp_b: ap("ionian", [3, 4, 2, 5, 3, 4, 0, 0], [0, 2, 4, 7], 4, 0.5),
      bass_a: bl("ionian", [0, 5, 3, 4, 0, 5, 1, 4], "root"),
      bass_b: bl("ionian", [3, 4, 2, 5, 3, 4, 0, 0], "root"),
      gravel: "z..z...z..z.z...",
      chug: "K..k..K..k..K.k.",
      chug2: "K..k..K..k..K.kk"
    },
    tracks: [
      { id: "strings", inst: "strings", oct: 0, vol: 1.0, send: 0.25, seq: "str_a str_b str_a str_b" },
      { id: "lead", inst: "flute", oct: 2, vol: 0.85, pan: -0.15, seq: "lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b" },
      { id: "harp", inst: "harp", oct: 1, vol: 0.6, pan: 0.3, layer: 1, seq: "harp_a harp_b harp_a harp_b" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.9, seq: "bass_a bass_b bass_a bass_b" },
      { id: "gravel", inst: "drums", vol: 0.4, seq: "gravel*32" },
      { id: "engine", inst: "drums", vol: 0.7, only: ["poynton"], seq: "chug*3 chug2 chug*3 chug2 chug*3 chug2 chug*3 chug2 chug*3 chug2 chug*3 chug2 chug*3 chug2 chug*3 chug2" },
      { id: "engine_reed", inst: "reed", oct: -1, vol: 0.5, only: ["poynton"], seq: "bass_a bass_b bass_a bass_b" }
    ]
  });

  // Wilmslow: café-clean FM, 8-bit clicks for Turing.
  S.define("town_wilmslow", {
    title: "Adlington Road",
    bpm: 124, key: "a", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      pad_a: ch("mixolydian", [0, 5, 3, 4, 0, 5, 3, 6], "off"),
      pad_b: ch("mixolydian", [3, 4, 0, 5, 3, 6, 4, 0], "off"),
      lead_a: m("mixolydian", "0:0.5 2:0.5 4:1 2:0.5 4:0.5 6:1 | 5:1.5 4:0.5 2:2 | 4:0.5 5:0.5 6:1 5:0.5 4:0.5 2:1 | 0:4"),
      lead_b: m("mixolydian", "4:1 6:1 7:1.5 6:0.5 | 4:2 2:2 | 6:0.5 5:0.5 4:1 2:1 0:1 | 2:4"),
      lead_c: m("mixolydian", COUNTY_A),
      lead_d: m("mixolydian", COUNTY_B),
      bass_a: bl("mixolydian", [0, 5, 3, 4, 0, 5, 3, 6], "drive"),
      bass_b: bl("mixolydian", [3, 4, 0, 5, 3, 6, 4, 0], "drive"),
      clicks: "w.w..w.ww..w.w..",
      clicks2: "w.w..w.ww.w.w.ww",
      kit: "k..hs..hk.h.s.h.",
      kit2: "k..hs..hk.h.s.hh"
    },
    tracks: [
      { id: "lead", inst: "fm", oct: 2, vol: 0.95, pan: -0.1, params: { ratio: 2, index: 1.6 }, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "pad", inst: "pulse12", oct: 1, vol: 0.5, pan: 0.3, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "marimba", inst: "marimba", oct: 1, vol: 0.6, layer: 1, seq: "_*4 lead_a lead_b _*4 lead_a lead_b _*4 lead_a lead_b _*4" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "clicks", inst: "drums", vol: 0.45, seq: "clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2 clicks*3 clicks2" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" }
    ]
  });

  // Alderley Edge: copper-mine drone under a wizard's bell.
  S.define("town_alderley", {
    title: "The Wizard's Well",
    bpm: 74, key: "f#", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      drone_a: m("aeolian", "0:4 | 0:4 | -2:4 | -2:4 | -4:4 | -4:4 | 0:4 | 0:4"),
      bell_a: m("aeolian", ".:2 0:2 | .:4 | 4:2 .:2 | .:4 | 2:2 .:2 | .:4 | -1:2 0:2 | .:4"),
      bell_b: m("aeolian", "7:1 4:1 2:2 | .:4 | 4:1 2:1 0:2 | .:4 | 2:1 0:1 -1:2 | .:4 | 0:4 | .:4"),
      lead_a: m("aeolian", ".:4 | 0:2 2:2 | 3:3 2:1 | 0:4 | .:4 | 4:2 2:2 | 1:3 0:1 | 0:4"),
      lead_b: m("aeolian", COUNTY_B),
      cop_a: ch("aeolian", [0, 0, 5, 5, 3, 3, 0, 0], "whole"),
      cop_b: ch("aeolian", [5, 5, 3, 3, 4, 4, 0, 0], "whole"),
      bass_a: bl("aeolian", [0, 0, 5, 5, 3, 3, 0, 0], "root"),
      bass_b: bl("aeolian", [5, 5, 3, 3, 4, 4, 0, 0], "root"),
      drip: "d.......d.......",
      drip2: "d......d....d..."
    },
    tracks: [
      { id: "drone", inst: "drone", oct: -1, vol: 1.1, send: 0.4, seq: "drone_a drone_a drone_a drone_a" },
      { id: "copper", inst: "pad", oct: 0, vol: 0.8, send: 0.3, seq: "cop_a cop_b cop_a cop_b" },
      { id: "bell", inst: "bell", oct: 2, vol: 0.9, pan: 0.25, send: 0.5, seq: "bell_a bell_b bell_a bell_b" },
      { id: "lead", inst: "glass", oct: 1, vol: 0.8, pan: -0.2, send: 0.4, layer: 1, seq: "lead_a lead_b lead_b lead_a lead_b lead_b" },
      { id: "bass", inst: "sub", oct: -2, vol: 0.9, seq: "bass_a bass_b bass_a bass_b" },
      { id: "drip", inst: "drums", vol: 0.5, send: 0.6, seq: "drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2" }
    ]
  });

  // Knutsford: a Cranford waltz on harpsichord, May Day bells. 3/4.
  S.define("town_knutsford", {
    title: "Cranford Waltz",
    bpm: 138, key: "g", beats: 3, bars: 48,
    loop: { from: 0, to: 48 },
    patterns: {
      w_a: m("ionian", "0:1 2:1 4:1 | 5:2 4:1 | 2:1 4:1 6:1 | 5:3 | 4:1 2:1 0:1 | 1:2 2:1 | 4:1 2:1 1:1 | 0:3"),
      w_b: m("ionian", "4:1 6:1 7:1 | 9:2 7:1 | 6:1 4:1 2:1 | 4:3 | 5:1 4:1 2:1 | 3:2 2:1 | 1:1 0:1 -1:1 | 0:3"),
      w_c: m("ionian", "0:1 4:1 7:1 | 6:2 4:1 | 2:1 5:1 4:1 | 2:3 | -3:1 0:1 2:1 | 4:2 2:1 | 1:1 2:1 0:1 | 0:3"),
      cmp_a: ch("ionian", [0, 4, 3, 4, 0, 5, 4, 0], "waltz", 3),
      cmp_b: ch("ionian", [3, 0, 5, 1, 4, 3, 4, 0], "waltz", 3),
      bass_a: bl("ionian", [0, 4, 3, 4, 0, 5, 4, 0], "root", 3),
      bass_b: bl("ionian", [3, 0, 5, 1, 4, 3, 4, 0], "root", 3),
      bell_a: m("ionian", "7:3 | .:3 | 4:3 | .:3 | 2:3 | .:3 | 0:3 | .:3"),
      may: "b...........",
      may2: "............"
    },
    tracks: [
      { id: "harpsi", inst: "harpsi", oct: 2, vol: 1.0, pan: -0.15, seq: "w_a w_b w_a w_c w_a w_b" },
      { id: "comp", inst: "harpsi", oct: 0, vol: 0.55, pan: 0.25, seq: "cmp_a cmp_b cmp_a cmp_b cmp_a cmp_b" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.5, layer: 1, send: 0.2, seq: "cmp_a cmp_b cmp_a cmp_b cmp_a cmp_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 0.95, seq: "bass_a bass_b bass_a bass_b bass_a bass_b" },
      { id: "bells", inst: "bell", oct: 2, vol: 0.7, send: 0.45, layer: 1, seq: "bell_a bell_a bell_a bell_a bell_a bell_a" },
      { id: "maypole", inst: "drums", vol: 0.5, step: 0.25, seq: "may may2*7 may may2*7 may may2*7 may may2*7 may may2*7 may may2*7" }
    ]
  });

  // Congleton: bear-drum lumber, church bell. Variant 'sandbach' adds
  // the Saxon cross-hum.
  S.define("town_congleton", {
    title: "Beartown Lumber",
    bpm: 94, key: "c", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      lead_a: m("dorian", "0:2 3:1 2:1 | 4:2 2:2 | 5:1 4:1 2:1.5 0:0.5 | -2:2 0:2"),
      lead_b: m("dorian", "4:1 5:1 6:2 | 5:2 4:2 | 2:1 4:1 5:1 4:1 | 2:4"),
      lead_c: m("dorian", COUNTY_A),
      lead_d: m("dorian", COUNTY_B),
      brass_a: ch("dorian", [0, 0, 3, 3, 5, 5, 4, 0], "half"),
      brass_b: ch("dorian", [3, 5, 0, 4, 3, 5, 4, 0], "half"),
      bass_a: bl("dorian", [0, 0, 3, 3, 5, 5, 4, 0], "half"),
      bass_b: bl("dorian", [3, 5, 0, 4, 3, 5, 4, 0], "half"),
      bear: "K.......K...K...",
      bear2: "K...K...K..KK...",
      bell: "g...............",
      bellrest: "................",
      hum: m("dorian", "0+4:4 | 0+4:4 | 3+0:4 | 3+0:4 | 5+2:4 | 5+2:4 | 4+1:4 | 0+4:4")
    },
    tracks: [
      { id: "lead", inst: "tuba", oct: 1, vol: 0.9, pan: -0.1, seq: "lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d" },
      { id: "brass", inst: "brass", oct: 0, vol: 0.75, seq: "brass_a brass_b brass_a brass_b brass_a brass_b brass_a brass_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b" },
      { id: "bear", inst: "drums", vol: 0.95, seq: "bear*3 bear2 bear*3 bear2 bear*3 bear2 bear*3 bear2 bear*3 bear2 bear*3 bear2 bear*3 bear2 bear*3 bear2" },
      { id: "bell", inst: "drums", vol: 0.5, send: 0.4, layer: 1, seq: "bell bellrest*7 bell bellrest*7 bell bellrest*7 bell bellrest*7" },
      { id: "crosshum", inst: "choir", oct: 0, vol: 0.7, send: 0.5, only: ["sandbach"], seq: "hum hum hum hum hum hum hum hum" }
    ]
  });

  // Crewe: rail rhythm, signal whistle, steam.
  S.define("town_crewe", {
    title: "Junction Time",
    bpm: 130, key: "e", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("mixolydian", "0:0.5 0:0.5 4:1 3:0.5 2:0.5 0:1 | 4:1.5 5:0.5 4:1 2:1 | 0:0.5 0:0.5 4:1 6:0.5 5:0.5 4:1 | 2:4"),
      lead_b: m("mixolydian", "4:1 6:1 7:1.5 6:0.5 | 4:1 2:1 4:2 | 5:1 4:1 2:1 0:1 | 0:4"),
      lead_c: m("mixolydian", COUNTY_A),
      lead_d: m("mixolydian", COUNTY_B),
      whistle: m("mixolydian", ".:3 7>2:1 | .:4 | .:4 | .:4 | .:3 9>-2:1 | .:4 | .:4 | .:4"),
      bass_a: bl("mixolydian", [0, 0, 3, 3, 4, 4, 0, 0], "drive"),
      bass_b: bl("mixolydian", [5, 5, 3, 3, 4, 6, 0, 0], "drive"),
      rail: D_RAIL,
      rail2: "x.x.x.x.x.x.xxx.",
      kit: "k..ks..hk..ks..h",
      kit2: "k..ks..hk.kks.ss",
      steam: "n...............",
      steamrest: "................"
    },
    tracks: [
      { id: "lead", inst: "reed", oct: 2, vol: 0.95, pan: -0.12, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "whistle", inst: "reed", oct: 3, vol: 0.5, pan: 0.35, layer: 1, seq: "whistle whistle whistle whistle whistle whistle whistle whistle whistle whistle" },
      { id: "brass", inst: "brass", oct: 0, vol: 0.6, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.05, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "rail", inst: "drums", vol: 0.6, seq: "rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "steam", inst: "drums", vol: 0.45, layer: 1, seq: "steam steamrest*7 steam steamrest*7 steam steamrest*7 steam steamrest*7 steam steamrest*7" }
    ]
  });

  // Nantwich: brine-drip marimba over a Tudor lute.
  S.define("town_nantwich", {
    title: "Brine and Timber",
    bpm: 98, key: "bb", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      mar_a: ap("lydian", [0, 5, 3, 4, 0, 5, 1, 4], [0, 2, 4, 6, 4, 2], 4, 0.5),
      mar_b: ap("lydian", [3, 4, 5, 0, 3, 6, 4, 0], [0, 4, 2, 6, 4, 2], 4, 0.5),
      lute_a: m("lydian", "0:1 2:1 4:1.5 2:0.5 | 3:2 2:2 | 4:1 6:1 5:1.5 4:0.5 | 2:4"),
      lute_b: m("lydian", "5:1 4:1 2:2 | 3:1 2:1 0:2 | 1:1 2:1 4:1 2:1 | 0:4"),
      lute_c: m("lydian", COUNTY_A),
      lute_d: m("lydian", COUNTY_B),
      bass_a: bl("lydian", [0, 5, 3, 4, 0, 5, 1, 4], "half"),
      bass_b: bl("lydian", [3, 4, 5, 0, 3, 6, 4, 0], "half"),
      drip: "d...z...d...z.z.",
      drip2: "d...z.z.d.z.z.z."
    },
    tracks: [
      { id: "marimba", inst: "marimba", oct: 1, vol: 0.9, pan: 0.2, seq: "mar_a mar_b mar_a mar_b" },
      { id: "lute", inst: "lute", oct: 2, vol: 0.9, pan: -0.2, seq: "lute_a lute_b lute_c lute_d lute_a lute_b lute_c lute_d" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.5, send: 0.25, layer: 1, seq: "bass_a bass_b bass_a bass_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 0.95, seq: "bass_a bass_b bass_a bass_b" },
      { id: "drip", inst: "drums", vol: 0.55, send: 0.35, seq: "drip*3 drip2 drip*3 drip2 drip*3 drip2 drip*3 drip2 drip*3 drip2 drip*3 drip2 drip*3 drip2 drip*3 drip2" }
    ]
  });

  // Northwich: salt-pan clank and a bass that subsides under you.
  S.define("town_northwich", {
    title: "Subsidence",
    bpm: 90, key: "g", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      lead_a: m("aeolian", "0:1 2:1 3:2 | 2:1 0:1 -2:2 | 3:1 4:1 5:1.5 4:0.5 | 2:4"),
      lead_b: m("aeolian", "4:2 3:1 2:1 | 0:2 -1:2 | 2:1 3:1 4:1 5:1 | 4:4"),
      lead_c: m("aeolian", COUNTY_A),
      lead_d: m("aeolian", COUNTY_B),
      bass_a: m("aeolian", "0:2 0>-1:2 | -2:2 -2>-3:2 | 3:2 3:2 | 4:2 4>3:2 | 0:2 0>-1:2 | -2:2 -2:2 | 4:2 4:2 | 0:4"),
      bass_b: m("aeolian", "5:2 5>4:2 | 3:2 3:2 | 4:2 4>3:2 | 0:4 | 5:2 5:2 | 1:2 1>0:2 | 4:2 4:2 | 0:4"),
      pad_a: ch("aeolian", [0, 5, 3, 4, 0, 5, 4, 0], "whole"),
      pad_b: ch("aeolian", [5, 3, 4, 0, 5, 1, 4, 0], "whole"),
      pan: "x...x.x.x...x...",
      pan2: "x...x.x.x..xx.x.",
      kit8: "k...s...k...s..."
    },
    tracks: [
      { id: "lead", inst: "pulse50", oct: 2, vol: 0.85, pan: -0.15, seq: "lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.9, send: 0.3, seq: "pad_a pad_b pad_a pad_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass_a bass_b bass_a bass_b" },
      { id: "pan", inst: "drums", vol: 0.75, seq: "pan*3 pan2 pan*3 pan2 pan*3 pan2 pan*3 pan2 pan*3 pan2 pan*3 pan2 pan*3 pan2 pan*3 pan2" },
      { id: "kit", inst: "drums", vol: 0.6, layer: 1, seq: "kit8*32" }
    ]
  });

  // Frodsham / Runcorn / Daresbury: estuary wind and turbine pulse.
  S.define("town_frodsham", {
    title: "Estuary Turbine",
    bpm: 82, key: "d", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      pad_a: ch("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      pad_b: ch("aeolian", [5, 5, 1, 1, 4, 4, 0, 0], "whole"),
      lead_a: m("aeolian", ".:1 0:1 2:2 | 3:2 2:2 | .:1 4:1 5:2 | 4:4"),
      lead_b: m("aeolian", "2:2 4:2 | 5:3 4:1 | 2:2 0:2 | -1:4"),
      lead_c: m("aeolian", COUNTY_A),
      turb: m("aeolian", "0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5 | -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5"),
      bass_a: bl("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "root"),
      bass_b: bl("aeolian", [5, 5, 1, 1, 4, 4, 0, 0], "root"),
      wind: "z...............",
      fog: m("aeolian", "0:4 | 0:4 | 0:4 | 0:4 | -2:4 | -2:4 | -2:4 | -2:4")
    },
    tracks: [
      { id: "pad", inst: "pad", oct: 0, vol: 1.0, send: 0.4, seq: "pad_a pad_b pad_a pad_b" },
      { id: "lead", inst: "flute", oct: 2, vol: 0.8, pan: -0.2, send: 0.3, seq: "lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b" },
      { id: "turbine", inst: "pulse12", oct: 0, vol: 0.4, pan: 0.3, seq: "turb turb turb turb turb turb turb turb" },
      { id: "bass", inst: "sub", oct: -1, vol: 1.0, seq: "bass_a bass_b bass_a bass_b" },
      { id: "wind", inst: "drums", vol: 0.5, seq: "wind*32" },
      { id: "fog", inst: "drone", oct: -1, vol: 0.9, send: 0.5, only: ["runcorn"], seq: "fog fog fog fog" }
    ]
  });

  // Warrington / Lymm: neon market beat, transporter-bridge creak.
  S.define("town_warrington", {
    title: "Neon Market",
    bpm: 128, key: "a", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("dorian", "0:0.5 3:0.5 4:1 3:0.5 0:0.5 -2:1 | 0:2 .:1 4:1 | 5:0.5 4:0.5 2:1 0:1 3:1 | 2:4"),
      lead_b: m("dorian", "4:1 4:0.5 5:0.5 6:1 4:1 | 7:2 6:2 | 5:1 4:1 2:1 0:1 | 0:4"),
      lead_c: m("dorian", COUNTY_A),
      lead_d: m("dorian", COUNTY_B),
      stab_a: ch("dorian", [0, 0, 5, 5, 3, 3, 4, 4], "off"),
      stab_b: ch("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "off"),
      bass_a: bl("dorian", [0, 0, 5, 5, 3, 3, 4, 4], "pump"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "pump"),
      kit: "k..hs.hhk.h.s.hh",
      kit2: "k..hs.hhk.h.ssss",
      creak: "x.............x.",
      shake: D_SHAKE
    },
    tracks: [
      { id: "lead", inst: "fm", oct: 2, vol: 0.95, pan: -0.1, params: { ratio: 3, index: 1.4 }, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "stab", inst: "pulse25", oct: 1, vol: 0.55, pan: 0.28, seq: "stab_a stab_a stab_b stab_a stab_b stab_a stab_b stab_a stab_b stab_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "shake", inst: "drums", vol: 0.4, layer: 1, seq: "shake*40" },
      { id: "creak", inst: "drums", vol: 0.45, seq: "creak*40" }
    ]
  });

  // Chester: Roman brass and cathedral organ. The county theme, Ionian,
  // in full dress — this is the tune the game has been hinting at.
  S.define("town_chester", {
    title: "Deva Victrix",
    bpm: 100, key: "c", beats: 4, bars: 40,
    loop: { from: 8, to: 40 },
    patterns: {
      fan: m("ionian", "0:1 4:1 7:2 | 6:1 4:1 2:2 | 0:1 4:1 7:1 9:1 | 7:4"),
      lead_a: m("ionian", COUNTY_A),
      lead_b: m("ionian", COUNTY_B),
      lead_c: m("ionian", "7:1 6:1 4:1.5 2:0.5 | 4:2 5:2 | 6:1 7:1 9:1.5 7:0.5 | 4:4"),
      org_a: ch("ionian", PROG_COUNTY, "whole"),
      org_b: ch("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "whole"),
      brass_a: ch("ionian", PROG_COUNTY, "stab"),
      brass_b: ch("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "stab"),
      bass_a: bl("ionian", PROG_COUNTY, "root5"),
      bass_b: bl("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "root5"),
      timp: "K...........K...",
      timp2: "K.......K..KK..K"
    },
    tracks: [
      { id: "brass", inst: "brass", oct: 2, vol: 1.0, pan: -0.12, seq: "fan fan lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b" },
      { id: "organ", inst: "organ", oct: 0, vol: 0.85, send: 0.35, seq: "org_a org_a org_b org_a org_b" },
      { id: "horns", inst: "brass", oct: 0, vol: 0.55, pan: 0.25, layer: 1, seq: "brass_a brass_a brass_b brass_a brass_b" },
      { id: "bass", inst: "tuba", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b" },
      { id: "timp", inst: "drums", vol: 0.8, seq: "timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2 timp*3 timp2" }
    ]
  });

  // Chester Zoo / Ellesmere Port / Parkgate: playful marimba.
  S.define("town_zoo", {
    title: "Feeding Time",
    bpm: 120, key: "f", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      mar_a: m("ionian", "0:0.5 2:0.5 4:0.5 2:0.5 0:1 4:1 | 5:0.5 4:0.5 2:1 0:2 | 2:0.5 4:0.5 5:0.5 4:0.5 2:1 0:1 | 4:4"),
      mar_b: m("ionian", "4:0.5 5:0.5 6:1 5:0.5 4:0.5 2:1 | 0:2 2:2 | 4:0.5 6:0.5 7:1 6:0.5 4:0.5 2:1 | 0:4"),
      mar_c: m("ionian", COUNTY_HEAD + " | 4:1 2:1 0:2 | 0:4"),
      bass_a: bl("ionian", [0, 3, 4, 0, 5, 3, 4, 0], "oct"),
      bass_b: bl("ionian", [3, 0, 5, 4, 3, 1, 4, 0], "oct"),
      pad_a: ch("ionian", [0, 3, 4, 0, 5, 3, 4, 0], "off"),
      pad_b: ch("ionian", [3, 0, 5, 4, 3, 1, 4, 0], "off"),
      kit: "k.whs.whk.whs.wh",
      kit2: "k.whs.whk.whssww",
      flare: m("ionian", "0:0.5 .:3.5 | .:4 | .:4 | .:4 | 4:0.5 .:3.5 | .:4 | .:4 | .:4")
    },
    tracks: [
      { id: "marimba", inst: "marimba", oct: 2, vol: 1.0, pan: -0.1, seq: "mar_a mar_b mar_c mar_a mar_b mar_c mar_a mar_b" },
      { id: "pad", inst: "pulse25", oct: 1, vol: 0.45, pan: 0.3, seq: "pad_a pad_b pad_a pad_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_b bass_a bass_b" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "flare", inst: "reed", oct: 1, vol: 0.6, only: ["port"], send: 0.4, seq: "flare flare flare flare" }
    ]
  });

  // Y Berllan: the orchard. Welsh harp, elm-press creak, sea haze.
  S.define("town_berllan", {
    title: "Y Berllan",
    bpm: 80, key: "g", beats: 4, bars: 40,
    loop: { from: 0, to: 40 },
    patterns: {
      harp_a: ap("mixolydian", [0, 4, 5, 3, 0, 4, 3, 0], [0, 2, 4, 7, 4, 2], 4, 0.5),
      harp_b: ap("mixolydian", [5, 3, 1, 4, 5, 3, 4, 0], [0, 4, 2, 7, 4, 2], 4, 0.5),
      tune_a: m("mixolydian", "0:2 2:1 4:1 | 5:2 4:2 | 2:1 4:1 5:1.5 4:0.5 | 2:4"),
      tune_b: m("mixolydian", "4:1 5:1 7:2 | 6:2 4:2 | 5:1 4:1 2:1 0:1 | 0:4"),
      tune_c: m("mixolydian", COUNTY_A),
      tune_d: m("mixolydian", COUNTY_B),
      tune_e: m("mixolydian", "7:2 6:2 | 4:2 5:2 | 4:1 2:1 0:2 | -3:4"),
      bass_a: bl("mixolydian", [0, 4, 5, 3, 0, 4, 3, 0], "root"),
      bass_b: bl("mixolydian", [5, 3, 1, 4, 5, 3, 4, 0], "root"),
      press: "x.......x.......",
      haze: "z......z...z...."
    },
    tracks: [
      { id: "harp", inst: "harp", oct: 1, vol: 1.0, pan: 0.15, send: 0.4, seq: "harp_a harp_b harp_a harp_b harp_a" },
      { id: "tune", inst: "flute", oct: 2, vol: 0.85, pan: -0.18, send: 0.3, seq: "tune_a tune_b tune_c tune_d tune_e tune_a tune_b tune_c tune_d tune_e" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.5, send: 0.3, layer: 1, seq: "bass_a bass_b bass_a bass_b bass_a" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.9, seq: "bass_a bass_b bass_a bass_b bass_a" },
      { id: "press", inst: "drums", vol: 0.4, send: 0.3, seq: "press*40" },
      { id: "haze", inst: "drums", vol: 0.35, seq: "haze*40" }
    ]
  });

  // ===============================================================
  // ROUTES — regional families
  // ===============================================================

  // east: the walking pulse and the flute. The template for the family.
  S.define("route_east", {
    title: "Boots on the Towpath",
    bpm: 134, key: "d", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("dorian", "0:0.5 0:0.5 2:1 4:1 2:0.5 0:0.5 | 4:1.5 2:0.5 0:1 -2:1 | 0:0.5 0:0.5 2:1 5:1 4:0.5 2:0.5 | 4:4"),
      lead_b: m("dorian", "4:1 5:1 7:1.5 5:0.5 | 4:1 2:1 4:2 | 5:0.5 4:0.5 2:1 0:1 -2:1 | 0:4"),
      lead_c: m("dorian", COUNTY_A),
      lead_d: m("dorian", COUNTY_B),
      lead_e: m("dorian", "7:0.5 6:0.5 5:1 4:1 2:1 | 4:2 5:2 | 4:0.5 2:0.5 0:1 -2:1 0:1 | 0:4"),
      bass_a: bl("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "drive"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "drive"),
      pad_a: ch("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "off"),
      pad_b: ch("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "off"),
      kit: "k..hs..hk.h.s..h",
      kit2: "k..hs..hk.h.s.ss",
      hats: D_HAT8
    },
    tracks: [
      { id: "lead", inst: "flute", oct: 2, vol: 0.95, pan: -0.12, seq: "_*4 lead_a lead_b lead_c lead_d lead_e lead_a lead_b lead_c lead_d" },
      { id: "chip", inst: "pulse25", oct: 2, vol: 0.5, pan: 0.2, layer: 1, seq: "_*4 lead_a lead_b lead_c lead_d lead_e lead_a lead_b lead_c lead_d" },
      { id: "pad", inst: "pulse12", oct: 1, vol: 0.4, pan: 0.3, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.05, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "hats", inst: "drums", vol: 0.35, layer: 1, seq: "hats*40" }
    ]
  });

  // bollin: the east motif with strings laid over the Carrs.
  S.define("route_bollin", {
    title: "Willows on the Bollin",
    bpm: 128, key: "d", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("dorian", "0:0.5 2:0.5 4:1 2:1 0:1 | 5:1.5 4:0.5 2:2 | 0:0.5 2:0.5 4:1 5:1 7:1 | 5:4"),
      lead_b: m("dorian", COUNTY_A),
      lead_c: m("dorian", COUNTY_B),
      lead_d: m("dorian", "4:2 2:1 4:1 | 5:2 7:2 | 6:1 5:1 4:1 2:1 | 0:4"),
      str_a: ch("dorian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      str_b: ch("dorian", [5, 3, 1, 4, 5, 3, 4, 0], "whole"),
      bass_a: bl("dorian", [0, 0, 5, 5, 3, 3, 4, 4], "drive"),
      bass_b: bl("dorian", [5, 3, 1, 4, 5, 3, 4, 0], "drive"),
      kit: "k..hs..hk.h.s..h",
      kit2: "k..hs..hk.hks.sh"
    },
    tracks: [
      { id: "lead", inst: "flute", oct: 2, vol: 0.9, pan: -0.12, send: 0.2, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.85, send: 0.3, seq: "str_a str_a str_b str_a str_b str_a str_b str_a str_b str_a" },
      { id: "harp", inst: "harp", oct: 1, vol: 0.5, pan: 0.3, layer: 1, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" }
    ]
  });

  // dane: viaduct arches, heath, the Cloud. Strings + rail snare.
  S.define("route_dane", {
    title: "Twenty-Three Arches",
    bpm: 140, key: "a", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("aeolian", "0:1 2:0.5 3:0.5 4:1 3:1 | 2:1.5 0:0.5 -2:2 | 0:1 3:0.5 4:0.5 5:1 4:1 | 2:4"),
      lead_b: m("aeolian", "4:1 5:1 7:1.5 5:0.5 | 4:2 2:2 | 3:1 4:1 5:1 4:1 | 2:4"),
      lead_c: m("aeolian", COUNTY_A),
      lead_d: m("aeolian", COUNTY_B),
      lead_e: m("aeolian", "7:1 5:1 4:2 | 5:1 4:1 2:2 | 3:0.5 2:0.5 0:1 -1:1 0:1 | 0:4"),
      str_a: ch("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      str_b: ch("aeolian", [5, 1, 4, 0, 5, 3, 4, 0], "whole"),
      bass_a: bl("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "drive"),
      bass_b: bl("aeolian", [5, 1, 4, 0, 5, 3, 4, 0], "drive"),
      snare: "k.x.s.x.k.x.s.x.",
      snare2: "k.x.s.x.k.xxs.sx"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 0.95, pan: -0.12, seq: "_*4 lead_a lead_b lead_c lead_d lead_e lead_a lead_b lead_c lead_d" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.9, send: 0.28, seq: "str_a str_a str_b str_a str_b str_a str_b str_a str_b str_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.05, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2 snare*3 snare2" }
    ]
  });

  // south: the dane motif with the rail snare pushed to the front.
  S.define("route_south", {
    title: "Down the Weaver Line",
    bpm: 146, key: "a", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("aeolian", "0:0.5 0:0.5 3:1 2:0.5 0:0.5 -2:1 | 0:2 4:2 | 3:0.5 2:0.5 0:1 3:1 4:1 | 2:4"),
      lead_b: m("aeolian", "5:1 4:1 2:1.5 0:0.5 | 3:2 4:2 | 5:1 7:1 5:1 4:1 | 2:4"),
      lead_c: m("aeolian", COUNTY_A),
      lead_d: m("aeolian", COUNTY_B),
      bass_a: bl("aeolian", [0, 0, 3, 3, 4, 4, 0, 0], "pump"),
      bass_b: bl("aeolian", [5, 5, 3, 3, 4, 1, 0, 0], "pump"),
      pad_a: ch("aeolian", [0, 0, 3, 3, 4, 4, 0, 0], "off"),
      pad_b: ch("aeolian", [5, 5, 3, 3, 4, 1, 0, 0], "off"),
      rail: "x.xxs.x.x.xxs.x.",
      rail2: "x.xxs.x.x.xxsxsx",
      kick: "k...k...k...k..k"
    },
    tracks: [
      { id: "lead", inst: "pulse12", oct: 2, vol: 0.95, pan: -0.1, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "pad", inst: "pulse25", oct: 1, vol: 0.45, pan: 0.28, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.55, layer: 1, send: 0.2, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.05, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "rail", inst: "drums", vol: 0.8, seq: "rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2 rail*3 rail2" },
      { id: "kick", inst: "drums", vol: 0.9, seq: "kick*40" }
    ]
  });

  // salt: marimba and water over the brine country.
  S.define("route_salt", {
    title: "Brine Country",
    bpm: 126, key: "f", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      mar_a: ap("lydian", [0, 0, 4, 4, 3, 3, 5, 5], [0, 2, 4, 6, 4, 2], 4, 0.5),
      mar_b: ap("lydian", [5, 3, 4, 0, 5, 1, 4, 0], [0, 4, 2, 6, 4, 2], 4, 0.5),
      lead_a: m("lydian", "0:1 2:1 4:1.5 2:0.5 | 5:2 4:2 | 2:1 4:1 6:1.5 4:0.5 | 2:4"),
      lead_b: m("lydian", COUNTY_A),
      lead_c: m("lydian", COUNTY_B),
      lead_d: m("lydian", "6:1 4:1 2:2 | 5:1 4:1 2:2 | 0:1 2:1 4:1 2:1 | 0:4"),
      bass_a: bl("lydian", [0, 0, 4, 4, 3, 3, 5, 5], "drive"),
      bass_b: bl("lydian", [5, 3, 4, 0, 5, 1, 4, 0], "drive"),
      kit: "k.dhs..dk.h.s.dh",
      kit2: "k.dhs..dk.hds.dd"
    },
    tracks: [
      { id: "lead", inst: "marimba", oct: 2, vol: 0.95, pan: -0.1, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "mar", inst: "marimba", oct: 1, vol: 0.6, pan: 0.25, seq: "mar_a mar_a mar_b mar_a mar_b mar_a mar_b mar_a mar_b mar_a" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.55, send: 0.3, layer: 1, seq: "mar_a mar_a mar_b mar_a mar_b mar_a mar_b mar_a mar_b mar_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" }
    ]
  });

  // mersey: wind pads and turbine pulse over the marsh.
  S.define("route_mersey", {
    title: "Fog on the Flats",
    bpm: 118, key: "c", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      pad_a: ch("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      pad_b: ch("aeolian", [5, 5, 1, 1, 4, 4, 0, 0], "whole"),
      lead_a: m("aeolian", "0:2 2:1 3:1 | 4:2 3:2 | 2:1 0:1 -2:2 | 0:4"),
      lead_b: m("aeolian", "4:1 3:1 2:2 | 5:2 4:2 | 3:1 2:1 0:1 -1:1 | 0:4"),
      lead_c: m("aeolian", COUNTY_A),
      lead_d: m("aeolian", COUNTY_B),
      turb: m("aeolian", "0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | 4:0.5 .:0.5 4:0.5 .:0.5 4:0.5 .:0.5 4:0.5 .:0.5 | 4:0.5 .:0.5 4:0.5 .:0.5 4:0.5 .:0.5 4:0.5 .:0.5"),
      bass_a: bl("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "tick"),
      bass_b: bl("aeolian", [5, 5, 1, 1, 4, 4, 0, 0], "tick"),
      kit: "k...s...k...s.h.",
      kit2: "k...s...k..ks.hh"
    },
    tracks: [
      { id: "pad", inst: "pad", oct: 0, vol: 1.0, send: 0.4, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "lead", inst: "flute", oct: 2, vol: 0.85, pan: -0.15, send: 0.3, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "turbine", inst: "pulse12", oct: 1, vol: 0.35, pan: 0.32, seq: "turb turb turb turb turb turb turb turb turb turb" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.75, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" }
    ]
  });

  // west: forest, sandstone, the Wirral. Wind pads and low brass.
  S.define("route_west", {
    title: "Sandstone Trail",
    bpm: 128, key: "g", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      lead_a: m("dorian", "0:1 2:1 3:1.5 2:0.5 | 4:2 2:2 | 5:1 4:1 2:1.5 0:0.5 | -2:4"),
      lead_b: m("dorian", "4:1 5:1 6:2 | 5:1 4:1 2:2 | 0:1 2:1 4:1 5:1 | 4:4"),
      lead_c: m("dorian", COUNTY_A),
      lead_d: m("dorian", COUNTY_B),
      brass_a: ch("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "half"),
      brass_b: ch("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "half"),
      pad_a: ch("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "whole"),
      pad_b: ch("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "whole"),
      bass_a: bl("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "drive"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "drive"),
      kit: "k..hs..hk..hs..h",
      kit2: "k..hs..hk.khs.sh"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 0.9, pan: -0.12, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "brass", inst: "brass", oct: 0, vol: 0.7, seq: "brass_a brass_a brass_b brass_a brass_b brass_a brass_b brass_a brass_b brass_a" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.6, send: 0.35, seq: "pad_a pad_a pad_b pad_a pad_b pad_a pad_b pad_a pad_b pad_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.05, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" }
    ]
  });

  // wales: the lane to Aberaeron. Harp and sea haze, no drums at all.
  S.define("route_wales", {
    title: "The Lane to Aberaeron",
    bpm: 110, key: "d", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      harp_a: ap("mixolydian", [0, 4, 5, 3, 0, 4, 3, 0], [0, 2, 4, 7, 9, 7, 4, 2], 4, 0.5),
      harp_b: ap("mixolydian", [5, 3, 1, 4, 5, 3, 4, 0], [0, 2, 4, 7, 4, 2], 4, 0.5),
      tune_a: m("mixolydian", "0:1.5 2:0.5 4:2 | 5:1.5 4:0.5 2:2 | 4:1 5:1 7:1.5 5:0.5 | 4:4"),
      tune_b: m("mixolydian", COUNTY_A),
      tune_c: m("mixolydian", COUNTY_B),
      tune_d: m("mixolydian", "7:1.5 6:0.5 5:2 | 4:1.5 2:0.5 0:2 | -3:1 0:1 2:2 | 0:4"),
      bass_a: bl("mixolydian", [0, 4, 5, 3, 0, 4, 3, 0], "root"),
      bass_b: bl("mixolydian", [5, 3, 1, 4, 5, 3, 4, 0], "root"),
      sea: "z......z....z..."
    },
    tracks: [
      { id: "harp", inst: "harp", oct: 1, vol: 1.0, pan: 0.2, send: 0.4, seq: "harp_a harp_b harp_a harp_b" },
      { id: "tune", inst: "flute", oct: 2, vol: 0.9, pan: -0.18, send: 0.3, seq: "tune_a tune_b tune_c tune_d tune_a tune_b tune_c tune_d" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.6, send: 0.3, layer: 1, seq: "bass_a bass_b bass_a bass_b" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.85, seq: "bass_a bass_b bass_a bass_b" },
      { id: "sea", inst: "drums", vol: 0.35, seq: "sea*32" }
    ]
  });

  // ===============================================================
  // DUNGEONS
  // ===============================================================

  S.define("dungeon_cave", {
    title: "Beneath the Edge",
    bpm: 70, key: "b", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      drone: m("aeolian", "0:4 | 0:4 | 0:4 | 0:4 | -2:4 | -2:4 | -4:4 | -4:4"),
      knight: m("aeolian", ".:4 | .:2 0:1 2:1 | 3:2 2:2 | .:4 | .:4 | .:2 4:1 3:1 | 2:2 0:2 | .:4"),
      knight2: m("aeolian", ".:4 | 4:2 3:2 | 2:1 0:1 -2:2 | .:4 | .:4 | 0:2 -1:2 | 0:4 | .:4"),
      glass_a: m("aeolian", "7:2 .:2 | .:4 | 4:2 .:2 | .:4 | 5:2 .:2 | .:4 | 2:3 .:1 | .:4"),
      bass: bl("aeolian", [0, 0, 0, 0, 5, 5, 3, 3], "root"),
      bass2: bl("aeolian", [5, 5, 3, 3, 4, 4, 0, 0], "root"),
      drip: "d.......d...d...",
      drip2: "d......d........",
      rumble: "..............g."
    },
    tracks: [
      { id: "drone", inst: "drone", oct: -1, vol: 1.2, send: 0.45, seq: "drone drone drone drone" },
      { id: "choir", inst: "choir", oct: 0, vol: 0.7, send: 0.55, seq: "knight knight2 knight knight2" },
      { id: "glass", inst: "glass", oct: 2, vol: 0.6, pan: 0.3, send: 0.6, layer: 1, seq: "glass_a glass_a glass_a glass_a" },
      { id: "bass", inst: "sub", oct: -2, vol: 1.0, seq: "bass bass2 bass bass2" },
      { id: "drip", inst: "drums", vol: 0.6, send: 0.5, seq: "drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2 drip drip2" },
      { id: "rumble", inst: "drums", vol: 0.5, layer: 1, seq: "rumble*32" }
    ]
  });

  S.define("dungeon_bog", {
    title: "What the Peat Keeps",
    bpm: 66, key: "e", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      pad_a: ch("phrygian", [0, 0, 1, 1, 0, 0, 6, 6], "whole"),
      pad_b: ch("phrygian", [1, 1, 4, 4, 0, 0, 0, 0], "whole"),
      wisp_a: m("phrygian", ".:2 7:1 6:1 | .:4 | 4:1 3:1 .:2 | .:4 | .:2 8:1 7:1 | .:4 | 5:2 4:2 | .:4"),
      wisp_b: m("phrygian", "6:1 5:1 4:2 | .:4 | 3:1 1:1 0:2 | .:4 | .:4 | 4:2 3:2 | 1:2 0:2 | .:4"),
      moan: m("phrygian", "0:8 | -2:8 | 1:8 | 0:8"),
      bass_a: bl("phrygian", [0, 0, 1, 1, 0, 0, 6, 6], "root"),
      bass_b: bl("phrygian", [1, 1, 4, 4, 0, 0, 0, 0], "root"),
      wet: "d..z....d.....d.",
      wet2: "d.....z.....d..."
    },
    tracks: [
      { id: "pad", inst: "pad", oct: 0, vol: 1.0, send: 0.5, seq: "pad_a pad_b pad_a pad_b" },
      { id: "wisp", inst: "bell", oct: 2, vol: 0.7, pan: 0.25, send: 0.6, seq: "wisp_a wisp_b wisp_a wisp_b" },
      { id: "moan", inst: "choir", oct: 0, vol: 0.6, send: 0.5, layer: 1, seq: "moan moan moan moan moan moan moan moan" },
      { id: "bass", inst: "sub", oct: -2, vol: 1.0, seq: "bass_a bass_b bass_a bass_b" },
      { id: "wet", inst: "drums", vol: 0.55, send: 0.4, seq: "wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2 wet wet2" }
    ]
  });

  // THE STACK / Jodrell interior. Server hum, fans, ORACLE's tag.
  S.define("dungeon_stack", {
    title: "Cooling Fans",
    bpm: 96, key: "c", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      hum: m("phrygian", "0:8 | 0:8 | 1:8 | 0:8"),
      fans: "hhhhhhhhhhhhhhhh",
      fans2: "hhhhhhhhhhhhhhhz",
      tag: ORACLE_TAG_SLOW + " | .:4 | .:4 | .:4 | .:4",
      tag2: ".:4 | .:4 | .:4 | .:4 | " + ORACLE_TAG_SLOW,
      pulse_a: m("phrygian", "0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | 0:0.5 .:0.5 0:0.5 .:0.5 1:0.5 .:0.5 1:0.5 .:0.5 | 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 0:0.5 .:0.5 | -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5 -2:0.5 .:0.5"),
      lead_a: m("phrygian", ".:4 | 4:1 3:1 1:2 | 0:2 -2:2 | .:4"),
      lead_b: m("phrygian", ".:4 | 7:1 6:1 4:2 | 3:2 1:2 | 0:4"),
      bass_a: bl("phrygian", [0, 0, 0, 0, 1, 1, 0, 0], "tick"),
      bass_b: bl("phrygian", [6, 6, 1, 1, 0, 0, 0, 0], "tick")
    },
    tracks: [
      { id: "hum", inst: "drone", oct: -1, vol: 1.1, send: 0.3, seq: "hum hum hum hum hum hum hum hum" },
      { id: "pulse", inst: "pulse12", oct: 1, vol: 0.35, pan: 0.3, seq: "pulse_a pulse_a pulse_a pulse_a pulse_a pulse_a pulse_a pulse_a" },
      { id: "oracle", inst: "fm", oct: 1, vol: 0.85, pan: -0.2, send: 0.55, params: { ratio: 1.41, index: 3 }, seq: "tag tag2 tag tag2 tag tag2 tag tag2" },
      { id: "lead", inst: "glass", oct: 2, vol: 0.6, send: 0.5, layer: 1, seq: "lead_a lead_b lead_a lead_b lead_a lead_b lead_a lead_b" },
      { id: "bass", inst: "sub", oct: -2, vol: 1.0, seq: "bass_a bass_b bass_a bass_b" },
      { id: "fans", inst: "drums", vol: 0.3, seq: "fans*3 fans2 fans*3 fans2 fans*3 fans2 fans*3 fans2 fans*3 fans2 fans*3 fans2 fans*3 fans2 fans*3 fans2" }
    ]
  });

  // NEW ID: mill interiors (Quarry Bank, Clarence, Havannah).
  S.define("dungeon_mill", {
    title: "The Wheel and the Water",
    bpm: 88, key: "a", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      wheel: "x...x...x...x...",
      wheel2: "x...x...x..xx...",
      water: "d.z.d.z.d.z.d.z.",
      lead_a: m("dorian", "0:2 3:1 2:1 | 4:2 3:2 | 2:1 0:1 -2:2 | 0:4"),
      lead_b: m("dorian", "5:1 4:1 3:2 | 2:2 0:2 | 3:1 4:1 5:1 4:1 | 2:4"),
      lead_c: m("dorian", COUNTY_A),
      pad_a: ch("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "whole"),
      pad_b: ch("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "whole"),
      bass_a: bl("dorian", [0, 0, 3, 3, 5, 5, 4, 4], "half"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "half")
    },
    tracks: [
      { id: "lead", inst: "pluck", oct: 2, vol: 0.85, pan: -0.15, send: 0.3, seq: "lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.8, send: 0.35, seq: "pad_a pad_b pad_a pad_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 0.95, seq: "bass_a bass_b bass_a bass_b" },
      { id: "wheel", inst: "drums", vol: 0.8, seq: "wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2 wheel*3 wheel2" },
      { id: "water", inst: "drums", vol: 0.4, send: 0.3, layer: 1, seq: "water*32" }
    ]
  });

  // NEW ID: railway stations and platforms.
  S.define("place_station", {
    title: "Platform Four",
    bpm: 104, key: "e", beats: 4, bars: 24,
    loop: { from: 0, to: 24 },
    patterns: {
      lead_a: m("mixolydian", ".:1 0:1 2:2 | 4:2 2:2 | .:1 4:1 5:2 | 4:4"),
      lead_b: m("mixolydian", "6:1 5:1 4:2 | 2:2 0:2 | -3:1 0:1 2:2 | 0:4"),
      lead_c: m("mixolydian", COUNTY_HEAD + " | 2:2 0:2 | 0:4"),
      pad_a: ch("mixolydian", [0, 0, 3, 3, 4, 4, 0, 0], "whole"),
      bass_a: bl("mixolydian", [0, 0, 3, 3, 4, 4, 0, 0], "root"),
      tannoy: "x.......x.......",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "marimba", oct: 2, vol: 0.8, pan: -0.1, send: 0.25, seq: "lead_a lead_b lead_c lead_a lead_b lead_c" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.7, send: 0.3, seq: "pad_a pad_a pad_a" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.85, seq: "bass_a bass_a bass_a" },
      { id: "tannoy", inst: "drums", vol: 0.35, seq: "tannoy rest*7 tannoy rest*7 tannoy rest*7" }
    ]
  });

  // ===============================================================
  // BATTLES
  // ===============================================================

  // Wild: the county theme, brisk, drums forward.
  S.define("battle_wild", {
    title: "Something in the Grass",
    bpm: 156, key: "d", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      intro: m("dorian", "0:0.5 0:0.5 0:0.5 .:0.5 0:0.5 .:0.5 -2:1 | 0:0.5 0:0.5 0:0.5 .:0.5 4:0.5 .:0.5 3:1 | 2:0.5 3:0.5 4:0.5 5:0.5 4:0.5 3:0.5 2:0.5 0:0.5 | -2:2 !0:2"),
      lead_a: m("dorian", COUNTY_A),
      lead_b: m("dorian", COUNTY_B),
      lead_c: m("dorian", "!7:0.5 6:0.5 5:0.5 4:0.5 3:0.5 2:0.5 0:1 | 2:1 4:1 5:2 | 7:0.5 5:0.5 4:0.5 2:0.5 4:1 2:1 | 0:4"),
      lead_d: m("dorian", "0:0.5 2:0.5 3:0.5 4:0.5 5:1 4:1 | 2:0.5 4:0.5 5:0.5 7:0.5 6:1 5:1 | 4:0.5 5:0.5 4:0.5 2:0.5 0:1 -2:1 | 0:4"),
      arp_a: ap("dorian", PROG_COUNTY, [0, 2, 4, 7], 4, 0.25),
      arp_b: ap("dorian", [5, 3, 4, 0, 5, 1, 4, 0], [0, 2, 4, 7], 4, 0.25),
      bass_a: bl("dorian", PROG_COUNTY, "drive"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "drive"),
      kit: "k.khs.khk.khs.kh",
      kit2: "k.khs.khk.khsksk",
      fill: "k.khs.khkkssttTT",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.0, pan: -0.12, seq: "intro lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "arp", inst: "pulse12", oct: 1, vol: 0.45, pan: 0.3, layer: 1, seq: "arp_a arp_a arp_b arp_a arp_b arp_a arp_b arp_a arp_b arp_a" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill" },
      { id: "cym", inst: "drums", vol: 0.55, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // Trainer: the same bones, faster, with a counter-riff.
  S.define("battle_trainer", {
    title: "Eyes Met Across the Route",
    bpm: 166, key: "d", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      intro: m("dorian", "!0:0.5 !0:0.5 !0:1 !3:0.5 !3:0.5 !3:1 | !4:0.5 !4:0.5 !4:1 !5:2 | 7:0.5 6:0.5 5:0.5 4:0.5 3:0.5 2:0.5 0:0.5 -2:0.5 | 0:2 .:2"),
      lead_a: m("dorian", "0:0.5 2:0.5 4:1 2:0.5 0:0.5 4:1 | 5:0.5 4:0.5 2:1 0:2 | 3:0.5 5:0.5 7:1 5:0.5 3:0.5 2:1 | 0:4"),
      lead_b: m("dorian", COUNTY_A),
      lead_c: m("dorian", COUNTY_B),
      lead_d: m("dorian", "7:1 9:1 7:0.5 6:0.5 5:1 | 4:1 5:1 4:0.5 2:0.5 0:1 | 2:0.5 4:0.5 5:0.5 7:0.5 9:1 7:1 | 5:4"),
      cnt_a: m("dorian", "0:0.5 .:0.5 0:0.5 .:0.5 3:0.5 .:0.5 3:0.5 .:0.5 | 4:0.5 .:0.5 4:0.5 .:0.5 2:0.5 .:0.5 2:0.5 .:0.5 | 0:0.5 .:0.5 0:0.5 .:0.5 5:0.5 .:0.5 5:0.5 .:0.5 | 4:0.5 .:0.5 4:0.5 .:0.5 4:1 .:1"),
      bass_a: bl("dorian", [0, 0, 3, 3, 4, 4, 0, 0], "pump"),
      bass_b: bl("dorian", [5, 5, 3, 3, 4, 1, 4, 0], "pump"),
      kit: "k.khs.khk.khs.kh",
      kit2: "kkkhs.khk.khskkh",
      fill: "k.khs.khkkssTTTT",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.0, pan: -0.12, seq: "intro lead_a lead_b lead_c lead_d lead_a lead_b lead_c lead_d lead_a" },
      { id: "counter", inst: "pulse12", oct: 1, vol: 0.5, pan: 0.3, seq: "cnt_a cnt_a cnt_a cnt_a cnt_a cnt_a cnt_a cnt_a cnt_a cnt_a" },
      { id: "brass", inst: "brass", oct: 0, vol: 0.5, layer: 1, seq: "_*4 lead_b lead_c _*4 lead_b lead_c _*4 lead_b lead_c _*4" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.15, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill" },
      { id: "cym", inst: "drums", vol: 0.55, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // Gym leader: a four-bar leader tag, then harmonic-minor menace.
  S.define("battle_gym", {
    title: "Badge on the Table",
    bpm: 160, key: "e", beats: 4, bars: 44,
    loop: { from: 4, to: 44 },
    patterns: {
      tag: m("harmonic", "!0:1 !4:1 !7:2 | !6:1 !4:1 !2:2 | !0:0.5 !2:0.5 !4:0.5 !6:0.5 !7:1 !6:1 | !4:2 .:2"),
      lead_a: m("harmonic", "0:0.5 2:0.5 4:1 2:0.5 0:0.5 6:1 | 7:1.5 6:0.5 4:2 | 2:0.5 4:0.5 6:1 4:0.5 2:0.5 0:1 | -1:2 0:2"),
      lead_b: m("harmonic", "4:1 6:1 7:1.5 6:0.5 | 9:2 7:2 | 6:0.5 7:0.5 6:0.5 4:0.5 2:1 4:1 | 0:4"),
      lead_c: m("harmonic", COUNTY_A),
      lead_d: m("harmonic", COUNTY_B),
      lead_e: m("harmonic", "!11:1 !9:1 !7:2 | !6:1 !4:1 !2:2 | 0:0.5 2:0.5 4:0.5 6:0.5 7:0.5 9:0.5 11:1 | 7:4"),
      stab_a: ch("harmonic", [0, 0, 3, 3, 4, 4, 0, 0], "push"),
      stab_b: ch("harmonic", [5, 5, 3, 3, 6, 6, 4, 4], "push"),
      bass_a: bl("harmonic", [0, 0, 3, 3, 4, 4, 0, 0], "pump"),
      bass_b: bl("harmonic", [5, 5, 3, 3, 6, 6, 4, 4], "pump"),
      kit: "k.khs.khk.khs.kh",
      kit2: "kkkhs.khkkkhskkh",
      fill: "kkkhs.khkkssTTTT",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.05, pan: -0.1, seq: "tag lead_a lead_b lead_c lead_d lead_e lead_a lead_b lead_c lead_d lead_e" },
      { id: "organ", inst: "organ", oct: 0, vol: 0.55, layer: 1, seq: "stab_a stab_a stab_b stab_a stab_b stab_a stab_b stab_a stab_b stab_a stab_b" },
      { id: "brass", inst: "brass", oct: 1, vol: 0.6, pan: 0.25, seq: "_ tag _*7 tag _*7 tag _*7 tag _*6" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.15, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill" },
      { id: "cym", inst: "drums", vol: 0.55, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // Boss: phased. MQ.Audio.setLayer(0..3) adds a track per phase.
  S.define("battle_boss", {
    title: "The Preserved One",
    bpm: 152, key: "g", beats: 4, bars: 48,
    loop: { from: 0, to: 48 },
    patterns: {
      riff_a: m("harmonic", "!0:0.5 0:0.5 !1:0.5 0:0.5 !0:0.5 -1:0.5 !0:1 | !0:0.5 0:0.5 !3:0.5 0:0.5 !2:0.5 0:0.5 !0:1 | !4:0.5 4:0.5 !5:0.5 4:0.5 !4:0.5 2:0.5 !0:1 | !-1:2 !0:2"),
      riff_b: m("harmonic", "!4:0.5 4:0.5 !5:0.5 4:0.5 !6:0.5 4:0.5 !7:1 | !6:0.5 6:0.5 !7:0.5 6:0.5 !5:0.5 4:0.5 !2:1 | !0:0.5 2:0.5 !4:0.5 6:0.5 !7:1 !6:1 | !4:2 !2:2"),
      lead_a: m("harmonic", "7:1 6:1 4:2 | 6:1 7:1 9:2 | 11:1 9:1 7:1.5 6:0.5 | 4:4"),
      lead_b: m("harmonic", COUNTY_A),
      lead_c: m("harmonic", COUNTY_B),
      choir_a: ch("harmonic", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      choir_b: ch("harmonic", [5, 5, 3, 3, 6, 6, 4, 0], "whole"),
      bass_a: bl("harmonic", [0, 0, 5, 5, 3, 3, 4, 4], "pump"),
      bass_b: bl("harmonic", [5, 5, 3, 3, 6, 6, 4, 0], "pump"),
      kit: "k.khs.khk.khs.kh",
      kit2: "kkkhs.khkkkhskkh",
      fill: "kkkhskkhkkssTTTT",
      dbl: "kkkkkkkkkkkkkkkk",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "riff", inst: "pulse50", oct: 1, vol: 0.95, pan: -0.15, layer: 0, seq: "riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.15, layer: 0, seq: "bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b" },
      { id: "kit", inst: "drums", vol: 0.95, layer: 0, seq: "kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill" },
      { id: "lead", inst: "pulse25", oct: 2, vol: 0.95, pan: 0.15, layer: 1, seq: "lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b lead_c lead_a lead_b lead_c" },
      { id: "choir", inst: "choir", oct: 0, vol: 0.8, send: 0.3, layer: 2, seq: "choir_a choir_b choir_a choir_b choir_a choir_b choir_a choir_b choir_a choir_b choir_a choir_b" },
      { id: "brass", inst: "brass", oct: 1, vol: 0.7, layer: 3, seq: "riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b riff_a riff_b" },
      { id: "dbl", inst: "drums", vol: 0.5, layer: 3, seq: "dbl*48" },
      { id: "cym", inst: "drums", vol: 0.55, layer: 1, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // Legendary: half-time, huge, choir. MERLYNX and its kin.
  S.define("battle_legendary", {
    title: "Older Than the County",
    bpm: 88, key: "c", beats: 4, bars: 40,
    loop: { from: 0, to: 40 },
    patterns: {
      choir_a: ch("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "whole"),
      choir_b: ch("aeolian", [5, 5, 1, 1, 6, 6, 4, 0], "whole"),
      horn_a: m("aeolian", "!0:2 !2:2 | !3:3 !2:1 | !4:2 !3:2 | !2:4 | !0:2 !-2:2 | !-1:3 !0:1 | !4:2 !3:2 | !0:4"),
      lead_a: m("aeolian", ".:2 4:1 5:1 | 7:2 5:2 | 4:1 3:1 2:2 | 0:4 | .:2 7:1 6:1 | 5:3 4:1 | 3:2 2:2 | 0:4"),
      lead_b: m("aeolian", COUNTY_A + " | " + COUNTY_B),
      bass_a: bl("aeolian", [0, 0, 5, 5, 3, 3, 4, 4], "half"),
      bass_b: bl("aeolian", [5, 5, 1, 1, 6, 6, 4, 0], "half"),
      kit: "K...S...K...S...",
      kit2: "K...S...K.KKS..S",
      timp: "K..K....K..K....",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "choir", inst: "choir", oct: 0, vol: 1.1, send: 0.45, seq: "choir_a choir_b choir_a choir_b choir_a" },
      { id: "horn", inst: "brass", oct: 1, vol: 0.9, pan: -0.15, seq: "horn_a horn_a horn_a horn_a horn_a" },
      { id: "lead", inst: "glass", oct: 2, vol: 0.75, pan: 0.25, send: 0.5, layer: 1, seq: "lead_a lead_b lead_a lead_b lead_a" },
      { id: "bass", inst: "sub", oct: -2, vol: 1.15, seq: "bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "timp", inst: "drums", vol: 0.6, layer: 1, seq: "timp*40" },
      { id: "cym", inst: "drums", vol: 0.5, seq: "cym rest*7 cym rest*7 cym rest*7 cym rest*7 cym rest*7" }
    ]
  });

  // VEX: swagger. Variant 'cracked' (Ch.8) drops it into the minor and
  // lets the counter-line go slightly wrong.
  S.define("battle_vex", {
    title: "Vex Swagger",
    bpm: 168, key: "a", beats: 4, bars: 40,
    loop: { from: 4, to: 40 },
    patterns: {
      hook: m("dorian", "!0:0.5 .:0.5 !0:0.5 !3:0.5 !2:1 !0:1 | !0:0.5 .:0.5 !0:0.5 !5:0.5 !4:1 !2:1 | !3:0.5 !4:0.5 !5:0.5 !7:0.5 !5:1 !4:1 | !2:2 .:2"),
      lead_a: m("dorian", "7:0.5 5:0.5 4:1 2:0.5 4:0.5 5:1 | 4:1.5 2:0.5 0:2 | 5:0.5 7:0.5 9:1 7:0.5 5:0.5 4:1 | 2:4"),
      lead_b: m("dorian", COUNTY_A),
      lead_c: m("dorian", COUNTY_B),
      lead_d: m("dorian", "9:0.5 7:0.5 5:0.5 4:0.5 2:1 0:1 | 4:0.5 5:0.5 7:1 5:2 | 2:0.5 4:0.5 5:0.5 4:0.5 2:1 0:1 | -2:2 0:2"),
      crack: m("aeolian", "0:0.5 .:0.5 0b:0.5 3:0.5 2:1 0:1 | 0:0.5 .:0.5 0:0.5 5b:0.5 4:1 2:1 | 3:0.5 4b:0.5 5:0.5 7:0.5 5:1 4b:1 | 2:2 .:2"),
      bass_a: bl("dorian", [0, 0, 5, 5, 3, 3, 4, 4], "pump"),
      bass_b: bl("dorian", [5, 3, 4, 0, 5, 1, 4, 0], "pump"),
      kit: "k.khs.khk.khskkh",
      kit2: "kkkhs.khk.khsksk",
      fill: "k.khskkhkkssTTTT",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "hook", inst: "pulse25", oct: 2, vol: 1.05, pan: -0.12, seq: "hook lead_a lead_b lead_c lead_d hook lead_a lead_b lead_c lead_d" },
      { id: "counter", inst: "pulse12", oct: 1, vol: 0.5, pan: 0.3, not: ["cracked"], seq: "hook hook hook hook hook hook hook hook hook hook" },
      { id: "cracked", inst: "pulse12", oct: 1, vol: 0.5, pan: 0.3, only: ["cracked"], seq: "crack crack crack crack crack crack crack crack crack crack" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.15, seq: "bass_a bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill" },
      { id: "cym", inst: "drums", vol: 0.55, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // Champion: the county theme in full dress, both cats' motifs woven in.
  S.define("battle_champion", {
    title: "The Amphitheatre",
    bpm: 162, key: "d", beats: 4, bars: 48,
    loop: { from: 8, to: 48 },
    patterns: {
      fan: m("ionian", "!0:1 !4:1 !7:2 | !9:1 !7:1 !4:2 | !0:0.5 !2:0.5 !4:0.5 !5:0.5 !7:1 !9:1 | !11:2 .:2"),
      fan2: m("ionian", "!7:1 !9:1 !11:2 | !9:1 !7:1 !4:2 | !2:0.5 !4:0.5 !5:0.5 !7:0.5 !9:1 !7:1 | !4:2 .:2"),
      lead_a: m("ionian", COUNTY_A),
      lead_b: m("ionian", COUNTY_B),
      lead_c: m("ionian", "7:0.5 6:0.5 4:1 2:0.5 4:0.5 6:1 | 7:1.5 9:0.5 7:2 | 6:0.5 4:0.5 2:1 4:1 6:1 | 4:4"),
      cats: m("ionian", MEADOW + " " + MEADOW + " | " + BIGBOY + " | " + MEADOW + " 9:2 | " + BIGBOY),
      org_a: ch("ionian", PROG_COUNTY, "push"),
      org_b: ch("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "push"),
      bass_a: bl("ionian", PROG_COUNTY, "pump"),
      bass_b: bl("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "pump"),
      kit: "k.khs.khk.khs.kh",
      kit2: "kkkhs.khkkkhskkh",
      fill: "kkkhskkhkkssTTTT",
      cym: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "brass", inst: "brass", oct: 2, vol: 1.05, pan: -0.1, seq: "fan fan2 lead_a lead_b lead_c fan2 lead_a lead_b lead_c fan fan2 lead_a" },
      { id: "lead", inst: "pulse25", oct: 2, vol: 0.7, pan: 0.2, layer: 1, seq: "_*4 lead_a lead_b lead_c _*4 lead_a lead_b lead_c _*4 lead_a lead_b lead_c" },
      { id: "cats", inst: "bell", oct: 2, vol: 0.55, pan: 0.35, send: 0.35, layer: 1, seq: "_*4 cats _*4 cats _*4 cats _*4 cats _*4 cats _*4 cats" },
      { id: "organ", inst: "organ", oct: 0, vol: 0.55, seq: "org_a org_b org_a org_b org_a org_b org_a org_b org_a org_b org_a org_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.15, seq: "bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b bass_a bass_b" },
      { id: "kit", inst: "drums", vol: 0.95, seq: "kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill kit*3 fill kit2*3 fill" },
      { id: "cym", inst: "drums", vol: 0.55, seq: "cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3 cym rest*3" }
    ]
  });

  // ===============================================================
  // CUTSCENES, CREDITS, STINGERS
  // ===============================================================

  // The signal moments: White Nancy, Rostherne, the boat lift, the dish.
  // Nearly silence, and then ORACLE says its four notes.
  S.define("cutscene_signal", {
    title: "It Knows You Are Listening",
    bpm: 60, key: "c", beats: 4, bars: 16,
    loop: { from: 0, to: 16 },
    patterns: {
      hush: m("phrygian", "0:16 | 0:16 | -2:16 | 0:16"),
      tag: ORACLE_TAG_SLOW + " .:48",
      spark: m("phrygian", ".:8 | 7:1 .:3 | .:4 | .:4 | .:2 6:1 .:1 | .:4 | .:4 | .:4"),
      quiet: "z..............."
    },
    tracks: [
      { id: "hush", inst: "drone", oct: -1, vol: 0.8, send: 0.5, seq: "hush hush hush hush" },
      { id: "tag", inst: "fm", oct: 1, vol: 0.9, send: 0.6, params: { ratio: 1.41, index: 3.5 }, seq: "tag*4" },
      { id: "spark", inst: "glass", oct: 2, vol: 0.5, pan: 0.3, send: 0.7, seq: "spark*2" },
      { id: "heart", inst: "drums", vol: 0.14, seq: "quiet*16" }
    ]
  });

  // Y Berllan evening, the vet's story, the Elm Press ending.
  S.define("cutscene_orchard", {
    title: "Under the Elm Press",
    bpm: 72, key: "g", beats: 4, bars: 32,
    loop: { from: 0, to: 32 },
    patterns: {
      harp_a: ap("ionian", [0, 4, 5, 3, 0, 5, 4, 0], [0, 2, 4, 7, 4, 2], 4, 0.5),
      harp_b: ap("ionian", [3, 5, 1, 4, 3, 5, 4, 0], [0, 4, 2, 7, 4, 2], 4, 0.5),
      tune_a: m("ionian", "0:2 2:2 | 4:3 2:1 | 5:2 4:2 | 2:4"),
      tune_b: m("ionian", "4:2 5:2 | 7:3 5:1 | 4:2 2:2 | 0:4"),
      tune_c: m("ionian", COUNTY_A),
      tune_d: m("ionian", COUNTY_B),
      purr: m("ionian", "0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 | 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 0:0.5 | -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 | -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5 -2:0.5"),
      bass_a: bl("ionian", [0, 4, 5, 3, 0, 5, 4, 0], "root"),
      bass_b: bl("ionian", [3, 5, 1, 4, 3, 5, 4, 0], "root"),
      creak: "x.......x......."
    },
    tracks: [
      { id: "harp", inst: "harp", oct: 1, vol: 1.05, pan: 0.15, send: 0.4, seq: "harp_a harp_b harp_a harp_b" },
      { id: "tune", inst: "flute", oct: 2, vol: 0.85, pan: -0.18, send: 0.3, seq: "tune_a tune_b tune_c tune_d tune_a tune_b tune_c tune_d" },
      { id: "purr", inst: "sub", oct: -2, vol: 0.5, seq: "purr purr purr purr purr purr purr purr" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.55, send: 0.3, layer: 1, seq: "bass_a bass_b bass_a bass_b" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.85, seq: "bass_a bass_b bass_a bass_b" },
      { id: "creak", inst: "drums", vol: 0.35, send: 0.3, seq: "creak*32" }
    ]
  });

  // Credits. Variants per ending flag: 'orchard' (Elm Press), 'stack'
  // (you left it running), 'quiet' (nobody ever knew).
  S.define("credits", {
    title: "Cheshire, Afterwards",
    bpm: 96, key: "d", beats: 4, bars: 64,
    loop: { from: 0, to: 64 },
    patterns: {
      intro: ch("ionian", [0, 0, 4, 4, 5, 5, 3, 3], "whole"),
      lead_a: m("ionian", COUNTY_A),
      lead_b: m("ionian", COUNTY_B),
      lead_c: m("ionian", "7:2 6:2 | 4:1 5:1 6:2 | 7:1 9:1 7:1.5 6:0.5 | 4:4"),
      lead_d: m("ionian", "2:1 4:1 5:2 | 4:1 2:1 0:2 | -3:1 0:1 2:1.5 0:0.5 | 0:4"),
      lead_e: m("ionian", "0:1 4:1 7:2 | 9:1 7:1 4:2 | 5:1 4:1 2:1.5 0:0.5 | 0:4"),
      str_a: ch("ionian", PROG_COUNTY, "whole"),
      str_b: ch("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "whole"),
      harp_a: ap("ionian", PROG_COUNTY, [0, 2, 4, 7, 4, 2], 4, 0.5),
      harp_b: ap("ionian", [4, 5, 3, 4, 2, 5, 4, 0], [0, 4, 2, 7, 4, 2], 4, 0.5),
      bass_a: bl("ionian", PROG_COUNTY, "half"),
      bass_b: bl("ionian", [4, 5, 3, 4, 2, 5, 4, 0], "half"),
      bass_i: bl("ionian", [0, 0, 4, 4, 5, 5, 3, 3], "root"),
      kit: "k...s...k...s...",
      kit2: "k...s...k..ks..s",
      hum: m("ionian", "0+4:8 | 5+2:8 | 3+0:8 | 4+1:8"),
      cats: m("ionian", MEADOW + " " + MEADOW + " | " + BIGBOY + " | " + MEADOW + " 9:2 | " + BIGBOY),
      tag: ORACLE_TAG_SLOW + " .:48"
    },
    tracks: [
      { id: "lead", inst: "flute", oct: 2, vol: 0.95, pan: -0.12, send: 0.25, seq: "_*4 lead_a lead_b lead_c lead_d lead_a lead_b lead_e lead_c lead_d lead_a lead_b lead_e lead_c lead_d lead_a" },
      { id: "strings", inst: "strings", oct: 0, vol: 0.9, send: 0.3, seq: "intro str_a str_b str_a str_b str_a str_b str_a" },
      { id: "harp", inst: "harp", oct: 1, vol: 0.65, pan: 0.28, seq: "harp_a harp_b harp_a harp_b harp_a harp_b harp_a harp_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass_i bass_a bass_b bass_a bass_b bass_a bass_b bass_a" },
      { id: "kit", inst: "drums", vol: 0.7, layer: 1, seq: "kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2 kit*3 kit2" },
      { id: "orchard", inst: "harp", oct: 2, vol: 0.7, send: 0.4, only: ["orchard"], seq: "cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats cats" },
      { id: "stack", inst: "fm", oct: 1, vol: 0.6, send: 0.5, only: ["stack"], params: { ratio: 1.41, index: 2.5 }, seq: "tag tag tag tag tag tag tag tag tag tag tag tag tag tag tag tag" },
      { id: "quiet", inst: "choir", oct: 0, vol: 0.7, send: 0.45, only: ["quiet"], seq: "hum hum hum hum hum hum hum hum hum hum hum hum hum hum hum hum" }
    ]
  });

  // ---- stingers (loop:false; MQ.Audio.jingle returns to the song) ----
  function stinger(id, title, def) {
    def.title = title;
    def.loop = false;
    return S.define(id, def);
  }

  stinger("fanfare_badge", "Badge Get", {
    bpm: 132, key: "d", beats: 4, bars: 6,
    patterns: {
      lead: m("ionian", "!0:0.5 !0:0.5 !0:0.5 !0:1.5 !-1:1 | !0:1 !2:1 !4:2 | !7:1.5 !4:0.5 !7:2 | !9:4 | 7:4 | .:4"),
      bass: m("ionian", "0:0.5 0:0.5 0:0.5 0:1.5 -1:1 | 0:1 0:1 0:2 | 3:2 4:2 | 0:4 | 0:4 | .:4"),
      kit: "k.k.k.k.ss.ss.ss",
      kit2: "k...s...k...c...",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "brass", oct: 2, vol: 1.1, seq: "lead" },
      { id: "chip", inst: "pulse25", oct: 3, vol: 0.6, seq: "lead" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.9, seq: "kit kit2 kit2 kit2 kit2 rest" }
    ]
  });

  stinger("fanfare_evolve", "Something Changes", {
    bpm: 120, key: "c", beats: 4, bars: 6,
    patterns: {
      rise: m("ionian", "0:0.5 2:0.5 4:0.5 5:0.5 7:0.5 9:0.5 11:0.5 12:0.5 | 14:0.5 12:0.5 14:0.5 16:0.5 !18:2 | !14:2 !16:2 | !18:4 | 18:4 | .:4"),
      pad: ch("ionian", [0, 4, 5, 0, 0, 0], "whole"),
      bass: m("ionian", "0:4 | 4:4 | 5:4 | 0:4 | 0:4 | .:4"),
      kit: "z.z.z.z.zzzzzzzz",
      kit2: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "rise", inst: "bell", oct: 1, vol: 1.0, send: 0.4, seq: "rise" },
      { id: "pad", inst: "pad", oct: 0, vol: 0.8, send: 0.3, seq: "pad" },
      { id: "bass", inst: "sub", oct: -1, vol: 1.0, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.6, seq: "kit kit kit2 rest rest rest" }
    ]
  });

  stinger("fanfare_catch", "Capsule Click", {
    bpm: 140, key: "g", beats: 4, bars: 4,
    patterns: {
      lead: m("ionian", "!0:0.5 !2:0.5 !4:1 !7:2 | !4:1 !7:1 !9:2 | !7:4 | .:4"),
      bass: m("ionian", "0:2 4:2 | 5:2 4:2 | 0:4 | .:4"),
      kit: "k.k.s...c.......",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.1, seq: "lead" },
      { id: "bell", inst: "bell", oct: 2, vol: 0.6, send: 0.4, seq: "lead" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.8, seq: "kit rest rest rest" }
    ]
  });

  stinger("fanfare_heal", "All Better", {
    bpm: 120, key: "f", beats: 4, bars: 3,
    patterns: {
      lead: m("ionian", "4:0.5 6:0.5 7:1 9:2 | 7:2 4:2 | .:4"),
      bass: m("ionian", "0:4 | 4:2 0:2 | .:4"),
      kit: "b.......b.......",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "marimba", oct: 2, vol: 1.0, seq: "lead" },
      { id: "bass", inst: "sub", oct: -1, vol: 0.9, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.5, send: 0.3, seq: "kit rest rest" }
    ]
  });

  stinger("fanfare_quest", "Case Closed", {
    bpm: 128, key: "a", beats: 4, bars: 4,
    patterns: {
      lead: m("dorian", "!0:0.5 !3:0.5 !4:1 !7:1 !4:1 | !5:1.5 !4:0.5 !2:2 | !0:4 | .:4"),
      bass: m("dorian", "0:2 3:2 | 4:2 4:2 | 0:4 | .:4"),
      kit: "k.k.s.k.k...c...",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.05, seq: "lead" },
      { id: "brass", inst: "brass", oct: 1, vol: 0.7, seq: "lead" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.0, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.85, seq: "kit rest rest rest" }
    ]
  });

  // NEW IDS: post-battle victory jingles (the roster has no id for the
  // moment the last opponent falls; battle scenes need one).
  stinger("fanfare_victory", "Won It", {
    bpm: 148, key: "d", beats: 4, bars: 6,
    patterns: {
      lead: m("ionian", "!0:0.5 !0:0.5 !0:0.5 !0:1.5 !-3:1 | !0:1 !4:1 !2:2 | !4:1.5 !2:0.5 !0:2 | !4:4 | 4:4 | .:4"),
      bass: m("ionian", "0:0.5 0:0.5 0:0.5 0:1.5 -3:1 | 0:1 0:1 -3:2 | 3:2 4:2 | 0:4 | 0:4 | .:4"),
      kit: "k.k.k.k.s.s.s.ss",
      kit2: "k...s...k...s...",
      last: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "pulse25", oct: 2, vol: 1.1, seq: "lead" },
      { id: "brass", inst: "brass", oct: 1, vol: 0.7, seq: "lead" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass" },
      { id: "kit", inst: "drums", vol: 0.9, seq: "kit kit2 kit2 last rest rest" }
    ]
  });

  stinger("fanfare_victory_gym", "Leader Down", {
    bpm: 140, key: "d", beats: 4, bars: 8,
    patterns: {
      lead_a: m("ionian", "!0:0.5 !0:0.5 !0:0.5 !0:1.5 !-3:1 | !0:1 !4:1 !7:2 | !9:1.5 !7:0.5 !4:2 | !7:4"),
      lead_b: m("ionian", "!4:1 !5:1 !7:2 | !9:1 !7:1 !4:2 | !2:1 !4:1 !0:2 | !0:4"),
      bass_a: bl("ionian", [0, 0, 3, 4, 0, 0, 4, 0], "half"),
      kit: "k.k.k.k.s.s.s.ss",
      kit2: "k...s...k...s...",
      last: "c...............",
      rest: "................"
    },
    tracks: [
      { id: "lead", inst: "brass", oct: 2, vol: 1.1, seq: "lead_a lead_b" },
      { id: "chip", inst: "pulse25", oct: 3, vol: 0.55, seq: "lead_a lead_b" },
      { id: "bass", inst: "bass", oct: -1, vol: 1.1, seq: "bass_a" },
      { id: "kit", inst: "drums", vol: 0.9, seq: "kit kit2 kit2 kit2 kit2 kit2 last rest" }
    ]
  });

})();
