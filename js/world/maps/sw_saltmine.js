// =============================================================
// MonsterQuest v2 — THE SALT MINE (region salt, Ch.7 dungeon)
// One connected mine, a hundred and fifty metres down. The Winsford
// side: the cage, the cold tier, and the white-cathedral galleries
// where forty shipping containers hum on the same note. The Marston
// side, under Northwich: pillar-and-stall galleries as a grid maze,
// a brine lake with a boat, DARKBYTE's sub-hideout, and TERRATAUR.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const M = B.mine({ "&": "hologram", "%": "cable_duct" });

  function mine(id, def, canvas) {
    def.legend = M;
    def.layers = canvas.layers();
    def.region = def.region || "interior";
    def.outdoor = false;
    def.weatherZone = null;
    def.music = def.music || "dungeon_cave";
    def.ambience = def.ambience || "cave";
    def.dialogue = def.dialogue || "town_winsford";
    W.defineMap(id, def);
  }

  // ================================================= the cage ==============
  // Ninety seconds of nothing, and then a room the size of a church that
  // nobody built.
  let c = B.canvas(26, 22, "0");
  c.box("g", 0, 0, 26, 22, "#");
  c.fill("g", 1, 0, 24, 1, "^");
  c.fill("g", 2, 2, 22, 18, "0");
  c.fill("g", 10, 17, 6, 3, "f");
  c.set("g", 12, 21, "u"); c.set("g", 13, 21, "u");
  c.fill("g", 10, 16, 6, 1, "G");
  c.fill("g", 11, 16, 4, 1, "f");
  c.fill("g", 3, 3, 4, 4, "3"); c.fill("g", 19, 3, 4, 4, "[");
  c.fill("g", 2, 9, 22, 1, "-");
  c.set("g", 6, 9, "K"); c.set("g", 20, 9, "K");
  c.set("g", 4, 12, "L"); c.set("g", 21, 12, "L");
  c.set("g", 12, 12, "l"); c.set("g", 13, 6, "N");
  c.fill("g", 11, 1, 4, 1, "d");
  c.fill("g", 10, 2, 6, 2, "f");
  B.speckle(c, "g", "cage-rock", "r", 8, 3, 11, 20, 8, ["0"]);
  mine("salt_mine_cage", {
    name: "The Cage", music: "dungeon_cave",
    spawnPoint: { x: 12, y: 20 },
    landmark: { name: "The Cage — 150 metres", x: 12, y: 10 },
    encounters: { cave: "salt_mine_cage_cave" },
    warps: [
      { x: 12, y: 21, to: "winsford_headgear", tx: 12, ty: 11, dir: "up", kind: "stairs" },
      { x: 13, y: 21, to: "winsford_headgear", tx: 13, ty: 11, dir: "up", kind: "stairs" },
      { x: 12, y: 1, to: "salt_mine_galleries", tx: 26, ty: 37, dir: "up", kind: "stairs" },
      { x: 13, y: 1, to: "salt_mine_galleries", tx: 27, ty: 37, dir: "up", kind: "stairs" }
    ],
    signs: [{ x: 13, y: 6, text: ["150 METRES. FOURTEEN DEGREES. NO RAIN, EVER.",
      "The air is bone dry and tastes faintly of the sea, which it is, and which it has been since before there was anybody to taste it.",
      "LAMPS ON. HARD HATS ON. AND IF THE CONTAINERS ARE HUMMING, DO NOT PUT YOUR HAND ON ONE."] }],
    items: [{ x: 7, y: 4, item: "salt_crystal", n: 3, flag: "item_salt_mine_cage_1" }],
    npcs: [
      { id: "npc_salt_mine_cage_banksman", x: 12, y: 14, dir: "down", sprite: "npc_miner", behaviour: "still", script: "sw_cage_banksman" }
    ],
    triggers: [
      { x: 11, y: 12, w: 4, h: 1, script: "sw_mine_descended", once: "mine_descended_scene", cond: "!mine_descended", kind: "step" }
    ]
  }, c);

  // ============================================ the white cathedral =======
  // Roof forty feet up, pillars the size of houses, and everything white.
  c = B.canvas(54, 40, "0");
  c.box("g", 0, 0, 54, 40, "#");
  c.fill("g", 1, 0, 52, 1, "^");
  c.fill("g", 2, 2, 50, 36, "0");
  B.pillarGrid(c, 4, 4, 46, 32, { pillar: "#", pitch: 8, size: 4, seed: "galleries", skip: 0.15 });
  // the haulage road down the middle and the loop round the outside
  c.fill("g", 24, 2, 4, 36, "1");
  c.fill("g", 24, 2, 4, 36, "_");
  c.fill("g", 2, 19, 50, 2, "_");
  c.fill("g", 2, 2, 50, 1, "_");
  c.fill("g", 2, 37, 50, 1, "_");
  c.fill("g", 2, 2, 1, 36, "_");
  c.fill("g", 51, 2, 1, 36, "_");
  c.fill("g", 26, 2, 1, 36, "|");
  c.fill("g", 3, 20, 48, 1, "-");
  c.set("g", 18, 20, "K"); c.set("g", 40, 20, "K");
  // the containers: forty of them, in a rank, humming
  c.fill("g", 32, 5, 16, 10, ",");
  for (let i = 0; i < 5; i++) c.fill("g", 33 + i * 3, 6, 2, 3, "T");
  for (let i = 0; i < 5; i++) c.fill("g", 33 + i * 3, 11, 2, 3, "T");
  c.fill("g", 31, 5, 1, 10, "%");
  c.set("g", 40, 16, "N");
  c.fill("g", 32, 15, 16, 1, "f");
  c.set("g", 44, 10, "&");
  // the cold tier door, the sinkhole and the road to Marston
  c.fill("g", 4, 5, 8, 8, ",");
  c.set("g", 8, 4, "d");
  c.set("g", 6, 13, "N");
  c.fill("g", 4, 28, 9, 8, ",");
  c.set("g", 8, 27, "E");
  c.set("g", 11, 35, "N");
  c.fill("g", 44, 28, 8, 8, ",");
  c.set("g", 48, 27, "d");
  c.set("g", 45, 35, "N");
  c.fill("g", 26, 37, 3, 2, "u");
  c.fill("g", 24, 36, 6, 1, "_");
  c.set("g", 3, 3, "3"); c.set("g", 50, 3, "3"); c.set("g", 3, 36, "]");
  c.set("g", 12, 8, "l"); c.set("g", 42, 30, "l"); c.set("g", 12, 32, "l");
  B.speckle(c, "g", "gal-salt", "3", 18, 2, 2, 50, 36, ["0"]);
  B.speckle(c, "g", "gal-props", "L", 22, 2, 2, 50, 36, ["0"]);
  mine("salt_mine_galleries", {
    name: "The White Cathedral", music: "dungeon_cave",
    spawnPoint: { x: 26, y: 37 },
    landmark: { name: "The White Cathedral", x: 26, y: 20 },
    encounters: { cave: "salt_mine_galleries_cave" },
    warps: [
      { x: 26, y: 38, to: "salt_mine_cage", tx: 12, ty: 2, dir: "down", kind: "stairs" },
      { x: 27, y: 38, to: "salt_mine_cage", tx: 13, ty: 2, dir: "down", kind: "stairs" },
      { x: 8, y: 4, to: "salt_mine_deepstore_cold", tx: 16, ty: 24, dir: "up", kind: "stairs" },
      { x: 8, y: 27, to: "salt_mine_sinkhole", tx: 9, ty: 3, dir: "down", kind: "cave" },
      { x: 48, y: 27, to: "salt_mine_marston_b1", tx: 4, ty: 4, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 40, y: 16, text: ["A hand-lettered plate wired to the fence: CLIENT INVENTORY — DO NOT INDEX.",
        "Forty containers. No maker's plate on any of them. All forty hum, and all forty hum the same note.",
        "There is a barcode. It is not a barcode you have seen before, and it starts with the same four characters as a signature you once helped sign."] },
      { x: 6, y: 13, text: ["COLD TIER — LEASED. NOT PART OF THIS ARCHIVE.", "The door is at fourteen degrees on this side and considerably less on the other."] },
      { x: 11, y: 35, text: ["OLD WORKING — SINKHOLE. Comes out in a field above Winsford. Mind the last four feet; there aren't any."] },
      { x: 45, y: 35, text: ["MARSTON WORKINGS — 2.4 km. Roof deteriorating past the fault. Lamp essential.",
        "Somebody has scratched under it: 'and it is not the roof you want to worry about'."] }
    ],
    items: [
      { x: 3, y: 4, item: "salt_crystal", n: 4, flag: "item_salt_mine_galleries_1" },
      { x: 50, y: 4, item: "capsule_heavy", n: 3, flag: "item_salt_mine_galleries_2" },
      { x: 3, y: 37, item: "elixir", n: 2, hidden: true, flag: "item_salt_mine_galleries_3" },
      { x: 45, y: 17, item: "x_ray_card", n: 2, hidden: true, flag: "item_salt_mine_galleries_4" }
    ],
    npcs: [
      { id: "npc_salt_mine_galleries_bryn", x: 20, y: 21, dir: "up", sprite: "npc_miner", behaviour: "look", radius: 4, trainer: "tr_salt_mine_galleries_1", sight: 4 },
      { id: "npc_salt_mine_galleries_cadell", x: 38, y: 17, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_salt_mine_galleries_2", sight: 0, script: "sw_containers_agent" },
      { id: "npc_salt_mine_galleries_ffion", x: 12, y: 26, dir: "right", sprite: "npc_caver", behaviour: "look", radius: 4, trainer: "tr_salt_mine_galleries_3", sight: 4 }
    ],
    triggers: [
      { x: 36, y: 16, w: 6, h: 1, script: "sw_checkpoints", once: "checkpoints_scene", cond: "!checkpoints_seen", kind: "step" }
    ],
    restPoints: [{ x: 25, y: 30, flag: "meadow_sat_galleries" }]
  }, c);

  // ================================================== the cold tier =======
  c = B.canvas(34, 26, ",");
  c.box("g", 0, 0, 34, 26, "#");
  c.fill("g", 1, 0, 32, 1, "^");
  c.fill("g", 2, 2, 30, 22, "g");
  for (let r = 0; r < 4; r++) { c.fill("g", 4, 4 + r * 5, 11, 2, "T"); c.fill("g", 19, 4 + r * 5, 11, 2, "T"); }
  c.fill("g", 16, 2, 2, 22, "g");
  c.fill("g", 3, 2, 28, 1, "%");
  c.set("g", 16, 25, "d"); c.set("g", 17, 25, "d");
  c.fill("g", 2, 23, 30, 1, "f");
  c.set("g", 4, 23, "N"); c.set("g", 29, 23, "l");
  c.set("g", 8, 12, "&"); c.set("g", 25, 12, "&");
  c.set("g", 2, 12, "@");
  mine("salt_mine_deepstore_cold", {
    name: "The Cold Tier", music: "dungeon_stack", ambience: "cave",
    spawnPoint: { x: 16, y: 24 },
    landmark: { name: "The Cold Tier", x: 16, y: 12 },
    encounters: { cave: "salt_mine_deepstore_cold_cave" },
    warps: [
      { x: 16, y: 25, to: "salt_mine_galleries", tx: 8, ty: 5, dir: "down", kind: "stairs" },
      { x: 17, y: 25, to: "salt_mine_galleries", tx: 8, ty: 5, dir: "down", kind: "stairs" },
      { x: 2, y: 12, to: "winsford_deepstore", tx: 14, ty: 12, dir: "up", kind: "stairs" }
    ],
    signs: [{ x: 4, y: 23, text: ["COLD TIER. 4°C. NO PERSONNEL BEYOND THIS POINT WITHOUT THE CLIENT PRESENT.",
      "The client has never been present. The rent has never once been late."] }],
    items: [
      { x: 31, y: 21, item: "cipher_chip", n: 1, hidden: true, flag: "item_salt_mine_deepstore_cold_1" },
      { x: 3, y: 21, item: "capsule_net", n: 3, flag: "item_salt_mine_deepstore_cold_2" }
    ],
    npcs: [],
    triggers: [
      { x: 15, y: 12, w: 2, h: 1, script: "sw_cold_tier", once: "cold_tier_seen", cond: "!cold_tier_seen", kind: "step" }
    ]
  }, c);

  // ==================================================== the sinkhole ======
  c = B.canvas(20, 24, "#");
  c.fill("g", 1, 0, 18, 1, "^");
  c.fill("g", 6, 2, 8, 20, ",");
  c.snake("g", "sinkhole", ",", 8, 2, 20, "v", 4, 0.35);
  c.fill("g", 8, 1, 3, 1, "d");
  c.fill("g", 7, 22, 6, 1, "E");
  c.set("g", 9, 5, "N");
  c.set("g", 11, 12, "L"); c.set("g", 7, 17, "3");
  B.speckle(c, "g", "sink-rock", "r", 6, 6, 3, 8, 18, [","]);
  mine("salt_mine_sinkhole", {
    name: "The Sinkhole", music: "dungeon_cave",
    spawnPoint: { x: 9, y: 3 },
    landmark: { name: "The Sinkhole", x: 9, y: 12 },
    encounters: { cave: "salt_mine_sinkhole_cave" },
    warps: [
      { x: 8, y: 1, to: "salt_mine_galleries", tx: 8, ty: 28, dir: "down", kind: "cave" },
      { x: 9, y: 1, to: "salt_mine_galleries", tx: 8, ty: 28, dir: "down", kind: "cave" },
      { x: 9, y: 22, to: "winsford", tx: 21, ty: 35, dir: "up", kind: "cave" },
      { x: 10, y: 22, to: "winsford", tx: 21, ty: 35, dir: "up", kind: "cave" }
    ],
    signs: [{ x: 9, y: 5, text: ["A hole in the roof of a mine, which from the other side is a hole in a field.",
      "There is a rope. The rope was tied by somebody in a hurry and has been there for nineteen years."] }],
    items: [{ x: 7, y: 18, item: "salt_crystal", n: 2, hidden: true, flag: "item_salt_mine_sinkhole_1" }],
    npcs: []
  }, c);

  // ============================================ Marston B1 — the grid =====
  c = B.canvas(50, 42, "#");
  c.fill("g", 1, 0, 48, 1, "^");
  // carve the pillar-and-stall grid: rooms of floor with pillars between
  for (let gy = 2; gy < 40; gy += 5) c.fill("g", 2, gy, 46, 3, "_");
  for (let gx = 2; gx < 48; gx += 5) c.fill("g", gx, 2, 3, 38, "_");
  // block a scattering of junctions so the grid is a maze, not a chessboard
  const blocks = [[7, 7], [17, 7], [37, 7], [12, 12], [27, 12], [42, 12], [7, 17], [22, 17], [32, 17],
    [12, 22], [37, 22], [47, 22], [17, 27], [27, 27], [42, 27], [7, 32], [22, 32], [32, 32], [12, 37], [37, 37]];
  for (let i = 0; i < blocks.length; i++) c.fill("g", blocks[i][0], blocks[i][1], 3, 3, "#");
  // the way in from the galleries, the way down to the lake, the back stair
  c.fill("g", 2, 2, 4, 4, "_");
  c.set("g", 3, 1, "u"); c.set("g", 4, 1, "u");
  c.fill("g", 44, 36, 5, 4, "_");
  c.set("g", 46, 40, "d"); c.set("g", 47, 40, "d");
  c.fill("g", 44, 2, 5, 4, "_");
  c.set("g", 46, 1, "u"); c.set("g", 47, 1, "u");
  // DARKBYTE's sub-hideout in the middle of the grid
  c.fill("g", 20, 18, 11, 8, "g");
  c.fill("g", 21, 19, 4, 2, "T"); c.fill("g", 26, 19, 4, 2, "T");
  c.fill("g", 21, 23, 9, 1, "%");
  c.set("g", 25, 22, "t"); c.set("g", 23, 22, "h"); c.set("g", 27, 22, "j");
  c.fill("g", 20, 17, 11, 1, "#");
  c.fill("g", 24, 17, 3, 1, "_");
  c.set("g", 21, 17, "N");
  c.set("g", 22, 25, "&");
  // rails and lamps
  c.fill("g", 2, 3, 46, 1, "-");
  c.set("g", 10, 3, "K"); c.set("g", 34, 3, "K");
  c.set("g", 8, 13, "l"); c.set("g", 40, 23, "l"); c.set("g", 18, 33, "l");
  B.speckle(c, "g", "b1-rock", "r", 14, 2, 2, 46, 38, ["_"]);
  B.speckle(c, "g", "b1-props", "L", 16, 2, 2, 46, 38, ["_"]);
  c.set("g", 3, 8, "N");
  mine("salt_mine_marston_b1", {
    name: "Marston Workings B1", music: "dungeon_cave", dialogue: "town_northwich",
    spawnPoint: { x: 4, y: 4 },
    landmark: { name: "Marston Grid", x: 25, y: 22 },
    encounters: { cave: "salt_mine_marston_b1_cave" },
    warps: [
      { x: 3, y: 1, to: "salt_mine_galleries", tx: 48, ty: 28, dir: "down", kind: "stairs" },
      { x: 4, y: 1, to: "salt_mine_galleries", tx: 48, ty: 28, dir: "down", kind: "stairs" },
      { x: 46, y: 1, to: "salt_mine_back_stair", tx: 10, ty: 22, dir: "up", kind: "stairs" },
      { x: 47, y: 1, to: "salt_mine_back_stair", tx: 11, ty: 22, dir: "up", kind: "stairs" },
      { x: 46, y: 40, to: "salt_mine_marston_b2", tx: 6, ty: 4, dir: "down", kind: "stairs" },
      { x: 47, y: 40, to: "salt_mine_marston_b2", tx: 7, ty: 4, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 3, y: 8, text: ["PILLAR AND STALL. Take out the salt, leave the pillars, and the field above stays a field.",
        "Every pillar you can see is holding up something. Some of them are holding up a school."] },
      { x: 21, y: 17, text: ["A folding table, four chairs and a rack of humming boxes under two hundred metres of rock.",
        "Somebody has written on the whiteboard: NOTHING GETS IN, NOTHING GETS OUT.",
        "Underneath, in different handwriting and much later: 'that goes for us as well'."] }
    ],
    items: [
      { x: 22, y: 25, item: "patch_cable", n: 1, flag: "item_salt_mine_marston_b1_1" },
      { x: 45, y: 4, item: "elixir", n: 2, flag: "item_salt_mine_marston_b1_2" },
      { x: 3, y: 38, item: "capsule_kernel", n: 3, hidden: true, flag: "item_salt_mine_marston_b1_3" },
      { x: 47, y: 22, item: "salt_lantern", n: 1, hidden: true, flag: "item_salt_mine_marston_b1_4" }
    ],
    npcs: [
      { id: "npc_marston_b1_sior", x: 25, y: 21, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_salt_mine_marston_b1_1", sight: 0, script: "sw_hideout_sior" },
      { id: "npc_marston_b1_meic", x: 13, y: 8, dir: "right", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_salt_mine_marston_b1_2", sight: 4 },
      { id: "npc_marston_b1_hafwen", x: 33, y: 28, dir: "left", sprite: "npc_shadow_it", behaviour: "look", radius: 4, trainer: "tr_salt_mine_marston_b1_3", sight: 4 }
    ]
  }, c);

  // ======================================= Marston B2 — the brine lake ====
  c = B.canvas(48, 38, "#");
  c.fill("g", 1, 0, 46, 1, "^");
  c.fill("g", 2, 2, 44, 34, ",");
  c.fill("g", 4, 2, 6, 6, "_");
  c.set("g", 6, 1, "u"); c.set("g", 7, 1, "u");
  // the lake: still as a plate, warmer than it should be
  c.fill("g", 6, 12, 36, 18, "6");
  c.fill("g", 5, 11, 38, 1, "?"); c.fill("g", 5, 30, 38, 1, "?");
  c.fill("g", 5, 12, 1, 18, "?"); c.fill("g", 42, 12, 1, 18, "?");
  c.fill("g", 4, 9, 40, 2, "_");
  c.fill("g", 4, 31, 40, 2, "_");
  c.set("g", 8, 11, "9"); c.set("g", 9, 12, "8");
  c.set("g", 38, 30, "9");
  // the island of pillars in the middle of the lake
  c.fill("g", 20, 18, 8, 6, "0");
  c.fill("g", 22, 19, 4, 4, "#");
  c.set("g", 24, 24, "N");
  // TERRATAUR's chamber, behind the lake at the far end
  c.fill("g", 30, 33, 14, 4, ",");
  c.fill("g", 36, 33, 3, 1, "_");
  c.fill("g", 32, 34, 10, 2, "0");
  c.set("g", 37, 36, "d"); c.set("g", 38, 36, "d");
  c.set("g", 31, 35, "c"); c.set("g", 43, 35, "c");
  c.set("g", 30, 34, "N");
  c.fill("g", 2, 33, 20, 3, ",");
  c.set("g", 5, 34, "3"); c.set("g", 12, 35, "z");
  c.set("g", 3, 20, "l"); c.set("g", 44, 20, "l");
  B.speckle(c, "g", "b2-rock", "z", 12, 2, 2, 44, 8, [","]);
  B.speckle(c, "g", "b2-crystal", "c", 8, 2, 2, 44, 8, [","]);
  c.set("g", 5, 6, "N");
  mine("salt_mine_marston_b2", {
    name: "The Brine Lake", music: "dungeon_cave", dialogue: "town_northwich",
    spawnPoint: { x: 6, y: 4 },
    landmark: { name: "The Brine Lake", x: 24, y: 21 },
    encounters: { cave: "salt_mine_marston_b2_cave", water: "salt_mine_marston_b2_water" },
    warps: [
      { x: 6, y: 1, to: "salt_mine_marston_b1", tx: 46, ty: 39, dir: "up", kind: "stairs" },
      { x: 7, y: 1, to: "salt_mine_marston_b1", tx: 47, ty: 39, dir: "up", kind: "stairs" },
      { x: 37, y: 36, to: "salt_mine_marston_b3", tx: 20, ty: 31, dir: "down", kind: "stairs", cond: "postgame_open" },
      { x: 38, y: 36, to: "salt_mine_marston_b3", tx: 21, ty: 31, dir: "down", kind: "stairs", cond: "postgame_open" }
    ],
    signs: [
      { x: 5, y: 6, text: ["SURVEY ENDS HERE. Beyond this point the workings are pre-1900 and the plans were lost in the 1928 fall.",
        "DAVY LAMP REQUIRED. NOT A TORCH. A LAMP."] },
      { x: 24, y: 24, text: ["A pillar in the middle of a lake, with a rope round it and a tally cut into the salt.",
        "Ninety-one marks. The last one is fresh and nobody has been down here since March."] },
      { x: 30, y: 34, text: ["It is not a chamber. It is a shape the salt has grown around something that was already here."] }
    ],
    items: [
      { x: 4, y: 35, item: "salt_crystal", n: 4, flag: "item_salt_mine_marston_b2_1" },
      { x: 44, y: 3, item: "capsule_root", n: 1, hidden: true, flag: "item_salt_mine_marston_b2_2" },
      { x: 21, y: 20, item: "collectible_19", n: 1, hidden: true, flag: "item_salt_mine_marston_b2_3" }
    ],
    npcs: [
      { id: "npc_marston_b2_owain", x: 14, y: 10, dir: "down", sprite: "npc_miner", behaviour: "look", radius: 4, trainer: "tr_salt_mine_marston_b2_1", sight: 4 },
      { id: "npc_marston_b2_tegwen", x: 34, y: 32, dir: "up", sprite: "npc_caver", behaviour: "look", radius: 4, trainer: "tr_salt_mine_marston_b2_2", sight: 4 }
    ],
    triggers: [
      { x: 35, y: 33, w: 4, h: 1, script: "sw_terrataur", once: "terrataur_scene", cond: "!terrataur_woken", kind: "step" }
    ],
    restPoints: [{ x: 8, y: 10, flag: "meadow_sat_brine_lake" }]
  }, c);

  // ================================ Marston B3 — post-game depth three ====
  c = B.canvas(40, 34, "#");
  c.fill("g", 1, 0, 38, 1, "^");
  c.fill("g", 3, 3, 34, 28, ",");
  B.pillarGrid(c, 5, 5, 30, 22, { pillar: "#", pitch: 7, size: 3, seed: "b3", skip: 0.2 });
  c.fill("g", 18, 3, 4, 28, "0");
  c.fill("g", 3, 16, 34, 2, "0");
  c.fill("g", 12, 24, 16, 6, "6");
  c.fill("g", 11, 23, 18, 1, "?"); c.fill("g", 11, 30, 18, 1, "?");
  c.fill("g", 19, 31, 3, 1, "u");
  c.fill("g", 18, 30, 4, 1, "0");
  c.set("g", 20, 6, "&");
  c.fill("g", 15, 5, 10, 6, "0");
  c.set("g", 20, 12, "N");
  c.set("g", 6, 20, "c"); c.set("g", 33, 12, "c");
  B.speckle(c, "g", "b3-rock", "z", 14, 3, 3, 34, 28, [","]);
  mine("salt_mine_marston_b3", {
    name: "Depth Three", music: "battle_legendary", dialogue: "town_northwich",
    spawnPoint: { x: 20, y: 30 },
    landmark: { name: "Depth Three", x: 20, y: 8 },
    encounters: { cave: "salt_mine_marston_b3_cave", water: "salt_mine_marston_b2_water" },
    warps: [
      { x: 20, y: 31, to: "salt_mine_marston_b2", tx: 37, ty: 35, dir: "up", kind: "stairs" },
      { x: 21, y: 31, to: "salt_mine_marston_b2", tx: 38, ty: 35, dir: "up", kind: "stairs" }
    ],
    signs: [{ x: 20, y: 12, text: ["No survey. No plan. No rope. Salt to the roof and the roof a long way up.",
      "Something enormous sleeps here and has decided, on balance, to allow it."] }],
    items: [{ x: 4, y: 4, item: "capsule_root", n: 1, hidden: true, flag: "item_salt_mine_marston_b3_1" }],
    npcs: []
  }, c);

  // ====================================== the back stair to Weaver Hall ===
  c = B.canvas(22, 26, "#");
  c.fill("g", 1, 0, 20, 1, "^");
  c.fill("g", 8, 2, 6, 22, "_");
  c.fill("g", 5, 6, 12, 3, "_");
  c.fill("g", 5, 15, 12, 3, "_");
  c.fill("g", 5, 6, 3, 12, "_");
  c.fill("g", 14, 6, 3, 12, "_");
  c.fill("g", 9, 24, 4, 1, "u");
  c.fill("g", 9, 1, 4, 1, "d");
  c.set("g", 6, 12, "L"); c.set("g", 15, 12, "L");
  c.set("g", 10, 20, "N");
  c.set("g", 6, 7, "3"); c.set("g", 16, 16, "]");
  c.set("g", 11, 4, "l");
  mine("salt_mine_back_stair", {
    name: "The Back Stair", music: "dungeon_cave", dialogue: "town_northwich",
    spawnPoint: { x: 10, y: 23 },
    landmark: { name: "The Back Stair", x: 10, y: 12 },
    encounters: { cave: "salt_mine_back_stair_cave" },
    warps: [
      { x: 10, y: 24, to: "northwich_weaver_hall", tx: 23, ty: 10, dir: "up", kind: "stairs" },
      { x: 11, y: 24, to: "northwich_weaver_hall", tx: 23, ty: 10, dir: "up", kind: "stairs" },
      { x: 10, y: 1, to: "salt_mine_marston_b1", tx: 46, ty: 2, dir: "down", kind: "stairs" },
      { x: 11, y: 1, to: "salt_mine_marston_b1", tx: 47, ty: 2, dir: "down", kind: "stairs" }
    ],
    signs: [{ x: 10, y: 20, text: ["A hundred and ninety-four steps cut into the salt, with a handrail added in 1953 by somebody who had had enough.",
      "At the top: a museum. At the bottom: a mine. The step between them is one step."] }],
    items: [{ x: 6, y: 8, item: "salt_crystal", n: 2, hidden: true, flag: "item_salt_mine_back_stair_1" }],
    npcs: [],
    triggers: [
      { x: 9, y: 18, w: 4, h: 1, script: "sw_back_stair_pup", once: "back_stair_pup", cond: "!back_stair_pup && quest.case_25_weaver_hall_ghost >= 2", kind: "step" }
    ]
  }, c);
})();
