"use strict";
// ui-b: every information screen pushes, updates, draws and pops cleanly,
// at both landscape and portrait shapes, with and without the content team.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
  return env;
}
function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}

module.exports = function (t, assert) {

  t("ui-b publishes every screen the pause hub looks for", function () {
    const UI = boot().MQ.UI;
    const names = ["Dex", "DexEntry", "DexFilter", "DexMilestones", "Casebook", "WorldMap", "Map", "WorldMapLegend", "TrainerCard", "Trainer", "Perks", "Badges", "HUD"];
    for (let i = 0; i < names.length; i++) assert.ok(UI[names[i]], "MQ.UI." + names[i] + " exists");
    const scenes = ["Dex", "DexEntry", "DexFilter", "DexMilestones", "Casebook", "WorldMap", "TrainerCard", "Perks"];
    for (let i = 0; i < scenes.length; i++) {
      assert.strictEqual(typeof UI[scenes[i]].open, "function", scenes[i] + ".open");
      assert.strictEqual(typeof UI[scenes[i]].update, "function", scenes[i] + ".update");
      assert.strictEqual(typeof UI[scenes[i]].draw, "function", scenes[i] + ".draw");
      assert.ok(UI[scenes[i]].id, scenes[i] + ".id");
    }
  });

  t("the pause hub can reach all five of our tabs", function () {
    const env = boot();
    const MQ = env.MQ;
    const wanted = { dex: "Dex", casebook: "Casebook", map: "WorldMap", trainer: "TrainerCard", perks: "Perks" };
    const ids = Object.keys(wanted);
    MQ.Scenes.push(MQ.UI.Pause); MQ.Scenes.flush(); env.step(1);
    for (let i = 0; i < MQ.UI.Pause.items.length; i++) {
      const it = MQ.UI.Pause.items[i];
      if (ids.indexOf(it.value) < 0) continue;
      assert.strictEqual(it.disabled, false, it.value + " tab is fitted");
    }
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("every screen pushes, draws and pops without throwing", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.see("silkin", { map: "macclesfield", habitat: "silk" });
    MQ.Trainer.record("flitchick", { map: "macclesfield", level: 4 });
    const cases = [
      [MQ.UI.Dex, {}],
      [MQ.UI.DexEntry, { list: ["silkin", "flitchick", "loomoth"], index: 0 }],
      [MQ.UI.DexFilter, {}],
      [MQ.UI.DexMilestones, {}],
      [MQ.UI.Casebook, {}],
      [MQ.UI.WorldMap, {}],
      [MQ.UI.WorldMapLegend, {}],
      [MQ.UI.TrainerCard, {}],
      [MQ.UI.Perks, {}]
    ];
    for (let i = 0; i < cases.length; i++) {
      MQ.Scenes.push(cases[i][0], cases[i][1]); MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.top(), cases[i][0], cases[i][0].id + " on top");
      env.step(2); env.render();
      MQ.Scenes.pop(null); MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.depth(), 0, cases[i][0].id + " popped clean");
    }
  });

  t("B backs out of each screen", function () {
    const env = boot();
    const MQ = env.MQ;
    const scenes = [MQ.UI.Dex, MQ.UI.Casebook, MQ.UI.WorldMap, MQ.UI.TrainerCard, MQ.UI.Perks, MQ.UI.DexMilestones];
    for (let i = 0; i < scenes.length; i++) {
      MQ.Scenes.push(scenes[i], {}); MQ.Scenes.flush(); env.step(1);
      press(env, "b"); MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.depth(), 0, scenes[i].id + " closed on B");
    }
  });

  t("every screen redraws at a portrait shape without falling over", function () {
    const env = boot();
    const MQ = env.MQ;
    env.window.innerWidth = 420; env.window.innerHeight = 900;
    MQ.View.resize();
    const scenes = [MQ.UI.Dex, MQ.UI.Casebook, MQ.UI.WorldMap, MQ.UI.TrainerCard, MQ.UI.Perks];
    for (let i = 0; i < scenes.length; i++) {
      MQ.Scenes.push(scenes[i], {}); MQ.Scenes.flush();
      env.step(2); env.render();
      MQ.Scenes.pop(null); MQ.Scenes.flush();
    }
    assert.ok(MQ.View.w >= 960 || MQ.View.h >= 540, "the view stayed inside the contract");
  });

  t("the screens survive the content team being absent", function () {
    const env = boot();
    const MQ = env.MQ;
    const keep = { Trainer: MQ.Trainer, Quests: MQ.Quests, Achievements: MQ.Achievements, Cats: MQ.Cats, Progression: MQ.Progression, Party: MQ.Party, Inventory: MQ.Inventory };
    MQ.Trainer = null; MQ.Quests = null; MQ.Achievements = null; MQ.Cats = null; MQ.Progression = null; MQ.Party = null; MQ.Inventory = null;
    const scenes = [MQ.UI.Dex, MQ.UI.Casebook, MQ.UI.WorldMap, MQ.UI.TrainerCard, MQ.UI.Perks];
    for (let i = 0; i < scenes.length; i++) {
      MQ.Scenes.push(scenes[i], {}); MQ.Scenes.flush();
      env.step(2); env.render();
      MQ.Scenes.pop(null); MQ.Scenes.flush();
    }
    const ks = Object.keys(keep);
    for (let i = 0; i < ks.length; i++) MQ[ks[i]] = keep[ks[i]];
    assert.ok(true, "nothing threw");
  });
};
