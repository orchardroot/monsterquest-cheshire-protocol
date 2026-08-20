// =============================================================
// MonsterQuest v2 — TARPORLEY (region west, Ch.8)
// A Georgian high street that was a coaching town and is now a hunt
// town: red brick, bow windows, two coaching inns facing each other
// across the road, and Hedge-layer Cadoc's yard behind the church.
// Plus R27 Bunbury & the Shropshire Union and R28 Tarvin & Christleton.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();

  // --------------------------------------------------------------- town ---
  const c = B.canvas(46, 36, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 46; x++) { c.set("o", x, 0, "y"); c.set("o", x, 34, "y"); }
  c.fill("g", 23, 0, 3, 2, "=");
  c.fill("o", 23, 0, 3, 1, " ");
  c.fill("g", 21, 34, 3, 2, "+");
  c.fill("o", 21, 34, 3, 1, " ");
  c.fill("g", 0, 17, 2, 3, "r");

  c.fill("g", 2, 2, 42, 32, ",");

  // ---- the High Street: the A49 straight through, pavements both sides --
  c.fill("g", 2, 16, 42, 4, "r");
  c.fill("g", 2, 17, 42, 1, "|");
  c.fill("g", 2, 15, 42, 1, "-");
  c.fill("g", 2, 20, 42, 1, "-");
  c.fill("g", 20, 15, 4, 6, "z");
  for (let x = 5; x < 44; x += 6) { c.set("g", x, 15, "L"); c.set("g", x + 3, 20, "L"); }
  c.set("g", 9, 20, "O"); c.set("g", 14, 15, "u"); c.set("g", 30, 20, "U"); c.set("g", 38, 15, "q");
  c.set("g", 26, 20, "H"); c.set("g", 27, 20, "I"); c.set("g", 12, 20, "8"); c.set("g", 13, 20, "8");

  // ---- north side: the Swan, the mart, the care centre -----------------
  c.fill("g", 2, 3, 42, 12, "=");
  B.house(c, { x: 4, y: 9, w: 12, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: ">", doorX: 5, over: ";", chimney: 1 });
  c.fill("g", 4, 9, 12, 2, "R");
  c.set("g", 3, 12, "N");
  B.house(c, { x: 19, y: 10, w: 9, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 18, 13, "N");
  B.house(c, { x: 31, y: 9, w: 11, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: ";", chimney: 9 });
  c.set("g", 30, 12, "N");
  c.fill("g", 4, 4, 38, 4, ",");
  B.trees(c, "tar-n", 12, 4, 4, 38, 4, "T", "y", [","]);
  c.fill("g", 8, 5, 5, 2, '"');
  c.fill("g", 33, 4, 6, 3, '"');

  // ---- south side: church, Cadoc's yard, the Rising Sun, cottages ------
  c.fill("g", 2, 21, 42, 13, "=");
  c.box("g", 3, 23, 15, 11, "w");
  c.fill("g", 4, 24, 13, 9, ",");
  B.house(c, { x: 6, y: 24, w: 9, h: 7, rh: 3, roof: "p", wall: "c", win: "C", door: "v", doorX: 4 });
  c.set("g", 8, 24, "p");
  c.scatter("g", "tar-graves", "n", 12, 4, 24, 13, 9, [","]);
  c.fill("g", 10, 31, 1, 3, "_");
  c.set("g", 10, 23, "g");
  // Cadoc's yard, behind a fence with a gate onto the High Street
  c.fill("g", 19, 24, 12, 9, "+");
  c.box("g", 19, 24, 12, 9, "f");
  c.set("g", 24, 24, "g");
  c.fill("g", 21, 26, 8, 2, "h");
  c.fill("g", 21, 29, 8, 1, "i");
  c.set("g", 20, 31, "\\"); c.set("g", 22, 31, "`"); c.set("g", 27, 31, "\\");
  c.set("g", 32, 24, "N");
  c.set("g", 26, 23, "N");
  // the Rising Sun and the cottages
  B.house(c, { x: 33, y: 22, w: 10, h: 5, rh: 2, roof: "R", wall: "&", win: "W", door: ">", doorX: 4, over: ";" });
  c.set("g", 32, 25, "N");
  B.house(c, { x: 33, y: 29, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 39, y: 29, w: 5, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  c.fill("g", 32, 33, 12, 1, "-");
  c.fill("g", 2, 21, 1, 13, ",");
  c.fill("g", 3, 34, 20, 1, ",");
  c.fill("g", 19, 33, 5, 2, "+");

  // pockets and greens
  c.fill("g", 2, 26, 1, 6, '"');
  c.set("g", 44, 18, "P");
  c.set("g", 2, 14, "9");
  c.set("g", 22, 13, "M");

  W.defineMap("tarporley", {
    name: "Tarporley", region: "west", outdoor: true, music: "town_chester", weatherZone: "west",
    ambience: "town", dialogue: "town_tarporley",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 22, y: 18 },
    healPoint: { x: 36, y: 15 },
    landmark: { name: "Tarporley", x: 22, y: 17 },
    encounters: { grass: "tarporley_grass" },
    warps: [].concat(
      NW.edge(23, 0, 3, true, "route_delamere_tarporley", 24, 32, "up"),
      NW.edge(21, 35, 3, true, "route_tarporley_beeston", 20, 1, "down"),
      NW.edge(0, 17, 3, false, "route_tarporley_chester", 53, 10, "left"),
      NW.exit(9, 15, "tarporley_inn", 6, 10, "up"),
      NW.exit(23, 15, "tarporley_mart", 6, 8, "up"),
      NW.exit(36, 15, "tarporley_care", 7, 10, "up"),
      [{ x: 10, y: 30, to: "tarporley_church", tx: 6, ty: 12, dir: "up", kind: "door" }],
      [{ x: 24, y: 24, to: "tarporley_cadoc_yard", tx: 11, ty: 19, dir: "up", kind: "gate" }],
      NW.exit(37, 27, "tarporley_hunt_kennels", 8, 12, "up"),
      NW.exit(35, 33, "tarporley_house_1", 5, 9, "up"),
      NW.exit(41, 33, "tarporley_house_2", 5, 9, "up")
    ),
    signs: [
      { x: 3, y: 12, text: ["THE SWAN — coaching inn, 1769.", "Rooms, a fire, and a landlord who will tell you the hunt's history whether or not you ask."] },
      { x: 18, y: 13, text: ["TARPORLEY MART — everything a walker forgets.", "Waders sold out. There is a note: 'try Frodsham, they've had a run on them.'"] },
      { x: 30, y: 12, text: ["CARE CENTRE — TARPORLEY", "Open all hours. The kettle is separate and also open all hours."] },
      { x: 26, y: 23, text: ["CADOC & SON, HEDGE-LAYERS. Est. 1911.", "'AND SON' has been painted out and painted back in twice."] },
      { x: 32, y: 24, text: ["A laid hedge, mid-work: stems cut most of the way through and bent over, still living.",
        "You do most of the damage and then you let it grow. Cadoc says that is the whole of his trade and most of everything else."] },
      { x: 32, y: 25, text: ["THE RISING SUN — sixteenth century, allegedly.", "The beams are. The rest of it has been sixteenth century since about 1890."] },
      { x: 44, y: 18, text: ["A49 — CHESTER 10, WHITCHURCH 12.", "BEESTON CASTLE 3 (footpath, and mind the crag)."] }
    ],
    items: [
      { x: 10, y: 5, item: "elixir", n: 2, flag: "item_tarporley_1" },
      { x: 36, y: 5, item: "capsule_mesh", n: 4, flag: "item_tarporley_2" },
      { x: 2, y: 29, item: "billhook_charm", n: 1, hidden: true, flag: "item_tarporley_3" },
      { x: 18, y: 30, item: "timber_oak", n: 2, hidden: true, flag: "item_tarporley_4" }
    ],
    catGaps: [
      { x: 18, y: 28, item: "cat_token_7", n: 1, flag: "catgap_tarporley_1",
        say: "MEADOW goes through the churchyard railings and returns with a small brass tag that says a name nobody in Tarporley remembers." }
    ],
    restPoints: [{ x: 27, y: 21, flag: "bigboy_sat_tarporley" }],
    npcs: [
      { id: "npc_tarporley_delyth", x: 30, y: 21, dir: "down", sprite: "npc_walker", behaviour: "still", trainer: "tr_tarporley_1", sight: 0, script: "nw_tarporley_delyth" },
      { id: "npc_tarporley_cadoc", x: 22, y: 22, dir: "down", sprite: "npc_farmer", behaviour: "still", script: "nw_tarporley_cadoc" },
      { id: "npc_tarporley_ffion", x: 15, y: 18, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3, trainer: "tr_tarporley_3", sight: 3 },
      { id: "npc_tarporley_crier", x: 21, y: 14, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Two coaching inns facing each other for two hundred years and neither has ever admitted the other one exists.",
          "It's the healthiest rivalry in Cheshire."] },
      { id: "npc_tarporley_shop", x: 33, y: 18, dir: "left", sprite: "npc_shopkeep", behaviour: "wander", radius: 2,
        say: ["Bow windows. Georgian. Wonderful for displaying things and hopeless for keeping heat in."] },
      { id: "npc_tarporley_hound_kid", x: 39, y: 21, dir: "down", sprite: "npc_kid", behaviour: "still",
        say: ["Two horses gone from the Tilstone yard and not a gate touched.",
          "Dad says that means paperwork. I said paperwork can't ride a horse and he said give it a year."] },
      { id: "npc_tarporley_dog", x: 34, y: 21, dir: "down", sprite: "dog", behaviour: "wander", radius: 3,
        say: ["A hound the size of a coffee table looks up at you with complete indifference and goes back to sleep."] },
      { id: "npc_tarporley_vex_watch", x: 24, y: 21, dir: "up", sprite: "npc_walker", behaviour: "still", cond: "chapter >= 8 && !choice_vex",
        say: ["Hooded girl came through on the A49 at first light heading for the crag.", "Wouldn't take a lift. Wouldn't take a word, either."] }
    ],
    triggers: [
      { x: 21, y: 33, w: 3, h: 1, script: "nw_tarporley_south_gate", once: "tarporley_south_gate" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("tarporley_care", W.builtin("care_centre", {
    name: "Tarporley Care Centre", region: "west", dialogue: "town_tarporley", music: "town_chester",
    warps: NW.exit(7, 11, "tarporley", 36, 16, "down"),
    npcs: [
      { id: "npc_tarporley_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Sandstone Trail brings us three sprained ankles a week and one person who has walked from Frodsham without water."] },
      { id: "npc_tarporley_care_1", x: 2, y: 5, dir: "right", sprite: "npc_walker", behaviour: "still",
        say: ["Triage here runs off the same system as everywhere.", "It's very good. It has never once been wrong with me. I don't know why that bothers me."] }
    ]
  }));
  W.defineMap("tarporley_mart", W.builtin("shop", {
    name: "Tarporley Mart", region: "west", dialogue: "town_tarporley", music: "town_chester",
    shop: "shop_tarporley",
    warps: NW.exit(6, 9, "tarporley", 23, 16, "down"),
    npcs: [
      { id: "npc_tarporley_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_tarporley",
        say: ["Capsules, salves, and a shelf of things for hedges that nobody but Cadoc buys."] }
    ],
    items: [{ x: 12, y: 2, item: "capsule_kernel", n: 2, flag: "item_tarporley_mart_1" }]
  }));
  W.defineMap("tarporley_inn", W.builtin("pub", {
    name: "The Swan", region: "west", dialogue: "town_tarporley", music: "town_chester",
    warps: NW.exit(6, 11, "tarporley", 9, 16, "down"),
    npcs: [
      { id: "npc_tarporley_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed",
        say: ["Room's up the crooked stair. Everything here is up a crooked stair, including the prices."] },
      { id: "npc_tarporley_pub_1", x: 9, y: 5, dir: "left", sprite: "npc_farmer", behaviour: "still",
        say: ["Hunt's been social since 2005 and argumentative since 1745.",
          "Come for the horses, stay because you can't get out of the car park."] },
      { id: "npc_tarporley_pub_2", x: 4, y: 8, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Trail passport, six stamps, and a pint at the end of each one.", "It's a pilgrimage with better signage."] }
    ]
  }));
  W.defineMap("tarporley_church", W.builtin("church", {
    name: "St Helen's", region: "west", dialogue: "town_tarporley", music: "town_chester",
    warps: NW.exit(6, 13, "tarporley", 10, 31, "down"),
    npcs: [
      { id: "npc_tarporley_verger", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["There's a hunt window. There is always a hunt window.",
          "And under it, a memorial to a hedge-layer, which I think is the better trade and the worse window."] }
    ],
    items: [{ x: 1, y: 11, item: "capsule_basic", n: 3, hidden: true, flag: "item_tarporley_church_1" }]
  }));

  // Cadoc's yard — a walled hedge-laying ground with stools, stakes, binders
  const yd = B.canvas(24, 22, "+");
  yd.box("g", 0, 0, 24, 22, "f");
  yd.fill("g", 2, 2, 20, 5, ".");
  yd.fill("g", 3, 3, 18, 1, "h");
  yd.fill("g", 3, 5, 18, 1, "i");
  yd.fill("g", 2, 9, 8, 4, '"');
  yd.set("g", 4, 10, "{"); yd.set("g", 8, 11, "{");
  yd.fill("g", 14, 9, 8, 5, ".");
  B.trees(yd, "cad-y", 6, 14, 9, 8, 5, "T", "y", ["."]);
  yd.set("g", 3, 15, "\\"); yd.set("g", 5, 15, "\\"); yd.set("g", 7, 15, "`");
  yd.set("g", 18, 16, "`"); yd.set("g", 20, 16, "\\");
  yd.set("g", 12, 8, "N");
  yd.set("g", 11, 20, "D"); yd.set("g", 12, 20, "D");
  yd.fill("g", 11, 18, 2, 2, "+");
  yd.set("g", 2, 19, "H"); yd.set("g", 21, 3, "M");
  NW.defTown("tarporley_cadoc_yard", {
    name: "Cadoc's Yard", region: "west", music: "town_chester", ambience: "town", dialogue: "town_tarporley",
    outdoor: true, spawnPoint: { x: 11, y: 19 },
    encounters: { grass: "tarporley_grass" },
    warps: NW.exit(11, 21, "tarporley", 24, 23, "down"),
    signs: [
      { x: 12, y: 8, text: ["THE CHESHIRE STYLE", "Stems cut seven-eighths through and bent along the line. Stakes every eighteen inches. Binders woven along the top.",
        "It looks like an injury for a season and then it is a wall you cannot get a bullock through."] }
    ],
    items: [
      { x: 20, y: 20, item: "timber_oak", n: 3, flag: "item_tarporley_cadoc_yard_1" },
      { x: 3, y: 20, item: "tm_hedge_lay", n: 1, hidden: true, flag: "item_tarporley_cadoc_yard_2" }
    ],
    npcs: [
      { id: "npc_tarporley_cadoc_yard", x: 12, y: 6, dir: "down", sprite: "npc_farmer", behaviour: "still", trainer: "tr_tarporley_2", sight: 0, script: "nw_cadoc_contest" },
      { id: "npc_tarporley_apprentice", x: 6, y: 8, dir: "right", sprite: "npc_kid", behaviour: "still",
        say: ["He's teaching me the Cheshire style. Six months in I can do eleven feet a day.",
          "He does forty and complains the whole time."] }
    ]
  }, yd, NW.town());

  // the hunt kennels
  const kn = NW.room(18, 14, ";", "#");
  kn.fill("g", 1, 1, 16, 1, "W");
  kn.fill("g", 2, 3, 14, 1, "|");
  kn.fill("g", 2, 6, 14, 1, "|");
  kn.fill("g", 2, 9, 14, 1, "|");
  kn.set("g", 3, 11, "t"); kn.set("g", 4, 11, "c");
  kn.set("g", 14, 11, "S");
  NW.doorway(kn, 8, 13, "D");
  NW.defIn("tarporley_hunt_kennels", {
    name: "Tarporley Kennels", region: "west", music: "town_chester", ambience: "town", dialogue: "town_tarporley",
    spawnPoint: { x: 8, y: 12 },
    warps: NW.exit(8, 13, "tarporley", 37, 28, "down"),
    encounters: { grass: null },
    npcs: [
      { id: "npc_tarporley_kennelman", x: 3, y: 10, dir: "right", sprite: "npc_farmer", behaviour: "still",
        say: ["Forty hounds and they answer to their names, in order, in one breath.",
          "Try it with forty of anything else and see how you get on."] },
      { id: "npc_tarporley_hound_1", x: 8, y: 5, dir: "down", sprite: "dog", behaviour: "wander", radius: 2,
        say: ["Hornhound. Not a dog, technically. Nobody here is interested in the technically."] }
    ],
    items: [{ x: 15, y: 2, item: "salve", n: 3, flag: "item_tarporley_kennels_1" }]
  }, kn, NW.inside());

  const homes = [
    { id: "tarporley_house_1", tx: 35, ty: 34, name: "High Street Cottage",
      npc: { id: "npc_tarporley_h1", sprite: "npc_granny", say: ["Sixty-one years on this street and I have watched the road get louder and the shops get nicer.", "I would take the shops back for the quiet, and I would like that minuted."] } },
    { id: "tarporley_house_2", tx: 41, ty: 34, name: "High Street Cottage",
      npc: { id: "npc_tarporley_h2", sprite: "npc_dev", say: ["I work for a company in Reading from a bedroom in Tarporley and I have never met anyone I work with.", "It's fine. It's genuinely fine. I say that a lot."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "west", dialogue: "town_tarporley", music: "town_chester",
      warps: NW.exit(5, 9, "tarporley", hh.tx, hh.ty, "down"),
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }

  // =====================================================================
  // R27 — Bunbury & the Shropshire Union: locks, a watermill, still water
  // =====================================================================
  const r27 = B.canvas(40, 44, ",");
  B.frame(r27, "T", 1);
  for (let x = 0; x < 40; x++) r27.set("o", x, 0, "y");
  r27.fill("g", 20, 0, 3, 2, "v");
  r27.fill("g", 20, 42, 3, 2, "v");
  r27.fill("g", 1, 1, 38, 42, ".");
  // the cut, running down the map with the Bunbury staircase in the middle
  r27.fill("g", 16, 2, 4, 40, "~");
  r27.fill("g", 13, 2, 3, 40, "t");
  r27.fill("g", 20, 2, 3, 40, "t");
  r27.set("g", 16, 18, "K"); r27.set("g", 19, 18, "K");
  r27.set("g", 16, 21, "K"); r27.set("g", 19, 21, "K");
  r27.fill("g", 16, 19, 4, 2, "e");
  r27.fill("g", 13, 12, 10, 1, "x");
  r27.fill("g", 13, 33, 10, 1, "x");
  r27.set("g", 17, 8, "J"); r27.set("g", 18, 38, "J");
  // the watermill and the mill pool at the bottom of the flight
  r27.fill("g", 24, 22, 12, 10, ".");
  B.house(r27, { x: 25, y: 23, w: 10, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4 });
  r27.set("g", 24, 26, "Z");
  r27.fill("g", 26, 30, 8, 3, "~");
  r27.set("g", 30, 31, "Q");
  r27.set("g", 24, 21, "N");
  r27.fill("g", 23, 29, 2, 1, "t");
  // fields and hedgerows either side
  r27.fill("g", 2, 3, 10, 14, "<");
  r27.fill("g", 2, 22, 10, 19, "<");
  r27.fill("g", 25, 3, 13, 16, "<");
  r27.fill("g", 25, 34, 13, 8, "<");
  B.trees(r27, "r27-a", 24, 2, 3, 10, 14, "T", "y", ["<"]);
  B.trees(r27, "r27-b", 26, 2, 22, 10, 19, "B", "b", ["<"]);
  B.trees(r27, "r27-c", 26, 25, 3, 13, 16, "T", "y", ["<"]);
  r27.scatter("g", "r27-berry", "k", 14, 2, 2, 36, 40, ["<"]);
  r27.fill("g", 4, 18, 9, 2, "v");
  r27.fill("g", 23, 8, 10, 2, "v");
  r27.set("g", 12, 10, "S"); r27.set("g", 21, 25, "S"); r27.set("g", 21, 40, "S");
  r27.set("g", 12, 20, "q"); r27.set("g", 23, 36, "I");
  r27.set("g", 14, 6, "Q"); r27.set("g", 22, 30, "Q"); r27.set("g", 15, 41, "Q");
  NW.defLand("route_tarporley_beeston", {
    name: "Bunbury & the Shropshire Union", music: "route_west", ambience: "water", dialogue: "town_tarporley",
    spawnPoint: { x: 21, y: 2 },
    landmark: { name: "Bunbury Staircase", x: 18, y: 20 },
    encounters: { grass: "route_tarporley_beeston_grass", water: "route_tarporley_beeston_water" },
    fishing: "fish_route_tarporley_beeston",
    warps: [].concat(
      NW.edge(20, 0, 3, true, "tarporley", 21, 34, "up"),
      NW.edge(20, 43, 3, true, "beeston_castle", 22, 1, "down")
    ),
    signs: [
      { x: 12, y: 10, text: ["SHROPSHIRE UNION CANAL — Nantwich 8, Chester 12.", "Thomas Telford's, and it shows: it goes where it likes and cuts through what it doesn't."] },
      { x: 21, y: 25, text: ["BUNBURY MILL — corn ground here since the Domesday Book, on and off.",
        "Mostly on. The off bits were the interesting centuries."] },
      { x: 21, y: 40, text: ["BEESTON CASTLE 1/2 MILE.", "The crag is the thing you can see. The well is the thing you can't."] }
    ],
    items: [
      { x: 4, y: 5, item: "capsule_net", n: 3, flag: "item_route_tarporley_beeston_1" },
      { x: 36, y: 40, item: "elixir", n: 2, flag: "item_route_tarporley_beeston_2" },
      { x: 3, y: 39, item: "rod_carbon", n: 1, hidden: true, flag: "item_route_tarporley_beeston_3" }
    ],
    npcs: [
      { id: "npc_r27_idris", x: 21, y: 19, dir: "left", sprite: "npc_boater", behaviour: "still", trainer: "tr_route_tarporley_beeston_1", sight: 3 },
      { id: "npc_r27_non", x: 14, y: 30, dir: "right", sprite: "npc_fisher", behaviour: "still", trainer: "tr_route_tarporley_beeston_2", sight: 3 },
      { id: "npc_r27_miller", x: 26, y: 30, dir: "up", sprite: "npc_farmer", behaviour: "still",
        say: ["Wheel's undershot, the race is silted, and it still grinds forty kilos an hour if you're patient.",
          "Nothing round here has retired properly. Including me."] },
      { id: "npc_r27_boater", x: 14, y: 14, dir: "down", sprite: "npc_boater", behaviour: "path", path: [[14, 14], [14, 30]], pathMode: "pingpong",
        say: ["Two locks in a staircase. You share a chamber with the boat below you and a conversation you didn't want."] }
    ]
  }, r27, NW.land());

  // =====================================================================
  // R28 — Tarvin & Christleton: flat lanes into Chester's canal cutting
  // =====================================================================
  const r28 = B.canvas(56, 30, ",");
  B.frame(r28, "T", 1);
  for (let x = 0; x < 56; x++) r28.set("o", x, 0, "y");
  r28.fill("g", 55, 13, 1, 4, "v");
  r28.fill("g", 0, 13, 1, 4, "v");
  r28.fill("g", 1, 1, 54, 28, ".");
  // the lane, then the canal in a rock cutting at the Chester end
  r28.fill("g", 1, 13, 40, 4, ":");
  r28.fill("g", 38, 8, 4, 14, "~");
  r28.fill("g", 35, 8, 3, 22, "t");
  r28.fill("g", 42, 8, 3, 22, "t");
  r28.fill("g", 45, 6, 10, 8, "c");
  r28.fill("g", 45, 5, 10, 1, "0");
  r28.fill("g", 45, 18, 10, 8, "c");
  r28.fill("g", 45, 26, 10, 1, "0");
  r28.fill("g", 44, 14, 12, 4, "~");
  r28.fill("g", 44, 13, 12, 1, "t");
  r28.fill("g", 44, 18, 12, 1, "t");
  r28.fill("g", 35, 12, 10, 1, "x");
  r28.fill("g", 41, 13, 4, 1, "t");
  r28.fill("g", 52, 9, 4, 5, "t");
  // fields, a church tower and two farms
  r28.fill("g", 2, 2, 30, 10, "<");
  r28.fill("g", 2, 18, 30, 11, "<");
  B.house(r28, { x: 8, y: 4, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 4 });
  r28.fill("g", 8, 9, 9, 1, ":");
  r28.fill("g", 12, 9, 1, 4, ":");
  B.house(r28, { x: 22, y: 21, w: 8, h: 4, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3 });
  r28.fill("g", 22, 25, 8, 1, ":"); r28.fill("g", 25, 17, 1, 8, ":");
  r28.set("g", 20, 5, "p"); r28.fill("g", 19, 6, 3, 4, "c");
  r28.set("g", 20, 10, "v"); r28.fill("g", 19, 10, 1, 1, "C"); r28.fill("g", 21, 10, 1, 1, "C");
  r28.fill("g", 19, 11, 3, 2, ":");
  B.trees(r28, "r28-a", 26, 2, 2, 30, 10, "T", "y", ["<"]);
  B.trees(r28, "r28-b", 26, 2, 18, 30, 11, "B", "b", ["<"]);
  r28.scatter("g", "r28-hedge", "k", 16, 2, 2, 52, 26, ["<"]);
  r28.set("g", 5, 12, "S"); r28.set("g", 33, 12, "S"); r28.set("g", 46, 13, "S");
  r28.set("g", 30, 16, "q"); r28.set("g", 36, 24, "I");
  r28.set("g", 40, 20, "Q"); r28.set("g", 50, 17, "Q");
  NW.defLand("route_tarporley_chester", {
    name: "Tarvin & Christleton", music: "route_west", ambience: "water", dialogue: "town_chester",
    spawnPoint: { x: 54, y: 11 },
    landmark: { name: "The Christleton Cutting", x: 50, y: 15 },
    encounters: { grass: "route_tarporley_chester_grass", water: "route_tarporley_chester_water" },
    warps: [].concat(
      NW.edge(55, 10, 3, false, "tarporley", 1, 17, "right"),
      NW.edge(0, 13, 4, false, "chester", 58, 22, "left")
    ),
    signs: [
      { x: 5, y: 12, text: ["TARVIN — bypassed in 1961 and grateful about it ever since."] },
      { x: 33, y: 12, text: ["CHRISTLETON — the canal goes through the rock here because Telford would not go round.",
        "It took four years and it saved eleven minutes."] },
      { x: 46, y: 13, text: ["CHESTER 1 MILE", "The cutting opens out at the city wall and the wall does not move for anything, including canals."] }
    ],
    items: [
      { x: 4, y: 6, item: "capsule_kernel", n: 3, flag: "item_route_tarporley_chester_1" },
      { x: 53, y: 28, item: "elixir", n: 2, hidden: true, flag: "item_route_tarporley_chester_2" },
      { x: 30, y: 26, item: "blackberry", n: 4, hidden: true, flag: "item_route_tarporley_chester_3" }
    ],
    npcs: [
      { id: "npc_r28_walker", x: 18, y: 15, dir: "left", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Ten flat miles into Chester and the wall arrives all at once, like a full stop."] },
      { id: "npc_r28_boater", x: 44, y: 19, dir: "up", sprite: "npc_boater", behaviour: "still",
        say: ["Cutting's thirty feet of red rock and the noise a boat makes in it is not the noise a boat makes anywhere else."] },
      { id: "npc_r28_farmer", x: 26, y: 26, dir: "up", sprite: "npc_farmer", behaviour: "still",
        say: ["Two horses came through my yard at four in the morning with nobody on them and nobody after them.",
          "Tarporley'll tell you it's paperwork. I know what a frightened horse looks like."] }
    ]
  }, r28, NW.land());
})();
