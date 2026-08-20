// MonsterQuest v2 — audio tests: song book, scheduler maths, sfx table.
"use strict";
const H = require("../headless");

// Canonical ids from docs/design/ROSTER.md §7 and §8.
const ROSTER_SONGS = [
  "title", "town_macc", "town_bollington", "town_prestbury", "town_wilmslow", "town_alderley",
  "town_knutsford", "town_congleton", "town_crewe", "town_nantwich", "town_northwich",
  "town_frodsham", "town_warrington", "town_chester", "town_zoo", "town_berllan",
  "route_east", "route_bollin", "route_dane", "route_south", "route_salt", "route_mersey",
  "route_west", "route_wales", "dungeon_cave", "dungeon_bog", "dungeon_stack",
  "battle_wild", "battle_trainer", "battle_gym", "battle_boss", "battle_legendary",
  "battle_vex", "battle_champion", "cutscene_signal", "cutscene_orchard", "credits",
  "fanfare_badge", "fanfare_evolve", "fanfare_catch", "fanfare_heal", "fanfare_quest"
];
const ROSTER_SFX = [
  "ui_move", "ui_select", "ui_back", "ui_error", "ui_open", "ui_close", "text_tick",
  "step_grass", "step_stone", "step_wood", "step_water", "step_salt", "door", "warp",
  "ledge_hop", "bike_bell", "boat_chug", "train_pass", "train_whistle", "level_crossing",
  "rain", "wind", "fog_hum", "thunder", "signal_pulse", "oracle_tag", "agent_sleet",
  "agent_vigil", "agent_arbiter", "agent_pippin", "overdrive_ready", "overdrive_fire",
  "hit_normal", "hit_super", "hit_weak", "crit", "faint", "capsule_throw", "capsule_shake",
  "capsule_catch", "capsule_break", "heal", "status_apply", "stage_up", "stage_down",
  "evolve", "cat_meow", "cat_purr", "cat_sit", "bell_toll", "camera_shutter", "fish_bite",
  "brew_bubble", "coin", "achievement"
];
// Ids the core files call directly (see docs/design/CORE-API.md NEEDS).
const CORE_SFX = ["cursor", "confirm", "deny", "text", "item"];
const STINGERS = ["fanfare_badge", "fanfare_evolve", "fanfare_catch", "fanfare_heal", "fanfare_quest", "fanfare_victory", "fanfare_victory_gym"];

