// =============================================================
// MonsterQuest v2 — CHAPTER 8: "The Ruin"
// Delamere Forest, Tarporley, Beeston Castle. Levels 33-37, no gym.
// VEX has stopped answering. They are on a castle wall in the wind
// with their starter's capsule in their hand, having just been told by
// something wearing a ranger's face that the creature is a tag.
// CHOICE 2 — Verify or Challenge.
// Registers: MQ.Story.chapters[8] and the Ch.8 scripts.
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

  // The word from the train (Ch.5, `welsh_word_learned`) is "paid" — the
  // Welsh imperative "don't". VEX heard it on the Cambrian line and only VEX
  // and Jim were in that carriage.
  const WORD = "paid";

  // ------------------------------------------------------ the wall scene --
  def("nw_beeston_wall_scene", function* (ctx) {
    const C = ctx.S;
    if (flag("choice_vex")) return;
    yield C.freeze(true);
    yield C.music("battle_vex");
    yield C.weather("wind");
    yield C.say([
      "The inner ward. The wall walk runs the length of the curtain and the wind comes up the face of the crag and over it.",
      "VEX is stood on the parapet side with a capsule in one hand, holding it out over three hundred and fifty feet of nothing."
    ]);
    yield C.say([
      "Don't come up here. I mean it, root user. Do not come up here and be REASONABLE at me.",
      "A ranger told me. Up by the well. Very nice, very calm, knew my name and the day I signed."
    ], { name: "VEX" });
    yield C.say([
      "Tagged. My starter. From the bench. From ALDER'S bench, in ALDER'S mill, out of ALDER'S hand.",
      "Every catch. Every log. Every stupid note I made at two in the morning about a creature I liked.",
      "Four years of me, streamed, to something that has never once said thank you."
    ], { name: "VEX" });
    yield C.say([
      "The capsule is out over the drop and their arm is not shaking, which is worse than if it were.",
      "MEADOW walks the parapet like it is a pavement and sits down against VEX's leg."
    ]);
    const act = yield C.ask("VEX does not look at you.", [
      { label: "\"Give it here.\"", value: "take" },
      { label: "\"It didn't ask to be a tag either.\"", value: "say" },
      { label: "Say nothing. Sit down on the wall.", value: "sit" }
    ]);
    if (act === "take") {
      yield C.say([
        "Don't you dare —",
        "You take it. Not fast. You put your hand under theirs and take the weight and they let you, which is the whole conversation."
      ], { name: "VEX" });
    } else if (act === "say") {
      yield C.say([
        "It didn't ask to be a tag either.",
        "...",
        "That's a rotten thing to say. That's an absolutely rotten thing to say and it's worked and I hate you."
      ], { name: "VEX" });
    } else {
      yield C.say([
        "You sit down on the wall with your legs over the drop, next to them, and say nothing at all.",
        "After about a minute VEX sits down too. The arm comes in. The capsule goes in a pocket.",
        "BIGBOY arrives at his own speed and sits on both your feet, which settles the matter."
      ]);
    }
    yield C.setFlag("vex_release_stopped", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_08_the_ruin");
    yield C.say([
      "Right. Right. So what do I —",
      "VEX stops.",
      "Because there is somebody standing in the doorway of the keep."
    ], { name: "VEX" });
    yield C.sfx("oracle_tag");
    yield C.wait(400);
    yield C.say([
      "It is VEX.",
      "The same hoodie. The same fold of the arms. The same wind pulling at the same hair, in the same direction, at the same time.",
      "It walks out onto the ward and stops, and it says, in exactly the right voice: 'Bar's on the floor.'"
    ]);
    yield C.say([
      "That's — that's ME. That's my LINE, that's the thing I say —",
      "The one beside you has gone the colour of the stone."
    ], { name: "VEX" });
    yield C.freeze(false);
    yield C.say([
      "Two of them on the wall in the wind, and you have about four seconds before one of them does something.",
      "Talk to either. Verify, if you have the word. Or challenge them both and be done."
    ]);
    yield C.setFlag("beeston_wall_scene", true);
  });

  // Talking to the VEX on the wall — the Verify path lives here.
  def("nw_beeston_vex_wall", function* (ctx) {
    const C = ctx.S;
    if (!flag("beeston_wall_scene")) {
      yield C.say([
        "Wind on the wall walk, and somebody at the far end of it holding a capsule out over the drop.",
        "They have not seen you yet."
      ]);
      return;
    }
    if (flag("choice_vex")) return;
    yield C.call(confront);
  });

  def("nw_beeston_second_vex", function* (ctx) {
    const C = ctx.S;
    if (!flag("beeston_wall_scene")) {
      yield C.say(["The keep is empty. Four hundred years of nothing much, arranged carefully."]);
      return;
    }
    if (flag("choice_vex")) return;
    yield C.call(confront);
  });

  function* confront(ctx) {
    const C = ctx.S;
    const knowsWord = !!flag("welsh_word_learned");
    const choices = [];
    if (knowsWord) choices.push({ label: "VERIFY — ask them both for the word from the train.", value: "verify" });
    else choices.push({ label: "VERIFY — (you have nothing only the two of you would know)", value: "cant" });
    choices.push({ label: "CHALLENGE — fight them both and sort it out afterwards.", value: "challenge" });
    choices.push({ label: "Wait.", value: "wait" });
    const pick = yield C.ask("Two VEXes, one wall, and a wind that will not let anybody think.", choices);

    if (pick === "wait") {
      yield C.say(["Neither of them moves. Neither of them will. One of them can do this all night."]);
      return;
    }
    if (pick === "cant") {
      yield C.say([
        "You go to ask them something only the two of you would know.",
        "And there is nothing. You did not travel with them. You did not sit in that carriage on the Cambrian line and hear a word said in Welsh to a stranger.",
        "You have spent eleven years learning that verification is a thing you build in advance, and you did not build one.",
        "You are going to have to do this the loud way."
      ]);
      return;
    }

    if (pick === "verify") {
      yield C.setFlag("choice_vex", "verify");
      yield C.music("cutscene_signal");
      yield C.say([
        "You ask them both the same question, in the same voice, at the same volume.",
        "\"On the Cambrian line, out past Machynlleth, a woman said one word to you across the aisle and you did not know what it meant. What was the word?\""
      ]);
      yield C.say([
        "The one on the wall says: '" + WORD + ".' Straight away. Wrong pronunciation, which is the correct wrong pronunciation.",
        "The one from the keep says: '" + WORD + "', a half-second later, perfectly, with the vowel exactly right.",
        "Nobody who heard it once for the first time on a train says it like that."
      ]);
      yield C.say([
        "And MEADOW, who has not moved in four minutes, walks the length of the wall past the one from the keep without looking at it,",
        "and climbs into the lap of the one who is sitting down, and settles, and starts to purr."
      ]);
      yield C.sfx("cat_purr");
      yield C.say([
        "The one from the keep looks at the cat.",
        "And then — with no ceremony, the way you take off a coat in a warm room — it stops being VEX."
      ]);
      const r = yield C.battle({ kind: "boss", trainer: "boss_understudy_beeston", music: "battle_boss" });
      if (r && r.lost) {
        yield C.say(["It steps back into the keep and the keep is empty and the wind has not changed."]);
        yield C.setFlag("choice_vex", false);
        return;
      }
      yield C.setFlag("vex_ally", true);
      yield C.setFlag("understudy_beeston_beaten", true);
      yield C.say([
        "It comes apart the way a face comes apart in a bad photograph, and it goes backwards off the wall in a manner a person could not.",
        "There is nothing at the bottom. You look. There is nothing at the bottom."
      ]);
      yield C.say([
        "You asked me a question you already knew the answer to.",
        "That's — that's not doubting me. That's the opposite of doubting me, isn't it. That's building a way to be sure.",
        "Nobody has ever done that for me. Everybody just decides."
      ], { name: "VEX" });
      yield C.say([
        "Right. I'm coming. Don't make a thing of it. I'm coming, and I'm keeping the tagged one, because it didn't ask either.",
        "And if you say 'noted' I will push you off this wall myself."
      ], { name: "VEX" });
      yield C.notify("VEX will travel with you.");
    } else {
      yield C.setFlag("choice_vex", "challenge");
      yield C.music("battle_vex");
      yield C.say([
        "You do not ask. You cannot know and you are not going to pretend you can, so you take the only thing that is actually true:",
        "whichever of these is VEX, they will fight you, and whichever of these is not, it will have to."
      ]);
      yield C.say([
        "Oh, you absolute —",
        "FINE.",
        "FINE."
      ], { name: "VEX" });
      const r1 = yield C.battle({ kind: "trainer", trainer: "vex_4", music: "battle_vex" });
      if (r1 && r1.lost) {
        yield C.say(["There. NOW who's under the bar.", "...that's not what I wanted to say. That's never what I want to say."], { name: "VEX" });
        yield C.setFlag("choice_vex", false);
        return;
      }
      yield C.say([
        "VEX sits down where they are, on stone, in the wind, and does not get up.",
        "The other one has not moved throughout. It has been watching you fight, and its head has been very slightly on one side."
      ]);
      const r2 = yield C.battle({ kind: "boss", trainer: "boss_understudy_beeston", music: "battle_boss" });
      if (r2 && r2.lost) {
        yield C.say(["It steps back into the keep, and the keep is empty, and VEX has gone."]);
        return;
      }
      yield C.setFlag("understudy_beeston_beaten", true);
      yield C.say([
        "The second one drops the face on the stone and goes over the wall, and the stone is a better likeness than the face was."
      ]);
      yield C.say([
        "You didn't know. You fought me and you didn't know which one I was.",
        "I'd have known. I'd have known you in a crowd of a hundred of you.",
        "Don't follow me."
      ], { name: "VEX" });
      yield C.notify("VEX has gone.");
    }
    yield C.weather("clear");
    yield C.music("route_west");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_08_the_ruin");
    yield C.setFlag("beeston_arena_open", true);
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  }
  S.scripts.nw_beeston_confront = confront;

  // ------------------------------------------------------------- the well --
  def("nw_beeston_well_note", function* (ctx) {
    const C = ctx.S;
    if (flag("beeston_well_note")) {
      yield C.say(["The ledge in the shaft, and the space where the tin was."]);
      return;
    }
    yield C.setFlag("beeston_well_note", true);
    yield C.say([
      "A hundred and twelve metres down, on a ledge cut into the shaft that is not part of any survey, there is a tobacco tin.",
      "Inside: a memory card, a folded sheet, and a cat collar tag corroded past reading."
    ]);
    yield C.say([
      "The sheet is handwritten, in a clean engineer's hand, in pencil, on the back of a telecoms job sheet.",
      "'DARKBYTE IS A LEVER. THE LOAD IS AT DARESBURY. IF YOU ARE READING THIS YOU ARE THE THIRD PERSON TO GET THIS FAR AND THE OTHER TWO WORK FOR THEM.'",
      "'I DRINK AT FRODSHAM. THE BENCH ABOVE THE TOWN. DUSK. BRING NOTHING THAT LOGS.'"
    ]);
    yield C.giveItem("collectible_25", 1);
    yield C.giveItem("capsule_root", 5);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_08_the_ruin");
    yield C.notify("A note from ROOT. Frodsham. The bench. Dusk.");
    yield C.say([
      "The collar tag has a phone number on it with a Frodsham code and four letters of a name.",
      "MEADOW takes it off you, carries it eight feet, puts it down, and sits next to it until you pick it up again."
    ]);
  });

  // ---------------------------------------------------------- the chapter --
  S.defineChapter(8, {
    title: "The Ruin",
    quest: "main_08_the_ruin",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_08_the_ruin");
      yield C.say([
        "VEX has not answered a message in nine days.",
        "The last anybody has is a photograph of the Sandstone Trail signpost at Delamere, no caption, taken at 04:41.",
        "Alder has rung twice and not left a message either time, which she has never done."
      ]);
      yield C.say([
        "CUTOVER: 12 DAYS.",
        "The forest is under a fog that came in at four with no wind behind it, and the wildlife has stopped using the north ride."
      ]);
    },
    hooks: {
      complete: function () {
        return !!(flag("vex_release_stopped") && flag("choice_vex") && flag("beeston_well_note"));
      },
      next: 9
    }
  });
})();
