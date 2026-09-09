# content-core — workstream report

Branch `ws/content-core`. Files owned and written:

```
js/content/state.js               MQ.Party, MQ.Inventory, MQ.Trainer, MQ.Settings
js/content/progression.js         MQ.Progression (trainer curve, perk tree, effect registry)
js/content/quests-engine.js       MQ.Quests (state machine, casebook, clue board, bounties)
js/content/achievements-engine.js MQ.Achievements (40 hooks, unlock-once, progress)
js/content/cats.js                MQ.Cats (MEADOW)
js/content/daycare.js             MQ.Daycare (Pit-Pony Pat's yard)
tools/test/test-content-core-{state,quests,progression,cats}.js
```

Load order inside `content/` is alphabetical, so `state.js` loads **last**. Every
cross-reference between these files is made lazily inside a function; nothing runs
game logic at parse time. Each system registers its own save provider immediately
(so headless tests work without `MQ.Boot`) and also exposes `saveProvider`/`saveKey`
for `Boot.registerProviders`.

---

## MQ.Party  (save `party`)

`MAX 6`, `BOX_PAGES 16 × BOX_SIZE 30`, `CATS ['meadow']`.

`make(species, level, opts)` (defers to `MQ.Data.makeMonster` when the data team
ships it; otherwise builds the full instance shape from `MQ.Data.species` — stats,
IVs, learnset moves, `metAt`) · `add(mon)` → `'party'|'box'` · `addBox` · `remove`
· `release` · `swap(i,j)` · `deposit(uid)` / `withdraw(page,slot)` · `boxPage`,
`boxNames`, `renameBox`, `boxFull`, `boxCount`, `total` · `get(uid)` (party **and**
box) · `indexOf`, `find`, `has(species)`, `hasAnywhere` · `alive()`, `firstAlive()`,
`first()`, `at(i)`, `active()`, `wiped()` · `heal(mon?)`, `damage`, `restore` ·
`reserve(uid,on)` / `reserved(uid)` for benching a cat without removing it ·
`giveGear`/`takeGear` · `nickname`, `displayName`, `hpRatio`, `isCat`.

MEADOW cannot be removed, deposited or boxed — `remove`/`deposit`/
`addBox` all refuse them.

Events: `party:add remove release order deposit withdraw heal faint revive gear reserve`.

## MQ.Inventory  (save `inventory`)

Pockets by `item.kind`: `medicine (heal,cure) · capsules · battle (consumable) ·
gear (gear,held_consumable,evo,rod) · cards (tm) · ingredients (ingredient,brew) ·
key`.

`add(id,n,{silent,toast})` · `remove` · `count` (falls back to the `item_<id>`
flag `MQ.Script` writes in degraded mode) · `has` · `pocket(name)` · `all`,
`keyItems`, `def(id)`, `name`, `pocketOf` · money `money/addMoney/spend`
(prize money runs through the *Ledger Keeper* perk) · `marks`/`chips` with
`addMarks/spendMarks/addChips/spendChips` · `price` (through *Trader*),
`sellPrice`, `buy`, `sell` · `equipRod/rodTier` (never demotes you) ·
`repel`/`lure` step counters + `stepBuffs(n)` · `applyBuff/buff/expireBattleBuffs`
· `usableInField`, `usableInBattle`.

`use(id, target, {battle, free, cat})` → `{ok, msg, consumed}`; dispatches
heals, cures, revives, evolution items (checks the species' `method:'item'`
evolutions and emits `evolve`), Skill Cards (emits `skillcard`, teaches when
there is a free slot), gear/held (moves it onto the monster), rods (equips),
repel/lure, brews (party heal/cure, cat trust, perk point, timed buffs), weather
items and `boombox`. Capsules refuse to be used outside a battle. Never throws.

A **private** fallback item table covers the ROSTER §4.1/4.2/4.6/4.8/4.9 ids so the
bag works before `js/data/items.js` lands; anything in `MQ.Data.items` always wins
and nothing is registered into `MQ.Data`.

