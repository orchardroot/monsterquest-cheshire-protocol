// =============================================================
// MonsterQuest v2 — the SOUTH-WEST's routes (WORLD-BIBLE §3):
// R16 Weaver Valley, the Hack Green lane, R31 Croxton flashes,
// R19 Rudheath, R18 Vale Royal Locks, R33 Weaver towpath,
// R34 Marbury avenues and R20 Arley & the Bollin crossing.
// Every one has a loop, a crossing and a pocket you have to want.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const R = B.salt({ "%": "shop_awning", "*": "hay_bale", "q": "picnic_table" });

  function route(id, def, canvas) {
    def.legend = R;
    def.layers = canvas.layers();
    def.region = def.region || "salt";
    def.outdoor = true;
    def.weatherZone = def.weatherZone || def.region;
    def.music = def.music || "route_salt";
    W.defineMap(id, def);
  }
  function edge(list, xs, ys, to, tx, ty, dir, step) {
    for (let i = 0; i < xs.length; i++) {
      list.push({ x: xs[i], y: ys[i], to: to, tx: tx + (step === "x" ? i : 0), ty: ty + (step === "y" ? i : 0), dir: dir, kind: "edge" });
    }
    return list;
  }

  // ================= R16 — Weaver Valley (Nantwich ↔ Winsford) ============
  // The river cannot make its mind up; nor can the county. Two crossings,
  // an aqueduct that carries a canal over a river, and Church Minshull.
  let c = B.canvas(30, 52, ".");
  c.fill("g", 0, 0, 30, 1, "T"); c.fill("g", 0, 51, 30, 1, "T");
  c.fill("g", 0, 0, 1, 52, "T"); c.fill("g", 29, 0, 1, 52, "T");
  for (let x = 0; x < 30; x++) c.set("o", x, 0, "y");
  c.fill("g", 12, 51, 3, 1, "+"); c.fill("g", 12, 0, 3, 1, "+");
  // the Weaver, meandering
  c.snake("g", "weaver-r16", "!", 13, 1, 50, "v", 3, 0.42);
  // banks and the lane along the east
  c.fill("g", 20, 1, 8, 50, ",");
  c.fill("g", 22, 1, 3, 50, "+");
  c.fill("g", 2, 1, 9, 50, ",");
  c.fill("g", 4, 2, 6, 46, "\"");
  // the aqueduct: the canal crosses the river on stone
  c.fill("g", 1, 20, 28, 1, "x");
  c.fill("g", 1, 19, 28, 1, "t");
  c.fill("g", 1, 21, 28, 1, "t");
  c.fill("g", 12, 19, 3, 3, "x");
  // two river crossings
  c.fill("g", 11, 34, 6, 1, "<");
  c.fill("g", 11, 8, 6, 1, "<");
  // Church Minshull: a bridge, a pub, a church, twelve houses and no shop
  c.fill("g", 18, 24, 10, 8, ",");
  B.house(c, { x: 20, y: 25, w: 7, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 3, over: "^" });
  c.fill("g", 19, 29, 9, 1, "_");
  c.set("g", 19, 30, "N"); c.set("g", 27, 30, "L");
  c.box("g", 3, 24, 8, 7, "w");
  c.fill("g", 4, 25, 6, 5, ",");
  c.fill("g", 5, 25, 4, 3, "c");
  c.set("g", 6, 24, "p");
  c.set("g", 6, 29, "d");
  c.fill("g", 6, 30, 1, 4, "+");
  c.set("g", 4, 27, "g");
  // the mill pocket, reachable off the towpath loop
  c.fill("g", 24, 40, 5, 5, ",");
  B.house(c, { x: 24, y: 41, w: 5, h: 3, rh: 1, roof: "R", wall: "V", win: "v", door: "D", doorX: 2, over: "^" });
  c.set("g", 23, 43, "Z");
  c.set("g", 27, 45, "Q"); c.set("g", 12, 12, "Q"); c.set("g", 16, 44, "Q");
  B.trees(c, "r16-w", 28, 2, 2, 9, 48, "T", "y", [","]);
  B.trees(c, "r16-e", 20, 25, 2, 4, 48, "B", "b", [","]);
  c.fill("g", 3, 40, 7, 8, "\"");
  c.fill("g", 25, 4, 4, 8, "\"");
  c.set("g", 22, 3, "P"); c.set("g", 22, 48, "P");
  c.set("g", 8, 18, "z"); c.set("g", 26, 36, "*");
  let ws = [];
  edge(ws, [12, 13, 14], [51, 51, 51], "nantwich", 26, 1, "down", "x");
  edge(ws, [12, 13, 14], [0, 0, 0], "winsford", 24, 38, "up", "x");
  route("route_nantwich_winsford", {
    name: "Weaver Valley", region: "south", weatherZone: "south", music: "route_south",
    ambience: "water", dialogue: "town_nantwich",
    spawnPoint: { x: 13, y: 49 },
    landmark: { name: "The Minshull Aqueduct", x: 13, y: 20 },
    encounters: { grass: "route_nantwich_winsford_grass", water: "route_nantwich_winsford_water" },
    fishing: "fish_route_nantwich_winsford",
    warps: ws,
    signs: [
      { x: 22, y: 48, text: ["WEAVER VALLEY WAY — Nantwich 1, Winsford 6.", "The river is longer than the path because the river has no appointments."] },
      { x: 19, y: 30, text: ["THE BADGER, CHURCH MINSHULL.", "Fire lit from October. Dogs welcome. Boots off, and they mean it."] },
      { x: 22, y: 3, text: ["WINSFORD 1 — mind the flashes.", "Underneath: 'the ground here is four inches lower than the map and the map is from March'."] }
    ],
    items: [
      { x: 5, y: 45, item: "blackberry", n: 4, flag: "item_route_nantwich_winsford_1" },
      { x: 27, y: 6, item: "capsule_brine", n: 3, flag: "item_route_nantwich_winsford_2" },
      { x: 26, y: 44, item: "brine_charm", n: 1, hidden: true, flag: "item_route_nantwich_winsford_3" },
      { x: 9, y: 18, item: "roe", n: 2, hidden: true, flag: "item_route_nantwich_winsford_4" }
    ],
    npcs: [
      { id: "npc_route_nantwich_winsford_elin", x: 23, y: 17, dir: "down", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_route_nantwich_winsford_1", sight: 4 },
      { id: "npc_route_nantwich_winsford_twm", x: 22, y: 44, dir: "left", sprite: "npc_fisher", behaviour: "look", radius: 3, trainer: "tr_route_nantwich_winsford_2", sight: 3 },
      { id: "npc_route_nantwich_winsford_nerys", x: 23, y: 36, dir: "left", sprite: "npc_farmer", behaviour: "look", radius: 4, trainer: "tr_route_nantwich_winsford_3", sight: 4 },
      { id: "npc_route_nantwich_winsford_walker", x: 23, y: 8, dir: "down", sprite: "npc_walker", behaviour: "path", path: [[23, 8], [23, 22]], pathMode: "pingpong",
        say: ["Six miles by the lane, nine by the river, and the river's the one worth doing."] }
    ],
    restPoints: [{ x: 14, y: 21, flag: "bigboy_sat_weaver" }],
    catGaps: [
      { x: 11, y: 30, item: "capsule_kernel", n: 1, flag: "catgap_route_nantwich_winsford_1",
        say: "MEADOW goes under the churchyard railings and comes back out with something that was, until recently, in somebody's offering box." }
    ]
  }, c);

  // ================= The Hack Green lane (Nantwich ↔ Hack Green) ==========
  c = B.canvas(34, 32, ".");
  c.fill("g", 0, 0, 34, 1, "T"); c.fill("g", 0, 31, 34, 1, "T");
  c.fill("g", 0, 0, 1, 32, "T"); c.fill("g", 33, 0, 1, 32, "T");
  for (let x = 0; x < 34; x++) c.set("o", x, 0, "y");
  c.fill("g", 15, 0, 3, 1, "+"); c.fill("g", 15, 31, 3, 1, "+");
  c.fill("g", 15, 1, 3, 30, "+");
  // hedged fields either side with two gated pockets
  c.fill("g", 2, 2, 12, 28, "\"");
  c.fill("g", 19, 2, 13, 28, "\"");
  c.fill("g", 14, 2, 1, 28, "h"); c.fill("g", 18, 2, 1, 28, "h");
  c.set("g", 14, 9, "J"); c.set("g", 18, 21, "J");
  c.fill("g", 6, 6, 7, 6, ".");
  c.fill("g", 21, 18, 8, 7, ".");
  c.set("g", 8, 8, "5"); c.set("g", 25, 21, "z");
  // a pond and a copse
  c.fill("g", 22, 4, 6, 5, "$");
  c.set("g", 21, 6, "Q");
  B.trees(c, "hg-w", 20, 2, 2, 12, 28, "T", "y", ["\""]);
  B.trees(c, "hg-e", 16, 19, 10, 13, 20, "B", "b", ["\""]);
  c.set("g", 19, 3, "P"); c.set("g", 13, 28, "N");
  c.fill("g", 3, 24, 9, 5, ",");
  B.house(c, { x: 4, y: 25, w: 7, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 12, 26, "|");
  ws = [];
  edge(ws, [15, 16, 17], [0, 0, 0], "nantwich", 18, 42, "up", "x");
  edge(ws, [15, 16, 17], [31, 31, 31], "hack_green", 16, 1, "down", "x");
  route("route_nantwich_hackgreen", {
    name: "The Hack Green Lane", region: "south", weatherZone: "south", music: "route_south",
    ambience: "forest", dialogue: "town_nantwich",
    spawnPoint: { x: 16, y: 2 },
    landmark: { name: "Hack Green lane", x: 16, y: 16 },
    encounters: { grass: "route_nantwich_hackgreen_grass" },
    warps: ws,
    signs: [
      { x: 19, y: 3, text: ["SECRET NUCLEAR BUNKER — 2 MILES.", "It is a brown tourist sign. It says SECRET. On a sign. By a road.",
        "Somebody has added a sticker: 'and the fibre goes in at the north end, which is less advertised'."] },
      { x: 13, y: 28, text: ["PRIVATE — FARM ACCESS.", "Under it, newer: 'and site access, and if you're the third lot this month, the gate code has changed'."] }
    ],
    items: [
      { x: 9, y: 9, item: "antidote", n: 3, flag: "item_route_nantwich_hackgreen_1" },
      { x: 27, y: 22, item: "capsule_net", n: 3, hidden: true, flag: "item_route_nantwich_hackgreen_2" }
    ],
    npcs: [
      { id: "npc_route_nantwich_hackgreen_idris", x: 16, y: 11, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_nantwich_hackgreen_1", sight: 4 },
      { id: "npc_route_nantwich_hackgreen_rees", x: 16, y: 24, dir: "up", sprite: "npc_shadow_it", behaviour: "look", radius: 4, trainer: "tr_route_nantwich_hackgreen_2", sight: 4 }
    ]
  }, c);

  // ================= R31 — Croxton flashes (Winsford ↔ Middlewich) ========
  c = B.canvas(54, 30, ".");
  c.fill("g", 0, 0, 54, 1, "T"); c.fill("g", 0, 29, 54, 1, "T");
  c.fill("g", 0, 0, 1, 30, "T"); c.fill("g", 53, 0, 1, 30, "T");
  for (let x = 0; x < 54; x++) c.set("o", x, 0, "y");
  c.fill("g", 1, 14, 52, 3, ":");
  c.fill("g", 1, 13, 52, 1, "-");
  // the flashes — flooded subsidence, on both sides
  c.fill("g", 5, 3, 14, 8, "7");
  c.fill("g", 4, 2, 16, 1, "?"); c.fill("g", 4, 11, 16, 1, "?");
  c.fill("g", 30, 19, 18, 8, "7");
  c.fill("g", 29, 18, 20, 1, "?"); c.fill("g", 29, 27, 20, 1, "?");
  c.set("g", 8, 11, "Q"); c.set("g", 40, 18, "Q"); c.set("g", 16, 2, "Q");
  // the loop: a boardwalk round the north flash rejoining the lane
  c.fill("g", 3, 3, 1, 9, "Y"); c.fill("g", 3, 12, 12, 1, "Y");
  c.fill("g", 20, 2, 1, 11, "Y");
  c.fill("g", 21, 12, 6, 1, "Y");
  c.fill("g", 2, 17, 26, 11, "\"");
  c.fill("g", 22, 2, 26, 10, "\"");
  c.fill("g", 34, 4, 10, 6, ".");
  B.trees(c, "r31-n", 22, 22, 2, 26, 10, "T", "y", ["\""]);
  B.trees(c, "r31-s", 18, 2, 17, 24, 10, "B", "b", ["\""]);
  c.set("g", 37, 6, "*"); c.set("g", 41, 8, "5");
  c.fill("g", 8, 20, 9, 6, ",");
  B.house(c, { x: 9, y: 21, w: 7, h: 3, rh: 1, roof: "R", wall: "V", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 7, 23, "N");
  c.set("g", 4, 12, "P"); c.set("g", 49, 12, "P");
  c.fill("g", 1, 14, 2, 3, ":"); c.fill("g", 51, 14, 2, 3, ":");
  ws = [];
  edge(ws, [0, 0, 0], [14, 15, 16], "winsford", 50, 18, "left", "y");
  edge(ws, [53, 53, 53], [14, 15, 16], "middlewich", 1, 20, "right", "y");
  route("route_middlewich_winsford", {
    name: "Croxton Flashes", region: "salt", music: "route_salt",
    ambience: "water", dialogue: "town_winsford",
    spawnPoint: { x: 2, y: 15 },
    landmark: { name: "Croxton Flashes", x: 12, y: 7 },
    encounters: { grass: "route_middlewich_winsford_grass", water: "route_middlewich_winsford_water" },
    fishing: "fish_winsford",
    warps: ws,
    signs: [
      { x: 4, y: 12, text: ["THE FLASHES", "These lakes are holes. The salt was taken out from underneath and the county came down to fill the gap.",
        "DEEP WATER. COLD WATER. NO BOTTOM WHERE YOU EXPECT ONE."] },
      { x: 49, y: 12, text: ["MIDDLEWICH 1 — Roman salt town, two canals, one enormous festival."] },
      { x: 7, y: 23, text: ["CROXTON FARM — eggs, honey, and a wasps' nest we are aware of."] }
    ],
    items: [
      { x: 36, y: 7, item: "honey", n: 2, flag: "item_route_middlewich_winsford_1" },
      { x: 25, y: 22, item: "tonic", n: 2, flag: "item_route_middlewich_winsford_2" },
      { x: 3, y: 4, item: "hide_plate", n: 1, hidden: true, flag: "item_route_middlewich_winsford_3" }
    ],
    npcs: [
      { id: "npc_route_middlewich_winsford_lowri", x: 21, y: 13, dir: "down", sprite: "npc_birder", behaviour: "still", trainer: "tr_route_middlewich_winsford_1", sight: 3, script: "sw_lowri" },
      { id: "npc_route_middlewich_winsford_dilys", x: 33, y: 15, dir: "left", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_middlewich_winsford_2", sight: 4 },
      { id: "npc_route_middlewich_winsford_meredith", x: 44, y: 14, dir: "left", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_route_middlewich_winsford_3", sight: 4 }
    ],
    restPoints: [{ x: 21, y: 12, flag: "bigboy_sat_croxton" }]
  }, c);

  // ================= R19 — Rudheath & Broken Cross =========================
  c = B.canvas(32, 46, ".");
  c.fill("g", 0, 0, 32, 1, "T"); c.fill("g", 0, 45, 32, 1, "T");
  c.fill("g", 0, 0, 1, 46, "T"); c.fill("g", 31, 0, 1, 46, "T");
  for (let x = 0; x < 32; x++) c.set("o", x, 0, "y");
  c.fill("g", 14, 0, 3, 1, ";"); c.fill("g", 14, 45, 3, 1, ";");
  c.fill("g", 14, 1, 3, 44, ";");
  c.fill("g", 13, 1, 1, 44, "-");
  // heath either side, with the subsidence flashes that appear on revisits
  c.fill("g", 2, 2, 11, 42, "\"");
  c.fill("g", 18, 2, 13, 42, "\"");
  c.fill("g", 4, 8, 8, 6, "7"); c.fill("g", 3, 7, 10, 1, "?"); c.fill("g", 3, 14, 10, 1, "?");
  c.fill("g", 20, 26, 9, 7, "7"); c.fill("g", 19, 25, 11, 1, "?"); c.fill("g", 19, 33, 11, 1, "?");
  c.set("g", 5, 15, "Q"); c.set("g", 25, 25, "Q");
  // the loop: an old track round the east flash
  c.fill("g", 30, 24, 1, 11, ":"); c.fill("g", 18, 35, 13, 1, ":");
  c.fill("g", 18, 23, 13, 1, ":");
  // Broken Cross itself
  c.fill("g", 18, 12, 9, 6, ",");
  c.set("g", 22, 14, "q");
  c.set("g", 21, 15, "i");
  c.set("g", 17, 15, "N");
  B.house(c, { x: 19, y: 16, w: 7, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  B.trees(c, "r19-w", 26, 2, 2, 11, 42, "T", "y", ["\""]);
  B.trees(c, "r19-e", 20, 18, 2, 13, 20, "B", "b", ["\""]);
  c.set("g", 15, 4, "P"); c.set("g", 15, 42, "P");
  c.fill("g", 4, 36, 8, 6, ".");
  c.set("g", 7, 38, "*"); c.set("g", 10, 40, "{");
  ws = [];
  edge(ws, [14, 15, 16], [0, 0, 0], "northwich", 24, 40, "up", "x");
  edge(ws, [14, 15, 16], [45, 45, 45], "middlewich", 20, 1, "down", "x");
  route("route_middlewich_northwich", {
    name: "Rudheath", region: "salt", music: "route_salt",
    ambience: "moor", dialogue: "town_northwich",
    spawnPoint: { x: 15, y: 43 },
    landmark: { name: "Broken Cross", x: 21, y: 15 },
    encounters: { grass: "route_middlewich_northwich_grass" },
    fishing: "fish_winsford",
    warps: ws,
    signs: [
      { x: 17, y: 15, text: ["BROKEN CROSS.", "There was a cross. It broke. Cheshire naming at its most rigorous."] },
      { x: 15, y: 4, text: ["NORTHWICH 1.", "Somebody has crossed out the '1' and written '1 and sinking'."] },
      { x: 15, y: 42, text: ["MIDDLEWICH 2 — Roman road, and it shows: dead straight for a mile and a half."] }
    ],
    items: [
      { x: 6, y: 39, item: "salt_crystal", n: 2, flag: "item_route_middlewich_northwich_1" },
      { x: 29, y: 30, item: "capsule_heavy", n: 2, hidden: true, flag: "item_route_middlewich_northwich_2" }
    ],
    npcs: [
      { id: "npc_route_middlewich_northwich_efa", x: 15, y: 30, dir: "up", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_middlewich_northwich_1", sight: 4 },
      { id: "npc_route_middlewich_northwich_pat", x: 19, y: 24, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_route_middlewich_northwich_2", sight: 4 },
      { id: "npc_route_middlewich_northwich_kid", x: 15, y: 17, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["That lake wasn't there when I started school.", "Nobody's fussed. Everyone here says 'it does that'."] }
    ]
  }, c);

  // ================= R18 — Vale Royal Locks (Winsford ↔ Northwich) ========
  c = B.canvas(32, 50, ".");
  c.fill("g", 0, 0, 32, 1, "T"); c.fill("g", 0, 49, 32, 1, "T");
  c.fill("g", 0, 0, 1, 50, "T"); c.fill("g", 31, 0, 1, 50, "T");
  for (let x = 0; x < 32; x++) c.set("o", x, 0, "y");
  c.fill("g", 14, 0, 3, 1, "t"); c.fill("g", 14, 49, 3, 1, "t");
  // the Weaver navigation, big and straight, with the locks
  c.fill("g", 18, 1, 6, 48, "!");
  c.fill("g", 14, 1, 4, 48, "t");
  c.fill("g", 24, 1, 2, 48, "t");
  c.fill("g", 18, 24, 6, 1, "K"); c.fill("g", 18, 26, 6, 1, "K");
  c.set("g", 17, 25, "e"); c.set("g", 24, 25, "e");
  c.fill("g", 26, 1, 5, 48, ",");
  // river cliffs on the west bank
  c.fill("g", 2, 1, 12, 48, ",");
  c.fill("g", 9, 4, 4, 40, "6");
  c.fill("g", 8, 4, 1, 40, "7");
  c.set("g", 8, 20, "8"); c.set("g", 8, 34, "8");
  c.fill("g", 2, 2, 6, 46, "\"");
  // the abbey site, up on the terrace behind the cliffs
  c.fill("g", 2, 12, 6, 8, ",");
  c.box("g", 3, 13, 5, 6, "w");
  c.set("g", 5, 16, "i");
  B.trees(c, "r18-abbey", 10, 2, 12, 6, 8, "T", "y", [","]);
  c.fill("g", 4, 14, 3, 4, ",");
  c.set("g", 5, 16, "i"); c.set("g", 5, 18, ","); c.set("g", 5, 19, ",");
  c.set("g", 3, 21, "N");
  // crossings: a footbridge and the lock gates themselves
  c.fill("g", 13, 40, 12, 1, "<");
  c.fill("g", 13, 10, 12, 1, "<");
  c.set("g", 15, 15, "Q"); c.set("g", 25, 35, "Q");
  B.trees(c, "r18-e", 22, 26, 2, 5, 46, "B", "b", [","]);
  c.set("g", 15, 46, "P"); c.set("g", 15, 3, "P");
  c.fill("g", 27, 20, 4, 8, "\"");
  c.set("g", 28, 44, "*");
  ws = [];
  edge(ws, [14, 15, 16], [0, 0, 0], "northwich", 1, 26, "up", "y");
  edge(ws, [14, 15, 16], [49, 49, 49], "winsford", 20, 1, "down", "x");
  route("route_winsford_northwich", {
    name: "Vale Royal Locks", region: "salt", music: "route_salt",
    ambience: "water", dialogue: "town_northwich",
    spawnPoint: { x: 15, y: 47 },
    landmark: { name: "Vale Royal Locks", x: 21, y: 25 },
    encounters: { grass: "route_winsford_northwich_grass", water: "route_winsford_northwich_water" },
    fishing: "fish_route_winsford_northwich",
    warps: ws,
    signs: [
      { x: 3, y: 21, text: ["VALE ROYAL ABBEY — founded 1277, dissolved 1538, and now a field with very confident lumps in it.",
        "It was the largest Cistercian church in England. There is a bench."] },
      { x: 15, y: 46, text: ["WINSFORD 1 · NORTHWICH 4.", "The locks are the biggest on the Weaver. The river half needs a boat and a nerve."] },
      { x: 15, y: 3, text: ["NORTHWICH — swing bridges ahead. If the bridge is open, the bridge is open. Nobody argues with the bridge."] }
    ],
    items: [
      { x: 3, y: 44, item: "elixir", n: 1, flag: "item_route_winsford_northwich_1" },
      { x: 28, y: 22, item: "capsule_kernel", n: 2, flag: "item_route_winsford_northwich_2" },
      { x: 6, y: 14, item: "collectible_18", n: 1, hidden: true, flag: "item_route_winsford_northwich_3" }
    ],
    npcs: [
      { id: "npc_route_winsford_northwich_huw", x: 15, y: 30, dir: "right", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_route_winsford_northwich_1", sight: 4 },
      { id: "npc_route_winsford_northwich_gwen", x: 25, y: 14, dir: "left", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_route_winsford_northwich_2", sight: 4 }
    ],
    restPoints: [{ x: 16, y: 25, flag: "bigboy_sat_vale_royal" }]
  }, c);

  // ================= R33 — Weaver towpath (Northwich ↔ Anderton) ==========
  c = B.canvas(30, 34, ",");
  c.fill("g", 0, 0, 30, 1, "T"); c.fill("g", 0, 33, 30, 1, "T");
  c.fill("g", 0, 0, 1, 34, "T"); c.fill("g", 29, 0, 1, 34, "T");
  for (let x = 0; x < 30; x++) c.set("o", x, 0, "y");
  c.fill("g", 14, 0, 3, 1, "t"); c.fill("g", 14, 33, 3, 1, "t");
  c.fill("g", 18, 1, 6, 32, "!");
  c.fill("g", 14, 1, 4, 32, "t");
  c.fill("g", 24, 1, 2, 32, "t");
  c.fill("g", 2, 1, 12, 32, ",");
  c.fill("g", 3, 3, 9, 28, "\"");
  B.trees(c, "r33-w", 26, 2, 1, 12, 32, "T", "y", ["\"", ","]);
  c.fill("g", 26, 1, 3, 32, "\"");
  // a wharf and a moored boat
  c.fill("g", 12, 14, 6, 4, "9");
  c.set("g", 19, 15, "8"); c.set("g", 19, 16, "8");
  c.set("g", 11, 16, "N");
  c.set("g", 15, 24, "Q"); c.set("g", 25, 8, "Q");
  // the cut that climbs up to the lift's upper level (the long way round)
  c.fill("g", 26, 4, 3, 1, ":");
  c.set("g", 5, 20, "5");
  c.set("g", 15, 30, "P");
  ws = [];
  edge(ws, [14, 15, 16], [0, 0, 0], "anderton", 18, 28, "up", "x");
  edge(ws, [14, 15, 16], [33, 33, 33], "northwich", 30, 1, "down", "x");
  route("route_northwich_anderton", {
    name: "Weaver Towpath", region: "salt", music: "route_salt",
    ambience: "water", dialogue: "town_anderton",
    spawnPoint: { x: 15, y: 31 },
    landmark: { name: "Weaver Towpath", x: 15, y: 16 },
    encounters: { grass: "route_northwich_anderton_grass", water: "route_northwich_anderton_water" },
    fishing: "fish_anderton",
    warps: ws,
    signs: [
      { x: 11, y: 16, text: ["DEVONSHIRE DOCK — salt out, coal in, for a hundred and thirty years.", "Now: two swans and a man who is always here and never fishing."] },
      { x: 15, y: 30, text: ["NORTHWICH 1 · ANDERTON BOAT LIFT 2.", "The lift is the only thing in England that lifts a boat fifty feet on purpose."] }
    ],
    items: [
      { x: 4, y: 27, item: "roe", n: 3, flag: "item_route_northwich_anderton_1" },
      { x: 27, y: 28, item: "capsule_net", n: 3, hidden: true, flag: "item_route_northwich_anderton_2" }
    ],
    npcs: [
      { id: "npc_route_northwich_anderton_rhonwen", x: 15, y: 20, dir: "up", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_route_northwich_anderton_1", sight: 4 },
      { id: "npc_route_northwich_anderton_cai", x: 25, y: 9, dir: "left", sprite: "npc_fisher", behaviour: "look", radius: 3, trainer: "tr_route_northwich_anderton_2", sight: 3 },
      { id: "npc_route_northwich_anderton_still", x: 13, y: 16, dir: "right", sprite: "npc_fisher", behaviour: "still",
        say: ["I've sat on this dock since I retired and I have never once put a hook in the water.", "The rod's for the look of the thing. The sitting is the point."] }
    ]
  }, c);

  // ================= R34 — Marbury avenues (Anderton ↔ Great Budworth) ====
  c = B.canvas(44, 26, ".");
  c.fill("g", 0, 0, 44, 1, "T"); c.fill("g", 0, 25, 44, 1, "T");
  c.fill("g", 0, 0, 1, 26, "T"); c.fill("g", 43, 0, 1, 26, "T");
  for (let x = 0; x < 44; x++) c.set("o", x, 0, "y");
  c.fill("g", 1, 12, 42, 3, ":");
  // the beech avenue: two ranks of trees along the lane
  for (let x = 3; x < 41; x += 3) { c.set("g", x, 10, "B"); c.set("o", x, 9, "b"); c.set("g", x, 16, "B"); c.set("o", x, 15, "b"); }
  c.fill("g", 2, 2, 40, 7, "\"");
  c.fill("g", 2, 18, 40, 6, "\"");
  // the canal on the upper level, running with the lane
  B.canal(c, 1, 3, 42, "h", { width: 2, tow: "t", far: "t" });
  c.set("g", 20, 4, "8"); c.set("g", 12, 3, "Q");
  c.fill("g", 8, 19, 10, 5, ".");
  c.fill("g", 28, 19, 10, 5, ".");
  B.trees(c, "r34-s", 22, 2, 18, 40, 6, "T", "y", ["\""]);
  c.set("g", 13, 21, "]"); c.set("g", 33, 22, "[");
  c.set("g", 22, 11, "N"); c.set("g", 5, 17, "q");
  c.fill("g", 1, 12, 2, 3, ":"); c.fill("g", 41, 12, 2, 3, ":");
  ws = [];
  edge(ws, [0, 0, 0], [12, 13, 14], "anderton", 38, 12, "left", "y");
  edge(ws, [43, 43, 43], [12, 13, 14], "great_budworth", 1, 12, "right", "y");
  route("route_anderton_budworth", {
    name: "Marbury Avenues", region: "salt", music: "route_salt",
    ambience: "forest", dialogue: "town_anderton",
    spawnPoint: { x: 2, y: 13 },
    landmark: { name: "The Beech Avenue", x: 22, y: 13 },
    encounters: { grass: "route_anderton_budworth_grass", water: "route_anderton_budworth_grass" },
    fishing: "fish_anderton",
    warps: ws,
    signs: [{ x: 22, y: 11, text: ["MARBURY AVENUES — planted 1840 by a man who knew he would never see them finished.",
      "They are finished. He was right about the not seeing."] }],
    items: [
      { x: 12, y: 21, item: "roasted_acorn", n: 3, flag: "item_route_anderton_budworth_1" },
      { x: 35, y: 6, item: "capsule_night", n: 3, hidden: true, flag: "item_route_anderton_budworth_2" }
    ],
    npcs: [
      { id: "npc_route_anderton_budworth_bedwyr", x: 16, y: 13, dir: "right", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_anderton_budworth_1", sight: 4 },
      { id: "npc_route_anderton_budworth_nesta", x: 32, y: 13, dir: "left", sprite: "npc_ranger", behaviour: "look", radius: 4, trainer: "tr_route_anderton_budworth_2", sight: 4 }
    ],
    restPoints: [{ x: 6, y: 17, flag: "bigboy_sat_marbury" }]
  }, c);

  // ================= R20 — Arley & the Bollin crossing =====================
  c = B.canvas(30, 44, ".");
  c.fill("g", 0, 0, 30, 1, "T"); c.fill("g", 0, 43, 30, 1, "T");
  c.fill("g", 0, 0, 1, 44, "T"); c.fill("g", 29, 0, 1, 44, "T");
  for (let x = 0; x < 30; x++) c.set("o", x, 0, "y");
  c.fill("g", 14, 0, 3, 1, ":"); c.fill("g", 14, 43, 3, 1, ":");
  c.fill("g", 14, 1, 3, 42, ":");
  c.fill("g", 2, 2, 12, 40, "\"");
  c.fill("g", 17, 2, 12, 40, "\"");
  // the Bollin, and a footbridge with one plank of opinion in it
  c.snake("g", "bollin", "!", 3, 26, 24, "h", 2, 0.3);
  c.fill("g", 14, 24, 3, 5, "<");
  c.set("g", 10, 27, "Q"); c.set("g", 22, 28, "Q");
  // the estate: a gated avenue looping east and rejoining
  c.fill("g", 17, 8, 11, 1, ":"); c.fill("g", 27, 8, 1, 12, ":"); c.fill("g", 17, 19, 11, 1, ":");
  c.set("g", 17, 8, "J"); c.set("g", 17, 19, "J");
  c.fill("g", 19, 10, 7, 8, ",");
  B.house(c, { x: 20, y: 11, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 19, 16, "N");
  B.trees(c, "r20-w", 30, 2, 2, 12, 40, "T", "y", ["\""]);
  B.trees(c, "r20-e", 18, 17, 20, 12, 22, "B", "b", ["\""]);
  c.set("g", 15, 40, "P"); c.set("g", 15, 4, "P");
  c.fill("g", 4, 34, 9, 6, ".");
  c.set("g", 7, 36, "{"); c.set("g", 10, 38, "{");
  ws = [];
  edge(ws, [14, 15, 16], [43, 43, 43], "great_budworth", 16, 1, "down", "x");
  B.linkWarp(ws, 15, 0, "lymm", "up", null);
  route("route_budworth_lymm", {
    name: "Arley & the Bollin", region: "salt", music: "route_salt",
    ambience: "forest", dialogue: "town_great_budworth",
    spawnPoint: { x: 15, y: 41 },
    landmark: { name: "The Bollin Crossing", x: 15, y: 26 },
    encounters: { grass: "route_budworth_lymm_grass", water: "route_budworth_lymm_water" },
    fishing: "fish_anderton",
    warps: ws,
    signs: [
      { x: 19, y: 16, text: ["ARLEY ESTATE — PRIVATE DRIVE. WALKERS WELCOME ON THE MARKED PATH.",
        "The marked path is marked with one arrow, in 1974, in a hedge."] },
      { x: 15, y: 40, text: ["GREAT BUDWORTH 1 — prettiest village in Cheshire, and it knows."] },
      { x: 15, y: 4, text: ["LYMM 3 — Badge 6 required beyond the estate boundary. They check. They are very polite about checking."] }
    ],
    items: [
      { x: 6, y: 37, item: "blackberry", n: 4, flag: "item_route_budworth_lymm_1" },
      { x: 24, y: 22, item: "elixir", n: 1, hidden: true, flag: "item_route_budworth_lymm_2" }
    ],
    npcs: [
      { id: "npc_route_budworth_lymm_tegan", x: 15, y: 33, dir: "up", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_budworth_lymm_1", sight: 4 },
      { id: "npc_route_budworth_lymm_mared", x: 15, y: 20, dir: "down", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_route_budworth_lymm_2", sight: 4 }
    ]
  }, c);
})();
