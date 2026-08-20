// =============================================================
// MonsterQuest v2 — MQ.Arena (content-activities) + MQ.Activities
// The Warrington Arena: ranked gauntlets bronze → obsidian.
// SIDE-CONTENT §2.2, SYSTEMS-SPEC §16.
//
// This file also publishes MQ.Activities — the small shared kit the
// content-activities scenes (fishing, brewing, bounties, minigames,
// photo, rematch, shrine) all draw with. It lives here because
// js/content/*.js loads alphabetically and arena.js is first of ours;
// every consumer reads it lazily inside a function, never at parse time.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  // =============================================================
  // MQ.Activities — shared kit
  // =============================================================
  const A = MQ.Activities || {};

  const FALLBACK_C = {
    ink: "#171425", paper: "#f6efdd", panel: "rgba(22,18,34,0.90)", panelLit: "rgba(40,34,62,0.94)",
    edge: "#8b7cc0", edgeDim: "rgba(139,124,192,0.45)", brass: "#c9a34a", brassLit: "#f2d68a",
    oxblood: "#8e2f2a", slate: "#54657a", canal: "#3f6b52", salt: "#dfe6ee", moor: "#6b5a86",
    cyber: "#3fe0c8", signal: "#7ce0ff", good: "#5fc96a", warn: "#e0a63c", bad: "#e05252",
    dim: "#8b88a4", text: "#f2eee2", textDim: "#a8a2be", textInk: "#221c33",
    hpHigh: "#5fc96a", hpMid: "#e0a63c", hpLow: "#e05252", sel: "rgba(201,163,74,0.30)", selEdge: "#f2d68a"
  };
  const FALLBACK_M = { w: 960, h: 540, l: 12, t: 10, r: 948, b: 530, cw: 936, ch: 520, cx: 480, cy: 270, k: 1, pad: 14, rowH: 40, touch: false, wide: false };

  A.T = function () { return (MQ.UI && MQ.UI.Theme) || null; };
  A.C = function () { const T = A.T(); return (T && T.C) || FALLBACK_C; };
  A.m = function () { const T = A.T(); return T && T.m ? T.m() : FALLBACK_M; };

  // ---- sound / speech, all optional ------------------------------
  A.sfx = function (id) { const T = A.T(); if (T && T.sfx) return T.sfx(id); if (MQ.Audio && MQ.Audio.sfx) { try { MQ.Audio.sfx(id); } catch (e) { /* optional */ } } };
  A.music = function (id) { const T = A.T(); if (T && T.music) return T.music(id); if (MQ.Audio && MQ.Audio.playSong) { try { MQ.Audio.playSong(id); } catch (e) { /* optional */ } } };
  A.say = function (pages, opts) { return MQ.Dialog && MQ.Dialog.say ? MQ.Dialog.say(pages, opts) : Promise.resolve(); };
  A.ask = function (q, choices, opts) { return MQ.Dialog && MQ.Dialog.ask ? MQ.Dialog.ask(q, choices, opts) : Promise.resolve(choices && choices.length ? choices[choices.length - 1].value : undefined); };
  A.confirm = function (q) { return MQ.Dialog && MQ.Dialog.confirm ? MQ.Dialog.confirm(q) : Promise.resolve(true); };
  A.toast = function (t, ms) { if (MQ.UI && MQ.UI.toast) MQ.UI.toast(t, ms); };
  A.banner = function (a, b) { if (MQ.UI && MQ.UI.banner) MQ.UI.banner(a, b); };
  A.emit = function (n, d) { try { MQ.Events.emit(n, d); } catch (e) { MQ.warn("[Activities] listener threw on " + n, e); } };
  A.buzz = function (ms) { if (MQ.Input && MQ.Input.vibrate) MQ.Input.vibrate(ms || 10); };

  // ---- flags / wallet / bag, all degrading -----------------------
  A.flag = function (id) { try { const v = MQ.Flags ? MQ.Flags.get(id) : undefined; return v === undefined ? false : v; } catch (e) { return false; } };
  A.num = function (id) { const v = A.flag(id); return typeof v === "number" ? v : (v ? 1 : 0); };
  A.setFlag = function (id, v) { if (MQ.Flags) MQ.Flags.set(id, v === undefined ? true : v); };
  A.addFlag = function (id, n) { if (MQ.Flags) MQ.Flags.add(id, n === undefined ? 1 : n); };
  A.test = function (expr) { if (!expr) return true; try { return MQ.Flags ? !!MQ.Flags.test(expr) : true; } catch (e) { return false; } };

  A.money = function () { return MQ.Inventory && MQ.Inventory.money !== undefined ? MQ.Inventory.money : A.num("money"); };
  A.spend = function (n) {
    if (MQ.Inventory && MQ.Inventory.spend) return !!MQ.Inventory.spend(n);
    if (A.num("money") < n) return false;
    A.addFlag("money", -n); return true;
  };
  A.addMoney = function (n) { if (MQ.Inventory && MQ.Inventory.addMoney) MQ.Inventory.addMoney(n); else A.addFlag("money", n); };
  A.marks = function () { return MQ.Inventory && MQ.Inventory.marks !== undefined ? MQ.Inventory.marks : A.num("marks"); };
  A.addMarks = function (n) { if (MQ.Inventory && MQ.Inventory.addMarks) MQ.Inventory.addMarks(n); else A.addFlag("marks", n); };
  A.spendMarks = function (n) {
    if (MQ.Inventory && MQ.Inventory.spendMarks) return !!MQ.Inventory.spendMarks(n);
    if (A.marks() < n) return false; A.addFlag("marks", -n); return true;
  };
  A.chips = function () { return MQ.Inventory && MQ.Inventory.chips !== undefined ? MQ.Inventory.chips : A.num("chips"); };
  A.addChips = function (n) { if (MQ.Inventory && MQ.Inventory.addChips) MQ.Inventory.addChips(n); else A.addFlag("chips", n); };
  A.spendChips = function (n) {
    if (MQ.Inventory && MQ.Inventory.spendChips) return !!MQ.Inventory.spendChips(n);
    if (A.chips() < n) return false; A.addFlag("chips", -n); return true;
  };
  A.count = function (id) {
    if (MQ.Inventory && MQ.Inventory.count) return MQ.Inventory.count(id) || 0;
    return A.num("item_" + id);
  };
  A.give = function (id, n) {
    n = n === undefined ? 1 : n;
    if (MQ.Inventory && MQ.Inventory.add) MQ.Inventory.add(id, n); else A.addFlag("item_" + id, n);
    A.emit("item:get", { id: id, n: n });
  };
  A.take = function (id, n) {
    n = n === undefined ? 1 : n;
    if (A.count(id) < n) return false;
    if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(id, n); else A.addFlag("item_" + id, -n);
    return true;
  };
  A.itemName = function (id) {
    const d = MQ.Data && MQ.Data.items ? MQ.Data.items[id] : null;
    return (d && d.name) || U.capitalise(String(id).replace(/_/g, " "));
  };
  A.speciesName = function (id) {
    const s = MQ.Data && MQ.Data.species ? MQ.Data.species[id] : null;
    return (s && s.name) || String(id).toUpperCase();
  };

  A.party = function () { return (MQ.Party && MQ.Party.list) || []; };
  A.partyLevel = function () {
    const p = A.party();
    if (!p.length) return 5;
    let n = 0;
    for (let i = 0; i < p.length; i++) n += p[i].level || 1;
    return Math.round(n / p.length);
  };
  A.bump = function (stat, n) { if (MQ.Trainer && MQ.Trainer.bump) MQ.Trainer.bump(stat, n === undefined ? 1 : n); };
  A.xp = function (n, why) { if (MQ.Trainer && MQ.Trainer.addXp) MQ.Trainer.addXp(n, why); };

  // ---- real clock ------------------------------------------------
  A.realDate = function () {
    const r = MQ.Clock && MQ.Clock.real ? MQ.Clock.real : null;
    return r && r.date ? new Date(r.date) : new Date();
  };
  A.now = function () { return A.realDate().getTime(); };
  A.dayKey = function (d) { d = d || A.realDate(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  A.weekKey = function (d) { return Math.floor(A.dayKey(d) / 7); };
  A.dow = function () { return A.realDate().getDay(); };   // 0 = Sunday
  A.phase = function () { return (MQ.Clock && MQ.Clock.phase) || "day"; };
  A.gameDay = function () { return (MQ.Clock && MQ.Clock.day) || 0; };
  A.saveSeed = function () { return (MQ.Quests && MQ.Quests.seed) || 0; };
  A.rng = function (seed) { return U.rng(seed); };
  A.mins = function (ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    if (h) return h + "h " + (m < 10 ? "0" : "") + m + "m";
    if (m) return m + "m " + (ss < 10 ? "0" : "") + ss + "s";
    return ss + "s";
  };

  // ---- save ------------------------------------------------------
  A.provider = function (sys, key, provider) {
    sys.saveKey = key; sys.saveProvider = provider;
    if (MQ.Save && MQ.Save.register) MQ.Save.register(key, provider);
    return provider;
  };

  // ---- drawing wrappers (theme when present, plain when not) -----
  A.backdrop = function (ctx, o) {
    const T = A.T();
    if (T && T.backdrop) return T.backdrop(ctx, o);
    const m = A.m();
    ctx.fillStyle = (o && o.bottom) || FALLBACK_C.ink;
    ctx.fillRect(0, 0, m.w, m.h);
  };
  A.scrim = function (ctx, alpha) {
    const T = A.T();
    if (T && T.scrim) return T.scrim(ctx, alpha);
    const m = A.m();
    ctx.fillStyle = "rgba(0,0,0," + (alpha === undefined ? 0.6 : alpha) + ")";
    ctx.fillRect(0, 0, m.w, m.h);
  };
  A.panel = function (ctx, x, y, w, h, o) {
    const T = A.T();
    if (T && T.panel) return T.panel(ctx, x, y, w, h, o);
    ctx.fillStyle = (o && o.fill) || FALLBACK_C.panel; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = (o && o.accent) || FALLBACK_C.edgeDim; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  };
  A.header = function (ctx, o) { const T = A.T(); return T && T.header ? T.header(ctx, o) : 46; };
  A.headerBottom = function () { const T = A.T(); return T && T.headerBottom ? T.headerBottom() : 60; };
  A.footer = function (ctx, hints) { const T = A.T(); return T && T.footer ? T.footer(ctx, hints) : 0; };
  A.footerTop = function () { const T = A.T(); return T && T.footerTop ? T.footerTop() : A.m().b - 40; };
  A.list = function (st, ctx, o) { const T = A.T(); if (T && T.list) return T.list(st, ctx, o); };
  A.row = function (ctx, item, x, y, w, h, sel) { const T = A.T(); if (T && T.row) return T.row(ctx, item, x, y, w, h, sel); };
  A.button = function (ctx, label, x, y, w, h, o) { const T = A.T(); if (T && T.button) return T.button(ctx, label, x, y, w, h, o); };
  A.tabStrip = function (ctx, labels, active, o) { const T = A.T(); return T && T.tabStrip ? T.tabStrip(ctx, labels, active, o) : 0; };
  A.tabTapped = function () { const T = A.T(); return T && T.tabTapped ? T.tabTapped() : -1; };
  A.tapped = function (rect) {
    const T = A.T();
    if (T && T.tapped) return T.tapped(rect);
    if (!rect || !rect.w || !MQ.Input || !MQ.Input.tapAt) return false;
    const tp = MQ.Input.tapAt();
    if (!tp || !U.inRect(tp.x, tp.y, rect.x, rect.y, rect.w, rect.h)) return false;
    MQ.Input.consumeAll(); return true;
  };
  A.backPressed = function () {
    const T = A.T();
    if (T && T.backPressed) return T.backPressed();
    if (MQ.Input && MQ.Input.pressed("b")) { MQ.Input.consume("b"); return true; }
    return false;
  };
  A.confirmPressed = function () {
    if (!MQ.Input) return false;
    if (MQ.Input.pressed("a")) { MQ.Input.consume("a"); return true; }
    return false;
  };
  A.anyTap = function () {
    if (!MQ.Input || !MQ.Input.tapAt) return null;
    return MQ.Input.tapAt();
  };
  A.text = function (ctx, s, x, y, o) { return MQ.Text.draw(ctx, s, x, y, o); };
  A.menuState = function (items, o) { return MQ.UI.menuState(items, o); };
  // A progress/º meter used by half the activity screens.
  A.meter = function (ctx, x, y, w, h, ratio, col, bg) {
    const C = A.C();
    ctx.fillStyle = bg || "rgba(0,0,0,0.45)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = col || C.brass;
    ctx.fillRect(x, y, Math.max(0, Math.min(1, ratio)) * w, h);
    ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  };

  // ---- scene helper ----------------------------------------------
  // Pushes `scene`, returns a Promise resolving with whatever pop() gives.
  A.open = function (scene, params) {
    if (!MQ.Scenes || !MQ.Scenes.pushP) return Promise.resolve(null);
    return MQ.Scenes.pushP(scene, params);
  };
  A.close = function (result) { if (MQ.Scenes) MQ.Scenes.pop(result); };

  MQ.Activities = A;

  // =============================================================
  // MQ.Arena
  // =============================================================
  const Arena = MQ.Arena || {};

  // Engagement rules per tier. Levels are SIDE-CONTENT §2.2's bands; the
  // real level is nudged toward the player's party so a strong or a
  // struggling trainer both get a fight worth having.
  Arena.TIERS = [
    { id: "bronze", name: "Bronze", fights: 3, level: 38, entry: 500, chips: 20, marks: 1,
      rules: {}, note: "Standard rules. The crowd is mostly here for the chips.",
      colour: "#b07a3c", need: "arena_open" },
    { id: "silver", name: "Silver", fights: 5, level: 45, entry: 1200, chips: 45, marks: 2,
      rules: {}, note: "Five straight. Your PP does not come back between them.",
      colour: "#c3ccd6", need: "arena_open" },
    { id: "gold", name: "Gold", fights: 7, level: 52, entry: 2500, chips: 80, marks: 4,
      rules: { noItems: true }, note: "NO ITEMS. The bag stays with the steward.",
      colour: "#e0bb4c", need: "arena_open && badges>=6" },
    { id: "platinum", name: "Platinum", fights: 9, level: 58, entry: 4000, chips: 130, marks: 6,
      rules: { noItems: true, oneAgent: true }, note: "NO ITEMS, ONE AGENT. Pick it before the doors close.",
      colour: "#dfe6ee", need: "arena_open && badges>=8" },
    { id: "obsidian", name: "Obsidian", fights: 12, level: 65, entry: 8000, chips: 240, marks: 12,
      rules: { noItems: true, oneAgent: true, randomWeather: true },
      note: "NO ITEMS, ONE AGENT, WEATHER BY LOT. The twelfth one has phases.",
      colour: "#6a5a9a", need: "postgame_open" }
  ];
  Arena.tier = function (id) {
    for (let i = 0; i < Arena.TIERS.length; i++) if (Arena.TIERS[i].id === id) return Arena.TIERS[i];
    return null;
  };
  Arena.tierIndex = function (id) {
    for (let i = 0; i < Arena.TIERS.length; i++) if (Arena.TIERS[i].id === id) return i;
    return -1;
  };

  const WEATHERS = ["clear", "rain", "sun", "fog", "wind"];
  // Arena opponents are locals with a licence and an opinion.
  const CHALLENGERS = [
    ["Sysadmin", "Bev", "\"I've got a change window and you're in it.\""],
    ["Sysadmin", "Naveed", "\"Two minutes. I've a standup.\""],
    ["Walker", "Trish", "\"I've walked here from Lymm. I'm not going home early.\""],
    ["Walker", "Gordon", "\"Boots on. Let's have it.\""],
    ["Bargee", "Kath", "\"Four mile an hour, all my life. I'm patient.\""],
    ["Bargee", "Wilf", "\"You'll not rush me and you'll not rush her.\""],
    ["Rail Enthusiast", "Priya", "\"On time, on the button, on you.\""],
    ["Rail Enthusiast", "Malc", "\"I've been on this platform since six.\""],
    ["Salt Miner", "Dot", "\"Down there it's dark and quiet. Up here it's neither.\""],
    ["Salt Miner", "Terry", "\"Salt gets everywhere. So do I.\""],
    ["Ranger", "Ibrahim", "\"Don't feed them and don't lose to them.\""],
    ["Ranger", "Fenella", "\"Tatton's rules. Nothing gets hurt that doesn't have to.\""],
    ["Publican", "Sandra", "\"Last orders in seven turns.\""],
    ["Publican", "Ray", "\"I've barred harder than you.\""],
    ["Silk Weaver", "Ada-May", "\"Thread's stronger than it looks. So's the county.\""],
    ["Chemist", "Dr Oyelaran", "\"Everything's a dose. Even a battle.\""],
    ["Farmer", "Bryn", "\"Up at four. Beat you by six.\""],
    ["Farmer", "Marge", "\"There's a heifer calving. Make it quick.\""],
    ["Cyclist", "Zed", "\"Wheels off. Gloves on.\""],
    ["Choir Master", "Eunice", "\"Four parts. Try and follow.\""],
    ["Bookseller", "Hal", "\"I've read the ending. It isn't yours.\""],
    ["Angler", "Doug", "\"I've waited eleven hours for a fish. I can wait you out.\""],
    ["Bell Ringer", "Nia", "\"Ring the changes, then. Go on.\""],
    ["Steward", "Odell", "\"House rules. My house.\""]
  ];
  const OBSIDIAN_BOSS = { cls: "The Adjudicator", name: "OBSIDIAN", line: "\"Twelve. Now show your working.\"" };

  Arena.state = {
    records: {},        // tierId → {cleared, best:{turns,faints,ts,ms}, runs, chipsWon}
    history: [],        // last 12 runs, newest first
    titles: [],         // cosmetic titles bought with chips
    bought: {},         // chip-shop stock already taken
    lastRun: null
  };

  // ---- opponent generation ---------------------------------------
  // Deterministic under a seed: the same run seed always produces the
  // same ladder, so tests (and a re-entered run) agree.
  function speciesPool() {
    const out = [];
    if (!MQ.Data || !MQ.Data.species) return out;
    MQ.Data.each("species", function (s, id) {
      if (!s || s.rarity === "legendary" || s.rarity === "unique") return;
      if (s.boss || s.noWild) return;
      out.push(id);
    });
    out.sort();
    return out;
  }
  let POOL = null;
  function pool() { if (!POOL || !POOL.length) POOL = speciesPool(); return POOL; }

  Arena.buildSquad = function (tierId, fightNo, rnd, level) {
    const t = Arena.tier(tierId) || Arena.TIERS[0];
    const p = pool();
    const last = fightNo >= t.fights;
    let size = 1 + Math.floor((fightNo - 1) / Math.max(1, Math.ceil(t.fights / 3)));
    size = U.clamp(size, 1, last ? 6 : 4);
    if (last) size = Math.max(size, Math.min(6, 3 + Arena.tierIndex(tierId)));
    const party = [];
    for (let i = 0; i < size; i++) {
      const sp = p.length ? p[Math.floor(rnd() * p.length)] : "nibbit";
      const lv = U.clamp(Math.round(level + (last ? 2 : 0) + (i === size - 1 ? 1 : 0) - Math.floor(rnd() * 2)), 2, 100);
      party.push({ species: sp, level: lv });
    }
    return party;
  };

  Arena.buildChallenger = function (tierId, fightNo, rnd, level) {
    const t = Arena.tier(tierId) || Arena.TIERS[0];
    const last = fightNo >= t.fights;
    const boss = last && tierId === "obsidian";
    const pick = CHALLENGERS[Math.floor(rnd() * CHALLENGERS.length)];
    const cls = boss ? OBSIDIAN_BOSS.cls : pick[0];
    const name = boss ? OBSIDIAN_BOSS.name : pick[1];
    const line = boss ? OBSIDIAN_BOSS.line : pick[2];
    const data = {
      id: "arena_" + tierId + "_" + fightNo,
      name: name, cls: cls, sprite: "npc_trainer",
      party: Arena.buildSquad(tierId, fightNo, rnd, level),
      ai: last ? "smart" : (Arena.tierIndex(tierId) >= 2 ? "smart" : "greedy"),
      payout: 0,
      intro: [line],
      win: ["\"Right. Fair enough.\""],
      lose: ["\"That's the one I'll be telling people about.\""],
      arena: true
    };
    if (boss) {
      data.boss = { phases: [
        { atHp: 0.66, events: [{ kind: "say", text: "OBSIDIAN: \"Phase two. Weather's mine now.\"" }, { kind: "setWeather", weather: "fog", turns: 6 }] },
        { atHp: 0.33, events: [{ kind: "say", text: "OBSIDIAN: \"Phase three. No more notes.\"" }, { kind: "boostSelf", stat: "atk", delta: 1 }, { kind: "jamAgents", turns: 3 }] }
      ] };
    }
    return data;
  };

  Arena.levelFor = function (tierId) {
    const t = Arena.tier(tierId) || Arena.TIERS[0];
    const mine = A.partyLevel();
    // Never a walkover, never a wall: the tier band, pulled a little
    // toward the party (±6) so an under- or over-levelled trainer still
    // gets a fight rather than a formality.
    return U.clamp(Math.round(t.level + U.clamp(mine - t.level, -6, 6) * 0.7), 5, 100);
  };

  // ---- a run ------------------------------------------------------
  Arena.canEnter = function (tierId) {
    const t = Arena.tier(tierId);
    if (!t) return "No such tier.";
    if (!A.test(t.need)) return t.id === "obsidian" ? "Obsidian opens after the credits." : "The Arena is not open to you yet.";
    if (Arena.tierIndex(tierId) > 0) {
      const prev = Arena.TIERS[Arena.tierIndex(tierId) - 1];
      if (!Arena.cleared(prev.id)) return "Clear " + prev.name + " first.";
    }
    const alive = MQ.Party && MQ.Party.alive ? MQ.Party.alive().length : A.party().length;
    if (!alive) return "Nothing of yours can stand up.";
    if (A.money() < t.entry) return "The entry fee is " + t.entry + "cr.";
    return null;
  };
  Arena.cleared = function (tierId) {
    const r = Arena.state.records[tierId];
    return !!(r && r.cleared) || !!A.flag("arena_" + tierId + "_clear");
  };

  // Refill HP and status between fights but never PP — that is the
  // whole shape of a gauntlet (SIDE-CONTENT §2.2).
  function refillHp() {
    const p = A.party();
    for (let i = 0; i < p.length; i++) {
      const mon = p[i];
      if (!mon || !mon.stats) continue;
      mon.hp = mon.stats.hp;
      mon.status = null; mon.statusTurns = 0;
      if (mon.fainted) mon.fainted = false;
    }
    A.emit("party:heal", { source: "arena" });
  }
  function snapshotOverdrive() {
    const p = A.party(), out = {};
    for (let i = 0; i < p.length; i++) if (p[i]) out[p[i].uid] = p[i].overdrive || 0;
    return out;
  }
  function restoreOverdrive(snap) {
    const p = A.party();
    for (let i = 0; i < p.length; i++) if (p[i] && snap[p[i].uid] !== undefined) p[i].overdrive = snap[p[i].uid];
  }

  Arena.run = function (tierId, opts) {
    opts = opts || {};
    const t = Arena.tier(tierId);
    if (!t) return Promise.resolve({ ok: false, reason: "no such tier" });
    const why = opts.free ? null : Arena.canEnter(tierId);
    if (why) return Promise.resolve({ ok: false, reason: why });
    if (!opts.free) A.spend(t.entry);

    const seed = opts.seed === undefined ? (A.dayKey() * 131 + A.saveSeed() + Date.now() % 100000) : opts.seed;
    const rnd = A.rng(seed);
    const level = Arena.levelFor(tierId);
    const run = {
      tier: tierId, seed: seed, level: level, fight: 0, fights: t.fights,
      wins: 0, faints: 0, turns: 0, chips: 0, started: A.now(), ok: true, cleared: false
    };
    Arena.current = run;
    A.emit("arena:start", { tier: tierId, run: run });
    A.music("battle_gym");

    const auto = !!opts.auto;

    function nextFight() {
      if (run.fight >= t.fights) { run.cleared = true; return Promise.resolve(run); }
      run.fight++;
      const foe = Arena.buildChallenger(tierId, run.fight, rnd, level);
      run.opponent = foe;
      const weather = t.rules.randomWeather ? WEATHERS[Math.floor(rnd() * WEATHERS.length)] : (opts.weather || null);
      run.weather = weather;
      const od = snapshotOverdrive();
      const card = auto ? Promise.resolve() : Arena.showCard(run, foe, t, weather);
      return card.then(function () {
        restoreOverdrive(od);
        if (!MQ.Battle || !MQ.Battle.start) return { outcome: "win", turns: 1, stub: true };
        const enemyParty = [];
        const make = MQ.Battle.makeMonster || (MQ.Data && MQ.Data.makeMonster);
        for (let i = 0; i < foe.party.length; i++) {
          const spec = foe.party[i];
          let mon = null;
          try { mon = make ? make(spec.species, spec.level, { seed: seed + i * 17 }) : null; } catch (e) { mon = null; }
          if (mon) enemyParty.push(mon);
        }
        return MQ.Battle.start({
          kind: "arena", trainer: foe, enemyParty: enemyParty,
          playerParty: A.party(),
          rules: {
            canRun: false, canCatch: false, expShare: true,
            noItems: !!t.rules.noItems, oneAgent: !!t.rules.oneAgent,
            overdriveCarry: true, weather: weather || undefined, weatherTurns: weather ? 99 : undefined
          },
          seed: seed + run.fight * 7919,
          auto: auto,
          music: "battle_trainer"
        });
      }).then(function (res) {
        run.turns += (res && res.turns) || 0;
        const won = res && (res.outcome === "win" || res.won);
        // count who fell
        const p = A.party();
        for (let i = 0; i < p.length; i++) if (p[i] && p[i].hp <= 0) run.faints++;
        if (!won) { run.ok = false; return run; }
        run.wins++;
        run.chips += Math.max(2, Math.round(t.chips / t.fights));
        refillHp();
        return nextFight();
      });
    }

    return nextFight().then(function () {
      return Arena.finish(run, t, auto);
    }, function (err) {
      MQ.warn("[Arena] run failed", err);
      run.ok = false;
      return Arena.finish(run, t, auto);
    });
  };

  Arena.finish = function (run, t, auto) {
    Arena.current = null;
    const ms = A.now() - run.started;
    run.ms = ms;
    const rec = Arena.state.records[t.id] || (Arena.state.records[t.id] = { cleared: false, runs: 0, chipsWon: 0, best: null });
    rec.runs++;
    let firstClear = false;
    if (run.cleared) {
      run.chips += t.chips;
      firstClear = !rec.cleared;
      rec.cleared = true;
      A.setFlag("arena_" + t.id + "_clear", true);
      if (!rec.best || run.turns < rec.best.turns) {
        rec.best = { turns: run.turns, faints: run.faints, ms: ms, ts: A.now(), level: run.level };
      }
      A.addMarks(t.marks);
      if (firstClear && MQ.Trainer && MQ.Trainer.grantPerkPoints) MQ.Trainer.grantPerkPoints(1);
      A.xp(20 + Arena.tierIndex(t.id) * 15, "arena");
      A.emit("arena:clear", { tier: t.id, run: run, first: firstClear });
    }
    // Chips are paid whether or not you cleared — the crowd got its money's worth.
    if (run.chips > 0) { A.addChips(run.chips); rec.chipsWon += run.chips; }
    Arena.state.history.unshift({
      tier: t.id, cleared: !!run.cleared, wins: run.wins, fights: t.fights,
      turns: run.turns, faints: run.faints, chips: run.chips, ts: A.now(), level: run.level
    });
    if (Arena.state.history.length > 12) Arena.state.history.length = 12;
    Arena.state.lastRun = Arena.state.history[0];
    A.emit("arena:end", { tier: t.id, run: run });
    if (auto) return Promise.resolve(run);

    const lines = run.cleared
      ? ["The steward writes it up on the board without looking at you.",
         "\"" + t.name + ". " + t.fights + " fights, " + run.turns + " turns. " + run.chips + " chips.\"",
         firstClear ? "\"First time at this tier. Have a perk point and a cup of tea.\"" : "\"Same again next week, is it?\""]
      : ["You come round on the bench by the door with somebody's coat under your head.",
         "\"" + run.wins + " of " + t.fights + ". " + run.chips + " chips for the trouble.\"",
         "\"Come back when the PP's had a lie down.\""];
    return A.say(lines, { name: "Arena Steward" }).then(function () { return run; });
  };

  // ---- chip shop ---------------------------------------------------
  Arena.CHIP_STOCK = [
    { id: "focus_band", price: 40, note: "Holds on at 1 HP, once." },
    { id: "kevlar_waistcoat", price: 60, note: "No Overdrive for either of you." },
    { id: "heavy_anvil", price: 55, note: "Slower. Much heavier." },
    { id: "lucky_coin", price: 45, note: "Crits find you more often." },
    { id: "weathervane", price: 50, note: "The weather does as it's told." },
    { id: "hide_plate", price: 50, note: "Takes the edge off super-effective." },
    { id: "torch", price: 35, note: "Fog stops mattering." },
    { id: "cat_bell", price: 65, note: "Friendship doubles. The cats already knew." }
  ];
  Arena.TITLES = [
    { id: "title_bronze_regular", name: "Bronze Regular", price: 30, need: "bronze" },
    { id: "title_silver_service", name: "Silver Service", price: 60, need: "silver" },
    { id: "title_gold_standard", name: "Gold Standard", price: 120, need: "gold" },
    { id: "title_platinum_nerve", name: "Platinum Nerve", price: 220, need: "platinum" },
    { id: "title_obsidian", name: "Obsidian", price: 400, need: "obsidian" }
  ];
  Arena.buy = function (id) {
    let entry = null, kind = "item";
    for (let i = 0; i < Arena.CHIP_STOCK.length; i++) if (Arena.CHIP_STOCK[i].id === id) entry = Arena.CHIP_STOCK[i];
    if (!entry) { for (let i = 0; i < Arena.TITLES.length; i++) if (Arena.TITLES[i].id === id) { entry = Arena.TITLES[i]; kind = "title"; } }
    if (!entry) return { ok: false, msg: "The steward has never heard of it." };
    if (kind === "title" && !Arena.cleared(entry.need)) return { ok: false, msg: "That one's for people who've cleared " + entry.need + "." };
    if (kind === "title" && Arena.state.titles.indexOf(id) >= 0) return { ok: false, msg: "You already have it. Wear it." };
    if (A.chips() < entry.price) return { ok: false, msg: "Not enough chips." };
    if (!A.spendChips(entry.price)) return { ok: false, msg: "Not enough chips." };
    if (kind === "title") {
      Arena.state.titles.push(id);
      if (MQ.Trainer && MQ.Trainer.addTitle) MQ.Trainer.addTitle(id);
    } else {
      A.give(id, 1);
      Arena.state.bought[id] = (Arena.state.bought[id] || 0) + 1;
    }
    A.sfx("coin");
    return { ok: true, msg: kind === "title" ? "\"" + entry.name + ". Say it like you mean it.\"" : "\"" + A.itemName(id) + ". Don't lose it.\"" };
  };

  Arena.leaderboard = function () {
    const out = [];
    for (let i = 0; i < Arena.TIERS.length; i++) {
      const t = Arena.TIERS[i];
      const r = Arena.state.records[t.id];
      out.push({
        tier: t.id, name: t.name, colour: t.colour, fights: t.fights,
        cleared: Arena.cleared(t.id), runs: (r && r.runs) || 0,
        best: (r && r.best) || null, chipsWon: (r && r.chipsWon) || 0
      });
    }
    return out;
  };

  // =============================================================
  // Scenes
  // =============================================================
  // The card shown between fights: who is next, the engagement rule,
  // your standing. Tap or A to go on.
  const cardRect = { x: 0, y: 0, w: 0, h: 0 };
  Arena.showCard = function (run, foe, t, weather) {
    const scene = {
      id: "arena_card", t: 0, done: false,
      enter: function () { this.t = 0; this.done = false; A.sfx("ui_open"); },
      update: function (dt) {
        this.t += dt;
        if (this.done) return;
        if (this.t > 260 && (A.confirmPressed() || A.anyTap() || A.backPressed())) { this.done = true; A.sfx("ui_select"); MQ.Scenes.pop(true); }
        if (this.t > 9000) { this.done = true; MQ.Scenes.pop(true); }
      },
      draw: function (ctx) {
        const C = A.C(), m = A.m();
        A.backdrop(ctx, { top: "#1a1024", bottom: "#0b0812" });
        const w = Math.min(560, m.cw), x = m.cx - w / 2, y = m.t + 40 * m.k, h = Math.min(340 * m.k, m.ch - 80);
        cardRect.x = x; cardRect.y = y; cardRect.w = w; cardRect.h = h;
        A.panel(ctx, x, y, w, h, { lit: true, accent: t.colour });
        A.text(ctx, t.name.toUpperCase() + " GAUNTLET", x + w / 2, y + 14, { size: "l", align: "center", color: t.colour, shadow: true });
        A.text(ctx, "Fight " + run.fight + " of " + t.fights, x + w / 2, y + 48, { size: "m", align: "center", color: C.textDim });
        const yy = y + 84;
        A.text(ctx, foe.cls + " " + foe.name, x + 20, yy, { size: "l", color: C.text });
        A.text(ctx, foe.party.length + " on the card · about level " + run.level, x + 20, yy + 30, { size: "s", color: C.textDim });
        A.text(ctx, foe.intro[0], x + 20, yy + 52, { size: "s", color: C.brassLit, maxWidth: w - 40 });
        const ry = yy + 90;
        A.panel(ctx, x + 16, ry, w - 32, 54, { flat: true });
        A.text(ctx, "ENGAGEMENT RULE", x + 26, ry + 8, { size: "s", color: C.brass });
        A.text(ctx, t.note, x + 26, ry + 26, { size: "s", color: C.text, maxWidth: w - 52 });
        if (weather) A.text(ctx, "Weather drawn: " + weather, x + 26, ry + 60, { size: "s", color: C.signal });
        const sy = y + h - 60;
        A.text(ctx, "Won " + run.wins + " · turns " + run.turns + " · chips " + run.chips, x + 20, sy, { size: "s", color: C.textDim });
        A.text(ctx, "HP restored. PP is your own problem.", x + 20, sy + 20, { size: "s", color: C.dim });
        A.footer(ctx, [{ btn: "a", label: "Go on then" }]);
      }
    };
    return A.open(scene).then(function () { return true; });
  };

  // The lobby: tiers, records, the chip counter.
  Arena.scene = {
    id: "arena",
    tab: 0,
    enter: function (params) {
      this.params = params || {};
      this.tab = 0;
      this.state = A.menuState(Arena.tierItems());
      this.shopState = A.menuState(Arena.shopItems());
      this.busy = false;
      A.sfx("ui_open");
      A.music("town_warrington");
    },
    exit: function () { A.sfx("ui_close"); },
    resume: function () { this.state.setItems(Arena.tierItems()); this.shopState.setItems(Arena.shopItems()); this.busy = false; },
    update: function () {
      if (this.busy) return;
      const tp = A.tabTapped();
      if (tp >= 0) { this.tab = tp; A.sfx("ui_move"); return; }
      if (A.backPressed()) { MQ.Scenes.pop(null); return; }
      const st = this.tab === 0 ? this.state : this.shopState;
      const r = st.update();
      if (!r) return;
      if (r.cancel) { MQ.Scenes.pop(null); return; }
      if (r.selected === undefined && !r.item) return;
      const item = r.item || st.items[r.selected];
      if (!item || item.disabled) { A.sfx("ui_error"); return; }
      if (this.tab === 0) this.enterTier(item.value);
      else this.buy(item.value);
    },
    enterTier: function (tierId) {
      const self = this;
      const why = Arena.canEnter(tierId);
      if (why) { A.sfx("ui_error"); self.busy = true; A.say(["\"" + why + "\""], { name: "Arena Steward" }).then(function () { self.busy = false; }); return; }
      const t = Arena.tier(tierId);
      self.busy = true;
      A.confirm(t.name + ": " + t.fights + " fights, " + t.entry + "cr. " + t.note).then(function (yes) {
        if (!yes) { self.busy = false; return null; }
        return Arena.run(tierId).then(function () { self.busy = false; self.resume(); });
      }).then(null, function (e) { MQ.warn("[Arena] " + e); self.busy = false; });
    },
    buy: function (id) {
      const self = this;
      const res = Arena.buy(id);
      self.busy = true;
      A.say([res.msg], { name: "Arena Steward" }).then(function () { self.busy = false; self.resume(); });
    },
    draw: function (ctx) {
      const C = A.C(), m = A.m();
      A.backdrop(ctx, { top: "#20142c", bottom: "#0c0913" });
      A.header(ctx, { title: "The Warrington Arena", sub: "Wire Works, off Winwick Road", right: A.chips() + " chips", accent: "#e0bb4c" });
      const top = A.headerBottom();
      const th = A.tabStrip(ctx, ["Gauntlets", "Chip Desk"], this.tab, { x: m.l, y: top, w: m.cw });
      const y = top + th + 8;
      const h = A.footerTop() - y - 4;
      const listW = Math.round(m.cw * (m.wide ? 0.52 : 0.58)) - 12;
      const st = this.tab === 0 ? this.state : this.shopState;
      A.list(st, ctx, { x: m.l, y: y, w: listW, h: h, rowH: Math.round(52 * m.k) });
      // detail panel
      const px = m.l + listW + 20, pw = m.r - px;
      A.panel(ctx, px, y, pw, h, { flat: true });
      const item = st.items[st.cursor];
      if (this.tab === 0 && item) {
        const t = Arena.tier(item.value);
        const rec = Arena.state.records[t.id];
        A.text(ctx, t.name.toUpperCase(), px + 14, y + 12, { size: "l", color: t.colour });
        A.text(ctx, t.fights + " fights · about level " + Arena.levelFor(t.id), px + 14, y + 44, { size: "s", color: C.textDim });
        A.text(ctx, t.note, px + 14, y + 66, { size: "s", color: C.text, maxWidth: pw - 28 });
        A.text(ctx, "Entry " + t.entry + "cr → " + t.chips + " chips, " + t.marks + " marks", px + 14, y + 112, { size: "s", color: C.brassLit });
        A.text(ctx, Arena.cleared(t.id) ? "CLEARED" : "Not yet cleared", px + 14, y + 136, { size: "m", color: Arena.cleared(t.id) ? C.good : C.dim });
        if (rec && rec.best) {
          A.text(ctx, "Best: " + rec.best.turns + " turns, " + rec.best.faints + " down", px + 14, y + 164, { size: "s", color: C.text });
          A.text(ctx, "Runs: " + rec.runs + " · chips won " + rec.chipsWon, px + 14, y + 184, { size: "s", color: C.textDim });
        }
        const hist = Arena.state.history;
        let hy = y + 218;
        A.text(ctx, "RECENT FORM", px + 14, hy, { size: "s", color: C.brass });
        hy += 20;
        for (let i = 0; i < hist.length && hy < y + h - 18; i++) {
          const r = hist[i];
          A.text(ctx, (r.cleared ? "✓ " : "· ") + Arena.tier(r.tier).name + "  " + r.wins + "/" + r.fights + "  " + r.turns + "t",
            px + 14, hy, { size: "s", color: r.cleared ? C.good : C.textDim });
          hy += 17;
        }
      } else if (item) {
        A.text(ctx, item.label, px + 14, y + 12, { size: "l", color: C.brassLit, maxWidth: pw - 28 });
        A.text(ctx, item.note || "", px + 14, y + 48, { size: "s", color: C.text, maxWidth: pw - 28 });
        A.text(ctx, item.price + " chips  (you have " + A.chips() + ")", px + 14, y + 96, { size: "m", color: A.chips() >= item.price ? C.good : C.bad });
      }
      A.footer(ctx, [{ btn: "a", label: this.tab === 0 ? "Enter" : "Buy" }, { btn: "b", label: "Leave" }, { btn: "lr", label: "Tab" }]);
    }
  };

  Arena.tierItems = function () {
    const out = [];
    for (let i = 0; i < Arena.TIERS.length; i++) {
      const t = Arena.TIERS[i];
      const why = Arena.canEnter(t.id);
      out.push({
        label: t.name, value: t.id, color: t.colour,
        right: Arena.cleared(t.id) ? "cleared" : t.entry + "cr",
        sub: t.fights + " fights · " + (why ? why : t.note),
        disabled: false
      });
    }
    return out;
  };
  Arena.shopItems = function () {
    const out = [];
    for (let i = 0; i < Arena.CHIP_STOCK.length; i++) {
      const s = Arena.CHIP_STOCK[i];
      out.push({ label: A.itemName(s.id), value: s.id, right: s.price + "ch", note: s.note, price: s.price, sub: s.note });
    }
    for (let i = 0; i < Arena.TITLES.length; i++) {
      const t = Arena.TITLES[i];
      const owned = Arena.state.titles.indexOf(t.id) >= 0;
      out.push({
        label: "Title: " + t.name, value: t.id, right: owned ? "worn" : t.price + "ch",
        note: "A cosmetic title for your trainer card. Needs a " + t.need + " clear.",
        sub: "Title · needs " + t.need, price: t.price, disabled: owned || !Arena.cleared(t.need)
      });
    }
    return out;
  };

  // Public entry points (NPC scripts / MQ.Interact).
  Arena.open = function (params) { return A.open(Arena.scene, params); };
  Arena.start = function (params) {
    if (typeof params === "string") return Arena.run(params);
    return Arena.open(params);
  };
  Arena.exchange = function () { Arena.scene.tab = 1; return Arena.open(); };

  // ---- save --------------------------------------------------------
  A.provider(Arena, "arena", {
    save: function () {
      return {
        records: Arena.state.records, history: Arena.state.history,
        titles: Arena.state.titles, bought: Arena.state.bought
      };
    },
    load: function (o) {
      Arena.state.records = {}; Arena.state.history = []; Arena.state.titles = []; Arena.state.bought = {};
      Arena.current = null;
      if (!o) return;
      if (o.records) Arena.state.records = o.records;
      if (o.history) Arena.state.history = o.history;
      if (o.titles) Arena.state.titles = o.titles;
      if (o.bought) Arena.state.bought = o.bought;
      Arena.state.lastRun = Arena.state.history[0] || null;
    }
  });

  MQ.Arena = Arena;
})();
