# MonsterQuest: The Cheshire Protocol — Architecture Map

_Snapshot of the current codebase (August 2026), written as the reference for a rebuild targeting: a much bigger world, analogue-stick controls, richer story, RPG-ish battle additions, and a bigger window on an Android (Fire) tablet plus Mac play._

## 1. Files and globals

Zero build step, zero dependencies, no ES modules. `index.html` loads seven plain `<script>` tags in a hard, unenforced order; every top-level `const`/`function` lands in one shared global scope:

| Load order | File | Size | Role | Globals it defines |
|---|---|---|---|---|
| 1 | `js/audio.js` | 309 lines | Synthesised WebAudio chiptune engine (no audio files) | `Sound` singleton, `SONGS` (9 songs) |
| 2 | `js/data.js` | 1545 lines | Pure game data + stat/exp formulas | `TYPE_CHART`, `TYPE_COLORS`, `MOVES` (61), `SPECIES` (113), `ITEMS` (23), `STATUS_NAMES`, `typeMultiplier`, `expForLevel`, `statsAtLevel`, `movesAtLevel`, `makeMonster` |
| 3 | `js/maps.js` | 1843 lines | World factories + world/trainer/quest data | `MAPS`, `TRAINERS` (48), `QUESTS` (19), `QUIZ`, `STATIONS`, `RIVAL_COUNTER`, `STOCK_*`, `makeTown/makeRoute/makeCave/makeCare/makeMart/makeGym`, `enc`, `mapHash/mapRng`, `setTiles/add*Exit` |
| 4 | `js/towns.js` | 14 lines / 77 KB | Minified JSON overlay IIFE: overwrites 29 towns' tiles/warps/signs/npcs, adds 29 interiors, patches ~80 maps' warp targets | none (mutates `MAPS`, `STATIONS`) |
| 5 | `js/sprites.js` | 660 lines | Procedural pixel-art rasteriser, tile builder, collision helpers | `ART=16`, `TILE_CANVAS`, `buildTiles`, `monsterSprite`, `personSprite`, `spriteCache`, `personCache`, `SOLID_TILES`, `GRASS_TILE='w'`, `tileAt`, `isSolid`, `hash32/mulberry` |
| 6 | `js/battle.js` | 511 lines | `class Battle` — turn engine only, no rendering/input | `Battle`, `STRUGGLE`, `stageMult` |
| 7 | `js/game.js` | 2362 lines | Everything else: state `G`, input, overworld, dialog, all menus, quests, minigames, save/load, battle UI, main loop | `TILE=32`, `SCREEN_W=960`, `SCREEN_H=540`, `SAVE_KEY`, `canvas/ctx`, `KEY_MAP`, `held`, `G`, `onPress`, `loop`, `drawText`, ~15 per-mode press/draw handlers |

Platform files: `index.html` (canvas + touch buttons + inline SW registration), `sw.js` (cache-first PWA worker, hand-listed `ASSETS`, cache name `monsterquest-v4`), `manifest.webmanifest`, `android/` (single-Activity WebView wrapper), `.github/workflows/{apk,pages}.yml`.

Two copy-pasted PRNGs exist (`mapHash/mapRng` in maps.js, `hash32/mulberry` in sprites.js) — both FNV-1a + mulberry32.

## 2. Game loop and scene flow

- One `requestAnimationFrame` callback, `loop(now)` (game.js ~2255). `dt = min(50, now - lastTime)` — clamped but not fixed-step; simulation speed drifts with framerate.
- `loop` first runs updates inline (overworld movement, dialog char reveal at `dt*0.06` chars/ms, transition timer 700 ms, battle HP tween `dt*0.12`, screenshake 180 ms, banner 2600 ms, fishing/slot timers, flash), then a giant render `switch (G.mode)`, then `drawFlash()`.
- **Scenes are strings.** `G.mode` ∈ `title | overworld | dialog | menu | party | summary | bag | dex | trainercard | questlog | shop | battle | fishing | slots | fame | transition`. The same string is switched over independently in at least three places (`onPress` dispatch ~1536, the update half of `loop`, the render half of `loop`) plus scattered checks (`updateMusic`, `closeDialog`). There is no scene object with enter/update/draw/exit.
- Dialog is a pseudo-modal: `showDialog(pages,{choices,onChoice,onDone})` stores `G.prevMode`, sets `mode="dialog"`; `closeDialog` restores it with a special case ("if prevMode was battle, go to overworld"). Nested dialogs work only by chaining `onDone` callbacks recursively (e.g. `processPending` for move-learn/evolution after battle) — no dialog stack.
- Battle lifecycle glue lives in game.js: `beginBattle(opts)` → `new Battle(G, opts)` → `battlePump()` drains `b.queue` via `b.advance()` until `b.queueDone()`, then acts on `b.afterQueue` (`menu | end | forceSwitch`) → `endBattle()` branches on `b.result` and hardcoded trainer keys (`rival`, `oracle`, `rootboss`, `champion`) for story flags/badges → `whiteout()` on loss → `processPending()`.
- Startup: `buildTiles()` runs synchronously at game.js:15 during script parse; `loop` is kicked at the bottom of game.js.

