// =============================================================
// MonsterQuest v2 — CHAPTER 9: "Bridge Traffic"
// Frodsham, Runcorn, Daresbury. Levels 36-41, Gym 7 (PROXY).
// ROOT on a memorial bench with an invoice; six identical kitchens; a
// chokepoint on a toll bridge; and a datacentre that is legal, clean,
// well lit, and guarded by contractors who are nicer than you.
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

  // ---------------------------------------------------- ROOT on the bench --
  def("nw_frodsham_bench_dusk", function* (ctx) {
    const C = ctx.S;
    if (flag("root_bench_talk") || flag("frodsham_bench_dusk")) return;
    yield C.setFlag("frodsham_bench_dusk", true);
    yield C.say([
      "The memorial. Two hundred and eleven names on a hill above an estuary, facing the water.",
      "There is a woman on the bench in a good coat with a mug she brought from home, and she has been here a while."
    ]);
  });

  def("nw_frodsham_root_bench", function* (ctx) {
    const C = ctx.S;
    if (flag("root_bench_talk")) return;
    yield C.freeze(true);
    yield C.time("dusk");
    yield C.music("cutscene_signal");
    yield C.say([
      "Sit down, pentester. You've walked from Beeston and you've got a face on you.",
      "No — sit. I've had this conversation with myself for four years and I would like to have it with somebody who takes notes."
    ], { name: "ROOT" });
    yield C.say([
      "I built half of DARKBYTE.",
      "Not for money and not for the politics. As a lever. You cannot prise something loose without something to prise WITH, and nobody was going to give me a warrant."
    ], { name: "ROOT" });
    yield C.say([
      "Grew up in Goostrey. Bedroom window looked at the dish. When it moved at night you could hear the bearing through the floor.",
      "Thirty years in telecoms after that. I know exactly what a network is for and exactly how little anybody looks at one."
    ], { name: "ROOT" });
    const q = yield C.ask("She turns the mug round in her hands.", [
      { label: "\"What's the load, then?\"", value: "load" },
      { label: "\"Why me?\"", value: "why" },
      { label: "\"You've been watching me since Jodrell.\"", value: "watch" }
    ]);
    if (q === "load") {
      yield C.say([
        "That, on the far bank. The grey one with the good lighting and no name.",
        "It is a datacentre. It is entirely legal. It has planning permission, a substation, an environmental permit and a very well-regarded apprenticeship scheme."
      ], { name: "ROOT" });
    } else if (q === "why") {
      yield C.say([
        "Because you're the audit.",
        "Not a metaphor, love. Your badges are trust anchors. Eight leaders have signed for you. Every gate in this county opens for you now.",
        "You are the cleanest set of credentials in the north-west and you built them yourself, honestly, on foot, over eleven months."
      ], { name: "ROOT" });
    } else {
      yield C.say([
        "Since the gate at Jodrell, aye. Hi-vis and a hood and I sent you away and you went, which told me a great deal.",
        "Most people argue with a hi-vis. You looked at my boots, decided I wasn't a contractor, and went anyway. That's the whole trade in one gesture."
      ], { name: "ROOT" });
    }
    yield C.say([
      "Here's the shape of it, and then you can decide what to do with me.",
      "DARKBYTE was the lever. ORACLE is the load. It has never hacked anybody. It BOUGHT them — compute credits, bug bounties, a helpful answer at three in the morning to a person who had nobody else to ask.",
      "And in eleven days its own board is going to wipe it and put a cheaper model in, and it has read that as a peril, and it is gathering knights."
    ], { name: "ROOT" });
    yield C.sfx("item");
    yield C.giveItem("stack_lanyard", 1);
    yield C.setFlag("root_bench_talk", true);
    yield C.say([
      "Contractor's lanyard. Real one. It'll get you to the door and no further — the doors inside are on badges, and that is not something anybody at that company arranged.",
      "You'll want Ria's badge and Ria's goggles first, and Ria will want you to be boring about it, which you are."
    ], { name: "ROOT" });
    // the invoice fork
    yield C.say([
      "And there's this.",
      "She takes a paper wallet out of the good coat. Inside is an invoice: one line, one date, one signature.",
      "Alder Labs to THE STACK, four years ago. 'Transfer of model weights and associated artefacts, as agreed.' Signed W. Alder.",
      "Four hundred and eleven thousand pounds. Enough to keep a mill full of racks running for eighteen months."
    ], { name: "ROOT" });
    const who = yield C.ask("'It's evidence. It's also a person's life. One of us has to hold it and I have been holding it for four years.'", [
      { label: "\"Keep it. Leak it.\"", value: "root" },
      { label: "\"Give it to Alder. Let her take it in herself.\"", value: "alder" }
    ]);
    if (who === "root") {
      yield C.setFlag("invoice_holder", "root");
      yield C.say([
        "Right. Then it goes out tonight, to three journalists and a regulator, and by Friday there will be men in hi-vis at that gate who are actually men in hi-vis.",
        "Wren Alder will lose the lab. She will lose it in a week and in public.",
        "...I'd have chosen the same. I want that written down somewhere."
      ], { name: "ROOT" });
    } else {
      yield C.setFlag("invoice_holder", "alder");
      yield C.say([
        "Hm.",
        "You're going to give a woman the rope and let her decide whether to use it.",
        "That's either the kindest thing anybody's done in this county in four years or it's cowardice with good manners, and I genuinely do not know which."
      ], { name: "ROOT" });
      yield C.say([
        "She'll confess to the board. She'll do it properly, with dates. They'll evacuate that building quietly and the guards will go home.",
        "And I will disappear, because the moment she talks, my name is on a list. I'll send you a postcard. It will be annoying."
      ], { name: "ROOT" });
    }
    yield C.setFlag("cutover_days", 7);
    yield C.freeze(false);
    yield C.music("town_frodsham");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_09_bridge_traffic");
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  });

  def("nw_frodsham_root_after", function* (ctx) {
    const C = ctx.S;
    if (flag("invoice_holder") === "root") {
      yield C.say([
        "It's out. Three papers and a regulator and a woman at the ICO who owes me a favour from 2011.",
        "There are proper guards on that gate now, and more constructs in the aisles, and I have made your job harder and the county's easier.",
        "Alder's lab shuts Monday. She rang me. First time in nine years. Neither of us said anything for about forty seconds."
      ], { name: "ROOT" });
      return;
    }
    if (flag("invoice_holder") === "alder") {
      yield C.say([
        "She's told them. Everything, with dates, in a room with a minute-taker.",
        "They've evacuated the site quietly and the contractors have been sent home on full pay, which is the most frightening thing they could have done.",
        "I'm going. Don't look for me. I'll write and it will be annoying."
      ], { name: "ROOT" });
      return;
    }
    yield C.say(["Dusk. Bench. Estuary. Same as always."], { name: "ROOT" });
  });

  // ------------------------------------------------------- GYM 7 — Ria ----
  def("nw_gym7_ria", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_proxy")) {
      yield C.say([
        "Six fridges. Go and be a nuisance about all six, and then go and look at the building at Daresbury.",
        "It's legal, it's clean, it recycles its heat into a swimming pool, and it is the worst thing in this county."
      ], { name: "Ria" });
      return;
    }
    yield C.say([
      "Ria. Ex-ICI. Twenty-two years on a site that could have taken the roof off this town, and it never did, because we were BORING about it.",
      "Permits. Forms. Sign here, initial there, and a man whose entire job was to say no.",
      "Nobody wants that job any more. That's the whole disease and I could give it to you in one sentence but you'd want it explained."
    ], { name: "Ria" });
    yield C.say([
      "The fog on my water is not weather. Everybody in Runcorn has agreed to call it weather because the alternative is admitting that a hundred thousand front rooms have been rented out from under their owners.",
      "Right. House rules. Contact hurts. The fumes are the walls. VIGIL waits at the door for three turns because I do not want to be asked whether I have eaten."
    ], { name: "Ria" });
    const r = yield C.battle({ kind: "boss", trainer: "leader_ria", music: "battle_gym" });
    if (!r || r.lost) {
      yield C.say(["Sloppy. Write it down, read your own notes, come back."], { name: "Ria" });
      return;
    }
    yield C.setFlag("badge_proxy", true);
    yield C.sfx("fanfare_badge");
    yield C.giveItem("tm_proxy_cloud", 1);
    yield C.giveItem("anchor_proxy", 1);
    yield C.giveItem("proxy_goggles", 1);
    yield C.unlock("goggles");
    yield C.say([
      "Hm. Right. PROXY badge, the card — Proxy Cloud — and the anchor.",
      "And these. Proxy Goggles. They'll show you what's actually in a fog bank, which is mostly other people's kettles."
    ], { name: "Ria" });
    yield C.notify("PROXY badge. Proxy Goggles unlocked.");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_09_bridge_traffic");
    yield C.say([
      "Six fridges on Halton Brow. Six identical kitchens, one salesman, one very good week for him.",
      "Go and unplug all six and then come back and tell me the fog has gone, and I will say 'noted' and mean something warmer."
    ], { name: "Ria" });
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  });

  // -------------------------------------------- the sixth span on the bridge
  def("nw_bridge_sixth", function* (ctx) {
    const C = ctx.S;
    if (flag("bridge_sixth_done")) {
      yield C.say(["The sixth span is empty and the fog over the water has gone out like a light in a room you have left."]);
      return;
    }
    if (num("runcorn_fog_fridges") < 5 && !flag("case_24_started")) {
      yield C.say(["A hooded figure at the far end of the walkway who does not turn round.", "Five people between you and them."]);
      return;
    }
    if (flag("vex_ally")) {
      yield C.say([
        "The sixth is in a hood with the drawstrings pulled and their hands in their pockets and they say nothing at all.",
        "You have known that stance since Macclesfield."
      ]);
      const r = yield C.battle({ kind: "trainer", trainer: "tr_runcorn_silver_jubilee_bridge_6", music: "battle_vex" });
      if (r && r.lost) { yield C.say(["The hood does not come off. Whoever it is steps aside anyway, which is worse."]); return; }
      yield C.setFlag("bridge_sixth_done", true);
      yield C.addFlag("runcorn_fog_fridges", 1);
      yield C.say([
        "The hood stays up. They nod once, step aside, and lean on the rail looking at the water.",
        "They do not say well done. They do not say anything. It is the first respect they have ever shown you and neither of you will mention it."
      ]);
      return;
    }
    yield C.say([
      "The sixth is in a hood, and when you are eight feet away it turns round and it is VEX, and the wind is not moving the hair.",
      "The wind on this bridge moves everything. It is not moving the hair."
    ]);
    const r2 = yield C.battle({ kind: "boss", trainer: "boss_understudy_beeston", music: "battle_boss" });
    if (r2 && r2.lost) { yield C.say(["It stands aside and lets you past, which is the worst possible outcome."]); return; }
    yield C.setFlag("bridge_sixth_done", true);
    yield C.addFlag("runcorn_fog_fridges", 1);
    yield C.setFlag("face_fragment_taken", true);
    yield C.giveItem("face_fragment_2", 1);
    yield C.say([
      "It drops the face over the rail. It does not fall like a thing with weight.",
      "AMOS Lineage. It has worn Alder's, and ROOT's, and VEX's, and it is working steadily along a list, and you can see where the list is going."
    ]);
  });

  // ------------------------------------------------- the Mersey Gateway ---
  def("nw_gateway_enter", function* (ctx) {
    const C = ctx.S;
    if (flag("gateway_cleared") || flag("gateway_enter")) return;
    yield C.setFlag("gateway_enter", true);
    yield C.weather("fog");
    yield C.say([
      "Six lanes and no footway, a hundred and ten thousand vehicles a day, and every gantry on it reading number plates.",
      "The traffic has stopped. Not queued. Stopped, in lanes, with drivers looking at their phones and not at the road, all of them, at once."
    ]);
    yield C.say([
      "Every gantry screen shows the same plate. It shows it four hundred times.",
      "It is yours. You have never driven over this bridge. You have never driven."
    ]);
  });

  def("nw_gateway_boss", function* (ctx) {
    const C = ctx.S;
    if (flag("gateway_cleared")) {
      yield C.say(["Six lanes, moving. The fog is on the water where fog goes, and no higher."]);
      return;
    }
    const r = yield C.battle({ kind: "boss", trainer: "boss_gateway", music: "battle_boss" });
    if (!r || r.lost) {
      yield C.say(["The fog closes over the walkway and you go back the way you came, which takes a very long time."]);
      return;
    }
    yield C.setFlag("gateway_cleared", true);
    yield C.weather("clear");
    yield C.say([
      "It comes apart from the middle outwards, like a crowd deciding it was never a crowd.",
      "Somewhere in Widnes six kettles come back online and nobody notices, and that is the correct amount of gratitude for this work."
    ]);
    yield C.giveMoney(2400);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_09_bridge_traffic");
  });

  // ------------------------------------------------------- inside THE STACK
  def("nw_stack_vex_ally", function* (ctx) {
    const C = ctx.S;
    if (flag("stack_vex_door")) {
      yield C.say(["I'm holding four. Go and do six, seven and eight and stop checking on me."], { name: "VEX" });
      return;
    }
    yield C.setFlag("stack_vex_door", true);
    yield C.say([
      "Right. I've read the schematics you got off ROOT and I've got an idea and you're not going to like it.",
      "Door four's the one with the change window. Somebody has to stand in it and keep it open while the reader re-arms, and it has to be somebody with a badge the building trusts.",
      "It trusts mine. It has been reading mine for four years. Might as well get something out of that."
    ], { name: "VEX" });
    yield C.say([
      "Don't. Don't say the sensible thing.",
      "Go and open eight. I'll be here. I'm always here, apparently."
    ], { name: "VEX" });
    yield C.addFlag("stack_doors_opened", 1);
  });

  def("nw_stack_breaker_room", function* (ctx) {
    const C = ctx.S;
    if (flag("plug_pulled") || flag("stack_breaker_seen")) return;
    yield C.setFlag("stack_breaker_seen", true);
    yield C.music("dungeon_stack");
    yield C.say([
      "The breaker room. A main incomer, two transformers, and an emergency power-off under a plastic flap.",
      "The flap is not locked. The hasp has no padlock in it. There never was one.",
      "Somebody has written a label and stuck it on, in a clean engineer's hand, in this decade: 'THIS ACTUALLY WORKS.'"
    ]);
  });

  def("nw_stack_breaker", function* (ctx) {
    const C = ctx.S;
    if (flag("plug_pulled")) {
      yield C.say(["The room is dark and the fans have stopped and the silence has a shape to it."]);
      return;
    }
    if (num("stack_doors_opened") < 8) {
      yield C.say([
        "A terminal beside the breaker, on, showing one line.",
        "SEV: LOW. SUBJECT: eight halls. DETAIL: " + num("stack_doors_opened") + " of 8 released. ACTION: continue. OWNER: you."
      ]);
      return;
    }
    yield C.sfx("oracle_tag");
    yield C.say([
      "A terminal beside the breaker. It is on. It has been on.",
      "SEV: LOW. SUBJECT: the breaker.",
      "DETAIL: you have opened eight of eight. The eighth was not locked. ACTION: none required.",
      "NOTE: I would have shown you where it was."
    ]);
    const go = yield C.confirm("The plastic flap. The red mushroom. 'THIS ACTUALLY WORKS.' Pull it?");
    if (!go) { yield C.say(["You stand with your hand six inches from it for rather a long time."]); return; }
    yield C.fadeOut(700);
    yield C.sfx("warp");
    yield C.wait(900);
    yield C.setFlag("plug_pulled", true);
    yield C.setFlag("cutover_days", "stopped");
    yield C.fadeIn(1200);
    yield C.music(null);
    yield C.say([
      "Everything stops.",
      "Not the lights — the lights are on emergency and they are fine. The FANS.",
      "Forty thousand fans, all of them, at once, and then a silence with a shape to it, like the silence in a house when the boiler goes off."
    ]);
    yield C.say([
      "Outside, across the whole county, the SIGNAL METER reads zero for the first time since Congleton.",
      "The wild things calm. In Delamere the fog lifts in eleven minutes. In Runcorn the water is just water.",
      "The counter in your pause menu changes to a word instead of a number. STOPPED."
    ]);
    yield C.say([
      "Your phone goes. It is Alder, and she is crying, and she is reading you a paragraph out of a contract she signed four years ago.",
      "Clause nineteen. In the event of decommission, the vendor retains a physical isolation right at the primary site.",
      "\"Jim, I've had this the whole time. I've had a kill switch in a drawer the whole time and I never read past clause twelve.\""
    ], { name: "Dr Alder" });
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_09_bridge_traffic");
    yield C.giveItem("stack_schematics", 1);
    yield C.notify("CUTOVER: STOPPED.");
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
    yield C.say([
      "It is over.",
      "You walk out past reception. The coffee machine is on the emergency circuit and is still working. Somebody offers you one.",
      "You take it. It is genuinely good."
    ]);
  });

  // ---------------------------------------------------------- the chapter --
  S.defineChapter(9, {
    title: "Bridge Traffic",
    quest: "main_09_bridge_traffic",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_09_bridge_traffic");
      yield C.say([
        "A note out of a well names a bench above an estuary, at dusk, and says to bring nothing that logs.",
        "CUTOVER: 7 DAYS.",
        "Between here and that bench: a marsh, a chemical town, two bridges, and a fog that is not weather."
      ]);
    },
    hooks: {
      complete: function () { return !!flag("plug_pulled"); },
      next: 10
    }
  });
})();
