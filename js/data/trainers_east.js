// =============================================================
// MonsterQuest v2 — trainers of the EAST region (Ch.1–2).
// Route/town trainers `tr_<mapid>_<n>`, the rival `vex_1`, Gym 1
// `leader_ada`, and the Lindow mini-boss `boss_preserved_one`.
// Shapes per ENGINE-ARCHITECTURE §4 + battle report §5 (`house`).
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // p('species:level[,species:level...]') → party array
  function p(str) {
    const out = [], parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const bits = parts[i].trim().split(":");
      out.push({ species: bits[0], level: Number(bits[1]) });
    }
    return out;
  }
  function T(id, def) { D.define("trainers", id, def); }

  // tr(id, cls, sprite, name, party, lines) — lines = [intro, win(they win), lose(they lose), after]
  function tr(id, cls, sprite, name, party, lines, extra) {
    const def = {
      name: name, cls: cls, sprite: sprite, party: p(party), ai: "greedy",
      intro: [lines[0]], win: [lines[1]], lose: [lines[2]], after: [lines[3]]
    };
    if (extra) { const k = Object.keys(extra); for (let i = 0; i < k.length; i++) def[k[i]] = extra[k[i]]; }
    T(id, def);
  }

  // ---- Macclesfield & the canal (R1) -------------------------------------
  tr("tr_macclesfield_1", "weaver", "npc_weaver", "Weaver Bronwen", "bobbinet:5,silkin:4", [
    "Mill hands don't spar. We test tension.",
    "Thread held. Told you.",
    "Snapped. Fair enough — you pulled straighter than I did.",
    "Come back at night if you want to see the moths."
  ], { ai: "random" });
  tr("tr_macclesfield_2", "stallholder", "npc_shopkeep", "Treacle Tam", "flitchick:5,nibbit:5", [
    "Buy, sell, or fight. I do all three before ten.",
    "That's the market rate, that is.",
    "Right. I'll knock ten per cent off. Don't tell the others.",
    "Treacle Market's Sunday. Bring money and low expectations."
  ], { ai: "random" });
  tr("tr_macclesfield_3", "walker", "npc_walker", "Walker Ros", "mistlop:6,flitchick:6", [
    "Hundred and eight steps up. I count them every day and I'm still wrong.",
    "See? Legs of a woman who counts steps.",
    "Noted. I'll count on the way down instead.",
    "The view from St Michael's is worth the wheeze."
  ]);

  tr("tr_route_macc_bollington_1", "angler", "npc_fisher", "Angler Pete", "towpaddle:5,puddlish:5", [
    "Don't stand in my swim. The ducks are bad enough.",
    "Ducks nil, me one.",
    "Right. Ducks one, you one, me nil.",
    "Perch under the third bridge. Don't tell the ducks."
  ], { ai: "random" });
  tr("tr_route_macc_bollington_2", "cyclist", "npc_cyclist", "Cyclist Dean", "sparkit:6,mistlop:5", [
    "Towpath's shared use. I share it at nineteen miles an hour.",
    "Shared. Generously.",
    "Fine. I'll ring the bell next time.",
    "Bell rung. Happy?"
  ]);
  tr("tr_route_macc_bollington_3", "boater", "npc_boater", "Boater Nia", "towpaddle:6,nibbit:6,flitmoth:5", [
    "Four mile an hour, that's the limit. Nothing on this cut hurries.",
    "Told you. Nothing hurries.",
    "You hurried. I'll allow it once.",
    "There's an island up the cut. You'll want a boat and a better year."
  ]);
  tr("tr_route_macc_bollington_4", "walker", "npc_walker", "Walker Gwen", "flitchick:6,mistlop:6", [
    "Stile's stiff. Everything round here is stiff.",
    "Including my knees, and they still won.",
    "Go on then. You've earned the towpath.",
    "Mind the nettles by the lock."
  ]);

  // ---- Bollington & Kerridge Hill ----------------------------------------
  tr("tr_bollington_1", "bandsman", "npc_bandsman", "Bandsman Ollie", "sootling:6,bobbinet:6", [
    "We rehearse Tuesdays. You've caught us on a Tuesday.",
    "In tune and in front.",
    "Flat. Both notes and me.",
    "There's something living in the tuba. It hums back."
  ]);
  tr("tr_bollington_2", "cyclist", "npc_cyclist", "Cyclist Priya", "sparkit:7,mistlop:6", [
    "Middlewood Way, top to bottom, eleven minutes. Personal best.",
    "Eleven minutes and a win. Good day.",
    "You're quick. Walk with me sometime — I'll explain why I need company.",
    "Escort duty. That's what I'm after. Ask me about it."
  ]);
  tr("tr_bollington_3", "walker", "npc_walker", "Ranger Kev", "mistewe:7,grousel:6", [
    "Somebody's painting Nancy at night. I'd like a word and a battle first.",
    "Word held. Battle held.",
    "Right. Stake it out with me after dark, then.",
    "Dusk on the hill. Bring a coat and no torch."
  ]);
  tr("tr_kerridge_hill_1", "fellrunner", "npc_fellrunner", "Fell-runner Ceri", "mistlop:7,galewing:7", [
    "Up is easy. Down is where people learn things about themselves.",
    "Learn anything?",
    "You went down well. Most don't.",
    "Shutlingsloe next. When your knees have forgiven you."
  ], { ai: "smart" });
  tr("tr_kerridge_hill_2", "kid", "npc_kid", "Kid Marco", "sparkit:6,flitchick:6,nibbit:6", [
    "My nan says the folly's a sugar loaf. It's a tomb, actually.",
    "It IS a tomb. Ask anyone.",
    "It's a sugar loaf. Fine. I'll tell my nan she was right.",
    "There's a paint tin hid up here. I'm not saying where."
  ], { ai: "random" });
  tr("tr_kerridge_hill_3", "cultist", "npc_cultist", "ClickFix Novice Bram", "puppetacct:7,botling:7", [
    "One command and the hill is clean! Copy. Paste. Run.",
    "Cleansed. You should try it.",
    "I only read the first line. Everyone only reads the first line.",
    "I've read all of it now. It's mostly a shopping list."
  ], { ai: "random" });

  // ---- Middlewood Way (R2) & Poynton -------------------------------------
  tr("tr_route_bollington_poynton_1", "cyclist", "npc_cyclist", "Cyclist Aled", "sparkit:7,mistlop:7", [
    "Cutting's mine on Thursdays. It's Thursday.",
    "Thursday holds.",
    "Have Thursday. I'll take the viaduct.",
    "Tunnel's quicker if you've a bike."
  ]);
  tr("tr_route_bollington_poynton_2", "cyclist", "npc_cyclist", "Cyclist Fern", "flitchick:7,grousel:7", [
    "Two tiers, this path. Top for speed, bottom for thinking.",
    "Top tier. Obviously.",
    "Bottom tier it is. I'll think about that.",
    "Nancy's paint cache is off the old quarry spur."
  ]);
  tr("tr_route_bollington_poynton_3", "farmer", "npc_farmer", "Farmer Hobb", "mistewe:8,mistlop:7,pitpony:7", [
    "Gate shut, dog in, kettle on. In that order.",
    "Gate shut.",
    "Gate open. Go on with you.",
    "Sheep have been standing wrong. All facing the same way."
  ]);
  tr("tr_poynton_1", "kid", "npc_kid", "Kid Sasha", "puddlish:6,pitpony:7", [
    "The roundabout's got no signs. You just look at people. It's great.",
    "See? Eye contact wins.",
    "You looked at me properly. That's the whole trick.",
    "Rematch me by the pool. I live there."
  ], { ai: "random" });
  tr("tr_poynton_2", "signaller", "npc_signaller", "Stoker Bea", "pitpony:8,sootling:7", [
    "Anson's engines start on the hour. So do I.",
    "On the hour. Every hour.",
    "Off the hour. That's never happened.",
    "Someone's borrowed the traction engine. A whole traction engine."
  ]);
  tr("tr_poynton_3", "angler", "npc_fisher", "Angler Doug", "puddlish:8,towpaddle:7", [
    "Pool's honest. People aren't. Let's see which you are.",
    "Honest, and beaten.",
    "Honest and quick. Here — borrow the weighted line.",
    "Three catches and I'll call you an angler."
  ]);

  // ---- Gritstone Trail North (R3) & Lyme Park ----------------------------
  tr("tr_route_poynton_lyme_1", "walker", "npc_walker", "Walker Idris", "grousel:8,mistewe:8", [
    "Wind's at forty. It'll be at sixty by the Bowstones.",
    "Forty-one, and a win.",
    "Sixty, then. Lean into it.",
    "Deer cross at the wall gap. Wait for them."
  ]);
  tr("tr_route_poynton_lyme_2", "fellrunner", "npc_fellrunner", "Fell-runner Nel", "galewing:8,mistlop:8", [
    "Gritstone Trail. Lyme to Mow Cop. I'm doing it in bits.",
    "Bit one: yours.",
    "Bit one: mine. Right.",
    "Passport gets stamped at every summit. Collect them."
  ]);
  tr("tr_lyme_park_1", "ranger", "npc_ranger", "Ranger Hesketh", "piphart:9,mistewe:8,grousel:8", [
    "Stag count today. You're not a stag, so make it quick.",
    "Two hundred and six. And one of you.",
    "Two hundred and six, and I've lost my place. Thanks.",
    "One stag's wearing a collar. Nobody at the estate fitted it."
  ], { ai: "smart" });
  tr("tr_lyme_park_2", "granny", "npc_granny", "Granny Ada Hale", "piphart:9,mistlop:9", [
    "I've walked this park since before your mother. Sit down, no — fight me.",
    "Sit down now.",
    "Well. That's a first since 1998.",
    "The Cage lights up at night. Nobody's paid that bill in years."
  ], { ai: "smart" });

  // ---- Bollin Valley (R4) & Prestbury ------------------------------------
  tr("tr_route_macc_prestbury_1", "angler", "npc_fisher", "Angler Meg", "heronet:7,puddlish:7", [
    "Ford floods when it rains. Which is always.",
    "Wet feet, dry win.",
    "Wet feet all round, then.",
    "Herons here are shameless. They watch you cast."
  ]);
  tr("tr_route_macc_prestbury_2", "walker", "npc_walker", "Walker Sion", "prickpip:8,flitchick:7,nibbit:7", [
    "Mill race pocket's down the bank. Don't tell the gardeners.",
    "Pocket stays secret.",
    "Go on. It's behind the sluice.",
    "Behind the sluice. I said nothing."
  ]);
  tr("tr_prestbury_1", "shadow_it", "npc_shadow_it", "Consultant Vance", "peepcam:8,sparkit:8", [
    "I'm not staff. I'm engaged. There's a difference and it's tax.",
    "Invoice to follow.",
    "I'll write this one off. Don't tell my accountant.",
    "Half these cameras aren't the village's. Nobody asks whose."
  ], { ai: "smart" });
  tr("tr_prestbury_2", "granny", "npc_granny", "Housekeeper Efa", "sparkit:8,prickpip:8", [
    "The house is smart. It is not clever. There's a difference and it's mine to fix.",
    "Fixed.",
    "Unfixed. I'll ring somebody.",
    "The fridge orders things nobody eats."
  ]);
  tr("tr_prestbury_3", "historian", "npc_historian", "Dr Penhaligon", "bobbinet:9,peepcam:9", [
    "A cipher is a promise about who can read you. Shall we test yours?",
    "Promise kept.",
    "Promise broken, elegantly. Good.",
    "Come for tutorials. Bring a pencil, not a laptop."
  ], { ai: "smart" });

  // ---- Mottram lanes (R5) ------------------------------------------------
  tr("tr_route_prestbury_wilmslow_1", "farmer", "npc_farmer", "Hedge-layer Cadoc", "prickpip:9,bramblehog:9", [
    "A laid hedge is a fence that grows. Everything else is scaffolding.",
    "Grown, and standing.",
    "Cut clean. You've a hand for it — here, borrow the billhook.",
    "Lay it, don't hack it. Same as everything."
  ], { ai: "smart" });
  tr("tr_route_prestbury_wilmslow_2", "walker", "npc_walker", "Walker Bryn", "piphart:9,mistlop:9", [
    "These lanes are a maze with hedges for walls and no map that's honest.",
    "Still lost. Still won.",
    "Diagonals through the hedge. That's the trick.",
    "You'll need a billhook for the diagonals."
  ]);
  tr("tr_route_prestbury_wilmslow_3", "stuffer", "npc_stuffer", "Stuffer Kai", "puppetacct:9,botling:9,peepcam:9", [
    "Twelve thousand logins a minute. Sixth form's got nothing on it.",
    "Throughput wins.",
    "Throughput's down. My mate said it'd be easy money.",
    "It wasn't easy money. It was somebody's nan's account."
  ], { ai: "greedy" });

  // ---- Tegg's Nose lane (R32) & the moor ---------------------------------
  tr("tr_route_macc_teggs_1", "walker", "npc_walker", "Walker Hesta", "mistlop:8,grousel:8", [
    "Up to the quarry. It's all up from here, mind.",
    "All up. All mine.",
    "All up, and you took it at a trot.",
    "Cutting machines still stand up there. They hum in the wet."
  ]);
  tr("tr_teggs_nose_1", "fellrunner", "npc_fellrunner", "Fell-runner Ceri", "galewing:15,moorcock:15,harrowlop:14", [
    "Shutlingsloe in forty minutes. Beat that or carry my flask.",
    "Flask, please.",
    "Keep the flask. You've earned tea.",
    "The Cheshire Matterhorn. It's a hill with ideas."
  ], { ai: "smart" });
  tr("tr_teggs_nose_2", "miner", "npc_miner", "Quarryman Sowerby", "nancylith:15,runestane:15", [
    "Slab, wedge, patience. That's quarrying and that's fighting.",
    "Patience won.",
    "Patience lost. That's new.",
    "The cutter hums when the masts do. I'd not stand near it."
  ], { ai: "smart" });

  // ---- Wilmslow -----------------------------------------------------------
  tr("tr_wilmslow_1", "developer", "npc_dev", "Developer Ines", "botling:10,sparkit:10", [
    "Two coffees in. I can do this or I can ship. Not both.",
    "Shipped.",
    "Rolled back. Fine.",
    "Every hotspot in town has the same name. Nobody finds that odd."
  ]);
  tr("tr_wilmslow_2", "developer", "npc_dev", "Developer Osk", "peepcam:10,botling:10,sheepwire:9", [
    "I benchmark everything. Including people.",
    "You benchmarked poorly.",
    "Re-run. Different result. I'll note it.",
    "Noted properly this time."
  ], { ai: "smart" });
  tr("tr_wilmslow_3", "granny", "npc_granny", "Turing's Neighbour", "bobbinet:11,prickpip:10", [
    "I knew a quiet man on this road. He'd have liked you. Go on.",
    "He'd have liked that too.",
    "He'd have said you were rude with numbers. He meant it kindly.",
    "There's an apple in this town somebody never ate."
  ], { ai: "smart" });
  tr("tr_wilmslow_gym_1", "developer", "npc_sysadmin", "Sysadmin Ollie", "sparkit:11,botling:11", [
    "Patch panel's colour-coded. So is my temper.",
    "Green light. Stay off my rack.",
    "Amber. Go through.",
    "Blue goes to blue. Every time. Every single time."
  ], { ai: "greedy" });
  tr("tr_wilmslow_gym_2", "developer", "npc_sysadmin", "Sysadmin Freya", "sheepwire:12,sparkit:11", [
    "Uptime's ninety-nine point nine. You're the point one.",
    "Point one, contained.",
    "Right. I'll open a ticket on myself.",
    "Ada's through the back. She doesn't do small talk."
  ], { ai: "greedy" });
  tr("tr_wilmslow_gym_3", "developer", "npc_sysadmin", "Sysadmin Marek", "botling:12,sparkit:12,sheepwire:11", [
    "Everything in here is on a UPS. Including me.",
    "Still up.",
    "Down. Briefly. Don't log it.",
    "Logged it anyway. Honesty's cheaper."
  ], { ai: "smart" });

  T("leader_ada", {
    name: "Ada", cls: "Sysadmin", sprite: "ada", ai: "smart",
    party: p("sparkit:12,sheepwire:13,botling:13,fulgurcat:16"),
    payout: 2400,
    leader: { badge: "badge_packet", town: "wilmslow", type: "electric", tm: "tm_live_rail" },
    house: {
      note: "STATIC TERRAIN IS PERMANENT. THE RACKS DO NOT CARE WHOSE FAULT IT IS.",
      terrain: "static", permanent: true, reboot: true,
      jamAgent: { id: "sleet", turns: 3 }
    },
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.65, events: [
          { say: "Ada does not look up. \"Change is going badly. Escalating.\"" },
          { setTerrain: "static", turns: 99 },
          { boostSelf: { spe: 1 } }
        ] },
        { hpFrac: 0.35, events: [
          { say: "\"Right. Sysadmin's Reboot. Everybody hates this and everybody has it in their runbook.\"" },
          { healSelf: 0.25 },
          { boostSelf: { spa: 1, def: 1 } }
        ] },
        { hpFrac: 0.12, events: [
          { say: "\"Uptime one thousand one hundred and four days. I am not being the reason it resets.\"" },
          { boostSelf: { atk: 1, spa: 1 } }
        ] }
      ]
    },
    intro: [
      "Ada. Uptime's my religion and you're an unplanned change.",
      "Terrain's static and it stays static. House rule. Door said so."
    ],
    win: ["Change rejected. Come back with a test plan."],
    lose: ["Change approved. Signed off. Take the PACKET badge and the card — Live Rail. Don't touch it in the wet."],
    after: ["Badge is an anchor. Anything signed with it gets trusted. Think about that before you sleep."],
    rematch: {
      party: p("fulgurcat:20,sheepwire:20,ramvolt:21,botnetle:21,peepcam:22,fulgurcat:24"),
      every: 1
    }
  });

  // ---- The Carrs (R6) & Styal --------------------------------------------
  tr("tr_route_wilmslow_styal_1", "angler", "npc_fisher", "Angler Perry", "heronet:10,puddlish:10", [
    "Stepping stones are slippier than they look. So am I.",
    "Dry. Smug.",
    "Wet. Fair.",
    "Perch under the far bank. Cast short."
  ]);
  tr("tr_route_wilmslow_styal_2", "birder", "npc_birder", "Spotter Kwame", "heronet:11,sheepwire:10,flitchick:10", [
    "I log planes. Lately I log things that are not planes.",
    "Logged and filed.",
    "Amended. You're in the notebook now.",
    "One of them answers the radio. Planes don't do that."
  ]);
  tr("tr_styal_1", "shadow_it", "npc_shadow_it", "Contractor Wilks", "botling:11,sluiceling:11", [
    "I fitted the sensors. Not the fridge. The fridge is nothing to do with me.",
    "Still nothing to do with me.",
    "All right, it's partly the fridge.",
    "It's entirely the fridge. I've apologised to the mill."
  ], { ai: "greedy" });
  tr("tr_styal_2", "shadow_it", "npc_shadow_it", "Contractor Sena", "sheepwire:12,botling:11,peepcam:11", [
    "Unofficial, unpatched, unbothered. Three words, one invoice.",
    "Unbothered.",
    "Mildly bothered.",
    "The scheduling app throttles the wheel. Nobody wrote that. It just does."
  ], { ai: "greedy" });
  tr("tr_styal_3", "ranger", "npc_ranger", "Wheelwright Enid", "sluiceling:12,millrace:13", [
    "Iron doesn't lie. It just turns when it's told. Question is who's telling.",
    "Still turning.",
    "Stopped. Good. Now help me find out why it started.",
    "Three sluices upstream. Somebody's opened all three."
  ], { ai: "smart" });

  // ---- Lindow Moss --------------------------------------------------------
  tr("tr_lindow_moss_1", "stuffer", "npc_stuffer", "Stuffer Tess", "puppetacct:11,botling:11", [
    "The bog keeps everything. That's why we picked it.",
    "Kept.",
    "Kept, and now looked at. That's different.",
    "It's not even our data. We just move it."
  ], { ai: "greedy" });
  tr("tr_lindow_moss_2", "stuffer", "npc_stuffer", "Stuffer Rhodri", "puppetacct:12,proxling:12,botling:11", [
    "Residential proxy fog. Sounds like weather. Is weather, round here.",
    "Fog holds.",
    "Fog lifts. Briefly.",
    "TWELVE-K pays us in vouchers. I'd rather have the vouchers than the questions."
  ], { ai: "greedy" });
  tr("tr_lindow_moss_3", "historian", "npc_historian", "Bog Body Bill", "peatkin:12,mistwisp:12,bogleap:12", [
    "Two thousand years down there and still recognisable. Peat's a filing system.",
    "Filed.",
    "Refiled. Under 'lost to a stranger'.",
    "They dumped their caches in a data lake and called it clever. It's a bog, lad."
  ], { ai: "smart" });
  tr("tr_lindow_moss_4", "cultist", "npc_cultist", "ClickFix Preacher Nona", "mistwisp:12,puppetacct:12", [
    "Do not read it! Reading is doubt. Paste is faith.",
    "Faith holds.",
    "I read it. On the way here. It's a shopping list and a keylogger.",
    "I've stopped pasting. I've started reading. It's worse and it's better."
  ], { ai: "greedy" });

  T("boss_preserved_one", {
    name: "The Preserved One", cls: "Ghost Trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("peatkin:13,mistwisp:13,lindowan:16"),
    payout: 1800,
    boss: {
      cannotCatch: false,
      arenaWeather: "fog",
      phases: [
        { hpFrac: 0.6, events: [{ say: "The peat closes over the boardwalk. Something two thousand years old declines to be a metaphor." }, { setWeather: "fog", turns: 12 }, { boostSelf: { def: 1, spd: 1 } }] },
        { hpFrac: 0.3, events: [{ say: "It holds its shape the way salt holds a season." }, { healSelf: 0.25 }, { summonAdd: { species: "mistwisp", level: 13 } }] }
      ]
    },
    intro: ["...", "The bog keeps everything. It has been keeping this."],
    win: ["The boardwalk sinks. You go back the way you came, slowly."],
    lose: ["It lets go, politely, and lies back down in the peat."],
    after: ["The peat is quiet. The caches are not."]
  });

  // ---- Sandhills (R7) & Alderley Edge ------------------------------------
  tr("tr_route_wilmslow_alderley_1", "walker", "npc_walker", "Walker Tegan", "prickpip:11,mistlop:11", [
    "Birch ridge at sunset is the best mile in Cheshire. Fight me on it.",
    "Best mile. Confirmed.",
    "Second best. I'll allow it.",
    "Owls come out at the spur. Stand still and they'll come to you."
  ]);
  tr("tr_route_wilmslow_alderley_2", "birder", "npc_birder", "Birder Cass", "owlume:12,squeakwing:11,cuprabug:11", [
    "Dusk species only. Come back at the wrong hour and you'll see nothing.",
    "Wrong hour, then.",
    "Right hour. Well done you.",
    "The Beacon spur, twenty minutes before dark. Don't be late."
  ]);
  tr("tr_alderley_edge_1", "caver", "npc_caver", "Caver Rhys", "cuprabug:12,squeakwing:12", [
    "Club rules: two lamps, one rope, nobody goes alone.",
    "Rules held.",
    "Rules bent. Come down with us, then.",
    "Miner-Warden Gwil holds the good lamp. Ask nicely."
  ], { ai: "greedy" });
  tr("tr_alderley_edge_2", "caver", "npc_caver", "Caver Ffion", "squeakwing:13,gloamite:12,cuprabug:12", [
    "The Hough Level floods. Everything below it is a rumour.",
    "Rumour stands.",
    "Rumour swims. Bring a boat one day.",
    "There's a slide back to the Beacon. Faster than the stairs and much stupider."
  ], { ai: "greedy" });
  tr("tr_alderley_edge_3", "miner", "npc_miner", "Miner-Warden Gwil", "cuprabug:13,verdigrit:14", [
    "Copper's honest. It goes green so you know it's been out in the world.",
    "Green and standing.",
    "Green and beaten. There's a lamp in it for you, when we're done below.",
    "Never trust a level that's dry. It means the water's gone somewhere worse."
  ], { ai: "smart" });
  tr("tr_alderley_edge_caverns_b1_1", "miner", "npc_miner", "Miner Tomos", "cuprabug:12,gloamite:12", [
    "Ore's that way. Trouble's that way as well. Same tunnel.",
    "Same tunnel. Told you.",
    "Take the tunnel. Mind the shaft.",
    "Ladders down to the Hough. Test every rung twice."
  ], { ai: "greedy" });
  tr("tr_alderley_edge_caverns_b1_2", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Vel", "botling:13,puppetacct:13,peepcam:13", [
    "Maintenance. Hi-vis. Clipboard. You may go about your business.",
    "Business concluded.",
    "You're not going about your business, are you.",
    "We were only ever renting the dark."
  ], { ai: "smart" });

  // ---- VEX (rival, Ch.1) --------------------------------------------------
  T("vex_1", {
    name: "VEX", cls: "Rival", sprite: "vex", ai: "smart",
    party: p("nibbit:6,sparkit:6,silkin:7"),
    payout: 900,
    intro: [
      "Name's VEX. Best junior pentester in Cheshire.",
      "Alder gave me the other one. The one you didn't pick. Which makes it better by definition."
    ],
    win: ["Bar's on the floor and you're under it. Ship better."],
    lose: ["Fine. FINE. That's one build. Builds fail. That's the point of builds."],
    after: ["Don't look at me like that, root user. I'm iterating."],
    rematch: { party: p("gnawlord:14,fulgurcat:14,spindrake:16"), every: 2 }
  });
})();
