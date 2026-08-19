// =============================================================
// MonsterQuest v2 — MQ.Quests (content)
// Quest state machine for main chapters, the 30-case Casebook, bounties
// and season cases. Definitions live in MQ.Data.quests (data workstream);
// everything here is state, evaluation, rewards and the clue board.
// ENGINE-ARCHITECTURE §7, SIDE-CONTENT §1 & §2.1, STORY-BIBLE §6.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.Events;
  const Q = MQ.Quests || {};

  function emit(n, d) { try { E.emit(n, d); } catch (e) { MQ.warn("[Quests] listener threw on " + n, e); } }
  function toast(t) { if (MQ.UI && MQ.UI.toast) MQ.UI.toast(t); }
  function flagGet(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }
  function flagSet(id, v) { if (MQ.Flags) MQ.Flags.set(id, v === undefined ? true : v); }
  function test(expr) { return MQ.Flags && MQ.Flags.test ? !!MQ.Flags.test(expr) : false; }

  Q.states = {};             // id → state
  Q.trackedId = null;
  Q.visited = {};            // mapId → true (for {kind:'reach'})
  Q.clues = {};              // clueId → clue
  Q.clueOrder = [];
  Q.links = [];              // {a, b, text, revealed}
  Q.seed = 0;                // save seed, mixed into the daily bounty roll
  Q.board = { day: null, ids: [] };

  Q.def = function (id) {
    const d = MQ.Data && MQ.Data.quests ? MQ.Data.quests[id] : null;
    return d || null;
  };
  Q.name = function (id) { const d = Q.def(id); return (d && d.name) || String(id).replace(/_/g, " "); };
  Q.stages = function (id) { const d = Q.def(id); return (d && d.stages) || []; };

  function st(id) {
    if (!Q.states[id]) Q.states[id] = { id: id, stage: -1, started: false, done: false, failed: false, ts: 0, repeats: 0, counters: {}, twist: false, marks: 0 };
    return Q.states[id];
  }
  Q.state = function (id) { return Q.states[id] || null; };
  // Stage index, or -1. With no definition we fall back to the `quest_<id>`
  // flag that MQ.Script writes in its degraded mode, so conditions still read.
  Q.stage = function (id) {
    const s = Q.states[id];
    if (!s) {
      const v = flagGet("quest_" + id);
      return typeof v === "number" ? v : -1;
    }
    return s.done ? Math.max(s.stage, Q.stages(id).length) : s.stage;
  };
  Q.isStarted = function (id) { return !!(Q.states[id] && Q.states[id].started); };
  Q.isActive = function (id) { const s = Q.states[id]; return !!(s && s.started && !s.done && !s.failed); };
  Q.isDone = function (id) { return !!(Q.states[id] && Q.states[id].done); };
  Q.pin = function (id) { const s = Q.states[id]; return !s || !s.started ? "Open" : s.done ? "Closed" : "In Hand"; };
  Q.currentStage = function (id) { const s = Q.states[id]; if (!s || !s.started || s.done) return null; return Q.stages(id)[s.stage] || null; };
  Q.stageText = function (id) {
    const stg = Q.currentStage(id);
    if (stg) return stg.text || "";
    const s = Q.states[id];
    if (s && s.done) return "Closed.";
    return "";
  };

  Q.active = function () {
    const out = [];
    const ids = Object.keys(Q.states);
    for (let i = 0; i < ids.length; i++) if (Q.isActive(ids[i])) out.push(Q.states[ids[i]]);
    return out;
  };
  Q.completed = function () {
    const out = [];
    const ids = Object.keys(Q.states);
    for (let i = 0; i < ids.length; i++) if (Q.states[ids[i]].done) out.push(Q.states[ids[i]]);
    return out;
  };
  Q.all = function () { return Q.states; };
  Q.byKind = function (kind) {
    const out = [];
    if (!MQ.Data || !MQ.Data.quests) return out;
    MQ.Data.each("quests", function (d, id) { if (d.kind === kind) out.push(id); });
    return out;
  };
  Q.byTown = function (town) {
    const out = [];
    if (!MQ.Data || !MQ.Data.quests) return out;
    MQ.Data.each("quests", function (d, id) { if (d.town === town) out.push(id); });
    return out;
  };
  // Cases you could take right now but have not (the Casebook's "Open" pin).
  Q.available = function () {
    const out = [];
    if (!MQ.Data || !MQ.Data.quests) return out;
    MQ.Data.each("quests", function (d, id) {
      const s = Q.states[id];
      if (s && (s.started || s.done)) return;
      if (d.opens && !test(d.opens)) return;
      out.push(id);
    });
    return out;
  };

  // ---- lifecycle ---------------------------------------------------
  Q.start = function (id, opts) {
    opts = opts || {};
    const d = Q.def(id);
    const s = st(id);
    if (s.started && !s.done) return false;
    if (s.done && !(d && d.repeatable)) return false;
    if (d && d.opens && !opts.force && !test(d.opens)) return false;
    s.started = true; s.done = false; s.failed = false; s.stage = 0; s.ts = Date.now(); s.counters = {};
    flagSet("quest_" + id, 0);
    if (d && d.tracks !== false && !Q.trackedId) Q.trackedId = id;
    emit("quest:start", { id: id, def: d, state: s });
    if (d) toast("Case opened: " + Q.name(id));
    runStageHook(id, 0, "onStart");
    Q.check();
    return true;
  };

  Q.setStage = function (id, index) {
    const s = st(id);
    if (!s.started) { s.started = true; s.ts = Date.now(); }
    const stages = Q.stages(id);
    s.stage = U.clamp(index, 0, Math.max(0, stages.length));
    flagSet("quest_" + id, s.stage);
    emit("quest:stage", { id: id, stage: s.stage, state: s });
    if (stages.length && s.stage >= stages.length) Q.complete(id);
    return s.stage;
  };

  // Advance n stages, firing each completed stage's rewards and hooks.
  Q.advance = function (id, n) {
    n = n === undefined ? 1 : n;
    const s = st(id);
    if (!s.started) Q.start(id, { force: true });
    if (s.done) return false;
    const stages = Q.stages(id);
    for (let k = 0; k < n; k++) {
      if (s.done) break;
      const stg = stages[s.stage];
      if (stg) {
        if (stg.flag) flagSet(stg.flag, true);
        if (stg.clue) Q.pinClue(U.merge({ source: id }, stg.clue));
        if (stg.twist) { s.twist = true; emit("quest:twist", { id: id, text: stg.twist }); }
        if (stg.reward) Q.grantReward(stg.reward, id);
        if (MQ.Progression) MQ.Progression.award("questStage");
        runStageHook(id, s.stage, "onComplete");
        emit("quest:stagedone", { id: id, stage: s.stage, def: stg });
      }
      s.stage++;
      flagSet("quest_" + id, s.stage);
      // With no definition (a script driving an id the data has not shipped
      // yet) we keep counting rather than closing the case.
      if (stages.length && s.stage >= stages.length) { Q.complete(id); break; }
      if (!stages.length) { emit("quest:stage", { id: id, stage: s.stage, state: s }); break; }
      runStageHook(id, s.stage, "onStart");
      emit("quest:stage", { id: id, stage: s.stage, state: s });
      const next = stages[s.stage];
      if (next && next.text && Q.trackedId === id) toast(next.text);
    }
    return true;
  };

  Q.complete = function (id, opts) {
    opts = opts || {};
    const d = Q.def(id);
    const s = st(id);
    if (s.done) return false;
    s.done = true; s.started = true; s.failed = false;
    s.stage = Q.stages(id).length;
    flagSet("quest_" + id, s.stage);
    flagSet(id + "_done", true);
    if (d && d.reward && !opts.noReward) Q.grantReward(d.reward, id);
    if (MQ.Progression) MQ.Progression.award("questDone");
    if (MQ.Trainer && d && (d.kind === "case" || d.kind === "main")) MQ.Trainer.bump("casesClosed", 1);
    if (MQ.Trainer && d && d.kind === "bounty") {
      MQ.Trainer.bump("bounties", 1);
      if (d.tier === "warrant") MQ.Trainer.bump("warrants", 1);
      if (MQ.Progression) MQ.Progression.award(d.tier === "warrant" ? "warrant" : "bounty");
    }
    if (d && d.onComplete) runScript(d.onComplete, { quest: id });
    if (Q.trackedId === id) Q.trackedId = pickNextTracked();
    toast("Case closed: " + Q.name(id));
    emit("quest:complete", { id: id, def: d, state: s });
    if (d && d.repeatable) {
      s.repeats++;
      s.done = false; s.started = false; s.stage = -1; s.counters = {};
      flagSet("quest_" + id, -1);
    }
    Q.check();
    return true;
  };

  Q.fail = function (id) {
    const s = st(id);
    if (s.done || !s.started) return false;
    s.failed = true;
    emit("quest:fail", { id: id, state: s });
    if (Q.trackedId === id) Q.trackedId = pickNextTracked();
    return true;
  };
  Q.reset = function (id) { delete Q.states[id]; flagSet("quest_" + id, -1); };

  function pickNextTracked() {
    const a = Q.active();
    for (let i = 0; i < a.length; i++) { const d = Q.def(a[i].id); if (d && d.kind === "main") return a[i].id; }
    return a.length ? a[0].id : null;
  }
  Q.track = function (id) {
    if (id && !Q.isActive(id)) return false;
    Q.trackedId = id || null;
    emit("quest:track", { id: Q.trackedId });
    return true;
  };
  Q.untrack = function () { return Q.track(null); };
  // HUD payload for the quest tracker.
  Q.tracked = function () {
    if (!Q.trackedId) return null;
    const id = Q.trackedId;
    if (!Q.isActive(id)) { Q.trackedId = pickNextTracked(); if (!Q.trackedId) return null; }
    const s = Q.states[Q.trackedId];
    const d = Q.def(Q.trackedId);
    const stages = Q.stages(Q.trackedId);
    return {
      id: Q.trackedId, name: Q.name(Q.trackedId), kind: (d && d.kind) || "case",
      stage: s.stage, total: stages.length, text: Q.stageText(Q.trackedId),
      hint: (stages[s.stage] && stages[s.stage].hint) || "", progress: Q.progress(Q.trackedId)
    };
  };
  // {have, need} for counter-shaped stages, else null.
  Q.progress = function (id) {
    const stg = Q.currentStage(id);
    if (!stg || !stg.cond) return null;
    const c = stg.cond;
    if (typeof c !== "object" || !c.n || c.n <= 1) return null;
    const s = st(id);
    return { have: Math.min(c.n, counterFor(id, c, s)), need: c.n };
  };

  // ---- scripts & rewards --------------------------------------------
  function resolveScript(name) {
    if (typeof name === "function") return name;
    if (!MQ.Story) return null;
    if (MQ.Story.scripts && MQ.Story.scripts[name]) return MQ.Story.scripts[name];
    if (MQ.Story.npcScripts && MQ.Story.npcScripts[name]) return MQ.Story.npcScripts[name];
    return null;
  }
  function runScript(name, ctx) {
    const fn = resolveScript(name);
    if (!fn) { emit("quest:script", { name: name, ctx: ctx, missing: true }); return null; }
    if (!MQ.Script || !MQ.Script.run) return null;
    try { return MQ.Script.run(fn, ctx); }
    catch (e) { MQ.warn("[Quests] script " + name + " threw", e); return null; }
  }
  Q.runScript = runScript;
  function runStageHook(id, index, hook) {
    const stg = Q.stages(id)[index];
    if (!stg || !stg[hook]) return;
    runScript(stg[hook], { quest: id, stage: index });
  }

  Q.grantReward = function (r, questId) {
    if (!r) return null;
    const given = { money: 0, items: [], marks: 0, chips: 0, perk: 0, monster: null };
    const Inv = MQ.Inventory;
    if (r.money && Inv) given.money = Inv.addMoney(r.money, { prize: true });
    if (r.marks && Inv) { Inv.addMarks(r.marks); given.marks = r.marks; if (Q.states[questId]) Q.states[questId].marks += r.marks; }
    if (r.chips && Inv) { Inv.addChips(r.chips); given.chips = r.chips; }
    if (r.items && Inv) for (let i = 0; i < r.items.length; i++) { Inv.add(r.items[i].id, r.items[i].n || 1, { toast: false }); given.items.push(r.items[i]); }
    if (r.gear && Inv) { Inv.add(r.gear, 1, { toast: false }); given.items.push({ id: r.gear, n: 1 }); }
    if (r.perk && MQ.Trainer) { MQ.Trainer.grantPerkPoints(r.perk, "quest"); given.perk = r.perk; }
    if (r.xp && MQ.Trainer) MQ.Trainer.addXp(r.xp, "quest");
    if (r.trust && MQ.Cats) MQ.Cats.addTrust(r.trust.cat, r.trust.n || 1, "quest");
    if (r.title && MQ.Trainer) MQ.Trainer.addTitle(r.title);
    if (r.flags) for (let i = 0; i < r.flags.length; i++) flagSet(r.flags[i], true);
    if (r.unlock) {
      if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities) { try { MQ.Overworld.state.abilities.add(r.unlock); } catch (e) { /* ignore */ } }
      else flagSet("unlock_" + r.unlock, true);
    }
    if (r.monster && MQ.Party) {
      const mon = MQ.Party.make(r.monster.species, r.monster.level || 5, { gifted: true, nickname: r.monster.nickname });
      MQ.Party.add(mon);
      given.monster = mon;
      if (MQ.Trainer) MQ.Trainer.record(r.monster.species, { map: r.monster.map, level: mon.level });
    }
    emit("quest:reward", { quest: questId, reward: r, given: given });
    return given;
  };

  // ---- condition evaluation ------------------------------------------
  function counterFor(id, c, s) {
    const key = condKey(c);
    const own = s.counters[key] || 0;
    if (c.kind === "item") return MQ.Inventory ? MQ.Inventory.count(c.id) : 0;
    if (c.kind === "catch" && c.species && MQ.Trainer && MQ.Trainer.dex[c.species]) return Math.max(own, MQ.Trainer.dex[c.species].caught);
    if (c.kind === "count" && c.flag) { const v = flagGet(c.flag); return typeof v === "number" ? v : (v ? 1 : 0); }
    return own;
  }
  function condKey(c) {
    if (typeof c === "string") return "expr:" + c;
    if (typeof c === "function") return "fn";
    return c.kind + ":" + (c.trainer || c.species || c.id || c.npc || c.map || c.flag || c.cls || "any");
  }
  Q.condKey = condKey;

  // Is this stage's condition satisfied right now?
  Q.evalCond = function (c, id) {
    if (c === undefined || c === null) return false;
    if (typeof c === "string") return test(c);
    if (typeof c === "function") { try { return !!c(Q.states[id], id); } catch (e) { return false; } }
    const s = st(id);
    const n = c.n || 1;
    switch (c.kind) {
      case "flag": return test(c.expr || c.flag);
      case "none": case "manual": return false;
      case "defeat":
        if (c.trainer) return !!flagGet("beat_" + c.trainer);
        return counterFor(id, c, s) >= n;
      case "catch": return counterFor(id, c, s) >= n;
      case "item": return (MQ.Inventory ? MQ.Inventory.count(c.id) : 0) >= n;
      case "talk": return !!flagGet("talked_" + c.npc);
      case "reach": return !!Q.visited[c.map] || (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.map === c.map);
      case "photo": return counterFor(id, c, s) >= n;
      case "count": return counterFor(id, c, s) >= n;
      case "money": return (MQ.Inventory ? MQ.Inventory.money : 0) >= n;
      case "badges": return (MQ.Trainer ? MQ.Trainer.badgeCount() : 0) >= n;
      case "level": return (MQ.Trainer ? MQ.Trainer.level : 1) >= n;
      case "quest": return Q.stage(c.id) >= (c.stage === undefined ? 0 : c.stage) || (c.done && Q.isDone(c.id));
      case "trust": return (MQ.Cats ? MQ.Cats.trust(c.cat) : 0) >= n;
      case "all":
        for (let i = 0; i < (c.of || []).length; i++) if (!Q.evalCond(c.of[i], id)) return false;
        return (c.of || []).length > 0;
      case "any":
        for (let j = 0; j < (c.of || []).length; j++) if (Q.evalCond(c.of[j], id)) return true;
        return false;
      default: return false;
    }
  };

  // Evaluate every active quest; advance any stage whose condition holds.
  let checking = false;
  Q.check = function () {
    if (checking) return 0;
    checking = true;
    let moved = 0;
    try {
      for (let pass = 0; pass < 8; pass++) {
        let any = false;
        const act = Q.active();
        for (let i = 0; i < act.length; i++) {
          const s = act[i];
          const stg = Q.stages(s.id)[s.stage];
          if (!stg || !stg.cond) continue;
          if (Q.evalCond(stg.cond, s.id)) { Q.advance(s.id, 1); any = true; moved++; }
        }
        // auto-open quests whose `opens` expression just became true
        if (MQ.Data && MQ.Data.quests) {
          MQ.Data.each("quests", function (d, id) {
            if (!d.auto || Q.states[id]) return;
            if (d.opens && !test(d.opens)) return;
            Q.start(id, { force: true });
            any = true; moved++;
          });
        }
        if (!any) break;
      }
    } finally { checking = false; }
    return moved;
  };

  // Bump a per-quest counter for every active quest whose stage wants it.
  function bump(kind, match, n) {
    n = n || 1;
    const act = Q.active();
    let touched = false;
    for (let i = 0; i < act.length; i++) {
      const s = act[i];
      const stg = Q.stages(s.id)[s.stage];
      if (!stg || !stg.cond) continue;
      const conds = stg.cond.kind === "all" || stg.cond.kind === "any" ? stg.cond.of : [stg.cond];
      for (let j = 0; j < conds.length; j++) {
        const c = conds[j];
        if (!c || typeof c !== "object" || c.kind !== kind) continue;
        if (!match(c)) continue;
        const k = condKey(c);
        s.counters[k] = (s.counters[k] || 0) + n;
        touched = true;
      }
    }
    if (touched) Q.check();
  }
  Q.bump = bump;

  // =============================================================
  // Clue board (STORY-BIBLE §6) — pins per chapter, links between pins.
  // =============================================================
  Q.pinClue = function (clue) {
    if (!clue || !clue.id) return null;
    if (Q.clues[clue.id]) return Q.clues[clue.id];
    const c = {
      id: clue.id, chapter: clue.chapter === undefined ? (MQ.Flags ? MQ.Flags.chapter : 1) : clue.chapter,
      title: clue.title || U.capitalise(String(clue.id).replace(/_/g, " ")),
      text: clue.text || "", source: clue.source || "", ts: Date.now(),
      links: clue.links ? clue.links.slice() : []
    };
    Q.clues[c.id] = c;
    Q.clueOrder.push(c.id);
    emit("clue:pin", { clue: c });
    toast("Pinned to the board: " + c.title);
    // auto-link anything that named this clue in advance
    for (let i = 0; i < c.links.length; i++) if (Q.clues[c.links[i]]) Q.linkClues(c.id, c.links[i]);
    return c;
  };
  Q.clueBoard = function (chapter) {
    const out = [];
    for (let i = 0; i < Q.clueOrder.length; i++) {
      const c = Q.clues[Q.clueOrder[i]];
      if (chapter === undefined || c.chapter === chapter) out.push(c);
    }
    return out;
  };
  Q.hasClue = function (id) { return !!Q.clues[id]; };
  // The reveal is a line drawn between two pins.
  Q.linkClues = function (a, b, opts) {
    opts = opts || {};
    if (!Q.clues[a] || !Q.clues[b]) return null;
    for (let i = 0; i < Q.links.length; i++) {
      const l = Q.links[i];
      if ((l.a === a && l.b === b) || (l.a === b && l.b === a)) return l;
    }
    const link = { a: a, b: b, text: opts.text || "", ts: Date.now() };
    Q.links.push(link);
    if (opts.flag) flagSet(opts.flag, true);
    emit("clue:link", { link: link, a: Q.clues[a], b: Q.clues[b] });
    if (link.text) toast(link.text);
    Q.check();
    return link;
  };
  Q.clueLinks = function (chapter) {
    if (chapter === undefined) return Q.links.slice();
    return Q.links.filter(function (l) { return Q.clues[l.a] && Q.clues[l.a].chapter === chapter; });
  };

  // =============================================================
  // Casebook view model (SIDE-CONTENT: grouped by town, pin, twist, Marks)
  // =============================================================
  Q.casebook = function () {
    const towns = {};
    const order = [];
    if (!MQ.Data || !MQ.Data.quests) return { towns: [], closed: 0, total: 0, marks: 0, rank: Q.rank() };
    let closed = 0, total = 0, marks = 0;
    MQ.Data.each("quests", function (d, id) {
      if (d.kind !== "case") return;
      total++;
      const s = Q.states[id];
      if (s && s.done) closed++;
      if (s) marks += s.marks;
      const town = d.town || "Elsewhere";
      if (!towns[town]) { towns[town] = { town: town, cases: [] }; order.push(town); }
      towns[town].cases.push({
        id: id, name: d.name, giver: d.giver, summary: d.summary,
        pin: Q.pin(id), twist: !!(s && s.twist), marks: s ? s.marks : 0,
        stage: s ? s.stage : -1, total: (d.stages || []).length,
        text: Q.stageText(id), teaches: d.teaches || ""
      });
    });
    const list = [];
    for (let i = 0; i < order.length; i++) list.push(towns[order[i]]);
    return { towns: list, closed: closed, total: total, marks: marks, rank: Q.rank() };
  };
  Q.closedCases = function () {
    let n = 0;
    const ids = Object.keys(Q.states);
    for (let i = 0; i < ids.length; i++) { const d = Q.def(ids[i]); if (d && d.kind === "case" && Q.states[ids[i]].done) n++; }
    return n;
  };
  Q.rank = function () { return MQ.Trainer ? MQ.Trainer.rank() : { id: "probationer", name: "Probationer" }; };

  // =============================================================
  // Bounty board (SIDE-CONTENT §2.1) — 3 a day, seeded, never rerollable
  // =============================================================
  Q.BOUNTY_TIERS = {
    petty: { name: "Petty", levelBonus: 0.5, money: [400, 700], marks: 1, weight: 60 },
    notable: { name: "Notable", levelBonus: 0.6, money: [900, 1500], marks: 3, weight: 30 },
    warrant: { name: "Warrant", levelBonus: 0.75, money: [2500, 4000], marks: 8, weight: 10, weekly: true }
  };
  // Private fallback so the board works before js/data/achievements.js lands.
  const BOUNTY_FALLBACK = [
    { species: "rottling", name: "Bramble", clue: "chewed berries along the Bollin path", tier: "petty" },
    { species: "stagwire", name: "Nine-Point", clue: "hoofprints in the Tatton sand, always at dusk", tier: "notable" },
    { species: "saltling", name: "Runaway", clue: "a white crust on the towpath by the Weaver", tier: "petty" },
    { species: "sheepwire", name: "The Flock's Ghost", clue: "wool caught on a Nantwich fence, humming", tier: "petty" },
    { species: "chordle", name: "Third Verse", clue: "a note held too long near the Middlewich choir", tier: "notable" },
    { species: "poltergrid", name: "Small Hours", clue: "levers moving in the Holmes Chapel box at night", tier: "notable" },
    { species: "spindrake", name: "Honey Morph", clue: "a lamp in Bollington with the wrong moths on it", tier: "petty" },
    { species: "amoslurk", name: "The Understudy's Understudy", clue: "someone wearing a face you have already met", tier: "warrant" },
    { species: "trojanox", name: "Signed Driver", clue: "a fridge at Runcorn that will not go dark", tier: "warrant" }
  ];
  function bountyPool() {
    if (MQ.Data && MQ.Data.bounties && MQ.Data.count("bounties")) return MQ.Data.list("bounties");
    return BOUNTY_FALLBACK;
  }
  Q.dayKey = function () {
    const r = MQ.Clock && MQ.Clock.real ? MQ.Clock.real : null;
    const d = r && r.date ? new Date(r.date) : new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  };
  // Roll today's three bounties. Seeded from the real date + save seed, so
  // closing and reopening the game gives you the same board.
  Q.rollBounties = function (force) {
    const day = Q.dayKey();
    if (!force && Q.board.day === day && Q.board.ids.length) return Q.board.ids.slice();
    const rnd = U.rng(day * 7919 + (Q.seed || 0));
    const pool = U.shuffle(bountyPool().slice(), rnd);
    const level = MQ.Party && MQ.Party.first() ? MQ.Party.first().level : 10;
    const ids = [];
    const weekly = Math.floor(day / 7) % 3 === 0;
    for (let i = 0; i < pool.length && ids.length < 3; i++) {
      const b = pool[i];
      let tier = b.tier || "petty";
      if (tier === "warrant" && !weekly) tier = "notable";
      const t = Q.BOUNTY_TIERS[tier];
      const id = "bounty_" + b.species + "_" + (ids.length + 1);
      const target = Math.max(3, Math.round(level * (1 + t.levelBonus)));
      MQ.Data.define("quests", id, {
        name: (b.name || U.capitalise(b.species)) + " — " + t.name + " Bounty",
        kind: "bounty", tier: tier, town: b.town || "board", giver: b.giver || { npc: "bounty_board" },
        summary: b.clue, teaches: "the board",
        species: b.species, targetLevel: target,
        stages: [
          { id: "s1", text: "Find it: " + b.clue, hint: b.clue, cond: { kind: "defeat", species: b.species, n: 1 } },
          { id: "s2", text: "Report back at any town hall.", cond: { kind: "talk", npc: "bounty_board" } }
        ],
        reward: { money: U.randInt(t.money[0], t.money[1], rnd), marks: t.marks, items: tier === "warrant" ? [{ id: "capsule_kernel", n: 2 }] : [] },
        repeatable: false, __override: true
      });
      ids.push(id);
    }
    Q.board = { day: day, ids: ids };
    emit("bounty:board", { day: day, ids: ids });
    return ids.slice();
  };
  Q.bountyBoard = function () {
    const ids = Q.rollBounties();
    const out = [];
    for (let i = 0; i < ids.length; i++) {
      const d = Q.def(ids[i]);
      if (!d) continue;
      out.push({ id: ids[i], name: d.name, tier: d.tier, clue: d.summary, pin: Q.pin(ids[i]), reward: d.reward });
    }
    return out;
  };
  Q.acceptBounty = function (id) { return Q.start(id, { force: true }); };

  // =============================================================
  // Event wiring — quests re-evaluate on anything that could satisfy them
  // =============================================================
  E.on("flag", function (d) { if (!d || String(d.id).indexOf("quest_") === 0) return; Q.check(); });
  E.on("item:get", function (d) { if (d) bump("item", function () { return true; }, 0); Q.check(); });
  E.on("catch", function (d) {
    if (!d) return;
    bump("catch", function (c) { return !c.species || c.species === d.species; }, 1);
    Q.check();
  });
  E.on("photo", function (d) {
    d = d || {};
    bump("photo", function (c) { return !c.species || c.species === d.species; }, 1);
    if (MQ.Trainer) MQ.Trainer.bump("photos", 1);
    if (MQ.Progression) MQ.Progression.award("photo");
    Q.check();
  });
  E.on("npc:talk", function (d) {
    if (!d || !d.npc) return;
    flagSet("talked_" + d.npc, true);
    Q.check();
  });
  E.on("map:enter", function (d) {
    if (!d || !d.map) return;
    Q.visited[d.map] = true;
    Q.check();
  });
  E.on("battle:end", function (r) {
    if (!r) return;
    if (r.outcome === "win") {
      if (r.trainer) flagSet("beat_" + r.trainer, true);
      const species = r.species || (r.enemy && r.enemy.species) || null;
      bump("defeat", function (c) {
        if (c.trainer) return c.trainer === r.trainer;
        if (c.species) return c.species === species;
        if (c.cls) return c.cls === r.cls;
        return true;
      }, 1);
    }
    Q.check();
  });
  E.on("newgame", function () { Q.saveProvider.load(null); });

  Q.saveKey = "quests";
  Q.saveProvider = {
    save: function () {
      return {
        states: U.deepClone(Q.states), tracked: Q.trackedId, visited: U.deepClone(Q.visited),
        clues: U.deepClone(Q.clues), clueOrder: Q.clueOrder.slice(), links: U.deepClone(Q.links),
        board: U.deepClone(Q.board), seed: Q.seed
      };
    },
    load: function (o) {
      Q.states = {}; Q.trackedId = null; Q.visited = {};
      Q.clues = {}; Q.clueOrder = []; Q.links = []; Q.board = { day: null, ids: [] };
      Q.seed = 0;
      if (!o) { Q.seed = Math.floor(Math.random() * 1e9); return; }
      Q.states = U.deepClone(o.states) || {};
      Q.trackedId = o.tracked || null;
      Q.visited = U.deepClone(o.visited) || {};
      Q.clues = U.deepClone(o.clues) || {};
      Q.clueOrder = (o.clueOrder || Object.keys(Q.clues)).slice();
      Q.links = U.deepClone(o.links) || [];
      Q.board = U.deepClone(o.board) || { day: null, ids: [] };
      Q.seed = o.seed || Math.floor(Math.random() * 1e9);
    }
  };
  if (MQ.Save && MQ.Save.register) MQ.Save.register("quests", Q.saveProvider);
  Q.seed = Math.floor(Math.random() * 1e9);

  // Quest data sanity — lenient, so a partly-written data file is not fatal.
  if (MQ.Data && MQ.Data.validators) {
    MQ.Data.validators.push(function (err, Data) {
      Data.each("quests", function (d, id) {
        if (!d.name) err("quest " + id + ": missing name");
        if (!d.stages || !d.stages.length) { err("quest " + id + ": no stages"); return; }
        for (let i = 0; i < d.stages.length; i++) {
          const s = d.stages[i];
          if (!s.id) err("quest " + id + " stage " + i + ": missing id");
          if (s.cond && typeof s.cond === "object" && !s.cond.kind) err("quest " + id + " stage " + (s.id || i) + ": cond object needs a kind");
        }
        if (d.reward && d.reward.items) for (let j = 0; j < d.reward.items.length; j++) {
          const it = d.reward.items[j];
          if (!it || !it.id) err("quest " + id + ": reward item " + j + " has no id");
          else if (Data.items && Data.count("items") && !Data.items[it.id]) err("quest " + id + ": reward item '" + it.id + "' is not defined");
        }
      });
    });
  }

  MQ.Quests = Q;
})();
