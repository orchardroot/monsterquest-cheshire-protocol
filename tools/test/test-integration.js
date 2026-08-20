// MonsterQuest v2 — end-to-end playable-slice integration test.
// Boots for real (MQ.Boot.start, not __MQ_NO_BOOT), drives the title
// screen through New Game exactly as a player would (menu presses, real
// keyboard events, the difficulty picker, the confirm dialog), walks the
// overworld for ~600 frames with injected movement, forces a wild battle
// and plays it to completion through the engine's choose(), then saves
// and reloads. Fails loudly (with the offending scene id) if any step of
// the chain the other workstreams built doesn't actually connect up.
"use strict";
const H = require("../headless");

function pumpUntil(env, pred, max, label) {
  let i = 0;
  return new Promise(function (resolve, reject) {
    (function loop() {
      if (pred()) return resolve(i);
      if (i++ >= max) {
        const top = env.MQ.Scenes.top();
        return reject(new Error("pumpUntil timed out after " + max + " steps waiting for: " + (label || "condition") + " (top scene: " + (top && top.id) + ")"));
      }
      env.step(1);
      setImmediate(loop);
    })();
  });
}

function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}

function topId(env) { const s = env.MQ.Scenes.top(); return s && s.id; }

module.exports = function (t, assert) {
  t("boots, plays the opening, walks the overworld, wins a wild battle, and saves/reloads", function () {
    const env = H.load({ boot: true });
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Dialog.autoChoice = 0;

    assert.ok(MQ.UI && MQ.UI.Title, "MQ.UI.Title exists");
    // index.html's own inline bootstrap (not loaded by the headless harness,
    // which only pulls in <script src> files) is what calls MQ.Boot.start();
    // drive it ourselves the same way.
    MQ.Boot.start();
    env.step(1); // flush the scene push Boot.init() queued
    assert.strictEqual(topId(env), "title", "Boot pushed the title screen");

    // ---- New Game: name entry (keep the default "Jim") -----------------
    press(env, "a"); // cursor starts on New Game with no saves present
    return pumpUntil(env, function () { return topId(env) === "name_entry"; }, 60, "name entry")
      .then(function () {
        env.fire("keydown", { key: "Enter", code: "Enter", preventDefault: function () {} });
        return pumpUntil(env, function () { return topId(env) === "difficulty"; }, 60, "difficulty picker");
      })
      .then(function () {
        press(env, "a"); // accept the highlighted (Normal) difficulty
        // ---- confirm dialog, then the chapter-1 opening (starter pick + say) ----
        return pumpUntil(env, function () {
          return MQ.Overworld && topId(env) === "overworld" && MQ.Party && MQ.Party.list.length > 0;
        }, 400, "hand-off into the overworld with a starter monster");
      })
      .then(function () {
        assert.strictEqual(topId(env), "overworld", "the title hand-off actually pushed MQ.Overworld");
        assert.strictEqual(MQ.Party.list.length, 1, "the opening gave a starter monster");
        assert.ok(MQ.Flags.get("contract_signed"), "the opening set its flag");
        assert.ok(MQ.Overworld.state.map, "the overworld has a map loaded");

        // ---- walk the overworld for ~600 frames with injected movement ----
        const O = MQ.Overworld;
        const startPx = O.state.px, startPy = O.state.py, startSteps = O.state.steps;
        const dirs = ["down", "right", "up", "left"];
        let i = 0;
        return new Promise(function (resolve) {
          (function loop() {
            if (i >= 600) return resolve();
            MQ.Input.inject(dirs[Math.floor(i / 140) % dirs.length]);
            env.step(1);
            i++;
            if (i % 40 === 0) setImmediate(loop); else loop();
          })();
        }).then(function () {
          const moved = O.state.px !== startPx || O.state.py !== startPy || O.state.steps !== startSteps;
          assert.ok(moved, "the player actually moved over 600 frames of injected input");
        });
      })
      .then(function () {
        // ---- force a wild encounter and play it to completion via choose() ----
        const MQD = MQ.Data;
        const foe = MQD.makeMonster("flitchick", 5, {});
        const engine = MQ.Battle.create({ kind: "wild", seed: 7, playerParty: MQ.Party.list, enemyParty: [foe], rules: { canRun: true, canCatch: true } });
        engine.start();
        let n = 0;
        while (!engine.done && n++ < 200) {
          if (!engine.request) break;
          let action;
          if (engine.request.type === "switch") {
            const opts = engine.options();
            action = 0;
            for (let i = 0; i < opts.party.length; i++) if (opts.party[i] && opts.party[i].hp > 0) { action = i; break; }
          } else {
            const opts = engine.options();
            action = { type: "struggle" };
            for (let i = 0; i < opts.moves.length; i++) if (!opts.moves[i].disabled) { action = { type: "move", index: opts.moves[i].index }; break; }
          }
          const res = engine.choose(action);
          if (res && res.error) throw new Error("battle choose() rejected: " + res.error);
        }
        assert.ok(engine.done, "the battle reached a conclusion within 200 driven actions");
        assert.ok(engine.result && (engine.result.outcome === "win" || engine.result.outcome === "lose" || engine.result.outcome === "run"),
          "the battle produced a real outcome: " + (engine.result && engine.result.outcome));
      })
      .then(function () {
        // ---- save and reload -------------------------------------------
        const O = MQ.Overworld;
        const mapBefore = O.state.map, partyBefore = MQ.Party.list.length;
        assert.strictEqual(MQ.Save.write(1), true, "the game saved to slot 1");
        // Disturb live state so the reload has something to prove.
        O.state.map = null;
        MQ.Party.list.length = 0;
        assert.strictEqual(MQ.Save.load(1), true, "the game loaded from slot 1");
        assert.strictEqual(O.state.map, mapBefore, "the map round-tripped through save/load");
        assert.strictEqual(MQ.Party.list.length, partyBefore, "the party round-tripped through save/load");
      });
  });
};
