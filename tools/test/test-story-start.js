// The title screen's hand-off must put a new game where the story starts.
// Regression: the title pushed the overworld with its own params (the default
// map) and then ran chapter one, so Mum's kitchen scene played in an empty field.
const assert = require("assert");
const H = require("../headless.js");

module.exports = function (t) {
  t("boot wires the title hand-off to the story", function () {
    const env = H.load(); const MQ = env.MQ;
    MQ.Events.emit("boot", {});
    assert.strictEqual(typeof MQ.UI.Title.onStart, "function");
  });

  t("a new game starts in Macclesfield, not wherever the title happened to be", function () {
    const env = H.load(); const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Events.emit("boot", {});
    MQ.UI.Title.onStart({ newGame: true, name: "Jim", difficulty: "normal" });
    env.step(6, 16);
    assert.strictEqual(MQ.Overworld.state.map, MQ.Story.START.map);
    assert.ok(MQ.World.get(MQ.Story.START.map), "the start map exists");
  });

  t("continue returns you to the map the save named", function () {
    const env = H.load(); const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Events.emit("boot", {});
    MQ.Overworld.state.map = "macclesfield";
    MQ.Overworld.state.px = 20 * MQ.TILE; MQ.Overworld.state.py = 20 * MQ.TILE; MQ.Overworld.state.dir = "down";
    MQ.UI.Title.onStart({ newGame: false, slot: 1 });
    env.step(6, 16);
    assert.strictEqual(MQ.Overworld.state.map, "macclesfield");
  });
};