## MQ.Trainer  (save `trainer`)

`name level xp perkPoints perks(Set) perkRanks trinkets[2] badges(Set) titles(Set)
playtime stats dex`.

`addXp(n,reason)` (levels, grants a perk point, toasts) · `xpToNext/xpRatio` ·
`grantPerkPoints` · `perkTree` (= `MQ.Progression.tree`), `hasPerk`, `perkRank`,
`canBuyPerk`, `buyPerk`, `perkList`, `respec({free})`, `respecAgentNodes()` (the
Y Berllan Wipe/Feed re-spec) · `trinketSlots/equipTrinket/unequipTrinket/wearing`
· `addBadge/hasBadge/badgeCount/badgeLabel` (relabels to **SIGNED** after
`pippin_found`; sets `all_badges` at eight) · `addTitle` · `tick(dt)`,
`playtimeString` · `bump(stat,n)`/`stat(s)` over 27 counters, mirrored into the
ROSTER §10 flag counters (`steps_total`, `steps_rain`, `count_puppets_beaten`, …)
· dex `see(species,ctx)` / `record(species,ctx)` with habitat notes,
`dexEntry/seenCount/caughtCount/dexTotal/habitatNote`, the seven SIDE-CONTENT §2.8
milestones (`dex:milestone`) · `rank()` on the Probationer→Principal ladder ·
`card()` for the trainer-card UI.

## MQ.Settings  (save `settings`, plus `localStorage['mq2_settings']`)

16 keys with validation and ranges: `textSpeed musicVolume sfxVolume difficulty
touchSize touchSide screenShake battleAnim runToggle captureMinigame xpShare
autosave questTracker miniMap vibration dexHabitats`. Capture timing is **off**
by default per SYSTEMS-SPEC §11.

`get/set/toggle/all/reset/load/persist/apply` · `LABELS` for the settings screen ·
`TEXT_SPEED`, `ANIM_SPEED` multipliers · `DIFFICULTY` table (SYSTEMS-SPEC §13) via
`rules()` · `lowestDifficultyUsed` so achievements can record the easiest tier used.
`apply()` pushes into `MQ.Dialog.speed`, `MQ.Audio` volumes, `MQ.Input.touchScale/
touchSide/vibrationEnabled` and `MQ.Scenes.shakeEnabled` when they exist.

## MQ.Progression

Trainer curve: `xpForLevel(n) = 15 + 5(n-1)`, cumulative to L50 ≈ 6,615 — sized to
the SIDE-CONTENT XP sources. `xpTotalFor`, `levelForTotal`, `XP` source table,
`award(source, n)`. Monster curve `expForMonLevel/monLevelForExp` (fast 0.8L³ /
medium L³ / slow 1.25L³) and `recalcStats(mon)` (defers to `MQ.Data.statsFor`).

Passives: `catchRateBonus()` (+1%/level, cap 30%), `obedienceCap()` (10+2·TL),
`trinketSlots()` (TL20/TL35), `numericTraits()`.

**Perk tree**: 30 nodes, three branches of ten, rows 0-9 → unlock levels
1/5/10/15/20/25/30/35/40/45, ids exactly as ROSTER §10 (including the three-rank
`perk_adjudicate_ledger_keeper` and every rank-2 node). `tree`, `nodes`, `node(id)`,
`branch(b)`, `agentNode(b)`, `BRANCH_INFO`.

**Effect registry**: each rank declares `effects{}`; `EFFECT_KIND` says how a key
folds (`add|mul|flag|min|max`) and `EFFECT_BASE` gives the unmodified value.
`effects()` / `effect(key, base)` return the fold (cached, invalidated on
`trainer:perks`/`load`/`newgame`). `has(perkId, rank)`, `rank(perkId)`. Convenience
readers: `critStage capsuleBonus moneyMult shopPriceMult xpShareRatio bagHealMult
trustGainMult runSpeedMult overdriveGainMult superEffectiveMult bossPhaseHealCap
agentCooldownMod(agentId)`.

