"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, W = MQ.World;
  t("shipped maps validate clean", function () {
    const errs = W.validate();
    assert.strictEqual(errs.length, 0, errs.join("\n"));
    assert.ok(W.has("demo_field") && W.has("demo_house"));
    assert.strictEqual(W.get("demo_field").width, 30);
  });
  t("tile catalogue is comprehensive and Tiles.get renders 16x16", function () {
    assert.ok(MQ.Tiles.count() >= 140, "tiles=" + MQ.Tiles.count());
    ["grass", "grass_tall", "path_cobble", "water_canal", "tree_oak", "wall_tudor", "salt_flat", "brine_pool", "rail_track_h", "platform", "mill_wheel", "boat_lift", "dish", "moai", "cross_saxon", "bear_statue", "white_nancy", "canal_lock", "train_carriage", "cave_floor", "pc", "healer"].forEach(function (id) {
      assert.ok(MQ.Tiles.has(id), "missing tile " + id);
      const c = MQ.Tiles.get(id, 0, 0);
      assert.strictEqual(c.width, 16);
    });
    assert.strictEqual(MQ.Tiles.props("water").water, true);
    assert.strictEqual(MQ.Tiles.props("grass_tall").encounter, "grass");
    assert.strictEqual(MQ.Tiles.props("tree_oak").solid, true);
    assert.strictEqual(MQ.Tiles.props("tree_oak_top").layer, "over");
    assert.strictEqual(MQ.Tiles.props("sign").interact, "sign");
    assert.strictEqual(MQ.Tiles.props("ledge_down").ledge, "down");
  });
  t("validation catches a bad warp, bad legend, ragged layers, bad npc", function () {
    W.defineMap("bad_map", {
      name: "Bad", legend: { ".": "grass", "#": "wall_brick_red", "?": "no_such_tile" },
      layers: { ground: ["....", "..#.", "...."], deco: ["....", "...."] },
      warps: [
        { x: 0, y: 0, to: "nowhere", tx: 1, ty: 1 },
        { x: 1, y: 1, to: "demo_field", tx: 999, ty: 1 },
        { x: 2, y: 2, to: "demo_field", tx: 0, ty: 0 },        // (0,0) is a tree → solid
        { x: 9, y: 9, to: "demo_house", tx: 4, ty: 5 }
      ],
      npcs: [{ id: "n1", x: 1, y: 1 }, { id: "n1", x: 1, y: 1, script: "missing_script", cond: "a &&" }],
      spawnPoint: { x: 2, y: 1 }
    });
    const errs = W.validate();
    const has = function (frag) { return errs.some(function (e) { return e.indexOf(frag) >= 0; }); };
    assert.ok(has("target map 'nowhere' does not exist"), errs.join("\n"));
    assert.ok(has("out of bounds for demo_field"));
    assert.ok(has("is solid"));
    assert.ok(has("source out of bounds"));
    assert.ok(has("unknown tile 'no_such_tile'"));
    assert.ok(has("layer deco has 2 rows"));
    assert.ok(has("duplicate id"));
    assert.ok(has("needs script, say, trainer"));
    assert.ok(has("bad cond"));
    assert.ok(has("spawnPoint on solid tile"));
    delete W.maps.bad_map;
    assert.strictEqual(W.validate().length, 0);
  });
  t("MQ.Data registry + types", function () {
    const D = MQ.Data;
    assert.strictEqual(D.count("types"), 13);
    assert.strictEqual(D.typeMultiplier("water", ["fire", "rock"]), 4);
    assert.strictEqual(D.typeMultiplier("electric", ["ground"]), 0);
    assert.strictEqual(D.get("types", "cyber").name, "Cyber");
    assert.throws(function () { D.get("types", "nope"); });
    assert.strictEqual(D.validate().length, 0);
  });
};
