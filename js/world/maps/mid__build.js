// =============================================================
// MonsterQuest v2 — MQ.MidBuild: the region-mid painter's kit.
// A thin layer on top of MQ.EastBuild (region-east owns that file and it
// is not edited here): the shared MID legends, a handful of shapes this
// region needs that the east towns never did — parkland avenues, a
// viaduct, a rail yard, a moated Tudor hall, a radio dish — and the
// east<->mid seam patcher.
// Pure string/array work at parse time. Nothing here runs game logic.
// Owned by region-mid (js/world/maps/mid*.js).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const B = MQ.EastBuild;
  const M = {};

  M.canvas = B.canvas;
  M.house = B.house;
  M.trees = B.trees;
  M.frame = B.frame;
  M.solidFill = B.solidFill;
  M.merge = B.merge;

  // ---------------------------------------------------------- legends -----
  // Mid towns: the east TOWN alphabet plus the chars this region needs —
  // Tudor timber, rendered Georgian fronts, rail, and the softer bits of a
  // Cheshire lane. A char means the same thing on every mid map.
  const MIDX = {
    "E": "wall_tudor", "J": "wall_tudor_beam", "Q": "fish_spot",
    "U": "wall_render_cream", "Y": "wall_render_white",
    "0": "platform", "1": "platform_edge", "2": "rail_track_h", "3": "rail_track_v",
    "4": "rail_signal", "5": "rail_buffer", "6": "roof_tile_red", "7": "gate_wood",
    "8": "picnic_table", "9": "bandstand",
    "!": "water", "?": "shallows", ":": "path_gravel", ";": "hedge_low",
    "(": "tree_pine", ")": "tree_pine_top", "<": "bridge_wood", ">": "ledge_down",
    "[": "log", "]": "stump", "{": "berry_bush", "}": "mushroom",
    "|": "fence_wire", "$": "water_pond"
  };
  M.MIDX = MIDX;
  M.town = function (extra) { return B.merge(B.merge(B.TOWN, MIDX), extra); };

  // Mid uplands, parkland and water: the east LAND alphabet with the moor
  // chars this region has no use for turned over to parkland furniture.
  const MIDL = {
    "J": "hay_bale", "U": "mere_jetty", "1": "water",
    "%": "picnic_table", "&": "gate_wood",
    "V": "wall_stone_grey", "Z": "wall_stone_grit",
    "A": "lake_reeds", "a": "water_reeds"
  };
  M.MIDL = MIDL;
  M.moor = function (extra) { return B.merge(B.merge(B.landLegend(), MIDL), extra); };

  // Interiors. One broad alphabet so a room can be painted freely without a
  // bespoke legend every time; pass `extra` for the odd one-off.
  const INT = {
    "#": "wall_interior", "^": "wall_interior_top", "W": "window", "/": "wall_glass",
    "_": "floor_wood", "%": "floor_wood_dark", ".": "floor_tile", "&": "floor_tile_check",
    ",": "floor_stone", "r": "rug", "c": "floor_carpet", "F": "floor_gym", "0": "floor_lab",
    "D": "door_wood", "@": "door_red", "$": "door_locked", "M": "mat_welcome",
    "a": "stairs", "u": "door_stairs_up", "d": "door_stairs_down",
    "t": "table", "h": "chair", "o": "stool", "T": "table_round",
    "b": "bed", "B": "bed_head", "q": "wardrobe",
    "s": "shelf", "S": "shelf_books", "k": "bookcase", "C": "counter", "K": "cash_till",
    "P": "pc", "X": "box_pc", "H": "healer", "m": "machine", "V": "terminal", "R": "server_rack",
    "O": "cable_duct", "Q": "hologram", "A": "capsule_case", "L": "lab_bench",
    "e": "bench", "p": "plant_pot", "f": "fireplace", "n": "sink", "g": "fridge", "v": "stove",
    "i": "painting", "l": "clock_wall", "w": "wall_wainscot", "j": "mirror",
    "z": "crate", "y": "barrel", "x": "sack", "I": "bin",
    "G": "gym_badge_stand", "N": "gym_statue",
    "E": "piano", "Z": "bar", "Y": "bar_taps", "U": "dartboard", "J": "fruit_machine",
    "(": "greenhouse_wall", ")": "greenhouse_bed", "<": "greenhouse_door", ">": "roof_glass",
    "[": "loom", "]": "wall_render_cream", "{": "brew_vat", "}": "apple_press",
    "|": "fence_iron", ";": "gravestone", ":": "church_wall", "?": "church_window",
    "!": "church_door", "'": "cross_saxon", "\"": "bear_statue",
    "-": "platform", "=": "rail_track_h", "+": "rail_track_v", "*": "statue",
    "1": "rail_buffer", "2": "train_carriage", "3": "train_engine", "4": "train_door",
    "5": "rail_signal", "6": "roof_metal", "7": "wall_brick_dark", "8": "brine_pump",
    "9": "salt_pan", "~": "water", "`": "shallows", "\\": "sign", " ": null
  };
  M.INT = INT;
  M.interior = function (extra) { return B.merge(INT, extra); };

  // ------------------------------------------------------------ shapes ----
  // A room: walls, a top lip, windows along the back, a doormat and a door
  // pair on the bottom row. Returns the canvas plus the door anchor.
  M.room = function (w, h, o) {
    o = o || {};
    const c = B.canvas(w, h, o.floor || "_");
    c.box("g", 0, 0, w, h, o.wall || "#");
    c.hline("g", 0, 0, w, o.top || "^");
    c.hline("g", 1, 1, w - 2, o.wall || "#");
    if (o.win !== null) for (let x = 2; x < w - 2; x += 4) c.set("g", x, 1, o.win || "W");
    const dx = o.doorX === undefined ? Math.floor(w / 2) - 1 : o.doorX;
    c.set("g", dx, h - 1, o.door || "D"); c.set("g", dx + 1, h - 1, o.door || "D");
    c.set("g", dx, h - 2, "M"); c.set("g", dx + 1, h - 2, "M");
    c.door = { x: dx, y: h - 1 };
    c.inside = { x: dx, y: h - 2 };
    return c;
  };

  // A tree-lined carriage drive: two rows of trunks with canopy above.
  M.avenue = function (c, x, y, n, dir, gap, base, top) {
    base = base || "T"; top = top || "y"; gap = gap || 3;
    for (let i = 0; i < n; i++) {
      if (dir === "v") {
        c.set("g", x, y + i, i % gap === 0 ? base : c.at("g", x, y + i));
        c.set("g", x + gap + 1, y + i, i % gap === 0 ? base : c.at("g", x + gap + 1, y + i));
        if (i % gap === 0) { c.set("o", x, y + i - 1, top); c.set("o", x + gap + 1, y + i - 1, top); }
      } else {
        if (i % gap === 0) {
          c.set("g", x + i, y, base); c.set("g", x + i, y + gap + 1, base);
          c.set("o", x + i, y - 1, top); c.set("o", x + i, y + gap, top);
        }
      }
    }
    return c;
  };

  // A lake with a reeded, non-walkable edge. `w`/`h` are the water box.
  M.lake = function (c, x, y, w, h, water, reeds) {
    water = water || "!"; reeds = reeds || "A";
    c.fill("g", x - 1, y - 1, w + 2, h + 2, reeds);
    c.fill("g", x, y, w, h, water);
    return c;
  };

  // A railway viaduct: `n` arches marching across, piers on the ground, the
  // deck on the over layer so the player walks under it.
  M.viaduct = function (c, x, y, n, span, pier, deck, arch) {
    pier = pier || "#"; deck = deck || "^"; arch = arch || "x";
    for (let i = 0; i < n; i++) {
      const px = x + i * span;
      c.vline("g", px, y, 4, pier);
      c.set("g", px + 1, y, arch); c.set("g", px + 2, y, arch);
    }
    c.hline("o", x, y - 1, n * span, deck);
    return c;
  };

  // A rail yard: `n` parallel roads of track with a ballast strip between.
  M.sidings = function (c, x, y, len, n, gapY, track, ballast) {
    track = track || "2"; ballast = ballast || ":";
    for (let i = 0; i < n; i++) {
      const ry = y + i * gapY;
      c.hline("g", x, ry, len, track);
      if (i < n - 1) for (let j = 1; j < gapY; j++) c.hline("g", x, ry + j, len, ballast);
    }
    return c;
  };

  // The Lovell dish: a base block, a bowl of `dish` and a lip on the over
  // layer so the player can stand under the rim.
  M.dish = function (c, cx, cy, r, base, bowl, lip) {
    base = base || "V"; bowl = bowl || "Z"; lip = lip || "^";
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) {
        const d = i * i + j * j;
        if (d > r * r) continue;
        c.set("g", cx + i, cy + j, d > (r - 1) * (r - 1) ? base : bowl);
      }
    }
    for (let i = -r; i <= r; i++) c.set("o", cx + i, cy - r - 1, lip);
    return c;
  };

  // A moat: a ring of water `t` thick around a rect, with one bridge.
  M.moat = function (c, x, y, w, h, t, water, bridge, bx) {
    water = water || "!"; bridge = bridge || "x";
    c.fill("g", x, y, w, h, water);
    c.fill("g", x + t, y + t, w - t * 2, h - t * 2, ".");
    for (let j = 0; j < t; j++) c.set("g", bx === undefined ? x + Math.floor(w / 2) : bx, y + h - 1 - j, bridge);
    return c;
  };

  // ---------------------------------------------------------- the seam ----
  // region-east's maps are finished and are not ours to edit, so the return
  // halves of the two east<->mid links live here, added to the map objects
  // east has already registered. Guarded: if east is not loaded, nothing
  // happens and the mid side simply has no neighbour.
  M.linkBack = function (mapId, warps, signs) {
    const W = MQ.World;
    if (!W || !W.has(mapId)) return false;
    const m = W.get(mapId);
    m.warps = m.warps || [];
    for (let i = 0; i < warps.length; i++) {
      const w = warps[i];
      let dup = false;
      for (let j = 0; j < m.warps.length; j++) if (m.warps[j].x === w.x && m.warps[j].y === w.y) dup = true;
      if (!dup) m.warps.push(w);
    }
    if (signs) { m.signs = (m.signs || []).concat(signs); }
    m.__rt = null;
    return true;
  };

  // Deterministic sprinkle of pickups/props: same seed, same map, forever.
  M.rng = function (seed) { return U.rng("mid:" + seed); };

  MQ.MidBuild = M;
})();
