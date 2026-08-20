"use strict";
// content-activities: the seven minigames and Sighting mode.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
  MQ.Flags.reset();
  ["Inventory", "Trainer", "Party", "Quests", "Achievements", "Minigames", "Photo"].forEach(function (k) {
    if (MQ[k] && MQ[k].saveProvider) MQ[k].saveProvider.load(null);
  });
  return env;
}
// Push a game, drive it with `fn(frame, scene)`, return its result.
function play(env, id, opts, fn, frames) {
  const MQ = env.MQ;
  let out = null, done = false, err = null;
  MQ.Minigames.start(id, opts || {}).then(function (r) { out = r; done = true; }, function (e) { err = e; done = true; });
  let chain = Promise.resolve();
  for (let i = 0; i < (frames || 900); i++) {
    chain = chain.then(function () {
      if (done) return;
      const sc = MQ.Scenes.top();
      if (sc && sc.gameId === id && fn) fn(sc, MQ);
      return env.tick(1);
    });
  }
  return chain.then(function () {
    if (err) throw err;
    return { done: done, result: out };
  });
}

module.exports = function (t, assert) {

  t("all seven cabinets and panels are registered with names and places", function () {
    const MQ = boot().MQ;
    const want = ["arcade_packet_run", "arcade_salt_rush", "arcade_type_trainer",
      "knutsford_quiz", "lift_puzzle", "timetable_puzzle", "fruit_machine"];
    const list = MQ.Minigames.list();
    for (let i = 0; i < want.length; i++) {
      assert.ok(MQ.Minigames.has(want[i]), want[i] + " exists");
      const g = MQ.Minigames.GAMES[want[i]];
      assert.ok(g.name && g.place && g.blurb, want[i] + " reads properly");
      assert.strictEqual(typeof g.init, "function");
      assert.strictEqual(typeof g.update, "function");
      assert.strictEqual(typeof g.draw, "function");
    }
    assert.strictEqual(list.length, want.length);
  });

  t("an unknown cabinet says so rather than throwing", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.start("no_such_cabinet").then(function () { done = true; });
    let chain = Promise.resolve();
    for (let i = 0; i < 40; i++) chain = chain.then(function () { if (done) return; MQ.Input.inject("a"); return env.tick(1); });
    return chain.then(function () { assert.strictEqual(done, true); });
  });

  t("every game pushes, updates, draws and pops without throwing", function () {
    const env = boot(); const MQ = env.MQ;
    const ids = Object.keys(MQ.Minigames.GAMES);
    let chain = Promise.resolve();
    ids.forEach(function (id) {
      chain = chain.then(function () {
        let done = false;
        MQ.Minigames.start(id, { seed: 17 }).then(function () { done = true; });
        let c = Promise.resolve();
        for (let i = 0; i < 30; i++) {
          c = c.then(function () {
            if (done) return;
            env.render();
            if (i > 10) MQ.Input.inject("down");
            return env.tick(1);
          });
        }
        return c.then(function () {
          // B always gets you out
          let c2 = Promise.resolve();
          for (let i = 0; i < 40; i++) c2 = c2.then(function () { if (done) return; MQ.Input.inject(i % 2 ? "b" : "a"); return env.tick(1); });
          return c2.then(function () { assert.strictEqual(done, true, id + " can always be left"); });
        });
      });
    });
    return chain;
  });

  // ---- the quiz ---------------------------------------------------
  t("the quiz bank is big, well-formed and covers all three subjects", function () {
    const MQ = boot().MQ;
    const bank = MQ.Minigames.QUIZ;
    assert.ok(bank.length >= 60, "SIDE-CONTENT asks for 60+; there are " + bank.length);
    const tags = {};
    for (let i = 0; i < bank.length; i++) {
      const q = bank[i];
      assert.ok(q.q && q.q.length > 12, "question " + i + " reads properly");
      assert.strictEqual(q.a.length, 4, "question " + i + " has four answers");
      assert.ok(q.r >= 0 && q.r < 4);
      for (let k = 0; k < 4; k++) assert.ok(q.a[k] && q.a[k].length, "answer text");
      tags[q.tag] = (tags[q.tag] || 0) + 1;
    }
    assert.ok(tags.cheshire >= 20, "Cheshire questions");
    assert.ok(tags.security >= 15, "security questions");
    assert.ok(tags.types >= 5, "type questions");
    assert.ok(tags.gaskell >= 4, "Gaskell trivia");
  });

  t("a perfect quiz round sets the flag, pays Marks once a day and unlocks ach_09", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "knutsford_quiz", { seed: 5 }, function (sc) {
      if (sc.over) { MQ.Input.inject("a"); return; }
      if (sc.reveal > 0) return;
      sc.answerWith(sc.qs[sc.i].r);                      // always right
    }).then(function (out) {
      assert.strictEqual(out.done, true);
      assert.strictEqual(out.result.won, true);
      assert.strictEqual(out.result.correct, 5);
      assert.strictEqual(MQ.Flags.get("quiz_perfect_knutsford"), true);
      assert.strictEqual(out.result.marks, 3);
      assert.strictEqual(MQ.Inventory.marks, 3);
      return Promise.resolve();
    }).then(function () {
      assert.strictEqual(MQ.Achievements.has("ach_09"), true, "Cranford Correspondent");
      // a second perfect round the same day is praise, not payment
      return play(env, "knutsford_quiz", { seed: 6 }, function (sc) {
        if (sc.over) { MQ.Input.inject("a"); return; }
        if (sc.reveal > 0) return;
        sc.answerWith(sc.qs[sc.i].r);
      });
    }).then(function (out) {
      assert.strictEqual(out.result.marks, 0, "once a day");
      assert.strictEqual(MQ.Inventory.marks, 3);
    });
  });

  t("a wrong answer costs the perfect and the round still ends cleanly", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "knutsford_quiz", { seed: 9 }, function (sc) {
      if (sc.over) { MQ.Input.inject("a"); return; }
      if (sc.reveal > 0) return;
      sc.answerWith((sc.qs[sc.i].r + 1) % 4);
    }).then(function (out) {
      assert.strictEqual(out.result.won, false);
      assert.strictEqual(out.result.correct, 0);
      assert.strictEqual(MQ.Flags.get("quiz_perfect_knutsford"), undefined);
    });
  });

  t("quiz answers are shuffled but the right one still points at the right text", function () {
    const env = boot(); const MQ = env.MQ;
    const sc = MQ.Minigames.GAMES.knutsford_quiz;
    let scene = null, done = false;
    MQ.Minigames.start("knutsford_quiz", { seed: 3 }).then(function () { done = true; });
    return env.tick(2).then(function () {
      scene = MQ.Scenes.top();
      assert.strictEqual(scene.qs.length, 5);
      for (let i = 0; i < scene.qs.length; i++) {
        const q = scene.qs[i];
        let src = null;
        for (let k = 0; k < MQ.Minigames.QUIZ.length; k++) if (MQ.Minigames.QUIZ[k].q === q.q) src = MQ.Minigames.QUIZ[k];
        assert.ok(src, "question came from the bank");
        assert.strictEqual(q.a[q.r], src.a[src.r], "the shuffled index still points at the right answer");
      }
      let c = Promise.resolve();
      for (let i = 0; i < 60; i++) c = c.then(function () { if (done) return; MQ.Input.inject("b"); return env.tick(1); });
      return c;
    });
  });

  // ---- the type drill ------------------------------------------------
  t("the type drill grades against the real type chart", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "arcade_type_trainer", { seed: 21 }, function (sc) {
      if (sc.over) { MQ.Input.inject("a"); return; }
      const m = MQ.Data.typeMultiplier(sc.atk, sc.def);
      const want = m === 0 ? 3 : m >= 2 ? 0 : m < 1 ? 2 : 1;
      assert.strictEqual(sc.answer, want, sc.atk + " vs " + sc.def.join("/") + " = " + m);
      sc.answerWith(sc.answer);
    }).then(function (out) {
      assert.strictEqual(out.done, true);
      assert.strictEqual(out.result.correct, 12, "twelve from twelve");
      assert.strictEqual(out.result.won, true);
      assert.ok(out.result.score > 1200);
    });
  });

  // ---- the boat lift ---------------------------------------------------
  t("the caissons balance to a tolerance, and the level ladder moves up", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "lift_puzzle", { seed: 4, level: 1 }, function (sc) {
      if (sc.over) { MQ.Input.inject("a"); return; }
      // greedy: always shift the crate that most reduces the difference
      let best = -1, bestDiff = sc.diff();
      for (let i = 0; i < sc.crates.length; i++) {
        const c = sc.crates[i];
        const w0 = sc.weight(0), w1 = sc.weight(1);
        const after = c.side === 0 ? Math.abs((w0 - c.w) - (w1 + c.w)) : Math.abs((w0 + c.w) - (w1 - c.w));
        if (after < bestDiff) { bestDiff = after; best = i; }
      }
      if (best >= 0) sc.shift(best, sc.crates[best].side === 0 ? 1 : 0);
      else sc.shift(0, sc.crates[0].side === 0 ? 1 : 0);
    }).then(function (out) {
      assert.strictEqual(out.done, true);
      assert.strictEqual(out.result.won, true, "a solver clears level 1");
      assert.strictEqual(MQ.Minigames.state.liftLevel, 2, "and the next round is harder");
    });
  });

  t("wet crates only appear from level 3, and they gain weight every move", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.start("lift_puzzle", { seed: 8, level: 4 }).then(function () { done = true; });
    return env.tick(2).then(function () {
      const sc = MQ.Scenes.top();
      assert.strictEqual(sc.wet, true, "level 4 has wet crates");
      let wetIdx = -1;
      for (let i = 0; i < sc.crates.length; i++) if (sc.crates[i].wet) wetIdx = i;
      assert.ok(wetIdx >= 0, "and at least one of them is wet");
      const before = sc.crates[wetIdx].w;
      const dry = sc.crates[wetIdx === 0 ? 1 : 0];
      const dryBefore = dry.w;
      sc.shift(wetIdx === 0 ? 1 : 0, sc.crates[wetIdx === 0 ? 1 : 0].side === 0 ? 1 : 0);
      assert.strictEqual(sc.crates[wetIdx].w, before + 1, "the wet one drinks");
      if (!dry.wet) assert.strictEqual(dry.w, dryBefore, "the dry one does not");
      let c = Promise.resolve();
      for (let i = 0; i < 80; i++) c = c.then(function () { if (done) return; MQ.Input.inject("b"); return env.tick(1); });
      return c;
    });
  });

  t("running out of moves fails the lift without clearing the level", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "lift_puzzle", { seed: 2, level: 1 }, function (sc) {
      if (sc.over) { MQ.Input.inject("a"); return; }
      // deliberately unhelpful: always shift the same crate back and forth
      if (sc.diff() <= sc.tol) return;
      sc.shift(0, sc.crates[0].side === 0 ? 1 : 0);
    }).then(function (out) {
      assert.strictEqual(out.done, true);
      if (!out.result.won) assert.strictEqual(MQ.Minigames.state.liftLevel, 1, "no promotion for a failure");
    });
  });

  // ---- the timetable -----------------------------------------------------
  t("a valid platform allocation clears the panel and sets timetable_perfect", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.start("timetable_puzzle", { seed: 6, level: 1 }).then(function () { done = true; });
    return env.tick(2).then(function () {
      const sc = MQ.Scenes.top();
      // greedy first-fit, re-run after the delay card lands
      function allocate() {
        for (let i = 0; i < sc.trains.length; i++) sc.trains[i].plat = -1;
        for (let i = 0; i < sc.trains.length; i++) {
          for (let pl = 0; pl < sc.platforms; pl++) {
            sc.trains[i].plat = pl;
            if (!sc.clash(i)) break;
            sc.trains[i].plat = -1;
          }
        }
      }
      sc.setPlat(0, 0);            // arm the delay card by filling the board
      allocate();
      if (sc.delayLeft > 0) { sc.delayed = false; sc.setPlat(0, sc.trains[0].plat); }
      allocate();
      assert.strictEqual(sc.allSet(), true, "every service has a road");
      assert.strictEqual(sc.clashes(), 0, "and no two share one");
      sc.submit();
      assert.strictEqual(MQ.Flags.get("timetable_perfect"), true);
      assert.strictEqual(MQ.Minigames.state.ttLevel, 2);
      let c = Promise.resolve();
      for (let i = 0; i < 60; i++) c = c.then(function () { if (done) return; MQ.Input.inject("a"); return env.tick(1); });
      return c.then(function () {
        assert.strictEqual(done, true);
        return Promise.resolve();
      });
    }).then(function () {
      assert.strictEqual(MQ.Achievements.has("ach_16"), true, "On Time, Every Time");
    });
  });

  t("a clashing panel refuses to be sent", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.start("timetable_puzzle", { seed: 12, level: 2 }).then(function () { done = true; });
    return env.tick(2).then(function () {
      const sc = MQ.Scenes.top();
      for (let i = 0; i < sc.trains.length; i++) sc.trains[i].plat = 0;   // all on platform one
      assert.ok(sc.clashes() > 0);
      sc.submit();
      assert.strictEqual(sc.over, false, "it stays on the panel");
      assert.strictEqual(MQ.Flags.get("timetable_perfect"), undefined);
      let c = Promise.resolve();
      for (let i = 0; i < 60; i++) c = c.then(function () { if (done) return; MQ.Input.inject("b"); return env.tick(1); });
      return c;
    });
  });

  // ---- salt rush ------------------------------------------------------------
  t("salt rush deals a board with no free matches and scores cascades", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.start("arcade_salt_rush", { seed: 14 }).then(function () { done = true; });
    return env.tick(2).then(function () {
      const sc = MQ.Scenes.top();
      assert.strictEqual(sc.grid.length, 7 * 8);
      assert.strictEqual(sc.clearMatches(), false, "the opening board is settled");
      // force a swap that must match: build a row of three by hand
      sc.set(0, 0, 1); sc.set(1, 0, 1); sc.set(3, 0, 1); sc.set(2, 1, 1);
      const before = sc.score;
      const ok = sc.trySwap(2 + 1 * 7, 2 + 0 * 7);
      assert.strictEqual(ok, true, "a matching swap is allowed");
      assert.ok(sc.score > before, "and it scores");
      // an impossible swap is put back
      const s2 = sc.score;
      sc.set(0, 5, 0); sc.set(1, 5, 1); sc.set(2, 5, 2); sc.set(3, 5, 3);
      sc.set(0, 6, 3); sc.set(1, 6, 2); sc.set(2, 6, 1); sc.set(3, 6, 0);
      const a0 = sc.at(0, 5), a1 = sc.at(1, 5);
      assert.strictEqual(sc.trySwap(0 + 5 * 7, 1 + 5 * 7), false);
      assert.strictEqual(sc.at(0, 5), a0, "and the board is as it was");
      assert.strictEqual(sc.at(1, 5), a1);
      assert.strictEqual(sc.score, s2);
      let c = Promise.resolve();
      for (let i = 0; i < 60; i++) c = c.then(function () { if (done) return; MQ.Input.inject("b"); return env.tick(1); });
      return c.then(function () { assert.strictEqual(done, true); });
    });
  });

  // ---- packet run -----------------------------------------------------------
  t("packet run keeps three lanes, ends on a hit, and pays tokens for distance", function () {
    const env = boot(); const MQ = env.MQ;
    return play(env, "arcade_packet_run", { seed: 31 }, function (sc, M) {
      if (sc.over) { M.Input.inject("a"); return; }
      sc.score += 4;                                     // simulate a long run
      if (sc.lane !== 1) M.Input.inject(sc.lane < 1 ? "right" : "left");
      if (sc.t > 4000) sc.hit();
    }).then(function (out) {
      assert.strictEqual(out.done, true);
      assert.ok(out.result.score > 0);
      assert.strictEqual(MQ.Minigames.highScore("arcade_packet_run"), out.result.score);
    });
  });

  // ---- tokens & prizes --------------------------------------------------------
  t("tokens accumulate, mirror into a flag, and buy the prize counter's stock", function () {
    const MQ = boot().MQ;
    const rate = MQ.Minigames.tokenRate();
    assert.ok(rate === 1 || rate === 2, "Friday is double");
    const paid = MQ.Minigames.addTokens(50);
    assert.strictEqual(paid, 50 * rate);
    assert.strictEqual(MQ.Minigames.tokens(), 50 * rate);
    assert.strictEqual(MQ.Flags.get("arcade_tokens"), 50 * rate);
    assert.strictEqual(MQ.Minigames.redeem("no_such_prize").ok, false);
    const res = MQ.Minigames.redeem("capsule_quick");
    assert.strictEqual(res.ok, true);
    assert.strictEqual(MQ.Inventory.count("capsule_quick"), 1);
    assert.strictEqual(MQ.Minigames.redeem("capsule_quick").ok, true, "capsules repeat");
    assert.strictEqual(MQ.Minigames.redeem("tm_static_wave").ok, MQ.Minigames.tokens() >= 40);
    while (MQ.Minigames.tokens() > 0) MQ.Minigames.spendTokens(1);
    assert.strictEqual(MQ.Minigames.redeem("capsule_net").ok, false, "no tokens, no prize");
    const prizes = MQ.Minigames.prizes();
    assert.ok(prizes.length >= 6);
    for (let i = 0; i < prizes.length; i++) assert.ok(prizes[i].price > 0 && prizes[i].name);
  });

  t("high scores and levels round-trip through the save provider", function () {
    const MQ = boot().MQ;
    MQ.Minigames.record("arcade_salt_rush", 4200);
    MQ.Minigames.addTokens(30);
    MQ.Minigames.state.liftLevel = 4;
    const blob = JSON.parse(JSON.stringify(MQ.Minigames.saveProvider.save()));
    MQ.Minigames.saveProvider.load(null);
    assert.strictEqual(MQ.Minigames.highScore("arcade_salt_rush"), 0);
    MQ.Minigames.saveProvider.load(blob);
    assert.strictEqual(MQ.Minigames.highScore("arcade_salt_rush"), 4200);
    assert.strictEqual(MQ.Minigames.state.liftLevel, 4);
    assert.ok(MQ.Minigames.tokens() > 0);
    assert.strictEqual(MQ.Minigames.record("arcade_salt_rush", 100), false, "a worse score is not a best");
  });

  t("the arcade front-of-house lists cabinets and a prize counter", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Minigames.arcade().then(function () { done = true; });
    return env.tick(3).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "arcade");
      assert.strictEqual(MQ.Minigames.cabinetItems().length, 3, "three cabinets");
      assert.ok(MQ.Minigames.prizeItems().length >= 6);
      env.render();
      MQ.Minigames.arcadeScene.tab = 1;
      env.render();
      MQ.Input.inject("b");
      return env.tick(4);
    }).then(function () { assert.strictEqual(done, true); });
  });

  // ---------------------------------------------------------------
  // Photo / Sighting mode
  // ---------------------------------------------------------------
  t("sighting mode is locked until photo_mode, and says so politely", function () {
    const env = boot(); const MQ = env.MQ;
    assert.strictEqual(MQ.Photo.unlocked(), false);
    let done = false;
    MQ.Photo.start({ map: "macclesfield" }).then(function () { done = true; });
    let c = Promise.resolve();
    for (let i = 0; i < 40; i++) c = c.then(function () { if (done) return; MQ.Input.inject("a"); return env.tick(1); });
    return c.then(function () {
      assert.strictEqual(done, true);
      assert.strictEqual(MQ.Scenes.has("photo"), false, "the viewfinder never came up");
    });
  });

  t("subjects come from the map's own encounter tables", function () {
    const MQ = boot().MQ;
    const rows = MQ.Photo.subjectsFor("macclesfield", 10, 10);
    assert.ok(rows.length > 0);
    for (let i = 0; i < rows.length; i++) assert.ok(MQ.Data.species[rows[i].species], rows[i].species + " is real");
    const subs = MQ.Photo.makeSubjects(rows, MQ.Activities.rng(3));
    assert.ok(subs.length >= 1 && subs.length <= 3);
    for (let i = 0; i < subs.length; i++) {
      assert.ok(MQ.Photo.POSES.indexOf(subs[i].pose) >= 0);
      assert.ok(subs[i].z > 0 && subs[i].z <= 1);
    }
    const again = MQ.Photo.makeSubjects(rows, MQ.Activities.rng(3));
    assert.strictEqual(JSON.stringify(subs), JSON.stringify(again), "same seed, same cast");
  });

  t("scoring rewards centring, size, rarity, the night and a posing subject", function () {
    const MQ = boot().MQ;
    const centred = { species: "nibbit", x: 0.5, y: 0.5, z: 0.9, pose: "still" };
    const frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
    const dead = MQ.Photo.score(centred, frame, "day");
    assert.ok(dead && dead.total > 0);
    const off = MQ.Photo.score({ species: "nibbit", x: 0.66, y: 0.62, z: 0.9, pose: "still" }, frame, "day");
    assert.ok(off.total < dead.total, "off-centre scores less");
    assert.strictEqual(MQ.Photo.score({ species: "nibbit", x: 0.95, y: 0.5, z: 0.9, pose: "still" }, frame, "day"), null,
      "out of the frame is not a photo");
    assert.ok(MQ.Photo.score(centred, frame, "night").total > dead.total, "night is worth more");
    const posing = MQ.Photo.score({ species: "nibbit", x: 0.5, y: 0.5, z: 0.9, pose: "posing" }, frame, "day");
    assert.ok(posing.total > dead.total, "a posing subject is worth more");
    const rare = MQ.Photo.score({ species: "spindrake", x: 0.5, y: 0.5, z: 0.9, pose: "still" }, frame, "day");
    assert.ok(rare.total > dead.total, "a rare subject is worth more");
  });

  t("a shot fills the dex as seen with a habitat note and counts toward ach_12", function () {
    const MQ = boot().MQ;
    const sub = { species: "flitchick", x: 0.5, y: 0.5, z: 0.9, pose: "posing" };
    const frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
    const rec = MQ.Photo.shoot(sub, MQ.Photo.score(sub, frame, "dusk"), { map: "macclesfield", phase: "dusk" });
    assert.strictEqual(rec.sp, "flitchick");
    assert.ok(rec.score > 0 && rec.grade);
    assert.strictEqual(MQ.Trainer.dex.flitchick.seen >= 1, true);
    assert.strictEqual(MQ.Trainer.stat("photos"), 1);
    assert.strictEqual(MQ.Flags.get("count_photos"), 1);
    assert.ok(MQ.Photo.habitatNote("flitchick").length > 10);
    assert.strictEqual(MQ.Photo.records.length, 1, "MQ.Photo.records is the album");
    assert.strictEqual(MQ.Photo.bestFor("flitchick").score, rec.score);
    const p = MQ.Achievements.progress("ach_12");
    assert.strictEqual(p.have, 1);
    assert.strictEqual(p.need, 50);
  });

  t("photos are stored as compact seeds, not pixels", function () {
    const MQ = boot().MQ;
    const sub = { species: "nibbit", x: 0.5, y: 0.5, z: 0.9, pose: "still" };
    const frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
    const rec = MQ.Photo.shoot(sub, MQ.Photo.score(sub, frame, "day"), { map: "macclesfield" });
    const keys = Object.keys(rec).sort().join(",");
    assert.strictEqual(keys, "grade,map,phase,pose,score,sp,ts,weather");
    assert.ok(JSON.stringify(rec).length < 160, "a photograph is under 160 bytes");
  });

  t("the album counts species, twenty landmarks and five secrets", function () {
    const MQ = boot().MQ;
    const before = MQ.Photo.album();
    assert.strictEqual(before.landmarksTotal, 20);
    assert.strictEqual(before.secretsTotal, 5);
    assert.strictEqual(before.landmarks, 0);
    const lm = MQ.Photo.landmarkOn("macclesfield");
    assert.ok(lm, "Macclesfield has a landmark");
    const shot = MQ.Photo.shootLandmark(lm.id, "macclesfield");
    assert.strictEqual(shot.first, true);
    assert.strictEqual(MQ.Photo.shootLandmark(lm.id, "macclesfield").already, true, "one is plenty");
    assert.strictEqual(MQ.Photo.album().landmarks, 1);
    for (let i = 0; i < MQ.Photo.LANDMARKS.length; i++) assert.ok(MQ.Photo.LANDMARKS[i].map, "every landmark has a home");
  });

  t("a secret shot fires when the creature, the place and the hour all line up", function () {
    const MQ = boot().MQ;
    const frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
    const sub = { species: "grinmalkin", x: 0.5, y: 0.5, z: 0.9, pose: "posing" };
    assert.strictEqual(Object.keys(MQ.Photo.state.secrets).length, 0);
    MQ.Photo.shoot(sub, MQ.Photo.score(sub, frame, "night"), { map: "nantwich", phase: "night" });
    assert.strictEqual(!!MQ.Photo.state.secrets.sec_grinmalkin_brine, true);
    assert.strictEqual(MQ.Photo.album().secrets, 1);
    const glitchra = { species: "glitchra", x: 0.5, y: 0.5, z: 0.9, pose: "still" };
    MQ.Photo.shoot(glitchra, MQ.Photo.score(glitchra, frame, "day"), { map: "jodrell_bank", phase: "day" });
    assert.strictEqual(MQ.Photo.state.secrets.sec_glitchra_dish, undefined, "wrong hour, no secret");
    MQ.Photo.shoot(glitchra, MQ.Photo.score(glitchra, frame, "night"), { map: "jodrell_bank", phase: "night" });
    assert.strictEqual(!!MQ.Photo.state.secrets.sec_glitchra_dish, true);
  });

  t("the viewfinder scene aims, shoots, runs out of film and lowers", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Flags.set("photo_mode", true);
    let out = null, done = false;
    MQ.Photo.start({ map: "macclesfield", x: 10, y: 10, seed: 2, film: 3 }).then(function (r) { out = r; done = true; });
    return env.tick(3).then(function () {
      const sc = MQ.Scenes.top();
      assert.strictEqual(sc.id, "photo");
      assert.strictEqual(sc.transparent, true, "the overworld shows through");
      assert.ok(sc.subjects.length >= 1);
      env.render();
      // aim at the first subject and take the roll
      let c = Promise.resolve();
      for (let i = 0; i < 3; i++) {
        c = c.then(function () {
          if (sc.subjects.length) { sc.frame.x = sc.subjects[0].x; sc.frame.y = sc.subjects[0].y; }
          sc.shutter();
          env.render();
          return env.tick(1);
        });
      }
      return c;
    }).then(function () {
      const sc = MQ.Scenes.top();
      assert.strictEqual(sc.shots, 0, "the roll is used up");
      sc.shutter();
      assert.ok(/film/.test(sc.msg), "and it says so");
      let c = Promise.resolve();
      for (let i = 0; i < 40; i++) c = c.then(function () { if (done) return; MQ.Input.inject("b"); return env.tick(1); });
      return c;
    }).then(function () {
      assert.strictEqual(done, true);
      assert.ok(MQ.Photo.state.shots >= 1, "photographs were taken");
      if (out) assert.ok(out.length >= 1);
    });
  });

  t("the album round-trips through the save provider", function () {
    const MQ = boot().MQ;
    const sub = { species: "nibbit", x: 0.5, y: 0.5, z: 0.9, pose: "still" };
    const frame = { x: 0.5, y: 0.5, w: 0.34, h: 0.30 };
    MQ.Photo.shoot(sub, MQ.Photo.score(sub, frame, "day"), { map: "macclesfield" });
    MQ.Photo.shootLandmark("lm_silk_museum", "macclesfield");
    const blob = JSON.parse(JSON.stringify(MQ.Photo.saveProvider.save()));
    MQ.Photo.saveProvider.load(null);
    assert.strictEqual(MQ.Photo.records.length, 0);
    MQ.Photo.saveProvider.load(blob);
    assert.strictEqual(MQ.Photo.records.length, 1, "and MQ.Photo.records is still the same array");
    assert.strictEqual(MQ.Photo.album().landmarks, 1);
  });
};
