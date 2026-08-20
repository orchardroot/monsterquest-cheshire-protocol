# content-activities — workstream report

Branch `ws/content-activities`. The repeatable side systems: everything you do
between the story beats. Files owned and delivered:

| File | Lines | What |
|---|---|---|
| `js/data/achievements.js` | ~310 | `MQ.Data.achievements` (40), `MQ.Data.recipes` (10), `MQ.Data.bounties` (26) |
| `js/content/arena.js` | ~770 | `MQ.Arena` — the Warrington gauntlets — **plus `MQ.Activities`, the shared kit** |
| `js/content/fishing.js` | ~600 | `MQ.Fishing` — rods, the bite bar, chains, landing rules, Angler Doug |
| `js/content/brewing.js` | ~410 | `MQ.Brewing` — the elm press, barrels, wall-clock timers, Mam-gu |
| `js/content/bounties.js` | ~415 | `MQ.Bounties` — the board, warrant handlers, claims |
| `js/content/minigames.js` | ~1300 | `MQ.Minigames` — seven games + the arcade front-of-house |
| `js/content/photo.js` | ~440 | `MQ.Photo` — Sighting mode, the album, landmarks and secrets |
| `js/content/rematch.js` | ~300 | `MQ.Rematch` / `MQ.Rematches` — the 0–5 ladder |
| `js/content/shrine.js` | ~240 | `MQ.Shrine` (Sandbach) and `MQ.Inn` (sleep to band) |
| `tools/test/test-content-activities*.js` | ~1450 | 3 files, **79 assertions** |

`node tools/test/run.js content-activities` → 79 passing.
`node tools/test/run.js` (whole tree) → **521 passing, 0 failing**.
`node tools/validate.js` → clean.
`index.html` / `sw.js` are regenerated locally with `node tools/gen-index.js` for
headless testing and reverted before every commit — the platform owns them.

---

## 0. `MQ.Activities` — the shared kit (published from `arena.js`)

`js/content/*.js` loads alphabetically and `arena.js` is first of ours, so the kit
lives there; every consumer reads it **inside a function**, never at parse time.
It is the reason nine scenes look like one product and none of them throw when a
sibling system is missing.

```js
A.T() A.C() A.m()                       // MQ.UI.Theme, palette, metrics (with fallbacks)
A.sfx A.music A.say A.ask A.confirm A.toast A.banner A.emit A.buzz
A.flag A.num A.setFlag A.addFlag A.test
A.money A.spend A.addMoney A.marks A.addMarks A.spendMarks A.chips A.addChips A.spendChips
A.count A.give A.take A.itemName A.speciesName A.party A.partyLevel A.bump A.xp
A.realDate A.now A.dayKey A.weekKey A.dow A.phase A.gameDay A.saveSeed A.rng A.mins
A.provider(sys, key, provider)          // sets saveKey/saveProvider and registers it
A.backdrop A.scrim A.panel A.header A.headerBottom A.footer A.footerTop A.list A.row
A.button A.tabStrip A.tabTapped A.tapped A.backPressed A.confirmPressed A.anyTap
A.text A.menuState A.meter A.open(scene, params) A.close(result)
```

Every wallet/bag/party call degrades: with no `MQ.Inventory` the kit falls back to
the `item_<id>` / `money` / `marks` flag counters `MQ.Script` already writes.

## 1. `MQ.Fishing` (save `fishing`)

`start({map, x, y})` → Promise — the spelling `MQ.Interact` uses. Scene:
**cast → bite → reel → land**. The bite window is short; the reel bar sweeps and
you tap when the marker crosses the band. `MQ.Encounters.fish` does the table roll
(rod tiers, dawn/dusk legendary, night + Ghost Lens ghost, chain weighting) and a
private roll takes over when the world engine is absent.

