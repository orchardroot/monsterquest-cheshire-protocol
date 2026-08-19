# Workstream report — world-engine

Branch `ws/world-engine`. Files owned and shipped:

| file | what |
|---|---|
| `js/world/mapformat.js` | `MQ.World` — map defs (unchanged API) **plus** a prepared runtime layer, ability-aware collision, edge warps, A*, extra validation, and a nine-room interior template library |
| `js/world/npc.js` | `MQ.NPC` — overworld entities, behaviours, trainer sight-lines, companion cats, emotes, fallback art |
| `js/world/interact.js` | `MQ.Interact` — everything the A button does |
| `js/world/encounters.js` | `MQ.Encounters` — wild encounter rolls, fishing, repel/lure, SIGNAL weighting |
| `js/world/overworld.js` | `MQ.Overworld` — the scene (`id: 'overworld'`) |
| `tools/test/test-world-engine.js` | 31 headless tests (`node tools/test/run.js world-engine`) |

`node tools/test/run.js` → **60 passed, 0 failed**. `node tools/validate.js` → OK.
`index.html`/`sw.js` are regenerated locally with `node tools/gen-index.js` for testing and reverted before every commit (platform owns them).

---

## 1. `MQ.World` — map runtime

Everything from the seed still works (`defineMap get has ids each defineTemplate template tileAt propsAt inBounds isSolid isWater warpAt validate`). Added:

```js
World.prepare(map|id) → rt        // cached, rebuilt on defineMap
// rt = {w,h,n, ground/deco/over:[tileId], solid,water,zone,ledge,slow,light,climb,
//       catgap,voidCell:Uint8Array, interact:[kind], anim:[{layer,i,x,y,id,frames}],
//       warpGrid,signGrid,itemGrid, lightCount, hasAnim}
World.idx(map,x,y)  groundAt  zoneAt  ledgeAt  interactAt  signAt  itemAt  isSlow  isCatGap  catGapAt
World.blocked(map,x,y,abilitiesSet)   // water←boat/swim, crag←climb, bog←waders, hedge←billhook, gap←squeeze
World.blockReason(map,x,y,abilities)  // 'water'|'climb'|'catgap'|'bog'|'hedge'|'solid'|null
World.ledgeBlocks(map,x,y,dir)        // ledges are one-way
World.edgeWarps(map)  World.allWarps(map)   // `edges:{north:{map,offset}}` → real warps
World.triggersAt(map,x,y,out)  World.spawnOf(map)  World.encounterTableId(map,zone)
World.findPath(map,sx,sy,tx,ty,{abilities,maxNodes,avoid,goalBlocked}) → [{x,y}…]|null
World.setTile is on MQ.Overworld (it also drops the render chunk)
World.invalidate(id?)  World.stats()
```

