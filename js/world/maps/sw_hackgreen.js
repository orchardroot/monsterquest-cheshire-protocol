// =============================================================
// MonsterQuest v2 — HACK GREEN (region south, side dungeon)
// A brown tourist sign in a hedge that says SECRET NUCLEAR BUNKER,
// pointing at a field with thirty-five thousand square feet of
// reinforced concrete under it. Blast doors, a decontamination
// corridor, a telecoms floor, and an Ops Room that still has a
// county on the plotting table that has not existed since 1979.
// Opens after Ch.6 with the Bunker Key; tuned for Ch.9 and after.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const OUT = B.salt({ "V": "wall_render_white", "%": "shop_awning" });
  const IN = {
    "#": "wall_interior", "^": "wall_interior_top", "_": "floor_stone", "g": "floor_tile",
    "f": "floor_tile_check", "W": "wall_glass", "D": "door_wood", "@": "door_locked",
    "G": "gate_iron", "d": "door_stairs_down", "u": "door_stairs_up", "m": "mat_welcome",
    "T": "server_rack", "t": "terminal", "C": "cable_duct", "M": "machine", "H": "hologram",
    "l": "lamp", "N": "sign", "n": "noticeboard", "s": "shelf", "k": "bookcase", "i": "counter",
    "h": "table", "j": "chair", "[": "crate", "]": "barrel", "}": "sack", "p": "plant_pot",
    "b": "bed", "B": "bed_head", "P": "box_pc", "e": "bench", "w": "wall_stone_grey",
    "x": "sink", "o": "stove", "c": "clock_wall", " ": null
  };

  // ------------------------------------------------------------ the field --
  const c = B.canvas(34, 26, ".");
  c.fill("g", 0, 0, 34, 1, "T"); c.fill("g", 0, 25, 34, 1, "T");
  c.fill("g", 0, 1, 1, 24, "T"); c.fill("g", 33, 1, 1, 24, "T");
  for (let x = 0; x < 34; x++) c.set("o", x, 0, "y");
  c.fill("g", 16, 0, 3, 1, "+");
  c.fill("g", 16, 1, 3, 10, "+");
  c.fill("g", 8, 11, 19, 3, ":");
  c.fill("g", 2, 2, 14, 8, "\"");
  c.fill("g", 19, 2, 14, 8, "\"");
  c.fill("g", 2, 15, 30, 9, "\"");
  // the guard house, the gate and the ramp down to the blast doors
  c.fill("g", 8, 14, 19, 1, "|");
  c.fill("g", 12, 11, 1, 4, "|"); c.fill("g", 22, 11, 1, 4, "|");
  c.fill("g", 12, 11, 11, 1, "|");
  c.fill("g", 16, 11, 3, 1, "J");
  c.fill("g", 13, 12, 9, 2, ":");
  B.house(c, { x: 13, y: 15, w: 9, h: 4, rh: 1, roof: "R", wall: "V", win: "W", door: "D", doorX: 4, over: "^" });
  c.fill("g", 13, 19, 9, 1, ":");
  c.fill("g", 16, 20, 3, 4, ":");
  c.fill("g", 15, 23, 5, 1, "w");
  c.set("g", 17, 23, "E");
  c.set("g", 14, 22, "N");
  c.set("g", 20, 12, "N");
  c.fill("g", 24, 16, 6, 5, ",");
  c.set("g", 26, 18, "5"); c.set("g", 28, 19, "[");
  B.trees(c, "hg-out", 20, 2, 2, 30, 8, "T", "y", ["\""]);
  c.set("g", 5, 20, "z"); c.set("g", 30, 4, "|");

  W.defineMap("hack_green", {
    name: "Hack Green", region: "south", outdoor: true, music: "route_south", weatherZone: "south",
    ambience: "moor", dialogue: "town_nantwich",
    legend: OUT, layers: c.layers(),
    spawnPoint: { x: 17, y: 2 },
    landmark: { name: "Hack Green", x: 17, y: 17 },
    encounters: { grass: "hack_green_grass" },
    warps: [
      { x: 16, y: 0, to: "route_nantwich_hackgreen", tx: 15, ty: 30, dir: "up", kind: "edge" },
      { x: 17, y: 0, to: "route_nantwich_hackgreen", tx: 16, ty: 30, dir: "up", kind: "edge" },
      { x: 18, y: 0, to: "route_nantwich_hackgreen", tx: 17, ty: 30, dir: "up", kind: "edge" },
      { x: 17, y: 19, to: "hack_green_guardhouse", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 17, y: 23, to: "hack_green_b1", tx: 19, ty: 27, dir: "down", kind: "cave", cond: "item.bunker_key > 0" }
    ],
    signs: [
      { x: 20, y: 12, text: ["SECRET NUCLEAR BUNKER.", "It is a brown tourist sign. In letters. By a road. Pointing at the secret.",
        "The joke has been running since 1994 and shows no sign of tiring."] },
      { x: 14, y: 22, text: ["BLAST DOOR 1. THREE FEET OF CONCRETE. TEN TONNES OF DOOR.",
        "BUNKER KEY REQUIRED. Under it, newer, in marker: 'and if you're the fourth lot this month, the code has changed AGAIN'."] }
    ],
    items: [
      { x: 4, y: 18, item: "capsule_net", n: 3, flag: "item_hack_green_1" },
      { x: 30, y: 6, item: "elixir", n: 2, hidden: true, flag: "item_hack_green_2" }
    ],
    npcs: [
      { id: "npc_hack_green_warden", x: 17, y: 20, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_warden" }
    ]
  });

  W.defineMap("hack_green_guardhouse", W.builtin("house_small", {
    name: "Hack Green Guard House", region: "interior", dialogue: "town_nantwich", music: "route_south",
    warps: [{ x: 5, y: 9, to: "hack_green", tx: 17, ty: 20, dir: "down", kind: "door" },
      { x: 6, y: 9, to: "hack_green", tx: 17, ty: 20, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_hack_green_guard", x: 3, y: 4, dir: "down", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_guard" }],
    signs: [{ x: 10, y: 1, text: ["A visitor book. Nine names this year, seven of them in the same handwriting."] }]
  }));

  // --------------------------------------------------------------- B1 -----
  const b1 = B.canvas(40, 30, "#");
  b1.fill("g", 1, 0, 38, 1, "^");
  // the entrance ramp and the decontamination corridor
  b1.fill("g", 18, 24, 4, 5, "_");
  b1.set("g", 19, 29, "u"); b1.set("g", 20, 29, "u");
  b1.fill("g", 18, 18, 4, 6, "f");
  b1.set("g", 18, 21, "x"); b1.set("g", 21, 21, "x");
  b1.set("g", 20, 24, "N");
  // the blast door line
  b1.fill("g", 16, 17, 8, 1, "#");
  b1.fill("g", 19, 17, 2, 1, "_");
  b1.set("g", 18, 17, "G"); b1.set("g", 21, 17, "G");
  // the main corridor: a ring with rooms off it
  b1.fill("g", 4, 14, 32, 3, "_");
  b1.fill("g", 4, 4, 3, 13, "_");
  b1.fill("g", 33, 4, 3, 13, "_");
  b1.fill("g", 4, 4, 32, 3, "_");
  // rooms
  b1.fill("g", 9, 3, 9, 8, "g");
  b1.fill("g", 12, 11, 3, 3, "_");
  b1.fill("g", 22, 3, 9, 8, "g");
  b1.fill("g", 25, 11, 3, 3, "_");
  b1.fill("g", 8, 19, 8, 8, "g");
  b1.fill("g", 15, 21, 3, 3, "_");
  b1.fill("g", 24, 19, 9, 8, "g");
  b1.fill("g", 22, 21, 2, 3, "_");
  // fittings
  b1.fill("g", 10, 4, 7, 2, "b"); b1.fill("g", 10, 8, 7, 2, "b");
  b1.fill("g", 23, 4, 3, 2, "h"); b1.fill("g", 28, 4, 2, 6, "s");
  b1.fill("g", 9, 20, 6, 2, "i"); b1.fill("g", 9, 24, 6, 2, "o");
  b1.fill("g", 25, 20, 7, 2, "T"); b1.fill("g", 25, 24, 7, 2, "T");
  b1.set("g", 26, 23, "C"); b1.set("g", 31, 23, "C");
  b1.set("g", 5, 10, "l"); b1.set("g", 34, 10, "l"); b1.set("g", 20, 5, "c");
  b1.set("g", 20, 13, "N");
  b1.set("g", 6, 16, "n");
  b1.set("g", 34, 15, "d");
  b1.set("g", 33, 16, "N");
  b1.fill("g", 32, 15, 2, 1, "_");

  W.defineMap("hack_green_b1", {
    name: "Hack Green B1", region: "interior", outdoor: false, music: "dungeon_cave", weatherZone: null,
    ambience: "cave", dialogue: "town_nantwich",
    legend: IN, layers: b1.layers(),
    spawnPoint: { x: 19, y: 27 },
    landmark: { name: "Hack Green B1", x: 20, y: 15 },
    encounters: { cave: "hack_green_b1_cave" },
    warps: [
      { x: 19, y: 29, to: "hack_green", tx: 17, ty: 22, dir: "up", kind: "cave" },
      { x: 20, y: 29, to: "hack_green", tx: 17, ty: 22, dir: "up", kind: "cave" },
      { x: 34, y: 15, to: "hack_green_b2", tx: 6, ty: 26, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 20, y: 24, text: ["DECONTAMINATION. REMOVE OUTER CLOTHING. PROCEED IN ORDER.",
        "The showers still work. One of them is running. Nobody is in it."] },
      { x: 20, y: 13, text: ["DORMITORY — 135 BUNKS.", "Nobody ever slept here. That is the strangest thing in this building and it is competing with a lot."] },
      { x: 33, y: 16, text: ["STAIRS TO B2 — TELECOMS.", "Somebody has added a sticky note that says 'fibre in at north end, 2019' and then, later, 'not ours'."] }
    ],
    items: [
      { x: 30, y: 9, item: "elixir", n: 2, flag: "item_hack_green_b1_1" },
      { x: 12, y: 26, item: "capsule_net", n: 3, flag: "item_hack_green_b1_2" },
      { x: 5, y: 5, item: "collectible_17", n: 1, hidden: true, flag: "item_hack_green_b1_3" }
    ],
    npcs: [
      { id: "npc_hack_green_b1_del", x: 28, y: 23, dir: "left", sprite: "npc_stuffer", behaviour: "look", radius: 4, trainer: "tr_hack_green_b1_1", sight: 4 }
    ],
    triggers: [
      { x: 18, y: 20, w: 4, h: 1, script: "sw_bunker_shower", once: "bunker_shower", cond: "!bunker_shower", kind: "step" }
    ]
  });

  // --------------------------------------------------------------- B2 -----
  const b2 = B.canvas(40, 30, "#");
  b2.fill("g", 1, 0, 38, 1, "^");
  b2.fill("g", 4, 24, 32, 3, "_");
  b2.fill("g", 4, 4, 32, 3, "_");
  b2.fill("g", 4, 4, 3, 23, "_");
  b2.fill("g", 33, 4, 3, 23, "_");
  b2.set("g", 5, 27, "u"); b2.set("g", 6, 27, "u");
  b2.fill("g", 5, 27, 2, 1, "u");
  // the telecoms floor: switchboards in ranks
  b2.fill("g", 9, 9, 22, 12, "g");
  for (let r = 0; r < 3; r++) { b2.fill("g", 10, 10 + r * 4, 9, 2, "T"); b2.fill("g", 21, 10 + r * 4, 9, 2, "T"); }
  b2.fill("g", 19, 9, 2, 12, "g");
  b2.fill("g", 8, 8, 24, 1, "C");
  b2.fill("g", 9, 21, 22, 1, "C");
  b2.fill("g", 19, 21, 2, 3, "g");
  b2.set("g", 20, 8, "N");
  // the switchboard puzzle: four patch panels round the ring
  b2.set("g", 5, 12, "M"); b2.set("g", 5, 18, "M");
  b2.set("g", 34, 12, "M"); b2.set("g", 34, 18, "M");
  b2.set("g", 6, 15, "N");
  // the way to the Ops Room
  b2.fill("g", 18, 4, 4, 1, "_");
  b2.set("g", 19, 3, "@"); b2.set("g", 20, 3, "@");
  b2.set("g", 22, 5, "N");
  b2.set("g", 8, 5, "l"); b2.set("g", 31, 5, "l"); b2.set("g", 8, 25, "l"); b2.set("g", 31, 25, "l");
  b2.set("g", 12, 25, "["); b2.set("g", 28, 25, "]");

  W.defineMap("hack_green_b2", {
    name: "Hack Green B2 — Telecoms", region: "interior", outdoor: false, music: "dungeon_cave", weatherZone: null,
    ambience: "cave", dialogue: "town_nantwich",
    legend: IN, layers: b2.layers(),
    spawnPoint: { x: 6, y: 26 },
    landmark: { name: "The Telecoms Floor", x: 20, y: 15 },
    encounters: { cave: "hack_green_b2_cave" },
    warps: [
      { x: 5, y: 27, to: "hack_green_b1", tx: 33, ty: 15, dir: "up", kind: "stairs" },
      { x: 6, y: 27, to: "hack_green_b1", tx: 33, ty: 15, dir: "up", kind: "stairs" },
      { x: 19, y: 3, to: "hack_green_ops", tx: 11, ty: 17, dir: "up", kind: "door", cond: "bunker_switchboard >= 4" },
      { x: 20, y: 3, to: "hack_green_ops", tx: 12, ty: 17, dir: "up", kind: "door", cond: "bunker_switchboard >= 4" }
    ],
    signs: [
      { x: 20, y: 8, text: ["TELECOMS FLOOR. Every trunk line in the north-west used to land in this room.",
        "Most of them are dead. Four of them are not, and three of those were reconnected recently by somebody with a ladder and no paperwork."] },
      { x: 6, y: 15, text: ["PATCH PANEL. The labels are wrong.", "They are not wrong by accident: they are wrong in a pattern, and the pattern is the same on all four panels.",
        "Set all four the way the pattern says and the Ops Room door releases."] },
      { x: 22, y: 5, text: ["OPS ROOM — RESTRICTED. The door has an electric lock that has been live, continuously, since 1984."] }
    ],
    items: [
      { x: 12, y: 26, item: "capsule_kernel", n: 3, flag: "item_hack_green_b2_1" },
      { x: 34, y: 25, item: "patch_cable", n: 1, hidden: true, flag: "item_hack_green_b2_2" }
    ],
    npcs: [
      { id: "npc_hack_green_b2_vaughan", x: 20, y: 22, dir: "up", sprite: "npc_darkbyte", behaviour: "look", radius: 4, trainer: "tr_hack_green_b2_1", sight: 4 },
      { id: "npc_hack_green_b2_bryn", x: 34, y: 22, dir: "left", sprite: "npc_shadow_it", behaviour: "look", radius: 4, trainer: "tr_hack_green_b2_2", sight: 4 },
      { id: "npc_hack_green_panel_1", x: 6, y: 12, dir: "left", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_panel_1" },
      { id: "npc_hack_green_panel_2", x: 6, y: 18, dir: "left", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_panel_2" },
      { id: "npc_hack_green_panel_3", x: 33, y: 12, dir: "right", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_panel_3" },
      { id: "npc_hack_green_panel_4", x: 33, y: 18, dir: "right", sprite: "npc_signaller", behaviour: "still", script: "sw_bunker_panel_4" }
    ],
    triggers: [
      { x: 18, y: 4, w: 4, h: 1, script: "sw_bunker_door", cond: "bunker_switchboard < 4", kind: "step" }
    ]
  });

  // -------------------------------------------------------- the Ops Room --
  const op = B.canvas(24, 20, "#");
  op.fill("g", 1, 0, 22, 1, "^");
  op.fill("g", 2, 2, 20, 16, "g");
  op.fill("g", 8, 6, 8, 6, "h");
  op.fill("g", 9, 7, 6, 4, "H");
  op.fill("g", 3, 3, 4, 3, "T"); op.fill("g", 17, 3, 4, 3, "T");
  op.fill("g", 3, 13, 4, 3, "T"); op.fill("g", 17, 13, 4, 3, "T");
  op.set("g", 4, 9, "M"); op.set("g", 19, 9, "M");
  op.fill("g", 10, 16, 4, 2, "_");
  op.set("g", 11, 19, "D"); op.set("g", 12, 19, "D");
  op.set("g", 11, 18, "m"); op.set("g", 12, 18, "m");
  op.set("g", 8, 16, "N");
  op.set("g", 11, 1, "c");
  op.set("g", 2, 9, "l"); op.set("g", 21, 9, "l");

  W.defineMap("hack_green_ops", {
    name: "The Ops Room", region: "interior", outdoor: false, music: "battle_boss", weatherZone: null,
    ambience: "cave", dialogue: "town_nantwich",
    legend: IN, layers: op.layers(),
    spawnPoint: { x: 11, y: 17 },
    landmark: { name: "The Ops Room", x: 11, y: 9 },
    encounters: { cave: null },
    warps: [
      { x: 11, y: 19, to: "hack_green_b2", tx: 19, ty: 4, dir: "down", kind: "door" },
      { x: 12, y: 19, to: "hack_green_b2", tx: 20, ty: 4, dir: "down", kind: "door" }
    ],
    signs: [{ x: 8, y: 16, text: ["THE PLOTTING TABLE.", "A county in Perspex with counters on it. The counters have been moved recently.",
      "Somebody has written HOLD on the glass in chinagraph, and it is not this decade's handwriting."] }],
    items: [{ x: 21, y: 16, item: "capsule_root", n: 1, hidden: true, flag: "item_hack_green_ops_1" }],
    npcs: [],
    triggers: [
      { x: 10, y: 13, w: 4, h: 1, script: "sw_bunker_ops", once: "bunker_ops_done", cond: "!bunker_ops_done", kind: "step" }
    ]
  });
})();
