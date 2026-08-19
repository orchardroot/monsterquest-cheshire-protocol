// =============================================================
// MonsterQuest v2 — MQ.Clock (core): game time, phases, weather
// state machine per outdoor zone, real-clock hooks.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const PHASES = [
    { id: "dawn", from: 5 * 60, to: 7 * 60 },
    { id: "day", from: 7 * 60, to: 19 * 60 },
    { id: "dusk", from: 19 * 60, to: 21 * 60 },
    { id: "night", from: 21 * 60, to: 29 * 60 }   // wraps past midnight
  ];
  const WEATHER = ["clear", "rain", "fog", "wind", "sun", "snow"];
  // transition weights: from → {to: weight}
  const TRANS = {
    clear: { clear: 50, rain: 18, fog: 10, wind: 12, sun: 10 },
    rain: { rain: 40, clear: 35, fog: 15, wind: 10 },
    fog: { fog: 30, clear: 50, rain: 20 },
    wind: { wind: 30, clear: 45, rain: 25 },
    sun: { sun: 40, clear: 50, wind: 10 },
    snow: { snow: 45, clear: 40, fog: 15 }
  };
  const TINTS = {
    dawn: "rgba(255,170,90,0.16)",
    day: "rgba(0,0,0,0)",
    dusk: "rgba(120,60,150,0.22)",
    night: "rgba(10,20,70,0.42)"
  };

  const zones = {};   // zone → {kind, left(min), rnd}
  const real = { date: null, dow: 0, month: 0, day: 1, hour: 0, minute: 0, year: 0, isWeekend: false, season: "summer" };
  let realAcc = 1e9;

  const Clock = {
    PHASES: PHASES,
    WEATHER: WEATHER,
    minutes: 9 * 60,     // minute of day 0..1439
    day: 1,              // game day counter
    rate: 1,             // game minutes per real second
    running: false,      // advance while true (Overworld sets) or when top scene id === 'overworld'
    frozen: false,       // script/time-freeze
    phase: "day",
    zone: "default",
    weather: "clear",
    zones: zones,
    real: real,
    _acc: 0
  };

  function phaseFor(min) {
    const m = min < 5 * 60 ? min + 24 * 60 : min;
    for (let i = 0; i < PHASES.length; i++) if (m >= PHASES[i].from && m < PHASES[i].to) return PHASES[i].id;
    return "night";
  }
  Clock.phaseFor = phaseFor;
  Clock.tint = function (phase) { return TINTS[phase || Clock.phase] || TINTS.day; };
  Clock.hour = function () { return Math.floor(Clock.minutes / 60); };
  Clock.minute = function () { return Clock.minutes % 60; };
  Clock.timeString = function () { return U.pad(Clock.hour(), 2, "0") + ":" + U.pad(Clock.minute(), 2, "0"); };
  Clock.isNight = function () { return Clock.phase === "night"; };
  Clock.isDay = function () { return Clock.phase === "day"; };
  // 0..1 daylight amount, for lighting/FX
  Clock.daylight = function () {
    const m = Clock.minutes;
    if (m < 5 * 60 || m >= 21 * 60) return 0;
    if (m < 7 * 60) return (m - 5 * 60) / 120;
    if (m < 19 * 60) return 1;
    return 1 - (m - 19 * 60) / 120;
  };

  function updatePhase(force) {
    const p = phaseFor(Clock.minutes);
    if (p !== Clock.phase || force) {
      const old = Clock.phase;
      Clock.phase = p;
      if (MQ.Events) MQ.Events.emit("phase", { phase: p, old: old, minutes: Clock.minutes });
    }
  }
  Clock.setTime = function (h, m) {
    Clock.minutes = ((h * 60 + (m || 0)) % 1440 + 1440) % 1440;
    updatePhase(true);
  };
  Clock.setPhase = function (phase) {
    for (let i = 0; i < PHASES.length; i++) if (PHASES[i].id === phase) { Clock.minutes = PHASES[i].from % 1440; break; }
    updatePhase(true);
  };
  Clock.advance = function (min) {
    Clock.minutes += min;
    while (Clock.minutes >= 1440) { Clock.minutes -= 1440; Clock.day++; if (MQ.Events) MQ.Events.emit("newday", { day: Clock.day }); }
    updatePhase(false);
    tickWeather(min);
  };

  // ---- weather ---------------------------------------------------
  function zoneState(zone) {
    let z = zones[zone];
    if (!z) {
      z = zones[zone] = { kind: "clear", left: 20 + Math.floor(Math.random() * 40), rnd: U.rng(zone + ":" + Date.now()) };
      if (zone === "hills" || zone === "moor") z.kind = Math.random() < 0.3 ? "fog" : "clear";
    }
    return z;
  }
  function pickNext(z, zone) {
    const row = TRANS[z.kind] || TRANS.clear;
    const ks = Object.keys(row);
    let total = 0;
    for (let i = 0; i < ks.length; i++) total += row[ks[i]];
    let r = z.rnd() * total;
    for (let i = 0; i < ks.length; i++) { r -= row[ks[i]]; if (r < 0) return ks[i]; }
    return "clear";
  }
  function tickWeather(min) {
    const ks = Object.keys(zones);
    for (let i = 0; i < ks.length; i++) {
      const z = zones[ks[i]];
      z.left -= min;
      if (z.left <= 0) {
        let next = pickNext(z, ks[i]);
        // no snow except winter-ish real months or high zones (keeps it rare)
        if (next === "snow" && !(real.month === 11 || real.month === 0 || real.month === 1)) next = "clear";
        // more rain at night/dusk on the moors
        Clock.setWeather(next, ks[i], true);
        z.left = 15 + Math.floor(z.rnd() * 45);
      }
    }
  }
  Clock.setZone = function (zone) {
    Clock.zone = zone || "default";
    const z = zoneState(Clock.zone);
    if (z.kind !== Clock.weather) {
      const old = Clock.weather;
      Clock.weather = z.kind;
      if (MQ.Events) MQ.Events.emit("weather", { weather: z.kind, old: old, zone: Clock.zone });
    }
    return Clock.weather;
  };
  Clock.setWeather = function (kind, zone, natural) {
    if (WEATHER.indexOf(kind) < 0) kind = "clear";
    zone = zone || Clock.zone;
    const z = zoneState(zone);
    z.kind = kind;
    if (!natural) z.left = 30 + Math.floor(Math.random() * 30);
    if (zone === Clock.zone && kind !== Clock.weather) {
      const old = Clock.weather;
      Clock.weather = kind;
      if (MQ.Events) MQ.Events.emit("weather", { weather: kind, old: old, zone: zone });
    }
  };
  Clock.weatherOf = function (zone) { return zoneState(zone || Clock.zone).kind; };

  // ---- real clock -----------------------------------------------
  function refreshReal() {
    const d = new Date();
    real.date = d;
    real.dow = d.getDay(); real.month = d.getMonth(); real.day = d.getDate();
    real.hour = d.getHours(); real.minute = d.getMinutes(); real.year = d.getFullYear();
    real.isWeekend = real.dow === 0 || real.dow === 6;
    real.season = real.month <= 1 || real.month === 11 ? "winter" : real.month <= 4 ? "spring" : real.month <= 7 ? "summer" : "autumn";
  }
  refreshReal();
  Clock.refreshReal = refreshReal;

  // ---- per-step update (dt ms) — called by MQ.Loop.step ------------
  Clock.update = function (dt) {
    realAcc += dt;
    if (realAcc >= 1000) { realAcc = 0; refreshReal(); }
    let run = Clock.running && !Clock.frozen;
    if (!run && MQ.Scenes) { const t = MQ.Scenes.top(); run = !!(t && t.id === "overworld") && !Clock.frozen && !(MQ.Script && MQ.Script.busy()); }
    if (!run) return;
    Clock._acc += dt * Clock.rate;
    if (Clock._acc >= 1000) {
      const mins = Math.floor(Clock._acc / 1000);
      Clock._acc -= mins * 1000;
      Clock.advance(mins);
    }
  };

  Clock.saveProvider = {
    save: function () {
      const zs = {};
      const ks = Object.keys(zones);
      for (let i = 0; i < ks.length; i++) zs[ks[i]] = { kind: zones[ks[i]].kind, left: zones[ks[i]].left };
      return { minutes: Clock.minutes, day: Clock.day, zone: Clock.zone, zones: zs };
    },
    load: function (o) {
      if (!o) return;
      Clock.minutes = typeof o.minutes === "number" ? o.minutes : 9 * 60;
      Clock.day = o.day || 1;
      const ks = Object.keys(o.zones || {});
      for (let i = 0; i < ks.length; i++) { const z = zoneState(ks[i]); z.kind = o.zones[ks[i]].kind; z.left = o.zones[ks[i]].left; }
      updatePhase(true);
      Clock.setZone(o.zone || "default");
    }
  };
  updatePhase(true);
  Clock.setZone("default");
  MQ.Clock = Clock;
})();
