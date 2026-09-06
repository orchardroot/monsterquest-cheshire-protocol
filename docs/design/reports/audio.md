# Workstream report — **audio**

Branch `ws/audio`. Everything is synthesised at runtime: there is not a single audio
file in the repo, and there never will be.

| File | Lines | What |
|---|---|---|
| `js/audio/audio.js` | ~1800 | `MQ.Audio` — WebAudio graph, 24 instruments, 19 drum voices, song compiler, look-ahead scheduler, mixer, cries, ambience |
| `js/audio/songs.js` | ~1480 | `MQ.Songs` — the song book: 46 songs (all 42 ROSTER §7 ids + 4 extras), written in a scale-degree DSL |
| `js/audio/sfx.js` | ~335 | `MQ.SFX` (aliased `MQ.Sfx`) — 55 ROSTER §8 patches plus the short aliases core/UI call |
| `tools/test/test-audio.js` | ~530 | 33 tests: song book, compiler maths, scheduler, mixer, cries, sfx |

Load order `audio.js → songs.js → sfx.js`; nothing runs game logic at parse time.

---

## 1. Public API

```js
MQ.Audio.init()                       // build the graph (boot.js calls it)
MQ.Audio.unlock()                     // first-gesture resume (Input calls it on every gesture; idempotent)
MQ.Audio.playSong(id, {fade, layer, variant, fromBar, restart})
MQ.Audio.stopSong({fade})
MQ.Audio.jingle(id, backTo)           // fanfare over the top, then back to the song it interrupted
MQ.Audio.sfx(id, {pitch, vol, when})
MQ.Audio.cry(speciesId, {pitch, vol, type, dur})
MQ.Audio.ambience(kind, {fade})       // town forest water cave moor industrial marsh rail server sea | "none"
MQ.Audio.duck(amount, ms)             // dip the music under a cutscene line or a cry
MQ.Audio.setLayer(n) / setVariant(tag) / setPhase(n)
MQ.Audio.setVolume(kind, v)           // master | music | sfx | cry | ambience
MQ.Audio.setMusicVolume(v) / setSfxVolume(v)   // 0-1 or 0-10; MQ.Settings.apply() calls these
MQ.Audio.mute(on) / isMuted() / getVolume(kind)
MQ.Audio.playingId() / songBar() / stats()
```

Pure, headless-testable maths is exposed too: `compile(song, id)`, `scheduleWindow(comp, fromBar, nBars, t0)`,
`parsePattern(pat, isDrums)`, `cryPlan(speciesId)`.

`MQ.Songs` / `MQ.SFX` both expose `define(id, def) get has ids each table`, and `MQ.SFX.play(id, opts)`
(the spelling `MQ.Sfx.play` that ROSTER §8 and `js/ui/theme.js` use).

## 2. Scheduler

A "tale of two clocks" scheduler on `AudioContext.currentTime`. Every bar is placed at
`t0 + n * barDur` — an absolute grid, so 40 minutes of Chester organ never drifts a millisecond.
It keeps `LOOKAHEAD` (2.5 s) **and** at least `MIN_BARS_AHEAD` (2 bars) queued, whichever is longer,
so a background tab whose timers are throttled to 1 Hz still plays in time. If the tab was suspended
outright, the catch-up path skips whole bars forward along the loop rather than scheduling a decade of
music into the past. `stopSong` calls `stop(when)` on every node it ever created — never in the past —
and drops the reference, so nothing leaks and nothing plays after a scene change.

## 3. Songs

A song is data: `{bpm, key, beats, bars, loop:{from,to}, patterns:{...}, tracks:[...]}`.
Patterns are written in scale degrees (`m("dorian", "0 2 4:1.5 2:0.5")`), chord comps (`ch`),
bass lines (`bl`), arpeggios (`ap`) and drum strings (`"k..hs..hk.h.s..h"`); the compiler expands them
onto a step grid, cycles a short track to fill the song (tracker-style ostinato) and buckets every
event by bar so scheduling allocates nothing per frame.

The county theme (`COUNTY_A` / `COUNTY_B` over `PROG_COUNTY`) is Cheshire's leitmotif: Macclesfield
plays it in Dorian, Chester in Ionian with an organ, the routes walk it, `battle_wild` shreds it and
the credits reprise it. Regional families share colour — flute and strings on `east`/`bollin`, rail
snare on `dane`/`south`, wind pads on `salt`/`mersey`/`west`, harp alone on `wales`. Both cats have a
motif (`MEADOW`, answered an octave up) and ORACLE has a four-note tag that turns up wherever it is listening.

Every looping song is 32-64 bars with an intro before `loop.from`, a B section and real chord changes;
the stingers are 3-8 bars and do not loop. Variants gate tracks: `town_prestbury` grows an engine chug
as `poynton`, `town_congleton` a cross-hum as `sandbach`, `town_frodsham` fog as `runcorn`, `town_zoo`
a flare hum as `port`, `battle_vex` goes minor as `cracked`, `credits` has an ending per flag; layers
add a track per boss phase.

## 4. SFX and cries

All 55 ROSTER §8 ids as short grain patches (oscillator / FM / noise grains with filters, sweeps and
repeats), plus aliases so the ids the core already calls resolve: `cursor confirm deny text item
blip cancel catch levelup shake throw ...`. Voices are capped (`MAX_SFX_VOICES`) and the text tick is
rate-limited so dialogue cannot machine-gun.

`cry(speciesId)` is deterministic per species. It uses the data team's `species.cry`
(`{wave, base, len, slide, noise, vib, gain}`) when present — base Hz becomes the starting note,
`len` the duration, `slide` the target the segments walk towards — and colours the bends with a
per-type flavour (`CRY_TYPE`, one per type). A species with no `cry` block still gets a plausible
voice derived from its types and base stats, so test stubs and new species never fall silent.

## 5. NEEDS

* Nothing blocking. The Settings bridge reads `music`/`musicVolume`/`sfx`/`sfxVolume`/`master` at
  either 0-1 or 0-10, and `MQ.Settings.apply()` in `js/content/state.js` now finds
  `setMusicVolume`/`setSfxVolume`.
* Maps that want a bed should set `ambience:` to one of the ten kinds above; anything else is ignored.
* Scenes wanting the music to dip under a line should call `MQ.Audio.duck(0.35, 300)`.

## 6. NEW IDS

Beyond ROSTER §7: `dungeon_mill` (the mill interiors), `place_station` (a short station-platform
loop), `fanfare_victory`, `fanfare_victory_gym`. Song aliases (not new songs) resolve
`battle_rival town_poynton town_sandbach town_runcorn town_lymm ending battle fame victory gym town route`.

## 7. Known gaps

* No per-note stereo movement beyond static `pan`; no reverb impulse (a feedback-delay send stands in).
* Boss phase layers are wired but only `battle_boss` uses more than two.
* Songs are compiled lazily on first play; the first bar after a scene change costs ~1 ms of compile.
