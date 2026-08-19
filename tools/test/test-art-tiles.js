// MonsterQuest v2 — art/tiles tests.
// The headless canvas stub only records calls, so this file installs a tiny
// software rasteriser (fillRect / drawImage / getImageData with alpha) into
// the vm's document.createElement. Every painter in js/art/tiles.js is
// fillRect-only by design, so the bake is pixel-exact here.
"use strict";
const H = require("../headless");

// ---- software canvas -------------------------------------------------
function parseColor(c) {
  if (typeof c !== "string") return [0, 0, 0, 255];
  if (c.charAt(0) === "#") {
    let h = c.slice(1);
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (m) {
    const p = m[1].split(",").map(function (s) { return parseFloat(s); });
    return [p[0] | 0, p[1] | 0, p[2] | 0, p.length > 3 ? Math.round(p[3] * 255) : 255];
  }
  return [255, 0, 255, 255];
}

function swCanvas() {
  const c = { width: 300, height: 150, style: {}, tagName: "CANVAS", _data: null, _w: 0, _h: 0 };
  c._px = function () {
    if (!c._data || c._w !== c.width || c._h !== c.height) {
      c._data = new Uint8ClampedArray(Math.max(1, c.width) * Math.max(1, c.height) * 4);
      c._w = c.width; c._h = c.height;
    }
    return c._data;
  };
  c.getContext = function () { return c._ctx || (c._ctx = swCtx(c)); };
  c.addEventListener = function () {};
  c.removeEventListener = function () {};
  c.getBoundingClientRect = function () { return { left: 0, top: 0, width: c.width, height: c.height }; };
  c.toDataURL = function () { return "data:,"; };
  return c;
}

function swCtx(canvas) {
  const st = { fillStyle: "#000", globalAlpha: 1, gco: "source-over", tx: 0, ty: 0, sx: 1, sy: 1, smooth: false };
  const stack = [];
  function blend(d, i, r, g, b, a, gco) {
    if (a <= 0) return;
    if (gco === "source-atop" && d[i + 3] === 0) return;
    const sa = a / 255, da = d[i + 3] / 255;
    const out = sa + da * (1 - sa);
    if (out <= 0) return;
    d[i] = (r * sa + d[i] * da * (1 - sa)) / out;
    d[i + 1] = (g * sa + d[i + 1] * da * (1 - sa)) / out;
    d[i + 2] = (b * sa + d[i + 2] * da * (1 - sa)) / out;
    d[i + 3] = gco === "source-atop" ? d[i + 3] : Math.round(out * 255);
  }
  const ctx = {
    canvas: canvas,
    get fillStyle() { return st.fillStyle; }, set fillStyle(v) { st.fillStyle = v; },
    get strokeStyle() { return st.fillStyle; }, set strokeStyle(v) { st.fillStyle = v; },
    get globalAlpha() { return st.globalAlpha; }, set globalAlpha(v) { st.globalAlpha = v; },
    get globalCompositeOperation() { return st.gco; }, set globalCompositeOperation(v) { st.gco = v; },
    get imageSmoothingEnabled() { return st.smooth; }, set imageSmoothingEnabled(v) { st.smooth = v; },
    lineWidth: 1, font: "", textAlign: "left", textBaseline: "top"
  };
  ctx.save = function () { stack.push({ fillStyle: st.fillStyle, globalAlpha: st.globalAlpha, gco: st.gco, tx: st.tx, ty: st.ty, sx: st.sx, sy: st.sy }); };
  ctx.restore = function () { const s = stack.pop(); if (s) { st.fillStyle = s.fillStyle; st.globalAlpha = s.globalAlpha; st.gco = s.gco; st.tx = s.tx; st.ty = s.ty; st.sx = s.sx; st.sy = s.sy; } };
  ctx.translate = function (x, y) { st.tx += x * st.sx; st.ty += y * st.sy; };
  ctx.scale = function (x, y) { st.sx *= x; st.sy *= y; };
  ctx.setTransform = function () { st.tx = 0; st.ty = 0; st.sx = 1; st.sy = 1; };
  ctx.resetTransform = ctx.setTransform;
  function mapRect(x, y, w, h) {
    let x0 = st.tx + x * st.sx, x1 = st.tx + (x + w) * st.sx;
    let y0 = st.ty + y * st.sy, y1 = st.ty + (y + h) * st.sy;
    if (x1 < x0) { const t = x0; x0 = x1; x1 = t; }
    if (y1 < y0) { const t = y0; y0 = y1; y1 = t; }
    return [Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1)];
  }
  ctx.fillRect = function (x, y, w, h) {
    const d = canvas._px(), col = parseColor(st.fillStyle);
    const a = Math.round(col[3] * st.globalAlpha);
    const r = mapRect(x, y, w, h);
    for (let py = Math.max(0, r[1]); py < Math.min(canvas.height, r[3]); py++) {
      for (let pxx = Math.max(0, r[0]); pxx < Math.min(canvas.width, r[2]); pxx++) {
        blend(d, (py * canvas.width + pxx) * 4, col[0], col[1], col[2], a, st.gco);
      }
    }
  };
  ctx.clearRect = function (x, y, w, h) {
    const d = canvas._px(), r = mapRect(x, y, w, h);
    for (let py = Math.max(0, r[1]); py < Math.min(canvas.height, r[3]); py++)
      for (let pxx = Math.max(0, r[0]); pxx < Math.min(canvas.width, r[2]); pxx++) {
        const i = (py * canvas.width + pxx) * 4;
        d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0;
      }
  };
  ctx.drawImage = function (img, dx, dy) {
    if (!img || !img._px) return;
    dx = dx || 0; dy = dy || 0;
    const src = img._px(), d = canvas._px();
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + x) * 4;
      const a = Math.round(src[si + 3] * st.globalAlpha);
      if (!a) continue;
      const r = mapRect(dx + x, dy + y, 1, 1);
      const px2 = r[0], py2 = r[1];
      if (px2 < 0 || py2 < 0 || px2 >= canvas.width || py2 >= canvas.height) continue;
      blend(d, (py2 * canvas.width + px2) * 4, src[si], src[si + 1], src[si + 2], a, st.gco);
    }
  };
  ctx.getImageData = function (x, y, w, h) {
    const d = canvas._px(), out = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const sx2 = x + i, sy2 = y + j;
      if (sx2 < 0 || sy2 < 0 || sx2 >= canvas.width || sy2 >= canvas.height) continue;
      const si = (sy2 * canvas.width + sx2) * 4, di = (j * w + i) * 4;
      out[di] = d[si]; out[di + 1] = d[si + 1]; out[di + 2] = d[si + 2]; out[di + 3] = d[si + 3];
    }
    return { width: w, height: h, data: out };
  };
  ctx.putImageData = function () {};
  ctx.createImageData = function (w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; };
  ctx.measureText = function (s) { return { width: (s || "").length * 8 }; };
  ctx.createPattern = function () { return {}; };
  ["beginPath", "closePath", "moveTo", "lineTo", "arc", "arcTo", "rect", "fill", "stroke", "clip", "rotate",
    "fillText", "strokeText", "strokeRect", "ellipse", "quadraticCurveTo", "bezierCurveTo"].forEach(function (m) { ctx[m] = function () {}; });
  ctx.createLinearGradient = ctx.createRadialGradient = function () { return { addColorStop: function () {} }; };
  return ctx;
}

