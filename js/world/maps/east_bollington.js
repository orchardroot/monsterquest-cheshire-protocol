// =============================================================
// MonsterQuest v2 — BOLLINGTON & WHITE NANCY (region east, Ch.1)
// The mill village that climbs: Clarence and Adelphi Mills on the
// canal, Spokes' bike hire, the brass band, and Kerridge Hill with
// White Nancy on the top — where the county turns to face south-west.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const TOWN = B.TOWN;

  // ----------------------------------------------------------- Bollington --
  const c = B.canvas(46, 38, ".");
  c.fill("g", 0, 0, 46, 1, "T"); c.fill("g", 0, 37, 46, 1, "T");
  c.fill("g", 0, 1, 1, 36, "T"); c.fill("g", 45, 1, 1, 36, "T");
  for (let x = 0; x < 46; x++) c.set("o", x, 0, "y");
  c.fill("g", 20, 37, 4, 1, "t");
  c.fill("g", 0, 20, 1, 2, "=");
  c.fill("g", 45, 15, 1, 3, "+");
  c.fill("g", 1, 1, 44, 36, ",");

  // the two mills, honey gritstone and cotton-mill red
  B.house(c, { x: 3, y: 1, w: 14, h: 7, rh: 2, roof: "R", wall: "V", win: "v", door: "D", doorX: 6, over: "^" });
  c.set("g", 4, 1, "M"); c.set("g", 15, 1, "M");
  B.house(c, { x: 29, y: 1, w: 14, h: 7, rh: 2, roof: "R", wall: "V", win: "v", door: "D", doorX: 7, over: "^" });
  c.set("g", 30, 1, "M"); c.set("g", 41, 1, "M");
  c.set("g", 2, 6, "N"); c.set("g", 44, 6, "N");

  // the canal along the contour
  c.fill("g", 1, 8, 44, 1, "t");
  c.fill("g", 1, 9, 44, 3, "~");
  c.fill("g", 1, 12, 44, 1, "t");
  c.fill("g", 20, 8, 3, 5, "x");
  c.set("g", 6, 9, "K"); c.set("g", 6, 11, "K");
  c.set("g", 34, 10, "e");

  // streets
  c.fill("g", 20, 13, 3, 24, "=");
  c.fill("g", 1, 20, 44, 2, "=");
  c.fill("g", 1, 19, 44, 1, "-"); c.fill("g", 1, 22, 44, 1, "-");
  for (let x = 3; x < 44; x += 8) { c.set("g", x, 19, "L"); c.set("g", x + 4, 22, "L"); }
  c.set("g", 12, 22, "O"); c.set("g", 26, 19, "n"); c.set("g", 17, 22, "H"); c.set("g", 18, 22, "I");

  // buildings on the terraces
  B.house(c, { x: 6, y: 14, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 5, 17, "N");
  B.house(c, { x: 26, y: 14, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  c.set("g", 36, 17, "N");
  B.house(c, { x: 3, y: 23, w: 9, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 26, y: 23, w: 9, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 36, y: 23, w: 8, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4, over: "^" });
  B.house(c, { x: 4, y: 30, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  B.house(c, { x: 13, y: 30, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  B.house(c, { x: 26, y: 30, w: 8, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 3, 34, 32, 1, "-");
  c.fill("g", 2, 28, 43, 1, "-");

  // the green and bandstand under the hill
  c.fill("g", 36, 13, 8, 6, ".");
  c.set("g", 39, 15, "q");
  c.fill("g", 37, 17, 6, 1, "_");
  c.set("g", 37, 14, "H"); c.set("g", 42, 14, "H");
  B.trees(c, "boll-green", 6, 36, 13, 8, 6, "B", "b", ["."]);
  // rough ground climbing east to Kerridge
  c.fill("g", 36, 30, 8, 6, '"');
  c.fill("g", 2, 35, 16, 2, '"');
  c.fill("g", 23, 35, 12, 2, '"');
  c.fill("g", 40, 22, 4, 5, '"');
  B.trees(c, "boll-t", 18, 1, 23, 44, 14, "T", "y", [","]);
  c.set("g", 44, 13, "P");
  c.set("g", 19, 36, "P");

  W.defineMap("bollington", {
    name: "Bollington", region: "east", outdoor: true, music: "town_bollington", weatherZone: "east",
    ambience: "town", dialogue: "town_bollington",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 21, y: 35 },
    healPoint: { x: 7, y: 27 },
    landmark: { name: "Bollington", x: 21, y: 20 },
    encounters: { grass: "bollington_grass", water: null },
    fishing: "fish_route_macc_bollington",
    warps: [
      { x: 9, y: 7, to: "bollington_clarence_mill", tx: 11, ty: 15, dir: "up", kind: "door" },
      { x: 10, y: 18, to: "bollington_hill_cafe", tx: 6, ty: 9, dir: "up", kind: "door" },
      { x: 30, y: 18, to: "bollington_spokes", tx: 6, ty: 9, dir: "up", kind: "door" },
      { x: 7, y: 26, to: "bollington_care", tx: 7, ty: 11, dir: "up", kind: "door" },
      { x: 30, y: 26, to: "bollington_mart", tx: 6, ty: 9, dir: "up", kind: "door" },
      { x: 40, y: 27, to: "bollington_inn", tx: 6, ty: 11, dir: "up", kind: "door" },
      { x: 7, y: 33, to: "bollington_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 16, y: 33, to: "bollington_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 29, y: 33, to: "bollington_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 20, y: 37, to: "route_macc_bollington", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 21, y: 37, to: "route_macc_bollington", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 22, y: 37, to: "route_macc_bollington", tx: 17, ty: 1, dir: "down", kind: "edge" },
      { x: 23, y: 37, to: "route_macc_bollington", tx: 17, ty: 1, dir: "down", kind: "edge" },
      { x: 0, y: 20, to: "route_bollington_poynton", tx: 60, ty: 12, dir: "left", kind: "edge" },
      { x: 0, y: 21, to: "route_bollington_poynton", tx: 60, ty: 13, dir: "left", kind: "edge" },
      { x: 45, y: 15, to: "kerridge_hill", tx: 2, ty: 39, dir: "right", kind: "edge" },
      { x: 45, y: 16, to: "kerridge_hill", tx: 2, ty: 40, dir: "right", kind: "edge" },
      { x: 45, y: 17, to: "kerridge_hill", tx: 2, ty: 41, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 2, y: 6, text: ["CLARENCE MILL, 1834.", "Cotton, then nothing, then flats, then a café. Cheshire in four words."] },
      { x: 44, y: 6, text: ["ADELPHI MILL — private. The chimney is listed and so is the pigeon on it."] },
      { x: 5, y: 17, text: ["THE HILL CAFÉ", "Bacon, tea, and a wall of photographs of White Nancy in all her paint schemes."] },
      { x: 36, y: 17, text: ["SPOKES — BIKE HIRE & REPAIR", "'If it turns, I'll fix it. If it doesn't turn, I'll fix it harder.'"] },
      { x: 44, y: 13, text: ["KERRIDGE HILL & WHITE NANCY", "Steep. Windy. Worth it. In that order."] },
      { x: 19, y: 36, text: ["MACCLESFIELD 2 MILES BY THE CUT.", "MIDDLEWOOD WAY — POYNTON 4 MILES WEST."] }
    ],
    items: [
      { x: 42, y: 32, item: "salve", n: 2, flag: "item_bollington_1" },
      { x: 4, y: 36, item: "capsule_basic", n: 2, flag: "item_bollington_2" },
      { x: 33, y: 36, item: "focus_band", n: 1, hidden: true, flag: "item_bollington_3" }
    ],
    catGaps: [
      { x: 24, y: 12, item: "cat_token_1", n: 1, flag: "catgap_bollington_1", say: "MEADOW slips under the mill railings and comes back wearing a expression of enormous self-regard." }
    ],
    npcs: [
      { id: "npc_bollington_spokes", x: 30, y: 19, dir: "down", sprite: "spokes", behaviour: "still", script: "east_bollington_spokes" },
      { id: "npc_bollington_nancy", x: 39, y: 16, dir: "down", sprite: "npc_ranger", behaviour: "still", script: "east_bollington_nancy" },
      { id: "npc_bollington_kev", x: 38, y: 30, dir: "up", sprite: "npc_ranger", behaviour: "still", script: "east_bollington_kev" },
      { id: "npc_bollington_priya", x: 15, y: 20, dir: "right", sprite: "npc_cyclist", behaviour: "still", script: "east_bollington_priya" },
      { id: "npc_bollington_ollie", x: 41, y: 17, dir: "left", sprite: "npc_bandsman", behaviour: "still", trainer: "tr_bollington_1", sight: 0 },
      { id: "npc_bollington_walker", x: 25, y: 21, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[25, 21], [40, 21], [40, 20], [25, 20]], pathMode: "loop",
        say: ["Everything in this village is on a slope. Including the arguments."] },
      { id: "npc_bollington_granny", x: 13, y: 22, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["Nancy's been white, black, red, poppies, rainbows and once, wrongly, beige.", "Somebody painted her overnight last week. It wasn't a scheme. It was a square with corners."] },
      { id: "npc_bollington_kid", x: 33, y: 35, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's something living in the tuba. It hums back when Ollie plays a B flat."] },
      { id: "npc_bollington_boater", x: 30, y: 12, dir: "down", sprite: "npc_boater", behaviour: "path", path: [[26, 12], [42, 12]], pathMode: "pingpong",
        say: ["Aqueduct's the highest bit of the whole cut. Water going over a road. Never stops being daft."] },
      { id: "npc_bollington_dev", x: 8, y: 21, dir: "up", sprite: "npc_dev", behaviour: "still",
        say: ["I work in the mill. Not in the mill — in the mill. Desk where a loom was.", "The floor still shakes at ten past the hour and nobody can tell me why."] }
    ],
    restPoints: [{ x: 39, y: 17, flag: "bigboy_sat_bollington" }]
  });

  // --------------------------------------------------------- Kerridge Hill --
  const k = B.canvas(34, 44, ";");
  k.fill("g", 0, 0, 34, 2, "R");
  k.fill("g", 0, 42, 34, 2, "R");
  k.fill("g", 0, 2, 1, 40, "R"); k.fill("g", 33, 2, 1, 40, "R");
  k.fill("g", 1, 39, 1, 3, "+");
  k.fill("g", 1, 3, 32, 39, ";");
  // the climb: a zig-zag of path from the Bollington gate to the summit
  k.fill("g", 2, 38, 12, 2, "+");
  k.fill("g", 12, 30, 2, 10, "+");
  k.fill("g", 12, 30, 14, 2, "+");
  k.fill("g", 24, 22, 2, 10, "+");
  k.fill("g", 10, 22, 16, 2, "+");
  k.fill("g", 10, 14, 2, 10, "+");
  k.fill("g", 10, 14, 8, 2, "+");
  k.fill("g", 16, 6, 2, 10, "+");
  // the summit and White Nancy herself
  k.fill("g", 12, 3, 11, 5, "_");
  k.set("g", 17, 5, "*");
  k.set("g", 16, 4, "M"); k.set("g", 19, 4, "M");
  k.set("g", 14, 6, "q"); k.set("g", 21, 6, "q");
  // heather, gritstone edges, quarry scars, one-way ledges
  k.fill("g", 2, 4, 8, 8, "H"); k.fill("g", 26, 6, 6, 9, "H");
  k.fill("g", 3, 16, 6, 9, "H"); k.fill("g", 27, 18, 5, 10, "H");
  k.fill("g", 3, 28, 7, 8, "H"); k.fill("g", 16, 34, 10, 6, "H");
  k.fill("g", 27, 30, 5, 8, "R");
  k.fill("g", 19, 16, 6, 5, "R");
  k.fill("g", 2, 26, 9, 1, "L"); k.fill("g", 14, 33, 10, 1, "L"); k.fill("g", 26, 20, 6, 1, "L");
  k.fill("g", 5, 12, 5, 3, "c");
  k.fill("g", 4, 12, 1, 3, "C");
  k.set("g", 3, 37, "S"); k.set("g", 13, 29, "S"); k.set("g", 15, 8, "S");
  k.set("g", 22, 26, "z"); k.set("g", 8, 33, "z");
  B.trees(k, "kerr", 12, 2, 30, 30, 12, "T", "y", [";"]);

  W.defineMap("kerridge_hill", {
    name: "Kerridge Hill", region: "east", outdoor: true, music: "route_east", weatherZone: "east",
    ambience: "moor", dialogue: "town_bollington",
    legend: {
      ";": "grass_moor", "H": "moor_heather", "R": "rock_moor", "r": "rock", "c": "cliff_face",
      "C": "cliff_climb", "L": "ledge_down", "+": "path_dirt", "_": "path_flag", "*": "white_nancy",
      "M": "moor_stone", "S": "sign_post", "q": "bench", "z": "boulder", "T": "tree_oak", "y": "tree_oak_top",
      '"': "grass_tall", " ": null
    },
    layers: k.layers(),
    spawnPoint: { x: 2, y: 39 },
    landmark: { name: "White Nancy", x: 17, y: 5 },
    encounters: { grass: "kerridge_hill_grass", water: null },
    warps: [
      { x: 1, y: 39, to: "bollington", tx: 44, ty: 15, dir: "left", kind: "edge" },
      { x: 1, y: 40, to: "bollington", tx: 44, ty: 16, dir: "left", kind: "edge" },
      { x: 1, y: 41, to: "bollington", tx: 44, ty: 17, dir: "left", kind: "edge" }
    ],
    signs: [
      { x: 3, y: 37, text: ["KERRIDGE HILL — WHITE NANCY 3/4 MILE.", "STEEP. It is not a suggestion."] },
      { x: 13, y: 29, text: ["A viewpoint plaque, weathered:", "SHUTLINGSLOE · THE CLOUD · MOW COP · BEESTON · HELSBY · MOEL FAMAU.", "Six hills. Somebody has scratched a tick beside none of them yet."] },
      { x: 15, y: 8, text: ["WHITE NANCY, built 1817 for Waterloo.", "It is a sugar loaf, a folly, a tomb, a landmark and a canvas, depending who you ask."] }
    ],
    items: [
      { x: 6, y: 19, item: "capsule_basic", n: 2, flag: "item_kerridge_hill_1" },
      { x: 29, y: 12, item: "tonic", n: 1, hidden: true, flag: "item_kerridge_hill_2" },
      { x: 20, y: 4, item: "viewpoint_bollington", n: 1, flag: "item_kerridge_hill_3" },
      { x: 8, y: 35, item: "collectible_1", n: 1, hidden: true, flag: "item_kerridge_hill_4" }
    ],
    npcs: [
      { id: "npc_kerridge_ceri", x: 11, y: 20, dir: "down", sprite: "npc_fellrunner", behaviour: "look", radius: 4, trainer: "tr_kerridge_hill_1", sight: 4 },
      { id: "npc_kerridge_marco", x: 25, y: 27, dir: "left", sprite: "npc_kid", behaviour: "look", radius: 3, trainer: "tr_kerridge_hill_2", sight: 3 },
      { id: "npc_kerridge_bram", x: 17, y: 11, dir: "down", sprite: "npc_cultist", behaviour: "look", radius: 4, trainer: "tr_kerridge_hill_3", sight: 4, cond: "quest.case_02_white_nancy >= 1" },
      { id: "npc_kerridge_painter", x: 20, y: 6, dir: "left", sprite: "npc_kid", behaviour: "still", script: "east_kerridge_painter", cond: "quest.case_02_white_nancy >= 1 && time.night" }
    ],
    restPoints: [{ x: 14, y: 6, flag: "bigboy_sat_kerridge" }],
    triggers: [
      { x: 14, y: 7, w: 7, h: 1, script: "east_white_nancy", once: "white_nancy_seen", cond: "!white_nancy_seen" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  const mill = B.canvas(22, 17, "F");
  mill.box("g", 0, 0, 22, 17, "V");
  mill.fill("g", 1, 0, 20, 1, "^");
  mill.fill("g", 1, 1, 20, 1, "V");
  for (let x = 2; x < 20; x += 4) mill.fill("g", x, 1, 2, 1, "v");
  mill.fill("g", 2, 3, 6, 1, "S"); mill.fill("g", 14, 3, 6, 1, "S");
  mill.fill("g", 2, 6, 5, 1, "t"); mill.fill("g", 15, 6, 5, 1, "t");
  mill.fill("g", 3, 7, 3, 1, "h"); mill.fill("g", 16, 7, 3, 1, "h");
  mill.fill("g", 8, 9, 6, 2, "C");
  mill.fill("g", 2, 12, 4, 1, "P"); mill.fill("g", 16, 12, 4, 1, "P");
  mill.set("g", 10, 16, "D"); mill.set("g", 11, 16, "D");
  mill.fill("g", 10, 14, 2, 2, "m");
  W.defineMap("bollington_clarence_mill", {
    name: "Clarence Mill", region: "east", outdoor: false, music: "town_bollington", ambience: "town",
    dialogue: "town_bollington",
    legend: {
      "V": "mill_wall", "^": "wall_interior_top", "v": "mill_window", "F": "floor_wood",
      "S": "shelf_books", "t": "table_round", "h": "chair", "C": "counter", "P": "painting",
      "D": "door_wood", "m": "mat_welcome", " ": null
    },
    layers: mill.layers(),
    spawnPoint: { x: 10, y: 15 },
    warps: [
      { x: 10, y: 16, to: "bollington", tx: 9, ty: 8, dir: "down", kind: "door" },
      { x: 11, y: 16, to: "bollington", tx: 9, ty: 8, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bollington_barista", x: 10, y: 12, dir: "down", sprite: "npc_shopkeep", behaviour: "still", kind: "shop",
        say: ["Flat white and a flapjack. The flapjack is structural."] },
      { id: "npc_bollington_artist", x: 4, y: 7, dir: "right", sprite: "npc_tourist", behaviour: "still",
        say: ["I paint the mill from the towpath every week. Same view, different weather.", "Last Tuesday the weathervane on the Hovis was pointing at nothing. There is no nothing on a weathervane."] }
    ],
    signs: [{ x: 6, y: 3, text: ["A shelf of local history. One book has been taken out forty times and returned forty times.", "'THE LEGEND OF ALDERLEY' — someone has pencilled 'it's true' in the margin, then rubbed it out."] }],
    encounters: { grass: null }
  });

  W.defineMap("bollington_spokes", W.builtin("shop", {
    name: "Spokes", region: "east", dialogue: "town_bollington", music: "town_bollington",
    shop: "shop_bollington_spokes",
    warps: [
      { x: 6, y: 9, to: "bollington", tx: 30, ty: 19, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "bollington", tx: 30, ty: 19, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bollington_spokes_shop", x: 1, y: 5, dir: "down", sprite: "spokes", behaviour: "still", shop: "shop_bollington_spokes",
        say: ["Inner tubes, brake blocks, and one bike I'm keeping for somebody who walks a lot."] }
    ]
  }));

  W.defineMap("bollington_hill_cafe", W.builtin("shop", {
    name: "The Hill Café", region: "east", dialogue: "town_bollington", music: "town_bollington",
    warps: [
      { x: 6, y: 9, to: "bollington", tx: 10, ty: 19, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "bollington", tx: 10, ty: 19, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bollington_cafe", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", kind: "shop",
        say: ["Tea's in a mug, not a cup. If you want a cup, walk to Prestbury."] },
      { id: "npc_bollington_cafe_2", x: 10, y: 4, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Every photo on that wall is Nancy in a different coat.", "Nobody's got a photo of last week's. Funny, that. Everyone's got a phone."] }
    ]
  }));

  W.defineMap("bollington_care", W.builtin("care_centre", {
    name: "Bollington Care Centre", region: "east", dialogue: "town_bollington", music: "town_bollington",
    warps: [
      { x: 7, y: 11, to: "bollington", tx: 7, ty: 27, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "bollington", tx: 7, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bollington_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Up the hill and back down again, was it? Sit. I'll see to them."] }
    ]
  }));

  W.defineMap("bollington_mart", W.builtin("shop", {
    name: "Bollington Mart", region: "east", dialogue: "town_bollington", music: "town_bollington",
    shop: "shop_bollington",
    warps: [
      { x: 6, y: 9, to: "bollington", tx: 30, ty: 27, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "bollington", tx: 30, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_bollington_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_bollington",
      say: ["Capsules by the door, sympathy by the till."] }]
  }));

  W.defineMap("bollington_inn", W.builtin("pub", {
    name: "The Vale", region: "east", dialogue: "town_bollington", music: "town_bollington",
    warps: [
      { x: 6, y: 11, to: "bollington", tx: 40, ty: 28, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "bollington", tx: 40, ty: 28, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_bollington_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room upstairs. Band practise Tuesdays. You'll sleep through it or you won't."] },
      { id: "npc_bollington_pub_1", x: 8, y: 7, dir: "up", sprite: "npc_bandsman", behaviour: "still",
        say: ["Second cornet. Thirty-one years.", "The tuba's got a nest in it and Ollie won't hear a word against it."] }
    ]
  }));

  const bhomes = [
    { id: "bollington_house_1", tx: 7, ty: 34, npc: { id: "npc_bollington_h1", sprite: "npc_granny",
      say: ["Born in this house. Married in that church. Buried, eventually, up the hill with a view.", "Nobody's leaving Bollington. We just go up and down it."] } },
    { id: "bollington_house_2", tx: 16, ty: 34, npc: { id: "npc_bollington_h2", sprite: "npc_farmer",
      say: ["Sheep on Kerridge have been standing in a line all week. Facing the same way.", "Sheep don't do lines."] } },
    { id: "bollington_house_3", tx: 29, ty: 34, npc: { id: "npc_bollington_h3", sprite: "npc_cyclist",
      say: ["Eleven minutes down the Middlewood Way. Twenty-six back up.", "The hill takes its cut."] } }
  ];
  for (let i = 0; i < bhomes.length; i++) {
    const hh = bhomes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: "Bollington Cottage", region: "east", dialogue: "town_bollington", music: "town_bollington",
      warps: [
        { x: 5, y: 9, to: "bollington", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "bollington", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }
})();
