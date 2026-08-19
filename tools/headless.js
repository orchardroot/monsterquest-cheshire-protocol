// MonsterQuest v2 — headless loader for node tools/tests.
// Loads every <script src> listed in index.html into a vm context with
// stubs for window/document/canvas/localStorage/rAF/AudioContext/navigator.
// Usage: const H = require('./headless'); const env = H.load(); env.MQ ...
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function scriptList(indexPath) {
  const html = fs.readFileSync(indexPath || path.join(ROOT, "index.html"), "utf8");
  const re = /<script\s+src="([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function makeCtx2d(canvas) {
  const calls = [];
  const ctx = { canvas: canvas, calls: calls, fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, font: "", textAlign: "left", textBaseline: "top", globalAlpha: 1, imageSmoothingEnabled: true };
  const methods = ["fillRect", "strokeRect", "clearRect", "fillText", "strokeText", "beginPath", "closePath", "moveTo", "lineTo", "arc", "arcTo", "rect", "fill", "stroke", "clip", "save", "restore", "translate", "scale", "rotate", "setTransform", "drawImage", "createLinearGradient", "createRadialGradient", "putImageData", "ellipse", "quadraticCurveTo", "bezierCurveTo", "resetTransform"];
  methods.forEach(function (m) {
    ctx[m] = function () { if (calls.length < 5000) calls.push(m); if (m === "createLinearGradient" || m === "createRadialGradient") return { addColorStop: function () {} }; };
  });
  ctx.measureText = function (s) { return { width: (s || "").length * (parseInt(ctx.font, 10) || 16) * 0.6 }; };
  ctx.getImageData = function (x, y, w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; };
  ctx.createImageData = function (w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; };
  ctx.createPattern = function () { return {}; };
  return ctx;
}

function makeCanvas() {
  const c = { width: 300, height: 150, style: {}, _ctx: null, tagName: "CANVAS", listeners: {} };
  c.getContext = function () { return c._ctx || (c._ctx = makeCtx2d(c)); };
  c.addEventListener = function (n, fn) { (c.listeners[n] || (c.listeners[n] = [])).push(fn); };
  c.removeEventListener = function () {};
  c.getBoundingClientRect = function () { return { left: 0, top: 0, width: c.width, height: c.height }; };
  c.setPointerCapture = function () {};
  c.releasePointerCapture = function () {};
  c.toDataURL = function () { return "data:,"; };
  c.dispatch = function (n, ev) { (c.listeners[n] || []).forEach(function (f) { f(ev); }); };
  return c;
}

function makeStorage() {
  const mem = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; },
    clear: function () { Object.keys(mem).forEach(function (k) { delete mem[k]; }); },
    key: function (i) { return Object.keys(mem)[i] || null; },
    get length() { return Object.keys(mem).length; },
    _mem: mem
  };
}

