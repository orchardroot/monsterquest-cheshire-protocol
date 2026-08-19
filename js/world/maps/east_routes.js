// =============================================================
// MonsterQuest v2 — the EAST region's routes (WORLD-BIBLE §3 R1-R7, R32).
// Canal towpath, old railway, gritstone trail, river meadows, hedge
// lattice, the Carrs, the boardwalk approach and the Sandhills ridge.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const R = {
    ".": "grass", ",": "grass_dark", '"': "grass_tall", ";": "grass_moor", "H": "moor_heather",
    "l": "flowers_yellow", "o": "flowers_red", "w": "flowers_white", "m": "mushroom", "k": "berry_bush",
    "=": "path_cobble", "+": "path_dirt", "t": "towpath", "v": "path_gravel", "_": "path_flag",
    "~": "water_canal", "W": "water_river", "e": "water_edge", "s": "shallows",
    "x": "bridge_stone", "X": "bridge_wood", "j": "boat_dock", "K": "canal_lock", "Q": "fish_spot",
    "T": "tree_oak", "y": "tree_oak_top", "B": "tree_birch", "b": "tree_birch_top",
    "P": "tree_pine", "p": "tree_pine_top", "A": "tree_willow", "g": "log", "u": "stump",
    "h": "hedge", "i": "hedge_low", "f": "fence_wood", "F": "fence_stone", "G": "gate_wood",
    "r": "rock", "R": "rock_moor", "c": "cliff_face", "C": "cliff_climb", "M": "moor_stone",
    "L": "ledge_down", "d": "mud", "z": "moor_bog", "S": "sign_post", "N": "noticeboard",
    "q": "bench", "I": "picnic_table", "E": "cave_entrance", "V": "rail_track_h", "n": "rail_signal",
    "/": "scarecrow", "*": "hay_bale", "O": "boulder", "D": "door_wood", "#": "wall_brick_red",
    "R2": null, " ": null
  };
  delete R.R2;

  function route(id, def, canvas) {
    def.legend = R;
    def.layers = canvas.layers();
    def.region = def.region || "east";
    def.outdoor = true;
    def.weatherZone = def.weatherZone || "east";
    def.music = def.music || "route_east";
    W.defineMap(id, def);
  }

  // =============== R1 — Macclesfield Canal towpath (N-S) ==================
  // Macclesfield at the south end, Bollington at the north. Sutton bridges,
  // a hidden lock-keeper's garden, and a rope-locked island (Narrowboat).
  let c = B.canvas(34, 46, ",");
  c.fill("g", 0, 0, 34, 1, "T"); c.fill("g", 0, 45, 34, 1, "T");
  c.fill("g", 0, 0, 1, 46, "T"); c.fill("g", 33, 0, 1, 46, "T");
  for (let x = 0; x < 34; x++) { c.set("o", x, 0, "y"); }
  c.fill("g", 15, 0, 3, 1, "t"); c.fill("g", 15, 45, 3, 1, "t");
  // the cut
  c.fill("g", 18, 1, 4, 44, "~");
  c.fill("g", 15, 1, 3, 44, "t");
  c.fill("g", 22, 1, 2, 44, "t");
  // hedgerow and meadow either side
  c.fill("g", 2, 2, 13, 42, ".");
  c.fill("g", 24, 2, 9, 42, ".");
  B.trees(c, "r1-w", 34, 2, 2, 12, 42, "T", "y", ["."]);
  B.trees(c, "r1-e", 22, 25, 2, 8, 42, "B", "b", ["."]);
  c.fill("g", 4, 6, 9, 6, '"');
  c.fill("g", 3, 20, 10, 7, '"');
  c.fill("g", 5, 33, 8, 6, '"');
  c.fill("g", 25, 8, 6, 7, '"');
  c.fill("g", 25, 26, 6, 8, '"');
  // Sutton bridges
  c.fill("g", 17, 12, 6, 1, "x"); c.fill("g", 14, 12, 3, 1, "+"); c.fill("g", 23, 12, 3, 1, "+");
  c.fill("g", 17, 31, 6, 1, "x"); c.fill("g", 14, 31, 3, 1, "+"); c.fill("g", 23, 31, 3, 1, "+");
  // lock flight
  c.set("g", 18, 22, "K"); c.set("g", 21, 22, "K");
  c.set("g", 18, 24, "K"); c.set("g", 21, 24, "K");
  // the lock-keeper's garden, behind a hedge, off the east bank
  c.fill("g", 26, 18, 7, 6, "h");
  c.fill("g", 27, 19, 5, 4, ".");
  c.set("g", 27, 18, "G");
  c.set("g", 29, 20, "k"); c.set("g", 31, 21, "k"); c.set("g", 28, 22, "l"); c.set("g", 30, 19, "o");
  c.set("g", 29, 22, "q");
  // the island in the widened pound
  c.fill("g", 16, 36, 8, 5, "~");
  c.fill("g", 18, 37, 4, 3, ".");
  c.set("g", 19, 38, "j");
  c.fill("g", 18, 37, 4, 1, '"');
  // furniture
  c.set("g", 16, 4, "S"); c.set("g", 23, 20, "S"); c.set("g", 16, 42, "S");
  c.set("g", 22, 8, "Q"); c.set("g", 22, 27, "Q"); c.set("g", 17, 40, "Q");
  c.set("g", 14, 16, "q"); c.set("g", 24, 36, "q");
  c.set("g", 12, 30, "g"); c.set("g", 27, 41, "u");
  route("route_macc_bollington", {
    name: "Macclesfield Canal", ambience: "water", dialogue: "town_macclesfield",
    spawnPoint: { x: 16, y: 44 },
    encounters: { grass: "route_macc_bollington_grass", water: "route_macc_bollington_water" },
    fishing: "fish_route_macc_bollington",
    landmark: { name: "The Macclesfield Canal", x: 16, y: 22 },
    warps: [
      { x: 15, y: 45, to: "macclesfield", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 45, to: "macclesfield", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 17, y: 45, to: "macclesfield", tx: 27, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 0, to: "bollington", tx: 21, ty: 36, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "bollington", tx: 21, ty: 36, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "bollington", tx: 22, ty: 36, dir: "up", kind: "edge" },
      { x: 19, y: 38, to: "route_macc_bollington_island", tx: 9, ty: 12, dir: "up", kind: "door", cond: "boat" }
    ],
    signs: [
      { x: 16, y: 4, text: ["MACCLESFIELD CANAL — Marple 9 miles, Hall Green 12.", "Speed limit 4 mph. The swans enforce it."] },
      { x: 23, y: 20, text: ["BOSLEY LOCKS THIS WAY (eventually).", "Somebody has added: 'Everything is this way eventually.'"] },
      { x: 16, y: 42, text: ["Macclesfield 1/2 mile. Bollington 2 miles.", "MIND THE EDGE."] }
    ],
    items: [
      { x: 6, y: 8, item: "salve", n: 1, flag: "item_route_macc_bollington_1" },
      { x: 30, y: 21, item: "capsule_basic", n: 2, flag: "item_route_macc_bollington_2" },
      { x: 8, y: 36, item: "blackberry", n: 3, hidden: true, flag: "item_route_macc_bollington_3" },
      { x: 28, y: 30, item: "cat_bell", n: 1, hidden: true, flag: "item_route_macc_bollington_4" }
    ],
    npcs: [
      { id: "npc_r1_pete", x: 23, y: 8, dir: "left", sprite: "npc_fisher", behaviour: "still", trainer: "tr_route_macc_bollington_1", sight: 3 },
      { id: "npc_r1_dean", x: 16, y: 18, dir: "down", sprite: "npc_cyclist", behaviour: "look", radius: 4, trainer: "tr_route_macc_bollington_2", sight: 4 },
      { id: "npc_r1_nia", x: 23, y: 27, dir: "left", sprite: "npc_boater", behaviour: "still", trainer: "tr_route_macc_bollington_3", sight: 3 },
      { id: "npc_r1_gwen", x: 16, y: 34, dir: "up", sprite: "npc_walker", behaviour: "still", trainer: "tr_route_macc_bollington_4", sight: 4 },
      { id: "npc_r1_lockkeeper", x: 29, y: 21, dir: "down", sprite: "npc_boater", behaviour: "still",
        say: ["Garden's mine. Hedge is mine. The blackberries are technically the county's.", "Take some. Don't tell the county."] },
      { id: "npc_r1_walker2", x: 25, y: 14, dir: "down", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Moths off the mill lights at night. Thousands of them. It's like snow that's had an idea."] }
    ],
    triggers: [
      { x: 15, y: 26, w: 3, h: 1, script: "east_r1_vex", once: "vex_battle_1", cond: "starter_chosen && !vex_battle_1" }
    ],
    restPoints: [{ x: 14, y: 16, flag: "bigboy_sat_canal" }]
  }, c);

  // island (Narrowboat secret)
  c = B.canvas(20, 16, ".");
  c.fill("g", 0, 0, 20, 16, "~");
  c.fill("g", 3, 3, 14, 10, ".");
  c.fill("g", 5, 5, 10, 6, '"');
  B.trees(c, "island", 8, 3, 3, 14, 10, "A", null, [".", '"']);
  c.set("g", 9, 12, "j");
  c.set("g", 8, 4, "r");
  route("route_macc_bollington_island", {
    name: "The Rope Island", ambience: "water", dialogue: "town_macclesfield",
    spawnPoint: { x: 9, y: 12 },
    encounters: { grass: "route_macc_bollington_island_grass", water: null },
    fishing: "fish_route_macc_bollington",
    warps: [{ x: 9, y: 12, to: "route_macc_bollington", tx: 22, ty: 38, dir: "right", kind: "door" }],
    items: [
      { x: 8, y: 6, item: "silk_cocoon", n: 1, flag: "item_route_macc_bollington_island_1" },
      { x: 13, y: 9, item: "capsule_mesh", n: 2, hidden: true, flag: "item_route_macc_bollington_island_2" }
    ],
    signs: [{ x: 8, y: 4, text: ["Somebody has scratched a date into the rock and then scratched it out.", "Under it: 'she liked it here'."] }]
  }, c);

  // =============== R2 — Middlewood Way (E-W, two tiers) ===================
  c = B.canvas(62, 26, ".");
  c.fill("g", 0, 0, 62, 2, "T"); c.fill("g", 0, 24, 62, 2, "T");
  c.fill("g", 0, 2, 1, 22, "T"); c.fill("g", 61, 2, 1, 22, "T");
  c.fill("g", 0, 11, 1, 3, "v"); c.fill("g", 61, 11, 1, 3, "v");
  // lower tier: the old railway cutting
  c.fill("g", 1, 10, 60, 5, ",");
  c.fill("g", 1, 11, 60, 3, "v");
  c.fill("g", 1, 9, 60, 1, "L");
  c.fill("g", 1, 15, 60, 1, "F");
  // upper tier: field path along the top of the cutting
  c.fill("g", 1, 3, 60, 6, ".");
  c.fill("g", 4, 5, 54, 1, "+");
  c.fill("g", 1, 16, 60, 8, ".");
  c.fill("g", 6, 20, 50, 1, "+");
  // ramps between tiers
  c.fill("g", 12, 6, 2, 4, "+"); c.set("g", 12, 9, "+"); c.set("g", 13, 9, "+");
  c.fill("g", 44, 6, 2, 4, "+"); c.set("g", 44, 9, "+"); c.set("g", 45, 9, "+");
  c.fill("g", 26, 16, 2, 4, "+"); c.set("g", 26, 15, "+"); c.set("g", 27, 15, "+");
  // tunnel mouth (bike shortcut)
  c.fill("g", 30, 10, 5, 1, "c"); c.set("g", 32, 11, "E");
  c.fill("g", 30, 9, 5, 1, "c");
  // viaduct top
  c.fill("g", 52, 9, 6, 1, "x"); c.fill("g", 52, 15, 6, 1, "x");
  // quarry spur (Nancy's paint cache)
  c.fill("g", 16, 17, 8, 6, "R");
  c.fill("g", 17, 18, 6, 4, "+");
  c.set("g", 20, 22, "+");
  // planting and grass
  B.trees(c, "r2-n", 30, 2, 3, 58, 6, "B", "b", ["."]);
  B.trees(c, "r2-s", 26, 2, 16, 58, 8, "T", "y", ["."]);
  c.fill("g", 6, 6, 5, 3, '"'); c.fill("g", 20, 3, 5, 5, '"'); c.fill("g", 36, 4, 6, 4, '"');
  c.fill("g", 50, 3, 8, 5, '"'); c.fill("g", 32, 17, 8, 6, '"'); c.fill("g", 46, 18, 9, 5, '"');
  c.fill("g", 4, 18, 8, 5, '"');
  c.set("g", 3, 12, "S"); c.set("g", 58, 12, "S"); c.set("g", 29, 12, "S");
  c.set("g", 10, 12, "q"); c.set("g", 40, 12, "q");
  route("route_bollington_poynton", {
    name: "The Middlewood Way", ambience: "forest", dialogue: "town_bollington",
    spawnPoint: { x: 59, y: 12 },
    encounters: { grass: "route_bollington_poynton_grass", water: null },
    landmark: { name: "Middlewood Way", x: 30, y: 12 },
    warps: [
      { x: 61, y: 12, to: "bollington", tx: 1, ty: 20, dir: "right", kind: "edge" },
      { x: 61, y: 11, to: "bollington", tx: 1, ty: 20, dir: "right", kind: "edge" },
      { x: 61, y: 13, to: "bollington", tx: 1, ty: 21, dir: "right", kind: "edge" },
      { x: 0, y: 12, to: "poynton", tx: 46, ty: 17, dir: "left", kind: "edge" },
      { x: 0, y: 11, to: "poynton", tx: 46, ty: 17, dir: "left", kind: "edge" },
      { x: 0, y: 13, to: "poynton", tx: 46, ty: 18, dir: "left", kind: "edge" },
      { x: 32, y: 11, to: "route_bollington_poynton_tunnel", tx: 23, ty: 6, dir: "left", kind: "cave" }
    ],
    signs: [
      { x: 3, y: 12, text: ["MIDDLEWOOD WAY — Marple 4, Macclesfield 6.", "Cyclists give way to horses. Horses give way to nobody."] },
      { x: 58, y: 12, text: ["BOLLINGTON 1/2 MILE.", "The viaduct is the good bit. Take the top path."] },
      { x: 29, y: 12, text: ["TUNNEL CLOSED TO PEDESTRIANS.", "Underneath, in biro: 'not to bikes though'."] }
    ],
    items: [
      { x: 20, y: 20, item: "collectible_1", n: 1, flag: "item_route_bollington_poynton_1" },
      { x: 8, y: 20, item: "capsule_basic", n: 2, flag: "item_route_bollington_poynton_2" },
      { x: 54, y: 5, item: "damson", n: 3, hidden: true, flag: "item_route_bollington_poynton_3" }
    ],
    npcs: [
      { id: "npc_r2_aled", x: 22, y: 12, dir: "left", sprite: "npc_cyclist", behaviour: "look", radius: 5, trainer: "tr_route_bollington_poynton_1", sight: 5 },
      { id: "npc_r2_fern", x: 48, y: 12, dir: "left", sprite: "npc_cyclist", behaviour: "look", radius: 5, trainer: "tr_route_bollington_poynton_2", sight: 5 },
      { id: "npc_r2_hobb", x: 30, y: 20, dir: "up", sprite: "npc_farmer", behaviour: "still", trainer: "tr_route_bollington_poynton_3", sight: 4 },
      { id: "npc_r2_walker", x: 24, y: 5, dir: "down", sprite: "npc_walker", behaviour: "path", path: [[24, 5], [40, 5]], pathMode: "pingpong",
        say: ["Two tiers. Top for the view, bottom for the speed, and never the two shall agree."] },
      { id: "npc_r2_kid", x: 18, y: 21, dir: "right", sprite: "npc_kid", behaviour: "wander", radius: 2,
        say: ["There's paint hid in the quarry. Proper paint. Whitewash and a brush and everything."] }
    ]
  }, c);

  c = B.canvas(26, 12, "d");
  c.fill("g", 0, 0, 26, 4, "c"); c.fill("g", 0, 8, 26, 4, "c");
  c.fill("g", 0, 4, 26, 4, "v");
  c.set("g", 0, 5, "E"); c.set("g", 25, 6, "E");
  c.fill("g", 8, 4, 2, 4, "r"); c.fill("g", 16, 5, 2, 3, "r");
  route("route_bollington_poynton_tunnel", {
    name: "Middlewood Tunnel", ambience: "cave", region: "interior", outdoor: false,
    music: "dungeon_cave", dialogue: "town_bollington", dark: true,
    spawnPoint: { x: 23, y: 6 },
    encounters: { cave: "route_bollington_poynton_tunnel_cave" },
    warps: [
      { x: 25, y: 6, to: "route_bollington_poynton", tx: 33, ty: 11, dir: "right", kind: "cave" },
      { x: 0, y: 5, to: "route_bollington_poynton", tx: 29, ty: 11, dir: "left", kind: "cave" }
    ],
    items: [{ x: 12, y: 6, item: "copper_wire", n: 1, hidden: true, flag: "item_route_bollington_poynton_tunnel_1" }],
    npcs: [{ id: "npc_r2t_bat", x: 20, y: 5, dir: "left", sprite: "npc_caver", behaviour: "still",
      say: ["Bats. Bats bats bats. I count them and they count me. Fair's fair."] }]
  }, c);

  // =============== R3 — Gritstone Trail North (N-S) =======================
  c = B.canvas(34, 46, ";");
  c.fill("g", 0, 0, 34, 1, "R"); c.fill("g", 0, 45, 34, 1, "R");
  c.fill("g", 0, 0, 1, 46, "R"); c.fill("g", 33, 0, 1, 46, "R");
  c.fill("g", 15, 0, 3, 1, "+"); c.fill("g", 15, 45, 3, 1, "+");
  c.snake("g", "r3", "+", 16, 1, 44, "v", 2, 0.4);
  c.fill("g", 2, 4, 8, 7, "H"); c.fill("g", 22, 8, 9, 6, "H");
  c.fill("g", 4, 20, 9, 8, "H"); c.fill("g", 23, 24, 8, 9, "H");
  c.fill("g", 6, 36, 10, 6, "H");
  // dry stone walls with gates (deer crossings)
  c.fill("g", 1, 14, 32, 1, "F"); c.set("g", 14, 14, "G"); c.set("g", 24, 14, "G");
  c.fill("g", 1, 30, 32, 1, "F"); c.set("g", 17, 30, "G"); c.set("g", 8, 30, "G");
  // gritstone edge and a ledge drop
  c.fill("g", 26, 34, 7, 8, "c");
  c.fill("g", 24, 34, 2, 8, "C");
  c.fill("g", 4, 16, 12, 1, "L");
  B.trees(c, "r3-t", 14, 2, 32, 30, 12, "P", "p", [";"]);
  c.set("g", 20, 6, "M"); c.set("g", 12, 24, "M"); c.set("g", 8, 42, "M");
  c.set("g", 16, 4, "S"); c.set("g", 17, 42, "S"); c.set("g", 15, 22, "q");
  c.fill("g", 10, 6, 5, 4, "r");
  route("route_poynton_lyme", {
    name: "Gritstone Trail North", ambience: "moor", dialogue: "town_lyme_park",
    spawnPoint: { x: 16, y: 44 },
    encounters: { grass: "route_poynton_lyme_grass", water: null },
    landmark: { name: "Gritstone Trail", x: 16, y: 22 },
    warps: [
      { x: 15, y: 45, to: "poynton", tx: 23, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 45, to: "poynton", tx: 24, ty: 1, dir: "down", kind: "edge" },
      { x: 17, y: 45, to: "poynton", tx: 25, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 0, to: "lyme_park", tx: 26, ty: 36, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "lyme_park", tx: 26, ty: 36, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "lyme_park", tx: 27, ty: 36, dir: "up", kind: "edge" }
    ],
    signs: [
      { x: 16, y: 4, text: ["GRITSTONE TRAIL — Lyme Park 1 mile, Mow Cop 34.", "It is thirty-four miles. People do it. People are strange."] },
      { x: 17, y: 42, text: ["WIND WARNING", "A little windsock on a pole. It is horizontal. It is always horizontal."] }
    ],
    items: [
      { x: 6, y: 8, item: "capsule_basic", n: 2, flag: "item_route_poynton_lyme_1" },
      { x: 29, y: 27, item: "tonic", n: 1, hidden: true, flag: "item_route_poynton_lyme_2" },
      { x: 11, y: 39, item: "sloe", n: 3, flag: "item_route_poynton_lyme_3" }
    ],
    npcs: [
      { id: "npc_r3_idris", x: 16, y: 18, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_poynton_lyme_1", sight: 4 },
      { id: "npc_r3_nel", x: 17, y: 34, dir: "up", sprite: "npc_fellrunner", behaviour: "look", radius: 4, trainer: "tr_route_poynton_lyme_2", sight: 4 },
      { id: "npc_r3_deer", x: 20, y: 15, dir: "left", sprite: "deer", behaviour: "wander", radius: 4,
        say: ["The stag looks at you the way a bank looks at a small overdraft."] }
    ],
    restPoints: [{ x: 15, y: 22, flag: "bigboy_sat_gritstone" }]
  }, c);

  // =============== R4 — Bollin Valley lane (E-W) ==========================
  c = B.canvas(46, 26, ".");
  c.fill("g", 0, 0, 46, 2, "T"); c.fill("g", 0, 24, 46, 2, "T");
  c.fill("g", 0, 2, 1, 22, "T"); c.fill("g", 45, 2, 1, 22, "T");
  c.fill("g", 0, 12, 1, 3, "+"); c.fill("g", 45, 12, 1, 3, "+");
  c.fill("g", 1, 2, 44, 22, ".");
  // the river Bollin
  c.snake("g", "bollin", "W", 1, 16, 44, "h", 2, 0.4);
  c.fill("g", 1, 13, 44, 1, "+");
  // two fords
  c.fill("g", 12, 15, 2, 4, "s"); c.fill("g", 30, 16, 2, 4, "s");
  c.fill("g", 12, 13, 2, 2, "+"); c.fill("g", 30, 13, 2, 3, "+");
  // meadows and a mill race pocket
  c.fill("g", 3, 4, 10, 7, '"'); c.fill("g", 20, 3, 9, 7, '"'); c.fill("g", 34, 5, 9, 6, '"');
  c.fill("g", 4, 20, 8, 3, '"'); c.fill("g", 24, 21, 10, 2, '"');
  c.fill("g", 36, 19, 7, 4, "h");
  c.fill("g", 37, 20, 5, 2, ".");
  c.set("g", 37, 19, "G");
  c.set("g", 39, 21, "K");
  B.trees(c, "r4", 26, 1, 2, 44, 22, "A", null, ["."]);
  c.set("g", 5, 13, "S"); c.set("g", 40, 13, "S");
  c.set("g", 22, 12, "q"); c.set("g", 16, 20, "I");
  c.set("g", 18, 17, "Q"); c.set("g", 34, 18, "Q");
  route("route_macc_prestbury", {
    name: "Bollin Valley Lane", ambience: "water", dialogue: "town_prestbury",
    spawnPoint: { x: 44, y: 13 },
    encounters: { grass: "route_macc_prestbury_grass", water: "route_macc_prestbury_water" },
    fishing: "fish_route_macc_bollington",
    warps: [
      { x: 45, y: 12, to: "macclesfield", tx: 1, ty: 16, dir: "right", kind: "edge" },
      { x: 45, y: 13, to: "macclesfield", tx: 1, ty: 17, dir: "right", kind: "edge" },
      { x: 45, y: 14, to: "macclesfield", tx: 1, ty: 18, dir: "right", kind: "edge" },
      { x: 0, y: 12, to: "prestbury", tx: 42, ty: 14, dir: "left", kind: "edge" },
      { x: 0, y: 13, to: "prestbury", tx: 42, ty: 15, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "prestbury", tx: 42, ty: 16, dir: "left", kind: "edge" }
    ],
    signs: [
      { x: 5, y: 13, text: ["PRESTBURY 1/2 MILE.", "FORD — IMPASSABLE AFTER HEAVY RAIN.", "Someone has crossed out 'heavy'."] },
      { x: 40, y: 13, text: ["MACCLESFIELD 1 MILE. Mind the herons; they are not shy and they are not kind."] }
    ],
    items: [
      { x: 40, y: 21, item: "elixir", n: 1, hidden: true, flag: "item_route_macc_prestbury_1" },
      { x: 25, y: 6, item: "capsule_basic", n: 2, flag: "item_route_macc_prestbury_2" }
    ],
    npcs: [
      { id: "npc_r4_meg", x: 20, y: 17, dir: "up", sprite: "npc_fisher", behaviour: "still", trainer: "tr_route_macc_prestbury_1", sight: 3 },
      { id: "npc_r4_sion", x: 27, y: 13, dir: "right", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_macc_prestbury_2", sight: 4 },
      { id: "npc_r4_heron", x: 15, y: 18, dir: "left", sprite: "heron", behaviour: "still",
        say: ["The heron does not move. The heron has never moved. The heron will outlive the county."] }
    ]
  }, c);

  // =============== R5 — Mottram lanes (hedge lattice) =====================
  c = B.canvas(46, 34, ".");
  c.fill("g", 0, 0, 46, 1, "h"); c.fill("g", 0, 33, 46, 1, "h");
  c.fill("g", 0, 0, 1, 34, "h"); c.fill("g", 45, 0, 1, 34, "h");
  c.fill("g", 45, 15, 1, 3, "+"); c.fill("g", 0, 15, 1, 3, "+");
  // lattice of lanes with hedges between
  for (let gy = 1; gy < 33; gy += 8) c.fill("g", 1, gy, 44, 1, "h");
  for (let gx = 1; gx < 45; gx += 9) c.fill("g", gx, 1, 1, 32, "h");
  c.fill("g", 1, 16, 44, 2, "+");
  for (let gx = 1; gx < 45; gx += 9) c.fill("g", gx, 16, 1, 2, "+");
  c.fill("g", 5, 1, 2, 32, "+");
  c.fill("g", 23, 1, 2, 32, "+");
  c.fill("g", 41, 1, 2, 32, "+");
  for (let gy = 1; gy < 33; gy += 8) { c.fill("g", 5, gy, 2, 1, "+"); c.fill("g", 23, gy, 2, 1, "+"); c.fill("g", 41, gy, 2, 1, "+"); }
  // fields between the lanes
  c.fill("g", 8, 3, 6, 4, '"'); c.fill("g", 27, 3, 7, 4, '"');
  c.fill("g", 10, 11, 7, 4, '"'); c.fill("g", 30, 10, 8, 5, '"');
  c.fill("g", 8, 20, 8, 4, '"'); c.fill("g", 28, 20, 7, 4, '"');
  c.fill("g", 11, 27, 7, 5, '"'); c.fill("g", 32, 27, 8, 5, '"');
  c.set("g", 16, 5, "/"); c.set("g", 36, 22, "*"); c.set("g", 12, 29, "*");
  c.set("g", 4, 16, "S"); c.set("g", 43, 17, "S");
  c.set("g", 20, 17, "q");
  // billhook gaps (diagonal shortcuts through the hedges)
  c.set("g", 10, 9, "i"); c.set("g", 33, 9, "i"); c.set("g", 19, 25, "i"); c.set("g", 37, 25, "i");
  B.trees(c, "r5", 14, 1, 1, 44, 32, "T", "y", ["."]);
  route("route_prestbury_wilmslow", {
    name: "Mottram Lanes", ambience: "forest", dialogue: "town_prestbury",
    spawnPoint: { x: 44, y: 16 },
    encounters: { grass: "route_prestbury_wilmslow_grass", water: null },
    warps: [
      { x: 45, y: 15, to: "prestbury", tx: 1, ty: 13, dir: "right", kind: "edge" },
      { x: 45, y: 16, to: "prestbury", tx: 1, ty: 14, dir: "right", kind: "edge" },
      { x: 45, y: 17, to: "prestbury", tx: 1, ty: 15, dir: "right", kind: "edge" },
      { x: 0, y: 15, to: "wilmslow", tx: 50, ty: 19, dir: "left", kind: "edge" },
      { x: 0, y: 16, to: "wilmslow", tx: 50, ty: 20, dir: "left", kind: "edge" },
      { x: 0, y: 17, to: "wilmslow", tx: 50, ty: 21, dir: "left", kind: "edge" }
    ],
    billhookGaps: ["10,9", "33,9", "19,25", "37,25"],
    signs: [
      { x: 4, y: 16, text: ["WILMSLOW 2 MILES.", "The lanes are a lattice. The lattice is a maze. The maze is somebody's field boundary from 1310."] },
      { x: 43, y: 17, text: ["PRESTBURY 1 MILE. NO TURNING, NO PASSING, NO PATIENCE."] }
    ],
    items: [
      { x: 13, y: 13, item: "billhook_charm", n: 1, hidden: true, flag: "item_route_prestbury_wilmslow_1" },
      { x: 34, y: 5, item: "tonic", n: 1, flag: "item_route_prestbury_wilmslow_2" },
      { x: 15, y: 29, item: "capsule_mesh", n: 1, hidden: true, flag: "item_route_prestbury_wilmslow_3" }
    ],
    npcs: [
      { id: "npc_r5_cadoc", x: 24, y: 17, dir: "left", sprite: "npc_farmer", behaviour: "still", script: "east_r5_cadoc" },
      { id: "npc_r5_bryn", x: 6, y: 10, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_prestbury_wilmslow_2", sight: 4 },
      { id: "npc_r5_kai", x: 42, y: 26, dir: "left", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_prestbury_wilmslow_3", sight: 4 }
    ]
  }, c);

  // =============== R32 — Tegg's Nose lane (N-S) ===========================
  c = B.canvas(40, 30, ",");
  c.fill("g", 0, 0, 40, 1, "T"); c.fill("g", 0, 29, 40, 1, "R");
  c.fill("g", 0, 1, 1, 28, "T"); c.fill("g", 39, 1, 1, 28, "R");
  c.fill("g", 5, 0, 3, 1, "+"); c.fill("g", 17, 29, 3, 1, "+");
  c.fill("g", 1, 1, 38, 28, ".");
  c.snake("g", "r32", "+", 6, 1, 28, "v", 2, 0.5);
  c.fill("g", 6, 26, 12, 2, "+");
  c.fill("g", 17, 26, 3, 3, "+");
  c.fill("g", 20, 6, 18, 22, ";");
  c.fill("g", 26, 12, 9, 7, "H");
  c.fill("g", 24, 20, 12, 6, "H");
  c.fill("g", 2, 4, 7, 5, '"'); c.fill("g", 12, 8, 7, 6, '"'); c.fill("g", 3, 16, 8, 7, '"');
  c.fill("g", 12, 20, 6, 5, '"');
  c.fill("g", 1, 10, 38, 1, "F"); c.set("g", 7, 10, "G"); c.set("g", 25, 10, "G");
  c.fill("g", 30, 2, 8, 4, "c");
  c.fill("g", 28, 2, 2, 4, "C");
  B.trees(c, "r32", 24, 1, 1, 20, 20, "P", "p", ["."]);
  c.set("g", 8, 5, "S"); c.set("g", 18, 25, "S");
  c.set("g", 14, 15, "q"); c.set("g", 22, 8, "M");
  route("route_macc_teggs", {
    name: "Tegg's Nose Lane", ambience: "moor", dialogue: "town_teggs_nose",
    spawnPoint: { x: 6, y: 2 },
    encounters: { grass: "route_macc_teggs_grass", water: null },
    warps: [
      { x: 5, y: 0, to: "macclesfield", tx: 46, ty: 42, dir: "up", kind: "edge" },
      { x: 6, y: 0, to: "macclesfield", tx: 47, ty: 42, dir: "up", kind: "edge" },
      { x: 7, y: 0, to: "macclesfield", tx: 48, ty: 42, dir: "up", kind: "edge" },
      { x: 17, y: 29, to: "teggs_nose", tx: 23, ty: 1, dir: "down", kind: "edge" },
      { x: 18, y: 29, to: "teggs_nose", tx: 24, ty: 1, dir: "down", kind: "edge" },
      { x: 19, y: 29, to: "teggs_nose", tx: 25, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 8, y: 5, text: ["TEGG'S NOSE COUNTRY PARK 2 MILES.", "GRADIENT 1 IN 5. THE SIGN IS BEING KIND."] },
      { x: 18, y: 25, text: ["You are now 1,000 feet above Macclesfield and 40 minutes from a cup of tea."] }
    ],
    items: [
      { x: 5, y: 18, item: "capsule_basic", n: 2, flag: "item_route_macc_teggs_1" },
      { x: 33, y: 24, item: "hide_plate", n: 1, hidden: true, flag: "item_route_macc_teggs_2" }
    ],
    npcs: [
      { id: "npc_r32_hesta", x: 7, y: 14, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_macc_teggs_1", sight: 4 },
      { id: "npc_r32_biker", x: 14, y: 12, dir: "right", sprite: "npc_fellrunner", behaviour: "wander", radius: 3,
        say: ["Cat and Fiddle road. Bikers all summer, ice all winter, sheep all year."] }
    ]
  }, c);

  // =============== R6 — The Carrs (N-S, Wilmslow to Styal) ================
  c = B.canvas(32, 34, ".");
  c.fill("g", 0, 0, 32, 1, "T"); c.fill("g", 0, 33, 32, 1, "T");
  c.fill("g", 0, 1, 1, 32, "T"); c.fill("g", 31, 1, 1, 32, "T");
  c.fill("g", 14, 0, 3, 1, "+"); c.fill("g", 14, 33, 3, 1, "+");
  c.fill("g", 1, 1, 30, 32, ".");
  // the Bollin through the park, paths on both banks
  c.fill("g", 13, 1, 5, 32, "W");
  c.fill("g", 12, 1, 1, 32, "e"); c.fill("g", 18, 1, 1, 32, "e");
  c.fill("g", 9, 1, 3, 32, "+");
  c.fill("g", 19, 1, 3, 32, "+");
  // stepping stones and a footbridge
  c.fill("g", 13, 14, 5, 1, "s");
  c.fill("g", 13, 25, 5, 1, "X");
  c.fill("g", 14, 0, 3, 1, "+"); c.fill("g", 14, 33, 3, 1, "+");
  c.fill("g", 12, 0, 7, 1, "+"); c.fill("g", 12, 33, 7, 1, "+");
  c.fill("g", 2, 3, 7, 6, '"'); c.fill("g", 23, 4, 7, 7, '"');
  c.fill("g", 2, 18, 6, 7, '"'); c.fill("g", 23, 17, 7, 8, '"');
  c.fill("g", 3, 28, 6, 4, '"');
  B.trees(c, "r6", 30, 1, 1, 30, 32, "A", null, ["."]);
  c.set("g", 20, 4, "S"); c.set("g", 10, 30, "S");
  c.set("g", 20, 12, "Q"); c.set("g", 11, 21, "Q"); c.set("g", 20, 28, "Q");
  c.set("g", 10, 8, "q"); c.set("g", 21, 20, "I");
  route("route_wilmslow_styal", {
    name: "The Carrs", ambience: "water", dialogue: "town_wilmslow", region: "bollin", weatherZone: "bollin",
    music: "route_bollin",
    spawnPoint: { x: 20, y: 32 },
    encounters: { grass: "route_wilmslow_styal_grass", water: "route_wilmslow_styal_water" },
    fishing: "fish_route_wilmslow_styal",
    warps: [
      { x: 14, y: 33, to: "wilmslow", tx: 25, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 33, to: "wilmslow", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 33, to: "wilmslow", tx: 27, ty: 1, dir: "down", kind: "edge" },
      { x: 14, y: 0, to: "styal", tx: 21, ty: 33, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "styal", tx: 22, ty: 33, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "styal", tx: 23, ty: 33, dir: "up", kind: "edge" }
    ],
    signs: [
      { x: 20, y: 4, text: ["THE CARRS — Wilmslow's park.", "STEPPING STONES MAY BE UNDERWATER. They usually are."] },
      { x: 10, y: 30, text: ["STYAL AND QUARRY BANK MILL, 1 MILE NORTH.", "Listen for the wheel."] }
    ],
    items: [
      { x: 5, y: 21, item: "rod_bamboo", n: 1, hidden: true, flag: "item_route_wilmslow_styal_1" },
      { x: 27, y: 7, item: "tonic", n: 1, flag: "item_route_wilmslow_styal_2" }
    ],
    npcs: [
      { id: "npc_r6_perry", x: 20, y: 13, dir: "left", sprite: "npc_fisher", behaviour: "still", trainer: "tr_route_wilmslow_styal_1", sight: 3 },
      { id: "npc_r6_kwame", x: 10, y: 18, dir: "down", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_route_wilmslow_styal_2", sight: 4 },
      { id: "npc_r6_troll", x: 15, y: 26, dir: "up", sprite: "npc_kid", behaviour: "still",
        say: ["I'm the footbridge troll. You have to answer a riddle.", "...I haven't got one. Just go over. Sorry."] }
    ]
  }, c);

  // =============== Lindow edge — the boardwalk approach ===================
  c = B.canvas(30, 22, ".");
  c.fill("g", 0, 0, 30, 1, "T"); c.fill("g", 0, 21, 30, 1, "T");
  c.fill("g", 0, 1, 1, 20, "T"); c.fill("g", 29, 1, 1, 20, "T");
  c.fill("g", 29, 9, 1, 3, "+"); c.fill("g", 0, 9, 1, 3, "X");
  c.fill("g", 1, 1, 28, 20, ",");
  c.fill("g", 1, 9, 28, 3, "X");
  c.fill("g", 2, 2, 26, 6, "z");
  c.fill("g", 2, 13, 26, 7, "z");
  c.fill("g", 4, 3, 8, 4, '"'); c.fill("g", 17, 4, 8, 3, '"');
  c.fill("g", 5, 15, 9, 4, '"'); c.fill("g", 18, 14, 8, 5, '"');
  c.fill("g", 22, 9, 1, 3, "+"); c.fill("g", 22, 6, 1, 4, "+");
  c.set("g", 25, 10, "S");
  B.trees(c, "lindow-app", 10, 1, 1, 28, 20, "B", "b", [","]);
  route("route_wilmslow_lindow", {
    name: "Lindow Approach", ambience: "moor", dialogue: "town_lindow_moss", region: "bollin", weatherZone: "bollin",
    music: "dungeon_bog",
    spawnPoint: { x: 28, y: 10 },
    encounters: { grass: "route_wilmslow_lindow_grass", water: null },
    warps: [
      { x: 29, y: 9, to: "wilmslow", tx: 1, ty: 23, dir: "right", kind: "edge" },
      { x: 29, y: 10, to: "wilmslow", tx: 1, ty: 24, dir: "right", kind: "edge" },
      { x: 29, y: 11, to: "wilmslow", tx: 1, ty: 25, dir: "right", kind: "edge" },
      { x: 0, y: 9, to: "lindow_moss", tx: 46, ty: 19, dir: "left", kind: "edge" },
      { x: 0, y: 10, to: "lindow_moss", tx: 46, ty: 20, dir: "left", kind: "edge" },
      { x: 0, y: 11, to: "lindow_moss", tx: 46, ty: 21, dir: "left", kind: "edge" }
    ],
    signs: [{ x: 25, y: 10, text: ["LINDOW MOSS", "KEEP TO THE BOARDWALK.", "In marker pen: 'the boardwalk moves'."] }],
    items: [{ x: 22, y: 6, item: "antidote", n: 2, flag: "item_route_wilmslow_lindow_1" }],
    npcs: [
      { id: "npc_lindow_app_walker", x: 14, y: 10, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Peat's ninety per cent water. You're walking on a held breath."] }
    ]
  }, c);

  // =============== R7 — Alderley Road & Sandhills (N-S) ===================
  c = B.canvas(34, 44, ".");
  c.fill("g", 0, 0, 34, 1, "T"); c.fill("g", 0, 43, 34, 1, "T");
  c.fill("g", 0, 1, 1, 42, "T"); c.fill("g", 33, 1, 1, 42, "T");
  c.fill("g", 15, 0, 3, 1, "="); c.fill("g", 15, 43, 3, 1, "+");
  c.fill("g", 1, 1, 32, 42, ".");
  c.fill("g", 15, 1, 3, 42, "=");
  // birchwood ridge and the Beacon spur
  c.fill("g", 20, 6, 13, 14, ",");
  B.trees(c, "r7-birch", 44, 20, 6, 13, 14, "B", "b", [","]);
  c.fill("g", 24, 22, 3, 12, "+");
  c.fill("g", 24, 34, 8, 5, "R");
  c.fill("g", 25, 35, 6, 3, "+");
  c.set("g", 28, 36, "M");
  // sandy banks, ledges and pockets
  c.fill("g", 2, 4, 11, 8, '"'); c.fill("g", 3, 16, 10, 7, '"');
  c.fill("g", 2, 28, 12, 9, '"'); c.fill("g", 20, 22, 3, 8, '"');
  c.fill("g", 1, 24, 13, 1, "L");
  c.fill("g", 27, 3, 6, 3, "c");
  c.fill("g", 25, 3, 2, 3, "C");
  c.set("g", 14, 6, "S"); c.set("g", 18, 40, "S"); c.set("g", 23, 33, "S");
  c.set("g", 14, 20, "q"); c.set("g", 18, 30, "q");
  c.set("g", 11, 14, "k"); c.set("g", 6, 33, "k"); c.set("g", 29, 25, "k");
  route("route_wilmslow_alderley", {
    name: "Alderley Road & the Sandhills", ambience: "forest", dialogue: "town_alderley_edge",
    region: "bollin", weatherZone: "bollin", music: "route_bollin",
    spawnPoint: { x: 16, y: 2 },
    encounters: { grass: "route_wilmslow_alderley_grass", water: null },
    landmark: { name: "The Sandhills", x: 26, y: 14 },
    warps: [
      { x: 15, y: 0, to: "wilmslow", tx: 17, ty: 36, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "wilmslow", tx: 18, ty: 36, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "wilmslow", tx: 19, ty: 36, dir: "up", kind: "edge" },
      { x: 15, y: 43, to: "alderley_edge", tx: 25, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 43, to: "alderley_edge", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 17, y: 43, to: "alderley_edge", tx: 27, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 14, y: 6, text: ["WILMSLOW 1 MILE. ALDERLEY EDGE 2.", "The birch ridge is worth the detour at sunset. Everything is worth the detour at sunset."] },
      { x: 18, y: 40, text: ["ALDERLEY EDGE — village, then the Edge itself.", "Mind the tourists and the legends, in that order."] },
      { x: 23, y: 33, text: ["ARMADA BEACON SITE", "They lit a fire here to say the Spanish were coming. It worked."] }
    ],
    items: [
      { x: 30, y: 12, item: "capsule_night", n: 2, hidden: true, flag: "item_route_wilmslow_alderley_1" },
      { x: 8, y: 31, item: "tonic", n: 2, flag: "item_route_wilmslow_alderley_2" },
      { x: 28, y: 37, item: "viewpoint_alderley_edge", n: 1, flag: "item_route_wilmslow_alderley_3" }
    ],
    npcs: [
      { id: "npc_r7_tegan", x: 16, y: 16, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_wilmslow_alderley_1", sight: 4 },
      { id: "npc_r7_cass", x: 25, y: 24, dir: "up", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_route_wilmslow_alderley_2", sight: 4 },
      { id: "npc_r7_owl", x: 27, y: 14, dir: "down", sprite: "npc_ranger", behaviour: "wander", radius: 3,
        say: ["Owlets on the spur twenty minutes before dark. Not nineteen. Not twenty-five."] }
    ],
    restPoints: [{ x: 18, y: 30, flag: "bigboy_sat_sandhills" }]
  }, c);
})();
