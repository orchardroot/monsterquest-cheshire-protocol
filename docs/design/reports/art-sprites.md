# art-sprites — workstream report

Branch `ws/art-sprites` (merged `ws/data` first, so everything is built and
tested against the real `MQ.Data.species` gen params).

Files owned and delivered:

| file | global | lines |
|---|---|---|
| `js/art/monsters.js` | `MQ.MonsterArt` | ~1600 |
| `js/art/people.js` | `MQ.PeopleArt` | ~740 |
| `js/art/fx.js` | `MQ.FX` | ~700 |
| `tools/test/test-art-sprites.js` | 24 headless tests | ~260 |

`node tools/test/run.js art-sprites` → **24 passed, 0 failed**.
`node tools/validate.js` reports one problem, `map demo_field: item 'potion'
undefined` — pre-existing, from the seed demo map meeting the data
workstream's renamed items (`salve`); nothing in art touches it.

---

## 1. `MQ.MonsterArt`

Every species id in `MQ.Data.species` (177 — 172 dex + 5 boss forms) has a
64 px front sprite, a 52 px back sprite and a 20 px dex icon, generated
deterministically from `species.gen = {body, size, feats, palette}`.

```js
MQ.MonsterArt.sprite(id, 'front'|'back'|'icon', {shiny})  // → canvas, cached
MQ.MonsterArt.draw(ctx, id, kind, x, y, scale, {shiny, flip, alpha, silhouette})
//   x,y is the CENTRE-BOTTOM — where the creature stands. Returns {x,y,w,h}.
MQ.MonsterArt.silhouette(id, kind, colour)   // unseen dex entries, shadows
MQ.MonsterArt.palette(id, shiny)             // the 17-slot colour ramp
MQ.MonsterArt.archetypeOf(id) · isHandDrawn(id) · has(id) · ids()
MQ.MonsterArt.warm(ids) · clearCache() · stats() · SIZES · KINDS · ARCHETYPES
```

**How it works.** A `Grid` of colour-slot indices is drawn left-half-only,
mirrored, put through a top-lit volume-shading pass, given a 4-neighbour
outline, then a face layer and a flat-marking layer. 12 body archetypes —
quadruped, biped, serpent, bird, insect, blob, machine, ghost, fish, plant,
rock, cat — cover all 130 `gen.body` names via an explicit table with build
hints (ears, horns, mane, fleece, spines, wings, armour, robe, lens, dish,
wheel, loco, frame, orb…). Type features add fire crests, water fins and
dorsals, wings, foliage, shoulder plates. Feat strings are keyword-scanned
(17 families) so `salt-crown` grows halite spikes, `arcing-brushes` throws
zig-zags, `punchcard-wings` and `bobbin-cocoon` read as silk, `scan-lines`
and `telemetry-static` draw circuit traces and glowing nodes. Every DARKBYTE
construct also gets the faction mark so the family reads as one.

**Hand-tuned (29):** the three starter lines (`silkin` `spindrake` `loomoth`,
`brinewt` `saltander` `halosaur`, `kindlin` `stokerel` `furnacore`), the four
legendaries (`merlynx` `terrataur` `zephyrion` `glitchra`), `meadow`,
`bigboy`, `grinmalkin`, `grinkit`, and the DARKBYTE flagships `oracle_core`
(+ `_p2` `_p3`), `shardmind`, `amoslurk`/`understudy`, `trojanox`,
`wormhack`, `panoptix`, `datadrake`, `glitchra_static`,
`steamloco_overfired`. These are bespoke draw routines, not overrides of the
generator, so they scale to all three sizes.

**Shiny** is a deterministic per-species hue/saturation rotation of the four
source colours with the accent thrown further round the wheel — a palette
swap, cached separately. Everything is cached by `id|kind|shiny`.

## 2. `MQ.PeopleArt`