function load(opts) {
  opts = opts || {};
  const files = opts.files || scriptList(opts.index);
  const rafQueue = [];
  const screen = makeCanvas();
  screen.id = "screen";
  const listeners = {};
  const win = {
    __MQ_NO_BOOT: opts.boot ? false : true,
    __MQ_HEADLESS: true,
    innerWidth: opts.width || 1280,
    innerHeight: opts.height || 720,
    devicePixelRatio: opts.dpr || 1,
    localStorage: makeStorage(),
    requestAnimationFrame: function (fn) { rafQueue.push(fn); return rafQueue.length; },
    cancelAnimationFrame: function () {},
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: setInterval, clearInterval: clearInterval,
    performance: { now: function () { return Number(process.hrtime.bigint() / 1000000n); } },
    console: console,
    Math: Math, JSON: JSON, Date: Date, Promise: Promise, Object: Object, Array: Array, Number: Number, String: String, Boolean: Boolean,
    Error: Error, TypeError: TypeError, RangeError: RangeError, Map: Map, Set: Set, Symbol: Symbol, RegExp: RegExp, Uint8Array: Uint8Array, Uint8ClampedArray: Uint8ClampedArray, Float32Array: Float32Array, Int32Array: Int32Array,
    parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite, encodeURIComponent: encodeURIComponent, decodeURIComponent: decodeURIComponent,
    addEventListener: function (n, fn) { (listeners[n] || (listeners[n] = [])).push(fn); },
    removeEventListener: function () {},
    dispatchEvent: function (ev) { (listeners[ev.type] || []).forEach(function (f) { f(ev); }); return true; },
    matchMedia: function () { return { matches: false, addListener: function () {}, addEventListener: function () {} }; },
    getComputedStyle: function () { return { getPropertyValue: function () { return ""; } }; },
    navigator: { getGamepads: function () { return []; }, vibrate: function () { return true; }, userAgent: "node-headless", serviceWorker: null },
    screen: { orientation: { lock: function () { return Promise.reject(new Error("headless")); } } },
    location: { protocol: "file:", hostname: "", href: "file:///index.html", search: "" },
    AudioContext: function () {
      const t = { currentTime: 0, sampleRate: 44100, state: "running", destination: {}, resume: function () { return Promise.resolve(); }, close: function () { return Promise.resolve(); } };
      const node = function () { return { connect: function () { return node(); }, disconnect: function () {}, start: function () {}, stop: function () {}, gain: { value: 1, setValueAtTime: function () {}, linearRampToValueAtTime: function () {}, exponentialRampToValueAtTime: function () {}, cancelScheduledValues: function () {}, setTargetAtTime: function () {} }, frequency: { value: 440, setValueAtTime: function () {}, linearRampToValueAtTime: function () {}, exponentialRampToValueAtTime: function () {} }, type: "sine", buffer: null, playbackRate: { value: 1 }, Q: { value: 1 } }; };
      t.createGain = node; t.createOscillator = node; t.createBufferSource = node; t.createBiquadFilter = node; t.createDelay = node; t.createDynamicsCompressor = node; t.createStereoPanner = node; t.createWaveShaper = node;
      t.createBuffer = function (ch, len) { return { getChannelData: function () { return new Float32Array(len); }, length: len }; };
      return t;
    },
    PointerEvent: function () {},
    Image: function () { return { addEventListener: function () {}, set src(v) { this._src = v; } }; },
    __rafQueue: rafQueue,
    __listeners: listeners,
    __screen: screen
  };
  win.window = win;
  win.self = win;
  win.globalThis = win;
  win.top = win;
  const doc = {
    hidden: false,
    readyState: "complete",
    documentElement: { style: { setProperty: function () {} }, clientWidth: win.innerWidth, clientHeight: win.innerHeight, requestFullscreen: function () { return Promise.resolve(); } },
    body: { appendChild: function () {}, style: {}, classList: { add: function () {}, remove: function () {} } },
    createElement: function (tag) {
      if (tag === "canvas") return makeCanvas();
      return { style: {}, appendChild: function () {}, setAttribute: function () {}, addEventListener: function () {}, textContent: "", children: [] };
    },
    getElementById: function (id) { return id === "screen" ? screen : null; },
    querySelector: function () { return null; },
    addEventListener: function (n, fn) { (listeners["doc:" + n] || (listeners["doc:" + n] = [])).push(fn); },
    removeEventListener: function () {},
    fullscreenElement: null
  };
  win.document = doc;
  vm.createContext(win);
  for (let i = 0; i < files.length; i++) {
    const p = path.join(ROOT, files[i]);
    const src = fs.readFileSync(p, "utf8");
    try { vm.runInContext(src, win, { filename: files[i] }); }
    catch (e) { e.message = "[headless] while loading " + files[i] + ": " + e.message; throw e; }
  }
  const MQ = win.MQ;
  const env = {
    MQ: MQ, window: win, document: doc, files: files, screen: screen,
    // helper: run n fixed loop steps (updates + scene flush)
    step: function (n, dt) {
      n = n || 1;
      for (let i = 0; i < n; i++) MQ.Loop.step(dt);
    },
    // resolve pending microtasks then step; returns Promise
    tick: function (n) {
      const self = this;
      return new Promise(function (resolve) { setImmediate(function () { self.step(n || 1); setImmediate(resolve); }); });
    },
    fire: function (name, ev) { (listeners[name] || []).forEach(function (f) { f(ev); }); },
    fireDoc: function (name, ev) { (listeners["doc:" + name] || []).forEach(function (f) { f(ev); }); },
    key: function (code, down) { env.fire(down === false ? "keyup" : "keydown", { code: code, preventDefault: function () {} }); },
    render: function () { MQ.Loop.render(); }
  };
  return env;
}

module.exports = { load: load, scriptList: scriptList, makeCanvas: makeCanvas, ROOT: ROOT };

if (require.main === module) {
  const env = load();
  console.log("Loaded " + env.files.length + " scripts; MQ keys: " + Object.keys(env.MQ).join(", "));
}
