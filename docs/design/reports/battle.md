# Workstream report — **battle**

Branch `ws/battle`. Files owned and delivered:

| File | Lines | What |
|---|---|---|
| `js/battle/effects.js` | ~1270 | `MQ.BattleEffects` — battle arithmetic, the 30 abilities, 33 gear pieces, every move-effect handler, status, capture, XP |
| `js/battle/ai.js` | ~230 | `MQ.BattleAI` — `random` / `greedy` / `smart` tiers |
| `js/battle/engine.js` | ~2000 | `MQ.Battle` — the turn engine, agents, bosses, capture, levelling, house rules |
| `js/battle/scene.js` | ~880 | `MQ.BattleScene` — the battle UI |
| `tools/test/test-battle*.js` | ~1100 | 6 files, 87 battle assertions (119 with the core suite) |

Load order is unchanged: `effects → ai → engine → scene`.

---

## 1. Public API

### `MQ.Battle`

```js
MQ.Battle.start(opts) -> Promise<result>          // ENGINE-ARCHITECTURE §6
MQ.Battle.create(opts) -> engine                  // headless / scriptable
MQ.Battle.autoResolve(opts) -> result             // cat scraps, sims, balance passes
MQ.Battle.autoRun(engine, cap) -> result
MQ.Battle.makeMonster(speciesId, level, opts)     // delegates to MQ.Data.makeMonster when it exists
MQ.Battle.buildTrainerParty(trainerData, difficulty)
MQ.Battle.agentList(b) / agentAvailable(b, id) / agentIsFree(b, id)
MQ.Battle.overdriveMove(b, mon)
MQ.Battle.moveData(id) / itemDataOf(id) / speciesOf(id)
MQ.Battle.current                                 // the live engine, or null
```

`opts` is the contract's shape plus a few additions:

```js
{ kind:'wild'|'trainer'|'boss'|'arena', enemyParty:[monster], trainer, playerParty,
  rules:{ canRun, canCatch, expShare, doubles, weather, weatherTurns, terrain, terrainTurns,
          noItems, oneAgent, overdriveCarry, overdriveOff },
  difficulty:'story'|'normal'|'hard'|'nightmare',
  escort:{name},          // adds GUARD to the menu
  seed,                   // reproducible battles (defaults to a time seed)
  auto:true,              // resolve with AI on both sides, no scene
  agents:['sleet',...],   // override the flag-driven unlock list
  signal, music, species, level }
```

`result`:

```js
{ outcome:'win'|'lose'|'run'|'catch', won, lost, fled, caught, expGained, moneyGained,
  turns, pending:[{kind:'evolve',uid,to,from}|{kind:'learn',uid,move}],
  participants:[uid], seed, difficulty, kind, trainerId }
```

**The engine never mutates species or moves.** Evolutions and over-four move learns are *queued* to `result.pending` for the UI/content team to resolve after the fade.

### The engine object

```js
const e = MQ.Battle.create(opts);
e.start();                 // begins the flow
e.drain() -> [event...]    // events since the last drain (the scene's feed)
e.request                  // {type:'action'|'switch', side, slot, uid} or null
e.options()                // everything the player may do right now (moves, switches,
                           // agents, canRun/canCatch/canItems/canGuard, overdrive)
e.validate(action) -> null|'why not'
e.choose(action) -> {ok:true}|{error}
e.autoChoose()             // let the AI take the player's turn
e.done, e.result, e.waiting, e.b   // b = the raw battle state
```

Actions: `{type:'move',index}`, `{type:'switch',index}`, `{type:'item',id,target}`,
`{type:'capsule',id,timing}`, `{type:'run'}`, `{type:'agent',id}`, `{type:'overdrive'}`,
`{type:'guard'}`, `{type:'struggle'}`. Forced switches take a bare party index.

### Event log

Contract kinds — `msg hp anim stage switch faint catch menu end weather overdrive agent` — plus
`intro turn order terrain status pp item field xp levelup learn phase reveal flee payout guard
cooldown crit effectiveness`. Every event has `.type`; the log is strictly ordered and is the
only thing the scene reads.

### `MQ.BattleEffects`

`stageMul accMul computeStats expForLevel levelFromExp statOf effectiveSpeed damage
accuracyCheck critStage rollCrit applyStatus cureStatus statusImmune addStage clearStages
heal dealDamage gainOverdrive capture capsuleBonus baseXp xpFor runEffect scaledPower
moveFlag hook hookMul hookAllows hookFainted abilities gear effects CAPSULES DIFF OD
TEMPERAMENTS STATUS_NAME STATUS_SHORT STATUS_COLOR WEATHER_NAME TERRAIN_NAME`.

