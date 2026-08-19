"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true;
  function drive(p, maxSteps) {
    // step the loop until the promise settles
    let done = false, val, err;
    p.then(function (v) { done = true; val = v; }, function (e) { done = true; err = e; });
    let n = 0;
    return new Promise(function (resolve, reject) {
      (function loop() {
        if (done) { if (err) reject(err); else resolve(val); return; }
        if (n++ > (maxSteps || 2000)) { reject(new Error("script did not finish in " + n + " steps")); return; }
        env.step(1);
        setImmediate(loop);
      })();
    });
  }
  t("generator script: say/wait/setFlag runs to completion", function () {
    const log = [];
    const gen = function* (ctx) {
      const S = ctx.S;
      log.push("start");
      yield S.say(["Hello there.", "Second page that is quite long and will need to wrap across the dialogue box width nicely."], { name: "Tester" });
      log.push("said");
      yield S.wait(100);
      log.push("waited");
      yield S.setFlag("met_tester");
      yield S.addFlag("counter", 2);
      const ans = yield S.ask("Pick one", [{ label: "A", value: "aa" }, { label: "B", value: "bb" }]);
      log.push("ans:" + ans);
      const r = yield S.battle({ kind: "wild" });
      log.push("battle:" + r.won);
      yield S.giveItem("potion", 2);
      yield S.parallel([S.wait(50), S.wait(20)]);
      const sub = yield S.call(function* () { yield S.wait(10); return 99; });
      log.push("sub:" + sub);
      yield S.move("player", ["up", "up"]);
      yield S.fadeOut(50);
      yield S.fadeIn(50);
      yield S.quest.start("demo");
      yield S.quest.advance("demo");
      return "fin";
    };
    const p = MQ.Script.run(gen, {});
    assert.strictEqual(MQ.Script.busy(), true);
    return drive(p).then(function (v) {
      assert.strictEqual(v, "fin");
      assert.deepStrictEqual(log, ["start", "said", "waited", "ans:aa", "battle:true", "sub:99"]);
      assert.strictEqual(MQ.Flags.get("met_tester"), true);
      assert.strictEqual(MQ.Flags.get("counter"), 2);
      assert.strictEqual(MQ.Flags.test("item.potion == 2"), true);
      assert.strictEqual(MQ.Flags.test("quest.demo == 1"), true);
      assert.strictEqual(MQ.Script.busy(), false);
      assert.strictEqual(MQ.Scenes.depth(), 0);
    });
  });
  t("script errors reject and clear cutscene state", function () {
    const gen = function* () { yield MQ.Script.cmds.wait(10); throw new Error("boom"); };
    return drive(MQ.Script.run(gen)).then(function () { throw new Error("should reject"); }, function (e) {
      assert.strictEqual(e.message, "boom");
      assert.strictEqual(MQ.Script.busy(), false);
    });
  });
  t("dialog choices resolve via input (non-auto)", function () {
    MQ.Dialog.auto = false;
    MQ.Dialog.CPS = 100000;
    const p = MQ.Dialog.ask("Yes or no?", [{ label: "Yes", value: true }, { label: "No", value: false }]);
    env.step(2);                       // push + reveal
    assert.strictEqual(MQ.Scenes.top().id, "dialog");
    env.key("KeyZ"); env.step(1); env.key("KeyZ", false); env.step(1);   // advance → choices
    env.key("ArrowDown"); env.step(1); env.key("ArrowDown", false); env.step(1);
    env.key("KeyZ"); env.step(1); env.key("KeyZ", false);
    return drive(p).then(function (v) { assert.strictEqual(v, false); MQ.Dialog.auto = true; });
  });
};
