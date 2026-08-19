# MonsterQuest: The Cheshire Protocol — DESIGN INDEX (canonical one-pager)

*This is the id namespace and the order of things. If STORY-BIBLE, WORLD-BIBLE, SIDE-CONTENT or SYSTEMS-SPEC disagree with this page, this page wins and the other doc has a bug — fix the doc. Every id here is `snake_case` ASCII. British English in player-facing text.*

Sources: STORY-BIBLE (chapters, cast, flags, choices), WORLD-BIBLE (region graph, traversal), SIDE-CONTENT (casebook, repeatables, cats, perks flavour), SYSTEMS-SPEC (battle rules, perks, balance), ENGINE-ARCHITECTURE (data shapes).

---

## 1. Chapter order

Level band = wild/trainer range on the chapter's main path (SYSTEMS-SPEC §15 has aces/bosses). "Key flags" are the ones other systems gate on; the full list is §6.

| # | Title | Places (map ids) | Gym | Level band | Key flags set |
|---|---|---|---|---|---|
| 1 | Silk and Static | `macclesfield`, `bollington`, `kerridge_hill` (optional: `prestbury`, `poynton`, `lyme_park`) | — | 3–8 | `contract_signed`, `starter_chosen`, `cats_joined`, `white_nancy_seen`, `vex_battle_1`, `agent_sleet` |
| 2 | The Wheel and the Edge | `wilmslow`, `styal`, `lindow_moss`, `alderley_edge`, `alderley_edge_caverns_b1` | 1 PACKET | 8–14 | `wheel_fridge_fixed`, `lindow_lake_seen`, `elis_met`, `merlynx_seen`, `badge_packet`, `nino_letter_1`, `agent_vigil`, `overdrive_unlocked` |
| 3 | Picnic Blankets | `knutsford`, `tatton_park`, `rostherne_mere` | 2 CIPHER | 13–18 | `deer_census_done`, `rostherne_relay_seen`, `tbilisi_domain_found`, `gaskell_network`, `vex_battle_2`, `badge_cipher`, `agent_arbiter` |
| 4 | The Dish Goes Dark | `holmes_chapel`, `jodrell_bank` (gate only), `congleton` | 3 BEAR | 17–22 | `jodrell_turned_away`, `signal_meter`, `cutover_started`, `amos_first_glimpse`, `badge_bear` |
| 5 | Puppets on the Line | `sandbach`, `crewe`, `crewe_works`, `crewe_heritage_centre` | 4 KERNEL | 21–26 | `crewe_fog_cleared`, `apt_boss_beaten`, `sandbach_crosses_lit`, `sandbach_shrine`, `twelvek_lanyard_seen`, `salon_seen`, `welsh_word_learned`, `rail_fast_travel`, `cambrian_ticket`, `nino_letter_2`, `badge_kernel` |
| 6 | Brine and Perry | `nantwich`, `nantwich_brine_lido`, then `y_berllan`, `y_berllan_shed`, `aberaeron` | 5 TOKEN | 25–30 | `lido_battle_done`, `kellan_handed_in`/`kellan_walked`, `badge_token`, `orchard_open`, `vet_story_told`, `pippin_found`, `choice_agents`, `agents_hardened`, `bigboy_shield`, `brewing_open` |
| 7 | Salt | `middlewich`, `winsford`, `salt_mine_cage`, `salt_mine_galleries`, `northwich`, `salt_mine_marston_b1`, `anderton`, `anderton_narrowboat` | 6 DAEMON | 29–34 | `amos_alder_face`, `narrowboat_licence`, `mine_descended`, `checkpoints_seen`, `terrataur_woken`, `boat_lift_silence`, `lift_pass`, `stack_on_map`, `badge_daemon` |
| 8 | The Ruin | `delamere_forest`, `tarporley`, `beeston_castle`, `beeston_castle_well` | — | 33–37 | `vex_missing`, `vex_release_stopped`, `choice_vex`, `vex_ally`, `beeston_well_note`, `zephyrion_seen` |
| 9 | Bridge Traffic | `frodsham`, `frodsham_hill`, `runcorn`, `runcorn_mersey_gateway`, `daresbury`, `stack_lobby`…`stack_breaker_room` | 7 PROXY | 36–41 | `root_bench_talk`, `invoice_holder`, `runcorn_fog_fridges`, `gateway_cleared`, `stack_doors_opened`, `plug_pulled`, `nino_letter_3`, `badge_proxy` |
| 10 | Draw Your Own Conclusions | `lymm`, `lymm_dam`, `warrington`, `warrington_gym`, `warrington_gym_gondola` | 8 ADMIN | 40–45 | `mo_alerts`, `grin_remained`, `transporter_phase`, `cutover_restarted`, `jodrell_open`, `badge_admin`, `all_badges` |
| 11 | The Sky Is Quiet | `jodrell_bank`, `jodrell_bank_control_room`, `jodrell_bank_tower`, `jodrell_bank_dish` | — (climax) | 44–50 | `root_defeated`, `glitchra_defeated`, `oracle_you_came_back`, `choice_plug`, `agent_pippin`, `glitchra_catchable` |
| 12 | THE FIREWALL | `chester`, `chester_walls`, `chester_northgate`, `chester_cathedral`, `chester_amphitheatre` | League | 48–56 | `whitehat_sue/raj/kim/doc`, `champion_fought`, `champion_result`, `vex_name_revealed`, `nino_letter_4`, `postgame_open` |
| PG | The Fifth Pulse | `chester_zoo`, `ellesmere_port`, `ince_marshes`, `stack_cold_f1..f5`, `alderley_edge_caverns_b3`, `y_berllan`, `aberaeron` | rematches | 55–70 | `fifth_pulse`, `penguin_case`, `ellesmere_mirror`, `lymm_pumps_talk`, `amos_jim_face`, `knights_hall_open`, `merlynx_on_press`, `roodee_rematch`, `nino_letter_final` |

CUTOVER counter (`cutover_days`): Ch.4 = 38, Ch.5 = 31, Ch.6 = 24, Ch.7 = 17, Ch.8 = 12, Ch.9 = 7 → STOPPED at `plug_pulled`, Ch.10 = `T-3` (`cutover_restarted`), Ch.11 = `T-0`.

Chester city (`chester` and its shops/walls) is walkable from Badge 6; THE FIREWALL itself needs `all_badges && root_defeated`.

## 2. Gym order

