// =============================================================
// MonsterQuest v2 — CHESTER (region west, Ch.12) — THE FIREWALL.
// Red sandstone, a complete Roman wall you can walk all the way round,
// two streets of shops stacked on top of each other, a clock everybody
// photographs, a cathedral chapter house with four people in it who will
// check your team, and the largest Roman amphitheatre in Britain.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();

  // --------------------------------------------------------------- city ---
  const c = B.canvas(60, 46, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 60; x++) c.set("o", x, 0, "y");
  c.fill("g", 2, 2, 56, 42, ",");
  c.fill("g", 58, 22, 2, 4, "r");

  // ---- the city wall, all the way round, with four gates ---------------
  c.box("g", 4, 4, 50, 34, "%");
  c.fill("g", 26, 4, 4, 1, "6");
  c.fill("g", 53, 18, 1, 4, "6");
  c.fill("g", 4, 18, 1, 4, "6");
  c.fill("g", 26, 37, 4, 1, "6");
  c.set("g", 4, 4, "7"); c.set("g", 53, 4, "7"); c.set("g", 4, 37, "7"); c.set("g", 53, 37, "7");
  c.fill("g", 5, 5, 48, 32, "=");

  // ---- the four streets meeting at the Cross ---------------------------
  c.fill("g", 26, 5, 4, 32, "=");
  c.fill("g", 27, 5, 2, 32, "_");
  c.fill("g", 5, 18, 48, 4, "=");
  c.fill("g", 5, 19, 48, 2, "_");
  c.fill("g", 25, 17, 6, 6, "_");
  c.set("g", 27, 19, "M"); c.set("g", 28, 19, "M");
  c.set("g", 24, 21, "N");
  for (let x = 8; x < 52; x += 6) { c.set("g", x, 17, "L"); c.set("g", x + 3, 22, "L"); }
  for (let y = 8; y < 36; y += 6) { c.set("g", 25, y, "L"); }

  // ---- the Rows: two storeys of shopfronts along Eastgate and Bridge ----
  for (let i = 0; i < 5; i++) {
    B.house(c, { x: 32 + i * 4, y: 13, w: 4, h: 4, rh: 1, roof: "@", wall: "&", win: "W", door: "S", doorX: 1, over: ";" });
    B.house(c, { x: 32 + i * 4, y: 23, w: 4, h: 4, rh: 1, roof: "@", wall: "&", win: "W", door: "S", doorX: 1, over: ";" });
  }
  for (let i = 0; i < 4; i++) {
    B.house(c, { x: 8 + i * 4, y: 13, w: 4, h: 4, rh: 1, roof: "@", wall: "^", win: "W", door: "S", doorX: 1, over: ";" });
  }
  c.fill("g", 8, 12, 20, 1, "]");
  c.fill("g", 32, 12, 20, 1, "]");
  c.set("g", 31, 15, "N");

  // ---- the Eastgate clock, over the east gate --------------------------
  c.fill("g", 51, 17, 2, 6, "%");
  c.set("g", 52, 19, "9");
  c.set("g", 50, 18, "N");

  // ---- the cathedral, in the north-east quarter ------------------------
  c.fill("g", 33, 5, 20, 7, ",");
  c.box("g", 33, 5, 20, 7, "w");
  B.house(c, { x: 36, y: 6, w: 14, h: 5, rh: 2, roof: "p", wall: "c", win: "C", door: "v", doorX: 6 });
  c.set("g", 40, 5, "p"); c.set("g", 44, 5, "p");
  c.set("g", 42, 12, "g");
  c.fill("g", 42, 12, 1, 6, "_");
  c.set("g", 34, 10, "N");

  // ---- the amphitheatre, outside the wall to the south-east ------------
  c.fill("g", 46, 38, 12, 6, ",");
  c.fill("g", 48, 39, 8, 4, "n");
  c.fill("g", 50, 40, 4, 2, "$");
  c.fill("g", 45, 39, 1, 4, "_");
  c.fill("g", 45, 37, 1, 2, "_");
  c.set("g", 44, 40, "N");

  // ---- the Groves and the Dee, along the south -------------------------
  c.fill("g", 5, 40, 52, 4, "!");
  c.fill("g", 5, 39, 52, 1, "t");
  c.fill("g", 5, 38, 52, 1, "=");
  c.fill("g", 26, 38, 4, 6, "x");
  c.set("g", 18, 39, "Q"); c.set("g", 38, 39, "Q"); c.set("g", 10, 39, "Q");
  c.set("g", 30, 39, "j");
  c.set("g", 22, 38, "N");
  c.set("g", 14, 39, "H"); c.set("g", 42, 39, "H");

  // ---- the Roodee, outside the wall to the west ------------------------
  c.fill("g", 2, 10, 2, 24, '"');
  c.fill("g", 2, 24, 2, 6, '"');
  c.set("g", 2, 18, "N");

  // ---- civic interiors along the streets -------------------------------
  B.house(c, { x: 8, y: 24, w: 11, h: 6, rh: 2, roof: "R", wall: "%", win: "W", door: "S", doorX: 5, over: ";" });
  c.set("g", 7, 27, "N");
  B.house(c, { x: 21, y: 24, w: 3, h: 6, rh: 2, roof: "R", wall: "%", win: "W", door: "S", doorX: 1, over: ";" });
  B.house(c, { x: 8, y: 32, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: ">", doorX: 4, over: ";" });
  c.set("g", 7, 35, "N");
  B.house(c, { x: 20, y: 32, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 33, y: 31, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 40, y: 31, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 47, y: 31, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 33, y: 6, w: 1, h: 1, rh: 0, roof: ".", wall: ".", win: null, door: ".", doorX: 0 });
  B.house(c, { x: 8, y: 6, w: 10, h: 5, rh: 2, roof: "R", wall: "%", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 7, 10, "N");
  B.house(c, { x: 20, y: 6, w: 6, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 1, doors: [4], over: ";" });
  c.fill("g", 5, 11, 48, 1, "=");
  c.fill("g", 5, 30, 48, 1, "=");
  c.fill("g", 5, 36, 48, 1, "=");
  c.fill("g", 55, 5, 3, 30, '"');
  B.trees(c, "ch-e", 10, 55, 5, 3, 30, "T", "y", ['"']);

  // stairs up on to the wall at the four corners
  c.set("g", 6, 6, "s"); c.set("g", 51, 6, "s"); c.set("g", 6, 35, "s"); c.set("g", 51, 35, "s");

  W.defineMap("chester", {
    name: "Chester", region: "west", outdoor: true, music: "town_chester", weatherZone: "west",
    ambience: "town", dialogue: "town_chester",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 28, y: 20 },
    healPoint: { x: 13, y: 30 },
    landmark: { name: "The Cross", x: 28, y: 19 },
    encounters: { grass: "chester_grass", water: null },
    warps: [].concat(
      NW.edge(59, 22, 4, false, "route_tarporley_chester", 1, 13, "right"),
      NW.edge(26, 2, 4, true, "route_chester_zoo", 23, 43, "up"),
      NW.exit(13, 30, "chester_care", 7, 10, "up"),
      NW.exit(12, 10, "chester_mart", 6, 8, "up"),
      NW.exit(12, 35, "chester_inn", 6, 10, "up"),
      [
        { x: 22, y: 29, to: "chester_post", tx: 6, ty: 8, dir: "up", kind: "door" },
        { x: 42, y: 11, to: "chester_cathedral", tx: 18, ty: 26, dir: "up", kind: "door" },
        { x: 6, y: 6, to: "chester_walls", tx: 7, ty: 6, dir: "up", kind: "stairs" },
        { x: 51, y: 6, to: "chester_walls", tx: 52, ty: 6, dir: "up", kind: "stairs" },
        { x: 6, y: 35, to: "chester_walls", tx: 7, ty: 39, dir: "up", kind: "stairs" },
        { x: 51, y: 35, to: "chester_walls", tx: 52, ty: 39, dir: "up", kind: "stairs" },
        { x: 45, y: 40, to: "chester_amphitheatre", tx: 20, ty: 30, dir: "up", kind: "edge" },
        { x: 3, y: 20, to: "chester_roodee", tx: 34, ty: 16, dir: "left", kind: "edge" },
        { x: 3, y: 21, to: "chester_roodee", tx: 34, ty: 17, dir: "left", kind: "edge" },
        { x: 30, y: 39, to: "chester_groves", tx: 24, ty: 4, dir: "down", kind: "edge" },
        { x: 27, y: 43, to: "chester_edgars_field", tx: 16, ty: 3, dir: "down", kind: "edge" },
        { x: 28, y: 43, to: "chester_edgars_field", tx: 17, ty: 3, dir: "down", kind: "edge" },
        { x: 21, y: 10, to: "chester_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 24, y: 10, to: "chester_house_6", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 22, y: 35, to: "chester_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 35, y: 34, to: "chester_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 42, y: 34, to: "chester_house_4", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 49, y: 34, to: "chester_house_5", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 33, y: 16, to: "chester_rows", tx: 20, ty: 20, dir: "up", kind: "door" },
        { x: 37, y: 16, to: "chester_rows", tx: 20, ty: 20, dir: "up", kind: "door" },
        { x: 41, y: 16, to: "chester_rows", tx: 20, ty: 20, dir: "up", kind: "door" }
      ]
    ),
    signs: [
      { x: 24, y: 21, text: ["THE CROSS", "Four streets, laid out by the Twentieth Legion, still doing exactly what they were told to do in AD 79.",
        "The Town Crier is at noon. He is very loud and completely unrepentant."] },
      { x: 31, y: 15, text: ["THE ROWS", "Two streets of shops, one on top of the other, unique in the world and nobody can agree why they exist.",
        "Mind your head on the beam. Everybody minds their head on the beam."] },
      { x: 50, y: 18, text: ["THE EASTGATE CLOCK — put up for Victoria's Diamond Jubilee, two years late.",
        "Second most photographed clock in England. Ask which is first and Chester will change the subject."] },
      { x: 34, y: 10, text: ["CHESTER CATHEDRAL", "Benedictine abbey, then cathedral, then a very long argument about the roof.",
        "The chapter house is closed today. Four people are sitting in it and none of them are clergy."] },
      { x: 44, y: 40, text: ["THE ROMAN AMPHITHEATRE", "The largest in Britain. Seated seven thousand. Half of it is still under the road.",
        "It is being used this evening. The notice does not say what for."] },
      { x: 22, y: 38, text: ["THE GROVES — bandstand, boats, and the weir.", "The salmon leap it in the spring and half the city comes out to watch them fail and then succeed."] },
      { x: 2, y: 18, text: ["THE ROODEE — the oldest racecourse still in use anywhere in the world.",
        "Under the turf: a Roman harbour. Under that: opinions."] },
      { x: 7, y: 10, text: ["CHESTER MART — everything, on two floors, because in this city everything is on two floors."] },
      { x: 7, y: 27, text: ["CARE CENTRE — CHESTER", "The league's own. Raj checks people at the Northgate and sends most of them back here first."] },
      { x: 7, y: 35, text: ["THE BLUE BELL — the oldest domestic building in the city, and the beams say so at length."] }
    ],
    items: [
      { x: 56, y: 8, item: "full_restore", n: 2, flag: "item_chester_1" },
      { x: 56, y: 33, item: "capsule_root", n: 5, flag: "item_chester_2" },
      { x: 3, y: 12, item: "elixir", n: 3, hidden: true, flag: "item_chester_3" },
      { x: 46, y: 43, item: "tm_firewall_up", n: 1, hidden: true, flag: "item_chester_4" }
    ],
    catGaps: [
      { x: 50, y: 22, item: "collectible_11", n: 1, flag: "catgap_chester_1",
        say: "MEADOW goes up the Eastgate's ironwork, sits under the clock face for eleven seconds, and comes back with something small and brass in her mouth." }
    ],
    restPoints: [{ x: 32, y: 20, flag: "meadow_sat_chester" }],
    npcs: [
      { id: "npc_chester_bledig", x: 30, y: 21, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_chester_1", sight: 0, script: "nw_chester_crier" },
      { id: "npc_chester_anwen", x: 36, y: 18, dir: "up", sprite: "npc_shopkeep", behaviour: "still", trainer: "tr_chester_2", sight: 0, script: "nw_chester_rows_merchant" },
      { id: "npc_chester_idris", x: 7, y: 7, dir: "down", sprite: "npc_walker", behaviour: "still", script: "nw_chester_idris" },
      { id: "npc_chester_verger", x: 42, y: 13, dir: "down", sprite: "npc_historian", behaviour: "still", script: "nw_chester_cathedral_door" },
      { id: "npc_chester_tourist", x: 48, y: 20, dir: "up", sprite: "npc_tourist", behaviour: "wander", radius: 3,
        say: ["I have photographed the clock from six angles and my phone has quietly deleted two of them."] },
      { id: "npc_chester_kid", x: 20, y: 20, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 4,
        say: ["Two miles of wall and you can do the whole thing without touching a road.",
          "There's a bit near the Water Tower where somebody pins notes. Grown-ups pretend not to read them."] },
      { id: "npc_chester_boater", x: 32, y: 39, dir: "down", sprite: "npc_boater", behaviour: "still",
        say: ["Rowing boats by the hour. The weir's that way and you are not to go over it, which I say to everyone and mean."] },
      { id: "npc_chester_league", x: 28, y: 24, dir: "down", sprite: "npc_whitehat", behaviour: "still", script: "nw_chester_league_desk" },
      { id: "npc_chester_vex_ally", x: 26, y: 25, dir: "right", sprite: "vex", behaviour: "still", script: "nw_vex_ally_chat",
        cond: "vex_ally && chapter >= 12" }
    ],
    triggers: [
      { x: 27, y: 21, w: 2, h: 1, script: "nw_chester_arrival", once: "chester_arrival" }
    ]
  });

  // ------------------------------------------------------- the wall walk --
  // A two-mile ring you can walk without touching a road: the walkable
  // parapet is the band between the outer face and the drop into the city.
  const wl = B.canvas(60, 46, "e");
  wl.fill("g", 4, 4, 52, 38, "5");
  wl.fill("g", 8, 8, 44, 30, "e");
  // the four towers, set into the outer corners; the inner lane stays clear
  wl.fill("g", 4, 4, 3, 3, "7"); wl.fill("g", 53, 4, 3, 3, "7");
  wl.fill("g", 4, 39, 3, 3, "7"); wl.fill("g", 53, 39, 3, 3, "7");
  // the four gates: steps down into the city
  wl.fill("g", 28, 4, 2, 1, "s");
  wl.fill("g", 55, 20, 1, 2, "s");
  wl.fill("g", 4, 20, 1, 2, "s");
  wl.fill("g", 28, 41, 2, 1, "s");
  // the checkpoint boards, on the towers and beside the gates
  wl.set("g", 6, 7, "N"); wl.set("g", 53, 7, "N"); wl.set("g", 6, 38, "N"); wl.set("g", 53, 38, "N");
  wl.set("g", 27, 4, "N"); wl.set("g", 55, 24, "N"); wl.set("g", 24, 41, "N"); wl.set("g", 4, 24, "N");
  wl.set("g", 40, 4, "9");
  NW.defLand("chester_walls", {
    name: "The Chester Walls", region: "west", weatherZone: "west", music: "town_chester", ambience: "town",
    dialogue: "town_chester",
    spawnPoint: { x: 28, y: 5 },
    landmark: { name: "The Walls", x: 28, y: 5 },
    encounters: { grass: "chester_walls_grass" },
    warps: [
      { x: 28, y: 4, to: "chester", tx: 28, ty: 6, dir: "down", kind: "stairs" },
      { x: 29, y: 4, to: "chester", tx: 28, ty: 6, dir: "down", kind: "stairs" },
      { x: 55, y: 20, to: "chester", tx: 51, ty: 7, dir: "down", kind: "stairs" },
      { x: 55, y: 21, to: "chester", tx: 51, ty: 7, dir: "down", kind: "stairs" },
      { x: 4, y: 20, to: "chester", tx: 6, ty: 7, dir: "down", kind: "stairs" },
      { x: 4, y: 21, to: "chester", tx: 6, ty: 7, dir: "down", kind: "stairs" },
      { x: 28, y: 41, to: "chester", tx: 28, ty: 36, dir: "down", kind: "stairs" },
      { x: 29, y: 41, to: "chester", tx: 28, ty: 36, dir: "down", kind: "stairs" },
      { x: 8, y: 40, to: "chester_northgate", tx: 14, ty: 22, dir: "up", kind: "gate", cond: "chapter >= 12" }
    ],
    signs: [
      { x: 6, y: 7, text: ["KING CHARLES' TOWER", "He stood here in 1645 and watched his army lose at Rowton Moor.",
        "There is a plaque. It is the politest sentence about a defeat ever written."] },
      { x: 53, y: 7, text: ["THE PHOENIX TOWER — checkpoint two.", "Somebody has chalked eight numbers on the parapet in the order you earned your badges."] },
      { x: 6, y: 38, text: ["THE WATER TOWER", "Built to reach the river. The river moved. The tower stayed, four hundred yards inland, extremely dignified about it.",
        "There is a note pinned here in a hand you last saw on a bench above an estuary."] },
      { x: 53, y: 38, text: ["THE NEWGATE — the amphitheatre is below you and half of it is under the road."] },
      { x: 27, y: 4, text: ["THE NORTHGATE — checkpoint. On league nights the gate is manned and the man asks about your team."] },
      { x: 55, y: 24, text: ["THE EASTGATE — you are standing on the clock's own wall. It is louder up here than it looks."] },
      { x: 24, y: 41, text: ["THE BRIDGEGATE — the Dee, the weir, and Wales two miles that way and always has been."] },
      { x: 4, y: 24, text: ["THE WATERGATE — the Roodee below. It was a harbour. Ships tied up where the finishing post is."] }
    ],
    items: [
      { x: 7, y: 5, item: "viewpoint_chester_walls", n: 1, flag: "item_chester_walls_1" },
      { x: 52, y: 40, item: "full_restore", n: 1, hidden: true, flag: "item_chester_walls_2" },
      { x: 40, y: 40, item: "capsule_root", n: 4, hidden: true, flag: "item_chester_walls_3" }
    ],
    npcs: [
      { id: "npc_chester_walls_idris", x: 20, y: 5, dir: "down", sprite: "npc_walker", behaviour: "still", trainer: "tr_chester_walls_1", sight: 4 },
      { id: "npc_chester_walls_legion", x: 40, y: 39, dir: "up", sprite: "npc_ghost_trainer", behaviour: "still", trainer: "tr_chester_walls_2", sight: 4, cond: "time.night" },
      { id: "npc_chester_walls_cadi", x: 36, y: 5, dir: "down", sprite: "npc_whitehat", behaviour: "still", trainer: "tr_chester_walls_3", sight: 4, cond: "chapter >= 12" },
      { id: "npc_chester_walls_sue", x: 46, y: 5, dir: "down", sprite: "sue", behaviour: "still", script: "nw_whitehat_sue", cond: "chapter >= 12 && !whitehat_sue" },
      { id: "npc_chester_walls_kim", x: 5, y: 14, dir: "right", sprite: "kim", behaviour: "still", script: "nw_whitehat_kim", cond: "whitehat_raj && !whitehat_kim" },
      { id: "npc_chester_walls_doc", x: 7, y: 40, dir: "up", sprite: "doc", behaviour: "still", script: "nw_whitehat_doc", cond: "whitehat_kim && !whitehat_doc" },
      { id: "npc_chester_walls_walker", x: 12, y: 5, dir: "right", sprite: "npc_tourist", behaviour: "path", path: [[12, 5], [24, 5]], pathMode: "pingpong",
        say: ["Two miles, unbroken, and the only complete circuit in Britain.", "You can do it in forty minutes and you will not, because of the clock and the cathedral and the chips."] }
    ],
    triggers: [
      { x: 27, y: 5, w: 4, h: 1, script: "nw_firewall_start", once: "firewall_started", cond: "chapter >= 12 && all_badges" }
    ]
  }, wl, NW.land({ "5": "wall_city_walk", "7": "castle_tower", "e": "void", "s": "steps", "N": "noticeboard", "9": "station_clock" }));

  // ------------------------------------------------------- the Northgate --
  const ng = B.canvas(28, 24, "=");
  ng.box("g", 0, 0, 28, 24, "%");
  ng.fill("g", 1, 0, 26, 1, "^");
  ng.fill("g", 2, 3, 24, 2, "5");
  ng.fill("g", 6, 8, 16, 8, "_");
  ng.set("g", 13, 11, "$"); ng.set("g", 14, 11, "$");
  ng.set("g", 3, 18, "N"); ng.set("g", 24, 18, "N");
  ng.set("g", 13, 23, "6"); ng.set("g", 14, 23, "6");
  NW.defIn("chester_northgate", {
    name: "The Northgate", region: "west", music: "battle_boss", ambience: "town", dialogue: "town_chester",
    spawnPoint: { x: 14, y: 22 },
    warps: [
      { x: 13, y: 23, to: "chester_walls", tx: 9, ty: 40, dir: "down", kind: "gate" },
      { x: 14, y: 23, to: "chester_walls", tx: 9, ty: 40, dir: "down", kind: "gate" }
    ],
    encounters: { grass: null },
    signs: [
      { x: 3, y: 18, text: ["CHECKPOINT TWO — NO UNPATCHED STATUS.", "Full HP. No ailments. Every one of them. 'I'll sort it after' is how counties fall over."] },
      { x: 24, y: 18, text: ["Under the gate there is a Roman drain, a Georgian gaol and a Bridge of Sighs.",
        "Condemned men were walked over it to the chapel. It is four feet wide and has no rail."] }
    ],
    items: [{ x: 25, y: 21, item: "full_restore", n: 1, hidden: true, flag: "item_chester_northgate_1" }],
    npcs: [
      { id: "npc_chester_raj", x: 14, y: 9, dir: "down", sprite: "raj", behaviour: "still", script: "nw_whitehat_raj" }
    ]
  }, ng, NW.inside({ "5": "wall_city_walk", "%": "wall_stone_sandstone", "6": "castle_gate", "$": "gym_badge_stand", "N": "noticeboard", "=": "path_flag" }));

  // ------------------------------------------------------ the cathedral ---
  const ca = B.canvas(36, 28, ":");
  ca.box("g", 0, 0, 36, 28, "%");
  ca.fill("g", 1, 0, 34, 1, "^");
  ca.fill("g", 2, 1, 32, 1, "%");
  for (let x = 4; x < 32; x += 5) ca.fill("g", x, 1, 2, 1, "W");
  ca.fill("g", 6, 4, 24, 16, "-");
  for (let y = 6; y < 19; y += 3) { ca.fill("g", 3, y, 2, 1, "c"); ca.fill("g", 31, y, 2, 1, "c"); }
  ca.fill("g", 14, 3, 8, 1, "t");
  ca.fill("g", 25, 21, 8, 5, "%");
  ca.fill("g", 26, 22, 6, 3, ":");
  ca.set("g", 28, 21, "D");
  ca.set("g", 24, 23, "N");
  ca.fill("g", 4, 21, 8, 5, ":");
  ca.set("g", 6, 23, "k"); ca.set("g", 9, 23, "k");
  ca.set("g", 3, 25, "N");
  NW.doorway(ca, 17, 27, "D");
  NW.defIn("chester_cathedral", {
    name: "Chester Cathedral", region: "west", music: "town_chester", ambience: "town", dialogue: "town_chester",
    spawnPoint: { x: 18, y: 26 },
    warps: [].concat(
      NW.exit(17, 27, "chester", 42, 12, "down"),
      [{ x: 28, y: 21, to: "chester_amphitheatre", tx: 20, ty: 30, dir: "up", kind: "door", cond: "whitehat_doc" }]
    ),
    encounters: { grass: null },
    signs: [
      { x: 24, y: 23, text: ["THE CHAPTER HOUSE — closed to visitors today.", "Four chairs. Four people. Four checks, and the way out of the far side goes to the arena."] },
      { x: 3, y: 25, text: ["The cloister. Nine hundred years of monks walking in a square, thinking.",
        "There is a shrine to St Werburgh, whose miracle was bringing a goose back to life. Everybody's job is somebody's miracle."] }
    ],
    items: [{ x: 34, y: 26, item: "elixir", n: 3, hidden: true, flag: "item_chester_cathedral_1" }],
    npcs: [
      { id: "npc_chester_cathedral_verger", x: 18, y: 22, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The chapter house is where the abbey made its decisions, out loud, in front of each other.",
          "That is still what it is for. They have just changed what they decide about."] },
      { id: "npc_chester_sue_hall", x: 12, y: 22, dir: "right", sprite: "sue", behaviour: "still", script: "nw_whitehat_sue", cond: "chapter >= 12 && !whitehat_sue" },
      { id: "npc_chester_doc_hall", x: 20, y: 12, dir: "down", sprite: "doc", behaviour: "still", script: "nw_whitehat_doc", cond: "whitehat_kim && !whitehat_doc" }
    ]
  }, ca, NW.inside({ "%": "church_wall", "W": "church_window", "c": "chair", "t": "table", "k": "bookcase", "N": "painting" }));

  // ---------------------------------------------------- the amphitheatre --
  const am = B.canvas(40, 34, ",");
  B.frame(am, "T", 1);
  am.fill("g", 19, 31, 3, 3, "_");
  am.fill("g", 1, 1, 38, 32, ".");
  am.fill("g", 4, 3, 32, 24, "n");
  am.fill("g", 6, 5, 28, 20, "n");
  am.fill("g", 8, 7, 24, 16, "$");
  am.fill("g", 10, 9, 20, 12, "$");
  am.set("g", 6, 12, "L"); am.set("g", 33, 12, "L");
  am.fill("g", 2, 28, 36, 3, '"');
  B.trees(am, "am-t", 12, 2, 28, 36, 3, "T", "y", ['"']);
  am.fill("g", 19, 23, 2, 8, "_");
  am.fill("g", 19, 5, 2, 4, "_");
  am.set("g", 18, 25, "N");
  NW.defLand("chester_amphitheatre", {
    name: "The Roman Amphitheatre", region: "west", weatherZone: "west", music: "battle_champion", ambience: "town",
    dialogue: "town_chester",
    spawnPoint: { x: 20, y: 30 },
    landmark: { name: "The Amphitheatre", x: 20, y: 15 },
    encounters: { grass: "chester_amphitheatre_grass" },
    warps: NW.edge(19, 33, 3, true, "chester", 45, 39, "down").concat([
      { x: 19, y: 5, to: "chester_cathedral", tx: 28, ty: 22, dir: "up", kind: "door" },
      { x: 20, y: 5, to: "chester_cathedral", tx: 28, ty: 22, dir: "up", kind: "door" }
    ]),
    signs: [
      { x: 18, y: 25, text: ["DEVA AMPHITHEATRE", "Seated seven thousand. Two builds, one on top of the other, and the second one had a shrine to Nemesis by the north entrance.",
        "Nemesis: the goddess of getting exactly what you have coming. They put her at the door on purpose."] }
    ],
    items: [
      { x: 3, y: 30, item: "full_restore", n: 2, flag: "item_chester_amphitheatre_1" },
      { x: 36, y: 30, item: "capsule_root", n: 5, hidden: true, flag: "item_chester_amphitheatre_2" }
    ],
    restPoints: [{ x: 22, y: 27, flag: "meadow_sat_amphitheatre" }],
    npcs: [
      { id: "npc_chester_champion", x: 20, y: 14, dir: "down", sprite: "vex", behaviour: "still", script: "nw_champion_vex",
        cond: "whitehat_doc && !champion_fought" },
      { id: "npc_chester_champion_after", x: 20, y: 14, dir: "down", sprite: "vex", behaviour: "still", script: "nw_champion_after",
        cond: "champion_fought" },
      { id: "npc_chester_legion", x: 12, y: 20, dir: "right", sprite: "npc_ghost_trainer", behaviour: "still", trainer: "tr_chester_amphitheatre_1", sight: 4, cond: "time.night" },
      { id: "npc_chester_amph_knight", x: 28, y: 20, dir: "left", sprite: "npc_ghost_trainer", behaviour: "still", trainer: "elite_knight_first", sight: 0,
        cond: "postgame_open", script: "nw_amphitheatre_knight" }
    ]
  }, am, NW.land({ "n": "racecourse_rail", "$": "sand", "_": "path_flag", "N": "noticeboard", "L": "cliff_climb" }));

  // ---------------------------------------------------------- the Rows ----
  const ro = B.canvas(40, 22, ";");
  ro.box("g", 0, 0, 40, 22, "&");
  ro.fill("g", 1, 0, 38, 1, "^");
  ro.fill("g", 1, 1, 38, 1, "&");
  for (let i = 0; i < 7; i++) { ro.fill("g", 2 + i * 5, 3, 3, 1, "S"); ro.fill("g", 2 + i * 5, 8, 3, 1, "S"); }
  ro.fill("g", 2, 5, 36, 2, ";");
  ro.fill("g", 2, 12, 36, 6, ";");
  ro.fill("g", 4, 13, 6, 1, "C"); ro.set("g", 7, 13, "Q");
  ro.fill("g", 16, 13, 8, 1, "S"); ro.fill("g", 28, 13, 8, 1, "k");
  ro.fill("g", 18, 16, 4, 1, "o"); ro.fill("g", 18, 17, 4, 1, "l");
  ro.set("g", 2, 20, "N"); ro.set("g", 37, 20, "N");
  NW.doorway(ro, 19, 21, "D");
  NW.defIn("chester_rows", {
    name: "The Rows", region: "west", music: "town_chester", ambience: "town", dialogue: "town_chester",
    spawnPoint: { x: 20, y: 20 },
    shop: "shop_chester_rows",
    warps: NW.exit(19, 21, "chester", 37, 17, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 20, text: ["THE ROWS — a covered walkway at first-floor level, running the length of four medieval streets.",
        "Nobody knows why. Roman rubble, a fire, a byelaw, or somebody in 1300 having a very good idea."] },
      { x: 37, y: 20, text: ["SKILL CARDS, HELD GEAR, AND A MAN WHO WILL TELL YOU ABOUT BEAMS.", "You will not get away in under ten minutes."] }
    ],
    items: [{ x: 38, y: 19, item: "tm_zero_day", n: 1, hidden: true, flag: "item_chester_rows_1" }],
    npcs: [
      { id: "npc_chester_rows_1", x: 8, y: 14, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_chester_rows",
        say: ["Skill Cards on the left, gear on the right, and a beam over your head that has been over somebody's head since 1486."] },
      { id: "npc_chester_rows_2", x: 30, y: 14, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Two streets of shops, one on top of the other, and there is nothing else like it anywhere in the world.",
          "Which is either a triumph or a warning about local planning, depending on your mood."] }
    ]
  }, ro, NW.inside({ "&": "wall_tudor", "S": "shelf", "C": "counter", "Q": "cash_till", "k": "bookcase", "o": "table_round", "l": "stool", "N": "painting", ";": "floor_wood_dark" }));

  // ---------------------------------------------------------- the Roodee --
  const rd = B.canvas(38, 30, '"');
  B.frame(rd, "T", 1);
  rd.fill("g", 35, 15, 3, 4, "v");
  rd.fill("g", 1, 1, 36, 28, "]");
  rd.box("g", 4, 4, 30, 22, "n");
  rd.fill("g", 5, 5, 28, 20, "]");
  rd.fill("g", 30, 15, 5, 4, "v");
  rd.set("g", 8, 6, "N"); rd.set("g", 29, 24, "N");
  rd.fill("g", 6, 22, 8, 2, "$");
  rd.set("g", 10, 21, "q");
  NW.defLand("chester_roodee", {
    name: "The Roodee", region: "west", weatherZone: "west", music: "town_chester", ambience: "town",
    dialogue: "town_chester",
    spawnPoint: { x: 34, y: 17 },
    landmark: { name: "The Roodee", x: 19, y: 15 },
    encounters: { grass: "chester_roodee_grass" },
    warps: NW.edge(37, 15, 4, false, "chester", 3, 20, "right"),
    signs: [
      { x: 8, y: 6, text: ["CHESTER RACECOURSE — the Roodee. Racing here since 1539 and it is the oldest still going anywhere.",
        "A mile and a bit, almost perfectly circular, on the silt of a Roman harbour."] },
      { x: 29, y: 24, text: ["A betting window, shut. A board with three names on it and the odds rubbed out.",
        "One of the names is VEX. The odds beside it have been rubbed out and rewritten four times this week."] }
    ],
    items: [
      { x: 3, y: 27, item: "lucky_coin", n: 1, hidden: true, flag: "item_chester_roodee_1" },
      { x: 35, y: 4, item: "capsule_quick", n: 4, flag: "item_chester_roodee_2" }
    ],
    restPoints: [{ x: 11, y: 22, flag: "meadow_sat_roodee" }],
    npcs: [
      { id: "npc_chester_roodee_desk", x: 26, y: 23, dir: "left", sprite: "npc_shopkeep", behaviour: "still", script: "nw_roodee_betting" },
      { id: "npc_chester_roodee_vex", x: 19, y: 15, dir: "down", sprite: "vex", behaviour: "still", script: "nw_roodee_rematch",
        cond: "postgame_open" }
    ]
  }, rd, NW.land({ "]": "racecourse_turf", "n": "racecourse_rail", "$": "sand", "q": "bench", "N": "noticeboard" }));

  // ---------------------------------------------------------- the Groves --
  const gr = B.canvas(48, 24, ".");
  B.frame(gr, "T", 1);
  gr.fill("g", 23, 0, 3, 2, "=");
  gr.fill("g", 1, 1, 46, 22, ".");
  gr.fill("g", 1, 2, 46, 3, "=");
  gr.fill("g", 1, 5, 46, 1, "t");
  gr.fill("g", 1, 6, 46, 16, "!");
  gr.fill("g", 1, 22, 46, 1, "e");
  gr.fill("g", 20, 6, 10, 16, "?");
  gr.fill("g", 20, 6, 10, 1, "Z");
  gr.set("g", 8, 5, "Q"); gr.set("g", 16, 5, "Q"); gr.set("g", 34, 5, "Q"); gr.set("g", 42, 5, "Q");
  gr.set("g", 12, 3, "q"); gr.set("g", 38, 3, "q");
  gr.set("g", 24, 3, "N"); gr.set("g", 6, 3, "N");
  gr.set("g", 30, 4, "j");
  NW.defLand("chester_groves", {
    name: "The Groves", region: "west", weatherZone: "west", music: "town_chester", ambience: "water",
    dialogue: "town_chester",
    spawnPoint: { x: 24, y: 4 },
    landmark: { name: "The Dee Weir", x: 24, y: 7 },
    encounters: { grass: null, water: "chester_groves_water" },
    fishing: "fish_chester_groves",
    warps: NW.edge(23, 0, 3, true, "chester", 30, 38, "up"),
    signs: [
      { x: 24, y: 3, text: ["THE WEIR — built c.1093 to power the mills, and it has been in the way of salmon ever since.",
        "There is a fish pass. The salmon use it, mostly, and jump the weir anyway because they can."] },
      { x: 6, y: 3, text: ["THE GROVES — bandstand Sundays, boats by the hour, ice cream all year in defiance of the weather."] }
    ],
    items: [
      { x: 3, y: 3, item: "rod_elm", n: 1, hidden: true, flag: "item_chester_groves_1" },
      { x: 45, y: 3, item: "roe", n: 5, flag: "item_chester_groves_2" }
    ],
    npcs: [
      { id: "npc_chester_groves_angler", x: 18, y: 4, dir: "down", sprite: "npc_fisher", behaviour: "still", script: "nw_groves_angler" },
      { id: "npc_chester_groves_walker", x: 32, y: 3, dir: "left", sprite: "npc_tourist", behaviour: "wander", radius: 3,
        say: ["Watch the weir at dusk in April. They go up it. Not through the pass. UP it.",
          "Nobody has ever explained why and I have stopped wanting them to."] }
    ]
  }, gr, NW.land({ "?": "shallows", "Z": "waterfall", "q": "bench", "N": "noticeboard", "j": "boat_dock", "=": "path_flag" }));

  // ------------------------------------------------------ Edgar's Field ---
  const ef = B.canvas(34, 26, ",");
  B.frame(ef, "T", 1);
  ef.fill("g", 15, 0, 4, 2, "=");
  ef.fill("g", 1, 1, 32, 24, ".");
  ef.fill("g", 3, 4, 28, 18, "<");
  B.trees(ef, "ef-t", 26, 3, 4, 28, 18, "T", "y", ["<"]);
  ef.fill("g", 15, 2, 3, 20, "v");
  ef.fill("g", 8, 10, 14, 2, "v");
  ef.fill("g", 6, 8, 8, 8, "K");
  ef.fill("g", 7, 9, 6, 6, "%");
  ef.fill("g", 8, 10, 4, 4, ",");
  ef.fill("g", 12, 11, 4, 1, "v");
  ef.set("g", 10, 12, "M");
  ef.set("g", 14, 13, "N");
  ef.set("g", 24, 18, "q");
  NW.defLand("chester_edgars_field", {
    name: "Edgar's Field", region: "west", weatherZone: "west", music: "town_chester", ambience: "forest",
    dialogue: "town_chester",
    spawnPoint: { x: 16, y: 3 },
    landmark: { name: "Minerva's Shrine", x: 10, y: 12 },
    encounters: { grass: "chester_edgars_field_grass" },
    warps: NW.edge(15, 0, 4, true, "chester", 26, 43, "up"),
    signs: [
      { x: 14, y: 13, text: ["THE SHRINE OF MINERVA", "Carved into the rock of the quarry the legion cut the city out of. Roman. In place. Outdoors. In England.",
        "The only one left in western Europe still in its original spot.",
        "Her owl is on her shoulder. The face has weathered away and the owl has not, which tells you what the wind respects."] }
    ],
    items: [
      { x: 30, y: 22, item: "capsule_night", n: 4, hidden: true, flag: "item_chester_edgars_field_1" },
      { x: 3, y: 22, item: "elixir", n: 2, flag: "item_chester_edgars_field_2" }
    ],
    npcs: [
      { id: "npc_chester_minerva", x: 9, y: 12, dir: "left", sprite: "npc_historian", behaviour: "still", script: "nw_minerva_shrine" }
    ]
  }, ef, NW.land({ "%": "wall_stone_sandstone", "N": "noticeboard", "M": "statue", "q": "bench" }));

  // ------------------------------------------------------------ interiors --
  W.defineMap("chester_care", W.builtin("care_centre", {
    name: "Chester Care Centre", region: "west", dialogue: "town_chester", music: "town_chester",
    warps: NW.exit(7, 11, "chester", 13, 31, "down"),
    npcs: [
      { id: "npc_chester_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal", script: "nw_chester_care_nurse" },
      { id: "npc_chester_care_1", x: 12, y: 5, dir: "left", sprite: "npc_whitehat", behaviour: "still",
        say: ["Raj sends about a third of them back down here before the Northgate.", "They are always cross and they are always better for it."] }
    ]
  }));
  W.defineMap("chester_mart", W.builtin("shop", {
    name: "Chester Mart", region: "west", dialogue: "town_chester", music: "town_chester",
    shop: "shop_chester",
    warps: NW.exit(6, 9, "chester", 12, 11, "down"),
    npcs: [
      { id: "npc_chester_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_chester",
        say: ["Everything, and the good capsules, and a queue of people about to attempt a league gauntlet on an empty bag."] }
    ],
    items: [{ x: 12, y: 2, item: "full_restore", n: 1, hidden: true, flag: "item_chester_mart_1" }]
  }));
  W.defineMap("chester_inn", W.builtin("pub", {
    name: "The Blue Bell", region: "west", dialogue: "town_chester", music: "town_chester",
    warps: NW.exit(6, 11, "chester", 12, 36, "down"),
    npcs: [
      { id: "npc_chester_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Oldest domestic building in the city and the beams will tell you so if you stand still."] },
      { id: "npc_chester_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_whitehat", behaviour: "still",
        say: ["Every one of us failed a gate once. Sue failed Doc's. Twice.", "Do not tell her I told you. Do tell her."] }
    ]
  }));
  W.defineMap("chester_post", W.builtin("shop", {
    name: "Chester Post Office", region: "west", dialogue: "town_chester", music: "town_chester",
    warps: NW.exit(6, 9, "chester", 22, 30, "down"),
    npcs: [
      { id: "npc_chester_postmaster", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "nw_chester_letter" }
    ]
  }));
  const chomes = [
    { id: "chester_house_1", tx: 21, ty: 11, sprite: "npc_granny",
      say: ["I have lived inside a Roman wall my whole life and I have never once thought about it before this week."] },
    { id: "chester_house_2", tx: 22, ty: 36, sprite: "npc_kid",
      say: ["Dad says the league's on tonight and the whole wall'll be full.", "I'm allowed to watch from the Newgate. I'd rather be down on the sand."] },
    { id: "chester_house_3", tx: 35, ty: 35, sprite: "npc_dev",
      say: ["I do platform engineering from a Georgian front room with a Roman wall at the end of the garden.",
        "Everything I build will be gone in six years. The wall has done two thousand."] },
    { id: "chester_house_4", tx: 42, ty: 35, sprite: "npc_walker",
      say: ["Wall circuit every morning, forty minutes, rain or shine.", "I've done it eleven thousand times and it has never once been the same walk."] },
    { id: "chester_house_5", tx: 49, ty: 35, sprite: "npc_historian",
      say: ["Deva Victrix. The Twentieth Legion. Four hundred years in one place.",
        "Nothing we build now is meant to last four hundred years. We do not even build a fence like that."] },
    { id: "chester_house_6", tx: 24, ty: 11, sprite: "npc_shopkeep",
      say: ["Rows trade's been down since the retail park and up since the league.", "I would like the league to be on more often and I have written to say so."] }
  ];
  for (let i = 0; i < chomes.length; i++) {
    const hh = chomes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: "Chester Townhouse", region: "west", dialogue: "town_chester", music: "town_chester",
      warps: NW.exit(5, 9, "chester", hh.tx, hh.ty, "down"),
      npcs: [{ id: "npc_" + hh.id, x: 6, y: 3, dir: "down", sprite: hh.sprite, behaviour: "still", say: hh.say }]
    }));
  }
})();
