// =============================================================
// MonsterQuest v2 — WINSFORD & THE FLASHES (region salt, Ch.7)
// A town with holes under it. The salt was taken out and the county
// came down to fill the gap, so half of Winsford is lakes now and the
// other half is a working rock-salt mine with an archive in the bottom
// of it. Mine-Captain Rhona runs the cage. Archivist Ivo runs the cold.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const TOWN = B.salt({ "V": "wall_render_white", "M": "chimney_mill", "%": "shop_awning", "q": "picnic_table" });

  // ------------------------------------------------------------ the town --
  const c = B.canvas(52, 40, ".");
  c.fill("g", 0, 0, 52, 1, "T"); c.fill("g", 0, 39, 52, 1, "T");
  c.fill("g", 0, 1, 1, 38, "T"); c.fill("g", 51, 1, 1, 38, "T");
  for (let x = 0; x < 52; x++) c.set("o", x, 0, "y");

  // streets: High Street across the middle, Weaver Street down the west
  c.fill("g", 1, 18, 50, 3, "=");
  c.fill("g", 1, 17, 50, 1, "-"); c.fill("g", 1, 21, 50, 1, "-");
  c.fill("g", 24, 21, 3, 18, "=");
  c.fill("o", 24, 39, 3, 1, " ");
  c.fill("g", 20, 0, 3, 18, "=");
  c.fill("o", 20, 0, 3, 1, " ");
  c.fill("g", 44, 18, 7, 3, "=");
  c.fill("g", 8, 3, 3, 15, "=");

  // ---- the Flashes: Top Flash north-west, Bottom Flash south-east --------
  c.fill("g", 2, 2, 17, 14, "7");
  c.fill("g", 1, 1, 19, 1, "?"); c.fill("g", 1, 16, 19, 1, "?");
  c.fill("g", 1, 2, 1, 14, "?");
  c.fill("g", 30, 24, 20, 13, "7");
  c.fill("g", 29, 23, 22, 1, "?"); c.fill("g", 29, 37, 22, 1, "?");
  c.fill("g", 29, 24, 1, 13, "?");
  c.set("g", 8, 16, "Q"); c.set("g", 3, 8, "Q"); c.set("g", 33, 23, "Q"); c.set("g", 45, 37, "Q");
  // the boardwalk out into Top Flash, and a jetty on Bottom Flash
  c.fill("g", 11, 2, 1, 14, "Y"); c.fill("g", 11, 5, 6, 1, "Y");
  c.set("g", 17, 5, "Q");
  c.fill("g", 36, 24, 1, 5, "Y"); c.set("g", 36, 29, "Q");
  // the Weaver, running south through town under the High Street
  c.fill("g", 26, 22, 3, 2, "!");
  c.fill("g", 22, 22, 4, 17, ",");
  c.fill("g", 27, 22, 2, 1, "!");

  // ---- the mine head: headgear, offices, the cage -------------------------
  c.fill("g", 34, 2, 16, 14, "0");
  c.fill("g", 33, 2, 1, 14, "|"); c.fill("g", 34, 1, 16, 1, "|"); c.fill("g", 34, 16, 16, 1, "|");
  c.fill("g", 40, 16, 3, 1, "J");
  c.fill("g", 40, 17, 3, 1, "=");
  B.house(c, { x: 36, y: 4, w: 10, h: 6, rh: 2, roof: "R", wall: "V", win: "W", door: "D", doorX: 4, over: "^" });
  c.set("g", 37, 4, "M");
  c.fill("g", 44, 11, 4, 4, "3");
  c.fill("g", 35, 11, 6, 4, "2");
  c.set("g", 42, 12, "5"); c.set("g", 42, 14, "4");
  c.set("g", 35, 3, "N");
  c.fill("g", 40, 10, 3, 4, "0");
  c.set("g", 41, 13, "E");
  c.set("g", 39, 13, "N");

  // ---- the DeepStore gate, in the bank above the Bottom Flash ------------
  c.fill("g", 4, 24, 14, 12, ",");
  B.house(c, { x: 6, y: 27, w: 10, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 5, 31, "N");
  c.fill("g", 3, 32, 16, 1, "-");
  c.fill("g", 18, 26, 1, 10, "|");
  c.fill("g", 18, 30, 1, 2, "J");
  c.fill("g", 19, 30, 5, 2, "+");
  c.set("g", 20, 34, "z"); c.set("g", 6, 35, "z");

  // ---- shops, care, inn, station -----------------------------------------
  B.house(c, { x: 12, y: 18, w: 4, h: 4, rh: 1, roof: "R", wall: "V", win: "W", door: "S", doorX: 1, over: "^" });
  B.house(c, { x: 28, y: 12, w: 10, h: 5, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 27, 16, "N");
  B.house(c, { x: 28, y: 4, w: 4, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 1, over: "^" });
  c.fill("g", 24, 3, 4, 13, ",");
  B.house(c, { x: 44, y: 22, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.set("g", 43, 25, "P");
  c.fill("g", 43, 26, 8, 1, "-");
  B.railLine(c, 44, 30, 7, { track: "U", plat: "E", edge: "e" });
  c.fill("g", 43, 27, 8, 1, ",");

  // ---- houses and the odds and ends --------------------------------------
  B.timberRow(c, 2, 19, 8, { h: 4, doors: [3], chimneys: [1, 6] });
  B.house(c, { x: 15, y: 22, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 14, 26, 10, 1, "-");
  c.set("g", 11, 23, "L"); c.set("g", 24, 22, "L");
  c.set("g", 30, 20, "n"); c.set("g", 18, 21, "O"); c.set("g", 34, 17, "u");
  c.set("g", 6, 22, "H"); c.set("g", 7, 22, "I");
  c.fill("g", 8, 33, 8, 5, "\"");
  c.fill("g", 24, 6, 3, 8, "\"");
  B.trees(c, "wf-fringe", 14, 20, 33, 8, 5, "T", "y", ["\""]);
  c.set("g", 45, 20, "q");

  W.defineMap("winsford", {
    name: "Winsford", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "town", dialogue: "town_winsford", shop: "shop_winsford",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 25, y: 19 },
    healPoint: { x: 13, y: 22 },
    landmark: { name: "Winsford & the Flashes", x: 25, y: 19 },
    encounters: { grass: "winsford_grass", water: "winsford_water" },
    fishing: "fish_winsford",
    warps: [
      { x: 13, y: 21, to: "winsford_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 32, y: 16, to: "winsford_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 29, y: 9, to: "winsford_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 47, y: 25, to: "winsford_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 40, y: 9, to: "winsford_headgear", tx: 12, ty: 20, dir: "up", kind: "door" },
      { x: 10, y: 31, to: "winsford_deepstore", tx: 14, ty: 24, dir: "up", kind: "door" },
      { x: 18, y: 25, to: "winsford_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 5, y: 22, to: "winsford_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 21, y: 34, to: "salt_mine_sinkhole", tx: 8, ty: 22, dir: "down", kind: "cave", cond: "mine_descended" },
      // edges
      { x: 20, y: 0, to: "route_winsford_northwich", tx: 14, ty: 48, dir: "up", kind: "edge" },
      { x: 21, y: 0, to: "route_winsford_northwich", tx: 15, ty: 48, dir: "up", kind: "edge" },
      { x: 22, y: 0, to: "route_winsford_northwich", tx: 16, ty: 48, dir: "up", kind: "edge" },
      { x: 24, y: 39, to: "route_nantwich_winsford", tx: 22, ty: 1, dir: "down", kind: "edge" },
      { x: 25, y: 39, to: "route_nantwich_winsford", tx: 23, ty: 1, dir: "down", kind: "edge" },
      { x: 26, y: 39, to: "route_nantwich_winsford", tx: 24, ty: 1, dir: "down", kind: "edge" },
      { x: 51, y: 18, to: "route_middlewich_winsford", tx: 1, ty: 14, dir: "right", kind: "edge" },
      { x: 51, y: 19, to: "route_middlewich_winsford", tx: 1, ty: 15, dir: "right", kind: "edge" },
      { x: 51, y: 20, to: "route_middlewich_winsford", tx: 1, ty: 16, dir: "right", kind: "edge" }
    ].concat(MQ.SaltBuild.linkWarp([], 1, 30, "route_delamere_winsford", "left", null)),
    signs: [
      { x: 35, y: 3, text: ["WINSFORD ROCK SALT MINE", "Established 1844. Still working. Still the largest in Britain.",
        "The salt on your road in February came from under this field and it took a hundred and fifty metres of cage to get here."] },
      { x: 39, y: 13, text: ["THE CAGE — AUTHORISED PERSONS ONLY.", "SALT MINE PASS REQUIRED. Lamp on before the gate. Hard hat before the lamp.",
        "Handwritten below: 'and if the containers are humming again, tell Rhona, not me'."] },
      { x: 5, y: 31, text: ["DEEPSTORE — DOCUMENT ARCHIVE.", "Constant fourteen degrees, no humidity, no daylight, no questions.",
        "Everything England would rather not lose is under your feet, in the dark, in a mine."] },
      { x: 27, y: 16, text: ["WINSFORD MART — hi-vis, hard hats, lamps, and one shelf of fishing tackle nobody has tidied since 2011."] },
      { x: 43, y: 25, text: ["WINSFORD STATION — Chester, Crewe, and the salt trains that do not stop."] },
      { x: 30, y: 20, text: ["NOTICE: THE GROUND HERE DROPS ABOUT AN INCH A YEAR.", "This is normal. This has always been normal. Please stop ringing the council about it."] }
    ],
    items: [
      { x: 15, y: 5, item: "capsule_heavy", n: 3, flag: "item_winsford_1" },
      { x: 9, y: 35, item: "salt_crystal", n: 3, flag: "item_winsford_2" },
      { x: 46, y: 14, item: "tonic_def", n: 2, hidden: true, flag: "item_winsford_3" },
      { x: 20, y: 36, item: "elixir", n: 2, hidden: true, flag: "item_winsford_4" }
    ],
    catGaps: [
      { x: 33, y: 8, item: "collectible_19", n: 1, flag: "catgap_winsford_1",
        say: "MEADOW goes under the mine-yard fence and returns carrying something warm and heavy and faintly pink. It is a heart-shaped lump of halite. It is a salt-golem's heart, and she is very pleased with herself." }
    ],
    restPoints: [{ x: 12, y: 4, flag: "bigboy_sat_winsford" }],
    npcs: [
      { id: "npc_winsford_rhona", x: 40, y: 17, dir: "up", sprite: "npc_miner", behaviour: "still", script: "sw_rhona" },
      { id: "npc_winsford_gethin", x: 38, y: 15, dir: "down", sprite: "npc_miner", behaviour: "look", radius: 3, trainer: "tr_winsford_1", sight: 3 },
      { id: "npc_winsford_ivo", x: 12, y: 32, dir: "up", sprite: "npc_historian", behaviour: "still", trainer: "tr_winsford_2", sight: 0, script: "sw_ivo" },
      { id: "npc_winsford_sion", x: 12, y: 5, dir: "down", sprite: "npc_fisher", behaviour: "still", trainer: "tr_winsford_3", sight: 3 },
      { id: "npc_winsford_alun", x: 43, y: 17, dir: "left", sprite: "npc_saltworker", behaviour: "look", radius: 3, trainer: "tr_winsford_4", sight: 3 },
      { id: "npc_winsford_lowri_town", x: 35, y: 24, dir: "down", sprite: "npc_birder", behaviour: "still", script: "sw_lowri_town" },
      { id: "npc_winsford_walker", x: 20, y: 19, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[18, 19], [36, 19]], pathMode: "pingpong",
        say: ["Half this town is a lake that used to be a field.", "Nobody's cross about it. It's a nice lake."] },
      { id: "npc_winsford_granny", x: 17, y: 21, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["My mother's house is under Bottom Flash. Not the ruins of it. The house. They walked out and it went down.",
          "She used to row over it on Sundays and point."] },
      { id: "npc_winsford_kid", x: 26, y: 26, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Something surfaced in the flash last Tuesday and it was NOT a pike.", "Dad says it was a pike. Dad is wrong about most things."] },
      { id: "npc_winsford_nurse", x: 15, y: 21, dir: "down", sprite: "npc_nurse", behaviour: "still",
        say: ["Miners come up cold and stiff and go home warm. That's the whole job."] }
    ],
    triggers: [
      { x: 40, y: 16, w: 3, h: 1, script: "sw_mine_gate", cond: "!mine_descended", kind: "step" }
    ]
  });

  // ---------------------------------------------------- the headgear ------
  const HG = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_stone", "g": "floor_tile",
    "W": "window", "D": "door_wood", "d": "door_stairs_down", "m": "mat_welcome",
    "M": "machine", "K": "mine_cart", "-": "mine_cart_rail_h", "|": "mine_cart_rail_v",
    "L": "mine_prop", "N": "sign", "n": "noticeboard", "s": "shelf", "k": "bookcase",
    "c": "chair", "t": "table", "l": "lamp", "3": "salt_pile", "[": "crate", "]": "barrel",
    "T": "terminal", "H": "bench", " ": null
  };
  const hg = B.canvas(26, 22, "_");
  hg.box("g", 0, 0, 26, 22, "#");
  hg.fill("g", 1, 0, 24, 1, "^");
  hg.fill("g", 1, 1, 24, 1, "W");
  hg.fill("g", 9, 3, 8, 8, "g");
  hg.fill("g", 11, 4, 4, 6, "M");
  hg.set("g", 12, 10, "d"); hg.set("g", 13, 10, "d");
  hg.fill("g", 2, 4, 5, 5, "3");
  hg.fill("g", 19, 4, 5, 5, "[");
  hg.fill("g", 2, 13, 22, 1, "-");
  hg.set("g", 6, 13, "K"); hg.set("g", 20, 13, "K");
  hg.set("g", 3, 16, "t"); hg.set("g", 3, 17, "c");
  hg.set("g", 22, 16, "s"); hg.set("g", 22, 17, "k");
  hg.set("g", 8, 16, "T"); hg.set("g", 17, 16, "n");
  hg.set("g", 5, 19, "H"); hg.set("g", 20, 19, "H");
  hg.set("g", 12, 21, "D"); hg.set("g", 13, 21, "D");
  hg.set("g", 12, 20, "m"); hg.set("g", 13, 20, "m");
  hg.set("g", 2, 11, "l"); hg.set("g", 23, 11, "l");
  hg.set("g", 10, 12, "N");

  W.defineMap("winsford_headgear", {
    name: "Winsford Mine Head", region: "interior", outdoor: false, music: "town_northwich",
    ambience: "industrial", dialogue: "town_winsford", weatherZone: null,
    legend: HG, layers: hg.layers(),
    spawnPoint: { x: 12, y: 20 },
    landmark: { name: "The Headgear", x: 13, y: 7 },
    encounters: { cave: null, grass: null },
    warps: [
      { x: 12, y: 21, to: "winsford", tx: 40, ty: 10, dir: "down", kind: "door" },
      { x: 13, y: 21, to: "winsford", tx: 40, ty: 10, dir: "down", kind: "door" },
      { x: 12, y: 10, to: "salt_mine_cage", tx: 12, ty: 20, dir: "down", kind: "stairs", cond: "item.salt_mine_pass > 0" },
      { x: 13, y: 10, to: "salt_mine_cage", tx: 13, ty: 20, dir: "down", kind: "stairs", cond: "item.salt_mine_pass > 0" }
    ],
    signs: [
      { x: 10, y: 12, text: ["THE CAGE. 150 METRES. NINETY SECONDS.",
        "There is no handrail because there is nothing to hold on to that would help.",
        "LAMP ON BEFORE THE GATE."] },
      { x: 17, y: 16, text: ["SHIFT BOARD.", "Faces down: 41. Faces up: 41. That is the only number on this board that matters and it is checked twice."] }
    ],
    items: [{ x: 23, y: 8, item: "davy_lamp", n: 1, hidden: true, flag: "item_winsford_headgear_1" }],
    npcs: [
      { id: "npc_winsford_headgear_rhona", x: 13, y: 12, dir: "down", sprite: "npc_miner", behaviour: "still", script: "sw_rhona_cage" },
      { id: "npc_winsford_headgear_banksman", x: 8, y: 17, dir: "right", sprite: "npc_miner", behaviour: "still",
        say: ["Forty-one down, forty-one up. I count them both and I have never once been out.",
          "In March I counted forty-two up. I put it down to the light."] }
    ]
  });

  // ---------------------------------------------------- DeepStore ---------
  const DS = B.mine({ "T": "server_rack", "s": "shelf", "k": "bookcase", "g": "floor_tile" });
  const ds = B.canvas(30, 26, "_");
  ds.box("g", 0, 0, 30, 26, "#");
  ds.fill("g", 1, 0, 28, 1, "^");
  ds.fill("g", 2, 2, 26, 20, "g");
  for (let r = 0; r < 4; r++) {
    ds.fill("g", 3, 4 + r * 4, 9, 2, "k");
    ds.fill("g", 17, 4 + r * 4, 9, 2, "k");
  }
  ds.fill("g", 13, 2, 4, 20, "g");
  ds.set("g", 14, 3, "N");
  ds.fill("g", 2, 22, 26, 2, "f");
  ds.set("g", 14, 25, "u"); ds.set("g", 15, 25, "u");
  ds.set("g", 4, 23, "i"); ds.set("g", 25, 23, "l");
  ds.fill("g", 24, 2, 4, 2, "T");
  ds.set("g", 3, 2, "C"); ds.set("g", 27, 21, "C");
  ds.set("g", 20, 23, "N");
  ds.set("g", 2, 12, "d");

  W.defineMap("winsford_deepstore", {
    name: "DeepStore", region: "interior", outdoor: false, music: "dungeon_stack",
    ambience: "cave", dialogue: "town_winsford", weatherZone: null,
    legend: DS, layers: ds.layers(),
    spawnPoint: { x: 14, y: 24 },
    landmark: { name: "DeepStore", x: 14, y: 12 },
    encounters: { cave: "winsford_deepstore_cave" },
    warps: [
      { x: 14, y: 25, to: "winsford", tx: 10, ty: 32, dir: "down", kind: "stairs" },
      { x: 15, y: 25, to: "winsford", tx: 10, ty: 32, dir: "down", kind: "stairs" },
      { x: 2, y: 12, to: "salt_mine_deepstore_cold", tx: 14, ty: 24, dir: "down", kind: "stairs", cond: "mine_descended" }
    ],
    signs: [
      { x: 14, y: 3, text: ["DEEPSTORE — AISLE INDEX.", "Aisle 1: parish records. Aisle 2: hospital. Aisle 3: film.",
        "Aisle 4: 'CLIENT — COLD TIER — DO NOT INDEX'. There is no client name. There is an invoice number."] },
      { x: 20, y: 23, text: ["A laminated notice, curling: 'THE COLD TIER IS NOT PART OF THIS ARCHIVE.",
        "It is leased. We do not hold its keys. We do not hold its manifest. We hold its rent.'"] }
    ],
    items: [
      { x: 27, y: 4, item: "collectible_18", n: 1, flag: "item_winsford_deepstore_1" },
      { x: 3, y: 20, item: "x_ray_card", n: 2, hidden: true, flag: "item_winsford_deepstore_2" }
    ],
    npcs: [
      { id: "npc_winsford_deepstore_ivo", x: 14, y: 6, dir: "down", sprite: "npc_historian", behaviour: "still", script: "sw_ivo_archive" },
      { id: "npc_winsford_deepstore_nia", x: 22, y: 20, dir: "left", sprite: "npc_darkbyte", behaviour: "look", radius: 4, trainer: "tr_winsford_deepstore_1", sight: 4, cond: "chapter >= 7" },
      { id: "npc_winsford_deepstore_pryce", x: 6, y: 18, dir: "right", sprite: "npc_shadow_it", behaviour: "look", radius: 4, trainer: "tr_winsford_deepstore_2", sight: 4, cond: "chapter >= 7" }
    ],
    triggers: [
      { x: 13, y: 10, w: 4, h: 1, script: "sw_deepstore_oracle_zero", once: "deepstore_oracle_zero", cond: "!deepstore_oracle_zero && chapter >= 7", kind: "step" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("winsford_care", W.builtin("care_centre", {
    name: "Winsford Care Centre", dialogue: "town_winsford", music: "town_northwich",
    warps: [{ x: 7, y: 11, to: "winsford", tx: 13, ty: 22, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "winsford", tx: 13, ty: 22, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_winsford_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still",
      say: ["Fourteen degrees down there, all year. Miners come up stiff, not cold. There's a difference and I've the notes to prove it."] }]
  }));
  W.defineMap("winsford_mart", W.builtin("shop", {
    name: "Winsford Mart", dialogue: "town_winsford", music: "town_northwich", shop: "shop_winsford",
    warps: [{ x: 6, y: 9, to: "winsford", tx: 32, ty: 17, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "winsford", tx: 32, ty: 17, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_winsford_mart_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_winsford",
      say: ["Heavy Capsules. Everything down that mine weighs more than it looks and so does the capsule you'll need."] }]
  }));
  W.defineMap("winsford_inn", W.builtin("pub", {
    name: "The Red Lion", dialogue: "town_winsford", music: "town_northwich",
    warps: [{ x: 6, y: 11, to: "winsford", tx: 29, ty: 10, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "winsford", tx: 29, ty: 10, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_winsford_inn_landlord", x: 2, y: 2, dir: "down", sprite: "npc_boater", behaviour: "still",
      say: ["Sleep here and the day moves on a band. It's the only honest way to catch dawn on the flashes.",
        "Dawn's when the big one shows. Ask Lowri. She'll tell you for an hour."] }]
  }));
  W.defineMap("winsford_station", W.builtin("station", {
    name: "Winsford Station", dialogue: "town_winsford", music: "town_crewe", station: { name: "Winsford" },
    warps: [{ x: 8, y: 11, to: "winsford", tx: 47, ty: 26, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "winsford", tx: 47, ty: 26, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_winsford_station_guard", x: 6, y: 3, dir: "down", sprite: "npc_signaller", behaviour: "still",
      say: ["Salt trains don't stop here. They go through at forty and take the crisps off the shelf in the kiosk."] }]
  }));
  for (let i = 1; i <= 2; i++) {
    W.defineMap("winsford_house_" + i, W.builtin("house_small", {
      name: "Winsford House", dialogue: "town_winsford", music: "town_northwich",
      warps: [{ x: 5, y: 9, to: "winsford", tx: i === 1 ? 18 : 5, ty: i === 1 ? 26 : 23, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "winsford", tx: i === 1 ? 18 : 5, ty: i === 1 ? 26 : 23, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_winsford_house" + i, x: 3, y: 4, dir: "down", sprite: i === 1 ? "npc_walker" : "npc_granny", behaviour: "still",
        say: i === 1
          ? ["Front door's a quarter-inch out of square this year. Was an eighth last year.", "You get used to hanging doors."]
          : ["There's a jar of it on the sill. Rock salt, pink, from under the house.", "My husband brought it up in 1974 and I have never once used it for cooking."] }]
    }));
  }
})();