**New optional map fields** (additive to ENGINE §5.2; all ignored if absent):
`open:['x,y']` (punch a hole through a solid tile), `catGaps:[{x,y,item,n,flag,lever,tile,say,solid}]`,
`restPoints:[{x,y,flag}]` (BIGBOY sit-downs), `billhookGaps:['x,y']`, `encounterParent:'mapid'`
(sub-maps borrowing a parent's tables), `dark:true` (cave lighting), `bg:'#hex'`, `dialogue:'poolId'`,
`shop:'shopId'`, `berry`/`ore` (item id a map's bushes/veins give), `underBoulder` (tile revealed by a shove),
`fishing:'fish_<mapid>'`, `landmark`, `healPoint`, `station`.

**Extra validation** (runs inside `World.validate()`, so `tools/validate.js` picks it up): unknown warp `kind`,
bad warp `cond`, unknown NPC behaviour, `path` NPCs with no/solid/out-of-bounds waypoints, trainer `sight`
out of range, area triggers off the edge, out-of-bounds catGaps/restPoints/landmark, duplicate item flags,
undefined fishing table, encounter zone keys that aren't `grass|water|cave`, and long grass with no
`encounters` block at all (an explicit `{grass:null}` is respected as "nothing spawns here").

### Interior templates
`World.builtins` holds nine shipped rooms; `World.template(name, overrides)` merges deeply and also accepts
`patch:[{x,y,ch,layer}]` for single-cell tweaks. `World.builtin(name, overrides)` forces the shipped version
even if a map file has redefined the name.

`house_small` 12×10 · `house_large` 16×14 · `shop` 14×10 · `care_centre` 16×12 · `gym_hall` 18×16 ·
`station` 20×12 · `pub` 14×12 · `church` 14×14 · `cave_room` 20×13.

Each carries `anchors` (`door`, plus `bed/stairs/counter/clerk/healer/box/nurse/casebook/leader/badge/platform/guard/bar/landlord/altar/vicar/entrance/pool/vein`) so map files place NPCs without counting characters:

```js
MQ.World.defineMap('macclesfield_care', MQ.World.template('care_centre', {
  name: 'Macclesfield Care Centre', music: 'town_macc',
  warps: [{x:7,y:11,to:'macclesfield',tx:18,ty:22,dir:'down',kind:'door'}],
  npcs:  [{id:'npc_macclesfield_nurse', x:4, y:2, dir:'down', sprite:'npc_shopkeep', say:['Anything that walks in gets a cup of tea.']}]
}));
```

## 2. `MQ.NPC`
`create(def,mapId) reset visible isBeaten face faceTowards step advance update(e,dt,world) emote emoting
sightCheck(e,player,blocked) draw drawPerson drawCat drawEmote palette shadow
trailReset/trailPush/trailSample makeCat followingCats updateFollower CATS SPEED FRAMES`.

Behaviours `still` (turns to a player who stands next to them) · `wander` (radius-bounded, avoids the player) ·
`path` (waypoints, `pathMode:'loop'|'pingpong'`, `pathPause`) · `look` (turns; locks on inside `radius`) ·
`follow` (cats). Trainers get an `!` bubble, walk up their sight line, then battle.
Cats trail on a 256-entry breadcrumb ring buffer (MEADOW 30 px back and darts ahead when you idle;
BIGBOY 58 px back, sits when you stop, and fires `cat:rest` at a `restPoint` → heal 25 %, autosave, flag).
Without `MQ.PeopleArt` everyone is drawn procedurally (jacket/hair/skin hashed from the sprite id), so the
world is legible before the art lands.

## 3. `MQ.Interact`
`press(world)` (called by the overworld on A), `at(world,x,y)`, `run(world,descriptor)`, `define(kind,fn)`,
`talk`, `trainerBattle`, `pickUp`, `openShop`, `heal`, `wildBattle`, `handlers`.
Handlers: `npc item sign lure door gate pc machine shelf bed shop fish boat spring berry pick shake push
climb mine cart sit train catgap unknown`. Every one calls the owning system when it exists
(`MQ.Shop.open`, `MQ.Box.open`, `MQ.Fishing.start`, `MQ.Inn.sleep`, `MQ.Gathering.pick/mine`,
`MQ.Brewing.start`, `MQ.Minigames.start`, `MQ.Rail.open`, `MQ.Bounties.open`, `MQ.Rematches.offer`,
`MQ.Party.heal`, `MQ.Inventory.add`, `MQ.Quests.check`) and otherwise emits an event and says something
in the game's voice.

## 4. `MQ.Encounters`
`step(map,x,y,opts)` (per tile enter) · `rollZone` · `force` · `tableId(map,zone)` (night replaces, rain/fog
overlay 50 %, missing variant falls back) · `rateFor` · `pickRow` · `preview(map,x,y)` (Tracker perk / BIGBOY's
nose; returns rows with percentages) · `fish(map,x,y,{rod})` with chain bonus and rod-tier gating
(`bamboo|weighted|carbon|elm`; legendary only dawn/dusk, ghost only night + Ghost Lens) · `repel/lure/
clearRepel/breakChain/afterBattle` · `signalLevel()` (uses `MQ.Signal.level`, else derives from
`signal_meter`/`cutover_days`/`plug_pulled`/`choice_plug`) · `saveProvider`.
Rare rows are weighted up by SIGNAL; results carry `{species,level,table,zone,rare,agitated,signal,shiny,monster}`.

## 5. `MQ.Overworld` (the scene)
Movement exactly per ENGINE §5.3: `MQ.Input.axis()`, walk 4.2 t/s, run 7.0 (run button, or stick > 0.85 —
*not* keyboard, whose digital axis is always magnitude 1), sliding collision on a 20×14 feet box with corner
assist, facing quantised to four, tall grass ×0.85, rain ×0.9 (unless the Rain Cloak trinket), boat ×0.85,
bike ×1.22 while running on a cycleway. Ledges auto-hop down and refuse the step back up; water needs
`boat`/`swim` (and the boat picks you up and sets you down automatically); crags need `climb`; bogs `waders`;
cat gaps `squeeze`.

Camera: soft exponential lerp with a look-ahead that decays when you stop, clamped to the map (centred when
the map is smaller than the view), drawn on integer pixels.

Rendering: ground → deco → items → entities (y-sorted) → over → particles → weather/lighting → HUD.
Each 8×8-tile chunk of each layer is pre-rendered once to an offscreen canvas (LRU-capped at 160); animated
cells are excluded from the static bake and redrawn per frame from a flat per-chunk list, so a 60×45 map is
three `drawImage` grids plus a handful of water tiles. Weather is delegated to `MQ.FX.weather` when present,
otherwise drawn from fixed particle pools (rain, snow, fog bands, wind streaks, sun wash). Night/dusk tint
punches lamp-holes through an offscreen light layer. SIGNAL draws scanlines plus a shimmer over encounter
tiles near the player.

HUD (all suppressible with `hideHud`): location banner on map change, quest tracker line from
`MQ.Quests.tracked()`, clock + weather chip, SIGNAL meter gauge, CUTOVER counter (`38…0 / STOPPED / T-3 / T-0`),
and a mini-map toggled with **select** (cached per map, with warps, NPCs and a blinking you).

**Public API** (the core's NEEDS list, all present):
```js
MQ.Overworld.state = {map, px, py, dir, abilities:Set, steps, boating, respawn, visited}
enter/exit/update/draw/resume/onResize      // it is the scene; id 'overworld'
spawn(mapId?,x?,y?,dir?)   place(x,y,dir)   warp(map,x,y,dir,{fade,kind,ms,autosave}) → Promise
warpTo(mapId,opts)         recover()        // fast travel; party wipe → last care centre
moveEntity(who, path, {speed,route,repeat}) → Promise      // dirs, [x,y], {x,y}, or A* with route:true
faceEntity(who,dir)  placeNpc(id,map,x,y,dir)  spawnNpc(def)  removeNpc(id)  showNpc(id,bool)  getNpc(id)
npcAt(x,y)  npcs()  cats()  getCat(which)  refreshCats()  catSit()  sendCat(x,y,which)
cameraTo(tileX,tileY,ms) → Promise   cameraFollow()   snapCamera()   camera
freeze(bool) frozen() busy() locked() hideHud(bool) toggleMinimap(on?)
setTile(x,y,tileId,layer) invalidateChunks() setBoat(on) shove(x,y) climbAt(x,y)
unlock(id) hasAbility(id) currentMap() blockedTile(x,y) boxClear(px,py) emitParticle(...)
saveProvider (registered by Boot under 'overworld'); MQ.Encounters.saveProvider under 'encounters'
```
Events emitted: `map warp step trigger encounter battle:start battle:end item:pickup shop:open pc:open heal
sleep gather rest lure:taken lure:declined machine:use boat unlock boulder:push catgap:done lever cat:rest
overworld:enter overworld:exit`.

## NEEDS (other workstreams)
- **ui** — push the scene: `MQ.Scenes.push(MQ.Overworld, {map, x, y, dir})` from Title/continue; provide
  `MQ.UI.Pause` (start opens it). Nothing else pushes the overworld.
- **art** — `MQ.PeopleArt.get(spriteId, dir, frame, pose)` → canvas (poses `null`/`'sit'`), `portrait(key)`;
  sprite ids used: `player player_boat player_bike cat_meadow cat_bigboy` + whatever maps name.
  Optional `MQ.FX.weather(ctx, kind, dt, {w,h,ox,oy})` overrides the built-in weather.
  **A `cat_gap` tile id** in `art/tiles.js` (solid, `interact:'catgap'`) would let maps draw gaps in the
  legend; until then they list `catGaps` on the map. Note `cliff_climb` is treated as solid until you hold
  `climb` (the catalogue has no `S` on it).
- **data** — `encounters` tables named `<mapid>_<zone>[_night|_rain|_fog]` and `fish_<mapid>`, rows
  `{species,min,max,w,rare?,time?,weather?,cond?,tier?}` + `rate`; `trainers` with
  `{name,cls,party,intro,win,lose,after,payout,rematch,leader,boss}`; `MQ.Data.makeMonster(species,level,opts)`
  (encounters call it when present); `dialogue` pools keyed by town/region for NPC chatter.
- **battle** — `MQ.Battle.start({kind:'wild'|'trainer'|'boss', enemyParty|species+level, trainer, trainerId,
  rules:{canRun,canCatch,weather}, encounter, spotted})` → `{outcome:'win'|'lose'|'run'|'catch', …}`.
- **content** — `MQ.Party.heal/healPct`, `MQ.Inventory.add/remove/count/money/addMoney`,
  `MQ.Quests.tracked()/check()`, `MQ.Cats.following()` (else `cats_joined` puts both out),
  `MQ.Signal.level` (else derived from flags), `MQ.Trainer.trinkets`/`perks`, and the `start/open` hooks
  listed in §3.
- **audio** — sfx `step_grass step_stone step_wood step_water step_salt door warp ledge_hop boat_chug
  cat_meow cat_sit coin fish_bite heal hit_normal ui_open ui_error ui_select rain wind`; `playSong(map.music)`
  and `battle_wild/battle_trainer/battle_gym/battle_legendary`.
- **maps** — `js/world/maps/_demo.js` redefines the `house_small` template; drop that call (or use
  `MQ.World.builtin('house_small', …)`) so the shipped interior is used.

## NEW IDS
Flags written by this engine (all `<system>_<thing>` shaped, per DESIGN-INDEX §9):
`beat_<trainerId>` (trainer defeated — the sight-line and rematch checks read it), `npc_gone_<npcId>`,
`visited_care_<mapid>`, `gather_<mapid>_<x>_<y>`, `shook_<mapid>_<x>_<y>`, `mined_<mapid>_<x>_<y>`,
`lures_taken`, `lures_declined`, `lured`, `trinket_<itemId>` (fallback until `MQ.Trainer.trinkets` exists),
`no_encounters` (debug). Existing canon reused unchanged: `talked_<npcId>`, `item_<mapid>_<n>`,
`unlock_<ability>`, `bigboy_sat_<place>` (via `restPoints[].flag`), `trust_meadow`/`trust_bigboy`.
No new species/move/item/song/sfx ids; fallback pickups use ROSTER ids (`blackberry`, `apple`, `copper_wire`).

## Known gaps
- Trainer **rematch ladders**, escort/GUARD battles, photo mode and beacon warping are hooks only —
  the engine calls `MQ.Rematches.offer` / emits events; the systems belong to content.
- The mini-map is a tile-colour raster, not a hand-drawn regional map; the world-map screen is `js/ui/worldmap.js`.
- Lighting punches uniform 128 px lamp holes; per-tile light colour/radius would need art input.
- Cat **trust perks** (sniff range 5 at T1, auto-fish at T4) read `trust_<cat>` flags but the reward side is
  content's; only the range widening is implemented here.
- No browser testing was done (shared browser reserved for integration): all 31 cases are headless.
