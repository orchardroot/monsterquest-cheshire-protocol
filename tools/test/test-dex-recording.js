// MonsterQuest v2 — the Field Dex actually fills in.
// MQ.Trainer.see/record existed but only the side activities called them, so a
// whole play-through read "Seen 0 · Caught 0". Sightings now come from the
// encounter roll and catches from the battle result; gifts go in as obtained.
"use strict";
const F = require("./test-battle-fixtures");

function drive(engine, chooser, cap) {
  engine.start();
  let n = 0;
  while (!engine.done && n++ < (cap || 200)) {
    if (engine.waiting || !engine.request) break;
    const res = engine.choose(chooser(engine, n));
    if (res && res.error) throw new Error("choose rejected: " + res.error);
  }
  return engine.result;
}

module.exports = function (t, assert) {
  const env = F.load();
  const MQ = env.MQ, Tr = MQ.Trainer;

  function fresh() {
    Tr.saveProvider.load(null);
    MQ.Party.saveProvider.load(null);
    MQ.Flags.reset();
  }

  t("meeting a wild monster writes it into the dex as seen", function () {
    fresh();
    assert.strictEqual(Tr.seenCount(), 0, "the dex starts empty");
    const map = MQ.World.get("macclesfield");
    assert.ok(map, "the real map is loaded");
    const res = MQ.Encounters.force(map, "grass");
    assert.ok(res && res.species, "the roll produced a monster");
    const e = Tr.dexEntry(res.species);
    assert.ok(e, "the species has a dex entry now");
    assert.strictEqual(e.seen, 1, "seen once");
    assert.strictEqual(e.caught, 0, "…but not caught");
    assert.strictEqual(Tr.seenCount(), 1);
    assert.ok(Tr.habitatNote(res.species).length > 0, "the sighting carries a habitat note");
    // the same result replayed does not count twice
    MQ.Events.emit("encounter", res);
    assert.strictEqual(Tr.dexEntry(res.species).seen, 1, "one sighting per encounter");
  });

  t("a catch in battle writes it into the dex as caught", function () {
    fresh();
    const me = F.mon(MQ, "t_fire", 30, ["t_ember"]);
    const foe = F.mon(MQ, "t_grass", 5, ["t_vine"]);
    foe.hp = 1;
    const engine = MQ.Battle.create({
      kind: "wild", seed: 21, playerParty: [me], enemyParty: [foe],
      rules: { canCatch: true, canRun: true }
    });
    const r = drive(engine, function (e) {
      if (e.request.type === "switch") return 0;
      return { type: "capsule", id: "capsule_root" };
    });
    assert.strictEqual(r.outcome, "catch");
    assert.ok(r.caught && r.caught.species, "the result carries the caught monster");
    const before = Tr.stat ? Tr.stat("catches") : Tr.stats.catches;
    // js/world/interact.js publishes the result exactly like this
    MQ.Events.emit("battle:end", r);
    const e = Tr.dexEntry(r.caught.species);
    assert.ok(e, "caught species is in the dex");
    assert.strictEqual(e.caught, 1, "caught once");
    assert.ok(e.seen >= 1, "a catch implies a sighting");
    assert.strictEqual(Tr.caughtCount(), 1);
    assert.ok(e.firstCaught, "the dex remembers where");
    const after = Tr.stat ? Tr.stat("catches") : Tr.stats.catches;
    assert.strictEqual(after, before + 1, "and it counted as a capture");
    // republishing the same result does not count it twice
    MQ.Events.emit("battle:end", r);
    assert.strictEqual(Tr.dexEntry(r.caught.species).caught, 1, "one catch per battle");
  });

  t("a battle you merely won records no catch", function () {
    fresh();
    MQ.Events.emit("battle:end", { outcome: "win", kind: "wild", caught: null });
    assert.strictEqual(Tr.caughtCount(), 0);
  });

  t("a gifted monster goes in the dex without scoring a capture", function () {
    fresh();
    const before = Tr.stat ? Tr.stat("catches") : Tr.stats.catches;
    return MQ.Script.run(function* (ctx) {
      yield ctx.S.giveMonster({ species: "t_water", level: 5 });
    }).then(function () {
      assert.strictEqual(MQ.Party.list.length, 1, "it joined the party");
      const e = Tr.dexEntry("t_water");
      assert.ok(e, "the gift is in the dex");
      assert.strictEqual(e.caught, 1);
      assert.ok(e.seen >= 1);
      const after = Tr.stat ? Tr.stat("catches") : Tr.stats.catches;
      assert.strictEqual(after, before, "a present is not a capture");
    });
  });

  t("obtained() and record() agree about the count", function () {
    fresh();
    // one monster, one dex entry, whichever door it came through
    assert.strictEqual(Tr.obtained("t_norm", { map: "macclesfield", level: 5 }), true, "new to the dex");
    assert.strictEqual(Tr.dexEntry("t_norm").caught, 1);
    assert.strictEqual(Tr.record("t_norm", { map: "macclesfield", level: 6 }), false, "second one is not new");
    assert.strictEqual(Tr.dexEntry("t_norm").caught, 2, "but it is a second catch");
    assert.strictEqual(Tr.caughtCount(), 1, "the dex still counts species, not heads");
  });
};
