// =============================================================
// MonsterQuest v2 — Y BERLLAN, CEREDIGION (region wales, Ch.6)
// The family orchard, three hours west of Crewe on the Cambrian line
// and about nine hundred miles from anything with a signal. Perry
// pears in rows, an elm press that has run since 1898, a wood that
// answers in Welsh, a pond, and a lane that goes down to the sea.
// Mam-gu keeps it. She is not, technically, anybody's grandmother.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const ORCH = B.orchard({});

  // ============================================== the orchard and farmyard =
  const c = B.canvas(46, 36, ".");
  c.fill("g", 0, 0, 46, 1, "B"); c.fill("g", 0, 35, 46, 1, "B");
  c.fill("g", 0, 1, 1, 34, "B"); c.fill("g", 45, 1, 1, 34, "B");
  for (let x = 0; x < 46; x++) c.set("o", x, 0, "b");
  c.fill("g", 21, 35, 3, 1, "+");
  c.fill("g", 0, 16, 1, 3, "+");
  c.fill("g", 45, 8, 1, 3, "+");

  // the lane up from the halt, and the farmyard
  c.fill("g", 21, 24, 3, 11, "+");
  c.fill("g", 8, 22, 30, 3, "+");
  c.fill("g", 12, 25, 20, 8, "=");
  c.fill("g", 13, 26, 18, 6, "_");
  // the farmhouse, the shed, the cellar hatch
  B.house(c, { x: 13, y: 26, w: 10, h: 5, rh: 2, roof: "R", wall: "X", win: "W", door: "@", doorX: 4, over: "^", chimney: 1 });
  c.set("g", 12, 30, "N");
  B.house(c, { x: 25, y: 26, w: 7, h: 4, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 33, 29, "N");
  c.set("g", 24, 29, "2");
  c.set("g", 33, 26, "4"); c.set("g", 34, 27, "4");
  c.fill("g", 33, 31, 4, 2, "6");
  c.set("g", 35, 30, "N");
  // the pear tree — a Blakeney Red, older than the shed and better company
  c.set("g", 19, 20, "0");
  c.set("o", 19, 19, "y");
  c.set("g", 18, 21, "H");
  c.set("g", 20, 21, "N");

  // the orchard rows, west and east of the yard
  B.orchardRows(c, 3, 4, 16, 15, { tree: "T", top: "y", row: ":", gap: 2 });
  B.orchardRows(c, 26, 4, 17, 15, { tree: "T", top: "y", row: ":", gap: 2 });
  c.fill("g", 20, 3, 5, 16, ".");
  c.fill("g", 22, 3, 1, 19, "+");
  c.fill("g", 2, 2, 42, 1, "w");
  c.fill("g", 2, 19, 18, 1, "w"); c.fill("g", 25, 19, 19, 1, "w");
  c.set("g", 10, 19, "J"); c.set("g", 34, 19, "J");
  c.set("g", 22, 2, "J");
  // the pond, south-west; the sheep field, south-east
  c.fill("g", 4, 26, 8, 6, "$");
  c.fill("g", 3, 25, 10, 1, "?"); c.fill("g", 3, 32, 10, 1, "?");
  c.set("g", 6, 25, "Q"); c.set("g", 11, 32, "Q");
  c.fill("g", 2, 33, 18, 2, ",");
  c.fill("g", 34, 33, 10, 2, ",");
  c.fill("g", 26, 33, 6, 2, "\"");
  c.set("g", 4, 34, "5"); c.set("g", 38, 34, "4");
  // odds and ends
  c.set("g", 24, 24, "6"); c.set("g", 16, 24, "*");
  c.set("g", 8, 21, "]"); c.set("g", 36, 21, "[");
  c.set("g", 43, 5, "1");
  c.set("g", 2, 5, "z");
  c.txt("o", 14, 25, "&&&&&&");

  W.defineMap("y_berllan", {
    name: "Y Berllan", region: "wales", outdoor: true, music: "town_berllan", weatherZone: "wales",
    ambience: "forest", dialogue: "town_y_berllan",
    legend: ORCH, layers: c.layers(),
    spawnPoint: { x: 22, y: 33 },
    healPoint: { x: 17, y: 32 },
    landmark: { name: "Y Berllan", x: 22, y: 24 },
    // Nothing is awake in the orchard until the drive is read. The Ch.6
    // script sets `orchard_open` and the wilds come back with it.
    encounters: { grass: "y_berllan_grass", water: "y_berllan_pond_water" },
    fishing: "fish_y_berllan_pond",
    encountersCond: "orchard_open",
    warps: [
      { x: 17, y: 31, to: "y_berllan_farmhouse", tx: 8, ty: 14, dir: "up", kind: "door" },
      { x: 28, y: 30, to: "y_berllan_shed", tx: 11, ty: 20, dir: "up", kind: "door" },
      { x: 22, y: 35, to: "y_berllan_halt", tx: 14, ty: 4, dir: "down", kind: "edge" },
      { x: 23, y: 35, to: "y_berllan_halt", tx: 15, ty: 4, dir: "down", kind: "edge" },
      { x: 21, y: 35, to: "y_berllan_halt", tx: 13, ty: 4, dir: "down", kind: "edge" },
      { x: 22, y: 2, to: "y_berllan_coed", tx: 20, ty: 33, dir: "up", kind: "gate" },
      { x: 0, y: 16, to: "y_berllan_pond", tx: 30, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 17, to: "y_berllan_pond", tx: 30, ty: 13, dir: "left", kind: "edge" },
      { x: 0, y: 18, to: "y_berllan_pond", tx: 30, ty: 14, dir: "left", kind: "edge" },
      { x: 45, y: 8, to: "y_berllan_aberaeron_lane", tx: 1, ty: 12, dir: "right", kind: "edge", cond: "aberaeron_open" },
      { x: 45, y: 9, to: "y_berllan_aberaeron_lane", tx: 1, ty: 13, dir: "right", kind: "edge", cond: "aberaeron_open" },
      { x: 45, y: 10, to: "y_berllan_aberaeron_lane", tx: 1, ty: 14, dir: "right", kind: "edge", cond: "aberaeron_open" }
    ],
    signs: [
      { x: 20, y: 21, text: ["A pear tree, on its own, in the middle of a mown circle, with a bench under it.",
        "The label wired to the trunk is enamel and older than the bench: BLAKENEY RED.",
        "Somebody has scratched a word into the bark, badly, at the height of a twelve-year-old: PIPPIN."] },
      { x: 12, y: 30, text: ["A slate over the door: 1871. Under it, painted much later and much worse: Y BERLLAN.",
        "The bootscraper by the step has been worn into a smile."] },
      { x: 33, y: 29, text: ["THE PRESS SHED.", "A cider press with an elm beam, cut in 1898 from a tree that grew where the pond is now.",
        "Mam-gu will tell you the beam is the important part. Mam-gu is right about most things and completely right about this."] },
      { x: 35, y: 30, text: ["A cellar hatch, propped with a stick, breathing cold air that smells of yeast and slate."] }
    ],
    items: [
      { x: 4, y: 6, item: "perry_pear", n: 4, flag: "item_y_berllan_1" },
      { x: 40, y: 6, item: "apple", n: 4, flag: "item_y_berllan_2" },
      { x: 3, y: 34, item: "elm_sap", n: 2, hidden: true, flag: "item_y_berllan_3" },
      { x: 43, y: 33, item: "damson", n: 3, hidden: true, flag: "item_y_berllan_4" },
      { x: 43, y: 6, item: "capsule_friend", n: 2, hidden: true, flag: "item_y_berllan_5" }
    ],
    catGaps: [
      { x: 10, y: 19, item: "perry_pear", n: 3, flag: "catgap_y_berllan_1",
        say: "MEADOW goes under the orchard gate without breaking stride and comes back with a pear that is far too big for her and entirely her own business." }
    ],
    restPoints: [{ x: 20, y: 20, flag: "bigboy_sat_berllan" }],
    npcs: [
      { id: "npc_y_berllan_mamgu", x: 17, y: 32, dir: "down", sprite: "mamgu", behaviour: "still", script: "sw_mamgu" },
      { id: "npc_y_berllan_dai", x: 27, y: 31, dir: "down", sprite: "dai", behaviour: "still", trainer: "tr_y_berllan_1", sight: 0, script: "sw_dai" },
      { id: "cat_meadow_orchard", x: 12, y: 18, dir: "down", sprite: "cat_meadow", behaviour: "wander", radius: 4, cond: "orchard_open",
        say: ["MEADOW is hunting in the long grass at the end of the rows and has not looked up in forty minutes."] },
      { id: "cat_bigboy_orchard", x: 20, y: 20, dir: "down", sprite: "cat_bigboy", behaviour: "still", cond: "orchard_open",
        say: ["BIGBOY has found the one flagstone the sun has been on all afternoon and has no further plans."] }
    ],
    triggers: [
      { x: 21, y: 30, w: 3, h: 1, script: "sw_berllan_arrival", once: "berllan_arrival", cond: "!berllan_arrival", kind: "step" }
    ]
  });

  // ======================================================= the Cambrian halt
  const h = B.canvas(30, 14, ",");
  h.fill("g", 0, 0, 30, 1, "B"); h.fill("g", 0, 13, 30, 1, "B");
  h.fill("g", 0, 1, 1, 12, "B"); h.fill("g", 29, 1, 1, 12, "B");
  for (let x = 0; x < 30; x++) h.set("o", x, 0, "b");
  h.fill("g", 1, 8, 28, 2, "U");
  h.fill("g", 1, 7, 28, 1, "e");
  h.fill("g", 1, 5, 28, 2, "E");
  h.fill("g", 1, 2, 28, 3, ",");
  h.fill("g", 13, 1, 3, 1, "+");
  h.fill("g", 13, 2, 3, 3, "+");
  h.fill("g", 1, 10, 28, 3, "\"");
  B.house(h, { x: 3, y: 2, w: 5, h: 3, rh: 1, roof: "R", wall: "X", win: "W", door: "D", doorX: 2, over: "^" });
  h.set("g", 9, 4, "N");
  h.set("g", 20, 4, "H"); h.set("g", 24, 4, "L");
  h.set("g", 26, 3, "P");
  h.set("g", 6, 11, "]");

  W.defineMap("y_berllan_halt", {
    name: "Y Berllan Halt", region: "wales", outdoor: true, music: "route_wales", weatherZone: "wales",
    ambience: "forest", dialogue: "town_y_berllan", station: { name: "Y Berllan Halt" },
    legend: ORCH, layers: h.layers(),
    spawnPoint: { x: 14, y: 4 },
    landmark: { name: "Y Berllan Halt", x: 14, y: 6 },
    encounters: { grass: null },
    warps: [
      { x: 13, y: 1, to: "y_berllan", tx: 21, ty: 34, dir: "up", kind: "edge" },
      { x: 14, y: 1, to: "y_berllan", tx: 22, ty: 34, dir: "up", kind: "edge" },
      { x: 15, y: 1, to: "y_berllan", tx: 23, ty: 34, dir: "up", kind: "edge" }
    ],
    signs: [
      { x: 9, y: 4, text: ["Y BERLLAN HALT.", "REQUEST STOP. To alight, inform the guard. To board, put your arm out and mean it.",
        "Four trains a day. Three on Sundays. None at all if the sheep are on the line, which they are."] },
      { x: 26, y: 3, text: ["A wooden board with the mileage burned into it, and a shelter with three sides and no roof, which locally counts as a station."] }
    ],
    items: [{ x: 4, y: 11, item: "salve", n: 3, hidden: true, flag: "item_y_berllan_halt_1" }],
    npcs: [
      { id: "npc_y_berllan_halt_guard", x: 20, y: 3, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_halt_guard" }
    ]
  });

  // ======================================================= the farmhouse ===
  const FH = {
    "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood", "r": "rug",
    "D": "mat_welcome", "d": "door_wood", "b": "bed", "B": "bed_head", "t": "table", "c": "chair",
    "s": "shelf", "k": "bookcase", "i": "painting", "f": "fireplace", "p": "plant_pot",
    "g": "fridge", "o": "stove", "n": "sink", "z": "cat_bed", "v": "cat_bowl", "a": "stairs",
    "l": "lamp", "N": "sign", "]": "barrel", "L": "clock_wall", " ": null
  };
  const fh = B.canvas(18, 16, "_");
  fh.box("g", 0, 0, 18, 16, "#");
  fh.fill("g", 1, 0, 16, 1, "^");
  fh.fill("g", 1, 1, 16, 1, "W");
  fh.set("g", 4, 1, "f"); fh.set("g", 12, 1, "L");
  fh.fill("g", 7, 4, 4, 3, "t");
  fh.set("g", 6, 5, "c"); fh.set("g", 11, 5, "c"); fh.set("g", 8, 3, "c"); fh.set("g", 9, 7, "c");
  fh.fill("g", 1, 3, 4, 2, "k");
  fh.fill("g", 13, 3, 4, 1, "s");
  fh.fill("g", 1, 9, 4, 1, "o"); fh.set("g", 1, 10, "n"); fh.set("g", 2, 10, "g");
  fh.fill("g", 12, 9, 5, 3, "r");
  fh.set("g", 14, 10, "z"); fh.set("g", 15, 10, "v");
  fh.set("g", 16, 13, "a");
  fh.fill("g", 6, 12, 6, 2, "r");
  fh.set("g", 8, 15, "d"); fh.set("g", 9, 15, "d");
  fh.set("g", 8, 14, "D"); fh.set("g", 9, 14, "D");
  fh.set("g", 3, 13, "]"); fh.set("g", 1, 6, "p"); fh.set("g", 16, 6, "i");
  fh.set("g", 5, 8, "N");

  W.defineMap("y_berllan_farmhouse", {
    name: "Mam-gu's House", region: "interior", outdoor: false, music: "cutscene_orchard", weatherZone: null,
    ambience: "town", dialogue: "town_y_berllan",
    legend: FH, layers: fh.layers(),
    spawnPoint: { x: 8, y: 14 },
    healPoint: { x: 8, y: 12 },
    landmark: { name: "Mam-gu's House", x: 8, y: 8 },
    encounters: { grass: null },
    warps: [
      { x: 8, y: 15, to: "y_berllan", tx: 17, ty: 32, dir: "down", kind: "door" },
      { x: 9, y: 15, to: "y_berllan", tx: 17, ty: 32, dir: "down", kind: "door" }
    ],
    signs: [{ x: 5, y: 8, text: ["A dresser with forty years of photographs propped on it, none of them framed.",
      "Your mother is in six. You are in two, both of them terrible.",
      "There is one of a very small black kitten in a shoebox, and one of an enormous cat asleep on a vet's table with a drip in his leg."] }],
    items: [{ x: 16, y: 4, item: "perry_flask", n: 2, flag: "item_y_berllan_farmhouse_1" }],
    npcs: [
      { id: "npc_y_berllan_house_mamgu", x: 8, y: 8, dir: "down", sprite: "mamgu", behaviour: "still", script: "sw_mamgu_house" }
    ],
    triggers: [
      { x: 7, y: 12, w: 4, h: 1, script: "sw_vet_story", once: "vet_story_scene", cond: "!vet_story_told && pippin_found", kind: "step" }
    ]
  });

  // ====================================================== the elm-press shed
  const SH = {
    "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood",
    "g": "floor_stone", "d": "door_wood", "D": "mat_welcome", "2": "apple_press", "3": "brew_vat",
    "]": "barrel", "[": "crate", "}": "sack", "s": "shelf", "k": "bookcase", "t": "table",
    "c": "chair", "l": "lamp", "N": "sign", "T": "terminal", "M": "machine", "a": "stairs",
    "p": "plant_pot", "h": "hay_bale", "x": "sink", " ": null
  };
  const sh = B.canvas(22, 22, "g");
  sh.box("g", 0, 0, 22, 22, "#");
  sh.fill("g", 1, 0, 20, 1, "^");
  sh.fill("g", 1, 1, 20, 1, "W");
  // the press itself, under the elm beam
  sh.fill("g", 8, 3, 6, 5, "2");
  sh.fill("g", 7, 3, 1, 5, "M"); sh.fill("g", 14, 3, 1, 5, "M");
  sh.set("g", 11, 9, "N");
  // barrels, sacks, the fermenting corner
  sh.fill("g", 2, 4, 3, 5, "]");
  sh.fill("g", 17, 4, 3, 5, "3");
  sh.fill("g", 2, 12, 4, 2, "}");
  sh.fill("g", 16, 12, 4, 2, "[");
  sh.set("g", 3, 16, "t"); sh.set("g", 3, 17, "c");
  sh.set("g", 18, 16, "s"); sh.set("g", 18, 17, "k");
  // the loose board and what is under it
  sh.fill("g", 8, 15, 6, 3, "_");
  sh.set("g", 10, 16, "T");
  sh.set("g", 13, 15, "N");
  // the cellar steps
  sh.set("g", 20, 19, "a");
  sh.set("g", 19, 19, "N");
  sh.set("g", 10, 21, "d"); sh.set("g", 11, 21, "d");
  sh.set("g", 10, 20, "D"); sh.set("g", 11, 20, "D");
  sh.set("g", 1, 10, "l"); sh.set("g", 20, 10, "l");
  sh.set("g", 6, 12, "h"); sh.set("g", 15, 19, "x");

  W.defineMap("y_berllan_shed", {
    name: "The Elm-Press Shed", region: "interior", outdoor: false, music: "cutscene_orchard", weatherZone: null,
    ambience: "town", dialogue: "town_y_berllan",
    legend: SH, layers: sh.layers(),
    spawnPoint: { x: 11, y: 20 },
    landmark: { name: "The Elm Press", x: 11, y: 6 },
    encounters: { grass: null },
    warps: [
      { x: 10, y: 21, to: "y_berllan", tx: 28, ty: 31, dir: "down", kind: "door" },
      { x: 11, y: 21, to: "y_berllan", tx: 28, ty: 31, dir: "down", kind: "door" },
      { x: 20, y: 19, to: "y_berllan_cellar", tx: 12, ty: 18, dir: "down", kind: "stairs", cond: "brewing_open" }
    ],
    signs: [
      { x: 11, y: 9, text: ["THE ELM PRESS.", "Beam: elm, felled 1898, from a tree that grew where the pond is now. Screw: iron, 1898. Everything else: replaced twice.",
        "There is a crack in the bed plate that has been there since 1974 and means the press can never take a full pressing."] },
      { x: 13, y: 15, text: ["A board in the floor that has been lifted and put back many times, badly.",
        "Under it: a jiffy bag, a bread tag with a date on it in your own handwriting, and a hard drive with a label you also wrote.",
        "The label says PIPPIN — DECOMM — DO NOT WIPE (ASK JIM)."] },
      { x: 19, y: 19, text: ["CELLAR. Mind your head, mind the third step, mind Mam-gu's opinion of anyone who leaves the door open."] }
    ],
    items: [
      { x: 6, y: 10, item: "perry_pear", n: 3, flag: "item_y_berllan_shed_1" },
      { x: 20, y: 3, item: "apple", n: 3, flag: "item_y_berllan_shed_2" },
      { x: 2, y: 19, item: "rod_elm", n: 1, hidden: true, flag: "item_y_berllan_shed_3" }
    ],
    npcs: [
      { id: "npc_y_berllan_shed_dai", x: 6, y: 19, dir: "up", sprite: "dai", behaviour: "still", script: "sw_dai_press" },
      { id: "npc_y_berllan_shed_press", x: 11, y: 10, dir: "up", sprite: "npc_farmer", behaviour: "still", script: "sw_press", cond: "brewing_open" }
    ],
    triggers: [
      { x: 9, y: 14, w: 4, h: 1, script: "sw_the_drive", once: "the_drive_scene", cond: "!pippin_found && orchard_open", kind: "step" }
    ]
  });

  // ======================================================= the brewing cellar
  const CE = {
    "#": "wall_stone_grey", "^": "wall_interior_top", "_": "floor_stone", "3": "brew_vat",
    "]": "barrel", "[": "crate", "}": "sack", "s": "shelf", "t": "table", "c": "chair",
    "l": "lamp", "N": "sign", "a": "stairs", "x": "sink", "M": "machine", "p": "plant_pot",
    "T": "terminal", "D": "mat", " ": null
  };
  const ce = B.canvas(26, 20, "_");
  ce.box("g", 0, 0, 26, 20, "#");
  ce.fill("g", 1, 0, 24, 1, "^");
  ce.fill("g", 3, 3, 4, 3, "3"); ce.fill("g", 10, 3, 4, 3, "3"); ce.fill("g", 17, 3, 4, 3, "3");
  ce.fill("g", 3, 9, 4, 2, "]"); ce.fill("g", 17, 9, 4, 2, "]");
  ce.fill("g", 10, 9, 4, 2, "3");
  ce.set("g", 12, 12, "N");
  ce.set("g", 3, 14, "t"); ce.set("g", 3, 15, "c");
  ce.set("g", 21, 14, "s"); ce.set("g", 21, 15, "}");
  ce.set("g", 6, 16, "x");
  ce.set("g", 12, 19, "a"); ce.set("g", 13, 19, "a");
  ce.set("g", 12, 18, "D"); ce.set("g", 13, 18, "D");
  ce.set("g", 1, 8, "l"); ce.set("g", 24, 8, "l");
  ce.set("g", 24, 16, "T");

  W.defineMap("y_berllan_cellar", {
    name: "The Brewing Cellar", region: "interior", outdoor: false, music: "cutscene_orchard", weatherZone: null,
    ambience: "cave", dialogue: "town_y_berllan",
    legend: CE, layers: ce.layers(),
    spawnPoint: { x: 12, y: 18 },
    landmark: { name: "The Cellar", x: 12, y: 8 },
    encounters: { grass: null },
    warps: [
      { x: 12, y: 19, to: "y_berllan_shed", tx: 20, ty: 18, dir: "up", kind: "stairs" },
      { x: 13, y: 19, to: "y_berllan_shed", tx: 20, ty: 18, dir: "up", kind: "stairs" }
    ],
    signs: [{ x: 12, y: 12, text: ["Five barrels, three of them working, one of them older than the shed above it.",
      "A chalk slate on the wall lists what is in each and when it will be ready. The dates are in Welsh and the handwriting has not changed in fifty years.",
      "The last line reads: RHOWCH AMSER IDDO. Give it time."] }],
    items: [
      { x: 24, y: 3, item: "brew_perry", n: 1, hidden: true, flag: "item_y_berllan_cellar_1" },
      { x: 2, y: 12, item: "barley", n: 3, flag: "item_y_berllan_cellar_2" }
    ],
    npcs: [
      { id: "npc_y_berllan_cellar_brew", x: 12, y: 8, dir: "down", sprite: "npc_farmer", behaviour: "still", script: "sw_cellar", cond: "brewing_open" }
    ]
  });

  // ============================================================ the pond ===
  const p = B.canvas(32, 26, ".");
  p.fill("g", 0, 0, 32, 1, "B"); p.fill("g", 0, 25, 32, 1, "B");
  p.fill("g", 0, 1, 1, 24, "B"); p.fill("g", 31, 1, 1, 24, "B");
  for (let x = 0; x < 32; x++) p.set("o", x, 0, "b");
  p.fill("g", 31, 12, 1, 3, "+");
  p.fill("g", 6, 6, 20, 13, "$");
  p.fill("g", 5, 5, 22, 1, "?"); p.fill("g", 5, 19, 22, 1, "?");
  p.fill("g", 5, 6, 1, 13, "?"); p.fill("g", 26, 6, 1, 13, "?");
  p.fill("g", 2, 12, 3, 3, "+"); p.fill("g", 27, 12, 4, 3, "+");
  p.set("g", 5, 12, "Q"); p.set("g", 26, 14, "Q"); p.set("g", 15, 5, "Q");
  p.fill("g", 12, 19, 8, 2, "_");
  p.fill("g", 2, 2, 28, 3, "\"");
  p.fill("g", 2, 21, 28, 3, "\"");
  p.set("g", 15, 21, "H"); p.set("g", 17, 21, "N");
  B.trees(p, "pond", 22, 2, 2, 28, 22, "(", ")", ["\""]);
  p.set("g", 4, 22, "]"); p.set("g", 28, 3, "1");
  p.set("g", 9, 4, "6");

  W.defineMap("y_berllan_pond", {
    name: "Y Berllan Pond", region: "wales", outdoor: true, music: "town_berllan", weatherZone: "wales",
    ambience: "water", dialogue: "town_y_berllan",
    legend: ORCH, layers: p.layers(),
    spawnPoint: { x: 29, y: 13 },
    landmark: { name: "The Pond", x: 16, y: 12 },
    encounters: { water: "y_berllan_pond_water", grass: "y_berllan_grass" },
    fishing: "fish_y_berllan_pond",
    warps: [
      { x: 31, y: 12, to: "y_berllan", tx: 1, ty: 16, dir: "right", kind: "edge" },
      { x: 31, y: 13, to: "y_berllan", tx: 1, ty: 17, dir: "right", kind: "edge" },
      { x: 31, y: 14, to: "y_berllan", tx: 1, ty: 18, dir: "right", kind: "edge" }
    ],
    signs: [{ x: 17, y: 21, text: ["The pond is where the elm stood. They felled it for the press beam in 1898 and the hole filled itself in about a fortnight.",
      "There is a brown trout in here that Mam-gu calls by name and will not tell you the name of unless you ask in Welsh."] }],
    items: [
      { x: 3, y: 22, item: "roe", n: 3, flag: "item_y_berllan_pond_1" },
      { x: 29, y: 4, item: "capsule_friend", n: 2, hidden: true, flag: "item_y_berllan_pond_2" }
    ],
    npcs: [
      { id: "npc_y_berllan_pond_riddle", x: 15, y: 20, dir: "up", sprite: "npc_fisher", behaviour: "still", script: "sw_pond_riddle" }
    ]
  });

  // ===================================================== Coed y Berllan ====
  const co = B.canvas(40, 34, "|");
  co.fill("g", 0, 0, 40, 1, "B"); co.fill("g", 0, 33, 40, 1, "B");
  co.fill("g", 0, 1, 1, 32, "B"); co.fill("g", 39, 1, 1, 32, "B");
  for (let x = 0; x < 40; x++) co.set("o", x, 0, "b");
  co.fill("g", 19, 33, 3, 1, "+");
  co.fill("g", 19, 22, 3, 11, "+");
  co.fill("g", 6, 20, 28, 2, "+");
  co.fill("g", 6, 8, 2, 14, "+");
  co.fill("g", 32, 8, 2, 14, "+");
  co.fill("g", 6, 8, 28, 2, "+");
  // the clearing and the old oak
  co.fill("g", 15, 12, 11, 7, ",");
  co.set("g", 20, 15, "B"); co.set("o", 20, 14, "b");
  co.set("g", 20, 17, "N");
  co.set("g", 17, 14, "]"); co.set("g", 24, 17, "[");
  B.trees(co, "coed-a", 60, 2, 2, 36, 30, "B", "b", ["|"]);
  B.trees(co, "coed-b", 30, 2, 2, 36, 30, "(", ")", ["|"]);
  co.fill("g", 3, 24, 12, 6, ",");
  co.fill("g", 26, 24, 11, 6, ",");
  co.set("g", 8, 27, "}"); co.set("g", 30, 26, "}");
  co.set("g", 5, 4, "1"); co.set("g", 35, 30, "z");
  co.fill("g", 6, 20, 28, 2, "+");
  co.fill("g", 19, 10, 3, 12, "+");
  co.fill("g", 15, 12, 11, 7, ",");
  co.set("g", 20, 15, "B"); co.set("o", 20, 14, "b");
  co.set("g", 20, 17, "N");
  co.set("g", 17, 14, "]"); co.set("g", 24, 17, "[");
  co.set("g", 21, 6, "N");

  W.defineMap("y_berllan_coed", {
    name: "Coed y Berllan", region: "wales", outdoor: true, music: "route_wales", weatherZone: "wales",
    ambience: "forest", dialogue: "town_y_berllan",
    legend: ORCH, layers: co.layers(),
    spawnPoint: { x: 20, y: 31 },
    landmark: { name: "Coed y Berllan", x: 20, y: 15 },
    encounters: { grass: "y_berllan_coed_grass" },
    warps: [
      { x: 19, y: 33, to: "y_berllan", tx: 21, ty: 3, dir: "down", kind: "gate" },
      { x: 20, y: 33, to: "y_berllan", tx: 22, ty: 3, dir: "down", kind: "gate" },
      { x: 21, y: 33, to: "y_berllan", tx: 23, ty: 3, dir: "down", kind: "gate" }
    ],
    signs: [
      { x: 20, y: 17, text: ["Yr hen dderwen. The old oak.",
        "It is not the biggest tree in the wood and it is very obviously the one the wood is about."] },
      { x: 21, y: 6, text: ["A slate marker, lettered by hand: COED Y BERLLAN.",
        "Underneath, in the same hand and much fresher: 'gofynnwch yn Gymraeg' — ask in Welsh."] }
    ],
    items: [
      { x: 8, y: 28, item: "roasted_acorn", n: 4, flag: "item_y_berllan_coed_1" },
      { x: 30, y: 27, item: "elm_sap_vial", n: 1, hidden: true, flag: "item_y_berllan_coed_2" },
      { x: 4, y: 5, item: "capsule_friend", n: 2, hidden: true, flag: "item_y_berllan_coed_3" }
    ],
    npcs: [
      { id: "npc_y_berllan_coed_hywel", x: 20, y: 21, dir: "up", sprite: "npc_ranger", behaviour: "look", radius: 4, trainer: "tr_y_berllan_coed_1", sight: 4, script: "sw_hywel" }
    ],
    triggers: [
      { x: 19, y: 16, w: 3, h: 1, script: "sw_coed_guardian", once: "coed_guardian", cond: "!coed_guardian && welsh_word_learned", kind: "step" }
    ],
    restPoints: [{ x: 21, y: 15, flag: "bigboy_sat_coed" }]
  });

  // ================================================= the lane to the sea ===
  const ln = B.canvas(44, 26, ".");
  ln.fill("g", 0, 0, 44, 1, "B"); ln.fill("g", 0, 25, 44, 1, "B");
  ln.fill("g", 0, 1, 1, 24, "B"); ln.fill("g", 43, 1, 1, 24, "B");
  for (let x = 0; x < 44; x++) ln.set("o", x, 0, "b");
  ln.fill("g", 0, 12, 1, 3, "+");
  ln.fill("g", 43, 12, 1, 3, "+");
  ln.fill("g", 1, 12, 42, 3, "+");
  ln.fill("g", 1, 11, 42, 1, "w"); ln.fill("g", 1, 15, 42, 1, "w");
  ln.set("g", 12, 11, "J"); ln.set("g", 30, 15, "J");
  ln.fill("g", 2, 2, 40, 9, "\"");
  ln.fill("g", 2, 16, 40, 8, "\"");
  ln.fill("g", 8, 4, 10, 5, ".");
  ln.fill("g", 28, 17, 12, 5, ".");
  ln.set("g", 12, 6, "5"); ln.set("g", 34, 19, "4");
  B.trees(ln, "lane", 26, 2, 2, 40, 22, "T", "y", ["\""]);
  ln.set("g", 22, 10, "N");
  ln.set("g", 12, 10, "\""); ln.set("g", 12, 9, "\"");
  ln.fill("g", 20, 16, 3, 6, "+");
  ln.fill("g", 18, 21, 8, 3, ",");
  ln.set("g", 21, 22, "H");
  ln.set("g", 19, 22, "N");
  ln.set("g", 40, 4, "1");

  W.defineMap("y_berllan_aberaeron_lane", {
    name: "The Lane to the Sea", region: "wales", outdoor: true, music: "route_wales", weatherZone: "wales",
    ambience: "forest", dialogue: "town_y_berllan",
    legend: ORCH, layers: ln.layers(),
    spawnPoint: { x: 2, y: 13 },
    landmark: { name: "The Lane to the Sea", x: 22, y: 13 },
    encounters: { grass: "y_berllan_aberaeron_lane_grass" },
    warps: [
      { x: 0, y: 12, to: "y_berllan", tx: 44, ty: 8, dir: "left", kind: "edge" },
      { x: 0, y: 13, to: "y_berllan", tx: 44, ty: 9, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "y_berllan", tx: 44, ty: 10, dir: "left", kind: "edge" },
      { x: 43, y: 12, to: "aberaeron", tx: 1, ty: 12, dir: "right", kind: "edge" },
      { x: 43, y: 13, to: "aberaeron", tx: 1, ty: 13, dir: "right", kind: "edge" },
      { x: 43, y: 14, to: "aberaeron", tx: 1, ty: 14, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 22, y: 10, text: ["ABERAERON 2. A finger-post with the paint gone off the finger.",
        "From about here you can hear it. Not waves — the particular flat hush a lot of water makes when it is in no hurry."] },
      { x: 19, y: 22, text: ["A bench facing nothing in particular, put here by a family in 1994 for somebody who liked this exact view."] }
    ],
    items: [
      { x: 10, y: 6, item: "sloe", n: 4, flag: "item_y_berllan_aberaeron_lane_1" },
      { x: 38, y: 20, item: "blackberry", n: 4, hidden: true, flag: "item_y_berllan_aberaeron_lane_2" }
    ],
    restPoints: [{ x: 22, y: 22, flag: "bigboy_sat_lane" }],
    npcs: [
      { id: "npc_y_berllan_lane_walker", x: 26, y: 13, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[16, 13], [36, 13]], pathMode: "pingpong",
        say: ["Two miles down, two miles back, every day since I retired.", "Prynhawn da. Good afternoon. Either does."] }
    ]
  });

  // ========================================================== Aberaeron ====
  const ab = B.canvas(40, 28, ".");
  ab.fill("g", 0, 0, 40, 1, "B"); ab.fill("g", 0, 1, 1, 26, "B");
  for (let x = 0; x < 40; x++) ab.set("o", x, 0, "b");
  ab.fill("g", 0, 12, 1, 3, "+");
  ab.fill("g", 1, 12, 16, 3, "r");
  ab.fill("g", 1, 11, 16, 1, "k"); ab.fill("g", 1, 15, 16, 1, "k");
  // the harbour: quays, the basin, the sea beyond
  ab.fill("g", 17, 8, 14, 12, "~");
  ab.fill("g", 16, 7, 16, 1, "Z"); ab.fill("g", 16, 20, 16, 1, "Z");
  ab.fill("g", 16, 8, 1, 12, "Z"); ab.fill("g", 31, 8, 1, 12, "Z");
  ab.fill("g", 32, 2, 8, 24, "t");
  ab.fill("g", 32, 8, 1, 12, "~");
  ab.fill("g", 2, 22, 30, 4, "s");
  ab.fill("g", 32, 22, 8, 4, "t");
  ab.set("g", 24, 7, "Q"); ab.set("g", 19, 20, "Q");
  // the coloured terraces
  B.house(ab, { x: 2, y: 4, w: 6, h: 5, rh: 2, roof: "R", wall: "X", win: "W", door: "@", doorX: 2, over: "^", chimney: 1 });
  B.house(ab, { x: 9, y: 4, w: 6, h: 5, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 2, over: "^", chimney: 1 });
  B.house(ab, { x: 2, y: 17, w: 6, h: 4, rh: 2, roof: "R", wall: "V", win: "W", door: "D", doorX: 2, over: "^" });
  B.house(ab, { x: 9, y: 17, w: 6, h: 4, rh: 2, roof: "R", wall: "X", win: "W", door: "S", doorX: 2, over: "^" });
  ab.fill("g", 1, 9, 15, 1, "-"); ab.fill("g", 1, 21, 15, 1, "-");
  ab.set("g", 16, 12, "L"); ab.set("g", 8, 10, "L");
  ab.set("g", 5, 16, "N"); ab.set("g", 20, 21, "N");
  ab.set("g", 26, 21, "H"); ab.set("g", 12, 22, "H");
  ab.set("g", 22, 6, "8"); ab.set("g", 27, 6, "]");
  ab.set("g", 14, 24, "q");
  ab.txt("o", 2, 3, "&&&&&&&&&&&&&");

  W.defineMap("aberaeron", {
    name: "Aberaeron", region: "wales", outdoor: true, music: "town_berllan", weatherZone: "wales",
    ambience: "water", dialogue: "town_y_berllan", shop: "shop_aberaeron",
    legend: ORCH, layers: ab.layers(),
    spawnPoint: { x: 2, y: 13 },
    healPoint: { x: 11, y: 21 },
    landmark: { name: "Aberaeron", x: 20, y: 14 },
    encounters: { water: "aberaeron_water", grass: null },
    fishing: "fish_aberaeron",
    warps: [
      { x: 0, y: 12, to: "y_berllan_aberaeron_lane", tx: 42, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 13, to: "y_berllan_aberaeron_lane", tx: 42, ty: 13, dir: "left", kind: "edge" },
      { x: 0, y: 14, to: "y_berllan_aberaeron_lane", tx: 42, ty: 14, dir: "left", kind: "edge" },
      { x: 11, y: 20, to: "aberaeron_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 11, y: 8, to: "aberaeron_shop", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 4, y: 8, to: "aberaeron_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 4, y: 20, to: "aberaeron_house_2", tx: 5, ty: 8, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 5, y: 16, text: ["ABERAERON. A Georgian harbour town built to a plan in 1805 and painted, since, by everyone who owns any of it.",
        "Fourteen colours of house and one colour of sea."] },
      { x: 20, y: 21, text: ["THE HARBOUR.", "Mackerel, honey ice cream, and a wind that comes in off the bay and goes straight through a coat with the confidence of something that has done it before."] }
    ],
    items: [
      { x: 30, y: 24, item: "roe", n: 3, flag: "item_aberaeron_1" },
      { x: 29, y: 3, item: "capsule_brine", n: 3, hidden: true, flag: "item_aberaeron_2" },
      { x: 6, y: 24, item: "honey", n: 3, hidden: true, flag: "item_aberaeron_3" }
    ],
    restPoints: [{ x: 26, y: 22, flag: "bigboy_sat_aberaeron" }],
    npcs: [
      { id: "npc_aberaeron_lowri", x: 24, y: 21, dir: "up", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_aberaeron_1", sight: 4, script: "sw_aberaeron_lowri" },
      { id: "npc_aberaeron_icecream", x: 14, y: 22, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_aberaeron",
        say: ["Honey ice cream. Local honey, local argument about whose honey.", "Croeso. That's welcome. You'll hear it a lot and it is always meant."] },
      { id: "npc_aberaeron_walker", x: 20, y: 22, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[18, 22], [30, 22]], pathMode: "pingpong",
        say: ["No signal down here. None. The whole bay is a hole in the map and everybody who lives here knows it and nobody minds."] }
    ],
    triggers: [
      { x: 18, y: 21, w: 4, h: 1, script: "sw_aberaeron_sea", once: "aberaeron_sea", cond: "!aberaeron_sea", kind: "step" }
    ]
  });

  W.defineMap("aberaeron_care", W.builtin("care_centre", {
    name: "Aberaeron Care", region: "interior", dialogue: "town_y_berllan", music: "town_berllan",
    warps: [{ x: 7, y: 11, to: "aberaeron", tx: 11, ty: 21, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "aberaeron", tx: 11, ty: 21, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_aberaeron_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still",
      say: ["Croeso. Everything works down here on paper because nothing works down here on a network.",
        "It is slower and it has never once been down."] }]
  }));
  W.defineMap("aberaeron_shop", W.builtin("shop", {
    name: "Aberaeron Stores", region: "interior", dialogue: "town_y_berllan", music: "town_berllan", shop: "shop_aberaeron",
    warps: [{ x: 6, y: 9, to: "aberaeron", tx: 11, ty: 9, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "aberaeron", tx: 11, ty: 9, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_aberaeron_shop_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_aberaeron",
      say: ["Bait, rope, oats, and postcards of the harbour taken in better weather than we have ever had."] }]
  }));
  for (let i = 1; i <= 2; i++) {
    W.defineMap("aberaeron_house_" + i, W.builtin("house_small", {
      name: "Harbour Cottage", region: "interior", dialogue: "town_y_berllan", music: "town_berllan",
      warps: [{ x: 5, y: 9, to: "aberaeron", tx: 4, ty: i === 1 ? 9 : 21, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "aberaeron", tx: 4, ty: i === 1 ? 9 : 21, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_aberaeron_house" + i, x: 3, y: 4, dir: "down", sprite: i === 1 ? "npc_granny" : "npc_fisher", behaviour: "still",
        say: i === 1
          ? ["Nesta's boy, is it? You're not, but she says it, so you are.", "She talks about you the way people talk about weather they liked."]
          : ["Mackerel come in in August in numbers that make you feel personally responsible for not eating them all."] }]
    }));
  }
})();
