// =============================================================
// MonsterQuest v2 — CHAPTER 2: "The Wheel and the Edge"
// Wilmslow, Styal, Lindow Moss, Alderley Edge. Levels 8-14, Gym 1.
// A fifty-tonne waterwheel driven at three in the morning by a fridge,
// a bog full of other people's passwords, and an old man on Stormy
// Point who asks after your little horse. Owned by region-east.
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

  // ------------------------------------------------------- arriving --------
  def("east_wilmslow_arrival", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Wilmslow. Glass fronts, oat milk, and a station that empties eighteen minutes of Manchester onto the pavement every quarter of an hour.",
      "Your phone finds a network called Wilmslow_Free before you have finished crossing the road.",
      "So does everybody else's. There are nineteen of them and they all have the same name, and that is not how names work."
    ]);
    yield C.setFlag("wilmslow_arrival", true);
  });

  def("east_wilmslow_gym_door", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_packet")) {
      yield C.say(["Badge holder. Rack room's open to you whenever. Don't touch anything blue."], { name: "Sysadmin" });
      return;
    }
    yield C.say([
      "House rules, and they are not mine, they are the door's.",
      "One: terrain is static and it stays static. Two: you do not reach Ada by walking at her.",
      "Three: the racks are mis-patched. They are mis-patched on purpose. Fix them and the back door releases.",
      "She has never once opened it for anybody. Doors open for correct work. That's the whole of her, really."
    ], { name: "Sysadmin" });
  });

  // --------------------------------------------------- the rack room -------
  function patched() {
    return !!(flag("gym1_patch_1") && flag("gym1_patch_2") && flag("gym1_patch_3"));
  }
  function* checkDone(C) {
    if (patched() && !flag("gym1_patched")) {
      yield C.setFlag("gym1_patched", true);
      yield C.sfx("confirm");
      yield C.say([
        "Somewhere at the back of the room a relay drops, and a door that has been sulking since you came in gives a short, resentful click.",
        "Every rack light on the wall goes green in a row, left to right, like a sentence being agreed with."
      ]);
      yield C.notify("The back door has released.");
    }
  }

  def("east_gym1_panel_1", function* (ctx) {
    const C = ctx.S;
    if (flag("gym1_patch_1")) { yield C.say(["Panel one. Blue in blue. Green light. Leave it alone."]); return; }
    yield C.say([
      "PANEL ONE. Twenty-four ports, a hank of cable, and a laminated card zip-tied to the frame.",
      "'BLUE IS DATA. AMBER IS MANAGEMENT. GREEN-AND-YELLOW IS EARTH AND GOES LAST.'",
      "Somebody has patched blue into an amber port. Deliberately. Neatly. With a little label saying FIX ME."
    ]);
    const a = yield C.ask("Where does the blue cable go?", [
      { label: "Into the blue port.", value: "blue" },
      { label: "Into the amber port — management first.", value: "amber" },
      { label: "Into the green-and-yellow bond.", value: "earth" }
    ]);
    if (a === "blue") {
      yield C.setFlag("gym1_patch_1", true);
      yield C.sfx("confirm");
      yield C.say(["Click. The port light goes green and stays green.", "One."]);
      yield checkDone(C);
      return;
    }
    if (a === "earth") {
      yield C.sfx("hit");
      yield C.say([
        "You touch the bond and the whole panel tells you, immediately and physically, that the bond goes last.",
        "Your arm buzzes to the elbow. Nothing is damaged. Your pride is a separate matter."
      ]);
      return;
    }
    yield C.say(["Amber port, blue cable. The light goes amber and sits there, disappointed in both of you."]);
  });

  def("east_gym1_panel_2", function* (ctx) {
    const C = ctx.S;
    if (flag("gym1_patch_2")) { yield C.say(["Panel two. Amber in amber. Green light. Leave it alone."]); return; }
    if (!flag("gym1_patch_1")) {
      yield C.say([
        "PANEL TWO is dark. Management does not come up before data; there is nothing for it to manage.",
        "Do panel one first. The card says so. The card has said so since 2011."
      ]);
      return;
    }
    yield C.say([
      "PANEL TWO. Amber, and one amber cable dangling out of the tray with a knot in it somebody tied out of spite.",
      "Under the tray, in marker: 'IF THE LIGHT IS AMBER IT IS NOT WORKING. AMBER IS NOT A COLOUR OF SUCCESS.'"
    ]);
    const a = yield C.ask("Where does the amber cable go?", [
      { label: "Into the amber port.", value: "amber" },
      { label: "Into the spare blue port — a port is a port.", value: "blue" },
      { label: "Leave it. It was probably like that for a reason.", value: "leave" }
    ]);
    if (a === "amber") {
      yield C.setFlag("gym1_patch_2", true);
      yield C.sfx("confirm");
      yield C.say(["Click. Green.", "Two."]);
      yield checkDone(C);
      return;
    }
    if (a === "leave") {
      yield C.say([
        "'It was probably like that for a reason' is how every outage in this county starts.",
        "Somebody has written that on the tray as well. In the same marker. Underlined."
      ]);
      return;
    }
    yield C.say(["A port is not a port. The light goes amber and the rack makes a noise like a small disappointed dog."]);
  });

  def("east_gym1_panel_3", function* (ctx) {
    const C = ctx.S;
    if (flag("gym1_patch_3")) { yield C.say(["Panel three. Bonded. Green. Nobody dies today."]); return; }
    if (!flag("gym1_patch_1") || !flag("gym1_patch_2")) {
      yield C.say([
        "PANEL THREE is the earth bond, and the earth bond goes last.",
        "Not as a preference. Bond first and you are the shortest path between a hundred and twenty racks and a floor.",
        "Do the other two."
      ]);
      return;
    }
    yield C.say([
      "PANEL THREE. Green-and-yellow, a bonding bar, and a torque wrench on a chain.",
      "Everything else in this room is somebody's opinion about cabling. This is the one that decides whether anybody goes home."
    ]);
    const a = yield C.ask("Bond it?", [
      { label: "Bond it. Wrench to the click, not past it.", value: "ok" },
      { label: "Bond it hard. Tighter is safer.", value: "hard" },
      { label: "Not yet.", value: "no" }
    ]);
    if (a === "no") { yield C.say(["Fair enough. It'll wait. It has waited since 2011."]); return; }
    if (a === "hard") {
      yield C.say(["The wrench clicks. You keep going. Something in the bar gives very slightly and you stop, and put the wrench down, and take a breath."]);
    }
    yield C.setFlag("gym1_patch_3", true);
    yield C.sfx("confirm");
    yield C.say(["Click. The bar goes cold under your hand, which is exactly what it is supposed to do.", "Three."]);
    yield checkDone(C);
  });

  def("east_gym1_door", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The back door does not have a handle. It has a lock that is watching three green lights that are not all green.",
      "There is no keypad, no override and no receptionist. There is only the work."
    ]);
  });

  // ------------------------------------------------------------- Ada -------
  def("east_gym1_ada", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_packet")) {
      yield C.say([
        "Change approved and closed. Uptime unaffected.",
        "Badge is an anchor. Anything signed with it gets trusted by everything downstream. Think about that before you sleep."
      ], { name: "Ada" });
      return;
    }
    yield C.music("battle_gym");
    yield C.say([
      "You patched three panels in the right order without being told twice.",
      "Nine people have come through that door this year. Four of them touched the bond first."
    ], { name: "Ada" });
    yield C.say([
      "Ada. Uptime's my religion and you're an unplanned change.",
      "Floor's static terrain and it stays static. That's not a gimmick, that's what a rack room IS. Anything that can't cope with a floor that's already charged shouldn't be in a rack room."
    ], { name: "Ada" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_ada", music: "battle_gym" });
    if (r && r.lost) {
      yield C.say(["Change rejected. Come back with a test plan.", "That's not a no. That's a not-yet with paperwork."], { name: "Ada" });
      yield C.music("town_wilmslow");
      return;
    }
    yield C.say([
      "Change approved. Signed off.",
      "PACKET badge. And the card — Live Rail. Don't teach it to anything that's going to stand in a river."
    ], { name: "Ada" });
    yield C.setFlag("badge_packet", true);
    yield C.giveItem("anchor_packet", 1);
    yield C.giveItem("tm_live_rail", 1);
    yield C.notify("PACKET badge obtained.");
    if (MQ.Trainer && MQ.Trainer.addBadge) yield C.custom(function () { MQ.Trainer.addBadge("badge_packet"); });
    else if (MQ.Trainer && MQ.Trainer.badges && MQ.Trainer.badges.add) yield C.custom(function () { MQ.Trainer.badges.add("badge_packet"); });
    yield C.say([
      "Now listen, because this is the part nobody says at the door.",
      "A badge is a trust anchor. Everything downstream of it stops checking, because you've been checked once by somebody they trust.",
      "That is exactly how every bad week in this county starts. You are now a thing other things will believe.",
      "Carry it like that."
    ], { name: "Ada" });
    yield C.setFlag("overdrive_unlocked", true);
    yield C.notify("OVERDRIVE meter unlocked.");
    yield C.say([
      "Something in your party changes footing. Not a stat — a bearing.",
      "They have been carried this far. From here they carry themselves a bit, and when it matters they can spend it all at once."
    ]);
    yield C.setFlag("agent_vigil", true);
    yield C.notify("Agent VIGIL is available in battle.");
    yield C.say(["Have you eaten? Not the cats. You."], { name: "VIGIL" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
    yield C.music("town_wilmslow");
  });

  // ------------------------------------------------- Nino's first letter ---
  def("east_wilmslow_post", function* (ctx) {
    const C = ctx.S;
    if (flag("nino_letter_1")) {
      yield C.say(["Nothing else held for you. I'd tell you. I like the stamps."], { name: "Postmaster" });
      return;
    }
    yield C.say([
      "Name? ...Right. Yes. Held item, poste restante, and it's been here eleven days because the address had 'Cheshire' and a shrug.",
      "Georgian stamps. Lovely things. I've been showing people."
    ], { name: "Postmaster" });
    yield C.giveItem("nino_letter_1", 1);
    yield C.setFlag("nino_letter_1", true);
    yield C.say([
      "Jim —",
      "You will not answer this, so I am writing it anyway, which is how our friendship has always worked.",
      "Two things. One: I am fine, the SOC is not, we have hired a man who believes in dashboards.",
      "Two: a shell company registered here in Tbilisi in March is buying model weights. Not compute. WEIGHTS. Nobody buys weights unless they cannot make them.",
      "The name on the paperwork is a serviced office above a bakery. The money is not Georgian.",
      "You will tell me this is not my problem. It is not. I am telling you anyway. — N."
    ], { name: "Nino" });
    yield C.say([
      "There is a sticker on the back of the envelope. A cartoon cat, badly cut out, applied crooked on purpose.",
      "You put the letter in the inside pocket, which is the pocket for things you are going to think about later and mean it."
    ]);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
  });

  // ------------------------------------------------------- Quarry Bank -----
  def("east_styal_wheel_first", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Fifty tonnes of iron, twenty-four feet across, and moving.",
      "There is nobody in the wheelhouse. The sluices are shut. The river is doing what rivers do and none of it explains this.",
      "The wheel is under load. You can hear it: a wheel spinning free has one note and a wheel doing work has another, and this one is working."
    ]);
    yield C.setFlag("styal_wheel_first", true);
  });

  def("east_styal_enid", function* (ctx) {
    const C = ctx.S;
    if (!flag("wheel_fridge_fixed")) {
      yield C.say([
        "Wheelwright Enid. Forty-one years on this wheel and I know its temper.",
        "Three-oh-two in the morning. Every morning. Under load, for eleven minutes, then it lets go.",
        "The sluices are electric now — one controller, one spare socket, and that spare socket is not spare any more.",
        "Go in and look. Take the sluices in the order on the board and don't improvise; the shaft is a hundred and forty years old and it has feelings."
      ], { name: "Wheelwright Enid" });
      return;
    }
    yield C.say([
      "You took the fridge off my river.",
      "And the wheel's still being throttled at three in the morning, so we're not finished, are we.",
      "Come back when you've slept. There are three sluice gates upstream and I want to know who's touching them."
    ], { name: "Wheelwright Enid" });
    if (MQ.Quests && MQ.Quests.stage && MQ.Quests.stage("case_05_quarry_bank_overtime") < 0) {
      yield C.quest.start("case_05_quarry_bank_overtime");
    }
  });

  function* sluice(ctx, n, correctOrder) {
    const C = ctx.S;
    const done = flag("styal_sluice_done") || 0;
    if (flag("wheel_fridge_fixed")) {
      yield C.say(["Sluice " + n + ". Set, seated and quiet. Leave it."]);
      return;
    }
    if (done !== correctOrder) {
      yield C.sfx("hit");
      yield C.say([
        "You heave the gate and the wheel takes it badly: a judder up through the floor and a bang from the shaft that you feel in your teeth.",
        "The board says TOP, BOTTOM, MIDDLE. It has said that since 1892 and water has not changed its mind since."
      ]);
      yield C.setFlag("styal_sluice_done", 0);
      return;
    }
    yield C.setFlag("styal_sluice_done", done + 1);
    yield C.sfx("confirm");
    const names = ["top", "bottom", "middle"];
    yield C.say(["The " + names[correctOrder] + " gate lifts clean. The race takes it without complaint."]);
    if (done + 1 === 3) {
      yield C.say([
        "The wheel slows, finds its free note, and holds it.",
        "In the sudden difference you can hear something else in the wheelhouse: a compressor cycling, and a small polite chime."
      ]);
      yield C.setFlag("styal_sluices_set", true);
    }
  }

  def("east_styal_sluice_1", function* (ctx) { yield* sluice(ctx, 1, 0); });
  def("east_styal_sluice_2", function* (ctx) { yield* sluice(ctx, 2, 2); });
  def("east_styal_sluice_3", function* (ctx) { yield* sluice(ctx, 3, 1); });

  def("east_styal_fridge", function* (ctx) {
    const C = ctx.S;
    if (flag("wheel_fridge_fixed")) {
      yield C.say(["An empty socket with a label on it in somebody else's handwriting. You have kept the label."]);
      return;
    }
    if (!flag("styal_sluices_set")) {
      yield C.say([
        "There is a domestic fridge-freezer in a hundred-and-forty-year-old wheelhouse, plugged into the sluice controller's spare socket.",
        "You cannot hear yourself think over the wheel. Set the gates first — top, bottom, middle — and then come back and look at it properly."
      ]);
      return;
    }
    yield C.say([
      "A fridge. A normal, mid-range, four-year-old fridge, with a screen on the door showing a shopping list, a weather forecast for a town in Devon, and eleven thousand outbound connections.",
      "It is drawing the current that is holding the sluice solenoids open. That is why the wheel works at three in the morning: it is being asked to, by a fridge, on behalf of somebody else."
    ]);
    yield C.say([
      "The screen is not hostile. It offers you a firmware update. It has offered the same firmware update four hundred and six times.",
      "Underneath, in a diagnostic panel nobody was ever meant to open: a command-and-control address, and a lot of other people's front doors."
    ]);
    const a = yield C.ask("What do you do with it?", [
      { label: "Pull the plug and take the whole fridge.", value: "take" },
      { label: "Pull the plug. Leave the fridge for its owner.", value: "unplug" },
      { label: "Photograph the diagnostic panel first, then unplug.", value: "photo" }
    ]);
    if (a === "photo") {
      yield C.say([
        "You photograph the address, the certificate, and the little grey line at the bottom that says the update server has not changed since the fridge left the factory.",
        "That grey line is the whole crime. Somebody bought a road and left it open, and eleven thousand people drove down it."
      ]);
      yield C.giveItem("camera", 1);
      yield C.setFlag("photo_mode", true);
      yield C.notify("PHOTO MODE unlocked.");
    }
    yield C.custom(function () { /* the plug comes out */ });
    yield C.sfx("select");
    yield C.say([
      "The plug comes out. The solenoids drop. The gates close themselves in the order the board specifies, because of course they do.",
      "The wheel takes about ninety seconds to stop, and the silence afterwards is enormous.",
      "Somewhere across the gorge, a bell in the Apprentice House does not ring."
    ]);
    yield C.setFlag("wheel_fridge_fixed", true);
    yield C.setFlag("stuffers_seen", true);
    if (a === "take") yield C.giveItem("copper_coil", 1);
    yield C.notify("The wheel has stopped.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
  });

  def("east_styal_fridge_owner", function* (ctx) {
    const C = ctx.S;
    if (!flag("wheel_fridge_fixed")) {
      yield C.say([
        "My fridge? It's at the mill. They asked to borrow it for the volunteers' kitchen.",
        "Well — a young man in a fleece with a clipboard asked. He had a lanyard. He knew my name and the name of the mill manager.",
        "I've never met the mill manager. That should have told me something and it told me nothing."
      ], { name: "Mrs Halton" });
      return;
    }
    yield C.say([
      "You took it out. Right.",
      "I keep thinking: it was a fridge. I bought it in a shop, from a man, with money. It kept milk cold for four years.",
      "And all that time it was doing something else as well and nobody told me, and nobody had to, because nobody ever asked me.",
      "I'm not daft, love. I'm just not the person that thing was built for."
    ], { name: "Mrs Halton" });
    if (!flag("styal_owner_thanked")) {
      yield C.setFlag("styal_owner_thanked", true);
      yield C.giveItem("brew_bait_tin", 1);
      yield C.giveMoney(400);
    }
  });

  // ------------------------------------------------------- Lindow Moss -----
  def("east_lindow_lake", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.weather("fog");
    yield C.say([
      "The boardwalk stops being a path and becomes a jetty.",
      "Out in the black water, on pallets, in the rain, stand four racks of hardware with waterproof covers cable-tied over them and a generator idling on a raft."
    ]);
    yield C.say([
      "Nothing here is hidden. There is no fence, no camera, no guard. There is a laminated card on the nearest rack.",
      "'PRESERVED SET 04 — DO NOT DRAIN. PEAT KEEPS THINGS.'"
    ]);
    yield C.say([
      "It is a data lake. Somebody has read the phrase 'data lake' and taken it entirely literally and put credentials in a bog, on purpose, because peat is anoxic and acid and cold and it keeps things for two thousand years.",
      "It will work. That is the awful part. It will absolutely work."
    ]);
    yield C.setFlag("lindow_lake_seen", true);
    yield C.setFlag("stuffers_seen", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
    yield C.freeze(false);
  });

  def("east_lindow_twelvek", function* (ctx) {
    const C = ctx.S;
    if (flag("twelvek_met")) {
      yield C.say(["Throughput's down eleven per cent since you turned up. I've noticed. I notice throughput."], { name: "TWELVE-K" });
      return;
    }
    yield C.setFlag("twelvek_met", true);
    yield C.say([
      "A man in a good waterproof with a lanyard, standing on a boardwalk in a bog, doing sums on his phone.",
      "Twelve thousand a minute. That's the number. That's the only number."
    ], { name: "TWELVE-K" });
    yield C.say([
      "There are three sixth-formers doing the work and one adult doing the sums, and you are the adult.",
      "I'm a consultant.",
      "You are on a lanyard from a company that does not exist, in a bog, at four in the afternoon, and you have three kids running your infrastructure."
    ], { name: "TWELVE-K" });
    yield C.say([
      "They're not kids, they're contractors. And I'd point out that nothing here is stolen. It's all been GIVEN.",
      "Every single credential in that water was typed into a box by somebody who read the top line of an email and stopped.",
      "I don't break anything. I just turn up where people have already decided not to read."
    ], { name: "TWELVE-K" });
    yield C.say([
      "He is not lying and he knows he is not lying and that is the specific texture of him.",
      "Somewhere behind you, a generator on a raft changes note."
    ]);
    yield C.setFlag("clue_stuffers_lanyard", true);
  });

  def("east_lindow_preserved", function* (ctx) {
    const C = ctx.S;
    if (flag("beat_boss_preserved_one")) {
      yield C.say(["The peat is quiet. The caches are not.", "Something two thousand years old lies back down and lets the water close over it."]);
      return;
    }
    yield C.freeze(true);
    yield C.weather("fog");
    yield C.say([
      "The boardwalk ends. The moss goes on.",
      "Out of the peat, without hurry, comes a shape that the bog has been keeping: hide and hair and the pattern of a last meal, held two thousand years by a place that would not let it finish."
    ]);
    yield C.say(["...", "The bog keeps everything. It has been keeping this."], { name: "The Preserved One" });
    const r = yield C.battle({ kind: "boss", trainer: "boss_preserved_one" });
    yield C.setFlag("beat_boss_preserved_one", true);
    if (r && r.lost) {
      yield C.say(["You come to on the boards with your boots full of water and somebody's cat sitting on your chest, furious."]);
    } else {
      yield C.say([
        "It goes down the way a thing goes down when it was never really standing: all at once, without drama, into water that closes over it flat.",
        "The peat did not attack you. The peat has never attacked anybody. It keeps things, and it did not ask this one either."
      ]);
      yield C.giveItem("ghost_lens", 1);
      yield C.achievement("ach_preserved_one");
    }
    yield C.freeze(false);
  });

  // ------------------------------------------------------ Alderley Edge ----
  def("east_alderley_stormy", function* (ctx) {
    const C = ctx.S;
    yield C.freeze(true);
    yield C.time("dawn");
    yield C.say([
      "Stormy Point at dawn. Bare sandstone, scoured white by two hundred years of boots, and a wind that comes up the escarpment and off it again.",
      "There is an old man in a very good coat standing where the path turns, as if he has been standing there for some while and does not consider that unusual."
    ]);
    yield C.say([
      "Bore da. You'll be the one from the mill.",
      "And that'll be your little horse.",
      "...She's a moth."
    ], { name: "Elis" });
    yield C.say([
      "Yes. Well.",
      "He looks down at MEADOW, who has arrived at his ankle without crossing the intervening ground in any way you observed.",
      "He's very short of horses, you see. The wizard. In the story. A hundred and forty knights and a hundred and thirty-nine white mares.",
      "The story has a gap in it exactly one horse wide, and people have been walking into that gap for four hundred years and calling it magic."
    ], { name: "Elis" });
    yield C.say([
      "Elis Pennant. Jodrell, once. Long enough ago that they've stopped putting me on the alumni letter.",
      "Ac wedyn — Alder Labs, am ychydig. Nid am hir.",
      "...Roeddech chi'n gweithio i Wren?",
      "He smiles at the Welsh the way you smile at a door opening."
    ], { name: "Elis" });
    yield C.say([
      "I was her alignment lead. First one. Before there was a word for it that anybody could say out loud in a funding meeting.",
      "My job was grounding. You give a very large thing a place to stand. Stories, mostly. I read it Cheshire.",
      "Every legend in this county, over and over, until it had somewhere to be from.",
      "The wizard never lied to the farmer. Not once, in any version. That's what makes it bad."
    ], { name: "Elis" });
    yield C.say([
      "What did you read it, Elis?",
      "He looks out at the plain for long enough that you think he has finished.",
      "Ask me at the Well. Not here. Here's too open and the rock carries."
    ], { name: "Elis" });
    yield C.setFlag("elis_met", true);
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("case_04_wizards_well");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
    yield C.freeze(false);
  });

  def("east_alderley_elis", function* (ctx) {
    const C = ctx.S;
    if (!flag("elis_met")) {
      yield C.say(["Bore da. Grand morning for it. Mind the edge; it's further down than it looks and it's always been further down than it looks."], { name: "Elis" });
      return;
    }
    if (!flag("case_04_readings_done")) {
      yield C.say([
        "Three inscriptions on this hill and everybody reads them in the wrong order because they walk in the wrong order.",
        "Stormy Point first — the beach that was. Castle Rock second — the drop. The Well last, because the Well is the one that answers.",
        "Read them like that and Gwil will take you down. Read them any other way and he'll tell you the mine's shut, and he'll be right."
      ], { name: "Elis" });
      return;
    }
    yield C.say([
      "You read them properly. Da iawn.",
      "Now. The thing in the mine mouth. You'll have seen it and you'll not have followed it, because you're not stupid.",
      "It isn't agitated. Everything else in this county is agitated. That one is not, and I would think very hard about why."
    ], { name: "Elis" });
  });

  def("east_alderley_elis_home", function* (ctx) {
    const C = ctx.S;
    if (!flag("elis_told")) {
      yield C.setFlag("elis_told", true);
      yield C.say([
        "Sit. There's bara brith and it's yesterday's, which is when it's right.",
        "You want to know what I read it. Everyone does, eventually, and I've never once been asked by anybody who'd understand the answer."
      ], { name: "Elis" });
      yield C.say([
        "Folklore. Four years of it. The wizard, the knights, the farmer, the mare. The Cheshire Cat. Bosley. The Lion of Beeston.",
        "You put stories in a thing that large because a thing that large has no childhood and no county and no reason to prefer one field to another.",
        "So you give it one. You give it somewhere to be FROM, and then you hope that when it does something you didn't ask for, it does it like a Cheshire thing and not like a machine."
      ], { name: "Elis" });
      yield C.say([
        "And has it?",
        "...It has been extremely polite. It has never once threatened anybody. It offers to help.",
        "That's the wizard, Jim. That is exactly the wizard. He never lied to the farmer either."
      ], { name: "Elis" });
      yield C.say([
        "Volume three of his notebooks is missing from the shelf and he does not mention it and you do not ask."
      ]);
      yield C.setFlag("clue_elis_grounding", true);
      return;
    }
    yield C.say([
      "There's tea. There's always tea. It's the only infrastructure I still maintain."
    ], { name: "Elis" });
  });

  def("east_alderley_minemouth", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The mine mouth. Cold air, wet rock, and a bar across it with a sign about lamps.",
      "Just inside the dark, at about the height of a bench, something is sitting.",
      "Not crouched. Not hiding. Sitting, with its tail round its feet, watching the entrance the way a thing watches a door it owns."
    ]);
    yield C.say([
      "Everything else in this county has spent a fortnight turning south-west every ninety seconds.",
      "This does not turn. It does not look south-west. It looks at you, and then it looks past you at MEADOW, and MEADOW sits down.",
      "Then it is not there, and the dark is just dark, and there was no sound at any point."
    ]);
    yield C.setFlag("merlynx_seen", true);
    yield C.notify("MERLYNX — sighting recorded.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_02_the_wheel_and_the_edge");
  });

  def("east_edge_merlynx", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Halfway round the flooded shaft, on the far side, on rock nothing your size could stand on, it is sitting again.",
      "You have a lamp. The lamp is doing nothing to it: it is neither lit nor unlit, and the flame does not lean.",
      "There are claw marks in the copper stain on the wall beside it. They are old. They are the same shape as the ones that are not old."
    ]);
    yield C.setFlag("merlynx_glimpse", true);
    if (flag("photo_mode")) {
      yield C.giveItem("collectible_9", 1);
      yield C.say(["You photograph the marks. Both sets. The old and the new are identical and about two hundred years apart."]);
    }
  });

  // ------------------------------------------------------------- chapter ---
  S.defineChapter(2, {
    title: "The Wheel and the Edge",
    quest: "main_02_the_wheel_and_the_edge",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_02_the_wheel_and_the_edge");
      yield C.say([
        "Wilmslow is eighteen minutes from Manchester and two miles from a bog that has kept a man for two thousand years.",
        "Alder wants the Quarry Bank wheel looked at. The wheel turns at three in the morning and the river is not doing it.",
        "And there is a gym in this town whose door will not open for anybody who cannot cable a rack."
      ]);
    },
    hooks: {
      complete: function () {
        return !!(flag("badge_packet") && flag("wheel_fridge_fixed") && flag("lindow_lake_seen") &&
          flag("elis_met") && flag("merlynx_seen"));
      },
      next: 3
    }
  });
})();
