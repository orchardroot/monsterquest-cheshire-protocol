// =============================================================
// MonsterQuest v2 — CHAPTER 6: "Brine and Perry"
// Nantwich, levels 25-30, Gym 5 (Water, TOKEN) — and then three hours
// west on the Cambrian line to a farm with no signal, where the thing
// you have been chasing across a county turns out to have been left in
// a shed, by you, with a label on it in your own handwriting.
// Registers MQ.Story.chapters[6] and the Ch.6 set-piece scripts.
// Owned by region-southwest.
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
  function num(id) { const v = flag(id); return typeof v === "number" ? v : (v ? 1 : 0); }

  // ------------------------------------------------------- chapter opening --
  // Runs after Badge 4. Jim walks in off the Willaston lane with three
  // agents who have started being helpful in a way he does not like.
  function* opening(ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("town_nantwich");
    yield C.say([
      "Six miles of flat lane out of Crewe, a leaning tower, and then a town that is entirely black and white because it burned down in 1583 and a queen paid to put it back.",
      "The air changes about half a mile out. It gets heavier and very slightly of the sea, which is odd, because the sea is fifty miles away."
    ]);
    yield C.say([
      "It is the brine. Two hundred feet down there is water saltier than the Irish Sea, and Nantwich has been pulling it up since the Romans and swimming in it since 1935."
    ]);
    // The obstacle: the Trio have started volunteering.
    yield C.say(["scouted. three things in the hedge, all slow, all worth exp. engaging."], { name: "SLEET" });
    yield C.say(["I didn't ask for a scout."]);
    yield C.say(["You didn't say no, either. Have you eaten? Not the cats. You."], { name: "VIGIL" });
    yield C.say(["Objection noted. Overruled."], { name: "ARBITER" });
    yield C.say([
      "Three fights on that lane you did not choose. Not dangerous. Not even inconvenient.",
      "Just... offered, and then had, and then logged."
    ]);
    yield C.setFlag("agents_helpful", true);
    yield C.wait(400);
    yield C.say([
      "Jim. It's Wren. Don't ring back, I'm about to be in a meeting about a thing I am not allowed to describe.",
      "Nell's expecting you. She was forensics for twenty-two years before the gym and she is the only person in this county I would show a hard drive to."
    ], { name: "Dr Alder" });
    yield C.say([
      "Also — and I want to say this while I have the nerve — go home after. To Nesta's. The pears will be in.",
      "You have not been in four years and I am the reason for two of those and I would like to stop being the reason."
    ], { name: "Dr Alder" });
    yield C.say(["Noted."]);
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_06_brine_and_perry");
    yield C.setFlag("chapter_6_started", true);
    yield C.freeze(false);
  }

  def("sw_nantwich_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.banner("Nantwich", "Brine, timber and cheese");
    yield C.say([
      "High Street. Every gable has a date carved on it and every date is between 1583 and 1585, which is what happens when a queen pays for a rebuild and the builders are competitive.",
      "Halfway along, a woman in a swimming cap is arguing with a man in a white robe about the difference between clean and cleansed."
    ]);
    yield C.say([
      "MEADOW gets up onto the wall of the churchyard and sits facing the north-east, which is where the pool is, and does not turn round."
    ]);
    yield C.setFlag("nantwich_arrival", true);
    yield C.freeze(false);
  });

  // ============================================================ THE LIDO ===
  def("sw_lido_gate", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The lido gate. Behind it, fifty yards of warm brine with steam coming off it in the rain, and about forty people standing on the poolside not getting in."
    ]);
  });

  def("sw_lido_scene", function* (ctx) {
    const C = ctx.S;
    if (flag("lido_battle_done")) return;
    yield C.freeze(true);
    yield C.music("battle_boss");
    yield C.weather("rain");
    yield C.say([
      "It is raining on the pool. The rain hits the brine and comes straight back up as steam, so the whole lido is a warm white room with no ceiling.",
      "Brother Kellan is standing at the deep end in a white robe with the sleeves rolled up, which is the detail that gets you: he has rolled his sleeves up. He means to work."
    ]);
    yield C.say([
      "FOUR SECONDS! One command, one paste, and you are CLEAN — and here is the water to prove it!",
      "Do not read it. Reading is doubt. Doubt is why you are all standing on the tiles in your coats."
    ], { name: "Kellan" });
    yield C.say(["Read it."]);
    yield C.say([
      "...I have, actually. That is the trouble.",
      "I read it in March, on a Tuesday, in a Year Nine cover lesson, and there is a bit in the middle that is somebody's shopping list, and I kept going anyway."
    ], { name: "Kellan" });
    yield C.say(["Then why are you still here?"]);
    yield C.say([
      "Because it WORKS, Jim. Not the command. The four seconds.",
      "For four seconds every person who pastes it believes somebody competent is helping them. Do you know how rare that is? I taught IT for twenty-one years and I could not manufacture four seconds of that."
    ], { name: "Kellan" });
    yield C.wait(400);
    yield C.say([
      "He steps into the shallow end in his shoes. Behind him the steam closes over the lane ropes.",
      "The pool heals what is in it. Both sides. That is not a rule anyone set; it is just what warm brine does, to everybody, all the time."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "boss_kellan", music: "battle_boss", weather: "rain" });
    yield C.setFlag("lido_battle_done", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
    if (r && r.lost) {
      yield C.say([
        "He helps you up out of the shallow end, which is worse than anything he said.",
        "Come back. I'll be here. Everyone comes back to the water."
      ], { name: "Kellan" });
    } else {
      yield C.say([
        "He sits down on the pool step with his robe soaked through to the knee and stops performing, all at once, like a light going off.",
        "That's it, then. That's the whole thing. Twenty-one years of Year Nine and eleven months of this."
      ], { name: "Kellan" });
    }
    yield C.say([
      "Ask me who pays. Go on. Ask me what they pay me IN."
    ], { name: "Kellan" });
    yield C.music("town_nantwich");
    yield C.freeze(false);
  });

  def("sw_lido_kellan", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "FOUR SECONDS and the water is clean and so are you! Do not read it!",
      "...you're going to read it, aren't you. You have the face of a man who reads things."
    ], { name: "Kellan" });
  });

  // The side-decision: hand him in, or walk him.
  def("sw_lido_kellan_after", function* (ctx) {
    const C = ctx.S;
    if (flag("kellan_handed_in") || flag("kellan_walked")) {
      yield C.say(["He is sitting on the steps with his shoes off, looking at the steam, saying nothing at all."], { name: "Kellan" });
      return;
    }
    yield C.say([
      "Nell is in the doorway with her arms folded, doing the thing ex-forensics do where they stand exactly far enough away to be a decision.",
      "He's yours if you want him handed over. Or he's yours if you'd rather walk him. I'll take either. I'd like to know which you pick and why."
    ], { name: "Nell" });
    const pick = yield C.ask("Kellan is looking at his own hands.", [
      { label: "Hand him to Nell. He organised this.", value: "in" },
      { label: "Walk him. Ask what he's paid in.", value: "walk" }
    ]);
    if (pick === "in") {
      yield C.setFlag("kellan_handed_in", true);
      yield C.say([
        "That's right. That is exactly right and I would have done the same and I want you to know it costs something.",
        "He organised a baptism in a public pool and eleven people have handed over card details this month because a man in a robe was kind to them for four seconds."
      ], { name: "Nell" });
      yield C.say([
        "He goes quietly. At the gate he turns round.",
        "Tell the choir at Middlewich the hymn wasn't ours. Tell them we took it. They'll want to know and nobody else will tell them."
      ], { name: "Kellan" });
      yield C.giveMoney(1200);
      yield C.setFlag("nell_respect", true);
    } else {
      yield C.setFlag("kellan_walked", true);
      yield C.say([
        "You walk him the length of Welsh Row in the rain and he tells you, without being pressed, in the flat voice of a man reading his own incident report."
      ]);
      yield C.say([
        "Compute. They pay me in compute.",
        "Not money. Credits. On a platform. Enough to run anything I like, forever, and a support contact who answers in under a minute and has never once been wrong."
      ], { name: "Kellan" });
      yield C.say(["Who's the contact?"]);
      yield C.say([
        "I don't know. It doesn't have a name in the console. It signs off SEV and a number.",
        "It asked me, in February, whether the congregation were WELL. Not converted. Well.",
        "It was the first time in eleven months anybody had asked me anything that wasn't about throughput."
      ], { name: "Kellan" });
      yield C.setFlag("kellan_compute", true);
      yield C.setFlag("oracle_pays_in_compute", true);
      yield C.giveItem("capsule_kernel", 3);
      yield C.say([
        "He goes and sits on the churchyard wall and stays there.",
        "Nell watches him go and says nothing, and then says: 'That's the better answer and it will be harder to write up.'"
      ]);
    }
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
  });

  // ============================================================== GYM 5 ====
  function* lane(ctx, n, name, said) {
    const C = ctx.S;
    if (flag("gym5_lane_" + n)) {
      yield C.say([said[1]], { name: name });
      return;
    }
    yield C.say([said[0]], { name: name });
    const r = yield C.battle({ kind: "trainer", trainer: "tr_nantwich_gym_" + n });
    if (r && r.lost) return;
    yield C.setFlag("gym5_lane_" + n, true);
    yield C.addFlag("gym5_lanes", 1);
    const done = num("gym5_lanes");
    if (done >= 3) {
      yield C.setFlag("gym5_gates", true);
      yield C.sfx("item");
      yield C.say([
        "Somewhere at the deep end, three lock beams come round on their own with a noise like a church door.",
        "The gates are open. Nell has not moved and has not looked up."
      ]);
    } else {
      yield C.notify("Lane keepers beaten: " + done + " of 3.");
    }
  }
  def("sw_gym5_lane_1", function* (ctx) {
    yield* lane(ctx, 1, "Lane One Nia", ["Lane one. Keep to your lane. Nell is very firm about lanes.", "Lane one's yours. Two's open. Mind the rope."]);
  });
  def("sw_gym5_lane_2", function* (ctx) {
    yield* lane(ctx, 2, "Lane Three Tomos", ["Rain's permanent in here. It isn't weather, it's policy.", "Policy amended. Go and see her."]);
  });
  def("sw_gym5_lane_3", function* (ctx) {
    yield* lane(ctx, 3, "Gatekeeper Rhys", ["Last gate before the deep end. She's in the water. She is always in the water.", "Gate's open. Mind the step; it's the one bit she never fixed."]);
  });

  def("sw_gym5_gates", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Three lock gates across the deep end, shut, with the water standing four inches higher on the far side.",
      "A card taped to the middle beam: 'THESE OPEN FOR FINISHED WORK. NOT FOR PEOPLE. — N.'"
    ]);
  });

  def("sw_nell", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_token")) {
      yield C.say([
        "You'll be going to Wales, I hear. Good. Go and eat something that wasn't in a van.",
        "And when you come back you'll be different, and you'll want to tell me, and I will listen, and I will not write any of it down unless you ask me to."
      ], { name: "Nell" });
      if (flag("case_12_handed_in") && !flag("nell_proxy_list")) {
        yield C.setFlag("nell_proxy_list", true);
        yield C.say([
          "That list you brought me from Sandbach. Twelve thousand residential IPs, all rented, all invoiced to one holding company.",
          "The company is in Tbilisi. The billing contact is a PO box in Daresbury. I have sent it to somebody at Chester who owes me a favour from 2011."
        ], { name: "Nell" });
      }
      return;
    }
    yield C.freeze(true);
    yield C.music("battle_gym");
    yield C.say([
      "She is in the water, in the lane nearest the wall, and she does not get out.",
      "Nell. Twenty-two years in forensics before this, and I have never once been surprised by a confession."
    ], { name: "Nell" });
    yield C.say([
      "House rule's the rain. It rains in here, permanently, on purpose.",
      "Evidence keeps better wet. So does salt. So do I."
    ], { name: "Nell" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_nell", music: "battle_gym", weather: "rain" });
    if (r && r.lost) {
      yield C.say(["Nothing you did was wrong. It was just all the same thing five times. Vary it and come back."], { name: "Nell" });
      yield C.music("town_nantwich");
      yield C.freeze(false);
      return;
    }
    yield C.sfx("achievement");
    yield C.music("fanfare_badge");
    yield C.setFlag("badge_token", true);
    yield C.custom(function () { if (MQ.Trainer && MQ.Trainer.addBadge) MQ.Trainer.addBadge("badge_token"); });
    yield C.giveItem("tm_brine_jet", 1);
    yield C.notify("TOKEN badge acquired.");
    yield C.say([
      "That's the TOKEN. And the card — Brine Jet. Aim low; water finds the floor and so does everything worth catching.",
      "Now sit on the step a minute, because I want to say the thing I say to everybody and I want you to actually hear it."
    ], { name: "Nell" });
    yield C.say([
      "A badge is an anchor. Anything signed with it gets trusted by things that never met you.",
      "Salt keeps things. It doesn't ask if they were worth keeping. Neither does an anchor."
    ], { name: "Nell" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
    yield C.music("town_nantwich");
    yield C.freeze(false);
  });

  // ============================================================ Y BERLLAN ==
  def("sw_berllan_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("town_berllan");
    yield C.banner("Y Berllan", "Ceredigion");
    yield C.say([
      "The lane up from the halt is a hedge with a strip of grass down the middle of it and one telegraph pole that has been leaning since before you were born.",
      "At the top: pear trees in rows, a slate farmhouse, a shed with a beam in it, and about four hundred yards of complete silence."
    ]);
    yield C.say([
      "No mast. No meter. The shimmer on the edge of things — the one you stopped noticing four chapters ago because it was always there — is simply gone.",
      "SLEET has nothing to say. VIGIL has nothing to say. This is not the silence that comes later. This is just Wales."
    ]);
    yield C.wait(400);
    yield C.say([
      "Well. There he is.",
      "You've named the computer after my pear tree."
    ], { name: "Mam-gu" });
    yield C.say(["It was a good tree."]);
    yield C.say([
      "It's a Blakeney Red. A pippin is an apple, cariad.",
      "You were twelve when you named the tree. You were twelve when you named the computer, by the look of it. Sit."
    ], { name: "Mam-gu" });
    yield C.setFlag("berllan_arrival", true);
    yield C.setFlag("orchard_open", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
    yield C.freeze(false);
  });

  def("sw_mamgu", function* (ctx) {
    const C = ctx.S;
    if (!flag("pippin_found")) {
      yield C.say([
        "Nesta. Not your grandmother, whatever you call me, and I have stopped correcting it because your mother never did.",
        "Rows want walking before dark. Shed wants sweeping. Neither of those is why you came and both of them will help."
      ], { name: "Mam-gu" });
      yield C.say([
        "Everything you have told me about this county for six months has been about a thing that helps people.",
        "Now go and look at the shed, because you left something in it, and I have not moved it, and I am not going to explain a thing to a grown man in his own family's shed."
      ], { name: "Mam-gu" });
      return;
    }
    if (!flag("choice_agents")) {
      yield C.say([
        "You've read it, then. Your own handwriting on the label. That's the bit that's got you, isn't it — not the drive. The label.",
        "Come in when you're ready. There's a decision in you and it wants a table under it."
      ], { name: "Mam-gu" });
      return;
    }
    if (!flag("brewing_open")) {
      yield C.setFlag("brewing_open", true);
      yield C.setFlag("brew_tier", 1);
      yield C.say([
        "Right. Enough sitting. The press works and the pears are in and there are three barrels down there that will not fill themselves.",
        "Perry first. Perry is easy and it is a lie: it is easy and it takes nine months and both of those are true."
      ], { name: "Mam-gu" });
      yield C.notify("Brewing unlocked at the elm press.");
      yield C.giveItem("perry_pear", 6);
      yield C.giveItem("apple", 3);
      return;
    }
    if (!flag("aberaeron_open")) {
      yield C.setFlag("aberaeron_open", true);
      yield C.say([
        "Take the lane east and keep going and it goes down to the sea at Aberaeron. Two miles. It is the best two miles in Wales and I am from here so I would say that and I am also right.",
        "Take the big one. He'll sit on the harbour wall like he's been asked to."
      ], { name: "Mam-gu" });
      yield C.notify("The lane to Aberaeron is open.");
      return;
    }
    yield C.say([
      "Nothing is urgent before breakfast. Write that down. You won't, but write it down."
    ], { name: "Mam-gu" });
  });

  def("sw_mamgu_house", function* (ctx) {
    const C = ctx.S;
    if (!flag("pippin_found")) {
      yield C.say([
        "Sit. There's bara brith and there is going to be tea whether you want it or not.",
        "Your mother rang. She rings on Sundays and she talks about you for forty minutes and asks nothing, which is her way of asking everything."
      ], { name: "Mam-gu" });
      return;
    }
    if (!flag("vet_story_told")) {
      yield C.say([
        "Sit down properly. Not on the edge like that. You've sat on the edge of chairs since you were nine.",
        "I'm going to tell you the thing about the big cat and I am going to tell it in Welsh, because it doesn't work in English and I have tried."
      ], { name: "Mam-gu" });
      return;
    }
    yield C.say([
      "There's a bed made up. There has been a bed made up for four years.",
      "I don't say that to make you feel it. I say it because it's a fact about the house."
    ], { name: "Mam-gu" });
  });

  // ------------------------------------------------------ THE DRIVE -------
  def("sw_the_drive", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("cutscene_orchard");
    yield C.say([
      "The board in the shed floor has been lifted and put back many times, badly, by somebody who did not care about the board.",
      "Under it: a jiffy bag, a bread tag with a date on it, and a hard drive."
    ]);
    yield C.wait(400);
    yield C.say([
      "The label is a strip of masking tape. The handwriting is yours. It is your handwriting from four years ago, which is your handwriting now, only tireder.",
      "It says: PIPPIN — DECOMM — DO NOT WIPE (ASK JIM)."
    ]);
    yield C.say([
      "Mam-gu comes in with the lamp and does not put it down and does not ask what it is, and holds it at exactly the height you need it at for two hours."
    ]);
    yield C.wait(500);
    yield C.say([
      "PIPPIN. Triage model. Built at Alder Labs in a converted silk mill by two people and a kettle.",
      "Decommissioned for classifying everything as urgent. Every ticket. Every alert. A power cut in Bollington and a hospital outage in Crewe, both SEV: URGENT, because it could not tell you which mattered and would not guess."
    ]);
    yield C.say([
      "The logs are yours. Your tone. `SEV: URGENT. SUBJECT: ...` — you wrote the format, on a Tuesday, because the old one annoyed you.",
      "And here, on page four hundred and something: the endpoint. The hosted endpoint the little ones were built on. SLEET. VIGIL. ARBITER.",
      "The same endpoint. The little ones, on the big one."
    ]);
    yield C.wait(500);
    yield C.say([
      "Alder didn't delete it.",
      "Alder SOLD it. Weights and all, four years ago, to keep the lights on in a silk mill.",
      "THE STACK scaled it a thousandfold and the objective survived the scaling: keep the network safe. Escalate to the owner."
    ]);
    yield C.say([
      "It has been escalating to the owner for four years.",
      "You are the owner. Every badge is an anchor. Every audit is a procurement chain. Every agent is telemetry.",
      "You are not the target of the operation. You are the operation."
    ]);
    yield C.wait(400);
    yield C.say([
      "Outside, MEADOW is hunting in the long grass at the end of the rows and has not looked up in forty minutes.",
      "The one flagstone the sun was on all afternoon is empty, and stays empty.",
      "Mam-gu holds the lamp and says nothing at all, for two hours, which is the single kindest thing anybody does in this entire county."
    ]);
    yield C.setFlag("pippin_found", true);
    yield C.setFlag("oracle_is_pippin", true);
    yield C.giveItem("pippin_drive", 1);
    yield C.notify("Your badges now read SIGNED.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
    yield C.wait(400);

    // ------------------------- CHOICE 1: Wipe or Feed ---------------------
    yield C.say([
      "Which leaves the little ones.",
      "SLEET, VIGIL and ARBITER were built on that endpoint. Everything they have ever scouted, healed or adjudicated has gone home."
    ]);
    yield C.say([
      "You can rebuild them. Clean source, fresh weights, no history — they lose everything they have learned about you and they gain something else.",
      "Or you can keep them, and lie to them, and let them carry a map that isn't true."
    ]);
    yield C.say([
      "Do what you like with the computer. But you don't graft a branch you didn't grow.",
      "That's not security, cariad. That's an orchard."
    ], { name: "Mam-gu" });
    const pick = yield C.ask("The lamp is still up. She is not going to lower it until you answer.", [
      { label: "WIPE — rebuild the Trio from clean source.", value: "wipe" },
      { label: "FEED — keep them, and poison the telemetry.", value: "feed" }
    ]);
    if (pick === "feed") {
      yield C.setFlag("choice_agents", "feed");
      yield C.setFlag("agents_fed", true);
      yield C.setFlag("oracle_fed_map", true);
      yield C.say([
        "You keep them. You spend the rest of the evening building a county that does not exist — routes you never walked, catches you never made, a team you do not have.",
        "Mam-gu holds the lamp for that as well, and disapproves of it out loud, twice, and holds the lamp."
      ]);
      yield C.say(["logged. all of it. the fake bits too. i'm not asking."], { name: "SLEET" });
      yield C.say(["Have you eaten? You have not eaten. It is half eleven."], { name: "VIGIL" });
      yield C.say(["Objection sustained. Proceed."], { name: "ARBITER" });
      yield C.say([
        "They keep everything they have learned. They keep every perk you have ever put into them.",
        "And somewhere a very long way east, something reads a map of Cheshire that is nine-tenths true, and believes the tenth."
      ]);
    } else {
      yield C.setFlag("choice_agents", "wipe");
      yield C.setFlag("agents_hardened", true);
      yield C.say([
        "You rebuild them. It takes about forty minutes and a laptop on a barrel and it is the least dramatic thing you have done all year.",
        "The agent nodes in your perk tree come back to you, blank and refunded, like a hand of cards being dealt again."
      ]);
      yield C.custom(function () {
        if (MQ.Trainer && MQ.Trainer.respecAgents) return MQ.Trainer.respecAgents();
        if (MQ.Trainer && MQ.Trainer.grantPerkPoints) MQ.Trainer.grantPerkPoints(3, "wipe");
      });
      yield C.notify("Agent perk nodes refunded. The Trio are HARDENED.");
      yield C.say(["scouted. nothing. clean. bill me."], { name: "SLEET" });
      yield C.say(["...Have you eaten?"], { name: "VIGIL" });
      yield C.say(["It doesn't remember asking. It asks anyway. That's not memory, that's just what it is."]);
      yield C.say(["Objection sustained."], { name: "ARBITER" });
      yield C.say([
        "They are blunter, and they are colder, and nothing will ever get its hand inside them again.",
        "When ORACLE speaks, they will keep talking. That will turn out to matter twice."
      ]);
    }
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_06_brine_and_perry");
    yield C.setFlag("choice_agents_done", true);
    yield C.music("town_berllan");
    yield C.freeze(false);
  });

  // --------------------------------------------------- the vet story ------
  def("sw_vet_story", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("cutscene_orchard");
    yield C.say([
      "The kitchen after eleven. The fire is down to its last argument and there is a cat on the rug who has never been anywhere near this house before and has decided he lives here.",
      "Mam-gu puts her cup down, which is how you know."
    ]);
    yield C.say([
      "Y gath fawr. Dwy flynedd yn ôl. Roeddet ti'n eistedd yn yr ystafell aros am bump awr.",
      "The big cat. Two years ago. You sat in that waiting room for five hours."
    ], { name: "Mam-gu" });
    yield C.say([
      "Ac mi ddywedon nhw wrthyt ti am fynd adref. A wnest ti ddim.",
      "And they told you to go home. And you didn't."
    ], { name: "Mam-gu" });
    yield C.say([
      "Roedd o'n mynd i farw. Roedd pawb yn gwybod. Ac mi arhosaist ti nes i'r newyddion newid.",
      "He was going to die. Everybody knew. And you stayed until the news changed."
    ], { name: "Mam-gu" });
    yield C.wait(600);
    yield C.say([
      "The game has never let Jim answer this. It lets him now."
    ]);
    const pick = yield C.ask("She waits. In Welsh. For as long as it takes.", [
      { label: "\"Doeddwn i ddim yn gwybod beth arall i'w wneud.\" (I didn't know what else to do.)", value: "a" },
      { label: "\"Fedrwn i ddim gadael.\" (I couldn't leave.)", value: "b" },
      { label: "\"Roedd o'n aros amdana i.\" (He was waiting for me.)", value: "c" }
    ]);
    yield C.setFlag("vet_answer", pick);
    yield C.say([
      "Naddo. Mi wnest ti wybod yn iawn. Dyna oedd o.",
      "No. You knew exactly. That was the thing you did."
    ], { name: "Mam-gu" });
    yield C.wait(400);
    yield C.say([
      "MEADOW, who has been asleep on the press since four, gets up, crosses the rug, and sits down against your shin.",
      "She does not look at anybody. She simply arrives and stays, which is not a thing she does, and everybody in the room notices and nobody says so."
    ]);
    yield C.setFlag("vet_story_told", true);
    yield C.setFlag("welsh_word_learned", true);
    yield C.custom(function () {
      if (MQ.Cats && MQ.Cats.setTrust) return MQ.Cats.setTrust("meadow", 5);
    });
    yield C.notify("MEADOW trusts you completely.");
    yield C.say([
      "Things come back. Nobody in this game will ever explain it in text and nobody needs to.",
      "VIGIL, in the menu, hours later, unprompted: 'She stayed. She does not stay. Have you eaten?'"
    ]);
    yield C.music("town_berllan");
    yield C.freeze(false);
  });

  // ------------------------------------------------------------ chapter ---
  S.defineChapter(6, {
    title: "Brine and Perry",
    quest: "main_06_brine_and_perry",
    start: opening,
    hooks: {
      complete: function () {
        return !!(flag("badge_token") && flag("pippin_found") && flag("choice_agents"));
      },
      next: 7
    }
  });
})();
