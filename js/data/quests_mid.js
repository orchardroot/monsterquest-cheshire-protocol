// =============================================================
// MonsterQuest v2 — quest definitions for the MID region:
// the Chapter 3, 4 and 5 main quests, and the nine Casebook cases set
// in these towns (SIDE-CONTENT §1 cases 6, 8, 9, 10, 11, 12, 13, 15, 16).
// Ids per DESIGN-INDEX §9: main_<nn>_<slug> and case_<nn>_<slug>.
// Registration only. Owned by region-mid.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;
  function Q(id, def) { D.define("quests", id, def); }

  // ---------------------------------------------------------- main quests --
  Q("main_03_picnic_blankets", {
    name: "Picnic Blankets",
    kind: "main", chapter: 3, town: "knutsford",
    giver: { npc: "npc_tatton_nerys", map: "tatton_park" },
    summary: "A deer count that keeps going up, a preacher who has read the thing he tells you not to read, and a bell under thirty metres of cold water.",
    stages: [
      { id: "s1", text: "Count the Tatton herd with Deer Warden Nerys, properly.", hint: "Tatton Park. Three sweeps: the avenue, the shore, the rise.",
        cond: { kind: "flag", expr: "deer_census_done" },
        reward: { xp: 300, items: [{ id: "capsule_kernel", n: 5 }] } },
      { id: "s2", text: "Find out where the extra hundred and thirty deer are coming from.", hint: "The marquee. Read the top of the sign-in sheet.",
        cond: { kind: "flag", expr: "clue_census_farm || twelvek_lanyard_seen" } },
      { id: "s3", text: "VEX has taken the cleansing command apart and wants you to be impressed.", hint: "Tatton parkland, after the count.",
        cond: { kind: "defeat", trainer: "vex_2" },
        reward: { money: 1800 } },
      { id: "s4", text: "Trace the cult's command to whoever registered it.", hint: "VEX already has. Let them tell you.",
        cond: { kind: "flag", expr: "tbilisi_domain_found" } },
      { id: "s5", text: "Beat Madam Gaskell and take the CIPHER badge.", hint: "Knutsford Gym — three lecterns, in shelf order.",
        cond: { kind: "flag", expr: "badge_cipher" },
        reward: { xp: 600, perk: 1 } },
      { id: "s6", text: "Stand on the Rostherne jetty and let the bell ring.", hint: "North of Tatton, up the lane. Go after the census.",
        cond: { kind: "flag", expr: "rostherne_relay_seen" } }
    ],
    reward: { money: 2600, xp: 700, perk: 1, marks: 4, items: [{ id: "capsule_night", n: 5 }], flags: ["chapter_3_done"] },
    tracks: true
  });

  Q("main_04_the_dish_goes_dark", {
    name: "The Dish Goes Dark",
    kind: "main", chapter: 4, town: "congleton",
    giver: { npc: "npc_jodrell_ravi", map: "jodrell_bank" },
    summary: "The Lovell Telescope has stopped listening upwards and started listening at a hill, and the people guarding it are not the people who own it.",
    stages: [
      { id: "s1", text: "Walk the Twemlow meadows and get to the observatory gate.", hint: "East out of Holmes Chapel, under the arches.",
        cond: { kind: "reach", map: "jodrell_bank" } },
      { id: "s2", text: "Get turned away by the woman in hi-vis, and pick up what she drops.", hint: "The gate. Don't argue; she isn't arguing either.",
        cond: { kind: "flag", expr: "jodrell_turned_away" },
        reward: { xp: 400 } },
      { id: "s3", text: "Find out what the dish is pointed at.", hint: "Dr Lovell-Hart is in his own car park being extremely calm.",
        cond: { kind: "flag", expr: "clue_dish_elevation" } },
      { id: "s4", text: "Beat Bearward Otis and take the BEAR badge.", hint: "Congleton. Do his small favour first; it is not small.",
        cond: { kind: "flag", expr: "badge_bear" },
        reward: { xp: 700, perk: 1 } },
      { id: "s5", text: "Read the memo pinned in the gym post.", hint: "The keeper's hut. Otis thought it was a bill.",
        cond: { kind: "flag", expr: "clue_cutover_memo" } },
      { id: "s6", text: "The ranger in the arboretum has the right face and the wrong eleven years.", hint: "Jodrell Bank, after the gate.",
        cond: { kind: "flag", expr: "amos_first_glimpse" } }
    ],
    reward: { money: 3200, xp: 900, perk: 1, marks: 4, items: [{ id: "capsule_root", n: 5 }], flags: ["chapter_4_done"] },
    tracks: true
  });

  Q("main_05_puppets_on_the_line", {
    name: "Puppets on the Line",
    kind: "main", chapter: 5, town: "crewe",
    giver: { npc: "npc_crewe_ted", map: "crewe" },
    summary: "Twelve platforms under a fog that is not weather, an interlocking that cannot be wrong and is, and two Saxon crosses being read as key material.",
    stages: [
      { id: "s1", text: "Find out what is chalked on the Sandbach crosses.", hint: "The market square. Historian Nia is looking at the same four panels.",
        cond: { kind: "flag", expr: "sandbach_crosses_read" } },
      { id: "s2", text: "Stand in the square when the fog comes off the Elworth road.", hint: "The night market. The crosses light carving by carving.",
        cond: { kind: "flag", expr: "sandbach_crosses_lit" },
        reward: { xp: 500, items: [{ id: "revive_salts", n: 3 }] } },
      { id: "s3", text: "Clear the fog off Crewe station with Stoker Di.", hint: "Run the sidings. Her loco clears fog; that is not a metaphor.",
        cond: { kind: "flag", expr: "crewe_fog_cleared" } },
      { id: "s4", text: "Deal with whatever is doing laps of the yard on a train that was cancelled in 1986.", hint: "The Heritage Centre. Get on the back deck.",
        cond: { kind: "flag", expr: "apt_boss_beaten" },
        reward: { money: 2400 } },
      { id: "s5", text: "Meet the adult behind three sixth-formers, and read his lanyard.", hint: "The concourse, once the boards are honest again.",
        cond: { kind: "flag", expr: "twelvek_lanyard_seen" } },
      { id: "s6", text: "Beat Stoker Di and take the KERNEL badge.", hint: "The roundhouse. Line up the road before you walk it.",
        cond: { kind: "flag", expr: "badge_kernel" },
        reward: { xp: 900, perk: 1 } },
      { id: "s7", text: "Get the Railcard signed, and take the train back with VEX.", hint: "The Railcard office, then platform six.",
        cond: { kind: "flag", expr: "welsh_word_learned" } }
    ],
    reward: { money: 4000, xp: 1100, perk: 1, marks: 5, items: [{ id: "capsule_heavy", n: 5 }], flags: ["chapter_5_done"] },
    tracks: true
  });

  // ------------------------------------------------------------- casebook --
  Q("case_06_deer_census_part_two", {
    name: "The Deer Census, Part Two",
    kind: "case", tier: 3, chapter: 4, town: "tatton_park",
    giver: { npc: "npc_tatton_nerys", map: "tatton_park" },
    summary: "The Chapter 3 count was a botnet. Now count the real herd, with a camera, the way Nerys has done it since 1998.",
    stages: [
      { id: "s1", text: "Photograph eight distinct STAGWIRE by antler pattern.", hint: "Tatton parkland. Two of the eight only come out in rain.",
        cond: { kind: "flag", expr: "case_06_photos>=8" } },
      { id: "s2", text: "Photograph the ninth.", hint: "It will be standing slightly apart and it will be looking at you.",
        cond: { kind: "flag", expr: "case_06_ninth" } },
      { id: "s3", text: "Tell Nerys what the ninth one was.", hint: "It is not a deer and it does not stay to be told so.",
        cond: { kind: "talk", npc: "npc_tatton_nerys" } }
    ],
    reward: { money: 800, items: [{ id: "rain_cloak", n: 1 }, { id: "face_fragment_1", n: 1 }], marks: 4, xp: 340 }
  });

  Q("case_08_the_gaskell_draft", {
    name: "The Gaskell Draft",
    kind: "case", tier: 2, chapter: 3, town: "knutsford",
    giver: { npc: "npc_knutsford_aled", map: "knutsford_bookshop" },
    summary: "A manuscript page of Cranford has been 'found'. Paper ages and ink bleeds and this page does neither.",
    stages: [
      { id: "s1", text: "Sit the Knutsford Quiz and prove you can tell her prose from an imitation.", hint: "The Assembly Rooms. Round four is the town. Round five is you.",
        cond: { kind: "flag", expr: "case_08_quiz_passed" } },
      { id: "s2", text: "Inspect the page and find the seller.", hint: "He is on the Heath and he is reading from a script.",
        cond: { kind: "flag", expr: "case_08_seller_found" } },
      { id: "s3", text: "Beat him without deploying an Agent.", hint: "He will defect the first time anybody beats him fairly.",
        cond: { kind: "flag", expr: "case_08_done" } }
    ],
    reward: { money: 1000, perk: 1, marks: 3, xp: 260 }
  });

  Q("case_09_penny_farthing_rally", {
    name: "Penny Farthing Rally",
    kind: "case", tier: 1, chapter: 3, town: "knutsford",
    giver: { npc: "npc_knutsford_tomos", map: "knutsford" },
    summary: "Six pennants, ninety seconds, the alleys of Knutsford. No twist. Pure joy, which the Casebook is not used to.",
    stages: [
      { id: "s1", text: "Run the course inside ninety seconds.", hint: "Start at the museum door. Don't stop; there's nowhere to stop.",
        cond: { kind: "flag", expr: "case_09_done" } }
    ],
    reward: { gear: "sprint_soles", marks: 2, xp: 150 }
  });

  Q("case_10_bear_of_congleton", {
    name: "Bear of Congleton",
    kind: "case", tier: 2, chapter: 4, town: "congleton",
    giver: { npc: "npc_congleton_otis_pre", map: "congleton" },
    summary: "Three bear tokens, and six stickers on six lampposts that print a true password over a lie.",
    stages: [
      { id: "s1", text: "Find the three bear tokens: bakery, bridge, park.", hint: "Each one is behind a small errand and none of the errands is small.",
        cond: { kind: "flag", expr: "case_10_token_bakery" } },
      { id: "s2", text: "Take down six ClickFix posters between the square and the station.", hint: "Peel, don't scan. There is always a corner left.",
        cond: { kind: "flag", expr: "case_10_posters_done" } },
      { id: "s3", text: "Tell Otis what the tokens spell.", hint: "It is BEAR. Of course it is BEAR.",
        cond: { kind: "flag", expr: "case_10_done" } }
    ],
    reward: { money: 900, marks: 3, xp: 300, flags: ["rematch_leader_otis"] }
  });

  Q("case_11_signal_box", {
    name: "Signal Box, Holmes Chapel",
    kind: "case", tier: 2, chapter: 4, town: "holmes_chapel",
    giver: { npc: "npc_holmes_dot", map: "holmes_chapel" },
    summary: "Lever twelve moves at three in the morning and lever twelve is a spare. Ghosts do not have a duty cycle.",
    stages: [
      { id: "s1", text: "Force the night band: sleep at the Red Lion.", hint: "It doesn't perform for daylight.",
        cond: { kind: "flag", expr: "case_11_watching" } },
      { id: "s2", text: "Watch the frame at three and see what is behind lever twelve's plate.", hint: "A telemetry dongle from a trial that ended in 2019.",
        cond: { kind: "flag", expr: "case_11_poltergrid" } },
      { id: "s3", text: "Catch it rather than knocking it flat.", hint: "It is nesting in the noise. It is not haunting anything.",
        cond: { kind: "flag", expr: "case_11_done" } }
    ],
    reward: { money: 700, items: [{ id: "ghost_lens", n: 1 }], marks: 3, xp: 320 }
  });

  Q("case_12_saxon_crosses_cipher", {
    name: "The Saxon Crosses Cipher",
    kind: "case", tier: 3, chapter: 5, town: "sandbach",
    giver: { npc: "npc_sandbach_nia", map: "sandbach" },
    summary: "Four chalked panels, a substitution key hiding in plain sight on the market-square sign, and a dead drop on the cold side of the churchyard.",
    stages: [
      { id: "s1", text: "Photograph the four chalked panels.", hint: "They are the four with the tightest interlace, which is not on the information board.",
        cond: { kind: "flag", expr: "sandbach_rubbing_done || case_12_photos" } },
      { id: "s2", text: "Decode them against the old market-square sign.", hint: "Everybody thinks the alphabet on it is decoration.",
        cond: { kind: "flag", expr: "clue_interlace_key" } },
      { id: "s3", text: "Find the drop on the north side of the churchyard.", hint: "Nobody goes there because it is cold.",
        cond: { kind: "flag", expr: "case_12_drop_found" } },
      { id: "s4", text: "Decide what to do with a Credential Stuffer proxy list.", hint: "Brine Nell at Nantwich is ex-forensics. Somebody else will pay two thousand for it.",
        cond: { kind: "flag", expr: "case_12_handed_in || case_12_sold" } }
    ],
    reward: { money: 1200, perk: 1, marks: 5, xp: 420 }
  });

  Q("case_13_bounty_fenced_goods", {
    name: "Bounty: Fenced Goods",
    kind: "case", tier: 1, chapter: 5, town: "sandbach",
    giver: { npc: "npc_sandbach_board", map: "sandbach" },
    summary: "The first card on the first board in the county: a named ROTTLING that has been eating its way along the Wheelock hedges.",
    stages: [
      { id: "s1", text: "Track 'Bramble' by the berry bushes it has stripped.", hint: "Chewed berries, and the pips spat out. Deer don't spit the pips out.",
        cond: { kind: "flag", expr: "case_13_tracked" } },
      { id: "s2", text: "Bring it in.", hint: "Along the Wheelock flight, in the hedge above the fourth lock.",
        cond: { kind: "catch", species: "rottling", n: 1 } }
    ],
    reward: { money: 500, marks: 2, xp: 200, flags: ["bounty_board_open"] }
  });

  Q("case_15_timetable_tangle", {
    name: "Timetable Tangle",
    kind: "case", tier: 3, chapter: 5, town: "crewe",
    giver: { npc: "npc_crewe_mags", map: "crewe" },
    summary: "The trains are not colliding on the rails. They are colliding in the schedule, which is quieter and much worse.",
    stages: [
      { id: "s1", text: "Slot six services into four platforms, three rounds.", hint: "Turnrounds, conflicting paths, and one freight you must not hold.",
        cond: { kind: "flag", expr: "case_15_done" } },
      { id: "s2", text: "Look at when the corruption happens.", hint: "Every thirteenth minute. Every single one, for a fortnight.",
        cond: { kind: "flag", expr: "clue_thirteenth_minute" } }
    ],
    reward: { money: 1100, items: [{ id: "conductors_whistle", n: 1 }], marks: 4, xp: 380 }
  });

  Q("case_16_stokers_rematch_ladder", {
    name: "Stoker's Rematch Ladder",
    kind: "case", tier: 3, chapter: 5, town: "crewe",
    giver: { npc: "npc_crewe_di", map: "crewe_gym_floor" },
    summary: "Di goes up five tiers and then she stops being nice. At tier four she brings something you released, because they come to the line.",
    repeatable: true,
    stages: [
      { id: "s1", text: "Beat Di again with the ladder at tier 1.", cond: { kind: "flag", expr: "rematch_leader_di>=1" } },
      { id: "s2", text: "Tier 3. She brings a held item and a trait.", cond: { kind: "flag", expr: "rematch_leader_di>=3" } },
      { id: "s3", text: "Tier 5. Six of them, and the Anchor on the line.", cond: { kind: "flag", expr: "rematch_leader_di>=5" },
        reward: { items: [{ id: "firebox_charm", n: 1 }] } }
    ],
    reward: { money: 2000, items: [{ id: "anchor_kernel", n: 1 }], marks: 6, xp: 500 }
  });
})();
