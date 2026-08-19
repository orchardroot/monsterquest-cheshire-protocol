"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const P = MQ.Progression, Tr = MQ.Trainer, Inv = MQ.Inventory, A = MQ.Achievements;

  function fresh() {
    Tr.saveProvider.load(null);
    Inv.saveProvider.load(null);
    A.saveProvider.load(null);
    MQ.Flags.reset();
  }
  function levelTo(n) { while (Tr.level < n) Tr.addXp(P.xpForLevel(Tr.level), "test"); }

  t("the perk tree is three branches of ten nodes with the canonical ids", function () {
    assert.strictEqual(P.tree.length, 30);
    assert.deepEqual(P.BRANCHES, ["triage", "escalate", "adjudicate"]);
    for (let i = 0; i < P.BRANCHES.length; i++) {
      const b = P.branch(P.BRANCHES[i]);
      assert.strictEqual(b.length, 10, P.BRANCHES[i] + " has ten nodes");
      for (let r = 0; r < 10; r++) assert.strictEqual(b[r].row, r, "rows are 0-9 in order");
      assert.strictEqual(b[8].id.indexOf("perk_" + P.BRANCHES[i]), 0);
    }
    const ids = ["perk_triage_kill_chain", "perk_escalate_incident_commander", "perk_adjudicate_attribution",
      "perk_triage_sharp_triage", "perk_escalate_escalation", "perk_adjudicate_iron_bell",
      "perk_adjudicate_ledger_keeper", "perk_escalate_fail_safe_protocol", "perk_triage_tracker"];
    for (let i = 0; i < ids.length; i++) assert.ok(P.node(ids[i]), "missing " + ids[i]);
    assert.strictEqual(P.node("perk_adjudicate_ledger_keeper").maxRank, 3, "Ledger Keeper has three ranks");
    assert.strictEqual(P.agentNode("triage").id, "perk_triage_sharp_triage");
  });

  t("rows unlock every five trainer levels", function () {
    for (let i = 0; i < P.tree.length; i++) assert.strictEqual(P.tree[i].level, P.ROW_LEVELS[P.tree[i].row]);
    assert.strictEqual(P.ROW_LEVELS[0], 1);
    assert.strictEqual(P.ROW_LEVELS[9], 45);
  });

  t("the trainer level curve reaches 50 on a realistic XP budget", function () {
    assert.strictEqual(P.levelForTotal(0), 1);
    assert.strictEqual(P.levelForTotal(P.xpForLevel(1)), 2);
    const total = P.xpTotalFor(50);
    assert.ok(total > 4000 && total < 9000, "cumulative to 50 is " + total);
    assert.strictEqual(P.xpForLevel(50), Infinity);
  });

  t("buying a perk needs points, level and points in the branch", function () {
    fresh();
    assert.strictEqual(Tr.perkPoints, 1);
    assert.strictEqual(P.canBuy("perk_triage_focused"), true);
    assert.strictEqual(P.canBuy("perk_triage_exploit"), false, "row 1 needs level 5");
    assert.ok(P.blockedReason("perk_triage_exploit").indexOf("Level 5") > 0);
    assert.strictEqual(Tr.buyPerk("perk_triage_focused").ok, true);
    assert.strictEqual(Tr.perkPoints, 0);
    assert.strictEqual(Tr.buyPerk("perk_escalate_containment").ok, false, "no points left");
    levelTo(5);
    assert.strictEqual(P.canBuy("perk_triage_exploit"), true, "one point in triage, row 1");
    assert.strictEqual(P.canBuy("perk_escalate_patch"), false, "escalate row 1 needs a point in escalate");
    assert.ok(P.blockedReason("perk_escalate_patch").indexOf("ESCALATE") > 0);
  });

  t("perk effects fold with the right operator", function () {
    fresh();
    assert.strictEqual(P.effect("critStage"), 0);
    assert.strictEqual(P.effect("superEffective"), 2);
    assert.strictEqual(P.effect("moneyMult"), 1);
    assert.strictEqual(P.effect("bossPhaseHealCap"), 0.30);
    levelTo(50);
    Tr.buyPerk("perk_triage_focused");
    Tr.buyPerk("perk_adjudicate_enumerate");
    Tr.buyPerk("perk_adjudicate_fingerprint");
    Tr.buyPerk("perk_adjudicate_fingerprint");   // rank 2: Naturalist
    Tr.buyPerk("perk_adjudicate_timeline");
    Tr.buyPerk("perk_adjudicate_steady_hand");
    Tr.buyPerk("perk_adjudicate_soft_touch");
    Tr.buyPerk("perk_adjudicate_zero_trust");
    Tr.buyPerk("perk_adjudicate_phase_break");
    Tr.buyPerk("perk_adjudicate_ledger_keeper");
    assert.strictEqual(P.effect("critStage"), 1, "add");
    assert.strictEqual(P.effect("showFoeMoves"), true, "flag");
    assert.strictEqual(P.effect("showOwnTraits"), true, "rank 2 effects apply");
    assert.strictEqual(P.effect("capsuleBonusAdd"), 0.2);
    assert.strictEqual(P.effect("bossPhaseHealCap"), 0.15, "min");
    assert.strictEqual(P.moneyMult(), 1.25, "mul");
    assert.strictEqual(P.rank("perk_adjudicate_fingerprint"), 2);
    assert.strictEqual(P.has("perk_adjudicate_fingerprint", 2), true);
    assert.strictEqual(P.has("perk_adjudicate_fingerprint", 3), false);
    assert.strictEqual(P.has("perk_triage_kill_chain"), false);
    Tr.buyPerk("perk_adjudicate_ledger_keeper");   // Trader
    assert.strictEqual(P.shopPriceMult(), 0.9);
    Tr.buyPerk("perk_adjudicate_ledger_keeper");   // Wide Share
    assert.strictEqual(P.xpShareRatio(), 0.75);
    assert.strictEqual(P.canBuy("perk_adjudicate_ledger_keeper"), false, "no rank 4");
  });

  t("agent nodes shorten their own agent's cooldown", function () {
    fresh();
    levelTo(45);
    assert.strictEqual(P.agentCooldownMod("sleet"), 0);
    for (let i = 0; i < 8; i++) Tr.buyPerk(P.branch("triage")[i].id);
    Tr.buyPerk("perk_triage_sharp_triage");
    assert.strictEqual(P.agentCooldownMod("sleet"), -1);
    assert.strictEqual(P.agentCooldownMod("arbiter"), 0);
  });

  t("respec costs Marks, refunds every point, and the agent respec is free", function () {
    fresh();
    levelTo(20);
    Tr.buyPerk("perk_triage_focused");
    Tr.buyPerk("perk_triage_exploit");
    Tr.buyPerk("perk_triage_first_strike");
    const spent = P.spentTotal();
    assert.strictEqual(spent, 3);
    const cost = P.respecCost();
    assert.ok(cost > 5, "cost grows with spend: " + cost);
    assert.strictEqual(Tr.respec().ok, false, "no Marks, no respec");
    Inv.addMarks(cost);
    const before = Tr.perkPoints;
    const r = Tr.respec();
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.refunded, spent);
    assert.strictEqual(Tr.perkPoints, before + spent);
    assert.strictEqual(P.spentTotal(), 0);
    assert.strictEqual(P.effect("critStage"), 0, "effects recomputed after a respec");
    assert.strictEqual(Inv.marks, 0);

    levelTo(45);
    Tr.perkPoints += 20;
    for (let i = 0; i < 9; i++) Tr.buyPerk(P.branch("escalate")[i].id);
    assert.strictEqual(P.effect("vigilCooldown"), -1);
    const back = Tr.respecAgentNodes();
    assert.strictEqual(back, 1);
    assert.strictEqual(P.effect("vigilCooldown"), 0);
    assert.strictEqual(P.effect("trustGainMult"), 1.5, "the rest of the branch is untouched");
  });

  t("trainer-level passives follow SYSTEMS-SPEC 8", function () {
    fresh();
    assert.strictEqual(P.trinketSlots(), 0);
    assert.strictEqual(P.obedienceCap(), 12);
    levelTo(20);
    assert.strictEqual(P.trinketSlots(), 1);
    assert.strictEqual(P.numericTraits(), true);
    assert.strictEqual(P.obedienceCap(), 50);
    levelTo(35);
    assert.strictEqual(P.trinketSlots(), 2);
    levelTo(40);
    assert.ok(Math.abs(P.catchRateBonus() - 0.30) < 1e-9, "catch bonus caps at +30%");
  });

  t("trinkets need an unlocked slot and a trinket item", function () {
    fresh();
    Inv.add("sprint_soles", 1, { toast: false });
    assert.strictEqual(Tr.equipTrinket("sprint_soles", 0).ok, false, "slot not open at level 1");
    levelTo(20);
    assert.strictEqual(Tr.equipTrinket("salve", 0).ok, false, "not a trinket");
    assert.strictEqual(Tr.equipTrinket("sprint_soles", 0).ok, true);
    assert.strictEqual(Tr.wearing("sprint_soles"), true);
    assert.strictEqual(Tr.equipTrinket("sprint_soles", 1).ok, false, "second slot needs level 35");
    Tr.unequipTrinket(0);
    assert.strictEqual(Tr.wearing("sprint_soles"), false);
  });

  t("monster level curve matches the three growth groups", function () {
    assert.strictEqual(P.expForMonLevel(10, "fast"), 800);
    assert.strictEqual(P.expForMonLevel(10, "medium"), 1000);
    assert.strictEqual(P.expForMonLevel(10, "slow"), 1250);
    assert.strictEqual(P.monLevelForExp(1000, "medium"), 10);
    assert.strictEqual(P.monLevelForExp(999, "medium"), 9);
  });

  t("Progression.award routes named XP sources to the trainer", function () {
    fresh();
    const before = Tr.xp;
    P.award("wild");
    assert.strictEqual(Tr.xp, before + 1);
    P.award("gym");
    assert.ok(Tr.level > 1, "a gym is worth a level early on");
    assert.strictEqual(P.award("not_a_source"), 0);
  });

  // ---- achievements ------------------------------------------------
  t("all forty achievements have hooks with names and needs", function () {
    assert.strictEqual(A.TOTAL, 40);
    for (let i = 1; i <= 40; i++) {
      const id = "ach_" + (i < 10 ? "0" + i : i);
      const h = A.hooks[id];
      assert.ok(h, "missing hook " + id);
      assert.ok(h.name && h.name.length > 2, id + " needs a name");
      assert.ok(h.need >= 1, id + " needs a target");
      assert.strictEqual(typeof h.get, "function");
    }
  });

  t("unlock() fires once, toasts, sets a flag and emits", function () {
    fresh();
    let fired = 0;
    MQ.Events.on("achievement", function () { fired++; });
    MQ.UI.toasts.length = 0;
    assert.strictEqual(A.unlock("ach_01"), true);
    assert.strictEqual(A.unlock("ach_01"), false, "only once");
    assert.strictEqual(fired, 1);
    assert.strictEqual(A.has("ach_01"), true);
    assert.strictEqual(MQ.Flags.get("ach_01"), true);
    assert.ok(MQ.UI.toasts.length >= 1 && MQ.UI.toasts[0].text.indexOf("First Triage") > 0);
    assert.strictEqual(A.unlock("ach_99"), false, "unknown id refused");
  });

  t("stat-driven achievements unlock from their own counters", function () {
    fresh();
    Tr.bump("steps", 9999);
    A.checkAll();
    assert.strictEqual(A.has("ach_02"), false);
    const p = A.progress("ach_02");
    assert.strictEqual(p.need, 10000);
    assert.strictEqual(p.have, 9999);
    Tr.bump("steps", 1);
    A.checkAll();
    assert.strictEqual(A.has("ach_02"), true);
    assert.strictEqual(A.progress("ach_02").pct, 1);
  });

  t("badge, bounty and dex achievements read the right sources", function () {
    fresh();
    Tr.addBadge("packet");
    A.checkAll();
    assert.strictEqual(A.has("ach_07"), true, "Trust Anchor on the first badge");
    assert.strictEqual(A.has("ach_08"), false);
    const rest = ["cipher", "bear", "kernel", "token", "daemon", "proxy", "admin"];
    for (let i = 0; i < rest.length; i++) Tr.addBadge(rest[i]);
    A.checkAll();
    assert.strictEqual(A.has("ach_08"), true, "Eight Anchors");
    Tr.bump("bounties", 25);
    Tr.bump("warrants", 5);
    A.checkAll();
    assert.strictEqual(A.has("ach_29"), true);
    assert.strictEqual(A.has("ach_30"), true);
  });

  t("Principal unlocks when a whole branch is maxed", function () {
    fresh();
    levelTo(50);
    Tr.perkPoints += 50;
    const nodes = P.branch("triage");
    for (let i = 0; i < nodes.length; i++) for (let r = 0; r < nodes[i].maxRank; r++) Tr.buyPerk(nodes[i].id);
    A.checkAll();
    assert.strictEqual(A.has("ach_39"), true);
  });

  t("achievements save provider round-trips unlocks and counters", function () {
    fresh();
    A.unlock("ach_01");
    A.bump("ach_24", 2);
    const snap = A.saveProvider.save();
    A.saveProvider.load(null);
    assert.strictEqual(A.has("ach_01"), false);
    A.saveProvider.load(snap);
    assert.strictEqual(A.has("ach_01"), true);
    assert.strictEqual(A.counters.ach_24, 2);
    assert.strictEqual(A.count(), 1);
    const list = A.list();
    assert.strictEqual(list.length, 40);
    assert.strictEqual(list[0].unlocked, true);
  });

  t("achievement checks survive missing subsystems", function () {
    fresh();
    const cats = MQ.Cats, quests = MQ.Quests;
    MQ.Cats = null; MQ.Quests = null;
    assert.doesNotThrow(function () { A.checkAll(); });
    MQ.Cats = cats; MQ.Quests = quests;
  });
};
