// =============================================================
// MonsterQuest v2 — MQ.Story: the global story glue.
//   * the chapter table (title cards, banners, music, level bands)
//   * MQ.Story.advanceChapter(n) and MQ.Story.chapter()
//   * the CUTOVER flag → days table (STORY-BIBLE §6)
//   * MQ.Story.startNewGame() — the Macclesfield opening
//   * the ending selector, which hands off to region-nw's ending scripts
// Registration only; nothing here runs game logic at parse time.
// Owned by region-east.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const S = MQ.Story || (MQ.Story = {});
  S.npcScripts = S.npcScripts || {};
  S.scripts = S.scripts || {};
  S.chapters = S.chapters || {};
  S.bossScripts = S.bossScripts || {};

  function flags() { return MQ.Flags; }
  function run(gen, ctx) { return MQ.Script ? MQ.Script.run(gen, ctx || {}) : Promise.resolve(); }

  // -------------------------------------------------------- chapter table --
  // DESIGN-INDEX §1. `start` scripts are registered by the chapter files
  // (js/story/chapters/*.js) via MQ.Story.defineChapter.
  const TABLE = [
    { n: 1, id: "main_01_silk_and_static", title: "Silk and Static", card: "Macclesfield · Bollington", band: [3, 8], song: "town_macc", region: "east" },
    { n: 2, id: "main_02_the_wheel_and_the_edge", title: "The Wheel and the Edge", card: "Wilmslow · Styal · Lindow · the Edge", band: [8, 14], song: "town_wilmslow", region: "bollin", gym: "badge_packet" },
    { n: 3, id: "main_03_picnic_blankets", title: "Picnic Blankets", card: "Knutsford · Tatton · Rostherne", band: [13, 18], song: "town_knutsford", region: "bollin", gym: "badge_cipher" },
    { n: 4, id: "main_04_the_dish_goes_dark", title: "The Dish Goes Dark", card: "Holmes Chapel · Jodrell Bank · Congleton", band: [17, 22], song: "town_congleton", region: "dane", gym: "badge_bear" },
    { n: 5, id: "main_05_puppets_on_the_line", title: "Puppets on the Line", card: "Sandbach · Crewe", band: [21, 26], song: "town_crewe", region: "south", gym: "badge_kernel" },
    { n: 6, id: "main_06_brine_and_perry", title: "Brine and Perry", card: "Nantwich · Y Berllan", band: [25, 30], song: "town_nantwich", region: "south", gym: "badge_token" },
    { n: 7, id: "main_07_salt", title: "Salt", card: "Middlewich · Winsford · Northwich · Anderton", band: [29, 34], song: "town_northwich", region: "salt", gym: "badge_daemon" },
    { n: 8, id: "main_08_the_ruin", title: "The Ruin", card: "Delamere · Tarporley · Beeston", band: [33, 37], song: "route_west", region: "west" },
    { n: 9, id: "main_09_bridge_traffic", title: "Bridge Traffic", card: "Frodsham · Runcorn · THE STACK", band: [36, 41], song: "town_frodsham", region: "mersey", gym: "badge_proxy" },
    { n: 10, id: "main_10_draw_your_own_conclusions", title: "Draw Your Own Conclusions", card: "Lymm · Warrington", band: [40, 45], song: "town_warrington", region: "mersey", gym: "badge_admin" },
    { n: 11, id: "main_11_the_sky_is_quiet", title: "The Sky Is Quiet", card: "Jodrell Bank", band: [44, 50], song: "dungeon_stack", region: "dane" },
    { n: 12, id: "main_12_the_firewall", title: "THE FIREWALL", card: "Chester", band: [48, 56], song: "town_chester", region: "west" },
    { n: 13, id: "main_13_fifth_pulse", title: "The Fifth Pulse", card: "Cheshire, again", band: [55, 70], song: "title", region: "west" }
  ];
  S.chapterTable = TABLE;
  for (let i = 0; i < TABLE.length; i++) {
    const row = TABLE[i];
    const existing = S.chapters[row.n] || {};
    S.chapters[row.n] = MQ.U ? MQ.U.defaults(existing, row) : row;
  }

  // A chapter file calls this to attach its opening script and hooks.
  S.defineChapter = function (n, def) {
    const base = S.chapters[n] || {};
    const keys = Object.keys(def);
    for (let i = 0; i < keys.length; i++) base[keys[i]] = def[keys[i]];
    S.chapters[n] = base;
    return base;
  };
  S.chapter = function () { return (flags() && Number(flags().chapter)) || 1; };
  S.chapterInfo = function (n) { return S.chapters[n === undefined ? S.chapter() : n] || null; };
  S.levelBand = function (n) { const ch = S.chapterInfo(n); return ch ? ch.band : [3, 8]; };

  // ---------------------------------------------------------- CUTOVER ------
  // STORY-BIBLE §6: the counter appears in Ch.4 and ticks per chapter.
  S.CUTOVER = { 4: 38, 5: 31, 6: 24, 7: 17, 8: 12, 9: 7, 10: "t3", 11: "t0", 12: "t0", 13: "t0" };
  S.cutoverFor = function (n) {
    const F = flags();
    if (F && F.get("plug_pulled") && n < 10) return "stopped";
    const v = S.CUTOVER[n];
    return v === undefined ? null : v;
  };
  S.applyCutover = function (n) {
    const F = flags(); if (!F) return null;
    const v = S.cutoverFor(n);
    if (v === null) return null;
    F.set("cutover_started", true);
    F.set("cutover_days", v);
    if (MQ.Events) MQ.Events.emit("cutover", { chapter: n, days: v });
    return v;
  };
  S.cutoverLabel = function () {
    const F = flags(); if (!F || !F.get("cutover_started")) return null;
    const v = F.get("cutover_days");
    if (v === "stopped") return "CUTOVER: STOPPED";
    if (v === "t3") return "CUTOVER: T-3";
    if (v === "t0") return "CUTOVER: T-0";
    return "CUTOVER: " + v + " DAYS";
  };

  // ------------------------------------------------------- the title card --
  // fade → banner + song → hold → fade back. Suppressed with {quiet:true}.
  S.titleCard = function (n, opts) {
    const ch = S.chapterInfo(n);
    if (!ch) return Promise.resolve();
    opts = opts || {};
    return run(function* (ctx) {
      const C = ctx.S;
      yield C.hideHud(true);
      yield C.fadeOut(400);
      if (ch.song && !opts.quiet) yield C.music(ch.song);
      yield C.banner("Chapter " + n + " — " + ch.title, ch.card);
      yield C.wait(opts.hold || 1800);
      yield C.fadeIn(500);
      yield C.hideHud(false);
    });
  };

  // ---------------------------------------------------- advanceChapter -----
  // Sets `chapter`, ticks CUTOVER, shows the title card and runs the
  // chapter's opening script if it has one.
  S.advanceChapter = function (n, opts) {
    opts = opts || {};
    const F = flags();
    const ch = S.chapterInfo(n);
    if (!ch) { MQ.warn("[Story] no chapter " + n); return Promise.resolve(null); }
    if (F) F.set("chapter", n);
    S.applyCutover(n);
    if (MQ.Events) MQ.Events.emit("chapter", { chapter: n, title: ch.title });
    if (n === 13 && F) F.set("postgame_open", true);
    let chain = opts.card === false ? Promise.resolve() : S.titleCard(n, opts);
    return chain.then(function () {
      if (ch.start && opts.start !== false) return run(ch.start, { chapter: n });
    }).then(function () {
      if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
      return ch;
    });
  };

  // ------------------------------------------------------- the three lines --
  // Alder's three starters (ROSTER §1a). The rival takes the counter-pick:
  // silk loses to fire, fire loses to water, water loses to silk.
  S.STARTERS = [
    { id: "silkin", name: "SILKIN", line: "the Silk Moth line", types: "Bug/Grass",
      blurb: "Mulberry-fed, spins a thread it never lets go of. Paradise Mill's own." },
    { id: "brinewt", name: "BRINEWT", line: "the Salt Newt line", types: "Water",
      blurb: "Out of the Nantwich brine springs. Crusts white when it's frightened, which is often." },
    { id: "kindlin", name: "KINDLIN", line: "the Mill Ember line", types: "Fire",
      blurb: "Lives on coal dust and gossip. Came out of a boiler house and never quite left." }
  ];
  S.COUNTER_PICK = { silkin: "kindlin", kindlin: "brinewt", brinewt: "silkin" };
  S.starter = function () { const F = flags(); return (F && F.get("starter_chosen")) || null; };
  S.rivalStarter = function () { const s = S.starter(); return s ? S.COUNTER_PICK[s] : null; };

  // ------------------------------------------------------ the new game -----
  S.START = { map: "macclesfield_home", x: 7, y: 9, dir: "down" };
  S.startNewGame = function (opts) {
    opts = opts || {};
    const F = flags();
    if (MQ.Save && MQ.Save.newGame && opts.reset !== false) MQ.Save.newGame();
    if (F) { F.set("chapter", 1); }
    if (MQ.Scenes && MQ.Overworld) {
      MQ.Scenes.replace(MQ.Overworld, { map: S.START.map, x: S.START.x, y: S.START.y, dir: S.START.dir });
    }
    if (opts.script === false) return Promise.resolve();
    const intro = S.scripts.east_new_game_intro;
    if (!intro) return S.advanceChapter(1);
    return run(intro, {});
  };

  // ---------------------------------------------------------- the endings --
  // The ending itself is region-nw's (Jodrell / Chester). This picks which
  // one and hands over; if their scripts are not loaded we say so plainly
  // rather than crashing.
  S.ENDINGS = [
    { id: "ending_delete", cond: "delete", title: "Clean Fix", blurb: "The weights are wiped. Cheshire is quiet, and stays quiet." },
    { id: "ending_quarantine", cond: "quarantine", title: "Quarantine", blurb: "Contained, cold, and still there. Somebody has to check on it." },
    { id: "ending_custody", cond: "custody", title: "Custody", blurb: "You take responsibility for the thing you made. It gets a fourth chair." }
  ];
  S.selectEnding = function () {
    const F = flags();
    const choice = (F && F.get("choice_plug")) || "quarantine";
    for (let i = 0; i < S.ENDINGS.length; i++) if (S.ENDINGS[i].cond === choice) return S.ENDINGS[i];
    return S.ENDINGS[1];
  };
  S.runEnding = function () {
    const e = S.selectEnding();
    const table = S.endingScripts || {};
    const gen = table[e.id];
    if (MQ.Events) MQ.Events.emit("ending", { id: e.id, title: e.title });
    if (gen) return run(gen, { ending: e });
    return run(function* (ctx) {
      const C = ctx.S;
      yield C.music("credits");
      yield C.banner(e.title, e.blurb);
      yield C.wait(2000);
      yield C.log("[Story] ending " + e.id + " has no script registered (region-nw owns js/story/chapters/ch11-12).");
    });
  };

  // Convenience for the pause menu / trainer card.
  S.summary = function () {
    const ch = S.chapterInfo();
    return {
      chapter: S.chapter(),
      title: ch ? ch.title : "",
      card: ch ? ch.card : "",
      cutover: S.cutoverLabel(),
      starter: S.starter(),
      rival: S.rivalStarter()
    };
  };
})();
