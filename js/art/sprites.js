// STUB — owned by art. Foundation port of the old renderArt rasteriser
// with a cache, flip and tint. The art workstream replaces/extends this file.
// =============================================================
// MonsterQuest v2 — MQ.Art: ascii-art rasteriser, palettes, cache
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

  // Rasterise rows of chars into a canvas. '.' (or ' ') = transparent.
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
  // Tint: multiply-ish overlay clipped to the sprite alpha
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
  // Silhouette (e.g. unseen dex entries, shadows)
  Art.silhouette = function (canvas, color) { return Art.tint(canvas, color || "#000", 1); };
  Art.shade = U.shade;
  Art.mix = U.mix;

  // Type-keyed generator palettes (used by procedural monster art)
  Art.TYPE_PALETTES = {
    normal: ["#c8b088", "#8a7a5a", "#f0e0c0"], fire: ["#e8763a", "#a83c14", "#f8c84a"], water: ["#4a8ad8", "#25538f", "#9fd3f8"],
    grass: ["#5aab46", "#2e6d22", "#a5d6a7"], electric: ["#f0c830", "#a8821a", "#f8ec90"], flying: ["#9a8ade", "#5a4a9e", "#d8d0f8"],
    bug: ["#a8b830", "#6a7a1a", "#d8e070"], poison: ["#9a4aaa", "#5c2468", "#d090e0"], rock: ["#a89468", "#6a5c3a", "#e0d4b8"],
    ground: ["#d0a050", "#8a6428", "#ecd09a"], psychic: ["#e8709a", "#98325a", "#f8c0d8"], ghost: ["#7a5aa8", "#41306a", "#c0aae8"],
    cyber: ["#28c8a0", "#0e7a62", "#a0f8e0"]
  };

  Art.warm = function () { /* nothing to prebuild in the stub */ };
  Art.stats = function () { return { cached: cache.size, hits: cacheHits }; };
  Art.clearCache = function () { cache.clear(); };

  MQ.Art = Art;
})();
