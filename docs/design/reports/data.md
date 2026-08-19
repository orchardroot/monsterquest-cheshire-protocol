# Workstream report — **data**

Branch `ws/data`. Files owned and delivered:

| File | Contents |
|---|---|
| `js/data/types.js` | 13 types, chart, `typeMultiplier`, matchup helpers, validators |
| `js/data/moves.js` | **170 moves** (ROSTER §2.1–2.15, incl. 3 boss-only and 26 Overdrive signatures) |
| `js/data/abilities.js` | **30 abilities** — name, desc, `impl` key, hook list, tuned `params` |
| `js/data/items.js` | **225 items** — every ROSTER §4 id plus the patterned collectibles/viewpoints/cat tokens |
| `js/data/species.js` | **172 dex species + 5 boss forms**, plus the whole monster-instance API |
| `js/data/dialogue.js` | **367 chatter lines** in 58 pools (12 archetypes, 38 towns, weather/phase/generic) |
| `tools/test/test-data.js` | registries, type chart, move/ability/item integrity, dialogue filtering |
| `tools/test/test-data-monsters.js` | stat & XP formulas, instances, levelling, evolution, capture |

`node tools/test/run.js data` → **35 passing, 0 failing**.
`node tools/validate.js` → clean apart from one pre-existing map problem (see NEEDS).

---

## 1. What's in it

### Types
Chart carried forward from v1. Added `typeOrder`, `typeName/typeColor`, `typeVs`,
`typeMatchups(defTypes)` (x4/x2/x0.5/x0.25/x0 buckets for the dex screen) and
`effectivenessText/Label`. The validator enforces multipliers ∈ {0, ½, 1, 2}, no
duplicate names, and a table of **intended asymmetric rivalries** so an accidental
chart edit fails the build rather than being argued about later. Normal is exempted
from the "must have a 2× matchup" rule by design.

### Moves
Every move carries `{name, type, cat, power, acc, pp, priority, crit, target, flags, effects, desc, anim}`.
Two contract deviations are reconciled *in the data* so neither consumer has to care:

* **`acc`** is `null` for never-miss (ENGINE §4). `MQ.Data.moveAcc(move)` returns `999`
  for those (SYSTEMS-SPEC §5). Use whichever you prefer.
* **Effects** use the SYSTEMS-SPEC §4 vocabulary (`multihit`, `cleanse`, `fixed`, …),
  and every fractional effect carries **both** `frac` (0–1) and `pct` (0–100); every
  targeted effect carries **both** `who` and `target`.

`anim` and `target` are derived, never hand-typed, so they can't drift.

### Abilities
Declaration only — the rules live in `js/battle/effects.js` keyed by `impl` (always `=== id`).
Each entry lists the **hooks** it needs (`onSwitchIn`, `onModifyDamage`, …) and a `params`
object holding every number from SYSTEMS-SPEC §2, so the battle layer never hard-codes
`0.75`, `1/16`, `3 turns` etc. Suppression contract: `Rootkit` sets `mon.abilityOff = 3`.

### Items
All 12 ROSTER kinds. Gear carries a structured `gearEffect` (`{kind:'typeBoost', type:'fire', mult:1.2}`
and so on) rather than prose. Capsules carry `catchBonus` plus a `conditional` block for the
situational ones. Skill Cards are `tm_<move_id>` with `teaches`; the eight gym cards carry `leader`.
`pocket` tells the bag UI which tab an item belongs in.

### Species
Base stats are hand-tuned per species with real spread (glass cannons, walls, speedsters);
BST bands are roughly low 225–310 · mid 390–460 · high 480–530 · legendary 590–620.
Each entry has: catch rate, base exp, growth group, ability (+ optional rare second),
**evolutions using every method** (level, item, friendship+time, location, time, trade, move,
weather), art-generator params `{body, size, feats, palette}`, dex `{genus, height, weight, text}`,
habitat, rarity, tier, Overdrive signature and generated `cry` params.

**Learnsets** are composed by a deterministic builder from per-type ordered move pools
scaled by tier, merged with 2–4 hand-written flavour/signature entries per species. Result:
11–14 moves each, always a level-1 move, always a second move by level ~5, never an
Overdrive-only move, never a duplicate. **TM lists** are type-matched plus deterministic
wildcards, minimum five cards per species.

