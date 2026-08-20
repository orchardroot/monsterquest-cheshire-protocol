// =============================================================
// MonsterQuest v2 — MQ.Party / MQ.Inventory / MQ.Trainer / MQ.Settings
// The game-state layer. Loads LAST in content/ (alphabetical), so it may
// read MQ.Progression at parse time but nothing else content-side.
// Every subsystem here registers its own save provider immediately, so
// headless tests work without MQ.Boot.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.Events;

  function emit(name, data) { try { E.emit(name, data); } catch (e) { MQ.warn("[content] listener threw on " + name, e); } }
  function flag(id, v) { if (MQ.Flags) MQ.Flags.set(id, v === undefined ? true : v); }
  function flagGet(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }
  function toast(text) { if (MQ.UI && MQ.UI.toast) MQ.UI.toast(text); }
  function provide(key, obj) { if (MQ.Save && MQ.Save.register && !(MQ.Save.providers && MQ.Save.providers[key])) MQ.Save.register(key, obj); }

  // =============================================================
  // MQ.Party
  // =============================================================
  const Party = MQ.Party || {};
  Party.MAX = 6;
  Party.BOX_PAGES = 16;
  Party.BOX_SIZE = 30;
  Party.CATS = ["meadow", "bigboy"];
  Party.list = [];
  Party.box = [];            // array of pages; page = array of monsters (sparse-safe)
  Party.boxNames = [];
  Party.lastBoxPage = 0;

  function freshBox() {
    Party.box = [];
    Party.boxNames = [];
    for (let i = 0; i < Party.BOX_PAGES; i++) { Party.box.push([]); Party.boxNames.push("Box " + (i + 1)); }
  }
  freshBox();

  Party.isCat = function (mon) { return !!mon && Party.CATS.indexOf(mon.species) >= 0; };

  // Build a monster instance. Defers to MQ.Data.makeMonster (data workstream)
  // and falls back to a well-formed instance so content works standalone.
  Party.make = function (speciesId, level, opts) {
    opts = opts || {};
    if (MQ.Data && MQ.Data.makeMonster) {
      const m = MQ.Data.makeMonster(speciesId, level, opts);
      if (m && !m.uid) m.uid = U.uid();
      return m;
    }
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[speciesId] : null;
    const lv = level || 5;
    const rnd = opts.rnd || Math.random;
    const ivs = opts.ivs || { hp: U.randInt(0, 15, rnd), atk: U.randInt(0, 15, rnd), def: U.randInt(0, 15, rnd), spa: U.randInt(0, 15, rnd), spd: U.randInt(0, 15, rnd), spe: U.randInt(0, 15, rnd) };
    const mon = {
      uid: U.uid(), species: speciesId, nickname: opts.nickname || "", level: lv,
      exp: MQ.Progression ? MQ.Progression.expForMonLevel(lv, (sp && sp.growth) || "medium") : lv * lv * lv,
      hp: 1, stats: null, ivs: ivs,
      temperament: opts.temperament || "even",
      ability: opts.ability || (sp && sp.abilities ? sp.abilities[0] : null),
      gear: opts.gear || null, friendship: opts.friendship === undefined ? 70 : opts.friendship,
      status: null, statusTurns: 0, moves: opts.moves || [], overdrive: 0,
      metAt: opts.metAt || { map: (MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state.map : "") || "", level: lv, ts: Date.now() },
      shiny: !!opts.shiny, ribbons: [], tagged: !!opts.tagged, gifted: !!opts.gifted
    };
    if (MQ.Progression) MQ.Progression.recalcStats(mon);
    else mon.stats = { hp: 20 + lv, atk: 10 + lv, def: 10 + lv, spa: 10 + lv, spd: 10 + lv, spe: 10 + lv };
    if (!mon.moves.length && sp && sp.learnset) {
      for (let i = 0; i < sp.learnset.length; i++) {
        const l = sp.learnset[i];
        if (l[0] <= lv) {
          const md = MQ.Data.moves ? MQ.Data.moves[l[1]] : null;
          const pp = md && md.pp ? md.pp : 20;
          mon.moves.push({ id: l[1], pp: pp, ppMax: pp });
          if (mon.moves.length > 4) mon.moves.shift();
        }
      }
    }
    mon.hp = opts.hp === undefined ? mon.stats.hp : opts.hp;
    return mon;
  };

  Party.count = function () { return Party.list.length; };
  Party.isFull = function () { return Party.list.length >= Party.MAX; };
  Party.first = function () { return Party.list[0] || null; };
  Party.at = function (i) { return Party.list[i] || null; };
  Party.indexOf = function (uid) {
    for (let i = 0; i < Party.list.length; i++) if (Party.list[i].uid === uid) return i;
    return -1;
  };
  Party.get = function (uid) {
    const i = Party.indexOf(uid);
    if (i >= 0) return Party.list[i];
    for (let p = 0; p < Party.box.length; p++) {
      const page = Party.box[p];
      for (let s = 0; s < page.length; s++) if (page[s] && page[s].uid === uid) return page[s];
    }
    return null;
  };
  Party.find = function (pred) {
    for (let i = 0; i < Party.list.length; i++) if (pred(Party.list[i], i)) return Party.list[i];
    return null;
  };
  Party.has = function (speciesId) {
    for (let i = 0; i < Party.list.length; i++) if (Party.list[i].species === speciesId) return true;
    return false;
  };
  Party.hasAnywhere = function (speciesId) {
    if (Party.has(speciesId)) return true;
    for (let p = 0; p < Party.box.length; p++) {
      const page = Party.box[p];
      for (let s = 0; s < page.length; s++) if (page[s] && page[s].species === speciesId) return true;
    }
    return false;
  };
  Party.alive = function () {
    const out = [];
    for (let i = 0; i < Party.list.length; i++) if (Party.list[i].hp > 0) out.push(Party.list[i]);
    return out;
  };
  Party.firstAlive = function () {
    for (let i = 0; i < Party.list.length; i++) if (Party.list[i].hp > 0) return Party.list[i];
    return null;
  };
  // Fighters = alive, not a cat you have benched.
  Party.active = function () {
    const out = [];
    for (let i = 0; i < Party.list.length; i++) {
      const m = Party.list[i];
      if (m.hp > 0 && !m.reserved) out.push(m);
    }
    return out;
  };
  Party.wiped = function () { return Party.active().length === 0; };

  // Cats are never boxed; benching one keeps it walking with you but out of the fight.
  Party.reserve = function (uid, on) {
    const m = Party.get(uid);
    if (!m) return false;
    if (!Party.isCat(m)) return false;
    m.reserved = on === undefined ? true : !!on;
    emit("party:reserve", { mon: m, reserved: m.reserved });
    return true;
  };
  Party.reserved = function (uid) { const m = Party.get(uid); return !!(m && m.reserved); };

  // add() puts it in the party if there is room, otherwise the first free box slot.
  Party.add = function (mon, opts) {
    if (!mon) return null;
    opts = opts || {};
    if (!mon.uid) mon.uid = U.uid();
    if (!Party.isFull() || (opts.force && Party.isCat(mon))) {
      Party.list.push(mon);
      emit("party:add", { mon: mon, where: "party" });
      return "party";
    }
    const spot = Party.addBox(mon);
    emit("party:add", { mon: mon, where: "box", page: spot ? spot.page : -1 });
    return "box";
  };
  Party.addBox = function (mon) {
    if (Party.isCat(mon)) return null;      // cats never go to the box
    for (let p = 0; p < Party.box.length; p++) {
      if (Party.box[p].length < Party.BOX_SIZE) {
        Party.box[p].push(mon);
        Party.lastBoxPage = p;
        return { page: p, slot: Party.box[p].length - 1 };
      }
    }
    return null;                            // every box full — caller should refuse the catch
  };
  Party.boxFull = function () {
    for (let p = 0; p < Party.box.length; p++) if (Party.box[p].length < Party.BOX_SIZE) return false;
    return true;
  };
  Party.boxCount = function () {
    let n = 0;
    for (let p = 0; p < Party.box.length; p++) n += Party.box[p].length;
    return n;
  };
  Party.total = function () { return Party.list.length + Party.boxCount(); };

  Party.remove = function (uid) {
    const i = Party.indexOf(uid);
    if (i < 0) return null;
    const m = Party.list[i];
    if (Party.isCat(m)) return null;        // MEADOW and BIGBOY stay
    Party.list.splice(i, 1);
    emit("party:remove", { mon: m });
    return m;
  };
  Party.release = function (uid) {
    let m = Party.remove(uid);
    if (!m) {
      for (let p = 0; p < Party.box.length && !m; p++) {
        for (let s = 0; s < Party.box[p].length; s++) {
          if (Party.box[p][s].uid === uid) { m = Party.box[p].splice(s, 1)[0]; break; }
        }
      }
    }
    if (m) { flag("released_any", true); emit("party:release", { mon: m }); }
    return m;
  };
  Party.swap = function (i, j) {
    if (i === j) return false;
    const a = Party.list[i], b = Party.list[j];
    if (!a || !b) return false;
    Party.list[i] = b; Party.list[j] = a;
    emit("party:order", { a: i, b: j });
    return true;
  };
  Party.deposit = function (uid) {
    const i = Party.indexOf(uid);
    if (i < 0) return false;
    const m = Party.list[i];
    if (Party.isCat(m)) return false;
    if (Party.list.length <= 1) return false;
    const spot = Party.addBox(m);
    if (!spot) return false;
    Party.list.splice(i, 1);
    emit("party:deposit", { mon: m, page: spot.page, slot: spot.slot });
    return true;
  };
  Party.withdraw = function (page, slot) {
    const pg = Party.box[page];
    if (!pg || !pg[slot]) return false;
    if (Party.isFull()) return false;
    const m = pg.splice(slot, 1)[0];
    Party.list.push(m);
    emit("party:withdraw", { mon: m });
    return true;
  };
  Party.boxPage = function (page) { return Party.box[page] || []; };
  Party.renameBox = function (page, name) { if (Party.boxNames[page] !== undefined) Party.boxNames[page] = String(name).slice(0, 12); };

  Party.heal = function (mon) {
    const targets = mon ? [mon] : Party.list;
    for (let i = 0; i < targets.length; i++) {
      const m = targets[i];
      if (!m) continue;
      if (!m.stats && MQ.Progression) MQ.Progression.recalcStats(m);
      m.hp = m.stats ? m.stats.hp : m.hp;
      m.status = null; m.statusTurns = 0;
      for (let j = 0; j < (m.moves || []).length; j++) m.moves[j].pp = m.moves[j].ppMax;
    }
    emit("party:heal", { mon: mon || null });
    return true;
  };
  Party.healAll = Party.heal;
  Party.damage = function (mon, n) {
    if (!mon) return 0;
    const before = mon.hp;
    mon.hp = U.clamp(mon.hp - n, 0, mon.stats ? mon.stats.hp : mon.hp);
    if (before > 0 && mon.hp === 0) emit("party:faint", { mon: mon });
    return before - mon.hp;
  };
  Party.restore = function (mon, n) {
    if (!mon || !mon.stats) return 0;
    const before = mon.hp;
    mon.hp = U.clamp(mon.hp + n, 0, mon.stats.hp);
    return mon.hp - before;
  };
  Party.nickname = function (uid, name) {
    const m = Party.get(uid);
    if (!m) return false;
    m.nickname = String(name || "").slice(0, 12);
    return true;
  };
  Party.giveGear = function (uid, itemId) {
    const m = Party.get(uid);
    if (!m) return null;
    const old = m.gear;
    if (old && MQ.Inventory) MQ.Inventory.add(old, 1, { silent: true });
    m.gear = itemId;
    emit("party:gear", { mon: m, item: itemId, returned: old });
    return old;
  };
  Party.takeGear = function (uid) { return Party.giveGear(uid, null); };
  Party.displayName = function (mon) {
    if (!mon) return "";
    if (mon.nickname) return mon.nickname;
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[mon.species] : null;
    return (sp && sp.name) || String(mon.species || "").toUpperCase();
  };
  Party.hpRatio = function (mon) { return mon && mon.stats && mon.stats.hp ? mon.hp / mon.stats.hp : 0; };

  Party.saveKey = "party";
  Party.saveProvider = {
    save: function () {
      return { list: U.deepClone(Party.list), box: U.deepClone(Party.box), boxNames: Party.boxNames.slice(), page: Party.lastBoxPage };
    },
    load: function (o) {
      Party.list = [];
      freshBox();
      if (!o) return;
      if (o.list) Party.list = U.deepClone(o.list);
      if (o.box) for (let i = 0; i < o.box.length && i < Party.BOX_PAGES; i++) Party.box[i] = U.deepClone(o.box[i]) || [];
      if (o.boxNames) for (let i = 0; i < o.boxNames.length && i < Party.BOX_PAGES; i++) Party.boxNames[i] = o.boxNames[i];
      Party.lastBoxPage = o.page || 0;
    }
  };
  provide("party", Party.saveProvider);
  MQ.Party = Party;

  // =============================================================
  // MQ.Inventory
  // =============================================================
  const Inv = MQ.Inventory || {};

  // Pocket per item.kind (ROSTER §4 kinds).
  Inv.POCKETS = ["medicine", "capsules", "battle", "gear", "cards", "ingredients", "key"];
  Inv.POCKET_NAMES = { medicine: "Medicine", capsules: "Capsules", battle: "Battle", gear: "Gear", cards: "Skill Cards", ingredients: "Larder", key: "Key Items" };
  Inv.KIND_POCKET = {
    heal: "medicine", cure: "medicine",
    capsule: "capsules",
    consumable: "battle",
    gear: "gear", held_consumable: "gear", evo: "gear", rod: "gear",
    tm: "cards",
    ingredient: "ingredients", brew: "ingredients",
    key: "key"
  };

  // Minimal private fallback so the bag works before js/data/items.js lands.
  // Anything the data workstream defines wins; this is never registered.
  const FALLBACK = {
    salve: { name: "Salve", kind: "heal", price: 200, amount: 20 },
    tonic: { name: "Tonic", kind: "heal", price: 600, amount: 60 },
    elixir: { name: "Elixir", kind: "heal", price: 1500, amount: 120 },
    full_restore: { name: "Full Restore", kind: "heal", price: 3000, amount: 9999, cures: ["psn", "tox", "par", "brn", "slp", "frz", "cnf"] },
    revive_salts: { name: "Revive Salts", kind: "heal", price: 1200, revive: 0.5 },
    antidote: { name: "Antidote", kind: "cure", price: 100, cures: ["psn", "tox"] },
    burn_balm: { name: "Burn Balm", kind: "cure", price: 150, cures: ["brn"] },
    nerve_tonic: { name: "Nerve Tonic", kind: "cure", price: 150, cures: ["par"] },
    smelling_salts: { name: "Smelling Salts", kind: "cure", price: 150, cures: ["slp"] },
    thaw_flask: { name: "Thaw Flask", kind: "cure", price: 150, cures: ["frz"] },
    calm_drops: { name: "Calm Drops", kind: "cure", price: 150, cures: ["cnf"] },
    panacea: { name: "Panacea", kind: "cure", price: 500, cures: ["psn", "tox", "par", "brn", "slp", "frz", "cnf"] },
    capsule_basic: { name: "Capsule", kind: "capsule", price: 200, catchBonus: 1 },
    capsule_mesh: { name: "Mesh Capsule", kind: "capsule", price: 600, catchBonus: 1.5 },
    capsule_kernel: { name: "Kernel Capsule", kind: "capsule", price: 1200, catchBonus: 2 },
    capsule_root: { name: "Root Capsule", kind: "capsule", price: 0, catchBonus: 255 },
    silk_cocoon: { name: "Silk Cocoon", kind: "evo", price: 0 },
    salt_crystal: { name: "Salt Crystal", kind: "evo", price: 900 },
    copper_wire: { name: "Copper Wire", kind: "evo", price: 0 },
    cipher_chip: { name: "Cipher Chip", kind: "evo", price: 0 },
    elm_sap_vial: { name: "Elm Sap Vial", kind: "evo", price: 0 },
    billhook_charm: { name: "Billhook Charm", kind: "evo", price: 0 },
    rod_bamboo: { name: "Bamboo Rod", kind: "rod", price: 500, rodTier: 1 },
    rod_weighted: { name: "Weighted Line", kind: "rod", price: 0, rodTier: 2 },
    rod_carbon: { name: "Carbon Rod", kind: "rod", price: 4000, rodTier: 3 },
    rod_elm: { name: "Elm-handled Rod", kind: "rod", price: 0, rodTier: 4 },
    repel_spray: { name: "Repel Spray", kind: "consumable", price: 400, repel: 200 },
    lure_tin: { name: "Lure Tin", kind: "consumable", price: 400, lure: 200 },
    brew_perry: { name: "Perry", kind: "brew", price: 0, partyHeal: true, overdriveStart: 25 },
    brew_clarifier: { name: "Clarifier", kind: "brew", price: 0, partyCure: true },
    brew_hedgerow_cordial: { name: "Hedgerow Cordial", kind: "brew", price: 0, buff: { key: "catchMult", value: 1.3, minutes: 10 } },
    brew_damson_fire: { name: "Damson Fire", kind: "brew", price: 0, buff: { key: "fireMult", value: 1.2, battles: 1 } },
    brew_salt_mead: { name: "Salt Mead", kind: "brew", price: 0, buff: { key: "rockGroundTakenMult", value: 0.75, battles: 1 } },
    brew_elm_stout: { name: "Elm Stout", kind: "brew", price: 0, buff: { key: "defOpenerStages", value: 1, battles: 1 } },
    brew_bait_tin: { name: "Bait Tin", kind: "brew", price: 0, trinket: true, buff: { key: "fishRareWindow", value: 1.4, minutes: 30 } },
    brew_cats_cup: { name: "Cat's Cup", kind: "brew", price: 0, catTrust: 1 },
    brew_mamgu_cask: { name: "Mam-gu's Cask", kind: "brew", price: 0, perkPoint: 1 },
    casebook: { name: "Casebook", kind: "key", price: 0 },
    camera: { name: "Camera", kind: "key", price: 0 },
    field_notebook: { name: "Field Notebook", kind: "key", price: 0, trinket: true },
    ghost_lens: { name: "Ghost Lens", kind: "key", price: 0, trinket: true },
    rain_cloak: { name: "Rain Cloak", kind: "key", price: 0, trinket: true },
    sprint_soles: { name: "Sprint Soles", kind: "key", price: 0, trinket: true },
    wool_cap: { name: "Wool Cap", kind: "key", price: 0, trinket: true },
    davy_lamp: { name: "Davy Lamp", kind: "key", price: 0, trinket: true },
    bait_tin: { name: "Bait Tin", kind: "key", price: 0, trinket: true }
  };
  // Ability granted by a key item, so pickups can unlock traversal (DESIGN-INDEX §3).
  Inv.ITEM_ABILITY = {
    middlewood_bike: "bike", davy_lamp: "lamp", billhook: "billhook", narrowboat_licence: "boat",
    lift_pass: "lift", waders: "waders", gritstone_grips: "climb", proxy_goggles: "goggles", railcard: "railcard"
  };

  function brewEffectToFlat(e) {
    if (e.kind === "partyHeal") return { partyHeal: true, overdriveStart: e.overdriveStart };
    if (e.kind === "partyCure") return { partyCure: true };
    if (e.kind === "catTrust") return { catTrust: e.delta || 1 };
    if (e.kind === "perkPoint") return { perkPoint: e.n || 1 };
    if (e.kind === "fishing") return { trinket: true, buff: { key: "fishRareWindow", value: e.rareZone } };
    if (e.kind === "prebattle") {
      if (e.typeBoost) return { buff: { key: e.typeBoost + "Mult", value: e.mult, battles: e.battles || 1 } };
      if (e.damageTaken) {
        const types = e.damageTaken.types || [];
        const key = types.length ? types[0] + types.slice(1).map(U.capitalise).join("") + "TakenMult" : "takenMult";
        return { buff: { key: key, value: e.damageTaken.mult, battles: e.battles || 1 } };
      }
      if (e.stage) return { buff: { key: e.stage.stat + "OpenerStages", value: e.stage.delta, battles: e.battles || 1 } };
      return {};
    }
    if (e.kind === "timed") {
      const keys = Object.keys(e).filter(function (k) { return k !== "kind" && k !== "realMinutes"; });
      const k = keys[0];
      return k ? { buff: { key: k, value: e[k], minutes: e.realMinutes } } : {};
    }
    return {};
  }

  Inv.def = function (id) {
    const d = MQ.Data && MQ.Data.items ? MQ.Data.items[id] : null;
    if (d) {
      // data/items.js brews describe their effect under `brewEffect` (kind +
      // params, e.g. {kind:'timed', catchMult:1.3, realMinutes:10}); the
      // dispatch below reads the flatter shape (partyHeal/partyCure/buff)
      // this workstream's own fallback table already used, so translate.
      if (d.kind === "brew" && d.brewEffect && !d.buff && !d.partyHeal && !d.partyCure) {
        return U.merge(d, brewEffectToFlat(d.brewEffect));
      }
      return d;
    }
    const f = FALLBACK[id];
    if (f) { f.id = id; return f; }
    return { id: id, name: U.capitalise(String(id).replace(/_/g, " ")), kind: "consumable", price: 0, __unknown: true };
  };
  Inv.name = function (id) { return Inv.def(id).name; };
  Inv.pocketOf = function (id) { const k = Inv.def(id).kind; return Inv.KIND_POCKET[k] || "battle"; };
  Inv.isKey = function (id) { return Inv.def(id).kind === "key"; };

  Inv.items = {};        // id → count
  Inv.money = 0;         // credits
  Inv.marks = 0;         // Casebook Marks
  Inv.chips = 0;         // Arena Chips
  Inv.rod = null;        // equipped rod item id
  Inv.repel = 0;         // steps of repel remaining
  Inv.lure = 0;          // steps of lure remaining
  Inv.buffs = {};        // key → {value, until (real ms) | battles}
  Inv.order = [];        // insertion order, for a stable bag

  Inv.count = function (id) {
    if (Inv.items[id]) return Inv.items[id];
    // Fall back to the `item_<id>` counter MQ.Script writes when the bag is
    // not up yet, so `item.<id>` conditions read the same either way.
    const f = flagGet("item_" + id);
    return typeof f === "number" ? f : 0;
  };
  Inv.has = function (id, n) { return Inv.count(id) >= (n || 1); };
  Inv.add = function (id, n, opts) {
    n = n === undefined ? 1 : n;
    if (n <= 0) return 0;
    opts = opts || {};
    const def = Inv.def(id);
    if (def.kind === "key" && Inv.count(id) >= 1) n = 0;
    if (n > 0) {
      if (!Inv.items[id]) Inv.order.push(id);
      Inv.items[id] = Math.min(999, (Inv.items[id] || 0) + n);
    }
    if (def.kind === "rod") Inv.equipRod(id);
    if (Inv.ITEM_ABILITY[id] && MQ.Overworld && MQ.Overworld.state && MQ.Overworld.state.abilities) {
      try { MQ.Overworld.state.abilities.add(Inv.ITEM_ABILITY[id]); } catch (e) { /* ignore */ }
    }
    if (!opts.silent) {
      emit("item:get", { id: id, n: n, count: Inv.items[id] || 0 });
      if (opts.toast !== false && n > 0 && MQ.UI && MQ.UI.toast) toast(def.name + (n > 1 ? " ×" + n : ""));
    }
    return n;
  };
  Inv.remove = function (id, n) {
    n = n === undefined ? 1 : n;
    const have = Inv.count(id);
    if (have < n) return false;
    if (have === n) { delete Inv.items[id]; U.remove(Inv.order, id); }
    else Inv.items[id] = have - n;
    emit("item:lose", { id: id, n: n, count: Inv.count(id) });
    return true;
  };
  Inv.clear = function () { Inv.items = {}; Inv.order = []; };
  Inv.pocket = function (name) {
    const out = [];
    for (let i = 0; i < Inv.order.length; i++) {
      const id = Inv.order[i];
      if (!Inv.items[id]) continue;
      if (Inv.pocketOf(id) !== name) continue;
      out.push({ id: id, n: Inv.items[id], item: Inv.def(id) });
    }
    out.sort(function (a, b) { return a.item.name < b.item.name ? -1 : a.item.name > b.item.name ? 1 : 0; });
    return out;
  };
  Inv.pocketCount = function (name) { return Inv.pocket(name).length; };
  Inv.all = function () {
    const out = [];
    for (let i = 0; i < Inv.order.length; i++) if (Inv.items[Inv.order[i]]) out.push({ id: Inv.order[i], n: Inv.items[Inv.order[i]], item: Inv.def(Inv.order[i]) });
    return out;
  };
  Inv.keyItems = function () { return Inv.pocket("key"); };

  // ---- money & alternative currencies -----------------------------
  Inv.addMoney = function (n, opts) {
    opts = opts || {};
    let amount = Math.floor(n);
    if (amount > 0 && opts.prize !== false && MQ.Progression) amount = Math.floor(amount * MQ.Progression.moneyMult());
    Inv.money = U.clamp(Inv.money + amount, 0, 9999999);
    emit("money", { delta: amount, money: Inv.money });
    if (amount > 0 && MQ.Trainer) MQ.Trainer.bump("moneyEarned", amount);
    return amount;
  };
  Inv.spend = function (n) {
    if (Inv.money < n) return false;
    Inv.money -= n;
    emit("money", { delta: -n, money: Inv.money });
    if (MQ.Trainer) MQ.Trainer.bump("moneySpent", n);
    return true;
  };
  Inv.addMarks = function (n) { Inv.marks = Math.max(0, Inv.marks + n); emit("marks", { delta: n, marks: Inv.marks }); return Inv.marks; };
  Inv.spendMarks = function (n) { if (Inv.marks < n) return false; Inv.marks -= n; emit("marks", { delta: -n, marks: Inv.marks }); return true; };
  Inv.addChips = function (n) { Inv.chips = Math.max(0, Inv.chips + n); emit("chips", { delta: n, chips: Inv.chips }); return Inv.chips; };
  Inv.spendChips = function (n) { if (Inv.chips < n) return false; Inv.chips -= n; emit("chips", { delta: -n, chips: Inv.chips }); return true; };

  Inv.price = function (id) {
    const p = Inv.def(id).price || 0;
    return Math.max(0, Math.round(p * (MQ.Progression ? MQ.Progression.shopPriceMult() : 1)));
  };
  Inv.sellPrice = function (id) {
    const d = Inv.def(id);
    if (d.sellable === false || d.kind === "key") return 0;
    return Math.floor((d.price || 0) / 2);
  };
  Inv.buy = function (id, n) {
    n = n || 1;
    const cost = Inv.price(id) * n;
    if (!cost && Inv.def(id).price === 0) return false;
    if (!Inv.spend(cost)) return false;
    Inv.add(id, n, { toast: false });
    return true;
  };
  Inv.sell = function (id, n) {
    n = n || 1;
    const unit = Inv.sellPrice(id);
    if (!unit || !Inv.remove(id, n)) return false;
    Inv.addMoney(unit * n, { prize: false });
    return true;
  };

  Inv.equipRod = function (id) {
    const tier = Inv.def(id).rodTier || 0;
    const cur = Inv.rod ? (Inv.def(Inv.rod).rodTier || 0) : 0;
    if (tier >= cur) { Inv.rod = id; flag("fish_rod_tier", tier); }
    return Inv.rod;
  };
  Inv.rodTier = function () { return Inv.rod ? (Inv.def(Inv.rod).rodTier || 0) : 0; };

  // ---- temporary buffs (brews, lures) ------------------------------
  Inv.applyBuff = function (key, value, opts) {
    opts = opts || {};
    const b = { key: key, value: value };
    if (opts.minutes) b.until = Date.now() + opts.minutes * 60000;
    if (opts.battles) b.battles = opts.battles;
    Inv.buffs[key] = b;
    emit("buff", b);
    return b;
  };
  Inv.buff = function (key, base) {
    const b = Inv.buffs[key];
    if (!b) return base === undefined ? 1 : base;
    if (b.until && Date.now() > b.until) { delete Inv.buffs[key]; return base === undefined ? 1 : base; }
    return b.value;
  };
  Inv.expireBattleBuffs = function () {
    const ks = Object.keys(Inv.buffs);
    for (let i = 0; i < ks.length; i++) {
      const b = Inv.buffs[ks[i]];
      if (b.battles) { b.battles--; if (b.battles <= 0) delete Inv.buffs[ks[i]]; }
    }
  };
  Inv.stepBuffs = function (n) {
    n = n || 1;
    if (Inv.repel > 0) { Inv.repel = Math.max(0, Inv.repel - n); if (!Inv.repel) toast("The repel wore off."); }
    if (Inv.lure > 0) { Inv.lure = Math.max(0, Inv.lure - n); if (!Inv.lure) toast("The lure went stale."); }
  };

  // ---- use(item, target) — field effect dispatch --------------------
  // Returns {ok, msg, consumed}. Never throws; degrades when battle/UI absent.
  Inv.use = function (id, target, opts) {
    opts = opts || {};
    const res = { ok: false, msg: "", consumed: false, id: id };
    if (!Inv.has(id) && !opts.free) { res.msg = "You have none left."; return res; }
    const d = Inv.def(id);
    const inBattle = !!opts.battle;
    const kind = d.kind;

    function done(msg, consume) {
      res.ok = true; res.msg = msg;
      if (consume !== false && kind !== "key" && kind !== "gear" && kind !== "rod" && !opts.free) { Inv.remove(id, 1); res.consumed = true; }
      if (MQ.Trainer) MQ.Trainer.bump("itemsUsed", 1);
      emit("item:use", { id: id, target: target, result: res, battle: inBattle });
      return res;
    }
    function fail(msg) { res.msg = msg; return res; }

    if (kind === "capsule") {
      if (!inBattle) return fail("Save it for something wild.");
      return done("Threw the " + d.name + ".");
    }
    if (kind === "tm") {
      const move = d.teaches || String(id).replace(/^tm_/, "");
      if (!target) return fail("Pick a monster to teach.");
      emit("skillcard", { id: id, move: move, mon: target });
      if (target.moves && target.moves.length < 4) {
        const md = MQ.Data && MQ.Data.moves ? MQ.Data.moves[move] : null;
        const pp = md && md.pp ? md.pp : 15;
        target.moves.push({ id: move, pp: pp, ppMax: pp });
        return done(Party.displayName(target) + " learned " + ((md && md.name) || move) + "!");
      }
      return done(Party.displayName(target) + " studied the card.");
    }
    if (kind === "rod") { Inv.equipRod(id); return done("Equipped the " + d.name + ".", false); }
    if (kind === "gear" || kind === "held_consumable") {
      if (!target) return fail("Pick a monster to hold it.");
      Inv.remove(id, 1);
      Party.giveGear(target.uid, id);
      res.ok = true; res.consumed = true; res.msg = Party.displayName(target) + " is holding the " + d.name + ".";
      return res;
    }
    if (kind === "evo") {
      if (!target) return fail("Pick a monster.");
      const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[target.species] : null;
      let evo = null;
      if (sp && sp.evolutions) for (let i = 0; i < sp.evolutions.length; i++) if (sp.evolutions[i].method === "item" && sp.evolutions[i].item === id) evo = sp.evolutions[i];
      if (!evo) return fail("Nothing happened.");
      emit("evolve", { mon: target, to: evo.to, method: "item", item: id });
      return done(Party.displayName(target) + " is changing!");
    }
    if (kind === "key") {
      if (Inv.ITEM_ABILITY[id]) return done("You have the knack for it now.", false);
      emit("keyitem:use", { id: id, target: target });
      return done("You take a good look at the " + d.name + ".", false);
    }
    if (kind === "ingredient") return fail("Better brewed than eaten.");

    // heal / cure / brew / consumable
    if (d.revive) {
      if (!target) return fail("Pick a monster.");
      if (target.hp > 0) return fail(Party.displayName(target) + " is still standing.");
      if (!target.stats && MQ.Progression) MQ.Progression.recalcStats(target);
      target.hp = Math.max(1, Math.floor(target.stats.hp * d.revive));
      target.status = null; target.statusTurns = 0;
      target.friendship = U.clamp((target.friendship || 0) - 10, 0, 255);
      emit("party:revive", { mon: target });
      return done(Party.displayName(target) + " came round.");
    }
    if (d.partyHeal || d.partyCure || d.catTrust !== undefined || d.perkPoint) {
      if (d.partyHeal) Party.heal();
      if (d.partyCure) for (let i = 0; i < Party.list.length; i++) { Party.list[i].status = null; Party.list[i].statusTurns = 0; }
      if (d.overdriveStart) emit("overdrive:seed", { amount: d.overdriveStart });
      if (d.catTrust && MQ.Cats && MQ.Cats.feed) MQ.Cats.feed(opts.cat || (MQ.Cats.following || "meadow"), id);
      if (d.perkPoint && MQ.Trainer) MQ.Trainer.grantPerkPoints(d.perkPoint, "brew");
      if (d.buff) Inv.applyBuff(d.buff.key, d.buff.value, d.buff);
      return done("You share out the " + d.name + ".");
    }
    if (d.buff) { Inv.applyBuff(d.buff.key, d.buff.value, d.buff); return done(d.name + " — that should hold for a while."); }
    if (d.repel) { Inv.repel = Math.max(Inv.repel, d.repel); return done("Wild things will keep their distance."); }
    if (d.lure) { Inv.lure = Math.max(Inv.lure, d.lure); return done("Something in the air draws them in."); }

    const amount = d.amount || 0;
    const cures = d.cures || [];
    if (amount || cures.length) {
      if (!target) return fail("Pick a monster.");
      if (target.hp <= 0) return fail(Party.displayName(target) + " cannot take it.");
      let healed = 0;
      if (amount) {
        const mult = MQ.Progression ? MQ.Progression.bagHealMult() : 1;
        healed = Party.restore(target, Math.floor(amount * mult));
        if (!healed && !cures.length) return fail(Party.displayName(target) + " is already in fine fettle.");
      }
      let cured = false;
      if (cures.length && target.status && cures.indexOf(target.status) >= 0) { target.status = null; target.statusTurns = 0; cured = true; }
      if (!healed && !cured) return fail("It would do nothing right now.");
      const bits = [];
      if (healed) bits.push("recovered " + healed + " HP");
      if (cured) bits.push("shook it off");
      return done(Party.displayName(target) + " " + bits.join(" and ") + ".");
    }
    if (d.weather) { emit("battle:setWeather", { weather: d.weather, turns: 5 }); return done("The sky obliges."); }
    if (d.flee) { emit("battle:flee", { forced: true }); return done("A racket like that clears a field."); }
    return fail("Nothing happened.");
  };
  Inv.usableInField = function (id) {
    const d = Inv.def(id);
    if (d.usableInField !== undefined) return !!d.usableInField;
    return d.kind !== "capsule" && d.kind !== "ingredient";
  };
  Inv.usableInBattle = function (id) {
    const d = Inv.def(id);
    if (d.usableInBattle !== undefined) return !!d.usableInBattle;
    return d.kind === "heal" || d.kind === "cure" || d.kind === "capsule" || d.kind === "consumable" || id === "brew_perry" || id === "brew_clarifier";
  };

  Inv.saveKey = "inventory";
  Inv.saveProvider = {
    save: function () {
      return { items: U.deepClone(Inv.items), order: Inv.order.slice(), money: Inv.money, marks: Inv.marks, chips: Inv.chips, rod: Inv.rod, repel: Inv.repel, lure: Inv.lure, buffs: U.deepClone(Inv.buffs) };
    },
    load: function (o) {
      Inv.items = {}; Inv.order = []; Inv.money = 0; Inv.marks = 0; Inv.chips = 0;
      Inv.rod = null; Inv.repel = 0; Inv.lure = 0; Inv.buffs = {};
      if (!o) return;
      Inv.items = U.deepClone(o.items) || {};
      Inv.order = (o.order || Object.keys(Inv.items)).slice();
      const ks = Object.keys(Inv.items);
      for (let i = 0; i < ks.length; i++) if (Inv.order.indexOf(ks[i]) < 0) Inv.order.push(ks[i]);
      Inv.money = o.money || 0; Inv.marks = o.marks || 0; Inv.chips = o.chips || 0;
      Inv.rod = o.rod || null; Inv.repel = o.repel || 0; Inv.lure = o.lure || 0;
      Inv.buffs = U.deepClone(o.buffs) || {};
    }
  };
  provide("inventory", Inv.saveProvider);
  MQ.Inventory = Inv;

  // =============================================================
  // MQ.Trainer
  // =============================================================
  const Tr = MQ.Trainer || {};
  Tr.id = "player";
  Tr.name = "JIM";
  Tr.level = 1;
  Tr.xp = 0;
  Tr.perkPoints = 1;
  Tr.perks = new Set();
  Tr.perkRanks = {};
  Tr.bonusPoints = 0;      // the 5 that come from Marks/quests
  Tr.trinkets = [null, null];
  Tr.badges = new Set();
  Tr.titles = new Set();
  Tr.playtime = 0;
  Tr.startedAt = Date.now();
  Tr.dex = {};
  Tr.STATS = ["steps", "stepsRain", "stepsRun", "battles", "wins", "losses", "runs", "catches", "faints", "knockouts",
    "overdrives", "photos", "brews", "bounties", "warrants", "casesClosed", "fish", "itemsUsed",
    "moneyEarned", "moneySpent", "healsLido", "puppetsBeaten", "amosExposed", "luresRefused", "brinkSaves", "gymsBeaten", "arenaClears"];
  Tr.stats = {};
  function zeroStats() { Tr.stats = {}; for (let i = 0; i < Tr.STATS.length; i++) Tr.stats[Tr.STATS[i]] = 0; }
  zeroStats();

  // Counters that mirror into MQ.Flags so condition expressions can read them.
  const STAT_FLAG = {
    steps: "steps_total", stepsRain: "steps_rain", puppetsBeaten: "count_puppets_beaten",
    amosExposed: "count_amos_exposed", luresRefused: "count_lures_refused", brinkSaves: "count_brink_saves",
    overdrives: "count_overdrives", healsLido: "count_lido_heals", bounties: "count_bounties",
    warrants: "count_warrants", photos: "count_photos"
  };

  Tr.bump = function (stat, n) {
    n = n === undefined ? 1 : n;
    if (Tr.stats[stat] === undefined) Tr.stats[stat] = 0;
    Tr.stats[stat] += n;
    if (STAT_FLAG[stat] && MQ.Flags) MQ.Flags.set(STAT_FLAG[stat], Tr.stats[stat]);
    emit("trainer:stat", { stat: stat, delta: n, value: Tr.stats[stat] });
    return Tr.stats[stat];
  };
  Tr.stat = function (s) { return Tr.stats[s] || 0; };

  Tr.xpToNext = function () { return MQ.Progression ? MQ.Progression.xpForLevel(Tr.level) : 100; };
  Tr.xpRatio = function () { const need = Tr.xpToNext(); return need === Infinity ? 1 : U.clamp(Tr.xp / need, 0, 1); };
  Tr.addXp = function (n, reason) {
    if (!n || Tr.level >= (MQ.Progression ? MQ.Progression.MAX_LEVEL : 50)) return 0;
    Tr.xp += n;
    let gained = 0;
    while (Tr.level < MQ.Progression.MAX_LEVEL && Tr.xp >= MQ.Progression.xpForLevel(Tr.level)) {
      Tr.xp -= MQ.Progression.xpForLevel(Tr.level);
      Tr.level++;
      gained++;
      Tr.perkPoints++;
      emit("trainer:level", { level: Tr.level, reason: reason });
    }
    if (gained) {
      toast("Trainer Level " + Tr.level + " — " + gained + " perk point" + (gained > 1 ? "s" : "") + ".");
      if (Tr.level === 20 || Tr.level === 35) toast("Trinket slot unlocked.");
      MQ.Progression.invalidate();
    }
    emit("trainer:xp", { xp: n, reason: reason, level: Tr.level });
    return n;
  };
  Tr.grantPerkPoints = function (n, reason) {
    n = n || 1;
    Tr.perkPoints += n;
    Tr.bonusPoints += n;
    emit("trainer:perkpoints", { delta: n, reason: reason, points: Tr.perkPoints });
    toast(n + " perk point" + (n > 1 ? "s" : "") + " earned.");
    return Tr.perkPoints;
  };

  // ---- perks --------------------------------------------------------
  Tr.perkTree = MQ.Progression ? MQ.Progression.tree : [];
  Tr.hasPerk = function (id, rank) { return MQ.Progression.has(id, rank); };
  Tr.perkRank = function (id) { return Tr.perkRanks[id] | 0; };
  Tr.canBuyPerk = function (id) { return MQ.Progression.canBuy(id); };
  Tr.buyPerk = function (id) {
    const reason = MQ.Progression.blockedReason(id);
    if (reason) return { ok: false, msg: reason };
    const node = MQ.Progression.node(id);
    Tr.perkPoints -= node.cost;
    Tr.perkRanks[id] = (Tr.perkRanks[id] | 0) + 1;
    Tr.perks.add(id);
    MQ.Progression.invalidate();
    const r = node.ranks[Tr.perkRanks[id] - 1];
    emit("trainer:perks", { id: id, rank: Tr.perkRanks[id] });
    toast(r.name + " taken.");
    return { ok: true, node: node, rank: Tr.perkRanks[id], msg: r.name + ": " + r.desc };
  };
  Tr.perkList = function () {
    const out = [];
    const ids = Object.keys(Tr.perkRanks);
    for (let i = 0; i < ids.length; i++) out.push({ id: ids[i], rank: Tr.perkRanks[ids[i]], node: MQ.Progression.node(ids[i]) });
    return out;
  };
  // Full respec, paid in Casebook Marks. `free` is used by the Y Berllan choice.
  Tr.respec = function (opts) {
    opts = opts || {};
    const cost = MQ.Progression.respecCost();
    if (!opts.free && !Inv.spendMarks(cost)) return { ok: false, msg: "That costs " + cost + " Marks." };
    const spent = MQ.Progression.spentTotal();
    Tr.perkRanks = {};
    Tr.perks = new Set();
    Tr.perkPoints += spent;
    MQ.Progression.invalidate();
    emit("trainer:perks", { respec: true, refunded: spent });
    toast("Perks wiped. " + spent + " point" + (spent === 1 ? "" : "s") + " back.");
    return { ok: true, refunded: spent, cost: opts.free ? 0 : cost };
  };
  // The Y Berllan Wipe/Feed choice re-specs only the three agent nodes, free.
  Tr.respecAgentNodes = function () {
    let refunded = 0;
    for (let i = 0; i < MQ.Progression.BRANCHES.length; i++) {
      const node = MQ.Progression.agentNode(MQ.Progression.BRANCHES[i]);
      if (node && Tr.perkRanks[node.id]) {
        refunded += Tr.perkRanks[node.id];
        delete Tr.perkRanks[node.id];
        Tr.perks.delete(node.id);
      }
    }
    Tr.perkPoints += refunded;
    MQ.Progression.invalidate();
    emit("trainer:perks", { respec: "agents", refunded: refunded });
    return refunded;
  };

  // ---- trinkets ------------------------------------------------------
  Tr.trinketSlots = function () { return MQ.Progression.trinketSlots(); };
  Tr.equipTrinket = function (id, slot) {
    slot = slot || 0;
    if (slot >= Tr.trinketSlots()) return { ok: false, msg: "That slot is not open yet." };
    const d = Inv.def(id);
    if (!d.trinket) return { ok: false, msg: "That is not a trinket." };
    if (!Inv.has(id)) return { ok: false, msg: "You do not have it." };
    const old = Tr.trinkets[slot];
    Tr.trinkets[slot] = id;
    if (old === id) return { ok: true, msg: "Already worn." };
    for (let i = 0; i < Tr.trinkets.length; i++) if (i !== slot && Tr.trinkets[i] === id) Tr.trinkets[i] = null;
    emit("trainer:trinkets", { slot: slot, id: id, old: old });
    return { ok: true, old: old, msg: d.name + " on." };
  };
  Tr.unequipTrinket = function (slot) {
    const old = Tr.trinkets[slot];
    Tr.trinkets[slot] = null;
    emit("trainer:trinkets", { slot: slot, id: null, old: old });
    return old;
  };
  Tr.wearing = function (id) { return Tr.trinkets.indexOf(id) >= 0; };

  // ---- badges --------------------------------------------------------
  Tr.BADGES = ["packet", "cipher", "bear", "kernel", "token", "daemon", "proxy", "admin"];
  Tr.addBadge = function (id) {
    id = String(id).replace(/^badge_/, "");
    if (Tr.badges.has(id)) return false;
    Tr.badges.add(id);
    flag("badge_" + id, true);
    Tr.bump("gymsBeaten", 1);
    if (MQ.Progression) MQ.Progression.award("gym");
    if (Tr.badges.size >= 8) flag("all_badges", true);
    emit("trainer:badge", { id: id, count: Tr.badges.size });
    toast("Badge earned: " + id.toUpperCase() + ".");
    return true;
  };
  Tr.hasBadge = function (id) { return Tr.badges.has(String(id).replace(/^badge_/, "")); };
  Tr.badgeCount = function () { return Tr.badges.size; };
  // After `pippin_found` the card relabels every badge "SIGNED". Purely horrible.
  Tr.badgeLabel = function (id) { return flagGet("pippin_found") ? "SIGNED" : String(id).toUpperCase(); };

  Tr.addTitle = function (t) { if (Tr.titles.has(t)) return false; Tr.titles.add(t); emit("trainer:title", { title: t }); toast("Title earned: " + t + "."); return true; };

  // ---- playtime ------------------------------------------------------
  Tr.tick = function (dt) { Tr.playtime += dt; };
  Tr.playtimeString = function () { return U.fmtTime(Tr.playtime); };

  // ---- dex ------------------------------------------------------------
  function dexEntry(id) {
    if (!Tr.dex[id]) Tr.dex[id] = { seen: 0, caught: 0, habitats: {}, notes: [], firstSeen: null, firstCaught: null };
    return Tr.dex[id];
  }
  Tr.dexEntry = function (id) { return Tr.dex[id] || null; };
  Tr.dexTotal = function () {
    if (!MQ.Data || !MQ.Data.species) return 0;
    let n = 0;
    MQ.Data.each("species", function (sp) { if (!sp.dexHidden) n++; });
    return n;
  };
  function noteFor(ctx) {
    if (!ctx) return null;
    const bits = [];
    if (ctx.map) bits.push(String(ctx.map).replace(/_/g, " "));
    if (ctx.habitat) bits.push(ctx.habitat);
    if (ctx.phase) bits.push("at " + ctx.phase);
    if (ctx.weather && ctx.weather !== "clear") bits.push("in " + ctx.weather);
    return bits.length ? U.capitalise(bits.join(", ")) : null;
  }
  Tr.see = function (speciesId, ctx) {
    if (!speciesId) return false;
    const e = dexEntry(speciesId);
    const isNew = e.seen === 0;
    e.seen++;
    if (ctx && ctx.habitat) e.habitats[ctx.habitat] = (e.habitats[ctx.habitat] || 0) + 1;
    if (ctx && ctx.map) e.habitats[ctx.map] = e.habitats[ctx.map] || 0;
    const note = noteFor(ctx);
    if (note && e.notes.indexOf(note) < 0 && e.notes.length < 8) e.notes.push(note);
    if (isNew) { e.firstSeen = { map: ctx && ctx.map, ts: Date.now() }; emit("dex:seen", { species: speciesId, entry: e }); checkDexMilestones(); }
    return isNew;
  };
  // obtained() is the dex half: the monster is yours, however it got here
  // (caught, gift, starter, hatched). It does not touch the catch counters.
  Tr.obtained = function (speciesId, ctx) {
    if (!speciesId) return false;
    const e = dexEntry(speciesId);
    if (!e.seen) Tr.see(speciesId, ctx);
    const isNew = e.caught === 0;
    e.caught++;
    if (isNew) {
      e.firstCaught = { map: ctx && ctx.map, level: ctx && ctx.level, ts: Date.now() };
      if (MQ.Progression) MQ.Progression.award("dexNew");
      emit("dex:caught", { species: speciesId, entry: e });
      checkDexMilestones();
    }
    return isNew;
  };
  // record() is a catch proper: the dex entry plus the counters and the perk award.
  Tr.record = function (speciesId, ctx) {
    if (!speciesId) return false;
    const isNew = Tr.obtained(speciesId, ctx);
    Tr.bump("catches", 1);
    if (MQ.Progression) MQ.Progression.award("catch");
    return isNew;
  };
  function dexCounted(id) {
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[id] : null;
    return !sp || !sp.dexHidden;
  }
  Tr.seenCount = function () { let n = 0; const ks = Object.keys(Tr.dex); for (let i = 0; i < ks.length; i++) if (Tr.dex[ks[i]].seen && dexCounted(ks[i])) n++; return n; };
  Tr.caughtCount = function () { let n = 0; const ks = Object.keys(Tr.dex); for (let i = 0; i < ks.length; i++) if (Tr.dex[ks[i]].caught && dexCounted(ks[i])) n++; return n; };
  Tr.habitatNote = function (speciesId) {
    const e = Tr.dex[speciesId];
    if (!e || !e.notes.length) return "";
    return e.notes.join(" · ");
  };

  // SIDE-CONTENT §2.8 milestones.
  Tr.dexMilestones = [
    { id: "seen_25", seen: 25, reward: { item: "field_notebook" }, text: "Seen 25 — the Field Notebook is yours." },
    { id: "caught_25", caught: 25, reward: { marks: 5 }, text: "Caught 25 — 5 Casebook Marks." },
    { id: "caught_50", caught: 50, reward: { perk: 1 }, text: "Caught 50 — a perk point." },
    { id: "cyber_seen", cyberSeen: true, reward: { item: "ghost_lens" }, text: "Every Cyber type sighted — the Ghost Lens." },
    { id: "caught_75", caught: 75, reward: { flag: "dex_bandolier" }, text: "Caught 75 — the Dex Bandolier: one extra capsule per catch." },
    { id: "caught_100", caught: 100, reward: { flag: "shiny_egg_ready" }, text: "Caught 100 — a shiny-morph egg is waiting at the daycare." },
    { id: "caught_all", caughtAll: true, reward: { flag: "merlynx_on_press" }, text: "The dex is full. Something is sitting on the elm press at Y Berllan." }
  ];
  Tr.dexMilestonesDone = {};
  function cyberAllSeen() {
    if (!MQ.Data || !MQ.Data.species) return false;
    let any = false, all = true;
    MQ.Data.each("species", function (sp, id) {
      if (sp.dexHidden) return;
      const types = sp.types || [];
      if (types.indexOf("cyber") < 0) return;
      any = true;
      if (!Tr.dex[id] || !Tr.dex[id].seen) all = false;
    });
    return any && all;
  }
  function checkDexMilestones() {
    const seen = Tr.seenCount(), caught = Tr.caughtCount(), total = Tr.dexTotal();
    for (let i = 0; i < Tr.dexMilestones.length; i++) {
      const m = Tr.dexMilestones[i];
      if (Tr.dexMilestonesDone[m.id]) continue;
      let hit = false;
      if (m.seen) hit = seen >= m.seen;
      else if (m.caught) hit = caught >= m.caught;
      else if (m.cyberSeen) hit = cyberAllSeen();
      else if (m.caughtAll) hit = total > 0 && caught >= total;
      if (!hit) continue;
      Tr.dexMilestonesDone[m.id] = true;
      const r = m.reward || {};
      if (r.item) Inv.add(r.item, 1, { toast: false });
      if (r.marks) Inv.addMarks(r.marks);
      if (r.perk) Tr.grantPerkPoints(r.perk, "dex");
      if (r.flag) flag(r.flag, true);
      toast(m.text);
      emit("dex:milestone", { id: m.id, milestone: m, seen: seen, caught: caught });
    }
  }
  Tr.checkDexMilestones = checkDexMilestones;

  // ---- casebook rank --------------------------------------------------
  Tr.RANKS = [
    { id: "probationer", name: "Probationer", at: 0 },
    { id: "analyst", name: "Analyst", at: 6 },
    { id: "senior", name: "Senior", at: 14 },
    { id: "lead", name: "Lead", at: 24 },
    { id: "principal", name: "Principal", at: 34 }
  ];
  Tr.rankScore = function () { return Tr.stat("casesClosed") + Tr.badges.size; };
  Tr.rank = function () {
    const s = Tr.rankScore();
    let r = Tr.RANKS[0];
    for (let i = 0; i < Tr.RANKS.length; i++) if (s >= Tr.RANKS[i].at) r = Tr.RANKS[i];
    return r;
  };

  Tr.card = function () {
    return {
      name: Tr.name, id: Tr.id, level: Tr.level, xp: Tr.xp, xpToNext: Tr.xpToNext(),
      badges: Tr.badgeCount(), badgeIds: Array.from ? Array.from(Tr.badges) : [],
      rank: Tr.rank().name, playtime: Tr.playtimeString(),
      money: Inv.money, marks: Inv.marks, chips: Inv.chips,
      seen: Tr.seenCount(), caught: Tr.caughtCount(), dexTotal: Tr.dexTotal(),
      perkPoints: Tr.perkPoints, spent: MQ.Progression.spentTotal(),
      trinkets: Tr.trinkets.slice(0, Tr.trinketSlots()),
      steps: Tr.stat("steps"), battles: Tr.stat("battles"), wins: Tr.stat("wins"),
      titles: Tr.titles.size
    };
  };

  Tr.saveKey = "trainer";
  Tr.saveProvider = {
    save: function () {
      return {
        name: Tr.name, level: Tr.level, xp: Tr.xp, perkPoints: Tr.perkPoints, bonusPoints: Tr.bonusPoints,
        perkRanks: U.deepClone(Tr.perkRanks), trinkets: Tr.trinkets.slice(),
        badges: setToArray(Tr.badges), titles: setToArray(Tr.titles),
        playtime: Tr.playtime, stats: U.deepClone(Tr.stats), dex: U.deepClone(Tr.dex),
        milestones: U.deepClone(Tr.dexMilestonesDone)
      };
    },
    load: function (o) {
      Tr.name = "JIM"; Tr.level = 1; Tr.xp = 0; Tr.perkPoints = 1; Tr.bonusPoints = 0;
      Tr.perkRanks = {}; Tr.perks = new Set(); Tr.trinkets = [null, null];
      Tr.badges = new Set(); Tr.titles = new Set(); Tr.playtime = 0; Tr.dex = {}; Tr.dexMilestonesDone = {};
      zeroStats();
      if (o) {
        Tr.name = o.name || "JIM";
        Tr.level = o.level || 1; Tr.xp = o.xp || 0;
        Tr.perkPoints = o.perkPoints === undefined ? 1 : o.perkPoints;
        Tr.bonusPoints = o.bonusPoints || 0;
        Tr.perkRanks = U.deepClone(o.perkRanks) || {};
        const pids = Object.keys(Tr.perkRanks);
        for (let i = 0; i < pids.length; i++) if (Tr.perkRanks[pids[i]] > 0) Tr.perks.add(pids[i]);
        if (o.trinkets) Tr.trinkets = [o.trinkets[0] || null, o.trinkets[1] || null];
        arrayToSet(o.badges, Tr.badges);
        arrayToSet(o.titles, Tr.titles);
        Tr.playtime = o.playtime || 0;
        if (o.stats) { const ks = Object.keys(o.stats); for (let i = 0; i < ks.length; i++) Tr.stats[ks[i]] = o.stats[ks[i]]; }
        Tr.dex = U.deepClone(o.dex) || {};
        Tr.dexMilestonesDone = U.deepClone(o.milestones) || {};
      }
      MQ.Progression.invalidate();
    }
  };
  function setToArray(s) { const out = []; s.forEach(function (v) { out.push(v); }); return out; }
  function arrayToSet(a, s) { if (!a) return; for (let i = 0; i < a.length; i++) s.add(a[i]); }
  provide("trainer", Tr.saveProvider);
  MQ.Trainer = Tr;

  // =============================================================
  // MQ.Settings
  // =============================================================
  const St = MQ.Settings || {};
  St.KEY = "mq2_settings";
  St.DEFAULTS = {
    textSpeed: "normal",       // slow | normal | fast | instant
    musicVolume: 0.7,
    sfxVolume: 0.8,
    difficulty: "normal",      // story | normal | hard | nightmare
    touchSize: 1,              // 0.75 – 1.5
    touchSide: "left",         // left | right (joystick side)
    screenShake: true,
    battleAnim: "normal",      // slow | normal | fast | off
    runToggle: false,          // hold-to-run vs toggle
    captureMinigame: false,    // SYSTEMS-SPEC §11: OFF by default
    xpShare: true,
    autosave: true,
    questTracker: true,
    miniMap: true,
    vibration: true,
    dexHabitats: true
  };
  St.RANGES = {
    textSpeed: ["slow", "normal", "fast", "instant"],
    difficulty: ["story", "normal", "hard", "nightmare"],
    touchSide: ["left", "right"],
    battleAnim: ["slow", "normal", "fast", "off"]
  };
  St.LABELS = {
    textSpeed: "Text speed", musicVolume: "Music", sfxVolume: "Sound", difficulty: "Difficulty",
    touchSize: "Touch size", touchSide: "Stick side", screenShake: "Screen shake",
    battleAnim: "Battle speed", runToggle: "Run is a toggle", captureMinigame: "Capture timing",
    xpShare: "XP share", autosave: "Autosave", questTracker: "Quest tracker", miniMap: "Mini-map",
    vibration: "Vibration", dexHabitats: "Dex habitats"
  };
  St.values = {};
  function resetSettings() { St.values = {}; const ks = Object.keys(St.DEFAULTS); for (let i = 0; i < ks.length; i++) St.values[ks[i]] = St.DEFAULTS[ks[i]]; }
  resetSettings();

  St.TEXT_SPEED = { slow: 0.6, normal: 1, fast: 1.8, instant: 99 };
  St.ANIM_SPEED = { slow: 0.6, normal: 1, fast: 1.8, off: 99 };
  // SYSTEMS-SPEC §13
  St.DIFFICULTY = {
    story: { levelMult: 0.9, aiShift: -1, agentCooldown: -1, xpShare: 1, bagLimit: Infinity, whiteoutLoss: 0, catchMult: 1.3, bossOverdrive: 0 },
    normal: { levelMult: 1, aiShift: 0, agentCooldown: 0, xpShare: 0.5, bagLimit: Infinity, whiteoutLoss: 0.1, catchMult: 1, bossOverdrive: 25 },
    hard: { levelMult: 1.1, aiShift: 1, agentCooldown: 2, xpShare: 0.5, bagLimit: 3, whiteoutLoss: 0.25, whiteoutItem: true, catchMult: 1, bossOverdrive: 50 },
    nightmare: { levelMult: 1.2, aiShift: 1, allSmart: true, agentCooldown: 3, jamGymAgents: true, xpShare: 0.25, bagLimit: 0, whiteoutLoss: 0.5, catchMult: 0.85, bossOverdrive: 75 }
  };
  St.rules = function () { return St.DIFFICULTY[St.values.difficulty] || St.DIFFICULTY.normal; };
  St.lowestDifficultyUsed = "nightmare";

  St.get = function (k) { return St.values[k]; };
  St.all = function () { return U.deepClone(St.values); };
  St.set = function (k, v) {
    if (!(k in St.DEFAULTS)) return false;
    if (St.RANGES[k]) { if (St.RANGES[k].indexOf(v) < 0) return false; }
    else if (typeof St.DEFAULTS[k] === "boolean") v = !!v;
    else if (typeof St.DEFAULTS[k] === "number") v = U.clamp(Number(v), k === "touchSize" ? 0.75 : 0, k === "touchSize" ? 1.5 : 1);
    const old = St.values[k];
    if (old === v) return true;
    St.values[k] = v;
    St.apply();
    St.persist();
    emit("settings", { key: k, value: v, old: old });
    return true;
  };
  St.toggle = function (k) {
    if (typeof St.DEFAULTS[k] === "boolean") return St.set(k, !St.values[k]);
    const r = St.RANGES[k];
    if (!r) return false;
    return St.set(k, r[(r.indexOf(St.values[k]) + 1) % r.length]);
  };
  St.reset = function () { resetSettings(); St.apply(); St.persist(); emit("settings", { reset: true }); };

  // Push values into the systems that own the behaviour, if they exist yet.
  St.apply = function () {
    const v = St.values;
    if (MQ.Dialog) MQ.Dialog.speed = St.TEXT_SPEED[v.textSpeed] || 1;
    if (MQ.Audio) {
      if (MQ.Audio.setMusicVolume) MQ.Audio.setMusicVolume(v.musicVolume); else MQ.Audio.musicVolume = v.musicVolume;
      if (MQ.Audio.setSfxVolume) MQ.Audio.setSfxVolume(v.sfxVolume); else MQ.Audio.sfxVolume = v.sfxVolume;
    }
    if (MQ.Input) {
      MQ.Input.touchScale = v.touchSize;
      MQ.Input.touchSide = v.touchSide;
      MQ.Input.vibrationEnabled = v.vibration;
    }
    if (MQ.Scenes) MQ.Scenes.shakeEnabled = v.screenShake;
    const rules = St.rules();
    const order = ["story", "normal", "hard", "nightmare"];
    if (order.indexOf(v.difficulty) < order.indexOf(St.lowestDifficultyUsed)) St.lowestDifficultyUsed = v.difficulty;
    return rules;
  };
  St.persist = function () {
    try {
      const s = (MQ.Save && MQ.Save._storage) || (typeof localStorage !== "undefined" ? localStorage : null);
      if (s) s.setItem(St.KEY, JSON.stringify({ v: 1, values: St.values, lowest: St.lowestDifficultyUsed }));
    } catch (e) { /* private mode, quota — never fatal */ }
  };
  St.load = function () {
    try {
      const s = (MQ.Save && MQ.Save._storage) || (typeof localStorage !== "undefined" ? localStorage : null);
      const raw = s && s.getItem(St.KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.values) { const ks = Object.keys(St.DEFAULTS); for (let i = 0; i < ks.length; i++) if (o.values[ks[i]] !== undefined) St.values[ks[i]] = o.values[ks[i]]; }
        if (o && o.lowest) St.lowestDifficultyUsed = o.lowest;
      }
    } catch (e) { /* corrupt settings should never block a boot */ }
    St.apply();
    return St.values;
  };

  St.saveKey = "settings";
  St.saveProvider = {
    save: function () { return { values: U.deepClone(St.values), lowest: St.lowestDifficultyUsed }; },
    load: function (o) {
      resetSettings();
      if (o && o.values) { const ks = Object.keys(St.DEFAULTS); for (let i = 0; i < ks.length; i++) if (o.values[ks[i]] !== undefined) St.values[ks[i]] = o.values[ks[i]]; }
      if (o && o.lowest) St.lowestDifficultyUsed = o.lowest;
      St.apply();
      St.persist();
    }
  };
  provide("settings", St.saveProvider);
  MQ.Settings = St;
  St.load();

  // =============================================================
  // Flag resolvers — MQ.Flags.resolvers is documented as extendable; these
  // let quest/dialogue conditions read the content layer directly.
  // =============================================================
  if (MQ.Flags && MQ.Flags.resolvers) {
    const RS = MQ.Flags.resolvers;
    RS.badges = function () {
      if (Tr.badges && Tr.badges.size) return Tr.badges.size;
      const f = flagGet("badges");
      return typeof f === "number" ? f : (Tr.badges ? Tr.badges.size : 0);
    };
    RS.marks = function () { return Inv.marks; };
    RS.chips = function () { return Inv.chips; };
    RS.trust = function (rest) { return MQ.Cats ? MQ.Cats.trust(rest) : 0; };
    RS.perk = function (rest) { return MQ.Progression ? MQ.Progression.has("perk_" + rest) || MQ.Progression.has(rest) : false; };
    RS.ach = function (rest) { return MQ.Achievements ? MQ.Achievements.has(rest.indexOf("ach_") === 0 ? rest : "ach_" + rest) : false; };
    RS.stat = function (rest) { return Tr.stat(rest); };
    RS.level = function () { return Tr.level; };
    RS.dex = function (rest) { return rest === "caught" ? Tr.caughtCount() : rest === "seen" ? Tr.seenCount() : Tr.dexTotal(); };
    RS.rank = function () { return Tr.rank().id; };
  }

  // =============================================================
  // wiring
  // =============================================================
  // Overworld steps feed step counters, repel/lure and the daycare.
  E.on("step", function (d) {
    const n = (d && d.n) || 1;
    Tr.bump("steps", n);
    if (MQ.Clock && MQ.Clock.weather === "rain") Tr.bump("stepsRain", n);
    if (d && d.running) Tr.bump("stepsRun", n);
    Inv.stepBuffs(n);
  });
  // Battle results feed trainer XP, stats and buff expiry.
  E.on("battle:end", function (r) {
    if (!r) return;
    Tr.bump("battles", 1);
    if (r.outcome === "win") {
      Tr.bump("wins", 1);
      MQ.Progression.award(r.kind === "trainer" ? "trainer" : r.kind === "boss" ? "boss" : "wild");
    } else if (r.outcome === "lose") Tr.bump("losses", 1);
    else if (r.outcome === "run") Tr.bump("runs", 1);
    if (r.caught && r.caught.species && !r.caught._dexRecorded) {
      r.caught._dexRecorded = true;
      Tr.record(r.caught.species, {
        map: (r.caught.metAt && r.caught.metAt.map) || (MQ.Overworld && MQ.Overworld.state ? MQ.Overworld.state.map : null),
        level: r.caught.level, how: "capsule"
      });
    }
    Inv.expireBattleBuffs();
  });
  E.on("catch", function (d) { if (d && d.species) Tr.record(d.species, d); });

  // ---- the Field Dex ----------------------------------------------------
  // Nothing was writing to it: MQ.Trainer.see/record existed but only the
  // side activities called them, so a whole play-through read "Seen 0".
  // Meeting a wild monster is a sighting; owning one is a catch.
  function clockNow(key) {
    if (!MQ.Clock) return null;
    return key === "phase" ? MQ.Clock.phase : (MQ.Clock.weather || null);
  }
  E.on("encounter", function (d) {
    if (!d || !d.species) return;
    if (d.dexSeen) return;                 // one sighting per encounter result
    d.dexSeen = true;
    Tr.see(d.species, {
      map: d.map, habitat: d.habitat || d.zone || null, level: d.level,
      phase: clockNow("phase"), weather: clockNow("weather")
    });
  });
  // Everything that hands you a monster records it: a capsule catch through
  // battle:end below, fishing/quests/the daycare through Tr.record of their
  // own, and story gifts (the starter) through MQ.Script's giveMonster, which
  // calls Tr.obtained so a present is not scored as a capture.
  E.on("newgame", function () {
    Party.saveProvider.load(null);
    Inv.saveProvider.load(null);
    Tr.saveProvider.load(null);
    Tr.startedAt = Date.now();
  });
})();
