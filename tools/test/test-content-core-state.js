"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const Party = MQ.Party, Inv = MQ.Inventory, Tr = MQ.Trainer, St = MQ.Settings;

  // A tiny species/item set so the content layer has something real to chew.
  MQ.Data.define("species", "silkin", { name: "SILKIN", types: ["bug", "grass"], habitat: "silk", growth: "medium", base: { hp: 45, atk: 40, def: 40, spa: 50, spd: 45, spe: 35 }, abilities: ["silk_weave"], learnset: [[1, "tackle"], [8, "silk_wrapper"]], evolutions: [{ to: "spindrake", method: "level", level: 16 }] });
  MQ.Data.define("species", "brinewt", { name: "BRINEWT", types: ["water"], habitat: "brine", growth: "medium", base: { hp: 50, atk: 42, def: 44, spa: 46, spd: 46, spe: 32 }, abilities: ["brine_body"], learnset: [[1, "tackle"]] });
  MQ.Data.define("species", "saltling", { name: "SALTLING", types: ["rock"], habitat: "salt", growth: "fast", base: { hp: 40, atk: 45, def: 55, spa: 30, spd: 35, spe: 25 }, abilities: ["salt_crust"], learnset: [[1, "tackle"]] });
  MQ.Data.define("species", "meadow", { name: "MEADOW", types: ["normal"], habitat: "town", growth: "medium", base: { hp: 50, atk: 55, def: 40, spa: 40, spd: 45, spe: 95 }, abilities: ["slipstream"], learnset: [[1, "tackle"]] });
  MQ.Data.define("species", "bigboy", { name: "BIGBOY", types: ["normal"], habitat: "town", growth: "medium", base: { hp: 90, atk: 70, def: 70, spa: 40, spd: 60, spe: 25 }, abilities: ["back_from_the_brink"], learnset: [[1, "tackle"]] });
  MQ.Data.define("moves", "tackle", { name: "Tackle", type: "normal", cat: "phys", power: 40, acc: 100, pp: 30 });
  MQ.Data.define("moves", "silk_wrapper", { name: "Silk Wrapper", type: "bug", cat: "status", pp: 20 });
  MQ.Data.define("items", "silk_wrap", { name: "Silk Wrap", kind: "gear", price: 0 });
  MQ.Data.define("items", "silk_cocoon", { name: "Silk Cocoon", kind: "evo", price: 0 });

  t("Party.make builds a well-formed instance from species data", function () {
    const m = Party.make("silkin", 10);
    assert.ok(m.uid, "has a uid");
    assert.strictEqual(m.species, "silkin");
    assert.strictEqual(m.level, 10);
    assert.ok(m.stats.hp > 20 && m.stats.hp < 100, "hp in a sane band, got " + m.stats.hp);
    assert.strictEqual(m.hp, m.stats.hp);
    assert.strictEqual(m.moves.length, 2, "learnt both level-<=10 moves");
    assert.strictEqual(m.moves[0].pp, 30);
    assert.strictEqual(m.status, null);
  });

  t("party caps at six and overflow goes to the box", function () {
    Party.saveProvider.load(null);
    for (let i = 0; i < 6; i++) assert.strictEqual(Party.add(Party.make("silkin", 5)), "party");
    assert.strictEqual(Party.list.length, 6);
    assert.strictEqual(Party.isFull(), true);
    assert.strictEqual(Party.add(Party.make("brinewt", 5)), "box");
    assert.strictEqual(Party.boxCount(), 1);
    assert.strictEqual(Party.total(), 7);
  });

  t("uid lookup finds monsters in the party and in the box", function () {
    const boxed = Party.box[0][0];
    assert.ok(Party.get(boxed.uid), "found the boxed one");
    assert.strictEqual(Party.get(boxed.uid).species, "brinewt");
    assert.strictEqual(Party.indexOf(boxed.uid), -1, "not in the party list");
    assert.strictEqual(Party.get("nope"), null);
  });

  t("swap, deposit and withdraw move monsters about", function () {
    const a = Party.list[0].uid, b = Party.list[1].uid;
    assert.strictEqual(Party.swap(0, 1), true);
    assert.strictEqual(Party.list[0].uid, b);
    assert.strictEqual(Party.list[1].uid, a);
    assert.strictEqual(Party.deposit(Party.list[5].uid), true);
    assert.strictEqual(Party.list.length, 5);
    assert.strictEqual(Party.withdraw(0, 0), true);
    assert.strictEqual(Party.list.length, 6);
  });

  t("cats never leave the party and can be benched instead", function () {
    Party.saveProvider.load(null);
    const cat = Party.make("meadow", 5);
    Party.add(cat);
    assert.strictEqual(Party.isCat(cat), true);
    assert.strictEqual(Party.remove(cat.uid), null, "remove refuses a cat");
    assert.strictEqual(Party.deposit(cat.uid), false, "deposit refuses a cat");
    assert.strictEqual(Party.addBox(cat), null, "addBox refuses a cat");
    assert.strictEqual(Party.reserve(cat.uid, true), true);
    assert.strictEqual(Party.active().length, 0, "benched cat does not fight");
    Party.add(Party.make("silkin", 5));
    assert.strictEqual(Party.active().length, 1);
    Party.reserve(cat.uid, false);
    assert.strictEqual(Party.active().length, 2);
  });

  t("heal / alive / has / first behave", function () {
    Party.saveProvider.load(null);
    const a = Party.make("silkin", 10), b = Party.make("brinewt", 10);
    Party.add(a); Party.add(b);
    assert.strictEqual(Party.first().uid, a.uid);
    assert.strictEqual(Party.has("brinewt"), true);
    assert.strictEqual(Party.has("saltling"), false);
    Party.damage(a, 9999);
    assert.strictEqual(a.hp, 0);
    assert.strictEqual(Party.alive().length, 1);
    assert.strictEqual(Party.firstAlive().uid, b.uid);
    a.status = "brn"; b.moves[0].pp = 1;
    Party.heal();
    assert.strictEqual(a.hp, a.stats.hp);
    assert.strictEqual(a.status, null);
    assert.strictEqual(b.moves[0].pp, b.moves[0].ppMax);
    assert.strictEqual(Party.wiped(), false);
  });

  t("party save provider round-trips party and box", function () {
    Party.saveProvider.load(null);
    Party.add(Party.make("silkin", 12, { nickname: "Bobbin" }));
    Party.addBox(Party.make("brinewt", 7));
    Party.renameBox(0, "Salt");
    const snap = Party.saveProvider.save();
    Party.saveProvider.load(null);
    assert.strictEqual(Party.list.length, 0);
    Party.saveProvider.load(snap);
    assert.strictEqual(Party.list.length, 1);
    assert.strictEqual(Party.list[0].nickname, "Bobbin");
    assert.strictEqual(Party.box[0].length, 1);
    assert.strictEqual(Party.boxNames[0], "Salt");
  });

  // ---- Inventory ---------------------------------------------------
  t("bag sorts items into pockets by item kind", function () {
    Inv.saveProvider.load(null);
    Inv.add("salve", 3, { toast: false });
    Inv.add("capsule_basic", 5, { toast: false });
    Inv.add("silk_wrap", 1, { toast: false });
    Inv.add("blackberry", 2, { toast: false });
    Inv.add("casebook", 1, { toast: false });
    assert.strictEqual(Inv.count("salve"), 3);
    assert.strictEqual(Inv.has("salve", 3), true);
    assert.strictEqual(Inv.has("salve", 4), false);
    assert.strictEqual(Inv.pocketOf("salve"), "medicine");
    assert.strictEqual(Inv.pocketOf("capsule_basic"), "capsules");
    assert.strictEqual(Inv.pocketOf("silk_wrap"), "gear");
    assert.strictEqual(Inv.pocketOf("casebook"), "key");
    assert.strictEqual(Inv.pocket("medicine").length, 1);
    assert.strictEqual(Inv.keyItems().length, 1);
  });

  t("key items never stack past one", function () {
    Inv.add("casebook", 4, { toast: false });
    assert.strictEqual(Inv.count("casebook"), 1);
  });

  t("remove refuses to go negative", function () {
    assert.strictEqual(Inv.remove("salve", 99), false);
    assert.strictEqual(Inv.count("salve"), 3);
    assert.strictEqual(Inv.remove("salve", 3), true);
    assert.strictEqual(Inv.count("salve"), 0);
    assert.strictEqual(Inv.pocket("medicine").length, 0);
  });

  t("money, Marks and Chips are separate purses", function () {
    Inv.money = 0; Inv.marks = 0; Inv.chips = 0;
    Inv.addMoney(1000, { prize: false });
    assert.strictEqual(Inv.money, 1000);
    assert.strictEqual(Inv.spend(1500), false);
    assert.strictEqual(Inv.spend(400), true);
    assert.strictEqual(Inv.money, 600);
    Inv.addMarks(5); Inv.addChips(3);
    assert.strictEqual(Inv.spendMarks(6), false);
    assert.strictEqual(Inv.spendMarks(5), true);
    assert.strictEqual(Inv.chips, 3);
  });

  t("use() heals, cures, revives and refuses the pointless", function () {
    Party.saveProvider.load(null);
    const m = Party.make("silkin", 20);
    Party.add(m);
    Inv.add("tonic", 2, { toast: false });
    let r = Inv.use("tonic", m);
    assert.strictEqual(r.ok, false, "full HP: nothing to do");
    Party.damage(m, 40);
    r = Inv.use("tonic", m);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.consumed, true);
    assert.strictEqual(Inv.count("tonic"), 1);
    m.status = "psn";
    Inv.add("antidote", 1, { toast: false });
    r = Inv.use("antidote", m);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(m.status, null);
    Party.damage(m, 9999);
    Inv.add("revive_salts", 1, { toast: false });
    r = Inv.use("revive_salts", m);
    assert.strictEqual(r.ok, true);
    assert.ok(m.hp > 0 && m.hp <= Math.ceil(m.stats.hp / 2));
  });

  t("use() dispatches evolution items, rods, repels and gear", function () {
    Party.saveProvider.load(null);
    Inv.saveProvider.load(null);
    const m = Party.make("silkin", 20);
    Party.add(m);
    let evolved = null;
    MQ.Events.on("evolve", function (d) { evolved = d; });
    Inv.add("silk_cocoon", 1, { toast: false });
    const r = Inv.use("silk_cocoon", m);
    assert.strictEqual(r.ok, false, "silkin evolves by level, not by cocoon");
    MQ.Data.items.silk_cocoon.__override = true;
    MQ.Data.species.silkin.evolutions.push({ to: "loomoth", method: "item", item: "silk_cocoon" });
    assert.strictEqual(Inv.use("silk_cocoon", m).ok, true);
    assert.ok(evolved && evolved.to === "loomoth");

    Inv.add("rod_bamboo", 1, { toast: false });
    assert.strictEqual(Inv.rodTier(), 1);
    Inv.add("rod_carbon", 1, { toast: false });
    assert.strictEqual(Inv.rodTier(), 3);
    Inv.add("rod_bamboo", 1, { toast: false });
    assert.strictEqual(Inv.rodTier(), 3, "a worse rod does not demote you");

    Inv.add("repel_spray", 1, { toast: false });
    Inv.use("repel_spray");
    assert.strictEqual(Inv.repel, 200);
    Inv.stepBuffs(50);
    assert.strictEqual(Inv.repel, 150);

    Inv.add("silk_wrap", 1, { toast: false });
    const g = Inv.use("silk_wrap", m);
    assert.strictEqual(g.ok, true);
    assert.strictEqual(m.gear, "silk_wrap");
    assert.strictEqual(Inv.count("silk_wrap"), 0);
  });

  t("brews apply timed buffs the rest of the game can read", function () {
    Inv.add("brew_hedgerow_cordial", 1, { toast: false });
    assert.strictEqual(Inv.buff("catchMult"), 1);
    assert.strictEqual(Inv.use("brew_hedgerow_cordial").ok, true);
    assert.strictEqual(Inv.buff("catchMult"), 1.3);
    Inv.add("brew_damson_fire", 1, { toast: false });
    Inv.use("brew_damson_fire");
    assert.strictEqual(Inv.buff("fireMult"), 1.2);
    Inv.expireBattleBuffs();
    assert.strictEqual(Inv.buff("fireMult"), 1, "one-battle buffs end with the battle");
    assert.strictEqual(Inv.buff("catchMult"), 1.3, "real-time buffs do not");
  });

  t("capsules refuse to be used outside a battle", function () {
    Inv.add("capsule_basic", 1, { toast: false });
    assert.strictEqual(Inv.use("capsule_basic").ok, false);
    assert.strictEqual(Inv.use("capsule_basic", null, { battle: true }).ok, true);
  });

  t("inventory save provider round-trips", function () {
    Inv.saveProvider.load(null);
    Inv.add("salve", 2, { toast: false });
    Inv.addMoney(500, { prize: false });
    Inv.addMarks(4);
    const snap = Inv.saveProvider.save();
    Inv.saveProvider.load(null);
    assert.strictEqual(Inv.money, 0);
    Inv.saveProvider.load(snap);
    assert.strictEqual(Inv.count("salve"), 2);
    assert.strictEqual(Inv.money, 500);
    assert.strictEqual(Inv.marks, 4);
  });

  // ---- Trainer ------------------------------------------------------
  t("trainer XP levels up and hands out perk points", function () {
    Tr.saveProvider.load(null);
    assert.strictEqual(Tr.level, 1);
    assert.strictEqual(Tr.perkPoints, 1);
    Tr.addXp(15, "test");
    assert.strictEqual(Tr.level, 2);
    assert.strictEqual(Tr.perkPoints, 2);
    Tr.addXp(1000, "test");
    assert.ok(Tr.level > 10, "a big lump levels several times, got " + Tr.level);
    assert.strictEqual(Tr.perkPoints, Tr.level);
  });

  t("stat counters mirror into flags for condition expressions", function () {
    Tr.saveProvider.load(null);
    MQ.Flags.reset();
    Tr.bump("steps", 120);
    assert.strictEqual(Tr.stat("steps"), 120);
    assert.strictEqual(MQ.Flags.get("steps_total"), 120);
    Tr.bump("puppetsBeaten", 3);
    assert.strictEqual(MQ.Flags.test("count_puppets_beaten >= 3"), true);
  });

  t("badges set flags, count, and relabel as SIGNED after pippin_found", function () {
    Tr.saveProvider.load(null);
    MQ.Flags.reset();
    assert.strictEqual(Tr.addBadge("packet"), true);
    assert.strictEqual(Tr.addBadge("badge_packet"), false, "same badge twice does nothing");
    assert.strictEqual(MQ.Flags.get("badge_packet"), true);
    assert.strictEqual(Tr.badgeCount(), 1);
    assert.strictEqual(MQ.Flags.test("badges >= 1"), true);
    assert.strictEqual(Tr.badgeLabel("packet"), "PACKET");
    MQ.Flags.set("pippin_found");
    assert.strictEqual(Tr.badgeLabel("packet"), "SIGNED");
    const rest = ["cipher", "bear", "kernel", "token", "daemon", "proxy", "admin"];
    for (let i = 0; i < rest.length; i++) Tr.addBadge(rest[i]);
    assert.strictEqual(MQ.Flags.get("all_badges"), true);
  });

  t("dex records seen/caught with habitat notes and fires milestones", function () {
    Tr.saveProvider.load(null);
    let milestones = 0;
    MQ.Events.on("dex:milestone", function () { milestones++; });
    assert.strictEqual(Tr.see("silkin", { map: "macclesfield", habitat: "silk", phase: "night" }), true);
    assert.strictEqual(Tr.see("silkin", { map: "bollington", habitat: "silk" }), false, "second sighting is not new");
    assert.strictEqual(Tr.seenCount(), 1);
    assert.strictEqual(Tr.caughtCount(), 0);
    const e = Tr.dexEntry("silkin");
    assert.strictEqual(e.seen, 2);
    assert.ok(e.habitats.silk >= 1);
    assert.ok(Tr.habitatNote("silkin").indexOf("Macclesfield") >= 0 || Tr.habitatNote("silkin").indexOf("macclesfield") >= 0);
    assert.strictEqual(Tr.record("silkin", { map: "macclesfield", level: 4 }), true);
    assert.strictEqual(Tr.caughtCount(), 1);
    assert.strictEqual(Tr.stat("catches"), 1);
    // caught_all fires once every defined species is caught
    const ids = MQ.Data.ids("species");
    for (let i = 0; i < ids.length; i++) Tr.record(ids[i], { map: "test" });
    assert.strictEqual(Tr.caughtCount(), Tr.dexTotal());
    assert.ok(milestones >= 1, "at least the full-dex milestone fired");
    assert.strictEqual(MQ.Flags.get("merlynx_on_press"), true);
  });

  t("casebook rank climbs with closed cases and badges", function () {
    Tr.saveProvider.load(null);
    assert.strictEqual(Tr.rank().id, "probationer");
    Tr.bump("casesClosed", 10);
    assert.strictEqual(Tr.rank().id, "analyst");
    Tr.bump("casesClosed", 25);
    assert.strictEqual(Tr.rank().id, "principal");
  });

  t("trainer save provider round-trips perks, badges, dex and stats", function () {
    Tr.saveProvider.load(null);
    Tr.name = "JIM";
    Tr.addXp(200, "t");
    Tr.addBadge("packet");
    Tr.see("brinewt", { map: "nantwich", habitat: "brine" });
    Tr.bump("steps", 77);
    Tr.buyPerk("perk_triage_focused");
    const snap = Tr.saveProvider.save();
    Tr.saveProvider.load(null);
    assert.strictEqual(Tr.level, 1);
    Tr.saveProvider.load(snap);
    assert.ok(Tr.level > 1);
    assert.strictEqual(Tr.hasBadge("packet"), true);
    assert.strictEqual(Tr.stat("steps"), 77);
    assert.strictEqual(Tr.dexEntry("brinewt").seen, 1);
    assert.strictEqual(Tr.perkRank("perk_triage_focused"), 1);
    assert.strictEqual(Tr.perks.has("perk_triage_focused"), true);
  });

  // ---- Settings -----------------------------------------------------
  t("settings validate, persist to localStorage and apply", function () {
    St.reset();
    assert.strictEqual(St.get("captureMinigame"), false, "capture minigame is off by default");
    assert.strictEqual(St.set("textSpeed", "fast"), true);
    assert.strictEqual(St.set("textSpeed", "warp"), false, "unknown value rejected");
    assert.strictEqual(St.set("nonsense", 1), false, "unknown key rejected");
    assert.strictEqual(St.set("musicVolume", 5), true);
    assert.strictEqual(St.get("musicVolume"), 1, "clamped");
    assert.strictEqual(MQ.Dialog.speed, St.TEXT_SPEED.fast);
    const raw = env.window.localStorage.getItem("mq2_settings");
    assert.ok(raw && JSON.parse(raw).values.textSpeed === "fast");
  });

  t("settings toggle cycles enums and flips booleans", function () {
    St.reset();
    assert.strictEqual(St.toggle("screenShake"), true);
    assert.strictEqual(St.get("screenShake"), false);
    St.set("difficulty", "normal");
    St.toggle("difficulty");
    assert.strictEqual(St.get("difficulty"), "hard");
  });

  t("difficulty rules match SYSTEMS-SPEC 13 and record the lowest tier used", function () {
    St.reset();
    St.set("difficulty", "nightmare");
    assert.strictEqual(St.rules().xpShare, 0.25);
    assert.strictEqual(St.rules().bagLimit, 0);
    St.set("difficulty", "story");
    assert.strictEqual(St.rules().catchMult, 1.3);
    assert.strictEqual(St.lowestDifficultyUsed, "story");
  });

  t("settings save provider round-trips", function () {
    St.reset();
    St.set("battleAnim", "fast");
    const snap = St.saveProvider.save();
    St.reset();
    assert.strictEqual(St.get("battleAnim"), "normal");
    St.saveProvider.load(snap);
    assert.strictEqual(St.get("battleAnim"), "fast");
  });

  t("every content system is registered with MQ.Save", function () {
    const keys = ["party", "inventory", "trainer", "settings", "quests", "achievements", "cats", "daycare"];
    const snap = MQ.Save.snapshot();
    for (let i = 0; i < keys.length; i++) assert.ok(snap.data[keys[i]] !== undefined, "missing save provider: " + keys[i]);
    assert.ok(snap.summary, "summary built without throwing");
  });

  t("a full save/load cycle through MQ.Save restores content state", function () {
    Party.saveProvider.load(null); Inv.saveProvider.load(null); Tr.saveProvider.load(null);
    Party.add(Party.make("silkin", 9, { nickname: "Warp" }));
    Inv.add("elixir", 2, { toast: false });
    Inv.addMoney(2500, { prize: false });
    Tr.addXp(100, "t"); Tr.addBadge("cipher");
    assert.strictEqual(MQ.Save.write(1), true);
    Party.saveProvider.load(null); Inv.saveProvider.load(null); Tr.saveProvider.load(null);
    assert.strictEqual(MQ.Save.load(1), true);
    assert.strictEqual(Party.list.length, 1);
    assert.strictEqual(Party.list[0].nickname, "Warp");
    assert.strictEqual(Inv.count("elixir"), 2);
    assert.strictEqual(Inv.money, 2500);
    assert.strictEqual(Tr.hasBadge("cipher"), true);
  });
};
