// =============================================================
// MonsterQuest v2 — MQ.Events (core): tiny pub/sub
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const map = {};

  const Events = {
    on: function (name, fn, ctx) {
      (map[name] || (map[name] = [])).push({ fn: fn, ctx: ctx, once: false });
      return fn;
    },
    once: function (name, fn, ctx) {
      (map[name] || (map[name] = [])).push({ fn: fn, ctx: ctx, once: true });
      return fn;
    },
    off: function (name, fn) {
      const list = map[name];
      if (!list) return;
      if (!fn) { delete map[name]; return; }
      for (let i = list.length - 1; i >= 0; i--) if (list[i].fn === fn) list.splice(i, 1);
    },
    emit: function (name, data) {
      const list = map[name];
      if (!list || !list.length) return 0;
      // copy so handlers may off() themselves safely
      const snapshot = list.slice();
      for (let i = 0; i < snapshot.length; i++) {
        const h = snapshot[i];
        if (h.once) { const idx = list.indexOf(h); if (idx >= 0) list.splice(idx, 1); }
        try { h.fn.call(h.ctx, data, name); }
        catch (e) { MQ.warn("[Events] handler for '" + name + "' threw:", e); }
      }
      return snapshot.length;
    },
    listeners: function (name) { return (map[name] || []).length; },
    clear: function () { const ks = Object.keys(map); for (let i = 0; i < ks.length; i++) delete map[ks[i]]; }
  };
  MQ.Events = Events;
})();