```js
MQ.PeopleArt.frame(spriteId, dir, frame)   // → canvas, cached
MQ.PeopleArt.sheet(spriteId)               // 3 cols (frames) x 4 rows (dirs)
MQ.PeopleArt.portrait(key)                 // → 32x32 canvas
MQ.PeopleArt.draw(ctx, id, dir, frame, x, y, scale)   // x,y = feet
MQ.PeopleArt.size(id) · has(id) · ids() · warm(ids) · stats()
MQ.PeopleArt.DIRS = ['down','left','right','up']   FRAMES = 3
```

79 sprite ids from ROSTER §6: the player (walk / bike / narrowboat tiller),
every named cast member, the 28 trainer-class sprites, `npc_nurse`,
`npc_sysadmin`, `npc_stoker`, Treacle Tam, Spokes, the impostor variants,
MEADOW / BIGBOY / GRINKIT as small 4-direction cats, dog, deer, sheep, duck,
heron, the narrowboat, the Anderton caisson, three trains, the ORACLE
terminal and the GRINMALKIN wall grin.

Humans are 16×22, animals 16×16, vehicles 44×22-26. Frame 0 is the stand,
1 and 2 are the steps (legs swap, arms counter-swing). `right` is the
mirrored `left` grid, flipped at grid level so it stays pixel-crisp. Each
def carries clothing (labcoat, overalls, apron, robe, skirt, cardigan, coat,
hoodie, hi-vis, lanyard, day-pack), a headwear style (short / long / bun /
cap / peaked / hat / hood / bonnet / swimcap / hardhat / helmet / helm /
headset / bald), optional glasses, beard, soot, ghostly dither, and a tool
(pole, rod, scope, book, lever, brass horn).

**Palette variants:** `MQ.PeopleArt.frame('npc_walker#1', …)` — any suffix
after `#` produces a stable second colourway, which is what ROSTER asks for
("each has 2 palette variants") and what the named side NPCs use.

**Portraits** are 32×32 busts built from the same defs, with cat portraits
for the cats and drawn sigils for `oracle` / `pippin`, `sleet`, `vigil`,
`arbiter` and `grinmalkin`. Aliases accept character ids (`jim`,
`wren_alder`, `nesta`, `meadow`…). An unknown key that is a species id falls
back to that species' dex icon, so `MQ.Dialog.say(…, {portrait: 'silkin'})`
works.

## 3. `MQ.FX`

```js
FX.setWeather(kind, {instant}) · FX.weather · FX.weatherStrength · FX.drawWeather(ctx)
FX.light(x, y, r, colour, strength) · FX.drawLighting(ctx, {phase, indoor, alpha})
FX.spawn(kind, x, y, opts) · FX.burst(kind, x, y, n, opts) · FX.effect(name, x, y, opts)
FX.drawParticles(ctx) · FX.particleCount()
FX.shake(ms, amp) · FX.flash(ms, colour) · FX.shakeOffset() · FX.hitStop(ms) · FX.drawScreen(ctx)
FX.battleAnim(kind, ctx, from, to, t, {type, colour, scale}) · FX.animDuration(kind)
FX.update(dt) · FX.draw(ctx, {weather, particles, lighting, screen, phase}) · FX.reset() · FX.warm()
```

- **Weather** for all six `MQ.Clock` kinds: rain (slanted streaks that leave
  landing splashes), fog (seven drifting pre-rendered banks plus a haze),
  wind (tumbling leaves and air streaks), sun (moving shafts and a warm
  wash), snow (drifting flakes with per-flake sine drift), clear. Each layer
  eases out before the next eases in. **Zero per-frame allocation:** every
  pool is a `Float32Array` sized at load; the fog bank and the light disc are
  pre-rendered once. `MQ.FX` also listens for the core `'weather'` event, so
  the clock drives it without anyone wiring it up.
- **Lighting:** `drawLighting` tints by clock phase (dawn / day / dusk /
  night, deepened a little by rain and fog), punches every light submitted
  that frame out of the darkness with a pre-rendered disc, then adds a warm
  bloom in the windows. `indoor: true` softens it. Lights are a 96-slot ring
  buffer, consumed each frame — the world team just calls `MQ.FX.light(...)`
  per lit window while drawing.
