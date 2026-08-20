// =============================================================
// MonsterQuest v2 — JODRELL BANK OBSERVATORY (region dane)
// Ch.4: the long approach, the arboretum, and a woman in hi-vis on the
// gate who knows your name before you give it. Ch.11: the same site with
// the doors open — the control room, the tower gantries, and the bowl of
// the Lovell Telescope, which is where it ends.
// The maps are ours; the Ch.11 script is region-nw's. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const JOD = M.moor({ "V": "dish_base", "Z": "dish", "4": "radio_mast", "6": "roof_metal", "0": "wall_glass" });
  const DJ = { region: "dane", dialogue: "town_jodrell_bank", music: "dungeon_stack", owner: "mid" };
  const INT = M.interior();

  // ------------------------------------------------------- the grounds ----
  const c = M.canvas(48, 42, ";");
  c.fill("g", 0, 0, 48, 1, "T"); c.fill("g", 0, 41, 48, 1, "T");
  c.fill("g", 0, 1, 1, 40, "T"); c.fill("g", 47, 1, 1, 40, "T");
  c.fill("g", 20, 41, 3, 1, ":");
  for (let x = 0; x < 48; x++) c.set("o", x, 0, "y");

  // the arboretum: planted woodland with a loop path round the whole site
  B.trees(c, "jb-arb", 70, 2, 2, 44, 38, "T", "y", [";"]);
  c.fill("g", 4, 4, 40, 1, ":"); c.fill("g", 4, 36, 40, 1, ":");
  c.fill("g", 4, 4, 1, 33, ":"); c.fill("g", 43, 4, 1, 33, ":");
  c.fill("g", 21, 36, 3, 5, ":");
  c.fill("g", 6, 6, 8, 5, "\""); c.fill("g", 34, 30, 8, 4, "\"");
  c.fill("g", 7, 28, 6, 5, "\"");
  c.scatter("g", "jb-mush", "}", 16, 2, 2, 44, 38, [";"]);

  // the perimeter fence and the gate you get turned away from
  c.box("g", 8, 8, 32, 26, "F");
  c.set("g", 23, 33, "&"); c.set("g", 24, 33, "&");
  c.fill("g", 9, 9, 30, 24, ",");
  c.fill("g", 22, 26, 4, 8, ":");

  // THE LOVELL TELESCOPE
  M.dish(c, 23, 17, 8, "V", "Z", "^");
  c.fill("g", 21, 24, 5, 2, "V");
  c.set("g", 23, 25, "D"); c.set("g", 24, 25, "D");
  c.fill("g", 20, 26, 7, 1, ":");
  c.set("g", 20, 25, "N");

  // the Mark II, smaller and crosser
  M.dish(c, 35, 14, 4, "V", "Z", "^");
  c.fill("g", 30, 12, 4, 1, ":"); c.fill("g", 30, 12, 1, 8, ":");
  c.fill("g", 30, 19, 8, 1, ":");
  c.set("g", 34, 20, "4"); c.set("g", 13, 14, "4");
  c.fill("g", 11, 12, 8, 1, ":"); c.fill("g", 11, 12, 1, 10, ":");
  c.fill("g", 11, 21, 10, 1, ":");
  c.set("g", 12, 22, "N");
  c.fill("g", 10, 28, 28, 1, ":");
  c.fill("g", 37, 10, 1, 19, ":");
  c.fill("g", 10, 10, 1, 19, ":");
  c.fill("g", 10, 10, 28, 1, ":");

  // the visitor centre and the car park, outside the fence
  B.house(c, { x: 28, y: 36, w: 12, h: 4, rh: 1, wall: "0", win: null, door: "S", doorX: 5, over: "^" });
  c.fill("g", 27, 40, 14, 1, ":");
  c.fill("g", 24, 40, 4, 1, ":");
  c.set("g", 27, 39, "N");
  c.fill("g", 6, 37, 12, 3, ":");
  c.set("g", 6, 38, "u");

  W.defineMap("jodrell_bank", MQ.U.merge(DJ, {
    name: "Jodrell Bank", outdoor: true, weatherZone: "dane", ambience: "forest", music: "cutscene_signal",
    legend: JOD, layers: c.layers(),
    spawnPoint: { x: 21, y: 40 },
    landmark: { name: "The Lovell Telescope", x: 23, y: 17 },
    encounters: { grass: "jodrell_bank_grass", water: null },
    warps: [
      { x: 20, y: 41, to: "route_holmes_jodrell", tx: 60, ty: 17, dir: "down", kind: "edge" },
      { x: 21, y: 41, to: "route_holmes_jodrell", tx: 60, ty: 18, dir: "down", kind: "edge" },
      { x: 22, y: 41, to: "route_holmes_jodrell", tx: 60, ty: 19, dir: "down", kind: "edge" },
      { x: 33, y: 39, to: "jodrell_bank_visitor_centre", tx: 11, ty: 15, dir: "up", kind: "door" },
      { x: 23, y: 25, to: "jodrell_bank_control_room", tx: 14, ty: 22, dir: "up", kind: "door", cond: "jodrell_open" },
      { x: 24, y: 25, to: "jodrell_bank_control_room", tx: 15, ty: 22, dir: "up", kind: "door", cond: "jodrell_open" }
    ],
    signs: [
      { x: 27, y: 39, text: ["JODRELL BANK OBSERVATORY — VISITOR CENTRE.",
        "CLOSED FOR ESSENTIAL MAINTENANCE. A laminated sheet, and under the lamination, a second sheet that says the same thing in a different font."] },
      { x: 20, y: 25, text: ["THE LOVELL TELESCOPE. 76 metres. Built 1957 by a man who could not stop and a university that could not stop him.",
        "It has tracked Sputnik, Apollo, and pulsars nobody had a word for yet.",
        "The azimuth readout by the door says the bowl is pointed at 43 degrees. That is not up. That is Alderley Edge."] },
      { x: 12, y: 22, text: ["THE ARBORETUM. Every tree here was planted deliberately and labelled.",
        "The label on this one has been unscrewed and screwed back on upside down, and there is a fresh cable duct under the roots."] },
      { x: 6, y: 38, text: ["A stile onto the Goostrey footpath. ROOT walked out this way. She did not look back and she did not hurry."] }
    ],
    items: [
      { x: 5, y: 6, item: "capsule_kernel", n: 3, flag: "item_jodrell_1" },
      { x: 45, y: 38, item: "elixir", n: 2, hidden: true, flag: "item_jodrell_2" },
      { x: 3, y: 22, item: "copper_coil", n: 1, hidden: true, flag: "item_jodrell_3" },
      { x: 45, y: 4, item: "capsule_night", n: 4, hidden: true, flag: "item_jodrell_4" },
      { x: 38, y: 32, item: "x_ray_card", n: 1, flag: "item_jodrell_5" }
    ],
    catGaps: [
      { x: 22, y: 33, item: "cat_token_10", n: 1, flag: "catgap_jodrell_1",
        say: "MEADOW goes under the site fence in front of two DARKBYTE contractors who watch her do it, look at each other, and decide it is not their department." }
    ],
    restPoints: [{ x: 24, y: 38, flag: "bigboy_sat_jodrell" }],
    npcs: [
      { id: "npc_jodrell_root", x: 23, y: 34, dir: "down", sprite: "root_hivis", behaviour: "still", script: "mid_jodrell_root", cond: "!jodrell_open" },
      { id: "npc_jodrell_rhian", x: 20, y: 37, dir: "right", sprite: "npc_darkbyte", behaviour: "look", radius: 3, trainer: "tr_jodrell_bank_1", sight: 3, cond: "!jodrell_open" },
      { id: "npc_jodrell_colm", x: 30, y: 34, dir: "left", sprite: "npc_darkbyte", behaviour: "look", radius: 3, trainer: "tr_jodrell_bank_2", sight: 3, cond: "!jodrell_open" },
      { id: "npc_jodrell_ravi", x: 34, y: 39, dir: "left", sprite: "npc_dev", behaviour: "still", script: "mid_jodrell_ravi" },
      { id: "npc_jodrell_ranger", x: 11, y: 34, dir: "up", sprite: "npc_amos", behaviour: "still", script: "mid_jodrell_ranger", cond: "jodrell_turned_away && !amos_first_glimpse" },
      { id: "npc_jodrell_fenn", x: 11, y: 34, dir: "up", sprite: "npc_amos", behaviour: "look", radius: 3, trainer: "tr_jodrell_bank_4", sight: 3, cond: "amos_first_glimpse" },
      { id: "npc_jodrell_walker", x: 40, y: 24, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["I've walked this footpath for thirty years and I have never once heard it quiet.",
          "There's a hum. There's always a hum. There's no hum."] },
      { id: "npc_jodrell_child", x: 30, y: 40, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["We came for the planetarium and it's shut. Dad says it's shut for maintenance. Dad is doing his cross voice."] }
    ],
    triggers: [
      { x: 20, y: 38, w: 3, h: 1, script: "mid_jodrell_approach", once: "jodrell_approach", cond: "!jodrell_approach" },
      { x: 22, y: 32, w: 4, h: 1, script: "mid_jodrell_gate", cond: "!jodrell_open" }
    ]
  }));

  // ---- the visitor centre -------------------------------------------------
  const vc = M.room(24, 17, { floor: ".", wall: "/", top: "^" });
  vc.fill("g", 2, 3, 8, 1, "i"); vc.fill("g", 14, 3, 8, 1, "i");
  vc.fill("g", 3, 6, 4, 1, "C"); vc.set("g", 7, 6, "K");
  vc.fill("g", 10, 6, 5, 3, "Q");
  vc.fill("g", 17, 6, 5, 1, "s"); vc.fill("g", 17, 9, 5, 1, "s");
  vc.fill("g", 2, 11, 4, 1, "T"); vc.fill("g", 2, 12, 4, 1, "o");
  vc.fill("g", 18, 11, 4, 1, "T"); vc.fill("g", 18, 12, 4, 1, "o");
  vc.set("g", 12, 2, "\\");
  W.defineMap("jodrell_bank_visitor_centre", MQ.U.merge(DJ, {
    name: "Jodrell Bank Visitor Centre", outdoor: false, ambience: "town", music: "town_congleton",
    legend: INT, layers: vc.layers(),
    spawnPoint: { x: 11, y: 15 },
    warps: [
      { x: 11, y: 16, to: "jodrell_bank", tx: 33, ty: 40, dir: "down", kind: "door" },
      { x: 12, y: 16, to: "jodrell_bank", tx: 33, ty: 40, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_jodrell_ravi_vc", x: 12, y: 10, dir: "down", sprite: "npc_dev", behaviour: "still",
        trainer: "tr_jodrell_bank_3", sight: 0, script: "mid_jodrell_ravi_vc" },
      { id: "npc_jodrell_shopkeep", x: 5, y: 7, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_jodrell",
        say: ["Freeze-dried ice cream, a poster of the Crab Nebula, and a mug that says I SURVIVED THE BIG BANG.",
          "We are open. The site is not. It is an unusual arrangement and I have stopped explaining it."] },
      { id: "npc_jodrell_volunteer", x: 19, y: 12, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["I've volunteered here nineteen years. The maintenance crew arrived on a Sunday with no paperwork and a very good lock.",
          "I asked who they were. They said 'contractors'. Everybody's a contractor now. Nobody's anything."] }
    ],
    signs: [
      { x: 12, y: 2, text: ["A wall panel: WHAT WE LISTEN FOR.",
        "'Hydrogen. Pulsars. The cosmic microwave background — the oldest light there is, and it says almost nothing, very evenly, in every direction.'",
        "Somebody has stuck a note under it: 'seventy years of listening and the sky never once answered. discuss.'"] }
    ],
    items: [{ x: 22, y: 14, item: "collectible_10", n: 1, hidden: true, flag: "item_jodrell_vc_1" }],
    encounters: { grass: null }
  }));

  // ---- the control room: 1950s teal, and one console nobody sits at ------
  const cr = M.canvas(30, 24, "&");
  cr.box("g", 0, 0, 30, 24, "#");
  cr.fill("g", 1, 0, 28, 1, "^");
  cr.fill("g", 1, 1, 28, 1, "#");
  cr.fill("g", 4, 1, 5, 1, "W"); cr.fill("g", 20, 1, 5, 1, "W");
  cr.fill("g", 3, 4, 24, 1, "V");
  cr.fill("g", 3, 7, 8, 1, "R"); cr.fill("g", 19, 7, 8, 1, "R");
  cr.fill("g", 12, 9, 6, 2, "m");
  cr.fill("g", 3, 12, 6, 1, "P"); cr.fill("g", 21, 12, 6, 1, "P");
  cr.fill("g", 12, 14, 6, 1, "t"); cr.fill("g", 12, 15, 6, 1, "h");
  cr.set("g", 2, 18, "O"); cr.set("g", 27, 18, "O");
  cr.set("g", 1, 20, "u"); cr.set("g", 28, 20, "\\");
  cr.set("g", 14, 23, "D"); cr.set("g", 15, 23, "D");
  cr.fill("g", 14, 21, 2, 2, "M");
  cr.set("g", 4, 20, "z"); cr.set("g", 25, 20, "y");
  W.defineMap("jodrell_bank_control_room", MQ.U.merge(DJ, {
    name: "Jodrell Bank — Control Room", outdoor: false, ambience: "industrial",
    legend: INT, layers: cr.layers(),
    spawnPoint: { x: 14, y: 22 },
    encounters: { cave: "jodrell_bank_tower_cave" },
    warps: [
      { x: 14, y: 23, to: "jodrell_bank", tx: 23, ty: 26, dir: "down", kind: "door" },
      { x: 15, y: 23, to: "jodrell_bank", tx: 23, ty: 26, dir: "down", kind: "door" },
      { x: 1, y: 20, to: "jodrell_bank_tower", tx: 4, ty: 31, dir: "up", kind: "stairs" }
    ],
    signs: [
      { x: 28, y: 20, text: ["THE AZIMUTH LOG.",
        "Every movement of the bowl since 1957, in a ledger, in pencil, initialled.",
        "The last forty entries are all the same bearing and none of them are initialled."] },
      { x: 15, y: 10, text: ["THE CONSOLE. Bakelite, brass, and one modern rack bolted to the side of it with a jubilee clip.",
        "The modern rack has no asset tag. The jubilee clip is new."] }
    ],
    items: [
      { x: 27, y: 22, item: "elixir", n: 2, hidden: true, flag: "item_jodrell_cr_1" },
      { x: 2, y: 22, item: "full_restore", n: 1, hidden: true, flag: "item_jodrell_cr_2" }
    ],
    npcs: []
  }));

  // ---- the tower: gantries, ladders, and a long way up ------------------
  const tw = M.canvas(28, 34, ",");
  tw.box("g", 0, 0, 28, 34, "#");
  tw.fill("g", 1, 0, 26, 1, "^");
  // three landings connected by stair wells, the shaft open in the middle
  tw.fill("g", 1, 1, 26, 8, "#");
  tw.fill("g", 2, 2, 24, 6, ",");
  tw.fill("g", 1, 12, 26, 8, "#");
  tw.fill("g", 2, 13, 24, 6, ",");
  tw.fill("g", 1, 23, 26, 9, "#");
  tw.fill("g", 2, 24, 24, 7, ",");
  // the stair wells: two per landing, at opposite ends, so it is a climb
  tw.fill("g", 3, 8, 2, 5, "-"); tw.fill("g", 3, 19, 2, 5, "-");
  tw.fill("g", 22, 8, 2, 5, "-"); tw.fill("g", 22, 19, 2, 5, "-");
  tw.set("g", 4, 32, "D"); tw.set("g", 3, 32, "D");
  tw.fill("g", 3, 31, 2, 1, "M");
  // gantry furniture
  tw.fill("g", 6, 3, 5, 1, "R"); tw.fill("g", 17, 3, 5, 1, "R");
  tw.fill("g", 6, 14, 5, 1, "R"); tw.fill("g", 17, 16, 5, 1, "R");
  tw.fill("g", 8, 25, 4, 1, "V"); tw.fill("g", 16, 27, 4, 1, "V");
  tw.set("g", 13, 6, "O"); tw.set("g", 13, 17, "O"); tw.set("g", 13, 29, "O");
  tw.set("g", 25, 2, "\\"); tw.set("g", 2, 30, "\\");
  tw.fill("g", 12, 1, 4, 1, "u");
  W.defineMap("jodrell_bank_tower", MQ.U.merge(DJ, {
    name: "Jodrell Bank — the Tower", outdoor: false, ambience: "industrial",
    legend: INT, layers: tw.layers(),
    spawnPoint: { x: 4, y: 31 },
    encounters: { cave: "jodrell_bank_tower_cave" },
    warps: [
      { x: 3, y: 32, to: "jodrell_bank_control_room", tx: 2, ty: 20, dir: "down", kind: "stairs" },
      { x: 4, y: 32, to: "jodrell_bank_control_room", tx: 2, ty: 20, dir: "down", kind: "stairs" },
      { x: 13, y: 1, to: "jodrell_bank_dish", tx: 20, ty: 34, dir: "up", kind: "stairs" },
      { x: 14, y: 1, to: "jodrell_bank_dish", tx: 21, ty: 34, dir: "up", kind: "stairs" }
    ],
    signs: [
      { x: 2, y: 30, text: ["A painted warning at the foot of the first ladder: 76 METRES. DO NOT CLIMB IN WIND.",
        "It is not windy. It has not been windy here for a fortnight, and that is its own kind of weather."] },
      { x: 25, y: 2, text: ["The top landing. From here the bowl is not a shape, it is a horizon.",
        "There is a folding chair. There is a flask. Somebody has been sitting up here for days waiting for you to get this far."] }
    ],
    items: [
      { x: 25, y: 30, item: "full_restore", n: 1, hidden: true, flag: "item_jodrell_tower_1" },
      { x: 25, y: 17, item: "capsule_root", n: 2, hidden: true, flag: "item_jodrell_tower_2" },
      { x: 2, y: 6, item: "revive_salts", n: 2, hidden: true, flag: "item_jodrell_tower_3" }
    ],
    npcs: []
  }));

  // ---- the bowl: the arena ------------------------------------------------
  const dh = M.canvas(42, 36, "&");
  dh.fill("g", 0, 0, 42, 36, " ");
  for (let y = 0; y < 36; y++) {
    for (let x = 0; x < 42; x++) {
      const dx = (x - 21) / 20, dy = (y - 16) / 15;
      const d = dx * dx + dy * dy;
      if (d <= 1) dh.set("g", x, y, d > 0.86 ? "7" : "&");
    }
  }
  dh.fill("g", 19, 27, 4, 9, "-");
  dh.fill("g", 18, 33, 6, 3, "-");
  dh.fill("g", 14, 14, 14, 5, "V");
  dh.fill("g", 16, 15, 10, 3, "R");
  dh.set("g", 20, 19, "V"); dh.set("g", 21, 19, "V");
  dh.set("g", 8, 16, "\\"); dh.set("g", 33, 16, "\\");
  dh.fill("g", 10, 24, 4, 1, "O"); dh.fill("g", 28, 24, 4, 1, "O");
  W.defineMap("jodrell_bank_dish", MQ.U.merge(DJ, {
    name: "The Bowl", outdoor: false, ambience: "industrial",
    legend: M.interior({ "7": "wall_stone_grit" }), layers: dh.layers(),
    spawnPoint: { x: 20, y: 34 },
    landmark: { name: "The Bowl", x: 21, y: 16 },
    encounters: { cave: "jodrell_bank_tower_cave" },
    warps: [
      { x: 20, y: 35, to: "jodrell_bank_tower", tx: 13, ty: 2, dir: "down", kind: "stairs" },
      { x: 21, y: 35, to: "jodrell_bank_tower", tx: 14, ty: 2, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 8, y: 16, text: ["You are standing inside a bowl seventy-six metres across, tipped towards the ground.",
        "The county is laid out below the rim: Alderley on the skyline, the Cloud to the south, Chester somewhere in the haze.",
        "Every one of them has a mast on it."] },
      { x: 33, y: 16, text: ["The focus tower, at the centre of the bowl, where seventy years of the sky have been brought to a point.",
        "It is warm."] }
    ],
    items: [
      { x: 12, y: 28, item: "full_restore", n: 2, hidden: true, flag: "item_jodrell_dish_1" }
    ],
    npcs: []
  }));
})();