## 3. Map data model and how maps are built

**Map object** (`MAPS[id]`): `{name, outdoor, music, tiles: string[] (row-major, one ASCII char per tile), warps: {"x,y": {map,x,y,dir}}, signs: {"x,y": [lines]}, npcs: NPC[], encounters?: {rate, table:[[speciesId,lo,hi,weight]]}, fishing?: {table}, hotSpring?, weather?: 'rain'|'fog', slotsOnMachines?, brewery?, encounterEverywhere? (dead)}`.

**Tile legend**: `.` grass, `,` flowers, `=` path, `w` tall grass (the only encounter trigger), `T` tree, `~` water, `F` fence, `S` sign, `R/B/W/D` roof/wall/window/door, `_` floor, `r` rug, `C` counter, `K` shelf, `M` machine, `t` table, `X` void, `b` berry, `G` rock, `c` cave floor — plus ~19 undocumented letters introduced by towns.js (`Q H h q k n l I i u v a y z j g m e O P`) whose only "definition" is membership in `SOLID_TILES` (29 chars) and a drawing rule in `buildTiles()`. `TILE_CANVAS` is a flat dict keyed by single chars (~40 in use), some entries being arrays of 2–3 variant canvases (`.`, `~`, `l`).

**Build pipeline (two passes):**
1. `maps.js` factories: `makeTown` (default 30×18, street on row 6, buildings at `x = 2 + slot*6`, sign at `(signX,8)`, optional pond, seeded flowers), `makeRoute` (straight corridor, path row 7 or col 9, seeded grass bands/pockets/water, trainers just off-path), `makeCave` (rock sprinkle at density + L-shaped corridor carving between exits/pockets, `outdoor:false`), fixed-literal interiors `makeCare/makeMart` (10×8) and `makeGym` (12×12); `enc()` always rate 0.13 with weights 30/14/4. Expansion block retrofits exits via `setTiles/addNorthExit/...`.
2. `towns.js` IIFE: `Object.assign(MAPS[id], T.maps[id])` overwrites 29 towns wholesale (maps.js cfg for those becomes vestigial), `Object.assign(MAPS, T.interiors)`, patches `STATIONS`, then `T.retarget` patches individual warp targets on ~80 maps with no existence checks.

Result: 139 maps (29 towns, 27 routes, ~9 sites/caves, ~70 interiors). NPCs are a loosely typed union keyed by `type` (22–24 values: dialog, heal, vet, shop, trainer, starter, rival, rival2, guard, guard8, darkboss, oracleboss, station, champion, fisher, trade, daycare, coins, prizes, quiz, quest, brewery, legendary), the whole contract being the `talkToNpc` switch in game.js. Visibility uses five different field conventions (`hideIfFlag`, `showIfFlag`, legendary+flag, `needBadges+needFlag`, guard8). Movement: 190 ms/tile lerp, 90 ms turn-lock, one held direction per frame in fixed up/down/left/right priority; camera centres on interpolated player and clamps to map bounds. Encounters roll only in `arriveAtTile()` when the tile is `w` and `map.encounters` exists — cave floors (`c`) never trigger, so `encounterEverywhere` is dead.

## 4. Battle system

`class Battle` (battle.js) is a Gen-1 port with a message queue: logic mutates monsters synchronously and pushes `{text, apply}` entries; the UI pulls one per A-press via `advance()`, running deferred side effects (SFX, hit flash) at display time.

