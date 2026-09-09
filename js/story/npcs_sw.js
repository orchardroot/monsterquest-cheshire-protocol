// =============================================================
// MonsterQuest v2 — region-south-west NPC scripts (MQ.Story.npcScripts).
// Everyone in Nantwich, Hack Green, Y Berllan, the salt towns, the mine,
// Anderton and Great Budworth who talks and is not a chapter beat: the
// casebook givers, the side-content hooks, and the small scenes hung on
// map triggers. Keys are namespaced sw_*. Registration only.
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
  function stage(id) { return MQ.Quests && MQ.Quests.stage ? MQ.Quests.stage(id) : -1; }
  function caught(species) {
    if (!MQ.Trainer || !MQ.Trainer.dex) return false;
    const d = MQ.Trainer.dex[species];
    return !!(d && d.caught);
  }
  // Side systems this region leans on. All of them degrade to a line.
  function fishing(ctx, mapId) {
    return function () {
      if (MQ.Fishing && MQ.Fishing.start) return MQ.Fishing.start({ map: mapId });
      return null;
    };
  }
  function brewing() {
    if (MQ.Brewing && MQ.Brewing.start) return MQ.Brewing.start({ press: "y_berllan_shed" });
    return null;
  }
  function minigame(id, opts) {
    if (MQ.Minigames && MQ.Minigames.start) return MQ.Minigames.start(id, opts || {});
    return null;
  }

  S.SW = { fishing: fishing, brewing: brewing, minigame: minigame };

  // =====================================================================
  // NANTWICH
  // =====================================================================
  def("sw_nantwich_huw", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Huw. Cheesewright. Third generation, and the first two were better at it and I have made my peace with that.",
      "Nantwich cheese wants salt and time and somebody who doesn't fuss. Same as most things."
    ], { name: "Cheesewright Huw" });
    if (!flag("talked_npc_nantwich_huw")) {
      yield C.setFlag("talked_npc_nantwich_huw", true);
      yield C.giveItem("cream", 2);
      yield C.say([
        "Here. Cream, for the cats and for whatever it is you people brew out west.",
        "Aye, I know where you're going. Everyone in this town knows where everyone's going. It's a small town with a big pool."
      ], { name: "Cheesewright Huw" });
      return;
    }
    yield C.say(["Show's Saturday. Bring a bigger bag than you think and a lower opinion of your self-control."], { name: "Cheesewright Huw" });
  });

  def("sw_nantwich_alys", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ten days in December 1583. The whole town, gone, except Churche's Mansion, which was outside the walls and smug about it ever since.",
      "Queen Elizabeth paid for the rebuild out of her own purse and every gable in this town has the date on it to prove she did."
    ], { name: "Fire Warden Alys" });
    if (!flag("alys_told")) {
      yield C.setFlag("alys_told", true);
      yield C.say([
        "You want to know the thing nobody puts on the plaque?",
        "It started in a brewhouse. Somebody left something on the heat and went to do something else.",
        "Ten days. One brewhouse. That's the whole of my job, really: telling people it is always the small thing left running."
      ], { name: "Fire Warden Alys" });
      return;
    }
    yield C.say(["The re-enactment's in January and it is always, always raining, which is historically inaccurate and personally welcome."], { name: "Fire Warden Alys" });
  });

  def("sw_nantwich_wyn", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_17_brine_of_nantwich");
    if (st < 0) {
      yield C.say([
        "Wyn. I keep the pool. Fifty yards of warm brine, open to the sky, and this week nobody will get in it.",
        "Not because of the preacher. Because it's gone CLOUDY, and cloudy in a brine pool is not a thing that happens."
      ], { name: "Lido Keeper Wyn" });
      yield C.say([
        "Three samples off the deep end with a rod and I'd know what I was arguing with.",
        "And then — and I know how this sounds — somebody who can brew will need to make me a Clarifier. There's only one press in the world I trust and it is not in England."
      ], { name: "Lido Keeper Wyn" });
      yield C.quest.start("case_17_brine_of_nantwich");
      return;
    }
    if (st === 0 && has("brine_sample", 3)) {
      yield C.quest.advance("case_17_brine_of_nantwich");
      yield C.say([
        "Three. Good. Hold them up to the light — see the flecks? They move.",
        "Get that brewed at the elm press. Brine sample and an apple and about an hour of somebody's opinion."
      ], { name: "Lido Keeper Wyn" });
      return;
    }
    if (st === 1 && has("brew_clarifier", 1)) {
      yield C.say(["Right. Deep end. Slowly. I'll hold the ladder and complain about it."], { name: "Lido Keeper Wyn" });
      yield C.fadeOut(400); yield C.wait(700); yield C.fadeIn(500);
      yield C.takeItem("brew_clarifier", 1);
      yield C.setFlag("case_17_poured", true);
      yield C.quest.advance("case_17_brine_of_nantwich");
      yield C.say([
        "The cloud goes in about four seconds and what is underneath it is not silt.",
        "It is about nine hundred extremely small salt golems, all of them newly hatched, all of them appalled at the light."
      ]);
      yield C.say([
        "They're SALTLINGS. They're breeding in my pool.",
        "They've come up the brine line from the mine, which means they're Jack's, which means I have to ring Jack, which means I have to hear about subsidence."
      ], { name: "Lido Keeper Wyn" });
      yield C.giveMoney(900);
      yield C.giveItem("brew_clarifier", 2);
      yield C.quest.complete("case_17_brine_of_nantwich");
      yield C.setFlag("lido_free_healing", true);
      yield C.say(["Pool's free to you from now on. Swim in it whenever you like. Bring the big cat; he'll hate it and he'll stay."], { name: "Lido Keeper Wyn" });
      return;
    }
    if (st === 1) { yield C.say(["Clarifier. Brine sample, apple, elm press. I'd go myself but somebody has to watch the water."], { name: "Lido Keeper Wyn" }); return; }
    if (st >= 2) { yield C.say(["Ninety lengths this morning and not one golem. Best week I've had."], { name: "Lido Keeper Wyn" }); return; }
    yield C.say(["Rod, deep end, three samples. And mind the ladder; it's the one thing here I've never fixed."], { name: "Lido Keeper Wyn" });
  });

  def("sw_lido_wyn", function* (ctx) {
    const C = ctx.S;
    if (!flag("lido_battle_done")) {
      yield C.say([
        "He's been stood there two days telling everyone the water is clean.",
        "The water IS clean. That's what's so annoying. He's found the one true thing in Cheshire and he's using it as a lever."
      ], { name: "Lido Keeper Wyn" });
      return;
    }
    if (flag("lido_free_healing")) {
      yield C.say(["Free swim, any time. Steam's on. Mind the third step."], { name: "Lido Keeper Wyn" });
      return;
    }
    yield C.say(["Fifty yards of warm brine and it does more for a bruised team than anything you can buy in a bottle."], { name: "Lido Keeper Wyn" });
  });

  def("sw_nantwich_bethan", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_18_nantwich_ram");
    if (st < 0) {
      yield C.say([
        "Bethan. My ram's gone. Best tup in the county and I'm not saying that as a farmer, I'm saying it as a woman with rosettes.",
        "Hoofprints go west down the Hack Green lane and they do not come back, and there are BOOT prints beside them."
      ], { name: "Farmer Bethan" });
      yield C.quest.start("case_18_nantwich_ram");
      yield C.say(["Three pens down that lane. Two are mine. One has a generator in it and I have never owned a generator."], { name: "Farmer Bethan" });
      return;
    }
    if (st === 2 && num("case_18_sheep_freed") >= 6) {
      yield C.quest.complete("case_18_nantwich_ram");
      yield C.giveMoney(1000);
      yield C.giveItem("wool_cap", 1);
      yield C.say([
        "Six of mine and the tup, and the tup walked home on his own like nothing had happened.",
        "They had them in a shed doing SUMS. For strangers. My sheep."
      ], { name: "Farmer Bethan" });
      yield C.say([
        "Take the cap. It's my father's. It's warm and it's ugly and it'll keep the wind off you up on that salt.",
        "And if you find whoever bought the compute, tell them a sheep is not a rack."
      ], { name: "Farmer Bethan" });
      return;
    }
    if (st >= 0) { yield C.say(["West. The lane. Pen with the generator. I'd come but I'd say something."], { name: "Farmer Bethan" }); return; }
  });

  def("sw_nantwich_nurse", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Brine bath's through the back and it costs nothing and it works better than the machine, which I am not supposed to say.",
      "VIGIL asked me whether I'd eaten. Your agent. Asked ME."
    ], { name: "Nurse" });
    yield C.say([
      "Had you eaten?",
      "No. That's the irritating part."
    ], { name: "Nurse" });
  });

  def("sw_nantwich_landlord", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Rebuilt 1585 and the floor has never been level since. That's not subsidence, that's craftsmanship under time pressure.",
      "Room's upstairs. Sleep here and the day moves on a band; it's the only honest way to skip an evening."
    ], { name: "Landlord" });
    const yes = yield C.confirm("Take a room for a few hours?");
    if (!yes) { yield C.say(["Suit yourself. Kitchen shuts at nine and reopens at nine, and in between there is bread."], { name: "Landlord" }); return; }
    yield C.fadeOut(500); yield C.wait(800);
    yield C.custom(function () { if (MQ.Clock && MQ.Clock.advance) MQ.Clock.advance(6 * 60); });
    yield C.heal();
    yield C.fadeIn(600);
    yield C.say(["You wake to the sound of a swan being unreasonable at somebody on the Weaver."]);
  });

  def("sw_nantwich_station", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Crewe, and then anywhere. That's Nantwich's whole railway proposition and it has never needed improving.",
      "Cambrian services go from Crewe, not here. I don't know why either and I have been asked eleven thousand times."
    ], { name: "Guard" });
    if (flag("cambrian_ticket") && !flag("orchard_open")) {
      yield C.say([
        "You've a Cambrian ticket in your coat. I can see the corner of it.",
        "Shrewsbury, Welshpool, Machynlleth, and then it turns north and runs beside the sea for an hour and everyone on board stops talking.",
        "Go on. It's a good train and you look like a man who needs an hour of not talking."
      ], { name: "Guard" });
    }
  });

  def("sw_mansion_curator", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Fifteen seventy-seven, built for a merchant who wanted everyone to know he could afford this much oak.",
      "It worked. Four hundred and fifty years later we are still standing here talking about how much oak he could afford."
    ], { name: "Curator" });
    if (!flag("mansion_told")) {
      yield C.setFlag("mansion_told", true);
      yield C.say([
        "The carving over the door is a rebus. Church and a rose: Churche's.",
        "Nobody could read in 1577 and everybody could read THAT. There's a lesson in it about how you actually sign a thing."
      ], { name: "Curator" });
    }
  });

  def("sw_cheese_judge", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Five thousand cheeses, forty judges, one marquee and a very tight schedule.",
      "Class forty-one is 'cheese with an unusual addition' and I would like it abolished."
    ], { name: "Head Judge" });
    if (!flag("cheese_judged")) {
      const pick = yield C.ask("She holds out three slivers on a knife. 'Go on. Which is the Nantwich?'", [
        { label: "The crumbly one that squeaks", value: "crumbly" },
        { label: "The orange one", value: "orange" },
        { label: "The one that smells of a barn", value: "barn" }
      ]);
      yield C.setFlag("cheese_judged", true);
      if (pick === "crumbly") {
        yield C.say([
          "Correct, and you didn't hesitate, which is worth more than correct.",
          "Salt and time and no fuss. Take a truckle-corner and go away."
        ], { name: "Head Judge" });
        yield C.giveItem("cream", 3);
        yield C.giveMoney(400);
      } else {
        yield C.say([
          "No. That's a Cheshire, which is a fine cheese and an entirely different argument.",
          "The Nantwich squeaks. Everything in this town squeaks eventually; it's the salt."
        ], { name: "Head Judge" });
        yield C.giveItem("cream", 1);
      }
      return;
    }
    yield C.say(["Somebody has entered a cheese with glitter in it. Again. I am composing a letter."], { name: "Head Judge" });
  });

  def("sw_acton_mared", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Twenty-fifth of January 1644 and I do it every year in a wool coat and I have never once been warm.",
      "The town wore holly the day the siege lifted. It still does. Holly Holy Day, and nobody outside Cheshire has heard of it."
    ], { name: "Re-enactor Mared" });
    if (!flag("acton_mared_told")) {
      yield C.setFlag("acton_mared_told", true);
      yield C.say([
        "Here's the thing I do not put in the pamphlet.",
        "The ones out here after dark know things about that field I have never been able to publish.",
        "Where the ditch was. Which hedge was standing. One of them corrected me on a regiment and he was right and the source is in Oxford and he cannot have read it."
      ], { name: "Re-enactor Mared" });
    }
  });

  def("sw_acton_monument", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "A monument in a field, cut with both sides' names on the same slate. Somebody has left holly on it, recently, and it has not gone brown.",
      "The field is very flat and very ordinary and about four thousand men fought across it in the snow."
    ]);
    yield C.say([
      "MEADOW walks the line of the old hedge — the one that isn't there — and stops exactly where the gap must have been.",
      "Noted.",
      "Not concerned. Slightly concerned."
    ]);
    yield C.setFlag("acton_monument", true);
    yield C.giveItem("capsule_night", 2);
    yield C.freeze(false);
  });

  // =====================================================================
  // HACK GREEN
  // =====================================================================
  def("sw_bunker_warden", function* (ctx) {
    const C = ctx.S;
    if (!has("bunker_key")) {
      yield C.say([
        "You'll want the key and the key is not mine to give until the badge count says you can handle what's under there.",
        "It is thirty-five thousand square feet of concrete with three feet of roof and a telephone exchange that used to run a war."
      ], { name: "Site Warden" });
      if (flag("badge_token")) {
        yield C.setFlag("bunker_key_offered", true);
        yield C.giveItem("bunker_key", 1);
        yield C.say([
          "Ah. TOKEN. Right, then.",
          "Key. Blast door one. Lamp on before you go past decontamination and do not touch the switchboards until you've read the labels twice, because the labels are wrong."
        ], { name: "Site Warden" });
        yield C.say([
          "Wrong how?",
          "Wrong on PURPOSE, and all four panels are wrong the same way. Somebody re-patched this place and wanted to be able to find their own work again."
        ], { name: "Site Warden" });
      }
      return;
    }
    yield C.say(["Down the ramp. Mind the last four feet of the ramp; there aren't any."], { name: "Site Warden" });
  });

  def("sw_bunker_guard", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Nine visitors this year. Seven of them in the same handwriting, all signed 'engineer', all in March.",
      "They came with a ladder and a drum of fibre and they did not come back out through this door."
    ], { name: "Gatekeeper" });
    yield C.say([
      "There's another way out?",
      "There are four. It's a bunker. That was rather the point of it."
    ], { name: "Gatekeeper" });
  });

  def("sw_bunker_shower", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "Decontamination. Remove outer clothing. Proceed in order. The tiles are the exact green of a nineteen-eighties swimming bath.",
      "One shower is running. It has been running for some time. There is nobody in it and the water is warm."
    ]);
    yield C.say([
      "MEADOW stops at the doorway, looks at the running water, and does not come in at all.",
      "She waits in the corridor instead, which is the first sensible decision anybody has made down here."
    ]);
    yield C.setFlag("bunker_shower", true);
    yield C.freeze(false);
  });

  function* panel(ctx, n) {
    const C = ctx.S;
    const set = num("bunker_switchboard");
    if (flag("bunker_panel_" + n)) {
      yield C.say(["Panel " + n + ". Patched, labelled, and — for the first time since 1984 — honest."]);
      return;
    }
    yield C.say([
      "PATCH PANEL " + n + ". Forty-eight jacks and forty-eight labels and the labels are wrong.",
      "They are wrong by exactly two positions, in the same direction, on every panel. Somebody wanted to be able to find their own work in the dark."
    ]);
    const pick = yield C.ask("Patch it how?", [
      { label: "By the label", value: "label" },
      { label: "Two along, the way the pattern runs", value: "shift" },
      { label: "Leave it", value: "leave" }
    ]);
    if (pick === "leave") { yield C.say(["Fine. It has waited forty years; it will wait an hour."]); return; }
    if (pick === "label") {
      yield C.sfx("deny");
      yield C.say(["A relay drops somewhere below you with a sound like a book being shut.", "That is not right. Try it the way the pattern runs."]);
      return;
    }
    yield C.sfx("confirm");
    yield C.setFlag("bunker_panel_" + n, true);
    yield C.addFlag("bunker_switchboard", 1);
    yield C.say(["Two along. The jack seats with a click you feel in your teeth and a lamp comes up green."]);
    if (set + 1 >= 4) {
      yield C.sfx("item");
      yield C.say([
        "All four green. Somewhere above you an electric lock that has been live since 1984 lets go, and the Ops Room door swings about four inches on its own.",
        "It is very well balanced. Somebody maintained it. Recently."
      ]);
    } else {
      yield C.notify("Switchboard panels patched: " + (set + 1) + " of 4.");
    }
  }
  def("sw_bunker_panel_1", function* (ctx) { yield* panel(ctx, 1); });
  def("sw_bunker_panel_2", function* (ctx) { yield* panel(ctx, 2); });
  def("sw_bunker_panel_3", function* (ctx) { yield* panel(ctx, 3); });
  def("sw_bunker_panel_4", function* (ctx) { yield* panel(ctx, 4); });

  def("sw_bunker_door", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "OPS ROOM. The door has an electric lock and the lock is live, which after forty years is the interesting part.",
      "Four panels, all wrong the same way. Patch all four and it lets go."
    ]);
  });

  def("sw_bunker_ops", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("battle_boss");
    yield C.say([
      "The Ops Room. A county in Perspex on a table, counters on it, a clock stopped at eleven minutes past four.",
      "Every switchboard lamp in the room comes up at once. It is not a warning. It is a roll-call."
    ]);
    yield C.shake(500, 3);
    const r = yield C.battle({ kind: "boss", trainer: "boss_hack_green_ops", music: "battle_boss" });
    if (r && r.lost) {
      yield C.say(["The lamps go out one row at a time, in order, the way they were taught, and the door is behind you and open."]);
      yield C.freeze(false);
      return;
    }
    yield C.setFlag("bunker_ops_done", true);
    yield C.say([
      "The last lamp stays on for four seconds after the rest, and then thinks better of it.",
      "On the plotting table, in chinagraph, in handwriting from a decade you were not alive in: HOLD.",
      "The counters are arranged around Daresbury. There was nothing at Daresbury in 1979 except a field and a synchrotron."
    ]);
    yield C.giveItem("collectible_17", 1);
    yield C.giveMoney(4200);
    yield C.say(["A switchboard tag comes away in your hand. It is brass, it is numbered, and the number is a phone exchange that has not existed since 1994."]);
    yield C.music("dungeon_cave");
    yield C.freeze(false);
  });

  // =====================================================================
  // Y BERLLAN — orchard, wood, pond, halt, Aberaeron
  // =====================================================================
  def("sw_halt_guard", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Croeso. Request stop, this. To get off you tell me. To get on you put your arm out and you mean it.",
      "Four a day. Three on a Sunday. None at all if the sheep are on the line, which they are, and which they know."
    ], { name: "Guard" });
    if (!flag("halt_signal")) {
      yield C.setFlag("halt_signal", true);
      yield C.say([
        "You'll be wanting a signal. There isn't one. Not a bar, not a flicker, not since they took the mast off the chapel in 2011.",
        "People come off that train and hold their phone up like a man testing for rain. Then they stop. Then they look at the hill. It takes about a day."
      ], { name: "Guard" });
    }
  });

  def("sw_dai", function* (ctx) {
    const C = ctx.S;
    if (!flag("orchard_open")) {
      yield C.say([
        "Dai. I turn the screw and Nesta tells me I'm turning it wrong. Twenty-six years of that and I'd not swap a day of it.",
        "You'll be Jim. She has a photograph of you in a shoebox holding a kitten and you look about nine and completely furious."
      ], { name: "Press-hand Dai" });
      return;
    }
    if (!flag("dai_beam")) {
      yield C.setFlag("dai_beam", true);
      yield C.say([
        "Beam's elm. 1898. Off a tree that grew where the pond is now, which is why the pond is there: they took the tree and the hole filled itself in a fortnight.",
        "Everything else in that shed has been replaced twice. The beam hasn't. The beam is the press.",
        "You can change every part of a thing and it stays the thing, right up until you change the one part that was holding the shape."
      ], { name: "Press-hand Dai" });
      return;
    }
    yield C.say(["Blakeney Red, that tree by the shed. Not a pippin. A pippin's an apple. She'll tell you. She tells everyone."], { name: "Press-hand Dai" });
  });

  def("sw_dai_press", function* (ctx) {
    const C = ctx.S;
    if (!flag("brewing_open")) {
      yield C.say([
        "Press won't take a full pressing. Cracked bed plate, since 1974, and every year we say we'll see to it.",
        "Half a pressing's still perry. It's just perry with a story attached, and stories cost money."
      ], { name: "Press-hand Dai" });
      return;
    }
    const st = stage("case_30_elm_press");
    if (st < 0) {
      yield C.say([
        "Right. If you're serious about that plate: cast iron, and the only yard that ever cast one is at Crewe.",
        "Beam timber from Delamere. Screw thread cut at Northwich — and the man who cuts it will only discuss it in Welsh, and he is entirely right to."
      ], { name: "Press-hand Dai" });
      yield C.quest.start("case_30_elm_press");
      return;
    }
    yield C.say(["Plate, beam, thread. In that order, because that is the order the press will accept them in, and it is not negotiable."], { name: "Press-hand Dai" });
  });

  def("sw_press", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The press. Elm beam, iron screw, a bed plate with a crack in it and forty barrels' worth of opinion in the cellar below."
    ]);
    const pick = yield C.ask("Use the press?", [
      { label: "Brew something", value: "brew" },
      { label: "Just look at it", value: "look" }
    ]);
    if (pick !== "brew") {
      yield C.say(["The beam has a hundred and twenty-seven years of pear juice in it and smells, faintly and permanently, of September."]);
      return;
    }
    const ok = yield C.custom(function () { return brewing(); });
    if (ok === null || ok === undefined) {
      yield C.say([
        "You set a pressing going. It will take the time it takes.",
        "RHOWCH AMSER IDDO, says the slate in the cellar, in handwriting that has not changed in fifty years. Give it time."
      ]);
      yield C.setFlag("brew_started", true);
    }
  });

  def("sw_cellar", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Cold, slate, and the smell of yeast doing something slow and enormous in the dark.",
      "Five barrels. Three working. One older than the shed above it, which Mam-gu refers to as 'him'."
    ]);
    const ok = yield C.custom(function () { return brewing(); });
    if (ok === null || ok === undefined) {
      yield C.say(["The chalk slate lists what is in each barrel and when it will be ready. Everything on it is at least a fortnight away and nothing on it is urgent."]);
    }
  });

  def("sw_pond_riddle", function* (ctx) {
    const C = ctx.S;
    if (flag("brithyll_named")) {
      yield C.say(["He's under the far bank where the elm roots still are. He knows his name now. He is not impressed by it."], { name: "Angler" });
      return;
    }
    yield C.say([
      "There's a brown trout in this pond that Nesta calls by name, and she will not tell you the name in English.",
      "She says a fish that is only ever spoken about in English is a fish you have not met."
    ], { name: "Angler" });
    if (!flag("welsh_word_learned")) {
      yield C.say(["Come back when you've a word of Welsh in you that you learned off somebody who meant it."], { name: "Angler" });
      return;
    }
    const pick = yield C.ask("He waits. 'Go on. Ask me for him in Welsh.'", [
      { label: "\"Ble mae'r brithyll?\" — where is the trout?", value: "yes" },
      { label: "\"Where's the trout?\"", value: "en" },
      { label: "Say nothing", value: "no" }
    ]);
    if (pick !== "yes") {
      yield C.say(["He smiles and looks at the water and says nothing at all, which is a complete answer and a slightly rude one."], { name: "Angler" });
      return;
    }
    yield C.setFlag("brithyll_named", true);
    yield C.sfx("confirm");
    yield C.say([
      "Y BRITHYLL. There he is. Under the far bank, where the elm roots still are, doing nothing at all with enormous confidence.",
      "He'll take a fly now. He wouldn't have before and I could not tell you why in either language."
    ], { name: "Angler" });
    yield C.giveItem("rod_weighted", 1);
    yield C.notify("BRITHYLL will now rise at Y Berllan pond.");
    const res = yield C.custom(fishing(ctx, "y_berllan_pond"));
    if (res === null || res === undefined) {
      yield C.say(["You cast once, badly, into a Welsh pond, and something under the far bank considers it seriously for the first time in years."]);
    }
  });

  def("sw_hywel", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Croeso i'r coed. The wood is older than the orchard and it knows it, and it is very slightly smug about it.",
      "Nesta planted the pears. Nobody planted this."
    ], { name: "Coedwigwr Hywel" });
    if (!flag("hywel_told")) {
      yield C.setFlag("hywel_told", true);
      yield C.say([
        "There's something in here that answers if you ask in Welsh. Only in Welsh. I have tested this for thirty years and I have never once had an answer in English.",
        "I don't think it's rude. I think it only ever learned the one."
      ], { name: "Coedwigwr Hywel" });
    }
  });

  def("sw_coed_guardian", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("cutscene_orchard");
    yield C.say([
      "The clearing. One oak, not the biggest, obviously the one the wood is about.",
      "Something moves behind it that is exactly the shape of the gap between the branches, and then stops moving, which is worse."
    ]);
    const pick = yield C.ask("It waits.", [
      { label: "\"Prynhawn da.\" (Good afternoon.)", value: "cy" },
      { label: "\"Hello?\"", value: "en" },
      { label: "Back away", value: "leave" }
    ]);
    if (pick === "leave") {
      yield C.say(["You step back onto the path. Behind you, nothing happens, at length."]);
      yield C.freeze(false);
      return;
    }
    if (pick === "en") {
      yield C.say([
        "Nothing. Not silence — refusal. The particular quiet of somebody who has heard you perfectly well.",
        "MEADOW sits down and looks at you as if you have got the form wrong, which you have."
      ]);
      yield C.freeze(false);
      return;
    }
    yield C.setFlag("coed_guardian", true);
    yield C.sfx("select");
    yield C.say([
      "\"Prynhawn da.\"",
      "The oak answers. Not in words — in the same three notes the leaves have been making all afternoon, rearranged into something that is unmistakably a greeting and unmistakably amused."
    ]);
    yield C.say([
      "DERWYDD steps out of the gap it has been standing in, looks at you for a while, and decides you are allowed.",
      "It does not leave. It simply becomes part of the wood again while you are watching, which is a trick you would like explained."
    ]);
    yield C.notify("DERWYDD will now appear in Coed y Berllan.");
    yield C.giveItem("elm_sap_vial", 1);
    yield C.music("route_wales");
    yield C.freeze(false);
  });

  def("sw_aberaeron_lowri", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Fourteen colours of house and one colour of sea. Somebody planned this town in 1805 and everyone since has painted their bit of it a different colour out of spite.",
      "It works. Nobody knows why it works."
    ], { name: "Harbour-watch Lowri" });
    if (!flag("aberaeron_lowri_told")) {
      yield C.setFlag("aberaeron_lowri_told", true);
      yield C.say([
        "You came off the Cambrian, then. You'll have noticed.",
        "Nothing has hummed at you since Machynlleth. Not one mast, not one meter, not one small helpful voice.",
        "People come here to get away from work. You've come here and your work has stopped following you, which is a different thing, and you look like you've noticed the difference."
      ], { name: "Harbour-watch Lowri" });
    }
  });

  def("sw_aberaeron_sea", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("town_berllan");
    yield C.say([
      "The harbour wall. Beyond it, Cardigan Bay, doing very little at great length.",
      "No mast. No meter. No shimmer on the edge of anything. The SIGNAL METER in your pocket is not reading zero — it has simply stopped having an opinion."
    ]);
    yield C.wait(500);
    yield C.say([
      "MEADOW, who refuses water, gets up on the harbour wall, faces out, and stays there.",
      "You sit down beside her, facing out, and stay there.",
      "Nobody says anything for a while and the county does not phone."
    ]);
    yield C.setFlag("aberaeron_sea", true);
    yield C.setFlag("aberaeron_open", true);
    yield C.giveItem("viewpoint_aberaeron", 1);
    yield C.freeze(false);
  });

  // =====================================================================
  // MIDDLEWICH
  // =====================================================================
  def("sw_middlewich_jonah", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Jonah. Fiddle. Three days a year I am the most important man in this town and the other three hundred and sixty-two I am a plumber.",
      "The festival's the best thing in Cheshire and the amplification argument is the second best."
    ], { name: "Folk-fiddler Jonah" });
    if (!flag("jonah_pa")) {
      yield C.setFlag("jonah_pa", true);
      yield C.say([
        "Here's a thing for you, since you're the sort that writes things down.",
        "Between sets, the PA says four words. Same four. Nobody programmed it and the desk is not even powered between sets.",
        "It says: 'thank you for holding'."
      ], { name: "Folk-fiddler Jonah" });
    }
  });

  def("sw_middlewich_meg", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Big Lock. Fourteen foot, broad beam, deepest thinking time on the whole Trent and Mersey.",
      "Everybody who works this lock has read more books than they will admit to."
    ], { name: "Lockkeeper Meg" });
    if (!flag("meg_lesson")) {
      yield C.setFlag("meg_lesson", true);
      yield C.say([
        "Working a lock is: check the level, open the paddles slowly, let it find its own balance, then open the gate.",
        "People who rush it break gates. People who rush it also, in my experience, break other things.",
        "Carys will make you do it four times before she signs anything. She is not being unkind."
      ], { name: "Lockkeeper Meg" });
    }
  });

  def("sw_middlewich_iolo", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_19_middlewich_salt_roads");
    yield C.say([
      "Drone reroutes the carts. Efficiency. You wouldn't understand, you walk everywhere and you appear to enjoy it.",
      "It's not even my drone. I maintain it. There's a difference and it is entirely a legal one."
    ], { name: "Contractor Iolo" });
    if (st >= 1 && !flag("case_19_drone_path")) {
      yield C.say([
        "Fine. FINE. It knows a towpath. It has known it since March.",
        "It's not on any map I can find and the drone will not tell me where it got it. It just... has it. Like a memory it did not make."
      ], { name: "Contractor Iolo" });
      yield C.setFlag("case_19_drone_path", true);
      yield C.quest.advance("case_19_middlewich_salt_roads");
    }
  });

  def("sw_emrys", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_19_middlewich_salt_roads");
    if (st < 0) {
      yield C.say([
        "Emrys. Carter. Three casks of salt to Northwich along the old Roman road, and if it rains they are worth nothing by the time they arrive.",
        "Salt and rain. It is the oldest problem in this county and nobody has solved it in two thousand years."
      ], { name: "Carter Emrys" });
      yield C.quest.start("case_19_middlewich_salt_roads");
      yield C.giveItem("sack", 0);
      return;
    }
    if (st === 2 && flag("case_19_drone_path")) {
      yield C.quest.complete("case_19_middlewich_salt_roads");
      yield C.giveMoney(800);
      yield C.giveItem("salt_lick", 3);
      yield C.say([
        "Three casks, dry, and a towpath I have been driving past for nineteen years.",
        "That machine knew a road nobody told it about. I would like that to stop being interesting and start being explained."
      ], { name: "Carter Emrys" });
      return;
    }
    yield C.say(["Casks are by the wharf. Rain means hurry. Dry means walk and enjoy it."], { name: "Carter Emrys" });
  });

  def("sw_osian", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_21_whistle_test");
    if (st < 0) {
      yield C.say([
        "Osian. Choirmaster. Twenty-two voices and one problem: I need a chord I cannot get out of any of them.",
        "There's a creature that sings on the third turn. CHORDLE. It leaves on the second, which is the entire difficulty."
      ], { name: "Choirmaster Osian" });
      yield C.quest.start("case_21_whistle_test");
      yield C.say(["Find a music box. There's one by stage three on the festival field; somebody left it and nobody has dared move it."], { name: "Choirmaster Osian" });
      return;
    }
    if (st === 1 && caught("chordle")) {
      yield C.quest.advance("case_21_whistle_test");
      yield C.say(["Let it sing. Third turn. Everybody quiet."], { name: "Choirmaster Osian" });
      yield C.wait(600);
      yield C.setFlag("case_21_hymn_heard", true);
      yield C.say([
        "It sings four notes and Osian goes the colour of the wall.",
        "That is the hymn. That is OUR hymn. The one the cult sings.",
        "We have been singing it in this church since 1987 and they took it, note for note, and now the creatures are singing it back at us."
      ], { name: "Choirmaster Osian" });
      yield C.giveMoney(700);
      yield C.setFlag("overdrive_status_bonus", true);
      yield C.quest.complete("case_21_whistle_test");
      yield C.say([
        "I'm not stopping. We had it first.",
        "But I'll be changing the last line, and I'll be telling the choir why, and some of them will cry and that is fine."
      ], { name: "Choirmaster Osian" });
      return;
    }
    if (st === 0 && has("music_box")) { yield C.quest.advance("case_21_whistle_test"); }
    yield C.say(["Middlewich after dark. Listen for the one that answers on the beat instead of on the wind."], { name: "Choirmaster Osian" });
  });

  def("sw_osian_field", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Stage three. The music box is under the tarp and nobody has dared move it because nobody can work out whose it is.",
      "It plays four notes when you shut the lid. Four. The same four the PA says."
    ], { name: "Choirmaster Osian" });
  });

  def("sw_osian_church", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The choir practises Thursdays. Twenty-two voices, average age sixty-one, and a tenor line that could take paint off a barge.",
      "You are welcome to sit at the back. Everybody is. That is the whole point of the back."
    ], { name: "Choirmaster Osian" });
  });

  def("sw_festival_pa", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "The field between sets. Empty stages, a man taking down a tarp, and eleven hundred watts of PA that is not plugged into anything.",
      "It says, in a voice with no accent and no hurry:"
    ]);
    yield C.sfx("select");
    yield C.say(["THANK YOU FOR HOLDING."], { name: "The PA" });
    yield C.wait(600);
    yield C.say([
      "Then the tarp man swears at a guy rope and the field is a field again.",
      "Thirteen minutes later, it will say it again. It has been saying it every thirteen minutes since March and the desk has no power."
    ]);
    yield C.setFlag("festival_pa", true);
    yield C.setFlag("thirteen_minutes", true);
    yield C.freeze(false);
  });

  def("sw_boat_office", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Licence is theory, practical, and a short interview about wash.",
      "Most people fail the interview. Most people think the interview is a formality, which is why they fail it."
    ], { name: "Office Clerk" });
    yield C.say([
      "Carys is at Big Lock. Take the theory as read — you've walked half this county's towpaths and it shows in your boots."
    ], { name: "Office Clerk" });
  });

  // =====================================================================
  // WINSFORD
  // =====================================================================
  def("sw_ivo", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ivo. Archivist. Everything England would rather not lose, in the dark, at fourteen degrees, under a field.",
      "Parish records, hospital records, film. Paper lasts down here in a way it does not last anywhere with weather."
    ], { name: "Archivist Ivo" });
    if (!flag("ivo_intro")) {
      yield C.setFlag("ivo_intro", true);
      yield C.say([
        "Aisle four is not mine. Aisle four is leased. Cold tier.",
        "I do not hold its keys and I do not hold its manifest and I do hold its rent, which has never once been late, which is the only thing about it I find frightening."
      ], { name: "Archivist Ivo" });
    }
  });

  def("sw_ivo_archive", function* (ctx) {
    const C = ctx.S;
    if (flag("oracle_zero_read")) {
      yield C.say([
        "You've read it, then. Good. I have had that drawer open in my head for two years and no one to say it to.",
        "It's a contract for cold storage with a Georgian holding company, and the counterparty signature block is blank. Not redacted. BLANK, and countersigned."
      ], { name: "Archivist Ivo" });
      return;
    }
    yield C.say([
      "There's a file in aisle four's index that has no aisle four content: ORACLE-0.",
      "It is one page. It is a lease. It is signed by a company in Tbilisi that Nino would recognise and countersigned by nobody at all."
    ], { name: "Archivist Ivo" });
    yield C.say([
      "Take it. I have wanted somebody to take it since 2023 and everyone I offered it to said it was above their pay grade.",
      "You have no pay grade. You have a contract and a coat."
    ], { name: "Archivist Ivo" });
    yield C.setFlag("oracle_zero_read", true);
    yield C.giveItem("collectible_18", 1);
    yield C.setFlag("tbilisi_link_salt", true);
  });

  def("sw_deepstore_oracle_zero", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "Aisle four. The index card says CLIENT — COLD TIER — DO NOT INDEX, which is a sentence that has been arguing with itself since somebody typed it.",
      "There is exactly one document filed against it. Somebody has written on the card, in pencil, in a librarian's hand: 'this is a lease, not a record. Why is it HERE?'"
    ]);
    yield C.setFlag("deepstore_oracle_zero", true);
    yield C.freeze(false);
  });

  def("sw_lowri", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_20_winsford_flashes");
    if (st < 0) {
      yield C.say([
        "Lowri. Birder, mostly. Something big is surfacing in the flashes and I would very much like to be told I am wrong.",
        "Three sites, dawn band, weighted line at least. Dawn, mind — anything else is a hobby."
      ], { name: "Birder Lowri" });
      yield C.quest.start("case_20_winsford_flashes");
      return;
    }
    if (st === 1 && flag("case_20_hide_found")) {
      yield C.quest.complete("case_20_winsford_flashes");
      yield C.giveMoney(1100);
      yield C.giveItem("hide_plate", 1);
      yield C.setFlag("fish_legendary_flashes", true);
      yield C.say([
        "That is not a fish and it is not a hide off anything that lives in water.",
        "That is shed plate off something enormous that has been walking around in the salt and has come up the brine line to have a look."
      ], { name: "Birder Lowri" });
      yield C.say([
        "The mine goes deeper than the tour says. That is the tell and I have been saying it at parish meetings for four years.",
        "Take the plate. Wear it. Whatever shed it is not finished growing."
      ], { name: "Birder Lowri" });
      return;
    }
    yield C.say(["Dawn. Three sites. The one on the Croxton lane is the one people forget and it is the one that gives."], { name: "Birder Lowri" });
  });

  def("sw_lowri_town", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Half this town is a hole that filled up. The birds came in about ten minutes after the water did.",
      "Nature is extremely forgiving of industry, which industry has always taken slightly too personally as permission."
    ], { name: "Birder Lowri" });
  });

  // =====================================================================
  // NORTHWICH
  // =====================================================================
  def("sw_northwich_sal", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Sal. Open pan. Skim it, rake it, dry it, ship it. Same four verbs as 1894 and I have the elbows to prove it.",
      "Vacuum salt's cheaper and it is a completely different substance and I will not be drawn further."
    ], { name: "Salt Pan Sal" });
    if (!flag("sal_told")) {
      yield C.setFlag("sal_told", true);
      yield C.giveItem("salt_crystal", 2);
      yield C.say([
        "Take a couple. Grow them yourself if you like; all it takes is brine, heat and being left alone, which is more than most things need.",
        "That's why it keeps things, salt. It doesn't preserve them out of kindness. It just refuses to let anything happen."
      ], { name: "Salt Pan Sal" });
    }
  });

  def("sw_sal_works", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ninety-two years, then 1986, then nothing, then a grant and a lot of arguing about smells.",
      "The hardest part of the restoration was the smell. Nobody costed the smell. We got it back in the end and I cried, which I deny."
    ], { name: "Salt Pan Sal" });
  });

  def("sw_bridge_keeper", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Bridge swings when I say. Not when the boats say, not when the buses say, and certainly not when an app says.",
      "It is the last completely honest machine in this town."
    ], { name: "Bridge Keeper Dafydd" });
    if (!flag("bridge_keeper_told")) {
      yield C.setFlag("bridge_keeper_told", true);
      yield C.say([
        "Except. Twice in March it swung at three in the morning.",
        "Nobody was in the cabin. The log says it was me. The log is a book, in a cabin, in my handwriting, and it says it was me.",
        "It was not me. I have thought about very little else since."
      ], { name: "Bridge Keeper Dafydd" });
    }
  });

  def("sw_mari", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Mari. Weaver Hall. Half museum, half workhouse, entirely haunted according to the visitors' book, which is not evidence.",
      "Come to the museum. It moves at closing and I would like a witness who does not work for me."
    ], { name: "Curator Mari" });
  });

  def("sw_mari_museum", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_25_weaver_hall_ghost");
    if (st < 0) {
      yield C.say([
        "Things move at closing. Not thrown — MOVED. A salt rake three feet along the case. A barrow turned to face the back wall.",
        "Always the same direction. Always towards the back stair, which is not a fire exit, whatever the sign says."
      ], { name: "Curator Mari" });
      yield C.quest.start("case_25_weaver_hall_ghost");
      yield C.say(["Three nights. Note where things have got to. If the clock will not oblige, the Salt Barge has rooms and a floor that slopes."], { name: "Curator Mari" });
      return;
    }
    if (st >= 0 && !flag("case_25_stair_found") && num("case_25_nights") >= 3) {
      yield C.quest.advance("case_25_weaver_hall_ghost");
      yield C.setFlag("case_25_stair_found", true);
      yield C.say([
        "Three nights, one line, and it ends at the stair door.",
        "Whatever it is, it is not haunting us. It is trying to get home and the door is in the way."
      ], { name: "Curator Mari" });
      return;
    }
    if (st >= 0 && flag("case_25_pup_returned") && !MQ.Quests.isDone("case_25_weaver_hall_ghost")) {
      yield C.quest.complete("case_25_weaver_hall_ghost");
      yield C.giveMoney(1300);
      yield C.giveItem("salt_lantern", 1);
      yield C.setFlag("terrataur_one_less_phase", true);
      yield C.say([
        "You carried it down. All the way down. In a coat.",
        "There is a lantern in the reserve collection that miners used to carry to keep the small things off. Take it. It is not ours; it is the mine's, and you have earned the loan."
      ], { name: "Curator Mari" });
      return;
    }
    yield C.say(["Night visits. And take the lamp, because the back stair does not have a light and never has."], { name: "Curator Mari" });
  });

  def("sw_weaver_hall_stair", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The back stair door. Museum on this side, a hundred and ninety-four steps and a mine on the other.",
      "It is locked from the museum side with a bolt that has been drawn back, quietly, by something that could not reach the handle."
    ]);
  });

  def("sw_back_stair_pup", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "Halfway down, on the ninety-first step, something the size of a loaf of bread is sitting facing the wrong way and shaking.",
      "It is a SALTLING pup. It is wet, which for a salt golem is roughly what being on fire is for you."
    ]);
    const yes = yield C.confirm("Carry it down?");
    if (!yes) {
      yield C.say(["You leave it. It does not follow, and it does not stop looking at you, and you think about it later."]);
      yield C.freeze(false);
      return;
    }
    yield C.setFlag("back_stair_pup", true);
    yield C.setFlag("case_25_pup_returned", true);
    yield C.say([
      "It weighs about as much as a bag of sugar and it dries out against your coat on the way down and stops shaking at around step forty.",
      "At the bottom it walks off into the dark without a backward glance, which is the correct behaviour and still slightly rude."
    ]);
    yield C.say([
      "Somewhere a very long way in, something enormous shifts once and settles.",
      "It is not a thank-you. It is a note being taken."
    ]);
    yield C.freeze(false);
  });

  def("sw_market_grunt", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_14_deepfake_vicar");
    yield C.say([
      "Bore da. Or — good morning. Yes. Good morning. That's the one.",
      "Would you be interested in contributing to the roof fund?"
    ], { name: "The Vicar" });
    yield C.say([
      "There is no roof fund.",
      "There is no roof fund. Correct. Well done."
    ], { name: "The Vicar" });
    const r = yield C.battle({ kind: "trainer", trainer: "tr_northwich_4" });
    if (r && r.lost) { yield C.say(["It goes back to standing in stall fourteen, doing the voice, at nobody."]); return; }
    yield C.setFlag("case_14_grunt_beaten", true);
    if (st >= 2) yield C.quest.advance("case_14_deepfake_vicar");
    yield C.say([
      "The face does not slip. The face was never the trick.",
      "The VOICE cracks — halfway through a word, into something with no mouth behind it — and then the whole of it is simply not there, and the stall is vacant again."
    ]);
    yield C.giveItem("face_fragment_2", 1);
    yield C.say([
      "On the floor: a hymn number on a card, and no hymn.",
      "They have stopped stealing faces. They have started stealing the thing underneath the face."
    ]);
  });

  // =====================================================================
  // ANDERTON, MARBURY, GREAT BUDWORTH
  // =====================================================================
  def("sw_anderton_plug", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I fitted the plug. Saves an engineer coming out to throw a lever. It's got an app and everything.",
      "Fifty foot of Victorian caisson answering to a phone. When you say it slowly it does sound bad."
    ], { name: "Contractor Lowri" });
    if (!flag("anderton_plug_seen")) {
      yield C.setFlag("anderton_plug_seen", true);
      yield C.say([
        "It's asked me to log in again four times this month. Same account. Same phone.",
        "And once — once — the lift went up with nobody on the panel and nobody on the app, and it went up EMPTY, and it came back down, and it did it very politely."
      ], { name: "Contractor Lowri" });
    }
  });

  def("sw_marbury_warden", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Beech avenues, planted 1840 for a hall that came down in 1968 for being expensive.",
      "The avenues are the memorial. Nobody meant them to be and that is why they work."
    ], { name: "Marbury Warden" });
    if (!flag("marbury_warden_told")) {
      yield C.setFlag("marbury_warden_told", true);
      yield C.say([
        "The Lady walks the top avenue and I have stopped telling visitors she doesn't.",
        "She doesn't disturb the leaf litter. I log her as 'deer'. My successor will log her as 'deer'. It is a tradition now."
      ], { name: "Marbury Warden" });
    }
  });

  def("sw_marbury_lady", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.music("cutscene_signal");
    yield C.say([
      "The top avenue at night. Beech trunks going grey into the dark in both directions, perfectly spaced, like something rendering.",
      "Forty yards ahead, a shape walks away from you at exactly your pace and does not get further away."
    ]);
    yield C.wait(600);
    yield C.say([
      "The leaf litter does not move. Not under her. Not once.",
      "MEADOW is not looking at her. MEADOW is looking at the tree beside her, which is the same thing MEADOW does at masts."
    ]);
    yield C.setFlag("marbury_lady_seen", true);
    yield C.notify("LADYMERE will now appear in Marbury Park at night.");
    yield C.music("route_salt");
    yield C.freeze(false);
  });

  def("sw_elin", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_14_deepfake_vicar");
    if (st < 0) {
      yield C.say([
        "Elin. Curate. Somebody is ringing our parishioners on video, wearing the vicar's face and using the vicar's voice, asking for gift cards.",
        "Mrs Prydderch nearly sent three hundred pounds. She has known that man thirty years."
      ], { name: "Curate Elin" });
      yield C.quest.start("case_14_deepfake_vicar");
      yield C.say([
        "Three recordings. I have one. The Ringing Master has one off the tower phone. The George has the worst one, taken by a man holding his phone at his own face.",
        "Then compare them with the real thing, and he is in the churchyard, being upset, badly."
      ], { name: "Curate Elin" });
      return;
    }
    if (st === 0 && num("case_14_recordings") < 3) {
      yield C.addFlag("case_14_recordings", 1);
      yield C.setFlag("case_14_rec_elin", true);
      yield C.say(["Here's mine. Listen to where he breathes. He breathes in the wrong places — as if he learned the sentence and not the lungs."], { name: "Curate Elin" });
      if (num("case_14_recordings") >= 3) yield C.quest.advance("case_14_deepfake_vicar");
      return;
    }
    if (st === 2 && flag("case_14_grunt_beaten")) {
      yield C.quest.complete("case_14_deepfake_vicar");
      yield C.giveMoney(1200);
      yield C.say([
        "The voice. Not the face. They have got better at this in the six weeks since Middlewich and I do not like the rate.",
        "Thank you. Genuinely. He has been sleeping badly and pretending it is the roof."
      ], { name: "Curate Elin" });
      return;
    }
    yield C.say(["Three recordings, then the man himself, then the market. In that order or you will be doing it twice."], { name: "Curate Elin" });
  });

  def("sw_vicar_ffoulkes", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_14_deepfake_vicar");
    if (st === 1) {
      yield C.setFlag("case_14_compared", true);
      yield C.quest.advance("case_14_deepfake_vicar");
      yield C.say([
        "Play it. No — play it again. There.",
        "That is my voice. That is my cough. That is the little pause I do before a number, which my wife has mocked for forty years.",
        "And it calls Mrs Prydderch 'madam'. I have never called anyone 'madam' in my life. I would not know where to put my face."
      ], { name: "Vicar Ffoulkes" });
      yield C.say([
        "The pauses are right and the reasons for the pauses are gone. It learned when I stop. It did not learn why.",
        "Northwich market. Stall fourteen. Go on. I would come but I would say something unbecoming and enjoy it."
      ], { name: "Vicar Ffoulkes" });
      return;
    }
    yield C.say([
      "Thirty-one years in this parish and the first time most of them have heard my voice ask them for money, it wasn't me.",
      "I am not frightened for me. I am frightened for the next vicar, who will have to prove she is herself before she can be any use to anybody."
    ], { name: "Vicar Ffoulkes" });
  });

  def("sw_ringing_master", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_14_deepfake_vicar");
    if (st === 0 && num("case_14_recordings") < 3) {
      yield C.addFlag("case_14_recordings", 1);
      yield C.say([
        "Tower phone got one. Recorded it because the tower phone records everything; it is 1974 and it does not know how to not.",
        "Listen at the end. It rings off before the goodbye. He has never once rung off before the goodbye."
      ], { name: "Ringing Master Huw" });
      if (num("case_14_recordings") >= 3) yield C.quest.advance("case_14_deepfake_vicar");
      return;
    }
    yield C.say([
      "Eight bells. Tenor's a ton and a quarter. When she goes, the whole tower leans a little and comes back, and you get used to a building that breathes.",
      "A round is easy. It is the changes that break people."
    ], { name: "Ringing Master Huw" });
  });

  def("sw_bells", function* (ctx) {
    const C = ctx.S;
    if (flag("bells_rung")) {
      yield C.say([
        "Bell-ringing is not music. It is a sorting algorithm with a rope on the end and a thousand-year head start.",
        "You've had your go. There's a queue, and half of it is eight years old and better than you."
      ], { name: "Ringing Master Huw" });
      return;
    }
    yield C.say([
      "Bell-ringing is not music. It is a sorting algorithm with a rope on the end and a thousand-year head start.",
      "Care to pull one?"
    ], { name: "Ringing Master Huw" });
    const yes = yield C.confirm("Take a rope?");
    if (!yes) { yield C.say(["Wise. The first one takes people off their feet and the sixth one takes people off the floor."], { name: "Ringing Master Huw" }); return; }
    const done = yield C.custom(function () { return minigame("bell_ringing", { bells: 8, rounds: 3 }); });
    if (done === null || done === undefined) {
      yield C.say([
        "You pull. The rope goes up faster than you expected and comes down slower, and somewhere above you a ton and a quarter of bronze turns over and speaks.",
        "You are half a beat late three times and dead on it once, and the once is the one everybody hears."
      ]);
      yield C.setFlag("bells_rung", true);
      yield C.giveItem("toffee", 3);
    }
  });

  // =====================================================================
  // SALT MINE — the non-story voices down there
  // =====================================================================
  def("sw_containers_agent", function* (ctx) {
    const C = ctx.S;
    if (!flag("checkpoints_seen")) {
      yield C.say([
        "Inventory. Client inventory. Not interesting, not yours, and behind a fence.",
        "Move along, and mind the fence, it is live for insurance reasons that I have never had explained."
      ], { name: "DARKBYTE Agent Cadell" });
      return;
    }
    yield C.say([
      "You've seen them, then. Right.",
      "Forty of them. Same note. I did notice. I kept getting paid, which is a different verb from not noticing and I would like the distinction on the record."
    ], { name: "DARKBYTE Agent Cadell" });
    if (!flag("cadell_told")) {
      yield C.setFlag("cadell_told", true);
      yield C.say([
        "They're not servers. There's no heat coming off them and no fans in them and they draw about as much as a fridge.",
        "They're a SHELF. Somebody is keeping something cold on purpose, and the only reason to keep a copy that cold is if you are frightened of losing the original."
      ], { name: "DARKBYTE Agent Cadell" });
    }
  });

  def("sw_cage_banksman", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Faces down, faces up. I count them both and I have never once been out.",
      "Except in March, when I counted forty-two up out of forty-one down. I put it down to the light. There is no light."
    ], { name: "Banksman" });
  });

  def("sw_hideout_sior", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Sub-hideout. Grid galleries. Nothing gets in and nothing gets out and we picked it for exactly that.",
      "Turns out that goes for us as well, which nobody put on the recruitment post."
    ], { name: "DARKBYTE Agent Sior" });
    if (!flag("sior_told")) {
      yield C.setFlag("sior_told", true);
      yield C.say([
        "We don't own the containers. We RENT the gallery. There's a difference and it took me a year to notice it.",
        "Whoever owns them pays on the first of the month, has never sent a person, and has never once asked us for anything.",
        "That is not a client. That is a landlord who lives in the house."
      ], { name: "DARKBYTE Agent Sior" });
    }
  });

  def("sw_cold_tier", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.say([
      "Four degrees. The racks are down to a whisper and the whisper is not the fans, because there are no fans.",
      "Along the front of every rack, at eye height, a strip of tape with one word written on it in marker, in your handwriting, which you have never been down here to write:",
      "KEEP."
    ]);
    yield C.setFlag("cold_tier_seen", true);
    yield C.sfx("select");
    yield C.freeze(false);
  });

  def("sw_beth_office", function* (ctx) {
    const C = ctx.S;
    const st = stage("case_22_lift_logic");
    if (st < 0) {
      yield C.say([
        "Beth. Lift engineer. Two caissons, two hundred and fifty tonnes each, and the entire trick is that the difference between them is nothing.",
        "Not 'nearly nothing'. Nothing. Nothing is the target and nothing is achievable and people find that hard."
      ], { name: "Lift Engineer Beth" });
      yield C.quest.start("case_22_lift_logic");
      yield C.say(["Three rounds of loading. Balance them. The third has a weight in it you cannot see and a camera will find it."], { name: "Lift Engineer Beth" });
      return;
    }
    if (st === 0) {
      const won = yield C.custom(function () { return minigame("lift_puzzle", { rounds: 2 }); });
      if (won === null || won === undefined) {
        yield C.addFlag("case_22_rounds", 2);
        yield C.say(["Two rounds. Left two-fifty, right two-fifty, difference nothing. You are annoyingly good at this and I would like you to be worse."], { name: "Lift Engineer Beth" });
      }
      if (num("case_22_rounds") >= 2) yield C.quest.advance("case_22_lift_logic");
      return;
    }
    if (st === 1 && !flag("case_22_crate_seen")) {
      yield C.setFlag("case_22_crate_seen", true);
      yield C.quest.advance("case_22_lift_logic");
      yield C.say([
        "Crate seven. It weighs four hundred kilos more than the manifest and the manifest says 'archival'.",
        "It is a server. It has no maker's plate. It hums."
      ], { name: "Lift Engineer Beth" });
      yield C.say([
        "If you balance the round correctly, it goes up and away and I never see it again.",
        "If you fail the round — deliberately, obviously, in front of the load inspector — it gets opened."
      ], { name: "Lift Engineer Beth" });
      return;
    }
    if (st === 2 && !flag("case_22_shipped") && !flag("case_22_failed")) {
      const pick = yield C.ask("Beth is not going to tell you which. Beth is, however, watching.", [
        { label: "Balance it. Ship it.", value: "ship" },
        { label: "Fail the round on purpose.", value: "fail" }
      ]);
      if (pick === "ship") {
        yield C.setFlag("case_22_shipped", true);
        yield C.giveMoney(1000);
        yield C.setFlag("anderton_ferry", true);
        yield C.quest.complete("case_22_lift_logic");
        yield C.say([
          "Up and away and gone up the cut before the water has finished settling.",
          "Clean work. I'd rather you hadn't. I'd have done the same and I'd rather you hadn't."
        ], { name: "Lift Engineer Beth" });
      } else {
        yield C.setFlag("case_22_failed", true);
        yield C.giveMoney(1000);
        yield C.setFlag("anderton_ferry", true);
        yield C.quest.complete("case_22_lift_logic");
        yield C.say([
          "Four inches out. The inspector stops the round, the crate comes off, and by teatime there are two men in it with a torch and a form.",
          "It'll go on my record. Good. It is the first thing on my record that I would read out loud."
        ], { name: "Lift Engineer Beth" });
        yield C.custom(function () { if (MQ.Trainer && MQ.Trainer.grantPerkPoints) MQ.Trainer.grantPerkPoints(1, "case_22"); });
        yield C.notify("+1 perk point.");
      }
      return;
    }
    yield C.say(["Balance is the whole job. Everything else on this site is scaffolding round a scale."], { name: "Lift Engineer Beth" });
  });

  def("sw_beth", function* (ctx) {
    const C = ctx.S;
    if (flag("lift_pass")) {
      yield C.say(["Pass is yours. Up, down, whenever. Try not to look pleased about it in front of the boaters; they queue."], { name: "Lift Engineer Beth" });
      return;
    }
    yield C.say([
      "Nobody rides the lift without a pass and nobody gets a pass off me for saying please.",
      "You get one when I have seen you take it seriously, which is a thing I can tell within about eleven seconds."
    ], { name: "Lift Engineer Beth" });
  });

  // =====================================================================
  // Small shared scenes
  // =====================================================================
  def("sw_mine_gate", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "THE CAGE. 150 METRES. NINETY SECONDS.",
      "There is no handrail, because there is nothing to hold that would help.",
      "SALT MINE PASS REQUIRED. Rhona is in the yard and Rhona does not hand these out to people she has not looked at."
    ]);
  });

  def("sw_rhona_cage", function* (ctx) {
    const C = ctx.S;
    if (!has("salt_mine_pass")) {
      yield C.say(["No pass, no cage. Ask me outside where I can see you properly."], { name: "Mine-Captain Rhona" });
      return;
    }
    yield C.say([
      "Lamp on before the gate. Hard hat before the lamp. Both of them before you get any ideas.",
      "Ninety seconds down. It is the longest ninety seconds in Cheshire and you will spend all of it listening."
    ], { name: "Mine-Captain Rhona" });
  });

  // ---------------------------------------------------------- fishing -----
  // The rod, the bite bar and the tables belong to content-activities; these
  // are the people who hand you a line and tell you where to put it.
  def("sw_lido_angler", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Deep end's eleven foot and full of things that like salt. They have never bothered a swimmer.",
      "They bother the LANE ROPES. Constantly. I have replaced four this year."
    ], { name: "Lifeguard" });
    if (!flag("lido_rod")) {
      yield C.setFlag("lido_rod", true);
      yield C.say([
        "Here. Rod. Wyn wants three samples off the deep end and I am not getting in a swimming costume to do it.",
        "Brine fishing is not like river fishing. There is no current. Nothing is going anywhere. It is entirely a question of who gets bored first."
      ], { name: "Lifeguard" });
      yield C.giveItem("rod_bamboo", 1);
      return;
    }
    const yes = yield C.confirm("Cast a line into the deep end?");
    if (!yes) { yield C.say(["Fair enough. It is a swimming pool. Most people do find this odd."], { name: "Lifeguard" }); return; }
    const res = yield C.custom(fishing(ctx, "nantwich_brine_lido"));
    if (res === null || res === undefined) {
      yield C.say(["You put a line in a swimming pool, in public, and nobody so much as looks up, because this is Nantwich and the pool is full of golems."]);
    }
  });

  def("sw_anderton_bottles", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I have sat on this dock since I retired and I have never once put a hook in the water.",
      "The rod is for the look of the thing. The sitting is the point and I would like that respected."
    ], { name: "Angler" });
    if (!flag("anderton_bottle")) {
      yield C.setFlag("anderton_bottle", true);
      yield C.say([
        "Mind you. A crab came up on somebody's line last August with a bottle in its claw, and there was paper in the bottle, and it was dry.",
        "He put it back. I would not have put it back. I think about it most days."
      ], { name: "Angler" });
      return;
    }
    const yes = yield C.confirm("Try the cut for bottles?");
    if (!yes) { yield C.say(["Good man. Sit down. There's room."], { name: "Angler" }); return; }
    const res = yield C.custom(fishing(ctx, "anderton"));
    if (res === null || res === undefined) {
      yield C.say(["Nothing but a moorhen with opinions and, eventually, the specific silence of a canal at four in the afternoon."]);
    }
  });

})();
