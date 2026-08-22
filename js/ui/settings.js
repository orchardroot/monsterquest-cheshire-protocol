// =============================================================
// MonsterQuest v2 — MQ.UI.Settings (ui): every settings field with
// a live preview (text speed types itself; the touch layout draws
// itself at the chosen size, side and opacity).
// Reads/writes MQ.Settings when the content team provides it and
// always mirrors to localStorage 'mq2_settings'.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const KEY = "mq2_settings";
  const DEFAULTS = {
    textSpeed: "normal", music: 7, sfx: 8, difficulty: "normal",
    uiScale: "auto", touchSize: "medium", touchSide: "left", stickOpacity: 6,
    screenShake: "full", battleAnim: "normal", runMode: "hold",
    vibration: true, autosave: true, hints: true, battleText: "wait"
  };
  const local = U.merge ? U.merge({}, DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));

  function store() {
    try { if (typeof localStorage !== "undefined") return localStorage; } catch (e) { /* ignore */ }
    return null;
  }
  function readLocal() {
    const s = store();
    if (!s) return;
    try {
      const raw = s.getItem(KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      const ks = Object.keys(DEFAULTS);
      for (let i = 0; i < ks.length; i++) if (obj[ks[i]] !== undefined) local[ks[i]] = obj[ks[i]];
      sanitise();
    } catch (e) { /* a broken settings blob is not worth crashing over */ }
  }
  // A value written by an older build may not be one of the current choices
  // (screenShake used to be a boolean). Fall back rather than show the raw value.
  function sanitise() {
    for (let i = 0; i < OPTIONS.length; i++) {
      const o = OPTIONS[i];
      const v = local[o.id];
      if (o.kind === "slider") {
        const n = Number(v);
        local[o.id] = isFinite(n) ? U.clamp(Math.round(n), o.min, o.max) : DEFAULTS[o.id];
        continue;
      }
      let ok = false;
      for (let j = 0; j < o.options.length; j++) if (o.options[j].value === v) { ok = true; break; }
      if (!ok) local[o.id] = DEFAULTS[o.id];
    }
  }
  function writeLocal() {
    const s = store();
    if (!s) return;
    try { s.setItem(KEY, JSON.stringify(values())); } catch (e) { /* ignore */ }
  }

  function get(id) {
    try {
      if (MQ.Settings) {
        if (typeof MQ.Settings.get === "function") { const v = MQ.Settings.get(id); if (v !== undefined) return v; }
        else if (MQ.Settings[id] !== undefined) return MQ.Settings[id];
      }
    } catch (e) { /* ignore */ }
    return local[id];
  }
  function set(id, v) {
    local[id] = v;
    try {
      if (MQ.Settings) {
        if (typeof MQ.Settings.set === "function") MQ.Settings.set(id, v);
        else MQ.Settings[id] = v;
        if (typeof MQ.Settings.save === "function") MQ.Settings.save();
      }
    } catch (e) { /* ignore */ }
    writeLocal();
    apply(id, v);
    // the row shows the value, so it has to be rebuilt however the value moved
    if (sc && sc.st) sc.rebuild();
    if (MQ.Events) MQ.Events.emit("settings", { id: id, value: v });
  }
  function values() {
    const out = {};
    const ks = Object.keys(DEFAULTS);
    for (let i = 0; i < ks.length; i++) out[ks[i]] = get(ks[i]);
    return out;
  }

  // ---- applying a setting to the running engine -------------------
  const TEXT_CPS = { slow: 0.55, normal: 1, fast: 1.9, instant: 12 };
  const UI_SCALE_IDS = { auto: "auto", small: "small", normal: "normal", large: "large" };
  const TOUCH_SCALE = { small: 0.82, medium: 1, large: 1.24 };
  const ANIM_SPEED = { off: 0, slow: 0.6, normal: 1, fast: 1.8 };
  function apply(id, v) {
    try {
      if (id === "textSpeed" && MQ.Dialog) MQ.Dialog.speed = TEXT_CPS[v] || 1;
      if (id === "music" && MQ.Audio) {
        if (MQ.Audio.setVolume) MQ.Audio.setVolume("music", v / 10);
        else MQ.Audio.musicVolume = v / 10;
      }
      if (id === "sfx" && MQ.Audio) {
        if (MQ.Audio.setVolume) MQ.Audio.setVolume("sfx", v / 10);
        else MQ.Audio.sfxVolume = v / 10;
      }
      if (id === "uiScale" && MQ.View && MQ.View.setUiScale) {
        MQ.View.setUiScale(UI_SCALE_IDS[v] || "auto");
        // text and touch targets moved together: the pad has to be re-laid out
        if (MQ.Input && MQ.Input.layoutButtons) MQ.Input.layoutButtons();
      }
      if (id === "touchSize" && MQ.Input && MQ.Input.setTouchScale) MQ.Input.setTouchScale(TOUCH_SCALE[v] || 1);
      if (id === "touchSide" && MQ.Input && MQ.Input.setTouchSide) MQ.Input.setTouchSide(v);
      if (id === "stickOpacity" && MQ.Input) {
        if (MQ.Input.setTouchAlpha) MQ.Input.setTouchAlpha(v / 10);
        else MQ.Input.touchAlpha = v / 10;
      }
      if (id === "vibration" && MQ.Input) MQ.Input.vibrateEnabled = !!v;
      if (id === "screenShake" && MQ.Scenes) MQ.Scenes.shakeScale = v === "off" ? 0 : v === "light" ? 0.5 : 1;
      if (id === "autosave" && MQ.Save) MQ.Save.autosaveEnabled = !!v;
      if (id === "battleAnim" && MQ.BattleScene) MQ.BattleScene.animSpeed = ANIM_SPEED[v] === undefined ? 1 : ANIM_SPEED[v];
      if (id === "difficulty") {
        if (MQ.Battle) MQ.Battle.difficulty = v;
        if (MQ.Flags && MQ.Flags.set) MQ.Flags.set("difficulty", v);
      }
    } catch (e) { MQ.warn("[Settings] apply " + id + " failed", e); }
  }
  function applyAll() {
    const ks = Object.keys(DEFAULTS);
    for (let i = 0; i < ks.length; i++) apply(ks[i], get(ks[i]));
  }

  // ---- the option table -------------------------------------------
  function choice(id, name, opts, desc) { return { id: id, name: name, kind: "choice", options: opts, desc: desc }; }
  function slider(id, name, min, max, desc) { return { id: id, name: name, kind: "slider", min: min, max: max, desc: desc }; }
  const OPTIONS = [
    choice("textSpeed", "Text speed", [
      { label: "Slow", value: "slow" }, { label: "Normal", value: "normal" }, { label: "Fast", value: "fast" }, { label: "Instant", value: "instant" }
    ], "How quickly dialogue types itself out. The sample on the right runs at the speed you pick."),
    slider("music", "Music", 0, 10, "Volume of the synthesised score. Every town has its own motif; it would be a shame to miss them."),
    slider("sfx", "Sound effects", 0, 10, "Volume of hits, cursors, capsules, cats."),
    choice("difficulty", "Difficulty", [
      { label: "Story", value: "story" }, { label: "Normal", value: "normal" }, { label: "Hard", value: "hard" }, { label: "Nightmare", value: "nightmare" }
    ], "Enemy levels, AI, agent cooldowns, bag access and whiteout costs. Takes effect from the next battle. Achievements record the easiest tier you used."),
    choice("battleAnim", "Battle animation", [
      { label: "Off", value: "off" }, { label: "Slow", value: "slow" }, { label: "Normal", value: "normal" }, { label: "Fast", value: "fast" }
    ], "Speed of move animations and health drains. Off skips straight to the numbers."),
    choice("battleText", "Battle text", [
      { label: "Wait for A", value: "wait" }, { label: "Auto-advance", value: "auto" }
    ], "Whether battle messages wait for a button or move on by themselves."),
    choice("runMode", "Running", [
      { label: "Hold", value: "hold" }, { label: "Toggle", value: "toggle" }
    ], "Hold the run button, or tap it once and keep going. Full stick deflection always runs."),
    choice("uiScale", "UI scale", [
      { label: "Auto", value: "auto" }, { label: "Small", value: "small" }, { label: "Normal", value: "normal" }, { label: "Large", value: "large" }
    ], "Text, padding and the size of anything you tap, all together. Auto reads it off the screen: a phone gets a nudge up, a tablet is left alone."),
    choice("touchSize", "Touch layout size", [
      { label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" }
    ], "Size of the on-screen stick and buttons. Larger is easier on a tablet held one-handed."),
    choice("touchSide", "Stick side", [
      { label: "Left", value: "left" }, { label: "Right", value: "right" }
    ], "Which side of the screen the virtual stick lives on. The buttons take the other side."),
    slider("stickOpacity", "Stick opacity", 0, 10, "How visible the touch controls are. Turn it right down once your thumbs know where they live."),
    choice("screenShake", "Screen shake", [
      { label: "Off", value: "off" }, { label: "Light", value: "light" }, { label: "Full", value: "full" }
    ], "Shake on hits, quakes and things going badly wrong."),
    choice("vibration", "Vibration", [
      { label: "Off", value: false }, { label: "On", value: true }
    ], "Haptic buzz on touch buttons and heavy hits, where the device allows it."),
    choice("autosave", "Autosave", [
      { label: "Off", value: false }, { label: "On", value: true }
    ], "Writes the autosave slot after battles, warps and quest steps. Leaving this off is a choice you get to live with."),
    choice("hints", "Button hints", [
      { label: "Off", value: false }, { label: "On", value: true }
    ], "The strip of button prompts along the bottom of menus.")
  ];

  // ---- the scene ---------------------------------------------------
  const sc = { id: "settings", touchPad: false, st: null, items: [], sample: 0, sampleT: 0, fromTitle: false, busy: false };
  const SAMPLE = "Cheshire is quiet tonight. That is usually when it starts.";
  const HINTS = [{ btn: "lr", label: "Change" }, { btn: "a", label: "Change" }, { btn: "b", label: "Back" }];

  function labelFor(o) {
    const v = get(o.id);
    if (o.kind === "slider") return String(v);
    for (let i = 0; i < o.options.length; i++) if (o.options[i].value === v) return o.options[i].label;
    return String(v);
  }
  sc.rebuild = function () {
    const items = sc.items;
    items.length = 0;
    for (let i = 0; i < OPTIONS.length; i++) items.push({ label: OPTIONS[i].name, right: labelFor(OPTIONS[i]), value: OPTIONS[i].id });
    items.push({ label: "Reset to defaults", right: "", value: "__reset", color: TH().C.warn });
    if (!sc.st) sc.st = UI.menuState(items, { visible: 10 });
    else sc.st.setItems(items);
  };
  sc.enter = function (params) {
    params = params || {};
    sc.fromTitle = !!params.fromTitle;
    sc.busy = false;
    sc.sample = 0; sc.sampleT = 0;
    readLocal();
    applyAll();
    sc.rebuild();
    TH().sfx("ui_open");
  };
  sc.resume = function () { sc.busy = false; sc.rebuild(); };

  function nudge(o, dir) {
    const Theme = TH();
    if (o.kind === "slider") {
      const v = U.clamp((get(o.id) || 0) + dir, o.min, o.max);
      if (v === get(o.id)) { Theme.sfx("ui_error"); return; }
      set(o.id, v);
    } else {
      const cur = get(o.id);
      let idx = 0;
      for (let i = 0; i < o.options.length; i++) if (o.options[i].value === cur) idx = i;
      idx = (idx + dir + o.options.length) % o.options.length;
      set(o.id, o.options[idx].value);
    }
    if (o.id === "textSpeed") { sc.sample = 0; sc.sampleT = 0; }
    Theme.sfx("ui_move");
    sc.rebuild();
  }

  sc.update = function (dt) {
    if (sc.busy) return;
    sc.sampleT += dt;
    const speed = TEXT_CPS[get("textSpeed")] || 1;
    sc.sample += dt * 0.03 * speed;
    if (sc.sample > SAMPLE.length + 24) sc.sample = 0;
    const I = MQ.Input, Theme = TH();
    const cur = sc.st ? sc.st.cursor : 0;
    const o = OPTIONS[cur];
    if (o) {
      if (I.pressed("left")) { I.consume("left"); nudge(o, -1); return; }
      if (I.pressed("right")) { I.consume("right"); nudge(o, 1); return; }
    }
    const res = sc.st.update();
    if (res) {
      if (res.cancel) { Theme.sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) {
        const item = sc.items[res.selected];
        if (item.value === "__reset") {
          sc.busy = true;
          Theme.confirm("Put every setting back the way it came?").then(function (yes) {
            sc.busy = false;
            if (!yes) return;
            const ks = Object.keys(DEFAULTS);
            for (let i = 0; i < ks.length; i++) set(ks[i], DEFAULTS[ks[i]]);
            sc.rebuild();
            Theme.toast("Back to factory Cheshire.");
          });
          return;
        }
        nudge(OPTIONS[res.selected], 1);
        return;
      }
    }
    if (Theme.backPressed()) MQ.Scenes.pop(null);
  };

  // ---- preview panels ----------------------------------------------
  function drawTouchPreview(ctx, x, y, w, h) {
    const Theme = TH(), C = Theme.C;
    let scale = TOUCH_SCALE[get("touchSize")] || 1;
    try { if (MQ.Input && MQ.Input.effectiveScale) scale = MQ.Input.effectiveScale(); } catch (e) { /* ignore */ }
    const alpha = U.clamp((get("stickOpacity") || 0) / 10, 0, 1);
    const side = get("touchSide") === "right" ? 1 : 0;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    UI.roundRect(ctx, x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = C.edgeDim; ctx.lineWidth = 1;
    UI.roundRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 6); ctx.stroke();
    ctx.globalAlpha = Math.max(0.08, alpha);
    const r = 26 * scale;
    const sx = side ? x + w - 20 - r : x + 20 + r;
    const bx = side ? x + 24 + r : x + w - 24 - r;
    const cy = y + h / 2;
    ctx.strokeStyle = "#dfe6ee"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, cy, r, 0, 6.3); ctx.stroke();
    ctx.fillStyle = "rgba(223,230,238,0.35)";
    ctx.beginPath(); ctx.arc(sx, cy, r * 0.45, 0, 6.3); ctx.fill();
    ctx.fillStyle = "rgba(198,40,40,0.55)";
    ctx.beginPath(); ctx.arc(bx, cy + 6 * scale, 17 * scale, 0, 6.3); ctx.fill();
    ctx.fillStyle = "rgba(42,79,168,0.55)";
    ctx.beginPath(); ctx.arc(bx - 34 * scale, cy - 10 * scale, 14 * scale, 0, 6.3); ctx.fill();
    ctx.globalAlpha = 1;
    T.draw(ctx, "preview", x + w / 2, y + h - 16, { size: "s", align: "center", color: C.dim });
    ctx.restore();
  }

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#181630", bottom: "#101a1e" });
    Theme.header(ctx, { title: "Settings", sub: sc.fromTitle ? "Nothing here is permanent." : "Changes take hold at once; difficulty waits for the next battle.", icon: "cog" });
    const top = Theme.headerBottom();
    const bot = Theme.footerTop() - 6;
    const listW = Math.min(420 * m.k, m.cw * 0.52);
    Theme.list(sc.st, ctx, { x: m.l, y: top, w: listW, h: bot - top, rowH: Theme.rowH(36), gap: 3 });
    const px = m.l + listW + 22, pw = m.r - px;
    Theme.panel(ctx, px, top, pw, bot - top, { lit: true });
    const o = OPTIONS[sc.st.cursor];
    const title = o ? o.name : "Reset to defaults";
    T.draw(ctx, title, px + 16, top + 14, { size: "m", color: C.brassLit });
    const desc = o ? o.desc : "Every setting goes back to how it shipped. Your save is untouched.";
    T.drawWrapped(ctx, desc, px + 16, top + 42, pw - 32, { size: "s", color: C.text });
    let py = top + 42 + 5 * 20 + 12;
    if (o && o.kind === "slider") {
      const v = get(o.id) || 0;
      UI.gauge(ctx, px + 16, py, pw - 32, 14, (v - o.min) / (o.max - o.min || 1), { color: C.brass, bg: "rgba(0,0,0,0.45)" });
      T.draw(ctx, o.min + "                                     " + o.max, px + 16, py + 18, { size: "s", color: C.dim });
      py += 44;
    }
    if (o && (o.id === "touchSize" || o.id === "touchSide" || o.id === "stickOpacity" || o.id === "uiScale")) {
      drawTouchPreview(ctx, px + 16, py, pw - 32, Math.min(130, bot - py - 20));
    } else {
      // text speed preview always runs; it is the most useful one
      const n = Math.floor(sc.sample);
      const shown = SAMPLE.slice(0, U.clamp(n, 0, SAMPLE.length));
      Theme.panel(ctx, px + 16, py, pw - 32, 84, { flat: true });
      T.drawWrapped(ctx, shown, px + 28, py + 12, pw - 56, { size: "m", color: C.text });
      if (o && o.id === "difficulty") {
        const d = get("difficulty");
        T.draw(ctx, "Now: " + Theme.titleCase(d), px + 16, py + 92, { size: "s", color: C.warn });
      }
    }
    Theme.footer(ctx, HINTS);
  };

  sc.open = function (opts) { return MQ.Scenes.pushP(sc, opts || {}); };
  sc.get = get;
  sc.setValue = set;
  sc.values = values;
  sc.DEFAULTS = DEFAULTS;
  sc.OPTIONS = OPTIONS;
  sc.applyAll = applyAll;
  sc.textSpeedMultiplier = function () { return TEXT_CPS[get("textSpeed")] || 1; };
  sc.touchScale = function () { return TOUCH_SCALE[get("touchSize")] || 1; };
  sc.uiScale = function () { return get("uiScale"); };

  readLocal();
  // Stored preferences used to sit there until you opened this screen; apply
  // them once the engine is up so a cold boot honours them.
  if (MQ.Events && MQ.Events.on) MQ.Events.on("boot", function () { readLocal(); applyAll(); });
  UI.Settings = sc;
})();
