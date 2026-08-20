// =============================================================
// MonsterQuest v2 — CHAPTER 5: "Puppets on the Line"
// Sandbach and Crewe. Levels 21-26, Gym 4 KERNEL.
// Two Saxon crosses lighting up carving by carving because somebody has
// been reading Mercian interlace as key material; a station under proxy
// fog; three sixth-formers and the adult with the lanyard; a boarded
// salon on Nantwich Road; and one Welsh word, said out loud, off-log.
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

  // -------------------------------------------------------- Sandbach -----
  def("mid_sandbach_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("sandbach_arrival", true);
    yield C.music("town_congleton");
    yield C.banner("Sandbach", "The Market Square · the Crosses");
    yield C.say([
      "A cobbled square with two Saxon crosses standing in the middle of it, ninth century, taller than a house.",
      "Puritans broke them up about 1650 and scattered the pieces so nobody could put them back."
    ]);
    yield C.say([
      "The town kept the bits. In gardens. In walls. One piece was a rockery in Tarporley for a hundred and fifty years.",
      "Nineteen households. Not one handed in and not one lost. They stood them up again in 1816 and nobody was in charge of it."
    ]);
  });

  def("mid_sandbach_crosses", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("sandbach_crosses_read", true);
    yield C.say([
      "Close up, the carving is animals and knotwork and, on the north face, a nativity: a small crowd of people around a very small thing.",
      "Four panels have been chalked. Not tagged — chalked, lightly, on the four panels that carry the tightest interlace."
    ]);
    if (flag("chapter") >= 5 || flag("badge_bear")) {
      yield C.say([
        "Interlace is a rule. That is what it is FOR: a line goes over, then under, then over, and if it does not, a monk somewhere made a mistake.",
        "It is a checksum in stone. It has been a checksum in stone for eleven hundred years and somebody has finally noticed."
      ]);
      yield C.setFlag("clue_interlace_key", true);
      yield C.notify("Casebook: the interlace is a key.");
    }
    if (!flag("sandbach_crosses_lit") && flag("chapter") >= 5) {
      yield C.wait(400);
      yield C.music("cutscene_signal");
      yield C.say([
        "The fog comes into the square from the Elworth road at about the speed of a person walking.",
        "It is not weather. Weather comes off the moss and off the flashes and off the river. This comes off the road."
      ]);
      yield C.say([
        "The stalls' lamps go on early. And then, on the north cross, one panel lights.",
        "Not lit BY anything. Lit — the carving glowing from inside the stone, one interlace panel, the way a character lights in a terminal."
      ]);
      yield C.sfx("signal_pulse");
      yield C.say([
        "Then the next. Then the next. Carving by carving, up the shaft, in an order.",
        "Somebody has been reading Mercian iconography as key material, and it is answering."
      ]);
      const r = yield C.battle({ kind: "trainer", trainer: "tr_sandbach_5", music: "battle_trainer" });
      if (r && r.lost) {
        yield C.say(["You come round on the cobbles with Hild's coat over you and the fog gone off the square and the crosses dark."]);
        return;
      }
      yield C.say([
        "The puppets come out of the fog and log out of it again like bad sessions, and the market carries on, because it is Thursday.",
        "When it clears, the crosses are dark and warm and there is chalk dust in the joints of the cobbles."
      ]);
      yield C.setFlag("sandbach_crosses_lit", true);
      yield C.setFlag("sandbach_shrine", true);
      yield C.notify("The Sandbach crosses will revive a fainted team.");
      yield C.say([
        "Runewife Hild puts her hand flat on the plinth and leaves it there.",
        "\"They were in nineteen gardens,\" she says. \"Nineteen. And now something has read them.\"",
        "\"That's not desecration, love. That's the first time in four hundred years anybody's actually READ them.\""
      ], { name: "Hild" });
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
      yield C.music("town_congleton");
    }
  });

  // ---------------------------------------------------------- Crewe ------
  def("mid_crewe_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("crewe_arrival", true);
    yield C.music("town_crewe");
    yield C.banner("Crewe", "Twelve platforms · the Works · the Heritage Centre");
    yield C.say([
      "A town that exists because two railways crossed in a field and somebody had to live near the junction.",
      "Seven thousand locomotives built here. Ten thousand men in the Works. A park given by the company on condition it be called Queen's Park."
    ]);
    yield C.say([
      "There is fog on platforms one through twelve and it is nine degrees and dry.",
      "The SIGNAL METER, held at waist height, reads higher here than it did on the top of the Cloud."
    ]);
  });

  def("mid_crewe_fog", function* (ctx) {
    const C = ctx.S;
    if (flag("crewe_fog_cleared")) return;
    if (flag("crewe_yard_started")) {
      yield C.say(["The fog is still on the platforms and Di is still in the shed and the boards still say HOLD."]);
      return;
    }
    yield C.setFlag("crewe_yard_started", true);
    yield C.freeze(true);
    yield C.music("cutscene_signal");
    yield C.say([
      "Every board in the station reads the same thing, on every platform, at once: HOLD.",
      "There is no HOLD. Departure boards have arrived, expected, delayed, cancelled and a scrolling apology. They do not have HOLD."
    ]);
    yield C.say([
      "The fog comes up off the four-foot and out of the subway and it is the colour of nothing.",
      "In it, things log in: puppets, wearing somebody's nan's broadband like a coat, spawning and despawning down the length of platform six."
    ]);
    yield C.wait(400);
    yield C.say([
      "Somewhere out in the yard, a firebox door bangs open and forty tons of iron in steam says something extremely rude about it."
    ]);
    yield C.say([
      "OI. Rail-yard's mine and everything in it is mine, including the WEATHER.",
      "You. Yes, you, with the cats. Run the sidings with me. She clears fog. That's not a metaphor, that's forty tons of hot wet air."
    ], { name: "Stoker Di" });
    yield C.freeze(false);
    // the chase: three sidings, three choices, each a fight or a dodge
    const legs = [
      { q: "Road four. Puppets logging in along the wagons ahead of you.", a: "Straight through them.", b: "Round by the cess and out the far end." },
      { q: "The traverser. Fog thick enough to hide the edge of the pit.", a: "Follow Di's steam and trust it.", b: "Wait for the boards, then move." },
      { q: "Platform twelve. The whole flock coming down the ramp at once.", a: "Stand in the steam and let them come.", b: "Back onto the deck of the tilting train." }
    ];
    for (let i = 0; i < legs.length; i++) {
      const pick = yield C.ask(legs[i].q, [
        { label: legs[i].a, value: "a" },
        { label: legs[i].b, value: "b" }
      ]);
      if (pick === "a") {
        const r = yield C.battle({ kind: "wild", species: "puppetacct", level: 25, canCatch: true, music: "battle_wild" });
        if (r && r.lost) {
          yield C.say(["Di walks you back to the mess and puts the kettle on the firebox and says nothing at all, which from Di is enormous."]);
          return;
        }
        yield C.say(["Steam goes down the siding at the height of your chest and everything in it stops being anywhere."]);
      } else {
        yield C.say([
          "You go the long way. It costs you thirty seconds and Di makes a noise about it.",
          "The boards flicker as you pass under them: HOLD. HOLD. HOLD. Then, for a fifth of a second, a line of Jim's own log format, and then HOLD again."
        ]);
        yield C.setFlag("clue_boards_log_format", true);
      }
    }
    yield C.say([
      "The fog goes off the platforms all at once, the way a thing goes when it has been told to rather than when it has run out.",
      "Twelve boards blink over to real times. There is a collective noise from four hundred people that is not quite a cheer."
    ]);
    yield C.setFlag("crewe_fog_cleared", true);
    yield C.notify("Crewe station is clear.");
    yield C.say([
      "Right. That's the platforms. That's not the problem.",
      "The problem's on a lap of the yard in a train that was cancelled in 1986 and it has been going round since Tuesday."
    ], { name: "Stoker Di" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
    yield C.music("town_crewe");
  });

  def("mid_crewe_apt", function* (ctx) {
    const C = ctx.S;
    if (flag("apt_boss_beaten")) {
      yield C.say([
        "The tarpaulin is back on. The volunteers put it back on within the hour, and tucked it, and tied it properly.",
        "It is the most tender thing you have seen all week."
      ]);
      return;
    }
    if (!flag("crewe_fog_cleared")) {
      yield C.say([
        "The Advanced Passenger Train, under a tarpaulin, tilting, brilliant, cancelled.",
        "The tarpaulin is off at one corner and something under it is warm."
      ]);
      return;
    }
    yield C.freeze(true);
    yield C.music("battle_boss");
    yield C.say([
      "The APT comes past the signal boxes doing about fifteen miles an hour on a lap of the yard that is not in any working timetable.",
      "Nobody is driving it. The tilt is working, which it has not done since 1986, and it leans into the curve like something remembering."
    ]);
    yield C.say([
      "You get on the back deck. The county goes past sideways: sheds, the traverser, a signal box with all its lamps lit.",
      "There is something aboard that logs in as eleven hundred people at once and it has had a week to get comfortable."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "boss_apt", music: "battle_boss" });
    if (r && r.lost) {
      yield C.say(["The train coasts to the buffers and you get off it and sit on the ballast for a while, and Di does not say a word about it."]);
      yield C.freeze(false);
      yield C.music("town_crewe");
      return;
    }
    yield C.setFlag("apt_boss_beaten", true);
    yield C.say([
      "The lap ends at the buffers. The tilt goes off. Everything in the yard is suddenly extremely quiet and extremely 1986.",
      "In the cab, screwed to the desk beside a gauge, is a small modern box with a SIM in it and no asset tag."
    ]);
    yield C.say([
      "It is the same box that was behind the plate in the Holmes Chapel signal frame.",
      "Somebody has been fitting these for years, on trials that ended, for companies that were dissolved, and nobody has ever come back for them."
    ]);
    yield C.setFlag("clue_dongles_everywhere", true);
    yield C.notify("Casebook: the same dongle, twice.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
    yield C.freeze(false);
    yield C.music("town_crewe");
  });

  def("mid_crewe_twelvek", function* (ctx) {
    const C = ctx.S;
    yield C.music("battle_boss");
    yield C.say([
      "A man of about forty-five in a good fleece, on the concourse, with a coffee, watching the boards go back to normal.",
      "He is not annoyed. He has the mild, tired expression of a person whose project has slipped."
    ]);
    yield C.say([
      "Twelve thousand. That's the number. That's the whole personality, if I'm honest.",
      "Four hundred logins a second, and every one of them from an actual house, so every one of them looks like a person having a Tuesday."
    ], { name: "TWELVE-K" });
    yield C.say([
      "The three sixth-formers.",
      "Bright kids. One of them's genuinely gifted. They think they're running it. They're doing the fun bit and I do the bit with the invoices."
    ], { name: "TWELVE-K" });
    const r = yield C.battle({ kind: "boss", trainer: "twelve_k", music: "battle_boss" });
    if (r && r.lost) {
      yield C.say(["He finishes his coffee before you're back on your feet. \"Rounding error,\" he says, not unkindly."], { name: "TWELVE-K" });
      yield C.music("town_crewe");
      return;
    }
    yield C.say([
      "Fine. FINE. The fog comes off, the trains run, and nothing about my week changes.",
      "You do understand this is a job. There's a Slack. There's a standup."
    ], { name: "TWELVE-K" });
    yield C.wait(400);
    yield C.say([
      "He shrugs his coat straight and the lanyard swings out of his fleece and turns over.",
      "It is not a Stuffer's anything. It is a laminated contractor's pass with a photograph, a barcode for a canteen, and one word across the top."
    ]);
    yield C.say(["THE STACK."]);
    yield C.setFlag("twelvek_lanyard_seen", true);
    yield C.notify("Casebook: TWELVE-K wears a STACK lanyard.");
    yield C.say([
      "Read it properly if you're going to stare at it.",
      "The barcode's for a canteen. That's the bit people can't get past. Whatever you think we are, mate — we get a canteen."
    ], { name: "TWELVE-K" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
    yield C.music("town_crewe");
  });

  def("mid_crewe_vex", function* (ctx) {
    const C = ctx.S;
    yield C.music("town_crewe");
    yield C.say([
      "VEX is sitting on a bench on platform six with their hood up and their feet on their bag and their starter out of its capsule for no reason.",
      "They have been here a while. The 19:42 has gone without them."
    ]);
    yield C.say([
      "Don't.",
      "I haven't said anything."
    ]);
    yield C.say([
      "You went down Nantwich Road. I know you went down Nantwich Road, because I watch the CCTV on that street, because I am a NORMAL PERSON.",
      "It's fine. It was a browser update. She clicked it. Everyone clicks it."
    ], { name: "VEX" });
    const a = yield C.ask("", [
      { label: "\"Noted.\"", value: "noted" },
      { label: "Say nothing and sit down.", value: "sit" },
      { label: "\"Everyone clicks it.\"", value: "agree" }
    ]);
    if (a === "noted") {
      yield C.say(["Don't say noted. Don't SAY noted at me."], { name: "VEX" });
      yield C.say(["...Sorry."]);
      yield C.say(["Don't do that either. That's worse."], { name: "VEX" });
    } else if (a === "agree") {
      yield C.say([
        "Yeah. Yeah, they do.",
        "So why does everyone say it like it's the clicking that was the mistake?"
      ], { name: "VEX" });
      yield C.say(["It wasn't."]);
      yield C.say(["...No."], { name: "VEX" });
    } else {
      yield C.say([
        "You sit down. The board changes twice. A pigeon does something ambitious with a chip.",
        "VEX says nothing for eleven minutes, which is the longest they have gone since you met them."
      ]);
    }
    yield C.wait(400);
    yield C.setFlag("salon_seen", true);
    yield C.say([
      "The Manchester train comes in and you both get on it and it is quiet because it is late and everyone on it is somebody going home.",
      "MEADOW gets up on the table between you. She sits on VEX's phone, which is face up, which it never is."
    ]);
    yield C.say([
      "Oi. Off.",
      "Paid."
    ]);
    yield C.say([
      "What?",
      "Paid. It's what I say to the small one when she sits on my keyboard. It's Welsh. It means 'don't'."
    ]);
    yield C.say([
      "...Does it work?",
      "No."
    ]);
    yield C.wait(400);
    yield C.say([
      "VEX laughs. Once, badly, through their nose, in a way they clearly did not authorise.",
      "Then they say it back — 'paid' — to the cat, in an accent that is entirely Crewe, and MEADOW does not move, and they say it again."
    ]);
    yield C.setFlag("welsh_word_learned", true);
    yield C.notify("Casebook: 'paid'. Said aloud, on a train, off-log.");
    yield C.say([
      "None of that goes in a report. There is no field for it.",
      "That is the entire reason it is worth anything."
    ]);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
  });

  // ============================ GYM 4: the roundhouse ====================
  def("mid_gym4_door", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_kernel")) {
      yield C.say(["Road four's lined up for you. It always is now. She had it painted."], { name: "Fireman" });
      return;
    }
    yield C.say([
      "House rules, and they're the shed's.",
      "One: sun on turn one. That's not a gimmick, that's a shed at six in the morning with the doors open and forty tons already lit.",
      "Two: you don't walk at her. The table turns. You line up the road, then you walk.",
      "Three: she'll be talking to the engine the whole time. It is not for your benefit and you are not to comment."
    ], { name: "Fireman" });
  });

  def("mid_gym4_table", function* (ctx) {
    const C = ctx.S;
    if (flag("gym4_open")) {
      yield C.say(["The table is lined up on road four and the pin is dropped. Straight through."]);
      return;
    }
    yield C.say([
      "The turntable: sixty feet of riveted iron on a centre bearing, turned by one person and a handle.",
      "Eight roads out of the pit. Five of them have an engine standing on them. Three do not."
    ]);
    const a = yield C.ask("Which road do you line up?", [
      { label: "Road four — the one with the light at the end of it.", value: "four" },
      { label: "Road one — nearest, quickest.", value: "one" },
      { label: "Walk round the pit instead.", value: "walk" }
    ]);
    if (a === "four") {
      yield C.setFlag("gym4_open", true);
      yield C.sfx("ui_select");
      yield C.say([
        "The table comes round with a noise like a cathedral clearing its throat and the pin drops into road four.",
        "At the far end, past the smokebox of something enormous, a door is open and there is daylight and somebody swearing fondly at iron."
      ]);
      yield C.notify("The road is lined up.");
      return;
    }
    if (a === "one") {
      yield C.say([
        "Road one has a class 08 stood on it with its brakes off and forty years of opinions.",
        "You turn the table back. Somebody in the shed laughs and does not look up."
      ]);
      return;
    }
    yield C.say([
      "You can walk round the pit. Everybody tries to walk round the pit.",
      "It is sixty feet across, the walkway is nine inches wide, and there is a fireman leaning on the far end of it who has clearly been waiting all day."
    ]);
  });

  def("mid_gym4_di", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_kernel")) {
      yield C.say([
        "Kettle's on the firebox. Sit on the step and mind the step, it's hot, everything here's hot.",
        "Ladder's open when you want it. I go up five and then I stop being nice."
      ], { name: "Di" });
      return;
    }
    yield C.music("battle_gym");
    yield C.say([
      "Stoker Di. Mind the pit. Mind the table. Don't touch her, she's in steam and she bites.",
      "Go on, love. Go ON. — Not you. Her."
    ], { name: "Di" });
    yield C.say([
      "Fire gym in a railway town. Nobody's ever once been surprised and I'm not going to pretend it's clever.",
      "Sun on turn one, and that's the shed, not a trick. You want a level playing field, go and fight somebody in a field."
    ], { name: "Di" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_di", music: "battle_gym" });
    if (r && r.lost) {
      yield C.say([
        "Come back when you can take a bit of heat. There's tea in the mess and the kettle IS a boiler, so mind.",
        "You let her burn and then you didn't hit her. That's the wrong half of it."
      ], { name: "Di" });
      yield C.music("town_crewe");
      return;
    }
    yield C.say([
      "HA. Right! RIGHT. You let her overfire and then you hit her.",
      "That's the whole job, that. Anything that's running that hot is running out. You just have to be there when it does."
    ], { name: "Di" });
    yield C.setFlag("badge_kernel", true);
    yield C.giveItem("anchor_kernel", 1);
    yield C.giveItem("tm_firebox_roar", 1);
    yield C.sfx("fanfare_badge");
    yield C.notify("KERNEL badge obtained.");
    if (MQ.Trainer && MQ.Trainer.addBadge) yield C.custom(function () { MQ.Trainer.addBadge("badge_kernel"); });
    else if (MQ.Trainer && MQ.Trainer.badges && MQ.Trainer.badges.add) yield C.custom(function () { MQ.Trainer.badges.add("badge_kernel"); });
    yield C.say([
      "Firebox Roar. And the Railcard office is two streets down — I've rung them.",
      "I have never rung them about anybody. Don't make a thing of it. I'll deny it."
    ], { name: "Di" });
    yield C.say([
      "Ladder's open when you fancy it. Five tiers and then I stop being nice.",
      "And at tier four I bring something you released. Don't ask how I get them. They come to the line. They always come to the line."
    ], { name: "Di" });
    yield C.setFlag("case_16_open", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_05_puppets_on_the_line");
    yield C.music("town_crewe");
  });

  def("mid_gym4_backdoor", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A door at the back of the shed with daylight under it and somebody on the other side of it talking to a locomotive.",
      "The table is not lined up on this road. You are standing on nine inches of walkway over a sixty-foot pit and you are not getting any further."
    ]);
  });

  // ------------------------------------------------------------ chapter ---
  S.defineChapter(5, {
    title: "Puppets on the Line",
    quest: "main_05_puppets_on_the_line",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_05_puppets_on_the_line");
      if (MQ.Story && MQ.Story.applyCutover) yield C.custom(function () { MQ.Story.applyCutover(5); });
      yield C.say([
        "Sandbach kept the pieces of two broken crosses in nineteen gardens for a hundred and sixty years and then put them back up.",
        "Crewe was built because two railways crossed in a field, and this week the schedule has started disagreeing with itself every thirteenth minute.",
        "Thirty-one days."
      ]);
    },
    hooks: {
      complete: function () {
        return !!(flag("badge_kernel") && flag("crewe_fog_cleared") && flag("apt_boss_beaten") &&
          flag("sandbach_crosses_lit") && flag("twelvek_lanyard_seen") && flag("welsh_word_learned") &&
          flag("rail_fast_travel"));
      },
      next: 6
    }
  });
})();