- Constructor takes the whole `G` (`this.game`) and reaches back into it (`game.party`, `game.money`, `game.pendingLearns/pendingEvos`, `game.addItem/removeItem`).
- Turn: `playerTurn(action)` with action `{type:'move'|'switch'|'item'|'run'}`; order by `move.priority` then effective speed then coin flip; `enemyAct()` for free enemy turns; `endTurn()` chip damage; `checkEnemyFaint/checkPlayerFaint` set `afterQueue`/`result`.
- Damage: `floor(floor(floor(2L/5+2)*P*A/D)/50)+2`, STAB 1.5, `typeMultiplier`, roll (217+rand39)/255, crit `baseSpd/512` (×8 cap 0.9 for `highCrit`, ignores stages, doubles level). Stages atk/def/spd only, ±6, `stageMult`. Burn halves atk, para quarters spd, 25% full-para, sleep 1–3 turns, psn/brn = maxHP/16. No accuracy/evasion, freeze, confusion, multi-hit, charge, weather, abilities, held items.
- Catch: `(3M-2H)*rate*bonus/(3M)`, ×2 asleep, ×1.5 other status; ball bonuses 1/1.5/2; overflow to `game.box`.
- Exp: `max(1, floor(baseExp*L/7))` to the single active mon only; `expForLevel = L^3`; level-ups recompute via `statsAtLevel`, queue learns/evos to `G.pending*`. `expEarned` Map is dead.
- Enemy AI: uniform random over moves with PP. Custom mechanics: `brink` (survive at 1 HP once, only `bigboy`), `piward` status immunity, one-shot agents SLEET/VIGIL/ARBITER.
- `Battle.phase` shadows a second state machine, `battleUi.phase` in game.js (`msg|menu|moves`), which also holds `menuIdx` (hardcoded 2×2 grid of exactly 4 options), `dispHpP/E`, `introT` (450 ms slide-in). `drawBattle` is fully procedural with literal pixel coordinates.

## 5. Data model

- **Monster instance** (`makeMonster`): `{species, nickname, level, exp, hp, stats:{hp,atk,def,spd,spc}, status: null|psn|par|brn|slp, sleepTurns, moves:[{id,pp}] (≤4)}` plus transient fields bolted on at runtime (`fainted`, `faintedShown`, `brinkUsed`). No IVs/EVs/natures/held items; single `spc` stat.
- **SPECIES**: `{name, types[1-2], base:[hp,atk,def,spd,spc] (positional), catchRate (0 = uncatchable/scripted), baseExp, evolvesTo?, evolveLevel?, learnset:[[level,moveId]], art+pal (38 hand-drawn 16×16) XOR gen:{body,size,feats} (75 procedural), brink?}`. Assembled from a base literal plus two `Object.assign` expansion blocks. Starter trio and rival triangle are hardcoded in game.js and maps.js, not data.js.
- **MOVES**: `{name, type, kind: phys|spec|status, power?, acc (999=always), pp, priority?, highCrit?, effect?:{status,chance} | stat?:{who,stat,delta} | heal?}` — one effect kind per move.
- **ITEMS**: `{name, price, kind: heal|cure|ball|key|agent|ward|boombox, amount?/cures?/bonus?, desc}` — key/story items mixed with mechanical ones.
- **TYPE_CHART**: 13 types incl. custom `Cyber`; missing pairs = 1.
- **TRAINERS**: `{name, party:[[species,level]], payout, intro, winMsg, after, sprite?, isLeader?+badge:{flag,name}, grunt?}`. **QUESTS**: `{name, offer, accepted?, stages:[{objective, cond:{flag|defeated|caught|item|partyHas}, remind, give?, turnIn}], reward:{money,items,monster}, done}`; `G.quests[id]` is undefined | stage index | `"done"`.
- **Flags**: `G.flags/seen/caught` are string-keyed bags invented inline (`defeated_<id>`, `visited_<map>`, `traded_<npc>`, `berry_<map>_<x>_<y>` (stores step count), `badge`..`badge8`, story flags). No registry.

## 6. Rendering and audio

