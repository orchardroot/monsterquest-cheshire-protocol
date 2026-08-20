// =============================================================
// MonsterQuest v2 — MQ.Brewing (content-activities)
// The elm press and the fermenting barrels at Y Berllan.
// SIDE-CONTENT §2.5, SYSTEMS-SPEC §16. Recipes live in
// js/data/achievements.js (MQ.Data.recipes) with a fallback here.
//
// Timers are wall-clock: a cask stores the real timestamp it was
// started at, so a brew carries on while the app is shut. Nothing
// is ever longer than four hours, and Mam-gu will finish one for you
// for a Mark, once a day, if you ask nicely.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const B = MQ.Brewing || {};
  function A() { return MQ.Activities; }

  B.BASE_CASKS = 3;
  B.MAX_CASKS = 5;
  B.HURRY_COST = 1;          // Casebook Marks

  // Used only if js/data/achievements.js is missing.
  const FALLBACK = {
    perry: { name: "Perry", tier: 1, output: "brew_perry", n: 1, minutes: 10,
      ingredients: [{ id: "perry_pear", n: 3 }], effect: "Party to full, Overdrive starts at 25.",
      tip: "\"Three pears. Three.\"", taught: true }
  };
  B.recipes = function () {
    if (MQ.Data && MQ.Data.recipes && MQ.Data.count("recipes")) return MQ.Data.recipes;
    return FALLBACK;
  };
  B.recipe = function (id) { return B.recipes()[id] || null; };
  B.ids = function () {
    const r = B.recipes(), out = Object.keys(r);
    out.sort(function (a, b) { return (r[a].tier - r[b].tier) || (r[a].minutes - r[b].minutes) || (a < b ? -1 : 1); });
    return out;
  };

  B.state = { casks: [], known: {}, hurryDay: 0, weeklyKey: 0, brewed: {}, tips: 0 };

  // ---- gates ----------------------------------------------------
  B.open = function () { return !!A().flag("brewing_open"); };
  B.tier = function () {
    const a = A();
    const n = a.num("brew_tier");
    if (n) return U.clamp(n, 1, 3);
    return a.flag("brewing_open") ? 1 : 0;
  };
  B.caskCount = function () {
    return A().flag("brew_barrels_5") ? B.MAX_CASKS : B.BASE_CASKS;
  };
  B.known = function (id) {
    const r = B.recipe(id);
    if (!r) return false;
    if (B.state.known[id]) return true;
    if (r.taught) return B.open();
    return !!A().flag("recipe_" + id);
  };
  B.learn = function (id) {
    if (!B.recipe(id)) return false;
    if (B.state.known[id]) return false;
    B.state.known[id] = true;
    A().setFlag("recipe_" + id, true);
    A().toast("Recipe learnt: " + B.recipe(id).name);
    A().emit("brew:learn", { recipe: id });
    return true;
  };
  // Why you cannot start this one right now (null = you can).
  B.blocked = function (id) {
    const a = A(), r = B.recipe(id);
    if (!r) return "No such recipe.";
    if (!B.open()) return "The shed is shut.";
    if (!B.known(id)) return "You do not know it yet.";
    if (r.tier > B.tier()) return "Press tier " + r.tier + " only.";
    if (r.gate && !a.test(r.gate)) return "Not yet.";
    if (r.once && (B.state.brewed[id] || a.count(r.output) > 0)) return "Once is enough.";
    if (r.weekly && B.state.weeklyKey === a.weekKey()) return "Once a week, and you've had this week's.";
    const miss = B.missing(id);
    if (miss.length) return "Short of " + miss.map(function (m) { return m.n + "× " + a.itemName(m.id); }).join(", ") + ".";
    return null;
  };
  B.missing = function (id) {
    const a = A(), r = B.recipe(id), out = [];
    if (!r) return out;
    for (let i = 0; i < r.ingredients.length; i++) {
      const ing = r.ingredients[i];
      const have = a.count(ing.id);
      if (have < ing.n) out.push({ id: ing.id, n: ing.n - have, have: have, need: ing.n });
    }
    return out;
  };

  // ---- casks ------------------------------------------------------
  function casks() {
    const n = B.caskCount();
    while (B.state.casks.length < n) B.state.casks.push(null);
    if (B.state.casks.length > n) B.state.casks.length = n;
    return B.state.casks;
  }
  B.casks = function () {
    const list = casks(), out = [];
    for (let i = 0; i < list.length; i++) out.push(B.caskInfo(i));
    return out;
  };
  B.caskInfo = function (i) {
    const c = casks()[i];
    if (!c) return { index: i, empty: true, ready: false, label: "Empty", remaining: 0 };
    const r = B.recipe(c.recipe);
    const left = B.remaining(i);
    return {
      index: i, empty: false, recipe: c.recipe,
      name: (r && r.name) || c.recipe, ready: left <= 0,
      remaining: left, total: (c.minutes || 10) * 60000,
      label: (r && r.name) || c.recipe, started: c.started
    };
  };
  B.remaining = function (i) {
    const c = casks()[i];
    if (!c) return 0;
    if (c.done) return 0;
    const end = c.started + (c.minutes || 10) * 60000;
    return Math.max(0, end - A().now());
  };
  B.ready = function (i) { const c = casks()[i]; return !!c && B.remaining(i) <= 0; };
  B.readyCount = function () {
    let n = 0;
    for (let i = 0; i < casks().length; i++) if (B.ready(i)) n++;
    return n;
  };
  B.freeCask = function () {
    const list = casks();
    for (let i = 0; i < list.length; i++) if (!list[i]) return i;
    return -1;
  };

  B.begin = function (recipeId, caskIndex) {
    const a = A(), r = B.recipe(recipeId);
    const why = B.blocked(recipeId);
    if (why) return { ok: false, msg: why };
    const i = caskIndex === undefined || caskIndex < 0 ? B.freeCask() : caskIndex;
    if (i < 0) return { ok: false, msg: "Every barrel is full. Patience is the ingredient." };
    if (casks()[i]) return { ok: false, msg: "That one's working." };
    for (let k = 0; k < r.ingredients.length; k++) if (!a.take(r.ingredients[k].id, r.ingredients[k].n)) return { ok: false, msg: "Something went missing off the bench." };
    casks()[i] = { recipe: recipeId, started: a.now(), minutes: r.minutes, done: false };
    if (r.weekly) B.state.weeklyKey = a.weekKey();
    a.sfx("brew_bubble");
    a.emit("brew:start", { recipe: recipeId, cask: i, minutes: r.minutes });
    return { ok: true, cask: i, msg: "Barrel " + (i + 1) + ": " + r.name + ". " + B.timeWord(r.minutes) + "." };
  };

  B.timeWord = function (minutes) {
    if (minutes <= 10) return "Ten minutes — go and look at the sea";
    if (minutes <= 60) return "An hour — walk somewhere and come back";
    return "Four hours — that's a proper afternoon";
  };

  B.hurryReady = function () { return B.state.hurryDay !== A().dayKey(); };
  B.hurry = function (i) {
    const a = A();
    if (!casks()[i]) return { ok: false, msg: "Nothing in it." };
    if (B.ready(i)) return { ok: false, msg: "It's done. Take it." };
    if (!B.hurryReady()) return { ok: false, msg: "\"I've hurried one for you today. Ask me tomorrow.\"" };
    if (a.marks() < B.HURRY_COST) return { ok: false, msg: "\"A Mark. I'm not made of afternoons.\"" };
    if (!a.spendMarks(B.HURRY_COST)) return { ok: false, msg: "\"A Mark, I said.\"" };
    casks()[i].done = true;
    B.state.hurryDay = a.dayKey();
    a.sfx("brew_bubble");
    return { ok: true, msg: "\"There. Don't tell the barrel.\"" };
  };

  B.collect = function (i) {
    const a = A();
    const c = casks()[i];
    if (!c) return { ok: false, msg: "Nothing in it." };
    if (!B.ready(i)) return { ok: false, msg: "Not yet. " + a.mins(B.remaining(i)) + " left." };
    const r = B.recipe(c.recipe);
    casks()[i] = null;
    B.state.brewed[c.recipe] = (B.state.brewed[c.recipe] || 0) + 1;
    a.give(r.output, r.n || 1);
    a.setFlag("brewed_" + r.output, true);
    // the achievements engine turns brew:done into the trainer stat + XP
    a.sfx("brew_bubble");
    a.emit("brew:done", { recipe: c.recipe, output: r.output, n: r.n || 1, cask: i, tier: r.tier });
    return { ok: true, recipe: c.recipe, item: r.output, msg: r.name + " — " + (r.n || 1) + " out of barrel " + (i + 1) + ". " + (r.note || "") };
  };
  B.collectAll = function () {
    const out = [];
    for (let i = 0; i < casks().length; i++) if (B.ready(i)) { const res = B.collect(i); if (res.ok) out.push(res); }
    return out;
  };

  // ---- Mam-gu ------------------------------------------------------
  const TIPS = [
    "\"Elm doesn't rot in water. That's why the press is elm and the mains were elm and the county floats.\"",
    "\"Don't stir it. Stirring is for people who can't wait, and you can wait — you walked here.\"",
    "\"Perry's not cider. Say that in the pub if you want an evening.\"",
    "\"Your nain's nain made this in the same barrel. Different wood, same barrel. Think about it.\"",
    "\"The salt sorts the apple out. Everything wants an argument to settle it.\"",
    "\"You've that cat's fur all over you. He's been in the barley again.\"",
    "\"Ten minutes is ten minutes. The clock on the wall is real, not the one in the sky.\"",
    "\"If it ticks, leave it. If it hisses, leave it faster.\"",
    "\"Nino sent a bottle of this to Aberaeron once. Customs opened it. Customs kept it.\"",
    "\"You can buy a rod. You cannot buy an elm-handled one. That's the difference between money and time.\""
  ];
  B.tip = function () {
    const t = TIPS[B.state.tips % TIPS.length];
    B.state.tips++;
    return t;
  };
  B.tipFor = function (recipeId) {
    const r = B.recipe(recipeId);
    return (r && r.tip) || B.tip();
  };

  // ---- scene --------------------------------------------------------
  B.scene = {
    id: "brewing",
    enter: function (params) {
      this.p = params || {};
      this.tab = this.p.tab === "recipes" || this.p === "press" ? 1 : 0;
      this.caskState = A().menuState(B.caskItems());
      this.recState = A().menuState(B.recipeItems());
      this.busy = false;
      this.note = B.tip();
      A().sfx("ui_open");
      A().music("town_y_berllan");
    },
    exit: function () { A().sfx("ui_close"); },
    resume: function () { this.refresh(); this.busy = false; },
    refresh: function () {
      this.caskState.setItems(B.caskItems());
      this.recState.setItems(B.recipeItems());
    },
    update: function () {
      if (this.busy) return;
      const a = A();
      const tp = a.tabTapped();
      if (tp >= 0) { this.tab = tp; a.sfx("ui_move"); this.refresh(); return; }
      if (a.backPressed()) { MQ.Scenes.pop(null); return; }
      const st = this.tab === 0 ? this.caskState : this.recState;
      const r = st.update();
      if (this.tab === 0) this.caskState.setItems(B.caskItems());
      if (!r) return;
      if (r.cancel) { MQ.Scenes.pop(null); return; }
      const item = r.item || st.items[r.selected];
      if (!item) return;
      if (this.tab === 0) this.onCask(item.value);
      else this.onRecipe(item.value);
    },
    onCask: function (i) {
      const self = this, a = A();
      const info = B.caskInfo(i);
      if (info.empty) { self.tab = 1; a.sfx("ui_move"); self.refresh(); return; }
      if (info.ready) {
        const res = B.collect(i);
        a.sfx(res.ok ? "coin" : "ui_error");
        self.busy = true;
        a.say([res.msg], { name: "Y Berllan" }).then(function () { self.busy = false; self.refresh(); });
        return;
      }
      self.busy = true;
      a.ask("Barrel " + (i + 1) + ": " + info.name + ", " + a.mins(info.remaining) + " left.", [
        { label: "Ask Mam-gu to hurry it (1 Mark)", value: "hurry" },
        { label: "Leave it be", value: "no" }
      ]).then(function (v) {
        if (v !== "hurry") { self.busy = false; return null; }
        const res = B.hurry(i);
        a.sfx(res.ok ? "brew_bubble" : "ui_error");
        return a.say([res.msg], { name: "Mam-gu" }).then(function () { self.busy = false; self.refresh(); });
      });
    },
    onRecipe: function (id) {
      const self = this, a = A();
      const why = B.blocked(id);
      if (why) { a.sfx("ui_error"); self.busy = true; a.say([why], { name: "Mam-gu" }).then(function () { self.busy = false; }); return; }
      const res = B.begin(id);
      a.sfx(res.ok ? "brew_bubble" : "ui_error");
      self.busy = true;
      a.say([res.msg, B.tipFor(id)], { name: "Mam-gu" }).then(function () { self.busy = false; self.tab = 0; self.refresh(); });
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#241a14", bottom: "#0d0a08" });
      a.header(ctx, {
        title: "The Elm Press", accent: "#c9a34a",
        sub: "Y Berllan · press tier " + B.tier() + " · " + B.caskCount() + " barrels",
        right: a.marks() + " marks"
      });
      const top = a.headerBottom();
      const th = a.tabStrip(ctx, [{ label: "Barrels", pip: B.readyCount() ? C.good : false }, "Recipes"], this.tab, { x: m.l, y: top, w: m.cw });
      const y = top + th + 8;
      const h = a.footerTop() - y - 4;
      const listW = Math.round(m.cw * 0.55) - 12;
      const st = this.tab === 0 ? this.caskState : this.recState;
      a.list(st, ctx, {
        x: m.l, y: y, w: listW, h: h, rowH: Math.round(52 * m.k),
        render: this.tab === 0 ? this.drawCask : null,
        empty: "Nothing to do here yet."
      });
      const px = m.l + listW + 20, pw = m.r - px;
      a.panel(ctx, px, y, pw, h, { flat: true });
      const item = st.items[st.cursor];
      if (this.tab === 1 && item) {
        const r = B.recipe(item.value);
        a.text(ctx, r.name, px + 14, y + 12, { size: "l", color: C.brassLit });
        a.text(ctx, "Tier " + r.tier + " · " + B.timeWord(r.minutes).split(" — ")[0], px + 14, y + 44, { size: "s", color: C.textDim });
        let iy = y + 72;
        a.text(ctx, "INGREDIENTS", px + 14, iy, { size: "s", color: C.brass }); iy += 20;
        for (let i = 0; i < r.ingredients.length; i++) {
          const ing = r.ingredients[i];
          const have = a.count(ing.id);
          a.text(ctx, a.itemName(ing.id) + " ×" + ing.n, px + 22, iy, { size: "s", color: have >= ing.n ? C.text : C.bad });
          a.text(ctx, "have " + have, px + pw - 16, iy, { size: "s", align: "right", color: C.textDim });
          iy += 18;
        }
        iy += 10;
        a.text(ctx, r.effect, px + 14, iy, { size: "s", color: C.good, maxWidth: pw - 28 }); iy += 40;
        a.text(ctx, r.tip, px + 14, iy, { size: "s", color: C.textDim, maxWidth: pw - 28 });
        const why = B.blocked(item.value);
        if (why) a.text(ctx, why, px + 14, y + h - 26, { size: "s", color: C.warn, maxWidth: pw - 28 });
      } else {
        a.text(ctx, "MAM-GU", px + 14, y + 12, { size: "m", color: C.brass });
        a.text(ctx, this.note, px + 14, y + 40, { size: "s", color: C.text, maxWidth: pw - 28 });
        const ready = B.readyCount();
        a.text(ctx, ready ? ready + " ready to come out." : "Nothing ready. That is what \"fermenting\" means.",
          px + 14, y + h - 60, { size: "s", color: ready ? C.good : C.textDim, maxWidth: pw - 28 });
        a.text(ctx, B.hurryReady() ? "She'll hurry one today, for a Mark." : "She's hurried one today already.",
          px + 14, y + h - 32, { size: "s", color: C.textDim, maxWidth: pw - 28 });
      }
      a.footer(ctx, [{ btn: "a", label: this.tab === 0 ? "Barrel" : "Set it going" }, { btn: "b", label: "Out" }, { btn: "lr", label: "Tab" }]);
    },
    drawCask: function (ctx, item, x, y, w, h, sel) {
      const a = A(), C = a.C();
      const info = B.caskInfo(item.value);
      a.row(ctx, { label: info.empty ? "Barrel " + (item.value + 1) + " — empty" : "Barrel " + (item.value + 1) + " — " + info.name,
        right: info.empty ? "" : info.ready ? "READY" : a.mins(info.remaining),
        color: info.ready ? C.good : info.empty ? C.textDim : C.text }, x, y, w, h, sel);
      if (!info.empty && !info.ready) {
        const ratio = 1 - info.remaining / Math.max(1, info.total);
        a.meter(ctx, x + 12, y + h - 12, w - 24, 5, ratio, C.brass);
      }
    }
  };

  B.caskItems = function () {
    const out = [];
    const list = casks();
    for (let i = 0; i < list.length; i++) out.push({ label: "Barrel " + (i + 1), value: i });
    return out;
  };
  B.recipeItems = function () {
    const a = A(), ids = B.ids(), out = [];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i], r = B.recipe(id);
      if (!B.known(id)) {
        if (r.tier > B.tier()) continue;
        out.push({ label: "??? (tier " + r.tier + ")", value: id, sub: "Not written down yet.", disabled: true, color: a.C().dim });
        continue;
      }
      const why = B.blocked(id);
      out.push({
        label: r.name, value: id,
        right: r.minutes >= 240 ? "4h" : r.minutes >= 60 ? (r.minutes / 60) + "h" : r.minutes + "m",
        sub: why || r.effect,
        color: why ? a.C().textDim : a.C().text
      });
    }
    return out;
  };

  // ---- public entry ----------------------------------------------------
  // MQ.Interact calls MQ.Brewing.start() at a vat and start('press') at the press.
  B.start = function (mode) {
    const a = A();
    if (!B.open()) {
      return a.say([
        "The shed smells of apples and rust.",
        "The press is chained shut and the barrels are upside down.",
        "(Somebody has to open Y Berllan first.)"
      ]);
    }
    return a.open(B.scene, mode === "press" ? { tab: "recipes" } : {});
  };
  B.status = function () {
    return {
      open: B.open(), tier: B.tier(), casks: B.casks(), ready: B.readyCount(),
      hurry: B.hurryReady(), known: B.ids().filter(B.known)
    };
  };

  A().provider(B, "brewing", {
    save: function () {
      return { casks: B.state.casks, known: B.state.known, hurryDay: B.state.hurryDay, weeklyKey: B.state.weeklyKey, brewed: B.state.brewed };
    },
    load: function (o) {
      B.state.casks = []; B.state.known = {}; B.state.hurryDay = 0; B.state.weeklyKey = 0; B.state.brewed = {}; B.state.tips = 0;
      if (!o) return;
      B.state.casks = o.casks || [];
      B.state.known = o.known || {};
      B.state.hurryDay = o.hurryDay || 0;
      B.state.weeklyKey = o.weeklyKey || 0;
      B.state.brewed = o.brewed || {};
    }
  });

  MQ.Brewing = B;
})();
