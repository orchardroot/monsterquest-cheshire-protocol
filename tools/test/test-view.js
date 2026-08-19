"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const V = env.MQ.View;
  t("compute(): fills screen, S = min(W/960,H/540), logical >= 960x540, dpr capped at 2", function () {
    let c = V.compute(1920, 1080, 1);
    assert.strictEqual(c.S, 2); assert.strictEqual(c.w, 960); assert.strictEqual(c.h, 540); assert.strictEqual(c.cw, 1920);
    c = V.compute(1280, 720, 3);
    assert.strictEqual(c.dpr, 2); assert.strictEqual(c.cw, 2560); assert.strictEqual(c.ch, 1440); assert.strictEqual(c.w, 960);
    c = V.compute(2000, 1000, 1);        // wider than 16:9 → extra logical width, no letterbox
    assert.ok(Math.abs(c.S - 1000 / 540) < 1e-9); assert.ok(Math.abs(c.w - 2000 / (1000 / 540)) < 1e-9); assert.strictEqual(c.h, 540); assert.ok(c.w > 960);
    c = V.compute(800, 1200, 1);         // portrait → S = 800/960, extra logical height
    assert.ok(Math.abs(c.S - 800 / 960) < 1e-9); assert.strictEqual(c.w, 960); assert.ok(c.h > 540);
    c = V.compute(400, 300, 0.5);
    assert.strictEqual(c.dpr, 1);
  });
  t("init/resize applies canvas backing size, transform and emits resize", function () {
    let got = null;
    env.MQ.Events.on("resize", function (d) { got = d; });
    V.init();
    assert.strictEqual(V.W, 1280); assert.strictEqual(V.H, 720);
    assert.strictEqual(V.canvas.width, 1280); assert.strictEqual(V.canvas.height, 720);
    assert.ok(Math.abs(V.w - 960) < 1e-9); assert.ok(Math.abs(V.h - 540) < 1e-9);
    assert.ok(got && Math.abs(got.w - 960) < 1e-9);
    env.window.innerWidth = 1000; env.window.innerHeight = 800; env.window.devicePixelRatio = 2;
    V.resize();
    assert.strictEqual(V.canvas.width, 2000); assert.strictEqual(V.canvas.height, 1600);
    assert.ok(Math.abs(V.S - 1000 / 960) < 1e-9);
    assert.ok(V.h > 540 && Math.abs(V.w - 960) < 1e-9);
    const p = V.toLogical(500, 400);
    assert.ok(Math.abs(p.x - 480) < 1e-9);
    assert.strictEqual(V.ctx.imageSmoothingEnabled, false);
  });
};
