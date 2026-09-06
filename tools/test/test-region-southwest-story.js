// MonsterQuest v2 — region-south-west story: the Chapter 6 opening runs
// to completion under MQ.Dialog.auto, the set-pieces set the flags they
// promise, both halves of the Wipe/Feed choice behave, and the boat-lift
// silence lands the way the choice said it would.
"use strict";
const H = require("../headless");
const scriptList = require("./test-region-southwest").scriptList;

function pump(env, promise, max, label) {
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

function boot(choice) {
  const env = H.load({ files: scriptList() });
  const MQ = env.MQ;
  MQ.Dialog.auto = true;
  MQ.Dialog.autoChoice = choice === undefined ? 0 : choice;
  // Battles are the battle team's problem; here we only care that the
  // scripts around them run and set their flags.
  MQ.Battle.start = function () { return Promise.resolve({ outcome: "win" }); };
  MQ.Scenes.replace(MQ.Overworld, { map: "nantwich", x: 33, y: 26, dir: "down" });
  env.step(1);
  return env;
}
function run(env, name, steps) {
  const MQ = env.MQ;
  const gen = MQ.Story.scripts[name] || MQ.Story.npcScripts[name];
  if (!gen) throw new Error("no script " + name);
  return pump(env, MQ.Script.run(gen, {}), steps || 4000, name);
}

module.exports = function (t, assert) {

  t("every script a region-south-west map names is registered and is a generator", function () {
    const env = H.load({ files: scriptList() });
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
    const sw = Object.keys(S.npcScripts).filter(function (k) { return k.indexOf("sw_") === 0; });
    assert.ok(sw.length >= 90, "region-south-west registers " + sw.length + " npc scripts");
  });

  t("chapters 6 and 7 are on the table with their openings and CUTOVER days", function () {
    const env = H.load({ files: scriptList() });
    const MQ = env.MQ, S = MQ.Story;
    assert.strictEqual(S.chapters[6].title, "Brine and Perry");
    assert.strictEqual(S.chapters[7].title, "Salt");
    assert.strictEqual(typeof S.chapters[6].start, "function");
    assert.strictEqual(typeof S.chapters[7].start, "function");
    assert.strictEqual(S.chapters[6].gym, "badge_token");
    assert.strictEqual(S.chapters[7].gym, "badge_daemon");
    assert.strictEqual(S.CUTOVER[6], 24);
    assert.strictEqual(S.CUTOVER[7], 17);
    assert.strictEqual(S.chapters[6].hooks.next, 7);
    assert.strictEqual(S.chapters[7].hooks.next, 8);
  });

  t("the Chapter 6 opening runs to completion and opens the main quest", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Flags.set("badge_kernel", true);
    return pump(env, MQ.Script.run(MQ.Story.chapters[6].start, {}), 4000, "ch6 opening").then(function () {
      assert.ok(MQ.Flags.get("chapter_6_started"), "the chapter opened");
      assert.ok(MQ.Flags.get("agents_helpful"), "the Trio's helpfulness is established");
      assert.ok(MQ.Quests.stage("main_06_brine_and_perry") >= 0, "the main quest is open");
      // and it is idempotent enough to survive a replay
      return pump(env, MQ.Script.run(MQ.Story.chapters[6].start, {}), 4000, "ch6 replay");
    }).then(function () {
      assert.ok(MQ.Flags.get("chapter_6_started"));
    });
  });

  t("the Chapter 7 opening runs and ticks the CUTOVER counter to 17 days", function () {
    const env = boot(0);
    const MQ = env.MQ;
    return pump(env, MQ.Script.run(MQ.Story.chapters[7].start, {}), 4000, "ch7 opening").then(function () {
      assert.ok(MQ.Flags.get("chapter_7_started"));
      assert.strictEqual(MQ.Flags.get("cutover_days"), 17);
      assert.strictEqual(MQ.Story.cutoverLabel(), "CUTOVER: 17 DAYS");
      assert.ok(MQ.Quests.stage("main_07_salt") >= 0);
    });
  });

  t("the lido: Kellan's stand, and the side-decision both ways", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Flags.set("badge_kernel", true);
    MQ.Quests.start("main_06_brine_and_perry");
    return run(env, "sw_lido_scene").then(function () {
      assert.ok(MQ.Flags.get("lido_battle_done"), "the lido battle resolved");
      MQ.Dialog.autoChoice = 0;               // hand him in
      return run(env, "sw_lido_kellan_after");
    }).then(function () {
      assert.ok(MQ.Flags.get("kellan_handed_in"));
      assert.ok(!MQ.Flags.get("kellan_walked"));
      const env2 = boot(1);                    // walk him
      env2.MQ.Flags.set("lido_battle_done", true);
      env2.MQ.Quests.start("main_06_brine_and_perry");
      return run(env2, "sw_lido_kellan_after").then(function () {
        assert.ok(env2.MQ.Flags.get("kellan_walked"));
        assert.ok(env2.MQ.Flags.get("oracle_pays_in_compute"), "walking him reveals what he is paid in");
      });
    });
  });

  t("Gym 5: the lane keepers open the lock gates, then Nell hands over TOKEN", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Quests.start("main_06_brine_and_perry");
    return run(env, "sw_gym5_lane_1").then(function () {
      assert.ok(!MQ.Flags.get("gym5_gates"), "one lane is not three");
      return run(env, "sw_gym5_lane_2");
    }).then(function () { return run(env, "sw_gym5_lane_3"); }).then(function () {
      assert.ok(MQ.Flags.get("gym5_gates"), "three lanes open the gates");
      assert.strictEqual(MQ.Flags.get("gym5_lanes"), 3);
      return run(env, "sw_nell");
    }).then(function () {
      assert.ok(MQ.Flags.get("badge_token"), "the TOKEN badge is awarded");
      assert.ok(MQ.Inventory.count("tm_brine_jet") >= 1, "and the Skill Card with it");
    });
  });

  t("Y Berllan: the drive, the reveal, and WIPE hardens the Trio", function () {
    const env = boot(0);                       // choice 0 = WIPE
    const MQ = env.MQ;
    MQ.Quests.start("main_06_brine_and_perry");
    return run(env, "sw_berllan_arrival").then(function () {
      assert.ok(MQ.Flags.get("orchard_open"), "the orchard wakes up");
      return run(env, "sw_the_drive", 6000);
    }).then(function () {
      assert.ok(MQ.Flags.get("pippin_found"), "ORACLE is PIPPIN");
      assert.ok(MQ.Flags.get("oracle_is_pippin"));
      assert.ok(MQ.Inventory.count("pippin_drive") >= 1, "the drive is in the bag");
      assert.strictEqual(MQ.Flags.get("choice_agents"), "wipe");
      assert.ok(MQ.Flags.get("agents_hardened"), "Wipe hardens them");
      assert.ok(!MQ.Flags.get("agents_fed"));
      return run(env, "sw_vet_story");
    }).then(function () {
      assert.ok(MQ.Flags.get("vet_story_told"));
      assert.ok(MQ.Flags.get("welsh_word_learned"), "and the Welsh word lands with it");
      assert.ok(MQ.Flags.get("welsh_word_learned"), "and the Welsh is logged");
    });
  });

  t("Y Berllan: FEED keeps them strong and hands ORACLE a false map", function () {
    const env = boot(1);                       // choice 1 = FEED
    const MQ = env.MQ;
    MQ.Quests.start("main_06_brine_and_perry");
    MQ.Flags.set("orchard_open", true);
    return run(env, "sw_the_drive", 6000).then(function () {
      assert.strictEqual(MQ.Flags.get("choice_agents"), "feed");
      assert.ok(MQ.Flags.get("agents_fed"));
      assert.ok(MQ.Flags.get("oracle_fed_map"));
      assert.ok(!MQ.Flags.get("agents_hardened"));
    });
  });

  t("the mine: the descent, the checkpoints in the salt, and TERRATAUR", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Quests.start("main_07_salt");
    return run(env, "sw_mine_descended").then(function () {
      assert.ok(MQ.Flags.get("mine_descended"));
      return run(env, "sw_checkpoints");
    }).then(function () {
      assert.ok(MQ.Flags.get("checkpoints_seen"), "the containers are found");
      return run(env, "sw_terrataur");
    }).then(function () {
      assert.ok(MQ.Flags.get("terrataur_woken"), "TERRATAUR is awake and catchable later");
    });
  });

  t("Gym 6 and the licence: DAEMON, the boat, and the lift pass", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Quests.start("main_07_salt");
    MQ.Flags.set("carys_battled", true);
    return run(env, "sw_carys_test").then(function () {
      assert.ok(MQ.Flags.get("narrowboat_licence"));
      assert.ok(MQ.Inventory.count("narrowboat_licence") >= 1);
      return run(env, "sw_jack");
    }).then(function () {
      assert.ok(MQ.Flags.get("badge_daemon"));
      assert.ok(MQ.Inventory.count("tm_salt_grind") >= 1);
      MQ.Flags.set("boat_lift_silence", true);
      return run(env, "sw_beth_upper");
    }).then(function () {
      assert.ok(MQ.Flags.get("lift_pass"), "Beth issues the pass after the ride");
      assert.ok(MQ.Inventory.count("lift_pass") >= 1);
    });
  });

  t("the boat lift: ORACLE speaks, and the agents go silent only if they were fed", function () {
    const fed = boot(0);
    fed.MQ.Quests.start("main_07_salt");
    fed.MQ.Flags.set("narrowboat_licence", true);
    fed.MQ.Flags.set("choice_agents", "feed");
    fed.MQ.Flags.set("agents_fed", true);
    return run(fed, "sw_lift_ride", 6000).then(function () {
      assert.ok(fed.MQ.Flags.get("boat_lift_silence"), "ORACLE speaks for the first time");
      assert.strictEqual(fed.MQ.Flags.get("agents_silent"), true, "Feed = total silence");
      assert.ok(fed.MQ.Flags.get("stack_on_map"), "THE STACK goes on the map");
      const hard = boot(0);
      hard.MQ.Quests.start("main_07_salt");
      hard.MQ.Flags.set("narrowboat_licence", true);
      hard.MQ.Flags.set("choice_agents", "wipe");
      hard.MQ.Flags.set("agents_hardened", true);
      return run(hard, "sw_lift_ride", 6000).then(function () {
        assert.ok(hard.MQ.Flags.get("boat_lift_silence"));
        assert.ok(!hard.MQ.Flags.get("agents_silent"), "Wipe = they are not silenced");
        assert.ok(hard.MQ.Flags.get("agents_kept_talking"), "Wipe = they keep talking");
      });
    });
  });

  t("the bunker switchboard needs all four panels before the Ops Room opens", function () {
    const env = boot(1);                       // choice 1 = 'two along', the right one
    const MQ = env.MQ;
    return run(env, "sw_bunker_panel_1").then(function () {
      assert.strictEqual(MQ.Flags.get("bunker_switchboard"), 1);
      return run(env, "sw_bunker_panel_2");
    }).then(function () { return run(env, "sw_bunker_panel_3"); })
      .then(function () { return run(env, "sw_bunker_panel_4"); })
      .then(function () {
        assert.strictEqual(MQ.Flags.get("bunker_switchboard"), 4);
        const gate = MQ.World.get("hack_green_b2").warps.filter(function (w) { return w.to === "hack_green_ops"; })[0];
        assert.ok(gate && gate.cond === "bunker_switchboard >= 4");
        assert.ok(MQ.Flags.test(gate.cond), "the Ops Room door releases");
        return run(env, "sw_bunker_ops");
      }).then(function () {
        assert.ok(MQ.Flags.get("bunker_ops_done"));
      });
  });

  t("the casebook cases open, advance and close", function () {
    const env = boot(0);
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 7);
    return run(env, "sw_mari_museum").then(function () {
      assert.ok(MQ.Quests.stage("case_25_weaver_hall_ghost") >= 0, "the Weaver Hall ghost opens");
      MQ.Flags.set("case_25_nights", 3);
      return run(env, "sw_mari_museum");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_25_stair_found"));
      return run(env, "sw_back_stair_pup");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_25_pup_returned"), "the pup goes home");
      return run(env, "sw_mari_museum");
    }).then(function () {
      assert.ok(MQ.Quests.isDone("case_25_weaver_hall_ghost"), "and the case closes");
      assert.ok(MQ.Flags.get("terrataur_one_less_phase"), "mercy costs the boss a phase");
    });
  });

  t("the Welsh lines unlock things nobody else hears", function () {
    const env = boot(0);                       // choice 0 = the Welsh answer
    const MQ = env.MQ;
    MQ.Flags.set("welsh_word_learned", true);
    return run(env, "sw_coed_guardian").then(function () {
      assert.ok(MQ.Flags.get("coed_guardian"), "DERWYDD answers a greeting in Welsh");
      return run(env, "sw_pond_riddle");
    }).then(function () {
      assert.ok(MQ.Flags.get("brithyll_named"), "and the trout finally has a name");
      const en = boot(1);                      // the English answer
      en.MQ.Flags.set("welsh_word_learned", true);
      return run(en, "sw_coed_guardian").then(function () {
        assert.ok(!en.MQ.Flags.get("coed_guardian"), "English gets refusal, not silence");
      });
    });
  });
};
