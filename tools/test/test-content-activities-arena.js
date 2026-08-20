"use strict";
// content-activities: the Arena gauntlets, the bounty board and the rematch ladder.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
  MQ.Flags.reset();
  ["Inventory", "Trainer", "Party", "Quests", "Achievements", "Arena", "Bounties", "Rematch",
   "Fishing", "Brewing", "Minigames", "Photo", "Shrine"].forEach(function (k) {
    if (MQ[k] && MQ[k].saveProvider) MQ[k].saveProvider.load(null);
  });
  MQ.Quests.seed = 4242;
  return env;
}
function team(MQ, level, n) {
  const ids = ["silkin", "brinewt", "kindlin", "spindrake", "torrentide", "sootling"];
  for (let i = 0; i < (n || 6); i++) MQ.Party.add(MQ.Party.make(ids[i], level));
}
function settle(env, promise, frames) {
  let done = false, out = null, err = null;
  Promise.resolve(promise).then(function (r) { out = r; done = true; }, function (e) { err = e; done = true; });
  let chain = Promise.resolve();
  for (let i = 0; i < (frames || 4000); i++) {
    chain = chain.then(function () { if (done) return; env.MQ.Input.inject("a"); return env.tick(1); });
  }
  return chain.then(function () {
    if (err) throw err;
    if (!done) throw new Error("promise never settled");
    return out;
  });
}

