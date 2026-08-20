// =============================================================
// MonsterQuest v2 — CHAPTER 4: "The Dish Goes Dark"
// Holmes Chapel, Jodrell Bank, Congleton. Levels 17-22, Gym 3 BEAR.
// The long approach to a telescope that has stopped listening upwards,
// a woman in hi-vis who knows your name, a board memo about a cutover,
// and a ranger in an arboretum whose face fits and whose years do not.
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

  def("mid_holmes_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("holmes_arrival", true);
    yield C.music("town_congleton");
    yield C.banner("Holmes Chapel", "The viaduct · the crossing · the box");
    yield C.say([
      "A village built round a level crossing, with a brick church that has a black-and-white timber church hidden inside it.",
      "They did not knock the old one down. They wrapped it. You will think about that later and at a bad moment."
    ]);
    yield C.say([
      "The barriers come down. Nothing comes. The barriers go up.",
      "Four people on the pavement look at each other and decide, together and without speaking, not to mention it."
    ]);
  });

  // ------------------------------------------------------- Jodrell --------
  def("mid_jodrell_approach", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("jodrell_approach", true);
    yield C.music("cutscene_signal");
    yield C.say([
      "You come out of the meadows and the hedge stops and the sky is full of it.",
      "Seventy-six metres of white steel bowl on a frame you can see the sky through, standing in a field in Cheshire like something that landed."
    ]);
    yield C.say([
      "It is not moving. Jodrell Bank is always moving; the bowl tracks, all day, slowly, the way a head follows a conversation.",
      "It is pointed at forty-three degrees above the horizon on a bearing of about three hundred and twenty. That is not up. That is a hill."
    ]);
    yield C.wait(400);
    yield C.say([
      "Every small dish in the arboretum is pointed the same way.",
      "So is the weathervane on the visitor centre, which does not have a motor."
    ]);
  });

  def("mid_jodrell_gate", function* (ctx) {
    const C = ctx.S;
    if (flag("jodrell_turned_away")) {
      yield C.say([
        "The gate is chained. The chain is new and so is the lock and neither of them is the site's.",
        "Whatever ROOT is doing in there, she is doing it behind a padlock somebody else bought."
      ]);
      return;
    }
    yield C.say(["The gate is shut and there is a woman in hi-vis standing inside it with a clipboard she is not reading."]);
  });

  def("mid_jodrell_root", function* (ctx) {
    const C = ctx.S;
    if (flag("jodrell_turned_away")) {
      yield C.say([
        "She is not there. The gate is chained and the arboretum is empty and there is a paper cup on the post, still warm.",
        "The bowl has not moved."
      ]);
      return;
    }
    yield C.freeze(true);
    yield C.music("cutscene_signal");
    yield C.say([
      "A woman in her fifties in a hi-vis coat and a hood, standing inside a locked gate, holding a clipboard she has not looked at once.",
      "She watched you come the whole length of the drive. She has been watching people come up that drive for a while."
    ]);
    yield C.say(["Site's closed."], { name: "Hi-vis" });
    const a = yield C.ask("", [
      { label: "\"For what?\"", value: "what" },
      { label: "\"Closed by whom?\"", value: "whom" }
    ]);
    if (a === "whom") {
      yield C.say([
        "By a company registered in March with one director and a PO box.",
        "You'll want to write that down. You look like a man who writes things down."
      ], { name: "Hi-vis" });
    }
    yield C.say([
      "Maintenance. Weather.",
      "You, specifically."
    ], { name: "Hi-vis" });
    yield C.say([
      "Behind her, two men in the same hi-vis are doing nothing at all in the arboretum in the manner of people paid by the day.",
      "She is not with them. She is standing between you and them and she has arranged it so that she is."
    ]);
    yield C.say([
      "The bowl's at forty-three degrees.",
      "It is."
    ], { name: "Hi-vis" });
    yield C.say([
      "That's not the sky.",
      "No."
    ], { name: "Hi-vis" });
    yield C.wait(500);
    yield C.say([
      "She looks past you, at your party, and then — for a good deal longer than she looks at any of them — at the small black cat sitting on the gatepost.",
      "\"Right,\" she says, to the cat."
    ]);
    yield C.say([
      "Go home, Jim.",
      "You did not give her your name."
    ]);
    yield C.wait(500);
    yield C.say([
      "She turns, walks up the drive, and takes the footpath out over the stile without looking back.",
      "On the way past the gatepost something drops out of her coat pocket into the grass, at about the speed of a thing that is dropped rather than a thing that falls."
    ]);
    yield C.setFlag("jodrell_turned_away", true);
    yield C.wait(600);
    yield C.say([
      "A handheld the size of a paperback: rubberised case, one screen, one dial, JODRELL BANK ESTATES stencilled on the back and scratched half off.",
      "The screen has one line on it: a signal strength, and a bearing, and a number that goes up when you turn towards the south-west."
    ]);
    yield C.giveItem("signal_meter", 1);
    yield C.setFlag("signal_meter", true);
    yield C.sfx("signal_pulse");
    yield C.notify("SIGNAL METER acquired.");
    yield C.say([
      "It is not lost property. It was put there.",
      "Somebody has just spent a fortnight arranging for a stranger to be turned away from a gate carrying a working instrument."
    ]);
    // CUTOVER begins here (STORY-BIBLE §6): 38 days.
    if (MQ.Story && MQ.Story.applyCutover) yield C.custom(function () { MQ.Story.applyCutover(4); });
    else { yield C.setFlag("cutover_started", true); yield C.setFlag("cutover_days", 38); }
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_04_the_dish_goes_dark");
    yield C.freeze(false);
  });

  def("mid_jodrell_ranger", function* (ctx) {
    const C = ctx.S;
    yield C.music("cutscene_signal");
    yield C.say([
      "A ranger in the arboretum, in the estate's own green, with the estate's own badge on his chest.",
      "Lovely day. Lovely to see you again."
    ], { name: "Ranger Fenn" });
    const a = yield C.ask("", [
      { label: "\"We haven't met.\"", value: "met" },
      { label: "\"Which tree is that one?\"", value: "tree" },
      { label: "Say nothing and look at him.", value: "look" }
    ]);
    if (a === "tree") {
      yield C.say([
        "That one? That's — that's a lovely one, that is. Been here since the arboretum went in.",
        "The label at its foot says PLANTED 2011. The arboretum went in in 1972."
      ], { name: "Ranger Fenn" });
    } else if (a === "met") {
      yield C.say([
        "I know. I said 'again'.",
        "And you noticed. And I saw you notice. And I have not adjusted, which is the interesting part, isn't it."
      ], { name: "Ranger Fenn" });
    } else {
      yield C.say([
        "He waits. He is extremely good at the waiting.",
        "Then, for about a fifth of a second, the waiting is being done by something that is not a man waiting, and then it is a man again."
      ]);
    }
    yield C.wait(400);
    yield C.say([
      "MEADOW walks up to him. She walks right up to his boots, sits, and looks up.",
      "And he steps back. One step. A ranger who has worked eleven years on an estate with four hundred deer on it steps back from a cat."
    ]);
    yield C.say([
      "Right. Well. Mind the arboretum.",
      "He walks away between the trees and does not once put his hand out to steady himself on one, which everybody does, because the ground is uneven."
    ], { name: "Ranger Fenn" });
    yield C.setFlag("amos_first_glimpse", true);
    yield C.notify("Casebook: a ranger with the wrong face.");
    yield C.say([
      "Somewhere behind you the SIGNAL METER, which has been reading a steady low hum all morning, spikes once and settles.",
      "Whatever that was, the county was paying attention to it."
    ]);
  });

  // ------------------------------------------------------- Congleton -----
  def("mid_congleton_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("congleton_arrival", true);
    yield C.music("town_congleton");
    yield C.banner("Congleton", "Beartown");
    yield C.say([
      "Three stone bears in the market square, a bear on the football badge, a bear on the Wi-Fi, and a bear on the sign of the pub.",
      "In 1621 this town had money set aside for a Bible and its bear died before the wakes, and it bought a bear."
    ]);
    yield C.say([
      "Everyone tells you this within four minutes of arriving. Nobody tells you they bought the Bible the following year, out of their own pockets.",
      "That bit is not funny, so it does not travel."
    ]);
  });

  def("mid_congleton_otis_pre", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_bear")) {
      yield C.say([
        "Hands, remember. I'm strict about the hands.",
        "And read that memo when you've a minute. I thought it was a bill. It is not a bill."
      ], { name: "Otis" });
      return;
    }
    if (!flag("case_10_open")) {
      yield C.setFlag("case_10_open", true);
      yield C.say([
        "Bearward Otis. Before you come down the steps — a favour, and it's a small one and it's not really small.",
        "There's three bear tokens hid round this town. Bakery, bridge, park. Find them and bring them and I'll tell you what they spell."
      ], { name: "Otis" });
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_10_bear_of_congleton");
      yield C.notify("Casebook: Bear of Congleton.");
      yield C.say([
        "And while you're walking: there's stickers on every lamppost from here to the station with the town's Wi-Fi on them and a little square code.",
        "The code doesn't join you to the Wi-Fi. Take them down. Six of them. That's the actual favour."
      ], { name: "Otis" });
      return;
    }
    if (flag("case_10_posters_done") && !flag("case_10_done")) {
      yield C.setFlag("case_10_done", true);
      yield C.custom(function () { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(4); });
      yield C.giveMoney(900);
      if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("case_10_bear_of_congleton");
      yield C.say([
        "Six down and three tokens in your hand. The tokens spell BEAR, which is the town's Wi-Fi password, which is the least surprising fact in Cheshire.",
        "And that's the whole trick, isn't it. They didn't break anything. They printed the true thing on a lamppost and hung a lie underneath it."
      ], { name: "Otis" });
      yield C.notify("Casebook case closed: Bear of Congleton.");
      return;
    }
    yield C.say([
      "Tokens: bakery, bridge, park. Stickers: everywhere. Off you go.",
      "Then down the steps and mind the step. Everybody minds the step and everybody still trips on it."
    ], { name: "Otis" });
  });

  def("mid_gym3_backdoor", function* (ctx) {
    const C = ctx.S;
    if (flag("case_10_open") && !flag("gym3_open")) {
      yield C.setFlag("gym3_open", true);
      yield C.sfx("ui_select");
      yield C.say([
        "The keeper unhooks the chain across the arch without being asked.",
        "\"He said to let you through when you'd been round the lampposts,\" he says. \"He watches out the window. He's very bad at pretending he doesn't.\""
      ]);
      yield C.notify("The arch is open.");
      return;
    }
    yield C.say([
      "A chain across the arch and a keeper leaning on it.",
      "\"Talk to Otis on the steps first,\" he says. \"He'll ask you for something small. It is not small. Do it anyway.\""
    ]);
  });

  def("mid_gym3_memo", function* (ctx) {
    const C = ctx.S;
    if (!flag("cutover_started")) {
      yield C.say([
        "A cork board in the keeper's hut: rotas, a fixture list, a very old photograph of a bear.",
        "And an envelope, unopened, addressed to the gym as a tenant of the market hall."
      ]);
      return;
    }
    if (flag("congleton_memo_read")) {
      yield C.say(["The memo is still pinned there. Otis has drawn a bear on the corner of it, badly."]);
      return;
    }
    yield C.setFlag("congleton_memo_read", true);
    yield C.say([
      "The envelope is a landlord's circular about the market hall's connectivity contract.",
      "Otis has opened it at last and pinned it up and drawn a bear on the corner, badly."
    ]);
    yield C.say([
      "SERVICE CONTINUITY NOTICE — TENANTS OF THE MARKET HALL",
      "'Your provider's upstream capacity is supplied under contract by THE STACK (Daresbury). Please note the scheduled platform cutover.'",
      "'STACK CUTOVER: 38 DAYS. Service may be interrupted while the existing model is retired and replaced.'"
    ]);
    yield C.say([
      "Retired. Replaced.",
      "It is a landlord's circular about broadband, in a bear pit, in Congleton, and it is a death notice with a date on it."
    ]);
    yield C.setFlag("clue_cutover_memo", true);
    yield C.notify("Casebook: STACK CUTOVER — 38 days.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_04_the_dish_goes_dark");
  });

  def("mid_gym3_otis", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_bear")) {
      yield C.say([
        "Badge holder. Come down whenever. She likes you and she is not indiscriminate.",
        "That memo's on the board when you want it. I thought it was a bill for a fortnight."
      ], { name: "Otis" });
      return;
    }
    yield C.music("battle_gym");
    yield C.say([
      "Bearward Otis. Mind the step. Everybody minds the step.",
      "Right. Before we start — the story, because I tell everybody the story and today it is actually relevant."
    ], { name: "Otis" });
    yield C.say([
      "1621. The town's bear dies a fortnight before the wakes. The corporation has sixteen shillings put by for a Bible.",
      "They buy a bear. And four hundred years of people have laughed at that, and not one of them has asked what a bear was FOR."
    ], { name: "Otis" });
    yield C.say([
      "It was the wakes. It was the one week of the year the whole town was in one place at one time.",
      "They had a Bible coming. They did not have a way of getting everybody in the same field. So they bought one."
    ], { name: "Otis" });
    yield C.say([
      "House rule, and I'll not apologise for it: first phase is two on one.",
      "She has never fought alone in two hundred years and nobody has ever managed to explain to her why she should start."
    ], { name: "Otis" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_otis", music: "battle_gym" });
    if (r && r.lost) {
      yield C.say([
        "No shame in that. Sit on the step. There's tea in the hut and it's stewed and it's yours.",
        "Come back with four. Four is not a hint, it's the arithmetic."
      ], { name: "Otis" });
      yield C.music("town_congleton");
      return;
    }
    yield C.say([
      "HA! Right. HANDS. Good.",
      "BEAR badge. And the card, Bear Hug — don't put that on anything you're fond of, it hangs on."
    ], { name: "Otis" });
    yield C.setFlag("badge_bear", true);
    yield C.giveItem("anchor_bear", 1);
    yield C.giveItem("tm_bear_hug", 1);
    yield C.sfx("fanfare_badge");
    yield C.notify("BEAR badge obtained.");
    if (MQ.Trainer && MQ.Trainer.addBadge) yield C.custom(function () { MQ.Trainer.addBadge("badge_bear"); });
    else if (MQ.Trainer && MQ.Trainer.badges && MQ.Trainer.badges.add) yield C.custom(function () { MQ.Trainer.badges.add("badge_bear"); });
    yield C.say([
      "Now. Your big lad. The black-and-white one who sits down when he's had enough.",
      "Bring him here."
    ], { name: "Otis" });
    yield C.wait(400);
    yield C.say([
      "Otis puts a hand flat on the pit wall and leans on it and says something to BIGBOY that you do not catch.",
      "BIGBOY gets up, walks over, puts his shoulder against the wheelie bin at the back of the pit, and moves it four feet without appearing to try."
    ]);
    yield C.say([
      "There you are. That's a bearward's trick and it is four hundred years old and it is not a trick.",
      "You ask them once, properly, and then you let them decide. Works on bears. Works on cats. Works on people, mostly."
    ], { name: "Otis" });
    yield C.unlock("shove");
    yield C.setFlag("bigboy_shove", true);
    yield C.notify("BIGBOY Shove: he will move things, if asked properly.");
    yield C.say([
      "One more thing and then I'll let you go.",
      "There's a memo on the board in the keeper's hut. Landlord's circular. I thought it was a bill and I've ignored it a fortnight.",
      "Read it. Then tell me if I ought to have read it. ...Your face has already told me."
    ], { name: "Otis" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_04_the_dish_goes_dark");
    yield C.music("town_congleton");
  });

  def("mid_bosley_summit", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("bosley_summit", true);
    yield C.say([
      "The top of the Cloud. Wind off the edge, the whole plain laid out, and a plaque claiming seven counties.",
      "You can count five and a rumour. Everybody can count five and a rumour. The plaque has never been corrected."
    ]);
    if (flag("signal_meter")) {
      yield C.say([
        "The SIGNAL METER, which reads a steady low hum in the towns, sits up here at four times that and does not fluctuate.",
        "From this hill you can see Jodrell, Alderley on the skyline, and a white smudge west that is the Frodsham turbines.",
        "The dish is small and white and very clearly not looking up."
      ]);
      yield C.setFlag("clue_signal_from_hills", true);
    }
    yield C.giveItem("viewpoint_bosley_cloud", 1);
    yield C.notify("Viewpoint recorded: Bosley Cloud.");
  });

  // ------------------------------------------------------------ chapter ---
  S.defineChapter(4, {
    title: "The Dish Goes Dark",
    quest: "main_04_the_dish_goes_dark",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_04_the_dish_goes_dark");
      if (MQ.Story && MQ.Story.applyCutover) yield C.custom(function () { MQ.Story.applyCutover(4); });
      yield C.say([
        "The Lovell Telescope has been quiet for a fortnight and nobody noticed, because you do not notice a telescope until it stops.",
        "DARKBYTE have the site for maintenance. DARKBYTE have never maintained anything.",
        "And Alder Labs sold something, four years ago, and two people used the same three words about it: she had to."
      ]);
    },
    hooks: {
      complete: function () {
        return !!(flag("badge_bear") && flag("jodrell_turned_away") && flag("signal_meter") &&
          flag("cutover_started") && flag("amos_first_glimpse"));
      },
      next: 5
    }
  });
})();
