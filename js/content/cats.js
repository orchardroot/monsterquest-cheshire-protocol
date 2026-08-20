// =============================================================
// MonsterQuest v2 — MQ.Cats (content)
// MEADOW and BIGBOY: unlock, following, trust 0-5 and its perks,
// sniffing out hidden things, rest points, collars, cat-only paths
// and the data the battle engine needs for them.
// SIDE-CONTENT §3, DESIGN-INDEX §3 (`squeeze`), ROSTER §1a.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.Events;
  const C = MQ.Cats || {};

  function emit(n, d) { try { E.emit(n, d); } catch (e) { MQ.warn("[Cats] listener threw on " + n, e); } }
  function toast(t) { if (MQ.UI && MQ.UI.toast) MQ.UI.toast(t); }
  function flagSet(id, v) { if (MQ.Flags) MQ.Flags.set(id, v === undefined ? true : v); }
  function flagGet(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }

  // Points → trust level. Deliberately slow at the top: T5 is a relationship.
  C.THRESHOLDS = [0, 5, 15, 30, 50, 75];
  C.MAX_TRUST = 5;

  C.DEFS = {
    meadow: {
      id: "meadow", species: "meadow", npc: "cat_meadow", name: "MEADOW",
      blurb: "Small, black, absurdly fast. Arrives before you have finished deciding to go.",
      ability: "slipstream", overdrive: "zoomies", signature: "skitter",
      sniffs: ["item", "ingredient", "hidden"], gait: "darts ahead and waits, visibly disappointed",
      restFlagPrefix: "meadow_sat"
    },
    bigboy: {
      id: "bigboy", species: "bigboy", npc: "cat_bigboy", name: "BIGBOY",
      blurb: "Huge, black and white, and entirely in charge of when the walk stops.",
      ability: "back_from_the_brink", overdrive: "brink_roar", signature: "big_sit",
      sniffs: ["creature", "bounty"], gait: "lumbers, then sits down without warning",
      restFlagPrefix: "bigboy_sat"
    }
  };
  C.IDS = ["meadow", "bigboy"];
  C.get = function (id) { return C.DEFS[id] || null; };

  // Rest points — BIGBOY sits down and something in the story notices.
  C.REST_POINTS = [
    { map: "kerridge_hill", flag: "bigboy_sat_kerridge", cat: "bigboy", text: "BIGBOY sits down on the hill and looks at White Nancy for a long time." },
    { map: "tatton_park", flag: "bigboy_sat_tatton", cat: "bigboy", text: "BIGBOY sits in the middle of the deer park. The deer decide to be elsewhere." },
    { map: "frodsham_hill", flag: "bigboy_sat_frodsham", cat: "bigboy", text: "BIGBOY sits above the Mersey with the bridges laid out below him, unimpressed." },
    { map: "chester_amphitheatre", flag: "bigboy_sat_roodee", cat: "bigboy", text: "BIGBOY sits in the middle of the Roodee. Racing is suspended." },
    { map: "alderley_edge", flag: "meadow_sat_edge", cat: "meadow", text: "MEADOW tucks herself into a hollow at Stormy Point and refuses to be a cat you can pick up." },
    { map: "y_berllan", flag: "meadow_sat_orchard", cat: "meadow", text: "MEADOW walks the orchard wall end to end, twice, then sits on the press." }
  ];

  // Cosmetic collars. NEW IDS (see report) — earned from `cat_token_<n>` pickups.
  C.COLLARS = [
    { id: "collar_plain", name: "Plain Leather", how: "start" },
    { id: "collar_bell", name: "Small Brass Bell", how: "cat_token_1" },
    { id: "collar_silk", name: "Macclesfield Silk", how: "case_01_silk_thread" },
    { id: "collar_tartan", name: "Bollington Tartan", how: "cat_token_2" },
    { id: "collar_hi_vis", name: "Hi-Vis (Miniature)", how: "cat_token_3" },
    { id: "collar_salt", name: "Salt-Crusted Cord", how: "cat_token_4" },
    { id: "collar_paisley", name: "Paisley, Regrettably", how: "cat_token_5" },
    { id: "collar_arcade", name: "Arcade Neon", how: "case_28_wire_arcade" },
    { id: "collar_orchard", name: "Orchard Twine", how: "brewing_open" },
    { id: "collar_signed", name: "SIGNED", how: "pippin_found" }
  ];

  C.state = {
    meadow: { points: 0, trust: 0, collar: "collar_plain", holding: null, dispatched: null, giftDay: 0, gifts: 0 },
    bigboy: { points: 0, trust: 0, collar: "collar_plain", holding: null, dispatched: null, giftDay: 0, gifts: 0 }
  };
  C.following = null;         // 'meadow' | 'bigboy' | null
  C.collarsOwned = { collar_plain: true };
  C.lastSniff = null;
  C.sniffedTiles = {};        // "map:x,y" → true, so one paw-print per find

  C.unlocked = function () { return !!flagGet("cats_joined"); };
  C.unlock = function () {
    if (C.unlocked()) return false;
    flagSet("cats_joined", true);
    // The cats join the party and stay there — they are never boxed.
    if (MQ.Party) {
      for (let i = 0; i < C.IDS.length; i++) {
        const d = C.DEFS[C.IDS[i]];
        if (MQ.Party.has(d.species)) continue;
        const mon = MQ.Party.make(d.species, 5, { nickname: d.name, ability: d.ability });
        MQ.Party.add(mon, { force: true });
      }
    }
    if (MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities) { try { MQ.Overworld.state.abilities.add("squeeze"); } catch (e) { /* ignore */ } }
    C.follow("meadow");
    emit("cats:joined", {});
    return true;
  };

  // ---- following ---------------------------------------------------
  C.follow = function (id) {
    if (id && !C.DEFS[id]) return false;
    if (id && !C.unlocked()) return false;
    C.following = id || null;
    emit("cat:follow", { cat: C.following });
    if (C.following) toast(C.DEFS[C.following].name + " " + C.DEFS[C.following].gait + ".");
    return true;
  };
  C.stopFollowing = function () { return C.follow(null); };
  C.whistle = function () {
    if (!C.unlocked()) return null;
    const next = C.following === "meadow" ? "bigboy" : "meadow";
    C.follow(next);
    return next;
  };
  C.follower = function () { return C.following ? C.DEFS[C.following] : null; };
  C.monster = function (id) {
    if (!MQ.Party) return null;
    const sp = C.DEFS[id] ? C.DEFS[id].species : null;
    return sp ? MQ.Party.find(function (m) { return m.species === sp; }) : null;
  };

  // ---- trust -------------------------------------------------------
  C.trust = function (id) { const s = C.state[id]; return s ? s.trust : 0; };
  C.points = function (id) { const s = C.state[id]; return s ? s.points : 0; };
  C.nextThreshold = function (id) {
    const t = C.trust(id);
    return t >= C.MAX_TRUST ? C.THRESHOLDS[C.MAX_TRUST] : C.THRESHOLDS[t + 1];
  };
  function recompute(id) {
    const s = C.state[id];
    let lvl = 0;
    for (let i = 0; i <= C.MAX_TRUST; i++) if (s.points >= C.THRESHOLDS[i]) lvl = i;
    const old = s.trust;
    s.trust = lvl;
    flagSet("trust_" + id, lvl);
    if (lvl > old) {
      emit("cat:trust", { cat: id, trust: lvl, old: old });
      toast(C.DEFS[id].name + " trusts you a little more. (" + lvl + "/5)");
      const perk = C.perkText(id, lvl);
      if (perk) toast(perk);
    }
    return lvl;
  }
  C.addTrust = function (id, n, reason) {
    if (!C.state[id]) return 0;
    const mult = MQ.Progression ? MQ.Progression.trustGainMult() : 1;
    C.state[id].points += Math.max(0, Math.round((n === undefined ? 1 : n) * mult));
    emit("cat:trustpoints", { cat: id, reason: reason, points: C.state[id].points });
    return recompute(id);
  };
  C.setTrust = function (id, level) {
    if (!C.state[id]) return 0;
    C.state[id].points = Math.max(C.state[id].points, C.THRESHOLDS[U.clamp(level, 0, C.MAX_TRUST)]);
    return recompute(id);
  };
  C.perkText = function (id, level) {
    const name = C.DEFS[id].name;
    switch (level) {
      case 1: return name + " ranges further now — sniffing out things five tiles off.";
      case 2: return name + " will carry a held item for you.";
      case 3: return id === "meadow" ? "MEADOW dodges the first hit of a battle, once a fight." : "BIGBOY's Back from the Brink now heals him a quarter as well.";
      case 4: return name + " can be sent off alone to fish or gather while you get on.";
      case 5: return name + " goes everywhere with you now — gyms and the Arena included — and has learned " + (id === "meadow" ? "Skitter." : "Big Sit.");
      default: return "";
    }
  };
  C.feed = function (id, itemId) {
    if (!C.state[id]) return false;
    const today = C.today();
    if (itemId === "brew_cats_cup") {
      if (C.state[id].fedDay === today) { toast(C.DEFS[id].name + " has had one today, and knows it."); return false; }
      C.state[id].fedDay = today;
      C.addTrust(id, 6, "cats_cup");
      return true;
    }
    C.addTrust(id, 2, "fed");
    toast(C.DEFS[id].name + " accepts the offering with dignity.");
    return true;
  };
  C.kindness = function (id, n) { return C.addTrust(id || C.following || "meadow", n || 3, "kindness"); };

  // Trust perks, read by battle / world / fishing.
  C.sniffRange = function (id) { return C.trust(id) >= 1 ? 5 : 3; };
  C.canHoldItem = function (id) { return C.trust(id) >= 2; };
  C.canDispatch = function (id) { return C.trust(id) >= 4; };
  C.allowedInGyms = function (id) { return C.trust(id) >= 5; };
  C.holdItem = function (id, itemId) {
    if (!C.canHoldItem(id)) return { ok: false, msg: C.DEFS[id].name + " is not carrying anything for you yet." };
    if (itemId && MQ.Inventory && !MQ.Inventory.has(itemId)) return { ok: false, msg: "You do not have that." };
    const old = C.state[id].holding;
    if (old && MQ.Inventory) MQ.Inventory.add(old, 1, { silent: true });
    if (itemId && MQ.Inventory) MQ.Inventory.remove(itemId, 1);
    C.state[id].holding = itemId || null;
    emit("cat:hold", { cat: id, item: itemId, old: old });
    return { ok: true, old: old };
  };

  // What the battle engine needs to build a cat.
  C.battleData = function (id) {
    const d = C.DEFS[id];
    if (!d) return null;
    const t = C.trust(id);
    return {
      cat: id, species: d.species, ability: d.ability, overdrive: d.overdrive,
      trust: t, held: C.state[id].holding,
      extraMove: t >= 5 ? d.signature : null,
      dodgeFirstHit: id === "meadow" && t >= 3,
      brinkHeals: id === "bigboy" && t >= 3 ? 0.25 : 0,
      brinkUses: id === "bigboy" ? (MQ.Progression ? MQ.Progression.effect("brinkUses") : 1) : 0,
      brinkShield: id === "bigboy" && !!flagGet("bigboy_shield"),
      slipstreamStages: id === "meadow" ? (MQ.Progression ? MQ.Progression.effect("meadowSlipstreamStage") : 1) : 0,
      allowedInGyms: C.allowedInGyms(id)
    };
  };

  // ---- collars -----------------------------------------------------
  C.ownsCollar = function (cid) { return !!C.collarsOwned[cid]; };
  C.unlockCollar = function (cid) {
    if (C.collarsOwned[cid]) return false;
    C.collarsOwned[cid] = true;
    const def = C.COLLARS.filter(function (x) { return x.id === cid; })[0];
    toast("New collar: " + ((def && def.name) || cid) + ".");
    emit("cat:collar", { collar: cid, unlocked: true });
    return true;
  };
  C.setCollar = function (id, cid) {
    if (!C.state[id] || !C.ownsCollar(cid)) return false;
    C.state[id].collar = cid;
    emit("cat:collar", { cat: id, collar: cid });
    return true;
  };
  C.collar = function (id) { return C.state[id] ? C.state[id].collar : null; };

  // ---- sniffing ----------------------------------------------------
  // MEADOW smells items and ingredients; BIGBOY smells creatures and bounties.
  function tileKey(map, x, y) { return map + ":" + x + "," + y; }
  C.candidates = function (map) {
    const out = [];
    const def = MQ.World && MQ.World.get ? MQ.World.get(map) : null;
    if (!def) return out;
    const items = def.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const f = it.flag || ("item_" + map + "_" + (i + 1));
      if (flagGet(f)) continue;
      out.push({ kind: it.hidden ? "hidden" : "item", x: it.x, y: it.y, item: it.item, flag: f });
    }
    if (MQ.Gathering && MQ.Gathering.nodesAt) {
      const nodes = MQ.Gathering.nodesAt(map) || [];
      for (let j = 0; j < nodes.length; j++) if (nodes[j].ripe !== false) out.push({ kind: "ingredient", x: nodes[j].x, y: nodes[j].y, item: nodes[j].item });
    }
    return out;
  };
  C.smells = function (catId, kind) {
    const d = C.DEFS[catId];
    return !!d && d.sniffs.indexOf(kind) >= 0;
  };
  // Scan around a tile; emits 'cat:sniff' at most once per discovered tile.
  C.scan = function (map, x, y, catId) {
    catId = catId || C.following;
    if (!catId || !C.unlocked()) return null;
    const range = C.sniffRange(catId);
    if (C.smells(catId, "item")) {
      const list = C.candidates(map);
      let best = null, bestD = 1e9;
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        const d = Math.abs(c.x - x) + Math.abs(c.y - y);
        if (d <= range && d < bestD) { best = c; bestD = d; }
      }
      if (best) {
        const key = tileKey(map, best.x, best.y);
        if (C.sniffedTiles[key]) return null;
        C.sniffedTiles[key] = true;
        const hit = { cat: catId, kind: best.kind, tile: { x: best.x, y: best.y }, map: map, dist: bestD, item: best.item, flag: best.flag };
        C.lastSniff = hit;
        emit("cat:sniff", hit);
        return hit;
      }
      return null;
    }
    // BIGBOY: tells you what is likely to come out of the grass here.
    const def = MQ.World && MQ.World.get ? MQ.World.get(map) : null;
    const tables = def && def.encounters ? def.encounters : null;
    const tid = tables ? (tables.grass || tables.cave || tables.water) : null;
    const table = tid && MQ.Data && MQ.Data.encounters ? MQ.Data.encounters[tid] : null;
    if (!table) return null;
    const key2 = tileKey(map, Math.floor(x / 8), Math.floor(y / 8));
    if (C.sniffedTiles[key2]) return null;
    C.sniffedTiles[key2] = true;
    const rows = (table.table || []).slice(0, 4).map(function (r) { return { species: r.species, w: r.w }; });
    const hit2 = { cat: catId, kind: "creature", tile: { x: x, y: y }, map: map, table: tid, chances: rows };
    C.lastSniff = hit2;
    emit("cat:sniff", hit2);
    return hit2;
  };
  // Throttled overworld hook — call from the overworld each tile step.
  C.onTile = function (map, x, y) { return C.scan(map, x, y); };
  C.update = function () {
    const st = MQ.Overworld && MQ.Overworld.state;
    if (!st || !C.following) return null;
    const x = st.tileX === undefined ? Math.floor((st.px || 0) / (MQ.TILE || 32)) : st.tileX;
    const y = st.tileY === undefined ? Math.floor((st.py || 0) / (MQ.TILE || 32)) : st.tileY;
    if (C._lx === x && C._ly === y && C._lm === st.map) return null;
    C._lx = x; C._ly = y; C._lm = st.map;
    return C.scan(st.map, x, y);
  };
  // Tap the cat: it shows you what it found.
  C.reveal = function () {
    if (!C.lastSniff) return null;
    const s = C.lastSniff;
    emit("cat:reveal", s);
    if (s.kind === "creature") {
      const names = (s.chances || []).map(function (r) { return String(r.species).toUpperCase(); });
      toast("BIGBOY stares at the grass: " + (names.join(", ") || "nothing worth the effort") + ".");
    } else {
      toast(C.DEFS[s.cat].name + " paws at the ground — something is here.");
    }
    C.addTrust(s.cat, 1, "sniff");
    return s;
  };

  // ---- cat-only paths (`k` tiles, ability `squeeze`) ----------------
  C.canSqueeze = function () {
    if (!C.following) return false;
    const st = MQ.Overworld && MQ.Overworld.state;
    if (st && st.abilities && st.abilities.has) return st.abilities.has("squeeze");
    return C.unlocked();
  };
  // Send the cat through a gap. Resolves {ok, item, lever, battle}.
  C.sendThrough = function (target) {
    target = target || {};
    const catId = C.following;
    if (!C.canSqueeze()) return Promise.resolve({ ok: false, msg: "There is no cat to send." });
    const t = C.trust(catId);
    const out = { ok: true, cat: catId, item: null, lever: null, battle: null };
    if (target.battle) {
      const chance = U.clamp(0.45 + t * 0.1, 0, 0.95);
      const won = Math.random() < chance;
      out.battle = { won: won, chance: chance };
      if (!won) {
        emit("cat:path", out);
        toast(C.DEFS[catId].name + " comes back out backwards, at speed.");
        return Promise.resolve({ ok: false, cat: catId, battle: out.battle, msg: "It was bigger than it looked." });
      }
      C.addTrust(catId, 3, "cat_battle");
    }
    if (target.item && MQ.Inventory) { MQ.Inventory.add(target.item, target.n || 1); out.item = target.item; }
    if (target.flag) flagSet(target.flag, true);
    if (target.lever) { out.lever = target.lever; flagSet("lever_" + target.lever, true); }
    C.addTrust(catId, 1, "squeeze");
    emit("cat:path", out);
    toast(C.DEFS[catId].name + " comes back through the gap looking extremely pleased.");
    return Promise.resolve(out);
  };
  // T4: send the cat off to fish or gather on a real-time timer.
  C.dispatch = function (catId, job, minutes) {
    catId = catId || C.following;
    if (!C.canDispatch(catId)) return { ok: false, msg: C.DEFS[catId].name + " will not go off alone yet." };
    if (C.state[catId].dispatched) return { ok: false, msg: "Already out." };
    C.state[catId].dispatched = { job: job || "gather", until: Date.now() + (minutes || 10) * 60000 };
    if (C.following === catId) C.follow(catId === "meadow" ? "bigboy" : "meadow");
    emit("cat:dispatch", { cat: catId, job: job });
    return { ok: true, msg: C.DEFS[catId].name + " sets off, tail up." };
  };
  C.dispatchReady = function (catId) {
    const d = C.state[catId] && C.state[catId].dispatched;
    return !!d && Date.now() >= d.until;
  };
  C.collectDispatch = function (catId) {
    const d = C.state[catId] && C.state[catId].dispatched;
    if (!d) return null;
    if (Date.now() < d.until) return { ok: false, msg: "Still out.", minutes: Math.ceil((d.until - Date.now()) / 60000) };
    C.state[catId].dispatched = null;
    const pool = d.job === "fish" ? ["roe", "brine_sample", "salve"] : ["blackberry", "sloe", "apple", "catmint", "roasted_acorn"];
    const got = [];
    const n = 1 + Math.floor(C.trust(catId) / 2);
    for (let i = 0; i < n; i++) { const it = U.pick(pool); got.push(it); if (MQ.Inventory) MQ.Inventory.add(it, 1, { toast: false }); }
    C.addTrust(catId, 2, "dispatch");
    emit("cat:dispatch:done", { cat: catId, job: d.job, items: got });
    toast(C.DEFS[catId].name + " returns with " + got.length + " thing" + (got.length === 1 ? "" : "s") + ".");
    return { ok: true, items: got };
  };

  // ---- rest points --------------------------------------------------
  C.restPointAt = function (map) {
    for (let i = 0; i < C.REST_POINTS.length; i++) if (C.REST_POINTS[i].map === map) return C.REST_POINTS[i];
    return null;
  };
  C.rest = function (map) {
    const rp = C.restPointAt(map);
    if (!rp) return null;
    if (C.following !== rp.cat) return null;
    if (flagGet(rp.flag)) return null;
    flagSet(rp.flag, true);
    C.addTrust(rp.cat, 4, "rest");
    toast(rp.text);
    emit("cat:rest", { cat: rp.cat, map: map, flag: rp.flag });
    return rp;
  };
  C.restsFound = function () {
    let n = 0;
    for (let i = 0; i < C.REST_POINTS.length; i++) if (flagGet(C.REST_POINTS[i].flag)) n++;
    return n;
  };

  // ---- daily gifts (real clock) --------------------------------------
  C.today = function () {
    const r = MQ.Clock && MQ.Clock.real ? MQ.Clock.real : null;
    const d = r && r.date ? new Date(r.date) : new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  };
  C.GIFT_POOL = [
    { id: "blackberry", w: 20 }, { id: "sloe", w: 20 }, { id: "roe", w: 10 }, { id: "apple", w: 15 },
    { id: "catmint", w: 8 }, { id: "capsule_basic", w: 14 }, { id: "salve", w: 12 },
    { id: "capsule_mesh", w: 6, trust: 3 }, { id: "cream", w: 6 }, { id: "capsule_kernel", w: 3, trust: 5 }
  ];
  C.giftReady = function (id) { return C.unlocked() && C.state[id] && C.state[id].giftDay !== C.today(); };
  // Only when you actually talk to them. They are cats.
  C.collectGift = function (id) {
    if (!C.giftReady(id)) return null;
    const t = C.trust(id);
    const pool = C.GIFT_POOL.filter(function (g) { return !g.trust || t >= g.trust; });
    const rnd = U.rng(C.today() * 31 + (id === "meadow" ? 1 : 2));
    const g = U.weightedPick(pool, "w", rnd);
    C.state[id].giftDay = C.today();
    C.state[id].gifts++;
    if (MQ.Inventory) MQ.Inventory.add(g.id, 1, { toast: false });
    C.addTrust(id, 1, "gift");
    const line = id === "meadow"
      ? "MEADOW drops something at your feet and walks away before you can react."
      : "BIGBOY has brought you a thing. He sits on it first, to be sure.";
    toast(line + " (" + (MQ.Inventory ? MQ.Inventory.name(g.id) : g.id) + ")");
    emit("cat:gift", { cat: id, item: g.id });
    return g.id;
  };

  // ---- wiring --------------------------------------------------------
  E.on("battle:end", function (r) {
    if (!r || r.outcome !== "win") return;
    // Winning with a cat in the active slot builds trust.
    const used = r.participants || [];
    for (let i = 0; i < C.IDS.length; i++) {
      const d = C.DEFS[C.IDS[i]];
      let took = false;
      for (let j = 0; j < used.length; j++) if (used[j] && used[j].species === d.species) took = true;
      if (took) C.addTrust(d.id, 2, "battle");
    }
  });
  E.on("map:enter", function (d) { if (d && d.map) C.rest(d.map); });
  E.on("flag", function (d) {
    if (!d) return;
    for (let i = 0; i < C.COLLARS.length; i++) {
      const col = C.COLLARS[i];
      if (col.how === d.id && d.value && !C.collarsOwned[col.id]) C.unlockCollar(col.id);
    }
  });
  E.on("item:get", function (d) {
    if (!d || String(d.id).indexOf("cat_token_") !== 0) return;
    for (let i = 0; i < C.COLLARS.length; i++) if (C.COLLARS[i].how === d.id) C.unlockCollar(C.COLLARS[i].id);
  });
  E.on("newgame", function () { C.saveProvider.load(null); });

  C.saveKey = "cats";
  C.saveProvider = {
    save: function () {
      return { state: U.deepClone(C.state), following: C.following, collars: U.deepClone(C.collarsOwned), sniffed: U.deepClone(C.sniffedTiles) };
    },
    load: function (o) {
      C.state = {
        meadow: { points: 0, trust: 0, collar: "collar_plain", holding: null, dispatched: null, giftDay: 0, gifts: 0 },
        bigboy: { points: 0, trust: 0, collar: "collar_plain", holding: null, dispatched: null, giftDay: 0, gifts: 0 }
      };
      C.following = null;
      C.collarsOwned = { collar_plain: true };
      C.sniffedTiles = {};
      C.lastSniff = null;
      if (!o) return;
      if (o.state) { for (let i = 0; i < C.IDS.length; i++) if (o.state[C.IDS[i]]) C.state[C.IDS[i]] = U.merge(C.state[C.IDS[i]], o.state[C.IDS[i]]); }
      C.following = o.following || null;
      if (o.collars) C.collarsOwned = U.deepClone(o.collars);
      if (o.sniffed) C.sniffedTiles = U.deepClone(o.sniffed);
    }
  };
  if (MQ.Save && MQ.Save.register) MQ.Save.register("cats", C.saveProvider);

  MQ.Cats = C;
})();
