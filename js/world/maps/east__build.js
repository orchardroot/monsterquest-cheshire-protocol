// =============================================================
// MonsterQuest v2 — MQ.EastBuild: layer-painting helpers for the
// region-east map files. Pure string/array work at parse time: every
// map still ships as an ENGINE §5.2 `layers` block of strings with a
// legend of MQ.Tiles ids. Nothing here runs game logic.
// Owned by region-east (js/world/maps/east*.js).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const B = {};

  const LK = { g: "ground", d: "deco", o: "over" };

  function blank(w, h, ch) {
    const rows = [];
    for (let y = 0; y < h; y++) {
      const r = new Array(w);
      for (let x = 0; x < w; x++) r[x] = ch;
      rows.push(r);
    }
    return rows;
  }

  function Canvas(w, h, fill) {
    this.w = w; this.h = h;
    this.g = blank(w, h, fill || ".");
    this.d = blank(w, h, " ");
    this.o = blank(w, h, " ");
  }
  const P = Canvas.prototype;
  P.lay = function (l) { return this[l || "g"]; };
  P.in = function (x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; };
  P.set = function (l, x, y, ch) { if (this.in(x, y)) this.lay(l)[y][x] = ch; return this; };
  P.at = function (l, x, y) { return this.in(x, y) ? this.lay(l)[y][x] : null; };
  P.fill = function (l, x, y, w, h, ch) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(l, i, j, ch);
    return this;
  };
  P.box = function (l, x, y, w, h, ch) {
    for (let i = x; i < x + w; i++) { this.set(l, i, y, ch); this.set(l, i, y + h - 1, ch); }
    for (let j = y; j < y + h; j++) { this.set(l, x, j, ch); this.set(l, x + w - 1, j, ch); }
    return this;
  };
  P.h = function (l, x, y, n, ch) { for (let i = 0; i < n; i++) this.set(l, x + i, y, ch); return this; };
  P.v = function (l, x, y, n, ch) { for (let i = 0; i < n; i++) this.set(l, x, y + i, ch); return this; };
  // Stamp an array of strings; `skip` chars (default space) pass through.
  P.stamp = function (l, x, y, rows, skip) {
    skip = skip === undefined ? " " : skip;
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) { const c = r[i]; if (c !== skip) this.set(l, x + i, y + j, c); }
    }
    return this;
  };
  P.txt = function (l, x, y, str, skip) { return this.stamp(l, x, y, [str], skip); };
  // A diagonal / free path of points
  P.dots = function (l, pts, ch) { for (let i = 0; i < pts.length; i++) this.set(l, pts[i][0], pts[i][1], ch); return this; };
  // Deterministic scatter inside a rect, only over tiles listed in `over`.
  P.scatter = function (l, seed, ch, n, x, y, w, h, over) {
    const rnd = U.rng("east:" + seed);
    let tries = n * 40;
    let placed = 0;
    while (placed < n && tries-- > 0) {
      const i = x + Math.floor(rnd() * w), j = y + Math.floor(rnd() * h);
      if (!this.in(i, j)) continue;
      if (over && over.indexOf(this.at("g", i, j)) < 0) continue;
      if (this.at(l, i, j) === ch) continue;
      this.set(l, i, j, ch);
      placed++;
    }
    return this;
  };
  // Wobbly river/lane: walk from (x,y) in `dir` for n steps with a seeded jitter.
  P.snake = function (l, seed, ch, x, y, n, dir, width, jitter) {
    const rnd = U.rng("snake:" + seed);
    width = width || 1; jitter = jitter === undefined ? 0.35 : jitter;
    let cx = x, cy = y;
    for (let s = 0; s < n; s++) {
      for (let k = 0; k < width; k++) {
        if (dir === "v") this.set(l, cx + k, cy, ch); else this.set(l, cx, cy + k, ch);
      }
      if (dir === "v") { cy++; if (rnd() < jitter) cx += rnd() < 0.5 ? -1 : 1; }
      else { cx++; if (rnd() < jitter) cy += rnd() < 0.5 ? -1 : 1; }
      cx = U.clamp(cx, 1, this.w - width - 1); cy = U.clamp(cy, 1, this.h - width - 1);
    }
    return this;
  };

  P.rows = function (l) {
    const a = this.lay(l), out = [];
    for (let y = 0; y < this.h; y++) out.push(a[y].join(""));
    return out;
  };
  P.empty = function (l) {
    const a = this.lay(l);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (a[y][x] !== " ") return false;
    return true;
  };
  P.layers = function () {
    const out = { ground: this.rows("g") };
    if (!this.empty("d")) out.deco = this.rows("d");
    if (!this.empty("o")) out.over = this.rows("o");
    return out;
  };

  B.canvas = function (w, h, fill) { return new Canvas(w, h, fill); };

  // ---- building blocks ---------------------------------------------------
  // A terrace/house block. Two roof rows, wall rows with windows, a door on
  // the bottom row. `over` (char) draws the roof lip above the player.
  B.house = function (c, o) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    const rh = o.rh === undefined ? 2 : o.rh;
    const roof = o.roof || "R", wall = o.wall || "#", win = o.win === null ? null : (o.win || "W");
    const door = o.door || "D";
    for (let j = 0; j < rh; j++) c.h("g", x, y + j, w, roof);
    for (let j = rh; j < h; j++) c.h("g", x, y + j, w, wall);
    if (win) for (let j = rh; j < h - 1; j++) for (let i = 1; i < w - 1; i += 2) c.set("g", x + i, y + j, win);
    const dx = o.doorX === undefined ? x + Math.floor(w / 2) : x + o.doorX;
    c.set("g", dx, y + h - 1, door);
    if (o.doors) for (let k = 0; k < o.doors.length; k++) c.set("g", x + o.doors[k], y + h - 1, door);
    if (o.over) c.h("o", x, y, w, o.over);
    if (o.chimney !== undefined) c.set("g", x + o.chimney, y, o.chimneyCh || "M");
    return { door: { x: dx, y: y + h - 1 }, front: { x: dx, y: y + h } };
  };

  // A run of trees with canopy on the over layer.
  B.trees = function (c, seed, n, x, y, w, h, base, top, over) {
    const rnd = U.rng("trees:" + seed);
    let tries = n * 40, placed = 0;
    while (placed < n && tries-- > 0) {
      const i = x + Math.floor(rnd() * w), j = y + Math.floor(rnd() * h);
      if (!c.in(i, j) || !c.in(i, j - 1)) continue;
      if (over && over.indexOf(c.at("g", i, j)) < 0) continue;
      if (c.at("g", i, j) === base) continue;
      c.set("g", i, j, base);
      if (top) c.set("o", i, j - 1, top);
      placed++;
    }
    return c;
  };

  // Border the map with a solid char (routes/towns get a treeline or wall).
  B.frame = function (c, ch, th) {
    th = th || 1;
    for (let t = 0; t < th; t++) c.box("g", t, t, c.w - t * 2, c.h - t * 2, ch);
    return c;
  };

  // Fill the whole map, useful before carving.
  B.solidFill = function (c, ch) { return c.fill("g", 0, 0, c.w, c.h, ch); };

  MQ.EastBuild = B;
})();
