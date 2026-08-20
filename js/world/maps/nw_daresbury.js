// =============================================================
// MonsterQuest v2 — DARESBURY (region mersey, Ch.9)
// Lewis Carroll's birthplace and a particle-physics campus, half a mile
// apart, with a hyperscale datacentre between them and a canal along
// the bottom. All Saints' Alice windows have a grin in the third light
// that is not in the book. Includes R22 (both halves of the fog lane).
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();

  // ------------------------------------------------------------ village ---
  const c = B.canvas(52, 40, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 52; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 18, 2, 4, "r");
  c.fill("g", 50, 18, 2, 4, "r");
  c.fill("g", 2, 2, 48, 36, ",");

  // the Bridgewater along the south
  c.fill("g", 2, 33, 48, 3, "~");
  c.fill("g", 2, 32, 48, 1, "t");
  c.fill("g", 2, 36, 48, 1, "t");
  c.fill("g", 20, 32, 4, 5, "x");
  c.set("g", 12, 34, "J"); c.set("g", 38, 34, "J");
  c.set("g", 26, 32, "Q"); c.set("g", 8, 36, "Q");
  c.fill("g", 2, 37, 48, 1, ",");

  // the lane through the village
  c.fill("g", 2, 18, 48, 3, "r");
  c.fill("g", 2, 19, 48, 1, "|");
  c.fill("g", 2, 17, 48, 1, "-");
  c.fill("g", 2, 21, 48, 1, "-");
  c.fill("g", 22, 21, 2, 11, "_");
  for (let x = 6; x < 50; x += 8) c.set("g", x, 17, "L");
  c.set("g", 10, 21, "O"); c.set("g", 30, 21, "u"); c.set("g", 42, 17, "q");

  // All Saints', with the Alice windows, in a big churchyard
  c.fill("g", 4, 4, 20, 13, ",");
  c.box("g", 4, 4, 20, 13, "w");
  B.house(c, { x: 8, y: 6, w: 12, h: 8, rh: 3, roof: "p", wall: "c", win: "C", door: "v", doorX: 5 });
  c.set("g", 11, 5, "p");
  c.scatter("g", "dar-graves", "n", 16, 5, 5, 18, 11, [","]);
  c.set("g", 13, 4, "g");
  c.fill("g", 13, 14, 1, 4, "_");
  c.set("g", 6, 15, "N");

  // the campus: glass, a tower, a fenced beamline hall
  c.fill("g", 28, 3, 22, 14, "=");
  B.house(c, { x: 30, y: 5, w: 8, h: 5, rh: 1, roof: "1", wall: "0", win: "W", door: "S", doorX: 3 });
  B.house(c, { x: 40, y: 4, w: 8, h: 9, rh: 1, roof: "1", wall: "0", win: "V", door: "S", doorX: 3 });
  c.set("g", 44, 3, "\\");
  c.fill("g", 29, 12, 20, 4, "F");
  c.fill("g", 30, 13, 18, 2, "=");
  c.set("g", 39, 12, "G");
  c.set("g", 29, 11, "N"); c.set("g", 48, 11, "N");
  c.fill("g", 34, 10, 1, 8, "_");
  c.fill("g", 44, 13, 1, 5, "_");

  // the care centre and the shop on the lane
  B.house(c, { x: 4, y: 23, w: 10, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 3, 26, "N");
  B.house(c, { x: 32, y: 23, w: 9, h: 5, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 31, 26, "N");
  B.house(c, { x: 44, y: 24, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "D", doorX: 2, over: ";" });
  c.fill("g", 4, 28, 46, 1, "-");

  // THE STACK — grey, well lit, extremely polite, behind a wire fence
  c.fill("g", 16, 24, 14, 8, "F");
  c.fill("g", 17, 25, 12, 6, "=");
  B.house(c, { x: 18, y: 25, w: 10, h: 5, rh: 1, roof: "1", wall: "0", win: "V", door: "S", doorX: 4 });
  c.set("g", 22, 24, "G");
  c.set("g", 15, 27, "N");
  c.set("g", 19, 24, "3"); c.set("g", 27, 24, "3");
  c.fill("g", 22, 30, 2, 2, "=");

  // a green, a couple of grin-shaped cats, and rough ground
  c.fill("g", 4, 30, 10, 2, '"');
  c.fill("g", 42, 30, 7, 2, '"');
  c.fill("g", 26, 3, 1, 14, "T");

  W.defineMap("daresbury", {
    name: "Daresbury", region: "mersey", outdoor: true, music: "town_frodsham", weatherZone: "mersey",
    ambience: "town", dialogue: "town_daresbury",
    legend: NW.town({ "\\": "radio_mast" }),
    layers: c.layers(),
    spawnPoint: { x: 24, y: 19 },
    healPoint: { x: 9, y: 21 },
    landmark: { name: "Daresbury", x: 24, y: 19 },
    encounters: { grass: "daresbury_grass", water: null },
    warps: [].concat(
      NW.edge(51, 18, 4, false, "route_daresbury_runcorn", 1, 18, "right"),
      NW.edge(0, 18, 4, false, "route_warrington_daresbury", 54, 18, "left"),
      NW.exit(8, 27, "daresbury_care", 7, 10, "up"),
      NW.exit(36, 27, "daresbury_mart", 6, 8, "up"),
      [
        { x: 13, y: 13, to: "daresbury_church", tx: 6, ty: 12, dir: "up", kind: "door" },
        { x: 43, y: 12, to: "daresbury_lab", tx: 14, ty: 26, dir: "up", kind: "door" },
        { x: 33, y: 9, to: "daresbury_lab", tx: 14, ty: 26, dir: "up", kind: "door" },
        { x: 22, y: 29, to: "stack_lobby", tx: 16, ty: 26, dir: "up", kind: "door", cond: "item.stack_lanyard || stack_doors_opened > 0" },
        { x: 23, y: 29, to: "stack_lobby", tx: 16, ty: 26, dir: "up", kind: "door", cond: "item.stack_lanyard || stack_doors_opened > 0" },
        { x: 46, y: 27, to: "daresbury_house_1", tx: 5, ty: 8, dir: "up", kind: "door" }
      ]
    ),
    signs: [
      { x: 6, y: 15, text: ["ALL SAINTS' DARESBURY", "Charles Lutwidge Dodgson was christened here in 1832. He wrote under another name.",
        "The Lewis Carroll window is in the south aisle. Count the faces in the third light. Count them twice."] },
      { x: 29, y: 11, text: ["SCI-TECH DARESBURY", "Synchrotron light source, accelerator hall, and a tower you can see from Frodsham Hill."] },
      { x: 48, y: 11, text: ["BEAMLINE 7 — ACCESS RESTRICTED.", "A laminated note: 'PLEASE DO NOT FEED WHATEVER IS LIVING IN THE VACUUM VESSEL.'",
        "It is not clear whether this is a joke and nobody at the desk will be drawn."] },
      { x: 15, y: 27, text: ["THE STACK — DARESBURY CAMPUS", "No logo. No company name. A polite sign about deliveries and a very good coffee machine in reception.",
        "The gate opens for a contractor's lanyard and nothing else, and the contractors are nicer than you."] },
      { x: 3, y: 26, text: ["CARE CENTRE — DARESBURY", "Small, calm, and running the same triage system as everywhere else in the county."] },
      { x: 31, y: 26, text: ["VILLAGE SHOP — papers, milk, capsules, and a postcard rack nobody has restocked since 2011."] }
    ],
    items: [
      { x: 4, y: 31, item: "capsule_kernel", n: 4, flag: "item_daresbury_1" },
      { x: 48, y: 31, item: "elixir", n: 2, flag: "item_daresbury_2" },
      { x: 5, y: 37, item: "capsule_night", n: 3, hidden: true, flag: "item_daresbury_3" },
      { x: 47, y: 5, item: "cipher_chip", n: 2, hidden: true, flag: "item_daresbury_4" }
    ],
    catGaps: [
      { x: 25, y: 24, item: "cat_token_10", n: 1, flag: "catgap_daresbury_1",
        say: "MEADOW slips under the datacentre fence. Four seconds. She comes back with a lanyard clip and no lanyard, and she is extremely pleased with herself." }
    ],
    restPoints: [{ x: 27, y: 21, flag: "bigboy_sat_daresbury" }],
    npcs: [
      { id: "npc_daresbury_quill", x: 38, y: 14, dir: "down", sprite: "npc_dev", behaviour: "still", trainer: "tr_daresbury_1", sight: 0, script: "nw_daresbury_quill" },
      { id: "npc_daresbury_verger", x: 15, y: 15, dir: "down", sprite: "npc_historian", behaviour: "still", trainer: "tr_daresbury_2", sight: 0, script: "nw_daresbury_verger" },
      { id: "npc_daresbury_contractor", x: 21, y: 30, dir: "down", sprite: "npc_shadow_it", behaviour: "still", script: "nw_stack_gate" },
      { id: "npc_daresbury_grinkit", x: 8, y: 31, dir: "down", sprite: "cat_grinkit", behaviour: "wander", radius: 3, script: "nw_daresbury_grinkit" },
      { id: "npc_daresbury_walker", x: 30, y: 20, dir: "left", sprite: "npc_walker", behaviour: "path", path: [[30, 20], [44, 20]], pathMode: "pingpong",
        say: ["Village, church, canal, and a building full of other people's memories with no name on the door.",
          "The parish council asked what it was for. They got a very polite letter."] },
      { id: "npc_daresbury_boater", x: 30, y: 36, dir: "up", sprite: "npc_boater", behaviour: "still",
        say: ["Bridgewater runs right past their cooling plant. The water goes in cold and comes out warm.",
          "Best fishing on the cut in January and nobody says why."] },
      { id: "npc_daresbury_kid", x: 18, y: 21, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["There's a cat on the church roof that's mostly smile.", "It said my name back to me. Backwards. I liked it."] }
    ],
    triggers: [
      { x: 22, y: 31, w: 2, h: 1, script: "nw_stack_first_look", once: "stack_first_look", cond: "chapter >= 9" }
    ]
  });

  W.defineMap("daresbury_care", W.builtin("care_centre", {
    name: "Daresbury Care Centre", region: "mersey", dialogue: "town_daresbury", music: "town_frodsham",
    warps: NW.exit(7, 11, "daresbury", 8, 28, "down"),
    npcs: [
      { id: "npc_daresbury_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["We are two hundred yards from the biggest computer in the north-west and our booking system is a diary."] }
    ]
  }));
  W.defineMap("daresbury_mart", W.builtin("shop", {
    name: "Daresbury Village Shop", region: "mersey", dialogue: "town_daresbury", music: "town_frodsham",
    shop: "shop_daresbury",
    warps: NW.exit(6, 9, "daresbury", 36, 28, "down"),
    npcs: [
      { id: "npc_daresbury_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_daresbury",
        say: ["Half my trade is contractors buying sandwiches and being extremely apologetic about the queue."] }
    ]
  }));
  W.defineMap("daresbury_house_1", W.builtin("house_small", {
    name: "Canal Cottage", region: "mersey", dialogue: "town_daresbury", music: "town_frodsham",
    warps: NW.exit(5, 9, "daresbury", 46, 28, "down"),
    npcs: [{
      id: "npc_daresbury_h1", x: 6, y: 3, dir: "down", sprite: "npc_granny", behaviour: "still",
      say: ["I have lived here since before the campus and long before the other one.",
        "The campus makes a noise. The other one doesn't make any noise at all, and that's what I mind."]
    }]
  }));

  // ---------------------------------------------- All Saints', Daresbury --
  const ch = B.canvas(16, 16, ":");
  ch.box("g", 0, 0, 16, 16, "%");
  ch.fill("g", 1, 0, 14, 1, "^");
  ch.fill("g", 2, 1, 3, 1, "W"); ch.fill("g", 11, 1, 3, 1, "W");
  ch.fill("g", 4, 3, 8, 8, "-");
  for (let y = 4; y < 11; y += 2) { ch.fill("g", 2, y, 2, 1, "c"); ch.fill("g", 12, y, 2, 1, "c"); }
  ch.set("g", 7, 2, "t"); ch.set("g", 8, 2, "t");
  ch.fill("g", 1, 5, 1, 6, "z");
  ch.fill("g", 14, 5, 1, 6, "z");
  ch.set("g", 1, 12, "N"); ch.set("g", 14, 12, "N");
  NW.doorway(ch, 7, 15, "D");
  NW.defIn("daresbury_church", {
    name: "All Saints' Daresbury", region: "mersey", music: "town_congleton", ambience: "town", dialogue: "town_daresbury",
    spawnPoint: { x: 7, y: 14 },
    warps: NW.exit(7, 15, "daresbury", 13, 14, "down"),
    encounters: { grass: null },
    signs: [
      { x: 1, y: 12, text: ["THE LEWIS CARROLL WINDOW", "Alice, the Hatter, the Gryphon, the Mock Turtle, the Dodo, and the Cheshire Cat in the third light.",
        "Installed 1935. The cat's grin is wider than the cartoon and always has been. Ask the verger. Do not ask twice."] },
      { x: 14, y: 12, text: ["A mirror, mounted opposite the window so visitors can see the glass without craning.",
        "In the mirror the third light has one more face in it than it has in the window."] }
    ],
    items: [{ x: 2, y: 13, item: "collectible_22", n: 1, hidden: true, flag: "item_daresbury_church_1" }],
    npcs: [
      { id: "npc_daresbury_church_verger", x: 8, y: 4, dir: "down", sprite: "npc_historian", behaviour: "still", script: "nw_alice_mirror" },
      { id: "npc_daresbury_church_visitor", x: 4, y: 9, dir: "right", sprite: "npc_tourist", behaviour: "still",
        say: ["I have photographed this window eleven times and it has come out differently twice."] }
    ]
  }, ch, NW.inside({ "z": "mirror", "c": "chair", "t": "table", "%": "church_wall", "W": "church_window", "N": "painting" }));

  // ------------------------------------------------------ the beamline ----
  const lb = B.canvas(30, 28, "+");
  lb.box("g", 0, 0, 30, 28, "w");
  lb.fill("g", 1, 0, 28, 1, "^");
  lb.fill("g", 1, 1, 28, 1, "0");
  lb.fill("g", 3, 4, 24, 1, "r");
  lb.fill("g", 3, 4, 1, 14, "r");
  lb.fill("g", 26, 4, 1, 14, "r");
  lb.fill("g", 3, 17, 24, 1, "r");
  lb.fill("g", 13, 17, 3, 1, "+");
  lb.fill("g", 8, 8, 14, 6, "H");
  lb.fill("g", 5, 6, 3, 1, "b"); lb.fill("g", 22, 6, 3, 1, "b");
  lb.fill("g", 5, 15, 3, 1, "b"); lb.fill("g", 22, 15, 3, 1, "b");
  lb.fill("g", 2, 20, 8, 1, "T"); lb.fill("g", 20, 20, 8, 1, "T");
  lb.fill("g", 12, 20, 6, 3, "R");
  lb.set("g", 6, 23, "N"); lb.set("g", 23, 23, "N");
  NW.doorway(lb, 14, 27, "D");
  NW.defIn("daresbury_lab", {
    name: "Sci-Tech Daresbury", region: "mersey", music: "dungeon_stack", ambience: "industrial", dialogue: "town_daresbury",
    spawnPoint: { x: 14, y: 26 },
    warps: [].concat(
      NW.exit(14, 27, "daresbury", 43, 13, "down"),
      [{ x: 1, y: 26, to: "daresbury", tx: 33, ty: 10, dir: "down", kind: "door" }]
    ),
    encounters: { grass: null },
    signs: [
      { x: 6, y: 23, text: ["THE RING", "Electrons at very nearly the speed of light, bent round a corner, complaining in X-rays.",
        "We use the complaint. That is the entire science."] },
      { x: 23, y: 23, text: ["VACUUM VESSEL 7 — DO NOT FEED", "Somebody has taped a list underneath of what has been fed to it anyway, by date, with initials."] }
    ],
    items: [{ x: 28, y: 26, item: "copper_coil", n: 2, hidden: true, flag: "item_daresbury_lab_1" }],
    npcs: [
      { id: "npc_daresbury_sorcha", x: 15, y: 19, dir: "down", sprite: "npc_dev", behaviour: "still", trainer: "tr_daresbury_lab_1", sight: 3 },
      { id: "npc_daresbury_lab_1", x: 6, y: 6, dir: "down", sprite: "npc_dev", behaviour: "still",
        say: ["Half the things nesting in beamline seven weren't born. They were deployed.",
          "We can tell. Born ones are scared of the light."] }
    ]
  }, lb, NW.inside());

  // =====================================================================
  // R22 — Keckwick Lane (Warrington side) and Daresbury Lane (Runcorn side)
  // =====================================================================
  function foglane(id, def, seedTag, eastMap, eastTx, eastTy, westMap, westTx, westTy) {
    const r = B.canvas(56, 30, ",");
    B.frame(r, "T", 1);
    for (let x = 0; x < 56; x++) r.set("o", x, 0, "y");
    r.fill("g", 0, 17, 2, 4, "v"); r.fill("g", 54, 17, 2, 4, "v");
    r.fill("g", 1, 1, 54, 28, ".");
    r.fill("g", 1, 17, 54, 3, ":");
    r.fill("g", 1, 18, 54, 1, "-");
    // the canal along the bottom, the fields above
    r.fill("g", 1, 24, 54, 3, "~");
    r.fill("g", 1, 23, 54, 1, "t");
    r.fill("g", 1, 27, 54, 1, "t");
    r.fill("g", 24, 23, 3, 5, "x");
    r.fill("g", 24, 20, 3, 3, ":");
    r.fill("g", 2, 2, 52, 14, "<");
    B.trees(r, seedTag + "-a", 40, 2, 2, 52, 14, "T", "y", ["<"]);
    r.fill("g", 10, 4, 10, 6, '"');
    r.fill("g", 34, 6, 12, 7, '"');
    // the fog bank: a stand of reeds and ditches the fog sits in
    r.fill("g", 16, 20, 26, 3, "a");
    r.fill("g", 20, 21, 6, 1, "J");
    r.fill("g", 32, 21, 6, 1, "J");
    r.scatter("g", seedTag + "-reed", "z", 18, 16, 20, 26, 3, ["a"]);
    r.set("g", 8, 16, "S"); r.set("g", 44, 16, "S"); r.set("g", 28, 22, "S");
    r.set("g", 14, 21, "q"); r.set("g", 46, 21, "I");
    r.set("g", 12, 26, "Q"); r.set("g", 40, 26, "Q");
    def.legend = NW.land();
    def.layers = r.layers();
    def.region = "mersey"; def.outdoor = true; def.weatherZone = "mersey";
    def.music = "route_mersey"; def.ambience = "water"; def.dialogue = "town_daresbury";
    def.spawnPoint = { x: 27, y: 18 };
    def.warps = NW.edge(55, 17, 4, false, eastMap, eastTx, eastTy, "right")
      .concat(NW.edge(0, 17, 4, false, westMap, westTx, westTy, "left"));
    W.defineMap(id, def);
    return r;
  }

  foglane("route_warrington_daresbury", {
    name: "Keckwick Lane",
    landmark: { name: "The Keckwick Fog Bank", x: 28, y: 21 },
    encounters: { grass: "route_warrington_daresbury_grass", water: null },
    signs: [
      { x: 8, y: 16, text: ["KECKWICK LANE — WARRINGTON 4, DARESBURY 1.", "The fog on this lane does not lift and does not move and does not smell of anything."] },
      { x: 44, y: 16, text: ["A hand-painted board leaning on the hedge: 'PROXY GOGGLES SOLD AT RUNCORN GYM.'",
        "Underneath, in Ria's writing: 'AND NOT BEFORE THE BADGE, BEFORE YOU ASK.'"] },
      { x: 28, y: 22, text: ["Something the size of a fridge is sat in the ditch under the fog, humming, with a green light on."] }
    ],
    items: [
      { x: 4, y: 4, item: "capsule_net", n: 3, flag: "item_route_warrington_daresbury_1" },
      { x: 50, y: 28, item: "elixir", n: 2, hidden: true, flag: "item_route_warrington_daresbury_2" }
    ],
    npcs: [
      { id: "npc_r22a_ilan", x: 22, y: 18, dir: "down", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_route_warrington_daresbury_1", sight: 4 },
      { id: "npc_r22a_yannick", x: 38, y: 18, dir: "left", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_route_warrington_daresbury_2", sight: 4 },
      { id: "npc_r22a_walker", x: 14, y: 19, dir: "right", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["I have walked this lane for thirty years and this year I have started walking round it."] }
    ],
    triggers: [
      { x: 20, y: 20, w: 8, h: 2, script: "nw_fog_bank", once: "fog_bank_seen" }
    ]
  }, "r22a", "daresbury", 1, 18, "warrington", 1, 26);

  foglane("route_daresbury_runcorn", {
    name: "Daresbury Lane",
    landmark: { name: "Daresbury Lane", x: 28, y: 21 },
    encounters: { grass: "route_daresbury_runcorn_grass", water: "route_daresbury_runcorn_water" },
    fishing: "fish_runcorn",
    signs: [
      { x: 8, y: 16, text: ["DARESBURY LANE — RUNCORN 2, DARESBURY 1.", "The hedges are laid in the Cheshire style and somebody has kept them up, which is rarer than it should be."] },
      { x: 44, y: 16, text: ["BRIDGEWATER CANAL — moorings, no overnight stays, and a heron who disagrees."] },
      { x: 28, y: 22, text: ["A second fridge, in a second ditch, humming the same nine seconds in every ninety."] }
    ],
    items: [
      { x: 50, y: 4, item: "capsule_mesh", n: 3, flag: "item_route_daresbury_runcorn_1" },
      { x: 3, y: 28, item: "antidote", n: 3, hidden: true, flag: "item_route_daresbury_runcorn_2" }
    ],
    npcs: [
      { id: "npc_r22b_boater", x: 30, y: 23, dir: "down", sprite: "npc_boater", behaviour: "path", path: [[30, 23], [44, 23]], pathMode: "pingpong",
        say: ["Warm water off their cooling plant, all winter, all along this pound.", "The fish think it's May. They've thought it's May for two years."] },
      { id: "npc_r22b_stuffer", x: 18, y: 19, dir: "right", sprite: "npc_stuffer", behaviour: "still",
        say: ["Not fighting you. I've seen what happened on the bridge.", "Six of us and every one of those fridges was somebody's nan."] }
    ]
  }, "r22b", "runcorn", 1, 24, "daresbury", 49, 19);
})();
