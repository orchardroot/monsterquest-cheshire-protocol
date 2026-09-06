// MonsterQuest v2 — art workstream: MQ.MonsterArt, MQ.PeopleArt, MQ.FX.
"use strict";
const H = require("../headless");

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const MA = MQ.MonsterArt, PA = MQ.PeopleArt, FX = MQ.FX;
  const doc = env.document;
  function ctx2d() { return doc.createElement("canvas").getContext("2d"); }
  function drawCalls(c) { return c.getContext("2d").calls.length; }

  // ================= MQ.MonsterArt ==================================
  t("MonsterArt is published with the expected surface", function () {
    assert.ok(MA, "MQ.MonsterArt missing");
    ["sprite", "draw", "silhouette", "palette", "ids", "has", "warm", "clearCache", "stats", "archetypeOf"]
      .forEach(function (k) { assert.strictEqual(typeof MA[k], "function", "MonsterArt." + k); });
    assert.strictEqual(MA.SIZES.front, 64); assert.strictEqual(MA.SIZES.back, 52); assert.strictEqual(MA.SIZES.icon, 20);
  });

  t("every species id renders front, back and icon without throwing", function () {
    const ids = MA.ids();
    assert.ok(ids.length >= 172, "expected the full dex, got " + ids.length);
    const bad = [];
    ids.forEach(function (id) {
      MA.KINDS.forEach(function (kind) {
        let c = null;
        try { c = MA.sprite(id, kind); } catch (e) { bad.push(id + "/" + kind + ": " + e.message); return; }
        if (!c || !c.width) bad.push(id + "/" + kind + ": no canvas");
        else if (c.width !== MA.SIZES[kind] || c.height !== MA.SIZES[kind]) bad.push(id + "/" + kind + ": " + c.width + "x" + c.height);
      });
    });
    assert.strictEqual(bad.length, 0, bad.slice(0, 8).join("\n"));
  });

  t("every front sprite actually has pixels on it", function () {
    const thin = [];
    MA.ids().forEach(function (id) {
      const n = drawCalls(MA.sprite(id, "front"));
      if (n < 40) thin.push(id + ":" + n);
    });
    assert.strictEqual(thin.length, 0, "near-empty sprites: " + thin.slice(0, 8).join(" "));
  });

  t("sprites are cached and stable", function () {
    const a = MA.sprite("silkin", "front");
    const b = MA.sprite("silkin", "front");
    assert.strictEqual(a, b, "same canvas object returned from the cache");
    const shiny = MA.sprite("silkin", "front", { shiny: true });
    assert.notStrictEqual(a, shiny, "shiny is a separate sprite");
    assert.ok(drawCalls(shiny) > 20, "shiny renders");
  });

  t("shiny is a deterministic palette swap", function () {
    const p1 = MA.palette("brinewt", false), p2 = MA.palette("brinewt", true);
    assert.strictEqual(p1.length, p2.length);
    assert.notStrictEqual(p1[3], p2[3], "shiny mid colour differs");
    const again = MA.palette("brinewt", true);
    assert.strictEqual(p2.join("|"), again.join("|"), "shiny palette is stable across calls");
    p1.forEach(function (c, i) { if (i === 0) return; assert.ok(/^#[0-9a-f]{6}$/i.test(c), "slot " + i + " = " + c); });
  });

  t("the starters, legendaries, cats and constructs are hand-drawn", function () {
    ["silkin", "spindrake", "loomoth", "brinewt", "saltander", "halosaur",
     "kindlin", "stokerel", "furnacore",
     "merlynx", "terrataur", "zephyrion", "glitchra",
     "meadow", "grinmalkin", "grinkit",
     "oracle_core", "oracle_core_p2", "oracle_core_p3", "shardmind",
     "amoslurk", "understudy", "trojanox", "wormhack", "panoptix", "datadrake"]
      .forEach(function (id) {
        assert.ok(MA.isHandDrawn(id), id + " should be hand-tuned");
        assert.ok(drawCalls(MA.sprite(id, "front")) > 60, id + " front is too sparse");
      });
  });

  t("procedural species pick a sensible archetype", function () {
    assert.strictEqual(MA.archetypeOf("flitchick"), "bird");
    assert.strictEqual(MA.archetypeOf("nibbit"), "quadruped");
    assert.strictEqual(MA.archetypeOf("puddlish"), "fish");
    assert.strictEqual(MA.archetypeOf("bobbinet"), "machine");
    assert.strictEqual(MA.archetypeOf("nancylith"), "rock");
    assert.ok(MA.ARCHETYPES.length >= 12, "12 body archetypes");
  });

  t("silhouette and draw work on a plain 2d context", function () {
    const sil = MA.silhouette("gnawlord", "front");
    assert.ok(sil.width === 64 && drawCalls(sil) > 20);
    const g = ctx2d();
    const r = MA.draw(g, "gnawlord", "front", 200, 300, 2);
    assert.ok(r && r.w === 128, "draw returns its rect");
    MA.draw(g, "gnawlord", "back", 200, 300, 2, { flip: true, alpha: 0.5 });
    assert.ok(g.calls.indexOf("drawImage") >= 0);
  });

  t("an unknown species id degrades instead of throwing", function () {
    const c = MA.sprite("not_a_real_species", "front");
    assert.ok(c && c.width === 64);
    assert.strictEqual(MA.has("not_a_real_species"), false);
  });

  // ================= MQ.PeopleArt ===================================
  t("PeopleArt is published with the expected surface", function () {
    assert.ok(PA, "MQ.PeopleArt missing");
    ["frame", "sheet", "portrait", "size", "has", "ids", "warm", "stats"]
      .forEach(function (k) { assert.strictEqual(typeof PA[k], "function", "PeopleArt." + k); });
    assert.strictEqual(PA.DIRS.join(","), "down,left,right,up");
    assert.strictEqual(PA.FRAMES, 3, "3 walk frames per direction");
  });

  t("every ROSTER sprite id renders 4 directions x 3 frames", function () {
    const ids = PA.ids();
    assert.ok(ids.length >= 75, "expected ~80 sprite ids, got " + ids.length);
    const bad = [];
    ids.forEach(function (id) {
      const sz = PA.size(id);
      PA.DIRS.forEach(function (dir) {
        for (let f = 0; f < PA.FRAMES; f++) {
          let c = null;
          try { c = PA.frame(id, dir, f); } catch (e) { bad.push(id + "/" + dir + "/" + f + ": " + e.message); continue; }
          if (!c || c.width !== sz.w || c.height !== sz.h) bad.push(id + "/" + dir + "/" + f + ": wrong size");
          else if (drawCalls(c) < 12) bad.push(id + "/" + dir + "/" + f + ": near empty");
        }
      });
    });
    assert.strictEqual(bad.length, 0, bad.slice(0, 8).join("\n"));
  });

  t("the required cast, class, animal and vehicle ids all exist", function () {
    ("player player_bike player_boat mum mrs_bobbin vex vex_hood alder ada gaskell otis di nell jack ria mo root " +
     "alder_impostor root_impostor vex_impostor jim_impostor elis mamgu dai sue raj kim doc kellan twelve_k root_hivis " +
     "npc_walker npc_cyclist npc_fisher npc_weaver npc_shopkeep npc_dev npc_ranger npc_miner npc_caver npc_historian " +
     "npc_signaller npc_boater npc_saltworker npc_chemist npc_birder npc_fellrunner npc_farmer npc_bandsman npc_kid " +
     "npc_granny npc_cultist npc_stuffer npc_shadow_it npc_amos npc_darkbyte npc_whitehat npc_ghost_trainer npc_vex " +
     "npc_nurse npc_sysadmin npc_stoker treacle_tam spokes cat_meadow cat_grinkit dog deer sheep duck heron " +
     "boat_narrow boat_lift_caisson train train_loco train_apt oracle_terminal grinmalkin_wall")
      .split(" ").forEach(function (id) { assert.ok(PA.has(id), "missing sprite id " + id); });
  });

  t("frames are cached, direction-mirrored and variant-aware", function () {
    const a = PA.frame("player", "down", 0), b = PA.frame("player", "down", 0);
    assert.strictEqual(a, b, "cached");
    const l = PA.frame("player", "left", 1), r = PA.frame("player", "right", 1);
    assert.notStrictEqual(l, r, "right is its own canvas");
    assert.strictEqual(l.width, r.width);
    const base = PA.frame("npc_walker", "down", 0), v = PA.frame("npc_walker#1", "down", 0);
    assert.notStrictEqual(base, v, "palette variant is a separate sprite");
    assert.ok(drawCalls(v) > 12);
    assert.strictEqual(PA.frame("player", "down", 5), PA.frame("player", "down", 2), "frame index wraps");
  });

  t("sheet() lays out 3 frames x 4 directions", function () {
    const sz = PA.size("player");
    const s = PA.sheet("player");
    assert.strictEqual(s.width, sz.w * 3);
    assert.strictEqual(s.height, sz.h * 4);
    assert.ok(drawCalls(s) > 100);
  });

  t("portraits exist for the cast, the cats and the sigils", function () {
    ("player jim vex alder ada gaskell otis di nell jack ria mo root elis mamgu dai sue raj kim doc kellan twelve_k " +
     "mum mrs_bobbin npc_nurse npc_amos cat_meadow meadow oracle pippin sleet vigil arbiter grinmalkin")
      .split(" ").forEach(function (k) {
        const c = PA.portrait(k);
        assert.ok(c && c.width === 32 && c.height === 32, "portrait " + k + " should be 32x32");
        assert.ok(drawCalls(c) > 15, "portrait " + k + " is empty");
      });
    assert.strictEqual(PA.portrait("alder"), PA.portrait("alder"), "portraits are cached");
    const mon = PA.portrait("silkin");
    assert.ok(mon && mon.width === 20, "unknown keys fall back to the dex icon");
  });

  // ================= MQ.FX ==========================================
  t("FX is published with the expected surface", function () {
    assert.ok(FX, "MQ.FX missing");
    ["setWeather", "drawWeather", "light", "drawLighting", "spawn", "burst", "effect",
     "drawParticles", "shake", "flash", "shakeOffset", "battleAnim", "update", "draw", "reset", "stats"]
      .forEach(function (k) { assert.strictEqual(typeof FX[k], "function", "FX." + k); });
    assert.strictEqual(FX.WEATHERS.join(","), "clear,rain,fog,wind,sun,snow");
  });

  t("every weather kind updates and draws", function () {
    const g = ctx2d();
    FX.WEATHERS.forEach(function (w) {
      FX.setWeather(w, { instant: true });
      assert.strictEqual(FX.weather, w);
      for (let i = 0; i < 30; i++) FX.update(16.667);
      const before = g.calls.length;
      FX.drawWeather(g);
      if (w !== "clear") assert.ok(g.calls.length > before, w + " drew nothing");
    });
    FX.setWeather("nonsense");
    assert.strictEqual(FX.weather, "clear", "unknown weather falls back to clear");
  });

  t("the particle pool is bounded and never allocates past its cap", function () {
    FX.reset();
    for (let i = 0; i < 2000; i++) FX.spawn("sparkle", i, i, { life: 5000 });
    const n = FX.particleCount();
    assert.ok(n > 0 && n <= 260, "pool capped, got " + n);
    for (let i = 0; i < 400; i++) FX.update(16.667);
    assert.strictEqual(FX.particleCount(), 0, "particles expire and are recycled");
  });

  t("every particle kind and named effect draws", function () {
    const g = ctx2d();
    FX.reset();
    FX.KINDS.forEach(function (k) { FX.burst(k, 100, 100, 4, { life: 4000 }); });
    ["capture", "hit", "crit", "heal", "faint", "footstep", "sparkle", "evolve", "level"]
      .forEach(function (n) { FX.effect(n, 200, 200); });
    for (let i = 0; i < 5; i++) FX.update(16.667);
    const before = g.calls.length;
    FX.drawParticles(g);
    assert.ok(g.calls.length > before + 20, "particles drew");
  });

  t("day/night lighting with window glow", function () {
    const g = ctx2d();
    FX.light(100, 100, 60, "#ffd9a0", 1);
    FX.light(220, 140, 40);
    assert.strictEqual(FX.lightCount(), 2);
    FX.drawLighting(g, { phase: "night" });
    assert.strictEqual(FX.lightCount(), 0, "lights are consumed each frame");
    assert.ok(g.calls.indexOf("drawImage") >= 0, "night layer composited");
    assert.strictEqual(FX.tintFor("day").a, 0, "daytime has no tint");
    assert.ok(FX.tintFor("night").a > 0.4);
  });

  t("battleAnim covers every anim kind over the whole timeline", function () {
    const g = ctx2d();
    assert.strictEqual(FX.ANIMS.join(","), "slash,blast,beam,buff,debuff,heal,status,cyber");
    FX.ANIMS.concat(["mystery_kind"]).forEach(function (kind) {
      const before = g.calls.length;
      for (let i = 0; i <= 10; i++) FX.battleAnim(kind, g, { x: 240, y: 380 }, { x: 700, y: 200 }, i / 10, { type: "fire" });
      assert.ok(g.calls.length > before, kind + " drew nothing");
      assert.ok(FX.animDuration(kind) > 0);
    });
    FX.battleAnim("slash", null, null, null, 0.5);   // must not throw
  });

  t("FX takes over the core screen shake and flash", function () {
    assert.strictEqual(MQ.Scenes.shake, FX.shake);
    assert.strictEqual(MQ.Scenes.flash, FX.flash);
    assert.strictEqual(typeof MQ.Scenes._coreShake, "function", "the core version is kept");
    FX.reset();
    FX.shake(300, 8);
    FX.update(16.667);
    const off = FX.shakeOffset();
    assert.ok(Math.abs(off.x) <= 8 && Math.abs(off.y) <= 8, "shake stays inside its amplitude");
    assert.strictEqual(off, FX.shakeOffset(), "the offset object is reused, not reallocated");
    FX.flash(200, "#fff");
    const g = ctx2d();
    const before = g.calls.length;
    FX.drawScreen(g);
    assert.ok(g.calls.length > before, "flash drew");
    for (let i = 0; i < 40; i++) FX.update(16.667);
    assert.strictEqual(FX.shakeOffset().x, 0, "shake settles");
  });

  t("FX.update/draw survive junk input and a full reset", function () {
    const g = ctx2d();
    FX.update(NaN); FX.update(undefined);
    FX.setWeather("rain", { instant: true });
    FX.burst("ember", 10, 10, 5);
    FX.draw(g, { lighting: true, phase: "dusk" });
    FX.reset();
    assert.strictEqual(FX.particleCount(), 0);
    assert.strictEqual(FX.weather, "clear");
    FX.draw(g);
  });

  // ================= integration ====================================
  t("Boot.buildArt warms the art without throwing", function () {
    MQ.Boot.buildArt();
    MA.warm(["silkin", "meadow", "grinmalkin"]);
    PA.warm();
    FX.warm();
    assert.ok(MA.stats().cached > 0 && PA.stats().cached > 0);
  });
};
