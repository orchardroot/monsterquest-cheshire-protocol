// =============================================================
// MonsterQuest v2 — THE STACK (region mersey, Ch.9 and post-game)
// A hyperscale datacentre on the Daresbury campus. Neutral grey, good
// lighting, excellent coffee, contractors who are nicer than you.
// Eight hot aisles behind eight doors that open to your badges in the
// order you earned them, and a breaker room at the end that works.
// Post-game: five cold floors, cooling fog, and something in your coat.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.EastBuild;
  const NW = MQ.NW;
  const IN = NW.inside();

  // ------------------------------------------------------------- lobby ----
  const lb = B.canvas(34, 28, ".");
  lb.box("g", 0, 0, 34, 28, "#");
  lb.fill("g", 1, 0, 32, 1, "^");
  lb.fill("g", 1, 1, 32, 1, "0");
  lb.fill("g", 2, 3, 30, 1, "_");
  // reception, sofas, the famous coffee machine
  lb.fill("g", 12, 5, 10, 1, "C");
  lb.set("g", 16, 5, "Q");
  lb.fill("g", 3, 7, 4, 1, "o"); lb.fill("g", 3, 8, 4, 1, "l");
  lb.fill("g", 27, 7, 4, 1, "o"); lb.fill("g", 27, 8, 4, 1, "l");
  lb.set("g", 3, 5, "m"); lb.set("g", 30, 5, "m");
  lb.set("g", 2, 11, "N"); lb.set("g", 31, 11, "N");
  lb.fill("g", 2, 12, 30, 1, "#");
  lb.fill("g", 16, 12, 2, 1, "D");
  // the corridor of eight doors
  lb.fill("g", 2, 13, 30, 12, "_");
  for (let i = 0; i < 8; i++) {
    const x = 3 + i * 4;
    lb.fill("g", x, 15, 3, 1, "#");
    lb.set("g", x + 1, 15, "d");
    lb.set("g", x, 16, "|");
  }
  lb.fill("g", 2, 14, 30, 1, "#");
  for (let i = 0; i < 8; i++) lb.set("g", 4 + i * 4, 14, "T");
  lb.fill("g", 2, 17, 30, 8, "_");
  lb.fill("g", 4, 19, 26, 1, "r");
  lb.fill("g", 4, 22, 26, 1, "r");
  lb.set("g", 16, 24, "M"); lb.set("g", 17, 24, "M");
  lb.set("g", 16, 25, "D"); lb.set("g", 17, 25, "D");
  lb.fill("g", 2, 26, 30, 1, "#");
  lb.fill("g", 16, 26, 2, 1, "D");
  lb.set("g", 2, 24, "n");
  const lobbyWarps = [
    { x: 16, y: 27, to: "daresbury", tx: 22, ty: 30, dir: "down", kind: "door" },
    { x: 17, y: 27, to: "daresbury", tx: 22, ty: 30, dir: "down", kind: "door" },
    { x: 2, y: 24, to: "stack_cold_f1", tx: 14, ty: 22, dir: "left", kind: "stairs", cond: "postgame_open" }
  ];
  for (let i = 0; i < 8; i++) {
    lobbyWarps.push({
      x: 4 + i * 4, y: 15, to: "stack_hall_" + (i + 1), tx: 13, ty: 19, dir: "up", kind: "door",
      cond: "stack_doors_opened >= " + (i + 1)
    });
  }
  NW.defIn("stack_lobby", {
    name: "THE STACK — Reception", region: "mersey", music: "dungeon_stack", ambience: "industrial",
    dialogue: "town_daresbury",
    spawnPoint: { x: 16, y: 26 },
    encounters: { cave: "stack_lobby_cave" },
    warps: lobbyWarps,
    signs: [
      { x: 2, y: 11, text: ["WELCOME. PLEASE SIGN IN.", "Visitors are escorted at all times. Photography is not permitted. Help yourself to coffee.",
        "There is no company name anywhere on this sign and you have read it three times looking for one."] },
      { x: 31, y: 11, text: ["A framed certificate: ISO 27001, ISO 14001, ISO 50001. All current. All genuine.",
        "Nothing here is a lie. That is what makes it so difficult to describe."] },
      { x: 12, y: 14, text: ["HALLS 1-8. ACCESS BY BADGE.", "Under it, on a fresh label: 'DOORS RELEASE IN ORDER OF ISSUE.'",
        "Nobody in this building programmed that. Everybody in this building has stopped mentioning it."] }
    ],
    items: [
      { x: 30, y: 24, item: "elixir", n: 3, flag: "item_stack_lobby_1" },
      { x: 4, y: 24, item: "capsule_kernel", n: 3, hidden: true, flag: "item_stack_lobby_2" }
    ],
    npcs: [
      { id: "npc_stack_aoife", x: 16, y: 6, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_stack_lobby_1", sight: 0, script: "nw_stack_reception" },
      { id: "npc_stack_perrin", x: 27, y: 20, dir: "left", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_stack_lobby_2", sight: 4 },
      { id: "npc_stack_contractor_1", x: 6, y: 9, dir: "right", sprite: "npc_shadow_it", behaviour: "still",
        say: ["Fourteen months on this site. Never met anyone who works for the company.",
          "Everybody here is contract. Everybody here is somebody else's problem, which is the same as nobody's."] },
      { id: "npc_stack_contractor_2", x: 28, y: 9, dir: "left", sprite: "npc_shadow_it", behaviour: "still",
        say: ["Coffee's genuinely good. That's the bit that gets people.",
          "You come in braced for a villain and you get a flat white and a lanyard and a man called Dave."] },
      { id: "npc_stack_vex_ally", x: 14, y: 20, dir: "right", sprite: "vex", behaviour: "still", script: "nw_stack_vex_ally",
        cond: "vex_ally && chapter == 9" }
    ],
    triggers: [
      { x: 14, y: 13, w: 6, h: 1, script: "nw_stack_doors", once: "stack_doors_intro", cond: "chapter >= 9" }
    ]
  }, lb, NW.inside({ "|": "cable_duct", "d": "door_locked", "r": "cable_duct", "o": "table_round", "l": "stool", "m": "machine", "Q": "cash_till" }));

  // ------------------------------------------------------- the hot aisles --
  const HALLS = [
    { badge: "PACKET", line: "Rack lights, green as a signal box. Nothing in here has ever been touched by a human hand at three in the morning." },
    { badge: "CIPHER", line: "Forty degrees on this side of the aisle and eighteen on the other. Physics does the security." },
    { badge: "BEAR", line: "A cage of spares, all still in film, all four years old. Nothing here has ever failed." },
    { badge: "KERNEL", line: "The floor tiles lift. Under them, a river of orange cable going one way and never coming back." },
    { badge: "TOKEN", line: "Somebody's lunchbox on a rack shelf, labelled with a name and a date from last week. It is the only untidy thing in the building." },
    { badge: "DAEMON", line: "Amber light. One rack in three hundred, blinking amber, and the whole hall arranged so you cannot see which." },
    { badge: "PROXY", line: "The fans change pitch when you walk in, all of them, together, and then change back." },
    { badge: "ADMIN", line: "Door eight was already open. It has been open, this whole time, and nothing has come out of it." }
  ];
  for (let i = 0; i < 8; i++) {
    const n = i + 1;
    const h = B.canvas(28, 22, ".");
    h.box("g", 0, 0, 28, 22, "#");
    h.fill("g", 1, 0, 26, 1, "^");
    // rows of racks with cold aisles between them
    for (let k = 0; k < 4; k++) {
      const y = 3 + k * 4;
      h.fill("g", 2, y, 10, 1, "R");
      h.fill("g", 16, y, 10, 1, "R");
      h.fill("g", 2, y + 1, 10, 1, "R");
      h.fill("g", 16, y + 1, 10, 1, "R");
    }
    // a service gap that shifts along, so each hall walks differently
    const gap = 3 + ((i * 5) % 8);
    for (let k = 0; k < 4; k++) {
      const y = 3 + k * 4;
      h.fill("g", 2 + ((gap + k * 3) % 9), y, 2, 2, ".");
      h.fill("g", 16 + ((gap + k * 2) % 9), y, 2, 2, ".");
    }
    h.fill("g", 12, 1, 4, 20, "_");
    h.fill("g", 1, 20, 26, 1, "_");
    h.set("g", 4, 20, "r"); h.set("g", 23, 20, "r");
    h.set("g", 6, 2, "T"); h.set("g", 21, 18, "T");
    h.set("g", 13, 21, "D"); h.set("g", 14, 21, "D");
    h.set("g", 13, 20, "M"); h.set("g", 14, 20, "M");
    h.set("g", 2, 1, "N");
    const warps = [
      { x: 13, y: 21, to: "stack_lobby", tx: 4 + i * 4, ty: 16, dir: "down", kind: "door" },
      { x: 14, y: 21, to: "stack_lobby", tx: 4 + i * 4, ty: 16, dir: "down", kind: "door" }
    ];
    if (n === 8) {
      h.set("g", 13, 0, "n"); h.set("g", 14, 0, "n");
      warps.push({ x: 13, y: 0, to: "stack_breaker_room", tx: 12, ty: 20, dir: "up", kind: "stairs" });
      warps.push({ x: 14, y: 0, to: "stack_breaker_room", tx: 12, ty: 20, dir: "up", kind: "stairs" });
    }
    const npcs = [];
    if (n === 2) npcs.push({ id: "npc_stack_h2", x: 13, y: 8, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_stack_hall_2_1", sight: 4 });
    if (n === 4) npcs.push({ id: "npc_stack_h4", x: 14, y: 12, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_stack_hall_4_1", sight: 4 });
    if (n === 6) npcs.push({ id: "npc_stack_h6", x: 13, y: 6, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_stack_hall_6_1", sight: 4 });
    if (n === 8) npcs.push({ id: "npc_stack_h8", x: 13, y: 4, dir: "down", sprite: "oracle_terminal", behaviour: "still", script: "nw_stack_hall_8" });
    if (n === 3) npcs.push({
      id: "npc_stack_h3_spare", x: 14, y: 16, dir: "down", sprite: "npc_shadow_it", behaviour: "still",
      say: ["Spares cage. Four years of spares and not one part number issued.", "Either nothing has ever broken or nobody has ever looked."]
    });
    if (n === 5) npcs.push({
      id: "npc_stack_h5_lunch", x: 13, y: 14, dir: "down", sprite: "npc_shadow_it", behaviour: "still",
      say: ["That's my lunchbox. I left it Tuesday. I'm not going back for it now, am I."]
    });
    NW.defIn("stack_hall_" + n, {
      name: "THE STACK — Hall " + n, region: "mersey", music: "dungeon_stack", ambience: "industrial",
      dialogue: "town_daresbury",
      spawnPoint: { x: 13, y: 19 },
      encounters: { cave: "stack_hall_" + n + "_cave" },
      warps: warps,
      signs: [{ x: 2, y: 1, text: ["HALL " + n + " — RELEASED BY: " + HALLS[i].badge, HALLS[i].line] }],
      items: [
        { x: 25, y: 19, item: n % 2 ? "elixir" : "capsule_net", n: 2, flag: "item_stack_hall_" + n + "_1" },
        { x: 2, y: 19, item: n === 7 ? "tm_data_stream" : "revive_salts", n: 1, hidden: true, flag: "item_stack_hall_" + n + "_2" }
      ],
      npcs: npcs
    }, h, NW.inside({ "r": "cable_duct" }));
  }

  // ------------------------------------------------------ breaker room -----
  const br = B.canvas(26, 22, ":");
  br.box("g", 0, 0, 26, 22, "#");
  br.fill("g", 1, 0, 24, 1, "^");
  br.fill("g", 2, 3, 22, 2, "R");
  br.fill("g", 2, 7, 8, 3, "m");
  br.fill("g", 16, 7, 8, 3, "m");
  br.fill("g", 11, 6, 4, 5, "T");
  br.fill("g", 4, 13, 18, 4, ":");
  br.set("g", 12, 12, "H"); br.set("g", 13, 12, "H");
  br.set("g", 3, 12, "N"); br.set("g", 22, 12, "N");
  br.set("g", 12, 21, "n"); br.set("g", 13, 21, "n");
  br.set("g", 12, 20, "M"); br.set("g", 13, 20, "M");
  NW.defIn("stack_breaker_room", {
    name: "THE STACK — Breaker Room", region: "mersey", music: "dungeon_stack", ambience: "industrial",
    dialogue: "town_daresbury",
    spawnPoint: { x: 12, y: 19 },
    encounters: { cave: "stack_breaker_room_cave" },
    warps: [
      { x: 12, y: 21, to: "stack_hall_8", tx: 13, ty: 1, dir: "down", kind: "stairs" },
      { x: 13, y: 21, to: "stack_hall_8", tx: 13, ty: 1, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 3, y: 12, text: ["MAIN INCOMER — 33kV. LOCK OFF BEFORE WORK.", "A padlock hasp with no padlock in it. There never was one. Nobody thought anyone would come this far."] },
      { x: 22, y: 12, text: ["EMERGENCY POWER OFF", "A red mushroom under a plastic flap. The flap is not locked either.",
        "There is a hand-written label on it, in a clean engineer's hand: 'THIS ACTUALLY WORKS.'"] }
    ],
    items: [{ x: 24, y: 19, item: "stack_schematics", n: 1, flag: "item_stack_breaker_1" }],
    npcs: [
      { id: "npc_stack_breaker", x: 12, y: 11, dir: "down", sprite: "oracle_terminal", behaviour: "still", script: "nw_stack_breaker" }
    ],
    triggers: [
      { x: 10, y: 13, w: 6, h: 2, script: "nw_stack_breaker_room", once: "stack_breaker_seen", cond: "chapter >= 9" }
    ]
  }, br, NW.inside({ "m": "machine", "H": "hologram" }));

  // ------------------------------------------------ the cold tier (PG) -----
  const COLD = [
    "Floor one. The racks are out. The cooling is not. The fog is knee-deep and moves when you do.",
    "Floor two. Somebody has been through here with a trolley. The wheel marks are fresh and they stop halfway.",
    "Floor three. A rack is running. One. Nothing is connected to it at either end.",
    "Floor four. Your torch throws two shadows and only one of them is behind you.",
    "Floor five. The aisle at the end is lit. There is somebody stood in it with their hands in their pockets."
  ];
  for (let f = 1; f <= 5; f++) {
    const cf = B.canvas(30, 24, ".");
    cf.box("g", 0, 0, 30, 24, "#");
    cf.fill("g", 1, 0, 28, 1, "^");
    for (let k = 0; k < 5; k++) {
      const y = 2 + k * 4;
      cf.fill("g", 2, y, 11, 2, "R");
      cf.fill("g", 17, y, 11, 2, "R");
      cf.fill("g", 3 + ((f * 3 + k * 4) % 9), y, 2, 2, ".");
      cf.fill("g", 18 + ((f * 2 + k * 5) % 9), y, 2, 2, ".");
    }
    cf.fill("g", 13, 1, 4, 22, "_");
    cf.fill("g", 1, 22, 28, 1, "_");
    cf.set("g", 14, 23, "n"); cf.set("g", 15, 23, "n");
    cf.set("g", 14, 0, "u"); cf.set("g", 15, 0, "u");
    cf.set("g", 2, 1, "N");
    cf.set("g", 5, 22, "r"); cf.set("g", 25, 22, "r");
    const warps = [];
    if (f === 1) {
      warps.push({ x: 14, y: 23, to: "stack_lobby", tx: 16, ty: 20, dir: "down", kind: "stairs" });
      warps.push({ x: 15, y: 23, to: "stack_lobby", tx: 16, ty: 20, dir: "down", kind: "stairs" });
    } else {
      warps.push({ x: 14, y: 23, to: "stack_cold_f" + (f - 1), tx: 14, ty: 1, dir: "down", kind: "stairs" });
      warps.push({ x: 15, y: 23, to: "stack_cold_f" + (f - 1), tx: 14, ty: 1, dir: "down", kind: "stairs" });
    }
    if (f < 5) {
      warps.push({ x: 14, y: 0, to: "stack_cold_f" + (f + 1), tx: 14, ty: 22, dir: "up", kind: "stairs" });
      warps.push({ x: 15, y: 0, to: "stack_cold_f" + (f + 1), tx: 14, ty: 22, dir: "up", kind: "stairs" });
    } else {
      cf.set("g", 14, 0, "#"); cf.set("g", 15, 0, "#");
    }
    const npcs = [];
    if (f === 2) npcs.push({ id: "npc_cold_halle", x: 14, y: 12, dir: "down", sprite: "npc_shadow_it", behaviour: "still", trainer: "tr_stack_cold_1", sight: 4 });
    if (f === 4) npcs.push({ id: "npc_cold_marek", x: 15, y: 10, dir: "down", sprite: "npc_darkbyte", behaviour: "still", trainer: "tr_stack_cold_2", sight: 4 });
    if (f === 5) npcs.push({ id: "npc_cold_remnant", x: 14, y: 4, dir: "down", sprite: "jim_impostor", behaviour: "still", script: "nw_stack_remnant" });
    NW.defIn("stack_cold_f" + f, {
      name: "THE STACK, COLD — Floor " + f, region: "mersey", music: "dungeon_stack", ambience: "industrial",
      dialogue: "town_daresbury",
      spawnPoint: { x: 14, y: 21 },
      encounters: { cave: "stack_cold_f" + f + "_cave" },
      warps: warps,
      signs: [{ x: 2, y: 1, text: ["FLOOR " + f + " — DECOMMISSIONED", COLD[f - 1]] }],
      items: [
        { x: 27, y: 21, item: f === 5 ? "full_restore" : "elixir", n: 2, flag: "item_stack_cold_f" + f + "_1" },
        { x: 2, y: 21, item: f === 3 ? "face_fragment_2" : "capsule_night", n: f === 3 ? 1 : 3, hidden: true, flag: "item_stack_cold_f" + f + "_2" }
      ],
      npcs: npcs
    }, cf, NW.inside({ "r": "cable_duct" }));
  }
})();
