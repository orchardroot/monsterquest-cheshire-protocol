// =============================================================
// MonsterQuest v2 — DELAMERE FOREST (region west, Ch.8)
// The old royal forest: a four-exit hub of pine rides and loops,
// Blakemere Moss (a drowned wood on boardwalks), the Old Pale summit
// with its seven-counties plaque, Eddisbury hillfort, the ranger hut,
// and a night glade that is only there when it is dark and you have a lamp.
// Plus R24 Helsby & Manley, R25 the Whitegate Way and R26 the Sandstone Trail.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;

  // `D` becomes a door and `w` a window on the maps that have a building.
  const HUT = { "D": "door_wood", "w": "window", "@": "roof_slate" };

  // ---------------------------------------------------------------- hub ---
  const c = B.canvas(56, 46, ".");
  // A pine wall all the way round with four ways out.
  B.frame(c, "P", 2);
  for (let x = 0; x < 56; x++) { c.set("o", x, 1, "p"); c.set("o", x, 44, "p"); }
  // north ride → R24 to Frodsham; east ride → R25 Whitegate Way;
  // south ride → R26 Sandstone Trail to Tarporley; west → Blakemere boards.
  c.fill("g", 25, 0, 4, 3, "v");
  c.fill("g", 53, 20, 3, 3, "v");
  c.fill("g", 25, 43, 4, 3, "v");
  c.fill("g", 0, 27, 3, 3, "Y");
  c.fill("o", 25, 0, 4, 2, " "); c.fill("o", 25, 44, 4, 2, " ");

  // forest floor — the encounter zone — in broad blocks between the rides
  c.fill("g", 3, 3, 20, 12, "<");
  c.fill("g", 32, 3, 21, 11, "<");
  c.fill("g", 3, 30, 18, 13, "<");
  c.fill("g", 33, 28, 20, 15, "<");
  c.fill("g", 24, 16, 8, 12, ",");

  // the ride network: a long north-south spine and two loops off it
  c.fill("g", 26, 3, 2, 40, "v");
  c.fill("g", 4, 18, 48, 2, "v");        // the main east-west ride
  c.fill("g", 8, 6, 2, 12, "v");         // west loop
  c.fill("g", 8, 6, 18, 2, "v");
  c.fill("g", 40, 6, 2, 12, "v");        // east loop
  c.fill("g", 28, 6, 14, 2, "v");
  c.fill("g", 10, 20, 2, 18, "v");       // south-west loop
  c.fill("g", 10, 36, 17, 2, "v");
  c.fill("g", 44, 20, 2, 16, "v");       // south-east loop
  c.fill("g", 28, 34, 18, 2, "v");
  c.fill("g", 20, 24, 8, 2, "v");        // a cross-ride so the loops interlock
  c.fill("g", 20, 24, 2, 12, "v");

  // Blakemere Moss — black water with a boardwalk out to the middle
  c.fill("g", 2, 22, 16, 12, "!");
  c.fill("g", 3, 23, 14, 10, "!");
  c.fill("g", 2, 21, 17, 1, "e"); c.fill("g", 2, 34, 17, 1, "e");
  c.fill("g", 1, 22, 1, 12, "e"); c.fill("g", 18, 22, 1, 12, "e");
  c.fill("g", 0, 27, 12, 3, "Y");
  c.fill("g", 8, 25, 3, 7, "Y");
  c.set("g", 6, 26, "D"); c.set("g", 14, 31, "D"); c.set("g", 4, 32, "D"); // drowned stumps
  c.set("g", 11, 28, "Q"); c.set("g", 5, 29, "Q");
  c.set("g", 14, 20, "S");
  c.fill("g", 11, 27, 2, 3, "Y");
  c.fill("g", 12, 20, 2, 8, "Y");

  // the Old Pale: a hill in the north-east with a stepped path and a plaque
  c.fill("g", 42, 3, 11, 10, ";");
  c.fill("g", 44, 4, 7, 7, "H");
  c.box("g", 45, 5, 5, 5, "0");
  c.fill("g", 46, 6, 3, 3, ";");
  c.set("g", 47, 7, "n");           // the seven-counties plaque (moor_stone)
  c.fill("g", 47, 10, 1, 8, "v");
  c.set("g", 47, 11, "C");
  c.set("g", 50, 12, "S");
  c.set("g", 44, 8, "M"); c.set("g", 51, 6, "M");

  // Eddisbury hillfort — a double ring of banks in the south-east
  c.box("g", 34, 29, 14, 12, "O");
  c.box("g", 36, 31, 10, 8, "r");
  c.fill("g", 37, 32, 8, 6, ";");
  c.fill("g", 40, 29, 2, 1, "v"); c.fill("g", 40, 31, 2, 1, "v"); c.fill("g", 40, 30, 2, 1, "v");
  c.fill("g", 40, 32, 2, 3, "v");
  c.set("g", 41, 35, "n"); c.set("g", 39, 35, "S");
  c.set("g", 43, 40, "N");

  // the ranger hut, on the main ride
  B.house(c, { x: 29, y: 20, w: 8, h: 4, rh: 2, roof: "@", wall: "#", win: "w", door: "D", doorX: 3 });
  c.fill("g", 29, 24, 8, 1, "v");
  c.set("g", 28, 22, "N");
  c.set("g", 37, 22, "I"); c.set("g", 38, 23, "q");

  // the night glade: a gap in the pines you can only find in the dark
  c.fill("g", 14, 8, 7, 6, ",");
  c.fill("g", 16, 9, 3, 4, "'");
  c.set("g", 17, 11, "E");
  c.set("g", 15, 13, "S");
  c.fill("g", 17, 13, 1, 5, "v");

  // scenery, gathering and pockets
  B.trees(c, "del-a", 60, 4, 4, 18, 10, "P", "p", ["<"]);
  B.trees(c, "del-b", 55, 33, 4, 19, 9, "P", "p", ["<"]);
  B.trees(c, "del-c", 55, 4, 31, 16, 11, "P", "p", ["<"]);
  B.trees(c, "del-d", 55, 34, 29, 18, 13, "P", "p", ["<"]);
  B.trees(c, "del-e", 16, 24, 16, 8, 11, "B", "b", [","]);
  c.scatter("g", "del-mush", "m", 22, 3, 3, 50, 40, ["<"]);
  c.scatter("g", "del-berry", "k", 14, 3, 3, 50, 40, ["<"]);
  c.scatter("g", "del-log", "g", 12, 3, 3, 50, 40, ["<"]);
  c.scatter("g", "del-stump", "u", 10, 3, 3, 50, 40, ["<"]);
  c.set("g", 27, 16, "S"); c.set("g", 27, 40, "S"); c.set("g", 52, 19, "S");
  c.set("g", 24, 17, "q"); c.set("g", 46, 17, "q"); c.set("g", 12, 21, "I");

  NW.defLand("delamere_forest", {
    name: "Delamere Forest", music: "route_west", ambience: "forest", dialogue: "town_delamere_forest",
    spawnPoint: { x: 27, y: 42 },
    landmark: { name: "Delamere Forest", x: 27, y: 19 },
    encounters: { grass: "delamere_forest_grass", water: "delamere_forest_water" },
    fishing: "fish_delamere_forest",
    warps: [].concat(
      NW.edge(25, 0, 4, true, "route_frodsham_delamere", 11, 45, "up"),
      NW.edge(55, 20, 3, false, "route_delamere_winsford", 1, 12, "right"),
      NW.edge(25, 45, 4, true, "route_delamere_tarporley", 24, 1, "down"),
      NW.edge(0, 27, 3, false, "delamere_blakemere", 44, 14, "left"),
      [
        { x: 47, y: 11, to: "delamere_old_pale", tx: 18, ty: 26, dir: "up", kind: "stairs" },
        { x: 17, y: 11, to: "delamere_night_glade", tx: 15, ty: 24, dir: "up", kind: "cave", cond: "time.night || lamp" },
        { x: 41, y: 35, to: "delamere_eddisbury", tx: 16, ty: 22, dir: "up", kind: "stairs" },
        { x: 32, y: 23, to: "delamere_ranger_hut", tx: 7, ty: 10, dir: "up", kind: "door" }
      ]
    ),
    signs: [
      { x: 27, y: 16, text: ["DELAMERE FOREST", "Rides marked in green. Everything else is a suggestion.", "Old Pale summit — 1 mile and up. Blakemere Moss — 1/2 mile and down."] },
      { x: 27, y: 40, text: ["SANDSTONE TRAIL — Tarporley, Beeston, Whitchurch.", "Somebody has added, in marker: 'and then Wales, eventually, if you're stubborn.'"] },
      { x: 52, y: 19, text: ["WHITEGATE WAY — the old Cheshire Lines to Winsford.", "Flat for six miles. The only flat six miles in the county and it used to be a railway."] },
      { x: 14, y: 20, text: ["BLAKEMERE MOSS", "This was a wood. Then it was drained and it was a wood again. Then it was flooded on purpose.", "Every stump you can see was somebody's timber, twice."] },
      { x: 50, y: 12, text: ["THE OLD PALE — seven counties from the top on a clear day.", "The plaque lists them. The plaque is older than two of them."] },
      { x: 15, y: 13, text: ["A ride that isn't on the map, going into pines that are too close together.", "In daylight it is a wall of trees. It is not, at present, daylight."] },
      { x: 39, y: 35, text: ["EDDISBURY HILLFORT", "Iron Age ramparts, a Saxon burh dropped on top, and a car park dropped on that.", "Three thousand years of people deciding this ridge was the safe bit."] },
      { x: 28, y: 22, text: ["FOREST RANGER — Delamere.", "Open when the kettle is on. The kettle is usually on."] },
      { x: 43, y: 40, text: ["MIND THE BANKS. They are older than the trees and considerably more fragile."] }
    ],
    items: [
      { x: 5, y: 5, item: "elixir", n: 1, flag: "item_delamere_forest_1" },
      { x: 44, y: 33, item: "capsule_net", n: 4, flag: "item_delamere_forest_2" },
      { x: 15, y: 41, item: "timber_pine", n: 2, flag: "item_delamere_forest_3" },
      { x: 45, y: 6, item: "tonic_spe", n: 1, hidden: true, flag: "item_delamere_forest_4" },
      { x: 22, y: 12, item: "revive_salts", n: 1, hidden: true, flag: "item_delamere_forest_5" },
      { x: 51, y: 33, item: "capsule_night", n: 3, hidden: true, flag: "item_delamere_forest_6" }
    ],
    catGaps: [
      { x: 23, y: 8, item: "timber_oak", n: 1, flag: "catgap_delamere_1",
        say: "MEADOW goes flat and disappears under the deer fence, and comes back dragging a length of seasoned oak nearly her own length." }
    ],
    restPoints: [{ x: 24, y: 19, flag: "meadow_sat_delamere" }],
    npcs: [
      { id: "npc_delamere_owain", x: 31, y: 24, dir: "down", sprite: "npc_ranger", behaviour: "still", script: "nw_delamere_owain" },
      { id: "npc_delamere_ivy", x: 35, y: 19, dir: "down", sprite: "npc_ranger", behaviour: "path", path: [[35, 19], [43, 19], [43, 17], [35, 17]], pathMode: "loop", trainer: "tr_delamere_forest_2", sight: 3 },
      { id: "npc_delamere_nia", x: 21, y: 30, dir: "right", sprite: "npc_fellrunner", behaviour: "look", radius: 4, trainer: "tr_delamere_forest_3", sight: 4 },
      { id: "npc_delamere_bax", x: 41, y: 12, dir: "down", sprite: "npc_fellrunner", behaviour: "still", trainer: "tr_delamere_forest_4", sight: 3 },
      { id: "npc_delamere_tudur", x: 41, y: 33, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_delamere_eddisbury_1", sight: 0, script: "nw_delamere_tudur" },
      { id: "npc_delamere_emlyn", x: 47, y: 14, dir: "up", sprite: "npc_walker", behaviour: "still", trainer: "tr_delamere_old_pale_1", sight: 3 },
      { id: "npc_delamere_walker", x: 27, y: 30, dir: "down", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Fog came in at four and hasn't shifted, and the light's wrong in it.", "Like somebody's turned the contrast down on one specific wood."] },
      { id: "npc_delamere_kid", x: 12, y: 37, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["My brother says there's a glade you can only find at night.", "My brother also says he can hold his breath for four minutes."] },
      { id: "npc_delamere_dog", x: 33, y: 25, dir: "down", sprite: "dog", behaviour: "wander", radius: 2,
        say: ["The ranger's collie looks at you, looks at the north ride, looks at you.", "It does this three times and then lies down, having discharged its duty."] },
      { id: "npc_delamere_vex_seen", x: 26, y: 12, dir: "up", sprite: "npc_walker", behaviour: "still", cond: "chapter >= 8 && !vex_ally && !choice_vex",
        say: ["Girl in a hoodie went up the north ride two hours back arguing with a phone.", "Wasn't winning."] }
    ],
    triggers: [
      { x: 26, y: 41, w: 4, h: 1, script: "nw_delamere_arrival", once: "delamere_arrival", cond: "!delamere_arrival" },
      { x: 14, y: 8, w: 7, h: 2, script: "nw_delamere_glade_hint", once: "delamere_glade_hint" }
    ]
  }, c, NW.land(HUT));

  // -------------------------------------------------- Blakemere Moss ------
  const bm = B.canvas(48, 30, "!");
  B.frame(bm, "P", 1);
  bm.fill("g", 1, 1, 46, 4, "<");
  bm.fill("g", 1, 25, 46, 4, "<");
  bm.fill("g", 1, 5, 46, 1, "e"); bm.fill("g", 1, 24, 46, 1, "e");
  bm.fill("g", 42, 6, 5, 18, "<");
  bm.fill("g", 41, 6, 1, 18, "e");
  bm.fill("g", 40, 13, 8, 3, "Y");
  // the boardwalk figure-of-eight over the black water
  bm.fill("g", 6, 13, 36, 3, "Y");
  bm.fill("g", 12, 6, 3, 10, "Y");
  bm.fill("g", 12, 6, 18, 3, "Y");
  bm.fill("g", 27, 6, 3, 10, "Y");
  bm.fill("g", 16, 15, 3, 10, "Y");
  bm.fill("g", 16, 22, 16, 3, "Y");
  bm.fill("g", 29, 15, 3, 10, "Y");
  bm.fill("g", 6, 6, 3, 19, "Y");
  bm.fill("g", 6, 6, 7, 3, "Y");
  bm.fill("g", 6, 22, 11, 3, "Y");
  bm.set("g", 21, 14, "S"); bm.set("g", 34, 14, "S");
  bm.set("g", 21, 12, "Q"); bm.set("g", 25, 17, "Q"); bm.set("g", 9, 18, "Q"); bm.set("g", 36, 11, "Q");
  bm.scatter("g", "bm-stump", "D", 26, 2, 6, 44, 18, ["!"]);
  bm.scatter("g", "bm-reed", "a", 30, 2, 6, 44, 18, ["!"]);
  bm.set("g", 3, 3, "q"); bm.set("g", 44, 27, "I");
  B.trees(bm, "bm-t", 26, 2, 1, 44, 4, "P", "p", ["<"]);
  B.trees(bm, "bm-t2", 26, 2, 25, 44, 4, "P", "p", ["<"]);
  NW.defLand("delamere_blakemere", {
    name: "Blakemere Moss", music: "dungeon_bog", ambience: "water", dialogue: "town_delamere_forest",
    spawnPoint: { x: 44, y: 14 },
    landmark: { name: "Blakemere Moss", x: 21, y: 14 },
    encounters: { grass: "delamere_blakemere_grass", water: "delamere_blakemere_water" },
    fishing: "fish_delamere_blakemere",
    warps: NW.edge(47, 13, 3, false, "delamere_forest", 2, 27, "right"),
    signs: [
      { x: 21, y: 14, text: ["BLAKEMERE MOSS — please stay on the boards.", "Under you: peat, twelve feet of it, and eight thousand years of pollen in order."] },
      { x: 34, y: 14, text: ["A reflection board, set up by the ranger service, angled at the water.", "'LOOK DOWN. THE MOSS SHOWS YOU WHAT YOU BROUGHT.'"] }
    ],
    items: [
      { x: 8, y: 7, item: "capsule_net", n: 3, flag: "item_delamere_blakemere_1" },
      { x: 45, y: 26, item: "roe", n: 3, hidden: true, flag: "item_delamere_blakemere_2" },
      { x: 3, y: 27, item: "rod_carbon", n: 1, hidden: true, flag: "item_delamere_blakemere_3" }
    ],
    npcs: [
      { id: "npc_delamere_hafwen", x: 20, y: 15, dir: "up", sprite: "npc_birder", behaviour: "still", trainer: "tr_delamere_blakemere_1", sight: 3 },
      { id: "npc_delamere_boarder", x: 7, y: 20, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["The boards move under you. They're meant to. It's floating on the peat, same as everything.", "Same as this county, if you think about it too long."] }
    ],
    triggers: [
      { x: 33, y: 13, w: 3, h: 3, script: "nw_blakemere_reflection", once: "case_26_reflection" }
    ]
  }, bm, NW.land());

  // ------------------------------------------------------- Old Pale --------
  const op = B.canvas(38, 30, ";");
  B.frame(op, "P", 1);
  op.fill("g", 1, 20, 36, 9, "<");
  op.fill("g", 10, 6, 18, 14, "H");
  op.box("g", 12, 8, 14, 10, "0");
  op.fill("g", 13, 9, 12, 8, ";");
  op.fill("g", 17, 12, 4, 3, "v");
  op.set("g", 18, 13, "n"); op.set("g", 19, 13, "n");
  op.set("g", 18, 11, "S");
  op.fill("g", 18, 15, 2, 12, "v");
  op.fill("g", 18, 18, 2, 1, "C");
  op.set("g", 14, 5, "\\");          // the mast on the pale
  op.set("g", 24, 6, "M"); op.set("g", 11, 16, "M"); op.set("g", 27, 15, "M");
  op.set("g", 16, 22, "q"); op.set("g", 22, 22, "I");
  op.set("g", 20, 25, "S");
  B.trees(op, "op-t", 26, 2, 21, 34, 7, "P", "p", ["<"]);
  op.scatter("g", "op-heather", "H", 24, 3, 3, 32, 16, [";"]);
  NW.defLand("delamere_old_pale", {
    name: "The Old Pale", music: "route_west", ambience: "moor", dialogue: "town_delamere_forest",
    spawnPoint: { x: 18, y: 26 },
    landmark: { name: "The Old Pale", x: 18, y: 13 },
    encounters: { grass: "delamere_old_pale_grass" },
    warps: [
      { x: 18, y: 27, to: "delamere_forest", tx: 47, ty: 12, dir: "down", kind: "stairs" },
      { x: 19, y: 27, to: "delamere_forest", tx: 47, ty: 12, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 18, y: 11, text: ["SEVEN COUNTIES", "Cheshire. Shropshire. Staffordshire. Derbyshire. Lancashire. Flintshire. Denbighshire.",
        "Two of them have been renamed since the plaque was cast. The plaque has not been informed."] },
      { x: 20, y: 25, text: ["THE OLD PALE — the pale was the fence of the medieval deer park.", "Everything inside it belonged to the king. Everything outside it belonged to the king as well, differently."] }
    ],
    items: [
      { x: 4, y: 4, item: "viewpoint_delamere_old_pale", n: 1, flag: "item_delamere_old_pale_1" },
      { x: 34, y: 27, item: "elixir", n: 2, hidden: true, flag: "item_delamere_old_pale_2" }
    ],
    restPoints: [{ x: 22, y: 23, flag: "meadow_sat_old_pale" }],
    npcs: [
      { id: "npc_delamere_plaque_reader", x: 17, y: 15, dir: "up", sprite: "npc_tourist", behaviour: "still",
        say: ["I can see Liverpool. I can see Beeston. I can see the dish at Jodrell.", "The dish has moved. Since Tuesday. It's pointing at Cheshire."] }
    ],
    triggers: [
      { x: 17, y: 12, w: 4, h: 2, script: "nw_old_pale_view", once: "old_pale_view" }
    ]
  }, op, NW.land());

  // ----------------------------------------------------- night glade ------
  const ng = B.canvas(32, 28, ",");
  B.frame(ng, "P", 3);
  ng.fill("g", 4, 4, 24, 20, "<");
  ng.fill("g", 10, 8, 12, 10, "'");
  ng.fill("g", 13, 11, 6, 4, "9");
  ng.set("g", 15, 12, "Q"); ng.set("g", 17, 13, "Q");
  ng.fill("g", 15, 18, 2, 8, "v");
  ng.set("g", 15, 25, "E"); ng.set("g", 16, 25, "E");
  ng.set("g", 12, 9, "&"); ng.set("g", 20, 16, "&"); ng.set("g", 11, 16, "u"); ng.set("g", 21, 9, "u");
  ng.scatter("g", "ng-mush", "m", 18, 5, 5, 22, 18, ["<", "'"]);
  ng.scatter("g", "ng-dead", "D", 10, 5, 5, 22, 18, ["<"]);
  ng.set("g", 18, 20, "S");
  B.trees(ng, "ng-t", 30, 4, 4, 24, 20, "P", "p", ["<"]);
  NW.defLand("delamere_night_glade", {
    name: "The Night Glade", music: "dungeon_bog", ambience: "forest", dialogue: "town_delamere_forest",
    spawnPoint: { x: 15, y: 24 },
    landmark: { name: "The Night Glade", x: 15, y: 13 },
    encounters: { grass: "delamere_night_glade_grass", water: null },
    warps: [
      { x: 15, y: 25, to: "delamere_forest", tx: 17, ty: 12, dir: "down", kind: "cave" },
      { x: 16, y: 25, to: "delamere_forest", tx: 17, ty: 12, dir: "down", kind: "cave" }
    ],
    signs: [
      { x: 18, y: 20, text: ["A ranger's board, face down in the needles, put here and then thought better of.",
        "'NIGHT GLADE — CLOSED FOR SURVEY.' The survey was 1994. Nobody has closed anything since."] }
    ],
    items: [
      { x: 6, y: 6, item: "capsule_night", n: 5, flag: "item_delamere_night_glade_1" },
      { x: 25, y: 21, item: "ghost_lens", n: 1, hidden: true, flag: "item_delamere_night_glade_2" },
      { x: 21, y: 6, item: "timber_pine", n: 3, flag: "item_delamere_night_glade_3" }
    ],
    npcs: [
      { id: "npc_delamere_sian", x: 20, y: 12, dir: "left", sprite: "npc_cultist", behaviour: "still", trainer: "tr_delamere_night_glade_1", sight: 4 },
      { id: "npc_delamere_grinkit", x: 11, y: 13, dir: "down", sprite: "cat_grinkit", behaviour: "still", script: "nw_glade_grinkit" }
    ],
    triggers: [
      { x: 13, y: 16, w: 6, h: 2, script: "nw_glade_first", once: "delamere_glade_entered" }
    ]
  }, ng, NW.land());

  // ------------------------------------------------------- Eddisbury ------
  const ed = B.canvas(34, 26, ";");
  B.frame(ed, "P", 1);
  ed.box("g", 3, 3, 28, 20, "O");
  ed.fill("g", 4, 4, 26, 18, ";");
  ed.box("g", 7, 6, 20, 14, "r");
  ed.fill("g", 8, 7, 18, 12, "<");
  ed.box("g", 12, 9, 10, 8, "F");
  ed.fill("g", 13, 10, 8, 6, ",");
  ed.fill("g", 16, 3, 2, 4, "v");
  ed.fill("g", 16, 6, 2, 4, "v");
  ed.fill("g", 16, 9, 2, 3, "v");
  ed.set("g", 16, 12, "n"); ed.set("g", 17, 12, "n");
  ed.fill("g", 16, 16, 2, 8, "v");
  ed.set("g", 14, 14, "S"); ed.set("g", 20, 20, "S");
  ed.set("g", 10, 12, "M"); ed.set("g", 24, 13, "M");
  ed.scatter("g", "ed-rock", "R", 16, 4, 4, 26, 18, [";", "<"]);
  NW.defLand("delamere_eddisbury", {
    name: "Eddisbury Hillfort", music: "route_west", ambience: "moor", dialogue: "town_delamere_forest",
    spawnPoint: { x: 16, y: 22 },
    landmark: { name: "Eddisbury Hillfort", x: 16, y: 12 },
    encounters: { grass: "delamere_eddisbury_grass" },
    warps: [
      { x: 16, y: 25, to: "delamere_forest", tx: 41, ty: 36, dir: "down", kind: "stairs" },
      { x: 17, y: 25, to: "delamere_forest", tx: 41, ty: 36, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 14, y: 14, text: ["EDDISBURY — the largest hillfort in Cheshire.", "Refortified by Aethelflaed, Lady of the Mercians, in 914, against exactly the sort of thing you would expect."] },
      { x: 20, y: 20, text: ["Two ditches, two banks, one entrance, and a very good view of everybody coming.",
        "Defence in depth. They had it three thousand years ago and we keep rediscovering it."] }
    ],
    items: [
      { x: 5, y: 5, item: "tonic_def", n: 1, flag: "item_delamere_eddisbury_1" },
      { x: 29, y: 21, item: "capsule_kernel", n: 3, hidden: true, flag: "item_delamere_eddisbury_2" }
    ],
    npcs: [
      { id: "npc_delamere_digger", x: 20, y: 12, dir: "left", sprite: "npc_historian", behaviour: "wander", radius: 2,
        say: ["Trench three. We've found a Roman coin, a Saxon post-hole and a Yorkie wrapper from 1981.",
          "All three are archaeology. Only one of them gets in the report."] }
    ]
  }, ed, NW.land());

  // ------------------------------------------------------ ranger hut ------
  const rh = NW.room(14, 12, ",", "#");
  rh.fill("g", 1, 1, 12, 1, "W");
  rh.fill("g", 2, 3, 4, 1, "k"); rh.fill("g", 8, 3, 4, 1, "k");
  rh.fill("g", 2, 6, 3, 1, "t"); rh.set("g", 3, 7, "c");
  rh.fill("g", 9, 6, 3, 1, "N");
  rh.set("g", 11, 8, "f"); rh.set("g", 2, 9, "(");
  NW.doorway(rh, 6, 11, "D");
  NW.defIn("delamere_ranger_hut", {
    name: "Forest Ranger Hut", music: "route_west", ambience: "forest", dialogue: "town_delamere_forest",
    spawnPoint: { x: 6, y: 10 }, region: "west",
    warps: NW.exit(6, 11, "delamere_forest", 32, 24, "down"),
    encounters: { grass: null },
    signs: [
      { x: 9, y: 6, text: ["SIGHTINGS BOARD", "Twelve pins. Nine of them have photographs. Three have a question mark and a date.",
        "The last question mark is dated this week and says only: 'the moss showed me two of us'."] }
    ],
    items: [{ x: 12, y: 2, item: "field_notebook", n: 1, flag: "item_delamere_ranger_hut_1" }],
    npcs: [
      { id: "npc_delamere_hut_ivy", x: 3, y: 6, dir: "right", sprite: "npc_ranger", behaviour: "still", script: "nw_delamere_ivy_hut" },
      { id: "npc_delamere_hut_cat", x: 2, y: 8, dir: "down", sprite: "cat_grinkit", behaviour: "still",
        say: ["A kitten in the ranger's chair, which is mostly grin.", "It is asleep. The grin is not."] }
    ]
  }, rh, NW.inside());

  // =====================================================================
  // R24 — Helsby & Manley: the crag walk, Frodsham to Delamere
  // =====================================================================
  const r24 = B.canvas(26, 46, ",");
  B.frame(r24, "P", 1);
  r24.fill("g", 11, 0, 4, 1, "v"); r24.fill("g", 11, 45, 4, 1, "v");
  r24.fill("g", 2, 2, 22, 42, ".");
  // the crag along the west
  r24.fill("g", 1, 4, 6, 30, "c");
  r24.fill("g", 1, 3, 7, 1, "0");
  r24.fill("g", 7, 6, 1, 26, "1");
  r24.set("g", 7, 18, "C"); r24.set("g", 7, 19, "C");
  r24.fill("g", 4, 16, 3, 4, "<");
  r24.set("g", 5, 17, "E");
  // the lane
  r24.fill("g", 12, 1, 2, 44, "v");
  r24.fill("g", 12, 10, 9, 2, "v");
  r24.fill("g", 19, 10, 2, 16, "v");
  r24.fill("g", 12, 24, 9, 2, "v");
  r24.fill("g", 8, 18, 5, 2, "v");
  // hedged fields, a ford and a marsh corner
  r24.fill("g", 15, 2, 9, 7, "<");
  r24.fill("g", 15, 13, 9, 9, "<");
  r24.fill("g", 15, 28, 9, 15, "<");
  r24.fill("g", 2, 36, 9, 8, "a");
  r24.fill("g", 3, 38, 6, 4, "J");
  r24.fill("g", 8, 30, 4, 4, "9");
  r24.hline("g", 12, 32, 3, "x");
  B.trees(r24, "r24-a", 34, 15, 2, 9, 20, "T", "y", ["<"]);
  B.trees(r24, "r24-b", 30, 15, 28, 9, 15, "B", "b", ["<"]);
  r24.scatter("g", "r24-rock", "R", 14, 2, 4, 6, 30, ["."]);
  r24.set("g", 11, 7, "S"); r24.set("g", 11, 27, "S"); r24.set("g", 14, 43, "S");
  r24.set("g", 14, 20, "q"); r24.set("g", 21, 34, "I");
  NW.defLand("route_frodsham_delamere", {
    name: "Helsby & Manley", music: "route_west", ambience: "forest", dialogue: "town_frodsham",
    spawnPoint: { x: 12, y: 44 },
    landmark: { name: "The Sandstone Trail", x: 12, y: 22 },
    encounters: { grass: "route_frodsham_delamere_grass" },
    warps: [].concat(
      NW.edge(11, 0, 4, true, "frodsham", 30, 43, "up"),
      NW.edge(11, 45, 4, true, "delamere_forest", 25, 2, "down")
    ),
    signs: [
      { x: 11, y: 7, text: ["HELSBY HILL — National Trust. The crag is climbed by people and nested in by peregrines.",
        "The peregrines were here first and are better at it."] },
      { x: 11, y: 27, text: ["SANDSTONE TRAIL", "Frodsham 2. Delamere 3. Beeston 12. Whitchurch 30.", "Passport stamps at the trail office and at Beeston."] },
      { x: 14, y: 43, text: ["MANLEY COMMON — dogs on leads, gates shut, and the third field floods."] }
    ],
    items: [
      { x: 22, y: 5, item: "salve", n: 3, flag: "item_route_frodsham_delamere_1" },
      { x: 5, y: 17, item: "capsule_mesh", n: 3, hidden: true, flag: "item_route_frodsham_delamere_2" },
      { x: 4, y: 41, item: "sloe", n: 4, hidden: true, flag: "item_route_frodsham_delamere_3" }
    ],
    npcs: [
      { id: "npc_r24_pryce", x: 13, y: 15, dir: "down", sprite: "npc_walker", behaviour: "still", trainer: "tr_route_frodsham_delamere_1", sight: 4 },
      { id: "npc_r24_bryn", x: 9, y: 19, dir: "left", sprite: "npc_caver", behaviour: "still", trainer: "tr_route_frodsham_delamere_2", sight: 3 },
      { id: "npc_r24_sheep", x: 18, y: 34, dir: "down", sprite: "sheep", behaviour: "wander", radius: 3,
        say: ["A sheep. It has been standing in the gateway for some time and has plans to continue."] }
    ]
  }, r24, NW.land());

  // =====================================================================
  // R25 — the Whitegate Way: the flat six miles east to Winsford
  // =====================================================================
  const r25 = B.canvas(56, 22, ",");
  B.frame(r25, "T", 1);
  for (let x = 0; x < 56; x++) r25.set("o", x, 0, "y");
  r25.fill("g", 0, 11, 1, 3, "v"); r25.fill("g", 55, 11, 1, 3, "v");
  r25.fill("g", 1, 2, 54, 18, ".");
  // the old formation: cinder path with the rails still under it in places
  r25.fill("g", 1, 11, 54, 3, "v");
  r25.fill("g", 8, 12, 12, 1, "V"); r25.fill("g", 34, 12, 10, 1, "V");
  r25.fill("g", 2, 3, 52, 6, "<");
  r25.fill("g", 2, 16, 52, 4, "<");
  // the old station platform at Whitegate
  r25.fill("g", 24, 9, 10, 2, "6");
  r25.fill("g", 24, 8, 10, 1, "7");
  B.house(r25, { x: 26, y: 5, w: 7, h: 3, rh: 1, roof: "@", wall: "#", win: "w", door: "D", doorX: 3 });
  r25.set("g", 23, 10, "S");
  r25.fill("g", 26, 15, 4, 2, "9");
  B.trees(r25, "r25-a", 46, 2, 3, 52, 6, "B", "b", ["<"]);
  B.trees(r25, "r25-b", 40, 2, 16, 52, 4, "T", "y", ["<"]);
  r25.scatter("g", "r25-berry", "k", 18, 2, 3, 52, 17, ["<"]);
  r25.set("g", 6, 10, "S"); r25.set("g", 48, 14, "S");
  r25.set("g", 15, 14, "q"); r25.set("g", 40, 10, "I");
  NW.defLand("route_delamere_winsford", {
    name: "The Whitegate Way", music: "route_west", ambience: "forest", dialogue: "town_delamere_forest",
    spawnPoint: { x: 2, y: 12 },
    landmark: { name: "Whitegate Station", x: 28, y: 10 },
    encounters: { grass: "route_delamere_winsford_grass" },
    warps: NW.edge(0, 11, 3, false, "delamere_forest", 54, 20, "left").concat(
      NW.edge(55, 11, 3, false, "winsford", 2, 29, "right")
    ),
    signs: [
      { x: 6, y: 10, text: ["WHITEGATE WAY — six miles of the Cheshire Lines Committee, retired.",
        "Cyclists, walkers, horses. In that order on paper and in no order at all in practice."] },
      { x: 23, y: 10, text: ["WHITEGATE STATION — closed to passengers 1931, to salt 1966, to everything 1971.",
        "The platform is still exactly platform height, which is the saddest measurement in England."] },
      { x: 48, y: 14, text: ["WINSFORD 2 MILES", "The path carries on flat, because it was a railway, because everything flat was."] }
    ],
    items: [
      { x: 4, y: 5, item: "capsule_basic", n: 5, flag: "item_route_delamere_winsford_1" },
      { x: 51, y: 18, item: "elixir", n: 1, hidden: true, flag: "item_route_delamere_winsford_2" }
    ],
    npcs: [
      { id: "npc_r25_meilyr", x: 18, y: 13, dir: "left", sprite: "npc_cyclist", behaviour: "look", radius: 5, trainer: "tr_route_delamere_winsford_1", sight: 5 },
      { id: "npc_r25_walker", x: 30, y: 13, dir: "down", sprite: "npc_walker", behaviour: "path", path: [[30, 13], [44, 13]], pathMode: "pingpong",
        say: ["Six miles and you can see all of it. I find that restful and my wife finds it damning."] }
    ]
  }, r25, NW.land(HUT));

  // =====================================================================
  // R26 — Kelsall & the Sandstone Trail: Delamere south to Tarporley
  // =====================================================================
  const r26 = B.canvas(50, 34, ",");
  B.frame(r26, "T", 1);
  for (let x = 0; x < 50; x++) r26.set("o", x, 0, "y");
  r26.fill("g", 23, 0, 3, 1, "v");
  r26.fill("g", 1, 15, 1, 3, "v");
  r26.fill("g", 1, 1, 48, 32, ".");
  // the ridge: a sandstone edge across the middle with a hillfort loop
  r26.fill("g", 6, 10, 38, 2, "0");
  r26.fill("g", 6, 12, 38, 2, "c");
  r26.set("g", 20, 12, "C"); r26.set("g", 20, 13, "C");
  r26.set("g", 33, 12, "C"); r26.set("g", 33, 13, "C");
  // the trail
  r26.fill("g", 24, 1, 2, 9, "v");
  r26.fill("g", 20, 14, 2, 10, "v");
  r26.fill("g", 20, 22, 20, 2, "v");
  r26.fill("g", 38, 14, 2, 10, "v");
  r26.fill("g", 24, 24, 2, 9, "v");
  r26.fill("g", 2, 16, 20, 2, "v");
  r26.fill("g", 20, 8, 14, 2, "v");
  r26.fill("g", 32, 8, 2, 3, "v");
  // Kelsall village corner and the hillfort loop
  r26.fill("g", 3, 3, 14, 6, "<");
  B.house(r26, { x: 5, y: 4, w: 8, h: 3, rh: 1, roof: "@", wall: "#", win: "w", door: "D", doorX: 3 });
  r26.fill("g", 4, 7, 12, 1, "v");
  r26.fill("g", 4, 8, 1, 8, "v");
  r26.box("g", 27, 15, 10, 7, "O");
  r26.fill("g", 28, 16, 8, 5, "<");
  r26.fill("g", 31, 21, 2, 1, "v");
  r26.set("g", 32, 18, "n");
  r26.fill("g", 6, 20, 12, 10, "<");
  r26.fill("g", 40, 25, 8, 7, "<");
  r26.fill("g", 42, 3, 6, 6, "<");
  B.trees(r26, "r26-a", 28, 6, 20, 12, 10, "T", "y", ["<"]);
  B.trees(r26, "r26-b", 22, 40, 25, 8, 7, "B", "b", ["<"]);
  B.trees(r26, "r26-c", 18, 42, 3, 6, 6, "P", "p", ["<"]);
  r26.scatter("g", "r26-hedge", "k", 16, 2, 2, 46, 30, ["<"]);
  r26.set("g", 23, 6, "S"); r26.set("g", 30, 22, "S"); r26.set("g", 26, 30, "S");
  r26.set("g", 22, 20, "q"); r26.set("g", 41, 23, "I");
  NW.defLand("route_delamere_tarporley", {
    name: "Kelsall & the Sandstone Trail", music: "route_west", ambience: "forest", dialogue: "town_tarporley",
    spawnPoint: { x: 24, y: 2 },
    landmark: { name: "The Sandstone Ridge", x: 24, y: 12 },
    encounters: { grass: "route_delamere_tarporley_grass" },
    warps: [].concat(
      NW.edge(23, 0, 3, true, "delamere_forest", 25, 44, "up"),
      NW.edge(24, 33, 2, true, "tarporley", 24, 1, "down")
    ),
    signs: [
      { x: 23, y: 6, text: ["SANDSTONE TRAIL — Delamere 1, Tarporley 3, Beeston 8.", "The ridge does the work. You just have to keep it on your left."] },
      { x: 30, y: 22, text: ["KELSBOROW CASTLE — an Iron Age hillfort, unexcavated.",
        "'Unexcavated' means nobody has been given permission to be curious about it yet."] },
      { x: 26, y: 30, text: ["TARPORLEY 1 MILE. Please shut the gate; the hounds are opinionated."] }
    ],
    items: [
      { x: 44, y: 5, item: "capsule_net", n: 3, flag: "item_route_delamere_tarporley_1" },
      { x: 8, y: 24, item: "timber_birch", n: 2, flag: "item_route_delamere_tarporley_2" },
      { x: 46, y: 30, item: "tonic_atk", n: 1, hidden: true, flag: "item_route_delamere_tarporley_3" }
    ],
    npcs: [
      { id: "npc_r26_gwennol", x: 29, y: 23, dir: "up", sprite: "npc_farmer", behaviour: "still", trainer: "tr_route_delamere_tarporley_1", sight: 4 },
      { id: "npc_r26_walker", x: 21, y: 18, dir: "down", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Thirty-four miles of trail and it never once pretends to be flat.", "That's honest. I'd rather a hill that admits it."] }
    ]
  }, r26, NW.land(HUT));
})();
