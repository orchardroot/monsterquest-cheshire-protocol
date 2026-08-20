// =============================================================
// MonsterQuest v2 — TEGG'S NOSE, MACCLESFIELD FOREST & THE CAT AND
// FIDDLE (region east, WORLD-BIBLE §2 L6). Quarry slabs and standing
// cutting machines, Ridgegate and Trentabank with their heronry, the
// bikers' inn on the tops, and the path away to Shutlingsloe.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "grass_moor", "1": "moor_heather", "2": "moor_path", "3": "moor_stone", "4": "rock_moor",
    "5": "boulder", "6": "cliff_face", "7": "cliff_top", "8": "cliff_climb", "9": "crag",
    "E": "cave_entrance", "Q": "fish_spot", "U": "water_flash", "J": "water_edge", "Y": "path_gravel",
    "!": "tree_pine", "?": "tree_pine_top", ":": "pine_forest_floor", ";": "gate_wood",
    "<": "bridge_wood", ">": "ledge_down", "[": "log", "]": "stump", "{": "berry_bush",
    "}": "fence_stone", "|": "machine", "$": "picnic_table"
  });

  // ---------------------------------------------------------------- moor --
  const c = B.canvas(44, 34, "0");
  c.fill("g", 0, 0, 44, 2, "4");
  c.fill("g", 0, 2, 1, 31, "4");
  c.fill("g", 43, 2, 1, 31, "4");
  c.fill("g", 0, 33, 44, 1, "4");
  c.fill("g", 23, 0, 3, 2, "2");   // north — the lane down to Macclesfield
  c.fill("g", 30, 32, 2, 2, "2");  // south — Shutlingsloe

  // ---- the spine path ------------------------------------------------------
  c.fill("g", 23, 2, 3, 10, "2");
  c.fill("g", 6, 11, 20, 2, "2");
  c.fill("g", 24, 12, 2, 20, "2");
  c.snake("g", "teggs-spine", "2", 24, 14, 16, "v", 2, 0.35);
  c.fill("g", 26, 16, 12, 2, "2");
  c.fill("g", 4, 14, 2, 16, "2");
  c.fill("g", 4, 29, 10, 2, "2");
  c.fill("g", 4, 13, 3, 2, "2");

  // ---- the quarry: slabs, faces, and the cutting machines still standing ---
  c.fill("g", 1, 2, 21, 9, "7");
  c.fill("g", 2, 3, 19, 7, "6");
  c.fill("g", 3, 4, 17, 5, "Y");
  c.fill("g", 3, 9, 17, 1, "6");
  c.fill("g", 6, 9, 3, 1, "Y");
  c.fill("g", 6, 10, 3, 1, "Y");
  c.set("g", 5, 5, "|"); c.set("g", 9, 6, "|"); c.set("g", 14, 5, "|"); c.set("g", 18, 7, "|");
  c.set("g", 11, 4, "E");
  c.set("g", 11, 5, "Y");
  c.set("g", 3, 6, "8"); c.set("g", 20, 5, "8");
  c.set("g", 16, 8, "5"); c.set("g", 7, 8, "5");
  c.set("g", 4, 4, "N");
  c.fill("g", 12, 7, 6, 2, "4");
  // the visitor centre below the face
  B.house(c, { x: 14, y: 11, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  c.fill("g", 14, 14, 8, 1, "Y");
  c.set("g", 13, 13, "N");
  c.fill("g", 22, 11, 2, 4, "Y");

  // ---- Trentabank: the plantation and the heronry --------------------------
  c.fill("g", 27, 2, 16, 13, ":");
  B.trees(c, "teggs-pines", 44, 27, 2, 16, 13, "!", "?", [":"]);
  c.fill("g", 32, 7, 10, 6, "U");
  c.fill("g", 31, 7, 1, 6, "J");
  c.fill("g", 32, 6, 10, 1, "J");
  c.fill("g", 32, 13, 10, 1, "J");
  c.set("g", 34, 9, "Q"); c.set("g", 40, 11, "Q");
  c.fill("g", 27, 14, 16, 2, ":");
  c.fill("g", 26, 15, 17, 1, "2");
  c.set("g", 29, 12, "["); c.set("g", 38, 4, "]");
  c.set("g", 28, 5, "{");
  c.set("g", 30, 14, "N");
  c.set("g", 27, 10, "$");

  // ---- Ridgegate reservoir and its dam -------------------------------------
  c.fill("g", 12, 18, 22, 9, "U");
  c.fill("g", 11, 18, 1, 9, "J");
  c.fill("g", 34, 18, 1, 9, "J");
  c.fill("g", 12, 17, 22, 1, "J");
  c.fill("g", 12, 27, 22, 1, "}");
  c.fill("g", 12, 28, 22, 1, "2");
  c.set("g", 17, 22, "Q"); c.set("g", 28, 24, "Q"); c.set("g", 22, 20, "Q");
  c.fill("g", 24, 17, 2, 1, "<");
  c.fill("g", 35, 18, 8, 10, "1");
  c.fill("g", 35, 17, 8, 1, "0");
  c.fill("g", 34, 28, 9, 1, "2");
  B.trees(c, "teggs-dam", 12, 35, 18, 8, 10, "!", "?", ["1"]);
  c.set("g", 35, 22, "N");

  // ---- the Cat and Fiddle, alone on the tops -------------------------------
  c.fill("g", 1, 22, 10, 10, "0");
  B.house(c, { x: 2, y: 23, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4, over: "^" });
  c.set("g", 3, 23, "m"); c.set("g", 9, 23, "m");
  c.fill("g", 2, 28, 9, 1, "Y");
  c.set("g", 1, 26, "N");
  c.set("g", 3, 30, "$"); c.set("g", 8, 30, "$");
  c.fill("g", 1, 29, 3, 1, "2");

  // ---- heather, gritstone, the tall stuff ---------------------------------
  c.fill("g", 6, 15, 5, 4, "1");
  c.fill("g", 15, 30, 8, 3, "1");
  c.fill("g", 26, 29, 7, 3, "1");
  c.fill("g", 6, 20, 4, 6, "1");
  c.fill("g", 18, 5, 3, 3, "4");
  c.set("g", 9, 17, "3"); c.set("g", 31, 30, "3");
  c.set("g", 13, 31, "5"); c.set("g", 20, 29, "5"); c.set("g", 39, 30, "5");
  c.fill("g", 25, 12, 2, 3, "1");
  c.set("g", 29, 31, "N");
  c.fill("g", 24, 31, 2, 2, "2");
  c.fill("g", 26, 32, 5, 1, "2");
  c.fill("g", 30, 30, 2, 3, "2");

  W.defineMap("teggs_nose", {
    name: "Tegg's Nose", region: "east", outdoor: true, music: "town_bollington", weatherZone: "east",
    ambience: "moor", dialogue: "town_teggs_nose",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 24, y: 1 },
    landmark: { name: "Tegg's Nose", x: 11, y: 6 },
    encounters: { grass: "teggs_nose_grass", water: "teggs_nose_water" },
    fishing: "fish_lyme_park",
    warps: [
      { x: 23, y: 0, to: "route_macc_teggs", tx: 17, ty: 28, dir: "up", kind: "edge" },
      { x: 24, y: 0, to: "route_macc_teggs", tx: 18, ty: 28, dir: "up", kind: "edge" },
      { x: 25, y: 0, to: "route_macc_teggs", tx: 19, ty: 28, dir: "up", kind: "edge" },
      { x: 11, y: 4, to: "teggs_nose_quarry", tx: 15, ty: 26, dir: "up", kind: "cave" },
      { x: 17, y: 13, to: "teggs_nose_centre", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 6, y: 27, to: "teggs_nose_cat_and_fiddle", tx: 6, ty: 11, dir: "up", kind: "door" },
      { x: 30, y: 33, to: "shutlingsloe", tx: 16, ty: 26, dir: "down", kind: "edge" },
      { x: 31, y: 33, to: "shutlingsloe", tx: 17, ty: 26, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 4, y: 4, text: ["TEGG'S NOSE QUARRY — gritstone worked here until 1955.",
        "The machines were left where they stood because moving them cost more than they were worth.",
        "They have not moved. Lately they have hummed."] },
      { x: 13, y: 13, text: ["TEGG'S NOSE COUNTRY PARK — visitor centre, toilets, and a view worth the wheeze."] },
      { x: 30, y: 14, text: ["TRENTABANK — HERONRY. The largest in Cheshire. Twenty-odd nests in the crowns.",
        "PLEASE KEEP TO THE PATH. The herons will not, but you should."] },
      { x: 35, y: 22, text: ["RIDGEGATE RESERVOIR — Macclesfield's water since 1850.", "NO SWIMMING. It is colder than it looks and it looks cold."] },
      { x: 1, y: 26, text: ["THE CAT AND FIDDLE — 1,690 feet. Second-highest inn in England and bitter about the first."] },
      { x: 29, y: 31, text: ["SHUTLINGSLOE 1 MILE.", "It is not a mountain. It is shaped exactly like one and it knows it."] }
    ],
    items: [
      { x: 19, y: 4, item: "elixir", n: 1, flag: "item_teggs_1" },
      { x: 8, y: 16, item: "capsule_kernel", n: 2, hidden: true, flag: "item_teggs_2" },
      { x: 38, y: 20, item: "hide_plate", n: 1, hidden: true, flag: "item_teggs_3" },
      { x: 28, y: 3, item: "capsule_mesh", n: 3, flag: "item_teggs_4" },
      { x: 16, y: 31, item: "viewpoint_teggs_nose", n: 1, hidden: true, flag: "item_teggs_5" }
    ],
    catGaps: [
      { x: 12, y: 27, item: "cat_token_5", n: 1, flag: "catgap_teggs_1",
        say: "MEADOW walks the dam parapet at a height you would rather not think about, sits down halfway, and washes." }
    ],
    restPoints: [{ x: 27, y: 10, flag: "bigboy_sat_teggs" }],
    npcs: [
      { id: "npc_teggs_ceri", x: 24, y: 29, dir: "left", sprite: "npc_fellrunner", behaviour: "look", radius: 4, trainer: "tr_teggs_nose_1", sight: 4, script: "east_teggs_ceri" },
      { id: "npc_teggs_sowerby", x: 8, y: 5, dir: "right", sprite: "npc_miner", behaviour: "still", trainer: "tr_teggs_nose_2", sight: 3, script: "east_teggs_sowerby" },
      { id: "npc_teggs_birder", x: 28, y: 9, dir: "right", sprite: "npc_birder", behaviour: "still", script: "east_teggs_birder" },
      { id: "npc_teggs_ranger", x: 20, y: 15, dir: "down", sprite: "npc_ranger", behaviour: "wander", radius: 3,
        say: ["Wind's a live thing up here. It comes over the edge and drops and it takes your breath as it goes past.",
          "Half the people I stretcher off didn't fall. They just stopped being able to breathe uphill."] },
      { id: "npc_teggs_walker", x: 24, y: 28, dir: "up", sprite: "npc_walker", behaviour: "path", path: [[24, 28], [24, 30], [30, 30]], pathMode: "pingpong",
        say: ["Ridgegate, Trentabank, and Bottoms below that. Three reservoirs, one valley, and a town that drinks it."] },
      { id: "npc_teggs_biker", x: 5, y: 30, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Cat and Fiddle road. Twelve miles of bends and a speed limit invented by somebody who has lost somebody.",
          "I ride it slow now. That's not a moral. That's just what happened."] },
      { id: "npc_teggs_kid", x: 22, y: 30, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["My dad says the quarry machines can't hum because they've got no power.", "I've heard them. They hum in a chord."] },
      { id: "npc_teggs_cat", x: 4, y: 22, dir: "down", sprite: "grinmalkin", behaviour: "still", cond: "phase_dusk", script: "east_teggs_grinmalkin" }
    ],
    triggers: [
      { x: 11, y: 5, w: 1, h: 1, script: "east_teggs_machine_hum", once: "teggs_machine_hum", cond: "!teggs_machine_hum" }
    ]
  });

  // ------------------------------------------------ the visitor centre -----
  W.defineMap("teggs_nose_centre", W.builtin("shop", {
    name: "Tegg's Nose Visitor Centre", region: "east", dialogue: "town_teggs_nose", music: "town_bollington",
    shop: "shop_teggs_nose",
    warps: [
      { x: 6, y: 9, to: "teggs_nose", tx: 17, ty: 14, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "teggs_nose", tx: 17, ty: 14, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_teggs_centre_clerk", x: 1, y: 5, dir: "down", sprite: "npc_ranger", behaviour: "still", shop: "shop_teggs_nose",
        say: ["Flask, map, spare layer. In that order. The view is free and it will still be there if you turn back."] },
      { id: "npc_teggs_centre_1", x: 10, y: 3, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["The quarry made setts. Cobbles. Half of Manchester is standing on this hill and doesn't know it."] }
    ],
    items: [{ x: 12, y: 2, item: "warm_blanket", n: 1, flag: "item_teggs_centre_1" }]
  }));

  // ------------------------------------------ the Cat and Fiddle inn -------
  W.defineMap("teggs_nose_cat_and_fiddle", W.builtin("pub", {
    name: "The Cat and Fiddle", region: "east", dialogue: "town_teggs_nose", music: "town_bollington",
    warps: [
      { x: 6, y: 11, to: "teggs_nose", tx: 6, ty: 28, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "teggs_nose", tx: 6, ty: 28, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_teggs_fiddle", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed", script: "east_teggs_fiddle" },
      { id: "npc_teggs_fiddle_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Rematch board's by the fire. Landlord keeps a list of everyone who's beaten anyone up here.",
          "It's a short list and it's mostly one name and the name isn't hers any more."] },
      { id: "npc_teggs_fiddle_2", x: 4, y: 8, dir: "up", sprite: "npc_fellrunner", behaviour: "still",
        say: ["There's a cat sits on the wall at dusk and repeats what you said an hour ago in the wrong order.",
          "I've stopped saying anything I'd mind hearing back."] }
    ],
    signs: [
      { x: 4, y: 1, text: ["THE REMATCH BOARD", "A chalked ladder of names. Somebody has rubbed out the top one and written it again, harder."] }
    ],
    items: [{ x: 11, y: 8, item: "toffee", n: 3, hidden: true, flag: "item_cat_and_fiddle_1" }]
  }));

  // ------------------------------------------ the quarry cutting ----------
  const q = B.canvas(32, 28, "#");
  q.fill("g", 2, 2, 28, 24, ",");
  q.fill("g", 4, 4, 24, 20, ".");
  q.fill("g", 13, 22, 4, 6, "_");
  q.set("g", 15, 27, "E");
  q.fill("g", 6, 6, 8, 5, "#");
  q.fill("g", 18, 6, 9, 5, "#");
  q.fill("g", 6, 15, 8, 6, "#");
  q.fill("g", 19, 15, 8, 6, "#");
  q.fill("g", 4, 12, 24, 2, "_");
  q.fill("g", 4, 12, 24, 1, "-");
  q.set("g", 8, 13, "K");
  q.fill("g", 15, 4, 2, 18, "_");
  q.fill("g", 15, 4, 1, 18, "|");
  q.set("g", 5, 5, "o"); q.set("g", 28, 8, "o"); q.set("g", 5, 22, "o"); q.set("g", 27, 22, "o");
  q.set("g", 17, 5, "c"); q.set("g", 4, 17, "c");
  q.set("g", 29, 13, "8");
  q.fill("g", 26, 23, 3, 2, ",");
  q.set("g", 28, 24, "z");
  q.set("g", 14, 20, "N");
  q.set("g", 3, 3, "R"); q.set("g", 29, 25, "R");
  q.set("g", 20, 13, "L"); q.set("g", 10, 13, "L");
  W.defineMap("teggs_nose_quarry", {
    name: "The Quarry Cutting", region: "interior", outdoor: false, music: "town_bollington",
    ambience: "cave", dialogue: "town_teggs_nose",
    legend: B.caveLegend({}),
    layers: q.layers(),
    spawnPoint: { x: 15, y: 26 },
    landmark: { name: "Tegg's Nose Quarry", x: 15, y: 13 },
    encounters: { cave: "teggs_nose_quarry_cave", grass: null },
    warps: [{ x: 15, y: 27, to: "teggs_nose", tx: 11, ty: 5, dir: "down", kind: "cave" }],
    signs: [
      { x: 14, y: 20, text: ["A cutting frame, twenty feet of it, blades still strung.",
        "There is no power in this hill. The frame is warm.",
        "Somebody has chalked on the base: 'IT ONLY DOES IT WHEN THE MASTS DO'."] }
    ],
    items: [
      { x: 5, y: 6, item: "salt_crystal", n: 1, flag: "item_teggs_quarry_1" },
      { x: 28, y: 22, item: "heavy_anvil", n: 1, hidden: true, flag: "item_teggs_quarry_2" },
      { x: 5, y: 23, item: "capsule_kernel", n: 2, hidden: true, flag: "item_teggs_quarry_3" },
      { x: 29, y: 12, item: "gritstone_passport", n: 1, hidden: true, flag: "item_teggs_quarry_4" }
    ],
    npcs: [
      { id: "npc_teggs_quarry_caver", x: 20, y: 20, dir: "left", sprite: "npc_caver", behaviour: "still",
        say: ["Grips get you up that face and the face gets you the top of the Nose.",
          "Come back when somebody's taught you. Rock doesn't negotiate and it doesn't rush."] }
    ]
  });

  // ------------------------------------------ Shutlingsloe ----------------
  const sh = B.canvas(34, 28, "1");
  sh.fill("g", 0, 0, 34, 1, "4"); sh.fill("g", 0, 27, 34, 1, "4");
  sh.fill("g", 0, 1, 1, 26, "4"); sh.fill("g", 33, 1, 1, 26, "4");
  sh.fill("g", 16, 26, 2, 2, "2");
  sh.fill("g", 16, 18, 2, 9, "2");
  sh.fill("g", 8, 17, 10, 2, "2");
  sh.fill("g", 8, 11, 2, 7, "2");
  sh.fill("g", 8, 11, 12, 2, "2");
  sh.fill("g", 18, 6, 2, 6, "2");
  sh.fill("g", 12, 5, 8, 2, "2");
  sh.fill("g", 12, 3, 3, 3, "2");
  // the summit cone
  sh.fill("g", 9, 2, 16, 8, "7");
  sh.fill("g", 11, 3, 12, 6, "4");
  sh.fill("g", 13, 4, 8, 4, "7");
  sh.fill("g", 14, 5, 6, 2, "3");
  sh.fill("g", 12, 5, 8, 2, "2");
  sh.set("g", 16, 4, "3"); sh.set("g", 16, 3, "2"); sh.set("g", 17, 3, "2");
  sh.fill("g", 15, 3, 4, 1, "2");
  sh.set("g", 14, 3, "5"); sh.set("g", 19, 3, "5");
  sh.set("g", 11, 9, ">"); sh.set("g", 22, 9, ">");
  sh.fill("g", 3, 20, 6, 5, "0");
  sh.fill("g", 24, 19, 7, 6, "0");
  sh.fill("g", 25, 12, 6, 5, "0");
  sh.set("g", 5, 22, "5"); sh.set("g", 28, 21, "5"); sh.set("g", 27, 14, "4");
  sh.set("g", 15, 20, "S"); sh.set("g", 20, 10, "S");
  B.trees(sh, "shut-thorn", 8, 2, 18, 30, 8, "T", "y", ["0", "1"]);
  W.defineMap("shutlingsloe", {
    name: "Shutlingsloe", region: "east", outdoor: true, music: "town_bollington",
    weatherZone: "east", ambience: "moor", dialogue: "town_teggs_nose",
    legend: B.merge(LEG, { "S": "sign_post" }),
    layers: sh.layers(),
    spawnPoint: { x: 16, y: 26 },
    landmark: { name: "Shutlingsloe", x: 16, y: 5 },
    encounters: { grass: "shutlingsloe_grass", water: null },
    warps: [
      { x: 16, y: 27, to: "teggs_nose", tx: 30, ty: 32, dir: "down", kind: "edge" },
      { x: 17, y: 27, to: "teggs_nose", tx: 31, ty: 32, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 15, y: 20, text: ["SHUTLINGSLOE 1,660 FT. THE PATH IS THE PATH. DO NOT MAKE A NEW ONE.",
        "Somebody has added: 'the summit dash record is 11:04 and it is CERI'S and she will tell you'"] },
      { x: 20, y: 10, text: ["THE LAST PULL.", "From here it is steps, then rock, then wind, then everything."] }
    ],
    items: [
      { x: 5, y: 21, item: "capsule_kernel", n: 2, flag: "item_shutlingsloe_1" },
      { x: 28, y: 20, item: "elixir", n: 1, hidden: true, flag: "item_shutlingsloe_2" },
      { x: 17, y: 4, item: "viewpoint_shutlingsloe", n: 1, hidden: true, flag: "item_shutlingsloe_3" }
    ],
    npcs: [
      { id: "npc_shut_ceri", x: 16, y: 19, dir: "up", sprite: "npc_fellrunner", behaviour: "still", script: "east_shutlingsloe_dash" },
      { id: "npc_shut_summit", x: 18, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still", script: "east_shutlingsloe_summit" },
      { id: "npc_shut_moorcock", x: 27, y: 21, dir: "left", sprite: "animal", behaviour: "wander", radius: 3,
        say: ["Something explodes out of the heather at knee height, swears at you in bird, and is gone.", "Your heart takes a full minute to agree it was a bird."] }
    ],
    restPoints: [{ x: 9, y: 12, flag: "bigboy_sat_shutlingsloe" }],
    triggers: [
      { x: 16, y: 3, w: 2, h: 1, script: "east_shutlingsloe_top", once: "shutlingsloe_top", cond: "!shutlingsloe_top" }
    ]
  });
})();
