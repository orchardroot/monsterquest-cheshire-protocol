// =============================================================
// MonsterQuest v2 — MQ.NW: the north-west region's shared legends.
// The painter itself is MQ.EastBuild (js/world/maps/east__build.js) —
// reused, never edited. This file only fixes what a character MEANS
// across `nw_*` maps, so a hedge is a hedge from Delamere to Parkgate.
// Pure string/table work at parse time; no game logic.
// Owned by region-northwest (js/world/maps/nw*.js).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const B = MQ.EastBuild;
  const NW = {};

  // ---- streets, terraces, quays: every town map in the west -------------
  // Sandstone country, so `%` is the default wall of the region.
  const TOWN = {
    " ": null,
    ".": "grass", ",": "grass_dark", '"': "grass_tall", "'": "flowers_white",
    "l": "flowers_yellow", "o": "flowers_red",
    "=": "path_cobble", "-": "pavement", "_": "path_flag", "+": "path_dirt", ":": "path_gravel",
    "r": "road", "k": "kerb", "z": "zebra", "|": "road_line", "s": "steps", "t": "towpath",
    "~": "water_canal", "!": "water_river", "?": "shallows", "e": "water_edge",
    "x": "bridge_stone", "X": "bridge_wood", "Q": "fish_spot", "j": "boat_dock", "J": "narrowboat",
    "K": "canal_lock", "9": "fountain", "/": "well",
    "T": "tree_oak", "y": "tree_oak_top", "B": "tree_birch", "b": "tree_birch_top",
    "(": "tree_pine", ")": "tree_pine_top", "h": "hedge", "i": "hedge_low",
    "f": "fence_wood", "F": "fence_iron", "w": "wall_garden", "G": "gate_iron", "g": "gate_wood",
    "#": "wall_brick_red", "%": "wall_stone_sandstone", "&": "wall_tudor", "^": "wall_tudor_beam",
    "$": "wall_render_cream", "0": "wall_glass", "<": "pub_wall", ">": "pub_door",
    "R": "roof_slate", "@": "roof_tile_red", ";": "roof_over", "1": "roof_metal", "m": "chimney",
    "3": "chimney_smoke", "W": "window", "V": "window_lit", "[": "shop_awning", "]": "bunting",
    "D": "door_wood", "d": "door_red", "S": "door_shop",
    "c": "church_wall", "C": "church_window", "v": "church_door", "p": "church_spire", "n": "gravestone",
    "N": "sign", "P": "sign_post", "u": "noticeboard", "O": "postbox", "q": "phonebox", "U": "bus_stop",
    "L": "lamp_victorian", "H": "bench", "I": "bin", "A": "market_stall", "a": "market_stall_top",
    "M": "statue", "*": "war_memorial", "Y": "planter", "8": "bollard",
    "2": "salt_works_pipe", "Z": "mill_wheel", "E": "cave_entrance",
    "4": "rail_track_h", "5": "rail_track_v", "6": "platform", "7": "platform_edge",
    "{": "berry_bush", "}": "bush", "\\": "crate", "`": "barrel"
  };
  NW.TOWN = TOWN;

  // ---- forest, crag, marsh, estuary: routes and the wild sites ----------
  const LAND = {
    " ": null,
    ".": "grass", ",": "grass_dark", '"': "grass_tall", "'": "pine_needles", ";": "grass_moor",
    "H": "moor_heather", "z": "moor_bog", "n": "moor_stone", "l": "flowers_yellow", "o": "flowers_red",
    "w": "flowers_white", "m": "mushroom", "k": "berry_bush", "}": "bush",
    "=": "path_cobble", "-": "pavement", "_": "path_flag", "+": "path_dirt", "v": "path_gravel",
    ":": "path_tarmac", "t": "towpath", "Y": "boardwalk", "d": "mud", "$": "sand",
    "~": "water_canal", "W": "water_river", "!": "water_deep", "?": "water_flash", "9": "water_pond",
    "e": "water_edge", "s": "shallows", "Z": "waterfall", "a": "marsh", "J": "marsh_pool",
    "x": "bridge_stone", "X": "bridge_wood", "<": "pine_forest_floor", "Q": "fish_spot", "j": "boat_dock",
    "T": "tree_oak", "y": "tree_oak_top", "B": "tree_birch", "b": "tree_birch_top",
    "P": "tree_pine", "p": "tree_pine_top", "A": "tree_willow", "D": "tree_dead", "u": "stump",
    "g": "log", "&": "moss_rock", "r": "rock", "O": "rock_moor", "R": "rock_small", "M": "boulder",
    "c": "cliff_face", "C": "cliff_climb", "0": "cliff_top", "1": "cliff_left", "2": "cliff_right",
    "3": "cliff_corner", "K": "crag", "L": "ledge_down", "E": "cave_entrance",
    "4": "wall_castle", "5": "wall_castle_top", "6": "castle_gate", "7": "castle_tower", "8": "portcullis",
    "h": "hedge", "i": "hedge_low", "f": "fence_wood", "F": "fence_stone", "|": "fence_wire",
    "G": "gate_wood", ">": "gate_iron", "#": "wall_brick_red", "%": "wall_stone_sandstone",
    "@": "roof_tile_red", "^": "roof_over", "q": "bench", "I": "picnic_table", "N": "noticeboard",
    "S": "sign_post", "*": "scarecrow", "/": "hay_bale", "\\": "radio_mast", "`": "chimney_smoke",
    "V": "rail_track_h", "(": "orchard_row", "[": "zoo_fence", "]": "zoo_enclosure",
    "{": "zoo_pool", "U": "zoo_sign"
  };
  NW.LAND = LAND;

  // ---- lit rooms, racks, halls: interiors this region builds by hand -----
  const IN = {
    " ": null,
    ".": "floor_tile", ":": "floor_stone", "_": "floor_tile_check", ",": "floor_wood",
    ";": "floor_wood_dark", "-": "floor_carpet", "=": "rug", "+": "floor_lab", "'": "floor_gym",
    "#": "wall_interior", "^": "wall_interior_top", "%": "wall_stone_sandstone", "0": "wall_glass",
    "w": "wall_render_white", "W": "window", "V": "window_lit", "D": "door_wood", "d": "door_locked",
    "G": "door_gym", "u": "door_stairs_up", "n": "door_stairs_down", "M": "mat_welcome",
    "R": "server_rack", "r": "cable_duct", "T": "terminal", "H": "hologram", "P": "box_pc",
    "b": "lab_bench", "e": "capsule_case", "h": "healer", "C": "counter", "c": "chair", "t": "table",
    "o": "table_round", "l": "stool", "S": "shelf", "k": "bookcase", "B": "shelf_books",
    "m": "machine", "p": "plant_pot", "f": "fireplace", "g": "fridge", "s": "sink", "v": "stove",
    "z": "mirror", "i": "painting", "q": "clock_wall", "x": "crate", "y": "barrel", "a": "sack",
    "A": "gym_statue", "$": "gym_badge_stand", "E": "bed", "F": "bed_head", "j": "wardrobe",
    "K": "piano", "<": "bar", ">": "bar_taps", "N": "noticeboard", "?": "dartboard",
    "!": "fruit_machine", "L": "stairs", "Y": "carpet_stairs", "@": "brew_vat", "Q": "cash_till",
    "(": "cat_bed", ")": "cat_bowl", "~": "water", "*": "statue", "/": "loom", "|": "fence_wire",
    "&": "chippy_counter", "[": "greenhouse_wall", "]": "greenhouse_bed", "{": "greenhouse_door",
    "1": "roof_metal", "2": "salt_works_pipe", "3": "brine_pump", "4": "rail_track_h",
    "5": "rail_track_v", "6": "platform", "7": "platform_edge", "8": "salt_pan", "9": "salt_pile",
    "J": "pc", "O": "counter_top", "U": "bench", "X": "bin", "Z": "phonebox"
  };
  NW.IN = IN;

  // ---- the dark: Beeston's well, the sandstone galleries ----------------
  const CAVE = {
    " ": null,
    ".": "cave_floor", ",": "cave_floor_dark", "_": "mine_floor", "#": "cave_wall", "^": "cave_wall_top",
    "%": "wall_stone_sandstone", "~": "water", "!": "water_deep", "e": "water_edge", "s": "shallows",
    "z": "stalag", "o": "ore", "c": "crystal", "r": "rock_small", "M": "boulder", "&": "moss_rock",
    "E": "cave_entrance", "L": "mine_prop", "-": "mine_cart_rail_h", "|": "mine_cart_rail_v",
    "K": "mine_cart", "N": "sign", "u": "door_stairs_up", "n": "door_stairs_down", "b": "bridge_wood",
    "x": "bridge_stone", "C": "cliff_climb", "S": "steps", "/": "well", "D": "door_wood",
    "T": "terminal", "R": "server_rack", "\\": "crate", "`": "barrel", "Q": "fish_spot"
  };
  NW.CAVE = CAVE;

  NW.town = function (extra) { return B.merge(TOWN, extra); };
  NW.land = function (extra) { return B.merge(LAND, extra); };
  NW.inside = function (extra) { return B.merge(IN, extra); };
  NW.cave = function (extra) { return B.merge(CAVE, extra); };

  // Every nw map goes through one of these three so region/zone/music
  // defaults are never forgotten (and `west` vs `mersey` stays honest).
  function make(kind) {
    return function (id, def, canvas, legend) {
      def.legend = legend || (kind === "in" ? IN : kind === "land" ? LAND : TOWN);
      def.layers = canvas.layers();
      if (def.region === undefined) def.region = "west";
      if (def.outdoor === undefined) def.outdoor = kind !== "in";
      if (def.weatherZone === undefined) def.weatherZone = def.outdoor ? def.region : null;
      if (!def.music) def.music = kind === "land" ? "route_west" : "town_chester";
      if (!def.ambience) def.ambience = kind === "land" ? "forest" : "town";
      return MQ.World.defineMap(id, def);
    };
  }
  NW.defTown = make("town");
  NW.defLand = make("land");
  NW.defIn = make("in");

  // A generic interior box: walls, a top row, a door in the south wall.
  // Returns the canvas so the caller can furnish it.
  NW.room = function (w, h, floor, wall) {
    const c = B.canvas(w, h, floor || ".");
    c.box("g", 0, 0, w, h, wall || "#");
    c.fill("g", 1, 0, w - 2, 1, "^");
    return c;
  };
  NW.doorway = function (c, x, y, ch) {
    c.set("g", x, y, ch || "D"); c.set("g", x + 1, y, ch || "D");
    c.set("g", x, y - 1, "M"); c.set("g", x + 1, y - 1, "M");
    return c;
  };

  // Two door tiles wide, so the player never misses the way out.
  NW.exit = function (x, y, to, tx, ty, dir, kind) {
    return [
      { x: x, y: y, to: to, tx: tx, ty: ty, dir: dir || "down", kind: kind || "door" },
      { x: x + 1, y: y, to: to, tx: tx, ty: ty, dir: dir || "down", kind: kind || "door" }
    ];
  };
  // A run of edge warps along a map border.
  NW.edge = function (x, y, n, horiz, to, tx, ty, dir) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        x: horiz ? x + i : x, y: horiz ? y : y + i,
        to: to, tx: horiz ? tx + i : tx, ty: horiz ? ty : ty + i,
        dir: dir, kind: "edge"
      });
    }
    return out;
  };

  MQ.NW = NW;
})();
