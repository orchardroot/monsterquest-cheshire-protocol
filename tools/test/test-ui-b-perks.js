"use strict";
// ui-b: the perk tree screen and the trainer card.
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
function settle(env, n) {
  let p = Promise.resolve();
  for (let i = 0; i < (n || 6); i++) p = p.then(function () { return env.tick(1); });
  return p;
}

module.exports = function (t, assert) {

  t("the tree draws all three branches, ten rows each", function () {
    const env = boot();
    const MQ = env.MQ;
    assert.strictEqual(MQ.Progression.tree.length, 30, "thirty nodes");
    MQ.Scenes.push(MQ.UI.Perks, {}); MQ.Scenes.flush(); env.step(1); env.render();
    const branches = MQ.UI.Perks.BRANCHES;
    for (let b = 0; b < 3; b++) {
      const list = MQ.Progression.branch(branches[b]);
      assert.strictEqual(list.length, 10, branches[b] + " has ten rows");
    }
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the cursor walks branches and rows", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Perks, {}); MQ.Scenes.flush(); env.step(1);
    assert.strictEqual(MQ.UI.Perks.node().id, "perk_triage_focused");
    press(env, "right");
    assert.strictEqual(MQ.UI.Perks.node().branch, "escalate");
    press(env, "down", 9);
    assert.strictEqual(MQ.UI.Perks.node().row, 9, "the capstone is reachable");
    press(env, "down");
    assert.strictEqual(MQ.UI.Perks.node().row, 9, "and it does not run off the end");
    press(env, "left"); press(env, "left");
    assert.strictEqual(MQ.UI.Perks.node().branch, "adjudicate", "left wraps round the three");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("A buys a perk when the gates allow it, and refuses when they do not", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.perkPoints = 1;
    MQ.Trainer.level = 1;
    MQ.Scenes.push(MQ.UI.Perks, {}); MQ.Scenes.flush(); env.step(1);
    // row 1 needs level 5 and a point spent in the branch
    press(env, "down");
    assert.ok(MQ.Progression.blockedReason(MQ.UI.Perks.node().id), "row one is gated at level 1");
    press(env, "a");
    assert.strictEqual(MQ.Progression.rank(MQ.UI.Perks.node().id), 0, "no perk was taken");
    press(env, "up");
    press(env, "a");
    assert.strictEqual(MQ.Progression.rank("perk_triage_focused"), 1, "row zero was affordable");
    assert.strictEqual(MQ.Trainer.perkPoints, 0, "and it cost a point");
    press(env, "a");
    assert.strictEqual(MQ.Progression.rank("perk_triage_focused"), 1, "a second press with no points changes nothing");
    env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("multi-rank nodes show and buy their ranks in order", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.level = 50;
    MQ.Trainer.perkPoints = 30;
    const node = MQ.Progression.node("perk_adjudicate_ledger_keeper");
    assert.strictEqual(node.maxRank, 3, "Ledger Keeper has three ranks");
    for (let i = 0; i < 7; i++) MQ.Trainer.buyPerk("perk_adjudicate_" + ["enumerate", "fingerprint", "timeline", "steady_hand", "soft_touch", "zero_trust", "phase_break"][i]);
    MQ.Scenes.push(MQ.UI.Perks, { perk: "perk_adjudicate_ledger_keeper" }); MQ.Scenes.flush(); env.step(1);
    assert.strictEqual(MQ.UI.Perks.node().id, "perk_adjudicate_ledger_keeper", "opening on a named perk works");
    press(env, "a");
    assert.strictEqual(MQ.Progression.rank("perk_adjudicate_ledger_keeper"), 1);
    press(env, "a");
    assert.strictEqual(MQ.Progression.rank("perk_adjudicate_ledger_keeper"), 2, "the second rank is Trader");
    env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("respec wants marks and says so", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.level = 20; MQ.Trainer.perkPoints = 3;
    MQ.Trainer.buyPerk("perk_triage_focused");
    MQ.Inventory.marks = 0;
    MQ.Scenes.push(MQ.UI.Perks, {}); MQ.Scenes.flush(); env.step(1);
    press(env, "select");
    return settle(env, 4).then(function () {
      assert.strictEqual(MQ.Progression.rank("perk_triage_focused"), 1, "no marks, no respec");
      MQ.Inventory.marks = 99;
      press(env, "select");
      return settle(env, 8);
    }).then(function () {
      assert.strictEqual(MQ.Progression.rank("perk_triage_focused"), 0, "with marks the tree is wiped");
      MQ.Scenes.clear(); MQ.Scenes.flush();
    });
  });

  t("effect chips read like English", function () {
    const MQ = boot().MQ;
    const f = MQ.UI.Perks.effectText;
    assert.strictEqual(f("critStage", 1), "Crit stage +1");
    assert.strictEqual(f("moneyMult", 1.25), "Prize money ×1.25");
    assert.strictEqual(f("quickDraw", true), "Quick draw");
    assert.strictEqual(f("sleetCooldown", -1), "SLEET cooldown -1");
  });

  t("the trainer card draws eight badges and knows which are earned", function () {
    const env = boot();
    const MQ = env.MQ;
    assert.strictEqual(MQ.UI.Badges.LIST.length, 8);
    const ids = {};
    for (let i = 0; i < MQ.UI.Badges.LIST.length; i++) {
      const b = MQ.UI.Badges.LIST[i];
      assert.ok(/^badge_[a-z]+$/.test(b.id), b.id + " matches the DESIGN-INDEX flag");
      assert.ok(!ids[b.id]); ids[b.id] = true;
      assert.ok(b.town && b.leader && b.type, b.id + " knows its gym");
      assert.strictEqual(MQ.UI.Badges.earned(b.id), false);
    }
    MQ.Trainer.addBadge("badge_packet");
    assert.strictEqual(MQ.UI.Badges.earned("badge_packet"), true);
    MQ.Scenes.push(MQ.UI.TrainerCard, {}); MQ.Scenes.flush(); env.step(1); env.render();
    press(env, "right");
    assert.strictEqual(MQ.UI.TrainerCard.page, 1, "the records page is one press away");
    env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("badges are relabelled SIGNED once PIPPIN is found", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.addBadge("badge_packet");
    assert.strictEqual(MQ.Trainer.badgeLabel("packet"), "PACKET");
    MQ.Flags.set("pippin_found", true);
    assert.strictEqual(MQ.Trainer.badgeLabel("packet"), "SIGNED", "purely cosmetic, purely horrible");
    MQ.Scenes.push(MQ.UI.TrainerCard, {}); MQ.Scenes.flush(); env.step(1); env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the card reports the cats' trust", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Cats.unlock();
    MQ.Cats.setTrust("meadow", 3);
    assert.strictEqual(MQ.Cats.trust("meadow"), 3);
    MQ.Scenes.push(MQ.UI.TrainerCard, {}); MQ.Scenes.flush(); env.step(1); env.render();
    const calls = env.screen.getContext("2d").calls.length;
    assert.ok(calls > 0);
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });
};
