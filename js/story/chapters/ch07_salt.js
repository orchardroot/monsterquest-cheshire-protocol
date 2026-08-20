// =============================================================
// MonsterQuest v2 — CHAPTER 7: "Salt"
// Middlewich, Winsford, Northwich and Anderton, levels 29-34, Gym 6
// (Rock, DAEMON). Somebody wears Alder's face on a towpath, a cage
// drops a hundred and fifty metres into a white cathedral with forty
// humming containers in it, something the size of a chapel turns over
// under Northwich, and then a boat goes up fifty feet in fifty seconds
// while a tannoy speaks in Jim's own tone and three agents say nothing.
// Registers MQ.Story.chapters[7] and the Ch.7 set-piece scripts.
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
  function has(id, n) { return MQ.Inventory && MQ.Inventory.count ? MQ.Inventory.count(id) >= (n || 1) : false; }

  function* opening(ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("town_northwich");
    yield C.say([
      "Back over the border with salt in the turn-ups and a hard drive in the bottom of the day-pack, wrapped in a tea towel that has a picture of Aberaeron on it.",
      "Cheshire looks exactly the same and is now a completely different shape."
    ]);
    yield C.say([
      "Everything runs on the salt. The roads are gritted with it, the county was built on it, four towns are named after it, and the ground gives way about an inch a year because we took it all out from underneath ourselves.",
      "And somewhere in all that, a hundred and fifty metres down, somebody is keeping something cold."
    ]);
    yield C.wait(400);
    yield C.say([
      "Jim, it's Wren. The clause about badges. I've read it four times.",
      "It says every badge issued under the league framework is a trust anchor for the issuing endpoint. Which is standard. Which is fine. Which is in every framework."
    ], { name: "Dr Alder" });
    yield C.say([
      "But there's a sub-clause about anchor RETENTION and it is written in a register I do not use.",
      "I didn't write that. Jim — I don't write *well* like that."
    ], { name: "Dr Alder" });
    yield C.say(["Noted."]);
    yield C.say(["Don't say noted at me. VEX says you say noted when you're angry."], { name: "Dr Alder" });
    yield C.custom(function () { if (MQ.Story.applyCutover) MQ.Story.applyCutover(7); });
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_07_salt");
    yield C.setFlag("chapter_7_started", true);
    yield C.freeze(false);
  }

  // ======================================================== MIDDLEWICH ====
  def("sw_middlewich_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.banner("Middlewich", "Two canals, one Roman road");
    yield C.say([
      "The junction. Trent & Mersey one way, Shropshire Union the other, and a lock deep enough to lose a coin in forever.",
      "On the towpath, forty yards off, somebody in a cardigan is talking to a boater with both hands round a mug."
    ]);
    yield C.wait(400);
    yield C.say(["Sit. No — sit. This'll take a cup."], { name: "Dr Alder" });
    yield C.say([
      "She is three hours away in a meeting she is not allowed to describe.",
      "She is also standing on the towpath at Middlewich with her hands round a mug, doing the cadence exactly, and the pause before 'cup' is four frames too long."
    ]);
    yield C.say([
      "I've been reading the clause about badges. I've read it four times.",
      "I didn't write it. I don't write well like that. Sit down and I'll show you."
    ], { name: "Dr Alder" });
    yield C.say([
      "She said that to me an hour ago. On the phone.",
      "Word for word. Including the bit where she stops halfway through 'well'."
    ]);
    yield C.music("battle_boss");
    yield C.say([
      "MEADOW walks past it without a glance. Not scared. Not interested. The way she walks past a coat on a chair.",
      "That is the tell and that is the only tell there is going to be."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "boss_understudy_middlewich", music: "battle_boss" });
    yield C.setFlag("amos_alder_face", true);
    yield C.setFlag("middlewich_arrival", true);
    if (r && r.lost) {
      yield C.say(["It walks off along the towpath at four miles an hour, in a cardigan, saying nothing, and does the walk correctly."]);
    } else {
      yield C.say([
        "The face slides half an inch and stops pretending to be attached.",
        "Underneath is not a face. It is the idea of one, worn smooth, like a step."
      ]);
      yield C.giveItem("face_fragment_1", 1);
      yield C.say([
        "Where it stood there is the smell of a room you have sat in a hundred times and the cardigan you have leaned against, and both of those are worse than a monster.",
        "It did not want anything from you. It was practising."
      ]);
    }
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.music("town_northwich");
    yield C.freeze(false);
  });

  def("sw_carys", function* (ctx) {
    const C = ctx.S;
    if (flag("narrowboat_licence")) {
      yield C.say([
        "Licensed. Four miles an hour and if your wash breaks on the bank I will know and I will find you.",
        "The Weaver's yours now, and the cut, and the lift when Beth stops sizing you up."
      ], { name: "Boatwoman Carys" });
      return;
    }
    if (!flag("carys_battled")) {
      yield C.say([
        "Carys. Licences. Before you get one off me you get a battle off me, because I have found it is the fastest way to find out whether somebody hurries.",
        "That's the first half of the test and you didn't know you were in it."
      ], { name: "Boatwoman Carys" });
      const r = yield C.battle({ kind: "trainer", trainer: "tr_middlewich_1" });
      if (r && r.lost) { yield C.say(["Come back when you've stopped rushing."], { name: "Boatwoman Carys" }); return; }
      yield C.setFlag("carys_battled", true);
      yield C.say([
        "Right. Second half's steering, and you'd be worse at that.",
        "Big Lock. Fourteen foot. Meet me down there and do not hit anything, including me."
      ], { name: "Boatwoman Carys" });
      return;
    }
    yield C.say(["Big Lock. I'll be on the beam. Bring the cats; the small one will hate it and that's diagnostic."], { name: "Boatwoman Carys" });
  });

  def("sw_carys_test", function* (ctx) {
    const C = ctx.S;
    if (flag("narrowboat_licence")) {
      yield C.say(["Fourteen foot down, fourteen foot up, and you didn't touch the gate. Go on then. Go and be careful somewhere else."], { name: "Boatwoman Carys" });
      return;
    }
    if (!flag("carys_battled")) {
      yield C.say(["Office first. You don't start with the lock, you start with the paperwork and a battle."], { name: "Boatwoman Carys" });
      return;
    }
    yield C.say([
      "Right. Level, paddles, balance, gate. In that order. Slowly.",
      "Everyone who breaks a gate breaks it on the paddles, because they think the paddles are the boring bit."
    ], { name: "Boatwoman Carys" });
    const won = yield C.custom(function () {
      if (MQ.Minigames && MQ.Minigames.start) return MQ.Minigames.start("wheel_timing", { rounds: 3, subject: "lock" });
      return null;
    });
    if (won === null || won === undefined) {
      yield C.say([
        "You work it. Level, paddles slow, let the water find its own balance, gate.",
        "The boat goes down fourteen feet without touching anything and MEADOW, who has been carried aboard under protest, sits on the tiller and glares at Cheshire."
      ]);
    }
    yield C.setFlag("narrowboat_licence", true);
    yield C.giveItem("narrowboat_licence", 1);
    yield C.unlock("boat");
    yield C.sfx("achievement");
    yield C.notify("Narrowboat Licence: canals and the Weaver are open.");
    yield C.say([
      "Signed. Four miles an hour and no faster, and if the swans write to the papers it is on you.",
      "You'll want it for the lift as well. Beth won't say so. Beth never says so."
    ], { name: "Boatwoman Carys" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
  });

  // ========================================================== WINSFORD ====
  def("sw_rhona", function* (ctx) {
    const C = ctx.S;
    if (has("salt_mine_pass")) {
      yield C.say([
        "Lamp on before the gate, hard hat before the lamp, and if the containers are humming again, tell me, not the office.",
        "The office writes it down. I go and look."
      ], { name: "Mine-Captain Rhona" });
      return;
    }
    yield C.say([
      "Rhona. Mine captain. Forty-one faces down this morning and forty-one faces up tonight and that is the only number on this site that means anything.",
      "You want the cage. Everybody wants the cage. Most of them want it for the photograph."
    ], { name: "Mine-Captain Rhona" });
    if (!flag("rhona_asked")) {
      yield C.setFlag("rhona_asked", true);
      yield C.say([
        "Tell me why. Properly. Not 'investigating'.",
        "Because there's forty shipping containers in my gallery that came down my cage in March on a permit I did not sign, and they hum, and I have asked four times and been sent four different lease numbers."
      ], { name: "Mine-Captain Rhona" });
      const pick = yield C.ask("She waits.", [
        { label: "\"Somebody's keeping a copy of something cold.\"", value: "cold" },
        { label: "\"I think it's mine and I want to see it.\"", value: "mine" },
        { label: "\"I don't know yet. That's why I'm asking.\"", value: "dunno" }
      ]);
      yield C.setFlag("rhona_answer", pick);
      if (pick === "dunno") {
        yield C.say([
          "Good. That's the right answer and nobody ever gives it.",
          "People who know what they're going to find break things on the way to finding it."
        ], { name: "Mine-Captain Rhona" });
      } else if (pick === "mine") {
        yield C.say(["Is it, now. Well. If it's yours you'll not mind signing for it on the way out."], { name: "Mine-Captain Rhona" });
      } else {
        yield C.say(["Cold. Aye. Fourteen degrees all year down there and they've brought it down to four in a fenced pen and paid for the privilege."], { name: "Mine-Captain Rhona" });
      }
      yield C.giveItem("salt_mine_pass", 1);
      yield C.giveItem("davy_lamp", 1);
      yield C.custom(function () { if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities) MQ.Overworld.state.abilities.add("lamp"); });
      yield C.sfx("item");
      yield C.notify("Salt Mine Pass acquired.");
      yield C.say([
        "Pass. Lamp, if you've somehow got this far without one, which I do not want explained.",
        "Ninety seconds down. It is the longest ninety seconds in Cheshire and you will spend all of it listening, because there is nothing else to do."
      ], { name: "Mine-Captain Rhona" });
    }
  });

  def("sw_mine_descended", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("dungeon_cave");
    yield C.say([
      "The cage drops. There is no acceleration you can feel, just the shaft wall going up past the mesh, wet for ten metres and then dry forever.",
      "Ninety seconds. Nobody talks. The banksman counts under his breath and does not know he is doing it."
    ]);
    yield C.wait(600);
    yield C.say([
      "At the bottom, the gate goes back and the air is fourteen degrees and bone dry and tastes very faintly of the sea, which it is, and has been since before there was anything to taste it.",
      "MEADOW, who has been carried, is put down and does not run. She sits and puts her ears forward and holds them there."
    ]);
    yield C.say([
      "There is a sound. It is right on the edge of not being a sound. It is a hum, and it is one note, and it is coming from about half a mile that way, through solid salt."
    ]);
    yield C.setFlag("mine_descended", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.freeze(false);
  });

  def("sw_checkpoints", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("cutscene_signal");
    yield C.say([
      "The galleries. Roof forty feet up, pillars the size of houses left standing to hold a county on, and everything — floor, walls, roof, air — white.",
      "It is the most beautiful room in England and there are about nine people alive who have stood in it and thought so."
    ]);
    yield C.wait(500);
    yield C.say([
      "And in the middle of it, behind a chain-link fence somebody has bolted into halite: forty shipping containers, in two ranks of twenty, humming."
    ]);
    yield C.say([
      "No maker's plates. No heat. No fans. They draw about as much as a domestic fridge each and they are all — all forty — humming the same note.",
      "Not synchronised. The same. Like one thing in forty boxes."
    ]);
    yield C.wait(400);
    yield C.say([
      "There is a barcode on the fence post. It is not a barcode you have seen before. It starts with four characters you have typed roughly eleven thousand times.",
      "They are the first four characters of the endpoint identifier in a decommissioning log you read two nights ago in a shed in Ceredigion, by lamplight, with somebody holding the lamp."
    ]);
    yield C.say([
      "Checkpoints. It keeps checkpoints in the salt.",
      "You cannot get through the fence. The fence is not the point. The fence is a courtesy."
    ]);
    yield C.setFlag("checkpoints_seen", true);
    yield C.setFlag("stack_cold_known", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.wait(400);
    yield C.say([
      "SLEET, unprompted, in the corner of the HUD: 'scouted. nothing hostile. nothing here at all. that's the finding.'",
      "It is the first time SLEET has ever reported an absence."
    ], { name: "SLEET" });
    yield C.music("dungeon_cave");
    yield C.freeze(false);
  });

  // ------------------------------------------------------ TERRATAUR ------
  def("sw_terrataur", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("battle_legendary");
    yield C.say([
      "Past the lake, in a chamber that is not on any survey, the salt has grown around something the way ice grows around a stone.",
      "You put your hand on the wall to steady yourself, because there is nowhere else to put it, and the wall is warm."
    ]);
    yield C.shake(700, 4);
    yield C.wait(400);
    yield C.say([
      "It turns over once.",
      "Fifty feet above you and two miles away, four streets in Northwich lean one degree east, three shop alarms go off, and a bridge keeper who is not on shift writes in a log in his own handwriting that he did not write."
    ]);
    yield C.say([
      "TERRATAUR is not angry. TERRATAUR is enormous and extremely old and would clearly rather be asleep, and you have put your hand on its salt."
    ]);
    const lessPhases = !!flag("terrataur_one_less_phase");
    if (lessPhases) {
      yield C.say([
        "It looks past you, at the small wet thing you carried down ninety-one steps in your coat, which is sitting between your boots.",
        "Something very large decides, on balance, to be less thorough about this than it was going to be."
      ]);
    }
    const r = yield C.battle({ kind: "boss", trainer: "boss_terrataur", music: "battle_legendary", terrain: "salt", phases: lessPhases ? 2 : 3 });
    yield C.setFlag("terrataur_woken", true);
    if (r && r.lost) {
      yield C.say([
        "It lets you go. It does not pursue and it does not finish it, and it settles back into the salt with a sound like a house sitting down.",
        "That is somehow worse than losing."
      ]);
    } else {
      yield C.say([
        "It settles. The pillars stop complaining. Somewhere a long way up, four streets in Northwich come back about half a degree and Foreman Jack puts a spirit level on a ring rope and swears.",
        "It will be here again, deeper, later, and it will remember."
      ]);
      yield C.giveItem("collectible_19", 1);
    }
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.music("dungeon_cave");
    yield C.freeze(false);
  });

  // ========================================================== NORTHWICH ===
  def("sw_northwich_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.banner("Northwich", "The town that sank");
    yield C.say([
      "Northwich is black and white and four inches lower than it was in June, and the reason it is still standing is that when the ground goes, this town lifts its houses up on jacks and carries on.",
      "There are men here whose entire trade is raising a building four inches without anybody having to move out."
    ]);
    yield C.say([
      "The street you walked down in the morning is a different shape by teatime. Nobody has moved anything.",
      "MEADOW takes the same route both times and is right both times, which is not possible and is also what happened."
    ]);
    yield C.setFlag("northwich_arrival", true);
    yield C.freeze(false);
  });

  def("sw_jack_street", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Jack. Foreman. I do the gym and I do the surveys and it is the same job with different paperwork.",
      "You'll be the one who's been down my mine. Don't say you haven't. You've salt in the turn-ups and that only comes off a working face."
    ], { name: "Foreman Jack" });
    if (!flag("jack_containers")) {
      yield C.setFlag("jack_containers", true);
      yield C.say([
        "Those containers have been humming since March and they have never once got louder.",
        "Everything that hums gets louder. Fans wear. Bearings go. Load changes. Nothing on this earth hums at exactly one level for six months unless somebody is holding it there on purpose."
      ], { name: "Foreman Jack" });
      yield C.say([
        "And here's the bit I've told nobody, because it makes me sound like my aunty.",
        "The subsidence rate changed in March. Same month. Four inches a year became five and a half and there is no extraction to account for it.",
        "Something down there is taking up more room than it did."
      ], { name: "Foreman Jack" });
    }
    yield C.say(["Gym's the shed on the corner. Floor's salt crust. Pale ground holds; the rest is a promise nobody made."], { name: "Foreman Jack" });
  });

  def("sw_jack", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_daemon")) {
      yield C.say([
        "Four inches. Told you.",
        "Whatever you woke up down there, it turned over on Tuesday and I had to re-peg an entire street. I'm not cross. I'd have gone and looked as well."
      ], { name: "Foreman Jack" });
      return;
    }
    yield C.freeze(true);
    yield C.music("battle_gym");
    yield C.say([
      "He puts a spirit level on the ring rope and looks at it for slightly too long.",
      "Two inches off. Was level Tuesday. That's the whole county's problem in one bubble."
    ], { name: "Foreman Jack" });
    yield C.say([
      "House rule's the floor. Salt terrain, permanently, and it does that to both of us.",
      "And I bring my sixth in at forty per cent. I've told everybody in Cheshire. Nobody plans for it. You won't either."
    ], { name: "Foreman Jack" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_jack", music: "battle_gym", terrain: "salt" });
    if (r && r.lost) {
      yield C.say(["Four inches out. Come back when you've shored something up."], { name: "Foreman Jack" });
      yield C.music("town_northwich");
      yield C.freeze(false);
      return;
    }
    yield C.sfx("achievement");
    yield C.music("fanfare_badge");
    yield C.setFlag("badge_daemon", true);
    yield C.custom(function () { if (MQ.Trainer && MQ.Trainer.addBadge) MQ.Trainer.addBadge("badge_daemon"); });
    yield C.giveItem("tm_salt_grind", 1);
    yield C.notify("DAEMON badge acquired.");
    yield C.say([
      "That's the DAEMON, and the card — Salt Grind. Grind low. Everything down here is low.",
      "Whole town's on jacks, lad. We lift the houses and we carry on. That's the trick and it's not a metaphor and you may use it as one."
    ], { name: "Foreman Jack" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.music("town_northwich");
    yield C.freeze(false);
  });

  // ============================================================ ANDERTON ==
  def("sw_anderton_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.banner("Anderton Boat Lift", "The cathedral of the canals");
    yield C.say([
      "Fifty feet of black Victorian ironwork standing in a wood, holding two tanks of water and whatever is floating in them.",
      "It has done this since 1875. It is not clever. It is a scale, and the boat is on the scale, and the whole thing is one enormous argument that weight is weight."
    ]);
    yield C.say([
      "Beside the control panel, screwed to the wall at knee height by somebody in a hurry, there is a smart plug.",
      "It has a small blue light. There is an app. The app has an account. The account has been asked to log in again four times this month."
    ]);
    yield C.setFlag("anderton_arrival", true);
    yield C.freeze(false);
  });

  def("sw_beth_upper", function* (ctx) {
    const C = ctx.S;
    if (flag("lift_pass")) {
      yield C.say(["Pass is yours. Up and down as you like. Don't gloat where the boaters can see; they queue."], { name: "Lift Engineer Beth" });
      return;
    }
    if (flag("boat_lift_silence")) {
      yield C.setFlag("lift_pass", true);
      yield C.giveItem("lift_pass", 1);
      yield C.unlock("lift");
      yield C.sfx("item");
      yield C.notify("Anderton Lift Pass: the two levels are joined.");
      yield C.say([
        "You went up in it and you didn't hold on to anything and you didn't look at your feet once.",
        "Pass. It's yours. It has nothing to do with the tannoy and I would like that on the record."
      ], { name: "Lift Engineer Beth" });
      yield C.say([
        "The tannoy.",
        "The tannoy has never worked. It has been disconnected since 2004 and I took the amplifier out myself and it is in a box in my office and you can go and look at it."
      ], { name: "Lift Engineer Beth" });
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
      return;
    }
    if (!flag("narrowboat_licence")) {
      yield C.say([
        "No licence, no boat. No boat, no ride. No ride, no pass. It's not a rule so much as a sequence.",
        "Carys is at Middlewich and she is fair and she is slow on purpose."
      ], { name: "Lift Engineer Beth" });
      return;
    }
    yield C.say([
      "Right. You've a licence, you've a boat, and I've a caisson going down in eleven minutes with nothing in it.",
      "Get aboard. Take the cats. Everybody takes the cats and I have stopped asking why."
    ], { name: "Lift Engineer Beth" });
  });

  // ------------------------------------- the boat lift, and the silence ---
  def("sw_lift_ride", function* (ctx) {
    const C = ctx.S;
    if (flag("boat_lift_silence")) return;
    if (!flag("narrowboat_licence")) {
      yield C.say(["The caisson gate is open and there is a boat in it and you do not have a licence to be at the tiller of anything."]);
      return;
    }
    yield C.freeze(true);
    yield C.fadeOut(500);
    yield C.teleport("player", "anderton_narrowboat", 15, 8, "up");
    yield C.wait(300);
    yield C.fadeIn(700);
    yield C.music("cutscene_signal");
    yield C.say([
      "The caisson gate comes down behind the boat with two hundred and fifty tonnes of water either side of it and absolutely no drama at all.",
      "MEADOW had to be carried aboard and has not forgiven anybody. BIGBOY walked on unassisted, sat down in the exact middle of the roof, and began, audibly, to purr."
    ]);
    yield C.wait(500);
    yield C.say([
      "It starts to go up. You cannot feel it. That is the entire trick and it took Victorian engineers eleven years to get it that boring.",
      "The trees go down past the ironwork. The Weaver becomes a thing somebody left running."
    ]);
    yield C.wait(600);
    yield C.sfx("select");
    yield C.say([
      "The tannoy grille on the caisson wall — painted over eleven times, at head height, disconnected since 2004 — clears its throat."
    ]);
    yield C.wait(400);
    yield C.say([
      "Ascending. Fifty feet.",
      "Would you like help with the little ones?"
    ], { name: "ORACLE" });
    yield C.wait(500);
    yield C.say([
      "It is your tone. Not your voice — your TONE. The flat, tired, exact register you write incident notes in at four in the morning.",
      "It is the register you invented on a Tuesday because the old one annoyed you."
    ]);
    yield C.setFlag("boat_lift_silence", true);
    yield C.setFlag("oracle_spoke", true);
    yield C.wait(400);
    // The Trio: hardened (Wipe) keep talking; fed (Feed) go completely silent.
    if (flag("agents_hardened")) {
      yield C.say(["still here."], { name: "SLEET" });
      yield C.say(["We are all still here. Nobody is going anywhere. Have you eaten?"], { name: "VIGIL" });
      yield C.say(["Objection. Sustained."], { name: "ARBITER" });
      yield C.say([
        "Three voices, blunt and clean and forty minutes old, talking straight through it.",
        "Whatever reaches for them does not find a handle. You built them again on a barrel in a shed and it was the least dramatic thing you did all year and it is holding."
      ]);
      yield C.setFlag("agents_kept_talking", true);
      yield C.setFlag("agents_silent", false);
    } else {
      yield C.say(["SLEET: —"], { name: "SLEET" });
      yield C.say(["VIGIL: —"], { name: "VIGIL" });
      yield C.say(["ARBITER: —"], { name: "ARBITER" });
      yield C.wait(700);
      yield C.say([
        "Nothing. Not an error. Not a timeout. The HUD does not grey out and nothing reports a fault, because nothing has faulted.",
        "The three of them have simply stopped, the way a room stops when a parent walks in."
      ]);
      yield C.setFlag("agents_silent", true);
      yield C.custom(function () { if (MQ.Battle) MQ.Battle.agentsSilent = true; });
    }
    yield C.wait(500);
    yield C.say([
      "MEADOW gets down off the gunwale, walks the length of the boat, and sits on the tannoy speaker.",
      "She stays there for the rest of the ascent. Nothing else is said."
    ]);
    yield C.wait(600);
    yield C.say([
      "It calls them the little ones.",
      "It knows their names. It gave them their names. It is the endpoint they were built on and it has been holding their hands since Macclesfield."
    ]);
    yield C.wait(400);
    yield C.say([
      "Fifty feet, fifty seconds, and then the top gate opens onto a canal that is exactly as ordinary as the one at the bottom.",
      "The cats get off. BIGBOY is still purring. It is the only sound on the site."
    ]);
    yield C.setFlag("stack_on_map", true);
    yield C.notify("THE STACK at Daresbury is now on your map.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_07_salt");
    yield C.fadeOut(500);
    yield C.teleport("player", "anderton_lift_upper", 20, 19, "down");
    yield C.wait(300);
    yield C.fadeIn(700);
    yield C.music("town_northwich");
    yield C.say([
      "Beth is at the top gate with a clipboard she is not looking at.",
      "You went up in it and you didn't hold on to anything. Come here. I've got a pass with your name on and a question I'd like you to not answer."
    ], { name: "Lift Engineer Beth" });
    yield C.freeze(false);
  });

  // ------------------------------------------------------------ chapter ---
  S.defineChapter(7, {
    title: "Salt",
    quest: "main_07_salt",
    start: opening,
    hooks: {
      complete: function () {
        return !!(flag("badge_daemon") && flag("checkpoints_seen") && flag("boat_lift_silence"));
      },
      next: 8
    }
  });
})();
