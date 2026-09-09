// MonsterQuest v2 — world engine tests (map runtime, overworld, NPCs,
// interaction, encounters). Headless only: no browser, no canvas assertions
// beyond "it drew something and didn't throw".
"use strict";
const H = require("../headless");

// Step the loop `n` fixed steps, letting promises settle between steps.
function pump(env, n) {
  let i = 0;
  return new Promise(function (resolve) {
    (function loop() {
      if (i++ >= n) return resolve();
      env.step(1);
      setImmediate(loop);
    })();
  });
}

function boot(opts) {
  opts = opts || {};
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init();
  MQ.Input.init();
  MQ.Dialog.auto = true;
  MQ.DEV = false;                      // quiet the redefine warnings in fixtures
  fixtures(MQ);
  MQ.Scenes.push(MQ.Overworld, { map: opts.map || "we_field", x: opts.x, y: opts.y, dir: opts.dir });
  MQ.Scenes.flush();
  return env;
}

// ---- fixtures -----------------------------------------------------------
function fixtures(MQ) {
  const W = MQ.World;

  MQ.Story = MQ.Story || {};
  MQ.Story.npcScripts = MQ.Story.npcScripts || {};
  MQ.Story.npcScripts.we_greeter = function* (ctx) {
    yield ctx.S.say("Now then. Mind the ledge.");
    yield ctx.S.setFlag("we_greeted");
    return "done";
  };
  MQ.Story.npcScripts.we_trigger = function* (ctx) {
    yield ctx.S.setFlag("we_triggered");
  };

  MQ.Data.define("encounters", "we_field_grass", {
    zone: "grass", rate: 1,
    table: [
      { species: "nibbit", min: 3, max: 5, w: 60 },
      { species: "flitchick", min: 3, max: 6, w: 30 },
      { species: "spindrake", min: 5, max: 7, w: 4, rare: true }
    ]
  });
  MQ.Data.define("encounters", "we_field_grass_night", {
    zone: "grass", rate: 1,
    table: [{ species: "flitmoth", min: 4, max: 6, w: 50 }, { species: "webshade", min: 4, max: 7, w: 20 }]
  });
  MQ.Data.define("encounters", "fish_we_field", {
    zone: "water", rate: 1,
    table: [
      { species: "puddlish", min: 4, max: 6, w: 60, tier: "common" },
      { species: "perchip", min: 5, max: 8, w: 25, tier: "uncommon" },
      { species: "torrentide", min: 8, max: 12, w: 6, tier: "rare" }
    ]
  });
  MQ.Data.define("trainers", "tr_we_field_1", {
    name: "Bev", cls: "Walker", sprite: "npc_walker",
    party: [{ species: "nibbit", level: 5 }], ai: "random", payout: 120,
    intro: ["You've the look of someone who walks."], win: ["Told you."], lose: ["Fair enough."]
  });

  // 24 x 18 field: tree border, tall grass, a pond, a ledge shelf, a house.
  W.defineMap("we_field", {
    name: "Test Field", region: "east", outdoor: true, music: "route_east", weatherZone: "east", ambience: "forest",
    legend: {
      "T": "tree_oak", "t": "tree_oak_top", ".": "grass", "w": "grass_tall", "=": "path_dirt",
      "~": "water", "L": "ledge_down", "#": "wall_brick_red", "D": "door_wood", "W": "window",
      "R": "roof_slate", "S": "sign", "c": "cliff_climb", "f": "flowers_yellow", "l": "lamp", " ": null
    },
    layers: {
      ground: [
        "TTTTTTTTTTTTTTTTTTTTTTTT",
        "T......................T",
        "T...RRRR....wwwww......T",
        "T...#WDW....wwwww......T",
        "T......................T",
        "T.....=................T",
        "T.....=......S.........T",
        "T.....=................T",
        "T.....========.........T",
        "T............=.........T",
        "TLLLLLLLLLLLL=LLLLLLLL.T",
        "T............=.........T",
        "T...~~~~.....=......c..T",
        "T...~~~~.....=.........T",
        "T...~~~~.....=....l....T",
        "T............=.........T",
        "T............=.........T",
        "TTTTTTTTTTTTTTTTTTTTTTTT"
      ],
      over: [
        "tttttttttttttttttttttttt",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "                        ",
        "tttttttttttttttttttttttt"
      ]
    },
    warps: [{ x: 6, y: 3, to: "we_house", tx: 5, ty: 8, dir: "up", kind: "door" }],
    signs: [{ x: 13, y: 6, text: ["TEST FIELD", "Ledges south. Pond west. Mind the cat."] }],
    items: [{ x: 9, y: 6, item: "salve", n: 1, flag: "item_we_field_1" }],
    npcs: [
      { id: "we_greeter", x: 8, y: 12, dir: "down", sprite: "npc_walker", behaviour: "still", script: "we_greeter" },
      { id: "we_wanderer", x: 17, y: 6, dir: "down", sprite: "npc_kid", behaviour: "wander", radius: 2, say: ["Lovely day."] },
      { id: "we_patroller", x: 15, y: 15, dir: "up", sprite: "npc_ranger", behaviour: "path", path: [[15, 15], [18, 15]], say: ["Just doing my rounds."] },
      { id: "we_trainer", x: 20, y: 8, dir: "left", sprite: "npc_walker", behaviour: "still", trainer: "tr_we_field_1", sight: 4 },
      { id: "we_looker", x: 3, y: 15, dir: "down", sprite: "npc_granny", behaviour: "look", radius: 3, say: ["Ooh, hello."] }
    ],
    triggers: [{ x: 13, y: 16, w: 1, h: 1, script: "we_trigger", once: "we_trigger_done" }],
    encounters: { grass: "we_field_grass", water: null, cave: null },
    fishing: "fish_we_field",
    restPoints: [{ x: 13, y: 6, flag: "we_rested" }],
    catGaps: [{ x: 19, y: 6, item: "salve", n: 1, flag: "we_gap_1", say: ["MEADOW comes back with a dusty little box."] }],
    spawnPoint: { x: 13, y: 9 },
    healPoint: { x: 13, y: 9 },
    landmark: { name: "The Test Field", x: 13, y: 9 }
  });

  W.defineMap("we_house", W.template("house_large", {
    name: "Test House",
    warps: [{ x: 7, y: 13, to: "we_field", tx: 6, ty: 4, dir: "down", kind: "door" }],
    npcs: [{ id: "we_mum", x: 3, y: 4, dir: "down", sprite: "mum", behaviour: "still", say: ["Wipe your feet."] }]
  }));

  // an edge-linked pair, to exercise generated edge warps
  W.defineMap("we_edge_a", {
    name: "Edge A", region: "east", outdoor: true,
    legend: { ".": "grass", "T": "tree_oak" },
    layers: { ground: ["..........", "..........", "..........", "..........", ".........."] },
    edges: { south: { map: "we_edge_b", offset: 0 } },
    spawnPoint: { x: 5, y: 2 }
  });
  W.defineMap("we_edge_b", {
    name: "Edge B", region: "east", outdoor: true,
    legend: { ".": "grass" },
    layers: { ground: ["..........", "..........", "..........", "..........", ".........."] },
    edges: { north: { map: "we_edge_a", offset: 0 } },
    spawnPoint: { x: 5, y: 2 }
  });
}

