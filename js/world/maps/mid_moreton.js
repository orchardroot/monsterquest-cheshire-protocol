// =============================================================
// MonsterQuest v2 — BOSLEY CLOUD, LITTLE MORETON HALL and MOW COP
// (region dane, Ch.4). The gritstone edge above Congleton, a moated
// Tudor house that has been falling over politely since 1580, and a
// castle built in 1754 to look ruined — the end of the Gritstone Trail.
// Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const GRIT = M.moor();
  const HALL = M.moor({ "E": "wall_tudor", "J": "wall_tudor_beam", "1": "water" });
  const DC = { region: "dane", dialogue: "town_congleton", music: "route_dane", owner: "mid" };

  // ------------------------------------------------------- Bosley Cloud ---
  const b = M.canvas(40, 40, ";");
  b.fill("g", 0, 0, 40, 1, "6"); b.fill("g", 0, 39, 40, 1, "T");
  b.fill("g", 0, 1, 1, 38, "T"); b.fill("g", 39, 1, 1, 38, "T");
  b.fill("g", 18, 0, 3, 1, "2");
  b.fill("g", 0, 30, 1, 2, "2");

  // lower slopes: bracken, birch, drystone walls
  b.fill("g", 1, 24, 38, 15, ".");
  B.trees(b, "cloud-birch", 34, 2, 25, 36, 13, "B", "b", ["."]);
  b.fill("g", 3, 33, 10, 4, "\""); b.fill("g", 24, 27, 9, 4, "\"");
  b.fill("g", 1, 12, 38, 12, "0");
  b.scatter("g", "cloud-rock", "4", 26, 2, 2, 36, 21, ["0", ";"]);
  b.scatter("g", "cloud-boulder", "5", 12, 2, 12, 36, 11, ["0"]);

  // the edge itself: a cliff band with one climb
  b.fill("g", 2, 10, 36, 2, "6");
  b.fill("g", 19, 10, 1, 2, "8");
  b.fill("g", 1, 2, 38, 8, "7");
  b.fill("g", 4, 3, 32, 6, ";");
  b.fill("g", 12, 4, 16, 4, "0");

  // the switchback path up from Congleton
  b.fill("g", 1, 30, 12, 1, "2");
  b.fill("g", 12, 22, 1, 9, "2");
  b.fill("g", 12, 22, 15, 1, "2");
  b.fill("g", 26, 14, 1, 9, "2");
  b.fill("g", 19, 14, 8, 1, "2");
  b.fill("g", 19, 12, 1, 3, "2");
  b.fill("g", 19, 3, 1, 8, "2");
  b.fill("g", 18, 1, 3, 3, "2");
  b.set("g", 20, 4, "3"); b.set("g", 18, 6, "3");
  b.set("g", 13, 29, "N"); b.set("g", 20, 3, "N");

  // the Bridestones, robbed for a road in 1764 and still humming
  b.fill("g", 29, 18, 5, 1, "3");
  b.fill("g", 29, 20, 5, 1, "3");
  b.set("g", 31, 19, ";"); b.set("g", 30, 19, "3"); b.set("g", 32, 19, "3");
  b.fill("g", 27, 19, 2, 1, "2"); b.set("g", 28, 19, "2");
  b.set("g", 35, 19, "N");
  b.fill("g", 26, 19, 1, 1, "2");

  W.defineMap("bosley_cloud", MQ.U.merge(DC, {
    name: "Bosley Cloud", outdoor: true, weatherZone: "dane", ambience: "moor",
    legend: GRIT, layers: b.layers(),
    spawnPoint: { x: 1, y: 30 },
    landmark: { name: "The Cloud", x: 19, y: 5 },
    encounters: { grass: "bosley_cloud_grass", water: null },
    warps: [
      { x: 0, y: 30, to: "congleton", tx: 48, ty: 14, dir: "left", kind: "edge" },
      { x: 0, y: 31, to: "congleton", tx: 48, ty: 15, dir: "left", kind: "edge" },
      { x: 18, y: 0, to: "teggs_nose", tx: 30, ty: 32, dir: "up", kind: "edge" },
      { x: 19, y: 0, to: "teggs_nose", tx: 31, ty: 32, dir: "up", kind: "edge" },
      { x: 20, y: 0, to: "teggs_nose", tx: 31, ty: 32, dir: "up", kind: "edge" }
    ],
    signs: [
      { x: 13, y: 29, text: ["BOSLEY CLOUD — 1,125 ft. GRITSTONE TRAIL.",
        "The path goes up in six switchbacks because the alternative is a ladder, and in 1908 somebody tried the ladder."] },
      { x: 20, y: 3, text: ["THE VIEWPOINT.",
        "Seven counties on a clear day, they say. You can count five and a rumour, and on a very clear one, a white dish in the plain.",
        "It is not pointing at the sky."] },
      { x: 35, y: 19, text: ["THE BRIDESTONES — a Neolithic chambered tomb. Most of it went into the Congleton turnpike in 1764.",
        "In fog the remaining stones hum. Not the wind. A hum with gaps in it, and the gaps are regular."] }
    ],
    items: [
      { x: 6, y: 6, item: "viewpoint_bosley_cloud", n: 1, flag: "item_bosley_cloud_1" },
      { x: 36, y: 36, item: "elixir", n: 2, hidden: true, flag: "item_bosley_cloud_2" },
      { x: 3, y: 14, item: "capsule_heavy", n: 3, hidden: true, flag: "item_bosley_cloud_3" },
      { x: 36, y: 5, item: "collectible_12", n: 1, hidden: true, flag: "item_bosley_cloud_4" },
      { x: 34, y: 24, item: "tonic", n: 3, flag: "item_bosley_cloud_5" }
    ],
    restPoints: [{ x: 20, y: 22, flag: "meadow_sat_bosley" }],
    npcs: [
      { id: "npc_bosley_aeronwy", x: 12, y: 26, dir: "up", sprite: "npc_fellrunner", behaviour: "look", radius: 3, trainer: "tr_bosley_cloud_1", sight: 3 },
      { id: "npc_bosley_idwal", x: 27, y: 19, dir: "right", sprite: "npc_historian", behaviour: "still", trainer: "tr_bosley_cloud_2", sight: 0, script: "mid_bosley_idwal" },
      { id: "npc_bosley_gwenlli", x: 21, y: 5, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_bosley_cloud_3", sight: 3 },
      { id: "npc_bosley_bearwatch", x: 26, y: 25, dir: "left", sprite: "npc_ranger", behaviour: "still", script: "mid_bosley_bear" }
    ],
    triggers: [
      { x: 18, y: 3, w: 3, h: 1, script: "mid_bosley_summit", once: "bosley_summit", cond: "!bosley_summit" }
    ]
  }));

  // ------------------------------------------------ Little Moreton Hall --
  const h = M.canvas(36, 30, ".");
  h.fill("g", 0, 0, 36, 1, "T"); h.fill("g", 0, 29, 36, 1, "T");
  h.fill("g", 0, 1, 1, 28, "T"); h.fill("g", 35, 1, 1, 28, "T");
  h.fill("g", 16, 0, 3, 1, "+"); h.fill("g", 16, 29, 3, 1, "+");
  B.trees(h, "lmh-park", 26, 2, 2, 32, 26, "T", "y", ["."]);
  h.fill("g", 16, 1, 3, 5, "+");
  h.fill("g", 16, 24, 3, 5, "+");
  h.fill("g", 3, 6, 30, 18, ",");
  // the moat and the house
  M.moat(h, 8, 8, 20, 14, 2, "1", "x", 17);
  h.fill("g", 10, 10, 16, 10, ",");
  B.house(h, { x: 11, y: 11, w: 14, h: 8, rh: 2, wall: "E", win: "J", door: "D", doorX: 6, over: "^" });
  h.set("g", 12, 11, "m"); h.set("g", 23, 11, "m");
  h.fill("g", 16, 19, 3, 1, ",");
  h.set("g", 15, 20, "N");
  // the knot garden and the orchard
  h.fill("g", 4, 8, 3, 6, "l"); h.fill("g", 29, 8, 3, 6, "o");
  h.fill("g", 4, 16, 4, 6, "\""); h.fill("g", 28, 16, 5, 6, "\"");
  h.set("g", 6, 22, "]"); h.set("g", 31, 22, "[");
  h.set("g", 33, 6, "z");
  h.fill("g", 3, 24, 30, 1, "+");
  W.defineMap("little_moreton_hall", MQ.U.merge(DC, {
    name: "Little Moreton Hall", outdoor: true, weatherZone: "dane", ambience: "town", music: "town_congleton",
    legend: HALL, layers: h.layers(),
    spawnPoint: { x: 17, y: 2 },
    landmark: { name: "Little Moreton Hall", x: 17, y: 15 },
    encounters: { grass: "little_moreton_hall_grass", water: "little_moreton_hall_water" },
    fishing: "fish_route_holmes_congleton",
    warps: [
      { x: 16, y: 0, to: "route_congleton_moreton", tx: 14, ty: 38, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "route_congleton_moreton", tx: 15, ty: 38, dir: "up", kind: "edge" },
      { x: 18, y: 0, to: "route_congleton_moreton", tx: 16, ty: 38, dir: "up", kind: "edge" },
      { x: 16, y: 29, to: "route_moreton_mowcop", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 17, y: 29, to: "route_moreton_mowcop", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 18, y: 29, to: "route_moreton_mowcop", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 17, y: 18, to: "little_moreton_hall_interior", tx: 14, ty: 22, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 15, y: 20, text: ["LITTLE MORETON HALL, begun about 1504 and finished about 1610 by people who kept changing their minds.",
        "The long gallery on the top was an afterthought. It weighs more than the house was designed for.",
        "It has been leaning since roughly the week it was built and it is still there, which is the whole point of it."] }
    ],
    items: [
      { x: 5, y: 21, item: "capsule_night", n: 3, flag: "item_moreton_1" },
      { x: 32, y: 21, item: "elixir", n: 1, hidden: true, flag: "item_moreton_2" },
      { x: 3, y: 27, item: "tonic", n: 2, hidden: true, flag: "item_moreton_3" }
    ],
    catGaps: [
      { x: 30, y: 12, item: "cat_bell", n: 1, flag: "catgap_moreton_1",
        say: "MEADOW walks the top of the moat wall, which is four inches wide and has a fourteen-foot drop on both sides, and does it while looking at you." }
    ],
    npcs: [
      { id: "npc_moreton_housekeeper", x: 21, y: 19, dir: "down", sprite: "npc_granny", behaviour: "still", trainer: "tr_little_moreton_hall_1", sight: 0,
        script: "mid_moreton_housekeeper" },
      { id: "npc_moreton_moatkey", x: 13, y: 19, dir: "down", sprite: "npc_walker", behaviour: "still", script: "mid_moreton_moat" },
      { id: "npc_moreton_visitor", x: 30, y: 25, dir: "up", sprite: "npc_tourist", behaviour: "wander", radius: 3,
        say: ["Nothing in it is level. Not one floor, not one window, not one door frame.",
          "And it has stood for five hundred years. There's a lesson in that and I refuse to say it out loud."] }
    ]
  }));

  const li = M.room(30, 24, { floor: "%", wall: "]", top: "^", win: "W" });
  li.fill("g", 2, 3, 10, 1, "S"); li.fill("g", 18, 3, 10, 1, "S");
  li.fill("g", 4, 6, 6, 1, "t"); li.fill("g", 4, 7, 6, 1, "h");
  li.fill("g", 20, 6, 6, 1, "t"); li.fill("g", 20, 7, 6, 1, "h");
  li.fill("g", 13, 5, 4, 3, "f");
  li.fill("g", 2, 11, 26, 1, "|");
  li.fill("g", 3, 14, 24, 1, "%");
  li.fill("g", 6, 17, 4, 1, "z"); li.fill("g", 20, 17, 4, 1, "y");
  li.set("g", 28, 3, "a"); li.set("g", 1, 3, "j");
  li.set("g", 15, 12, "\\"); li.set("g", 2, 20, "\\");
  W.defineMap("little_moreton_hall_interior", MQ.U.merge(DC, {
    name: "Little Moreton Hall — the Long Gallery", outdoor: false, ambience: "town", music: "town_congleton",
    legend: M.interior(), layers: li.layers(),
    spawnPoint: { x: 14, y: 22 },
    warps: [
      { x: 14, y: 23, to: "little_moreton_hall", tx: 17, ty: 19, dir: "down", kind: "door" },
      { x: 15, y: 23, to: "little_moreton_hall", tx: 17, ty: 19, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_moreton_gallery", x: 14, y: 16, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "tr_little_moreton_hall_2", sight: 0, script: "mid_moreton_gallery", cond: "time.night || moreton_gallery_woken" },
      { id: "npc_moreton_guide", x: 6, y: 19, dir: "right", sprite: "npc_historian", behaviour: "still",
        say: ["The plasterwork up there says THE WHEELE OF FORTVNE and DESTINY.",
          "It also says the whole thing was paid for by a man who wanted to be seen paying for it. Both are true. Most things are both."] }
    ],
    signs: [
      { x: 15, y: 12, text: ["The gallery floor bows two feet in the middle and rises again at both ends.",
        "You can watch a dropped coin decide, and it always decides the same way."] },
      { x: 2, y: 20, text: ["A framed survey from 1990: 'THE STRUCTURE IS STABLE. IT IS NOT LEVEL. THESE ARE DIFFERENT PROPERTIES.'"] }
    ],
    items: [{ x: 28, y: 20, item: "collectible_13", n: 1, hidden: true, flag: "item_moreton_int_1" }],
    encounters: { grass: null }
  }));

  // ------------------------------------------------------------ Mow Cop --
  const mc = M.canvas(36, 34, ";");
  mc.fill("g", 0, 0, 36, 1, "T"); mc.fill("g", 0, 33, 36, 1, "6");
  mc.fill("g", 0, 1, 1, 32, "T"); mc.fill("g", 35, 1, 1, 32, "T");
  mc.fill("g", 15, 0, 3, 1, "+");
  B.trees(mc, "mow-scrub", 22, 2, 22, 32, 10, "B", "b", [";"]);
  mc.fill("g", 1, 18, 34, 14, "0");
  mc.scatter("g", "mow-rock", "4", 24, 2, 4, 32, 26, ["0", ";"]);
  mc.fill("g", 2, 12, 32, 2, "6");
  mc.fill("g", 1, 2, 34, 10, "7");
  mc.fill("g", 4, 3, 28, 8, ";");
  // the path up, and the climb onto the top rocks
  mc.fill("g", 15, 1, 3, 8, "+");
  mc.fill("g", 15, 9, 1, 12, "+");
  mc.fill("g", 15, 20, 14, 1, "+");
  mc.fill("g", 28, 20, 1, 10, "+");
  mc.fill("g", 8, 30, 21, 1, "+");
  mc.fill("g", 8, 21, 1, 10, "+");
  mc.fill("g", 8, 21, 8, 1, "+");
  mc.set("g", 15, 12, "+"); mc.set("g", 15, 13, "+");
  // the folly
  mc.fill("g", 12, 4, 10, 5, "Z");
  mc.fill("g", 14, 5, 6, 3, ",");
  mc.set("g", 16, 9, "D"); mc.set("g", 17, 9, "D");
  mc.set("g", 12, 4, "V"); mc.set("g", 21, 4, "V");
  mc.fill("g", 14, 9, 2, 1, "Z"); mc.fill("g", 18, 9, 2, 1, "Z");
  mc.set("g", 13, 10, "N");
  // the Old Man of Mow
  mc.fill("g", 27, 6, 2, 4, "9");
  mc.set("g", 26, 8, "8");
  mc.fill("g", 22, 9, 5, 1, ";");
  mc.set("g", 30, 8, "N");
  mc.fill("g", 22, 10, 8, 1, ";");
  W.defineMap("mow_cop", MQ.U.merge(DC, {
    name: "Mow Cop", outdoor: true, weatherZone: "dane", ambience: "moor",
    legend: GRIT, layers: mc.layers(),
    spawnPoint: { x: 16, y: 2 },
    landmark: { name: "Mow Cop Castle", x: 17, y: 6 },
    encounters: { grass: "mow_cop_grass", water: null },
    warps: [
      { x: 15, y: 0, to: "route_moreton_mowcop", tx: 14, ty: 38, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "route_moreton_mowcop", tx: 15, ty: 38, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "route_moreton_mowcop", tx: 16, ty: 38, dir: "up", kind: "edge" },
      { x: 16, y: 9, to: "mow_cop_castle", tx: 9, ty: 15, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 13, y: 10, text: ["MOW COP CASTLE — a summerhouse, built 1754, made to look like a ruin on purpose.",
        "In 1807 a crowd of several thousand stood on this hill for fourteen hours in the rain and started Primitive Methodism.",
        "The building is a fake. The fourteen hours were not."] },
      { x: 30, y: 8, text: ["THE OLD MAN OF MOW. A pillar of gritstone left standing when the quarry took the rest.",
        "Photographs of it from 1922 and last year are pinned side by side at the visitor board.",
        "It is not in the same place. Nobody wants to be the one to say so."] }
    ],
    items: [
      { x: 4, y: 30, item: "viewpoint_mow_cop", n: 1, flag: "item_mow_cop_1" },
      { x: 33, y: 30, item: "gritstone_passport", n: 1, hidden: true, flag: "item_mow_cop_2" },
      { x: 5, y: 5, item: "elixir", n: 2, hidden: true, flag: "item_mow_cop_3" },
      { x: 31, y: 4, item: "capsule_heavy", n: 3, hidden: true, flag: "item_mow_cop_4" }
    ],
    restPoints: [{ x: 14, y: 20, flag: "meadow_sat_mowcop" }],
    npcs: [
      { id: "npc_mowcop_keeper", x: 12, y: 10, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_mow_cop_1", sight: 0,
        script: "mid_mowcop_keeper" },
      { id: "npc_mowcop_sara", x: 20, y: 20, dir: "up", sprite: "npc_fellrunner", behaviour: "look", radius: 3, trainer: "tr_mow_cop_2", sight: 3,
        script: "mid_mowcop_sara" },
      { id: "npc_mowcop_pilgrim", x: 24, y: 25, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["My great-great-grandmother stood on this hill in the rain for fourteen hours.",
          "Nobody told her to. That's the bit that gets me. Nobody had to tell her."] }
    ],
    triggers: [
      { x: 15, y: 10, w: 3, h: 1, script: "mid_mowcop_arrival", once: "mowcop_arrival", cond: "!mowcop_arrival" }
    ]
  }));

  const mk = M.room(20, 17, { floor: ",", wall: "7", top: "^", win: null });
  mk.fill("g", 2, 3, 16, 1, "|");
  mk.set("g", 4, 6, "z"); mk.set("g", 15, 6, "y");
  mk.fill("g", 6, 9, 8, 1, "e");
  mk.set("g", 9, 2, "\\"); mk.set("g", 18, 12, "\\");
  W.defineMap("mow_cop_castle", MQ.U.merge(DC, {
    name: "Mow Cop Castle", outdoor: false, ambience: "moor", music: "route_dane",
    legend: M.interior(), layers: mk.layers(),
    spawnPoint: { x: 9, y: 15 },
    warps: [
      { x: 9, y: 16, to: "mow_cop", tx: 16, ty: 10, dir: "down", kind: "door" },
      { x: 10, y: 16, to: "mow_cop", tx: 16, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_mowcop_trailbook", x: 9, y: 5, dir: "down", sprite: "npc_walker", behaviour: "still", script: "mid_mowcop_book" }
    ],
    signs: [
      { x: 9, y: 2, text: ["THE GRITSTONE TRAIL — 35 MILES. LYME PARK TO MOW COP.",
        "You are at the end of it, or the beginning, depending on which way you were going and how you feel about hills."] },
      { x: 18, y: 12, text: ["An arrow-slit that has never had an arrow through it.",
        "Through it: the whole Cheshire plain, the dish, the salt towns, and on the far edge, Wales."] }
    ],
    items: [{ x: 18, y: 14, item: "collectible_12", n: 1, hidden: true, flag: "item_mowcop_castle_1" }],
    encounters: { grass: null }
  }));
})();
