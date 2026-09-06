// =============================================================
// MonsterQuest v2 — CREWE (region south, Ch.5, Gym 4 KERNEL)
// A town that exists because two railways crossed in a field. Twelve
// platforms, the Works sheds, a roundhouse with a turntable in it, a
// heritage centre with a tilting train nobody was allowed to keep, and
// a boarded salon on Nantwich Road. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LEG = M.town();
  const DL = { region: "south", dialogue: "town_crewe", music: "town_crewe", owner: "mid" };
  function inn(id, tpl, over) { return W.defineMap(id, W.builtin(tpl, MQ.U.merge(DL, over))); }

  const c = M.canvas(54, 44, ",");
  c.fill("g", 0, 0, 54, 2, "T");
  for (let x = 0; x < 54; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 41, "T"); c.fill("g", 53, 2, 1, 41, "T");
  c.fill("g", 0, 43, 54, 1, "T");
  c.fill("g", 24, 0, 3, 2, ":"); c.fill("o", 24, 0, 3, 1, " ");

  // ---- the Works: sheds, sidings, soot -----------------------------------
  c.fill("g", 1, 2, 52, 8, ":");
  M.sidings(c, 2, 3, 20, 3, 2, "2", ":");
  c.fill("g", 24, 2, 3, 8, ":");
  B.house(c, { x: 4, y: 4, w: 16, h: 5, rh: 1, wall: "X", win: "W", door: "@", doorX: 7, over: "^" });
  c.set("g", 5, 4, "M"); c.set("g", 18, 4, "M");
  c.set("g", 3, 8, "P");
  c.fill("g", 30, 3, 20, 1, "2"); c.fill("g", 30, 6, 20, 1, "2");
  c.set("g", 50, 3, "5"); c.set("g", 50, 6, "5");
  c.set("g", 34, 4, "4"); c.set("g", 44, 7, "4");
  c.fill("g", 1, 10, 52, 1, ",");

  // ---- the station ---------------------------------------------------------
  B.house(c, { x: 20, y: 11, w: 20, h: 5, rh: 2, wall: "X", win: "W", door: "S", doorX: 10, over: "^" });
  c.set("g", 21, 11, "m"); c.set("g", 38, 11, "m");
  c.set("g", 19, 15, "P");
  B.house(c, { x: 4, y: 12, w: 12, h: 4, rh: 1, door: "S", doorX: 5, over: "^" });
  B.house(c, { x: 43, y: 12, w: 9, h: 4, rh: 1, door: "S", doorX: 4, over: "^" });
  c.fill("g", 1, 16, 52, 1, "-");
  c.fill("g", 1, 17, 52, 2, "r");
  c.fill("g", 1, 19, 52, 1, "-");
  const lam = [3, 11, 18, 34, 41, 50];
  for (let i = 0; i < lam.length; i++) { c.set("g", lam[i], 16, "L"); c.set("g", lam[i], 19, "L"); }
  c.set("g", 27, 16, "u"); c.set("g", 45, 19, "O"); c.set("g", 6, 19, "j"); c.set("g", 15, 19, "n");
  c.set("g", 22, 19, "H"); c.set("g", 23, 19, "I");

  // ---- the terrace: care, mart, railcard office, inn ----------------------
  B.house(c, { x: 3, y: 20, w: 11, h: 3, rh: 1, door: "S", doorX: 5, over: "^" });
  B.house(c, { x: 17, y: 20, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 29, y: 20, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 41, y: 20, w: 10, h: 3, rh: 1, doorX: 4, over: "^" });
  c.fill("g", 1, 23, 52, 1, "-");

  // ---- Queen's Park and the Heritage Centre ------------------------------
  c.fill("g", 1, 24, 52, 8, ".");
  B.trees(c, "cr-park", 22, 2, 24, 26, 8, "T", "y", ["."]);
  M.lake(c, 6, 26, 14, 4, "$", "e");
  c.set("g", 5, 28, "Q"); c.set("g", 21, 28, "Q");
  c.set("g", 12, 24, "9"); c.set("g", 17, 31, "H"); c.set("g", 8, 31, "H");
  c.fill("g", 24, 24, 2, 8, ":");
  c.fill("g", 1, 24, 52, 1, ":");
  B.house(c, { x: 32, y: 25, w: 16, h: 5, rh: 1, wall: "X", win: "W", door: "S", doorX: 7, over: "^" });
  c.set("g", 31, 28, "P");
  c.fill("g", 30, 30, 20, 1, "2");
  c.fill("g", 30, 31, 20, 1, ":");
  c.fill("g", 1, 32, 52, 1, ":");

  // ---- Nantwich Road and the roundhouse ----------------------------------
  c.fill("g", 1, 33, 52, 10, ",");
  B.house(c, { x: 4, y: 33, w: 18, h: 4, rh: 1, door: "S", doorX: 4, over: "^" });
  c.set("g", 12, 36, "$"); c.set("g", 16, 36, "D");
  c.set("g", 3, 36, "N");
  c.fill("g", 1, 37, 52, 1, "-");
  c.fill("g", 1, 38, 52, 2, "r");
  c.fill("g", 1, 40, 52, 1, "-");
  c.set("g", 10, 37, "L"); c.set("g", 30, 40, "L");
  B.house(c, { x: 30, y: 33, w: 18, h: 4, rh: 1, wall: "X", win: "W", door: "@", doorX: 8, over: "^" });
  c.set("g", 31, 33, "M"); c.set("g", 46, 33, "M");
  c.set("g", 29, 36, "P");
  c.fill("g", 1, 41, 52, 2, ".");
  B.trees(c, "cr-south", 14, 2, 41, 50, 2, "B", "b", ["."]);
  c.fill("g", 6, 41, 8, 2, "\"");
  c.set("g", 44, 41, "z");

  W.defineMap("crewe", MQ.U.merge(DL, {
    name: "Crewe", outdoor: true, weatherZone: "south", ambience: "industrial",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 25, y: 10 },
    healPoint: { x: 8, y: 18 },
    landmark: { name: "Crewe", x: 30, y: 17 },
    encounters: { grass: "crewe_grass", water: "crewe_queens_park_water" },
    fishing: "fish_crewe_queens_park",
    warps: [
      { x: 11, y: 8, to: "crewe_works", tx: 20, ty: 32, dir: "up", kind: "door" },
      { x: 30, y: 15, to: "crewe_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 9, y: 15, to: "crewe_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 47, y: 15, to: "crewe_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 8, y: 22, to: "crewe_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 21, y: 22, to: "crewe_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 33, y: 22, to: "crewe_railcard_office", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 45, y: 22, to: "crewe_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 39, y: 29, to: "crewe_heritage_centre", tx: 15, ty: 24, dir: "up", kind: "door" },
      { x: 8, y: 36, to: "crewe_nantwich_road", tx: 12, ty: 16, dir: "up", kind: "door" },
      { x: 38, y: 36, to: "crewe_gym", tx: 16, ty: 28, dir: "up", kind: "door" },
      { x: 24, y: 0, to: "route_sandbach_crewe", tx: 14, ty: 38, dir: "up", kind: "edge" },
      { x: 25, y: 0, to: "route_sandbach_crewe", tx: 15, ty: 38, dir: "up", kind: "edge" },
      { x: 26, y: 0, to: "route_sandbach_crewe", tx: 16, ty: 38, dir: "up", kind: "edge" },
      { x: 52, y: 15, to: "route_crewe_nantwich", tx: 54, ty: 14, dir: "right", kind: "edge" }
    ],
    signs: [
      { x: 3, y: 8, text: ["CREWE WORKS. Opened 1843. Built seven thousand locomotives and a town to go round them.",
        "GATE 4 — AUTHORISED PERSONNEL. The chain on the gate is new and the padlock is newer."] },
      { x: 19, y: 15, text: ["CREWE STATION. Twelve platforms. Manchester, Glasgow, London, Chester, Shrewsbury and Wales.",
        "There is nowhere in this country you cannot get to from here and nobody has ever wanted to stay."] },
      { x: 31, y: 28, text: ["CREWE HERITAGE CENTRE. Signal boxes, a turntable, and the Advanced Passenger Train — tilting, brilliant, cancelled.",
        "Britain built the future in 1981 and then decided it made people feel sick."] },
      { x: 3, y: 36, text: ["NANTWICH ROAD.",
        "Barber, chip shop, tanning, nails, and one unit with the shutter down and a notice in the window from the landlord."] },
      { x: 29, y: 36, text: ["CREWE GYM — STOKER DI. KERNEL.",
        "HOUSE RULE: SUN ON TURN ONE.",
        "That is not a trick. That is a shed at six in the morning with the doors open and forty tons of iron already lit."] },
      { x: 15, y: 19, text: ["TOWN NOTICES.",
        "Timetable consultation. Park bandstand restoration fund. Lost cat, black, answers to nothing.",
        "A printed sheet, official-looking: 'PLATFORM ALTERATIONS — ALL SERVICES. DO NOT RELY ON THE BOARDS.'"] }
    ],
    items: [
      { x: 51, y: 8, item: "capsule_root", n: 3, flag: "item_crewe_1" },
      { x: 2, y: 42, item: "elixir", n: 2, hidden: true, flag: "item_crewe_2" },
      { x: 22, y: 27, item: "tonic", n: 3, flag: "item_crewe_3" },
      { x: 51, y: 41, item: "firebox_charm", n: 1, hidden: true, flag: "item_crewe_4" },
      { x: 2, y: 26, item: "capsule_heavy", n: 3, hidden: true, flag: "item_crewe_5" },
      { x: 49, y: 8, item: "collectible_14", n: 1, hidden: true, flag: "item_crewe_6" }
    ],
    catGaps: [
      { x: 18, y: 13, item: "cat_token_2", n: 1, flag: "catgap_crewe_1",
        say: "MEADOW goes under the platform barrier, walks the full length of platform six against the crowd, and is back before the announcement finishes apologising." }
    ],
    restPoints: [{ x: 14, y: 30, flag: "meadow_sat_crewe" }],
    npcs: [
      { id: "npc_crewe_ted", x: 27, y: 18, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "mid_crewe_ted" },
      { id: "npc_crewe_mags", x: 33, y: 23, dir: "down", sprite: "npc_dev", behaviour: "still", script: "mid_crewe_mags" },
      { id: "npc_crewe_nkechi", x: 25, y: 6, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 3, trainer: "tr_crewe_2", sight: 3, script: "mid_crewe_nkechi" },
      { id: "npc_crewe_fey", x: 6, y: 37, dir: "up", sprite: "npc_shopkeep", behaviour: "still", trainer: "tr_crewe_4", sight: 0, script: "mid_crewe_fey" },
      { id: "npc_crewe_vex", x: 30, y: 16, dir: "down", sprite: "vex", behaviour: "still", script: "mid_crewe_vex", cond: "apt_boss_beaten && !welsh_word_learned" },
      { id: "npc_crewe_twelvek", x: 34, y: 17, dir: "left", sprite: "twelve_k", behaviour: "still", script: "mid_crewe_twelvek", cond: "crewe_fog_cleared && !twelvek_lanyard_seen" },
      { id: "npc_crewe_stuffer_1", x: 15, y: 17, dir: "right", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_sandbach_crewe_3", sight: 4, cond: "!crewe_fog_cleared" },
      { id: "npc_crewe_gymdoor", x: 38, y: 37, dir: "up", sprite: "npc_stoker", behaviour: "still", script: "mid_gym4_door" },
      { id: "npc_crewe_commuter", x: 40, y: 18, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[40, 18], [16, 18]], pathMode: "pingpong",
        say: ["I change here twice a day. I have changed here about nine thousand times.",
          "I have never once left the station. I could not tell you a single thing about this town."] },
      { id: "npc_crewe_kid", x: 46, y: 7, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Number-taking. My grandad's got nine thousand and I've got three hundred and eleven.",
          "There's one in the sheds with no number. That's not allowed. Everything's got a number."] },
      { id: "npc_crewe_parkie", x: 18, y: 30, dir: "left", sprite: "npc_ranger", behaviour: "still",
        say: ["Queen's Park was a gift from the railway company to the town in 1887, on condition it be called Queen's Park.",
          "Everything here was a gift from the railway company on a condition."] },
      { id: "npc_crewe_barber", x: 12, y: 39, dir: "up", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Three doors down's been shut since February. Nice woman. Did my mum's hair for eleven years.",
          "One click. That's all it was. One click on a thing that looked like a browser update."] },
      { id: "npc_crewe_hi_vis", x: 45, y: 30, dir: "left", sprite: "npc_shadow_it", behaviour: "wander", radius: 2,
        say: ["I do the departure boards. Contract. Nine hundred screens across the north-west.",
          "Somebody else has been pushing to them since Tuesday and it is not my company and it is not the railway."] }
    ],
    triggers: [
      { x: 24, y: 9, w: 3, h: 1, script: "mid_crewe_arrival", once: "crewe_arrival", cond: "!crewe_arrival" },
      { x: 26, y: 16, w: 8, h: 1, script: "mid_crewe_fog", cond: "!crewe_fog_cleared && chapter>=5" }
    ]
  }));

  // ------------------------------------------------------------ interiors --
  inn("crewe_care", "care_centre", {
    name: "Crewe Care Centre",
    warps: [
      { x: 7, y: 11, to: "crewe", tx: 8, ty: 23, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "crewe", tx: 8, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_crewe_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Straight through. Burns bench is on the left; we get a lot of them and Di apologises for none of them."] },
      { id: "npc_crewe_care_1", x: 11, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Everything in this town runs on a timetable, including the ambulances.",
          "When the schedule went funny on Tuesday, so did we. Nobody ever thinks about that bit."] }
    ]
  });
  inn("crewe_mart", "shop", {
    name: "Crewe Mart", shop: "shop_crewe",
    warps: [
      { x: 6, y: 9, to: "crewe", tx: 9, ty: 16, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "crewe", tx: 9, ty: 16, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_crewe_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_crewe",
      say: ["Burn balm by the door. Everybody buys it on the way out and nobody on the way in."] }],
    items: [{ x: 12, y: 2, item: "burn_balm", n: 3, flag: "item_crewe_mart_1" }]
  });
  inn("crewe_inn", "pub", {
    name: "The Royal Hotel",
    warps: [
      { x: 6, y: 11, to: "crewe", tx: 47, ty: 16, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "crewe", tx: 47, ty: 16, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_crewe_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Rooms for people who missed the last connection, which is most of my trade and all of my sympathy."] },
      { id: "npc_crewe_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_signaller", behaviour: "still",
        say: ["Interlocking's the clever bit. It physically cannot set two conflicting routes. Levers won't move.",
          "So when two conflicting routes got set on Tuesday, that means somebody moved the levers somewhere that isn't levers."] },
      { id: "npc_crewe_pub_2", x: 10, y: 8, dir: "up", sprite: "npc_stuffer", behaviour: "still",
        say: ["I'm not saying anything. I'm seventeen. I'm having a lemonade."] }
    ]
  });
  inn("crewe_railcard_office", "shop", {
    name: "Railcard Office", shop: "shop_crewe_railcard",
    warps: [
      { x: 6, y: 9, to: "crewe", tx: 33, ty: 23, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "crewe", tx: 33, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_crewe_railcard", x: 1, y: 5, dir: "down", sprite: "npc_station", behaviour: "still", script: "mid_crewe_railcard" },
      { id: "npc_crewe_railcard_1", x: 11, y: 3, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["They'll not sign it unless somebody vouches. Somebody always has to vouch. That's the whole of the railway."] }
    ]
  });
  inn("crewe_house_1", "house_small", {
    name: "Gresty Road House",
    warps: [
      { x: 5, y: 9, to: "crewe", tx: 21, ty: 23, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "crewe", tx: 21, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_crewe_h1", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still",
      say: ["Four generations of this family in the Works. My father could tell you a loco by the sound of it going past the house.",
        "I can tell you the 19:42 from the 19:47 and that's all that's left of it."] }]
  });
  inn("crewe_house_2", "house_small", {
    name: "Edleston Road House",
    warps: [
      { x: 5, y: 9, to: "crewe", tx: 45, ty: 23, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "crewe", tx: 45, ty: 23, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_crewe_h2", x: 6, y: 3, dir: "down", sprite: "npc_dev", behaviour: "still",
      say: ["I work from home for a firm in Reading and I have never met anybody I work with.",
        "My neighbour worked in the Works with four thousand people. We are both employed. Only one of us has colleagues."] }]
  });

  // ---- the station: a big one --------------------------------------------
  const st = M.canvas(28, 20, ",");
  st.box("g", 0, 0, 28, 20, "#");
  st.fill("g", 1, 0, 26, 1, "^");
  st.fill("g", 1, 1, 26, 3, ",");
  st.fill("g", 3, 1, 3, 1, "l"); st.fill("g", 22, 1, 3, 1, "l");
  st.fill("g", 8, 2, 4, 1, "C"); st.set("g", 12, 2, "K");
  st.fill("g", 17, 2, 4, 1, "e");
  st.fill("g", 1, 4, 26, 1, "-");
  st.fill("g", 1, 5, 26, 1, "=");
  st.fill("g", 1, 6, 26, 1, "=");
  st.fill("g", 1, 7, 26, 1, "-");
  st.fill("g", 1, 8, 26, 2, ",");
  st.fill("g", 1, 10, 26, 1, "-");
  st.fill("g", 1, 11, 26, 1, "=");
  st.fill("g", 1, 12, 26, 1, "=");
  st.fill("g", 1, 13, 26, 1, "-");
  st.fill("g", 3, 8, 4, 1, "e"); st.fill("g", 20, 8, 4, 1, "e");
  st.set("g", 12, 8, "5"); st.set("g", 14, 9, "\\");
  st.fill("g", 1, 14, 26, 5, ",");
  st.fill("g", 4, 15, 5, 1, "z"); st.fill("g", 19, 15, 5, 1, "y");
  st.set("g", 13, 19, "D"); st.set("g", 14, 19, "D");
  st.fill("g", 13, 17, 2, 2, "M");
  W.defineMap("crewe_station", MQ.U.merge(DL, {
    name: "Crewe Station", outdoor: false, ambience: "industrial",
    legend: M.interior(), layers: st.layers(),
    station: { name: "Crewe", hub: true },
    spawnPoint: { x: 8, y: 10 },
    landmark: { name: "Crewe Station", x: 14, y: 9 },
    encounters: { grass: null },
    warps: [
      { x: 13, y: 19, to: "crewe", tx: 30, ty: 16, dir: "down", kind: "door" },
      { x: 14, y: 19, to: "crewe", tx: 30, ty: 16, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_crewe_guard", x: 10, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train", script: "mid_crewe_guard" },
      { id: "npc_crewe_cambrian", x: 22, y: 12, dir: "left", sprite: "npc_station", behaviour: "still", script: "mid_crewe_cambrian" },
      { id: "npc_crewe_platform_1", x: 5, y: 9, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Platform six for Chester, platform twelve for Wales, and platform five for a sandwich and a think."] },
      { id: "npc_crewe_platform_2", x: 21, y: 16, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["The board said Glasgow. Then it said Glasgow again. Then it said HOLD.",
          "Boards don't say HOLD. There's no HOLD."] }
    ],
    signs: [
      { x: 14, y: 9, text: ["THE DEPARTURE BOARDS.",
        "Twelve platforms, forty-one departures, and for about ninety seconds on Tuesday afternoon every single line read the same thing:",
        "SEV: URGENT. SUBJECT: would you like help with the little ones?"] }
    ],
    items: [{ x: 25, y: 17, item: "elixir", n: 2, hidden: true, flag: "item_crewe_station_1" }]
  }));

  // ---- the Works sheds: a dungeon that smells of hot oil -----------------
  const wk = M.canvas(40, 34, ".");
  wk.box("g", 0, 0, 40, 34, "#");
  wk.fill("g", 1, 0, 38, 1, "^");
  wk.fill("g", 1, 1, 38, 3, ",");
  // three long roads of track with pits between them and a traverser
  for (let i = 0; i < 3; i++) {
    const y = 6 + i * 8;
    wk.fill("g", 3, y, 34, 1, "=");
    wk.fill("g", 3, y + 1, 34, 1, ",");
    wk.fill("g", 3, y + 3, 34, 1, ",");
  }
  wk.fill("g", 2, 4, 36, 1, "7");
  wk.fill("g", 2, 12, 36, 1, "7"); wk.fill("g", 2, 20, 36, 1, "7");
  wk.fill("g", 18, 4, 4, 26, ",");
  wk.fill("g", 6, 6, 4, 1, "2"); wk.fill("g", 26, 6, 5, 1, "3");
  wk.fill("g", 8, 14, 5, 1, "2"); wk.fill("g", 28, 14, 4, 1, "2");
  wk.fill("g", 10, 22, 6, 1, "3"); wk.fill("g", 25, 22, 4, 1, "2");
  wk.fill("g", 3, 26, 34, 1, "=");
  wk.fill("g", 3, 27, 34, 3, ",");
  wk.fill("g", 4, 28, 4, 1, "z"); wk.fill("g", 30, 28, 5, 1, "y");
  wk.fill("g", 1, 30, 38, 1, ",");
  wk.set("g", 2, 30, "\\"); wk.set("g", 37, 30, "\\");
  wk.set("g", 19, 33, "D"); wk.set("g", 20, 33, "D");
  wk.fill("g", 19, 31, 2, 2, "M");
  wk.fill("g", 12, 2, 4, 1, "m"); wk.fill("g", 24, 2, 4, 1, "R");
  W.defineMap("crewe_works", MQ.U.merge(DL, {
    name: "Crewe Works — the Sheds", outdoor: false, ambience: "industrial", music: "dungeon_stack",
    legend: M.interior(), layers: wk.layers(),
    spawnPoint: { x: 19, y: 32 },
    landmark: { name: "Crewe Works", x: 20, y: 16 },
    encounters: { cave: "crewe_works_cave" },
    warps: [
      { x: 19, y: 33, to: "crewe", tx: 11, ty: 9, dir: "down", kind: "door" },
      { x: 20, y: 33, to: "crewe", tx: 11, ty: 9, dir: "down", kind: "door" }
    ],
    signs: [
      { x: 2, y: 30, text: ["THE ERECTING SHOP. Seven thousand locomotives were assembled between these walls.",
        "The last one left in 1991. The pit is still warm at the north end and there is no reason for the pit to be warm."] },
      { x: 37, y: 30, text: ["A works plate on the wall, unattached to anything.",
        "CREWE. No number. Every plate in the history of this place has had a number."] }
    ],
    items: [
      { x: 4, y: 2, item: "capsule_heavy", n: 3, hidden: true, flag: "item_crewe_works_1" },
      { x: 36, y: 2, item: "full_restore", n: 1, hidden: true, flag: "item_crewe_works_2" },
      { x: 36, y: 24, item: "ember_coal", n: 2, hidden: true, flag: "item_crewe_works_3" },
      { x: 3, y: 24, item: "collectible_14", n: 1, hidden: true, flag: "item_crewe_works_4" }
    ],
    npcs: [
      { id: "npc_crewe_works_shunt", x: 20, y: 16, dir: "down", sprite: "npc_saltworker", behaviour: "still", script: "mid_crewe_shunting" },
      { id: "npc_crewe_works_1", x: 8, y: 9, dir: "right", sprite: "npc_stoker", behaviour: "look", radius: 3, trainer: "tr_crewe_gym_1", sight: 3 },
      { id: "npc_crewe_works_2", x: 30, y: 17, dir: "left", sprite: "npc_stoker", behaviour: "look", radius: 3, trainer: "tr_crewe_gym_3", sight: 3 }
    ]
  }));

  // ---- the Heritage Centre and the APT deck ------------------------------
  const hc = M.canvas(32, 26, ",");
  hc.box("g", 0, 0, 32, 26, "#");
  hc.fill("g", 1, 0, 30, 1, "^");
  hc.fill("g", 2, 3, 28, 1, "=");
  hc.fill("g", 2, 4, 28, 1, "2");
  hc.fill("g", 2, 5, 28, 1, "2");
  hc.fill("g", 2, 6, 28, 1, "=");
  hc.fill("g", 12, 4, 8, 2, "3");
  hc.fill("g", 2, 9, 12, 1, "-"); hc.fill("g", 18, 9, 12, 1, "-");
  hc.fill("g", 2, 11, 10, 1, "5"); hc.fill("g", 20, 11, 10, 1, "5");
  hc.fill("g", 4, 14, 6, 1, "m"); hc.fill("g", 22, 14, 6, 1, "m");
  hc.fill("g", 12, 13, 8, 4, "R");
  hc.fill("g", 13, 14, 6, 2, ",");
  hc.fill("g", 2, 18, 6, 1, "i"); hc.fill("g", 24, 18, 6, 1, "i");
  hc.fill("g", 3, 21, 4, 1, "C"); hc.set("g", 7, 21, "K");
  hc.set("g", 15, 2, "\\"); hc.set("g", 29, 21, "\\");
  hc.set("g", 15, 25, "D"); hc.set("g", 16, 25, "D");
  hc.fill("g", 15, 23, 2, 2, "M");
  W.defineMap("crewe_heritage_centre", MQ.U.merge(DL, {
    name: "Crewe Heritage Centre", outdoor: false, ambience: "industrial",
    legend: M.interior(), layers: hc.layers(),
    spawnPoint: { x: 15, y: 24 },
    landmark: { name: "Heritage Centre", x: 16, y: 5 },
    encounters: { cave: null },
    warps: [
      { x: 15, y: 25, to: "crewe", tx: 39, ty: 30, dir: "down", kind: "door" },
      { x: 16, y: 25, to: "crewe", tx: 39, ty: 30, dir: "down", kind: "door" }
    ],
    signs: [
      { x: 15, y: 2, text: ["THE ADVANCED PASSENGER TRAIN.",
        "Tilting, 155 mph, thirty years ahead of everything, withdrawn 1986. The Italians bought the patents.",
        "It is still here, under a tarpaulin, and last Tuesday somebody took the tarpaulin off."] },
      { x: 29, y: 21, text: ["THE SIGNAL BOX COLLECTION — three boxes, saved and re-erected, levers and all.",
        "One of them is wired to the live network 'for demonstration purposes'."] }
    ],
    items: [
      { x: 29, y: 23, item: "elixir", n: 2, hidden: true, flag: "item_crewe_hc_1" },
      { x: 2, y: 23, item: "capsule_root", n: 2, hidden: true, flag: "item_crewe_hc_2" }
    ],
    npcs: [
      { id: "npc_crewe_apt", x: 16, y: 8, dir: "up", sprite: "npc_shadow_it", behaviour: "still", script: "mid_crewe_apt" },
      { id: "npc_crewe_hc_volunteer", x: 5, y: 19, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["I've volunteered here since it opened. We polish it every Sunday.",
          "Nobody's asked us to and nobody's stopping us and that's how everything worth keeping gets kept."] }
    ]
  }));

  // ---- Nantwich Road: the salon ------------------------------------------
  const nr = M.room(24, 18, { floor: ".", wall: "]", top: "^" });
  nr.fill("g", 2, 3, 8, 1, "j"); nr.fill("g", 14, 3, 8, 1, "j");
  nr.fill("g", 3, 6, 3, 1, "h"); nr.fill("g", 18, 6, 3, 1, "h");
  nr.fill("g", 3, 9, 3, 1, "h"); nr.fill("g", 18, 9, 3, 1, "h");
  nr.fill("g", 9, 12, 6, 1, "C"); nr.set("g", 15, 12, "K");
  nr.fill("g", 2, 14, 4, 1, "z"); nr.fill("g", 18, 14, 4, 1, "z");
  nr.set("g", 12, 2, "\\");
  W.defineMap("crewe_nantwich_road", MQ.U.merge(DL, {
    name: "Nantwich Road", outdoor: false, ambience: "town",
    legend: M.interior(), layers: nr.layers(),
    spawnPoint: { x: 11, y: 16 },
    encounters: { grass: null },
    warps: [
      { x: 11, y: 17, to: "crewe", tx: 8, ty: 37, dir: "down", kind: "door" },
      { x: 12, y: 17, to: "crewe", tx: 8, ty: 37, dir: "down", kind: "door" }
    ],
    signs: [
      { x: 12, y: 2, text: ["A letter taped to the inside of the window, facing out, so the street can read it.",
        "It is from the bank. It is very polite. It explains that the transaction was authorised by the account holder.",
        "Under it, in biro, in a different hand: 'I DID NOT AUTHORISE IT. I CLICKED A BOX THAT SAID UPDATE.'"] }
    ],
    items: [{ x: 21, y: 15, item: "cat_bell", n: 1, hidden: true, flag: "item_crewe_salon_1" }],
    npcs: [
      { id: "npc_crewe_salon", x: 11, y: 10, dir: "down", sprite: "npc_walker", behaviour: "still", script: "mid_crewe_salon" }
    ]
  }));

  // ---- GYM 4: the roundhouse ---------------------------------------------
  const gy = M.canvas(34, 30, "7");
  gy.fill("g", 1, 1, 32, 28, ",");
  gy.fill("g", 1, 0, 32, 1, "^");
  // the turntable pit in the middle, roads radiating out
  for (let y = 0; y < 30; y++) for (let x = 0; x < 34; x++) {
    const dx = x - 16, dy = (y - 13) * 1.4;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 5) gy.set("g", x, y, d < 4 ? "=" : "5");
  }
  const roads = [[6, 13], [26, 13], [16, 3], [16, 23], [7, 6], [25, 6], [7, 20], [25, 20]];
  for (let i = 0; i < roads.length; i++) {
    const rx = roads[i][0], ry = roads[i][1];
    const steps = 14;
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(16 + (rx - 16) * s / steps), y = Math.round(13 + (ry - 13) * s / steps);
      gy.set("g", x, y, "=");
    }
  }
  gy.fill("g", 2, 2, 4, 1, "3"); gy.fill("g", 28, 2, 4, 1, "3");
  gy.fill("g", 2, 26, 4, 1, "2"); gy.fill("g", 28, 26, 4, 1, "2");
  gy.fill("g", 12, 26, 3, 1, "z"); gy.fill("g", 19, 26, 3, 1, "y");
  gy.set("g", 16, 29, "D"); gy.set("g", 17, 29, "D");
  gy.fill("g", 16, 27, 2, 2, "M");
  gy.set("g", 16, 1, "$"); gy.set("g", 17, 1, "$");
  gy.fill("g", 15, 2, 4, 1, ",");
  gy.set("g", 14, 27, "\\"); gy.set("g", 4, 13, "\\");
  W.defineMap("crewe_gym", MQ.U.merge(DL, {
    name: "Crewe Gym — the Roundhouse", outdoor: false, ambience: "industrial",
    legend: M.interior(), layers: gy.layers(),
    spawnPoint: { x: 16, y: 28 },
    landmark: { name: "Crewe Gym", x: 16, y: 13 },
    encounters: { cave: null },
    warps: [
      { x: 16, y: 29, to: "crewe", tx: 38, ty: 37, dir: "down", kind: "door" },
      { x: 17, y: 29, to: "crewe", tx: 38, ty: 37, dir: "down", kind: "door" },
      { x: 16, y: 1, to: "crewe_gym_floor", tx: 11, ty: 20, dir: "up", kind: "door", cond: "gym4_open" },
      { x: 17, y: 1, to: "crewe_gym_floor", tx: 12, ty: 20, dir: "up", kind: "door", cond: "gym4_open" }
    ],
    signs: [
      { x: 14, y: 27, text: ["CREWE GYM — STOKER DI. KERNEL.",
        "HOUSE RULE: SUN ON TURN ONE.",
        "THE TABLE TURNS. YOU DO NOT WALK AT HER; YOU LINE UP THE ROAD AND THEN YOU WALK.",
        "Three roads out of eight will take you to the far side. The other five are engines."] },
      { x: 4, y: 13, text: ["The turntable. Sixty feet of riveted iron on a centre bearing, turned by one person and a handle, still, in this century."] }
    ],
    items: [
      { x: 3, y: 27, item: "elixir", n: 2, hidden: true, flag: "item_crewe_gym_1" },
      { x: 31, y: 3, item: "ember_coal", n: 2, hidden: true, flag: "item_crewe_gym_2" }
    ],
    npcs: [
      { id: "npc_gym4_gwil", x: 9, y: 13, dir: "right", sprite: "npc_stoker", behaviour: "look", radius: 3, trainer: "tr_crewe_gym_1", sight: 3 },
      { id: "npc_gym4_ceri", x: 16, y: 20, dir: "up", sprite: "npc_stoker", behaviour: "look", radius: 3, trainer: "tr_crewe_gym_2", sight: 3 },
      { id: "npc_gym4_bryn", x: 23, y: 13, dir: "left", sprite: "npc_stoker", behaviour: "look", radius: 3, trainer: "tr_crewe_gym_3", sight: 3 },
      { id: "npc_gym4_table", x: 16, y: 16, dir: "up", sprite: "npc_stoker", behaviour: "still", script: "mid_gym4_table" }
    ],
    triggers: [
      { x: 15, y: 2, w: 4, h: 1, script: "mid_gym4_backdoor", cond: "!gym4_open" }
    ]
  }));

  const gf = M.canvas(24, 22, ",");
  gf.box("g", 0, 0, 24, 22, "#");
  gf.fill("g", 1, 0, 22, 1, "^");
  gf.fill("g", 1, 1, 22, 1, "#");
  gf.fill("g", 6, 1, 3, 1, "W"); gf.fill("g", 15, 1, 3, 1, "W");
  gf.fill("g", 5, 4, 14, 13, "F");
  gf.fill("g", 2, 6, 3, 1, "3"); gf.fill("g", 19, 6, 3, 1, "3");
  gf.set("g", 11, 3, "G"); gf.set("g", 12, 3, "G");
  gf.fill("g", 2, 15, 3, 1, "m"); gf.fill("g", 19, 15, 3, 1, "m");
  gf.set("g", 2, 19, "z"); gf.set("g", 21, 19, "y");
  gf.set("g", 11, 21, "D"); gf.set("g", 12, 21, "D");
  gf.fill("g", 11, 19, 2, 2, "M");
  W.defineMap("crewe_gym_floor", MQ.U.merge(DL, {
    name: "Crewe Gym", outdoor: false, ambience: "industrial",
    legend: M.interior(), layers: gf.layers(),
    spawnPoint: { x: 11, y: 20 },
    encounters: { cave: null },
    warps: [
      { x: 11, y: 21, to: "crewe_gym", tx: 16, ty: 2, dir: "down", kind: "door" },
      { x: 12, y: 21, to: "crewe_gym", tx: 17, ty: 2, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_crewe_di", x: 11, y: 5, dir: "down", sprite: "di", behaviour: "still", script: "mid_gym4_di" }
    ],
    signs: [
      { x: 11, y: 3, text: ["THE KERNEL BADGE STAND. A firebox door, hinged open, with the badges laid on the grate.",
        "They are warm. They are always warm. Di thinks that is funny and she is right."] }
    ]
  }));
})();
