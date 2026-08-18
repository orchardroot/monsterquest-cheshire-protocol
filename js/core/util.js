// =============================================================
// MonsterQuest v2 — MQ.U utilities (core)
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = {};

  U.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  U.lerp = function (a, b, t) { return a + (b - a) * t; };
  U.sign = function (v) { return v > 0 ? 1 : v < 0 ? -1 : 0; };
  U.approach = function (v, target, step) {
    return v < target ? Math.min(target, v + step) : Math.max(target, v - step);
  };
  U.round = function (v) { return Math.round(v); };
  U.floor = function (v) { return Math.floor(v); };

  // ---- hashing / seeded RNG (FNV-1a + mulberry32) --------------
  U.hash = function (str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  };
  U.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  // rng(seed) → function returning [0,1); seed may be a string or number
  U.rng = function (seed) {
    return U.mulberry32(typeof seed === "number" ? seed : U.hash(seed));
  };
  U.rand = Math.random;
  U.randInt = function (lo, hi, rnd) { return lo + Math.floor((rnd || Math.random)() * (hi - lo + 1)); };
  U.chance = function (p, rnd) { return (rnd || Math.random)() < p; };
  U.pick = function (arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; };
  U.weightedPick = function (arr, weightKey, rnd) {
    let total = 0;
    for (let i = 0; i < arr.length; i++) total += arr[i][weightKey] || 0;
    let r = (rnd || Math.random)() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= arr[i][weightKey] || 0;
      if (r < 0) return arr[i];
    }
    return arr[arr.length - 1];
  };
  U.shuffle = function (arr, rnd) {
    const r = rnd || Math.random;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };

  // ---- formatting ---------------------------------------------
  U.pad = function (v, n, ch) {
    let s = String(v);
    ch = ch === undefined ? " " : ch;
    while (s.length < n) s = ch + s;
    return s;
  };
  U.padRight = function (v, n, ch) {
    let s = String(v);
    ch = ch === undefined ? " " : ch;
    while (s.length < n) s = s + ch;
    return s;
  };
  U.fmtMoney = function (n) { return "£" + U.fmtNum(n); };
  U.fmtNum = function (n) {
    const s = String(Math.floor(n));
    let out = "";
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += ",";
      out += s[i];
    }
    return out;
  };
  U.fmtTime = function (ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return U.pad(h, 2, "0") + ":" + U.pad(m, 2, "0");
  };
  U.fmt = function (str, vars) {
    // "{name} found {n} items" — simple mustache-less substitution
    return String(str).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] !== undefined ? vars[k] : m;
    });
  };
  U.capitalise = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

  // ---- objects ------------------------------------------------
  U.deepClone = function (v) {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) {
      const a = new Array(v.length);
      for (let i = 0; i < v.length; i++) a[i] = U.deepClone(v[i]);
      return a;
    }
    if (v instanceof Set) return new Set(Array.from(v));
    if (v instanceof Map) return new Map(Array.from(v));
    const o = {};
    const ks = Object.keys(v);
    for (let i = 0; i < ks.length; i++) o[ks[i]] = U.deepClone(v[ks[i]]);
    return o;
  };
  U.merge = function (base, over) {
    const out = U.deepClone(base) || {};
    if (!over) return out;
    const ks = Object.keys(over);
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i], v = over[k];
      if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
        out[k] = U.merge(out[k], v);
      } else out[k] = U.deepClone(v);
    }
    return out;
  };
  U.defaults = function (obj, defs) {
    obj = obj || {};
    const ks = Object.keys(defs);
    for (let i = 0; i < ks.length; i++) if (obj[ks[i]] === undefined) obj[ks[i]] = defs[ks[i]];
    return obj;
  };
  U.uid = (function () {
    let n = 0;
    return function (prefix) {
      n++;
      return (prefix || "u") + Date.now().toString(36) + "_" + n.toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
    };
  })();

  // ---- easing -------------------------------------------------
  U.ease = {
    linear: function (t) { return t; },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    inCubic: function (t) { return t * t * t; },
    outCubic: function (t) { const u = t - 1; return u * u * u + 1; },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    outBack: function (t) { const c = 1.70158; const u = t - 1; return 1 + u * u * ((c + 1) * u + c); },
    outElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    },
    outBounce: function (t) {
      const n = 7.5625, d = 2.75;
      if (t < 1 / d) return n * t * t;
      if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
      if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
      t -= 2.625 / d; return n * t * t + 0.984375;
    }
  };

  // ---- geometry -----------------------------------------------
  U.dist = function (ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); };
  U.inRect = function (px, py, x, y, w, h) { return px >= x && py >= y && px < x + w && py < y + h; };
  U.dirVec = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  U.dirFrom = function (dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  };
  U.opposite = { up: "down", down: "up", left: "right", right: "left" };

  // ---- colour -------------------------------------------------
  U.hexToRgb = function (hex) {
    const n = parseInt(hex.slice(1), 16);
    if (hex.length === 4) {
      return [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17];
    }
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgbToHex = function (r, g, b) {
    return "#" + U.pad(((U.clamp(Math.round(r), 0, 255) << 16) | (U.clamp(Math.round(g), 0, 255) << 8) | U.clamp(Math.round(b), 0, 255)).toString(16), 6, "0");
  };
  U.shade = function (hex, f) {
    const c = U.hexToRgb(hex);
    return U.rgbToHex(c[0] * f, c[1] * f, c[2] * f);
  };
  U.mix = function (hexA, hexB, t) {
    const a = U.hexToRgb(hexA), b = U.hexToRgb(hexB);
    return U.rgbToHex(U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t));
  };

  // ---- misc ---------------------------------------------------
  U.now = function () {
    return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  };
  U.range = function (n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i; return a; };
  U.last = function (arr) { return arr[arr.length - 1]; };
  U.remove = function (arr, v) { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); return i >= 0; };

  MQ.U = U;
})();
