// =============================================================
// MonsterQuest v2 — POYNTON (region east, WORLD-BIBLE §2 L3)
// Old coal village turned commuter town: the shared-space roundabout
// with no signs at all, Poynton Pool, the Anson Engine Museum, the
// Middlewood Way running east, and Lady Pit's sealed adit breathing
// cold air out of the hillside.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "path_gravel", "1": "water_pond", "2": "water_reeds", "3": "boat_dock", "4": "fish_spot",
    "5": "rail_track_h", "6": "rail_track_v", "7": "rail_buffer", "8": "cave_entrance",
    "9": "mine_prop", "E": "crate", "Q": "barrel", "U": "road_line", "J": "zebra", "Y": "bollard",
    "!": "picnic_table", "?": "hay_bale", ":": "bandstand", ";": "tree_pine", "<": "tree_pine_top",
    ">": "log", "[": "gate_wood", "]": "rock_small"
  });

  // ---------------------------------------------------------------- town --
  const c = B.canvas(48, 32, ".");
  c.fill("g", 0, 0, 48, 2, "T");
  for (let x = 0; x < 48; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 29, "T");
  c.fill("g", 47, 2, 1, 29, "T");
  c.fill("g", 0, 31, 48, 1, "T");
  c.fill("g", 23, 0, 3, 2, "r");
  c.fill("o", 23, 0, 3, 1, " ");
  c.fill("g", 47, 17, 1, 2, "0");   // east exit — the Middlewood Way

  // ---- the roads, and the roundabout with no signs on it ------------------
  c.fill("g", 23, 0, 3, 14, "r");
  c.fill("g", 24, 2, 1, 11, "U");
  c.fill("g", 22, 2, 1, 11, "k"); c.fill("g", 26, 2, 1, 11, "k");
  c.fill("g", 19, 13, 11, 8, "r");
  c.fill("g", 22, 15, 5, 4, "h");
  c.set("g", 24, 16, "q"); c.set("g", 23, 18, "l"); c.set("g", 25, 17, "o");
  c.fill("g", 1, 16, 18, 3, "r");
  c.fill("g", 30, 16, 17, 3, "r");
  c.fill("g", 1, 17, 18, 1, "U"); c.fill("g", 30, 17, 17, 1, "U");
  c.fill("g", 23, 21, 3, 3, "r");
  c.fill("g", 1, 15, 18, 1, "-"); c.fill("g", 30, 15, 17, 1, "-");
  c.fill("g", 1, 19, 18, 1, "-"); c.fill("g", 30, 19, 17, 1, "-");
  c.fill("g", 15, 16, 1, 3, "J"); c.fill("g", 36, 16, 1, 3, "J");
  c.set("g", 18, 15, "Y"); c.set("g", 30, 19, "Y");
  for (let x = 3; x < 47; x += 8) { if (x < 19 || x > 29) { c.set("g", x, 15, "L"); c.set("g", x + 2, 19, "L"); } }
  c.set("g", 11, 19, "u"); c.set("g", 31, 15, "n"); c.set("g", 8, 19, "O"); c.set("g", 44, 19, "j");

  // ---- Lady Pit: engine house, spoil, and the adit that breathes cold -----
  c.fill("g", 1, 2, 20, 9, ",");
  B.house(c, { x: 4, y: 4, w: 7, h: 4, rh: 1, roof: "R", wall: "X", win: "W", door: "D", doorX: 3, over: "^" });
  c.set("g", 5, 4, "M");
  c.fill("g", 3, 8, 9, 1, "+");
  c.fill("g", 12, 5, 4, 4, "z");
  c.set("g", 13, 7, "8");
  c.set("g", 13, 8, "+");
  c.set("g", 12, 9, "9"); c.set("g", 15, 9, "9"); c.set("g", 15, 6, "9");
  c.set("g", 13, 9, "+"); c.set("g", 14, 9, "+");
  c.fill("g", 2, 2, 4, 2, "z");
  c.fill("g", 16, 2, 5, 4, "\"");
  c.fill("g", 2, 10, 20, 1, "+");
  c.fill("g", 3, 9, 9, 1, "+");
  c.set("g", 22, 10, "+");
  c.set("g", 2, 8, "f"); c.set("g", 2, 7, "f"); c.set("g", 2, 6, "f");
  c.set("g", 11, 10, "N");
  c.fill("g", 17, 7, 4, 3, "\"");

  // ---- the green in the middle, the memorial, the pines ------------------
  c.fill("g", 27, 2, 5, 9, ".");
  c.fill("g", 19, 2, 3, 9, ".");
  c.set("g", 20, 5, "i");
  c.set("g", 20, 7, "H"); c.set("g", 28, 6, "H");
  B.trees(c, "poy-green", 7, 27, 2, 5, 8, ";", "<", ["."]);

  // ---- the Anson Engine Museum, its yard and its dead rails --------------
  c.fill("g", 31, 2, 16, 14, ",");
  B.house(c, { x: 33, y: 3, w: 13, h: 7, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 6, over: "^" });
  c.set("g", 34, 3, "M"); c.set("g", 44, 3, "M");
  c.fill("g", 31, 10, 16, 5, "0");
  c.fill("g", 31, 11, 14, 1, "5");
  c.set("g", 45, 11, "7");
  c.set("g", 33, 13, "E"); c.set("g", 34, 13, "E"); c.set("g", 41, 12, "Q"); c.set("g", 42, 13, "Q");
  c.set("g", 32, 10, "N");
  c.fill("g", 31, 15, 16, 1, "0");
  c.set("g", 30, 14, "N");

  // ---- the north-side row: Care centre, Mart, a couple of shops ----------
  c.fill("g", 1, 11, 21, 4, ",");
  B.house(c, { x: 2, y: 11, w: 10, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 13, y: 11, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 2, over: "^" });
  c.set("g", 1, 14, "*"); c.set("g", 12, 14, "*"); c.set("g", 19, 13, "%");
  c.fill("g", 19, 11, 3, 4, ",");
  c.fill("g", 19, 14, 3, 1, "-");

  // ---- south of the road: the daycare paddocks, homes, the station -------
  c.fill("g", 1, 20, 46, 4, ".");
  c.fill("g", 1, 24, 46, 1, "_");
  c.fill("g", 1, 20, 1, 4, "_"); c.fill("g", 46, 20, 1, 4, "_");
  B.house(c, { x: 3, y: 20, w: 9, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4, over: "^" });
  c.fill("g", 13, 20, 8, 4, "f");
  c.fill("g", 14, 21, 6, 2, "\"");
  c.set("g", 17, 23, "[");
  c.set("g", 12, 24, "N");
  B.house(c, { x: 24, y: 20, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: "^" });
  B.house(c, { x: 33, y: 20, w: 12, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: "^" });
  c.set("g", 32, 24, "N");
  c.fill("g", 31, 20, 1, 4, "0"); c.fill("g", 45, 20, 1, 4, "0");

  // ---- Poynton Pool and the park -----------------------------------------
  c.fill("g", 2, 25, 20, 6, "1");
  c.fill("g", 1, 25, 1, 6, "_");
  c.fill("g", 22, 25, 1, 6, "_");
  c.fill("g", 2, 30, 20, 1, "2");
  c.set("g", 11, 25, "3");
  c.set("g", 6, 27, "4"); c.set("g", 17, 28, "4"); c.set("g", 13, 26, "4");
  c.set("g", 4, 26, "2"); c.set("g", 19, 29, "2"); c.set("g", 8, 29, "2");
  c.fill("g", 23, 25, 24, 6, ".");
  c.set("g", 30, 27, ":");
  c.set("g", 26, 28, "!"); c.set("g", 40, 27, "!"); c.set("g", 35, 29, ">");
  c.fill("g", 42, 25, 5, 5, "\"");
  c.fill("g", 24, 29, 5, 2, "\"");
  B.trees(c, "poy-park", 16, 23, 25, 24, 6, "B", "b", ["."]);
  c.set("g", 23, 25, "N");

  W.defineMap("poynton", {
    name: "Poynton", region: "east", outdoor: true, music: "town_poynton", weatherZone: "east",
    ambience: "town", dialogue: "town_poynton",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 46, y: 17 },
    healPoint: { x: 6, y: 15 },
    landmark: { name: "Poynton", x: 24, y: 20 },
    encounters: { grass: "poynton_grass", water: "poynton_water" },
    fishing: "fish_poynton",
    warps: [
      { x: 6, y: 14, to: "poynton_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 15, y: 14, to: "poynton_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 39, y: 9, to: "poynton_anson_museum", tx: 12, ty: 16, dir: "up", kind: "door" },
      { x: 7, y: 23, to: "poynton_daycare", tx: 9, ty: 13, dir: "up", kind: "door" },
      { x: 26, y: 23, to: "poynton_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 38, y: 23, to: "poynton_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 13, y: 7, to: "poynton_pit_adit", tx: 13, ty: 20, dir: "up", kind: "cave" },
      { x: 7, y: 7, to: "poynton_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 23, y: 0, to: "route_poynton_lyme", tx: 15, ty: 44, dir: "up", kind: "edge" },
      { x: 24, y: 0, to: "route_poynton_lyme", tx: 16, ty: 44, dir: "up", kind: "edge" },
      { x: 25, y: 0, to: "route_poynton_lyme", tx: 17, ty: 44, dir: "up", kind: "edge" },
      { x: 47, y: 17, to: "route_bollington_poynton", tx: 1, ty: 12, dir: "right", kind: "edge" },
      { x: 47, y: 18, to: "route_bollington_poynton", tx: 1, ty: 13, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 11, y: 10, text: ["LADY PIT — CLOSED 1935. SHAFT CAPPED. ADIT SEALED.",
        "Somebody has crossed out SEALED and written, in a careful hand, 'not any more, and it is BREATHING'."] },
      { x: 32, y: 10, text: ["ANSON ENGINE MUSEUM — gas engines, oil engines, one traction engine.",
        "A hand-written correction under 'one traction engine': 'NO traction engine. See front desk.'"] },
      { x: 12, y: 24, text: ["PIT-PONY PAT'S — boarding, breeding, and a paddock that has held worse than yours."] },
      { x: 32, y: 24, text: ["POYNTON STATION — closed to passengers 1970, reopened by people who wouldn't let it go."] },
      { x: 23, y: 25, text: ["POYNTON POOL — feeder to the Middlewood cut. Deep in the middle and honest about it.",
        "NO SWIMMING. NO BAIT BOATS. NO EXCEPTIONS, DOUG."] },
      { x: 30, y: 14, text: ["THE SHARED SPACE", "No signs. No lines. No priority. You look at people and people look back.",
        "It has the best safety record in the county and nobody can explain why."] }
    ],
    items: [
      { x: 17, y: 3, item: "capsule_basic", n: 3, flag: "item_poynton_1" },
      { x: 44, y: 27, item: "rod_weighted", n: 1, hidden: true, flag: "item_poynton_2" },
      { x: 18, y: 8, item: "ember_coal", n: 1, hidden: true, flag: "item_poynton_3" },
      { x: 26, y: 30, item: "tonic", n: 2, flag: "item_poynton_4" },
      { x: 1, y: 26, item: "capsule_mesh", n: 2, hidden: true, flag: "item_poynton_5" }
    ],
    catGaps: [
      { x: 13, y: 21, item: "cat_token_3", n: 1, flag: "catgap_poynton_1",
        say: "MEADOW goes through the paddock rail as if it were a suggestion, greets a very large Ground-type nose to nose, and comes back smelling of hay." }
    ],
    restPoints: [{ x: 25, y: 28, flag: "bigboy_sat_poynton" }],
    npcs: [
      { id: "npc_poynton_bea", x: 38, y: 10, dir: "down", sprite: "npc_signaller", behaviour: "still", trainer: "tr_poynton_2", sight: 0, script: "east_poynton_bea" },
      { id: "npc_poynton_pat", x: 9, y: 24, dir: "up", sprite: "npc_farmer", behaviour: "still", script: "east_poynton_pat" },
      { id: "npc_poynton_doug", x: 10, y: 24, dir: "down", sprite: "npc_fisher", behaviour: "still", trainer: "tr_poynton_3", sight: 0, script: "east_poynton_doug" },
      { id: "npc_poynton_sasha", x: 30, y: 26, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3, trainer: "tr_poynton_1", sight: 3 },
      { id: "npc_poynton_weaver", x: 20, y: 17, dir: "up", sprite: "npc_walker", behaviour: "path", path: [[20, 17], [20, 12], [20, 6]], pathMode: "pingpong",
        say: ["Watch how it works. Nobody has right of way, so everybody looks up.",
          "Take the signs away and people become people again. It's the only civil engineering I've ever been moved by."] },
      { id: "npc_poynton_volunteer", x: 36, y: 12, dir: "down", sprite: "npc_stoker", behaviour: "wander", radius: 3,
        say: ["Somebody has taken the traction engine. A whole traction engine. Six tonnes of it.",
          "You don't take a traction engine anywhere quietly. And yet."] },
      { id: "npc_poynton_dogwalker", x: 34, y: 28, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[26, 30], [44, 30], [44, 26]], pathMode: "loop",
        say: ["The ducks on the pool have been getting hammered by something at three in the morning.",
          "Not a fox. Foxes don't do it in bursts of exactly ninety seconds."] },
      { id: "npc_poynton_shadow", x: 46, y: 22, dir: "left", sprite: "npc_shadow_it", behaviour: "still", script: "east_poynton_shadow" },
      { id: "npc_poynton_granny", x: 4, y: 15, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["Coal under all of it. My grandad came up that shaft black and went down it black and in between he sang.",
          "Now it's all people in cars going to Manchester. I don't judge. I do notice."] },
      { id: "npc_poynton_kid2", x: 14, y: 9, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 2,
        say: ["Put your hand near the adit. Go on.", "Cold, isn't it? In August. That's the pit still breathing out."] },
      { id: "npc_poynton_museum_kid", x: 42, y: 14, dir: "up", sprite: "npc_kid", behaviour: "still",
        say: ["Every engine in there fires on the hour. Bea sets them off herself.",
          "One of them fired at twenty past. She went white."] }
    ],
    triggers: [
      { x: 13, y: 8, w: 1, h: 1, script: "east_poynton_adit_cold", once: "poynton_adit_cold", cond: "!poynton_adit_cold" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("poynton_care", W.builtin("care_centre", {
    name: "Poynton Care Centre", region: "east", dialogue: "town_poynton", music: "town_poynton",
    warps: [
      { x: 7, y: 11, to: "poynton", tx: 6, ty: 15, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "poynton", tx: 6, ty: 15, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_poynton_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "machine",
        say: ["Straight through. We've had three in this morning off the moor and they all needed the same thing: warmth and a sit."] },
      { id: "npc_poynton_care_1", x: 11, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["My lad's team came back off the Middlewood Way with their fur standing up.",
          "Not frightened. Charged. Like a doorknob in winter."] }
    ]
  }));

  W.defineMap("poynton_mart", W.builtin("shop", {
    name: "Poynton Mart", region: "east", dialogue: "town_poynton", music: "town_poynton",
    shop: "shop_poynton",
    warps: [
      { x: 6, y: 9, to: "poynton", tx: 15, ty: 15, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "poynton", tx: 15, ty: 15, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_poynton_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_poynton",
        say: ["Capsules, salves, engine oil. Engine oil's for the Fire types, not for engines.",
          "One bloke didn't ask. His car is fine and his creature is furious."] }
    ],
    items: [{ x: 12, y: 2, item: "ember_coal", n: 1, flag: "item_poynton_mart_1" }]
  }));

  W.defineMap("poynton_station", W.builtin("station", {
    name: "Poynton Station", region: "east", dialogue: "town_poynton", music: "town_poynton",
    station: { name: "Poynton" },
    warps: [
      { x: 8, y: 11, to: "poynton", tx: 38, ty: 24, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "poynton", tx: 38, ty: 24, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_poynton_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["Two an hour to Manchester, one to Buxton, and a board that lies to all three."] },
      { id: "npc_poynton_commuter", x: 11, y: 6, dir: "left", sprite: "npc_dev", behaviour: "still",
        say: ["Forty minutes each way and I do my best thinking in the tunnel where there's no signal.",
          "Which tells you something about the rest of it."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "MANCHESTER PICCADILLY — ON TIME", "BUXTON — ON TIME", "MACCLESFIELD — ON TIME", "Every board in the county says ON TIME today. Every single one."] }]
  }));

  // Pit-Pony Pat's daycare — stalls, straw, and monsters you left in her care
  const dc = B.canvas(20, 15, "_");
  dc.box("g", 0, 0, 20, 15, "#");
  dc.fill("g", 1, 0, 18, 1, "^");
  dc.fill("g", 1, 1, 18, 1, "#");
  dc.fill("g", 3, 1, 3, 1, "W"); dc.fill("g", 14, 1, 3, 1, "W");
  for (let i = 0; i < 3; i++) {
    dc.fill("g", 2 + i * 6, 3, 4, 3, "f");
    dc.fill("g", 3 + i * 6, 4, 2, 2, "s");
  }
  dc.fill("g", 2, 8, 5, 1, "t"); dc.set("g", 4, 9, "h");
  dc.fill("g", 13, 8, 5, 1, "b");
  dc.fill("g", 8, 10, 4, 2, "s");
  dc.set("g", 9, 14, "d"); dc.set("g", 10, 14, "d");
  dc.fill("g", 9, 12, 2, 2, "M");
  W.defineMap("poynton_daycare", {
    name: "Pit-Pony Pat's", region: "interior", outdoor: false, music: "town_poynton",
    ambience: "town", dialogue: "town_poynton",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_wood",
      "f": "fence_wood", "s": "sack", "t": "table", "h": "chair", "b": "shelf",
      "d": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: dc.layers(),
    spawnPoint: { x: 9, y: 13 },
    warps: [
      { x: 9, y: 14, to: "poynton", tx: 7, ty: 24, dir: "down", kind: "door" },
      { x: 10, y: 14, to: "poynton", tx: 7, ty: 24, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_poynton_pat_in", x: 10, y: 9, dir: "down", sprite: "npc_farmer", behaviour: "still", kind: "daycare", script: "east_poynton_daycare" },
      { id: "npc_poynton_daycare_kid", x: 4, y: 7, dir: "right", sprite: "npc_kid", behaviour: "still",
        say: ["Pat says a pit pony worked eleven years underground and came up and wouldn't look at the sky.",
          "She says that's why she does this. I don't fully understand it but I believe her."] }
    ],
    signs: [{ x: 17, y: 8, text: ["A rota on the wall. Every name has a monster next to it and a date.", "One line has no date. It just says: 'still waiting'."] }],
    encounters: { grass: null }
  });

  // The Anson Engine Museum — an engine shed you can walk through
  const am = B.canvas(26, 18, "_");
  am.box("g", 0, 0, 26, 18, "#");
  am.fill("g", 1, 0, 24, 1, "^");
  am.fill("g", 1, 1, 24, 1, "#");
  for (let x = 3; x < 23; x += 5) am.fill("g", x, 1, 2, 1, "W");
  for (let i = 0; i < 4; i++) {
    am.fill("g", 2 + i * 6, 4, 4, 3, "m");
    am.fill("g", 2 + i * 6, 8, 4, 1, "P");
  }
  am.fill("g", 2, 11, 22, 1, "5");
  am.fill("g", 4, 12, 4, 3, "E");
  am.fill("g", 17, 12, 4, 3, "Q");
  am.set("g", 1, 14, "C"); am.set("g", 2, 14, "C"); am.set("g", 3, 14, "C");
  am.set("g", 12, 17, "d"); am.set("g", 13, 17, "d");
  am.fill("g", 12, 15, 2, 2, "M");
  W.defineMap("poynton_anson_museum", {
    name: "Anson Engine Museum", region: "interior", outdoor: false, music: "town_poynton",
    ambience: "industrial", dialogue: "town_poynton",
    legend: {
      "#": "wall_interior", "^": "wall_interior_top", "W": "window", "_": "floor_stone",
      "m": "machine", "P": "painting", "5": "rail_track_h", "E": "crate", "Q": "barrel",
      "C": "counter", "d": "door_wood", "M": "mat_welcome", " ": null
    },
    layers: am.layers(),
    spawnPoint: { x: 12, y: 16 },
    warps: [
      { x: 12, y: 17, to: "poynton", tx: 39, ty: 10, dir: "down", kind: "door" },
      { x: 13, y: 17, to: "poynton", tx: 39, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_poynton_museum_bea", x: 12, y: 13, dir: "down", sprite: "npc_stoker", behaviour: "still", script: "east_poynton_bea_in" },
      { id: "npc_poynton_museum_1", x: 4, y: 9, dir: "up", sprite: "npc_historian", behaviour: "still",
        say: ["Gas engines. Oil engines. Hot-bulb engines, which are exactly as alarming as they sound.",
          "Every one of them is a decision somebody made about how to turn burning into turning."] },
      { id: "npc_poynton_museum_2", x: 20, y: 9, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 2,
        say: ["That one's got a governor on it. It's a machine that stops the machine going too fast.",
          "Grown-ups keep going quiet when I say that."] }
    ],
    signs: [
      { x: 3, y: 14, text: ["THE MISSING TRACTION ENGINE", "A photograph, a gap on the floor, and a card: 'Removed for restoration, 14th.'",
        "Bea has written under it, in biro, pressing hard: 'BY WHOM.'"] }
    ],
    items: [{ x: 23, y: 14, item: "copper_coil", n: 1, hidden: true, flag: "item_anson_1" }],
    encounters: { grass: null }
  });

  // ---- the Lady Pit adit: a short, cold, wet mini-cave ---------------------
  const ad = B.canvas(26, 22, "#");
  ad.fill("g", 2, 2, 22, 18, ",");
  ad.fill("g", 11, 16, 4, 5, "_");
  ad.set("g", 13, 21, "E");
  ad.fill("g", 4, 12, 18, 4, "_");
  ad.fill("g", 4, 4, 6, 8, ".");
  ad.fill("g", 16, 4, 6, 8, ".");
  ad.fill("g", 10, 6, 6, 3, "~");
  ad.fill("g", 10, 9, 6, 1, "s");
  ad.fill("g", 4, 12, 18, 1, "-");
  ad.set("g", 6, 13, "K");
  ad.set("g", 5, 6, "o"); ad.set("g", 8, 10, "o"); ad.set("g", 20, 7, "o");
  ad.set("g", 18, 5, "c"); ad.set("g", 7, 4, "c");
  ad.fill("g", 3, 17, 3, 3, ",");
  ad.set("g", 4, 18, "z"); ad.set("g", 21, 18, "z");
  ad.set("g", 9, 13, "L"); ad.set("g", 17, 13, "L");
  ad.set("g", 12, 15, "N");
  W.defineMap("poynton_pit_adit", {
    name: "Lady Pit Adit", region: "interior", outdoor: false, music: "town_poynton",
    ambience: "cave", dialogue: "town_poynton",
    legend: B.caveLegend({}),
    layers: ad.layers(),
    spawnPoint: { x: 13, y: 20 },
    landmark: { name: "Lady Pit", x: 13, y: 12 },
    encounters: { cave: "poynton_pit_adit_cave", grass: null },
    warps: [
      { x: 13, y: 21, to: "poynton", tx: 13, ty: 8, dir: "down", kind: "cave" }
    ],
    signs: [
      { x: 12, y: 15, text: ["A board propped against a prop. Chalk, recent:",
        "'AIR GOOD TO HERE. AIR NOT GOOD PAST THE WATER. DO NOT BE CLEVER.'",
        "Under it, in a different hand: 'the water is warmer than the air and that is the wrong way round'"] }
    ],
    items: [
      { x: 5, y: 5, item: "copper_wire", n: 2, flag: "item_pit_adit_1" },
      { x: 20, y: 10, item: "capsule_basic", n: 3, hidden: true, flag: "item_pit_adit_2" },
      { x: 4, y: 19, item: "torch", n: 1, hidden: true, flag: "item_pit_adit_3" }
    ],
    npcs: [
      { id: "npc_poynton_adit_caver", x: 17, y: 14, dir: "left", sprite: "npc_caver", behaviour: "still",
        say: ["Nobody sealed this. That's the bit that bothers me. The cap's off from the inside.",
          "Rock doesn't do that. Water doesn't do that. I'm running out of things that do."] }
    ]
  });

  const homes = [
    { id: "poynton_house_1", tx: 26, ty: 24, name: "Terrace Cottage",
      npc: { id: "npc_poynton_h1", sprite: "npc_dev", say: ["I run a little server in the loft. Nothing important. Photos, mostly.",
        "It has started sending things at three in the morning and I do not know how to make it stop, and I am too embarrassed to ask."] } },
    { id: "poynton_house_2", tx: 7, ty: 8, name: "Engine House Cottage",
      npc: { id: "npc_poynton_h2", sprite: "npc_granny", say: ["We live in the winding house. The floor's still got the bolt holes.",
        "You can feel where the engine stood. The whole room is shaped round something that isn't there."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "east", dialogue: "town_poynton", music: "town_poynton",
      warps: [
        { x: 5, y: 9, to: "poynton", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "poynton", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }
})();
