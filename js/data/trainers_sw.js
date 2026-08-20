// =============================================================
// MonsterQuest v2 — trainers of the SOUTH-WEST region (Ch.6-7).
// Route and town trainers `tr_<mapid>_<n>`, Gym 5 `leader_nell`,
// Gym 6 `leader_jack`, the rival fight `vex_3`, and the bosses:
// `boss_kellan` (the lido), `boss_hack_green_ops`, the Understudy at
// Middlewich, and `boss_terrataur` under Northwich.
// Shapes per ENGINE-ARCHITECTURE §4 + the battle team's `house`/`boss`.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  function p(str) {
    const out = [], parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const bits = parts[i].trim().split(":");
      const m = { species: bits[0], level: Number(bits[1]) };
      if (bits[2]) m.gear = bits[2];
      if (bits[3]) m.ability = bits[3];
      out.push(m);
    }
    return out;
  }
  function T(id, def) { D.define("trainers", id, def); }
  // Border routes are shared with region-mid: whoever defines first wins.
  function TShared(id, def) { if (!D.has("trainers", id)) D.define("trainers", id, def); }

  // tr(id, cls, sprite, name, party, [intro, theyWin, theyLose, after], extra)
  function tr(id, cls, sprite, name, party, lines, extra) {
    const def = {
      name: name, cls: cls, sprite: sprite, party: p(party), ai: "greedy",
      intro: [lines[0]], win: [lines[1]], lose: [lines[2]], after: [lines[3]]
    };
    if (extra) { const k = Object.keys(extra); for (let i = 0; i < k.length; i++) def[k[i]] = extra[k[i]]; }
    T(id, def);
  }
  function trShared(id, cls, sprite, name, party, lines, extra) {
    if (D.has("trainers", id)) return;
    tr(id, cls, sprite, name, party, lines, extra);
  }

  // =====================================================================
  // R15 Willaston & Wybunbury — the walk out of Crewe (shared border)
  // =====================================================================
  trShared("tr_route_crewe_nantwich_1", "farmer", "npc_farmer", "Farmer Gwilym", "sheepwire:25,curdli:25", [
    "Tower leans four foot off true and has done since before your grandad. Mind the sheep.",
    "Sheep hold. Tower holds. You do not.",
    "Fair. The sheep were never on my side anyway.",
    "Wybunbury's tower fell down four times. The fifth time they gave up and kept the bit that leans."
  ], { ai: "random" });
  trShared("tr_route_crewe_nantwich_2", "walker", "npc_walker", "Walker Pen", "ramvolt:26,rottling:25,keystone:26", [
    "Six miles of lane and one hedge with a gap in it. I've been looking for the gap since March.",
    "Still looking. Still winning.",
    "Right. You can have the gap. It's past the third gate and it's full of nettles.",
    "Nettles are a hedge's way of saying it means it."
  ]);

  // =====================================================================
  // NANTWICH — brine, timber, cheese, and a leader who used to do forensics
  // =====================================================================
  tr("tr_nantwich_1", "stallholder", "npc_shopkeep", "Cheesewright Huw", "curdli:26,rottling:26", [
    "Nantwich cheese, Nantwich salt, Nantwich opinions. All three keep.",
    "Kept. Wrapped. Priced.",
    "Go on then, a corner of the truckle. Don't tell the show judges.",
    "Show's Saturday on the cheese ground. Bring a coat and a bigger bag."
  ], { ai: "random" });
  tr("tr_nantwich_2", "historian", "npc_historian", "Fire Warden Alys", "panscald:27,sootling:26,saltling:27", [
    "Ten days the town burned in 1583. Queen paid for the rebuild. That's why it's all black and white.",
    "Ten days. Held.",
    "Doused. Fair enough. I'll go back to the re-enactment.",
    "Every gable in this town has a date on it and a grudge behind it."
  ], { ai: "smart" });
  tr("tr_nantwich_3", "angler", "npc_fisher", "Angler Meirion", "crabbex:26,puddlish:26,volteel:27", [
    "Weaver's slow here. Slow water, patient fish, patient man.",
    "Patience one, hurry nil.",
    "Hurry one. I'll allow it. Once.",
    "There's an eel under the bridge that shorts out the streetlamp. I've stopped reporting it."
  ], { ai: "random" });
  tr("tr_nantwich_4", "saltworker", "npc_saltworker", "Brine-hand Ceri", "brinelet:27,saltling:27", [
    "Two hundred foot down there's water saltier than the sea. We've been pulling it up since the Romans.",
    "Still pumping.",
    "Pump's off. Have your win.",
    "The lido's the same water, warmed. Best swim in the county and don't tell anyone."
  ]);
  tr("tr_nantwich_5", "kid", "npc_kid", "Kid Owain", "brinelet:25,saltling:25,curdli:26", [
    "I can hold my breath the whole length of the lido. Nearly.",
    "NEARLY the whole length. That's a win.",
    "Fine. You can have it. I'm going back in.",
    "There's a key at the bottom of the deep end. Nobody's got it up yet."
  ], { ai: "random" });
  tr("tr_nantwich_6", "farmer", "npc_farmer", "Farmer Bethan", "sheepwire:27,ramvolt:27,curdli:27", [
    "Prize ram's gone. I'm in no mood, and I'd like to take it out on someone who can take it.",
    "Better. Not better enough to find him, mind.",
    "Right. Now help me look. Hoofprints go west and they don't come back.",
    "Six of my sheep are in a shed somewhere doing sums for strangers. Sums."
  ], { ai: "smart" });

  tr("tr_nantwich_gym_1", "saltworker", "npc_saltworker", "Lane One Nia", "brinelet:26,crabbex:26", [
    "Lane one. Keep to your lane. Nell's very firm about lanes.",
    "Lane held.",
    "Lane lost. Go on, lane two's open.",
    "The lock gates at the far end are real. She had them shipped in."
  ]);
  tr("tr_nantwich_gym_2", "angler", "npc_fisher", "Lane Three Tomos", "crabbex:27,volteel:27,brinelet:26", [
    "Rain's permanent in here. It's not weather, it's policy.",
    "Policy holds.",
    "Policy amended. You'd better see her.",
    "She keeps the rain on because evidence keeps better wet. Ask her. She'll tell you properly."
  ]);
  tr("tr_nantwich_gym_3", "saltworker", "npc_saltworker", "Gatekeeper Rhys", "saltling:27,brinelet:28,panscald:28", [
    "Last gate before the deep end. She's in the water. She's always in the water.",
    "Gate shut.",
    "Gate open. Mind the step, it's the one bit she never fixed.",
    "Ex-forensics, Nell. She'll ask you what you SAW, not what you think."
  ], { ai: "smart" });

  T("leader_nell", {
    name: "Nell", cls: "Brine Nell", sprite: "nell", ai: "smart",
    party: p("brinelet:26,crabbex:27,volteel:28,panscald:28,saltmaid:31::brine_body"),
    payout: 3200,
    leader: { badge: "badge_token", town: "nantwich", type: "water", tm: "tm_brine_jet" },
    house: {
      note: "IT RAINS IN HERE. IT HAS ALWAYS RAINED IN HERE. BRING A TOWEL AND A BETTER PLAN.",
      weather: "rain", permanent: true,
      jamAgent: { id: "vigil", turns: 3 }
    },
    boss: {
      cannotCatch: true,
      arenaWeather: "rain",
      phases: [
        { hpFrac: 0.60, events: [
          { say: "Nell surfaces at the lane rope and does not get out. \"Salt keeps things. Doesn't ask if they were worth keeping.\"" },
          { setWeather: "rain", turns: 99 },
          { boostSelf: { spd: 1 } }
        ] },
        { hpFrac: 0.32, events: [
          { say: "\"Brine Body. It's not a trick, it's the water. The water's on my side because I got here first.\"" },
          { healSelf: 0.22 },
          { boostSelf: { spa: 1 } }
        ] },
        { hpFrac: 0.12, events: [
          { say: "\"Right. Now show me what you actually saw, not what you brought.\"" },
          { boostSelf: { atk: 1, spe: 1 } }
        ] }
      ]
    },
    intro: [
      "Nell. Twenty-two years in forensics before this and I have never once been surprised by a confession.",
      "House rule: it rains. Evidence keeps better wet and so do I."
    ],
    win: ["Nothing you did was wrong. It was just all the same thing five times. Vary it."],
    lose: ["That's the TOKEN. And the card — Brine Jet. Aim low; water finds the floor."],
    after: [
      "You'll be going to Wales, I hear. Good. Go and eat something that wasn't in a van.",
      "And when you come back you'll be different, and you'll want to tell me, and I'll listen."
    ],
    rematch: { party: p("saltmaid:36,volteel:35,krabbaron:35,panscald:36,salberg:37,saltmaid:39::brine_body"), every: 1 }
  });

  tr("tr_nantwich_brine_lido_1", "cultist", "npc_cultist", "ClickFix Novice Ffion", "puppetacct:26,botling:26", [
    "The pool is clean! One command and you are clean! Do not read it!",
    "Cleansed. Dripping. Cleansed.",
    "I did read it. There's a bit in the middle that's just someone's shopping.",
    "Kellan says reading is doubt. Kellan also reads. I've watched him."
  ], { ai: "random" });
  tr("tr_nantwich_brine_lido_2", "cultist", "npc_cultist", "ClickFix Preacher Osian", "puppetacct:27,proxling:27,botling:27", [
    "Fifty yards of warm brine and a town that will not step in! It is right THERE!",
    "Doubt holds the town. Doubt always holds the town.",
    "...they're not frightened of the water. They're frightened of us. Oh.",
    "I'll go and stand somewhere else. Somewhere with fewer people in swimming caps."
  ], { ai: "greedy" });

  T("boss_kellan", {
    name: "Brother Kellan", cls: "ClickFix Prophet", sprite: "kellan", ai: "smart",
    party: p("puppetacct:28,proxling:28,botling:29,puppetacct:31"),
    payout: 3000,
    boss: {
      cannotCatch: true,
      arenaWeather: "rain",
      phases: [
        { hpFrac: 0.62, events: [
          { say: "\"Copy! Paste! Run! It takes four seconds and then you are CLEAN!\"" },
          { setWeather: "rain", turns: 12 },
          { boostSelf: { spa: 1 } }
        ] },
        { hpFrac: 0.30, events: [
          { say: "Steam comes off the brine. Both sides heal a little and neither side stops." },
          { healSelf: 0.20 },
          { summonAdd: { species: "puppetacct", level: 29 } }
        ] }
      ]
    },
    intro: [
      "Brother Kellan. Holmes Chapel, Year Nine IT, twenty-one years, and then this.",
      "I am going to baptise this town in four seconds flat and it will thank me."
    ],
    win: ["Do not read it. Reading is doubt. Doubt is why you are wet and I am not."],
    lose: ["...I have read it. That's the trouble. I read it in March and I kept going anyway."],
    after: ["Ask me who pays. Go on. Ask me what they pay me IN."]
  });

  tr("tr_nantwich_acton_field_1", "ghost_trainer", "npc_ghost_trainer", "Pikeman of 1644", "phantasmal:27,mistwisp:27", [
    "Halt. Which side? — There were only two and both of them were hungry.",
    "Then stand aside, sir.",
    "...I have forgotten which side I was. That is the worst of it.",
    "Twenty-fifth of January. The snow came in and the siege lifted and nobody told us."
  ], { ai: "greedy" });
  tr("tr_nantwich_acton_field_2", "ghost_trainer", "npc_ghost_trainer", "Dragoon of 1644", "gloamite:27,phantasmal:28", [
    "The town wears holly on Holly Holy Day. We wear the field.",
    "Field's ours tonight.",
    "Field's yours. It always was. We only borrowed it for an afternoon in January.",
    "There's a musket ball in the church door. Go and put your thumb in it."
  ], { ai: "greedy" });
  tr("tr_nantwich_acton_field_3", "historian", "npc_historian", "Re-enactor Mared", "poltergrid:28,phantasmal:28,mistwisp:28", [
    "I do this every January in a wool coat and I have never once been warm.",
    "Cold and correct.",
    "Cold and beaten. Marginally better.",
    "The odd thing is the ones out here in the dark know things about the battle I've never published."
  ], { ai: "smart" });

  // =====================================================================
  // HACK GREEN — the bunker under a field with a sign that says nothing
  // =====================================================================
  tr("tr_route_nantwich_hackgreen_1", "walker", "npc_walker", "Walker Idris", "sheepwire:27,rottling:27", [
    "Sign says SECRET NUCLEAR BUNKER. In letters. On a road sign.",
    "Best-kept secret in Cheshire, that.",
    "Fine. Go and look at it. Everyone does.",
    "Bloke in the farm shop has the key and he'd like a word about badgers first."
  ], { ai: "random" });
  tr("tr_route_nantwich_hackgreen_2", "shadow_it", "npc_shadow_it", "Contractor Rees", "botling:28,virling:28,puppetacct:28", [
    "I put a relay in a field. Nobody asked. Nobody's asked since.",
    "Still nobody asking.",
    "Right, well. You're asking. That's new.",
    "The bunker's got fibre in it. Cold-war concrete and gigabit. Somebody paid for that."
  ], { ai: "greedy" });
  tr("tr_hack_green_b1_1", "stuffer", "npc_stuffer", "Stuffer Del", "puppetacct:41,botling:41", [
    "Regional relay. Twelve thousand puppets need somewhere quiet with thick walls.",
    "Throughput holds.",
    "Throughput's down. TWELVE-K will do his face about it.",
    "He's not even here. It's all overflow. We just water it."
  ], { ai: "greedy" });
  tr("tr_hack_green_b2_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Vaughan", "wormhack:42,trojanox:42,teramite:43", [
    "Maintenance. Site's closed. You know how this goes.",
    "Closed.",
    "Open, apparently. Don't touch the switchboard, the labels are wrong on purpose.",
    "We didn't build the racks down here. We just plug into them like everyone else."
  ], { ai: "smart" });
  tr("tr_hack_green_b2_2", "shadow_it", "npc_shadow_it", "Contractor Bryn", "botnetle:42,puppetacct:42", [
    "Government surplus, mate. If you can carry it out you can have it.",
    "Carried.",
    "Dropped. I'll be off.",
    "The decontamination corridor's got a working shower. I use it. It's the best shower in Cheshire."
  ], { ai: "greedy" });

  T("boss_hack_green_ops", {
    name: "The Ops Room", cls: "DARKBYTE Agent", sprite: "npc_darkbyte", ai: "smart",
    party: p("trojanox:43,wormhack:44,teramite:46"),
    payout: 4200,
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.70, events: [
          { say: "Every switchboard lamp in the room comes up at once. It is not a warning; it is a roll-call." },
          { boostSelf: { spe: 1 } },
          { jamAgents: 2 }
        ] },
        { hpFrac: 0.42, events: [
          { say: "The tannoy clears its throat with a recording of a woman who has been dead thirty years." },
          { summonAdd: { species: "puppetacct", level: 42 } },
          { boostSelf: { def: 1 } }
        ] },
        { hpFrac: 0.16, events: [
          { say: "PHASE THREE. The plotting table lights up with a county that has not existed since 1979." },
          { healSelf: 0.20 },
          { boostSelf: { spa: 2 } }
        ] }
      ]
    },
    intro: ["Three phases and a concrete ceiling. Nobody outside would hear any of this."],
    win: ["The lamps go out one row at a time, in order, the way they were taught."],
    lose: ["The last lamp stays on for four seconds after the rest and then thinks better of it."],
    after: ["Someone has written HOLD on the plotting table in chinagraph. Not in this decade's handwriting."]
  });

  // =====================================================================
  // Y BERLLAN and the lane to the sea
  // =====================================================================
  tr("tr_y_berllan_1", "farmer", "npc_farmer", "Press-hand Dai", "perrypip:28,mulchmaw:28,perryarch:30", [
    "Dai. I turn the screw and Mam-gu tells me I'm turning it wrong. Twenty-six years of that.",
    "Turned right, see.",
    "Turned wrong. She'll be delighted.",
    "Blakeney Red, that tree by the shed. Not a pippin. A pippin's an apple. She'll tell you."
  ], { ai: "smart" });
  tr("tr_y_berllan_coed_1", "ranger", "npc_ranger", "Coedwigwr Hywel", "oakling:29,perryarch:30,derwydd:32", [
    "Croeso i'r coed. The wood is older than the orchard and it knows it.",
    "Yr hen dderwen sy'n ennill. The old oak wins.",
    "Da iawn. Go and sit under the big one. It likes being sat under.",
    "There's something in here that answers if you ask in Welsh. Only in Welsh. I've tested it."
  ], { ai: "smart" });
  tr("tr_aberaeron_1", "birder", "npc_birder", "Harbour-watch Lowri", "egrette:30,curlewind:30,mallardier:30", [
    "Fourteen colours of house and one colour of sea. That's Aberaeron.",
    "Sea holds. Sea always holds.",
    "Sea's yours for the afternoon. Get an ice cream, it's the law.",
    "Nothing's hummed at me since the train. Not one thing. It's lovely and it's very strange."
  ], { ai: "random" });

  // =====================================================================
  // R16 Weaver Valley — Nantwich to Winsford
  // =====================================================================
  tr("tr_route_nantwich_winsford_1", "boater", "npc_boater", "Boater Elin", "crabbex:27,mallardier:27,otterkin:28", [
    "Aqueduct carries the cut over the river. Water over water. Never stops being daft.",
    "Water over water, one nil.",
    "Fine. Daft and beaten.",
    "Church Minshull's got a pub with a fire in it. That's my whole review."
  ]);
  tr("tr_route_nantwich_winsford_2", "angler", "npc_fisher", "Angler Twm", "volteel:28,puddlish:27,torrentide:28", [
    "Eels in the Weaver take the streetlights out at Winsford twice a summer.",
    "Twice a summer, once today.",
    "Right, I'll not mention the third time.",
    "There's a hot patch where the brine comes in. Fish sit in it like a bath."
  ], { ai: "random" });
  tr("tr_route_nantwich_winsford_3", "farmer", "npc_farmer", "Farmer Nerys", "sheepwire:28,curdli:28,ramvolt:29", [
    "Meanders. The river can't make its mind up and neither can the county.",
    "Undecided and winning.",
    "Undecided and beaten. Consistent, at least.",
    "Two crossings between here and Winsford and one of them is a plank with ambition."
  ]);

  // =====================================================================
  // R17 Booth Lane — Sandbach to Middlewich (shared border)
  // =====================================================================
  trShared("tr_route_sandbach_middlewich_1", "boater", "npc_boater", "Boater Carwyn", "mallardier:29,crabbex:29,bargemog:30", [
    "Wheelock flight. Twenty-six locks and every one of them wants a word.",
    "Twenty-six nil.",
    "Twenty-five one. I'll take it.",
    "There's a cat lives on the lock beam at number eleven. It gets more visitors than the pub."
  ]);
  trShared("tr_route_sandbach_middlewich_2", "saltworker", "npc_saltworker", "Salt-carter Ffion", "saltling:29,cryssal:30", [
    "Booth Lane's the old salt road. Roman ruts under two feet of tarmac.",
    "Ruts hold.",
    "Ruts gave. Rare, that.",
    "You can still see the wharf where they loaded. It's a car park now, which is the fate of all wharves."
  ], { ai: "random" });

  // =====================================================================
  // MIDDLEWICH — Roman salt, two canals, and a face that isn't
  // =====================================================================
  tr("tr_middlewich_1", "boater", "npc_boater", "Boatwoman Carys", "bargemog:30,mallardier:30,krabbaron:31", [
    "Before you get a licence off me you get a battle off me. That's the test's first half.",
    "Second half's steering and you'd be worse at that.",
    "Right. Second half's steering. Meet me at the Big Lock and don't hit anything.",
    "Four mile an hour. If your wash is breaking on the bank you're going too fast and I will know."
  ], { ai: "smart" });
  tr("tr_middlewich_2", "bandsman", "npc_bandsman", "Folk-fiddler Jonah", "chordle:31,belfrit:30,curdli:30", [
    "Folk and Boat festival. Three days, four stages, one enormous argument about amplification.",
    "Amplified and correct.",
    "Unamplified and beaten. There's a lesson there and I refuse to learn it.",
    "The speakers on the festival field have started repeating a phrase between sets. Nobody programmed it."
  ], { ai: "random" });
  tr("tr_middlewich_3", "saltworker", "npc_saltworker", "Salt-boiler Rhodri", "saltling:30,cryssal:31,panscald:31", [
    "Romans boiled brine here in lead pans. We do it in steel now and it's still just boiling brine.",
    "Boiled.",
    "Off the heat. Fair.",
    "There's a ghost in the old pan house that counts. Just counts. Gets to sixty and starts again."
  ]);
  tr("tr_middlewich_4", "signaller", "npc_signaller", "Lockkeeper Meg", "keystone:30,bitmite:30,cryssal:31", [
    "Big Lock's the deepest on the Trent and Mersey. Fourteen foot of thinking time.",
    "Fourteen foot and still ahead.",
    "Down fourteen foot. Off you go.",
    "Junction of two canals and three counties' worth of opinions. I referee."
  ], { ai: "smart" });
  tr("tr_middlewich_5", "shadow_it", "npc_shadow_it", "Contractor Iolo", "botling:30,virling:31,proxling:31", [
    "Drone reroutes the salt carts. Efficiency. You wouldn't understand, you walk everywhere.",
    "Rerouted.",
    "Route's yours. The drone's sulking.",
    "It knows a towpath nobody's mapped. That's not efficiency, that's just knowing a towpath."
  ], { ai: "greedy" });

  T("boss_understudy_middlewich", {
    name: "Dr Wren Alder", cls: "Understudy", sprite: "alder_impostor", ai: "smart",
    party: p("amoslurk:31,phantasmal:31,amoslurk:33"),
    payout: 3400,
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.55, events: [
          { say: "\"Sit. No — sit. This'll take a cup.\" The cadence is perfect. The pause before 'cup' is four frames too long." },
          { boostSelf: { eva: 1 } }
        ] },
        { hpFrac: 0.25, events: [
          { say: "It stops doing the voice. What is underneath the voice is not a voice." },
          { changeForm: { species: "amoslurk" } },
          { boostSelf: { spa: 1, spe: 1 } }
        ] }
      ]
    },
    intro: [
      "Jim. You look exactly like you did in 2014 and I resent it.",
      "I've been reading the clause about badges. I've read it four times."
    ],
    win: ["\"I didn't write that. I don't write well like that.\" It says the line correctly and it means nothing by it."],
    lose: ["The face slides half an inch and stops pretending to be attached."],
    after: ["Where it stood there is a smell of a room you have sat in and a cardigan you have leaned against."]
  });

  // =====================================================================
  // R31 Croxton flashes / WINSFORD & the mine head
  // =====================================================================
  tr("tr_route_middlewich_winsford_1", "birder", "npc_birder", "Birder Lowri", "flashfin:30,mallardier:30,phishfin:31", [
    "Flashes are just holes the salt left. Fill with water, fill with birds. Nature's very forgiving of industry.",
    "Forgiving and correct.",
    "Forgiving and beaten. Come at dawn, that's when the big one shows.",
    "Something surfaced in Bottom Flash last week and it was not a pike."
  ], { ai: "smart" });
  tr("tr_route_middlewich_winsford_2", "walker", "npc_walker", "Walker Dilys", "sheepwire:30,saltling:30,curdli:30", [
    "Croxton lane. Flat as a lie and twice as long.",
    "Flat and ahead.",
    "Flat and behind. Still flat.",
    "The ground round here drops an inch a year and everyone's decided that's fine."
  ]);
  tr("tr_route_middlewich_winsford_3", "saltworker", "npc_saltworker", "Hi-vis Meredith", "cryssal:31,saltling:31,pillarnaut:32", [
    "Rock salt goes on your roads. Two hundred metres down and straight out to a gritter.",
    "Gritted.",
    "Skidded. All right.",
    "There's more mine under this county than there is county. Think about that walking home."
  ], { ai: "smart" });

  tr("tr_winsford_1", "miner", "npc_miner", "Miner Gethin", "cryssal:31,saltling:31,pillarnaut:32", [
    "Lamp on, hard hat on, and don't touch anything that hums.",
    "Nothing hummed. Good shift.",
    "Something hummed. Off you go.",
    "Deepest working's a hundred and fifty metres. Warm, dry, and it never rains. Best office in England."
  ]);
  tr("tr_winsford_2", "historian", "npc_historian", "Archivist Ivo", "bitmite:31,teramite:33,virling:31", [
    "DeepStore. Everything England would rather not lose, in the dark, at a constant fourteen degrees.",
    "Filed under 'expected'.",
    "Filed under 'revise'. That's the interesting drawer.",
    "There's a contract down here with a Georgian shell company on it and no signature I recognise."
  ], { ai: "smart" });
  tr("tr_winsford_3", "angler", "npc_fisher", "Flash-angler Sion", "flashfin:31,phishfin:31,volteel:32", [
    "Bottom Flash at dawn. Anything else is a hobby.",
    "Dawn wins.",
    "Dawn's yours. Bring a weighted line and a flask.",
    "One of my fish had a tag in its fin. Not a ring. A TAG."
  ], { ai: "random" });
  tr("tr_winsford_4", "saltworker", "npc_saltworker", "Foreman's Nephew Alun", "saltling:31,cryssal:32", [
    "Uncle runs the Northwich gym. I run the cage. Guess which of us gets the badge questions.",
    "Both of us, apparently.",
    "Both of us, and now I've lost as well. Marvellous.",
    "He measures everything in subsidence. 'That's about four inches, that is.' Everything."
  ], { ai: "random" });
  tr("tr_winsford_deepstore_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Nia", "bitmite:32,wormhack:32,teramite:33", [
    "Archive maintenance. You're not on the list and the list is very short.",
    "Not on the list.",
    "Fine. You're on the list. It's a bad list to be on.",
    "We rent the cold tier. From who? From an invoice, mate. Same as everyone."
  ], { ai: "smart" });
  tr("tr_winsford_deepstore_2", "shadow_it", "npc_shadow_it", "Contractor Pryce", "virling:32,botling:31,proxling:32", [
    "Fourteen degrees, no humidity, no questions. It's the perfect data centre and it's a salt mine.",
    "Perfect and undisturbed.",
    "Perfect and disturbed. That's the trouble with perfect.",
    "Somebody's containers came down the cage in March. Not ours. Nobody signed for them."
  ], { ai: "greedy" });

  // =====================================================================
  // THE SALT MINE
  // =====================================================================
  tr("tr_salt_mine_galleries_1", "miner", "npc_miner", "Shot-firer Bryn", "pillarnaut:32,cryssal:32,salberg:33", [
    "White cathedral, they call it. I call it Tuesday.",
    "Tuesday holds.",
    "Tuesday's ruined. Go on.",
    "Every pillar you can see is holding up a field. Some of them are holding up a school."
  ], { ai: "smart" });
  tr("tr_salt_mine_galleries_2", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Cadell", "trojanox:32,wormhack:33", [
    "Containers are inventory. Inventory isn't interesting. Move along.",
    "Nothing interesting here.",
    "...they hum on the same note. All forty. I did notice. I just kept getting paid.",
    "They're not servers. They're a shelf. Somebody's keeping something cold on purpose."
  ], { ai: "smart" });
  tr("tr_salt_mine_galleries_3", "caver", "npc_caver", "Caver Ffion", "gloamite:32,pillarnaut:32,cryssal:33", [
    "Salt eats rope and salt eats boots and salt is the only reason this roof is still up there.",
    "Roof holds. So do I.",
    "Roof holds. I don't.",
    "Down here your voice comes back wrong. Softer. Like something took the edges off it for you."
  ]);
  tr("tr_salt_mine_marston_b1_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Sior", "wormhack:33,trojanox:33,teramite:34", [
    "Sub-hideout. Grid galleries. You'll be lost in four minutes.",
    "Four minutes. Told you.",
    "Right, follow the rail. Always follow the rail.",
    "We took this place because nothing gets in and nothing gets out. Turns out that's true of us too."
  ], { ai: "smart" });
  tr("tr_salt_mine_marston_b1_2", "stuffer", "npc_stuffer", "Stuffer Meic", "puppetacct:33,botnetle:33", [
    "Twelve thousand puppets and not one of them has to breathe. Sound business.",
    "Sound business.",
    "Unsound business. I'm going back to sixth form.",
    "Marston's where the roof fell in in 1928. We're under the bit that didn't."
  ], { ai: "greedy" });
  tr("tr_salt_mine_marston_b1_3", "shadow_it", "npc_shadow_it", "Contractor Hafwen", "virling:33,botling:33,proxling:34", [
    "Nobody's asked for a change request under a salt mine. I'd like to keep it that way.",
    "No change requested.",
    "Change requested. Emergency, presumably.",
    "Whatever's in the far gallery isn't ours and it doesn't take instructions."
  ], { ai: "greedy" });
  tr("tr_salt_mine_marston_b2_1", "miner", "npc_miner", "Lampman Owain", "pillarnaut:33,salberg:34", [
    "Brine lake. Still as a plate and forty foot deep and warmer than it should be.",
    "Still water. Still winning.",
    "Ripples. Fair enough.",
    "It moved in the night once. Not the water. The floor."
  ], { ai: "smart" });
  tr("tr_salt_mine_marston_b2_2", "caver", "npc_caver", "Caver Tegwen", "salberg:33,crabbex:33,pillarnaut:34", [
    "Boat's a coracle with delusions. Mind the roof, it comes down without telling you.",
    "Roof one, head nil.",
    "Head one. Congratulations, you're taller than the roof.",
    "Past the lake there's a chamber the survey doesn't have. Ask anyone. They'll say the survey's fine."
  ]);

  T("boss_terrataur", {
    name: "TERRATAUR", cls: "Legendary", sprite: "npc_darkbyte", ai: "smart",
    party: p("terrataur:36"),
    payout: 0, legendary: true,
    boss: {
      cannotCatch: true,
      arenaTerrain: "salt",
      phases: [
        { hpFrac: 0.72, events: [
          { say: "It turns over once, the way a house turns over, and four streets in Northwich lean a degree east." },
          { setTerrain: "salt", turns: 99 },
          { boostSelf: { def: 1 } }
        ] },
        { hpFrac: 0.44, events: [
          { say: "Salt comes off the roof in sheets. It is not attacking you. You are simply in the room." },
          { boostSelf: { atk: 1 } },
          { summonAdd: { species: "pillarnaut", level: 33 } }
        ] },
        { hpFrac: 0.18, events: [
          { say: "It stops. It is enormous and it is very old and it would clearly rather be asleep." },
          { healSelf: 0.15 }
        ] }
      ]
    },
    intro: ["Something the size of a chapel disagrees with your torchlight."],
    win: ["It settles back into the salt and takes the noise with it. The pillars stop complaining."],
    lose: ["It lets you go. That is somehow worse."],
    after: ["Post-game, on the third depth, it will be here again and it will remember."]
  });

  // =====================================================================
  // R18 / R19 and NORTHWICH — Gym 6, Rock, Foreman Jack
  // =====================================================================
  tr("tr_route_winsford_northwich_1", "boater", "npc_boater", "Boater Huw", "mallardier:31,crabbex:31,otterkin:32", [
    "Vale Royal locks. Biggest on the Weaver. Built for salt barges, used by me.",
    "Barge one, walker nil.",
    "Walker one. The lock keeper will never let me forget it.",
    "Abbey was up on that bank. Biggest in the county and now it's a field with lumps in."
  ]);
  tr("tr_route_winsford_northwich_2", "birder", "npc_birder", "Marsh-watch Gwen", "mallardier:32,egrette:32,otterkin:32", [
    "River cliffs on one side, meanders on the other, herons on everything.",
    "Herons hold.",
    "Herons scattered. Thanks for that.",
    "The river half needs a boat and a nerve. The abbey site's free and mostly nettles."
  ], { ai: "random" });
  tr("tr_route_middlewich_northwich_1", "walker", "npc_walker", "Walker Efa", "saltling:31,sheepwire:31,cryssal:32", [
    "Rudheath. It's heath, and it's got holes in it that weren't there in April.",
    "Holes hold.",
    "Holes win eventually. They always do.",
    "Broken Cross is called that because of a cross. Which broke. Cheshire naming at its finest."
  ]);
  tr("tr_route_middlewich_northwich_2", "saltworker", "npc_saltworker", "Subsidence Surveyor Pat", "cryssal:32,pillarnaut:32,flashfin:32", [
    "I measure holes for a living. This year's holes are keener than last year's.",
    "Measured and steady.",
    "Measured and moved. I'll re-peg it.",
    "New flash opened on this route in the spring. It's forty foot deep and nobody's named it yet."
  ], { ai: "smart" });

  tr("tr_northwich_1", "saltworker", "npc_saltworker", "Salt Pan Sal", "panscald:32,saltling:32,cryssal:33", [
    "Open-pan salt. Skim it, rake it, dry it. Same as 1894 and I've the elbows to prove it.",
    "Skimmed.",
    "Spilled. It happens.",
    "Lion Salt Works is up the road and it is the best building in Cheshire. I will fight about this."
  ], { ai: "smart" });
  tr("tr_northwich_2", "signaller", "npc_signaller", "Bridge Keeper Dafydd", "keystone:32,volteel:32,krabbaron:33", [
    "Swing bridge. It swings when I say and not before, whatever the tide of complaints.",
    "Bridge shut.",
    "Bridge open. Go on, quick, before it changes its mind.",
    "Somebody's been swinging it at three in the morning. Not me. Not anyone with a key."
  ]);
  tr("tr_northwich_3", "historian", "npc_historian", "Curator Mari", "phantasmal:32,gloamite:32,ladymere:33", [
    "Weaver Hall. Half museum, half workhouse, entirely haunted according to the visitors' book.",
    "Catalogued.",
    "Recatalogued. Come back at closing, that's when it moves.",
    "Something comes UP the back stair from the mine. Small. Wet. Homesick."
  ], { ai: "smart" });
  tr("tr_northwich_4", "amos_impostor", "npc_amos", "The Vicar of Great Budworth", "amoslurk:32,phantasmal:33", [
    "Bore da. Or — good morning. Yes. Good morning. That's the one.",
    "The voice holds. The voice always holds.",
    "The voice cracks and there is nothing behind it that owns a voice.",
    "It leaves behind a hymn number and no hymn."
  ], { ai: "smart" });
  tr("tr_northwich_gym_1", "miner", "npc_miner", "Crust-walker Non", "saltling:31,cryssal:32", [
    "Floor's salt crust. Some of it holds. Guess which and don't be wrong twice.",
    "Held.",
    "Gave way. Down you go — it's only four feet, mind.",
    "Jack marks the safe path in chalk every morning and rubs it out at nine."
  ]);
  tr("tr_northwich_gym_2", "saltworker", "npc_saltworker", "Pan-hand Iestyn", "panscald:32,cryssal:32,saltling:33", [
    "Rock type in a rock town. There's no cleverness to it. There's just a lot of rock.",
    "Rock holds.",
    "Rock cracks. Rare, that.",
    "He adds a sixth at forty per cent. He's never once not done it. Plan for it anyway."
  ], { ai: "smart" });
  tr("tr_northwich_gym_3", "miner", "npc_miner", "Deputy Alaw", "pillarnaut:33,cryssal:33,salberg:34", [
    "Last one before Jack. He'll shake your hand and he'll mean it and then he'll flatten you.",
    "Flattened early. Saves time.",
    "Not flattened. He'll like that.",
    "Ask him about the buildings on jacks. He'll talk for an hour and it's worth every minute."
  ], { ai: "smart" });

  T("leader_jack", {
    name: "Jack", cls: "Foreman Jack", sprite: "jack", ai: "smart",
    party: p("saltling:31,cryssal:32,pillarnaut:33,panscald:33,salberg:36::salt_crust"),
    payout: 3800,
    leader: { badge: "badge_daemon", town: "northwich", type: "rock", tm: "tm_salt_grind" },
    house: {
      note: "SALT TERRAIN. THE FLOOR IS AN OPINION. MEASURE TWICE.",
      terrain: "salt", permanent: true,
      screens: "phys"
    },
    boss: {
      cannotCatch: true,
      arenaTerrain: "salt",
      phases: [
        { hpFrac: 0.66, events: [
          { say: "Jack puts a spirit level on the ring rope. \"Two inches off. Was level Tuesday.\"" },
          { setTerrain: "salt", turns: 99 },
          { boostSelf: { def: 1, spd: 1 } }
        ] },
        { hpFrac: 0.40, events: [
          { say: "\"Forty per cent. That's where I bring the sixth in. I've told everyone. Nobody plans for it.\"" },
          { summonAdd: { species: "pillarnaut", level: 34 } },
          { boostSelf: { atk: 1 } }
        ] },
        { hpFrac: 0.15, events: [
          { say: "\"Whole town's on jacks, lad. We lift the houses and we carry on. That's the trick.\"" },
          { healSelf: 0.18 },
          { boostSelf: { atk: 1 } }
        ] }
      ]
    },
    intro: [
      "Jack. Foreman. I measure everything in subsidence and I'm about four inches out today.",
      "House rule's the floor. It's salt, it cracks, and it does that to both of us."
    ],
    win: ["Four inches. Told you. Come back when you've shored something up."],
    lose: ["That's the DAEMON, and the card — Salt Grind. Grind low. Everything down here is low."],
    after: [
      "You've been in my mine. Don't say you haven't, you've salt in the turn-ups.",
      "Whatever's humming in those containers, it's been humming since March and it never once got louder."
    ],
    rematch: { party: p("salberg:39,pillarnaut:38,terrataur:41,panscald:38,cryssal:38,salberg:42::salt_crust"), every: 1 }
  });

  T("vex_3", {
    name: "VEX", cls: "Rival", sprite: "vex", ai: "smart",
    party: p("amoslurk:32,saltling:32,volteel:33,phishfin:33,trojanox:35"),
    payout: 2800,
    intro: [
      "You went to WALES. There's a datacentre under a salt mine and you went to Wales for PEARS.",
      "Don't. Don't say noted. I will put you in the Weaver."
    ],
    win: ["Shipped. Iterated. Won. Three for three, root user."],
    lose: ["Fine. FINE. You were right to go. I'm not saying it twice and I'm not saying it slowly."],
    after: [
      "My starter's been logging every catch I've made since Macclesfield. I checked. I finally checked.",
      "Don't look at me like that. I know. I KNOW."
    ]
  });

  // =====================================================================
  // R33 / ANDERTON / MARBURY / GREAT BUDWORTH / R34 / R20
  // =====================================================================
  tr("tr_route_northwich_anderton_1", "boater", "npc_boater", "Boater Rhonwen", "bargemog:32,krabbaron:33,mallardier:32", [
    "Weaver towpath. Lower level. Everything up there is fifty foot above us and smug about it.",
    "Fifty foot and still ahead.",
    "Fifty foot and behind. Take the lift, it's showing off but it works.",
    "The lift's on a smart plug. A SMART PLUG. Fifty foot of Victorian iron on a plug you buy in a supermarket."
  ], { ai: "smart" });
  tr("tr_route_northwich_anderton_2", "angler", "npc_fisher", "Angler Cai", "krabbaron:32,crabbex:32,volteel:33", [
    "Crabs in the Weaver. Iron-clawed things that take the bait and the hook and your patience.",
    "Claws hold.",
    "Claws off. Have your afternoon.",
    "One came up with a bottle in its claw and there was paper in the bottle and I put it back."
  ], { ai: "random" });
  tr("tr_anderton_1", "signaller", "npc_signaller", "Lift Engineer Beth", "krabbaron:33,keystone:33,bargemog:34", [
    "Caissons have to balance. If they don't, fifty feet of water decides for you.",
    "Balanced.",
    "Unbalanced and you still won. Come and help me weigh crates.",
    "One of the crates in the queue is a server and it is not on the manifest."
  ], { ai: "smart" });
  tr("tr_anderton_2", "boater", "npc_boater", "Boater Osian", "bargemog:33,mallardier:33,krabbaron:34", [
    "Cathedral of the canals, they call it. Iron, rust and Victorian nerve.",
    "Nerve holds.",
    "Nerve goes. Happens to everyone at the top.",
    "Cats always ride on the roof going up. Every cat. Nobody knows why and everybody's seen it."
  ]);
  tr("tr_anderton_3", "shadow_it", "npc_shadow_it", "Contractor Lowri", "botling:33,virling:33,proxling:34", [
    "I fitted the plug. Saves an engineer coming out. It's got an app and everything.",
    "App holds.",
    "App's asking me to log in again. It does that.",
    "Fifty foot of caisson answering to a phone. When you put it like that it sounds bad."
  ], { ai: "greedy" });
  tr("tr_marbury_park_1", "ranger", "npc_ranger", "Marbury Warden Sion", "owlume:33,strigyx:33,mossling:33", [
    "Beech avenues. Planted in rows by people who knew they'd never see them finished.",
    "Rows hold.",
    "Rows broken. They'll grow back over you, mind.",
    "The Lady walks the top avenue. I've stopped saying she doesn't."
  ], { ai: "smart" });
  tr("tr_marbury_park_2", "birder", "npc_birder", "Owl-counter Elin", "strigyx:33,owlume:34", [
    "Four tawnies and a barn owl and one thing that answers them wrong.",
    "Counted.",
    "Miscounted. Come back at midnight and we'll count together.",
    "The wrong one calls in a pattern. Same pattern. Every night. That's not an owl."
  ], { ai: "random" });
  tr("tr_route_anderton_budworth_1", "walker", "npc_walker", "Walker Bedwyr", "owlume:33,oakling:33,mossling:34", [
    "Upper level. Canal on your left, county on your right, owls above the lot of it.",
    "Owls approve.",
    "Owls disapprove. Of me.",
    "You can walk round the long way instead of the lift. Takes an hour. It's a lovely hour."
  ]);
  tr("tr_route_anderton_budworth_2", "ranger", "npc_ranger", "Ranger Nesta", "strigyx:34,mossling:33,oakling:34", [
    "Marbury avenues at dusk. Best hour in the county and I get paid for it.",
    "Dusk holds.",
    "Dusk goes. It always goes.",
    "Something walks the avenue that doesn't disturb the leaf litter. I log it as 'deer'."
  ], { ai: "smart" });
  tr("tr_great_budworth_1", "historian", "npc_historian", "Curate Elin", "belfrit:33,curdli:33,owlume:33", [
    "Prettiest village in Cheshire and somebody is ringing our parishioners pretending to be the vicar.",
    "Still ringing.",
    "Right. Then help me prove it isn't him. He's very upset and he's very bad at being upset.",
    "The voice is perfect. The vicar's voice, exactly. It's the pauses that are wrong."
  ], { ai: "smart" });
  tr("tr_great_budworth_2", "bandsman", "npc_bandsman", "Ringing Master Huw", "chordle:34,belfrit:33,curdli:33", [
    "Eight bells, forty thousand changes, and a tower that has never once been on time.",
    "Struck true.",
    "Struck wrong. Come up and pull a rope, you'll see.",
    "A round is easy. It's the changes that break people."
  ]);
  tr("tr_route_budworth_lymm_1", "walker", "npc_walker", "Walker Tegan", "mossling:34,owlume:34,otterkin:34", [
    "Arley estate lanes, then a footbridge over the Bollin that has one plank of opinion in it.",
    "Plank holds.",
    "Plank gives. Everyone's plank gives eventually.",
    "Badge six gets you through the estate. They check. They're very polite about checking."
  ]);
  tr("tr_route_budworth_lymm_2", "boater", "npc_boater", "Boater Mared", "bargemog:34,mallardier:34,krabbaron:35", [
    "Bollin crossing and then it's all Bridgewater from here to the noise.",
    "Crossed.",
    "Crossed by you. Fine. Say hello to Lymm's dam for me.",
    "Owls out here at night and one of them is a lot bigger than an owl."
  ], { ai: "smart" });
})();
