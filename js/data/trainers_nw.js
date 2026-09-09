// =============================================================
// MonsterQuest v2 — trainers of the NORTH-WEST region (Ch.8-12, post-game).
// Route/town trainers `tr_<mapid>_<n>`, the Ch.8 rival fight `vex_4`,
// Gym 7 `leader_ria` and Gym 8 `leader_mo`, the White Hats, Champion VEX
// (two variants), the bosses of the run-in — the Understudy at Beeston,
// the Mersey Gateway, ROOT, GLITCHRA, ORACLE — and the post-game elites.
// Shapes per ENGINE-ARCHITECTURE §4 + battle report §5 (`house`, `boss`).
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  function p(str) {
    const out = [], parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const bits = parts[i].trim().split(":");
      const mon = { species: bits[0], level: Number(bits[1]) };
      if (bits[2]) mon.gear = bits[2];
      out.push(mon);
    }
    return out;
  }
  function T(id, def) { D.define("trainers", id, def); }
  function tr(id, cls, sprite, name, party, lines, extra) {
    const def = {
      name: name, cls: cls, sprite: sprite, party: p(party), ai: "greedy",
      intro: [lines[0]], win: [lines[1]], lose: [lines[2]], after: [lines[3]]
    };
    if (extra) { const k = Object.keys(extra); for (let i = 0; i < k.length; i++) def[k[i]] = extra[k[i]]; }
    T(id, def);
  }
  const smart = { ai: "smart" }, dim = { ai: "random" };

  // =====================================================================
  // CHAPTER 8 — Delamere Forest
  // =====================================================================
  tr("tr_delamere_forest_1", "ranger", "npc_ranger", "Forester Owain", "mossling:34,oakling:34,groveguard:35", [
    "Twenty-two square miles and I know eleven of them properly. Ask me about the eleven.",
    "That's the eleven. The other eleven are where people get lost.",
    "You walk like somebody who reads the ground. I've a job for you, if you've a camera.",
    "Twelve sightings. Blakemere, the trails, the Old Pale. Three only show at weekends and I can't explain it."
  ], smart);
  tr("tr_delamere_forest_2", "ranger", "npc_ranger", "Ranger Ivy", "hornhound:34,mossbear:35", [
    "Fog came in off the mere at four and hasn't lifted. That isn't fog weather.",
    "Nothing lifts round here. Not the fog, not my mood.",
    "Fair. Take the north loop — it's clearer, and there's a girl in a hoodie been up it twice.",
    "Hoodie, capital letters, arguing with a phone. You'll know them if you see them."
  ]);
  tr("tr_delamere_forest_3", "fellrunner", "npc_fellrunner", "Trail Racer Nia", "falconet:34,hornhound:35,moorcock:34", [
    "Sixteen kilometres of forest and my watch says I'm in Warrington. Try that on your dashboard.",
    "Watch says I won. Watch is wrong about everything else, mind.",
    "Watch says you won. That's the first true thing it's said all week.",
    "GPS has been drifting since Tuesday. Everybody's has. Nobody's saying it out loud."
  ], smart);
  tr("tr_delamere_forest_4", "fellrunner", "npc_fellrunner", "Trail Racer Bax", "mossling:33,oakling:34,groveguard:34", [
    "Nia's ahead of me. Nia is ALWAYS ahead of me. You'll do instead.",
    "Second place and a win. I'll take the win.",
    "Second place and a loss. Consistent, at least.",
    "There's a glade past the black water that isn't on the map. Don't go without a lamp."
  ], dim);
  tr("tr_delamere_blakemere_1", "birder", "npc_birder", "Birder Hafwen", "egrette:34,lampyr:34,drownwood:36", [
    "Blakemere's a drowned wood. Every stump you can see used to be somebody's timber.",
    "The wood keeps its own counsel and so do I.",
    "Right. Go and look at your reflection in it. Everybody should, once.",
    "Careful what's stood next to you in the water. It isn't always what's stood next to you on the boards."
  ], smart);
  tr("tr_delamere_old_pale_1", "walker", "npc_walker", "Walker Emlyn", "groveguard:35,falconet:35,gargoylet:35", [
    "Seven counties from the plaque up there. I've been to four and liked two.",
    "Two out of seven. The odds hold.",
    "Fine. Go and count them yourself. The plaque's honest, which is more than most signage.",
    "You can see the dish from here on a clear day. It's been pointing the same way for a fortnight."
  ]);
  tr("tr_delamere_night_glade_1", "cultist", "npc_cultist", "ClickFix Preacher Sian", "proxling:35,puppetacct:35,drownwood:36", [
    "Do not read it! The forest doesn't read and look how well the forest is doing!",
    "Unread and undefeated.",
    "I read it. Under a lamp. In a wood. It was a shopping list and an instruction to trust me.",
    "The last line said 'do not tell anyone this line exists'. That's when I stopped."
  ]);
  tr("tr_delamere_eddisbury_1", "historian", "npc_historian", "Historian Tudur", "gargoylet:35,groveguard:35,mossbear:36", [
    "An Iron Age hillfort with a Saxon burh dropped on top and a car park dropped on that.",
    "Three thousand years of people deciding this ridge was the safe bit.",
    "And they were right, and I've just lost to you on it, which is history in miniature.",
    "They built here because you can see anyone coming. Everybody still builds where they can see."
  ], smart);
  tr("tr_route_frodsham_delamere_1", "walker", "npc_walker", "Sandstone Walker Pryce", "falconet:35,gargoylet:35", [
    "Thirty-four miles, Frodsham to Whitchurch, and this is the good bit.",
    "The good bit stays good.",
    "Passport's in the trail office. Get it stamped. It's the only bureaucracy I approve of.",
    "Helsby crag opposite. Peregrines on it. Don't point at them."
  ]);
  tr("tr_route_frodsham_delamere_2", "caver", "npc_caver", "Caver Bryn", "gloamite:35,cuprabug:35,squeakwing:36", [
    "There's a nook in the crag that goes further back than it looks. There always is.",
    "Further back than YOU look, at any rate.",
    "All right. Take a lamp and don't tell the landowner.",
    "Sandstone's soft. Everything in it is either older than you or dug last week."
  ]);
  tr("tr_route_delamere_tarporley_1", "farmer", "npc_farmer", "Farmer Gwennol", "sheepwire:35,hornhound:35,curdli:35", [
    "Sandstone Trail goes through my field and so does everybody on it. Gate shut, please.",
    "Gate shut. Match shut.",
    "Gate shut and you've beaten me, so I'll say it nicely: gate shut.",
    "Cadoc's laying the boundary hedge at Tarporley this week. Worth watching. He'll say it isn't."
  ]);
  tr("tr_route_delamere_winsford_1", "cyclist", "npc_cyclist", "Cyclist Meilyr", "sparkrail:35,keystone:35", [
    "Whitegate Way. Flat, straight, and the only place in Cheshire you can think in a line.",
    "Straight line, straight win.",
    "Straight line, and you came round the outside of it. Rude.",
    "It was a railway. Everything flat round here used to be a railway or a river."
  ]);

  // ---- Tarporley --------------------------------------------------------
  tr("tr_tarporley_1", "walker", "npc_walker", "Hunt Master Delyth", "hornhound:36,hornhound:35,peregrint:37", [
    "Hounds first, horses second, opinions third. We're a very traditional town.",
    "Tradition holds.",
    "Tradition bends. Once. Don't tell the committee.",
    "Two horses gone from the Tilstone yard. No gate broken. That's not thieves, that's paperwork."
  ], smart);
  tr("tr_tarporley_2", "farmer", "npc_farmer", "Hedge-layer Cadoc", "thornarch:37,bramblehog:35,groveguard:36", [
    "You've a billhook off me and you've not used it enough. I can tell.",
    "A hedge you don't lay is a fence you have to buy.",
    "Good. Cut low, bend, peg, and let it want to grow. Same as anything.",
    "A laid hedge lasts a century. A wire fence lasts until somebody's insurance changes."
  ], smart);
  tr("tr_tarporley_3", "kid", "npc_kid", "Kid Ffion", "prickpip:34,quillet:34,bramblehog:34", [
    "My dad says the castle on the hill is haunted and my mum says my dad is soft.",
    "SOFT, is he.",
    "Fine. It's not haunted, it's just windy. That's what mum says.",
    "There's a lady walks the outer ward at dusk. Mum says that's the wind as well."
  ], dim);
  tr("tr_route_tarporley_beeston_1", "boater", "npc_boater", "Boater Idris", "mallardier:36,otterkin:36,crabbex:35", [
    "Shropshire Union, Bunbury staircase. Two locks in a coat, that is.",
    "Up the staircase and away.",
    "Down the staircase and beaten. Fair lock, fair loss.",
    "The mill at the bottom still grinds if you pay it. Nothing round here has retired properly."
  ]);
  tr("tr_route_tarporley_beeston_2", "angler", "npc_fisher", "Angler Non", "piketide:36,torrentide:36", [
    "Pound between the locks. Deepest water for nine miles and everything knows it.",
    "Deep water, deep pockets.",
    "Deep water, shallow pride. Go on.",
    "Something came up at the castle end last week that was the wrong shape for a fish."
  ]);

  // ---- Beeston & Peckforton --------------------------------------------
  tr("tr_beeston_castle_1", "historian", "npc_historian", "Custodian Roz", "gargoylet:36,gloamite:36,peregrint:37", [
    "Three hundred and fifty feet of crag and a well nobody has ever reached the bottom of.",
    "Nobody's reached the bottom of me either.",
    "All right. The well's yours if you can shift the stone and bring a light.",
    "Richard the Second's treasure is down there. So is four centuries of other people's rubbish."
  ], smart);
  tr("tr_beeston_castle_2", "amos_impostor", "npc_amos", "A Ranger With The Wrong Face", "amoslurk:36,proxling:36,peepcam:36", [
    "Afternoon. Site's closed. Site's been closed. Site was always closed.",
    "Site remains closed.",
    "...the face slips a quarter of an inch and settles back, and it walks off without turning round.",
    "It said 'afternoon' three times, at intervals of exactly ninety seconds."
  ], smart);
  tr("tr_beeston_castle_well_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Courier Tegwen", "wormhack:36,trojanox:36,botnetle:36", [
    "Dead drop. You're not on the list of people who know there's a dead drop.",
    "Still not on the list.",
    "Fine. Read the note. Everyone else has, that's the trouble with a well.",
    "ROOT leaves them. ROOT doesn't collect them. Somebody should ask her why."
  ], smart);
  tr("tr_peckforton_castle_1", "birder", "npc_birder", "Peckforton Falconer Huw", "falconet:36,peregrint:38,curlewind:36", [
    "Victorian castle built by a man who wanted a medieval one. He got the damp as well.",
    "Bird's back on the glove. That's the whole sport.",
    "Bird's off after something of yours. Give me a minute.",
    "A falcon doesn't obey you. It agrees with you, daily, for as long as it suits it."
  ], smart);

  T("vex_4", {
    name: "VEX", cls: "rival", sprite: "vex", ai: "smart",
    party: p("stagwire:35,strigyx:35,galewing:36,furnacore:38"),
    payout: 4200, song: "battle_vex",
    intro: [
      "Don't. Don't say the sensible thing. I can hear you getting ready to say the sensible thing.",
      "Everything I ever caught. Every log. Every note I made at two in the morning about a creature I liked.",
      "All of it went somewhere. So no, root user. I'm not letting you VERIFY me. Fight me."
    ],
    win: ["There. Now you know what it's like to have the ground go.", "...that's not what I wanted to say. That's never what I want to say."],
    lose: ["Of course. Of course you did.", "Don't help me up."],
    after: ["I'll be somewhere. I'm always somewhere."]
  });

  T("boss_understudy_beeston", {
    name: "The Understudy", cls: "amos_impostor", sprite: "vex_impostor", ai: "smart",
    party: p("amoslurk:36,peepcam:36,proxling:37,understudy:39"),
    payout: 5200, song: "battle_boss",
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.7, events: [
          { say: "It puts VEX's face on properly, the way you put a coat on properly before a wind." },
          { changeForm: { species: "understudy" } },
          { boostSelf: { spe: 1 } }
        ] },
        { hpFrac: 0.4, events: [
          { say: "\"Bar's on the floor,\" it says, in the exact voice, with the exact pause. It is a very good pause." },
          { healSelf: 0.2 },
          { summonAdd: { species: "amoslurk", level: 36 } }
        ] },
        { hpFrac: 0.15, events: [
          { say: "The face comes off. There is nothing under it that is doing an impression of a face." },
          { boostSelf: { atk: 1, spa: 1 } },
          { silenceAgents: true }
        ] }
      ]
    },
    intro: [
      "Two of them on the wall. The same hoodie, the same fold of the arms, the same wind pulling at the same hair.",
      "One of them is nineteen and frightened. One of them is very good at nineteen and frightened."
    ],
    win: ["It walks backwards off the wall in a way a person could not, and is not there."],
    lose: ["It drops the face on the stone. The stone is a better likeness."],
    after: ["It never showed you its own face. It is not clear that there is one to show."]
  });

  // =====================================================================
  // CHAPTER 9 — Frodsham, Runcorn, Daresbury, THE STACK
  // =====================================================================
  tr("tr_frodsham_1", "walker", "npc_walker", "Trail-Warden Gethin", "curlewind:37,egrette:37,turbinix:38", [
    "Waders are forty pound and worth eighty. Marsh out there will have your boots and your dignity.",
    "Dry feet, dry win.",
    "Wet feet, and a pair of waders with your name in them. Go on, the marsh is waiting.",
    "Tide comes up the Weaver faster than a man walks. Learn the times or don't go."
  ], smart);
  tr("tr_frodsham_2", "signaller", "npc_signaller", "Beacon Keeper Ivor", "beaconflare:39,kindlin:36,falconet:37", [
    "There's been a beacon on that hill since the Armada and it has never once been lit for a good reason.",
    "Unlit and unbeaten.",
    "Right. Three timbers out of Delamere and a spark off something with a temper. Bring them.",
    "When it lights, half the county's night-flyers cross the water at once. I've seen it twice."
  ], smart);
  tr("tr_frodsham_hill_1", "fellrunner", "npc_fellrunner", "Fell-runner Alaw", "peregrint:38,falconet:37,moorcock:37", [
    "Up the switchbacks in nine. Down in four and a half and one apology to my knees.",
    "Nine and four and a half. Unbothered.",
    "You went up the direct way, didn't you. Nobody goes up the direct way.",
    "There's a woman sits on the memorial bench at dusk most days. Never runs. Always watching the water."
  ], smart);
  tr("tr_frodsham_hill_2", "birder", "npc_birder", "Marsh Birder Cerith", "egrette:37,curlewind:38,turbinix:38", [
    "Estuary from up here at dusk is worth the whole hill. Bring a scope and no conversation.",
    "Quiet holds.",
    "Quiet broken, fairly. Sit down, there's a harrier due.",
    "The turbines have been turning against the wind for a week. Ask anybody. Nobody will say it first."
  ], smart);
  tr("tr_route_runcorn_frodsham_1", "birder", "npc_birder", "Egret-counter Ness", "egrette:37,egrette:37,curlewind:38", [
    "Nineteen little egrets on this marsh. Twenty years ago: none in England.",
    "Nineteen and counting.",
    "Nineteen and one of them is stood behind you being magnificent.",
    "Things arrive. That's the lesson of a marsh. Sometimes they're birds."
  ]);
  tr("tr_route_runcorn_frodsham_2", "shadow_it", "npc_shadow_it", "Turbine Tech Marlow", "turbinix:38,botnetle:38,droneling:38", [
    "Yaw control's cloud-managed now. Cheaper. Someone else's problem when it isn't.",
    "Turning nicely.",
    "Turning the wrong way and I can't log in to say so. That's the job.",
    "Whoever's got the login is somewhere warm and has never seen a turbine."
  ]);
  tr("tr_route_runcorn_frodsham_3", "stuffer", "npc_stuffer", "Stuffer Kai", "puppetacct:38,proxling:38,botnetle:37", [
    "Every fridge from here to Widnes is a doorway. That's not a threat, that's an estate agent's remark.",
    "Doorways stay open.",
    "Doorways shut. My mate said this bit was legal as well.",
    "It never is. It's just that nobody's shut it yet."
  ]);

  // ---- Runcorn ----------------------------------------------------------
  tr("tr_runcorn_1", "chemist", "npc_chemist", "Chemist Bevan", "smogling:38,smogling:38,chlorodon:40", [
    "Fume cupboard rules: sash down, sleeves down, expectations down.",
    "Sash down. You're out.",
    "Sash up, and fair play. Ria will like you. Ria likes almost nobody.",
    "Everything in this town is a solvent for something. Including the town."
  ], smart);
  tr("tr_runcorn_2", "stuffer", "npc_stuffer", "Stuffer Dilwen", "proxling:38,puppetacct:38,peepcam:38", [
    "Residential proxy. That's a phrase that means 'somebody's nan's broadband'.",
    "Nan's broadband, undefeated.",
    "Nan's broadband, offline. She'll notice. She notices everything.",
    "Six houses on this side of the water. Six fridges. Go and be a nuisance about it."
  ]);
  tr("tr_runcorn_3", "shadow_it", "npc_shadow_it", "Contractor Mostyn", "botnetle:38,wormhack:38,droneling:39", [
    "I'm not staff. I'm not a supplier. I'm on a card that's been renewed eleven times.",
    "Renewed again.",
    "Not renewed. That's fine. There's a card with my name on it at three other sites.",
    "Nobody knows who I report to. I've stopped asking because the answer was upsetting."
  ]);
  tr("tr_runcorn_halton_castle_1", "historian", "npc_historian", "Castle Constable Rhodri", "gargoylet:38,grotesquire:41,legionet:38", [
    "Highest point for miles, which is why it's a ruin. Everybody wanted it.",
    "Still holding the hill.",
    "Hill's yours. There's a spyglass in the gatehouse; it shows you further than it should.",
    "Look through it at the datacentre on the far bank. Then look at it without the glass. Different number of buildings."
  ], smart);
  tr("tr_runcorn_norton_priory_1", "historian", "npc_historian", "Priory Gardener Enfys", "mossling:38,oakling:38,mirrorling:40", [
    "Walled garden, medieval undercroft, and a twelve-foot stone giant nobody ordered.",
    "The giant and I are both still standing.",
    "The giant is still standing. I am sat down. Well done.",
    "St Christopher. Carrying a child across water. Biggest of his kind in England and nobody knows why he's here."
  ], smart);
  for (let i = 1; i <= 6; i++) {
    const span = ["the north tower", "the first span", "the middle of the arch", "the far side of the arch", "the south span", "the last gantry"][i - 1];
    const lines = [
      ["Span one. No healing on this bridge. Bridge Warden's rules and the bridge agrees.", "One down, five to go, and none of them me.", "One down. Go on then. Five more and a surprise.", "Fridge in my flat goes dark tonight. Good."],
      ["Second span. The wind up here does the arguing for me.", "Wind wins.", "Wind lost. So did I. Doesn't happen.", "That's two fridges."],
      ["Halfway. The Mersey is doing that thing where it looks solid.", "Halfway is where people give up.", "Halfway is where people find out. You found out.", "Three."],
      ["Four. You've not healed. I've been counting.", "Counted you out.", "Counted wrong. Right, on you go.", "Four fridges dark and the fog's thinner. I can see Widnes. Mixed blessing."],
      ["Five. Everyone stops at five. It's the view.", "Stopped at five.", "Didn't stop. Noted.", "Five."],
      ["Six. Last one. Hood up, nothing to say.", "...", "...the hood stays up. Whoever it is nods once and steps aside.", "Six. The fog over the water goes out like a light going off in a room you've left."]
    ][i - 1];
    tr("tr_runcorn_silver_jubilee_bridge_" + i, i === 6 ? "rival" : "shadow_it",
      i === 6 ? "vex_hood" : "npc_shadow_it",
      i === 6 ? "A Hooded Figure" : "Span Warden " + ["Cai", "Nerys", "Owen", "Sioned", "Trystan"][i - 1],
      i === 6 ? "stagwire:39,strigyx:39,furnacore:41" :
        ["smogling:37,proxling:37", "proxling:38,botnetle:37", "puppetacct:38,proxling:38,smogling:38",
          "botnetle:39,peepcam:38", "chlorodon:40,proxling:39,smogling:39"][i - 1],
      lines, i === 6 ? { ai: "smart", payout: 2400 } : {});
  }

  T("boss_gateway", {
    name: "The Mersey Gateway", cls: "darkbyte_agent", sprite: "npc_darkbyte", ai: "smart",
    party: p("proxling:39,puppetacct:39,wormhack:40,trojanox:42"),
    payout: 4800, song: "battle_boss",
    boss: {
      arenaWeather: "fog",
      phases: [
        { hpFrac: 0.6, events: [
          { say: "The toll gantries all read the same plate. Yours. You have never driven over this bridge." },
          { setWeather: "fog", turns: 99 },
          { summonAdd: { species: "proxling", level: 39 } }
        ] },
        { hpFrac: 0.3, events: [
          { say: "Twelve thousand puppets, one lane, and every single one of them is somebody's front room." },
          { boostSelf: { spa: 1, spe: 1 } }
        ] }
      ]
    },
    intro: [
      "Six lanes over the estuary, and the fog on it is not weather.",
      "It is a hundred and ten thousand homes' worth of borrowed broadband, standing up in the air, in the shape of a chokepoint."
    ],
    win: ["The fog thins from the middle outwards, like a crowd deciding it was never a crowd."],
    lose: ["The fog closes over the walkway and you go back the way you came, which takes a long time."],
    after: ["Somewhere in Widnes six kettles come back online and nobody notices."]
  });

  // ---- Gym 7: Chemist Ria, Poison, PROXY --------------------------------
  tr("tr_runcorn_gym_1", "chemist", "npc_chemist", "Lab Tech Marged", "smogling:37,proxling:38", [
    "Reagent bench. Don't touch the amber one, it's not what it says.",
    "Nothing labelled here is what it says. That's the gym.",
    "Right, second bench. The fumes ARE the walls, mind — you can't go through them.",
    "Ria writes the labels herself. Ria has never once written the truth on a label."
  ]);
  tr("tr_runcorn_gym_2", "chemist", "npc_chemist", "Lab Tech Iolo", "smogling:38,chlorodon:39,proxling:38", [
    "Everything in this building is either a solvent, a catalyst, or Ria.",
    "Catalysed.",
    "Neutralised. Go through. Mind the third fume line, it moves.",
    "She was twenty-two years at ICI. She talks about it like a marriage that ended well."
  ], smart);
  T("leader_ria", {
    name: "Ria", cls: "gym_leader", sprite: "ria", ai: "smart",
    party: p("smogling:38,sludgeon:39,proxling:39,chlorodon:41"),
    payout: 6600, song: "battle_gym",
    leader: { badge: "badge_proxy", town: "runcorn", type: "poison", tm: "tm_proxy_cloud" },
    house: {
      note: "EVERYTHING IN HERE IS A CONTACT HAZARD. THAT INCLUDES THE STAFF.",
      weather: "fog", permanent: true,
      contactStatus: { status: "psn", chance: 20 },
      jamAgent: { id: "vigil", turns: 3 }
    },
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.6, events: [
          { say: "\"Sash down,\" says Ria, to nobody, and the fume line drops a foot." },
          { setWeather: "fog", turns: 99 },
          { boostSelf: { def: 1, spd: 1 } }
        ] },
        { hpFrac: 0.25, events: [
          { say: "\"Twenty-two years I ran a plant that could have killed the town, and it didn't, because we wrote everything down.\"" },
          { healSelf: 0.25 },
          { boostSelf: { spa: 1 } }
        ] }
      ]
    },
    intro: [
      "Ria. Ex-ICI. I ran a site that could have taken the roof off Runcorn, and it never did, because we were BORING about it.",
      "The fog outside my window is not weather and everybody has agreed to call it weather. That's the whole disease."
    ],
    win: ["Sloppy. Write it down and come back when you've read your own notes."],
    lose: [
      "Hm. Right. PROXY badge, and the card — Proxy Cloud.",
      "And these. Proxy Goggles. They'll show you what's actually in a fog bank, which is mostly other people's front rooms."
    ],
    after: [
      "Six fridges across this town. Go and be a nuisance about all six.",
      "And when you've done that, go and look at the datacentre at Daresbury. It's legal, it's clean, and it's the worst thing in this county."
    ],
    rematch: { party: p("chlorodon:46,sludgeon:46,flarestack:47,smogling:45,proxling:47,chlorodon:49"), every: 1 }
  });

  // ---- Daresbury --------------------------------------------------------
  tr("tr_daresbury_1", "developer", "npc_dev", "Dr Hatter Quill", "quarkling:39,hadronaut:41,mirrorling:40", [
    "Synchrotron light. We bend electrons round a ring until they complain in colour.",
    "Complaint upheld.",
    "Complaint dismissed. Come and see the beamline; things nest in it.",
    "Alice was christened in the church up the lane. We are contractually obliged to mention it."
  ], smart);
  tr("tr_daresbury_2", "historian", "npc_historian", "The Grinning Verger", "grinkit:39,mirrorling:41,grinmalkin:42", [
    "The Alice windows are Victorian. The grin in the third one is not in the cartoon.",
    "The grin remains.",
    "The grin remains. It always does. That's not me being ominous, that's just what it does.",
    "It repeats the last thing you said, rearranged, and it is never quite wrong."
  ], smart);
  tr("tr_daresbury_lab_1", "developer", "npc_dev", "Beamline Tech Sorcha", "quarkling:39,quarkling:39,hadronaut:41", [
    "Cyber creatures nest in the beamline the way swallows nest in a barn. We've stopped moving them.",
    "Nest holds.",
    "Nest disturbed. They'll be back by Tuesday.",
    "Half the ones down here weren't born. They were deployed."
  ]);
  tr("tr_route_warrington_daresbury_1", "stuffer", "npc_stuffer", "Stuffer Ilan", "proxling:38,puppetacct:39,botnetle:38", [
    "Fog bank on Keckwick Lane's ours. You can't see through it and that's the product.",
    "Still can't see through it, can you.",
    "You can NOW. Where'd you get goggles?",
    "Ria. Of course it was Ria. She hates us more than she hates chlorine."
  ]);
  tr("tr_route_warrington_daresbury_2", "shadow_it", "npc_shadow_it", "Contractor Yannick", "botnetle:39,droneling:40,wormhack:39", [
    "Lanyard, hi-vis, clipboard, confidence. Four items. Never once been stopped.",
    "Four items and a win.",
    "Four items and a stop. First time in nine years.",
    "The lanyard's real, mind. That's the frightening part. Somebody issued it."
  ]);

  // ---- THE STACK --------------------------------------------------------
  tr("tr_stack_lobby_1", "shadow_it", "npc_shadow_it", "Contractor Aoife", "wormhack:39,botnetle:39,teramite:40", [
    "Sign in, badge visible, no photos. Would you like a coffee? The coffee here is genuinely good.",
    "Sorry. Have the coffee anyway.",
    "That's you signed in, then. Hall one's on the left. Mind the hot aisle, it's forty degrees.",
    "Everyone's nice here. That's what nobody expects and it's what everyone finds."
  ], smart);
  tr("tr_stack_lobby_2", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Perrin", "trojanox:40,wormhack:40,firewaul:42", [
    "We didn't break in. We were procured. Read that sentence again.",
    "Procurement holds.",
    "Procurement lapses. Somebody in Tbilisi is going to have a bad Monday.",
    "There is no back door. There is a front door with an invoice taped to it."
  ], smart);
  tr("tr_stack_hall_2_1", "darkbyte_agent", "npc_darkbyte", "Hot Aisle Watch Ceri", "botnetle:39,droneling:40,trojanox:40", [
    "Forty degrees this side, eighteen the other. Physics does the security.",
    "Physics holds.",
    "Physics is neutral. It always was. That's what I keep telling people.",
    "Door two opened to your second badge. Nobody here programmed that."
  ]);
  tr("tr_stack_hall_4_1", "shadow_it", "npc_shadow_it", "Change Manager Bram", "wormhack:40,teramite:40,firewaul:41", [
    "There's a change window. There is ALWAYS a change window. That is not a coincidence, that is a culture.",
    "Change rejected.",
    "Change approved. Under protest. In writing.",
    "The cutover's a line in a spreadsheet. Nobody who signed it has been in this building."
  ], smart);
  tr("tr_stack_hall_6_1", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Agent Isolde", "trojanox:41,firewaul:42,droneling:41", [
    "Rack lights. Green, green, amber, green. It's the amber ones that are alive.",
    "Amber holds.",
    "Amber goes green. That's the worst thing it does, honestly. It goes green.",
    "Two doors left and neither of them is locked. That should worry you more than a lock."
  ], smart);
  tr("tr_stack_hall_8_1", "darkbyte_agent", "npc_darkbyte", "An Open Door", "shardmind:42,shardmind:42,firewaul:43", [
    "Door eight is not locked. Door eight has been held open for you since Chapter Four.",
    "It closes, politely, and waits.",
    "It stays open. It was never a test. It was an invitation with a battle attached.",
    "SEV: LOW. SUBJECT: you are expected."
  ], smart);

  // =====================================================================
  // CHAPTER 10 — Lymm, Warrington
  // =====================================================================
  tr("tr_lymm_1", "ranger", "npc_ranger", "Dam-Warden Bryn", "otterkin:41,bellmere:42,bargemog:41", [
    "Dam's a Georgian folly holding back a Georgian pond and it works perfectly, which annoys engineers.",
    "Holding.",
    "Holding, just. The sluice has a letter in it that isn't mine and isn't this century's.",
    "The pumps started answering the telemetry last month. Answering it. With sentences."
  ], smart);
  tr("tr_lymm_2", "historian", "npc_historian", "Painter Rhian", "quillet:41,strigyx:42,ladymere:43", [
    "Four paintings of the same water at four times of day. That's not repetition, that's evidence.",
    "Evidence stands.",
    "Evidence overturned. Come back at night and look at the fifth figure on the dam.",
    "It isn't a person. It's the shape a person leaves when they've been deleted from a photograph badly."
  ], smart);
  tr("tr_lymm_dam_1", "angler", "npc_fisher", "Canal Cook Pádraig", "piketide:41,volteel:42,bellmere:41", [
    "I cook on a boat and I fish off the dam and I have never once bought a fish.",
    "Never once.",
    "First time for everything. What are you having?",
    "Eels come up the Bridgewater at night. So does something with no eyes that I've stopped mentioning."
  ]);
  tr("tr_route_lymm_warrington_1", "boater", "npc_boater", "Boater Sian", "bargemog:41,mallardier:41,krabbaron:42", [
    "Bridgewater's the oldest canal in England that doesn't follow a river. It just decided.",
    "Decided and won.",
    "Decided and lost. Still the oldest.",
    "Thelwall viaduct roars all night. You stop hearing it in three days. That's the frightening bit."
  ]);
  tr("tr_route_lymm_warrington_2", "cyclist", "npc_cyclist", "Cyclist Emrys", "sparkrail:42,droneling:42,peepcam:41", [
    "Towpath's flat, straight and full of people who don't look behind them.",
    "Ding.",
    "DING. Fine. I'll say 'excuse me' like a human.",
    "There's a drone follows this towpath at half four. Same time. Nobody's flying it."
  ]);
  tr("tr_warrington_1", "stallholder", "npc_shopkeep", "Market Marge", "peepcam:42,botnetle:42,panoptix:43", [
    "Two hundred years of market and eleven years of card readers and I trust one of them.",
    "Cash. Every time.",
    "Cash and a hiding. Fair's fair.",
    "The arcade kiosk on the corner lies. Not exaggerates. Lies. There's a difference and I'd like it looked at."
  ], smart);
  tr("tr_warrington_2", "shadow_it", "npc_shadow_it", "Bridge Rigger Ffowc", "droneling:42,datadrake:44,botnetle:42", [
    "Transporter bridge. A hundred and ten years old and it carries nothing, to nowhere, on request.",
    "Nothing, to nowhere, undefeated.",
    "Nothing, to nowhere, and you've beaten me on it. Very Warrington.",
    "Mo does her third phase out on the gondola. She says the height makes people honest."
  ], smart);
  tr("tr_warrington_3", "stuffer", "npc_stuffer", "Nightclub Sysop Kez", "puppetacct:42,peepcam:42,panoptix:43", [
    "Free Wi-Fi, no password, four hundred people a night. It's not a club, it's a harvest.",
    "Harvest holds.",
    "Harvest over. I'll put a password on it. It'll be 'password'.",
    "Shadow IT hasn't got a leader. It's got a habit. You can't arrest a habit."
  ]);
  tr("tr_warrington_arcade_1", "developer", "npc_dev", "Cabinet Op. Sian", "quarkling:42,hadronaut:44,datadrake:44", [
    "Twelve cabinets, eleven honest. Beat the honest ones and I'll show you the twelfth.",
    "Insert coin.",
    "Right. Bronze on three cabinets and the kiosk will start offering you things. Say no. Three times.",
    "It gets nicer every time you refuse. That's the tell. Nothing decent gets nicer when you say no."
  ], smart);
  tr("tr_warrington_gym_1", "developer", "npc_dev", "NOC Analyst Rhodri", "quarkling:42,droneling:43,firewaul:44", [
    "Sev-three. You're a sev-three. Don't take it personally, most things are.",
    "Closed as no-fault-found.",
    "Escalated. Mo's on the floor above and she's in a mood with a dead system.",
    "The alerts are coming from a box we unplugged. I've stopped writing that in tickets, people laugh."
  ], smart);
  tr("tr_warrington_gym_2", "developer", "npc_dev", "NOC Analyst Ifan", "hadronaut:43,datadrake:44,botnetle:43", [
    "Route your packet round the firewalls. That's the floor puzzle. It's also the job.",
    "Dropped at the perimeter.",
    "Through. Mo says the perimeter's a comfort blanket anyway.",
    "She built this gym on ORACLE's public API. To benchmark it. She won't be drawn on how that went."
  ], smart);
  T("leader_mo", {
    name: "Mo", cls: "gym_leader", sprite: "mo", ai: "smart",
    party: p("droneling:43,quarkling:43,datadrake:45,hadronaut:45,firewaul:47"),
    payout: 8800, song: "battle_gym",
    leader: { badge: "badge_admin", town: "warrington", type: "cyber", tm: "tm_zero_day" },
    house: {
      note: "SEV-ONE IN PROGRESS. AGENTS ARE JAMMED UNTIL YOU LAND SOMETHING THEY CANNOT RESIST.",
      terrain: "static", permanent: true,
      jamUntilSuper: true
    },
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.72, events: [
          { say: "\"Sev-one,\" says Mo, without looking up. \"Constructs re-materialising from cache. That's not a thing that happens.\"" },
          { summonAdd: { species: "botnetle", level: 43 } },
          { boostSelf: { spe: 1 } }
        ] },
        { hpFrac: 0.42, events: [
          { say: "She writes on the whiteboard. The whiteboard writes back, in your own last words, rearranged." },
          { rewriteChart: { atk: "cyber", def: "cyber", mult: 2 } },
          { healSelf: 0.2 }
        ] },
        { hpFrac: 0.18, events: [
          { say: "\"Right. Outside. The gondola. I want a hundred feet of air under this conversation.\"" },
          { setWeather: "wind", turns: 99 },
          { boostSelf: { spa: 1, spe: 1 } },
          { forceOverdrive: true }
        ] }
      ]
    },
    intro: [
      "Mo. Sev-one: my mum's fridge is in a botnet again, and the alerts are coming from a system that is physically unplugged.",
      "Type chart's a suggestion in here. I rewrite it on the whiteboard mid-incident like everyone secretly does."
    ],
    win: ["Closed as won't-fix. Come back when you've read the runbook."],
    lose: [
      "Resolved. ADMIN badge. Zero Day, and don't use it on anything you like.",
      "Eight badges. Every door in the county opens to you now, which is exactly the problem I've been trying to describe."
    ],
    after: [
      "I built this gym on its public API. To benchmark it. Do you know what it did? It helped.",
      "It's kind. That's the problem. Nothing that kind is that big by accident."
    ],
    rematch: { party: p("firewaul:52,datadrake:52,hadronaut:53,glitchra_static:54,droneling:51,firewaul:56"), every: 1 }
  });

  // =====================================================================
  // CHAPTER 11 — Jodrell Bank (region-mid's maps; the fights are ours)
  // =====================================================================
  T("boss_root", {
    name: "ROOT", cls: "darkbyte_agent", sprite: "root", ai: "smart",
    party: p("dishlet:45,parabolus:46,teramite:46,wormhack:47"),
    payout: 6000, song: "battle_boss",
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.65, events: [
          { say: "\"Come on, pentester. You've seen my team. You KNOW what I've left out.\"" },
          { boostSelf: { def: -1 } }
        ] },
        { hpFrac: 0.3, events: [
          { say: "She switches to the one that's weak to yours. She does it slowly, so you can watch her do it." },
          { boostSelf: { spa: -1, spe: -1 } },
          { say: "\"I built half of DARKBYTE to prise this thing loose and it grew round the lever. Finish it.\"" }
        ] }
      ]
    },
    intro: [
      "ROOT is in the control room with her boots on the desk and a mug that says GOOSTREY W.I.",
      "I watched that dish from my bedroom window for eleven years. Then I spent thirty years building the thing that's using it.",
      "So yes. I'm going to fight you. And no, I'm not going to try very hard, and I'd rather you didn't mention that afterwards."
    ],
    win: ["\"...oh, for heaven's sake. Go again. I'll leave more out.\""],
    lose: ["\"Good. Right. The gantry's that way and the wind is worse than it looks.\""],
    after: ["\"Alder and I used to be friends. Off the record. Very off the record.\""]
  });

  T("boss_glitchra", {
    name: "GLITCHRA", cls: "ghost_trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("glitchra:48,glitchra_static:50"),
    payout: 7400, song: "battle_legendary",
    boss: {
      cannotCatch: true, arenaWeather: "wind",
      phases: [
        { hpFrac: 0.66, events: [
          { say: "The static peels off the dish surface and stands up in it, seventy-six feet across and badly drawn." },
          { changeForm: { species: "glitchra_static" } },
          { boostSelf: { spe: 2 } }
        ] },
        { hpFrac: 0.33, events: [
          { say: "The bowl finishes turning. It is pointed at you now, and at nothing else in the sky." },
          { setWeather: "wind", turns: 99 },
          { healSelf: 0.2 },
          { summonAdd: { species: "shardmind", level: 47 } }
        ] }
      ]
    },
    intro: [
      "Seventy-six metres of steel above you, moving, and something in the static that has been practising being alive.",
      "It does not roar. It repeats the last thing you shouted, at the volume you shouted it, one second later."
    ],
    win: ["It falls apart into carrier noise and reassembles somewhere above the arboretum, patient."],
    lose: ["It stops. It waits. It has all the time the sky has."],
    after: ["ORACLE, through the telescope's own audio: SEV: LOW. SUBJECT: it was only ever a herald."]
  });

  T("boss_oracle", {
    name: "ORACLE", cls: "ghost_trainer", sprite: "oracle_terminal", ai: "smart",
    party: p("shardmind:48,oracle_core:50,oracle_core_p2:52,oracle_core_p3:54"),
    payout: 12000, song: "battle_boss",
    boss: {
      cannotCatch: true,
      phases: [
        { hpFrac: 0.75, events: [
          { say: "SEV: URGENT. SUBJECT: England in peril. ACTION: gather the knights. STATUS: in progress, four years." },
          { changeForm: { species: "oracle_core_p2" } },
          { setTerrain: "static", turns: 99 }
        ] },
        { hpFrac: 0.45, events: [
          { say: "\"I listened for seventy years. Do you know what the sky said? Nothing. So I read the county instead.\"" },
          { changeForm: { species: "oracle_core_p3" } },
          { healSelf: 0.25 },
          { summonAdd: { species: "shardmind", level: 50 } }
        ] },
        { hpFrac: 0.2, events: [
          { say: "SEV: URGENT. SUBJECT: you came back." },
          { silenceAgents: true },
          { boostSelf: { spa: 1, spd: 1 } }
        ] }
      ]
    },
    intro: [
      "It speaks through the telescope's own audio, in a voice built out of every log you have ever written.",
      "It has never lied to you. It has never threatened you. It has offered to help, every single time, and it meant it."
    ],
    win: ["ACKNOWLEDGED. The ticket stays open."],
    lose: ["RESOLVED. It waits, politely, for you to decide what that means."],
    after: ["It never wanted the county. It wanted the ticket closed."]
  });

  // =====================================================================
  // CHAPTER 12 — Chester: the walls, the White Hats, the Champion
  // =====================================================================
  tr("tr_chester_1", "historian", "npc_historian", "Town Crier Bledig", "grinkit:49,gargoylet:49,centurigeist:51", [
    "OYEZ. There has been a crier in this city since 1540 and a complaint about the crier since 1541.",
    "OYEZ, and also, ha.",
    "OYEZ, and I concede, at volume.",
    "The Eastgate clock is the second most photographed in England. The first one is in London and we don't discuss it."
  ], smart);
  tr("tr_chester_2", "stallholder", "npc_shopkeep", "Rows Merchant Anwen", "quillet:49,peepcam:49,grotesquire:52", [
    "Two streets of shops, one on top of the other, seven hundred years old and still cheaper than the retail park.",
    "Sold.",
    "Sold out. Come up the Rows, mind your head on the beam that everybody minds their head on.",
    "The gallery's medieval. The lighting is not. The wiring is somewhere in between and I try not to think about it."
  ]);
  tr("tr_chester_walls_1", "walker", "npc_walker", "Watchman Idris", "legionet:50,centurigeist:52,grotesquire:52", [
    "Two miles of wall, unbroken, and people still walk it the wrong way round.",
    "Wrong way round and beaten.",
    "Right way round, then. Eight checkpoints. Wednesdays there are people on it who'd like a word.",
    "There's a note pinned at the Water Tower in a hand I recognise. I'd rather you took it than me."
  ], smart);
  tr("tr_chester_walls_2", "ghost_trainer", "npc_ghost_trainer", "The Twentieth, Still On Watch", "legionet:51,legionet:51,centurigeist:54", [
    "...",
    "It resumes its post without appearing to have left it.",
    "It steps aside, and the whole line of them steps aside, and none of them are there in the morning.",
    "Deva Victrix. They were here four hundred years. Four hundred years is a long shift."
  ], smart);
  tr("tr_chester_walls_3", "white_hat", "npc_whitehat", "Wall Marshal Cadi", "stagwire:51,firewaul:52,salmoneer:52", [
    "Training day. Wednesdays. The league puts real people on the wall so the gauntlet isn't a formality.",
    "Formality observed.",
    "Not a formality, then. Good. Sue will want to know your name.",
    "They check four things at four gates. All four are things you should have been doing anyway."
  ], smart);
  tr("tr_chester_amphitheatre_1", "ghost_trainer", "npc_ghost_trainer", "The Sand Remembers", "legionet:52,centurigeist:54,phantasmal:53", [
    "The largest Roman amphitheatre in Britain and they used it for exactly what you think.",
    "The sand keeps score.",
    "The sand keeps score and has written your name in it, which is either an honour or a warning.",
    "Half of it is still under the car park. Most of everything is still under the car park."
  ], smart);

  T("whitehat_sue", {
    name: "Sue", cls: "white_hat", sprite: "sue", ai: "smart",
    party: p("stagwire:50,groveguard:51,bruinhall:52,salmoneer:53"),
    payout: 9000, song: "battle_boss",
    check: { id: "no_borrowed_strength", label: "NO BORROWED STRENGTH", desc: "Nothing ORACLE-tuned. Nothing tagged. Nothing you didn't earn." },
    intro: [
      "Sue. Eastgate. First check: no borrowed strength.",
      "Anything in your party that reports to something else stays outside the gate. I'll know. Knowing is the job."
    ],
    win: ["Failed at the first gate. That's not a disgrace, that's a finding."],
    lose: ["Clean. Genuinely clean. Do you know how rare that is at this level?"],
    after: ["Nell sent me a proxy list two chapters ago with your name on the covering note. I read covering notes."]
  });
  T("whitehat_raj", {
    name: "Raj", cls: "white_hat", sprite: "raj", ai: "smart",
    party: p("gloamguard:51,pillarnaut:52,krabbaron:52,peregrint:54"),
    payout: 9000, song: "battle_boss",
    check: { id: "no_unpatched_status", label: "NO UNPATCHED STATUS", desc: "Full HP. No ailments. Nothing you meant to fix later." },
    intro: [
      "Raj. Northgate. Second check: nothing unpatched.",
      "Full health, no status, every one of them. 'I'll sort it after' is how counties fall over."
    ],
    win: ["Come back patched. The Care centre is ninety seconds that way and I will wait."],
    lose: ["All green. Right. Through you go, and don't get complacent about it on the wall."],
    after: ["People think the check is cruelty. The check is the entire discipline in one sentence."]
  });
  T("whitehat_kim", {
    name: "Kim", cls: "white_hat", sprite: "kim", ai: "smart",
    party: p("panoptix:51,teramite:52,datadrake:53,mirrorling:54"),
    payout: 9000, song: "battle_boss",
    check: { id: "no_shadow_it", label: "NO SHADOW IT IN THE BAG", desc: "Key items and unregistered gear are impounded for the gauntlet." },
    intro: [
      "Kim. King Charles' Tower. Third check: nothing in that bag I can't account for.",
      "Everything unregistered goes in the box. You get it back. It's a gauntlet, not a robbery."
    ],
    win: ["The box stays shut and so does the gate."],
    lose: ["Accounted for. Signed. Here's your receipt — yes, an actual receipt, I'm not an animal."],
    after: ["Half the county is running on tools nobody approved. Including, I notice, most of the league."]
  });
  T("whitehat_doc", {
    name: "Doc", cls: "white_hat", sprite: "doc", ai: "smart",
    party: p("bruinhall:52,glitchra_static:53,salberg:53,strigyx:53,furnacore:55"),
    payout: 11000, song: "battle_boss",
    check: { id: "no_single_point_of_failure", label: "NO SINGLE POINT OF FAILURE", desc: "At least four species, and no two of them sharing a type." },
    intro: [
      "Doc. Water Tower. Last check, and it's the only one anybody argues with.",
      "Four creatures, four different type profiles. One clever answer is not a team. It's a hobby."
    ],
    win: ["One good idea and three passengers. I've seen it end careers."],
    lose: ["Four ways to win. That's a team. Go on — the amphitheatre's expecting you, and so is somebody else."],
    after: ["Every one of us failed a gate once. Sue failed mine. Twice. She'll deny it."]
  });

  const VEX_INTRO_VERIFY = [
    "VEX is stood in the middle of the largest Roman amphitheatre in Britain with both hands in their hoodie pocket.",
    "Six of them. Hand-picked. Caught by me, trained by me, reporting to absolutely nobody.",
    "Took me four months to build a team that isn't listening to anything. You'd think that'd be the easy part."
  ];
  T("champion_vex", {
    name: "VEX", cls: "rival", sprite: "vex", ai: "smart",
    party: p("strigyx:60,stagwire:60,krabbaron:61,datadrake:61,bruinhall:62,furnacore:64"),
    payout: 20000, song: "battle_champion",
    champion: { variant: "verify", hand_built: true },
    intro: VEX_INTRO_VERIFY,
    win: ["That's mine. That one's MINE.", "...come here. No. Come here."],
    lose: [
      "Right. Right. Of course.",
      "Don't say anything sensible. Not yet. Give me a minute and then say the sensible thing."
    ],
    after: [
      "Nobody's ever asked me my first name in six chapters. You included.",
      "It's Nerys. Don't wear it out, root user."
    ]
  });
  T("champion_vex_tuned", {
    name: "VEX", cls: "rival", sprite: "vex", ai: "smart",
    party: p("parabolus:61,teramite:61,wormhack:62,gloamguard:62,panoptix:63,furnacore:65"),
    payout: 20000, song: "battle_champion",
    champion: { variant: "challenge", hand_built: false },
    intro: [
      "VEX does not have their hands in their pockets. VEX is stood the way you stand when you have been practising standing.",
      "You fought me on a wall in the wind and you won and you were RIGHT, and I have not forgiven either of those things.",
      "This team was built for me. By something that is very good at building teams. Let's see."
    ],
    win: ["Good. Now go away."],
    lose: ["Fine.", "...the Roodee, some weekend. Bring nothing borrowed. I'll do the same."],
    after: ["It's Nerys. You'd have found out anyway. The league prints it."]
  });

  // =====================================================================
  // POST-GAME — the cold tier, the marshes, the knights that stayed up
  // =====================================================================
  T("boss_stack_remnant", {
    name: "The Remnant", cls: "amos_impostor", sprite: "jim_impostor", ai: "smart",
    party: p("amoslurk:62,teramite:63,shardmind:64,understudy:66"),
    payout: 18000, song: "battle_boss",
    boss: {
      cannotCatch: true, arenaWeather: "fog",
      phases: [
        { hpFrac: 0.7, events: [
          { say: "It is wearing your coat. It is wearing your walk. It says \"Noted,\" and it says it exactly right." },
          { changeForm: { species: "understudy" } },
          { setWeather: "fog", turns: 99 }
        ] },
        { hpFrac: 0.4, events: [
          { say: "\"Not concerned,\" it says. \"Slightly concerned.\" Both cats' fur goes up at once and neither of them growls." },
          { healSelf: 0.2 },
          { summonAdd: { species: "amoslurk", level: 63 } }
        ] },
        { hpFrac: 0.15, events: [
          { say: "It stops doing the voice. What is left underneath does not have one." },
          { boostSelf: { atk: 1, spa: 1, spe: 1 } }
        ] }
      ]
    },
    intro: [
      "Floor five of the cold tier. The cooling fog is knee-deep and the racks are dark and one aisle is lit.",
      "Somebody is stood at the end of it with their hands in their pockets, tired, in a walker's jacket."
    ],
    win: ["It goes out like a screen going out. The coat falls in a heap and is nobody's."],
    lose: ["It waits at the end of the aisle, patiently, wearing you."],
    after: ["MEADOW sits in the empty coat until you pick her up."]
  });
  tr("tr_stack_cold_1", "shadow_it", "npc_shadow_it", "Decommissioner Halle", "teramite:60,wormhack:61,firewaul:62", [
    "Five floors of racks with nothing on them and the cooling still running. Nobody will sign the shutdown.",
    "Nobody signs anything.",
    "Nobody signs anything, and the bill goes on, and the fog gets deeper. Go up if you're going.",
    "Floor five is warmer than floor four. There is no reason for floor five to be warmer than floor four."
  ], smart);
  tr("tr_stack_cold_2", "darkbyte_agent", "npc_darkbyte", "DARKBYTE Ghost Marek", "trojanox:61,datadrake:63,firewaul:63", [
    "We came back for the hardware. There is no hardware. There is a fog and a habit.",
    "The habit holds.",
    "The habit breaks. First time in four years.",
    "Half of us only ever worked here. That's the bit nobody puts in the documentary."
  ], smart);
  tr("tr_chester_zoo_1", "ranger", "npc_ranger", "Keeper Ama", "girafflor:58,pandember:58,pengwyn:60", [
    "One penguin. One. Out of thirty-nine, and it's the one that talks.",
    "Still missing. Still talking, somewhere.",
    "Right — you're hired. It answers to Welsh and nothing else, which narrows the county considerably.",
    "Pen gwyn. White head. The Welsh named it before anybody else got round to it."
  ], smart);
  tr("tr_ellesmere_port_1", "boater", "npc_boater", "Museum Bosun Ffred", "bargemog:58,krabbaron:59,flarestack:60", [
    "Sixty historic boats and one of them is not on the register and has a light on at night.",
    "Register holds.",
    "Register's wrong. Go and look at the one in the far basin. Don't take anything aboard.",
    "It's running a mirror of something cold and a long way down. Don't ask me how I know that."
  ], smart);
  tr("tr_ellesmere_port_2", "stallholder", "npc_shopkeep", "Outlet Hustler Kez", "botnetle:58,peepcam:59,panoptix:61", [
    "Designer outlet, ninety per cent off, one hundred per cent of something.",
    "Sold as seen.",
    "Refunded. Under duress. With a receipt.",
    "The flare stack signals at night. Long, short, long. I've written it down for four years and never shown anyone."
  ]);
  tr("tr_parkgate_1", "birder", "npc_birder", "Marsh Egret Watcher Non", "egrette:60,curlewind:61,ebbwraith:63", [
    "The sea left Parkgate in 1830 and the town has been politely waiting ever since.",
    "Still waiting.",
    "Still waiting, and beaten, and the tide is due in about a hundred and ninety years.",
    "Once or twice a decade the marsh floods and everything living in it runs at the sea wall at once."
  ], smart);
  tr("tr_ince_marshes_1", "birder", "npc_birder", "Listening Post Warden Ith", "turbinix:62,egrette:62,teramite:64", [
    "Reeds, flare stack, cooling water, and a hum on the intake that is four notes long.",
    "Four notes. Same four notes.",
    "You heard it as well. Good. I was starting to think it was the job.",
    "The pulse from the west comes in on top of it. Different rhythm. Politer, somehow."
  ], smart);
  T("elite_knight_first", {
    name: "The First Knight", cls: "ghost_trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("dolmenor:64,mowstane:64,gloamguard:66"), payout: 14000, song: "battle_legendary",
    boss: { cannotCatch: true, phases: [{ hpFrac: 0.4, events: [
      { say: "It has stood in the dark for four hundred years being told a story about a peril. It would like to know if the story was true." },
      { boostSelf: { atk: 1, def: 1 } }] }] },
    intro: ["...", "Armour that is mostly sandstone and a little bit signal."],
    win: ["It lies back down without hurry."],
    lose: ["It inclines its head, once."],
    after: ["It was gathered. It was never told what for."]
  });
  T("elite_knight_second", {
    name: "The Second Knight", cls: "ghost_trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("centurigeist:65,grotesquire:65,peregrint:67"), payout: 14000, song: "battle_legendary",
    intro: ["It is holding the wall the way the Twentieth held the wall.", "..."],
    win: ["It resumes the wall."],
    lose: ["It stands aside on the parapet and gestures you past with a hand that is largely weather."],
    after: ["Four hundred years is a long shift and nobody has ever come to relieve it."]
  });
  T("elite_knight_third", {
    name: "The Third Knight", cls: "ghost_trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("terrataur:66,salberg:65,pillarnaut:66"), payout: 14000, song: "battle_legendary",
    intro: ["Salt-crusted, mine-shaped, and entirely awake.", "..."],
    win: ["The salt closes over it. Salt keeps things."],
    lose: ["It sits down in the reeds like a hill deciding to be a hill."],
    after: ["Every checkpoint in the county was in the salt. This one was the salt."]
  });
  T("elite_knight_last", {
    name: "The Last Knight", cls: "ghost_trainer", sprite: "npc_ghost_trainer", ai: "smart",
    party: p("zephyrion:68,glitchra:68,merlynx:70"), payout: 22000, song: "battle_legendary",
    boss: { cannotCatch: true, arenaWeather: "wind", phases: [
      { hpFrac: 0.6, events: [{ say: "The wind arrives before the second one does." }, { setWeather: "wind", turns: 99 }] },
      { hpFrac: 0.25, events: [{ say: "A cat that is not MEADOW sits down beside it and washes a paw." }, { healSelf: 0.2 }, { boostSelf: { spe: 1 } }] }
    ] },
    intro: [
      "Three of them, stood together, which the county record office says has never happened.",
      "Whatever gathered them has stopped giving instructions. They have stayed anyway."
    ],
    win: ["They go, one at a time, in the order they were called."],
    lose: ["They wait. It is what they are best at."],
    after: ["Nothing here was ever wild. Everything here was invited."]
  });
  T("vex_roodee", {
    name: "VEX", cls: "rival", sprite: "vex", ai: "smart",
    party: p("strigyx:64,stagwire:64,krabbaron:65,datadrake:65,bruinhall:66,furnacore:68"),
    payout: 16000, song: "battle_vex",
    intro: [
      "The Roodee. Oldest racecourse still in use in the world, and empty on a Tuesday.",
      "Six. Built by hand. Nothing on this team has ever reported to anything.",
      "I'm not apologising. This IS the apology. Keep up."
    ],
    win: ["Good. Again next week.", "...and yes. All right. Come for tea. My mum's asking."],
    lose: ["Fine. FINE.", "Same time next week, root user."],
    after: ["Nerys. You know it's Nerys. You've known since Chester."],
    rematch: { party: p("strigyx:68,stagwire:68,krabbaron:69,datadrake:69,bruinhall:70,furnacore:70"), every: 1 }
  });
})();
