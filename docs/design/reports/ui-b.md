# ui-b — information screens & HUD widgets

Files owned and written:

| file | global | what |
|---|---|---|
| `js/ui/dex.js` | `MQ.UI.Dex` `DexEntry` `DexFilter` `DexMilestones` | the field dex |
| `js/ui/casebook.js` | `MQ.UI.Casebook` | clue board, 30 cases, bounties, awards |
| `js/ui/worldmap.js` | `MQ.UI.WorldMap` (= `MQ.UI.Map`), `WorldMapLegend` | stylised Cheshire + fast travel |
| `js/ui/trainercard.js` | `MQ.UI.TrainerCard` (= `MQ.UI.Trainer`), `MQ.UI.Badges` | the card, and all eight badges drawn |
| `js/ui/perks.js` | `MQ.UI.Perks` | TRIAGE / ESCALATE / ADJUDICATE tree |
| `js/ui/hud.js` | `MQ.UI.HUD` | quest tracker, SIGNAL, CUTOVER, mini-map |
| `tools/test/test-ui-b-{screens,dex,casebook,map,perks}.js` | | 41 headless tests |

Everything is a `MQ.Scenes` scene with an `open(params)` that returns a promise, so
the pause hub picks all five tabs up automatically. `MQ.UI.Theme` is read at
runtime, never at parse time; geometry comes from `MQ.View`/`Theme.m()`; rows and
nodes are big tap targets, taps select, B / the header chevron / hardware back all
close, and the footer hint bar is tappable — the same conventions as ui-a.

---

## MQ.UI.Dex

`open({filter, species})` · `entry(speciesId)` · `listIds()` · `filter` ·
`whereToFind(id)` · `regionsOf(id)` · `drawIcon(...)` · `REGIONS`.

Grid of `MQ.MonsterArt` icons sized to the screen (3–10 columns), three states:
never met (`?`), sighted (darkened silhouette), caught (full colour + brass pip).
Header carries seen/caught and a two-tone completion bar. SELECT opens the filter,
START the progress screen.

- **`MQ.UI.DexFilter`** — Show (all/seen/caught/not caught), Type, Habitat, Region,
  Order (number/name/type), with a live "N entries match" count. Region is derived
  from the encounter tables, not hand-typed: every map's `encounters`/`fishing`
  tables are indexed once into species → sites, and the site's `region` gives the
  region. Rebuilt automatically when maps or tables change.
- **`MQ.UI.DexEntry`** — five pages: **Profile** (sprite or silhouette, genus,
  height/weight, habitat, rarity, dex text), **Stats** (six base bars, BST, catch
  rate, base exp, growth, abilities + descriptions), **Family** (the evolution chain
  drawn as icons with the real method text — level, item, friendship, location,
  time, trade, move, weather — plus branching evolutions), **Habitat** (where to
  find it: site, zone, level band, share of the table, time/weather conditions,
  your own sighting notes), **Records** (sightings, first seen/first caught, where
  you met it, and photographs from `MQ.Photo` when that lands). The cry plays on
  entry and on A.
  *Habitat gating*: sites you have not visited are hidden until the **Field
  Notebook** (Q26 `case_26`, item `field_notebook` / flag `dex_habitats` /
  setting `dexHabitats`) — the screen says so instead of lying.
- **`MQ.UI.DexMilestones`** — the seven SIDE-CONTENT §2.8 milestones with live
  progress off `MQ.Trainer.dexMilestones`/`dexMilestonesDone`, plus completion bars
  per type and per habitat.

## MQ.UI.Casebook

`open({tab:'board'|'cases'|'bounties'|'awards', chapter})` · `CHAPTERS` · `rebuild()`.

- **Board** — one cork board per chapter (1–13, left/right, never past the chapter
  you are in). Pins are the DESIGN-INDEX §6 story flags with a line of Jim's
  handwriting each (13 chapters × 5–8 pins, written here); unset flags hang as
  empty pins. `MQ.Quests.clueBoard(n)` pins land alongside them and
  `MQ.Quests.clueLinks(n)` draws the reveal as a line between two pins
  (STORY-BIBLE §6). The CUTOVER counter sits in the corner of the board.
