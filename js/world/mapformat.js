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
      if (m.healPoint && !World.inBounds(m, m.healPoint.x, m.healPoint.y)) err(P + "healPoint out of bounds");
    }
    return errors;
  };

  if (MQ.Data && MQ.Data.validators) MQ.Data.validators.push(function (err) { const es = World.validate({ allowEmpty: true }); for (let i = 0; i < es.length; i++) err(es[i]); });

  MQ.World = World;
})();
