// =============================================================
// MonsterQuest v2 — MQ.Daycare (content)
// Pit-Pony Pat's yard at `poynton_daycare`. Leave a monster, walk a long
// way, come back to find it bigger and slightly less yours.
// Levels are earned from your step count, paid for in credits.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const E = MQ.Events;
  const D = MQ.Daycare || {};

  function emit(n, d) { try { E.emit(n, d); } catch (e) { MQ.warn("[Daycare] listener threw on " + n, e); } }
  function toast(t) { if (MQ.UI && MQ.UI.toast) MQ.UI.toast(t); }

  D.SLOTS = 2;
  D.MAP = "poynton_daycare";
  D.KEEPER = "npc_poynton_pat";
  D.BASE_FEE = 100;               // just for the walk
  D.FEE_PER_LEVEL = 100;
  D.EGG_STEPS = 2000;             // both slots occupied this long → an egg
  D.slots = [null, null];
  D.steps = 0;
  D.egg = null;
  D.eggProgress = 0;

  // Steps needed for the level after `level`. Higher levels take longer,
  // so the daycare never out-runs actually playing the game.
  D.stepsForLevel = function (level) { return 128 + 8 * level; };

  D.occupied = function () { let n = 0; for (let i = 0; i < D.SLOTS; i++) if (D.slots[i]) n++; return n; };
  D.free = function () { for (let i = 0; i < D.SLOTS; i++) if (!D.slots[i]) return i; return -1; };
  D.slot = function (i) { return D.slots[i] || null; };
  D.has = function (uid) { for (let i = 0; i < D.SLOTS; i++) if (D.slots[i] && D.slots[i].mon.uid === uid) return i; return -1; };

  // ---- leaving one ---------------------------------------------------
  D.leave = function (uid) {
    const slot = D.free();
    if (slot < 0) return { ok: false, msg: "Pat has her hands full." };
    if (!MQ.Party) return { ok: false, msg: "No party." };
    const mon = MQ.Party.get(uid);
    if (!mon) return { ok: false, msg: "Not one of yours." };
    if (MQ.Party.isCat(mon)) return { ok: false, msg: "The cats would not stay, and you know it." };
    if (MQ.Party.indexOf(uid) >= 0 && MQ.Party.list.length <= 1) return { ok: false, msg: "You cannot walk about with nothing." };
    const taken = MQ.Party.release(uid);
    if (!taken) return { ok: false, msg: "Could not take it." };
    D.slots[slot] = { mon: taken, steps: 0, levelsGained: 0, startLevel: taken.level, learned: [], since: Date.now() };
    emit("daycare:leave", { slot: slot, mon: taken });
    toast("Pat takes " + MQ.Party.displayName(taken) + " and does not write anything down.");
    return { ok: true, slot: slot };
  };
  D.deposit = D.leave;

  // ---- the walk does the work ---------------------------------------
  D.tick = function (steps) {
    steps = steps || 1;
    if (!D.occupied()) return 0;
    D.steps += steps;
    let gained = 0;
    for (let i = 0; i < D.SLOTS; i++) {
      const s = D.slots[i];
      if (!s) continue;
      s.steps += steps;
      let guard = 0;
      while (guard++ < 200) {
        const need = D.stepsForLevel(s.mon.level + s.levelsGained);
        if (s.steps < need) break;
        if (s.mon.level + s.levelsGained >= 100) break;
        s.steps -= need;
        s.levelsGained++;
        gained++;
      }
    }
    if (D.occupied() >= 2 && !D.egg) {
      D.eggProgress += steps;
      if (D.eggProgress >= D.EGG_STEPS) D.layEgg();
    }
    if (gained) emit("daycare:grow", { gained: gained });
    return gained;
  };

  D.preview = function (i) {
    const s = D.slots[i];
    if (!s) return null;
    return {
      slot: i, mon: s.mon, name: MQ.Party ? MQ.Party.displayName(s.mon) : s.mon.species,
      level: s.mon.level + s.levelsGained, startLevel: s.startLevel,
      levels: s.levelsGained, cost: D.cost(i),
      toNext: D.stepsForLevel(s.mon.level + s.levelsGained) - s.steps
    };
  };
  D.cost = function (i) {
    const s = D.slots[i];
    if (!s) return 0;
    return D.BASE_FEE + D.FEE_PER_LEVEL * s.levelsGained;
  };

  // Apply the levels for real: stats, exp, and anything it learned on the way.
  D.applyLevels = function (mon, n) {
    const learned = [];
    if (!n) return learned;
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[mon.species] : null;
    for (let k = 0; k < n; k++) {
      if (mon.level >= 100) break;
      mon.level++;
      if (sp && sp.learnset) {
        for (let i = 0; i < sp.learnset.length; i++) {
          if (sp.learnset[i][0] !== mon.level) continue;
          const moveId = sp.learnset[i][1];
          let known = false;
          for (let j = 0; j < (mon.moves || []).length; j++) if (mon.moves[j].id === moveId) known = true;
          if (known) continue;
          const md = MQ.Data.moves ? MQ.Data.moves[moveId] : null;
          const pp = (md && md.pp) || 15;
          if (!mon.moves) mon.moves = [];
          if (mon.moves.length < 4) mon.moves.push({ id: moveId, pp: pp, ppMax: pp });
          learned.push(moveId);
        }
      }
    }
    if (MQ.Progression) {
      const before = mon.stats ? mon.stats.hp : 0;
      MQ.Progression.recalcStats(mon);
      mon.exp = MQ.Progression.expForMonLevel(mon.level, (sp && sp.growth) || "medium");
      if (mon.stats) mon.hp = Math.min(mon.stats.hp, mon.hp + Math.max(0, mon.stats.hp - before));
    }
    // The walk is good for them, but they forget who was holding the lead.
    mon.friendship = U.clamp((mon.friendship || 0) - 5 * n, 0, 255);
    return learned;
  };

  D.collect = function (i, opts) {
    opts = opts || {};
    const s = D.slots[i];
    if (!s) return { ok: false, msg: "Nothing in that pen." };
    const cost = D.cost(i);
    if (!opts.free && MQ.Inventory && !MQ.Inventory.spend(cost)) return { ok: false, msg: "Pat wants " + cost + " credits.", cost: cost };
    if (MQ.Party && MQ.Party.isFull()) return { ok: false, msg: "No room. Come back with a gap." };
    const learned = D.applyLevels(s.mon, s.levelsGained);
    const mon = s.mon;
    const levels = s.levelsGained;
    D.slots[i] = null;
    if (MQ.Party) MQ.Party.add(mon);
    emit("daycare:collect", { slot: i, mon: mon, levels: levels, learned: learned, cost: cost });
    toast(levels
      ? (MQ.Party ? MQ.Party.displayName(mon) : mon.species) + " came back " + levels + " level" + (levels === 1 ? "" : "s") + " up."
      : (MQ.Party ? MQ.Party.displayName(mon) : mon.species) + " came back exactly as it went in.");
    return { ok: true, mon: mon, levels: levels, learned: learned, cost: cost };
  };

  // ---- the egg -------------------------------------------------------
  D.layEgg = function () {
    if (D.egg) return null;
    const a = D.slots[0], b = D.slots[1];
    if (!a || !b) return null;
    const parent = a.mon.level <= b.mon.level ? a.mon : b.mon;
    const shiny = MQ.Flags && MQ.Flags.get("shiny_egg_ready") ? true : Math.random() < 0.01;
    D.egg = { species: parent.species, steps: 0, need: 1200, shiny: shiny, from: [a.mon.species, b.mon.species] };
    D.eggProgress = 0;
    if (MQ.Flags) MQ.Flags.set("shiny_egg_ready", false);
    emit("daycare:egg", { egg: D.egg });
    toast("Pat holds up an egg and says nothing at all about where it came from.");
    return D.egg;
  };
  D.eggReady = function () { return !!D.egg && D.egg.steps >= D.egg.need; };
  D.takeEgg = function () {
    if (!D.egg) return { ok: false, msg: "No egg." };
    if (!D.eggReady()) return { ok: false, msg: "Not yet. Keep walking.", left: D.egg.need - D.egg.steps };
    if (MQ.Party && MQ.Party.isFull() && MQ.Party.boxFull()) return { ok: false, msg: "Nowhere to put it." };
    const mon = MQ.Party ? MQ.Party.make(D.egg.species, 5, { shiny: D.egg.shiny, friendship: 120 }) : null;
    const egg = D.egg;
    D.egg = null;
    if (mon && MQ.Party) MQ.Party.add(mon);
    if (mon && MQ.Trainer) MQ.Trainer.record(mon.species, { map: D.MAP, level: 5 });
    emit("daycare:hatch", { mon: mon, egg: egg });
    toast("It hatched on the way. Of course it did.");
    return { ok: true, mon: mon, shiny: egg.shiny };
  };

  E.on("step", function (d) {
    const n = (d && d.n) || 1;
    const hadEgg = !!D.egg;
    D.tick(n);
    // An egg laid on this very step does not also start hatching on it.
    if (hadEgg && D.egg && D.egg.steps < D.egg.need) {
      D.egg.steps += n;
      if (D.egg.steps >= D.egg.need) { emit("daycare:egghatchable", { egg: D.egg }); toast("The egg has started to move."); }
    }
  });
  E.on("newgame", function () { D.saveProvider.load(null); });

  D.saveKey = "daycare";
  D.saveProvider = {
    save: function () { return { slots: U.deepClone(D.slots), steps: D.steps, egg: U.deepClone(D.egg), eggProgress: D.eggProgress }; },
    load: function (o) {
      D.slots = [null, null]; D.steps = 0; D.egg = null; D.eggProgress = 0;
      if (!o) return;
      if (o.slots) for (let i = 0; i < D.SLOTS; i++) D.slots[i] = o.slots[i] ? U.deepClone(o.slots[i]) : null;
      D.steps = o.steps || 0;
      D.egg = o.egg ? U.deepClone(o.egg) : null;
      D.eggProgress = o.eggProgress || 0;
    }
  };
  if (MQ.Save && MQ.Save.register) MQ.Save.register("daycare", D.saveProvider);

  MQ.Daycare = D;
})();
