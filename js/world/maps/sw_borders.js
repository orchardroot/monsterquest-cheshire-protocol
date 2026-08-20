// =============================================================
// MonsterQuest v2 — the SOUTH-WEST's shared edges.
// R15 (Crewe ↔ Nantwich) and R17 (Sandbach ↔ Middlewich) are the seams
// between region-mid and this region, and the Cambrian cutscene carriage
// is Ch.5's as much as Ch.6's. Whichever workstream loads first defines
// them; the other leaves them alone. This file loads before every other
// sw_* map, so our town files can aim at whatever is actually there.
// Owned by region-southwest (definitions here are fallbacks only).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const R = B.salt({ "%": "shop_awning" });

  // ---------------- R15 — Willaston & Wybunbury (Crewe ↔ Nantwich) --------
  // Flat lanes, a leaning church tower, and a churchyard that is a different
  // place after dark. Nantwich is west, Crewe is east.
  if (!W.has("route_crewe_nantwich")) {
    const c = B.canvas(56, 28, ".");
    c.fill("g", 0, 0, 56, 1, "T"); c.fill("g", 0, 27, 56, 1, "T");
    c.fill("g", 0, 0, 1, 28, "T"); c.fill("g", 55, 0, 1, 28, "T");
    for (let x = 0; x < 56; x++) c.set("o", x, 0, "y");
    // the lane, with a kink round the tower
    c.fill("g", 1, 13, 54, 3, ":");
    c.fill("g", 22, 8, 3, 6, ":");
    c.fill("g", 22, 6, 14, 3, ":");
    c.fill("g", 33, 8, 3, 6, ":");
    c.fill("g", 1, 12, 54, 1, "-");
    c.fill("g", 2, 2, 20, 10, "\"");
    c.fill("g", 38, 2, 16, 9, "\"");
    c.fill("g", 2, 17, 24, 9, "\"");
    c.fill("g", 30, 17, 24, 9, "\"");
    // Wybunbury: the leaning tower on its knoll
    c.box("g", 25, 1, 8, 6, "w");
    c.fill("g", 26, 2, 6, 4, ",");
    c.fill("g", 27, 2, 4, 3, "c");
    c.fill("g", 28, 1, 2, 1, "p");
    c.set("g", 29, 5, "d");
    c.set("g", 26, 4, "g"); c.set("g", 31, 3, "g");
    c.set("g", 29, 7, "N");
    // hedges and a gate to a pocket field
    c.fill("g", 12, 16, 1, 8, "h"); c.set("g", 12, 20, "J");
    c.fill("g", 13, 20, 8, 4, ".");
    c.set("g", 17, 22, "{"); c.set("g", 19, 21, "{");
    c.fill("g", 42, 16, 1, 9, "h"); c.set("g", 42, 21, "J");
    B.trees(c, "r15-n", 26, 2, 2, 52, 9, "T", "y", ["\""]);
    B.trees(c, "r15-s", 22, 2, 18, 52, 8, "B", "b", ["\""]);
    c.set("g", 8, 11, "5"); c.set("g", 46, 17, "z");
    c.fill("g", 6, 22, 5, 3, "$");
    c.set("g", 8, 21, "Q");
    c.fill("g", 1, 13, 2, 3, ":"); c.fill("g", 53, 13, 2, 3, ":");
    c.set("g", 3, 11, "P"); c.set("g", 50, 11, "P");

    const warps = [];
    for (let i = 0; i < 3; i++) warps.push({ x: 0, y: 13 + i, to: "nantwich", tx: 54, ty: 25 + i, dir: "left", kind: "edge" });
    B.linkWarp(warps, 55, 14, "crewe", "right", null);

    W.defineMap("route_crewe_nantwich", {
      name: "Willaston & Wybunbury", region: "south", outdoor: true, music: "route_south", weatherZone: "south",
      ambience: "forest", dialogue: "town_nantwich",
      legend: R, layers: c.layers(),
      spawnPoint: { x: 3, y: 14 },
      landmark: { name: "The Leaning Tower of Wybunbury", x: 29, y: 4 },
      encounters: { grass: "route_crewe_nantwich_grass" },
      warps: warps,
      signs: [
        { x: 29, y: 7, text: ["ST CHUNGO'S, WYBUNBURY.", "The tower has fallen down four times and leans a full four feet off true.",
          "The fifth time, they gave up, took the church away and left the tower. It is still here. It is still leaning."] },
        { x: 3, y: 11, text: ["NANTWICH 1. CREWE 5.", "Somebody has added, in biro: 'and about nine hundred years apart'."] },
        { x: 50, y: 11, text: ["CREWE 2 — mind the level crossing.", "There is no level crossing. There has not been one since 1963. The sign is very sure."] }
      ],
      items: [
        { x: 15, y: 22, item: "sloe", n: 3, flag: "item_route_crewe_nantwich_1" },
        { x: 46, y: 5, item: "capsule_mesh", n: 3, flag: "item_route_crewe_nantwich_2" },
        { x: 4, y: 25, item: "elixir", n: 1, hidden: true, flag: "item_route_crewe_nantwich_3" }
      ],
      npcs: [
        { id: "npc_route_crewe_nantwich_gwilym", x: 18, y: 15, dir: "left", sprite: "npc_farmer", behaviour: "look", radius: 4, trainer: "tr_route_crewe_nantwich_1", sight: 4 },
        { id: "npc_route_crewe_nantwich_pen", x: 40, y: 14, dir: "left", sprite: "npc_walker", behaviour: "look", radius: 4, trainer: "tr_route_crewe_nantwich_2", sight: 4 },
        { id: "npc_route_crewe_nantwich_kid", x: 29, y: 8, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 2,
          say: ["You can stand at the bottom and look up and it looks like it's coming down on you.", "It isn't. Probably."] }
      ],
      restPoints: [{ x: 27, y: 8, flag: "bigboy_sat_wybunbury" }]
    });
  }

  // ---------------- R17 — Booth Lane & the Wheelock flight -----------------
  // The old Roman salt road with the canal beside it. Middlewich west,
  // Sandbach east.
  if (!W.has("route_sandbach_middlewich")) {
    const c = B.canvas(56, 30, ".");
    c.fill("g", 0, 0, 56, 1, "T"); c.fill("g", 0, 29, 56, 1, "T");
    c.fill("g", 0, 0, 1, 30, "T"); c.fill("g", 55, 0, 1, 30, "T");
    for (let x = 0; x < 56; x++) c.set("o", x, 0, "y");
    // Booth Lane along the top, the Trent & Mersey below it
    c.fill("g", 1, 6, 54, 3, ";");
    c.fill("g", 1, 5, 54, 1, "-");
    B.canal(c, 1, 14, 54, "h", { width: 3, tow: "t", far: "t" });
    B.lockFlight(c, 8, 15, 6, 8, { gate: "K", beam: "e", width: 3 });
    c.fill("g", 1, 10, 54, 4, ",");
    c.fill("g", 2, 20, 52, 8, "\"");
    c.fill("g", 20, 22, 12, 5, ".");
    // the salt works ruin
    c.fill("g", 34, 21, 14, 6, ",");
    B.saltPans(c, 36, 23, 3, {});
    c.fill("g", 34, 20, 14, 1, "w");
    c.set("g", 41, 20, "J");
    c.set("g", 33, 24, "N");
    // crossings
    c.fill("g", 26, 13, 3, 6, "x");
    c.fill("g", 26, 9, 3, 5, ";");
    c.fill("g", 26, 19, 3, 3, "+");
    B.trees(c, "r17-n", 20, 2, 1, 52, 4, "T", "y", ["."]);
    B.trees(c, "r17-s", 24, 2, 20, 52, 8, "B", "b", ["\""]);
    c.set("g", 6, 13, "Q"); c.set("g", 48, 18, "Q");
    c.set("g", 4, 4, "P"); c.set("g", 51, 4, "P");
    c.fill("g", 1, 6, 2, 3, ";"); c.fill("g", 53, 6, 2, 3, ";");

    const warps = [];
    for (let i = 0; i < 3; i++) warps.push({ x: 0, y: 6 + i, to: "middlewich", tx: 46, ty: 14 + i, dir: "left", kind: "edge" });
    B.linkWarp(warps, 55, 7, "sandbach", "right", null);

    W.defineMap("route_sandbach_middlewich", {
      name: "Booth Lane", region: "salt", outdoor: true, music: "route_salt", weatherZone: "salt",
      ambience: "water", dialogue: "town_middlewich",
      legend: R, layers: c.layers(),
      spawnPoint: { x: 3, y: 7 },
      landmark: { name: "The Wheelock Flight", x: 24, y: 15 },
      encounters: { grass: "route_sandbach_middlewich_grass", water: "route_sandbach_middlewich_water" },
      fishing: "fish_middlewich",
      warps: warps,
      signs: [
        { x: 4, y: 4, text: ["BOOTH LANE — the old salt road.", "Roman ruts under two feet of tarmac. The lorries still take the same line and nobody has ever explained why."] },
        { x: 33, y: 24, text: ["WHEELOCK SALT WORKS (closed 1963).", "Six open pans. Nobody has taken the roof off; the roof simply left."] },
        { x: 51, y: 4, text: ["SANDBACH 2. The crosses are worth the walk and the market is worth the wait."] }
      ],
      items: [
        { x: 22, y: 25, item: "salt_crystal", n: 2, flag: "item_route_sandbach_middlewich_1" },
        { x: 45, y: 25, item: "tonic", n: 2, hidden: true, flag: "item_route_sandbach_middlewich_2" }
      ],
      npcs: [
        { id: "npc_route_sandbach_middlewich_carwyn", x: 16, y: 13, dir: "right", sprite: "npc_boater", behaviour: "look", radius: 4, trainer: "tr_route_sandbach_middlewich_1", sight: 4 },
        { id: "npc_route_sandbach_middlewich_ffion", x: 38, y: 7, dir: "left", sprite: "npc_saltworker", behaviour: "look", radius: 4, trainer: "tr_route_sandbach_middlewich_2", sight: 4 }
      ]
    });
  }

  // ---------------- the Cambrian carriage ---------------------------------
  // Ch.5 rides it east to west with VEX; Ch.6 rides it home. One carriage,
  // eight seats, and a window that does most of the work.
  if (!W.has("cambrian_train")) {
    const T = {
      "#": "train_carriage", "^": "wall_interior_top", "_": "floor_wood", "W": "window",
      "c": "chair", "t": "table", "d": "train_door", "s": "shelf", "l": "lamp", " ": null
    };
    const c = B.canvas(28, 12, "_");
    c.box("g", 0, 0, 28, 12, "#");
    c.fill("g", 1, 0, 26, 1, "^");
    c.fill("g", 1, 1, 26, 1, "W");
    c.fill("g", 1, 10, 26, 1, "W");
    for (let i = 0; i < 6; i++) {
      c.set("g", 3 + i * 4, 3, "c"); c.set("g", 4 + i * 4, 3, "c");
      c.fill("g", 3 + i * 4, 4, 2, 1, "t");
      c.set("g", 3 + i * 4, 5, "c"); c.set("g", 4 + i * 4, 5, "c");
    }
    c.set("g", 0, 6, "d"); c.set("g", 27, 6, "d");
    c.set("g", 1, 8, "s"); c.set("g", 26, 8, "l");
    W.defineMap("cambrian_train", {
      name: "The Cambrian Line", region: "interior", outdoor: false, cutscene: true, music: "route_wales", weatherZone: null,
      ambience: "industrial", dialogue: "town_y_berllan",
      legend: T, layers: c.layers(),
      spawnPoint: { x: 13, y: 8 },
      encounters: { grass: null },
      warps: [],
      signs: [{ x: 1, y: 8, text: ["A route map behind cracked perspex.", "Crewe. Shrewsbury. Welshpool. Machynlleth. Then it turns north and runs beside the sea for an hour, and everybody stops talking."] }],
      npcs: []
    });
  }
})();
