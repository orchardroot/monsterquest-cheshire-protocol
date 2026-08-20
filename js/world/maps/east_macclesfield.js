// =============================================================
// MonsterQuest v2 — MACCLESFIELD (region east, Ch.1 start town)
// Silk town on the hill: Park Green and Alder Labs, Paradise Mill and
// the Silk Museum, the 108 Steps up to St Michael's, Treacle Market in
// Market Place, the Hovis mill on the Macclesfield Canal.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const TOWN = B.TOWN;

  // ---------------------------------------------------------------- town --
  const c = B.canvas(56, 44, ".");

  // north fringe treeline with a gap for the canal path to Bollington
  c.fill("g", 0, 0, 56, 2, "T");
  for (let x = 0; x < 56; x++) c.set("o", x, 0, "y");
  c.fill("g", 25, 0, 4, 2, "=");
  c.fill("o", 25, 0, 4, 1, " ");
  // west and east edges
  c.fill("g", 0, 2, 1, 42, "T"); c.fill("g", 55, 2, 1, 42, "T");
  c.fill("g", 0, 16, 1, 3, "="); // west exit to Prestbury
  // south fringe
  c.fill("g", 0, 43, 56, 1, "T");

  // ---- upper town: St Michael's, the churchyard, Market Place ----
  c.fill("g", 2, 2, 53, 13, ",");
  // churchyard wall
  c.box("g", 30, 3, 20, 12, "w");
  c.fill("g", 31, 4, 18, 10, ",");
  // St Michael's church
  B.house(c, { x: 34, y: 4, w: 11, h: 8, rh: 3, roof: "p", wall: "c", win: "C", door: "d", doorX: 5 });
  c.set("g", 39, 3, "p");
  c.scatter("g", "macc-graves", "g", 16, 31, 12, 18, 2, [","]);
  c.set("g", 40, 14, "d"); c.set("g", 39, 14, "w"); c.set("g", 41, 14, "w");
  c.fill("g", 39, 12, 3, 3, "_");
  c.set("g", 33, 13, "i");
  // Market Place (Treacle Market)
  c.fill("g", 6, 3, 22, 12, "=");
  for (let i = 0; i < 4; i++) { c.fill("g", 8 + i * 5, 6, 3, 1, "A"); c.fill("o", 8 + i * 5, 5, 3, 1, "a"); }
  for (let i = 0; i < 4; i++) { c.fill("g", 8 + i * 5, 10, 3, 1, "A"); c.fill("o", 8 + i * 5, 9, 3, 1, "a"); }
  c.set("g", 17, 12, "/"); c.set("g", 6, 12, "L"); c.set("g", 27, 12, "L");
  c.set("g", 5, 7, "N");
  // town hall / mart / outfitters on the market's north side
  B.house(c, { x: 6, y: 2, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 18, y: 2, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });

  // ---- the 108 Steps: market/church level down to the main street ----
  c.fill("g", 28, 3, 2, 12, "s");
  c.fill("g", 28, 15, 2, 3, "=");

  // ---- main street (Chestergate/Mill Street) ----
  c.fill("g", 2, 16, 53, 3, "=");
  c.fill("g", 2, 15, 53, 1, "-");
  c.fill("g", 2, 19, 53, 1, "-");
  for (let x = 4; x < 54; x += 7) { c.set("g", x, 15, "L"); c.set("g", x + 3, 19, "L"); }
  c.set("g", 8, 19, "O"); c.set("g", 12, 15, "n"); c.set("g", 20, 19, "j"); c.set("g", 44, 15, "u");
  c.set("g", 16, 19, "H"); c.set("g", 17, 19, "I");

  // shops on the north side of the street (Care centre, Inn)
  B.house(c, { x: 3, y: 11, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 44, y: 10, w: 10, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4, over: "^" });
  c.set("g", 43, 13, "N");

  // ---- south of the street: Park Green, Alder Labs, Paradise Mill ----
  c.fill("g", 2, 20, 53, 12, ",");
  c.fill("g", 4, 20, 48, 1, "=");
  // Park Green itself
  c.fill("g", 3, 21, 12, 8, ".");
  B.trees(c, "macc-green", 9, 3, 21, 12, 8, "B", "b", ["."]);
  c.fill("g", 6, 24, 6, 2, "_");
  c.set("g", 7, 26, "H"); c.set("g", 10, 26, "H"); c.set("g", 8, 23, "q");
  // Alder Labs — a converted silk mill off Park Green
  B.house(c, { x: 4, y: 29, w: 12, h: 4, rh: 1, roof: "R", wall: "V", win: "v", door: "D", doorX: 5, over: "^" });
  c.set("g", 5, 29, "M");
  c.set("g", 3, 31, "N");
  // Paradise Mill
  B.house(c, { x: 18, y: 22, w: 12, h: 6, rh: 1, roof: "R", wall: "V", win: "v", door: "D", doorX: 5, over: "^" });
  c.set("g", 19, 22, "M"); c.set("g", 28, 22, "M");
  c.set("g", 17, 27, "N");
  // Silk Museum
  B.house(c, { x: 32, y: 22, w: 10, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 31, 26, "N");
  c.fill("g", 30, 27, 14, 1, "_");
  // weaver cottages (houses 1-4 + Jim's flat)
  B.house(c, { x: 44, y: 21, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: "^" });
  c.set("g", 51, 24, "@");
  B.house(c, { x: 44, y: 27, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: "^" });
  c.set("g", 51, 30, "D");
  c.fill("g", 43, 25, 12, 1, "-");
  c.fill("g", 43, 31, 12, 1, "-");
  c.set("g", 43, 21, "L"); c.set("g", 43, 27, "L");

  // ---- the canal (Macclesfield Canal) along the south ----
  c.fill("g", 2, 33, 53, 1, "t");
  c.fill("g", 2, 34, 53, 3, "~");
  c.fill("g", 2, 37, 53, 1, "t");
  c.fill("g", 2, 38, 53, 5, ",");
  c.set("g", 20, 34, "e"); c.set("g", 21, 34, "e");
  // Sutton bridge over the cut
  c.fill("g", 24, 33, 3, 5, "x");
  c.fill("g", 24, 32, 3, 1, "=");
  c.fill("g", 24, 38, 3, 4, "+");
  // Hovis mill
  B.house(c, { x: 30, y: 28, w: 12, h: 5, rh: 1, roof: "R", wall: "V", win: "v", door: "D", doorX: 5, over: "^" });
  c.set("g", 31, 28, "M"); c.set("g", 40, 28, "M");
  c.set("g", 36, 33, "Z");
  c.set("g", 29, 32, "N");
  // lock and a hidden lock-keeper's garden
  c.set("g", 8, 34, "K"); c.set("g", 8, 36, "K");
  c.fill("g", 3, 38, 8, 3, "\"");
  c.set("g", 5, 39, "l"); c.set("g", 9, 40, "o");
  B.trees(c, "macc-canal", 14, 4, 38, 46, 4, "T", "y", [","]);
  c.fill("g", 46, 38, 3, 5, "+");
  c.fill("g", 46, 43, 3, 1, "+"); // south-east exit to Tegg's Nose
  // canal cottage on the far bank
  B.house(c, { x: 12, y: 39, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 11, 42, 10, 1, "+");
  // rough ground and tall grass pockets
  c.fill("g", 22, 38, 6, 3, "\"");
  c.fill("g", 50, 3, 4, 8, "\"");
  c.set("g", 52, 6, "z");
  c.fill("g", 2, 2, 3, 3, "\"");

  // station on the west, below the steps
  B.house(c, { x: 2, y: 21, w: 1, h: 1, rh: 0, roof: ".", wall: ".", win: null, door: ".", doorX: 0 });
  c.fill("g", 16, 30, 12, 2, "_");
  B.house(c, { x: 17, y: 29, w: 10, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 16, 31, "P");

  W.defineMap("macclesfield", {
    name: "Macclesfield", region: "east", outdoor: true, music: "town_macc", weatherZone: "east",
    ambience: "town", dialogue: "town_macclesfield",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 50, y: 25 },
    healPoint: { x: 7, y: 15 },
    landmark: { name: "Macclesfield", x: 28, y: 16 },
    encounters: { grass: "macclesfield_grass", water: null },
    fishing: "fish_macclesfield",
    warps: [
      // interiors
      { x: 51, y: 24, to: "macclesfield_home", tx: 7, ty: 12, dir: "up", kind: "door" },
      { x: 51, y: 30, to: "macclesfield_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 46, y: 24, to: "macclesfield_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 46, y: 30, to: "macclesfield_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 48, y: 14, to: "macclesfield_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 7, y: 14, to: "macclesfield_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 10, y: 4, to: "macclesfield_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 21, y: 4, to: "macclesfield_silk_outfitters", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 9, y: 32, to: "macclesfield_alder_labs", tx: 10, ty: 14, dir: "up", kind: "door" },
      { x: 23, y: 27, to: "macclesfield_paradise_mill", tx: 11, ty: 15, dir: "up", kind: "door" },
      { x: 36, y: 26, to: "macclesfield_silk_museum", tx: 9, ty: 12, dir: "up", kind: "door" },
      { x: 39, y: 11, to: "macclesfield_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 21, y: 31, to: "macclesfield_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 15, y: 41, to: "macclesfield_house_4", tx: 5, ty: 8, dir: "up", kind: "door" },
      // edges
      { x: 25, y: 0, to: "route_macc_bollington", tx: 15, ty: 44, dir: "up", kind: "edge" },
      { x: 26, y: 0, to: "route_macc_bollington", tx: 16, ty: 44, dir: "up", kind: "edge" },
      { x: 27, y: 0, to: "route_macc_bollington", tx: 17, ty: 44, dir: "up", kind: "edge" },
      { x: 28, y: 0, to: "route_macc_bollington", tx: 17, ty: 44, dir: "up", kind: "edge" },
      { x: 0, y: 16, to: "route_macc_prestbury", tx: 44, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 17, to: "route_macc_prestbury", tx: 44, ty: 13, dir: "left", kind: "edge" },
      { x: 0, y: 18, to: "route_macc_prestbury", tx: 44, ty: 14, dir: "left", kind: "edge" },
      { x: 46, y: 43, to: "route_macc_teggs", tx: 5, ty: 1, dir: "down", kind: "edge" },
      { x: 47, y: 43, to: "route_macc_teggs", tx: 6, ty: 1, dir: "down", kind: "edge" },
      { x: 48, y: 43, to: "route_macc_teggs", tx: 7, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 5, y: 7, text: ["MARKET PLACE — Treacle Market, last Sunday of the month.", "Stalls: silk, cheese, opinions."] },
      { x: 43, y: 13, text: ["THE OLD KING'S HEAD", "Rooms. Pie. No Wi-Fi, and proud of it."] },
      { x: 3, y: 31, text: ["ALDER LABS", "Applied alignment. Deliveries to the yard.", "A hand-written card underneath: 'Yes, it was a silk mill. No, you can't see the looms.'"] },
      { x: 17, y: 27, text: ["PARADISE MILL — 26 Jacquard handlooms, still strung.", "Mind the bobbin racks."] },
      { x: 31, y: 26, text: ["SILK MUSEUM", "Open ten till four. The pattern books are not for sale, Tam."] },
      { x: 29, y: 32, text: ["HOVIS MILL — private wharf.", "The weathervane is pointing the wrong way again."] },
      { x: 16, y: 31, text: ["MACCLESFIELD STATION", "Stockport, Manchester, and away south.", "The 108 Steps start behind you and do not apologise."] }
    ],
    items: [
      { x: 4, y: 40, item: "salve", n: 1, flag: "item_macclesfield_1" },
      { x: 52, y: 6, item: "capsule_basic", n: 3, flag: "item_macclesfield_2" },
      { x: 24, y: 40, item: "blackberry", n: 2, hidden: true, flag: "item_macclesfield_3" },
      { x: 51, y: 40, item: "tonic", n: 1, hidden: true, flag: "item_macclesfield_4" }
    ],
    catGaps: [
      { x: 43, y: 26, item: "silk_scarf", n: 1, flag: "catgap_macclesfield_1", say: "MEADOW goes under the railings, comes back with something soft in her mouth, and refuses to explain." }
    ],
    npcs: [
      { id: "npc_macclesfield_bobbin", x: 49, y: 25, dir: "down", sprite: "mrs_bobbin", behaviour: "still", script: "east_macc_bobbin",
        say: ["Your mother's out. I've fed the big one twice, so he'll tell you he's starving."] },
      { id: "npc_macclesfield_tam", x: 12, y: 6, dir: "down", sprite: "treacle_tam", behaviour: "still", trainer: "tr_macclesfield_2", sight: 0,
        script: "east_macc_tam" },
      { id: "npc_macclesfield_bronwen", x: 24, y: 28, dir: "down", sprite: "npc_weaver", behaviour: "still", script: "east_macc_bronwen" },
      { id: "npc_macclesfield_ros", x: 29, y: 8, dir: "left", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_macclesfield_3", sight: 3 },
      { id: "npc_macclesfield_stall_1", x: 9, y: 6, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Treacle toffee. Named for the day a cart went over and the whole street tasted of it for a week."] },
      { id: "npc_macclesfield_stall_2", x: 19, y: 6, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Silk offcuts, three for a pound.", "Don't ask what they were offcut from."] },
      { id: "npc_macclesfield_kid", x: 22, y: 13, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["A hundred and eight steps. I've done it in forty seconds.", "That's a lie. I've done it in ninety and been sick."] },
      { id: "npc_macclesfield_walker", x: 34, y: 17, dir: "down", sprite: "npc_walker", behaviour: "path", path: [[34, 17], [50, 17], [50, 20], [34, 20]], pathMode: "loop",
        say: ["Up the hill, down the hill. It's the only flat thing about this town: nothing."] },
      // (14,33) sealed the towpath: there the cut is one tile wide with the mill
      // wall behind it, so he read as a gate. Moved east to where the bank opens
      // out and you can step round him.
      { id: "npc_macclesfield_angler", x: 18, y: 33, dir: "down", sprite: "npc_fisher", behaviour: "still",
        say: ["Cut's four foot deep and full of bicycles.", "And perch. Mostly bicycles."] },
      { id: "npc_macclesfield_granny", x: 32, y: 15, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["The masts have been humming. Not loud. Just... agreed with each other."] },
      { id: "npc_macclesfield_vicar", x: 40, y: 13, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["St Michael's has been here since 1278 and the roof has opinions about it."] },
      { id: "npc_macclesfield_dev", x: 47, y: 16, dir: "left", sprite: "npc_dev", behaviour: "wander", radius: 2,
        say: ["I commute to Wilmslow to sit in a café and write things that run in Ireland.", "Modern life."] },
      { id: "npc_macclesfield_boater", x: 30, y: 33, dir: "down", sprite: "npc_boater", behaviour: "path", path: [[30, 37], [48, 37]], pathMode: "pingpong",
        say: ["Four mile an hour. Any faster and you wash the bank away and the swans write to the papers."] }
    ],
    restPoints: [{ x: 8, y: 26, flag: "bigboy_sat_macclesfield" }],
    triggers: [
      { x: 24, y: 20, w: 3, h: 1, script: "east_macc_first_step", once: "macc_first_step", cond: "!macc_first_step" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  // Jim's flat: two-up two-down off the weaver rows. The cats start here.
  W.defineMap("macclesfield_home", W.builtin("house_large", {
    name: "Home", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    warps: [
      { x: 7, y: 13, to: "macclesfield", tx: 51, ty: 25, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "macclesfield", tx: 51, ty: 25, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_mum", x: 10, y: 4, dir: "down", sprite: "mum", behaviour: "still", script: "east_home_mum" },
      { id: "cat_meadow_home", x: 10, y: 9, dir: "down", sprite: "cat_meadow", behaviour: "still", script: "east_home_meadow", cond: "!cats_joined" },
      { id: "cat_bigboy_home", x: 11, y: 9, dir: "down", sprite: "cat_bigboy", behaviour: "still", script: "east_home_bigboy", cond: "!cats_joined" }
    ],
    signs: [{ x: 15, y: 11, text: ["A stairs you never go up. The bulb went in 2019."] }],
    items: [{ x: 1, y: 3, item: "salve", n: 2, flag: "item_macclesfield_home_1" }],
    spawnPoint: { x: 7, y: 12 }
  }));

  W.defineMap("macclesfield_care", W.builtin("care_centre", {
    name: "Macclesfield Care Centre", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    warps: [
      { x: 7, y: 11, to: "macclesfield", tx: 7, ty: 15, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "macclesfield", tx: 7, ty: 15, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Bring them here whatever state they're in. Nothing walks in here beyond helping."] },
      { id: "npc_macclesfield_care_1", x: 2, y: 5, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Sat here three hours once, waiting on news about a cat.", "News changed. It does that, sometimes."] }
    ]
  }));

  W.defineMap("macclesfield_mart", W.builtin("shop", {
    name: "Macclesfield Mart", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    shop: "shop_macclesfield",
    warps: [
      { x: 6, y: 9, to: "macclesfield", tx: 10, ty: 5, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "macclesfield", tx: 10, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_macclesfield",
        say: ["Salves, capsules, and a chart on the wall nobody reads until it's too late."] }
    ]
  }));

  W.defineMap("macclesfield_silk_outfitters", W.builtin("shop", {
    name: "Silk Outfitters", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    shop: "shop_macclesfield_outfitters",
    warps: [
      { x: 6, y: 9, to: "macclesfield", tx: 21, ty: 5, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "macclesfield", tx: 21, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_outfitter", x: 1, y: 5, dir: "down", sprite: "npc_weaver", behaviour: "still", shop: "shop_macclesfield_outfitters",
        say: ["Scarves woven here. Jackets woven elsewhere and I'd rather not say where."] }
    ],
    items: [{ x: 12, y: 2, item: "silk_scarf", n: 1, flag: "item_macclesfield_outfitters_1" }]
  }));

  W.defineMap("macclesfield_inn", W.builtin("pub", {
    name: "The Old King's Head", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    warps: [
      { x: 6, y: 11, to: "macclesfield", tx: 48, ty: 15, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "macclesfield", tx: 48, ty: 15, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room's eight quid and the pipes sing. Sleep through it and you'll wake up in a different part of the day."] },
      { id: "npc_macclesfield_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Fella came in last week and ordered in a voice exactly like the curator's.", "Wasn't the curator."] }
    ]
  }));

  W.defineMap("macclesfield_station", W.builtin("station", {
    name: "Macclesfield Station", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    station: { name: "Macclesfield" },
    warps: [
      { x: 8, y: 11, to: "macclesfield", tx: 21, ty: 32, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "macclesfield", tx: 21, ty: 32, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["Line's open. Your railcard isn't. Come back when somebody in Crewe has signed it."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "The board flickers, resets, and shows the same four minutes again."] }]
  }));

  W.defineMap("macclesfield_church", W.builtin("church", {
    name: "St Michael's", region: "east", dialogue: "town_macclesfield", music: "town_macc",
    warps: [
      { x: 6, y: 13, to: "macclesfield", tx: 39, ty: 12, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "macclesfield", tx: 39, ty: 12, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_verger", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["The Legh chapel's older than the town's opinion of itself.", "Sit if you like. Nobody minds sitting."] }
    ],
    items: [{ x: 1, y: 11, item: "capsule_basic", n: 1, hidden: true, flag: "item_macclesfield_church_1" }]
  }));

  // Alder Labs — the converted silk mill off Park Green
  const lab = B.canvas(22, 16, "_");
  lab.box("g", 0, 0, 22, 16, "#");
  lab.fill("g", 1, 0, 20, 1, "^");
  lab.fill("g", 1, 1, 20, 1, "#");
  lab.fill("g", 2, 1, 4, 1, "W"); lab.fill("g", 9, 1, 4, 1, "W"); lab.fill("g", 16, 1, 4, 1, "W");
  lab.fill("g", 2, 3, 18, 1, "b");
  lab.fill("g", 2, 6, 6, 1, "b"); lab.fill("g", 14, 6, 6, 1, "b");
  lab.fill("g", 9, 5, 4, 3, "c");
  lab.set("g", 3, 9, "s"); lab.set("g", 18, 9, "s");
  lab.fill("g", 2, 12, 3, 1, "t"); lab.fill("g", 17, 12, 3, 1, "t");
  lab.set("g", 3, 13, "h"); lab.set("g", 18, 13, "h");
  lab.set("g", 10, 15, "D"); lab.set("g", 11, 15, "D");
  lab.fill("g", 10, 13, 2, 2, "M");
  W.defineMap("macclesfield_alder_labs", {
    name: "Alder Labs", region: "east", outdoor: false, music: "town_macc", ambience: "industrial",
    dialogue: "town_macclesfield",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_lab", "b": "lab_bench",
      "c": "capsule_case", "s": "server_rack", "t": "table", "h": "chair", "D": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: lab.layers(),
    spawnPoint: { x: 10, y: 14 },
    warps: [
      { x: 10, y: 15, to: "macclesfield", tx: 9, ty: 33, dir: "down", kind: "door" },
      { x: 11, y: 15, to: "macclesfield", tx: 9, ty: 33, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_alder", x: 10, y: 9, dir: "down", sprite: "alder", behaviour: "still", script: "east_lab_alder" },
      { id: "npc_macclesfield_vex", x: 14, y: 9, dir: "left", sprite: "vex", behaviour: "still", script: "east_lab_vex", cond: "!starter_chosen" },
      { id: "npc_macclesfield_lab_tech", x: 4, y: 9, dir: "right", sprite: "npc_dev", behaviour: "still",
        say: ["Three agents on one hosted endpoint. Cheaper that way.", "Cheaper is a decision. Everybody forgets it's a decision."] }
    ],
    signs: [
      { x: 3, y: 3, text: ["WHITEBOARD", "A stack diagram with four boxes. The fourth has been wiped so often the paint has gone grey."] },
      { x: 18, y: 3, text: ["A framed photograph: two people and a very small server, laughing.", "Someone has turned it to face the wall, then turned it back."] }
    ],
    items: [{ x: 19, y: 12, item: "capsule_basic", n: 5, flag: "item_alder_labs_1" }],
    encounters: { grass: null }
  });

  // Paradise Mill — Jacquard handlooms, bobbin racks, Weaver Bronwen's garden
  const mill = B.canvas(24, 17, "F");
  mill.box("g", 0, 0, 24, 17, "V");
  mill.fill("g", 1, 0, 22, 1, "^");
  mill.fill("g", 1, 1, 22, 1, "V");
  for (let x = 2; x < 22; x += 4) mill.fill("g", x, 1, 2, 1, "v");
  for (let y = 3; y < 12; y += 3) { mill.fill("g", 2, y, 8, 1, "L"); mill.fill("g", 13, y, 8, 1, "L"); }
  mill.fill("g", 2, 13, 3, 1, "R"); mill.fill("g", 19, 13, 3, 1, "R");
  mill.set("g", 22, 15, "K");
  mill.set("g", 11, 16, "D"); mill.set("g", 12, 16, "D");
  mill.fill("g", 11, 14, 2, 2, "M");
  mill.set("g", 6, 15, "K"); mill.set("g", 17, 15, "K");
  W.defineMap("macclesfield_paradise_mill", {
    name: "Paradise Mill", region: "east", outdoor: false, music: "town_macc", ambience: "industrial",
    dialogue: "town_macclesfield",
    legend: {
      "V": "mill_wall", "^": "wall_interior_top", "v": "mill_window", "F": "floor_wood_dark",
      "L": "loom", "R": "shelf", "K": "silk_bolt", "D": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: mill.layers(),
    spawnPoint: { x: 11, y: 15 },
    warps: [
      { x: 11, y: 16, to: "macclesfield", tx: 23, ty: 28, dir: "down", kind: "door" },
      { x: 12, y: 16, to: "macclesfield", tx: 23, ty: 28, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_mill_1", x: 11, y: 12, dir: "down", sprite: "npc_weaver", behaviour: "still", trainer: "tr_macclesfield_1", sight: 0 },
      { id: "npc_macclesfield_mill_2", x: 4, y: 12, dir: "right", sprite: "npc_weaver", behaviour: "wander", radius: 2,
        say: ["Twenty-six looms and every one of them punch-card driven.", "First programmable thing in Cheshire and it made ties."] }
    ],
    signs: [
      { x: 19, y: 13, text: ["PATTERN BOOK — MISSING", "A card in the case: 'Removed for conservation.'", "Nobody at the museum wrote that card."] }
    ],
    items: [{ x: 22, y: 15, item: "silk_cocoon", n: 1, hidden: true, flag: "item_paradise_mill_1" }],
    encounters: { grass: null }
  });

  // Silk Museum
  const mus = B.canvas(20, 14, "_");
  mus.box("g", 0, 0, 20, 14, "#");
  mus.fill("g", 1, 0, 18, 1, "^");
  mus.fill("g", 1, 1, 18, 1, "#");
  mus.fill("g", 3, 1, 3, 1, "W"); mus.fill("g", 13, 1, 3, 1, "W");
  mus.fill("g", 2, 3, 5, 1, "K"); mus.fill("g", 13, 3, 5, 1, "K");
  mus.fill("g", 2, 6, 5, 1, "P"); mus.fill("g", 13, 6, 5, 1, "P");
  mus.fill("g", 8, 5, 4, 3, "L");
  mus.fill("g", 2, 9, 5, 1, "P"); mus.fill("g", 13, 9, 5, 1, "P");
  mus.set("g", 1, 12, "C"); mus.set("g", 2, 12, "C");
  mus.set("g", 9, 13, "D"); mus.set("g", 10, 13, "D");
  mus.fill("g", 9, 11, 2, 2, "M");
  W.defineMap("macclesfield_silk_museum", {
    name: "Silk Museum", region: "east", outdoor: false, music: "town_macc", ambience: "town",
    dialogue: "town_macclesfield",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_tile",
      "K": "silk_bolt", "P": "painting", "L": "loom", "C": "counter", "D": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: mus.layers(),
    spawnPoint: { x: 9, y: 12 },
    warps: [
      { x: 9, y: 13, to: "macclesfield", tx: 36, ty: 27, dir: "down", kind: "door" },
      { x: 10, y: 13, to: "macclesfield", tx: 36, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_macclesfield_curator", x: 3, y: 12, dir: "right", sprite: "npc_historian", behaviour: "still", script: "east_museum_curator" },
      { id: "npc_macclesfield_visitor", x: 15, y: 8, dir: "up", sprite: "npc_tourist", behaviour: "wander", radius: 2,
        say: ["Six thousand silk workers once. Now it's six thousand people who work in Manchester."] }
    ],
    signs: [
      { x: 5, y: 3, text: ["THE JACQUARD LOOM", "Punch cards. A card is a decision somebody made once and everybody obeys forever."] },
      { x: 16, y: 6, text: ["MACCLESFIELD SILK, 1743–", "'Every thread in the county came through here, and then it didn't.'"] }
    ],
    encounters: { grass: null }
  });

  // four weaver cottages
  const homes = [
    { id: "macclesfield_house_1", tx: 51, ty: 31, name: "Weaver's Cottage",
      npc: { id: "npc_macclesfield_h1", sprite: "npc_granny", say: ["Attic windows that long meant one thing: somebody upstairs working till the light went.", "My great-grandmother went blind at forty. She'd have loved the electric."] } },
    { id: "macclesfield_house_2", tx: 46, ty: 25, name: "Weaver's Cottage",
      npc: { id: "npc_macclesfield_h2", sprite: "npc_kid", say: ["I'm going to be a threat hunter like the man at number nine.", "He walks everywhere. That's the main bit, I think."] } },
    { id: "macclesfield_house_3", tx: 46, ty: 31, name: "Weaver's Cottage",
      npc: { id: "npc_macclesfield_h3", sprite: "npc_dev", say: ["Remote job, Macclesfield rent, Manchester salary. Don't tell anyone.", "Everyone knows."] } },
    { id: "macclesfield_house_4", tx: 15, ty: 42, name: "Canal Cottage",
      npc: { id: "npc_macclesfield_h4", sprite: "npc_boater", say: ["Lived on the water eleven years. Came ashore for the cat.", "She wouldn't have it. Not the boat, not the water, not the ducks."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "east", dialogue: "town_macclesfield", music: "town_macc",
      warps: [
        { x: 5, y: 9, to: "macclesfield", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "macclesfield", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }
})();
