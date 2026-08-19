# MonsterQuest v2 — Core API (as shipped)

Concrete surface of the `core` + `tools` workstreams. Where this differs from
`ENGINE-ARCHITECTURE.md` the deviation is listed in §Deviations with a reason.
Contract file order is unchanged; every file is an IIFE on `window.MQ`.

## Run / test / validate / serve

```
node tools/test/run.js            # all tests (tools/test/test-*.js); optional name filter arg
node tools/validate.js            # MQ.Data validators + MQ.World.validate(); exit 1 on problems
node tools/gen-index.js           # regenerate <script> block in index.html + sw.js ASSETS/CACHE
node tools/gen-index.js --check   # exit 1 if index/sw are stale
node tools/headless.js            # smoke-load every script and print MQ keys
python3 -m http.server 8811 --bind 127.0.0.1   # then open http://127.0.0.1:8811/
```

`tools/headless.js` → `load({files?, width?, height?, dpr?, boot?})` returns
`{MQ, window, document, screen, step(n,dt), tick(n), key(code, down), fire(evt), render()}`.
Tests write to `MQ.*` freely; each test file gets a fresh context.
Add a file to the new tree → run `node tools/gen-index.js` (index.html loads only `js/core|art|audio|data|world|battle|content|ui|story` + `boot.js`; the old `js/*.js` are not loaded).

## MQ (ns.js)
`MQ.VERSION "2.0.0"`, `SAVE_VERSION 2`, `TILE 32`, `ART 16`, `BASE_W/H 960/540`, `DEV true`, `HEADLESS`, `log/warn/noop/isFn`.

## MQ.U (util.js)
`clamp lerp sign approach hash(str) mulberry32(seed) rng(seed|str) randInt(lo,hi,rnd) chance pick weightedPick(arr,key,rnd) shuffle pad padRight fmtMoney fmtNum fmtTime fmt(str,{vars}) capitalise deepClone merge defaults uid ease.{linear,inQuad,outQuad,inOutQuad,inCubic,outCubic,inOutCubic,outBack,outElastic,outBounce} dist inRect dirVec dirFrom(dx,dy) opposite hexToRgb rgbToHex shade mix now range last remove`.

## MQ.Events
`on(name, fn, ctx)`, `once`, `off(name, fn?)`, `emit(name, data)` → listener count, `listeners`, `clear`.
Core events: `resize {w,h}`, `gesture`, `scene {op,scene,top}`, `flag {id,value,old}`, `phase`, `weather`, `newday`, `save`, `load`, `newgame`, `boot`, `script:start`, `script:end`, `hidden`, `visible`.

## MQ.View
Fields `canvas ctx W H (css px) w h (logical) S dpr safe{top,right,bottom,left}`.
`init(canvas?)`, `resize()`, `compute(W,H,dpr)` → `{S,dpr,w,h,cw,ch}` (pure), `applyTransform()`, `toLogical(clientX, clientY, out?)` (reuses one point object), `clear(color)`.
Safe insets read from CSS vars `--mq-sat/-sar/-sab/-sal` (css/style.css) divided by S. Uses `visualViewport` when present.

## MQ.Input
`held(a)`, `pressed(a)` (edge, true for exactly one fixed step; press+release between steps still yields one edge), `consume(a)`, `consumeAll()`, `axis()` → `{x,y,mag,angle}` (same object every call), `tapAt()` → `{x,y}|null` (logical, this step only), `inject(a)`, `vibrate(ms)`, `setTouchVisible(bool|null=auto)`, `lastSource`, `touchVisible`, `coarse`, `enabled` (false = all input suppressed), `anyPressed()`, `dirPressed()`, `releaseAll()`, `gesture()`, `update()` (called by Loop before every step), `draw(ctx)` (called by Loop after scenes), `buttons[]`, `stick`, `KEYMAP`, `STICK {radius 60, dead 0.18, runAt 0.8}`.
Sources: keyboard (`e.code` + keyCode fallback), Pointer Events (touch/mouse; falls back to touch+mouse events), gamepad polling each step. Analogue deflection >0.5 also sets digital `up/down/left/right` (menus work from sticks); mag >0.8 sets `run`. Touch stick: dynamic origin on the left half, `pointerId` tracked; buttons A/B/START/RUN on the right; sliding between buttons is allowed; short taps anywhere not on a button become `tapAt`. Auto-visibility: last source touch, or coarse pointer and not using a pad.

