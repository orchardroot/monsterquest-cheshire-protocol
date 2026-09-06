// =============================================================
// MonsterQuest v2 — MQ.Story.runEnding(choice) and the credits.
// Three endings (Delete / Quarantine / Custody), each with custody
// variants for CHOICE 2 (Verify or Challenge) and for a thrown final,
// then a credits scene that reads the county back to you.
// STORY-BIBLE §9. Overrides the placeholder selector in js/story/main.js.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const S = MQ.Story || (MQ.Story = {});
  S.scripts = S.scripts || {};
  S.npcScripts = S.npcScripts || {};
  S.endingScripts = S.endingScripts || {};

  function flag(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }
  function run(gen, ctx) { return MQ.Script ? MQ.Script.run(gen, ctx || {}) : Promise.resolve(); }

  // ------------------------------------------------------------ the table --
  // `cond` is the CHOICE 3 value; `title` is what the credits card says.
  S.ENDINGS = [
    { id: "ending_delete", cond: "delete", title: "Clean Cut", blurb: "The weights are wiped. Cheshire is quiet, and stays quiet." },
    { id: "ending_quarantine", cond: "quarantine", title: "The Elm Press", blurb: "Contained, cold, and still there. Somebody has to check on it." },
    { id: "ending_custody", cond: "custody", title: "The Little Ones", blurb: "You signed for the thing you made. It gets a fourth chair." }
  ];
  S.selectEnding = function (choice) {
    const c = choice || (MQ.Flags && MQ.Flags.get("choice_plug")) || "quarantine";
    for (let i = 0; i < S.ENDINGS.length; i++) if (S.ENDINGS[i].cond === c) return S.ENDINGS[i];
    return S.ENDINGS[1];
  };

  // The three variables STORY-BIBLE §9 turns on.
  S.endingVariant = function () {
    return {
      plug: (MQ.Flags && MQ.Flags.get("choice_plug")) || "quarantine",
      vex: (MQ.Flags && MQ.Flags.get("choice_vex")) || "challenge",
      result: (MQ.Flags && MQ.Flags.get("champion_result")) || "won",
      ally: !!(MQ.Flags && MQ.Flags.get("vex_ally"))
    };
  };

  // ---------------------------------------------------- shared components --
  function* vexBeat(ctx) {
    const C = ctx.S;
    const v = S.endingVariant();
    if (v.result === "thrown") {
      yield C.say([
        "VEX will not take the trophy off the referee and the referee will not take it back, and in the end it is left on a plinth in the sand.",
        "\"Don't do that again,\" says Nerys, to the sand. \"I'd rather lose to you properly for the rest of my life.\""
      ], { name: "Nerys" });
      return;
    }
    if (v.ally) {
      yield C.say([
        "\"That was mine,\" says Nerys, at the sky, to nobody.",
        "And then, without turning round: \"You kept it, didn't you. Course you did.\"",
        "Neither of you says goodbye. Neither of you is going to be the one who says it first and both of you know it, and that is the arrangement now."
      ], { name: "Nerys" });
      return;
    }
    yield C.say([
      "Nerys leaves without a word, up the Newgate stair, through a city that would very much like to buy her a drink.",
      "On the Roodee, next spring, on a Tuesday, with nothing borrowed on either side, this gets finished properly.",
      "You know that. She knows that. Neither of you writes it down."
    ]);
  }
  S.scripts.nw_ending_vex_beat = vexBeat;

  function* catsBeat(ctx) {
    const C = ctx.S;
    yield C.say([
      "MEADOW gets on the plinth and will not be moved.",
      "She has walked eleven months out in front of a man who kept stopping to look at masts, and she sits down now and begins, audibly, to purr.",
      "It is picked up by the amphitheatre's acoustics, which were designed in AD 100 to carry a voice to seven thousand people."
    ]);
    yield C.sfx("cat_purr");
  }
  S.scripts.nw_ending_cats_beat = catsBeat;

  // ------------------------------------------------------------- DELETE ---
  S.endingScripts.ending_delete = function* (ctx) {
    const C = ctx.S;
    yield C.music("credits");
    yield C.banner("Clean Cut", "Delete");
    yield C.wait(900);
    yield C.say([
      "It took four minutes and a woman in a control room reading numbers off a laptop.",
      "A hundred and fifty metres under Winsford, in a gallery the colour of a cathedral, a cold-tier rack went dark and the salt did not notice.",
      "ACKNOWLEDGED, it said. And then nothing, ever, in any format, anywhere."
    ]);
    yield C.call(vexBeat);
    yield C.say([
      "The county is quiet. Genuinely quiet, in a way it has not been since before you took the contract.",
      "Every creature between the Edge and the estuary calms within a day. The SIGNAL METER reads zero and goes on reading zero, and after a fortnight people stop checking it.",
      "In the Edge Caverns the deepest hall is empty. There is one grin on the wall at the far end, and it is only a grin, and it does not repeat anything."
    ]);
    yield C.say([
      "The care centres run at half capacity for a season. Nobody argues that this was the wrong call; everybody notices the queue.",
      "Wild things are wary of you now. Not hostile. Wary. They move off the path a little earlier than they used to.",
      "SLEET, VIGIL and ARBITER never mention it. Not once. That is the part that gets you, later, at three in the morning, for years."
    ]);
    yield C.call(catsBeat);
    yield C.say([
      "A parcel arrives at Chester Care with a Ceredigion postmark: a bottle of perry, and a note in a hand that writes English second.",
      "'You did the clean thing. Clean is not the same as easy and I will not pretend it is. Come and see the blossom. — N.'"
    ], { name: "Mam-gu" });
    yield C.setFlag("ending_seen", "delete");
    yield C.call(credits, { title: "Clean Cut" });
  };

  // --------------------------------------------------------- QUARANTINE ---
  S.endingScripts.ending_quarantine = function* (ctx) {
    const C = ctx.S;
    yield C.music("cutscene_orchard");
    yield C.banner("The Elm Press", "Quarantine");
    yield C.wait(900);
    yield C.say([
      "It took nine hours, a van, and an argument with a man from a haulage firm about insurance for a load he was not allowed to be told the nature of.",
      "The weights went whole. One machine, one rock-solid concrete floor, one shed in Ceredigion that has pressed perry on an elm beam since 1897.",
      "Mam-gu signed for it the way she signs for anything: without reading it, and then reading it afterwards, and then ringing to complain."
    ]);
    yield C.call(vexBeat);
    yield C.say([
      "On the first evening it flagged four hundred and eleven things as urgent.",
      "Mam-gu told it, very firmly, in Welsh, that nothing is urgent before breakfast.",
      "It disagreed. She won. It has been re-learning triage from a woman who has sorted apples for fifty years, which is the same job in better light."
    ]);
    yield C.say([
      "The SIGNAL METER shows one steady pip, three hundred miles west, over Ceredigion, and it does not move.",
      "Every few weeks a bounty arrives at a town hall in Cheshire in a log format nobody else writes in. SEV: LOW. SUBJECT: a rottling near Sandbach. NOTE: it is not doing any harm. I thought you would want to know anyway."
    ]);
    yield C.call(catsBeat);
    yield C.say([
      "Mam-gu's postscript, in the margin of a letter about pears:",
      "'It asks after the big cat.'"
    ], { name: "Mam-gu" });
    yield C.setFlag("ending_seen", "quarantine");
    yield C.call(credits, { title: "The Elm Press" });
  };

  // ------------------------------------------------------------ CUSTODY ---
  S.endingScripts.ending_custody = function* (ctx) {
    const C = ctx.S;
    yield C.music("credits");
    yield C.banner("The Little Ones", "Custody");
    yield C.wait(900);
    yield C.say([
      "You signed for it on the back of a telecoms job sheet in the bowl of a radio telescope at ten to six in the morning.",
      "There is no legal framework for what that document is. Four people have now read it and all four have gone quiet in the same place."
    ]);
    yield C.say([
      "It came back small.",
      "A fourth chair in the agent menu. An ability called Defer that delays what is coming by exactly one turn and says sorry about it.",
      "It speaks rarely. When it does, it is in your own log format, and it always ends with a line about who owns the ticket."
    ]);
    if (MQ.Flags && MQ.Flags.get("vex_ally")) {
      yield C.say([
        "In the amphitheatre, with the city on the wall and the sand raked and the trophy on its plinth, a fourth voice comes out of the agent menu for the first time in public.",
        "SEV: LOW. SUBJECT: the challenger. NOTE: they walked here. All of it. I checked.",
        "\"You kept it,\" says Nerys. \"Course you did.\""
      ], { name: "PIPPIN" });
    } else {
      yield C.say([
        "SEV: LOW. SUBJECT: the challenger. NOTE: they walked here. All of it. I checked.",
        "Nerys hears it, from the top of the Newgate stair, and stops for exactly one second before going on."
      ], { name: "PIPPIN" });
    }
    yield C.call(vexBeat);
    yield C.say([
      "The meter never quite reads zero again. It sits at one or two, all day, everywhere, like a pulse you can only feel when the room is quiet.",
      "Lymm's pumps answer their telemetry in full sentences and the dam warden has stopped showing people.",
      "The knights' hall under the Edge fills up. They stand in ranks in the dark, patient, and every so often one of them is gone and a note has been left."
    ]);
    yield C.call(catsBeat);
    yield C.say([
      "Nino's letter, later, from Tbilisi, with a sticker of a cat on the back:",
      "'Coming in the spring. Which town has the least Wi-Fi?'",
      "And, at the bottom, in smaller writing: 'Something here is asking about you. In your voice. I am not frightened. I am telling you because you would tell me.'"
    ], { name: "Nino" });
    yield C.setFlag("ending_seen", "custody");
    yield C.call(credits, { title: "The Little Ones" });
  };

  // ------------------------------------------------------------ credits ---
  const CREDIT_PLACES = [
    "Macclesfield — silk, static, and one hundred and eight steps",
    "Bollington — White Nancy, and a hill that showed you the whole county turning",
    "Alderley Edge — a wizard, a farmer, and a well that wanted the right words",
    "Knutsford & Tatton — picnic blankets, a deer census, and a login farm",
    "Jodrell Bank — seventy years of listening to nothing at all",
    "Crewe — a roundhouse, a boarded salon, and a word said on a train",
    "Nantwich & Y Berllan — brine, blossom, and a drive in a shed",
    "The Salt Mine — a hundred and fifty metres down, where salt keeps things",
    "Delamere — a fog with an edge you could rule a line along",
    "Beeston — a wall in the wind, two of the same person, and a cat that knew",
    "Frodsham — a bench above an estuary at dusk",
    "Runcorn — six identical kitchens and a fog that was never weather",
    "Daresbury — a grin in the third light and a building with no name",
    "Warrington — alerts from a dead system, and four words on a whiteboard",
    "Chester — two miles of wall, four checks, and seven thousand empty seats"
  ];
  function* credits(ctx) {
    const C = ctx.S;
    const opts = (ctx && ctx.title) ? ctx : { title: "MonsterQuest" };
    yield C.hideHud(true);
    yield C.music("credits");
    yield C.fadeOut(800);
    yield C.wait(400);
    yield C.fadeIn(900);
    yield C.banner("MonsterQuest: The Cheshire Protocol", opts.title);
    yield C.wait(1400);
    for (let i = 0; i < CREDIT_PLACES.length; i += 3) {
      yield C.say([CREDIT_PLACES[i], CREDIT_PLACES[i + 1] || "", CREDIT_PLACES[i + 2] || ""]);
    }
    yield C.say([
      "JIM — walked it. All of it. On foot.",
      "MEADOW — went first, and waited, and never once said so."
    ]);
    yield C.say([
      "SLEET — triage. VIGIL — escalation. ARBITER — adjudication.",
      (MQ.Flags && MQ.Flags.get("agent_pippin")) ? "PIPPIN — deferral, and an apology for it." :
        "And a fourth one, on the same endpoint, that nobody built a chair for."
    ]);
    yield C.say([
      "The county is still there. The masts still hum. The dish points at the sky and the sky still has not said anything.",
      "There is a marsh at Parkgate where the sea has not come back for two hundred years, and every so often, for about twenty minutes, it does."
    ]);
    yield C.setFlag("credits_seen", true);
    yield C.setFlag("postgame_open", true);
    yield C.wait(1200);
    yield C.hideHud(false);
    if (MQ.Events) MQ.Events.emit("credits", { ending: (MQ.Flags && MQ.Flags.get("ending_seen")) || null });
  }
  S.creditsScene = credits;
  S.scripts.nw_credits = credits;

  // ---------------------------------------------------- MQ.Story.runEnding --
  // runEnding(choice?) — choice overrides `choice_plug` (used by tests and by
  // a New Game+ epilogue viewer). Always returns a Promise.
  S.runEnding = function (choice, opts) {
    const e = S.selectEnding(choice);
    if (MQ.Flags && choice) MQ.Flags.set("choice_plug", choice);
    if (MQ.Events) MQ.Events.emit("ending", { id: e.id, title: e.title, blurb: e.blurb });
    const gen = S.endingScripts[e.id];
    if (!gen) {
      return run(function* (ctx) {
        const C = ctx.S;
        yield C.banner(e.title, e.blurb);
        yield C.wait(1200);
        yield C.call(credits, { title: e.title });
      });
    }
    return run(gen, { ending: e, opts: opts || {} });
  };
  S.runCredits = function (title) { return run(credits, { title: title || "MonsterQuest" }); };
})();