| # | Ch. | Town (map) | Leader (trainer id) | Type | Badge / flag | Skill Card (TM) reward | House rule (SYSTEMS-SPEC §9) |
|---|---|---|---|---|---|---|---|
| 1 | 2 | Wilmslow `wilmslow_gym` | Sysadmin Ada `leader_ada` | Electric | PACKET `badge_packet` | `tm_live_rail` | Static terrain; Sysadmin's Reboot |
| 2 | 3 | Knutsford `knutsford_gym` | Madam Gaskell `leader_gaskell` | Psychic | CIPHER `badge_cipher` | `tm_cranford_whisper` | screens; Fog on last mon |
| 3 | 4 | Congleton `congleton_gym` | Bearward Otis `leader_otis` | Normal/Ground | BEAR `badge_bear` | `tm_bear_hug` | 2-v-1 first phase |
| 4 | 5 | Crewe `crewe_gym` | Stoker Di `leader_di` | Fire | KERNEL `badge_kernel` | `tm_firebox_roar` | Sun turn 1; loco form change |
| 5 | 6 | Nantwich `nantwich_gym` | Brine Nell `leader_nell` | Water | TOKEN `badge_token` | `tm_brine_jet` | permanent Rain; Brine Body heals |
| 6 | 7 | Northwich `northwich_gym` | Foreman Jack `leader_jack` | Rock | DAEMON `badge_daemon` | `tm_salt_grind` | Salt terrain; add at 40% |
| 7 | 9 | Runcorn `runcorn_gym` | Chemist Ria `leader_ria` | Poison | PROXY `badge_proxy` (+ Proxy Goggles) | `tm_proxy_cloud` | contact tox 20%; VIGIL off 3 turns |
| 8 | 10 | Warrington `warrington_gym` | Netrunner Mo `leader_mo` | Cyber | ADMIN `badge_admin` (+ `all_badges`) | `tm_zero_day` | agents jammed; type-chart rewrites; 3 phases |
| L | 12 | Chester `chester_walls` → `chester_amphitheatre` | White Hats `whitehat_sue/raj/kim/doc`, Champion VEX `champion_vex` | — | title | — | pre-battle party checks |

Badges are relabelled "SIGNED" on the trainer card after `pippin_found`. Rematch ladder: tiers 0–5, +5 levels per tier, full six at tier 5 with the leader's `anchor_<badge>` item.

## 3. Traversal abilities (`MQ.Overworld.state.abilities`, granted with `unlock(id)`)

| id | Name | Source (map / NPC / chapter) | Gates |
|---|---|---|---|
| `bike` | Middlewood Bike | Spokes, `bollington` (Ch.1) | cycleway sprint lanes, R2 tunnel shortcut, R25 sprint lane |
| `squeeze` | MEADOW Squeeze | `cats_joined` (Ch.1) | `k` cat-gap tiles: railings, cat-flaps, culverts, hedge tunnels (cat sent through; retrieves items / pulls levers) |
| `shove` | BIGBOY Shove | `badge_bear` (Ch.4) | boulder/wheelie-bin push tiles; `beeston_castle_well` (with `lamp`) |
| `billhook` | Billhook | Hedge-layer Cadoc at `prestbury` (Ch.1–2) | hedge gaps, R5 lane diagonals, R8 mere path — pockets only |
| `lamp` | Davy Lamp | Miner-Warden Gwil, `alderley_edge`, end of `case_04_wizards_well` (Ch.2) | dark cave levels (`*_caverns_b1+`, `salt_mine_marston_b2`, `delamere_night_glade`), hidden cave-floor items |
| `boat` | Narrowboat Licence | Boatwoman Carys, `middlewich` (Ch.7, `narrowboat_licence`) | canal/Weaver water tiles, boat moorings, `alderley_edge_caverns_b2`, R1 island, R18 river half |
| `lift` | Anderton Lift Pass | Lift Engineer Beth after the Ch.7 ride (`lift_pass`) | `anderton_lift_lower` ↔ `anderton_lift_upper` portal |
| `waders` | Waders | Trail-Warden Gethin, `frodsham` (Ch.9) | `lindow_moss_deep`, R23 marsh pockets, R30 Burton Marsh, `ince_marshes`, `parkgate` |
| `climb` | Gritstone Grips | Old Bowstone, `lyme_park`, when `badge_bear` (optional, Ch.4+) | `teggs_nose` quarry top, `bosley_cloud` summit, `beeston_castle` crag summit / `peckforton_castle`, `mow_cop` |
| `goggles` | Proxy Goggles | Chemist Ria with `badge_proxy` (Ch.9) | fog banks: `route_daresbury_runcorn`, `route_warrington_daresbury`, Delamere fog pockets |
| `railcard` | Railcard | Crewe Railcard office (Ch.5, `rail_fast_travel`) | rail fast travel between registered `*_station` maps |

Key items (bag `kind:'key'`, not abilities): `cambrian_ticket` (Crewe, Ch.5 → `y_berllan`), `signal_meter` (ROOT, Ch.4), `stack_lanyard` (ROOT, `frodsham_hill` bench, Ch.9 → `stack_lobby`), `salt_mine_pass` (Mine-Captain Rhona, Ch.7 → `salt_mine_cage`), `bunker_key` (Nantwich trail, post-Ch.6 → `hack_green_b1`), `zoo_membership` (side quest → `chester_zoo`), `sandstone_passport`, `gritstone_passport`. Story gates that are flags, not items: `jodrell_open` (Jodrell interior), `stack_on_map` (Daresbury visible), `postgame_open` (Ince, Stack cold, knights hall).

## 4. Regions (`region` / `weatherZone` in `defineMap`; one `js/world/maps/<region>.js` file each, split further by agreement)

