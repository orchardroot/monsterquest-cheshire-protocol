// MonsterQuest v2 — overworld camera zoom / letterbox tests.
// Small interiors used to be drawn 1:1 inside a big black frame; the overworld
// now scales the world up to the largest step that still shows the whole map
// and paints a room-appropriate backdrop over whatever is left.
"use strict";
const H = require("../headless");

function boot(mapId) {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init();
  MQ.Input.init();
  MQ.Dialog.auto = true;
  MQ.DEV = false;
  fixtures(MQ);
  MQ.Scenes.push(MQ.Overworld, { map: mapId });
  MQ.Scenes.flush();
  return env;
}

// A pokey 10x8 room and a big 40x30 outdoor map.
function fixtures(MQ) {
  const W = MQ.World;
  if (W.has("zt_room")) return;
  const room = [];
  for (let y = 0; y < 8; y++) {
    let r = "";
    for (let x = 0; x < 10; x++) r += (x === 0 || y === 0 || x === 9 || y === 7) ? "#" : "_";
    room.push(r);
  }
  W.defineMap("zt_room", {
    name: "Pokey Room", region: "east", outdoor: false, bg: "#2a2018",
    legend: { "#": "wall_interior", "_": "floor_wood" },
    layers: { ground: room },
    spawnPoint: { x: 5, y: 4 }
  });
  const big = [];
  for (let y = 0; y < 30; y++) {
    let r = "";
    for (let x = 0; x < 40; x++) r += (x === 0 || y === 0 || x === 39 || y === 29) ? "T" : ".";
    big.push(r);
  }
  W.defineMap("zt_big", {
    name: "Big Field", region: "east", outdoor: true,
    legend: { ".": "grass", "T": "tree_oak" },
    layers: { ground: big },
    spawnPoint: { x: 20, y: 15 }
  });
}

// Force a logical viewport size and let the overworld react.
function setView(MQ, w, h) {
  MQ.View.w = w; MQ.View.h = h;
  MQ.Events.emit("resize", { w: w, h: h });
}

module.exports = function (t, assert) {

  t("a small interior is zoomed up instead of sitting in a black frame", function () {
    const env = boot("zt_room"); const MQ = env.MQ, O = MQ.Overworld;
    setView(MQ, 960, 600);
    const z = O.zoom();
    assert.ok(z > 1, "a 10x8 room zooms in, z=" + z);
    // never crops: the whole map still fits on screen
    const r = O.mapScreenRect();
    assert.ok(r.w <= 960 + 0.001 && r.h <= 600 + 0.001, "map is not cropped: " + r.w + "x" + r.h);
    // …and it now fills far more of the view than the 1:1 third it used to
    assert.ok((r.w * r.h) / (960 * 600) > 0.55, "room fills the view, frac=" + (r.w * r.h) / (960 * 600));
    // whole-pixel tiles keep the art crisp
    assert.strictEqual((MQ.TILE * z) % 1, 0, "a tile is a whole number of screen px");
  });

  t("a map bigger than the view is drawn 1:1 and the camera still clamps", function () {
    const env = boot("zt_big"); const MQ = env.MQ, O = MQ.Overworld;
    setView(MQ, 960, 540);
    assert.strictEqual(O.zoom(), 1, "big maps are never scaled");
    const T = MQ.TILE, mw = 40 * T, mh = 30 * T;
    return O.warp("zt_big", 38, 28, "down", { fade: false }).then(function () {
      assert.ok(O.camera.x <= mw - 960 + 0.001 && O.camera.x >= -0.001, "camera clamped in x: " + O.camera.x);
      assert.ok(O.camera.y <= mh - 540 + 0.001 && O.camera.y >= -0.001, "camera clamped in y: " + O.camera.y);
      assert.ok(O.camera.y > 0, "…and it had room to scroll");
    });
  });

  t("tile <-> screen maths respect the zoom", function () {
    const env = boot("zt_room"); const MQ = env.MQ, O = MQ.Overworld;
    setView(MQ, 960, 600);
    const z = O.zoom();
    assert.ok(z > 1);
    const p = O.tileToScreen(5, 4);
    const back = O.tileAtScreen(p.x, p.y);
    assert.strictEqual(back.x, 5, "screen -> tile round-trips in x");
    assert.strictEqual(back.y, 4, "screen -> tile round-trips in y");
    // two tiles apart on screen is exactly two zoomed tiles
    const q = O.tileToScreen(7, 4);
    assert.ok(Math.abs((q.x - p.x) - 2 * MQ.TILE * z) < 0.001, "screen gap scales with zoom");
    // the room is centred in the letterbox
    const r = O.mapScreenRect();
    assert.ok(Math.abs((960 - r.w) / 2 - r.x) < 1, "letterboxed horizontally, x=" + r.x);
    assert.ok(Math.abs((600 - r.h) / 2 - r.y) < 1, "letterboxed vertically, y=" + r.y);
  });

  t("the letterbox gets a room backdrop, not raw black", function () {
    const env = boot("zt_room"); const MQ = env.MQ, O = MQ.Overworld;
    setView(MQ, 960, 600);
    const ctx = MQ.View.ctx || env.screen.getContext("2d");
    const seen = [];
    const realFill = ctx.fillRect;
    ctx.fillRect = function (x, y, w, h) {
      if (x === 0 && y === 0 && w === 960 && h === 600) seen.push(ctx.fillStyle);
      return realFill.apply(ctx, arguments);
    };
    ctx.calls.length = 0;
    O.draw(ctx);
    ctx.fillRect = realFill;
    assert.ok(seen.length > 0, "something painted the full-screen backdrop");
    assert.ok(seen.indexOf("#000") < 0 && seen.indexOf("#000000") < 0, "backdrop is not raw black: " + seen.join(","));
    assert.ok(ctx.calls.indexOf("scale") >= 0, "the world was drawn through a zoom transform");
    assert.ok(ctx.calls.indexOf("drawImage") >= 0, "tiles still blitted");
  });

  t("the HUD and mini-map stay at screen scale", function () {
    const env = boot("zt_room"); const MQ = env.MQ, O = MQ.Overworld;
    setView(MQ, 960, 600);
    O.toggleMinimap ? O.toggleMinimap(true) : null;
    const ctx = MQ.View.ctx || env.screen.getContext("2d");
    // the HUD is drawn after the transform is restored: equal numbers of both
    let saves = 0, restores = 0;
    const rs = ctx.save, rr = ctx.restore;
    ctx.save = function () { saves++; return rs.apply(ctx, arguments); };
    ctx.restore = function () { restores++; return rr.apply(ctx, arguments); };
    O.draw(ctx);
    ctx.save = rs; ctx.restore = rr;
    assert.strictEqual(saves, restores, "every save() was restored (" + saves + "/" + restores + ")");
  });
};
