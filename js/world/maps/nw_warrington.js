// =============================================================
// MonsterQuest v2 — WARRINGTON (region mersey, Ch.10) — Gym 8, ADMIN.
// Big, brash, wired: the Golden Gates, a market that has been here since
// 1255, a transporter bridge that carries nothing to nowhere, an arcade
// with a cabinet that lies, and Netrunner Mo's NOC upstairs of all of it.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const T = NW.town();

  // --------------------------------------------------------------- town ---
  const c = B.canvas(60, 44, ".");
  B.frame(c, "T", 1);
  for (let x = 0; x < 60; x++) c.set("o", x, 0, "y");
  c.fill("g", 0, 26, 2, 4, "r");
  c.fill("g", 58, 20, 2, 4, "r");
  c.fill("g", 2, 2, 56, 40, ",");

  // the Mersey along the south, and the transporter bridge over it
  c.fill("g", 2, 36, 56, 5, "!");
  c.fill("g", 2, 35, 56, 1, "e");
  c.fill("g", 2, 41, 56, 1, "e");
  c.fill("g", 20, 33, 3, 3, "1");
  c.fill("g", 20, 30, 3, 3, "-");
  c.set("g", 19, 34, "8"); c.set("g", 23, 34, "8");
  c.set("g", 40, 38, "J");

  // the main street grid
  c.fill("g", 2, 20, 56, 4, "r");
  c.fill("g", 2, 21, 56, 1, "|");
  c.fill("g", 2, 19, 56, 1, "-");
  c.fill("g", 2, 24, 56, 1, "-");
  c.fill("g", 26, 2, 4, 18, "r");
  c.fill("g", 27, 2, 1, 18, "|");
  c.fill("g", 25, 2, 1, 18, "-");
  c.fill("g", 30, 2, 1, 18, "-");
  c.fill("g", 26, 25, 4, 10, "r");
  c.fill("g", 27, 25, 1, 10, "|");
  c.fill("g", 25, 25, 1, 10, "-");
  c.fill("g", 30, 25, 1, 10, "-");
  c.fill("g", 24, 19, 8, 6, "z");
  for (let x = 5; x < 58; x += 7) { c.set("g", x, 19, "L"); c.set("g", x + 3, 24, "L"); }
  c.set("g", 8, 24, "O"); c.set("g", 44, 19, "u"); c.set("g", 52, 24, "U");
  c.set("g", 16, 24, "H"); c.set("g", 17, 24, "I");

  // ---- the Golden Gates and the Town Hall, west of the crossroads ------
  c.fill("g", 3, 3, 21, 16, "=");
  c.fill("g", 6, 5, 15, 1, "F");
  c.fill("g", 12, 5, 3, 1, "g");
  c.fill("g", 6, 6, 15, 8, ",");
  B.house(c, { x: 8, y: 7, w: 11, h: 6, rh: 2, roof: "R", wall: "$", win: "W", door: "D", doorX: 5, over: ";" });
  c.set("g", 13, 14, "9");
  c.fill("g", 12, 14, 3, 5, "_");
  c.set("g", 11, 6, "M"); c.set("g", 19, 6, "M");
  c.fill("g", 3, 15, 20, 4, '"');
  B.trees(c, "wa-th", 12, 3, 15, 20, 4, "T", "y", ['"']);
  c.set("g", 5, 15, "N"); c.fill("g", 4, 16, 1, 3, '"');

  // ---- the market and the arcade, east of the crossroads ---------------
  c.fill("g", 32, 3, 26, 16, "=");
  c.fill("g", 34, 5, 22, 10, "_");
  for (let i = 0; i < 5; i++) {
    c.fill("g", 35 + i * 4, 6, 3, 1, "A"); c.fill("o", 35 + i * 4, 5, 3, 1, "a");
    c.fill("g", 35 + i * 4, 10, 3, 1, "A"); c.fill("o", 35 + i * 4, 9, 3, 1, "a");
  }
  c.fill("g", 34, 13, 22, 1, "]");
  c.set("g", 33, 8, "N");
  B.house(c, { x: 34, y: 15, w: 10, h: 4, rh: 1, roof: "1", wall: "0", win: "V", door: "S", doorX: 4 });
  c.set("g", 33, 18, "N");
  B.house(c, { x: 47, y: 15, w: 9, h: 4, rh: 1, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 46, 18, "N");

  // ---- south of the street: the gym, the arena, the station ------------
  c.fill("g", 2, 25, 56, 10, "=");
  B.house(c, { x: 4, y: 27, w: 14, h: 7, rh: 2, roof: "1", wall: "0", win: "V", door: "S", doorX: 6 });
  c.set("g", 3, 31, "N");
  c.set("g", 5, 27, "3"); c.set("g", 16, 27, "3");
  B.house(c, { x: 34, y: 27, w: 12, h: 7, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 5, over: ";" });
  c.set("g", 33, 31, "N");
  B.house(c, { x: 48, y: 27, w: 9, h: 5, rh: 2, roof: "R", wall: "$", win: "W", door: "S", doorX: 4, over: ";" });
  c.set("g", 47, 30, "N");
  // Bank Quay station in the far west
  c.fill("g", 2, 27, 1, 8, "4");
  B.house(c, { x: 2, y: 33, w: 1, h: 1, rh: 0, roof: ".", wall: ".", win: null, door: ".", doorX: 0 });
  c.fill("g", 3, 35, 14, 1, ",");
  B.house(c, { x: 4, y: 35, w: 1, h: 1, rh: 0, roof: ".", wall: ".", win: null, door: ".", doorX: 0 });
  c.fill("g", 6, 20, 1, 15, "-");
  c.set("g", 24, 34, "N");
  // Walton Gardens, in the south-east
  c.fill("g", 47, 33, 11, 3, '"');
  B.trees(c, "wa-walton", 10, 47, 33, 11, 3, "T", "y", ['"']);
  c.set("g", 52, 34, "9");

  W.defineMap("warrington", {
    name: "Warrington", region: "mersey", outdoor: true, music: "town_warrington", weatherZone: "mersey",
    ambience: "town", dialogue: "town_warrington",
    legend: T, layers: c.layers(),
    spawnPoint: { x: 28, y: 22 },
    healPoint: { x: 40, y: 25 },
    landmark: { name: "Warrington", x: 28, y: 21 },
    encounters: { grass: "warrington_grass", water: "warrington_water" },
    fishing: "fish_runcorn",
    warps: [].concat(
      NW.edge(0, 26, 4, false, "route_warrington_daresbury", 54, 17, "left"),
      NW.edge(59, 20, 4, false, "route_lymm_warrington", 54, 17, "right"),
      NW.exit(11, 33, "warrington_gym", 12, 26, "up"),
      NW.exit(39, 33, "warrington_care", 7, 10, "up"),
      NW.exit(52, 31, "warrington_mart", 6, 8, "up"),
      NW.exit(38, 18, "warrington_arcade", 14, 22, "up"),
      NW.exit(51, 18, "warrington_arena", 14, 26, "up"),
      [
        { x: 13, y: 12, to: "warrington_town_hall", tx: 12, ty: 18, dir: "up", kind: "door" },
        { x: 21, y: 30, to: "warrington_gym_gondola", tx: 10, ty: 22, dir: "up", kind: "lift", cond: "transporter_phase" },
        { x: 4, y: 34, to: "warrington_station", tx: 8, ty: 10, dir: "up", kind: "door" },
        { x: 5, y: 34, to: "warrington_station", tx: 8, ty: 10, dir: "up", kind: "door" }
      ]
    ),
    signs: [
      { x: 5, y: 15, text: ["THE GOLDEN GATES", "Made for Sandringham, refused by the Queen, given to Warrington instead, and Warrington has never once let anybody forget it."] },
      { x: 33, y: 8, text: ["WARRINGTON MARKET — chartered 1255.", "Eleven card readers, one of which Marge trusts, and she will tell you which and why."] },
      { x: 33, y: 18, text: ["THE WIRE ARCADE", "Twelve cabinets. One kiosk. The kiosk would like a word and you should not give it one."] },
      { x: 46, y: 18, text: ["THE ARENA — TIERS: BRONZE, SILVER, GOLD, PLATINUM, OBSIDIAN.", "Engagement rules displayed at the desk. No, they are not negotiable. Yes, people try."] },
      { x: 3, y: 31, text: ["WARRINGTON GYM — NETWORK OPERATIONS CENTRE", "HOUSE RULE: SEV-ONE IN PROGRESS. EVERY AGENT IS JAMMED UNTIL YOU LAND SOMETHING THEY CANNOT RESIST.",
        "Badge: ADMIN. Leader: Netrunner Mo. Phase three is not held indoors."] },
      { x: 33, y: 31, text: ["CARE CENTRE — WARRINGTON", "Biggest in the borough and the quietest room in it."] },
      { x: 47, y: 30, text: ["WARRINGTON MART — bulk everything, and a queue that moves."] },
      { x: 24, y: 34, text: ["THE TRANSPORTER BRIDGE — 1916. Grade II* listed. Out of use since 1964.",
        "It carried lorries across a river in a box on a wire. It carries nothing now, on request, to nowhere.",
        "The gondola still moves. Somebody has been keeping it oiled and it is not the council."] }
    ],
    items: [
      { x: 4, y: 3, item: "capsule_root", n: 4, flag: "item_warrington_1" },
      { x: 57, y: 42, item: "full_restore", n: 1, hidden: true, flag: "item_warrington_2" },
      { x: 56, y: 3, item: "elixir", n: 3, flag: "item_warrington_3" },
      { x: 3, y: 42, item: "tm_encrypt", n: 1, hidden: true, flag: "item_warrington_4" },
      { x: 55, y: 34, item: "damson", n: 4, hidden: true, flag: "item_warrington_5" }
    ],
    catGaps: [
      { x: 25, y: 33, item: "cat_bell", n: 1, flag: "catgap_warrington_1",
        say: "MEADOW goes up the transporter bridge's maintenance ladder like a rumour and comes down with a small brass bell and no explanation." }
    ],
    restPoints: [{ x: 50, y: 34, flag: "meadow_sat_warrington" }],
    npcs: [
      { id: "npc_warrington_marge", x: 42, y: 8, dir: "down", sprite: "npc_shopkeep", behaviour: "still", trainer: "tr_warrington_1", sight: 0, script: "nw_warrington_marge" },
      { id: "npc_warrington_ffowc", x: 21, y: 32, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_warrington_2", sight: 3, script: "nw_transporter_rigger" },
      { id: "npc_warrington_kez", x: 50, y: 22, dir: "left", sprite: "npc_stuffer", behaviour: "wander", radius: 3, trainer: "tr_warrington_3", sight: 4 },
      { id: "npc_warrington_mo_door", x: 11, y: 34, dir: "up", sprite: "npc_dev", behaviour: "still", script: "nw_warrington_gym_door" },
      { id: "npc_warrington_crier", x: 15, y: 6, dir: "down", sprite: "npc_historian", behaviour: "still",
        say: ["Made for a palace, refused by a queen, and put up at the end of our high street.",
          "That is the most Warrington thing that has ever happened and we are correct to go on about it."] },
      { id: "npc_warrington_kid", x: 34, y: 22, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["The arcade kiosk said it'd give me unlimited tokens if I pasted a thing into my trainer card.",
          "I said no. It asked nicer. That's when I got scared."] },
      { id: "npc_warrington_boater", x: 44, y: 34, dir: "down", sprite: "npc_boater", behaviour: "wander", radius: 3,
        say: ["Ship canal takes boats the size of streets and the Mersey takes whatever the Mersey wants."] },
      { id: "npc_warrington_analyst", x: 8, y: 25, dir: "right", sprite: "npc_dev", behaviour: "still",
        say: ["Alerts from a system that is physically unplugged. Not cached. Not replayed. NEW.",
          "I've stopped putting it in tickets. People laugh, and then they check, and then they stop laughing."] },
      { id: "npc_warrington_vex_ally", x: 30, y: 26, dir: "down", sprite: "vex", behaviour: "still", script: "nw_vex_ally_chat",
        cond: "vex_ally && chapter == 10" }
    ],
    triggers: [
      { x: 27, y: 23, w: 3, h: 1, script: "nw_warrington_arrival", once: "warrington_arrival", cond: "chapter >= 10" }
    ]
  });

  // ------------------------------------------------------- GYM 8: Mo ------
  const g = B.canvas(26, 28, ".");
  g.box("g", 0, 0, 26, 28, "#");
  g.fill("g", 1, 0, 24, 1, "^");
  g.fill("g", 1, 1, 24, 1, "0");
  // a NOC floor: desks, a video wall, and firewalls you route packets around
  g.fill("g", 2, 3, 22, 1, "H");
  g.fill("g", 3, 6, 6, 1, "T"); g.fill("g", 17, 6, 6, 1, "T");
  g.fill("g", 3, 7, 6, 1, "c"); g.fill("g", 17, 7, 6, 1, "c");
  for (let k = 0; k < 3; k++) {
    const y = 10 + k * 4;
    g.fill("g", 2, y, 9, 1, "R");
    g.fill("g", 15, y, 9, 1, "R");
    g.fill("g", 2 + ((k * 4) % 8), y, 2, 1, ".");
    g.fill("g", 16 + ((k * 5) % 8), y, 2, 1, ".");
  }
  g.fill("g", 11, 5, 4, 18, "-");
  g.set("g", 12, 8, "$");
  g.fill("g", 2, 24, 22, 1, "r");
  g.fill("g", 10, 24, 6, 1, ".");
  g.set("g", 2, 26, "N"); g.set("g", 23, 26, "N");
  NW.doorway(g, 12, 27, "G");
  NW.defIn("warrington_gym", {
    name: "Warrington Gym — the NOC", region: "mersey", music: "battle_gym", ambience: "industrial",
    dialogue: "town_warrington",
    spawnPoint: { x: 12, y: 26 },
    gym: { leader: "leader_mo", badge: "badge_admin" },
    warps: [].concat(
      NW.exit(12, 27, "warrington", 11, 34, "down"),
      [{ x: 12, y: 4, to: "warrington_gym_gondola", tx: 10, ty: 22, dir: "up", kind: "lift", cond: "transporter_phase" }]
    ),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 26, text: ["HOUSE RULE (WARRINGTON)", "SEV-ONE IN PROGRESS. EVERY AGENT IS JAMMED UNTIL YOU LAND SOMETHING THEY CANNOT RESIST.",
        "The type chart in this room is a whiteboard. Whiteboards can be rewritten mid-incident. They are. Constantly."] },
      { x: 23, y: 26, text: ["A whiteboard by the door, wiped and rewritten twelve times today.",
        "Under the last wipe, in letters that were not written by a marker: THE GRIN REMAINED."] }
    ],
    items: [{ x: 23, y: 23, item: "cipher_chip", n: 3, hidden: true, flag: "item_warrington_gym_1" }],
    npcs: [
      { id: "npc_warrington_gym_rhodri", x: 6, y: 8, dir: "down", sprite: "npc_dev", behaviour: "still", trainer: "tr_warrington_gym_1", sight: 3 },
      { id: "npc_warrington_gym_ifan", x: 19, y: 16, dir: "down", sprite: "npc_dev", behaviour: "still", trainer: "tr_warrington_gym_2", sight: 3 },
      { id: "npc_warrington_mo", x: 12, y: 9, dir: "down", sprite: "mo", behaviour: "still", script: "nw_gym8_mo" }
    ]
  }, g, NW.inside({ "$": "gym_badge_stand", "H": "hologram", "r": "cable_duct" }));

  // ------------------------------------------------- the gondola (phase 3) --
  const go = B.canvas(20, 24, ":");
  go.box("g", 0, 0, 20, 24, "|");
  go.fill("g", 1, 1, 18, 22, ":");
  go.fill("g", 1, 1, 18, 1, "1");
  go.fill("g", 2, 4, 16, 1, "|");
  go.fill("g", 2, 19, 16, 1, "|");
  go.fill("g", 6, 8, 8, 8, "_");
  go.set("g", 3, 6, "N"); go.set("g", 16, 6, "N");
  go.set("g", 9, 23, "n"); go.set("g", 10, 23, "n");
  NW.defIn("warrington_gym_gondola", {
    name: "The Transporter Gondola", region: "mersey", music: "battle_gym", ambience: "industrial",
    dialogue: "town_warrington",
    spawnPoint: { x: 10, y: 22 },
    warps: [
      { x: 9, y: 23, to: "warrington", tx: 21, ty: 31, dir: "down", kind: "lift" },
      { x: 10, y: 23, to: "warrington", tx: 21, ty: 31, dir: "down", kind: "lift" },
      { x: 2, y: 22, to: "warrington_gym", tx: 12, ty: 5, dir: "down", kind: "lift" }
    ],
    encounters: { grass: null },
    signs: [
      { x: 3, y: 6, text: ["SAFE WORKING LOAD 18 TONS. LAST INSPECTED 1961.", "Somebody has written a new date underneath, in this decade, in a very neat hand."] },
      { x: 16, y: 6, text: ["A hundred feet of air, a river the colour of a filing cabinet, and both banks of Warrington watching.",
        "Mo says the height makes people honest. Mo is not entirely joking."] }
    ],
    items: [{ x: 17, y: 21, item: "elixir", n: 2, hidden: true, flag: "item_warrington_gondola_1" }],
    npcs: [
      { id: "npc_warrington_mo_gondola", x: 10, y: 8, dir: "down", sprite: "mo", behaviour: "still", script: "nw_gym8_gondola" }
    ]
  }, go, NW.inside({ "|": "fence_wire", "1": "roof_metal", "_": "platform" }));

  // ------------------------------------------------------- the arcade -----
  const ar = B.canvas(28, 24, ";");
  ar.box("g", 0, 0, 28, 24, "#");
  ar.fill("g", 1, 0, 26, 1, "^");
  ar.fill("g", 2, 3, 24, 1, "!");
  for (let i = 0; i < 6; i++) { ar.set("g", 3 + i * 4, 6, "!"); ar.set("g", 3 + i * 4, 12, "!"); }
  ar.fill("g", 2, 17, 6, 1, "C"); ar.set("g", 5, 17, "Q");
  ar.set("g", 22, 17, "m");
  ar.set("g", 25, 5, "!");
  ar.set("g", 2, 21, "N"); ar.set("g", 25, 21, "N");
  NW.doorway(ar, 13, 23, "D");
  NW.defIn("warrington_arcade", {
    name: "The Wire Arcade", region: "mersey", music: "town_warrington", ambience: "town", dialogue: "town_warrington",
    spawnPoint: { x: 13, y: 22 },
    warps: NW.exit(13, 23, "warrington", 38, 19, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 21, text: ["CABINETS: PACKET RUN · SALT RUSH · TYPE TRAINER · and nine others of varying honesty."] },
      { x: 25, y: 21, text: ["THE KIOSK", "'UNLIMITED TOKENS. PASTE THIS INTO YOUR TRAINER CARD.' The text is already in your clipboard.",
        "You did not copy it."] }
    ],
    items: [{ x: 26, y: 22, item: "arcade_pass", n: 1, hidden: true, flag: "item_warrington_arcade_1" }],
    npcs: [
      { id: "npc_warrington_sian", x: 5, y: 18, dir: "down", sprite: "npc_dev", behaviour: "still", trainer: "tr_warrington_arcade_1", sight: 0, script: "nw_arcade_sian" },
      { id: "npc_warrington_kiosk", x: 22, y: 18, dir: "up", sprite: "npc_shadow_it", behaviour: "still", script: "nw_arcade_kiosk" },
      { id: "npc_warrington_arcade_kid", x: 9, y: 14, dir: "up", sprite: "npc_kid", behaviour: "still",
        say: ["Packet Run's the good one. Salt Rush is the hard one. Type Trainer is the one that teaches you something, which is cheating."] }
    ]
  }, ar, NW.inside({ "!": "fruit_machine", "m": "machine", "C": "counter", "Q": "cash_till" }));

  // -------------------------------------------------------- the Arena -----
  const an = B.canvas(28, 28, "'");
  an.box("g", 0, 0, 28, 28, "#");
  an.fill("g", 1, 0, 26, 1, "^");
  an.fill("g", 2, 2, 24, 2, "U"); an.fill("g", 2, 22, 24, 2, "U");
  an.fill("g", 6, 6, 16, 14, "-");
  an.box("g", 6, 6, 16, 14, "A");
  an.fill("g", 7, 7, 14, 12, "-");
  an.fill("g", 13, 19, 2, 1, "-");
  an.fill("g", 2, 5, 3, 16, "U"); an.fill("g", 23, 5, 3, 16, "U");
  an.fill("g", 11, 24, 6, 1, "C");
  an.set("g", 14, 24, "Q");
  an.set("g", 2, 26, "N"); an.set("g", 25, 26, "N");
  NW.doorway(an, 13, 27, "D");
  NW.defIn("warrington_arena", {
    name: "The Warrington Arena", region: "mersey", music: "battle_trainer", ambience: "town", dialogue: "town_warrington",
    spawnPoint: { x: 13, y: 26 },
    warps: NW.exit(13, 27, "warrington", 51, 19, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 26, text: ["ENGAGEMENT RULES", "BRONZE — 3 fights, level 38. SILVER — 5, level 45. GOLD — 7, level 52, no items.",
        "PLATINUM — 9, level 58, one agent only. OBSIDIAN — 12, level 65, weather rolls every fight, and a boss at the end.",
        "Parties refill HP between fights. PP is your problem. Overdrive carries."] },
      { x: 25, y: 26, text: ["ARENA CHIPS exchange at the desk. First clear of each tier pays a perk point.",
        "The obsidian board has three names on it. Two of them are crossed out."] }
    ],
    items: [{ x: 25, y: 3, item: "focus_band", n: 1, hidden: true, flag: "item_warrington_arena_1" }],
    npcs: [
      { id: "npc_warrington_arena_desk", x: 14, y: 22, dir: "down", sprite: "npc_walker", behaviour: "still", script: "nw_arena_desk" },
      { id: "npc_warrington_arena_fan", x: 4, y: 12, dir: "right", sprite: "npc_kid", behaviour: "still",
        say: ["Nobody's cleared obsidian. Two people have tried and one of them was a gym leader.",
          "She got to eleven and then something with three phases happened and she went home."] }
    ]
  }, an, NW.inside({ "U": "bench", "A": "fence_iron", "C": "counter", "Q": "cash_till" }));

  // ------------------------------------------------------- Town Hall ------
  const th = NW.room(24, 20, "-", "%");
  th.fill("g", 1, 1, 22, 1, "W");
  th.fill("g", 4, 4, 16, 1, "k");
  th.fill("g", 2, 7, 6, 1, "t"); th.fill("g", 16, 7, 6, 1, "t");
  th.fill("g", 3, 8, 4, 1, "c"); th.fill("g", 17, 8, 4, 1, "c");
  th.fill("g", 9, 10, 6, 4, "*");
  th.set("g", 4, 15, "i"); th.set("g", 19, 15, "i");
  th.set("g", 2, 17, "N"); th.set("g", 21, 17, "N");
  NW.doorway(th, 11, 19, "D");
  NW.defIn("warrington_town_hall", {
    name: "Warrington Town Hall", region: "mersey", music: "town_warrington", ambience: "town", dialogue: "town_warrington",
    spawnPoint: { x: 11, y: 18 },
    warps: NW.exit(11, 19, "warrington", 13, 13, "down"),
    encounters: { grass: null },
    signs: [
      { x: 2, y: 17, text: ["BOUNTY BOARD — three warrants, rotating daily.", "Clue text only. No map markers. If you wanted markers you should have joined a different profession."] },
      { x: 21, y: 17, text: ["A minute book, open at 1893: 'RESOLVED, that the gates be accepted.'",
        "Nothing about the refusal. Nothing about the palace. Warrington keeps its own counsel and then tells everyone anyway."] }
    ],
    items: [{ x: 22, y: 2, item: "capsule_root", n: 3, hidden: true, flag: "item_warrington_town_hall_1" }],
    npcs: [
      { id: "npc_warrington_clerk", x: 12, y: 6, dir: "down", sprite: "npc_historian", behaviour: "still", script: "nw_warrington_bounty" },
      { id: "npc_warrington_hall_1", x: 5, y: 12, dir: "right", sprite: "npc_granny", behaviour: "still",
        say: ["I have complained about eleven things in this building and got nine of them changed.", "The other two were the gates and the weather."] }
    ]
  }, th, NW.inside({ "*": "statue", "i": "painting", "k": "counter" }));

  W.defineMap("warrington_care", W.builtin("care_centre", {
    name: "Warrington Care Centre", region: "mersey", dialogue: "town_warrington", music: "town_warrington",
    warps: NW.exit(7, 11, "warrington", 39, 34, "down"),
    npcs: [
      { id: "npc_warrington_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still", kind: "heal",
        say: ["Biggest in the borough and the quietest room in it, which is exactly how it should be."] },
      { id: "npc_warrington_care_1", x: 12, y: 5, dir: "left", sprite: "npc_walker", behaviour: "still",
        say: ["They ran a week without the triage system in 2023 as a resilience test.", "Nobody died. Everybody was late. VIGIL sent the ward a message asking if we'd eaten."] }
    ]
  }));
  W.defineMap("warrington_mart", W.builtin("shop", {
    name: "Warrington Mart", region: "mersey", dialogue: "town_warrington", music: "town_warrington",
    shop: "shop_warrington",
    warps: NW.exit(6, 9, "warrington", 52, 32, "down"),
    npcs: [
      { id: "npc_warrington_clerk_mart", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_warrington",
        say: ["Everything, in bulk, and a queue that moves. Two things this town is genuinely good at."] }
    ],
    items: [{ x: 12, y: 2, item: "capsule_quick", n: 3, flag: "item_warrington_mart_1" }]
  }));
  W.defineMap("warrington_station", W.builtin("station", {
    name: "Warrington Bank Quay", region: "mersey", dialogue: "town_warrington", music: "town_warrington",
    station: { name: "Warrington Bank Quay" },
    warps: NW.exit(8, 11, "warrington", 4, 35, "down"),
    npcs: [
      { id: "npc_warrington_guard", x: 6, y: 3, dir: "down", sprite: "npc_station", behaviour: "still", kind: "train",
        say: ["West Coast Main Line. Glasgow that way, London that way, and a soap works over the road that has outlasted both timetables."] }
    ],
    signs: [{ x: 8, y: 1, text: ["DEPARTURES", "Everything, eventually, and a great many things that do not stop."] }]
  }));
})();
