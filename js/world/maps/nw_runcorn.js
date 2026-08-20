// =============================================================
// MonsterQuest v2 — RUNCORN (region mersey, Ch.9) — Gym 7, PROXY.
// A chemical town with two bridges, a castle on a hill above a housing
// estate, a Norman priory in a park, and a fog over the water that is
// not weather: it is a hundred thousand borrowed front rooms.
// Chemist Ria's reagent lab is Gym 7 and the fumes are the walls.
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
  const c = B.canvas(64, 44, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 64; x++) c.set("o", x, 0, "y");
  c.fill("g", 62, 22, 2, 4, "r");
  c.fill("g", 0, 22, 2, 4, "r");
  c.fill("g", 2, 2, 60, 40, ",");

  // ---- the Mersey along the north, the two bridges going over it -------
  c.fill("g", 2, 2, 60, 6, "!");
  c.fill("g", 2, 8, 60, 1, "e");
  c.fill("g", 2, 9, 60, 2, "t");
  c.fill("g", 18, 2, 3, 7, "x");
  c.fill("g", 18, 9, 3, 3, "-");
  c.fill("g", 44, 2, 4, 7, "x");
  c.fill("g", 44, 9, 4, 3, "-");
  c.set("g", 17, 6, "8"); c.set("g", 21, 6, "8"); c.set("g", 43, 6, "8"); c.set("g", 48, 6, "8");
  c.set("g", 16, 10, "N"); c.set("g", 49, 10, "N");
  c.set("g", 30, 5, "J"); c.set("g", 36, 4, "J");

  // ---- the works: pipes, tanks, flare, along the west bank -------------
  c.fill("g", 2, 11, 20, 10, "1");
  c.fill("g", 3, 12, 18, 8, "2");
  c.fill("g", 4, 13, 4, 2, "0"); c.fill("g", 12, 13, 4, 2, "0"); c.fill("g", 4, 17, 4, 2, "0");
  c.set("g", 10, 12, "3"); c.set("g", 18, 12, "3");
  c.set("g", 11, 20, "N");

  // ---- the high street, running east-west under the works --------------
  c.fill("g", 2, 22, 60, 4, "r");
  c.fill("g", 2, 23, 60, 1, "|");
  c.fill("g", 2, 21, 40, 1, "-");
  c.fill("g", 42, 21, 20, 1, "-");
  c.fill("g", 2, 26, 60, 1, "-");
  c.fill("g", 30, 21, 4, 6, "z");
  for (let x = 5; x < 62; x += 7) { c.set("g", x, 26, "L"); }
  c.set("g", 7, 26, "O"); c.set("g", 24, 26, "u"); c.set("g", 40, 26, "U"); c.set("g", 55, 26, "q");
  c.set("g", 36, 26, "H"); c.set("g", 37, 26, "I");
  c.fill("g", 23, 11, 39, 10, "=");

  // ---- north-east of the street: the gym, the care centre, the mart ----
  B.house(c, { x: 24, y: 13, w: 14, h: 8, rh: 2, roof: "1", wall: "0", win: "W", door: "S", doorX: 6 });
  c.fill("g", 24, 13, 14, 2, "1");
  c.set("g", 25, 13, "3"); c.set("g", 36, 13, "3");
  c.set("g", 23, 18, "N");
  B.house(c, { x: 41, y: 14, w: 10, h: 7, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 40, 18, "N");
  B.house(c, { x: 53, y: 13, w: 8, h: 8, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: ";" });
  c.set("g", 52, 18, "N");

  // ---- south of the street: the estate, the fridges, the castle hill ----
  c.fill("g", 2, 27, 60, 15, "=");
  c.fill("g", 2, 27, 60, 1, "-");
  // six identical maisonettes, each with an identical fridge in it
  for (let i = 0; i < 6; i++) {
    const bx = 3 + i * 9;
    B.house(c, { x: bx, y: 30, w: 7, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: ";" });
    c.fill("g", bx, 34, 7, 1, "-");
    c.set("g", bx + 1, 35, "Y");
  }
  c.fill("g", 2, 29, 56, 1, "-");
  c.set("g", 2, 35, "N");
  // Halton Castle, up on the hill in the south-east
  c.fill("g", 44, 29, 18, 13, ";");
  c.fill("g", 44, 29, 18, 1, "0");
  c.fill("g", 50, 31, 10, 8, "4");
  c.fill("g", 51, 32, 8, 6, ";");
  c.fill("g", 54, 39, 2, 1, "6");
  c.fill("g", 54, 40, 2, 2, "s");
  c.set("g", 50, 31, "7"); c.set("g", 59, 31, "7");
  c.set("g", 53, 41, "N");
  c.fill("g", 46, 33, 3, 6, '"');
  B.trees(c, "run-hill", 8, 46, 33, 3, 6, "T", "y", ['"']);
  // Norton Priory, in the park to the south-west
  c.fill("g", 4, 37, 30, 6, '"');
  B.trees(c, "run-priory", 26, 4, 37, 30, 6, "T", "y", ['"']);
  c.fill("g", 14, 38, 10, 4, ",");
  c.box("g", 14, 38, 10, 4, "%");
  c.fill("g", 15, 39, 8, 2, ",");
  c.fill("g", 18, 41, 2, 1, "6");
  c.fill("g", 18, 42, 2, 1, "_");
  c.set("g", 13, 40, "N");
  c.fill("g", 19, 34, 1, 8, "_");
  c.set("g", 27, 40, "M");

  W.defineMap("runcorn", {
    name: "Runcorn", region: "mersey", outdoor: true, music: "town_frodsham", weatherZone: "mersey",
    ambience: "industrial", dialogue: "town_runcorn",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 32, y: 24 },
    healPoint: { x: 45, y: 21 },
    landmark: { name: "Runcorn", x: 32, y: 23 },
    encounters: { grass: "runcorn_grass", water: "runcorn_water" },
    fishing: "fish_runcorn",
    warps: [].concat(
      NW.edge(63, 22, 4, false, "route_runcorn_frodsham", 1, 16, "right"),
      NW.edge(0, 22, 4, false, "route_daresbury_runcorn", 54, 20, "left"),
      NW.exit(19, 9, "runcorn_silver_jubilee_bridge", 12, 40, "up"),
      NW.exit(45, 9, "runcorn_mersey_gateway", 20, 40, "up"),
      NW.exit(30, 21, "runcorn_gym", 9, 22, "up"),
      NW.exit(45, 21, "runcorn_care", 7, 11, "up"),
      NW.exit(56, 21, "runcorn_mart", 6, 9, "up"),
      [
        { x: 55, y: 41, to: "runcorn_halton_castle", tx: 18, ty: 30, dir: "up", kind: "stairs" },
        { x: 54, y: 41, to: "runcorn_halton_castle", tx: 18, ty: 30, dir: "up", kind: "stairs" },
        { x: 19, y: 41, to: "runcorn_norton_priory", tx: 20, ty: 28, dir: "up", kind: "door" },
        { x: 18, y: 41, to: "runcorn_norton_priory", tx: 20, ty: 28, dir: "up", kind: "door" }
      ],
      (function () {
        const out = [];
        for (let i = 0; i < 6; i++) out.push({ x: 6 + i * 9, y: 33, to: "runcorn_fridge_house_" + (i + 1), tx: 5, ty: 8, dir: "up", kind: "door" });
        return out;
      })()
    ),
    signs: [
      { x: 16, y: 10, text: ["SILVER JUBILEE BRIDGE — 1961. The longest steel arch in Europe when they built it, and everybody said so at length.",
        "Footway open. Six spans. No shelter, no benches and a great deal of opinion about the wind."] },
      { x: 49, y: 10, text: ["MERSEY GATEWAY — six lanes, all tolled, all watched.",
        "Every gantry on it reads number plates. This morning every gantry read the same plate."] },
      { x: 11, y: 20, text: ["RUNCORN SITE — CHEMICALS. AUTHORISED PERSONS ONLY.",
        "Underneath, in different paint: 'AUTHORISED IS A DECISION SOMEBODY MADE ONCE'."] },
      { x: 23, y: 18, text: ["RUNCORN GYM — REAGENT LAB", "HOUSE RULE: EVERYTHING IN HERE IS A CONTACT HAZARD. THAT INCLUDES THE STAFF.",
        "Badge: PROXY. Leader: Chemist Ria, twenty-two years ICI, no patience whatsoever."] },
      { x: 40, y: 18, text: ["CARE CENTRE — RUNCORN", "Busy. It has been busy since the fog came in and nobody has connected the two out loud."] },
      { x: 52, y: 18, text: ["RUNCORN MART — everything, in bulk, and a shelf of masks that sold out in March."] },
      { x: 2, y: 35, text: ["HALTON BROW ESTATE", "Six maisonettes, six identical kitchens, six identical fridges bought in the same week on the same offer."] },
      { x: 53, y: 41, text: ["HALTON CASTLE — up the steps, past the pub, and then a great deal more steps.",
        "Best view of the estuary in the borough and it is free, which is why nobody goes."] },
      { x: 13, y: 40, text: ["NORTON PRIORY — Augustinian, 1134. Now a museum, a walled garden and a twelve-foot stone giant."] }
    ],
    items: [
      { x: 58, y: 12, item: "capsule_net", n: 4, hidden: true, flag: "item_runcorn_1" },
      { x: 60, y: 42, item: "elixir", n: 2, flag: "item_runcorn_2" },
      { x: 33, y: 40, item: "antidote", n: 5, flag: "item_runcorn_3" },
      { x: 3, y: 42, item: "toxic_sachet", n: 1, hidden: true, flag: "item_runcorn_4" },
      { x: 61, y: 12, item: "capsule_kernel", n: 3, hidden: true, flag: "item_runcorn_5" }
    ],
    catGaps: [
      { x: 22, y: 21, item: "cat_token_9", n: 1, flag: "catgap_runcorn_1",
        say: "MEADOW goes under the works fence, walks the length of a pipe bridge that is forty feet up, and returns bored." }
    ],
    restPoints: [{ x: 26, y: 27, flag: "bigboy_sat_runcorn" }],
    npcs: [
      { id: "npc_runcorn_bevan", x: 26, y: 22, dir: "down", sprite: "npc_chemist", behaviour: "still", trainer: "tr_runcorn_1", sight: 4 },
      { id: "npc_runcorn_dilwen", x: 12, y: 28, dir: "down", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_runcorn_2", sight: 4 },
      { id: "npc_runcorn_mostyn", x: 50, y: 24, dir: "left", sprite: "npc_shadow_it", behaviour: "wander", radius: 3, trainer: "tr_runcorn_3", sight: 3 },
      { id: "npc_runcorn_cerys", x: 18, y: 10, dir: "down", sprite: "npc_walker", behaviour: "still", script: "nw_runcorn_cerys" },
      { id: "npc_runcorn_ria_door", x: 30, y: 22, dir: "up", sprite: "npc_chemist", behaviour: "still", script: "nw_runcorn_gym_door" },
      { id: "npc_runcorn_granny", x: 8, y: 28, dir: "down", sprite: "npc_granny", behaviour: "still", script: "nw_runcorn_fridge_granny" },
      { id: "npc_runcorn_kid", x: 43, y: 27, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Fog on the water's been there three weeks and it smells of nothing.",
          "Fog's meant to smell of something. Ask anyone."] },
      { id: "npc_runcorn_boater", x: 34, y: 10, dir: "up", sprite: "npc_boater", behaviour: "path", path: [[34, 10], [54, 10]], pathMode: "pingpong",
        say: ["Ship canal one side, Mersey the other, and a lock between them the size of a street."] },
      { id: "npc_runcorn_priory", x: 25, y: 39, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["Twelve foot of sandstone St Christopher, carrying a child across a river.",
          "Biggest of his kind in England, in a shed, in Runcorn. I think about that a lot."] },
      { id: "npc_runcorn_vex_ally", x: 34, y: 24, dir: "down", sprite: "vex", behaviour: "still", script: "nw_vex_ally_chat",
        cond: "vex_ally && chapter >= 9 && chapter < 11" }
    ],
    triggers: [
      { x: 30, y: 25, w: 4, h: 1, script: "nw_runcorn_arrival", once: "runcorn_arrival", cond: "chapter >= 9" }
    ]
  });

  // ------------------------------------------------------- GYM 7: Ria -----
  const g = B.canvas(20, 24, "+");
  g.box("g", 0, 0, 20, 24, "#");
  g.fill("g", 1, 0, 18, 1, "^");
  g.fill("g", 1, 1, 18, 1, "#");
  g.fill("g", 3, 1, 3, 1, "W"); g.fill("g", 14, 1, 3, 1, "W");
  // three fume lines across the room — the "walls" of the gym
  g.fill("g", 1, 6, 13, 1, "2"); g.fill("g", 6, 11, 13, 1, "2"); g.fill("g", 1, 16, 13, 1, "2");
  g.fill("g", 2, 3, 6, 1, "b"); g.fill("g", 12, 3, 6, 1, "b");
  g.fill("g", 2, 8, 4, 1, "b"); g.fill("g", 14, 8, 4, 1, "b");
  g.fill("g", 2, 13, 4, 1, "b"); g.fill("g", 14, 13, 4, 1, "b");
  g.fill("g", 7, 18, 6, 4, "-");
  g.set("g", 9, 4, "$");
  g.set("g", 3, 20, "m"); g.set("g", 16, 20, "m");
  g.set("g", 2, 22, "N"); g.set("g", 17, 22, "N");
  NW.doorway(g, 9, 23, "G");
  NW.defIn("runcorn_gym", {
    name: "Runcorn Gym", region: "mersey", music: "battle_gym", ambience: "industrial", dialogue: "town_runcorn",
    spawnPoint: { x: 9, y: 22 },
    gym: { leader: "leader_ria", badge: "badge_proxy" },
    warps: NW.exit(9, 23, "runcorn", 30, 22, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 22, text: ["HOUSE RULE (RUNCORN)", "EVERYTHING IN HERE IS A CONTACT HAZARD. THAT INCLUDES THE STAFF.",
        "Touch moves have a one-in-five chance of poisoning you. VIGIL is on a three-turn cooldown from the door. Sash down."] },
      { x: 17, y: 22, text: ["A laminated sheet, twenty-two years old, headed 'PERMIT TO WORK'.",
        "Every box is initialled. Every box has a time. The last line reads: 'NOTHING WENT WRONG. THAT IS THE POINT OF THE FORM.'"] }
    ],
    items: [{ x: 18, y: 3, item: "antidote", n: 5, hidden: true, flag: "item_runcorn_gym_1" }],
    npcs: [
      { id: "npc_runcorn_gym_marged", x: 4, y: 4, dir: "down", sprite: "npc_chemist", behaviour: "still", trainer: "tr_runcorn_gym_1", sight: 3 },
      { id: "npc_runcorn_gym_iolo", x: 15, y: 9, dir: "down", sprite: "npc_chemist", behaviour: "still", trainer: "tr_runcorn_gym_2", sight: 3 },
      { id: "npc_runcorn_ria", x: 9, y: 5, dir: "down", sprite: "ria", behaviour: "still", script: "nw_gym7_ria" }
    ]
  }, g, NW.inside({ "$": "gym_badge_stand" }));

  // ------------------------------------------ the Silver Jubilee Bridge ---
  const sj = B.canvas(26, 44, "!");
  sj.fill("g", 10, 0, 6, 44, "x");
  sj.fill("g", 9, 0, 1, 44, "<");
  sj.fill("g", 16, 0, 1, 44, "<");
  for (let i = 0; i < 6; i++) {
    const y = 4 + i * 6;
    sj.fill("g", 8, y, 10, 1, "<");
    sj.fill("g", 10, y, 6, 1, "x");
    sj.set("g", 8, y, "8"); sj.set("g", 17, y, "8");
  }
  sj.fill("g", 10, 40, 6, 4, "-");
  sj.fill("g", 10, 0, 6, 3, "-");
  sj.set("g", 9, 42, "N"); sj.set("g", 16, 2, "N");
  NW.defLand("runcorn_silver_jubilee_bridge", {
    name: "Silver Jubilee Bridge", region: "mersey", weatherZone: "mersey", music: "route_mersey", ambience: "industrial",
    dialogue: "town_runcorn",
    spawnPoint: { x: 12, y: 40 },
    landmark: { name: "Silver Jubilee Bridge", x: 12, y: 22 },
    encounters: { grass: "runcorn_silver_jubilee_bridge_grass", water: null },
    warps: [
      { x: 12, y: 43, to: "runcorn", tx: 19, ty: 10, dir: "down", kind: "edge" },
      { x: 13, y: 43, to: "runcorn", tx: 19, ty: 10, dir: "down", kind: "edge" },
      { x: 12, y: 0, to: "runcorn", tx: 19, ty: 10, dir: "down", kind: "edge" },
      { x: 13, y: 0, to: "runcorn", tx: 19, ty: 10, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 9, y: 42, text: ["FOOTWAY — WIDNES 1/2 MILE.", "BRIDGE WARDEN'S RULE: six spans, six people, no healing in between.",
        "Every one you beat is a fridge that goes dark tonight."] },
      { x: 16, y: 2, text: ["WIDNES SIDE.", "The fog stops exactly at the county boundary, which is not how fog works."] }
    ],
    items: [
      { x: 8, y: 20, item: "elixir", n: 2, hidden: true, flag: "item_runcorn_bridge_1" },
      { x: 17, y: 33, item: "capsule_net", n: 3, hidden: true, flag: "item_runcorn_bridge_2" }
    ],
    npcs: [
      { id: "npc_sjb_1", x: 12, y: 36, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_runcorn_silver_jubilee_bridge_1", sight: 4 },
      { id: "npc_sjb_2", x: 13, y: 30, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_runcorn_silver_jubilee_bridge_2", sight: 4 },
      { id: "npc_sjb_3", x: 12, y: 24, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_runcorn_silver_jubilee_bridge_3", sight: 4 },
      { id: "npc_sjb_4", x: 13, y: 18, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_runcorn_silver_jubilee_bridge_4", sight: 4 },
      { id: "npc_sjb_5", x: 12, y: 12, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_runcorn_silver_jubilee_bridge_5", sight: 4 },
      { id: "npc_sjb_6", x: 13, y: 6, dir: "down", sprite: "vex_hood", behaviour: "still", script: "nw_bridge_sixth" }
    ],
    triggers: [
      { x: 10, y: 38, w: 6, h: 1, script: "nw_bridge_gauntlet_start", once: "case_24_started" }
    ]
  }, sj, NW.land({ "<": "wall_city_walk", "-": "pavement", "8": "bollard", "N": "noticeboard", "x": "bridge_stone" }));

  // --------------------------------------------- the Mersey Gateway ------
  const mg = B.canvas(42, 44, "!");
  mg.fill("g", 14, 0, 14, 44, ":");
  mg.fill("g", 13, 0, 1, 44, "|");
  mg.fill("g", 28, 0, 1, 44, "|");
  mg.fill("g", 20, 0, 2, 44, "|");
  for (let i = 0; i < 5; i++) { mg.fill("g", 12, 6 + i * 8, 18, 1, "\\"); mg.fill("g", 14, 6 + i * 8, 14, 1, ":"); }
  mg.fill("g", 16, 38, 10, 6, "-");
  mg.fill("g", 16, 0, 10, 3, "-");
  mg.set("g", 15, 40, "N"); mg.set("g", 26, 2, "N");
  mg.set("g", 18, 20, "8"); mg.set("g", 23, 20, "8");
  NW.defLand("runcorn_mersey_gateway", {
    name: "Mersey Gateway", region: "mersey", weatherZone: "mersey", music: "route_mersey", ambience: "industrial",
    dialogue: "town_runcorn",
    spawnPoint: { x: 20, y: 40 },
    landmark: { name: "Mersey Gateway", x: 20, y: 22 },
    encounters: { grass: "runcorn_mersey_gateway_grass", water: null },
    warps: [
      { x: 20, y: 43, to: "runcorn", tx: 45, ty: 10, dir: "down", kind: "edge" },
      { x: 21, y: 43, to: "runcorn", tx: 45, ty: 10, dir: "down", kind: "edge" }
    ],
    signs: [
      { x: 15, y: 40, text: ["MERSEY GATEWAY — TOLLED. ALL VEHICLES. ALL PLATES READ.",
        "There is no footway on this bridge. You are not supposed to be here and neither is the fog."] },
      { x: 26, y: 2, text: ["A maintenance gantry, and on the screen bolted to it, one number plate, repeated four hundred times.",
        "It is yours. You have never driven over this bridge. You have never driven."] }
    ],
    items: [{ x: 26, y: 30, item: "elixir", n: 3, hidden: true, flag: "item_runcorn_gateway_1" }],
    npcs: [
      { id: "npc_gateway_boss", x: 20, y: 20, dir: "down", sprite: "npc_darkbyte", behaviour: "still", script: "nw_gateway_boss" }
    ],
    triggers: [
      { x: 16, y: 36, w: 10, h: 1, script: "nw_gateway_enter", once: "gateway_enter", cond: "chapter >= 9" }
    ]
  }, mg, NW.land({ ":": "path_tarmac", "|": "road_line", "-": "pavement", "8": "bollard", "N": "noticeboard", "\\": "fence_wire" }));

  // ------------------------------------------------- Halton Castle -------
  const hc = B.canvas(36, 32, ";");
  B.frame(hc, "T", 1);
  hc.fill("g", 17, 30, 3, 2, "s");
  hc.fill("g", 1, 1, 34, 30, ";");
  hc.fill("g", 6, 4, 24, 20, "4");
  hc.fill("g", 7, 5, 22, 18, ";");
  hc.set("g", 6, 4, "7"); hc.set("g", 29, 4, "7"); hc.set("g", 6, 23, "7"); hc.set("g", 29, 23, "7");
  hc.fill("g", 17, 23, 3, 1, "6");
  hc.fill("g", 17, 24, 3, 6, "s");
  hc.fill("g", 10, 8, 6, 5, "%");
  hc.fill("g", 21, 8, 6, 5, "%");
  hc.fill("g", 11, 9, 4, 3, ";");
  hc.fill("g", 22, 9, 4, 3, ";");
  hc.set("g", 13, 13, "D"); hc.set("g", 24, 13, "D");
  hc.set("g", 18, 10, "N"); hc.set("g", 12, 19, "q"); hc.set("g", 24, 19, "q");
  hc.set("g", 9, 20, "N");
  hc.fill("g", 2, 26, 32, 4, "<");
  B.trees(hc, "hc-wood", 22, 2, 26, 32, 4, "T", "y", ["<"]);
  NW.defLand("runcorn_halton_castle", {
    name: "Halton Castle", region: "mersey", weatherZone: "mersey", music: "route_west", ambience: "moor",
    dialogue: "town_runcorn",
    spawnPoint: { x: 18, y: 29 },
    landmark: { name: "Halton Castle", x: 18, y: 12 },
    encounters: { grass: "runcorn_halton_castle_grass" },
    warps: NW.edge(17, 31, 3, true, "runcorn", 54, 40, "down"),
    signs: [
      { x: 18, y: 10, text: ["HALTON CASTLE — Norman, on a sandstone outcrop, above a nineteen-sixties new town.",
        "Six hundred feet of history and a very good view of a toll bridge."] },
      { x: 9, y: 20, text: ["THE SPYGLASS — free, fixed, and pointing at the far bank.",
        "Look through it and count the buildings at Daresbury. Now look without it. The numbers do not match."] }
    ],
    items: [
      { x: 3, y: 3, item: "collectible_23", n: 1, flag: "item_halton_castle_1" },
      { x: 33, y: 29, item: "capsule_root", n: 3, hidden: true, flag: "item_halton_castle_2" }
    ],
    npcs: [
      { id: "npc_runcorn_rhodri", x: 18, y: 16, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_runcorn_halton_castle_1", sight: 0, script: "nw_halton_constable" }
    ],
    triggers: [
      { x: 8, y: 19, w: 3, h: 2, script: "nw_halton_spyglass", once: "halton_spyglass" }
    ]
  }, hc, NW.land({ "D": "door_wood", "N": "noticeboard", "%": "wall_stone_sandstone" }));

  // -------------------------------------------------- Norton Priory ------
  const np = B.canvas(40, 30, ",");
  B.frame(np, "T", 1);
  np.fill("g", 19, 28, 3, 2, "_");
  np.fill("g", 1, 1, 38, 28, ".");
  np.fill("g", 4, 3, 32, 18, "<");
  B.trees(np, "np-park", 30, 4, 3, 32, 18, "T", "y", ["<"]);
  np.fill("g", 10, 6, 20, 12, ",");
  np.box("g", 10, 6, 20, 12, "%");
  np.fill("g", 11, 7, 18, 10, "_");
  np.fill("g", 13, 9, 5, 6, "%"); np.fill("g", 22, 9, 5, 6, "%");
  np.fill("g", 14, 10, 3, 4, "_"); np.fill("g", 23, 10, 3, 4, "_");
  np.fill("g", 19, 17, 2, 1, "6");
  np.fill("g", 19, 18, 2, 10, "_");
  np.set("g", 20, 11, "M");
  np.set("g", 18, 13, "N"); np.set("g", 22, 16, "N");
  np.fill("g", 4, 22, 14, 6, ",");
  np.box("g", 4, 22, 14, 6, "h");
  np.fill("g", 5, 23, 12, 4, "l");
  np.set("g", 11, 22, "g");
  np.set("g", 6, 25, "'"); np.set("g", 15, 26, "o");
  np.fill("g", 24, 22, 12, 6, "9");
  np.set("g", 30, 24, "Q");
  NW.defLand("runcorn_norton_priory", {
    name: "Norton Priory", region: "mersey", weatherZone: "mersey", music: "town_frodsham", ambience: "town",
    dialogue: "town_runcorn",
    spawnPoint: { x: 20, y: 27 },
    landmark: { name: "Norton Priory", x: 20, y: 12 },
    encounters: { grass: "runcorn_norton_priory_grass", water: null },
    warps: NW.edge(19, 29, 3, true, "runcorn", 19, 40, "down"),
    signs: [
      { x: 18, y: 13, text: ["ST CHRISTOPHER — carved c.1390. Twelve feet of sandstone, painted once, in colours nobody recorded.",
        "He is carrying a child across a river and he does not look at all sure about it."] },
      { x: 22, y: 16, text: ["THE UNDERCROFT — the only bit of the priory the Brookes did not knock down when they built a house on it.",
        "Then they knocked the house down too. Then they built another one. Then that went as well."] }
    ],
    items: [
      { x: 6, y: 26, item: "damson", n: 4, flag: "item_norton_priory_1" },
      { x: 36, y: 4, item: "capsule_mesh", n: 3, hidden: true, flag: "item_norton_priory_2" }
    ],
    npcs: [
      { id: "npc_runcorn_enfys", x: 12, y: 24, dir: "right", sprite: "npc_historian", behaviour: "still", trainer: "tr_runcorn_norton_priory_1", sight: 0, script: "nw_priory_gardener" },
      { id: "npc_runcorn_priory_kid", x: 26, y: 21, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's carp in the pond older than my mum. That's what the sign said before somebody nicked the sign."] }
    ]
  }, np, NW.land({ "%": "wall_stone_sandstone", "_": "path_flag", "N": "noticeboard", "M": "statue", "'": "flowers_white", "l": "flowers_yellow", "o": "flowers_red", "9": "water_pond", "g": "gate_wood" }));

  // --------------------------------------------------- the six fridges ----
  const FRIDGE = [
    { who: "npc_granny", say: ["It was on offer. Two hundred and nine pounds and it tells you when the milk's off.", "It has never once been right about the milk."] },
    { who: "npc_dev", say: ["I know exactly what it's doing. I have known for a year.", "The app to turn it off needs an account and the account needs the app."] },
    { who: "npc_kid", say: ["Mum says don't touch the fridge. Mum says that about everything since the man came round."] },
    { who: "npc_walker", say: ["Salesman said 'smart'. I said smart how. He said just smart.", "Turns out he was right and I was asking the wrong question."] },
    { who: "npc_shopkeep", say: ["Six of us on this row bought it the same week off the same lad.", "He was very nice. That's the bit that gets me. He was genuinely very nice."] },
    { who: "npc_granny", say: ["It hums at night. Nothing wrong with a hum.", "It hums for exactly nine seconds every ninety. I've timed it. I've nothing else on."] }
  ];
  for (let i = 0; i < 6; i++) {
    const n = i + 1;
    W.defineMap("runcorn_fridge_house_" + n, W.builtin("house_small", {
      name: "Halton Brow " + (n * 2 + 1), region: "mersey", dialogue: "town_runcorn", music: "town_frodsham",
      warps: NW.exit(5, 9, "runcorn", 6 + i * 9, 34, "down"),
      npcs: [
        { id: "npc_runcorn_fridge_" + n, x: 6, y: 3, dir: "down", sprite: FRIDGE[i].who, behaviour: "still", say: FRIDGE[i].say },
        { id: "npc_runcorn_fridge_box_" + n, x: 7, y: 6, dir: "down", sprite: "npc_shadow_it", behaviour: "still",
          script: "nw_runcorn_fridge_" + n, cond: "!runcorn_fridge_" + n }
      ],
      signs: [{ x: 6, y: 6, text: ["A fridge. Chrome, silent, and connected to a network in a country nobody in this house has visited."] }]
    }));
  }

  W.defineMap("runcorn_care", W.builtin("care_centre", {
    name: "Runcorn Care Centre", region: "mersey", dialogue: "town_runcorn", music: "town_frodsham",
    warps: NW.exit(7, 11, "runcorn", 45, 22, "down"),
    npcs: [
      { id: "npc_runcorn_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Everything that comes in off the marsh is poisoned and everything that comes in off the bridge is exhausted."] },
      { id: "npc_runcorn_care_1", x: 12, y: 5, dir: "left", sprite: "npc_chemist", behaviour: "still",
        say: ["Ria trained here for a fortnight in 1998 and left because 'the paperwork wasn't good enough'.",
          "She was right. We fixed it. She still won't come in."] }
    ]
  }));
  W.defineMap("runcorn_mart", W.builtin("shop", {
    name: "Runcorn Mart", region: "mersey", dialogue: "town_runcorn", music: "town_frodsham",
    shop: "shop_runcorn",
    warps: NW.exit(6, 9, "runcorn", 56, 22, "down"),
    npcs: [
      { id: "npc_runcorn_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_runcorn",
        say: ["Antidotes by the box. We shift more of them than anything else and I've stopped finding that funny."] }
    ],
    items: [{ x: 12, y: 2, item: "panacea", n: 1, hidden: true, flag: "item_runcorn_mart_1" }]
  }));
})();
