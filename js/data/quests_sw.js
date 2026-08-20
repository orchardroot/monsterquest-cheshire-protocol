// =============================================================
// MonsterQuest v2 — quest definitions for the SOUTH-WEST:
// the Chapter 6 and 7 main quests, and the nine Casebook cases set in
// this region (SIDE-CONTENT §1 cases 14, 17, 18, 19, 20, 21, 22, 25, 30).
// Ids per DESIGN-INDEX §9: main_<nn>_<slug> and case_<nn>_<slug>.
// Registration only. Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;
  function Q(id, def) { D.define("quests", id, def); }
  function f(expr) { return { kind: "flag", expr: expr }; }

  // ---------------------------------------------------------- main quests --
  Q("main_06_brine_and_perry", {
    name: "Brine and Perry",
    kind: "main", chapter: 6, town: "nantwich",
    giver: { npc: "npc_nantwich_nell", map: "nantwich_gym_deep_end" },
    summary: "A badge in a town made of brine, a man who wants to baptise it, and then three hours west to a place with no signal at all.",
    stages: [
      { id: "s1", text: "Brother Kellan is at the lido and the town has stopped swimming.", hint: "The brine pool, north-east of Nantwich.",
        cond: f("lido_battle_done"), reward: { money: 900, xp: 160 } },
      { id: "s2", text: "Decide what happens to Kellan.", hint: "Hand him to Nell, or walk him somewhere quieter and ask who pays him.",
        cond: f("kellan_handed_in || kellan_walked") },
      { id: "s3", text: "Beat Brine Nell and take the TOKEN badge.", hint: "Nantwich Baths. Beat the three lane keepers first; the lock gates open for finished work.",
        cond: f("badge_token"), reward: { xp: 400, perk: 1, items: [{ id: "capsule_brine", n: 5 }] } },
      { id: "s4", text: "Go home. Cambrian line, west, until it hits the sea.", hint: "Crewe station, the Cambrian platform. You have the ticket.",
        cond: f("orchard_open") },
      { id: "s5", text: "Read what is under the loose board in the elm-press shed.", hint: "Y Berllan. The shed. The board has been lifted many times, badly.",
        cond: f("pippin_found"), reward: { xp: 500 } },
      { id: "s6", text: "Decide what to do about the Trio.", hint: "Wipe them clean, or feed the telemetry a map that isn't true.",
        cond: f("choice_agents") }
    ],
    reward: { money: 2600, xp: 700, perk: 1, items: [{ id: "elixir", n: 3 }], flags: ["chapter_6_done"] }
  });

  Q("main_07_salt", {
    name: "Salt",
    kind: "main", chapter: 7, town: "northwich",
    giver: { npc: "npc_northwich_jack_street", map: "northwich" },
    summary: "Find where the cold is kept. It is kept in the salt, a hundred and fifty metres down, and it has been humming since March.",
    stages: [
      { id: "s1", text: "Somebody wearing Alder's face is asking questions in Middlewich.", hint: "The lock, the festival field, and then the towpath.",
        cond: f("amos_alder_face"), reward: { money: 900, xp: 200 } },
      { id: "s2", text: "Get a Narrowboat Licence off Boatwoman Carys.", hint: "Middlewich boat office, then the practical at Big Lock.",
        cond: f("narrowboat_licence"), reward: { items: [{ id: "elixir", n: 2 }] } },
      { id: "s3", text: "Take the cage down at Winsford.", hint: "Mine-Captain Rhona has the pass and a short speech about lamps.",
        cond: f("mine_descended") },
      { id: "s4", text: "Find out what is humming in the galleries.", hint: "Forty containers, all on the same note, behind a fence with no maker's plate.",
        cond: f("checkpoints_seen"), reward: { xp: 400, marks: 3 } },
      { id: "s5", text: "Beat Foreman Jack and take the DAEMON badge.", hint: "Northwich Gym. The pale floor holds. The rest is a promise nobody made.",
        cond: f("badge_daemon"), reward: { xp: 500, perk: 1 } },
      { id: "s6", text: "Ride the Anderton Boat Lift.", hint: "Fifty feet, fifty seconds, and one tannoy.",
        cond: f("boat_lift_silence"), reward: { xp: 400 } }
    ],
    reward: { money: 3000, xp: 800, perk: 1, items: [{ id: "capsule_kernel", n: 5 }], flags: ["chapter_7_done"] }
  });

  // ------------------------------------------------------------- casebook --
  Q("case_14_deepfake_vicar", {
    name: "The Deepfake Vicar",
    kind: "case", tier: 3, chapter: 7, town: "great_budworth",
    giver: { npc: "npc_great_budworth_elin", map: "great_budworth" },
    summary: "Parishioners are getting video calls from the vicar asking for gift cards. The vicar does not know what a gift card is.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Collect three recordings of the calls.", hint: "Curate Elin has one. The tower has one. The pub has the worst one.",
        cond: { kind: "count", flag: "case_14_recordings", n: 3 } },
      { id: "s2", text: "Compare the recordings with the real vicar.", hint: "Vicar Ffoulkes is in the churchyard, being upset, badly.",
        cond: f("case_14_compared") },
      { id: "s3", text: "Confront the grunt at Northwich market.", hint: "Stall fourteen. It is vacant. He is standing in it anyway.",
        cond: { kind: "defeat", trainer: "tr_northwich_4" } }
    ],
    reward: { money: 1200, marks: 3, xp: 220, items: [{ id: "face_fragment_2", n: 1 }] }
  });

  Q("case_17_brine_of_nantwich", {
    name: "Brine of Nantwich",
    kind: "case", tier: 2, chapter: 6, town: "nantwich",
    giver: { npc: "npc_nantwich_wyn", map: "nantwich" },
    summary: "The brine pool is turning cloudy. Something is dissolving in it, or breeding in it, and Lido Keeper Wyn would like to know which.",
    opens: "chapter >= 6",
    stages: [
      { id: "s1", text: "Take three water samples from the pool.", hint: "A rod, the deep end, and some patience.",
        cond: { kind: "item", id: "brine_sample", n: 3 } },
      { id: "s2", text: "Brew a Clarifier at the elm press.", hint: "Y Berllan. Brine sample plus an apple. It is the first thing Mam-gu teaches anybody.",
        cond: { kind: "item", id: "brew_clarifier", n: 1 } },
      { id: "s3", text: "Pour it in and see what comes up.", hint: "Wyn will hold the ladder and complain about it.",
        cond: f("case_17_poured") }
    ],
    reward: { money: 900, marks: 3, xp: 200, items: [{ id: "brew_clarifier", n: 2 }], flags: ["lido_free_healing"] }
  });

  Q("case_18_nantwich_ram", {
    name: "Nantwich Ram, Missing",
    kind: "case", tier: 2, chapter: 6, town: "nantwich",
    giver: { npc: "npc_nantwich_bethan", map: "nantwich" },
    summary: "A prize ram is gone and the hoofprints go west and do not come back.",
    opens: "chapter >= 6",
    stages: [
      { id: "s1", text: "Photograph the hoofprints and match them to a pen.", hint: "Three pens on the Hack Green lane. Only one has a generator.",
        cond: f("case_18_pen_found") },
      { id: "s2", text: "Deal with the two grunts running the pen.", hint: "They are being paid in vouchers and are not enjoying it.",
        cond: { kind: "defeat", trainer: "tr_route_nantwich_hackgreen_2" } },
      { id: "s3", text: "Let the sheep out.", hint: "Six of them. They have been doing sums for strangers.",
        cond: { kind: "count", flag: "case_18_sheep_freed", n: 6 } }
    ],
    reward: { money: 1000, marks: 3, xp: 220, items: [{ id: "wool_cap", n: 1 }] }
  });

  Q("case_19_middlewich_salt_roads", {
    name: "Middlewich Salt Roads",
    kind: "case", tier: 3, chapter: 7, town: "middlewich",
    giver: { npc: "npc_middlewich_emrys", map: "middlewich" },
    summary: "Three casks of salt, one Roman road, and rain that dissolves the profit.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Take the first cask up the salt road to Northwich.", hint: "Rain means a timer. Dry means a walk.",
        cond: { kind: "count", flag: "case_19_casks", n: 1 } },
      { id: "s2", text: "Two more, and ignore the drone.", hint: "It will try to reroute you. It is wrong, and it is also interesting.",
        cond: { kind: "count", flag: "case_19_casks", n: 3 } },
      { id: "s3", text: "Follow the drone's path instead, once.", hint: "It knows a towpath nobody has mapped.",
        cond: f("case_19_drone_path") }
    ],
    reward: { money: 800, marks: 2, xp: 200, items: [{ id: "salt_lick", n: 3 }] }
  });

  Q("case_20_winsford_flashes", {
    name: "The Winsford Flashes",
    kind: "case", tier: 3, chapter: 7, town: "winsford",
    giver: { npc: "npc_route_middlewich_winsford_lowri", map: "route_middlewich_winsford" },
    summary: "Something big is surfacing in the flashes, and Birder Lowri has a theory she would like disproved.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Fish the three flash sites in the dawn band.", hint: "Top Flash, Bottom Flash, and the one on the Croxton lane. Weighted line or better.",
        cond: { kind: "count", flag: "case_20_flashes", n: 3 } },
      { id: "s2", text: "Bring Lowri what came up.", hint: "It is not the big thing. It is what the big thing shed.",
        cond: f("case_20_hide_found") }
    ],
    reward: { money: 1100, marks: 3, xp: 240, gear: "hide_plate", flags: ["fish_legendary_flashes"] }
  });

  Q("case_21_whistle_test", {
    name: "The Whistle Test",
    kind: "case", tier: 3, chapter: 7, town: "middlewich",
    giver: { npc: "npc_middlewich_osian", map: "middlewich" },
    summary: "Choirmaster Osian needs a chord. Specifically, he needs a CHORDLE, which sings on the third turn and leaves on the second.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Get a Music Box so it cannot run off.", hint: "The festival field. Somebody left one by stage three.",
        cond: { kind: "item", id: "music_box", n: 1 } },
      { id: "s2", text: "Catch a CHORDLE.", hint: "Middlewich after dark. Listen for the one that answers on the beat.",
        cond: { kind: "catch", species: "chordle", n: 1 } },
      { id: "s3", text: "Let Osian hear what it is singing.", hint: "He will recognise it, and he will not be pleased.",
        cond: f("case_21_hymn_heard") }
    ],
    reward: { money: 700, marks: 2, xp: 210, flags: ["overdrive_status_bonus"] }
  });

  Q("case_22_lift_logic", {
    name: "Lift Logic",
    kind: "case", tier: 3, chapter: 7, town: "anderton",
    giver: { npc: "npc_anderton_beth", map: "anderton" },
    summary: "The caissons are out of balance, and one of the crates in the queue is not on the manifest.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Balance the first two rounds.", hint: "Left tonnes, right tonnes, difference nothing.",
        cond: { kind: "count", flag: "case_22_rounds", n: 2 } },
      { id: "s2", text: "The third round has a hidden weight in it.", hint: "Crate seven. Photograph it before you decide.",
        cond: f("case_22_crate_seen") },
      { id: "s3", text: "Ship it, or fail the round on purpose so it gets inspected.", hint: "Beth will not tell you which. Beth is watching, though.",
        cond: f("case_22_shipped || case_22_failed") }
    ],
    reward: { money: 1000, marks: 3, xp: 240, flags: ["anderton_ferry"] }
  });

  Q("case_25_weaver_hall_ghost", {
    name: "The Weaver Hall Ghost",
    kind: "case", tier: 3, chapter: 7, town: "northwich",
    giver: { npc: "npc_northwich_hall_mari", map: "northwich_weaver_hall" },
    summary: "Museum objects move at closing time, always along the same line, always towards the back stair.",
    opens: "chapter >= 7",
    stages: [
      { id: "s1", text: "Three night visits. Note where things have moved to.", hint: "Sleep at the Salt Barge if the clock will not oblige.",
        cond: { kind: "count", flag: "case_25_nights", n: 3 } },
      { id: "s2", text: "Follow the line to the back stair.", hint: "It is not a fire exit. It is a mine.",
        cond: f("case_25_stair_found") },
      { id: "s3", text: "Carry the pup back down to the lair.", hint: "It is small, it is wet, and it is homesick.",
        cond: f("case_25_pup_returned") }
    ],
    reward: { money: 1300, marks: 4, xp: 260, items: [{ id: "salt_lantern", n: 1 }], flags: ["terrataur_one_less_phase"] }
  });

  Q("case_30_elm_press", {
    name: "Y Berllan: The Elm Press",
    kind: "case", tier: 5, chapter: 6, town: "y_berllan",
    giver: { npc: "npc_y_berllan_mamgu", map: "y_berllan" },
    summary: "The press has run on a cracked bed plate since 1974 and cannot take a full pressing. Three parts, three counties, and the last one has to be asked for in Welsh.",
    opens: "brewing_open",
    stages: [
      { id: "s1", text: "A cast plate from the Crewe works yard.", hint: "Ask a yardmaster who likes being asked.",
        cond: f("case_30_plate") },
      { id: "s2", text: "An elm beam from Delamere.", hint: "Forester Owain will want to know what it is for and will approve.",
        cond: f("case_30_beam") },
      { id: "s3", text: "A screw thread cut at Northwich.", hint: "Ask in Welsh. The man who cuts it will only discuss it in Welsh, and he is right to.",
        cond: f("case_30_thread") },
      { id: "s4", text: "Press a full pressing.", hint: "It takes both of you and it takes an hour.",
        cond: f("case_30_pressed") }
    ],
    reward: { money: 2000, marks: 6, xp: 500, perk: 1, flags: ["brew_tier_3", "nino_letter_final_hint"] }
  });
})();
