// =============================================================
// MonsterQuest v2 — the MID region's routes (Ch.3-5).
// R8 Chelford Heath, the Rostherne lane, R9 Ollerton & Goostrey,
// R10 Twemlow Viaduct meadows, R11 Brereton Heath & Astbury Mere,
// R12 Biddulph Valley Way, the Mow Cop lane, R13 the Wheelock flight
// and R14 the Elworth cut. Every one has a loop, a water crossing or a
// drop, and something in a hedge. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LAND = M.moor();
  const D = function (region, dialogue, song) {
    return { region: region, dialogue: dialogue, music: song, weatherZone: region, outdoor: true, owner: "mid", ambience: "forest" };
  };

  // =============== R8 — Chelford Heath & Radnor Mere =====================
  const r8 = M.canvas(62, 34, ";");
  r8.fill("g", 0, 0, 62, 1, "T"); r8.fill("g", 0, 33, 62, 1, "T");
  r8.fill("g", 0, 1, 1, 32, "T"); r8.fill("g", 61, 1, 1, 32, "T");
  r8.fill("g", 0, 16, 1, 3, ":"); r8.fill("g", 61, 17, 1, 2, ":");
  B.trees(r8, "r8-birch", 60, 2, 2, 58, 30, "B", "b", [";"]);
  // the heath lane, with a loop round the mere
  r8.fill("g", 1, 17, 24, 1, ":");
  r8.fill("g", 24, 8, 1, 10, ":"); r8.fill("g", 24, 8, 20, 1, ":");
  r8.fill("g", 43, 8, 1, 14, ":"); r8.fill("g", 43, 21, 18, 1, ":");
  r8.fill("g", 44, 17, 17, 1, ":");
  r8.fill("g", 24, 17, 20, 1, ":");
  r8.fill("g", 24, 25, 20, 1, ":"); r8.fill("g", 24, 17, 1, 9, ":");
  // Radnor Mere, ringed with reeds; the mere path goes through a laid hedge
  M.lake(r8, 29, 10, 12, 6, "1", "A");
  r8.fill("g", 28, 13, 1, 1, "h"); r8.fill("g", 28, 12, 1, 3, "h");
  r8.set("g", 27, 13, ":"); r8.set("g", 26, 13, ":");
  r8.fill("g", 29, 16, 12, 1, "A");
  r8.set("g", 30, 16, "U"); r8.set("g", 30, 15, "1");
  r8.set("g", 34, 12, "Q"); r8.set("g", 38, 14, "Q");
  // heather, gorse and a hidden hollow
  r8.fill("g", 4, 4, 14, 8, "0");
  r8.fill("g", 6, 20, 14, 9, "\"");
  r8.fill("g", 46, 3, 12, 10, "0");
  r8.fill("g", 47, 26, 12, 6, "\"");
  r8.scatter("g", "r8-gorse", "{", 18, 2, 2, 58, 30, [";", "0"]);
  r8.scatter("g", "r8-rock", "5", 10, 2, 2, 58, 30, ["0"]);
  r8.fill("g", 12, 28, 5, 1, "h"); r8.set("g", 14, 28, ":");
  r8.fill("g", 12, 29, 6, 3, ",");
  r8.fill("g", 14, 26, 1, 3, ":");
  r8.set("g", 25, 16, "N"); r8.set("g", 44, 16, "N"); r8.set("g", 2, 18, "P");
  r8.set("g", 20, 3, "]"); r8.set("g", 55, 30, "[");
  r8.fill("g", 50, 15, 8, 4, "0");

  W.defineMap("route_alderley_knutsford", MQ.U.merge(D("bollin", "town_knutsford", "route_bollin"), {
    name: "Chelford Heath", ambience: "moor",
    legend: LAND, layers: r8.layers(),
    spawnPoint: { x: 2, y: 17 },
    encounters: { grass: "route_alderley_knutsford_grass", water: "route_alderley_knutsford_water" },
    fishing: "fish_route_alderley_knutsford",
    warps: [
      { x: 0, y: 16, to: "alderley_edge", tx: 2, ty: 37, dir: "left", kind: "edge" },
      { x: 0, y: 17, to: "alderley_edge", tx: 2, ty: 37, dir: "left", kind: "edge" },
      { x: 0, y: 18, to: "alderley_edge", tx: 2, ty: 38, dir: "left", kind: "edge" },
      { x: 61, y: 17, to: "knutsford", tx: 1, ty: 22, dir: "right", kind: "edge" },
      { x: 61, y: 18, to: "knutsford", tx: 1, ty: 23, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 2, y: 18, text: ["CHELFORD HEATH. Common grazing, gorse, and a mere in the middle of it that nobody is allowed to drink from.",
        "ALDERLEY EDGE 2 · KNUTSFORD 4"] },
      { x: 25, y: 16, text: ["RADNOR MERE — PRIVATE. The path round the water is through the laid hedge and the hedge does not want you.",
        "A billhook and ten minutes' work will change the hedge's mind. Ten minutes is the whole trick of hedging."] },
      { x: 44, y: 16, text: ["KNUTSFORD 2 MILES. Under it, chalked: 'ask on King Street. they already know.'"] }
    ],
    items: [
      { x: 14, y: 30, item: "capsule_mesh", n: 4, hidden: true, flag: "item_r8_1" },
      { x: 55, y: 5, item: "elixir", n: 1, flag: "item_r8_2" },
      { x: 8, y: 24, item: "billhook_charm", n: 1, hidden: true, flag: "item_r8_3" },
      { x: 52, y: 29, item: "tonic", n: 2, hidden: true, flag: "item_r8_4" },
      { x: 32, y: 6, item: "capsule_night", n: 3, flag: "item_r8_5" }
    ],
    catGaps: [
      { x: 28, y: 13, item: "cat_token_3", n: 1, flag: "catgap_r8_1",
        say: "MEADOW goes through the laid hedge like it isn't there, walks the mere path, and comes back with a feather that is much too big." }
    ],
    npcs: [
      { id: "npc_r8_meurig", x: 12, y: 17, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_route_alderley_knutsford_1", sight: 3 },
      { id: "npc_r8_dilys", x: 24, y: 22, dir: "right", sprite: "npc_farmer", behaviour: "look", radius: 3, trainer: "tr_route_alderley_knutsford_2", sight: 3, script: "mid_r8_dilys" },
      { id: "npc_r8_ffion", x: 27, y: 13, dir: "right", sprite: "npc_birder", behaviour: "still", trainer: "tr_route_alderley_knutsford_3", sight: 0 },
      { id: "npc_r8_rhosyn", x: 43, y: 14, dir: "left", sprite: "npc_cultist", behaviour: "look", radius: 4, trainer: "tr_route_alderley_knutsford_4", sight: 4, script: "mid_r8_cultist" },
      { id: "npc_r8_sheep_1", x: 8, y: 8, dir: "down", sprite: "sheep", behaviour: "wander", radius: 3, script: "mid_r8_sheep" },
      { id: "npc_r8_sheep_2", x: 52, y: 8, dir: "down", sprite: "sheep", behaviour: "wander", radius: 3, script: "mid_r8_sheep" },
      { id: "npc_r8_walker", x: 50, y: 21, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[46, 21], [58, 21]], pathMode: "pingpong",
        say: ["Four miles of heath and a mere you can't get to. Cheshire in one sentence."] }
    ]
  }));

  // =============== The Rostherne lane ====================================
  const rl = M.canvas(20, 30, ";");
  rl.fill("g", 0, 0, 20, 1, "T"); rl.fill("g", 0, 29, 20, 1, "T");
  rl.fill("g", 0, 1, 1, 28, "T"); rl.fill("g", 19, 1, 1, 28, "T");
  rl.fill("g", 8, 0, 3, 1, ":"); rl.fill("g", 8, 29, 3, 1, ":");
  B.trees(rl, "rl-lane", 24, 2, 2, 16, 26, "T", "y", [";"]);
  rl.fill("g", 9, 1, 1, 28, ":");
  rl.fill("g", 9, 8, 8, 1, ":"); rl.fill("g", 16, 8, 1, 8, ":"); rl.fill("g", 9, 15, 8, 1, ":");
  rl.fill("g", 3, 18, 7, 1, ":"); rl.fill("g", 3, 18, 1, 6, ":"); rl.fill("g", 3, 23, 7, 1, ":");
  rl.fill("g", 11, 3, 6, 3, "\""); rl.fill("g", 3, 10, 5, 5, "\"");
  rl.fill("g", 12, 20, 6, 6, "0");
  rl.set("g", 5, 20, "$"); rl.set("g", 6, 20, "$"); rl.set("g", 5, 21, "$"); rl.set("g", 6, 21, "$");
  rl.set("g", 4, 20, "e"); rl.set("g", 7, 20, "e"); rl.set("g", 4, 21, "e"); rl.set("g", 7, 21, "e");
  rl.set("g", 8, 2, "N"); rl.set("g", 10, 26, "N");
  rl.set("g", 14, 12, "["); rl.set("g", 6, 5, "]");
  W.defineMap("route_tatton_rostherne", MQ.U.merge(D("bollin", "town_tatton_park", "route_bollin"), {
    name: "Rostherne Lane",
    legend: LAND, layers: rl.layers(),
    spawnPoint: { x: 9, y: 27 },
    encounters: { grass: "route_tatton_rostherne_grass", water: null },
    warps: [
      { x: 8, y: 0, to: "rostherne_mere", tx: 7, ty: 33, dir: "up", kind: "edge" },
      { x: 9, y: 0, to: "rostherne_mere", tx: 7, ty: 33, dir: "up", kind: "edge" },
      { x: 10, y: 0, to: "rostherne_mere", tx: 8, ty: 33, dir: "up", kind: "edge" },
      { x: 8, y: 29, to: "tatton_park", tx: 10, ty: 1, dir: "down", kind: "edge" },
      { x: 9, y: 29, to: "tatton_park", tx: 11, ty: 1, dir: "down", kind: "edge" },
      { x: 10, y: 29, to: "tatton_park", tx: 12, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 8, y: 2, text: ["ROSTHERNE — NO THROUGH ROAD. NATURE RESERVE. NO ACCESS TO THE WATER.",
        "Somebody has added a fourth line in marker: 'AND YET.'"] },
      { x: 10, y: 26, text: ["TATTON PARK NORTH GATE. Please shut it behind you. Yes, you. The deer are watching and they take notes."] }
    ],
    items: [
      { x: 15, y: 24, item: "capsule_brine", n: 3, hidden: true, flag: "item_rl_1" },
      { x: 5, y: 12, item: "tonic", n: 2, flag: "item_rl_2" }
    ],
    npcs: [
      { id: "npc_rl_lane", x: 9, y: 12, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["The lane goes to the church and stops. It has gone to the church and stopped since about 1300.",
          "Every road in this county was going somewhere until somebody built a church on it."] },
      { id: "npc_rl_birder", x: 10, y: 20, dir: "left", sprite: "npc_birder", behaviour: "wander", radius: 2,
        say: ["Heronry's on the island. Forty nests. You can hear them from here and you will never, ever see them."] }
    ]
  }));

  // =============== R9 — Ollerton & Goostrey lanes ========================
  const r9 = M.canvas(32, 48, ".");
  r9.fill("g", 0, 0, 32, 1, "T"); r9.fill("g", 0, 47, 32, 1, "T");
  r9.fill("g", 0, 1, 1, 46, "T"); r9.fill("g", 31, 1, 1, 46, "T");
  r9.fill("g", 14, 0, 3, 1, "+"); r9.fill("g", 14, 47, 3, 1, "+");
  B.trees(r9, "r9-hedge", 40, 2, 2, 28, 44, "T", "y", ["."]);
  // hedged fields either side of a lane that kinks twice
  r9.fill("g", 15, 1, 1, 12, "+");
  r9.fill("g", 6, 13, 10, 1, "+"); r9.fill("g", 6, 13, 1, 12, "+");
  r9.fill("g", 6, 24, 12, 1, "+"); r9.fill("g", 17, 24, 1, 10, "+");
  r9.fill("g", 17, 33, 8, 1, "+"); r9.fill("g", 24, 33, 1, 8, "+");
  r9.fill("g", 15, 40, 10, 1, "+"); r9.fill("g", 15, 40, 1, 7, "+");
  // the loop: a farm track that rejoins
  r9.fill("g", 22, 13, 1, 12, "+"); r9.fill("g", 16, 13, 7, 1, "+"); r9.fill("g", 18, 24, 5, 1, "+");
  // field hedges
  for (let i = 0; i < 5; i++) r9.fill("g", 2, 6 + i * 9, 28, 1, "h");
  r9.fill("g", 15, 6, 1, 1, "+"); r9.fill("g", 6, 15, 1, 1, "+"); r9.fill("g", 22, 15, 1, 1, "+");
  r9.set("g", 15, 6, "+"); r9.set("g", 6, 24, "+"); r9.set("g", 16, 24, "+"); r9.set("g", 17, 24, "+");
  r9.set("g", 17, 33, "+");
  for (let i = 0; i < 5; i++) { r9.set("g", 15, 6 + i * 9, "+"); r9.set("g", 6, 6 + i * 9, "."); r9.set("g", 24, 6 + i * 9, "."); }
  // the level crossing
  r9.fill("g", 1, 29, 30, 1, "F"); r9.fill("g", 1, 32, 30, 1, "F");
  r9.fill("g", 1, 30, 30, 2, "2");
  r9.fill("g", 17, 29, 1, 4, "+");
  r9.set("g", 16, 28, "4"); r9.set("g", 19, 33, "N");
  // grazing, tall grass, a pond and a hidden pocket behind a hedge
  r9.fill("g", 3, 3, 10, 3, "\""); r9.fill("g", 20, 3, 9, 3, "\"");
  r9.fill("g", 8, 17, 8, 5, "\""); r9.fill("g", 24, 17, 6, 6, "\"");
  r9.fill("g", 2, 35, 12, 4, "\""); r9.fill("g", 26, 41, 4, 5, "\"");
  M.lake(r9, 8, 42, 5, 3, "$", "e");
  r9.set("g", 10, 41, "Q");
  r9.fill("g", 26, 25, 4, 3, ",");
  r9.set("g", 25, 26, "h"); r9.set("g", 24, 26, "+");
  r9.set("g", 13, 1, "]"); r9.set("g", 28, 36, "[");
  r9.set("g", 16, 2, "N"); r9.set("g", 14, 45, "P");
  W.defineMap("route_knutsford_holmes", MQ.U.merge(D("dane", "town_holmes_chapel", "route_dane"), {
    name: "Ollerton & Goostrey Lanes",
    legend: LAND, layers: r9.layers(),
    spawnPoint: { x: 15, y: 2 },
    encounters: { grass: "route_knutsford_holmes_grass", water: null },
    warps: [
      { x: 14, y: 0, to: "knutsford", tx: 30, ty: 40, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "knutsford", tx: 31, ty: 40, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "knutsford", tx: 32, ty: 40, dir: "up", kind: "edge" },
      { x: 14, y: 47, to: "holmes_chapel", tx: 18, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 47, to: "holmes_chapel", tx: 19, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 47, to: "holmes_chapel", tx: 20, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 16, y: 2, text: ["OLLERTON · GOOSTREY · HOLMES CHAPEL.",
        "A brown tourist sign underneath, bolted on later: JODRELL BANK OBSERVATORY. Somebody has taped a sheet of A4 over it."] },
      { x: 19, y: 33, text: ["LEVEL CROSSING — USER WORKED.",
        "STOP · LOOK · LISTEN · TELEPHONE THE SIGNALLER.",
        "The telephone is a handset in a yellow box. It has been ringing back at people. It is not supposed to ring back at people."] },
      { x: 14, y: 45, text: ["HOLMES CHAPEL 1/2 MILE. The viaduct is the other side of the village and you will hear it before you see it."] }
    ],
    items: [
      { x: 28, y: 26, item: "elixir", n: 2, hidden: true, flag: "item_r9_1" },
      { x: 4, y: 4, item: "capsule_kernel", n: 3, flag: "item_r9_2" },
      { x: 29, y: 44, item: "rain_jar", n: 1, hidden: true, flag: "item_r9_3" },
      { x: 3, y: 37, item: "tonic", n: 3, flag: "item_r9_4" },
      { x: 12, y: 20, item: "capsule_mesh", n: 4, hidden: true, flag: "item_r9_5" }
    ],
    catGaps: [
      { x: 25, y: 26, item: "cat_token_4", n: 1, flag: "catgap_r9_1",
        say: "MEADOW goes under the hedge into the field nobody has cut since 1998 and comes back with something rusted, small and railway-shaped." }
    ],
    npcs: [
      { id: "npc_r9_ellis", x: 15, y: 10, dir: "down", sprite: "npc_farmer", behaviour: "look", radius: 3, trainer: "tr_route_knutsford_holmes_1", sight: 3, script: "mid_r9_ellis" },
      { id: "npc_r9_bev", x: 18, y: 31, dir: "left", sprite: "npc_signaller", behaviour: "still", trainer: "tr_route_knutsford_holmes_2", sight: 0, script: "mid_r9_crossing" },
      { id: "npc_r9_osian", x: 6, y: 19, dir: "right", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_route_knutsford_holmes_3", sight: 3 },
      { id: "npc_r9_lowri", x: 24, y: 37, dir: "left", sprite: "npc_kid", behaviour: "look", radius: 3, trainer: "tr_route_knutsford_holmes_4", sight: 3, script: "mid_r9_lowri" },
      { id: "npc_r9_sheep", x: 11, y: 36, dir: "down", sprite: "sheep", behaviour: "wander", radius: 4, script: "mid_r8_sheep" },
      { id: "npc_r9_dog", x: 21, y: 20, dir: "down", sprite: "dog", behaviour: "wander", radius: 3,
        say: ["The farm dog looks at you, decides you are not sheep, and loses interest with enormous dignity."] }
    ]
  }));

  // =============== R10 — Twemlow Viaduct meadows =========================
  const r10 = M.canvas(62, 34, ".");
  r10.fill("g", 0, 0, 62, 1, "T"); r10.fill("g", 0, 33, 62, 1, "T");
  r10.fill("g", 0, 1, 1, 32, "T"); r10.fill("g", 61, 1, 1, 32, "T");
  r10.fill("g", 0, 17, 1, 2, "+"); r10.fill("g", 61, 17, 1, 3, "+");
  B.trees(r10, "r10-willow", 40, 2, 2, 58, 30, "T", "y", ["."]);
  // the Dane, and a meadow path that crosses it twice
  r10.fill("g", 1, 21, 60, 1, "e");
  r10.fill("g", 1, 22, 60, 2, "!");
  r10.fill("g", 1, 24, 60, 1, "e");
  r10.fill("g", 1, 17, 20, 1, "+");
  r10.fill("g", 20, 17, 1, 9, "+");
  r10.fill("g", 20, 21, 3, 4, "<");
  r10.fill("g", 20, 25, 22, 1, "+");
  r10.fill("g", 41, 12, 1, 14, "+");
  r10.fill("g", 41, 21, 3, 4, "<");
  r10.fill("g", 41, 12, 20, 1, "+");
  r10.fill("g", 44, 12, 1, 6, "+"); r10.fill("g", 44, 17, 17, 1, "+");
  // the twenty-three arches, marching across the meadow
  M.viaduct(r10, 4, 5, 8, 6, "V", "^", "x");
  r10.fill("g", 4, 9, 46, 1, ",");
  r10.fill("g", 2, 12, 16, 1, "+"); r10.fill("g", 17, 9, 1, 9, "+");
  r10.set("g", 16, 5, "N"); r10.set("g", 34, 9, "N");
  // meadows, floodable, with a hidden arch
  r10.fill("g", 3, 27, 14, 5, "\""); r10.fill("g", 46, 27, 12, 5, "\"");
  r10.fill("g", 24, 13, 12, 6, "\""); r10.fill("g", 50, 2, 9, 5, "\"");
  r10.scatter("g", "r10-flower", "l", 16, 2, 26, 58, 6, ["."]);
  r10.set("g", 30, 4, "]"); r10.set("g", 56, 30, "[");
  r10.fill("g", 25, 26, 12, 5, ",");
  r10.set("g", 30, 30, "Q"); r10.set("g", 12, 22, "Q"); r10.set("g", 52, 23, "Q");
  r10.fill("g", 27, 25, 8, 1, "+");
  r10.set("g", 2, 18, "P"); r10.set("g", 58, 18, "P");
  W.defineMap("route_holmes_jodrell", MQ.U.merge(D("dane", "town_jodrell_bank", "route_dane"), {
    name: "Twemlow Meadows", ambience: "water",
    legend: LAND, layers: r10.layers(),
    spawnPoint: { x: 2, y: 17 },
    encounters: { grass: "route_holmes_jodrell_grass", water: "route_holmes_jodrell_water" },
    fishing: "fish_route_holmes_jodrell",
    warps: [
      { x: 0, y: 17, to: "holmes_chapel", tx: 42, ty: 14, dir: "left", kind: "edge" },
      { x: 0, y: 18, to: "holmes_chapel", tx: 42, ty: 15, dir: "left", kind: "edge" },
      { x: 61, y: 17, to: "jodrell_bank", tx: 21, ty: 40, dir: "right", kind: "edge" },
      { x: 61, y: 18, to: "jodrell_bank", tx: 22, ty: 40, dir: "right", kind: "edge" },
      { x: 61, y: 19, to: "jodrell_bank", tx: 23, ty: 40, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 2, y: 18, text: ["TWEMLOW VIADUCT — 23 arches, 1841, brick, and still carrying every express to Scotland.",
        "PLEASE DO NOT COUNT THE ARCHES WHILE STANDING ON THE LINE."] },
      { x: 16, y: 5, text: ["Arch 13. There is a plaque on it. There is no plaque on any other arch.",
        "It reads: FOR THE MEN WHO DID NOT COME UP. 1841. No names, because nobody wrote the names down."] },
      { x: 34, y: 9, text: ["FLOOD MEADOW. In rain the Dane takes this back within the hour and gives it up again by Friday.",
        "The path is on the bank. The bank is not a suggestion."] },
      { x: 58, y: 18, text: ["JODRELL BANK — 1 MILE. A brown sign, and a newer laminated one cable-tied over it: SITE CLOSED."] }
    ],
    items: [
      { x: 31, y: 29, item: "collectible_10", n: 1, hidden: true, flag: "item_r10_1" },
      { x: 54, y: 4, item: "elixir", n: 2, flag: "item_r10_2" },
      { x: 5, y: 30, item: "capsule_net", n: 3, hidden: true, flag: "item_r10_3" },
      { x: 47, y: 31, item: "tonic", n: 3, flag: "item_r10_4" },
      { x: 26, y: 15, item: "capsule_kernel", n: 3, hidden: true, flag: "item_r10_5" }
    ],
    catGaps: [
      { x: 24, y: 9, item: "cat_token_5", n: 1, flag: "catgap_r10_1",
        say: "MEADOW walks into arch nine, does not come out of arch nine, and appears twenty seconds later out of arch fourteen with an expression of enormous private satisfaction." }
    ],
    restPoints: [{ x: 29, y: 27, flag: "bigboy_sat_twemlow" }],
    npcs: [
      { id: "npc_r10_pryce", x: 14, y: 20, dir: "down", sprite: "npc_fisher", behaviour: "look", radius: 3, trainer: "tr_route_holmes_jodrell_1", sight: 3 },
      { id: "npc_r10_ivor", x: 43, y: 16, dir: "left", sprite: "npc_dev", behaviour: "still", trainer: "tr_route_holmes_jodrell_2", sight: 0, script: "mid_r10_ham" },
      { id: "npc_r10_aneira", x: 31, y: 27, dir: "up", sprite: "npc_birder", behaviour: "look", radius: 3, trainer: "tr_route_holmes_jodrell_3", sight: 3, script: "mid_r10_aneira" },
      { id: "npc_r10_vaughn", x: 55, y: 17, dir: "left", sprite: "npc_darkbyte", behaviour: "look", radius: 4, trainer: "tr_route_holmes_jodrell_4", sight: 4, script: "mid_r10_vaughn" },
      { id: "npc_r10_heron", x: 40, y: 20, dir: "down", sprite: "heron", behaviour: "still",
        say: ["A heron stands in the shallows with the patience of something that has never once been in a hurry and has always been fed."] }
    ]
  }));

  // =============== R11 — Brereton Heath & Astbury Mere ===================
  const r11 = M.canvas(32, 48, ".");
  r11.fill("g", 0, 0, 32, 1, "T"); r11.fill("g", 0, 47, 32, 1, "T");
  r11.fill("g", 0, 1, 1, 46, "T"); r11.fill("g", 31, 1, 1, 46, "T");
  r11.fill("g", 14, 0, 3, 1, "+"); r11.fill("g", 14, 47, 3, 1, "+");
  B.trees(r11, "r11-birch", 46, 2, 2, 28, 44, "B", "b", ["."]);
  r11.fill("g", 15, 1, 1, 46, "+");
  // Brereton Heath's lake, north; Astbury Mere, south; a path each side
  M.lake(r11, 4, 6, 9, 7, "1", "A");
  r11.fill("g", 3, 5, 1, 10, "+"); r11.fill("g", 3, 5, 12, 1, "+"); r11.fill("g", 3, 14, 12, 1, "+");
  r11.set("g", 6, 13, "U"); r11.set("g", 6, 12, "1");
  r11.set("g", 8, 8, "Q");
  M.lake(r11, 19, 30, 10, 8, "1", "A");
  r11.fill("g", 30, 29, 1, 11, "+"); r11.fill("g", 16, 29, 15, 1, "+"); r11.fill("g", 16, 39, 15, 1, "+");
  r11.set("g", 24, 29, "U"); r11.set("g", 24, 30, "1");
  r11.set("g", 22, 34, "Q"); r11.set("g", 27, 36, "Q");
  // the birdhide, hidden behind a hedge on the north shore
  r11.fill("g", 20, 25, 6, 3, ",");
  r11.box("g", 20, 25, 6, 3, "f");
  r11.set("g", 22, 27, "+"); r11.fill("g", 21, 26, 4, 1, ",");
  r11.set("g", 22, 28, "+"); r11.fill("g", 22, 28, 1, 1, "+");
  r11.fill("g", 16, 28, 7, 1, "+");
  r11.set("g", 21, 26, "e");
  // heath: sand, tall grass, adders, a stone
  r11.fill("g", 18, 4, 11, 7, "\""); r11.fill("g", 4, 18, 10, 6, "\"");
  r11.fill("g", 3, 41, 10, 5, "\""); r11.fill("g", 18, 15, 12, 6, "0");
  r11.scatter("g", "r11-heath", "5", 12, 2, 2, 28, 44, ["0"]);
  r11.set("g", 12, 30, "]"); r11.set("g", 27, 44, "[");
  r11.fill("g", 5, 26, 10, 1, "+"); r11.fill("g", 5, 26, 1, 8, "+"); r11.fill("g", 5, 33, 10, 1, "+");
  r11.fill("g", 6, 28, 8, 4, ",");
  r11.set("g", 16, 3, "N"); r11.set("g", 14, 41, "N"); r11.set("g", 26, 24, "P");
  W.defineMap("route_holmes_congleton", MQ.U.merge(D("dane", "town_congleton", "route_dane"), {
    name: "Brereton Heath", ambience: "forest",
    legend: LAND, layers: r11.layers(),
    spawnPoint: { x: 15, y: 2 },
    encounters: { grass: "route_holmes_congleton_grass", water: "route_holmes_congleton_water" },
    fishing: "fish_route_holmes_congleton",
    warps: [
      { x: 14, y: 0, to: "holmes_chapel", tx: 30, ty: 34, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "holmes_chapel", tx: 31, ty: 34, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "holmes_chapel", tx: 32, ty: 34, dir: "up", kind: "edge" },
      { x: 14, y: 47, to: "congleton", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 47, to: "congleton", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 47, to: "congleton", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 16, y: 3, text: ["BRERETON HEATH LOCAL NATURE RESERVE.",
        "Sand, birch and a lake that was a sand quarry until 1975. Everything beautiful round here used to be a hole in the ground."] },
      { x: 26, y: 24, text: ["THE BIRD HIDE. Six seats, one slot, and a laminated list of what you might see.",
        "Somebody has been sleeping in here. There is a sleeping bag, a flask, and a notebook of azimuth bearings."] },
      { x: 14, y: 41, text: ["ASTBURY MERE — CONGLETON 1 MILE. Beyond the water, on a clear day, the Cloud.",
        "Under the sign: 'if you see a bear on the Cloud, that is a bear on the Cloud.'"] }
    ],
    items: [
      { x: 10, y: 30, item: "capsule_night", n: 4, hidden: true, flag: "item_r11_1" },
      { x: 23, y: 26, item: "ghost_lens", n: 1, hidden: true, flag: "item_r11_2" },
      { x: 27, y: 7, item: "elixir", n: 2, flag: "item_r11_3" },
      { x: 5, y: 44, item: "tonic", n: 3, hidden: true, flag: "item_r11_4" },
      { x: 28, y: 18, item: "capsule_heavy", n: 2, flag: "item_r11_5" }
    ],
    npcs: [
      { id: "npc_r11_bethan", x: 4, y: 14, dir: "down", sprite: "npc_fisher", behaviour: "look", radius: 3, trainer: "tr_route_holmes_congleton_1", sight: 3 },
      { id: "npc_r11_tegwen", x: 15, y: 20, dir: "right", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_route_holmes_congleton_2", sight: 3, script: "mid_r11_tegwen" },
      { id: "npc_r11_marchel", x: 21, y: 29, dir: "up", sprite: "npc_kid", behaviour: "look", radius: 3, trainer: "tr_route_holmes_congleton_3", sight: 3 },
      { id: "npc_r11_hide", x: 23, y: 27, dir: "up", sprite: "npc_birder", behaviour: "still", script: "mid_r11_hide" }
    ]
  }));

  // =============== R12 — Biddulph Valley Way =============================
  const r12 = M.canvas(32, 40, ".");
  r12.fill("g", 0, 0, 32, 1, "T"); r12.fill("g", 0, 39, 32, 1, "T");
  r12.fill("g", 0, 1, 1, 38, "T"); r12.fill("g", 31, 1, 1, 38, "T");
  r12.fill("g", 14, 0, 3, 1, ":"); r12.fill("g", 14, 39, 3, 1, ":");
  B.trees(r12, "r12-cutting", 44, 2, 2, 28, 36, "T", "y", ["."]);
  // the old railway: a straight cutting with banks either side
  r12.fill("g", 13, 1, 5, 38, ":");
  r12.fill("g", 11, 1, 2, 38, "7"); r12.fill("g", 18, 1, 2, 38, "7");
  r12.fill("g", 12, 8, 1, 4, ">"); r12.fill("g", 19, 24, 1, 4, ">");
  // the tramway remains, a loop up onto the bank and back
  r12.fill("g", 5, 12, 8, 1, "+"); r12.fill("g", 5, 12, 1, 10, "+"); r12.fill("g", 5, 21, 8, 1, "+");
  r12.fill("g", 17, 26, 11, 1, "+"); r12.fill("g", 27, 26, 1, 8, "+"); r12.fill("g", 17, 33, 11, 1, "+");
  r12.fill("g", 6, 14, 6, 6, "\""); r12.fill("g", 21, 28, 6, 4, "\"");
  r12.fill("g", 3, 3, 8, 6, "\""); r12.fill("g", 21, 4, 8, 7, "0");
  r12.fill("g", 3, 30, 7, 7, "0"); r12.fill("g", 22, 15, 8, 6, "\"");
  r12.scatter("g", "r12-sleeper", "[", 14, 13, 2, 5, 36, [":"]);
  r12.fill("g", 8, 16, 3, 2, ",");
  r12.set("g", 7, 17, "3"); r12.set("g", 9, 17, "3");
  r12.set("g", 12, 4, "N"); r12.set("g", 18, 36, "N");
  r12.set("g", 29, 24, "]"); r12.set("g", 2, 26, "5");
  W.defineMap("route_congleton_moreton", MQ.U.merge(D("dane", "town_congleton", "route_dane"), {
    name: "Biddulph Valley Way",
    legend: LAND, layers: r12.layers(),
    spawnPoint: { x: 15, y: 2 },
    encounters: { grass: "route_congleton_moreton_grass", water: null },
    warps: [
      { x: 14, y: 0, to: "congleton", tx: 30, ty: 38, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "congleton", tx: 31, ty: 38, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "congleton", tx: 32, ty: 38, dir: "up", kind: "edge" },
      { x: 14, y: 39, to: "little_moreton_hall", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 39, to: "little_moreton_hall", tx: 17, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 39, to: "little_moreton_hall", tx: 18, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 12, y: 4, text: ["BIDDULPH VALLEY WAY. Mineral railway, 1860–1968. Now a path, a cycleway and a corridor for everything with legs.",
        "THE CUTTING IS NOT LIT."] },
      { x: 18, y: 36, text: ["LITTLE MORETON HALL — 1/2 MILE.",
        "'THE HOUSE LEANS. IT HAS LEANED SINCE 1580. IT IS NOT GOING TO FALL OVER TODAY, PROBABLY.' — the guidebook, paraphrased"] }
    ],
    items: [
      { x: 9, y: 16, item: "capsule_kernel", n: 3, hidden: true, flag: "item_r12_1" },
      { x: 24, y: 30, item: "elixir", n: 2, flag: "item_r12_2" },
      { x: 4, y: 34, item: "tonic", n: 3, hidden: true, flag: "item_r12_3" },
      { x: 27, y: 7, item: "capsule_net", n: 3, flag: "item_r12_4" }
    ],
    npcs: [
      { id: "npc_r12_maddox", x: 15, y: 10, dir: "down", sprite: "npc_cyclist", behaviour: "look", radius: 4, trainer: "tr_route_congleton_moreton_1", sight: 4 },
      { id: "npc_r12_hesketh", x: 8, y: 21, dir: "right", sprite: "npc_farmer", behaviour: "look", radius: 3, trainer: "tr_route_congleton_moreton_2", sight: 3 },
      { id: "npc_r12_pryderi", x: 24, y: 26, dir: "left", sprite: "npc_amos", behaviour: "still", trainer: "tr_route_congleton_moreton_3", sight: 0, script: "mid_r12_amos" },
      { id: "npc_r12_tramway", x: 8, y: 17, dir: "up", sprite: "npc_historian", behaviour: "still",
        say: ["Tramway remains. Two stone sleeper blocks and a lot of imagination.",
          "Ran coal to the canal. Everything in Cheshire ran something to the canal."] }
    ]
  }));

  // =============== The Mow Cop lane ======================================
  const r13 = M.canvas(32, 40, ".");
  r13.fill("g", 0, 0, 32, 1, "T"); r13.fill("g", 0, 39, 32, 1, "6");
  r13.fill("g", 0, 1, 1, 38, "T"); r13.fill("g", 31, 1, 1, 38, "T");
  r13.fill("g", 14, 0, 3, 1, "+"); r13.fill("g", 14, 39, 3, 1, "+");
  B.trees(r13, "r13-lane", 34, 2, 2, 28, 24, "T", "y", ["."]);
  r13.fill("g", 1, 24, 30, 15, "0");
  r13.fill("g", 15, 1, 1, 38, "+");
  r13.fill("g", 8, 10, 8, 1, "+"); r13.fill("g", 8, 10, 1, 8, "+"); r13.fill("g", 8, 17, 8, 1, "+");
  r13.fill("g", 16, 28, 9, 1, "+"); r13.fill("g", 24, 21, 1, 8, "+"); r13.fill("g", 16, 21, 9, 1, "+");
  r13.fill("g", 2, 30, 30, 2, "6");
  r13.fill("g", 15, 30, 1, 2, "8");
  r13.fill("g", 4, 4, 9, 5, "\""); r13.fill("g", 19, 5, 9, 6, "\"");
  r13.fill("g", 9, 12, 6, 5, "\""); r13.fill("g", 17, 23, 6, 5, "\"");
  r13.scatter("g", "r13-grit", "4", 22, 2, 24, 28, 14, ["0"]);
  r13.scatter("g", "r13-boulder", "5", 8, 2, 24, 28, 14, ["0"]);
  r13.set("g", 14, 3, "N"); r13.set("g", 16, 33, "N");
  r13.fill("g", 25, 33, 5, 4, ",");
  r13.set("g", 24, 35, "h"); r13.set("g", 23, 35, "+");
  r13.fill("g", 16, 35, 8, 1, "+");
  W.defineMap("route_moreton_mowcop", MQ.U.merge(D("dane", "town_congleton", "route_dane"), {
    name: "The Mow Cop Lane", ambience: "moor",
    legend: LAND, layers: r13.layers(),
    spawnPoint: { x: 15, y: 2 },
    encounters: { grass: "route_moreton_mowcop_grass", water: null },
    warps: [
      { x: 14, y: 0, to: "little_moreton_hall", tx: 16, ty: 28, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "little_moreton_hall", tx: 17, ty: 28, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "little_moreton_hall", tx: 18, ty: 28, dir: "up", kind: "edge" },
      { x: 14, y: 39, to: "mow_cop", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 39, to: "mow_cop", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 39, to: "mow_cop", tx: 17, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 14, y: 3, text: ["GRITSTONE TRAIL — MOW COP 2 MILES. The last two miles and every yard of them uphill."] },
      { x: 16, y: 33, text: ["THE EDGE. Cheshire on one side, Staffordshire on the other, and a wall down the middle that nobody has moved since 1550.",
        "The scramble up is short and unkind. There is a way round for the sensible."] }
    ],
    items: [
      { x: 28, y: 35, item: "capsule_heavy", n: 3, hidden: true, flag: "item_r13_1" },
      { x: 5, y: 6, item: "elixir", n: 2, flag: "item_r13_2" },
      { x: 27, y: 26, item: "tonic", n: 3, hidden: true, flag: "item_r13_3" }
    ],
    catGaps: [
      { x: 24, y: 35, item: "cat_token_6", n: 1, flag: "catgap_r13_1",
        say: "MEADOW goes under the wall into Staffordshire, sits there for a moment to make a point, and comes back into Cheshire with a small carved stone." }
    ],
    npcs: [
      { id: "npc_r13_walker", x: 15, y: 14, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["Two miles. Everybody says two miles. It's two miles the way a cliff is a hill."] },
      { id: "npc_r13_runner", x: 20, y: 25, dir: "left", sprite: "npc_fellrunner", behaviour: "wander", radius: 3,
        say: ["Trail's thirty-five miles end to end. I'm doing it in a day. I've been doing it in a day since Tuesday."] }
    ]
  }));

  // =============== R13 — Wheelock canal & Rode Heath =====================
  const r14 = M.canvas(64, 32, ".");
  r14.fill("g", 0, 0, 64, 1, "T"); r14.fill("g", 0, 31, 64, 1, "T");
  r14.fill("g", 0, 1, 1, 30, "T"); r14.fill("g", 63, 1, 1, 30, "T");
  r14.fill("g", 0, 15, 1, 3, "t"); r14.fill("g", 63, 15, 1, 3, "t");
  B.trees(r14, "r14-towpath", 34, 2, 2, 60, 28, "T", "y", ["."]);
  // the cut, with a flight of locks and a towpath both sides
  r14.fill("g", 1, 14, 62, 1, "t");
  r14.fill("g", 1, 15, 62, 3, "~");
  r14.fill("g", 1, 18, 62, 1, "t");
  for (let i = 0; i < 6; i++) {
    const x = 8 + i * 9;
    r14.fill("g", x, 15, 1, 3, "K");
    r14.set("g", x, 14, "x"); r14.set("g", x, 18, "x");
  }
  r14.fill("g", 1, 15, 2, 3, "="); r14.fill("g", 61, 15, 2, 3, "=");
  r14.fill("g", 30, 13, 3, 7, "x");
  r14.fill("g", 30, 10, 3, 4, "=");
  r14.fill("g", 30, 19, 3, 4, "=");
  // Rode Heath pool, the old salt works, and a hedge pocket
  M.lake(r14, 42, 4, 12, 6, "$", "e");
  r14.set("g", 44, 3, "Q"); r14.set("g", 51, 11, "Q");
  r14.fill("g", 41, 11, 16, 1, "="); r14.fill("g", 56, 3, 1, 9, "="); r14.fill("g", 41, 3, 16, 1, "=");
  r14.fill("g", 41, 3, 1, 9, "=");
  r14.fill("g", 33, 12, 9, 1, "=");
  r14.fill("g", 6, 4, 14, 7, "\""); r14.fill("g", 8, 22, 12, 6, "\"");
  r14.fill("g", 36, 22, 14, 6, "\""); r14.fill("g", 54, 20, 8, 8, "0");
  r14.fill("g", 20, 6, 8, 5, ",");
  r14.box("g", 20, 6, 8, 5, "h");
  r14.set("g", 24, 11, ","); r14.set("g", 24, 12, "=");
  r14.fill("g", 21, 12, 12, 1, "=");
  r14.fill("g", 21, 7, 6, 3, ",");
  r14.set("g", 22, 8, "5"); r14.set("g", 26, 9, "5");
  r14.set("g", 4, 13, "N"); r14.set("g", 60, 13, "N"); r14.set("g", 34, 19, "P");
  r14.fill("g", 2, 20, 26, 1, "=");
  r14.fill("g", 33, 20, 28, 1, "=");
  W.defineMap("route_congleton_sandbach", MQ.U.merge(D("dane", "town_sandbach", "route_dane"), {
    name: "The Wheelock Flight", ambience: "water",
    legend: LAND, layers: r14.layers(),
    spawnPoint: { x: 62, y: 16 },
    encounters: { grass: "route_congleton_sandbach_grass", water: "route_congleton_sandbach_water" },
    fishing: "fish_route_congleton_sandbach",
    warps: [
      { x: 0, y: 15, to: "sandbach", tx: 44, ty: 14, dir: "left", kind: "edge" },
      { x: 0, y: 16, to: "sandbach", tx: 44, ty: 15, dir: "left", kind: "edge" },
      { x: 0, y: 17, to: "sandbach", tx: 44, ty: 16, dir: "left", kind: "edge" },
      { x: 63, y: 15, to: "congleton", tx: 1, ty: 20, dir: "right", kind: "edge" },
      { x: 63, y: 16, to: "congleton", tx: 1, ty: 21, dir: "right", kind: "edge" },
      { x: 63, y: 17, to: "congleton", tx: 1, ty: 22, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 60, y: 13, text: ["TRENT & MERSEY CANAL — WHEELOCK FLIGHT.",
        "Sixteen locks in a mile and a half. Allow four hours and expect to know everybody's business by the end of it."] },
      { x: 4, y: 13, text: ["SANDBACH 1/2 MILE. The cut goes on to Middlewich and the salt, and it always did."] },
      { x: 34, y: 19, text: ["RODE HEATH. There were salt works here and a rise where the boats waited.",
        "Now it is a pool with a heron in it and a bench with a plaque about a dog."] }
    ],
    items: [
      { x: 16, y: 24, item: "elixir", n: 2, hidden: true, flag: "item_r14_1" },
      { x: 58, y: 25, item: "capsule_root", n: 3, flag: "item_r14_2" },
      { x: 12, y: 25, item: "tonic", n: 3, flag: "item_r14_3" },
      { x: 46, y: 26, item: "capsule_brine", n: 3, hidden: true, flag: "item_r14_4" },
      { x: 3, y: 6, item: "rod_weighted", n: 1, hidden: true, flag: "item_r14_5" }
    ],
    catGaps: [
      { x: 24, y: 10, item: "cat_bell", n: 1, flag: "catgap_r14_1",
        say: "MEADOW slips through the hedge into the old wharf yard, walks round something rusting under a tarpaulin twice, and sits down facing it." }
    ],
    restPoints: [{ x: 35, y: 19, flag: "bigboy_sat_rodeheath" }],
    npcs: [
      { id: "npc_r14_del", x: 20, y: 14, dir: "down", sprite: "npc_boater", behaviour: "look", radius: 3, trainer: "tr_route_congleton_sandbach_1", sight: 3, script: "mid_r14_del" },
      { id: "npc_r14_rhodri", x: 45, y: 12, dir: "up", sprite: "npc_fisher", behaviour: "look", radius: 3, trainer: "tr_route_congleton_sandbach_2", sight: 3, script: "mid_r14_rhodri" },
      { id: "npc_r14_josh", x: 12, y: 20, dir: "down", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_congleton_sandbach_3", sight: 4, script: "mid_r14_josh" },
      { id: "npc_r14_lockkeeper", x: 35, y: 14, dir: "down", sprite: "npc_boater", behaviour: "still",
        say: ["Sixteen locks. Sixteen. And every one of them a hole you fill up and empty out again for the sake of six feet.",
          "It's the most patient machine ever built and it's made of wood."] },
      { id: "npc_r14_duck", x: 26, y: 15, dir: "left", sprite: "duck", behaviour: "wander", radius: 4,
        say: ["A duck considers you, considers the water, and returns to the water without comment."] }
    ]
  }));

  // =============== R14 — the Elworth cut ================================
  const r15 = M.canvas(32, 40, ".");
  r15.fill("g", 0, 0, 32, 1, "T"); r15.fill("g", 0, 39, 32, 1, "T");
  r15.fill("g", 0, 1, 1, 38, "T"); r15.fill("g", 31, 1, 1, 38, "T");
  r15.fill("g", 14, 0, 3, 1, ":"); r15.fill("g", 14, 39, 3, 1, ":");
  B.trees(r15, "r15-embank", 30, 2, 2, 28, 36, "T", "y", ["."]);
  // the railway embankment: four tracks down the east side, a path below it
  r15.fill("g", 22, 1, 8, 38, ":");
  M.sidings(r15, 23, 3, 6, 4, 9, "2", ":");
  r15.fill("g", 20, 1, 2, 38, "7");
  r15.fill("g", 21, 12, 1, 3, ">"); r15.fill("g", 21, 28, 1, 3, ">");
  r15.fill("g", 14, 1, 5, 38, ":");
  r15.fill("g", 19, 6, 1, 1, ":"); r15.fill("g", 19, 22, 1, 1, ":");
  r15.fill("g", 20, 6, 2, 1, ":"); r15.fill("g", 20, 22, 2, 1, ":");
  // the cut on the west, with a loop over a bridge
  r15.fill("g", 5, 1, 1, 38, "t");
  r15.fill("g", 6, 1, 3, 38, "~");
  r15.fill("g", 9, 1, 1, 38, "t");
  r15.fill("g", 4, 10, 6, 1, "x"); r15.fill("g", 4, 30, 6, 1, "x");
  r15.fill("g", 10, 10, 5, 1, ":"); r15.fill("g", 10, 30, 5, 1, ":");
  r15.fill("g", 1, 10, 4, 1, ":"); r15.fill("g", 1, 10, 1, 21, ":"); r15.fill("g", 1, 30, 4, 1, ":");
  r15.fill("g", 2, 14, 3, 6, "\"");
  r15.set("g", 7, 20, "Q"); r15.set("g", 7, 5, "Q");
  r15.fill("g", 11, 14, 3, 8, "\""); r15.fill("g", 24, 20, 5, 6, "\"");
  r15.set("g", 26, 12, "4"); r15.set("g", 26, 32, "4");
  r15.fill("g", 25, 34, 5, 4, ",");
  r15.set("g", 24, 36, "h"); r15.set("g", 23, 36, ":");
  r15.set("g", 13, 3, "N"); r15.set("g", 13, 36, "N");
  r15.set("g", 29, 3, "5"); r15.set("g", 3, 36, "[");
  W.defineMap("route_sandbach_crewe", MQ.U.merge(D("south", "town_crewe", "route_south"), {
    name: "The Elworth Cut", ambience: "industrial",
    legend: LAND, layers: r15.layers(),
    spawnPoint: { x: 15, y: 2 },
    encounters: { grass: "route_sandbach_crewe_grass", water: "route_sandbach_crewe_water" },
    fishing: "fish_route_congleton_sandbach",
    warps: [
      { x: 14, y: 0, to: "sandbach", tx: 20, ty: 36, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "sandbach", tx: 21, ty: 36, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "sandbach", tx: 22, ty: 36, dir: "up", kind: "edge" },
      { x: 14, y: 39, to: "crewe", tx: 24, ty: 1, dir: "down", kind: "edge" },
      { x: 15, y: 39, to: "crewe", tx: 25, ty: 1, dir: "down", kind: "edge" },
      { x: 16, y: 39, to: "crewe", tx: 26, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 13, y: 3, text: ["ELWORTH. Salt on one side, the West Coast Main Line on the other, and a footpath between them that nobody planned.",
        "DO NOT CROSS THE LINE. There is no crossing. There has never been a crossing. People cross the line."] },
      { x: 13, y: 36, text: ["CREWE 1 MILE.",
        "Under it, in the same hand as the sign in Sandbach: 'the sparks are friendly. the fog is not.'"] }
    ],
    items: [
      { x: 28, y: 36, item: "capsule_root", n: 3, hidden: true, flag: "item_r15_1" },
      { x: 3, y: 17, item: "elixir", n: 2, flag: "item_r15_2" },
      { x: 12, y: 18, item: "tonic", n: 3, hidden: true, flag: "item_r15_3" },
      { x: 27, y: 24, item: "copper_coil", n: 1, hidden: true, flag: "item_r15_4" }
    ],
    catGaps: [
      { x: 24, y: 36, item: "cat_token_9", n: 1, flag: "catgap_r15_1",
        say: "MEADOW goes under the lineside fence, walks the cess beside four running lines without hurrying, and returns with a ballast stone she is inexplicably proud of." }
    ],
    npcs: [
      { id: "npc_r15_owain", x: 15, y: 12, dir: "down", sprite: "npc_signaller", behaviour: "look", radius: 3, trainer: "tr_route_sandbach_crewe_1", sight: 3, script: "mid_r15_owain" },
      { id: "npc_r15_kai", x: 19, y: 22, dir: "right", sprite: "npc_kid", behaviour: "look", radius: 3, trainer: "tr_route_sandbach_crewe_2", sight: 3, script: "mid_r15_kai" },
      { id: "npc_r15_immy", x: 15, y: 32, dir: "down", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_sandbach_crewe_3", sight: 4, script: "mid_r15_immy" },
      { id: "npc_r15_angler", x: 10, y: 20, dir: "left", sprite: "npc_fisher", behaviour: "still",
        say: ["Cut on one side, expresses on the other. Best swim in Cheshire if you like being startled every four minutes."] }
    ]
  }));
})();
