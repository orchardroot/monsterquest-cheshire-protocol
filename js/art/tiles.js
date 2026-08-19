// =============================================================
// MonsterQuest v2 — MQ.Tiles: the named tile catalogue + painters
// Owned by: art (painters, helpers) — the catalogue ids/properties are
// the world workstream's contract and are kept byte-stable below.
//
// Every tile is 16x16 source pixel art baked once into an offscreen
// canvas and drawn by the overworld at 2x (MQ.TILE = 32). Painters use
// fillRect only (via MQ.Art helpers) so they bake identically in a
// browser and in headless test contexts.
//
// Palette: Cheshire. Red brick, sandstone, slate, salt white, canal
// green, pine dark, moor purple, silk-mill mustard, rail steel.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const ART = MQ.ART;
  const Art = MQ.Art;
  const C = Art.C;
  const PAL = Art.PAL;

  const defs = {};
  const cache = {};        // id|frame|variant → canvas
  const Tiles = { defs: defs, cache: cache };

  const DEFAULTS = {
    solid: false, water: false, grass: false, ledge: null, encounter: null, layer: "ground",
    anim: null, art: null, pal: null, paint: null, variants: 1, light: false, interact: null, desc: "", color: "#f0f"
  };

  Tiles.define = function (id, def) {
    const d = U.defaults(def || {}, DEFAULTS);
    d.id = id;
    if (d.water && d.encounter === undefined) d.encounter = "water";
    defs[id] = d;
    return d;
  };
  Tiles.has = function (id) { return !!defs[id]; };
  Tiles.props = function (id) { return defs[id] || null; };
  Tiles.ids = function () { return Object.keys(defs); };
  Tiles.count = function () { return Object.keys(defs).length; };
  Tiles.isSolid = function (id) { const d = defs[id]; return !!(d && (d.solid || d.water)); };
  Tiles.frames = function (id) { const d = defs[id]; return d && d.anim ? d.anim.length : 1; };
  Tiles.variants = function (id) { const d = defs[id]; return d ? d.variants : 0; };

  // =============================================================
  // PAINTER LIBRARY
  // Helpers below are deliberately small and composable: a background
  // family (grass / path / floor / wall) plus an ascii overlay covers
  // almost every tile, and the odd landmark gets a bespoke painter.
  // =============================================================
  const px = Art.px, rect = Art.rect, fill = Art.fill, ascii = Art.ascii;
  const dither = Art.dither, speckle = Art.speckle, bevel = Art.bevel;
  const vgrad = Art.vgrad, hgrad = Art.hgrad, tuft = Art.tuft;

  function rnd(id, seed) { return U.rng(id + "#" + (seed | 0)); }

  // ---- ground beds --------------------------------------------------
  // Turf: dithered base + seeded blades. Variants shuffle the blades so a
  // field of grass never shows an obvious grid.
  function turf(ctx, seed, base, dk, lt, blades, key) {
    const r = rnd(key || "turf", seed);
    fill(ctx, base);
    dither(ctx, 0, 0, ART, ART, dk, 4);
    dither(ctx, 0, 0, ART, ART, lt, 2);
    speckle(ctx, r, 0, 0, ART, ART, [dk, lt, base], 16);
    for (let i = 0; i < blades; i++) {
      const x = 1 + ((r() * 14) | 0), y = 3 + ((r() * 13) | 0);
      tuft(ctx, x, y, dk, base, lt, 2 + ((r() * 2) | 0));
    }
  }

  // Loose ground: soil, gravel, sand, salt — grain, no blades.
  function grit(ctx, seed, base, dk, lt, n, key) {
    const r = rnd(key || "grit", seed);
    fill(ctx, base);
    dither(ctx, 0, 0, ART, ART, dk, 3);
    dither(ctx, 0, 0, ART, ART, lt, 2);
    speckle(ctx, r, 0, 0, ART, ART, [dk, lt], n);
  }

  // Cobbles / setts: staggered rounded blocks with a joint colour.
  function cobbles(ctx, seed, face, dk, lt, joint, cw, ch) {
    const r = rnd("cob" + face, seed);
    cw = cw || 4; ch = ch || 4;
    fill(ctx, joint);
    let row = 0;
    for (let y = 0; y < ART; y += ch, row++) {
      const ox = (row & 1) ? -((cw / 2) | 0) : 0;
      for (let bx = ox; bx < ART; bx += cw) {
        const q = r();
        const c = q < 0.25 ? dk : (q > 0.75 ? lt : face);
        const x0 = Math.max(bx, 0), x1 = Math.min(bx + cw - 1, ART);
        if (x1 <= x0) continue;
        rect(ctx, x0, y, x1 - x0, ch - 1, c);
        rect(ctx, x0, y, x1 - x0, 1, U.shade(c, 1.16));
        rect(ctx, x0, y + ch - 2, x1 - x0, 1, U.shade(c, 0.86));
      }
    }
  }

  // Flagstones: big irregular slabs.
  function flags(ctx, seed, face, dk, lt, joint) {
    const r = rnd("flag" + face, seed);
    fill(ctx, joint);
    const cuts = [[0, 0, 9, 7], [9, 0, 7, 7], [0, 7, 6, 9], [6, 7, 10, 9]];
    for (let i = 0; i < cuts.length; i++) {
      const s = cuts[i], q = r();
      const c = q < 0.3 ? dk : (q > 0.7 ? lt : face);
      rect(ctx, s[0], s[1], s[2] - 1, s[3] - 1, c);
      rect(ctx, s[0], s[1], s[2] - 1, 1, U.shade(c, 1.12));
      speckle(ctx, r, s[0], s[1], s[2] - 1, s[3] - 1, [U.shade(c, 0.9)], 3);
    }
  }

  // Timber floor / decking.
  function boards(ctx, seed, face, dk, lt, dir, pw) {
    const r = rnd("brd" + face, seed);
    Art.planks(ctx, { x: 0, y: 0, w: ART, h: ART, face: face, dark: dk, light: lt, grain: U.shade(face, 0.82), dir: dir || "h", pw: pw || 5, rnd: r });
  }

  // Water body. `o` carries the colour set; frame drives the ripple drift.
  function pond(ctx, frame, o) {
    Art.ripples(ctx, frame, {
      w: ART, h: ART, face: o.face, top: o.top || U.shade(o.face, 1.08),
      dark: o.dark, light: o.light, hi: o.hi || o.light, dither: true, len: o.len || 4, phase: o.phase || 0
    });
  }

  // ---- masonry ------------------------------------------------------
  function brickWall(ctx, seed, face, dk, lt, mortar, bw, bh) {
    Art.bricks(ctx, {
      x: 0, y: 0, w: ART, h: ART, bw: bw || 8, bh: bh || 4,
      face: face, dark: dk, light: lt, mortar: mortar, rnd: rnd("brk" + face, seed)
    });
    Art.edge(ctx, "n", U.shade(face, 1.25), 0.5);
    Art.edge(ctx, "s", "#000", 0.16);
  }

  function stoneWall(ctx, seed, face, dk, lt, mortar, bh) {
    Art.stonework(ctx, { x: 0, y: 0, w: ART, h: ART, bh: bh || 5, face: face, dark: dk, light: lt, mortar: mortar, rnd: rnd("stw" + face, seed) });
    Art.edge(ctx, "s", "#000", 0.18);
  }

  function roofOf(ctx, seed, style, face, dk, lt, shadow) {
    Art.roof(ctx, { x: 0, y: 0, w: ART, h: ART, style: style, face: face, dark: dk, light: lt, shadow: shadow || dk, rnd: rnd("rf" + face, seed) });
  }

  // Dev-time sanity check: every ascii tile sheet is 16 rows of 16 chars.
  function checkRows(rows) {
    if (!MQ.DEV) return rows;
    if (rows.length !== ART) MQ.warn("tiles: ascii sheet has " + rows.length + " rows: " + rows[0]);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].length !== ART) MQ.warn("tiles: ascii row " + i + " is " + rows[i].length + " chars: \"" + rows[i] + "\"");
    }
    return rows;
  }
  const sheet = checkRows;

  // Render an ascii sheet over a background painter.
  // bg = function(ctx, frame, seed) | colour string | null (transparent)
  function deco(bg, rows, palOver) {
    checkRows(rows);
    const p = palOver ? Art.pal(palOver) : PAL;
    return function (ctx, frame, seed) {
      if (typeof bg === "function") bg(ctx, frame, seed);
      else if (bg) fill(ctx, bg);
      ascii(ctx, rows, p);
    };
  }

  // Same, but the ascii sheet is chosen by animation frame.
  function decoAnim(bg, frames, palOver) {
    for (let i = 0; i < frames.length; i++) checkRows(frames[i]);
    const p = palOver ? Art.pal(palOver) : PAL;
    return function (ctx, frame, seed) {
      if (typeof bg === "function") bg(ctx, frame, seed);
      else if (bg) fill(ctx, bg);
      ascii(ctx, frames[(frame | 0) % frames.length], p);
    };
  }

  // Same, but the ascii sheet is chosen by variant seed.
  function decoVar(bg, sheets, palOver) {
    for (let i = 0; i < sheets.length; i++) checkRows(sheets[i]);
    const p = palOver ? Art.pal(palOver) : PAL;
    return function (ctx, frame, seed) {
      if (typeof bg === "function") bg(ctx, frame, seed);
      else if (bg) fill(ctx, bg);
      ascii(ctx, sheets[(seed | 0) % sheets.length], p);
    };
  }

  // ---- shared backgrounds -------------------------------------------
  const BG = {};
  BG.grass = function (ctx, f, s) { turf(ctx, s, C.grass, C.grassDk, C.grassLt, 5, "g"); };
  BG.grassQuiet = function (ctx, f, s) { turf(ctx, s, C.grass, C.grassDk, C.grassLt, 2, "gq"); };
  BG.moor = function (ctx, f, s) { turf(ctx, s, C.moorGrass, "#6b7a36", "#a4b25e", 4, "mo"); };
  BG.dirt = function (ctx, f, s) { grit(ctx, s, C.dirt, C.dirtDk, C.dirtLt, 20, "di"); };
  BG.cobble = function (ctx, f, s) { cobbles(ctx, s, "#9a9aa8", "#7a7a88", "#b6b6c2", "#68687a"); };
  BG.pave = function (ctx, f, s) { flags(ctx, s, "#b0b0b8", "#95959f", "#c8c8d0", "#7e7e88"); };
  BG.floorWood = function (ctx, f, s) { boards(ctx, s, "#b08050", "#8a6038", "#c69a68", "h", 5); };
  BG.floorStone = function (ctx, f, s) { flags(ctx, s, "#909098", "#75757f", "#a8a8b2", "#63636d"); };
  BG.floorTile = function (ctx, f, s) { tileFloor(ctx, s, "#d8d0c0", "#bdb4a2"); };
  BG.cave = function (ctx, f, s) { grit(ctx, s, "#6a6070", "#4d4557", "#867c8e", 26, "cv"); };
  BG.none = null;

  function tileFloor(ctx, seed, face, dk) {
    const r = rnd("tf" + face, seed);
    fill(ctx, face);
    for (let y = 0; y < ART; y += 8) for (let x = 0; x < ART; x += 8) {
      const c = ((x + y) % 16 === 0) ? face : U.shade(face, 0.96);
      rect(ctx, x, y, 7, 7, c);
      rect(ctx, x, y, 7, 1, U.shade(c, 1.06));
    }
    rect(ctx, 7, 0, 1, ART, dk); rect(ctx, 15, 0, 1, ART, dk);
    rect(ctx, 0, 7, ART, 1, dk); rect(ctx, 0, 15, ART, 1, dk);
    speckle(ctx, r, 0, 0, ART, ART, [U.shade(face, 1.05)], 6);
  }

  // Contact shadow at the foot of an object, so it sits on the ground.
  function foot(ctx, cx, cy, w) { Art.shadow(ctx, cx, cy, w || 5, 2, 0.22); }

  // =============================================================
  // PAINTERS — keyed by tile id.
  // =============================================================
  const PAINT = {};
  function P(id, fn) { PAINT[id] = fn; return fn; }

  // ---------------------------------------------------------------
  // GROUND — turf, moor, paths, floors
  // ---------------------------------------------------------------
  P("grass", function (ctx, f, s) { turf(ctx, s, C.grass, C.grassDk, C.grassLt, 5, "g"); });
  P("grass_dark", function (ctx, f, s) { turf(ctx, s, "#3f8a34", "#2b6926", "#59a844", 4, "gd"); });

  P("grass_tall", function (ctx, f, s) {
    turf(ctx, s, "#3d9a3a", "#2a6f28", "#55b84c", 0, "gt");
    const r = rnd("tall", s);
    const lean = (f | 0) & 1;
    for (let i = 0; i < 14; i++) {
      const x = (r() * ART) | 0, h = 6 + ((r() * 7) | 0);
      const c = r() < 0.35 ? "#67c95c" : "#43a63c";
      const dark = U.shade(c, 0.72);
      for (let j = 0; j < h; j++) {
        const tip = j > h - 4;
        const dx = tip ? (lean ? 1 : 0) : 0;
        px(ctx, (x + dx) & 15, 15 - j, tip ? c : dark);
      }
      px(ctx, (x + (lean ? 2 : 1)) & 15, 15 - h, "#7ad86a");
    }
  });

  P("grass_moor", function (ctx, f, s) {
    turf(ctx, s, C.moorGrass, "#6b7a36", "#a8b662", 6, "gm");
    const r = rnd("moorg", s);
    for (let i = 0; i < 5; i++) px(ctx, (r() * ART) | 0, (r() * ART) | 0, C.bracken);
  });

  P("moor_heather", function (ctx, f, s) {
    turf(ctx, s, "#5f6b34", "#454e26", "#77854a", 3, "mh");
    const r = rnd("heath", s);
    for (let i = 0; i < 11; i++) {
      const x = (r() * ART) | 0, y = 2 + ((r() * 13) | 0);
      rect(ctx, x, y, 1, 3, "#4a5a2c");
      px(ctx, x, y - 1, C.heather);
      px(ctx, (x + 1) & 15, y, r() < 0.5 ? C.heatherLt : C.heather);
      px(ctx, (x - 1 + 16) & 15, y + 1, C.heatherDk);
    }
  });

  P("moor_bog", function (ctx, f, s) {
    grit(ctx, s, C.peat, "#33291c", "#63523c", 22, "bog");
    const r = rnd("bogp", s);
    for (let i = 0; i < 3; i++) {
      const x = 2 + ((r() * 10) | 0), y = 3 + ((r() * 9) | 0);
      rect(ctx, x, y, 4, 3, "#2c2a20");
      rect(ctx, x, y, 4, 1, "#4a4c3a");
      px(ctx, x + 1, y + 1, "#5b6050");
    }
    for (let i = 0; i < 4; i++) {
      const x = (r() * ART) | 0;
      rect(ctx, x, 4 + ((r() * 8) | 0), 1, 4, C.moorGrass);
    }
    Art.edge(ctx, "ns", "#000", 0.18);
  });

  function flowerBed(petal, petal2, centre) {
    return function (ctx, f, s) {
      turf(ctx, s, C.grass, C.grassDk, C.grassLt, 3, "fl");
      const r = rnd("flow" + petal, s);
      for (let i = 0; i < 6; i++) {
        const x = 1 + ((r() * 13) | 0), y = 2 + ((r() * 12) | 0);
        const p = r() < 0.5 ? petal : petal2;
        px(ctx, x, y - 1, p); px(ctx, x - 1, y, p); px(ctx, x + 1, y, p); px(ctx, x, y + 1, p);
        px(ctx, x, y, centre);
        px(ctx, x, y + 2, C.grassDk);
      }
    };
  }
  P("flowers_yellow", flowerBed("#f0e04c", "#e8c832", "#8a6a10"));
  P("flowers_red", flowerBed("#e05050", "#c03434", "#f0d060"));
  P("flowers_blue", flowerBed("#6a86e8", "#4c62c8", "#e8e0a0"));
  P("flowers_white", flowerBed("#f4f4ee", "#dcdcd2", "#e8c040"));

  P("path_dirt", function (ctx, f, s) {
    grit(ctx, s, C.dirt, C.dirtDk, C.dirtLt, 24, "pd");
    const r = rnd("pdr", s);
    for (let i = 0; i < 3; i++) rect(ctx, (r() * 12) | 0, (r() * ART) | 0, 3, 1, U.shade(C.dirtDk, 0.9));
    for (let i = 0; i < 4; i++) px(ctx, (r() * ART) | 0, (r() * ART) | 0, "#8f8f86");
  });

  P("path_cobble", function (ctx, f, s) { cobbles(ctx, s, "#9a9aa8", "#7a7a88", "#b6b6c2", "#68687a"); });
  P("path_flag", function (ctx, f, s) { flags(ctx, s, "#a8a090", "#8c8578", "#c0b8a6", "#77715f"); });
  P("path_gravel", function (ctx, f, s) {
    grit(ctx, s, "#b0a898", "#8e876f", "#cdc6b4", 34, "pg");
    const r = rnd("grv", s);
    for (let i = 0; i < 10; i++) rect(ctx, (r() * 15) | 0, (r() * 15) | 0, 2, 1, r() < 0.5 ? "#d6d0c0" : "#847d68");
  });

  P("path_tarmac", function (ctx, f, s) {
    grit(ctx, s, "#505058", "#3d3d45", "#66666e", 30, "tar");
    const r = rnd("tarc", s);
    let x = (r() * ART) | 0;
    for (let y = 0; y < ART; y++) { px(ctx, x, y, "#3a3a42"); if (r() < 0.35) x = (x + (r() < 0.5 ? 1 : 15)) & 15; }
  });

  P("path_wet", function (ctx, f, s) {
    grit(ctx, s, "#7a8a70", "#5e6c56", "#94a189", 20, "pw");
    const r = rnd("wet", s);
    for (let i = 0; i < 3; i++) {
      const x = 1 + ((r() * 9) | 0), y = 2 + ((r() * 10) | 0), w = 4 + ((r() * 3) | 0);
      rect(ctx, x, y, w, 3, "#6d8496");
      rect(ctx, x + 1, y, w - 2, 1, "#93b0c4");
      px(ctx, x + 1, y + 1, "#c4dbe8");
    }
  });

  P("sand", function (ctx, f, s) {
    grit(ctx, s, "#e8d8a0", "#c9b57e", "#f6ecc4", 26, "sd");
    const r = rnd("sdr", s);
    for (let i = 0; i < 4; i++) rect(ctx, (r() * 11) | 0, (r() * ART) | 0, 5, 1, "#d8c78e");
  });

  P("mud", function (ctx, f, s) {
    grit(ctx, s, C.mud, "#4c331a", "#8a6640", 28, "md");
    const r = rnd("mdr", s);
    for (let i = 0; i < 4; i++) {
      const x = (r() * 13) | 0, y = (r() * 13) | 0;
      rect(ctx, x, y, 3, 2, "#4a3a26"); px(ctx, x + 1, y, "#7d6a4c");
    }
  });

  P("snow", function (ctx, f, s) {
    fill(ctx, "#f0f4ff");
    dither(ctx, 0, 0, ART, ART, "#dde4f4", 5);
    const r = rnd("snw", s);
    speckle(ctx, r, 0, 0, ART, ART, ["#ffffff", "#cfd8ee"], 18);
    for (let i = 0; i < 3; i++) rect(ctx, (r() * 10) | 0, (r() * ART) | 0, 5, 1, "#d5def2");
  });

  P("salt_flat", function (ctx, f, s) {
    fill(ctx, "#e8e8f0");
    dither(ctx, 0, 0, ART, ART, "#d6d8e6", 4);
    const r = rnd("slt", s);
    // polygonal crust cracks
    const cx = 4 + ((r() * 8) | 0), cy = 4 + ((r() * 8) | 0);
    rect(ctx, 0, cy, ART, 1, "#c3c6d8");
    rect(ctx, cx, 0, 1, cy, "#c3c6d8");
    rect(ctx, (cx + 6) & 15, cy, 1, ART - cy, "#c3c6d8");
    speckle(ctx, r, 0, 0, ART, ART, ["#ffffff", "#cdd0e0"], 14);
  });

  P("salt_crust", function (ctx, f, s) {
    fill(ctx, "#d8d8e8");
    const r = rnd("sltc", s);
    for (let i = 0; i < 5; i++) {
      const x = (r() * 12) | 0, y = 2 + ((r() * 10) | 0), w = 3 + ((r() * 4) | 0);
      rect(ctx, x, y, w, 3, "#eef0fa");
      rect(ctx, x, y + 3, w, 1, "#b9bcd0");
      rect(ctx, x, y, w, 1, "#ffffff");
    }
    speckle(ctx, r, 0, 0, ART, ART, ["#ffffff", "#b7bacd"], 16);
    Art.edge(ctx, "s", "#000", 0.2);
  });

  P("orchard_grass", function (ctx, f, s) {
    turf(ctx, s, "#6ab04c", "#4d8c36", "#8ccb66", 4, "orc");
    const r = rnd("orcp", s);
    for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0, y = (r() * 15) | 0; px(ctx, x, y, "#c8d84a"); px(ctx, x + 1, y, "#e0e878"); }
  });

  P("pine_needles", function (ctx, f, s) {
    grit(ctx, s, "#6a5a3a", "#4c3f26", "#8a7a52", 18, "pn");
    const r = rnd("pnl", s);
    for (let i = 0; i < 14; i++) {
      const x = (r() * 14) | 0, y = (r() * 15) | 0;
      rect(ctx, x, y, 2, 1, r() < 0.4 ? "#3e4a2c" : "#7d6b44");
    }
    for (let i = 0; i < 3; i++) px(ctx, (r() * ART) | 0, (r() * ART) | 0, "#2f4a2a");
  });

  P("cave_floor", function (ctx, f, s) {
    grit(ctx, s, "#6a6070", "#4d4557", "#867c8e", 26, "cf");
    const r = rnd("cfr", s);
    for (let i = 0; i < 4; i++) {
      const x = (r() * 13) | 0, y = (r() * 13) | 0;
      rect(ctx, x, y, 3, 2, "#5a5165"); rect(ctx, x, y, 3, 1, "#7b7186");
    }
    Art.edge(ctx, "ns", "#000", 0.12);
  });
  P("cave_floor_dark", function (ctx, f, s) {
    grit(ctx, s, "#4a4050", "#332c3c", "#615668", 22, "cfd");
    Art.edge(ctx, "nsew", "#000", 0.2);
  });
  P("mine_floor", function (ctx, f, s) {
    grit(ctx, s, "#5a5048", "#413931", "#786c60", 24, "mf");
    const r = rnd("mfr", s);
    for (let i = 0; i < 3; i++) rect(ctx, 0, (r() * ART) | 0, ART, 1, "#4a423a");
    for (let i = 0; i < 4; i++) px(ctx, (r() * ART) | 0, (r() * ART) | 0, "#8e8474");
  });

  P("floor_wood", function (ctx, f, s) { boards(ctx, s, "#b08050", "#8a6038", "#c69a68", "h", 5); });
  P("floor_wood_dark", function (ctx, f, s) { boards(ctx, s, "#8a6038", "#65431f", "#a37b4c", "v", 5); });
  P("floor_stone", function (ctx, f, s) { flags(ctx, s, "#909098", "#75757f", "#a8a8b2", "#63636d"); });
  P("floor_tile", function (ctx, f, s) { tileFloor(ctx, s, "#d8d0c0", "#bdb4a2"); });
  P("floor_tile_check", function (ctx, f, s) {
    Art.checker(ctx, 0, 0, ART, ART, "#d8d8dc", "#3c3c46", 8);
    rect(ctx, 0, 0, 8, 1, "#eaeaee"); rect(ctx, 8, 8, 8, 1, "#eaeaee");
    rect(ctx, 8, 0, 8, 1, "#4e4e5a"); rect(ctx, 0, 8, 8, 1, "#4e4e5a");
    rect(ctx, 0, 7, ART, 1, "#9a9aa2"); rect(ctx, 0, 15, ART, 1, "#9a9aa2");
  });
  P("floor_carpet", function (ctx, f, s) {
    fill(ctx, "#a04040");
    dither(ctx, 0, 0, ART, ART, "#8d3636", 6);
    dither(ctx, 0, 0, ART, ART, "#b25050", 3);
    const r = rnd("crp", s);
    speckle(ctx, r, 0, 0, ART, ART, ["#8a3232", "#b85858"], 20);
  });
  P("floor_lab", function (ctx, f, s) {
    fill(ctx, "#c0d8e0");
    rect(ctx, 0, 7, ART, 1, "#a3bfc9"); rect(ctx, 0, 15, ART, 1, "#a3bfc9");
    rect(ctx, 7, 0, 1, ART, "#a3bfc9"); rect(ctx, 15, 0, 1, ART, "#a3bfc9");
    rect(ctx, 0, 0, 7, 1, "#dcecf2"); rect(ctx, 8, 8, 7, 1, "#dcecf2");
    const r = rnd("lab", s);
    speckle(ctx, r, 0, 0, ART, ART, ["#d4e6ec"], 6);
  });
  P("floor_gym", function (ctx, f, s) {
    boards(ctx, s, "#d0a860", "#a8823f", "#e2c184", "h", 8);
    rect(ctx, 0, 0, ART, 1, "#8f6c2e");
    rect(ctx, 2, 2, 12, 12, null);
    // pale court markings
    rect(ctx, 1, 3, 14, 1, "#f2e6c8"); rect(ctx, 1, 12, 14, 1, "#f2e6c8");
  });
  P("rug", function (ctx, f, s) {
    fill(ctx, "#c03030");
    Art.frame(ctx, 0, 0, ART, ART, "#8f1f1f");
    Art.frame(ctx, 2, 2, 12, 12, "#e8c060");
    Art.checker(ctx, 4, 4, 8, 8, "#c03030", "#a82828", 2);
    px(ctx, 7, 7, "#e8c060"); px(ctx, 8, 8, "#e8c060");
  });
  P("rug_edge", function (ctx, f, s) {
    fill(ctx, "#a02828");
    rect(ctx, 0, 0, ART, 2, "#8f1f1f");
    for (let x = 0; x < ART; x += 2) rect(ctx, x, ART - 3, 1, 3, "#e8c060");
    dither(ctx, 0, 2, ART, 11, "#b53232", 6);
  });

  P("platform", function (ctx, f, s) {
    flags(ctx, s, "#a8a0a0", "#8b8484", "#c2baba", "#767070");
    const r = rnd("plt", s);
    speckle(ctx, r, 0, 0, ART, ART, ["#bab2b2"], 8);
  });
  P("platform_edge", function (ctx, f, s) {
    flags(ctx, s, "#a8a0a0", "#8b8484", "#c2baba", "#767070");
    rect(ctx, 0, 10, ART, 4, "#e0d060");
    rect(ctx, 0, 10, ART, 1, "#f4e894");
    rect(ctx, 0, 13, ART, 1, "#a8912f");
    rect(ctx, 0, 14, ART, 2, "#5a5a60");
    for (let x = 1; x < ART; x += 4) rect(ctx, x, 11, 1, 2, "#c8b64e");
  });

  P("void", function (ctx) { fill(ctx, "#08080c"); dither(ctx, 0, 0, ART, ART, "#101018", 3); });

  // ---------------------------------------------------------------
  // WATER — canal green, mere silver, brine turquoise
  // ---------------------------------------------------------------
  function waterPainter(o) { return function (ctx, f) { pond(ctx, f, o); }; }

  P("water", waterPainter({ face: "#4a8ad8", top: "#5f9ce4", dark: "#2f65ab", light: "#8dc0f2", hi: "#cfe6ff" }));
  P("water_deep", waterPainter({ face: "#25538f", top: "#2d6099", dark: "#173c69", light: "#4b83c4", hi: "#8fb9e4", len: 3 }));
  P("water_canal", waterPainter({ face: "#3f6a63", top: "#4b7a70", dark: "#26443f", light: "#699e8f", hi: "#a9cfc0", len: 5, phase: 2 }));
  P("water_river", waterPainter({ face: "#4a90c8", top: "#57a0d6", dark: "#2f6a9a", light: "#8ec4e8", hi: "#d0ecfa", len: 6 }));
  P("water_flash", waterPainter({ face: "#5a80a8", top: "#6a90b6", dark: "#3d5f83", light: "#93b4cf", hi: "#c9dde9", len: 3, phase: 1 }));
  P("water_pond", waterPainter({ face: "#4a7ab0", top: "#578ac0", dark: "#325a89", light: "#83aed6", hi: "#c4dcef", len: 4, phase: 3 }));
  P("brine_pool", waterPainter({ face: "#7ac8c0", top: "#8ad8cf", dark: "#4e9a94", light: "#a9e6de", hi: "#e2f8f4", len: 5 }));
  P("zoo_pool", waterPainter({ face: "#5aa0d0", top: "#6bb0dc", dark: "#3b7aa8", light: "#95cbe8", hi: "#d6effa", len: 4, phase: 2 }));
  P("fish_spot", function (ctx, f, s) {
    pond(ctx, f, { face: "#3a7ac0", top: "#4587cc", dark: "#255a99", light: "#7cb0e2", hi: "#c2e0f8", len: 4 });
    // concentric rise-ring, expanding with the frame
    const r = 2 + ((f | 0) % 4);
    const g = ctx.globalAlpha; ctx.globalAlpha = 0.55 - ((f | 0) % 4) * 0.1;
    ctx.fillStyle = "#dff0ff";
    ctx.fillRect(8 - r, 8, r * 2, 1); ctx.fillRect(8, 8 - r, 1, r * 2);
    ctx.fillRect(8 - r + 1, 8 - r + 1, 1, 1); ctx.fillRect(8 + r - 1, 8 + r - 1, 1, 1);
    ctx.fillRect(8 - r + 1, 8 + r - 1, 1, 1); ctx.fillRect(8 + r - 1, 8 - r + 1, 1, 1);
    ctx.globalAlpha = g;
  });

  P("shallows", function (ctx, f) {
    pond(ctx, f, { face: "#8ac0e0", top: "#98cbe8", dark: "#6ba2c4", light: "#bfe0f4", hi: "#eaf8ff", len: 5 });
    const r = rnd("shal", 0);
    speckle(ctx, r, 0, 0, ART, ART, ["#c9a978", "#a8916a"], 8);
  });

  // Bank / shallows edge: dry bank at the top, water below, foam between.
  P("water_edge", function (ctx, f, s) {
    grit(ctx, s, "#c9b184", "#a58f65", "#e0cca4", 16, "bank");
    for (let i = 0; i < 6; i++) rect(ctx, (i * 3) % ART, 2 + (i % 4), 2, 1, "#8f7a52");
    pondBand(ctx, f, 9);
  });
  function pondBand(ctx, f, y0) {
    Art.ripples(ctx, f, { x: 0, y: y0, w: ART, h: ART - y0, face: "#5f9ce4", top: "#4c86cd", dark: "#3d76bd", light: "#9ac8f2", hi: "#d8ecff", rows: [1, 3, 5], len: 4 });
    rect(ctx, 0, y0 - 1, ART, 1, "#e8f4ff");
    const r = rnd("foam", 0);
    for (let i = 0; i < 5; i++) px(ctx, (r() * ART) | 0, y0 - 2, "#f2f9ff");
  }

  const REED_PAL = Art.pal({});
  const REEDS_A = sheet([
    "................", "......V.........", ".....V..V...V...", "....V.VV.V..VV..",
    "...V.VV.VV.VVV..", "...V.V..V..V.V..", "...V.V..V..V.V..", "..V..V..V..V.V..",
    "..V..V..V..V.V..", "..V..V..V..V.V..", "..V..V..V..V.V..", "..V..V..V..V.V..",
    "..v..v..v..v.v..", "..v..v..v..v.v..", "................", "................"
  ]);
  const REEDS_B = sheet([
    "................", ".......V........", "....V...V....V..", "...VV..VV...VV..",
    "..VVV.VV.V.VV...", "...V..V..V..V...", "...V..V..V..V...", "...V..V..V..V...",
    "..V...V..V..V...", "..V...V..V..V...", "..V...V..V..V...", "..V...V..V..V...",
    "..v...v..v..v...", "..v...v..v..v...", "................", "................"
  ]);
  P("water_reeds", function (ctx, f, s) {
    pond(ctx, f, { face: "#3f6a63", top: "#4b7a70", dark: "#26443f", light: "#699e8f", hi: "#a9cfc0", len: 4 });
    ascii(ctx, (f | 0) % 2 ? REEDS_B : REEDS_A, REED_PAL);
  });
  P("lake_reeds", function (ctx, f, s) {
    grit(ctx, s, "#5a9a70", "#3f7351", "#7fba90", 16, "reedb");
    rect(ctx, 0, 11, ART, 5, "#41705a");
    ascii(ctx, (f | 0) % 2 ? REEDS_A : REEDS_B, REED_PAL);
    Art.edge(ctx, "s", "#000", 0.2);
  });

  P("waterfall", function (ctx, f) {
    const fr = (f | 0) & 3;
    fill(ctx, "#6fa8d8");
    for (let x = 0; x < ART; x++) {
      const c = (x % 4 === 0) ? "#eaf6ff" : (x % 4 === 2 ? "#a0d0f0" : "#7cb6e0");
      rect(ctx, x, 0, 1, ART, c);
    }
    for (let i = 0; i < 6; i++) {
      const y = (i * 3 + fr * 3) % ART;
      rect(ctx, (i * 3) % ART, y, 1, 3, "#ffffff");
      rect(ctx, (i * 3 + 5) % ART, (y + 6) % ART, 1, 2, "#d6ecff");
    }
    rect(ctx, 0, 0, ART, 1, "#b8dcf4");
  });

  P("hot_spring", function (ctx, f) {
    pond(ctx, f, { face: "#c0e0f0", top: "#d2ecf8", dark: "#93bfd4", light: "#e8f8ff", hi: "#ffffff", len: 3 });
    const fr = (f | 0) & 3;
    const g = ctx.globalAlpha; ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i++) {
      const x = 2 + i * 4, y = (12 - fr * 2 - i * 3 + 16) % 16;
      ctx.fillRect(x, y, 2, 1); ctx.fillRect(x + 1, y - 1 < 0 ? 15 : y - 1, 1, 1);
    }
    ctx.globalAlpha = g;
  });

  P("bridge_wood", function (ctx, f, s) {
    boards(ctx, s, "#a07840", "#6d4a22", "#c39a60", "v", 4);
    rect(ctx, 0, 0, ART, 1, "#7a5628");
    rect(ctx, 0, ART - 1, ART, 1, "#5c3f1c");
    const r = rnd("brdg", s);
    for (let i = 0; i < 6; i++) px(ctx, (r() * ART) | 0, (r() * ART) | 0, "#4a3116");
  });
  P("bridge_stone", function (ctx, f, s) {
    flags(ctx, s, "#8a8a90", "#6e6e76", "#a6a6ae", "#5c5c64");
    rect(ctx, 0, 0, ART, 1, "#6a6a72"); rect(ctx, 0, ART - 1, ART, 1, "#565660");
  });
  P("bridge_rail", deco(null, [
    "................", "................", "................", "................",
    "..OOOOOOOOOOOO..", "..OPPPPPPPPPPO..", "..OOOOOOOOOOOO..", "..O..........O..",
    "..O..........O..", "..OOOOOOOOOOOO..", "..OPPPPPPPPPPO..", "..OOOOOOOOOOOO..",
    "..O..........O..", "..O..........O..", "..O..........O..", "................"
  ]));

  P("boat_dock", function (ctx, f, s) {
    boards(ctx, s, "#8a6a40", "#5f4522", "#a9854f", "h", 4);
    rect(ctx, 1, 0, 2, ART, "#6d4a22"); rect(ctx, 13, 0, 2, ART, "#6d4a22");
    rect(ctx, 0, 14, ART, 2, "#4a3116");
    // mooring ring
    Art.frame(ctx, 6, 4, 5, 5, "#33333c"); px(ctx, 8, 4, "#5c5c68");
  });

  // ---------------------------------------------------------------
  // VEGETATION — oak, pine, birch, apple, willow, autumn, hedges
  // Two-tile trees: the `_top` id is the crown, drawn on the over
  // layer so the player walks behind it.
  // ---------------------------------------------------------------
  function treeGround(ctx, f, s) { turf(ctx, s, C.grass, C.grassDk, C.grassLt, 3, "tg"); foot(ctx, 8, 14, 6); }

  P("tree_oak_top", deco(null, [
    "....kkkkkkk.....", "..kkEEEEEEEkk...", ".kEEEeeeeeEEEEk.", "kEEee^^^^^eeEEEk",
    "kEee^^^^^^^^eeEk", "kEe^^^^^^^^^^eEk", "kEe^^^^^^^^^^eEk", "kEee^^^^^^^^eeEk",
    "kEEee^^^^^^eeEEk", ".kEEeeee^^eeeEk.", ".kkEEEeeeeeEEkk.", "..kkEEEEEEEkkk..",
    "....kkkkkkk.....", "................", "................", "................"
  ]));
  P("tree_oak", deco(treeGround, [
    ".kEEeeeeeeeeEEk.", "..kEEEeeeeeEEEk.", "...kkEEEEEEEkk..", ".....kkOOOkk....",
    "......O>OO......", "......OO>O......", "......O>OO......", "......OO>O......",
    "......O>OO......", ".....OO>OOO.....", "....OO>OOOO>O...", "...O>OOOOOOO>O..",
    "................", "................", "................", "................"
  ]));

  P("tree_pine_top", deco(null, [
    ".......v........", "......vVv.......", "......vVv.......", ".....vvVVv......",
    ".....vVVVv......", "....vvVVVVv.....", "....vVVVVVv.....", "...vvVVVVVVv....",
    "...vVVVVVVVv....", "..vvVVVVVVVVv...", "..vVVVVVVVVVv...", ".vvVVVVVVVVVVv..",
    ".vVVVVVVVVVVVv..", "vvVVVVVVVVVVVVv.", "vVVVVVVVVVVVVVv.", "................"
  ]));
  P("tree_pine", deco(treeGround, [
    ".vvVVVVVVVVVVv..", "vvVVVVVVVVVVVVv.", "vVVVVVVVVVVVVVVv", "vvVVVVVVVVVVVVv.",
    ".vvVVVVVVVVVVv..", "..vvVVVVVVVVv...", "...vvVVVVVVv....", "....vvVVVVv.....",
    ".....vvVVv......", "......O>O.......", "......O>O.......", "......O>O.......",
    ".....OO>OO......", "....O>OOO>O.....", "................", "................"
  ]));

  P("tree_birch_top", deco(null, [
    "...^^^..^^^^....", "..^^^^^^^^^^^...", ".^^h^^^^h^^^^^..", "^^^^h^^^^^h^^^^.",
    "^h^^^^^h^^^^^h^^", "^^^^h^^^^^h^^^^^", ".^^^^^^h^^^^^^^.", ".^^h^^^^^^^h^^..",
    "..^^^^^^^^^^^^..", "...^^^^h^^^^^...", "....^^^^^^^.....", ".....^^c^^......",
    "......ccC.......", "......cCC.......", "......ckC.......", "......cCC......."
  ]));
  P("tree_birch", deco(treeGround, [
    "...^^^^ccC^^^^..", "..^^^^^ckC^^^^^.", "...^^^^cCC^^^^..", ".....^^ccC^^....",
    "......ccC.......", "......ckC.......", "......ccC.......", "......cCC.......",
    "......ckC.......", "......ccC.......", "......cCC.......", "......ccC.......",
    ".....CccCC......", "....CCcccCC.....", "................", "................"
  ]));

  P("tree_apple_top", deco(null, [
    "....kkkkkkk.....", "..kkEEeeeeEkk...", ".kEEeee^1eeEEEk.", "kEEee^^^^^eeEEEk",
    "kEee^^1^^^^1eeEk", "kEe^^^^^^^^^^eEk", "kEe^^1^^^^^^1eEk", "kEee^^^^1^^^eeEk",
    "kEEee^^^^^^eeEEk", ".kEEee1^^1eeeEk.", ".kkEEEeeeeeEEkk.", "..kkEEEEEEEkkk..",
    "....kkkkkkk.....", "................", "................", "................"
  ]));
  P("tree_apple", function (ctx, f, s) {
    treeGround(ctx, f, s);
    ascii(ctx, APPLE_BASE, PAL);
    // a windfall in the grass
    px(ctx, 3, 14, C.red); px(ctx, 4, 14, "#e06a5a"); px(ctx, 3, 15, C.redDk);
  });
  const APPLE_BASE = sheet([
    ".kEEee1eeee1EEk.", "..kEEEeeeeeEEEk.", "...kkEEEEEEEkk..", ".....kkOOOkk....",
    "......O>OO......", "......OO>O......", "......O>OO......", "......OO>O......",
    "......O>OO......", ".....OO>OOO.....", "....OO>OOOO>O...", "...O>OOOOOOO>O..",
    "................", "................", "................", "................"
  ]);

  P("tree_dead", deco(treeGround, [
    "...>.....>......", "....>...>.......", ".....>.>>.......", "..>...>>........",
    "...>>.O>........", "......O>........", "....>>O>>>......", "......O>..>.....",
    "......O>........", "......O>........", "......O>........", ".....OO>>.......",
    "....O>OO>>......", "...O>OOOO>......", "................", "................"
  ]));

  P("tree_willow", deco(treeGround, [
    "...;;;;;;;;;;...", "..;;V;;;;;;V;;..", ".;;;;;;;;;;;;;;.", ";;;V;;;;;;;;V;;;",
    ";.;.;.;.;.;.;.;.", ".;.;.;O>.;.;.;..", ";.;.;.O>;.;.;.;.", ".;.;..O>.;..;.;.",
    ";.;...O>...;.;..", ".;....O>....;...", "......O>........", "......O>........",
    ".....OO>>.......", "....O>OOO>......", "................", "................"
  ]));

  P("tree_autumn", deco(treeGround, [
    "....kk///kk.....", "..kk//5///kk....", ".k///5///5//k...", "k//5//////5//k..",
    "k/////5///////k.", "k//5////5////Ok.", "k////////5//O>k.", ".k//5//////O>k..",
    "..k//////O>k....", "...kk///O>k.....", "......O>O.......", "......O>O.......",
    ".....OO>OO......", "....O>OOOO>.....", "................", "................"
  ]));

  // Clipped hedges — procedural so a long run reads as one hedge.
  function hedgeBody(ctx, seed, top, key) {
    const r = rnd(key, seed);
    fill(ctx, C.hedgeDk);
    dither(ctx, 0, 0, ART, ART, C.hedge, 8);
    dither(ctx, 0, 0, ART, ART, "#3f9436", 3);
    speckle(ctx, r, 0, 0, ART, ART, ["#1a4a1c", "#4f9c3f", "#57a63f"], 30);
    rect(ctx, 0, top, ART, 1, "#4f9c3f");
    rect(ctx, 0, top + 1, ART, 1, "#3d8a30");
    for (let i = 0; i < 7; i++) px(ctx, (r() * ART) | 0, top + ((r() * 2) | 0), "#6cbb52");
    Art.edge(ctx, "s", "#000", 0.28);
  }
  P("hedge", function (ctx, f, s) { hedgeBody(ctx, s, 0, "hg"); });
  P("hedge_low", function (ctx, f, s) {
    turf(ctx, s, C.grass, C.grassDk, C.grassLt, 2, "hl");
    const r = rnd("hlb", s);
    rect(ctx, 0, 4, ART, 11, C.hedgeDk);
    dither(ctx, 0, 4, ART, 11, C.hedge, 8);
    speckle(ctx, r, 0, 4, ART, 11, ["#1a4a1c", "#4f9c3f"], 20);
    rect(ctx, 0, 4, ART, 1, "#4f9c3f");
    for (let i = 0; i < 6; i++) px(ctx, (r() * ART) | 0, 4 + ((r() * 2) | 0), "#6cbb52");
    Art.edge(ctx, "s", "#000", 0.24);
  });

  P("bush", deco(treeGround, [
    "................", "................", ".....EEEEE......", "...EEeeeeeEE....",
    "..EEee^^^eeEE...", ".Eee^^^^^^^eeE..", ".Ee^^^^^^^^^eE..", "Eee^^^^^^^^^eeE.",
    "Eee^^^^^^^^^^eE.", "Ee^^^^^^^^^^^eE.", "EEee^^^^^^^^eEE.", ".EEeeee^^eeeEE..",
    "..EEEEeeeeEEE...", "....EEEEEEE.....", "................", "................"
  ]));
  P("berry_bush", deco(treeGround, [
    "................", "................", ".....EEEEE......", "...EEee1eeEE....",
    "..EEee^^^ee1E...", ".Eee^1^^^^^eeE..", ".Ee^^^^^1^^^eE..", "Eee1^^^^^^^^eeE.",
    "Eee^^^^^1^^^^eE.", "Ee^^1^^^^^^1^eE.", "EEee^^^^1^^^eEE.", ".EEeee1^^eeeEE..",
    "..EEEEeeeeEEE...", "....EEEEEEE.....", "................", "................"
  ]));

  P("mushroom", deco(null, [
    "................", "................", "................", "................",
    "................", "................", "................", "................",
    "..........1.....", ".....111.121....", "....11211.[[....", "....11111.[[....",
    ".....[[[..[[....", ".....[][..]]....", "................", "................"
  ]));

  P("stump", deco(treeGround, [
    "................", "................", "................", "................",
    "................", "................", "....OOOOOOOO....", "...O>PPPPPP>O...",
    "..O>PPoooPPP>O..", "..O>PPoooPPP>O..", "...O>PPPPPP>O...", "...OOOOOOOOOO...",
    "...O>>OOO>>OO...", "....OO>>OO>O....", "................", "................"
  ]));

  P("log", deco(treeGround, [
    "................", "................", "................", "................",
    "................", "................", "..OOOOOOOOOOOO..", ".OPPoPPPPPoPPPO.",
    "OPo>PPoPPPPoPPPO", "OPoPPPPPPoPPPPPO", ".O>OOO>OOOO>OOO.", "..OOOOOOOOOOOO..",
    "................", "................", "................", "................"
  ]));

  P("moss_rock", deco(treeGround, [
    "................", "................", "................", ".....nnnn.......",
    "...nnllllnn.....", "..nllllllnnn....", "..nlllllnnnNn...", ".nllleelnnNNNn..",
    ".nlleeeennNNNn..", "nnlleeeeennNNnn.", "nNnleeeeeennNnn.", "nNNneeeeennNNnn.",
    ".NNNneeeennNNn..", "..NNNNNNNNNNn...", "................", "................"
  ]));
