// =============================================================
// MonsterQuest v2 — MQ.UI.Title (ui): animated title screen, save
// slots, name entry (on-screen + physical keyboard), difficulty,
// credits. Boot pushes this object directly, so it IS a scene.
// Also publishes MQ.UI.NameEntry and MQ.UI.Credits.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  // =============================================================
  // Name entry — on-screen keyboard for touch, real typing on Mac
  // MQ.UI.NameEntry.open({title, initial, max, subtitle}) -> Promise<string|null>
  // =============================================================
  const KEY_ROWS_UPPER = ["ABCDEFGHIJ", "KLMNOPQRST", "UVWXYZ0123", "456789-' ."];
  const KEY_ROWS_LOWER = ["abcdefghij", "klmnopqrst", "uvwxyz0123", "456789-' ."];
  const COLS = 10;

  const nameSc = { id: "name_entry", touchPad: false, value: "", max: 10, title: "Name", sub: "", st: null, shift: false, suppress: 0, blink: 0, keys: [], onKey: null };

  function buildKeys(shift) {
    const rows = shift ? KEY_ROWS_UPPER : KEY_ROWS_LOWER;
    const keys = nameSc.keys;
    keys.length = 0;
    for (let r = 0; r < rows.length; r++) {
      for (let i = 0; i < rows[r].length; i++) keys.push({ label: rows[r][i] === " " ? "SPC" : rows[r][i], value: rows[r][i], kind: "char" });
    }
    keys.push({ label: shift ? "abc" : "ABC", value: "shift", kind: "cmd" });
    keys.push({ label: "SPACE", value: "space", kind: "cmd" });
    keys.push({ label: "DEL", value: "del", kind: "cmd" });
    keys.push({ label: "", value: "gap", kind: "gap", disabled: true });
    keys.push({ label: "", value: "gap2", kind: "gap", disabled: true });
    keys.push({ label: "", value: "gap3", kind: "gap", disabled: true });
    keys.push({ label: "", value: "gap4", kind: "gap", disabled: true });
    keys.push({ label: "DONE", value: "done", kind: "cmd" });
    keys.push({ label: "", value: "gap5", kind: "gap", disabled: true });
    keys.push({ label: "", value: "gap6", kind: "gap", disabled: true });
    return keys;
  }

  function nameKeyDown(e) {
    if (MQ.Scenes.top() !== nameSc) return;
    const k = e.key;
    if (k === undefined) return;
    if (k === "Backspace") { nameSc.del(); nameSc.suppress = 2; if (e.preventDefault) e.preventDefault(); return; }
    if (k === "Enter") { nameSc.suppress = 2; nameSc.done(); if (e.preventDefault) e.preventDefault(); return; }
    // Escape is the START glyph on a keyboard, and the footer promises
    // "ESC Done" — so it commits the name. X (the B button) backs out.
    if (k === "Escape") { nameSc.suppress = 2; nameSc.done(); if (e.preventDefault) e.preventDefault(); return; }
    if (k.length === 1 && /[A-Za-z0-9 '\-.]/.test(k)) {
      nameSc.type(k);
      nameSc.suppress = 2;
      if (e.preventDefault) e.preventDefault();
    }
  }

  nameSc.type = function (ch) {
    if (nameSc.value.length >= nameSc.max) { TH().sfx("ui_error"); return; }
    nameSc.value += ch;
    TH().sfx("ui_move");
  };
  nameSc.del = function () {
    if (!nameSc.value.length) { TH().sfx("ui_error"); return; }
    nameSc.value = nameSc.value.slice(0, -1);
    TH().sfx("ui_back");
  };
  nameSc.done = function () {
    const v = nameSc.value.replace(/\s+$/, "");
    if (!v.length) { TH().sfx("ui_error"); TH().toast("A name would help."); return; }
    TH().sfx("ui_select");
    MQ.Scenes.pop(v);
  };
  nameSc.cancel = function () { TH().sfx("ui_back"); MQ.Scenes.pop(null); };

  nameSc.enter = function (params) {
    params = params || {};
    nameSc.title = params.title || "Name";
    nameSc.sub = params.subtitle || "";
    nameSc.max = params.max || 10;
    nameSc.value = String(params.initial || "").slice(0, nameSc.max);
    nameSc.shift = true;
    nameSc.suppress = 0;
    nameSc.blink = 0;
    buildKeys(true);
    if (!nameSc.st) nameSc.st = UI.menuState(nameSc.keys, { cols: COLS });
    else nameSc.st.setItems(nameSc.keys);
    nameSc.st.cols = COLS;
    nameSc.st.setCursor(0);
    try { window.addEventListener("keydown", nameKeyDown); } catch (e) { /* headless */ }
    TH().sfx("ui_open");
  };
  nameSc.exit = function () {
    try { window.removeEventListener("keydown", nameKeyDown); } catch (e) { /* ignore */ }
  };

  nameSc.press = function (key) {
    if (!key || key.kind === "gap") return;
    if (key.kind === "char") { nameSc.type(key.value); return; }
    if (key.value === "shift") { nameSc.shift = !nameSc.shift; buildKeys(nameSc.shift); nameSc.st.setItems(nameSc.keys); TH().sfx("ui_move"); return; }
    if (key.value === "space") { nameSc.type(" "); return; }
    if (key.value === "del") { nameSc.del(); return; }
    if (key.value === "done") { nameSc.done(); return; }
  };

  nameSc.update = function (dt) {
    nameSc.blink += dt;
    if (nameSc.suppress > 0) { nameSc.suppress--; MQ.Input.consumeAll(); return; }
    const res = nameSc.st.update();
    if (res) {
      if (res.cancel) { nameSc.cancel(); return; }
      if (res.selected !== undefined) { nameSc.press(nameSc.keys[res.selected]); return; }
    }
    if (MQ.Input.pressed("start")) { MQ.Input.consume("start"); nameSc.done(); }
    // the header chevron is drawn on this screen, so it has to work too
    if (TH().backPressed()) { nameSc.cancel(); return; }
  };

  nameSc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.scrim(ctx, 0.82);
    Theme.header(ctx, { title: nameSc.title, sub: nameSc.sub || "Tap the letters, or just type.", icon: "book" });
    const top = Theme.headerBottom();
    // the field
    const fw = Math.min(m.cw, 520 * m.k);
    const fx = m.cx - fw / 2;
    Theme.panel(ctx, fx, top, fw, 52, { lit: true });
    const shown = nameSc.value + ((nameSc.blink % 900 < 500) ? "_" : " ");
    T.draw(ctx, shown, m.cx, top + 14, { size: "l", align: "center", color: C.brassLit });
    T.draw(ctx, nameSc.value.length + "/" + nameSc.max, fx + fw - 10, top + 32, { size: "s", align: "right", color: C.textDim });

    // keyboard grid
    const gy0 = top + 66;
    const gh = Theme.footerTop() - gy0 - 6;
    const rows = Math.ceil(nameSc.keys.length / COLS);
    const kw = Math.floor((fw - (COLS - 1) * 6) / COLS);
    const kh = Math.min(Math.floor((gh - (rows - 1) * 6) / rows), Math.round(46 * m.k));
    // keys cap out at 46px, so on a tall screen centre them rather than
    // leaving a third of the screen empty underneath
    const gy = gy0 + Math.max(0, Math.floor((gh - (kh * rows + 6 * (rows - 1))) / 2));
    const gx = m.cx - (kw * COLS + 6 * (COLS - 1)) / 2;
    const st = nameSc.st;
    for (let i = 0; i < st.rects.length; i++) { if (st.rects[i]) st.rects[i].on = false; }
    for (let i = 0; i < nameSc.keys.length; i++) {
      const k = nameSc.keys[i];
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = gx + col * (kw + 6), y = gy + row * (kh + 6);
      let r = st.rects[i];
      if (!r) r = st.rects[i] = { x: 0, y: 0, w: 0, h: 0, on: false };
      r.x = x; r.y = y; r.w = kw; r.h = kh; r.on = k.kind !== "gap";
      if (k.kind === "gap") continue;
      Theme.button(ctx, k.label, x, y, kw, kh, { active: i === st.cursor, size: k.kind === "cmd" ? "s" : "m" });
    }
    Theme.footer(ctx, [{ btn: "a", label: "Key" }, { btn: "b", label: "Back" }, { btn: "start", label: "Done" }]);
  };
  nameSc.open = function (opts) { return MQ.Scenes.pushP(nameSc, opts || {}); };
  UI.NameEntry = nameSc;

  // =============================================================
  // Difficulty picker (SYSTEMS-SPEC §13)
  // =============================================================
  const DIFFS = [
    { id: "story", name: "Story", blurb: "For the walk, not the fight. Enemies come in ten per cent softer, the bag is always open, and a whiteout costs you nothing but dignity.", detail: "Levels -10%  |  Full XP share  |  Capture x1.3" },
    { id: "normal", name: "Normal", blurb: "The county as intended. Fair fights, real consequences, a whiteout takes a tenth of your credits.", detail: "Levels 0%  |  XP share 50%  |  Capture x1" },
    { id: "hard", name: "Hard", blurb: "Trainers think a move ahead, agents take longer to come back, and you get three items a battle. Bring a plan.", detail: "Levels +10%  |  3 bag items per trainer fight  |  Whiteout -25% + an item" },
    { id: "nightmare", name: "Nightmare", blurb: "Everyone is smart, the bag is shut, gyms jam your agents and bosses start with the meter half full. Noted.", detail: "Levels +20%  |  No bag in trainer fights  |  Capture x0.85" }
  ];
  const diffSc = { id: "difficulty", touchPad: false, st: null, onPick: null, current: "normal" };
  diffSc.enter = function (params) {
    params = params || {};
    diffSc.current = params.current || currentDifficulty();
    const items = [];
    for (let i = 0; i < DIFFS.length; i++) items.push({ label: DIFFS[i].name, value: DIFFS[i].id });
    if (!diffSc.st) diffSc.st = UI.menuState(items, { visible: 4 });
    else diffSc.st.setItems(items);
    for (let i = 0; i < DIFFS.length; i++) if (DIFFS[i].id === diffSc.current) diffSc.st.setCursor(i);
    TH().sfx("ui_open");
  };
  diffSc.update = function () {
    const res = diffSc.st.update();
    if (res) {
      if (res.cancel) { TH().sfx("ui_back"); MQ.Scenes.pop(null); return; }
      if (res.selected !== undefined) { TH().sfx("ui_select"); MQ.Scenes.pop(DIFFS[res.selected].id); return; }
    }
    if (TH().backPressed()) MQ.Scenes.pop(null);
  };
  diffSc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#20172c", bottom: "#0f1420" });
    Theme.header(ctx, { title: "Difficulty", sub: "Changeable later in Settings; it applies from the next battle.", icon: "cog" });
    const top = Theme.headerBottom();
    const listW = Math.min(300 * m.k, m.cw * 0.38);
    const rowH = Math.round(52 * m.k);
    Theme.list(diffSc.st, ctx, { x: m.l, y: top, w: listW, h: Theme.footerTop() - top - 6, rowH: rowH, gap: 6 });
    const d = DIFFS[diffSc.st.cursor] || DIFFS[1];
    const px = m.l + listW + 18, pw = m.r - px;
    Theme.panel(ctx, px, top, pw, Theme.footerTop() - top - 6, { lit: true, accent: C.brass });
    T.draw(ctx, d.name, px + 16, top + 16, { size: "l", color: C.brassLit });
    T.drawWrapped(ctx, d.blurb, px + 16, top + 52, pw - 32, { size: "m", color: C.text });
    T.draw(ctx, d.detail, px + 16, top + 150, { size: "s", color: C.textDim, maxWidth: pw - 32 });
    if (d.id === diffSc.current) T.draw(ctx, "Current setting", px + 16, top + 174, { size: "s", color: C.good });
    Theme.footer(ctx, [{ btn: "a", label: "Choose" }, { btn: "b", label: "Back" }]);
  };
  diffSc.open = function (opts) { return MQ.Scenes.pushP(diffSc, opts || {}); };
  UI.Difficulty = diffSc;
  UI.DIFFICULTIES = DIFFS;

  function currentDifficulty() {
    try {
      if (MQ.Settings && MQ.Settings.get) return MQ.Settings.get("difficulty") || "normal";
      if (MQ.Settings && MQ.Settings.difficulty) return MQ.Settings.difficulty;
    } catch (e) { /* ignore */ }
    return "normal";
  }
  function setDifficulty(id) {
    try {
      if (MQ.Settings && MQ.Settings.set) MQ.Settings.set("difficulty", id);
      else if (MQ.Settings) MQ.Settings.difficulty = id;
    } catch (e) { /* ignore */ }
    if (UI.Settings && UI.Settings.setValue) UI.Settings.setValue("difficulty", id);
  }

  // =============================================================
  // Credits
  // =============================================================
  const CREDIT_LINES = [
    "@MONSTERQUEST",
    "$THE CHESHIRE PROTOCOL",
    "",
    "#A county, a caseload and two cats.",
    "",
    "@FIELD WORK",
    "Macclesfield silk, Bollington's white pudding-basin,",
    "Alderley's wizard, Jodrell's ear, Nantwich brine,",
    "Northwich salt, Crewe's junction, Anderton's lift,",
    "Delamere, Beeston, Tatton, Lyme, the Chester walls.",
    "All real. All still there. Go and look.",
    "",
    "@CAST",
    "JIM - who says 'noted' when he is angry",
    "VEX - who was right, eventually",
    "MEADOW - small, black, absurdly fast",
    "BIGBOY - huge, black and white, came back from the brink",
    "SLEET, VIGIL, ARBITER - three agents, one bell",
    "GRINMALKIN - the smile that stayed",
    "",
    "@WITH THANKS",
    "Mam-gu, for the press and the patience.",
    "Nino, for four letters and a long way home.",
    "Everyone who was only bored, frightened or skint.",
    "",
    "@BUILT",
    "Vanilla JavaScript. One canvas. No dependencies.",
    "Every sound synthesised, every sprite drawn in code.",
    "",
    "#No cats were harmed. One was ignored, briefly.",
    "",
    "$Thank you for walking it."
  ];
  const credSc = { id: "credits", touchPad: false, y: 0, speed: 0.032, done: false };
  credSc.enter = function () { credSc.y = 0; credSc.done = false; TH().music("credits"); };
  credSc.update = function (dt) {
    const fast = MQ.Input.held("a") || MQ.Input.held("run");
    credSc.y += dt * credSc.speed * (fast ? 4 : 1);
    const m = TH().m();
    const total = CREDIT_LINES.length * 30 + m.h;
    if (credSc.y > total) credSc.y = 0;
    if (TH().backPressed() || MQ.Input.pressed("start")) { MQ.Input.consume("start"); MQ.Scenes.pop(null); }
  };
  credSc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    ctx.fillStyle = "#0b0a14"; ctx.fillRect(0, 0, m.w, m.h);
    Theme.grin(ctx, m.cx, m.h * 0.5, m.w * 0.5, { alpha: 0.05, open: 1 });
    const startY = m.h - credSc.y;
    for (let i = 0; i < CREDIT_LINES.length; i++) {
      const y = startY + i * 30;
      if (y < -40 || y > m.h + 10) continue;
      let line = CREDIT_LINES[i], size = "m", col = C.text;
      if (line.charAt(0) === "@") { line = line.slice(1); size = "s"; col = C.brass; }
      else if (line.charAt(0) === "$") { line = line.slice(1); size = "l"; col = C.brassLit; }
      else if (line.charAt(0) === "#") { line = line.slice(1); size = "s"; col = C.textDim; }
      T.draw(ctx, line, m.cx, y, { size: size, align: "center", color: col, maxWidth: m.cw });
    }
    Theme.footer(ctx, [{ btn: "a", label: "Faster" }, { btn: "b", label: "Back" }]);
  };
  credSc.open = function () { return MQ.Scenes.pushP(credSc); };
  UI.Credits = credSc;

  // =============================================================
  // The title screen itself
  // =============================================================
  const RAIN_N = 70, STAR_N = 46;
  const rain = [], stars = [];
  for (let i = 0; i < RAIN_N; i++) rain.push({ x: 0, y: 0, len: 0, spd: 0, a: 0 });
  for (let i = 0; i < STAR_N; i++) stars.push({ x: 0, y: 0, r: 0, tw: 0 });

  const Title = {
    id: "title", touchPad: false,
    t: 0, seeded: false, busy: false,
    st: null, items: [], slots: null, hasSave: false,
    grinT: 0, grinAlpha: 0, settle: 0
  };
  const HINTS = [{ btn: "a", label: "Select" }, { btn: "start", label: "Continue" }];

  function seed(w, h) {
    const rnd = U.rng("grinmalkin");
    for (let i = 0; i < RAIN_N; i++) {
      const p = rain[i];
      p.x = rnd() * w; p.y = rnd() * h; p.len = 8 + rnd() * 18; p.spd = 0.35 + rnd() * 0.45; p.a = 0.06 + rnd() * 0.16;
    }
    for (let i = 0; i < STAR_N; i++) {
      const s = stars[i];
      s.x = rnd() * w; s.y = rnd() * h * 0.55; s.r = 0.6 + rnd() * 1.3; s.tw = rnd() * 6.28;
    }
    Title.seeded = true;
  }

  function loadableSlots() {
    const list = (MQ.Save && MQ.Save.slots) ? MQ.Save.slots() : [];
    let any = false, used = false;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].empty) used = true;
      if (!list[i].empty && !list[i].legacy && !list[i].corrupt) any = true;
    }
    Title.slots = list;
    Title.loadable = any;
    // A damaged or ancient slot still gets shown: hiding it would be a lie,
    // and picking it funnels honestly into a new game.
    Title.hasSave = used;
    return list;
  }

  function buildMenu() {
    loadableSlots();
    const items = Title.items;
    items.length = 0;
    items.push({ label: "Continue", value: "continue", disabled: !Title.hasSave, icon: "save" });
    items.push({ label: "New Game", value: "new", icon: "star" });
    items.push({ label: "Settings", value: "settings", icon: "cog" });
    items.push({ label: "Credits", value: "credits", icon: "book" });
    if (!Title.st) Title.st = UI.menuState(items, { visible: 4 });
    else Title.st.setItems(items);
    if (!Title.hasSave && Title.st.cursor === 0) Title.st.setCursor(1);
  }

  Title.enter = function () {
    Title.t = 0;
    Title.settle = 0;
    Title.busy = false;
    Title.grinT = 3000;
    buildMenu();
    TH().music("title");
    if (MQ.Save) MQ.Save.currentSlot = MQ.Save.currentSlot || null;
  };
  Title.resume = function () {
    Title.busy = false;
    buildMenu();
    TH().music("title");
  };
  Title.onResize = function () { Title.seeded = false; };

  // ---- flow ---------------------------------------------------
  Title.onStart = null;   // integration hook: fn({newGame, slot, name, difficulty})

  // MQ.Overworld is itself the pushable scene (id/enter/exit/update/draw),
  // not a `.scene` property or a `.start()` factory — support either shape.
  function pushOverworld(params) {
    if (MQ.Overworld && typeof MQ.Overworld.enter === "function" && MQ.Scenes) { MQ.Scenes.replace(MQ.Overworld, params); return true; }
    if (MQ.Overworld && MQ.Overworld.scene) { MQ.Scenes.replace(MQ.Overworld.scene, params); return true; }
    if (MQ.Overworld && MQ.Overworld.start) { MQ.Overworld.start(params); return true; }
    return false;
  }

  function handOff(info) {
    if (MQ.Events) MQ.Events.emit("game:start", info);
    try {
      if (typeof Title.onStart === "function") { Title.onStart(info); return; }
      if (MQ.Game && MQ.Game.start) { MQ.Game.start(info); return; }
      if (MQ.Story && MQ.Story.begin) { MQ.Story.begin(info); return; }
      if (info.newGame && MQ.Story && MQ.Story.chapters && MQ.Story.chapters[1] && MQ.Story.chapters[1].start && MQ.Script) {
        pushOverworld(info);
        MQ.Script.run(MQ.Story.chapters[1].start, {});
        return;
      }
      if (pushOverworld(info)) return;
    } catch (e) { MQ.warn("[Title] hand-off failed", e); }
    Title.busy = false;
    TH().say([
      "The county is not built yet - no overworld has registered itself.",
      "Everything else is ready and waiting: name taken, difficulty set, save slots live."
    ], { name: "Engine" });
  }

  function beginNewGame() {
    Title.busy = true;
    const Theme = TH();
    UI.NameEntry.open({ title: "What are you called?", subtitle: "Alder Labs need it for the contract.", initial: "Jim", max: 10 }).then(function (name) {
      if (!name) { Title.busy = false; return null; }
      return diffSc.open({ current: currentDifficulty() }).then(function (diff) {
        if (!diff) { Title.busy = false; return null; }
        setDifficulty(diff);
        return Theme.confirm("Ready, " + name + "? Everything from here is your own fault.").then(function (yes) {
          if (!yes) { Title.busy = false; return null; }
          try {
            if (MQ.Save && MQ.Save.newGame) MQ.Save.newGame();
            if (MQ.Trainer) MQ.Trainer.name = name;
            if (MQ.Flags) MQ.Flags.set("player_name", name);
            setDifficulty(diff);
            if (MQ.Save) MQ.Save.currentSlot = null;
          } catch (e) { MQ.warn("[Title] new game reset failed", e); }
          if (MQ.Scenes.transition) {
            return MQ.Scenes.transition("fade", 700).then(function () {
              handOff({ newGame: true, name: name, difficulty: diff, slot: null });
            });
          }
          handOff({ newGame: true, name: name, difficulty: diff, slot: null });
          return null;
        });
      });
    }).catch(function (e) { Title.busy = false; MQ.warn("[Title] new game flow", e); });
  }

  function continueGame() {
    Title.busy = true;
    const Theme = TH();
    UI.Save.open({ mode: "load" }).then(function (entry) {
      if (!entry) { Title.busy = false; return; }
      if (entry.legacy || entry.corrupt) {
        const msg = entry.corrupt
          ? ["That slot is damaged - the text in it is not a save any more.", "Nothing can be recovered from it. A new game can be written over the top."]
          : ["That save comes from an older Cheshire (version " + (entry.env && entry.env.version || 0) + ").", "It cannot be read by this build. A new game can be written over the top."];
        Theme.say(msg, { name: "Notebook" }).then(function () {
          return Theme.confirm("Start a new game instead?");
        }).then(function (yes) {
          Title.busy = false;
          if (yes) beginNewGame();
        });
        return;
      }
      const ok = MQ.Save && MQ.Save.load ? MQ.Save.load(entry.slot) : false;
      if (!ok) {
        Title.busy = false;
        Theme.sfx("ui_error");
        Theme.say(["That save would not open. It may have been written by a different build."], { name: "Notebook" });
        return;
      }
      const name = entry.summary && entry.summary.name ? entry.summary.name : "you";
      Theme.toast("Welcome back, " + name + ".");
      if (MQ.Scenes.transition) {
        MQ.Scenes.transition("fade", 700).then(function () { handOff({ newGame: false, slot: entry.slot }); });
      } else handOff({ newGame: false, slot: entry.slot });
    }).catch(function (e) { Title.busy = false; MQ.warn("[Title] continue flow", e); });
  }

  Title.choose = function (value) {
    const Theme = TH();
    if (value === "continue") { if (!Title.hasSave) { Theme.sfx("ui_error"); return; } Theme.sfx("ui_select"); continueGame(); return; }
    if (value === "new") { Theme.sfx("ui_select"); beginNewGame(); return; }
    if (value === "settings") {
      Theme.sfx("ui_select");
      if (UI.Settings && UI.Settings.open) { Title.busy = true; UI.Settings.open({ fromTitle: true }).then(function () { Title.busy = false; }); }
      else Theme.toast("Settings are not available yet.");
      return;
    }
    if (value === "credits") { Theme.sfx("ui_select"); Title.busy = true; UI.Credits.open().then(function () { Title.busy = false; TH().music("title"); }); return; }
  };

  Title.update = function (dt) {
    Title.t += dt;
    Title.grinT += dt;
    if (Title.settle < 1) Title.settle = Math.min(1, Title.settle + dt / 900);
    // grin cycle: appears, lingers, fades. Roughly every 11 seconds.
    const cycle = 11000;
    const p = (Title.grinT % cycle) / cycle;
    Title.grinAlpha = p < 0.12 ? (p / 0.12) * 0.5 : p < 0.34 ? 0.5 : p < 0.5 ? (1 - (p - 0.34) / 0.16) * 0.5 : 0;
    if (Title.busy) return;
    const res = Title.st.update();
    if (res) {
      if (res.selected !== undefined) { Title.choose(Title.items[res.selected].value); return; }
    }
    if (MQ.Input.pressed("start")) {
      MQ.Input.consume("start");
      Title.choose(Title.hasSave ? "continue" : "new");
    }
  };

  // ---- drawing -------------------------------------------------
  let skyGrad = null, skyH = 0;
  function drawSky(ctx, m) {
    if (!skyGrad || skyH !== m.h) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, m.h);
      skyGrad.addColorStop(0, "#0a0a1e"); skyGrad.addColorStop(0.55, "#1a1533"); skyGrad.addColorStop(1, "#2a1f2e");
      skyH = m.h;
    }
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, m.w, m.h);
    for (let i = 0; i < STAR_N; i++) {
      const s = stars[i];
      const tw = 0.35 + 0.35 * Math.sin(Title.t / 700 + s.tw);
      ctx.globalAlpha = tw;
      ctx.fillStyle = "#dfe6ee";
      ctx.fillRect(s.x, s.y, s.r * 2, s.r * 2);
    }
    ctx.globalAlpha = 1;
  }
  function drawHills(ctx, m) {
    const horizon = m.h * 0.70;
    // far ridge - Kerridge with White Nancy
    ctx.fillStyle = "#181430";
    ctx.beginPath();
    ctx.moveTo(0, horizon + 26);
    ctx.lineTo(m.w * 0.10, horizon - 10);
    ctx.lineTo(m.w * 0.24, horizon - 44);
    ctx.lineTo(m.w * 0.38, horizon - 4);
    ctx.lineTo(m.w * 0.52, horizon - 26);
    ctx.lineTo(m.w * 0.70, horizon + 8);
    ctx.lineTo(m.w, horizon - 16);
    ctx.lineTo(m.w, m.h); ctx.lineTo(0, m.h); ctx.closePath(); ctx.fill();
    // White Nancy on the ridge
    const nx = m.w * 0.24, ny = horizon - 44;
    ctx.fillStyle = "#e8e4d8";
    ctx.beginPath(); ctx.arc(nx, ny - 6, 7, Math.PI, 0); ctx.fill();
    ctx.fillRect(nx - 7, ny - 6, 14, 8);
    // near ridge
    ctx.fillStyle = "#0e0b1e";
    ctx.beginPath();
    ctx.moveTo(0, m.h);
    ctx.lineTo(0, horizon + 54);
    ctx.lineTo(m.w * 0.30, horizon + 30);
    ctx.lineTo(m.w * 0.55, horizon + 62);
    ctx.lineTo(m.w * 0.78, horizon + 34);
    ctx.lineTo(m.w, horizon + 58);
    ctx.lineTo(m.w, m.h); ctx.closePath(); ctx.fill();
    // Jodrell dish, right, quietly listening
    const dx = m.w * 0.84, dy = horizon - 12, dr = Math.min(54, m.w * 0.06);
    ctx.strokeStyle = "#2a2544"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(dx, dy, dr, Math.PI * 1.15, Math.PI * 1.95); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dx, dy + dr * 0.2); ctx.lineTo(dx, dy + 34); ctx.stroke();
    // mill chimney, left
    const cx = m.w * 0.09;
    ctx.fillStyle = "#221a30";
    ctx.fillRect(cx, horizon - 2, 12, 70);
    ctx.fillRect(cx - 3, horizon - 8, 18, 8);
  }
  function drawRain(ctx, m) {
    ctx.strokeStyle = "#9fb4d8"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < RAIN_N; i++) {
      const p = rain[i];
      p.y += p.spd * 3.2;
      p.x += p.spd * 0.7;
      if (p.y > m.h) { p.y = -20; p.x = (p.x + 137) % m.w; }
      if (p.x > m.w) p.x -= m.w;
      ctx.globalAlpha = p.a;
      ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.len * 0.22, p.y + p.len);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawWordmark(ctx, m) {
    const Theme = TH(), C = Theme.C;
    const e = U.ease.outBack(Title.settle);
    const y = m.t + 40 + (1 - e) * -40;
    const big = Math.round(Math.min(56, m.w / 17));
    ctx.save();
    ctx.globalAlpha = U.clamp(Title.settle * 1.3, 0, 1);
    T.draw(ctx, "MONSTERQUEST", m.cx + 3, y + 3, { size: big, align: "center", color: "rgba(0,0,0,0.6)" });
    T.draw(ctx, "MONSTERQUEST", m.cx, y, { size: big, align: "center", color: C.brassLit });
    const sub = Math.round(big * 0.42);
    T.draw(ctx, "THE CHESHIRE PROTOCOL", m.cx, y + big + 8, { size: sub, align: "center", color: C.cyber });
    ctx.restore();
  }

  Title.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    if (!Title.seeded) seed(m.w, m.h);
    drawSky(ctx, m);
    // the grin, high in the sky, where it has no business being
    if (Title.grinAlpha > 0.001) {
      Theme.grin(ctx, m.w * 0.66, m.h * 0.30, Math.min(300, m.w * 0.30), { alpha: Title.grinAlpha, open: 1 });
    }
    drawHills(ctx, m);
    drawRain(ctx, m);
    drawWordmark(ctx, m);

    // menu, bottom-left, big rows for thumbs
    const mw = Math.min(320, m.cw * 0.42);
    const rowH = Math.round(46 * m.k);
    const listH = Title.items.length * (rowH + 6);
    const mx = m.l + 8;
    const my = Math.min(m.b - Theme.FOOTER_H * m.k - listH - 14, m.h * 0.52);
    Theme.list(Title.st, ctx, {
      x: mx, y: my, w: mw, h: listH, rowH: rowH, gap: 6,
      render: function (c, item, x, y, w, h, sel) {
        const dis = item.disabled;
        c.fillStyle = sel ? "rgba(201,163,74,0.30)" : "rgba(14,12,26,0.66)";
        UI.roundRect(c, x, y, w, h, 8); c.fill();
        c.strokeStyle = sel ? C.brassLit : "rgba(139,124,192,0.35)";
        c.lineWidth = sel ? 3 : 1;
        UI.roundRect(c, x + 1, y + 1, w - 2, h - 2, 8); c.stroke();
        if (item.icon && UI.hasIcon(item.icon)) UI.icon(c, item.icon, x + 12, y + (h - 16) / 2, 1);
        T.draw(c, item.label, x + 40, y + (h - 18) / 2, { size: "m", color: dis ? "rgba(150,148,170,0.55)" : sel ? C.brassLit : C.text });
        if (item.value === "continue" && !dis && MQ.Save && MQ.Save.currentSlot) {
          T.draw(c, "slot " + MQ.Save.currentSlot, x + w - 12, y + (h - 14) / 2, { size: "s", align: "right", color: C.textDim });
        }
      }
    });

    // corner furniture
    T.draw(ctx, "v" + (MQ.VERSION || "2.0.0"), m.r, m.b - 18, { size: "s", align: "right", color: "rgba(160,158,190,0.55)" });
    if (!Title.hasSave) T.draw(ctx, "No saved runs found.", mx + 4, my - 20, { size: "s", color: C.textDim });
    else if (!Title.loadable) T.draw(ctx, "Saved data found, but not readable.", mx + 4, my - 20, { size: "s", color: C.warn });
    Theme.footer(ctx, HINTS);
  };

  UI.Title = Title;
})();
