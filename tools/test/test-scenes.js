"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, Sc = MQ.Scenes;
  MQ.View.init(); MQ.Input.init();
  function mk(id, opts) {
    const s = { id: id, log: [], enter: function (p) { s.log.push("enter:" + JSON.stringify(p || null)); }, exit: function () { s.log.push("exit"); }, update: function () { s.log.push("u"); }, draw: function () { s.log.push("d"); }, resume: function (r) { s.log.push("resume:" + r); } };
    Object.assign(s, opts || {});
    return s;
  }
  t("push/pop deferred to flush; enter/exit/resume called", function () {
    const a = mk("a"), b = mk("b");
    Sc.push(a, { x: 1 });
    assert.strictEqual(Sc.depth(), 0);
    Sc.flush();
    assert.strictEqual(Sc.top(), a);
    assert.deepStrictEqual(a.log, ['enter:{"x":1}']);
    Sc.push(b); Sc.flush();
    assert.strictEqual(Sc.top(), b); assert.ok(Sc.has("a"));
    Sc.update(16);
    assert.strictEqual(a.log.indexOf("u"), -1);       // only top updates
    assert.ok(b.log.indexOf("u") >= 0);
    Sc.pop("res"); Sc.flush();
    assert.strictEqual(Sc.top(), a);
    assert.ok(b.log.indexOf("exit") >= 0);
    assert.ok(a.log.indexOf("resume:res") >= 0);
    Sc.pop(); Sc.flush(); assert.strictEqual(Sc.depth(), 0);
  });
  t("transparent scenes draw bottom-up; updateBelow", function () {
    const a = mk("a"), b = mk("b", { transparent: true, updateBelow: true });
    Sc.push(a); Sc.push(b); Sc.flush();
    a.log.length = 0; b.log.length = 0;
    Sc.draw(env.screen.getContext("2d"));
    assert.deepStrictEqual(a.log, ["d"]); assert.deepStrictEqual(b.log, ["d"]);
    Sc.update(16);
    assert.ok(a.log.indexOf("u") >= 0);
    Sc.clear(); Sc.flush(); assert.strictEqual(Sc.depth(), 0);
  });
  t("pushP resolves with pop result; replace", function () {
    const a = mk("a"), b = mk("b");
    const p = Sc.pushP(a);
    Sc.flush();
    Sc.replace(b); Sc.flush();
    assert.strictEqual(Sc.top(), b); assert.strictEqual(Sc.depth(), 1);
    Sc.pop(); Sc.flush();
    return p.then(function (v) { assert.strictEqual(v, undefined); });
  });
  t("transition resolves at midpoint and completes", function () {
    let mid = false;
    const p = Sc.transition("fade", 200).then(function () { mid = true; });
    Sc.update(100);
    return new Promise(function (r) { setImmediate(r); }).then(function () {
      assert.strictEqual(mid, true);
      assert.strictEqual(Sc.overlay.alpha, 1);
      Sc.update(100); Sc.update(1);
      assert.strictEqual(Sc.overlay.phase, "idle");
      return p;
    });
  });
};