## MQ.Loop
`STEP 16.667`, `time`, `frames`, `fps`, `running`, `paused` (document.hidden), `start() stop() step(dt) render() frame(now)`.
`step`: Input.update → Clock.update → Script.update → Scenes.update → UI.update → Scenes.flush. `render`: clear → Scenes.draw (with shake translate) → Scenes.drawOverlay → UI.draw (toasts/banner) → Input.draw → Scenes.flush.

## MQ.Scenes
`push(scene, params)`, `pushP(scene, params)` → Promise resolved with the value given to `pop()`, `pop(result)`, `popTo(id)`, `replace`, `clear`, `top()`, `has(id|scene)`, `get(id)`, `depth()`, `flush()` (applies queued ops; Loop calls it end-of-update and end-of-render), `update(dt)`, `draw(ctx)`, `drawOverlay(ctx)`.
Scene hooks: `enter(params) exit(result) update(dt) draw(ctx) resume(resultFromPoppedScene) onResize({w,h})`; flags `transparent`, `updateBelow`.
Transitions: `transition(kind 'fade'|'wipe'|'battle', ms, {color})` → Promise **resolved at the midpoint (screen fully covered)**; the reveal continues automatically. `fadeOut(ms)` covers and holds; `fadeIn(ms)` reveals; `isCovered()`. Screen FX: `shake(ms, amp)`, `flash(ms, color)`, `shakeOffset()`.

## MQ.Text
`SIZES {s:14,m:18,l:26,xl:40}`, `draw(ctx,str,x,y,{size,color,align,shadow,maxWidth,alpha})` → width, `wrap(str,maxWidth,size)` → lines (honours `\n`, hard-breaks long words), `width(str,size)`, `charWidth(size)`, `lineHeight(size)`, `drawWrapped(ctx,str,x,y,maxWidth,opts)`, `charsPerLine`, `px(size)`, `font(px)`.

## MQ.UI
`box(ctx,x,y,w,h,{style:'default'|'dark'|'flat'|'paper'|'danger', title, alpha, fill, border})`, `roundRect`, `gauge(ctx,x,y,w,h,ratio,{color,bg,border,noBorder})`, `pointer(ctx,x,y)`, `advanceArrow`, `icon(ctx,name,x,y,scale)` (heart star coin check cross ball sword shield bag map book cog save arrowR arrowL dot cat fish quest), `typeChip(ctx,type,x,y,{w,h})`, `tabs(ctx,labels,active,{x,y,w,h})` + `tabsHit`, `button`, `hit`, `toast(text,ms)`, `banner(title,sub,ms)`, `bannerActive()`, `update(dt)`, `draw(ctx)`.
Menus: `state = menuState(items, {cols, visible, wrap, cancel})`; `state.update()` → `{selected,item,value,tap?}|{cancel:true}|{moved:true}|null` (consumes input; hold-repeat; taps hit the rects recorded by the last draw); `state.setItems/setCursor/current/value`; `menu(state, ctx, items, {x,y,w,cols,rowH,visible,style,pad,title,box:false,size,color})` → box height. Item = string | `{label,value,disabled,icon,right,color}`.

## MQ.Dialog
`say(pages, {name, portrait (canvas|fn(ctx,x,y,size)|key for MQ.PeopleArt.portrait), choices:[{label,value}], position:'bottom'|'top', speed, sfx, style, cancel, cancelValue, updateBelow})` → Promise(value|undefined). `ask(q, choices, opts)`, `confirm(q)` → Promise<bool>, `notify(text)`, `banner(title, sub)`, `isOpen()`, `makeScene(...)`.
Behaviour: 3 lines per page (overflow auto-splits into extra pages), typewriter at `Dialog.CPS * Dialog.speed` cps, A/tap: reveal → advance; B: reveal/advance; choices menu after the last page. `Dialog.auto = true` (headless/skip): instant reveal, auto-advance, picks `Dialog.autoChoice`.

