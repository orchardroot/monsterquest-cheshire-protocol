// =============================================================
// MonsterQuest v2 — THE NORTH-WEST CORNER (region west, Ch.12 & post-game)
// The Shropshire Union running north out of Chester to the Zoo and the
// Port, the flare stacks at Stanlow, the reed marsh at Ince where THE
// STACK takes its cooling water, and Parkgate, where the sea went out in
// 1830 and the town has been politely waiting ever since.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();
  const ZOO = { "[": "zoo_fence", "]": "zoo_enclosure", "{": "zoo_pool", "U": "zoo_sign" };

  // =====================================================================
  // R29a — the Shropshire Union north to the Zoo
  // =====================================================================
  const r29 = B.canvas(40, 44, ",");
  B.frame(r29, "T", 1);
  for (let x = 0; x < 40; x++) r29.set("o", x, 0, "y");
  r29.fill("g", 23, 42, 4, 2, "t");
  r29.fill("g", 18, 0, 4, 2, "t");
  r29.fill("g", 1, 1, 38, 42, ".");
  r29.fill("g", 16, 1, 4, 42, "~");
  r29.fill("g", 13, 1, 3, 42, "t");
  r29.fill("g", 20, 1, 3, 42, "t");
  r29.fill("g", 13, 20, 10, 1, "x");
  r29.set("g", 16, 30, "K"); r29.set("g", 19, 30, "K");
  r29.set("g", 17, 8, "J"); r29.set("g", 18, 36, "J");
  r29.fill("g", 2, 2, 11, 18, "<");
  r29.fill("g", 2, 24, 11, 18, "<");
  r29.fill("g", 24, 2, 14, 16, "<");
  r29.fill("g", 24, 24, 14, 18, "<");
  B.trees(r29, "r29-a", 30, 2, 2, 11, 18, "T", "y", ["<"]);
  B.trees(r29, "r29-b", 30, 24, 24, 14, 18, "B", "b", ["<"]);
  r29.scatter("g", "r29-k", "k", 16, 2, 2, 36, 40, ["<"]);
  r29.fill("g", 24, 19, 14, 4, "a");
  r29.set("g", 12, 10, "S"); r29.set("g", 23, 34, "S"); r29.set("g", 23, 4, "S");
  r29.set("g", 12, 26, "q"); r29.set("g", 24, 14, "I");
  r29.set("g", 15, 14, "Q"); r29.set("g", 20, 26, "Q"); r29.set("g", 15, 40, "Q");
  r29.fill("g", 23, 42, 4, 2, "t");
  r29.fill("g", 18, 0, 4, 2, "t");
  NW.defLand("route_chester_zoo", {
    name: "Shropshire Union North", region: "west", weatherZone: "west", music: "route_west", ambience: "water",
    dialogue: "town_chester",
    spawnPoint: { x: 24, y: 42 },
    landmark: { name: "The Shropshire Union", x: 18, y: 22 },
    encounters: { grass: "route_chester_zoo_grass", water: "route_chester_zoo_water" },
    fishing: "fish_chester_groves",
    warps: [].concat(
      NW.edge(23, 43, 4, true, "chester", 26, 3, "down"),
      NW.edge(18, 0, 4, true, "chester_zoo", 20, 37, "up")
    ),
    signs: [
      { x: 12, y: 10, text: ["SHROPSHIRE UNION CANAL — ELLESMERE PORT 6, CHESTER 2.",
        "Telford's line to the sea, dug so the Midlands could get out without asking Liverpool for permission."] },
      { x: 23, y: 34, text: ["CHESTER 2 MILES.", "The wall comes into view about here and it never stops being ridiculous."] },
      { x: 23, y: 4, text: ["CHESTER ZOO — 1/2 MILE.", "The elephants can be heard from the towpath on a still morning. So, occasionally, can something in Welsh."] }
    ],
    items: [
      { x: 4, y: 6, item: "capsule_root", n: 3, flag: "item_route_chester_zoo_1" },
      { x: 35, y: 40, item: "elixir", n: 2, hidden: true, flag: "item_route_chester_zoo_2" }
    ],
    npcs: [
      { id: "npc_r29_boater", x: 21, y: 18, dir: "left", sprite: "npc_boater", behaviour: "path", path: [[21, 18], [21, 32]], pathMode: "pingpong",
        say: ["Six miles to the sea locks and every one of them straighter than the last."] },
      { id: "npc_r29_birder", x: 26, y: 21, dir: "down", sprite: "npc_birder", behaviour: "still",
        say: ["Reed bed here holds three warbler species and, since March, something with a rotor."] }
    ]
  }, r29, NW.land());

  // =====================================================================
  // CHESTER ZOO
  // =====================================================================
  const z = B.canvas(48, 40, "=");
  B.frame(z, "[", 1);
  z.fill("g", 19, 38, 3, 2, "=");
  z.fill("g", 1, 1, 46, 38, "=");
  z.fill("g", 46, 18, 2, 3, "=");
  // the spine path and two loops
  z.fill("g", 19, 2, 3, 36, "=");
  z.fill("g", 4, 12, 40, 2, "=");
  z.fill("g", 4, 26, 40, 2, "=");
  z.fill("g", 4, 12, 2, 16, "=");
  z.fill("g", 42, 12, 2, 16, "=");
  // enclosures
  z.fill("g", 6, 3, 12, 8, "]"); z.box("g", 6, 3, 12, 8, "[");
  z.fill("g", 24, 3, 18, 8, "]"); z.box("g", 24, 3, 18, 8, "[");
  z.fill("g", 6, 16, 12, 9, "]"); z.box("g", 6, 16, 12, 9, "[");
  z.fill("g", 24, 16, 18, 9, "]"); z.box("g", 24, 16, 18, 9, "[");
  z.fill("g", 6, 29, 14, 8, "]"); z.box("g", 6, 29, 14, 8, "[");
  z.fill("g", 26, 29, 16, 8, "{"); z.box("g", 26, 29, 16, 8, "[");
  z.fill("g", 28, 31, 12, 4, "{");
  z.set("g", 11, 11, "U"); z.set("g", 32, 11, "U"); z.set("g", 11, 25, "U");
  z.set("g", 32, 25, "U"); z.set("g", 12, 28, "U"); z.set("g", 33, 28, "U");
  // the keeper's hut and the penguin pool gate
  B.house(z, { x: 34, y: 12, w: 7, h: 3, rh: 1, roof: "1", wall: "#", win: "W", door: "D", doorX: 3 });
  z.fill("g", 33, 29, 2, 8, "=");
  z.set("g", 34, 29, "[");
  z.set("g", 33, 28, "U");
  z.fill("g", 20, 29, 6, 8, "=");
  z.fill("g", 2, 2, 3, 36, '"');
  B.trees(z, "zoo-t", 14, 2, 2, 3, 36, "T", "y", ['"']);
  NW.defLand("chester_zoo", {
    name: "Chester Zoo", region: "west", weatherZone: "west", music: "town_zoo", ambience: "town",
    dialogue: "town_chester_zoo",
    spawnPoint: { x: 20, y: 37 },
    landmark: { name: "Chester Zoo", x: 20, y: 20 },
    encounters: { grass: "chester_zoo_grass", water: "chester_zoo_water" },
    warps: [].concat(
      NW.edge(19, 39, 3, true, "route_chester_zoo", 19, 1, "down"),
      NW.edge(47, 18, 3, false, "route_zoo_ellesmere", 1, 14, "right"),
      [
        { x: 37, y: 14, to: "chester_zoo_keeper_hut", tx: 8, ty: 10, dir: "up", kind: "door" },
        { x: 34, y: 30, to: "chester_zoo_penguins", tx: 16, ty: 24, dir: "up", kind: "gate" }
      ]
    ),
    signs: [
      { x: 11, y: 11, text: ["GIRAFFES — please do not feed. They will eat a Cheshire hedge if allowed and one of them has."] },
      { x: 32, y: 11, text: ["ELEPHANTS — the herd is related. They have opinions about which of them goes first and they are not ours to settle."] },
      { x: 11, y: 25, text: ["RED PANDAS — asleep. Always asleep. Have been asleep since 1976 as far as any visitor can tell."] },
      { x: 32, y: 25, text: ["THE ISLANDS — six hectares, one boat, a great deal of bamboo."] },
      { x: 12, y: 28, text: ["ZOO MEMBERSHIP — annual, transferable, and the single best-value thing in Cheshire."] },
      { x: 33, y: 28, text: ["PENGUIN POOL — HEAD COUNT 38.", "It says 39 underneath in the printed part, and somebody has changed the 9 to an 8 in biro."] }
    ],
    items: [
      { x: 45, y: 3, item: "capsule_friend", n: 3, flag: "item_chester_zoo_1" },
      { x: 3, y: 37, item: "elixir", n: 3, hidden: true, flag: "item_chester_zoo_2" },
      { x: 45, y: 37, item: "cream", n: 4, hidden: true, flag: "item_chester_zoo_3" }
    ],
    npcs: [
      { id: "npc_zoo_ama", x: 20, y: 28, dir: "down", sprite: "npc_ranger", behaviour: "still", trainer: "tr_chester_zoo_1", sight: 0, script: "nw_zoo_ama" },
      { id: "npc_zoo_visitor", x: 24, y: 13, dir: "up", sprite: "npc_tourist", behaviour: "wander", radius: 3,
        say: ["Twenty-seven thousand animals and my daughter has spent forty minutes watching a goat."] },
      { id: "npc_zoo_keeper2", x: 8, y: 13, dir: "down", sprite: "npc_ranger", behaviour: "still",
        say: ["Conservation is mostly counting. Count them in, count them out, and write down the number you did not want."] }
    ],
    triggers: [
      { x: 19, y: 34, w: 3, h: 1, script: "nw_zoo_arrival", once: "zoo_arrival" }
    ]
  }, z, NW.land(ZOO));

  const kh = NW.room(16, 12, ",", "#");
  kh.fill("g", 1, 1, 14, 1, "W");
  kh.fill("g", 2, 3, 5, 1, "k"); kh.fill("g", 9, 3, 5, 1, "k");
  kh.fill("g", 3, 6, 4, 1, "t"); kh.set("g", 4, 7, "c");
  kh.fill("g", 10, 6, 4, 1, "N");
  kh.set("g", 13, 9, "g");
  NW.doorway(kh, 7, 11, "D");
  NW.defIn("chester_zoo_keeper_hut", {
    name: "Keeper's Hut", region: "west", music: "town_zoo", ambience: "town", dialogue: "town_chester_zoo",
    spawnPoint: { x: 8, y: 10 },
    warps: NW.exit(7, 11, "chester_zoo", 37, 15, "down"),
    encounters: { grass: null },
    signs: [
      { x: 11, y: 6, text: ["HEAD COUNT BOARD — PENGUINS: 38 / 39.", "Under it, in a different hand: 'SHE ANSWERS TO WELSH. SHE ONLY ANSWERS TO WELSH.'"] }
    ],
    items: [{ x: 14, y: 2, item: "zoo_membership", n: 1, hidden: true, flag: "item_zoo_keeper_hut_1" }],
    npcs: [
      { id: "npc_zoo_hut_keeper", x: 4, y: 6, dir: "right", sprite: "npc_ranger", behaviour: "still",
        say: ["Thirty-eight in the pool and thirty-nine on the register and I have counted eleven times."] }
    ]
  }, kh, NW.inside());

  const pg = B.canvas(34, 26, "{");
  B.frame(pg, "[", 1);
  pg.fill("g", 1, 1, 32, 24, "{");
  pg.fill("g", 2, 20, 30, 5, "]");
  pg.fill("g", 14, 22, 6, 4, "]");
  pg.fill("g", 2, 2, 6, 6, "]"); pg.fill("g", 26, 2, 6, 6, "]");
  pg.fill("g", 2, 12, 4, 6, "]"); pg.fill("g", 28, 12, 4, 6, "]");
  pg.set("g", 16, 21, "U");
  pg.set("g", 16, 25, "["); pg.set("g", 17, 25, "[");
  pg.fill("g", 16, 24, 2, 1, "]");
  NW.defLand("chester_zoo_penguins", {
    name: "The Penguin Pool", region: "west", weatherZone: "west", music: "town_zoo", ambience: "water",
    dialogue: "town_chester_zoo",
    spawnPoint: { x: 16, y: 24 },
    landmark: { name: "The Penguin Pool", x: 16, y: 12 },
    encounters: { grass: null, water: "chester_zoo_water" },
    warps: [
      { x: 16, y: 25, to: "chester_zoo", tx: 34, ty: 31, dir: "down", kind: "gate" },
      { x: 17, y: 25, to: "chester_zoo", tx: 34, ty: 31, dir: "down", kind: "gate" }
    ],
    signs: [
      { x: 16, y: 21, text: ["HUMBOLDT PENGUINS", "Pen gwyn: 'white head'. The Welsh named them, or named something else and the name went walkabout.",
        "Either way, one of these answers to it and thirty-eight do not."] }
    ],
    items: [{ x: 31, y: 22, item: "roe", n: 5, hidden: true, flag: "item_zoo_penguins_1" }],
    npcs: [
      { id: "npc_zoo_pengwyn", x: 16, y: 20, dir: "down", sprite: "npc_ranger", behaviour: "still", script: "nw_zoo_pengwyn",
        cond: "penguin_case || postgame_open" }
    ]
  }, pg, NW.land(ZOO));

  // =====================================================================
  // R29b — the canal on to the Port
  // =====================================================================
  const r30 = B.canvas(40, 28, ",");
  B.frame(r30, "T", 1);
  r30.fill("g", 0, 13, 2, 3, "t"); r30.fill("g", 38, 13, 2, 3, "t");
  r30.fill("g", 1, 1, 38, 26, ".");
  r30.fill("g", 1, 10, 38, 4, "~");
  r30.fill("g", 1, 9, 38, 1, "t");
  r30.fill("g", 1, 14, 38, 3, "t");
  r30.fill("g", 2, 2, 36, 7, "<");
  r30.fill("g", 2, 18, 36, 8, "<");
  B.trees(r30, "r30-a", 26, 2, 2, 36, 7, "T", "y", ["<"]);
  B.trees(r30, "r30-b", 22, 2, 18, 36, 8, "B", "b", ["<"]);
  r30.fill("g", 6, 19, 12, 4, "a");
  r30.fill("g", 24, 19, 12, 4, "a");
  r30.set("g", 10, 8, "S"); r30.set("g", 28, 17, "S");
  r30.set("g", 8, 15, "q"); r30.set("g", 30, 15, "I");
  r30.set("g", 14, 9, "Q"); r30.set("g", 26, 14, "Q");
  r30.set("g", 20, 11, "J");
  r30.fill("g", 0, 13, 2, 3, "t"); r30.fill("g", 38, 13, 2, 3, "t");
  NW.defLand("route_zoo_ellesmere", {
    name: "The Sea Locks Line", region: "west", weatherZone: "west", music: "route_west", ambience: "water",
    dialogue: "town_ellesmere_port",
    spawnPoint: { x: 2, y: 14 },
    landmark: { name: "The Sea Locks Line", x: 20, y: 14 },
    encounters: { grass: "route_zoo_ellesmere_grass", water: "route_zoo_ellesmere_water" },
    warps: [].concat(
      NW.edge(0, 13, 3, false, "chester_zoo", 46, 18, "left"),
      NW.edge(39, 13, 3, false, "ellesmere_port", 1, 20, "right")
    ),
    signs: [
      { x: 10, y: 8, text: ["ELLESMERE PORT 2. The flare stacks are visible from here at night and from space, apparently."] },
      { x: 28, y: 17, text: ["MIND THE REED BED — nesting season March to August.", "Somebody has added a second sign about drones. It is not an official sign."] }
    ],
    items: [
      { x: 4, y: 4, item: "elixir", n: 2, flag: "item_route_zoo_ellesmere_1" },
      { x: 36, y: 24, item: "capsule_net", n: 4, hidden: true, flag: "item_route_zoo_ellesmere_2" }
    ],
    npcs: [
      { id: "npc_r30_boater", x: 22, y: 15, dir: "up", sprite: "npc_boater", behaviour: "wander", radius: 3,
        say: ["Sea locks at the end. Salt water on the far side of a gate and fresh on this one, and only a gate between them."] }
    ]
  }, r30, NW.land());

  // =====================================================================
  // ELLESMERE PORT
  // =====================================================================
  const e = B.canvas(52, 40, ".");
  B.frame(e, "T", 1);
  for (let x = 0; x < 52; x++) e.set("o", x, 0, "y");
  e.fill("g", 0, 19, 2, 3, "t");
  e.fill("g", 2, 2, 48, 36, ",");
  e.fill("g", 50, 12, 2, 4, "r");
  e.fill("g", 50, 24, 2, 3, "r");
  // the basin
  e.fill("g", 6, 8, 34, 12, "~");
  e.fill("g", 5, 7, 36, 1, "t"); e.fill("g", 5, 20, 36, 1, "t");
  e.fill("g", 5, 8, 1, 12, "t"); e.fill("g", 40, 8, 1, 12, "t");
  e.fill("g", 18, 8, 3, 12, "j");
  e.set("g", 10, 10, "J"); e.set("g", 14, 16, "J"); e.set("g", 28, 11, "J"); e.set("g", 34, 17, "J");
  e.set("g", 24, 7, "K"); e.set("g", 24, 20, "K");
  // the museum sheds along the north
  for (let i = 0; i < 3; i++) B.house(e, { x: 6 + i * 12, y: 2, w: 10, h: 4, rh: 1, roof: "1", wall: "#", win: "W", door: "S", doorX: 4 });
  e.fill("g", 5, 6, 36, 1, "=");
  e.set("g", 12, 6, "N");
  e.set("g", 41, 5, "N");
  // the refinery, east: pipes and a flare
  e.fill("g", 42, 2, 8, 20, "2");
  e.fill("g", 43, 4, 6, 3, "0"); e.fill("g", 43, 10, 6, 3, "0");
  e.set("g", 45, 2, "3"); e.set("g", 48, 2, "3");
  e.fill("g", 41, 22, 9, 1, "F");
  // the town: outlet, station, care, streets
  e.fill("g", 2, 23, 48, 15, "=");
  e.fill("g", 2, 27, 48, 3, "r");
  e.fill("g", 2, 28, 48, 1, "|");
  e.fill("g", 2, 26, 48, 1, "-");
  e.fill("g", 2, 30, 48, 1, "-");
  B.house(e, { x: 4, y: 31, w: 12, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 5, over: ";" });
  e.set("g", 3, 34, "N");
  B.house(e, { x: 20, y: 31, w: 10, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: ";" });
  e.set("g", 19, 34, "N");
  B.house(e, { x: 34, y: 31, w: 14, h: 5, rh: 2, roof: "1", wall: "0", win: "V", door: "S", doorX: 6, over: ";" });
  e.set("g", 33, 34, "N");
  e.fill("g", 4, 36, 44, 1, "-");
  e.fill("g", 4, 23, 44, 1, "4");
  e.fill("g", 4, 24, 44, 1, "6");
  e.set("g", 45, 22, "N");
  W.defineMap("ellesmere_port", {
    name: "Ellesmere Port", region: "west", outdoor: true, music: "town_zoo", weatherZone: "west",
    ambience: "industrial", dialogue: "town_ellesmere_port",
    legend: T, layers: e.layers(),
    spawnPoint: { x: 24, y: 28 },
    healPoint: { x: 25, y: 30 },
    landmark: { name: "Ellesmere Port", x: 24, y: 14 },
    encounters: { grass: "ellesmere_port_grass", water: "ellesmere_port_water" },
    fishing: "fish_ellesmere_port",
    warps: [].concat(
      NW.edge(0, 19, 3, false, "route_zoo_ellesmere", 38, 13, "left"),
      NW.edge(51, 12, 3, false, "route_ellesmere_parkgate", 1, 13, "right"),
      NW.edge(51, 24, 3, false, "route_ellesmere_ince", 1, 13, "right"),
      NW.exit(24, 36, "ellesmere_port_care", 7, 10, "up"),
      NW.exit(39, 36, "ellesmere_port_outlet", 12, 22, "up"),
      NW.exit(8, 36, "ellesmere_port_station", 8, 10, "up"),
      [
        { x: 10, y: 5, to: "ellesmere_port_boat_museum", tx: 16, ty: 24, dir: "up", kind: "door" },
        { x: 22, y: 5, to: "ellesmere_port_boat_museum", tx: 16, ty: 24, dir: "up", kind: "door" },
        { x: 34, y: 5, to: "ellesmere_port_mirror_boat", tx: 8, ty: 20, dir: "up", kind: "door", cond: "postgame_open" },
        { x: 19, y: 12, to: "ellesmere_port_mirror_boat", tx: 8, ty: 20, dir: "up", kind: "door", cond: "postgame_open" }
      ]
    ),
    signs: [
      { x: 12, y: 6, text: ["THE CANAL BASIN — where the Shropshire Union meets the Mersey and stops pretending to be inland.",
        "Sixty historic boats on the register. Sixty-one are moored."] },
      { x: 41, y: 5, text: ["NATIONAL WATERWAYS MUSEUM — the sheds, the locks, the boats, and a man called Ffred."] },
      { x: 45, y: 22, text: ["STANLOW — NO ADMITTANCE.", "The flare goes long, short, long, at intervals. Somebody at the outlet has been writing it down for four years."] },
      { x: 3, y: 34, text: ["ELLESMERE PORT STATION — Liverpool that way, Chester that way, Helsby if you are patient."] },
      { x: 19, y: 34, text: ["CARE CENTRE — ELLESMERE PORT", "Running at half capacity. There is a notice about it and the notice does not say why."] },
      { x: 33, y: 34, text: ["CHESHIRE OAKS — one hundred and forty-five shops and a car park with its own postcode."] }
    ],
    items: [
      { x: 3, y: 3, item: "capsule_root", n: 4, flag: "item_ellesmere_port_1" },
      { x: 49, y: 37, item: "full_restore", n: 1, hidden: true, flag: "item_ellesmere_port_2" },
      { x: 4, y: 21, item: "roe", n: 4, hidden: true, flag: "item_ellesmere_port_3" }
    ],
    restPoints: [{ x: 30, y: 25, flag: "bigboy_sat_ellesmere" }],
    npcs: [
      { id: "npc_ellesmere_ffred", x: 20, y: 7, dir: "down", sprite: "npc_boater", behaviour: "still", trainer: "tr_ellesmere_port_1", sight: 0, script: "nw_ellesmere_bosun" },
      { id: "npc_ellesmere_kez", x: 40, y: 29, dir: "left", sprite: "npc_shopkeep", behaviour: "wander", radius: 3, trainer: "tr_ellesmere_port_2", sight: 4 },
      { id: "npc_ellesmere_flare", x: 44, y: 25, dir: "up", sprite: "npc_dev", behaviour: "still", script: "nw_ellesmere_flare" },
      { id: "npc_ellesmere_kid", x: 14, y: 29, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's a boat in the far basin with a light on and nobody living on it.",
          "Ffred says it's not on the register. Ffred says a lot of things about that boat."] }
    ],
    triggers: [
      { x: 23, y: 26, w: 3, h: 1, script: "nw_ellesmere_arrival", once: "ellesmere_arrival" }
    ]
  });

  W.defineMap("ellesmere_port_care", W.builtin("care_centre", {
    name: "Ellesmere Port Care Centre", region: "west", dialogue: "town_ellesmere_port", music: "town_zoo",
    warps: NW.exit(7, 11, "ellesmere_port", 24, 37, "down"),
    npcs: [
      { id: "npc_ellesmere_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal", script: "nw_ellesmere_nurse" }
    ]
  }));
  W.defineMap("ellesmere_port_station", W.builtin("station", {
    name: "Ellesmere Port Station", region: "west", dialogue: "town_ellesmere_port", music: "town_zoo",
    station: { name: "Ellesmere Port" },
    warps: NW.exit(8, 11, "ellesmere_port", 8, 37, "down"),
    npcs: [
      { id: "npc_ellesmere_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["Merseyrail one way, Chester the other, and a curve to Helsby that runs when it feels like it."] }
    ]
  }));
  const ot = NW.room(26, 24, ".", "#");
  ot.fill("g", 1, 1, 24, 1, "0");
  for (let i = 0; i < 4; i++) { ot.fill("g", 3 + i * 6, 4, 4, 1, "S"); ot.fill("g", 3 + i * 6, 10, 4, 1, "S"); }
  ot.fill("g", 4, 15, 18, 4, "-");
  ot.fill("g", 8, 16, 4, 1, "C"); ot.set("g", 11, 16, "Q");
  ot.set("g", 2, 21, "N"); ot.set("g", 23, 21, "N");
  NW.doorway(ot, 12, 23, "D");
  NW.defIn("ellesmere_port_outlet", {
    name: "Cheshire Oaks", region: "west", music: "town_zoo", ambience: "town", dialogue: "town_ellesmere_port",
    spawnPoint: { x: 12, y: 22 },
    shop: "shop_ellesmere_outlet",
    warps: NW.exit(12, 23, "ellesmere_port", 39, 37, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 21, text: ["UP TO 60% OFF. ALWAYS. FOR EVER. THE PRICE BEFORE THE DISCOUNT HAS NEVER EXISTED."] },
      { x: 23, y: 21, text: ["A notebook left on a bench, four years of entries, all of them three-letter groups.",
        "LONG SHORT LONG. LONG SHORT LONG. And once, on a Tuesday in March, something different."] }
    ],
    items: [{ x: 24, y: 22, item: "kevlar_waistcoat", n: 1, hidden: true, flag: "item_ellesmere_outlet_1" }],
    npcs: [
      { id: "npc_ellesmere_hustler", x: 10, y: 17, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_ellesmere_outlet",
        say: ["Everything here is a bargain against a price nobody ever paid.", "That's not fraud. I checked. It's marketing, which is fraud with a budget."] }
    ]
  }, ot, NW.inside({ "C": "counter", "Q": "cash_till" }));

  const bm = B.canvas(32, 26, ":");
  bm.box("g", 0, 0, 32, 26, "#");
  bm.fill("g", 1, 0, 30, 1, "^");
  bm.fill("g", 2, 3, 28, 6, "~");
  bm.fill("g", 2, 2, 28, 1, ":");
  bm.fill("g", 2, 9, 28, 1, ":");
  for (let i = 0; i < 4; i++) bm.fill("g", 4 + i * 7, 4, 4, 4, "x");
  bm.fill("g", 2, 12, 12, 1, "S"); bm.fill("g", 18, 12, 12, 1, "S");
  bm.fill("g", 6, 16, 20, 5, "-");
  bm.set("g", 2, 22, "N"); bm.set("g", 29, 22, "N");
  NW.doorway(bm, 15, 25, "D");
  NW.defIn("ellesmere_port_boat_museum", {
    name: "National Waterways Museum", region: "west", music: "town_zoo", ambience: "water",
    dialogue: "town_ellesmere_port",
    spawnPoint: { x: 16, y: 24 },
    warps: NW.exit(15, 25, "ellesmere_port", 10, 6, "down"),
    encounters: { grass: null, water: null },
    signs: [
      { x: 2, y: 22, text: ["THE COLLECTION — sixty boats, most of them still afloat, all of them still arguing about who was fastest."] },
      { x: 29, y: 22, text: ["A register in a glass case, open at the current page. Every boat in the basin is listed.",
        "You count the boats through the window. There are sixty-one."] }
    ],
    items: [{ x: 30, y: 24, item: "elixir", n: 2, hidden: true, flag: "item_ellesmere_boat_museum_1" }],
    npcs: [
      { id: "npc_ellesmere_museum_1", x: 16, y: 18, dir: "down", sprite: "npc_boater", behaviour: "still",
        say: ["Every one of these carried something for somebody who never met the crew.",
          "Same job as the fibre under the towpath, if you think about it, and I have."] }
    ]
  }, bm, NW.inside({ "x": "narrowboat" }));

  const mb = B.canvas(18, 24, ",");
  mb.box("g", 0, 0, 18, 24, "#");
  mb.fill("g", 1, 0, 16, 1, "^");
  mb.fill("g", 2, 3, 14, 1, "R"); mb.fill("g", 2, 7, 14, 1, "R");
  mb.fill("g", 2, 11, 14, 1, "R"); mb.fill("g", 2, 15, 14, 1, "R");
  mb.fill("g", 8, 2, 2, 20, ":");
  mb.set("g", 8, 5, "T"); mb.set("g", 9, 13, "T");
  mb.set("g", 2, 18, "N");
  NW.doorway(mb, 8, 23, "D");
  NW.defIn("ellesmere_port_mirror_boat", {
    name: "The Sixty-First Boat", region: "west", music: "dungeon_stack", ambience: "industrial",
    dialogue: "town_ellesmere_port",
    spawnPoint: { x: 8, y: 20 },
    encounters: { cave: "stack_cold_f1_cave" },
    warps: NW.exit(8, 23, "ellesmere_port", 34, 6, "down"),
    signs: [
      { x: 2, y: 18, text: ["Sixty feet of steel, four racks, a diesel generator and a satellite dish under a tarpaulin.",
        "The racks are cold-tier. The index on the terminal is the Winsford salt archive, mirrored, complete, and up to date as of this morning."] }
    ],
    items: [{ x: 15, y: 21, item: "capsule_night", n: 5, hidden: true, flag: "item_ellesmere_mirror_1" }],
    npcs: [
      { id: "npc_ellesmere_mirror", x: 9, y: 6, dir: "down", sprite: "oracle_terminal", behaviour: "still", script: "nw_ellesmere_mirror" }
    ]
  }, mb, NW.inside({ "R": "server_rack", "T": "terminal" }));

  // =====================================================================
  // R30 — the Wirral Way and Burton Marsh
  // =====================================================================
  const rw = B.canvas(48, 30, ",");
  B.frame(rw, "T", 1);
  rw.fill("g", 0, 13, 2, 3, "v"); rw.fill("g", 46, 13, 2, 3, "v");
  rw.fill("g", 1, 1, 46, 28, ".");
  rw.fill("g", 1, 13, 46, 3, "v");
  rw.fill("g", 2, 2, 44, 10, "<");
  B.trees(rw, "rw-n", 30, 2, 2, 44, 10, "T", "y", ["<"]);
  rw.fill("g", 2, 17, 44, 11, "a");
  rw.fill("g", 6, 19, 14, 5, "J");
  rw.fill("g", 26, 20, 16, 6, "J");
  rw.scatter("g", "rw-reed", "z", 24, 2, 17, 44, 11, ["a"]);
  rw.fill("g", 12, 16, 3, 8, "Y");
  rw.fill("g", 12, 23, 20, 3, "Y");
  rw.fill("g", 30, 16, 3, 8, "Y");
  rw.set("g", 10, 12, "S"); rw.set("g", 36, 12, "S"); rw.set("g", 22, 16, "S");
  rw.set("g", 18, 14, "q"); rw.set("g", 40, 14, "I");
  NW.defLand("route_ellesmere_parkgate", {
    name: "The Wirral Way & Burton Marsh", region: "west", weatherZone: "west", music: "route_west",
    ambience: "water", dialogue: "town_parkgate",
    spawnPoint: { x: 2, y: 14 },
    landmark: { name: "Burton Marsh", x: 24, y: 21 },
    encounters: { grass: "route_ellesmere_parkgate_grass" },
    warps: [].concat(
      NW.edge(0, 13, 3, false, "ellesmere_port", 50, 12, "left"),
      NW.edge(47, 13, 3, false, "parkgate", 1, 16, "right")
    ),
    signs: [
      { x: 10, y: 12, text: ["THE WIRRAL WAY — twelve miles of old railway, closed 1962, reopened 1973 as a country park.",
        "First of its kind in Britain. Nobody outside Wirral has ever been told."] },
      { x: 36, y: 12, text: ["PARKGATE 1 MILE. The sea is not there. The sea has not been there since 1830."] },
      { x: 22, y: 16, text: ["BURTON MARSH — TIDE-TIMED PATH. WADERS REQUIRED.",
        "Spring tides flood the whole marsh in about eleven minutes and everything living in it runs at the sea wall at once."] }
    ],
    items: [
      { x: 4, y: 4, item: "capsule_night", n: 4, flag: "item_route_ellesmere_parkgate_1" },
      { x: 44, y: 27, item: "full_restore", n: 1, hidden: true, flag: "item_route_ellesmere_parkgate_2" }
    ],
    npcs: [
      { id: "npc_rw_watcher", x: 24, y: 17, dir: "down", sprite: "npc_birder", behaviour: "still",
        say: ["Wait for the tide. Everything in the marsh comes at you at once and none of it is interested in you.",
          "It is the best twenty minutes in England and it happens about nine times a year."] }
    ]
  }, rw, NW.land());

  // =====================================================================
  // PARKGATE
  // =====================================================================
  const pk = B.canvas(44, 32, ".");
  B.frame(pk, "T", 1);
  pk.fill("g", 0, 15, 2, 3, "r");
  pk.fill("g", 2, 2, 40, 28, ",");
  // the parade: a road, a sea wall, and no sea
  pk.fill("g", 2, 14, 40, 4, "r");
  pk.fill("g", 2, 15, 40, 1, "|");
  pk.fill("g", 2, 13, 40, 1, "-");
  pk.fill("g", 2, 18, 40, 1, "-");
  pk.fill("g", 2, 19, 40, 1, "%");
  pk.fill("g", 2, 20, 40, 10, "a");
  pk.fill("g", 6, 22, 12, 5, "J");
  pk.fill("g", 24, 23, 14, 5, "J");
  pk.scatter("g", "pk-reed", "z", 20, 2, 20, 40, 10, ["a"]);
  pk.fill("g", 20, 19, 3, 1, "s");
  pk.fill("g", 20, 20, 3, 6, "Y");
  pk.fill("g", 12, 25, 20, 3, "Y");
  pk.set("g", 19, 18, "N");
  // the front: cottages, the ice-cream shop, the care centre
  pk.fill("g", 2, 3, 40, 10, "=");
  for (let i = 0; i < 3; i++) B.house(pk, { x: 4 + i * 9, y: 6, w: 7, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "D", doorX: 3, over: ";" });
  B.house(pk, { x: 32, y: 6, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: ";" });
  pk.set("g", 31, 9, "N");
  pk.fill("g", 3, 11, 38, 1, "-");
  pk.fill("g", 3, 4, 38, 1, '"');
  pk.set("g", 14, 12, "H"); pk.set("g", 26, 12, "H"); pk.set("g", 34, 12, "I");
  W.defineMap("parkgate", {
    name: "Parkgate", region: "west", outdoor: true, music: "town_zoo", weatherZone: "west",
    ambience: "water", dialogue: "town_parkgate",
    legend: NW.town({ "a": "marsh", "z": "moor_bog", "J": "marsh_pool", "Y": "boardwalk" }),
    layers: pk.layers(),
    spawnPoint: { x: 20, y: 16 },
    healPoint: { x: 36, y: 13 },
    landmark: { name: "Parkgate", x: 20, y: 16 },
    encounters: { grass: "parkgate_grass" },
    fishing: "fish_parkgate",
    warps: [].concat(
      NW.edge(0, 15, 3, false, "route_ellesmere_parkgate", 46, 13, "left"),
      NW.exit(36, 11, "parkgate_ice_cream", 8, 12, "up"),
      [
        { x: 7, y: 11, to: "parkgate_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 16, y: 11, to: "parkgate_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
        { x: 25, y: 11, to: "parkgate_house_3", tx: 5, ty: 8, dir: "up", kind: "door" }
      ]
    ),
    signs: [
      { x: 31, y: 9, text: ["NICHOLLS OF PARKGATE — ice cream since 1937, sold in all weathers to people looking at a marsh."] },
      { x: 19, y: 18, text: ["THE PARADE", "This was a port. Ships for Ireland sailed from the wall you are standing on.",
        "In 1830 the Dee silted and the sea went out, and it has not come back, and the town has been extremely gracious about it."] }
    ],
    items: [
      { x: 3, y: 29, item: "elixir", n: 3, flag: "item_parkgate_1" },
      { x: 41, y: 29, item: "capsule_night", n: 4, hidden: true, flag: "item_parkgate_2" },
      { x: 4, y: 4, item: "cream", n: 4, hidden: true, flag: "item_parkgate_3" }
    ],
    restPoints: [{ x: 27, y: 12, flag: "bigboy_sat_parkgate" }],
    npcs: [
      { id: "npc_parkgate_non", x: 22, y: 21, dir: "down", sprite: "npc_birder", behaviour: "still", trainer: "tr_parkgate_1", sight: 0, script: "nw_parkgate_watcher" },
      { id: "npc_parkgate_ceinwen", x: 34, y: 12, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "nw_parkgate_ceinwen" },
      { id: "npc_parkgate_walker", x: 12, y: 16, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[12, 16], [30, 16]], pathMode: "pingpong",
        say: ["People come for the sea and stay for the not-sea. It's better. It's a whole county of grass that moves."] }
    ],
    triggers: [
      { x: 19, y: 19, w: 3, h: 1, script: "nw_parkgate_tide", once: "parkgate_tide_seen" }
    ]
  });
  const phomes = [
    { id: "parkgate_house_1", tx: 7, ty: 12, sprite: "npc_granny",
      say: ["My mother watched the last ship. My grandmother watched the first silt.", "We have been watching things not happen here for two hundred years and we are good at it."] },
    { id: "parkgate_house_2", tx: 16, ty: 12, sprite: "npc_walker",
      say: ["Wales is over there. You can see it in the evening and hear it on a still night.", "There is a letter in my hall addressed to Ceredigion and I have not posted it since April."] },
    { id: "parkgate_house_3", tx: 25, ty: 12, sprite: "npc_kid",
      say: ["When the tide comes in the whole marsh runs at the wall.", "Voles, shrews, owls, everything. Once, something none of us could name."] }
  ];
  for (let i = 0; i < phomes.length; i++) {
    const hh = phomes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: "Parade Cottage", region: "west", dialogue: "town_parkgate", music: "town_zoo",
      warps: NW.exit(5, 9, "parkgate", hh.tx, hh.ty, "down"),
      npcs: [{ id: "npc_" + hh.id, x: 6, y: 3, dir: "down", sprite: hh.sprite, behaviour: "still", say: hh.say }]
    }));
  }
  const ic = NW.room(18, 14, ".", "#");
  ic.fill("g", 1, 1, 16, 1, "W");
  ic.fill("g", 3, 4, 12, 1, "C"); ic.set("g", 9, 4, "Q");
  ic.fill("g", 3, 8, 4, 1, "o"); ic.fill("g", 3, 9, 4, 1, "l");
  ic.fill("g", 11, 8, 4, 1, "o"); ic.fill("g", 11, 9, 4, 1, "l");
  ic.set("g", 16, 11, "N");
  NW.doorway(ic, 8, 13, "D");
  NW.defIn("parkgate_ice_cream", {
    name: "Nicholls of Parkgate", region: "west", music: "town_zoo", ambience: "town", dialogue: "town_parkgate",
    spawnPoint: { x: 8, y: 12 },
    warps: NW.exit(8, 13, "parkgate", 36, 12, "down"),
    encounters: { grass: null },
    signs: [
      { x: 16, y: 11, text: ["A map of Wales on the wall with a drawing pin in Ceredigion and no explanation."] }
    ],
    items: [{ x: 2, y: 11, item: "cream", n: 5, hidden: true, flag: "item_parkgate_ice_cream_1" }],
    npcs: [
      { id: "npc_parkgate_ceinwen_shop", x: 9, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", script: "nw_parkgate_ceinwen_shop" }
    ]
  }, ic, NW.inside({ "C": "counter", "Q": "cash_till", "o": "table_round", "l": "stool" }));

  // =====================================================================
  // D-Ince — the marshes, the intake, and the walk back to Frodsham
  // =====================================================================
  const ri = B.canvas(36, 30, ",");
  B.frame(ri, "T", 1);
  ri.fill("g", 0, 13, 2, 3, "v"); ri.fill("g", 34, 13, 2, 3, "v");
  ri.fill("g", 1, 1, 34, 28, "a");
  ri.fill("g", 1, 13, 34, 3, "Y");
  ri.fill("g", 4, 4, 10, 6, "J");
  ri.fill("g", 20, 3, 12, 7, "J");
  ri.fill("g", 6, 19, 12, 7, "J");
  ri.fill("g", 22, 20, 10, 6, "J");
  ri.scatter("g", "ri-reed", "z", 30, 1, 1, 34, 28, ["a"]);
  for (let i = 0; i < 3; i++) { ri.set("g", 8 + i * 10, 12, "\\"); ri.set("g", 8 + i * 10, 11, "`"); }
  ri.set("g", 16, 12, "S"); ri.set("g", 28, 16, "S");
  NW.defLand("route_ellesmere_ince", {
    name: "The Ince Bank", region: "west", weatherZone: "west", music: "dungeon_bog", ambience: "water",
    dialogue: "town_ince_marshes",
    spawnPoint: { x: 2, y: 14 },
    landmark: { name: "The Ince Bank", x: 18, y: 14 },
    encounters: { grass: "route_ellesmere_ince_grass" },
    warps: [].concat(
      NW.edge(0, 13, 3, false, "ellesmere_port", 50, 24, "left"),
      NW.edge(35, 13, 3, false, "ince_marshes", 1, 20, "right")
    ),
    signs: [
      { x: 16, y: 12, text: ["INCE BANK — the boardwalk is the path. There is no other path.", "WADERS. TIDE TABLE. TELL SOMEBODY WHERE YOU ARE GOING."] },
      { x: 28, y: 16, text: ["Three turbines, all turning the wrong way, all of them very slowly, all of them together."] }
    ],
    items: [{ x: 3, y: 27, item: "capsule_night", n: 3, hidden: true, flag: "item_route_ellesmere_ince_1" }],
    npcs: [
      { id: "npc_ri_warden", x: 20, y: 14, dir: "left", sprite: "npc_birder", behaviour: "still",
        say: ["Nobody comes out here. That is why everything comes out here.",
          "Including a hum on the intake that is four notes long and has been going since the credits rolled on all of this."] }
    ]
  }, ri, NW.land());

  const im = B.canvas(48, 40, "a");
  B.frame(im, "T", 1);
  im.fill("g", 0, 19, 2, 3, "Y");
  im.fill("g", 1, 1, 46, 38, "a");
  im.fill("g", 1, 19, 46, 3, "Y");
  im.fill("g", 14, 6, 3, 14, "Y");
  im.fill("g", 14, 6, 20, 3, "Y");
  im.fill("g", 31, 8, 3, 12, "Y");
  im.fill("g", 12, 21, 3, 14, "Y");
  im.fill("g", 12, 32, 22, 3, "Y");
  im.fill("g", 31, 21, 3, 12, "Y");
  im.fill("g", 4, 3, 9, 14, "J");
  im.fill("g", 35, 3, 10, 15, "J");
  im.fill("g", 3, 23, 8, 13, "J");
  im.fill("g", 36, 23, 9, 13, "J");
  im.fill("g", 18, 11, 12, 6, "J");
  im.fill("g", 18, 24, 12, 6, "J");
  im.scatter("g", "im-reed", "z", 40, 1, 1, 46, 38, ["a"]);
  for (let i = 0; i < 4; i++) { im.set("g", 6 + i * 11, 20, "\\"); }
  im.fill("g", 40, 19, 6, 3, "Y");
  im.set("g", 24, 20, "S"); im.set("g", 20, 33, "S");
  im.set("g", 45, 20, "6");
  im.fill("g", 22, 36, 3, 3, "Y");
  NW.defLand("ince_marshes", {
    name: "Ince Marshes", region: "west", weatherZone: "west", music: "dungeon_bog", ambience: "water",
    dialogue: "town_ince_marshes",
    spawnPoint: { x: 2, y: 20 },
    landmark: { name: "Ince Marshes", x: 24, y: 20 },
    encounters: { grass: "ince_marshes_grass", water: "ince_marshes_water" },
    warps: [].concat(
      NW.edge(0, 19, 3, false, "route_ellesmere_ince", 34, 13, "left"),
      NW.edge(23, 39, 3, true, "route_ince_frodsham", 14, 1, "down"),
      [{ x: 45, y: 20, to: "ince_intake", tx: 14, ty: 22, dir: "right", kind: "gate" }]
    ),
    signs: [
      { x: 24, y: 20, text: ["INCE MARSHES", "Reed, saltmarsh, flare-light and a cooling-water intake that belongs to a building nine miles away.",
        "There is no sign anywhere on this marsh saying whose it is."] },
      { x: 20, y: 33, text: ["THE LISTENING POST", "Somebody has bolted an aerial to a fence post and left a notebook in a sandwich box.",
        "Every entry is a timestamp and the word 'again'."] }
    ],
    items: [
      { x: 3, y: 37, item: "full_restore", n: 2, flag: "item_ince_marshes_1" },
      { x: 45, y: 3, item: "capsule_night", n: 5, hidden: true, flag: "item_ince_marshes_2" },
      { x: 24, y: 37, item: "elixir", n: 3, hidden: true, flag: "item_ince_marshes_3" }
    ],
    npcs: [
      { id: "npc_ince_ith", x: 26, y: 20, dir: "left", sprite: "npc_birder", behaviour: "still", trainer: "tr_ince_marshes_1", sight: 0, script: "nw_ince_warden" }
    ],
    triggers: [
      { x: 22, y: 32, w: 3, h: 1, script: "nw_fifth_pulse_post", once: "fifth_pulse_post", cond: "postgame_open" }
    ]
  }, im, NW.land());

  const it = B.canvas(30, 26, "a");
  it.box("g", 0, 0, 30, 26, "|");
  it.fill("g", 1, 1, 28, 24, "a");
  it.fill("g", 4, 4, 22, 10, "!");
  it.fill("g", 3, 3, 24, 1, "%"); it.fill("g", 3, 14, 24, 1, "%");
  it.fill("g", 3, 4, 1, 10, "%"); it.fill("g", 26, 4, 1, 10, "%");
  it.fill("g", 12, 6, 6, 6, "2");
  it.fill("g", 13, 15, 4, 8, "Y");
  it.fill("g", 6, 17, 18, 3, "Y");
  it.fill("g", 6, 20, 3, 4, "Y");
  it.fill("g", 21, 20, 3, 4, "Y");
  it.set("g", 11, 16, "S");
  it.set("g", 14, 25, "6"); it.set("g", 15, 25, "6");
  NW.defLand("ince_intake", {
    name: "The Cooling-Water Intake", region: "west", weatherZone: "west", music: "dungeon_stack",
    ambience: "industrial", dialogue: "town_ince_marshes",
    spawnPoint: { x: 14, y: 22 },
    landmark: { name: "The Intake", x: 15, y: 9 },
    encounters: { grass: "ince_intake_grass", water: null },
    warps: [
      { x: 14, y: 25, to: "ince_marshes", tx: 44, ty: 20, dir: "left", kind: "gate" },
      { x: 15, y: 25, to: "ince_marshes", tx: 44, ty: 20, dir: "left", kind: "gate" }
    ],
    signs: [
      { x: 11, y: 16, text: ["COOLING WATER INTAKE — NO ADMITTANCE.", "The screens hum. Four notes, then a gap, then four notes. It is not a pump noise. Pumps do not have a key.",
        "Nine miles inland the racks are cold and empty and something is still drinking."] }
    ],
    items: [
      { x: 27, y: 23, item: "full_restore", n: 2, hidden: true, flag: "item_ince_intake_1" },
      { x: 3, y: 23, item: "tm_signal_box", n: 1, hidden: true, flag: "item_ince_intake_2" }
    ],
    npcs: [
      { id: "npc_ince_knight", x: 15, y: 16, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "elite_knight_third", sight: 0, script: "nw_ince_knight", cond: "postgame_open" }
    ]
  }, it, NW.land({ "|": "fence_wire", "%": "wall_stone_sandstone", "2": "salt_works_pipe", "6": "gate_wood", "S": "sign_post" }));

  const rf = B.canvas(30, 44, ",");
  B.frame(rf, "T", 1);
  rf.fill("g", 13, 0, 3, 2, "Y");
  rf.fill("g", 19, 42, 5, 2, "+");
  rf.fill("g", 1, 1, 28, 42, "a");
  rf.fill("g", 13, 1, 3, 20, "Y");
  rf.fill("g", 13, 20, 8, 3, "Y");
  rf.fill("g", 18, 22, 3, 14, "Y");
  rf.fill("g", 18, 34, 6, 3, "Y");
  rf.fill("g", 21, 36, 3, 7, "+");
  rf.fill("g", 3, 3, 9, 12, "J");
  rf.fill("g", 18, 4, 10, 12, "J");
  rf.fill("g", 3, 20, 9, 16, "J");
  rf.fill("g", 23, 22, 6, 12, "J");
  rf.scatter("g", "rf-reed", "z", 30, 1, 1, 28, 42, ["a"]);
  rf.fill("g", 2, 38, 26, 4, "<");
  B.trees(rf, "rf-t", 16, 2, 38, 26, 4, "T", "y", ["<"]);
  rf.set("g", 17, 20, "S"); rf.set("g", 20, 37, "S");
  NW.defLand("route_ince_frodsham", {
    name: "The Weaver Bend", region: "west", weatherZone: "west", music: "dungeon_bog", ambience: "water",
    dialogue: "town_frodsham",
    spawnPoint: { x: 14, y: 2 },
    landmark: { name: "The Weaver Bend", x: 16, y: 22 },
    encounters: { grass: "route_ince_frodsham_grass" },
    warps: [].concat(
      NW.edge(13, 0, 3, true, "ince_marshes", 23, 38, "up"),
      NW.edge(20, 43, 4, true, "frodsham", 20, 1, "down")
    ),
    signs: [
      { x: 17, y: 20, text: ["THE WEAVER BEND — boardwalk only, and the boardwalk is younger than the tide table.",
        "INCE 1 MILE. FRODSHAM 2. NEITHER OF THEM IS DRY."] },
      { x: 20, y: 37, text: ["FRODSHAM — the hill is above you and the memorial bench is on it.", "Somebody is usually there at dusk, whatever else has happened."] }
    ],
    items: [
      { x: 27, y: 41, item: "elixir", n: 3, flag: "item_route_ince_frodsham_1" },
      { x: 3, y: 41, item: "capsule_night", n: 4, hidden: true, flag: "item_route_ince_frodsham_2" }
    ],
    npcs: [
      { id: "npc_rf_egret", x: 15, y: 24, dir: "left", sprite: "npc_birder", behaviour: "still",
        say: ["Egrets on this bend, a hundred at roost, and every one of them arrived in my lifetime.",
          "Things come back. Not the same things. But things."] }
    ]
  }, rf, NW.land());
})();
