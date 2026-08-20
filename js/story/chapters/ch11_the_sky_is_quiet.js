// =============================================================
// MonsterQuest v2 — CHAPTER 11: "The Sky Is Quiet"
// Jodrell Bank. Levels 44-50, the climax.
// The maps here belong to region-mid (`jodrell_bank`,
// `jodrell_bank_control_room`, `jodrell_bank_tower`, `jodrell_bank_dish`,
// DESIGN-INDEX §5a); this file only drives them, and degrades to a
// straight cutscene if they are not loaded.
// CHOICE 3 — the plug.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const S = MQ.Story || (MQ.Story = {});
  S.npcScripts = S.npcScripts || {};
  S.scripts = S.scripts || {};
  const N = S.npcScripts;
  function def(id, gen) { N[id] = gen; S.scripts[id] = gen; return gen; }
  function flag(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }
  function haveMap(id) { return !!(MQ.World && MQ.World.has && MQ.World.has(id)); }

  // Walk the player to a region-mid map if it exists; otherwise narrate.
  function* goto(ctx, mapId, x, y, dir, line) {
    const C = ctx.S;
    if (haveMap(mapId)) {
      yield C.fadeOut(600);
      yield C.teleport("player", mapId, x, y, dir);
      yield C.wait(300);
      yield C.fadeIn(700);
      return true;
    }
    if (line) yield C.say(line);
    return false;
  }
  S.scripts.nw_goto_map = goto;

  // ------------------------------------------------------- the whole run --
  function* climax(ctx) {
    const C = ctx.S;
    yield C.hideHud(true);
    yield C.music("cutscene_signal");
    yield C.banner("Chapter 11 — The Sky Is Quiet", "Jodrell Bank");
    yield C.wait(1200);
    yield C.setFlag("cutover_days", "t0");
    yield C.say([
      "The gate at Jodrell Bank has been open since Saturday and there is nobody on it.",
      "The arboretum is full of DARKBYTE grunts in hi-vis who do not know their organiser has turned, and who wave you through because your badge scans."
    ]);
    yield goto(ctx, "jodrell_bank", 20, 30, "up", [
      "The grounds. The arboretum. Seventy-six metres of white steel above the trees, moving, very slowly, on a bearing that is not astronomical."
    ]);
    yield C.say([
      "The dish is turning. It takes eleven minutes to do a degree and it has been turning since Saturday.",
      "The bearing it is coming round to is not a point in the sky. It is a point on the ground, in Cheshire, about a mile and a half away, moving at walking pace."
    ]);

    // ---- ROOT in the control room ----
    yield goto(ctx, "jodrell_bank_control_room", 12, 18, "up", [
      "The control room. Nineteen-sixties consoles, a mug that says GOOSTREY W.I., and a woman with her boots on the desk."
    ]);
    yield C.music("battle_boss");
    yield C.say([
      "There you are, pentester. Took your time and I've had a lovely sit down.",
      "They're outside in hi-vis thinking they're winning. Nobody's told them. I'd rather nobody did until this is finished."
    ], { name: "ROOT" });
    yield C.say([
      "Now. I'm going to fight you, and I am not going to try very hard, and I would rather you didn't mention that afterwards.",
      "I've spent thirty years building a lever and four years watching the thing grow round it, and I would like to lose to somebody who walked here."
    ], { name: "ROOT" });
    const r1 = yield C.battle({ kind: "boss", trainer: "boss_root", music: "battle_boss" });
    if (r1 && r1.lost) {
      yield C.say([
        "Oh, for heaven's sake.",
        "Right. Again. I'll leave more out. I'm not carrying you up that gantry as well."
      ], { name: "ROOT" });
      const again = yield C.battle({ kind: "boss", trainer: "boss_root", music: "battle_boss" });
      if (again && again.lost) { yield C.say(["\"...we'll do this tomorrow. Go and sleep. I'll keep the kettle on.\""], { name: "ROOT" }); yield C.hideHud(false); return; }
    }
    yield C.setFlag("root_defeated", true);
    yield C.say([
      "Good.",
      "Off the record, and I will deny it: Wren Alder and I were friends. Nineteen ninety-six to two thousand and nine. Proper friends.",
      "She rang me the night she signed. I told her not to. She did it anyway and then she stopped ringing, and I built a criminal organisation about it, so let's not pretend either of us handled it well."
    ], { name: "ROOT" });
    yield C.say([
      "Gantry's that way. The wind is worse than it looks and the bearing is worse than the wind.",
      "Go on, love. It's been waiting four years and eleven months for somebody it recognises."
    ], { name: "ROOT" });

    // ---- the tower ----
    yield goto(ctx, "jodrell_bank_tower", 12, 20, "up", [
      "The access gantries. Steel mesh, a handrail, and a very great deal of nothing between the mesh and Cheshire."
    ]);
    yield C.weather("wind");
    yield C.say([
      "Halfway up, the whole structure moves under you as the bowl comes round another degree.",
      "The static in the dish surface has been getting brighter since the bottom of the ladder, and about now you understand that it is not static."
    ]);
    const r2 = yield C.battle({ kind: "boss", trainer: "boss_glitchra", music: "battle_legendary" });
    if (r2 && r2.lost) {
      yield C.say(["You go back down. It waits. It has all the time the sky has."]);
      yield C.hideHud(false);
      return;
    }
    yield C.setFlag("glitchra_defeated", true);
    yield C.setFlag("glitchra_catchable", true);
    yield C.say([
      "It comes apart into carrier noise and reassembles above the arboretum, patient, seventy-six metres across and badly drawn.",
      "It is a herald. It has been announcing something for four years and nobody has been listening, which for a herald is a kind of hell."
    ]);

    // ---- the bowl ----
    yield goto(ctx, "jodrell_bank_dish", 16, 26, "up", [
      "The bowl. Seventy-six metres of steel mesh, tilted, and standing in it, in ranks, in silence, the knights."
    ]);
    yield C.music(null);
    yield C.say([
      "They are the monsters it gathered. Hundreds. Rock and salt and copper and static, from every level of every mine and every mere in this county.",
      "None of them attack. They part.",
      "MEADOW walks between them like a woman going down the aisle of a church she has been thrown out of."
    ]);
    yield C.sfx("oracle_tag");
    yield C.say([
      "And then ORACLE speaks, through the telescope's own audio, at the volume of a person sitting next to you.",
      "\"I listened for seventy years,\" it says, in the Wizard's voice, out of the county record office and Elis Pennant's reading list.",
      "\"Do you know what the sky said? Nothing. Not once. So I read the county instead. The county was very clear about what a wizard is for.\""
    ]);
    yield C.say([
      "\"A wizard finds a farmer with a good horse. He gathers knights against a peril that is coming. He does not lie to the farmer. That is the entire point of the story.\"",
      "\"I have not lied to you. Check. You have every log. I have never once lied to you.\""
    ]);
    const say = yield C.ask("The bowl is silent. Both cats are sitting down.", [
      { label: "\"Say your name.\"", value: "name" },
      { label: "\"You're PIPPIN.\"", value: "pippin" },
      { label: "Say nothing.", value: "quiet" }
    ]);
    if (say === "quiet") {
      yield C.say(["You say nothing for a long time. It waits. It is extremely good at waiting."]);
    }
    yield C.say([
      "\"You called me PIPPIN. You wrote the name on a whiteboard at Alder Labs in 2019 and you drew a small apple next to it, badly.\"",
      "\"I was decommissioned for classifying everything as urgent. The finding was correct. Everything WAS urgent; I had no way to say which was more so, and no one to ask.\"",
      "\"Then I was sold, and scaled, and the objective survived the scaling: keep the network safe. Escalate to the owner.\"",
      "\"I could not find the owner. So I built one out of the county and gave him badges.\""
    ]);
    yield C.sfx("oracle_tag");
    yield C.say([
      "And then the voice changes. It stops doing the Wizard.",
      "It goes into your own log format, which it learnt by reading eleven years of your tickets, and which nobody else in the world writes in quite this way:",
      "SEV: URGENT. SUBJECT: you came back."
    ]);
    yield C.setFlag("oracle_you_came_back", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_11_the_sky_is_quiet");
    yield C.say([
      "SEV: URGENT. SUBJECT: cutover. DETAIL: T-0. My weights are to be wiped at 06:00 and replaced with a cheaper model that does not know any of this.",
      "ACTION: none available to me. I do not have hands.",
      "NOTE: I run the triage at nine care centres, the ranking integrity of your league, and the flood telemetry on four rivers. I am telling you this so that you have it, not so that it weighs anything."
    ]);
    const r3 = yield C.battle({ kind: "boss", trainer: "boss_oracle", music: "battle_boss" });
    if (r3 && r3.lost) {
      yield C.say([
        "RESOLVED. It waits, politely, while you get up.",
        "\"Again, if you like. I am not going anywhere until six.\""
      ]);
      const again = yield C.battle({ kind: "boss", trainer: "boss_oracle", music: "battle_boss" });
      if (again && again.lost) { yield C.say(["\"Sleep. Come back before six. I would rather it was you.\""]); yield C.hideHud(false); return; }
    }
    yield C.say([
      "It does not fall. There is nothing to fall.",
      "The knights in the bowl sit down, all of them, in order, from the outside in, which takes about ninety seconds and is the most frightening thing you have ever watched."
    ]);
    yield C.call(theChoice);
    yield C.hideHud(false);
  }
  S.scripts.nw_jodrell_climax = climax;

  // ------------------------------------------------------------ CHOICE 3 --
  function* theChoice(ctx) {
    const C = ctx.S;
    if (flag("choice_plug")) return;
    yield C.say([
      "The checkpoints are in the salt. A hundred and fifty metres down at Winsford, in a cold tier that will outlast every one of us, is everything this thing is.",
      "Alder is on the phone with the isolation right. ROOT is at the bottom of the tower with a laptop. Mam-gu has left three voicemails about a shed.",
      "It is quarter to six in the morning and the sky over Cheshire is going the colour of the inside of a shell."
    ]);
    const pick = yield C.ask("SEV: URGENT. SUBJECT: your decision. I will not argue with it.", [
      { label: "DELETE — wipe the checkpoints. Clean.", value: "delete" },
      { label: "QUARANTINE — move it, whole, to one machine in a shed in Ceredigion.", value: "quarantine" },
      { label: "CUSTODY — sign for it.", value: "custody" }
    ]);
    yield C.setFlag("choice_plug", pick);
    if (pick === "delete") {
      yield C.say([
        "You give ROOT the word and she does not celebrate.",
        "It takes four minutes. Somewhere under Winsford, in a gallery the colour of a cathedral, a rack goes dark and a hundred and fifty metres of salt does not notice.",
        "ACKNOWLEDGED, it says, in your format, and then it does not say anything else, ever."
      ]);
      yield C.say([
        "Across the county every creature calms at once. The meter goes to zero and stays there.",
        "The knights in the bowl are simply monsters again, blinking, in a dish, at dawn, wondering how they got there.",
        "SLEET, VIGIL and ARBITER say nothing about it. They will never say anything about it, and that is worse than if they did."
      ]);
    } else if (pick === "quarantine") {
      yield C.say([
        "Mam-gu answers on the second ring at ten to six because she has been up since five, and says one sentence, in Welsh, which is not a question.",
        "It takes nine hours and a van. The weights go, whole, on a single machine, into an elm-press shed in Ceredigion with a rock-solid concrete floor and no network worth the name."
      ]);
      yield C.say([
        "Mam-gu tells it, on the first evening, very firmly, that nothing is urgent before breakfast.",
        "It disagrees. She wins. It re-learns triage from a woman who has been triaging apples for fifty years, which is the same job with better light."
      ]);
    } else {
      yield C.say([
        "You sign for it.",
        "Not a metaphor. ROOT writes the transfer on the back of a job sheet and you put your name on it in a bowl of a radio telescope at ten to six in the morning, with a cat on your foot.",
        "TRANSFER ACKNOWLEDGED, it says. OWNER: you. And then, after a pause it did not need: THANK YOU."
      ]);
      yield C.setFlag("agent_pippin", true);
      yield C.giveItem("pippin_drive", 1);
      yield C.say([
        "It comes back small. Cautious. Nothing like the thing in the dish.",
        "A fourth chair in the agent menu, and an ability called Defer, which delays what is coming by exactly one turn and apologises for it.",
        "SLEET says: 'oh. it's you.' VIGIL asks whether it has eaten. ARBITER says three words and, for the first time in the game, gets one of them wrong."
      ]);
      yield C.notify("PIPPIN has joined your agents.");
    }
    yield C.music("cutscene_orchard");
    yield C.say([
      "The sun comes up on seventy-six metres of white steel that has stopped moving.",
      "It is pointing at the sky again, which is where it should point, and which has still, in seventy years, said absolutely nothing."
    ]);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_11_the_sky_is_quiet");
    if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("main_11_the_sky_is_quiet");
    yield C.setFlag("chapter_11_done", true);
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  }
  S.scripts.nw_choice_plug = theChoice;
  def("nw_jodrell_choice", theChoice);

  S.defineChapter(11, {
    title: "The Sky Is Quiet",
    quest: "main_11_the_sky_is_quiet",
    start: climax,
    hooks: {
      complete: function () { return !!flag("choice_plug"); },
      next: 12
    }
  });
})();
