"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ, S = MQ.Save;
  t("save round-trip through providers", function () {
    let state = { hp: 10, name: "Bez" };
    S.register("testsys", { save: function () { return MQ.U.deepClone(state); }, load: function (o) { state = o ? o : { hp: 0, name: "" }; } });
    MQ.Flags.reset(); MQ.Flags.set("badge_1"); MQ.Flags.set("steps", 42);
    MQ.Clock.setTime(21, 30);
    assert.strictEqual(S.write(1), true);
    // mutate
    state.hp = 1; MQ.Flags.reset(); MQ.Clock.setTime(9, 0);
    assert.strictEqual(S.load(1), true);
    assert.strictEqual(state.hp, 10);
    assert.strictEqual(state.name, "Bez");
    assert.strictEqual(MQ.Flags.get("steps"), 42);
    assert.strictEqual(MQ.Flags.get("badge_1"), true);
    assert.strictEqual(MQ.Clock.minutes, 21 * 60 + 30);
    assert.strictEqual(MQ.Clock.phase, "night");
    const env1 = S.read(1);
    assert.strictEqual(env1.version, 2);
    assert.ok(env1.ts > 0);
    assert.ok(env1.summary);
  });
  t("slots() lists 3 slots + autosave", function () {
    const list = S.slots();
    assert.strictEqual(list.length, 4);
    assert.strictEqual(list[0].slot, 1); assert.strictEqual(list[0].empty, false);
    assert.strictEqual(list[1].empty, true);
    assert.strictEqual(list[3].slot, "auto");
    S.autosave();
    assert.strictEqual(S.slots()[3].empty, false);
  });
  t("legacy version is rejected, never crashes", function () {
    env.window.localStorage.setItem(S.key(2), JSON.stringify({ version: 1, data: { flags: { x: 1 } } }));
    const e = S.read(2);
    assert.strictEqual(e.legacy, true);
    assert.strictEqual(S.isLoadable(e), false);
    assert.strictEqual(S.load(2), false);
    env.window.localStorage.setItem(S.key(3), "{not json");
    const c = S.read(3);
    assert.strictEqual(c.corrupt, true);
    assert.strictEqual(S.load(3), false);
    assert.strictEqual(S.slots()[1].legacy, true);
    assert.strictEqual(S.slots()[2].corrupt, true);
  });
  t("erase and newGame", function () {
    S.erase(1); assert.strictEqual(S.read(1), null);
    MQ.Flags.set("zz"); S.newGame(); assert.strictEqual(MQ.Flags.get("zz"), undefined);
  });
  t("the summary reports the real chapter, never 0", function () {
    MQ.Flags.reset();
    // nothing started yet: a save still belongs to Chapter 1, not Chapter 0
    assert.strictEqual(S.snapshot().summary.chapter, 1, "cold summary is Ch.1");
    // MQ.Story is the authority once the game is running
    const realStory = MQ.Story;
    MQ.Story = { chapter: function () { return 4; } };
    assert.strictEqual(S.snapshot().summary.chapter, 4, "reads MQ.Story.chapter()");
    // …and without a Story module it falls back to the flag
    MQ.Story = undefined;
    MQ.Flags.chapter = 3;
    assert.strictEqual(S.snapshot().summary.chapter, 3, "falls back to MQ.Flags.chapter");
    // a written card carries it too
    assert.strictEqual(S.write(1), true);
    assert.strictEqual(S.read(1).summary.chapter, 3, "the slot card remembers it");
    MQ.Story = realStory;
    MQ.Flags.reset();
    S.erase(1);
  });

  t("boot registers *.saveProvider systems", function () {
    MQ.Fake = { saveProvider: { save: function () { return 1; }, load: function () {} } };
    MQ.Boot.registerProviders();
    assert.ok(S.providers.fake);
  });
};