- Fixed 960×540 backbuffer, `imageSmoothingEnabled=false`, scaled purely by CSS (`width:100vw; height:calc(100vw*9/16); max-height:100vh; max-width:calc(100vh*16/9)`), no DPR handling, no resize listener. Source art is 16×16 (`ART`), drawn at 2× into 32 px tiles; sprite scale factors are ad hoc literals at call sites (2, 3, 6, 12, 13).
- `renderArt(art,pal,scale,flip)` rasterises ASCII art to offscreen canvases, cached in unbounded Maps. `genMonsterArt` composes bilateral-symmetric bodies (7 shapes, 15 feats) seeded by species id and coloured from `TYPE_GEN_COLORS`. People sprites: 3 authored directions (right = flipped left, 17-char rows off-by-one vs `ART`), walk frame via `WALK_LEGS` row-slice at rows 12–14. `buildTiles()` is a 330-line imperative painter with intra-function ordering dependencies.
- Overworld draw culls to camera window, y-sorts NPCs/player, overlays weather (cosmetic only) and `skyTint()` from the real wall clock; text via `drawText` (Courier New bold).
- Audio: `Sound.unlock()` lazily creates the AudioContext (only called from `onPress` in game.js — the whole autoplay-unlock contract), gains master 0.5 / music 0.55 / sfx 0.9, 0.5 s noise buffer. `sfx()` is a 14-case switch of `tone/noise` compositions; `playSong()` expands `SONGS[name].tracks[].notes` ([semitone|"-", beats]) into absolute-time oscillators, self-rescheduling one loop iteration ahead via `setTimeout` (0.3 s lookahead — throttled tabs stall). `stopSong` doesn't cancel already-scheduled nodes; `jingle` duplicates duration math; `pendingSong` doubles as pre-unlock queue and last-song cache.

## 7. Input and touch

`KEY_MAP` (arrows/WASD → dirs; Z/Enter/Space → `a`; X/Backspace → `b`; Esc → `start`) and the touch IIFE both feed one `held` Set and one edge-triggered `onPress(btn)`. Touch buttons are `.tbtn[data-btn]` DOM elements with fixed-pixel absolute positions (d-pad 58 px, A/B 72 px), shown only under `@media (pointer:coarse)`; direction buttons both fire `onPress` and toggle `held`; no `pointerId` bookkeeping for multi-touch. Movement is strictly 4-directional and tile-locked; there is no analogue input path, no run speed. Android back button → `evaluateJavascript("window.onPress && onPress('b')")`.

## 8. Save format

Single `localStorage["monsterquest_save"]` JSON blob: `{playerName, party, box, bag, money, coins, steps, daycareMon, quests, soundOn, flags, seen, caught, map, x, y, dir, healPoint}`. No version field, no migration beyond `field || default` and "if `MAPS[G.map]` is missing, teleport home". `JSON.parse` failure silently discards the save; no backup slot; transient state (`battle`, `pending*`, `*Ui`) is correctly excluded.

## 9. Platform (PWA / Android / Mac)

