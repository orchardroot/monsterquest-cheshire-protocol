// MonsterQuest v2 — region-mid story: the Chapter 3 opening runs to
// completion under MQ.Dialog.auto, the Ch.3-5 set-pieces set the flags
// DESIGN-INDEX promises, and the three gyms gate their own doors.
"use strict";
const H = require("../headless");

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

// A team that will not lose the scripted fights, so the set-pieces can be
// tested end to end rather than up to the first battle.
function stack(MQ) {
  ["bruinhall", "scriptorix", "steamloco"].forEach(function (sp) {
    MQ.Party.add(MQ.Data.makeMonster(sp, 60));
  });
}

module.exports = function (t, assert) {

  t("every script a region-mid map names is registered and is a generator", function () {
    const env = H.load();
    const MQ = env.MQ, W = MQ.World, S = MQ.Story;
    const missing = [], notGen = [];
    W.each(function (m, id) {
      if (!m || m.owner !== "mid") return;
      const names = [];
      (m.npcs || []).forEach(function (n) { if (n.script) names.push(n.script); });
      (m.triggers || []).forEach(function (tr) { if (tr.script) names.push(tr.script); });
      names.forEach(function (n) {
        const fn = S.npcScripts[n] || S.scripts[n];
        if (!fn) { missing.push(id + ": " + n); return; }
        if (String(fn).indexOf("function*") !== 0 && (!fn.constructor || fn.constructor.name !== "GeneratorFunction")) notGen.push(id + ": " + n);
        if (n.indexOf("mid_") !== 0) missing.push(id + ": " + n + " is not namespaced mid_*");
      });
    });
    assert.strictEqual(missing.length, 0, "unregistered scripts:\n" + missing.join("\n"));
    assert.strictEqual(notGen.length, 0, "not generator functions:\n" + notGen.join("\n"));
    const mine = Object.keys(S.npcScripts).filter(function (k) { return k.indexOf("mid_") === 0; });
    assert.ok(mine.length >= 100, "region-mid registers " + mine.length + " npc scripts");
  });

  t("chapters 3, 4 and 5 are attached to the table, with the CUTOVER days", function () {
    const env = H.load();
    const MQ = env.MQ, S = MQ.Story;
    [3, 4, 5].forEach(function (n) {
      assert.strictEqual(typeof S.chapters[n].start, "function", "chapter " + n + " has an opening");
      assert.ok(S.chapters[n].hooks && typeof S.chapters[n].hooks.complete === "function", "chapter " + n + " has a completion hook");
    });
    assert.strictEqual(S.chapters[3].title, "Picnic Blankets");
    assert.strictEqual(S.chapters[4].title, "The Dish Goes Dark");
    assert.strictEqual(S.chapters[5].title, "Puppets on the Line");
    assert.strictEqual(S.levelBand(3)[0], 13);
    assert.strictEqual(S.levelBand(5)[1], 26);
    assert.strictEqual(S.CUTOVER[4], 38);
    assert.strictEqual(S.CUTOVER[5], 31);
    assert.strictEqual(S.chapters[4].hooks.next, 5);
    assert.strictEqual(S.chapters[5].hooks.next, 6);
  });

  t("the Chapter 3 opening runs to completion under MQ.Dialog.auto", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Dialog.autoChoice = 0;
    MQ.Flags.set("badge_packet", true);
    MQ.Scenes.replace(MQ.Overworld, { map: "knutsford", x: 3, y: 22, dir: "right" });
    env.step(1);
    return pump(env, MQ.Story.advanceChapter(3, { card: false }), 4000, "chapter 3 opening").then(function () {
      assert.strictEqual(MQ.Flags.get("chapter"), 3, "the chapter counter moved");
      assert.strictEqual(MQ.Quests.isStarted("main_03_picnic_blankets"), true, "the Ch.3 quest is open");
      assert.ok(!MQ.Script.busy(), "the opening released the player");
      // and the town's own arrival cutscene runs cleanly on top of it
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_knutsford_arrival, {}), 1200, "knutsford arrival");
    }).then(function () {
      assert.ok(MQ.Flags.get("knutsford_arrival"), "knutsford_arrival");
      assert.strictEqual(MQ.Overworld.state.map, "knutsford", "you are still in Knutsford afterwards");
      // idempotent: running the opening again does not re-open anything
      return pump(env, MQ.Script.run(MQ.Story.chapters[3].start, {}), 2000, "ch3 replay");
    }).then(function () {
      assert.strictEqual(MQ.Flags.get("chapter"), 3);
    });
  });

  t("the Tatton deer census is a botnet, and clears to ARBITER", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "tatton_park", x: 27, y: 44, dir: "up" });
    env.step(1);
    stack(MQ);
    const nerys = MQ.Story.npcScripts.mid_tatton_nerys;
    return pump(env, MQ.Script.run(nerys, {}), 2000, "nerys intro").then(function () {
      assert.ok(MQ.Flags.get("census_started"), "the census is offered");
      assert.strictEqual(MQ.Quests.isStarted("main_03_picnic_blankets"), true);
      return pump(env, MQ.Script.run(nerys, {}), 20000, "the count");
    }).then(function () {
      assert.ok(MQ.Flags.get("deer_census_done"), "deer_census_done");
      assert.ok(MQ.Flags.get("agent_arbiter"), "ARBITER unlocked");
    });
  });

  t("the Rostherne bell rings and the relay is on the casebook", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true;
    MQ.Flags.set("deer_census_done", true);
    MQ.Scenes.replace(MQ.Overworld, { map: "rostherne_mere", x: 33, y: 20, dir: "down" });
    env.step(1);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_rostherne_bell, {}), 3000, "the bell").then(function () {
      assert.ok(MQ.Flags.get("rostherne_relay_seen"), "rostherne_relay_seen");
      assert.ok(MQ.Flags.get("clue_relay_period"), "the ninety-second period is recorded");
      assert.ok(!MQ.Script.busy(), "the cutscene released the player");
    });
  });

  t("VEX loses at Tatton and hands you Tbilisi", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "tatton_park", x: 24, y: 36, dir: "right" });
    env.step(1);
    stack(MQ);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_tatton_vex, {}), 20000, "vex 2").then(function () {
      assert.ok(MQ.Flags.get("vex_battle_2"), "vex_battle_2");
      assert.ok(MQ.Flags.get("tbilisi_domain_found"), "tbilisi_domain_found");
    });
  });

  t("Gym 2: the stacks will not move until all three lecterns are answered, in shelf order", function () {
    const env = H.load();
    const MQ = env.MQ, W = MQ.World;
    MQ.Dialog.auto = true;
    const gym = W.get("knutsford_gym");
    const door = (gym.warps || []).filter(function (w) { return w.to === "knutsford_gym_floor"; });
    assert.ok(door.length >= 1, "the library has a back door");
    door.forEach(function (w) { assert.strictEqual(w.cond, "gym2_open", "gated on gym2_open"); });
    MQ.Scenes.replace(MQ.Overworld, { map: "knutsford_gym", x: 14, y: 24, dir: "up" });
    env.step(1);
    const N = MQ.Story.npcScripts;
    // out of order: shelf 2 refuses to open before shelf 1
    MQ.Dialog.autoChoice = 1;
    return pump(env, MQ.Script.run(N.mid_gym2_lectern_2, {}), 800, "lectern 2 early").then(function () {
      assert.ok(!MQ.Flags.get("gym2_key_2"), "shelf 2 stays shut until shelf 1 is answered");
      // wrong answer on shelf 1 does nothing
      MQ.Dialog.autoChoice = 0;
      return pump(env, MQ.Script.run(N.mid_gym2_lectern_1, {}), 800, "lectern 1 wrong");
    }).then(function () {
      assert.ok(!MQ.Flags.get("gym2_key_1"), "the wrong sleeve does not open an aisle");
      MQ.Dialog.autoChoice = 1;
      return pump(env, MQ.Script.run(N.mid_gym2_lectern_1, {}), 800, "lectern 1");
    }).then(function () {
      assert.ok(MQ.Flags.get("gym2_key_1"), "shelf 1");
      return pump(env, MQ.Script.run(N.mid_gym2_lectern_2, {}), 800, "lectern 2");
    }).then(function () {
      assert.ok(MQ.Flags.get("gym2_key_2"), "shelf 2");
      assert.ok(!MQ.Flags.get("gym2_open"), "two out of three is not a key");
      return pump(env, MQ.Script.run(N.mid_gym2_lectern_3, {}), 800, "lectern 3");
    }).then(function () {
      assert.ok(MQ.Flags.get("gym2_key_3"), "shelf 3");
      assert.ok(MQ.Flags.get("gym2_open"), "the stacks moved");
    });
  });

  t("Madam Gaskell hands over CIPHER, the anchor, the card and the network", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "knutsford_gym_floor", x: 11, y: 20, dir: "up" });
    env.step(1);
    stack(MQ);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_gym2_gaskell, {}), 30000, "gaskell").then(function () {
      assert.ok(MQ.Flags.get("badge_cipher"), "badge_cipher");
      assert.ok(MQ.Flags.get("gaskell_network"), "gaskell_network");
      assert.ok(MQ.Flags.get("clue_alder_sold"), "the rumour about Alder Labs lands");
      assert.ok(MQ.Inventory.count("anchor_cipher") >= 1, "the anchor item");
      assert.ok(MQ.Inventory.count("tm_cranford_whisper") >= 1, "the Skill Card");
      // and the tower's rumour drops now work
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_gaskell_tower, {}), 1500, "a rumour");
    }).then(function () {
      assert.ok(Number(MQ.Flags.get("gaskell_rumour")) >= 1, "a rumour was dropped");
    });
  });

  t("Ch.4: ROOT turns you away, drops the SIGNAL METER, and starts the CUTOVER at 38", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Flags.set("badge_cipher", true);
    MQ.Scenes.replace(MQ.Overworld, { map: "jodrell_bank", x: 21, y: 36, dir: "up" });
    env.step(1);
    return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_jodrell_approach, {}), 2000, "the approach").then(function () {
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_jodrell_root, {}), 5000, "the gate");
    }).then(function () {
      assert.ok(MQ.Flags.get("jodrell_turned_away"), "jodrell_turned_away");
      assert.ok(MQ.Flags.get("signal_meter"), "signal_meter");
      assert.ok(MQ.Inventory.count("signal_meter") >= 1, "the handheld is in the bag");
      assert.ok(MQ.Flags.get("cutover_started"), "cutover_started");
      assert.strictEqual(MQ.Flags.get("cutover_days"), 38, "CUTOVER: 38 DAYS");
      assert.strictEqual(MQ.Story.cutoverLabel(), "CUTOVER: 38 DAYS");
      return pump(env, MQ.Script.run(MQ.Story.npcScripts.mid_jodrell_ranger, {}), 3000, "the ranger");
    }).then(function () {
      assert.ok(MQ.Flags.get("amos_first_glimpse"), "amos_first_glimpse");
    });
  });

  t("Ch.4: Otis gates his arch, hands over BEAR, and teaches you to shove", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "congleton_gym", x: 15, y: 26, dir: "up" });
    env.step(1);
    stack(MQ);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.mid_gym3_backdoor, {}), 800, "arch closed").then(function () {
      assert.ok(!MQ.Flags.get("gym3_open"), "the arch is chained until Otis asks his favour");
      return pump(env, MQ.Script.run(N.mid_congleton_otis_pre, {}), 2000, "otis on the steps");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_10_open"), "case 10 opens");
      assert.strictEqual(MQ.Quests.isStarted("case_10_bear_of_congleton"), true);
      return pump(env, MQ.Script.run(N.mid_gym3_backdoor, {}), 800, "arch open");
    }).then(function () {
      assert.ok(MQ.Flags.get("gym3_open"), "the arch opens");
      return pump(env, MQ.Script.run(N.mid_gym3_otis, {}), 30000, "otis");
    }).then(function () {
      assert.ok(MQ.Flags.get("badge_bear"), "badge_bear");
      assert.ok(MQ.Inventory.count("tm_bear_hug") >= 1, "the Skill Card");
      assert.ok(MQ.Overworld.state.abilities.has("shove"), "Shove unlocked with the badge");
      MQ.Flags.set("cutover_started", true);
      return pump(env, MQ.Script.run(N.mid_gym3_memo, {}), 1500, "the memo");
    }).then(function () {
      assert.ok(MQ.Flags.get("clue_cutover_memo"), "the STACK CUTOVER memo is on the board");
    });
  });

  t("Ch.5: the crosses light, the shrine opens, and Nino's second letter names the shell", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Flags.set("chapter", 5);
    MQ.Flags.set("badge_bear", true);
    MQ.Scenes.replace(MQ.Overworld, { map: "sandbach", x: 21, y: 22, dir: "up" });
    env.step(1);
    stack(MQ);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.mid_sandbach_crosses, {}), 25000, "the crosses").then(function () {
      assert.ok(MQ.Flags.get("sandbach_crosses_lit"), "sandbach_crosses_lit");
      assert.ok(MQ.Flags.get("sandbach_shrine"), "the revive shrine is live");
      assert.ok(MQ.Flags.get("clue_interlace_key"), "the interlace is understood as a key");
      return pump(env, MQ.Script.run(N.mid_sandbach_post, {}), 2000, "nino letter 2");
    }).then(function () {
      assert.ok(MQ.Flags.get("nino_letter_2"), "nino_letter_2");
      assert.ok(MQ.Inventory.count("nino_letter_2") >= 1);
      assert.ok(MQ.Flags.get("clue_orchard_holdings"), "the shell company has a name");
      return pump(env, MQ.Script.run(N.mid_sandbach_shrine, {}), 1500, "the shrine");
    }).then(function () {
      assert.ok(MQ.Party.list.every(function (m) { return m.hp > 0; }), "the shrine puts the team back on its feet");
    });
  });

  t("Ch.5: the yard chase, the APT, TWELVE-K's lanyard, and the Railcard", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Flags.set("chapter", 5);
    MQ.Scenes.replace(MQ.Overworld, { map: "crewe", x: 30, y: 16, dir: "down" });
    env.step(1);
    stack(MQ);
    const N = MQ.Story.npcScripts;
    return pump(env, MQ.Script.run(N.mid_crewe_fog, {}), 40000, "the yard chase").then(function () {
      assert.ok(MQ.Flags.get("crewe_fog_cleared"), "crewe_fog_cleared");
      return pump(env, MQ.Script.run(N.mid_crewe_apt, {}), 30000, "the APT");
    }).then(function () {
      assert.ok(MQ.Flags.get("apt_boss_beaten"), "apt_boss_beaten");
      return pump(env, MQ.Script.run(N.mid_crewe_twelvek, {}), 30000, "twelve-k");
    }).then(function () {
      assert.ok(MQ.Flags.get("twelvek_lanyard_seen"), "twelvek_lanyard_seen");
      return pump(env, MQ.Script.run(N.mid_gym4_table, {}), 1500, "the turntable");
    }).then(function () {
      assert.ok(MQ.Flags.get("gym4_open"), "road four is lined up");
      return pump(env, MQ.Script.run(N.mid_gym4_di, {}), 30000, "di");
    }).then(function () {
      assert.ok(MQ.Flags.get("badge_kernel"), "badge_kernel");
      assert.ok(MQ.Inventory.count("tm_firebox_roar") >= 1, "the Skill Card");
      return pump(env, MQ.Script.run(N.mid_crewe_railcard, {}), 2000, "the railcard");
    }).then(function () {
      assert.ok(MQ.Flags.get("rail_fast_travel"), "rail_fast_travel");
      assert.ok(MQ.Flags.get("cambrian_ticket"), "cambrian_ticket");
      assert.ok(MQ.Overworld.state.abilities.has("railcard"), "the railcard is a traversal unlock");
      return pump(env, MQ.Script.run(N.mid_crewe_vex, {}), 20000, "the train home");
    }).then(function () {
      assert.ok(MQ.Flags.get("vex_battle_3"), "vex_battle_3 — the platform-six rival fight");
      assert.ok(MQ.Flags.get("salon_seen"), "salon_seen");
      assert.ok(MQ.Flags.get("welsh_word_learned"), "welsh_word_learned — 'paid', said aloud, off-log");
    });
  });

  t("each chapter's completion hook only fires when its flags are all set", function () {
    const env = H.load();
    const MQ = env.MQ, S = MQ.Story;
    assert.strictEqual(S.chapters[3].hooks.complete(), false, "Ch.3 is not complete on a fresh save");
    ["deer_census_done", "rostherne_relay_seen", "tbilisi_domain_found", "gaskell_network", "vex_battle_2"].forEach(function (f) { MQ.Flags.set(f, true); });
    assert.strictEqual(S.chapters[3].hooks.complete(), false, "...and not without the badge");
    MQ.Flags.set("badge_cipher", true);
    assert.strictEqual(S.chapters[3].hooks.complete(), true, "Ch.3 completes");

    assert.strictEqual(S.chapters[4].hooks.complete(), false);
    ["jodrell_turned_away", "signal_meter", "cutover_started", "amos_first_glimpse", "badge_bear"].forEach(function (f) { MQ.Flags.set(f, true); });
    assert.strictEqual(S.chapters[4].hooks.complete(), true, "Ch.4 completes");

    assert.strictEqual(S.chapters[5].hooks.complete(), false);
    ["crewe_fog_cleared", "apt_boss_beaten", "sandbach_crosses_lit", "twelvek_lanyard_seen",
      "welsh_word_learned", "rail_fast_travel", "badge_kernel"].forEach(function (f) { MQ.Flags.set(f, true); });
    assert.strictEqual(S.chapters[5].hooks.complete(), true, "Ch.5 completes");
  });

  t("the region's casebook cases can be worked end to end", function () {
    const env = H.load();
    const MQ = env.MQ;
    MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
    MQ.Scenes.replace(MQ.Overworld, { map: "knutsford", x: 3, y: 22, dir: "right" });
    env.step(1);
    stack(MQ);
    const N = MQ.Story.npcScripts;
    // Q8 — the Gaskell draft: quiz, then the mule on the Heath, beaten fairly
    return pump(env, MQ.Script.run(N.mid_knutsford_aled, {}), 2000, "aled").then(function () {
      assert.strictEqual(MQ.Quests.isStarted("case_08_the_gaskell_draft"), true);
      MQ.Minigames.auto = true;   // play the quiz through headlessly
      return pump(env, MQ.Script.run(N.mid_knutsford_quiz, {}), 2500, "the quiz");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_08_quiz_passed"), "the quiz is passed");
      return pump(env, MQ.Script.run(N.mid_knutsford_seller, {}), 2000, "seller intro");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_08_seller_found"), "the seller is found");
      return pump(env, MQ.Script.run(N.mid_knutsford_seller, {}), 20000, "seller battle");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_08_done"), "case 08 closes");
      // Q10 — three bear tokens and six lampposts
      MQ.Flags.set("case_10_open", true);
      return pump(env, MQ.Script.run(N.mid_congleton_token_1, {}), 1500, "token 1");
    }).then(function () {
      return pump(env, MQ.Script.run(N.mid_congleton_token_2, {}), 1500, "token 2");
    }).then(function () {
      return pump(env, MQ.Script.run(N.mid_congleton_token_3, {}), 1500, "token 3");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_10_token_bakery") && MQ.Flags.get("case_10_token_bridge") && MQ.Flags.get("case_10_token_park"),
        "all three bear tokens");
      let chain = Promise.resolve();
      for (let i = 0; i < 6; i++) chain = chain.then(function () { return pump(env, MQ.Script.run(N.mid_congleton_poster, {}), 1200, "poster"); });
      return chain;
    }).then(function () {
      assert.strictEqual(Number(MQ.Flags.get("case_10_posters")), 6, "six posters down");
      assert.ok(MQ.Flags.get("case_10_posters_done"));
      return pump(env, MQ.Script.run(N.mid_congleton_otis_pre, {}), 2000, "otis closes it");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_10_done"), "case 10 closes");
      // Q11 — the signal box, at night, caught rather than flattened
      MQ.Flags.set("case_11_watching", true);
      MQ.Clock.setPhase("night");
      return pump(env, MQ.Script.run(N.mid_holmes_levers, {}), 20000, "the levers");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_11_poltergrid"), "POLTERGRID is in the noise");
      assert.ok(MQ.Flags.get("case_11_done"), "case 11 closes either way");
      // Q12 — the cipher, the drop, and handing it to Nell
      MQ.Flags.set("case_12_open", true);
      MQ.Flags.set("clue_interlace_key", true);
      return pump(env, MQ.Script.run(N.mid_sandbach_drop, {}), 2000, "the drop");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_12_drop_found"), "the proxy list is found");
      return pump(env, MQ.Script.run(N.mid_sandbach_drop, {}), 2000, "handed in");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_12_handed_in"), "case_12_handed_in (the Nell path)");
      // Q13 — the first bounty
      MQ.Flags.set("bounty_board_open", true);
      return pump(env, MQ.Script.run(N.mid_r14_bramble, {}), 2000, "tracking bramble");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_13_tracked"));
      return pump(env, MQ.Script.run(N.mid_r14_bramble, {}), 20000, "bramble");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_13_done"), "case 13 closes");
      assert.ok(MQ.Flags.get("clue_berllan_tag"), "the orchard tag points at Y Berllan");
      // Q6 — the photo census, eight stags and a ninth that is not one
      MQ.Flags.set("case_06_open", true);
      MQ.Clock.setWeather("rain");
      let chain = Promise.resolve();
      for (let i = 0; i < 8; i++) chain = chain.then(function () { return pump(env, MQ.Script.run(N.mid_tatton_stag, {}), 1200, "photo"); });
      return chain;
    }).then(function () {
      assert.strictEqual(Number(MQ.Flags.get("case_06_photos")), 8, "eight antler patterns");
      return pump(env, MQ.Script.run(N.mid_tatton_stag, {}), 3000, "the ninth");
    }).then(function () {
      assert.ok(MQ.Flags.get("case_06_ninth"), "the ninth is not a deer");
      assert.ok(MQ.Inventory.count("face_fragment_1") >= 1, "Face Fragment #1");
    });
  });
};
