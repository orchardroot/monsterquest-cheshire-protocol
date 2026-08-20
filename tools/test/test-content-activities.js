"use strict";
// content-activities: the data registries, fishing, brewing, the shrine and the inns.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
  MQ.Flags.reset();
  ["Inventory", "Trainer", "Party", "Quests", "Achievements", "Fishing", "Brewing", "Shrine",
   "Arena", "Bounties", "Minigames", "Photo", "Rematch"].forEach(function (k) {
    if (MQ[k] && MQ[k].saveProvider) MQ[k].saveProvider.load(null);
  });
  return env;
}
// Dialogs are scenes: they only advance when the loop runs, even on auto.
function settle(env, promise, frames) {
  let done = false, out = null, err = null;
  Promise.resolve(promise).then(function (r) { out = r; done = true; }, function (e) { err = e; done = true; });
  let chain = Promise.resolve();
  for (let i = 0; i < (frames || 200); i++) {
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
  // data/achievements.js
  // ---------------------------------------------------------------
  t("js/data/achievements.js defines all 40 achievements with the engine's ids", function () {
    const MQ = boot().MQ;
    assert.strictEqual(MQ.Data.count("achievements"), 40);
    for (let i = 1; i <= 40; i++) {
      const id = "ach_" + (i < 10 ? "0" : "") + i;
      const d = MQ.Data.achievements[id];
      assert.ok(d, id + " defined");
      assert.ok(d.name && d.desc, id + " has display text");
      assert.ok(d.need >= 1, id + " has a target");
      assert.ok(d.slug, id + " has a slug");
    }
    // the engine must agree with us on every id and every target
    const ids = MQ.Achievements.ids;
    assert.strictEqual(ids.length, 40);
    for (let i = 0; i < ids.length; i++) {
      const d = MQ.Data.achievements[ids[i]];
      assert.ok(d, "engine id " + ids[i] + " has data");
      assert.strictEqual(d.need, MQ.Achievements.hooks[ids[i]].need, ids[i] + " need agrees with the hook");
    }
  });

  t("achievement display text comes from the data file, not the engine's fallback", function () {
    const MQ = boot().MQ;
    assert.strictEqual(MQ.Achievements.def("ach_35").name, "Obsidian");
    assert.strictEqual(MQ.Data.achievements.ach_35.hidden, true, "Obsidian is hidden");
    assert.strictEqual(MQ.Data.achievements.ach_01.hidden, false);
  });

  t("recipes and bounty templates resolve to real items, species and maps", function () {
    const MQ = boot().MQ;
    assert.ok(MQ.Data.count("recipes") >= 10);
    MQ.Data.each("recipes", function (r, id) {
      assert.ok(r.name && r.effect && r.tip, id + " reads properly");
      assert.ok(r.minutes > 0 && r.minutes <= 240, id + " is never longer than four hours");
      assert.ok(MQ.Data.items[r.output], id + " output " + r.output + " is a real item");
      assert.ok(r.ingredients.length, id + " has ingredients");
      for (let i = 0; i < r.ingredients.length; i++) {
        assert.ok(MQ.Data.items[r.ingredients[i].id], id + " ingredient " + r.ingredients[i].id + " exists");
      }
    });
    assert.ok(MQ.Data.count("bounties") >= 24);
    let warrants = 0;
    MQ.Data.each("bounties", function (b, id) {
      assert.ok(MQ.Data.species[b.species], id + " targets a real species");
      assert.ok(b.clue && b.clue.length > 10, id + " has clue text");
      assert.ok(["petty", "notable", "warrant"].indexOf(b.tier) >= 0, id + " tier");
      if (b.tier === "warrant") warrants++;
    });
    assert.ok(warrants >= 5, "enough warrants to rotate");
  });

  // ---------------------------------------------------------------
  // Fishing
  // ---------------------------------------------------------------
  t("the rod is read off the bag and never demotes you", function () {
    const MQ = boot().MQ;
    assert.strictEqual(MQ.Fishing.hasRod(), false);
    MQ.Inventory.add("rod_bamboo", 1);
    assert.strictEqual(MQ.Fishing.rod, "bamboo");
    MQ.Inventory.add("rod_carbon", 1);
    assert.strictEqual(MQ.Fishing.rod, "carbon", "the best rod in the bag wins");
    assert.strictEqual(MQ.Fishing.upgradeRod("weighted"), false, "no going backwards");
    assert.strictEqual(MQ.Fishing.upgradeRod("elm"), true);
    assert.strictEqual(MQ.Fishing.rod, "elm");
    assert.strictEqual(MQ.Flags.get("fish_rod_tier"), 4);
    // MQ.Encounters reads this property directly
    assert.strictEqual(MQ.Encounters.rodTier(), "elm");
  });

  t("legendary is dawn/dusk only and ghost needs night plus the lens", function () {
    const MQ = boot().MQ;
    MQ.Fishing.setRod("elm");
    MQ.Clock.setTime(12, 0);
    let tiers = MQ.Fishing.allowedTiers();
    assert.strictEqual(tiers.indexOf("legendary"), -1, "no legendary at midday");
    assert.strictEqual(tiers.indexOf("ghost"), -1, "no ghost at midday");
    MQ.Clock.setTime(5, 30);
    assert.strictEqual(MQ.Clock.phase, "dawn");
    tiers = MQ.Fishing.allowedTiers();
    assert.ok(tiers.indexOf("legendary") >= 0, "legendary at dawn");
    assert.strictEqual(tiers.indexOf("ghost"), -1, "still no ghost without night");
    MQ.Clock.setTime(23, 0);
    assert.strictEqual(MQ.Fishing.allowedTiers().indexOf("ghost"), -1, "night alone is not enough");
    MQ.Inventory.add("ghost_lens", 1);
    assert.ok(MQ.Fishing.allowedTiers().indexOf("ghost") >= 0, "night + Ghost Lens");
    MQ.Fishing.setRod("bamboo");
    assert.strictEqual(MQ.Fishing.allowedTiers().indexOf("ghost"), -1, "a bamboo rod never sees ghosts");
  });

  t("the reel plan tightens with rarity and widens with the rod, the chain and a Bait Tin", function () {
    const MQ = boot().MQ;
    MQ.Fishing.setRod("weighted");
    const common = MQ.Fishing.reelPlan({ tier: "common" });
    const rare = MQ.Fishing.reelPlan({ tier: "rare" });
    assert.ok(rare.zone < common.zone, "rare is a narrower band");
    assert.ok(rare.hits > common.hits, "rare needs more pulls");
    assert.ok(rare.speed > common.speed, "rare sweeps faster");
    const before = MQ.Fishing.reelPlan({ tier: "rare" }).zone;
    MQ.Inventory.add("brew_bait_tin", 1);
    assert.ok(MQ.Fishing.reelPlan({ tier: "rare" }).zone > before, "the Bait Tin widens the Rare zone");
    MQ.Fishing.state.chain = 5;
    assert.ok(MQ.Fishing.reelPlan({ tier: "rare" }).zone > before + 0.04, "and the chain widens it further");
  });

  t("landing rules: commons join you the first time, rare tiers go to a fight, bottles are items", function () {
    const MQ = boot().MQ;
    assert.strictEqual(MQ.Fishing.landingKind({ tier: "common", species: "puddlish" }), "keep");
    MQ.Trainer.record("puddlish", { map: "macclesfield" });
    assert.strictEqual(MQ.Fishing.landingKind({ tier: "common", species: "puddlish" }), "measure",
      "one you have already caught is weighed and slipped back");
    assert.strictEqual(MQ.Fishing.landingKind({ tier: "rare", species: "torrentide" }), "battle");
    assert.strictEqual(MQ.Fishing.landingKind({ tier: "legendary", species: "salmoneer" }), "battle");
    assert.strictEqual(MQ.Fishing.landingKind({ tier: "ghost", species: "puddlish", item: "brine_sample" }), "item");
  });

  t("a landed common goes in the party, the ledger and the dex", function () {
    const MQ = boot().MQ;
    MQ.Fishing.setRod("bamboo");
    const out = MQ.Fishing.resolveLanding({ species: "towpaddle", level: 6, tier: "common", map: "macclesfield" });
    assert.strictEqual(out.kind, "keep");
    assert.ok(out.cm > 0, "it has a length");
    assert.ok(out.monster, "and it is a real monster instance");
    assert.strictEqual(MQ.Party.has("towpaddle"), true);
    assert.strictEqual(MQ.Trainer.dex.towpaddle.caught >= 1, true);
    const rec = MQ.Fishing.record("towpaddle");
    assert.strictEqual(rec.n, 1);
    assert.strictEqual(rec.cm, out.cm);
    // the second one is measured, and only beats the ledger if it is bigger
    const again = MQ.Fishing.resolveLanding({ species: "towpaddle", level: 6, tier: "common", map: "macclesfield" });
    assert.strictEqual(again.kind, "measure");
    assert.strictEqual(MQ.Fishing.record("towpaddle").n, 2);
    assert.ok(MQ.Fishing.record("towpaddle").cm >= out.cm, "the ledger keeps the biggest");
  });

  t("Angler Doug pays for personal bests, once each", function () {
    const env = boot(); const MQ = env.MQ;
    const before = MQ.Inventory.money;
    MQ.Fishing.resolveLanding({ species: "perchip", level: 9, tier: "uncommon", map: "macclesfield" });
    assert.ok(MQ.Fishing.dougOwed() > 0, "there is something to sell");
    return settle(env, MQ.Fishing.doug()).then(function (paid) {
      assert.ok(paid > 0);
      assert.strictEqual(MQ.Inventory.money, before + paid);
      assert.strictEqual(MQ.Fishing.dougOwed(), 0, "the slate is clear");
      return settle(env, MQ.Fishing.doug());
    }).then(function () {
      assert.strictEqual(MQ.Fishing.dougOwed(), 0, "and he does not pay twice");
    });
  });

  t("fishing rolls only from a table the map actually has", function () {
    const MQ = boot().MQ;
    MQ.Fishing.setRod("weighted");
    assert.strictEqual(MQ.Fishing.tableFor("macclesfield"), "fish_macclesfield");
    assert.strictEqual(MQ.Fishing.canFish("macclesfield"), true);
    const res = MQ.Fishing.roll("macclesfield", {});
    assert.ok(res && res.species, "something bites");
    assert.ok(MQ.Data.species[res.species], "and it is a real species");
    assert.ok(["common", "uncommon", "rare", "legendary", "ghost"].indexOf(res.tier) >= 0);
  });

  t("fishing survives without the world's encounter engine", function () {
    const env = boot(); const MQ = env.MQ;
    const real = MQ.Encounters.fish;
    MQ.Encounters.fish = function () { return null; };
    MQ.Fishing.setRod("weighted");
    const res = MQ.Fishing.roll("macclesfield", {});
    MQ.Encounters.fish = real;
    assert.ok(res && res.species, "the private roll takes over");
  });

  t("the fishing scene runs cast → bite → reel → land and pops a result", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Party.add(MQ.Party.make("silkin", 20));
    MQ.Inventory.add("rod_bamboo", 1);
    let out = null, done = false;
    MQ.Fishing.start({ map: "macclesfield", x: 1, y: 1 }).then(function (r) { out = r; done = true; },
      function (e) { done = true; throw e; });
    const sc = MQ.Fishing.scene;
    let chain = Promise.resolve();
    for (let i = 0; i < 600; i++) {
      chain = chain.then(function () {
        if (done) return;
        if (sc.phase === "bite" || sc.phase === "done") MQ.Input.inject("a");
        else if (sc.phase === "reel" && Math.abs(sc.marker - sc.zoneAt) < sc.plan.zone / 3) MQ.Input.inject("a");
        return env.tick(1);
      });
    }
    return chain.then(function () {
      assert.strictEqual(done, true, "the scene finished");
      assert.ok(out, "with a result");
      assert.ok(out.landed === true || out.landed === false);
      if (out.landed) assert.ok(MQ.Fishing.state.landed >= 1);
    });
  });

  t("fishing state round-trips through the save provider", function () {
    const MQ = boot().MQ;
    MQ.Fishing.setRod("carbon");
    MQ.Fishing.resolveLanding({ species: "puddlish", level: 5, tier: "common", map: "poynton" });
    const blob = JSON.parse(JSON.stringify(MQ.Fishing.saveProvider.save()));
    MQ.Fishing.saveProvider.load(null);
    assert.strictEqual(MQ.Fishing.state.landed, 0);
    MQ.Fishing.saveProvider.load(blob);
    assert.strictEqual(MQ.Fishing.state.rod, "carbon");
    assert.ok(MQ.Fishing.record("puddlish"));
  });

  // ---------------------------------------------------------------
  // Brewing
  // ---------------------------------------------------------------
  t("the shed is shut until brewing_open, and tiers gate the book", function () {
    const MQ = boot().MQ;
    assert.strictEqual(MQ.Brewing.open(), false);
    assert.strictEqual(MQ.Brewing.tier(), 0);
    assert.strictEqual(MQ.Brewing.blocked("perry"), "The shed is shut.");
    MQ.Flags.set("brewing_open", true);
    assert.strictEqual(MQ.Brewing.tier(), 1);
    assert.strictEqual(MQ.Brewing.known("perry"), true, "Q17 teaches the first recipe");
    assert.strictEqual(MQ.Brewing.blocked("salt_mead"), "You do not know it yet.");
    MQ.Flags.set("recipe_salt_mead", true);
    assert.ok(/tier 2/.test(MQ.Brewing.blocked("salt_mead")), "tier 2 is locked at press tier 1");
    MQ.Flags.set("brew_tier", 3);
    assert.ok(!/tier/.test(String(MQ.Brewing.blocked("salt_mead") || "")), "tier 3 press unlocks it");
  });

  t("a brew consumes its ingredients, runs on the wall clock and pays out once", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("brewing_open", true);
    assert.strictEqual(MQ.Brewing.begin("perry").ok, false, "not without pears");
    MQ.Inventory.add("perry_pear", 3);
    const res = MQ.Brewing.begin("perry");
    assert.strictEqual(res.ok, true);
    assert.strictEqual(MQ.Inventory.count("perry_pear"), 0, "the pears are gone");
    assert.strictEqual(MQ.Brewing.ready(0), false);
    assert.ok(MQ.Brewing.remaining(0) > 0);
    assert.strictEqual(MQ.Brewing.collect(0).ok, false, "not before time");
    MQ.Brewing.state.casks[0].started -= 11 * 60000;      // the app was shut for eleven minutes
    assert.strictEqual(MQ.Brewing.ready(0), true, "wall-clock timers carry on while you are away");
    const got = MQ.Brewing.collect(0);
    assert.strictEqual(got.ok, true);
    assert.strictEqual(MQ.Inventory.count("brew_perry"), 1);
    assert.strictEqual(MQ.Flags.get("brewed_brew_perry"), true);
    assert.strictEqual(MQ.Brewing.caskInfo(0).empty, true);
    assert.strictEqual(MQ.Brewing.collect(0).ok, false, "and the barrel is empty now");
  });

  t("brew:done reaches the achievements engine", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("brewing_open", true);
    MQ.Inventory.add("perry_pear", 3);
    MQ.Brewing.begin("perry");
    MQ.Brewing.state.casks[0].started -= 11 * 60000;
    MQ.Brewing.collect(0);
    return Promise.resolve().then(function () {
      assert.strictEqual(MQ.Trainer.stat("brews"), 1, "counted once, not twice");
      assert.strictEqual(MQ.Achievements.has("ach_21"), true, "First Press");
    });
  });

  t("three barrels, five with the upgrade, and Mam-gu hurries one a day for a Mark", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("brewing_open", true);
    assert.strictEqual(MQ.Brewing.caskCount(), 3);
    MQ.Flags.set("brew_barrels_5", true);
    assert.strictEqual(MQ.Brewing.caskCount(), 5);
    MQ.Inventory.add("perry_pear", 3);
    MQ.Brewing.begin("perry");
    assert.strictEqual(MQ.Brewing.hurry(0).ok, false, "a Mark, she said");
    MQ.Inventory.addMarks(2);
    assert.strictEqual(MQ.Brewing.hurry(0).ok, true);
    assert.strictEqual(MQ.Inventory.marks, 1);
    assert.strictEqual(MQ.Brewing.ready(0), true);
    MQ.Inventory.add("perry_pear", 3);
    MQ.Brewing.begin("perry", 1);
    assert.strictEqual(MQ.Brewing.hurry(1).ok, false, "once a day");
  });

  t("Mam-gu's Cask is weekly and the elm rod is once, ever", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("brewing_open", true); MQ.Flags.set("brew_tier", 3);
    MQ.Flags.set("recipe_mamgu_cask", true); MQ.Flags.set("recipe_elm_rod", true);
    ["perry_pear", "damson", "blackberry", "honey", "barley", "brine_sample"].forEach(function (i) { MQ.Inventory.add(i, 3); });
    assert.strictEqual(MQ.Brewing.begin("mamgu_cask").ok, true);
    assert.ok(/week/.test(MQ.Brewing.blocked("mamgu_cask")), "once a week");
    MQ.Inventory.add("timber_oak", 2); MQ.Inventory.add("roe", 6);
    assert.strictEqual(MQ.Brewing.begin("elm_rod").ok, true);
    MQ.Brewing.state.casks[1].started -= 241 * 60000;
    MQ.Brewing.collect(1);
    assert.strictEqual(MQ.Inventory.count("rod_elm"), 1);
    assert.strictEqual(MQ.Fishing.rod, "elm", "and the rod is now the one you fish with");
    assert.strictEqual(MQ.Brewing.blocked("elm_rod"), "Once is enough.");
  });

  t("brewing state round-trips, casks and all", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("brewing_open", true);
    MQ.Inventory.add("perry_pear", 3);
    MQ.Brewing.begin("perry");
    const blob = JSON.parse(JSON.stringify(MQ.Brewing.saveProvider.save()));
    MQ.Brewing.saveProvider.load(null);
    assert.strictEqual(MQ.Brewing.caskInfo(0).empty, true);
    MQ.Brewing.saveProvider.load(blob);
    assert.strictEqual(MQ.Brewing.caskInfo(0).recipe, "perry");
  });

  // ---------------------------------------------------------------
  // Shrine & inns
  // ---------------------------------------------------------------
  t("the crosses revive the fallen once a real day, with no friendship penalty", function () {
    const MQ = boot().MQ;
    MQ.Party.add(MQ.Party.make("silkin", 20));
    MQ.Party.add(MQ.Party.make("brinewt", 20));
    MQ.Party.list[0].hp = 0;
    const friendship = MQ.Party.list[0].friendship;
    assert.strictEqual(MQ.Shrine.available(), false, "shut until the story opens it");
    MQ.Flags.set("sandbach_shrine", true);
    assert.strictEqual(MQ.Shrine.available(), true);
    assert.strictEqual(MQ.Shrine.fallen().length, 1);
    const up = MQ.Shrine.revive();
    assert.strictEqual(up.length, 1);
    assert.strictEqual(MQ.Party.list[0].hp, MQ.Party.list[0].stats.hp);
    assert.strictEqual(MQ.Party.list[0].friendship, friendship, "the crosses do not charge for it");
    assert.strictEqual(MQ.Shrine.usedToday(), true);
    assert.strictEqual(MQ.Shrine.available(), false, "once a day");
  });

  t("the shrine says something sensible in each of its three states", function () {
    const env = boot(); const MQ = env.MQ;
    MQ.Party.add(MQ.Party.make("silkin", 20));
    return settle(env, MQ.Shrine.use()).then(function () {
      MQ.Flags.set("sandbach_shrine", true);
      return settle(env, MQ.Shrine.use());          // nothing is down
    }).then(function () {
      MQ.Party.list[0].hp = 0;
      MQ.Shrine.state.lastDay = MQ.Activities.dayKey();
      return settle(env, MQ.Shrine.use());          // already used today
    }).then(function () {
      assert.strictEqual(MQ.Party.list[0].hp, 0, "and it really did refuse");
    });
  });

  t("inns sleep you to a band, heal the party and charge for the walk round the clock", function () {
    const MQ = boot().MQ;
    MQ.Party.add(MQ.Party.make("silkin", 20));
    MQ.Party.list[0].hp = 1;
    MQ.Inventory.addMoney(1000);
    MQ.Clock.setTime(12, 0);
    assert.strictEqual(MQ.Clock.phase, "day");
    const near = MQ.Inn.price("dusk"), far = MQ.Inn.price("dawn");
    assert.ok(far > near, "further round the clock costs more");
    const res = MQ.Inn.sleepTo("night", { map: "macclesfield" });
    assert.strictEqual(res.ok, true);
    assert.strictEqual(MQ.Clock.phase, "night");
    assert.strictEqual(MQ.Party.list[0].hp, MQ.Party.list[0].stats.hp);
    assert.strictEqual(MQ.Inventory.money, 1000 - res.cost);
    assert.strictEqual(MQ.Inn.nameFor("macclesfield"), "The Silk & Shuttle");
  });

  t("an inn refuses politely when you cannot pay", function () {
    const MQ = boot().MQ;
    MQ.Clock.setTime(12, 0);
    const res = MQ.Inn.sleepTo("night", {});
    assert.strictEqual(res.ok, false);
    assert.ok(/credits/.test(res.msg));
    assert.strictEqual(MQ.Clock.phase, "day", "and did not move the clock");
  });

  t("shrine and inn state round-trip", function () {
    const MQ = boot().MQ;
    MQ.Flags.set("sandbach_shrine", true);
    MQ.Party.add(MQ.Party.make("silkin", 20));
    MQ.Party.list[0].hp = 0;
    MQ.Shrine.revive();
    MQ.Inventory.addMoney(1000);
    MQ.Inn.sleepTo("night", {});
    const blob = JSON.parse(JSON.stringify(MQ.Shrine.saveProvider.save()));
    MQ.Shrine.saveProvider.load(null);
    assert.strictEqual(MQ.Shrine.usedToday(), false);
    MQ.Shrine.saveProvider.load(blob);
    assert.strictEqual(MQ.Shrine.usedToday(), true);
    assert.strictEqual(MQ.Inn.state.sleeps, 1);
  });

  // ---------------------------------------------------------------
  // The shared kit
  // ---------------------------------------------------------------
  t("MQ.Activities degrades when the systems it leans on are absent", function () {
    const MQ = boot().MQ;
    const A = MQ.Activities;
    const inv = MQ.Inventory, party = MQ.Party;
    MQ.Inventory = undefined; MQ.Party = undefined;
    try {
      assert.strictEqual(A.money(), 0);
      assert.strictEqual(A.count("salve"), 0);
      A.give("salve", 2);
      assert.strictEqual(A.count("salve"), 2, "falls back to the item_<id> flag counter");
      assert.strictEqual(A.take("salve", 5), false);
      assert.strictEqual(A.take("salve", 2), true);
      assert.strictEqual(A.party().length, 0);
      assert.strictEqual(A.partyLevel(), 5);
      assert.ok(A.m().w > 0, "metrics still come out");
    } finally { MQ.Inventory = inv; MQ.Party = party; }
  });

  t("every activity registers a save provider under its own key", function () {
    const MQ = boot().MQ;
    const pairs = [["Fishing", "fishing"], ["Brewing", "brewing"], ["Arena", "arena"], ["Bounties", "bounties"],
      ["Minigames", "minigames"], ["Photo", "photo"], ["Rematch", "rematch"], ["Shrine", "shrine"]];
    for (let i = 0; i < pairs.length; i++) {
      const sys = MQ[pairs[i][0]];
      assert.ok(sys, pairs[i][0] + " exists");
      assert.strictEqual(sys.saveKey, pairs[i][1]);
      assert.strictEqual(typeof sys.saveProvider.save, "function");
      assert.strictEqual(typeof sys.saveProvider.load, "function");
      const blob = sys.saveProvider.save();
      assert.strictEqual(typeof blob, "object");
      JSON.stringify(blob);                       // must be serialisable
      sys.saveProvider.load(undefined);           // a new game must not throw
    }
  });

  t("every system MQ.Interact reaches for exists with the spelling it uses", function () {
    const MQ = boot().MQ;
    assert.strictEqual(typeof MQ.Fishing.start, "function");
    assert.strictEqual(typeof MQ.Brewing.start, "function");
    assert.strictEqual(typeof MQ.Minigames.start, "function");
    assert.strictEqual(typeof MQ.Bounties.open, "function");
    assert.strictEqual(typeof MQ.Rematches.offer, "function", "MQ.Interact spells it Rematches");
    assert.strictEqual(MQ.Rematches, MQ.Rematch);
    assert.strictEqual(typeof MQ.Inn.sleep, "function");
    assert.strictEqual(typeof MQ.Arena.start, "function");
    assert.strictEqual(typeof MQ.Photo.start, "function");
    assert.strictEqual(typeof MQ.Shrine.use, "function");
  });
};
