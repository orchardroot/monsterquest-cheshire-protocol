// =============================================================
// MonsterQuest v2 — namespace root (core)
// Creates window.MQ. Every other file publishes onto it.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ || (window.MQ = {});
  MQ.VERSION = "2.0.0";
  MQ.SAVE_VERSION = 2;
  MQ.TILE = 32;        // logical px per world tile
  MQ.ART = 16;         // source art px (drawn at 2x)
  MQ.BASE_W = 960;
  MQ.BASE_H = 540;
  MQ.DEV = true;       // dev-mode: registries throw helpful errors, validators verbose

  // Tiny helpers that need to exist before util.js
  MQ.noop = function () {};
  MQ.isFn = function (f) { return typeof f === "function"; };
  MQ.log = function () {
    if (!MQ.DEV || typeof console === "undefined") return;
    console.log.apply(console, arguments);
  };
  MQ.warn = function () {
    if (typeof console === "undefined") return;
    console.warn.apply(console, arguments);
  };
  // Environment flags (headless tools set window.__MQ_HEADLESS)
  MQ.HEADLESS = !!window.__MQ_HEADLESS;
})();
