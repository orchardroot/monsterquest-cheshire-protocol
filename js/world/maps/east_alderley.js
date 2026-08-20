// =============================================================
// MonsterQuest v2 — ALDERLEY EDGE & THE EDGE CAVERNS
// (region east, WORLD-BIBLE §2 J4 and J4-under)
// Red sandstone escarpment with a wizard legend and copper mines:
// Stormy Point, Castle Rock, the Beacon, the Wizard's Well and its
// carved face, and three levels of workings under all of it.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;

  const LEG = B.legend({
    "0": "wall_stone_sandstone", "1": "cliff_face", "2": "moor_path", "3": "cliff_top", "4": "crag",
    "5": "boulder", "6": "cliff_climb", "7": "rock_moor", "8": "sand", "9": "moor_heather",
    "E": "cave_entrance", "Q": "well", "U": "pine_needles", "J": "tree_pine", "Y": "tree_pine_top",
    "!": "path_gravel", "?": "grass_moor", ":": "ledge_down", ";": "gate_wood", "<": "bridge_wood",
    ">": "log", "[": "stump", "]": "berry_bush", "{": "fence_wood", "}": "rock_small",
    "|": "roof_tile_red", "$": "wall_render_white"
  });

  // ---------------------------------------------------------------- edge --
  const c = B.canvas(50, 40, ".");
  c.fill("g", 0, 0, 50, 2, "B");
  for (let x = 0; x < 50; x++) c.set("o", x, 0, "b");
  c.fill("g", 0, 2, 1, 37, "T");
  c.fill("g", 49, 2, 1, 37, "T");
  c.fill("g", 0, 39, 50, 1, "T");
  c.fill("g", 25, 0, 3, 2, "r");
  c.fill("o", 25, 0, 3, 1, " ");

  // ---- the village along London Road --------------------------------------
  c.fill("g", 1, 2, 48, 11, ",");
  c.fill("g", 1, 6, 48, 3, "r");
  c.fill("g", 1, 5, 48, 1, "-");
  c.fill("g", 1, 9, 48, 1, "-");
  c.fill("g", 25, 2, 3, 4, "r");
  for (let x = 4; x < 48; x += 7) { c.set("g", x, 5, "L"); c.set("g", x + 3, 9, "L"); }
  c.set("g", 10, 9, "O"); c.set("g", 33, 5, "n"); c.set("g", 18, 9, "u"); c.set("g", 40, 9, "H");
  // shops and the inn on the north side (doors face the pavement at row 5)
  B.house(c, { x: 3, y: 2, w: 9, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 14, y: 2, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 3, over: "^" });
  B.house(c, { x: 31, y: 2, w: 10, h: 3, rh: 1, roof: "|", wall: "$", win: "W", door: "D", doorX: 5, over: "^" });
  c.set("g", 32, 2, "m"); c.set("g", 39, 2, "m");
  B.house(c, { x: 43, y: 2, w: 6, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 2, over: "^" });
  c.set("g", 2, 5, "%"); c.set("g", 13, 5, "%"); c.set("g", 42, 5, "%");
  c.set("g", 30, 5, "N"); c.set("g", 12, 9, "N");
  // south side of the road: houses and the path onto the Edge
  B.house(c, { x: 3, y: 10, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  B.house(c, { x: 38, y: 10, w: 8, h: 3, rh: 1, roof: "R", wall: "#", win: "W", door: "D", doorX: 3, over: "^" });
  c.fill("g", 1, 13, 48, 2, ",");
  c.fill("g", 22, 9, 3, 6, "!");
  c.fill("g", 12, 12, 26, 1, "-");

  // ---- the birch wood on the slope ----------------------------------------
  c.fill("g", 1, 15, 48, 5, "U");
  B.trees(c, "edge-birch", 60, 1, 15, 48, 5, "B", "b", ["U"]);
  c.fill("g", 22, 15, 3, 5, "!");
  c.fill("g", 6, 17, 18, 2, "!");
  c.fill("g", 24, 17, 20, 2, "!");
  c.fill("g", 6, 17, 2, 5, "!");
  c.fill("g", 42, 17, 2, 5, "!");
  c.set("g", 12, 16, "["); c.set("g", 36, 16, ">"); c.set("g", 30, 15, "]");
  c.set("g", 23, 16, "N");

  // ---- the Edge itself: sandstone lip, Stormy Point, Castle Rock ----------
  c.fill("g", 1, 20, 48, 18, "?");
  c.fill("g", 1, 20, 48, 1, "3");
  c.fill("g", 6, 20, 2, 2, "!");
  c.fill("g", 42, 20, 2, 2, "!");
  c.fill("g", 22, 20, 3, 2, "!");
  // Castle Rock — a promontory west, with a drop
  c.fill("g", 4, 22, 13, 6, "3");
  c.fill("g", 5, 23, 11, 4, "4");
  c.fill("g", 7, 24, 7, 2, "8");
  c.fill("g", 9, 22, 3, 6, "!");
  c.fill("g", 4, 28, 13, 1, "1");
  c.set("g", 10, 28, "!"); c.set("g", 10, 29, "!");
  c.set("g", 6, 24, "5"); c.set("g", 15, 25, "5");
  c.set("g", 8, 22, "N");
  // Stormy Point — bare, wind-scoured, and where the old man stands
  c.fill("g", 28, 21, 16, 9, "8");
  c.fill("g", 30, 22, 12, 6, "3");
  c.fill("g", 31, 23, 10, 4, "8");
  c.set("g", 33, 24, "}"); c.set("g", 38, 26, "}"); c.set("g", 36, 22, "5");
  c.fill("g", 25, 22, 3, 8, "!");
  c.fill("g", 25, 25, 16, 1, "!");
  c.set("g", 41, 24, "E");           // the mine mouth into the copper workings
  c.set("g", 41, 25, "!");
  c.fill("g", 42, 25, 4, 1, "!");
  c.set("g", 44, 22, "N");
  c.set("g", 29, 29, ":"); c.set("g", 39, 29, ":");
  // the Beacon, south-centre, above the slide's mouth
  c.fill("g", 20, 30, 9, 6, "3");
  c.fill("g", 21, 31, 7, 4, "7");
  c.fill("g", 23, 32, 3, 2, "4");
  c.set("g", 24, 33, "q");
  c.fill("g", 24, 35, 1, 3, "!");
  c.fill("g", 24, 30, 1, 1, "!");
  c.set("g", 27, 34, "E");           // the rope-slide comes out here
  c.set("g", 27, 35, "!");
  c.fill("g", 25, 35, 3, 1, "!");
  c.set("g", 20, 34, "N");
  // the Wizard's Well and the carved face, on the lower path west
  c.fill("g", 2, 30, 14, 8, "9");
  c.fill("g", 3, 31, 12, 6, ",");
  c.fill("g", 3, 33, 12, 2, "!");
  c.set("g", 6, 33, "Q");
  c.fill("g", 5, 32, 4, 1, "1");
  c.set("g", 7, 32, "0");
  c.set("g", 4, 34, "N");
  // Elis Pennant's cottage above the Well
  B.house(c, { x: 10, y: 30, w: 6, h: 3, rh: 1, roof: "|", wall: "$", win: "W", door: "@", doorX: 2, over: "^" });
  c.set("g", 11, 30, "m");
  c.fill("g", 12, 33, 1, 1, "!");
  c.fill("g", 15, 33, 8, 1, "!");
  c.fill("g", 16, 29, 1, 5, "!");
  // the pine plantation and the fringe
  c.fill("g", 30, 31, 18, 7, "U");
  B.trees(c, "edge-pine", 46, 30, 31, 18, 7, "J", "Y", ["U"]);
  c.fill("g", 28, 36, 20, 1, "!");
  c.fill("g", 28, 30, 1, 7, "!");
  c.fill("g", 1, 36, 20, 2, "\"");
  c.fill("g", 17, 21, 8, 2, "\"");
  c.fill("g", 44, 30, 5, 4, "\"");
  c.set("g", 46, 20, "5"); c.set("g", 3, 21, "}");
  c.fill("g", 17, 26, 8, 4, "\"");
  c.fill("g", 21, 36, 6, 2, "\"");

  W.defineMap("alderley_edge", {
    name: "Alderley Edge", region: "bollin", outdoor: true, music: "town_alderley", weatherZone: "bollin",
    ambience: "forest", dialogue: "town_alderley_edge",
    legend: LEG, layers: c.layers(),
    spawnPoint: { x: 26, y: 1 },
    healPoint: { x: 7, y: 5 },
    landmark: { name: "Alderley Edge", x: 35, y: 25 },
    encounters: { grass: "alderley_edge_grass", water: null },
    fishing: "fish_alderley_edge",
    warps: [
      { x: 25, y: 0, to: "route_wilmslow_alderley", tx: 15, ty: 42, dir: "up", kind: "edge" },
      { x: 26, y: 0, to: "route_wilmslow_alderley", tx: 16, ty: 42, dir: "up", kind: "edge" },
      { x: 27, y: 0, to: "route_wilmslow_alderley", tx: 17, ty: 42, dir: "up", kind: "edge" },
      { x: 7, y: 4, to: "alderley_edge_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 17, y: 4, to: "alderley_edge_ropes", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 36, y: 4, to: "alderley_edge_wizard_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 45, y: 4, to: "alderley_edge_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 6, y: 12, to: "alderley_edge_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 41, y: 12, to: "alderley_edge_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 12, y: 32, to: "alderley_edge_elis_cottage", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 41, y: 24, to: "alderley_edge_caverns_b1", tx: 20, ty: 32, dir: "up", kind: "cave" },
      { x: 27, y: 34, to: "alderley_edge_caverns_slide", tx: 6, ty: 4, dir: "up", kind: "cave", cond: "edge_slide_open" }
    ],
    signs: [
      { x: 30, y: 5, text: ["THE WIZARD — free house, real fire, and a legend on the wall that the landlord insists is 'mostly true'."] },
      { x: 12, y: 9, text: ["ALDERLEY EDGE. Village first, escarpment second, and everybody here would put it the other way round."] },
      { x: 23, y: 16, text: ["THE EDGE — sandstone, birch, and two thousand years of people taking copper out of a hill.",
        "MINES ARE CLOSED. Entering without a lamp is how the mines stopped being closed."] },
      { x: 8, y: 22, text: ["CASTLE ROCK. The drop is sixty feet and the view is the whole Cheshire plain.",
        "On a clear day you can see Jodrell. The dish is not moving today. It is always moving."] },
      { x: 44, y: 22, text: ["STORMY POINT — where the beach was, two hundred million years ago.",
        "The sand under your boots was a desert. Everything here has been something else."] },
      { x: 4, y: 34, text: ["THE WIZARD'S WELL", "Cut into the rock: DRINK OF THIS AND TAKE THY FILL / FOR THE WATER FALLS BY THE WIZHARD'S WILL",
        "Above the words, a face. It is watching the path, not the well."] },
      { x: 20, y: 34, text: ["THE BEACON — an Armada beacon stood here. Fire, seen from Frodsham, seen from Mow Cop, seen from Wales.",
        "The oldest network in the county and every node was a person who agreed to stay up all night."] }
    ],
    items: [
      { x: 46, y: 32, item: "capsule_night", n: 3, flag: "item_alderley_1" },
      { x: 3, y: 37, item: "copper_wire", n: 2, hidden: true, flag: "item_alderley_2" },
      { x: 19, y: 22, item: "elixir", n: 1, flag: "item_alderley_3" },
      { x: 23, y: 37, item: "viewpoint_alderley_edge", n: 1, hidden: true, flag: "item_alderley_4" },
      { x: 18, y: 28, item: "capsule_kernel", n: 2, hidden: true, flag: "item_alderley_5" },
      { x: 47, y: 31, item: "torch", n: 1, hidden: true, flag: "item_alderley_6" }
    ],
    catGaps: [
      { x: 5, y: 32, item: "cat_token_9", n: 1, flag: "catgap_alderley_1",
        say: "MEADOW walks straight up the rock beside the Well, sits level with the carved face, and looks at it. The face has been looked at by a great many people. This is the first time it has been looked at back." }
    ],
    restPoints: [{ x: 24, y: 31, flag: "bigboy_sat_alderley" }],
    npcs: [
      { id: "npc_alderley_elis", x: 35, y: 24, dir: "down", sprite: "elis", behaviour: "still", script: "east_alderley_elis" },
      { id: "npc_alderley_gwil", x: 42, y: 26, dir: "up", sprite: "npc_miner", behaviour: "still", script: "east_alderley_gwil" },
      { id: "npc_alderley_caver_1", x: 26, y: 24, dir: "right", sprite: "npc_caver", behaviour: "look", radius: 3, trainer: "tr_alderley_edge_1", sight: 3 },
      { id: "npc_alderley_caver_2", x: 33, y: 28, dir: "up", sprite: "npc_caver", behaviour: "look", radius: 3, trainer: "tr_alderley_edge_2", sight: 3 },
      { id: "npc_alderley_teller", x: 10, y: 26, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_alderley_edge_3", sight: 0, script: "east_alderley_teller" },
      { id: "npc_alderley_kid", x: 24, y: 19, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's a farmer in the story who sells a white horse to a wizard and it opens a rock.",
          "My grandad says the story's about not being greedy. I think it's about the rock."] },
      { id: "npc_alderley_walker", x: 25, y: 26, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[25, 25], [40, 25]], pathMode: "pingpong",
        say: ["Whole hill's hollow. Two thousand years of people taking copper out of it and not one of them filling it back in."] },
      { id: "npc_alderley_villager", x: 20, y: 7, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["Somebody's been up at the Well at night with a light and a recorder.",
          "They say the carved face talks. I say a hillside makes noises and people are lonely."] },
      { id: "npc_alderley_ropes", x: 15, y: 7, dir: "up", sprite: "npc_caver", behaviour: "still",
        say: ["Rope, lamp, helmet, and somebody on the surface who knows what time you went in.",
          "That last one isn't equipment. That's the important one."] },
      { id: "npc_alderley_face", x: 8, y: 33, dir: "up", sprite: "npc_dev", behaviour: "still", script: "east_alderley_face" }
    ],
    triggers: [
      { x: 30, y: 25, w: 4, h: 1, script: "east_alderley_stormy", once: "elis_met", cond: "!elis_met" },
      { x: 41, y: 25, w: 1, h: 1, script: "east_alderley_minemouth", once: "merlynx_seen", cond: "!merlynx_seen" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("alderley_edge_care", W.builtin("care_centre", {
    name: "Alderley Edge Care Centre", region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
    warps: [
      { x: 7, y: 11, to: "alderley_edge", tx: 7, ty: 5, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "alderley_edge", tx: 7, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_alderley_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "machine",
        say: ["Sit them down. Half of what comes off that hill just needs warming up and telling it's over."] },
      { id: "npc_alderley_care_1", x: 11, y: 5, dir: "left", sprite: "npc_caver", behaviour: "still",
        say: ["Never go into the workings without a lamp. Not a torch. A lamp.",
          "A torch tells you what's in front of you. A lamp tells you whether you should be there at all."] }
    ]
  }));

  W.defineMap("alderley_edge_mart", W.builtin("shop", {
    name: "Edge Stores", region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
    shop: "shop_alderley_edge",
    warps: [
      { x: 6, y: 9, to: "alderley_edge", tx: 45, ty: 5, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "alderley_edge", tx: 45, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_alderley_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_alderley_edge",
        say: ["Capsules, salves, and a shelf of things for the dark that I sell more of every week."] }
    ],
    items: [{ x: 12, y: 2, item: "capsule_night", n: 2, flag: "item_alderley_mart_1" }]
  }));

  W.defineMap("alderley_edge_ropes", W.builtin("shop", {
    name: "Edge Ropes & Lamps", region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
    shop: "shop_alderley_ropes",
    warps: [
      { x: 6, y: 9, to: "alderley_edge", tx: 17, ty: 5, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "alderley_edge", tx: 17, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_alderley_ropes_clerk", x: 1, y: 5, dir: "down", sprite: "npc_caver", behaviour: "still", shop: "shop_alderley_ropes",
        say: ["Rope by the metre, lamps by the day, and the book by the door is a list of who's underground.",
          "Sign it. If you're not on it, nobody comes."] },
      { id: "npc_alderley_ropes_1", x: 10, y: 3, dir: "left", sprite: "npc_caver", behaviour: "still", script: "east_alderley_survey" }
    ],
    items: [{ x: 12, y: 2, item: "torch", n: 1, flag: "item_alderley_ropes_1" }]
  }));

  W.defineMap("alderley_edge_wizard_inn", W.builtin("pub", {
    name: "The Wizard", region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
    warps: [
      { x: 6, y: 11, to: "alderley_edge", tx: 36, ty: 5, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "alderley_edge", tx: 36, ty: 5, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_wizard_landlord", x: 2, y: 2, dir: "down", sprite: "npc_publican", behaviour: "still", kind: "bed", script: "east_alderley_landlord" },
      { id: "npc_wizard_inn_1", x: 9, y: 5, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["The farmer took the money and went home rich and the horse went into the hill.",
          "Nobody in the story is punished. That's what makes it a Cheshire story. It just... happened, and it's still happening."] },
      { id: "npc_wizard_inn_2", x: 4, y: 8, dir: "up", sprite: "npc_caver", behaviour: "still",
        say: ["Somebody's shifted a copper shipment out of the b2 level. Ore that's been sat there since 1919.",
          "Whoever it was knew the survey. Better than us, and we WROTE the survey."] }
    ],
    signs: [{ x: 4, y: 1, text: ["A painted sign, cracked: a farmer, a white horse and a man in a long coat at a rock.", "The man's face has been repainted more recently than the rest of it."] }]
  }));

  W.defineMap("alderley_edge_elis_cottage", W.builtin("house_small", {
    name: "Elis Pennant's Cottage", region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
    warps: [
      { x: 5, y: 9, to: "alderley_edge", tx: 12, ty: 33, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "alderley_edge", tx: 12, ty: 33, dir: "down", kind: "door" }
    ],
    npcs: [
      { id: "npc_elis_home", x: 6, y: 3, dir: "down", sprite: "elis", behaviour: "still", script: "east_alderley_elis_home", cond: "elis_met" },
      { id: "npc_elis_cat", x: 1, y: 6, dir: "right", sprite: "cat", behaviour: "still",
        say: ["A very old cat on a very good cushion declines to acknowledge the door, you, or the century."] }
    ],
    signs: [
      { x: 4, y: 1, text: ["A shelf of notebooks in two hands: Welsh and an engineer's block capitals.",
        "One spine reads GROUNDING — 3. Volumes 1, 2 and 4 are here. Volume 3 is not."] }
    ],
    items: [{ x: 1, y: 3, item: "field_notebook", n: 1, hidden: true, flag: "item_elis_cottage_1" }]
  }));

  const homes = [
    { id: "alderley_edge_house_1", tx: 6, ty: 13, name: "Sandhills Cottage",
      npc: { id: "npc_alderley_h1", sprite: "npc_granny", say: ["Sixty-one years under this hill and it's never once been quiet.",
        "Water moves in it. Always has. What's new is that it moves in TIME with something."] } },
    { id: "alderley_edge_house_2", tx: 41, ty: 13, name: "Beacon View",
      npc: { id: "npc_alderley_h2", sprite: "npc_dev", say: ["We bought it for the view and we've spent four years looking at a laptop in front of the view.",
        "That's not the house's fault."] } }
  ];
  for (let i = 0; i < homes.length; i++) {
    const hh = homes[i];
    W.defineMap(hh.id, W.builtin("house_small", {
      name: hh.name, region: "bollin", dialogue: "town_alderley_edge", music: "town_alderley",
      warps: [
        { x: 5, y: 9, to: "alderley_edge", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "alderley_edge", tx: hh.tx, ty: hh.ty, dir: "down", kind: "door" }
      ],
      npcs: [{ id: hh.npc.id, x: 6, y: 3, dir: "down", sprite: hh.npc.sprite, behaviour: "still", say: hh.npc.say }]
    }));
  }

  // ============================================== the Edge Caverns =========
  // B1 — the copper workings. Loops around a vertical shaft, a side gallery,
  // and the mine mouth where MERLYNX is seen in Ch.2 and not followed.
  const b1 = B.caveLegend({ "g": "crystal", "q": "mine_prop" });
  const m1 = B.canvas(40, 34, "#");
  m1.fill("g", 2, 2, 36, 30, ",");
  m1.fill("g", 4, 4, 32, 26, ".");
  m1.fill("g", 18, 30, 4, 4, "_");
  m1.set("g", 20, 33, "E");
  // the loop: two galleries round a shaft
  m1.fill("g", 10, 10, 20, 14, "#");
  m1.fill("g", 14, 13, 12, 8, "~");
  m1.fill("g", 13, 12, 14, 1, "e");
  m1.fill("g", 13, 21, 14, 1, "e");
  m1.fill("g", 12, 12, 1, 10, "e");
  m1.fill("g", 27, 12, 1, 10, "e");
  m1.fill("g", 19, 10, 2, 3, "b");
  m1.fill("g", 19, 21, 2, 3, "b");
  m1.fill("g", 4, 16, 8, 2, "_");
  m1.fill("g", 28, 16, 8, 2, "_");
  m1.fill("g", 4, 16, 1, 2, "_");
  // mine cart rails round the outer gallery
  m1.fill("g", 5, 6, 30, 1, "-");
  m1.fill("g", 5, 27, 30, 1, "-");
  m1.set("g", 8, 6, "K"); m1.set("g", 30, 27, "K");
  m1.set("g", 6, 5, "o"); m1.set("g", 33, 5, "o"); m1.set("g", 6, 29, "o"); m1.set("g", 33, 29, "o");
  m1.set("g", 15, 5, "c"); m1.set("g", 25, 29, "c");
  m1.set("g", 5, 12, "z"); m1.set("g", 35, 22, "z");
  m1.set("g", 20, 28, "N");
  // the side gallery, down to B2
  m1.fill("g", 33, 8, 4, 3, ",");
  m1.set("g", 35, 9, "d");
  m1.fill("g", 35, 7, 1, 2, "_");
  m1.fill("g", 33, 7, 4, 1, "_");
  m1.set("g", 5, 25, "8");
  W.defineMap("alderley_edge_caverns_b1", {
    name: "Edge Caverns — the Copper Workings", region: "interior", outdoor: false,
    music: "town_alderley", ambience: "cave", dialogue: "town_alderley_edge", dark: true,
    legend: b1, layers: m1.layers(),
    spawnPoint: { x: 20, y: 32 },
    landmark: { name: "The Copper Workings", x: 20, y: 17 },
    encounters: { cave: "alderley_edge_caverns_b1_cave", water: "alderley_edge_caverns_b1_water" },
    warps: [
      { x: 20, y: 33, to: "alderley_edge", tx: 41, ty: 25, dir: "down", kind: "cave" },
      { x: 35, y: 9, to: "alderley_edge_caverns_b2", tx: 6, ty: 6, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 20, y: 28, text: ["A board, and a chalked list of levels: WOOD MINE, ENGINE VEIN, HOUGH LEVEL, and one more with the chalk rubbed out.",
        "Under it, in a hand that is not a caver's: 'the last one is not a level'"] }
    ],
    items: [
      { x: 6, y: 4, item: "copper_wire", n: 3, flag: "item_edge_b1_1" },
      { x: 34, y: 30, item: "capsule_kernel", n: 2, hidden: true, flag: "item_edge_b1_2" },
      { x: 5, y: 30, item: "elixir", n: 1, hidden: true, flag: "item_edge_b1_3" },
      { x: 36, y: 12, item: "davy_lamp", n: 1, hidden: true, flag: "item_edge_b1_4" }
    ],
    npcs: [
      { id: "npc_edge_b1_caver_1", x: 8, y: 17, dir: "right", sprite: "npc_caver", behaviour: "look", radius: 3, trainer: "tr_alderley_edge_caverns_b1_1", sight: 3 },
      { id: "npc_edge_b1_caver_2", x: 31, y: 17, dir: "left", sprite: "npc_caver", behaviour: "look", radius: 3, trainer: "tr_alderley_edge_caverns_b1_2", sight: 3 },
      { id: "npc_edge_b1_surveyor", x: 20, y: 26, dir: "up", sprite: "npc_miner", behaviour: "still", script: "east_edge_surveyor" }
    ],
    triggers: [
      { x: 19, y: 9, w: 2, h: 1, script: "east_edge_merlynx", once: "merlynx_glimpse", cond: "!merlynx_glimpse" }
    ]
  });

  // B2 — the Hough Level: a flooded tunnel. Narrowboat later; a rope-slide
  // shortcut back up to the Beacon opens once you have crossed it.
  const m2 = B.canvas(38, 26, "#");
  m2.fill("g", 2, 2, 34, 22, ",");
  m2.fill("g", 4, 4, 30, 18, ".");
  m2.fill("g", 4, 4, 5, 4, "_");
  m2.set("g", 6, 5, "u");
  m2.fill("g", 8, 9, 24, 9, "~");
  m2.fill("g", 8, 8, 24, 1, "e");
  m2.fill("g", 8, 18, 24, 1, "e");
  m2.fill("g", 4, 9, 4, 9, "_");
  m2.fill("g", 32, 9, 3, 9, "_");
  m2.fill("g", 12, 8, 3, 1, "s"); m2.fill("g", 26, 18, 3, 1, "s");
  m2.set("g", 18, 12, "b"); m2.set("g", 18, 13, "b"); m2.set("g", 18, 14, "b");
  m2.set("g", 5, 12, "o"); m2.set("g", 34, 14, "o");
  m2.set("g", 10, 21, "c"); m2.set("g", 30, 5, "c");
  m2.fill("g", 30, 20, 5, 3, ",");
  m2.set("g", 33, 21, "d");
  m2.fill("g", 33, 19, 1, 2, "_");
  m2.fill("g", 30, 19, 5, 1, "_");
  m2.set("g", 6, 21, "8");
  m2.fill("g", 4, 20, 4, 3, "_");
  m2.set("g", 20, 20, "N");
  m2.fill("g", 8, 20, 24, 1, "_");
  m2.set("g", 20, 21, "N");
  W.defineMap("alderley_edge_caverns_b2", {
    name: "Edge Caverns — the Hough Level", region: "interior", outdoor: false,
    music: "town_alderley", ambience: "cave", dialogue: "town_alderley_edge", dark: true,
    legend: B.caveLegend({}), layers: m2.layers(),
    spawnPoint: { x: 6, y: 6 },
    landmark: { name: "The Hough Level", x: 20, y: 13 },
    encounters: { cave: "alderley_edge_caverns_b2_cave", water: "alderley_edge_caverns_b2_water" },
    fishing: "fish_alderley_edge",
    warps: [
      { x: 6, y: 5, to: "alderley_edge_caverns_b1", tx: 35, ty: 10, dir: "up", kind: "stairs" },
      { x: 33, y: 21, to: "alderley_edge_caverns_b3", tx: 20, ty: 30, dir: "down", kind: "stairs", cond: "knights_hall_open" },
      { x: 6, y: 21, to: "alderley_edge_caverns_slide", tx: 6, ty: 16, dir: "up", kind: "stairs" }
    ],
    signs: [
      { x: 20, y: 21, text: ["THE HOUGH LEVEL — driven 1857 to drain the workings. It drains nothing now; it holds.",
        "A rope has been rigged along the far wall by somebody who did not sign the book."] }
    ],
    items: [
      { x: 34, y: 10, item: "capsule_root", n: 1, hidden: true, flag: "item_edge_b2_1" },
      { x: 5, y: 17, item: "full_restore", n: 1, hidden: true, flag: "item_edge_b2_2" },
      { x: 31, y: 22, item: "collectible_7", n: 1, hidden: true, flag: "item_edge_b2_3" }
    ],
    npcs: [
      { id: "npc_edge_b2_nesta", x: 33, y: 12, dir: "left", sprite: "npc_caver", behaviour: "look", radius: 3, trainer: "tr_alderley_edge_caverns_b2_1", sight: 3 },
      { id: "npc_edge_b2_caver", x: 5, y: 10, dir: "right", sprite: "npc_caver", behaviour: "still",
        say: ["Water's warmer than the rock. That means it's moving and it means it's coming from somewhere.",
          "There's no somewhere. This is the bottom of the survey."] }
    ]
  });

  // B3 — the Cave of the Knights. Post-game; MERLYNX properly, and the
  // sleeping knights standing as elite rematches once the hall is open.
  const m3 = B.canvas(40, 32, "#");
  m3.fill("g", 2, 2, 36, 28, ",");
  m3.fill("g", 5, 4, 30, 24, ".");
  m3.fill("g", 18, 28, 4, 4, "_");
  m3.set("g", 20, 31, "d");
  m3.fill("g", 10, 8, 20, 14, "_");
  m3.box("g", 10, 8, 20, 14, "w");
  m3.fill("g", 12, 10, 16, 10, "_");
  m3.fill("g", 18, 21, 4, 1, "_");
  for (let i = 0; i < 5; i++) { m3.set("g", 13 + i * 3, 11, "z"); m3.set("g", 13 + i * 3, 19, "z"); }
  m3.fill("g", 18, 13, 4, 4, "c");
  m3.set("g", 7, 6, "o"); m3.set("g", 32, 6, "o"); m3.set("g", 7, 26, "o"); m3.set("g", 32, 26, "o");
  m3.set("g", 20, 23, "N");
  m3.fill("g", 5, 14, 5, 3, "~");
  m3.fill("g", 30, 14, 5, 3, "~");
  m3.set("g", 6, 24, "8");
  W.defineMap("alderley_edge_caverns_b3", {
    name: "The Cave of the Knights", region: "interior", outdoor: false,
    music: "town_alderley", ambience: "cave", dialogue: "town_alderley_edge", dark: true,
    legend: B.caveLegend({}), layers: m3.layers(),
    spawnPoint: { x: 20, y: 30 },
    landmark: { name: "The Cave of the Knights", x: 20, y: 15 },
    encounters: { cave: "alderley_edge_caverns_b3_cave", water: null },
    warps: [{ x: 20, y: 31, to: "alderley_edge_caverns_b2", tx: 33, ty: 20, dir: "up", kind: "stairs" }],
    npcs: [
      { id: "npc_edge_b3_knight", x: 20, y: 20, dir: "up", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "tr_alderley_edge_caverns_b3_1", sight: 0, cond: "knights_hall_open" }
    ],
    signs: [
      { x: 20, y: 23, text: ["A hall, and along both walls a row of shapes that are almost people, and almost stone.",
        "They are waiting for a day somebody promised them. Nobody has come to say the day is off."] }
    ],
    items: [
      { x: 6, y: 5, item: "collectible_8", n: 1, hidden: true, flag: "item_edge_b3_1" },
      { x: 33, y: 27, item: "full_restore", n: 2, hidden: true, flag: "item_edge_b3_2" }
    ],
    npcs: []
  });

  // The rope-slide shortcut: one short passage that comes out at the Beacon.
  const ms = B.canvas(14, 22, "#");
  ms.fill("g", 2, 2, 10, 18, ",");
  ms.fill("g", 4, 3, 6, 16, ".");
  ms.fill("g", 5, 2, 4, 3, "_");
  ms.set("g", 6, 2, "E");
  ms.fill("g", 5, 15, 4, 5, "_");
  ms.set("g", 6, 17, "z"); ms.set("g", 8, 6, "o");
  ms.set("g", 6, 12, "N");
  ms.fill("g", 5, 16, 4, 1, "-");
  W.defineMap("alderley_edge_caverns_slide", {
    name: "The Rope Slide", region: "interior", outdoor: false, music: "town_alderley",
    ambience: "cave", dialogue: "town_alderley_edge", dark: true,
    legend: B.caveLegend({}), layers: ms.layers(),
    spawnPoint: { x: 6, y: 16 },
    encounters: { cave: "alderley_edge_caverns_slide_cave", grass: null },
    warps: [
      { x: 6, y: 2, to: "alderley_edge", tx: 27, ty: 35, dir: "up", kind: "cave" },
      { x: 6, y: 17, to: "alderley_edge_caverns_b2", tx: 6, ty: 20, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 6, y: 12, text: ["A rope, a pulley, and a scaffold pole wedged across the passage.",
        "Somebody's rigged a way out that takes four minutes instead of forty. They have also left a helmet.",
        "The helmet has a name in it. The name is not one of the club's."] }
    ],
    items: [{ x: 9, y: 18, item: "capsule_quick", n: 2, hidden: true, flag: "item_edge_slide_1" }],
    npcs: []
  });
})();
