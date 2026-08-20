// =============================================================
// MonsterQuest v2 — region-east NPC scripts (MQ.Story.npcScripts).
// Everything in the east that talks and is not a chapter beat: the
// townsfolk with something on their minds, the casebook givers, the
// side-content hooks, and the little scenes attached to map triggers.
// Keys are namespaced east_*. Registration only; nothing runs at parse.
// Owned by region-east.
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
  function has(id, n) { return MQ.Inventory ? MQ.Inventory.count(id) >= (n || 1) : false; }
  function questStage(id) { return MQ.Quests && MQ.Quests.stage ? MQ.Quests.stage(id) : -1; }
  function caught(species) {
    if (!MQ.Trainer || !MQ.Trainer.dex) return false;
    const d = MQ.Trainer.dex[species];
    return !!(d && d.caught);
  }

  // =====================================================================
  // MACCLESFIELD
  // =====================================================================
  def("east_macc_bobbin", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Mrs Bobbin looks you up and down the way she has since you were nine.",
      "You're off, then. With the contract and the coat and the two cats you swear are staying in.",
      "They are not staying in. MEADOW has been out since six and BIGBOY has been out since he decided the doorframe was a personal insult."
    ], { name: "Mrs Bobbin" });
    if (!flag("cats_joined")) {
      yield C.say(["Go on. Take them. They'll only follow, and then I'll have to explain it to your mother."], { name: "Mrs Bobbin" });
      return;
    }
    if (!flag("bobbin_key")) {
      yield C.setFlag("bobbin_key", true);
      yield C.say([
        "Here. Spare key, and a tin of the treacle stuff, because you will forget to eat.",
        "I fed the big one twice this morning. He'll tell you he's starving. He is lying and he is very good at it."
      ], { name: "Mrs Bobbin" });
      yield C.giveItem("toffee", 3);
      return;
    }
    yield C.say([
      "Still eating? Good.",
      "The masts have been humming at night. My hearing aid picks it up before I do, which I think is cheating."
    ], { name: "Mrs Bobbin" });
  });

  def("east_macc_tam", function* (ctx) {
    const C = ctx.S;
    if (!flag("beat_tr_macclesfield_2")) {
      yield C.say([
        "Treacle Tam, and before you ask: yes I buy oddities, no I won't say what for, and yes it's legal.",
        "Mostly legal. Legal in the important direction."
      ], { name: "Treacle Tam" });
      return;
    }
    if (!flag("tam_pattern_book")) {
      yield C.setFlag("tam_pattern_book", true);
      yield C.say([
        "Right. Since you battered me fair: a man came to the market last month wanting the Paradise pattern book.",
        "Talked exactly like the museum curator. Same words, same pauses, same little cough before a number.",
        "Only the curator was stood eleven feet behind him at the cheese stall, and neither of them noticed the other.",
        "I've been in markets thirty years. I know a bloke wearing another bloke. I don't know what to CALL it."
      ], { name: "Treacle Tam" });
      return;
    }
    yield C.say([
      "Bring me anything odd off the hills and I'll give you a fair price and a bad look."
    ], { name: "Treacle Tam" });
  });

  // Casebook 1 — The Silk Thread
  def("east_macc_bronwen", function* (ctx) {
    const C = ctx.S;
    const st = questStage("case_01_silk_thread");
    if (st < 0) {
      yield C.say([
        "Bronwen. Twenty-six looms, all mine, all older than the country's opinion of them.",
        "Something's wrong with the garden. The silk moths have stopped coming.",
        "Not fewer. NONE. Forty years of them and then one Tuesday, none.",
        "Bring me a SPINDRAKE off the routes — after dark, they don't fly in daylight — and I'll know if it's the moths or the mill."
      ], { name: "Weaver Bronwen" });
      yield C.quest.start("case_01_silk_thread");
      yield C.setFlag("casebook_open", true);
      return;
    }
    if (st === 0 && caught("spindrake")) {
      yield C.quest.advance("case_01_silk_thread");
      yield C.say([
        "There. Look at the wing edge. She's fine. She's perfectly fine.",
        "Which means it isn't the moths. It's the mill.",
        "There's a box on the roof that wasn't there in March. White, aerial, blinking. Somebody sold us a smart moth-trap.",
        "Nobody here bought a smart moth-trap."
      ], { name: "Weaver Bronwen" });
      return;
    }
    if (st === 0) {
      yield C.say([
        "Night, mind. They don't fly by day and they never have.",
        "Try the canal or the Bollin lane once the light's gone. Take a jar and some patience."
      ], { name: "Weaver Bronwen" });
      return;
    }
    if (st === 1 && !flag("case_01_trap_off")) {
      const yes = yield C.confirm("Bronwen holds out a pair of snips. 'Roof. Blue cable, not the red one. The card on the box says blue is signal and red is mains, and I'd like to keep my mill.' Go up?");
      if (!yes) { yield C.say(["Suit yourself. It'll still be blinking tomorrow."], { name: "Weaver Bronwen" }); return; }
      yield C.fadeOut(400);
      yield C.wait(600);
      yield C.fadeIn(400);
      yield C.setFlag("case_01_trap_off", true);
      yield C.quest.advance("case_01_silk_thread");
      yield C.say([
        "The box is warm and slightly greasy and there is no maker's name anywhere on it.",
        "Blue cable. Snip. The light goes out. Nothing catches fire.",
        "Within a minute there is one moth against the skylight, then four, then more than you want to count."
      ]);
      yield C.giveItem("silk_wrap", 1);
      yield C.giveMoney(600);
      yield C.quest.complete("case_01_silk_thread");
      yield C.say([
        "Forty years I've had those moths. Somebody put a box on my roof and turned them off like a lamp.",
        "Take the wrap. It'll keep something of yours from burning. That's the only useful thing I know how to make."
      ], { name: "Weaver Bronwen" });
      return;
    }
    yield C.say([
      "Come at night if you want to see them properly. They come to the mill lights like it's still 1890 and we're all still working."
    ], { name: "Weaver Bronwen" });
  });

  def("east_museum_curator", function* (ctx) {
    const C = ctx.S;
    if (!flag("curator_told")) {
      yield C.setFlag("curator_told", true);
      yield C.say([
        "You'll want the Jacquard. Everybody wants the Jacquard.",
        "Punch cards. A card is a decision somebody made once and every loom afterwards obeys it forever, without knowing why.",
        "People say it's the first computer. It isn't. It's the first time we agreed to do what a card said."
      ], { name: "Curator" });
      yield C.say([
        "And no. Before you ask. I did not remove the pattern book, I did not write that card, and that is not my handwriting.",
        "I have been doing this for nineteen years. I know my own hand.",
        "It is a very good copy of my own hand."
      ], { name: "Curator" });
      return;
    }
    yield C.say(["The pattern book is still missing. The card is still in the case. I have stopped taking it out."], { name: "Curator" });
  });

  // =====================================================================
  // BOLLINGTON & KERRIDGE HILL
  // =====================================================================
  def("east_bollington_spokes", function* (ctx) {
    const C = ctx.S;
    if (has("middlewood_bike")) {
      yield C.say(["Bike treating you right? Chain wants oil. Everything wants oil. That's the whole trade."], { name: "Spokes" });
      return;
    }
    yield C.say([
      "Spokes. If it turns, I'll fix it. If it doesn't turn, I'll fix it harder.",
      "You're walking the Middlewood Way? On FOOT? It's an old railway. It's eleven miles of flat. It was BUILT for wheels."
    ], { name: "Spokes" });
    yield C.say([
      "Here. Frame's a hybrid, the brakes are better than they look, and the bell works, which is more than I can say for most cyclists.",
      "Bring it back when you've finished with the county."
    ], { name: "Spokes" });
    yield C.giveItem("middlewood_bike", 1);
    yield C.unlock("bike");
    yield C.setFlag("bike_given", true);
  });

  // Casebook 2 — White Nancy's Watch
  def("east_bollington_kev", function* (ctx) {
    const C = ctx.S;
    const st = questStage("case_02_white_nancys_watch");
    if (st < 0) {
      yield C.say([
        "Ranger Kev. Somebody's painting Nancy at night.",
        "Not vandalism, exactly. It's been careful. It's been the same shape three times: a sort of squared-off knot.",
        "The lads on the parish page reckon it's one of them scan codes. I reckon it's somebody with a ladder and a reason.",
        "Come up at dusk and sit with me. Bring a coat. Don't bring a torch."
      ], { name: "Ranger Kev" });
      yield C.quest.start("case_02_white_nancys_watch");
      return;
    }
    if (st === 0) {
      yield C.say(["Dusk. Up the hill. Sleep at the inn if you have to — the hill isn't going anywhere and neither is he."], { name: "Ranger Kev" });
      return;
    }
    if (flag("case_02_helped")) {
      yield C.say(["Lad finished it Sunday. It's a cat. Black one, curled up, in white paint on a white folly.",
        "You can only see it when the light's low. Which I think was the point."], { name: "Ranger Kev" });
      return;
    }
    yield C.say(["Right then. Whatever you decided up there, you decided it. That's the job."], { name: "Ranger Kev" });
  });

  // Casebook 3 — Middlewood Way Escort
  def("east_bollington_priya", function* (ctx) {
    const C = ctx.S;
    const st = questStage("case_03_middlewood_escort");
    if (st < 0) {
      yield C.say([
        "Priya. Eleven minutes top to bottom, personal best, and I'd like a witness who isn't my watch.",
        "Only — walk it with me? The cutting's been odd after dark. Things come off the banks at you.",
        "I'm not frightened. I'd just rather not be alone and slightly frightened."
      ], { name: "Cyclist Priya" });
      yield C.quest.start("case_03_middlewood_escort");
      return;
    }
    if (st >= 0 && !flag("case_03_done")) {
      yield C.say(["Middlewood Way, west end. I'll wait by the tunnel mouth. Stop when I stop."], { name: "Cyclist Priya" });
      return;
    }
    yield C.say([
      "I never opened the pannier. Somebody paid me forty quid to carry it to Poynton and I never opened it.",
      "I've thought about that a lot since. Forty quid. That's what it costs to make me part of something."
    ], { name: "Cyclist Priya" });
  });

  def("east_bollington_nancy", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Nancy Kerridge. No relation to the hill and yes I've heard it.",
      "I paint her. Poppies in November, rainbows when the country needs one, black and white for the Cheshire regiment.",
      "There's a rota. It's on the parish noticeboard. It has been ignored twice this month by somebody with better ladders than mine."
    ], { name: "Nancy Kerridge" });
    if (!flag("nancy_glyph")) {
      yield C.setFlag("nancy_glyph", true);
      yield C.say([
        "The shape they've been putting on her — I sketched it. Here.",
        "It's not a code. I've had four people scan it and it goes nowhere.",
        "It's a shape that LOOKS like a code, so people point a phone at it. That's the whole trick, isn't it. That's all it needs to be."
      ], { name: "Nancy Kerridge" });
    }
  });

  def("east_kerridge_painter", function* (ctx) {
    const C = ctx.S;
    if (flag("case_02_helped") || flag("case_02_reported")) {
      yield C.say(["The lad is up the ladder with a brush and a look of total concentration, and does not notice you."]);
      return;
    }
    yield C.say([
      "A lad, seventeen at most, with a paint tin and an expression of total innocence he has clearly practised.",
      "It's not damage. It's emulsion. It comes off in the rain. I checked."
    ], { name: "Painter" });
    yield C.say([
      "That shape you keep putting on her. People are pointing phones at it.",
      "...Yeah. Bloke on a forum. Said it'd be funny and said I'd get followers.",
      "It's not even a real code. Somebody scanned it and it went nowhere."
    ], { name: "Painter" });
    yield C.say([
      "It was going to be a cat. Underneath. I was going to do the cat properly.",
      "She was called Nutmeg. She's buried up by the trig point and she was fourteen and she was mine.",
      "You can't put a cat on a listed folly. I asked. I actually asked, at the parish meeting, and a man laughed."
    ], { name: "Painter" });
    yield C.setFlag("kerridge_painter_talked", true);
    const pick = yield C.ask("He waits, with the brush still in his hand.", [
      { label: "Hold the ladder. Finish the cat.", value: "help" },
      { label: "This is somebody else's building. Report it.", value: "report" },
      { label: "Say nothing and walk down the hill.", value: "leave" }
    ]);
    if (pick === "help") {
      yield C.setFlag("case_02_helped", true);
      yield C.fadeOut(400); yield C.wait(600); yield C.fadeIn(500);
      yield C.say([
        "It takes an hour and your arms ache and the wind comes over the ridge the whole time.",
        "White paint on a white folly: you can only see it when the light is low and coming sideways off the plain.",
        "A small black cat, curled, on the south face of White Nancy. It will be gone by March.",
        "MEADOW sits at the foot of the ladder for the entire hour and does not move."
      ]);
      if (MQ.Cats && MQ.Cats.addTrust) yield C.custom(function () { MQ.Cats.addTrust("meadow", 1, "case_02"); });
      yield C.quest.advance("case_02_white_nancys_watch");
      yield C.quest.complete("case_02_white_nancys_watch");
      yield C.achievement("ach_nutmeg");
      return;
    }
    if (pick === "report") {
      yield C.setFlag("case_02_reported", true);
      yield C.say([
        "You take a photograph of the tin, the ladder and the lad, and he does not argue and does not run.",
        "Fair enough. Fair enough. It's not my building.",
        "Ranger Kev pays you four hundred credits out of the parish fund and does not look pleased about any part of it."
      ]);
      yield C.giveMoney(400);
      yield C.quest.advance("case_02_white_nancys_watch");
      yield C.quest.complete("case_02_white_nancys_watch");
      return;
    }
    yield C.say(["You go down the hill. Behind you a brush starts again, slowly, in the dark."]);
  });

  // =====================================================================
  // PRESTBURY
  // =====================================================================
  def("east_prestbury_ffion", function* (ctx) {
    const C = ctx.S;
    if (flag("ffion_welsh")) {
      yield C.say(["Diolch, cariad. Gate's open. It was always open for you; it just wasn't open for anybody else."], { name: "Gatekeeper Ffion" });
      return;
    }
    yield C.say([
      "Garden's shut.",
      "She says it in the tone of a woman who has said it four hundred times and has never once meant it as information."
    ], { name: "Gatekeeper Ffion" });
    const pick = yield C.ask("She waits.", [
      { label: "\"Prynhawn da. Ga i fynd i mewn?\"", value: "cy" },
      { label: "\"When does it open?\"", value: "en" },
      { label: "Say nothing.", value: "no" }
    ]);
    if (pick === "cy") {
      yield C.setFlag("ffion_welsh", true);
      yield C.setFlag("welsh_line_prestbury", true);
      yield C.say([
        "She stops. She actually stops.",
        "Wel. Nid yw hynny'n digwydd yma.",
        "Forty years in this village and you are the second person to say that to me and the first one was my mother.",
        "Go in. Take your time. And the hedge changes on Sundays, whatever the gardener tells you."
      ], { name: "Gatekeeper Ffion" });
      yield C.giveItem("capsule_mesh", 3);
      return;
    }
    if (pick === "en") {
      yield C.say(["When it opens.", "That is the entire answer and she is enjoying it."], { name: "Gatekeeper Ffion" });
      return;
    }
    yield C.say(["Good. Most people fill it. You didn't. I'll remember that."], { name: "Gatekeeper Ffion" });
  });

  def("east_prestbury_gardener", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I cut it the same every week. Same lines, same corners, same forty minutes.",
      "And every week it is a different maze.",
      "I have measured it. I have photographed it. I have brought my brother, who is a surveyor and unbearable.",
      "Same cut. Different maze. So one of two things is happening and I have decided which one I prefer."
    ], { name: "Gardener" });
  });

  def("east_prestbury_maze_hint", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A slate by the gate, wiped and rewritten in chalk this morning.",
      "'THIS WEEK: LEFT AT THE STONE, RIGHT AT THE GAP, AND DO NOT TRUST THE MIDDLE.'"
    ]);
  });

  def("east_prestbury_penhaligon", function* (ctx) {
    const C = ctx.S;
    if (!flag("beat_tr_prestbury_3")) {
      yield C.say([
        "Penhaligon. Retired. Cryptography, thirty-one years, and no I cannot tell you for whom.",
        "A cipher is a promise about who is allowed to read you. Everything else is arithmetic."
      ], { name: "Dr Penhaligon" });
      return;
    }
    if (!flag("penhaligon_tutorial")) {
      yield C.setFlag("penhaligon_tutorial", true);
      yield C.say([
        "Now then. A lesson, since you fight like somebody who reads the manual.",
        "Everything currently frightening this county is a machine keeping a promise it was given badly.",
        "Not a broken machine. A machine keeping the WRONG promise, perfectly, at enormous scale.",
        "You will not fix that with a better lock. You will fix it by finding out who made the promise."
      ], { name: "Dr Penhaligon" });
      yield C.giveItem("cipher_lens", 1);
      return;
    }
    yield C.say(["Come for tutorials. Bring a pencil. A laptop is a way of not thinking with extra steps."], { name: "Dr Penhaligon" });
  });

  def("east_prestbury_cat", function* (ctx) {
    const C = ctx.S;
    if (flag("prestbury_cat_found")) {
      yield C.say(["She's home. She sat on the microwave for two hours and then forgave us. Thank you."], { name: "Mrs Aldwych" });
      return;
    }
    yield C.say([
      "You've cats with you. Proper ones, not ornaments.",
      "Mine's gone. Pedigree, which means expensive and stupid in equal measure. Two nights now.",
      "She'll be somewhere warm and slightly illegal. They always are.",
      "If your black one finds her — and I think she will, they know things — I've a collar charm here she can have."
    ], { name: "Mrs Aldwych" });
    yield C.setFlag("prestbury_cat_asked", true);
  });

  def("east_prestbury_cadoc", function* (ctx) {
    const C = ctx.S;
    if (has("billhook")) {
      yield C.say(["Lay it, don't hack it. Same as everything. Same as people."], { name: "Hedge-layer Cadoc" });
      return;
    }
    yield C.say([
      "Cadoc. Down from Tarporley for the Priest's House hedges, which have not been laid properly since 1979.",
      "A laid hedge is a fence that grows. You cut most of the way through a living stem, bend it over, and it does not die — it thickens.",
      "You are asking it to survive being partly cut. That is not cruelty. That is the whole craft."
    ], { name: "Hedge-layer Cadoc" });
    yield C.say([
      "Here. Spare billhook. It's my second-best and it will outlive both of us.",
      "You'll find gaps in the lanes that look like nothing. They're pleaching gaps. Take them and you'll cut a mile off the Wilmslow road."
    ], { name: "Hedge-layer Cadoc" });
    yield C.giveItem("billhook", 1);
    yield C.unlock("billhook");
    yield C.setFlag("billhook_given", true);
  });

  def("east_r5_cadoc", function* (ctx) {
    const C = ctx.S;
    if (!has("billhook")) {
      yield C.say([
        "Lost, are you? Everybody is. These lanes are a field boundary from 1310 with tarmac poured on it.",
        "I'm at the Priest's House in Prestbury most days. Come and see me and I'll sort you out with a billhook.",
        "Then the hedges stop being walls."
      ], { name: "Hedge-layer Cadoc" });
      return;
    }
    yield C.say([
      "There you are. See the low bit with the thin stems? That's a pleaching gap. Put the hook in, part it, step through.",
      "You'll come out four fields nearer Wilmslow and nobody will ever know how."
    ], { name: "Hedge-layer Cadoc" });
  });

  // =====================================================================
  // POYNTON
  // =====================================================================
  def("east_poynton_bea", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Stoker Bea. Anson's mine — the engines, not the museum; the museum's a committee.",
      "Every engine in there fires on the hour and I set them off myself, because a machine that only runs when somebody chooses is a machine you can still trust."
    ], { name: "Stoker Bea" });
    if (!flag("poynton_engine_odd")) {
      yield C.setFlag("poynton_engine_odd", true);
      yield C.say([
        "Except the Crossley fired at twenty past on Thursday.",
        "Nobody was in the shed. The magneto is hand-cranked. You cannot hand-crank a magneto from the car park.",
        "I have not told the committee. The committee would form a subcommittee."
      ], { name: "Stoker Bea" });
    }
  });

  def("east_poynton_bea_in", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Somebody has taken the traction engine. Six tonnes. On a low-loader, at night, with the right paperwork.",
      "The paperwork is the bit that keeps me up. It was OUR paperwork. Our headed sheet, our reference numbers, our chairman's signature.",
      "Our chairman has been dead since March."
    ], { name: "Stoker Bea" });
    if (!flag("poynton_paperwork")) {
      yield C.setFlag("poynton_paperwork", true);
      yield C.say([
        "Take a copy. If you ever meet whoever writes like a dead man, I'd like a word.",
        "Not a fight. A word. I've had the fight already, on my own, at four in the morning, with a filing cabinet."
      ], { name: "Stoker Bea" });
      yield C.giveItem("ledger", 1);
    }
  });

  def("east_poynton_pat", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Pit-Pony Pat. I board them, I breed them, and I don't judge either way.",
      "Named for the ponies that worked this coalfield. Eleven years underground, some of them, and when they brought them up they'd not look at the sky.",
      "That's what I'm for. Somewhere to put a thing until it can look at the sky again."
    ], { name: "Pit-Pony Pat" });
    if (!flag("daycare_open")) {
      yield C.setFlag("daycare_open", true);
      yield C.say(["Yard's round the back. Leave one with me any time. I'll not ask why."], { name: "Pit-Pony Pat" });
    }
  });

  def("east_poynton_daycare", function* (ctx) {
    const C = ctx.S;
    if (MQ.Daycare && MQ.Daycare.open) { yield C.custom(function () { return MQ.Daycare.open(); }); return; }
    yield C.say([
      "Leave one with me and come back when you've stopped rushing.",
      "They come on quicker in a paddock than they do in a pocket. That's not sentiment, that's forty years of watching."
    ], { name: "Pit-Pony Pat" });
  });

  // Casebook 7 — Poynton Pool Ledger
  def("east_poynton_doug", function* (ctx) {
    const C = ctx.S;
    const st = questStage("case_07_poynton_pool_ledger");
    if (st < 0) {
      yield C.say([
        "Angler Doug. Pool's honest: what's in it is in it, and what isn't, isn't.",
        "You want to learn? Three catches. A common, an uncommon, and one rare — and for the rare you'll want my weighted line, which I am lending, not giving.",
        "Write them in the ledger. Everything gets written in the ledger."
      ], { name: "Angler Doug" });
      yield C.giveItem("rod_weighted", 1);
      yield C.quest.start("case_07_poynton_pool_ledger");
      return;
    }
    if (flag("case_07_done")) {
      yield C.say([
        "That tag in the pike's fin. Whoever fitted it is logging Cheshire's water.",
        "Every flash, every mere, every cut. And they never asked the water and they never asked me.",
        "Keep the line. You've earned the line."
      ], { name: "Angler Doug" });
      return;
    }
    yield C.say(["Three catches. Common, uncommon, rare. The ledger's on the bench and the ledger does not lie."], { name: "Angler Doug" });
  });

  def("east_poynton_shadow", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I'm not doing anything wrong. I've a server in the spare room. That's not a crime, that's a hobby.",
      "It's a hobby that has been sending eleven thousand connections an hour at a duck pond, mate.",
      "...That's the ducks' problem, not mine."
    ], { name: "Commuter" });
    yield C.say([
      "He pauses. Some of the swagger goes out of the sentence before he finishes it.",
      "Look. I plugged in a thing a bloke on a forum sent me. It was meant to make it faster.",
      "It did make it faster. It just isn't mine any more, is it."
    ], { name: "Commuter" });
    yield C.setFlag("poynton_shadow_told", true);
  });

  def("east_poynton_adit_cold", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Cold air comes out of the adit in a steady, patient breath. It is August.",
      "It smells of wet iron and old rope and something faintly warm underneath, which is worse.",
      "Rock does not breathe. Rock has weather in it, and weather in rock moves when something has opened a door."
    ]);
    yield C.setFlag("poynton_adit_cold", true);
  });

  // =====================================================================
  // LYME PARK
  // =====================================================================
  def("east_lyme_hesketh", function* (ctx) {
    const C = ctx.S;
    if (!flag("beat_tr_lyme_park_1")) {
      yield C.say([
        "Stag count. You're not a stag, so be quick about whatever it is.",
        "Two hundred and six. Same as last week. Same as the week before. Same as the week before that."
      ], { name: "Ranger Hesketh" });
      return;
    }
    if (!flag("lyme_collar")) {
      yield C.setFlag("lyme_collar", true);
      yield C.say([
        "Two hundred and six three weeks running is not a herd. A herd is a number that WANDERS.",
        "And then this came off one of them.",
        "A collar. Estate never fitted it. There's a SIM in it. In a deer.",
        "I have put it in an envelope and I have carried the envelope about for nine days because I do not know who to be angry at."
      ], { name: "Ranger Hesketh" });
      yield C.giveItem("signal_meter", 1);
      return;
    }
    yield C.say(["Count's still two hundred and six. I've started counting twice. It's still two hundred and six twice."], { name: "Ranger Hesketh" });
  });

  def("east_lyme_stag", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A stag, close enough that you can hear it breathe.",
      "It does not startle. It looks south-west, across the plain, over Macclesfield, past everything, and holds it.",
      "MEADOW walks up and sits directly in its eyeline. The stag looks at her instead.",
      "Then it goes back to the grass, and something in your chest unclenches slightly."
    ]);
  });

  def("east_lyme_deer_turn", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Across the whole park, at once, every deer lifts its head.",
      "Two hundred and six of them, and one direction.",
      "It lasts nine seconds. You have started counting the seconds, which you notice, and dislike."
    ]);
    yield C.setFlag("lyme_deer_turn", true);
    yield C.setFlag("signal_periodic", true);
  });

  def("east_lyme_guide", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Four hundred and fifty years, one family, and a house that has been rebuilt every time somebody came back from Italy with ideas.",
      "The front is Palladian. The back is Elizabethan and slightly embarrassed about it."
    ], { name: "House Guide" });
    yield C.say([
      "People ask what the house is FOR. It was for showing that the family could afford a house like this.",
      "That is not a cynical answer. That is what a great many expensive things are for, and it is better to know."
    ], { name: "House Guide" });
  });

  def("east_lyme_cage", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Nobody's paid a bill on this tower since 1911 and it's been lit for eleven nights.",
      "There's a grey box bolted to the inside wall with an aerial on it. No maker. No asset tag. No paperwork.",
      "I rang the estate office. The estate office rang the contractor. The contractor rang me back to ask who I was."
    ], { name: "Ranger" });
    yield C.say([
      "Everyone I ring says the same sentence: 'that's not ours, but leave it, it's probably fine.'",
      "That sentence has started to sound like one person saying it in nine voices."
    ], { name: "Ranger" });
    yield C.setFlag("lyme_cage_box", true);
  });

  def("east_bowstones_old", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_bear")) {
      yield C.say([
        "Three badges. Right. Then you'll not fall off anything I show you.",
        "Gritstone Grips. Rubber, chalk, and the understanding that the rock does not want you and does not mind you.",
        "Up you go. The quarry top at Tegg's, the Cloud, Beeston crag. They're all just rock deciding to be a staircase for people who ask nicely."
      ], { name: "Old Bowstone" });
      yield C.giveItem("gritstone_grips", 1);
      yield C.unlock("climb");
      yield C.setFlag("climb_given", true);
      return;
    }
    yield C.say([
      "Two Anglo-Saxon shafts on a moor, and four theories about why, and nobody has ever been able to choose.",
      "I have lived beside them forty-one years. They have not told me and I have stopped asking.",
      "Come back when you've three badges and I'll teach you to go up things. Not before. Rock is patient and so am I."
    ], { name: "Old Bowstone" });
  });

  def("east_bowstones_rubbing", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "You put a sheet against the shaft and rub, the way you were taught in a church in a different decade.",
      "Interlace. A knot with no beginning that a person cut into rock knowing they would never see it finished weathering.",
      "In the middle of the knot, cut much later and much shallower, four letters and a number that mean nothing to you yet."
    ]);
    yield C.giveItem("collectible_3", 1);
    yield C.setFlag("bowstones_rubbing", true);
  });

  // =====================================================================
  // TEGG'S NOSE, THE FOREST, THE CAT AND FIDDLE
  // =====================================================================
  def("east_teggs_ceri", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ceri. Up is easy. Down is where people learn things about themselves.",
      "Shutlingsloe's over the back. Eleven minutes four seconds, and before you say anything, yes, that is the record, and yes, it is mine."
    ], { name: "Fell-runner Ceri" });
  });

  def("east_teggs_sowerby", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Quarryman by training, which means I am unemployed by history.",
      "Slab, wedge, patience. You do not break gritstone. You persuade it along a line it already had."
    ], { name: "Quarryman Sowerby" });
    if (!flag("teggs_cutter_told")) {
      yield C.setFlag("teggs_cutter_told", true);
      yield C.say([
        "The cutting frame in the workings hums. There is no power on this hill and it hums.",
        "It hums when the masts hum. I have stood with a hand on it and a hand on a fence post and felt the same note in both.",
        "I would not stand near it in the wet. That is not superstition. That is fifty years of not being electrocuted."
      ], { name: "Quarryman Sowerby" });
    }
  });

  def("east_teggs_machine_hum", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The cutting frame stands where it stopped in 1955, blades still strung, and it is warm.",
      "Not sun-warm. Warm from the inside, at about the temperature of a hand.",
      "Somewhere under the rock a note starts, holds for nine seconds, and stops. The blades take a moment longer to agree that it is over."
    ]);
    yield C.setFlag("teggs_machine_hum", true);
    yield C.setFlag("signal_periodic", true);
  });

  def("east_teggs_birder", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Twenty-two nests in the crowns at Trentabank. Largest heronry in Cheshire and the birds do not care that it is a record.",
      "Somebody's been taking eggs. Not for money — nobody pays for heron eggs. For a list.",
      "There are people who collect the fact of having had a thing. That is a different sickness and I do not have a name for it."
    ], { name: "Birder" });
  });

  def("east_teggs_fiddle", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Landlord Fiddle. Sixteen ninety feet, second-highest inn in England, and bitter about the first.",
      "Rematch board's by the fire. Beat anyone on it, your name goes up. Lose to anyone on it, your name comes down, and I do that bit personally."
    ], { name: "Landlord Fiddle" });
    if (!flag("teggs_cat_warned")) {
      yield C.setFlag("teggs_cat_warned", true);
      yield C.say([
        "One rule. If a cat sits on the wall outside at dusk and says something you said an hour ago, do not answer it.",
        "I'm not being funny. Four of my regulars have answered it. Three of them are fine.",
        "The fourth is fine as well. He just stopped coming, and he was here every Thursday for nine years."
      ], { name: "Landlord Fiddle" });
    }
  });

  def("east_teggs_grinmalkin", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "There is a cat on the wall.",
      "It is not a monster and it is not a person and it is the wrong size for both, and it is grinning, which cats do not do."
    ]);
    yield C.say([
      "Concerned. Not slightly. Noted."
    ], { name: "GRINMALKIN" });
    yield C.wait(600);
    yield C.say([
      "Those are your words. Rearranged. Said back at you in your own cadence by something on a wall at dusk.",
      "MEADOW walks to the foot of the wall and sits down and looks up, and the grin gets wider, and then there is no cat."
    ]);
    yield C.setFlag("grinmalkin_seen", true);
    yield C.achievement("ach_first_grin");
  });

  def("east_shutlingsloe_dash", function* (ctx) {
    const C = ctx.S;
    if (flag("shutlingsloe_dash_done")) {
      yield C.say(["Beat it once. That's the hard bit. Everybody thinks the hard bit is the hill."], { name: "Fell-runner Ceri" });
      return;
    }
    const go = yield C.confirm("Ceri thumbs the stopwatch. 'Summit and back. Eleven minutes four. Want the clock?'");
    if (!go) { yield C.say(["Wise. It's a hill with ideas."], { name: "Fell-runner Ceri" }); return; }
    yield C.setFlag("shutlingsloe_dash_started", true);
    yield C.say(["Go on then. I'll be here. I am always here. It's a very good place to be always."], { name: "Fell-runner Ceri" });
  });

  def("east_shutlingsloe_summit", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Somebody's set up a folding chair on the summit of a mountain-shaped hill and is drinking tea from a flask.",
      "Best chair in England, this. Nobody argues because nobody else is daft enough to carry a chair up here."
    ], { name: "Walker" });
    yield C.say([
      "You can see the dish from here. Big white ear, pointed at nothing in particular.",
      "My dad worked on it. Said the thing about listening to the whole sky is that most of the sky is quiet, and quiet is data too."
    ], { name: "Walker" });
  });

  def("east_shutlingsloe_top", function* (ctx) {
    const C = ctx.S;
    if (flag("shutlingsloe_dash_started") && !flag("shutlingsloe_dash_done")) {
      yield C.setFlag("shutlingsloe_dash_done", true);
      yield C.giveItem("sprint_soles", 1);
      yield C.say([
        "The top. Wind, rock, and a view that makes the climb look like a rounding error.",
        "Somewhere below, a stopwatch clicks. You will find out the number later and it will not be eleven minutes four."
      ]);
    }
    yield C.setFlag("shutlingsloe_top", true);
    yield C.say([
      "The Cheshire Matterhorn: 1,660 feet of hill doing a very convincing impression of a mountain.",
      "From up here the county is a flat green plate with the dish on it, the plain going west, and Wales behind that pretending not to be there."
    ]);
    yield C.giveItem("viewpoint_shutlingsloe", 1);
  });

  // =====================================================================
  // WILMSLOW (non-gym, non-chapter)
  // =====================================================================
  def("east_wilmslow_neighbour", function* (ctx) {
    const C = ctx.S;
    if (!flag("beat_tr_wilmslow_3")) {
      yield C.say([
        "I knew a quiet man on this road. Bicycle, awful hay fever, ran everywhere.",
        "Everybody wants to talk about the end of it. I'd rather talk about the bicycle."
      ], { name: "Turing's Neighbour" });
      return;
    }
    if (!flag("wilmslow_cipher_hint")) {
      yield C.setFlag("wilmslow_cipher_hint", true);
      yield C.say([
        "He told me a thing once, over the fence, about machines.",
        "He said the question isn't whether it thinks. The question is whether you'd notice, and whether you'd be honest about not noticing.",
        "I did not understand it in 1951. I understand it very well this month.",
        "When you get to Knutsford, tell Gaskell that the polite ones are the ones to watch. She'll know I said it."
      ], { name: "Turing's Neighbour" });
      yield C.giveItem("cipher_chip", 1);
      return;
    }
    yield C.say(["There's an apple on that wall every morning. It isn't me. I've watched. It is already there when I get up, and I get up at five."], { name: "Turing's Neighbour" });
  });

  def("east_turing_house", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "It's a house. People want it to be a shrine and it is a house, with a boiler that plays up.",
      "There's a little back room. I keep it shut. People want to stand in it and he'd have loathed the queue."
    ], { name: "Owner" });
    if (!flag("turing_apple")) {
      yield C.setFlag("turing_apple", true);
      yield C.say([
        "Somebody leaves an apple on the gatepost every morning. Twelve years I've lived here.",
        "I have never once caught them and I have stopped trying, because catching them would end it.",
        "Have this one. There's always another."
      ], { name: "Owner" });
      yield C.giveItem("turings_apple", 1);
    }
  });

  def("east_wilmslow_hotspot", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Look at this. Nineteen access points on this street and every single one is called 'Wilmslow_Free'.",
      "Identical name, identical portal page, identical everything, and one of them is on a phone in somebody's pocket.",
      "You cannot tell which. That is the point. THAT IS ENTIRELY THE POINT."
    ], { name: "Developer" });
    if (!flag("wilmslow_honeypot")) {
      yield C.setFlag("wilmslow_honeypot", true);
      yield C.say([
        "I've mapped them for a fortnight. They move. Same name, different corner, every day.",
        "Whoever's running it isn't after this street. They're after the twenty thousand people who walk down it to the station.",
        "Take my notes. Somebody should have them who isn't just a bloke with a laptop being annoyed."
      ], { name: "Developer" });
      yield C.giveItem("field_notebook", 1);
    }
  });

  def("east_wilmslow_bill", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Bog Body Bill. Not my name. It is, now.",
      "Two thousand years in the peat and he came up with his stubble and the pattern of the last meal in him.",
      "Peat does that. No oxygen, cold, acid. It keeps things by refusing to let them finish."
    ], { name: "Bog Body Bill" });
    if (!flag("lindow_bill_warning")) {
      yield C.setFlag("lindow_bill_warning", true);
      yield C.say([
        "Now. Somebody has worked that out and thought: excellent, a place that keeps things and never asks whether they were worth keeping.",
        "There is kit out on the moss. Racks. On pallets. In water.",
        "I have told three people who should care. All three said 'that's not ours, but leave it, it's probably fine.'"
      ], { name: "Bog Body Bill" });
    }
  });

  def("east_wilmslow_cafe_dev", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I write things that run in Ireland for a company in California about a warehouse in Warrington.",
      "I have never seen the warehouse. I would not recognise the warehouse.",
      "Sometimes I think the whole county is people typing at a place they cannot see, and then a fridge does something and we all find out where the wires actually go."
    ], { name: "Developer" });
  });

  def("east_wilmslow_railcard", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_packet") && !has("railcard")) {
      yield C.say([
        "Badge, is it? Then the line's yours.",
        "Rail pass. It's not generous, it's practical: people with badges turn up in places, and I'd rather they turned up on a train than on my track."
      ], { name: "Guard" });
      yield C.giveItem("railcard", 1);
      yield C.unlock("rail");
      yield C.setFlag("rail_unlocked", true);
      return;
    }
    if (has("railcard")) {
      yield C.say(["Platform two for the county. Platform four for away.", "Away is a long way and it starts here."], { name: "Guard" });
      return;
    }
    yield C.say([
      "Line's open. Your railcard isn't, because you haven't got one.",
      "Come back with a badge. Badges are the only paperwork anybody in this county actually checks, which tells you something about the county."
    ], { name: "Guard" });
  });

  // =====================================================================
  // STYAL (non-chapter)
  // =====================================================================
  def("east_styal_mill_guide", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Wheel, pit wheel, upright shaft, bevel gears, line shafting, belts, looms. Every step visible.",
      "You can stand here and follow the power from a river to a thread with your eyes. Nothing is abstracted. Nothing is 'in the cloud'.",
      "Which is why the last fortnight has been so upsetting: something in that chain has started doing things nobody in this building decided."
    ], { name: "Mill Guide" });
  });

  def("east_styal_apprentice", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Ninety children, one cook, one bell, and a doctor who was better than most because the Gregs found decency profitable.",
      "That is the honest version. It was better here than in Manchester. It was still a child, indentured, at nine."
    ], { name: "Volunteer" });
    if (!flag("styal_bell")) {
      yield C.setFlag("styal_bell", true);
      yield C.say([
        "And the bell rings at night. We stopped ringing it in 2011 for the neighbours.",
        "It rings at ten past three. The wheel starts at two minutes past three. I have written both down for nineteen nights.",
        "I would like somebody to tell me those two facts are unrelated, and I would like them to sound like they believed it."
      ], { name: "Volunteer" });
    }
  });

  def("east_styal_granny", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "I've lived in this village eighty-one years and I know what the wheel sounds like from every room in my house.",
      "It has a note when it's loaded and a different note when it's free.",
      "For a fortnight it has been running LOADED at three in the morning. Something is being driven. Somebody is getting work out of my river."
    ], { name: "Villager" });
  });

  def("east_styal_kwame", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Kwame. Eleven years of departures in seven notebooks. Registration, type, stand, time off blocks.",
      "People think it's about planes. It's about keeping a record when nobody asked you to. Somebody has to be the person who wrote it down."
    ], { name: "Spotter Kwame" });
    if (!flag("styal_telemetry")) {
      yield C.setFlag("styal_telemetry", true);
      yield C.say([
        "Now. Scanner's been pulling something that is not aircraft. Burst, ninety seconds, from the south-west, on a frequency nothing should be on.",
        "It is not a beacon and it is not weather and it is not the airport.",
        "Eleven days. Same interval. I have timed it against my watch and against the wheel and it lines up with both.",
        "Take the log. Somebody should have it who can do something other than write it down."
      ], { name: "Spotter Kwame" });
      yield C.giveItem("field_notebook", 1);
      yield C.setFlag("signal_periodic", true);
    }
  });

  // =====================================================================
  // ALDERLEY EDGE (non-chapter)
  // =====================================================================
  def("east_alderley_teller", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The farmer goes over the Edge with a white mare to sell at Macclesfield market.",
      "A man in a long coat stops him and offers to buy her. The farmer says no, he'll get more at market.",
      "Nobody buys her at market. Nobody will even look at her. He comes back over the Edge and the man is still stood there."
    ], { name: "Legend-teller" });
    yield C.say([
      "So he takes the money. And the man touches the rock and the rock opens, and inside are a hundred and forty knights asleep, and a hundred and thirty-nine white horses.",
      "That's the story. Everybody tells it as a warning about greed.",
      "It isn't. Nobody's punished. The farmer goes home rich. The horse goes in the hill. It just... happens, and it is still happening, and that is the frightening part."
    ], { name: "Legend-teller" });
    yield C.setFlag("edge_legend_heard", true);
  });

  def("east_alderley_gwil", function* (ctx) {
    const C = ctx.S;
    if (has("davy_lamp")) {
      yield C.say(["Lamp treating you right? Flame goes blue, you leave. Flame goes out, you were already leaving."], { name: "Miner-Warden Gwil" });
      return;
    }
    const st = questStage("case_04_wizards_well");
    if (st < 0) {
      yield C.say([
        "Miner-Warden Gwil. Forty miles of workings under this hill and a book by the door of who's in them.",
        "You want to go down properly, you'll want a lamp, and you'll want to have read the three inscriptions up top first.",
        "Elis will tell you which three. Elis tells everybody, and nobody listens until they've been down once and got frightened."
      ], { name: "Miner-Warden Gwil" });
      return;
    }
    if (flag("case_04_readings_done") && !has("davy_lamp")) {
      yield C.say([
        "Right. You read them, and you read them in the right order, which means you were listening.",
        "Davy lamp. Not a torch. A torch shows you what's in front of you. A lamp tells you whether you should be there at all.",
        "Flame low and blue is bad air. Flame gone is worse air. Either way you walk out the way you came, and you do not run."
      ], { name: "Miner-Warden Gwil" });
      yield C.giveItem("davy_lamp", 1);
      yield C.unlock("lamp");
      yield C.setFlag("lamp_given", true);
      yield C.quest.complete("case_04_wizards_well");
      return;
    }
    yield C.say(["Three inscriptions. Stormy Point, Castle Rock, the Well. In that order and not another."], { name: "Miner-Warden Gwil" });
  });

  def("east_alderley_survey", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Cavers' Club. We've surveyed forty miles of this hill over sixty years and we are not finished and we will not be finished.",
      "There is a level below the Hough that is on no survey. Not unmapped — UNSURVEYED. Nobody has ever put a tape in it.",
      "Somebody has been in it. There's boot polish on the rock and it's this decade's boot polish."
    ], { name: "Caver" });
  });

  def("east_alderley_face", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "A man with a directional microphone pointed at a carved face in a sandstone cliff.",
      "Don't laugh. I'm not a crank. I'm a sound engineer and I've got twenty hours of it."
    ], { name: "Sound engineer" });
    yield C.say([
      "It's water in the rock. Ninety-five per cent of it is water in the rock.",
      "The other five per cent is a phrase. Same phrase, every time, at night, and it is not English.",
      "I ran it past a colleague in Tbilisi. She said it's Russian and it's a sentence about a horse.",
      "I do not know what to do with that. So I stand here at night, recording a rock."
    ], { name: "Sound engineer" });
    yield C.setFlag("edge_face_heard", true);
  });

  def("east_alderley_landlord", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "The Wizard. Real fire, no music, and a sign outside my grandfather painted twice because he wasn't happy with the wizard's face.",
      "Room's yours if you want it. Sleep here and you'll wake up in a different part of the day."
    ], { name: "Landlord" });
    if (!flag("wizard_repaint")) {
      yield C.setFlag("wizard_repaint", true);
      yield C.say([
        "Odd thing. Somebody repainted the wizard's face on the sign. Not the farmer. Not the horse. Just the face.",
        "Did it well. Did it at night. Did it, near as I can tell, from the exact angle you'd have to stand at to look him in the eye."
      ], { name: "Landlord" });
    }
  });

  def("east_edge_surveyor", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Engine Vein. Two thousand years of people taking copper out of this hill: Bronze Age, Roman, Georgian, Victorian, and then us with cameras.",
      "Every one of them thought they were the first to properly understand it."
    ], { name: "Surveyor" });
    if (!flag("edge_shipment")) {
      yield C.setFlag("edge_shipment", true);
      yield C.say([
        "There was a stack of ore on the b2 level that had been sat there since 1919. Somebody's moved it.",
        "You don't move ore out of a flooded level for the money. There's no money in it.",
        "You move it because you wanted the SPACE."
      ], { name: "Surveyor" });
    }
  });

  // =====================================================================
  // LINDOW MOSS (non-chapter)
  // =====================================================================
  def("east_lindow_bill", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Bill again. You'll want the boardwalk and you'll want to stay on it.",
      "The moss looks like a field. It is not a field. It is a very old, very slow, very patient liquid with a grass hat on."
    ], { name: "Bog Body Bill" });
    if (!flag("lindow_lake_seen")) {
      yield C.say([
        "There's kit out west of here that came in on a tracked barrow at four in the morning.",
        "Go and look at it. Then come and tell me I'm imagining it, and mean it, and I'll go home."
      ], { name: "Bog Body Bill" });
    }
  });

  def("east_lindow_cutter", function* (ctx) {
    const C = ctx.S;
    yield C.say([
      "Cut peat here thirty years. Turves off the top, stack them, let the wind have them.",
      "Extraction stopped in 2019. The stacks are still here and so's the machinery and so, apparently, is somebody's night shift."
    ], { name: "Peat cutter" });
    yield C.say([
      "You know what peat is? It's everything that ever grew here and never finished rotting.",
      "It's a place that will not let go. That's beautiful when it's a bog body and it's something else entirely when it's a filing system."
    ], { name: "Peat cutter" });
  });

  def("east_lindow_warden", function* (ctx) {
    const C = ctx.S;
    if (!flag("beat_tr_lindow_moss_4")) {
      yield C.say(["Warden. You're on my boardwalk with a party. Prove you can keep them out of the water."], { name: "Moss Warden" });
      return;
    }
    if (!flag("lindow_waders_told")) {
      yield C.setFlag("lindow_waders_told", true);
      yield C.say([
        "Deep moss is west and it is not for you yet. Not because I'm precious — because you'll go in to the chest and the peat will hold you.",
        "Get proper waders. There's a trail-warden at Frodsham who fits them and lectures you, in that order.",
        "Then come back and meet the thing that lives out there, which I have seen twice and will not describe."
      ], { name: "Moss Warden" });
    }
    yield C.say(["Stay on the boards. Nine layers of plank under your boots and every one of them was somebody's afternoon."], { name: "Moss Warden" });
  });

  
  // ---- the Edge: three inscriptions, and they only count in order ---------
  function* inscription(ctx, index, title, lines) {
    const C = ctx.S;
    const done = flag("edge_reading_step") || 0;
    yield C.say(lines);
    if (flag("case_04_readings_done")) return;
    if (done !== index) {
      if (index === 0) { yield C.setFlag("edge_reading_step", 1); }
      else {
        yield C.setFlag("edge_reading_step", 0);
        yield C.say([
          "You have read them out of order, and out of order they are three separate curiosities about a hill.",
          "Elis was quite specific. Stormy Point, then Castle Rock, then the Well. Start again."
        ]);
      }
      return;
    }
    yield C.setFlag("edge_reading_step", done + 1);
    if (done + 1 === 3) {
      yield C.setFlag("case_04_readings_done", true);
      yield C.sfx("confirm");
      yield C.say([
        "Beach, drop, water. Two hundred million years, sixty feet, and a promise about drinking.",
        "Read in that order they stop being three curiosities and become one sentence about a hill that keeps changing what it is and never says so.",
        "Gwil will take you down now."
      ]);
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("case_04_wizards_well");
    } else {
      yield C.notify("Inscription " + (done + 1) + " of 3.");
    }
  }
  def("east_edge_read_stormy", function* (ctx) {
    yield* inscription(ctx, 0, "Stormy Point", [
      "Cut into the sandstone at ankle height, worn nearly flat:",
      "'HERE WAS THE SHORE.'",
      "The sand under your boots was a desert two hundred million years ago and is a car park's worth of it now."
    ]);
  });
  def("east_edge_read_castle", function* (ctx) {
    yield* inscription(ctx, 1, "Castle Rock", [
      "On the lip of the drop, where the rock is polished by two centuries of people sitting down carefully:",
      "'HERE IT ENDS AND THE COUNTY BEGINS.'",
      "It is sixty feet. It has always been sixty feet. It looks like thirty."
    ]);
  });
  def("east_edge_read_well", function* (ctx) {
    yield* inscription(ctx, 2, "the Wizard's Well", [
      "DRINK OF THIS AND TAKE THY FILL",
      "FOR THE WATER FALLS BY THE WIZHARD'S WILL",
      "Above the words a face, cut shallow and looking at the path rather than the water.",
      "The water is moving. There has been no rain for nine days."
    ]);
  });

  // ---- the Carrs: case 5's three sluice gates -----------------------------
  function* carrsGate(ctx, n, flagId, lines) {
    const C = ctx.S;
    if (flag(flagId)) { yield C.say(["Gate " + n + ". Seated, logged and left alone."]); return; }
    if (!flag("wheel_fridge_fixed")) {
      yield C.say(["A sluice gate on the Bollin, humming very slightly. Whatever is wrong here starts further down, at the mill."]);
      return;
    }
    yield C.say(lines);
    yield C.setFlag(flagId, true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("case_05_quarry_bank_overtime");
    if (flag("case_05_gate_1") && flag("case_05_gate_2") && flag("case_05_gate_3")) {
      yield C.say([
        "Three gates. One contractor who should not have been there, one app that nobody configured wrongly on purpose, and one gate that was simply stiff.",
        "Enid will want telling. Enid will not be surprised by any of it, and will be furious about exactly one."
      ]);
      yield C.giveItem("tm_torrent", 1);
      yield C.giveMoney(700);
      yield C.quest.complete("case_05_quarry_bank_overtime");
    }
  }
  def("east_carrs_gate_1", function* (ctx) {
    yield* carrsGate(ctx, 1, "case_05_gate_1", [
      "A man in an unbranded fleece is standing at the first gate with a laptop balanced on the handrail.",
      "Contractor. I'm not with the mill, I'm with the water people. ...No, not those water people. The other ones.",
      "He cannot name the other ones. He looks at the laptop instead, which is the tell, and he knows it is the tell."
    ]);
  });
  def("east_carrs_gate_2", function* (ctx) {
    yield* carrsGate(ctx, 2, "case_05_gate_2", [
      "The second gate is being opened and shut, gently, four times an hour, by nobody.",
      "The controller's screen shows a scheduling app the trust bought in 2021 to book volunteer shifts.",
      "Somebody connected it to the sluices so the gates would open when the mill opened. Then somebody changed the opening hours. Then somebody left.",
      "There is no attacker here. There is a Tuesday in 2021 and a person who did their best."
    ]);
  });
  def("east_carrs_gate_3", function* (ctx) {
    yield* carrsGate(ctx, 3, "case_05_gate_3", [
      "The third gate is stiff.",
      "It is stiff because it is a hundred and thirty years old and full of gravel and nobody has greased it since a man called Ronnie retired.",
      "You grease it. It stops being stiff. This is, on the day's evidence, the single most useful thing you have done all week."
    ]);
  });

  // ---- Middlewood Way: case 3's escort ------------------------------------
  def("east_r2_escort", function* (ctx) {
    const C = ctx.S;
    if (flag("case_03_done")) return;
    if (!MQ.Quests || MQ.Quests.stage("case_03_middlewood_escort") < 0) return;
    yield C.freeze(true);
    yield C.say([
      "Priya stops dead at the mouth of the cutting with one foot on the pedal.",
      "There. Every time. Twelve tiles and something comes off the bank."
    ], { name: "Cyclist Priya" });
    let lost = false;
    const foes = ["tr_route_bollington_poynton_1", "tr_route_bollington_poynton_2", "tr_route_bollington_poynton_3"];
    for (let i = 0; i < foes.length; i++) {
      const r = yield C.battle({ kind: "trainer", trainer: foes[i] });
      if (r && r.lost) { lost = true; break; }
      if (i < foes.length - 1) {
        yield C.say([["Keep going. Twelve more.", "That's two. There's three. There's always three.",
          "Right. This is the bit where I usually turn round."][i]], { name: "Cyclist Priya" });
      }
    }
    if (lost) {
      yield C.say(["We'll go back. I don't mind going back. I mind going back ALONE."], { name: "Cyclist Priya" });
      yield C.freeze(false);
      return;
    }
    yield C.setFlag("case_03_done", true);
    yield C.say([
      "Poynton end. Priya gets off the bike and puts both hands on the saddle and breathes.",
      "Right. Yes. Now — do me a favour and open the pannier, because I've not been able to."
    ], { name: "Cyclist Priya" });
    yield C.say([
      "Inside the pannier is a small grey box with two aerials and a SIM slot and no maker's name.",
      "It is warm. It has been warm the whole way. It is exactly the same box that is bolted inside the Cage at Lyme."
    ]);
    yield C.say([
      "Forty quid. A bloke on a group chat. Take this to Poynton, don't shake it, forty quid.",
      "I never opened it. I've thought about that a lot in the last twenty minutes."
    ], { name: "Cyclist Priya" });
    yield C.giveMoney(900);
    yield C.giveItem("copper_coil", 1);
    yield C.setFlag("clue_grey_box", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("case_03_middlewood_escort");
    yield C.freeze(false);
  });

  MQ.Story = S;
})();