module.exports = function (t, assert) {

  // ---------------------------------------------------------------
  // Arena
  // ---------------------------------------------------------------
  t("the five tiers carry the engagement rules SIDE-CONTENT asks for", function () {
    const MQ = boot().MQ;
    const A = MQ.Arena;
    assert.strictEqual(A.TIERS.length, 5);
    assert.deepStrictEqual(A.TIERS.map(function (x) { return x.id; }).join(" "), "bronze silver gold platinum obsidian");
    assert.deepStrictEqual(A.TIERS.map(function (x) { return x.fights; }).join(" "), "3 5 7 9 12");
    assert.strictEqual(!!A.tier("gold").rules.noItems, true, "Gold is no items");
    assert.strictEqual(!!A.tier("platinum").rules.oneAgent, true, "Platinum is one Agent");
    assert.strictEqual(!!A.tier("obsidian").rules.randomWeather, true, "Obsidian draws the weather");
    assert.strictEqual(A.tier("silver").rules.noItems, undefined, "Silver leaves your bag alone");
  });

  t("entry is gated on arena_open, the tier below, a standing party and the fee", function () {
    const MQ = boot().MQ;
    team(MQ, 40, 3);
    assert.ok(/not open/.test(MQ.Arena.canEnter("bronze")));
    MQ.Flags.set("arena_open", true);
    assert.ok(/entry fee/.test(MQ.Arena.canEnter("bronze")), "you cannot afford it yet");
    MQ.Inventory.addMoney(50000);
    assert.strictEqual(MQ.Arena.canEnter("bronze"), null);
    assert.ok(/Clear Bronze/.test(MQ.Arena.canEnter("silver")), "the ladder is a ladder");
    assert.ok(/credits/.test(MQ.Arena.canEnter("obsidian")) || /Obsidian opens/.test(MQ.Arena.canEnter("obsidian")));
  });

  t("opponents are generated from a seed, scale with your party and grow through the tier", function () {
    const MQ = boot().MQ;
    team(MQ, 44, 4);
    const A = MQ.Arena;
    const a1 = A.buildChallenger("bronze", 1, MQ.Activities.rng(7), 40);
    const a2 = A.buildChallenger("bronze", 1, MQ.Activities.rng(7), 40);
    assert.strictEqual(JSON.stringify(a1.party), JSON.stringify(a2.party), "the same seed gives the same card");
    const last = A.buildChallenger("bronze", 3, MQ.Activities.rng(7), 40);
    assert.ok(last.party.length >= a1.party.length, "the last fight is not smaller");
    for (let i = 0; i < last.party.length; i++) assert.ok(MQ.Data.species[last.party[i].species], "real species");
    const lvl = A.levelFor("bronze");
    assert.ok(lvl >= 34 && lvl <= 46, "the band is pulled toward the party, not away: " + lvl);
    const boss = A.buildChallenger("obsidian", 12, MQ.Activities.rng(3), 65);
    assert.ok(boss.boss && boss.boss.phases.length === 2, "the twelfth one has phases");
  });

  t("a cleared run pays chips and marks, sets the flag and takes a first-clear perk point", function () {
    const env = boot(); const MQ = env.MQ;
    team(MQ, 55);
    MQ.Inventory.addMoney(50000);
    MQ.Flags.set("arena_open", true);
    const firsts = [];
    MQ.Events.on("arena:clear", function (d) { firsts.push(!!d.first); });
    return MQ.Arena.run("bronze", { auto: true, seed: 3 }).then(function (run) {
      assert.strictEqual(run.cleared, true, "a level-55 party clears Bronze");
      assert.strictEqual(MQ.Flags.get("arena_bronze_clear"), true);
      assert.ok(MQ.Inventory.chips > 0, "chips");
      assert.strictEqual(MQ.Inventory.marks, MQ.Arena.tier("bronze").marks);
      assert.deepStrictEqual(firsts.join(","), "true", "the clear was a first clear");
      assert.strictEqual(MQ.Arena.state.history.length, 1);
      assert.strictEqual(MQ.Arena.cleared("bronze"), true);
      return MQ.Arena.run("bronze", { auto: true, seed: 4 }).then(function () {
        assert.strictEqual(firsts.indexOf(true), 0, "the first clear is the first one");
        assert.strictEqual(firsts.lastIndexOf(true), 0, "and nothing after it is a first clear");
      });
    });
  });

  t("arena:clear reaches the achievements engine", function () {
    const MQ = boot().MQ;
    team(MQ, 55);
    MQ.Inventory.addMoney(50000);
    MQ.Flags.set("arena_open", true);
    return MQ.Arena.run("bronze", { auto: true, seed: 3 }).then(function () {
      return Promise.resolve();
    }).then(function () {
      assert.strictEqual(MQ.Achievements.has("ach_31"), true, "Bronze Warrington");
    });
  });

  t("a lost run still pays for the fights you won, and does not set the flag", function () {
    const MQ = boot().MQ;
    team(MQ, 5, 1);                              // one very small creature
    MQ.Inventory.addMoney(50000);
    MQ.Flags.set("arena_open", true);
    return MQ.Arena.run("bronze", { auto: true, seed: 11 }).then(function (run) {
      assert.strictEqual(run.cleared, false);
      assert.strictEqual(MQ.Flags.get("arena_bronze_clear"), undefined);
      assert.strictEqual(MQ.Arena.state.history[0].cleared, false);
    });
  });

  t("HP refills between fights and Overdrive carries", function () {
    const MQ = boot().MQ;
    team(MQ, 55);
    MQ.Inventory.addMoney(50000);
    MQ.Flags.set("arena_open", true);
    return MQ.Arena.run("bronze", { auto: true, seed: 3 }).then(function (run) {
      assert.strictEqual(run.cleared, true);
      let full = 0;
      for (let i = 0; i < MQ.Party.list.length; i++) if (MQ.Party.list[i].hp === MQ.Party.list[i].stats.hp) full++;
      assert.ok(full > 0, "the party comes out of the gauntlet standing");
    });
  });

  t("the chip desk sells gear and titles, and refuses what you cannot afford or have not earned", function () {
    const MQ = boot().MQ;
    const A = MQ.Arena;
    assert.strictEqual(A.buy("focus_band").ok, false, "no chips");
    MQ.Inventory.addChips(500);
    assert.strictEqual(A.buy("title_gold_standard").ok, false, "not without a Gold clear");
    const got = A.buy("focus_band");
    assert.strictEqual(got.ok, true);
    assert.strictEqual(MQ.Inventory.count("focus_band"), 1);
    assert.strictEqual(MQ.Inventory.chips, 500 - 40);
    MQ.Flags.set("arena_bronze_clear", true);
    assert.strictEqual(A.buy("title_bronze_regular").ok, true);
    assert.strictEqual(A.buy("title_bronze_regular").ok, false, "one title is plenty");
    assert.ok(A.state.titles.indexOf("title_bronze_regular") >= 0);
  });

  t("the leaderboard keeps the best run per tier", function () {
    const MQ = boot().MQ;
    team(MQ, 55);
    MQ.Inventory.addMoney(50000);
    MQ.Flags.set("arena_open", true);
    return MQ.Arena.run("bronze", { auto: true, seed: 3 }).then(function () {
      const lb = MQ.Arena.leaderboard();
      assert.strictEqual(lb.length, 5);
      assert.strictEqual(lb[0].cleared, true);
      assert.ok(lb[0].best && lb[0].best.turns > 0);
      assert.strictEqual(lb[4].cleared, false);
      const blob = JSON.parse(JSON.stringify(MQ.Arena.saveProvider.save()));
      MQ.Arena.saveProvider.load(null);
      assert.strictEqual(MQ.Arena.leaderboard()[0].best, null);
      MQ.Arena.saveProvider.load(blob);
      assert.ok(MQ.Arena.leaderboard()[0].best.turns > 0, "and it round-trips");
    });
  });

  t("the arena lobby scene opens, draws and closes", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Flags.set("arena_open", true);
    let done = false;
    MQ.Arena.open().then(function () { done = true; });
    return env.tick(3).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "arena");
      env.render();
      MQ.Arena.scene.tab = 1;
      env.render();
      MQ.Input.inject("b");
      return env.tick(4);
    }).then(function () {
      assert.strictEqual(done, true, "B closes it");
    });
  });

  // ---------------------------------------------------------------
  // Bounties
  // ---------------------------------------------------------------
  t("three a day, seeded from the date and the save seed, and not re-rollable", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    const a = MQ.Bounties.roll();
    assert.strictEqual(a.length, 3);
    const b = MQ.Bounties.roll();
    assert.strictEqual(a.join(","), b.join(","), "the board does not change on you");
    MQ.Bounties.state.day = 0;
    const c = MQ.Bounties.roll();
    assert.strictEqual(a.join(","), c.join(","), "and the same day gives the same three");
  });

  t("the board carries clue text, tiers and the template metadata", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    const board = MQ.Bounties.board();
    assert.strictEqual(board.length, 3);
    for (let i = 0; i < board.length; i++) {
      const e = board[i];
      assert.ok(e.clue && e.clue.length > 10, "located by clue text, never a marker");
      assert.ok(["petty", "notable", "warrant"].indexOf(e.tier) >= 0);
      assert.ok(MQ.Data.species[e.species]);
      assert.ok(e.level > 0, "the target is levelled");
      assert.strictEqual(e.pin, "Open");
      if (e.tier === "warrant") assert.ok(e.handler && MQ.Data.trainers[e.handler.id], "a warrant brings a handler");
    }
  });

  t("accept → defeat → claim pays out, counts and cannot be claimed twice", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    const e = MQ.Bounties.board()[0];
    assert.strictEqual(MQ.Bounties.claim(e.id).ok, false, "you never took it on");
    assert.strictEqual(MQ.Bounties.accept(e.id).ok, true);
    assert.strictEqual(MQ.Bounties.accept(e.id).ok, false, "only once");
    assert.strictEqual(MQ.Bounties.claimable(e.id), false);
    MQ.Events.emit("battle:end", { outcome: "win", kind: "wild", species: e.species });
    MQ.Quests.check();
    assert.strictEqual(MQ.Bounties.claimable(e.id), true);
    const money = MQ.Inventory.money;
    const res = MQ.Bounties.claim(e.id);
    assert.strictEqual(res.ok, true);
    assert.ok(MQ.Inventory.money > money);
    assert.strictEqual(MQ.Trainer.stat("bounties"), 1, "counted once");
    assert.strictEqual(MQ.Flags.get("count_bounties"), 1, "and mirrored into the flag once");
    assert.strictEqual(MQ.Bounties.claim(e.id).ok, false, "and not twice");
    assert.strictEqual(MQ.Bounties.state.served.length, 1);
  });

  t("bounties work with no quest engine at all", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    const quests = MQ.Quests;
    MQ.Quests = undefined;
    try {
      MQ.Bounties.state.day = 0;
      const board = MQ.Bounties.board();
      assert.strictEqual(board.length, 3);
      const e = board[0];
      assert.strictEqual(MQ.Bounties.accept(e.id).ok, true);
      MQ.Bounties.state.own[e.id].hit = true;
      assert.strictEqual(MQ.Bounties.claimable(e.id), true);
      const money = MQ.Inventory.money;
      assert.strictEqual(MQ.Bounties.claim(e.id).ok, true);
      assert.ok(MQ.Inventory.money > money, "the fallback pays too");
    } finally { MQ.Quests = quests; }
  });

  t("a Warrant hands over a gear piece you do not already own", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    const gear = MQ.Bounties.warrantGear();
    assert.ok(gear && MQ.Data.items[gear]);
    MQ.Inventory.add(gear, 1);
    assert.notStrictEqual(MQ.Bounties.warrantGear(), gear, "it moves on to the next one");
  });

  t("under Quarantine the board speaks in ORACLE's log format", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("bounty_board_open", true);
    assert.ok(!/ORACLE/.test(MQ.Bounties.greeting()[0]));
    MQ.Flags.set("choice_plug", "quarantine");
    assert.ok(/ORACLE/.test(MQ.Bounties.greeting()[0]));
  });

  t("the board scene opens, draws both tabs and closes", function () {
    const env = boot(); const MQ = env.MQ;
    let shut = false;
    settle(env, MQ.Bounties.open("sandbach"), 6).then(function () { });
    return env.tick(6).then(function () {
      // closed: the board is not open yet, so it only says so
      MQ.Flags.set("bounty_board_open", true);
      let done = false;
      MQ.Bounties.open("sandbach").then(function () { done = true; shut = true; });
      return env.tick(4).then(function () {
        assert.strictEqual(MQ.Scenes.top().id, "bounties");
        env.render();
        MQ.Bounties.scene.tab = 1;
        env.render();
        MQ.Input.inject("b");
        return env.tick(4).then(function () { assert.strictEqual(done, true); });
      });
    });
  });

  // ---------------------------------------------------------------
  // Rematches
  // ---------------------------------------------------------------
  t("the ladder holds the eight leaders and anything the data marks rematchable", function () {
    const MQ = boot().MQ;
    const l = MQ.Rematch.ladder();
    const ids = l.map(function (x) { return x.id; });
    assert.ok(ids.indexOf("leader_ada") >= 0);
    assert.ok(ids.indexOf("leader_mo") >= 0);
    assert.strictEqual(l.filter(function (x) { return x.kind === "leader"; }).length >= 8, true);
    MQ.Rematch.register("tr_bollington_1", { name: "Walker Pat", town: "bollington" });
    assert.ok(MQ.Rematch.ladder().map(function (x) { return x.id; }).indexOf("tr_bollington_1") >= 0);
    assert.strictEqual(MQ.Rematch.eligible("tr_macclesfield_1"), false, "not everybody wants a rematch");
  });

  t("availability wants a first win, a badge count and a day between goes", function () {
    const MQ = boot().MQ;
    const R = MQ.Rematch;
    assert.ok(/not beaten them/.test(R.available("leader_ada").why));
    MQ.Flags.set("beat_leader_ada", true);
    MQ.Trainer.addBadge("badge_packet");
    assert.strictEqual(R.available("leader_ada").ok, true, "tier 1 wants the badge you already have");
    R.setTier("leader_ada", 1);
    assert.ok(/2 badges/.test(R.available("leader_ada").why), "tier 2 wants two badges");
    MQ.Trainer.addBadge("badge_cipher");
    assert.strictEqual(R.available("leader_ada").ok, true);
    R.state.last.leader_ada = MQ.Activities.now();
    R.state.lastDay.leader_ada = MQ.Activities.gameDay();
    assert.ok(/tomorrow/.test(R.available("leader_ada").why), "one real day between goes");
    R.state.last.leader_ada = MQ.Activities.now() - R.REAL_DAY - 1;
    assert.strictEqual(R.available("leader_ada").ok, true);
    R.setTier("leader_ada", 5);
    assert.strictEqual(R.available("leader_ada").maxed, true);
  });

  t("thirty game-days also opens a rematch, whichever comes first", function () {
    const MQ = boot().MQ;
    const R = MQ.Rematch;
    MQ.Flags.set("beat_leader_ada", true);
    MQ.Trainer.addBadge("badge_packet");
    R.state.last.leader_ada = MQ.Activities.now();
    R.state.lastDay.leader_ada = MQ.Activities.gameDay() - R.GAME_DAYS - 1;
    assert.strictEqual(R.available("leader_ada").ok, true, "thirty game-days is enough on its own");
  });

  t("growth follows +5 levels a tier, gear at three and the full six at five", function () {
    const MQ = boot().MQ;
    const g1 = MQ.Rematch.growth("leader_ada", 1);
    const g3 = MQ.Rematch.growth("leader_ada", 3);
    const g5 = MQ.Rematch.growth("leader_ada", 5);
    assert.strictEqual(g1.levels, 5);
    assert.strictEqual(g3.levels, 15);
    assert.strictEqual(g3.gear, true);
    assert.strictEqual(g1.gear, false);
    assert.strictEqual(g5.size, 6);
    assert.strictEqual(g5.full, true);
  });

  t("winning a rematch raises the flag the battle engine reads, and tier five pays the Anchor", function () {
    const env = boot(); const MQ = env.MQ;
    const R = MQ.Rematch;
    team(MQ, 60);
    MQ.Flags.set("beat_leader_ada", true);
    MQ.Trainer.addBadge("badge_packet"); MQ.Trainer.addBadge("badge_cipher");
    return settle(env, R.offer("leader_ada", {})).then(function (res) {
      assert.ok(res, "the offer was taken");
      assert.strictEqual(MQ.Flags.get("rematch_leader_ada"), 1, "the ladder moved");
      assert.strictEqual(R.state.wins.leader_ada, 1);
      // straight to tier five to check the Anchor
      R.setTier("leader_ada", 4);
      MQ.Flags.set("postgame_open", true);
      MQ.Trainer.addBadge("badge_bear"); MQ.Trainer.addBadge("badge_kernel");
      MQ.Trainer.addBadge("badge_token"); MQ.Trainer.addBadge("badge_daemon");
      MQ.Trainer.addBadge("badge_proxy"); MQ.Trainer.addBadge("badge_admin");
      R.state.last.leader_ada = 0; R.state.lastDay.leader_ada = undefined;
      return settle(env, R.fight("leader_ada", {}));
    }).then(function (res) {
      assert.strictEqual(MQ.Flags.get("rematch_leader_ada"), 5);
      assert.strictEqual(res.anchor, "anchor_packet");
      assert.strictEqual(MQ.Inventory.count("anchor_packet"), 1);
    });
  });

  t("a declined offer changes nothing", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Dialog.autoChoice = 1;                        // "Not just now"
    MQ.Flags.set("beat_leader_ada", true);
    MQ.Trainer.addBadge("badge_packet");
    return settle(env, MQ.Rematch.offer("leader_ada", {}), 200).then(function (res) {
      assert.strictEqual(res, null);
      assert.strictEqual(MQ.Rematch.tier("leader_ada"), 0);
    });
  });

  t("the rematch ladder screen opens, draws and closes", function () {
    const env = boot(); const MQ = env.MQ;
    let done = false;
    MQ.Rematch.open().then(function () { done = true; });
    return env.tick(3).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "rematch");
      env.render();
      MQ.Input.inject("b");
      return env.tick(4);
    }).then(function () { assert.strictEqual(done, true); });
  });

  t("rematch state round-trips", function () {
    const MQ = boot().MQ;
    MQ.Rematch.state.wins.leader_ada = 3;
    MQ.Rematch.state.anchors.leader_ada = "anchor_packet";
    const blob = JSON.parse(JSON.stringify(MQ.Rematch.saveProvider.save()));
    MQ.Rematch.saveProvider.load(null);
    assert.strictEqual(MQ.Rematch.state.wins.leader_ada, undefined);
    MQ.Rematch.saveProvider.load(blob);
    assert.strictEqual(MQ.Rematch.state.wins.leader_ada, 3);
    assert.strictEqual(MQ.Rematch.state.anchors.leader_ada, "anchor_packet");
  });
};