`rod` (a live getter over the bag — **`MQ.Encounters.rodTier()` reads it**) ·
`RODS` `rodDef` `rodIndex` `hasRod` `setRod` `upgradeRod` (never demotes) ·
`TIERS` (zone width, hits, sweep speed per rarity) · `allowedTiers()` ·
`tableFor` `canFish` `roll` · `reelPlan(res)` (rod tier, chain and a **Bait Tin**
all widen the band) · `landingKind` · `resolveLanding` · `toBattle` ·
`lengthOf` `record` `best` `noteCatch` `rollDrop` `DROPS` `BOTTLES` ·
`dougPrice` `dougOwed` `doug()` · `ledger()`.

**Landing rules.** A row with `item:` lands the item (the Anderton ghost bottles).
`rare` / `legendary` / `ghost` go to a wild battle through `MQ.Battle.start`.
`common` / `uncommon` come straight up the bank: new to the dex, it joins you;
already caught, it is weighed, noted, slipped back — and either way it may drop
roe. Personal bests go on Doug's slate and he pays for each one once.

## 2. `MQ.Brewing` (save `brewing`)

`start()` at a vat, `start('press')` at the apple press. Three barrels, five with
`brew_barrels_5`. Timers are **real timestamps**, so a brew carries on with the app
shut; nothing is longer than four hours; Mam-gu finishes one for a Casebook Mark,
once a real day.

`recipes` `recipe` `ids` `open` `tier` `caskCount` `known` `learn` `blocked`
`missing` `casks` `caskInfo` `remaining` `ready` `readyCount` `freeCask` `begin`
`hurry` `hurryReady` `collect` `collectAll` `timeWord` `tip` `tipFor` `status`.

`brew:done` is emitted for the achievements engine (which owns the `brews` stat,
the `brewed_<recipe>` flag and the XP); we additionally set `brewed_<itemId>`,
which is what achievement 22 actually watches.

## 3. `MQ.Arena` (save `arena`)

`open()` (lobby) · `start(tierId|params)` · `run(tier, {auto, seed, free})` ·
`exchange()` · `TIERS` `tier` `tierIndex` `canEnter` `cleared` `levelFor`
`buildSquad` `buildChallenger` `showCard` `finish` `buy` `leaderboard`
`CHIP_STOCK` `TITLES`.

Bronze 3 · Silver 5 · Gold 7 (no items) · Platinum 9 (no items, one Agent) ·
Obsidian 12 (no items, one Agent, weather by lot, a three-phase twelfth). Squads
are generated from a run seed, so the same seed is the same ladder; levels are the
tier band pulled ≤ 6 toward your party so nobody gets a formality or a wall.
**HP and status refill between fights, PP does not, Overdrive carries.** Chips are
paid for every fight won; a clear pays the tier bonus, Marks, the flag and — the
first time — a perk point. `arena:clear` reaches the achievements engine.
The chip desk sells eight held items and five cosmetic titles.

## 4. `MQ.Bounties` (save `bounties`)

`open(mapId)` — the spelling `MQ.Interact` uses — plus `board` `entry` `active`
`accept` `claimable` `claim` `roll` `rollOwn` `pool` `template` `stats`
`warrantHandler` `warrantGear` `greeting` `quarantine` `TIERS` `dayKey` `weekly`.

`MQ.Quests` already owns the seeded daily roll and the reward book-keeping, so
this file adds the pool (now real, in `js/data/achievements.js`), the board screen,
the metadata the quest machine does not carry (phase, weather, trait, note, the
map the clue points at), the **warrant handler** — a generated trainer registered
through `MQ.Data.define('trainers', 'bounty_handler_<id>', …)` — the gear a Warrant
pays, and a complete stand-alone path for when the quest engine is absent.
Under Quarantine (`choice_plug === 'quarantine'`) the board speaks in ORACLE's log
format instead of the clerk's.

## 5. `MQ.Minigames` (save `minigames`)

