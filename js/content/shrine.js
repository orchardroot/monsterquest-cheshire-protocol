// =============================================================
// MonsterQuest v2 — MQ.Shrine and MQ.Inn (content-activities)
// The revive shrine at the Sandbach crosses (once per real day) and
// the inns, where you pay a little to sleep to the next band so that
// nothing in the county is ever locked behind a wall clock.
// SIDE-CONTENT §2.10, SYSTEMS-SPEC §16.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const S = MQ.Shrine || {};
  const Inn = MQ.Inn || {};
  function A() { return MQ.Activities; }

  // =============================================================
  // The shrine
  // =============================================================
  S.MAP = "sandbach";
  S.state = { lastDay: 0, uses: 0, offerings: 0 };

  S.open = function () { return !!A().flag("sandbach_shrine"); };
  S.usedToday = function () { return S.state.lastDay === A().dayKey(); };
  S.available = function () { return S.open() && !S.usedToday(); };

  S.fallen = function () {
    const list = A().party(), out = [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (m && m.stats && (m.hp <= 0 || m.fainted)) out.push(m);
    }
    return out;
  };

  // Revive everything that is down, at full, with no friendship penalty:
  // the crosses do not charge for it and never have.
  S.revive = function () {
    const a = A();
    const down = S.fallen();
    for (let i = 0; i < down.length; i++) {
      const m = down[i];
      m.hp = m.stats.hp;
      m.status = null; m.statusTurns = 0; m.fainted = false;
      a.emit("party:revive", { uid: m.uid, source: "shrine" });
    }
    S.state.lastDay = a.dayKey();
    S.state.uses++;
    a.setFlag("shrine_used_day", S.state.lastDay);
    a.sfx("bell_toll");
    a.emit("shrine:revive", { n: down.length, map: S.MAP });
    if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    return down;
  };

  const CROSS_LINES = [
    "The taller cross has a man on it with his hands out, worn nearly flat.",
    "The shorter one is all animals: a stag, a hound, and something nobody has ever agreed on.",
    "Somebody has left a bunch of wet flowers and a bus ticket at the base."
  ];
  S.lines = function () { return CROSS_LINES.slice(); };

  S.scene = {
    id: "shrine",
    enter: function (params) {
      this.p = params || {};
      this.t = 0;
      this.revived = this.p.revived || [];
      this.glow = 0;
      A().sfx("bell_toll");
      A().music("town_congleton");
    },
    exit: function () { A().sfx("ui_close"); },
    update: function (dt) {
      const a = A();
      this.t += dt;
      this.glow = Math.min(1, this.t / 1400);
      if (this.t > 500 && (a.confirmPressed() || a.anyTap() || a.backPressed())) MQ.Scenes.pop(this.revived);
      else if (this.t > 11000) MQ.Scenes.pop(this.revived);
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#1b1a2a", bottom: "#0a0910" });
      // two Saxon crosses on the cobbles
      const base = m.cy + 110;
      for (let i = 0; i < 2; i++) {
        const x = m.cx - 70 + i * 140;
        const h = i === 0 ? 190 : 140;
        ctx.fillStyle = "#6b6455";
        ctx.fillRect(x - 11, base - h, 22, h);
        ctx.fillRect(x - 30, base - h - 6, 60, 16);
        ctx.fillStyle = "rgba(244,220,154," + (0.12 + this.glow * 0.35) + ")";
        ctx.beginPath(); ctx.arc(x, base - h - 4, 34 + this.glow * 16, 0, 6.3); ctx.fill();
      }
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(m.cx - 160, base, 320, 8);
      a.header(ctx, { title: "The Saxon Crosses", sub: "Sandbach market square", accent: "#f4dc9a", back: false });
      const y = m.b - 132;
      a.panel(ctx, m.l, y, m.cw, 96, { flat: true });
      if (this.revived.length) {
        a.text(ctx, "Up again, and none of them cross about it:", m.l + 14, y + 12, { size: "s", color: C.textDim });
        let names = [];
        for (let i = 0; i < this.revived.length; i++) names.push(MQ.Party && MQ.Party.displayName ? MQ.Party.displayName(this.revived[i]) : a.speciesName(this.revived[i].species));
        a.text(ctx, names.join(", "), m.l + 14, y + 36, { size: "m", color: C.good, maxWidth: m.cw - 28 });
      } else {
        a.text(ctx, CROSS_LINES[Math.floor(this.t / 3400) % CROSS_LINES.length], m.l + 14, y + 20, { size: "m", color: C.text, maxWidth: m.cw - 28 });
      }
      a.text(ctx, S.usedToday() ? "Once a day. That is the arrangement." : "Once a day, if you need it.",
        m.l + 14, y + 68, { size: "s", color: C.dim });
      a.footer(ctx, [{ btn: "a", label: "Step back" }]);
    }
  };

  // Entry point: MQ.Shrine.use() from the plinth's NPC script.
  S.use = function (params) {
    const a = A();
    if (!S.open()) {
      return a.say(["Two Saxon crosses, weathered nearly smooth.",
        "Nothing happens, and that is fine. Not everything is a mechanism."]);
    }
    const down = S.fallen();
    if (!down.length) {
      return a.say(["\"Nothing of yours needs it today,\" says the woman with the flowers.",
        "\"Come back when it does. It'll still be here. It's been here twelve hundred years.\""]);
    }
    if (S.usedToday()) {
      return a.say(["The stone is warm and entirely uninterested.",
        "\"Once a day,\" says the woman with the flowers. \"Not my rule.\""]);
    }
    const revived = S.revive();
    return a.open(S.scene, { revived: revived }).then(function () { return revived; });
  };
  S.start = S.use;
  S.status = function () {
    return { open: S.open(), available: S.available(), usedToday: S.usedToday(), uses: S.state.uses, down: S.fallen().length };
  };

  // =============================================================
  // Inns — sleep to the next band
  // =============================================================
  Inn.BANDS = [
    { id: "dawn", name: "Dawn", hour: 5, line: "You wake to a grey window and a kettle already on." },
    { id: "day", name: "Morning", hour: 7, line: "Full daylight, and somebody hoovering the corridor." },
    { id: "dusk", name: "Evening", hour: 19, line: "The light goes orange and the county quietens down." },
    { id: "night", name: "Night", hour: 21, line: "Dark, and the sign outside buzzing on and off." }
  ];
  Inn.BASE = 50;
  Inn.state = { sleeps: 0, spent: 0, lastMap: null };

  Inn.band = function (id) {
    for (let i = 0; i < Inn.BANDS.length; i++) if (Inn.BANDS[i].id === id) return Inn.BANDS[i];
    return Inn.BANDS[1];
  };
  Inn.bandIndex = function (id) {
    for (let i = 0; i < Inn.BANDS.length; i++) if (Inn.BANDS[i].id === id) return i;
    return 1;
  };
  // A step round the clock costs a little more than the last.
  Inn.price = function (toBand) {
    const now = A().phase();
    let steps = Inn.bandIndex(toBand) - Inn.bandIndex(now);
    if (steps <= 0) steps += Inn.BANDS.length;
    return Inn.BASE + (steps - 1) * 25;
  };

  Inn.NAMES = {
    macclesfield: "The Silk & Shuttle", bollington: "The Vale Inn", poynton: "The Boar's Head",
    prestbury: "The Admiral Rodney", wilmslow: "The Bollin Fee", knutsford: "The Angel",
    congleton: "The Bear's Head", sandbach: "The Crosses Arms", crewe: "The Royal Hotel",
    nantwich: "The Crown", northwich: "The Salt Barge", winsford: "The Flash",
    frodsham: "The Bear's Paw", runcorn: "The Ferryboat", lymm: "The Dam Head",
    warrington: "The Wire", chester: "The Falcon", y_berllan: "The back bedroom"
  };
  Inn.nameFor = function (mapId) { return Inn.NAMES[mapId] || "The inn"; };

  Inn.sleepTo = function (bandId, opts) {
    const a = A();
    opts = opts || {};
    const b = Inn.band(bandId);
    const cost = opts.free ? 0 : Inn.price(bandId);
    if (cost > 0 && !a.spend(cost)) return { ok: false, msg: "\"It's " + cost + " credits, love. I don't do slates.\"" };
    if (MQ.Party && MQ.Party.heal) MQ.Party.heal();
    else {
      const list = a.party();
      for (let i = 0; i < list.length; i++) if (list[i] && list[i].stats) { list[i].hp = list[i].stats.hp; list[i].status = null; }
    }
    if (MQ.Clock && MQ.Clock.setTime) MQ.Clock.setTime(b.hour, 0);
    else if (MQ.Clock && MQ.Clock.setPhase) MQ.Clock.setPhase(b.id);
    Inn.state.sleeps++;
    Inn.state.spent += cost;
    Inn.state.lastMap = opts.map || null;
    a.sfx("heal");
    a.emit("sleep", { band: b.id, map: opts.map || null, cost: cost });
    if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    if (MQ.Overworld && MQ.Overworld.state) MQ.Overworld.state.respawn = { map: opts.map || (MQ.Overworld.state.map), x: MQ.Overworld.state.tileX, y: MQ.Overworld.state.tileY, dir: "down" };
    return { ok: true, band: b.id, cost: cost, msg: b.line };
  };

  // MQ.Interact calls MQ.Inn.sleep() at a bed.
  Inn.sleep = function (params) {
    const a = A();
    params = params || {};
    const map = params.map || (MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state.map : null);
    const name = params.name || Inn.nameFor(map);
    const now = a.phase();
    const choices = [];
    for (let i = 0; i < Inn.BANDS.length; i++) {
      const b = Inn.BANDS[i];
      if (b.id === now) continue;
      choices.push({ label: b.name + " — " + Inn.price(b.id) + "cr", value: b.id });
    }
    choices.push({ label: "Change your mind", value: null });
    return a.ask("\"Room's free. How long do you want the county to get on without you?\"", choices, { name: name })
      .then(function (v) {
        if (!v) return null;
        const res = Inn.sleepTo(v, { map: map });
        return a.say([res.msg, res.ok ? "\"Everything of yours is fed and watered.\"" : "\"Another time, then.\""], { name: name })
          .then(function () { return res; });
      });
  };
  Inn.start = Inn.sleep;

  A().provider(S, "shrine", {
    save: function () { return { lastDay: S.state.lastDay, uses: S.state.uses, inn: Inn.state }; },
    load: function (o) {
      S.state = { lastDay: 0, uses: 0, offerings: 0 };
      Inn.state = { sleeps: 0, spent: 0, lastMap: null };
      if (!o) return;
      S.state.lastDay = o.lastDay || 0;
      S.state.uses = o.uses || 0;
      if (o.inn) Inn.state = o.inn;
    }
  });

  MQ.Shrine = S;
  MQ.Inn = Inn;
})();
