// STUB — owned by world. Foundation seed: MQ.World.defineMap() storing defs,
// legend resolution helpers, template(), and validate() per §5.2. The world
// workstream extends this (collision helpers, warps at runtime, overworld).
// =============================================================
// MonsterQuest v2 — MQ.World: map definitions + validation
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const maps = {};
  const templates = {};
  const World = MQ.World || {};
  World.maps = maps;
  World.templates = templates;

  World.defineMap = function (id, def) {
    if (!def || typeof def !== "object") throw new Error("defineMap(" + id + "): def required");
    def.id = id;
    if (!def.layers && def.ground) def.layers = { ground: def.ground };
    const g = def.layers && def.layers.ground;
    def.width = g && g.length ? g[0].length : 0;
    def.height = g ? g.length : 0;
    if (MQ.DEV && maps[id]) MQ.warn("[World] redefining map " + id);
    maps[id] = def;
    return def;
  };
  World.get = function (id) { return maps[id] || null; };
  World.has = function (id) { return !!maps[id]; };
  World.ids = function () { return Object.keys(maps); };
  World.each = function (fn) { const ks = Object.keys(maps); for (let i = 0; i < ks.length; i++) fn(maps[ks[i]], ks[i]); };

  // Templates: World.defineTemplate('house_small', def); World.template('house_small', overrides) → merged def
  World.defineTemplate = function (name, def) { templates[name] = def; return def; };
  World.template = function (name, overrides) {
    const t = templates[name];
    if (!t) throw new Error("World.template: unknown template " + name);
    return U.merge(t, overrides || {});
  };

  // ---- tile lookup helpers -----------------------------------------------
  World.tileAt = function (map, layer, x, y) {
    const rows = map.layers && map.layers[layer];
    if (!rows || y < 0 || y >= rows.length) return null;
    const row = rows[y];
    if (x < 0 || x >= row.length) return null;
    const ch = row[x];
    if (ch === " ") return null;
    const id = map.legend[ch];
    return id === undefined ? null : id;
  };
  World.propsAt = function (map, x, y) {
    // merged view: ground props overridden by deco/over on solid
    const T = MQ.Tiles;
    const g = World.tileAt(map, "ground", x, y);
    const d = World.tileAt(map, "deco", x, y);
    const gp = g && T ? T.props(g) : null;
    const dp = d && T ? T.props(d) : null;
    return { ground: g, deco: d, gp: gp, dp: dp };
  };
  World.inBounds = function (map, x, y) { return x >= 0 && y >= 0 && x < map.width && y < map.height; };
  World.isSolid = function (map, x, y) {
    if (!World.inBounds(map, x, y)) return true;
    const T = MQ.Tiles;
    const g = World.tileAt(map, "ground", x, y);
    if (g === null) return true;                       // void
    const gp = T ? T.props(g) : null;
    if (gp && (gp.solid || gp.water)) return true;
    const d = World.tileAt(map, "deco", x, y);
    if (d) { const dp = T ? T.props(d) : null; if (dp && (dp.solid || dp.water)) return true; }
    if (map.solid) {
      if (typeof map.solid === "function") { if (map.solid(x, y)) return true; }
      else if (map.solid.indexOf(x + "," + y) >= 0) return true;
    }
    return false;
  };
  World.isWater = function (map, x, y) {
    const T = MQ.Tiles;
    const g = World.tileAt(map, "ground", x, y);
    const gp = g && T ? T.props(g) : null;
    return !!(gp && gp.water);
  };
  World.warpAt = function (map, x, y) {
    const ws = map.warps || [];
    for (let i = 0; i < ws.length; i++) if (ws[i].x === x && ws[i].y === y) return ws[i];
    return null;
  };

  // ---- validation ------------------------------------------------------
  // validate(opts) → string[] of problems (empty = ok)
  World.validate = function (opts) {
    opts = opts || {};
    const errors = [];
    const err = function (m) { errors.push(m); };
    const T = MQ.Tiles;
    const D = MQ.Data;
    const npcScripts = (MQ.Story && MQ.Story.npcScripts) || null;
    const ids = Object.keys(maps);
    if (!ids.length) { if (!opts.allowEmpty) err("no maps defined"); return errors; }
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i], m = maps[id];
      const P = "map " + id + ": ";
      if (!m.name) err(P + "missing name");
      if (!m.legend || typeof m.legend !== "object") { err(P + "missing legend"); continue; }
      if (!m.layers || !m.layers.ground || !m.layers.ground.length) { err(P + "missing layers.ground"); continue; }
      const W = m.width, H = m.height;
      // legend resolves
      const lk = Object.keys(m.legend);
      for (let k = 0; k < lk.length; k++) {
        const tid = m.legend[lk[k]];
        if (tid === null) continue;
        if (T && !T.has(tid)) err(P + "legend '" + lk[k] + "' → unknown tile '" + tid + "'");
        if (lk[k].length !== 1) err(P + "legend key '" + lk[k] + "' must be a single char");
      }
      // layers same size and chars known
      const layerNames = Object.keys(m.layers);
      for (let l = 0; l < layerNames.length; l++) {
        const ln = layerNames[l], rows = m.layers[ln];
        if (["ground", "deco", "over"].indexOf(ln) < 0) err(P + "unknown layer '" + ln + "'");
        if (!Array.isArray(rows)) { err(P + "layer " + ln + " not an array"); continue; }
        if (rows.length !== H) err(P + "layer " + ln + " has " + rows.length + " rows, ground has " + H);
        for (let y = 0; y < rows.length; y++) {
          if (rows[y].length !== W) { err(P + "layer " + ln + " row " + y + " width " + rows[y].length + " != " + W); }
          for (let x = 0; x < rows[y].length; x++) {
            const ch = rows[y][x];
            if (ch === " ") continue;
            if (!(ch in m.legend)) { err(P + "layer " + ln + " (" + x + "," + y + ") char '" + ch + "' not in legend"); break; }
          }
        }
      }
      // warps
      const warps = m.warps || [];
      for (let w = 0; w < warps.length; w++) {
        const wp = warps[w];
        const WP = P + "warp #" + w + " (" + wp.x + "," + wp.y + "): ";
        if (!World.inBounds(m, wp.x, wp.y)) err(WP + "source out of bounds");
        if (!wp.to) { err(WP + "missing 'to'"); continue; }
        const tm = maps[wp.to];
        if (!tm) { err(WP + "target map '" + wp.to + "' does not exist"); continue; }
        if (typeof wp.tx !== "number" || typeof wp.ty !== "number") { err(WP + "missing tx/ty"); continue; }
        if (!World.inBounds(tm, wp.tx, wp.ty)) err(WP + "target (" + wp.tx + "," + wp.ty + ") out of bounds for " + wp.to + " (" + tm.width + "x" + tm.height + ")");
        else if (T && World.isSolid(tm, wp.tx, wp.ty)) err(WP + "target tile (" + wp.tx + "," + wp.ty + ") in " + wp.to + " is solid");
      }
      // edges
      if (m.edges) {
        const ek = Object.keys(m.edges);
        for (let e = 0; e < ek.length; e++) {
          const ed = m.edges[ek[e]];
          if (!ed || !maps[ed.map]) err(P + "edge " + ek[e] + " → unknown map '" + (ed && ed.map) + "'");
        }
      }
      // npcs
      const npcs = m.npcs || [];
      const seenNpc = {};
      for (let n = 0; n < npcs.length; n++) {
        const np = npcs[n];
        const NP = P + "npc " + (np.id || "#" + n) + ": ";
        if (!np.id) err(NP + "missing id");
        else if (seenNpc[np.id]) err(NP + "duplicate id"); else seenNpc[np.id] = true;
        if (!World.inBounds(m, np.x, np.y)) err(NP + "out of bounds");
        if (np.script) { if (npcScripts && !npcScripts[np.script]) err(NP + "script '" + np.script + "' not in MQ.Story.npcScripts"); }
        else if (!np.say && !np.trainer && !np.shop && !np.kind) err(NP + "needs script, say, trainer, shop or kind");
        if (np.trainer && D && D.trainers && Object.keys(D.trainers).length && !D.trainers[np.trainer]) err(NP + "trainer '" + np.trainer + "' undefined");
        if (np.cond) { try { MQ.Flags.parse(np.cond); } catch (ex) { err(NP + "bad cond: " + ex.message); } }
      }
      // triggers
      const trs = m.triggers || [];
      for (let t = 0; t < trs.length; t++) {
        const tr = trs[t];
        const TP = P + "trigger #" + t + ": ";
        if (!World.inBounds(m, tr.x, tr.y)) err(TP + "out of bounds");
        if (!tr.script) err(TP + "missing script");
        else if (npcScripts && !npcScripts[tr.script] && !(MQ.Story && MQ.Story.scripts && MQ.Story.scripts[tr.script])) err(TP + "script '" + tr.script + "' not found");
        if (tr.cond) { try { MQ.Flags.parse(tr.cond); } catch (ex) { err(TP + "bad cond: " + ex.message); } }
      }
      // encounters
      if (m.encounters && D && D.encounters) {
        const zk = Object.keys(m.encounters);
        for (let z = 0; z < zk.length; z++) {
          const tid = m.encounters[zk[z]];
          if (tid && Object.keys(D.encounters).length && !D.encounters[tid]) err(P + "encounter table '" + tid + "' (zone " + zk[z] + ") undefined");
        }
      }
      // signs / items
      const signs = m.signs || [];
      for (let s = 0; s < signs.length; s++) { if (!World.inBounds(m, signs[s].x, signs[s].y)) err(P + "sign #" + s + " out of bounds"); if (!signs[s].text) err(P + "sign #" + s + " missing text"); }
      const items = m.items || [];
      for (let s = 0; s < items.length; s++) {
        if (!World.inBounds(m, items[s].x, items[s].y)) err(P + "item #" + s + " out of bounds");
        if (items[s].item && D && D.items && Object.keys(D.items).length && !D.items[items[s].item]) err(P + "item #" + s + " '" + items[s].item + "' undefined");
      }
      // spawn point walkable
      if (m.spawnPoint) {
        if (!World.inBounds(m, m.spawnPoint.x, m.spawnPoint.y)) err(P + "spawnPoint out of bounds");
        else if (T && World.isSolid(m, m.spawnPoint.x, m.spawnPoint.y)) err(P + "spawnPoint on solid tile");
      }
      // heal point: where a whiteout puts you, so it has to be standable and empty
      if (m.healPoint) {
        if (!World.inBounds(m, m.healPoint.x, m.healPoint.y)) err(P + "healPoint out of bounds");
        else {
          if (T && World.isSolid(m, m.healPoint.x, m.healPoint.y)) err(P + "healPoint on solid tile");
          const occ = npcs.filter(function (n) { return n && n.x === m.healPoint.x && n.y === m.healPoint.y; });
          if (occ.length) err(P + "healPoint has NPC '" + occ[0].id + "' standing on it");
        }
      }
    }
    return errors;
  };

  if (MQ.Data && MQ.Data.validators) MQ.Data.validators.push(function (err) { const es = World.validate({ allowEmpty: true }); for (let i = 0; i < es.length; i++) err(es[i]); });

  MQ.World = World;
})();