function install(env) {
  const inner = env.document.createElement;
  env.document.createElement = function (tag) {
    if (tag === "canvas") return swCanvas();
    return inner(tag);
  };
  if (env.MQ.Tiles) env.MQ.Tiles.clearCache();
  if (env.MQ.Art) env.MQ.Art.clearCache();
}

function stats(canvas) {
  const d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  let opaque = 0, any = 0, colours = {};
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] > 0) any++;
    if (d[i + 3] > 200) opaque++;
    if (d[i + 3] > 0) colours[d[i] + "," + d[i + 1] + "," + d[i + 2]] = 1;
  }
  return { opaque: opaque, any: any, total: d.length / 4, colours: Object.keys(colours).length };
}
function digest(canvas) {
  const d = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  let h = 2166136261;
  for (let i = 0; i < d.length; i++) { h ^= d[i]; h = (h * 16777619) >>> 0; }
  return h;
}

module.exports = function (t, assert) {
  const env = H.load();
  install(env);
  const MQ = env.MQ;
  const Tiles = MQ.Tiles, Art = MQ.Art;
  const ids = Tiles.ids();

  t("catalogue: 288 named tiles, every one has a real painter", function () {
    assert.strictEqual(ids.length, 296, "tile count changed (288 catalogue + 8 art additions)");
    assert.deepStrictEqual(Array.from(Tiles.unpainted()), [], "tiles without painters");
    ["grass", "grass_tall", "path_cobble", "water_canal", "tree_oak", "wall_brick_red",
      "roof_slate", "door_wood", "window_lit", "mill_wheel", "dish", "moai", "healer",
      "salt_flat", "brine_pool", "rail_track_h", "cross_saxon", "white_nancy"].forEach(function (id) {
      assert.ok(Tiles.has(id), "missing canonical id " + id);
    });
  });

  t("every tile renders every frame and variant without throwing, 16x16", function () {
    let baked = 0;
    ids.forEach(function (id) {
      const d = Tiles.props(id);
      const frames = Tiles.frames(id);
      for (let f = 0; f < frames; f++) {
        for (let v = 0; v < d.variants; v++) {
          const c = Tiles.get(id, f, v);
          assert.ok(c, "no canvas for " + id);
          assert.strictEqual(c.width, MQ.ART, id + " width");
          assert.strictEqual(c.height, MQ.ART, id + " height");
          baked++;
        }
      }
    });
    assert.ok(baked >= 288, "baked " + baked);
  });

  t("ground-layer tiles are fully opaque (no holes in the world)", function () {
    const bad = [];
    ids.forEach(function (id) {
      const d = Tiles.props(id);
      if (d.layer !== "ground") return;
      const s = stats(Tiles.get(id, 0, 0));
      if (s.opaque < s.total) bad.push(id + " (" + s.opaque + "/" + s.total + ")");
    });
    assert.deepStrictEqual(bad, [], "ground tiles with transparent pixels");
  });

  t("solid tiles all have non-transparent pixels", function () {
    const bad = [];
    ids.forEach(function (id) {
      if (!Tiles.props(id).solid) return;
      const s = stats(Tiles.get(id, 0, 0));
      if (s.any < 24) bad.push(id + " (" + s.any + ")");
    });
    assert.deepStrictEqual(bad, [], "solid tiles that are (near) empty");
  });

  t("deco / over tiles draw something", function () {
    const bad = [];
    ids.forEach(function (id) {
      const d = Tiles.props(id);
      if (d.layer === "ground") return;
      const s = stats(Tiles.get(id, 0, 0));
      if (s.any < 6) bad.push(id + " (" + s.any + ")");
    });
    assert.deepStrictEqual(bad, [], "deco/over tiles with no art");
  });

  t("tiles are textured, not flat colour blocks", function () {
    const flat = [];
    ids.forEach(function (id) {
      if (id === "void" || id === "shadow") return;
      const s = stats(Tiles.get(id, 0, 0));
      if (s.colours < 3) flat.push(id + " (" + s.colours + " colours)");
    });
    assert.deepStrictEqual(flat, [], "tiles with fewer than 3 colours");
  });

  t("animated tiles actually change between frames", function () {
    const same = [];
    ids.forEach(function (id) {
      const n = Tiles.frames(id);
      if (n < 2) return;
      const a = digest(Tiles.get(id, 0, 0));
      let differs = false;
      for (let f = 1; f < n; f++) if (digest(Tiles.get(id, f, 0)) !== a) { differs = true; break; }
      if (!differs) same.push(id);
    });
    assert.deepStrictEqual(same, [], "animated tiles whose frames are identical");
  });

  t("variant tiles actually differ", function () {
    const same = [];
    ids.forEach(function (id) {
      const n = Tiles.variants(id);
      if (n < 2) return;
      const a = digest(Tiles.get(id, 0, 0));
      let differs = false;
      for (let v = 1; v < n; v++) if (digest(Tiles.get(id, 0, v)) !== a) { differs = true; break; }
      if (!differs) same.push(id);
    });
    assert.deepStrictEqual(same, [], "variant tiles whose variants are identical");
  });

  t("get() is cached, wraps out-of-range frames/variants, and is stable", function () {
    const a = Tiles.get("grass", 0, 0);
    assert.strictEqual(Tiles.get("grass", 0, 0), a, "not cached");
    assert.strictEqual(Tiles.get("grass", 5, 3), Tiles.get("grass", 0, 0), "frame/variant wrap");
    assert.strictEqual(Tiles.get("water", 4, 0), Tiles.get("water", 0, 0), "anim wrap");
    assert.strictEqual(Tiles.get("water", -1, 0), Tiles.get("water", 3, 0), "negative frame wrap");
    assert.strictEqual(Tiles.get("no_such_tile", 0, 0), null);
    const before = digest(a);
    Tiles.clearCache();
    const b = Tiles.get("grass", 0, 0);
    assert.notStrictEqual(b, a, "cache not cleared");
    assert.strictEqual(digest(b), before, "painters are not deterministic");
  });

  t("warm() prebakes every frame of every variant", function () {
    Tiles.clearCache();
    const st = Tiles.warm();
    let expect = 0;
    ids.forEach(function (id) { expect += Tiles.frames(id) * Tiles.props(id).variants; });
    assert.strictEqual(st.tiles, 296);
    assert.strictEqual(st.baked, expect, "warm() missed some");
  });

  t("tile properties survived the repaint (world/maps contract)", function () {
    assert.strictEqual(Tiles.props("grass_tall").grass, true);
    assert.strictEqual(Tiles.props("grass_tall").encounter, "grass");
    assert.strictEqual(Tiles.props("water_canal").water, true);
    assert.strictEqual(Tiles.props("water_canal").encounter, "water");
    assert.strictEqual(Tiles.props("tree_oak_top").layer, "over");
    assert.strictEqual(Tiles.props("lamp").layer, "deco");
    assert.strictEqual(Tiles.props("ledge_down").ledge, "down");
    assert.strictEqual(Tiles.props("healer").interact, "machine");
    assert.strictEqual(Tiles.props("window_lit").light, true);
    assert.strictEqual(Tiles.isSolid("wall_brick_red"), true);
    assert.strictEqual(Tiles.isSolid("water"), true, "water blocks without the boat ability");
    assert.strictEqual(Tiles.isSolid("grass"), false);
    assert.strictEqual(Tiles.frames("water"), 4);
    assert.strictEqual(Tiles.variants("grass"), 3);
  });

  // ---- MQ.Art toolkit ------------------------------------------------
  t("Art.ascii paints run-length rows from the shared palette", function () {
    const c = Art.canvas(16, 16);
    const g = c.getContext("2d");
    Art.ascii(g, ["bbbbbbbbbbbbbbbb", "................"], Art.PAL, 0, 0);
    const s = stats(c);
    assert.strictEqual(s.any, 16, "one row of 16 painted");
    const d = g.getImageData(0, 0, 16, 1).data;
    assert.strictEqual(d[3], 255);
  });

  t("Art pattern helpers produce texture", function () {
    const c = Art.canvas(16, 16), g = c.getContext("2d");
    Art.bricks(g, { x: 0, y: 0, w: 16, h: 16, bw: 8, bh: 4, face: "#a04838", dark: "#6f2f26", light: "#b96150", mortar: "#c9b79c" });
    let s = stats(c);
    assert.strictEqual(s.opaque, 256, "bricks fill the tile");
    assert.ok(s.colours >= 2, "bricks + mortar");

    const c2 = Art.canvas(16, 16), g2 = c2.getContext("2d");
    Art.checker(g2, 0, 0, 16, 16, "#000000", "#ffffff", 8);
    assert.strictEqual(stats(c2).colours, 2);

    const c3 = Art.canvas(16, 16), g3 = c3.getContext("2d");
    Art.dither(g3, 0, 0, 16, 16, "#ffffff", 8);
    const s3 = stats(c3);
    assert.strictEqual(s3.any, 128, "bayer level 8 covers half the area");

    const c4 = Art.canvas(16, 16), g4 = c4.getContext("2d");
    Art.vgrad(g4, 0, 0, 16, 16, "#000000", "#ffffff");
    assert.ok(stats(c4).colours >= 8, "gradient ramps");
  });

  t("Art.ramp / pal / palette", function () {
    const r = Art.ramp("#808080", 5);
    assert.strictEqual(r.length, 5);
    assert.notStrictEqual(r[0], r[4]);
    assert.ok(Art.C.brick && Art.C.slate && Art.C.canal && Art.C.mustard, "Cheshire palette present");
    const p = Art.pal({ "b": "#ffffff" });
    assert.strictEqual(p.b, "#ffffff");
    assert.strictEqual(Art.PAL.b, Art.C.brick, "pal() must not mutate the shared palette");
    assert.strictEqual(p.g, Art.PAL.g, "pal() inherits the rest");
  });

  t("Art.outline / dropShadow / tint / silhouette / flip", function () {
    const c = Art.canvas(8, 8), g = c.getContext("2d");
    Art.rect(g, 3, 3, 2, 2, "#ff0000");
    const before = stats(c).any;
    const o = Art.outline(c, "#000000");
    assert.ok(stats(o).any > before, "outline adds pixels");
    assert.strictEqual(o.width, 8);

    const sh = Art.dropShadow(c, 1, 1, 0.5);
    assert.ok(stats(sh).any > before, "shadow adds pixels");

    const ti = Art.tint(c, "#0000ff", 1);
    const td = ti.getContext("2d").getImageData(3, 3, 1, 1).data;
    assert.strictEqual(td[2], 255, "tint applied inside the sprite");
    const outside = ti.getContext("2d").getImageData(0, 0, 1, 1).data;
    assert.strictEqual(outside[3], 0, "tint must not leak outside the alpha");

    const si = Art.silhouette(c, "#000000");
    assert.strictEqual(stats(si).any, before);

    const c2 = Art.canvas(8, 8);
    Art.rect(c2.getContext("2d"), 0, 0, 2, 8, "#ff0000");
    const fl = Art.flip(c2);
    assert.strictEqual(fl.getContext("2d").getImageData(7, 0, 1, 1).data[3], 255, "flipped to the right edge");
    assert.strictEqual(fl.getContext("2d").getImageData(0, 0, 1, 1).data[3], 0);
  });

  t("Art.shadow / glow paint soft blobs without leaving alpha at 1", function () {
    const c = Art.canvas(16, 16), g = c.getContext("2d");
    Art.shadow(g, 8, 8, 6, 3, 0.3);
    const s = stats(c);
    assert.ok(s.any > 20 && s.any < 256, "elliptical blob");
    assert.strictEqual(g.globalAlpha, 1, "globalAlpha restored");
    Art.glow(g, 8, 8, 4, "#ffd98a", 0.2);
    assert.strictEqual(g.globalAlpha, 1, "globalAlpha restored after glow");
  });

  t("Art.render / get keeps the legacy ascii sprite API working", function () {
    const art = ["ab", "ba"];
    const pal = { a: "#ff0000", b: "#00ff00" };
    const c = Art.get("test_sprite", art, pal, 2);
    assert.strictEqual(c.width, 4);
    assert.strictEqual(c.height, 4);
    assert.strictEqual(Art.get("test_sprite", art, pal, 2), c, "cached");
    assert.ok(Art.stats().cached >= 1);
  });
};