## MQ.Script
`run(genFn|generator, ctx, {nested})` → Promise<return value>; sets cutscene mode (`Overworld.freeze(true)` if defined, `script:start/end` events) for top-level runs. `runNpc(id, ctx)` uses `MQ.Story.npcScripts`. `exec(yieldable, ctx)`, `busy()`, `update(dt)` (wait timers run on game time via Loop), `cmds`, `executors` (extensible), `log`.
Yieldables: command descriptor, Promise, generator/generator fn (nested), array (parallel), plain function.
`ctx.S = cmds` (added if missing). Commands: `say ask choice(choices,q) confirm wait(ms) waitPress(action) move(who,path,opts) face teleport warp setFlag addFlag giveItem takeItem giveMoney giveMonster heal battle(opts)→{won,fled,lost,caught,outcome,result} music sfx shake flash fadeOut fadeIn transition banner notify spawnNpc removeNpc showNpc camera cameraFollow weather time quest.start/advance/complete unlock achievement parallel([...]) call(genFn) emit custom(fn) log freeze hideHud`.
Graceful degradation when a subsystem is missing: `battle` → fake win; `move/face/teleport/warp/camera/spawnNpc/...` → resolve immediately; `giveItem/takeItem` → `Flags item_<id>` counters (so `item.<id>` conditions work); `giveMoney` → `Flags money`; `quest.*` → `Flags quest_<id>`; `unlock` → `Flags unlock_<id>` (+ `Overworld.state.abilities` if present); `music/sfx` → no-op.

## MQ.Flags
`get set(id,val=true) has clear add(id,n=1) toggle all reset chapter (get/set) test(expr) eval(expr) compile parse tokenize resolvers`.
Grammar: `|| && ! == != >= <= > < + - ( )`, numbers, quoted strings, identifiers with dots, calls `party.has(x)`. Resolvers: `quest.<id>` (MQ.Quests.stage or `quest_<id>` flag, default -1), `item.<id>` (MQ.Inventory.count or `item_<id>` flag), `badges`, `chapter`, `party.has(<sp>)`, `party.size`, `time.<phase>`, `weather.<kind>`, `money`, `true/false`; other identifiers → flag value (missing → false). Bad expressions warn and return false (`parse` throws). Save provider `flags`.

## MQ.Clock
`minutes day rate(1 game-min per real s) running frozen phase zone weather zones real{date,dow,month,day,hour,minute,year,isWeekend,season}`.
`update(dt)` advances when `Clock.running` **or** the top scene id is `overworld` (and no script is busy). `setTime(h,m) setPhase(p) advance(min) hour() minute() timeString() isNight() isDay() daylight() tint(phase) phaseFor(min) setZone(zone) setWeather(kind, zone?, natural?) weatherOf(zone)`. Phases dawn 05–07, day 07–19, dusk 19–21, night. Weather per zone: `clear rain fog wind sun snow` with a weighted transition table (snow only in winter months). Save provider `clock`.

## MQ.Save
`VERSION 2`, `SLOTS [1,2,3]`, `AUTO 'auto'`, `register(key,{save(),load(obj)})`, `unregister`, `snapshot()` → envelope `{version, ts, playtime, summary{name,badges,chapter,party[],map,level}, data{key:...}}`, `write(slot)`, `read(slot)` → envelope | null | `{legacy:true,version}` | `{corrupt:true}` (never throws), `isLoadable(env)`, `apply(env)`, `load(slot)`, `erase`, `exists`, `slots()` → 4 entries `{slot, env, empty, legacy, corrupt, summary, ts, playtime}`, `autosave()`, `newGame()` (providers get `load(undefined)`), `tick(dt)`, `setStorage(obj)`, `summaryFn`. Key `mq2_slot_<n>`.
Any `MQ.<System>.saveProvider = {save, load}` is auto-registered by `MQ.Boot.registerProviders()` under the lower-cased key (or `saveKey`).

## MQ.Data (registry.js)
`KINDS`, `define(kind,id,obj)` (sets `obj.id`, warns on redefine in DEV), `get` (throws in DEV), `getOr`, `has`, `each`, `ids`, `count`, `list`, `filter`, `kind(name)` (creates), `validators[]`, `validate()` → string[]. `data/types.js` adds `typeChart`, `typeIds`, `typeMultiplier(atk, defTypes[])` (13 lower-case type ids incl. `cyber`).

