// =============================================================
// MonsterQuest v2 — quest definitions for the EAST region:
// the Chapter 1 and Chapter 2 main quests, and the six Casebook cases
// that are set in this region (SIDE-CONTENT §1 cases 1, 2, 3, 4, 5, 7).
// Ids per DESIGN-INDEX §12: main_<nn>_<slug> and case_<nn>_<slug>.
// Registration only. Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  function Q(id, def) { D.define("quests", id, def); }

  // ---------------------------------------------------------- main quests --
  Q("main_01_silk_and_static", {
    name: "Silk and Static",
    kind: "main", chapter: 1, town: "macclesfield",
    giver: { npc: "npc_macclesfield_alder", map: "macclesfield_alder_labs" },
    summary: "Dr Wren Alder has a contract, three capsules and a signal she says she has had looked at.",
    stages: [
      { id: "s1", text: "Take the Alder Labs contract and pick a line.", hint: "Alder Labs, off Park Green.",
        cond: { kind: "flag", expr: "contract_signed" } },
      { id: "s2", text: "Ask Alder what she actually wants looked at.", hint: "Talk to Dr Alder at the labs.",
        cond: { kind: "flag", expr: "alder_briefed" } },
      { id: "s3", text: "Get up White Nancy and watch the wildlife, not the dashboard.", hint: "Bollington, then Kerridge Hill.",
        cond: { kind: "flag", expr: "white_nancy_seen" },
        reward: { xp: 120, items: [{ id: "capsule_mesh", n: 5 }] } },
      { id: "s4", text: "VEX is waiting on the canal and has been for some time.", hint: "The Macclesfield Canal towpath.",
        cond: { kind: "defeat", trainer: "vex_1" },
        reward: { money: 900 } },
      { id: "s5", text: "Tell Alder what you saw and listen to how she says she's had it looked at.", hint: "Alder Labs.",
        cond: { kind: "flag", expr: "alder_denied" } }
    ],
    reward: { money: 1200, xp: 200, perk: 1, items: [{ id: "capsule_basic", n: 10 }], flags: ["chapter_1_done"] }
  });

  Q("main_02_the_wheel_and_the_edge", {
    name: "The Wheel and the Edge",
    kind: "main", chapter: 2, town: "wilmslow",
    giver: { npc: "npc_wilmslow_ada", map: "wilmslow_gym_floor" },
    summary: "A fifty-tonne waterwheel is being driven at three in the morning, and it is not being driven by the river.",
    stages: [
      { id: "s1", text: "Find out why Quarry Bank's wheel turns at 3am.", hint: "Styal — the wheelhouse. Set the sluices top, bottom, middle.",
        cond: { kind: "flag", expr: "wheel_fridge_fixed" },
        reward: { money: 700, items: [{ id: "elixir", n: 2 }] } },
      { id: "s2", text: "Follow the Stuffers' throughput out onto Lindow Moss.", hint: "West of Wilmslow, along the boardwalk.",
        cond: { kind: "flag", expr: "lindow_lake_seen" } },
      { id: "s3", text: "Beat Sysadmin Ada and take the PACKET badge.", hint: "Wilmslow Gym — patch the three panels first.",
        cond: { kind: "flag", expr: "badge_packet" },
        reward: { xp: 400, perk: 1 } },
      { id: "s4", text: "Dawn on Stormy Point. Somebody is waiting.", hint: "Alderley Edge, at first light.",
        cond: { kind: "flag", expr: "elis_met" } },
      { id: "s5", text: "Look into the mine mouth and do not follow what is sitting in it.", hint: "The Edge, above the copper workings.",
        cond: { kind: "flag", expr: "merlynx_seen" } }
    ],
    reward: { money: 2000, xp: 500, perk: 1, items: [{ id: "capsule_net", n: 5 }], flags: ["chapter_2_done"] }
  });

  // ------------------------------------------------------------- casebook --
  Q("case_01_silk_thread", {
    name: "The Silk Thread",
    kind: "case", tier: 1, chapter: 1, town: "macclesfield",
    giver: { npc: "npc_macclesfield_bronwen", map: "macclesfield" },
    summary: "Forty years of silk moths in the mill garden, and then one Tuesday, none.",
    stages: [
      { id: "s1", text: "Catch a SPINDRAKE. They only fly after dark.", hint: "Route tall grass at night — the canal or the Bollin lane.",
        cond: { kind: "catch", species: "spindrake", n: 1 } },
      { id: "s2", text: "Show Bronwen the moth.", hint: "Paradise Mill, Macclesfield.",
        cond: { kind: "talk", npc: "npc_macclesfield_bronwen" } },
      { id: "s3", text: "Get on the mill roof and cut the blue cable, not the red one.", hint: "Talk to Bronwen again.",
        cond: { kind: "flag", expr: "case_01_trap_off" } }
    ],
    reward: { money: 600, gear: "silk_wrap", marks: 2, xp: 90 }
  });

  Q("case_02_white_nancys_watch", {
    name: "White Nancy's Watch",
    kind: "case", tier: 1, chapter: 1, town: "bollington",
    giver: { npc: "npc_bollington_kev", map: "bollington" },
    summary: "Somebody is repainting the folly at night, and the shape they keep painting is not a code — it just looks like one.",
    stages: [
      { id: "s1", text: "Get up Kerridge Hill at dusk or after dark.", hint: "Sleep at the inn if the light beats you.",
        cond: { kind: "flag", expr: "kerridge_painter_talked" } },
      { id: "s2", text: "Decide what to do about the lad with the paint tin.", hint: "Report him, or help him finish.",
        cond: { kind: "flag", expr: "case_02_helped || case_02_reported" } }
    ],
    reward: { money: 400, marks: 2, xp: 80, trust: { cat: "meadow", n: 1 } }
  });

  Q("case_03_middlewood_escort", {
    name: "Middlewood Way Escort",
    kind: "case", tier: 1, chapter: 1, town: "bollington",
    giver: { npc: "npc_bollington_priya", map: "bollington" },
    summary: "Priya wants a witness for her personal best. What she actually wants is company in the cutting after dark.",
    stages: [
      { id: "s1", text: "Walk the Middlewood Way with Priya. She stops. Things come off the banks.", hint: "Route: Bollington to Poynton.",
        cond: { kind: "flag", expr: "case_03_done" } },
      { id: "s2", text: "Ask her what is in the pannier.", hint: "Bollington, after the escort.",
        cond: { kind: "talk", npc: "npc_bollington_priya" } }
    ],
    reward: { money: 900, marks: 3, xp: 120 }
  });

  Q("case_04_wizards_well", {
    name: "The Wizard's Well",
    kind: "case", tier: 2, chapter: 2, town: "alderley_edge",
    giver: { npc: "npc_alderley_elis", map: "alderley_edge" },
    summary: "Something is stirring the water at the Wizard's Well, and the man who knows why answers questions with better questions.",
    stages: [
      { id: "s1", text: "Read the three inscriptions in order: Stormy Point, Castle Rock, the Well.", hint: "Walk them in that order; not another.",
        cond: { kind: "flag", expr: "case_04_readings_done" } },
      { id: "s2", text: "Go down to the copper workings with Miner-Warden Gwil.", hint: "The mine mouth above Stormy Point.",
        cond: { kind: "flag", expr: "merlynx_glimpse" } },
      { id: "s3", text: "Photograph the claw marks. Both sets.", hint: "The far side of the flooded shaft.",
        cond: { kind: "flag", expr: "merlynx_seen" } }
    ],
    reward: { gear: "davy_lamp", marks: 4, xp: 220, flags: ["photo_mode"] }
  });

  Q("case_05_quarry_bank_overtime", {
    name: "Quarry Bank Overtime",
    kind: "case", tier: 2, chapter: 2, town: "styal",
    giver: { npc: "npc_styal_enid", map: "styal" },
    summary: "The fridge is out of the wheelhouse and the wheel is still being throttled. Three sluice gates upstream, three explanations.",
    stages: [
      { id: "s1", text: "Trace the first sluice gate upstream.", hint: "The Bollin, above the mill.",
        cond: { kind: "flag", expr: "case_05_gate_1" } },
      { id: "s2", text: "The second gate. The 'attacker' is the mill's own scheduling app.", hint: "Nobody is to blame and everybody signed it off.",
        cond: { kind: "flag", expr: "case_05_gate_2" } },
      { id: "s3", text: "The third gate, and then tell Enid.", hint: "Styal.",
        cond: { kind: "flag", expr: "case_05_gate_3" } }
    ],
    reward: { money: 700, items: [{ id: "tm_torrent", n: 1 }], marks: 3, xp: 200 }
  });

  Q("case_07_poynton_pool_ledger", {
    name: "Poynton Pool Ledger",
    kind: "case", tier: 1, chapter: 1, town: "poynton",
    giver: { npc: "npc_poynton_doug", map: "poynton" },
    summary: "Three catches, written in the ledger, and one of them is wearing somebody else's tag.",
    stages: [
      { id: "s1", text: "Land a common fish from Poynton Pool.", hint: "Any rod. The pool is honest.",
        cond: { kind: "catch", species: "puddlish", n: 1 } },
      { id: "s2", text: "Land an uncommon one.", hint: "Perchip, off the deep side by the jetty.",
        cond: { kind: "catch", species: "perchip", n: 1 } },
      { id: "s3", text: "Land the rare one on Doug's weighted line.", hint: "Torrentide. Patience, and the weighted line.",
        cond: { kind: "catch", species: "torrentide", n: 1 },
        reward: { flags: ["case_07_done"] } }
    ],
    reward: { gear: "rod_weighted", items: [{ id: "brew_bait_tin", n: 1 }], marks: 2, xp: 110 }
  });
})();
