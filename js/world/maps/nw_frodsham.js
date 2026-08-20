// =============================================================
// MonsterQuest v2 — FRODSHAM (region mersey, Ch.9)
// A market town under a wooded sandstone hill, with the estuary and
// the wind turbines below it and the Sandstone Trail's first stile
// above. ROOT sits on the war-memorial bench at dusk and lays it all
// out. Includes Frodsham Hill, the Waders-only marsh and R23.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();
  const HUT = { "D": "door_wood", "w": "window", "@": "roof_slate" };

  // --------------------------------------------------------------- town ---
  const c = B.canvas(48, 46, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 48; x++) { c.set("o", x, 0, "y"); c.set("o", x, 44, "y"); }
  c.fill("g", 30, 43, 4, 3, "+");
  c.fill("o", 30, 44, 4, 2, " ");
  c.fill("g", 0, 20, 2, 4, "r");
  c.fill("g", 20, 0, 4, 3, "+");
  c.fill("o", 20, 0, 4, 2, " ");

  c.fill("g", 2, 2, 44, 42, ",");
  // ---- Main Street (the A56) straight through the middle ----------------
  c.fill("g", 2, 20, 44, 4, "r");
  c.fill("g", 2, 21, 44, 1, "|");
  c.fill("g", 2, 19, 44, 1, "-");
  c.fill("g", 2, 24, 44, 1, "-");
  c.fill("g", 22, 19, 4, 6, "z");
  for (let x = 5; x < 46; x += 6) { c.set("g", x, 19, "L"); c.set("g", x + 3, 24, "L"); }
  c.set("g", 8, 24, "O"); c.set("g", 15, 19, "u"); c.set("g", 33, 24, "U"); c.set("g", 40, 19, "q");
  c.set("g", 28, 24, "H"); c.set("g", 29, 24, "I");

  // ---- north of the street: the marsh side, the station, the turbines ---
  c.fill("g", 2, 3, 44, 16, "=");
  c.fill("g", 2, 3, 44, 6, "a");
  c.fill("g", 4, 4, 12, 4, "J");
  c.fill("g", 30, 4, 14, 3, "J");
  for (let i = 0; i < 4; i++) c.set("g", 8 + i * 10, 3, "\\");
  c.fill("g", 18, 3, 4, 6, "+");
  c.fill("g", 2, 9, 44, 1, "|");
  c.fill("g", 2, 9, 44, 2, "r");
  B.house(c, { x: 4, y: 12, w: 12, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 5, over: ";", chimney: 1 });
  c.set("g", 3, 15, "N");
  c.fill("g", 4, 11, 12, 1, "6");
  c.fill("g", 4, 10, 12, 1, "4");
  B.house(c, { x: 20, y: 13, w: 10, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 19, 16, "N");
  B.house(c, { x: 34, y: 12, w: 11, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: ";", chimney: 9 });
  c.set("g", 33, 15, "N");
  c.fill("g", 2, 18, 44, 1, "=");

  // ---- south of the street: the hill, the church, the post office -------
  c.fill("g", 2, 25, 44, 19, "=");
  c.box("g", 4, 27, 13, 10, "w");
  c.fill("g", 5, 28, 11, 8, ",");
  B.house(c, { x: 7, y: 28, w: 8, h: 6, rh: 2, roof: "p", wall: "c", win: "C", door: "v", doorX: 3 });
  c.set("g", 9, 28, "p");
  c.scatter("g", "frod-graves", "n", 10, 5, 28, 11, 8, [","]);
  c.fill("g", 5, 34, 11, 2, ",");
  c.fill("g", 5, 28, 2, 8, ",");
  c.fill("g", 15, 28, 1, 8, ",");
  c.set("g", 6, 27, "g");
  c.fill("g", 10, 34, 1, 3, "_");
  B.house(c, { x: 20, y: 26, w: 8, h: 4, rh: 1, roof: "R", wall: "$", win: "W", door: "S", doorX: 3, over: ";" });
  c.set("g", 19, 29, "N");
  B.house(c, { x: 32, y: 26, w: 9, h: 5, rh: 2, roof: "R", wall: "&", win: "W", door: ">", doorX: 4, over: ";" });
  c.set("g", 31, 30, "N");
  // the memorial and its bench, looking north over the estuary
  c.fill("g", 20, 33, 10, 6, ",");
  c.set("g", 24, 35, "*"); c.set("g", 25, 35, "*");
  c.set("g", 23, 37, "H"); c.set("g", 26, 37, "H");
  c.set("g", 22, 34, "Y"); c.set("g", 27, 34, "Y");
  c.set("g", 21, 38, "N");
  // the trail office and the way up the hill
  B.house(c, { x: 36, y: 33, w: 8, h: 4, rh: 1, roof: "@", wall: "#", win: "w", door: "D", doorX: 3 });
  c.set("g", 35, 36, "N");
  c.fill("g", 39, 37, 2, 5, "s");
  c.set("g", 41, 40, "N");
  c.fill("g", 4, 38, 14, 5, '"');
  B.house(c, { x: 4, y: 37, w: 5, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 12, y: 37, w: 5, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  c.fill("g", 3, 40, 16, 1, "=");
  c.fill("g", 20, 40, 12, 3, '"');
  B.trees(c, "frod-s", 22, 4, 38, 14, 5, "T", "y", ['"']);
  c.fill("g", 44, 25, 2, 18, "T");
  c.set("g", 45, 30, "y");

  W.defineMap("frodsham", {
    name: "Frodsham", region: "mersey", outdoor: true, music: "town_frodsham", weatherZone: "mersey",
    ambience: "town", dialogue: "town_frodsham",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 24, y: 22 },
    healPoint: { x: 39, y: 19 },
    landmark: { name: "Frodsham", x: 24, y: 21 },
    encounters: { grass: "frodsham_grass" },
    warps: [].concat(
      NW.edge(30, 45, 4, true, "route_frodsham_delamere", 11, 1, "down"),
      NW.edge(0, 20, 4, false, "route_runcorn_frodsham", 54, 18, "left"),
      NW.edge(20, 0, 4, true, "route_ince_frodsham", 20, 41, "up"),
      NW.exit(9, 18, "frodsham_station", 8, 10, "up"),
      NW.exit(24, 18, "frodsham_mart", 6, 8, "up"),
      NW.exit(39, 18, "frodsham_care", 7, 10, "up"),
      NW.exit(23, 30, "frodsham_post", 6, 8, "up"),
      NW.exit(36, 31, "frodsham_inn", 6, 10, "up"),
      NW.exit(39, 37, "frodsham_trail_office", 8, 12, "up"),
      [
        { x: 6, y: 39, to: "frodsham_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 14, y: 39, to: "frodsham_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 10, y: 33, to: "frodsham_church", tx: 6, ty: 12, dir: "up", kind: "door" },
        { x: 40, y: 42, to: "frodsham_hill", tx: 20, ty: 41, dir: "up", kind: "stairs" },
        { x: 39, y: 42, to: "frodsham_hill", tx: 20, ty: 41, dir: "up", kind: "stairs" }
      ]
    ),
    signs: [
      { x: 3, y: 15, text: ["FRODSHAM STATION — Chester, Warrington, Liverpool.", "The Halton Curve reopened in 2018 after twenty-three years, which is fast for a railway."] },
      { x: 19, y: 16, text: ["FRODSHAM MART", "WADERS — BACK IN STOCK. A queue has formed and nobody in it will say why they want them."] },
      { x: 33, y: 15, text: ["CARE CENTRE — FRODSHAM", "Triage board on the wall. Every case on it is marked URGENT and dated today."] },
      { x: 19, y: 29, text: ["POST OFFICE", "There is a letter here with a Georgian stamp and your name on it in a hand you have known for years."] },
      { x: 31, y: 30, text: ["THE BEAR'S PAW — 1632, and the beam over the fire is a ship's timber, allegedly."] },
      { x: 21, y: 38, text: ["FRODSHAM WAR MEMORIAL", "Two hundred and eleven names on a hill above an estuary, facing the water.",
        "There is a bench. Somebody is usually on it at dusk, watching the far bank."] },
      { x: 35, y: 36, text: ["SANDSTONE TRAIL OFFICE", "Passports stamped. Waders sold. Advice given at length and free of charge."] },
      { x: 41, y: 40, text: ["FRODSHAM HILL — 1/2 mile, and it is all up.", "Mersey View at the top. On a bad day you can see three power stations and a great deal of weather."] }
    ],
    items: [
      { x: 6, y: 42, item: "elixir", n: 2, flag: "item_frodsham_1" },
      { x: 44, y: 4, item: "capsule_net", n: 4, flag: "item_frodsham_2" },
      { x: 30, y: 42, item: "revive_salts", n: 1, hidden: true, flag: "item_frodsham_3" },
      { x: 3, y: 5, item: "roe", n: 3, hidden: true, flag: "item_frodsham_4" }
    ],
    catGaps: [
      { x: 18, y: 34, item: "cat_token_8", n: 1, flag: "catgap_frodsham_1",
        say: "MEADOW slips between the memorial railings, sits on the plinth, and will not be told." }
    ],
    restPoints: [{ x: 27, y: 37, flag: "bigboy_sat_frodsham_town" }],
    npcs: [
      { id: "npc_frodsham_gethin", x: 38, y: 38, dir: "down", sprite: "npc_walker", behaviour: "still", script: "nw_frodsham_gethin" },
      { id: "npc_frodsham_ivor", x: 26, y: 34, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "nw_frodsham_ivor" },
      { id: "npc_frodsham_ness", x: 12, y: 11, dir: "down", sprite: "npc_birder", behaviour: "look", radius: 4, trainer: "tr_route_runcorn_frodsham_1", sight: 4 },
      { id: "npc_frodsham_root", x: 25, y: 37, dir: "up", sprite: "root", behaviour: "still", script: "nw_frodsham_root_bench",
        cond: "chapter >= 9 && !root_bench_talk" },
      { id: "npc_frodsham_root_after", x: 25, y: 37, dir: "up", sprite: "root", behaviour: "still", script: "nw_frodsham_root_after",
        cond: "root_bench_talk && chapter < 11" },
      { id: "npc_frodsham_postie", x: 22, y: 31, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["Letter for you. Georgian stamp, four countries of postmark, and a sticker of a cat on the back.",
          "I've been carrying it about for a week because I liked looking at it."] },
      { id: "npc_frodsham_granny", x: 16, y: 25, dir: "up", sprite: "npc_granny", behaviour: "still",
        say: ["The turbines out on the marsh have been turning against the wind since Monday.",
          "My husband was a millwright. He'd have gone out there with a spanner and a temper."] },
      { id: "npc_frodsham_kid", x: 31, y: 22, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Tide comes up the Weaver faster than you can walk. They tell us that at school every year.",
          "Every year somebody has to be told it again on the day."] },
      { id: "npc_frodsham_walker", x: 42, y: 22, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[42, 22], [34, 22], [34, 25], [42, 25]], pathMode: "loop",
        say: ["Thirty-four miles to Whitchurch and the first stile is up that hill, which is a joke the trail plays on you."] },
      { id: "npc_frodsham_marshman", x: 6, y: 11, dir: "down", sprite: "npc_birder", behaviour: "still",
        say: ["Nineteen little egrets on that marsh. Twenty years ago there were none in England at all.",
          "Things arrive. Some of them are birds."] }
    ],
    triggers: [
      { x: 24, y: 36, w: 3, h: 1, script: "nw_frodsham_bench_dusk", once: "frodsham_bench_dusk", cond: "chapter >= 9" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("frodsham_care", W.builtin("care_centre", {
    name: "Frodsham Care Centre", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    warps: NW.exit(7, 11, "frodsham", 39, 19, "down"),
    npcs: [
      { id: "npc_frodsham_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Triage board says everything is urgent. It has said that since Tuesday.", "It is very rarely wrong, which is the whole trouble."] },
      { id: "npc_frodsham_care_1", x: 12, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["They tried turning the triage off for an hour. Waiting times trebled.", "Then they turned it back on and nobody has mentioned it since."] }
    ]
  }));
  W.defineMap("frodsham_mart", W.builtin("shop", {
    name: "Frodsham Mart", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    shop: "shop_frodsham",
    warps: NW.exit(6, 9, "frodsham", 24, 19, "down"),
    npcs: [
      { id: "npc_frodsham_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_frodsham",
        say: ["Waders, capsules, and a rack of maps that all stop at the tide line."] }
    ],
    items: [{ x: 12, y: 2, item: "capsule_heavy", n: 2, flag: "item_frodsham_mart_1" }]
  }));
  W.defineMap("frodsham_inn", W.builtin("pub", {
    name: "The Bear's Paw", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    warps: NW.exit(6, 11, "frodsham", 36, 32, "down"),
    npcs: [
      { id: "npc_frodsham_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Rooms upstairs, and the one at the front looks straight over the marsh.", "Guests either love it or come down at three in the morning to ask about the lights."] },
      { id: "npc_frodsham_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_shadow_it", behaviour: "still",
        say: ["I'm contract. Runcorn, Daresbury, Warrington, back to Runcorn.",
          "Four sites, one lanyard, and not one of them has ever asked me who I work for."] },
      { id: "npc_frodsham_pub_2", x: 4, y: 8, dir: "up", sprite: "npc_fellrunner", behaviour: "still",
        say: ["Up the hill in nine minutes. Down in four and a half and an apology to my knees."] }
    ]
  }));
  W.defineMap("frodsham_church", W.builtin("church", {
    name: "St Laurence's", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    warps: NW.exit(6, 13, "frodsham", 10, 34, "down"),
    npcs: [
      { id: "npc_frodsham_verger", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Norman arcade, Victorian roof, and a memorial to a man who drowned crossing the sands.",
          "There are more of those on this coast than anyone likes to count."] }
    ],
    items: [{ x: 1, y: 11, item: "capsule_mesh", n: 3, hidden: true, flag: "item_frodsham_church_1" }]
  }));
  W.defineMap("frodsham_station", W.builtin("station", {
    name: "Frodsham Station", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    station: { name: "Frodsham" },
    warps: NW.exit(8, 11, "frodsham", 9, 19, "down"),
    npcs: [
      { id: "npc_frodsham_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["Halton Curve's open again. Twenty-three years shut and then one Sunday, open.",
          "Nothing round here comes back quickly. It just comes back."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "Chester. Warrington Bank Quay. Liverpool Lime Street.", "The board flickers on a ninety-second cycle and nobody has ever complained about it."] }]
  }));
  W.defineMap("frodsham_post", W.builtin("shop", {
    name: "Frodsham Post Office", region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
    warps: NW.exit(6, 9, "frodsham", 23, 31, "down"),
    npcs: [
      { id: "npc_frodsham_postmaster", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "nw_frodsham_letter" }
    ]
  }));

  // the trail office — Gethin, waders, and a wall of laminated tide tables
  const to = NW.room(18, 14, ",", "#");
  to.fill("g", 1, 1, 16, 1, "W");
  to.fill("g", 2, 3, 6, 1, "S"); to.fill("g", 11, 3, 5, 1, "S");
  to.fill("g", 2, 6, 4, 1, "N"); to.fill("g", 12, 6, 4, 1, "N");
  to.fill("g", 7, 8, 4, 1, "C"); to.set("g", 11, 8, "Q");
  to.set("g", 3, 10, "x"); to.set("g", 14, 10, "y");
  NW.doorway(to, 8, 13, "D");
  NW.defIn("frodsham_trail_office", {
    name: "Sandstone Trail Office", region: "mersey", music: "town_frodsham", ambience: "town", dialogue: "town_frodsham",
    spawnPoint: { x: 8, y: 12 },
    shop: "shop_frodsham_trail",
    warps: NW.exit(8, 13, "frodsham", 39, 38, "down"),
    encounters: { grass: null },
    signs: [
      { x: 3, y: 6, text: ["TIDE TABLES — WEAVER, MERSEY, DEE.", "Laminated, updated weekly, and the only piece of paper in Cheshire nobody argues with."] },
      { x: 13, y: 6, text: ["SANDSTONE TRAIL PASSPORT", "Six stamps: Frodsham, Delamere, Kelsall, Beeston, Bickerton, Whitchurch.",
        "Somebody has stamped the margin in a shape that is not any of the six."] }
    ],
    items: [{ x: 16, y: 11, item: "walkers_boots", n: 1, hidden: true, flag: "item_frodsham_trail_office_1" }],
    npcs: [
      { id: "npc_frodsham_gethin_desk", x: 9, y: 9, dir: "down", sprite: "npc_walker", behaviour: "still", shop: "shop_frodsham_trail", script: "nw_frodsham_waders" },
      { id: "npc_frodsham_trail_1", x: 3, y: 4, dir: "down", sprite: "npc_walker", behaviour: "still",
        say: ["Everybody buys the waders for Lindow and uses them for Burton Marsh.", "Burton Marsh is where you find out whether you bought good ones."] }
    ]
  }, to, NW.inside());

  const fhomes = [
    { id: "frodsham_house_1", tx: 6, ty: 40, name: "Church Street Cottage" },
    { id: "frodsham_house_2", tx: 14, ty: 40, name: "Church Street Cottage" }
  ];
  for (let i = 0; i < fhomes.length; i++) {
    const hh = fhomes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "mersey", dialogue: "town_frodsham", music: "town_frodsham",
      warps: NW.exit(5, 9, "frodsham", hh.tx, hh.ty, "down"),
      npcs: [{
        id: "npc_" + hh.id, x: 6, y: 3, dir: "down", sprite: i ? "npc_dev" : "npc_granny",
        say: i ? ["I do incident response from the back bedroom for a firm in Manchester.",
          "Last month every alert I got was correct. Every single one. I have never been so uneasy in my life."]
          : ["My cat went missing in 1998 and I still put food out on the wall on a Sunday.",
            "Somebody found a collar tag up at Beeston once. Wrong number, they said. It was my number."] }]
    }));
  }

  // --------------------------------------------------------- the hill -----
  const h = B.canvas(40, 44, ";");
  B.frame(h, "T", 1);
  for (let x = 0; x < 40; x++) h.set("o", x, 0, "y");
  h.fill("g", 19, 42, 3, 2, "v");
  h.fill("g", 1, 1, 38, 42, "<");
  // switchbacks: five zigzags up to the memorial viewpoint
  h.fill("g", 19, 36, 3, 7, "v");
  h.fill("g", 6, 34, 16, 2, "v");
  h.fill("g", 6, 28, 2, 8, "v");
  h.fill("g", 6, 28, 26, 2, "v");
  h.fill("g", 30, 22, 2, 8, "v");
  h.fill("g", 8, 22, 24, 2, "v");
  h.fill("g", 8, 14, 2, 10, "v");
  h.fill("g", 8, 14, 22, 2, "v");
  h.fill("g", 28, 8, 2, 8, "v");
  h.fill("g", 14, 8, 16, 2, "v");
  h.fill("g", 14, 4, 2, 6, "v");
  // the crag edge and the viewpoint
  h.fill("g", 2, 2, 36, 3, "0");
  h.fill("g", 10, 3, 16, 3, ";");
  h.fill("g", 12, 4, 12, 2, "v");
  h.set("g", 17, 4, "q"); h.set("g", 20, 4, "q");
  h.set("g", 15, 3, "*");
  h.set("g", 24, 4, "S");
  // the beacon platform
  h.fill("g", 30, 4, 6, 5, "0");
  h.fill("g", 31, 5, 4, 3, "n");
  h.set("g", 32, 6, "`"); h.set("g", 33, 6, "`");
  h.fill("g", 30, 9, 1, 6, "v");
  h.set("g", 29, 9, "S");
  h.fill("g", 30, 14, 2, 1, "v");
  // woods and a cave nook off the third switchback
  B.trees(h, "fh-a", 55, 2, 6, 36, 34, "T", "y", ["<"]);
  h.fill("g", 33, 30, 5, 5, "K");
  h.fill("g", 34, 31, 3, 3, ",");
  h.set("g", 34, 34, "E");
  h.fill("g", 32, 34, 3, 2, "v");
  h.scatter("g", "fh-berry", "k", 16, 3, 6, 34, 34, ["<"]);
  h.set("g", 18, 38, "S"); h.set("g", 12, 24, "I");
  NW.defLand("frodsham_hill", {
    name: "Frodsham Hill", region: "mersey", weatherZone: "mersey", music: "town_frodsham", ambience: "forest",
    dialogue: "town_frodsham",
    spawnPoint: { x: 20, y: 41 },
    landmark: { name: "Mersey View", x: 17, y: 4 },
    encounters: { grass: "frodsham_hill_grass" },
    warps: NW.edge(19, 43, 3, true, "frodsham", 39, 41, "down"),
    signs: [
      { x: 18, y: 38, text: ["FRODSHAM HILL — MERSEY VIEW", "The Sandstone Trail starts at the stile above. It is thirty-four miles and it does not warm up."] },
      { x: 24, y: 4, text: ["MERSEY VIEW", "Runcorn. Widnes. Fiddler's Ferry. Liverpool, if the air is honest.",
        "And on the far bank, low and grey and extremely well lit, a building with no name on it."] },
      { x: 29, y: 9, text: ["FRODSHAM BEACON", "One of the Armada chain. Last lit for the Jubilee and before that for a war.",
        "It takes three timbers and a spark, and the man who keeps it will tell you which three."] }
    ],
    items: [
      { x: 4, y: 8, item: "capsule_root", n: 3, flag: "item_frodsham_hill_1" },
      { x: 36, y: 40, item: "elixir", n: 2, flag: "item_frodsham_hill_2" },
      { x: 11, y: 3, item: "viewpoint_frodsham_hill", n: 1, flag: "item_frodsham_hill_3" },
      { x: 35, y: 32, item: "beacon_ember", n: 1, hidden: true, flag: "item_frodsham_hill_4" },
      { x: 26, y: 20, item: "timber_birch", n: 2, hidden: true, flag: "item_frodsham_hill_5" }
    ],
    restPoints: [{ x: 13, y: 24, flag: "bigboy_sat_frodsham" }],
    npcs: [
      { id: "npc_frodsham_alaw", x: 20, y: 23, dir: "left", sprite: "npc_fellrunner", behaviour: "look", radius: 4, trainer: "tr_frodsham_hill_1", sight: 4 },
      { id: "npc_frodsham_cerith", x: 19, y: 5, dir: "up", sprite: "npc_birder", behaviour: "still", trainer: "tr_frodsham_hill_2", sight: 0, script: "nw_frodsham_cerith" },
      { id: "npc_frodsham_ivor_hill", x: 31, y: 9, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "nw_frodsham_beacon" },
      { id: "npc_frodsham_hill_walker", x: 10, y: 29, dir: "right", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Five switchbacks and every one of them convinces you it's the last."] }
    ],
    triggers: [
      { x: 12, y: 4, w: 12, h: 2, script: "nw_frodsham_view", once: "frodsham_view_seen" }
    ]
  }, h, NW.land());

  // =====================================================================
  // R23 — Weston Point & Frodsham Marsh: turbines, ditches, tide pockets
  // =====================================================================
  const r = B.canvas(58, 32, ",");
  B.frame(r, "T", 1);
  for (let x = 0; x < 58; x++) r.set("o", x, 0, "y");
  r.fill("g", 0, 16, 2, 4, "v"); r.fill("g", 56, 16, 2, 4, "v");
  r.fill("g", 1, 1, 56, 30, ".");
  // the Weaver and the ship canal along the north
  r.fill("g", 1, 2, 56, 4, "!");
  r.fill("g", 1, 6, 56, 1, "e");
  r.fill("g", 1, 7, 56, 2, "t");
  // the marsh
  r.fill("g", 2, 9, 54, 6, "a");
  r.fill("g", 6, 10, 10, 4, "J");
  r.fill("g", 24, 10, 12, 4, "J");
  r.fill("g", 44, 10, 10, 4, "J");
  // the embankment lane
  r.fill("g", 1, 16, 56, 3, "v");
  r.fill("g", 8, 19, 2, 7, "v");
  r.fill("g", 8, 24, 22, 2, "v");
  r.fill("g", 28, 19, 2, 7, "v");
  r.fill("g", 40, 19, 2, 9, "v");
  r.fill("g", 40, 26, 14, 2, "v");
  // the turbines
  for (let i = 0; i < 5; i++) { r.set("g", 6 + i * 11, 12, "\\"); r.set("g", 6 + i * 11, 11, "`"); }
  // ditches and rough grazing to the south
  r.fill("g", 2, 20, 54, 10, "<");
  r.fill("g", 12, 20, 14, 3, "a");
  r.fill("g", 44, 20, 10, 4, "a");
  r.fill("g", 15, 21, 8, 1, "J");
  r.fill("g", 46, 21, 6, 2, "J");
  B.trees(r, "r23-a", 24, 2, 26, 54, 4, "T", "y", ["<"]);
  r.scatter("g", "r23-reed", "a", 30, 2, 20, 54, 8, ["<"]);
  r.set("g", 6, 15, "S"); r.set("g", 32, 15, "S"); r.set("g", 52, 19, "S");
  r.set("g", 20, 19, "q"); r.set("g", 36, 25, "I");
  r.set("g", 20, 8, "Q"); r.set("g", 44, 8, "Q"); r.set("g", 10, 8, "Q");
  r.fill("g", 30, 9, 2, 7, "z");
  r.fill("g", 33, 9, 2, 7, "z");
  NW.defLand("route_runcorn_frodsham", {
    name: "Weston & Frodsham Marsh", region: "mersey", weatherZone: "mersey", music: "route_mersey", ambience: "water",
    dialogue: "town_frodsham",
    spawnPoint: { x: 54, y: 17 },
    landmark: { name: "Frodsham Marsh", x: 28, y: 12 },
    encounters: { grass: "route_runcorn_frodsham_grass", water: "route_runcorn_frodsham_water" },
    warps: [].concat(
      NW.edge(57, 16, 4, false, "frodsham", 1, 20, "right"),
      NW.edge(0, 16, 4, false, "runcorn", 62, 24, "left"),
      [{ x: 31, y: 15, to: "frodsham_marsh", tx: 20, ty: 28, dir: "up", kind: "edge", cond: "waders" }]
    ),
    signs: [
      { x: 6, y: 15, text: ["FRODSHAM MARSH", "Grazing marsh, saltmarsh, and a tide that arrives sideways.", "WADERS REQUIRED BEYOND THIS POINT and that is not a suggestion."] },
      { x: 32, y: 15, text: ["WESTON POINT — the Weaver Navigation meets the Ship Canal here and neither gives way.",
        "Behind the reeds: a gap in the fence that somebody keeps re-cutting."] },
      { x: 52, y: 19, text: ["FRODSHAM 1/2 MILE.", "RUNCORN 3 MILES, and you will smell it before you see it, and then you will stop noticing, which is worse."] }
    ],
    items: [
      { x: 4, y: 28, item: "capsule_net", n: 3, flag: "item_route_runcorn_frodsham_1" },
      { x: 54, y: 29, item: "elixir", n: 2, flag: "item_route_runcorn_frodsham_2" },
      { x: 22, y: 8, item: "rain_cloak", n: 1, hidden: true, flag: "item_route_runcorn_frodsham_3" }
    ],
    npcs: [
      { id: "npc_r23_marlow", x: 18, y: 17, dir: "down", sprite: "npc_shadow_it", behaviour: "look", radius: 4, trainer: "tr_route_runcorn_frodsham_2", sight: 4 },
      { id: "npc_r23_kai", x: 42, y: 22, dir: "left", sprite: "npc_stuffer", behaviour: "still", trainer: "tr_route_runcorn_frodsham_3", sight: 4 },
      { id: "npc_r23_birder", x: 12, y: 8, dir: "up", sprite: "npc_birder", behaviour: "still",
        say: ["Egrets, curlew, a short-eared owl if you are lucky and patient and cold.",
          "And a hum off the turbines that is four notes long and does not change."] }
    ]
  }, r, NW.land());

  // ------------------------------------------------- the marsh (waders) ---
  const fm = B.canvas(40, 30, "a");
  B.frame(fm, "z", 1);
  fm.fill("g", 19, 28, 3, 2, "a");
  fm.fill("g", 1, 1, 38, 28, "a");
  fm.fill("g", 4, 4, 14, 6, "J");
  fm.fill("g", 22, 6, 14, 7, "J");
  fm.fill("g", 8, 16, 12, 6, "J");
  fm.fill("g", 26, 18, 10, 7, "J");
  fm.fill("g", 18, 2, 4, 26, "a");
  fm.fill("g", 2, 12, 36, 3, "a");
  for (let i = 0; i < 3; i++) { fm.set("g", 8 + i * 12, 5, "\\"); fm.set("g", 8 + i * 12, 4, "`"); }
  fm.set("g", 17, 14, "S"); fm.set("g", 24, 14, "S");
  fm.set("g", 6, 13, "Q"); fm.set("g", 32, 13, "Q");
  fm.scatter("g", "fm-reed", "z", 26, 2, 2, 36, 26, ["a"]);
  NW.defLand("frodsham_marsh", {
    name: "Frodsham Marsh", region: "mersey", weatherZone: "mersey", music: "route_mersey", ambience: "water",
    dialogue: "town_frodsham",
    spawnPoint: { x: 20, y: 27 },
    landmark: { name: "Frodsham Marsh", x: 20, y: 13 },
    encounters: { grass: "frodsham_marsh_grass", water: "frodsham_marsh_water" },
    warps: NW.edge(19, 29, 3, true, "route_runcorn_frodsham", 31, 16, "down"),
    signs: [
      { x: 17, y: 14, text: ["A tide pole, marked in feet, standing in grass a mile from the water.",
        "The top mark is at fourteen feet. Somebody has scratched a line above it and written a date."] },
      { x: 24, y: 14, text: ["TURBINE 4 — DO NOT APPROACH. YAW CONTROL REMOTE.",
        "It is turning against the wind. All five of them are. They have been for a week."] }
    ],
    items: [
      { x: 3, y: 27, item: "capsule_heavy", n: 3, flag: "item_frodsham_marsh_1" },
      { x: 37, y: 3, item: "wind_whistle", n: 1, hidden: true, flag: "item_frodsham_marsh_2" },
      { x: 36, y: 27, item: "tonic_spd", n: 2, hidden: true, flag: "item_frodsham_marsh_3" }
    ],
    npcs: [
      { id: "npc_frodsham_marsh_birder", x: 20, y: 16, dir: "down", sprite: "npc_birder", behaviour: "still",
        say: ["Nobody comes out here. That is why everything comes out here.",
          "Including, twice this month, a man in a hi-vis with a laptop and no van."] }
    ]
  }, fm, NW.land());
})();
