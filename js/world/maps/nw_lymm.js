// =============================================================
// MonsterQuest v2 — LYMM (region mersey, Ch.10)
// A sandstone cross on a rock in the middle of the road, a dam that
// holds back a Georgian pond, and the Bridgewater going through the
// village on an embankment above the roofs. The dam's sluice has a
// letter in it and the pumps have started answering in log format.
// Includes R21, the Bridgewater towpath under Thelwall.
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
  const c = B.canvas(42, 34, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 42; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 15, 2, 4, "r");
  c.fill("g", 2, 2, 38, 30, ",");

  // the Bridgewater on its embankment across the top
  c.fill("g", 2, 3, 38, 3, "~");
  c.fill("g", 2, 2, 38, 1, "t");
  c.fill("g", 2, 6, 38, 1, "t");
  c.fill("g", 18, 2, 4, 5, "x");
  c.fill("g", 18, 7, 4, 3, "s");
  c.set("g", 10, 4, "J"); c.set("g", 32, 4, "J");
  c.set("g", 26, 6, "Q");
  c.set("g", 17, 6, "N");

  // the village street, the cross on its rock
  c.fill("g", 2, 15, 38, 4, "r");
  c.fill("g", 2, 16, 38, 1, "|");
  c.fill("g", 2, 14, 38, 1, "-");
  c.fill("g", 2, 19, 38, 1, "-");
  c.fill("g", 18, 14, 5, 6, "=");
  c.fill("g", 19, 15, 3, 3, "%");
  c.set("g", 20, 14, "M");
  c.set("g", 23, 19, "N");
  for (let x = 5; x < 40; x += 7) c.set("g", x, 14, "L");
  c.set("g", 8, 19, "O"); c.set("g", 30, 19, "u"); c.set("g", 36, 14, "q");

  // north of the street: shops under the embankment
  c.fill("g", 2, 8, 38, 6, "=");
  B.house(c, { x: 4, y: 9, w: 10, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 3, 12, "N");
  B.house(c, { x: 26, y: 9, w: 11, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: ";" });
  c.set("g", 25, 12, "N");
  c.fill("g", 15, 10, 9, 4, '"');

  // south of the street: the dam path, cottages, the church
  c.fill("g", 2, 20, 38, 12, "=");
  B.house(c, { x: 3, y: 22, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  B.house(c, { x: 11, y: 22, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  c.fill("g", 2, 26, 16, 1, "-");
  c.fill("g", 22, 21, 14, 9, ",");
  c.box("g", 22, 21, 14, 9, "w");
  B.house(c, { x: 25, y: 22, w: 8, h: 6, rh: 2, roof: "p", wall: "c", win: "C", door: "v", doorX: 3 });
  c.scatter("g", "lymm-graves", "n", 10, 23, 23, 12, 6, [","]);
  c.set("g", 28, 21, "g");
  c.fill("g", 28, 28, 1, 2, "_");
  c.set("g", 21, 25, "N");
  // the way down to the dam
  c.fill("g", 8, 27, 3, 5, "s");
  c.set("g", 11, 30, "N");
  c.fill("g", 2, 30, 6, 2, '"');
  c.fill("g", 36, 20, 4, 12, '"');
  B.trees(c, "lymm-s", 12, 36, 20, 4, 12, "T", "y", ['"']);

  W.defineMap("lymm", {
    name: "Lymm", region: "mersey", outdoor: true, music: "town_warrington", weatherZone: "mersey",
    ambience: "town", dialogue: "town_lymm",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 25, y: 17 },
    healPoint: { x: 9, y: 14 },
    landmark: { name: "Lymm Cross", x: 20, y: 15 },
    encounters: { grass: "lymm_grass", water: null },
    warps: [].concat(
      NW.edge(0, 15, 4, false, "route_lymm_warrington", 54, 17, "left"),
      NW.exit(8, 13, "lymm_care", 7, 10, "up"),
      NW.exit(31, 13, "lymm_mart", 6, 8, "up"),
      [
        { x: 28, y: 27, to: "lymm_church", tx: 6, ty: 12, dir: "up", kind: "door" },
        { x: 5, y: 25, to: "lymm_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 13, y: 25, to: "lymm_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 9, y: 32, to: "lymm_dam", tx: 24, ty: 3, dir: "down", kind: "stairs" },
        { x: 10, y: 32, to: "lymm_dam", tx: 24, ty: 3, dir: "down", kind: "stairs" },
        { x: 20, y: 32, to: "route_budworth_lymm", tx: 15, ty: 1, dir: "down", kind: "edge" }
      ]
    ),
    signs: [
      { x: 17, y: 6, text: ["BRIDGEWATER CANAL — the first true canal in England, and it goes past your bedroom window on a bank.",
        "Boats above the chimneys. You get used to it in about a fortnight."] },
      { x: 23, y: 19, text: ["LYMM CROSS", "Seventeenth century, on a sandstone outcrop, in the middle of a road, with stocks beside it.",
        "The stocks are original. The road is not."] },
      { x: 3, y: 12, text: ["CARE CENTRE — LYMM", "A small one. Two beds, one nurse, and an extremely good kettle."] },
      { x: 25, y: 12, text: ["LYMM VILLAGE STORES — papers, bait, and a noticeboard about the boat rally."] },
      { x: 21, y: 25, text: ["ST MARY'S — burnt down in 1852, rebuilt bigger, which is the Victorian answer to everything."] },
      { x: 11, y: 30, text: ["LYMM DAM — footpath, all round, one mile.", "The sluice is at the far end. Do not climb on it. People climb on it."] }
    ],
    items: [
      { x: 3, y: 31, item: "capsule_net", n: 3, flag: "item_lymm_1" },
      { x: 38, y: 31, item: "elixir", n: 2, flag: "item_lymm_2" },
      { x: 16, y: 12, item: "blackberry", n: 4, hidden: true, flag: "item_lymm_3" },
      { x: 39, y: 4, item: "roe", n: 3, hidden: true, flag: "item_lymm_4" }
    ],
    catGaps: [
      { x: 19, y: 20, item: "cat_token_11", n: 1, flag: "catgap_lymm_1",
        say: "MEADOW gets in behind the stocks, where nobody has swept since the seventeenth century, and comes out with a token and a great deal of dust." }
    ],
    restPoints: [{ x: 25, y: 20, flag: "bigboy_sat_lymm" }],
    npcs: [
      { id: "npc_lymm_bryn", x: 12, y: 28, dir: "down", sprite: "npc_ranger", behaviour: "still", trainer: "tr_lymm_1", sight: 0, script: "nw_lymm_bryn" },
      { id: "npc_lymm_rhian", x: 27, y: 18, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_lymm_2", sight: 0, script: "nw_lymm_rhian" },
      { id: "npc_lymm_cook", x: 24, y: 7, dir: "down", sprite: "npc_boater", behaviour: "still",
        say: ["I cook on a boat. Sixty feet of galley and a hob that has never been level in its life.",
          "Best kitchen I've had and I've had four with walls."] },
      { id: "npc_lymm_walker", x: 33, y: 17, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[33, 17], [24, 17], [24, 20], [33, 20]], pathMode: "loop",
        say: ["Cross, dam, canal, chippy. That's Lymm. In that order and then again the other way."] },
      { id: "npc_lymm_kid", x: 15, y: 20, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["My dad works at the pumping station and last week the pumps sent him a message.",
          "Not an alarm. A message. It said SEV COLON LOW."] },
      { id: "npc_lymm_pumps", x: 6, y: 30, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "nw_lymm_pumps",
        cond: "postgame_open" }
    ],
    triggers: [
      { x: 19, y: 18, w: 3, h: 1, script: "nw_lymm_arrival", once: "lymm_arrival", cond: "chapter >= 10" }
    ]
  });

  W.defineMap("lymm_care", W.builtin("care_centre", {
    name: "Lymm Care Centre", region: "mersey", dialogue: "town_lymm", music: "town_warrington",
    warps: NW.exit(7, 11, "lymm", 8, 14, "down"),
    npcs: [
      { id: "npc_lymm_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Two beds and a kettle and the same triage system as the big ones.", "It has never sent me a patient who didn't need to come. Not once in four years."] }
    ]
  }));
  W.defineMap("lymm_mart", W.builtin("shop", {
    name: "Lymm Village Stores", region: "mersey", dialogue: "town_lymm", music: "town_warrington",
    shop: "shop_lymm",
    warps: NW.exit(6, 9, "lymm", 31, 14, "down"),
    npcs: [
      { id: "npc_lymm_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_lymm",
        say: ["Bait, capsules, milk, and a lending library of paperbacks nobody has ever returned."] }
    ],
    items: [{ x: 12, y: 2, item: "rod_carbon", n: 1, hidden: true, flag: "item_lymm_mart_1" }]
  }));
  W.defineMap("lymm_church", W.builtin("church", {
    name: "St Mary's Lymm", region: "mersey", dialogue: "town_lymm", music: "town_warrington",
    warps: NW.exit(6, 13, "lymm", 28, 28, "down"),
    npcs: [
      { id: "npc_lymm_verger", x: 6, y: 2, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Burnt in 1852. Rebuilt by 1854. Two years, by hand, on a rock above a lake.",
          "We took four months last year to agree a colour for the noticeboard."] }
    ]
  }));
  const lhomes = [
    { id: "lymm_house_1", tx: 5, ty: 26, sprite: "npc_granny",
      say: ["Sixty years under a canal. When the embankment leaked in '71 we had a boat in the back garden.", "Not a metaphor. An actual boat. It was in the paper."] },
    { id: "lymm_house_2", tx: 13, ty: 26, sprite: "npc_dev",
      say: ["I moved here for the commute and stayed for the dam.", "You can walk round it in twenty minutes and think an entire problem through, start to finish."] }
  ];
  for (let i = 0; i < lhomes.length; i++) {
    const hh = lhomes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: "Canal Cottage", region: "mersey", dialogue: "town_lymm", music: "town_warrington",
      warps: NW.exit(5, 9, "lymm", hh.tx, hh.ty, "down"),
      npcs: [{ id: "npc_" + hh.id, x: 6, y: 3, dir: "down", sprite: hh.sprite, behaviour: "still", say: hh.say }]
    }));
  }

  // ---------------------------------------------------------- the dam -----
  const d = B.canvas(48, 36, ",");
  B.frame(d, "T", 1);
  for (let x = 0; x < 48; x++) d.set("o", x, 0, "y");
  d.fill("g", 23, 0, 3, 3, "v");
  d.fill("g", 1, 1, 46, 34, ".");
  // the water
  d.fill("g", 6, 6, 36, 22, "!");
  d.fill("g", 5, 5, 38, 1, "e"); d.fill("g", 5, 28, 38, 1, "e");
  d.fill("g", 5, 6, 1, 22, "e"); d.fill("g", 42, 6, 1, 22, "e");
  // the footpath all the way round
  d.fill("g", 3, 3, 42, 2, "v");
  d.fill("g", 3, 29, 42, 2, "v");
  d.fill("g", 3, 3, 2, 28, "v");
  d.fill("g", 43, 3, 2, 28, "v");
  d.fill("g", 23, 3, 3, 2, "v");
  // the dam wall and the sluice at the south end
  d.fill("g", 6, 26, 36, 2, "%");
  d.fill("g", 6, 28, 36, 1, "%");
  d.fill("g", 20, 26, 8, 3, "5");
  d.set("g", 23, 27, "K"); d.set("g", 25, 27, "K");
  d.set("g", 19, 29, "N");
  d.fill("g", 22, 29, 4, 2, "v");
  // the pumping station
  B.house(d, { x: 33, y: 31, w: 8, h: 4, rh: 1, roof: "1", wall: "#", win: "W", door: "D", doorX: 3 });
  d.fill("g", 32, 31, 1, 4, "v");
  d.set("g", 31, 34, "N");
  // fishing pegs, benches, the woods
  d.set("g", 8, 5, "Q"); d.set("g", 20, 5, "Q"); d.set("g", 36, 5, "Q");
  d.set("g", 8, 29, "Q"); d.set("g", 40, 20, "Q"); d.set("g", 4, 16, "Q");
  d.set("g", 10, 4, "H"); d.set("g", 30, 30, "H"); d.set("g", 44, 14, "H");
  d.fill("g", 1, 6, 2, 22, '"');
  d.fill("g", 45, 6, 2, 22, '"');
  B.trees(d, "dam-w", 16, 1, 6, 2, 22, "T", "y", ['"']);
  B.trees(d, "dam-e", 16, 45, 6, 2, 22, "T", "y", ['"']);
  d.set("g", 24, 5, "N");
  d.set("g", 12, 30, "I");
  NW.defLand("lymm_dam", {
    name: "Lymm Dam", region: "mersey", weatherZone: "mersey", music: "town_warrington", ambience: "water",
    dialogue: "town_lymm",
    spawnPoint: { x: 24, y: 3 },
    landmark: { name: "Lymm Dam", x: 24, y: 17 },
    encounters: { grass: "lymm_dam_grass", water: "lymm_dam_water" },
    fishing: "fish_lymm_dam",
    warps: NW.edge(23, 0, 3, true, "lymm", 9, 31, "up"),
    signs: [
      { x: 24, y: 5, text: ["LYMM DAM — made in 1824 to carry a new road, and it has been a lake ever since by accident.",
        "Circular walk, one mile. Deepest point forty feet. Please do not swim; people swim."] },
      { x: 19, y: 29, text: ["THE SLUICE — MECHANISM UNDER MAINTENANCE.", "There is a folded paper wedged in the gearing that is not a maintenance note.",
        "It is a page of a letter in a nineteenth-century hand, and it is dry."] },
      { x: 31, y: 34, text: ["LYMM PUMPING STATION — UNMANNED.", "TELEMETRY LINK ACTIVE. A green light, and under it a small screen scrolling four lines that repeat."] }
    ],
    items: [
      { x: 2, y: 32, item: "capsule_night", n: 3, flag: "item_lymm_dam_1" },
      { x: 45, y: 33, item: "elixir", n: 2, flag: "item_lymm_dam_2" },
      { x: 46, y: 3, item: "rod_elm", n: 1, hidden: true, flag: "item_lymm_dam_3" },
      { x: 2, y: 3, item: "collectible_6", n: 1, hidden: true, flag: "item_lymm_dam_4" }
    ],
    npcs: [
      { id: "npc_lymm_padraig", x: 9, y: 30, dir: "up", sprite: "npc_fisher", behaviour: "still", trainer: "tr_lymm_dam_1", sight: 4 },
      { id: "npc_lymm_rhian_dam", x: 26, y: 30, dir: "up", sprite: "npc_historian", behaviour: "still", script: "nw_lymm_paint",
        cond: "quest.case_27_lymm_dam_reflection >= 0" },
      { id: "npc_lymm_dam_walker", x: 43, y: 20, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[43, 20], [43, 8]], pathMode: "pingpong",
        say: ["Round in twenty minutes if you don't stop. Nobody doesn't stop."] }
    ],
    triggers: [
      { x: 22, y: 29, w: 4, h: 1, script: "nw_lymm_sluice", once: "lymm_sluice_letter" },
      { x: 20, y: 26, w: 8, h: 1, script: "nw_lymm_dam_night", cond: "time.night && !glitchra_sighting" }
    ]
  }, d, NW.land({ "%": "wall_stone_sandstone", "5": "wall_city_walk", "K": "canal_lock", "H": "bench", "N": "noticeboard", "1": "roof_metal", "#": "wall_brick_red", "W": "window", "D": "door_wood", "I": "picnic_table" }));

  // =====================================================================
  // R21 — the Bridgewater towpath under Thelwall
  // =====================================================================
  const r = B.canvas(56, 30, ",");
  B.frame(r, "T", 1);
  for (let x = 0; x < 56; x++) r.set("o", x, 0, "y");
  r.fill("g", 0, 17, 2, 4, "t"); r.fill("g", 54, 17, 2, 4, "t");
  r.fill("g", 1, 1, 54, 28, ".");
  r.fill("g", 1, 12, 54, 4, "~");
  r.fill("g", 1, 11, 54, 1, "t");
  r.fill("g", 1, 16, 54, 4, "t");
  r.fill("g", 1, 20, 54, 1, "e");
  r.fill("g", 1, 21, 54, 8, "<");
  r.fill("g", 1, 2, 54, 9, "<");
  B.trees(r, "r21-n", 34, 1, 2, 54, 8, "T", "y", ["<"]);
  B.trees(r, "r21-s", 30, 1, 22, 54, 7, "B", "b", ["<"]);
  // the viaduct: a great roaring thing across the whole map
  r.fill("g", 26, 1, 5, 28, "F");
  r.fill("g", 26, 11, 5, 10, "x");
  r.fill("g", 27, 12, 3, 4, "~");
  r.set("g", 26, 9, "N");
  // moorings, a winding hole and a lock
  r.fill("g", 8, 12, 6, 4, "~");
  r.set("g", 10, 13, "J"); r.set("g", 40, 14, "J");
  r.set("g", 18, 12, "K"); r.set("g", 18, 15, "K");
  r.set("g", 6, 11, "Q"); r.set("g", 34, 11, "Q"); r.set("g", 48, 16, "Q");
  r.set("g", 8, 17, "q"); r.set("g", 44, 17, "I");
  r.set("g", 14, 10, "S"); r.set("g", 46, 10, "S");
  r.fill("g", 10, 20, 3, 1, "t"); r.fill("g", 36, 20, 3, 1, "t"); r.fill("g", 48, 20, 3, 1, "t");
  r.fill("g", 0, 17, 2, 4, "t"); r.fill("g", 54, 17, 2, 4, "t");
  r.fill("g", 34, 22, 12, 5, '"');
  r.fill("g", 6, 23, 10, 4, '"');
  NW.defLand("route_lymm_warrington", {
    name: "The Bridgewater Towpath", region: "mersey", weatherZone: "mersey", music: "route_mersey",
    ambience: "water", dialogue: "town_lymm",
    spawnPoint: { x: 53, y: 18 },
    landmark: { name: "Thelwall Viaduct", x: 28, y: 18 },
    encounters: { grass: "route_lymm_warrington_grass", water: "route_lymm_warrington_water" },
    fishing: "fish_lymm_dam",
    warps: [].concat(
      NW.edge(55, 17, 4, false, "lymm", 1, 15, "right"),
      NW.edge(0, 17, 4, false, "warrington", 58, 20, "left")
    ),
    signs: [
      { x: 14, y: 10, text: ["BRIDGEWATER CANAL — RUNCORN 12, MANCHESTER 16.", "No mooring in the winding hole. Somebody moors in the winding hole every single week."] },
      { x: 26, y: 9, text: ["THELWALL VIADUCT — the M6 over the Ship Canal, thirty-six metres up.",
        "It roars. It has roared since 1963. Local birds have adapted their songs to sit above it, which is a real and documented thing."] },
      { x: 46, y: 10, text: ["LYMM 1/2 MILE. WARRINGTON 3.", "The towpath is flat, wet in three places, and the three places move."] }
    ],
    items: [
      { x: 4, y: 26, item: "capsule_net", n: 3, flag: "item_route_lymm_warrington_1" },
      { x: 52, y: 4, item: "elixir", n: 2, flag: "item_route_lymm_warrington_2" },
      { x: 38, y: 25, item: "tonic_spa", n: 1, hidden: true, flag: "item_route_lymm_warrington_3" }
    ],
    npcs: [
      { id: "npc_r21_sian", x: 20, y: 18, dir: "right", sprite: "npc_boater", behaviour: "still", trainer: "tr_route_lymm_warrington_1", sight: 4 },
      { id: "npc_r21_emrys", x: 40, y: 18, dir: "left", sprite: "npc_cyclist", behaviour: "look", radius: 5, trainer: "tr_route_lymm_warrington_2", sight: 5 },
      { id: "npc_r21_drone_watcher", x: 32, y: 17, dir: "up", sprite: "npc_walker", behaviour: "still",
        say: ["Half four, every day, a drone comes down this cut at head height and goes back.",
          "I've waved at it. It has never once waved back and I don't know what I expected."] }
    ]
  }, r, NW.land());
})();
