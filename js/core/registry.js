// =============================================================
// MonsterQuest v2 — MQ.Data (core): typed registries
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;

  const KINDS = ["types", "moves", "abilities", "items", "species", "encounters", "trainers", "quests", "achievements", "recipes", "bounties", "dialogue"];
  const Data = MQ.Data || {};
  Data.KINDS = KINDS;
  Data.validators = Data.validators || [];
  for (let i = 0; i < KINDS.length; i++) if (!Data[KINDS[i]]) Data[KINDS[i]] = {};

  Data.kind = function (kind) {
    if (!Data[kind] || typeof Data[kind] !== "object") { Data[kind] = {}; if (KINDS.indexOf(kind) < 0) KINDS.push(kind); }
    return Data[kind];
  };
  Data.collisions = [];
  Data.define = function (kind, id, obj) {
    const table = Data.kind(kind);
    if (table[id] && !obj.__override) {
      Data.collisions.push(kind + "/" + id);
      if (MQ.DEV) MQ.warn("[Data] redefining " + kind + "/" + id);
    }
    obj.id = id;
    table[id] = obj;
    return obj;
  };
  Data.has = function (kind, id) { return !!(Data[kind] && Data[kind][id]); };
  Data.get = function (kind, id) {
    const t = Data[kind];
    const v = t ? t[id] : undefined;
    if (v === undefined) {
      const msg = "[Data] no " + kind + " with id '" + id + "'" + (t ? "" : " (unknown kind)");
      if (MQ.DEV) throw new Error(msg);
      MQ.warn(msg);
      return null;
    }
    return v;
  };
  Data.getOr = function (kind, id, fallback) { const t = Data[kind]; return t && t[id] !== undefined ? t[id] : fallback; };
  Data.each = function (kind, fn) {
    const t = Data[kind];
    if (!t) return;
    const ks = Object.keys(t);
    for (let i = 0; i < ks.length; i++) fn(t[ks[i]], ks[i], i);
  };
  Data.ids = function (kind) { return Data[kind] ? Object.keys(Data[kind]) : []; };
  Data.count = function (kind) { return Data.ids(kind).length; };
  Data.list = function (kind) { const t = Data[kind]; const out = []; if (t) { const ks = Object.keys(t); for (let i = 0; i < ks.length; i++) out.push(t[ks[i]]); } return out; };
  Data.filter = function (kind, pred) { return Data.list(kind).filter(pred); };

  // validate() → string[] of problems (runs all registered validators)
  Data.validate = function () {
    const errors = [];
    const push = function (msg) { errors.push(String(msg)); };
    for (let i = 0; i < Data.validators.length; i++) {
      try { Data.validators[i](push, Data); }
      catch (e) { errors.push("validator " + i + " threw: " + (e && e.message)); }
    }
    return errors;
  };

  // A second MQ.Data.define("trainers", "vex_3", ...) from a different file
  // silently overwrites the first at load time — by validate() time the
  // original is already gone, so Data.define itself records the collision
  // above; this just reports whatever it saw.
  Data.validators.push(function (err) {
    for (let i = 0; i < Data.collisions.length; i++) err("duplicate id defined twice: " + Data.collisions[i]);
  });

  MQ.Data = Data;
})();
