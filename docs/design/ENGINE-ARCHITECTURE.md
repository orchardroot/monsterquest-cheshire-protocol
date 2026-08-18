# MonsterQuest v2 — Engine Architecture & Workstream Contracts

This document is the technical contract for the rebuild. Every implementer must follow it exactly: file ownership, global names, function signatures, data shapes. If you need something outside your files, put a `// NEEDS:` comment and a note in your final report; do NOT edit files you don't own.

## 0. Non-negotiables

- Vanilla JS, HTML5 canvas, **no build step, no ES modules, no dependencies, no runtime fetch of data**. Everything is `<script>` tags in `index.html` and works from `file://` (Android WebView loads `file:///android_asset/www/index.html`).
- **Syntax ceiling: ES2015 + Promises + generators.** Allowed: `const/let`, arrows, classes, template strings, destructuring, spread, `Map/Set`, `Object.assign`, `function*`/`yield`, `Promise`. **Forbidden:** optional chaining `?.`, nullish `??`, `async/await`, `import/export`, `Object.entries` is OK (ES2017 widely supported) — but prefer `Object.keys`. `Array.prototype.includes` OK. Padding/`flat()` avoid.
- Every file is an IIFE that publishes onto the single global namespace `MQ` (created in `js/core/ns.js`): `(function(){ "use strict"; const NS = window.MQ; ... NS.Thing = ...; })();`
- No file may reference another file's internals at load time except: `MQ` namespace members defined by files earlier in the load order (see §2). Data registration must be **lazy-safe**: data files only push into registries; nothing runs game logic at parse time except `MQ.Boot.start()` at the very end.
- Performance: no per-frame allocations in hot loops (movement, tile draw); cache canvases; cap DPR at 2; keep total scripts under ~2 MB.
- British English in all player-facing text. All content original.

## 1. Directory layout & ownership

