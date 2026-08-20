// =============================================================
// MonsterQuest v2 — POST-GAME: "The Fifth Pulse"
// Levels 55-70. A pulse from the west, past Y Berllan, out at sea.
// GRINMALKIN persists; the salt checkpoints are cold and someone is
// still drinking from Ince; the dish turns to face you when you visit;
// and on floor five of THE STACK there is somebody in your coat.
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

  // ------------------------------------------------- the pulse at Ince ----
  def("nw_fifth_pulse_post", function* (ctx) {
    const C = ctx.S;
    if (flag("fifth_pulse")) {
      yield C.say(["Four notes on the intake screens. And under them, slower, from a very long way west, a fifth."]);
      return;
    }
    yield C.setFlag("fifth_pulse", true);
    yield C.music("cutscene_signal");
    yield C.say([
      "The listening post. An aerial cable-tied to a fence post, a notebook in a sandwich box, and a marsh going gold at the edges.",
      "The intake hums its four notes. It has hummed its four notes since before the credits."
    ]);
    yield C.say([
      "And under it — slower, further, and on a rhythm that is not the county's — there is a fifth.",
      "It comes from the west. Past the Wirral, past the Clwydians, past Y Berllan and the lane to Aberaeron, and then out over water.",
      "It is not answering the four. It is not being answered. It has, as far as the notebook can tell, been doing this for eleven weeks."
    ]);
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_13_fifth_pulse");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_13_fifth_pulse");
    yield C.notify("The fifth pulse.");
    yield C.music("dungeon_bog");
  });

  // --------------------------------------------- the sixty-first boat -----
  def("nw_ellesmere_mirror", function* (ctx) {
    const C = ctx.S;
    if (flag("ellesmere_mirror")) {
      yield C.say(["The index is still there and still current and the generator still has fuel that nobody buys."]);
      return;
    }
    yield C.setFlag("ellesmere_mirror", true);
    yield C.music("dungeon_stack");
    yield C.sfx("oracle_tag");
    yield C.say([
      "Sixty feet of steel with no name on the bow. Inside: four cold-tier racks, a generator, and a terminal that is on.",
      "The index on the terminal is the Winsford salt archive. Mirrored. Complete. Timestamped this morning."
    ]);
    const plug = flag("choice_plug");
    if (plug === "delete") {
      yield C.say([
        "Every entry is a tombstone. Deleted, deleted, deleted, with dates and a reason field, and the reason field says the same thing four hundred thousand times:",
        "OWNER DECISION. ACKNOWLEDGED.",
        "The last entry is eleven weeks old and it is not a tombstone. It is a single line: 'somebody is still keeping the generator fuelled and it is not me.'"
      ]);
    } else if (plug === "quarantine") {
      yield C.say([
        "Every entry has a forwarding address, and the forwarding address is a shed in Ceredigion.",
        "The last line reads: SEV: LOW. SUBJECT: this boat. NOTE: I have told the museum three times. They have counted sixty. I am the sixty-first. Please tell Ffred."
      ]);
    } else {
      yield C.say([
        "The index is live and the ownership field on every one of four hundred thousand records has the same name in it.",
        "It is yours.",
        "SEV: LOW. SUBJECT: this boat. NOTE: I did not want you to find this by accident. I wanted you to find it. There is a difference and I have been working on it."
      ]);
    }
    yield C.giveItem("capsule_night", 5);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_13_fifth_pulse");
    yield C.music("town_zoo");
  });

  // ----------------------------------------------- Lymm's pumps (custody) --
  def("nw_lymm_pumps", function* (ctx) {
    const C = ctx.S;
    if (flag("choice_plug") !== "custody") {
      yield C.say([
        "The telemetry screen scrolls four lines that repeat: level, flow, level, flow.",
        "That is all it has ever done, whatever the dam warden thinks he saw in the spring."
      ], { name: "Dam-Warden Bryn" });
      return;
    }
    if (!flag("lymm_pumps_talk")) {
      yield C.setFlag("lymm_pumps_talk", true);
      yield C.sfx("oracle_tag");
      yield C.say([
        "The screen clears and writes, at reading speed, in a format nobody else in this county writes in:",
        "SEV: LOW. SUBJECT: the dam. DETAIL: outflow nominal, sluice gearing dry, one paper item removed from the mechanism in the spring by a person with two cats.",
        "ACTION: none required. OWNER: you.",
        "NOTE: the warden shows people this and they laugh at him. I would like that to stop. Please tell him it was me."
      ]);
      yield C.say([
        "Bryn is stood behind you with a mug in his hand and he has not said anything for a while.",
        "\"Four months,\" he says. \"Four months I've been the man who talks about the pumps.\""
      ], { name: "Dam-Warden Bryn" });
      yield C.giveItem("brew_cats_cup", 1);
      return;
    }
    yield C.say([
      "SEV: LOW. SUBJECT: the dam. DETAIL: nominal. NOTE: the warden has stopped showing people. Thank you."
    ]);
  });

  // ------------------------------------------ the remnant on floor five ---
  def("nw_stack_remnant", function* (ctx) {
    const C = ctx.S;
    if (flag("amos_jim_face")) {
      yield C.say(["Floor five. Fog to the knee, one aisle lit, and a coat on the floor at the end of it that belongs to nobody."]);
      return;
    }
    yield C.freeze(true);
    yield C.music("battle_boss");
    yield C.weather("fog");
    yield C.say([
      "The aisle at the end of floor five is lit and there is somebody standing in it with their hands in their pockets.",
      "Walker's jacket. Day-pack. Tired.",
      "It says, at exactly your volume, with exactly your pause: \"Noted.\""
    ]);
    yield C.say([
      "Both cats stop. Neither of them growls, and that is the thing you will think about afterwards.",
      "MEADOW, who has been afraid of exactly two things in her life, sits down between you and it and does not take her eyes off it."
    ]);
    yield C.say([
      "It has worn Alder's face, and ROOT's, and VEX's, and it has been working steadily along a list.",
      "\"Not concerned,\" it says. \"Slightly concerned.\"",
      "It is not a threat. It is a rehearsal, and you have arrived on the last night of the run."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "boss_stack_remnant", music: "battle_boss" });
    if (!r || r.lost) {
      yield C.say(["It waits at the end of the aisle, patiently, wearing you, while you go back down five flights."]);
      yield C.freeze(false);
      return;
    }
    yield C.setFlag("amos_jim_face", true);
    yield C.say([
      "It goes out the way a screen goes out.",
      "The coat falls in a heap and is nobody's, and it is not even a very good coat; it is a description of a coat by something that has only read about them."
    ]);
    yield C.say([
      "MEADOW gets into the empty coat and sits down in it and will not be moved for some time.",
      "You pick her up, coat and all, and carry her down five flights of a decommissioned datacentre, and neither of you says anything, because one of you cannot."
    ]);
    yield C.achievement("ach_40");
    yield C.giveItem("face_fragment_2", 1);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_13_fifth_pulse");
    yield C.weather("clear");
    yield C.freeze(false);
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  });

  // ---------------------------------------------------- the sleeping knights
  function knight(id, trainerId, intro, win) {
    def(id, function* (ctx) {
      const C = ctx.S;
      if (flag(id + "_beaten")) {
        yield C.say(["It is where it was. It will be where it was tomorrow."]);
        return;
      }
      const plug = flag("choice_plug");
      if (plug === "delete") {
        yield C.say([
          "There is nothing standing here.",
          "There is a place where something stood for four years, and the grass has not grown back into it, and there is one grin on the stone behind it."
        ]);
        return;
      }
      yield C.say(intro);
      const r = yield C.battle({ kind: "boss", trainer: trainerId, music: "battle_legendary" });
      if (!r || r.lost) { yield C.say(["It waits. It is what it is best at."]); return; }
      yield C.setFlag(id + "_beaten", true);
      yield C.say(win);
      yield C.giveItem("capsule_root", 5);
    });
  }
  knight("nw_amphitheatre_knight", "elite_knight_first", [
    "In the amphitheatre after dark, in the raked sand, there is a figure in armour that is mostly sandstone and a little bit signal.",
    "It has stood in the dark for four years being told a story about a peril. It would like to know whether the story was true."
  ], [
    "It lies back down in the sand without hurry, the way a thing does that has all the time there is.",
    "In the morning the groundsman rakes over the shape and does not mention it."
  ]);
  knight("nw_ince_knight", "elite_knight_third", [
    "Salt-crusted, mine-shaped, entirely awake, and standing in a reed bed nine miles from the nearest gallery.",
    "It came out here on its own. It has been listening to the intake, which is the only thing in Cheshire that still hums the four notes."
  ], [
    "It sits down in the reeds like a hill deciding to be a hill.",
    "Every checkpoint in this county was in the salt. This one WAS the salt."
  ]);

  // ------------------------------------------------- VEX on the Roodee ----
  def("nw_roodee_rematch", function* (ctx) {
    const C = ctx.S;
    const ally = flag("vex_ally");
    if (!flag("roodee_rematch")) {
      yield C.setFlag("roodee_rematch", true);
      if (ally) {
        yield C.say([
          "Oldest racecourse in the world, empty on a Tuesday, and a nineteen-year-old sitting on the rail eating chips.",
          "\"Weekly,\" says Nerys. \"That's the arrangement now. I've written it on a calendar like a person.\""
        ], { name: "Nerys" });
      } else {
        yield C.say([
          "Oldest racecourse in the world, empty on a Tuesday, and somebody stood in the middle of it who has not spoken to you since a wall.",
          "\"Six,\" says Nerys, without turning round. \"Built by hand. Nothing on this team has ever reported to anything.\"",
          "\"I'm not apologising. This IS the apology. Keep up.\""
        ], { name: "Nerys" });
      }
    }
    const r = yield C.battle({ kind: "trainer", trainer: "vex_roodee", music: "battle_vex" });
    if (r && r.lost) {
      yield C.say(["\"Good. Again next week.\"", ally ? "\"...and come for tea. My mum's asking.\"" : "\"...and come again. Just come again.\""], { name: "Nerys" });
      return;
    }
    yield C.say([
      "\"Fine. FINE.\"",
      ally ? "\"Same time next week, root user.\"" : "\"Same time next week. And — right. Thanks. For asking me a question you already knew the answer to. Eventually.\""
    ], { name: "Nerys" });
    if (!ally && !flag("vex_reconciled")) {
      yield C.setFlag("vex_reconciled", true);
      yield C.setFlag("vex_ally", true);
      yield C.notify("Nerys will travel with you.");
    }
  });

  // ---------------------------------------------------------- the chapter --
  S.defineChapter(13, {
    title: "The Fifth Pulse",
    quest: "main_13_fifth_pulse",
    start: function* (ctx) {
      const C = ctx.S;
      yield C.setFlag("postgame_open", true);
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_13_fifth_pulse");
      yield C.say([
        "It is not over, in the way that nothing is ever over; it is only that the urgent part has stopped and the interesting part has started.",
        "There is a pulse coming from the west — past the Wirral, past the Clwydians, past an orchard in Ceredigion, and then out over the sea.",
        "Nobody put it there. Nothing is answering it. It has been doing this for eleven weeks and it is getting slightly closer."
      ]);
      yield C.say([
        "Chester Zoo is one penguin short. Ellesmere Port has a sixty-first boat.",
        "THE STACK has re-opened, cold, with the cooling still running, and floor five is warmer than floor four.",
        "And at Jodrell Bank the dish turns to face you when you arrive, which the staff have stopped apologising for."
      ]);
      yield C.notify("THE FIFTH PULSE — post-game open.");
    },
    hooks: {
      complete: function () { return !!(flag("fifth_pulse") && flag("amos_jim_face")); },
      next: null
    }
  });
})();