- PWA: `sw.js` cache-first with hand-maintained `ASSETS` and manual `monsterquest-v4` bump; manifest `display:fullscreen`, `orientation:portrait`; inline SW registration skipped for `appassets.androidx.dev` (dead guard — Android loads `file://`).
- Android: `MainActivity` (~60 lines) WebView, JS + DOM storage + file access on, loads `file:///android_asset/www/index.html`, legacy `SYSTEM_UI_FLAG_*` immersive, `screenOrientation="portrait"` hardcoded (so the landscape CSS is unreachable), `configChanges` suppress recreation, minSdk 21 / target 34, Gradle task copies repo-root web files into assets. CI signs with a throwaway keystore when no secret is set (updates can't install over old builds); Pages deploys the raw repo root.
- Mac: plain browser at 960×540 letterboxed to 16:9; keyboard only, no gamepad API.

## 10. JS syntax level

ES2015+ browser JS without modules: `"use strict"`, `const/let`, arrow functions, template literals, destructuring, spread, `class` (only `Battle`), `Map/Set`, `Object.assign`, `??`/`?.` appear (ES2020). No async/await pipelines, no `import/export`, no TypeScript, no bundler, no tests, no linter.

## 11. Ranked weaknesses / opportunities for the rebuild

1. **Global-scope monolith, no modules.** Seven scripts sharing implicit globals (game.js alone 2362 lines) block safe refactoring, lazy loading and testing. First step: native ES modules (`type=module`) with explicit imports and an owner per data table; unify the duplicated PRNGs.
2. **String-tagged scene machine.** `G.mode` switched in ≥3 places; new screens require synchronised edits. Replace with scene objects (`enter/update/draw/exit`) and a proper dialog/UI stack — prerequisite for richer story scenes, cutscenes and more menus.
3. **Fixed 960×540 canvas with CSS-only scaling and portrait lock.** No DPR, no resize listener, strict 16:9 letterbox, hardcoded-pixel touch buttons, Android manifest forces portrait so landscape CSS is dead. Rebuild needs a DPR-aware resizable viewport (integer pixel scaling or logical-resolution choice), landscape support, safe-area/orientation handling, and layout tokens instead of literal coordinates for a Fire tablet vs Mac window.
4. **Input model is tile-locked, 4-way, one-direction-per-frame, no `pointerId` tracking, no Gamepad API.** Analogue sticks need: a virtual stick with pointer capture, dead-zone → 8-way/vector movement, `navigator.getGamepads()` polling for Mac controllers, and constants (190 ms/tile, 90 ms turn-lock) promoted to tunable movement config (walk/run).
5. **World authoring is two competing systems.** `makeTown/makeRoute` templates (identical street/building slot math, straight corridors, one encounter recipe) vs a 77 KB minified hand-authored JSON overlay with `retarget` patches and no validation. A bigger world needs one data format (JSON/Tiled-style layers, named tilesets, per-map objects/triggers), a validator (warps, npc types, trainer/quest/species ids, tile chars in `SOLID_TILES`), and generators as tools not runtime code.
6. **Tile identity is a single ASCII char in one flat namespace** (~40 of ~94 printable chars used, 19 undocumented). Move to named tiles/tileset ids with explicit properties (solid, encounter, interactable, animation frames) instead of `SOLID_TILES` + `GRASS_TILE` + string-equality chains in `interact()`.
7. **NPC/story logic is a 190-line `talkToNpc` switch with narrative hardcoded in engine code** (mom special-case, vet, bosses); flags are ad hoc strings; `endBattle` branches on trainer-key literals. Richer story needs a data-driven event/script layer (typed NPC handlers registry, scripted sequences, a flag/quest registry with schema, conditions/effects as data).
8. **Battle engine surface is narrow and coupled.** One effect per move; no acc/eva stages, freeze/confusion, multi-hit, weather, abilities, held items; single-mon exp only (`expEarned` dead); random enemy AI; `Battle` reaches into `G` and embeds trainer payout/dialogue; two parallel phase machines. Rebuild: richer move-effect schema (list of effects), event/result objects returned to the game layer, injectable audio, pluggable AI, party exp share, room for RPG additions (abilities, equipment, status stacking, 5+ menu options).
9. **Encounter/biome design is uniform.** `enc()` always 0.13 rate with 30/14/4 weights; encounters only on `w`; caves' `encounterEverywhere` is dead; weather cosmetic; day/night from wall clock. Add per-tile/per-zone encounter layers, time-of-day and weather that gate spawns, and a simulated game clock.
10. **Save format is unversioned and fragile.** Add `version`, migrations, multiple slots/backups, corruption recovery, and persist any new world/time state.
11. **No tests, no validation, no lint.** Add data-integrity checks (learnsets, evolutions, art dimensions, type chart symmetry, warp targets) and characterisation tests for save/load, quest engine and battle math before rebuilding.
12. **Update/render entangled in one `loop`** with a 50 ms dt clamp and no fixed timestep; magic numbers throughout. Split update/draw per scene, add an accumulator, name every tuning constant.
13. **Rendering is procedural-only with unbounded caches and ad hoc scales.** Introduce named scale presets, cache eviction or atlas generation at boot, optional image assets, and a UI layout table; keep procedural art as a generator tool.
14. **Audio scheduler is fragile** (one-iteration lookahead, `stopSong` leaks scheduled notes, unlock depends on a single call site, failures swallowed). Adopt a standard multi-iteration lookahead scheduler, explicit unlock listener in the audio module, node cancellation on stop, and a data-driven SFX table.
15. **Platform packaging is manual.** Hand-listed SW assets and cache version, throwaway CI keystore, deprecated immersive API, `file://` WebView with broad file access, portrait duplication in two manifests. Move to a small build (asset manifest generation, versioned SW), `WebViewAssetLoader`, `WindowInsetsController`, persistent signing key, and a shared orientation/viewport policy across PWA and APK.
