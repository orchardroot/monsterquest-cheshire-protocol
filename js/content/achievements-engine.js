// =============================================================
// MonsterQuest v2 — MQ.Achievements (content)
// The 40 achievements' *logic*: unlock-once, progress counters and the
// hooks that watch the rest of the game. Display data (name/desc/hidden)
// comes from MQ.Data.achievements (data workstream); the table below is
// a private fallback so toasts read properly before that file lands.
// SIDE-CONTENT §2.9, ROSTER §10 (ids ach_01 … ach_40).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.Events;
  const A = MQ.Achievements || {};

  function emit(n, d) { try { E.emit(n, d); } catch (e) { MQ.warn("[Achievements] listener threw on " + n, e); } }
  function flagGet(id) { const v = MQ.Flags ? MQ.Flags.get(id) : undefined; return v === undefined ? false : v; }
  function num(id) { const v = flagGet(id); return typeof v === "number" ? v : (v ? 1 : 0); }
  function stat(s) { return MQ.Trainer ? MQ.Trainer.stat(s) : 0; }
  function questDone(id) { return MQ.Quests ? MQ.Quests.isDone(id) : false; }
  function dexCaught(sp) { return !!(MQ.Trainer && MQ.Trainer.dex[sp] && MQ.Trainer.dex[sp].caught); }

  A.unlocked = {};        // id → timestamp
  A.counters = {};        // id → own counter (for things nothing else tracks)

  // ---- helpers used by the hook table ------------------------------
  function caughtWithHabitat(habitats) {
    if (!MQ.Trainer || !MQ.Data || !MQ.Data.species) return 0;
    let n = 0;
    const ids = Object.keys(MQ.Trainer.dex);
    for (let i = 0; i < ids.length; i++) {
      if (!MQ.Trainer.dex[ids[i]].caught) continue;
      const sp = MQ.Data.species[ids[i]];
      if (sp && habitats.indexOf(sp.habitat) >= 0) n++;
    }
    return n;
  }
  function branchMaxed() {
    if (!MQ.Progression) return 0;
    const B = MQ.Progression.BRANCHES;
    for (let i = 0; i < B.length; i++) {
      const nodes = MQ.Progression.branch(B[i]);
      let all = nodes.length > 0;
      for (let j = 0; j < nodes.length; j++) if (MQ.Progression.rank(nodes[j].id) < nodes[j].maxRank) { all = false; break; }
      if (all) return 1;
    }
    return 0;
  }
  function taggedCases(tag) {
    if (!MQ.Data || !MQ.Data.quests) return { total: 0, closed: 0 };
    let total = 0, closed = 0;
    MQ.Data.each("quests", function (d, id) {
      const tags = d.tags || (d.tag ? [d.tag] : []);
      if (tags.indexOf(tag) < 0) return;
      total++;
      if (questDone(id)) closed++;
    });
    return { total: total, closed: closed };
  }
  function counter(id) { return A.counters[id] || 0; }

  // ---- the 40 hooks -------------------------------------------------
  // { need, get() → number, name, desc } — `get` returns current progress.
  const H = {};
  function hook(id, name, desc, need, get) { H[id] = { id: id, name: name, desc: desc, need: need, get: get }; }

  hook("ach_01", "First Triage", "Win your first engagement. Everyone remembers their first ticket.", 1, function () { return stat("wins"); });
  hook("ach_02", "Walked, Not Ran", "Ten thousand tiles on foot. The dog-walkers know you now.", 10000, function () { return stat("steps"); });
  hook("ach_03", "Bothered By Weather", "A thousand tiles in the rain. It is only water.", 1000, function () { return stat("stepsRain"); });
  hook("ach_04", "Unbothered By Weather", "Five thousand tiles in the rain. It is definitely only water.", 5000, function () { return stat("stepsRain"); });
  hook("ach_05", "Paste Refused", "Decline ten ClickFix lures. Never paste what a stranger hands you.", 10, function () { return stat("luresRefused"); });
  hook("ach_06", "Not Today, Botnet", "Break the Heritage Centre's botnet at Crewe.", 1, function () { return flagGet("apt_boss_beaten") ? 1 : 0; });
  hook("ach_07", "Trust Anchor", "Earn your first badge.", 1, function () { return MQ.Trainer ? MQ.Trainer.badgeCount() : 0; });
  hook("ach_08", "Eight Anchors", "Earn all eight badges. Or all eight SIGNED, as the card would have it.", 8, function () { return MQ.Trainer ? MQ.Trainer.badgeCount() : 0; });
  hook("ach_09", "Cranford Correspondent", "A perfect round in Madam Gaskell's quiz.", 1, function () { return flagGet("quiz_perfect_knutsford") ? 1 : 0; });
  hook("ach_10", "The Bear Necessity", "Close the case of the Bear of Congleton.", 1, function () { return questDone("case_10_bear_of_congleton") ? 1 : 0; });
  hook("ach_11", "Salt of the Earth", "Catch ten creatures that live in the brine.", 10, function () { return caughtWithHabitat(["salt", "brine"]); });
  hook("ach_12", "Sighted, Not Cited", "Take fifty scored photographs.", 50, function () { return stat("photos"); });
  hook("ach_13", "Ghost in the Signal Box", "Catch POLTERGRID rather than knocking it down.", 1, function () { return dexCaught("poltergrid") ? 1 : 0; });
  hook("ach_14", "Brine Time", "Heal a hundred times at the Nantwich lido.", 100, function () { return stat("healsLido"); });
  hook("ach_15", "Balanced Caissons", "Settle the Anderton boat lift.", 1, function () { return questDone("case_22_lift_logic") ? 1 : 0; });
  hook("ach_16", "On Time, Every Time", "A perfect Crewe timetable.", 1, function () { return flagGet("timetable_perfect") ? 1 : 0; });
  hook("ach_17", "Wallwalker", "Walk the whole Chester circuit without stepping off.", 1, function () { return questDone("case_29_chester_walls_round") ? 1 : 0; });
  hook("ach_18", "Small Black Fast", "MEADOW trusts you completely.", 5, function () { return MQ.Cats ? MQ.Cats.trust("meadow") : num("trust_meadow"); });
  hook("ach_19", "Every Stopping Place", "MEADOW sits down in all six places that are worth stopping in.", 6, function () { return MQ.Cats && MQ.Cats.restsFound ? MQ.Cats.restsFound() : 0; });
  hook("ach_20", "Best Dressed", "Every collar in the county, and she will wear the plain one anyway.", 10, function () { return MQ.Cats ? Object.keys(MQ.Cats.collarsOwned || {}).length : 0; });
  hook("ach_21", "First Press", "Brew something at the elm press.", 1, function () { return stat("brews"); });
  hook("ach_22", "Mam-gu Would Approve", "Complete a Mam-gu's Cask.", 1, function () { return flagGet("brewed_brew_mamgu_cask") ? 1 : 0; });
  hook("ach_23", "Cambrian Line", "Ride the Cambrian line to the orchard.", 1, function () { return flagGet("orchard_open") ? 1 : 0; });
  hook("ach_24", "Ambidextrous", "Answer in all four languages.", 4, function () { return num("count_languages"); });
  hook("ach_25", "Ticket to Ride", "Register every station on the network.", 12, function () { return num("stations_registered"); });
  hook("ach_26", "Twelve Thousand Puppets", "Defeat a hundred Credential Stuffer grunts.", 100, function () { return stat("puppetsBeaten"); });
  hook("ach_27", "Wearing A Trusted Face", "Expose five AMOS impostors.", 5, function () { return stat("amosExposed"); });
  hook("ach_28", "Shadow IT, Sunlit", "Close every Shadow IT case. No villain, just nobody minding it.", 1, function () { const t = taggedCases("shadow_it"); return t.total > 0 && t.closed >= t.total ? 1 : 0; });
  hook("ach_29", "Bounty Hunter", "Claim twenty-five bounties.", 25, function () { return stat("bounties"); });
  hook("ach_30", "Warrant Served", "Serve five Warrants.", 5, function () { return stat("warrants"); });
  hook("ach_31", "Bronze Warrington", "Clear the Arena at Bronze.", 1, function () { return flagGet("arena_bronze_clear") ? 1 : 0; });
  hook("ach_32", "Silver Warrington", "Clear the Arena at Silver.", 1, function () { return flagGet("arena_silver_clear") ? 1 : 0; });
  hook("ach_33", "Gold Warrington", "Clear the Arena at Gold, without a single item.", 1, function () { return flagGet("arena_gold_clear") ? 1 : 0; });
  hook("ach_34", "Platinum Warrington", "Clear the Arena at Platinum, one Agent only.", 1, function () { return flagGet("arena_platinum_clear") ? 1 : 0; });
  hook("ach_35", "Obsidian", "Clear the Obsidian Arena. Twelve fights, changing weather, no mercy.", 1, function () { return flagGet("arena_obsidian_clear") ? 1 : 0; });
  hook("ach_36", "Casebook Closed", "Close all thirty cases.", 30, function () { return MQ.Quests ? MQ.Quests.closedCases() : 0; });
  hook("ach_37", "Full Dex", "Every entry, caught.", 1, function () {
    if (!MQ.Trainer) return 0;
    const total = MQ.Trainer.dexTotal();
    return total > 0 && MQ.Trainer.caughtCount() >= total ? 1 : 0;
  });
  hook("ach_38", "Overdriven", "Fire a hundred Overdrives.", 100, function () { return stat("overdrives"); });
  hook("ach_39", "Principal", "Max out one whole perk branch.", 1, branchMaxed);
  hook("ach_40", "The Cheshire Protocol", "See it through to the end, and then the end after that.", 1, function () { return flagGet("amos_jim_face") && flagGet("postgame_open") ? 1 : 0; });

  A.hooks = H;
  A.ids = Object.keys(H);
  A.TOTAL = A.ids.length;

  A.def = function (id) {
    const d = MQ.Data && MQ.Data.achievements ? MQ.Data.achievements[id] : null;
    if (d) return d;
    const h = H[id];
    return h ? { id: id, name: h.name, desc: h.desc, need: h.need } : { id: id, name: id, desc: "" };
  };
  A.has = function (id) { return !!A.unlocked[id]; };
  A.list = function () {
    const out = [];
    for (let i = 0; i < A.ids.length; i++) {
      const id = A.ids[i];
      const p = A.progress(id);
      out.push({ id: id, def: A.def(id), unlocked: A.has(id), ts: A.unlocked[id] || 0, have: p.have, need: p.need, pct: p.pct });
    }
    return out;
  };
  A.count = function () { return Object.keys(A.unlocked).length; };
  A.progress = function (id) {
    const h = H[id];
    if (!h) return { have: 0, need: 1, pct: A.has(id) ? 1 : 0 };
    if (A.has(id)) return { have: h.need, need: h.need, pct: 1 };
    let have = 0;
    try { have = Math.max(h.get() || 0, counter(id)); } catch (e) { have = counter(id); }
    return { have: Math.min(have, h.need), need: h.need, pct: U.clamp(have / h.need, 0, 1) };
  };

  // The whole point: unlock once, toast once.
  A.unlock = function (id) {
    if (A.unlocked[id]) return false;
    if (!H[id] && !(MQ.Data && MQ.Data.achievements && MQ.Data.achievements[id])) { MQ.warn("[Achievements] unknown id " + id); return false; }
    A.unlocked[id] = Date.now();
    const d = A.def(id);
    if (MQ.Flags) MQ.Flags.set(id, true);
    if (MQ.UI && MQ.UI.toast) MQ.UI.toast("Achievement: " + d.name);
    if (MQ.Audio && MQ.Audio.sfx) { try { MQ.Audio.sfx("achievement"); } catch (e) { /* optional */ } }
    if (MQ.Trainer) MQ.Trainer.addXp(5, "achievement");
    emit("achievement", { id: id, def: d, count: A.count(), total: A.TOTAL });
    return true;
  };
  // Bump an achievement's own counter (for things no other system tracks).
  A.bump = function (id, n) {
    A.counters[id] = (A.counters[id] || 0) + (n === undefined ? 1 : n);
    A.check(id);
    return A.counters[id];
  };
  A.set = function (id, n) { A.counters[id] = n; A.check(id); return n; };

  A.check = function (id) {
    if (A.unlocked[id]) return false;
    const h = H[id];
    if (!h) return false;
    let have = counter(id);
    try { have = Math.max(have, h.get() || 0); } catch (e) { /* a missing subsystem is not a failure */ }
    if (have >= h.need) return A.unlock(id);
    return false;
  };
  A.checkAll = function () {
    let n = 0;
    for (let i = 0; i < A.ids.length; i++) if (A.check(A.ids[i])) n++;
    return n;
  };

  // ---- wiring: anything that could move a counter re-checks ---------
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    // Coalesce bursts (a battle end fires several events) without a frame hook.
    Promise.resolve().then(function () { queued = false; A.checkAll(); });
  }
  A.schedule = schedule;
  const WATCH = ["trainer:stat", "trainer:badge", "trainer:perks", "flag", "quest:complete", "dex:caught",
    "dex:milestone", "cat:trust", "battle:end", "brew:done", "arena:clear", "photo", "achievement:bump"];
  for (let i = 0; i < WATCH.length; i++) E.on(WATCH[i], schedule);
  E.on("load", function () { schedule(); });
  E.on("newgame", function () { A.saveProvider.load(null); });
  E.on("brew:done", function (d) {
    if (MQ.Trainer) MQ.Trainer.bump("brews", 1);
    if (MQ.Progression) MQ.Progression.award("brew");
    if (d && d.recipe && MQ.Flags) MQ.Flags.set("brewed_" + d.recipe, true);
  });
  E.on("arena:clear", function (d) {
    if (!d || !d.tier) return;
    if (MQ.Flags) MQ.Flags.set("arena_" + d.tier + "_clear", true);
    if (MQ.Trainer) MQ.Trainer.bump("arenaClears", 1);
    if (MQ.Progression) MQ.Progression.award("arenaTier");
  });

  A.saveKey = "achievements";
  A.saveProvider = {
    save: function () { return { unlocked: U.deepClone(A.unlocked), counters: U.deepClone(A.counters) }; },
    load: function (o) {
      A.unlocked = {}; A.counters = {};
      if (!o) return;
      A.unlocked = U.deepClone(o.unlocked) || {};
      A.counters = U.deepClone(o.counters) || {};
    }
  };
  if (MQ.Save && MQ.Save.register) MQ.Save.register("achievements", A.saveProvider);

  MQ.Achievements = A;
})();
