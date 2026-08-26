// =============================================================
// MonsterQuest v2 — MQ.Script (core): generator-based cutscene /
// event runner + command library. Every command degrades
// gracefully when its target subsystem is not loaded.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const timers = [];        // {left, resolve}
  const cmds = {};
  const Script = { cmds: cmds, running: 0, timers: timers, log: [] };

  function P(v) { return Promise.resolve(v); }
  function has(path) {
    const parts = path.split(".");
    let o = MQ;
    for (let i = 0; i < parts.length; i++) { if (!o || o[parts[i]] === undefined || o[parts[i]] === null) return null; o = o[parts[i]]; }
    return o;
  }
  function isGen(v) { return v && typeof v.next === "function" && typeof v.throw === "function"; }
  function isGenFn(v) {
    return typeof v === "function" && v.constructor && (v.constructor.name === "GeneratorFunction" || String(v).indexOf("function*") === 0);
  }
  function C(name, a) { return { cmd: name, args: a }; }

  // ---- command constructors (return descriptors; runner executes) --
  cmds.say = function (pages, opts) { return C("say", [pages, opts]); };
  cmds.ask = function (q, choices, opts) { return C("ask", [q, choices, opts]); };
  cmds.choice = function (choices, q, opts) { return C("ask", [q || "", choices, opts]); };
  cmds.confirm = function (q, opts) { return C("confirm", [q, opts]); };
  cmds.wait = function (ms) { return C("wait", [ms]); };
  cmds.waitPress = function (action) { return C("waitPress", [action || "a"]); };
  cmds.move = function (who, path, opts) { return C("move", [who, path, opts]); };
  cmds.face = function (who, dir) { return C("face", [who, dir]); };
  cmds.teleport = function (who, mapId, x, y, dir) { return C("teleport", [who, mapId, x, y, dir]); };
  cmds.warp = function (mapId, x, y, dir) { return C("warp", [mapId, x, y, dir]); };
  cmds.setFlag = function (id, val) { return C("setFlag", [id, val]); };
  cmds.addFlag = function (id, n) { return C("addFlag", [id, n]); };
  cmds.giveItem = function (id, n) { return C("giveItem", [id, n]); };
  cmds.takeItem = function (id, n) { return C("takeItem", [id, n]); };
  cmds.giveMoney = function (n) { return C("giveMoney", [n]); };
  cmds.giveMonster = function (spec) { return C("giveMonster", [spec]); };
  cmds.heal = function () { return C("heal", []); };
  cmds.battle = function (opts) { return C("battle", [opts]); };
  cmds.music = function (song) { return C("music", [song]); };
  cmds.sfx = function (id) { return C("sfx", [id]); };
  cmds.shake = function (ms, amp) { return C("shake", [ms, amp]); };
  cmds.flash = function (ms, color) { return C("flash", [ms, color]); };
  cmds.fadeOut = function (ms) { return C("fadeOut", [ms]); };
  cmds.fadeIn = function (ms) { return C("fadeIn", [ms]); };
  cmds.banner = function (t, s) { return C("banner", [t, s]); };
  cmds.notify = function (t) { return C("notify", [t]); };
  cmds.spawnNpc = function (def) { return C("spawnNpc", [def]); };
  cmds.removeNpc = function (id) { return C("removeNpc", [id]); };
  cmds.showNpc = function (id, b) { return C("showNpc", [id, b]); };
  cmds.camera = function (x, y, ms) { return C("camera", [x, y, ms]); };
  cmds.cameraFollow = function () { return C("cameraFollow", []); };
  cmds.weather = function (kind) { return C("weather", [kind]); };
  cmds.time = function (phase) { return C("time", [phase]); };
  cmds.quest = {
    start: function (id) { return C("questStart", [id]); },
    advance: function (id) { return C("questAdvance", [id]); },
    complete: function (id) { return C("questComplete", [id]); }
  };
  cmds.unlock = function (id) { return C("unlock", [id]); };
  cmds.achievement = function (id) { return C("achievement", [id]); };
  cmds.parallel = function (list) { return C("parallel", [list]); };
  cmds.call = function (genFn, ctx) { return C("call", [genFn, ctx]); };
  cmds.emit = function (ev, data) { return C("emit", [ev, data]); };
  cmds.custom = function (fn) { return C("custom", [fn]); };
  cmds.log = function (msg) { return C("log", [msg]); };
  cmds.freeze = function (b) { return C("freeze", [b]); };
  cmds.hideHud = function (b) { return C("hideHud", [b]); };
  cmds.transition = function (kind, ms) { return C("transition", [kind, ms]); };

  // ---- executors ----------------------------------------------------
  const exec = {};
  exec.say = function (a) { return MQ.Dialog ? MQ.Dialog.say(a[0], a[1]) : P(); };
  exec.ask = function (a) { return MQ.Dialog ? MQ.Dialog.ask(a[0], a[1], a[2]) : P(a[1] && a[1][0] && a[1][0].value); };
  exec.confirm = function (a) { return MQ.Dialog ? MQ.Dialog.confirm(a[0], a[1]) : P(true); };
  exec.wait = function (a) {
    return new Promise(function (resolve) { timers.push({ left: a[0] || 0, resolve: resolve }); });
  };
  exec.waitPress = function (a) {
    return new Promise(function (resolve) { timers.push({ left: 1e12, action: a[0], resolve: resolve }); });
  };
  exec.move = function (a) {
    const ow = has("Overworld.moveEntity");
    return ow ? P(ow(a[0], a[1], a[2] || {})) : P();
  };
  exec.face = function (a) {
    const f = has("Overworld.faceEntity");
    if (f) return P(f(a[0], a[1]));
    const g = has("Overworld.getNpc");
    if (g && a[0] !== "player") { const n = g(a[0]); if (n) n.dir = a[1]; }
    else if (a[0] === "player" && MQ.Overworld && MQ.Overworld.state) MQ.Overworld.state.dir = a[1];
    return P();
  };
  exec.teleport = function (a) {
    if (a[0] === "player") { const w = has("Overworld.warp"); return w ? P(w(a[1], a[2], a[3], a[4], { fade: false })) : P(); }
    const pl = has("Overworld.placeNpc");
    return pl ? P(pl(a[0], a[1], a[2], a[3], a[4])) : P();
  };
  exec.warp = function (a) {
    const w = has("Overworld.warp");
    return w ? P(w(a[0], a[1], a[2], a[3], { fade: true })) : P();
  };
  exec.setFlag = function (a) { MQ.Flags.set(a[0], a[1]); return P(); };
  exec.addFlag = function (a) { MQ.Flags.add(a[0], a[1]); return P(); };
  exec.giveItem = function (a) {
    const n = a[1] === undefined ? 1 : a[1];
    const inv = has("Inventory.add");
    if (inv) inv(a[0], n); else MQ.Flags.add("item_" + a[0], n);
    let name = a[0];
    if (MQ.Data && MQ.Data.items && MQ.Data.items[a[0]]) name = MQ.Data.items[a[0]].name;
    if (MQ.UI && MQ.UI.toast) MQ.UI.toast("Received " + name + (n > 1 ? " x" + n : ""));
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("item");
    return P();
  };
  exec.takeItem = function (a) {
    const n = a[1] === undefined ? 1 : a[1];
    const inv = has("Inventory.remove");
    if (inv) inv(a[0], n); else MQ.Flags.add("item_" + a[0], -n);
    return P();
  };
  exec.giveMoney = function (a) {
    if (MQ.Inventory && typeof MQ.Inventory.money === "number") MQ.Inventory.money = Math.max(0, MQ.Inventory.money + a[0]);
    else MQ.Flags.add("money", a[0]);
    if (MQ.UI && MQ.UI.toast && a[0] > 0) MQ.UI.toast("Received " + U.fmtMoney(a[0]));
    return P();
  };
  exec.giveMonster = function (a) {
    const add = has("Party.add");
    if (!add) return P(null);
    let mon = a[0];
    if (mon && !mon.uid && MQ.Data && MQ.Data.makeMonster) mon = MQ.Data.makeMonster(mon.species, mon.level || 5, mon);
    const where = add(mon);
    // A gift still belongs in the Field Dex — obtained(), not record(), so the
    // starter is not counted as a capture.
    if (mon && mon.species && MQ.Trainer && MQ.Trainer.obtained) {
      try { MQ.Trainer.obtained(mon.species, { map: mon.metAt && mon.metAt.map, level: mon.level, how: "gift" }); }
      catch (e) { MQ.warn("[Script] giveMonster: dex write failed", e); }
    }
    return P(where);
  };
  exec.heal = function () { const h = has("Party.heal"); if (h) h(); return P(); };
  exec.battle = function (a) {
    const st = has("Battle.start");
    const opts = a[0] || {};
    if (!st) return P({ won: true, fled: false, caught: null, outcome: "win", result: { outcome: "win", fake: true } });
    return P(st(opts)).then(function (r) {
      r = r || { outcome: "win" };
      // The overworld and the trainer card listen for this; without it a
      // story fight that was lost never counted, and never sent you home.
      if (MQ.Events && !r.stub) MQ.Events.emit("battle:end", r);
      return { won: r.outcome === "win" || r.outcome === "catch", fled: r.outcome === "run", caught: r.caught || null, lost: r.outcome === "lose", outcome: r.outcome, result: r };
    });
  };
  exec.music = function (a) { const f = has("Audio.playSong") || has("Audio.play"); if (f) f(a[0]); return P(); };
  exec.sfx = function (a) { const f = has("Audio.sfx"); if (f) f(a[0]); return P(); };
  exec.shake = function (a) { const f = has("FX.shake"); if (f) f(a[0], a[1]); else if (MQ.Scenes) MQ.Scenes.shake(a[0], a[1]); return P(); };
  exec.flash = function (a) { const f = has("FX.flash"); if (f) f(a[0], a[1]); else if (MQ.Scenes) MQ.Scenes.flash(a[0], a[1]); return P(); };
  exec.fadeOut = function (a) { return MQ.Scenes ? MQ.Scenes.fadeOut(a[0]) : P(); };
  exec.fadeIn = function (a) { return MQ.Scenes ? MQ.Scenes.fadeIn(a[0]) : P(); };
  exec.transition = function (a) { return MQ.Scenes ? MQ.Scenes.transition(a[0], a[1]) : P(); };
  exec.banner = function (a) { if (MQ.Dialog) MQ.Dialog.banner(a[0], a[1]); return P(); };
  exec.notify = function (a) { if (MQ.Dialog) MQ.Dialog.notify(a[0]); return P(); };
  exec.spawnNpc = function (a) { const f = has("Overworld.spawnNpc") || has("NPC.spawn"); return P(f ? f(a[0]) : null); };
  exec.removeNpc = function (a) { const f = has("Overworld.removeNpc") || has("NPC.remove"); if (f) f(a[0]); return P(); };
  exec.showNpc = function (a) {
    const f = has("Overworld.showNpc");
    if (f) f(a[0], a[1] !== false);
    else { const g = has("Overworld.getNpc"); if (g) { const n = g(a[0]); if (n) n.hidden = a[1] === false; } }
    return P();
  };
  exec.camera = function (a) { const f = has("Overworld.cameraTo"); return f ? P(f(a[0], a[1], a[2])) : P(); };
  exec.cameraFollow = function () { const f = has("Overworld.cameraFollow"); if (f) f(); return P(); };
  exec.weather = function (a) { const f = has("Clock.setWeather"); if (f) f(a[0]); return P(); };
  exec.time = function (a) { const f = has("Clock.setPhase"); if (f) f(a[0]); return P(); };
  exec.questStart = function (a) { const f = has("Quests.start"); if (f) f(a[0]); else MQ.Flags.set("quest_" + a[0], 0); return P(); };
  exec.questAdvance = function (a) { const f = has("Quests.advance"); if (f) f(a[0]); else MQ.Flags.add("quest_" + a[0], 1); return P(); };
  exec.questComplete = function (a) { const f = has("Quests.complete"); if (f) f(a[0]); else MQ.Flags.set("quest_" + a[0] + "_done", true); return P(); };
  exec.unlock = function (a) {
    const ab = has("Overworld.state.abilities");
    if (ab && ab.add) ab.add(a[0]);
    MQ.Flags.set("unlock_" + a[0], true);
    return P();
  };
  exec.achievement = function (a) { const f = has("Achievements.unlock"); if (f) f(a[0]); else if (MQ.UI) MQ.UI.toast("Achievement: " + a[0]); return P(); };
  exec.parallel = function (a, ctx) {
    const list = a[0] || [];
    const ps = [];
    for (let i = 0; i < list.length; i++) ps.push(Script.exec(list[i], ctx));
    return Promise.all(ps);
  };
  exec.call = function (a, ctx) { return Script.run(a[0], a[1] || ctx, { nested: true }); };
  exec.emit = function (a) { if (MQ.Events) MQ.Events.emit(a[0], a[1]); return P(); };
  exec.custom = function (a, ctx) { return P(a[0](ctx)); };
  exec.log = function (a) { Script.log.push(a[0]); MQ.log("[Script]", a[0]); return P(); };
  exec.freeze = function (a) { const f = has("Overworld.freeze"); if (f) f(a[0] !== false); return P(); };
  exec.hideHud = function (a) { const f = has("Overworld.hideHud"); if (f) f(a[0] !== false); return P(); };
  Script.executors = exec;

  // Execute any yieldable: command descriptor, Promise, generator, generator fn, array (parallel), function
  Script.exec = function (v, ctx) {
    if (v === undefined || v === null) return P();
    if (typeof v.then === "function") return v;
    if (Array.isArray(v)) return exec.parallel([v], ctx);
    if (isGen(v)) return runGen(v, ctx);
    if (isGenFn(v)) return Script.run(v, ctx, { nested: true });
    if (typeof v === "function") return P(v(ctx));
    if (v.cmd) {
      const fn = exec[v.cmd];
      if (!fn) { MQ.warn("[Script] unknown command " + v.cmd); return P(); }
      try { return fn(v.args, ctx); } catch (e) { return Promise.reject(e); }
    }
    return P(v);
  };

  function runGen(gen, ctx) {
    return new Promise(function (resolve, reject) {
      function step(method, val) {
        let r;
        try { r = gen[method](val); }
        catch (e) { reject(e); return; }
        if (r.done) { resolve(r.value); return; }
        Script.exec(r.value, ctx).then(function (v) { step("next", v); }, function (e) { step("throw", e); });
      }
      step("next", undefined);
    });
  }

  function beginCutscene() {
    Script.running++;
    if (Script.running === 1) {
      const f = has("Overworld.freeze"); if (f) f(true);
      if (MQ.Events) MQ.Events.emit("script:start");
    }
  }
  function endCutscene() {
    Script.running = Math.max(0, Script.running - 1);
    if (Script.running === 0) {
      const f = has("Overworld.freeze"); if (f) f(false);
      if (MQ.Events) MQ.Events.emit("script:end");
    }
  }

  // run(genFn|generator, ctx, opts) → Promise<return value>
  Script.run = function (genFn, ctx, opts) {
    ctx = ctx || {};
    if (!ctx.S) ctx.S = cmds;
    const nested = opts && opts.nested;
    let gen;
    try { gen = isGen(genFn) ? genFn : genFn(ctx); }
    catch (e) { return Promise.reject(e); }
    if (!isGen(gen)) {
      // plain function that returned a value/promise
      return P(gen);
    }
    if (!nested) beginCutscene();
    return runGen(gen, ctx).then(function (v) {
      if (!nested) endCutscene();
      return v;
    }, function (e) {
      if (!nested) endCutscene();
      MQ.warn("[Script] error:", e);
      throw e;
    });
  };
  Script.busy = function () { return Script.running > 0; };

  // Run a named NPC script from MQ.Story.npcScripts (or say lines)
  Script.runNpc = function (id, ctx) {
    const table = has("Story.npcScripts");
    const fn = table && table[id];
    if (!fn) return P();
    return Script.run(fn, ctx);
  };

  // Ticked by MQ.Loop.step: advance wait timers (game time), waitPress
  Script.update = function (dt) {
    for (let i = timers.length - 1; i >= 0; i--) {
      const t = timers[i];
      if (t.action) {
        if (MQ.Input && MQ.Input.pressed(t.action)) { MQ.Input.consume(t.action); timers.splice(i, 1); t.resolve(); }
        continue;
      }
      t.left -= dt;
      if (t.left <= 0) { timers.splice(i, 1); t.resolve(); }
    }
  };

  MQ.Script = Script;
})();