- **Cases** — `MQ.Quests.casebook()` grouped by town, filtered All/Open/In hand/
  Closed, with a detail panel: summary, every step with ticks (unstarted steps stay
  `· · ·`), the twist marker, the reward (hidden while the case is merely open),
  what it teaches, and **A to track / untrack** through `MQ.Quests.track`.
- **Bounties** — `MQ.Quests.bountyBoard()`: tier chip, name, clue, payout, and A to
  accept (`acceptBounty`). Says out loud that the three are seeded to the date.
- **Awards** — `MQ.Achievements.list()` with progress bars and earned dates.

## MQ.UI.WorldMap

`open({mode:'view'|'travel', warp:false, focus})` → `Promise<mapId|null>` ·
`NODES` `EDGES` `nodeById(id)` `visited(id)` `travelOption(node)`.

44 nodes on the WORLD-BIBLE §1 grid (A–N × 1–10, one node per square), each with
its canonical DESIGN-INDEX §5 map id, region, kind, station map and a landmark line.
49 edges. Towns are discs, dungeons diamonds, sites squares; gym towns wear their
badge (drawn by `MQ.UI.Badges`), stations show a cyan pip, the map you are standing
on pulses green, walked edges go brass and the rail spine draws once you hold a
Railcard. Somewhere you have never been near is a smudge with no name.
Terrain underneath: the Mersey and ship canal, the Dee estuary, the gritstone edge
east and the sandstone ridge west.

**Fast travel** resolves the promise with a **map id** and emits
`map:fasttravel {map, kind, node}`: rail to `<town>_station` with
`rail_fast_travel` + a station you have set foot in; canal to a moored town with
the `boat` ability; the Cambrian line to `y_berllan_halt` with `cambrian_ticket`.
Pass `warp:true` and it also calls `MQ.Overworld.warpTo` itself.
SELECT opens `MQ.UI.WorldMapLegend`.

## MQ.UI.TrainerCard / MQ.UI.Badges

`MQ.UI.Badges.draw(ctx, badgeId, cx, cy, size, earned)` · `LIST` · `get` · `earned` —
the eight gym badges drawn as enamel discs (bolt, key, paw, firebox, drop, crystal,
flask, cursor) in their gym's type colour. Nobody else owned badge art; the world
map and anything else may borrow these.

The card: portrait (`MQ.PeopleArt` when present, else the GRINMALKIN grin), name,
rank, ID, trainer level with XP bar, playtime, credits/marks/chips, dex seen and
caught, the eight badges with town names (**relabelled SIGNED after
`pippin_found`**), MEADOW and BIGBOY with trust pips and a word for each level, and
your titles. Page two, **Records**: all 27 `MQ.Trainer.stats` counters in plain
English, trinkets, ribbons pulled off the party, award count and perk points.

## MQ.UI.Perks

`open({perk})` · `BRANCHES` · `effectText(key, value)`.

The 30-node tree as a node graph: three lit spines, ten rows, level gates down the
left gutter, rank pips under each node, agent nodes drawn as hexagons and capstones
as diamonds. Anything you could afford right now breathes gently. The detail panel
shows the next rank's name and prose, its effects as chips in English ("Prize money
×1.25", "SLEET cooldown -1"), and either "A: take it (1 point)" or
`MQ.Progression.blockedReason` verbatim. SELECT respecs through
`MQ.Trainer.respec` at `MQ.Progression.respecCost()` Casebook Marks, and refuses
politely when the marks are not there.

## MQ.UI.HUD (for the overworld)

