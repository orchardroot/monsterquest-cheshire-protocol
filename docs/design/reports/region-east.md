# Workstream report — region-east

The game's opening region: Macclesfield to Alderley Edge, Chapters 1 and 2,
Gym 1, and the global story glue every other region hangs off.

## What shipped

**101 maps / ~56,800 tiles** under `js/world/maps/east*.js`, all authored in the
ENGINE §5.2 format via `MQ.EastBuild` (a parse-time canvas painter — nothing in
these files runs game logic).

| File | Contents |
|---|---|
| `east__build.js` | `MQ.EastBuild`: canvas, `house`, `trees`, `scatter`, `snake`, and the shared `TOWN` / `LAND` / `CAVE` legends (`B.legend`, `B.landLegend`, `B.caveLegend`) |
| `east_macclesfield.js` | Macclesfield + 14 interiors (Alder Labs, Paradise Mill, Silk Museum, St Michael's, station, mart, outfitters, inn, care, 4 cottages, home) |
| `east_bollington.js` | Bollington, Clarence Mill, Kerridge Hill / White Nancy |
| `east_prestbury.js` | Prestbury + Priest's House, hedge maze, Norman chapel, St Peter's, boutique, Bridge Hotel, care, 2 houses |
| `east_poynton.js` | Poynton (pool, shared-space roundabout) + Anson museum, Lady Pit adit, Pat's daycare, station, mart, care, 2 houses |
| `east_lyme.js` | Lyme Park, the house, stable yard, the Cage, the unsurveyed chamber under it, the Bowstones + hut |
| `east_teggs.js` | Tegg's Nose, the quarry cutting, Trentabank heronry, Ridgegate dam, the Cat and Fiddle, visitor centre, Shutlingsloe |
| `east_wilmslow.js` | Wilmslow + **Gym 1** (rack-room puzzle + Ada's floor), Turing's house, post office, station, church, café, mart, inn, care |
| `east_styal.js` | Styal, Quarry Bank Mill, the wheelhouse, Apprentice House, the fridge cottage, chapel, 2 houses |
| `east_lindow.js` | Lindow Moss (boardwalks, the Stuffers' data lake) and the Waders-gated Deep Moss |
| `east_alderley.js` | Alderley Edge (village, Castle Rock, Stormy Point, Beacon, Wizard's Well) + Edge Caverns B1/B2/B3 and the rope slide |
| `east_routes.js` | R1–R7, R32 and the Lindow approach, plus the Rope Island and Middlewood Tunnel |

282 NPCs, 133 signs, 144 pickups, 63 trainer placements, cat gaps and
rest points throughout.

**Data** — `js/data/encounters_east.js` (80 tables: grass/water/cave with
night/rain/fog/wind variants and `fish_<mapid>`), `js/data/trainers_east.js`
(68 trainers incl. rival `vex_1`, Gym 1 `leader_ada` with house rules +3 boss
phases, mini-boss `boss_preserved_one`), `js/data/quests_east.js`
(`main_01_silk_and_static`, `main_02_the_wheel_and_the_edge`, and the six
Casebook cases set in this region).

**Story** — `js/story/main.js` (chapter table, title cards, `advanceChapter`,
CUTOVER table, `startNewGame`, starter/counter-pick tables, ending selector
stub), `js/story/npcs_east.js` (~72 `east_*` scripts), and
`js/story/chapters/ch01_silk_and_static.js` / `ch02_the_wheel_and_the_edge.js`.

## Public API used by other teams

- `MQ.Story.chapters[n]` — `{n, id, title, card, band, song, region, gym?, start, hooks}`;
  `MQ.Story.defineChapter(n, def)` to attach a chapter's opening.
- `MQ.Story.advanceChapter(n, opts)` → Promise; shows the card, ticks CUTOVER,
  runs `start`, autosaves. `MQ.Story.chapter()`, `chapterInfo()`, `levelBand()`.
- `MQ.Story.CUTOVER`, `cutoverFor(n)`, `applyCutover(n)`, `cutoverLabel()`.
- `MQ.Story.startNewGame()`, `MQ.Story.STARTERS`, `COUNTER_PICK`, `starter()`,
  `rivalStarter()`, `summary()`.
- `MQ.Story.runEnding()` / `MQ.Story.endingScripts[id]` — region-nw registers
  `ending_delete`, `ending_quarantine`, `ending_custody` here.
- `MQ.EastBuild` if another region wants the same painter helpers.

## Tests

`tools/test/test-region-east.js` — validates the world, checks every east map's
dimensions, spawn/heal points, NPC/sign/item approachability, that **every warp
is reachable on foot from the map's spawn point**, that warps land on walkable
tiles and round-trip, and that every encounter/fishing/trainer id resolves.

`tools/test/test-region-east-story.js` — runs the Chapter 1 opening to
completion under `MQ.Dialog.auto` (one starter, correct counter-pick, contract,
quest open, lands in Macclesfield, idempotent on replay); the cats joining on
Mill Street; White Nancy and the canal VEX battle; the gym patch-panel ordering
and its `gym1_patched` door gate; Ada's badge/anchor/card/OVERDRIVE/VIGIL
payload; the Styal sluice order and the fridge; the Edge inscriptions in order;
the White Nancy choice; the Carrs gates; the chapter table and CUTOVER.

`node tools/validate.js` → OK. `node tools/test/run.js` → 368 passed, 0 failed.

## NEEDS

- **Audio**: `route_east`, `route_bollin`, `battle_gym` and `dungeon_cave` are
  not in `MQ.Songs` and log "unknown song" at runtime. Aliases would do.
- **Shops**: maps declare `shop: 'shop_macclesfield'`, `shop_wilmslow`,
  `shop_alderley_ropes`, `shop_teggs_nose`, `shop_lyme_stables`, `shop_poynton`,
  `shop_prestbury_boutique`, `shop_wilmslow_cafe`, `shop_alderley_edge`,
  `shop_macclesfield_outfitters`. No shop registry exists yet; nothing breaks.
- **Sprites**: `npc_station`, `npc_publican`, `npc_tourist` are referenced by
  the maps and are not in `MQ.PeopleArt`.
- **Fishing**: case 7's stages now key off the dex (`catch`), because nothing
  emits a per-map fish counter.
- `tools/gen-index.js` needed `story/npcs_east` and `data/quests_east` adding to
  its contract order (one line) or the files are silently excluded.

## Known gaps

- `tools/test/test-content-core-cats.js` › "cat-only paths…" is flaky
  (`sendThrough` rolls `Math.random() < 0.95`); ~1 run in 10 fails. Not ours.
- Casebook cases 1–5 and 7 are scripted end to end; the wider Casebook clue
  board, arena, bounties and brewing hooks are other workstreams'.
- Post-game content on `alderley_edge_caverns_b3` is gated on
  `knights_hall_open`, which nothing in this region sets.
