// MonsterQuest v2 — the dialogue box should not stand on the player.
// The box owns the bottom ~150px of the view, which during a scripted scene
// is exactly where the player tends to be. MQ.Dialog now picks top or bottom
// from where the player actually is on screen when the box opens.
"use strict";
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init();
  MQ.Input.init();
  MQ.Dialog.auto = false;
  MQ.DEV = false;
  fixtures(MQ);
  MQ.Scenes.push(MQ.Overworld, { map: "dp_field" });
  MQ.Scenes.flush();
  return env;
}

function fixtures(MQ) {
  const W = MQ.World;
  if (W.has("dp_field")) return;
  const rows = [];
  for (let y = 0; y < 30; y++) {
    let r = "";
    for (let x = 0; x < 40; x++) r += (x === 0 || y === 0 || x === 39 || y === 29) ? "T" : ".";
    rows.push(r);
  }
  W.defineMap("dp_field", {
    name: "Dialogue Field", region: "east", outdoor: true,
    legend: { ".": "grass", "T": "tree_oak" },
    layers: { ground: rows },
    spawnPoint: { x: 20, y: 15 }
  });
}

// Open a box over whatever scene is on top and hand back its scene object.
function open(MQ, opts) {
  const sc = MQ.Dialog.makeScene("Now then.", opts || {}, function () { });
  MQ.Scenes.push(sc);
  MQ.Scenes.flush();
  return sc;
}
function close(MQ) { MQ.Scenes.pop(); MQ.Scenes.flush(); }

module.exports = function (t, assert) {

  t("the box stays at the bottom when the player is up the screen", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 600;
    return O.warp("dp_field", 20, 15, "down", { fade: false }).then(function () {
      const y = O.toScreen(O.player.px, O.player.py).y;
      assert.ok(y < 400, "player is mid-screen, y=" + y);
      const sc = open(MQ);
      assert.strictEqual(sc.position, "bottom");
      assert.ok(sc.box.y > 300, "…and the box is down there, y=" + sc.box.y);
      close(MQ);
    });
  });

  t("the box moves to the top when the player is behind it", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 600;
    // near the bottom edge, where the camera has stopped scrolling
    return O.warp("dp_field", 20, 28, "down", { fade: false }).then(function () {
      const y = O.toScreen(O.player.px, O.player.py).y;
      assert.ok(y > 448, "player stands where the box goes, y=" + y);
      const sc = open(MQ);
      assert.strictEqual(sc.position, "top");
      assert.ok(sc.box.y < 200, "box is up top, y=" + sc.box.y);
      assert.ok(sc.box.y + sc.box.h < y - 40, "and clear of the player");
      close(MQ);
    });
  });

  t("a name tag at the top still fits on screen", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 600;
    return O.warp("dp_field", 20, 28, "down", { fade: false }).then(function () {
      const sc = open(MQ, { name: "DR. ALDER" });
      assert.strictEqual(sc.position, "top");
      assert.ok(sc.box.y - 34 >= MQ.View.safe.top, "the tag above the box is on screen, y=" + (sc.box.y - 34));
      close(MQ);
    });
  });

  t("an explicit position is always obeyed", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 600;
    return O.warp("dp_field", 20, 28, "down", { fade: false }).then(function () {
      const a = open(MQ, { position: "bottom" });
      assert.strictEqual(a.position, "bottom", "asked for bottom, got bottom");
      close(MQ);
      return O.warp("dp_field", 20, 15, "down", { fade: false });
    }).then(function () {
      const b = open(MQ, { position: "top" });
      assert.strictEqual(b.position, "top", "asked for top, got top");
      close(MQ);
    });
  });

  t("the speaker's tile can be named instead of the player", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 600;
    return O.warp("dp_field", 20, 15, "down", { fade: false }).then(function () {
      // the player is clear, but the person talking is not
      const sc = open(MQ, { at: { x: 20, y: 24 } });
      const y = O.tileToScreen(20, 24).y;
      assert.ok(y > 448, "speaker is behind the box, y=" + y);
      assert.strictEqual(sc.position, "top");
      close(MQ);
    });
  });

  t("with nowhere better to go it stays at the bottom", function () {
    const env = boot(); const MQ = env.MQ, O = MQ.Overworld;
    MQ.View.w = 960; MQ.View.h = 240;          // a letterboxed sliver
    return O.warp("dp_field", 20, 28, "down", { fade: false }).then(function () {
      const sc = open(MQ);
      assert.strictEqual(sc.position, "bottom", "moving up would hide them too");
      close(MQ);
    });
  });

  t("a box over a menu or a battle is left alone", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.View.w = 960; MQ.View.h = 600;
    const menu = { id: "dp_menu", update: function () { }, draw: function () { } };
    MQ.Scenes.push(menu); MQ.Scenes.flush();
    const sc = open(MQ);
    assert.strictEqual(sc.position, "bottom", "no world position to protect");
    close(MQ);
    MQ.Scenes.pop(); MQ.Scenes.flush();
  });
};
