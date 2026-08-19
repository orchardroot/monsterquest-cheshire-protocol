// =============================================================
// MonsterQuest v2 — js/art/fx.js   (art workstream)
//
// MQ.FX — weather layers, day/night lighting, particles, screen
// effects and battle move animations.
//
// Public API
//   Weather   setWeather(kind, opts) · weather · weatherStrength ·
//             drawWeather(ctx) · WEATHERS
//   Lighting  light(x, y, r, colour, strength)  (per frame, pooled)
//             drawLighting(ctx, {phase, indoor, alpha})
//   Particles spawn(kind, x, y, opts) · burst(kind, x, y, n, opts) ·
//             drawParticles(ctx) · particleCount() · KINDS
//   Screen    shake(ms, amp) · flash(ms, colour) · shakeOffset() ·
//             hitStop(ms) · stopped()
//   Battle    battleAnim(kind, ctx, from, to, t, opts) · ANIMS
//   Frame     update(dt) · draw(ctx, opts) · reset() · stats()
//
// Everything in the per-frame path is pre-allocated: the weather pools,
// the particle pool and the light ring buffer are sized at load and
// reused. Nothing in update()/draw() allocates.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const FX = {};
  const TAU = Math.PI * 2;

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
    return c;
  }
  function viewW() { return (MQ.View && MQ.View.w) || 960; }
  function viewH() { return (MQ.View && MQ.View.h) || 540; }

  // =================================================================
  // 1. Weather
  // =================================================================
  FX.WEATHERS = ["clear", "rain", "fog", "wind", "sun", "snow"];

  const RAIN_N = 180, SNOW_N = 140, LEAF_N = 44, SPLASH_N = 40, SHAFT_N = 6, BANK_N = 7;
  // rain: x, y, speed, length
  const rx = new Float32Array(RAIN_N), ry = new Float32Array(RAIN_N),
        rs = new Float32Array(RAIN_N), rl = new Float32Array(RAIN_N);
  // splashes: x, y, life
  const sx = new Float32Array(SPLASH_N), sy = new Float32Array(SPLASH_N), sl = new Float32Array(SPLASH_N);
  let splashHead = 0;
  // snow: x, y, drift phase, size
  const nx = new Float32Array(SNOW_N), ny = new Float32Array(SNOW_N),
        np = new Float32Array(SNOW_N), nz = new Float32Array(SNOW_N);
  // leaves: x, y, vx, vy, spin
  const lx = new Float32Array(LEAF_N), ly = new Float32Array(LEAF_N),
        lvx = new Float32Array(LEAF_N), lvy = new Float32Array(LEAF_N),
        lr = new Float32Array(LEAF_N), lk = new Uint8Array(LEAF_N);
  // fog banks: x, y, scale, alpha
  const fx_ = new Float32Array(BANK_N), fy_ = new Float32Array(BANK_N),
        fsc = new Float32Array(BANK_N), fal = new Float32Array(BANK_N), fsp = new Float32Array(BANK_N);
  // sun shafts: x, width, alpha
  const shx = new Float32Array(SHAFT_N), shw = new Float32Array(SHAFT_N), sha = new Float32Array(SHAFT_N);

  const LEAF_COLS = ["#7a8a3a", "#a8632a", "#c9963a", "#5a7a38"];

  const wrnd = U.rng("mq-weather");
  (function seedPools() {
    const W = 1200, H = 700;
    for (let i = 0; i < RAIN_N; i++) { rx[i] = wrnd() * W; ry[i] = wrnd() * H; rs[i] = 620 + wrnd() * 420; rl[i] = 10 + wrnd() * 16; }
    for (let i = 0; i < SNOW_N; i++) { nx[i] = wrnd() * W; ny[i] = wrnd() * H; np[i] = wrnd() * TAU; nz[i] = 1 + wrnd() * 2.2; }
    for (let i = 0; i < LEAF_N; i++) { lx[i] = wrnd() * W; ly[i] = wrnd() * H; lvx[i] = 90 + wrnd() * 150; lvy[i] = -20 + wrnd() * 70; lr[i] = wrnd() * TAU; lk[i] = (wrnd() * 4) | 0; }
    for (let i = 0; i < BANK_N; i++) { fx_[i] = wrnd() * W; fy_[i] = 140 + wrnd() * 380; fsc[i] = 1.4 + wrnd() * 2.2; fal[i] = 0.16 + wrnd() * 0.20; fsp[i] = 8 + wrnd() * 22; }
    for (let i = 0; i < SHAFT_N; i++) { shx[i] = wrnd() * W; shw[i] = 40 + wrnd() * 90; sha[i] = 0.05 + wrnd() * 0.07; }
  })();

  // pre-rendered fog bank (built once, drawn many times)
  let fogSprite = null;
  function fogBank() {
    if (fogSprite) return fogSprite;
    const w = 128, h = 48;
    const c = makeCanvas(w, h), g = c.getContext("2d");
    const r = U.rng("fog");
    g.fillStyle = "#ffffff";
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = h * 0.5 + (r() - 0.5) * h * 0.7, rad = 6 + r() * 16;
      g.globalAlpha = 0.05 + r() * 0.08;
      g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    fogSprite = c;
    return c;
  }
  // pre-rendered radial light (concentric rings, no gradients needed)
  let lightSprite = null;
  function lightDisc() {
    if (lightSprite) return lightSprite;
    const n = 64, c = makeCanvas(n, n), g = c.getContext("2d");
    g.fillStyle = "#ffffff";
    for (let i = 30; i >= 1; i--) {
      g.globalAlpha = 0.055 * (1 - i / 31) + 0.012;
      g.beginPath(); g.arc(n / 2, n / 2, i, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    lightSprite = c;
    return c;
  }

  let weather = "clear", target = "clear", strength = 0, wtime = 0, wgust = 0;
  FX.weather = "clear";
  FX.weatherStrength = 0;

  FX.setWeather = function (kind, opts) {
    if (FX.WEATHERS.indexOf(kind) < 0) kind = "clear";
    opts = opts || {};
    target = kind;
    if (opts.instant) { weather = kind; strength = kind === "clear" ? 0 : 1; }
    FX.weather = kind;
  };

  function updateWeather(dt) {
    const s = dt / 1000;
    wtime += s;
    wgust = 0.6 + Math.sin(wtime * 0.7) * 0.3 + Math.sin(wtime * 2.3) * 0.1;
    // ease the current layer out before the new one comes in
    if (weather !== target) {
      strength -= s * 1.4;
      if (strength <= 0) { strength = 0; weather = target; }
    } else if (weather !== "clear" && strength < 1) {
      strength = Math.min(1, strength + s * 0.9);
    } else if (weather === "clear") strength = 0;
    FX.weatherStrength = strength;
    if (strength <= 0) return;
    const W = viewW() + 80, H = viewH() + 40;
    if (weather === "rain") {
      const slant = 90 * wgust;
      for (let i = 0; i < RAIN_N; i++) {
        ry[i] += rs[i] * s; rx[i] += slant * s;
        if (ry[i] > H) {
          // a drop that lands leaves a splash
          const j = splashHead; splashHead = (splashHead + 1) % SPLASH_N;
          sx[j] = rx[i]; sy[j] = H - 2; sl[j] = 1;
          ry[i] -= H + 20; rx[i] = wrnd() * W - 40;
        }
        if (rx[i] > W) rx[i] -= W + 40;
      }
      for (let i = 0; i < SPLASH_N; i++) if (sl[i] > 0) sl[i] -= s * 3.6;
    } else if (weather === "snow") {
      for (let i = 0; i < SNOW_N; i++) {
        np[i] += s * 1.1;
        ny[i] += (16 + nz[i] * 14) * s;
        nx[i] += Math.sin(np[i]) * 12 * s + 8 * wgust * s;
        if (ny[i] > H) { ny[i] -= H + 10; nx[i] = wrnd() * W; }
        if (nx[i] > W) nx[i] -= W; else if (nx[i] < -20) nx[i] += W;
      }
    } else if (weather === "wind") {
      for (let i = 0; i < LEAF_N; i++) {
        lx[i] += lvx[i] * wgust * s; ly[i] += (lvy[i] + Math.sin(wtime * 3 + i) * 40) * s;
        lr[i] += s * 4;
        if (lx[i] > W) { lx[i] -= W + 30; ly[i] = wrnd() * H; }
        if (ly[i] > H) ly[i] -= H; else if (ly[i] < -20) ly[i] += H;
      }
    } else if (weather === "fog") {
      for (let i = 0; i < BANK_N; i++) {
        fx_[i] += fsp[i] * s * (0.5 + wgust * 0.5);
        if (fx_[i] > W + 200) fx_[i] = -260;
      }
    }
  }

  FX.drawWeather = function (ctx) {
    if (strength <= 0.001) return;
    const W = viewW(), H = viewH(), a = strength;
    if (weather === "rain") {
      ctx.save();
      ctx.strokeStyle = "#bcd6ea";
      ctx.globalAlpha = 0.42 * a;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const slant = 0.22 * wgust;
      for (let i = 0; i < RAIN_N; i++) {
        const x = rx[i], y = ry[i];
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
        ctx.moveTo(x, y); ctx.lineTo(x - rl[i] * slant, y - rl[i]);
      }
      ctx.stroke();
      ctx.globalAlpha = 0.30 * a;
      ctx.beginPath();
      for (let i = 0; i < SPLASH_N; i++) {
        if (sl[i] <= 0) continue;
        const r = (1 - sl[i]) * 5 + 1;
        ctx.moveTo(sx[i] + r, sy[i]);
        ctx.arc(sx[i], sy[i], r, 0, Math.PI, true);
      }
      ctx.stroke();
      ctx.restore();
    } else if (weather === "snow") {
      ctx.save();
      ctx.fillStyle = "#eef4fb";
      ctx.globalAlpha = 0.78 * a;
      for (let i = 0; i < SNOW_N; i++) {
        const x = nx[i], y = ny[i];
        if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
        ctx.fillRect(x | 0, y | 0, nz[i] | 0 || 1, nz[i] | 0 || 1);
      }
      ctx.restore();
    } else if (weather === "wind") {
      ctx.save();
      ctx.globalAlpha = 0.85 * a;
      for (let i = 0; i < LEAF_N; i++) {
        const x = lx[i], y = ly[i];
        if (x < -14 || x > W + 14 || y < -14 || y > H + 14) continue;
        ctx.fillStyle = LEAF_COLS[lk[i]];
        const w = 4 + (i % 3), hgt = 2 + (i % 2);
        ctx.save(); ctx.translate(x | 0, y | 0); ctx.rotate(lr[i]);
        ctx.fillRect(-w * 0.5, -hgt * 0.5, w, hgt);
        ctx.restore();
      }
      // a few streak lines so the air itself reads as moving
      ctx.globalAlpha = 0.16 * a;
      ctx.strokeStyle = "#e8f0f6"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const y = ((i * 71 + wtime * 90) % H);
        const x = ((i * 137 + wtime * 320) % (W + 200)) - 100;
        ctx.moveTo(x, y); ctx.lineTo(x + 46, y - 5);
      }
      ctx.stroke();
      ctx.restore();
    } else if (weather === "fog") {
      const spr = fogBank();
      ctx.save();
      for (let i = 0; i < BANK_N; i++) {
        ctx.globalAlpha = fal[i] * a;
        const w = spr.width * fsc[i], h = spr.height * fsc[i];
        ctx.drawImage(spr, fx_[i] - 200, fy_[i] - h * 0.5, w, h);
      }
      ctx.globalAlpha = 0.10 * a;
      ctx.fillStyle = "#cfd9e0";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else if (weather === "sun") {
      ctx.save();
      ctx.fillStyle = "#fff4c8";
      for (let i = 0; i < SHAFT_N; i++) {
        ctx.globalAlpha = sha[i] * a * (0.7 + Math.sin(wtime * 0.6 + i) * 0.3);
        const x = (shx[i] % (W + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + shw[i], 0);
        ctx.lineTo(x + shw[i] + H * 0.55, H); ctx.lineTo(x + H * 0.55, H);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 0.07 * a;
      ctx.fillStyle = "#ffe9a8";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  };

  // =================================================================
  // 2. Day/night lighting with window glow
  // =================================================================
  const TINTS = {
    dawn: { col: "#4a3a6a", a: 0.26 },
    day: { col: "#000000", a: 0.0 },
    dusk: { col: "#5a2f2a", a: 0.24 },
    night: { col: "#0e1436", a: 0.52 }
  };
  const LIGHT_N = 96;
  const gx = new Float32Array(LIGHT_N), gy = new Float32Array(LIGHT_N),
        gr = new Float32Array(LIGHT_N), gs = new Float32Array(LIGHT_N);
  const gc = new Array(LIGHT_N);
  let lightCount = 0;
  let nightCanvas = null, nightW = 0, nightH = 0;

  FX.light = function (x, y, r, colour, strengthV) {
    if (lightCount >= LIGHT_N) return;
    const i = lightCount++;
    gx[i] = x; gy[i] = y; gr[i] = r || 48; gc[i] = colour || "#ffd9a0"; gs[i] = strengthV === undefined ? 1 : strengthV;
  };
  FX.clearLights = function () { lightCount = 0; };
  FX.lightCount = function () { return lightCount; };

  FX.tintFor = function (phase) { return TINTS[phase] || TINTS.day; };

  FX.drawLighting = function (ctx, opts) {
    opts = opts || {};
    let phase = opts.phase;
    if (!phase && MQ.Clock && MQ.Clock.phase) phase = MQ.Clock.phase;
    const t = TINTS[phase] || TINTS.day;
    let a = opts.alpha === undefined ? t.a : opts.alpha;
    if (opts.indoor) a *= 0.35;
    if (weather === "fog" && strength > 0) a = Math.min(0.62, a + 0.10 * strength);
    if (weather === "rain" && strength > 0) a = Math.min(0.62, a + 0.08 * strength);
    const W = viewW(), H = viewH();
    if (a <= 0.02 || t.col === "#000000") { lightCount = 0; return; }
    if (!nightCanvas || nightW !== Math.ceil(W) || nightH !== Math.ceil(H)) {
      nightCanvas = makeCanvas(Math.ceil(W), Math.ceil(H));
      nightW = Math.ceil(W); nightH = Math.ceil(H);
    }
    const g = nightCanvas.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    g.clearRect(0, 0, nightW, nightH);
    g.fillStyle = t.col;
    g.fillRect(0, 0, nightW, nightH);
    // punch the lights out of the darkness
    const disc = lightDisc();
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < lightCount; i++) {
      const r = gr[i];
      g.globalAlpha = U.clamp(gs[i], 0, 1);
      g.drawImage(disc, gx[i] - r, gy[i] - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.globalAlpha = a;
    ctx.drawImage(nightCanvas, 0, 0, W, H);
    ctx.restore();
    // warm bloom in the windows themselves
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < lightCount; i++) {
      const r = gr[i] * 0.55;
      ctx.globalAlpha = 0.16 * a * U.clamp(gs[i], 0, 1) * 2;
      ctx.fillStyle = gc[i];
      ctx.drawImage(disc, gx[i] - r, gy[i] - r, r * 2, r * 2);
    }
    ctx.restore();
    lightCount = 0;
  };

  // =================================================================
  // 3. Particles (fixed pool, swap-removal, zero per-frame allocation)
  // =================================================================
  const PN = 260;
  const ppx = new Float32Array(PN), ppy = new Float32Array(PN),
        pvx = new Float32Array(PN), pvy = new Float32Array(PN),
        plf = new Float32Array(PN), pmx = new Float32Array(PN),
        psz = new Float32Array(PN), prt = new Float32Array(PN),
        pgv = new Float32Array(PN), pdr = new Float32Array(PN);
  const pkd = new Uint8Array(PN);
  const pcl = new Array(PN);
  let pn = 0;

  const KINDS = ["sparkle", "dust", "footstep", "capture", "hit", "heal", "ember", "leaf", "splash", "bubble", "smoke", "shard", "note"];
  const KIDX = {};
  for (let i = 0; i < KINDS.length; i++) KIDX[KINDS[i]] = i;
  FX.KINDS = KINDS;

  const DEFAULT_COL = {
    sparkle: "#fff0a8", dust: "#c9bfa8", footstep: "#b8ad96", capture: "#ffe27a",
    hit: "#ffffff", heal: "#8ce88a", ember: "#ff9a3c", leaf: "#7a8a3a",
    splash: "#bcd6ea", bubble: "#a8d8e8", smoke: "#8f8a86", shard: "#dfe6ef", note: "#e8c2f0"
  };
  const prnd = U.rng("mq-particles");

  FX.spawn = function (kind, x, y, opts) {
    if (pn >= PN) return -1;
    const i = pn++;
    const k = KIDX[kind] === undefined ? 0 : KIDX[kind];
    opts = opts || {};
    pkd[i] = k;
    ppx[i] = x; ppy[i] = y;
    const spd = opts.speed === undefined ? 60 : opts.speed;
    const ang = opts.angle === undefined ? prnd() * TAU : opts.angle;
    pvx[i] = opts.vx === undefined ? Math.cos(ang) * spd * (0.4 + prnd() * 0.8) : opts.vx;
    pvy[i] = opts.vy === undefined ? Math.sin(ang) * spd * (0.4 + prnd() * 0.8) : opts.vy;
    const life = opts.life === undefined ? 500 + prnd() * 400 : opts.life;
    plf[i] = life; pmx[i] = life;
    psz[i] = opts.size === undefined ? 2 + prnd() * 2 : opts.size;
    prt[i] = prnd() * TAU;
    pgv[i] = opts.gravity === undefined ? (kind === "sparkle" || kind === "heal" || kind === "bubble" || kind === "note" ? -40 : kind === "smoke" || kind === "ember" ? -70 : 260) : opts.gravity;
    pdr[i] = opts.drag === undefined ? 0.9 : opts.drag;
    pcl[i] = opts.colour || opts.color || DEFAULT_COL[kind] || "#ffffff";
    return i;
  };

  FX.burst = function (kind, x, y, n, opts) {
    n = n || 8;
    opts = opts || {};
    for (let i = 0; i < n; i++) {
      const ang = opts.angle === undefined ? (i / n) * TAU + prnd() * 0.3 : opts.angle + (prnd() - 0.5) * (opts.spread || 1.2);
      FX.spawn(kind, x, y, {
        angle: ang, speed: opts.speed, life: opts.life, size: opts.size,
        colour: opts.colour || opts.color, gravity: opts.gravity, drag: opts.drag
      });
    }
  };

  // named effects the rest of the game asks for by name
  FX.effect = function (name, x, y, opts) {
    opts = opts || {};
    if (name === "capture") { FX.burst("capture", x, y, 16, { speed: 150, life: 620, size: 3 }); FX.burst("sparkle", x, y, 8, { speed: 70, life: 800 }); FX.flash(140, "#ffe27a"); }
    else if (name === "hit") { FX.burst("hit", x, y, 7, { speed: 190, life: 240, size: 3, colour: opts.colour }); FX.shake(120, 3); }
    else if (name === "crit") { FX.burst("hit", x, y, 12, { speed: 250, life: 300, size: 4 }); FX.burst("shard", x, y, 6, { speed: 180, life: 420 }); FX.shake(220, 6); }
    else if (name === "heal") { for (let i = 0; i < 10; i++) FX.spawn("heal", x + (prnd() - 0.5) * 40, y + 10, { vx: (prnd() - 0.5) * 20, vy: -30 - prnd() * 30, life: 900, size: 3 }); }
    else if (name === "faint") { FX.burst("smoke", x, y, 10, { speed: 40, life: 900, size: 5 }); }
    else if (name === "footstep") { FX.spawn("footstep", x, y, { vx: 0, vy: -6, life: 420, size: 3, colour: opts.colour }); }
    else if (name === "sparkle") { FX.burst("sparkle", x, y, opts.n || 6, { speed: 40, life: 700 }); }
    else if (name === "evolve") { FX.burst("sparkle", x, y, 20, { speed: 120, life: 1100, size: 3 }); FX.flash(260, "#ffffff"); }
    else if (name === "level") { for (let i = 0; i < 8; i++) FX.spawn("note", x + (prnd() - 0.5) * 30, y, { vx: (prnd() - 0.5) * 30, vy: -50, life: 900 }); }
    else FX.burst(name, x, y, opts.n || 8, opts);
  };

  function updateParticles(dt) {
    const s = dt / 1000;
    for (let i = 0; i < pn; i++) {
      plf[i] -= dt;
      if (plf[i] <= 0) {
        const j = --pn;
        if (i !== j) {
          ppx[i] = ppx[j]; ppy[i] = ppy[j]; pvx[i] = pvx[j]; pvy[i] = pvy[j];
          plf[i] = plf[j]; pmx[i] = pmx[j]; psz[i] = psz[j]; prt[i] = prt[j];
          pgv[i] = pgv[j]; pdr[i] = pdr[j]; pkd[i] = pkd[j]; pcl[i] = pcl[j];
        }
        i--; continue;
      }
      pvy[i] += pgv[i] * s;
      const d = Math.pow(pdr[i], s * 60);
      pvx[i] *= d; pvy[i] *= d;
      ppx[i] += pvx[i] * s; ppy[i] += pvy[i] * s;
      prt[i] += s * 3;
    }
  }

  FX.drawParticles = function (ctx) {
    if (!pn) return;
    ctx.save();
    for (let i = 0; i < pn; i++) {
      const t = plf[i] / pmx[i];
      const k = pkd[i], x = ppx[i], y = ppy[i], sz = psz[i];
      ctx.globalAlpha = t > 0.7 ? 1 : t / 0.7;
      ctx.fillStyle = pcl[i];
      if (k === KIDX.sparkle || k === KIDX.capture) {
        const r = sz * (0.6 + t * 0.7);
        ctx.fillRect(x - r, y - 0.5, r * 2, 1);
        ctx.fillRect(x - 0.5, y - r, 1, r * 2);
      } else if (k === KIDX.footstep) {
        ctx.globalAlpha *= 0.5;
        ctx.fillRect(x - sz, y - sz * 0.5, sz * 2, sz);
      } else if (k === KIDX.hit || k === KIDX.shard) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(prt[i]);
        ctx.fillRect(-sz * 1.6, -sz * 0.35, sz * 3.2, sz * 0.7);
        ctx.restore();
      } else if (k === KIDX.smoke) {
        ctx.globalAlpha *= 0.45;
        ctx.beginPath(); ctx.arc(x, y, sz * (2 - t), 0, TAU); ctx.fill();
      } else if (k === KIDX.heal || k === KIDX.bubble || k === KIDX.note) {
        ctx.beginPath(); ctx.arc(x, y, sz * (0.5 + t * 0.6), 0, TAU); ctx.fill();
      } else if (k === KIDX.leaf) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(prt[i]);
        ctx.fillRect(-sz * 1.4, -sz * 0.6, sz * 2.8, sz * 1.2);
        ctx.restore();
      } else if (k === KIDX.splash) {
        ctx.beginPath(); ctx.arc(x, y, sz * (1.4 - t), 0, Math.PI, true); ctx.stroke();
      } else {
        ctx.fillRect(x - sz * 0.5, y - sz * 0.5, sz, sz);
      }
    }
    ctx.restore();
  };
  FX.particleCount = function () { return pn; };

  // =================================================================
  // 4. Screen effects — these replace the core fallbacks
  // =================================================================
  const coreShake = (MQ.Scenes && MQ.Scenes.shake) || null;
  const coreFlash = (MQ.Scenes && MQ.Scenes.flash) || null;
  const shakeOff = { x: 0, y: 0 };
  let trauma = 0, traumaMs = 0, traumaAmp = 6, stopMs = 0;
  let flashMs = 0, flashT = 0, flashCol = "#ffffff";

  FX.shake = function (ms, amp) {
    ms = ms || 300; amp = amp === undefined ? 6 : amp;
    if (MQ.Settings && MQ.Settings.shake === false) return;
    traumaMs = Math.max(traumaMs, ms);
    traumaAmp = Math.max(traumaAmp * (trauma > 0 ? 1 : 0), amp);
    trauma = 1;
    if (coreShake) coreShake.call(MQ.Scenes, ms, amp);
  };
  FX.flash = function (ms, colour) {
    flashMs = ms || 220; flashT = 0; flashCol = colour || "#ffffff";
    if (coreFlash) coreFlash.call(MQ.Scenes, ms, colour);
  };
  FX.hitStop = function (ms) { stopMs = Math.max(stopMs, ms || 60); };
  FX.stopped = function () { return stopMs > 0; };
  FX.shakeOffset = function () { return shakeOff; };

  function updateScreen(dt) {
    if (stopMs > 0) stopMs -= dt;
    if (trauma > 0) {
      trauma -= dt / Math.max(1, traumaMs);
      if (trauma <= 0) { trauma = 0; shakeOff.x = 0; shakeOff.y = 0; }
      else {
        const k = trauma * trauma;
        shakeOff.x = Math.round((prnd() * 2 - 1) * traumaAmp * k);
        shakeOff.y = Math.round((prnd() * 2 - 1) * traumaAmp * k);
      }
    }
    if (flashT < flashMs) flashT += dt;
  }

  FX.drawScreen = function (ctx) {
    if (flashT < flashMs) {
      ctx.save();
      ctx.globalAlpha = (1 - flashT / flashMs) * 0.75;
      ctx.fillStyle = flashCol;
      ctx.fillRect(0, 0, viewW(), viewH());
      ctx.restore();
    }
  };

  // =================================================================
  // 5. Battle move animations
  // =================================================================
  FX.ANIMS = ["slash", "blast", "beam", "buff", "debuff", "heal", "status", "cyber"];

  function typeColour(type, fallback) {
    const TP = MQ.Art && MQ.Art.TYPE_PALETTES;
    if (type && TP && TP[type]) return TP[type][0];
    return fallback || "#ffffff";
  }
  const ease = U.ease || { outCubic: function (t) { return 1 - Math.pow(1 - t, 3); }, inCubic: function (t) { return t * t * t; } };

  // kind, ctx, from {x,y}, to {x,y}, t in 0..1, opts {type, colour, scale}
  FX.battleAnim = function (kind, ctx, from, to, t, opts) {
    if (!ctx || !from || !to) return;
    t = U.clamp(t, 0, 1);
    opts = opts || {};
    const col = opts.colour || opts.color || typeColour(opts.type, "#ffe9a0");
    const light = U.mix ? U.mix(col, "#ffffff", 0.55) : "#ffffff";
    const sc = opts.scale || 1;
    const fx0 = from.x, fy0 = from.y, tx = to.x, ty = to.y;
    ctx.save();
    switch (kind) {
      case "slash": {
        const n = 3;
        for (let i = 0; i < n; i++) {
          const st = U.clamp((t - i * 0.14) / 0.5, 0, 1);
          if (st <= 0 || st >= 1) continue;
          const len = 74 * sc * (0.6 + st * 0.7);
          const a = -0.7 + i * 0.5;
          const ox = (i - 1) * 14 * sc, oy = (i - 1) * -10 * sc;
          ctx.globalAlpha = 1 - st;
          ctx.strokeStyle = st < 0.4 ? light : col;
          ctx.lineWidth = 5 * sc * (1 - st * 0.6);
          ctx.beginPath();
          ctx.moveTo(tx + ox - Math.cos(a) * len, ty + oy - Math.sin(a) * len);
          ctx.lineTo(tx + ox + Math.cos(a) * len, ty + oy + Math.sin(a) * len);
          ctx.stroke();
        }
        break;
      }
      case "blast": {
        const e = ease.outCubic(t);
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = light; ctx.lineWidth = 6 * sc * (1 - t);
        ctx.beginPath(); ctx.arc(tx, ty, 12 + e * 68 * sc, 0, TAU); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 3 * sc;
        ctx.beginPath(); ctx.arc(tx, ty, 6 + e * 44 * sc, 0, TAU); ctx.stroke();
        ctx.fillStyle = col;
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * TAU + t * 1.2, r = e * (34 + (i % 4) * 16) * sc;
          const s2 = (1 - t) * 5 * sc;
          ctx.fillRect(tx + Math.cos(a) * r - s2 * 0.5, ty + Math.sin(a) * r - s2 * 0.5, s2, s2);
        }
        break;
      }
      case "beam": {
        const grow = U.clamp(t / 0.35, 0, 1), fade = U.clamp((t - 0.6) / 0.4, 0, 1);
        const ex = fx0 + (tx - fx0) * grow, ey = fy0 + (ty - fy0) * grow;
        ctx.globalAlpha = 1 - fade;
        ctx.lineCap = "round";
        ctx.strokeStyle = col; ctx.lineWidth = 14 * sc * (1 - fade * 0.5);
        ctx.beginPath(); ctx.moveTo(fx0, fy0); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = light; ctx.lineWidth = 5 * sc * (1 - fade * 0.5);
        ctx.beginPath(); ctx.moveTo(fx0, fy0); ctx.lineTo(ex, ey); ctx.stroke();
        if (t > 0.35) {
          ctx.globalAlpha = (1 - fade) * 0.9;
          ctx.fillStyle = light;
          const r = 10 + Math.sin(t * 24) * 4;
          ctx.beginPath(); ctx.arc(tx, ty, r * sc, 0, TAU); ctx.fill();
        }
        break;
      }
      case "buff": {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = col; ctx.lineWidth = 3 * sc;
        for (let i = 0; i < 4; i++) {
          const p = ((t * 1.6 + i * 0.25) % 1);
          const y = fy0 + 46 * sc - p * 92 * sc, w = (18 + i * 4) * sc * (1 - p * 0.4);
          ctx.beginPath();
          ctx.moveTo(fx0 - w, y + 8 * sc); ctx.lineTo(fx0, y); ctx.lineTo(fx0 + w, y + 8 * sc);
          ctx.stroke();
        }
        break;
      }
      case "debuff": {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = col; ctx.lineWidth = 3 * sc;
        for (let i = 0; i < 4; i++) {
          const p = ((t * 1.6 + i * 0.25) % 1);
          const y = ty - 46 * sc + p * 92 * sc, w = (18 + i * 4) * sc * (1 - p * 0.4);
          ctx.beginPath();
          ctx.moveTo(tx - w, y - 8 * sc); ctx.lineTo(tx, y); ctx.lineTo(tx + w, y - 8 * sc);
          ctx.stroke();
        }
        break;
      }
      case "heal": {
        const c2 = opts.colour || "#8ce88a";
        ctx.globalAlpha = (1 - t) * 0.9;
        ctx.strokeStyle = c2; ctx.lineWidth = 3 * sc;
        ctx.beginPath(); ctx.arc(fx0, fy0, (18 + t * 40) * sc, 0, TAU); ctx.stroke();
        ctx.fillStyle = "#dfffd8";
        for (let i = 0; i < 8; i++) {
          const p = ((t * 1.3 + i * 0.13) % 1);
          const a = i / 8 * TAU;
          const r = 30 * sc;
          const x = fx0 + Math.cos(a) * r * (1 - p * 0.4), y = fy0 + 40 * sc - p * 86 * sc;
          const s2 = 3 * sc * (1 - p);
          ctx.globalAlpha = (1 - p) * (1 - t * 0.5);
          ctx.fillRect(x - s2, y - 0.5 * sc, s2 * 2, sc); ctx.fillRect(x - 0.5 * sc, y - s2, sc, s2 * 2);
        }
        break;
      }
      case "status": {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = col; ctx.fillStyle = col;
        for (let i = 0; i < 7; i++) {
          const a = i / 7 * TAU + t * 3.4;
          const r = (16 + i * 5) * sc, y = ty - t * 24 * sc;
          const s2 = (2 + (i % 3)) * sc * (1 - t * 0.5);
          ctx.beginPath(); ctx.arc(tx + Math.cos(a) * r, y + Math.sin(a) * r * 0.5, s2, 0, TAU); ctx.stroke();
        }
        break;
      }
      case "cyber": {
        const c2 = opts.colour || typeColour("cyber", "#28c8a0");
        ctx.globalAlpha = 1 - t * 0.6;
        // packets travelling to the target
        ctx.fillStyle = c2;
        for (let i = 0; i < 6; i++) {
          const p = U.clamp(t * 1.5 - i * 0.08, 0, 1);
          if (p <= 0 || p >= 1) continue;
          const x = fx0 + (tx - fx0) * p, y = fy0 + (ty - fy0) * p - Math.sin(p * Math.PI) * 26 * sc;
          ctx.fillRect(x - 4 * sc, y - 2 * sc, 8 * sc, 4 * sc);
        }
        // scanline tear over the target
        if (t > 0.45) {
          const q = (t - 0.45) / 0.55;
          ctx.globalAlpha = (1 - q) * 0.9;
          for (let i = 0; i < 7; i++) {
            const y = ty - 42 * sc + i * 13 * sc;
            const off = (prnd() * 2 - 1) * 22 * sc * (1 - q);
            ctx.fillStyle = i % 2 ? c2 : U.mix(c2, "#ffffff", 0.6);
            ctx.fillRect(tx - 34 * sc + off, y, 68 * sc, 3 * sc);
          }
        }
        break;
      }
      default: {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = col; ctx.lineWidth = 4 * sc;
        ctx.beginPath(); ctx.arc(tx, ty, (10 + t * 46) * sc, 0, TAU); ctx.stroke();
      }
    }
    ctx.restore();
  };

  // How long each animation wants, in ms (the battle scene may scale this).
  FX.animDuration = function (kind) {
    if (kind === "beam") return 620;
    if (kind === "buff" || kind === "debuff") return 560;
    if (kind === "heal") return 700;
    if (kind === "status") return 620;
    if (kind === "cyber") return 720;
    if (kind === "blast") return 520;
    return 460;
  };

  // =================================================================
  // 6. Frame hooks
  // =================================================================
  FX.update = function (dt) {
    if (typeof dt !== "number" || !isFinite(dt)) dt = 16.667;
    updateScreen(dt);
    if (stopMs > 0) return;
    updateWeather(dt);
    updateParticles(dt);
  };

  FX.draw = function (ctx, opts) {
    if (!ctx) return;
    opts = opts || {};
    if (opts.particles !== false) FX.drawParticles(ctx);
    if (opts.weather !== false) FX.drawWeather(ctx);
    if (opts.lighting) FX.drawLighting(ctx, opts);
    if (opts.screen !== false) FX.drawScreen(ctx);
  };

  FX.reset = function () {
    pn = 0; lightCount = 0; trauma = 0; flashMs = 0; flashT = 0; stopMs = 0;
    shakeOff.x = 0; shakeOff.y = 0;
    weather = "clear"; target = "clear"; strength = 0;
    FX.weather = "clear"; FX.weatherStrength = 0;
  };
  FX.stats = function () {
    return { particles: pn, lights: lightCount, weather: weather, strength: strength, trauma: trauma };
  };
  FX.warm = function () { fogBank(); lightDisc(); };

  // Take over the core's placeholder screen effects (CORE-API NEEDS).
  if (MQ.Scenes) {
    MQ.Scenes._coreShake = coreShake;
    MQ.Scenes._coreFlash = coreFlash;
    MQ.Scenes.shake = FX.shake;
    MQ.Scenes.flash = FX.flash;
  }
  // Follow the game clock's weather when it changes.
  if (MQ.Events && MQ.Events.on) {
    MQ.Events.on("weather", function (d) {
      const k = d && (d.kind || d.weather || d.to);
      if (k) FX.setWeather(k);
    });
  }

  MQ.FX = FX;
})();