**Ability/gear hook vocabulary** (implement by id in `BE.abilities` / `BE.gear`;
`js/data/abilities.js` only needs `{name, desc, impl:<id>}`):

`onEnter onSwitchOut onBeforeMove onModifyPower onModifyIncomingPower onModifyDamageDealt
onModifyDamageTaken onModifyStat onModifyAcc onModifyFoeAcc onModifyPriority onAfterHit
onHitTaken onTryHit onTryStatus onStatusApplied onTryStage onStageChange onTryFlinch
onTryForceSwitch onTargetedByStatus onFoeCharge onChip onEndTurn onHpChanged onFaint onKO
onWeatherSet onPpEmpty onAfterMoveChosen`.

### `MQ.BattleAI`

`choose(b, mon, {tier})`, `chooseSwitchIn(b, side, foe)`, `scoreMove`, `previewDamage`,
`hitChance`, `shiftTier(tier, difficulty)`, `remember`. Previews are side-effect free and do
not consume the battle RNG, so the same seed always produces the same fight.

### `MQ.BattleScene`

A standard scene (`id:'battle'`). `MQ.Battle.start` pushes it with `MQ.Scenes.pushP` and
resolves with the result. Everything is a tap target as well as a key: FIGHT / OVERDRIVE /
AGENTS / BAG / PARTY / GUARD / RUN, a move menu with type chips, PP and live effectiveness
hints, a party switch screen, a three-tab bag, an agent panel with cooldown readouts, the
capture throw-and-shake animation, the optional capture timing ring, weather and terrain
overlays, tweened HP/Overdrive gauges, status chips, boss phase ticks on the enemy bar and a
typewriter message box.

---

## 2. What is implemented

Everything SYSTEMS-SPEC asks of the battle layer:

- **Damage** exactly per §14 (integer floors in the right places), stage multipliers,
  crit tiers `1/24, 1/8, 1/2, 1`, crit ignoring the wrong-way stages, accuracy/evasion,
  STAB (+Silk Scarf), the type chart via `MQ.Data.typeMultiplier`, burn, screens, the
  85–100 roll, difficulty scaling on enemy damage.
- **Weather** rain / sun / fog / wind / snow, **terrain** grass / wet / salt / static / silk,
  including the awkward corner cases (fog ignores evasion, silk kills priority moves, static
  refuses sleep, salt scrubs poison on entry, wind completes charge moves and chips Bugs).
- **All 30 abilities**, **all 25 gear pieces + 8 Anchors + side-content gear**, and every
  effect kind in §4 including `swap_stats`, `copy_stages`, `sleep_talk`, `rest`, `endure`,
  `taunt`, `pp_drain`, `counter`, `ohko`, `force_switch`, `trap`, `screen`, `cleanse`.
  Aliases from ENGINE-ARCHITECTURE §4 (`multi`, `cure`, `leech`, `confuse`, `levelDamage`) work too.
