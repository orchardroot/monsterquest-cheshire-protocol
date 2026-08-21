// MonsterQuest v2 — region-northwest story: the Chapter 8 opening, the two
// halves of CHOICE 2, both gyms, the breaker, CHOICE 3 and all three endings
// run to completion under MQ.Dialog.auto, and the White Hats' four checks
// actually check something.
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("../headless");
const ROOT = path.resolve(__dirname, "..", "..");

function nwFiles() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const files = [];
  const re = /<script\s+src="([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) files.push(m[1]);
  // The whole point of this suite: region-mid's Jodrell maps (jodrell_bank,
  // jodrell_bank_dish, ...) must not be loaded here, so Chapter 11 exercises
  // its own "degrades to narration if they aren't loaded" fallback instead
  // of the real cross-region content.
  const midJodrell = files.indexOf("js/world/maps/mid_jodrell.js");
  if (midJodrell >= 0) files.splice(midJodrell, 1);
  const add = function (before, extra) {
    const keep = extra.filter(function (f) { return files.indexOf(f) < 0 && fs.existsSync(path.join(ROOT, f)); });
    const i = files.indexOf(before);
    if (i < 0) { files.push.apply(files, keep); return; }
    files.splice.apply(files, [i, 0].concat(keep));
  };
  add("js/data/dialogue.js", ["js/data/encounters_nw.js", "js/data/trainers_nw.js", "js/data/quests_nw.js"]);
  const maps = fs.readdirSync(path.join(ROOT, "js/world/maps"))
    .filter(function (f) { return /^nw.*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/world/maps/" + f; });
  add("js/battle/effects.js", maps);
  const chapters = fs.readdirSync(path.join(ROOT, "js/story/chapters"))
    .filter(function (f) { return /^(ch0[89]|ch1[012]|postgame).*\.js$/.test(f); }).sort()
    .map(function (f) { return "js/story/chapters/" + f; });
  add("js/boot.js", ["js/story/npcs_nw.js", "js/story/endings.js"].concat(chapters));
  return files;
}

function fresh(opts) {
  const env = H.load({ files: nwFiles() });
  const MQ = env.MQ;
  MQ.Dialog.auto = true;
  MQ.Dialog.autoChoice = (opts && opts.choice) || 0;
  // Deterministic battles: this suite is about script flow, not the engine.
  MQ.Battle.start = function () { return Promise.resolve({ outcome: (opts && opts.lose) ? "lose" : "win" }); };
  return env;
}

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

module.exports = function (t, assert) {

  t("every script a region-northwest map names is registered and is a generator", function () {
    const env = fresh();
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
    assert.deepStrictEqual(notGen, [], "not generators:\n" + notGen.join("\n"));
    const nw = Object.keys(S.npcScripts).filter(function (k) { return k.indexOf("nw_") === 0; });
    assert.ok(nw.length >= 110, "region-northwest registers " + nw.length + " npc scripts");
  });

  t("chapters 8 to 13 are on the table with openings and CUTOVER days", function () {
    const env = fresh();
    const S = env.MQ.Story;
    [8, 9, 10, 11, 12, 13].forEach(function (n) {
      assert.ok(S.chapters[n], "chapter " + n);
      assert.strictEqual(typeof S.chapters[n].start, "function", "chapter " + n + " opening");
    });
    assert.strictEqual(S.chapters[8].title, "The Ruin");
    assert.strictEqual(S.chapters[9].title, "Bridge Traffic");
    assert.strictEqual(S.chapters[11].title, "The Sky Is Quiet");
    assert.strictEqual(S.chapters[12].title, "THE FIREWALL");
    assert.strictEqual(S.CUTOVER[8], 12);
    assert.strictEqual(S.CUTOVER[9], 7);
    assert.strictEqual(S.CUTOVER[10], "t3");
    assert.strictEqual(S.CUTOVER[11], "t0");
  });

  t("the Chapter 8 opening runs to completion and opens the case", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 8);
    return pump(env, MQ.Script.run(MQ.Story.chapters[8].start, { chapter: 8 }), 4000, "ch8 opening").then(function () {
      assert.ok(MQ.Quests.stage("main_08_the_ruin") >= 0, "the Ruin is open");
      // arriving in Delamere sets the hook the chapter hangs on
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_delamere_arrival, {}), 3000, "delamere arrival");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("vex_missing"), true, "VEX is missing");
      assert.ok(MQ.Quests.stage("main_08_the_ruin") >= 0);
      // and it is idempotent
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_delamere_arrival, {}), 3000, "delamere arrival replay");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("vex_missing"), true);
    });
  });

  t("the Beeston wall scene stops the release and puts two VEXes on the wall", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 8);
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_beeston_wall_scene, {}), 5000, "wall scene").then(function () {
      assert.strictEqual(MQ.Flags.get("vex_release_stopped"), true, "the capsule does not go over");
      assert.strictEqual(MQ.Flags.get("beeston_wall_scene"), true, "the second one has walked out of the keep");
      assert.ok(!MQ.Flags.get("choice_vex"), "the choice has not been made yet");
    });
  });

  t("CHOICE 2 — Verify needs the word, and pays out an ally", function () {
    const env = fresh({ choice: 0 });   // first option = VERIFY when it is offered
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 8);
    MQ.Flags.set("beeston_wall_scene", true);
    // without the word from the train, VERIFY is offered but cannot be taken
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_beeston_vex_wall, {}), 5000, "verify without word").then(function () {
      assert.ok(!MQ.Flags.get("choice_vex"), "you cannot verify what you never heard");
      MQ.Flags.set("welsh_word_learned", true);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_beeston_vex_wall, {}), 6000, "verify with word");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("choice_vex"), "verify");
      assert.strictEqual(MQ.Flags.get("vex_ally"), true, "VEX travels with you");
      assert.strictEqual(MQ.Flags.get("understudy_beeston_beaten"), true);
      assert.strictEqual(MQ.Flags.get("beeston_arena_open"), true);
    });
  });

  t("CHOICE 2 — Challenge fights both and leaves you alone", function () {
    const env = fresh({ choice: 1 });   // second option = CHALLENGE when the word is known
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 8);
    MQ.Flags.set("beeston_wall_scene", true);
    MQ.Flags.set("welsh_word_learned", true);
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_beeston_second_vex, {}), 6000, "challenge").then(function () {
      assert.strictEqual(MQ.Flags.get("choice_vex"), "challenge");
      assert.ok(!MQ.Flags.get("vex_ally"), "VEX does not forgive it");
      assert.strictEqual(MQ.Flags.get("understudy_beeston_beaten"), true);
    });
  });

  t("the well pays out ROOT's note and names Frodsham", function () {
    const env = fresh();
    const MQ = env.MQ;
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_beeston_well_note, {}), 4000, "well").then(function () {
      assert.strictEqual(MQ.Flags.get("beeston_well_note"), true);
    });
  });

  t("Chapter 9: the bench, the invoice fork, Gym 7 and the breaker", function () {
    const env = fresh({ choice: 0 });
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 9);
    return pump(env, MQ.Script.run(MQ.Story.chapters[9].start, { chapter: 9 }), 4000, "ch9 opening").then(function () {
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_frodsham_root_bench, {}), 6000, "root bench");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("root_bench_talk"), true);
      assert.strictEqual(MQ.Flags.get("invoice_holder"), "root", "first option leaks it");
      assert.strictEqual(MQ.Flags.get("cutover_days"), 7);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_gym7_ria, {}), 6000, "gym 7");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("badge_proxy"), true, "PROXY badge");
      const abil = MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities;
      assert.ok(!abil || abil.has("goggles") || MQ.Flags.get("unlock_goggles"), "Proxy Goggles unlocked");
      MQ.Flags.set("stack_doors_opened", 8);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_stack_breaker, {}), 8000, "breaker");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("plug_pulled"), true, "the breaker works");
      assert.strictEqual(MQ.Flags.get("cutover_days"), "stopped", "CUTOVER: STOPPED");
    });
  });

  t("the invoice fork can go the other way", function () {
    const env = fresh({ choice: 1 });
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 9);
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_frodsham_root_bench, {}), 6000, "root bench alder").then(function () {
      assert.strictEqual(MQ.Flags.get("invoice_holder"), "alder");
    });
  });

  t("Chapter 10: Mo's alerts, the grin, the gondola and all eight badges", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 10);
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_gym8_mo, {}), 12000, "gym 8").then(function () {
      assert.strictEqual(MQ.Flags.get("mo_alerts"), true);
      assert.strictEqual(MQ.Flags.get("grin_remained"), true, "the grin remained");
      assert.strictEqual(MQ.Flags.get("cutover_restarted"), true);
      assert.strictEqual(MQ.Flags.get("cutover_days"), "t3");
      assert.strictEqual(MQ.Flags.get("transporter_phase"), true, "phase three is on the gondola");
      assert.strictEqual(MQ.Flags.get("badge_admin"), true, "ADMIN badge");
      assert.strictEqual(MQ.Flags.get("all_badges"), true);
      assert.strictEqual(MQ.Flags.get("jodrell_open"), true, "the dish has turned");
    });
  });

  t("Chapter 11 runs end to end without region-mid's Jodrell maps and reaches the choice", function () {
    const env = fresh({ choice: 2 });   // third option on the plug = CUSTODY
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 11);
    assert.ok(!MQ.World.has("jodrell_bank_dish"), "region-mid's dish map is not loaded here");
    return pump(env, MQ.Script.run(MQ.Story.chapters[11].start, { chapter: 11 }), 30000, "ch11 climax").then(function () {
      assert.strictEqual(MQ.Flags.get("root_defeated"), true);
      assert.strictEqual(MQ.Flags.get("glitchra_defeated"), true);
      assert.strictEqual(MQ.Flags.get("glitchra_catchable"), true);
      assert.strictEqual(MQ.Flags.get("oracle_you_came_back"), true);
      assert.strictEqual(MQ.Flags.get("choice_plug"), "custody");
      assert.strictEqual(MQ.Flags.get("agent_pippin"), true, "PIPPIN takes the fourth chair");
      assert.strictEqual(MQ.Flags.get("cutover_days"), "t0");
    });
  });

  ["delete", "quarantine", "custody"].forEach(function (choice, i) {
    t("CHOICE 3 — " + choice + " runs to completion from the bowl", function () {
      const env = fresh({ choice: i });
      const MQ = env.MQ;
      MQ.Flags.set("chapter", 11);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_choice_plug, {}), 8000, "choice " + choice).then(function () {
        assert.strictEqual(MQ.Flags.get("choice_plug"), choice);
        assert.strictEqual(MQ.Flags.get("chapter_11_done"), true);
        if (choice === "custody") assert.strictEqual(MQ.Flags.get("agent_pippin"), true);
        else assert.ok(!MQ.Flags.get("agent_pippin"));
      });
    });
  });

  t("the White Hats' four checks are real checks", function () {
    const env = fresh();
    const MQ = env.MQ, C = MQ.Story.firewallChecks;
    assert.ok(C && C.sue && C.raj && C.kim && C.doc, "four checks");
    MQ.Party.list.length = 0;
    // Doc: one clever answer is not a team
    MQ.Party.list.push(MQ.Data.makeMonster("furnacore", 60));
    assert.strictEqual(C.doc.test(), false, "one species fails Doc");
    ["stagwire", "krabbaron", "datadrake"].forEach(function (sp) { MQ.Party.list.push(MQ.Data.makeMonster(sp, 60)); });
    assert.strictEqual(C.doc.test(), true, "four distinct type profiles pass Doc");
    // Raj: nothing unpatched
    assert.strictEqual(C.raj.test(), true, "a fresh party passes Raj");
    MQ.Party.list[0].hp = 1;
    assert.strictEqual(C.raj.test(), false, "a hurt party fails Raj");
    MQ.Party.list[0].hp = MQ.Party.list[0].stats.hp;
    MQ.Party.list[1].status = "psn";
    assert.strictEqual(C.raj.test(), false, "a poisoned party fails Raj");
    MQ.Party.list[1].status = null;
    assert.strictEqual(C.raj.test(), true);
    // Sue: nothing borrowed
    assert.strictEqual(C.sue.test(), true, "nothing borrowed");
    MQ.Party.list[2].tagged = true;
    assert.strictEqual(C.sue.test(), false, "a tagged creature fails Sue");
  });

  t("Chapter 12 gates each White Hat behind its own check, then the Champion", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 12);
    MQ.Flags.set("all_badges", true);
    MQ.Party.list.length = 0;
    ["furnacore", "stagwire", "krabbaron", "datadrake"].forEach(function (sp) { MQ.Party.list.push(MQ.Data.makeMonster(sp, 60)); });
    return pump(env, MQ.Script.run(MQ.Story.scripts.nw_firewall_start, {}), 4000, "firewall start").then(function () {
      assert.strictEqual(MQ.Flags.get("firewall_started"), true);
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_whitehat_sue, {}), 5000, "sue");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("whitehat_sue"), true);
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_whitehat_raj, {}), 5000, "raj");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("whitehat_raj"), true);
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_whitehat_kim, {}), 5000, "kim");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("whitehat_kim"), true);
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_whitehat_doc, {}), 5000, "doc");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("whitehat_doc"), true);
      assert.strictEqual(MQ.Flags.get("firewall_all_passed"), true);
    });
  });

  t("a party that fails a check does not pass the gate", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 12);
    MQ.Party.list.length = 0;
    MQ.Party.list.push(MQ.Data.makeMonster("furnacore", 60));
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_whitehat_doc, {}), 5000, "doc fail").then(function () {
      assert.ok(!MQ.Flags.get("whitehat_doc"), "Doc turns a one-species party away");
    });
  });

  t("the Champion is hand-built after Verify and ORACLE-tuned after Challenge", function () {
    const env = fresh({ choice: 0 });
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 12);
    MQ.Flags.set("vex_ally", true);
    let picked = null;
    MQ.Battle.start = function (o) { picked = o.trainer; return Promise.resolve({ outcome: "win" }); };
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_champion_vex, {}), 20000, "champion verify").then(function () {
      assert.strictEqual(picked, "champion_vex", "Verify gets the hand-built team");
      assert.strictEqual(MQ.Flags.get("champion_fought"), true);
      assert.strictEqual(MQ.Flags.get("champion_result"), "won");
      assert.strictEqual(MQ.Flags.get("vex_name_revealed"), true);
      assert.strictEqual(MQ.Flags.get("postgame_open"), true);

      const env2 = fresh({ choice: 0 });
      const M2 = env2.MQ;
      M2.Flags.set("chapter", 12);
      let picked2 = null;
      M2.Battle.start = function (o) { picked2 = o.trainer; return Promise.resolve({ outcome: "win" }); };
      return pump(env2, M2.Script.run(M2.Story.npcScripts.nw_champion_vex, {}), 20000, "champion challenge").then(function () {
        assert.strictEqual(picked2, "champion_vex_tuned", "Challenge gets the tuned team");
      });
    });
  });

  t("a thrown final is noticed and recorded", function () {
    const env = fresh({ choice: 1 });   // second option on the final = throw it
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 12);
    MQ.Flags.set("vex_ally", true);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.nw_champion_vex, {}), 20000, "thrown").then(function () {
      assert.strictEqual(MQ.Flags.get("champion_result"), "thrown");
      assert.strictEqual(MQ.Flags.get("champion_thrown"), true);
      assert.strictEqual(MQ.Flags.get("champion_fought"), true);
    });
  });

  // ---- the endings ------------------------------------------------------
  ["delete", "quarantine", "custody"].forEach(function (choice) {
    ["verify", "challenge"].forEach(function (vex) {
      ["won", "lost", "thrown"].forEach(function (result) {
        t("MQ.Story.runEnding('" + choice + "') plays through with " + vex + "/" + result, function () {
          const env = fresh();
          const MQ = env.MQ;
          MQ.Flags.set("choice_vex", vex);
          MQ.Flags.set("vex_ally", vex === "verify");
          MQ.Flags.set("champion_result", result);
          if (choice === "custody") MQ.Flags.set("agent_pippin", true);
          return pump(env, MQ.Story.runEnding(choice), 20000, "ending " + choice).then(function () {
            assert.strictEqual(MQ.Flags.get("choice_plug"), choice);
            assert.strictEqual(MQ.Flags.get("ending_seen"), choice);
            assert.strictEqual(MQ.Flags.get("credits_seen"), true, "the credits played");
            assert.strictEqual(MQ.Flags.get("postgame_open"), true);
          });
        });
      });
    });
  });

  t("runEnding falls back to the flag and emits the ending event", function () {
    const env = fresh();
    const MQ = env.MQ;
    let seen = null;
    MQ.Events.on("ending", function (d) { seen = d; });
    MQ.Flags.set("choice_plug", "quarantine");
    return pump(env, MQ.Story.runEnding(), 20000, "ending from flag").then(function () {
      assert.ok(seen && seen.id === "ending_quarantine", "the ending event fired");
      assert.strictEqual(MQ.Flags.get("ending_seen"), "quarantine");
      assert.strictEqual(MQ.Story.selectEnding("delete").id, "ending_delete");
      assert.strictEqual(MQ.Story.selectEnding("nonsense").id, "ending_quarantine");
    });
  });

  t("the credits scene can be played on its own", function () {
    const env = fresh();
    const MQ = env.MQ;
    return pump(env, MQ.Story.runCredits("Test"), 20000, "credits").then(function () {
      assert.strictEqual(MQ.Flags.get("credits_seen"), true);
    });
  });

  t("the post-game opens, and the fifth pulse and the remnant land", function () {
    const env = fresh();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 13);
    return pump(env, MQ.Script.run(MQ.Story.chapters[13].start, { chapter: 13 }), 6000, "post-game").then(function () {
      assert.strictEqual(MQ.Flags.get("postgame_open"), true);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_fifth_pulse_post, {}), 5000, "fifth pulse");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("fifth_pulse"), true);
      return pump(env, MQ.Script.run(MQ.Story.scripts.nw_stack_remnant, {}), 8000, "remnant");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("amos_jim_face"), true, "the remnant in your coat");
    });
  });
};