## Seed stubs (marked `// STUB — owned by <team>`)
- `js/art/sprites.js` MQ.Art: `render(art,pal,scale,flip)`, `get(key,art,pal,scale,flip,tint)` cached, `define/sprite`, `flip`, `tint`, `silhouette`, `TYPE_PALETTES`, `warm`, `stats`, `canvas(w,h)`.
- `js/art/tiles.js` MQ.Tiles: `define(id, props)`, `get(id, frame, variantSeed)` → cached 16×16 canvas, `has props ids count isSolid frames warm clearCache`. 288 named tiles with correct `solid/water/grass/encounter/layer/anim/variants/ledge/interact/light` and flat placeholder painters (art team replaces `paint`).
- `js/data/types.js` (13 types + chart + validator).
- `js/world/mapformat.js` MQ.World: `defineMap(id, def)` (sets width/height), `get has ids each defineTemplate template(name, overrides) tileAt(map,layer,x,y) propsAt inBounds isSolid isWater warpAt validate(opts)` → string[]; validate also registered as a Data validator. `js/world/maps/_demo.js` defines `demo_field`, `demo_house` + `house_small` template.
- `js/battle/engine.js` MQ.Battle.start → resolves `{outcome:'win', stub:true}` next frame.
- `js/boot.js` MQ.Boot: `start()` (honours `window.__MQ_NO_BOOT`, waits for DOMContentLoaded), `init()`, `registerProviders()`, `buildArt()` (calls `Tiles.warm/Art.warm/PeopleArt.warm`), `placeholderTitle()`. Pushes `MQ.UI.Title` if defined.

## Deviations from ENGINE-ARCHITECTURE.md
1. **`Input.pressed` is not auto-consumed by reading it.** It stays true for the whole fixed step so several readers can see it; call `Input.consume(action)` to eat it (menus/dialog do). Reason: two components in the same step must be able to inspect an edge without racing.
2. **`Scenes.transition()` resolves at the midpoint** (fully covered) rather than at the end, plus `fadeOut/fadeIn` for held covers. Reason: callers need the covered moment to swap maps/scenes; the reveal is automatic.
3. **`Clock` auto-runs when the top scene id is `overworld`** in addition to `Clock.running`. Reason: works even if the world team never sets `running`.
4. **`Script.cmds.choice(choices, q)`** argument order (contract lists `choice(...)` without a signature); `ask(q, choices)` is the primary form.
5. `Loop.step` also ticks `Script.update` (wait timers on game time) and `UI.update` (toasts/banner); `Loop.render` draws `UI.draw` (toasts/banner) and `Input.draw` after scenes. Not in the contract but required for `wait`, toasts and canvas-drawn touch UI.
6. `Dialog` boxes are 3 lines/page (spec silent) and narrow themselves by 170 px when touch controls are visible so A/B don't overlap text.
7. `Save.read` returns marker objects (`{legacy}`/`{corrupt}`) instead of null so the title can offer "new game" per contract; `Save.isLoadable` distinguishes.
8. `Flags` grammar additionally supports `+ -`, quoted strings, `party.size`, `money`, `true/false`. Superset only.
9. Extra file `css/style.css` (contract §1 lists it under platform) — written by core since index.html/gen-index are here; `sw.js` cache `mq2-1`. Old `js/*.js` files untouched and not loaded.

## NEEDS (for other teams)
- **world/overworld**: implement `MQ.Overworld.moveEntity(who, path, opts)→Promise`, `faceEntity`, `warp(map,x,y,dir,{fade})→Promise`, `placeNpc`, `spawnNpc/removeNpc/showNpc`, `cameraTo/cameraFollow`, `freeze(bool)`, `hideHud`, `getNpc`, `state.abilities:Set` — Script commands already call these when present. Give the overworld scene `id: 'overworld'` so the Clock runs.
- **content**: `MQ.Party.{add,heal,has,list}`, `MQ.Inventory.{add,remove,count,money}`, `MQ.Trainer.{name,badges,level}`, `MQ.Quests.{start,advance,complete,stage}`, `MQ.Achievements.unlock`, `MQ.Settings.load` — Flags resolvers, Script and Save summary use them when defined. Expose `saveProvider` on each so Boot registers it.
- **ui**: `MQ.UI.Title` scene (Boot pushes it if defined; use `MQ.Save.slots()`; treat `legacy/corrupt` entries as "new game").
- **audio**: `MQ.Audio.unlock()` (Input calls on first gesture), `sfx(id)` (ids used by core: `cursor confirm deny text item`), `playSong(id)`.
- **art**: replace `paint` in `art/tiles.js` (keep ids/props); `MQ.PeopleArt.portrait(key)` for dialog portraits; `MQ.FX.shake/flash` override the core fallbacks.
- **platform/android**: hardware back → `MQ.Input.inject('b')` still applies.