// =============================================================
// MonsterQuest v2 — MQ.World runtime layer (world workstream)
// Prepared per-map grids for the overworld: collision, zones, ledges,
// interact kinds, warp/sign/item lookup, animated-cell lists, edge warps.
// Everything here is derived, cached on the map as `__rt`, and rebuilt when
// the map is redefined. No per-frame allocation: callers index flat arrays.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const World = MQ.World;

  const Z_NONE = 0, Z_GRASS = 1, Z_WATER = 2, Z_CAVE = 3;
  const LEDGE_N = { down: 1, left: 2, right: 3, up: 4 };
  const LEDGE_ID = [null, "down", "left", "right", "up"];
  const ZONE_ID = [null, "grass", "water", "cave"];

  World.ZONE_ID = ZONE_ID;
  World.LEDGE_ID = LEDGE_ID;

  // ---- runtime preparation ------------------------------------------------
  let rtSerial = 0;

  World.invalidate = function (id) {
    if (id === undefined) { World.each(function (m) { m.__rt = null; }); return; }
    const m = typeof id === "string" ? World.get(id) : id;
    if (m) m.__rt = null;
  };

  // Re-derive on redefine (defineMap replaces the object anyway, but a map file
  // may mutate a def in place after defining it).
  const _defineMap = World.defineMap;
  World.defineMap = function (id, def) {
    const m = _defineMap(id, def);
    m.__rt = null;
    // A map defined after another map referenced it by edge must invalidate the
    // referrer's generated edge warps.
    World.each(function (o) { if (o !== m && o.edges && o.__rt) o.__rt = null; });
    return m;
  };

  function tileProps(id) { return id && MQ.Tiles ? MQ.Tiles.props(id) : null; }

  // World.prepare(map) → rt (idempotent, cached)
  World.prepare = function (map) {
    if (typeof map === "string") map = World.get(map);
    if (!map) return null;
    if (map.__rt) return map.__rt;
    const w = map.width | 0, h = map.height | 0, n = w * h;
    const rt = {
      serial: ++rtSerial, w: w, h: h, n: n,
      ground: new Array(n), deco: new Array(n), over: new Array(n),
      solid: new Uint8Array(n), water: new Uint8Array(n), zone: new Uint8Array(n),
      ledge: new Uint8Array(n), slow: new Uint8Array(n), light: new Uint8Array(n),
      climb: new Uint8Array(n), catgap: new Uint8Array(n), voidCell: new Uint8Array(n),
      interact: new Array(n),
      anim: [],                 // {layer, i, x, y, id, frames}
      warpGrid: {}, signGrid: {}, itemGrid: {}, npcGrid: {},
      triggers: map.triggers || [],
      hasAnim: false, lightCount: 0
    };
    const layers = ["ground", "deco", "over"];
    for (let li = 0; li < layers.length; li++) {
      const ln = layers[li];
      const rows = map.layers && map.layers[ln];
      const arr = rt[ln];
      if (!rows) continue;
      for (let y = 0; y < h; y++) {
        const row = rows[y] || "";
        for (let x = 0; x < w; x++) {
          const ch = row.charAt(x);
          if (!ch || ch === " ") continue;
          const id = map.legend[ch];
          if (id === undefined || id === null) continue;
          const i = y * w + x;
          arr[i] = id;
          const p = tileProps(id);
          if (!p) continue;
          if (p.anim && p.anim.length > 1) { rt.anim.push({ layer: ln, i: i, x: x, y: y, id: id, frames: p.anim.length }); rt.hasAnim = true; }
          if (p.light) { rt.light[i] = 1; rt.lightCount++; }
          if (ln === "over") continue;             // over layer never collides
          if (p.solid) rt.solid[i] = 1;
          if (p.water) { rt.water[i] = 1; rt.solid[i] = 1; }
          if (p.grass) rt.slow[i] = 1;
          if (p.encounter === "grass") rt.zone[i] = Z_GRASS;
          else if (p.encounter === "water") rt.zone[i] = Z_WATER;
          else if (p.encounter === "cave") rt.zone[i] = Z_CAVE;
          if (p.ledge) rt.ledge[i] = LEDGE_N[p.ledge] || 0;
          if (p.interact) {
            rt.interact[i] = p.interact;
            if (p.interact === "climb") { rt.climb[i] = 1; rt.solid[i] = 1; }
          }
        }
      }
    }
    // void ground = impassable hole
    for (let i = 0; i < n; i++) if (!rt.ground[i]) { rt.solid[i] = 1; rt.voidCell[i] = 1; }
    // author-declared extra collision
    if (map.solid) {
      if (typeof map.solid === "function") {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (map.solid(x, y)) rt.solid[y * w + x] = 1;
      } else {
        for (let k = 0; k < map.solid.length; k++) {
          const parts = String(map.solid[k]).split(",");
          const x = parts[0] | 0, y = parts[1] | 0;
          if (x >= 0 && y >= 0 && x < w && y < h) rt.solid[y * w + x] = 1;
        }
      }
    }
    // author-declared open cells (holes punched through solid tiles, e.g. gateways)
    if (map.open) for (let k = 0; k < map.open.length; k++) {
      const p2 = String(map.open[k]).split(","); const x = p2[0] | 0, y = p2[1] | 0;
      if (x >= 0 && y >= 0 && x < w && y < h) { rt.solid[y * w + x] = 0; rt.voidCell[y * w + x] = 0; }
    }
    // cat gaps (MEADOW Squeeze): tile id 'cat_gap' if art defines one, plus map.catGaps
    for (let i = 0; i < n; i++) if (rt.ground[i] === "cat_gap" || rt.deco[i] === "cat_gap") rt.catgap[i] = 1;
    const cg = map.catGaps || [];
    for (let k = 0; k < cg.length; k++) {
      const c = cg[k], i = c.y * w + c.x;
      if (i >= 0 && i < n) { rt.catgap[i] = 1; if (c.solid !== false) rt.solid[i] = 1; rt.catGapDefs = rt.catGapDefs || {}; rt.catGapDefs[i] = c; }
    }
    for (let i = 0; i < n; i++) if (rt.catgap[i]) rt.interact[i] = "catgap";
    // lookup grids
    const warps = World.allWarps(map);
    for (let k = 0; k < warps.length; k++) { const wp = warps[k]; rt.warpGrid[wp.y * w + wp.x] = wp; }
    const signs = map.signs || [];
    for (let k = 0; k < signs.length; k++) rt.signGrid[signs[k].y * w + signs[k].x] = signs[k];
    const items = map.items || [];
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      if (!it.flag) it.flag = "item_" + map.id + "_" + (k + 1);
      rt.itemGrid[it.y * w + it.x] = it;
    }
    map.__rt = rt;
    return rt;
  };
  World.rt = World.prepare;

  // ---- edges → generated warps -------------------------------------------
  // edges: { north:{map, offset}, south:.., east:.., west:.. }
  // A walk off the top row lands on the bottom row of the target (and so on),
  // preserving the perpendicular coordinate + offset.
  World.edgeWarps = function (map) {
    if (map.__edgeWarps && map.__edgeWarpsFor === map.id) return map.__edgeWarps;
    const out = [];
    const E = map.edges;
    if (E) {
      const sides = ["north", "south", "east", "west"];
      for (let s = 0; s < sides.length; s++) {
        const side = sides[s], e = E[side];
        if (!e || !e.map) continue;
        const tm = World.get(e.map);
        const off = e.offset || 0;
        const vertical = side === "north" || side === "south";
        const len = vertical ? map.width : map.height;
        for (let k = 0; k < len; k++) {
          const x = vertical ? k : (side === "east" ? map.width - 1 : 0);
          const y = vertical ? (side === "north" ? 0 : map.height - 1) : k;
          if (World.isSolid(map, x, y)) continue;
          let tx, ty;
          if (!tm) continue;
          if (side === "north") { tx = U.clamp(k + off, 0, tm.width - 1); ty = tm.height - 1; }
          else if (side === "south") { tx = U.clamp(k + off, 0, tm.width - 1); ty = 0; }
          else if (side === "east") { tx = 0; ty = U.clamp(k + off, 0, tm.height - 1); }
          else { tx = tm.width - 1; ty = U.clamp(k + off, 0, tm.height - 1); }
          if (World.isSolid(tm, tx, ty)) continue;
          out.push({ x: x, y: y, to: e.map, tx: tx, ty: ty, dir: side === "north" ? "up" : side === "south" ? "down" : side === "east" ? "right" : "left", kind: "edge", generated: true });
        }
      }
    }
    map.__edgeWarps = out;
    map.__edgeWarpsFor = map.id;
    return out;
  };
  World.allWarps = function (map) {
    const own = map.warps || [];
    const edge = World.edgeWarps(map);
    if (!edge.length) return own;
    return own.concat(edge);
  };

  // ---- fast queries (index-based; safe out of bounds) ----------------------
  World.idx = function (map, x, y) {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return -1;
    return y * map.width + x;
  };
  World.groundAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : rt.ground[i]; };
  World.zoneAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : ZONE_ID[rt.zone[i]]; };
  World.ledgeAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : LEDGE_ID[rt.ledge[i]]; };
  World.interactAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : (rt.interact[i] || null); };
  World.signAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : (rt.signGrid[i] || null); };
  World.itemAt = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? null : (rt.itemGrid[i] || null); };
  World.isSlow = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? false : !!rt.slow[i]; };
  World.isCatGap = function (map, x, y) { const rt = World.prepare(map), i = World.idx(map, x, y); return i < 0 ? false : !!rt.catgap[i]; };
  World.catGapAt = function (map, x, y) {
    const rt = World.prepare(map), i = World.idx(map, x, y);
    if (i < 0 || !rt.catgap[i]) return null;
    return (rt.catGapDefs && rt.catGapDefs[i]) || { x: x, y: y };
  };

  // grid-aware warp lookup (own warps + generated edge warps)
  const _warpAt = World.warpAt;
  World.warpAt = function (map, x, y) {
    if (!map) return null;
    const rt = map.__rt;
    if (rt) { const i = World.idx(map, x, y); return i < 0 ? null : (rt.warpGrid[i] || null); }
    const own = _warpAt(map, x, y);
    if (own) return own;
    const edges = World.edgeWarps(map);
    for (let i = 0; i < edges.length; i++) if (edges[i].x === x && edges[i].y === y) return edges[i];
    return null;
  };

  // Movement blocking. `abilities` = Set (or null). Water passable with boat/swim,
  // climbable crags with climb, cat gaps with squeeze (cat only), bog with waders.
  World.blocked = function (map, x, y, abilities) {
    const rt = World.prepare(map);
    const i = World.idx(map, x, y);
    if (i < 0) return true;
    if (!rt.solid[i]) return false;
    if (rt.voidCell[i]) return true;
    if (!abilities) return true;
    if (rt.water[i]) {
      const g = rt.ground[i];
      if (abilities.has("boat") || abilities.has("swim")) {
        // deep water still needs the boat; brine/hot springs are never walkable
        return g === "hot_spring";
      }
      return true;
    }
    if (rt.climb[i] && abilities.has("climb")) return false;
    const gid = rt.ground[i];
    if (gid === "moor_bog" && abilities.has("waders")) return false;
    if (gid === "hedge" && abilities.has("billhook") && map.billhookGaps && map.billhookGaps.indexOf(x + "," + y) >= 0) return false;
    if (rt.catgap[i] && abilities.has("squeeze") && abilities.has("__cat")) return false;
    return true;
  };

  // Why is this tile blocked? → a short player-facing hint id, or null.
  World.blockReason = function (map, x, y, abilities) {
    const rt = World.prepare(map);
    const i = World.idx(map, x, y);
    if (i < 0 || !rt.solid[i]) return null;
    if (rt.water[i]) return (abilities && (abilities.has("boat") || abilities.has("swim"))) ? null : "water";
    if (rt.climb[i]) return "climb";
    if (rt.catgap[i]) return "catgap";
    if (rt.ground[i] === "moor_bog") return "bog";
    if (rt.ground[i] === "hedge") return "hedge";
    return "solid";
  };

  // Ledges are one-way: you may hop down them, never step up into them.
  World.ledgeBlocks = function (map, x, y, dir) {
    const rt = World.prepare(map);
    const i = World.idx(map, x, y);
    if (i < 0 || !rt.ledge[i]) return false;
    return LEDGE_ID[rt.ledge[i]] === U.opposite[dir];
  };

  World.triggersAt = function (map, x, y, out) {
    out = out || [];
    out.length = 0;
    const trs = map.triggers || [];
    for (let i = 0; i < trs.length; i++) {
      const t = trs[i];
      const w = t.w || 1, h = t.h || 1;
      if (x >= t.x && x < t.x + w && y >= t.y && y < t.y + h) out.push(t);
    }
    return out;
  };

  World.spawnOf = function (map) {
    if (map.spawnPoint) return map.spawnPoint;
    // first walkable tile, scanning from the centre outwards
    const cx = map.width >> 1, cy = map.height >> 1;
    for (let r = 0; r < Math.max(map.width, map.height); r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx, y = cy + dy;
        if (World.inBounds(map, x, y) && !World.isSolid(map, x, y)) return { x: x, y: y };
      }
    }
    return { x: 0, y: 0 };
  };

  World.encounterTableId = function (map, zone) {
    return (map.encounters && map.encounters[zone]) || null;
  };

  // A* on the tile grid — used by NPC 'path' behaviour and scripted walks.
  const openList = [], cameFrom = {}, gScore = {}, fScore = {};
  World.findPath = function (map, sx, sy, tx, ty, opts) {
    opts = opts || {};
    const maxNodes = opts.maxNodes || 900;
    const abilities = opts.abilities || null;
    if (sx === tx && sy === ty) return [];
    const key = function (x, y) { return y * map.width + x; };
    openList.length = 0;
    const ck = Object.keys(cameFrom); for (let i = 0; i < ck.length; i++) delete cameFrom[ck[i]];
    const gk = Object.keys(gScore); for (let i = 0; i < gk.length; i++) delete gScore[gk[i]];
    const fk = Object.keys(fScore); for (let i = 0; i < fk.length; i++) delete fScore[fk[i]];
    const start = key(sx, sy), goal = key(tx, ty);
    gScore[start] = 0; fScore[start] = Math.abs(tx - sx) + Math.abs(ty - sy);
    openList.push(start);
    let visited = 0;
    while (openList.length) {
      let bi = 0;
      for (let i = 1; i < openList.length; i++) if (fScore[openList[i]] < fScore[openList[bi]]) bi = i;
      const cur = openList.splice(bi, 1)[0];
      if (cur === goal) {
        const out = [];
        let c = cur;
        while (c !== start) { out.unshift({ x: c % map.width, y: (c / map.width) | 0 }); c = cameFrom[c]; }
        return out;
      }
      if (++visited > maxNodes) break;
      const cx = cur % map.width, cy = (cur / map.width) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = cx + (d === 2 ? -1 : d === 3 ? 1 : 0);
        const ny = cy + (d === 0 ? -1 : d === 1 ? 1 : 0);
        if (!World.inBounds(map, nx, ny)) continue;
        if (nx !== tx || ny !== ty || !opts.goalBlocked) { if (World.blocked(map, nx, ny, abilities)) continue; }
        if (opts.avoid && opts.avoid(nx, ny)) continue;
        const nk = key(nx, ny), tentative = gScore[cur] + 1;
        if (gScore[nk] !== undefined && tentative >= gScore[nk]) continue;
        cameFrom[nk] = cur; gScore[nk] = tentative;
        fScore[nk] = tentative + Math.abs(tx - nx) + Math.abs(ty - ny);
        if (openList.indexOf(nk) < 0) openList.push(nk);
      }
    }
    return null;
  };

  // ---- extra validation for the runtime fields the overworld consumes -----
  const ZONES = ["grass", "water", "cave"];
  const WARP_KINDS = ["door", "edge", "stairs", "cave", "look", "gate", "lift", "rail"];
  const BEHAVIOURS = ["still", "wander", "path", "look", "follow"];
  const _validate = World.validate;
  World.validate = function (opts) {
    const errors = _validate(opts);
    const err = function (m) { errors.push(m); };
    const D = MQ.Data;
    const encTables = (D && D.encounters) || {};
    const haveTables = Object.keys(encTables).length > 0;
    const items = (D && D.items) || {};
    const haveItems = Object.keys(items).length > 0;
    World.each(function (m, id) {
      const P = "map " + id + ": ";
      if (!m.layers || !m.layers.ground) return;
      // encounter zones
      if (m.encounters) {
        const ks = Object.keys(m.encounters);
        for (let i = 0; i < ks.length; i++) if (ZONES.indexOf(ks[i]) < 0) err(P + "encounter zone '" + ks[i] + "' is not grass/water/cave");
      }
      if (m.fishing && haveTables && !encTables[m.fishing]) err(P + "fishing table '" + m.fishing + "' undefined");
      // a map with encounter tiles but no table is almost always a mistake
      if (!m.encounters && haveTables) {
        const rt = World.prepare(m);
        let zoneCells = 0;
        for (let i = 0; i < rt.n; i++) if (rt.zone[i]) zoneCells++;
        // an explicit `encounters: {grass:null}` means "nothing spawns here";
        // no block at all next to 37 tiles of long grass is an oversight.
        if (zoneCells > 8) err(P + zoneCells + " encounter tiles but no `encounters` block");
      }
      // warps
      const ws = m.warps || [];
      for (let i = 0; i < ws.length; i++) {
        if (ws[i].kind && WARP_KINDS.indexOf(ws[i].kind) < 0) err(P + "warp #" + i + " unknown kind '" + ws[i].kind + "'");
        if (ws[i].cond) { try { MQ.Flags.parse(ws[i].cond); } catch (e) { err(P + "warp #" + i + " bad cond: " + e.message); } }
      }
      // npcs
      const ns = m.npcs || [];
      for (let i = 0; i < ns.length; i++) {
        const np = ns[i], NP = P + "npc " + (np.id || "#" + i) + ": ";
        if (np.behaviour && BEHAVIOURS.indexOf(np.behaviour) < 0) err(NP + "unknown behaviour '" + np.behaviour + "'");
        if (np.behaviour === "path" || np.path) {
          if (!np.path || !np.path.length) err(NP + "behaviour 'path' needs a path");
          else for (let k = 0; k < np.path.length; k++) {
            const wp = np.path[k];
            const x = wp[0] !== undefined ? wp[0] : wp.x, y = wp[1] !== undefined ? wp[1] : wp.y;
            if (!World.inBounds(m, x, y)) err(NP + "path point " + k + " out of bounds");
            else if (World.isSolid(m, x, y)) err(NP + "path point " + k + " (" + x + "," + y + ") is solid");
          }
        }
        if (np.trainer && np.sight !== undefined && (np.sight < 0 || np.sight > 12)) err(NP + "sight " + np.sight + " out of range 0-12");
      }
      // triggers with an area
      const trs = m.triggers || [];
      for (let i = 0; i < trs.length; i++) {
        const tr = trs[i];
        if (!World.inBounds(m, tr.x + (tr.w || 1) - 1, tr.y + (tr.h || 1) - 1)) err(P + "trigger #" + i + " extends out of bounds");
      }
      // cat gaps and rest points
      const cg = m.catGaps || [];
      for (let i = 0; i < cg.length; i++) {
        if (!World.inBounds(m, cg[i].x, cg[i].y)) err(P + "catGap #" + i + " out of bounds");
        if (cg[i].item && haveItems && !items[cg[i].item]) err(P + "catGap #" + i + " item '" + cg[i].item + "' undefined");
      }
      const rp = m.restPoints || [];
      for (let i = 0; i < rp.length; i++) if (!World.inBounds(m, rp[i].x, rp[i].y)) err(P + "restPoint #" + i + " out of bounds");
      if (m.landmark && !World.inBounds(m, m.landmark.x, m.landmark.y)) err(P + "landmark out of bounds");
      // duplicate pickup flags would make one item unobtainable
      const its = m.items || [];
      const seen = {};
      for (let i = 0; i < its.length; i++) {
        const f = its[i].flag;
        if (!f) continue;
        if (seen[f]) err(P + "item #" + i + " reuses flag '" + f + "'");
        seen[f] = true;
      }
    });
    return errors;
  };

  World.stats = function () {
    let cells = 0, prepared = 0;
    World.each(function (m) { cells += m.width * m.height; if (m.__rt) prepared++; });
    return { maps: World.ids().length, cells: cells, prepared: prepared, templates: Object.keys(World.templates).length };
  };
})();