### Dialogue
Pools are `arch_<archetype>` (kid, granny, walker, sysadmin, cultist, stuffer, farmer,
fisher, station, publican, trainer, tourist, ranger), `town_<mapid>` (38 towns/sites),
`weather_<kind>`, `phase_<kind>` and `generic`. Lines may be plain strings or
`{t, phase, weather, chapter, cond}` — the chapter and `cond` gates let the same NPC get
grimmer as the CUTOVER counter runs down.

---

## 2. Public API

```js
// types
MQ.Data.typeMultiplier(atkType, defTypes[]) -> number
MQ.Data.typeVs(atk, def) -> number       MQ.Data.typeMatchups(defTypes) -> {x4,x2,x05,x025,x0}
MQ.Data.typeName(id) / typeColor(id) / effectivenessText(mult) / effectivenessLabel(mult)

// moves / abilities / items
MQ.Data.moveAcc(move|id) -> 0-100 or 999      MQ.Data.moveEffect(move, kind) / moveHas(move, kind)
MQ.Data.movesOfType(type) / overdriveMoves() / moveSummary(move)
MQ.Data.abilityName(id) / abilityDesc(id) / abilitiesWithHook(hook)
MQ.Data.itemsOfKind(kind) / shopStock(kinds?) / trinkets() / tmForMove(moveId)
MQ.Data.itemSellPrice(id) / itemCures(id, status) / itemName(id)

// species & dex
MQ.Data.dexOrder[] , dexCount , speciesByNum(n) , speciesByHabitat(h) , speciesOfType(t)
MQ.Data.evolutionChain(id) -> [ids]           MQ.Data.preEvolutionOf(id)

// levels & stats  (SYSTEMS-SPEC §1, §12)
MQ.Data.expForLevel(growth, L) / levelForExp(growth, exp) / expToNext(growth, L, exp)
MQ.Data.expYield(foeSpeciesId, foeLevel, userLevel, {kind, traded, ledger, share, shareFrac})
MQ.Data.statsAtLevel(species|id, level, ivs, temperament) -> {hp,atk,def,spa,spd,spe}
MQ.Data.temperaments[] , temperament(id) , temperamentMult(id, stat) , traitWords(mon)

// monster instances
MQ.Data.makeMonster(speciesId, level, {ivs, ivFloor, temperament, ability, gear, moves,
        shiny, shinyOdds, friendship, nickname, metAt, rnd, seed, gift, exp, hp, tagged, traded})
MQ.Data.refreshStats(mon) / levelUp(mon) -> {level, learned[], stats}
MQ.Data.movesAtLevel(species, L) / learnableAt(species, L) / canLearn(species, moveId)
MQ.Data.canEvolve(mon, {item, map, time, weather, trade, knows}) -> evo|null
MQ.Data.evolve(mon, toId?) -> {from, to, species, learned[]}
MQ.Data.overdriveMoveFor(mon) / monName(mon)
MQ.Data.catchChance(mon, {capsuleBonus, trainerBonus}) -> 0-255   // SYSTEMS-SPEC §11 `a`

// dialogue
MQ.Data.chatter({town, archetype, phase, weather, chapter, seed|rnd, generic}) -> string
MQ.Data.chatterFor(npcId, opts) -> string   // stable for a given NPC + phase
MQ.Data.chatterLines(opts) -> [{text, weight, from}]
MQ.Data.archetypes() / chatterTowns() / chatterLineCount()
```

### Using it

```js
// a wild encounter
const foe = MQ.Data.makeMonster('flitchick', 6, {metAt:{map:'macclesfield', level:6, ts:Date.now()}});

// the starter
const starter = MQ.Data.makeMonster('silkin', 5, {gift:true, nickname:'Bobbin'});

// after a battle
MQ.Data.levelUp(starter);
const evo = MQ.Data.canEvolve(starter, {map: MQ.Overworld.state.map, time: MQ.Clock.phase});
if (evo) MQ.Data.evolve(starter, evo.to);

// a filler NPC
yield say(MQ.Data.chatterFor('npc_bollington_kev', {town:'bollington', archetype:'walker'}));
```

