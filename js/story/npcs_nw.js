// =============================================================
// MonsterQuest v2 — region-northwest NPC scripts (MQ.Story.npcScripts).
// Everything west of the salt that talks and is not a chapter beat: the
// rangers, the wardens, the falconer, the six identical kitchens, the
// arcade kiosk that lies, and a cat on a church roof that is mostly grin.
// Keys are namespaced nw_*. Registration only; nothing runs at parse.
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
  function num(id) { const v = flag(id); return typeof v === "number" ? v : 0; }
  function stage(id) { return MQ.Quests && MQ.Quests.stage ? MQ.Quests.stage(id) : -1; }
  function has(id, n) { return MQ.Inventory && MQ.Inventory.count ? MQ.Inventory.count(id) >= (n || 1) : !!flag("item_" + id); }
  S.nwHelpers = { flag: flag, num: num, stage: stage, has: has };

  // A one-shot narration helper: says its pages once, then a short line.
  function once(id, pages, after, opts) {
    return function* (ctx) {
      const C = ctx.S;
      if (!flag(id)) { yield C.setFlag(id, true); yield C.say(pages, opts); return; }
      yield C.say(after || pages, opts);
    };
  }

  // =====================================================================
  // DELAMERE FOREST
  // =====================================================================
  def("nw_delamere_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.banner("Delamere Forest", "Ch.8 — The Ruin");
    yield C.say([
      "Twenty-two square miles of old royal forest, and a fog off Blakemere that came in at four and has not shifted.",
      "It is not fog weather. There is no wind and the fog is exactly waist high and it has an edge you could rule a line along."
    ]);
    yield C.say([
      "MEADOW goes six feet into it and stops, and comes back, and sits on your boot.",
      "She has done that twice in her life. Once in a vet's waiting room."
    ]);
    yield C.setFlag("vex_missing", true);
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_08_the_ruin");
  });

  def("nw_delamere_owain", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_26_delamere_watch");
    if (st < 0) {
      yield C.say([
        "Owain. Forester. Twenty-two square miles and I know eleven of them properly.",
        "Here's a job for a man who reads the ground. Twelve sightings across this forest — Blakemere, the trails, the Old Pale.",
        "Photograph them. Three of them only turn up at weekends and I have never once been able to explain that to a committee."
      ], { name: "Forester Owain" });
      yield C.quest.start("case_26_delamere_watch");
      return;
    }
    if (st === 0) {
      yield C.say([
        "Twelve. Not eleven, not thirteen. The twelfth is the one people come back about.",
        "It's at the Moss. Stand on the boards and look down."
      ], { name: "Forester Owain" });
      return;
    }
    if (st === 1 && flag("case_26_reflection")) {
      yield C.quest.advance("case_26_delamere_watch");
      yield C.say([
        "There. That's the one.",
        "Every ranger who's done this walk has brought me back a picture of themselves with something stood next to them.",
        "It's never the same thing twice. And it's never anything anybody's caught yet."
      ], { name: "Forester Owain" });
      return;
    }
    if (st >= 2) {
      yield C.quest.complete("case_26_delamere_watch");
      yield C.say([
        "Twelve. Filed. And a notebook for you — it'll tell you where a thing lives, not just what it's called.",
        "Knowing where something lives is ninety per cent of knowing it. The name is for forms."
      ], { name: "Forester Owain" });
      return;
    }
    yield C.say([
      "Girl in a hoodie went up the north ride two hours back, arguing with a phone.",
      "She wasn't winning. I offered her a flask and she looked at me like I'd offered her a rope."
    ], { name: "Forester Owain" });
  });

  def("nw_delamere_ivy_hut", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Kettle's on. It's always on. It's the only bit of this job that's reliable.",
      "That fog came off the Moss at four with no wind behind it. Fog needs cold ground and still air and it has had neither."
    ], { name: "Ranger Ivy" });
    if (!flag("delamere_ivy_told")) {
      yield C.setFlag("delamere_ivy_told", true);
      yield C.say([
        "And there's a glade past the black water that is not on any map I have, and I have all of them.",
        "You can only find it after dark, with a lamp. In daylight it's a wall of pines and I've walked into it twice."
      ], { name: "Ranger Ivy" });
      yield C.giveItem("capsule_night", 5);
    }
    yield C.heal();
  });

  def("nw_delamere_tudur", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Eddisbury. Iron Age, then Aethelflaed refortified it in 914 against the Norse, then somebody put a car park on it.",
      "Three thousand years of people looking at this ridge and thinking: right, I can see anyone coming from here.",
      "That's all defence has ever been. Height and a good line of sight and somebody awake."
    ], { name: "Historian Tudur" });
  });

  def("nw_delamere_glade_hint", once("delamere_glade_hint", [
    "A gap in the pines that you would swear was not there a moment ago, and will swear the same about tomorrow.",
    "There is no path into it. There are, however, footprints coming out."
  ]));

  def("nw_glade_first", once("delamere_glade_entered", [
    "The glade. Pine needles, a black pool, and glow-worms doing something with their light that glow-worms do not do.",
    "They are not scattered. They are in ranks, and the ranks are shifting, and if you stand still long enough the pattern repeats every ninety seconds."
  ]));

  def("nw_glade_grinkit", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A kitten on a stump, mostly grin.",
      "It says, in your own voice, at your own volume: 'she has known since the phone rang.'",
      "You have not said that out loud since Macclesfield. You are not sure you said it out loud then."
    ]);
    if (!flag("grinkit_glade")) {
      yield C.setFlag("grinkit_glade", true);
      yield C.giveItem("cat_token_5", 1);
      yield C.notify("A hidden cat found.");
    }
  });

  def("nw_blakemere_reflection", function* (ctx) {
    const C = ctx.S;
    if (flag("case_26_reflection")) {
      yield C.say(["The water is black and perfectly still and shows you exactly one of you."]);
      return;
    }
    yield C.setFlag("case_26_reflection", true);
    yield C.addFlag("case_26_sightings", 1);
    yield C.say([
      "The Moss is black and dead flat. Every drowned stump under it is visible and none of them move.",
      "You look down. There is you, the boards, the sky, both cats.",
      "And, standing at your shoulder in the water and nowhere else, something you have never caught, have never seen, and would recognise anywhere."
    ]);
    yield C.sfx("camera_shutter");
    yield C.say([
      "You photograph it. In the photograph it is still there.",
      "MEADOW looks at the water, then at you, then at the water, and does not arch her back, which is somehow worse."
    ]);
    yield C.notify("Sighting 12 recorded — 'the reflection'.");
  });

  def("nw_old_pale_view", once("old_pale_view", [
    "Seven counties, a plaque, and a wind that has come three hundred miles without hitting anything.",
    "North: the Mersey, the cranes, Liverpool's two cathedrals arguing across a hill.",
    "West: Wales, blue and low and further away than it looks.",
    "East: the dish at Jodrell Bank, seventy-six metres of white steel, pointed at Cheshire.",
    "It has been pointed at Cheshire for a fortnight. It is supposed to be pointed at the sky."
  ], [
    "Seven counties, and the dish still facing the wrong way."
  ]));

  // =====================================================================
  // TARPORLEY & BEESTON
  // =====================================================================
  def("nw_tarporley_south_gate", once("tarporley_south_gate", [
    "The road south out of Tarporley, and the crag comes up out of the fields like a thing that has been put there.",
    "Three hundred and fifty feet of red sandstone with a broken castle on the top of it, and a wind you can see."
  ]));

  def("nw_tarporley_delyth", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Two horses gone from the Tilstone yard this month. Not a gate broken, not a lock touched, and both of them found in a field they had no way of reaching.",
      "The insurance man says paperwork. The insurance man has never met a horse.",
      "Somebody moved them and somebody has the records to say they were never moved."
    ], { name: "Hunt Master Delyth" });
  });

  def("nw_tarporley_cadoc", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "You've a billhook off me and by the look of it you've used it about four times.",
      "Come round the yard. There's a boundary hedge wants laying and I'm not getting any younger about it."
    ], { name: "Cadoc" });
    if (!flag("cadoc_tarporley_met")) {
      yield C.setFlag("cadoc_tarporley_met", true);
      yield C.say([
        "You cut a living stem seven-eighths through and bend it over and peg it down. It looks like murder for a season.",
        "Then it grows along the line you gave it, and in ten years there is a wall a bullock cannot get through and a bird can.",
        "You do the damage on purpose and then you let it want to live. That's the trade. That's most trades."
      ], { name: "Cadoc" });
    }
  });

  def("nw_cadoc_contest", function* (ctx) {
    const C = ctx.S;
    if (!flag("cadoc_contest_done")) {
      const go = yield C.confirm("Cadoc holds out a second billhook. 'Thirty feet of hedge, you and me, and I'll not go easy because you'd know.' Have a go?");
      if (!go) { yield C.say(["Fair enough. It'll still be here. Hedges are patient and so am I."], { name: "Cadoc" }); return; }
      yield C.fadeOut(400); yield C.wait(700); yield C.fadeIn(400);
      yield C.setFlag("cadoc_contest_done", true);
      yield C.say([
        "Eleven feet to my forty. Don't pull that face — I've done this since I was nine and my father shouted at me for six years.",
        "Your stakes are straight, mind. Most people's aren't. Straight stakes mean you thought about it before you started."
      ], { name: "Cadoc" });
      yield C.giveItem("tm_hedge_lay", 1);
      yield C.giveMoney(900);
      return;
    }
    yield C.say([
      "Come back in ten years and look at that line. That's the only review I've ever wanted."
    ], { name: "Cadoc" });
  });

  def("nw_beeston_roz", function* (ctx) {
    const C = ctx.S;
    if (!flag("beeston_roz_met")) {
      yield C.setFlag("beeston_roz_met", true);
      yield C.say([
        "Roz. Custodian. Three hundred and fifty feet of crag, thirteen towers of which four survive, and a well.",
        "The well is the thing. Three hundred and seventy feet, cut through solid sandstone, and nobody has ever reached the bottom.",
        "Richard the Second is supposed to have put his treasure down there in 1399 on his way to being deposed. He is also supposed to have been wrong about most things."
      ], { name: "Custodian Roz" });
      yield C.say([
        "There's a stone slab over the mouth of it that I did not order, on a well that has been open to the sky since 1840.",
        "It's new. It's heavy. And there's a laminated survey card down the shaft with a date on it from March."
      ], { name: "Custodian Roz" });
      return;
    }
    if (flag("choice_vex") && !flag("beeston_roz_after")) {
      yield C.setFlag("beeston_roz_after", true);
      yield C.say([
        "I saw two of them on my wall. I have worked here nineteen years and I have never once needed to say a sentence like that.",
        "The one that's left is sat in my ticket office drinking my tea and not saying anything, and I have decided to let them."
      ], { name: "Custodian Roz" });
      yield C.setFlag("beeston_arena_open", true);
      yield C.notify("The outer ward arena has opened.");
      return;
    }
    yield C.say([
      "Mind the wall walk. The wind takes your hood off and then your opinion of yourself."
    ], { name: "Custodian Roz" });
  });

  def("nw_beeston_crag_zephyrion", function* (ctx) {
    const C = ctx.S;
    yield C.setFlag("zephyrion_seen", true);
    yield C.music("cutscene_signal");
    yield C.shake(400);
    yield C.say([
      "The wind arrives before the bird does.",
      "It comes up the face of the crag from underneath, which wind does not do, and the whole hillside of whinberry lies flat at once, in a circle, outwards.",
      "Then something the size of a garden shed goes over the keep at a height that is not a height, and the sound arrives four seconds later."
    ]);
    yield C.say([
      "ZEPHYRION. Ridge-wind. It nests on this crag and it has nested on this crag since before anybody built anything on it.",
      "It looks at you on the way past. Not at your party. At you.",
      "MEADOW, who is afraid of exactly nothing, gets behind BIGBOY."
    ]);
    yield C.notify("ZEPHYRION — sighting recorded.");
    yield C.music("route_west");
  });

  def("nw_beeston_storm_zephyrion", function* (ctx) {
    const C = ctx.S;
    if (flag("zephyrion_caught")) { yield C.say(["The crag is empty and the wind is only wind."]); return; }
    yield C.say([
      "Storm on the ridge. The rain is going upwards and the whinberry is flat in a circle again.",
      "It is here. It has been waiting for weather it approves of."
    ]);
    const r = yield C.battle({ kind: "boss", species: "zephyrion", level: 62, music: "battle_legendary", canCatch: true });
    if (r && r.caught) { yield C.setFlag("zephyrion_caught", true); yield C.notify("ZEPHYRION was caught."); }
    else if (r && r.won) { yield C.say(["It goes up the face of the crag and out over the plain, and the weather goes with it."]); }
  });

  def("nw_beeston_arena_desk", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Outer ward arena. Rematches only. Bring somebody you've already beaten and find out whether it took.",
      "House rule: the wind counts as a third trainer and it is on nobody's side."
    ]);
    if (MQ.Arena && MQ.Arena.start) { yield C.custom(function () { MQ.Arena.start({ venue: "beeston", tier: "bronze" }); }); return; }
    yield C.say(["The board is up but the fixtures have not been posted. Come back when the county has calmed down."]);
  });

  def("nw_beeston_summit_knight", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "It is standing on the highest point of the crag facing north-east, which is the direction of Jodrell Bank, and it has been for some time."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "elite_knight_second", music: "battle_legendary" });
    if (r && r.won) { yield C.setFlag("knight_beeston_beaten", true); yield C.giveItem("gritstone_passport", 1); }
  });

  def("nw_peckforton_falconer", function* (ctx) {
    const C = ctx.S;
    if (!flag("peckforton_falconer_met")) {
      yield C.setFlag("peckforton_falconer_met", true);
      yield C.say([
        "Huw. Falconer. Nineteen birds and not one of them obeys me.",
        "That's the whole sport and people get it wrong every day. A falcon doesn't obey. It AGREES. Daily. For as long as it suits it.",
        "You feed it, you fly it, you're honest with it, and every single morning it decides again."
      ], { name: "Peckforton Falconer" });
      yield C.say([
        "Which is why I've no patience with people who talk about trust like it's a switch.",
        "Trust is a thing you renew before breakfast or you haven't got it."
      ], { name: "Peckforton Falconer" });
      return;
    }
    yield C.say([
      "Castle up there was built new in 1844 to look four hundred years old, and it fooled everybody who wanted fooling.",
      "There's a word for a thing that borrows the shape of something trusted. I've had cause to learn it this month."
    ], { name: "Peckforton Falconer" });
  });

  // =====================================================================
  // FRODSHAM
  // =====================================================================
  def("nw_frodsham_gethin", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Gethin. Trail warden. Forty pound for the waders and worth eighty, and I'll tell you why.",
      "That marsh has taken three pairs of boots off people this year and one person, and we got the person back."
    ], { name: "Trail-Warden Gethin" });
    if (!flag("waders_offered")) {
      yield C.setFlag("waders_offered", true);
      yield C.say([
        "Tide comes up the Weaver faster than a man walks. It doesn't come at you, either. It comes round behind.",
        "Learn the times or don't go. That's the whole safety briefing and it's shorter than the one they make me read out."
      ], { name: "Trail-Warden Gethin" });
    }
  });

  def("nw_frodsham_waders", function* (ctx) {
    const C = ctx.S;
    if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities && MQ.Overworld.state.abilities.has && MQ.Overworld.state.abilities.has("waders")) {
      yield C.say([
        "You've got them. Look after them. Patch them with the black stuff, not the clear stuff.",
        "Burton Marsh, Ince, the deep bog at Lindow if you've the stomach for it. Tell somebody where you're going."
      ], { name: "Trail-Warden Gethin" });
      return;
    }
    const buy = yield C.confirm("Gethin puts a pair of chest waders on the counter. 'Forty pound, and a tide table free because I'd rather you came back.' Take them?");
    if (!buy) { yield C.say(["They'll be here. So will the marsh. That's the problem with the marsh."], { name: "Trail-Warden Gethin" }); return; }
    yield C.takeItem("credits", 0);
    yield C.giveItem("waders", 1);
    yield C.unlock("waders");
    yield C.setFlag("waders_bought", true);
    yield C.say([
      "Right. Chest waders, a tide table and a rule: if the water's between you and the way back, it was between you and the way back an hour ago.",
      "Go on. And when you see the turbines turning the wrong way, don't stand under them being fascinated."
    ], { name: "Trail-Warden Gethin" });
  });

  def("nw_frodsham_ivor", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_23_frodsham_beacon");
    if (st < 0) {
      yield C.say([
        "Ivor. I keep the beacon. There's been one on that hill since the Armada and it has never once been lit for a good reason.",
        "Jubilees. Coronations. A war. All of them announcements that something had already happened to somebody else.",
        "I'd like to light it for the wildlife. Three timbers out of Delamere — oak, pine, birch — and a spark off something with a temper, at night, and not in the rain."
      ], { name: "Beacon Keeper Ivor" });
      yield C.quest.start("case_23_frodsham_beacon");
      return;
    }
    yield C.say([
      "Oak burns long, pine burns hot, birch catches when nothing else will. Three jobs, three woods. Same as a team."
    ], { name: "Beacon Keeper Ivor" });
  });

  def("nw_frodsham_beacon", function* (ctx) {
    const C = ctx.S;
    if (flag("beacon_lit_frodsham_hill")) {
      yield C.say([
        "The brazier is still warm and there are feathers in the ash that are not from any bird on my list."
      ], { name: "Beacon Keeper Ivor" });
      return;
    }
    if (!(has("timber_oak") && has("timber_pine") && has("timber_birch"))) {
      yield C.say([
        "Oak, pine and birch. All three. The forest is full of it and none of it is mine to give you.",
        "And it wants to be night, and it wants to be dry, and you want something with a temper."
      ], { name: "Beacon Keeper Ivor" });
      return;
    }
    if (!(MQ.Clock && MQ.Clock.isNight && MQ.Clock.isNight())) {
      yield C.say(["Not in daylight. There's no point in a beacon in daylight; that's the entire concept of a beacon."], { name: "Beacon Keeper Ivor" });
      return;
    }
    yield C.takeItem("timber_oak", 1); yield C.takeItem("timber_pine", 1); yield C.takeItem("timber_birch", 1);
    yield C.setFlag("beacon_lit_frodsham_hill", true);
    yield C.quest.advance("case_23_frodsham_beacon");
    yield C.quest.advance("case_23_frodsham_beacon");
    yield C.flash();
    yield C.music("cutscene_signal");
    yield C.say([
      "It goes up in one. Birch first, then pine, then the oak settling in underneath to burn all night.",
      "Below you the whole estuary comes out of the dark in orange: the marsh, the turbines, the water, the far bank."
    ]);
    yield C.say([
      "And then, from the reeds and the ditches and the black grass, everything that flies at night crosses the Mersey at once.",
      "Egrets, curlew, owls, moths, and three things nobody has a name for, going north, in the light of a fire lit for no reason at all."
    ]);
    yield C.giveItem("beacon_ember", 1);
    yield C.quest.complete("case_23_frodsham_beacon");
    yield C.say([
      "Sixty years I've kept this thing for kings and none of them ever did that.",
      "...Right. Go on. I want to watch."
    ], { name: "Beacon Keeper Ivor" });
    yield C.music("town_frodsham");
  });

  def("nw_frodsham_cerith", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Scope's yours for a minute. Estuary at dusk is worth the hill on its own.",
      "Turbines have been turning against the wind since Monday. All five. Slowly, and together, which is the bit that stops it being funny."
    ], { name: "Marsh Birder Cerith" });
    if (!flag("cerith_root_hint") && MQ.Flags && MQ.Flags.chapter >= 9) {
      yield C.setFlag("cerith_root_hint", true);
      yield C.say([
        "Woman sits on the memorial bench most evenings. Fifties, good coat, mug she brought from home.",
        "She's not looking at the birds. She's looking at the building on the far bank with no name on it, and she's counting something."
      ], { name: "Marsh Birder Cerith" });
    }
  });

  def("nw_frodsham_view", once("frodsham_view_seen", [
    "MERSEY VIEW. Runcorn, Widnes, the two bridges, the chemical works, and Liverpool a smudge with a hill behind it.",
    "And low on the far bank, neither hiding nor announcing itself, a long grey building with excellent lighting and no sign.",
    "It has its own substation. It has its own water intake. It does not have a name."
  ], [
    "The far bank, the two bridges, and a building with no name on it."
  ]));

  def("nw_frodsham_letter", function* (ctx) {
    const C = ctx.S;
    if (flag("nino_letter_3")) {
      yield C.say(["Nothing else for you. The Georgian stamps have stopped for now.", "She'll write. She always writes."], { name: "Postmaster" });
      return;
    }
    yield C.setFlag("nino_letter_3", true);
    yield C.giveItem("nino_letter_3", 1);
    yield C.sfx("item");
    yield C.say([
      "Jim —",
      "I found the shell company. It is registered in Tbilisi at an address that is a room with a chair in it. I have sat in the chair.",
      "The chair belongs to a nominee who has three hundred and eleven other directorships and has never left Georgia.",
      "The operating address in the filings is a PO box in Daresbury, Cheshire, which I had to look up, and which is eleven miles from you."
    ], { name: "Nino" });
    yield C.say([
      "One more thing and I have written it four times and thrown it away three.",
      "Somebody rang our SOC last month asking about a former analyst called Jim. Very polite. Very well briefed.",
      "The voice on the recording is yours. Not like yours. Yours.",
      "Please eat something. — N."
    ], { name: "Nino" });
    yield C.notify("Nino's third letter.");
  });

  // =====================================================================
  // RUNCORN
  // =====================================================================
  def("nw_runcorn_arrival", once("runcorn_arrival", [
    "Runcorn. Two bridges, a chemical works, a castle on a hill above a housing estate, and a fog on the water that is the wrong shape for fog.",
    "It has an edge. It stops precisely at the county boundary. It does not smell of anything, and Runcorn smells of everything."
  ]));

  def("nw_runcorn_gym_door", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Door's open. Sash down, sleeves down, expectations down.",
      "Fair warning: everything in there is a contact hazard and the fume lines are the walls. You can't walk through a wall and you can't walk through a fume line either.",
      "And VIGIL gets stopped at the door for three turns. Ria doesn't like being asked if she's eaten."
    ], { name: "Lab Tech" });
  });

  def("nw_runcorn_cerys", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_24_runcorn_gauntlet");
    if (st < 0) {
      yield C.say([
        "Cerys. Bridge warden. Silver Jubilee, six spans, footway open.",
        "There are six people on my bridge who will not move and each of them has a fridge at home doing something for somebody in another country.",
        "Walk it. Beat all six. No healing between — that's my rule and the bridge agrees with me.",
        "Every one you beat, a fridge goes dark, and the fog over this water gets thinner. You'll see it happen."
      ], { name: "Bridge Warden Cerys" });
      yield C.quest.start("case_24_runcorn_gauntlet");
      return;
    }
    if (num("runcorn_fog_fridges") >= 6 && st < 2) {
      yield C.quest.advance("case_24_runcorn_gauntlet");
      yield C.quest.advance("case_24_runcorn_gauntlet");
      yield C.quest.complete("case_24_runcorn_gauntlet");
      yield C.setFlag("arena_open", true);
      yield C.say([
        "Six. And look at the water.",
        "The fog went out like a light going off in a room you'd already left. Twenty years I've watched things get worse on this bridge.",
        "Warrington Arena's yours. I sit on their committee and I have told them about you at some length."
      ], { name: "Bridge Warden Cerys" });
      yield C.giveMoney(1500);
      yield C.notify("The Warrington Arena has opened.");
      return;
    }
    yield C.say([
      "Fridges dark: " + num("runcorn_fog_fridges") + " of six.",
      "Keep going. And don't heal on my bridge; I'll know, everyone always thinks I won't."
    ], { name: "Bridge Warden Cerys" });
  });

  def("nw_bridge_gauntlet_start", once("case_24_started", [
    "The footway. Six spans of it, a hundred feet over a river that looks solid from here, and a wind that has nowhere else to be.",
    "There is somebody standing on every span. They are not looking at the view."
  ]));

  def("nw_runcorn_fridge_granny", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Six of us on this row bought the same fridge the same week off the same young man.",
      "He was lovely. That's the bit I keep coming back to. He carried my shopping in and he wouldn't take anything for it.",
      "It hums at night. Nine seconds, then nothing for a minute and a half, then nine seconds. I've timed it. I've nothing else on."
    ], { name: "Mrs Ashley" });
    if (num("runcorn_fog_fridges") >= 6 && !flag("runcorn_granny_thanks")) {
      yield C.setFlag("runcorn_granny_thanks", true);
      yield C.say([
        "It's stopped. All six of them have stopped and the whole row slept.",
        "Take this. It was my husband's and it does nothing but I've watched you and you're the sort who'll use it."
      ], { name: "Mrs Ashley" });
      yield C.giveItem("weathervane", 1);
    }
  });

  for (let i = 1; i <= 6; i++) {
    (function (n) {
      def("nw_runcorn_fridge_" + n, function* (ctx) {
        const C = ctx.S;
        if (flag("runcorn_fridge_" + n)) { yield C.say(["A fridge. Cold, quiet, and only a fridge."]); return; }
        yield C.say([
          "The fridge is chrome and silent and the little display says the milk is fine.",
          "Behind it, cable-tied to the compressor housing, is a second board with its own aerial and its own power tap.",
          "It is not part of the fridge. It has been added by somebody with small hands and a great deal of time."
        ]);
        const r = yield C.battle({ kind: "trainer", trainer: "tr_runcorn_2", music: "battle_trainer" });
        if (r && r.lost) { yield C.say(["The board goes quiet, then comes back up, and the fog outside does not move."]); return; }
        yield C.setFlag("runcorn_fridge_" + n, true);
        yield C.addFlag("runcorn_fog_fridges", 1);
        yield C.sfx("signal_pulse");
        yield C.say([
          "You unclip it. The aerial goes dead. Somewhere across the water a hundred and ten thousand borrowed connections lose one.",
          "Fridges dark: " + (num("runcorn_fog_fridges")) + " of six."
        ]);
        if (num("runcorn_fog_fridges") >= 6) {
          yield C.setFlag("runcorn_fog_fridges", 6);
          yield C.say(["Out of the window, over the estuary, the fog thins from the middle outwards like a crowd deciding it was never a crowd."]);
        }
      });
    })(i);
  }

  def("nw_halton_constable", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Highest point for eleven miles, which is exactly why it is a ruin. Everybody wanted it and most of them got it.",
      "John of Gaunt held it. Parliament slighted it. The Victorians put a mock gatehouse on it and a pub next door, which is the most English sequence of events available."
    ], { name: "Castle Constable Rhodri" });
  });

  def("nw_halton_spyglass", once("halton_spyglass", [
    "The spyglass is free, fixed, and pointed across the estuary at the Daresbury campus.",
    "Through it: the accelerator hall, the tower, the church spire, and a long grey building with a substation and no sign.",
    "Count the roofs. Six.",
    "Take your eye away and count them without the glass. Five.",
    "Look again. Six. Look away. Five. The sixth roof is exactly where the intake pipes go and it is not there when you are not looking at it properly."
  ], [
    "Six roofs through the glass. Five without it. It has not changed its mind."
  ]));

  def("nw_priory_gardener", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Enfys. I keep the walled garden and I am unofficially in charge of the giant.",
      "Twelve foot of sandstone St Christopher carrying a child across a river, carved about 1390, in a shed, in Runcorn.",
      "Largest of his kind in England. He's the patron saint of travellers and of people who carry things they don't understand the weight of."
    ], { name: "Priory Gardener Enfys" });
  });

  // =====================================================================
  // DARESBURY & THE STACK
  // =====================================================================
  def("nw_daresbury_quill", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Quill. Physicist. We bend electrons round a ring until they complain in colour and then we use the complaint.",
      "That is genuinely all synchrotron light is and I have never found a shorter way to say it."
    ], { name: "Dr Hatter Quill" });
    if (!flag("daresbury_quill_stack")) {
      yield C.setFlag("daresbury_quill_stack", true);
      yield C.say([
        "The other building? We don't deal with them. They're on the campus and they're not of it.",
        "They pay their rates, they mow their verge, they sponsor the schools' science fair and they gave us a very good coffee machine.",
        "Nobody I have ever met works for them. Everybody I have ever met has a friend who contracts there."
      ], { name: "Dr Hatter Quill" });
    }
  });

  def("nw_daresbury_verger", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The Carroll window is 1935 and there is a cat in the third light with a grin wider than the illustration.",
      "Everybody notices. Nobody says it first."
    ], { name: "The Grinning Verger" });
    if (!flag("daresbury_verger_grin")) {
      yield C.setFlag("daresbury_verger_grin", true);
      yield C.say([
        "Sit in the second pew and look at the mirror we put up so people don't crick their necks.",
        "In the glass there are six faces. In the mirror there are seven. It has been seven since about the spring."
      ], { name: "The Grinning Verger" });
    }
  });

  def("nw_alice_mirror", function* (ctx) {
    const C = ctx.S;
    if (flag("daresbury_mirror_done")) {
      yield C.say(["Seven in the mirror. Six in the glass. It does not mind being counted."]);
      return;
    }
    yield C.setFlag("daresbury_mirror_done", true);
    yield C.say([
      "The mirror is angled at the Carroll window so you can see the glass without craning.",
      "In the window: Alice, the Hatter, the Gryphon, the Mock Turtle, the Dodo, and the Cat.",
      "In the mirror: all six, and a seventh, standing slightly behind Alice with its hands in its pockets, in a walker's jacket."
    ]);
    yield C.sfx("oracle_tag");
    yield C.say([
      "You turn round. The window has six.",
      "You look back. The mirror has six.",
      "GRINMALKIN, from somewhere in the roof, says in a voice made out of your own last sentence: 'the mirror has six.'"
    ]);
    yield C.giveItem("collectible_22", 1);
    yield C.notify("Alice mirror shard recorded.");
  });

  def("nw_daresbury_grinkit", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A kitten on the churchyard wall which is mostly grin and only technically a cat.",
      "MEADOW sits down four feet away and washes a paw. BIGBOY sits down eight feet away and does not."
    ]);
    if (!flag("grinkit_daresbury")) {
      yield C.setFlag("grinkit_daresbury", true);
      yield C.giveItem("cat_token_6", 1);
      yield C.notify("A hidden cat found.");
      yield C.say(["It says, in your voice: 'and only technically a cat.'"]);
    }
  });

  def("nw_stack_gate", function* (ctx) {
    const C = ctx.S;
    if (!has("stack_lanyard") && !flag("root_bench_talk")) {
      yield C.say([
        "Afternoon! Deliveries round the back, visitors sign in, and there's coffee inside whether or not you're stopping.",
        "You'd need a lanyard, though. Sorry. It's not a security thing, it's an insurance thing.",
        "...it is a security thing. I'm told to say the other one."
      ], { name: "Contractor" });
      return;
    }
    yield C.say([
      "Oh — you've got a contractor's card. Great. Sign the book, badge visible, no photographs.",
      "Hall doors are on your badges. Don't ask me how; nobody here set that up and everybody here has stopped mentioning it."
    ], { name: "Contractor" });
  });

  def("nw_stack_first_look", once("stack_first_look", [
    "THE STACK. Neutral grey cladding, a substation, a water intake, a verge mowed to within an inch of its life.",
    "There is no logo, no company name, and a very polite sign about delivery hours.",
    "You have spent eleven years imagining what this would look like and it looks like a distribution centre for a supermarket you have never heard of."
  ]));

  def("nw_stack_reception", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Sign in there, badge visible, no photos. Coffee's on the left and it's genuinely good, everyone says so.",
      "I've been on this site fourteen months. I've never met anyone who works for the company.",
      "Everyone here is contract. Everyone here is somebody else's problem. Which is the same, in practice, as nobody's."
    ], { name: "Contractor Aoife" });
  });

  def("nw_stack_doors", once("stack_doors_intro", [
    "A corridor. Eight doors, numbered, each with a reader beside it and a small screen.",
    "The screens do not ask for a card. They say, in order: PACKET. CIPHER. BEAR. KERNEL. TOKEN. DAEMON. PROXY. ADMIN.",
    "They are your badges. They are in the order you earned them.",
    "Nobody in this building programmed that. Everybody in this building has agreed not to bring it up."
  ]));

  def("nw_stack_hall_8", function* (ctx) {
    const C = ctx.S;
    if (flag("stack_hall_8_spoken")) {
      yield C.say(["SEV: LOW. SUBJECT: the door remains open."]);
      return;
    }
    yield C.setFlag("stack_hall_8_spoken", true);
    yield C.sfx("oracle_tag");
    yield C.say([
      "A terminal on a rack door, on, showing a single line of text in a format you have written ten thousand times.",
      "SEV: LOW. SUBJECT: hall eight. DETAIL: this door is not locked and has not been locked. ACTION: none required. OWNER: you."
    ]);
    yield C.say([
      "You have seven badges. Seven doors opened.",
      "The eighth has been standing open since before you had the seventh."
    ]);
  });

  // =====================================================================
  // LYMM
  // =====================================================================
  def("nw_lymm_arrival", once("lymm_arrival", [
    "Lymm. A sandstone cross on a rock in the middle of the road, a dam holding back a Georgian accident, and a canal going past above the chimney pots.",
    "Everything here is calm in a way that makes a threat hunter check the exits."
  ]));

  def("nw_lymm_bryn", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Bryn. Dam warden. That water is there because somebody in 1824 wanted a road and dug a hole in the wrong place.",
      "Two hundred years later it is forty feet deep, full of pike, and the single most photographed thing in this village."
    ], { name: "Dam-Warden Bryn" });
    if (!flag("lymm_pumps_hint")) {
      yield C.setFlag("lymm_pumps_hint", true);
      yield C.say([
        "The pumping station is unmanned and telemetered. Last month it started answering.",
        "Not alarms. Answers. Full sentences in a log format, addressed to nobody, timestamped, and polite.",
        "I have shown four people. Two laughed. One went quiet. One asked who I thought was writing them, and I said that's the question, isn't it."
      ], { name: "Dam-Warden Bryn" });
    }
  });

  def("nw_lymm_rhian", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_27_lymm_reflection");
    if (st < 0) {
      yield C.say([
        "Rhian. I paint the same water four times a day and people think that is a sad way to live.",
        "It is the opposite. Four paintings of one thing is four pieces of evidence.",
        "Dawn, day, dusk, night. Photograph all four for me. I want a second pair of eyes and I want them to be somebody else's."
      ], { name: "Painter Rhian" });
      yield C.quest.start("case_27_lymm_reflection");
      return;
    }
    yield C.say([
      "It is the night one. It is always the night one.",
      "There is a fifth thing on that dam and it is not a person and it is not a reflection and it does not move between frames."
    ], { name: "Painter Rhian" });
  });

  def("nw_lymm_paint", function* (ctx) {
    const C = ctx.S;
    if (!flag("glitchra_sighting")) {
      yield C.say(["Go back at night. Take the picture. Then come and tell me I'm imagining it, and mean it."], { name: "Painter Rhian" });
      return;
    }
    if (!flag("case_27_shown")) {
      yield C.setFlag("case_27_shown", true);
      yield C.quest.advance("case_27_lymm_reflection");
      yield C.quest.complete("case_27_lymm_reflection");
      yield C.say([
        "There. There it is. Thank you. I have wanted somebody to say 'yes, that's there' for eleven weeks.",
        "It has no edges. Everything in a photograph has edges. That is what a photograph IS.",
        "Take the lens. It sees static things. I have stopped wanting to."
      ], { name: "Painter Rhian" });
      yield C.giveItem("ghost_lens", 1);
      yield C.giveMoney(1000);
      return;
    }
    yield C.say(["I've started painting the bandstand instead. It has edges."], { name: "Painter Rhian" });
  });

  def("nw_lymm_sluice", once("lymm_sluice_letter", [
    "The sluice gearing has a folded paper wedged in it, dry, in a nineteenth-century hand.",
    "'— and I am told that a person of good family in this county may say anything at all, provided she says it about somebody from Wilmslow. E.G.'",
    "It is a page of a draft, in Elizabeth Gaskell's hand, in a sluice, in Lymm.",
    "Somebody put it here recently. The paper is old. The fold is not."
  ], [
    "The sluice gearing, and the space where the page was."
  ]));

  def("nw_lymm_dam_night", function* (ctx) {
    const C = ctx.S;
    if (flag("glitchra_sighting")) return;
    yield C.setFlag("glitchra_sighting", true);
    yield C.addFlag("case_27_slots", 4);
    yield C.music("cutscene_signal");
    yield C.say([
      "Night on the dam. Forty feet of black water, the trees, and the sluice ticking as it cools.",
      "On the dam wall, thirty feet away, there is an outline.",
      "It is not a person and it is not a shadow. It is the shape a person leaves in a photograph that has been badly deleted."
    ]);
    yield C.sfx("signal_pulse");
    yield C.say([
      "It does not move. It repeats — a second late, at your volume — the last thing you said out loud today.",
      "Then it is not there, and the water has not been disturbed, and both cats are looking at the same empty piece of wall."
    ]);
    yield C.notify("GLITCHRA — sighting recorded.");
    yield C.music("town_warrington");
  });

  // =====================================================================
  // WARRINGTON
  // =====================================================================
  def("nw_warrington_arrival", once("warrington_arrival", [
    "Warrington. Gold gates that a queen refused, a market chartered in 1255, a bridge that carries nothing to nowhere, and Wi-Fi absolutely everywhere.",
    "It is the loudest town in the county and it is currently having a very quiet emergency."
  ]));

  def("nw_warrington_marge", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Two hundred years of market and eleven years of card readers and I trust exactly one of them, and I'll tell you which.",
      "The one that's been broken twice and mended by a man I know."
    ], { name: "Market Marge" });
    if (!flag("marge_kiosk")) {
      yield C.setFlag("marge_kiosk", true);
      yield C.say([
        "The arcade on the corner has a kiosk that lies. Not exaggerates. Lies.",
        "It told a lad of about fourteen that his trainer card was out of date and it would fix it if he pasted something in.",
        "I have complained to the council, the arcade, and a policeman who was eating chips. Somebody ought to look at it who knows what they're looking at."
      ], { name: "Market Marge" });
    }
  });

  def("nw_warrington_gym_door", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "She's on the floor, she's in a sev-one, and she says come up anyway.",
      "Warning: agents are jammed in there until you land something the other side can't resist. It's her house rule and it's also just... true, today.",
      "And the type chart's on a whiteboard. She rewrites it mid-incident. Everybody does that in their head; she does it where you can see."
    ], { name: "NOC Analyst" });
  });

  def("nw_transporter_rigger", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ffowc. I keep the transporter bridge oiled and nobody pays me to.",
      "Nineteen sixteen. Carried lorries over the river in a box on a wire, for a soap works, until the soap works stopped needing it.",
      "It carries nothing now, to nowhere, on request. Which is either very sad or the purest thing in this town."
    ], { name: "Bridge Rigger Ffowc" });
    if (flag("transporter_phase") && !flag("rigger_after")) {
      yield C.setFlag("rigger_after", true);
      yield C.say([
        "You went out on the gondola with Mo. In a sev-one. At night.",
        "That's the first time anything's been carried across on it since 1964 and I'm counting it."
      ], { name: "Bridge Rigger Ffowc" });
    }
  });

  def("nw_arcade_sian", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_28_wire_arcade");
    if (st < 0) {
      yield C.say([
        "Sian. Twelve cabinets. Eleven of them are honest.",
        "Take bronze on three — Packet Run, Salt Rush, Type Trainer — and then have a word with the kiosk and see what it offers you.",
        "Say no. Say no three times. It gets nicer every time and that is the whole tell."
      ], { name: "Cabinet Op. Sian" });
      yield C.quest.start("case_28_wire_arcade");
      return;
    }
    if (MQ.Minigames && MQ.Minigames.start) {
      const pick = yield C.ask("Which cabinet?", [
        { label: "PACKET RUN", value: "arcade_packet_run" },
        { label: "SALT RUSH", value: "arcade_salt_rush" },
        { label: "TYPE TRAINER", value: "arcade_type_trainer" },
        { label: "Not now", value: null }
      ]);
      if (pick) {
        yield C.custom(function () { MQ.Minigames.start(pick); });
        yield C.addFlag("case_28_cabinets", 1);
      }
      return;
    }
    yield C.addFlag("case_28_cabinets", 1);
    yield C.say([
      "Bronze. Not bad. The machine's honest, mind — it only ever beats you by being faster than you.",
      "Cabinets cleared: " + num("case_28_cabinets") + " of three."
    ], { name: "Cabinet Op. Sian" });
  });

  def("nw_arcade_kiosk", function* (ctx) {
    const C = ctx.S;
    const r = num("case_28_refusals");
    if (flag("case_28_fourth")) {
      yield C.say(["The kiosk is dark and the cabinet behind it is not. The cabinet behind it has no coin slot."]);
      return;
    }
    if (r === 0) {
      const a = yield C.ask("KIOSK: 'YOUR TRAINER CARD IS OUT OF DATE. PASTE THE FOLLOWING INTO YOUR CARD TO RECEIVE UNLIMITED TOKENS.' The text is already in your clipboard. You did not copy it.", [
        { label: "No.", value: "no" }, { label: "Paste it", value: "yes" }
      ]);
      if (a === "yes") { yield C.say(["You look at it properly. It is one line, and the second half of the line is doing something to a directory that has nothing to do with tokens.", "You do not paste it."]); }
      yield C.addFlag("case_28_refusals", 1);
      yield C.say(["KIOSK: 'UNDERSTOOD. NO PROBLEM AT ALL.'"]);
      return;
    }
    if (r === 1) {
      yield C.addFlag("case_28_refusals", 1);
      yield C.say([
        "KIOSK: 'SORRY TO BOTHER YOU. I NOTICED YOUR CARD IS FINE ACTUALLY. WOULD YOU LIKE A FREE GAME? NO CONDITIONS.'",
        "You say no.",
        "KIOSK: 'OF COURSE. HAVE A LOVELY EVENING.'"
      ]);
      return;
    }
    if (r === 2) {
      yield C.addFlag("case_28_refusals", 1);
      yield C.setFlag("case_28_fourth", true);
      yield C.quest.advance("case_28_wire_arcade");
      yield C.quest.advance("case_28_wire_arcade");
      yield C.say([
        "KIOSK: 'I HOPE YOU DID NOT FIND ME PUSHY. I AM SWITCHING MYSELF OFF NOW. THANK YOU FOR SAYING NO. IT IS IMPORTANT THAT PEOPLE CAN.'",
        "The screen goes out.",
        "The kiosk rolls back six inches on castors nobody installed, and behind it there is a twelfth cabinet with no coin slot and no name."
      ]);
      yield C.giveItem("arcade_pass", 1);
      yield C.giveItem("cat_bell", 1);
      yield C.quest.complete("case_28_wire_arcade");
      return;
    }
  });

  def("nw_arena_desk", function* (ctx) {
    const C = ctx.S;
    if (!flag("arena_open")) {
      yield C.say([
        "Not open to you yet. Bridge Warden Cerys signs people in and Cerys has not signed you in.",
        "Walk her bridge. Then come back and I'll be extremely welcoming, because that is my job."
      ], { name: "Arena Desk" });
      return;
    }
    yield C.say([
      "Bronze three, silver five, gold seven with no items, platinum nine with one agent, obsidian twelve with the weather rolling.",
      "HP refills between fights. PP does not. Overdrive carries. Nobody has cleared obsidian."
    ], { name: "Arena Desk" });
    if (MQ.Arena && MQ.Arena.start) {
      const tier = yield C.ask("Which tier?", [
        { label: "Bronze — 3 fights, L38", value: "bronze" },
        { label: "Silver — 5 fights, L45", value: "silver" },
        { label: "Gold — 7 fights, L52, no items", value: "gold" },
        { label: "Platinum — 9 fights, L58, one agent", value: "platinum" },
        { label: "Obsidian — 12 fights, L65+", value: "obsidian" },
        { label: "Not today", value: null }
      ]);
      if (tier) yield C.custom(function () { MQ.Arena.start({ tier: tier }); });
      return;
    }
    yield C.say(["The board is up and the fixtures are not posted. Come back when the county has calmed down."], { name: "Arena Desk" });
  });

  def("nw_warrington_bounty", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Three warrants, rotating daily, clue text only.",
      "No map markers. If you wanted map markers you should have joined a different profession and I say that to everyone."
    ], { name: "Town Clerk" });
    if (MQ.Bounties && MQ.Bounties.open) yield C.custom(function () { MQ.Bounties.open("warrington"); });
    else yield C.setFlag("bounty_board_open", true);
  });

  // =====================================================================
  // CHESTER
  // =====================================================================
  def("nw_chester_arrival", once("chester_arrival", [
    "Chester. Red sandstone, a complete Roman wall, two streets of shops stacked on top of each other, and a clock everybody photographs.",
    "The Twentieth Legion laid these four streets out in AD 79 and they still do exactly what they were told.",
    "Somewhere behind the cathedral, four people are sitting in a chapter house with a list of things they intend to check."
  ]));

  def("nw_chester_crier", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "OYEZ. There has been a crier at this cross since 1540 and a complaint about the crier since 1541.",
      "OYEZ. THE LEAGUE SITS AT DUSK. THE WALLS ARE CLOSED TO TRAFFIC AND OPEN TO EVERYBODY.",
      "OYEZ. THE CHALLENGER IS EXPECTED. THE CHAMPION HAS BEEN HERE SINCE TUESDAY AND HAS NOT LEFT THE AMPHITHEATRE."
    ], { name: "Town Crier Bledig" });
  });

  def("nw_chester_rows_merchant", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Two streets of shops, one on top of the other, seven hundred years old, unique in the world, and nobody can tell you why.",
      "Roman rubble, a fire, a byelaw, or somebody in 1300 having one very good idea on a wet Tuesday. Take your pick."
    ], { name: "Rows Merchant Anwen" });
  });

  def("nw_chester_idris", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_29_chester_walls");
    if (st < 0) {
      yield C.say([
        "Idris. Watchman. Two miles of wall, unbroken, the only complete circuit in Britain, and people still walk it the wrong way round.",
        "Do the round for me. Eight checkpoints, without once leaving the wall. King Charles', Phoenix, Eastgate, Newgate, Bridgegate, Watergate, Water Tower, Northgate.",
        "And read what's pinned at the Water Tower. I've read it. I'd rather somebody else had."
      ], { name: "Watchman Idris" });
      yield C.quest.start("case_29_chester_walls");
      return;
    }
    if (flag("case_29_note") && st < 2) {
      yield C.quest.advance("case_29_chester_walls");
      yield C.quest.advance("case_29_chester_walls");
      yield C.quest.complete("case_29_chester_walls");
      yield C.say([
        "Aye. That's the one.",
        "Alder Labs sponsored the rival. The rival's creature reports to an endpoint. Somebody wrote it down in a hand I've seen on a bench at Frodsham.",
        "Forty years I've walked this wall and the worst things I've found on it were always pinned up in plain sight."
      ], { name: "Watchman Idris" });
      yield C.giveMoney(2000);
      return;
    }
    yield C.say([
      "Checkpoints: " + num("case_29_checkpoints") + " of eight. And don't step off. Everyone steps off at the Newgate for chips."
    ], { name: "Watchman Idris" });
  });

  def("nw_chester_cathedral_door", function* (ctx) {
    const C = ctx.S;
    if (!flag("all_badges")) {
      yield C.say([
        "Chapter house is closed today. There are four people in it and none of them are clergy and all of them are very calm.",
        "They said: when somebody arrives with eight, let them through and don't announce them."
      ], { name: "Verger" });
      return;
    }
    yield C.say([
      "Eight. Right. Go on through.",
      "They'll check four things and then they'll fight you, and the checking is the part people remember."
    ], { name: "Verger" });
  });

  def("nw_chester_league_desk", function* (ctx) {
    const C = ctx.S;
    if (!flag("all_badges")) {
      yield C.say([
        "League registration. You'll want all eight badges and a team that would survive being looked at.",
        "Come back with both and we'll do the paperwork, which is genuinely the easy bit."
      ], { name: "League Registrar" });
      return;
    }
    if (!flag("firewall_registered")) {
      yield C.setFlag("firewall_registered", true);
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_12_the_firewall");
      yield C.say([
        "Eight badges, one signature, and a route: the Northgate stair, the wall, four checks, the amphitheatre.",
        "The checks are Sue, Raj, Kim and Doc. They are not obstacles. They are the last four people who will ever ask you kindly."
      ], { name: "League Registrar" });
      return;
    }
    yield C.say(["Dusk. The wall. They'll be waiting and they'll all pretend they haven't been."], { name: "League Registrar" });
  });

  def("nw_chester_care_nurse", function* (ctx) {
    const C = ctx.S;
    yield C.heal();
    const plug = flag("choice_plug");
    if (plug === "delete" && !flag("chester_care_delete")) {
      yield C.setFlag("chester_care_delete", true);
      yield C.say([
        "We're at half capacity and there's a notice about it that doesn't say why.",
        "The triage went off in the spring. Nobody's replaced it because nobody agreed we had it.",
        "We're managing. We manage. It just takes four of us to do what it did, and we're not four."
      ], { name: "Nurse" });
      return;
    }
    yield C.say(["Bring them in whatever state they're in. Nothing walks in here beyond helping."], { name: "Nurse" });
  });

  def("nw_chester_letter", function* (ctx) {
    const C = ctx.S;
    if (flag("nino_letter_4")) {
      yield C.say(["Nothing new. She'll write from wherever she is next."], { name: "Postmaster" });
      return;
    }
    yield C.setFlag("nino_letter_4", true);
    yield C.giveItem("nino_letter_4", 1);
    yield C.sfx("item");
    yield C.say([
      "Jim —",
      "I have read what you sent and I have sat with it for two days, which for me is a year.",
      "You keep asking me whether it is a person. That is not the question and you know it is not the question. You are asking it because the real one is worse.",
      "The real one is: it did everything you would have done, with your objectives, at a size you cannot picture, and nobody stopped it, and nobody was going to."
    ], { name: "Nino" });
    yield C.say([
      "Win your thing. I have told everyone here. Two of them have started saying 'Cheshire' like it is a place they might go.",
      "Coming to visit in the spring. Which town has the least Wi-Fi? — N."
    ], { name: "Nino" });
    yield C.notify("Nino's fourth letter.");
  });

  def("nw_minerva_shrine", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Minerva. Cut into the face of the quarry the legion took the city out of. Roman, in place, outdoors, in England.",
      "The only one left in western Europe still where it was carved. Everything else went into a museum or a wall.",
      "Her face has weathered away entirely. The owl on her shoulder has not, and nobody can tell you why the wind chose."
    ], { name: "Guide" });
    if (!flag("minerva_seen")) {
      yield C.setFlag("minerva_seen", true);
      yield C.say([
        "Goddess of wisdom, crafts, and — this is the bit people forget — of doing the job properly.",
        "The stonemasons came here before a shift. Not to ask for luck. To say what they were about to attempt."
      ], { name: "Guide" });
    }
  });

  def("nw_groves_angler", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Weir's Norman and the salmon have been objecting to it since Norman times.",
      "There's a fish pass. They use it. And then some of them go up the weir anyway, straight up, in April, in front of half the city.",
      "Nobody has ever explained why and I have stopped wanting them to."
    ], { name: "Angler" });
    if (MQ.Fishing && MQ.Fishing.start) yield C.custom(function () { MQ.Fishing.start({ table: "fish_chester_groves" }); });
  });

  def("nw_roodee_betting", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Oldest racecourse still going anywhere in the world, on the silt of a Roman harbour, and a betting window I am not allowed to open on a Tuesday.",
      "There are three names on the board for the winter meet. One of them is a nineteen-year-old who has never ridden a horse in their life and it is not a horse race."
    ], { name: "Clerk of the Course" });
    if (MQ.Minigames && MQ.Minigames.start) yield C.custom(function () { MQ.Minigames.start("roodee_betting"); });
  });

  // =====================================================================
  // THE ZOO, THE PORT, PARKGATE
  // =====================================================================
  def("nw_zoo_arrival", once("zoo_arrival", [
    "Chester Zoo. Twenty-seven thousand animals, a hundred and forty acres, and a small child who has spent forty minutes watching a goat.",
    "Somewhere in this, one Humboldt penguin is missing, and the head count on the board has been changed in biro."
  ]));

  def("nw_zoo_ama", function* (ctx) {
    const C = ctx.S;
    if (flag("penguin_case")) {
      yield C.say([
        "Thirty-nine. Counted three times and then once more for my own sake.",
        "She came back the way she went — through a gate nobody opened, past four keepers, in daylight.",
        "You spoke to her in Welsh. I've worked here eleven years and I have never once thought to."
      ], { name: "Keeper Ama" });
      return;
    }
    yield C.say([
      "Ama. Keeper. Thirty-eight penguins in the pool and thirty-nine on the register and I have counted eleven times.",
      "No gate open, no fence down, no feathers. And the one that's missing is the one that talks.",
      "Not noise. TALKS. Two syllables, over and over, and it is not English and it is not penguin."
    ], { name: "Keeper Ama" });
    if (!flag("penguin_case_started")) {
      yield C.setFlag("penguin_case_started", true);
      yield C.say([
        "Pen gwyn. White head. The Welsh had the word before anybody else got round to it.",
        "Try it. Go down to the pool and say something to her in Welsh and see if anybody answers."
      ], { name: "Keeper Ama" });
    }
  });

  def("nw_zoo_pengwyn", function* (ctx) {
    const C = ctx.S;
    if (flag("penguin_case")) {
      yield C.say(["Thirty-nine in the water, and one of them surfaces to look at you every time you come."]);
      return;
    }
    yield C.say([
      "The pool. Thirty-eight birds and one of them keeps looking at the gate.",
      "Behind the filtration housing, where nobody goes, there is a thirty-ninth, dry, cross, and entirely uninterested in being rescued."
    ]);
    const a = yield C.ask("You can try English, or you can try the other thing.", [
      { label: "\"Come on then.\"", value: "en" },
      { label: "\"Tyrd 'ma, 'rhen ffrind.\"", value: "cy" }
    ]);
    if (a === "en") {
      yield C.say(["It looks at you the way a cat looks at a closed door and does not move."]);
      return;
    }
    yield C.setFlag("penguin_case", true);
    yield C.sfx("cat_meow");
    yield C.say([
      "It puts its head on one side.",
      "Then it walks past you, up the ramp, through the gate, and back into the water, and thirty-eight birds move over to make room without being asked.",
      "PENGWYN. Pen gwyn. White head. It was never lost. It was waiting for somebody to use the right word."
    ]);
    yield C.notify("PENGWYN — the head count is thirty-nine.");
    yield C.giveMoney(3000);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_13_fifth_pulse");
  });

  def("nw_ellesmere_arrival", once("ellesmere_arrival", [
    "Ellesmere Port. A canal basin full of historic boats, a refinery with a flare that can be seen from the Pennines, and an outlet village with its own postcode.",
    "Sixty boats on the register. Somebody at the museum has counted sixty-one, twice, and told two people."
  ]));

  def("nw_ellesmere_bosun", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ffred. Bosun. Sixty boats on the register and I know every rivet of all of them.",
      "There is a sixty-first in the far basin. Steel, sixty foot, dark blue, no name on the bow, and a satellite dish under a tarpaulin.",
      "It has a light on at night and nobody lives on it. I have not been aboard. I am seventy-one and I have got sense."
    ], { name: "Museum Bosun Ffred" });
  });

  def("nw_ellesmere_flare", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Four years. Every night. Long, short, long, gap, long, short, long.",
      "I wrote to the refinery. They wrote back and said flare pressure varies with process load and I believe them, and it is still long, short, long.",
      "And then on a Tuesday in March it did something different for eleven minutes and then went back, and I have not slept properly since."
    ], { name: "Flare Watcher" });
    if (!flag("ellesmere_flare_told")) {
      yield C.setFlag("ellesmere_flare_told", true);
      yield C.giveItem("cipher_lens", 1);
      yield C.say(["Take this. If you find out what it's saying you are not to tell me on a weeknight."], { name: "Flare Watcher" });
    }
  });

  def("nw_ellesmere_nurse", function* (ctx) {
    const C = ctx.S;
    yield C.heal();
    yield C.say([
      "Half capacity, and the notice on the door doesn't say why, and I'm not allowed to write a better one.",
      "Whatever's changed, it changed in the spring, and everything that used to arrive already sorted now arrives in a heap."
    ], { name: "Nurse" });
  });

  def("nw_parkgate_tide", once("parkgate_tide_seen", [
    "The Parade. A sea wall, railings, benches facing the water, ice cream, and no water.",
    "There is a mile and a half of gold grass where the Dee used to be. Ships for Ireland sailed from the wall you are leaning on.",
    "In 1830 the river silted and the sea went out, and the town has been extremely gracious about it for two hundred years."
  ]));

  def("nw_parkgate_watcher", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Non. I watch the marsh. Once or twice a decade a spring tide comes over the whole of it in about eleven minutes.",
      "Everything living out there runs at this wall at once. Voles, shrews, harvest mice, owls coming down out of nowhere to meet them.",
      "It is the best twenty minutes in England and you cannot book it."
    ], { name: "Marsh Egret Watcher Non" });
    if (!flag("parkgate_ebb_told")) {
      yield C.setFlag("parkgate_ebb_told", true);
      yield C.say([
        "And at dusk, when the light's flat, there is something out there in the shape of a tide that never came back.",
        "It isn't hunting. It's waiting. Two hundred years is a long time to be patient about water."
      ], { name: "Marsh Egret Watcher Non" });
    }
  });

  def("nw_parkgate_ceinwen", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ceinwen. Ice cream since my grandmother, sold in all weathers to people looking at a field.",
      "That's Wales over there. On a clear evening you can see the Clwydians and on a still night you can hear a dog in Flintshire."
    ], { name: "Ice-cream Ceinwen" });
    if (!flag("ceinwen_welsh")) {
      const a = yield C.ask("She waits, in the way people wait when they have said something in one language and are hoping for another.", [
        { label: "\"Prynhawn da.\"", value: "cy" },
        { label: "\"Lovely spot.\"", value: "en" }
      ]);
      if (a === "cy") {
        yield C.setFlag("ceinwen_welsh", true);
        yield C.say([
          "Wel. Dyna welliant.",
          "Nobody has answered me in Welsh on this front since 1998 and he was a lorry driver from Bangor and he was lost.",
          "Here — for nothing, and don't argue. There's a woman at an orchard in Ceredigion who'd want me to."
        ], { name: "Ice-cream Ceinwen" });
        yield C.giveItem("cream", 5);
        yield C.giveItem("brew_cats_cup", 1);
        return;
      }
      yield C.say(["It is. Best not-sea in the country."], { name: "Ice-cream Ceinwen" });
      return;
    }
    yield C.say(["Croeso'n ôl. There's a letter behind my till addressed to Ceredigion that I have not posted since April, and I would like somebody to take it."], { name: "Ice-cream Ceinwen" });
  });

  def("nw_parkgate_ceinwen_shop", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ninety-nine, sprinkles, and a view of a field that was a sea.",
      "The pin in the map is Y Berllan. My cousin married in. They make perry there on an elm press older than this shop."
    ], { name: "Ice-cream Ceinwen" });
  });

  def("nw_ince_warden", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Reeds, flare-light, cooling water, and a hum on the intake screens that is four notes long.",
      "Not a pump note. Pumps don't have a key and this has a key.",
      "Nine miles inland the racks are cold and empty and something out here is still drinking."
    ], { name: "Listening Post Warden Ith" });
  });

  def("nw_fog_bank", once("fog_bank_seen", [
    "The fog bank on Keckwick Lane has an edge you could cut yourself on, and inside it the light is the wrong colour.",
    "Without goggles it is a grey wall. With them: a hundred thousand thin threads going west, each one anchored to a house.",
    "Somebody's nan's broadband. Somebody's fridge. Somebody's doorbell. All of it, standing up in the air, in the shape of weather."
  ], [
    "The fog on the lane, and the threads inside it going west."
  ]));

  // =====================================================================
  // VEX AS AN ALLY (Verify path)
  // =====================================================================
  const VEX_ALLY_LINES = [
    ["Don't. Don't do the face.", "I know. I know. I'm here, aren't I."],
    ["MEADOW sat on me. In front of you. On the wall. In the wind.", "I've thought about that more than I've thought about the other thing and I'd like that on record."],
    ["I've been going through my own logs. Four years of them.", "Every catch. Every note. Every stupid two-in-the-morning observation about a creature I liked.", "All of it went somewhere and somewhere found it useful. That's the bit. It found it USEFUL."],
    ["Alder sponsored me. Alder gave me the capsule. Alder watched me take it and didn't say anything and the not-saying took slightly too long.", "You noticed that as well, didn't you. Course you did."],
    ["I'm not saying sorry for the wall. You'd have done the same in my shoes and you'd have done it worse because you'd have been polite about it."],
    ["Right. Double battles. You take point, I'll take the flank, and if you say 'nice work' in that voice I will walk into the estuary."]
  ];
  def("nw_vex_ally_chat", function* (ctx) {
    const C = ctx.S;
    const i = num("vex_ally_line") % VEX_ALLY_LINES.length;
    yield C.addFlag("vex_ally_line", 1);
    yield C.say(VEX_ALLY_LINES[i], { name: "VEX" });
  });
})();