// =============================================================
// MonsterQuest v2 — interior template library (world workstream)
// Nine reusable interiors the map teams instantiate with
//   MQ.World.defineMap('macclesfield_home', MQ.World.template('house_small', {
//     name:'Jim's flat', warps:[{x:5,y:9,to:'macclesfield',tx:20,ty:14,dir:'down',kind:'door'}],
//     npcs:[...], items:[...]
//   }));
// Overrides merge deeply (U.merge): pass whole arrays for warps/npcs/signs/items,
// or a `patch` array of {x,y,layer,ch} to tweak a few cells.
// Each template carries `anchors` (door/counter/healer/leader/bed tiles) so a
// map file can place NPCs without counting characters.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const World = MQ.World;

  World.builtins = {};
  function tpl(name, def) {
    def.__builtin = true; def.template = name;
    World.builtins[name] = def;
    World.defineTemplate(name, def);
    return def;
  }

  const IN = { region: "interior", outdoor: false, ambience: "town", music: "town_macc", weatherZone: null };

  // ---- house_small: one-room terrace, 12x10 -------------------------------
  tpl("house_small", Object.assign({}, IN, {
    name: "House",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood", "r": "rug",
      "D": "mat_welcome", "d": "door_wood", "b": "bed", "B": "bed_head", "t": "table", "c": "chair",
      "s": "shelf", "k": "bookcase", "T": "tv", "f": "fireplace", "p": "plant_pot", "g": "fridge",
      "o": "stove", "n": "sink", "z": "cat_bed", "v": "cat_bowl", "a": "stairs", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^",
        "#W##f##W###k",
        "#B_______p_#",
        "#b____t____#",
        "#___rrc____#",
        "#___rr_____#",
        "#zv___gon__#",
        "#s________T#",
        "#____DD___a#",
        "#####dd#####"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 5, y: 8 },
    anchors: { door: { x: 5, y: 9 }, bed: { x: 1, y: 3 }, stairs: { x: 10, y: 8 }, table: { x: 6, y: 3 }, cat: { x: 1, y: 6 } }
  }));

  // ---- house_large: two rooms, hall, stairs, 16x14 ------------------------
  tpl("house_large", Object.assign({}, IN, {
    name: "House",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood", "r": "rug",
      "D": "mat_welcome", "d": "door_wood", "b": "bed", "B": "bed_head", "t": "table", "c": "chair",
      "s": "shelf", "k": "bookcase", "i": "painting", "f": "fireplace", "p": "plant_pot",
      "g": "fridge", "o": "stove", "n": "sink", "z": "cat_bed", "v": "cat_bowl", "a": "stairs", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^^^",
        "#W###k##f##W###k",
        "#B____#___p___i#",
        "#b____#________#",
        "#__t__#___tt___#",
        "#__c__#___cc___#",
        "##_####____rr__#",
        "#______________#",
        "#gon___####____#",
        "#______#__zv___#",
        "#s_____#_______#",
        "#k_____#______a#",
        "#______DD______#",
        "#######dd#######"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 7, y: 12 },
    anchors: { door: { x: 7, y: 13 }, bed: { x: 1, y: 3 }, stairs: { x: 14, y: 11 }, kitchen: { x: 2, y: 8 }, cat: { x: 10, y: 9 } }
  }));

  // ---- shop (mart): counter + stock, 14x10 --------------------------------
  tpl("shop", Object.assign({}, IN, {
    name: "Shop", music: "town_macc",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window_shop", "_": "floor_tile",
      "D": "mat_welcome", "d": "door_shop", "S": "shelf", "C": "counter", "K": "cash_till",
      "x": "crate", "y": "barrel", "q": "sack", "p": "plant_pot", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^",
        "#W##W###W###W#",
        "#SSS____x_y_q#",
        "#____________#",
        "#SS____SS____#",
        "#____________#",
        "#CCCK________#",
        "#___________p#",
        "#_____DD_____#",
        "######dd######"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 6, y: 8 },
    anchors: { door: { x: 6, y: 9 }, counter: { x: 1, y: 6 }, clerk: { x: 1, y: 5 }, till: { x: 4, y: 6 } }
  }));

  // ---- care_centre: healer, box PC, casebook desk, 16x12 ------------------
  tpl("care_centre", Object.assign({}, IN, {
    name: "Care Centre", music: "town_macc",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_tile",
      "D": "mat_welcome", "d": "door_wood", "C": "counter", "H": "healer", "P": "box_pc",
      "e": "bench", "p": "plant_pot", "k": "bookcase", "l": "clock_wall", "t": "table", "c": "chair", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^^^",
        "#W####l#####W###",
        "#__CCHC___CPC__#",
        "#______________#",
        "#_p__________p_#",
        "#e____t_____ke_#",
        "#e____c_____ke_#",
        "#______________#",
        "#p___________p_#",
        "#______________#",
        "#______DD______#",
        "#######dd#######"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 7, y: 10 }, healPoint: { x: 5, y: 3 },
    anchors: { door: { x: 7, y: 11 }, healer: { x: 5, y: 2 }, box: { x: 11, y: 2 }, nurse: { x: 4, y: 2 }, casebook: { x: 12, y: 5 } }
  }));

  // ---- gym_hall: arena floor, badge stand, statues, 18x16 -----------------
  tpl("gym_hall", Object.assign({}, IN, {
    name: "Gym", music: "battle_gym", ambience: "town",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_gym",
      "D": "mat_welcome", "d": "door_gym", "S": "gym_statue", "A": "gym_badge_stand", "r": "floor_carpet", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^^^^^",
        "#W####S####S####W#",
        "#________A_______#",
        "#_______rrr______#",
        "#S______rrr_____S#",
        "#_______rrr______#",
        "#___S___rrr___S__#",
        "#_______rrr______#",
        "#_______rrr______#",
        "#___S___rrr___S__#",
        "#_______rrr______#",
        "#S______rrr_____S#",
        "#_______rrr______#",
        "#_______rrr______#",
        "#_______rDr______#",
        "########dd########"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 9, y: 14 },
    anchors: { door: { x: 8, y: 15 }, leader: { x: 9, y: 3 }, badge: { x: 9, y: 2 } }
  }));

  // ---- station: concourse, platform, track, 20x12 -------------------------
  tpl("station", Object.assign({}, IN, {
    name: "Station", music: "town_crewe", ambience: "industrial",
    legend: {
      "#": "wall_interior", "_": "floor_stone", "=": "platform", "y": "platform_edge",
      "h": "rail_track_h", "B": "sign_station", "c": "station_clock", "e": "bench",
      "l": "lamp", "x": "crate", "D": "mat_welcome", "d": "door_wood", "n": "noticeboard", " ": null
    },
    layers: {
      ground: [
        "####################",
        "#__c____B_______l__#",
        "#_________________n#",
        "#e____e______e___x_#",
        "#__________________#",
        "====================",
        "yyyyyyyyyyyyyyyyyyyy",
        "hhhhhhhhhhhhhhhhhhhh",
        "hhhhhhhhhhhhhhhhhhhh",
        "yyyyyyyyyyyyyyyyyyyy",
        "#_______DD_________#",
        "########dd##########"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 8, y: 10 }, station: { name: "Station" },
    anchors: { door: { x: 8, y: 11 }, platform: { x: 10, y: 5 }, board: { x: 8, y: 1 }, guard: { x: 6, y: 3 } }
  }));

  // ---- pub: bar, tables, dartboard, fire, 14x12 ---------------------------
  tpl("pub", Object.assign({}, IN, {
    name: "The Inn", music: "town_bollington",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood",
      "b": "bar", "B": "bar_taps", "f": "fireplace", "t": "table_round", "c": "stool",
      "x": "dartboard", "m": "fruit_machine", "p": "piano", "y": "barrel",
      "D": "mat_welcome", "d": "pub_door", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^",
        "#W##f####x#W##",
        "#____________#",
        "#bbbbB__t_c__#",
        "#____________#",
        "#_t_c___t_c__#",
        "#_c______c___#",
        "#p_____t_____#",
        "#______c_____#",
        "#m_________y_#",
        "#_____DD_____#",
        "######dd######"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 6, y: 10 },
    anchors: { door: { x: 6, y: 11 }, bar: { x: 2, y: 3 }, landlord: { x: 2, y: 2 }, fire: { x: 4, y: 1 } }
  }));

  // ---- church: nave, pews, altar, 14x14 -----------------------------------
  tpl("church", Object.assign({}, IN, {
    name: "Church", music: "town_congleton", ambience: "town",
    legend: {
      "#": "church_wall", "W": "church_window", "_": "floor_stone", "r": "floor_carpet",
      "c": "chair", "a": "table", "p": "plant_pot", "D": "mat", "d": "church_door", " ": null
    },
    layers: {
      ground: [
        "##############",
        "#W##__a__##W##",
        "#___rrrrrr___#",
        "#cc_rrrrrr_cc#",
        "#cc_rrrrrr_cc#",
        "#___rrrrrr___#",
        "#cc_rrrrrr_cc#",
        "#cc_rrrrrr_cc#",
        "#___rrrrrr___#",
        "#cc_rrrrrr_cc#",
        "#cc_rrrrrr_cc#",
        "#p__rrrrrr__p#",
        "#___rrDDrr___#",
        "######dd######"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 6, y: 12 },
    anchors: { door: { x: 6, y: 13 }, altar: { x: 6, y: 1 }, vicar: { x: 6, y: 2 } }
  }));

  // ---- cave_room: a single dungeon chamber, 20x13 -------------------------
  tpl("cave_room", Object.assign({}, IN, {
    name: "Cave", music: "dungeon_cave", ambience: "cave", region: "interior",
    legend: {
      "#": "cave_wall", "^": "cave_wall_top", ".": "cave_floor", ":": "cave_floor_dark",
      "s": "stalag", "o": "ore", "y": "crystal", "w": "water", "e": "cave_entrance", " ": null
    },
    layers: {
      ground: [
        "^^^^^^^^^^^^^^^^^^^^",
        "####################",
        "##.....s......o...##",
        "#..................#",
        "#...s....::::......#",
        "#........::::...y..#",
        "#..wwww..::::......#",
        "#..wwww.......s....#",
        "#..................#",
        "#....o......s......#",
        "#..................#",
        "##......e.........##",
        "####################"
      ]
    },
    warps: [], npcs: [], signs: [], items: [],
    spawnPoint: { x: 8, y: 10 },
    encounters: { cave: null, water: null },
    anchors: { door: { x: 8, y: 11 }, entrance: { x: 8, y: 11 }, pool: { x: 4, y: 6 }, vein: { x: 5, y: 9 } }
  }));

  World.templateNames = function () { return Object.keys(World.templates); };
  // Always the shipped interior, even if a map file has redefined the name.
  World.builtin = function (name, overrides) {
    const t = World.builtins[name];
    if (!t) throw new Error("World.builtin: unknown template " + name);
    const saved = World.templates[name];
    World.templates[name] = t;
    try { return World.template(name, overrides); }
    finally { if (saved) World.templates[name] = saved; else delete World.templates[name]; }
  };

  // World.template(name, overrides) with a `patch` extra: [{x,y,ch,layer}]
  const _template = World.template;
  World.template = function (name, overrides) {
    const def = World.templates[name] ? _template(name, overrides) : MQ.U.merge(World.builtins[name] || null, overrides || {});
    if (!def || !def.layers) throw new Error("World.template: unknown template " + name);
    if (overrides && overrides.patch) {
      for (let i = 0; i < overrides.patch.length; i++) {
        const p = overrides.patch[i];
        const ln = p.layer || "ground";
        const rows = def.layers[ln];
        if (!rows || !rows[p.y]) continue;
        const row = rows[p.y];
        rows[p.y] = row.substring(0, p.x) + p.ch + row.substring(p.x + 1);
      }
      delete def.patch;
    }
    delete def.__builtin;
    return def;
  };
})();
