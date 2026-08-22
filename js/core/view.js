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

  // =============================================================
  // Layout tokens — the one place that knows how big "comfortable"
  // is on a given screen.
  //
  // A logical pixel is not a fixed physical size: S is the logical→CSS
  // scale, so a 19.5:9 phone (1169x540 logical) draws a logical px at
  // 0.73 CSS px while a 1280x800 tablet draws it at 1.2. Anything sized
  // in bare logical px therefore comes out roughly 40% smaller on the
  // phone — which is exactly the screen that can least afford it.
  //
  // So the minimums below are stated in CSS px (≈ device-independent px,
  // i.e. what a platform would call dp/pt) and converted back to logical
  // px by dividing by S. Screens that are already comfortable are left
  // alone; only the small physical ones get scaled up.
  // =============================================================
  const MIN_TEXT_CSS = 15.5;    // smallest comfortable body line
  const MIN_TOUCH_CSS = 42;     // smallest comfortable finger target
  const BASE_TEXT = 18;         // MQ.Text "m", in logical px

  // Named UI scales offered in Settings. "auto" is resolved per device.
  const UI_SCALES = { small: 0.86, normal: 1, large: 1.18 };
  View.UI_SCALES = UI_SCALES;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // Pure: given the logical→CSS scale and a UI-scale multiplier, what
  // does a comfortable line of text / row / gap measure in logical px?
  // Used by resize() and by the tests.
  View.tokens = function (S, uiScale, h) {
    S = (S > 0) ? S : 1;
    uiScale = (uiScale > 0) ? uiScale : 1;
    h = (h > 0) ? h : BASE_H;
    const dens = 1 / S;                                  // logical px per CSS px
    // Step text up when a logical px is physically small, never down.
    const autoText = clamp(MIN_TEXT_CSS / (BASE_TEXT * S), 1, 1.45);
    const text = Math.round(clamp(autoText * uiScale, 0.75, 1.9) * 100) / 100;
    const touch = Math.round(clamp(MIN_TOUCH_CSS * dens, 40, 110) * uiScale);
    const pad = Math.round(clamp(12 * dens, 12, 22) * uiScale);
    return {
      scale: uiScale,
      dens: Math.round(dens * 1000) / 1000,
      text: text,
      touch: touch,
      pad: pad,
      rowH: touch,
      dense: dens > 1.15,        // a logical px is physically small (phone)
      short: h <= 560            // no vertical room to spend
    };
  };

  // What "auto" means on this screen: a gentle extra nudge on a small
  // physical screen, on top of the automatic density term above.
  View.suggestUiScale = function (S) {
    const dens = 1 / ((S > 0) ? S : 1);
    if (dens >= 1.25) return 1.06;
    return 1;
  };

  // Resolved token block, refreshed on every resize. Read it, never write it.
  View.ui = View.tokens(1, 1, BASE_H);
  View.uiScaleName = "auto";

  function uiMultiplier() {
    const n = View.uiScaleName;
    if (n === "auto" || n === undefined || n === null) return View.suggestUiScale(View.S);
    return UI_SCALES[n] || 1;
  }
  function refreshTokens() {
    const t = View.tokens(View.S, uiMultiplier(), View.h);
    const cur = View.ui;
    const ks = Object.keys(t);
    for (let i = 0; i < ks.length; i++) cur[ks[i]] = t[ks[i]];
    return cur;
  }
  View.refreshTokens = refreshTokens;

  // Settings calls this; everything re-lays out off the resize event.
  View.setUiScale = function (name) {
    View.uiScaleName = (name === "auto" || UI_SCALES[name]) ? name : "auto";
    refreshTokens();
    if (MQ.Events) MQ.Events.emit("resize", { w: View.w, h: View.h });
    return View.ui;
  };

  // Logical px for a size expressed in CSS px (device-independent px).
  View.dp = function (n) { return n / (View.S || 1); };

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
    refreshTokens();
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