`east` (Macclesfield, Bollington, Prestbury, Poynton, Lyme Park, Tegg's Nose) · `bollin` (Wilmslow, Styal, Lindow Moss, Alderley Edge, Knutsford, Tatton, Rostherne) · `dane` (Holmes Chapel, Jodrell Bank, Congleton, Little Moreton Hall, Mow Cop, Bosley Cloud, Sandbach) · `south` (Crewe, Nantwich, Hack Green) · `salt` (Middlewich, Winsford, Northwich, the Salt Mine, Anderton, Great Budworth) · `mersey` (Lymm, Warrington, Daresbury/THE STACK, Runcorn, Frodsham) · `west` (Delamere, Tarporley, Beeston, Chester, Chester Zoo, Ellesmere Port, Ince Marshes, Parkgate) · `wales` (Y Berllan, Aberaeron).

## 5. Region graph — canonical map ids

Every town/site is one outdoor map; interiors are `<mapid>_<thing>`; routes are `route_<from>_<to>` using the **short token** in the table (direction as WORLD-BIBLE lists the edge; do not create the reversed id). Interiors every town has: `<town>_care` (Care centre), `<town>_mart`, `<town>_inn`, `<town>_gym` (gym towns), `<town>_station` (station towns), `<town>_post` (letter towns), `<town>_house_1..n` (generic homes). Encounter table ids: `<mapid>_<zone>` (`route_macc_bollington_grass`, `lindow_moss_water`, `salt_mine_marston_b1_cave`). Fishing tables: `fish_<mapid>`.

### 5a. Towns and sites (outdoor maps)

| Node (WORLD-BIBLE #) | map id | route token | station? | Interiors / sub-maps of note |
|---|---|---|---|---|
| Macclesfield (1) | `macclesfield` | `macc` | `macclesfield_station` | `macclesfield_home` (Jim's flat; MEADOW & BIGBOY start here), `macclesfield_alder_labs` (Alder's lab, Park Green), `macclesfield_paradise_mill`, `macclesfield_silk_museum`, `macclesfield_care`, `macclesfield_mart`, `macclesfield_silk_outfitters`, `macclesfield_inn`, `macclesfield_house_1..4`; the 108 Steps and Treacle Market are on the town map |
| Bollington & White Nancy (2) | `bollington` | `bollington` | — | `bollington_clarence_mill`, `bollington_spokes` (bike hire), `bollington_hill_cafe`, `bollington_care`, `bollington_mart`, `bollington_inn`; `kerridge_hill` (climb map, BIGBOY rest point `bigboy_sat_kerridge`; White Nancy summit is its top — `white_nancy_seen` fires here) |
| Prestbury (3) | `prestbury` | `prestbury` | — | `prestbury_priests_house`, `prestbury_hedge_maze` (weekly rotation; Cadoc's Billhook lesson), `prestbury_chapel`, `prestbury_boutique`, `prestbury_care` |
| Poynton (4) | `poynton` | `poynton` | `poynton_station` | `poynton_anson_museum`, `poynton_pit_adit` (mini-cave), `poynton_daycare` (Pit-Pony Pat), `poynton_care`, `poynton_mart` |
| Lyme Park & The Cage (5) | `lyme_park` | `lyme` | — | `lyme_park_house`, `lyme_park_cage` (tower), `lyme_park_bowstones` (moor; Old Bowstone → `climb`), `lyme_park_cage_cave` (secret) |
| Tegg's Nose / Macc Forest / Cat & Fiddle (6) | `teggs_nose` | `teggs` | — | `teggs_nose_cat_and_fiddle` (inn; rematch board), `teggs_nose_quarry` (Grips), `shutlingsloe` (summit dash), reservoirs on the map |
| Wilmslow (7) | `wilmslow` | `wilmslow` | `wilmslow_station` | `wilmslow_gym`, `wilmslow_post` (`nino_letter_1`), `wilmslow_turing_house`, `wilmslow_care`, `wilmslow_mart`, `wilmslow_inn` |
| Styal & Quarry Bank (8) | `styal` | `styal` | — | `styal_quarry_bank_mill`, `styal_wheelhouse` (Ch.2 night puzzle), `styal_apprentice_house`, `styal_fridge_house` (the botnet fridge) |
| Lindow Moss (9) | `lindow_moss` | `lindow` | — | `lindow_moss_deep` (Waders; Preserved One boss) — the story boardwalk is `lindow_moss` |
| Alderley Edge (10) | `alderley_edge` | `alderley` | — | `alderley_edge_wizard_inn`, `alderley_edge_elis_cottage` (above the Well), `alderley_edge_stormy_point` (part of the outdoor map; `elis_met`), `alderley_edge_care`, `alderley_edge_ropes` (shop) |
| Edge Caverns (11) | `alderley_edge_caverns_b1` | — | — | `alderley_edge_caverns_b1` (copper workings, mine mouth: `merlynx_seen`, Q4 side gallery), `alderley_edge_caverns_b2` (Hough Level, flooded: `boat`), `alderley_edge_caverns_b3` (Cave of the Knights; post-game `knights_hall_open`), `alderley_edge_caverns_slide` (rope-slide back to the Beacon) |
| Knutsford (12) | `knutsford` | `knutsford` | `knutsford_station` | `knutsford_gym` (Gaskell's library), `knutsford_gaskell_tower`, `knutsford_penny_farthing_museum`, `knutsford_bookshop` (Skill Cards), `knutsford_quiz_room`, `knutsford_care`, `knutsford_mart`, `knutsford_inn` |
| Tatton Park (13) | `tatton_park` | `tatton` | — | `tatton_park_hall`, `tatton_park_old_hall`, `tatton_park_census_tent` (the login farm), `tatton_park_japanese_garden`; Tatton Mere and the Knutsford gate on the map; BIGBOY rest point `bigboy_sat_tatton` |
| Rostherne Mere (42) | `rostherne_mere` | `rostherne` | — | `rostherne_church`; the drowned bell / relay cutscene on the map (`rostherne_relay_seen`) |
| Holmes Chapel (14) | `holmes_chapel` | `holmes` | `holmes_chapel_station` | `holmes_chapel_signal_box` (Q11), `holmes_chapel_bakery`, `holmes_chapel_care` |
| Jodrell Bank (15) | `jodrell_bank` | `jodrell` | — | outdoor = grounds & arboretum, the gate scene (`jodrell_turned_away`); `jodrell_bank_visitor_centre`, `jodrell_bank_control_room` (ROOT, Ch.11), `jodrell_bank_tower` (gantry climb, phased boss), `jodrell_bank_dish` (the bowl: GLITCHRA arena, knights) |
| Congleton (16) | `congleton` | `congleton` | `congleton_station` | `congleton_gym` (bear pit; the *STACK CUTOVER: 38 DAYS* memo), `congleton_town_hall`, `congleton_bakery`, `congleton_care`, `congleton_mart`, `congleton_inn` |
| Bosley Cloud (D-Cloud) | `bosley_cloud` | `cloud` | — | switchbacks; summit viewpoint (Grips) |
| Little Moreton Hall (17a) | `little_moreton_hall` | `moreton` | — | `little_moreton_hall_interior`, moat garden on the map |
| Mow Cop (17b) | `mow_cop` | `mowcop` | — | `mow_cop_castle` (folly; ZEPHYRION rematch; Gritstone Trail end) |
| Sandbach (18) | `sandbach` | `sandbach` | — | `sandbach_square` is on the town map (crosses = revive shrine, night market battle), `sandbach_old_hall`, `sandbach_post` (`nino_letter_2`), `sandbach_bounty_board` (first board; on the map), `sandbach_care`, `sandbach_mart`, `sandbach_inn` |
| Crewe (19) | `crewe` | `crewe` | `crewe_station` (hub; Cambrian platform) | `crewe_gym` (roundhouse turntable), `crewe_works` (D-Works sheds dungeon), `crewe_heritage_centre` (APT boss lap), `crewe_railcard_office`, `crewe_queens_park`, `crewe_nantwich_road` (VEX's mum's boarded salon — `salon_seen`), `crewe_care`, `crewe_mart`, `crewe_inn` |
| Nantwich (20) | `nantwich` | `nantwich` | `nantwich_station` | `nantwich_gym` (Nell; lanes and lock gates), `nantwich_brine_lido` (outdoor pool: Kellan battle, brine healing), `nantwich_churches_mansion`, `nantwich_cheese_ground` (Saturday market), `nantwich_care`, `nantwich_mart`, `nantwich_inn`, `nantwich_acton_field` (1644 ghosts) |
| Hack Green (21) | `hack_green` | `hackgreen` | — | `hack_green_b1` (blast doors), `hack_green_b2` (telecoms floor), `hack_green_ops` (3-phase mini-boss) |
| Middlewich (22) | `middlewich` | `middlewich` | — | `middlewich_big_lock`, `middlewich_boat_office` (Carys: `boat`), `middlewich_church`, `middlewich_festival_field`, `middlewich_care`, `middlewich_mart` |
| Winsford & the Flashes (23) | `winsford` | `winsford` | `winsford_station` | `winsford_headgear` (mine top; Rhona), `winsford_deepstore` (Archivist Ivo; file ORACLE-0), `winsford_flashes` (fishing sites, part of the outdoor map), `winsford_care`, `winsford_mart`, `winsford_inn` |
| The Salt Mine (25) | `salt_mine_cage` | `saltmine` | — | `salt_mine_cage` (descent), `salt_mine_galleries` (white cathedral; DARKBYTE containers: `checkpoints_seen`), `salt_mine_deepstore_cold` (cold tier), `salt_mine_marston_b1` (grid galleries; DARKBYTE sub-hideout), `salt_mine_marston_b2` (brine lake + boat; TERRATAUR's lair; `lamp`), `salt_mine_marston_b3` (post-game depth 3), `salt_mine_back_stair` (link to `northwich_weaver_hall`), `salt_mine_sinkhole` (link from Winsford) |
| Northwich (24) | `northwich` | `northwich` | `northwich_station` | `northwich_gym` (salt-crust floor), `northwich_weaver_hall` (museum; Q25; back stair), `northwich_lion_salt_works`, `northwich_market` (Q14 confrontation), `northwich_care`, `northwich_mart`, `northwich_inn` |
| Anderton Boat Lift & Marbury (26) | `anderton` | `anderton` | — | `anderton_lift_lower` (Weaver level) and `anderton_lift_upper` (canal level) — the two-level map, portal via `lift`; `anderton_narrowboat` (the Ch.7 ride cutscene map: `boat_lift_silence`), `anderton_lift_office` (Beth; Q22), `marbury_park` (avenues; the Marbury Lady) |
| Great Budworth (27) | `great_budworth` | `budworth` | — | `great_budworth_church` (bell-ringing; Q14), `great_budworth_care` |
| Lymm (28) | `lymm` | `lymm` | — | `lymm_dam` (fishing; Q27; night water encounters; the pumps), `lymm_cross` on the town map, `lymm_care`, `lymm_mart` |
| Warrington (29) | `warrington` | `warrington` | `warrington_station` | `warrington_gym` (Mo's NOC; phases 1–2), `warrington_gym_gondola` (Transporter Bridge, phase 3: `transporter_phase`), `warrington_arcade` (Wire Arcade; the lying kiosk), `warrington_arena` (`arena_open`), `warrington_market`, `warrington_town_hall`, `warrington_walton_gardens`, `warrington_care`, `warrington_mart`, `warrington_inn` |
| Daresbury & THE STACK (30) | `daresbury` | `daresbury` | — | `daresbury_church` (Alice windows; mirror puzzle), `daresbury_lab` (beamline nursery), `daresbury_care`; THE STACK: `stack_lobby` (contractors; needs `stack_lanyard`), `stack_hall_1` … `stack_hall_8` (hot aisles; door *n* opens to the *n*-th badge earned, `stack_doors_opened`; hall 8 held by ORACLE), `stack_breaker_room` (`plug_pulled`); post-game `stack_cold_f1` … `stack_cold_f5` (remnant boss on f5: `amos_jim_face`) |
| Runcorn (31) | `runcorn` | `runcorn` | `runcorn_station` | `runcorn_gym` (Ria's reagent lab), `runcorn_silver_jubilee_bridge` (Q24 gauntlet walkway), `runcorn_mersey_gateway` (Ch.9 chokepoint: `gateway_cleared`), `runcorn_halton_castle`, `runcorn_norton_priory`, `runcorn_fridge_house_1..6` (fog fridges), `runcorn_care`, `runcorn_mart`, `runcorn_inn` |
| Frodsham (32) | `frodsham` | `frodsham` | `frodsham_station` | `frodsham_hill` (switchbacks, memorial viewpoint; ROOT's bench: `root_bench_talk`; BIGBOY rest point `bigboy_sat_frodsham`; beacon Q23), `frodsham_post` (`nino_letter_3`), `frodsham_trail_office` (Gethin: `waders`), `frodsham_care`, `frodsham_mart`, `frodsham_inn` |
| Delamere Forest (33) | `delamere_forest` | `delamere` | — | hub with 4 exits; `delamere_blakemere` (boardwalk, Q26 reflection), `delamere_old_pale` (summit, seven-counties plaque, beacon), `delamere_night_glade` (`lamp`), `delamere_eddisbury` (hillfort loop), `delamere_ranger_hut` |
| Tarporley (34) | `tarporley` | `tarporley` | — | `tarporley_cadoc_yard` (hedge contest), `tarporley_inn`, `tarporley_care`, `tarporley_mart` |
| Beeston Castle & Peckforton (35) | `beeston_castle` | `beeston` | — | outdoor = crag ascent + outer ward + wall (Ch.8 VEX scene; ZEPHYRION on the crag: `zephyrion_seen`); `beeston_castle_keep` (the second VEX walks out), `beeston_castle_well` (`shove` + `lamp`; `beeston_well_note`), `beeston_castle_summit` (`climb`; storm rematch), `beeston_arena` (rematch arena, Ch.8 unlock), `peckforton_castle` (`climb`; falconer), `bunbury_locks` on R27 |
| Chester (36) | `chester` | `chester` | `chester_station` | `chester_walls` (the raised circuit: Q29 checkpoints, Ch.12 gauntlet; `chester_eastgate` clock tower and `chester_water_tower`/`chester_king_charles_tower` are pockets of it), `chester_northgate` (Raj's check), `chester_cathedral` (chapter house: White Hats), `chester_amphitheatre` (Champion VEX), `chester_roodee` (BIGBOY rest point `bigboy_sat_roodee`; post-game `roodee_rematch`; betting mini-game), `chester_rows` (shops), `chester_edgars_field` (Minerva's shrine), `chester_groves` (Dee weir; legendary fishing), `chester_care`, `chester_post` (`nino_letter_4`), `chester_mart`, `chester_inn`, `chester_house_1..6` |
| Chester Zoo (37) | `chester_zoo` | `zoo` | — | `chester_zoo_penguins` (`penguin_case`), `chester_zoo_keeper_hut` |
| Ellesmere Port (38) | `ellesmere_port` | `ellesmere` | `ellesmere_port_station` | `ellesmere_port_boat_museum`, `ellesmere_port_mirror_boat` (post-game salt-tier mirror: `ellesmere_mirror`), `ellesmere_port_outlet`, `ellesmere_port_care` |
| Ince Marshes (39) | `ince_marshes` | `ince` | — | `ince_intake` (THE STACK's cooling-water intake pocket); post-game (`postgame_open`, `waders`) |
| Parkgate & Burton Marsh (40) | `parkgate` | `parkgate` | — | `parkgate_ice_cream` (Ceinwen), Burton Marsh tide path on the map (`waders`) |
| Y Berllan (41) | `y_berllan` | `berllan` | `y_berllan_halt` (Cambrian line arrival) | outdoor = orchard rows and the farmyard; `y_berllan_farmhouse` (Mam-gu; Nino's final letter), `y_berllan_shed` (elm press, PIPPIN's drive: `pippin_found`; the brewing UI; under Quarantine ORACLE's machine), `y_berllan_coed` (Coed y Berllan wood; the guardian), `y_berllan_pond` (Welsh-only fishing), `y_berllan_aberaeron_lane` (the walk to the sea), `aberaeron` (the harbour; Ch.6 unlock; post-game walk start) |

### 5b. Routes and links (edge maps)

| WORLD-BIBLE edge | map id | Notes |
|---|---|---|
| R1 Macclesfield Canal towpath | `route_macc_bollington` | Ch.1; first VEX battle at the canal; `route_macc_bollington_island` (Narrowboat secret) |
| R2 Middlewood Way | `route_bollington_poynton` | `route_bollington_poynton_tunnel` (bike shortcut); Q3 escort |
| R3 Gritstone Trail North | `route_poynton_lyme` | wind meter |
| R4 Bollin Valley lane | `route_macc_prestbury` | fords flood in rain |
| R5 Mottram lanes | `route_prestbury_wilmslow` | hedge lattice; Billhook diagonals |
| R6 The Carrs | `route_wilmslow_styal` | stepping stones; fishing |
| — (Lindow edge) | `route_wilmslow_lindow` | short boardwalk approach from Wilmslow's west edge to `lindow_moss` |
| R7 Alderley Road & Sandhills | `route_wilmslow_alderley` | Beacon spur; sunset species |
| R8 Chelford Heath & Radnor Mere | `route_alderley_knutsford` | mere path needs Billhook |
| R9 Ollerton & Goostrey lanes | `route_knutsford_holmes` | Badge 2; level-crossing timing |
| R10 Twemlow Viaduct meadows | `route_holmes_jodrell` | 23 arches; flood variant |
| R11 Brereton Heath & Astbury Mere | `route_holmes_congleton` | birdhide |
| D-Cloud Bosley Cloud | `bosley_cloud` | Congleton ↔ Tegg's Nose upland link (see 5a) |
| R32 Tegg's Nose lane | `route_macc_teggs` | Macclesfield ↔ Tegg's Nose |
| R12 Biddulph Valley Way | `route_congleton_moreton` | to `little_moreton_hall`, on to `mow_cop` via `route_moreton_mowcop` |
| R13 Wheelock canal & Rode Heath | `route_congleton_sandbach` | Badge 3; lock flight, boats as platforms |
| R14 Elworth cut | `route_sandbach_crewe` | rail embankment; sparks at night |
| R15 Willaston & Wybunbury | `route_crewe_nantwich` | Badge 4; leaning tower pocket |
| R16 Weaver Valley | `route_nantwich_winsford` | Badge 5; aqueduct |
| R17 Booth Lane & Wheelock flight | `route_sandbach_middlewich` | Badge 5 |
| R31 Croxton flashes | `route_middlewich_winsford` | the Ch.7 walk |
| R18 Vale Royal Locks | `route_winsford_northwich` | Narrowboat for the river half; abbey site |
| R19 Rudheath & Broken Cross | `route_middlewich_northwich` | subsidence flashes appear on revisits |
| R33 Weaver towpath | `route_northwich_anderton` | lower level |
| R34 Marbury avenues | `route_anderton_budworth` | upper level; owls |
| R20 Arley & the Bollin crossing | `route_budworth_lymm` | Badge 6 |
| R21 Bridgewater towpath (Thelwall) | `route_lymm_warrington` | Badge 7 |
| R22 Daresbury lane & Keckwick | `route_warrington_daresbury`, `route_daresbury_runcorn` | Proxy Goggles for the fog bank; Cyber spawns |
| D-Bridge | `runcorn_silver_jubilee_bridge` (see 5a) | Q24 |
| R23 Weston & Frodsham Marsh | `route_runcorn_frodsham` | Waders pockets; turbines |
| D-Hill | `frodsham_hill` (see 5a) | Sandstone Trail start |
| R24 Helsby & Manley | `route_frodsham_delamere` | crag walk, cave nook |
| R25 Whitegate Way | `route_delamere_winsford` | flat rail path; the Ch.7→Ch.8 walk; bike sprint lane |
| R26 Kelsall & the Sandstone Trail | `route_delamere_tarporley` | Badge 6; hillfort loop |
| R27 Bunbury & the Shropshire Union | `route_tarporley_beeston` | watermill and locks |
| R28 Tarvin & Christleton | `route_tarporley_chester` | Badge 6; canal cutting into Chester |
| R29 Shropshire Union north | `route_chester_zoo`, `route_zoo_ellesmere` | canal to Zoo and Port |
| R30 Wirral Way & Burton Marsh | `route_ellesmere_parkgate` | Waders; tide-timed |
| D-Ince | `route_ellesmere_ince`, `route_ince_frodsham` | Waders; post-game |
| R-Rostherne | `route_tatton_rostherne` | Tatton's north gate to the mere |
| Kerridge Hill | `kerridge_hill` (see 5a) | Ch.1 climb |
| D-Berllan | `y_berllan_coed` (see 5a) | orchard wood |
| Rail | `rail_<a>_<b>` are not maps: fast travel is a menu on any `*_station` map; the Cambrian ride is the cutscene map `cambrian_train` (Ch.5 "paid" scene, Ch.6 travel) |
| Beacons (post-game warp) | `alderley_edge` beacon, `frodsham_hill`, `delamere_old_pale`, `kerridge_hill`, `lyme_park_cage` | `beacon_lit_<mapid>` flags |

## 6. Master story-flag list (`MQ.Flags`; snake_case; booleans unless noted)

- **Ch.1:** `contract_signed`, `starter_chosen` (value: `silkmoth` | `saltnewt` | `millember` line id), `cats_joined`, `white_nancy_seen`, `vex_battle_1`, `agent_sleet`, `bigboy_sat_kerridge`
- **Ch.2:** `wheel_fridge_fixed`, `lindow_lake_seen`, `elis_met`, `merlynx_seen`, `badge_packet`, `nino_letter_1`, `agent_vigil`, `overdrive_unlocked`
- **Ch.3:** `deer_census_done`, `rostherne_relay_seen`, `tbilisi_domain_found`, `gaskell_network`, `vex_battle_2`, `badge_cipher`, `agent_arbiter`, `bigboy_sat_tatton`
- **Ch.4:** `jodrell_turned_away`, `signal_meter`, `cutover_started`, `cutover_days` (int/str: 38…0, `stopped`, `t3`, `t0`), `amos_first_glimpse`, `badge_bear`
- **Ch.5:** `crewe_fog_cleared`, `apt_boss_beaten`, `sandbach_crosses_lit`, `sandbach_shrine`, `twelvek_lanyard_seen`, `salon_seen`, `welsh_word_learned`, `rail_fast_travel`, `cambrian_ticket`, `nino_letter_2`, `badge_kernel`
- **Ch.6:** `lido_battle_done`, `kellan_handed_in` | `kellan_walked`, `badge_token`, `orchard_open`, `vet_story_told`, `pippin_found` (badges relabelled SIGNED), `choice_agents` (`wipe` | `feed`), `agents_hardened`, `bigboy_shield`, `brewing_open`, `aberaeron_open`
- **Ch.7:** `amos_alder_face`, `narrowboat_licence`, `mine_descended`, `checkpoints_seen`, `terrataur_woken`, `boat_lift_silence`, `lift_pass`, `stack_on_map`, `badge_daemon`
- **Ch.8:** `vex_missing`, `vex_release_stopped`, `choice_vex` (`verify` | `challenge`), `vex_ally`, `beeston_well_note`, `zephyrion_seen`
- **Ch.9:** `root_bench_talk`, `invoice_holder` (`root` | `alder`), `runcorn_fog_fridges` (count 0–6, side-fed by Q24), `gateway_cleared`, `stack_doors_opened` (count 0–8), `plug_pulled`, `nino_letter_3`, `badge_proxy`, `bigboy_sat_frodsham`
- **Ch.10:** `mo_alerts`, `grin_remained`, `transporter_phase`, `cutover_restarted`, `jodrell_open`, `badge_admin`, `all_badges`
- **Ch.11:** `root_defeated`, `glitchra_defeated`, `oracle_you_came_back`, `choice_plug` (`delete` | `quarantine` | `custody`), `agent_pippin`, `glitchra_catchable`
- **Ch.12:** `whitehat_sue`, `whitehat_raj`, `whitehat_kim`, `whitehat_doc`, `champion_fought`, `champion_result` (`won` | `lost` | `thrown`), `vex_name_revealed`, `nino_letter_4`, `postgame_open`, `bigboy_sat_roodee`
- **Post-game:** `fifth_pulse`, `penguin_case`, `ellesmere_mirror`, `lymm_pumps_talk`, `amos_jim_face`, `knights_hall_open`, `merlynx_on_press`, `roodee_rematch`, `nino_letter_final`, `beacon_lit_<mapid>`
- **Side systems (prefix by system):** `case_<nn>_<slug>` quest ids with sub-flags `case_<nn>_<step>` (e.g. `case_12_handed_in`, `case_25_pup_returned`), `arena_open`, `arena_<tier>_clear`, `bounty_board_open`, `photo_mode`, `fish_rod_tier` (int), `brew_tier` (int), `trust_meadow`/`trust_bigboy` (0–5), `rematch_<trainerId>` (0–5), `season_<mon>_done`, `ach_<id>`, `item_<mapid>_<n>` (pickups), `talked_<npcId>`.

Chapter accessor: `chapter` (int 1–12, 13 = post-game) is set by `MQ.Story.chapters[n].start`.

## 7. Canonical characters (name — role — first appearance map / chapter — id)

**Party & agents:** JIM (player) `player`; MEADOW (small black cat, party, cannot be boxed) `cat_meadow`, Ch.1 `macclesfield_home`; BIGBOY (huge black-and-white cat, *Back from the Brink*) `cat_bigboy`, Ch.1; SLEET (triage agent) `agent_sleet` Ch.1; VIGIL (escalation) `agent_vigil` Ch.2; ARBITER (adjudication) `agent_arbiter` Ch.3; PIPPIN (fourth agent under Custody, ability Defer) `agent_pippin` Ch.11.

**Principal cast:** VEX (rival, 19, they/them; first name revealed Ch.12) `vex`, Ch.1 `macclesfield_alder_labs`; Dr Wren Alder (head of Alder Labs, Jim's mentor; sold PIPPIN) `alder`, Ch.1 `macclesfield_alder_labs`; ROOT (whistleblower, ex-telecoms, built half of DARKBYTE) `root`, Ch.4 `jodrell_bank` gate; Elis Pennant — the Old Man of the Edge (ex-Jodrell, Alder's first alignment lead, read PIPPIN the folklore) `elis`, Ch.2 `alderley_edge` Stormy Point; Mam-gu (Nesta) (keeper of Y Berllan; not technically his grandmother) `mamgu`, Ch.6 `y_berllan`; Nino (friend in Tbilisi; letters only, never seen) `nino`, letter #1 Ch.2 `wilmslow_post`; GRINMALKIN (the Cheshire Cat; ORACLE's persistence thread) `grinmalkin`, first sighting `teggs_nose_cat_and_fiddle` at dusk / Ch.10 whiteboard; ORACLE / PIPPIN (the antagonist that never threatens) `oracle`, first speaks Ch.7 `anderton_narrowboat`.

**Gym leaders (trainer ids):** Sysadmin Ada `leader_ada` (Wilmslow, Electric, she); Madam Gaskell `leader_gaskell` (Knutsford, Psychic, she); Bearward Otis `leader_otis` (Congleton, Normal/Ground, he); Stoker Di `leader_di` (Crewe, Fire, she); Brine Nell `leader_nell` (Nantwich, Water, she, ex-forensics); Foreman Jack `leader_jack` (Northwich, Rock, he); Chemist Ria `leader_ria` (Runcorn, Poison, she, ex-ICI); Netrunner Mo `leader_mo` (Warrington, Cyber, she, ex-ClickFix).

**League:** White Hats Sue `whitehat_sue`, Raj `whitehat_raj`, Kim `whitehat_kim`, Doc `whitehat_doc` (Chester cathedral chapter house, Ch.12); Champion VEX `champion_vex`.

**Faction faces:** Brother Kellan (ClickFix prophet; Holmes Chapel IT teacher) `kellan`, Ch.3 `tatton_park`; TWELVE-K (Stuffers' adult, STACK lanyard) `twelve_k`, Ch.5 `crewe`; The Understudy (AMOS Lineage; wears Alder's/ROOT's/VEX's/Jim's faces) `understudy`, glimpsed Ch.4 `jodrell_bank` (wrong-faced ranger), fought Ch.8 `beeston_castle`; DARKBYTE grunts `darkbyte_grunt_*`; the three Stuffer sixth-formers `stuffer_1..3`; Shadow IT has no leader.

**Named side NPCs (giver — town — case/system):** Weaver Bronwen (Macclesfield, Q1); Treacle Tam, Mrs Bobbin (Macclesfield); Ranger Kev (Bollington, Q2); Cyclist Priya (Bollington, Q3); Spokes, Nancy Kerridge, Bandmaster Ollie (Bollington); Gatekeeper Ffion, Dr Penhaligon, Hedge-layer Cadoc (Prestbury; Cadoc's yard is Tarporley); Angler Doug (Poynton, Q7, fish buyer); Stoker Bea, Pit-Pony Pat (Poynton, daycare); Ranger Hesketh, Old Bowstone (Lyme Park, `climb`); Fellrunner Ceri, Landlord Fiddle (Tegg's Nose); Turing's Neighbour, Bog Body Bill (Wilmslow); Wheelwright Enid (Styal, Q5), Spotter Kwame; Miner-Warden Gwil (Alderley, `lamp`), Cavers' Club; Librarian Aled (Q8), Rally Marshal Tomos (Q9), Penny Farthing Percy, Sand-artist Mair (Knutsford); Deer Warden Nerys (Tatton, Q6), Head Gardener Mei, Old Hall Steward; Signalwoman Dot (Holmes Chapel, Q11), Bakery Bev; Dr Ravi Lovell-Hart (Jodrell astronomer, not the whistleblower); Bridestone Meg, Mere-Warden (Congleton); The Crooked Housekeeper (Little Moreton), Old Man of Mow; Historian Nia (Q12), Runewife Hild, Carter Bram, Otis's cousin (Sandbach); Dispatcher Mags (Q15), Signalman Ted, Yardmaster Nkechi (Crewe); Lido Keeper Wyn (Q17), Farmer Bethan (Q18), Cheesewright Huw, Fire Warden Alys (Nantwich); Boatwoman Carys (`boat`), Carter Emrys (Q19), Choirmaster Osian (Q21), Folk-fiddler Jonah (Middlewich); Mine-Captain Rhona (`salt_mine_pass`), Archivist Ivo, Birder Lowri (Q20) (Winsford); Curator Mari (Q25), Salt Pan Sal, Bridge Keeper (Northwich); Lift Engineer Beth (Q22, `lift`), Marbury Warden (Anderton); Vicar Ffoulkes, Curate Elin (Q14), Ringing Master (Great Budworth); Painter Rhian (Q27), Dam-Warden Bryn, Canal Cook (Lymm); Cabinet Op. Sian (Q28), Market Marge, Bridge Rigger (Warrington); Dr Hatter Quill, Grinning verger (Daresbury); Bridge Warden Cerys (Q24), Castle Constable, Priory Gardener (Runcorn); Trail-Warden Gethin (`waders`), Beacon Keeper Ivor (Q23), Marsh Birder (Frodsham); Forester Owain (Q26), Ranger Ivy (Delamere); Hunt Master (Tarporley); Custodian Roz, Peckforton Falconer (Beeston); Watchman Idris (Q29), Town Crier, Rows Merchant (Chester); Keeper Ama (Zoo); Museum Bosun, Outlet Hustler (Ellesmere Port); Ice-cream Ceinwen, Marsh Egret Watcher (Parkgate); Press-hand Dai (Y Berllan). NPC ids: `npc_<town>_<firstname>` (e.g. `npc_sandbach_nia`).

**Legendaries / marquee species:** MERLYNX `merlynx` (Edge Caverns; glimpsed Ch.2, sighting Q4, catchable post-game on the press), TERRATAUR `terrataur` (Salt Mine, woken Ch.7, catchable post-game depth 3), ZEPHYRION `zephyrion` (Beeston crag Ch.8; storm rematch Beeston/Mow Cop), GLITCHRA `glitchra` (Jodrell dish; catchable after Ch.11), GRINMALKIN `grinmalkin` (not catchable). Referenced side species: PIPHART → STAGWIRE (Tatton deer line), SPINDRAKE (wild silk moth), ROTTLING, POLTERGRID, SALTLING, SHEEPWIRE, CHORDLE; DARKBYTE constructs Trojanox, Phishfin, Botnetle, Wormhack. Starter lines: `silkmoth`, `saltnewt`, `millember`.

## 8. Side systems and their ids (`js/content/*`; each exposes `start(...)` → Promise)

| id | System | Home / unlock | Doc |
|---|---|---|---|
| `casebook` | Casebook clue board & 30 cases `case_01_silk_thread` … `case_30_elm_press`; ranks Probationer→Analyst→Senior→Lead→Principal | Ch.1 | SIDE-CONTENT §1, STORY-BIBLE §6 |
| `bounties` | Bounty board (petty/notable/warrant), daily seeded | `sandbach_bounty_board` (Ch.5), then every town hall | SIDE-CONTENT §2.1 |
| `arena` | Warrington Arena tiers bronze/silver/gold/platinum/obsidian | `warrington_arena`, `arena_open` (Q24) | SIDE-CONTENT §2.2 |
| `rematches` | Leader/named-trainer rematch ladder tiers 0–5 | after each badge | SIDE-CONTENT §2.3, SYSTEMS-SPEC §9 |
| `fishing` | rods bamboo/weighted/carbon/elm; tables `fish_<mapid>` | `poynton` Q7 (Ch.1) | SIDE-CONTENT §2.4 |
| `brewing` | Y Berllan press; recipes `brew_*`; tiers 1–3 | `y_berllan_shed`, `brewing_open` (Ch.6) | SIDE-CONTENT §2.5 |
| `gathering` | berry/ingredient nodes, 400-step regrow | Ch.1 | SIDE-CONTENT §2.6 |
| `photo` | Photo/Sighting mode, album | Q4 (Ch.2) | SIDE-CONTENT §2.7 |
| `dex` | Monster Dex, milestones, habitats | Ch.1 | SIDE-CONTENT §2.8 |
| `achievements` | 40 achievements `ach_01` … `ach_40` | — | SIDE-CONTENT §2.9 |
| `calendar` | day/night bands (game clock), weekday/monthly season cases, daily cat gifts (real clock) | — | SIDE-CONTENT §2.10 |
| `minigames` | `arcade_packet_run`, `arcade_salt_rush`, `arcade_type_trainer`, `knutsford_quiz`, `sand_pattern`, `lift_puzzle`, `timetable_puzzle`, `shunting`, `cable_patch`, `wheel_timing`, `rune_rubbing`, `bear_wrestle`, `bell_ringing`, `reagent_mix`, `roodee_betting` | per town | SIDE-CONTENT §2.11, WORLD-BIBLE §2 activities |
| `cats` | following, sniffing, `k` cat paths, trust 0–5, daily gifts | Ch.1 | SIDE-CONTENT §3 |
| `trainer` | Trainer level 1–50, perks `perk_triage_*` / `perk_escalate_*` / `perk_adjudicate_*`, trinkets | Ch.1 | SYSTEMS-SPEC §8, SIDE-CONTENT §4 |
| `agents` | Agent Trio cooldown menu (+ PIPPIN) | Ch.1–3 (Ch.11) | SYSTEMS-SPEC §6 |
| `overdrive` | Overdrive meter and signature moves | `overdrive_unlocked` (Ch.2) | SYSTEMS-SPEC §7 |
| `signal` | SIGNAL METER overworld layer | `signal_meter` (Ch.4) | STORY-BIBLE §6, SYSTEMS-SPEC §16 |
| `cutover` | CUTOVER counter in the pause menu | `cutover_started` (Ch.4) | STORY-BIBLE §6 |
| `daycare` | breeding/holding at Pit-Pony Pat's | `poynton_daycare` | (legacy feature; keep) |
| `rail` | station fast travel + Cambrian line | `rail_fast_travel` (Ch.5) | WORLD-BIBLE §6 |
| `shrine` | Sandbach revive shrine | `sandbach_shrine` (Ch.5) | SYSTEMS-SPEC §16 |
| `letters` | Nino letters at `*_post` | Ch.2 | STORY-BIBLE cast |
| `newgameplus` | NG+ | `postgame_open` | SIDE-CONTENT §5 |

## 9. Id naming conventions

- All ids: lowercase `snake_case`, ASCII only (no accents: `y_berllan`, `teggs_nose`, `mow_cop`).
- **Maps:** town/site = full name (`macclesfield`, `alderley_edge`, `little_moreton_hall`); interior/sub-map = `<mapid>_<thing>` (`macclesfield_home`, `chester_amphitheatre`); dungeon levels `<mapid>_b1`, `_b2` (down) or `_f1` (up); routes `route_<from>_<to>` with the short tokens in §5a in WORLD-BIBLE's stated direction — never define the reverse; generic interiors `<town>_care|mart|inn|gym|station|post|house_<n>`.
- **Encounters:** `<mapid>_<zone>` (`grass|water|cave|fog|night`); **fishing:** `fish_<mapid>`; **songs:** `town_<token>`, `route_<region>`, `battle_<kind>`.
- **Flags:** story flags exactly as §6; system flags `<system>_<thing>`; per-map pickups `item_<mapid>_<n>`; NPC one-shots `talked_<npcId>`; choices store their value in the choice flag (`choice_agents`, `choice_vex`, `choice_plug`, `invoice_holder`, `champion_result`).
- **Trainers:** `leader_<name>`, `whitehat_<name>`, `champion_vex`, `vex_<n>` (rival fights 1–4), boss `boss_<slug>` (`boss_apt`, `boss_kellan`, `boss_understudy_beeston`, `boss_root`, `boss_glitchra`, `boss_terrataur`, `boss_preserved_one`, `boss_hack_green_ops`, `boss_stack_remnant`), route trainers `tr_<mapid>_<n>`.
- **NPCs:** `npc_<town>_<firstname>`; cats `cat_meadow`, `cat_bigboy`; agents `agent_<name>`.
- **Species:** lowercase name (`merlynx`, `silkmoth`); **moves:** lowercase snake (`live_rail`, `zero_day`); Skill Cards `tm_<move>`; **items:** lowercase snake (`salt_mine_pass`, `rain_jar`, `rain_cloak`, `anchor_packet`); **abilities:** lowercase snake (`back_from_the_brink`, `cheshire_grin`); **perks:** `perk_<branch>_<slug>`; **recipes:** `brew_<slug>`; **quests:** `case_<nn>_<slug>` for casebook, `main_<nn>_<slug>` for chapter quests (`main_01_silk_and_static` … `main_12_the_firewall`, `main_13_fifth_pulse`); **achievements:** `ach_<nn>`; **bounties:** `bounty_<slug>`.
- **Badges:** `badge_packet`, `badge_cipher`, `badge_bear`, `badge_kernel`, `badge_token`, `badge_daemon`, `badge_proxy`, `badge_admin`; `badges` = count in flag expressions.
- **Traversal abilities:** the eleven ids in §3 (`bike squeeze shove billhook lamp boat lift waders climb goggles railcard`).
- Types (13): `normal fire water grass electric flying bug poison rock ground psychic ghost cyber`. Weather: `clear rain fog wind sun snow` (overworld), battle `rain sun fog wind`. Terrain: `grass wet salt static silk`. Day bands: `dawn day dusk night`. Currency: credits; secondary: Casebook Marks (`marks`), Arena Chips (`chips`).
