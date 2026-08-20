// =============================================================
// MonsterQuest v2 — MQ.SaltBuild: layer-painting helpers for the
// region-south-west map files (Nantwich, Hack Green, Y Berllan, the
// salt towns, the Salt Mine, Anderton, Great Budworth).
// Builds on MQ.EastBuild (canvas/house/trees/scatter/snake) and adds
// the vocabulary this half of the county is made of: brine, salt pans,
// canal locks, orchard rows, pillar-and-stall galleries and the sea.
// Pure string work at parse time; nothing here runs game logic.
// Owned by region-southwest (js/world/maps/sw*.js).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.EastBuild;
  const B = {};

  // ---- borrowed wholesale from the east toolkit ---------------------------
  B.canvas = E.canvas;
  B.house = E.house;
  B.trees = E.trees;
  B.frame = E.frame;
  B.solidFill = E.solidFill;
  B.merge = E.merge;

  // ---- legends ------------------------------------------------------------
  // The east TOWN legend is the county's shared alphabet: a char means the
  // same thing in Nantwich as it does in Macclesfield. SALT adds the brine
  // half of Cheshire on the digits and the bracket family.
  const SALT_X = {
    "0": "salt_flat", "1": "salt_crust", "2": "salt_pan", "3": "salt_pile", "4": "salt_works_pipe",
    "5": "brine_pump", "6": "brine_pool", "7": "water_flash", "8": "narrowboat", "9": "boat_dock",
    ";": "path_tarmac", ":": "path_gravel", "!": "water_river", "?": "shallows", "$": "water_pond",
    "(": "tree_pine", ")": "tree_pine_top", "<": "bridge_wood", ">": "ledge_down",
    "[": "crate", "]": "barrel", "{": "berry_bush", "}": "sack", "|": "fence_wire",
    "E": "cave_entrance", "Q": "fish_spot", "J": "gate_wood", "U": "rail_track_h", "Y": "rail_track_v"
  };
  B.SALT = B.merge(E.TOWN, SALT_X);
  B.salt = function (extra) { return B.merge(B.SALT, extra); };

  // Y Berllan and the Ceredigion coast: apples, elm, slate, sea haze.
  const ORCH_X = {
    ".": "orchard_grass", ",": "grass", '"': "grass_tall", "l": "flowers_white", "o": "flowers_yellow",
    "+": "path_dirt", "=": "path_gravel", "_": "path_flag", ":": "orchard_row",
    "T": "tree_apple", "y": "tree_apple_top", "B": "tree_oak", "b": "tree_oak_top",
    "(": "tree_willow", ")": "tree_pine_top", "0": "tree_autumn", "1": "tree_dead",
    "#": "wall_stone_grey", "X": "wall_render_cream", "R": "roof_slate", "^": "roof_over",
    "W": "window", "D": "door_wood", "@": "door_red", "S": "door_shop", "m": "chimney",
    "2": "apple_press", "3": "brew_vat", "4": "hay_bale", "5": "scarecrow", "6": "well",
    "7": "greenhouse_wall", "8": "greenhouse_door", "9": "greenhouse_bed",
    "$": "water_pond", "?": "shallows", "!": "water_river", "Q": "fish_spot", "<": "bridge_wood",
    "w": "fence_stone", "f": "fence_wood", "J": "gate_wood", "G": "gate_iron", "h": "hedge",
    "[": "log", "]": "stump", "{": "berry_bush", "}": "mushroom", "|": "pine_forest_floor",
    "N": "sign", "P": "sign_post", "L": "lamp", "H": "bench", "*": "planter", "z": "rock",
    "U": "rail_track_h", "Y": "rail_track_v", "E": "platform", "e": "platform_edge",
    "s": "sand", "~": "water", "t": "water_deep", "x": "bridge_stone", "-": "pavement",
    "k": "kerb", "r": "road", "&": "bunting", "q": "picnic_table", "c": "church_wall",
    "C": "church_window", "d": "church_door", "p": "church_spire", "g": "gravestone",
    "i": "war_memorial", ">": "ledge_down", "n": "noticeboard", "I": "bin", "F": "fence_iron",
    "M": "chimney", "v": "window_lit", "V": "wall_render_white", "Z": "boat_dock",
    "A": "market_stall", "a": "market_stall_top", "K": "shore_n", "'": "flowers_red",
    " ": null
  };
  B.ORCH = ORCH_X;
  B.orchard = function (extra) { return B.merge(ORCH_X, extra); };

  // Underground: the salt mine, the DeepStore tiers, the Hack Green bunker.
  const MINE_X = {
    ".": "cave_floor", ",": "cave_floor_dark", "_": "mine_floor", "0": "salt_flat", "1": "salt_crust",
    "#": "cave_wall", "^": "cave_wall_top", "w": "wall_stone_grey", "W": "wall_stone_sandstone",
    "~": "water", "e": "water_edge", "?": "shallows", "6": "brine_pool", "!": "water_river",
    "z": "stalag", "o": "ore", "c": "crystal", "r": "rock_small", "R": "boulder", "m": "moss_rock",
    "E": "cave_entrance", "L": "mine_prop", "-": "mine_cart_rail_h", "|": "mine_cart_rail_v",
    "K": "mine_cart", "N": "sign", "P": "sign_post", "u": "door_stairs_up", "d": "door_stairs_down",
    "b": "bridge_wood", "x": "bridge_stone", "S": "steps", "7": "cliff_climb", "8": "narrowboat",
    "3": "salt_pile", "2": "salt_pan", "5": "brine_pump", "4": "salt_works_pipe",
    "[": "crate", "]": "barrel", "}": "sack", "T": "server_rack", "t": "terminal",
    "C": "cable_duct", "H": "hologram", "l": "lamp", "D": "door_wood", "@": "door_locked",
    "G": "gate_iron", "F": "fence_iron", "M": "machine", "f": "floor_stone", "g": "floor_tile",
    "v": "wall_interior", "V": "wall_interior_top", "s": "shelf", "k": "bookcase", "p": "plant_pot",
    "n": "noticeboard", "i": "counter", "j": "chair", "h": "table", "Q": "fish_spot",
    "9": "boat_dock", "$": "water_deep", " ": null
  };
  B.MINE = MINE_X;
  B.mine = function (extra) { return B.merge(MINE_X, extra); };

  // ---- building blocks ----------------------------------------------------
  // A canal: towpath / water / far bank. `dir` 'h' or 'v'.
  B.canal = function (c, x, y, len, dir, opts) {
    opts = opts || {};
    const width = opts.width === undefined ? 3 : opts.width;
    const tow = opts.tow || "t", water = opts.water || "~", far = opts.far === undefined ? "t" : opts.far;
    for (let i = 0; i < len; i++) {
      if (dir === "h") {
        if (tow) c.set("g", x + i, y, tow);
        for (let k = 0; k < width; k++) c.set("g", x + i, y + 1 + k, water);
        if (far) c.set("g", x + i, y + 1 + width, far);
      } else {
        if (tow) c.set("g", x, y + i, tow);
        for (let k = 0; k < width; k++) c.set("g", x + 1 + k, y + i, water);
        if (far) c.set("g", x + 1 + width, y + i, far);
      }
    }
    return c;
  };

  // A flight of locks down a horizontal canal: gates every `every` tiles.
  B.lockFlight = function (c, x, y, n, every, opts) {
    opts = opts || {};
    const gate = opts.gate || "K", beam = opts.beam || null, width = opts.width || 3;
    for (let i = 0; i < n; i++) {
      const gx = x + i * every;
      for (let k = 0; k < width; k++) c.set("g", gx, y + k, gate);
      if (beam) { c.set("g", gx, y - 1, beam); c.set("g", gx, y + width, beam); }
    }
    return c;
  };

  // Orchard rows: alternating grass strip and a line of apple/perry trees.
  B.orchardRows = function (c, x, y, w, h, opts) {
    opts = opts || {};
    const tree = opts.tree || "T", top = opts.top || "y", row = opts.row || ":";
    const gap = opts.gap === undefined ? 2 : opts.gap;
    for (let j = 0; j < h; j++) {
      const yy = y + j;
      if (j % (gap + 1) === 0) {
        for (let i = 0; i < w; i += 2) { c.set("g", x + i, yy, tree); if (top) c.set("o", x + i, yy - 1, top); }
      } else if (j % (gap + 1) === 1) {
        for (let i = 0; i < w; i++) c.set("g", x + i, yy, row);
      }
    }
    return c;
  };

  // Pillar-and-stall: a grid maze of rock pillars in a mined-out gallery.
  B.pillarGrid = function (c, x, y, w, h, opts) {
    opts = opts || {};
    const pillar = opts.pillar || "#", pitch = opts.pitch || 4, size = opts.size || 2;
    const seed = opts.seed || "pillars";
    const rnd = U.rng("sw:" + seed);
    for (let j = 0; j + size <= h; j += pitch) {
      for (let i = 0; i + size <= w; i += pitch) {
        if (opts.skip && rnd() < opts.skip) continue;
        c.fill("g", x + i, y + j, size, size, pillar);
      }
    }
    return c;
  };

  // Salt works: a rank of open pans with pipework behind them.
  B.saltPans = function (c, x, y, n, opts) {
    opts = opts || {};
    const pan = opts.pan || "2", pipe = opts.pipe || "4", pile = opts.pile || "3";
    for (let i = 0; i < n; i++) {
      c.fill("g", x + i * 4, y, 3, 2, pan);
      c.set("g", x + i * 4 + 1, y - 1, pipe);
      if (i % 2 === 0) c.set("g", x + i * 4, y + 2, pile);
    }
    return c;
  };

  // A rail line with a platform edge. `dir` 'h' only (that is all we need).
  B.railLine = function (c, x, y, len, opts) {
    opts = opts || {};
    const track = opts.track || "U", plat = opts.plat || "E", edge = opts.edge || "e";
    for (let i = 0; i < len; i++) {
      c.set("g", x + i, y, track);
      c.set("g", x + i, y + 1, track);
      if (plat) { c.set("g", x + i, y - 1, edge); c.set("g", x + i, y - 2, plat); }
    }
    return c;
  };

  // A black-and-white timber terrace: Nantwich and Northwich are made of these.
  B.timberRow = function (c, x, y, w, opts) {
    opts = opts || {};
    const h = opts.h || 5, roof = opts.roof || "R", beam = opts.beam || "X", wall = opts.wall || "#";
    const doors = opts.doors || [Math.floor(w / 2)];
    c.hline("g", x, y, w, roof);
    c.hline("g", x, y + 1, w, roof);
    for (let j = 2; j < h; j++) c.hline("g", x, y + j, w, j % 2 ? beam : wall);
    for (let i = 1; i < w - 1; i += 3) c.set("g", x + i, y + 2, "W");
    for (let k = 0; k < doors.length; k++) c.set("g", x + doors[k], y + h - 1, opts.door || "D");
    c.hline("o", x, y, w, opts.over || "^");
    if (opts.chimneys) for (let k = 0; k < opts.chimneys.length; k++) c.set("g", x + opts.chimneys[k], y, "m");
    const out = [];
    for (let k = 0; k < doors.length; k++) out.push({ x: x + doors[k], y: y + h - 1, front: { x: x + doors[k], y: y + h } });
    return out;
  };

  // Scatter with the region seed prefix so two maps never share a pattern.
  B.speckle = function (c, layer, seed, ch, n, x, y, w, h, over) {
    return c.scatter(layer, "sw:" + seed, ch, n, x, y, w, h, over);
  };

  // ---- cross-region borders ----------------------------------------------
  // region-mid (Crewe, Sandbach), region-west (Delamere) and region-nw (Lymm)
  // own the maps on the far side of our edges. We aim at their spawn point if
  // they are loaded, and at our own placeholder if they are not — and we never
  // emit a warp to a map that does not exist.
  // `mine` is where to land when the target is our own placeholder (we know
  // its layout); otherwise we aim at whatever the owning team calls walkable.
  B.linkWarp = function (list, x, y, to, dir, mine) {
    const m = MQ.World.get(to);
    if (!m) return list;
    let t = mine;
    if (!t || !m.__swPlaceholder) t = MQ.World.spawnOf(m);
    list.push({ x: x, y: y, to: to, tx: t.x, ty: t.y, dir: dir, kind: "edge" });
    return list;
  };
  // Define a map only if the owning workstream has not already defined it.
  B.defineIfAbsent = function (id, def) {
    if (MQ.World.has(id)) return MQ.World.get(id);
    def.__swPlaceholder = true;
    return MQ.World.defineMap(id, def);
  };

  MQ.SaltBuild = B;
})();
