// =============================================================
// MonsterQuest v2 — BEESTON CASTLE & PECKFORTON (region west, Ch.8)
// A ruined royal castle on a sandstone crag with a three-hundred-foot
// well nobody has reached the bottom of, a Victorian castle on the next
// hill that was built to look older than the real one, and a wall in
// the wind where two people who are both VEX are waiting for you.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const CASTLE = { "D": "door_wood", "w": "window", "@": "roof_slate", "Z": "well", "5": "wall_city_walk" };

  // ------------------------------------------------------------- the crag --
  const c = B.canvas(44, 46, ",");
  B.frame(c, "T", 1);
  for (let x = 0; x < 44; x++) c.set("o", x, 0, "y");
  c.fill("g", 20, 0, 3, 2, "v");
  c.fill("o", 20, 0, 3, 1, " ");
  c.fill("g", 0, 20, 2, 3, "v");

  c.fill("g", 1, 1, 42, 44, ".");
  // ---- the approach and the outer gatehouse ----
  c.fill("g", 20, 1, 3, 9, "v");
  c.fill("g", 8, 6, 28, 4, "<");
  B.trees(c, "bee-app", 26, 8, 6, 28, 4, "T", "y", ["<"]);
  c.fill("g", 13, 10, 18, 2, "4");
  c.fill("g", 20, 10, 3, 2, "6");
  c.set("g", 13, 10, "7"); c.set("g", 30, 10, "7");
  c.set("g", 19, 9, "S");
  // ---- the outer ward: a big walled enclosure on the shoulder of the hill --
  c.fill("g", 6, 12, 32, 16, ";");
  c.box("g", 6, 12, 32, 16, "4");
  c.fill("g", 20, 12, 3, 1, "6");
  c.fill("g", 7, 13, 30, 14, ";");
  c.fill("g", 20, 13, 3, 8, "v");
  c.fill("g", 8, 20, 28, 2, "v");
  c.set("g", 6, 16, "7"); c.set("g", 37, 16, "7"); c.set("g", 6, 24, "7"); c.set("g", 37, 24, "7");
  c.fill("g", 9, 14, 8, 5, "H");
  c.fill("g", 27, 14, 8, 5, "H");
  c.fill("g", 9, 23, 8, 4, "<");
  B.trees(c, "bee-ward", 12, 9, 23, 8, 4, "B", "b", ["<"]);
  c.fill("g", 26, 23, 10, 4, "<");
  B.trees(c, "bee-ward2", 12, 26, 23, 10, 4, "B", "b", ["<"]);
  c.set("g", 12, 21, "N"); c.set("g", 33, 21, "N");
  c.set("g", 17, 25, "I"); c.set("g", 25, 25, "q");
  // the rematch arena, set into the outer ward's west wall (opens in Ch.8)
  c.fill("g", 6, 25, 1, 3, "8");
  c.set("g", 6, 26, "6");
  // ---- the crag: cliffs and a stepped path up to the inner ward ---------
  c.fill("g", 4, 28, 36, 4, "c");
  c.fill("g", 4, 27, 36, 1, "0");
  c.set("g", 21, 28, "C"); c.set("g", 21, 29, "C"); c.set("g", 21, 30, "C"); c.set("g", 21, 31, "C");
  c.fill("g", 21, 28, 1, 4, "C");
  c.fill("g", 20, 28, 1, 4, "s");
  c.fill("g", 20, 27, 3, 1, ";");
  c.fill("g", 19, 32, 5, 2, "v");
  c.fill("g", 5, 32, 34, 12, "K");
  c.fill("g", 8, 33, 28, 10, ";");
  // ---- the inner ward, the keep, the wall walk, the well ---------------
  c.box("g", 8, 33, 28, 10, "4");
  c.fill("g", 9, 34, 26, 8, ";");
  c.fill("g", 20, 33, 3, 1, "6");
  c.set("g", 8, 33, "7"); c.set("g", 35, 33, "7"); c.set("g", 8, 42, "7"); c.set("g", 35, 42, "7");
  c.fill("g", 20, 32, 3, 1, "v");
  // the wall walk along the top of the inner curtain — the Ch.8 set-piece
  c.fill("g", 9, 34, 26, 1, "5");
  c.fill("g", 12, 35, 20, 1, "v");
  // the keep, standing clear of the curtain so the door faces into the ward
  B.house(c, { x: 15, y: 36, w: 13, h: 5, rh: 2, roof: "@", wall: "%", win: "w", door: "D", doorX: 6 });
  c.set("g", 14, 40, "N");
  // the well: a stone ring with a slab over it
  c.set("g", 12, 39, "Z");
  c.set("g", 11, 39, "M"); c.set("g", 13, 39, "M");
  c.set("g", 12, 38, "N");
  // the scramble to the crag summit, out of the ward's east side
  c.set("g", 33, 38, "C"); c.set("g", 34, 38, "C");
  c.set("g", 32, 39, "S");
  // the ridge path west to Peckforton
  c.fill("g", 1, 20, 6, 3, "v");
  c.fill("g", 2, 23, 3, 10, "K");
  c.set("g", 3, 24, "C");
  c.set("g", 5, 21, "S");
  c.scatter("g", "bee-rock", "R", 22, 2, 2, 40, 8, ["."]);
  c.fill("g", 2, 2, 6, 4, '"');
  c.fill("g", 36, 2, 6, 4, '"');

  NW.defLand("beeston_castle", {
    name: "Beeston Castle", music: "route_west", ambience: "moor", dialogue: "town_beeston_castle",
    spawnPoint: { x: 21, y: 2 },
    landmark: { name: "Beeston Castle", x: 21, y: 36 },
    encounters: { grass: "beeston_castle_grass" },
    warps: [].concat(
      NW.edge(20, 0, 3, true, "route_tarporley_beeston", 20, 42, "up"),
      NW.edge(0, 20, 3, false, "peckforton_castle", 40, 18, "left"),
      [
        { x: 21, y: 40, to: "beeston_castle_keep", tx: 12, ty: 20, dir: "up", kind: "door" },
        { x: 12, y: 39, to: "beeston_castle_well", tx: 14, ty: 3, dir: "down", kind: "stairs", cond: "shove && lamp" },
        { x: 34, y: 38, to: "beeston_castle_summit", tx: 16, ty: 24, dir: "up", kind: "stairs", cond: "climb" },
        { x: 6, y: 26, to: "beeston_arena", tx: 12, ty: 20, dir: "left", kind: "gate", cond: "beeston_arena_open" }
      ]
    ),
    signs: [
      { x: 19, y: 9, text: ["BEESTON CASTLE", "Built 1220 by the Earl of Chester on a crag that did most of the work.",
        "Slighted 1646. 'Slighted' is what the army calls knocking something down so nobody can use it again."] },
      { x: 12, y: 21, text: ["OUTER WARD — the curtain wall runs a third of a mile round this shoulder.",
        "There were thirteen towers. There are, at a generous count, four."] },
      { x: 33, y: 21, text: ["A board with a photograph of the view and an arrow.", "'ON A CLEAR DAY: THE PENNINES, THE WELSH HILLS, EIGHT COUNTIES.'",
        "Somebody has written underneath: 'AND THE DISH, THIS WEEK, FACING US.'"] },
      { x: 12, y: 38, text: ["THE WELL", "Three hundred and seventy feet. Nobody has been to the bottom.",
        "Legend: Richard the Second's treasure went down here in 1399 and never came up.",
        "The slab across it is new, and it is not a museum slab."] },
      { x: 14, y: 40, text: ["THE INNER WARD — the keep, the wall walk, and a very great deal of wind.",
        "Please do not sit on the parapet. People do. People always do."] },
      { x: 32, y: 39, text: ["CRAG SUMMIT — climbing gear only. The rock is soft, the drop is not."] },
      { x: 5, y: 21, text: ["PECKFORTON 1 MILE ALONG THE RIDGE.", "The other castle. The one that was built new to look like this one."] }
    ],
    items: [
      { x: 4, y: 3, item: "elixir", n: 2, flag: "item_beeston_castle_1" },
      { x: 40, y: 4, item: "capsule_root", n: 3, flag: "item_beeston_castle_2" },
      { x: 10, y: 26, item: "revive_salts", n: 1, hidden: true, flag: "item_beeston_castle_3" },
      { x: 31, y: 41, item: "viewpoint_beeston_castle", n: 1, flag: "item_beeston_castle_4" },
      { x: 30, y: 15, item: "tonic_spd", n: 1, hidden: true, flag: "item_beeston_castle_5" }
    ],
    catGaps: [
      { x: 11, y: 35, item: "collectible_25", n: 1, flag: "catgap_beeston_1",
        say: "MEADOW squeezes under the slab, is gone for four entirely silent seconds, and comes back with a cat collar tag, corroded, engraved with a name and a Frodsham telephone number." }
    ],
    restPoints: [{ x: 25, y: 26, flag: "meadow_sat_beeston" }],
    npcs: [
      { id: "npc_beeston_roz", x: 24, y: 21, dir: "left", sprite: "npc_historian", behaviour: "still", script: "nw_beeston_roz" },
      { id: "npc_beeston_ranger", x: 15, y: 16, dir: "down", sprite: "npc_ranger", behaviour: "still", trainer: "tr_beeston_castle_2", sight: 4, cond: "chapter >= 8" },
      { id: "npc_beeston_walker", x: 30, y: 21, dir: "left", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Wind on that wall walk takes your hood off and then your opinion of yourself."] },
      { id: "npc_beeston_kid", x: 18, y: 25, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 2,
        say: ["I dropped a stone down the well and counted to four and never heard it.", "Dad says that means it's deep. I think it means it's still going."] },
      { id: "npc_beeston_vex", x: 22, y: 34, dir: "down", sprite: "vex", behaviour: "still", script: "nw_beeston_vex_wall",
        cond: "chapter >= 8 && !choice_vex" },
      { id: "npc_beeston_vex_ally", x: 24, y: 21, dir: "down", sprite: "vex", behaviour: "still", script: "nw_vex_ally_chat",
        cond: "vex_ally && chapter >= 9" }
    ],
    triggers: [
      { x: 19, y: 32, w: 5, h: 2, script: "nw_beeston_crag_zephyrion", once: "zephyrion_seen", cond: "chapter >= 8 && !zephyrion_seen" },
      { x: 12, y: 35, w: 20, h: 1, script: "nw_beeston_wall_scene", once: "beeston_wall_scene", cond: "chapter >= 8 && !choice_vex" }
    ]
  }, c, NW.land(CASTLE));

  // --------------------------------------------------------- the keep ------
  const kp = B.canvas(26, 22, ":");
  kp.box("g", 0, 0, 26, 22, "%");
  kp.fill("g", 1, 0, 24, 1, "^");
  kp.fill("g", 2, 1, 22, 1, "%");
  kp.fill("g", 4, 1, 2, 1, "W"); kp.fill("g", 12, 1, 2, 1, "W"); kp.fill("g", 20, 1, 2, 1, "W");
  kp.fill("g", 3, 4, 6, 1, "x"); kp.fill("g", 17, 4, 6, 1, "x");
  kp.fill("g", 3, 9, 4, 4, "x"); kp.fill("g", 19, 9, 4, 4, "x");
  kp.fill("g", 10, 6, 6, 6, ":");
  kp.set("g", 12, 8, "*"); kp.set("g", 13, 8, "*");
  kp.set("g", 6, 15, "S"); kp.set("g", 19, 15, "S");
  kp.set("g", 4, 17, "u"); kp.set("g", 21, 17, "u");
  NW.doorway(kp, 12, 21, "D");
  NW.defIn("beeston_castle_keep", {
    name: "The Keep", music: "dungeon_cave", ambience: "cave", dialogue: "town_beeston_castle",
    spawnPoint: { x: 12, y: 20 },
    encounters: { cave: "beeston_castle_keep_cave" },
    warps: NW.exit(12, 21, "beeston_castle", 21, 41, "down"),
    signs: [
      { x: 6, y: 15, text: ["A cut-away drawing of the castle as it was, with the bits that are gone drawn in dotted lines.",
        "There is more dotted line than solid."] },
      { x: 19, y: 15, text: ["'THE CASTLE NEVER FELL TO ASSAULT.' Underneath, smaller: 'It fell to hunger, twice.'"] }
    ],
    items: [{ x: 2, y: 19, item: "capsule_root", n: 2, hidden: true, flag: "item_beeston_keep_1" }],
    npcs: [
      { id: "npc_beeston_keep_guide", x: 13, y: 15, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Two hundred people held this against three thousand for months.",
          "The thing that beat them wasn't clever. It was patient."] },
      { id: "npc_beeston_second_vex", x: 12, y: 6, dir: "down", sprite: "vex_impostor", behaviour: "still",
        script: "nw_beeston_second_vex", cond: "beeston_wall_scene && !choice_vex" }
    ]
  }, kp, NW.inside());

  // ----------------------------------------------------------- the well ----
  const wl = B.canvas(28, 34, "#");
  wl.fill("g", 2, 2, 24, 30, ".");
  wl.fill("g", 12, 0, 4, 4, "S");
  wl.fill("g", 12, 4, 4, 2, ".");
  // a shaft that widens into three galleries, dead-dropped and dripping
  wl.fill("g", 12, 6, 4, 8, ",");
  wl.fill("g", 4, 12, 20, 3, ".");
  wl.fill("g", 3, 15, 8, 6, ",");
  wl.fill("g", 17, 15, 8, 6, ",");
  wl.fill("g", 10, 18, 8, 3, ".");
  wl.fill("g", 8, 22, 12, 8, ".");
  wl.fill("g", 10, 25, 8, 4, "~");
  wl.fill("g", 9, 24, 10, 1, "e"); wl.fill("g", 9, 29, 10, 1, "e");
  wl.set("g", 14, 26, "Q");
  wl.set("g", 6, 13, "o"); wl.set("g", 21, 13, "o"); wl.set("g", 5, 18, "c"); wl.set("g", 22, 19, "c");
  wl.set("g", 7, 16, "z"); wl.set("g", 20, 17, "z"); wl.set("g", 11, 9, "z");
  wl.set("g", 16, 9, "L"); wl.set("g", 12, 12, "L");
  wl.set("g", 6, 20, "\\"); wl.set("g", 8, 19, "`"); wl.set("g", 21, 20, "\\");
  wl.set("g", 19, 16, "N");
  wl.set("g", 13, 22, "N");
  NW.defIn("beeston_castle_well", {
    name: "Beeston Well", music: "dungeon_cave", ambience: "cave", dialogue: "town_beeston_castle",
    spawnPoint: { x: 14, y: 4 },
    encounters: { cave: "beeston_castle_well_cave", water: null },
    warps: [
      { x: 13, y: 3, to: "beeston_castle", tx: 12, ty: 40, dir: "up", kind: "stairs" },
      { x: 14, y: 3, to: "beeston_castle", tx: 12, ty: 40, dir: "up", kind: "stairs" }
    ],
    signs: [
      { x: 19, y: 16, text: ["A survey peg, hammered into the rock, with a laminated card on a cable tie.",
        "'DEPTH TO WATER 112m. DO NOT REMOVE.' The card is dated three months ago and nobody at English Heritage put it there."] },
      { x: 13, y: 22, text: ["Scratched into the sandstone at head height, recently, with a screwdriver:",
        "'IF YOU ARE READING THIS YOU HAVE ALREADY BEEN TRUSTED BY SOMETHING.'"] }
    ],
    items: [
      { x: 5, y: 20, item: "capsule_heavy", n: 3, flag: "item_beeston_well_1" },
      { x: 22, y: 28, item: "elixir", n: 2, hidden: true, flag: "item_beeston_well_2" },
      { x: 3, y: 29, item: "salt_crystal", n: 2, hidden: true, flag: "item_beeston_well_3" }
    ],
    npcs: [
      { id: "npc_beeston_well_courier", x: 12, y: 22, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_beeston_castle_well_1", sight: 4 }
    ],
    triggers: [
      { x: 12, y: 27, w: 4, h: 2, script: "nw_beeston_well_note", once: "beeston_well_note" }
    ]
  }, wl, NW.cave({ "S": "steps", "L": "mine_prop" }));

  // -------------------------------------------------------- the summit ----
  const sm = B.canvas(32, 28, "K");
  sm.fill("g", 3, 3, 26, 22, ";");
  sm.box("g", 3, 3, 26, 22, "0");
  sm.fill("g", 4, 4, 24, 20, ";");
  sm.fill("g", 10, 8, 12, 10, "H");
  sm.set("g", 16, 12, "n"); sm.set("g", 15, 12, "n");
  sm.set("g", 11, 6, "M"); sm.set("g", 24, 9, "M"); sm.set("g", 8, 20, "M");
  sm.fill("g", 15, 18, 2, 9, "s");
  sm.set("g", 16, 26, "C"); sm.set("g", 15, 26, "C");
  sm.set("g", 19, 20, "S");
  sm.set("g", 6, 6, "\\");
  sm.scatter("g", "sum-heather", "H", 22, 4, 4, 24, 20, [";"]);
  NW.defLand("beeston_castle_summit", {
    name: "Beeston Crag", music: "route_west", ambience: "moor", dialogue: "town_beeston_castle",
    spawnPoint: { x: 16, y: 24 },
    landmark: { name: "Beeston Crag", x: 16, y: 12 },
    encounters: { grass: "beeston_castle_summit_grass" },
    warps: [
      { x: 15, y: 26, to: "beeston_castle", tx: 32, ty: 38, dir: "down", kind: "stairs" },
      { x: 16, y: 26, to: "beeston_castle", tx: 32, ty: 38, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 19, y: 20, text: ["The top of the crag. Nothing up here but wind, whinberry and a survey mark.",
        "In storm weather the wind arrives before the bird does. Bring something that likes that."] }
    ],
    items: [
      { x: 6, y: 22, item: "capsule_quick", n: 3, flag: "item_beeston_summit_1" },
      { x: 26, y: 5, item: "tonic_spe", n: 2, hidden: true, flag: "item_beeston_summit_2" }
    ],
    npcs: [
      { id: "npc_beeston_summit_knight", x: 16, y: 8, dir: "down", sprite: "npc_ghost_trainer", behaviour: "still",
        trainer: "elite_knight_second", sight: 0, cond: "postgame_open", script: "nw_beeston_summit_knight" }
    ],
    triggers: [
      { x: 14, y: 10, w: 4, h: 3, script: "nw_beeston_storm_zephyrion", cond: "weather.wind && zephyrion_seen" }
    ]
  }, sm, NW.land());

  // ------------------------------------------------------- the arena -------
  const ar = B.canvas(26, 24, ";");
  ar.box("g", 0, 0, 26, 24, "4");
  ar.fill("g", 1, 1, 24, 22, ";");
  ar.fill("g", 6, 5, 14, 12, "$");
  ar.box("g", 6, 5, 14, 12, "n");
  ar.fill("g", 7, 6, 12, 10, "$");
  ar.fill("g", 2, 2, 4, 20, "H"); ar.fill("g", 20, 2, 4, 20, "H");
  ar.set("g", 0, 20, "6");
  ar.fill("g", 1, 19, 12, 2, "v");
  ar.fill("g", 12, 16, 2, 5, "v");
  ar.set("g", 13, 4, "N");
  ar.set("g", 4, 8, "q"); ar.set("g", 21, 8, "q");
  NW.defLand("beeston_arena", {
    name: "The Outer Ward Arena", music: "battle_trainer", ambience: "moor", dialogue: "town_beeston_castle",
    spawnPoint: { x: 12, y: 20 },
    landmark: { name: "The Outer Ward Arena", x: 13, y: 11 },
    encounters: { grass: null },
    warps: [
      { x: 0, y: 20, to: "beeston_castle", tx: 7, ty: 26, dir: "right", kind: "gate" }
    ],
    signs: [
      { x: 13, y: 4, text: ["THE OUTER WARD ARENA", "Rematches only. Bring somebody you have already beaten and see whether it took.",
        "House rule: the wind counts as a third trainer."] }
    ],
    items: [{ x: 23, y: 2, item: "capsule_net", n: 3, hidden: true, flag: "item_beeston_arena_1" }],
    npcs: [
      { id: "npc_beeston_arena_desk", x: 13, y: 6, dir: "down", sprite: "npc_walker", behaviour: "still", script: "nw_beeston_arena_desk" }
    ]
  }, ar, NW.land());

  // ---------------------------------------------------- Peckforton --------
  const pk = B.canvas(44, 34, ",");
  B.frame(pk, "T", 1);
  for (let x = 0; x < 44; x++) pk.set("o", x, 0, "y");
  pk.fill("g", 43, 17, 1, 3, "v");
  pk.fill("g", 1, 1, 42, 32, ".");
  pk.fill("g", 4, 4, 36, 26, "<");
  B.trees(pk, "pk-wood", 70, 4, 4, 36, 26, "T", "y", ["<"]);
  // the drive up to the castle
  pk.fill("g", 30, 17, 13, 3, "v");
  pk.fill("g", 22, 12, 9, 8, "v");
  pk.fill("g", 12, 10, 12, 3, "v");
  // the castle itself: Victorian, medieval-shaped, extremely damp
  pk.fill("g", 6, 4, 18, 8, ";");
  pk.box("g", 7, 5, 16, 7, "4");
  pk.fill("g", 8, 6, 14, 5, ";");
  pk.set("g", 7, 5, "7"); pk.set("g", 22, 5, "7"); pk.set("g", 7, 11, "7"); pk.set("g", 22, 11, "7");
  pk.fill("g", 13, 11, 3, 1, "6");
  pk.fill("g", 13, 12, 3, 1, "v");
  B.house(pk, { x: 11, y: 6, w: 8, h: 4, rh: 1, roof: "@", wall: "%", win: "w", door: "D", doorX: 3 });
  pk.set("g", 10, 9, "N");
  // the falconer's lawn
  pk.fill("g", 26, 22, 12, 7, ";");
  pk.set("g", 30, 25, "|"); pk.set("g", 33, 25, "|"); pk.set("g", 36, 25, "|");
  pk.fill("g", 28, 20, 2, 3, "v");
  pk.set("g", 27, 27, "N");
  pk.fill("g", 2, 14, 8, 8, "K");
  pk.fill("g", 3, 16, 5, 4, ";");
  pk.set("g", 6, 15, "C"); pk.set("g", 6, 14, "C");
  pk.set("g", 11, 20, "S");
  pk.set("g", 20, 28, "I");
  NW.defLand("peckforton_castle", {
    name: "Peckforton Castle", music: "route_west", ambience: "forest", dialogue: "town_beeston_castle",
    spawnPoint: { x: 40, y: 18 },
    landmark: { name: "Peckforton Castle", x: 15, y: 8 },
    encounters: { grass: "peckforton_castle_grass" },
    warps: NW.edge(43, 17, 3, false, "beeston_castle", 1, 20, "right"),
    signs: [
      { x: 10, y: 9, text: ["PECKFORTON CASTLE — built 1844-1851 for the first Baron Tollemache.",
        "A perfect medieval castle with hot water, gas lighting and no history whatsoever.",
        "Sir George Gilbert Scott called it 'the largest and most carefully and learnedly executed Gothic mansion of the present'.",
        "He also called it a sham, but he wrote that bit down somewhere else."] },
      { x: 27, y: 27, text: ["FALCONRY — displays at eleven and three.", "Do not run. Do not wave. Do not, under any circumstances, be small and quick."] },
      { x: 11, y: 20, text: ["THE RIDGE — Beeston is the other one. The old one. The one with the well.",
        "You can see it from the lawn and the lawn was designed so that you could."] }
    ],
    items: [
      { x: 3, y: 30, item: "capsule_root", n: 3, flag: "item_peckforton_1" },
      { x: 39, y: 4, item: "elixir", n: 2, hidden: true, flag: "item_peckforton_2" },
      { x: 4, y: 18, item: "focus_band", n: 1, hidden: true, flag: "item_peckforton_3" }
    ],
    npcs: [
      { id: "npc_beeston_huw", x: 31, y: 24, dir: "down", sprite: "npc_birder", behaviour: "still", trainer: "tr_peckforton_castle_1", sight: 0, script: "nw_peckforton_falconer" },
      { id: "npc_beeston_pk_guide", x: 16, y: 9, dir: "left", sprite: "npc_historian", behaviour: "still",
        say: ["Everything here was built to look four hundred years older than it is.",
          "There is a word for a thing that pretends to be trusted because it looks like a thing that was.",
          "I have never needed the word before this month."] },
      { id: "npc_beeston_pk_walker", x: 25, y: 18, dir: "left", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Two castles, one ridge, six hundred years apart, and the newer one is in better nick.", "There's a lesson in that and I don't like it."] }
    ]
  }, pk, NW.land(CASTLE));
})();
