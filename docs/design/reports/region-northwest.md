# Workstream report — region-northwest

Chapters 8–12, the three endings and the post-game: Delamere to Parkgate, the
two VEXes on Beeston's wall, ROOT's bench, THE STACK, both remaining gyms, and
two miles of Roman wall at dusk.

## What shipped

**133 maps / ~104,700 tiles** under `js/world/maps/nw*.js`, all authored in the
ENGINE §5.2 format. The painter is region-east's `MQ.EastBuild` (reused, never
edited); `nw__legend.js` adds only the shared **legends** so a character means
the same thing from Delamere to the Dee.

| File | Contents |
|---|---|
| `nw__legend.js` | `MQ.NW`: the `TOWN` / `LAND` / `IN` / `CAVE` legends, `defTown/defLand/defIn`, `room`, `doorway`, `exit`, `edge` |
| `nw_delamere.js` | Delamere Forest (4-exit hub with four interlocking loops), Blakemere Moss, the Old Pale, the night glade, Eddisbury, the ranger hut, R24, R25, R26 |
| `nw_tarporley.js` | Tarporley + 8 interiors incl. Cadoc's hedge yard and the kennels, R27 Bunbury, R28 Christleton |
| `nw_beeston.js` | Beeston Castle (crag, outer ward, **the wall walk**, the keep), the 370-ft well, the crag summit, the outer-ward arena, Peckforton |
| `nw_frodsham.js` | Frodsham + 8 interiors, Frodsham Hill (five switchbacks, Mersey View, the beacon), the Waders-only marsh, R23 |
| `nw_runcorn.js` | Runcorn, **Gym 7** (Ria's reagent lab: fume lines as walls), the Silver Jubilee footway (Q24's six spans), the Mersey Gateway, Halton Castle, Norton Priory, the six fridge maisonettes, care/mart |
| `nw_daresbury.js` | Daresbury, All Saints' (the Alice mirror), the beamline, both halves of R22's fog lane |
| `nw_stack.js` | `stack_lobby`, `stack_hall_1..8` (each a different walk), `stack_breaker_room`, and the post-game `stack_cold_f1..f5` |
| `nw_lymm.js` | Lymm, Lymm Dam (sluice, pumping station), 5 interiors, R21 under Thelwall |
| `nw_warrington.js` | Warrington, **Gym 8** (Mo's NOC) + the transporter gondola, the Wire Arcade, the Arena, the Town Hall, station/care/mart |
| `nw_chester.js` | Chester (four Roman streets, the Rows, Eastgate), **`chester_walls`** as a walkable two-mile circuit with four towers, the Northgate, the cathedral chapter house, the amphitheatre, the Roodee, the Groves, Edgar's Field, 6 townhouses + care/post/mart/inn |
| `nw_wirral.js` | R29 to Chester Zoo (+ penguin pool, keeper's hut), Ellesmere Port (+ boat museum, the sixty-first boat, the outlet), the Wirral Way, Parkgate, Ince Marshes, the cooling-water intake, the Weaver Bend back to Frodsham |

283 NPCs, 232 signs, 197 pickups, 73 trainer placements, 9 cat gaps, 15 BIGBOY
rest points, 591 warps — every one of them reachable on foot and round-tripping.

**Data** — `js/data/encounters_nw.js` (108 tables incl. night/fog/rain/wind
variants and five fishing tables), `js/data/trainers_nw.js` (96 trainers:
`leader_ria` and `leader_mo` with house rules and 2/3 boss phases, the four
White Hats each carrying their `check`, `champion_vex` **and**
`champion_vex_tuned`, `vex_4`, `boss_understudy_beeston`, `boss_gateway`,
`boss_root` (who debuffs himself — she wants to lose), `boss_glitchra`,
`boss_oracle` (3 phases + form changes), `boss_stack_remnant`, four sleeping
knights, `vex_roodee`), `js/data/quests_nw.js` (`main_08` … `main_13` and
casebook 23, 24, 26, 27, 28, 29).

**Story** — `js/story/npcs_nw.js` (88 scripts, ~400 bespoke lines),
`ch08_the_ruin.js` (the wall, **CHOICE 2**, the well), `ch09_bridge_traffic.js`
(the bench, the invoice fork, Gym 7, the six fridges, the Gateway, the breaker),
`ch10_draw_your_own_conclusions.js` (Mo, the whiteboard, the gondola),
`ch11_the_sky_is_quiet.js` (ROOT → GLITCHRA → ORACLE → **CHOICE 3**),
`ch12_the_firewall.js` (the four checks as executable predicates, Champion VEX,
the throw), `postgame_the_fifth_pulse.js`, and `js/story/endings.js`.
119 `nw_*` scripts in total.

## Public API

- `MQ.Story.runEnding(choice?, opts?)` → Promise. `choice` is `'delete' |
  'quarantine' | 'custody'`; omitted, it reads `choice_plug`. Emits `'ending'`,
  plays the ending, then the credits. Overrides the placeholder in
  `js/story/main.js`.
- `MQ.Story.endingScripts.{ending_delete,ending_quarantine,ending_custody}`,
  `MQ.Story.selectEnding(choice)`, `MQ.Story.endingVariant()` →
  `{plug, vex, result, ally}`, `MQ.Story.runCredits(title)`,
  `MQ.Story.creditsScene`.
- `MQ.Story.firewallChecks` — `{sue, raj, kim, doc}`, each `{id, trainer, label,
  fail, test()}`. The UI can render the four gates from this; `test()` reads
  `MQ.Party.list`.
- `MQ.Story.chapters[8..13]` with `start` + `hooks.complete/next`.
- `MQ.NW` — the region's legends and map helpers, if anyone wants them.

## Tests

`tools/test/test-region-northwest.js` (12) — validates the world and all data
with zero problems, checks every map's shape/landmark/heal point, that every
legend char resolves, that nothing is walled in, that **every warp is reachable
on foot from the spawn point**, that every link round-trips and lands walkable,
that the whole region is one connected component from Delamere, and that the
eight STACK doors gate on `stack_doors_opened >= n`.

`tools/test/test-region-northwest-story.js` (40) — every map-named script is a
registered generator; the Ch.8 opening runs under `MQ.Dialog.auto` and is
idempotent; the wall scene; **both halves of CHOICE 2** (Verify greyed out
without `welsh_word_learned`); the well; both invoice forks; Gym 7 → badge +
goggles; Gym 8 → grin, gondola, `all_badges`, `jodrell_open`; the breaker →
`plug_pulled` + `CUTOVER: STOPPED`; the whole Ch.11 climax **without
region-mid's Jodrell maps loaded**; all three CHOICE 3 branches; the White Hat
predicates pass and fail on real parties; Champion variant selection; a thrown
final; and `runEnding()` for **all 18 combinations** of ending × Verify/Challenge
× won/lost/thrown, each reaching the credits.

`node tools/validate.js` → OK (236 maps). `node tools/test/run.js` → **453
passed, 0 failed**.

## NEEDS

- **`tools/gen-index.js` contract order** must gain five entries or these files
  are silently excluded from `index.html`/`sw.js`: `data/encounters_nw`,
  `data/trainers_nw`, `data/quests_nw` (before `data/dialogue`), `story/npcs_nw`
  and `story/endings` (after `story/main`, before `story/chapters/`). The two
  test files splice them in themselves so the suite passes on a clean tree.
- **region-mid**: Ch.11 drives `jodrell_bank`, `jodrell_bank_control_room`,
  `jodrell_bank_tower`, `jodrell_bank_dish`. It degrades to narration if they
  are absent, so nothing breaks — but the climax wants those maps.
- **Boundary routes**: Lymm has no east exit (R20 `route_budworth_lymm` is
  another team's id) and `route_delamere_winsford` dead-ends at its east edge.
  Three warps at integration time joins the county up.
- **Shops**: maps declare `shop_tarporley`, `shop_frodsham`,
  `shop_frodsham_trail`, `shop_runcorn`, `shop_daresbury`, `shop_lymm`,
  `shop_warrington`, `shop_chester`, `shop_chester_rows`,
  `shop_ellesmere_outlet`. No shop registry exists yet; nothing breaks.
- **Content systems**: `MQ.Arena`, `MQ.Minigames`, `MQ.Bounties`, `MQ.Fishing`
  are all called behind `if (…)` guards and fall back to flags/text.
- **Sprites**: `npc_station`, `npc_publican`, `npc_tourist` (also needed by
  region-east) are referenced and not in `MQ.PeopleArt`.
- **Audio**: `route_mersey`, `route_west`, `battle_rival` alias needed;
  `MQ.Songs` has `battle_vex`, which is what these files use.

## NEW IDS

- Maps beyond DESIGN-INDEX §5a (all sub-maps of listed nodes):
  `delamere_blakemere`, `delamere_old_pale`, `delamere_night_glade`,
  `delamere_eddisbury`, `delamere_ranger_hut`, `frodsham_marsh`,
  `frodsham_church`, `tarporley_church`, `tarporley_hunt_kennels`,
  `lymm_church`, `lymm_house_1..2`, `warrington_arcade`/`arena`/`town_hall`,
  `chester_zoo_penguins`, `chester_zoo_keeper_hut`, `parkgate_house_1..3`,
  `daresbury_house_1`.
- Trainers: `champion_vex_tuned` (the Challenge-path Champion — DESIGN-INDEX
  lists one `champion_vex` but §8 requires two teams), `vex_roodee`,
  `elite_knight_first/second/third/last`, `tr_stack_cold_1/2`.
- Quest ids: `case_23_frodsham_beacon`, `case_24_runcorn_gauntlet`,
  `case_26_delamere_watch`, `case_27_lymm_reflection`, `case_28_wire_arcade`,
  `case_29_chester_walls` (the slugs; the numbers are SIDE-CONTENT's).
- Flags: `beeston_arena_open`, `glitchra_sighting`, `firewall_started`,
  `firewall_all_passed`, `champion_thrown`, `ending_seen`, `credits_seen`,
  `runcorn_fridge_1..6`, `case_26_sightings`, `case_27_slots`,
  `case_28_cabinets/refusals/fourth`, `case_29_checkpoints/note`,
  `vex_reconciled`, `stack_doors_opened` used as an integer counter.

## Known gaps

- Casebook cases 23/24/26/27/28/29 are scripted end to end **against the flags**;
  the photo-mode, arcade-cabinet and bounty-board minigames they count are other
  workstreams' and are called through guards.
- Ch.11 is a scripted run rather than a walkable dungeon, because the dungeon is
  region-mid's; when their maps land it teleports through them and the fights
  and the choice are already wired.
- The Chester wall circuit's eight Q29 checkpoints increment a counter that
  nothing on the wall yet sets — the checkpoint triggers want to be added once
  the world team's step-trigger radius behaviour is final.
- No browser verification (headless only, per the workstream rules).
