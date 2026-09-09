// =============================================================
// MonsterQuest v2 — ANDERTON BOAT LIFT, MARBURY and GREAT BUDWORTH
// (region salt, Ch.7). The cathedral of the canals: fifty feet of
// Victorian iron that lifts a boat, whole, from the River Weaver to
// the Trent & Mersey. Two levels, one portal, and — since somebody
// fitted a smart plug in 2019 — one very cheap point of failure.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const TOWN = B.salt({
    "V": "wall_render_white", "%": "shop_awning", "q": "picnic_table", "&": "bunting",
    "I": "boat_lift", "i": "boat_lift_top", "M": "chimney_mill", "v": "window_lit"
  });

  // ======================================================== the lower site =
  const c = B.canvas(40, 30, ",");
  c.fill("g", 0, 0, 40, 1, "T"); c.fill("g", 0, 29, 40, 1, "T");
  c.fill("g", 0, 1, 1, 28, "T"); c.fill("g", 39, 1, 1, 28, "T");
  for (let x = 0; x < 40; x++) c.set("o", x, 0, "y");
  c.fill("g", 18, 29, 3, 1, "t");

  // the Weaver along the bottom
  c.fill("g", 1, 24, 38, 4, "!");
  c.fill("g", 1, 23, 38, 1, "t");
  c.fill("g", 1, 28, 38, 1, "t");
  c.set("g", 6, 23, "Q"); c.set("g", 33, 28, "Q");
  c.fill("g", 18, 22, 3, 2, "9");
  c.set("g", 19, 24, "8");

  // the lift: two towers of ironwork, the caissons between them
  c.fill("g", 14, 4, 3, 19, "I");
  c.fill("g", 24, 4, 3, 19, "I");
  c.fill("g", 17, 4, 7, 2, "I");
  for (let x = 14; x < 27; x++) c.set("o", x, 3, "i");
  c.fill("g", 17, 6, 7, 14, ",");
  c.fill("g", 18, 8, 5, 10, "~");
  c.fill("g", 17, 20, 7, 3, "_");
  c.set("g", 20, 20, "9"); c.set("g", 21, 20, "9");
  c.set("g", 16, 21, "N");
  c.fill("g", 10, 24, 2, 4, "x");

  // the visitor side: centre, café, benches, the interpretation boards
  c.fill("g", 2, 8, 11, 12, ",");
  B.house(c, { x: 3, y: 10, w: 9, h: 5, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 2, 14, "N");
  c.fill("g", 2, 16, 11, 1, "_");
  c.set("g", 4, 18, "q"); c.set("g", 9, 18, "q");
  c.fill("g", 3, 20, 10, 3, "\"");
  c.txt("o", 3, 9, "&&&&&&&&&");

  // the lift office, east of the ironwork
  c.fill("g", 28, 8, 10, 12, ",");
  B.house(c, { x: 29, y: 10, w: 8, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 28, 14, "N");
  c.fill("g", 28, 16, 10, 1, "_");
  c.fill("g", 30, 18, 6, 4, "\"");
  c.set("g", 37, 19, "[");

  // the long way up: a stair zigzag on the west bank
  c.fill("g", 2, 2, 2, 6, "s");
  c.fill("g", 2, 4, 8, 1, "s");
  c.fill("g", 9, 2, 1, 3, "s");
  c.fill("g", 4, 2, 6, 1, ":");
  c.fill("g", 11, 2, 26, 5, "\"");
  c.set("g", 2, 1, "s");
  c.set("g", 10, 5, "N");
  B.trees(c, "and-fringe", 20, 11, 2, 26, 5, "T", "y", ["\""]);
  c.fill("g", 13, 6, 1, 17, ",");
  c.fill("g", 27, 6, 1, 17, ",");
  c.fill("g", 2, 6, 36, 2, ",");
  c.set("g", 35, 7, "5");

  W.defineMap("anderton", {
    name: "Anderton Boat Lift", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "water", dialogue: "town_anderton",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 19, y: 28 },
    healPoint: { x: 7, y: 16 },
    landmark: { name: "Anderton Boat Lift", x: 20, y: 12 },
    encounters: { grass: "anderton_grass", water: "anderton_water" },
    fishing: "fish_anderton",
    warps: [
      { x: 7, y: 14, to: "anderton_lift_office", tx: 8, ty: 12, dir: "up", kind: "door" },
      { x: 32, y: 14, to: "anderton_lift_office", tx: 8, ty: 12, dir: "up", kind: "door" },
      { x: 20, y: 20, to: "anderton_lift_lower", tx: 13, ty: 14, dir: "up", kind: "stairs" },
      { x: 21, y: 20, to: "anderton_lift_lower", tx: 14, ty: 14, dir: "up", kind: "stairs" },
      { x: 2, y: 1, to: "anderton_lift_upper", tx: 3, ty: 20, dir: "up", kind: "stairs" },
      { x: 18, y: 29, to: "route_northwich_anderton", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 19, y: 29, to: "route_northwich_anderton", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 20, y: 29, to: "route_northwich_anderton", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 2, y: 14, text: ["ANDERTON BOAT LIFT — 1875.", "Fifty feet and fifty seconds. Two caissons, each holding two hundred and fifty tonnes of water and whatever is floating in it.",
        "It is the only working boat lift in Britain and the people who run it are extremely calm about that."] },
      { x: 16, y: 21, text: ["LOWER BASIN — RIVER WEAVER LEVEL.", "Boats up: 4. Boats down: 4. Cats on roofs: 4. (The last figure is not an official statistic. Somebody keeps adding it.)"] },
      { x: 28, y: 14, text: ["LIFT ENGINEER'S OFFICE.", "Please do not ask whether it is safe. Ask whether it is BALANCED. That is the question that matters."] },
      { x: 10, y: 5, text: ["THE LONG WAY ROUND — footpath to the upper canal.", "Forty minutes on foot, or fifty feet in fifty seconds. Your choice; both are correct."] }
    ],
    items: [
      { x: 12, y: 22, item: "elixir", n: 2, flag: "item_anderton_1" },
      { x: 36, y: 21, item: "capsule_net", n: 3, hidden: true, flag: "item_anderton_2" },
      { x: 3, y: 3, item: "roe", n: 2, hidden: true, flag: "item_anderton_3" }
    ],
    restPoints: [{ x: 5, y: 18, flag: "meadow_sat_anderton" }],
    npcs: [
      { id: "npc_anderton_beth", x: 32, y: 16, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_beth" },
      { id: "npc_anderton_osian", x: 22, y: 23, dir: "up", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_anderton_2", sight: 4 },
      { id: "npc_anderton_lowri", x: 34, y: 8, dir: "down", sprite: "npc_shadow_it", behaviour: "look", radius: 3, trainer: "tr_anderton_3", sight: 3, script: "sw_anderton_plug" },
      { id: "npc_anderton_visitor", x: 8, y: 17, dir: "up", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["You can stand underneath it. They let you stand UNDERNEATH it, while it is going up, with a boat in it."] },
      { id: "npc_anderton_granny", x: 10, y: 22, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["My father worked the hydraulics before they went electric in 1908.", "He said the water knew what it was doing and the electricity only thought it did."] },
      { id: "npc_anderton_boater2", x: 30, y: 23, dir: "left", sprite: "npc_boater", behaviour: "path", path: [[26, 23], [36, 23]], pathMode: "pingpong",
        say: ["Cats ride the roof going up. Every cat. Nobody knows why. Everybody's seen it."] }
    ],
    triggers: [
      { x: 18, y: 21, w: 4, h: 1, script: "sw_anderton_arrival", once: "anderton_arrival", cond: "!anderton_arrival && chapter >= 7", kind: "step" }
    ]
  });

  // ======================================================= the lower dock =
  const lo = B.canvas(28, 18, ",");
  B.frame(lo, "I", 1);
  lo.fill("g", 1, 1, 26, 16, ",");
  lo.fill("g", 8, 5, 12, 8, "~");
  lo.fill("g", 7, 5, 1, 8, "t"); lo.fill("g", 20, 5, 1, 8, "t");
  lo.fill("g", 7, 13, 14, 1, "9");
  lo.fill("g", 2, 14, 24, 2, "_");
  lo.set("g", 13, 17, "s"); lo.set("g", 14, 17, "s");
  // the caisson bay, open to the dock, with the lift shaft above it
  lo.fill("g", 11, 2, 6, 3, "_");
  lo.fill("g", 12, 5, 4, 8, "~");
  lo.fill("g", 11, 5, 1, 1, "t"); lo.fill("g", 16, 5, 1, 1, "t");
  lo.set("g", 10, 2, "I"); lo.set("g", 17, 2, "I");
  lo.fill("g", 11, 4, 6, 1, "_");
  lo.fill("g", 7, 4, 14, 1, "_");
  lo.set("g", 5, 15, "N"); lo.set("g", 23, 15, "L");
  lo.set("g", 3, 8, "M"); lo.set("g", 24, 8, "5");
  lo.set("g", 4, 3, "["); lo.set("g", 24, 3, "]");
  lo.fill("g", 2, 5, 5, 8, ",");
  lo.fill("g", 21, 5, 5, 8, ",");
  lo.set("g", 6, 9, "Q"); lo.set("g", 21, 10, "Q");

  W.defineMap("anderton_lift_lower", {
    name: "Anderton Lift — Weaver Level", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "industrial", dialogue: "town_anderton",
    legend: TOWN, layers: lo.layers(),
    spawnPoint: { x: 13, y: 14 },
    landmark: { name: "The Lower Caisson", x: 13, y: 7 },
    encounters: { water: "anderton_water", grass: null },
    fishing: "fish_anderton",
    warps: [
      { x: 13, y: 17, to: "anderton", tx: 20, ty: 21, dir: "down", kind: "stairs" },
      { x: 14, y: 17, to: "anderton", tx: 21, ty: 21, dir: "down", kind: "stairs" },
      { x: 13, y: 2, to: "anderton_lift_upper", tx: 20, ty: 18, dir: "up", kind: "lift", cond: "lift_pass" },
      { x: 14, y: 2, to: "anderton_lift_upper", tx: 21, ty: 18, dir: "up", kind: "lift", cond: "lift_pass" }
    ],
    signs: [{ x: 5, y: 15, text: ["CAISSON 1 — 250 TONNES OF WATER.",
      "The boat does not go up. The WATER goes up, and the boat, being a boat, has no opinion about it.",
      "PASS REQUIRED. Beth will give you one when she has seen you take it seriously."] }],
    items: [{ x: 25, y: 4, item: "salt_lick", n: 2, hidden: true, flag: "item_anderton_lift_lower_1" }],
    npcs: [
      { id: "npc_anderton_lower_hand", x: 22, y: 14, dir: "left", sprite: "npc_signaller", behaviour: "still",
        say: ["Fifty feet in fifty seconds and you will feel exactly none of it.", "That's the trick. That's the whole trick."] }
    ]
  });

  // ======================================================= the upper basin =
  const up = B.canvas(40, 24, ",");
  up.fill("g", 0, 0, 40, 1, "T"); up.fill("g", 0, 23, 40, 1, "T");
  up.fill("g", 0, 1, 1, 22, "T"); up.fill("g", 39, 1, 1, 22, "T");
  for (let x = 0; x < 40; x++) up.set("o", x, 0, "y");
  // the Trent & Mersey coming in from the east
  B.canal(up, 1, 10, 38, "h", { width: 3, tow: "t", far: "t" });
  up.fill("g", 16, 14, 8, 6, "I");
  up.fill("g", 18, 14, 4, 3, "~");
  up.fill("g", 18, 17, 4, 1, "9");
  for (let x = 16; x < 24; x++) up.set("o", x, 13, "i");
  up.fill("g", 17, 18, 6, 3, "_");
  up.set("g", 20, 16, "9"); up.set("g", 21, 16, "9");
  up.set("g", 15, 19, "N");
  up.fill("g", 2, 2, 36, 7, "\"");
  up.fill("g", 2, 15, 13, 7, "\"");
  up.fill("g", 25, 15, 13, 7, "\"");
  B.trees(c, "up-fringe", 0, 0, 0, 1, 1, "T", "y", ["\""]);
  B.trees(up, "and-up", 26, 2, 2, 36, 7, "B", "b", ["\""]);
  up.fill("g", 2, 15, 4, 7, ",");
  up.fill("g", 3, 15, 1, 7, "s");
  up.set("g", 3, 21, "s");
  up.fill("g", 3, 21, 2, 1, "s");
  up.set("g", 6, 18, "N");
  up.fill("g", 18, 2, 3, 8, ":");
  up.set("g", 19, 1, "J");
  up.fill("g", 36, 10, 3, 4, "t");
  up.set("g", 12, 11, "Q"); up.set("g", 30, 12, "Q");
  up.set("g", 8, 13, "8");
  up.fill("g", 25, 18, 8, 3, ".");
  up.set("g", 28, 19, "q");

  const upWarps = [
    { x: 20, y: 16, to: "anderton_lift_lower", tx: 13, ty: 2, dir: "down", kind: "lift", cond: "lift_pass" },
    { x: 21, y: 16, to: "anderton_lift_lower", tx: 14, ty: 2, dir: "down", kind: "lift", cond: "lift_pass" },
    { x: 3, y: 22, to: "anderton", tx: 3, ty: 2, dir: "down", kind: "stairs" },
    { x: 4, y: 22, to: "anderton", tx: 3, ty: 2, dir: "down", kind: "stairs" },
    { x: 19, y: 1, to: "marbury_park", tx: 20, ty: 27, dir: "up", kind: "gate" },
    { x: 39, y: 12, to: "route_anderton_budworth", tx: 1, ty: 12, dir: "right", kind: "edge" },
    { x: 39, y: 13, to: "route_anderton_budworth", tx: 1, ty: 13, dir: "right", kind: "edge" },
    { x: 39, y: 14, to: "route_anderton_budworth", tx: 1, ty: 14, dir: "right", kind: "edge" }
  ];

  W.defineMap("anderton_lift_upper", {
    name: "Anderton Lift — Canal Level", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "water", dialogue: "town_anderton",
    legend: TOWN, layers: up.layers(),
    spawnPoint: { x: 20, y: 19 },
    landmark: { name: "The Upper Basin", x: 20, y: 15 },
    encounters: { grass: "anderton_grass", water: "anderton_water" },
    fishing: "fish_anderton",
    warps: upWarps,
    signs: [
      { x: 15, y: 19, text: ["UPPER BASIN — TRENT & MERSEY LEVEL. FIFTY FEET ABOVE THE RIVER.",
        "From here the Weaver looks like something somebody left running."] },
      { x: 6, y: 18, text: ["FOOTPATH — the long way down to the Weaver. Forty minutes, and worth it once."] }
    ],
    items: [
      { x: 34, y: 20, item: "capsule_kernel", n: 2, flag: "item_anderton_lift_upper_1" },
      { x: 3, y: 4, item: "collectible_21", n: 1, hidden: true, flag: "item_anderton_lift_upper_2" }
    ],
    npcs: [
      { id: "npc_anderton_upper_beth", x: 20, y: 20, dir: "up", sprite: "npc_signaller", behaviour: "still", trainer: "tr_anderton_1", sight: 0, script: "sw_beth_upper" },
      { id: "npc_anderton_upper_boater", x: 30, y: 14, dir: "left", sprite: "npc_boater", behaviour: "path", path: [[26, 14], [36, 14]], pathMode: "pingpong",
        say: ["Down is the frightening one. Up you're only going where the water's already been."] }
    ],
    triggers: [
      { x: 19, y: 17, w: 4, h: 1, script: "sw_lift_ride", once: "lift_ride_started", cond: "!boat_lift_silence && badge_daemon", kind: "step" }
    ]
  });

  // ==================================================== the narrowboat ride
  // The Ch.7 set-piece map. You are on a boat, in a bath, going up.
  const NB = {
    "~": "water_canal", "8": "narrowboat", "_": "floor_wood", "I": "boat_lift", "i": "boat_lift_top",
    "9": "boat_dock", "t": "towpath", "N": "sign", "L": "lamp", "[": "crate", "]": "barrel",
    "M": "machine", "T": "terminal", "H": "bench", "#": "wall_interior", " ": null
  };
  const nb = B.canvas(30, 16, "~");
  nb.fill("g", 0, 0, 30, 1, "I"); nb.fill("g", 0, 15, 30, 1, "I");
  nb.fill("g", 0, 1, 1, 14, "I"); nb.fill("g", 29, 1, 1, 14, "I");
  for (let x = 0; x < 30; x++) nb.set("o", x, 0, "i");
  nb.fill("g", 6, 5, 18, 6, "8");
  nb.fill("g", 8, 6, 14, 4, "_");
  nb.fill("g", 5, 7, 3, 1, "_");
  nb.set("g", 9, 7, "H"); nb.set("g", 22, 8, "H");
  nb.set("g", 9, 9, "["); nb.set("g", 20, 6, "]");
  nb.set("g", 15, 6, "T");
  nb.fill("g", 2, 6, 3, 4, "9");
  nb.fill("g", 25, 6, 3, 4, "9");
  nb.set("g", 3, 5, "N"); nb.set("g", 26, 11, "L");
  nb.set("g", 12, 11, "M");

  W.defineMap("anderton_narrowboat", {
    name: "The Caisson", region: "salt", outdoor: true, cutscene: true, music: "cutscene_signal", weatherZone: "salt",
    ambience: "industrial", dialogue: "town_anderton",
    legend: NB, layers: nb.layers(),
    spawnPoint: { x: 15, y: 8 },
    landmark: { name: "Ascending", x: 15, y: 8 },
    encounters: { water: null },
    warps: [
      { x: 3, y: 6, to: "anderton_lift_upper", tx: 20, ty: 19, dir: "up", kind: "stairs" },
      { x: 3, y: 7, to: "anderton_lift_upper", tx: 20, ty: 19, dir: "up", kind: "stairs" }
    ],
    signs: [{ x: 3, y: 5, text: ["A tannoy grille, painted over eleven times, at head height on the caisson wall.",
      "There is a smart plug behind it. There is a small blue light on the smart plug. It is on."] }],
    items: [],
    npcs: [
      { id: "npc_anderton_boat_cat_meadow", x: 13, y: 5, dir: "down", sprite: "cat_meadow", behaviour: "still",
        say: ["MEADOW sits in the exact middle of the roof with her back to you. She had to be carried aboard and she has not forgiven anybody."] }
    ]
  });

  // ------------------------------------------------------- the lift office
  W.defineMap("anderton_lift_office", W.builtin("house_large", {
    name: "Lift Engineer's Office", dialogue: "town_anderton", music: "town_northwich",
    warps: [{ x: 7, y: 13, to: "anderton", tx: 32, ty: 15, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "anderton", tx: 32, ty: 15, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_anderton_office_beth", x: 10, y: 4, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_beth_office" },
      { id: "npc_anderton_office_apprentice", x: 3, y: 9, dir: "right", sprite: "npc_kid", behaviour: "still",
        say: ["The balance sheet on that wall isn't money. It's tonnes.", "Left caisson, right caisson, difference. The difference has to be nothing. Nothing is the target."] }
    ],
    signs: [{ x: 14, y: 2, text: ["A whiteboard: LEFT 250.0 · RIGHT 250.0 · DIFF 0.0",
      "Underneath, in a different pen, smaller: 'crate 7 not on manifest — DO NOT SHIP UNTIL SEEN'"] }],
    items: [{ x: 1, y: 11, item: "tonic", n: 2, flag: "item_anderton_lift_office_1" }]
  }));

  // ========================================================== Marbury Park =
  const mp = B.canvas(40, 30, ".");
  mp.fill("g", 0, 0, 40, 1, "T"); mp.fill("g", 0, 29, 40, 1, "T");
  mp.fill("g", 0, 1, 1, 28, "T"); mp.fill("g", 39, 1, 1, 28, "T");
  for (let x = 0; x < 40; x++) mp.set("o", x, 0, "y");
  mp.fill("g", 19, 29, 3, 1, ":");
  mp.fill("g", 19, 20, 3, 9, ":");
  mp.fill("g", 4, 18, 32, 3, ":");
  mp.fill("g", 19, 4, 3, 16, ":");
  // the beech avenues
  for (let y = 5; y < 19; y += 2) { mp.set("g", 17, y, "B"); mp.set("o", 17, y - 1, "b"); mp.set("g", 23, y, "B"); mp.set("o", 23, y - 1, "b"); }
  for (let x = 5; x < 36; x += 3) { mp.set("g", x, 16, "B"); mp.set("o", x, 15, "b"); mp.set("g", x, 22, "B"); mp.set("o", x, 21, "b"); }
  mp.fill("g", 2, 2, 15, 13, "\"");
  mp.fill("g", 24, 2, 14, 13, "\"");
  mp.fill("g", 2, 23, 15, 5, "\"");
  mp.fill("g", 24, 23, 14, 5, "\"");
  // Budworth Mere in the north-east
  mp.fill("g", 27, 3, 10, 9, "$");
  mp.fill("g", 26, 2, 12, 1, "?"); mp.fill("g", 26, 12, 12, 1, "?");
  mp.set("g", 26, 7, "Q"); mp.set("g", 33, 12, "Q");
  // the ruined hall's footings and the Lady's avenue
  mp.fill("g", 5, 4, 9, 7, ",");
  mp.box("g", 6, 5, 7, 5, "w");
  mp.set("g", 9, 10, "i");
  mp.set("g", 9, 12, "N");
  mp.set("g", 20, 3, "N");
  B.trees(mp, "marbury", 30, 2, 2, 36, 26, "T", "y", ["\""]);
  mp.fill("g", 4, 18, 32, 3, ":");
  mp.fill("g", 19, 4, 3, 16, ":");
  mp.set("g", 5, 19, "H"); mp.set("g", 34, 19, "H");
  mp.fill("g", 10, 24, 6, 3, ".");
  mp.set("g", 12, 25, "q");

  W.defineMap("marbury_park", {
    name: "Marbury Park", region: "salt", outdoor: true, music: "route_salt", weatherZone: "salt",
    ambience: "forest", dialogue: "town_anderton",
    legend: TOWN, layers: mp.layers(),
    spawnPoint: { x: 20, y: 27 },
    landmark: { name: "The Marbury Avenues", x: 20, y: 12 },
    encounters: { grass: "marbury_park_grass", water: "marbury_park_grass" },
    fishing: "fish_anderton",
    warps: [
      { x: 20, y: 29, to: "anderton_lift_upper", tx: 19, ty: 2, dir: "down", kind: "gate" },
      { x: 21, y: 29, to: "anderton_lift_upper", tx: 19, ty: 2, dir: "down", kind: "gate" }
    ],
    signs: [
      { x: 9, y: 12, text: ["MARBURY HALL stood here until 1968, when it was demolished for being expensive.",
        "The avenues were planted for the hall. The avenues are still here. The hall is a rectangle of different grass."] },
      { x: 20, y: 3, text: ["BUDWORTH MERE. Deep, cold, and full of things people are confident about at a distance."] }
    ],
    items: [
      { x: 12, y: 26, item: "roasted_acorn", n: 4, flag: "item_marbury_park_1" },
      { x: 7, y: 7, item: "capsule_night", n: 3, hidden: true, flag: "item_marbury_park_2" },
      { x: 36, y: 26, item: "capsule_night", n: 2, hidden: true, flag: "item_marbury_park_3" }
    ],
    catGaps: [
      { x: 6, y: 8, item: "collectible_21", n: 1, flag: "catgap_marbury_park_1",
        say: "MEADOW slips between the hall's footings and comes back with a locket on a broken chain. She puts it down, sits on it, and looks at the top avenue." }
    ],
    npcs: [
      { id: "npc_marbury_sion", x: 20, y: 16, dir: "down", sprite: "npc_ranger", behaviour: "look", radius: 4, trainer: "tr_marbury_park_1", sight: 4, script: "sw_marbury_warden" },
      { id: "npc_marbury_elin", x: 30, y: 19, dir: "left", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_marbury_park_2", sight: 4 },
      { id: "npc_marbury_walker", x: 10, y: 19, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[6, 19], [16, 19]], pathMode: "pingpong",
        say: ["Best hour of the day is the last one, along the top avenue, and I would not tell you that if it were busy."] }
    ],
    triggers: [
      { x: 19, y: 6, w: 3, h: 1, script: "sw_marbury_lady", once: "marbury_lady_seen", cond: "!marbury_lady_seen && time.night", kind: "step" }
    ]
  });

  // ======================================================= Great Budworth =
  const gb = B.canvas(36, 28, ".");
  gb.fill("g", 0, 0, 36, 1, "T"); gb.fill("g", 0, 27, 36, 1, "T");
  gb.fill("g", 0, 1, 1, 26, "T"); gb.fill("g", 35, 1, 1, 26, "T");
  for (let x = 0; x < 36; x++) gb.set("o", x, 0, "y");
  gb.fill("g", 16, 0, 3, 1, "="); gb.fill("o", 16, 0, 3, 1, " ");
  gb.fill("g", 16, 1, 3, 11, "=");
  gb.fill("g", 1, 12, 34, 3, "=");
  gb.fill("g", 1, 11, 34, 1, "-"); gb.fill("g", 1, 15, 34, 1, "-");
  // St Mary and All Saints on its rise
  gb.box("g", 20, 2, 13, 9, "w");
  gb.fill("g", 21, 3, 11, 7, ",");
  B.house(gb, { x: 23, y: 3, w: 8, h: 6, rh: 2, roof: "p", wall: "c", win: "C", door: "d", doorX: 4 });
  gb.set("g", 27, 2, "p");
  B.speckle(gb, "g", "gb-graves", "g", 10, 21, 8, 11, 2, [","]);
  gb.set("g", 27, 11, "d");
  gb.set("g", 19, 8, "N");
  // the village: brick terraces and mullioned windows
  B.timberRow(gb, 3, 4, 10, { h: 5, doors: [4], chimneys: [1, 8] });
  B.house(gb, { x: 3, y: 17, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  gb.set("g", 2, 21, "N");
  B.house(gb, { x: 15, y: 17, w: 8, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 3, over: "^", chimney: 1 });
  B.house(gb, { x: 26, y: 17, w: 8, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  gb.fill("g", 2, 23, 32, 1, "-");
  gb.set("g", 8, 16, "L"); gb.set("g", 24, 16, "L");
  gb.set("g", 13, 11, "O"); gb.set("g", 6, 15, "H"); gb.set("g", 7, 15, "I");
  gb.set("g", 14, 13, "/");
  gb.fill("g", 3, 24, 30, 3, "\"");
  B.trees(gb, "gb-fringe", 14, 2, 24, 32, 3, "T", "y", ["\""]);
  gb.fill("g", 2, 2, 1, 9, "\"");

  W.defineMap("great_budworth", {
    name: "Great Budworth", region: "salt", outdoor: true, music: "route_salt", weatherZone: "salt",
    ambience: "town", dialogue: "town_great_budworth", shop: "shop_great_budworth",
    legend: TOWN, layers: gb.layers(),
    spawnPoint: { x: 17, y: 13 },
    healPoint: { x: 7, y: 22 },
    landmark: { name: "Great Budworth", x: 17, y: 13 },
    encounters: { grass: "great_budworth_grass" },
    warps: [
      { x: 7, y: 21, to: "great_budworth_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 18, y: 21, to: "great_budworth_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 29, y: 21, to: "great_budworth_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 7, y: 8, to: "great_budworth_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 27, y: 11, to: "great_budworth_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 0, y: 12, to: "route_anderton_budworth", tx: 42, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 13, to: "route_anderton_budworth", tx: 42, ty: 13, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "route_anderton_budworth", tx: 42, ty: 14, dir: "left", kind: "edge" },
      { x: 16, y: 0, to: "route_budworth_lymm", tx: 14, ty: 42, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "route_budworth_lymm", tx: 15, ty: 42, dir: "up", kind: "edge" },
      { x: 18, y: 0, to: "route_budworth_lymm", tx: 16, ty: 42, dir: "up", kind: "edge" }
    ],
    signs: [
      { x: 19, y: 8, text: ["ST MARY AND ALL SAINTS. Eight bells, forty thousand changes, one tower that has never once been on time.",
        "PARISH NOTICE: 'The Vicar will NOT ring you about gift cards. The Vicar does not know what a gift card is. Please stop sending them.'"] },
      { x: 2, y: 21, text: ["GREAT BUDWORTH CARE — and post office, and shop, and the only cashpoint for four miles."] }
    ],
    items: [
      { x: 5, y: 25, item: "blackberry", n: 4, flag: "item_great_budworth_1" },
      { x: 32, y: 25, item: "capsule_mesh", n: 3, hidden: true, flag: "item_great_budworth_2" }
    ],
    restPoints: [{ x: 7, y: 16, flag: "meadow_sat_budworth" }],
    npcs: [
      { id: "npc_great_budworth_elin", x: 25, y: 12, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_great_budworth_1", sight: 0, script: "sw_elin" },
      { id: "npc_great_budworth_huw", x: 24, y: 13, dir: "up", sprite: "npc_bandsman", behaviour: "still", trainer: "tr_great_budworth_2", sight: 0, script: "sw_ringing_master" },
      { id: "npc_great_budworth_ffoulkes", x: 27, y: 12, dir: "left", sprite: "npc_historian", behaviour: "still", script: "sw_vicar_ffoulkes" },
      { id: "npc_great_budworth_granny", x: 12, y: 14, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["He rang me on the Tuesday. His voice, his cough, his little pause before a number.",
          "He wanted three hundred pounds in vouchers for the roof fund. There is no roof fund. There is a roof, and it is fine."] },
      { id: "npc_great_budworth_kid", x: 15, y: 24, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["A round is easy. It's the changes that break people. That's what the Ringing Master says and he says it a LOT."] }
    ]
  });

  W.defineMap("great_budworth_church", W.builtin("church", {
    name: "St Mary and All Saints", dialogue: "town_great_budworth", music: "route_salt",
    warps: [{ x: 6, y: 13, to: "great_budworth", tx: 27, ty: 12, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "great_budworth", tx: 27, ty: 12, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_great_budworth_church_ringer", x: 6, y: 2, dir: "down", sprite: "npc_bandsman", behaviour: "still", script: "sw_bells" },
      { id: "npc_great_budworth_church_warden", x: 2, y: 8, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["Eight bells and the tenor weighs a ton and a quarter. When she goes, the whole tower leans a little and comes back.",
          "You get used to a building that breathes."] }
    ],
    items: [{ x: 12, y: 11, item: "panacea", n: 1, hidden: true, flag: "item_great_budworth_church_1" }]
  }));
  W.defineMap("great_budworth_care", W.builtin("care_centre", {
    name: "Great Budworth Care", dialogue: "town_great_budworth", music: "route_salt",
    warps: [{ x: 7, y: 11, to: "great_budworth", tx: 7, ty: 22, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "great_budworth", tx: 7, ty: 22, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_great_budworth_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", shop: "shop_great_budworth",
      say: ["Care centre, post office, shop and the parish notices. If it happened here, it happened on that board first."] }]
  }));
  W.defineMap("great_budworth_inn", W.builtin("pub", {
    name: "The George and Dragon", dialogue: "town_great_budworth", music: "route_salt",
    warps: [{ x: 6, y: 11, to: "great_budworth", tx: 18, ty: 22, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "great_budworth", tx: 18, ty: 22, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_great_budworth_inn_landlord", x: 2, y: 2, dir: "down", sprite: "npc_boater", behaviour: "still",
      say: ["Prettiest village in Cheshire. It says so on a plate behind the bar and nobody has ever contested it out loud."] }]
  }));
  for (let i = 1; i <= 2; i++) {
    W.defineMap("great_budworth_house_" + i, W.builtin("house_small", {
      name: "Great Budworth Cottage", dialogue: "town_great_budworth", music: "route_salt",
      warps: [{ x: 5, y: 9, to: "great_budworth", tx: i === 1 ? 29 : 7, ty: i === 1 ? 22 : 9, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "great_budworth", tx: i === 1 ? 29 : 7, ty: i === 1 ? 22 : 9, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_great_budworth_house" + i, x: 3, y: 4, dir: "down", sprite: i === 1 ? "npc_walker" : "npc_granny", behaviour: "still",
        say: i === 1
          ? ["The whole village is owned by the estate and painted the same colour by agreement.", "It's very pretty and slightly like living inside a biscuit tin."]
          : ["I had a video call from the vicar. He looked wrong round the mouth and he called me 'madam', which he has never done in his life."] }]
    }));
  }
})();