`start(id, opts)` → Promise `{id, score, won, best, pb, tokens, …}` ·
`arcade(params)` (cabinet select + prize counter) · `define` `list` `has`
`highScore` `record` `tokens` `addTokens` `spendTokens` `tokenRate` (Friday is
double) · `prizes` `redeem` `PRIZES` `QUIZ` `CABINETS`.

| id | What it is |
|---|---|
| `arcade_packet_run` | Three-lane runner; tap a third of the screen to change lane, tap low to hop. ACK pickups build a combo. |
| `arcade_salt_rush` | 7×8 cascade match-three on a ninety-second clock; the opening board is dealt with no free matches. |
| `arcade_type_trainer` | Twelve matchups against the **real** `MQ.Data.typeMultiplier`, three seconds each, shrinking. |
| `knutsford_quiz` | Five from a **72-question** bank (Cheshire, Gaskell, types, security), answers shuffled per round. A perfect round sets `quiz_perfect_knutsford` and pays 3 Marks once a real day. |
| `lift_puzzle` | Balance two caissons within a tolerance in a move budget. From level 3, "wet" crates gain a tonne on every move. Five levels, and clearing one promotes you. |
| `timetable_puzzle` | Allocate every service to a platform without an overlap; from level 3 a **delay card** shifts one service the moment the board is full. Sets `timetable_perfect`. |
| `fruit_machine` | Three goes. Two bells and a lemon. |

## 6. `MQ.Photo` (save `photo`)

`start/enter/open(params)` — a **transparent** scene, so the overworld keeps
drawing under the viewfinder. Pan with the stick or a tap, tap inside the frame to
shoot, `select` zooms.

`unlocked` `subjectsFor` `makeSubjects` `score` `shoot` `shootLandmark`
`landmarkOn` `checkSecrets` `records` `photosOf`/`of` (what `js/ui/dex.js` asks
for) `album` `bestFor` `bestOf` `habitatNote` `POSES` `POSE_BONUS` `LANDMARKS`
(20) `SECRETS` (5) `HABITAT_NOTES`.

Scores add centring, how much of the frame it fills, rarity, the band of the day
and whether it was **posing**. A shot fills `MQ.Trainer.see` with a habitat note.
Records are compact seeds — `{sp, pose, phase, weather, score, grade, map, ts}`,
under 160 bytes each, capped at 400.

## 7. `MQ.Rematch` / `MQ.Rematches` (save `rematch`)

`offer(trainerId, ctx)` — the spelling `MQ.Interact` uses — plus `fight`
`afterWin` `available` `cooldown` `tier` `setTier` `eligible` `beaten` `growth`
`ladder` `register(id, opts)` `open()` (ladder screen) `LEADERS` `MAX_TIER`.

Tier 0–5; +5 levels and one more on the team per tier; held items and a trait floor
from tier 3; the full six at tier 5. The battle engine already scales off
`rematch_<trainerId>`, so this file owns availability (**one real day or thirty
game-days, whichever comes first**, plus a badge gate for leaders and `postgame_open`
for tier 5), the offer, and the rewards — Marks, and at leader tier 5 the
`anchor_<badge>` themed to their badge.

## 8. `MQ.Shrine` and `MQ.Inn` (save `shrine`)

`MQ.Shrine.use()` — the Sandbach crosses revive every fainted party member, at
full, **once per real day, with no friendship penalty**, in a short scene of two
lit crosses. `open` `available` `usedToday` `fallen` `revive` `status` `lines`.

`MQ.Inn.sleep(params)` — the spelling `MQ.Interact` uses — offers the three bands
you are not in, priced by how far round the clock you are asking to go, heals the
party, moves `MQ.Clock`, autosaves and sets a respawn point. `sleepTo` `price`
`BANDS` `nameFor` `NAMES` (18 real inns).

## 9. `js/data/achievements.js`

