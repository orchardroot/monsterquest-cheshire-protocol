"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, I = MQ.Input;
  MQ.View.init(); MQ.Input.init();
  t("keyboard synthesises 8-way unit axis; edges last one step", function () {
    env.key("ArrowRight"); I.update();
    let ax = I.axis();
    assert.strictEqual(ax.x, 1); assert.strictEqual(ax.y, 0); assert.strictEqual(ax.mag, 1);
    assert.strictEqual(I.pressed("right"), true); assert.strictEqual(I.held("right"), true);
    I.update();
    assert.strictEqual(I.pressed("right"), false); assert.strictEqual(I.held("right"), true);
    env.key("ArrowUp"); I.update();
    ax = I.axis();
    assert.ok(Math.abs(ax.x - 0.7071) < 0.001); assert.ok(Math.abs(ax.y + 0.7071) < 0.001); assert.ok(Math.abs(ax.mag - 1) < 0.001);
    env.key("ArrowRight", false); env.key("ArrowUp", false); I.update();
    assert.strictEqual(I.axis().mag, 0);
  });
  t("WASD, action keys, run, inject, tap-latch", function () {
    env.key("KeyA"); env.key("KeyZ"); env.key("ShiftLeft"); I.update();
    assert.strictEqual(I.axis().x, -1); assert.strictEqual(I.pressed("a"), true); assert.strictEqual(I.held("run"), true);
    env.key("KeyA", false); env.key("KeyZ", false); env.key("ShiftLeft", false); I.update();
    // press+release between updates still registers one edge
    env.key("KeyX"); env.key("KeyX", false); I.update();
    assert.strictEqual(I.pressed("b"), true);
    I.update(); assert.strictEqual(I.pressed("b"), false);
    I.inject("start"); I.update(); assert.strictEqual(I.pressed("start"), true);
    I.consume("start"); assert.strictEqual(I.pressed("start"), false);
    assert.strictEqual(I.lastSource, "key");
  });
  t("touch stick: dynamic origin, dead zone, radius, pointerId tracking", function () {
    const c = env.screen;
    I.setTouchVisible(true);
    // View: 1280x720 → S = min(1280/960, 720/540) = 1.333; logical = 960x540
    c.dispatch("pointerdown", { pointerId: 7, pointerType: "touch", clientX: 200, clientY: 400, preventDefault: function () {} });
    assert.strictEqual(I.stick.active, true); assert.strictEqual(I.stick.id, 7);
    c.dispatch("pointermove", { pointerId: 7, clientX: 200 + 10 * (4 / 3), clientY: 400 });   // 10 logical px < dead zone (0.18*60=10.8)
    I.update(); assert.strictEqual(I.axis().mag, 0);
    c.dispatch("pointermove", { pointerId: 7, clientX: 200 + 60 * (4 / 3), clientY: 400 });   // full radius
    I.update();
    assert.ok(Math.abs(I.axis().x - 1) < 0.01); assert.strictEqual(I.held("right"), true); assert.strictEqual(I.held("run"), true);
    c.dispatch("pointermove", { pointerId: 7, clientX: 200 + 30 * (4 / 3), clientY: 400 });   // half → (0.5-0.18)/(0.82)
    I.update();
    assert.ok(Math.abs(I.axis().x - (0.5 - 0.18) / 0.82) < 0.01);
    // a second pointer on the A button
    const A = I.buttons[0];
    c.dispatch("pointerdown", { pointerId: 8, pointerType: "touch", clientX: A.x * (4 / 3), clientY: A.y * (4 / 3), preventDefault: function () {} });
    I.update();
    assert.strictEqual(I.pressed("a"), true); assert.ok(I.axis().x > 0);   // stick unaffected
    c.dispatch("pointerup", { pointerId: 8 }); I.update(); assert.strictEqual(I.held("a"), false);
    c.dispatch("pointerup", { pointerId: 7 }); I.update();
    assert.strictEqual(I.stick.active, false); assert.strictEqual(I.axis().mag, 0);
    assert.strictEqual(I.lastSource, "touch"); assert.strictEqual(I.touchVisible, true);
  });
  t("tapAt reports a quick tap in logical coords for one frame", function () {
    const c = env.screen;
    c.dispatch("pointerdown", { pointerId: 9, pointerType: "mouse", clientX: 640, clientY: 360, preventDefault: function () {} });
    c.dispatch("pointerup", { pointerId: 9 });
    I.update();
    const tp = I.tapAt();
    assert.ok(tp); assert.ok(Math.abs(tp.x - 480) < 0.01); assert.ok(Math.abs(tp.y - 270) < 0.01);
    I.update(); assert.strictEqual(I.tapAt(), null);
  });
  t("gamepad polling: stick + buttons", function () {
    const pad = { connected: true, index: 0, buttons: [], axes: [0.9, 0] };
    for (let i = 0; i < 16; i++) pad.buttons.push({ pressed: false, value: 0 });
    pad.buttons[0].pressed = true;
    env.window.navigator.getGamepads = function () { return [pad]; };
    I.update();
    assert.strictEqual(I.pressed("a"), true); assert.ok(I.axis().x > 0.8); assert.strictEqual(I.lastSource, "pad");
    env.window.navigator.getGamepads = function () { return []; };
    I.update();
  });
};
