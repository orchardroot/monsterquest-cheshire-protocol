// =============================================================
// MonsterQuest v2 — SANDBACH (region dane, Ch.5)
// A cobbled market square with two ninth-century Saxon crosses standing
// in the middle of it, smashed by Puritans, kept in gardens for two
// hundred years and put back up in 1816 out of sheer stubbornness.
// In Chapter 5 they light, carving by carving. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LEG = M.town({ "'": "cross_saxon" });
  const DL = { region: "dane", dialogue: "town_sandbach", music: "town_congleton", owner: "mid" };
  function inn(id, tpl, over) { return W.defineMap(id, W.builtin(tpl, MQ.U.merge(DL, over))); }

  const c = M.canvas(46, 38, ",");
  c.fill("g", 0, 0, 46, 2, "T");
  for (let x = 0; x < 46; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 35, "T"); c.fill("g", 45, 2, 1, 35, "T");
  c.fill("g", 0, 37, 46, 1, "T");
  c.fill("g", 45, 14, 1, 3, "=");
  c.fill("g", 20, 37, 3, 1, "=");

  // ---- north: St Mary's, the post office, the old wells ------------------
  c.fill("g", 1, 2, 44, 7, ".");
  B.trees(c, "sb-north", 18, 2, 2, 42, 6, "T", "y", ["."]);
  c.hline("g", 4, 2, 15, "w"); c.vline("g", 4, 2, 7, "w"); c.vline("g", 18, 2, 7, "w");
  B.house(c, { x: 6, y: 3, w: 11, h: 6, rh: 3, roof: "p", wall: "c", win: "C", door: "d", doorX: 5 });
  c.set("g", 9, 2, "p");
  c.scatter("g", "sb-graves", "g", 5, 5, 3, 2, 6, ["."]);
  c.set("g", 4, 5, "N");
  B.house(c, { x: 24, y: 4, w: 10, h: 4, rh: 1, door: "S", doorX: 4, over: "^" });
  c.set("g", 35, 6, "O");
  c.fill("g", 1, 9, 44, 1, ",");

  // ---- the street ---------------------------------------------------------
  B.house(c, { x: 3, y: 10, w: 10, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 15, y: 10, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 27, y: 10, w: 10, h: 3, rh: 1, wall: "E", win: "J", doorX: 4, over: "^" });
  c.fill("g", 1, 13, 44, 1, "-");
  c.fill("g", 1, 14, 44, 2, "=");
  c.fill("g", 1, 16, 44, 1, "-");
  const lam = [2, 9, 26, 33, 43];
  for (let i = 0; i < lam.length; i++) { c.set("g", lam[i], 13, "L"); c.set("g", lam[i], 16, "L"); }
  c.set("g", 40, 13, "n"); c.set("g", 13, 16, "H"); c.set("g", 14, 16, "I"); c.set("g", 21, 13, "j");

  // ---- the market square, the crosses, the board ------------------------
  c.fill("g", 1, 17, 44, 11, ",");
  c.fill("g", 7, 17, 32, 11, "=");
  c.set("g", 20, 21, "'"); c.set("g", 23, 21, "'");
  c.fill("g", 19, 22, 6, 1, "_"); c.fill("g", 19, 20, 6, 1, "_");
  c.set("g", 18, 21, "_"); c.set("g", 25, 21, "_");
  c.set("g", 21, 21, "_"); c.set("g", 22, 21, "_");
  for (let i = 0; i < 3; i++) { c.fill("g", 9 + i * 5, 18, 3, 1, "A"); c.fill("o", 9 + i * 5, 17, 3, 1, "a"); }
  for (let i = 0; i < 3; i++) { c.fill("g", 9 + i * 5, 26, 3, 1, "A"); c.fill("o", 9 + i * 5, 25, 3, 1, "a"); }
  c.set("g", 16, 24, "n");
  c.set("g", 8, 21, "L"); c.set("g", 37, 21, "L"); c.set("g", 30, 25, "H"); c.set("g", 12, 22, "H");
  B.house(c, { x: 29, y: 17, w: 12, h: 5, rh: 2, wall: "E", win: "J", door: "@", doorX: 5, over: "^" });
  c.set("g", 28, 21, "P");
  B.house(c, { x: 2, y: 21, w: 5, h: 3, rh: 1, doorX: 2, over: "^" });
  B.house(c, { x: 40, y: 24, w: 5, h: 3, rh: 1, doorX: 2, over: "^" });
  c.fill("g", 1, 28, 44, 2, "=");

  // ---- the Wheelock cut ---------------------------------------------------
  c.fill("g", 1, 30, 44, 1, "t");
  c.fill("g", 1, 31, 44, 2, "~");
  c.fill("g", 1, 33, 44, 1, "t");
  c.fill("g", 30, 30, 3, 4, "x");
  c.fill("g", 30, 29, 3, 1, "=");
  c.set("g", 10, 31, "K"); c.set("g", 10, 32, "K");
  c.set("g", 6, 31, "Q"); c.set("g", 38, 32, "Q");
  c.fill("g", 1, 34, 44, 3, ".");
  B.trees(c, "sb-south", 16, 2, 34, 42, 3, "B", "b", ["."]);
  c.fill("g", 6, 34, 8, 2, "\""); c.fill("g", 34, 34, 8, 2, "\"");
  c.fill("g", 20, 34, 3, 3, "=");
  c.fill("g", 20, 34, 13, 1, "=");
  c.set("g", 18, 35, "N");
  c.set("g", 26, 29, "N");

  W.defineMap("sandbach", MQ.U.merge(DL, {
    name: "Sandbach", outdoor: true, weatherZone: "dane", ambience: "town",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 44, y: 15 },
    healPoint: { x: 7, y: 14 },
    landmark: { name: "Sandbach Crosses", x: 21, y: 21 },
    encounters: { grass: "sandbach_grass", water: null },
    fishing: "fish_route_congleton_sandbach",
    warps: [
      { x: 7, y: 12, to: "sandbach_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 19, y: 12, to: "sandbach_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 31, y: 12, to: "sandbach_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 28, y: 7, to: "sandbach_post", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 11, y: 8, to: "sandbach_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 34, y: 21, to: "sandbach_old_hall", tx: 11, ty: 16, dir: "up", kind: "door" },
      { x: 4, y: 23, to: "sandbach_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 42, y: 26, to: "sandbach_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 45, y: 14, to: "route_congleton_sandbach", tx: 1, ty: 15, dir: "right", kind: "edge" },
      { x: 45, y: 15, to: "route_congleton_sandbach", tx: 1, ty: 16, dir: "right", kind: "edge" },
      { x: 45, y: 16, to: "route_congleton_sandbach", tx: 1, ty: 17, dir: "right", kind: "edge" },
      { x: 20, y: 37, to: "route_sandbach_crewe", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 21, y: 37, to: "route_sandbach_crewe", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 22, y: 37, to: "route_sandbach_crewe", tx: 16, ty: 1, dir: "down", kind: "edge" },
      { x: 1, y: 7, to: "route_sandbach_middlewich", tx: 54, ty: 7, dir: "left", kind: "edge" }
    ],
    signs: [
      { x: 16, y: 24, text: ["THE BOUNTY BOARD.",
        "Three cards, pinned by somebody who takes pinning seriously. No maps. Just descriptions.",
        "'Chewed berries on a hedge somewhere along the Wheelock. Not a deer. Deer don't spit the pips out.'"] },
      { x: 26, y: 29, text: ["THE SAXON CROSSES.",
        "Ninth century, Mercian, carved with a nativity on one face and a crucifixion on the other.",
        "Broken up by Puritans about 1650. The town kept the bits — in gardens, in walls, in a rockery at Tarporley.",
        "Put back together and stood up again in 1816. WE KEPT THE BITS."] },
      { x: 4, y: 5, text: ["ST MARY'S, SANDBACH. The bell was stolen in 1972 and returned, anonymously, in 1979, with a note that said 'sorry, it was heavier than we thought.'"] },
      { x: 40, y: 13, text: ["MARKET NOTICE — Thursdays.",
        "A separate card, in a beautiful hand: 'THE CROSSES ARE NOT A KEYBOARD. — H.'"] },
      { x: 18, y: 35, text: ["ELWORTH & CREWE, 3 MILES. Follow the cut then the railway, and mind the embankment after dark.",
        "Under it: 'the sparks are friendly. the fog is not.'"] },
      { x: 28, y: 21, text: ["THE OLD HALL — a coaching inn from 1656, black on white, and every beam of it reclaimed from somewhere older."] }
    ],
    items: [
      { x: 3, y: 3, item: "capsule_kernel", n: 4, flag: "item_sandbach_1" },
      { x: 43, y: 35, item: "elixir", n: 2, hidden: true, flag: "item_sandbach_2" },
      { x: 2, y: 35, item: "revive_salts", n: 2, hidden: true, flag: "item_sandbach_3" },
      { x: 43, y: 4, item: "capsule_root", n: 2, hidden: true, flag: "item_sandbach_4" },
      { x: 4, y: 19, item: "tonic", n: 3, flag: "item_sandbach_5" },
      { x: 39, y: 34, item: "collectible_13", n: 1, hidden: true, flag: "item_sandbach_6" }
    ],
    catGaps: [
      { x: 24, y: 24, item: "cat_token_1", n: 1, flag: "catgap_sandbach_1",
        say: "MEADOW squeezes between the plinth and the railing, sits in the shadow of the north cross exactly where the carving of the animals is, and looks at you until you look at the carving." }
    ],
    restPoints: [{ x: 27, y: 24, flag: "meadow_sat_sandbach" }],
    npcs: [
      { id: "npc_sandbach_nia", x: 19, y: 24, dir: "up", sprite: "npc_historian", behaviour: "still", script: "mid_sandbach_nia" },
      { id: "npc_sandbach_hild", x: 25, y: 20, dir: "left", sprite: "npc_granny", behaviour: "still", script: "mid_sandbach_hild" },
      { id: "npc_sandbach_board", x: 16, y: 25, dir: "up", sprite: "npc_walker", behaviour: "still", script: "mid_sandbach_board" },
      { id: "npc_sandbach_cousin", x: 18, y: 22, dir: "right", sprite: "npc_walker", behaviour: "still", script: "mid_sandbach_cousin" },
      { id: "npc_sandbach_bram", x: 12, y: 29, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_sandbach_3", sight: 3, script: "mid_sandbach_bram" },
      { id: "npc_sandbach_gethin", x: 11, y: 19, dir: "down", sprite: "npc_shopkeep", behaviour: "still", trainer: "tr_sandbach_2", sight: 0,
        say: ["Crumbly, not creamy. If it doesn't fall apart on the knife it isn't Cheshire and I'll not sell it to you."] },
      { id: "npc_sandbach_mostyn", x: 36, y: 26, dir: "left", sprite: "npc_shadow_it", behaviour: "look", radius: 3, trainer: "tr_sandbach_5", sight: 3 },
      { id: "npc_sandbach_drop", x: 17, y: 4, dir: "left", sprite: "npc_historian", behaviour: "still", script: "mid_sandbach_drop", cond: "case_12_open" },
      { id: "npc_sandbach_shrine", x: 22, y: 22, dir: "up", sprite: "npc_historian", behaviour: "still", script: "mid_sandbach_shrine", cond: "sandbach_shrine" },
      { id: "npc_sandbach_boater", x: 20, y: 30, dir: "right", sprite: "npc_boater", behaviour: "path", path: [[8, 30], [28, 30]], pathMode: "pingpong",
        say: ["Wheelock flight. Sixteen locks in a mile and a half. It's the best afternoon in Cheshire and it takes four hours."] },
      { id: "npc_sandbach_stall_1", x: 10, y: 27, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Salt, cheese, and a man over there selling phone cases with the crosses printed on them.",
          "Hild has spoken to him. He is going to move."] },
      { id: "npc_sandbach_granny", x: 34, y: 23, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["There was a lorry parked up on the Elworth road nine days with the engine running.",
          "Somebody rang the police. The police rang the haulage firm. The haulage firm said they'd never heard of it."] },
      { id: "npc_sandbach_kid", x: 27, y: 19, dir: "left", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["You're not allowed to climb the crosses. I've climbed the crosses.",
          "They're warm. Stone shouldn't be warm at night."] }
    ],
    triggers: [
      { x: 44, y: 14, w: 1, h: 3, script: "mid_sandbach_arrival", once: "sandbach_arrival", cond: "!sandbach_arrival" },
      { x: 19, y: 22, w: 6, h: 1, script: "mid_sandbach_crosses", once: "sandbach_crosses_read", cond: "!sandbach_crosses_read" }
    ]
  }));

  // ------------------------------------------------------------ interiors --
  inn("sandbach_care", "care_centre", {
    name: "Sandbach Care Centre",
    warps: [
      { x: 7, y: 11, to: "sandbach", tx: 7, ty: 13, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "sandbach", tx: 7, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_sandbach_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["In you come. Since the crosses started doing whatever it is they're doing we've been busy at odd hours."] },
      { id: "npc_sandbach_care_1", x: 11, y: 5, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["If the stones will revive a fainted creature then that's a good thing and I don't need to know how.",
          "That is not incuriosity. That is forty years of night shifts."] }
    ]
  });
  inn("sandbach_mart", "shop", {
    name: "Sandbach Mart", shop: "shop_sandbach",
    warps: [
      { x: 6, y: 9, to: "sandbach", tx: 19, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "sandbach", tx: 19, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_sandbach_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_sandbach",
      say: ["Capsules, revives, and a rack of fog lamps that started selling last week and hasn't stopped."] }],
    items: [{ x: 12, y: 2, item: "revive_salts", n: 2, flag: "item_sandbach_mart_1" }]
  });
  inn("sandbach_inn", "pub", {
    name: "The Black Bear",
    warps: [
      { x: 6, y: 11, to: "sandbach", tx: 31, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "sandbach", tx: 31, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_sandbach_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room's up the back stair, which is 1656 and knows it. Sleep through to the next band of the day."] },
      { id: "npc_sandbach_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Three sixth-formers running the county's password trade out of a bedroom in Elworth.",
          "And a grown man paying them in vouchers. It's the vouchers that get me."] },
      { id: "npc_sandbach_pub_2", x: 10, y: 8, dir: "up", sprite: "npc_farmer", behaviour: "still",
        say: ["Fog's not weather. I've farmed here forty years. Fog comes off the moss and off the flashes and off the river.",
          "This comes off the ROAD."] }
    ]
  });
  inn("sandbach_post", "shop", {
    name: "Sandbach Post Office", shop: "shop_sandbach_post",
    warps: [
      { x: 6, y: 9, to: "sandbach", tx: 28, ty: 8, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "sandbach", tx: 28, ty: 8, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_sandbach_postmaster", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "mid_sandbach_post" },
      { id: "npc_sandbach_post_1", x: 11, y: 3, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["Letters. Actual letters. My grandson says nobody writes letters and I say nobody reads emails, so."] }
    ]
  });
  inn("sandbach_house_1", "house_small", {
    name: "Hightown Cottage",
    warps: [
      { x: 5, y: 9, to: "sandbach", tx: 4, ty: 24, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "sandbach", tx: 4, ty: 24, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_sandbach_h1", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still",
      say: ["My family had a piece of the north cross in the garden wall for a hundred and sixty years.",
        "We gave it back in 1816 and my great-great-grandmother cried. It was HERS by then."] }]
  });
  inn("sandbach_house_2", "house_small", {
    name: "Wheelock Cottage",
    warps: [
      { x: 5, y: 9, to: "sandbach", tx: 42, ty: 27, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "sandbach", tx: 42, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_sandbach_h2", x: 6, y: 3, dir: "down", sprite: "npc_boater", behaviour: "still",
      say: ["I work the flight. Sixteen locks, and every one of them a conversation with a stranger about the weather.",
        "Best job in England. Do not tell anyone."] }]
  });

  const sc = M.room(14, 14, { floor: ",", wall: ":", top: ":", win: "?" });
  sc.fill("g", 4, 3, 6, 1, "t");
  for (let y = 5; y < 11; y += 2) { sc.fill("g", 2, y, 3, 1, "e"); sc.fill("g", 9, y, 3, 1, "e"); }
  sc.set("g", 6, 2, "\\");
  W.defineMap("sandbach_church", MQ.U.merge(DL, {
    name: "St Mary's, Sandbach", outdoor: false, ambience: "town",
    legend: M.interior(), layers: sc.layers(),
    spawnPoint: { x: 6, y: 12 },
    warps: [
      { x: 6, y: 13, to: "sandbach", tx: 11, ty: 9, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "sandbach", tx: 11, ty: 9, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_sandbach_verger", x: 6, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still", script: "mid_sandbach_verger" }],
    signs: [{ x: 6, y: 2, text: ["A photograph of the crosses in pieces, in a garden, in 1809.",
      "Beside it a photograph of them standing, in 1817, with half the town in the frame and nobody smiling because you didn't, then."] }],
    items: [{ x: 12, y: 11, item: "capsule_mesh", n: 3, hidden: true, flag: "item_sandbach_church_1" }],
    encounters: { grass: null }
  }));

  const oh = M.room(22, 18, { floor: "%", wall: "]", top: "^" });
  oh.fill("g", 2, 3, 6, 1, "Z"); oh.set("g", 8, 3, "Y");
  oh.fill("g", 12, 4, 4, 1, "T"); oh.fill("g", 12, 5, 4, 1, "o");
  oh.fill("g", 3, 7, 4, 1, "T"); oh.fill("g", 3, 8, 4, 1, "o");
  oh.fill("g", 15, 8, 4, 1, "T"); oh.fill("g", 15, 9, 4, 1, "o");
  oh.fill("g", 9, 11, 4, 1, "f");
  oh.set("g", 20, 3, "a"); oh.set("g", 1, 13, "U");
  oh.set("g", 11, 2, "\\");
  W.defineMap("sandbach_old_hall", MQ.U.merge(DL, {
    name: "The Old Hall", outdoor: false, ambience: "town",
    legend: M.interior(), layers: oh.layers(),
    spawnPoint: { x: 11, y: 16 },
    warps: [
      { x: 10, y: 17, to: "sandbach", tx: 34, ty: 22, dir: "down", kind: "door" },
      { x: 11, y: 17, to: "sandbach", tx: 34, ty: 22, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_sandbach_oldhall_landlord", x: 5, y: 4, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Sixteen fifty-six, and every beam in it older than that because they took them off a barn that was falling down.",
          "Reuse. Cheshire invented reuse and then spent four hundred years pretending it was thrift."] },
      { id: "npc_sandbach_bell", x: 16, y: 12, dir: "left", sprite: "npc_historian", behaviour: "still", script: "mid_sandbach_bell" },
      { id: "npc_sandbach_oldhall_1", x: 4, y: 12, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Night market's Thursday. Stalls in the square, lamps on the crosses, and everybody out till ten.",
          "Bring your team. Last Thursday something came out of the fog and it was not a stallholder."] }
    ],
    signs: [{ x: 11, y: 2, text: ["A framed inventory of the inn's stock, 1698.",
      "Item: ale. Item: beds, six. Item: one large bell, kept for the parish, NOT FOR SALE, underlined three times."] }],
    items: [{ x: 20, y: 15, item: "elixir", n: 2, hidden: true, flag: "item_sandbach_oldhall_1" }],
    encounters: { grass: null }
  }));
})();