* **40 achievements**, ids `ach_01`…`ach_40` in SIDE-CONTENT §2.9 order, each with
  `{num, slug, name, desc, need, hook, hidden, tier, how, group}`. `need` is
  asserted equal to the engine's hook target for all forty, so the two can never
  drift. Three are hidden (24, 35, 40).
* **10 recipes** — the nine ROSTER §4.9 brews under their SYSTEMS-SPEC §16 slugs,
  plus `elm_rod`. Each has ingredients, output, minutes, effect, a Mam-gu tip and a
  margin note; every id resolves to a real item.
* **26 bounty templates** — 10 petty, 10 notable, 6 warrant — each with clue text
  and, where it matters, the phase, weather, trait or note. They replace the quest
  engine's nine-entry fallback pool.

---

## Tests

`tools/test/test-content-activities.js` (27) — the three registries against the
engine's hooks; rods, tier gating by band and lens, reel-plan widening, landing
rules, the ledger, Doug, the full cast→bite→reel→land scene, brewing gates,
wall-clock timers, the barrel upgrade, hurrying, weekly and once-ever recipes, the
shrine's three states, inn pricing and refusal, every save provider, the kit's
degradation, and the exact spellings `MQ.Interact` reaches for.

`test-content-activities-arena.js` (25) — tier rules, entry gating, seeded squad
generation, a cleared and a lost auto-run, `arena:clear` reaching achievements, the
chip desk, the leaderboard and its round-trip, the lobby scene; the seeded daily
board, clue metadata, accept→defeat→claim, the no-quest-engine path, Warrant gear,
ORACLE's voice, the board scene; the ladder, availability by badges and by both
clocks, growth, a won rematch through a real battle to the tier-5 Anchor, a
declined offer, and the ladder screen.

`test-content-activities-games.js` (27) — every game pushes/updates/draws/pops and
can always be left; the quiz bank's shape and subject mix, a solved perfect round
(flag, Marks once a day, `ach_09`), a failed round, shuffled answers still pointing
at the right text; the type drill checked against the real chart; the lift solved
by a greedy solver, wet crates drinking, a failed budget; a valid timetable
(`timetable_perfect`, `ach_16`) and a clashing one refused; salt rush's settled
opening board and its swap-and-revert; packet run; tokens, the prize counter and
the arcade front-of-house; and Sighting mode end to end — lock, subjects, scoring,
the dex note, compact records, the album, a secret shot, the viewfinder scene and
the round-trip.

---

## NEEDS (from other workstreams)

Everything below is optional at runtime — each system checks and degrades.

* **world/overworld** — `MQ.Interact` already calls `Fishing.start`,
  `Brewing.start`, `Minigames.start`, `Bounties.open`, `Rematches.offer` and
  `Inn.sleep`; all of those now exist with those exact spellings. Still wanted:
  a tile/NPC that calls **`MQ.Arena.open()`** at `warrington_arena`,
  **`MQ.Shrine.use()`** at the Sandbach plinth, **`MQ.Minigames.arcade()`** at the
  Wire, and **`MQ.Photo.start()`** from a keybind or the pause menu. `MQ.Photo`
  reads `MQ.Overworld.state.{map,tileX,tileY}` and calls `freeze(true/false)`.
* **maps/regions** — the west/south/salt regions need `fishing:` ids on their water
  maps and `fish_<mapid>` tables; only the eleven east tables exist today.
  The `shop:` ids declared by region-east have **no owner** — nobody publishes
  `MQ.Shop.open(shopId)`; `MQ.UI.Shop.open({stock})` exists but something must map
  a shop id to its stock list. Not ours; flagging it.
* **regions/story** — call `MQ.Rematch.register(trainerId, {name, town})` for the
  twelve named route trainers (or set `rematchable: true` / a `rematch.party` on
  their trainer data); we auto-detect `leader`, `rematch`, `rematchable` and
  `notable`. Story should set `arena_open`, `bounty_board_open`, `photo_mode`,
  `brewing_open`, `brew_tier`, `sandbach_shrine` and `recipe_<id>` at the right
  beats, and `brew_barrels_5` when the barrels are bought.
