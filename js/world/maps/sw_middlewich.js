// =============================================================
// MonsterQuest v2 — MIDDLEWICH (region salt, Ch.7)
// Roman salt town where the Trent & Mersey meets the Shropshire Union.
// Big Lock, brine pans, a folk festival with too many speakers, and a
// woman with a clipboard who decides whether you may drive a boat.
// Owned by region-southwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const W = MQ.World;
  const B = MQ.SaltBuild;

  const TOWN = B.salt({ "V": "wall_render_white", "M": "chimney_mill", "&": "bunting", "q": "picnic_table" });

  const c = B.canvas(48, 38, ".");
  c.fill("g", 0, 0, 48, 1, "T"); c.fill("g", 0, 37, 48, 1, "T");
  c.fill("g", 0, 1, 1, 36, "T"); c.fill("g", 47, 1, 1, 36, "T");
  for (let x = 0; x < 48; x++) c.set("o", x, 0, "y");

  // ---- streets -----------------------------------------------------------
  c.fill("g", 1, 8, 46, 3, "=");
  c.fill("g", 1, 7, 46, 1, "-"); c.fill("g", 1, 11, 46, 1, "-");
  c.fill("g", 1, 20, 46, 3, "=");
  c.fill("g", 1, 19, 46, 1, "-"); c.fill("g", 1, 23, 46, 1, "-");
  c.fill("g", 20, 0, 3, 8, "=");
  c.fill("o", 20, 0, 3, 1, " ");
  c.fill("g", 44, 11, 3, 9, "=");
  c.fill("g", 30, 11, 2, 9, "=");
  c.fill("g", 8, 11, 2, 9, "=");

  // ---- the canals --------------------------------------------------------
  B.canal(c, 1, 26, 46, "h", { width: 3, tow: "t", far: "t" });
  c.fill("g", 1, 24, 46, 2, ",");
  c.fill("g", 1, 30, 46, 7, ",");
  // Big Lock
  B.lockFlight(c, 14, 27, 1, 1, { gate: "K", beam: "e", width: 3 });
  c.set("g", 13, 26, "e"); c.set("g", 15, 30, "e");
  // the Shropshire Union branch, dropping away south
  c.fill("g", 35, 30, 2, 7, "~");
  c.fill("g", 34, 30, 1, 7, "t"); c.fill("g", 37, 30, 1, 7, "t");
  c.fill("g", 34, 29, 4, 1, "t");
  // crossings
  c.fill("g", 20, 26, 3, 4, "x");
  c.fill("g", 20, 23, 3, 3, "=");
  c.fill("g", 20, 30, 3, 3, "+");
  c.fill("g", 6, 26, 2, 4, "<");
  c.set("g", 10, 27, "Q"); c.set("g", 42, 28, "Q"); c.set("g", 36, 34, "Q");
  c.set("g", 26, 26, "8"); c.set("g", 40, 30, "9");

  // ---- St Michael's and the churchyard -----------------------------------
  c.box("g", 5, 1, 14, 7, "w");
  c.fill("g", 6, 2, 12, 5, ",");
  B.house(c, { x: 8, y: 2, w: 9, h: 5, rh: 2, roof: "p", wall: "c", win: "C", door: "d", doorX: 4 });
  c.set("g", 12, 1, "p");
  B.speckle(c, "mw-graves", "g", 8, 6, 3, 11, 4, [","]);
  c.set("g", 12, 8, "d");
  c.set("g", 4, 6, "N");

  // ---- shops and houses --------------------------------------------------
  B.house(c, { x: 2, y: 13, w: 11, h: 6, rh: 2, roof: "R", wall: "V", win: "W", door: "S", doorX: 5, over: "^" });
  c.set("g", 1, 17, "N");
  B.house(c, { x: 20, y: 13, w: 9, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "S", doorX: 4, over: "^" });
  B.house(c, { x: 33, y: 13, w: 10, h: 6, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 4, over: "^", chimney: 1 });
  c.set("g", 32, 17, "N");
  B.timberRow(c, 21, 2, 8, { h: 5, doors: [3], chimneys: [1, 6] });
  B.timberRow(c, 32, 2, 9, { h: 5, doors: [4], chimneys: [1, 7] });
  c.fill("g", 30, 7, 1, 1, "L"); c.set("g", 20, 7, "L"); c.set("g", 43, 7, "u");
  c.set("g", 16, 19, "O"); c.set("g", 26, 23, "j"); c.set("g", 36, 19, "n");
  c.set("g", 6, 23, "H"); c.set("g", 7, 23, "I");

  // ---- the boat office and the wharf -------------------------------------
  B.house(c, { x: 24, y: 31, w: 9, h: 4, rh: 1, roof: "R", wall: "V", win: "W", door: "D", doorX: 4, over: "^" });
  c.fill("g", 24, 35, 9, 1, "-");
  c.set("g", 23, 34, "N");
  c.set("g", 18, 28, "8"); c.set("g", 18, 27, "8");
  c.fill("g", 2, 31, 8, 4, "9");
  c.set("g", 3, 33, "[");

  // ---- the salt pans and the festival gate -------------------------------
  c.fill("g", 39, 31, 8, 6, ",");
  B.saltPans(c, 40, 33, 2, {});
  c.fill("g", 38, 31, 1, 6, "|");
  c.set("g", 42, 30, "J");
  c.set("g", 43, 30, "N");
  c.fill("g", 12, 32, 8, 4, "\"");
  c.fill("g", 41, 2, 6, 5, "\"");
  B.trees(c, "mw-fringe", 16, 1, 30, 46, 6, "T", "y", [","]);
  c.fill("g", 12, 30, 5, 3, "_");
  c.set("g", 45, 24, "z");
  c.txt("o", 20, 19, "&&&&&&&&");

  W.defineMap("middlewich", {
    name: "Middlewich", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "town", dialogue: "town_middlewich", shop: "shop_middlewich",
    legend: TOWN, layers: c.layers(),
    spawnPoint: { x: 21, y: 21 },
    healPoint: { x: 7, y: 19 },
    landmark: { name: "Middlewich", x: 21, y: 21 },
    encounters: { grass: "middlewich_grass", water: "middlewich_water" },
    fishing: "fish_middlewich",
    warps: [
      { x: 7, y: 18, to: "middlewich_care", tx: 7, ty: 10, dir: "up", kind: "door" },
      { x: 24, y: 18, to: "middlewich_mart", tx: 6, ty: 8, dir: "up", kind: "door" },
      { x: 37, y: 18, to: "middlewich_inn", tx: 6, ty: 10, dir: "up", kind: "door" },
      { x: 12, y: 8, to: "middlewich_church", tx: 6, ty: 12, dir: "up", kind: "door" },
      { x: 28, y: 34, to: "middlewich_boat_office", tx: 7, ty: 12, dir: "up", kind: "door" },
      { x: 24, y: 6, to: "middlewich_house_1", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 36, y: 6, to: "middlewich_house_2", tx: 5, ty: 8, dir: "up", kind: "door" },
      { x: 14, y: 30, to: "middlewich_big_lock", tx: 14, ty: 16, dir: "up", kind: "stairs" },
      { x: 42, y: 30, to: "middlewich_festival_field", tx: 18, ty: 26, dir: "up", kind: "gate" },
      // edges
      { x: 20, y: 0, to: "route_middlewich_northwich", tx: 14, ty: 44, dir: "up", kind: "edge" },
      { x: 21, y: 0, to: "route_middlewich_northwich", tx: 15, ty: 44, dir: "up", kind: "edge" },
      { x: 22, y: 0, to: "route_middlewich_northwich", tx: 16, ty: 44, dir: "up", kind: "edge" },
      { x: 47, y: 14, to: "route_sandbach_middlewich", tx: 1, ty: 6, dir: "right", kind: "edge" },
      { x: 47, y: 15, to: "route_sandbach_middlewich", tx: 1, ty: 7, dir: "right", kind: "edge" },
      { x: 47, y: 16, to: "route_sandbach_middlewich", tx: 1, ty: 8, dir: "right", kind: "edge" },
      { x: 0, y: 20, to: "route_middlewich_winsford", tx: 52, ty: 14, dir: "left", kind: "edge" },
      { x: 0, y: 21, to: "route_middlewich_winsford", tx: 52, ty: 15, dir: "left", kind: "edge" },
      { x: 0, y: 22, to: "route_middlewich_winsford", tx: 52, ty: 16, dir: "left", kind: "edge" }
    ],
    signs: [
      { x: 4, y: 6, text: ["ST MICHAEL AND ALL ANGELS.", "The tower has a scorch line at head height from the day in 1643 the town was fought over and then, largely, forgotten about."] },
      { x: 1, y: 17, text: ["CARE CENTRE — MIDDLEWICH", "Salt baths. Brine baths. A cup of tea, which is the only one of the three anybody actually asks for."] },
      { x: 32, y: 17, text: ["THE BOAR'S HEAD — junction of two canals and three counties' worth of opinions."] },
      { x: 23, y: 34, text: ["MIDDLEWICH BOAT OFFICE", "NARROWBOAT LICENCE: theory, practical, and a short interview about wash.",
        "FOUR MILES AN HOUR. If your wash is breaking on the bank you are going too fast and Carys will know."] },
      { x: 43, y: 30, text: ["MIDDLEWICH FOLK & BOAT — this weekend. Three days, four stages, one enormous argument about amplification."] }
    ],
    items: [
      { x: 14, y: 33, item: "salt_crystal", n: 3, flag: "item_middlewich_1" },
      { x: 44, y: 3, item: "capsule_kernel", n: 3, flag: "item_middlewich_2" },
      { x: 4, y: 34, item: "salt_lick", n: 2, hidden: true, flag: "item_middlewich_3" },
      { x: 46, y: 25, item: "collectible_20", n: 1, hidden: true, flag: "item_middlewich_4" }
    ],
    catGaps: [
      { x: 38, y: 33, item: "salt_crystal", n: 2, flag: "catgap_middlewich_1",
        say: "MEADOW slips under the salt-works fence, walks the length of a warm pan without hurrying, and brings back a lump of halite the size of her head." }
    ],
    restPoints: [{ x: 19, y: 25, flag: "bigboy_sat_middlewich" }],
    npcs: [
      { id: "npc_middlewich_carys", x: 28, y: 36, dir: "up", sprite: "npc_boater", behaviour: "still", script: "sw_carys" },
      { id: "npc_middlewich_jonah", x: 30, y: 21, dir: "down", sprite: "npc_bandsman", behaviour: "still", trainer: "tr_middlewich_2", sight: 0, script: "sw_middlewich_jonah" },
      { id: "npc_middlewich_rhodri", x: 41, y: 30, dir: "down", sprite: "npc_saltworker", behaviour: "look", radius: 3, trainer: "tr_middlewich_3", sight: 3 },
      { id: "npc_middlewich_meg", x: 16, y: 30, dir: "up", sprite: "npc_signaller", behaviour: "still", trainer: "tr_middlewich_4", sight: 0, script: "sw_middlewich_meg" },
      { id: "npc_middlewich_iolo", x: 8, y: 32, dir: "right", sprite: "npc_shadow_it", behaviour: "look", radius: 3, trainer: "tr_middlewich_5", sight: 3, script: "sw_middlewich_iolo" },
      { id: "npc_middlewich_emrys", x: 4, y: 30, dir: "down", sprite: "npc_farmer", behaviour: "still", script: "sw_emrys" },
      { id: "npc_middlewich_osian", x: 13, y: 12, dir: "down", sprite: "npc_bandsman", behaviour: "still", script: "sw_osian" },
      { id: "npc_middlewich_walker", x: 12, y: 21, dir: "right", sprite: "npc_walker", behaviour: "path", path: [[6, 21], [40, 21]], pathMode: "pingpong",
        say: ["Romans, salt, canals, lorries. Same road, four thousand years, one commodity."] },
      { id: "npc_middlewich_granny", x: 34, y: 24, dir: "down", sprite: "npc_granny", behaviour: "still",
        say: ["The festival speakers have started saying a thing between sets. Same words. Nobody's programmed it.",
          "It's not loud. That's what makes it rude."] },
      { id: "npc_middlewich_kid", x: 22, y: 32, dir: "up", sprite: "npc_kid", behaviour: "wander", radius: 3,
        say: ["Big Lock's fourteen foot. If you drop a coin in you never hear it land."] },
      { id: "npc_middlewich_nurse", x: 9, y: 12, dir: "down", sprite: "npc_nurse", behaviour: "still",
        say: ["VIGIL asks whether you've eaten. VIGIL asks everyone. It is a fussy, warm little machine and I have grown fond of it."] }
    ],
    triggers: [
      { x: 20, y: 23, w: 3, h: 1, script: "sw_middlewich_arrival", once: "middlewich_arrival", cond: "!middlewich_arrival && chapter >= 7", kind: "step" }
    ]
  });

  // ---------------------------------------------------------- Big Lock ----
  const L = B.canvas(28, 18, ",");
  B.frame(L, "T", 1);
  for (let x = 0; x < 28; x++) L.set("o", x, 0, "y");
  L.fill("g", 1, 1, 26, 16, ",");
  L.fill("g", 10, 1, 8, 14, "~");
  L.fill("g", 8, 1, 2, 14, "t"); L.fill("g", 18, 1, 2, 14, "t");
  L.fill("g", 10, 4, 8, 1, "K"); L.fill("g", 10, 11, 8, 1, "K");
  L.set("g", 9, 4, "k"); L.set("g", 18, 11, "k");
  L.fill("g", 1, 15, 26, 2, "_");
  L.fill("g", 2, 2, 6, 12, "\"");
  L.fill("g", 20, 2, 6, 12, "\"");
  B.house(L, { x: 20, y: 5, w: 6, h: 4, rh: 2, roof: "R", wall: "#", win: "W", door: "@", doorX: 3, over: "^" });
  L.set("g", 19, 8, "N");
  L.set("g", 4, 8, "N");
  L.set("g", 13, 15, "P");
  L.set("g", 8, 8, "8");

  W.defineMap("middlewich_big_lock", {
    name: "Big Lock", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "water", dialogue: "town_middlewich",
    legend: TOWN, layers: L.layers(),
    spawnPoint: { x: 14, y: 16 },
    landmark: { name: "Big Lock", x: 14, y: 8 },
    encounters: { water: "middlewich_water", grass: null },
    fishing: "fish_middlewich",
    warps: [
      { x: 13, y: 17, to: "middlewich", tx: 14, ty: 31, dir: "down", kind: "stairs" },
      { x: 14, y: 17, to: "middlewich", tx: 14, ty: 31, dir: "down", kind: "stairs" }
    ],
    signs: [
      { x: 4, y: 8, text: ["BIG LOCK — the only broad lock on the Trent & Mersey and the deepest thinking time on the cut.",
        "Fourteen feet. If you drop a coin in you never hear it land."] },
      { x: 19, y: 8, text: ["THE BIG LOCK (public house). Same name as the lock. Nobody has ever been confused by this."] }
    ],
    items: [{ x: 3, y: 3, item: "roe", n: 2, hidden: true, flag: "item_middlewich_big_lock_1" }],
    npcs: [
      { id: "npc_middlewich_lock_carys", x: 8, y: 6, dir: "right", sprite: "npc_boater", behaviour: "still", script: "sw_carys_test" },
      { id: "npc_middlewich_lock_boater", x: 19, y: 12, dir: "left", sprite: "npc_boater", behaviour: "still",
        say: ["Fourteen foot down, fourteen foot up, twice a day, for eleven years.", "I've read four hundred books in this lock."] }
    ]
  });

  // ------------------------------------------------------ festival field --
  const F = B.canvas(38, 28, ".");
  B.frame(F, "h", 1);
  F.fill("g", 1, 1, 36, 26, ".");
  F.fill("g", 2, 24, 34, 2, "_");
  F.fill("g", 17, 26, 4, 1, "J");
  for (let i = 0; i < 4; i++) { F.fill("g", 4 + i * 8, 5, 5, 3, "A"); F.fill("o", 4 + i * 8, 4, 5, 1, "a"); }
  F.fill("g", 3, 10, 32, 2, "_");
  F.fill("g", 6, 14, 26, 8, "\"");
  for (let i = 0; i < 8; i++) F.set("g", 8 + i * 3, 17, "q");
  F.set("g", 18, 12, "N");
  F.txt("o", 3, 3, "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
  F.set("g", 3, 21, "]"); F.set("g", 34, 21, "[");
  F.set("g", 34, 3, "\""); F.set("g", 4, 2, "\"");

  W.defineMap("middlewich_festival_field", {
    name: "The Festival Field", region: "salt", outdoor: true, music: "town_northwich", weatherZone: "salt",
    ambience: "town", dialogue: "town_middlewich",
    legend: TOWN, layers: F.layers(),
    spawnPoint: { x: 18, y: 25 },
    landmark: { name: "Folk & Boat", x: 18, y: 14 },
    encounters: { grass: null },
    warps: [
      { x: 18, y: 27, to: "middlewich", tx: 42, ty: 31, dir: "down", kind: "gate" },
      { x: 19, y: 27, to: "middlewich", tx: 42, ty: 31, dir: "down", kind: "gate" }
    ],
    signs: [{ x: 18, y: 12, text: ["MIDDLEWICH FOLK & BOAT FESTIVAL", "Stage 1: traditional. Stage 2: less traditional. Stage 3: the one with the amplifier.",
      "Stage 4 is a man in a tent playing a hurdy-gurdy who has not been asked and cannot be stopped."] }],
    items: [
      { x: 4, y: 21, item: "music_box", n: 1, flag: "item_middlewich_festival_field_1" },
      { x: 35, y: 6, item: "oats", n: 3, hidden: true, flag: "item_middlewich_festival_field_2" }
    ],
    npcs: [
      { id: "npc_middlewich_festival_osian", x: 18, y: 11, dir: "down", sprite: "npc_bandsman", behaviour: "still", script: "sw_osian_field" },
      { id: "npc_middlewich_festival_1", x: 6, y: 9, dir: "down", sprite: "npc_bandsman", behaviour: "still",
        say: ["Between sets, the PA says something. Four words. Same four every time.",
          "I've stopped listening for the words and started listening for the GAP. It's exactly thirteen minutes."] },
      { id: "npc_middlewich_festival_2", x: 28, y: 18, dir: "left", sprite: "npc_walker", behaviour: "wander", radius: 3,
        say: ["Three days of this and then a field again. That's the whole point of a festival."] }
    ],
    triggers: [
      { x: 16, y: 13, w: 5, h: 1, script: "sw_festival_pa", once: "festival_pa", cond: "!festival_pa", kind: "step" }
    ]
  });

  // ------------------------------------------------------------ interiors --
  W.defineMap("middlewich_care", W.builtin("care_centre", {
    name: "Middlewich Care Centre", dialogue: "town_middlewich", music: "town_northwich",
    warps: [{ x: 7, y: 11, to: "middlewich", tx: 7, ty: 19, dir: "down", kind: "door" },
      { x: 8, y: 11, to: "middlewich", tx: 7, ty: 19, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_middlewich_care_nurse", x: 4, y: 2, dir: "down", sprite: "npc_nurse", behaviour: "still",
      say: ["Salt bath's through the back. It stings and then it doesn't and then you feel enormous."] }]
  }));
  W.defineMap("middlewich_mart", W.builtin("shop", {
    name: "Middlewich Mart", dialogue: "town_middlewich", music: "town_northwich", shop: "shop_middlewich",
    warps: [{ x: 6, y: 9, to: "middlewich", tx: 24, ty: 19, dir: "down", kind: "door" },
      { x: 7, y: 9, to: "middlewich", tx: 24, ty: 19, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_middlewich_mart_clerk", x: 1, y: 5, dir: "down", sprite: "npc_shopkeep", behaviour: "still", shop: "shop_middlewich",
      say: ["Rope, rope, more rope, and a windlass. That's canal retail."] }]
  }));
  W.defineMap("middlewich_inn", W.builtin("pub", {
    name: "The Boar's Head", dialogue: "town_middlewich", music: "town_northwich",
    warps: [{ x: 6, y: 11, to: "middlewich", tx: 37, ty: 19, dir: "down", kind: "door" },
      { x: 7, y: 11, to: "middlewich", tx: 37, ty: 19, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_middlewich_inn_landlord", x: 2, y: 2, dir: "down", sprite: "npc_boater", behaviour: "still",
      say: ["Two canals meet outside my door and everyone who comes in is halfway to somewhere else.",
        "It makes for good listening and terrible regulars."] }]
  }));
  W.defineMap("middlewich_church", W.builtin("church", {
    name: "St Michael's, Middlewich", dialogue: "town_middlewich", music: "town_northwich",
    warps: [{ x: 6, y: 13, to: "middlewich", tx: 12, ty: 9, dir: "down", kind: "door" },
      { x: 7, y: 13, to: "middlewich", tx: 12, ty: 9, dir: "down", kind: "door" }],
    npcs: [{ id: "npc_middlewich_church_osian", x: 6, y: 2, dir: "down", sprite: "npc_bandsman", behaviour: "still", script: "sw_osian_church" }],
    items: [{ x: 1, y: 11, item: "salve", n: 3, flag: "item_middlewich_church_1" }]
  }));
  W.defineMap("middlewich_boat_office", W.builtin("house_large", {
    name: "Middlewich Boat Office", dialogue: "town_middlewich", music: "town_northwich",
    warps: [{ x: 7, y: 13, to: "middlewich", tx: 28, ty: 35, dir: "down", kind: "door" },
      { x: 8, y: 13, to: "middlewich", tx: 28, ty: 35, dir: "down", kind: "door" }],
    npcs: [
      { id: "npc_middlewich_office_clerk", x: 3, y: 4, dir: "down", sprite: "npc_boater", behaviour: "still", script: "sw_boat_office" },
      { id: "npc_middlewich_office_learner", x: 12, y: 9, dir: "left", sprite: "npc_kid", behaviour: "still",
        say: ["Failed the practical twice. Both times for wash. Both times she was right and both times I argued."] }
    ],
    signs: [{ x: 14, y: 2, text: ["A framed licence from 1957, issued to somebody's grandmother, laminated by somebody's grandson."] }]
  }));
  for (let i = 1; i <= 2; i++) {
    W.defineMap("middlewich_house_" + i, W.builtin("house_small", {
      name: "Middlewich House", dialogue: "town_middlewich", music: "town_northwich",
      warps: [{ x: 5, y: 9, to: "middlewich", tx: i === 1 ? 24 : 36, ty: 7, dir: "down", kind: "door" },
        { x: 6, y: 9, to: "middlewich", tx: i === 1 ? 24 : 36, ty: 7, dir: "down", kind: "door" }],
      npcs: [{ id: "npc_middlewich_house" + i, x: 3, y: 4, dir: "down", sprite: i === 1 ? "npc_granny" : "npc_walker", behaviour: "still",
        say: i === 1
          ? ["My father boiled brine and his father boiled brine and I do payroll for a haulier.", "Same salt. Different paperwork."]
          : ["There's a man doing the rounds who looks like somebody off the telly and talks like somebody off the telly.",
            "I said good morning and he said good morning back four frames too late. That's the only way I can describe it."] }]
    }));
  }
})();
