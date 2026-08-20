// =============================================================
// MonsterQuest v2 — MQ.Rematch (content-activities), aliased MQ.Rematches
// The rematch ladder: eight leaders and twelve named route trainers,
// tiers 0–5. Each tier is +5 levels, one more on the team, a held item
// and a decent trait from tier 3, the full six at tier 5 — and, for a
// leader, the Anchor themed to their badge.
// SIDE-CONTENT §2.3, SYSTEMS-SPEC §9 & §16.
//
// The battle engine already scales a party off the `rematch_<id>` flag,
// so this file owns availability, the offer, the flag, and the rewards.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const R = MQ.Rematch || {};
  function A() { return MQ.Activities; }

  R.MAX_TIER = 5;
  R.REAL_DAY = 24 * 60 * 60 * 1000;
  R.GAME_DAYS = 30;

  // The eight leaders, their badges and their Anchors (DESIGN-INDEX §2).
  R.LEADERS = [
    { id: "leader_ada", name: "Sysadmin Ada", town: "wilmslow", badge: "packet", anchor: "anchor_packet" },
    { id: "leader_gaskell", name: "Madam Gaskell", town: "knutsford", badge: "cipher", anchor: "anchor_cipher" },
    { id: "leader_otis", name: "Bearward Otis", town: "congleton", badge: "bear", anchor: "anchor_bear" },
    { id: "leader_di", name: "Stoker Di", town: "crewe", badge: "kernel", anchor: "anchor_kernel" },
    { id: "leader_nell", name: "Brine Nell", town: "nantwich", badge: "token", anchor: "anchor_token" },
    { id: "leader_jack", name: "Foreman Jack", town: "northwich", badge: "daemon", anchor: "anchor_daemon" },
    { id: "leader_ria", name: "Chemist Ria", town: "runcorn", badge: "proxy", anchor: "anchor_proxy" },
    { id: "leader_mo", name: "Netrunner Mo", town: "warrington", badge: "admin", anchor: "anchor_admin" }
  ];
  R.leaderOf = function (id) {
    for (let i = 0; i < R.LEADERS.length; i++) if (R.LEADERS[i].id === id) return R.LEADERS[i];
    return null;
  };

  // Regions register their named route trainers here; anything with
  // `rematch` or `leader` in its data is picked up automatically.
  R.registered = {};
  R.register = function (id, opts) {
    R.registered[id] = Object.assign({ id: id }, opts || {});
    return R.registered[id];
  };

  R.state = { last: {}, lastDay: {}, wins: {}, anchors: {} };

  function tdata(id) { return (MQ.Data && MQ.Data.trainers && MQ.Data.trainers[id]) || null; }

  R.eligible = function (id) {
    if (!id) return false;
    if (R.registered[id]) return true;
    if (R.leaderOf(id)) return true;
    const t = tdata(id);
    return !!(t && (t.leader || t.rematch || t.rematchable || t.notable));
  };
  R.beaten = function (id) { return !!A().flag("beat_" + id); };
  R.tier = function (id) { return U.clamp(A().num("rematch_" + id), 0, R.MAX_TIER); };
  R.setTier = function (id, n) { A().setFlag("rematch_" + id, U.clamp(n, 0, R.MAX_TIER)); };

  // ---- availability -------------------------------------------------
  // "After one real day, or thirty game-days, whichever comes first."
  R.cooldown = function (id) {
    const a = A();
    const last = R.state.last[id] || 0;
    if (!last) return 0;
    const realLeft = R.REAL_DAY - (a.now() - last);
    const gameLeft = (R.state.lastDay[id] === undefined) ? realLeft : ((R.state.lastDay[id] + R.GAME_DAYS) - a.gameDay()) * (R.REAL_DAY / R.GAME_DAYS);
    return Math.max(0, Math.min(realLeft, gameLeft));
  };
  R.available = function (id) {
    const a = A();
    if (!R.eligible(id)) return { ok: false, why: "They don't do rematches." };
    if (!R.beaten(id)) return { ok: false, why: "You have not beaten them once yet." };
    const tier = R.tier(id);
    if (tier >= R.MAX_TIER) return { ok: false, why: "Tier five. There is nothing above it.", maxed: true };
    const lead = R.leaderOf(id);
    if (lead) {
      // A leader climbs with your badge count; tier 5 is a post-game affair.
      const badges = MQ.Trainer && MQ.Trainer.badgeCount ? MQ.Trainer.badgeCount() : a.num("badges");
      const need = [0, 2, 4, 6, 8, 8][tier + 1] || 8;
      if (badges < need) return { ok: false, why: "Come back with " + need + " badges." };
      if (tier + 1 >= 5 && !a.flag("postgame_open")) return { ok: false, why: "Tier five waits for the end of the story." };
    }
    const cd = R.cooldown(id);
    if (cd > 0) return { ok: false, why: "Not today. Try tomorrow.", cooldown: cd };
    return { ok: true, tier: tier + 1 };
  };

  // ---- what the next tier looks like ---------------------------------
  R.growth = function (id, tier) {
    tier = tier === undefined ? R.tier(id) + 1 : tier;
    const t = tdata(id);
    const baseSize = t && t.party ? t.party.length : 2;
    const size = Math.min(6, tier >= R.MAX_TIER ? 6 : baseSize + tier);
    return {
      tier: tier, levels: tier * 5, size: size,
      gear: tier >= 3, traits: tier >= 3, full: tier >= 5,
      note: tier >= 5 ? "The full six, and everything they have learnt about you."
        : tier >= 3 ? "Six extra levels' worth of held items and better traits."
        : "One more on the team and five levels on all of them."
    };
  };

  R.ladder = function () {
    const out = [];
    const seen = {};
    function push(id, name, town, kind) {
      if (seen[id]) return;
      seen[id] = true;
      const av = R.available(id);
      out.push({
        id: id, name: name, town: town, kind: kind,
        tier: R.tier(id), beaten: R.beaten(id), wins: R.state.wins[id] || 0,
        ready: av.ok, why: av.why || null, cooldown: av.cooldown || 0,
        anchor: R.state.anchors[id] || null
      });
    }
    for (let i = 0; i < R.LEADERS.length; i++) {
      const l = R.LEADERS[i], t = tdata(l.id);
      push(l.id, (t && t.name) || l.name, l.town, "leader");
    }
    const reg = Object.keys(R.registered);
    for (let i = 0; i < reg.length; i++) {
      const r = R.registered[reg[i]], t = tdata(reg[i]);
      push(reg[i], r.name || (t && t.name) || reg[i], r.town || (t && t.town) || "", "named");
    }
    if (MQ.Data && MQ.Data.trainers) {
      MQ.Data.each("trainers", function (t, id) {
        if (!t || (!t.rematch && !t.rematchable && !t.notable)) return;
        push(id, t.name || id, t.town || "", t.leader ? "leader" : "named");
      });
    }
    return out;
  };

  // ---- the offer -------------------------------------------------------
  R.LINES = {
    leader: [
      "\"You again. Go on — I've been working on something.\"",
      "\"Right. Same room, different team.\"",
      "\"I watched the tape of last time. Twice.\""
    ],
    named: [
      "\"You're back. I've been practising, you know.\"",
      "\"Fancy it? I've got one you've not met.\"",
      "\"Best of the day so far. Let's see.\""
    ]
  };
  R.line = function (kind, id) {
    const lines = R.LINES[kind] || R.LINES.named;
    return lines[U.hash(String(id) + R.tier(id)) % lines.length];
  };

  // MQ.Interact calls MQ.Rematches.offer(trainerId, {npc, map}).
  R.offer = function (trainerId, ctx) {
    const a = A();
    ctx = ctx || {};
    const t = tdata(trainerId);
    const lead = R.leaderOf(trainerId);
    const kind = lead || (t && t.leader) ? "leader" : "named";
    const name = (t && t.name) || (lead && lead.name) || "Trainer";
    const av = R.available(trainerId);
    if (!av.ok) {
      if (av.maxed) return a.say(["\"" + (t && t.after ? t.after[0] : "Tier five. We've both run out of surprises.") + "\""], { name: name });
      return a.say(["\"" + av.why + "\""], { name: name });
    }
    const g = R.growth(trainerId, av.tier);
    return a.ask(R.line(kind, trainerId) + "\n(Rematch tier " + g.tier + ": " + g.note + ")", [
      { label: "Go on then", value: "yes" },
      { label: "Not just now", value: "no" }
    ], { name: name }).then(function (v) {
      if (v !== "yes") return null;
      return R.fight(trainerId, ctx);
    });
  };

  R.fight = function (trainerId, ctx) {
    const a = A();
    const t = tdata(trainerId);
    const lead = R.leaderOf(trainerId);
    const nextTier = R.tier(trainerId) + 1;
    // The engine reads the flag, so raise it before the bell.
    R.setTier(trainerId, nextTier);
    if (!MQ.Battle || !MQ.Battle.start) {
      return Promise.resolve(R.afterWin(trainerId, { outcome: "win", stub: true }));
    }
    a.music(lead || (t && t.leader) ? "battle_gym" : "battle_trainer");
    return MQ.Battle.start({
      kind: "trainer", trainer: t || { id: trainerId, name: trainerId, party: [] },
      playerParty: a.party(),
      rules: { canRun: false, canCatch: false, expShare: true },
      music: lead ? "battle_gym" : "battle_trainer"
    }).then(function (res) {
      if (res && (res.outcome === "win" || res.won)) return R.afterWin(trainerId, res);
      // lost: the tier stands, but the clock starts anyway
      R.setTier(trainerId, nextTier - 1);
      R.state.last[trainerId] = a.now();
      R.state.lastDay[trainerId] = a.gameDay();
      a.emit("rematch:lose", { trainer: trainerId, tier: nextTier });
      return a.say(["\"Not this time. Come and find me when you've had a think.\""], { name: (t && t.name) || trainerId })
        .then(function () { return res; });
    });
  };

  R.afterWin = function (trainerId, res) {
    const a = A();
    const tier = R.tier(trainerId);
    const lead = R.leaderOf(trainerId);
    const t = tdata(trainerId);
    R.state.wins[trainerId] = (R.state.wins[trainerId] || 0) + 1;
    R.state.last[trainerId] = a.now();
    R.state.lastDay[trainerId] = a.gameDay();
    a.emit("rematch:win", { trainer: trainerId, tier: tier, leader: !!lead });
    const lines = ["\"Better. Properly better.\""];
    let gave = null;
    if (lead && tier >= R.MAX_TIER && !R.state.anchors[trainerId]) {
      R.state.anchors[trainerId] = lead.anchor;
      a.give(lead.anchor, 1);
      gave = lead.anchor;
      lines.push("\"Here. The " + a.itemName(lead.anchor) + ". It's the badge, but heavier.\"");
    } else if (tier === 3) {
      a.addMarks(2);
      lines.push("\"Two Marks and my respect. One of those is worth having.\"");
    } else {
      a.addMarks(1);
    }
    if (MQ.Trainer && MQ.Trainer.addXp) MQ.Trainer.addXp(lead ? 25 : 10, "rematch");
    return a.say(lines, { name: (t && t.name) || (lead && lead.name) || trainerId })
      .then(function () { return { outcome: "win", tier: tier, anchor: gave, result: res }; });
  };

  // ---- a small screen for the trainer card / a gym receptionist -------
  R.scene = {
    id: "rematch",
    enter: function () {
      this.state = A().menuState(R.items());
      A().sfx("ui_open");
    },
    exit: function () { A().sfx("ui_close"); },
    update: function () {
      const a = A();
      if (a.backPressed()) { MQ.Scenes.pop(null); return; }
      const r = this.state.update();
      if (r && r.cancel) MQ.Scenes.pop(null);
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#1d1626", bottom: "#0b0910" });
      a.header(ctx, { title: "Rematch Ladder", sub: "Eight leaders, and everyone else who wants another go", accent: "#8b7cc0" });
      const y = a.headerBottom();
      const h = a.footerTop() - y - 4;
      const listW = Math.round(m.cw * 0.58) - 12;
      a.list(this.state, ctx, { x: m.l, y: y, w: listW, h: h, rowH: Math.round(50 * m.k), empty: "Nobody to fight twice yet." });
      const px = m.l + listW + 20, pw = m.r - px;
      a.panel(ctx, px, y, pw, h, { flat: true });
      const item = this.state.items[this.state.cursor];
      if (item) {
        const e = item.entry;
        a.text(ctx, e.name, px + 14, y + 12, { size: "l", color: C.brassLit, maxWidth: pw - 28 });
        a.text(ctx, U.capitalise(e.town || "") + " · tier " + e.tier + "/5", px + 14, y + 46, { size: "s", color: C.textDim });
        const g = R.growth(e.id, Math.min(R.MAX_TIER, e.tier + 1));
        a.text(ctx, e.tier >= R.MAX_TIER ? "Maxed." : "Next: " + g.note, px + 14, y + 76, { size: "s", color: C.text, maxWidth: pw - 28 });
        a.text(ctx, e.ready ? "READY" : (e.why || ""), px + 14, y + 130, { size: "m", color: e.ready ? C.good : C.warn, maxWidth: pw - 28 });
        if (e.anchor) a.text(ctx, "Anchor: " + a.itemName(e.anchor), px + 14, y + 164, { size: "s", color: C.brass });
        a.text(ctx, "Beaten " + e.wins + " time" + (e.wins === 1 ? "" : "s") + " since.", px + 14, y + h - 26, { size: "s", color: C.dim });
      }
      a.footer(ctx, [{ btn: "b", label: "Close" }]);
    }
  };
  R.items = function () {
    const l = R.ladder(), out = [];
    for (let i = 0; i < l.length; i++) {
      const e = l[i];
      out.push({
        label: e.name, value: e.id, entry: e,
        right: "T" + e.tier, sub: e.ready ? "Ready" : (e.why || ""),
        color: e.ready ? A().C().good : A().C().textDim
      });
    }
    return out;
  };
  R.open = function () { return A().open(R.scene); };
  R.start = function (id, ctx) { return id ? R.offer(id, ctx) : R.open(); };

  A().provider(R, "rematch", {
    save: function () { return { last: R.state.last, lastDay: R.state.lastDay, wins: R.state.wins, anchors: R.state.anchors }; },
    load: function (o) {
      R.state = { last: {}, lastDay: {}, wins: {}, anchors: {} };
      if (!o) return;
      R.state.last = o.last || {}; R.state.lastDay = o.lastDay || {};
      R.state.wins = o.wins || {}; R.state.anchors = o.anchors || {};
    }
  });

  MQ.Rematch = R;
  MQ.Rematches = R;      // MQ.Interact looks for this spelling
})();