```
index.html               (platform)  script tags in the exact order of §2 + touch DOM + canvas
css/style.css            (platform)
js/core/ns.js            (core)   creates window.MQ, MQ.VERSION, tiny helpers
js/core/util.js          (core)   MQ.U: clamp, lerp, rng (mulberry32 + hash), pick, fmt, deepClone, easing
js/core/events.js        (core)   MQ.Events: on/off/emit
js/core/view.js          (core)   MQ.View: canvas sizing, DPR, logical coords, safe insets, resize
js/core/input.js         (core)   MQ.Input: unified actions + analogue axis (keyboard, touch stick, gamepad)
js/core/loop.js          (core)   MQ.Loop: fixed-timestep update + render, pause on hidden
js/core/scene.js         (core)   MQ.Scenes: scene stack
js/core/text.js          (core)   MQ.Text: pixel-crisp text drawing, wrapping, measure
js/core/ui.js            (core)   MQ.UI: 9-slice-ish boxes, list menus, gauges, icons, toasts, tabs
js/core/dialog.js        (core)   MQ.Dialog: dialogue box scene (typewriter, choices, portraits, name tags)
js/core/script.js        (core)   MQ.Script: generator-based cutscene/event runner + command library
js/core/flags.js         (core)   MQ.Flags: story flags/counters + condition expressions
js/core/clock.js         (core)   MQ.Clock: game time (day/night phases), weather state, real-clock hooks
js/core/save.js          (core)   MQ.Save: slots, autosave, versioning, provider registry
js/core/registry.js      (core)   MQ.Data: typed registries + define() + validate() hooks
js/art/sprites.js        (art)    MQ.Art: rasteriser (ascii art→canvas), palettes, cache, flip/tint
js/art/tiles.js          (art)    MQ.Tiles: named tile catalogue + painters + animation frames
js/art/monsters.js       (art)    MQ.MonsterArt: hand-drawn + procedural monster sprites by species id
js/art/people.js         (art)    MQ.PeopleArt: NPC/player sprite sheets (4 dirs × walk frames), portraits
js/art/fx.js             (art)    MQ.FX: particles, weather layers, screen effects, transitions
js/audio/audio.js        (audio)  MQ.Audio: WebAudio engine, unlock, scheduler, mixer, sfx()
js/audio/songs.js        (audio)  MQ.Songs: song table (per-town motifs, routes, battle variants)
js/audio/sfx.js          (audio)  MQ.SFX: data-driven SFX table
js/data/types.js         (data)   MQ.Data.types, typeChart, typeMultiplier
js/data/moves.js         (data)   MQ.Data.moves
js/data/abilities.js     (data)   MQ.Data.abilities
js/data/items.js         (data)   MQ.Data.items (incl. gear, capsules, key items, recipes' outputs)
js/data/species.js       (data)   MQ.Data.species (stats, learnsets, evolutions, gen params, dex text)
js/data/encounters.js    (data)   MQ.Data.encounters (named tables referenced by maps)
js/data/trainers.js      (data)   MQ.Data.trainers (incl. gym leaders, bosses, rival variants)
js/data/quests.js        (data)   MQ.Data.quests (main + casebook definitions)
js/data/achievements.js  (data)   MQ.Data.achievements, MQ.Data.recipes, MQ.Data.bounties
js/data/dialogue.js      (data)   MQ.Data.dialogue: shared NPC chatter pools by town/archetype
js/world/mapformat.js    (world)  MQ.World: defineMap(), legend resolution, collision, warps, validation
js/world/npc.js          (world)  MQ.NPC: NPC entity, behaviours (still/wander/path/look/follow), cats
js/world/overworld.js    (world)  MQ.Overworld: the overworld scene (update/draw), movement, camera
js/world/interact.js     (world)  MQ.Interact: facing-tile interaction, signs, objects, doors, items
js/world/encounters.js   (world)  MQ.Encounters: zone-based wild encounter rolls (time/weather aware)
js/world/maps/*.js       (maps)   one file per region: MQ.World.defineMap(...) calls only
js/story/chapters/*.js   (story)  MQ.Story: generator scripts per chapter, NPC scripts, cutscenes
js/story/npcs.js         (story)  MQ.Story.npcScripts: named NPC dialogue/scripts (id → generator)
js/battle/engine.js      (battle) MQ.Battle: rules engine (no rendering)
js/battle/effects.js     (battle) MQ.BattleEffects: move-effect handlers, abilities, items hooks
js/battle/ai.js          (battle) MQ.BattleAI: tiers
js/battle/scene.js       (battle) MQ.BattleScene: battle UI scene (draws from engine events)
js/ui/title.js           (ui)     MQ.UI.Title: title/save-slot screen
js/ui/pause.js           (ui)     MQ.UI.Pause: pause menu hub
js/ui/party.js js/ui/bag.js js/ui/dex.js js/ui/casebook.js js/ui/worldmap.js js/ui/settings.js
js/ui/shop.js js/ui/trainercard.js js/ui/perks.js  (ui)
js/content/quests-engine.js (content) MQ.Quests: quest state machine, objectives, tracking, rewards
js/content/fishing.js js/content/brewing.js js/content/arena.js js/content/bounties.js
js/content/minigames.js js/content/achievements-engine.js js/content/cats.js js/content/daycare.js (content)
js/boot.js               (core)   MQ.Boot.start(): builds tiles/art, registers save providers, pushes Title
tools/headless.js        (tools)  node: loads all scripts in a vm with canvas/audio stubs, exposes MQ
tools/validate.js        (tools)  node: cross-reference validation of all data (exit 1 on error)
tools/test/*.js          (tools)  node tests: battle math, save roundtrip, quests, script runner, map loader
```

Ownership tags: **core, art, audio, data, world, maps, story, battle, ui, content, platform, tools**. One workstream per tag (maps and story may be split across several agents by region/chapter, each owning distinct files).

## 2. Script load order (index.html)

