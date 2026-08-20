// =============================================================
// MonsterQuest v2 — STYAL & QUARRY BANK MILL (region east, WORLD-BIBLE §2 J2)
// Water-powered mill in the Bollin gorge: the giant iron wheel, the
// Apprentice House, timber cottages, the weir, and aircraft going over
// low enough to read. Ch.2's wheel-at-three-in-the-morning lives here.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "wall_tudor", "1": "wall_tudor_beam", "2": "roof_thatch", "3": "water_river",
    "4": "shallows", "5": "waterfall", "6": "cliff_face", "7": "cliff_top", "8": "airport_fence",
    "9": "runway", "E": "tree_pine", "Q": "fish_spot", "U": "boat_dock", "J": "water_reeds",
    "Y": "path_gravel", "!": "picnic_table", "?": "tree_pine_top", ":": "pine_forest_floor",
    ";": "gate_wood", "<": "bridge_wood", ">": "log", "[": "stump", "]": "berry_bush",
    "{": "fence_stone", "}": "greenhouse_bed", "|": "hay_bale", "$": "sack"
  });

  // -------------------------------------------------------------- village --
  const c = B.canvas(44, 35, ".");
  c.fill("g", 0, 0, 44, 2, "E");
  for (let x = 0; x < 44; x++) c.set("o", x, 0, "?");
  c.fill("g", 0, 2, 1, 32, "T");
  c.fill("g", 43, 2, 1, 32, "T");
  c.fill("g", 0, 34, 44, 1, "T");
  c.fill("g", 21, 33, 3, 2, "+");   // south — The Carrs and Wilmslow

  // ---- the Bollin through the gorge ---------------------------------------
  c.fill("g", 1, 17, 42, 1, "6");
  c.fill("g", 1, 18, 42, 4, "3");
  c.fill("g", 1, 22, 42, 1, "e");
  c.set("g", 1, 17, "6");
  c.fill("g", 30, 18, 5, 1, "5");
  c.fill("g", 30, 19, 5, 3, "4");
  c.set("g", 12, 20, "Q"); c.set("g", 27, 21, "Q"); c.set("g", 38, 19, "Q");
  c.set("g", 8, 21, "J"); c.set("g", 36, 20, "J");
  c.fill("g", 21, 17, 2, 6, "x");
  c.fill("d", 20, 18, 1, 4, "F"); c.fill("d", 23, 18, 1, 4, "F");

  // ---- the mill yard and Quarry Bank Mill ---------------------------------
  c.fill("g", 2, 23, 30, 9, "Y");
  B.house(c, { x: 7, y: 23, w: 14, h: 6, rh: 2, roof: "R", wall: "V", win: "v", door: "D", doorX: 6, over: "^" });
  c.set("g", 8, 23, "M"); c.set("g", 19, 23, "M");
  c.set("g", 7, 26, "@");
  c.fill("g", 4, 18, 2, 5, "~");
  c.fill("g", 4, 23, 2, 4, "~");
  c.set("g", 6, 23, "Z"); c.set("g", 6, 24, "Z"); c.set("g", 6, 25, "Z");
  c.set("g", 3, 22, "K"); c.set("g", 3, 27, "K");
  c.fill("g", 2, 27, 4, 5, "Y");
  c.set("g", 6, 22, "e");
  c.set("g", 22, 29, "N");
  c.set("g", 6, 30, "N");
  // the apprentice house is up on the bank behind the mill
  B.house(c, { x: 24, y: 24, w: 8, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 25, 24, "m");
  c.fill("g", 24, 29, 8, 1, "Y");
  c.set("g", 32, 27, "N");
  c.fill("g", 33, 23, 9, 9, ",");
  c.fill("g", 33, 24, 8, 6, "\"");
  B.trees(c, "styal-gorge", 12, 32, 23, 11, 9, "T", "y", [",", "\""]);
  c.fill("g", 2, 32, 40, 2, ",");
  c.fill("g", 21, 30, 3, 4, "+");
  c.fill("g", 3, 32, 14, 2, "\"");
  c.fill("g", 27, 32, 14, 2, "\"");
  c.set("g", 19, 33, ">"); c.set("g", 26, 32, "]");

  // ---- Styal village, timber cottages on the north bank -------------------
  c.fill("g", 1, 3, 42, 14, ",");
  c.fill("g", 21, 3, 2, 14, "_");
  c.fill("g", 8, 11, 28, 1, "_");
  c.fill("g", 8, 11, 1, 5, "_");
  B.house(c, { x: 5, y: 5, w: 10, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4, over: "^" });
  c.set("g", 6, 5, "m"); c.set("g", 13, 5, "m");
  c.fill("g", 5, 10, 10, 1, "_");
  c.set("g", 4, 8, "N");
  // the timber cottages
  const cots = [[4, 13], [10, 13], [27, 4], [33, 4], [27, 13], [33, 13]];
  for (let i = 0; i < cots.length; i++) {
    const q = cots[i];
    B.house(c, { x: q[0], y: q[1], w: 5, h: 3, rh: 1, roof: "2", wall: "0", win: "W", door: "D", doorX: 2, over: "^" });
    c.set("g", q[0], q[1] + 2, "1"); c.set("g", q[0] + 4, q[1] + 2, "1");
  }
  c.fill("g", 4, 16, 12, 1, "_");
  c.fill("g", 27, 16, 12, 1, "_");
  c.fill("g", 27, 7, 12, 1, "_");
  c.fill("g", 16, 11, 1, 6, "_");
  c.fill("g", 26, 7, 1, 10, "_");
  c.fill("g", 39, 7, 1, 10, "_");
  c.fill("g", 16, 16, 11, 1, "_");
  c.fill("g", 17, 4, 3, 6, "\"");
  c.fill("g", 24, 12, 2, 4, "\"");
  c.set("g", 18, 12, "/"); c.set("g", 19, 14, "H");
  c.set("g", 20, 11, "N");
  c.set("g", 34, 12, "N");
  // the greenhouse and kitchen garden the mill fed its apprentices from
  c.fill("g", 5, 3, 9, 1, "}");
  c.set("g", 15, 3, "|");
  c.set("g", 3, 4, "{"); c.set("g", 15, 9, "{");

  // ---- the runway mound, out on the airport boundary ----------------------
  c.fill("g", 34, 2, 9, 5, "7");
  c.fill("g", 35, 3, 7, 3, ";");
  c.fill("g", 35, 3, 7, 1, "9");
  c.fill("g", 34, 6, 9, 1, "8");
  c.fill("g", 38, 6, 2, 1, ";");
  c.set("g", 37, 5, "!"); c.set("g", 40, 5, "!");
  c.set("g", 36, 7, "N");
  c.fill("g", 39, 7, 1, 4, "_");

  W.defineMap("styal", {
    name: "Styal", region: "bollin", outdoor: true, music: "town_wilmslow", weatherZone: "bollin",
    ambience: "water", dialogue: "town_styal",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 22, y: 33 },
    landmark: { name: "Quarry Bank Mill", x: 13, y: 26 },
    encounters: { grass: "styal_grass", water: "styal_water" },
    fishing: "fish_styal",
    warps: [
      { x: 21, y: 34, to: "route_wilmslow_styal", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 22, y: 34, to: "route_wilmslow_styal", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 23, y: 34, to: "route_wilmslow_styal", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 13, y: 28, to: "styal_quarry_bank_mill", tx: 16, ty: 22, dir: "up", kind: "door" },
      { x: 7, y: 26, to: "styal_wheelhouse", tx: 10, ty: 18, dir: "left", kind: "door" },
      { x: 27, y: 28, to: "styal_apprentice_house", tx: 10, ty: 16, dir: "up", kind: "door" },
      { x: 9, y: 9, to: "styal_chapel", tx: 6, ty: 13, dir: "up", kind: "door" },
      { x: 35, y: 15, to: "styal_fridge_house", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 6, y: 15, to: "styal_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 29, y: 6, to: "styal_house_2", tx: 5, ty: 8, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 4, y: 8, text: ["THE VILLAGE CHAPEL — built by the mill, for the mill, on the mill's terms.",
        "Attendance was compulsory. That is not on the plaque. It is in the ledgers, and the ledgers are inside."] },
      { x: 6, y: 30, text: ["THE WHEEL — fifty tonnes of iron and twenty-four feet of fall.",
        "It turns when the sluices open. The sluices open when somebody opens them.",
        "Somebody has written underneath, recently, in pencil: '3.02am. again. NOBODY OPENED THEM.'"] },
      { x: 22, y: 29, text: ["QUARRY BANK MILL — cotton, 1784. Water first, steam later, never electricity.",
        "Which makes what it has started doing at three in the morning quite difficult to explain."] },
      { x: 32, y: 27, text: ["THE APPRENTICE HOUSE — ninety children, one cook, and a bell.",
        "The bell still rings. Volunteers stopped ringing it in 2011."] },
      { x: 20, y: 11, text: ["STYAL VILLAGE. Please respect residents. Some of these cottages have been lived in since 1790.",
        "One of them has an internet fridge. The village has opinions about that."] },
      { x: 34, y: 12, text: ["No sign. A cottage with a very new front door and a very new box on the wall beside it.",
        "The box is humming. The cottage is not in."] },
      { x: 36, y: 7, text: ["THE MOUND — plane spotters welcome. Please do not cross the fence.",
        "Somebody has logged every departure for eleven years. Ask Kwame. Do not ask Kwame unless you mean it."] }
    ],
    items: [
      { x: 3, y: 33, item: "capsule_net", n: 2, flag: "item_styal_1" },
      { x: 40, y: 25, item: "elixir", n: 1, hidden: true, flag: "item_styal_2" },
      { x: 18, y: 5, item: "silk_cocoon", n: 1, hidden: true, flag: "item_styal_3" },
      { x: 40, y: 33, item: "copper_coil", n: 1, hidden: true, flag: "item_styal_4" },
      { x: 25, y: 14, item: "tonic", n: 2, flag: "item_styal_5" }
    ],
    catGaps: [
      { x: 5, y: 22, item: "cat_token_7", n: 1, flag: "catgap_styal_1",
        say: "MEADOW goes along the sill above the race — four inches of wet stone over a fifty-tonne wheel — and comes back with a length of blue cable in her teeth." }
    ],
    restPoints: [{ x: 33, y: 30, flag: "bigboy_sat_styal" }],
    npcs: [
      { id: "npc_styal_enid", x: 5, y: 29, dir: "right", sprite: "npc_weaver", behaviour: "still", script: "east_styal_enid" },
      { id: "npc_styal_kwame", x: 38, y: 8, dir: "up", sprite: "npc_birder", behaviour: "still", script: "east_styal_kwame" },
      { id: "npc_styal_volunteer", x: 24, y: 30, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_styal_1", sight: 0 },
      { id: "npc_styal_mill_hand", x: 17, y: 30, dir: "up", sprite: "npc_weaver", behaviour: "look", radius: 3, trainer: "tr_styal_2", sight: 3 },
      { id: "npc_styal_angler", x: 26, y: 23, dir: "up", sprite: "npc_fisher", behaviour: "still", trainer: "tr_styal_3", sight: 3 },
      { id: "npc_styal_kid", x: 19, y: 12, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["The bell in the Apprentice House rings at night and there's nobody on the rope.",
          "My mum says it's the wind. There is no wind INSIDE, mum."] },
      { id: "npc_styal_gardener", x: 8, y: 4, dir: "down", sprite: "npc_farmer", behaviour: "still",
        say: ["Kitchen garden fed ninety children on four acres. Turnips, mostly. Cabbage when it went well.",
          "I grow the same things now for visitors who photograph them and buy a scone."] },
      { id: "npc_styal_granny", x: 30, y: 16, dir: "up", sprite: "npc_granny", behaviour: "still", script: "east_styal_granny" },
      { id: "npc_styal_walker", x: 22, y: 23, dir: "down", sprite: "npc_walker", behaviour: "path", path: [[22, 23], [22, 17], [22, 12]], pathMode: "pingpong",
        say: ["Bridge over the Bollin, mill on one side, village on the other, and everything in between belongs to the water."] },
      { id: "npc_styal_spotter", x: 40, y: 9, dir: "left", sprite: "npc_birder", behaviour: "still", trainer: "tr_styal_4", sight: 0,
        say: ["My radio's been pulling in telemetry that isn't aircraft. Same burst, every ninety seconds, from the south-west.",
          "I've logged it for eleven days. Nobody wants the log. You can have the log."] }
    ],
    triggers: [
      { x: 21, y: 23, w: 2, h: 1, script: "east_styal_wheel_first", once: "styal_wheel_first", cond: "!styal_wheel_first" }
    ]
  });

  // ------------------------------------------------ Quarry Bank Mill -------
  const ml = B.canvas(32, 24, "F");
  ml.box("g", 0, 0, 32, 24, "V");
  ml.fill("g", 1, 0, 30, 1, "^");
  ml.fill("g", 1, 1, 30, 1, "V");
  for (let x = 3; x < 29; x += 4) ml.fill("g", x, 1, 2, 1, "v");
  for (let y = 4; y < 18; y += 4) { ml.fill("g", 2, y, 12, 1, "L"); ml.fill("g", 17, y, 12, 1, "L"); }
  ml.fill("g", 15, 2, 2, 20, "S");
  ml.fill("g", 15, 6, 2, 1, "F"); ml.fill("g", 15, 12, 2, 1, "F"); ml.fill("g", 15, 18, 2, 1, "F");
  ml.fill("g", 2, 20, 4, 2, "K"); ml.fill("g", 26, 20, 4, 2, "K");
  ml.set("g", 15, 23, "D"); ml.set("g", 16, 23, "D");
  ml.fill("g", 15, 21, 2, 2, "M");
  ml.set("g", 1, 2, "G"); ml.set("g", 30, 2, "G");
  ml.set("g", 10, 20, "N"); ml.set("g", 22, 20, "N");
  W.defineMap("styal_quarry_bank_mill", {
    name: "Quarry Bank Mill", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "industrial", dialogue: "town_styal",
    legend: {
      "V": "mill_wall", "^": "wall_interior_top", "v": "mill_window", "F": "floor_wood_dark",
      "L": "loom", "S": "stairs", "K": "silk_bolt", "G": "machine", "N": "sign",
      "D": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: ml.layers(),
    spawnPoint: { x: 16, y: 22 },
    warps: [
      { x: 15, y: 23, to: "styal", tx: 13, ty: 29, dir: "down", kind: "door" },
      { x: 16, y: 23, to: "styal", tx: 13, ty: 29, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_mill_guide", x: 16, y: 19, dir: "down", sprite: "npc_historian", behaviour: "still", script: "east_styal_mill_guide" },
      { id: "npc_mill_hand_2", x: 6, y: 9, dir: "right", sprite: "npc_weaver", behaviour: "wander", radius: 2,
        say: ["Two hundred looms and every one of them driven off one shaft off one wheel off one river.",
          "One point of failure and they built a village round it. We do exactly the same and call it the cloud."] },
      { id: "npc_mill_child", x: 24, y: 14, dir: "left", sprite: "npc_kid", behaviour: "still",
        say: ["The little ones crawled under the machines while they were running. To pick up the cotton.",
          "That's why they were little ones. That's the whole reason."] }
    ],
    signs: [
      { x: 10, y: 20, text: ["THE POWER TRAIN", "Wheel, pit wheel, upright shaft, bevel gears, line shafting, belts, looms.",
        "Every step of it visible, mechanical, and impossible to fake. Which is why the last fortnight has been so upsetting."] },
      { x: 22, y: 20, text: ["THE GREG LEDGERS", "Wages, hours, and the price of a child's indenture, kept in a beautiful hand.",
        "Nothing in this building is hidden. That was never the problem."] }
    ],
    items: [{ x: 30, y: 22, item: "silk_wrap", n: 1, hidden: true, flag: "item_qb_mill_1" }],
    encounters: { grass: null }
  });

  // ------------------------------------------------ the wheelhouse ---------
  // Ch.2's night puzzle: three sluices, surge lighting, and a fridge on the
  // end of a cable that has no business being here at all.
  const wh = B.canvas(22, 20, "_");
  wh.box("g", 0, 0, 22, 20, "V");
  wh.fill("g", 1, 0, 20, 1, "^");
  wh.fill("g", 1, 1, 20, 1, "V");
  wh.fill("g", 3, 1, 2, 1, "v"); wh.fill("g", 16, 1, 2, 1, "v");
  wh.fill("g", 2, 3, 5, 14, "~");
  wh.fill("g", 7, 4, 3, 12, "Z");
  wh.fill("g", 10, 3, 2, 14, "_");
  wh.set("g", 3, 3, "K"); wh.set("g", 3, 9, "K"); wh.set("g", 3, 15, "K");
  wh.set("g", 12, 4, "G"); wh.set("g", 12, 9, "G"); wh.set("g", 12, 14, "G");
  wh.fill("g", 14, 3, 6, 5, "F");
  wh.fill("g", 15, 4, 4, 3, "R");
  wh.set("g", 17, 12, "P");
  wh.fill("g", 14, 15, 6, 3, "F");
  wh.set("g", 16, 16, "C"); wh.set("g", 18, 16, "C");
  wh.set("g", 10, 19, "D"); wh.set("g", 11, 19, "D");
  wh.fill("g", 10, 17, 2, 2, "M");
  wh.set("g", 13, 10, "N");
  W.defineMap("styal_wheelhouse", {
    name: "The Wheelhouse", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "industrial", dialogue: "town_styal",
    legend: {
      "V": "mill_wall", "^": "wall_interior_top", "v": "mill_window", "_": "floor_stone",
      "F": "floor_wood_dark", "~": "water_canal", "Z": "mill_wheel", "K": "canal_lock",
      "G": "machine", "R": "server_rack", "P": "fridge", "C": "crate", "N": "sign",
      "D": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: wh.layers(),
    spawnPoint: { x: 10, y: 18 },
    landmark: { name: "The Wheelhouse", x: 8, y: 10 },
    warps: [
      { x: 10, y: 19, to: "styal", tx: 6, ty: 26, dir: "down", kind: "door" },
      { x: 11, y: 19, to: "styal", tx: 6, ty: 26, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wheelhouse_sluice_1", x: 11, y: 4, dir: "right", sprite: "npc_weaver", behaviour: "still", script: "east_styal_sluice_1" },
      { id: "npc_wheelhouse_sluice_2", x: 11, y: 9, dir: "right", sprite: "npc_weaver", behaviour: "still", script: "east_styal_sluice_2" },
      { id: "npc_wheelhouse_sluice_3", x: 11, y: 14, dir: "right", sprite: "npc_weaver", behaviour: "still", script: "east_styal_sluice_3" },
      { id: "npc_wheelhouse_fridge", x: 17, y: 13, dir: "up", sprite: "npc_shadow_it", behaviour: "still", script: "east_styal_fridge" }
    ],
    signs: [
      { x: 13, y: 10, text: ["SLUICE ORDER: TOP, BOTTOM, MIDDLE. In that order or the wheel judders and the shaft complains.",
        "Written 1892. Amended 1954. Not amended since. It does not need amending; water has not changed its mind."] },
      { x: 17, y: 12, text: ["A domestic fridge-freezer, plugged into the sluice controller's spare socket.",
        "Its screen is showing a shopping list, a weather forecast, and eleven thousand outbound connections."] }
    ],
    items: [{ x: 20, y: 17, item: "copper_coil", n: 1, hidden: true, flag: "item_wheelhouse_1" }],
    encounters: { grass: null }
  });

  // ------------------------------------------------ the Apprentice House ---
  const ap = B.canvas(22, 18, "_");
  ap.box("g", 0, 0, 22, 18, "#");
  ap.fill("g", 1, 0, 20, 1, "^");
  ap.fill("g", 1, 1, 20, 1, "#");
  ap.fill("g", 3, 1, 2, 1, "W"); ap.fill("g", 16, 1, 2, 1, "W");
  for (let i = 0; i < 5; i++) { ap.set("g", 2 + i * 4, 3, "B"); ap.set("g", 2 + i * 4, 4, "b"); }
  for (let i = 0; i < 5; i++) { ap.set("g", 2 + i * 4, 7, "B"); ap.set("g", 2 + i * 4, 8, "b"); }
  ap.fill("g", 2, 11, 8, 1, "t");
  ap.fill("g", 2, 12, 8, 1, "h");
  ap.fill("g", 14, 11, 5, 1, "o");
  ap.set("g", 18, 12, "n");
  ap.set("g", 12, 14, "k");
  ap.set("g", 10, 17, "d"); ap.set("g", 11, 17, "d");
  ap.fill("g", 10, 15, 2, 2, "M");
  ap.set("g", 20, 3, "P");
  W.defineMap("styal_apprentice_house", {
    name: "The Apprentice House", region: "bollin", outdoor: false, music: "town_wilmslow",
    ambience: "town", dialogue: "town_styal",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood",
      "B": "bed_head", "b": "bed", "t": "table", "h": "chair", "o": "stove", "n": "sink",
      "k": "bookcase", "P": "painting", "d": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: ap.layers(),
    spawnPoint: { x: 10, y: 16 },
    warps: [
      { x: 10, y: 17, to: "styal", tx: 27, ty: 29, dir: "down", kind: "door" },
      { x: 11, y: 17, to: "styal", tx: 27, ty: 29, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_apprentice_guide", x: 11, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still", script: "east_styal_apprentice" },
      { id: "npc_apprentice_ghost", x: 4, y: 6, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still", cond: "phase_night",
        say: ["A small shape sits on the end of a bed that has been empty for two hundred years.",
          "It is not frightening. It is patient. That is worse."] }
    ],
    signs: [
      { x: 20, y: 3, text: ["A list of names, ages and indenture dates.",
        "The youngest is nine. The column headed 'RAN' has fourteen ticks in it and every tick is somebody who tried."] }
    ],
    items: [{ x: 1, y: 15, item: "warm_blanket", n: 1, hidden: true, flag: "item_apprentice_1" }],
    encounters: { grass: null }
  });

  W.defineMap("styal_chapel", W.builtin("church", {
    name: "Norcliffe Chapel", region: "bollin", dialogue: "town_styal", music: "town_wilmslow",
    warps: [
      { x: 6, y: 13, to: "styal", tx: 9, ty: 10, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "styal", tx: 9, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_styal_chapel_1", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Unitarian. The Gregs built it and made everyone attend, which is a strange thing to do with a faith about conscience.",
          "People are like that. They build the right thing and then insist on it."] }
    ],
    items: [{ x: 1, y: 11, item: "salve", n: 2, hidden: true, flag: "item_styal_chapel_1" }]
  }));

  // ------------------------------------------------ the fridge house -------
  W.defineMap("styal_fridge_house", W.builtin("house_small", {
    name: "Bank Cottage", region: "bollin", dialogue: "town_styal", music: "town_wilmslow",
    warps: [
      { x: 5, y: 9, to: "styal", tx: 35, ty: 16, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "styal", tx: 35, ty: 16, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_styal_fridge_owner", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still", script: "east_styal_fridge_owner" }
    ],
    signs: [
      { x: 10, y: 7, text: ["A gap where a fridge used to stand, and a socket with a label on it in somebody else's handwriting.",
        "The label says: LEAVE ON."] }
    ],
    items: [{ x: 1, y: 3, item: "patch_cable", n: 1, hidden: true, flag: "item_fridge_house_1" }]
  }));

  const homes = [
    { id: "styal_house_1", tx: 6, ty: 16, name: "Oak Cottages",
      npc: { id: "npc_styal_h1", sprite: "npc_weaver", say: ["Four generations in this room and every one of them worked in that mill until my dad.",
        "He got out and went to the airport. Loading bays. Different noise, same shift."] } },
    { id: "styal_house_2", tx: 29, ty: 7, name: "Farm Fold",
      npc: { id: "npc_styal_h2", sprite: "npc_farmer", say: ["The wheel stopping used to wake people. Now the wheel STARTING wakes people.",
        "You get used to a sound. You do not get used to it happening at the wrong time."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "bollin", dialogue: "town_styal", music: "town_wilmslow",
      warps: [
        { x: 5, y: 9, to: "styal", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "styal", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }
})();
