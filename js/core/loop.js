// =============================================================
// MonsterQuest v2 — MQ.Loop (core): fixed-timestep update + render
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const STEP = 1000 / 60;
  const MAX_STEPS = 5;

  const Loop = {
    STEP: STEP,
    time: 0,          // monotonic ms advanced by fixed steps
    frames: 0,
    running: false,
    paused: false,
    fps: 60,
    _last: 0,
    _acc: 0,
    _raf: 0,
    _fpsAcc: 0, _fpsN: 0
  };

  Loop.step = function (dt) {
    dt = dt === undefined ? STEP : dt;
    if (MQ.Input && MQ.Input.update) MQ.Input.update();
    Loop.time += dt;
    if (MQ.Clock && MQ.Clock.update) MQ.Clock.update(dt);
    if (MQ.Script && MQ.Script.update) MQ.Script.update(dt);
    if (MQ.Scenes) MQ.Scenes.update(dt);
    if (MQ.UI && MQ.UI.update) MQ.UI.update(dt);
    if (MQ.Scenes) MQ.Scenes.flush();
  };

  Loop.render = function () {
    const V = MQ.View;
    if (!V || !V.ctx) return;
    const ctx = V.ctx;
    V.applyTransform();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, V.w, V.h);
    const shake = MQ.Scenes ? MQ.Scenes.shakeOffset() : null;
    if (shake && (shake.x || shake.y)) { ctx.save(); ctx.translate(shake.x, shake.y); }
    if (MQ.Scenes) MQ.Scenes.draw(ctx);
    if (shake && (shake.x || shake.y)) ctx.restore();
    if (MQ.Scenes) MQ.Scenes.drawOverlay(ctx);
    if (MQ.UI && MQ.UI.draw) MQ.UI.draw(ctx);
    if (MQ.Input && MQ.Input.draw) MQ.Input.draw(ctx);
    if (MQ.Scenes) MQ.Scenes.flush();
  };

  Loop.frame = function (now) {
    if (!Loop.running) return;
    Loop._raf = window.requestAnimationFrame(Loop.frame);
    if (Loop.paused) { Loop._last = now; return; }
    if (!Loop._last) Loop._last = now;
    let dt = now - Loop._last;
    Loop._last = now;
    if (dt < 0) dt = 0;
    if (dt > STEP * MAX_STEPS) dt = STEP * MAX_STEPS;
    Loop._acc += dt;
    let n = 0;
    while (Loop._acc >= STEP && n < MAX_STEPS) {
      Loop.step(STEP);
      Loop._acc -= STEP;
      n++;
    }
    if (n === MAX_STEPS) Loop._acc = 0;
    Loop.render();
    Loop.frames++;
    Loop._fpsAcc += dt; Loop._fpsN++;
    if (Loop._fpsAcc >= 1000) { Loop.fps = Math.round(Loop._fpsN * 1000 / Loop._fpsAcc); Loop._fpsAcc = 0; Loop._fpsN = 0; }
  };

  Loop.start = function () {
    if (Loop.running) return;
    Loop.running = true;
    Loop._last = 0;
    Loop._acc = 0;
    Loop._raf = window.requestAnimationFrame(Loop.frame);
  };
  Loop.stop = function () {
    Loop.running = false;
    if (Loop._raf && window.cancelAnimationFrame) window.cancelAnimationFrame(Loop._raf);
    Loop._raf = 0;
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("visibilitychange", function () {
      Loop.paused = !!document.hidden;
      if (!document.hidden) { Loop._last = 0; Loop._acc = 0; }
      if (MQ.Events) MQ.Events.emit(document.hidden ? "hidden" : "visible");
      if (MQ.Input && MQ.Input.releaseAll && document.hidden) MQ.Input.releaseAll();
    });
  }

  MQ.Loop = Loop;
})();
