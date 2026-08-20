// =============================================================
// MonsterQuest v2 — trainers of the MID region (Ch.3-5).
// Route/town trainers `tr_<mapid>_<n>`, the rival at Tatton and Crewe
// (`vex_2`, `vex_3`), Gym 2 `leader_gaskell`, Gym 3 `leader_otis`,
// Gym 4 `leader_di`, TWELVE-K and the Heritage Centre APT (`boss_apt`).
// Shapes per ENGINE-ARCHITECTURE §4 + SYSTEMS-SPEC §9 (`house`, `boss`).
// Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  function p(str) {
    const out = [], parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const bits = parts[i].trim().split(":");
      out.push({ species: bits[0], level: Number(bits[1]) });
    }
    return out;
  }
  function T(id, def) { D.define("trainers", id, def); }
  // tr(id, cls, sprite, name, party, [intro, theyWin, theyLose, after], extra)
  function tr(id, cls, sprite, name, party, lines, extra) {
    const def = {
      name: name, cls: cls, sprite: sprite, party: p(party), ai: "greedy",
      intro: [lines[0]], win: [lines[1]], lose: [lines[2]], after: [lines[3]]
    };
    if (extra) { const k = Object.keys(extra); for (let i = 0; i < k.length; i++) def[k[i]] = extra[k[i]]; }
    T(id, def);
  }

  // ============ Chapter 3 — Chelford Heath, Knutsford, Tatton ============
  tr("tr_route_alderley_knutsford_1", "walker", "npc_walker", "Walker Meurig", "prickpip:13,mistlop:13", [
    "Heath's common land. Common means everybody's, not nobody's. People forget the first half.",
    "Common sense as well, apparently.",
    "Right you are. Gate's yours.",
    "Mere path's through the hedge. You'll want a billhook and a good excuse."
  ]);
  tr("tr_route_alderley_knutsford_2", "farmer", "npc_farmer", "Farmer Dilys", "sheepwire:14,ramvolt:14,prickpip:13", [
    "Sheep have been standing in a line since Tuesday. All facing the same way. All of them.",
    "Still facing that way, look.",
    "You've unsettled them. Good. Something ought to.",
    "They face south-west. I checked with a compass and then I felt daft, and then I checked again."
  ]);
  tr("tr_route_alderley_knutsford_3", "birder", "npc_birder", "Birder Ffion", "owlume:15,heronet:14", [
    "Radnor Mere. Twelve species this morning and one I could not name, which never happens.",
    "Logged as 'unidentified'. I hate that column.",
    "Fine. I'll write it down properly and let somebody else worry.",
    "It had a bell in its voice. Meres do that. Or something in them does."
  ]);
  tr("tr_route_alderley_knutsford_4", "cultist", "npc_cultist", "ClickFix Novice Rhosyn", "puppetacct:14,botling:14", [
    "One command and the heath is clean! Copy. Paste. Run.",
    "Cleansed. Blissfully.",
    "I didn't read it. I never read it. That's the whole point of it.",
    "Brother Kellan's at Tatton with the blankets. Bring a flask. He goes on."
  ], { ai: "random" });

  tr("tr_knutsford_1", "granny", "npc_granny", "Mrs Wrigley", "quillet:15,curdli:15,prickpip:14", [
    "Sit down, dear. No, sit. You can fight me from the bench, I'm not moving.",
    "Knutsford, one. Wilmslow, nil.",
    "Well. You're from Macclesfield, so I shan't count it as a loss.",
    "If you want to know anything about anybody in this county, you ask on King Street. It's faster than the internet and it's usually right."
  ], { ai: "smart" });
  tr("tr_knutsford_2", "historian", "npc_historian", "Librarian Aled", "quillet:16,scriptorix:17", [
    "Bibliographic combat. It's exactly like arguing about provenance, only quicker.",
    "Provenance holds. Next.",
    "Provenance fails. I'll re-date it and say nothing.",
    "There's a Cranford page on the market that is one hundred and forty years too clean."
  ], { ai: "smart" });
  tr("tr_knutsford_3", "kid", "npc_kid", "Percy's Nephew Tomi", "prickpip:14,quillet:14,sparkit:14", [
    "I'm allowed on the penny-farthing when I'm fourteen. I'm nine. I've done the maths.",
    "Nine and unbeaten.",
    "Nine and beaten. Don't tell Uncle Percy.",
    "The trick with the big wheel is that you don't stop. You just find somewhere soft."
  ], { ai: "random" });
  tr("tr_knutsford_4", "developer", "npc_dev", "Developer Sioned", "botling:15,peepcam:15,sparkit:15", [
    "I moved here for the schools and stayed for the broadband, which is a sentence I hate.",
    "Uptime.",
    "Downtime. It happens to everybody.",
    "Half the Heath's Wi-Fi is called KNUTSFORD_FREE and none of it is Knutsford's."
  ]);
  tr("tr_knutsford_5", "walker", "npc_walker", "Sedan-chairman Bryn", "sheepwire:15,ramvolt:15", [
    "I carry a chair for the May Day procession. It's heavier than the woman in it, and she is not light.",
    "Carried. Comfortably.",
    "Dropped. Metaphorically. Don't tell the Mayor.",
    "The sand patterns go down the night before. Walk on them and this town will remember your face for forty years."
  ]);

  // Gym 2 — Madam Gaskell's library
  tr("tr_knutsford_gym_1", "historian", "npc_historian", "Aisle-keeper Non", "quillet:16,manorwraith:16", [
    "Aisle four. It moves. Don't lean on it.",
    "Shelved.",
    "Reshelved. Under 'unexpected'.",
    "Madam does not test what you know. She tests whether you can be bothered to look."
  ], { ai: "smart" });
  tr("tr_knutsford_gym_2", "granny", "npc_granny", "Reader Enfys", "scriptorix:17,quillet:16", [
    "A cipher is only a promise about who is allowed to understand you.",
    "Promise kept.",
    "Promise broken, and rather elegantly. Go on through.",
    "Every letter in this room has been read twice. Once by the recipient and once by Madam."
  ], { ai: "smart" });
  tr("tr_knutsford_gym_3", "developer", "npc_dev", "Cataloguer Idris", "peepcam:16,quillet:17,scriptorix:17", [
    "I index her rumours. Twelve thousand cards. Nothing in this county happens twice without me noticing.",
    "Indexed.",
    "Amended. You're a new card.",
    "Card 8,114: 'Alder Labs, Macclesfield — sold something, four years ago, no buyer named.'"
  ], { ai: "smart" });

  T("leader_gaskell", {
    name: "Madam Gaskell", cls: "Gym Leader", sprite: "gaskell", ai: "smart",
    party: p("quillet:17,manorwraith:18,scriptorix:18,bellmere:20"),
    payout: 3200,
    leader: { badge: "badge_cipher", town: "knutsford", type: "psychic", tm: "tm_cranford_whisper" },
    house: {
      note: "EVERY LETTER IN THIS ROOM ARRIVES ALREADY READ. SPECIAL SCREEN, HOUSE RULE, NO APOLOGY.",
      screens: "spec"
    },
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.6, events: [
          { say: "\"In Knutsford we don't say 'threat actor', dear. We say 'from Wilmslow'.\"" },
          { boostSelf: { spa: 1 } }
        ] },
        { hpFrac: 0.35, events: [
          { say: "\"A cipher is manners. It says: this was meant for someone, and you are not them.\"" },
          { setWeather: "fog", turns: 99 },
          { boostSelf: { spd: 1, spe: 1 } }
        ] },
        { hpFrac: 0.15, events: [
          { say: "\"I have read every letter that came through this town since 1974. Yours was short.\"" },
          { healSelf: 0.22 }
        ] }
      ]
    },
    intro: [
      "Madam Gaskell. Do sit — no, the good chair, you've walked.",
      "The aisles move because a library that stays still is a warehouse. Now. Two screens are up. That is not cheating; that is Knutsford."
    ],
    win: ["Never mind, dear. Come back when you've read the whole thing and not just the first line."],
    lose: ["Well. That was extremely rude and extremely correct. CIPHER is yours, and the Cranford Whisper with it."],
    after: [
      "My network is yours now. Rumour is intelligence with better manners.",
      "Here is the first one, gratis: Alder Labs sold something four years ago. Nobody will say what, and everybody knows there was a buyer."
    ],
    rematch: { party: p("scriptorix:24,manorwraith:24,bellmere:25,quillet:24,phantasmal:25,scriptorix:27"), every: 1 }
  });

  // Tatton Park — the picnic blankets
  tr("tr_tatton_park_1", "ranger", "npc_ranger", "Deer Warden Nerys", "piphart:16,stagwire:17", [
    "Two hundred and eighty fallow, sixty red. I have counted them every October since 1998.",
    "Counted and correct.",
    "Counted and wrong, apparently. That's twice this week.",
    "Somebody has been counting them for me. That is not a kindness. That is a survey."
  ], { ai: "smart" });
  tr("tr_tatton_park_2", "cultist", "npc_cultist", "ClickFix Preacher Meical", "puppetacct:16,botling:16,proxling:16", [
    "Sit on the blanket! One command! Copy, paste, and be CLEAN.",
    "Cleansed. Everyone is cleansed. It's marvellous.",
    "You read it. Nobody reads it. Why would you read it?",
    "I read it once, on the bus. It asks for the thing you'd never give if it asked politely."
  ], { ai: "greedy" });
  tr("tr_tatton_park_3", "stuffer", "npc_stuffer", "Stuffer Kai", "puppetacct:17,botling:16", [
    "Census tent. Sign in, get a lanyard, win a hamper. Everybody signs in.",
    "Signed in.",
    "Nobody actually wins the hamper. There isn't a hamper.",
    "We get paid per unique. A deer counts as a unique if you tick it in fast enough."
  ], { ai: "random" });
  tr("tr_tatton_park_4", "stuffer", "npc_stuffer", "Stuffer Nadia", "proxling:17,puppetacct:17,botling:16", [
    "Twelve thousand puppets and every one of them looks like somebody's nan logging into her shopping.",
    "Throughput's good today.",
    "Throughput's down. I'll get a message about it. I always get a message about it.",
    "TWELVE-K is not one of us. TWELVE-K has a lanyard from somewhere with a canteen."
  ], { ai: "greedy" });
  tr("tr_tatton_park_5", "walker", "npc_walker", "Head Gardener Mei", "prickpip:17,bramblehog:17,quillet:16", [
    "Japanese garden's closed for the sermon. Which is the first time it has closed for anything since the frost.",
    "Closed and staying closed.",
    "Open, then. Wipe your boots and don't touch the moss.",
    "Somebody took a bonsai. Two hundred years old and it fitted under a coat."
  ], { ai: "smart" });
  tr("tr_tatton_park_6", "ghost_trainer", "npc_ghost_trainer", "The Old Hall Steward", "manorwraith:18,tudorling:17,mistwisp:17", [
    "You are late for dinner and the fire has been lit since 1560.",
    "The table is set. Sit.",
    "Then go, and shut the door behind you, which nobody has done in four hundred years.",
    "There is a new draught in this house. It comes from the south-west and it is not weather."
  ], { ai: "smart" });

  T("vex_2", {
    name: "VEX", cls: "Rival", sprite: "vex", ai: "smart",
    party: p("gnawlord:15,fulgurcat:16,peepcam:16,spindrake:17"),
    payout: 1800,
    intro: [
      "Root user. You look like a man who's been reading picnic blankets.",
      "I've been here since six. I've mapped the whole tent. I'm about to be VERY impressive."
    ],
    win: ["Told you. Bar's mine and it's somewhere over there."],
    lose: [
      "That was the WIND. There is a wind on this parkland and it comes off the mere and it does things to a throw.",
      "...Fine. Two-nil. It's a series. Series have shapes."
    ],
    after: ["Don't say noted. I can hear you thinking noted."],
    rematch: { party: p("gnawlord:22,fulgurcat:23,peepcam:23,botnetle:23,spindrake:25"), every: 2 }
  });

  tr("tr_rostherne_mere_1", "birder", "npc_birder", "Warden Cerys", "heronet:17,swanling:17,owlume:16", [
    "Deepest mere in Cheshire and nobody is allowed on it, including me, and I'm the warden.",
    "Nobody on the water. As it should be.",
    "Go on then. Stand on the jetty. Don't lean.",
    "There's a bell down there. Everybody says so and nobody has ever been down to check."
  ], { ai: "smart" });
  tr("tr_rostherne_mere_2", "historian", "npc_historian", "Verger Ioan", "bellmere:18,quillet:17", [
    "The bell rolled off the cart, into the mere, and rang all the way down. That's the story.",
    "The story holds.",
    "The story is a story. It still rings, mind.",
    "It rings on the wrong days now. Not Sundays. Every ninety seconds, on the ones it chooses."
  ], { ai: "smart" });

  // ============ Chapter 4 — Goostrey, Jodrell, Congleton, the Cloud ======
  tr("tr_route_knutsford_holmes_1", "farmer", "npc_farmer", "Farmer Ellis", "sheepwire:17,ramvolt:17,mistewe:16", [
    "Level crossing's automatic. It is also, and I want to be clear, a liar.",
    "Barriers down. Told you.",
    "Barriers up. First time this month.",
    "Wait for the light, not the barrier. The light is honest. The barrier is on a computer."
  ]);
  tr("tr_route_knutsford_holmes_2", "signaller", "npc_signaller", "Crossing Keeper Bev", "sparkrail:18,keystone:17", [
    "Eighteen trains an hour and one gate. Do the sums and then stand well back.",
    "Gate holds.",
    "Gate opens. Go on, quick.",
    "It's opened by itself twice this week. There's nobody in the box. There hasn't been since 1994."
  ], { ai: "smart" });
  tr("tr_route_knutsford_holmes_3", "walker", "npc_walker", "Walker Osian", "piphart:17,prickpip:17", [
    "Goostrey to Ollerton, four miles, three stiles, one bull. The bull is the shortcut.",
    "Bull's route. Every time.",
    "Long way round it is. Sensible.",
    "The dish is over that hedge. You'll hear it before you see it, and this week you won't hear it at all."
  ]);
  tr("tr_route_knutsford_holmes_4", "kid", "npc_kid", "Kid Lowri", "curdli:17,quillet:17,sheepwire:17", [
    "My dad works at the observatory and he's not allowed to say what's wrong with it.",
    "Still not allowed. Still won.",
    "He says it's 'maintenance'. He says it in the voice he uses about the dog.",
    "The dish points at Alderley now. That's not where the sky is."
  ], { ai: "random" });

  tr("tr_holmes_chapel_1", "signaller", "npc_signaller", "Signalwoman Dot", "sparkrail:19,keystone:18,poltergrid:20", [
    "Forty-one years in that box. I know which levers are stiff and which ones are lying.",
    "Lever twelve. Always lever twelve.",
    "Right. You've a steady hand. Come back at three in the morning and bring it.",
    "It's not a ghost. Ghosts don't have a duty cycle."
  ], { ai: "smart" });
  tr("tr_holmes_chapel_2", "stallholder", "npc_shopkeep", "Bakery Bev", "curdli:18,belfrit:18", [
    "Six hundred loaves before five. Fight me quietly, the proving's delicate.",
    "Risen.",
    "Flat. Both of us. Have a bun.",
    "Kellan taught IT at the high school. Lovely with the kids. Then he found something better to believe in."
  ], { ai: "random" });
  tr("tr_holmes_chapel_3", "walker", "npc_walker", "Arch-counter Gruff", "keystone:19,heronet:18", [
    "Twenty-three arches. I run under all of them between trains. It's a sport. It's not a safe sport.",
    "Twenty-three and a personal best.",
    "Twenty-two. I stopped to look at you. That's on me.",
    "Arch thirteen has a plaque nobody put there."
  ]);

  tr("tr_route_holmes_jodrell_1", "angler", "npc_fisher", "Angler Pryce", "otterkin:18,perchip:18", [
    "The Dane comes up two foot in an hour when it rains on the Cloud. Ask me how I know.",
    "Dry feet. Rare.",
    "Wet feet. Usual.",
    "There's an otter under arch eight that has never once been frightened of me."
  ], { ai: "random" });
  tr("tr_route_holmes_jodrell_2", "developer", "npc_dev", "Radio Ham Ivor", "dishlet:19,sparkrail:18,peepcam:18", [
    "Two metre band. I've heard Moscow, the space station, and something last Thursday I have not reported.",
    "Signal's mine.",
    "Signal's yours. Log it properly.",
    "It's a pulsar period. Nearly. It's a pulsar period with a message stuffed in the gaps."
  ], { ai: "smart" });
  tr("tr_route_holmes_jodrell_3", "birder", "npc_birder", "Meadow Warden Aneira", "heronet:19,keystone:18,swanling:18", [
    "Flood meadow. It floods. That's not a problem, that's the job description.",
    "Meadow holds.",
    "Meadow's yours till Thursday, then it's the river's again.",
    "The dishlets in the arboretum all turned at once on Tuesday. All of them. Like sunflowers with a grudge."
  ]);
  tr("tr_route_holmes_jodrell_4", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Contractor Vaughn", "trojanox:19,botnetle:19,proxling:18", [
    "Site's closed. Road's closed. Meadow's closed. It's all closed, mate.",
    "Closed.",
    "Still closed. You just got past a man, not a fence.",
    "I get paid in a currency I can't spell by a company with no phone number. It's fine. It's very fine."
  ], { ai: "greedy" });

  tr("tr_jodrell_bank_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Rhian", "trojanox:20,wormhack:19", [
    "Maintenance. Hi-vis. Clipboard. You know how it works.",
    "Maintained.",
    "Maintained badly. Look, I only started Tuesday.",
    "The woman in charge isn't one of us. She's better than us and she doesn't like us."
  ], { ai: "greedy" });
  tr("tr_jodrell_bank_2", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Colm", "botnetle:20,proxling:20,teramite:19", [
    "Nobody past the arboretum. Nobody past the gate. Nobody, and that includes you, specifically.",
    "Nobody past.",
    "Somebody past. First time.",
    "We were told to keep people OUT. Nobody said anything about keeping the dish ON."
  ], { ai: "greedy" });
  tr("tr_jodrell_bank_3", "developer", "npc_dev", "Dr Ravi Lovell-Hart", "dishlet:20,parabolus:21,pulsaris:20", [
    "I'm the resident astronomer, they've locked me out of my own control room, and I am extremely calm about it.",
    "Calm and correct.",
    "Calm and wrong. Which is worse, honestly.",
    "The telescope isn't broadcasting. It's listening. And it isn't listening up."
  ], { ai: "smart" });
  tr("tr_jodrell_bank_4", "amos_impostor", "npc_amos", "Ranger Fenn", "amoslurk:21,peepcam:20", [
    "Arboretum's mine. I've worked here eleven years. I know every tree by name.",
    "Every tree. By name.",
    "...Which tree did you say? No. Which tree.",
    "The face is fine. It's the eleven years that don't fit."
  ], { ai: "smart" });

  tr("tr_route_holmes_congleton_1", "angler", "npc_fisher", "Angler Bethan", "otterkin:19,perchip:19,swanling:18", [
    "Astbury Mere was a gravel pit. Everything beautiful round here used to be a hole.",
    "Hole holds.",
    "Fair. Fish the far bank, it's deeper than it looks.",
    "There's a hide on the north shore and somebody's been sleeping in it."
  ], { ai: "random" });
  tr("tr_route_holmes_congleton_2", "walker", "npc_walker", "Heath-warden Tegwen", "prickpip:19,bramblehog:20", [
    "Brereton Heath. Sandy soil, silver birch, and adders if you're unlucky and lizards if you're not.",
    "Unlucky, then.",
    "Lucky. Mind where you sit anyway.",
    "The bear from the town statue is on the Cloud. I've seen it. I've told people. People are lovely about it."
  ]);
  tr("tr_route_holmes_congleton_3", "kid", "npc_kid", "Kid Marchel", "otterkin:19,tudorling:19,curdli:18", [
    "I've got a birdhide password. It's a hide. It has a password. That's Congleton for you.",
    "Password holds.",
    "Password's 'bear'. It's always 'bear'.",
    "Everything here is 'bear'. The Wi-Fi. The football team. My dog."
  ], { ai: "random" });

  tr("tr_congleton_1", "historian", "npc_historian", "Bridestone Meg", "runestane:20,dolmenor:21", [
    "The town sold its Bible to buy a bear. That is true and I will not be having a debate about it.",
    "Bear won.",
    "Bear lost. It happens. It happened a lot, historically.",
    "The Bridestones are older than the bear, the Bible and the debate. They hum in fog now, which is new."
  ], { ai: "smart" });
  tr("tr_congleton_2", "shadow_it", "npc_shadow_it", "Salon Owner Kirsty", "botling:20,peepcam:20,proxling:19", [
    "I run the tanning place. I also run the town's Wi-Fi off my back room, which nobody asked me to do.",
    "Signal's strong.",
    "Signal's off. I'll put it back on. Probably.",
    "Somebody's been posting the password on lampposts with a QR code under it. I did not print those."
  ], { ai: "greedy" });
  tr("tr_congleton_3", "ranger", "npc_ranger", "Mere-Warden Tam", "otterkin:20,swanling:20,cubbin:20", [
    "Astbury's mine, the town hall's the mayor's, and the Cloud belongs to whatever's living on it.",
    "Mine.",
    "Yours for the afternoon.",
    "There's a bear-shaped hole in the town's affections and something bear-shaped filling it, up there."
  ]);

  // Gym 3 — the bear pit
  tr("tr_congleton_gym_1", "walker", "npc_walker", "Keeper Sion", "cubbin:21,sheepwire:21", [
    "Bear pit rules: you go down, you come up, you shake hands. Otis is strict about the hands.",
    "Down you go.",
    "Up you come. Hands.",
    "The 2-v-1 isn't a trick. It's a bear and a man who loves it. You'd have the same problem."
  ]);
  tr("tr_congleton_gym_2", "farmer", "npc_farmer", "Bearward's Sister Enid", "ramvolt:21,cubbin:22,sheepwire:21", [
    "He's told you the Bible story already, has he. He tells the dog. The dog's heard it four hundred times.",
    "So have I. So have you now.",
    "Go on. He's through the arch. Look interested.",
    "There's a memo pinned in his gym post he hasn't read. STACK something. He thought it was a bill."
  ], { ai: "smart" });
  tr("tr_congleton_gym_3", "kid", "npc_kid", "Pit Kid Alun", "cubbin:21,otterkin:21,curdli:21", [
    "I do the arm-wrestle bar. I've beaten grown men. I'm eleven.",
    "Eleven and undefeated.",
    "Eleven and defeated. It's character-building, apparently.",
    "Time the bar on the up-beat. Everyone times it on the down-beat and everyone loses."
  ], { ai: "random" });

  T("leader_otis", {
    name: "Bearward Otis", cls: "Gym Leader", sprite: "otis", ai: "smart",
    party: p("cubbin:21,sheepwire:22,mowstane:22,bruinhall:24"),
    payout: 4200,
    doubles: false,
    leader: { badge: "badge_bear", town: "congleton", type: "ground", tm: "tm_bear_hug" },
    house: {
      note: "FIRST PHASE IS TWO ON ONE. IT IS A BEAR AND A MAN WHO LOVES IT. WHAT DID YOU EXPECT.",
      terrain: "grass"
    },
    boss: {
      cannotCatch: true,
      phases: [
        { turn: 1, events: [
          { say: "\"Right. Congleton sold its Bible to buy a bear, and everybody tells that story like it's daft.\"" },
          { summonAdd: { species: "cubbin", level: 21 } },
          { say: "\"It isn't daft. They already HAD a Bible. They didn't have a bear.\"" }
        ] },
        { hpFrac: 0.5, events: [
          { say: "\"Steady. She likes you. That's not always good news.\"" },
          { boostSelf: { atk: 1, def: 1 } },
          { setTerrain: "grass", turns: 99 }
        ] },
        { hpFrac: 0.2, events: [
          { say: "\"Last one. Hands afterwards, mind. I'm strict about the hands.\"" },
          { healSelf: 0.2 },
          { forceOverdrive: true }
        ] }
      ]
    },
    intro: [
      "Bearward Otis. Down you come. Mind the step, everybody minds the step and everybody still trips on it.",
      "House rule: first phase is two on one. It has been for two hundred years and the bear has never once agreed to fight alone."
    ],
    win: ["No shame in it. Sit on the step. There's tea in the keeper's hut and it's stewed."],
    lose: ["Ha! Right. HANDS. Good. BEAR badge, and the Bear Hug card with it — don't use it on anything you like."],
    after: [
      "There's a memo pinned in the gym post. Board thing. I thought it was a bill and I've been ignoring it for a fortnight.",
      "STACK CUTOVER: THIRTY-EIGHT DAYS. Mean anything to you? ...Your face says yes."
    ],
    rematch: { party: p("bruinhall:28,mowstane:28,cheshwheel:28,dolmenor:29,sheepwire:28,bruinhall:31"), every: 1 }
  });

  tr("tr_bosley_cloud_1", "fellrunner", "npc_fellrunner", "Fell-runner Aeronwy", "harrowlop:21,galewing:22", [
    "Cloud from the Congleton side is a staircase somebody built out of spite.",
    "Spite wins.",
    "Spite loses. Rarely. Enjoy it.",
    "Gritstone Trail ends at Mow Cop. The plaque's a lie, mind — it ends where your knees stop."
  ], { ai: "smart" });
  tr("tr_bosley_cloud_2", "historian", "npc_historian", "Bridestone Watcher Idwal", "runestane:22,dolmenor:22,moorcock:21", [
    "Neolithic chambered tomb, robbed for a road in 1764. The county has always been practical.",
    "Practical wins.",
    "Practical loses. Also historically accurate.",
    "The stones hum in fog. Not wind — hum. Somebody's reading them like a keyboard."
  ], { ai: "smart" });
  tr("tr_bosley_cloud_3", "walker", "npc_walker", "Walker Gwenlli", "moorcock:22,harrowlop:22,galewing:21", [
    "Seven counties from the top, they say. I've counted five and a rumour.",
    "Five and a rumour.",
    "Count them yourself, then.",
    "There's a bear up here. A real one, near enough. Congleton's own, gone feral and gone home."
  ]);

  tr("tr_route_congleton_moreton_1", "cyclist", "npc_cyclist", "Cyclist Maddox", "sparkrail:21,keystone:21", [
    "Biddulph Valley Way. Old railway. Flat, straight, and mine.",
    "Mine.",
    "Yours. There's a tramway cutting halfway that's worth the detour.",
    "Watch for the sleepers. They're not all sleeping."
  ]);
  tr("tr_route_congleton_moreton_2", "farmer", "npc_farmer", "Farmer Hesketh", "sheepwire:21,ramvolt:22,mistewe:21", [
    "Moat garden's the Hall's, the field's mine, and the hedge is a matter of opinion.",
    "My opinion.",
    "Your opinion. For now.",
    "The Hall leans. It's leaned since 1580. Everyone panics about it once and then gets on."
  ]);
  tr("tr_route_congleton_moreton_3", "amos_impostor", "npc_amos", "Warden Pryderi", "amoslurk:22,peepcam:22,trojanox:21", [
    "Lovely day. Lovely hall. Lovely to see you again.",
    "Lovely.",
    "We haven't met. I know. I said 'again' and you noticed and I saw you notice.",
    "There are four of us with this face this month. Two of them are the real one."
  ], { ai: "smart" });

  tr("tr_little_moreton_hall_1", "granny", "npc_granny", "The Crooked Housekeeper", "tudorling:22,manorwraith:23", [
    "Nothing in this house is level and I include myself in that.",
    "Still standing. Just.",
    "Down I go, then. Slowly, like the long gallery.",
    "The moat's got a key in it. Been in there since the Civil War. I'd not fish for it in a good coat."
  ], { ai: "smart" });
  tr("tr_little_moreton_hall_2", "ghost_trainer", "npc_ghost_trainer", "The Long Gallery", "timberwraith:23,tudorling:22,mistwisp:22", [
    "...",
    "The floor sags. The floor has always sagged. You get used to the sound.",
    "The house lets you go. It is a very polite house.",
    "God is not in the plasterwork. The plasterwork just says so."
  ], { ai: "smart" });

  tr("tr_mow_cop_1", "historian", "npc_historian", "Old Man of Mow's Keeper", "mowstane:23,runestane:23,gargoylet:22", [
    "The castle's a folly. Built in 1754 to look ruined. Cheshire invented content.",
    "Ruined on purpose. Like me.",
    "Ruined properly, then. Go and look at the view, it's the honest bit.",
    "The pillar walks. Not far. Just enough that the photographs don't match."
  ], { ai: "smart" });
  tr("tr_mow_cop_2", "fellrunner", "npc_fellrunner", "Trail-ender Sara", "galewing:23,harrowlop:23", [
    "Gritstone Trail, thirty-five miles, Lyme Park to here. I've done it twice and lied about the first one.",
    "Thirty-five miles of legs.",
    "You'd do it. You've got the walk of somebody who doesn't stop.",
    "Sign the book at the folly. Everybody signs the book. Half the names are dogs."
  ], { ai: "smart" });

  // ============ Chapter 5 — the canal, the crosses, the yard =============
  tr("tr_route_congleton_sandbach_1", "boater", "npc_boater", "Boatwoman Del", "towpaddle:23,mallardier:23", [
    "Wheelock flight. Sixteen locks, four hours, and a conversation with everyone you meet twice.",
    "Sixteen locks. Told you.",
    "Fifteen. I'll take it.",
    "Ride the boats across the pound if you like. They don't stop, mind."
  ], { ai: "random" });
  tr("tr_route_congleton_sandbach_2", "angler", "npc_fisher", "Angler Rhodri", "perchip:23,piketide:24,crabbex:22", [
    "Rode Heath. Used to be salt works. Now it's a pond and a rumour about a pike.",
    "The pike is real.",
    "The pike is a story. A very heavy story.",
    "Something's been chalking the lock beams. Not graffiti. Marks. In order."
  ], { ai: "random" });
  tr("tr_route_congleton_sandbach_3", "stuffer", "npc_stuffer", "Stuffer Josh", "puppetacct:23,proxling:23,botnetle:23", [
    "I'm in Year Thirteen and I'm making four grand a month and my mum thinks I do tutoring.",
    "Tutoring.",
    "It IS tutoring. Sort of. It's teaching computers to be people.",
    "Don't tell my mum. Tell her I do tutoring. Please."
  ], { ai: "greedy" });

  tr("tr_sandbach_1", "historian", "npc_historian", "Historian Nia", "belfrit:23,crossbell:25,quillet:23", [
    "Two Saxon crosses, ninth century, smashed by Puritans, kept in gardens, put back up in 1816.",
    "Kept. That's the word. Kept.",
    "Right. You listen. Most people photograph and go.",
    "Somebody has chalked the panels. Four of them. Not a child — a hand that knows what the carvings mean."
  ], { ai: "smart" });
  tr("tr_sandbach_2", "stallholder", "npc_shopkeep", "Cheesewright Gethin", "curdli:23,cheshwheel:25", [
    "Thursday market. Cheese, cobbles, and a queue that has been the same eleven people since 1997.",
    "Eleven people and a win.",
    "Ten people. Somebody left. It's the talk of the square.",
    "Crumbly, not creamy. Cheshire cheese is a salt cheese. It tastes like the ground it stood on."
  ], { ai: "random" });
  tr("tr_sandbach_3", "walker", "npc_walker", "Carter Bram", "sleeperk:24,bricklum:24,keystone:23", [
    "Haulage. Forty years. I know every bridge in this county by its height and its temper.",
    "Bridge holds.",
    "Bridge wins. They usually do.",
    "There's a lorry parked up on the Elworth cut that's been there nine days with the engine running."
  ]);
  tr("tr_sandbach_4", "granny", "npc_granny", "Runewife Hild", "crossbell:25,belfrit:24,manorwraith:24", [
    "Rubbing, not tracing. Rubbing. There's a difference and the difference is respect.",
    "Respectfully, no.",
    "Respectfully, yes. Take a sheet. Take two, you'll ruin the first.",
    "The interlace is a key. It always was. Somebody's finally noticed, and I wish they hadn't."
  ], { ai: "smart" });
  tr("tr_sandbach_5", "shadow_it", "npc_shadow_it", "Contractor Mostyn", "botling:24,peepcam:24,proxling:24", [
    "I do the square's CCTV. Twelve cameras. Nine work. Three point at my van, which is a coincidence.",
    "Coincidence holds.",
    "Coincidence collapses. Fine. I'll move the van.",
    "Somebody else is on my recorder. Not the council. The council can't even log in."
  ], { ai: "greedy" });

  tr("tr_route_sandbach_crewe_1", "signaller", "npc_signaller", "Relief Signaller Owain", "sparkrail:24,chuglet:24,sleeperk:24", [
    "Elworth cut. West Coast Main Line one side, salt the other. Britain in a sentence.",
    "Line's clear.",
    "Line's yours. Mind the ballast, it eats ankles.",
    "The interlocking at Crewe went funny on Tuesday. Not broken. Funny. Funny is worse."
  ], { ai: "smart" });
  tr("tr_route_sandbach_crewe_2", "kid", "npc_kid", "Spotter Kai", "chuglet:24,sparkrail:25,keystone:24", [
    "Three hundred and eleven numbers in the book. My grandad's got nine thousand.",
    "Three hundred and twelve.",
    "You're in the book now. Don't be weird about it.",
    "There's a loco in the sheds nobody's written down. That's not possible. Everything's written down."
  ], { ai: "random" });
  tr("tr_route_sandbach_crewe_3", "stuffer", "npc_stuffer", "Stuffer Immy", "puppetacct:25,botnetle:25,proxling:24", [
    "Residential proxy. Sounds like an estate agent. Is basically an estate agent.",
    "Fog holds.",
    "Fog lifts. Briefly. It comes back, it always comes back.",
    "We didn't do the station. The station's above our pay grade and our pay grade is a Steam voucher."
  ], { ai: "greedy" });

  tr("tr_crewe_1", "signaller", "npc_signaller", "Signalman Ted", "chuglet:25,sparkrail:25,sleeperk:25", [
    "Crewe. Six routes, one junction, and every train in England has been late here at least once.",
    "Signal's red.",
    "Signal's green. Off you go, and mind the gap in the timetable.",
    "There's a lap of the yard with a train on it that isn't in the working timetable."
  ], { ai: "smart" });
  tr("tr_crewe_2", "saltworker", "npc_saltworker", "Yardmaster Nkechi", "bricklum:25,shunterra:26,sleeperk:25", [
    "I shunt. I have shunted for nineteen years. Everything in my life is a problem of order.",
    "In order.",
    "Out of order. Which is at least interesting.",
    "One wagon in road four has moved three times tonight and nobody has been near it."
  ], { ai: "smart" });
  tr("tr_crewe_3", "developer", "npc_dev", "Dispatcher Mags", "peepcam:25,botling:25,poltergrid:26", [
    "The trains aren't colliding on the rails. They're colliding in the SCHEDULE. That's much worse.",
    "Schedule holds. Barely.",
    "Schedule's yours. Good luck, it's a nightmare and it's beautiful.",
    "Every thirteenth minute. Every single one. That's not corruption, that's a heartbeat."
  ], { ai: "smart" });
  tr("tr_crewe_4", "stallholder", "npc_shopkeep", "Nantwich Road Barber Fey", "curdli:25,cheshwheel:26", [
    "Been on this road since the Works had ten thousand men on it. Cut most of their hair.",
    "Trim's a trim.",
    "Fair. Sit down after, you look tired.",
    "The salon three doors down went under. Nice woman. Clicked a browser update and that was the business."
  ], { ai: "random" });

  // Gym 4 — the roundhouse
  tr("tr_crewe_gym_1", "signaller", "npc_stoker", "Fireman Gwil", "chuglet:25,shunterra:26", [
    "Turntable's yours to turn. Turn it wrong and you'll be looking at a wall for a while.",
    "Wall.",
    "Road four. Straight through. Go on.",
    "She talks to that loco. Swears at it, mostly. It's the same thing with her."
  ]);
  tr("tr_crewe_gym_2", "saltworker", "npc_stoker", "Boilersmith Ceri", "shunterra:26,bricklum:26,chuglet:25", [
    "Firebox door open, you're a furnace. Shut, you're a kettle. Di is both and does not warn you.",
    "Kettle.",
    "Furnace. All right. Through you go.",
    "Sun on turn one. It's not a trick. It's the shed at six in the morning with the doors open."
  ], { ai: "smart" });
  tr("tr_crewe_gym_3", "kid", "npc_stoker", "Cleaner Bryn", "chuglet:26,sparkrail:26,sleeperk:25", [
    "I'm a cleaner. That's the bottom rung. Everybody starts on the bottom rung, including her.",
    "Bottom rung, top result.",
    "Fair. I'll be a fireman by Christmas.",
    "She keeps a loco in steam that the company sold in 1968. Nobody asks how."
  ], { ai: "random" });

  T("leader_di", {
    name: "Stoker Di", cls: "Gym Leader", sprite: "di", ai: "smart",
    party: p("chuglet:25,shunterra:26,bricklum:26,steamloco:28"),
    payout: 5200,
    leader: { badge: "badge_kernel", town: "crewe", type: "fire", tm: "tm_firebox_roar" },
    house: {
      note: "SUN ON TURN ONE. THAT IS NOT A TRICK, THAT IS A SHED AT SIX IN THE MORNING WITH THE DOORS OPEN.",
      weather: "sun", permanent: true
    },
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.75, events: [
          { say: "Di does not look at you. \"Go on, love,\" she says, to the engine. \"Go ON.\"" },
          { setWeather: "sun", turns: 99 }
        ] },
        { hpFrac: 0.5, events: [
          { say: "\"Right. She's overfired. That's my fault and she'll not forgive me for a fortnight.\"" },
          { changeForm: { speciesId: "steamloco_overfired", keepHp: true } },
          { boostSelf: { atk: 1, spe: 1 } }
        ] },
        { hpFrac: 0.2, events: [
          { say: "\"Blowing off. Stand back — no, properly back, I'm not scraping you off the pit wall.\"" },
          { healSelf: 0.18 },
          { forceOverdrive: true }
        ] }
      ]
    },
    intro: [
      "Stoker Di. Mind the pit, mind the turntable, and don't touch her — she's in steam and she bites.",
      "Fire gym in a railway town. Nobody has ever once been surprised by that and I'm not going to pretend."
    ],
    win: ["Come back when you can take a bit of heat. There's tea in the mess and the kettle's a boiler."],
    lose: [
      "HA. Right. Right! You let her burn herself out and then you hit her. That's the whole job, that.",
      "KERNEL badge. Firebox Roar. And the Railcard office is two streets down — tell them Di signed it."
    ],
    after: [
      "The interlocking's clean now the fog's off. Trains are running. Twelve platforms and every one of them lying to itself an hour ago.",
      "Ladder's open when you fancy it. I go up five levels and then I stop being nice."
    ],
    rematch: { party: p("steamloco:32,shunterra:32,bricklum:32,pantogriff:33,sleeperk:32,steamloco:35"), every: 1 }
  });

  T("twelve_k", {
    name: "TWELVE-K", cls: "Credential Stuffer", sprite: "twelve_k", ai: "smart",
    party: p("puppetacct:25,proxling:25,botnetle:26,trojanox:26,puppetacct:27"),
    payout: 4000,
    boss: {
      cannotCatch: true,
      arenaWeather: "fog",
      phases: [
        { hpFrac: 0.6, events: [
          { say: "\"Twelve thousand. That's the number. That's the whole personality, if I'm honest.\"" },
          { setWeather: "fog", turns: 99 },
          { boostSelf: { spe: 1 } }
        ] },
        { hpFrac: 0.25, events: [
          { say: "\"The three of them are children. I recruit children because children believe throughput is a virtue.\"" },
          { summonAdd: { species: "puppetacct", level: 25 } }
        ] }
      ]
    },
    intro: [
      "Throughput's four hundred a second and rising. You are a rounding error with a rucksack.",
      "The lanyard? Contractor. Everyone's a contractor. That's the modern condition."
    ],
    win: ["Rounding error. Told you."],
    lose: ["Fine. FINE. The fog comes off the station and the trains run and nothing about my week changes."],
    after: ["Read the lanyard properly if you're going to stare at it. It's got a canteen barcode on it."]
  });

  T("boss_apt", {
    name: "The APT", cls: "Shadow IT Contractor", sprite: "npc_shadow_it", ai: "smart",
    party: p("poltergrid:25,botnetle:26,trojanox:26,puppetacct:27"),
    payout: 4600,
    boss: {
      cannotCatch: true,
      overdriveStart: 25,
      phases: [
        { turn: 1, events: [
          { say: "The tilting train takes the curve and the whole deck leans, and the fight leans with it." },
          { setWeather: "fog", turns: 99 }
        ] },
        { hpFrac: 0.55, events: [
          { say: "Di's loco comes up on the parallel road, blows off, and the fog goes ragged for a moment." },
          { setWeather: "sun", turns: 4 },
          { boostSelf: { spa: 1 } }
        ] },
        { hpFrac: 0.25, events: [
          { say: "Something in the interlocking tries to route you into a siding that has not existed since 1987." },
          { summonAdd: { species: "puppetacct", level: 26 } },
          { healSelf: 0.15 }
        ] }
      ]
    },
    intro: [
      "The Heritage Centre's tilting prototype, forty years out of service, doing a scripted lap of the yard.",
      "There is something aboard it that logs in as eleven hundred people at once."
    ],
    win: ["The lap ends where it began. So do you, and the fog is still on the platforms."],
    lose: ["The train coasts to the buffers and the fog goes off the station like a held breath."],
    after: ["Twelve platforms. Every departure board in agreement. It is almost unsettling."]
  });

  T("vex_3", {
    name: "VEX", cls: "Rival", sprite: "vex", ai: "smart",
    party: p("gnawlord:24,peepcam:24,botnetle:25,fulgurcat:25,spindrake:26"),
    payout: 2600,
    intro: [
      "Platform six. Don't say anything about the salon.",
      "I said DON'T. Right. Good. Fight me instead, it's easier."
    ],
    win: ["There. That's better. That's much better than talking."],
    lose: [
      "It's fine. It was a browser update. She clicked it. Everyone clicks it.",
      "...Don't say noted. Don't you dare say noted at me."
    ],
    after: ["Train's at nine. Sit where you like. Not next to me. ...Fine. Next to me."],
    rematch: { party: p("gnawlord:30,fulgurcat:31,peepcam:31,botnetle:31,pantogriff:32,spindrake:33"), every: 2 }
  });
})();