---

## 3. NEEDS

1. **`js/world/maps/_demo.js` line 93 uses `item: "potion"`, which is not a ROSTER id.**
   Now that `MQ.Data.items` is populated the world validator correctly rejects it, which
   fails `tools/validate.js` and three `test-map.js` cases. One-character-class fix for the
   world/maps owner: `"potion"` → `"salve"` (or `"tonic"`). I have not touched the file.
2. **battle** — implement `MQ.BattleEffects` handlers keyed by ability `impl` and by move
   effect `kind`. New effect kinds beyond ENGINE §4's example list are documented in §4 below.
3. **battle** — decide whether to read `move.acc === null` or `MQ.Data.moveAcc(m) === 999`;
   both work today.
4. **art** — `MQ.MonsterArt` should consume `species.gen = {body, size, feats[], palette[4], paletteId}`.
   24 palettes and ~60 body keywords are in use; the full vocabulary is derivable from
   `Object.keys` over the registry if you want a switch table.
5. **audio** — `species.cry = {wave, base, len, slide, noise, vib, gain}` is generated for all 177.
6. **data (encounters/trainers/quests owners)** — these are *not* mine per the task split;
   they will need `MQ.Data.makeMonster` for trainer parties and `species.habitat/rarity` for tables.
7. **content** — `MQ.Inventory` should treat `item.pocket` as the bag tab and `item.sellable`
   / `MQ.Data.itemSellPrice` for the mart.

## 4. NEW IDS

No new species, move, ability or item ids — every ROSTER id is implemented and none were added.
The following **effect kinds** extend ENGINE §4's example list (all are inside the
SYSTEMS-SPEC §4 spirit; the first four are genuinely new):

* `cooldown {turns}` — "usable every other turn" (Patch Tuesday).
* `weather_boost {w, mult}` — "×1.3 in Wind" (Packet Storm).
* `mimic_type` — the move takes the foe's primary type for damage (Borrowed Face).
* `restore_pp {all}` — Ada's Sysadmin's Reboot.
* `priority {delta}` — an effect-carried priority bump (Zoomies).
* Effects may carry `when: "<flag expression>"` evaluated against battle state
  (`weather.rain`, `!weather.rain`) — used by Brine Jet and Firebox Roar.

Registry kinds `held_consumable`, `brew` and `rod` come from ROSTER §4 and are additive to
ENGINE §4's shorter kind list. Item field `pocket` is new (UI convenience).

## 5. Known gaps

* **Temperament count.** SYSTEMS-SPEC §1 says "20 temperaments … with 4 neutral" but names
  18 + 4. All 22 named ones are implemented; somebody should fix the doc's arithmetic.
* **Ability assignment conflicts in ROSTER §1l.** A handful of species are listed under two
  abilities (`crossbell` salt_crust *and* loud_bell; `spearphish` honeypot *and* scavenger;
  `cryssal`/`salberg` salt_crust *and* fail_safe; `teramite` cold_storage *and* kernel_panic).
  I picked the more thematic one in each case and used the other as the rare second where the
  species already had a slot free. Trivial to flip if the design owner disagrees.
* **Learnsets are composed, not fully hand-written.** Every species gets 2–4 hand-picked
  signature/flavour entries and the rest comes from tier-scaled type pools. This is deliberate
  (it guarantees no dangling move ids and a sane level spread across 177 entries) but the
  flagship ~30 species would benefit from a hand pass once the battle engine exists to test against.
* **`catchChance` returns the raw `a` value 0–255**; the four-shake roll and the timing
  minigame multiplier belong to the battle/capture layer.
* **Boss forms** (`steamloco_overfired`, `glitchra_static`, `oracle_core_p2/p3`, `understudy`)
  are registered with `dexHidden:true` and `formOf`, and are excluded from `dexOrder`. Their
  BSTs deliberately exceed the normal 720 cap.
* **Shiny odds** are 1/512 via `MQ.Data.SHINY_ODDS`; the *Golden Ratio* perk should pass
  `shinyOdds: 2` to `makeMonster`.
