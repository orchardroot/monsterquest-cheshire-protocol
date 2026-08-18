// =============================================================
// MonsterQuest v2 — MQ.View (core)
// Fills the screen with no letterbox: S = min(W/960, H/540),
// logical size w = W/S, h = H/S (>= 960x540). DPR-aware (cap 2).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const BASE_W = MQ.BASE_W, BASE_H = MQ.BASE_H;

  const View = {
    canvas: null,
    ctx: null,
    W: BASE_W, H: BASE_H,        // CSS px of the canvas element
    w: BASE_W, h: BASE_H,        // logical px
    S: 1,                        // logical → CSS scale
    dpr: 1,
    safe: { top: 0, right: 0, bottom: 0, left: 0 },
    ready: false,
    _rect: null,
    _pt: { x: 0, y: 0 }
  };

  // Pure scaling maths — used by resize() and by tests.
  View.compute = function (W, H, dpr) {
    W = Math.max(1, W | 0); H = Math.max(1, H | 0);
    dpr = Math.min(2, Math.max(1, dpr || 1));
    const S = Math.min(W / BASE_W, H / BASE_H);
    return {
      S: S, dpr: dpr,
      w: W / S, h: H / S,
      cw: Math.round(W * dpr), ch: Math.round(H * dpr)
    };
  };

  function readSafeInsets() {
    // css/style.css exposes --mq-sat/-sar/-sab/-sal from env(safe-area-inset-*)
    if (typeof getComputedStyle !== "function" || !document.documentElement) return;
    let cs;
    try { cs = getComputedStyle(document.documentElement); } catch (e) { return; }
    const px = function (name) {
      const v = cs.getPropertyValue(name);
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    const S = View.S || 1;
    View.safe.top = px("--mq-sat") / S;
    View.safe.right = px("--mq-sar") / S;
    View.safe.bottom = px("--mq-sab") / S;
    View.safe.left = px("--mq-sal") / S;
  }

  View.resize = function () {
    if (!View.canvas) return;
    const vv = window.visualViewport;
    const W = Math.round((vv && vv.width) || window.innerWidth || BASE_W);
    const H = Math.round((vv && vv.height) || window.innerHeight || BASE_H);
    const dprIn = window.devicePixelRatio || 1;
    const c = View.compute(W, H, dprIn);
    View.W = W; View.H = H; View.S = c.S; View.dpr = c.dpr; View.w = c.w; View.h = c.h;
    const cv = View.canvas;
    if (cv.width !== c.cw) cv.width = c.cw;
    if (cv.height !== c.ch) cv.height = c.ch;
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    View.applyTransform();
    readSafeInsets();
    View._rect = null;
    if (MQ.Events) MQ.Events.emit("resize", { w: View.w, h: View.h });
  };

  View.applyTransform = function () {
    const ctx = View.ctx;
    if (!ctx) return;
    const k = View.S * View.dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if ("mozImageSmoothingEnabled" in ctx) ctx.mozImageSmoothingEnabled = false;
    if ("webkitImageSmoothingEnabled" in ctx) ctx.webkitImageSmoothingEnabled = false;
  };

  // Convert client (CSS px) coordinates to logical coordinates. Reuses one point object.
  View.toLogical = function (clientX, clientY, out) {
    out = out || View._pt;
    if (!View._rect && View.canvas && View.canvas.getBoundingClientRect) {
      View._rect = View.canvas.getBoundingClientRect();
    }
    const r = View._rect || { left: 0, top: 0 };
    out.x = (clientX - r.left) / View.S;
    out.y = (clientY - r.top) / View.S;
    return out;
  };

  View.clear = function (color) {
    const ctx = View.ctx;
    if (!ctx) return;
    ctx.fillStyle = color || "#000";
    ctx.fillRect(0, 0, View.w, View.h);
  };

  View.init = function (canvas) {
    if (View.ready) return View;
    canvas = canvas || document.getElementById("screen");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "screen";
      document.body.appendChild(canvas);
    }
    View.canvas = canvas;
    View.ctx = canvas.getContext("2d", { alpha: false }) || canvas.getContext("2d");
    View.ready = true;
    View.resize();
    window.addEventListener("resize", View.resize);
    window.addEventListener("orientationchange", function () {
      View.resize();
      setTimeout(View.resize, 250);   // iOS reports stale sizes right after rotation
    });
    if (window.visualViewport && window.visualViewport.addEventListener) {
      window.visualViewport.addEventListener("resize", View.resize);
    }
    return View;
  };

  MQ.View = View;
})();
