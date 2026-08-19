// STUB — owned by battle. Placeholder MQ.Battle.start that resolves a win
// after one frame so scripts and tests can run before the engine lands.
(function () {
  "use strict";
  const MQ = window.MQ;
  const Battle = MQ.Battle || {};
  Battle.STUB = true;
  Battle.start = function (opts) {
    return new Promise(function (resolve) {
      const done = function () { resolve({ outcome: "win", caught: null, expGained: 0, moneyGained: 0, turns: 0, stub: true, opts: opts || {} }); };
      if (typeof requestAnimationFrame === "function" && !MQ.HEADLESS) requestAnimationFrame(done); else setTimeout(done, 0);
    });
  };
  MQ.Battle = Battle;
})();
