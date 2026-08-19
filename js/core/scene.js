// =============================================================
// MonsterQuest v2 — MQ.Scenes (core): scene stack + transitions
// Scene = { id, enter(params), exit(), update(dt), draw(ctx),
//           transparent?, updateBelow?, onResize?, resume(result)? }
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const stack = [];
  const pending = [];    // deferred ops applied at end of frame
  let flushing = false;

  const overlay = { kind: null, alpha: 0, t: 0, ms: 0, phase: "idle", resolve: null, hold: false, color: "#000" };
  const shakeState = { t: 0, ms: 0, amp: 0, x: 0, y: 0 };
  const flashState = { t: 0, ms: 0, color: "#fff" };
  const shakeOff = { x: 0, y: 0 };

  const Scenes = {
    stack: stack,
    overlay: overlay
  };

  function callSafe(scene, method, arg) {
    if (scene && typeof scene[method] === "function") {
      try { return scene[method](arg); }
      catch (e) { MQ.warn("[Scenes] " + (scene.id || "?") + "." + method + " threw:", e); }
    }
    return undefined;
  }

  Scenes.top = function () { return stack.length ? stack[stack.length - 1] : null; };
  Scenes.has = function (id) {
    for (let i = 0; i < stack.length; i++) if (stack[i].id === id || stack[i] === id) return true;
    return false;
  };
  Scenes.get = function (id) {
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].id === id) return stack[i];
    return null;
  };
  Scenes.depth = function () { return stack.length; };

  Scenes.push = function (scene, params) {
    if (!scene) throw new Error("Scenes.push: no scene");
    pending.push({ op: "push", scene: scene, params: params });
    return scene;
  };
  // Promise form: resolves with the value passed to pop()
  Scenes.pushP = function (scene, params) {
    return new Promise(function (resolve) {
      scene._resolve = resolve;
      Scenes.push(scene, params);
    });
  };
  Scenes.pop = function (result) {
    pending.push({ op: "pop", result: result });
  };
  Scenes.popTo = function (id) {
    pending.push({ op: "popTo", id: id });
  };
  Scenes.replace = function (scene, params) {
    pending.push({ op: "replace", scene: scene, params: params });
    return scene;
  };
  Scenes.clear = function () { pending.push({ op: "clear" }); };

  function doPop(result) {
    const s = stack.pop();
    if (!s) return;
    callSafe(s, "exit", result);
    s.result = result;
    if (s._resolve) { const r = s._resolve; s._resolve = null; r(result); }
    const below = Scenes.top();
    if (below) callSafe(below, "resume", result);
    if (MQ.Events) MQ.Events.emit("scene", { op: "pop", scene: s, top: below });
  }
  function doPush(scene, params) {
    stack.push(scene);
    callSafe(scene, "enter", params);
    if (MQ.Events) MQ.Events.emit("scene", { op: "push", scene: scene, top: scene });
  }

  // Apply queued push/pop ops. Called by MQ.Loop at end of update and end of render.
  Scenes.flush = function () {
    if (flushing) return;
    flushing = true;
    let guard = 0;
    while (pending.length && guard++ < 100) {
      const p = pending.shift();
      if (p.op === "push") doPush(p.scene, p.params);
      else if (p.op === "pop") doPop(p.result);
      else if (p.op === "replace") { doPop(undefined); doPush(p.scene, p.params); }
      else if (p.op === "popTo") { while (stack.length && Scenes.top().id !== p.id) doPop(undefined); }
      else if (p.op === "clear") { while (stack.length) doPop(undefined); }
    }
    flushing = false;
  };

  Scenes.update = function (dt) {
    // top scene, plus any beneath while updateBelow is set on the scene above
    for (let i = stack.length - 1; i >= 0; i--) {
      const s = stack[i];
      callSafe(s, "update", dt);
      if (!s.updateBelow) break;
    }
    // overlay/transition timing
    if (overlay.phase !== "idle") {
      overlay.t += dt;
      const half = overlay.ms / 2;
      if (overlay.phase === "out") {
        overlay.alpha = Math.min(1, overlay.t / half);
        if (overlay.t >= half) {
          overlay.alpha = 1;
          const r = overlay.resolve; overlay.resolve = null;
          if (overlay.hold) { overlay.phase = "held"; }
          else { overlay.phase = "in"; overlay.t = 0; }
          if (r) r();
        }
      } else if (overlay.phase === "in") {
        overlay.alpha = Math.max(0, 1 - overlay.t / half);
        if (overlay.t >= half) {
          overlay.alpha = 0; overlay.phase = "idle"; overlay.kind = null;
          const r = overlay.resolve; overlay.resolve = null;
          if (r) r();
        }
      }
    }
    if (shakeState.t < shakeState.ms) {
      shakeState.t += dt;
      const k = 1 - shakeState.t / shakeState.ms;
      shakeState.x = (Math.random() * 2 - 1) * shakeState.amp * k;
      shakeState.y = (Math.random() * 2 - 1) * shakeState.amp * k;
    } else { shakeState.x = 0; shakeState.y = 0; }
    if (flashState.t < flashState.ms) flashState.t += dt;
  };

  Scenes.draw = function (ctx) {
    if (!stack.length) return;
    let start = stack.length - 1;
    while (start > 0 && stack[start].transparent) start--;
    for (let i = start; i < stack.length; i++) callSafe(stack[i], "draw", ctx);
  };

  Scenes.drawOverlay = function (ctx) {
    const V = MQ.View;
    const w = V ? V.w : MQ.BASE_W, h = V ? V.h : MQ.BASE_H;
    if (flashState.t < flashState.ms) {
      ctx.globalAlpha = 1 - flashState.t / flashState.ms;
      ctx.fillStyle = flashState.color;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    if (overlay.alpha <= 0) return;
    if (overlay.kind === "wipe") {
      ctx.fillStyle = overlay.color;
      const ww = w * overlay.alpha;
      if (overlay.phase === "in") ctx.fillRect(w - ww, 0, ww, h);
      else ctx.fillRect(0, 0, ww, h);
    } else if (overlay.kind === "battle") {
      // shrinking diamond mask feel: concentric bars
      ctx.fillStyle = overlay.color;
      const bars = 8, bh = h / bars;
      for (let i = 0; i < bars; i++) {
        const bw = w * Math.min(1, overlay.alpha * 1.3 - (i % 2) * 0.15);
        if (bw <= 0) continue;
        if (i % 2 === 0) ctx.fillRect(0, i * bh, bw, bh + 1);
        else ctx.fillRect(w - bw, i * bh, bw, bh + 1);
      }
      if (overlay.alpha >= 1) ctx.fillRect(0, 0, w, h);
    } else {
      ctx.globalAlpha = overlay.alpha;
      ctx.fillStyle = overlay.color;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  };

  // Full-screen transition. Resolves when the screen is fully covered
  // (so callers swap scenes at the midpoint); the reveal continues automatically.
  Scenes.transition = function (kind, ms, opts) {
    return new Promise(function (resolve) {
      overlay.kind = kind || "fade";
      overlay.ms = ms || 600;
      overlay.t = 0;
      overlay.alpha = 0;
      overlay.hold = false;
      overlay.color = (opts && opts.color) || (kind === "battle" ? "#000" : "#000");
      overlay.phase = "out";
      overlay.resolve = resolve;
    });
  };
  // Cover the screen and hold it (until fadeIn)
  Scenes.fadeOut = function (ms, color) {
    return new Promise(function (resolve) {
      if (overlay.phase === "held") { resolve(); return; }
      overlay.kind = "fade"; overlay.ms = (ms || 400) * 2; overlay.t = 0; overlay.alpha = 0;
      overlay.hold = true; overlay.color = color || "#000"; overlay.phase = "out"; overlay.resolve = resolve;
    });
  };
  Scenes.fadeIn = function (ms) {
    return new Promise(function (resolve) {
      if (overlay.phase === "idle" && overlay.alpha === 0) { resolve(); return; }
      overlay.kind = overlay.kind || "fade"; overlay.ms = (ms || 400) * 2; overlay.t = 0; overlay.alpha = 1;
      overlay.hold = false; overlay.phase = "in"; overlay.resolve = resolve;
    });
  };
  Scenes.isCovered = function () { return overlay.phase === "held" || overlay.alpha >= 1; };
  Scenes.shake = function (ms, amp) { shakeState.t = 0; shakeState.ms = ms || 300; shakeState.amp = amp || 6; };
  Scenes.shakeOffset = function () { shakeOff.x = Math.round(shakeState.x); shakeOff.y = Math.round(shakeState.y); return shakeOff; };
  Scenes.flash = function (ms, color) { flashState.t = 0; flashState.ms = ms || 220; flashState.color = color || "#fff"; };

  if (MQ.Events) MQ.Events.on("resize", function (d) {
    for (let i = 0; i < stack.length; i++) callSafe(stack[i], "onResize", d);
  });

  MQ.Scenes = Scenes;
})();