Buying: `canBuy(id)` / `blockedReason(id)` (rank, trainer level, points-in-branch
gate, points), `spentIn(branch)`, `spentTotal()`, `respecCost()` in Casebook Marks.

Keys the battle engine can read straight off `MQ.Progression.effect(...)`:
`critStage superEffective turn1DamageMult overdriveGainMult bossDamageMult
showEncounterTable wildAmbushSpeStage quickDraw runSpeedMult recoilMult
sleetCooldown killChain statusTurnsSelf bagHealMult ownNegativeStageMult
switchInHealFrac freeSwitch ignoreFog rollbackFaints brinkUses
meadowSlipstreamStage trustGainMult friendshipGainMult vigilCooldown vigilHealMult
incidentCommander showFoeMoves showFoeAbility showOwnTraits showTurnOrder
captureWindowMult capsuleBonusAdd shinyOddsMult ignoreFoePositiveStages
bossPhaseHealCap critDamageMult moneyMult shopPriceMult xpShareRatio
arbiterCooldown attribution overdriveCarryFrac`.

## MQ.Quests  (save `quests`)

`start(id,{force}) advance(id,n) setStage complete fail reset` ·
`stage(id) isStarted isActive isDone pin(id) state currentStage stageText` ·
`active() completed() all() available() byKind byTown` ·
`track(id)/untrack()/tracked()` (HUD payload with stage text, hint and
`{have,need}` progress) · `check()` (fixed-point, max 8 passes) · `progress(id)` ·
`grantReward(reward, questId)` · `runScript(name, ctx)`.

Stage conditions (`stage.cond`): a flag expression string, a function, or
`{kind: …}` — `flag defeat catch item talk reach photo count money badges level
quest trust none all any` with `n` for counters. Stages may also carry `flag`
(set on completion), `twist`, `clue`, `reward`, `onStart`, `onComplete`, `hint`.
Quest defs may carry `opens` (a flag expression gating `start`), `auto` (open
themselves as soon as `opens` is true), `repeatable`, `tracks`, `town`, `giver`,
`teaches`, `tags`.

Rewards: `{money, marks, chips, items[], gear, perk, xp, monster{species,level,
nickname}, trust{cat,n}, title, flags[], unlock}` — `unlock` adds to
`MQ.Overworld.state.abilities` or falls back to a `unlock_<id>` flag.

**Clue board** (STORY-BIBLE §6): `pinClue(clue)`, `clueBoard(chapter)`,
`hasClue`, `linkClues(a, b, {text, flag})` (the reveal is a line between two pins),
`clueLinks(chapter)`.

**Casebook**: `casebook()` → towns → cases with `pin` (Open/In Hand/Closed),
`twist`, `marks`, stage text; `closedCases()`, `rank()`.

**Bounties** (SIDE-CONTENT §2.1): `rollBounties(force)` — three a day, seeded from
the real date + the save seed so the board cannot be re-rolled; Warrant tier only
on the weekly slot. `bountyBoard()`, `acceptBounty(id)`, `dayKey()`,
`BOUNTY_TIERS`. Generated bounty quests are registered through
`MQ.Data.define('quests', 'bounty_<species>_<n>', …)` and are located by clue text,
never a map marker. A private fallback bounty pool is used until
`MQ.Data.bounties` exists.

Listens to: `flag item:get catch photo npc:talk map:enter battle:end newgame`.
Emits: `quest:start stage stagedone complete fail twist reward track script`,
`clue:pin clue:link`, `bounty:board`.

Also registers a lenient `MQ.Data` validator for quest shapes (name, stages, stage
ids, `cond.kind`, reward item ids).

## MQ.Achievements  (save `achievements`)

`unlock(id)` (once, toast, sets flag `ach_nn`, +5 trainer XP, emits `achievement`),
`has`, `count`, `list()`, `progress(id)` → `{have, need, pct}`, `bump(id,n)`,
`set`, `check(id)`, `checkAll()`, `hooks`, `def(id)`.

