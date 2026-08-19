// MQ.BattleScene: it must consume the whole event log, draw every
// frame without throwing, expose tap targets, and resolve the
// promise MQ.Battle.start hands back.
"use strict";
const F = require("./test-battle-fixtures");

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ;

  function boot() {
    MQ.View.init(env.screen);
    MQ.View.resize();
    MQ.Scenes.clear && MQ.Scenes.clear();
    MQ.Scenes.flush();
  }

  // Step the loop, render, and answer any menu the scene puts up.
  function play(scene, engine, steps, chooser) {
    for (let i = 0; i < (steps || 1200); i++) {
      MQ.Loop.step(16.667);
      MQ.Loop.render();
      if (scene.finished) break;
      if (scene.mode === "menu" || scene.mode === "party" || scene.mode === "move" ||
        scene.mode === "bag" || scene.mode === "agents") {
        chooser(scene, i);
      }
    }
  }

  t("the scene renders every mode of a full battle without throwing", function () {
    boot();
    const me = F.mon(MQ, "t_fire", 30, ["t_ember", "t_tackle", "t_growl", "t_protect"]);
    const spare = F.mon(MQ, "t_water", 30, ["t_water_gun"]);
    const foe1 = F.mon(MQ, "t_grass", 26, ["t_vine"]);
    const foe2 = F.mon(MQ, "t_norm", 26, ["t_tackle"]);
    const engine = MQ.Battle.create({
      kind: "trainer", seed: 314, playerParty: [me, spare], enemyParty: [foe1, foe2],
      trainer: { id: "tr_scene", name: "Scene Test", cls: "Walker", ai: "greedy", payout: 300, intro: ["Right then."] }
    });
    const scene = MQ.BattleScene;
    let resolved = null;
    MQ.Scenes.pushP(scene, { engine: engine }).then(function (r) { resolved = r; });
    MQ.Scenes.flush();
    scene.enter({ engine: engine });

    let visitedMove = false, visitedParty = false, visitedBag = false;
    play(scene, engine, 3000, function (S, i) {
      if (S.mode === "menu") {
        // Take a turn through each sub-menu at least once.
        if (!visitedParty && i > 60) { S.mode = "party"; S.partyIndex = 0; visitedParty = true; S.draw(MQ.View.ctx || env.screen.getContext("2d")); S.mode = "menu"; }
        if (!visitedBag && i > 90) { S.mode = "bag"; S.bagIndex = 0; visitedBag = true; S.draw(MQ.View.ctx || env.screen.getContext("2d")); S.bagTab = 1; S.draw(MQ.View.ctx || env.screen.getContext("2d")); S.mode = "menu"; }
        S.pickMain({ id: "fight" });
      } else if (S.mode === "move") {
        visitedMove = true;
        S.draw(MQ.View.ctx || env.screen.getContext("2d"));
        const o = S.options;
        let idx = 0;
        for (let k = 0; k < o.moves.length; k++) if (!o.moves[k].disabled) { idx = o.moves[k].index; break; }
        S.commit({ type: "move", index: idx });
      } else if (S.mode === "party") {
        const o = S.options;
        let pick = 0;
        for (let k = 0; k < o.switches.length; k++) if (o.switches[k].ok) { pick = k; break; }
        if (S.forcedSwitch) { S.forcedSwitch = false; S.mode = "play"; engine.choose(o.switches[pick].index); }
        else S.mode = "menu";
      } else S.mode = "menu";
    });

    assert.ok(visitedMove, "the move menu was used");
    assert.ok(visitedParty, "the party screen drew");
    assert.ok(visitedBag, "the bag drew");
    assert.ok(engine.done, "the engine finished");
    assert.ok(scene.finished, "the scene tidied up");
    assert.strictEqual(engine.result.outcome, "win");
    assert.strictEqual(scene.queue.length, 0, "every event was consumed");
  });

  t("the scene registers tap targets for the main menu", function () {
    boot();
    const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 30, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 5, playerParty: [me], enemyParty: [foe], rules: { canRun: true, canCatch: true } });
    const scene = MQ.BattleScene;
    scene.enter({ engine: engine });
    for (let i = 0; i < 400 && scene.mode !== "menu"; i++) { scene.update(16.667); }
    assert.strictEqual(scene.mode, "menu", "the menu came up");
    const ctx = env.screen.getContext("2d");
    scene.draw(ctx);
    const items = scene.mainItems();
    assert.ok(items.length >= 4, "FIGHT / BAG / PARTY / RUN at minimum");
    assert.strictEqual(items[0].id, "fight");
    assert.ok(items.some(function (x) { return x.id === "run"; }));
    assert.ok(ctx.calls.length > 20, "the frame actually drew something (" + ctx.calls.length + " calls)");
  });

  t("OVERDRIVE and AGENTS appear in the menu only when they are available", function () {
    boot();
    MQ.Flags.set("overdrive_unlocked", true);
    MQ.Flags.set("agent_sleet", true);
    const me = F.mon(MQ, "t_cat", 30, ["t_tackle"]);
    const foe = F.mon(MQ, "t_grass", 30, ["t_vine"]);
    const engine = MQ.Battle.create({ kind: "wild", seed: 6, playerParty: [me], enemyParty: [foe] });
    const scene = MQ.BattleScene;
    scene.enter({ engine: engine });
    for (let i = 0; i < 400 && scene.mode !== "menu"; i++) scene.update(16.667);
    let ids = scene.mainItems().map(function (x) { return x.id; });
    assert.ok(ids.indexOf("agents") >= 0, "AGENTS shows once SLEET exists");
    assert.ok(ids.indexOf("overdrive") < 0, "OVERDRIVE stays hidden at 0 meter");

    me.overdrive = 100;
    scene.options = engine.options();
    ids = scene.mainItems().map(function (x) { return x.id; });
    assert.ok(ids.indexOf("overdrive") >= 0, "and lights up at 100");
    scene.mode = "agents";
    scene.draw(env.screen.getContext("2d"));
    assert.ok(true);
  });

  t("the capture animation and the timing minigame draw", function () {
    boot();
    MQ.Settings = MQ.Settings || {};
    MQ.Settings.captureMode = "timing";
    const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 8, ["t_vine"]);
    foe.hp = 1;
    const engine = MQ.Battle.create({ kind: "wild", seed: 7, playerParty: [me], enemyParty: [foe], rules: { canCatch: true } });
    const scene = MQ.BattleScene;
    scene.enter({ engine: engine });
    for (let i = 0; i < 400 && scene.mode !== "menu"; i++) scene.update(16.667);
    scene.startTiming("capsule_root");
    assert.strictEqual(scene.mode, "timing");
    const ctx = env.screen.getContext("2d");
    scene.draw(ctx);
    // let the ring run out; it commits with a x1 multiplier
    for (let i = 0; i < 120 && scene.mode === "timing"; i++) scene.update(16.667);
    assert.notStrictEqual(scene.mode, "timing", "the ring resolved");
    for (let i = 0; i < 600 && !scene.finished; i++) { scene.update(16.667); scene.draw(ctx); }
    assert.strictEqual(engine.result.outcome, "catch");
    MQ.Settings.captureMode = "auto";
  });

  t("the scene survives a boss battle with phases, weather and Overdrive", function () {
    boot();
    MQ.Flags.set("overdrive_unlocked", true);
    const me = F.mon(MQ, "t_fire", 50, ["t_ember", "t_tackle"]);
    const boss = F.mon(MQ, "t_iron", 45, ["t_tackle"]);
    const engine = MQ.Battle.create({
      kind: "boss", seed: 8, playerParty: [me], enemyParty: [boss],
      trainer: {
        id: "boss_scene", name: "GLITCHRA", ai: "smart", payout: 1000,
        boss: {
          overdriveStart: 50, arenaWeather: "fog",
          phases: [
            { hpFrac: 0.66, events: [{ say: "It smiled with somebody else's mouth." }, { setTerrain: "silk", turns: 5 }] },
            { hpFrac: 0.33, events: [{ say: "The grin remained." }, { changeForm: { speciesId: "t_fire2", keepHp: true } }, { boostSelf: { spa: 2 } }] }
          ]
        }
      }
    });
    const scene = MQ.BattleScene;
    scene.enter({ engine: engine });
    const ctx = env.screen.getContext("2d");
    for (let i = 0; i < 12000 && !scene.finished; i++) {
      scene.update(16.667);
      scene.draw(ctx);
      if (scene.mode === "menu") {
        const o = scene.options;
        let idx = -1;
        for (let k = 0; k < o.moves.length; k++) if (!o.moves[k].disabled) { idx = o.moves[k].index; break; }
        scene.commit(idx >= 0 ? { type: "move", index: idx } : { type: "struggle" });
      }
      else if (scene.mode === "party" && scene.forcedSwitch) { scene.forcedSwitch = false; scene.mode = "play"; engine.choose(0); }
    }
    assert.ok(engine.done, "the boss fight finished");
    assert.ok(engine.b.log.filter(function (x) { return x.type === "phase"; }).length >= 1, "at least one phase fired");
  });
};
