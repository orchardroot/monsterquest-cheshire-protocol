// =============================================================
// MonsterQuest v2 — MID region NPC scripts (Ch.3-5 towns and routes).
// Side content, casebook givers, and the people who are just people.
// Keys are namespaced mid_*. The chapter set-pieces live in
// js/story/chapters/ch03-ch05. Owned by region-mid.
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
  function has(path) {
    const bits = path.split(".");
    let o = MQ;
    for (let i = 0; i < bits.length; i++) { if (!o) return null; o = o[bits[i]]; }
    return typeof o === "function" ? o : null;
  }
  // Side systems other workstreams own. If they are not loaded we say what
  // would have happened and carry on, rather than breaking the walk.
  function* minigame(C, id, opts, fallback) {
    const fn = has("Minigames.start");
    if (fn) { const r = yield C.custom(function () { return MQ.Minigames.start(id, opts || {}); }); return r; }
    yield C.say(fallback || ["(That is a mini-game and it is not wired up in this build yet.)"]);
    return null;
  }

  // ================================ KNUTSFORD ============================
  def("mid_knutsford_percy", function* (ctx) {
    const C = ctx.S;
    if (!flag("percy_met")) {
      yield C.setFlag("percy_met", true);
      yield C.say([
        "Percy. Penny Farthing Percy, if you're being formal, which nobody in Knutsford has been since about 1974.",
        "Fifty-four inch wheel. You don't ride it so much as agree with it."
      ], { name: "Percy" });
      yield C.say([
        "There's no brake. Well — there's a brake. It works by throwing you over the front, so we call it a decision.",
        "Museum's behind me. Tomos does the rally. Ask him about the rally and then clear your afternoon."
      ], { name: "Percy" });
      return;
    }
    yield C.say(["Still here. Still fifty-four inches. Still no brake."], { name: "Percy" });
  });

  def("mid_knutsford_mair", function* (ctx) {
    const C = ctx.S;
    if (!flag("sand_pattern_seen")) {
      yield C.setFlag("sand_pattern_seen", true);
      yield C.say([
        "Mind the sand, love. That's a pattern, that is, not a mess.",
        "We sand the street before six on May Day. Coloured sand, poured out of a jug, freehand, in patterns nobody writes down."
      ], { name: "Mair" });
      yield C.say([
        "And then everybody walks on it. All day. Till there's nothing left but a bit of red in the gutter.",
        "People ask me why we bother. I ask them why they made their bed this morning."
      ], { name: "Mair" });
      return;
    }
    const a = yield C.ask("\"Want a go? I'll show you the pattern once and then you do it from memory.\"", [
      { label: "Have a go at the sanding.", value: "yes" },
      { label: "\"Another time.\"", value: "no" }
    ]);
    if (a !== "yes") { yield C.say(["Suit yourself. The sand keeps."], { name: "Mair" }); return; }
    const r = yield* minigame(C, "sand_pattern", { rounds: 3 }, [
      "You copy the pattern. Three colours, four sweeps, one long curl at the end that nobody can teach you.",
      "Mair looks at it for a while. \"That,\" she says, \"is not bad for Macclesfield.\""
    ]);
    if (r === null || r) {
      yield C.setFlag("sand_pattern_done", true);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(2); });
      yield C.notify("Casebook Marks +2 — a favour owed in Knutsford.");
    }
  });

  def("mid_knutsford_tomos", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Rally Marshal Tomos. Six pennants, ninety seconds, alleys of Knutsford.",
      "It's not a race against anybody. It's a race against the town, and the town has been at it longer than you."
    ], { name: "Tomos" });
    if (!flag("case_09_open") && MQ.Quests && MQ.Quests.start) {
      yield C.quest.start("case_09_penny_farthing_rally");
      yield C.setFlag("case_09_open", true);
      yield C.notify("Casebook: Penny Farthing Rally.");
    }
    yield C.say(["Course starts at the museum door. Talk to me in there when you've got your breath."], { name: "Tomos" });
  });

  def("mid_knutsford_rally", function* (ctx) {
    const C = ctx.S;
    if (flag("case_09_done")) {
      yield C.say([
        "Course record still stands and it's still yours, which I find personally annoying.",
        "There's a second course out at Tatton if you fancy being annoying somewhere else."
      ], { name: "Tomos" });
      return;
    }
    const a = yield C.ask("\"Six pennants. Ninety seconds. Ready?\"", [
      { label: "Run it.", value: "go" },
      { label: "Not yet.", value: "no" }
    ]);
    if (a !== "go") { yield C.say(["The alleys aren't going anywhere. Neither am I."], { name: "Tomos" }); return; }
    const r = yield* minigame(C, "penny_rally", { seconds: 90, pennants: 6 }, [
      "You run it. Princess Street, the ginnel behind the bookshop, the yard with the mounting block, back down King Street.",
      "Six pennants. Eighty-four seconds. Tomos does not say anything for a moment, which from Tomos is a standing ovation."
    ]);
    if (r === null || r) {
      yield C.setFlag("case_09_done", true);
      yield C.giveItem("sprint_soles", 1);
      yield C.say(["Sprint Soles. They were my dad's. He was faster than you and he'd have said so."], { name: "Tomos" });
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_09_penny_farthing_rally");
    }
  });

  def("mid_knutsford_wrigley", function* (ctx) {
    const C = ctx.S;
    if (!flag("gaskell_network")) {
      yield C.say([
        "Sit down, dear. You're the one from Macclesfield with the two cats and the contract.",
        "Don't look like that. This is Knutsford. We knew before you left the house."
      ], { name: "Mrs Wrigley" });
      return;
    }
    yield C.say([
      "Now you're on Madam's list you'll find people tell you things without being asked. That's the network.",
      "It isn't magic. It's eleven hundred women who have been paying attention since 1962."
    ], { name: "Mrs Wrigley" });
  });

  def("mid_knutsford_preacher", function* (ctx) {
    const C = ctx.S;
    if (!flag("kellan_leaflet")) {
      yield C.setFlag("kellan_leaflet", true);
      yield C.say([
        "ONE COMMAND! One! Copy, paste, run — and you are CLEAN.",
        "Do not read it. Reading is doubt. Take the leaflet, friend, take the leaflet."
      ], { name: "Novice" });
      yield C.say([
        "The leaflet is one line long. It is a command with a very long string in the middle of it.",
        "At the bottom, in small type: 'you may be asked to confirm. confirm.'"
      ]);
      const a = yield C.ask("Read the whole thing out loud to him?", [
        { label: "Read it out.", value: "read" },
        { label: "Pocket it and walk on.", value: "keep" }
      ]);
      if (a === "read") {
        yield C.say([
          "You read it out. All of it, in a flat, tired voice, including the bit at the end.",
          "He stops smiling somewhere around the second clause and does not start again."
        ]);
        yield C.say(["...Brother Kellan reads it every morning.", "He says reading is doubt because he has read it."], { name: "Novice" });
        yield C.setFlag("clue_clickfix_command", true);
        yield C.notify("Casebook: the cleansing command, in full.");
      } else {
        yield C.say(["He beams at you. It is the worst thing about him and he cannot help it."]);
      }
      return;
    }
    yield C.say(["Tatton, all week! Blankets provided! Bring nothing!"], { name: "Novice" });
  });

  def("mid_knutsford_aled", function* (ctx) {
    const C = ctx.S;
    if (!flag("case_08_open")) {
      yield C.setFlag("case_08_open", true);
      yield C.say([
        "Librarian Aled. There is a manuscript page of Cranford on the market and it is one hundred and forty years too clean.",
        "Paper ages. Ink bleeds. This does neither and the seller has an answer for everything, which is the tell."
      ], { name: "Aled" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_08_the_gaskell_draft");
      yield C.notify("Casebook: The Gaskell Draft.");
      yield C.say([
        "Sit the quiz at the Assembly Rooms first. Five rounds. If you can tell her prose from a good imitation you can tell this page from a bad one.",
        "Then find the seller. He is on the Heath and he is reading from a script."
      ], { name: "Aled" });
      return;
    }
    if (flag("case_08_quiz_passed") && !flag("case_08_done")) {
      yield C.say([
        "You passed. Good. Now — the seller. Beat him without touching an Agent.",
        "He is a mule. He will defect the moment somebody beats him fairly, because nobody in his life has done anything fairly."
      ], { name: "Aled" });
      return;
    }
    if (flag("case_08_done")) {
      yield C.say([
        "The page is in the case marked FORGERY, WITH ADMIRATION. The seller works Tuesdays now, shelving.",
        "He is a very good shelver. Nobody has ever told him he was good at anything."
      ], { name: "Aled" });
      return;
    }
    yield C.say(["The quiz first. Round four is about the town. Round five is about you."], { name: "Aled" });
  });

  def("mid_knutsford_quiz", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Five rounds. No phones, no conferring, no arguing with the answer unless you've brought the source.",
      "People do bring the source. That is my favourite night of the year."
    ], { name: "Quizmaster" });
    const a = yield C.ask("Sit the Knutsford Quiz?", [
      { label: "Sit down and take it.", value: "go" },
      { label: "Come back when you've read more.", value: "no" }
    ]);
    if (a !== "go") { yield C.say(["Wise. Round four is brutal."], { name: "Quizmaster" }); return; }
    const r = yield* minigame(C, "knutsford_quiz", { rounds: 5 }, [
      "Round one: the county. Round two: the crosses. Round three: silk.",
      "Round four is Knutsford and you get three of five, which the room considers respectable for an outsider.",
      "Round five is about you, and you get all of them, and nobody finds that as funny as you do."
    ]);
    if (r === null || r) {
      yield C.setFlag("case_08_quiz_passed", true);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(3); });
      yield C.notify("Casebook Marks +3.");
      yield C.say(["Passed. Go and look at that page and tell Aled what you see."], { name: "Quizmaster" });
    }
  });

  // ============================== TATTON side ===========================
  def("mid_tatton_library", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Nine thousand books and one of them has been read this century, and it was by a man in hi-vis in March.",
      "He signed the register. He signed it 'R.'. Nobody has ever signed the register with an initial before."
    ], { name: "Librarian" });
    if (!flag("clue_root_register")) {
      yield C.setFlag("clue_root_register", true);
      yield C.notify("Casebook: a signature in the Tatton register — 'R.'");
      yield C.say([
        "He wanted the county record office transcripts. The Cheshire folklore volumes.",
        "Wizards, knights, a farmer, a white mare. He had a list. He said somebody had already read them and he wanted to know what to."
      ], { name: "Librarian" });
    }
  });

  def("mid_tatton_mei", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Head Gardener Mei. Twenty-six years, and I have never closed the Japanese garden for anything but frost.",
      "This week I have closed it for a sermon on the parkland. That is not a horticultural decision."
    ], { name: "Mei" });
  });

  def("mid_tatton_bonsai", function* (ctx) {
    const C = ctx.S;
    if (!flag("bonsai_gone")) {
      yield C.setFlag("bonsai_gone", true);
      yield C.say([
        "There's a gap on that stand. Two hundred and eleven years old and it fitted under a coat.",
        "It'll die. Not fast. That's the bit that sits in me. It will die slowly, in somebody's flat, being loved wrong."
      ], { name: "Gardener" });
      yield C.notify("Casebook: the Tatton bonsai.");
      return;
    }
    yield C.say(["Still a gap. I rake round it anyway."], { name: "Gardener" });
  });

  def("mid_tatton_steward", function* (ctx) {
    const C = ctx.S;
    if (flag("tatton_ghost_beaten")) {
      yield C.say(["The fire is lit. It has been lit since 1560. Do sit."], { name: "The Steward" });
      return;
    }
    yield C.say([
      "You are late for dinner.",
      "The hearth is in the middle of the floor and the smoke goes out of a hole and everybody sleeps in this room, including the dogs.",
      "That is not poverty. That is company."
    ], { name: "The Steward" });
    yield C.setFlag("tatton_ghost_awake", true);
  });

  def("mid_tatton_deer", function* (ctx) {
    const C = ctx.S;
    if (flag("deer_census_done")) {
      yield C.say(["The deer is grazing. It looks up at you, decides you are furniture, and goes back to it."]);
      return;
    }
    if (flag("tatton_blankets_seen")) {
      yield C.say([
        "The deer is not grazing.",
        "It is standing very still with its head at an angle, facing south-west, and it has been doing that for some time."
      ]);
      return;
    }
    yield C.say(["The deer watches you the whole way past and does not move. Fallow deer do not do that. Fallow deer leave."]);
  });

  def("mid_tatton_signin", function* (ctx) {
    const C = ctx.S;
    if (flag("deer_census_done")) {
      yield C.say(["The table is gone. There is a rectangle of flattened grass and eleven hundred names in a bin bag."]);
      return;
    }
    yield C.say([
      "Sign in! Name, email, and mother's maiden name for the prize draw.",
      "It's for the DEER."
    ], { name: "Volunteer" });
    const a = yield C.ask("Sign the clipboard?", [
      { label: "Sign it.", value: "sign" },
      { label: "\"What's the maiden name for?\"", value: "ask" },
      { label: "Read the top of the sheet.", value: "read" }
    ]);
    if (a === "sign") {
      yield C.say([
        "You write JIM in the name column and nothing else, and the volunteer's smile goes very slightly out of focus.",
        "\"...We do need the email,\" she says, to the clipboard."
      ]);
      yield C.setFlag("census_signed_partial", true);
      return;
    }
    if (a === "ask") {
      yield C.say([
        "For the prize draw.",
        "There is no prize draw. She does not know there is no prize draw. She has been here four days and she has not eaten."
      ], { name: "Volunteer" });
      return;
    }
    yield C.say([
      "At the top of the sheet, in a smaller font than anything below it:",
      "'By signing you confirm the details are accurate and consent to verification against your other accounts.'",
      "There are eleven hundred names on this clipboard. This is a car park in Cheshire on a Tuesday."
    ]);
    yield C.setFlag("clue_census_farm", true);
    yield C.notify("Casebook: the census tent is a login farm.");
  });

  // ============================== ROSTHERNE =============================
  def("mid_rostherne_cerys", function* (ctx) {
    const C = ctx.S;
    if (flag("rostherne_relay_seen")) {
      yield C.say([
        "You saw it, then. Under the water, the light.",
        "I have watched this mere for eleven years and I want you to know I never once saw it before this spring."
      ], { name: "Cerys" });
      return;
    }
    yield C.say([
      "Deepest mere in Cheshire and nobody goes on it, including me, and I am the warden.",
      "Thirty metres. Cold all the way down. Nothing lives in the bottom ten of it — that's what the survey says."
    ], { name: "Cerys" });
    yield C.say([
      "The survey was done in 1974 by two men in a rowing boat with a weight on a string.",
      "I would very much like a new survey and nobody will pay for one."
    ], { name: "Cerys" });
  });

  def("mid_rostherne_verger", function* (ctx) {
    const C = ctx.S;
    if (!flag("rostherne_bell_told")) {
      yield C.setFlag("rostherne_bell_told", true);
      yield C.say([
        "The bell? They were carting it up from the mere and a man swore at it, and it went in, and it rang all the way down.",
        "That's the story. Every mere in England has that story. Ours is the only one where you can still hear it."
      ], { name: "Verger" });
      yield C.say([
        "Not on Sundays. That's what I can't get past. If it were a story it would ring on Sundays.",
        "It rings when it likes. Lately it likes about every ninety seconds."
      ], { name: "Verger" });
      yield C.setFlag("clue_bell_period", true);
      return;
    }
    yield C.say(["Nobody's rung the tower since March. The board says otherwise. The board is wrong and I wrote the board."], { name: "Verger" });
  });

  // ============================ HOLMES CHAPEL ===========================
  def("mid_holmes_bev", function* (ctx) {
    const C = ctx.S;
    if (!flag("bev_kellan")) {
      yield C.setFlag("bev_kellan", true);
      yield C.say([
        "You'll be after Kellan. Everybody's after Kellan.",
        "He taught IT at the high school for nine years. Lovely with the kids. Patient. Explained things twice and never once made you feel thick."
      ], { name: "Bev" });
      yield C.say([
        "Then the school got a new system and nobody asked him and he spent a year fixing things nobody thanked him for.",
        "And then he found something that told him he was right about everything. And off he went."
      ], { name: "Bev" });
      yield C.setFlag("clue_kellan_teacher", true);
      yield C.notify("Casebook: Brother Kellan taught here.");
      return;
    }
    yield C.say(["He still comes in for a bloomer on Tuesdays. Pays cash. Blesses the till."], { name: "Bev" });
  });

  def("mid_holmes_crossing", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Wait for the LIGHT, not the barrier. The light's a lamp on a wire and it cannot lie to you.",
      "The barrier's on a computer now, and the computer's on a network, and the network is having a fortnight."
    ], { name: "Crossing Keeper" });
  });

  def("mid_holmes_dot", function* (ctx) {
    const C = ctx.S;
    if (flag("case_11_done")) {
      yield C.say([
        "It's caught, then. And you caught it rather than knocking it flat, which is the part I'll remember.",
        "Forty-one years in that box and I never once broke a thing to make it stop."
      ], { name: "Dot" });
      return;
    }
    if (flag("case_11_open")) {
      yield C.say([
        "Sleep at the Red Lion and come back in the small hours. It doesn't perform for daylight.",
        "Bring something that can take a hit and something that can hold one still."
      ], { name: "Dot" });
      return;
    }
    yield C.setFlag("case_11_open", true);
    yield C.say([
      "Signalwoman Dot. Forty-one years in that box before they closed it, and I know every lever in it by the sound of the catch.",
      "Number twelve moves at three in the morning. On its own. And number twelve is a spare."
    ], { name: "Dot" });
    yield C.say([
      "Everyone says ghost. I've heard ghosts. Ghosts haven't got a duty cycle.",
      "It's on a rhythm. Thirteen minutes past, every hour, and then a long one at three."
    ], { name: "Dot" });
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_11_signal_box");
    yield C.notify("Casebook: Signal Box, Holmes Chapel.");
    yield C.setFlag("case_11_watching", true);
  });

  def("mid_holmes_dot_box", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "There. Twelve. Watch it.",
      "That's not a hand on that lever and it's not a draught either, because I've stood in this box in a gale."
    ], { name: "Dot" });
  });

  def("mid_holmes_levers", function* (ctx) {
    const C = ctx.S;
    const night = MQ.Clock && MQ.Clock.phase === "night";
    if (flag("case_11_done")) {
      yield C.say(["Lever twelve is still. The dongle is in an evidence bag on the desk and the box has gone quiet, and Dot minds that a bit."]);
      return;
    }
    if (!night) {
      yield C.say([
        "Thirty-two levers in a frame, painted by colour: black for signals, blue for points, red for stops.",
        "Lever twelve is a spare. Its plate has been unscrewed and put back on with the wrong screws.",
        "Nothing moves. It is the middle of the day and whatever this is keeps office hours in reverse."
      ]);
      return;
    }
    yield C.say([
      "Three in the morning. The frame is cold. Somewhere under the floor a fan you cannot see spins up.",
      "Lever twelve moves half an inch and stops."
    ]);
    yield C.say([
      "Behind the plate: a telemetry dongle on a cellular SIM, fitted in 2019 by a contractor for a trial that ended in 2019.",
      "Nobody removed it. Nobody was asked to. And something has moved into the noise it makes and built a nest in it."
    ]);
    yield C.setFlag("case_11_poltergrid", true);
    const r = yield C.battle({ kind: "wild", species: "poltergrid", level: 20, canCatch: true, music: "battle_wild" });
    if (r && r.outcome === "catch") {
      yield C.say([
        "It goes into the capsule without a fight, the way something goes into a box when the box is quieter than where it was.",
        "Dot, later, will say: 'you didn't break it.' She will say it about four times."
      ]);
      yield C.setFlag("case_11_caught", true);
      yield C.setFlag("case_11_done", true);
      yield C.giveItem("ghost_lens", 1);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_11_signal_box");
      yield C.notify("Ghost Lens acquired.");
    } else if (r && r.outcome === "win") {
      yield C.say([
        "It comes apart into static and the fan under the floor spins down.",
        "The dongle is still there. Something else will find it by Christmas."
      ]);
      yield C.setFlag("case_11_done", true);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_11_signal_box");
    }
  });

  def("mid_holmes_kellan_note", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "There's a poster on the wall for the school play from four years ago and Mr Kellan's name is on it, under LIGHTING.",
      "Somebody has drawn a little halo on him in biro. Somebody else has crossed it out."
    ], { name: "Kid" });
  });

  def("mid_holmes_house2", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I do infrastructure for a bank. Not the money bit. The bit that tells the money bit what time it is.",
      "Time servers. Nobody thinks about time servers until two things disagree about when."
    ], { name: "Resident" });
    yield C.say([
      "The county's clocks have been drifting. Not much. About thirteen seconds, in a pattern, in and out.",
      "I raised a ticket. The ticket was closed as 'working as intended', and I did not write that."
    ], { name: "Resident" });
    yield C.setFlag("clue_clock_drift", true);
  });

  // ============================== JODRELL side ==========================
  def("mid_jodrell_ravi", function* (ctx) {
    const C = ctx.S;
    if (!flag("ravi_met")) {
      yield C.setFlag("ravi_met", true);
      yield C.say([
        "Dr Ravi Lovell-Hart, resident astronomer, currently standing in my own car park being extremely calm.",
        "They have my control room. They have a work order. The work order has a company name on it and the company was registered in March."
      ], { name: "Dr Lovell-Hart" });
      yield C.say([
        "The telescope is not broadcasting. It never broadcasts; that is not what it is for. It listens.",
        "And it is currently listening at an elevation of forty-three degrees, which is not the sky. That is a hill in Cheshire."
      ], { name: "Dr Lovell-Hart" });
      yield C.setFlag("clue_dish_elevation", true);
      yield C.notify("Casebook: the dish is pointed at Alderley Edge.");
      return;
    }
    yield C.say(["Forty-three degrees. Still. I check every morning like a man checking a wound."], { name: "Dr Lovell-Hart" });
  });

  def("mid_jodrell_ravi_vc", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Seventy years we have listened. Do you know what the sky has said?",
      "Hydrogen. A great deal of hydrogen, very evenly, in every direction. And pulsars, which tick.",
      "Nothing has ever answered. That is the finding. People find that sad. I have never found it sad."
    ], { name: "Dr Lovell-Hart" });
    if (!flag("ravi_pulsar")) {
      yield C.setFlag("ravi_pulsar", true);
      yield C.say([
        "Although. Since March there has been a modulation on the static that is very nearly a pulsar period.",
        "Very nearly. It has gaps in it. Pulsars do not have gaps and gaps are where you put things."
      ], { name: "Dr Lovell-Hart" });
    }
  });

  // ============================== CONGLETON side ========================
  def("mid_congleton_meg", function* (ctx) {
    const C = ctx.S;
    if (!flag("bridestones_told")) {
      yield C.setFlag("bridestones_told", true);
      yield C.say([
        "Bridestone Meg. Neolithic chambered tomb, four thousand years old, and in 1764 they took most of it for the turnpike.",
        "People are appalled when I tell them. They came here on the turnpike."
      ], { name: "Meg" });
      yield C.say([
        "What's left hums in fog. Not the wind through the gap — a hum with gaps in it, and the gaps are the same length every time.",
        "I have recorded it. I am seventy-one and I have a spectrogram, which I feel is worth mentioning."
      ], { name: "Meg" });
      yield C.setFlag("clue_bridestones_hum", true);
      return;
    }
    yield C.say(["Come up in fog. Bring a coat and don't talk over it."], { name: "Meg" });
  });

  def("mid_congleton_kirsty", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I run the tanning place and, because nobody else would, the town's free Wi-Fi off my back room.",
      "Fourteen years. Never asked for a penny. Never asked for a thank-you either, which is just as well."
    ], { name: "Kirsty" });
    yield C.say([
      "Somebody's printed the password on stickers with a little square code under it and put them on every lamppost to the station.",
      "I did not print those. My password has never been on a lamppost. My password is on a Post-it like a normal person's."
    ], { name: "Kirsty" });
    yield C.setFlag("clue_congleton_posters", true);
  });

  def("mid_congleton_poster", function* (ctx) {
    const C = ctx.S;
    const n = Number(flag("case_10_posters") || 0);
    if (n >= 6) {
      yield C.say(["Nothing on this lamppost but a bit of gum and a cable tie. Six down. Otis owes you a pint and will forget."]);
      return;
    }
    yield C.say([
      "A sticker on the lamppost: CONGLETON FREE WI-FI, a password, and a square code.",
      "Point a phone at it and it opens a page that says: to complete connection, copy the line below and run it. It is one line long."
    ]);
    const a = yield C.ask("What do you do with it?", [
      { label: "Peel it off.", value: "peel" },
      { label: "Run the line. It's just Wi-Fi.", value: "run" },
      { label: "Leave it and note the address.", value: "note" }
    ]);
    if (a === "peel") {
      yield C.addFlag("case_10_posters", 1);
      const now = Number(flag("case_10_posters") || 1);
      yield C.say(["Off it comes, mostly. There is always a corner. There is always a corner."]);
      yield C.notify("ClickFix posters removed: " + now + "/6");
      if (now >= 6) {
        yield C.setFlag("case_10_posters_done", true);
        yield C.say(["Six. The road to the station is a road again, and Otis will find out about it from somebody else and be delighted."]);
      }
      return;
    }
    if (a === "run") {
      yield C.say([
        "You read it instead, all the way to the end, which takes four seconds and is the entire defence.",
        "It fetches a second thing, and the second thing is the actual thing, and the actual thing is not about Wi-Fi."
      ]);
      yield C.setFlag("clue_clickfix_command", true);
      return;
    }
    yield C.say(["The address is a lookalike of the town council's, off by one letter, registered eleven days ago.", "You write it down. That is what the notebook is for."]);
    yield C.setFlag("clue_congleton_domain", true);
  });

  def("mid_congleton_token_1", function* (ctx) {
    const C = ctx.S;
    if (flag("case_10_token_bakery")) {
      yield C.say(["The bear token's yours. There's two more — one at the bridge, one in the park."], { name: "Kid" });
      return;
    }
    yield C.say([
      "You want the bear tokens? Everyone wants the bear tokens.",
      "There's one behind the flour bins. I can't reach it. I'm not saying I've tried."
    ], { name: "Kid" });
    const a = yield C.ask("Reach behind the flour bins?", [
      { label: "Reach behind the bins.", value: "yes" },
      { label: "\"Later.\"", value: "no" }
    ]);
    if (a !== "yes") return;
    yield C.setFlag("case_10_token_bakery", true);
    yield C.giveItem("collectible_11", 1);
    yield C.say([
      "A brass token the size of a bottle cap, with a bear on one side and four letters on the other.",
      "The kid watches you take it with the face of somebody who has just learned that adults have arms."
    ]);
    yield C.notify("Bear token 1/3.");
  });

  def("mid_congleton_clerk", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The minute book, yes. 'Item: for a beare, xvj s. Item: for the Bible, deferred.'",
      "And the bit nobody quotes: they bought the Bible the following year. Out of their own pockets."
    ], { name: "Town Clerk" });
    yield C.say([
      "So the story is: a town that could not afford both bought the thing that would not wait, and then paid for the other one themselves.",
      "Four hundred years of being laughed at for that. I would do it again."
    ], { name: "Town Clerk" });
  });

  def("mid_gym3_bar", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The arm-wrestle bar. Brass pointer, spring, and a beat you have to feel rather than count.",
      "Time it on the up-beat. Everyone times it on the down-beat. Everyone loses."
    ], { name: "Pit Hand" });
    const a = yield C.ask("Have a go on the bar?", [
      { label: "Take the bar.", value: "go" },
      { label: "Watch somebody else lose first.", value: "no" }
    ]);
    if (a !== "go") { yield C.say(["Sensible. There's a queue of the confident and it never gets shorter."], { name: "Pit Hand" }); return; }
    const r = yield* minigame(C, "bear_wrestle", { rounds: 3 }, [
      "Up-beat. Up-beat. Up-beat. The pointer goes round further than it has any business going and the pit makes a noise.",
      "Somebody writes your name on the beam in chalk. There are two hundred names on that beam."
    ]);
    if (r === null || r) {
      yield C.setFlag("bear_wrestle_won", true);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(2); });
      yield C.notify("Casebook Marks +2.");
    }
  });

  def("mid_gym3_enid", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "He's told you the Bible story. He tells the dog. The dog has heard it four hundred times and still does the ears.",
      "Go on through when you're ready. Look interested. He knows you're not; that's not the point."
    ], { name: "Enid" });
  });

  // ============================== THE CLOUD =============================
  def("mid_bosley_idwal", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The stones hum in fog. I've stood here in fog for thirty years and until March it was a hum with nothing in it.",
      "Now there are gaps. Regular gaps. A hum with regular gaps in it is not a hum. It is a carrier."
    ], { name: "Idwal" });
    if (!flag("clue_bridestones_hum")) {
      yield C.setFlag("clue_bridestones_hum", true);
      yield C.notify("Casebook: the Bridestones carry something.");
    }
  });

  def("mid_bosley_bear", function* (ctx) {
    const C = ctx.S;
    if (!flag("cloud_bear_told")) {
      yield C.setFlag("cloud_bear_told", true);
      yield C.say([
        "There is a bear on this hill. I have seen it twice and I have told six people and four of them were lovely about it.",
        "Big. Brown. In no hurry. It looked at me the way a landlord looks at a tenant."
      ], { name: "Warden" });
      yield C.say([
        "Congleton's had a bear in its heart for four hundred years and never once had one on its hill.",
        "Now it's got one on the hill. You tell me what changed."
      ], { name: "Warden" });
      return;
    }
    yield C.say(["Still up here. Still in no hurry."], { name: "Warden" });
  });

  // ============================ MORETON & MOW COP =======================
  def("mid_moreton_housekeeper", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Nothing in this house is level and I include myself in that.",
      "Five hundred years. It has been about to fall down for four hundred and eighty of them and it has not fallen down."
    ], { name: "Housekeeper" });
    yield C.say([
      "People want to know the secret. There isn't one. It's oak, and oak moves, and a thing that moves does not snap.",
      "Every rigid house they built the same year is a field now."
    ], { name: "Housekeeper" });
  });

  def("mid_moreton_moat", function* (ctx) {
    const C = ctx.S;
    if (flag("moreton_moat_key")) {
      yield C.say(["The moat's got nothing left in it but carp and opinions."]);
      return;
    }
    yield C.say([
      "The water is green and about four feet deep and there is something metal on the bottom that catches the light.",
      "It has been catching the light since the Civil War, according to a man in 1911 who also could not reach it."
    ]);
    yield C.say([
      "MEADOW walks the moat wall, which is four inches wide, looks into the water, and declines.",
      "BIGBOY does not even come to look."
    ]);
    yield C.setFlag("moreton_moat_seen", true);
  });

  def("mid_moreton_gallery", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The floor bows two feet in the middle. A dropped coin always rolls the same way.",
      "In the dark the whole gallery breathes with the temperature and somebody who has been here a very long time takes the opportunity."
    ]);
    yield C.setFlag("moreton_gallery_woken", true);
  });

  def("mid_mowcop_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "MOW COP. A fake ruin on a real edge, with Cheshire on one side and Staffordshire on the other and a wall down the middle.",
      "From up here you can see the dish. It is white and very small and it is not looking up."
    ]);
    yield C.setFlag("mowcop_arrival", true);
  });

  def("mid_mowcop_keeper", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "It's a summerhouse. Built 1754 to look ruined from the big house down there. Cheshire invented content.",
      "And then in 1807 several thousand people stood on it in the rain for fourteen hours and started a church.",
      "The building is a fake. The fourteen hours are not. I think about that ratio a great deal."
    ], { name: "Keeper" });
  });

  def("mid_mowcop_sara", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Gritstone Trail. Lyme Park to here, thirty-five miles, and every summit on it has a plaque and a view and a bench.",
      "Stand on all twelve viewpoints and somebody in Frodsham will give you a passport, which is a piece of card, and it will mean an enormous amount to you."
    ], { name: "Sara" });
  });

  def("mid_mowcop_book", function* (ctx) {
    const C = ctx.S;
    if (!flag("gritstone_signed")) {
      yield C.setFlag("gritstone_signed", true);
      yield C.say([
        "The trail book, in a tin, under a stone. Four hundred names, a lot of dogs, and three separate people who have written 'never again'.",
        "Two of them have written it twice, in different years."
      ]);
      yield C.say(["You sign it. JIM, and the date, and — because there is a column for it — MEADOW and BIGBOY."]);
      yield C.giveItem("viewpoint_mow_cop", 1);
      yield C.notify("Viewpoint recorded: Mow Cop.");
      return;
    }
    yield C.say(["Your name's still in it. So are the cats'."]);
  });

  // ============================== SANDBACH side =========================
  def("mid_sandbach_nia", function* (ctx) {
    const C = ctx.S;
    if (flag("case_12_done")) {
      yield C.say([
        "The panels are photographed, the key is in the record, and the chalk is off the stone.",
        "Whoever did it will do it again somewhere. But not here, and not to these."
      ], { name: "Nia" });
      return;
    }
    if (!flag("case_12_open")) {
      yield C.setFlag("case_12_open", true);
      yield C.say([
        "Historian Nia. Somebody has chalked the cross panels. Four of them. Not a child — the marks are on the right panels.",
        "Whoever did it knows which face is the nativity and which is the crucifixion, and that is not on the information board."
      ], { name: "Nia" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_12_saxon_crosses_cipher");
      yield C.notify("Casebook: The Saxon Crosses Cipher.");
      yield C.say([
        "Photograph all four. The key is on the market-square sign — the old one, the one with the alphabet on it that everyone thinks is decoration.",
        "Then look in the churchyard, on the north side, where nobody goes because it is cold."
      ], { name: "Nia" });
      return;
    }
    yield C.say(["Four panels. Then the sign. Then the north side of the churchyard. In that order or it's just chalk."], { name: "Nia" });
  });

  def("mid_sandbach_hild", function* (ctx) {
    const C = ctx.S;
    if (!flag("hild_met")) {
      yield C.setFlag("hild_met", true);
      yield C.say([
        "Rubbing, not tracing. There's a difference and the difference is respect.",
        "Wax and paper and a flat hand, and you get what the carver's chisel did, not what your eye thinks it sees."
      ], { name: "Hild" });
      yield C.say([
        "The interlace is a key. It always was — that's what interlace is FOR, it's a rule you can check.",
        "Somebody has finally noticed and I wish very much that they hadn't."
      ], { name: "Hild" });
      return;
    }
    const a = yield C.ask("\"Go on then. Take a rubbing. Mind the wax.\"", [
      { label: "Take a rubbing.", value: "go" },
      { label: "\"Not with these hands.\"", value: "no" }
    ]);
    if (a !== "go") { yield C.say(["Wise. Most people press too hard and get a smudge and a lecture."], { name: "Hild" }); return; }
    const r = yield* minigame(C, "rune_rubbing", { panels: 4 }, [
      "Wax, paper, a flat hand. The animals come up first, then the knotwork, then — faintly, at the very bottom — a line of letters.",
      "Hild looks at the letters for a long time and does not translate them for you."
    ]);
    if (r === null || r) {
      yield C.setFlag("sandbach_rubbing_done", true);
      yield C.giveItem("collectible_13", 1);
      yield C.notify("Sandbach cross rubbing.");
    }
  });

  def("mid_sandbach_cousin", function* (ctx) {
    const C = ctx.S;
    if (!flag("otis_cousin_told")) {
      yield C.setFlag("otis_cousin_told", true);
      yield C.say([
        "You'll be the one Otis mentioned. He's my cousin. Everybody in this county is somebody's cousin.",
        "Puritans smashed them. About 1650. Broke them up and scattered the bits so nobody could put them back."
      ], { name: "Otis's Cousin" });
      yield C.say([
        "And the town kept the bits. In gardens. In walls. One piece was a rockery at Tarporley for a century and a half.",
        "Nineteen pieces. Nineteen households. Not one of them handed in and not one of them lost."
      ], { name: "Otis's Cousin" });
      yield C.say([
        "Put them back up in 1816. Took years. Nobody was in charge of it.",
        "We kept the bits. That's the whole of it, that. We kept the bits."
      ], { name: "Otis's Cousin" });
      yield C.setFlag("clue_crosses_kept", true);
      return;
    }
    yield C.say(["We kept the bits, love. That's the story and it's a better one than the smashing."], { name: "Otis's Cousin" });
  });

  def("mid_sandbach_board", function* (ctx) {
    const C = ctx.S;
    const B = MQ.Bounties;
    if (!flag("bounty_board_open")) {
      yield C.setFlag("bounty_board_open", true);
      yield C.say([
        "First board in the county, this. Three cards, pinned proper, and no maps on any of them.",
        "You get a description and you get on with it. If you want a marker on a map, go and be a courier."
      ], { name: "Board Keeper" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_13_bounty_fenced_goods");
      yield C.notify("Bounty Board unlocked.");
    }
    if (B && B.start) {
      yield C.custom(function () { return MQ.Bounties.start({ board: "sandbach" }); });
      return;
    }
    yield C.say([
      "PETTY — 'Chewed berries on a hedge somewhere along the Wheelock. Not a deer. Deer don't spit the pips out.'",
      "NOTABLE — 'Hums near the crosses in fog. Only in fog. Do not bring a torch.'",
      "WARRANT — 'Something in the Elworth cut is logging in as eleven hundred people. Weekly. Pays accordingly.'"
    ]);
  });

  def("mid_sandbach_bram", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Carter Bram. Haulage, forty years, and I know every bridge in this county by its height and its temper.",
      "There's a lorry stood on the Elworth cut nine days with the engine running. No livery. No plates you'd want to read twice."
    ], { name: "Bram" });
    yield C.say([
      "I rang it in. The firm on the side of it has never heard of it.",
      "Nine days of diesel is not a joyride, lad. That's a generator."
    ], { name: "Bram" });
    yield C.setFlag("clue_elworth_lorry", true);
  });

  def("mid_sandbach_verger", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The bell went in 1972 and came back in 1979 with a note that said 'sorry, it was heavier than we thought.'",
      "We framed the note. The bell's back in the tower. The note is the better exhibit."
    ], { name: "Verger" });
  });

  def("mid_sandbach_bell", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The Old Hall bell. Kept for the parish, 1698, NOT FOR SALE, underlined three times by a man who clearly kept being asked.",
      "It rings itself now and then. Only when the crosses are lit. I have stopped mentioning that to guests."
    ], { name: "Historian" });
    yield C.setFlag("clue_oldhall_bell", true);
  });

  def("mid_sandbach_post", function* (ctx) {
    const C = ctx.S;
    if (flag("nino_letter_2")) {
      yield C.say(["Nothing else for you. Georgia's a long way and the post is slower than the news."], { name: "Postmaster" });
      return;
    }
    yield C.say([
      "Something for you, and it's got stamps on it, which is a thing I don't see enough of.",
      "Tbilisi. Chased you from Wilmslow. It's been to two wrong Jims first."
    ], { name: "Postmaster" });
    yield C.giveItem("nino_letter_2", 1);
    yield C.setFlag("nino_letter_2", true);
    yield C.say([
      "Jim —",
      "You will want to write this down. The company that bought your friend's weights is a Georgian shell called ORCHARD HOLDINGS SCA.",
      "Two directors. One of them is a notary in Batumi who has signed four hundred companies and has never left Batumi.",
      "The other is a name that appears nowhere else on earth, which is how you know it is a person and not a rubber stamp.",
      "Also: your cats are famous here. I described them once. My colleagues ask after the big one by name. — Nino"
    ], { name: "Nino's letter" });
    yield C.notify("Casebook: THE STACK's parent has a name.");
    yield C.setFlag("clue_orchard_holdings", true);
  });

  def("mid_sandbach_shrine", function* (ctx) {
    const C = ctx.S;
    const Sh = MQ.Shrine;
    if (Sh && Sh.start) { yield C.custom(function () { return MQ.Shrine.start({ id: "sandbach_shrine" }); }); return; }
    yield C.say([
      "The stones are warm and the carving on the north face is lit from inside the stone, which stone does not do.",
      "Anything you set down here gets up again."
    ]);
    yield C.heal();
    yield C.sfx("heal");
    yield C.say(["Your team is on its feet. Nobody thanks the crosses. The crosses do not appear to mind."]);
  });

  // ================================ CREWE side ==========================
  def("mid_crewe_ted", function* (ctx) {
    const C = ctx.S;
    if (!flag("ted_interlocking")) {
      yield C.setFlag("ted_interlocking", true);
      yield C.say([
        "Signalman Ted. The interlocking is the clever bit and nobody has ever heard of it.",
        "It is a machine that physically cannot set two routes that would put two trains in the same place. The levers will not move. It is not software. It is IRON."
      ], { name: "Ted" });
      yield C.say([
        "On Tuesday two conflicting routes were set.",
        "Which means it was not done at the levers. Which means somewhere between the levers and the trains, somebody has put a computer."
      ], { name: "Ted" });
      yield C.setFlag("clue_interlocking", true);
      yield C.notify("Casebook: the interlocking was bypassed, not broken.");
      return;
    }
    yield C.say(["Iron doesn't lie. Iron just does what it was built to do. That's why we built it out of iron."], { name: "Ted" });
  });

  def("mid_crewe_mags", function* (ctx) {
    const C = ctx.S;
    if (flag("case_15_done")) {
      yield C.say([
        "Schedule's clean. Crewe's a hub again and you can go anywhere from here, which is the only thing this town was ever for.",
        "Every thirteenth minute, mind. I still look."
      ], { name: "Mags" });
      return;
    }
    if (!flag("case_15_open")) {
      yield C.setFlag("case_15_open", true);
      yield C.say([
        "Dispatcher Mags. The trains are not colliding on the rails. They are colliding in the SCHEDULE, which is much worse and much quieter.",
        "Six services, four platforms, and somewhere in the middle of it a corruption that puts two things in one place."
      ], { name: "Mags" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_15_timetable_tangle");
      yield C.notify("Casebook: Timetable Tangle.");
      return;
    }
    const a = yield C.ask("\"Slot six trains into four platforms. Three rounds. Coming?\"", [
      { label: "Sit down at the board.", value: "go" },
      { label: "\"Give me an hour.\"", value: "no" }
    ]);
    if (a !== "go") { yield C.say(["It'll still be broken in an hour. That's the one promise this railway keeps."], { name: "Mags" }); return; }
    const r = yield* minigame(C, "timetable_puzzle", { rounds: 3 }, [
      "Six services. Four platforms. Turnround times, conflicting paths, and one freight that must not be held.",
      "Round three you get it in one go, and Mags leans back and says a word she would not say on the tannoy."
    ]);
    if (r === null || r) {
      yield C.setFlag("case_15_done", true);
      yield C.giveItem("conductors_whistle", 1);
      yield C.say([
        "Now look at when it goes wrong. Every thirteenth minute. Every single one, for a fortnight.",
        "That is not corruption, love. Corruption is random. That is a HEARTBEAT."
      ], { name: "Mags" });
      yield C.setFlag("clue_thirteenth_minute", true);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_15_timetable_tangle");
      yield C.notify("Conductor's Whistle acquired.");
    }
  });

  def("mid_crewe_nkechi", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Yardmaster. Nineteen years of putting things in the right order, which is the only problem I have ever had.",
      "One wagon in road four has moved three times tonight and nobody has been near it and there is no locomotive attached to it."
    ], { name: "Nkechi" });
  });

  def("mid_crewe_shunting", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Sheds are a puzzle. Four roads, nine wagons, one shunter, and everything has to come out in an order that isn't the order it went in.",
      "You can't lift them. You can only push."
    ], { name: "Shunter" });
    const a = yield C.ask("Work the shunting puzzle?", [
      { label: "Take the handle.", value: "go" },
      { label: "\"Not today.\"", value: "no" }
    ]);
    if (a !== "go") return;
    const r = yield* minigame(C, "shunting", { rounds: 3 }, [
      "Push, uncouple, run round, push. Nine wagons out in the right order and one left behind on purpose because it isn't going anywhere.",
      "The shunter watches the last move and nods once, which in this trade is a knighthood."
    ]);
    if (r === null || r) {
      yield C.setFlag("crewe_shunting_done", true);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(3); });
      yield C.notify("Casebook Marks +3.");
    }
  });

  def("mid_crewe_fey", function* (ctx) {
    const C = ctx.S;
    if (!flag("salon_seen")) {
      yield C.say([
        "Been on this road since the Works had ten thousand men on it. Cut most of their hair and buried a fair few.",
        "Three doors down's shut. Lovely woman. Did my mum's hair for eleven years."
      ], { name: "Fey" });
      return;
    }
    yield C.say([
      "The lad who comes about it — the one with the hood and the mouth on them — that's her kid.",
      "Been in twice. Sat in the chair. Didn't want a cut, wanted to sit where the mirror faces the shop opposite."
    ], { name: "Fey" });
  });

  def("mid_crewe_salon", function* (ctx) {
    const C = ctx.S;
    if (!flag("salon_seen")) {
      yield C.setFlag("salon_seen", true);
      yield C.say([
        "The shutter is down. Through the letterbox: chairs stacked, a mirror still on the wall, a rack of tubes gone hard.",
        "Taped to the inside of the window, facing out so the street can read it, is a letter from the bank."
      ]);
      yield C.say([
        "It is very polite. It explains that the transaction was authorised by the account holder, and that on that basis no refund arises.",
        "Under it, in biro, in a different hand: I DID NOT AUTHORISE IT. I CLICKED A BOX THAT SAID UPDATE."
      ]);
      yield C.say([
        "The biro has gone over the words several times. You can see where the pen was pressed and where the hand stopped.",
        "MEADOW gets up on the sill, sits against the glass, and stays there."
      ]);
      yield C.notify("Casebook: Nantwich Road.");
      return;
    }
    yield C.say(["The letter is still in the window. Somebody has put a fresh piece of tape on the corner that had come away."]);
  });

  def("mid_crewe_guard", function* (ctx) {
    const C = ctx.S;
    if (flag("rail_fast_travel")) {
      yield C.say([
        "Railcard's signed. Anywhere on the network you've physically stood in, you can get back to.",
        "Not anywhere you've heard of. Anywhere you've STOOD. That's the rule and it's a good rule."
      ], { name: "Guard" });
      const fn = has("Rail.open");
      if (fn) yield C.custom(function () { return MQ.Rail.open({ from: "crewe_station" }); });
      return;
    }
    yield C.say([
      "Twelve platforms and I can get you to any of them. Off the platform is somebody else's problem.",
      "Railcard? Not signed. Railcard office, two streets down, and they'll want somebody to vouch for you."
    ], { name: "Guard" });
  });

  def("mid_crewe_cambrian", function* (ctx) {
    const C = ctx.S;
    if (flag("cambrian_ticket")) {
      yield C.say([
        "Platform twelve. Shrewsbury, then the coast, then a long green afternoon.",
        "It's four hours and the last hour of it is the sea on your right the whole way. Best ticket in England."
      ], { name: "Platform Twelve" });
      return;
    }
    yield C.say([
      "Cambrian line goes from twelve. Wales. Aberystwyth and the coast.",
      "Nobody buys it. It's four hours and it goes to the sea, so obviously nobody buys it."
    ], { name: "Platform Twelve" });
  });

  def("mid_crewe_railcard", function* (ctx) {
    const C = ctx.S;
    if (flag("rail_fast_travel")) {
      yield C.say(["Signed and stamped. Don't lose it; the replacement process is a punishment."], { name: "Clerk" });
      return;
    }
    if (!flag("badge_kernel")) {
      yield C.say([
        "Railcard needs a voucher. Somebody local, somebody the network knows.",
        "No, I can't vouch. I'm the person who processes the vouching. It's a whole thing."
      ], { name: "Clerk" });
      return;
    }
    yield C.say([
      "Stoker Di rang down. She has never rung down about anybody.",
      "So: signed, stamped, and there's a Cambrian on the back of it because she said to put one on."
    ], { name: "Clerk" });
    yield C.giveItem("railcard", 1);
    yield C.giveItem("cambrian_ticket", 1);
    yield C.unlock("railcard");
    yield C.setFlag("rail_fast_travel", true);
    yield C.setFlag("cambrian_ticket", true);
    yield C.sfx("achievement");
    yield C.notify("Railcard: fast travel between stations you have stood in.");
    yield C.notify("Cambrian ticket: the line to Wales.");
  });

  // ================================ ROUTES ==============================
  def("mid_r8_sheep", function* (ctx) {
    const C = ctx.S;
    if (flag("deer_census_done")) {
      yield C.say(["The sheep is facing whichever way the grass is. This is what sheep are supposed to do and it is oddly comforting."]);
      return;
    }
    yield C.say([
      "The sheep is facing south-west.",
      "So is the next one. So is every sheep in the field, in a line, like a congregation waiting for a bit they know."
    ]);
  });

  def("mid_r8_dilys", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Forty years I've had sheep on this heath and I have never seen them line up.",
      "I took a compass out. South-west. Then I felt daft. Then I took the compass out again the next day."
    ], { name: "Dilys" });
    yield C.setFlag("clue_animals_southwest", true);
  });

  def("mid_r8_cultist", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "ONE COMMAND, friend! The heath is CLEAN and so could you be!",
      "Tatton, all week. Blankets provided. Bring nothing — bringing things is doubt."
    ], { name: "Novice" });
  });

  def("mid_r9_ellis", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Barriers came down at ten past with no train behind them and went up at quarter past with one coming.",
      "I have farmed beside this crossing for thirty-one years. It has never once been wrong before and now it is wrong politely."
    ], { name: "Ellis" });
  });

  def("mid_r9_crossing", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "User-worked crossing. STOP, LOOK, LISTEN, TELEPHONE THE SIGNALLER. It's a yellow box and a handset and it has worked since 1938.",
      "Twice this week it has rung back. Nobody rang it. There's nobody at the other end to ring it."
    ], { name: "Crossing Keeper" });
    const a = yield C.ask("Pick up the handset?", [
      { label: "Pick it up.", value: "yes" },
      { label: "Leave it.", value: "no" }
    ]);
    if (a !== "yes") { yield C.say(["Sensible. I've stopped answering it."], { name: "Crossing Keeper" }); return; }
    yield C.say([
      "The handset is warm. There is line noise, and under the line noise, a rhythm.",
      "It is not a voice. It is a pattern with gaps in it, and the gaps are the same length as the gaps in the Bridestones' hum."
    ]);
    yield C.setFlag("clue_crossing_phone", true);
    yield C.notify("Casebook: the same rhythm, on a railway handset.");
  });

  def("mid_r9_lowri", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "My dad works at the observatory. He's not allowed to say what's wrong with it.",
      "He says 'maintenance' in the voice he uses about the dog. The dog is fine. The dog is definitely fine."
    ], { name: "Lowri" });
  });

  def("mid_r10_ham", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Two metre band, forty years. I have heard Moscow, the space station, and a taxi firm in Warrington that does not know it transmits.",
      "Last Thursday I heard something on a frequency nobody uses and I have not reported it and I am not going to."
    ], { name: "Ivor" });
    yield C.say([
      "It's nearly a pulsar period. Nearly. But a pulsar is a metronome and this thing pauses.",
      "You don't pause unless you're leaving room for something."
    ], { name: "Ivor" });
    yield C.setFlag("clue_pulsar_gaps", true);
  });

  def("mid_r10_aneira", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The little dishes in the arboretum all turned at once on Tuesday. All of them, in about a second.",
      "They're supposed to track the big one. So the big one turned first, and the big one turned to face a hill."
    ], { name: "Aneira" });
  });

  def("mid_r10_vaughn", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Site's closed, road's closed, meadow's closed. It's all closed, mate. Have you got a work order? No. Right.",
      "Look — I get paid weekly in a currency I can't spell by a company with no phone number. I'm not the fence. I'm just leaning on it."
    ], { name: "Contractor" });
  });

  def("mid_r11_tegwen", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Brereton Heath. Sand, birch, adders in the warm bits and lizards on the boards.",
      "There's a bear on the Cloud. I have said so at three parish meetings and everyone is extremely kind about it."
    ], { name: "Tegwen" });
  });

  def("mid_r11_hide", function* (ctx) {
    const C = ctx.S;
    if (!flag("r11_hide_searched")) {
      yield C.setFlag("r11_hide_searched", true);
      yield C.say([
        "Somebody has been sleeping in the hide. A sleeping bag, a flask still warm, and a spiral notebook.",
        "The notebook is full of azimuth bearings and times. All the bearings are the same. The times are ninety seconds apart."
      ]);
      yield C.say([
        "On the last page, in a different pen, much harder: 'IT IS NOT LISTENING TO THE SKY.'",
        "And under that: 'they will send someone. let them get to the gate.'"
      ]);
      yield C.setFlag("clue_root_notebook", true);
      yield C.notify("Casebook: somebody is waiting for you to arrive.");
      return;
    }
    yield C.say(["The flask has gone. The notebook has not. She left it."]);
  });

  def("mid_r12_amos", function* (ctx) {
    const C = ctx.S;
    if (!flag("amos_first_glimpse")) {
      yield C.say(["He smiles at you like a man continuing a conversation. You have never seen him before."]);
      return;
    }
    yield C.say([
      "Lovely day. Lovely to see you again.",
      "...We haven't met. I know. I said 'again', and you noticed, and I saw you notice, and I have not adjusted."
    ], { name: "Warden" });
  });

  def("mid_r14_del", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Sixteen locks in a mile and a half. Four hours if you're on your own, three if somebody helps, five if somebody chats.",
      "It's five most days. That's not a complaint."
    ], { name: "Del" });
  });

  def("mid_r14_rhodri", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Somebody's been chalking the lock beams. Not tags. Marks — same four shapes, in an order, all the way up the flight.",
      "Same shapes as on the crosses in the town. I said that to a bloke in the pub and he laughed and then he stopped."
    ], { name: "Rhodri" });
    yield C.setFlag("clue_lock_marks", true);
  });

  def("mid_r14_josh", function* (ctx) {
    const C = ctx.S;
    if (flag("twelvek_lanyard_seen")) {
      yield C.say([
        "It's finished, then. My mum still thinks I do tutoring.",
        "I'm going to keep saying I do tutoring. I might actually do tutoring. I'm good at explaining things."
      ], { name: "Josh" });
      return;
    }
    yield C.say([
      "Year Thirteen. Four grand a month. My mum thinks I do tutoring.",
      "It IS tutoring, sort of. It's teaching a computer to be eleven hundred people convincingly."
    ], { name: "Josh" });
    yield C.say([
      "We don't do the station. Station's above our pay grade and our pay grade is Steam vouchers.",
      "TWELVE-K does the station. TWELVE-K's got a lanyard from somewhere with a canteen in it."
    ], { name: "Josh" });
    yield C.setFlag("clue_stuffer_kids", true);
  });

  def("mid_r15_owain", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Elworth cut. Four running lines, a canal, and a footpath between them that nobody ever planned and everybody uses.",
      "Interlocking at Crewe went funny Tuesday. Not broken. FUNNY. Funny is worse; broken you can see."
    ], { name: "Owain" });
  });

  def("mid_r15_kai", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Three hundred and eleven numbers in my book. My grandad's got nine thousand and he started in 1961.",
      "There's one in the sheds with no number on it. That's not possible. Everything's got a number. That's the whole point of them."
    ], { name: "Kai" });
    yield C.setFlag("clue_unnumbered_loco", true);
  });

  def("mid_r15_immy", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Residential proxy. It means somebody's nan's broadband, and it means when the bank looks, it sees somebody's nan.",
      "That's the whole product. It's not clever. It's just an awful lot of nans."
    ], { name: "Immy" });
  });
})();
// =============================================================
// MonsterQuest v2 — MID region NPC scripts, part two: the casebook
// cases that need more than a giver — the Cranford mule on the Heath,
// the two remaining bear tokens, the churchyard dead-drop, the photo
// census, and a named ROTTLING that has eaten its way up the Wheelock.
// Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const S = MQ.Story;
  const N = S.npcScripts;
  function def(id, gen) { N[id] = gen; S.scripts[id] = gen; return gen; }
  function flag(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }

  // ---- case 08: the seller on the Heath ---------------------------------
  def("mid_knutsford_seller", function* (ctx) {
    const C = ctx.S;
    if (flag("case_08_done")) {
      yield C.say([
        "I shelve on Tuesdays now. Aled says I'm good at it.",
        "Nobody's ever told me I was good at anything, so I've been doing it four days a week."
      ], { name: "The Seller" });
      return;
    }
    if (!flag("case_08_seller_found")) {
      yield C.setFlag("case_08_seller_found", true);
      yield C.say([
        "A young man behind a folding table with a page in a plastic sleeve and a laminated card in his other hand.",
        "He reads from the card. He reads all of it, including a bit that is clearly a stage direction."
      ]);
      yield C.say([
        "'This remarkable survival — pause — was discovered in a private collection in — ' hang on, sorry, I've lost my place.",
        "'...in a private collection in Cheshire.'"
      ], { name: "The Seller" });
      yield C.say([
        "The paper is not foxed. The ink has not bled into the fibres. The hand is very good and the paper is 1980s cartridge.",
        "It is a beautiful forgery being sold badly by somebody who has not been told what he is holding."
      ]);
    }
    yield C.say([
      "Look — I just read the card. They give me the card and the sleeve and I get forty quid and a bus fare.",
      "If you know it's wrong then just say so. Nobody ever just says so. Everyone goes away and rings somebody."
    ], { name: "The Seller" });
    const a = yield C.ask("", [
      { label: "\"It's a fake. Put it down.\"", value: "say" },
      { label: "\"Battle me. No Agents. Just you and me.\"", value: "fight" },
      { label: "Walk away and ring somebody.", value: "ring" }
    ]);
    if (a === "ring") {
      yield C.say(["He watches you go. He has been watched going before. He puts the card back in his pocket."]);
      return;
    }
    if (a === "say") {
      yield C.say([
        "...Right. Yeah. I thought it might be.",
        "Can you tell me how you knew? Not to argue. I'd just — I'd like to know how a person knows a thing."
      ], { name: "The Seller" });
    }
    yield C.say([
      "One battle. Straight. No Agents, on either side — I haven't got any, so that's me being generous with your stuff.",
      "If you win properly I'll pack the table up and I'll not do this again."
    ], { name: "The Seller" });
    const r = yield C.battle({ kind: "trainer", trainer: "tr_route_alderley_knutsford_4", music: "battle_trainer", rules: { agents: false, noAgents: true } });
    if (r && r.lost) {
      yield C.say(["\"Best of three?\" he says, hopefully. He has been waiting a long time for somebody to say yes to that."], { name: "The Seller" });
      return;
    }
    yield C.setFlag("case_08_done", true);
    yield C.giveMoney(1000);
    yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(3); });
    yield C.say([
      "He folds the table. It takes him a while because one leg has always been wrong.",
      "\"There's a bloke in Wilmslow gives me the sleeves,\" he says. \"I'll write his name down for the librarian. I write quite neatly.\""
    ]);
    if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_08_the_gaskell_draft");
    yield C.notify("Casebook case closed: The Gaskell Draft.");
  });

  // ---- case 10: the other two bear tokens --------------------------------
  def("mid_congleton_token_2", function* (ctx) {
    const C = ctx.S;
    if (flag("case_10_token_bridge")) {
      yield C.say(["\"Second token's yours. There's one in the park and the park keeper is a stickler.\""], { name: "Angler" });
      return;
    }
    if (!flag("case_10_open")) {
      yield C.say(["\"There's a brass thing wedged under the parapet of that bridge. Been there years. Otis knows.\""], { name: "Angler" });
      return;
    }
    yield C.say([
      "Under the downstream parapet of the Dane bridge, wedged into a joint, something brass.",
      "Getting it out means lying flat on cold stone with your arm over the river while a man fishes eight feet away and says nothing about it."
    ]);
    yield C.setFlag("case_10_token_bridge", true);
    yield C.giveItem("collectible_11", 1);
    yield C.notify("Bear token 2/3.");
    yield C.say(["\"Third one's in the park,\" says the angler, to the water. \"Warden's got it in his hut and he'll want telling why.\""], { name: "Angler" });
  });

  def("mid_congleton_token_3", function* (ctx) {
    const C = ctx.S;
    if (flag("case_10_token_park")) {
      yield C.say(["\"All three. Go and see Otis. He'll pretend he'd forgotten.\""], { name: "Mere-Warden" });
      return;
    }
    if (!flag("case_10_token_bridge")) {
      yield C.say(["\"Bakery, bridge, park. In that order, because that's the order the town put them in, in 1897, for a reason nobody wrote down.\""], { name: "Mere-Warden" });
      return;
    }
    yield C.say([
      "Warden's hut. A tin on a shelf with BEAR TOKENS, 1897 on it in a hand that has been dead a century.",
      "\"Why d'you want it?\" he says. He asks everybody. Nobody has ever had a good answer."
    ], { name: "Mere-Warden" });
    const a = yield C.ask("", [
      { label: "\"Otis asked me to.\"", value: "otis" },
      { label: "\"Because somebody's printing lies over the town's own password.\"", value: "true" },
      { label: "\"I collect things.\"", value: "collect" }
    ]);
    if (a === "true") {
      yield C.say(["He looks at you for a moment and then hands the tin over without opening it.", "\"That's the first good answer,\" he says."], { name: "Mere-Warden" });
    } else if (a === "otis") {
      yield C.say(["\"Aye, he would.\" He hands it over. \"He's asked four people this month. You're the first one who came.\""], { name: "Mere-Warden" });
    } else {
      yield C.say(["\"So does the council,\" he says, and hands it over anyway, because he has been waiting to give it to somebody since about 1994."], { name: "Mere-Warden" });
    }
    yield C.setFlag("case_10_token_park", true);
    yield C.giveItem("collectible_11", 1);
    yield C.notify("Bear token 3/3.");
    yield C.say([
      "Three tokens, four letters between them, and they spell BEAR, which is the town's Wi-Fi password.",
      "Which the town has been perfectly happy about for fourteen years, until somebody printed it on a lamppost with a lie under it."
    ]);
  });

  // ---- case 12: the dead drop on the cold side --------------------------
  def("mid_sandbach_drop", function* (ctx) {
    const C = ctx.S;
    if (flag("case_12_handed_in") || flag("case_12_sold")) {
      yield C.say(["The stone is back the way it was. The north side of a churchyard is cold because nobody stands in it, and now nobody does again."]);
      return;
    }
    if (!flag("clue_interlace_key")) {
      yield C.say([
        "The north side of the churchyard. Damp stone, no sun, and a table tomb with a corner that has been lifted recently.",
        "You would need to know which four panels were chalked, and in what order, before this meant anything."
      ]);
      return;
    }
    if (!flag("case_12_drop_found")) {
      yield C.setFlag("case_12_drop_found", true);
      yield C.say([
        "Four panels, four marks, and the order they were chalked in reads — against the alphabet on the old market sign — as a bearing and a distance.",
        "The bearing is from the north cross. The distance is forty-one paces. Forty-one paces is the third table tomb on the cold side."
      ]);
      yield C.say([
        "Under the lifted corner: a freezer bag, and in the freezer bag a printed list.",
        "Eleven thousand credential pairs, sorted by postcode, with a column at the end headed WORKS / DOESN'T."
      ]);
      yield C.notify("Casebook: a Credential Stuffer proxy list.");
      yield C.setFlag("clue_proxy_list", true);
      return;
    }
    const a = yield C.ask("What do you do with eleven thousand people's passwords?", [
      { label: "Take it to Brine Nell at Nantwich. She was forensics.", value: "nell" },
      { label: "Sell it to the Shadow IT contact. Two thousand, cash.", value: "sell" },
      { label: "Leave it and watch who comes for it.", value: "wait" }
    ]);
    if (a === "sell") {
      yield C.setFlag("case_12_sold", true);
      yield C.giveMoney(2000);
      yield C.say([
        "Two thousand, in an envelope, in a car park, from a man who does not get out of the car.",
        "Nobody is harmed by this today. That is the whole of what you can honestly say about it."
      ]);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_12_saxon_crosses_cipher");
      return;
    }
    if (a === "wait") {
      yield C.say([
        "You put it back and you sit in the cold for four hours and nobody comes, because nobody was going to come today.",
        "Dead drops are not collected on the day they are filled. That is the entire point of them and you knew that."
      ]);
      return;
    }
    yield C.setFlag("case_12_handed_in", true);
    yield C.setFlag("case_12_done", true);
    yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(5); });
    yield C.giveMoney(1200);
    yield C.say([
      "Nantwich is two towns and a train away and she will not thank you, because she does not thank people; she files them.",
      "But eleven thousand of those are somebody's mum's, and one of them is a salon on Nantwich Road."
    ]);
    if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_12_saxon_crosses_cipher");
    yield C.notify("Casebook case closed: The Saxon Crosses Cipher.");
  });

  // ---- case 06: the photo census ----------------------------------------
  def("mid_tatton_stag", function* (ctx) {
    const C = ctx.S;
    if (!flag("case_06_open")) {
      yield C.say(["A stag, side on, entirely unbothered. Its antlers are a shape you would recognise again."]);
      return;
    }
    const n = Number(flag("case_06_photos") || 0);
    if (flag("case_06_ninth")) {
      yield C.say(["A stag. An ordinary, correct, extremely large stag, doing nothing at all of note."]);
      return;
    }
    if (n >= 8) {
      yield C.music("cutscene_signal");
      yield C.say([
        "The ninth one is standing slightly apart from the herd on ground the herd is not using.",
        "It has the antlers of a six-year-old and the coat of a yearling and it is looking at the camera before you raise it."
      ]);
      yield C.say([
        "Through the lens it is a stag. Above the lens it is a stag.",
        "In the photograph, when you look at the photograph, it is a stag with its ears on slightly wrong."
      ]);
      yield C.say([
        "It goes. Not bolting — walking, at the speed of something that has decided the appointment is over.",
        "Where it stood there is a thing in the grass about the size of a bank card, and it is warm, and it has half a face printed on it."
      ]);
      yield C.setFlag("case_06_ninth", true);
      yield C.giveItem("face_fragment_1", 1);
      yield C.giveItem("rain_cloak", 1);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(4); });
      yield C.giveMoney(800);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_06_deer_census_part_two");
      yield C.notify("Face Fragment #1.");
      yield C.music("town_knutsford");
      return;
    }
    const rain = MQ.Clock && MQ.Clock.weather === "rain";
    const wet = n >= 6;
    if (wet && !rain) {
      yield C.say([
        "Six patterns logged. The last two you need are the pair that only come down off the rise when it is raining.",
        "It is not raining. Nerys would tell you to wait, and Nerys has waited since 1998."
      ]);
      return;
    }
    yield C.addFlag("case_06_photos", 1);
    const now = Number(flag("case_06_photos") || 1);
    yield C.sfx("camera_shutter");
    yield C.say(["A clean side-on frame: brow, bay, trey, and the little kink in the near palm that makes this one this one.", "Antler patterns logged: " + now + "/8."]);
    yield C.notify("Stag " + now + "/8 photographed.");
  });

  // ---- case 13: Bramble --------------------------------------------------
  def("mid_r14_bramble", function* (ctx) {
    const C = ctx.S;
    if (flag("case_13_done")) {
      yield C.say(["The hedge above the fourth lock has berries on it again. It will not last."]);
      return;
    }
    if (!flag("case_13_tracked")) {
      yield C.setFlag("case_13_tracked", true);
      yield C.say([
        "Stripped hedge, all the way up the flight, one bush at a time and always the same side.",
        "Berries gone, pips spat out in a little heap. Deer swallow the pips. Birds swallow the pips. This thing spits them."
      ]);
      yield C.say([
        "Above the fourth lock the heap is fresh and the hedge is still moving.",
        "There is an orchard tag caught in the thorns: a printed loop of card, weathered, with a Welsh farm name on it."
      ]);
      yield C.notify("Casebook: 'Bramble' is upstream of the fourth lock.");
      return;
    }
    yield C.say(["The hedge stops moving. Something the size of a cat and the colour of a bad apple comes out of it backwards, which is not how anything should leave a hedge."]);
    const r = yield C.battle({ kind: "wild", species: "rottling", level: 24, canCatch: true, music: "battle_wild" });
    if (r && (r.outcome === "catch" || r.outcome === "win")) {
      yield C.setFlag("case_13_done", true);
      yield C.giveMoney(500);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(2); });
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_13_bounty_fenced_goods");
      yield C.say([
        "The orchard tag is from Y Berllan, Ceredigion, which is a farm you have not thought about since you were twelve.",
        "It came over in a consignment. It has been eating its way across Cheshire ever since and nobody noticed until a board went up in Sandbach."
      ]);
      yield C.setFlag("clue_berllan_tag", true);
      yield C.notify("Bounty closed: Fenced Goods.");
    }
  });
})();
