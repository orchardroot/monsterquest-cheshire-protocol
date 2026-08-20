// =============================================================
// MonsterQuest v2 — MQ.Audio (audio workstream)
// WebAudio synthesis engine. No audio files, ever: every note,
// drum, cry and stinger is built from oscillators and noise.
//
// Contents
//   1. context, buses, unlock, mixer, settings/save hooks
//   2. low-level param helpers (headless-stub safe)
//   3. wave cache (pulse duties), noise buffers
//   4. instruments (pitched) + drum kit (noise/percussive)
//   5. patch renderer (data-driven SFX grains)
//   6. song compiler: pattern DSL -> per-bar event lists
//   7. look-ahead scheduler / Playback (crossfade, layers, variants)
//   8. public API: playSong, stopSong, jingle, sfx, cry, ambience,
//      setVolume, mute, duck, setLayer, setVariant
//
// The compiler and scheduler maths are pure and exported for tests
// (A.compile, A.scheduleWindow, A.parsePattern) so tools/test can
// verify timings without an audio device.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ || (window.MQ = {});
  const A = {};
  MQ.Audio = A;

  // ---------------------------------------------------------------
  // 0. constants
  // ---------------------------------------------------------------
  A.LOOKAHEAD = 2.5;      // seconds of music scheduled ahead of the clock
  A.MIN_BARS_AHEAD = 2;   // always at least two loop iterations queued
  A.TICK_MS = 100;        // scheduler heartbeat (throttled tabs cap at 1000)
  A.MAX_SFX_VOICES = 28;
  A.COMPILE_VERSION = 3;

  const NOTE_NAMES = { c: 0, "c#": 1, db: 1, d: 2, "d#": 3, eb: 3, e: 4, fb: 4, "e#": 5, f: 5, "f#": 6, gb: 6, g: 7, "g#": 8, ab: 8, a: 9, "a#": 10, bb: 10, b: 11, cb: 11 };
  const LN2 = Math.log(2);

  // Root octave 3 => C3 = 48 (MIDI, C4 = 60). Track `oct` shifts by 12.
  A.noteToMidi = function (key) {
    if (typeof key === "number") return key;
    if (!key) return 48;
    const m = /^([a-gA-G])([#b]?)(-?\d+)?$/.exec(String(key).trim());
    if (!m) return 48;
    const base = NOTE_NAMES[(m[1] + m[2]).toLowerCase()];
    const oct = m[3] === undefined ? 3 : parseInt(m[3], 10);
    return (base === undefined ? 0 : base) + (oct + 1) * 12;
  };
  A.freqOf = function (midi) { return 440 * Math.exp(((midi - 69) / 12) * LN2); };

  // ---------------------------------------------------------------
  // 1. context + mixer
  // ---------------------------------------------------------------
  A.ctx = null;
  A.ready = false;
  A.unlocked = false;
  A.failed = false;
  A.muted = false;
  A.vol = { master: 0.85, music: 0.62, sfx: 0.85, cry: 0.9, ambience: 0.45 };
  A.current = null;         // current looping song id
  A.pending = null;         // song requested before unlock

  let ctx = null;
  let bus = null;           // {master, music, sfx, cry, amb, fx, delay}
  let noiseBuf = null, pinkBuf = null;
  let waveCache = null;
  let ticker = null;
  let playing = null;       // active Playback
  let fading = [];          // Playbacks fading out
  let ambient = null;
  let sfxVoices = [];
  let lastSfxAt = {};
  let duckUntil = 0;

  // A.timeSource is overridable by tests (the headless AudioContext stub
  // freezes currentTime at 0, which would make scheduling untestable).
  A.timeSource = null;
  function now() {
    if (A.timeSource) return A.timeSource();
    return ctx ? ctx.currentTime : 0;
  }
  A.now = now;

  function AC() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  A.init = function () {
    if (A.ready || A.failed) return A.ready;
    const Ctor = AC();
    if (!Ctor) { A.failed = true; MQ.warn("[Audio] no WebAudio; running silent"); return false; }
    try { ctx = new Ctor(); } catch (e) { A.failed = true; MQ.warn("[Audio] context failed", e); return false; }
    A.ctx = ctx;
    buildBuses();
    buildBuffers();
    waveCache = {};
    A.ready = true;
    A.loadPrefs();
    A.applySettings();
    if (MQ.Events) {
      MQ.Events.on("settings", A.applySettings);
      MQ.Events.on("visible", function () { A.resync(); });
    }
    if (!MQ.HEADLESS) startTicker();
    if (A.pending) { const p = A.pending; A.pending = null; A.playSong(p.id, p.opts); }
    return true;
  };

  function gain(v) {
    const g = ctx.createGain();
    setV(g.gain, v, 0);
    return g;
  }

  function buildBuses() {
    const master = gain(A.muted ? 0 : A.vol.master);
    let out = master;
    // Gentle bus compression so dense battle mixes never clip.
    if (ctx.createDynamicsCompressor) {
      const comp = ctx.createDynamicsCompressor();
      setV(comp.threshold, -14, 0); setV(comp.knee, 22, 0);
      setV(comp.ratio, 4, 0); setV(comp.attack, 0.004, 0); setV(comp.release, 0.22, 0);
      master.connect(comp);
      comp.connect(ctx.destination);
      out = comp;
    } else {
      master.connect(ctx.destination);
    }
    const music = gain(A.vol.music);
    const sfx = gain(A.vol.sfx);
    const cry = gain(A.vol.cry);
    const amb = gain(A.vol.ambience);
    music.connect(master); sfx.connect(master); cry.connect(master); amb.connect(master);
    // Shared feedback delay used by cave/marsh/space tracks (track.send).
    let fx = null, dly = null;
    if (ctx.createDelay) {
      dly = ctx.createDelay(1.5);
      setV(dly.delayTime, 0.31, 0);
      const fb = gain(0.34);
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; setV(lp.frequency, 2400, 0);
      fx = gain(1);
      fx.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(music);
    }
    bus = { master: master, music: music, sfx: sfx, cry: cry, amb: amb, fx: fx, out: out };
    A.bus = bus;
  }

  function buildBuffers() {
    const sr = ctx.sampleRate || 44100;
    const n = Math.floor(sr * 2);
    noiseBuf = ctx.createBuffer(1, n, sr);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    // Pink-ish noise (Voss-lite) for wind, hiss and warm drums.
    pinkBuf = ctx.createBuffer(1, n, sr);
    const p = pinkBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let j = 0; j < n; j++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.0990460;
      b1 = 0.96300 * b1 + w * 0.2965164;
      b2 = 0.57000 * b2 + w * 1.0526913;
      p[j] = (b0 + b1 + b2 + w * 0.1848) * 0.22;
    }
  }

  A.unlock = function () {
    if (A.failed) return false;
    if (!A.ready && !A.init()) return false;
    A.unlocked = true;
    if (ctx.state === "suspended" && ctx.resume) {
      try { ctx.resume(); } catch (e) { /* ignore */ }
    }
    if (!ticker && !MQ.HEADLESS) startTicker();
    if (A.pending) { const p = A.pending; A.pending = null; A.playSong(p.id, p.opts); }
    return true;
  };

  A.suspend = function () { if (ctx && ctx.suspend) { try { ctx.suspend(); } catch (e) { /* */ } } };
  A.resume = function () { if (ctx && ctx.resume) { try { ctx.resume(); } catch (e) { /* */ } } };

  // ---------------------------------------------------------------
  // 2. param helpers — every one tolerates a missing param/node so the
  //    engine still "runs" against the headless AudioContext stub.
  // ---------------------------------------------------------------
  function setV(p, v, t) {
    if (!p) return;
    if (p.setValueAtTime) { try { p.setValueAtTime(v, t); return; } catch (e) { /* */ } }
    p.value = v;
  }
  function lin(p, v, t) { if (p && p.linearRampToValueAtTime) { try { p.linearRampToValueAtTime(v, t); } catch (e) { /* */ } } }
  function exp(p, v, t) { if (p && p.exponentialRampToValueAtTime) { try { p.exponentialRampToValueAtTime(Math.max(1e-4, v), t); } catch (e) { /* */ } } }
  function cancel(p, t) { if (p && p.cancelScheduledValues) { try { p.cancelScheduledValues(t); } catch (e) { /* */ } } }
  A._setV = setV; A._lin = lin; A._exp = exp;

  function osc(type, freq, t, detune) {
    const o = ctx.createOscillator();
    if (type && typeof type === "object") {
      if (o.setPeriodicWave) { try { o.setPeriodicWave(type); } catch (e) { o.type = "square"; } }
      else o.type = "square";
    } else o.type = type || "square";
    setV(o.frequency, freq, t);
    if (detune) setV(o.detune, detune, t);
    return o;
  }
  function src(buf, t, rate, loop) {
    const s = ctx.createBufferSource();
    s.buffer = buf || noiseBuf;
    if (rate) setV(s.playbackRate, rate, t);
    if (loop) s.loop = true;
    return s;
  }
  function filt(type, freq, q, t) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    setV(f.frequency, freq, t);
    if (q !== undefined) setV(f.Q, q, t);
    return f;
  }
  function go(node, t, end) {
    if (node.start) { try { node.start(t); } catch (e) { /* */ } }
    if (node.stop) { try { node.stop(end); } catch (e) { /* */ } }
    return node;
  }

  // Attack / decay / sustain / release envelope on a fresh gain node.
  function adsr(t, dur, a, d, s, r, peak) {
    const g = ctx.createGain();
    const p = g.gain;
    const hold = t + Math.max(dur, a + d);
    setV(p, 1e-4, t);
    lin(p, peak, t + a);
    if (d > 0) exp(p, Math.max(1e-4, peak * s), t + a + d);
    exp(p, Math.max(1e-4, peak * s), hold);
    exp(p, 1e-4, hold + r);
    g.__end = hold + r + 0.02;
    return g;
  }
  // Percussive one-shot envelope (instant attack, exponential tail).
  function hit(t, dur, peak, attack) {
    const g = ctx.createGain();
    const p = g.gain;
    setV(p, 1e-4, t);
    lin(p, peak, t + (attack || 0.002));
    exp(p, 1e-4, t + dur);
    g.__end = t + dur + 0.02;
    return g;
  }

  // ---------------------------------------------------------------
  // 3. pulse waves
  // ---------------------------------------------------------------
  function pulse(duty) {
    const key = "p" + duty;
    if (waveCache && waveCache[key] !== undefined) return waveCache[key];
    let w = null;
    if (ctx.createPeriodicWave) {
      const n = 40;
      const re = new Float32Array(n), im = new Float32Array(n);
      for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(Math.PI * i * duty);
      try { w = ctx.createPeriodicWave(re, im); } catch (e) { w = null; }
    }
    if (waveCache) waveCache[key] = w;
    return w;
  }
  function organWave() {
    if (waveCache && waveCache.org !== undefined) return waveCache.org;
    let w = null;
    if (ctx.createPeriodicWave) {
      const parts = [1, 0.5, 0.32, 0, 0.22, 0, 0, 0.16, 0.1];
      const n = parts.length + 1;
      const re = new Float32Array(n), im = new Float32Array(n);
      for (let i = 1; i < n; i++) im[i] = parts[i - 1];
      try { w = ctx.createPeriodicWave(re, im); } catch (e) { w = null; }
    }
    if (waveCache) waveCache.org = w;
    return w;
  }

  // ---------------------------------------------------------------
  // 4. instruments
  //    fn(t, freq, dur, vel, out, p) -> array of source nodes
  //    `p` is the track/params object (glide, send, etc.)
  // ---------------------------------------------------------------
  const INST = {};
  A.instruments = INST;
  A.defineInstrument = function (id, fn) { INST[id] = fn; };

  function chip(duty, defVol) {
    return function (t, f, dur, vel, out, p) {
      const w = pulse(duty);
      const o = osc(w || "square", f, t);
      if (p && p.glide) exp(o.frequency, A.freqOf(p.glideTo), t + dur * 0.9);
      if (p && p.vib) vibrato(o, t, dur, p.vib, p.vibHz || 5.5);
      const g = adsr(t, dur, 0.006, dur * 0.35, 0.62, Math.min(0.09, dur * 0.4), defVol * vel);
      o.connect(g); g.connect(out);
      go(o, t, g.__end);
      return [o];
    };
  }
  function vibrato(o, t, dur, depth, hz) {
    if (!o.detune || dur < 0.22) return null;
    const lfo = osc("sine", hz, t);
    const amt = gain(depth);
    lfo.connect(amt); amt.connect(o.detune);
    go(lfo, t, t + dur + 0.05);
    return lfo;
  }

  INST.pulse12 = chip(0.125, 0.20);
  INST.pulse25 = chip(0.25, 0.20);
  INST.pulse50 = chip(0.5, 0.17);
  INST.square = INST.pulse50;

  INST.tri = function (t, f, dur, vel, out) {
    const o = osc("triangle", f, t);
    const g = adsr(t, dur, 0.008, dur * 0.3, 0.7, 0.05, 0.28 * vel);
    o.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };

  // Triangle bass with a touch of sub sine — the backbone of every song.
  INST.bass = function (t, f, dur, vel, out, p) {
    const o = osc("triangle", f, t);
    const sub = osc("sine", f * 0.5, t);
    const lp = filt("lowpass", Math.max(180, f * 6), 0.9, t);
    const g = adsr(t, dur, 0.006, dur * 0.4, 0.55, 0.06, 0.34 * vel);
    const sg = adsr(t, dur, 0.01, dur * 0.5, 0.4, 0.06, 0.15 * vel);
    o.connect(lp); lp.connect(g); g.connect(out);
    sub.connect(sg); sg.connect(out);
    if (p && p.glideTo !== undefined) exp(o.frequency, A.freqOf(p.glideTo), t + dur * 0.85);
    go(o, t, g.__end); go(sub, t, sg.__end);
    return [o, sub];
  };

  INST.sub = function (t, f, dur, vel, out) {
    const o = osc("sine", f, t);
    const g = adsr(t, dur, 0.02, dur * 0.5, 0.6, 0.12, 0.42 * vel);
    o.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };

  INST.saw = function (t, f, dur, vel, out) {
    const o = osc("sawtooth", f, t);
    const lp = filt("lowpass", Math.min(9000, f * 8), 1.2, t);
    const g = adsr(t, dur, 0.01, dur * 0.3, 0.6, 0.08, 0.15 * vel);
    o.connect(lp); lp.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };

  // Two-operator FM lead — the voice of ORACLE and the battle themes.
  INST.fm = function (t, f, dur, vel, out, p) {
    const car = osc("sine", f, t);
    const ratio = (p && p.ratio) || 2;
    const mod = osc("sine", f * ratio, t);
    const idx = gain(f * ((p && p.index) || 2.2));
    exp(idx.gain, Math.max(1, f * ((p && p.index) || 2.2) * 0.12), t + Math.min(dur, 0.45));
    mod.connect(idx);
    if (car.frequency) idx.connect(car.frequency);
    const g = adsr(t, dur, 0.008, dur * 0.35, 0.55, 0.09, 0.19 * vel);
    car.connect(g); g.connect(out);
    if (p && p.vib) vibrato(car, t, dur, p.vib, p.vibHz || 5);
    go(car, t, g.__end); go(mod, t, g.__end);
    return [car, mod];
  };

  // Bell / glockenspiel — inharmonic FM, long tail. May Day, church, wizard.
  INST.bell = function (t, f, dur, vel, out) {
    const car = osc("sine", f, t);
    const mod = osc("sine", f * 3.47, t);
    const idx = gain(f * 3.2);
    exp(idx.gain, Math.max(1, f * 0.2), t + 0.35);
    mod.connect(idx);
    if (car.frequency) idx.connect(car.frequency);
    const g = hit(t, Math.max(dur, 0.9) * 1.4, 0.2 * vel, 0.004);
    car.connect(g); g.connect(out);
    go(car, t, g.__end); go(mod, t, g.__end);
    return [car, mod];
  };

  INST.marimba = function (t, f, dur, vel, out) {
    const o = osc("sine", f, t);
    const o2 = osc("sine", f * 4.02, t);
    const g = hit(t, Math.min(Math.max(dur, 0.18) * 1.2, 1.1), 0.28 * vel, 0.003);
    const g2 = hit(t, 0.07, 0.09 * vel, 0.002);
    o.connect(g); g.connect(out);
    o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };

  INST.glass = function (t, f, dur, vel, out) {
    const o = osc("sine", f, t);
    const o2 = osc("sine", f * 2.01, t);
    const g = hit(t, Math.max(dur, 0.5) * 1.6, 0.13 * vel, 0.02);
    const g2 = hit(t, Math.max(dur, 0.4), 0.06 * vel, 0.05);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };

  // Karplus–Strong plucked string: the orchard harp, the Tudor lute.
  function plucked(bright, decay, level) {
    return function (t, f, dur, vel, out) {
      if (!ctx.createDelay) return INST.tri(t, f, dur, vel, out);
      const period = 1 / Math.max(20, f);
      const dl = ctx.createDelay(0.06);
      setV(dl.delayTime, period, t);
      const fb = gain(decay);
      const lp = filt("lowpass", Math.min(11000, f * bright), 0.6, t);
      dl.connect(lp); lp.connect(fb); fb.connect(dl);
      const burst = src(noiseBuf, t, 1, false);
      const bg = gain(0);
      setV(bg.gain, level * vel, t);
      setV(bg.gain, 0, t + period * 2.2);
      burst.connect(bg); bg.connect(dl);
      const outg = gain(1);
      const life = Math.max(dur, 0.35) * 1.5;
      dl.connect(outg);
      setV(outg.gain, 1, t);
      exp(outg.gain, 1e-4, t + life);
      setV(fb.gain, decay, t);
      exp(fb.gain, 0.001, t + life);
      outg.connect(out);
      go(burst, t, t + period * 4 + 0.02);
      return [burst];
    };
  }
  INST.pluck = plucked(9, 0.965, 0.85);
  INST.harp = plucked(14, 0.978, 0.8);
  INST.lute = plucked(7, 0.945, 0.9);

  // Bowed strings: detuned saws, slow bow, gentle vibrato.
  INST.strings = function (t, f, dur, vel, out) {
    const a = osc("sawtooth", f, t, -7);
    const b = osc("sawtooth", f, t, 8);
    const lp = filt("lowpass", Math.min(5200, 700 + f * 4), 0.7, t);
    exp(lp.frequency, Math.min(6400, 1100 + f * 5), t + Math.min(dur, 0.5));
    const g = adsr(t, dur, Math.min(0.14, dur * 0.35), dur * 0.2, 0.85, 0.2, 0.085 * vel);
    a.connect(lp); b.connect(lp); lp.connect(g); g.connect(out);
    vibrato(a, t, dur, 6, 4.6);
    go(a, t, g.__end); go(b, t, g.__end);
    return [a, b];
  };

  INST.brass = function (t, f, dur, vel, out) {
    const a = osc("sawtooth", f, t, -4);
    const b = osc("square", f, t, 5);
    const lp = filt("lowpass", 500, 3.4, t);
    exp(lp.frequency, Math.min(7000, f * 7), t + 0.06);
    exp(lp.frequency, Math.min(3600, f * 4), t + Math.max(dur, 0.12));
    const g = adsr(t, dur, 0.02, dur * 0.25, 0.78, 0.07, 0.12 * vel);
    a.connect(lp); b.connect(lp); lp.connect(g); g.connect(out);
    go(a, t, g.__end); go(b, t, g.__end);
    return [a, b];
  };

  INST.tuba = function (t, f, dur, vel, out) {
    const o = osc("sawtooth", f, t);
    const lp = filt("lowpass", Math.max(220, f * 3), 1.4, t);
    const g = adsr(t, dur, 0.03, dur * 0.3, 0.6, 0.07, 0.24 * vel);
    o.connect(lp); lp.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };

  INST.organ = function (t, f, dur, vel, out) {
    const w = organWave();
    const o = osc(w || "square", f, t);
    const o2 = osc("sine", f * 2, t, 4);
    const g = adsr(t, dur, 0.03, 0.05, 0.95, 0.14, 0.1 * vel);
    const g2 = adsr(t, dur, 0.05, 0.05, 0.9, 0.14, 0.04 * vel);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };

  INST.flute = function (t, f, dur, vel, out) {
    const o = osc("sine", f, t);
    const o2 = osc("triangle", f * 2, t, 3);
    const air = src(pinkBuf, t, 1, true);
    const ag = hit(t, Math.min(dur, 0.22), 0.02 * vel, 0.03);
    const hp = filt("highpass", 2000, 0.8, t);
    const g = adsr(t, dur, Math.min(0.07, dur * 0.4), dur * 0.2, 0.9, 0.1, 0.14 * vel);
    const g2 = adsr(t, dur, 0.09, dur * 0.2, 0.7, 0.1, 0.025 * vel);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out);
    air.connect(hp); hp.connect(ag); ag.connect(out);
    vibrato(o, t, dur, 9, 5.2);
    go(o, t, g.__end); go(o2, t, g2.__end); go(air, t, ag.__end);
    return [o, o2, air];
  };

  INST.pad = function (t, f, dur, vel, out) {
    const a = osc("sawtooth", f, t, -9);
    const b = osc("sawtooth", f, t, 11);
    const c = osc("triangle", f * 0.5, t);
    const lp = filt("lowpass", 420, 0.9, t);
    exp(lp.frequency, Math.min(3000, 500 + f * 3), t + Math.min(dur * 0.6, 1.6));
    const g = adsr(t, dur, Math.min(0.5, dur * 0.35), dur * 0.2, 0.9, Math.min(0.9, dur * 0.5), 0.055 * vel);
    a.connect(lp); b.connect(lp); c.connect(lp); lp.connect(g); g.connect(out);
    go(a, t, g.__end); go(b, t, g.__end); go(c, t, g.__end);
    return [a, b, c];
  };

  INST.choir = function (t, f, dur, vel, out) {
    const a = osc("sawtooth", f, t, -6);
    const b = osc("triangle", f, t, 7);
    const fo = filt("bandpass", Math.max(400, f * 2.2), 3.2, t);
    const fo2 = filt("bandpass", Math.max(900, f * 4.6), 4.5, t);
    const g = adsr(t, dur, Math.min(0.35, dur * 0.3), dur * 0.2, 0.92, Math.min(0.8, dur * 0.45), 0.11 * vel);
    a.connect(fo); b.connect(fo); fo.connect(fo2); fo2.connect(g); g.connect(out);
    vibrato(a, t, dur, 7, 4.1);
    go(a, t, g.__end); go(b, t, g.__end);
    return [a, b];
  };

  // Sustained drone: mines, THE STACK, the fog on the estuary.
  INST.drone = function (t, f, dur, vel, out) {
    const a = osc("sawtooth", f, t, -14);
    const b = osc("sawtooth", f, t, 13);
    const lp = filt("lowpass", 300, 2.2, t);
    exp(lp.frequency, 700, t + dur * 0.5);
    exp(lp.frequency, 260, t + dur);
    const g = adsr(t, dur, Math.min(0.8, dur * 0.3), 0.1, 0.95, Math.min(1.2, dur * 0.4), 0.075 * vel);
    a.connect(lp); b.connect(lp); lp.connect(g); g.connect(out);
    go(a, t, g.__end); go(b, t, g.__end);
    return [a, b];
  };

  // Harpsichord: Knutsford's Cranford waltz.
  INST.harpsi = function (t, f, dur, vel, out) {
    const o = osc(pulse(0.28) || "square", f, t);
    const o2 = osc(pulse(0.14) || "square", f * 2, t, 6);
    const bp = filt("highpass", 300, 0.7, t);
    const g = hit(t, Math.min(Math.max(dur, 0.15) * 1.3, 1.0), 0.13 * vel, 0.002);
    const g2 = hit(t, 0.09, 0.05 * vel, 0.002);
    o.connect(bp); bp.connect(g); g.connect(out);
    o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };

  // Klaxon-ish reed for Crewe signals and Warrington neon.
  INST.reed = function (t, f, dur, vel, out) {
    const o = osc(pulse(0.4) || "square", f, t);
    const bp = filt("bandpass", Math.max(600, f * 3), 2.4, t);
    const g = adsr(t, dur, 0.012, dur * 0.25, 0.7, 0.06, 0.13 * vel);
    o.connect(bp); bp.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };

  // ---- drum kit --------------------------------------------------
  const DRUM = {};
  A.drums = DRUM;

  function noiseHit(t, dur, vel, type, freq, q, level, buf) {
    const s = src(buf || noiseBuf, t, 1, false);
    const f = filt(type, freq, q, t);
    const g = hit(t, dur, level * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(A.__drumOut || bus.music);
    go(s, t, g.__end);
    return [s, g];
  }

  DRUM.k = function (t, vel, out) {                 // kick
    const o = osc("sine", 150, t);
    exp(o.frequency, 45, t + 0.09);
    const g = hit(t, 0.24, 0.7 * vel, 0.002);
    const cl = src(noiseBuf, t, 1, false);
    const cf = filt("lowpass", 1800, 1, t);
    const cg = hit(t, 0.02, 0.22 * vel, 0.001);
    o.connect(g); g.connect(out);
    cl.connect(cf); cf.connect(cg); cg.connect(out);
    go(o, t, g.__end); go(cl, t, cg.__end);
    return [o, cl];
  };
  DRUM.K = function (t, vel, out) {                 // deep kick / bear drum
    const o = osc("sine", 110, t);
    exp(o.frequency, 33, t + 0.16);
    const g = hit(t, 0.45, 0.85 * vel, 0.003);
    o.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };
  DRUM.s = function (t, vel, out) {                 // snare
    const s = src(noiseBuf, t, 1, false);
    const f = filt("highpass", 1500, 0.8, t);
    const g = hit(t, 0.15, 0.34 * vel, 0.001);
    const o = osc("triangle", 200, t);
    const og = hit(t, 0.07, 0.16 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out);
    o.connect(og); og.connect(out);
    go(s, t, g.__end); go(o, t, og.__end);
    return [s, o];
  };
  DRUM.S = function (t, vel, out) {                 // heavy snare / gated
    const s = src(noiseBuf, t, 1, false);
    const f = filt("bandpass", 1900, 0.6, t);
    const g = hit(t, 0.28, 0.44 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.p = function (t, vel, out) {                 // clap / rimshot
    const s = src(noiseBuf, t, 1, false);
    const f = filt("bandpass", 1200, 3, t);
    const g = hit(t, 0.09, 0.3 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.h = function (t, vel, out) {                 // closed hat
    const s = src(noiseBuf, t, 1, false);
    const f = filt("highpass", 7000, 0.9, t);
    const g = hit(t, 0.045, 0.16 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.H = function (t, vel, out) {                 // open hat
    const s = src(noiseBuf, t, 1, false);
    const f = filt("highpass", 6200, 0.8, t);
    const g = hit(t, 0.26, 0.14 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.z = function (t, vel, out) {                 // shaker
    const s = src(pinkBuf, t, 1, false);
    const f = filt("highpass", 5000, 0.7, t);
    const g = hit(t, 0.07, 0.1 * vel, 0.008);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  function tom(freq, dur) {
    return function (t, vel, out) {
      const o = osc("sine", freq, t);
      exp(o.frequency, freq * 0.55, t + dur);
      const g = hit(t, dur, 0.4 * vel, 0.002);
      const s = src(noiseBuf, t, 1, false);
      const f = filt("lowpass", freq * 5, 1, t);
      const sg = hit(t, dur * 0.5, 0.08 * vel, 0.001);
      o.connect(g); g.connect(out); s.connect(f); f.connect(sg); sg.connect(out);
      go(o, t, g.__end); go(s, t, sg.__end);
      return [o, s];
    };
  }
  DRUM.m = tom(320, 0.16);
  DRUM.t = tom(220, 0.2);
  DRUM.T = tom(150, 0.28);
  DRUM.c = function (t, vel, out) {                 // crash
    const s = src(noiseBuf, t, 1, false);
    const f = filt("highpass", 4000, 0.5, t);
    const g = hit(t, 1.1, 0.24 * vel, 0.004);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.r = function (t, vel, out) {                 // ride
    const s = src(noiseBuf, t, 1, false);
    const f = filt("bandpass", 5200, 4, t);
    const g = hit(t, 0.4, 0.1 * vel, 0.002);
    const o = osc("square", 3100, t);
    const og = hit(t, 0.16, 0.02 * vel, 0.001);
    s.connect(f); f.connect(g); g.connect(out); o.connect(og); og.connect(out);
    go(s, t, g.__end); go(o, t, og.__end);
    return [s, o];
  };
  DRUM.w = function (t, vel, out) {                 // woodblock
    const o = osc("square", 1100, t);
    exp(o.frequency, 800, t + 0.03);
    const g = hit(t, 0.05, 0.2 * vel, 0.001);
    o.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };
  DRUM.b = function (t, vel, out) {                 // triangle / small bell
    const o = osc("sine", 2400, t);
    const o2 = osc("sine", 3730, t);
    const g = hit(t, 0.75, 0.07 * vel, 0.002);
    const g2 = hit(t, 0.5, 0.04 * vel, 0.002);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };
  DRUM.x = function (t, vel, out) {                 // metal clank: loom, salt pan, rail
    const fs = [523, 761, 1153, 1471];
    const nodes = [];
    for (let i = 0; i < fs.length; i++) {
      const o = osc("square", fs[i] * (0.98 + i * 0.01), t);
      const g = hit(t, 0.13 - i * 0.02, 0.055 * vel, 0.001);
      o.connect(g); g.connect(out);
      go(o, t, g.__end);
      nodes.push(o);
    }
    const s = src(noiseBuf, t, 1, false);
    const f = filt("bandpass", 3400, 6, t);
    const sg = hit(t, 0.06, 0.12 * vel, 0.001);
    s.connect(f); f.connect(sg); sg.connect(out);
    go(s, t, sg.__end);
    nodes.push(s);
    return nodes;
  };
  DRUM.n = function (t, vel, out) {                 // steam hiss
    const s = src(pinkBuf, t, 1, false);
    const f = filt("bandpass", 2600, 1.1, t);
    exp(f.frequency, 900, t + 0.34);
    const g = hit(t, 0.36, 0.15 * vel, 0.05);
    s.connect(f); f.connect(g); g.connect(out);
    go(s, t, g.__end);
    return [s];
  };
  DRUM.d = function (t, vel, out) {                 // water drip
    const o = osc("sine", 900, t);
    exp(o.frequency, 2200, t + 0.05);
    const g = hit(t, 0.1, 0.13 * vel, 0.001);
    o.connect(g); g.connect(out);
    go(o, t, g.__end);
    return [o];
  };
  DRUM.g = function (t, vel, out) {                 // anvil / gong
    const o = osc("triangle", 180, t);
    const o2 = osc("square", 262, t);
    const g = hit(t, 1.4, 0.1 * vel, 0.004);
    const g2 = hit(t, 0.8, 0.05 * vel, 0.002);
    o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out);
    go(o, t, g.__end); go(o2, t, g2.__end);
    return [o, o2];
  };

  // ---------------------------------------------------------------
  // 5. patch renderer (data-driven SFX grains)
  // ---------------------------------------------------------------
  // grain = { i:instrument|'noise'|'drum', n:midi, f:Hz, to:midi glide,
  //           t:offset s, d:dur s, v:vol, w:wave, hp/lp:filter Hz, q,
  //           ratio/index (fm), rep:{n,every,dn,dv}, drum:'k' }
  function renderGrain(gr, out, t0, pitch, volMul) {
    const t = t0 + (gr.t || 0);
    const d = gr.d || 0.12;
    const v = (gr.v === undefined ? 0.5 : gr.v) * volMul;
    const nodes = [];
    if (gr.drum) {
      const fn = DRUM[gr.drum];
      if (fn) { const r = fn(t, v * 1.4, out); for (let i = 0; i < r.length; i++) nodes.push(r[i]); }
      return nodes;
    }
    if (gr.i === "noise") {
      const buf = gr.pink ? pinkBuf : noiseBuf;
      const s = src(buf, t, (gr.rate || 1) * pitch, false);
      let node = s;
      if (gr.bp || gr.hp || gr.lp) {
        const type = gr.bp ? "bandpass" : (gr.hp ? "highpass" : "lowpass");
        const hz = (gr.bp || gr.hp || gr.lp) * pitch;
        const f = filt(type, hz, gr.q || 1, t);
        if (gr.sweep) exp(f.frequency, gr.sweep * pitch, t + d);
        s.connect(f); node = f;
      }
      const g = hit(t, d, v, gr.a || 0.002);
      node.connect(g); g.connect(out);
      go(s, t, g.__end);
      nodes.push(s);
      return nodes;
    }
    const f0 = (gr.f ? gr.f : A.freqOf(gr.n === undefined ? 69 : gr.n)) * pitch;
    if (gr.i === "fm") {
      const car = osc(gr.w || "sine", f0, t);
      const mod = osc("sine", f0 * (gr.ratio || 2), t);
      const idx = gain(f0 * (gr.index || 2));
      exp(idx.gain, Math.max(1, f0 * (gr.index || 2) * 0.1), t + d);
      mod.connect(idx);
      if (car.frequency) idx.connect(car.frequency);
      if (gr.to !== undefined) exp(car.frequency, A.freqOf(gr.to) * pitch, t + d * 0.95);
      const g = hit(t, d, v, gr.a || 0.003);
      car.connect(g); g.connect(out);
      go(car, t, g.__end); go(mod, t, g.__end);
      nodes.push(car); nodes.push(mod);
      return nodes;
    }
    let wave = gr.w || "square";
    if (wave === "pulse12") wave = pulse(0.125) || "square";
    else if (wave === "pulse25") wave = pulse(0.25) || "square";
    else if (wave === "pulse50") wave = pulse(0.5) || "square";
    const o = osc(wave, f0, t);
    if (gr.to !== undefined) exp(o.frequency, Math.max(20, A.freqOf(gr.to) * pitch), t + d * 0.95);
    else if (gr.toF !== undefined) exp(o.frequency, Math.max(20, gr.toF * pitch), t + d * 0.95);
    let node = o;
    if (gr.lp || gr.hp || gr.bp) {
      const type = gr.bp ? "bandpass" : (gr.hp ? "highpass" : "lowpass");
      const hz = (gr.bp || gr.hp || gr.lp) * pitch;
      const fl = filt(type, hz, gr.q || 1, t);
      if (gr.sweep) exp(fl.frequency, gr.sweep * pitch, t + d);
      o.connect(fl); node = fl;
    }
    const g = gr.sus ? adsr(t, d, gr.a || 0.01, d * 0.3, 0.7, gr.r || 0.06, v) : hit(t, d, v, gr.a || 0.003);
    node.connect(g); g.connect(out);
    if (gr.vib) vibrato(o, t, d, gr.vib, gr.vibHz || 6);
    go(o, t, g.__end);
    nodes.push(o);
    return nodes;
  }

  A.renderPatch = function (grains, out, t0, pitch, volMul) {
    const all = [];
    if (!grains) return all;
    for (let i = 0; i < grains.length; i++) {
      const gr = grains[i];
      const rep = gr.rep;
      const n = rep ? (rep.n || 1) : 1;
      for (let k = 0; k < n; k++) {
        let g2 = gr;
        if (rep && k > 0) {
          g2 = {};
          for (const key in gr) if (Object.prototype.hasOwnProperty.call(gr, key)) g2[key] = gr[key];
          g2.t = (gr.t || 0) + k * (rep.every || 0.08);
          if (rep.dn) g2.n = (gr.n === undefined ? 69 : gr.n) + rep.dn * k;
          if (rep.dv) g2.v = (gr.v === undefined ? 0.5 : gr.v) * Math.pow(rep.dv, k);
          if (rep.dd) g2.d = (gr.d || 0.12) * Math.pow(rep.dd, k);
          g2.rep = null;
        }
        const r = renderGrain(g2, out, t0, pitch, volMul);
        for (let j = 0; j < r.length; j++) all.push(r[j]);
      }
    }
    return all;
  };

  // ---------------------------------------------------------------
  // 6. song compiler
  // ---------------------------------------------------------------
  // Pattern DSL (see docs/design/reports/audio.md):
  //   pitched: whitespace-separated tokens over a step grid
  //     "0 4 7 12:4 . -"   0 = root+track.oct*12, ":n" = n steps long,
  //     "." rest, "-" tie/extend, "0+4+7" chord, "!" accent, "," soft,
  //     "7>12" glide to +12 semitones across the note.
  //   drums: one char per step (no spaces needed): "k.h.s.h."
  //     k K kick, s S snare, p clap, h H hats, z shaker, m t T toms,
  //     c crash, r ride, w woodblock, b bell, x clank, n hiss, d drip, g anvil
  const rxTok = /^([!,]*)([^:>]*)(?:>(-?\d+))?(?::([0-9.]+))?$/;

  A.parsePattern = function (pat, isDrums) {
    const clean = String(pat).replace(/\|/g, " ").trim();
    let toks;
    if (isDrums && clean.indexOf(" ") < 0) toks = clean.split("");
    else toks = clean.split(/\s+/);
    const evs = [];
    let step = 0;
    for (let i = 0; i < toks.length; i++) {
      const raw = toks[i];
      if (!raw) continue;
      const m = rxTok.exec(raw);
      if (!m) { step += 1; continue; }
      const accents = m[1] || "";
      const body = m[2];
      const glide = m[3] === undefined ? null : parseInt(m[3], 10);
      const len = m[4] === undefined ? 1 : parseFloat(m[4]);
      let vel = 1;
      for (let a = 0; a < accents.length; a++) vel *= accents.charAt(a) === "!" ? 1.28 : 0.68;
      if (body === "." || body === "" || body === "_") { step += len; continue; }
      if (body === "-") {
        if (evs.length) evs[evs.length - 1].len += len;
        step += len;
        continue;
      }
      if (isDrums) {
        for (let c = 0; c < body.length; c++) {
          const ch = body.charAt(c);
          if (ch === "." || ch === "-") continue;
          evs.push({ s: step, len: len, drum: ch, vel: vel });
        }
        step += len;
        continue;
      }
      const parts = body.split("+");
      const notes = [];
      let bad = false;
      for (let q = 0; q < parts.length; q++) {
        const v = parseFloat(parts[q]);
        if (isNaN(v)) { bad = true; break; }
        notes.push(v);
      }
      if (bad) { step += len; continue; }
      evs.push({ s: step, len: len, notes: notes, vel: vel, glide: glide });
      step += len;
    }
    return { evs: evs, steps: step };
  };

  function expandSeq(seq) {
    const list = [];
    const parts = (typeof seq === "string") ? seq.replace(/\|/g, " ").trim().split(/\s+/) : (seq || []);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p) continue;
      const star = p.indexOf("*");
      if (star > 0) {
        const name = p.slice(0, star);
        const n = parseInt(p.slice(star + 1), 10) || 1;
        for (let k = 0; k < n; k++) list.push(name);
      } else list.push(p);
    }
    return list;
  }

  function round6(x) { return Math.round(x * 1e6) / 1e6; }

  A.compile = function (song, id) {
    if (!song) return null;
    if (song.__c && song.__c.v === A.COMPILE_VERSION) return song.__c;
    const beats = song.beats || 4;
    const root = A.noteToMidi(song.key === undefined ? "c" : song.key);
    const pats = song.patterns || {};
    const bpm = song.bpm || 110;
    const tracks = [];
    let maxBeat = 0;
    const list = song.tracks || [];
    for (let ti = 0; ti < list.length; ti++) {
      const tr = list[ti];
      const isDrums = tr.inst === "drums" || tr.drums === true;
      const stepBeats = tr.step || 0.25;
      const gate = tr.gate === undefined ? 0.9 : tr.gate;
      const seq = expandSeq(tr.seq);
      const evs = [];
      let beat = 0;
      for (let si = 0; si < seq.length; si++) {
        const nm = seq[si];
        if (nm === "_" || nm === ".") { beat += beats; continue; }
        const pat = pats[nm];
        if (pat === undefined) {
          MQ.warn("[Audio] song " + (id || song.title) + ": unknown pattern '" + nm + "'");
          beat += beats;
          continue;
        }
        const parsed = A.parsePattern(pat, isDrums);
        for (let e = 0; e < parsed.evs.length; e++) {
          const ev = parsed.evs[e];
          const b = round6(beat + ev.s * stepBeats);
          const dur = round6(ev.len * stepBeats * (isDrums ? 1 : gate));
          const out = { b: b, dur: dur, vel: ev.vel };
          if (isDrums) out.drum = ev.drum;
          else {
            const ns = [];
            for (let q = 0; q < ev.notes.length; q++) ns.push(root + (tr.oct || 0) * 12 + ev.notes[q] + (tr.transpose || 0));
            out.notes = ns;
            if (ev.glide !== null && ev.glide !== undefined) out.glide = ns[0] + ev.glide;
          }
          evs.push(out);
        }
        beat = round6(beat + parsed.steps * stepBeats);
      }
      if (beat > maxBeat) maxBeat = beat;
      tracks.push({
        inst: tr.inst || "pulse25", drums: isDrums, vol: tr.vol === undefined ? 1 : tr.vol,
        pan: tr.pan || 0, send: tr.send || 0, layer: tr.layer || 0,
        only: tr.only || null, not: tr.not || null, params: tr.params || null,
        name: tr.id || tr.inst || ("t" + ti), evs: evs, bars: null, len: beat, raw: beat
      });
    }
    let bars = song.bars || Math.ceil((maxBeat - 1e-6) / beats);
    if (bars < 1) bars = 1;
    // A track whose sequence is shorter than the song cycles to fill it
    // (tracker-style ostinato); a longer one is truncated at the song end.
    const songBeats = bars * beats;
    for (let ti3 = 0; ti3 < tracks.length; ti3++) {
      const t3 = tracks[ti3];
      if (!(t3.len > 0) || t3.len >= songBeats - 1e-6) continue;
      const cycle = t3.len;
      const base = t3.evs.length;
      for (let off = cycle; off < songBeats - 1e-6; off = round6(off + cycle)) {
        for (let e = 0; e < base; e++) {
          const ev = t3.evs[e];
          const b = round6(ev.b + off);
          if (b >= songBeats - 1e-6) continue;
          const copy = { b: b, dur: ev.dur, vel: ev.vel };
          if (ev.drum) copy.drum = ev.drum; else { copy.notes = ev.notes; if (ev.glide !== undefined) copy.glide = ev.glide; }
          t3.evs.push(copy);
        }
      }
      t3.evs.sort(function (a, b) { return a.b - b.b; });
      t3.len = songBeats;
    }
    const loop = song.loop === false ? null : {
      from: (song.loop && song.loop.from) || 0,
      to: (song.loop && song.loop.to) || bars
    };
    if (loop && loop.to > bars) loop.to = bars;
    if (loop && loop.from >= loop.to) loop.from = 0;
    // bucket events by bar for allocation-free scheduling
    for (let ti2 = 0; ti2 < tracks.length; ti2++) {
      const t2 = tracks[ti2];
      const buckets = new Array(bars);
      for (let b = 0; b < bars; b++) buckets[b] = null;
      for (let e = 0; e < t2.evs.length; e++) {
        const ev = t2.evs[e];
        const bar = Math.floor(ev.b / beats + 1e-9);
        if (bar < 0 || bar >= bars) continue;
        ev.off = round6(ev.b - bar * beats);
        if (!buckets[bar]) buckets[bar] = [];
        buckets[bar].push(ev);
      }
      t2.bars = buckets;
    }
    const comp = {
      v: A.COMPILE_VERSION, id: id || song.id, title: song.title || id, bpm: bpm, beats: beats,
      bars: bars, root: root, loop: loop, tracks: tracks,
      beatDur: 60 / bpm, barDur: (60 / bpm) * beats,
      totalBeats: bars * beats, swing: song.swing || 0,
      duckable: song.duckable !== false
    };
    song.__c = comp;
    return comp;
  };

  // Pure scheduling maths, exposed for tests: returns the absolute times
  // (seconds from t0) of every note in `nBars` bars starting at `fromBar`,
  // following the song's loop points. No audio nodes are created.
  A.scheduleWindow = function (comp, fromBar, nBars, t0) {
    const out = [];
    let bar = fromBar || 0;
    let t = t0 || 0;
    for (let i = 0; i < nBars; i++) {
      for (let ti = 0; ti < comp.tracks.length; ti++) {
        const tr = comp.tracks[ti];
        const evs = tr.bars[bar];
        if (!evs) continue;
        for (let e = 0; e < evs.length; e++) {
          const ev = evs[e];
          out.push({
            t: round6(t + ev.off * comp.beatDur),
            dur: round6(ev.dur * comp.beatDur),
            track: ti, bar: bar,
            note: ev.notes ? ev.notes[0] : null,
            drum: ev.drum || null,
            vel: ev.vel
          });
        }
      }
      t = round6(t + comp.barDur);
      bar = nextBar(comp, bar);
      if (bar < 0) break;
    }
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
  };

  function nextBar(comp, bar) {
    const b = bar + 1;
    if (comp.loop) {
      if (b >= comp.loop.to) return comp.loop.from;
      return b;
    }
    if (b >= comp.bars) return -1;
    return b;
  }

  // ---------------------------------------------------------------
  // 7. Playback / look-ahead scheduler
  // ---------------------------------------------------------------
  function Playback(id, comp, opts) {
    this.id = id;
    this.comp = comp;
    this.opts = opts || {};
    this.layer = this.opts.layer === undefined ? 99 : this.opts.layer;
    this.variant = this.opts.variant || null;
    this.bar = this.opts.fromBar || 0;
    this.nextTime = 0;
    this.nodes = [];
    this.stopped = false;
    this.done = false;
    this.endsAt = 0;
    this.iterations = 0;
    this.bus = gain(0);
    this.bus.connect(bus.music);
    this.chans = [];
    for (let i = 0; i < comp.tracks.length; i++) {
      const tr = comp.tracks[i];
      const g = gain(tr.vol * (this.trackOn(tr) ? 1 : 0));
      let node = g;
      if (tr.pan && ctx.createStereoPanner) {
        const pn = ctx.createStereoPanner();
        setV(pn.pan, tr.pan, 0);
        g.connect(pn);
        node = pn;
      }
      node.connect(this.bus);
      if (tr.send && bus.fx) {
        const sg = gain(tr.send);
        node.connect(sg);
        sg.connect(bus.fx);
      }
      this.chans.push(g);
    }
  }

  Playback.prototype.trackOn = function (tr) {
    if (tr.layer > this.layer) return false;
    if (tr.only) {
      let ok = false;
      for (let i = 0; i < tr.only.length; i++) if (tr.only[i] === this.variant) ok = true;
      if (!ok) return false;
    }
    if (tr.not && this.variant) {
      for (let i = 0; i < tr.not.length; i++) if (tr.not[i] === this.variant) return false;
    }
    return true;
  };

  Playback.prototype.refreshTracks = function (t, ms) {
    for (let i = 0; i < this.comp.tracks.length; i++) {
      const tr = this.comp.tracks[i];
      const target = this.trackOn(tr) ? tr.vol : 0;
      const p = this.chans[i].gain;
      cancel(p, t);
      setV(p, p.value === undefined ? target : p.value, t);
      lin(p, target, t + (ms || 400) / 1000);
    }
  };

  Playback.prototype.start = function (t, fadeMs) {
    this.t0 = t;
    this.sched = 0;
    this.nextTime = t;
    const p = this.bus.gain;
    setV(p, fadeMs ? 0.0001 : 1, t);
    if (fadeMs) lin(p, 1, t + fadeMs / 1000);
    this.pump(now());
  };

  Playback.prototype.pump = function (nowT) {
    if (this.stopped || this.done) return;
    const comp = this.comp;
    const bd = comp.barDur;
    // Catch-up: a suspended tab can leave nextTime far in the past. Skip
    // whole bars (keeping the loop shape) rather than scheduling backwards.
    if (this.nextTime < nowT - 0.02) {
      const skip = Math.ceil((nowT + 0.02 - this.nextTime) / bd);
      if (skip > 0) {
        for (let i = 0; i < skip; i++) {
          const nb = nextBar(comp, this.bar);
          if (nb < 0) { this.finish(this.nextTime); return; }
          this.bar = nb;
        }
        // Stay on the exact bar grid: the horizon is always t0 + n*barDur,
        // never an accumulation of rounded additions.
        this.sched += skip;
        this.nextTime = this.t0 + this.sched * bd;
      }
    }
    let barsQueued = Math.max(0, Math.floor((this.nextTime - nowT) / bd));
    let guard = 0;
    while ((barsQueued < A.MIN_BARS_AHEAD || this.nextTime < nowT + A.LOOKAHEAD) && guard++ < 96) {
      this.scheduleBar(this.bar, this.nextTime);
      this.sched++;
      this.nextTime = this.t0 + this.sched * bd;
      barsQueued++;
      const nb = nextBar(comp, this.bar);
      if (nb < 0) { this.finish(this.nextTime); return; }
      if (comp.loop && nb === comp.loop.from && this.bar >= comp.loop.to - 1) this.iterations++;
      this.bar = nb;
    }
    this.prune(nowT);
  };

  Playback.prototype.scheduleBar = function (bar, t) {
    const comp = this.comp;
    const bd = comp.beatDur;
    const swing = comp.swing;
    for (let ti = 0; ti < comp.tracks.length; ti++) {
      const tr = comp.tracks[ti];
      const evs = tr.bars[bar];
      if (!evs) continue;
      if (!this.trackOn(tr)) continue;
      const out = this.chans[ti];
      const inst = tr.drums ? null : (INST[tr.inst] || INST.pulse25);
      for (let e = 0; e < evs.length; e++) {
        const ev = evs[e];
        let off = ev.off;
        if (swing) {
          const eighth = off / 0.5;
          if (Math.abs(eighth - Math.round(eighth)) < 1e-6 && Math.round(eighth) % 2 === 1) off += swing * 0.5;
        }
        const at = t + off * bd;
        if (at < now() - 0.05) continue;
        const dur = Math.max(0.02, ev.dur * bd);
        if (tr.drums) {
          const fn = DRUM[ev.drum];
          if (!fn) continue;
          const r = fn(at, ev.vel, out);
          this.track(r, at + dur + 1.4);
        } else {
          for (let n = 0; n < ev.notes.length; n++) {
            const p = tr.params;
            const par = ev.glide !== undefined && n === 0 ? { glideTo: ev.glide, ratio: p && p.ratio, index: p && p.index, vib: p && p.vib, vibHz: p && p.vibHz } : p;
            const r = inst(at, A.freqOf(ev.notes[n]), dur, ev.vel, out, par);
            this.track(r, at + dur + 2.2);
          }
        }
      }
    }
  };

  Playback.prototype.track = function (nodes, until) {
    if (!nodes) return;
    for (let i = 0; i < nodes.length; i++) this.nodes.push({ n: nodes[i], until: until });
    if (until > this.endsAt) this.endsAt = until;
  };

  Playback.prototype.prune = function (nowT) {
    const keep = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].until > nowT - 0.1) keep.push(this.nodes[i]);
    }
    this.nodes = keep;
  };

  Playback.prototype.finish = function (t) {
    this.done = true;
    this.endTime = t;
  };

  // Cancel every scheduled node. Nodes already sounding get a short
  // release through the bus so we never click.
  Playback.prototype.stop = function (fadeMs) {
    if (this.stopped) return;
    this.stopped = true;
    const t = now();
    const fade = (fadeMs || 0) / 1000;
    const p = this.bus.gain;
    cancel(p, t);
    if (fade > 0) { setV(p, p.value === undefined ? 1 : p.value, t); lin(p, 0.0001, t + fade); }
    else setV(p, 0.0001, t);
    const cut = t + fade + 0.02;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i].n;
      if (n && n.stop) { try { n.stop(cut); } catch (e) { /* already stopped */ } }
    }
    this.deadAt = cut + 0.2;
  };

  Playback.prototype.dispose = function () {
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i].n;
      if (n && n.disconnect) { try { n.disconnect(); } catch (e) { /* */ } }
    }
    this.nodes.length = 0;
    for (let c = 0; c < this.chans.length; c++) { try { this.chans[c].disconnect(); } catch (e) { /* */ } }
    try { this.bus.disconnect(); } catch (e) { /* */ }
  };

  A.Playback = Playback;

  // ---------------------------------------------------------------
  //   ticker
  // ---------------------------------------------------------------
  function startTicker() {
    if (ticker) return;
    ticker = setInterval(A.tick, A.TICK_MS);
  }
  function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }
  A.stopTicker = stopTicker;

  A.tick = function () {
    if (!A.ready) return;
    const t = now();
    if (playing) {
      playing.pump(t);
      if (playing.done && t > playing.endTime) {
        const p = playing;
        playing = null;
        A.current = null;
        p.stop(60);
        fading.push(p);
        if (p.opts.then) A.playSong(p.opts.then, { fade: 400 });
        else if (p.resumeTo) A.playSong(p.resumeTo.id, { fade: 500, fromBar: 0, layer: p.resumeTo.layer, variant: p.resumeTo.variant });
        if (MQ.Events) MQ.Events.emit("song:end", { id: p.id });
      }
    }
    for (let i = fading.length - 1; i >= 0; i--) {
      if (t > (fading[i].deadAt || 0)) { fading[i].dispose(); fading.splice(i, 1); }
    }
    if (ambient) ambient.pump(t);
    if (sfxVoices.length) {
      const keep = [];
      for (let j = 0; j < sfxVoices.length; j++) if (sfxVoices[j].until > t) keep.push(sfxVoices[j]);
      sfxVoices = keep;
    }
    if (duckUntil && t > duckUntil) {
      duckUntil = 0;
      const p = bus.music.gain;
      cancel(p, t); setV(p, p.value === undefined ? A.vol.music : p.value, t);
      lin(p, A.muted ? 0 : A.vol.music, t + 0.25);
    }
  };

  A.resync = function () {
    if (playing) { playing.nextTime = Math.max(playing.nextTime, now() + 0.05); }
    A.tick();
  };

  // ---------------------------------------------------------------
  // 8. public API — music
  // ---------------------------------------------------------------
  function songData(id) {
    if (!MQ.Songs) return null;
    if (MQ.Songs.get) return MQ.Songs.get(id);
    return MQ.Songs[id] || null;
  }

  A.hasSong = function (id) { return !!songData(id); };

  A.playSong = function (id, opts) {
    opts = opts || {};
    if (!id) return A.stopSong(opts);
    if (!A.ready) {
      if (!A.init()) { A.pending = { id: id, opts: opts }; return false; }
    }
    if (A.failed) return false;
    if (!A.unlocked && ctx && ctx.state === "suspended") { A.pending = { id: id, opts: opts }; A.current = id; return false; }
    const song = songData(id);
    if (!song) { MQ.warn("[Audio] unknown song '" + id + "'"); return false; }
    if (playing && playing.id === id && !opts.restart && !playing.stopped && !playing.done) {
      // already playing: just retune the arrangement
      let changed = false;
      if (opts.layer !== undefined && opts.layer !== playing.layer) { playing.layer = opts.layer; changed = true; }
      if (opts.variant !== undefined && opts.variant !== playing.variant) { playing.variant = opts.variant; changed = true; }
      if (changed) playing.refreshTracks(now(), opts.crossMs || 600);
      return true;
    }
    const comp = A.compile(song, id);
    const fade = opts.fade === undefined ? 500 : opts.fade;
    const prev = playing;
    if (prev) {
      prev.stop(fade);
      fading.push(prev);
    }
    const pb = new Playback(id, comp, opts);
    if (opts.resume && prev && !prev.done) pb.resumeTo = { id: prev.id, layer: prev.layer, variant: prev.variant };
    playing = pb;
    A.current = id;
    pb.start(now() + 0.06, fade);
    if (MQ.Events) MQ.Events.emit("song", { id: id, variant: pb.variant, layer: pb.layer });
    return true;
  };
  A.play = A.playSong;

  A.stopSong = function (opts) {
    opts = opts || {};
    const fade = opts.fade === undefined ? 350 : opts.fade;
    A.pending = null;
    A.current = null;
    if (playing) { playing.stop(fade); fading.push(playing); playing = null; }
    return true;
  };

  // Play a one-shot stinger, then return to whatever was playing.
  A.jingle = function (id, opts) {
    opts = opts || {};
    const prev = playing;
    const back = opts.then !== undefined ? opts.then : (prev ? prev.id : null);
    const layer = prev ? prev.layer : undefined;
    const variant = prev ? prev.variant : undefined;
    const ok = A.playSong(id, { fade: opts.fade === undefined ? 120 : opts.fade, restart: true, then: back });
    if (ok && playing && back) playing.resumeTo = { id: back, layer: layer, variant: variant };
    return ok;
  };
  A.fanfare = A.jingle;

  A.songBar = function () { return playing ? playing.bar : -1; };
  A.playback = function () { return playing; };   // test/debug hook
  A.playingId = function () { return playing ? playing.id : null; };
  A.isPlaying = function (id) { return !!playing && (!id || playing.id === id); };

  A.setLayer = function (n, ms) {
    if (!playing) return;
    playing.layer = n;
    playing.refreshTracks(now(), ms === undefined ? 700 : ms);
  };
  A.setPhase = A.setLayer;
  A.setVariant = function (v, ms) {
    if (!playing) return;
    playing.variant = v;
    playing.refreshTracks(now(), ms === undefined ? 700 : ms);
  };

  // ---------------------------------------------------------------
  //   mixer / settings
  // ---------------------------------------------------------------
  const BUS_OF = { master: "master", music: "music", sfx: "sfx", cry: "cry", ambience: "amb" };

  A.setVolume = function (kind, v) {
    if (v === undefined) { v = kind; kind = "master"; }
    if (!Object.prototype.hasOwnProperty.call(A.vol, kind)) return;
    v = Math.max(0, Math.min(1, +v || 0));
    A.vol[kind] = v;
    if (A.ready && bus) {
      const b = bus[BUS_OF[kind]];
      const t = now();
      if (b) { cancel(b.gain, t); setV(b.gain, (A.muted && kind === "master") ? 0 : v, t); }
    }
    A.savePrefs();
    return v;
  };
  A.getVolume = function (kind) { return A.vol[kind || "master"]; };

  A.mute = function (on) {
    A.muted = on === undefined ? !A.muted : !!on;
    if (A.ready && bus) {
      const t = now();
      cancel(bus.master.gain, t);
      lin(bus.master.gain, A.muted ? 0.0001 : A.vol.master, t + 0.08);
    }
    A.savePrefs();
    return A.muted;
  };
  A.isMuted = function () { return A.muted; };

  // Duck the music under an important sound (catches, cries, cutscenes).
  A.duck = function (amount, ms) {
    if (!A.ready) return;
    const t = now();
    const depth = amount === undefined ? 0.45 : amount;
    const hold = (ms === undefined ? 320 : ms) / 1000;
    const p = bus.music.gain;
    cancel(p, t);
    setV(p, A.vol.music, t);
    lin(p, A.vol.music * (1 - depth), t + 0.05);
    duckUntil = t + hold;
  };

  const PREF_KEY = "mq2_audio";
  A.savePrefs = function () {
    try {
      if (!window.localStorage) return;
      window.localStorage.setItem(PREF_KEY, JSON.stringify({ vol: A.vol, muted: A.muted }));
    } catch (e) { /* private mode */ }
  };
  A.loadPrefs = function () {
    try {
      if (!window.localStorage) return;
      const raw = window.localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      if (o && o.vol) for (const k in A.vol) if (typeof o.vol[k] === "number") A.vol[k] = o.vol[k];
      if (o && typeof o.muted === "boolean") A.muted = o.muted;
      A.pushVolumes();
    } catch (e) { /* corrupt */ }
  };
  A.pushVolumes = function () {
    if (!A.ready || !bus) return;
    const t = now();
    setV(bus.master.gain, A.muted ? 0 : A.vol.master, t);
    setV(bus.music.gain, A.vol.music, t);
    setV(bus.sfx.gain, A.vol.sfx, t);
    setV(bus.cry.gain, A.vol.cry, t);
    setV(bus.amb.gain, A.vol.ambience, t);
  };

  // MQ.Settings.apply() (js/content/state.js) reaches for these two by name,
  // and the pause menu passes 0-10 sliders, so accept either scale.
  function volArg(v) {
    v = +v;
    if (isNaN(v)) return null;
    if (v > 1.5) v = v / 10;
    return Math.max(0, Math.min(1, v));
  }
  A.setMusicVolume = function (v) {
    const n = volArg(v);
    if (n === null) return false;
    A.setVolume("music", n);
    return true;
  };
  A.setSfxVolume = function (v) {
    const n = volArg(v);
    if (n === null) return false;
    A.setVolume("sfx", n);
    A.setVolume("cry", Math.min(1, n * 1.05));
    A.setVolume("ambience", n * 0.5);
    return true;
  };

  // MQ.Settings is owned by the ui/content teams; read it defensively.
  A.applySettings = function () {
    const S = MQ.Settings;
    if (!S) return;
    const read = function (keys) {
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        let v;
        if (S.get) { try { v = S.get(k); } catch (e) { v = undefined; } }
        if (v === undefined && S.values) v = S.values[k];
        if (v === undefined && S.data) v = S.data[k];
        if (v === undefined) v = S[k];
        if (v !== undefined && v !== null) return v;
      }
      return undefined;
    };
    const norm = function (v) {
      if (typeof v === "boolean") return v ? 1 : 0;
      v = +v;
      if (isNaN(v)) return undefined;
      if (v > 1.5) return Math.max(0, Math.min(1, v / 10));
      return Math.max(0, Math.min(1, v));
    };
    const m = norm(read(["music", "musicVolume", "music_vol", "bgm"]));
    const s = norm(read(["sfx", "sfxVolume", "sfx_vol", "sound"]));
    const g = norm(read(["master", "masterVolume", "volume"]));
    if (m !== undefined) A.setVolume("music", m);
    if (s !== undefined) { A.setVolume("sfx", s); A.setVolume("cry", Math.min(1, s * 1.05)); A.setVolume("ambience", s * 0.5); }
    if (g !== undefined) A.setVolume("master", g);
    const mu = read(["mute", "muted", "audioOff"]);
    if (mu !== undefined && typeof mu === "boolean") A.mute(mu);
  };

  A.saveProvider = {
    save: function () { return { vol: A.vol, muted: A.muted }; },
    load: function (o) {
      if (!o) return;
      if (o.vol) for (const k in A.vol) if (typeof o.vol[k] === "number") A.vol[k] = o.vol[k];
      if (typeof o.muted === "boolean") A.muted = o.muted;
      A.pushVolumes();
    }
  };

  // ---------------------------------------------------------------
  //   SFX
  // ---------------------------------------------------------------
  function sfxSpec(id) {
    if (!MQ.SFX) return null;
    if (MQ.SFX.get) return MQ.SFX.get(id);
    return MQ.SFX[id] || null;
  }

  A.sfx = function (id, opts) {
    if (!id) return false;
    if (!A.ready) { if (!A.init()) return false; }
    if (A.failed || A.muted) return false;
    const spec = sfxSpec(id);
    if (!spec) { if (MQ.DEV) MQ.warn("[Audio] unknown sfx '" + id + "'"); return false; }
    opts = opts || {};
    const t = now();
    const gapKey = spec.id || id;
    const gap = spec.minGap === undefined ? 0.015 : spec.minGap;
    if (lastSfxAt[gapKey] !== undefined && t - lastSfxAt[gapKey] < gap) return false;
    lastSfxAt[gapKey] = t;
    if (sfxVoices.length >= A.MAX_SFX_VOICES) return false;
    const pitch = (opts.pitch === undefined ? 1 : opts.pitch) * (spec.pitch || 1) * (spec.rand ? (1 + (Math.random() - 0.5) * spec.rand) : 1);
    const vol = (opts.vol === undefined ? 1 : opts.vol) * (spec.vol === undefined ? 1 : spec.vol);
    let out = bus.sfx;
    if (opts.bus === "cry") out = bus.cry;
    else if (opts.bus === "ambience") out = bus.amb;
    let node = out;
    if (opts.pan && ctx.createStereoPanner) {
      const pn = ctx.createStereoPanner();
      setV(pn.pan, opts.pan, t);
      pn.connect(out);
      node = pn;
    }
    const t0 = t + (opts.when || 0) + 0.005;
    const nodes = A.renderPatch(spec.grains, node, t0, pitch, vol);
    const dur = (spec.dur || 0.6) + (opts.when || 0);
    sfxVoices.push({ id: id, until: t0 + dur + 0.2, nodes: nodes });
    const duck = opts.duck === undefined ? spec.duck : opts.duck;
    if (duck) A.duck(duck === true ? 0.45 : duck, spec.duckMs || 400);
    return true;
  };
  A.play_sfx = A.sfx;

  A.stopSfx = function () {
    const t = now();
    for (let i = 0; i < sfxVoices.length; i++) {
      const v = sfxVoices[i];
      for (let j = 0; j < v.nodes.length; j++) if (v.nodes[j] && v.nodes[j].stop) { try { v.nodes[j].stop(t); } catch (e) { /* */ } }
    }
    sfxVoices.length = 0;
  };

  // ---------------------------------------------------------------
  //   creature cries — procedural, seeded by species id, typed flavour
  // ---------------------------------------------------------------
  const CRY_TYPE = {
    normal:   { w: "pulse25", bend: 4, seg: 3, noise: 0.05, ratio: 2, rough: 0.2, base: 66 },
    fire:     { w: "sawtooth", bend: -7, seg: 4, noise: 0.35, ratio: 3.1, rough: 0.5, base: 64 },
    water:    { w: "sine", bend: 9, seg: 3, noise: 0.12, ratio: 1.5, rough: 0.15, base: 68 },
    grass:    { w: "triangle", bend: 5, seg: 4, noise: 0.1, ratio: 2.5, rough: 0.25, base: 70 },
    electric: { w: "pulse12", bend: 12, seg: 5, noise: 0.2, ratio: 4.7, rough: 0.6, base: 74 },
    flying:   { w: "sine", bend: 14, seg: 4, noise: 0.08, ratio: 2.02, rough: 0.3, base: 78 },
    bug:      { w: "pulse12", bend: 2, seg: 6, noise: 0.3, ratio: 5.3, rough: 0.7, base: 80 },
    poison:   { w: "sawtooth", bend: -5, seg: 3, noise: 0.4, ratio: 1.41, rough: 0.55, base: 62 },
    rock:     { w: "square", bend: -9, seg: 2, noise: 0.45, ratio: 1.19, rough: 0.5, base: 54 },
    ground:   { w: "triangle", bend: -11, seg: 2, noise: 0.5, ratio: 1.26, rough: 0.4, base: 52 },
    psychic:  { w: "sine", bend: 7, seg: 5, noise: 0.05, ratio: 3.53, rough: 0.35, base: 76 },
    ghost:    { w: "triangle", bend: -3, seg: 4, noise: 0.25, ratio: 2.83, rough: 0.45, base: 60 },
    cyber:    { w: "pulse25", bend: 11, seg: 6, noise: 0.15, ratio: 6.1, rough: 0.8, base: 72 }
  };
  A.CRY_TYPE = CRY_TYPE;

  function hashStr(s) {
    if (MQ.U && MQ.U.hash) return MQ.U.hash(s);
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function rngOf(seed) {
    if (MQ.U && MQ.U.mulberry32) return MQ.U.mulberry32(seed);
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Deterministic per species: same id always gives the same cry.
  A.cryPlan = function (speciesId, opts) {
    opts = opts || {};
    const sp = (MQ.Data && MQ.Data.species) ? MQ.Data.species[speciesId] : null;
    let type = opts.type || (sp && sp.types && sp.types[0]) || null;
    if (!type || !CRY_TYPE[type]) {
      const tk = Object.keys(CRY_TYPE);
      type = tk[hashStr(speciesId) % tk.length];
    }
    const F = CRY_TYPE[type];
    const seed = hashStr("cry:" + speciesId);
    const rnd = rngOf(seed);
    // Bigger, heavier creatures growl lower.
    let weight = 0;
    if (sp && sp.base) weight = ((sp.base.hp || 60) + (sp.base.atk || 60) + (sp.base.def || 60)) / 3;
    const size = weight ? Math.max(-14, Math.min(10, (70 - weight) * 0.22)) : (rnd() * 10 - 5);
    const segs = Math.max(2, F.seg + Math.floor(rnd() * 3) - 1);
    // The data team hands every species a `cry` block (ROSTER §1: wave, base
    // Hz, len ms, slide Hz, noise, vib, gain). Honour it when it is there and
    // let the type flavour only colour the bends; fall back to the derived
    // shape when a species (or a test stub) has none.
    const cd = (sp && sp.cry) ? sp.cry : null;
    const total = cd && cd.len ? Math.max(0.16, Math.min(1.1, cd.len / 1000)) : 0.34 + rnd() * 0.3;
    const plan = {
      type: type, wave: (cd && cd.wave) || F.w, segs: [], dur: opts.dur || total,
      noise: cd ? (cd.noise * 0.65 + F.noise * 0.35) : F.noise,
      ratio: F.ratio + rnd() * 0.8, rough: F.rough,
      vib: cd && cd.vib ? cd.vib : 0,
      gain: cd && cd.gain ? Math.max(0.55, Math.min(1.45, cd.gain / 0.3)) : 1
    };
    let note = clampNote(cd
      ? midiOfFreq(cd.base) + Math.floor(rnd() * 3) - 1
      : F.base + size + Math.floor(rnd() * 7) - 3);
    // A positive `slide` rises, a negative one droops; walk there over the segs.
    const target = cd && cd.slide ? clampNote(midiOfFreq(Math.max(55, cd.base + cd.slide))) : null;
    const dseg = plan.dur / segs;
    for (let i = 0; i < segs; i++) {
      const dir = i === 0 ? 1 : (rnd() < 0.55 ? 1 : -1);
      const jump = Math.round((rnd() * F.bend * dir) * 0.7);
      let nn;
      if (i === 0) nn = note;
      else if (target !== null) nn = clampNote(Math.round(note + (target - note) / (segs - i) + jump * 0.45));
      else nn = clampNote(note + jump);
      plan.segs.push({ n: nn, t: i * dseg, d: dseg * (0.85 + rnd() * 0.5), v: (0.55 - i * 0.045 + rnd() * 0.1) * plan.gain });
      note = nn;
    }
    return plan;
  };

  function clampNote(n) { return Math.max(28, Math.min(104, Math.round(n))); }
  function midiOfFreq(hz) { return 69 + 12 * Math.log(Math.max(20, hz) / 440) / Math.LN2; }

  A.cry = function (speciesId, opts) {
    if (!speciesId) return false;
    if (!A.ready) { if (!A.init()) return false; }
    if (A.failed || A.muted) return false;
    opts = opts || {};
    const plan = A.cryPlan(speciesId, opts);
    const t0 = now() + 0.01;
    const pitch = opts.pitch === undefined ? 1 : opts.pitch;
    const vol = opts.vol === undefined ? 1 : opts.vol;
    const grains = [];
    for (let i = 0; i < plan.segs.length; i++) {
      const s = plan.segs[i];
      const next = plan.segs[i + 1];
      grains.push({
        i: plan.rough > 0.45 ? "fm" : "osc", w: plan.wave, n: s.n, to: next ? next.n : s.n - 2,
        t: s.t, d: s.d, v: s.v * 0.7, ratio: plan.ratio, index: plan.rough * 3,
        vib: plan.vib ? 6 + plan.vib * 2.4 : (plan.rough > 0.3 ? 20 * plan.rough : 0),
        vibHz: 9 + plan.rough * 12, a: 0.006
      });
    }
    if (plan.noise > 0.08) {
      grains.push({ i: "noise", bp: 900 + plan.noise * 2600, q: 1.6, t: 0, d: plan.dur * 0.7, v: plan.noise * 0.22, sweep: 400, pink: true });
    }
    A.renderPatch(grains, bus.cry, t0, pitch, vol);
    sfxVoices.push({ id: "cry", until: t0 + plan.dur + 0.4, nodes: [] });
    if (opts.duck !== false) A.duck(0.35, 300);
    return true;
  };

  // ---------------------------------------------------------------
  //   ambience beds (map `ambience:` field)
  // ---------------------------------------------------------------
  const AMB = {
    town:       { bed: { lp: 700, v: 0.05, pink: true }, spark: ["b", "w"], every: [2.5, 7], vol: 0.25 },
    forest:     { bed: { lp: 1400, v: 0.06, pink: true }, spark: ["b"], every: [1.6, 5], vol: 0.3, chirp: true },
    water:      { bed: { lp: 1100, v: 0.09, pink: true }, spark: ["d"], every: [1.2, 3.4], vol: 0.32 },
    cave:       { bed: { lp: 320, v: 0.1, pink: true }, spark: ["d", "d", "g"], every: [1.8, 6], vol: 0.35 },
    moor:       { bed: { lp: 620, v: 0.11, pink: true }, spark: ["b"], every: [4, 11], vol: 0.3 },
    industrial: { bed: { lp: 480, v: 0.09, pink: false }, spark: ["x", "n"], every: [1.4, 4.5], vol: 0.28 },
    marsh:      { bed: { lp: 520, v: 0.09, pink: true }, spark: ["d", "b"], every: [1.5, 5], vol: 0.3 },
    rail:       { bed: { lp: 400, v: 0.07, pink: false }, spark: ["x", "x", "n"], every: [1.1, 3], vol: 0.3 },
    server:     { bed: { lp: 900, v: 0.08, pink: false }, spark: ["w"], every: [3, 9], vol: 0.3 },
    sea:        { bed: { lp: 950, v: 0.12, pink: true }, spark: [], every: [4, 9], vol: 0.34 }
  };
  A.AMBIENCES = AMB;

  function Ambient(kind, def) {
    this.kind = kind;
    this.def = def;
    this.nextSpark = 0;
    this.nodes = [];
    this.bus = gain(0);
    this.bus.connect(bus.amb);
    const t = now();
    lin(this.bus.gain, def.vol, t + 1.2);
    const s = src(def.bed.pink ? pinkBuf : noiseBuf, t, 1, true);
    const f = filt("lowpass", def.bed.lp, 0.9, t);
    const g = gain(def.bed.v);
    s.connect(f); f.connect(g); g.connect(this.bus);
    // slow filter breathing so the bed never sits still
    if (ctx.createOscillator) {
      const lfo = osc("sine", 0.06 + Math.random() * 0.05, t);
      const amt = gain(def.bed.lp * 0.35);
      lfo.connect(amt);
      if (f.frequency) amt.connect(f.frequency);
      go(lfo, t, t + 3600);
      this.nodes.push(lfo);
    }
    if (s.start) { try { s.start(t); } catch (e) { /* */ } }
    this.nodes.push(s);
    this.bed = s;
  }
  Ambient.prototype.pump = function (t) {
    const d = this.def;
    if (!d.spark || !d.spark.length) return;
    if (!this.nextSpark) this.nextSpark = t + d.every[0];
    let guard = 0;
    while (this.nextSpark < t + 1.5 && guard++ < 8) {
      const ch = d.spark[(Math.random() * d.spark.length) | 0];
      const fn = DRUM[ch];
      if (fn) fn(this.nextSpark, 0.35 + Math.random() * 0.4, this.bus);
      if (d.chirp && Math.random() < 0.4) {
        A.renderPatch([{ i: "osc", w: "sine", n: 92 + ((Math.random() * 8) | 0), to: 99, t: 0, d: 0.07, v: 0.1, rep: { n: 2 + ((Math.random() * 3) | 0), every: 0.09, dn: 2 } }], this.bus, this.nextSpark, 1, 1);
      }
      this.nextSpark += d.every[0] + Math.random() * (d.every[1] - d.every[0]);
    }
  };
  Ambient.prototype.stop = function (fadeMs) {
    const t = now();
    cancel(this.bus.gain, t);
    lin(this.bus.gain, 0.0001, t + (fadeMs || 600) / 1000);
    const cut = t + (fadeMs || 600) / 1000 + 0.05;
    for (let i = 0; i < this.nodes.length; i++) if (this.nodes[i].stop) { try { this.nodes[i].stop(cut); } catch (e) { /* */ } }
  };

  A.ambience = function (kind, opts) {
    if (!A.ready) { if (!A.init()) return false; }
    opts = opts || {};
    if (ambient && ambient.kind === kind) return true;
    if (ambient) { ambient.stop(opts.fade); ambient = null; }
    if (!kind || kind === "none") return true;
    const def = AMB[kind];
    if (!def) return false;
    ambient = new Ambient(kind, def);
    ambient.pump(now());
    return true;
  };
  A.ambienceId = function () { return ambient ? ambient.kind : null; };

  // ---------------------------------------------------------------
  //   diagnostics
  // ---------------------------------------------------------------
  A.stats = function () {
    return {
      ready: A.ready, unlocked: A.unlocked, muted: A.muted, current: A.current,
      bar: playing ? playing.bar : -1, iterations: playing ? playing.iterations : 0,
      nodes: playing ? playing.nodes.length : 0, fading: fading.length,
      sfxVoices: sfxVoices.length, ambience: ambient ? ambient.kind : null,
      songs: MQ.Songs && MQ.Songs.ids ? MQ.Songs.ids().length : 0,
      sfx: MQ.SFX && MQ.SFX.ids ? MQ.SFX.ids().length : 0
    };
  };

  // Test hook: drop all playback state without touching the context.
  A.reset = function () {
    if (playing) { playing.stop(0); playing.dispose(); playing = null; }
    for (let i = 0; i < fading.length; i++) fading[i].dispose();
    fading.length = 0;
    if (ambient) { ambient.stop(0); ambient = null; }
    sfxVoices.length = 0;
    lastSfxAt = {};
    A.current = null;
    A.pending = null;
  };
})();
