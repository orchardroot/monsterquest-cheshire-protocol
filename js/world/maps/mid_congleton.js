// =============================================================
// MonsterQuest v2 — CONGLETON (region dane, Ch.4, Gym 3 BEAR)
// Beartown: the Dane at the bottom of it, the Cloud above it, a market
// hall with opinions, and a town that once sold its Bible to buy a bear
// and has never been allowed to forget it. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LEG = M.town({ "&": "bear_statue" });
  const DL = { region: "dane", dialogue: "town_congleton", music: "town_congleton", owner: "mid" };
  function inn(id, tpl, over) { return W.defineMap(id, W.builtin(tpl, MQ.U.merge(DL, over))); }

  const c = M.canvas(50, 40, ",");
  c.fill("g", 0, 0, 50, 2, "T");
  for (let x = 0; x < 50; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 37, "T"); c.fill("g", 49, 2, 1, 37, "T");
  c.fill("g", 0, 39, 50, 1, "T");
  c.fill("g", 14, 0, 3, 2, "="); c.fill("o", 14, 0, 3, 1, " ");
  c.fill("g", 49, 14, 1, 2, "=");
  c.fill("g", 0, 20, 1, 3, "=");
  c.fill("g", 30, 39, 3, 1, "=");

  // ---- north approach, the Havannah mill on the river bend --------------
  c.fill("g", 1, 2, 48, 6, ".");
  c.fill("g", 14, 2, 3, 6, "=");
  B.trees(c, "cn-north", 20, 2, 2, 46, 5, "T", "y", ["."]);
  c.fill("g", 3, 3, 8, 4, "\""); c.fill("g", 27, 3, 6, 4, "\"");
  B.house(c, { x: 35, y: 2, w: 12, h: 5, rh: 1, wall: "V", win: "v", door: "D", doorX: 5, over: "^" });
  c.set("g", 36, 2, "M"); c.set("g", 45, 2, "M");
  c.set("g", 34, 6, "N");
  c.fill("g", 1, 8, 48, 1, ",");

  // ---- the town hall block ------------------------------------------------
  B.house(c, { x: 4, y: 9, w: 10, h: 4, rh: 1, door: "S", doorX: 4, over: "^" });     // bakery
  B.house(c, { x: 18, y: 8, w: 13, h: 5, rh: 2, wall: "X", door: "D", doorX: 6, over: "^" }); // town hall
  c.set("g", 19, 8, "p"); c.set("g", 29, 8, "p");
  B.house(c, { x: 34, y: 9, w: 10, h: 4, rh: 1, door: "S", doorX: 4, over: "^" });    // mart
  c.fill("g", 1, 13, 48, 1, "-");
  c.fill("g", 1, 14, 48, 2, "=");
  c.fill("g", 1, 16, 48, 1, "-");
  const lampsA = [2, 10, 16, 32, 40, 47];
  for (let i = 0; i < lampsA.length; i++) { c.set("g", lampsA[i], 13, "L"); c.set("g", lampsA[i], 16, "L"); }
  c.set("g", 15, 13, "n"); c.set("g", 45, 16, "O"); c.set("g", 6, 16, "j");
  c.set("g", 21, 16, "H"); c.set("g", 22, 16, "I"); c.set("g", 36, 13, "u");

  // ---- the south terrace ---------------------------------------------------
  B.house(c, { x: 4, y: 17, w: 11, h: 3, rh: 1, door: "S", doorX: 5, over: "^" });    // care
  B.house(c, { x: 18, y: 17, w: 10, h: 3, rh: 1, wall: "E", win: "J", doorX: 4, over: "^" }); // inn
  B.house(c, { x: 31, y: 17, w: 10, h: 3, rh: 1, doorX: 4, over: "^" });              // house 1
  c.fill("g", 1, 20, 48, 1, "-");
  c.fill("g", 1, 20, 3, 3, "=");

  // ---- the market square, the bear pit, the station -----------------------
  c.fill("g", 1, 21, 48, 7, ",");
  c.fill("g", 16, 21, 19, 7, "=");
  c.set("g", 20, 23, "&"); c.set("g", 30, 23, "&"); c.set("g", 25, 26, "&");
  c.set("g", 22, 25, "/"); c.set("g", 28, 25, "i");
  for (let i = 0; i < 3; i++) { c.fill("g", 18 + i * 6, 21, 3, 1, "A"); c.fill("o", 18 + i * 6, 20, 3, 1, "a"); }
  c.set("g", 17, 27, "H"); c.set("g", 33, 27, "H");
  c.set("g", 15, 24, "N");
  B.house(c, { x: 4, y: 22, w: 11, h: 6, rh: 2, wall: "X", win: "W", door: "@", doorX: 5, over: "^" });
  c.set("g", 3, 26, "P");
  B.house(c, { x: 38, y: 22, w: 10, h: 5, rh: 1, door: "S", doorX: 4, over: "^" });
  c.set("g", 37, 25, "P");
  c.fill("g", 1, 28, 48, 1, "=");

  // ---- the green, and the Dane ------------------------------------------
  c.fill("g", 1, 29, 48, 3, ".");
  B.trees(c, "cn-green", 16, 2, 29, 46, 3, "B", "b", ["."]);
  c.fill("g", 6, 29, 6, 2, "\""); c.fill("g", 40, 29, 7, 2, "\"");
  c.set("g", 20, 30, "8"); c.set("g", 34, 30, "9");
  c.fill("g", 1, 32, 48, 1, "e");
  c.fill("g", 1, 33, 48, 2, "!");
  c.fill("g", 1, 35, 48, 1, "e");
  c.fill("g", 24, 32, 3, 4, "x");
  c.fill("g", 24, 29, 3, 3, "=");
  c.set("g", 12, 33, "Q"); c.set("g", 41, 34, "Q");
  c.fill("g", 1, 36, 48, 3, ".");
  B.trees(c, "cn-south", 16, 2, 36, 46, 3, "T", "y", ["."]);
  c.fill("g", 24, 36, 3, 2, "=");
  c.fill("g", 24, 38, 9, 1, "=");
  c.fill("g", 30, 36, 3, 3, "=");
  c.fill("g", 6, 36, 8, 2, "\"");
  c.set("g", 22, 37, "N");

  W.defineMap("congleton", MQ.U.merge(DL, {
    name: "Congleton", outdoor: true, weatherZone: "dane", ambience: "town",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 15, y: 8 },
    healPoint: { x: 9, y: 15 },
    landmark: { name: "Congleton", x: 25, y: 24 },
    encounters: { grass: "congleton_grass", water: null },
    fishing: "fish_route_holmes_congleton",
    warps: [
      { x: 8, y: 12, to: "congleton_bakery", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 24, y: 12, to: "congleton_town_hall", tx: 12, ty: 17, dir: "up", kind: "door" },
      { x: 38, y: 12, to: "congleton_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 9, y: 19, to: "congleton_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 22, y: 19, to: "congleton_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 35, y: 19, to: "congleton_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 9, y: 27, to: "congleton_gym", tx: 15, ty: 26, dir: "up", kind: "door" },
      { x: 42, y: 26, to: "congleton_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 14, y: 0, to: "route_holmes_congleton", tx: 14, ty: 46, dir: "up", kind: "edge" },
      { x: 15, y: 0, to: "route_holmes_congleton", tx: 15, ty: 46, dir: "up", kind: "edge" },
      { x: 16, y: 0, to: "route_holmes_congleton", tx: 16, ty: 46, dir: "up", kind: "edge" },
      { x: 49, y: 14, to: "bosley_cloud", tx: 1, ty: 30, dir: "right", kind: "edge" },
      { x: 49, y: 15, to: "bosley_cloud", tx: 1, ty: 31, dir: "right", kind: "edge" },
      { x: 0, y: 20, to: "route_congleton_sandbach", tx: 62, ty: 15, dir: "left", kind: "edge" },
      { x: 0, y: 21, to: "route_congleton_sandbach", tx: 62, ty: 16, dir: "left", kind: "edge" },
      { x: 0, y: 22, to: "route_congleton_sandbach", tx: 62, ty: 17, dir: "left", kind: "edge" },
      { x: 30, y: 39, to: "route_congleton_moreton", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 31, y: 39, to: "route_congleton_moreton", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 32, y: 39, to: "route_congleton_moreton", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 15, y: 24, text: ["CONGLETON. BEARTOWN.",
        "In 1621 the town's bear died shortly before the wakes. The corporation had money set aside to buy a new Bible.",
        "They bought a bear. The Bible could wait; the wakes could not. Every single person here will tell you this."] },
      { x: 34, y: 6, text: ["HAVANNAH MILL — silk, then fustian, then nothing, then flats.",
        "The wheel-pit is still under the car park and the river still runs through it."] },
      { x: 3, y: 26, text: ["CONGLETON GYM — BEARWARD OTIS. BEAR.",
        "HOUSE RULE: THE FIRST PHASE IS TWO ON ONE.",
        "It is a bear and a man who loves it. Nobody has ever talked either of them out of it."] },
      { x: 37, y: 25, text: ["CONGLETON STATION — half a mile out of town, up a hill, as is traditional."] },
      { x: 15, y: 13, text: ["TOWN NOTICES.",
        "Bridestones open day. Mere warden's bird count. Lampposts: PLEASE STOP PUTTING THE WI-FI PASSWORD ON THE LAMPPOSTS.",
        "Somebody has put the Wi-Fi password on the notice, with a QR code, and drawn a smiling face."] },
      { x: 22, y: 37, text: ["BIDDULPH VALLEY WAY — 6 miles to Mow Cop, past the crooked house.",
        "THE OLD RAILWAY PATH IS NOT LIT. Under it: 'it is haunted by a man on a bike and he is faster than you'"] }
    ],
    items: [
      { x: 5, y: 4, item: "capsule_kernel", n: 4, flag: "item_congleton_1" },
      { x: 47, y: 37, item: "elixir", n: 2, hidden: true, flag: "item_congleton_2" },
      { x: 2, y: 30, item: "tonic", n: 3, flag: "item_congleton_3" },
      { x: 46, y: 4, item: "hide_plate", n: 1, hidden: true, flag: "item_congleton_4" },
      { x: 8, y: 37, item: "capsule_heavy", n: 2, hidden: true, flag: "item_congleton_5" },
      { x: 32, y: 6, item: "collectible_11", n: 1, hidden: true, flag: "item_congleton_6" }
    ],
    catGaps: [
      { x: 16, y: 26, item: "cat_token_11", n: 1, flag: "catgap_congleton_1",
        say: "MEADOW goes through the market-hall railings, sits between the paws of the middle bear, and is photographed by nine separate people before she has finished washing." }
    ],
    restPoints: [{ x: 21, y: 30, flag: "meadow_sat_congleton" }],
    npcs: [
      { id: "npc_congleton_otis_pre", x: 11, y: 28, dir: "up", sprite: "otis", behaviour: "still", script: "mid_congleton_otis_pre" },
      { id: "npc_congleton_meg", x: 31, y: 29, dir: "left", sprite: "npc_historian", behaviour: "look", radius: 3, trainer: "tr_congleton_1", sight: 3, script: "mid_congleton_meg" },
      { id: "npc_congleton_kirsty", x: 44, y: 21, dir: "down", sprite: "npc_shadow_it", behaviour: "look", radius: 3, trainer: "tr_congleton_2", sight: 3, script: "mid_congleton_kirsty" },
      { id: "npc_congleton_tam", x: 16, y: 31, dir: "down", sprite: "npc_ranger", behaviour: "look", radius: 3, trainer: "tr_congleton_3", sight: 3 },
      { id: "npc_congleton_token_2", x: 27, y: 31, dir: "down", sprite: "npc_walker", behaviour: "still", script: "mid_congleton_token_2" },
      { id: "npc_congleton_token_3", x: 37, y: 30, dir: "down", sprite: "npc_ranger", behaviour: "still", script: "mid_congleton_token_3" },
      { id: "npc_congleton_poster_1", x: 33, y: 16, dir: "down", sprite: "npc_kid", behaviour: "still", script: "mid_congleton_poster" },
      { id: "npc_congleton_bearward_boy", x: 26, y: 22, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's three bears in the square and one on the Cloud and the one on the Cloud is REAL.",
          "My mum says it's a big dog. It is not a big dog."] },
      { id: "npc_congleton_stall_1", x: 19, y: 22, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Oatcakes. Not the Scottish ones, the Staffordshire ones. We're eight miles from Staffordshire and we do not discuss it."] },
      { id: "npc_congleton_stall_2", x: 31, y: 22, dir: "down", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Bear keyrings, bear mugs, bear tea towels. I have sold four hundred bears and never seen one."] },
      { id: "npc_congleton_walker", x: 40, y: 15, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[40, 15], [12, 15]], pathMode: "pingpong",
        say: ["Cloud's up that road. Six hundred and fifty feet and every one of them uphill, which is not how feet work but it is how the Cloud works."] },
      { id: "npc_congleton_angler", x: 15, y: 31, dir: "down", sprite: "npc_fisher", behaviour: "still",
        say: ["Dane's a good river. Comes off the moor brown and gets browner.",
          "Otters back in it now. First time since my grandad."] },
      { id: "npc_congleton_granny", x: 29, y: 17, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["The lampposts, love. There's a little square picture on every lamppost from here to the station.",
          "My neighbour pointed his phone at one and now his bank rings him twice a day."] }
    ],
    triggers: [
      { x: 14, y: 6, w: 3, h: 1, script: "mid_congleton_arrival", once: "congleton_arrival", cond: "!congleton_arrival" }
    ]
  }));

  // ------------------------------------------------------------ interiors --
  inn("congleton_care", "care_centre", {
    name: "Congleton Care Centre",
    warps: [
      { x: 7, y: 11, to: "congleton", tx: 9, ty: 20, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "congleton", tx: 9, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_congleton_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Straight through. We get a lot of Ground types off the gym floor and they all look worse than they are."] },
      { id: "npc_congleton_care_1", x: 11, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Otis brings the cub in for its claws. Sits in that chair. Tells the whole waiting room about the Bible.",
          "Every time. And every time somebody hasn't heard it, and that's the bit he lives for."] }
    ]
  });
  inn("congleton_mart", "shop", {
    name: "Congleton Mart", shop: "shop_congleton",
    warps: [
      { x: 6, y: 9, to: "congleton", tx: 38, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "congleton", tx: 38, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_congleton_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_congleton",
      say: ["Heavy capsules on the end. You'll want them for anything that comes off the Cloud."] }],
    items: [{ x: 12, y: 2, item: "capsule_heavy", n: 3, flag: "item_congleton_mart_1" }]
  });
  inn("congleton_bakery", "shop", {
    name: "Beartown Bakehouse", shop: "shop_congleton_bakery",
    warps: [
      { x: 6, y: 9, to: "congleton", tx: 8, ty: 13, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "congleton", tx: 8, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_congleton_baker", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_congleton_bakery",
        say: ["Bear claws. They're just pastries. We are not a subtle town."] },
      { id: "npc_congleton_token_1", x: 11, y: 3, dir: "left", sprite: "npc_kid", behaviour: "still", script: "mid_congleton_token_1" }
    ],
    items: [{ x: 12, y: 2, item: "brew_hedgerow_cordial", n: 2, flag: "item_congleton_bakery_1" }]
  });
  inn("congleton_inn", "pub", {
    name: "The Bear's Head",
    warps: [
      { x: 6, y: 11, to: "congleton", tx: 22, ty: 20, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "congleton", tx: 22, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_congleton_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Rooms out the back, over the yard. If you hear something big moving about at two, it's the bins.",
          "It's usually the bins."] },
      { id: "npc_congleton_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Bridestones. Neolithic. Four thousand years old and half of it went into a road in 1764.",
          "Lately they hum in fog. Not the wind — a hum with a pattern in it, like somebody typing very slowly."] },
      { id: "npc_congleton_pub_2", x: 10, y: 8, dir: "up", sprite: "npc_ranger", behaviour: "still",
        say: ["The bear's up on the Cloud. I've seen it twice. Big, brown, in no hurry, and it looked at me like a landlord."] }
    ]
  });
  inn("congleton_house_1", "house_small", {
    name: "Mill Street House",
    warps: [
      { x: 5, y: 9, to: "congleton", tx: 35, ty: 20, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "congleton", tx: 35, ty: 20, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_congleton_h1", x: 6, y: 3, dir: "down", sprite: "npc_dev", behaviour: "still",
      say: ["We've a smart doorbell and it says there's somebody at the door forty times a night.",
        "There is never anybody at the door. Well. There's something at the door."] }]
  });
  inn("congleton_station", "station", {
    name: "Congleton Station", station: { name: "Congleton" },
    warps: [
      { x: 8, y: 11, to: "congleton", tx: 42, ty: 27, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "congleton", tx: 42, ty: 27, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_congleton_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
      say: ["Manchester to Stoke. Half the platform's in Cheshire and I have been told the other half is a matter of interpretation."] }],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES. A sticker on the corner of the screen: JODRELL BANK — BUS SERVICE SUSPENDED."] }]
  });

  // ---- the town hall ------------------------------------------------------
  const th = M.room(26, 19, { floor: ",", wall: "7", top: "^" });
  th.fill("g", 2, 3, 22, 1, "e"); th.fill("g", 2, 6, 22, 1, "e");
  th.fill("g", 10, 9, 6, 1, "t"); th.fill("g", 10, 10, 6, 1, "h");
  th.fill("g", 2, 13, 5, 1, "C"); th.set("g", 7, 13, "K");
  th.fill("g", 19, 13, 5, 1, "i");
  th.set("g", 12, 2, "\\"); th.set("g", 24, 9, "l");
  W.defineMap("congleton_town_hall", MQ.U.merge(DL, {
    name: "Congleton Town Hall", outdoor: false, ambience: "town",
    legend: M.interior(), layers: th.layers(),
    spawnPoint: { x: 12, y: 17 },
    warps: [
      { x: 12, y: 18, to: "congleton", tx: 24, ty: 13, dir: "down", kind: "door" },
      { x: 13, y: 18, to: "congleton", tx: 24, ty: 13, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_congleton_clerk_hall", x: 4, y: 14, dir: "up", sprite: "npc_historian", behaviour: "still", script: "mid_congleton_clerk" },
      { id: "npc_congleton_mere_warden", x: 20, y: 10, dir: "left", sprite: "npc_ranger", behaviour: "still",
        say: ["Astbury Mere was a sand quarry until 1980. Now it's a nature reserve and the birds have not been told.",
          "Every year they come back looking for a hole."] }
    ],
    signs: [
      { x: 12, y: 2, text: ["THE CORPORATION MINUTE BOOK, 1621, open under glass.",
        "'Item: for a beare, xvj s. Item: for the Bible, deferred.'",
        "A modern card beside it: 'The Bible was bought in 1622. Nobody ever mentions that bit.'"] },
      { x: 21, y: 13, text: ["A portrait of a bearward and his bear, both looking directly at the painter, both unimpressed."] }
    ],
    items: [{ x: 24, y: 16, item: "collectible_11", n: 1, hidden: true, flag: "item_congleton_hall_1" }],
    encounters: { grass: null }
  }));

  // ---- GYM 3: the bear pit ------------------------------------------------
  const gy = M.canvas(32, 28, "F");
  gy.box("g", 0, 0, 32, 28, "#");
  gy.fill("g", 1, 0, 30, 1, "^");
  gy.fill("g", 1, 1, 30, 1, "#");
  gy.fill("g", 5, 1, 4, 1, "W"); gy.fill("g", 23, 1, 4, 1, "W");
  // the pit: a sunken ring of packed earth with a rail round it
  gy.box("g", 5, 5, 22, 16, "|");
  gy.fill("g", 6, 6, 20, 14, "c");
  gy.fill("g", 14, 5, 4, 1, "c");
  gy.fill("g", 14, 20, 4, 1, "c");
  gy.fill("g", 10, 10, 3, 1, "N"); gy.fill("g", 19, 10, 3, 1, "N");
  gy.fill("g", 3, 3, 4, 1, "z"); gy.fill("g", 25, 3, 4, 1, "y");
  gy.fill("g", 2, 23, 5, 1, "e"); gy.fill("g", 25, 23, 5, 1, "e");
  gy.set("g", 15, 27, "D"); gy.set("g", 16, 27, "D");
  gy.fill("g", 15, 25, 2, 2, "M");
  gy.set("g", 15, 2, "$"); gy.set("g", 16, 2, "$");
  gy.fill("g", 14, 3, 4, 1, "F");
  gy.set("g", 8, 24, "\\"); gy.set("g", 2, 5, "\\");
  W.defineMap("congleton_gym", MQ.U.merge(DL, {
    name: "Congleton Gym — the Bear Pit", outdoor: false, ambience: "town",
    legend: M.interior(), layers: gy.layers(),
    spawnPoint: { x: 15, y: 26 },
    landmark: { name: "Congleton Gym", x: 16, y: 13 },
    warps: [
      { x: 15, y: 27, to: "congleton", tx: 9, ty: 28, dir: "down", kind: "door" },
      { x: 16, y: 27, to: "congleton", tx: 9, ty: 28, dir: "down", kind: "door" },
      { x: 15, y: 2, to: "congleton_gym_floor", tx: 11, ty: 20, dir: "up", kind: "door", cond: "gym3_open" },
      { x: 16, y: 2, to: "congleton_gym_floor", tx: 12, ty: 20, dir: "up", kind: "door", cond: "gym3_open" }
    ],
    signs: [
      { x: 8, y: 24, text: ["CONGLETON GYM — BEARWARD OTIS. BEAR.",
        "HOUSE RULE: THE FIRST PHASE IS TWO ON ONE.",
        "THE BEAR DOES NOT FIGHT ALONE AND HAS NEVER BEEN ASKED TO. NEITHER HAVE YOU — BRING FOUR.",
        "Under it, in a much older hand burnt into the beam: 'a bearward keeps the bear. that is the whole of the job.'"] },
      { x: 2, y: 5, text: ["The arm-wrestling bar. A brass pointer, a spring, and four hundred years of grip strength.",
        "Time it on the UP-beat. Everybody times it on the down-beat and everybody loses."] },
      { x: 11, y: 10, text: ["A bear, in stone, worn smooth at the nose by three centuries of hands."] }
    ],
    items: [
      { x: 30, y: 25, item: "elixir", n: 2, hidden: true, flag: "item_congleton_gym_1" },
      { x: 1, y: 26, item: "capsule_heavy", n: 2, hidden: true, flag: "item_congleton_gym_2" }
    ],
    npcs: [
      { id: "npc_gym3_sion", x: 10, y: 8, dir: "down", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_congleton_gym_1", sight: 3 },
      { id: "npc_gym3_enid", x: 21, y: 15, dir: "left", sprite: "npc_farmer", behaviour: "look", radius: 3, trainer: "tr_congleton_gym_2", sight: 3, script: "mid_gym3_enid" },
      { id: "npc_gym3_alun", x: 10, y: 17, dir: "up", sprite: "npc_kid", behaviour: "look", radius: 3, trainer: "tr_congleton_gym_3", sight: 3 },
      { id: "npc_gym3_bar", x: 8, y: 23, dir: "up", sprite: "npc_walker", behaviour: "still", script: "mid_gym3_bar" },
      { id: "npc_gym3_memo", x: 27, y: 23, dir: "up", sprite: "npc_walker", behaviour: "still", script: "mid_gym3_memo" }
    ],
    triggers: [
      { x: 14, y: 3, w: 4, h: 1, script: "mid_gym3_backdoor", cond: "!gym3_open" }
    ],
    encounters: { grass: null }
  }));

  const gf = M.canvas(24, 22, "c");
  gf.box("g", 0, 0, 24, 22, "#");
  gf.fill("g", 1, 0, 22, 1, "^");
  gf.fill("g", 1, 1, 22, 1, "#");
  gf.fill("g", 6, 1, 3, 1, "W"); gf.fill("g", 15, 1, 3, 1, "W");
  gf.fill("g", 5, 4, 14, 13, "F");
  gf.set("g", 11, 3, "G"); gf.set("g", 12, 3, "G");
  gf.fill("g", 2, 8, 2, 1, "N"); gf.fill("g", 20, 8, 2, 1, "N");
  gf.set("g", 2, 19, "z"); gf.set("g", 21, 19, "y");
  gf.set("g", 11, 21, "D"); gf.set("g", 12, 21, "D");
  gf.fill("g", 11, 19, 2, 2, "M");
  W.defineMap("congleton_gym_floor", MQ.U.merge(DL, {
    name: "Congleton Gym", outdoor: false, ambience: "town",
    legend: M.interior(), layers: gf.layers(),
    spawnPoint: { x: 11, y: 20 },
    warps: [
      { x: 11, y: 21, to: "congleton_gym", tx: 15, ty: 3, dir: "down", kind: "door" },
      { x: 12, y: 21, to: "congleton_gym", tx: 16, ty: 3, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_congleton_otis", x: 11, y: 5, dir: "down", sprite: "otis", behaviour: "still", script: "mid_gym3_otis" }
    ],
    signs: [
      { x: 11, y: 3, text: ["THE BEAR BADGE STAND. Worn wood, a brass plate, and a very deep scratch across the corner that nobody has ever sanded out."] }
    ],
    encounters: { grass: null }
  }));
})();
