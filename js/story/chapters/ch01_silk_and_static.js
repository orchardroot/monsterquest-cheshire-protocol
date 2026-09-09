// =============================================================
// MonsterQuest v2 — CHAPTER 1: "Silk and Static"
// Macclesfield and Bollington, levels 3-8, no gym.
// The contract, the starter, VEX, the cats, and a hill that shows you
// the whole county turning to face the same direction at once.
// Registers: MQ.Story.chapters[1], the new-game intro, and the Ch.1
// NPC/trigger scripts. Owned by region-east.
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

  const STARTERS = S.STARTERS || [
    { id: "silkin", name: "SILKIN", types: "Bug/Grass" },
    { id: "brinewt", name: "BRINEWT", types: "Water" },
    { id: "kindlin", name: "KINDLIN", types: "Fire" }
  ];
  const COUNTER = S.COUNTER_PICK || { silkin: "kindlin", kindlin: "brinewt", brinewt: "silkin" };
  function starterName(id) {
    for (let i = 0; i < STARTERS.length; i++) if (STARTERS[i].id === id) return STARTERS[i].name;
    return String(id).toUpperCase();
  }

  // ------------------------------------------------------------ the intro --
  // Runs once, from MQ.Story.startNewGame() or the title's hand-off. Ends
  // with exactly one monster in the party and the player stood in the yard
  // outside Alder Labs, which is where Chapter 1 actually begins.
  function* intro(ctx) {
    const C = ctx.S;
    if (flag("contract_signed")) return;
    yield C.hideHud(true);
    yield C.freeze(true);
    yield C.fadeIn(600);
    yield C.music("town_macc");
    yield C.banner("Chapter 1 — Silk and Static", "Macclesfield · Bollington");
    yield C.wait(900);

    // ---- the flat -------------------------------------------------------
    yield C.say([
      "A weaver's cottage off Park Green. Two up, two down, a stair you never go up because the bulb went in 2019.",
      "On the table: a printed contract, a pen, and a mug ring exactly where the signature line is."
    ]);
    yield C.say([
      "You're up. Good. There's tea in the pot and it's the second pot, so don't make a face.",
      "Wren rang. Twice. She wants you there before ten and she said 'before ten' in the voice."
    ], { name: "Mum" });
    yield C.say([
      "She has read the contract. She has not said she has read the contract.",
      "The corner is folded over at clause nine, which is the clause about who owns what you find."
    ]);
    const askedMum = yield C.ask("Mum leans on the doorframe. 'Go on then. Ask me what I think.'", [
      { label: "\"What do you think?\"", value: "ask" },
      { label: "\"I'm going to be late.\"", value: "late" }
    ]);
    if (askedMum === "ask") {
      yield C.say([
        "I think you closed tickets for eleven years and came home tired and never once told me what any of it was for.",
        "And I think Wren Alder was the only person who ever made you sound interested.",
        "So go. Take the coat. And clause nine is a swizz and you know it."
      ], { name: "Mum" });
    } else {
      yield C.say([
        "You are always going to be late. It's a lifestyle.",
        "Take the coat."
      ], { name: "Mum" });
    }
    yield C.giveItem("alder_contract", 1);
    yield C.setFlag("contract_taken", true);

    // ---- the cats have already gone -------------------------------------
    yield C.say([
      "The cat flap is swinging.",
      "MEADOW's bowl is untouched, which has never happened in her life and is therefore alarming.",
      "The front door is open a hand's width. Somebody has leaned on it from the inside until it gave."
    ]);
    yield C.say([
      "They've been out since six. I've stopped fighting it.",
      "MEADOW knows where you're going. She's known since the phone rang."
    ], { name: "Mum" });

    // ---- Alder Labs ------------------------------------------------------
    yield C.fadeOut(600);
    yield C.teleport("player", "macclesfield_alder_labs", 10, 13, "up");
    yield C.wait(300);
    yield C.fadeIn(600);
    yield C.say([
      "ALDER LABS. A silk mill with the looms taken out and the racks put in, which everyone here thinks is a joke and nobody has explained.",
      "Three capsules on the bench under a lamp. On the middle one, arranged like a paperweight and radiating ownership: a small, very fast, extremely black cat."
    ]);
    yield C.say([
      "Jim. Sit. No — sit. This'll take a cup.",
      "You look exactly like you did in 2014 and I resent it."
    ], { name: "Dr Alder" });
    yield C.say([
      "Right. The contract. You go where I can't, you look at what the county's throwing off, and you tell me what you actually see.",
      "Not what the dashboard says. What you see. That's the whole job and it's why it's you."
    ], { name: "Dr Alder" });
    yield C.say([
      "There is somebody else in the room. Nineteen, maybe. Arms folded in the way of a person who has practised folding their arms.",
      "VEX. Best junior pentester in Cheshire. Bar's on the floor."
    ], { name: "VEX" });
    yield C.say([
      "The bar is MINE, VEX.",
      "Also that is my chair.",
      "It's a chair, root user. Chairs are shared infrastructure."
    ], { name: "VEX" });
    yield C.say([
      "Three lines, three capsules. One each, and I'm not doing a ceremony about it.",
      "Take the one you'd actually work with. Not the one that looks best on a card."
    ], { name: "Dr Alder" });

    const pick = yield C.ask("MEADOW is sitting on the middle capsule and has no intention of moving.", [
      { label: "SILKIN — the Silk Moth line (Bug/Grass)", value: "silkin" },
      { label: "BRINEWT — the Salt Newt line (Water)", value: "brinewt" },
      { label: "KINDLIN — the Mill Ember line (Fire)", value: "kindlin" }
    ]);
    const species = COUNTER[pick] ? pick : "silkin";
    const rival = COUNTER[species];
    yield C.say(["MEADOW gets off the capsule roughly one second before you reach for it, in a way that makes it look like her idea."]);
    yield C.giveMonster({ species: species, level: 5 });
    yield C.setFlag("starter_chosen", species);
    yield C.setFlag("contract_signed", true);
    yield C.say([
      "Then I'll take the one that beats it. Obviously.",
      "That's not strategy, VEX, that's a menu.",
      "It's a menu I ORDERED off, root user."
    ], { name: "VEX" });
    yield C.say([
      "VEX takes the " + starterName(rival) + " capsule off the bench.",
      "Dr Alder watches them do it and does not say anything at all, and the not-saying takes slightly too long."
    ]);
    yield C.setFlag("vex_starter", rival);
    yield C.say([
      "Off you go. Both of you. Out of my mill.",
      "Jim — the thing I want looked at is periodic. Every ninety seconds, from the south-west. I've had it looked at.",
      "She has not had it looked at. You have known her for eleven years and you can hear the difference."
    ], { name: "Dr Alder" });

    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_01_silk_and_static");
    yield C.setFlag("casebook_open", true);
    yield C.notify("CASEBOOK opened.");

    yield C.fadeOut(500);
    yield C.teleport("player", "macclesfield", 9, 33, "down");
    yield C.wait(300);
    yield C.fadeIn(600);
    yield C.freeze(false);
    yield C.hideHud(false);
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  }
  S.scripts.east_new_game_intro = intro;

  // ------------------------------------------------------------ the flat ---
  def("east_home_mum", function* (ctx) {
    const C = ctx.S;
    if (!flag("contract_signed")) {
      yield C.say(["Wren's expecting you. Park Green, the old mill, the one with the racks in it.", "Take the coat."], { name: "Mum" });
      return;
    }
    if (!flag("mum_after_labs")) {
      yield C.setFlag("mum_after_labs", true);
      yield C.say([
        "Well? Did she do the tea thing?",
        "She did the tea thing. She's done the tea thing since 2012. It means she's already decided and she's giving you time to catch up.",
        "Eat something. The cat has. Twice, if MEADOW is to be believed, which she is not."
      ], { name: "Mum" });
      yield C.giveItem("salve", 3);
      return;
    }
    yield C.heal();
    yield C.say(["Sit down, eat, and let me look at you. There. Off you go."], { name: "Mum" });
  });

  def("east_home_meadow", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "MEADOW is on the windowsill facing the glass, tail moving at the end only.",
      "She is not watching birds. There are no birds. She is watching the mast on the far ridge."
    ]);
  });

  // ------------------------------------------------------------- the labs --
  def("east_lab_alder", function* (ctx) {
    const C = ctx.S;
    if (!flag("contract_signed")) {
      yield C.say(["Sit. No — sit. This'll take a cup."], { name: "Dr Alder" });
      return;
    }
    if (!flag("alder_briefed")) {
      yield C.setFlag("alder_briefed", true);
      yield C.say([
        "The signal. Ninety seconds, give or take nothing at all, from the south-west.",
        "It isn't loud. It isn't hostile. It's PUNCTUAL, and punctual is the part I don't like.",
        "Weather doesn't do punctual. Machines do punctual. Machines and appointments."
      ], { name: "Dr Alder" });
      yield C.say([
        "Go up White Nancy. Bollington, up the canal, up the hill, half a morning.",
        "Best view in the county and you can see four masts from it. Watch what the wildlife does.",
        "...Why the wildlife, Wren?",
        "Because the wildlife hasn't got a dashboard, Jim."
      ], { name: "Dr Alder" });
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_01_silk_and_static");
      return;
    }
    if (flag("white_nancy_seen") && !flag("alder_denied")) {
      yield C.setFlag("alder_denied", true);
      yield C.say([
        "All of them. At once. Nine seconds. South-west.",
        "She puts the cup down. She puts it down on the ring on the desk, exactly, without looking.",
        "Right. Well. I've had it looked at.",
        "Wren.",
        "I've HAD it looked at, Jim."
      ], { name: "Dr Alder" });
      yield C.say([
        "That is not a lie. That is a sentence built very carefully so that it is not a lie.",
        "You have written sentences like that. You know exactly how much work goes into one."
      ]);
      yield C.setFlag("alder_suspicion", 1);
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_01_silk_and_static");
      return;
    }
    yield C.say(["There's tea. There is always tea. Take what you need off the bench."], { name: "Dr Alder" });
  });

  def("east_lab_vex", function* (ctx) {
    const C = ctx.S;
    if (!flag("contract_signed")) {
      yield C.say(["Don't touch the middle one. The cat's got opinions and I respect the cat."], { name: "VEX" });
      return;
    }
    yield C.say([
      "Right. Rules. You take the county east, I take it west, and we compare findings like professionals.",
      "That's not what you're going to do.",
      "That is EXACTLY what I'm going to do, root user, and then I'm going to win."
    ], { name: "VEX" });
    yield C.say([
      "MEADOW walks over and sits on VEX's foot.",
      "VEX looks down at her with an expression of undiluted betrayal and does not move the foot."
    ]);
  });

  // ------------------------------------------------------- street triggers --
  def("east_macc_first_step", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "Mill Street. Cobbles, a hill you have never once walked up without complaining, and the 108 Steps behind you.",
      "Somewhere over the roofs a mast hums a note that is not quite a note."
    ]);
    if (!flag("cats_joined")) {
      yield C.say([
        "MEADOW is sitting on the kerb.",
        "She is upright and alert and has clearly been here for some time, waiting, with the air of somebody who has had to wait.",
        "She was not let out. She is out."
      ]);
      yield C.say(["Right.", "Noted."]);
      yield C.custom(function () { if (MQ.Cats && MQ.Cats.unlock) MQ.Cats.unlock(); else MQ.Flags.set("cats_joined", true); });
      yield C.notify("MEADOW joined you.");
      yield C.say([
        "She cannot be boxed, she cannot be left, and she will sit down in the middle of a route and refuse to continue.",
        "You have known this for six years. You have never once won."
      ]);
    }
    yield C.setFlag("macc_first_step", true);
    yield C.freeze(false);
  });

  // -------------------------------------------------- VEX at the canal ------
  def("east_r1_vex", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("battle_rival");
    yield C.say([
      "Somebody is sat on the lock beam with their boots in the water, waiting, in the specific way of a person who has been waiting long enough to be annoyed about it."
    ]);
    yield C.say([
      "Four miles an hour, this cut. I have been doing four miles an hour behind you since Sutton bridge.",
      "You walk like a man closing tickets. One at a time. In order."
    ], { name: "VEX" });
    yield C.say([
      "That's how you close tickets.",
      "That's how you close tickets ELEVEN YEARS AGO, root user. Ship faster."
    ], { name: "VEX" });
    const r = yield C.battle({ kind: "trainer", trainer: "vex_1", music: "battle_rival" });
    yield C.setFlag("vex_battle_1", true);
    if (r && r.lost) {
      yield C.say([
        "Bar's on the floor and you're under it. Ship better.",
        "VEX offers you a hand up anyway, and is furious about having done it."
      ], { name: "VEX" });
    } else {
      yield C.say([
        "Fine. FINE. That's one build. Builds fail. That's the point of builds.",
        "Don't look at me like that. I'm iterating."
      ], { name: "VEX" });
    }
    yield C.say([
      "MEADOW crosses the towpath and sits down against VEX's shin.",
      "VEX freezes. VEX would like it on the record that they did not ask for this and they do not want it and they are not moving.",
      "...Call it off, root user.",
      "She makes her own decisions."
    ], { name: "VEX" });
    yield C.wait(400);
    yield C.say([
      "Anyway. Here. Alder set three of these up on the same endpoint and gave me two of them because she felt sorry for me, which is worse than nothing.",
      "Triage agent. It's blunt and it's rude and it's right."
    ], { name: "VEX" });
    yield C.setFlag("agent_sleet", true);
    yield C.notify("Agent SLEET is available in battle.");
    yield C.say(["foe: slow. now: slower. bill me."], { name: "SLEET" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_01_silk_and_static");
    yield C.music("route_east");
    yield C.freeze(false);
  });

  // --------------------------------------------------- White Nancy -----------
  def("east_white_nancy", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say(["The last hundred yards. MEADOW is already at the top, sitting on the folly like she built it."]);
    yield C.wait(400);
    yield C.say([
      "White Nancy: a sugar loaf of whitewashed stone with a door that goes nowhere, and the whole county underneath.",
      "Macclesfield in its bowl. The plain going west until it stops being anything. The dish at Jodrell, small and white and turning.",
      "It is, without argument, the best thing in Cheshire."
    ]);
    yield C.wait(400);
    yield C.sfx("select");
    yield C.say([
      "Then everything moves.",
      "Every wild thing on the hillside — the moths, the hares, the sheep, the small brown things in the heather — turns at once.",
      "Not towards you. Not towards anything on this hill.",
      "South-west. All of them. Holding it, like a room full of people listening to one person on the phone."
    ]);
    yield C.shake(600, 3);
    yield C.wait(700);
    yield C.say([
      "Nine seconds. Then the hare goes back to eating and the sheep go back to being sheep and it is a hill again.",
      "MEADOW has not turned. MEADOW is looking at you.",
      "Noted. Not concerned.",
      "Slightly concerned."
    ]);
    yield C.setFlag("white_nancy_seen", true);
    yield C.setFlag("signal_periodic", true);
    yield C.giveItem("viewpoint_bollington", 1);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_01_silk_and_static");
    yield C.freeze(false);
  });

  // ------------------------------------------------------------- chapter ---
  S.defineChapter(1, {
    title: "Silk and Static",
    quest: "main_01_silk_and_static",
    start: intro,
    hooks: {
      // Ch.1 is complete once you have seen the hill, beaten VEX and been
      // told, carefully, that it has been looked at.
      complete: function () {
        return !!(flag("white_nancy_seen") && flag("vex_battle_1") && flag("alder_denied"));
      },
      next: 2
    }
  });
})();