core/ns, core/util, core/events, core/view, core/input, core/loop, core/scene, core/text, core/ui, core/dialog, core/script, core/flags, core/clock, core/save, core/registry,
art/sprites, art/tiles, art/monsters, art/people, art/fx,
audio/audio, audio/songs, audio/sfx,
data/types, data/moves, data/abilities, data/items, data/species, data/encounters, data/trainers, data/quests, data/achievements, data/dialogue,
world/mapformat, world/npc, world/interact, world/encounters, world/overworld, world/maps/*.js (alphabetical),
battle/effects, battle/ai, battle/engine, battle/scene,
content/*.js, ui/*.js, story/npcs, story/chapters/*.js,
boot.js

The platform owner writes index.html listing every file that exists in the tree at integration time (a `tools/gen-index.js` may generate the tag list).

## 3. Core contracts

### 3.1 View — `MQ.View`
- Logical resolution: **base 960×540, fills the screen with no letterbox.** `S = min(W/960, H/540)`, `MQ.View.w = W/S`, `MQ.View.h = H/S` (≥ 960×540). Backing canvas = `W*dpr × H*dpr` with `dpr = min(devicePixelRatio, 2)`; `ctx.setTransform(S*dpr,0,0,S*dpr,0,0)`; `imageSmoothingEnabled=false`.
- `MQ.View.safe = {top,right,bottom,left}` logical safe insets (from CSS env safe-area).
- Emits `MQ.Events.emit('resize', {w,h})`. All UI positions derive from `MQ.View.w/h`, never literals like 960.
- **World tile size is 32 logical px** (`MQ.TILE = 32`); art is 16 px source drawn at 2×.

### 3.2 Input — `MQ.Input`
- Actions: `up down left right a b start select run` (`run` = shoulder/shift; also implied by stick deflection > 0.8).
- `MQ.Input.pressed(action)` (edge, consumed per frame), `MQ.Input.held(action)`, `MQ.Input.axis()` → `{x, y, mag, angle}` in [-1,1] from stick/gamepad; keyboard/d-pad synthesise unit vectors (8-way).
- Sources: keyboard (arrows/WASD, Z/Enter/Space=a, X/Backspace=b, Esc/Enter on title=start, Shift=run, Tab=select), touch (virtual joystick left half of screen — dynamic origin where the thumb lands, dead zone 0.18, radius 60 logical px; buttons A/B/START/RUN right side; multi-touch with pointerId tracking), gamepad (`navigator.getGamepads()`, standard mapping, left stick + dpad; buttons 0=a,1=b,9=start,8=select, 4/5/6/7=run).
- `MQ.Input.vibrate(ms)` (navigator.vibrate if present), `MQ.Input.lastSource` ('touch'|'key'|'pad') for UI hints, `MQ.Input.setTouchVisible(bool)`.
- Any first user gesture calls `MQ.Audio.unlock()`.

### 3.3 Loop — `MQ.Loop`
- Fixed step `MQ.Loop.STEP = 1000/60` with accumulator (max 5 steps/frame); `update(dt)` on the top scene (and any scene with `updateBelow=true` beneath), `draw(ctx)` bottom-up for transparent scenes; pauses when `document.hidden`. `MQ.Loop.time` monotonic ms.

### 3.4 Scenes — `MQ.Scenes`
- Scene = `{ id, enter(params), exit(), update(dt), draw(ctx), transparent?, updateBelow?, onResize? }`.
- `MQ.Scenes.push(scene, params)`, `pop(result)`, `replace(scene, params)`, `top()`, `has(id)`. Push/pop happen at end of frame. Scenes read input via `MQ.Input` themselves.
- `MQ.Scenes.transition(kind, ms)` full-screen wipe/fade overlay managed by core (`'fade'|'wipe'|'battle'`).

### 3.5 Text & UI — `MQ.Text`, `MQ.UI`
- `MQ.Text.draw(ctx, str, x, y, {size:'s'|'m'|'l', color, align, shadow, maxWidth})`, `MQ.Text.wrap(str, maxWidth, size)`, `MQ.Text.width(str,size)`. Font: monospace bitmap look via `"Courier New"`; sizes s=14, m=18, l=26 logical px.
- `MQ.UI.box(ctx,x,y,w,h,{style})`, `MQ.UI.menu(state, ctx, items, {x,y,w,cols,onSelect})` where `state = MQ.UI.menuState(items)` handles cursor/wrap/scroll and consumes input via `state.update()` returning `{selected|cancel|null}`; `MQ.UI.gauge(ctx,x,y,w,h,ratio,{color})`; `MQ.UI.toast(text, ms)`; `MQ.UI.icon(ctx,name,x,y)`; `MQ.UI.typeChip(ctx,type,x,y)`; touch: menus must also respond to taps (`MQ.Input.tapAt()` gives logical coordinates of a tap this frame).

### 3.6 Dialog — `MQ.Dialog`
- `MQ.Dialog.say(pages, opts)` → Promise resolved on close; `pages` = string | string[]; `opts = {name, portrait, choices:[{label,value}], position:'bottom'|'top', speed, sfx}`; resolves with chosen value (or `undefined`). Choices via list; `MQ.Dialog.ask(question, choices)` sugar. Auto-wraps; A advances, B skips typewriter. Renders as a transparent scene pushed on the stack.
- `MQ.Dialog.notify(text)` (toast) and `MQ.Dialog.banner(title, subtitle)` (location banner).

### 3.7 Script runner — `MQ.Script`
- Scripts are **generator functions** `function*(ctx){ ... }` that `yield` commands. `MQ.Script.run(genFn, ctx)` → Promise; while a script runs, the overworld is in "cutscene" mode (input disabled except A to advance dialog).
- Command library (each returns an object the runner understands; all yieldable):
  `say(pages, opts)`, `ask(q, choices)`, `wait(ms)`, `move(who, path|dir[], {speed})` (who = 'player' | npcId), `face(who, dir)`, `teleport(who, mapId, x, y, dir)`, `warp(mapId,x,y,dir)` (with fade), `setFlag(id, val)`, `addFlag(id, n)`, `giveItem(id, n)`, `takeItem(id,n)`, `giveMoney(n)`, `giveMonster(spec)`, `heal()`, `battle(opts)` (yields result `{won, fled, caught}`), `music(song)`, `sfx(id)`, `shake(ms)`, `flash()`, `fadeOut(ms)`, `fadeIn(ms)`, `banner(t,s)`, `spawnNpc(def)`, `removeNpc(id)`, `showNpc(id,bool)`, `camera(x,y,ms)`, `cameraFollow()`, `weather(kind)`, `time(phase)`, `quest.start(id)`, `quest.advance(id)`, `unlock(id)` (traversal ability), `achievement(id)`, `choice(...)`, `parallel([...])`, `call(genFn)`, `emit(event, data)`, `custom(fn)`.
- Conditions in data use `MQ.Flags.test(expr)` where expr = string like `"badge_3 && !met_vex_2 && quest.brine_bandits>=2"` (grammar: identifiers → flag values, `quest.<id>` → stage index or -1, `item.<id>` → count, `badges` → count, `chapter` → number, `party.has(<species>)`, `time.night`, `weather.rain`; operators `&& || ! == != >= <= > < ( )`).

### 3.8 Flags/Clock/Save
- `MQ.Flags.get(id)`, `set(id, val=true)`, `add(id,n)`, `test(expr)`, `chapter` accessor. Flag ids: snake_case, defined in DESIGN-INDEX (story) or `<system>_<thing>` for systems.
- `MQ.Clock`: game clock advances 1 game-minute per real second while in overworld (configurable); phases `dawn|day|dusk|night`; `MQ.Clock.phase`, `MQ.Clock.minutes`; weather state machine per outdoor region (`clear|rain|fog|wind|sun|snow` with transitions); `MQ.Clock.real` exposes real date/day-of-week/month for events. Emits `'phase'`, `'weather'`.
- `MQ.Save`: `MQ.Save.register(key, {save():any, load(obj)})`; `MQ.Save.write(slot)`, `read(slot)`, `slots()` (3 slots + autosave), `autosave()` after battles/warps/quests; envelope `{version: 2, ts, playtime, summary:{name, badges, chapter, party:[species...], map}, data:{...}}`; version < 2 → offer new game (never crash). Storage key `mq2_slot_<n>`.

### 3.9 Registries — `MQ.Data`
- `MQ.Data.define(kind, id, obj)` stores into `MQ.Data[kind][id]` with `obj.id = id`; kinds: `types, moves, abilities, items, species, encounters, trainers, quests, achievements, recipes, bounties, dialogue`. `MQ.Data.get(kind,id)` throws a helpful error if missing (in dev). `MQ.Data.each(kind, fn)`. `MQ.Data.validators.push(fn)` run by tools/validate.js.

## 4. Data shapes (owned by data workstream; consumed by everyone)

```js
// types.js
MQ.Data.define('types', 'fire', {name:'Fire', color:'#e2492f', chart:{grass:2, water:0.5, ...}})   // chart[defender] = mult
MQ.Data.typeMultiplier(atkType, defTypes[]) → number
// moves.js
{ name, type, cat:'phys'|'spec'|'status', power, acc (0-100 or null=never miss), pp, priority:0, crit:0|1|2,
  target:'foe'|'self'|'field', effects:[ {kind:'status', status:'brn', chance:10}, {kind:'stage', who:'self'|'foe', stat:'atk', delta:-1, chance:100},
  {kind:'heal', pct:50}, {kind:'drain', pct:50}, {kind:'recoil', pct:25}, {kind:'multi', min:2,max:5}, {kind:'flinch',chance:30},
  {kind:'weather', weather:'rain'}, {kind:'terrain', terrain:'salt'}, {kind:'protect'}, {kind:'charge'}, {kind:'fixed', amount:40}, {kind:'levelDamage'},
  {kind:'ohko'}, {kind:'cure', who:'self'}, {kind:'overdrive', amount:20}, {kind:'trap', turns:[2,5]}, {kind:'confuse',chance:20}, {kind:'leech'} ],
  desc, anim:'slash'|'blast'|'beam'|'buff'|'debuff'|'heal'|'status'|'cyber' }
// abilities.js
{ name, desc, hooks:{ onEnter, onTurnEnd, onHit(ctx), onBeforeMove, modifyDamage(ctx)→mult, modifyStat(ctx), onFaint, onWeather } }  // hooks implemented in battle/effects.js by name; abilities.js declares name+desc+`impl` key
// items.js
{ name, price, kind:'heal'|'cure'|'capsule'|'gear'|'key'|'consumable'|'ingredient'|'evo'|'tm', amount, cures:[...], catchBonus, gearEffect:{...}, desc, usableInBattle, usableInField, sellable }
// species.js
{ name, types:[..], base:{hp,atk,def,spa,spd,spe}, catchRate, baseExp, growth:'fast'|'medium'|'slow', abilities:[id,id], hiddenAbility?,
  learnset:[[level, moveId],...], tms:[moveId...], evolutions:[{to:id, method:'level'|'item'|'friendship'|'location'|'time'|'trade'|'overdrive', level?, item?, map?, phase?}],
  gen:{body, size, feats, palette} | art:'key in MQ.MonsterArt', dex:{genus, height, weight, text}, habitat:'silk'|'salt'|'rail'|'forest'|'water'|'cave'|'urban'|'moor'|'cyber'|'orchard'..., rarity:'common'|'uncommon'|'rare'|'legendary', cry:{...} }
// Monster instance (MQ.Data.makeMonster(speciesId, level, opts))
{ uid, species, nickname, level, exp, hp, stats:{hp,atk,def,spa,spd,spe}, ivs:{...0-31}, temperament, ability, gear:null|itemId, friendship:0-255, status:null|'psn'|'par'|'brn'|'slp'|'frz', statusTurns, moves:[{id,pp,ppMax}], overdrive:0-100, metAt:{map,level,ts}, shiny:false, ribbons:[] }
// encounters.js
MQ.Data.define('encounters', 'route_bollington_grass', {zone:'grass', rate:0.12, table:[{species:'silkmoth', min:3,max:6, w:30, time:['day','dusk']?, weather:['rain']?}, ...]})
// trainers.js
{ name, cls:'Walker'|'Sysadmin'|..., sprite, party:[{species, level, moves?, gear?, ability?}], ai:'random'|'greedy'|'smart', payout, intro:[..], win:[..], lose:[..], after:[..], rematch?:{party..., every: n badges}, leader?:{badge, town, type, tm}, boss?:{phases:[{atHp:0.5, script:'genName'}]}, doubles?:bool }
// quests.js
{ name, kind:'main'|'case'|'bounty', giver:{npc, map}, town, summary, stages:[{id, text, cond:'flag expr' | {kind:'defeat', trainer} | {kind:'catch', species}|{kind:'item',id,n}|{kind:'talk',npc}|{kind:'reach', map}, onComplete:'script name'?}], reward:{money, items:[{id,n}], monster?, gear?, perk?}, repeatable?, tracks:true }
```

## 5. World contracts (world + maps + art)

### 5.1 Tile catalogue — `MQ.Tiles`
- `MQ.Tiles.define(id, {solid, water, grass, ledge:'down'|null, encounter:'grass'|'cave'|'water'|null, layer:'ground'|'deco'|'over', anim:[frames...]|null, paint(ctx16, frame, seed) | art:[16 rows], pal, variants:n, light?:bool, interact?:'sign'|'door'|'pc'|'shelf'|'machine'|'boat'|'fish', desc})`
- The **catalogue of names is fixed by the world workstream** in `art/tiles.js` stub form (id + properties + flat placeholder colour); the art workstream replaces painters. Naming: `<biome>_<thing>[_variant]`, e.g. `grass, grass_tall, path_dirt, path_cobble, water, water_deep, water_canal, tree_oak, tree_pine, tree_birch, hedge, fence_wood, fence_iron, wall_brick_red, wall_stone_sandstone, wall_tudor, roof_slate, roof_tile_red, roof_thatch, door_wood, window, sign, rock, rock_moor, cliff_*, ledge_*, salt_flat, brine_pool, rail_track_h/v/x, platform, mill_wheel, chimney, boat_lift, dish, moai, cross_saxon, bear_statue, cave_floor, cave_wall, stalag, ore, flowers_*, berry_bush, mushroom, lamp, bench, bin, market_stall, floor_wood, floor_stone, floor_tile, rug, counter, shelf, pc, healer, table, chair, bed, tv, ...` — full list lives in `art/tiles.js`.
- Painters draw into a 16×16 offscreen canvas; `MQ.Tiles.get(id, frame, variantSeed)` returns a cached 16×16 canvas; the overworld draws at 2×.

### 5.2 Map format — `MQ.World.defineMap(id, def)`
```js
MQ.World.defineMap('macclesfield', {
  name: 'Macclesfield', region: 'east', outdoor: true, music: 'town_macc', weatherZone: 'east',
  legend: { '.':'grass', '=':'path_cobble', 'T':'tree_oak', '#':'wall_brick_red', 'R':'roof_slate', 'D':'door_wood', 'W':'window', '~':'water_canal', ' ':null },
  layers: {
    ground: [ '.....===....', ... ],      // required; every char must be in legend (or ' ' = void)
    deco:   [ ...same size... ],           // optional; drawn above ground, below entities; may be solid
    over:   [ ...same size... ],           // optional; drawn above entities (tree tops, roofs the player walks behind)
  },
  solid: [ 'x,y' ... ] | ((x,y)=>bool)?,   // extra collision beyond tile props (optional)
  warps: [ {x, y, to:'macc_house1', tx:4, ty:7, dir:'up', kind:'door'|'edge'|'stairs'|'cave'} ],
  edges: { north:{map:'route_macc_bollington', offset:0}, ... },  // seamless-ish edge transitions (optional; implemented as warps along an edge)
  signs: [ {x,y, text:[...]} ],
  items: [ {x,y, item:'potion', n:1, hidden?:true, flag:'item_macc_1'} ],   // one-time pickups (flag auto)
  npcs: [ {id:'macc_mum', x, y, dir:'down', sprite:'mum', behaviour:'still'|'wander'|'path'|'look', path:[[x,y],...], radius, script:'macc_mum' (MQ.Story.npcScripts key) | say:['..'], trainer:'trainerId', cond:'flag expr', once?:flag} ],
  triggers: [ {x,y,w,h, cond, script:'name', once?:flag, kind:'step'|'enter'} ],
  encounters: { grass:'macc_grass', water:'macc_water', cave:null },   // encounter table ids per zone
  fishing: 'canal_common', spawnPoint:{x,y}, healPoint?:{x,y}, station?:{name}, ambience:'town'|'forest'|'water'|'cave'|'moor'|'industrial',
  landmark: {name:'Silk Museum', x,y}  // for the world map / banner
});
```
- Validation (`MQ.World.validate()` + tools/validate.js): every legend char resolves to a defined tile; all layers same dimensions; warps target existing maps and in-bounds tiles; npc `script` exists in `MQ.Story.npcScripts` or `say` present; `trainer` exists; encounter table ids exist; triggers' scripts exist; `spawnPoint` walkable.
- Maps should be **large and shaped** (towns 40-60 wide × 30-45 tall; routes 30-80 long with loops, ledges, water, hidden pockets), not straight corridors. Reuse of a house interior template is fine via `MQ.World.template('house_small', {...overrides})`.

### 5.3 Overworld — `MQ.Overworld`
- Player: pixel position (`px,py` in logical px), free 8-way movement from `MQ.Input.axis()`; walk 4.2 tiles/s, run 7.0 tiles/s (run when `held('run')` or `axis.mag>0.85`), sliding collision against a feet box 20×14 px; facing quantised to 4 dirs for interaction; `tileX/tileY` = feet centre. Tile-enter events (encounters, triggers, ledges — auto-hop down only). Water needs `boat` ability; cliffs `climb`; tall grass slows to 85%.
- Camera: follows with soft lerp and lookahead in facing dir; clamps to map; sub-pixel drawing rounded to integers to keep pixel art crisp.
- NPCs from `MQ.NPC`: grid-aware wander/paths, avoid player, look-at on interact, cats follow the player (MEADOW/BIGBOY when unlocked).
- Rendering order: ground → deco → items → entities (y-sorted) → over → weather/lighting (`MQ.FX`) → HUD (location banner, quest tracker, mini-map toggle).
- `MQ.Overworld.warp(mapId, x, y, dir, {fade:true})`, `spawn()`, `getNpc(id)`, `freeze(bool)` for cutscenes.
- Public: `MQ.Overworld.state = {map, px, py, dir, abilities:Set, steps}` (save provider `'overworld'`).

## 6. Battle contract — `MQ.Battle`
- `MQ.Battle.start(opts)` → Promise<result>. `opts = { kind:'wild'|'trainer'|'boss'|'arena', enemyParty:[monster instances], trainer?:trainerData, playerParty: G.party (live), rules:{canRun, canCatch, expShare, weather?, terrain?, doubles?}, difficulty }`. Result `{outcome:'win'|'lose'|'run'|'catch', caught?:monster, expGained, moneyGained, turns}`.
- Engine is pure logic emitting an ordered **event log** the scene renders: `{type:'msg', text}`, `{type:'hp', side, uid, from, to}`, `{type:'anim', name, side}`, `{type:'stage', ...}`, `{type:'switch',...}`, `{type:'faint',...}`, `{type:'catch', shakes:n, success}`, `{type:'menu'}` (waiting for player action), `{type:'end', result}`. Scene calls `engine.choose(action)` where action = `{type:'move', index}|{type:'switch', index}|{type:'item', id, target}|{type:'run'}|{type:'agent', id}|{type:'overdrive'}`.
- Formulae per SYSTEMS-SPEC.md (damage, stages, crit, accuracy, weather, abilities via `MQ.BattleEffects` hooks, gear, Overdrive meter, Agent Trio cooldowns, boss phases via trainer.boss.phases → scripts).
- Party state lives in `MQ.Party` (content) — `MQ.Party.list`, `add`, `box`, `heal`, `alive()`, save provider `'party'`. Money/bag in `MQ.Inventory` — `add(id,n)`, `remove`, `count`, `money`, save provider `'inventory'`. Trainer profile in `MQ.Trainer` — `name, level, xp, perks:Set, badges:Set, playtime, stats`, save provider `'trainer'`.

## 7. Content & UI contracts
- `MQ.Quests.start(id)`, `advance(id)`, `stage(id)`, `isDone(id)`, `active()`, `check()` (called on flag change/battle end/item pickup), tracker HUD data `MQ.Quests.tracked()`.
- Pause menu (`MQ.UI.Pause`) is a hub of tabs: Party, Bag, Dex, Casebook, Map, Trainer, Perks, Settings, Save. Each tab is a scene in `js/ui/*.js` pushed by the hub. All screens must be usable by touch (tap items, tap to confirm, B/back button).
- Settings: text speed, music/sfx volume, difficulty, touch layout size/side, screen shake, battle animation speed, run toggle. Persist under save provider `'settings'` and also localStorage `mq2_settings`.
- Achievements: `MQ.Achievements.unlock(id)` toasts once. Cats: `MQ.Cats` (follow, sniff, trust). Fishing/brewing/arena/bounties/minigames each expose `start(...)` returning a Promise and are launched from NPC scripts.

## 8. Story contract
- `MQ.Story.npcScripts[id] = function*(ctx){...}` and `MQ.Story.chapters[n] = {title, start:function*, hooks:{...}}`; scripts use ONLY the `MQ.Script` command library + `MQ.Flags/Quests/Inventory/Party` APIs. Story files never draw.
- `ctx` passed to scripts: `{npc, map, player, S: MQ.Script.cmds}` so scripts read `const {say, move, ...} = ctx.S`.

## 9. Tools
- `node tools/validate.js` must pass (exit 0) before integration; `node tools/test/run.js` runs all tests. `tools/headless.js` loads every script tag listed in index.html into a `vm` context with stubs for `window, document, canvas 2d context (records calls), localStorage, requestAnimationFrame, AudioContext, navigator, performance` and returns `MQ` without starting the loop (`window.__MQ_NO_BOOT = true`).

## 10. Platform
- `index.html`: canvas `#screen` filling the viewport; touch DOM: joystick zone (left half) drawn on canvas by `MQ.Input` (no DOM buttons needed) — platform provides only the canvas and CSS; landscape lock hint (`screen.orientation.lock('landscape')` best-effort); fullscreen on first tap where allowed; `<meta viewport>` with `viewport-fit=cover`.
- Android: `screenOrientation="sensorLandscape"`, immersive sticky, hardware back → `MQ.Input.inject('b')`, keep `file:///android_asset/www/`; WebView settings for `allowFileAccessFromFileURLs` retained.
- PWA: `sw.js` cache-first with generated asset list (`tools/gen-index.js` writes both the script tags and the SW list); bump cache name to `mq2-<n>`.
