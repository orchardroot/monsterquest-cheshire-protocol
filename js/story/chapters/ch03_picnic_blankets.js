// =============================================================
// MonsterQuest v2 — CHAPTER 3: "Picnic Blankets"
// Knutsford, Tatton Park, Rostherne Mere. Levels 13-18, Gym 2 CIPHER.
// A deer census that is a botnet, a preacher on a blanket who has read
// the thing he tells you not to read, a bell under thirty metres of cold
// water, and a woman in a bonnet who runs the county's threat intel.
// Owned by region-mid.
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

  // -------------------------------------------------------- arriving ------
  def("mid_knutsford_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("knutsford_arrival", true);
    yield C.music("town_knutsford");
    yield C.banner("Knutsford", "King Street · Princess Street · the Heath");
    yield C.say([
      "Knutsford. Georgian brick, white sash, and two streets stacked twelve feet apart because the town could not decide which was the front.",
      "Somebody has sanded a pattern down the middle of King Street in coloured sand and everybody is walking on it, which is what it is for."
    ]);
    yield C.say([
      "On the Heath there is a folding table, a man with a stack of leaflets, and a queue.",
      "The leaflet is one line long. In Cheshire that is not evangelism. That is a payload."
    ]);
  });

  // -------------------------------------------------------- Tatton --------
  def("mid_tatton_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("tatton_arrival", true);
    yield C.banner("Tatton Park", "A thousand acres, two halls, four hundred deer");
    yield C.say([
      "The drive goes straight up the middle of a thousand acres under a double row of limes planted by somebody who would never see them meet.",
      "Deer everywhere: fallow in the bracken, red on the rise, all of them close to the path and none of them moving."
    ]);
    yield C.say([
      "MEADOW goes ahead about forty yards, stops, and looks back at you until you catch up. She does that on routes.",
      "Then she sits down at the second tree and looks at the mere and does not intend to be argued with."
    ]);
  });

  def("mid_tatton_blankets", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("tatton_blankets_seen", true);
    yield C.music("cutscene_signal");
    yield C.say([
      "Fifty picnic blankets on the parkland in a rough circle, and not one sandwich between them.",
      "People sitting cross-legged, coats on, listening. Nobody is eating. Nobody has brought anything, because bringing things is doubt."
    ]);
    yield C.say([
      "Beyond the blankets there is a white marquee with a queue at it and a hand-painted sign about a hamper.",
      "And beyond the marquee, at the top of the rise, about eighty deer standing in a rough circle facing the same way as the people."
    ]);
    yield C.say([
      "One command! ONE! Copy, paste, run — and you are CLEAN!",
      "Do not read it. Reading is doubt."
    ], { name: "Kellan" });
    yield C.music("town_knutsford");
  });

  def("mid_tatton_kellan", function* (ctx) {
    const C = ctx.S;
    if (flag("deer_census_done")) {
      yield C.say([
        "They took the tent. They took it in a van at four in the morning and they did not say goodbye.",
        "I am still here. Somebody has to be still here."
      ], { name: "Kellan" });
      return;
    }
    if (!flag("kellan_met")) {
      yield C.setFlag("kellan_met", true);
      yield C.say([
        "Sit down! Sit on the blanket! There is always another blanket.",
        "One command. Copy, paste, run. And you are clean, and it is DONE, and you never have to be frightened of it again."
      ], { name: "Kellan" });
      const a = yield C.ask("Jim looks at the leaflet for a while.", [
        { label: "\"Read it.\"", value: "read" },
        { label: "\"Who printed these?\"", value: "who" },
        { label: "Say nothing.", value: "none" }
      ]);
      if (a === "read") {
        yield C.say([
          "...I have, actually.",
          "That's the trouble."
        ], { name: "Kellan" });
        yield C.say([
          "He says it in a completely different voice — a tired one, a teacher's one — and then he puts the other voice back on like a coat.",
          "BLANKETS! THERE IS ALWAYS ANOTHER BLANKET!"
        ]);
        yield C.setFlag("kellan_admitted", true);
        yield C.setFlag("clue_kellan_read_it", true);
        yield C.notify("Casebook: Kellan has read the command.");
      } else if (a === "who") {
        yield C.say([
          "The Word came to us. Nobody prints the Word.",
          "The leaflets came in a box. The box came on a Tuesday. The box had a delivery note and the delivery note said ORCHARD, which I thought was rather lovely."
        ], { name: "Kellan" });
        yield C.setFlag("clue_orchard_box", true);
        yield C.notify("Casebook: a delivery note that said ORCHARD.");
      } else {
        yield C.say(["He waits for you to argue. You don't. It unsettles him more than arguing would."]);
      }
      yield C.say([
        "The tent is for the DEER. The count is a kindness. We are counting them because nobody else has bothered to.",
        "Go and count some. Go on. It's lovely. You'll feel it."
      ], { name: "Kellan" });
      return;
    }
    yield C.say(["There is always another blanket, friend. That is the whole of the good news."], { name: "Kellan" });
  });

  def("mid_tatton_nerys", function* (ctx) {
    const C = ctx.S;
    if (flag("deer_census_done")) {
      if (flag("amos_first_glimpse") && !flag("case_06_open")) {
        yield C.setFlag("case_06_open", true);
        yield C.say([
          "Two hundred and eighty-one fallow. Sixty-three red. Counted on foot with a clicker, like 1998.",
          "Now do it properly. Photograph eight distinct stags — antler patterns, not faces. Two of them only come out in rain."
        ], { name: "Nerys" });
        if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_06_deer_census_part_two");
        yield C.notify("Casebook: The Deer Census, Part Two.");
        return;
      }
      yield C.say([
        "Two hundred and eighty-one fallow. Sixty-three red. I counted them myself, on foot, with a clicker, like 1998.",
        "Come back in the autumn and do it properly with a camera and I'll show you what a real census looks like."
      ], { name: "Nerys" });
      return;
    }
    if (!flag("census_started")) {
      yield C.setFlag("census_started", true);
      yield C.say([
        "Deer Warden Nerys. I have counted this herd every October since 1998, on foot, with a clicker and a bad knee.",
        "This year somebody offered to help. Volunteers, tally sheets, an app. Two hundred and forty people signed up in a week."
      ], { name: "Nerys" });
      yield C.say([
        "And the count is wrong. Not a bit wrong. Wrong in a way that MOVES.",
        "I counted two eighty-one on Monday. The tent says four hundred and nine. Then three hundred. Then four hundred and eleven."
      ], { name: "Nerys" });
      yield C.say([
        "And every time the number jumps, something comes out of the fog on the far side of the mere.",
        "I want you to count with me. Properly. And I want you to watch what happens when we're right."
      ], { name: "Nerys" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_03_picnic_blankets");
      yield C.notify("The deer census.");
      return;
    }
    // The set-piece: three tallies. Wrong ones spawn a puppet; the last one
    // is a herd of PIPHARTS driven across the mere.
    yield C.say([
      "Right. Three sweeps: the lime avenue, the mere shore, and the rise behind the tent.",
      "You call the number. I'll write it. And if the number's wrong we'll both find out at once."
    ], { name: "Nerys" });
    const sweeps = [
      { q: "The lime avenue. You count deer between the trunks.", right: 34, opts: [22, 34, 61] },
      { q: "The mere shore. Fallow in the bracken, and the light going.", right: 47, opts: [47, 88, 19] },
      { q: "The rise behind the tent. Eighty-odd animals, all facing the same way.", right: 83, opts: [140, 61, 83] }
    ];
    let wrong = 0;
    for (let i = 0; i < sweeps.length; i++) {
      const s = sweeps[i];
      const pick = yield C.ask(s.q + " What do you call?", [
        { label: String(s.opts[0]), value: s.opts[0] },
        { label: String(s.opts[1]), value: s.opts[1] },
        { label: String(s.opts[2]), value: s.opts[2] }
      ]);
      if (Number(pick) === s.right) {
        yield C.say(["Nerys writes it down and says nothing, which is how you know it matched hers."]);
      } else {
        wrong++;
        yield C.say([
          "Nerys's pencil stops.",
          "Out on the water, in the fog, something logs in."
        ]);
        yield C.sfx("fog_hum");
        const r = yield C.battle({ kind: "wild", species: "puppetacct", level: 16, canCatch: true, music: "battle_wild" });
        if (r && r.lost) {
          yield C.say(["You go back to the tent to sit down, and the tally sheet is exactly where you left it, and it has a new number on it."]);
          return;
        }
        yield C.say(["It comes apart. The number on the tent's board goes down by one and then, after a moment, back up."]);
      }
    }
    yield C.say([
      "Two hundred and eighty-one. Sixty-three red. Same as Monday. Same as every October since 1998.",
      "So where — and here she turns the tally board round — is four hundred and eleven coming from?"
    ], { name: "Nerys" });
    yield C.music("cutscene_signal");
    yield C.say([
      "Across the mere, in the fog, a herd of PIPHARTS is being driven — not spooked, DRIVEN, in a line, at a pace, by nothing you can see.",
      "They go into the water at the shallow end and out at the far side and up the rise and they stop dead in a row.",
      "And every deer on this parkland, all three hundred and forty-four of them, turns its head at the same second."
    ]);
    yield C.wait(700);
    yield C.say([
      "The tent's tally board reads FOUR HUNDRED AND ELEVEN.",
      "There are three hundred and forty-four deer at Tatton Park. There are also, on the clipboard in the tent, eleven hundred names."
    ]);
    yield C.setFlag("deer_census_done", true);
    yield C.setFlag("agent_arbiter", true);
    yield C.notify("Agent ARBITER is available in battle.");
    yield C.say(["Objection sustained."], { name: "ARBITER" });
    yield C.say([
      "Nerys puts the clicker in her coat pocket and holds it there.",
      "\"I'd like the count to be a count again,\" she says. \"That's all I want. That's the whole of what I want.\""
    ]);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_03_picnic_blankets");
    yield C.music("town_knutsford");
  });

  def("mid_tatton_vex", function* (ctx) {
    const C = ctx.S;
    yield C.music("battle_vex");
    yield C.say([
      "Root user. You look like a man who's been reading picnic blankets.",
      "I've been here since six. I've mapped the tent, I've mapped the queue, and I've worked out the whole thing, and I am about to be VERY impressive."
    ], { name: "VEX" });
    yield C.say([
      "It's a login farm. Obviously it's a login farm. Name, email, mother's maiden name — that's a password reset, not a raffle.",
      "So: I've signed in four hundred times with four hundred made-up nans and poisoned the whole set. You're welcome."
    ], { name: "VEX" });
    yield C.say([
      "Did anybody ask you to do that?",
      "Nobody ASKS, root user. That's the difference between us and it's the good difference."
    ], { name: "VEX" });
    const r = yield C.battle({ kind: "trainer", trainer: "vex_2", music: "battle_vex" });
    if (r && r.lost) {
      yield C.say(["Told you. Bar's mine and it's somewhere over there."], { name: "VEX" });
      yield C.music("town_knutsford");
      return;
    }
    yield C.setFlag("vex_battle_2", true);
    yield C.say([
      "That was the WIND. There is a wind on this parkland, it comes off the mere, and it does things to a throw.",
      "...Fine. Two-nil. It's a series. Series have shapes."
    ], { name: "VEX" });
    yield C.say([
      "VEX's starter comes back into its capsule and the capsule chirps, twice, in a way that yours does not.",
      "You have heard that chirp before. You cannot immediately think where."
    ]);
    yield C.say([
      "Anyway. The command on the leaflet. I pulled it apart while you were counting deer like a Victorian.",
      "It fetches a second stage from a domain registered eleven weeks ago. The registrar's in Tbilisi."
    ], { name: "VEX" });
    yield C.setFlag("tbilisi_domain_found", true);
    yield C.notify("Casebook: the cleansing command points at Tbilisi.");
    yield C.say([
      "Tbilisi.",
      "Yeah. Why — is that a face? Root user, is that a face?"
    ], { name: "VEX" });
    yield C.say(["Noted."]);
    yield C.say(["Don't say noted. Don't SAY noted at me."], { name: "VEX" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_03_picnic_blankets");
    yield C.music("town_knutsford");
  });

  // ------------------------------------------------------- Rostherne ------
  def("mid_rostherne_bell", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("rostherne_relay_seen", true);
    yield C.freeze(true);
    yield C.music("cutscene_signal");
    yield C.say([
      "The jetty is nine feet of grey board over thirty metres of cold.",
      "The mere is flat. Not calm — flat, the way a screen is flat."
    ]);
    yield C.wait(600);
    yield C.sfx("bell_toll");
    yield C.say([
      "The bell rings.",
      "It is not a sound in the air. It is a sound in the water, and it arrives in your feet before it arrives in your ears."
    ]);
    yield C.wait(500);
    yield C.say([
      "Twelve feet down, off the end of the jetty, something switches on.",
      "A pale green line of light, about the length of a narrowboat, lying on the bottom in the silt with a slow pulse running along it."
    ]);
    yield C.wait(400);
    yield C.say([
      "It pulses. It stops. It pulses again, ninety seconds later, exactly.",
      "Every heron on the island lifts at once and does not call."
    ]);
    yield C.sfx("signal_pulse");
    yield C.say([
      "Behind you, up the whole length of the lane and across the parkland and out into the county, every animal that can turn its head turns its head.",
      "Not towards the mere. Past it. South-west, at about forty-three degrees off the flat, at something a long way further on."
    ]);
    yield C.wait(400);
    yield C.say([
      "MEADOW does not turn. MEADOW sits down on the jetty with her tail round her feet and watches the water.",
      "She does not watch water. She has never once watched water, and you know what that means."
    ]);
    yield C.setFlag("clue_relay_period", true);
    yield C.notify("Casebook: a submerged relay under Rostherne Mere.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_03_picnic_blankets");
    yield C.freeze(false);
    yield C.music("cutscene_signal");
  });

  // ============================ GYM 2: the library =======================
  def("mid_gym2_door", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_cipher")) {
      yield C.say(["Madam is in. Madam is always in. Go through."], { name: "Aisle-keeper" });
      return;
    }
    yield C.say([
      "House rules, and they are the room's, not hers.",
      "One: every monster of Madam's arrives with a special screen already up. A cipher is a screen. That is what a cipher IS.",
      "Two: the aisles move. Three lecterns, three questions, and you read them in the order the shelves are numbered, not the order you find them.",
      "Three: she does not test what you know. She tests whether you can be bothered to look."
    ], { name: "Aisle-keeper" });
  });

  function* aisleCheck(C) {
    if (flag("gym2_key_1") && flag("gym2_key_2") && flag("gym2_key_3") && !flag("gym2_open")) {
      yield C.setFlag("gym2_open", true);
      yield C.sfx("ui_select");
      yield C.say([
        "Somewhere behind the stacks a counterweight lets go, and four ranks of shelving roll aside on rails laid in 1904.",
        "Where there was a wall there is now an aisle, and at the end of the aisle a door, and behind the door somebody has been pouring two cups of tea."
      ]);
      yield C.notify("The stacks have opened.");
    }
  }

  def("mid_gym2_lectern_1", function* (ctx) {
    const C = ctx.S;
    if (flag("gym2_key_1")) { yield C.say(["Shelf 1. Answered. The aisle is open and the card is back in its sleeve."]); return; }
    yield C.say([
      "SHELF 1 — CORRESPONDENCE, CHESHIRE, 1832–.",
      "On the lectern, a card in a beautiful hand: 'A letter arrives already read. What did the reading cost the letter?'",
      "Under it, three sleeves, each with a word in it."
    ]);
    const a = yield C.ask("Which sleeve do you take?", [
      { label: "NOTHING — the words are unchanged.", value: "nothing" },
      { label: "PRIVACY — the words are the same and the letter is not.", value: "privacy" },
      { label: "TIME — it arrived faster.", value: "time" }
    ]);
    if (a === "privacy") {
      yield C.setFlag("gym2_key_1", true);
      yield C.sfx("ui_select");
      yield C.say([
        "The sleeve comes away with a card behind it: the letter K, and a small pencilled 1.",
        "Somewhere to your left a rank of shelving moves eight inches and stops."
      ]);
      yield* aisleCheck(C);
      return;
    }
    if (a === "time") {
      yield C.say(["Underneath the TIME sleeve, in the same hand: 'That is my answer, dear, and I am not proud of it.'", "Nothing moves."]);
      return;
    }
    yield C.say(["Under the NOTHING sleeve: 'Then you have never had one opened.'", "Nothing moves."]);
  });

  def("mid_gym2_lectern_2", function* (ctx) {
    const C = ctx.S;
    if (flag("gym2_key_2")) { yield C.say(["Shelf 2. Answered."]); return; }
    if (!flag("gym2_key_1")) {
      yield C.say([
        "SHELF 2 is dark and the lectern is closed.",
        "A card on the lid: 'Rumour is second. It is always second. Something has to have been said first.'"
      ]);
      return;
    }
    yield C.say([
      "SHELF 2 — RUMOUR, UNVERIFIED. The largest section in the building and, Madam maintains, the most accurate.",
      "On the lectern: 'Eleven people tell me the same thing. Nine heard it from the other two. What have I got?'"
    ]);
    const a = yield C.ask("Which sleeve?", [
      { label: "ELEVEN SOURCES.", value: "eleven" },
      { label: "TWO SOURCES.", value: "two" },
      { label: "ONE SOURCE AND A WEATHER SYSTEM.", value: "one" }
    ]);
    if (a === "two") {
      yield C.setFlag("gym2_key_2", true);
      yield C.sfx("ui_select");
      yield C.say([
        "A card: the letter E, pencilled 2.",
        "In the margin, in the same beautiful hand: 'Everybody in intelligence learns this and nobody in the newspapers ever does.'"
      ]);
      yield* aisleCheck(C);
      return;
    }
    if (a === "one") {
      yield C.say(["'Poetic,' says the card under the sleeve, 'and wrong by one. Try counting.'"]);
      return;
    }
    yield C.say(["Under the sleeve: 'Then you will believe eleven of anything, dear, and I shall have to be careful around you.'"]);
  });

  def("mid_gym2_lectern_3", function* (ctx) {
    const C = ctx.S;
    if (flag("gym2_key_3")) { yield C.say(["Shelf 3. Answered."]); return; }
    if (!flag("gym2_key_2")) {
      yield C.say(["SHELF 3 is closed. 'Third,' says the card, 'and last, and about you.'"]);
      return;
    }
    yield C.say([
      "SHELF 3 — THINGS PEOPLE SAID THEY HADN'T. Cross-referenced with Shelf 1.",
      "On the lectern: 'A friend tells you she has had a thing looked at. She has not had it looked at. What is it that you actually heard?'"
    ]);
    const a = yield C.ask("Which sleeve?", [
      { label: "A LIE.", value: "lie" },
      { label: "A SENTENCE SHE HAD PREPARED.", value: "prepared" },
      { label: "NOTHING — I inferred it.", value: "nothing" }
    ]);
    if (a === "prepared") {
      yield C.setFlag("gym2_key_3", true);
      yield C.sfx("ui_select");
      yield C.say([
        "A card: the letter Y, pencilled 3.",
        "And under it, added later, in pencil rather than ink: 'and you knew it was prepared because you have heard her not prepare things for eleven years.'"
      ]);
      yield C.say(["You put the card back in the sleeve and stand there for a moment longer than the puzzle requires."]);
      yield* aisleCheck(C);
      return;
    }
    if (a === "lie") {
      yield C.say(["'Too fast,' says the card. 'A lie is a thing you decide. Go back and listen to how she said it.'"]);
      return;
    }
    yield C.say(["'Do not be modest,' says the card. 'You heard it. That is your entire trade.'"]);
  });

  def("mid_gym2_backdoor", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The way through is a blank end of shelving with no handle and no hinge and a small brass plate that says, simply, K E Y.",
      "Three lecterns. In the order the shelves are numbered."
    ]);
  });

  def("mid_gym2_gaskell", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_cipher")) {
      yield C.say([
        "Sit down, dear. The tea is the good tea and you have walked from Tatton.",
        "Anything you hear, bring it here. I shall know already. Bring it anyway; the bringing is the part that matters."
      ], { name: "Madam Gaskell" });
      return;
    }
    yield C.music("battle_gym");
    yield C.say([
      "There you are. Sit — no, the good chair. You have walked.",
      "Three questions and you took the third one slowly, which nobody has ever done, and I should very much like to know why."
    ], { name: "Madam Gaskell" });
    yield C.say([
      "Madam Gaskell. Knutsford. Psychic, if we must be technical, and I would rather we weren't.",
      "In Knutsford we don't say 'threat actor', dear. We say 'from Wilmslow'."
    ], { name: "Madam Gaskell" });
    yield C.say([
      "House rule, and it is not a trick: everything of mine comes out with a screen already up.",
      "A cipher is a screen. The entire point of a cipher is that it went up before you arrived. If that offends you, you are in the wrong county."
    ], { name: "Madam Gaskell" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_gaskell", music: "battle_gym" });
    if (r && r.lost) {
      yield C.say([
        "Never mind, dear. Come back when you have read the whole thing and not just the first line.",
        "That is not unkind. That is the only advice anybody has ever needed."
      ], { name: "Madam Gaskell" });
      yield C.music("town_knutsford");
      return;
    }
    yield C.say([
      "Well. That was extremely rude and extremely correct, which is my favourite combination.",
      "CIPHER. And the card — Cranford Whisper. Do not use it on anybody who is already frightened; it is worse then."
    ], { name: "Madam Gaskell" });
    yield C.setFlag("badge_cipher", true);
    yield C.giveItem("anchor_cipher", 1);
    yield C.giveItem("tm_cranford_whisper", 1);
    yield C.sfx("achievement");
    yield C.notify("CIPHER badge obtained.");
    if (MQ.Trainer && MQ.Trainer.addBadge) yield C.custom(function () { MQ.Trainer.addBadge("badge_cipher"); });
    else if (MQ.Trainer && MQ.Trainer.badges && MQ.Trainer.badges.add) yield C.custom(function () { MQ.Trainer.badges.add("badge_cipher"); });
    yield C.say([
      "Now. The part you came for and did not ask for, because you are polite in the wrong places.",
      "I have eleven hundred correspondents in this county and I have had them since 1962. That is my network and it is yours now."
    ], { name: "Madam Gaskell" });
    yield C.setFlag("gaskell_network", true);
    yield C.notify("Gaskell's network: rumours will find you.");
    yield C.say([
      "First one, gratis. Four years ago Alder Labs in Macclesfield sold something.",
      "Nobody will say what. Everybody agrees there was a buyer. Two of my correspondents used the same phrase about it without speaking to one another, which is the only kind of corroboration I trust.",
      "The phrase was: 'she had to.'"
    ], { name: "Madam Gaskell" });
    yield C.setFlag("clue_alder_sold", true);
    yield C.notify("Casebook: Alder Labs sold something, four years ago.");
    yield C.say([
      "You have gone very still, dear. That is quite all right. Drink the tea.",
      "I shall not ask. I have made a career of not asking at exactly the right moment."
    ], { name: "Madam Gaskell" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_03_picnic_blankets");
    yield C.music("town_knutsford");
  });

  def("mid_gaskell_tower", function* (ctx) {
    const C = ctx.S;
    if (!flag("gaskell_network")) {
      yield C.say([
        "The window seat, the good chair, and a view of the entire length of King Street.",
        "\"Do sit, dear. I am not at home to business until you have a badge. It is not snobbery; it is filing.\""
      ], { name: "Madam Gaskell" });
      return;
    }
    const rumours = [
      ["A lorry has been stood on the Elworth cut for nine days with its engine running. Diesel is not a joyride. Diesel is a generator."],
      ["The departure boards from Carlisle to Cardiff flickered and reset at the same second twice a day for a fortnight. Somebody is pushing to all of them at once."],
      ["A woman in hi-vis signed the Tatton library register with a single initial. Nobody has done that since the register began."],
      ["Every clock in the county that talks to another clock is thirteen seconds out, in and out, like breathing."],
      ["Brother Kellan taught information technology at Holmes Chapel High for nine years and was, by every account, extremely kind."],
      ["There is a bear on Bosley Cloud. I have four correspondents on that and one of them is a policeman."]
    ];
    let i = Number(flag("gaskell_rumour") || 0);
    if (i >= rumours.length) i = rumours.length - 1;
    yield C.say(rumours[i], { name: "Madam Gaskell" });
    yield C.addFlag("gaskell_rumour", 1);
    yield C.say(["\"Bring me something back one day,\" she says, to the window. \"It is not a network if it only runs one way.\""], { name: "Madam Gaskell" });
  });

  // ------------------------------------------------------------ chapter ---
  S.defineChapter(3, {
    title: "Picnic Blankets",
    quest: "main_03_picnic_blankets",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_03_picnic_blankets");
      yield C.say([
        "Knutsford is four miles of heath west of the Edge and it has known you were coming since about Tuesday.",
        "There is a gym in a library where the shelves move, an estate with four hundred deer in it, and a man on a blanket telling people not to read things.",
        "And somewhere south-west of all of it, every ninety seconds, something says the same thing again."
      ]);
    },
    hooks: {
      complete: function () {
        return !!(flag("badge_cipher") && flag("deer_census_done") && flag("rostherne_relay_seen") &&
          flag("tbilisi_domain_found") && flag("gaskell_network") && flag("vex_battle_2"));
      },
      next: 4
    }
  });
})();
