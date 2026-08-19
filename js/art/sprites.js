// =============================================================
// MonsterQuest v2 — MQ.Art: pixel-art rasteriser, palettes, cache,
// and the procedural painting toolkit used by MQ.Tiles (and anyone
// else who needs to bake 16x16 pixel art into a canvas).
// Owned by: art. Load order: first of the art block.
//
// Everything here paints with fillRect only (no paths, no gradients,
// no transforms) so that art bakes identically in a browser, in a
// headless stub context, and in the software rasteriser used by tests.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const ART = MQ.ART;

  const cache = new Map();
  const defs = {};      // named sprite defs: name → {art, pal}
  let cacheHits = 0;

  const Art = { ART: ART, defs: defs, cache: cache };

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  Art.canvas = makeCanvas;

  // -------------------------------------------------------------
  // 1. Cheshire palette
  //    Warm, readable, low-count. Every tile in the game pulls its
  //    colours from here (or a shade/mix of them) so the world reads
  //    as one place. Names are British and boring on purpose.
  // -------------------------------------------------------------
  const C = {
    // ink & neutrals
    ink:        "#1b1720",   // outline / darkest
    ink2:       "#2c2733",
    shadow:     "#3a3442",
    steel:      "#6a7078",   // rail steel
    steelLt:    "#8e959d",
    steelDk:    "#464c54",
    iron:       "#33333c",
    ironLt:     "#5c5c68",
    // brick (silk-mill oxblood through common red)
    brick:      "#a04838",
    brickLt:    "#b96150",
    brickDk:    "#6f2f26",
    brickSoot:  "#5a2a24",
    mortar:     "#c9b79c",
    mortarDk:   "#a28f76",
    // sandstone (Chester / Alderley / Frodsham)
    sand:       "#c8a070",
    sandLt:     "#e2c295",
    sandDk:     "#9a744a",
    sandRed:    "#b9744c",
    // grit & grey stone (moor villages, Kerridge, castle)
    grit:       "#7d7a72",
    gritLt:     "#9e9b92",
    gritDk:     "#57544e",
    stone:      "#8a8a90",
    stoneLt:    "#b2b2ba",
    stoneDk:    "#5d5d66",
    // slate roofs
    slate:      "#4a4a5a",
    slateLt:    "#63637a",
    slateDk:    "#31313f",
    // salt & whitewash
    salt:       "#eef0f6",
    saltDk:     "#cdd2de",
    white:      "#f4f2ea",
    whiteDk:    "#d3cfc0",
    cream:      "#e8dcb8",
    creamDk:    "#c4b48c",
    // greens
    grass:      "#5aab46",
    grassLt:    "#78c85c",
    grassDk:    "#3d8434",
    grassDk2:   "#2c6427",
    moorGrass:  "#8a9a4a",
    pine:       "#1e4a2a",
    pineLt:     "#2f6f3c",
    pineDk:     "#123018",
    hedge:      "#2f7a2a",
    hedgeDk:    "#1d5620",
    leafAut:    "#c07030",
    // water
    water:      "#4a8ad8",
    waterLt:    "#7fb6ef",
    waterDk:    "#2a5a9c",
    waterFoam:  "#cfe6ff",
    canal:      "#3f6a63",   // canal green
    canalLt:    "#5b8c81",
    canalDk:    "#26443f",
    brine:      "#7ac8c0",
    // moor
    heather:    "#8a5aa0",
    heatherLt:  "#b184c4",
    heatherDk:  "#5c3a70",
    bracken:    "#a5713a",
    peat:       "#4a3b2b",
    // earth
    dirt:       "#b8925a",
    dirtLt:     "#d0ac74",
    dirtDk:     "#8a6a3a",
    mud:        "#6a4a2a",
    // timber
    wood:       "#a07840",
    woodLt:     "#c39a60",
    woodDk:     "#6d4a22",
    woodDk2:    "#4a3116",
    tudor:      "#241c18",   // black timber
    // accents
    mustard:    "#d8a028",   // silk-mill mustard
    mustardDk:  "#9a6c14",
    red:        "#c03030",
    redDk:      "#8a1c1c",
    gold:       "#e8c04a",
    lamp:       "#ffd98a",
    glass:      "#a9d3e6",
    glassLt:    "#d6eef8",
    glassDk:    "#6f9fb6",
    cyber:      "#28c8a0",
    cyberLt:    "#7df0d4",
    cyberDk:    "#0e6a56"
  };
  Art.C = C;

  // Single-character palette shared by every ascii tile in MQ.Tiles.
  // Keep this stable — tile art strings are written against it.
  const PAL = {
    "k": C.ink, "K": C.ink2, "j": C.shadow,
    "b": C.brick, "B": C.brickDk, "r": C.brickLt, "m": C.mortar, "M": C.mortarDk,
    "s": C.sand, "S": C.sandDk, "t": C.sandLt,
    "n": C.stone, "N": C.stoneDk, "l": C.stoneLt, "q": C.grit, "Q": C.gritDk,
    "y": C.slate, "Y": C.slateDk, "u": C.slateLt,
    "c": C.white, "C": C.whiteDk, "a": C.cream, "A": C.creamDk, "z": C.salt, "Z": C.saltDk,
    "g": C.grass, "G": C.grassDk, "h": C.grassLt, "v": C.pine, "V": C.pineLt, "e": C.hedge, "E": C.hedgeDk,
    "w": C.water, "W": C.waterDk, "x": C.waterLt, "f": C.waterFoam,
    "d": C.dirt, "D": C.dirtDk, "p": C.mud,
    "o": C.wood, "O": C.woodDk, "P": C.woodLt, "T": C.tudor,
    "i": C.iron, "I": C.ironLt, "L": C.steel, "U": C.steelLt,
    "1": C.red, "2": C.redDk, "3": C.mustard, "4": C.mustardDk, "5": C.gold, "6": C.lamp,
    "7": C.glass, "8": C.glassLt, "9": C.glassDk,
    "0": C.cyber, "!": C.cyberLt, "@": C.cyberDk,
    "#": C.heather, "$": C.heatherDk, "%": C.bracken, "&": C.peat,
    "+": C.canal, "-": C.canalLt, "=": C.canalDk, "*": C.brine,
    "/": C.leafAut, "\\": C.moorGrass, "<": C.sandRed, ">": C.woodDk2, "?": C.gritLt,
    "^": "#57a63f", "~": "#dfe9f2", "|": "#8a8f98", ";": "#6b8f4a", ":": "#3c3a45", ",": "#b0a898",
    "(": "#d8607f", ")": "#8f3350", "[": "#f0e6d2", "]": "#6a6255", "{": "#2b8ad6", "}": "#124c86"
  };
  Art.PAL = PAL;

  // pal({x:'#fff'}) → a copy of PAL with overrides. Bake-time only.
  Art.pal = function (over) {
    const p = {};
    for (const k in PAL) if (Object.prototype.hasOwnProperty.call(PAL, k)) p[k] = PAL[k];
    if (over) for (const k2 in over) if (Object.prototype.hasOwnProperty.call(over, k2)) p[k2] = over[k2];
    return p;
  };

  // Palette ramp: n shades from dark to light around a base colour.
  Art.ramp = function (base, n, lo, hi) {
    n = n || 4; lo = lo === undefined ? 0.62 : lo; hi = hi === undefined ? 1.32 : hi;
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = U.shade(base, n === 1 ? 1 : lo + (hi - lo) * (i / (n - 1)));
    return out;
  };
  Art.shade = U.shade;
  Art.mix = U.mix;
  Art.rng = function (seedStr) { return U.rng(seedStr); };

  // -------------------------------------------------------------
  // 2. Rasteriser (ascii art → canvas) — the original API
  // -------------------------------------------------------------
  Art.render = function (art, pal, scale, flipX) {
    scale = scale || 1;
    const rows = art.length;
    let cols = 0;
    for (let y = 0; y < rows; y++) if (art[y].length > cols) cols = art[y].length;
    const c = makeCanvas(Math.max(1, cols * scale), Math.max(1, rows * scale));
    const g = c.getContext("2d");
    for (let y = 0; y < rows; y++) {
      const row = art[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        const color = pal[ch];
        if (!color) continue;
        const dx = flipX ? cols - 1 - x : x;
        g.fillStyle = color;
        g.fillRect(dx * scale, y * scale, scale, scale);
      }
    }
    return c;
  };

  // Cached render keyed by (key, scale, flip, tint). `key` must be unique per art+pal.
  Art.get = function (key, art, pal, scale, flipX, tint) {
    const k = key + "|" + (scale || 1) + "|" + (flipX ? 1 : 0) + "|" + (tint || "");
    let c = cache.get(k);
    if (c) { cacheHits++; return c; }
    c = Art.render(art, pal, scale || 1, !!flipX);
    if (tint) c = Art.tint(c, tint.color || tint, tint.alpha);
    cache.set(k, c);
    return c;
  };

  Art.define = function (name, def) { defs[name] = def; return def; };
  Art.sprite = function (name, o) {
    const d = defs[name];
    if (!d) return null;
    o = o || {};
    return Art.get(name, d.art, d.pal, o.scale || 1, o.flip, o.tint);
  };

  Art.flip = function (canvas) {
    const c = makeCanvas(canvas.width, canvas.height);
    const g = c.getContext("2d");
    g.translate(canvas.width, 0); g.scale(-1, 1);
    g.drawImage(canvas, 0, 0);
    return c;
  };
  Art.flipY = function (canvas) {
    const c = makeCanvas(canvas.width, canvas.height);
    const g = c.getContext("2d");
    g.translate(0, canvas.height); g.scale(1, -1);
    g.drawImage(canvas, 0, 0);
    return c;
  };
  // Tint: overlay clipped to the sprite alpha
  Art.tint = function (canvas, color, alpha) {
    const c = makeCanvas(canvas.width, canvas.height);
    const g = c.getContext("2d");
    g.drawImage(canvas, 0, 0);
    g.globalCompositeOperation = "source-atop";
    g.globalAlpha = alpha === undefined ? 0.6 : alpha;
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  };
  Art.silhouette = function (canvas, color) { return Art.tint(canvas, color || "#000", 1); };

  // -------------------------------------------------------------
  // 3. Primitive painting helpers (fillRect only)
  // -------------------------------------------------------------
  Art.px = function (ctx, x, y, c) { if (!c) return; ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, 1, 1); };
  Art.rect = function (ctx, x, y, w, h, c) { if (!c) return; ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
  Art.hline = function (ctx, x, y, w, c) { Art.rect(ctx, x, y, w, 1, c); };
  Art.vline = function (ctx, x, y, h, c) { Art.rect(ctx, x, y, 1, h, c); };
  Art.fill = function (ctx, c, w, h) { Art.rect(ctx, 0, 0, w || ART, h || ART, c); };
  Art.frame = function (ctx, x, y, w, h, c) {
    Art.rect(ctx, x, y, w, 1, c); Art.rect(ctx, x, y + h - 1, w, 1, c);
    Art.rect(ctx, x, y, 1, h, c); Art.rect(ctx, x + w - 1, y, 1, h, c);
  };
  // Bevel: light top/left, dark bottom/right — reads as a raised block at 2x.
  Art.bevel = function (ctx, x, y, w, h, light, dark) {
    Art.rect(ctx, x, y, w - 1, 1, light); Art.rect(ctx, x, y, 1, h - 1, light);
    Art.rect(ctx, x + w - 1, y, 1, h, dark); Art.rect(ctx, x, y + h - 1, w, 1, dark);
  };
  // Vertical / horizontal ramps, one fillRect per row/column.
  Art.vgrad = function (ctx, x, y, w, h, top, bot) {
    for (let j = 0; j < h; j++) { ctx.fillStyle = U.mix(top, bot, h <= 1 ? 0 : j / (h - 1)); ctx.fillRect(x, y + j, w, 1); }
  };
  Art.hgrad = function (ctx, x, y, w, h, left, right) {
    for (let i = 0; i < w; i++) { ctx.fillStyle = U.mix(left, right, w <= 1 ? 0 : i / (w - 1)); ctx.fillRect(x + i, y, 1, h); }
  };

  // Ascii block painter: draws rows of chars straight into ctx with
  // run-length merged fillRects. '.' and ' ' are transparent.
  Art.ascii = function (ctx, rows, pal, ox, oy) {
    pal = pal || PAL; ox = ox || 0; oy = oy || 0;
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      let x = 0;
      while (x < row.length) {
        const ch = row.charAt(x);
        let n = 1;
        while (x + n < row.length && row.charAt(x + n) === ch) n++;
        if (ch !== "." && ch !== " ") {
          const c = pal[ch];
          if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, n, 1); }
        }
        x += n;
      }
    }
  };

  // -------------------------------------------------------------
  // 4. Pattern helpers
  // -------------------------------------------------------------
  Art.checker = function (ctx, x, y, w, h, a, b, size) {
    size = size || 1;
    for (let j = 0; j < h; j += size) for (let i = 0; i < w; i += size) {
      const c = ((((i / size) | 0) + ((j / size) | 0)) & 1) ? b : a;
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x + i, y + j, Math.min(size, w - i), Math.min(size, h - j));
    }
  };

  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  Art.BAYER4 = BAYER4;
  // level 0..16 = density of `color` sprinkled over the area (ordered dither).
  Art.dither = function (ctx, x, y, w, h, color, level) {
    if (!color || level <= 0) return;
    ctx.fillStyle = color;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (BAYER4[(((y + j) & 3) << 2) | ((x + i) & 3)] < level) ctx.fillRect(x + i, y + j, 1, 1);
    }
  };

  // Random specks (seeded) — texture for soil, stone, salt, gravel.
  Art.speckle = function (ctx, rnd, x, y, w, h, colors, n) {
    for (let i = 0; i < n; i++) {
      const c = colors[(rnd() * colors.length) | 0];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x + ((rnd() * w) | 0), y + ((rnd() * h) | 0), 1, 1);
    }
  };

  // Brick courses with mortar joints and per-brick colour variation.
  Art.bricks = function (ctx, o) {
    const x = o.x | 0, y = o.y | 0, w = o.w | 0, h = o.h | 0;
    const bw = o.bw || 8, bh = o.bh || 4, rnd = o.rnd;
    Art.rect(ctx, x, y, w, h, o.mortar);
    let row = 0;
    for (let yy = y; yy < y + h; yy += bh, row++) {
      const off = (row & 1) ? -((bw / 2) | 0) : 0;
      for (let bx = off; bx < w; bx += bw) {
        let face = o.face;
        if (rnd) { const r = rnd(); face = r < 0.16 ? (o.dark || o.face) : (r > 0.84 ? (o.light || o.face) : o.face); }
        const x0 = Math.max(x + bx, x), x1 = Math.min(x + bx + bw - 1, x + w);
        const hh = Math.min(bh - 1, y + h - yy);
        if (x1 > x0 && hh > 0) Art.rect(ctx, x0, yy, x1 - x0, hh, face);
      }
    }
  };

  // Rough-coursed stone: irregular blocks, chunkier than bricks.
  Art.stonework = function (ctx, o) {
    const x = o.x | 0, y = o.y | 0, w = o.w | 0, h = o.h | 0, rnd = o.rnd;
    const bh = o.bh || 5;
    Art.rect(ctx, x, y, w, h, o.mortar);
    let row = 0;
    for (let yy = y; yy < y + h; yy += bh, row++) {
      let bx = row & 1 ? -3 : 0;
      while (bx < w) {
        const bw = 5 + ((rnd() * 5) | 0);
        const r = rnd();
        const face = r < 0.25 ? o.dark : (r > 0.75 ? o.light : o.face);
        const x0 = Math.max(x + bx, x), x1 = Math.min(x + bx + bw - 1, x + w);
        const hh = Math.min(bh - 1, y + h - yy);
        if (x1 > x0 && hh > 0) {
          Art.rect(ctx, x0, yy, x1 - x0, hh, face);
          if (hh > 1) Art.rect(ctx, x0, yy, x1 - x0, 1, U.shade(face, 1.14));
        }
        bx += bw;
      }
    }
  };

  // Timber planks (dir 'h' or 'v') with grain and joints.
  Art.planks = function (ctx, o) {
    const x = o.x | 0, y = o.y | 0, w = o.w | 0, h = o.h | 0, rnd = o.rnd;
    const pw = o.pw || 5, dir = o.dir || "h";
    Art.rect(ctx, x, y, w, h, o.face);
    if (dir === "h") {
      for (let yy = y; yy < y + h; yy += pw) {
        Art.rect(ctx, x, yy, w, 1, o.light || U.shade(o.face, 1.15));
        Art.rect(ctx, x, Math.min(yy + pw - 1, y + h - 1), w, 1, o.dark);
        if (rnd) for (let i = 0; i < 2; i++) Art.rect(ctx, x + ((rnd() * w) | 0), yy + 1 + ((rnd() * Math.max(1, pw - 2)) | 0), 2, 1, o.grain || o.dark);
      }
    } else {
      for (let xx = x; xx < x + w; xx += pw) {
        Art.rect(ctx, xx, y, 1, h, o.light || U.shade(o.face, 1.15));
        Art.rect(ctx, Math.min(xx + pw - 1, x + w - 1), y, 1, h, o.dark);
        if (rnd) for (let i = 0; i < 2; i++) Art.rect(ctx, xx + 1 + ((rnd() * Math.max(1, pw - 2)) | 0), y + ((rnd() * h) | 0), 1, 2, o.grain || o.dark);
      }
    }
  };

  // Roof courses. style: 'slate' (rectangular tabs), 'tile' (pantile
  // scallops), 'thatch' (combed straw), 'metal' (corrugated).
  Art.roof = function (ctx, o) {
    const x = o.x | 0, y = o.y | 0, w = o.w | 0, h = o.h | 0, rnd = o.rnd;
    const style = o.style || "slate";
    Art.rect(ctx, x, y, w, h, o.face);
    if (style === "metal") {
      for (let i = 0; i < w; i += 3) {
        Art.rect(ctx, x + i, y, 1, h, o.light);
        Art.rect(ctx, x + i + 2, y, 1, h, o.dark);
      }
      return;
    }
    if (style === "thatch") {
      for (let i = 0; i < w; i++) {
        const r = rnd ? rnd() : 0.5;
        const c = r < 0.3 ? o.dark : (r > 0.7 ? o.light : o.face);
        Art.rect(ctx, x + i, y, 1, h, c);
      }
      for (let yy = y + 3; yy < y + h; yy += 5) Art.rect(ctx, x, yy, w, 1, o.dark);
      return;
    }
    const th = o.th || 4, tw = o.tw || 5;
    let row = 0;
    for (let yy = y; yy < y + h; yy += th, row++) {
      const off = (row & 1) ? -((tw / 2) | 0) : 0;
      for (let bx = off; bx < w; bx += tw) {
        const r = rnd ? rnd() : 0.5;
        const face = r < 0.18 ? o.dark : (r > 0.82 ? o.light : o.face);
        const x0 = Math.max(x + bx, x), x1 = Math.min(x + bx + tw, x + w);
        const hh = Math.min(th, y + h - yy);
        if (x1 <= x0 || hh <= 0) continue;
        if (style === "tile") {
          // pantile: rounded top, shadow gutter down the left
          Art.rect(ctx, x0, yy + 1, x1 - x0, hh - 1, face);
          Art.rect(ctx, x0 + 1, yy, Math.max(1, x1 - x0 - 2), 1, U.shade(face, 1.18));
          Art.rect(ctx, x0, yy + 1, 1, hh - 1, o.dark);
        } else {
          Art.rect(ctx, x0, yy, x1 - x0 - 1, hh - 1, face);
        }
      }
      Art.rect(ctx, x, Math.min(yy + th - 1, y + h - 1), w, 1, o.shadow || o.dark);
    }
  };

  // Water ripples: `frame` 0..3, seamless-ish horizontal drift.
  Art.ripples = function (ctx, frame, o) {
    const w = o.w || ART, h = o.h || ART, x = o.x || 0, y = o.y || 0;
    const f = (frame | 0) & 3;
    Art.vgrad(ctx, x, y, w, h, o.top || o.face, o.face);
    if (o.dither) Art.dither(ctx, x, y, w, h, o.dark, 5);
    const rows = o.rows || [2, 6, 9, 13];
    for (let i = 0; i < rows.length; i++) {
      const ry = y + rows[i];
      if (ry < y || ry >= y + h) continue;
      const drift = (f * (i & 1 ? -3 : 3) + i * 5 + (o.phase || 0)) % w;
      const d = drift < 0 ? drift + w : drift;
      const len = o.len || 4;
      Art.rect(ctx, x + d, ry, Math.min(len, w - d), 1, o.light);
      if (d + len > w) Art.rect(ctx, x, ry, (d + len) - w, 1, o.light);
      const d2 = (d + 8) % w;
      Art.rect(ctx, x + d2, ry + 1 < y + h ? ry + 1 : ry, Math.min(2, w - d2), 1, o.hi || o.light);
    }
  };

  // A grass tuft: three blades, seeded lean.
  Art.tuft = function (ctx, x, y, dark, mid, light, h) {
    h = h || 3;
    Art.rect(ctx, x, y - h + 1, 1, h, dark);
    Art.rect(ctx, x + 1, y - h + 2, 1, h - 1, mid);
    if (light) Art.rect(ctx, x - 1, y - h + 2, 1, h - 2 > 0 ? h - 2 : 1, light);
  };

  // Autotile-ish rim: darken/lighten the given edges of a tile.
  // sides = string containing any of 'n','s','e','w'.
  Art.edge = function (ctx, sides, color, alpha, w, h) {
    w = w || ART; h = h || ART;
    const a = ctx.globalAlpha;
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (sides.indexOf("n") >= 0) ctx.fillRect(0, 0, w, 1);
    if (sides.indexOf("s") >= 0) ctx.fillRect(0, h - 1, w, 1);
    if (sides.indexOf("w") >= 0) ctx.fillRect(0, 0, 1, h);
    if (sides.indexOf("e") >= 0) ctx.fillRect(w - 1, 0, 1, h);
    ctx.globalAlpha = a;
  };

  // Soft drop shadow ellipse-ish blob (rows of fillRect), for entities/objects.
  Art.shadow = function (ctx, cx, cy, rw, rh, alpha, color) {
    const a = ctx.globalAlpha;
    ctx.globalAlpha = alpha === undefined ? 0.25 : alpha;
    ctx.fillStyle = color || "#000";
    for (let j = -rh; j <= rh; j++) {
      const t = rh === 0 ? 0 : j / rh;
      const half = Math.round(rw * Math.sqrt(Math.max(0, 1 - t * t)));
      if (half <= 0) continue;
      ctx.fillRect(cx - half, cy + j, half * 2, 1);
    }
    ctx.globalAlpha = a;
  };

  // Warm interior glow behind a lit window / lamp.
  Art.glow = function (ctx, cx, cy, r, color, alpha) {
    const a = ctx.globalAlpha;
    ctx.fillStyle = color || C.lamp;
    for (let k = r; k >= 1; k--) {
      ctx.globalAlpha = (alpha === undefined ? 0.16 : alpha) * (1 - (k - 1) / r);
      ctx.fillRect(cx - k, cy - k, k * 2, k * 2);
    }
    ctx.globalAlpha = a;
  };

  // -------------------------------------------------------------
  // 5. Post-process: outline / drop shadow on a baked canvas
  // -------------------------------------------------------------
  function alphaMask(canvas) {
    const g = canvas.getContext("2d");
    let img = null;
    try { img = g.getImageData(0, 0, canvas.width, canvas.height); } catch (e) { return null; }
    if (!img || !img.data) return null;
    return img;
  }

  // Returns a NEW canvas with a 1px outline painted behind the artwork.
  // Degrades to a copy when pixel readback is unavailable (headless stubs).
  Art.outline = function (canvas, color, diagonal) {
    const w = canvas.width, h = canvas.height;
    const out = makeCanvas(w, h);
    const g = out.getContext("2d");
    const img = alphaMask(canvas);
    if (img) {
      const d = img.data;
      g.fillStyle = color || C.ink;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > 8) continue;
        let near = false;
        for (let j = -1; j <= 1 && !near; j++) for (let i = -1; i <= 1; i++) {
          if (!i && !j) continue;
          if (!diagonal && i && j) continue;
          const nx = x + i, ny = y + j;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (d[(ny * w + nx) * 4 + 3] > 8) { near = true; break; }
        }
        if (near) g.fillRect(x, y, 1, 1);
      }
    }
    g.drawImage(canvas, 0, 0);
    return out;
  };

  // Returns a NEW canvas with a soft shadow under the artwork.
  Art.dropShadow = function (canvas, dx, dy, alpha, color) {
    const out = makeCanvas(canvas.width, canvas.height);
    const g = out.getContext("2d");
    const sil = Art.silhouette(canvas, color || "#000");
    g.globalAlpha = alpha === undefined ? 0.35 : alpha;
    g.drawImage(sil, dx === undefined ? 1 : dx, dy === undefined ? 1 : dy);
    g.globalAlpha = 1;
    g.drawImage(canvas, 0, 0);
    return out;
  };

  // -------------------------------------------------------------
  // 6. Type-keyed generator palettes (used by procedural monster art)
  // -------------------------------------------------------------
  Art.TYPE_PALETTES = {
    normal: ["#c8b088", "#8a7a5a", "#f0e0c0"], fire: ["#e8763a", "#a83c14", "#f8c84a"], water: ["#4a8ad8", "#25538f", "#9fd3f8"],
    grass: ["#5aab46", "#2e6d22", "#a5d6a7"], electric: ["#f0c830", "#a8821a", "#f8ec90"], flying: ["#9a8ade", "#5a4a9e", "#d8d0f8"],
    bug: ["#a8b830", "#6a7a1a", "#d8e070"], poison: ["#9a4aaa", "#5c2468", "#d090e0"], rock: ["#a89468", "#6a5c3a", "#e0d4b8"],
    ground: ["#d0a050", "#8a6428", "#ecd09a"], psychic: ["#e8709a", "#98325a", "#f8c0d8"], ghost: ["#7a5aa8", "#41306a", "#c0aae8"],
    cyber: ["#28c8a0", "#0e7a62", "#a0f8e0"]
  };

  Art.warm = function () { if (MQ.Tiles && MQ.Tiles.warm) MQ.Tiles.warm(); };
  Art.stats = function () { return { cached: cache.size, hits: cacheHits }; };
  Art.clearCache = function () { cache.clear(); };

  MQ.Art = Art;
})();