All 40 hooks are implemented against real sources (trainer stats, flags, quests,
dex, cats, perks, arena flags) with in-voice fallback names/descriptions; display
data from `MQ.Data.achievements` always wins. Checks are coalesced on a microtask
and re-run on `trainer:stat trainer:badge trainer:perks flag quest:complete
dex:caught dex:milestone cat:trust battle:end brew:done arena:clear photo`.
`brew:done` and `arena:clear` are also translated into trainer stats, flags
(`brewed_<recipe>`, `arena_<tier>_clear`) and trainer XP.

## MQ.Cats  (save `cats`)

`DEFS` for `meadow` (species, ability, Overdrive signature, trust-5
signature move, what each smells), `unlocked()`, `unlock()` (adds both to the
party and grants the `squeeze` ability), `follow/stopFollowing/whistle/follower/
monster(id)`.

Trust 0-5 on a points ladder `[0,5,15,30,50,75]`: `trust(id) points(id)
addTrust(id,n,reason) setTrust feed(id,item) kindness(id,n)` — gains from feeding
(Cat's Cup once a day), winning with the cat in the fight, kind quest options,
sniffs, rest points, gifts and dispatches, all multiplied by *Cat Handler*.
Perks: `sniffRange` (3→5 at T1), `canHoldItem`/`holdItem` (T2), T3 dodge /
Brink heal, `canDispatch` (T4), `allowedInGyms` + signature move (T5).

Sniffing: `scan(map,x,y,cat)` / `onTile` / `update()` emits **`cat:sniff`** with
`{cat, kind, tile:{x,y}, map, dist, item, flag}` for MEADOW (uncollected map items
and `MQ.Gathering` nodes) or `{kind:'creature', table, chances[]}` when there is nothing left to dig up
(the tile's encounter table); one paw-print per find. `reveal()` (tap the cat)
emits `cat:reveal` and pays a trust point.

Cat-only paths: `canSqueeze()`, `sendThrough({item,n,flag,lever,battle})` → Promise
`{ok,item,lever,battle}`, auto-resolving a small fight with trust as the stat.
T4 dispatch: `dispatch(cat,job,minutes)`, `dispatchReady`, `collectDispatch`.

Rest points: `REST_POINTS` (Kerridge, Tatton, Frodsham, the Roodee, plus two for
MEADOW), `rest(map)`, `restsFound()`; fires on `map:enter`.
Collars: `COLLARS`, `ownsCollar`, `unlockCollar`, `setCollar`, `collar(id)` —
unlocked by flags and `cat_token_<n>` pickups.
Daily gifts: `giftReady(id)`, `collectGift(id)` (real-clock day, weighted by trust).
`battleData(id)` hands the battle engine species, ability, Overdrive, held item,
extra move, dodge/Brink/shield/Slipstream numbers and gym permission.

## MQ.Daycare  (save `daycare`)

Two pens at `poynton_daycare`. `leave(uid)` (refuses cats and your last monster),
`preview(i)`, `cost(i)` (100 + 100/level), `collect(i,{free})` (applies levels,
recomputes stats, learns level-up moves, −5 friendship per level), `tick(steps)`
driven by the `step` event (`stepsForLevel(l) = 128 + 8l`), `slot/occupied/free/has`.
Bonus: two occupied pens for 2,000 steps lay an egg (`layEgg`, `eggReady`,
`takeEgg`) — shiny when the caught-100 dex milestone armed `shiny_egg_ready`.

---

## Tests

`node tools/test/run.js content-core` → **81 tests**, all passing.
`node tools/test/run.js` (whole suite incl. core) → 110 passing.
`node tools/validate.js` → OK.

## NEEDS (other workstreams)

- **core** — `MQ.Save.providers` is **not exposed** (`save.js` keeps `providers`
  private) but `js/boot.js:20` does `if (!MQ.Save.providers[key])`, which will
  throw at boot as soon as any system exposes `saveProvider`. Either expose
  `Save.providers` or guard in `Boot.registerProviders`. Our systems self-register,
  so tests pass, but a real boot will fall over.
- **data** — `MQ.Data.makeMonster(species, level, opts)` and (optionally)
  `MQ.Data.statsFor(species, level, ivs)`; `MQ.Data.items` with `kind/amount/cures/
  revive/catchBonus/rodTier/trinket/teaches`; `MQ.Data.quests` (main + 30 cases)
  and `MQ.Data.achievements` display data; `MQ.Data.bounties` templates
  (`{species, name, clue, tier, town}`) to replace our fallback pool.
- **world/overworld** — emit `step {n, running}` per tile, `map:enter {map}`,
  `npc:talk {npc}`; expose `MQ.Overworld.state.abilities` (a Set) and
  `state.map/tileX/tileY`; call `MQ.Cats.onTile(map,x,y)` on tile change and
  `MQ.Cats.rest(map)` where appropriate; honour `MQ.Inventory.repel/lure` and
  `MQ.Progression.runSpeedMult()`.
- **battle** — emit `battle:end {outcome, kind, trainer, cls, species,
  participants[]}` and `catch {species, map, level}`; read party from `MQ.Party`
  (`active()` skips reserved cats), items via `MQ.Inventory.use(id, target,
  {battle:true})`, perks via `MQ.Progression.effect(key)`, cats via
  `MQ.Cats.battleData(id)`, difficulty via `MQ.Settings.rules()`; bump
  `MQ.Trainer.bump('overdrives'|'puppetsBeaten'|'knockouts')`.
- **ui** — screens for `MQ.Trainer.card()`, `MQ.Progression.tree` +
  `blockedReason`, `MQ.Quests.casebook()`/`clueBoard()`/`tracked()`,
  `MQ.Achievements.list()`, `MQ.Inventory.pocket()`, `MQ.Settings.LABELS/RANGES`.
- **content siblings** — `MQ.Gathering.nodesAt(map)` (cats sniff them),
  `brew:done {recipe}`, `arena:clear {tier}`, `photo {species}` events.

## NEW IDS

Only ids not already in ROSTER/DESIGN-INDEX:

- Collar cosmetics (`MQ.Cats.COLLARS`): `collar_plain collar_bell collar_silk
  collar_tartan collar_hi_vis collar_salt collar_paisley collar_arcade
  collar_orchard collar_signed`.
- Bag fallbacks used until `js/data/items.js` exists: `repel_spray`, `lure_tin`
  (repel/lure consumables were implied by the brief but unnamed in ROSTER §4.5).
- Flags: `dex_bandolier`, `shiny_egg_ready` (dex milestones), `released_any`
  (for Stoker Di's tier-4 rematch), `brewed_<recipe>`, `quiz_perfect_knutsford`,
  `timetable_perfect`, `count_languages`, `stations_registered`,
  `meadow_sat_edge`, `meadow_sat_orchard`, `lever_<id>`, `hitem_*` unchanged.
- Events: `party:*`, `item:get/lose/use`, `money`, `marks`, `chips`, `buff`,
  `evolve`, `skillcard`, `keyitem:use`, `overdrive:seed`, `battle:setWeather`,
  `battle:flee`, `trainer:*`, `dex:seen/caught/milestone`, `quest:*`, `clue:*`,
  `bounty:board`, `achievement`, `cat:*`, `daycare:*`, `settings`, `step`,
  `npc:talk`, `map:enter`, `photo`, `brew:done`, `arena:clear`.

## Known gaps

- Bounty *clue* text is generic until `MQ.Data.bounties` ships real ones; the
  fallback pool is nine entries.
- `Inventory.use` emits `evolve` rather than running the evolution — the species
  workstream owns the transformation itself.
- Season cases (`season_<mm>_*`) and the epilogue quests are supported by the quest
  machine but no scheduling lives here; that belongs to the `calendar` system.
- The daycare egg is a light touch, not a breeding system: no inherited moves,
  IVs or egg groups.
- `Trainer.playtime` needs somebody to call `MQ.Trainer.tick(dt)` from the loop
  (core's `MQ.Save.tick` tracks its own).
