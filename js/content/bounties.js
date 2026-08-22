// =============================================================
// MonsterQuest v2 — MQ.Bounties (content-activities)
// The bounty board: three a day, seeded from the real date and the
// save seed so it cannot be re-rolled; petty / notable / warrant;
// located by clue text and never by a map marker.
// SIDE-CONTENT §2.1, SYSTEMS-SPEC §16.
//
// MQ.Quests already owns the rolling and the reward book-keeping
// (it is the same quest machine). This file owns the board itself:
// the pool metadata, the warrant handlers, the screen, accepting,
// claiming — and a complete stand-alone path for when the quest
// engine is not there.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const Bn = MQ.Bounties || {};
  function A() { return MQ.Activities; }
  function Q() { return MQ.Quests && MQ.Quests.rollBounties ? MQ.Quests : null; }

  Bn.TIERS = {
    petty: { id: "petty", name: "Petty", colour: "#9fb8a0", levelBonus: 0.5, money: [400, 700], marks: 1,
      blurb: "A named common with a bad habit. Half a level over its neighbours." },
    notable: { id: "notable", name: "Notable", colour: "#7cc0d8", levelBonus: 0.6, money: [900, 1500], marks: 3,
      blurb: "A rare morph. Shows itself in one weather, or one band of the day." },
    warrant: { id: "warrant", name: "Warrant", colour: "#e0bb4c", levelBonus: 0.75, money: [2500, 4000], marks: 8,
      blurb: "Signed off at county level. One a week, and it brings a friend." }
  };

  Bn.state = {
    day: 0, ids: [], meta: {}, served: [], own: {}, greeted: 0
  };

  // ---- the pool ---------------------------------------------------
  Bn.pool = function () {
    if (MQ.Data && MQ.Data.bounties && MQ.Data.count("bounties")) return MQ.Data.list("bounties");
    return [{ species: "nibbit", name: "Something", tier: "petty", clue: "a rustle in a hedge, allegedly" }];
  };
  Bn.template = function (species) {
    const p = Bn.pool();
    for (let i = 0; i < p.length; i++) if (p[i].species === species) return p[i];
    return null;
  };

  Bn.dayKey = function () { const q = Q(); return q && q.dayKey ? q.dayKey() : A().dayKey(); };
  Bn.weekly = function () { return Math.floor(Bn.dayKey() / 7) % 3 === 0; };

  // Warrants come with a handler: somebody is feeding it, and they are
  // not pleased to see the board's paperwork walking up the path.
  const HANDLERS = [
    { name: "Kestrel", cls: "Fence", line: "\"It's not stealing if nobody's minding it.\"" },
    { name: "Doyle", cls: "Credential Stuffer", line: "\"I only run the list. I don't write the list.\"" },
    { name: "Marchant", cls: "Broker", line: "\"Everything here has a certificate. Look.\"" },
    { name: "Sable", cls: "Handler", line: "\"She answers to me. Mostly.\"" }
  ];
  Bn.warrantHandler = function (id, rnd, level, species) {
    const h = HANDLERS[Math.floor((rnd ? rnd() : Math.random()) * HANDLERS.length)];
    const tid = "bounty_handler_" + id;
    if (MQ.Data && MQ.Data.define && !MQ.Data.trainers[tid]) {
      MQ.Data.define("trainers", tid, {
        name: h.name, cls: h.cls, sprite: "npc_stuffer",
        party: [{ species: species, level: Math.max(2, level - 2) }, { species: species, level: level }],
        ai: "smart", payout: 900,
        intro: [h.line], win: ["\"You'll not find the next one.\""], lose: ["\"Take it. Take the paperwork too.\""],
        bounty: true
      });
    }
    return { id: tid, name: h.name, cls: h.cls, line: h.line };
  };

  // ---- rolling -------------------------------------------------------
  Bn.roll = function (force) {
    const a = A(), q = Q();
    const day = Bn.dayKey();
    if (!force && Bn.state.day === day && Bn.state.ids.length) return Bn.state.ids.slice();
    let ids = [];
    if (q) {
      ids = q.rollBounties(force) || [];
    } else {
      ids = Bn.rollOwn(day);
    }
    // decorate with the template metadata the quest machine does not carry
    const rnd = a.rng(day * 7919 + a.saveSeed() + 13);
    Bn.state.meta = {};
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const def = (MQ.Data && MQ.Data.quests && MQ.Data.quests[id]) || Bn.state.own[id] || null;
      const species = (def && def.species) || null;
      const tpl = species ? Bn.template(species) : null;
      const tier = (def && def.tier) || (tpl && tpl.tier) || "petty";
      const meta = {
        id: id, species: species, tier: tier,
        name: (def && def.name) || (tpl && tpl.name) || "Bounty",
        clue: (def && def.summary) || (tpl && tpl.clue) || "somebody saw something",
        note: (tpl && tpl.note) || null,
        town: (def && def.town) || (tpl && tpl.town) || "board",
        map: (tpl && tpl.map) || null,
        phase: (tpl && tpl.phase) || null,
        weather: (tpl && tpl.weather) || null,
        trait: (tpl && tpl.trait) || null,
        level: (def && def.targetLevel) || 0,
        reward: (def && def.reward) || null
      };
      if (tier === "warrant" && species) meta.handler = Bn.warrantHandler(id, rnd, meta.level || 20, species);
      Bn.state.meta[id] = meta;
    }
    Bn.state.day = day;
    Bn.state.ids = ids.slice();
    a.emit("bounty:board", { day: day, ids: ids });
    return ids.slice();
  };

  // Stand-alone rolling: used when there is no quest engine at all.
  Bn.rollOwn = function (day) {
    const a = A();
    const rnd = a.rng(day * 7919 + a.saveSeed());
    const pool = U.shuffle(Bn.pool().slice(), rnd);
    const level = a.partyLevel();
    const weekly = Bn.weekly();
    const ids = [];
    for (let i = 0; i < pool.length && ids.length < 3; i++) {
      const b = pool[i];
      let tier = b.tier || "petty";
      if (tier === "warrant" && !weekly) tier = "notable";
      const t = Bn.TIERS[tier];
      const id = "bounty_" + b.species + "_" + (ids.length + 1);
      Bn.state.own[id] = {
        id: id, name: (b.name || U.capitalise(b.species)) + " — " + t.name + " Bounty",
        kind: "bounty", tier: tier, town: b.town || "board", species: b.species,
        summary: b.clue, targetLevel: Math.max(3, Math.round(level * (1 + t.levelBonus))),
        reward: { money: U.randInt(t.money[0], t.money[1], rnd), marks: t.marks },
        accepted: false, done: false
      };
      ids.push(id);
    }
    return ids;
  };

  // ---- the board ----------------------------------------------------
  Bn.board = function () {
    const q = Q();
    const ids = Bn.roll();
    const out = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const meta = Bn.state.meta[id];
      if (!meta) continue;
      const own = Bn.state.own[id];
      const pin = q ? q.pin(id) : (own && own.done ? "Closed" : own && own.accepted ? "In Hand" : "Open");
      const stage = q ? q.stage(id) : (own && own.hit ? 1 : own && own.accepted ? 0 : -1);
      out.push({
        id: id, name: meta.name, tier: meta.tier, clue: meta.clue, note: meta.note,
        species: meta.species, level: meta.level, town: meta.town, map: meta.map,
        phase: meta.phase, weather: meta.weather, trait: meta.trait, handler: meta.handler,
        reward: meta.reward, pin: pin, stage: stage,
        accepted: pin === "In Hand", done: pin === "Closed",
        claimable: pin === "In Hand" && stage >= 1
      });
    }
    return out;
  };
  Bn.entry = function (id) {
    const b = Bn.board();
    for (let i = 0; i < b.length; i++) if (b[i].id === id) return b[i];
    return null;
  };
  Bn.active = function () {
    const b = Bn.board(), out = [];
    for (let i = 0; i < b.length; i++) if (b[i].accepted) out.push(b[i]);
    return out;
  };

  Bn.accept = function (id) {
    const q = Q(), a = A();
    const e = Bn.entry(id);
    if (!e) return { ok: false, msg: "That one's been taken down." };
    if (e.done) return { ok: false, msg: "Served. It's in the book." };
    if (e.accepted) return { ok: false, msg: "You already have that one." };
    if (q) q.acceptBounty(id);
    else Bn.state.own[id].accepted = true;
    a.sfx("ui_select");
    a.emit("bounty:accept", { id: id, tier: e.tier });
    return { ok: true, msg: "\"" + e.name + ". Right. " + e.clue.charAt(0).toUpperCase() + e.clue.slice(1) + ".\"" };
  };

  Bn.claimable = function (id) { const e = Bn.entry(id); return !!(e && e.claimable); };
  Bn.claim = function (id) {
    const q = Q(), a = A();
    const e = Bn.entry(id);
    if (!e) return { ok: false, msg: "No such notice." };
    if (e.done) return { ok: false, msg: "Already paid. Don't push it." };
    if (!e.accepted) return { ok: false, msg: "You never took that one on." };
    if (!e.claimable) return { ok: false, msg: "Not yet. " + e.clue.charAt(0).toUpperCase() + e.clue.slice(1) + "." };
    let money = 0, marks = 0;
    if (q) {
      q.complete(id);                     // the quest machine pays and counts
      money = (e.reward && e.reward.money) || 0;
      marks = (e.reward && e.reward.marks) || 0;
    } else {
      const own = Bn.state.own[id];
      own.done = true;
      money = (own.reward && own.reward.money) || 0;
      marks = (own.reward && own.reward.marks) || 0;
      a.addMoney(money); a.addMarks(marks);
      a.bump("bounties", 1);                 // MQ.Trainer mirrors this into count_bounties
      if (e.tier === "warrant") a.bump("warrants", 1);
    }
    if (e.tier === "warrant") {
      const gear = Bn.warrantGear();
      if (gear) { a.give(gear, 1); }
      Bn.state.served.unshift({ id: id, name: e.name, tier: e.tier, ts: a.now(), money: money, marks: marks, gear: gear || null });
    } else {
      Bn.state.served.unshift({ id: id, name: e.name, tier: e.tier, ts: a.now(), money: money, marks: marks });
    }
    if (Bn.state.served.length > 30) Bn.state.served.length = 30;
    a.sfx("coin");
    a.emit("bounty:claim", { id: id, tier: e.tier, money: money, marks: marks });
    return { ok: true, money: money, marks: marks,
      msg: "\"" + money + " credits and " + marks + " mark" + (marks === 1 ? "" : "s") + ". Sign there. And there.\"" };
  };

  // A Warrant grants a gear piece — one you have not got, when there is one.
  Bn.WARRANT_GEAR = ["focus_band", "lucky_coin", "umbrella", "torch", "hide_plate", "weathervane", "warm_blanket", "rail_pass"];
  Bn.warrantGear = function () {
    const a = A();
    for (let i = 0; i < Bn.WARRANT_GEAR.length; i++) if (a.count(Bn.WARRANT_GEAR[i]) === 0) return Bn.WARRANT_GEAR[i];
    return null;
  };

  Bn.stats = function () {
    const a = A();
    let petty = 0, notable = 0, warrant = 0, money = 0, marks = 0;
    for (let i = 0; i < Bn.state.served.length; i++) {
      const s = Bn.state.served[i];
      if (s.tier === "warrant") warrant++; else if (s.tier === "notable") notable++; else petty++;
      money += s.money || 0; marks += s.marks || 0;
    }
    return {
      total: (MQ.Trainer && MQ.Trainer.stat ? MQ.Trainer.stat("bounties") : 0) || a.num("count_bounties"),
      warrants: (MQ.Trainer && MQ.Trainer.stat ? MQ.Trainer.stat("warrants") : 0) || a.num("count_warrants"),
      recent: { petty: petty, notable: notable, warrant: warrant, money: money, marks: marks }
    };
  };

  // ---- voice ---------------------------------------------------------
  // Under Quarantine the board is also ORACLE's noticeboard, and ORACLE
  // writes like a log file that has learnt manners.
  Bn.quarantine = function () { return A().flag("choice_plug") === "quarantine"; };
  const CLERK = [
    "\"Three up. Same three till midnight, before you ask.\"",
    "\"No, I can't change them. The board does the board.\"",
    "\"Read the clue. Nobody's drawing you a map.\"",
    "\"Warrants Fridayish. Depends what the county signs.\""
  ];
  Bn.greeting = function () {
    if (Bn.quarantine()) {
      return [
        "> ORACLE/board: 3 open items, seeded " + Bn.dayKey() + ".",
        "> confidence: two high, one hedged.",
        "> note: I have stopped saying 'please'. It was not helping."
      ];
    }
    const s = CLERK[Bn.state.greeted % CLERK.length];
    Bn.state.greeted++;
    return [s];
  };

  // ---- scene ------------------------------------------------------------
  Bn.scene = {
    id: "bounties", touchPad: false,
    enter: function (params) {
      this.p = params || {};
      this.tab = 0;
      Bn.roll();
      this.boardState = A().menuState(Bn.boardItems());
      this.servedState = A().menuState(Bn.servedItems());
      this.busy = false;
      this.line = Bn.greeting()[0];
      A().sfx("ui_open");
    },
    exit: function () { A().sfx("ui_close"); },
    resume: function () { this.refresh(); this.busy = false; },
    refresh: function () {
      this.boardState.setItems(Bn.boardItems());
      this.servedState.setItems(Bn.servedItems());
    },
    update: function () {
      if (this.busy) return;
      const a = A();
      const tp = a.tabTapped();
      if (tp >= 0) { this.tab = tp; a.sfx("ui_move"); return; }
      if (a.backPressed()) { MQ.Scenes.pop(null); return; }
      const st = this.tab === 0 ? this.boardState : this.servedState;
      const r = st.update();
      if (!r) return;
      if (r.cancel) { MQ.Scenes.pop(null); return; }
      const item = r.item || st.items[r.selected];
      if (!item || this.tab === 1) return;
      this.onNotice(item.value);
    },
    onNotice: function (id) {
      const self = this, a = A();
      const e = Bn.entry(id);
      if (!e) return;
      self.busy = true;
      let res;
      if (e.claimable) res = Bn.claim(id);
      else if (!e.accepted && !e.done) res = Bn.accept(id);
      else res = { ok: false, msg: e.done ? "\"Paid and filed.\"" : "\"Still out there. " + U.capitalise(e.clue) + ".\"" };
      a.sfx(res.ok ? "ui_select" : "ui_error");
      a.say([res.msg], { name: Bn.quarantine() ? "ORACLE" : "Board Clerk" }).then(function () {
        self.busy = false; self.refresh();
      });
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#1c1a24", bottom: "#0b0a10" });
      a.header(ctx, {
        title: "Bounty Board", accent: "#e0bb4c",
        sub: (this.p.map ? U.capitalise(String(this.p.map)) + " town hall" : "Sandbach town hall") + " · rotates at midnight",
        right: a.marks() + " marks"
      });
      const top = a.headerBottom();
      const th = a.tabStrip(ctx, ["Today", "Served"], this.tab, { x: m.l, y: top, w: m.cw });
      const y = top + th + 8;
      const h = a.footerTop() - y - 4;
      const listW = Math.round(m.cw * 0.52) - 12;
      const st = this.tab === 0 ? this.boardState : this.servedState;
      a.list(st, ctx, { x: m.l, y: y, w: listW, h: h, rowH: Math.round(60 * m.k), empty: this.tab ? "Nothing served yet." : "The board is bare." });
      const px = m.l + listW + 20, pw = m.r - px;
      a.panel(ctx, px, y, pw, h, { flat: true });
      const item = st.items[st.cursor];
      if (this.tab === 0 && item) {
        const e = Bn.entry(item.value);
        if (e) {
          const t = Bn.TIERS[e.tier];
          a.text(ctx, e.name, px + 14, y + 12, { size: "l", color: t.colour, maxWidth: pw - 28 });
          a.text(ctx, t.name.toUpperCase() + " · about level " + e.level, px + 14, y + 46, { size: "s", color: C.textDim });
          a.text(ctx, "“" + U.capitalise(e.clue) + ".”", px + 14, y + 72, { size: "m", color: C.text, maxWidth: pw - 28 });
          let yy = y + 132;
          if (e.phase) { a.text(ctx, "Reported at " + e.phase + ".", px + 14, yy, { size: "s", color: C.signal }); yy += 18; }
          if (e.weather) { a.text(ctx, "Only when it's " + e.weather + ".", px + 14, yy, { size: "s", color: C.signal }); yy += 18; }
          if (e.note) { a.text(ctx, e.note, px + 14, yy, { size: "s", color: C.textDim, maxWidth: pw - 28 }); yy += 34; }
          if (e.handler) { a.text(ctx, "Handler: " + e.handler.cls + " " + e.handler.name, px + 14, yy, { size: "s", color: C.warn }); yy += 20; }
          if (e.reward) {
            a.text(ctx, "Pays " + (e.reward.money || 0) + "cr and " + (e.reward.marks || 0) + " marks",
              px + 14, y + h - 74, { size: "s", color: C.brassLit });
          }
          a.text(ctx, e.done ? "SERVED" : e.claimable ? "READY TO CLAIM" : e.accepted ? "IN HAND" : "OPEN",
            px + 14, y + h - 48, { size: "m", color: e.done ? C.dim : e.claimable ? C.good : e.accepted ? C.warn : C.text });
          a.text(ctx, t.blurb, px + 14, y + h - 24, { size: "s", color: C.dim, maxWidth: pw - 28 });
        }
      } else {
        const s = Bn.stats();
        a.text(ctx, "THE BOOK", px + 14, y + 12, { size: "m", color: C.brass });
        a.text(ctx, s.total + " bounties served", px + 14, y + 44, { size: "m", color: C.text });
        a.text(ctx, s.warrants + " of them Warrants", px + 14, y + 70, { size: "s", color: C.textDim });
        a.text(ctx, this.line, px + 14, y + 112, { size: "s", color: C.textDim, maxWidth: pw - 28 });
      }
      a.footer(ctx, [{ btn: "a", label: this.tab === 0 ? "Take / Claim" : "" }, { btn: "b", label: "Away" }, { btn: "lr", label: "Tab" }]);
    }
  };

  Bn.boardItems = function () {
    const b = Bn.board(), out = [];
    for (let i = 0; i < b.length; i++) {
      const e = b[i], t = Bn.TIERS[e.tier];
      out.push({
        label: e.name, value: e.id, color: t.colour,
        right: e.done ? "served" : e.claimable ? "claim" : e.accepted ? "in hand" : t.name,
        sub: U.capitalise(e.clue)
      });
    }
    return out;
  };
  Bn.servedItems = function () {
    const out = [];
    for (let i = 0; i < Bn.state.served.length; i++) {
      const s = Bn.state.served[i];
      out.push({ label: s.name, value: s.id, right: (s.money || 0) + "cr",
        sub: Bn.TIERS[s.tier].name + (s.gear ? " · " + A().itemName(s.gear) : ""), color: Bn.TIERS[s.tier].colour });
    }
    return out;
  };

  // ---- public entry -------------------------------------------------------
  // MQ.Interact calls MQ.Bounties.open(mapId) at a noticeboard.
  Bn.open = function (mapId) {
    const a = A();
    if (!a.flag("bounty_board_open")) {
      return a.say(["A cork board with four rusted pins and no paper on it.",
        "(The county starts posting bounties at Sandbach.)"]);
    }
    return a.open(Bn.scene, { map: mapId });
  };
  Bn.start = function (mapId) { return Bn.open(mapId); };

  A().provider(Bn, "bounties", {
    save: function () {
      return { day: Bn.state.day, ids: Bn.state.ids, served: Bn.state.served, own: Bn.state.own };
    },
    load: function (o) {
      Bn.state.day = 0; Bn.state.ids = []; Bn.state.meta = {}; Bn.state.served = []; Bn.state.own = {}; Bn.state.greeted = 0;
      if (!o) return;
      Bn.state.served = o.served || [];
      Bn.state.own = o.own || {};
      // The board itself is re-rolled from the date + seed, never restored.
    }
  });

  MQ.Bounties = Bn;
})();
