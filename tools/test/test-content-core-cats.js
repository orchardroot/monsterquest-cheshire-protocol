"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const C = MQ.Cats, D = MQ.Daycare, Party = MQ.Party, Inv = MQ.Inventory, Tr = MQ.Trainer;

  MQ.Data.define("species", "meadow", { name: "MEADOW", types: ["normal"], habitat: "town", growth: "medium", base: { hp: 50, atk: 55, def: 40, spa: 40, spd: 45, spe: 95 }, abilities: ["slipstream"], learnset: [[1, "tackle"]] });
  MQ.Data.define("species", "bigboy", { name: "BIGBOY", types: ["normal"], habitat: "town", growth: "medium", base: { hp: 90, atk: 70, def: 70, spa: 40, spd: 60, spe: 25 }, abilities: ["back_from_the_brink"], learnset: [[1, "tackle"]] });
  MQ.Data.define("species", "silkin", { name: "SILKIN", types: ["bug", "grass"], habitat: "silk", growth: "medium", base: { hp: 45, atk: 40, def: 40, spa: 50, spd: 45, spe: 35 }, abilities: ["silk_weave"], learnset: [[1, "tackle"], [7, "silk_wrapper"], [9, "gust"]] });
  MQ.Data.define("moves", "tackle", { name: "Tackle", type: "normal", cat: "phys", power: 40, acc: 100, pp: 30 });
  MQ.Data.define("moves", "silk_wrapper", { name: "Silk Wrapper", type: "bug", cat: "status", pp: 20 });
  MQ.Data.define("moves", "gust", { name: "Gust", type: "flying", cat: "spec", power: 40, pp: 25 });
  MQ.Data.define("encounters", "macc_grass", { zone: "grass", rate: 0.12, table: [{ species: "silkin", min: 3, max: 6, w: 30 }, { species: "meadow", min: 3, max: 5, w: 5 }] });

  MQ.World.defineMap("test_field", {
    name: "Test Field", region: "east", outdoor: true,
    legend: { ".": "grass", "T": "tree_oak" },
    layers: { ground: ["....", "..T.", "....", "...."] },
    items: [{ x: 2, y: 0, item: "salve", n: 1, hidden: true, flag: "item_test_field_1" }, { x: 3, y: 3, item: "sloe", n: 1, flag: "item_test_field_2" }],
    encounters: { grass: "macc_grass" },
    spawnPoint: { x: 0, y: 0 }
  });

  function fresh() {
    C.saveProvider.load(null);
    D.saveProvider.load(null);
    Party.saveProvider.load(null);
    Inv.saveProvider.load(null);
    Tr.saveProvider.load(null);
    MQ.Flags.reset();
  }

  t("unlocking the cats puts both in the party and grants squeeze", function () {
    fresh();
    assert.strictEqual(C.unlocked(), false);
    assert.strictEqual(C.follow("meadow"), false, "cannot follow before they join");
    assert.strictEqual(C.unlock(), true);
    assert.strictEqual(MQ.Flags.get("cats_joined"), true);
    assert.strictEqual(Party.has("meadow"), true);
    assert.strictEqual(Party.has("bigboy"), true);
    assert.strictEqual(C.following, "meadow");
    assert.strictEqual(C.unlock(), false, "only once");
  });

  t("whistling swaps which cat is walking with you", function () {
    assert.strictEqual(C.whistle(), "bigboy");
    assert.strictEqual(C.follower().name, "BIGBOY");
    assert.strictEqual(C.whistle(), "meadow");
    C.stopFollowing();
    assert.strictEqual(C.following, null);
    C.follow("meadow");
  });

  t("trust climbs through thresholds and mirrors into a flag", function () {
    fresh(); C.unlock();
    assert.strictEqual(C.trust("meadow"), 0);
    C.addTrust("meadow", 4, "test");
    assert.strictEqual(C.trust("meadow"), 0, "four points is not a level");
    C.addTrust("meadow", 1, "test");
    assert.strictEqual(C.trust("meadow"), 1);
    assert.strictEqual(MQ.Flags.get("trust_meadow"), 1);
    assert.strictEqual(C.sniffRange("meadow"), 5, "T1 widens the nose");
    assert.strictEqual(C.canHoldItem("meadow"), false);
    C.setTrust("meadow", 5);
    assert.strictEqual(C.trust("meadow"), 5);
    assert.strictEqual(C.canHoldItem("meadow"), true);
    assert.strictEqual(C.canDispatch("meadow"), true);
    assert.strictEqual(C.allowedInGyms("meadow"), true);
    assert.strictEqual(C.trust("bigboy"), 0, "trust is per cat");
  });

  t("Cat Handler multiplies trust gain", function () {
    fresh(); C.unlock();
    C.addTrust("bigboy", 4, "test");
    assert.strictEqual(C.points("bigboy"), 4);
    Tr.level = 45; Tr.perkPoints = 20;
    for (let i = 0; i < 8; i++) Tr.buyPerk(MQ.Progression.branch("escalate")[i].id);
    assert.strictEqual(MQ.Progression.trustGainMult(), 1.5);
    C.addTrust("bigboy", 4, "test");
    assert.strictEqual(C.points("bigboy"), 10, "4 + round(4 * 1.5)");
  });

  t("winning with a cat in the fight builds trust", function () {
    fresh(); C.unlock();
    const cat = C.monster("bigboy");
    assert.ok(cat);
    MQ.Events.emit("battle:end", { outcome: "win", participants: [cat] });
    assert.strictEqual(C.points("bigboy"), 2);
    assert.strictEqual(C.points("meadow"), 0);
    MQ.Events.emit("battle:end", { outcome: "lose", participants: [cat] });
    assert.strictEqual(C.points("bigboy"), 2, "losing teaches nothing");
  });

  t("a Cat's Cup counts once a day", function () {
    fresh(); C.unlock();
    assert.strictEqual(C.feed("meadow", "brew_cats_cup"), true);
    assert.strictEqual(C.points("meadow"), 6);
    assert.strictEqual(C.feed("meadow", "brew_cats_cup"), false, "one a day");
    assert.strictEqual(C.feed("meadow", "roe"), true, "fish is always welcome");
    assert.strictEqual(C.points("meadow"), 8);
  });

  t("MEADOW sniffs out hidden items and emits cat:sniff with the tile", function () {
    fresh(); C.unlock(); C.follow("meadow");
    let sniffed = null;
    MQ.Events.on("cat:sniff", function (d) { sniffed = d; });
    const hit = C.scan("test_field", 0, 0);
    assert.ok(hit, "found something within three tiles");
    assert.strictEqual(hit.kind, "hidden");
    assert.strictEqual(hit.tile.x, 2);
    assert.strictEqual(hit.tile.y, 0);
    assert.strictEqual(hit.item, "salve");
    assert.ok(sniffed && sniffed.tile.x === 2);
    assert.strictEqual(C.scan("test_field", 0, 0), null, "one paw-print per find");
  });

  t("already-collected pickups are not sniffed out again", function () {
    fresh(); C.unlock(); C.follow("meadow");
    MQ.Flags.set("item_test_field_1");
    MQ.Flags.set("item_test_field_2");
    assert.strictEqual(C.scan("test_field", 0, 0), null);
  });

  t("BIGBOY reads the grass instead, and tapping him reveals it", function () {
    fresh(); C.unlock(); C.follow("bigboy");
    const hit = C.scan("test_field", 1, 1);
    assert.ok(hit);
    assert.strictEqual(hit.kind, "creature");
    assert.strictEqual(hit.table, "macc_grass");
    assert.strictEqual(hit.chances[0].species, "silkin");
    const revealed = C.reveal();
    assert.strictEqual(revealed, hit);
    assert.strictEqual(C.points("bigboy"), 1, "a reveal is worth a point");
  });

  // C.sendThrough({battle:true}) rolls Math.random() against a trust-scaled
  // chance that caps at 0.95, so asserting "trust 5 wins" lost about one run
  // in twenty. Pin the roll instead: the point of the test is the plumbing
  // either side of the scrap, and both outcomes are now covered.
  function withRoll(value, fn) {
    const real = Math.random;
    Math.random = function () { return value; };
    const done = function () { Math.random = real; };
    let out;
    try { out = fn(); }
    catch (e) { done(); throw e; }
    return (out && typeof out.then === "function") ? out.then(function (v) { done(); return v; }, function (e) { done(); throw e; }) : (done(), out);
  }

  t("cat-only paths need the squeeze ability and can auto-resolve a scrap", function () {
    fresh(); C.unlock(); C.follow("meadow");
    C.setTrust("meadow", 5);
    return withRoll(0, function () {
      return C.sendThrough({ item: "salve", n: 2, flag: "cat_gap_1", battle: true });
    }).then(function (r) {
      assert.strictEqual(r.ok, true, "trust 5 wins the little fight");
      assert.strictEqual(r.battle.won, true);
      assert.ok(r.battle.chance > 0.9, "trust 5 is a 95% cat");
      assert.strictEqual(Inv.count("salve"), 2);
      assert.strictEqual(MQ.Flags.get("cat_gap_1"), true);
      C.stopFollowing();
      return C.sendThrough({ item: "salve" });
    }).then(function (r2) {
      assert.strictEqual(r2.ok, false, "no cat, no gap");
    });
  });

  t("a cat that loses the scrap comes back with nothing", function () {
    fresh(); C.unlock(); C.follow("meadow");
    C.setTrust("meadow", 0);
    const before = C.points("meadow");
    return withRoll(0.999, function () {
      return C.sendThrough({ item: "salve", n: 2, flag: "cat_gap_2", battle: true });
    }).then(function (r) {
      assert.strictEqual(r.ok, false, "it was bigger than it looked");
      assert.strictEqual(r.battle.won, false);
      assert.strictEqual(Inv.count("salve"), 0, "no loot for a loss");
      assert.strictEqual(MQ.Flags.get("cat_gap_2"), undefined, "and no flag");
      assert.strictEqual(C.points("meadow"), before, "and no trust");
    });
  });

  t("rest points fire once and are worth real trust", function () {
    fresh(); C.unlock(); C.follow("bigboy");
    const rp = C.rest("kerridge_hill");
    assert.ok(rp);
    assert.strictEqual(MQ.Flags.get("bigboy_sat_kerridge"), true);
    assert.strictEqual(C.points("bigboy"), 4);
    assert.strictEqual(C.rest("kerridge_hill"), null, "only the first time");
    assert.strictEqual(C.rest("tatton_park") !== null, true);
    assert.strictEqual(C.restsFound(), 2);
    C.follow("meadow");
    assert.strictEqual(C.rest("frodsham_hill"), null, "it is BIGBOY's bench");
  });

  t("daily gifts arrive once per real day", function () {
    fresh(); C.unlock();
    assert.strictEqual(C.giftReady("meadow"), true);
    const got = C.collectGift("meadow");
    assert.ok(got, "a gift was handed over");
    assert.strictEqual(Inv.count(got), 1);
    assert.strictEqual(C.giftReady("meadow"), false);
    assert.strictEqual(C.collectGift("meadow"), null);
    assert.strictEqual(C.giftReady("bigboy"), true, "the other cat has its own day");
  });

  t("collars unlock from flags and tokens", function () {
    fresh(); C.unlock();
    assert.strictEqual(C.ownsCollar("collar_silk"), false);
    assert.strictEqual(C.setCollar("meadow", "collar_silk"), false);
    MQ.Flags.set("case_01_silk_thread");
    assert.strictEqual(C.ownsCollar("collar_silk"), true);
    assert.strictEqual(C.setCollar("meadow", "collar_silk"), true);
    assert.strictEqual(C.collar("meadow"), "collar_silk");
    Inv.add("cat_token_1", 1, { toast: false });
    assert.strictEqual(C.ownsCollar("collar_bell"), true);
  });

  t("battleData carries everything the battle engine needs", function () {
    fresh(); C.unlock();
    let d = C.battleData("bigboy");
    assert.strictEqual(d.species, "bigboy");
    assert.strictEqual(d.ability, "back_from_the_brink");
    assert.strictEqual(d.overdrive, "brink_roar");
    assert.strictEqual(d.extraMove, null);
    assert.strictEqual(d.brinkHeals, 0);
    assert.strictEqual(d.brinkUses, 1);
    C.setTrust("bigboy", 5);
    MQ.Flags.set("bigboy_shield");
    d = C.battleData("bigboy");
    assert.strictEqual(d.extraMove, "big_sit");
    assert.strictEqual(d.brinkHeals, 0.25);
    assert.strictEqual(d.brinkShield, true);
    const m = C.battleData("meadow");
    assert.strictEqual(m.overdrive, "zoomies");
    assert.strictEqual(m.dodgeFirstHit, false);
    C.setTrust("meadow", 3);
    assert.strictEqual(C.battleData("meadow").dodgeFirstHit, true);
    assert.strictEqual(C.battleData("meadow").extraMove, null, "Skitter waits for trust 5");
  });

  t("dispatching a cat runs on a real-time timer", function () {
    fresh(); C.unlock();
    assert.strictEqual(C.dispatch("meadow", "gather", 10).ok, false, "trust 4 required");
    C.setTrust("meadow", 4);
    const r = C.dispatch("meadow", "gather", 10);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(C.following, "bigboy", "the other cat takes over the walk");
    assert.strictEqual(C.collectDispatch("meadow").ok, false, "still out");
    C.state.meadow.dispatched.until = Date.now() - 1;
    const out = C.collectDispatch("meadow");
    assert.strictEqual(out.ok, true);
    assert.ok(out.items.length >= 1);
  });

  t("cats save provider round-trips trust, collars and follow state", function () {
    fresh(); C.unlock();
    C.setTrust("bigboy", 3);
    C.follow("bigboy");
    MQ.Flags.set("pippin_found");
    C.setCollar("bigboy", "collar_signed");
    const snap = C.saveProvider.save();
    C.saveProvider.load(null);
    assert.strictEqual(C.trust("bigboy"), 0);
    C.saveProvider.load(snap);
    assert.strictEqual(C.trust("bigboy"), 3);
    assert.strictEqual(C.following, "bigboy");
    assert.strictEqual(C.collar("bigboy"), "collar_signed");
  });

  // ---- daycare -------------------------------------------------------
  t("leaving a monster needs a spare and refuses the cats", function () {
    fresh(); C.unlock();
    const cat = C.monster("meadow");
    assert.strictEqual(D.leave(cat.uid).ok, false, "the cats would not stay");
    const m = Party.make("silkin", 8);
    Party.add(m);
    const r = D.leave(m.uid);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.slot, 0);
    assert.strictEqual(Party.get(m.uid), null, "gone from the party");
    assert.strictEqual(D.occupied(), 1);
    assert.strictEqual(D.has(m.uid), 0);
  });

  t("steps grow the monster, and collecting costs credits", function () {
    const p0 = D.preview(0);
    assert.strictEqual(p0.levels, 0);
    assert.strictEqual(p0.cost, D.BASE_FEE);
    MQ.Events.emit("step", { n: 5000 });
    const p1 = D.preview(0);
    assert.ok(p1.levels >= 10, "5,000 steps is a real walk: " + p1.levels);
    assert.strictEqual(p1.cost, D.BASE_FEE + D.FEE_PER_LEVEL * p1.levels);
    assert.strictEqual(D.collect(0).ok, false, "no money");
    Inv.addMoney(p1.cost, { prize: false });
    const r = D.collect(0);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.levels, p1.levels);
    assert.strictEqual(r.mon.level, 8 + p1.levels);
    assert.ok(r.learned.indexOf("gust") >= 0, "it learned Gust on the way");
    assert.ok(r.mon.stats.hp > 30, "stats were recomputed");
    assert.strictEqual(Party.has("silkin"), true);
    assert.strictEqual(D.occupied(), 0);
    assert.strictEqual(Inv.money, 0);
  });

  t("two occupied pens eventually produce an egg", function () {
    fresh();
    const a = Party.make("silkin", 10), b = Party.make("silkin", 12), keep = Party.make("meadow", 5);
    Party.add(keep); Party.add(a); Party.add(b);
    assert.strictEqual(D.leave(a.uid).ok, true);
    assert.strictEqual(D.leave(b.uid).ok, true);
    assert.strictEqual(D.leave(keep.uid).ok, false, "pens are full and it is a cat anyway");
    MQ.Events.emit("step", { n: D.EGG_STEPS });
    assert.ok(D.egg, "an egg appeared");
    assert.strictEqual(D.egg.species, "silkin");
    assert.strictEqual(D.takeEgg().ok, false, "not hatched yet");
    MQ.Events.emit("step", { n: D.egg.need });
    assert.strictEqual(D.eggReady(), true);
    const r = D.takeEgg();
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.mon.level, 5);
    assert.strictEqual(Tr.dexEntry("silkin").caught, 1);
  });

  t("daycare save provider round-trips pens and the egg", function () {
    fresh();
    const m = Party.make("silkin", 6);
    Party.add(Party.make("silkin", 6));
    Party.add(m);
    D.leave(m.uid);
    MQ.Events.emit("step", { n: 600 });
    const snap = D.saveProvider.save();
    D.saveProvider.load(null);
    assert.strictEqual(D.occupied(), 0);
    D.saveProvider.load(snap);
    assert.strictEqual(D.occupied(), 1);
    assert.ok(D.preview(0).levels >= 1);
  });

  t("cats and daycare survive a missing world / party", function () {
    fresh();
    const w = MQ.World, p = MQ.Party;
    MQ.World = null;
    assert.doesNotThrow(function () { C.scan("test_field", 0, 0); });
    MQ.World = w;
    MQ.Party = null;
    assert.doesNotThrow(function () { C.unlock(); C.battleData("meadow"); D.leave("x"); });
    MQ.Party = p;
  });
};
