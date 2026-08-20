"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const Q = MQ.Quests, Inv = MQ.Inventory, Tr = MQ.Trainer, Party = MQ.Party;

  MQ.Data.define("species", "spindrake", { name: "SPINDRAKE", types: ["bug", "grass"], habitat: "silk", growth: "medium", base: { hp: 60, atk: 55, def: 50, spa: 65, spd: 55, spe: 60 }, abilities: ["silk_weave"], learnset: [[1, "tackle"]] });
  MQ.Data.define("moves", "tackle", { name: "Tackle", type: "normal", cat: "phys", power: 40, acc: 100, pp: 30 });
  MQ.Data.define("items", "silk_wrap", { name: "Silk Wrap", kind: "gear", price: 0 });
  MQ.Data.define("items", "salve", { name: "Salve", kind: "heal", price: 200, amount: 20 });

  MQ.Data.define("quests", "case_01_silk_thread", {
    name: "The Silk Thread", kind: "case", town: "Macclesfield", giver: { npc: "npc_macclesfield_bronwen", map: "macclesfield" },
    summary: "The mill garden's moths have stopped coming.", teaches: "night encounters, held items",
    opens: "chapter >= 1",
    stages: [
      { id: "s1", text: "Catch a SPINDRAKE in the tall grass at night.", cond: { kind: "catch", species: "spindrake", n: 1 } },
      { id: "s2", text: "Take it back to Weaver Bronwen.", cond: { kind: "talk", npc: "npc_macclesfield_bronwen" } },
      { id: "s3", text: "Find the moth-trap on the mill roof.", cond: { kind: "reach", map: "macclesfield_mill_roof" }, twist: "The moths left because of a smart moth-trap on the roof.", clue: { id: "clue_moth_trap", chapter: 1, title: "Smart moth-trap", text: "Shadow IT on a listed building." } },
      { id: "s4", text: "Pick the right cable.", cond: "case_01_cable_cut" }
    ],
    reward: { money: 600, gear: "silk_wrap", marks: 2 }, tracks: true
  });

  MQ.Data.define("quests", "case_13_bounty_fenced_goods", {
    name: "Bounty: Fenced Goods", kind: "case", town: "Sandbach", tags: ["shadow_it"],
    stages: [
      { id: "s1", text: "Track the berry thief.", cond: { kind: "defeat", trainer: "tr_route_sandbach_1" } },
      { id: "s2", text: "Bring three blackberries back.", cond: { kind: "item", id: "blackberry", n: 3 } }
    ],
    reward: { money: 500, flags: ["bounty_board_open"] }
  });

  MQ.Data.define("quests", "main_01_silk_and_static", {
    name: "Silk and Static", kind: "main", town: "Macclesfield",
    stages: [
      { id: "s1", text: "Sign the Alder Labs contract.", cond: "contract_signed" },
      { id: "s2", text: "Beat three of anything.", cond: { kind: "defeat", n: 3 } }
    ],
    reward: { money: 1000, perk: 1 }
  });

  MQ.Data.define("quests", "case_repeat_pigeons", {
    name: "The Pigeon Problem, Again", kind: "case", town: "Crewe", repeatable: true,
    stages: [{ id: "s1", text: "Shoo them.", cond: { kind: "count", flag: "pigeons_shooed", n: 2 } }],
    reward: { money: 100 }
  });

  t("start() respects the `opens` expression", function () {
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    MQ.Flags.chapter = 0;
    assert.strictEqual(Q.start("case_01_silk_thread"), false, "chapter 0: not open yet");
    MQ.Flags.chapter = 1;
    assert.strictEqual(Q.start("case_01_silk_thread"), true);
    assert.strictEqual(Q.isActive("case_01_silk_thread"), true);
    assert.strictEqual(Q.stage("case_01_silk_thread"), 0);
    assert.strictEqual(Q.pin("case_01_silk_thread"), "In Hand");
    assert.strictEqual(MQ.Flags.test("quest.case_01_silk_thread == 0"), true);
  });

  t("catch/talk/reach conditions advance the machine through check()", function () {
    Tr.saveProvider.load(null);
    MQ.Events.emit("catch", { species: "spindrake", map: "route_macc_bollington", level: 6 });
    assert.strictEqual(Q.stage("case_01_silk_thread"), 1, "catch satisfied stage 1");
    MQ.Events.emit("npc:talk", { npc: "npc_macclesfield_bronwen" });
    assert.strictEqual(Q.stage("case_01_silk_thread"), 2);
    MQ.Events.emit("map:enter", { map: "macclesfield_mill_roof" });
    assert.strictEqual(Q.stage("case_01_silk_thread"), 3);
    assert.strictEqual(Q.state("case_01_silk_thread").twist, true, "the twist was recorded");
    assert.strictEqual(Q.hasClue("clue_moth_trap"), true, "the clue went on the board");
    assert.strictEqual(Q.clueBoard(1).length, 1);
  });

  t("flag-expression conditions complete the quest and pay the reward", function () {
    Inv.saveProvider.load(null);
    Inv.money = 0; Inv.marks = 0;
    MQ.Flags.set("case_01_cable_cut");
    assert.strictEqual(Q.isDone("case_01_silk_thread"), true);
    assert.strictEqual(Q.pin("case_01_silk_thread"), "Closed");
    assert.strictEqual(Inv.money, 600);
    assert.strictEqual(Inv.marks, 2);
    assert.strictEqual(Inv.count("silk_wrap"), 1);
    assert.strictEqual(MQ.Flags.get("case_01_silk_thread_done"), true);
    assert.strictEqual(Tr.stat("casesClosed"), 1);
    assert.strictEqual(MQ.Flags.test("quest.case_01_silk_thread >= 4"), true);
  });

  t("defeat conditions count named trainers and plain wins", function () {
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    Inv.saveProvider.load(null);
    Q.start("case_13_bounty_fenced_goods");
    MQ.Events.emit("battle:end", { outcome: "win", trainer: "tr_route_sandbach_2" });
    assert.strictEqual(Q.stage("case_13_bounty_fenced_goods"), 0, "wrong trainer, no progress");
    MQ.Events.emit("battle:end", { outcome: "win", trainer: "tr_route_sandbach_1" });
    assert.strictEqual(Q.stage("case_13_bounty_fenced_goods"), 1);
    Inv.add("blackberry", 2, { toast: false });
    assert.strictEqual(Q.isDone("case_13_bounty_fenced_goods"), false);
    Inv.add("blackberry", 1, { toast: false });
    assert.strictEqual(Q.isDone("case_13_bounty_fenced_goods"), true);
    assert.strictEqual(MQ.Flags.get("bounty_board_open"), true);
  });

  t("counter-shaped stages report progress for the HUD", function () {
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    Q.start("main_01_silk_and_static");
    Q.track("main_01_silk_and_static");
    MQ.Flags.set("contract_signed");
    assert.strictEqual(Q.stage("main_01_silk_and_static"), 1);
    const p0 = Q.progress("main_01_silk_and_static");
    assert.strictEqual(p0.have, 0); assert.strictEqual(p0.need, 3);
    MQ.Events.emit("battle:end", { outcome: "win" });
    MQ.Events.emit("battle:end", { outcome: "win" });
    assert.strictEqual(Q.progress("main_01_silk_and_static").have, 2);
    const tracked = Q.tracked();
    assert.strictEqual(tracked.id, "main_01_silk_and_static");
    assert.strictEqual(tracked.kind, "main");
    assert.strictEqual(tracked.total, 2);
    assert.strictEqual(tracked.progress.have, 2);
    MQ.Events.emit("battle:end", { outcome: "win" });
    assert.strictEqual(Q.isDone("main_01_silk_and_static"), true);
    assert.strictEqual(Q.tracked(), null, "the tracker lets go when nothing is active");
  });

  t("repeatable quests reopen after completing", function () {
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    Q.start("case_repeat_pigeons");
    MQ.Flags.set("pigeons_shooed", 2);
    assert.strictEqual(Q.isDone("case_repeat_pigeons"), false, "reset for another go");
    assert.strictEqual(Q.state("case_repeat_pigeons").repeats, 1);
    assert.strictEqual(Q.pin("case_repeat_pigeons"), "Open");
    MQ.Flags.set("pigeons_shooed", 0);
    Q.start("case_repeat_pigeons");
    assert.strictEqual(Q.isActive("case_repeat_pigeons"), true);
  });

  t("clue board pins per chapter and links reveal", function () {
    Q.saveProvider.load(null);
    Q.pinClue({ id: "clue_a", chapter: 4, title: "A dish that stopped listening" });
    Q.pinClue({ id: "clue_b", chapter: 4, title: "A ranger with the wrong face" });
    Q.pinClue({ id: "clue_c", chapter: 5, title: "A lanyard from THE STACK" });
    assert.strictEqual(Q.clueBoard(4).length, 2);
    assert.strictEqual(Q.clueBoard().length, 3);
    assert.strictEqual(Q.pinClue({ id: "clue_a" }), Q.clues.clue_a, "pinning twice is idempotent");
    let linked = null;
    MQ.Events.on("clue:link", function (d) { linked = d; });
    const l = Q.linkClues("clue_a", "clue_b", { text: "Both on the same afternoon.", flag: "amos_first_glimpse" });
    assert.ok(l);
    assert.ok(linked && linked.link === l);
    assert.strictEqual(MQ.Flags.get("amos_first_glimpse"), true);
    assert.strictEqual(Q.linkClues("clue_b", "clue_a"), l, "the same line is not drawn twice");
    assert.strictEqual(Q.linkClues("clue_a", "nope"), null);
    assert.strictEqual(Q.clueLinks(4).length, 1);
  });

  t("casebook view model groups by town with pins, twists and Marks", function () {
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    MQ.Flags.chapter = 1;
    Q.start("case_01_silk_thread");
    const book = Q.casebook();
    assert.ok(book.total >= 3, "three case-kind quests defined");
    const macc = book.towns.filter(function (x) { return x.town === "Macclesfield"; })[0];
    assert.ok(macc);
    assert.strictEqual(macc.cases[0].id, "case_01_silk_thread");
    assert.strictEqual(macc.cases[0].pin, "In Hand");
    assert.strictEqual(macc.cases[0].total, 4);
    const sandbach = book.towns.filter(function (x) { return x.town === "Sandbach"; })[0];
    assert.strictEqual(sandbach.cases[0].pin, "Open");
  });

  t("bounties roll three a day, seeded and stable", function () {
    Q.saveProvider.load(null);
    Q.seed = 12345;
    const a = Q.rollBounties();
    const b = Q.rollBounties();
    assert.strictEqual(a.length, 3);
    assert.deepStrictEqual(a, b, "the same day gives the same board");
    const board = Q.bountyBoard();
    assert.strictEqual(board.length, 3);
    assert.ok(board[0].clue, "bounties are located by clue text, not a marker");
    assert.ok(board[0].reward.money > 0);
    assert.strictEqual(Q.acceptBounty(a[0]), true);
    assert.strictEqual(Q.isActive(a[0]), true);
    const def = Q.def(a[0]);
    MQ.Events.emit("battle:end", { outcome: "win", species: def.species });
    assert.strictEqual(Q.stage(a[0]), 1);
    MQ.Events.emit("npc:talk", { npc: "bounty_board" });
    assert.strictEqual(Q.isDone(a[0]), true);
    assert.strictEqual(MQ.Trainer.stat("bounties"), 1);
  });

  t("any/all composite conditions work", function () {
    MQ.Data.define("quests", "case_test_composite", {
      name: "Composite", kind: "case", town: "Test",
      stages: [
        { id: "s1", cond: { kind: "all", of: ["flag_x", { kind: "item", id: "salve", n: 1 }] } },
        { id: "s2", cond: { kind: "any", of: ["flag_y", "flag_z"] } }
      ]
    });
    Q.saveProvider.load(null);
    MQ.Flags.reset();
    Inv.saveProvider.load(null);
    Q.start("case_test_composite");
    MQ.Flags.set("flag_x");
    assert.strictEqual(Q.stage("case_test_composite"), 0, "all: needs both");
    Inv.add("salve", 1, { toast: false });
    assert.strictEqual(Q.stage("case_test_composite"), 1);
    MQ.Flags.set("flag_z");
    assert.strictEqual(Q.isDone("case_test_composite"), true);
  });

  t("rewards can grant a monster, a perk point and a traversal unlock", function () {
    MQ.Data.define("quests", "case_test_reward", {
      name: "Reward Test", kind: "case", town: "Test",
      stages: [{ id: "s1", cond: "reward_go" }],
      reward: { monster: { species: "spindrake", level: 12, nickname: "Bobbin" }, perk: 1, unlock: "lamp", title: "Wallwalker", chips: 4 }
    });
    Q.saveProvider.load(null); MQ.Flags.reset();
    Party.saveProvider.load(null); Inv.saveProvider.load(null); Tr.saveProvider.load(null);
    Q.start("case_test_reward");
    const beforeBonus = Tr.bonusPoints;
    MQ.Flags.set("reward_go");
    assert.strictEqual(Q.isDone("case_test_reward"), true);
    assert.strictEqual(Party.list.length, 1);
    assert.strictEqual(Party.list[0].nickname, "Bobbin");
    assert.strictEqual(Party.list[0].level, 12);
    assert.strictEqual(Tr.bonusPoints, beforeBonus + 1);
    assert.strictEqual(Inv.chips, 4);
    assert.strictEqual(Tr.titles.has("Wallwalker"), true);
    if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities) {
      assert.strictEqual(MQ.Overworld.state.abilities.has("lamp"), true, "overworld present: ability is unlocked directly");
    } else {
      assert.strictEqual(MQ.Flags.get("unlock_lamp"), true, "no overworld: falls back to a flag");
    }
    assert.strictEqual(Tr.dexEntry("spindrake").caught, 1, "gift monsters register in the dex");
  });

  t("onComplete scripts are looked up and degrade when missing", function () {
    let ran = 0;
    MQ.Story = MQ.Story || {};
    MQ.Story.scripts = { case_test_script_done: function* () { ran++; } };
    MQ.Data.define("quests", "case_test_script", {
      name: "Script Test", kind: "case", town: "Test",
      stages: [{ id: "s1", cond: "script_go" }], onComplete: "case_test_script_done"
    });
    MQ.Data.define("quests", "case_test_noscript", {
      name: "Missing Script", kind: "case", town: "Test",
      stages: [{ id: "s1", cond: "noscript_go" }], onComplete: "does_not_exist"
    });
    Q.saveProvider.load(null); MQ.Flags.reset();
    let missing = null;
    MQ.Events.on("quest:script", function (d) { missing = d; });
    Q.start("case_test_script");
    Q.start("case_test_noscript");
    MQ.Flags.set("script_go");
    MQ.Flags.set("noscript_go");
    assert.strictEqual(Q.isDone("case_test_script"), true);
    assert.strictEqual(ran, 1);
    assert.strictEqual(Q.isDone("case_test_noscript"), true, "a missing script never blocks the quest");
    assert.ok(missing && missing.missing === true);
  });

  t("quests save provider round-trips state, clues and the board", function () {
    Q.saveProvider.load(null); MQ.Flags.reset(); MQ.Flags.chapter = 1;
    Q.start("case_01_silk_thread");
    Q.pinClue({ id: "clue_save", chapter: 2, title: "Kept" });
    Q.track("case_01_silk_thread");
    const snap = Q.saveProvider.save();
    Q.saveProvider.load(null);
    assert.strictEqual(Q.isActive("case_01_silk_thread"), false);
    Q.saveProvider.load(snap);
    assert.strictEqual(Q.isActive("case_01_silk_thread"), true);
    assert.strictEqual(Q.trackedId, "case_01_silk_thread");
    assert.strictEqual(Q.hasClue("clue_save"), true);
  });

  t("the quest validator flags malformed definitions", function () {
    MQ.Data.define("quests", "case_test_bad", { stages: [{ cond: { missing: "kind" } }], reward: { items: [{ n: 1 }] } });
    const errs = MQ.Data.validate().filter(function (e) { return e.indexOf("case_test_bad") >= 0; });
    assert.ok(errs.length >= 3, "missing name, missing stage id, cond without kind, reward item without id — got " + errs.length);
    delete MQ.Data.quests.case_test_bad;
    const clean = MQ.Data.validate().filter(function (e) { return e.indexOf("case_test_bad") >= 0; });
    assert.strictEqual(clean.length, 0);
  });
};