module.exports = function (t, assert) {
  const env = H.load();
  const MQ = env.MQ;
  const A = MQ.Audio;
  const Songs = MQ.Songs;
  const SFX = MQ.SFX;

  // ---- registration -------------------------------------------------
  t("MQ.Audio / MQ.Songs / MQ.SFX exist with the contract API", function () {
    ["init", "unlock", "playSong", "stopSong", "sfx", "cry", "setVolume", "mute", "jingle",
      "duck", "setLayer", "setVariant", "ambience", "compile", "scheduleWindow"].forEach(function (k) {
        assert.strictEqual(typeof A[k], "function", "MQ.Audio." + k + " missing");
      });
    ["define", "get", "has", "ids"].forEach(function (k) {
      assert.strictEqual(typeof Songs[k], "function", "MQ.Songs." + k);
      assert.strictEqual(typeof SFX[k], "function", "MQ.SFX." + k);
    });
    assert.strictEqual(MQ.Sfx, SFX, "ROSTER spells it MQ.Sfx");
  });

  t("every ROSTER song id is defined", function () {
    const missing = ROSTER_SONGS.filter(function (id) { return !Songs.has(id); });
    assert.deepStrictEqual(missing, [], "missing songs: " + missing.join(", "));
    assert.ok(Songs.ids().length >= 42, "expected >= 42 songs, got " + Songs.ids().length);
  });

  t("every ROSTER sfx id is defined, plus the ids core calls", function () {
    const missing = ROSTER_SFX.filter(function (id) { return !SFX.has(id); });
    assert.deepStrictEqual(missing, [], "missing sfx: " + missing.join(", "));
    const missingCore = CORE_SFX.filter(function (id) { return !SFX.has(id); });
    assert.deepStrictEqual(missingCore, [], "missing core aliases: " + missingCore.join(", "));
    assert.strictEqual(SFX.ids().length, 55, "ROSTER lists 55 sfx");
  });

  // ---- song compilation ----------------------------------------------
  t("every song compiles with aligned tracks and sane loop points", function () {
    const problems = [];
    Songs.each(function (song, id) {
      const c = A.compile(song, id);
      if (!c) { problems.push(id + ": did not compile"); return; }
      if (!c.tracks.length) problems.push(id + ": no tracks");
      if (!(c.bpm > 20 && c.bpm < 260)) problems.push(id + ": silly bpm " + c.bpm);
      for (let i = 0; i < c.tracks.length; i++) {
        const tr = c.tracks[i];
        // a track either fills the song, cycles a whole number of times
        // inside it, or is a whole number of songs long (truncated)
        const q = tr.raw >= c.totalBeats ? tr.raw / c.totalBeats : c.totalBeats / tr.raw;
        if (!(tr.raw > 0) || Math.abs(q - Math.round(q)) > 1e-6) {
          problems.push(id + " track '" + tr.name + "': " + tr.raw + " beats does not fit " + c.totalBeats);
        }
        if (!tr.evs.length) problems.push(id + " track '" + tr.name + "': empty");
      }
      if (c.loop) {
        if (!(c.loop.from >= 0 && c.loop.from < c.loop.to && c.loop.to <= c.bars)) {
          problems.push(id + ": bad loop " + c.loop.from + ".." + c.loop.to + " of " + c.bars);
        }
      }
    });
    assert.deepStrictEqual(problems, [], problems.join("\n  "));
  });

  t("looping songs are 32-64 bars; stingers are short one-shots", function () {
    const problems = [];
    Songs.each(function (song, id) {
      const c = A.compile(song, id);
      const stinger = STINGERS.indexOf(id) >= 0;
      if (stinger) {
        if (c.loop) problems.push(id + ": stinger should not loop");
        if (c.bars > 12) problems.push(id + ": stinger is " + c.bars + " bars");
      } else if (id !== "cutscene_signal" && id !== "place_station") {
        if (c.bars < 32 || c.bars > 64) problems.push(id + ": " + c.bars + " bars (want 32-64)");
        if (!c.loop) problems.push(id + ": should loop");
      }
    });
    assert.deepStrictEqual(problems, [], problems.join("\n  "));
  });

  t("every note lands inside its bar with a positive duration", function () {
    const problems = [];
    Songs.each(function (song, id) {
      const c = A.compile(song, id);
      for (let i = 0; i < c.tracks.length; i++) {
        const tr = c.tracks[i];
        for (let b = 0; b < c.bars; b++) {
          const evs = tr.bars[b];
          if (!evs) continue;
          for (let e = 0; e < evs.length; e++) {
            const ev = evs[e];
            if (ev.off < -1e-9 || ev.off >= c.beats) problems.push(id + "/" + tr.name + ": offset " + ev.off);
            if (!(ev.dur > 0)) problems.push(id + "/" + tr.name + ": duration " + ev.dur);
            if (ev.notes) {
              for (let n = 0; n < ev.notes.length; n++) {
                if (!(ev.notes[n] >= 12 && ev.notes[n] <= 120)) problems.push(id + "/" + tr.name + ": note " + ev.notes[n] + " out of range");
              }
            } else if (!MQ.Audio.drums[ev.drum]) {
              problems.push(id + "/" + tr.name + ": unknown drum '" + ev.drum + "'");
            }
          }
        }
      }
    });
    assert.deepStrictEqual(problems.slice(0, 20), [], problems.slice(0, 20).join("\n  "));
  });

  t("pitched tracks are monophonic (no overlapping notes on one voice)", function () {
    const problems = [];
    Songs.each(function (song, id) {
      const c = A.compile(song, id);
      for (let i = 0; i < c.tracks.length; i++) {
        const tr = c.tracks[i];
        if (tr.drums) continue;
        for (let e = 1; e < tr.evs.length; e++) {
          const prev = tr.evs[e - 1], cur = tr.evs[e];
          if (cur.b < prev.b - 1e-9) problems.push(id + "/" + tr.name + ": events out of order");
          // gate is < 1 so a legal note always ends before the next starts
          if (prev.b + prev.dur > cur.b + 1e-6) problems.push(id + "/" + tr.name + ": overlap at beat " + cur.b);
        }
      }
    });
    assert.deepStrictEqual(problems.slice(0, 10), [], problems.slice(0, 10).join("\n  "));
  });

  // ---- pattern DSL ----------------------------------------------------
  t("pattern parser: lengths, rests, ties, chords, accents, glides", function () {
    const p = A.parsePattern("0 4:2 . -:2 0+4+7:4 !12 ,7>5", false);
    assert.strictEqual(p.steps, 1 + 2 + 1 + 2 + 4 + 1 + 1);
    assert.strictEqual(p.evs.length, 5);
    assert.strictEqual(p.evs[0].notes.join(","), "0");
    assert.strictEqual(p.evs[1].len, 4, "the tie extends the 2-step note to 4");
    assert.strictEqual(p.evs[2].notes.join(","), "0,4,7");
    assert.ok(p.evs[3].vel > 1.2, "! accents");
    assert.ok(p.evs[4].vel < 0.8, ", softens");
    assert.strictEqual(p.evs[4].glide, 5);
    const dr = A.parsePattern("k...s...k...s...", true);
    assert.strictEqual(dr.steps, 16);
    assert.strictEqual(dr.evs.length, 4);
    assert.strictEqual(dr.evs[1].drum, "s");
  });

  t("MQ.Songs.m maps scale degrees onto semitones per mode", function () {
    assert.strictEqual(Songs.m("ionian", "0 2 4"), "0:4 4:4 7:4");
    assert.strictEqual(Songs.m("dorian", "0 2 4"), "0:4 3:4 7:4");
    assert.strictEqual(Songs.m("aeolian", "7 -1"), "12:4 -2:4");
    assert.strictEqual(Songs.m("ionian", "0+2+4:2"), "0+4+7:8");
    assert.strictEqual(Songs.m("ionian", "0>2:1"), "0>4:4");
  });

  // ---- scheduler maths -------------------------------------------------
  t("scheduleWindow: monotonic, non-negative, exactly one bar apart", function () {
    const c = A.compile(Songs.get("battle_wild"), "battle_wild");
    const evs = A.scheduleWindow(c, 0, 8, 0);
    assert.ok(evs.length > 50, "expected a busy bar");
    let last = -1;
    const barsSeen = {};
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i];
      assert.ok(e.t >= 0, "negative time " + e.t);
      assert.ok(e.t >= last - 1e-9, "times must be sorted");
      assert.ok(e.dur > 0, "non-positive duration");
      assert.ok(e.t + e.dur <= 8 * c.barDur + c.barDur, "note runs past the window");
      last = e.t;
      barsSeen[e.bar] = true;
    }
    assert.ok(Object.keys(barsSeen).length >= 4, "several distinct bars scheduled");
    // window offset by one bar == same window shifted by exactly barDur
    const a = A.scheduleWindow(c, 4, 4, 0);
    const b = A.scheduleWindow(c, 4, 4, c.barDur);
    assert.strictEqual(a.length, b.length);
    for (let i = 0; i < a.length; i++) assert.ok(Math.abs((b[i].t - a[i].t) - c.barDur) < 1e-6, "drift");
  });

  t("scheduleWindow follows loop points and never leaves the loop", function () {
    const c = A.compile(Songs.get("town_macc"), "town_macc");
    assert.ok(c.loop.from > 0, "town_macc has an intro before the loop");
    const evs = A.scheduleWindow(c, 0, c.bars + 12, 0);
    let sawIntro = false, sawWrap = false;
    for (let i = 0; i < evs.length; i++) {
      if (evs[i].bar < c.loop.from) sawIntro = true;
      assert.ok(evs[i].bar < c.bars, "bar index in range");
    }
    // after the first pass the intro bars must never come round again
    const late = A.scheduleWindow(c, c.loop.to - 1, 10, 0);
    for (let i = 0; i < late.length; i++) {
      if (late[i].bar >= c.loop.from) sawWrap = true;
      assert.ok(late[i].bar >= c.loop.from, "wrapped into the intro at bar " + late[i].bar);
    }
    assert.ok(sawIntro && sawWrap);
  });

  t("one-shot songs stop rather than wrapping", function () {
    const c = A.compile(Songs.get("fanfare_badge"), "fanfare_badge");
    assert.strictEqual(c.loop, null);
    const evs = A.scheduleWindow(c, 0, 40, 0);
    let maxBar = 0;
    for (let i = 0; i < evs.length; i++) if (evs[i].bar > maxBar) maxBar = evs[i].bar;
    assert.ok(maxBar < c.bars);
    assert.ok(evs[evs.length - 1].t < c.bars * c.barDur);
  });

  // ---- live scheduler --------------------------------------------------
  t("look-ahead scheduler queues 2+ bars, never in the past, no drift", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    assert.strictEqual(A.init(), true);
    assert.strictEqual(A.playSong("route_east", { fade: 0 }), true);
    const pb = A.playback();
    assert.ok(pb, "playback exists");
    const bd = pb.comp.barDur;
    assert.ok(pb.nextTime >= T, "nothing scheduled behind the clock");
    assert.ok(pb.nextTime - T >= 2 * bd - 1e-6, "at least two bars queued");
    // walk the clock forward in small steps; the horizon must stay ahead
    const start = pb.nextTime;
    // walk far enough that a 32-64 bar song comes round at least once
    const steps10 = Math.ceil((pb.comp.bars + pb.comp.loop.to - pb.comp.loop.from) * bd * 10) + 40;
    for (let i = 0; i < steps10; i++) {
      T += 0.1;
      A.tick();
      assert.ok(pb.nextTime >= T, "scheduled into the past at t=" + T);
      assert.ok(pb.nextTime - T >= 2 * bd - 1e-6 || pb.nextTime - T >= A.LOOKAHEAD, "horizon shrank");
      // no drift: the horizon only ever advances by whole bars
      const steps = (pb.nextTime - start) / bd;
      assert.ok(Math.abs(steps - Math.round(steps)) < 1e-6, "bar grid drifted");
    }
    assert.ok(pb.bar >= 0 && pb.bar < pb.comp.bars);
    assert.ok(pb.iterations >= 1, "looped at least once");
  });

  t("a throttled/suspended tab catches up without scheduling backwards", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.playSong("battle_gym", { fade: 0 });
    const pb = A.playback();
    const bd = pb.comp.barDur;
    T += 600;                       // ten minutes with no timer callbacks at all
    A.tick();
    assert.ok(pb.nextTime >= T, "recovered ahead of the clock, not behind it");
    assert.ok(pb.nextTime - T < A.LOOKAHEAD + bd + 1e-6, "did not queue the whole missing decade");
    assert.ok(pb.bar >= pb.comp.loop.from && pb.bar < pb.comp.loop.to, "still inside the loop");
    T += 0.1; A.tick();
    assert.ok(pb.nextTime >= T);
  });

  t("stopSong cancels every scheduled node and clears the current id", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.playSong("town_chester", { fade: 0 });
    const pb = A.playback();
    let stopped = 0;
    for (let i = 0; i < pb.nodes.length; i++) {
      const n = pb.nodes[i].n;
      const orig = n.stop;
      n.stop = function (when) { stopped++; assert.ok(when >= T - 1e-9, "stop scheduled in the past"); if (orig) orig(when); };
    }
    const count = pb.nodes.length;
    assert.ok(count > 0, "nodes were scheduled");
    A.stopSong({ fade: 0 });
    assert.strictEqual(stopped, count, "every node cancelled");
    assert.strictEqual(A.current, null);
    assert.strictEqual(A.playingId(), null);
  });

  t("crossfade keeps the old song alive until it has faded", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.playSong("route_east", { fade: 0 });
    const first = A.playback();
    A.playSong("battle_wild", { fade: 400 });
    assert.notStrictEqual(A.playback(), first);
    assert.strictEqual(A.playingId(), "battle_wild");
    assert.ok(first.stopped);
    assert.ok(A.stats().fading >= 1, "old song still fading");
    T += 2; A.tick();
    assert.strictEqual(A.stats().fading, 0, "fade finished and disposed");
  });

  t("playSong on the current song retunes layers instead of restarting", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.playSong("battle_boss", { fade: 0, layer: 0 });
    const pb = A.playback();
    T += 4; A.tick();
    const bar = pb.bar;
    A.playSong("battle_boss", { layer: 2 });
    assert.strictEqual(A.playback(), pb, "did not restart");
    assert.strictEqual(pb.layer, 2);
    assert.strictEqual(pb.bar, bar);
    A.setLayer(3);
    assert.strictEqual(pb.layer, 3);
    A.setVariant("cracked");
    assert.strictEqual(pb.variant, "cracked");
  });

  t("layers and variants gate the right tracks", function () {
    const boss = A.compile(Songs.get("battle_boss"), "battle_boss");
    let phase3 = 0;
    for (let i = 0; i < boss.tracks.length; i++) if (boss.tracks[i].layer === 3) phase3++;
    assert.ok(phase3 >= 1, "boss theme adds a track for the last phase");
    const vex = A.compile(Songs.get("battle_vex"), "battle_vex");
    let only = 0, not = 0;
    for (let i = 0; i < vex.tracks.length; i++) {
      if (vex.tracks[i].only) only++;
      if (vex.tracks[i].not) not++;
    }
    assert.ok(only >= 1 && not >= 1, "vex has a cracked variant that swaps a track");
  });

  t("jingle returns to the song it interrupted", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.playSong("route_east", { fade: 0 });
    A.jingle("fanfare_catch");
    assert.strictEqual(A.playingId(), "fanfare_catch");
    const pb = A.playback();
    assert.ok(pb.resumeTo && pb.resumeTo.id === "route_east");
    T += 20; A.tick(); A.tick();
    assert.strictEqual(A.playingId(), "route_east", "went back to the route theme");
  });

  t("aliases resolve (battle_rival, town_poynton, ending)", function () {
    assert.strictEqual(Songs.get("battle_rival"), Songs.get("battle_vex"));
    assert.strictEqual(Songs.get("town_poynton"), Songs.get("town_prestbury"));
    assert.strictEqual(Songs.get("ending"), Songs.get("credits"));
    assert.strictEqual(Songs.get("no_such_song"), null);
    assert.strictEqual(A.playSong("no_such_song"), false);
  });

  // ---- sfx --------------------------------------------------------------
  t("every sfx renders without throwing and stays inside the voice budget", function () {
    A.reset();
    A.timeSource = function () { return 0; };
    const ids = SFX.ids();
    for (let i = 0; i < ids.length; i++) {
      A.reset();
      const ok = A.sfx(ids[i]);
      assert.strictEqual(ok, true, ids[i] + " did not play");
      const spec = SFX.get(ids[i]);
      assert.ok(spec.grains && spec.grains.length, ids[i] + ": no grains");
      assert.ok(spec.dur > 0 && spec.dur < 6, ids[i] + ": daft duration " + spec.dur);
      for (let g = 0; g < spec.grains.length; g++) {
        const gr = spec.grains[g];
        assert.ok((gr.t || 0) >= 0, ids[i] + ": negative grain offset");
        assert.ok((gr.d || 0.12) > 0, ids[i] + ": non-positive grain duration");
        assert.ok(gr.drum || gr.n !== undefined || gr.f !== undefined || gr.i === "noise", ids[i] + ": grain has no source");
        if (gr.drum) assert.ok(A.drums[gr.drum], ids[i] + ": unknown drum " + gr.drum);
      }
    }
    A.reset();
    for (let k = 0; k < 100; k++) A.sfx("hit_normal", { pitch: 1 + k * 0.001 });
    assert.ok(A.stats().sfxVoices <= A.MAX_SFX_VOICES, "voice budget held");
  });

  t("sfx rate limiting stops text ticks machine-gunning", function () {
    A.reset();
    let T = 0;
    A.timeSource = function () { return T; };
    assert.strictEqual(A.sfx("text_tick"), true);
    assert.strictEqual(A.sfx("text_tick"), false, "second tick in the same instant is dropped");
    T += 0.05;
    assert.strictEqual(A.sfx("text_tick"), true);
    assert.strictEqual(A.sfx("nope_not_a_sound"), false);
  });

  t("core aliases point at real patches", function () {
    CORE_SFX.forEach(function (id) {
      const spec = SFX.get(id);
      assert.ok(spec, id);
      assert.ok(spec.grains.length, id);
      assert.strictEqual(A.sfx(id), true, id);
      A.reset();
    });
  });

  // ---- cries --------------------------------------------------------------
  t("cry is deterministic per species and varies between species", function () {
    A.reset();
    A.timeSource = function () { return 0; };
    const a1 = JSON.stringify(A.cryPlan("silkin"));
    const a2 = JSON.stringify(A.cryPlan("silkin"));
    const b1 = JSON.stringify(A.cryPlan("brinewt"));
    assert.strictEqual(a1, a2, "same species, same cry");
    assert.notStrictEqual(a1, b1, "different species, different cry");
    assert.strictEqual(A.cry("silkin"), true);
    assert.strictEqual(A.cry(null), false);
  });

  t("cry takes its flavour from the species' type when data exists", function () {
    MQ.Data.define("species", "test_sparker", { name: "Sparker", types: ["electric"], base: { hp: 40, atk: 50, def: 40, spa: 90, spd: 50, spe: 100 } });
    MQ.Data.define("species", "test_lump", { name: "Lump", types: ["rock"], base: { hp: 120, atk: 110, def: 130, spa: 40, spd: 60, spe: 20 } });
    const sp = A.cryPlan("test_sparker");
    const lu = A.cryPlan("test_lump");
    assert.strictEqual(sp.type, "electric");
    assert.strictEqual(lu.type, "rock");
    // the heavy rock lump growls lower than the sparky one
    assert.ok(lu.segs[0].n < sp.segs[0].n, "heavier species pitch lower");
    for (let i = 0; i < sp.segs.length; i++) {
      assert.ok(sp.segs[i].n >= 28 && sp.segs[i].n <= 104, "cry note in range");
      assert.ok(sp.segs[i].d > 0, "cry segment has length");
      assert.ok(sp.segs[i].t >= 0);
    }
    assert.ok(Object.keys(A.CRY_TYPE).length === 13, "one flavour per type");
  });

  // ---- mixer -----------------------------------------------------------------
  t("volumes, mute and the settings bridge", function () {
    A.setVolume("music", 0.3);
    assert.strictEqual(A.getVolume("music"), 0.3);
    A.setVolume("sfx", 2);            // clamped
    assert.strictEqual(A.getVolume("sfx"), 1);
    A.setVolume("music", -1);
    assert.strictEqual(A.getVolume("music"), 0);
    assert.strictEqual(A.mute(true), true);
    assert.strictEqual(A.sfx("ui_move"), false, "muted means silent");
    assert.strictEqual(A.mute(false), false);
    MQ.Settings = { get: function (k) { return { music: 0.5, sfx: 8, master: 0.9 }[k]; } };
    A.applySettings();
    assert.strictEqual(A.getVolume("music"), 0.5);
    assert.strictEqual(A.getVolume("sfx"), 0.8, "0-10 scales are normalised");
    assert.strictEqual(A.getVolume("master"), 0.9);
    delete MQ.Settings;
  });

  t("save provider round-trips the mixer", function () {
    A.setVolume("music", 0.42);
    A.mute(true);
    const blob = JSON.parse(JSON.stringify(A.saveProvider.save()));
    A.setVolume("music", 0.9);
    A.mute(false);
    A.saveProvider.load(blob);
    assert.strictEqual(A.getVolume("music"), 0.42);
    assert.strictEqual(A.isMuted(), true);
    A.mute(false);
    A.saveProvider.load(undefined);   // must not throw
  });

  t("ducking dips the music and recovers", function () {
    let T = 0;
    A.timeSource = function () { return T; };
    A.reset();
    A.setVolume("music", 0.6);
    A.playSong("town_macc", { fade: 0 });
    A.duck(0.5, 300);
    assert.ok(A.stats().ready);
    T += 1; A.tick();
    assert.strictEqual(A.getVolume("music"), 0.6, "duck does not clobber the setting");
  });

  t("ambience beds start, swap and stop", function () {
    A.reset();
    A.timeSource = function () { return 0; };
    assert.strictEqual(A.ambience("cave"), true);
    assert.strictEqual(A.ambienceId(), "cave");
    assert.strictEqual(A.ambience("town"), true);
    assert.strictEqual(A.ambienceId(), "town");
    assert.strictEqual(A.ambience("none"), true);
    assert.strictEqual(A.ambienceId(), null);
    assert.strictEqual(A.ambience("not_a_place"), false);
  });

  t("unlock is idempotent and survives being called on every gesture", function () {
    for (let i = 0; i < 5; i++) assert.strictEqual(A.unlock(), true);
    assert.strictEqual(A.unlocked, true);
    assert.strictEqual(A.init(), true);
  });

  t("a song queued before unlock plays once the context arrives", function () {
    const env2 = H.load();
    const A2 = env2.MQ.Audio;
    A2.ready = false; A2.ctx = null;
    A2.pending = { id: "title", opts: { fade: 0 } };
    A2.timeSource = null;
    assert.strictEqual(A2.unlock(), true);
    assert.strictEqual(A2.playingId(), "title");
  });

  t("headless never starts a real timer", function () {
    assert.strictEqual(env.MQ.HEADLESS, true);
    assert.strictEqual(typeof A.stopTicker, "function");
    A.stopTicker();
    A.reset();
  });
};