- **Turn order**: bracket (run/item/agent/capsule → switch → guard → moves) → move priority
  (+ Nightshift, Quick Draw, PIPPIN's defer) → effective speed → temperament speed bias → coin flip.
- **Overdrive** meter and signature moves, gains per §7, Kevlar lockout, Overclocker perk.
- **Agents** SLEET / VIGIL / ARBITER / PIPPIN with cooldowns, trainer-level scaling, perk nodes,
  difficulty modifiers, boss jams, story silence (`agents_silent`, ignored when `agents_hardened`),
  and the free-action ARBITER above TL 20.
- **Capture** per §11 with all ten capsule tiers, critical capture, four shakes, and the
  optional timing minigame (`MQ.Settings.captureMode = 'timing'`).
- **XP** per §12 — participants, share, `Ledger`, traded ×1.2, the over-levelling brake, three
  growth curves, level-ups that recompute stats and learn moves; Trainer XP via `MQ.Trainer.addXp`.
- **Friendship** +1/level, −5/faint, −10 Revive Salts, +3 gym win, Cat Bell ×2, *Bond* ×1.5.
- **AI** three tiers to spec, including the smart tier's switching, Protect-on-full-Overdrive,
  Overdrive discipline, heal items and one-turn memory for `counter`.
- **Trainer battles** with intro/win/lose lines, payouts, `perk_adjudicate_ledger_keeper`,
  rematch ladder scaling (`rematch_<trainerId>` flag → levels, team size, gear, trait floor).
- **Boss battles**: `trainer.boss.phases` firing once at an HP fraction or a turn, both as
  declarative `events` (`say setWeather setTerrain healSelf boostSelf summonAdd changeForm
  disableMove jamAgents silenceAgents rewriteChart forceOverdrive skipIf`) and as a named
  `MQ.Script` generator; phase heal capped at 30% (15% with *Phase Break*), immunity windows,
  per-battle type-chart rewrites that never touch the global chart, phase count in the intro event.
- **Gym house rules** via `trainer.house` (see NEW below): permanent weather/terrain, screens on
  entry, Sysadmin's Reboot, contact-status riders, a jammed agent, and Mo's jam-until-super-effective.
- **Doubles** (2 v 2), **difficulty** (all seven rows of §13), **arena rules**
  (`noItems`, `oneAgent`, `overdriveCarry`), **escort GUARD**, and the **cat hooks**
  (MEADOW trust-3 dodge, BIGBOY trust-3 Brink heal, *Fail-Safe Protocol* double Brink).
- All 33 perks that touch battle read from `MQ.Trainer.perks` (Set or array) or `MQ.Flags`.

## 3. Tests

`node tools/test/run.js battle` → **87 passing**; the full suite is **119 passing**.
`node tools/validate.js` → clean.

- `test-battle.js` — the maths: stage/accuracy tables, the stat formula, the damage pipeline
  against an independent reimplementation, STAB/weather/terrain/screens stacking, immunities,
  crit stages, accuracy with fog and Torch, status immunity and duration, toxic escalation,
  the capture formula against a hand-derived `a`, capsule tiers, XP, level curves, the
  difficulty table, and a completeness check that all 30 abilities, 25 gear and 39 effect
  kinds exist.
- `test-battle-ai.js` — tier shifting, seed determinism, type-advantage rate, PP respect,
  last-ditch fallback, smart switching rate, Overdrive discipline, heal items, side-effect-free
  previews, switch-in choice.
- `test-battle-effects.js` — 29 abilities/gear/effects exercised through real turns.
- `test-battle-flow.js` — 28 end-to-end scenarios driven through `engine.choose`: full battles,
  losses, forced switches, voluntary switches, catching, running, items, Overdrive, agents,
  difficulty, boss phases, chart rewrites, payouts, doubles, GUARD, arena rules, levelling,
  weather expiry, protect, multi-hit distribution, house rules, and 12 seeded auto-resolves
  that must all terminate.
- `test-battle-scene.js` — the scene renders every mode of a full trainer battle, a capture
  with the timing ring, and a three-phase boss fight without throwing, and consumes every event.
- `test-battle-fixtures.js` — shared throwaway species/moves/items (a no-op test registrar).

## 4. NEEDS (other workstreams)

Everything below is optional at runtime — the engine and scene degrade rather than throw.

- **data** — `MQ.Data.makeMonster(species, level, opts)` (I ship a fallback under
  `MQ.Battle.makeMonster` that delegates to yours the moment it exists); `MQ.Data.moves`
  with `overdriveOnly:true` signatures for the 26 ROSTER §2.15 ids (I carry a fallback table
  used only when the id is missing); `MQ.Data.abilities` declaring `{name, desc, impl:<id>}`
  for the 30 ids; `MQ.Data.items` with `kind`, `amount`, `cures`, `catchBonus`,
  `usableInBattle`; `MQ.Data.species` with `overdrive:<moveId>`, `growth`, `baseExp`,
  `catchRate`, `learnset`, `evolutions`; optionally `MQ.Data.temperaments` (I ship the 20).
- **content** — `MQ.Party.list`, `MQ.Inventory.{count, remove, addMoney, money, list()}`
  (`list()` should return `[{id, n}]` for the in-battle bag), `MQ.Trainer.{level, perks,
  addXp(n)}`, `MQ.Cats.trust.{meadow,bigboy}`, `MQ.Settings.{difficulty, battleSpeed,
  captureMode:'auto'|'timing'}`. Someone must consume `result.pending` (evolution prompts and
  the four-move replace flow) and apply escort HP for GUARD.
- **art** — `MQ.MonsterArt` with any of `get(id,{back,size})`, `sprite(id,back,size)` or
  `render(id,back,size)` returning a canvas; `MQ.FX.battleAnim(name, {side, move, eff, crit})`.
  Until then the scene draws seeded procedural creatures in type colours.
- **audio** — `MQ.Audio.playSong(id)` / `MQ.SFX.play(id)` for the ROSTER §7/§8 ids the scene
  already fires (`battle_wild battle_trainer battle_gym battle_boss`, `hit_super`, `crit`,
  `capsule_shake`, `overdrive_ready`, `agent_sleet` …).
- **story** — boss phase scripts go in `MQ.Story.bossScripts[name]` (or `npcScripts`);
  they run through `MQ.Script.run` and the engine waits for the promise.
- **world/ui** — set `agents_silent` for the Ch.7 lift and Ch.11 exchange; set
  `overdrive_unlocked` with Badge 1; pass `opts.signal` from the SIGNAL METER.

## 5. NEW IDS / fields (nothing renamed; all additive)

- **Move id** `last_ditch` — "Last Ditch", the out-of-PP fallback (typeless 40 power, ¼ recoil).
- **Perk ids** derived from SYSTEMS-SPEC §8's shape `perk_<branch>_<slug>`, one per named perk
  and second rank: `perk_triage_{focused, exploit, first_strike, overclocker, big_game, tracker,
  ambush, quick_draw, trailblazer, deep_cuts, sharp_triage, kill_chain}`,
  `perk_escalate_{containment, patch, steady, second_wind, isolation, umbrella_discipline,
  rollback, fail_safe_protocol, quiet_cat, cat_handler, bond, escalation, incident_commander}`,
  `perk_adjudicate_{enumerate, fingerprint, naturalist, timeline, steady_hand, soft_touch,
  golden_ratio, zero_trust, phase_break, sniper, ledger_keeper, trader, wide_share, iron_bell,
  attribution, overkill}`.
- **`trainer.house`** — the gym door rules as data:
  `{note, weather, terrain, permanent, turns, screens:'phys'|'spec', reboot:true,
    contactStatus:{status, chance}, jamAgent:{id, turns}, jamUntilSuper:true}`.
- **Effect field rename**: `screen` and `counter` take `screen:` / `what:` for the
  physical-or-special selector, because SYSTEMS-SPEC's `kind:` collides with the effect-type
  field of the same name. (`category:` also accepted.)
- **Battle weather `snow`** — the overworld's winter weather now seeds battles: Rock ×1.2,
  Water/Fire ×0.9, 1/16 end-of-turn chip to everything that is not Rock or Ground, and no
  natural thaw. Beyond SYSTEMS-SPEC §5, which lists four battle weathers.
- **Boss-phase fields**: `hpFrac` (as spec) *or* `atHp` (ENGINE-ARCHITECTURE's spelling),
  plus `turn`, `events`, `script`, `immune`, `skipIf`.
- **Move flag `windBoost:true`** for "×1.3 in Wind" moves such as *Packet Storm*.
- **`mon.typesOverride`** — a per-battle type override used by `changeForm` and *Borrowed Face*.

## 6. Known gaps

- **Balance is untuned.** Every formula is faithful, but with no `species.js` or `moves.js`
  the numbers have only been checked against synthetic fixtures. The §15 chapter targets want a
  balance pass once real data lands — `MQ.Battle.autoResolve({seed})` exists precisely for that.
- **Doubles are minimal** (2 v 2, single-target moves, `move.spread`/`target:'all_foes'` honoured).
  No ally-targeting menu, no redirection, and BIGBOY's `bigboy_shield` ally-shield upgrade is
  stubbed to the ordinary Brink until doubles get a proper targeting UI.
- **The bag in battle** lists `MQ.Inventory.list()` when it exists and otherwise shows a small
  hardcoded stock so the screen is testable. It needs the real inventory to be useful.
- **No browser verification.** Everything is headless-tested only, per the workstream rules;
  the scene needs a pass on a real device for touch-target sizing and animation pacing.
- **`MQ.FX.battleAnim` is called but never awaited** — move animations play for a fixed beat.
  If the art team wants variable-length animations, return a duration and I will honour it.
- **Sound-flag moves** rely on `move.flags.sound`; `contact`, `charge` and `protect_ok` likewise.
  The data team must set them or Silk Weave, Static Charge and Loud Bell go quiet.
