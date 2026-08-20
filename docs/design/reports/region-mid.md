# Workstream report — region-mid

The middle of the county: Knutsford to Crewe, Chapters 3, 4 and 5, Gyms 2, 3
and 4, and the Jodrell Bank dish — built once here, used twice (the Ch.4 gate
and the Ch.11 climax).

## What shipped

**83 maps / ~55,500 tiles** under `js/world/maps/mid*.js`, authored in the
ENGINE §5.2 format via `MQ.MidBuild` (a parse-time painter on top of
region-east's `MQ.EastBuild`; that file is not edited).

| File | Contents |
|---|---|
| `mid__build.js` | `MQ.MidBuild`: the shared MID legends (`town`, `moor`, `interior`), `room`, `avenue`, `lake`, `viaduct`, `sidings`, `dish`, `moat`, and `linkBack` (the east↔mid seam patcher) |
| `mid_knutsford.js` | Knutsford (King Street/Princess Street on two levels, the Heath, the Tatton gates) + **Gym 2** (Gaskell's moving stacks, three lecterns, `gym2_open` back door) and 13 interiors incl. the Gaskell tower, the Penny Farthing Museum, the Assembly Rooms (quiz), the bookshop |
| `mid_tatton.js` | Tatton Park (lime avenue, the mere, the Old Hall, the Japanese Garden, the census marquee) and Rostherne Mere + St Mary's |
| `mid_holmes.js` | Holmes Chapel round its level crossing, St Luke's, the station, and the signal box (Q11) |
| `mid_jodrell.js` | Jodrell Bank grounds (the Lovell dish, Mark II, the arboretum, the gate) + visitor centre, **control room, tower gantries and the bowl** — the Ch.11 dungeon, gated on `jodrell_open` |
| `mid_congleton.js` | Congleton (bear statues, market square, the Dane) + **Gym 3** (the bear pit, 2-v-1 arch) and 8 interiors |
| `mid_moreton.js` | Bosley Cloud (switchbacks, the Bridestones, `climb` summit), Little Moreton Hall + the long gallery, Mow Cop + the folly |
| `mid_sandbach.js` | Sandbach (the two Saxon crosses = the Ch.5 revive shrine, the bounty board, the Wheelock cut) + Old Hall, post office (Nino #2), church |
| `mid_crewe.js` | Crewe (12-platform station, Queen's Park, Nantwich Road) + **Gym 4** (the roundhouse turntable), the Works sheds dungeon, the Heritage Centre (APT), the Railcard office |
| `mid_routes.js` | R8 Chelford Heath, the Rostherne lane, R9 Ollerton/Goostrey, R10 Twemlow meadows, R11 Brereton Heath, R12 Biddulph Valley Way, the Mow Cop lane, R13 the Wheelock flight, R14 the Elworth cut |
| `mid_zlinks.js` | The east↔mid seam: return warps added to `alderley_edge` and `teggs_nose` at registration time (see below) |

254 NPCs, 124 signs, 136 pickups, 69 trainer placements, 14 cat gaps and 11
BIGBOY rest points (including `bigboy_sat_tatton`).

**Data** — `js/data/encounters_mid.js` (64 tables: grass/water/cave with
night/rain/fog variants and `fish_<mapid>`, banded to the Ch.3–5 levels and
Ch.11 for the tower), `js/data/trainers_mid.js` (79 trainers incl. `vex_2`,
`vex_3`, `leader_gaskell` / `leader_otis` / `leader_di` with house rules and
three boss phases each, `twelve_k` and `boss_apt`), `js/data/quests_mid.js`
(`main_03/04/05` and the nine Casebook cases set here: 6, 8, 9, 10, 11, 12, 13,
15, 16).

**Story** — `js/story/npcs_mid.js` (119 `mid_*` scripts) and
`js/story/chapters/ch03_picnic_blankets.js`, `ch04_the_dish_goes_dark.js`,
`ch05_puppets_on_the_line.js`, registered through `MQ.Story.defineChapter`.

## The east↔mid seam

region-east shipped no exits westward, so `mid_zlinks.js` adds the return
halves to their maps *at registration time* — `MQ.MidBuild.linkBack(mapId,
warps, signs)` appends to `map.warps` / `map.signs` and clears `__rt`. It is
guarded (`World.has`), never removes or rewrites an existing warp, and does not
touch `js/world/maps/east_*.js`:

- `alderley_edge` (1–3, 36–38) → `route_alderley_knutsford` → Knutsford
- `teggs_nose` (40–42, 32) → `bosley_cloud` → Congleton

`tools/test/test-region-mid.js` asserts both directions and that east's own
Shutlingsloe and Sandhills exits still work.

## Chapter flags set (DESIGN-INDEX §6)

- **Ch.3** `deer_census_done`, `rostherne_relay_seen`, `tbilisi_domain_found`,
  `gaskell_network`, `vex_battle_2`, `badge_cipher`, `agent_arbiter`,
  `bigboy_sat_tatton`
- **Ch.4** `jodrell_turned_away`, `signal_meter`, `cutover_started` +
  `cutover_days` (via `MQ.Story.applyCutover(4)` → 38), `amos_first_glimpse`,
  `badge_bear` (+ `unlock('shove')`)
- **Ch.5** `crewe_fog_cleared`, `apt_boss_beaten`, `sandbach_crosses_lit`,
  `sandbach_shrine`, `twelvek_lanyard_seen`, `salon_seen`,
  `welsh_word_learned`, `rail_fast_travel`, `cambrian_ticket`,
  `nino_letter_2`, `badge_kernel`

CUTOVER is set both by `advanceChapter(4|5)` and defensively inside the Ch.4
gate scene, so entering the chapter by any route ticks the counter.

## Public API / how to use it

- `MQ.MidBuild` — same shape as `MQ.EastBuild` plus the helpers above; other
  regions are welcome to it. `MidBuild.linkBack(id, warps, signs)` is the
  polite way to attach to a finished neighbour.
- Every mid map carries `owner: "mid"` so tools can select the region.
- Gym antechamber → `<town>_gym_floor` behind a `cond` warp: `gym2_open`,
  `gym3_open`, `gym4_open`.
- The Jodrell dungeon is `jodrell_bank` → `jodrell_bank_control_room`
  (`cond: "jodrell_open"`) → `jodrell_bank_tower` → `jodrell_bank_dish`.
  region-nw writes the Ch.11 script; the maps, the encounter table
  (`jodrell_bank_tower_cave`, Lv 44–50) and the bowl arena are here.
- Side systems are called if present and narrated if not:
  `MQ.Minigames.start` (`sand_pattern`, `penny_rally`, `knutsford_quiz`,
  `bear_wrestle`, `rune_rubbing`, `timetable_puzzle`, `shunting`),
  `MQ.Bounties.start({board:'sandbach'})`, `MQ.Shrine.start({id:'sandbach_shrine'})`,
  `MQ.Rail.open({from:'crewe_station'})`, `MQ.Inventory.addMarks`.

## Tests

`tools/test/test-region-mid.js` (14) — world + data validate clean; every
canonical map exists and is sized; region/music/dialogue wired; spawn/heal/NPC/
sign/item/path placement; **every warp, sign, pickup, cat gap, NPC and trigger
is reachable on foot from the map's spawn point**; warps land walkable,
round-trip, and never land on the return warp; the east seam; town interiors;
encounter bands per chapter; the three leaders' house rules and boss phases;
quest defs and flag-expression parsing; the Jodrell climb.

`tools/test/test-region-mid-story.js` (14) — every map-named script is a
registered `mid_*` generator; the chapter table and CUTOVER days; **the Ch.3
opening runs to completion under `MQ.Dialog.auto`** (and is idempotent); the
Tatton census set-piece through its battles to `agent_arbiter`; the Rostherne
bell; VEX at Tatton; Gym 2's lecterns in shelf order (and refusing out of
order); Gaskell's badge/anchor/card/network; ROOT's gate → SIGNAL METER →
CUTOVER 38; Otis's arch, badge and BIGBOY Shove; the crosses, the shrine and
Nino #2; the yard chase, the APT, TWELVE-K, Di and the Railcard; the Welsh
word; the completion hooks; and all six scripted Casebook cases end to end.

`node tools/validate.js` → OK (186 maps). `node tools/test/run.js` → **429
passed, 0 failed**.

## NEEDS

- **`tools/gen-index.js`**: added `data/encounters_mid`, `data/trainers_mid`,
  `data/quests_mid` and `story/npcs_mid` to the contract ORDER (four ids, same
  one-line change region-east needed). `index.html` / `sw.js` regenerated.
- **Shops**: maps declare `shop_knutsford`, `shop_knutsford_bookshop`,
  `shop_holmes_chapel`, `shop_holmes_bakery`, `shop_congleton`,
  `shop_congleton_bakery`, `shop_sandbach`, `shop_sandbach_post`,
  `shop_crewe`, `shop_crewe_railcard`, `shop_jodrell`. No shop registry exists
  yet; nothing breaks.
- **Sprites** not in `MQ.PeopleArt`: `npc_publican`, `npc_station`,
  `npc_tourist` (same three region-east flagged).
- **Side systems**: `MQ.Minigames`, `MQ.Bounties`, `MQ.Shrine`, `MQ.Rail` are
  all called defensively; until they exist the scripts narrate the outcome and
  award the reward, so no case is blocked.
- **Battle**: `case_08` wants a "no Agents" rule; passed as
  `rules:{agents:false, noAgents:true}` and currently ignored by the engine.
- **region-salt** will want `route_sandbach_middlewich` (Sandbach's north lane
  is signposted but has no warp) and **region-southwest** `route_crewe_nantwich`
  — both can attach with `MQ.MidBuild.linkBack`.

## NEW IDS

- Maps: `knutsford_gym_floor`, `congleton_gym_floor`, `crewe_gym_floor`
  (leader rooms behind each gym's puzzle, matching east's `wilmslow_gym_floor`);
  `knutsford_house_1..4`, `holmes_chapel_church|mart|inn|house_1..2`,
  `congleton_bakery|house_1`, `sandbach_church|house_1..2`, `crewe_house_1..2`.
- Encounter tables beyond ROSTER §9's list (same naming convention):
  `knutsford_grass(_night)`, `route_alderley_knutsford_grass_rain|_water`,
  `fish_route_alderley_knutsford`, `tatton_park_grass_night`,
  `route_tatton_rostherne_grass`, `rostherne_mere_grass`,
  `rostherne_mere_water_night`, `fish_rostherne_mere`, `holmes_chapel_grass`,
  `route_knutsford_holmes_grass_night|_rain`, `route_holmes_jodrell_water|_grass_night`,
  `fish_route_holmes_jodrell`, `jodrell_bank_grass_fog`,
  `route_holmes_congleton_grass_night|_water`, `fish_route_holmes_congleton`,
  `congleton_grass_night`, `bosley_cloud_grass_fog|_night`,
  `route_congleton_moreton_grass_night`, `little_moreton_hall_grass|_water`,
  `route_moreton_mowcop_grass`, `mow_cop_grass_night`,
  `route_congleton_sandbach_grass_night`, `fish_route_congleton_sandbach`,
  `sandbach_grass_night|_fog`, `route_sandbach_crewe_water`, `crewe_grass`,
  `crewe_queens_park_water`, `fish_crewe_queens_park`, `crewe_works_cave_night`,
  `crewe_station_grass_fog`.
- Trainer `twelve_k` (uses the DESIGN-INDEX §7 character id rather than
  inventing `boss_twelve_k`).
- Flags: `gym2_key_1..3` / `gym2_open` / `gym3_open` / `gym4_open`;
  per-case sub-flags (`case_06_photos`, `case_08_quiz_passed`,
  `case_10_posters`, `case_11_poltergrid`, `case_12_drop_found`, …); a set of
  `clue_*` casebook breadcrumbs (`clue_alder_sold`, `clue_dish_elevation`,
  `clue_interlace_key`, `clue_thirteenth_minute`, `clue_orchard_holdings`, …);
  `bigboy_sat_knutsford|_tatton|_holmes|_congleton|_bosley|_mowcop|_sandbach|_crewe|_jodrell|_twemlow|_rodeheath`.

## Known gaps

- The Ch.11 script for the dish is region-nw's; our maps expose the rooms, the
  arena and the encounter table, and the interior stays locked behind
  `jodrell_open`.
- Q12's "sell it" branch and Q16's ladder both hand off to systems this
  workstream does not own (Nantwich's Nell, the rematch engine); the flags
  (`case_12_handed_in` / `case_12_sold`, `rematch_leader_di`) are set for them.
- The May Day sanding, the quiz, the rally, the arm-wrestle, the timetable and
  the shunting are written as `MQ.Minigames` calls with a narrated fallback —
  they read well but they are not playable until that system lands.
