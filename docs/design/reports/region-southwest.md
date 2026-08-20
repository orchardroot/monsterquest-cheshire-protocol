# Workstream report — region-southwest

Chapters 6 and 7: Nantwich and the brine, Hack Green, Y Berllan in
Ceredigion, and the whole salt half of Cheshire — Middlewich, Winsford,
Northwich, the Salt Mine, Anderton and Great Budworth. Gyms 5 and 6, the
PIPPIN reveal, the Wipe/Feed choice, and the boat-lift silence.

## What shipped

**97 maps / ~67,800 tiles** under `js/world/maps/sw*.js`, all authored in
the ENGINE §5.2 format. Nothing in these files runs game logic.

| File | Contents |
|---|---|
| `sw__build.js` | `MQ.SaltBuild`: wraps `MQ.EastBuild` and adds the brine/orchard/mine legends (`B.salt`, `B.orchard`, `B.mine`) plus `canal`, `lockFlight`, `orchardRows`, `pillarGrid`, `saltPans`, `railLine`, `timberRow`, `speckle`, and the cross-region `linkWarp` / `defineIfAbsent` helpers |
| `sw_borders.js` | R15 Willaston & Wybunbury, R17 Booth Lane, and `cambrian_train` — **defined only if region-mid has not already defined them** |
| `sw_nantwich.js` | Nantwich + **Gym 5** (six lanes, three lock gates, Nell's deep end), the brine lido, Acton field & church, the cheese show ground, care/mart/inn/station/church/Churche's Mansion/4 cottages |
| `sw_hackgreen.js` | Hack Green field & guard house, B1 (blast doors, decontamination), B2 (telecoms floor + the four-panel switchboard puzzle), the Ops Room |
| `sw_middlewich.js` | Middlewich, Big Lock, the boat office, the festival field, church, care/mart/inn/2 houses |
| `sw_winsford.js` | Winsford & the Flashes, the mine headgear, DeepStore, care/mart/inn/station/2 houses |
| `sw_northwich.js` | Northwich + **Gym 6** (a salt-crust floor with one safe path), Weaver Hall, Lion Salt Works, the market, care/mart/inn/station/3 houses |
| `sw_saltmine.js` | `salt_mine_cage`, `_galleries` (the white cathedral, 40 containers), `_deepstore_cold`, `_sinkhole`, `_marston_b1` (pillar-and-stall maze + DARKBYTE hideout), `_marston_b2` (brine lake, TERRATAUR), `_marston_b3` (post-game), `_back_stair` |
| `sw_anderton.js` | Anderton site, `anderton_lift_lower` / `anderton_lift_upper` (joined by the `lift` portal, or the long walk round), `anderton_narrowboat` (the Ch.7 ride), the lift office, Marbury Park, Great Budworth + church/care/inn/2 cottages |
| `sw_yberllan.js` | Y Berllan, the Cambrian halt, Mam-gu's house, the elm-press shed, the brewing cellar, the pond, Coed y Berllan, the lane to the sea, Aberaeron + care/shop/2 cottages |
| `sw_routes.js` | R16 Weaver Valley, the Hack Green lane, R31 Croxton flashes, R19 Rudheath, R18 Vale Royal Locks, R33 Weaver towpath, R34 Marbury avenues, R20 Arley & the Bollin |

**~180 NPCs, 80 signs, 75 pickups, 5 cat gaps, 12 BIGBOY rest points,
82 trainer placements**, and roughly **1,100 bespoke lines**.

**Data** — `js/data/encounters_sw.js` (73 tables: grass/water/cave with
night/rain/fog/dawn variants and `fish_*` for the canals, the flashes,
the lido, the Weaver, the Y Berllan pond and Aberaeron),
`js/data/trainers_sw.js` (82 trainers incl. `leader_nell` and
`leader_jack` with house rules + 3 boss phases each, `boss_kellan`,
`boss_hack_green_ops`, `boss_understudy_middlewich`, `boss_terrataur`,
`vex_3`), `js/data/quests_sw.js` (`main_06_brine_and_perry`,
`main_07_salt`, and Casebook cases 14, 17, 18, 19, 20, 21, 22, 25, 30).

**Story** — `js/story/npcs_sw.js` (~75 `sw_*` scripts) and
`js/story/chapters/ch06_brine_and_perry.js` /
`ch07_salt.js` (~23 set-piece scripts). 98 `sw_*` scripts in total.

### Set-pieces and the flags they set

- **The lido in the rain** — `lido_battle_done`; then the side-decision,
  `kellan_handed_in` or `kellan_walked` (walking him reveals he is paid
  in compute → `oracle_pays_in_compute`).
- **Gym 5** — three lane keepers → `gym5_gates` → `badge_token`,
  `tm_brine_jet`. Permanent Rain, Brine Body, VIGIL jammed 3 turns.
- **Y Berllan** — `orchard_open`, then the loose board in the shed:
  `pippin_found`, `oracle_is_pippin`, `pippin_drive` (badges relabel
  SIGNED). **CHOICE 1** immediately after: `choice_agents` = `wipe`
  (→ `agents_hardened`, agent perk nodes refunded via
  `MQ.Trainer.respecAgents()` or 3 perk points) or `feed`
  (→ `agents_fed`, `oracle_fed_map`).
- **The vet story**, in Welsh, with the answer the game has withheld
  since Chapter 1 — `vet_story_told`, `bigboy_shield`,
  `welsh_word_learned`; then `brewing_open` and `aberaeron_open`.
- **Middlewich** — AMOS in Alder's face on the towpath: `amos_alder_face`.
- **The cage and the galleries** — `mine_descended`, `checkpoints_seen`
  (forty containers, one note, a barcode starting with PIPPIN's endpoint).
- **TERRATAUR** — `terrataur_woken`; a phase shorter if you carried the
  SALTLING pup home in case 25 (`terrataur_one_less_phase`).
- **Gym 6** — `badge_daemon`, `tm_salt_grind`. Salt terrain, sixth at 40%.
- **The boat lift** — `boat_lift_silence`, `stack_on_map`, `lift_pass`.
  ORACLE speaks in Jim's own tone; **`agents_silent` is set true only if
  the player chose Feed** — Hardened agents talk straight through it
  (`agents_kept_talking`).

## Public API used by other teams

- `MQ.SaltBuild` — the painter helpers and the three legends, if another
  region wants brine, orchards or mine galleries.
- `MQ.SaltBuild.linkWarp(list, x, y, mapId, dir, mine)` — emits an edge
  warp only if the neighbouring region's map exists, aiming at its
  `spawnPoint`; `MQ.SaltBuild.defineIfAbsent(id, def)` for shared edges.
- `MQ.Story.SW.{fishing, brewing, minigame}` — the thin adapters this
  region calls into content-activities with.
- Everything else is data: maps, encounter tables, trainers, quests and
  `MQ.Story.npcScripts.sw_*`.

## Tests

`tools/test/test-region-southwest.js` — validates the world and all data
with zero problems; checks every map's dimensions, spawn/heal points,
NPC/sign/pickup/cat-gap approachability, that **every warp is reachable
on foot from the map's spawn point**, that every warp lands on walkable
ground and leads back, that the region joins up on foot from Nantwich to
Great Budworth and down to depth three (and that Wales is internally
whole from the halt), that every encounter/fishing/trainer id resolves,
and that both gym leaders carry a badge payload, a house rule and three
boss phases.

`tools/test/test-region-southwest-story.js` — every script the maps name
is registered and is a generator; the chapter table and CUTOVER; **the
Ch.6 opening run to completion under `MQ.Dialog.auto`** (and replayed);
the Ch.7 opening ticking CUTOVER to 17; the lido and both halves of the
Kellan decision; the three lane keepers gating Nell's gates; the drive
and **both branches of Wipe/Feed**; the vet story and BIGBOY's upgrade;
the descent, the checkpoints and TERRATAUR; the licence, DAEMON and the
lift pass; **the boat-lift silence resolving differently per choice**;
the four-panel switchboard gating the Ops Room; case 25 opening,
advancing and closing; and the Welsh lines unlocking what English does not.

`node tools/validate.js` → **OK (90 scripts, 200 maps)**.
`node tools/test/run.js` → **425 passed, 0 failed**.

## NEEDS

- **`tools/gen-index.js`**: `data/encounters_sw`, `data/trainers_sw`,
  `data/quests_sw` and `story/npcs_sw` are not in its contract `ORDER`
  and are therefore silently excluded from `index.html` and `sw.js`.
  Four one-line additions, beside their `_east` counterparts. Our tests
  build their own script list so they pass either way, but **the game
  will not load this region until that lands**.
- **region-mid**: `route_crewe_nantwich`, `route_sandbach_middlewich` and
  `cambrian_train` are defined here only if absent (`defineIfAbsent`), and
  our town edges aim at whatever `spawnPoint` the surviving definition has.
  If mid ships their own, ours simply do not register — no conflict, no
  duplicate warning. Their `crewe` / `sandbach` edges appear automatically
  when those maps exist.
- **region-nw / region-west**: the same for `lymm` (R20's north end) and
  `route_delamere_winsford` (Winsford's west edge).
- **content-activities**: `MQ.Fishing.start({map})`, `MQ.Brewing.start({press})`
  and `MQ.Minigames.start(id, opts)` are called by the lido angler, the
  Anderton dock, the pond riddle, the elm press, the cellar, Beth's
  `lift_puzzle`, Carys's `wheel_timing` and the Great Budworth
  `bell_ringing`. All degrade to prose today.
- **content**: `MQ.Trainer.respecAgents()` (Wipe refunds the agent perk
  nodes; falls back to 3 perk points), `MQ.Trainer.addBadge(id)`,
  `MQ.Cats.upgrade('bigboy','shield')`.
- **battle**: `boss_terrataur` is passed `phases: 2` when the player
  returned the SALTLING pup — the engine currently reads the trainer's own
  phase list, so the mercy discount is cosmetic until that opt is honoured.
- **shops**: maps declare `shop_nantwich`, `shop_nantwich_market`,
  `shop_middlewich`, `shop_winsford`, `shop_northwich`,
  `shop_great_budworth`, `shop_aberaeron`. No shop registry exists yet.
- **audio**: `route_wales` and `town_berllan` exist; nothing else missing.

## NEW IDS

Maps: `route_nantwich_hackgreen`, `hack_green_guardhouse`,
`nantwich_gym_deep_end`, `nantwich_acton_church`, `y_berllan_cellar`,
`aberaeron_care`, `aberaeron_shop`, `aberaeron_house_1..2`,
`great_budworth_inn`, `great_budworth_house_1..2`,
`middlewich_house_1..2`, `winsford_house_1..2`, `northwich_house_1..3`,
`nantwich_house_1..4`.
Encounter tables: `route_nantwich_hackgreen_grass(_fog)`,
`hack_green_grass`, `hack_green_b2_cave`, `nantwich_grass(_night)`,
`nantwich_water`, `fish_nantwich`, `nantwich_acton_field_grass(_night)`,
`middlewich_water`, `fish_middlewich`, `winsford_water`,
`northwich_water`, `fish_northwich`, `salt_mine_cage_cave`,
`salt_mine_deepstore_cold_cave`, `salt_mine_back_stair_cave`,
`salt_mine_sinkhole_cave`, `salt_mine_marston_b2_cave`,
`salt_mine_marston_b3_cave`, `route_*_grass/water` for the eight routes,
`anderton_grass`, `fish_anderton`, `great_budworth_grass`,
`y_berllan_grass_night`, `y_berllan_pond_water`,
`y_berllan_aberaeron_lane_grass`, `aberaeron_water`, `fish_aberaeron`,
`fish_route_winsford_northwich`.
Trainers: `vex_3` (the Ch.7 Northwich rooftop fight — if region-mid needs
`vex_3` for Crewe, renumber ours), `boss_understudy_middlewich`, plus the
`tr_*` route/town set.
Items: `viewpoint_aberaeron`.
Flags (beyond DESIGN-INDEX §6): `gym5_lanes`, `gym5_gates`,
`bunker_switchboard` (0–4), `agents_helpful`, `agents_fed`,
`agents_kept_talking`, `oracle_fed_map`, `oracle_pays_in_compute`,
`oracle_is_pippin`, `thirteen_minutes`, `terrataur_one_less_phase`,
`brithyll_named`, `coed_guardian`, `marbury_lady_seen`,
`lido_free_healing`, `anderton_ferry`, `bigboy_sat_*` (10 rest points).

## Known gaps

- Case 30 (The Elm Press) spans three regions: its `case_30_plate`,
  `case_30_beam` and `case_30_thread` flags are set by NPCs at Crewe,
  Delamere and Northwich. Only the Northwich end is ours; Dai and Mam-gu
  hold the quest open and the other two hooks are one line each for
  region-mid and region-west.
- `case_18` frees the sheep via a `case_18_sheep_freed` counter that the
  pen NPCs bump; the six individual catch-attempt encounters are a
  content-activities feature (guaranteed-catch wilds) that does not exist yet.
- Post-game depth three (`salt_mine_marston_b3`) is gated on
  `postgame_open`, which nothing in this region sets.
- The Anderton lift mini-game, the lock-working timing game and the
  bell-ringing rhythm game all fall through to prose until
  `MQ.Minigames` lands.
