// =============================================================
// MonsterQuest v2 — HOLMES CHAPEL (region dane, Ch.4)
// A village built round a level crossing and a black-and-white church
// tower, with the West Coast Main Line through the middle of it and a
// signal box whose levers move at three in the morning.
// Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LEG = M.town();
  const DL = { region: "dane", dialogue: "town_holmes_chapel", music: "town_congleton", owner: "mid" };
  function inn(id, tpl, over) { return W.defineMap(id, W.builtin(tpl, MQ.U.merge(DL, over))); }

  const c = M.canvas(44, 36, ",");
  c.fill("g", 0, 0, 44, 2, "T");
  for (let x = 0; x < 44; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 33, "T"); c.fill("g", 43, 2, 1, 33, "T");
  c.fill("g", 0, 35, 44, 1, "T");
  c.fill("g", 18, 0, 3, 2, "="); c.fill("o", 18, 0, 3, 1, " ");
  c.fill("g", 43, 14, 1, 2, "=");
  c.fill("g", 30, 35, 3, 1, "=");

  // ---- north fields, the lane down from Goostrey, and St Luke's ---------
  c.fill("g", 1, 2, 42, 8, ".");
  c.fill("g", 18, 2, 3, 8, "=");
  B.trees(c, "hc-fields", 22, 2, 2, 40, 7, "T", "y", ["."]);
  c.fill("g", 3, 3, 10, 5, "\""); c.fill("g", 24, 5, 5, 4, "\"");
  c.scatter("g", "hc-flowers", "l", 8, 2, 2, 15, 7, ["."]);
  c.fill("g", 2, 9, 41, 1, ",");
  c.hline("g", 27, 2, 16, "w"); c.vline("g", 27, 2, 7, "w"); c.vline("g", 42, 2, 7, "w");
  B.house(c, { x: 30, y: 3, w: 11, h: 6, rh: 3, roof: "p", wall: "c", win: "C", door: "d", doorX: 5 });
  c.set("g", 33, 2, "p");
  c.scatter("g", "hc-graves", "g", 4, 28, 3, 2, 6, ["."]);
  c.set("g", 27, 6, "N");

  // ---- the village street ------------------------------------------------
  B.house(c, { x: 4, y: 10, w: 10, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });   // care
  B.house(c, { x: 16, y: 10, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });   // mart
  B.house(c, { x: 28, y: 10, w: 10, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });  // bakery
  c.fill("g", 1, 13, 42, 1, "-");
  c.fill("g", 1, 14, 42, 2, "=");
  c.fill("g", 1, 16, 42, 1, "-");
  const lampsA = [3, 12, 21, 30, 39], lampsB = [6, 15, 33, 40];
  for (let i = 0; i < lampsA.length; i++) c.set("g", lampsA[i], 13, "L");
  for (let i = 0; i < lampsB.length; i++) c.set("g", lampsB[i], 16, "L");
  c.set("g", 17, 13, "O"); c.set("g", 29, 16, "u"); c.set("g", 41, 13, "n");
  c.set("g", 11, 16, "H"); c.set("g", 12, 16, "I");
  B.house(c, { x: 4, y: 17, w: 9, h: 3, rh: 1, wall: "E", win: "J", doorX: 4, over: "^" });  // inn
  B.house(c, { x: 15, y: 17, w: 9, h: 3, rh: 1, doorX: 4, over: "^" });                     // house 1
  B.house(c, { x: 27, y: 17, w: 9, h: 3, rh: 1, doorX: 4, over: "^" });                     // house 2
  c.fill("g", 1, 20, 42, 1, ",");

  // ---- the level crossing and the line -----------------------------------
  c.fill("g", 1, 21, 42, 1, "F");
  c.fill("g", 1, 26, 42, 1, "F");
  c.fill("g", 1, 22, 42, 1, ",");
  c.fill("g", 8, 22, 26, 1, "0");
  c.fill("g", 1, 23, 42, 2, "2");
  c.fill("g", 1, 25, 42, 1, ",");
  c.fill("g", 8, 25, 26, 1, "0");
  c.fill("g", 24, 17, 3, 14, "r");
  c.set("g", 7, 23, "4"); c.set("g", 35, 24, "4");
  c.set("g", 33, 22, "1"); c.set("g", 9, 25, "1");
  c.set("g", 12, 22, "N");

  // ---- south of the line: the station and the signal box -----------------
  c.fill("g", 1, 27, 42, 4, ",");
  c.fill("g", 24, 27, 3, 4, "r");
  B.house(c, { x: 9, y: 27, w: 11, h: 4, rh: 1, door: "S", doorX: 5, over: "^" });
  B.house(c, { x: 30, y: 27, w: 7, h: 4, rh: 1, wall: "X", doorX: 3, over: "^" });
  c.set("g", 8, 30, "P"); c.set("g", 38, 30, "N");

  // ---- the meadow down to the Dane ---------------------------------------
  c.fill("g", 1, 32, 42, 3, ".");
  M.lake(c, 5, 32, 8, 2, "$", "e");
  c.fill("g", 1, 31, 42, 1, "=");
  c.fill("g", 24, 32, 8, 2, "\"");
  B.trees(c, "hc-meadow", 12, 33, 32, 9, 2, "B", "b", ["."]);
  c.set("g", 16, 33, "H"); c.set("g", 20, 33, "8");
  c.fill("g", 30, 32, 3, 3, "=");
  c.set("g", 34, 33, "z");

  W.defineMap("holmes_chapel", MQ.U.merge(DL, {
    name: "Holmes Chapel", outdoor: true, weatherZone: "dane", ambience: "town",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 19, y: 9 },
    healPoint: { x: 8, y: 14 },
    landmark: { name: "Holmes Chapel", x: 20, y: 15 },
    encounters: { grass: "holmes_chapel_grass", water: null },
    warps: [
      { x: 8, y: 12, to: "holmes_chapel_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 20, y: 12, to: "holmes_chapel_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 32, y: 12, to: "holmes_chapel_bakery", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 8, y: 19, to: "holmes_chapel_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 19, y: 19, to: "holmes_chapel_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 31, y: 19, to: "holmes_chapel_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 35, y: 8, to: "holmes_chapel_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 14, y: 30, to: "holmes_chapel_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 33, y: 30, to: "holmes_chapel_signal_box", tx: 8, ty: 13, dir: "up", kind: "door" },
      { x: 18, y: 0, to: "route_knutsford_holmes", tx: 14, ty: 46, dir: "up", kind: "edge" },
      { x: 19, y: 0, to: "route_knutsford_holmes", tx: 15, ty: 46, dir: "up", kind: "edge" },
      { x: 20, y: 0, to: "route_knutsford_holmes", tx: 16, ty: 46, dir: "up", kind: "edge" },
      { x: 43, y: 14, to: "route_holmes_jodrell", tx: 1, ty: 17, dir: "right", kind: "edge" },
      { x: 43, y: 15, to: "route_holmes_jodrell", tx: 1, ty: 18, dir: "right", kind: "edge" },
      { x: 30, y: 35, to: "route_holmes_congleton", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 31, y: 35, to: "route_holmes_congleton", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 32, y: 35, to: "route_holmes_congleton", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 27, y: 6, text: ["ST LUKE'S, HOLMES CHAPEL. Brick outside, and inside — if you look up — a black-and-white timber frame from about 1430.",
        "The village hid the old church inside a new one. Nobody has ever explained why and everybody thinks it was sensible."] },
      { x: 12, y: 22, text: ["HOLMES CHAPEL — CHANGE HERE FOR NOTHING AT ALL.",
        "Manchester one way, Crewe the other, and a level crossing that has closed for eleven minutes an hour since 1842."] },
      { x: 38, y: 30, text: ["SIGNAL BOX (DISUSED 1994).",
        "PLEASE DO NOT ENTER. LEVERS ARE HEAVY AND THE FLOOR IS NOT.",
        "Under it, newer: 'the levers move on their own at 03:00 and I would like that written down somewhere official' — D. HOLT"] },
      { x: 8, y: 30, text: ["HOLMES CHAPEL STATION. Two platforms, one bridge, and a bench with a view of the bridge."] },
      { x: 39, y: 13, text: ["PARISH NOTICES.",
        "Viaduct arch-count run, Saturday. Bring a torch and somebody who can count.",
        "A card pinned over it: 'ONE COMMAND AND BE CLEAN — TATTON, THIS WEEK.' Somebody has written under it: 'he was our IT teacher. He was LOVELY.'"] }
    ],
    items: [
      { x: 3, y: 33, item: "capsule_kernel", n: 3, flag: "item_holmes_1" },
      { x: 41, y: 6, item: "elixir", n: 1, hidden: true, flag: "item_holmes_2" },
      { x: 26, y: 33, item: "ghost_lens", n: 1, hidden: true, flag: "item_holmes_3" },
      { x: 5, y: 22, item: "tonic", n: 2, flag: "item_holmes_4" },
      { x: 41, y: 32, item: "capsule_night", n: 4, hidden: true, flag: "item_holmes_5" }
    ],
    catGaps: [
      { x: 20, y: 21, item: "cat_token_9", n: 1, flag: "catgap_holmes_1",
        say: "MEADOW goes under the crossing fence, sits on the down line for exactly as long as it takes your heart to stop, and comes back with a signal-box lamp key." }
    ],
    restPoints: [{ x: 17, y: 33, flag: "bigboy_sat_holmes" }],
    npcs: [
      { id: "npc_holmes_dot", x: 34, y: 31, dir: "up", sprite: "npc_signaller", behaviour: "still", script: "mid_holmes_dot" },
      { id: "npc_holmes_bev", x: 34, y: 13, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "mid_holmes_bev" },
      { id: "npc_holmes_gruff", x: 22, y: 33, dir: "left", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_holmes_chapel_3", sight: 3 },
      { id: "npc_holmes_crossing", x: 23, y: 20, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "mid_holmes_crossing" },
      { id: "npc_holmes_kellan_note", x: 9, y: 16, dir: "down", sprite: "npc_kid", behaviour: "still", script: "mid_holmes_kellan_note" },
      { id: "npc_holmes_commuter", x: 15, y: 22, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[15, 22], [28, 22]], pathMode: "pingpong",
        say: ["Eleven minutes a train, six trains an hour, and a village that has organised its entire emotional life around a barrier."] },
      { id: "npc_holmes_verger", x: 37, y: 9, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Look up when you're inside. There's a whole timber church up there, wrapped in brick like a present nobody opened.",
          "That's Cheshire, that is. Perfectly good old thing, quietly kept, never mentioned."] },
      { id: "npc_holmes_farmer", x: 6, y: 6, dir: "down", sprite: "npc_farmer", behaviour: "wander", radius: 3,
        say: ["Dane comes up fast. Meadow's a meadow on Monday and a lake on Tuesday and a meadow again by Friday.",
          "Everything round here is temporary except the viaduct."] },
      { id: "npc_holmes_kid", x: 27, y: 33, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Twenty-three arches. Everyone says twenty-three. I've counted twenty-two and one that's bricked up.",
          "Nobody wants to hear about the bricked-up one."] },
      { id: "npc_holmes_spotter", x: 30, y: 25, dir: "left", sprite: "npc_kid", behaviour: "still",
        say: ["Pendolino, four twenty-two. Freight, four thirty-one. Nothing at four forty-four, and there's ALWAYS something at four forty-four."] }
    ],
    triggers: [
      { x: 18, y: 8, w: 3, h: 1, script: "mid_holmes_arrival", once: "holmes_arrival", cond: "!holmes_arrival" }
    ]
  }));

  // ------------------------------------------------------------ interiors --
  inn("holmes_chapel_care", "care_centre", {
    name: "Holmes Chapel Care Centre",
    warps: [
      { x: 7, y: 11, to: "holmes_chapel", tx: 8, ty: 13, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "holmes_chapel", tx: 8, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_holmes_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["In you come. It's a village centre so it's me, a kettle and a machine that cost more than the building."] },
      { id: "npc_holmes_care_1", x: 11, y: 5, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["Dot's been in about the signal box again. Forty-one years she worked it. She'd know a ghost from a fault.",
          "She says it's a fault. That's what frightens me."] }
    ]
  });
  inn("holmes_chapel_mart", "shop", {
    name: "Holmes Chapel Stores", shop: "shop_holmes_chapel",
    warps: [
      { x: 6, y: 9, to: "holmes_chapel", tx: 20, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "holmes_chapel", tx: 20, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_holmes_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_holmes_chapel",
      say: ["Capsules, salves, torch batteries, and a shelf of things for people who go under the viaduct at night."] }],
    items: [{ x: 12, y: 2, item: "torch", n: 1, flag: "item_holmes_mart_1" }]
  });
  inn("holmes_chapel_bakery", "shop", {
    name: "Bev's Bakery", shop: "shop_holmes_bakery",
    warps: [
      { x: 6, y: 9, to: "holmes_chapel", tx: 32, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "holmes_chapel", tx: 32, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_holmes_bev_shop", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_holmes_bakery",
        trainer: "tr_holmes_chapel_2", sight: 0,
        say: ["Six hundred loaves before five. If you want conversation, come at eleven."] },
      { id: "npc_holmes_bakery_1", x: 10, y: 3, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Brother Kellan came in for a bloomer on Tuesday, same as always, and blessed the till.",
          "Bev told him the till had been blessed by the bank and he laughed, which he never used to do."] }
    ],
    items: [{ x: 12, y: 2, item: "brew_hedgerow_cordial", n: 2, flag: "item_holmes_bakery_1" }]
  });
  inn("holmes_chapel_inn", "pub", {
    name: "The Red Lion",
    warps: [
      { x: 6, y: 11, to: "holmes_chapel", tx: 8, ty: 20, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "holmes_chapel", tx: 8, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_holmes_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Rooms upstairs. The three-fifteen freight goes through the wall at about the volume of an opinion.",
          "Sleep anyway. Everybody does eventually."] },
      { id: "npc_holmes_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_signaller", behaviour: "still",
        say: ["The dish has been quiet a fortnight. You don't notice a telescope until it stops.",
          "It's like a fridge. You only hear it when it goes off."] },
      { id: "npc_holmes_pub_2", x: 10, y: 8, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Man in hi-vis came in, drank one half, paid cash, and asked what time the last train to Goostrey was.",
          "There is no last train to Goostrey. There's no FIRST train to Goostrey. She knew that. She was checking whether I did."] }
    ]
  });
  inn("holmes_chapel_house_1", "house_small", {
    name: "Station Road Cottage",
    warps: [
      { x: 5, y: 9, to: "holmes_chapel", tx: 19, ty: 20, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "holmes_chapel", tx: 19, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_holmes_h1", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still",
      say: ["My grandson does the arch run. Twenty-three arches, between trains, in the dark.",
        "I have told him what I think. He has told me what he thinks of what I think."] }]
  });
  inn("holmes_chapel_house_2", "house_small", {
    name: "Macclesfield Road House",
    warps: [
      { x: 5, y: 9, to: "holmes_chapel", tx: 31, ty: 20, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "holmes_chapel", tx: 31, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_holmes_h2", x: 6, y: 3, dir: "down", sprite: "npc_dev", behaviour: "still", script: "mid_holmes_house2" }]
  });
  inn("holmes_chapel_station", "station", {
    name: "Holmes Chapel Station", station: { name: "Holmes Chapel" },
    warps: [
      { x: 8, y: 11, to: "holmes_chapel", tx: 14, ty: 31, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "holmes_chapel", tx: 14, ty: 31, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_holmes_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
      say: ["Crewe's twelve minutes. Crewe is where everything in this county goes to be delayed properly."] }],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES. The 16:44 is shown as 'ON TIME' and there is no 16:44."] }]
  });

  // ---- St Luke's ---------------------------------------------------------
  const ch = M.room(14, 14, { floor: ",", wall: ":", top: ":", win: "?" });
  ch.fill("g", 4, 3, 6, 1, "t");
  for (let y = 5; y < 11; y += 2) { ch.fill("g", 2, y, 3, 1, "e"); ch.fill("g", 9, y, 3, 1, "e"); }
  ch.set("g", 6, 2, "\\"); ch.set("g", 1, 8, "]"); ch.set("g", 12, 8, "]");
  W.defineMap("holmes_chapel_church", MQ.U.merge(DL, {
    name: "St Luke's", outdoor: false, ambience: "town",
    legend: M.interior(), layers: ch.layers(),
    spawnPoint: { x: 6, y: 12 },
    warps: [
      { x: 6, y: 13, to: "holmes_chapel", tx: 35, ty: 9, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "holmes_chapel", tx: 35, ty: 9, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_holmes_vicar", x: 6, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still",
      say: ["Look up. Go on. There's a timber-framed church up there, six hundred years old, inside a brick one.",
        "They didn't knock it down. They wrapped it. I think about that a great deal, lately."] }],
    signs: [{ x: 6, y: 2, text: ["A roof of oak, blackened, medieval, and entirely invisible from outside.",
      "A card on the pillar: 'THE OLD FABRIC IS STILL LOAD-BEARING.'"] }],
    items: [{ x: 12, y: 11, item: "capsule_mesh", n: 3, hidden: true, flag: "item_holmes_church_1" }],
    encounters: { grass: null }
  }));

  // ---- the signal box ----------------------------------------------------
  const sb = M.room(18, 15, { floor: "%", wall: "7", top: "^" });
  sb.fill("g", 2, 3, 14, 1, "5");
  sb.fill("g", 2, 5, 14, 1, "1");
  sb.fill("g", 3, 7, 12, 1, "m");
  sb.fill("g", 2, 9, 4, 1, "t"); sb.set("g", 3, 10, "h");
  sb.set("g", 15, 9, "l"); sb.set("g", 1, 12, "v");
  sb.set("g", 16, 3, "\\");
  W.defineMap("holmes_chapel_signal_box", MQ.U.merge(DL, {
    name: "Holmes Chapel Signal Box", outdoor: false, ambience: "industrial",
    legend: M.interior(), layers: sb.layers(),
    spawnPoint: { x: 8, y: 13 },
    warps: [
      { x: 8, y: 14, to: "holmes_chapel", tx: 33, ty: 31, dir: "down", kind: "door" },
      { x: 9, y: 14, to: "holmes_chapel", tx: 33, ty: 31, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_holmes_levers", x: 8, y: 8, dir: "up", sprite: "npc_signaller", behaviour: "still", script: "mid_holmes_levers" },
      { id: "npc_holmes_dot_box", x: 4, y: 11, dir: "right", sprite: "npc_signaller", behaviour: "still",
        trainer: "tr_holmes_chapel_1", sight: 0, script: "mid_holmes_dot_box", cond: "case_11_watching" }
    ],
    signs: [
      { x: 16, y: 3, text: ["THE DIAGRAM. Every point, every signal, every block from Sandbach to Chelford, in enamel and small brass lamps.",
        "One lamp is lit. It is the lamp for a block that was lifted in 1969."] }
    ],
    items: [{ x: 16, y: 12, item: "collectible_9", n: 1, hidden: true, flag: "item_holmes_box_1" }],
    encounters: { cave: null, grass: null }
  }));
})();
