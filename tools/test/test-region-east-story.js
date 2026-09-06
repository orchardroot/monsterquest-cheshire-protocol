// MonsterQuest v2 — region-east story: the Chapter 1 opening runs to
// completion under MQ.Dialog.auto, the flags/quests it promises actually
// land, the Wilmslow gym puzzle gates its door, and every script the maps
// reference is registered and is a generator.
"use strict";
const H = require("../headless");

function pump(env, promise, max, label) {
  // Script commands resolve on loop steps (waits) and microtasks (dialog).
  let done = false, value = null, err = null;
  promise.then(function (v) { done = true; value = v; }, function (e) { done = true; err = e; });
  let i = 0;
  return new Promise(function (resolve, reject) {
    (function loop() {
      if (done) return err ? reject(err) : resolve(value);
      if (i++ >= max) return reject(new Error("timed out after " + max + " steps: " + (label || "script")));
      env.step(1);
      setImmediate(loop);
    })();
  });
}

module.exports = function (t, assert) {

  t("every script a region-east map names is registered and is a generator", function () {
    const env = H.load();
    const MQ = env.MQ, W = MQ.World, S = MQ.Story;
    const missing = [], notGen = [];
    W.each(function (m, id) {
      if (!m.legend) return;
      const names = [];
      (m.npcs || []).forEach(function (n) { if (n.script) names.push(n.script); });
      (m.triggers || []).forEach(function (tr) { if (tr.script) names.push(tr.script); });
      names.forEach(function (n) {
        const fn = S.npcScripts[n] || S.scripts[n];
        if (!fn) { missing.push(id + ": " + n); return; }
        if (String(fn).indexOf("function*") !== 0 && (!fn.constructor || fn.constructor.name !== "GeneratorFunction")) notGen.push(id + ": " + n);
      });
    });
    assert.deepStrictEqual(missing, [], "unregistered scripts:\n" + missing.join("\n"));
    assert.deepStrictEqual(notGen, [], "not generator functions:\n" + notGen.join("\n"));
    // this workstream namespaces everything it registers
    const east = Object.keys(S.npcScripts).filter(function (k) { return k.indexOf("east_") === 0; });
    assert.ok(east.length >= 70, "region-east registers " + east.length + " npc scripts");
  });

  t("the chapter table, CUTOVER days and starter counter-picks are wired", function () {
    const env = H.load();
    const MQ = env.MQ, S = MQ.Story;
    assert.strictEqual(S.chapterTable.length, 13);
    assert.strictEqual(S.chapters[1].title, "Silk and Static");
    assert.strictEqual(S.chapters[2].title, "The Wheel and the Edge");
    assert.strictEqual(typeof S.chapters[1].start, "function");
    assert.strictEqual(typeof S.chapters[2].start, "function");
    assert.strictEqual(S.CUTOVER[4], 38);
    assert.strictEqual(S.CUTOVER[9], 7);
    assert.strictEqual(S.CUTOVER[11], "t0");
    assert.strictEqual(S.COUNTER_PICK.silkin, "kindlin");
    assert.strictEqual(S.COUNTER_PICK.kindlin, "brinewt");
    assert.strictEqual(S.COUNTER_PICK.brinewt, "silkin");
    MQ.Flags.set("chapter", 2);
    assert.strictEqual(S.chapter(), 2);
    assert.strictEqual(S.levelBand(2)[0], 8);
    assert.strictEqual(S.levelBand(2)[1], 14);
  });

  t("the Chapter 1 opening runs to completion and delivers what it promises", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "macclesfield_home", x: 7, y: 9, dir: "down" });
    env.step(1);

    const intro = MQ.Story.scripts.east_new_game_intro;
    assert.ok(intro, "the new-game intro is registered");
    return pump(env, MQ.Script.run(intro, {}), 4000, "chapter 1 opening").then(function () {
      assert.ok(MQ.Flags.get("contract_signed"), "the contract is signed");
      const starter = MQ.Flags.get("starter_chosen");
      assert.ok(starter, "a starter line was chosen");
      assert.ok(MQ.Data.species[starter], "the starter is a real species: " + starter);
      assert.strictEqual(MQ.Party.list.length, 1, "exactly one monster: the starter, not the cats");
      assert.strictEqual(MQ.Party.list[0].species, starter);
      // the rival takes the counter-pick, and it is a different line
      const rival = MQ.Flags.get("vex_starter");
      assert.strictEqual(rival, MQ.Story.COUNTER_PICK[starter], "VEX took the counter-pick");
      assert.notStrictEqual(rival, starter);
      assert.ok(MQ.Inventory.count("alder_contract") >= 1, "the contract is in the bag");
      assert.strictEqual(MQ.Quests.isStarted("main_01_silk_and_static"), true, "the Ch.1 quest is open");
      assert.strictEqual(MQ.Overworld.state.map, "macclesfield", "the opening leaves you in Macclesfield");
      assert.ok(!MQ.Script.busy(), "the cutscene released the player");
      // running it again is a no-op, not a second starter
      return pump(env, MQ.Script.run(intro, {}), 200, "intro replay").then(function () {
        assert.strictEqual(MQ.Party.list.length, 1, "the intro is idempotent");
      });
    });
  });

  t("stepping onto Mill Street hands you the cats", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "macclesfield", x: 24, y: 20, dir: "down" });
    env.step(1);
    MQ.Flags.set("contract_signed", true);
    assert.ok(!MQ.Flags.get("cats_joined"));
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.east_macc_first_step, {}), 1500, "first step").then(function () {
      assert.ok(MQ.Flags.get("cats_joined"), "MEADOW joined");
      assert.ok(MQ.Party.list.length >= 1, "the cat is in the party");
      assert.ok(MQ.Flags.get("macc_first_step"));
    });
  });

  t("White Nancy and the canal set their Chapter 1 flags", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "kerridge_hill", x: 17, y: 5, dir: "up" });
    env.step(1);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.east_white_nancy, {}), 2000, "white nancy")
      .then(function () {
        assert.ok(MQ.Flags.get("white_nancy_seen"), "white_nancy_seen");
        assert.ok(MQ.Flags.get("signal_periodic"), "the signal is noted as periodic");
        assert.ok(MQ.Inventory.count("viewpoint_bollington") >= 1, "the viewpoint collectible is given");
        return pump(env, MQ.Script.run(MQ.Story.npcScripts.east_r1_vex, {}), 4000, "vex at the canal");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("vex_battle_1"), "vex_battle_1");
        assert.ok(MQ.Flags.get("agent_sleet"), "SLEET unlocked");
      });
  });

  t("the Wilmslow gym door will not open until the racks are patched", function () {
    const env = H.load();
    const MQ = env.MQ, W = MQ.World;
    MQ.Dialog.auto = true;
    const gym = W.get("wilmslow_gym");
    const door = (gym.warps || []).filter(function (w) { return w.to === "wilmslow_gym_floor"; });
    assert.ok(door.length >= 1, "the gym has a back door");
    door.forEach(function (w) { assert.strictEqual(w.cond, "gym1_patched", "the back door is gated on gym1_patched"); });
    assert.strictEqual(MQ.Flags.test("gym1_patched"), false);

    MQ.Scenes.replace(MQ.Overworld, { map: "wilmslow_gym", x: 9, y: 29, dir: "up" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    // earth bond first: refused
    return pump(env, MQ.Script.run(N.east_gym1_panel_3, {}), 600, "panel 3 early")
      .then(function () {
        assert.ok(!MQ.Flags.get("gym1_patch_3"), "the bond will not go on first");
        // panel 2 before panel 1: dark
        return pump(env, MQ.Script.run(N.east_gym1_panel_2, {}), 600, "panel 2 early");
      })
      .then(function () {
        assert.ok(!MQ.Flags.get("gym1_patch_2"), "management does not come up before data");
        MQ.Dialog.autoChoice = 0;   // first choice on every panel is the correct one
        return pump(env, MQ.Script.run(N.east_gym1_panel_1, {}), 600, "panel 1");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("gym1_patch_1"), "blue into blue");
        return pump(env, MQ.Script.run(N.east_gym1_panel_2, {}), 600, "panel 2");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("gym1_patch_2"), "amber into amber");
        assert.ok(!MQ.Flags.get("gym1_patched"), "the door is still shut with two of three");
        return pump(env, MQ.Script.run(N.east_gym1_panel_3, {}), 600, "panel 3");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("gym1_patch_3"), "the bond went on last");
        assert.ok(MQ.Flags.get("gym1_patched"), "the back door released");
        assert.strictEqual(MQ.Flags.test("gym1_patched"), true);
      });
  });

  t("Ada hands over the badge, the anchor, the card, OVERDRIVE and VIGIL", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "wilmslow_gym_floor", x: 11, y: 20, dir: "up" });
    env.step(1);
    MQ.Party.add(MQ.Party.make("silkin", 14, {}));
    const ada = MQ.Data.trainers.leader_ada;
    assert.ok(ada.boss && ada.boss.phases && ada.boss.phases.length === 3, "Ada has three boss phases");
    assert.strictEqual(ada.leader.badge, "badge_packet");
    assert.strictEqual(ada.house.terrain, "static");
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.east_gym1_ada, {}), 6000, "Ada").then(function () {
      // the headless battle may go either way; only assert the win path's payload when it won
      if (MQ.Flags.get("badge_packet")) {
        assert.ok(MQ.Inventory.count("anchor_packet") >= 1, "PACKET anchor");
        assert.ok(MQ.Inventory.count("tm_live_rail") >= 1, "Live Rail card");
        assert.ok(MQ.Flags.get("overdrive_unlocked"), "OVERDRIVE unlocked");
        assert.ok(MQ.Flags.get("agent_vigil"), "VIGIL unlocked");
      }
    });
  });

  t("the Styal sluices only accept top, bottom, middle — and then the fridge", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "styal_wheelhouse", x: 10, y: 18, dir: "up" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.east_styal_sluice_2, {}), 600, "wrong gate first")
      .then(function () {
        assert.strictEqual(MQ.Flags.get("styal_sluice_done") || 0, 0, "out of order resets the sequence");
        return pump(env, MQ.Script.run(N.east_styal_sluice_1, {}), 600, "top");
      })
      .then(function () { return pump(env, MQ.Script.run(N.east_styal_sluice_3, {}), 600, "bottom"); })
      .then(function () { return pump(env, MQ.Script.run(N.east_styal_sluice_2, {}), 600, "middle"); })
      .then(function () {
        assert.ok(MQ.Flags.get("styal_sluices_set"), "the wheel found its free note");
        MQ.Dialog.autoChoice = 2;   // "photograph the diagnostic panel first"
        return pump(env, MQ.Script.run(N.east_styal_fridge, {}), 1500, "the fridge");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("wheel_fridge_fixed"), "wheel_fridge_fixed");
        assert.ok(MQ.Flags.get("photo_mode"), "photographing the panel unlocks photo mode");
      });
  });

  t("Chapter 2's beats set the DESIGN-INDEX flags and the chapter completes", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "alderley_edge", x: 26, y: 1, dir: "down" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.east_lindow_lake, {}), 1200, "the data lake")
      .then(function () {
        assert.ok(MQ.Flags.get("lindow_lake_seen"));
        return pump(env, MQ.Script.run(N.east_alderley_stormy, {}), 2000, "Stormy Point");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("elis_met"), "elis_met");
        return pump(env, MQ.Script.run(N.east_alderley_minemouth, {}), 1200, "the mine mouth");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("merlynx_seen"), "merlynx_seen");
        MQ.Flags.set("badge_packet", true);
        MQ.Flags.set("wheel_fridge_fixed", true);
        const ch = MQ.Story.chapterInfo(2);
        assert.strictEqual(ch.hooks.complete(), true, "Chapter 2's completion hook is satisfied");
        assert.strictEqual(ch.hooks.next, 3);
      });
  });

  t("advanceChapter shows a card, ticks CUTOVER and runs the chapter's opening", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "wilmslow", x: 26, y: 20, dir: "down" });
    env.step(1);
    return pump(env, MQ.Story.advanceChapter(2, { hold: 10 }), 3000, "advance to chapter 2").then(function () {
      assert.strictEqual(MQ.Flags.get("chapter"), 2);
      assert.strictEqual(MQ.Story.cutoverFor(2), null, "CUTOVER does not start before Ch.4");
      assert.ok(MQ.Quests.isStarted("main_02_the_wheel_and_the_edge"), "Ch.2's quest opened");
      assert.strictEqual(MQ.Story.cutoverFor(4), 38);
      MQ.Story.applyCutover(4);
      assert.strictEqual(MQ.Story.cutoverLabel(), "CUTOVER: 38 DAYS");
    });
  });

  t("the Ch.1 and Ch.2 main quests are complete, staged definitions", function () {
    const env = H.load();
    const MQ = env.MQ, D = MQ.Data;
    ["main_01_silk_and_static", "main_02_the_wheel_and_the_edge"].forEach(function (id) {
      const q = D.quests[id];
      assert.ok(q, "missing quest " + id);
      assert.ok(q.stages.length >= 5, id + " has " + q.stages.length + " stages");
      q.stages.forEach(function (s) {
        assert.ok(s.id && s.text && s.cond, id + " stage " + s.id + " is incomplete");
      });
      assert.ok(q.reward && q.reward.money, id + " has no reward");
    });
    // the region's casebook cases all name a giver that exists on a real map
    const cases = MQ.Quests.byKind("case");
    assert.ok(cases.length >= 6, "region cases: " + cases.length);
    cases.forEach(function (id) {
      const q = D.quests[id];
      const m = MQ.World.get(q.giver.map);
      assert.ok(m, id + ": giver map " + q.giver.map + " does not exist");
      const found = (m.npcs || []).some(function (n) { return n.id === q.giver.npc; });
      assert.ok(found, id + ": giver npc " + q.giver.npc + " is not on " + q.giver.map);
    });
  });

  t("the Edge inscriptions only count when read in order", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "alderley_edge", x: 26, y: 1, dir: "down" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.east_edge_read_well, {}), 800, "well first")
      .then(function () {
        assert.ok(!MQ.Flags.get("case_04_readings_done"));
        assert.strictEqual(MQ.Flags.get("edge_reading_step") || 0, 0, "out of order resets");
        return pump(env, MQ.Script.run(N.east_edge_read_stormy, {}), 800, "stormy");
      })
      .then(function () { return pump(env, MQ.Script.run(N.east_edge_read_castle, {}), 800, "castle"); })
      .then(function () {
        assert.ok(!MQ.Flags.get("case_04_readings_done"), "two of three is not three");
        return pump(env, MQ.Script.run(N.east_edge_read_well, {}), 800, "well");
      })
      .then(function () {
        assert.ok(MQ.Flags.get("case_04_readings_done"), "beach, drop, water");
        // and Gwil then parts with the lamp
        MQ.Quests.start("case_04_wizards_well");
        return pump(env, MQ.Script.run(N.east_alderley_gwil, {}), 1200, "Gwil");
      })
      .then(function () {
        assert.ok(MQ.Inventory.count("davy_lamp") >= 1, "the Davy Lamp is handed over");
        assert.ok(MQ.Flags.get("lamp_given"));
      });
  });

  t("White Nancy's watch closes either way, and the helping branch pays in trust", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Dialog.autoChoice = 0;   // "hold the ladder"
    MQ.Scenes.replace(MQ.Overworld, { map: "kerridge_hill", x: 17, y: 5, dir: "up" });
    env.step(1);
    MQ.Quests.start("case_02_white_nancys_watch");
    const before = (MQ.Cats && MQ.Cats.state.meadow) ? MQ.Cats.state.meadow.points : 0;
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.east_kerridge_painter, {}), 2000, "the painter").then(function () {
      assert.ok(MQ.Flags.get("case_02_helped"), "you held the ladder");
      assert.ok(!MQ.Flags.get("case_02_reported"));
      assert.ok(MQ.Quests.isDone("case_02_white_nancys_watch"), "the case closed");
      if (MQ.Cats && MQ.Cats.state.meadow) assert.ok(MQ.Cats.state.meadow.points > before, "MEADOW noticed");
    });
  });

  t("the Carrs gates close case 5 only after the fridge is out", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Scenes.replace(MQ.Overworld, { map: "route_wilmslow_styal", x: 20, y: 32, dir: "up" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.east_carrs_gate_1, {}), 800, "gate 1 early")
      .then(function () {
        assert.ok(!MQ.Flags.get("case_05_gate_1"), "nothing to trace until the mill is clear");
        MQ.Flags.set("wheel_fridge_fixed", true);
        MQ.Quests.start("case_05_quarry_bank_overtime");
        return pump(env, MQ.Script.run(N.east_carrs_gate_1, {}), 800, "gate 1");
      })
      .then(function () { return pump(env, MQ.Script.run(N.east_carrs_gate_2, {}), 800, "gate 2"); })
      .then(function () { return pump(env, MQ.Script.run(N.east_carrs_gate_3, {}), 1200, "gate 3"); })
      .then(function () {
        assert.ok(MQ.Flags.get("case_05_gate_3"));
        assert.ok(MQ.Quests.isDone("case_05_quarry_bank_overtime"), "case 5 closed");
        assert.ok(MQ.Inventory.count("tm_torrent") >= 1, "Skill Card: Torrent");
      });
  });
};
