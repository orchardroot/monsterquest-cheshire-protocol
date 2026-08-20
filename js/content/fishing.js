// =============================================================
// MonsterQuest v2 — MQ.Fishing (content-activities)
// Rods, the bite bar, tables by place, chains, and what happens to
// whatever comes up. SIDE-CONTENT §2.4, SYSTEMS-SPEC §16.
//
// The table roll itself belongs to MQ.Encounters.fish (rod tiers,
// dawn/dusk legendary, night+Ghost Lens ghost tier, chain weighting);
// this file owns the *feel*: casting, the bite, the reel mini-game and
// the landing rules — and carries its own roll when the world engine
// is not there (headless tests, early boots).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const F = MQ.Fishing || {};
  function A() { return MQ.Activities; }

  // ---- rods --------------------------------------------------------
  F.RODS = [
    { id: "bamboo", item: "rod_bamboo", name: "Bamboo Rod", tiers: ["common", "uncommon"],
      blurb: "Cut from the canal-side clump. Bends alarmingly." },
    { id: "weighted", item: "rod_weighted", name: "Weighted Line", tiers: ["common", "uncommon", "rare"],
      blurb: "Doug's spare. He'd like it back, in principle." },
    { id: "carbon", item: "rod_carbon", name: "Carbon Rod", tiers: ["common", "uncommon", "rare", "legendary"],
      blurb: "Light as a promise. Dawn and dusk open up." },
    { id: "elm", item: "rod_elm", name: "Elm-handled Rod", tiers: ["common", "uncommon", "rare", "legendary", "ghost"],
      blurb: "Brewed, not bought. Elm doesn't rot in water." }
  ];
  F.rodDef = function (id) {
    for (let i = 0; i < F.RODS.length; i++) if (F.RODS[i].id === id) return F.RODS[i];
    return F.RODS[0];
  };
  F.rodIndex = function (id) {
    for (let i = 0; i < F.RODS.length; i++) if (F.RODS[i].id === id) return i;
    return 0;
  };
  // MQ.Encounters reads MQ.Fishing.rod directly, so this is a live getter
  // over the bag: own the Elm rod, hold the Elm rod.
  Object.defineProperty(F, "rod", {
    get: function () {
      const a = A();
      if (F.state && F.state.rod) return F.state.rod;
      for (let i = F.RODS.length - 1; i >= 0; i--) if (a && a.count(F.RODS[i].item) > 0) return F.RODS[i].id;
      const n = a ? a.num("fish_rod_tier") : 0;
      return ["bamboo", "bamboo", "weighted", "carbon", "elm"][U.clamp(n, 0, 4)];
    },
    configurable: true
  });
  F.hasRod = function () {
    const a = A();
    if (F.state.rod) return true;
    for (let i = 0; i < F.RODS.length; i++) if (a.count(F.RODS[i].item) > 0) return true;
    return a.num("fish_rod_tier") > 0;
  };
  F.setRod = function (id) {
    const i = F.rodIndex(id);
    F.state.rod = F.RODS[i].id;
    A().setFlag("fish_rod_tier", i + 1);
    return F.state.rod;
  };
  F.upgradeRod = function (id) {
    if (F.rodIndex(id) <= F.rodIndex(F.rod) && F.hasRod()) return false;
    F.setRod(id);
    return true;
  };

  // ---- tiers --------------------------------------------------------
  // zone: fraction of the bar you must stop the marker in.
  // hits: how many times. speed: marker sweeps per second.
  F.TIERS = {
    common: { name: "Common", zone: 0.34, hits: 1, speed: 0.55, colour: "#9fb8a0", cash: 40 },
    uncommon: { name: "Uncommon", zone: 0.26, hits: 1, speed: 0.70, colour: "#7cc0d8", cash: 90 },
    rare: { name: "Rare", zone: 0.175, hits: 2, speed: 0.90, colour: "#c9a34a", cash: 260 },
    legendary: { name: "Legendary", zone: 0.115, hits: 3, speed: 1.12, colour: "#f2d68a", cash: 900 },
    ghost: { name: "Ghost", zone: 0.10, hits: 3, speed: 1.25, colour: "#7ce0ff", cash: 1200 }
  };
  F.MAX_TENSION = 3;

  // Ghost-tier bottles: the canal at Anderton coughs up objects, not fish.
  F.BOTTLES = [
    { item: "brine_sample", say: "A stoppered bottle of brine, still warm. From where?" },
    { item: "salt_crystal", say: "A crystal the size of a thumb, wrapped in a bus timetable." },
    { item: "roe", say: "A jar of roe with a label in handwriting you almost recognise." },
    { item: "honey", say: "Honey. In the canal. Sealed, thank goodness." },
    { item: "capsule_night", say: "A capsule, matt black, absolutely dry inside." }
  ];

  F.state = {
    rod: null, chain: 0, chainSpecies: null, chainMap: null,
    casts: 0, landed: 0, lost: 0, records: {}, unpaid: [], dougPaid: 0, bottles: 0
  };

  // ---- helpers ------------------------------------------------------
  function mapObj(map) {
    if (!map) return (MQ.Overworld && MQ.Overworld.state && MQ.World.get(MQ.Overworld.state.map)) || null;
    if (typeof map === "string") return MQ.World && MQ.World.has(map) ? MQ.World.get(map) : null;
    return map;
  }
  F.tableFor = function (map) {
    const m = mapObj(map);
    if (!m) return null;
    const id = m.fishing || ("fish_" + m.id);
    if (MQ.Data && MQ.Data.encounters && MQ.Data.encounters[id]) return id;
    return null;
  };
  F.canFish = function (map) { return !!F.tableFor(map); };

  F.allowedTiers = function (rodId) {
    const a = A();
    const rod = F.rodDef(rodId || F.rod);
    let tiers = rod.tiers.slice();
    const phase = a.phase();
    if (phase !== "dawn" && phase !== "dusk") tiers = tiers.filter(function (t) { return t !== "legendary"; });
    const lens = a.count("ghost_lens") > 0 || a.flag("item_ghost_lens") || (MQ.Trainer && MQ.Trainer.wearing && MQ.Trainer.wearing("ghost_lens"));
    if (phase !== "night" || !lens) tiers = tiers.filter(function (t) { return t !== "ghost"; });
    return tiers;
  };

  // Our own roll, used when MQ.Encounters is absent.
  function ownRoll(map, rodId) {
    const a = A();
    const id = F.tableFor(map);
    if (!id) return null;
    const tbl = MQ.Data.encounters[id];
    const tiers = F.allowedTiers(rodId);
    const rows = [];
    let total = 0;
    for (let i = 0; i < tbl.table.length; i++) {
      const row = tbl.table[i];
      const tier = row.tier || "common";
      if (tiers.indexOf(tier) < 0) continue;
      let w = row.w || 10;
      if (F.state.chain > 0 && row.species === F.state.chainSpecies) w *= 1 + Math.min(1.5, F.state.chain * 0.06);
      rows.push({ row: row, w: w }); total += w;
    }
    if (!rows.length || total <= 0) return null;
    let r = Math.random() * total;
    for (let i = 0; i < rows.length; i++) {
      r -= rows[i].w;
      if (r <= 0) {
        const row = rows[i].row;
        const lv = U.randInt(row.min || 5, row.max || 10);
        return { species: row.species, level: lv, table: id, tier: row.tier || "common", rare: !!row.rare, item: row.item || null };
      }
    }
    const row = rows[0].row;
    return { species: row.species, level: row.min || 5, table: id, tier: row.tier || "common", rare: !!row.rare, item: row.item || null };
  }

  // Roll a bite. Returns {species, level, tier, table, item?} or null.
  F.roll = function (map, opts) {
    opts = opts || {};
    const m = mapObj(map);
    if (!m) return null;
    const rodId = opts.rod || F.rod;
    let res = null;
    if (MQ.Encounters && MQ.Encounters.fish) {
      try { res = MQ.Encounters.fish(m, opts.x || 0, opts.y || 0, { rod: rodId }); } catch (e) { res = null; }
    }
    if (!res) res = ownRoll(m, rodId);
    if (!res) return null;
    if (!res.tier) {
      // Encounters does not always echo the tier back; look it up.
      const tbl = MQ.Data.encounters[res.table];
      if (tbl) for (let i = 0; i < tbl.table.length; i++) if (tbl.table[i].species === res.species) { res.tier = tbl.table[i].tier || "common"; res.item = tbl.table[i].item || null; break; }
    }
    res.tier = res.tier || "common";
    return res;
  };

  // ---- the reel bar --------------------------------------------------
  // Everything the mini-game needs, computed once per bite so the scene
  // allocates nothing per frame.
  F.reelPlan = function (res) {
    const a = A();
    const t = F.TIERS[res.tier] || F.TIERS.common;
    const rodGap = F.rodIndex(F.rod) - Math.max(0, ["common", "uncommon", "rare", "legendary", "ghost"].indexOf(res.tier) - 1);
    let zone = t.zone + Math.max(0, rodGap) * 0.03;
    if (F.state.chain > 0) zone += Math.min(0.06, F.state.chain * 0.01);
    const bait = a.count("brew_bait_tin") > 0 || (MQ.Trainer && MQ.Trainer.wearing && MQ.Trainer.wearing("brew_bait_tin"));
    if (bait && (res.tier === "rare" || res.tier === "legendary" || res.tier === "ghost")) zone += 0.05;
    return {
      zone: U.clamp(zone, 0.07, 0.55),
      hits: t.hits, speed: t.speed, colour: t.colour, tierName: t.name
    };
  };

  // ---- landing --------------------------------------------------------
  // Length is flavour, but it is *consistent* flavour: species + level +
  // a per-catch roll, so Doug's ledger means something.
  F.lengthOf = function (species, level, rnd) {
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[species] : null;
    let base = 22 + level * 1.4;
    if (sp && sp.base) base += (sp.base.hp || 40) * 0.25;
    const roll = rnd ? rnd() : Math.random();
    return Math.round((base * (0.78 + roll * 0.5)) * 10) / 10;
  };
  F.record = function (species) { return F.state.records[species] || null; };
  F.best = function () {
    const out = [];
    const ids = Object.keys(F.state.records);
    for (let i = 0; i < ids.length; i++) {
      const r = F.state.records[ids[i]];
      out.push({ species: ids[i], name: A().speciesName(ids[i]), n: r.n, cm: r.cm, level: r.level, map: r.map, ts: r.ts });
    }
    out.sort(function (a, b) { return b.cm - a.cm; });
    return out;
  };
  F.noteCatch = function (res, cm) {
    const rec = F.state.records[res.species] || (F.state.records[res.species] = { n: 0, cm: 0, level: 0, map: null, ts: 0 });
    rec.n++;
    let pb = false;
    if (cm > rec.cm) {
      rec.cm = cm; rec.level = res.level; rec.map = res.map || null; rec.ts = A().now();
      pb = true;
      if (F.state.unpaid.indexOf(res.species) < 0) F.state.unpaid.push(res.species);
    }
    return pb;
  };
  // Roe, and the odd useful thing snagged on the way up.
  F.DROPS = {
    common: [{ id: "roe", n: 1, chance: 0.30 }],
    uncommon: [{ id: "roe", n: 1, chance: 0.45 }, { id: "oats", n: 1, chance: 0.10 }],
    rare: [{ id: "roe", n: 2, chance: 0.55 }, { id: "brine_sample", n: 1, chance: 0.15 }],
    legendary: [{ id: "roe", n: 3, chance: 0.80 }, { id: "salt_crystal", n: 1, chance: 0.25 }],
    ghost: [{ id: "roe", n: 3, chance: 0.60 }, { id: "capsule_night", n: 1, chance: 0.20 }]
  };
  F.rollDrop = function (tier, rnd) {
    const list = F.DROPS[tier] || F.DROPS.common;
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if ((rnd ? rnd() : Math.random()) < d.chance) return { id: d.id, n: d.n };
    }
    return null;
  };

  // Which fish fight and which come straight up the bank.
  F.landingKind = function (res) {
    if (res.item) return "item";
    const tier = res.tier || "common";
    if (tier === "rare" || tier === "legendary" || tier === "ghost") return "battle";
    const caught = !!(MQ.Trainer && MQ.Trainer.dex && MQ.Trainer.dex[res.species] && MQ.Trainer.dex[res.species].caught);
    return caught ? "measure" : "keep";
  };

  // ---- the scene -------------------------------------------------------
  const R = { x: 0, y: 0, w: 0, h: 0 };
  F.scene = {
    id: "fishing",
    enter: function (params) {
      const a = A();
      this.p = params || {};
      this.map = mapObj(this.p.map);
      this.phase = "cast";
      this.t = 0;
      this.biteAt = 800 + Math.random() * 2600;
      this.res = null;
      this.plan = null;
      this.marker = 0; this.dir = 1; this.zoneAt = 0.4;
      this.hits = 0; this.tension = 0;
      this.msg = "You cast. The line goes out further than you meant.";
      this.flash = 0; this.result = null; this.busy = false;
      this.ripple = 0;
      a.sfx("step_water");
    },
    exit: function () { A().sfx("ui_close"); },
    update: function (dt) {
      if (this.busy) return;
      const a = A();
      this.t += dt;
      this.ripple += dt;
      if (this.flash > 0) this.flash -= dt;
      const press = a.confirmPressed() || !!a.anyTap();
      if (this.phase === "cast") {
        if (this.t > this.biteAt) { this.phase = "bite"; this.t = 0; this.msg = "A bite!"; a.sfx("fish_bite"); a.buzz(30); }
        else if (a.backPressed()) { this.giveUp("You reel in. Nothing but a crisp packet and your own reflection."); }
        else if (press && this.t > 400) { this.giveUp("You twitch too early. Whatever it was, it isn't now."); }
        return;
      }
      if (this.phase === "bite") {
        // A short window: strike or it's gone.
        if (press) { this.strike(); return; }
        if (this.t > 900) this.giveUp("Gone. The line goes slack and slightly smug.");
        return;
      }
      if (this.phase === "reel") {
        const sp = this.plan.speed * (dt / 1000) * 2;
        this.marker += this.dir * sp;
        if (this.marker >= 1) { this.marker = 1; this.dir = -1; }
        if (this.marker <= 0) { this.marker = 0; this.dir = 1; }
        if (press) this.tryHit();
        else if (a.backPressed()) this.giveUp("You let it go. It was probably a bike.");
        return;
      }
      if (this.phase === "done") {
        if (this.t > 250 && (press || a.backPressed())) MQ.Scenes.pop(this.result);
        else if (this.t > 6000) MQ.Scenes.pop(this.result);
      }
    },
    strike: function () {
      const a = A();
      const res = F.roll(this.map, { rod: this.p.rod, x: this.p.x, y: this.p.y });
      if (!res) { this.giveUp("Nothing lives here. Not even a rumour."); return; }
      res.map = this.map ? this.map.id : null;
      this.res = res;
      this.plan = F.reelPlan(res);
      this.phase = "reel";
      this.t = 0;
      this.hits = 0; this.tension = 0;
      this.marker = 0; this.dir = 1;
      this.newZone();
      this.msg = this.plan.tierName + " weight on the line. " + this.plan.hits + (this.plan.hits > 1 ? " good pulls." : " good pull.");
      a.sfx("ui_open");
      F.state.casts++;
    },
    newZone: function () {
      const z = this.plan.zone;
      this.zoneAt = z / 2 + Math.random() * (1 - z);
    },
    tryHit: function () {
      const a = A();
      const z = this.plan.zone;
      const lo = this.zoneAt - z / 2, hi = this.zoneAt + z / 2;
      if (this.marker >= lo && this.marker <= hi) {
        this.hits++;
        this.flash = 220;
        a.sfx("ui_select"); a.buzz(15);
        if (this.hits >= this.plan.hits) { this.land(); return; }
        this.plan.speed *= 1.12;
        this.newZone();
        this.msg = "Good pull. " + (this.plan.hits - this.hits) + " to go.";
      } else {
        this.tension++;
        a.sfx("ui_error"); a.buzz(40);
        if (this.tension >= F.MAX_TENSION) { this.snap(); return; }
        this.msg = "Slack. " + (F.MAX_TENSION - this.tension) + " before the line goes.";
        this.newZone();
      }
    },
    snap: function () {
      F.state.lost++;
      if (MQ.Encounters && MQ.Encounters.breakChain) MQ.Encounters.breakChain();
      F.state.chain = 0; F.state.chainSpecies = null;
      this.msg = "The line parts with a noise like a snapped promise.";
      this.result = { landed: false, lost: true, msg: this.msg, species: this.res ? this.res.species : null };
      this.phase = "done"; this.t = 0;
      A().sfx("ui_error");
      A().emit("fish:lost", { species: this.res ? this.res.species : null, map: this.map ? this.map.id : null });
    },
    giveUp: function (msg) {
      this.result = { landed: false, msg: msg, species: null };
      this.phase = "done"; this.t = 0; this.msg = msg;
    },
    land: function () {
      const self = this, a = A(), res = this.res;
      this.busy = true;
      this.phase = "done"; this.t = 0;
      F.state.landed++;
      // chain bookkeeping mirrors MQ.Encounters so the display agrees
      if (F.state.chainMap !== res.map) { F.state.chain = 0; F.state.chainMap = res.map; }
      if (res.species === F.state.chainSpecies) F.state.chain = Math.min(20, F.state.chain + 1);
      else { F.state.chain = 1; F.state.chainSpecies = res.species; }
      const out = F.resolveLanding(res);
      this.result = out;
      this.msg = out.msg;
      a.sfx(out.kind === "battle" ? "capsule_shake" : "coin");
      if (out.kind === "battle") {
        // Hand it to the battle engine and pop when that finishes.
        MQ.Scenes.pop(out);
        return;
      }
      self.busy = false;
    },
    draw: function (ctx) {
      const a = A(), C = a.C(), m = a.m();
      a.backdrop(ctx, { top: "#0f2030", bottom: "#08131c" });
      // water
      const wy = m.cy - 20;
      ctx.fillStyle = "#12384c";
      ctx.fillRect(0, wy, m.w, m.h - wy);
      ctx.strokeStyle = "rgba(160,220,255,0.14)"; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const yy = wy + 26 + i * 34 + Math.sin((this.ripple / 700) + i) * 3;
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(m.w, yy); ctx.stroke();
      }
      // float
      const fx = m.cx, fy = wy + 40 + Math.sin(this.ripple / 260) * (this.phase === "bite" ? 9 : 3);
      ctx.fillStyle = this.phase === "bite" ? C.bad : C.paper;
      ctx.beginPath(); ctx.arc(fx, fy, 7, 0, 6.3); ctx.fill();
      ctx.strokeStyle = "rgba(240,240,240,0.55)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(m.cx - 180, m.t + 120); ctx.lineTo(fx, fy); ctx.stroke();

      a.header(ctx, {
        title: "Fishing", accent: "#3f7fd0",
        sub: (this.map ? (this.map.name || this.map.id) : "the water") + " · " + F.rodDef(F.rod).name,
        right: F.state.chain > 1 ? "chain ×" + F.state.chain : ""
      });
      const top = a.headerBottom();
      a.panel(ctx, m.l, top, m.cw, Math.round(56 * m.k), { flat: true });
      a.text(ctx, this.msg, m.l + 14, top + 16, { size: "m", color: C.text, maxWidth: m.cw - 28 });

      if (this.phase === "reel" && this.plan) {
        const bw = Math.min(620, m.cw - 40), bx = m.cx - bw / 2, by = m.b - Math.round(150 * m.k), bh = Math.round(36 * m.k);
        R.x = bx; R.y = by; R.w = bw; R.h = bh;
        a.panel(ctx, bx - 8, by - 8, bw + 16, bh + 16, { flat: true });
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(bx, by, bw, bh);
        const z = this.plan.zone;
        ctx.fillStyle = this.plan.colour;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(bx + (this.zoneAt - z / 2) * bw, by, z * bw, bh);
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.flash > 0 ? "#ffffff" : C.paper;
        ctx.fillRect(bx + this.marker * bw - 3, by - 6, 6, bh + 12);
        ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 2; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        // tension pips + hit pips
        for (let i = 0; i < this.plan.hits; i++) {
          ctx.fillStyle = i < this.hits ? C.good : "rgba(255,255,255,0.18)";
          ctx.fillRect(bx + i * 22, by - 26, 16, 8);
        }
        for (let i = 0; i < F.MAX_TENSION; i++) {
          ctx.fillStyle = i < this.tension ? C.bad : "rgba(255,255,255,0.18)";
          ctx.fillRect(bx + bw - 16 - i * 22, by - 26, 16, 8);
        }
        a.text(ctx, this.plan.tierName, bx, by + bh + 12, { size: "s", color: this.plan.colour });
        a.text(ctx, "tap when it crosses the band", bx + bw, by + bh + 12, { size: "s", align: "right", color: C.textDim });
      }
      if (this.phase === "bite") {
        const s = 1 + Math.sin(this.t / 60) * 0.12;
        ctx.save(); ctx.translate(m.cx, m.cy + 60); ctx.scale(s, s);
        a.text(ctx, "STRIKE", 0, -14, { size: "l", align: "center", color: C.bad, shadow: true });
        ctx.restore();
      }
      a.footer(ctx, this.phase === "done"
        ? [{ btn: "a", label: "Reel in" }]
        : [{ btn: "a", label: this.phase === "reel" ? "Pull" : "Strike" }, { btn: "b", label: "Give up" }]);
    }
  };

  // What happens once it is on the bank.
  F.resolveLanding = function (res) {
    const a = A();
    const kind = F.landingKind(res);
    const name = a.speciesName(res.species);
    const cm = F.lengthOf(res.species, res.level);
    const out = { landed: true, kind: kind, species: res.species, level: res.level, tier: res.tier, cm: cm, map: res.map, chain: F.state.chain };
    if (kind === "item") {
      const bottle = F.BOTTLES[Math.floor(Math.random() * F.BOTTLES.length)];
      const id = res.item || bottle.item;
      a.give(id, 1);
      F.state.bottles++;
      out.item = id;
      out.msg = (res.item ? "You land " + a.itemName(id) + "." : bottle.say);
      a.emit("fish:land", out);
      return out;
    }
    const drop = F.rollDrop(res.tier);
    if (drop) { a.give(drop.id, drop.n); out.drop = drop; }
    if (kind === "battle") {
      out.mon = res.monster || null;      // MQ.Encounters already rolled the instance
      out.msg = "Something heavy comes up out of the dark and it is not pleased.";
      a.emit("fish:land", out);
      return out;
    }
    const pb = F.noteCatch(out, cm);
    out.pb = pb;
    if (kind === "keep") {
      if (MQ.Party && MQ.Party.make && MQ.Party.add) {
        const mon = MQ.Party.make(res.species, res.level, { metAt: { map: res.map, level: res.level, ts: a.now(), how: "fishing" } });
        const where = MQ.Party.add(mon);
        out.monster = mon; out.where = where;
      }
      if (MQ.Trainer && MQ.Trainer.record) MQ.Trainer.record(res.species, { map: res.map, how: "fishing" });
      out.msg = name + ", " + cm + " cm. New to the ledger — it comes with you.";
      a.emit("catch", { species: res.species, map: res.map, level: res.level, how: "fishing" });
    } else {
      if (MQ.Trainer && MQ.Trainer.see) MQ.Trainer.see(res.species, { map: res.map, how: "fishing" });
      out.msg = name + ", " + cm + " cm" + (pb ? " — a personal best." : ". Weighed, noted, slipped back.");
    }
    if (drop) out.msg += " (" + a.itemName(drop.id) + " ×" + drop.n + ")";
    a.emit("fish:land", out);
    return out;
  };

  // ---- public entry ----------------------------------------------------
  // MQ.Interact calls MQ.Fishing.start({map, x, y}).
  F.start = function (params) {
    const a = A();
    params = params || {};
    const m = mapObj(params.map);
    if (!F.hasRod()) return a.say(["You have nothing to fish with. A stick would be optimistic."]);
    if (!m || !F.tableFor(m)) return a.say(["Water, certainly. Nothing in it that wants meeting."]);
    return a.open(F.scene, params).then(function (res) {
      if (!res) return null;
      if (res.kind === "battle") return F.toBattle(res, m);
      if (res.msg) return a.say([res.msg]).then(function () { return res; });
      return res;
    });
  };

  F.toBattle = function (res, map) {
    const a = A();
    if (!MQ.Battle || !MQ.Battle.start) { a.toast(res.msg); return Promise.resolve(res); }
    return a.say([res.msg]).then(function () {
      const make = MQ.Battle.makeMonster || (MQ.Data && MQ.Data.makeMonster);
      let mon = res.mon || null;
      if (!mon) { try { mon = make ? make(res.species, res.level, {}) : null; } catch (e) { mon = null; } }
      const weather = MQ.Clock && MQ.Clock.weatherOf && map ? MQ.Clock.weatherOf(map.weatherZone) : undefined;
      return MQ.Battle.start({
        kind: "wild", species: res.species, level: res.level,
        enemyParty: mon ? [mon] : [], playerParty: a.party(),
        rules: { canRun: true, canCatch: true, weather: weather },
        music: "battle_wild"
      }).then(function (br) {
        if (MQ.Encounters && MQ.Encounters.afterBattle) MQ.Encounters.afterBattle();
        if (br && (br.outcome === "run" || br.fled)) { F.state.chain = 0; if (MQ.Encounters && MQ.Encounters.breakChain) MQ.Encounters.breakChain(); }
        res.battle = br;
        return res;
      });
    });
  };

  // ---- Angler Doug -------------------------------------------------------
  F.dougPrice = function (species) {
    const rec = F.state.records[species];
    if (!rec) return 0;
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[species] : null;
    const tierCash = sp && sp.rarity === "rare" ? 260 : sp && sp.rarity === "uncommon" ? 90 : 40;
    return Math.round(tierCash + rec.cm * 6 + (rec.level || 1) * 5);
  };
  F.dougOwed = function () {
    let n = 0;
    for (let i = 0; i < F.state.unpaid.length; i++) n += F.dougPrice(F.state.unpaid[i]);
    return n;
  };
  F.doug = function () {
    const a = A();
    const owed = F.dougOwed();
    if (!F.state.unpaid.length) {
      return a.say([
        "\"Owt?\"",
        "\"Nothing new since last time. That's fishing, that is.\"",
        "\"Come back when you've had a proper one.\""
      ], { name: "Angler Doug" });
    }
    const lines = ["\"Go on then. What have you had?\""];
    for (let i = 0; i < F.state.unpaid.length && i < 4; i++) {
      const s = F.state.unpaid[i], r = F.state.records[s];
      lines.push("\"" + a.speciesName(s) + ", " + r.cm + " cm. That's a fish, that.\"");
    }
    lines.push("\"" + owed + " credits for the ledger. Don't spend it on rods you can't use.\"");
    return a.say(lines, { name: "Angler Doug" }).then(function () {
      a.addMoney(owed);
      F.state.dougPaid += owed;
      F.state.unpaid.length = 0;
      a.sfx("coin");
      return owed;
    });
  };

  // Angler Doug's ledger, for a UI that wants it.
  F.ledger = function () {
    return {
      casts: F.state.casts, landed: F.state.landed, lost: F.state.lost,
      bottles: F.state.bottles, paid: F.state.dougPaid,
      chain: F.state.chain, chainSpecies: F.state.chainSpecies,
      rod: F.rod, rodName: F.rodDef(F.rod).name,
      species: Object.keys(F.state.records).length,
      best: F.best()
    };
  };

  A().provider(F, "fishing", {
    save: function () {
      return {
        rod: F.state.rod, records: F.state.records, unpaid: F.state.unpaid,
        casts: F.state.casts, landed: F.state.landed, lost: F.state.lost,
        bottles: F.state.bottles, dougPaid: F.state.dougPaid,
        chain: F.state.chain, chainSpecies: F.state.chainSpecies, chainMap: F.state.chainMap
      };
    },
    load: function (o) {
      const s = F.state;
      s.rod = null; s.records = {}; s.unpaid = []; s.casts = 0; s.landed = 0; s.lost = 0;
      s.bottles = 0; s.dougPaid = 0; s.chain = 0; s.chainSpecies = null; s.chainMap = null;
      if (!o) return;
      s.rod = o.rod || null; s.records = o.records || {}; s.unpaid = o.unpaid || [];
      s.casts = o.casts || 0; s.landed = o.landed || 0; s.lost = o.lost || 0;
      s.bottles = o.bottles || 0; s.dougPaid = o.dougPaid || 0;
      s.chain = o.chain || 0; s.chainSpecies = o.chainSpecies || null; s.chainMap = o.chainMap || null;
    }
  });

  MQ.Fishing = F;
})();
