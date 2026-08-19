// =============================================================
// MonsterQuest v2 — MQ.Save (core): slots, autosave, versioning,
// provider registry. Storage key mq2_slot_<n> (n = 1..3, 'auto').
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const VERSION = MQ.SAVE_VERSION || 2;
  const SLOTS = [1, 2, 3];
  const AUTO = "auto";
  const providers = {};     // key → {save(), load(obj)}
  const order = [];

  const Save = {
    VERSION: VERSION,
    SLOTS: SLOTS,
    AUTO: AUTO,
    providers: providers,
    playtime: 0,            // ms, accumulated by Loop via Save.tick or set by trainer
    currentSlot: null,
    lastError: null,
    autosaveEnabled: true,
    _storage: null,         // injectable storage (tests); default localStorage
    summaryFn: null         // fn() → summary object override
  };

  function storage() {
    if (Save._storage) return Save._storage;
    try { if (typeof localStorage !== "undefined") return localStorage; } catch (e) { /* ignore */ }
    if (!Save._mem) {
      const mem = {};
      Save._mem = {
        getItem: function (k) { return mem[k] === undefined ? null : mem[k]; },
        setItem: function (k, v) { mem[k] = String(v); },
        removeItem: function (k) { delete mem[k]; }
      };
    }
    return Save._mem;
  }
  Save.setStorage = function (s) { Save._storage = s; };
  Save.key = function (slot) { return "mq2_slot_" + slot; };

  Save.register = function (key, prov) {
    if (!prov || typeof prov.save !== "function" || typeof prov.load !== "function") throw new Error("Save.register(" + key + "): need save() and load()");
    if (!providers[key]) order.push(key);
    providers[key] = prov;
  };
  Save.unregister = function (key) { delete providers[key]; U.remove(order, key); };

  function summary() {
    if (Save.summaryFn) { try { return Save.summaryFn(); } catch (e) { /* fall through */ } }
    const s = { name: "", badges: 0, chapter: 0, party: [], map: "", level: 1 };
    try {
      if (MQ.Trainer) { s.name = MQ.Trainer.name || ""; s.badges = MQ.Trainer.badges ? (MQ.Trainer.badges.size !== undefined ? MQ.Trainer.badges.size : MQ.Trainer.badges.length) : 0; s.level = MQ.Trainer.level || 1; }
      if (MQ.Flags) s.chapter = MQ.Flags.chapter;
      if (MQ.Party && MQ.Party.list) for (let i = 0; i < MQ.Party.list.length; i++) s.party.push(MQ.Party.list[i].species);
      if (MQ.Overworld && MQ.Overworld.state) s.map = MQ.Overworld.state.map || "";
    } catch (e) { /* ignore */ }
    return s;
  }

  // Build the envelope from all providers (does not write)
  Save.snapshot = function () {
    const data = {};
    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      try { data[k] = providers[k].save(); }
      catch (e) { MQ.warn("[Save] provider " + k + ".save threw:", e); }
    }
    return { version: VERSION, ts: Date.now(), playtime: Save.playtime, summary: summary(), data: data };
  };

  Save.write = function (slot) {
    slot = slot || Save.currentSlot || 1;
    const env = Save.snapshot();
    let str;
    try { str = JSON.stringify(env); }
    catch (e) { Save.lastError = e; MQ.warn("[Save] serialise failed", e); return false; }
    try { storage().setItem(Save.key(slot), str); }
    catch (e) { Save.lastError = e; MQ.warn("[Save] write failed", e); return false; }
    if (slot !== AUTO) Save.currentSlot = slot;
    if (MQ.Events) MQ.Events.emit("save", { slot: slot, env: env });
    return true;
  };

  // read(slot) → envelope | null (never throws). Version < 2 → {legacy:true, version, ...} marker.
  Save.read = function (slot) {
    let str = null;
    try { str = storage().getItem(Save.key(slot)); } catch (e) { return null; }
    if (!str) return null;
    let env;
    try { env = JSON.parse(str); } catch (e) { Save.lastError = e; return { corrupt: true, slot: slot }; }
    if (!env || typeof env !== "object") return { corrupt: true, slot: slot };
    if (!(env.version >= VERSION)) return { legacy: true, version: env.version || 0, slot: slot, ts: env.ts || 0 };
    return env;
  };
  Save.isLoadable = function (env) { return !!(env && !env.corrupt && !env.legacy && env.data); };

  // Apply an envelope: distribute data to providers. Returns true on success.
  Save.apply = function (env) {
    if (!Save.isLoadable(env)) return false;
    Save.playtime = env.playtime || 0;
    for (let i = 0; i < order.length; i++) {
      const k = order[i];
      try { providers[k].load(env.data[k]); }
      catch (e) { MQ.warn("[Save] provider " + k + ".load threw:", e); }
    }
    if (MQ.Events) MQ.Events.emit("load", { env: env });
    return true;
  };
  Save.load = function (slot) {
    const env = Save.read(slot);
    if (!Save.isLoadable(env)) return false;
    const ok = Save.apply(env);
    if (ok && slot !== AUTO) Save.currentSlot = slot;
    return ok;
  };
  Save.erase = function (slot) {
    try { storage().removeItem(Save.key(slot)); } catch (e) { /* ignore */ }
    if (Save.currentSlot === slot) Save.currentSlot = null;
  };
  Save.exists = function (slot) { const e = Save.read(slot); return !!e; };

  // slots() → [{slot, env|null, empty, legacy, corrupt, summary, ts, playtime}] for 1..3 + autosave
  Save.slots = function () {
    const out = [];
    const all = SLOTS.concat([AUTO]);
    for (let i = 0; i < all.length; i++) {
      const env = Save.read(all[i]);
      out.push({
        slot: all[i],
        env: env,
        empty: !env,
        legacy: !!(env && env.legacy),
        corrupt: !!(env && env.corrupt),
        summary: env && env.summary ? env.summary : null,
        ts: env ? env.ts || 0 : 0,
        playtime: env ? env.playtime || 0 : 0
      });
    }
    return out;
  };

  Save.autosave = function () {
    if (!Save.autosaveEnabled) return false;
    return Save.write(AUTO);
  };
  // Reset all providers to a fresh game (calls load(undefined))
  Save.newGame = function () {
    Save.playtime = 0;
    for (let i = 0; i < order.length; i++) {
      try { providers[order[i]].load(undefined); } catch (e) { MQ.warn("[Save] provider " + order[i] + " reset threw:", e); }
    }
    if (MQ.Events) MQ.Events.emit("newgame");
  };
  Save.tick = function (dt) { Save.playtime += dt; };

  // ---- adopt providers declared by earlier core files -----------------
  if (MQ.Flags && MQ.Flags.saveProvider) Save.register("flags", MQ.Flags.saveProvider);
  if (MQ.Clock && MQ.Clock.saveProvider) Save.register("clock", MQ.Clock.saveProvider);

  MQ.Save = Save;
})();
