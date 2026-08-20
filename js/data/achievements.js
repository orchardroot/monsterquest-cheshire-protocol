// =============================================================
// MonsterQuest v2 — js/data/achievements.js  (owned by content-activities)
// Three registries, no logic:
//   MQ.Data.achievements  — the 40 (SIDE-CONTENT §2.9, ids ach_01…ach_40)
//   MQ.Data.recipes       — the Y Berllan brew book (SIDE-CONTENT §2.5)
//   MQ.Data.bounties      — the bounty board's template pool (SIDE-CONTENT §2.1)
// The achievements *engine* lives in js/content/achievements-engine.js and
// reads name/desc/hidden from here; `need` and `hook` are repeated so the
// achievements screen can show progress text without asking the engine.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // ---------------------------------------------------------------
  // 1. ACHIEVEMENTS (40)
  // ---------------------------------------------------------------
  // a(nn, slug, name, desc, need, hook, opts)
  //   hook  — what the engine watches (informational; the engine owns the maths)
  //   opts  — {hidden, tier:'bronze'|'silver'|'gold', how: player-facing hint}
  function a(nn, slug, name, desc, need, hook, opts) {
    opts = opts || {};
    D.define("achievements", "ach_" + nn, {
      num: parseInt(nn, 10), slug: slug, name: name, desc: desc,
      need: need, hook: hook, hidden: !!opts.hidden, tier: opts.tier || "bronze",
      how: opts.how || null, group: opts.group || "general"
    });
  }

  a("01", "first_triage", "First Triage",
    "Win your first engagement. Everyone remembers their first ticket.",
    1, "trainer.stat:wins", { how: "Win one battle.", group: "battle" });
  a("02", "walked_not_ran", "Walked, Not Ran",
    "Ten thousand tiles on foot. The dog-walkers know you now.",
    10000, "trainer.stat:steps", { tier: "silver", how: "Walk 10,000 tiles.", group: "roaming" });
  a("03", "bothered_by_weather", "Bothered By Weather",
    "A thousand tiles in the rain. It is only water.",
    1000, "trainer.stat:stepsRain", { how: "Walk 1,000 tiles in the rain.", group: "roaming" });
  a("04", "unbothered_by_weather", "Unbothered By Weather",
    "Five thousand tiles in the rain. It is definitely only water.",
    5000, "trainer.stat:stepsRain", { tier: "silver", how: "Walk 5,000 tiles in the rain.", group: "roaming" });
  a("05", "paste_refused", "Paste Refused",
    "Decline ten ClickFix lures. Never paste what a stranger hands you.",
    10, "trainer.stat:luresRefused", { how: "Walk past ten \"scan me\" signs.", group: "story" });
  a("06", "not_today_botnet", "Not Today, Botnet",
    "Break the Heritage Centre's botnet at Crewe.",
    1, "flag:apt_boss_beaten", { group: "story" });
  a("07", "trust_anchor", "Trust Anchor",
    "Earn your first badge. Somebody has decided you can be relied on.",
    1, "trainer.badges", { group: "gyms" });
  a("08", "eight_anchors", "Eight Anchors",
    "Earn all eight badges. Or all eight SIGNED, as the card would have it.",
    8, "trainer.badges", { tier: "gold", group: "gyms" });
  a("09", "cranford_correspondent", "Cranford Correspondent",
    "A perfect round in Madam Gaskell's quiz. She writes it down, of course.",
    1, "flag:quiz_perfect_knutsford", { how: "Five out of five at the Knutsford quiz.", group: "minigames" });
  a("10", "bear_necessity", "The Bear Necessity",
    "Close the case of the Bear of Congleton. The town sold a bible for it once.",
    1, "quest:case_10_bear_of_congleton", { group: "casebook" });
  a("11", "salt_of_the_earth", "Salt of the Earth",
    "Catch ten creatures that live in the brine.",
    10, "dex.habitat:salt", { how: "Ten salt-habitat catches.", group: "dex" });
  a("12", "sighted_not_cited", "Sighted, Not Cited",
    "Take fifty scored photographs. No creature was inconvenienced.",
    50, "trainer.stat:photos", { how: "Fifty photos in Sighting mode.", group: "photo" });
  a("13", "ghost_in_the_signal_box", "Ghost in the Signal Box",
    "Catch POLTERGRID rather than knocking it down. It was only pulling levers.",
    1, "dex.caught:poltergrid", { group: "dex" });
  a("14", "brine_time", "Brine Time",
    "Heal a hundred times at the Nantwich lido. The water is warmer than it looks.",
    100, "trainer.stat:healsLido", { tier: "silver", group: "roaming" });
  a("15", "balanced_caissons", "Balanced Caissons",
    "Settle the Anderton boat lift. Two tanks, one answer, no shouting.",
    1, "quest:case_22_lift_logic", { how: "Solve the boat-lift puzzle.", group: "minigames" });
  a("16", "on_time_every_time", "On Time, Every Time",
    "A perfect Crewe timetable. Even the delay card behaved.",
    1, "flag:timetable_perfect", { how: "Clear a timetable round with no conflicts.", group: "minigames" });
  a("17", "wallwalker", "Wallwalker",
    "Walk the whole Chester circuit without once stepping off.",
    1, "quest:case_29_chester_walls_round", { group: "casebook" });
  a("18", "small_black_fast", "Small Black Fast",
    "MEADOW trusts you completely. She still gets there first.",
    5, "cats.trust:meadow", { tier: "silver", group: "cats" });
  a("19", "back_from_the_brink", "Back From The Brink",
    "BIGBOY survives at 1 HP twenty-five times. He knows exactly what he is doing.",
    25, "trainer.stat:brinkSaves", { tier: "silver", group: "cats" });
  a("20", "big_boy_energy", "Big Boy Energy",
    "BIGBOY trusts you completely. He still sits down when he likes.",
    5, "cats.trust:bigboy", { tier: "silver", group: "cats" });
  a("21", "first_press", "First Press",
    "Brew something at the elm press. It tastes of the orchard and of waiting.",
    1, "trainer.stat:brews", { how: "Finish one brew.", group: "brewing" });
  a("22", "mamgu_would_approve", "Mam-gu Would Approve",
    "Complete a Mam-gu's Cask. Four hours. She checked twice.",
    1, "flag:brewed_brew_mamgu_cask", { tier: "gold", group: "brewing" });
  a("23", "cambrian_line", "Cambrian Line",
    "Ride the Cambrian line to the orchard. The sea arrives on the left.",
    1, "flag:orchard_open", { group: "story" });
  a("24", "ambidextrous", "Ambidextrous",
    "Answer in all four languages: English, Welsh, packet, and silence.",
    4, "flag:count_languages", { hidden: true, group: "story" });
  a("25", "ticket_to_ride", "Ticket to Ride",
    "Register every station on the network. The guard nods. That is the whole reward.",
    12, "flag:stations_registered", { tier: "silver", group: "roaming" });
  a("26", "twelve_thousand_puppets", "Twelve Thousand Puppets",
    "Defeat a hundred Credential Stuffer grunts. None of them chose this.",
    100, "trainer.stat:puppetsBeaten", { tier: "silver", group: "battle" });
  a("27", "wearing_a_trusted_face", "Wearing A Trusted Face",
    "Expose five AMOS impostors. Check the hands. They never get the hands right.",
    5, "trainer.stat:amosExposed", { group: "story" });
  a("28", "shadow_it_sunlit", "Shadow IT, Sunlit",
    "Close every Shadow IT case. No villain, just nobody minding it.",
    1, "quests.tag:shadow_it", { tier: "gold", group: "casebook" });
  a("29", "bounty_hunter", "Bounty Hunter",
    "Claim twenty-five bounties. The board knows your handwriting.",
    25, "trainer.stat:bounties", { tier: "silver", group: "bounties" });
  a("30", "warrant_served", "Warrant Served",
    "Serve five Warrants. The heavy paperwork, done properly.",
    5, "trainer.stat:warrants", { tier: "gold", group: "bounties" });
  a("31", "arena_bronze", "Bronze Warrington",
    "Clear the Arena at Bronze. Three fights and a crowd that has seen worse.",
    1, "flag:arena_bronze_clear", { group: "arena" });
  a("32", "arena_silver", "Silver Warrington",
    "Clear the Arena at Silver. Five fights, and the PP does not come back.",
    1, "flag:arena_silver_clear", { group: "arena" });
  a("33", "arena_gold", "Gold Warrington",
    "Clear the Arena at Gold, without a single item. Just you and the plan.",
    1, "flag:arena_gold_clear", { tier: "silver", group: "arena" });
  a("34", "arena_platinum", "Platinum Warrington",
    "Clear the Arena at Platinum. One Agent. Choose it well.",
    1, "flag:arena_platinum_clear", { tier: "gold", group: "arena" });
  a("35", "arena_obsidian", "Obsidian",
    "Clear the Obsidian Arena. Twelve fights, changing weather, no mercy.",
    1, "flag:arena_obsidian_clear", { tier: "gold", hidden: true, group: "arena" });
  a("36", "casebook_closed", "Casebook Closed",
    "Close all thirty cases. Every one was somebody's whole week.",
    30, "quests.closedCases", { tier: "gold", group: "casebook" });
  a("37", "full_dex", "Full Dex",
    "Every entry, caught. The orchard has something waiting for you.",
    1, "dex.complete", { tier: "gold", group: "dex" });
  a("38", "overdriven", "Overdriven",
    "Fire a hundred Overdrives. The meter is not a suggestion.",
    100, "trainer.stat:overdrives", { tier: "silver", group: "battle" });
  a("39", "principal", "Principal",
    "Max out one whole perk branch. Triage, Escalate or Adjudicate — pick a hill.",
    1, "progression.branchMaxed", { tier: "gold", group: "trainer" });
  a("40", "cheshire_protocol", "The Cheshire Protocol",
    "See it through to the end, and then the end after that.",
    1, "flag:amos_jim_face+postgame_open", { tier: "gold", hidden: true, group: "story" });

  // ---------------------------------------------------------------
  // 2. BREW RECIPES — the elm press at Y Berllan (SIDE-CONTENT §2.5)
  // ---------------------------------------------------------------
  // ingredients → output, real-clock minutes, tier gate.
  // `tip` is Mam-gu's line when you highlight the recipe; `note` is the
  // brewer's own margin scrawl once you have made one.
  function r(id, o) { D.define("recipes", id, o); }

  r("perry", {
    name: "Perry", tier: 1, output: "brew_perry", n: 1, minutes: 10,
    ingredients: [{ id: "perry_pear", n: 3 }],
    effect: "Party back to full, and the Overdrive meter starts at 25.",
    tip: "\"Three pears. Not two, not four. Three is what the barrel expects.\"",
    note: "Cloudy. Meant to be.",
    taught: true
  });
  r("clarifier", {
    name: "Clarifier", tier: 1, output: "brew_clarifier", n: 1, minutes: 10,
    ingredients: [{ id: "brine_sample", n: 1 }, { id: "apple", n: 1 }],
    effect: "Clears every status off the whole party.",
    tip: "\"Brine and apple. Salt argues, apple apologises, and the pair of them sort it out.\"",
    note: "Smells like the lido on a cold morning."
  });
  r("elm_stout", {
    name: "Elm Stout", tier: 1, output: "brew_elm_stout", n: 1, minutes: 60,
    ingredients: [{ id: "barley", n: 2 }, { id: "roasted_acorn", n: 1 }],
    effect: "Defence +1 stage for the first three turns of the next fight.",
    tip: "\"An hour, mind. You can't hurry a stout and you can't hurry a Welshwoman.\"",
    note: "Black as the inside of a chimney."
  });
  r("cats_cup", {
    name: "Cat's Cup", tier: 1, output: "brew_cats_cup", n: 1, minutes: 10,
    ingredients: [{ id: "cream", n: 1 }, { id: "catmint", n: 1 }],
    effect: "One cat's trust +1. Once a day, and they know when it's the same day.",
    tip: "\"Cream and catmint. Bigboy will hear the lid come off from the next field.\"",
    note: "Meadow drinks it in four seconds and then looks betrayed."
  });
  r("damson_fire", {
    name: "Damson Fire", tier: 2, output: "brew_damson_fire", n: 1, minutes: 60,
    ingredients: [{ id: "damson", n: 3 }, { id: "beacon_ember", n: 1 }],
    effect: "Fire moves ×1.2 for one battle.",
    tip: "\"Prestbury damsons and an ember off the beacon. Don't breathe over it.\"",
    note: "Goes down warm and comes back warmer."
  });
  r("hedgerow_cordial", {
    name: "Hedgerow Cordial", tier: 2, output: "brew_hedgerow_cordial", n: 1, minutes: 60,
    ingredients: [{ id: "blackberry", n: 3 }, { id: "sloe", n: 2 }],
    effect: "Capture rate ×1.3 for ten real minutes.",
    tip: "\"Pick the blackberries above dog height, love. I'll say no more.\"",
    note: "Stains everything it has ever touched."
  });
  r("salt_mead", {
    name: "Salt Mead", tier: 2, output: "brew_salt_mead", n: 1, minutes: 60,
    ingredients: [{ id: "honey", n: 2 }, { id: "salt_crystal", n: 1 }],
    effect: "Rock and Ground moves do ×0.75 to you for one battle.",
    tip: "\"Honey off the Rows and a crystal out of Northwich. Half the county in a cup.\"",
    note: "Tastes like a seaside town in February. Complimentary."
  });
  r("bait_tin", {
    name: "Bait Tin", tier: 2, output: "brew_bait_tin", n: 1, minutes: 60,
    ingredients: [{ id: "roe", n: 2 }, { id: "oats", n: 2 }],
    effect: "Widens the Rare zone on the fishing bar. Wearable as a trinket.",
    tip: "\"Roe and oats. Doug swears by it and Doug has caught one legendary fish.\"",
    note: "Do not open it indoors."
  });
  r("mamgu_cask", {
    name: "Mam-gu's Cask", tier: 3, output: "brew_mamgu_cask", n: 1, minutes: 240,
    ingredients: [
      { id: "perry_pear", n: 2 }, { id: "damson", n: 1 }, { id: "blackberry", n: 1 },
      { id: "honey", n: 1 }, { id: "barley", n: 1 }, { id: "brine_sample", n: 1 }
    ],
    effect: "+1 perk point. Once a week, and the week is a real one.",
    tip: "\"Everything in, and four hours out. Go and do something useful with your afternoon.\"",
    note: "The barrel ticks while it works. Nobody can explain that.",
    weekly: true, gate: "brew_tier>=3"
  });
  r("elm_rod", {
    name: "Elm-handled Rod", tier: 3, output: "rod_elm", n: 1, minutes: 240,
    ingredients: [{ id: "timber_oak", n: 1 }, { id: "roe", n: 3 }, { id: "perry_pear", n: 1 }],
    effect: "The last rod. Ghost tier at night, with the Ghost Lens.",
    tip: "\"Elm doesn't rot in water. That's the whole trick and it took us four hundred years.\"",
    note: "Heavier than it looks, and it looks heavy.",
    once: true, gate: "brew_tier>=3"
  });

  // ---------------------------------------------------------------
  // 3. BOUNTY TEMPLATES (SIDE-CONTENT §2.1)
  // ---------------------------------------------------------------
  // {species|trainer, name, clue, tier, town, map, phase?, weather?, note}
  // Located by clue text only — never a map marker.
  function b(id, o) { o.id = id; D.define("bounties", id, o); }

  // -- Petty: a named common with a bad habit ----------------------
  b("bounty_bramble", { species: "rottling", name: "Bramble", tier: "petty", town: "wilmslow",
    map: "route_wilmslow_styal", clue: "chewed berries all along the Bollin path, and not by a bird" });
  b("bounty_runaway", { species: "saltling", name: "Runaway", tier: "petty", town: "northwich",
    map: "northwich", clue: "a white crust on the towpath by the Weaver that keeps moving overnight" });
  b("bounty_flocks_ghost", { species: "sheepwire", name: "The Flock's Ghost", tier: "petty", town: "nantwich",
    map: "route_nantwich_winsford", clue: "wool caught on a Nantwich fence, humming to itself" });
  b("bounty_honey_morph", { species: "spindrake", name: "Honey Morph", tier: "petty", town: "bollington",
    map: "bollington", clue: "one lamp in Bollington with entirely the wrong moths on it", phase: "night" });
  b("bounty_lamplighter", { species: "sootling", name: "The Lamplighter", tier: "petty", town: "macclesfield",
    map: "macclesfield", clue: "someone is putting the mill chimney's soot back, tidily, every morning" });
  b("bounty_gatecrasher", { species: "nibbit", name: "Gatecrasher", tier: "petty", town: "prestbury",
    map: "prestbury", clue: "a hole in the churchyard hedge exactly the size of a small opinion" });
  b("bounty_towpath_terry", { species: "towpaddle", name: "Towpath Terry", tier: "petty", town: "macclesfield",
    map: "route_macc_bollington", clue: "narrowboats reporting a wake with nothing making it" });
  b("bounty_scrumper", { species: "perrypip", name: "The Scrumper", tier: "petty", town: "prestbury",
    map: "prestbury", clue: "the orchard's lowest branches are stripped and the ladder hasn't moved" });
  b("bounty_ticket_dodger", { species: "chuglet", name: "Ticket Dodger", tier: "petty", town: "crewe",
    map: "crewe", clue: "platform four's departure board keeps adding a service that doesn't exist" });
  b("bounty_puddle_king", { species: "puddlish", name: "The Puddle King", tier: "petty", town: "poynton",
    map: "poynton", clue: "the pool is one inch lower every Tuesday and nobody's pumping" });

  // -- Notable: a rare morph, weather- or time-locked ---------------
  b("bounty_nine_point", { species: "stagwire", name: "Nine-Point", tier: "notable", town: "knutsford",
    map: "tatton_park", clue: "hoofprints in the Tatton sand, always at dusk, always nine of them", phase: "dusk" });
  b("bounty_third_verse", { species: "chordle", name: "Third Verse", tier: "notable", town: "middlewich",
    map: "middlewich", clue: "a note held far too long near the Middlewich choir practice" });
  b("bounty_small_hours", { species: "poltergrid", name: "Small Hours", tier: "notable", town: "holmes_chapel",
    map: "holmes_chapel", clue: "levers moving in the signal box at night with the box locked", phase: "night" });
  b("bounty_wet_wednesday", { species: "millrace", name: "Wet Wednesday", tier: "notable", town: "styal",
    map: "styal", clue: "the mill wheel turns the wrong way, but only in the rain", weather: "rain" });
  b("bounty_the_understudy_s_cat", { species: "grinkit", name: "The Understudy's Cat", tier: "notable",
    town: "alderley_edge", map: "alderley_edge", clue: "a grin on the Edge with nothing attached to it", phase: "night" });
  b("bounty_fog_signal", { species: "phantasmal", name: "Fog Signal", tier: "notable", town: "lindow",
    map: "lindow_moss", clue: "a shape on the moss that only casts a shadow when it's foggy", weather: "fog" });
  b("bounty_the_dowager", { species: "manorwraith", name: "The Dowager", tier: "notable", town: "lyme",
    map: "lyme_park", clue: "the long gallery is being dusted and the house has no staff", phase: "night" });
  b("bounty_third_rail", { species: "volteel", name: "Third Rail", tier: "notable", town: "winsford",
    map: "winsford", clue: "anglers at the Flashes keep getting a shock off a dry line" });
  b("bounty_bell_ringer", { species: "crossbell", name: "The Bell Ringer", tier: "notable", town: "sandbach",
    map: "sandbach", clue: "one cross rings at four in the morning and it isn't the wind", phase: "night" });
  b("bounty_the_lifter", { species: "pillarnaut", name: "The Lifter", tier: "notable", town: "anderton",
    map: "anderton", clue: "the boat lift's counterweights were level last night and are not now" });

  // -- Warrant: a mini-boss with a trait; weekly, heavy pay ---------
  b("bounty_the_understudys_understudy", { species: "amoslurk", name: "The Understudy's Understudy",
    tier: "warrant", town: "board", clue: "somebody is wearing a face you have already met this week",
    trait: "borrowed_face", note: "Check the hands. They never get the hands right." });
  b("bounty_signed_driver", { species: "trojanox", name: "Signed Driver", tier: "warrant", town: "runcorn",
    map: "runcorn", clue: "a fridge at Runcorn that will not go dark, signed by somebody trusted",
    trait: "kevlar", note: "Its certificate is genuine. That is the problem." });
  b("bounty_the_quiet_dish", { species: "parabolus", name: "The Quiet Dish", tier: "warrant", town: "holmes_chapel",
    map: "jodrell_bank", clue: "the grounds hum at a frequency that makes fillings ache", phase: "night",
    trait: "signal", note: "It is not listening to us." });
  b("bounty_brinehead", { species: "krabbaron", name: "Brinehead", tier: "warrant", town: "northwich",
    map: "salt_mine_galleries", clue: "salt miners are working two men short and won't say why",
    trait: "heavy", note: "Down where the lamps go orange." });
  b("bounty_the_flarestack", { species: "flarestack", name: "The Flarestack", tier: "warrant", town: "runcorn",
    map: "runcorn", clue: "a flame on the skyline that burns in the wrong direction",
    trait: "burn", note: "Bring something that doesn't mind the heat." });
  b("bounty_wall_walker", { species: "centurigeist", name: "The Wall Walker", tier: "warrant", town: "chester",
    map: "chester", clue: "the Roman circuit gains a sentry between the Eastgate and the Phoenix Tower", phase: "night",
    trait: "guard", note: "It has been on this shift for a very long time." });

  MQ.log && MQ.log("[data] achievements " + D.count("achievements") +
    ", recipes " + D.count("recipes") + ", bounties " + D.count("bounties"));
})();
