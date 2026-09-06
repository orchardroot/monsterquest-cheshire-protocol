// =============================================================
// MonsterQuest v2 — KNUTSFORD (region bollin, Ch.3, Gym 2 CIPHER)
// Georgian brick and white sash on two levels: King Street below,
// Princess Street above, the Gaskell Memorial Tower and King's Coffee
// House in Italianate cream, the Heath, the Penny Farthing Museum, and
// the Tatton gates at the top of the drive. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const M = MQ.MidBuild;

  const LEG = M.town();
  const DL = { region: "bollin", dialogue: "town_knutsford", music: "town_knutsford", owner: "mid" };
  function inn(id, tpl, over) { return W.defineMap(id, W.builtin(tpl, MQ.U.merge(DL, over))); }

  // ------------------------------------------------------------ the town --
  const c = M.canvas(54, 42, ",");

  // treeline frame with three gaps: Tatton gates north, the heath lane west,
  // and the Goostrey road south
  c.fill("g", 0, 0, 54, 2, "T");
  for (let x = 0; x < 54; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 2, 1, 38, "T"); c.fill("g", 53, 2, 1, 38, "T");
  c.fill("g", 0, 40, 54, 2, "T");
  c.fill("g", 24, 0, 4, 2, "="); c.fill("o", 24, 0, 4, 1, " ");
  c.fill("g", 0, 22, 1, 2, "=");
  c.fill("g", 30, 40, 3, 2, "=");

  // ---- the Heath: common land, gorse, and a great deal of parked car -----
  c.fill("g", 2, 2, 20, 9, ".");
  c.fill("g", 2, 9, 22, 1, "=");
  B.trees(c, "kn-heath", 16, 2, 2, 20, 7, "B", "b", ["."]);
  c.fill("g", 4, 3, 6, 3, "\""); c.fill("g", 14, 4, 6, 4, "\"");
  c.set("g", 3, 7, "l"); c.set("g", 11, 3, "o"); c.set("g", 19, 8, "'");
  c.set("g", 12, 9, "n"); c.set("g", 6, 8, "H"); c.set("g", 17, 9, "H");
  c.set("g", 8, 6, "z");
  c.fill("g", 2, 10, 22, 1, ",");

  // ---- the Tatton drive and its gates ------------------------------------
  c.fill("g", 24, 2, 4, 9, "=");
  c.set("g", 23, 3, "F"); c.set("g", 28, 3, "F");
  c.set("g", 23, 2, "F"); c.set("g", 28, 2, "F");
  c.set("g", 23, 4, "P");
  c.fill("g", 23, 5, 1, 6, ","); c.fill("g", 28, 4, 1, 7, ",");

  // ---- the upper gardens, and two of the town's quieter addresses --------
  c.fill("g", 29, 2, 24, 9, ".");
  B.trees(c, "kn-gardens", 9, 29, 2, 24, 3, "T", "y", ["."]);
  B.house(c, { x: 31, y: 3, w: 9, h: 4, rh: 1, doorX: 4, over: "^" });
  B.house(c, { x: 43, y: 3, w: 9, h: 4, rh: 1, doorX: 4, over: "^" });
  c.fill("g", 29, 8, 24, 1, "=");
  c.fill("g", 35, 7, 1, 1, "="); c.fill("g", 47, 7, 1, 1, "=");
  c.set("g", 30, 9, "*"); c.set("g", 51, 9, "*");
  c.fill("g", 29, 9, 24, 2, ",");

  // ---- Princess Street: the north terrace --------------------------------
  B.house(c, { x: 3, y: 11, w: 10, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });   // Care
  B.house(c, { x: 15, y: 11, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });   // Mart
  B.house(c, { x: 27, y: 10, w: 12, h: 4, rh: 2, wall: "U", door: "D", doorX: 5, over: "^" }); // the Gym: Gaskell's library
  c.set("g", 28, 10, "m"); c.set("g", 37, 10, "m");
  B.house(c, { x: 42, y: 11, w: 9, h: 3, rh: 1, door: "S", doorX: 4, over: "^" });   // Bookshop
  c.fill("g", 2, 14, 51, 1, "-");
  c.fill("g", 2, 15, 51, 2, "=");
  c.fill("g", 2, 17, 51, 1, "-");
  for (let x = 4; x < 52; x += 8) { c.set("g", x, 14, "L"); c.set("g", x + 4, 17, "L"); }
  c.set("g", 25, 14, "N"); c.set("g", 40, 14, "j"); c.set("g", 13, 17, "O");
  c.set("g", 21, 17, "H"); c.set("g", 22, 17, "I"); c.set("g", 46, 17, "u");

  // ---- the middle terrace: inn, museum, assembly rooms, a private house --
  B.house(c, { x: 3, y: 18, w: 9, h: 3, rh: 1, doorX: 4, over: "^" });               // Inn
  B.house(c, { x: 14, y: 18, w: 10, h: 3, rh: 1, wall: "U", doorX: 4, over: "^" });  // Penny Farthing Museum
  B.house(c, { x: 27, y: 18, w: 10, h: 3, rh: 1, wall: "U", doorX: 4, over: "^" });  // Assembly rooms / quiz
  B.house(c, { x: 40, y: 18, w: 10, h: 3, rh: 1, doorX: 4, over: "^" });             // house 1
  c.fill("g", 2, 21, 51, 1, "-");
  c.set("g", 13, 21, "L"); c.set("g", 26, 21, "L"); c.set("g", 39, 21, "L");

  // ---- King Street: cobbles, sanded on May Day ---------------------------
  c.fill("g", 1, 22, 52, 2, "=");
  c.fill("g", 2, 24, 51, 1, "-");
  c.set("g", 6, 22, "l"); c.set("g", 7, 23, "o"); c.set("g", 8, 22, "'");
  c.set("g", 33, 23, "l"); c.set("g", 34, 22, "o"); c.set("g", 35, 23, "'");
  c.set("g", 19, 24, "H"); c.set("g", 44, 24, "H");
  c.set("g", 3, 24, "N"); c.set("g", 30, 24, "n");

  // ---- the south terrace: Gaskell's tower, the station, a big house ------
  B.house(c, { x: 6, y: 25, w: 13, h: 5, rh: 2, wall: "U", win: "W", doorX: 6, over: "^" });
  c.set("g", 7, 25, "p"); c.set("g", 7, 26, "p"); c.set("g", 8, 25, "p");
  B.house(c, { x: 22, y: 26, w: 11, h: 4, rh: 1, door: "S", doorX: 5, over: "^" });
  B.house(c, { x: 38, y: 25, w: 9, h: 4, rh: 1, doorX: 4, over: "^" });
  c.fill("g", 2, 30, 51, 2, "=");
  c.fill("g", 19, 25, 3, 5, ","); c.fill("g", 33, 26, 5, 4, ","); c.fill("g", 47, 25, 6, 5, ",");
  c.fill("g", 2, 25, 4, 5, ",");
  c.set("g", 5, 28, "N"); c.set("g", 21, 28, "P");

  // ---- the Moor: a long pond, ducks, and the sand-pattern lawn -----------
  c.fill("g", 2, 32, 51, 8, ".");
  M.lake(c, 5, 33, 15, 5, "$", "e");
  c.set("g", 4, 35, "Q"); c.set("g", 21, 36, "Q");
  c.fill("g", 3, 39, 49, 1, "=");
  c.set("g", 24, 34, "9"); c.set("g", 27, 34, "8");
  c.set("g", 30, 36, "H"); c.set("g", 36, 36, "H");
  B.trees(c, "kn-moor", 14, 22, 32, 30, 7, "T", "y", ["."]);
  c.fill("g", 40, 33, 6, 3, "\"");
  c.set("g", 49, 33, "z");
  c.fill("g", 30, 39, 3, 1, "=");
  c.set("g", 33, 32, "N");

  W.defineMap("knutsford", MQ.U.merge(DL, {
    name: "Knutsford", outdoor: true, weatherZone: "bollin", ambience: "town",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 3, y: 22 },
    healPoint: { x: 7, y: 15 },
    landmark: { name: "Knutsford", x: 12, y: 24 },
    encounters: { grass: "knutsford_grass", water: null },
    fishing: "fish_route_alderley_knutsford",
    shop: null,
    warps: [
      { x: 7, y: 13, to: "knutsford_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 19, y: 13, to: "knutsford_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 32, y: 13, to: "knutsford_gym", tx: 14, ty: 24, dir: "up", kind: "door" },
      { x: 46, y: 13, to: "knutsford_bookshop", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 7, y: 20, to: "knutsford_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 18, y: 20, to: "knutsford_penny_farthing_museum", tx: 9, ty: 13, dir: "up", kind: "door" },
      { x: 31, y: 20, to: "knutsford_quiz_room", tx: 8, ty: 12, dir: "up", kind: "door" },
      { x: 44, y: 20, to: "knutsford_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 12, y: 29, to: "knutsford_gaskell_tower", tx: 8, ty: 15, dir: "up", kind: "door" },
      { x: 27, y: 29, to: "knutsford_station", tx: 8, ty: 10, dir: "up", kind: "door" },
      { x: 42, y: 28, to: "knutsford_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 35, y: 6, to: "knutsford_house_3", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 47, y: 6, to: "knutsford_house_4", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 24, y: 0, to: "tatton_park", tx: 26, ty: 44, dir: "up", kind: "edge" },
      { x: 25, y: 0, to: "tatton_park", tx: 27, ty: 44, dir: "up", kind: "edge" },
      { x: 26, y: 0, to: "tatton_park", tx: 28, ty: 44, dir: "up", kind: "edge" },
      { x: 27, y: 0, to: "tatton_park", tx: 28, ty: 44, dir: "up", kind: "edge" },
      { x: 0, y: 22, to: "route_alderley_knutsford", tx: 60, ty: 17, dir: "left", kind: "edge" },
      { x: 0, y: 23, to: "route_alderley_knutsford", tx: 60, ty: 18, dir: "left", kind: "edge" },
      { x: 30, y: 41, to: "route_knutsford_holmes", tx: 14, ty: 1, dir: "down", kind: "edge" },
      { x: 31, y: 41, to: "route_knutsford_holmes", tx: 15, ty: 1, dir: "down", kind: "edge" },
      { x: 32, y: 41, to: "route_knutsford_holmes", tx: 16, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 12, y: 9, text: ["KNUTSFORD HEATH — common land.",
        "Grazing rights, cricket, the fair, and — since Tuesday — a man with a folding table and a great many leaflets.",
        "A newer notice, pinned over the byelaws: 'ONE COMMAND. BE CLEAN. TATTON, ALL WEEK.'"] },
      { x: 23, y: 4, text: ["TATTON PARK — pedestrian gate. Please shut it. The deer can read and they cannot be trusted."] },
      { x: 25, y: 14, text: ["PRINCESS STREET / KING STREET.",
        "Two streets, one town, twelve feet of level between them and four hundred years of argument about which is the important one."] },
      { x: 3, y: 24, text: ["KING STREET",
        "On May Day the whole of it is sanded in coloured patterns before six in the morning and walked on by lunchtime.",
        "That is not a waste. That is the point."] },
      { x: 30, y: 24, text: ["NOTICE BOARD",
        "May Day rota. Sedan chair carriers wanted. Penny-farthing rally, Sunday, Tatton course.",
        "A card at the bottom in a beautiful hand: 'Anything you hear, bring it to the Coffee House. I shall know already. Bring it anyway.'"] },
      { x: 5, y: 28, text: ["THE GASKELL MEMORIAL TOWER and KING'S COFFEE HOUSE.",
        "Built by a man who admired a novelist so much he put her whole bibliography on the outside of a building.",
        "Every window has a view of King Street. Every single one."] },
      { x: 21, y: 28, text: ["KNUTSFORD STATION — Manchester, Chester, and a bus replacement service that is spoken of in hushed tones."] },
      { x: 33, y: 32, text: ["THE MOOR — pond, ducks, and a bench with a plaque that just says 'SHE LIKED IT HERE'."] },
      { x: 40, y: 14, text: ["A shop window: PENNY FARTHING MUSEUM — ORDINARY BICYCLES, EXTRAORDINARY PEOPLE.",
        "In the reflection, briefly, a very wide grin on a roof opposite. When you turn round: chimney pots."] }
    ],
    items: [
      { x: 4, y: 3, item: "capsule_mesh", n: 4, flag: "item_knutsford_1" },
      { x: 51, y: 33, item: "cipher_lens", n: 1, hidden: true, flag: "item_knutsford_2" },
      { x: 19, y: 25, item: "tonic", n: 2, flag: "item_knutsford_3" },
      { x: 2, y: 26, item: "elixir", n: 1, hidden: true, flag: "item_knutsford_4" },
      { x: 45, y: 34, item: "blackberry", n: 3, flag: "item_knutsford_5" },
      { x: 49, y: 26, item: "collectible_6", n: 1, hidden: true, flag: "item_knutsford_6" }
    ],
    catGaps: [
      { x: 20, y: 24, item: "cat_token_7", n: 1, flag: "catgap_knutsford_1",
        say: "MEADOW goes under the railings of the assembly rooms, walks the length of the sanded pattern nobody is allowed to walk on, and comes back with a brass bell in her mouth and no remorse whatsoever." }
    ],
    restPoints: [{ x: 22, y: 36, flag: "meadow_sat_knutsford" }],
    npcs: [
      { id: "npc_knutsford_percy", x: 16, y: 21, dir: "down", sprite: "npc_kid", behaviour: "still", script: "mid_knutsford_percy" },
      { id: "npc_knutsford_mair", x: 10, y: 22, dir: "down", sprite: "npc_granny", behaviour: "still", script: "mid_knutsford_mair" },
      { id: "npc_knutsford_tomos", x: 26, y: 22, dir: "down", sprite: "npc_walker", behaviour: "still", script: "mid_knutsford_tomos" },
      { id: "npc_knutsford_wrigley", x: 43, y: 24, dir: "left", sprite: "npc_granny", behaviour: "still", trainer: "tr_knutsford_1", sight: 0,
        script: "mid_knutsford_wrigley" },
      { id: "npc_knutsford_sioned", x: 36, y: 15, dir: "down", sprite: "npc_dev", behaviour: "look", radius: 3, trainer: "tr_knutsford_4", sight: 3 },
      { id: "npc_knutsford_bryn", x: 9, y: 31, dir: "up", sprite: "npc_walker", behaviour: "look", radius: 3, trainer: "tr_knutsford_5", sight: 3 },
      { id: "npc_knutsford_tomi", x: 15, y: 5, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3, trainer: "tr_knutsford_3", sight: 3 },
      { id: "npc_knutsford_preacher", x: 9, y: 6, dir: "down", sprite: "npc_cultist", behaviour: "still", script: "mid_knutsford_preacher" },
      { id: "npc_knutsford_postie", x: 14, y: 17, dir: "up", sprite: "npc_walker", behaviour: "path", path: [[14, 16], [38, 16]], pathMode: "pingpong",
        say: ["Second post. Nobody has a second post any more except this town, and only because Madam asked."] },
      { id: "npc_knutsford_chairman", x: 34, y: 24, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["Sedan chair. Two poles, one box, and a woman inside who criticises your pace the entire way up King Street.",
          "It's an honour. I've done it eleven years. It is definitely an honour."] },
      { id: "npc_knutsford_duckman", x: 22, y: 34, dir: "down", sprite: "npc_fisher", behaviour: "still",
        say: ["Don't feed them bread. Feed them oats. The ducks here know the difference and they will remember you."] },
      { id: "npc_knutsford_novelist", x: 4, y: 32, dir: "right", sprite: "npc_historian", behaviour: "wander", radius: 2,
        say: ["She called it Cranford and everybody in it recognised themselves and nobody ever admitted it.",
          "That's a county-wide talent, that is."] },
      { id: "npc_knutsford_shopper", x: 47, y: 22, dir: "left", sprite: "npc_shopkeep", behaviour: "wander", radius: 3,
        say: ["Georgian frontage, Victorian plumbing, and a broadband cabinet somebody has painted cream so it doesn't spoil the view."] },
      { id: "npc_knutsford_seller", x: 14, y: 9, dir: "down", sprite: "npc_cultist", behaviour: "still", script: "mid_knutsford_seller", cond: "case_08_quiz_passed" },
      { id: "npc_knutsford_gymdoor", x: 32, y: 14, dir: "up", sprite: "npc_historian", behaviour: "still", script: "mid_gym2_door" }
    ],
    triggers: [
      { x: 30, y: 39, w: 3, h: 1, script: "mid_knutsford_arrival", once: "knutsford_arrival", cond: "!knutsford_arrival" },
      { x: 0, y: 22, w: 2, h: 2, script: "mid_knutsford_arrival", once: "knutsford_arrival", cond: "!knutsford_arrival" }
    ]
  }));

  // ------------------------------------------------------------ interiors --
  inn("knutsford_care", "care_centre", {
    name: "Knutsford Care Centre",
    warps: [
      { x: 7, y: 11, to: "knutsford", tx: 7, ty: 14, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "knutsford", tx: 7, ty: 14, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Sit them down and I'll see to them. Have you eaten? Not the cats. You."] },
      { id: "npc_knutsford_care_1", x: 11, y: 5, dir: "left", sprite: "npc_granny", behaviour: "still",
        say: ["Half the town comes in here to be told nothing's wrong and to hear the news.",
          "I don't mind. The news is the medicine, mostly."] }
    ]
  });

  inn("knutsford_mart", "shop", {
    name: "Knutsford Mart", shop: "shop_knutsford",
    warps: [
      { x: 6, y: 9, to: "knutsford", tx: 19, ty: 14, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "knutsford", tx: 19, ty: 14, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_knutsford",
        say: ["Capsules, salves, and a rack of things for Psychic types that I sell four of a year, all in the same week."] }
    ],
    items: [{ x: 12, y: 2, item: "cipher_lens", n: 1, flag: "item_knutsford_mart_1" }]
  });

  inn("knutsford_inn", "pub", {
    name: "The Angel", 
    warps: [
      { x: 6, y: 11, to: "knutsford", tx: 7, ty: 21, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "knutsford", tx: 7, ty: 21, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_landlady", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room's at the top and the stair creaks in E flat. Sleep it off; you'll wake in a different part of the day."] },
      { id: "npc_knutsford_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["Man on the Heath's been handing out leaflets for a fortnight.",
          "The leaflet's one line long. That's what worries me. Nobody's ever needed one line."] },
      { id: "npc_knutsford_pub_2", x: 10, y: 8, dir: "up", sprite: "npc_farmer", behaviour: "still",
        say: ["My sheep face south-west now. All of them. Every morning, like a congregation.",
          "I've stopped mentioning it in here. They laugh, and then they go quiet, and then they buy me a drink."] }
    ]
  });

  inn("knutsford_bookshop", "shop", {
    name: "The Book of Moves", shop: "shop_knutsford_bookshop",
    warps: [
      { x: 6, y: 9, to: "knutsford", tx: 46, ty: 14, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "knutsford", tx: 46, ty: 14, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_bookseller", x: 1, y: 5, dir: "down", sprite: "npc_historian", behaviour: "still", shop: "shop_knutsford_bookshop",
        say: ["Skill Cards. We call them chapters, because a move is a thing somebody wrote down once and everybody has read since."] },
      { id: "npc_knutsford_aled", x: 11, y: 3, dir: "left", sprite: "npc_historian", behaviour: "still", script: "mid_knutsford_aled" }
    ],
    items: [{ x: 12, y: 2, item: "tm_mind_ray", n: 1, flag: "item_knutsford_bookshop_1" }]
  });

  inn("knutsford_house_1", "house_small", {
    name: "King Street Rooms",
    warps: [
      { x: 5, y: 9, to: "knutsford", tx: 44, ty: 21, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "knutsford", tx: 44, ty: 21, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_knutsford_h1", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still",
      say: ["Sixty-one years on King Street. I have watched three shops become one shop and one shop become a coffee place.",
        "The coffee place is fine. I'd not say that outside."] }]
  });
  inn("knutsford_house_2", "house_small", {
    name: "Tatton Street House",
    warps: [
      { x: 5, y: 9, to: "knutsford", tx: 42, ty: 29, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "knutsford", tx: 42, ty: 29, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_knutsford_h2", x: 6, y: 3, dir: "down", sprite: "npc_dev", behaviour: "still",
      say: ["I work from the box room and my window faces the Heath.",
        "Last Thursday every bird on it took off at the same second and came back at the same second. I have the video. Nobody wants the video."] }]
  });
  inn("knutsford_house_3", "house_small", {
    name: "Legh Road House",
    warps: [
      { x: 5, y: 9, to: "knutsford", tx: 35, ty: 7, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "knutsford", tx: 35, ty: 7, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_knutsford_h3", x: 6, y: 3, dir: "down", sprite: "npc_walker", behaviour: "still",
      say: ["Legh Road. Every house a different fantasy of somewhere else. Byzantine, Italian, one that's simply confused.",
        "The man who built them never explained. I respect that enormously."] }]
  });
  inn("knutsford_house_4", "house_small", {
    name: "Heath Cottage",
    warps: [
      { x: 5, y: 9, to: "knutsford", tx: 47, ty: 7, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "knutsford", tx: 47, ty: 7, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "npc_knutsford_h4", x: 6, y: 3, dir: "down", sprite: "npc_kid", behaviour: "still",
      say: ["Mum says don't take the leaflet. Dad took the leaflet. Mum's still cross about the leaflet."] }]
  });

  inn("knutsford_station", "station", {
    name: "Knutsford Station", station: { name: "Knutsford" }, music: "town_knutsford",
    warps: [
      { x: 8, y: 11, to: "knutsford", tx: 27, ty: 30, dir: "down", kind: "door" },
      { x: 9, y: 11, to: "knutsford", tx: 27, ty: 30, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["Mid-Cheshire line. Two an hour if the wind's right and the wind is never right.",
          "Railcard? Not signed. Crewe signs those and Crewe is being difficult this month."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "Every board in this county has flickered and reset at the same second, twice a day, for a fortnight.",
      "Somebody has written the times on a bit of card and blu-tacked it under the screen. The card is right."] }]
  });

  // ---- the Penny Farthing Museum ------------------------------------------
  const pf = M.room(20, 15, { floor: "." });
  pf.fill("g", 2, 3, 16, 1, "*"); pf.fill("g", 2, 7, 16, 1, "*");
  pf.fill("g", 3, 5, 3, 1, "i"); pf.fill("g", 14, 5, 3, 1, "i");
  pf.fill("g", 2, 10, 4, 1, "C"); pf.set("g", 6, 10, "K");
  pf.set("g", 16, 10, "s"); pf.set("g", 17, 10, "s");
  W.defineMap("knutsford_penny_farthing_museum", MQ.U.merge(DL, {
    name: "Penny Farthing Museum", outdoor: false, ambience: "town",
    legend: M.interior(), layers: pf.layers(),
    spawnPoint: { x: 9, y: 13 },
    warps: [
      { x: 9, y: 14, to: "knutsford", tx: 18, ty: 21, dir: "down", kind: "door" },
      { x: 10, y: 14, to: "knutsford", tx: 18, ty: 21, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_tomos_rally", x: 4, y: 11, dir: "right", sprite: "npc_cyclist", behaviour: "still", script: "mid_knutsford_rally" },
      { id: "npc_knutsford_curator_pf", x: 15, y: 6, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["'Ordinary' is the correct name. The little safety bicycle is the odd one, historically speaking.",
          "You sit above the wheel and you cannot stop and you cannot get off. People did this for fun for twenty years."] }
    ],
    signs: [
      { x: 4, y: 5, text: ["THE ORDINARY, 1878.", "Fifty-four inch wheel. No brake worth the name. One gear, which is the leg."] },
      { x: 15, y: 5, text: ["A photograph: sixty riders on King Street, 1888, all in the same hat.",
        "Beside it a modern photograph of the same street, sixty riders, the same hat. The gap is a hundred and thirty years and nobody has mentioned it."] }
    ],
    items: [{ x: 18, y: 2, item: "collectible_7", n: 1, hidden: true, flag: "item_knutsford_pf_1" }],
    encounters: { grass: null }
  }));

  // ---- the assembly rooms: the Knutsford Quiz -----------------------------
  const qz = M.room(18, 14, { floor: "c" });
  qz.fill("g", 3, 3, 12, 1, "t"); qz.fill("g", 3, 4, 12, 1, "h");
  qz.fill("g", 3, 7, 12, 1, "t"); qz.fill("g", 3, 8, 12, 1, "h");
  qz.set("g", 8, 2, "*"); qz.set("g", 1, 2, "l");
  qz.fill("g", 2, 10, 3, 1, "e"); qz.fill("g", 13, 10, 3, 1, "e");
  W.defineMap("knutsford_quiz_room", MQ.U.merge(DL, {
    name: "The Assembly Rooms", outdoor: false, ambience: "town",
    legend: M.interior(), layers: qz.layers(),
    spawnPoint: { x: 8, y: 12 },
    warps: [
      { x: 8, y: 13, to: "knutsford", tx: 31, ty: 21, dir: "down", kind: "door" },
      { x: 9, y: 13, to: "knutsford", tx: 31, ty: 21, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_quizmaster", x: 8, y: 6, dir: "down", sprite: "npc_granny", behaviour: "still", script: "mid_knutsford_quiz" },
      { id: "npc_knutsford_quiz_1", x: 4, y: 6, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Five rounds, no phones, and if you argue with the answer she reads out the source.",
          "She always has the source. She has been waiting years for somebody to argue."] }
    ],
    signs: [{ x: 8, y: 2, text: ["THE KNUTSFORD QUIZ — Wednesdays, and any time Madam feels like it.",
      "ROUND FOUR IS ALWAYS ABOUT THIS TOWN. ROUND FIVE IS ALWAYS ABOUT YOU."] }],
    encounters: { grass: null }
  }));

  // ---- the Gaskell Memorial Tower & King's Coffee House --------------------
  const gt = M.room(18, 17, { floor: "%" });
  gt.fill("g", 2, 3, 5, 1, "T"); gt.fill("g", 2, 4, 5, 1, "o");
  gt.fill("g", 11, 3, 5, 1, "T"); gt.fill("g", 11, 4, 5, 1, "o");
  gt.fill("g", 2, 7, 5, 1, "T"); gt.fill("g", 2, 8, 5, 1, "o");
  gt.fill("g", 11, 7, 5, 1, "T"); gt.fill("g", 11, 8, 5, 1, "o");
  gt.fill("g", 1, 11, 5, 1, "C"); gt.set("g", 6, 11, "K");
  gt.set("g", 16, 2, "a"); gt.set("g", 16, 11, "S"); gt.set("g", 16, 12, "S");
  gt.fill("g", 8, 12, 2, 1, "i");
  W.defineMap("knutsford_gaskell_tower", MQ.U.merge(DL, {
    name: "King's Coffee House", outdoor: false, ambience: "town",
    legend: M.interior(), layers: gt.layers(),
    spawnPoint: { x: 8, y: 15 },
    warps: [
      { x: 8, y: 16, to: "knutsford", tx: 12, ty: 30, dir: "down", kind: "door" },
      { x: 9, y: 16, to: "knutsford", tx: 12, ty: 30, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_gaskell_tower", x: 8, y: 10, dir: "down", sprite: "gaskell", behaviour: "still", script: "mid_gaskell_tower" },
      { id: "npc_knutsford_waiter", x: 3, y: 12, dir: "right", sprite: "npc_shopkeep", behaviour: "still",
        say: ["Coffee, and the county. Madam takes both black.",
          "She sits by the window because the window is the network."] },
      { id: "npc_knutsford_letter", x: 14, y: 8, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["My letter came open. Steamed, resealed, badly. I complained.",
          "She said: 'Yes. It arrived faster, didn't it.' And it had."] }
    ],
    signs: [
      { x: 8, y: 12, text: ["A framed list running the height of the wall: every title, every date, every edition.",
        "At the bottom, in smaller letters: 'AND EVERYTHING SHE HEARD AND DIDN'T WRITE DOWN.'"] },
      { x: 16, y: 2, text: ["The tower stair. A rope across it, and a card: NOT OPEN TO THE PUBLIC.",
        "Above, faintly, the hum of something with an aerial on it."] }
    ],
    items: [{ x: 16, y: 14, item: "collectible_6", n: 1, hidden: true, flag: "item_gaskell_tower_1" }],
    encounters: { grass: null }
  }));

  // ---- GYM 2: the library of moving stacks --------------------------------
  const gy = M.canvas(30, 26, "_");
  gy.box("g", 0, 0, 30, 26, "#");
  gy.fill("g", 1, 0, 28, 1, "^");
  gy.fill("g", 1, 1, 28, 1, "#");
  gy.fill("g", 4, 1, 3, 1, "W"); gy.fill("g", 13, 1, 4, 1, "W"); gy.fill("g", 23, 1, 3, 1, "W");
  // four ranks of stacks with reading gaps
  for (let i = 0; i < 4; i++) {
    const x = 4 + i * 6;
    gy.fill("g", x, 5, 2, 6, "k");
    gy.fill("g", x, 13, 2, 6, "k");
  }
  gy.fill("g", 2, 3, 26, 1, "S");
  gy.fill("g", 13, 3, 4, 1, "_");
  gy.fill("g", 2, 21, 26, 1, "S");
  gy.fill("g", 13, 22, 4, 1, "c");
  gy.set("g", 12, 22, "\\"); gy.set("g", 17, 22, "\\");
  gy.set("g", 14, 25, "D"); gy.set("g", 15, 25, "D");
  gy.fill("g", 14, 23, 2, 2, "M");
  gy.set("g", 14, 2, "$"); gy.set("g", 15, 2, "$");
  gy.fill("g", 12, 11, 6, 2, "c");
  gy.set("g", 2, 12, "t"); gy.set("g", 27, 12, "t");
  gy.set("g", 3, 12, "h"); gy.set("g", 26, 12, "h");
  gy.set("g", 1, 24, "I");
  W.defineMap("knutsford_gym", MQ.U.merge(DL, {
    name: "Knutsford Gym — the Library", outdoor: false, ambience: "town", music: "town_knutsford",
    legend: M.interior(), layers: gy.layers(),
    spawnPoint: { x: 14, y: 24 },
    landmark: { name: "Knutsford Gym", x: 15, y: 12 },
    warps: [
      { x: 14, y: 25, to: "knutsford", tx: 32, ty: 14, dir: "down", kind: "door" },
      { x: 15, y: 25, to: "knutsford", tx: 32, ty: 14, dir: "down", kind: "door" },
      { x: 14, y: 2, to: "knutsford_gym_floor", tx: 11, ty: 20, dir: "up", kind: "door", cond: "gym2_open" },
      { x: 15, y: 2, to: "knutsford_gym_floor", tx: 12, ty: 20, dir: "up", kind: "door", cond: "gym2_open" }
    ],
    signs: [
      { x: 12, y: 22, text: ["KNUTSFORD GYM — MADAM GASKELL. CIPHER.",
        "HOUSE RULE: EVERY MONSTER OF MINE ARRIVES WITH A SPECIAL SCREEN ALREADY UP.",
        "That is not cheating. A cipher is a screen. The whole point of a cipher is that it was up before you got here.",
        "Three lecterns. Read them in the order the shelves are numbered, not the order you find them."] },
      { x: 2, y: 3, text: ["Shelf 1. CORRESPONDENCE, CHESHIRE, 1832–.",
        "Every letter in this county, filed by who it hurt."] },
      { x: 27, y: 3, text: ["Shelf 2. RUMOUR, UNVERIFIED.",
        "It is the largest section and it is the most accurate section and Madam finds that very funny."] },
      { x: 2, y: 21, text: ["Shelf 3. THINGS PEOPLE SAID THEY HADN'T.",
        "Cross-referenced with Shelf 1."] }
    ],
    items: [
      { x: 28, y: 24, item: "elixir", n: 2, hidden: true, flag: "item_knutsford_gym_1" },
      { x: 1, y: 4, item: "cipher_chip", n: 1, hidden: true, flag: "item_knutsford_gym_2" }
    ],
    npcs: [
      { id: "npc_gym2_non", x: 8, y: 8, dir: "down", sprite: "npc_historian", behaviour: "look", radius: 3, trainer: "tr_knutsford_gym_1", sight: 3 },
      { id: "npc_gym2_enfys", x: 21, y: 16, dir: "left", sprite: "npc_granny", behaviour: "look", radius: 3, trainer: "tr_knutsford_gym_2", sight: 3 },
      { id: "npc_gym2_idris", x: 9, y: 17, dir: "up", sprite: "npc_dev", behaviour: "look", radius: 3, trainer: "tr_knutsford_gym_3", sight: 3 },
      { id: "npc_gym2_lectern_1", x: 3, y: 6, dir: "right", sprite: "npc_historian", behaviour: "still", script: "mid_gym2_lectern_1" },
      { id: "npc_gym2_lectern_2", x: 26, y: 9, dir: "left", sprite: "npc_historian", behaviour: "still", script: "mid_gym2_lectern_2" },
      { id: "npc_gym2_lectern_3", x: 3, y: 18, dir: "right", sprite: "npc_historian", behaviour: "still", script: "mid_gym2_lectern_3" }
    ],
    triggers: [
      { x: 13, y: 3, w: 4, h: 1, script: "mid_gym2_backdoor", cond: "!gym2_open" }
    ],
    encounters: { grass: null }
  }));

  const gf = M.canvas(24, 22, "c");
  gf.box("g", 0, 0, 24, 22, "#");
  gf.fill("g", 1, 0, 22, 1, "^");
  gf.fill("g", 1, 1, 22, 1, "#");
  gf.fill("g", 6, 1, 3, 1, "W"); gf.fill("g", 15, 1, 3, 1, "W");
  gf.fill("g", 7, 4, 10, 13, "F");
  gf.fill("g", 2, 3, 3, 1, "k"); gf.fill("g", 19, 3, 3, 1, "k");
  gf.fill("g", 2, 17, 3, 1, "k"); gf.fill("g", 19, 17, 3, 1, "k");
  gf.set("g", 11, 3, "G"); gf.set("g", 12, 3, "G");
  gf.set("g", 2, 10, "N"); gf.set("g", 21, 10, "N");
  gf.set("g", 11, 21, "D"); gf.set("g", 12, 21, "D");
  gf.fill("g", 11, 19, 2, 2, "M");
  gf.set("g", 3, 19, "T"); gf.set("g", 4, 19, "h");
  W.defineMap("knutsford_gym_floor", MQ.U.merge(DL, {
    name: "Knutsford Gym", outdoor: false, ambience: "town", music: "town_knutsford",
    legend: M.interior(), layers: gf.layers(),
    spawnPoint: { x: 11, y: 20 },
    warps: [
      { x: 11, y: 21, to: "knutsford_gym", tx: 14, ty: 3, dir: "down", kind: "door" },
      { x: 12, y: 21, to: "knutsford_gym", tx: 15, ty: 3, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_knutsford_gaskell", x: 11, y: 5, dir: "down", sprite: "gaskell", behaviour: "still", script: "mid_gym2_gaskell" }
    ],
    signs: [
      { x: 11, y: 3, text: ["THE CIPHER BADGE STAND.",
        "Under the glass, a card: 'A badge is a promise that somebody checked. Do not let anybody make it mean anything more.'"] }
    ],
    encounters: { grass: null }
  }));
})();
