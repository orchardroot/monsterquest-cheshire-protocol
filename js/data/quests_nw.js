// =============================================================
// MonsterQuest v2 — quest definitions for the NORTH-WEST region:
// the Chapter 8-12 main quests, the post-game, and the six Casebook
// cases set between Delamere and Parkgate (SIDE-CONTENT §1: 23, 24,
// 26, 27, 28, 29).
// Ids per DESIGN-INDEX §9: main_<nn>_<slug> and case_<nn>_<slug>.
// Registration only. Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;
  function Q(id, def) { D.define("quests", id, def); }
  function f(expr) { return { kind: "flag", expr: expr }; }

  // ---------------------------------------------------------- main quests --
  Q("main_08_the_ruin", {
    name: "The Ruin",
    kind: "main", chapter: 8, town: "delamere_forest",
    giver: { npc: "npc_delamere_owain", map: "delamere_forest" },
    summary: "VEX has stopped answering. The last anybody saw, they went up the Sandstone Trail towards a ruin on a crag.",
    stages: [
      { id: "s1", text: "Cross Delamere and find out which way VEX went.", hint: "The forest hub — ask the rangers and the racers.",
        cond: f("vex_missing") },
      { id: "s2", text: "Follow the trail through Tarporley to Beeston Castle.", hint: "South on the Sandstone Trail, then the Bunbury locks.",
        cond: { kind: "reach", map: "beeston_castle" },
        reward: { money: 1400, items: [{ id: "capsule_root", n: 5 }] } },
      { id: "s3", text: "Stop VEX releasing their starter off the castle wall.", hint: "The inner ward. The wall walk. The wind.",
        cond: f("vex_release_stopped") },
      { id: "s4", text: "There are two of them. Decide how you are going to know which.", hint: "Verify with the word from the train, or challenge them both.",
        cond: f("choice_vex"),
        reward: { xp: 600, perk: 1 } },
      { id: "s5", text: "Open the well and read what DARKBYTE left in it.", hint: "BIGBOY's shove and the Davy Lamp. Three hundred and seventy feet.",
        cond: f("beeston_well_note") }
    ],
    reward: { money: 3000, xp: 900, items: [{ id: "full_restore", n: 2 }], flags: ["chapter_8_done"] },
    tracks: true
  });

  Q("main_09_bridge_traffic", {
    name: "Bridge Traffic",
    kind: "main", chapter: 9, town: "frodsham",
    giver: { npc: "npc_frodsham_root", map: "frodsham" },
    summary: "ROOT is on a bench above the estuary with an invoice, and there is a datacentre on the far bank with no name on the door.",
    stages: [
      { id: "s1", text: "Hear ROOT out on the memorial bench at dusk.", hint: "Frodsham, above the town, when the light goes.",
        cond: f("root_bench_talk"), reward: { items: [{ id: "stack_lanyard", n: 1 }] } },
      { id: "s2", text: "Beat Chemist Ria and take the PROXY badge and the goggles.", hint: "Runcorn Gym. Sash down.",
        cond: f("badge_proxy"), reward: { xp: 700, perk: 1 } },
      { id: "s3", text: "Darken all six fog fridges across Runcorn.", hint: "Halton Brow, six identical kitchens.",
        cond: { kind: "flag", expr: "runcorn_fog_fridges >= 6", n: 6, counter: "runcorn_fog_fridges" } },
      { id: "s4", text: "Clear the Mersey Gateway.", hint: "The chokepoint. There is no footway. Go anyway.",
        cond: f("gateway_cleared"), reward: { money: 2400 } },
      { id: "s5", text: "Get into THE STACK and open all eight doors.", hint: "Daresbury campus. The doors release to your badges, in order.",
        cond: { kind: "flag", expr: "stack_doors_opened >= 8", n: 8, counter: "stack_doors_opened" } },
      { id: "s6", text: "Pull the breaker.", hint: "Past hall eight. It is not locked. It has never been locked.",
        cond: f("plug_pulled"), reward: { xp: 900, items: [{ id: "stack_schematics", n: 1 }] } }
    ],
    reward: { money: 4000, xp: 1200, perk: 1, flags: ["chapter_9_done"] },
    tracks: true
  });

  Q("main_10_draw_your_own_conclusions", {
    name: "Draw Your Own Conclusions",
    kind: "main", chapter: 10, town: "warrington",
    giver: { npc: "npc_warrington_mo", map: "warrington_gym" },
    summary: "Netrunner Mo is getting alerts from a system that is physically unplugged, and the letters on her whiteboard are yours.",
    stages: [
      { id: "s1", text: "Get to Warrington along the Bridgewater.", hint: "Lymm, the dam, the towpath under Thelwall.",
        cond: { kind: "reach", map: "warrington" } },
      { id: "s2", text: "Hear what Mo's NOC is seeing.", hint: "The gym. Ask before you fight; she would rather talk.",
        cond: f("mo_alerts") },
      { id: "s3", text: "Take the last phase of the gym out onto the transporter gondola.", hint: "A hundred feet of air makes people honest.",
        cond: f("transporter_phase") },
      { id: "s4", text: "Beat Netrunner Mo and take the ADMIN badge.", hint: "Land something they cannot resist and your agents come back.",
        cond: f("badge_admin"), reward: { xp: 900, perk: 1 } },
      { id: "s5", text: "Read the whiteboard properly.", hint: "It is spelling something out of your own last words.",
        cond: f("grin_remained") },
      { id: "s6", text: "Jodrell Bank has reopened. The dish has turned.", hint: "It is pointing at Cheshire. It is pointing at you.",
        cond: f("jodrell_open"), reward: { money: 3000 } }
    ],
    reward: { money: 5000, xp: 1500, perk: 1, flags: ["chapter_10_done", "all_badges"] },
    tracks: true
  });

  Q("main_11_the_sky_is_quiet", {
    name: "The Sky Is Quiet",
    kind: "main", chapter: 11, town: "jodrell_bank",
    giver: { npc: "npc_jodrell_root", map: "jodrell_bank" },
    summary: "End it. The dish is re-aiming, the knights ORACLE gathered are standing in the bowl, and ROOT would like to lose.",
    stages: [
      { id: "s1", text: "Get past the gate and into the control room.", hint: "Jodrell Bank. The grounds, the arboretum, the door that used to be shut.",
        cond: { kind: "reach", map: "jodrell_bank_control_room" } },
      { id: "s2", text: "Fight ROOT. Notice what she leaves out.", hint: "She wants to lose. Let her do it with some dignity.",
        cond: f("root_defeated"), reward: { xp: 1200 } },
      { id: "s3", text: "Climb the gantries while the dish turns.", hint: "The tower. Do not look down and do not look up.",
        cond: f("glitchra_defeated"), reward: { items: [{ id: "capsule_root", n: 10 }] } },
      { id: "s4", text: "Hear ORACLE out. Then give it your name.", hint: "It speaks in your log format because it learnt to write from you.",
        cond: f("oracle_you_came_back") },
      { id: "s5", text: "Decide: delete, quarantine, or take custody.", hint: "There is no clean answer and the game will not pretend there is.",
        cond: f("choice_plug"), reward: { xp: 2000, perk: 2 } }
    ],
    reward: { money: 8000, xp: 2500, flags: ["chapter_11_done"] },
    tracks: true
  });

  Q("main_12_the_firewall", {
    name: "THE FIREWALL",
    kind: "main", chapter: 12, town: "chester",
    giver: { npc: "npc_chester_league", map: "chester" },
    summary: "Two miles of Roman wall at dusk, four perimeter checks, and somebody in the amphitheatre who has been waiting since Macclesfield.",
    stages: [
      { id: "s1", text: "Present yourself at the walls with all eight badges.", hint: "Chester. The Northgate stair, at dusk.",
        cond: { kind: "reach", map: "chester_walls" } },
      { id: "s2", text: "Pass Sue: no borrowed strength.", hint: "Nothing ORACLE-tuned. Nothing tagged.",
        cond: f("whitehat_sue"), reward: { xp: 900 } },
      { id: "s3", text: "Pass Raj: nothing unpatched.", hint: "Full health, no status, all of them. The Care centre is ninety seconds away.",
        cond: f("whitehat_raj"), reward: { xp: 900 } },
      { id: "s4", text: "Pass Kim: nothing in the bag she cannot account for.", hint: "King Charles' Tower. You get it all back.",
        cond: f("whitehat_kim"), reward: { xp: 900 } },
      { id: "s5", text: "Pass Doc: no single point of failure.", hint: "Four species. Four different type profiles. A team, not a hobby.",
        cond: f("whitehat_doc"), reward: { xp: 900, perk: 1 } },
      { id: "s6", text: "The amphitheatre. Both cats. Both of you.", hint: "Nemesis was at the north entrance on purpose.",
        cond: f("champion_fought"), reward: { xp: 4000 } }
    ],
    reward: { money: 20000, xp: 5000, perk: 2, title: "Principal", flags: ["chapter_12_done", "postgame_open"] },
    tracks: true
  });

  Q("main_13_fifth_pulse", {
    name: "The Fifth Pulse",
    kind: "main", chapter: 13, town: "ince_marshes",
    giver: { npc: "npc_ince_ith", map: "ince_marshes" },
    summary: "Something is pulsing from the west, past Y Berllan, out at sea. Everything that was waiting has started waiting differently.",
    stages: [
      { id: "s1", text: "Hear the fifth pulse at the Ince listening post.", hint: "Waders. Reeds. A notebook in a sandwich box.",
        cond: f("fifth_pulse") },
      { id: "s2", text: "Find the thirty-ninth penguin.", hint: "Chester Zoo. She only answers to Welsh.",
        cond: f("penguin_case"), reward: { money: 3000 } },
      { id: "s3", text: "Board the boat that is not on the register.", hint: "Ellesmere Port, the far basin, after dark.",
        cond: f("ellesmere_mirror") },
      { id: "s4", text: "Go down into THE STACK, cold.", hint: "Five floors. The fog is knee-deep. Floor five is warmer than floor four.",
        cond: f("amos_jim_face"), reward: { xp: 4000, items: [{ id: "full_restore", n: 5 }] } },
      { id: "s5", text: "Let the county tell you what it does now.", hint: "Lymm's pumps, the Edge, the Roodee, the last letter at Y Berllan.",
        cond: f("nino_letter_final") }
    ],
    reward: { money: 15000, xp: 8000, perk: 3, flags: ["chapter_13_done"] },
    tracks: true
  });

  // ------------------------------------------------------------- casebook --
  Q("case_23_frodsham_beacon", {
    name: "Frodsham Hill Beacon",
    kind: "case", tier: 4, chapter: 9, town: "frodsham",
    giver: { npc: "npc_frodsham_ivor", map: "frodsham" },
    summary: "There has been a beacon on that hill since the Armada and Ivor would like it lit for a good reason for once.",
    stages: [
      { id: "s1", text: "Bring three kinds of timber out of Delamere.", hint: "Oak, pine and birch. The forest floor is full of it.",
        cond: { kind: "item", id: "timber_oak", n: 1 } },
      { id: "s2", text: "Bring pine and birch as well.", hint: "The night glade and the Whitegate Way.",
        cond: { kind: "item", id: "timber_pine", n: 1 } },
      { id: "s3", text: "Light it with a Fire type, at night, and not in the rain.", hint: "Three conditions. The weather is the hard one.",
        cond: { kind: "flag", expr: "beacon_lit_frodsham_hill" } }
    ],
    reward: { money: 1600, gear: "beacon_ember", marks: 3, xp: 400 }
  });

  Q("case_24_runcorn_gauntlet", {
    name: "Runcorn Bridge Gauntlet",
    kind: "case", tier: 4, chapter: 9, town: "runcorn",
    giver: { npc: "npc_runcorn_cerys", map: "runcorn" },
    summary: "Six spans, six trainers, no healing in between, and every one you beat is a fridge that goes dark tonight.",
    stages: [
      { id: "s1", text: "Take Bridge Warden Cerys's rules and start the walkway.", hint: "The Silver Jubilee Bridge, on foot.",
        cond: { kind: "flag", expr: "case_24_started" } },
      { id: "s2", text: "Beat all six.", hint: "The sixth one has their hood up.",
        cond: { kind: "flag", expr: "runcorn_fog_fridges >= 6", n: 6, counter: "runcorn_fog_fridges" } },
      { id: "s3", text: "Tell Cerys it is done.", hint: "She will be at the north tower, watching the fog go out.",
        cond: { kind: "talk", npc: "npc_runcorn_cerys" } }
    ],
    reward: { money: 1500, marks: 4, xp: 500, flags: ["arena_open"] }
  });

  Q("case_26_delamere_watch", {
    name: "Delamere Watch",
    kind: "case", tier: 3, chapter: 8, town: "delamere_forest",
    giver: { npc: "npc_delamere_owain", map: "delamere_forest" },
    summary: "Twelve sightings across the forest. Three of them only turn up at weekends and Owain cannot explain that either.",
    stages: [
      { id: "s1", text: "Photograph twelve sightings across Delamere.", hint: "Blakemere, the trails, the Old Pale, the night glade.",
        cond: { kind: "flag", expr: "case_26_sightings >= 12", n: 12, counter: "case_26_sightings" } },
      { id: "s2", text: "Look at the twelfth one properly.", hint: "It is your own reflection in Blakemere Moss. You are not alone in it.",
        cond: { kind: "flag", expr: "case_26_reflection" } },
      { id: "s3", text: "Take it back to Owain.", hint: "The ranger hut, on the main ride.",
        cond: { kind: "talk", npc: "npc_delamere_owain" } }
    ],
    reward: { money: 1200, gear: "field_notebook", marks: 3, xp: 400 }
  });

  Q("case_27_lymm_reflection", {
    name: "Lymm Dam Reflection",
    kind: "case", tier: 4, chapter: 10, town: "lymm",
    giver: { npc: "npc_lymm_rhian", map: "lymm" },
    summary: "Rhian paints the same water four times a day. She would like a fifth opinion and she is frightened of the night one.",
    stages: [
      { id: "s1", text: "Photograph the dam at dawn, day, dusk and night.", hint: "Four slots. The Inn skips a band if you are impatient.",
        cond: { kind: "flag", expr: "case_27_slots >= 4", n: 4, counter: "case_27_slots" } },
      { id: "s2", text: "Look at the night one again.", hint: "There is a fifth figure on the dam and it is not made of anything.",
        cond: { kind: "flag", expr: "glitchra_sighting" } },
      { id: "s3", text: "Show Rhian.", hint: "She is on the dam path, and she has stopped painting.",
        cond: { kind: "talk", npc: "npc_lymm_rhian_dam" } }
    ],
    reward: { money: 1000, marks: 3, xp: 400, items: [{ id: "ghost_lens", n: 1 }] }
  });

  Q("case_28_wire_arcade", {
    name: "Warrington Wire Arcade",
    kind: "case", tier: 4, chapter: 10, town: "warrington",
    giver: { npc: "npc_warrington_sian", map: "warrington_arcade" },
    summary: "Twelve cabinets, eleven honest. Beat the honest ones and the twelfth will introduce itself.",
    stages: [
      { id: "s1", text: "Take Bronze on three cabinets.", hint: "Packet Run, Salt Rush, Type Trainer.",
        cond: { kind: "flag", expr: "case_28_cabinets >= 3", n: 3, counter: "case_28_cabinets" } },
      { id: "s2", text: "Refuse the kiosk three times.", hint: "It gets nicer each time. That is the tell.",
        cond: { kind: "flag", expr: "case_28_refusals >= 3", n: 3, counter: "case_28_refusals" } },
      { id: "s3", text: "Play the fourth cabinet.", hint: "It was behind the kiosk the whole time.",
        cond: { kind: "flag", expr: "case_28_fourth" } }
    ],
    reward: { money: 1400, marks: 3, xp: 450, items: [{ id: "arcade_pass", n: 1 }, { id: "cat_bell", n: 1 }] }
  });

  Q("case_29_chester_walls", {
    name: "Chester Walls Round",
    kind: "case", tier: 5, chapter: 12, town: "chester",
    giver: { npc: "npc_chester_idris", map: "chester" },
    summary: "Two miles, eight checkpoints, without once leaving the wall. Watchman Idris has been asking people for forty years.",
    stages: [
      { id: "s1", text: "Hit all eight checkpoints without leaving the wall.", hint: "King Charles', Phoenix, Eastgate, Newgate, Bridgegate, Watergate, Water Tower, Northgate.",
        cond: { kind: "flag", expr: "case_29_checkpoints >= 8", n: 8, counter: "case_29_checkpoints" } },
      { id: "s2", text: "Read the note pinned at the Water Tower.", hint: "It is in a hand you last saw on a bench above an estuary.",
        cond: { kind: "flag", expr: "case_29_note" } },
      { id: "s3", text: "Take it to Idris.", hint: "He will not be surprised, and that will be the worst part.",
        cond: { kind: "talk", npc: "npc_chester_idris" } }
    ],
    reward: { money: 2000, marks: 5, xp: 700, perk: 1, title: "Wallwalker" }
  });
})();
