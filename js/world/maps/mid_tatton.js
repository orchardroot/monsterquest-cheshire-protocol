// =============================================================
// MonsterQuest v2 — TATTON PARK and ROSTHERNE MERE (region bollin, Ch.3)
// A thousand acres of deer park with a mansion in the middle of it, a
// Tudor hall nobody has quite left, a Japanese garden, a marquee full of
// clipboards, and — over the north gate — the deepest water in Cheshire
// with a bell at the bottom of it. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const PARK = M.moor({ "E": "wall_tudor", "J": "wall_tudor_beam", "0": "tree_autumn", "6": "wall_render_white" });
  const DT = { region: "bollin", dialogue: "town_tatton_park", music: "town_knutsford", owner: "mid" };
  const DR = { region: "bollin", dialogue: "town_tatton_park", music: "cutscene_signal", owner: "mid" };

  // ------------------------------------------------------- Tatton Park ----
  const c = M.canvas(52, 46, ".");
  c.fill("g", 0, 0, 52, 1, "T");
  c.fill("g", 0, 1, 1, 45, "T"); c.fill("g", 51, 1, 1, 45, "T");
  c.fill("g", 0, 45, 52, 1, "T");
  c.fill("g", 10, 0, 3, 1, ":");
  c.fill("g", 26, 45, 3, 1, "=");
  for (let x = 0; x < 52; x++) c.set("o", x, 0, "y");
  c.fill("o", 10, 0, 3, 1, " ");

  // parkland: rough grass, bracken, a great many trees in clumps
  c.fill("g", 1, 1, 50, 44, ";");
  B.trees(c, "tat-park-a", 60, 2, 2, 48, 42, "T", "y", [";"]);
  c.fill("g", 20, 3, 8, 6, "\""); c.fill("g", 33, 20, 8, 5, "\"");
  c.fill("g", 8, 40, 10, 4, "\""); c.fill("g", 42, 38, 7, 5, "\"");
  c.fill("g", 3, 12, 7, 5, "\"");
  c.scatter("g", "tat-fern", "}", 22, 2, 2, 48, 42, [";"]);
  c.scatter("g", "tat-log", "[", 12, 2, 2, 48, 42, [";"]);

  // ---- the Knutsford drive, straight up the middle -----------------------
  c.fill("g", 26, 18, 3, 28, "=");
  M.avenue(c, 25, 20, 24, "v", 3, "T", "y");
  c.set("g", 25, 44, "F"); c.set("g", 29, 44, "F");
  c.set("g", 30, 43, "P");

  // ---- Tatton Hall -------------------------------------------------------
  B.house(c, { x: 22, y: 9, w: 16, h: 8, rh: 2, wall: "V", win: "W", door: "D", doorX: 8, over: "^" });
  c.set("g", 23, 9, "m"); c.set("g", 36, 9, "m");
  c.fill("g", 21, 17, 18, 1, "_");
  c.fill("g", 29, 17, 1, 1, "_");
  c.fill("g", 20, 8, 20, 1, "F");
  c.set("g", 29, 18, "="); c.set("g", 30, 17, "_");
  c.set("g", 20, 18, "N");
  c.fill("g", 21, 18, 5, 1, "_"); c.fill("g", 29, 18, 10, 1, "_");
  c.set("g", 24, 19, "/"); c.set("g", 35, 19, "q");
  c.fill("g", 21, 19, 3, 2, "l"); c.fill("g", 36, 19, 3, 2, "o");

  // ---- the Old Hall: Tudor, timbered, and still occupied ----------------
  B.house(c, { x: 4, y: 4, w: 11, h: 6, rh: 2, wall: "E", win: "J", door: "D", doorX: 5, over: "^" });
  c.set("g", 5, 4, "m");
  c.fill("g", 3, 10, 13, 1, "+");
  c.fill("g", 9, 11, 1, 7, "+");
  c.fill("g", 3, 3, 1, 8, "h"); c.fill("g", 16, 3, 1, 8, "h");
  c.set("g", 3, 6, "&"); c.set("g", 2, 10, "N");
  c.fill("g", 9, 18, 18, 1, "+");
  c.set("g", 20, 18, "N");

  // ---- Tatton Mere -------------------------------------------------------
  M.lake(c, 4, 22, 16, 16, "1", "A");
  c.fill("g", 20, 28, 2, 2, "U");
  c.set("g", 6, 24, "Q"); c.set("g", 16, 35, "Q"); c.set("g", 10, 30, "a");
  c.fill("g", 21, 20, 1, 22, "+");
  c.set("g", 22, 30, "H"); c.set("g", 22, 34, "%");
  c.fill("g", 3, 39, 20, 1, "+");
  c.set("g", 21, 21, "N");

  // ---- the Japanese Garden ----------------------------------------------
  c.fill("g", 39, 24, 11, 12, ",");
  c.box("g", 39, 24, 11, 12, "h");
  c.set("g", 44, 35, "&");
  M.lake(c, 42, 28, 5, 4, "$", "e");
  c.set("g", 44, 27, "<"); c.set("g", 44, 32, "<");
  c.fill("g", 40, 26, 2, 1, "0"); c.fill("g", 47, 26, 2, 1, "0");
  c.fill("g", 40, 33, 2, 1, "0"); c.fill("g", 47, 33, 2, 1, "0");
  c.set("g", 41, 30, "5"); c.set("g", 48, 30, "5");
  c.fill("g", 44, 36, 1, 4, "+");
  c.fill("g", 30, 40, 15, 1, "+");
  c.set("g", 38, 34, "N");

  // ---- the census marquee ------------------------------------------------
  B.house(c, { x: 31, y: 30, w: 8, h: 5, rh: 2, wall: "6", win: null, door: "D", doorX: 4, over: "^" });
  c.fill("g", 30, 35, 10, 1, "_");
  c.set("g", 30, 34, "N");
  c.fill("g", 35, 36, 1, 4, "_");
  c.fill("g", 29, 36, 12, 1, "_");
  c.fill("g", 40, 20, 8, 5, ",");
  c.fill("g", 41, 21, 6, 3, "\"");

  W.defineMap("tatton_park", MQ.U.merge(DT, {
    name: "Tatton Park", outdoor: true, weatherZone: "bollin", ambience: "forest",
    legend: PARK, layers: c.layers(),
    spawnPoint: { x: 27, y: 44 },
    landmark: { name: "Tatton Park", x: 30, y: 18 },
    encounters: { grass: "tatton_park_grass", water: "tatton_park_water" },
    fishing: "fish_tatton_park",
    warps: [
      { x: 26, y: 45, to: "knutsford", tx: 25, ty: 1, dir: "down", kind: "edge" },
      { x: 27, y: 45, to: "knutsford", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 28, y: 45, to: "knutsford", tx: 26, ty: 1, dir: "down", kind: "edge" },
      { x: 10, y: 0, to: "route_tatton_rostherne", tx: 8, ty: 27, dir: "up", kind: "edge" },
      { x: 11, y: 0, to: "route_tatton_rostherne", tx: 9, ty: 27, dir: "up", kind: "edge" },
      { x: 12, y: 0, to: "route_tatton_rostherne", tx: 10, ty: 27, dir: "up", kind: "edge" },
      { x: 30, y: 16, to: "tatton_park_hall", tx: 13, ty: 20, dir: "up", kind: "door" },
      { x: 9, y: 9, to: "tatton_park_old_hall", tx: 9, ty: 16, dir: "up", kind: "door" },
      { x: 35, y: 34, to: "tatton_park_census_tent", tx: 10, ty: 15, dir: "up", kind: "door" },
      { x: 44, y: 35, to: "tatton_park_japanese_garden", tx: 12, ty: 21, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 30, y: 43, text: ["TATTON PARK. A thousand acres, two halls, four hundred deer and one very long drive.",
        "PLEASE DO NOT FEED, APPROACH, PHOTOGRAPH OR COUNT THE DEER WITHOUT A WARDEN PRESENT.",
        "Somebody has crossed out 'count' and written it back in, twice, in two different hands."] },
      { x: 20, y: 18, text: ["TATTON HALL — Wyatt, 1780s, and a family who kept every receipt.",
        "The library holds nine thousand books and one modern router, which is under a doily."] },
      { x: 2, y: 10, text: ["THE OLD HALL — Tudor, timber, and a hearth in the middle of the floor because chimneys had not been invented locally yet.",
        "Open at dusk for the ghost tour. The ghost tour has never once had to be cancelled."] },
      { x: 21, y: 21, text: ["TATTON MERE — carp, pike, and a swan called Alan who has been asked to leave the car park four times."] },
      { x: 38, y: 34, text: ["THE JAPANESE GARDEN, laid 1910 by gardeners brought from Japan.",
        "SILENCE, PLEASE. It is the only place in Cheshire where that instruction is obeyed."] },
      { x: 30, y: 34, text: ["DEER CENSUS — VOLUNTEERS WELCOME!",
        "SIGN IN AT THE TENT. FREE HAMPER FOR EVERY COMPLETED TALLY SHEET.",
        "Under it, smaller: 'one sign-in per household, per email, per device, per person, thank you.'"] }
    ],
    items: [
      { x: 20, y: 4, item: "capsule_mesh", n: 5, flag: "item_tatton_1" },
      { x: 46, y: 41, item: "rod_weighted", n: 1, hidden: true, flag: "item_tatton_2" },
      { x: 4, y: 43, item: "elixir", n: 2, flag: "item_tatton_3" },
      { x: 48, y: 4, item: "collectible_8", n: 1, hidden: true, flag: "item_tatton_4" },
      { x: 34, y: 21, item: "focus_band", n: 1, flag: "item_tatton_5" },
      { x: 2, y: 20, item: "capsule_night", n: 3, hidden: true, flag: "item_tatton_6" }
    ],
    catGaps: [
      { x: 20, y: 8, item: "cat_token_8", n: 1, flag: "catgap_tatton_1",
        say: "MEADOW slips under the deer fence, walks straight through a herd of animals four times her size, and every single one of them gets out of her way." }
    ],
    restPoints: [{ x: 22, y: 32, flag: "bigboy_sat_tatton" }],
    npcs: [
      { id: "npc_tatton_nerys", x: 30, y: 20, dir: "down", sprite: "npc_ranger", behaviour: "still", script: "mid_tatton_nerys" },
      { id: "npc_tatton_kellan", x: 34, y: 38, dir: "up", sprite: "kellan", behaviour: "still", script: "mid_tatton_kellan" },
      { id: "npc_tatton_vex", x: 24, y: 36, dir: "right", sprite: "vex", behaviour: "still", script: "mid_tatton_vex", cond: "deer_census_done && !vex_battle_2" },
      { id: "npc_tatton_mei", x: 45, y: 33, dir: "down", sprite: "npc_ranger", behaviour: "look", radius: 3, trainer: "tr_tatton_park_5", sight: 3, script: "mid_tatton_mei" },
      { id: "npc_tatton_meical", x: 37, y: 39, dir: "left", sprite: "npc_cultist", behaviour: "look", radius: 3, trainer: "tr_tatton_park_2", sight: 3 },
      { id: "npc_tatton_kai", x: 30, y: 37, dir: "right", sprite: "npc_stuffer", behaviour: "look", radius: 3, trainer: "tr_tatton_park_3", sight: 3 },
      { id: "npc_tatton_nadia", x: 40, y: 36, dir: "left", sprite: "npc_stuffer", behaviour: "look", radius: 3, trainer: "tr_tatton_park_4", sight: 3 },
      { id: "npc_tatton_deer_1", x: 18, y: 12, dir: "down", sprite: "deer", behaviour: "wander", radius: 4, script: "mid_tatton_deer" },
      { id: "npc_tatton_deer_2", x: 43, y: 14, dir: "left", sprite: "deer", behaviour: "wander", radius: 5, script: "mid_tatton_stag" },
      { id: "npc_tatton_deer_3", x: 12, y: 42, dir: "up", sprite: "deer", behaviour: "wander", radius: 4, script: "mid_tatton_deer" },
      { id: "npc_tatton_deer_4", x: 46, y: 27, dir: "left", sprite: "deer", behaviour: "still", script: "mid_tatton_stag" },
      { id: "npc_tatton_volunteer", x: 32, y: 36, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["I've counted this lawn three times and got three numbers.",
          "The tent says that's normal. The tent says a lot of things are normal."] },
      { id: "npc_tatton_picnic", x: 24, y: 33, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["Blankets everywhere and not one sandwich between them. That's not a picnic, love. That's a meeting."] },
      { id: "npc_tatton_angler", x: 22, y: 28, dir: "left", sprite: "npc_fisher", behaviour: "still",
        say: ["Best carp water in the county and I have never once caught a carp in it.",
          "That's not the mere's fault. I want to be clear that it isn't the mere's fault."] }
    ],
    triggers: [
      { x: 26, y: 42, w: 3, h: 1, script: "mid_tatton_arrival", once: "tatton_arrival", cond: "!tatton_arrival" },
      { x: 29, y: 36, w: 12, h: 1, script: "mid_tatton_blankets", once: "tatton_blankets_seen", cond: "!tatton_blankets_seen" }
    ]
  }));

  // ---- Tatton Hall -------------------------------------------------------
  const hl = M.room(28, 22, { floor: "c", wall: "#" });
  hl.fill("g", 2, 3, 24, 1, "S"); hl.fill("g", 2, 4, 6, 1, "k");
  hl.fill("g", 20, 4, 6, 1, "k");
  hl.fill("g", 10, 6, 8, 1, "t"); hl.fill("g", 10, 7, 8, 1, "h");
  hl.fill("g", 3, 9, 3, 3, "i"); hl.fill("g", 22, 9, 3, 3, "i");
  hl.fill("g", 12, 12, 4, 2, "r");
  hl.set("g", 11, 12, "\\");
  hl.set("g", 2, 16, "E"); hl.set("g", 25, 16, "j");
  hl.fill("g", 4, 18, 5, 1, "e"); hl.fill("g", 19, 18, 5, 1, "e");
  hl.set("g", 26, 3, "a"); hl.set("g", 1, 3, "f");
  W.defineMap("tatton_park_hall", MQ.U.merge(DT, {
    name: "Tatton Hall", outdoor: false, ambience: "town",
    legend: M.interior(), layers: hl.layers(),
    spawnPoint: { x: 13, y: 20 },
    warps: [
      { x: 13, y: 21, to: "tatton_park", tx: 30, ty: 17, dir: "down", kind: "door" },
      { x: 14, y: 21, to: "tatton_park", tx: 30, ty: 17, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_tatton_librarian", x: 8, y: 5, dir: "down", sprite: "npc_historian", behaviour: "still", script: "mid_tatton_library" },
      { id: "npc_tatton_guide", x: 18, y: 12, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["Nine thousand books, four hundred years of receipts, and a family that never threw anything away.",
          "Which is why we know exactly what a stag cost in 1723 and nothing at all about what anyone felt."] },
      { id: "npc_tatton_steward", x: 22, y: 18, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["The router's under the doily because a visitor complained about it in 2016.",
          "The complaint is in the archive. So is the doily's receipt."] }
    ],
    signs: [
      { x: 11, y: 12, text: ["THE STATE DRAWING ROOM. Everything in here was chosen to be seen from that door and no other.",
        "That is not vanity. That is a threat model."] },
      { x: 1, y: 3, text: ["A fire laid but not lit, as it has been every day since 1958."] }
    ],
    items: [{ x: 26, y: 19, item: "tonic", n: 2, hidden: true, flag: "item_tatton_hall_1" }],
    encounters: { grass: null }
  }));

  // ---- the Old Hall ------------------------------------------------------
  const oh = M.room(20, 18, { floor: ",", wall: "#" });
  oh.fill("g", 8, 8, 4, 3, "f");
  oh.fill("g", 2, 4, 6, 1, "t"); oh.fill("g", 2, 5, 6, 1, "o");
  oh.fill("g", 12, 4, 6, 1, "t"); oh.fill("g", 12, 5, 6, 1, "o");
  oh.fill("g", 2, 13, 3, 1, "z"); oh.fill("g", 15, 13, 3, 1, "y");
  oh.set("g", 1, 8, "i"); oh.set("g", 18, 8, "i");
  W.defineMap("tatton_park_old_hall", MQ.U.merge(DT, {
    name: "The Old Hall", outdoor: false, ambience: "cave", music: "cutscene_signal",
    legend: M.interior(), layers: oh.layers(),
    spawnPoint: { x: 9, y: 16 },
    warps: [
      { x: 9, y: 17, to: "tatton_park", tx: 9, ty: 10, dir: "down", kind: "door" },
      { x: 10, y: 17, to: "tatton_park", tx: 9, ty: 10, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_tatton_oldhall_steward", x: 9, y: 6, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "tr_tatton_park_6", sight: 0, script: "mid_tatton_steward", cond: "time.night || tatton_ghost_awake" },
      { id: "npc_tatton_oldhall_guide", x: 4, y: 12, dir: "right", sprite: "npc_historian", behaviour: "still",
        say: ["Open hearth, hole in the roof, everyone sleeping in the one room including the dogs.",
          "Four hundred years later we've all got our own rooms and we sit in them alone. Progress is a shape, not a direction."] }
    ],
    signs: [
      { x: 8, y: 8, text: ["THE HEARTH. Lit continuously from 1520 to 1758, then not again.",
        "It is warm. Nobody has explained that and the guide has stopped mentioning it."] }
    ],
    items: [{ x: 18, y: 15, item: "capsule_night", n: 4, hidden: true, flag: "item_tatton_oldhall_1" }],
    encounters: { grass: null }
  }));

  // ---- the census marquee ------------------------------------------------
  const ct = M.room(22, 17, { floor: ".", wall: "]" , top: "^" });
  ct.fill("g", 2, 3, 5, 1, "t"); ct.fill("g", 2, 4, 5, 1, "h");
  ct.fill("g", 15, 3, 5, 1, "t"); ct.fill("g", 15, 4, 5, 1, "h");
  ct.fill("g", 8, 6, 6, 1, "C"); ct.set("g", 11, 7, "P");
  ct.fill("g", 2, 9, 4, 1, "t"); ct.fill("g", 16, 9, 4, 1, "t");
  ct.fill("g", 3, 12, 3, 1, "z"); ct.fill("g", 16, 12, 3, 1, "z");
  ct.set("g", 20, 2, "O"); ct.set("g", 1, 2, "O");
  W.defineMap("tatton_park_census_tent", MQ.U.merge(DT, {
    name: "The Census Tent", outdoor: false, ambience: "town",
    legend: M.interior(), layers: ct.layers(),
    spawnPoint: { x: 10, y: 15 },
    warps: [
      { x: 10, y: 16, to: "tatton_park", tx: 35, ty: 35, dir: "down", kind: "door" },
      { x: 11, y: 16, to: "tatton_park", tx: 35, ty: 35, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_tatton_signin", x: 11, y: 8, dir: "down", sprite: "npc_stuffer", behaviour: "still", script: "mid_tatton_signin" },
      { id: "npc_tatton_tallyclerk", x: 4, y: 5, dir: "right", sprite: "npc_stuffer", behaviour: "still",
        say: ["Tally sheet, pencil, lanyard. Name, email, mother's maiden name for the prize draw.",
          "It's for the DEER. Obviously it's for the deer."] },
      { id: "npc_tatton_hamper", x: 18, y: 10, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["I've been coming back for the hamper for four days.",
          "There is no hamper. I've decided that's fine. I like the walk."] }
    ],
    signs: [
      { x: 11, y: 6, text: ["SIGN IN HERE — ONE PER PERSON.",
        "The clipboard has eleven hundred names on it and this is a car park in Cheshire on a Tuesday."] },
      { x: 1, y: 2, text: ["A cable duct running out under the tent wall, downhill, towards the mere."] }
    ],
    items: [{ x: 20, y: 14, item: "capsule_kernel", n: 2, hidden: true, flag: "item_tatton_tent_1" }],
    encounters: { grass: null }
  }));

  // ---- the Japanese Garden ------------------------------------------------
  const jg = M.canvas(26, 23, ",");
  jg.box("g", 0, 0, 26, 23, "h");
  jg.fill("g", 1, 1, 24, 21, ",");
  M.lake(jg, 8, 6, 10, 8, "$", "e");
  jg.fill("g", 12, 5, 2, 1, "<"); jg.fill("g", 12, 14, 2, 1, "<");
  jg.fill("g", 2, 2, 3, 1, "0"); jg.fill("g", 21, 2, 3, 1, "0");
  jg.fill("g", 2, 19, 3, 1, "0"); jg.fill("g", 21, 19, 3, 1, "0");
  jg.set("g", 4, 10, "5"); jg.set("g", 21, 10, "5"); jg.set("g", 13, 3, "3");
  jg.fill("g", 12, 15, 2, 7, ":");
  jg.fill("g", 3, 12, 20, 1, ":");
  jg.set("g", 12, 22, "&"); jg.set("g", 13, 22, "&");
  jg.set("g", 6, 4, "}"); jg.set("g", 19, 17, "}");
  jg.set("g", 3, 16, "Q");
  jg.set("g", 8, 16, "N");
  W.defineMap("tatton_park_japanese_garden", MQ.U.merge(DT, {
    name: "The Japanese Garden", outdoor: true, weatherZone: "bollin", ambience: "forest",
    legend: PARK, layers: jg.layers(),
    spawnPoint: { x: 12, y: 21 },
    encounters: { grass: null, water: null },
    fishing: "fish_tatton_park",
    warps: [
      { x: 12, y: 22, to: "tatton_park", tx: 44, ty: 36, dir: "down", kind: "door" },
      { x: 13, y: 22, to: "tatton_park", tx: 44, ty: 36, dir: "down", kind: "door" }
    ],
    signs: [
      { x: 8, y: 16, text: ["THE JAPANESE GARDEN, 1910.",
        "The gardeners who built it went home and were never written to again. Their names are not in the archive.",
        "The receipts for the lanterns are."] }
    ],
    items: [{ x: 24, y: 3, item: "collectible_8", n: 1, hidden: true, flag: "item_tatton_jg_1" }],
    npcs: [
      { id: "npc_tatton_bonsai", x: 15, y: 16, dir: "left", sprite: "npc_ranger", behaviour: "still", script: "mid_tatton_bonsai" },
      { id: "npc_tatton_gardener", x: 5, y: 13, dir: "up", sprite: "npc_ranger", behaviour: "wander", radius: 2,
        say: ["Rake the gravel at seven, before anyone's up. By four it needs doing again and that is not a complaint."] }
    ]
  }));

  // ------------------------------------------------------ Rostherne Mere --
  const r = M.canvas(42, 36, ";");
  r.fill("g", 0, 0, 42, 1, "T"); r.fill("g", 0, 35, 42, 1, "T");
  r.fill("g", 0, 1, 1, 34, "T"); r.fill("g", 41, 1, 1, 34, "T");
  r.fill("g", 6, 35, 3, 1, ":");
  for (let x = 0; x < 42; x++) r.set("o", x, 0, "y");
  B.trees(r, "rost-wood", 46, 2, 2, 38, 32, "T", "y", [";"]);
  M.lake(r, 8, 12, 26, 16, "1", "A");
  r.fill("g", 3, 3, 36, 1, ":");
  r.fill("g", 3, 3, 1, 30, ":");
  r.fill("g", 3, 32, 36, 1, ":");
  r.fill("g", 38, 3, 1, 30, ":");
  r.fill("g", 6, 30, 3, 4, ":");
  // the church on its rise, above the water
  B.house(r, { x: 4, y: 4, w: 10, h: 5, rh: 3, roof: "p", wall: "c", win: "C", door: "d", doorX: 4 });
  r.set("g", 7, 3, "p");
  r.scatter("g", "rost-graves", "g", 12, 15, 4, 10, 4, [";"]);
  r.set("g", 15, 8, "N");
  // the boardwalk hide and the jetty where the bell is heard
  r.fill("g", 33, 16, 6, 1, "Y");
  r.fill("g", 33, 17, 1, 3, "Y");
  r.set("g", 33, 20, "U"); r.set("g", 33, 21, "U");
  r.set("g", 20, 20, "Q"); r.set("g", 12, 25, "Q");
  r.set("g", 37, 14, "N");
  r.fill("g", 20, 30, 8, 2, "\""); r.fill("g", 6, 6, 6, 2, "\"");
  r.set("g", 30, 6, "5"); r.set("g", 9, 31, "[");
  r.fill("g", 24, 4, 10, 4, "\"");
  W.defineMap("rostherne_mere", MQ.U.merge(DR, {
    name: "Rostherne Mere", outdoor: true, weatherZone: "bollin", ambience: "water",
    legend: PARK, layers: r.layers(),
    spawnPoint: { x: 7, y: 33 },
    landmark: { name: "Rostherne Mere", x: 20, y: 19 },
    encounters: { grass: "rostherne_mere_grass", water: "rostherne_mere_water" },
    fishing: "fish_rostherne_mere",
    warps: [
      { x: 6, y: 35, to: "route_tatton_rostherne", tx: 8, ty: 1, dir: "down", kind: "edge" },
      { x: 7, y: 35, to: "route_tatton_rostherne", tx: 9, ty: 1, dir: "down", kind: "edge" },
      { x: 8, y: 35, to: "route_tatton_rostherne", tx: 10, ty: 1, dir: "down", kind: "edge" },
      { x: 8, y: 8, to: "rostherne_church", tx: 6, ty: 12, dir: "up", kind: "door" }
    ],
    signs: [
      { x: 15, y: 8, text: ["ST MARY'S, ROSTHERNE. The tower is Georgian, the churchyard is older than the tower and older than the argument.",
        "The bell was being carted up from the mere and it went in. It rang all the way down. So they say."] },
      { x: 37, y: 14, text: ["NATIONAL NATURE RESERVE — NO ACCESS TO THE WATER.",
        "Deepest mere in Cheshire: thirty metres, cold all the way, and nothing living in the bottom ten of it.",
        "Beneath, in pencil, a much newer hand: 'something is living in the bottom ten of it'"] }
    ],
    items: [
      { x: 39, y: 4, item: "capsule_brine", n: 3, hidden: true, flag: "item_rostherne_1" },
      { x: 4, y: 31, item: "elixir", n: 1, flag: "item_rostherne_2" },
      { x: 27, y: 31, item: "rain_jar", n: 1, hidden: true, flag: "item_rostherne_3" }
    ],
    npcs: [
      { id: "npc_rostherne_cerys", x: 35, y: 15, dir: "down", sprite: "npc_birder", behaviour: "look", radius: 3, trainer: "tr_rostherne_mere_1", sight: 3,
        script: "mid_rostherne_cerys" },
      { id: "npc_rostherne_ioan", x: 16, y: 6, dir: "down", sprite: "npc_historian", behaviour: "look", radius: 3, trainer: "tr_rostherne_mere_2", sight: 3 },
      { id: "npc_rostherne_watcher", x: 30, y: 31, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["I come for the geese. I've stopped writing down what else I see."] }
    ],
    triggers: [
      { x: 33, y: 20, w: 1, h: 2, script: "mid_rostherne_bell", once: "rostherne_relay_seen", cond: "!rostherne_relay_seen && deer_census_done" }
    ]
  }));

  const rc = M.room(14, 14, { floor: ",", wall: ":", top: ":", win: "?" });
  rc.fill("g", 4, 3, 6, 1, "t");
  for (let y = 5; y < 11; y += 2) { rc.fill("g", 2, y, 3, 1, "e"); rc.fill("g", 9, y, 3, 1, "e"); }
  rc.set("g", 1, 2, "|"); rc.set("g", 12, 2, "|");
  W.defineMap("rostherne_church", MQ.U.merge(DR, {
    name: "St Mary's, Rostherne", outdoor: false, ambience: "town", music: "town_knutsford",
    legend: M.interior(), layers: rc.layers(),
    spawnPoint: { x: 6, y: 12 },
    warps: [
      { x: 6, y: 13, to: "rostherne_mere", tx: 8, ty: 9, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "rostherne_mere", tx: 8, ty: 9, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_rostherne_verger", x: 6, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still", script: "mid_rostherne_verger" }
    ],
    signs: [
      { x: 6, y: 3, text: ["A board of ringers' names going back to 1741.",
        "The last entry is dated this month and nobody in the parish has rung since March."] }
    ],
    items: [{ x: 12, y: 11, item: "capsule_mesh", n: 3, hidden: true, flag: "item_rostherne_church_1" }],
    encounters: { grass: null }
  }));
})();