- **Particles:** 13 kinds (sparkle, dust, footstep, capture, hit, heal,
  ember, leaf, splash, bubble, smoke, shard, note) on a 260-slot pool with
  swap-removal. `FX.effect('crit'|'capture'|'evolve'|…)` bundles the
  presets the battle and overworld scenes want.
- **Screen:** trauma-based shake with squared falloff and a reused offset
  object, plus a coloured flash. `MQ.Scenes.shake` / `MQ.Scenes.flash` are
  replaced with the FX versions (the originals are kept as
  `MQ.Scenes._coreShake` / `_coreFlash` and still called, so the core's
  render-time translate keeps working). Respects
  `MQ.Settings.shake === false`.
- **Battle animations** by move `anim` kind: `slash` (three expanding
  blades), `blast` (double shock ring plus flung shards), `beam` (growing
  cored beam with an impact bloom), `buff` (rising chevrons), `debuff`
  (falling chevrons), `heal` (ring plus rising sparkles), `status` (orbiting
  bubbles), `cyber` (packets travelling from→to, then scanline tearing over
  the target). Unknown kinds get a generic ring rather than nothing.
  `opts.type` picks the colour out of `MQ.Art.TYPE_PALETTES`.

## NEEDS

- **battle/scene** — call `MQ.MonsterArt.draw(ctx, id, 'front'|'back', x, y,
  scale, {shiny: mon.shiny})` with `x,y` at the creature's feet, and
  `MQ.FX.battleAnim(move.anim, ctx, fromPoint, toPoint, t, {type: move.type})`
  over `MQ.FX.animDuration(move.anim)` ms (scaled by the battle-speed
  setting). `MQ.FX.effect('hit'|'crit'|'capture'|'heal'|'faint', x, y)` for
  impacts. Nothing here draws itself — the scene owns the timeline.
- **world/overworld** — call `MQ.FX.update(dt)` once per step and
  `MQ.FX.draw(ctx, {lighting: true, indoor: !map.outdoor})` after the `over`
  layer; submit `MQ.FX.light(x, y, r)` for each lit window/lamp while drawing
  the deco layer. Use `MQ.PeopleArt.frame(npc.sprite, dir, frame)` for NPCs
  and `MQ.PeopleArt.size(id)` for their footprint.
- **ui** — `MQ.MonsterArt.sprite(id, 'icon')` for party/dex/box lists,
  `MQ.MonsterArt.silhouette(id, 'front')` for unseen dex entries.
- **core/boot** — `Boot.buildArt()` already calls `MQ.PeopleArt.warm()`;
  adding `MQ.MonsterArt.warm()` and `MQ.FX.warm()` there would pre-build the
  caches, but both are lazy so it is optional. `PeopleArt.warm()` with no
  argument deliberately warms only the player, cats, VEX and one class —
  warming all 79 × 12 frames at boot is not worth the memory.
- **audio** — none.

## NEW IDS

None. Every species id, sprite id, weather kind and `anim` kind used here
comes from ROSTER / SYSTEMS-SPEC / the data workstream verbatim. Two
conventions were added inside existing id space, neither a new id:
`'<spriteId>#<n>'` for palette variants, and portrait aliases mapping
DESIGN-INDEX character ids onto sprite ids.

## Known gaps

- Sprites are drawn at their source size; the battle scene is expected to
  draw them scaled (`scale: 3` gives a 192 px battler at 960×540 logical).
- Icons are whole-creature miniatures rather than head busts — at 20 px they
  read by silhouette and palette, which is what a dex list needs, but a
  bust would carry more character if anyone wants to revisit it.
- Back sprites reuse the front silhouette with the face suppressed, a spine
  ridge and a darkened ramp. Correct in shape and colour, but a genuinely
  rear-facing pose (tails, wing backs) would be better for the big
  legendaries.
- The overworld has no *emote* sprites (`!`, `?`, sleep) — those belong to
  whoever owns the NPC bubble, and are trivial to add here if wanted.
- Trainer battle sprites are the 16×22 overworld sprites; a larger battle
  portrait per trainer class would be a natural follow-up.