```js
MQ.UI.HUD.corner(ctx, {tracker, signal, cutover, miniMap, miniMapOpts})  // the standard arrangement
MQ.UI.HUD.tracker(ctx, x, y, w) -> height     // MQ.Quests.tracked(), cached 400 ms
MQ.UI.HUD.signal(ctx, x, y, w) -> height      // ten shimmering pips; signalLevel() / signalWord()
MQ.UI.HUD.cutover(ctx, x, y, w) -> height     // "38 DAYS" / "STOPPED" / "T-3" / "T-0", pulses red
MQ.UI.HUD.miniMap(ctx, x, y, w, h, {map, tileX, tileY, npcs, warps, label, alpha, frame})
MQ.UI.HUD.miniMapCanvas(mapId)   invalidate(mapId?)   setMiniMap(on)   mapName(id)
MQ.UI.HUD.cutoverState()  signalLevel()  tracked()  invalidateTracker()
```
The mini-map bakes a whole map once into an offscreen canvas at **2 logical px per
tile** using `MQ.Tiles.props(id).color`, keyed on `World.prepare().serial`, then
draws warps, NPCs (trainers red, cats amber) and a blinking you on top, scrolling
to keep the player centred on maps larger than the box. Nothing here allocates per
frame.

---

## Tests

`node tools/test/run.js ui-b` → **41 passing**; whole suite **442 passing, 0 failing**;
`node tools/validate.js` → OK (79 scripts with our files generated in).
Coverage: every screen publishes/pushes/draws/pops, backs out on B, redraws in
portrait and survives the whole content layer being absent; dex filters by status,
type, habitat and region against the real registries; the where-to-find index
matches `MQ.Data.encounters`; entry paging, cries and the filter screen; the board's
13 chapters and their flag ids; case grouping, filtering and the tracking toggle;
bounty accept; all 40 awards with progress; world-map node/grid uniqueness, edge
integrity, visited/known logic and every fast-travel gate; HUD tracker/SIGNAL/
CUTOVER states and the mini-map bake and cache; perk navigation, buying, gating,
multi-rank nodes and the respec cost.

**One file I do not own was touched**: `tools/test/test-ui-a-screens.js` asserted
that the Dex tab is greyed out "because ui-b is not fitted here". Now that
`js/ui/dex.js` exists that assertion fails, so it became
`assert.strictEqual(items[2].disabled, !MQ.UI.Dex, …)`. One line, no behaviour change.

## NEEDS

- **world/overworld** — call `MQ.UI.HUD.corner(ctx)` (or the individual widgets)
  instead of the overworld's own tracker/SIGNAL/CUTOVER/mini-map, so both HUDs do
  not draw at once; `MQ.UI.HUD.setMiniMap()` is the toggle. Keep
  `MQ.Overworld.state.visited` (the world map reads it) and honour
  `map:fasttravel {map}` — or open the map with `{mode:'travel', warp:true}` from
  station tiles and let it warp for you.
- **content** — `MQ.Photo`: the dex Records page reads `MQ.Photo.photosOf(id)` (or
  `of(id)`, or `album()`), expecting `[{species, map, pose, score, ts}]`; until then
  it says photo mode is not fitted. A `MQ.Signal.level` (0–1) would beat the HUD's
  derivation from `cutover_days`. `MQ.Quests.def(id).reward` is read for the case
  reward line.
- **data** — `MQ.Data.achievements` display names/descriptions (the engine's
  fallbacks are drawn today); `MQ.Data.bounties` for real clue text.
- **maps** — the world map lists all 44 nodes by their canonical ids; regions
  outside `east` have no maps yet, so those nodes simply never light. Define
  `station:` maps as `<town>_station` and keep `landmark` on outdoor maps.
- **ui-a** — the pause hub already finds all five screens; nothing else needed.

## NEW IDS

- `station_<mapid>` — optional flag meaning "this station is registered"; the map
  otherwise infers it from having visited the station map.
- `dex_habitats` — flag alternative to owning `field_notebook` for showing every
  site on the dex Habitat page (SIDE-CONTENT Q26's reward).
- `player_id` — optional flag for the number printed on the trainer card (hashed
  from the name when absent).
- Event `map:fasttravel {map, kind, node}` — emitted when the world map sends you
  somewhere.

## Known gaps

- Photo records are a placeholder shape until somebody owns photo mode.
- The clue board draws link lines between pins that are both on the current
  chapter's board; links across chapters are stored by `MQ.Quests` but not drawn.
- The world map is a schematic, not a drawn county: no coastline art, no route
  labels on the edges.
- Bounty and case text is only as good as `MQ.Data.quests`/`bounties`, which
  currently cover the east region and the engine's fallback pool.
- No browser testing — headless only, as instructed.