* **content-core** — `MQ.Quests` owns the `photos` trainer stat off the `photo`
  event and the `bounties`/`warrants` stats off `quest:complete`; we deliberately do
  not double-count, so a build without `MQ.Quests` loses those counters (we bump
  `photos` ourselves in that case only).
* **ui** — nothing blocking. `js/ui/dex.js` now finds `MQ.Photo.photosOf(id)`.
  A pause-menu entry for the album and Doug's ledger would be welcome; both are
  plain data (`MQ.Photo.album()`, `MQ.Fishing.ledger()`).
* **audio** — `arcade` would be a good song id for the Wire; the cabinets currently
  borrow `town_warrington`, and the boat lift borrows `town_northwich`.

## NEW IDS

* **`MQ.Activities`** — the shared kit namespace (new global on `MQ`).
* Recipe id **`elm_rod`** (tier 3, output `rod_elm`) — the only recipe not in
  ROSTER §4.9; SIDE-CONTENT §2.4 says the Elm-handled Rod is brewed at Y Berllan
  and nothing else made one.
* Bounty template ids `bounty_<slug>` (26) and generated warrant handlers
  `bounty_handler_bounty_<species>_<n>` (trainers, registered at roll time).
* Arena titles `title_bronze_regular title_silver_service title_gold_standard
  title_platinum_nerve title_obsidian`.
* Photo album ids: landmarks `lm_*` (20), secrets `sec_*` (5).
* Flags: `brew_barrels_5`, `recipe_<recipeId>`, `brewed_<itemId>` (alongside the
  engine's `brewed_<recipeId>`), `arcade_tokens`, `arcade_pass`, `lift_level`,
  `timetable_level`, `caissons_balanced`, `shrine_used_day`, `fish_rod_tier` (int,
  already in ROSTER §10 — we write it).
* Events: `fish:land` `fish:lost` · `brew:start` `brew:learn` (`brew:done` is
  ROSTER's) · `arena:start` `arena:end` (`arena:clear` is ROSTER's) ·
  `bounty:accept` `bounty:claim` · `minigame:end` `minigame:solved`
  `minigame:tokens` · `quiz:round` · `photo:secret` · `shrine:revive` ·
  `rematch:win` `rematch:lose` · `party:revive`.

## Known gaps

* **Fishing tables exist only for the east region** — eleven `fish_*` tables and
  sixteen maps. Everywhere else, `MQ.Fishing.start` says the water is empty rather
  than inventing a table.
* **Berry and ingredient gathering (SIDE-CONTENT §2.6) has no owner.** `MQ.Cats`
  looks for `MQ.Gathering.nodesAt(map)` and `MQ.Interact` for `MQ.Gathering.pick`;
  neither exists. Brewing therefore leans on fishing drops, bounty rewards and the
  interact handler's own berry pickups for ingredients.
* **Season cases and the weekday calendar** (§2.10) are not scheduled here beyond
  Friday double tokens and the daily/weekly gates; DESIGN-INDEX gives that to a
  `calendar` system with no owner.
* The Arena's Obsidian boss is a two-phase declarative script, not a bespoke
  encounter; it wants a proper set-piece once the post-game maps exist.
* Nine of the fifteen DESIGN-INDEX §8 minigame ids are unimplemented (`sand_pattern`,
  `shunting`, `cable_patch`, `wheel_timing`, `rune_rubbing`, `bear_wrestle`,
  `bell_ringing`, `reagent_mix`, `roodee_betting`). `MQ.Minigames.define(id, def)`
  takes a plain object — `init/update/draw` plus any helpers — so a region team can
  add one in a single file without touching this one.
* **No browser testing** — headless only, per the workstream rules. The reel bar,
  the salt grid and the viewfinder all want a pass on a real touchscreen for target
  sizing and pacing.
