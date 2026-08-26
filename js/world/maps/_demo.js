// Demo map (foundation) — exercises the map format and validation.
// Maps workstream will add real regions in sibling files.
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;

  W.defineTemplate("house_small", {
    name: "House", region: "interior", outdoor: false, music: "town_macc", ambience: "town",
    legend: { "#": "wall_interior", "_": "floor_wood", "r": "rug", "D": "mat_welcome", "b": "bed", "t": "table", "c": "chair", "s": "shelf", "T": "tv", " ": null },
    layers: {
      ground: [
        "##########",
        "#s_____T_#",
        "#b_______#",
        "#__t_c___#",
        "#___r____#",
        "#________#",
        "#___DD___#",
        "##########"
      ]
    },
    warps: [], npcs: [], signs: [], spawnPoint: { x: 4, y: 5 }
  });

  W.defineMap("demo_house", W.template("house_small", {
    name: "Demo House",
    warps: [
      { x: 4, y: 6, to: "demo_field", tx: 12, ty: 9, dir: "down", kind: "door" },
      { x: 5, y: 6, to: "demo_field", tx: 12, ty: 9, dir: "down", kind: "door" }
    ],
    npcs: [{ id: "demo_mum", x: 6, y: 3, dir: "down", sprite: "mum", behaviour: "still", say: ["Mind how you go, love."] }]
  }));

  W.defineMap("demo_field", {
    name: "Demo Field", region: "east", outdoor: true, music: "route_east", weatherZone: "east", ambience: "forest",
    legend: {
      ".": "grass", "w": "grass_tall", "=": "path_dirt", "T": "tree_oak", "t": "tree_oak_top", "~": "water", "e": "water_edge",
      "#": "wall_brick_red", "R": "roof_slate", "D": "door_wood", "W": "window", "S": "sign", "F": "fence_wood", "f": "flowers_yellow",
      "L": "ledge_down", "r": "rock", "h": "hedge", "c": "path_cobble", "^": "roof_over", " ": null
    },
    layers: {
      ground: [
        "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
        "T............................T",
        "T..wwww......f.....RRRR......T",
        "T..wwww......f.....#WDW#.....T",
        "T..wwww......f.....#####.....T",
        "T...........===============..T",
        "T..r.....f..=.......f........T",
        "T........f..=....S...........T",
        "T..~~~e..f..=................T",
        "T..~~~e.....=......hhhhh.....T",
        "T..~~~e.....=......h...h.....T",
        "T..eeee.....=......h.w.h.....T",
        "T...........=......h...h.....T",
        "T.LLLLLLLLLL=LLLLLLh.h.h.....T",
        "T...........=......hhhhh.....T",
        "T...wwwww...=................T",
        "T...wwwww...=..FFFFFFFF......T",
        "T...wwwww...=..F......F......T",
        "T...........=..F.f..f.F......T",
        "TTTTTTTTTTTT=TTTTTTTTTTTTTTTTT"
      ],
      over: [
        "tttttttttttttttttttttttttttttt",
        "                              ",
        "                              ",
        "                   ^^^^^      ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "                              ",
        "tttttttttttt tttttttttttttttt "
      ]
    },
    warps: [
      { x: 21, y: 3, to: "demo_house", tx: 4, ty: 5, dir: "up", kind: "door" },
      { x: 12, y: 19, to: "demo_field", tx: 12, ty: 1, dir: "down", kind: "edge" }
    ],
    signs: [{ x: 17, y: 7, text: ["Demo Field", "East: nothing yet. South: loops back."] }],
    items: [{ x: 21, y: 11, item: "salve", n: 1, flag: "item_demo_1" }],
    npcs: [
      { id: "demo_walker", x: 6, y: 6, dir: "down", sprite: "walker", behaviour: "wander", radius: 3, say: ["Lovely day for it."] },
      { id: "demo_gate", x: 20, y: 5, dir: "left", sprite: "guard", behaviour: "still", say: ["The road east is shut."], cond: "!badge_1" }
    ],
    triggers: [],
    encounters: { grass: null, water: null, cave: null },
    spawnPoint: { x: 12, y: 9 },
    healPoint: { x: 12, y: 9 },
    landmark: { name: "Demo Field", x: 12, y: 9 }
  });
})();