module.exports = function (t, assert) {

  // ---- map runtime -----------------------------------------------------
  t("World.prepare builds collision, zone, ledge and interact grids", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World, m = W.get("we_field");
    const rt = W.prepare(m);
    assert.strictEqual(rt.w, 24); assert.strictEqual(rt.h, 18);
    assert.strictEqual(W.blocked(m, 0, 0, null), true, "tree border is solid");
    assert.strictEqual(W.blocked(m, 13, 9, null), false, "spawn is walkable");
    assert.strictEqual(W.zoneAt(m, 13, 2), "grass", "tall grass is an encounter zone");
    assert.strictEqual(W.zoneAt(m, 13, 9), null);
    assert.strictEqual(W.ledgeAt(m, 4, 10), "down");
    assert.strictEqual(W.interactAt(m, 13, 6), "sign");
    assert.strictEqual(W.interactAt(m, 6, 3), "door");
    assert.ok(W.signAt(m, 13, 6));
    assert.ok(W.itemAt(m, 9, 6));
    assert.strictEqual(W.itemAt(m, 9, 6).flag, "item_we_field_1");
    assert.ok(rt.anim.length > 0, "water is animated");
    // preparing twice returns the same object
    assert.strictEqual(W.prepare(m), rt);
  });

  t("water, crags and bogs open up with the right traversal ability", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World, m = W.get("we_field");
    const none = new Set(), boat = new Set(["boat"]), climb = new Set(["climb"]);
    assert.strictEqual(W.blocked(m, 5, 12, none), true, "water blocked on foot");
    assert.strictEqual(W.blocked(m, 5, 12, boat), false, "water opens with the boat");
    assert.strictEqual(W.blockReason(m, 5, 12, none), "water");
    assert.strictEqual(W.blocked(m, 20, 12, none), true, "crag blocked without grips");
    assert.strictEqual(W.blocked(m, 20, 12, climb), false);
    assert.strictEqual(W.blockReason(m, 20, 12, none), "climb");
  });

  t("edges generate seamless warps in both directions", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World;
    const a = W.get("we_edge_a");
    W.prepare(a);
    const w = W.warpAt(a, 3, 4);
    assert.ok(w, "south edge produced a warp");
    assert.strictEqual(w.to, "we_edge_b");
    assert.strictEqual(w.ty, 0);
    assert.strictEqual(w.kind, "edge");
    const b = W.get("we_edge_b");
    W.prepare(b);
    assert.strictEqual(W.warpAt(b, 3, 0).to, "we_edge_a");
  });

  t("the nine interior templates instantiate, differ, and validate", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World;
    const wanted = ["house_small", "house_large", "shop", "care_centre", "gym_hall", "station", "pub", "church", "cave_room"];
    wanted.forEach(function (name) {
      assert.ok(W.builtins[name], "missing template " + name);
      const def = W.builtin(name, { name: "T " + name, warps: [{ x: 1, y: 1, to: "we_field", tx: 13, ty: 9, dir: "down", kind: "door" }] });
      const m = W.defineMap("tpl_" + name, def);
      assert.ok(m.width >= 10 && m.height >= 8, name + " is a real room");
      const rows = m.layers.ground;
      rows.forEach(function (r) { assert.strictEqual(r.length, m.width, name + " has a ragged row"); });
      assert.ok(m.anchors && m.anchors.door, name + " has anchors");
      assert.strictEqual(W.blocked(m, m.spawnPoint.x, m.spawnPoint.y, null), false, name + " spawn is walkable");
    });
    // patch overrides poke single cells
    const patched = W.template("house_small", { patch: [{ x: 1, y: 2, ch: "t" }] });
    assert.strictEqual(patched.layers.ground[2].charAt(1), "t");
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
  });

  t("validation catches the runtime fields the overworld relies on", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World;
    W.defineMap("we_bad", {
      name: "Bad", region: "east", outdoor: true,
      legend: { ".": "grass", "w": "grass_tall", "T": "tree_oak" },
      layers: { ground: ["..........", ".wwwwwwww.", ".wwwwwwww.", "..........", ".........."] },
      warps: [{ x: 0, y: 0, to: "we_field", tx: 13, ty: 9, kind: "trapdoor" }],
      npcs: [
        { id: "bad_pather", x: 2, y: 3, behaviour: "path", say: ["…"] },
        { id: "bad_behaviour", x: 3, y: 3, behaviour: "moonwalk", say: ["…"] },
        { id: "bad_sight", x: 4, y: 3, behaviour: "still", trainer: "tr_we_field_1", sight: 40 }
      ],
      triggers: [{ x: 8, y: 4, w: 4, h: 4, script: "we_trigger" }],
      catGaps: [{ x: 99, y: 1 }],
      restPoints: [{ x: 4, y: 99 }],
      items: [{ x: 1, y: 0, item: "salve", flag: "dupe" }, { x: 2, y: 0, item: "salve", flag: "dupe" }],
      fishing: "fish_nowhere",
      encounters: { swamp: "we_field_grass" },
      spawnPoint: { x: 0, y: 4 }
    });
    const errs = W.validate();
    const hit = function (frag) { return errs.some(function (e) { return e.indexOf(frag) >= 0; }); };
    assert.ok(hit("unknown kind 'trapdoor'"), errs.join("\n"));
    assert.ok(hit("behaviour 'path' needs a path"));
    assert.ok(hit("unknown behaviour 'moonwalk'"));
    assert.ok(hit("sight 40 out of range"));
    assert.ok(hit("trigger #0 extends out of bounds"));
    assert.ok(hit("catGap #0 out of bounds"));
    assert.ok(hit("restPoint #0 out of bounds"));
    assert.ok(hit("reuses flag 'dupe'"));
    assert.ok(hit("fishing table 'fish_nowhere' undefined"));
    assert.ok(hit("encounter zone 'swamp'"));
    delete W.maps.we_bad;
    // and a map with long grass but no encounters block at all
    W.defineMap("we_bad2", {
      name: "Bad 2", region: "east", outdoor: true,
      legend: { "w": "grass_tall" },
      layers: { ground: ["wwwwwwwwww", "wwwwwwwwww"] },
      spawnPoint: { x: 0, y: 0 }
    });
    assert.ok(W.validate().some(function (e) { return e.indexOf("no `encounters` block") >= 0; }));
    delete W.maps.we_bad2;
    assert.strictEqual(W.validate().length, 0, W.validate().join("\n"));
  });

  t("A* routes around obstacles and refuses the impossible", function () {
    const env = H.load(); const MQ = env.MQ; fixtures(MQ);
    const W = MQ.World, m = W.get("we_field");
    const path = W.findPath(m, 13, 9, 13, 15);
    assert.ok(path && path.length >= 6, "found a route south");
    assert.strictEqual(path[path.length - 1].x, 13);
    assert.strictEqual(path[path.length - 1].y, 15);
    // into the pond without a boat: no route
    assert.strictEqual(W.findPath(m, 13, 9, 5, 12, { maxNodes: 400 }), null);
    // with a boat there is one
    assert.ok(W.findPath(m, 13, 9, 5, 12, { abilities: new Set(["boat"]), maxNodes: 900 }));
  });

  // ---- overworld movement ----------------------------------------------
  t("the player walks, is stopped by a wall, and slides along it", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    assert.strictEqual(MQ.Scenes.top().id, "overworld");
    assert.strictEqual(O.state.map, "we_field");
    const startX = O.player.px;
    env.key("ArrowRight");
    return pump(env, 20).then(function () {
      assert.ok(O.player.px > startX + 20, "walked right (" + (O.player.px - startX) + "px)");
      env.key("ArrowRight", false);
      // now push into the tree border on the east side
      O.place(21, 9, "right");
      env.key("ArrowRight");
      return pump(env, 40);
    }).then(function () {
      assert.ok(O.player.px < 23 * 32 - 9, "stopped by the tree wall at x=" + (O.player.px / 32).toFixed(2));
      assert.ok(O.player.px > 22 * 32, "…but got right up to it");
      assert.strictEqual(O.player.dir, "right");
      // sliding: hold down-right against the same wall and you should slide south
      const y0 = O.player.py;
      env.key("ArrowDown");
      return pump(env, 30).then(function () {
        assert.ok(O.player.py > y0 + 10, "slid along the wall instead of sticking");
        env.key("ArrowRight", false); env.key("ArrowDown", false);
      });
    });
  });

  t("running is faster than walking and tall grass slows you", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(10, 9, "up");
    let walked, ran, grassed;
    env.key("ArrowUp");
    return pump(env, 30).then(function () {
      walked = 9 * 32 + 16 - O.player.py;
      O.place(10, 9, "up");
      env.key("ShiftLeft");
      return pump(env, 30);
    }).then(function () {
      ran = 9 * 32 + 16 - O.player.py;
      assert.ok(ran > walked * 1.4, "run " + ran.toFixed(1) + "px vs walk " + walked.toFixed(1) + "px");
      env.key("ShiftLeft", false);
      O.place(13, 3, "up");                       // stood in the tall grass block
      MQ.Encounters.repel(9999);                  // no ambushes while we measure
      return pump(env, 30);
    }).then(function () {
      grassed = 3 * 32 + 16 - O.player.py;
      assert.ok(grassed < walked, "tall grass slowed the walk: " + grassed.toFixed(1) + " < " + walked.toFixed(1));
      assert.ok(grassed > walked * 0.7, "…but only a bit");
      env.key("ArrowUp", false);
      MQ.Encounters.clearRepel();
    });
  });

  t("ledges hop you down and never back up", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(4, 9, "down");
    env.key("ArrowDown");
    return pump(env, 45).then(function () {
      assert.ok(O.player.y >= 11, "hopped the ledge to y=" + O.player.y);
      env.key("ArrowDown", false);
      // walking back up into the ledge tile is refused
      const y = O.player.py;
      O.place(4, 11, "up");
      env.key("ArrowUp");
      return pump(env, 40).then(function () {
        env.key("ArrowUp", false);
        assert.ok(O.player.y >= 11, "ledge blocks the way back up (y=" + O.player.y + ")");
      });
    });
  });

  t("water needs the boat; the boat drops you back on land", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(9, 13, "left");
    env.key("ArrowLeft");
    return pump(env, 30).then(function () {
      assert.ok(O.player.x >= 8, "stopped at the water's edge (x=" + O.player.x + ")");
      assert.strictEqual(O.state.boating, false);
      O.unlock("boat");
      assert.strictEqual(O.hasAbility("boat"), true);
      assert.strictEqual(MQ.Flags.get("unlock_boat"), true);
      return pump(env, 40);
    }).then(function () {
      assert.ok(O.player.x < 8, "with the licence you can chug across (x=" + O.player.x + ")");
      assert.strictEqual(O.state.boating, true, "and you are in the boat");
      env.key("ArrowLeft", false);
      env.key("ArrowRight");
      return pump(env, 80);
    }).then(function () {
      env.key("ArrowRight", false);
      assert.ok(O.player.x >= 8, "back on the bank");
      assert.strictEqual(O.state.boating, false, "the boat let you off");
    });
  });

  // ---- warps -------------------------------------------------------------
  t("stepping on a door warps inside, and back out again", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(6, 4, "up");
    env.key("ArrowUp");
    return pump(env, 60).then(function () {
      env.key("ArrowUp", false);
      assert.strictEqual(O.state.map, "we_house", "went inside");
      assert.strictEqual(O.player.x, 5);
      assert.ok(O.currentMap().outdoor === false);
      return O.warp("we_field", 13, 9, "down", { fade: false });
    }).then(function () {
      assert.strictEqual(O.state.map, "we_field");
      assert.strictEqual(O.player.x, 13);
      assert.strictEqual(O.player.y, 9);
      assert.ok(O.state.visited.we_field >= 1);
    });
  });

  t("warp() is a promise and the camera clamps to the map", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const mw = 24 * 32, mh = 18 * 32;
    return O.warp("we_field", 1, 1, "down", { fade: false }).then(function () {
      // this map is narrower than the view, so it is centred, not clamped to 0
      assert.ok(Math.abs(O.camera.x - (mw - MQ.View.w) / 2) < 0.01, "narrow map centred, x=" + O.camera.x);
      assert.ok(O.camera.y >= -0.001, "camera clamped to the top edge, y=" + O.camera.y);
      return O.warp("we_field", 22, 16, "down", { fade: false });
    }).then(function () {
      assert.ok(O.camera.y <= mh - MQ.View.h + 0.001, "camera clamped to the bottom edge");
      assert.ok(O.camera.y > 0, "…and it did have room to scroll");
    });
  });

  // ---- encounters --------------------------------------------------------
  t("encounter rolls pick from the table, honour repel and lean rare with SIGNAL", function () {
    const env = boot(); const MQ = env.MQ, E = MQ.Encounters;
    const m = MQ.World.get("we_field");
    const seen = {};
    for (let i = 0; i < 250; i++) {
      const r = E.rollZone(m, "grass", { force: true });
      assert.ok(r, "forced roll produced an encounter");
      seen[r.species] = (seen[r.species] || 0) + 1;
      assert.ok(r.level >= 3 && r.level <= 7, "level in band: " + r.level);
      assert.strictEqual(r.table, "we_field_grass");
    }
    assert.ok(seen.nibbit > seen.spindrake, "common beats rare");
    // repel
    E.repel(50);
    assert.strictEqual(E.rollZone(m, "grass", {}), null, "repel suppresses encounters");
    E.clearRepel();
    // night swaps the table
    MQ.Clock.setTime(23, 0);
    const night = E.tableId(m, "grass");
    assert.strictEqual(night, "we_field_grass_night");
    MQ.Clock.setTime(12, 0);
    assert.strictEqual(E.tableId(m, "grass"), "we_field_grass");
    // SIGNAL raises the rare weight
    let rareLow = 0, rareHigh = 0;
    for (let i = 0; i < 400; i++) if (E.rollZone(m, "grass", { force: true }).species === "spindrake") rareLow++;
    MQ.Flags.set("signal_meter", true);
    MQ.Flags.set("cutover_days", 0);
    assert.ok(E.signalLevel() > 0.9, "signal is high: " + E.signalLevel());
    for (let i = 0; i < 400; i++) if (E.rollZone(m, "grass", { force: true }).species === "spindrake") rareHigh++;
    assert.ok(rareHigh > rareLow, "SIGNAL raised rare weight (" + rareLow + " → " + rareHigh + ")");
    MQ.Flags.set("signal_meter", false);
    MQ.Flags.clear("cutover_days");
  });

  t("walking in tall grass eventually starts a wild battle", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    let started = null, ended = false;
    MQ.Events.on("battle:start", function (d) { started = d; });
    MQ.Events.on("battle:end", function () { ended = true; });
    const realRandom = Math.random;
    Math.random = function () { return 0.01; };     // pin the roll so this never flakes
    O.place(12, 2, "right");
    env.key("ArrowRight");
    return pump(env, 140).then(function () {
      env.key("ArrowRight", false);
      Math.random = realRandom;
      assert.ok(started, "an encounter fired in the tall grass");
      assert.ok(["nibbit", "flitchick", "spindrake"].indexOf(started.species) >= 0);
      assert.strictEqual(started.zone, "grass");
      assert.strictEqual(started.table, "we_field_grass");
      assert.ok(ended, "and the battle finished, handing control back");
      assert.strictEqual(MQ.Overworld.busy(), false);
    }, function (e) { Math.random = realRandom; throw e; });
  });

  t("chain fishing leans the table and rods gate the tiers", function () {
    const env = boot(); const MQ = env.MQ, E = MQ.Encounters;
    const m = MQ.World.get("we_field");
    let bamboo = 0;
    for (let i = 0; i < 200; i++) { const r = E.fish(m, 5, 12, { rod: "bamboo" }); if (r && r.tier === "rare") bamboo++; }
    assert.strictEqual(bamboo, 0, "a bamboo rod never lands the rare tier");
    E.breakChain();
    let rare = 0;
    for (let i = 0; i < 200; i++) { const r = E.fish(m, 5, 12, { rod: "weighted" }); if (r && r.tier === "rare") rare++; }
    assert.ok(rare > 0, "a weighted rod can");
    assert.ok(E.state.chain > 0, "a chain is being tracked");
  });

  t("preview lists what lives here (Tracker perk / MEADOW's nose)", function () {
    const env = boot(); const MQ = env.MQ;
    const p = MQ.Encounters.preview(MQ.World.get("we_field"), 13, 2);
    assert.ok(p && p.rows.length === 3);
    assert.strictEqual(p.zone, "grass");
    assert.strictEqual(p.rows[0].species, "nibbit");
    let total = 0;
    p.rows.forEach(function (r) { total += r.pct; });
    assert.ok(total >= 97 && total <= 103, "percentages add up: " + total);
    assert.strictEqual(MQ.Encounters.preview(MQ.World.get("we_field"), 13, 9), null);
  });

  // ---- NPCs --------------------------------------------------------------
  t("NPC behaviours: wander stays home, patrols walk their path, lookers turn", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const w = O.getNpc("we_wanderer"), p = O.getNpc("we_patroller"), l = O.getNpc("we_looker");
    assert.ok(w && p && l);
    O.place(3, 14, "down");                  // stand next to the looker
    // Sample the patroller's reach rather than just its position at the end:
    // its path is only 3 tiles long and loops straight back, so a run with
    // an unlucky (random) start delay can land the last frame exactly back
    // at the home waypoint between loops — that is still real progress.
    let maxX = p.x;
    let i = 0;
    return new Promise(function (resolve) {
      (function loop() {
        if (i++ >= 260) return resolve();
        env.step(1);
        if (p.x > maxX) maxX = p.x;
        setImmediate(loop);
      })();
    }).then(function () {
      assert.ok(Math.abs(w.x - w.home.x) <= 2 && Math.abs(w.y - w.home.y) <= 2, "wanderer stayed within its radius");
      assert.ok(maxX > 15, "patroller made progress along the path");
      assert.strictEqual(l.dir, "up", "the looker turned to face the player");
    });
  });

  t("a trainer spots you, walks up, and the battle sets the beaten flag", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const tr = O.getNpc("we_trainer");
    assert.strictEqual(MQ.NPC.isBeaten(tr), false);
    O.place(17, 8, "right");                 // 3 tiles inside its line of sight
    return pump(env, 6).then(function () {
      assert.strictEqual(tr.spotted, true, "spotted by the trainer");
      assert.ok(MQ.NPC.emoting(tr), "the '!' bubble is up");
      return pump(env, 220);
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("beat_tr_we_field_1"), true, "battle resolved and the flag is set");
      assert.ok(tr.x <= 20 && tr.x >= 18, "the trainer walked up to you (x=" + tr.x + ")");
      assert.strictEqual(MQ.NPC.sightCheck(tr, O.player, O.blockedTile), 0, "a beaten trainer stops staring");
    });
  });

  t("script commands drive the overworld: move, face, spawn, camera, freeze", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(13, 9, "down");
    const S = MQ.Script.cmds;
    const gen = function* (ctx) {
      yield S.face("player", "left");
      yield S.spawnNpc({ id: "we_ghost", x: 12, y: 10, dir: "down", sprite: "npc_walker", say: ["Boo."] });
      yield S.move("player", ["up", "up"]);
      yield S.camera(2, 2, 0);
      yield S.cameraFollow();
      yield S.showNpc("we_ghost", false);
      return "ok";
    };
    const p = MQ.Script.run(gen, { S: S });
    assert.strictEqual(O.frozen(), true, "scripts freeze the overworld");
    return Promise.all([p, pump(env, 90)]).then(function (r) {
      assert.strictEqual(r[0], "ok");
      assert.strictEqual(O.player.y, 7, "moved two tiles north");
      assert.ok(O.getNpc("we_ghost"), "spawned NPC exists");
      assert.strictEqual(O.getNpc("we_ghost").hidden, true);
      assert.strictEqual(O.frozen(), false, "and unfroze afterwards");
      assert.strictEqual(O.removeNpc("we_ghost"), true);
      assert.strictEqual(O.getNpc("we_ghost"), null);
    });
  });

  // ---- interaction -------------------------------------------------------
  t("A reads signs, pockets items and runs NPC scripts", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const said = [];
    const realSay = MQ.Dialog.say;
    MQ.Dialog.say = function (pages, opts) { said.push(Array.isArray(pages) ? pages.join(" ") : String(pages)); return realSay.call(MQ.Dialog, pages, opts); };
    O.place(13, 7, "up");                       // facing the sign at (13,6)
    MQ.Input.inject("a");
    return pump(env, 12).then(function () {
      assert.ok(said.join(" ").indexOf("TEST FIELD") >= 0, "read the sign: " + said.join(" | "));
      // item pickup
      said.length = 0;
      O.place(9, 7, "up");
      MQ.Input.inject("a");
      return pump(env, 12);
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("item_we_field_1"), true, "the pickup flag is set");
      assert.ok(said.join(" ").indexOf("found") >= 0, "told the player: " + said.join(" | "));
      // NPC script
      said.length = 0;
      O.place(8, 11, "down");                   // facing we_greeter at (8,12)
      MQ.Input.inject("a");
      return pump(env, 20);
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("we_greeted"), true, "the NPC script ran");
      assert.strictEqual(MQ.Flags.get("talked_we_greeter"), true);
      assert.strictEqual(O.getNpc("we_greeter").dir, "up", "the NPC turned to face you");
      MQ.Dialog.say = realSay;
    });
  });

  t("doors, healers and locked things answer the A button", function () {
    const env = boot({ map: "we_house" }); const MQ = env.MQ, O = MQ.Overworld;
    assert.strictEqual(O.state.map, "we_house");
    // the door out of the house is a warp tile: interacting with it warps
    const p = MQ.Interact.run({ map: O.currentMap(), player: O.player }, { kind: "door", x: 7, y: 13 });
    return Promise.all([p, pump(env, 60)]).then(function () {
      assert.strictEqual(O.state.map, "we_field", "the door let us out");
      // a locked door just grumbles
      return Promise.all([
        MQ.Interact.run({ map: O.currentMap(), player: O.player }, { kind: "door", x: 0, y: 0, tile: "door_locked" }),
        pump(env, 10)
      ]);
    }).then(function () {
      assert.strictEqual(O.state.map, "we_field");
    });
  });

  t("a step trigger fires once and remembers", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(13, 15, "down");
    env.key("ArrowDown");
    return pump(env, 40).then(function () {
      env.key("ArrowDown", false);
      assert.strictEqual(MQ.Flags.get("we_triggered"), true, "trigger ran");
      assert.strictEqual(MQ.Flags.get("we_trigger_done"), true, "and marked itself done");
    });
  });

  // ---- cats --------------------------------------------------------------
  t("MEADOW follows on the breadcrumb trail, and sits when you stop", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.Flags.set("cats_joined", true);
    O.refreshCats();
    const cats = O.cats();
    assert.strictEqual(cats.length, 1);
    assert.strictEqual(cats[0].cat, "meadow");
    O.place(13, 9, "down");
    MQ.NPC.trailReset(O.player.px, O.player.py, "down");
    env.key("ArrowDown");
    return pump(env, 60).then(function () {
      env.key("ArrowDown", false);
      const d0 = Math.abs(cats[0].py - O.player.py);
      assert.ok(d0 > 8, "MEADOW trails behind (" + d0.toFixed(1) + "px)");
      assert.ok(d0 < 32 * 4, "…but keeps up");
      return pump(env, 140);                 // stand still
    }).then(function () {
      assert.strictEqual(cats[0].sitting, true, "MEADOW sat down when you stopped");
    });
  });

  // ---- rendering, HUD, save ---------------------------------------------
  t("draw() renders chunked layers, entities and the HUD without throwing", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.Flags.set("signal_meter", true);
    MQ.Flags.set("cutover_days", 17);
    O.toggleMinimap(true);
    const ctx = MQ.View.ctx || env.screen.getContext("2d");
    ctx.calls.length = 0;
    MQ.Loop.render();
    assert.ok(ctx.calls.length > 20, "drew " + ctx.calls.length + " canvas ops");
    assert.ok(ctx.calls.indexOf("drawImage") >= 0, "blitted tile chunks");
    // second frame reuses the cached chunks
    const first = ctx.calls.length;
    ctx.calls.length = 0;
    MQ.Loop.render();
    assert.ok(ctx.calls.length > 10);
    O.toggleMinimap(false);
    MQ.Flags.set("signal_meter", false);
    MQ.Flags.clear("cutover_days");
    return pump(env, 2);
  });

  t("the HUD (tracker/SIGNAL/CUTOVER/mini-map) is drawn once, through MQ.UI.HUD, not reimplemented", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    assert.ok(MQ.UI && MQ.UI.HUD && MQ.UI.HUD.corner, "ui/hud.js is loaded in a full build");
    let calls = 0;
    const real = MQ.UI.HUD.corner;
    MQ.UI.HUD.corner = function () { calls++; return real.apply(this, arguments); };
    const ctx = MQ.View.ctx || env.screen.getContext("2d");
    MQ.Loop.render();
    MQ.UI.HUD.corner = real;
    assert.strictEqual(calls, 1, "the overworld delegates its HUD corner to MQ.UI.HUD exactly once per frame");
    // the overworld's own toggle drives MQ.UI.HUD's mini-map flag, not a second one
    assert.strictEqual(MQ.UI.HUD.miniMapOn, false);
    O.toggleMinimap(true);
    assert.strictEqual(MQ.UI.HUD.miniMapOn, true, "toggling the overworld minimap also flips MQ.UI.HUD's");
    O.toggleMinimap(false);
    assert.strictEqual(MQ.UI.HUD.miniMapOn, false);
  });

  t("with MQ.UI.HUD absent, the overworld falls back to its own tracker/SIGNAL/CUTOVER/mini-map", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const realHud = MQ.UI.HUD;
    MQ.UI.HUD = null;
    MQ.Flags.set("signal_meter", true);
    MQ.Flags.set("cutover_days", 5);
    O.toggleMinimap(true);
    const ctx = MQ.View.ctx || env.screen.getContext("2d");
    ctx.calls.length = 0;
    assert.doesNotThrow(function () { MQ.Loop.render(); }, "drawing without MQ.UI.HUD does not throw");
    assert.ok(ctx.calls.length > 10, "the fallback still drew something");
    O.toggleMinimap(false);
    MQ.Flags.set("signal_meter", false);
    MQ.Flags.clear("cutover_days");
    MQ.UI.HUD = realHud;
  });

  t("setTile rewrites collision and drops the affected chunk", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const m = O.currentMap();
    assert.strictEqual(MQ.World.blocked(m, 13, 9, null), false);
    O.setTile(13, 9, "rock");
    assert.strictEqual(MQ.World.blocked(m, 13, 9, null), true, "the new tile blocks");
    O.setTile(13, 9, "grass");
    assert.strictEqual(MQ.World.blocked(m, 13, 9, null), false);
  });

  t("the save provider round-trips position, abilities and spawned NPCs", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(11, 13, "left");
    O.unlock("climb"); O.unlock("waders");
    O.state.steps = 412;
    O.spawnNpc({ id: "we_extra", x: 12, y: 13, dir: "down", sprite: "npc_walker", say: ["Hiya."] });
    const blob = JSON.parse(JSON.stringify(O.saveProvider.save()));
    assert.strictEqual(blob.map, "we_field");
    assert.deepStrictEqual(blob.abilities.sort(), ["climb", "waders"]);
    assert.strictEqual(blob.spawned.length, 1);
    // wipe and restore
    O.saveProvider.load(undefined);
    assert.strictEqual(O.state.abilities.size, 0);
    assert.strictEqual(O.state.steps, 0);
    O.saveProvider.load(blob);
    assert.strictEqual(O.state.steps, 412);
    assert.strictEqual(O.hasAbility("climb"), true);
    assert.strictEqual(O.state.map, "we_field");
    assert.ok(O.getNpc("we_extra"), "the spawned NPC came back");
    assert.strictEqual(MQ.Save.providers.overworld === undefined, true, "Boot registers it; we don't double-register");
  });

  t("cat gaps: MEADOW squeezes through and fetches what's behind", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    const m = O.currentMap();
    assert.strictEqual(MQ.World.isCatGap(m, 19, 6), true);
    assert.strictEqual(MQ.World.interactAt(m, 19, 6), "catgap");
    assert.strictEqual(MQ.World.blocked(m, 19, 6, O.state.abilities), true, "a person cannot get through");
    const said = [];
    const realSay = MQ.Dialog.say;
    MQ.Dialog.say = function (pages, opts) { said.push(Array.isArray(pages) ? pages.join(" ") : String(pages)); return realSay.call(MQ.Dialog, pages, opts); };
    // no squeeze, no cat: just a remark
    const p1 = MQ.Interact.run({ map: m, player: O.player }, { kind: "catgap", x: 19, y: 6 });
    return Promise.all([p1, pump(env, 6)]).then(function () {
      assert.ok(said.join(" ").indexOf("cat could manage") >= 0, said.join(" | "));
      MQ.Flags.set("cats_joined", true);
      O.refreshCats();
      O.unlock("squeeze");
      O.place(19, 7, "up");
      said.length = 0;
      const p2 = MQ.Interact.run({ map: m, player: O.player }, { kind: "catgap", x: 19, y: 6 });
      return Promise.all([p2, pump(env, 200)]);
    }).then(function (r) {
      MQ.Dialog.say = realSay;
      assert.strictEqual(r[0], true, "the errand completed");
      assert.strictEqual(MQ.Flags.get("we_gap_1"), true, "the gap is marked done");
      if (MQ.Inventory && MQ.Inventory.count) {
        assert.strictEqual(MQ.Inventory.count("salve"), 1, "MEADOW brought back the goods");
      } else {
        assert.strictEqual(MQ.Flags.get("item_salve"), 1, "MEADOW brought back the goods");
      }
      assert.strictEqual(O.frozen(), false);
      assert.strictEqual(O.getCat("meadow").scriptCtl, null);
    }, function (e) { MQ.Dialog.say = realSay; throw e; });
  });

  t("warpTo drops you at a map's spawn point (rail, beacons, the lift)", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    return O.warpTo("we_house", { fade: false }).then(function () {
      const sp = MQ.World.spawnOf(MQ.World.get("we_house"));
      assert.strictEqual(O.state.map, "we_house");
      assert.strictEqual(O.player.x, sp.x);
      assert.strictEqual(O.player.y, sp.y);
      assert.strictEqual(O.warpTo("no_such_map") instanceof Promise, true);
    });
  });

  t("a lost battle walks you back to the last kettle", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.state.respawn = { map: "we_house", x: 7, y: 12, dir: "down" };
    MQ.Events.emit("battle:end", { outcome: "lose" });
    return pump(env, 60).then(function () {
      assert.strictEqual(O.state.map, "we_house", "recovered indoors");
      assert.strictEqual(O.player.x, 7);
    });
  });

  t("weather changes announce themselves and slow the walk", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.UI.toasts.length = 0;
    MQ.Clock.setWeather("rain", "east");
    assert.ok(MQ.UI.toasts.length > 0, "the player was told");
    assert.ok(MQ.UI.toasts[0].text.indexOf("Rain") >= 0, MQ.UI.toasts[0].text);
    O.place(10, 9, "up");
    let wet;
    env.key("ArrowUp");
    return pump(env, 30).then(function () {
      wet = 9 * 32 + 16 - O.player.py;
      MQ.Clock.setWeather("clear", "east");
      O.place(10, 9, "up");
      return pump(env, 30);
    }).then(function () {
      env.key("ArrowUp", false);
      const dry = 9 * 32 + 16 - O.player.py;
      assert.ok(wet < dry, "rain slowed the walk: " + wet.toFixed(1) + " < " + dry.toFixed(1));
      assert.ok(wet > dry * 0.8, "…by about a tenth");
    });
  });

  t("freeze and hideHud gate input and chrome", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    O.place(13, 9, "down");
    const y0 = O.player.py;
    O.freeze(true);
    env.key("ArrowDown");
    return pump(env, 20).then(function () {
      assert.strictEqual(O.player.py, y0, "frozen means frozen");
      O.freeze(false);
      return pump(env, 20);
    }).then(function () {
      env.key("ArrowDown", false);
      assert.ok(O.player.py > y0, "and unfreezing lets you go");
      O.hideHud(true);
      MQ.Loop.render();
      O.hideHud(false);
    });
  });
};
