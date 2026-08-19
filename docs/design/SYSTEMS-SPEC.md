# MonsterQuest: The Cheshire Protocol — Battle & Systems Spec (v2.1, reconciled)

Scope: the turn-based core stays Gen-1-shaped (types, STAB, stages, status, catching, evolution, 4 moves, XP). **Types are the 13 of README/`js/data/types.js`: Normal, Fire, Water, Grass, Electric, Flying, Bug, Poison, Rock, Ground, Psychic, Ghost, Cyber** (no Ice/Dark/Steel — Freeze exists as a status from cold effects, not as a type). Chapter numbers are STORY-BIBLE chapters; the canonical id namespace is DESIGN-INDEX.md. Everything below is additive RPG depth, specified tightly enough to code in ES2015 with no allocations in the hot path (all lookups are static tables; per-battle state lives in plain objects created once at battle start).

---

## 1. Stats, traits, temperaments

**Six stats: `hp, atk, def, spa, spd, spe`.** Split `spc` into Special Attack / Special Defence. Justification: with abilities, held gear and a perk tree the single `spc` stat makes every special-attacker a wall for free (Gen-1's Psychic problem) and leaves no room for "glass cannon" vs "tank" special designs; a split gives 6 axes for temperaments to trade against, and Cyber (a special-leaning type) needs a defensive counterpart. Existing species get migrated by `spa = spc, spd = round((spc+def)/2)` as a starting point, then hand-tuned for ~30 flagship species.

**Stat formula (level L, base B, trait T 0–15, temperament multiplier N):**
- `hp = floor((2B + T) * L / 100) + L + 10`
- other = `floor((floor((2B + T) * L / 100) + 5) * N)`

**Traits (IV-like; the `ivs` field in ENGINE-ARCHITECTURE's monster instance, range 0–15).** Each monster rolls six integers 0–15 at creation. Traits are surfaced in the summary screen as flavour words rather than numbers ("Keen eyes" = high spe, "Thick coat" = high def, "Never misses breakfast" = high hp), unlocking numeric display at Trainer level 20. Story gifts (starter, MEADOW, BIGBOY, whistleblower gift) roll a floor of 8. Legendaries roll a floor of 10.

**Temperaments (natures).** 20 temperaments; each is `{up, down}` over `atk|def|spa|spd|spe` (×1.1 / ×0.9) with 4 neutral. Names are Cheshire-flavoured: *Brisk* (+spe −def), *Stubborn* (+def −spe), *Sharp* (+spa −atk), *Blunt* (+atk −spa), *Wary* (+spd −atk), *Bold* (+atk −spd), *Rash* (+spa −spd), *Patient* (+spd −spe), *Nosy* (+spe −spa), *Gruff* (+def −spa), *Mardy* (+atk −def), *Canny* (+spa −def), *Steadfast* (+spd −def), *Placid* (+def −atk), *Skittish* (+spe −atk), *Sly* (+spa −spe), *Solid* (+spd −spa), *Windy* (+spe −spd), plus neutral *Plain*, *Ordinary*, *Even*, *Fair*. Temperament also biases AI-side flavour lines and the "likes/dislikes" of Y Berllan snacks (a snack that matches `up` gives +2 friendship instead of +1).

**Friendship** 0–255 per monster (start 70; gifts 120). +1 per level-up, +2 per snack, +3 per gym win in party, −5 per faint, −10 per bitter medicine (Revive Salts). Drives friendship evolutions and the *Bond* perks.

---

## 2. Abilities (30)

Every species has one fixed ability (a few have a rare second on catch, 20%). Ability hooks: `onSwitchIn, onBeforeMove, onModifyDamage(dealt/taken), onAfterHit, onStatusApply, onEndTurn, onFaint, onWeather, onStageChange`.

| # | Ability | Rule |
|---|---|---|
| 1 | **Back from the Brink** | Once per battle, a hit that would KO from ≥50% HP leaves 1 HP. (BIGBOY, plus 2 rare species.) After the Y Berllan story (`bigboy_shield`) BIGBOY may instead spend it to shield an ally from one KO in doubles; cat trust T3 adds a 25% heal on trigger; *Fail-Safe Protocol* perk lets it fire twice. |
| 2 | **Slipstream** | +1 spe stage on switch-in. (MEADOW line.) |
| 3 | **Silk Weave** | Contact moves against this monster have 30% to drop the attacker's spe by 1. |
| 4 | **Brine Body** | Immune to Burn; heals 1/16 max HP per turn in Rain. |
| 5 | **Salt Crust** | Takes ×0.75 from Rock/Ground; loses it while Wet (see terrain). |
| 6 | **Firebox** | Fire moves ×1.5 when HP ≤ 1/3. |
| 7 | **Overclock** | Cyber moves ×1.3; takes 1/16 max HP recoil each time a Cyber move hits. |
| 8 | **Sandbox** | Immune to Poison and Toxic; Poison-type moves used against it deal ×0.5. |
| 9 | **Rootkit** | On switch-in, foe's ability is suppressed for 3 turns. |
| 10 | **Honeypot** | If targeted by a status move, the user of that move loses 1 stage of its highest attacking stat instead. |
| 11 | **Proxy Fog** | Sets Fog for 4 turns on switch-in. |
| 12 | **Rain Caller** | Sets Rain for 5 turns on switch-in (Cheshire default weather, obviously). |
| 13 | **Ridge Wind** | Sets Wind for 4 turns on switch-in. |
| 14 | **Damp Squib** | Fire moves against this monster deal ×0.5 while Rain is up. |
| 15 | **Thick Fleece** | Water/Wind chip damage nullified; takes ×0.9 from special moves. (SHEEPWIRE line.) |
| 16 | **Iron Will** | Cannot be Flinched; cannot have stats lowered by foe. |
| 17 | **Nightshift** | +1 priority on status moves at night (game-clock night band 21:00–05:00, SIDE-CONTENT §2.10). |
| 18 | **Cheshire Grin** | 25% chance any hit dealt confuses the target. (GRINMALKIN.) |
| 19 | **Deep Roots** | Immune to forced switches; heals 1/8 max HP at end of turn on Grass terrain. |
| 20 | **Static Charge** | Contact against this monster: 30% Paralysis. |
| 21 | **Signal Jammer** | Foe's moves with `charge` fail 30% of the time. |
| 22 | **Scavenger** | On KOing a foe, heals 1/4 max HP. |
| 23 | **Wetlander** | ×1.5 spe in Rain. |
| 24 | **Sun Trap** | ×1.5 spa in Sun. |
| 25 | **Cold Storage** | Cannot be Frozen or Slept while HP > 1/2. |
| 26 | **Payload** | The first damaging move it uses each time it enters battle deals ×1.5. |
| 27 | **Fail-Safe** | When HP first drops below 1/4, +2 def and +2 spd. |
| 28 | **Loud Bell** | Sound moves ×1.3; immune to sound moves. (Sandbach line.) |
| 29 | **Stonemason** | Rock moves ×1.2, and Rock moves never miss in Wind. |
| 30 | **Kernel Panic** | On faint, the foe that KO'd it loses all PP on the move used. |

Ability suppression (`Rootkit`) sets `mon.abilityOff = 3` and every hook checks it first.

**Agent traits (not species abilities):** *Hardened* — set on SLEET/VIGIL/ARBITER by the Wipe choice (`agents_hardened`): immune to ORACLE's `silence`/`jamAgents` in the Ch.7 boat-lift and Ch.11 scripts (they keep talking, and stay usable). *Tapped* — the Feed state: agents unchanged, but GLITCHRA's opening move is scripted to counter the player's lead.

---

## 3. Held items / gear (25) and consumables

Each monster has one `held` slot. Consumable held items are removed on use (`held = null`, logged).

**Gear (permanent):**
1. **Silk Scarf** — same-type (STAB) moves ×1.1. 
2. **Brine Charm** — Water moves ×1.2. 
3. **Ember Coal** — Fire moves ×1.2. 
4. **Copper Coil** — Electric ×1.2. 
5. **Cipher Lens** — Psychic ×1.2. 
6. **Patch Cable** — Cyber ×1.2. 
7. **Walker's Boots** — spe ×1.5, but only the first move selected can be used (locks like a choice item; unlocks on switch). 
8. **Heavy Anvil** — atk ×1.3, spe ×0.5. 
9. **Kevlar Waistcoat** — takes ×0.9 from physical, ×0.9 from special; cannot use Overdrive. 
10. **Rail Pass** — user's switch-out is +priority (always escapes/switches first). 
11. **Lucky Coin** — crit stage +1. 
12. **Focus Band (Bollington)** — 10% chance to survive a KO at 1 HP (stacks after Brink). 
13. **Toxic Sachet** — contact against holder 30% Poison. 
14. **Rusty Nail** — contact against holder deals 1/8 max HP to attacker. 
15. **Umbrella (Cheshire issue)** — holder ignores Rain/Fog effects on itself. 
16. **Weathervane** — weather set by holder lasts 8 turns instead of 5/4. 
17. **Ledger** — XP ×1.5 for holder. 
18. **Cat Bell** — friendship gains ×2; +1 evasion stage on switch-in vs wild only. 
19. **Warm Blanket** — cures Freeze/Sleep at end of turn (not consumed) once per battle. 
20. **Torch** — holder's accuracy ignores Fog. 

**Consumable held:**
21. **Damson** — restores 1/4 max HP when HP ≤ 1/2. 
22. **Perry Flask** — cures any status when it is applied. 
23. **Elm Sap** — when HP ≤ 1/4, +1 to highest attacking stat. 
24. **Salt Lick** — restores 10 PP to first move to hit 0. 
25. **Toffee (Everton)** — cures Confusion, then heals 1/8. 

**Battle consumables (bag):** Potion tiers (Salve 20 / Tonic 60 / Elixir 120 / Full Restore all+status), Antidote-class cures per status, **Revive Salts** (½ HP, −friendship), **Boombox** (flee wild guaranteed), **Rain Jar / Sun Lamp / Fog Machine / Wind Whistle** (set weather 5 turns, once per battle — *Rain Jar* is distinct from the *Rain Cloak* trainer trinket in SIDE-CONTENT §4), **Stat Tonics** (+1 stage, atk/def/spa/spd/spe/acc; Nantwich brine sells them), **X-Ray Card** (reveal foe's moves & ability, 1 use). Using a bag item costs the turn; the AI at *smart* tier reads item use as a free hit.

**Side-content gear (SIDE-CONTENT casebook/arena/brewing rewards; same `gear` slot):** *Silk Wrap* (burn damage halved), *Hide Plate* (takes ×0.75 from Rock), *Firebox Charm* (Fire ×1.1), *Beacon Ember* (Fire ×1.2 at night), *Wool Cap* (trainer trinket, cold buff — not a held item), *Salt Lantern* (key item toggle), and the eight leaders' tier-5 **Anchor** items (`anchor_packet` … `anchor_admin`: the leader's type ×1.2 and immunity to that badge's house-rule terrain/weather). **Brews** (SIDE-CONTENT §2.5) are bag consumables: *Perry* and *Clarifier* usable in battle; the rest apply a pre-battle buff with a one-battle or real-time duration.

---

## 4. Move effects schema

A move is `{name, type, cat:'phys'|'spec'|'status', power, acc, pp, priority, flags:{contact,sound,charge,recharge,protect_ok}, crit:0|1|2, effects:[Effect,...]}` — field names follow ENGINE-ARCHITECTURE §4 (`cat` not `kind` for the category; effect objects use `kind` for the effect type, `who:'self'|'foe'` for the target, and integer percentages `pct` where this section says a fraction). `effects` are applied in order after the hit resolves (or immediately for status moves). Every effect has an optional `chance` (default 100) and `who:'self'|'foe'`. The list below is the full effect vocabulary; ENGINE-ARCHITECTURE's example list is a subset of it (its `multi` = `multihit`, `cure` = `cleanse`, `levelDamage` = `fixed {amount:'level'}`, `confuse` = `status cnf`, `leech` = `drain`).

**Effect types (`kind`):**
- `damage` — standard formula (implicit for power > 0). 
- `status` `{status:psn|tox|par|brn|slp|frz|cnf, chance}` 
- `stage` `{stat, delta, target, chance}` (stat ∈ atk def spa spd spe acc eva) 
- `heal` `{frac}` of max HP 
- `drain` `{frac}` of damage dealt healed 
- `recoil` `{frac}` of damage dealt 
- `multihit` `{min,max}` (2–5 with 3/8,3/8,1/8,1/8; each hit rolls crit) 
- `flinch` `{chance}` (only if user moves first) 
- `protect` (fails consecutively: chance halves each repeat) 
- `charge` `{turns:1, semiInvuln?:bool}` 
- `recharge` (skip next turn) 
- `weather` `{w:rain|sun|fog|wind, turns}` 
- `terrain` `{tr:grass|wet|salt|static|silk, turns}` 
- `fixed` `{amount}` or `{amount:'level'}` 
- `ohko` (acc = 30 + userLvl − foeLvl, fails if foe higher level) 
- `crit_only`, `never_miss`, `high_crit` (crit stage +1 or +2) 
- `weight`/`hp_scaled` `{mode:'foeHpFrac'|'userHpFracInverse'}` power scaling 
- `force_switch` (wild: ends battle) 
- `trap` `{turns:4}` (no switch, 1/8 chip) 
- `screen` `{kind:phys|spec, turns:5}` (halves incoming) 
- `cleanse` (remove own status/stages) 
- `counter` `{kind:phys|spec, mult:2}` 
- `overdrive` `{gain}` (bonus meter) 
- `agent` (calls an Agent Trio ability if off cooldown; used only by scripted bosses) 
- `swap_stats` `{a,b}`, `copy_stages`, `sleep_talk`, `rest` (self slp 2, full heal), `endure`, `taunt` (status moves locked 3 turns), `pp_drain {n}`.

**15 example moves (Cyber emphasis):**

| Move | Type/Kind | Pow/Acc/PP | Effects |
|---|---|---|---|
| Phish Hook | Cyber/spec | 55/95/20 | `stage spa −1 foe 30%` |
| Brute Force | Cyber/phys | 25/90/15 | `multihit 2–5`, `contact` |
| Ransom Note | Cyber/status | —/85/10 | `status tox`, `trap 4` |
| Zero-Day | Cyber/spec | 110/80/5 | `charge 1`, `stage spd −1 self` |
| Patch Tuesday | Cyber/status | —/—/10 | `heal 0.5 self`, `cleanse self`, only usable every other turn |
| Firewall Up | Cyber/status | —/—/15 | `screen spec 5`, `overdrive +10` |
| Packet Storm | Cyber/spec | 70/100/15 | `weather wind 4` on hit; ×1.3 in Wind |
| Rootkit Bite | Cyber/phys | 65/100/15 | `contact`, `stage eva −1 foe 100%` (reveals) |
| Cheshire Fade | Ghost/status | —/—/10 | `stage eva +1 self`, `terrain silk 5` |
| Brine Jet | Water/spec | 80/100/10 | `weather rain 5` if not raining, else `stage spe +1 self` |
| Salt Grind | Rock/phys | 75/95/15 | `terrain salt 5`, `high_crit` |
| Firebox Roar | Fire/spec | 90/100/10 | `sound`, `status brn 20%`, `recharge` if used in Rain |
| Signal Box | Electric/status | —/—/10 | `terrain static 5`, `stage spe +1 self` |
| Elm Press | Grass/phys | 85/100/10 | `drain 0.5`, `contact` |
| White Nancy Stand | Normal/status | —/—/5 | `endure`, `overdrive +25` |

---

## 5. Accuracy, evasion, crits, weather, terrain

**Hit check:** `hitChance = moveAcc × stageMult(acc − eva clamped ±6) × weatherMod × abilityMod`. Acc/eva stage multiplier: `3/(3+n)` or `(3+n)/3` (Gen-3 style). Fog: −25% accuracy for moves ≠ `never_miss` unless user holds Torch. `acc: 999` = never miss.

**Crits:** crit stage 0→1/24, 1→1/8, 2→1/2, 3+→always. `high_crit`, Lucky Coin, and *Focused* perk stack stages. Crit ×1.5, ignores negative attacker stages and positive defender stages.

**Weather (Cheshire set, 5 turns default; ability-set 4/5, Weathervane 8):**
- **Rain** — Water ×1.5, Fire ×0.5, Wetlander/Brine Body procs, Fog cannot coexist.
- **Sun** (rare — an event) — Fire ×1.5, Water ×0.5, Sun Trap; Frozen thaws at turn end.
- **Fog** (residential-proxy fog; Credential Stuffers) — accuracy −25%, evasion stages ignored, Ghost/Cyber ×1.2. 
- **Wind** (Peak fringe/Frodsham/Beeston) — Flying ×1.3, `charge` moves complete instantly, Rock/Ground never miss with Stonemason, 1/16 chip to Bug and Flying at end of turn... except Flying is exempt (Bug only) — designers: keep it Bug only, Flying gets the ×1.3.
- Overworld weather seeds battle weather (a battle started in overworld rain begins with Rain, 8 turns).

**Terrain (5 turns, replaces previous):** **Grass** (Grass ×1.3, grounded heal 1/16 for Deep Roots), **Wet** (Electric ×1.3 vs grounded, Salt Crust off, Fire ×0.8), **Salt** (Rock ×1.3, cures Poison on switch-in, Water ×0.9), **Static** (Electric ×1.3, sleep cannot be applied), **Silk** (priority moves fail against grounded targets, Bug ×1.3). Terrain is drawn as a coloured floor band in the battle scene.

---

## 6. Agent Trio as cooldown abilities

Agents are a separate battle menu, **AGENTS**, always available once obtained. Each is a cooldown ability with a Trainer-level-scaled effect and a per-battle "charge count" of ∞ but a **cooldown in turns**. Using an agent consumes the player's action for the turn (except ARBITER at high level).

| Agent | Base effect | Cooldown | Perk-scaled |
|---|---|---|---|
| **SLEET** (triage) | Reveals foe's moves, ability, held item; foe spe −2. | 4 turns | Lv15: also reveals HP numbers permanently; Lv30: adds `acc −1` foe. |
| **VIGIL** (escalation) | Active mon: cure all status, heal 40% max HP. | 5 turns | Lv15: 60%; Lv30: also cures Confusion and clears own negative stages. |
| **ARBITER** (adjudication) | Reset all stat stages on both sides; clear weather and terrain. | 6 turns | Lv20: does not consume the turn (priority action, then a move); Lv35: foe's next move fails if it is a status move (`taunt 1`). |

| **PIPPIN** (Custody only, `agent_pippin`) | **Defer**: the foe's next action is delayed one turn (it moves last next turn and its priority is treated as −1). | 6 turns | Lv40: also `stage spe −1 foe`. Menu id `agent_pippin_defer`. |

Cooldowns tick at end of turn; start at 0 each battle. Each perk branch has one *agent node* that shortens its agent's cooldown (§8): *Sharp Triage* (SLEET −1), *Escalation* (VIGIL −1), *Iron Bell* (ARBITER −2); the Y Berllan choice refunds and re-specs those three nodes. Boss scripts may **jam** agents for N turns (ORACLE, THE STACK, Mo) and story scripts may **silence** them (Ch.7 boat lift, Ch.11) — *Hardened* agents ignore silence. Difficulty *Hard* adds +2 to all cooldowns. Agents unlock SLEET Ch.1, VIGIL Ch.2, ARBITER Ch.3.

---

## 7. OVERDRIVE meter

Per-monster meter 0–100, resets each battle. The meter appears after Badge 1 (`overdrive_unlocked`, Ch.2); before that it is hidden and does not fill. Gains: +8 taking a hit, +12 taking a super-effective hit, +6 dealing damage, +15 when an ally faints, +20 landing a KO, plus move `overdrive` effects. Some gear/perks modify gain. At 100, the **OVERDRIVE** menu option lights up: using it fires the species' **signature move** (each evolutionary line has one, ~130 total, defined like normal moves with `overdriveOnly:true`, typically power 120–150 or a big status swing; MEADOW: *Zoomies* — priority +2, 3 hits, spe +1; BIGBOY: *Brink Roar* — heal 50%, def/spd +1, foe atk −1). Overdrive moves ignore `protect`, cannot miss, do not use PP, and drain the meter to 0. Enemy monsters at *greedy*/*smart* AI tiers and all bosses also build Overdrive (visible small bar), so the player can plan around it (e.g. switch or Protect on the turn it fills). Kevlar Waistcoat disables it.

---

## 8. Trainer level & perks

The trainer has a level 1–50 with its own XP: +1 per wild win, +5 per trainer win, +25 per gym, +10 per quest stage, +2 per catch, +1 per new dex entry, +3 per bounty, +2 per scored photo, +2 per brew (SIDE-CONTENT sources). Every level grants 1 **perk point** (5 more come from Casebook Marks/quests); three trees of 10 perks each (unlock rows every 5 levels), plus passive **Trainer Level effects**: catch rate +1% per level (cap +30%), obedience cap for traded/gifted monsters `10 + 2×TL`, numeric traits at TL20, trinket slots at TL20 and TL35.

The three branches are named for Jim's job and mirror the Agent Trio (STORY-BIBLE §6). Ids are `perk_<branch>_<slug>`.

- **TRIAGE** (SLEET — offence, speed, scouting): *Focused* (crit stage +1 for all), *Exploit* (super-effective ×2.2 instead of 2), *First Strike* (+10% dmg turn 1), *Overclocker* (Overdrive gain ×1.25), *Big Game* (dmg ×1.1 vs bosses), *Tracker* (encounter table shown per tile; *Ambush*: +1 spe stage vs wild on turn 1), *Quick Draw* (first move +1 priority once per battle), *Trailblazer* (run speed +8% overworld; *Deep Cuts*: recoil halved), **agent node *Sharp Triage*** (SLEET cooldown −1), capstone *Kill Chain* (each KO +1 atk/spa stage that battle; ignore foe positive stages on the KO turn).
- **ESCALATE** (VIGIL — healing, status, the cats): *Containment* (status inflicted on you lasts 1 turn less), *Patch* (bag heals ×1.25), *Steady* (own negative stages halved), *Second Wind* (switch-in heals 1/16), *Isolation* (switching out never eats a free hit; *Umbrella Discipline*: party ignores Fog), *Rollback* (revert one faint per gauntlet/arena run), *Fail-Safe Protocol* (Brink works twice per battle for BIGBOY; *Quiet Cat*: MEADOW's Slipstream is +2), *Cat Handler* (trust gain ×1.5; *Bond*: friendship gains ×1.5), **agent node *Escalation*** (VIGIL cooldown −1, heal +10%), capstone *Incident Commander* (all party +1 def/spd when a monster faints).
- **ADJUDICATE** (ARBITER — stat control, catching, information, boss phase breaks): *Enumerate* (see foe moves), *Fingerprint* (foe ability and traits visible; *Naturalist*: own traits/temperament shown), *Timeline* (turn order shown), *Steady Hand* (capture timing window ×1.5), *Soft Touch* (capsule bonus +0.2; *Golden Ratio*: rare-palette odds ×2), *Zero Trust* (ignore foe positive stages), *Phase Break* (boss phase-transition heal cap 30% → 15%; *Sniper*: crit ×2), *Ledger Keeper* (money ×1.25; *Trader*: shops −10%; *Wide Share*: non-participant XP 75%), **agent node *Iron Bell*** (ARBITER cooldown −2), capstone *Attribution* (once per battle copy the foe's stat stages; *Overkill*: Overdrive carries over 25%).

Perks in parentheses after a semicolon are the same node's second rank (rows unlock at TL 1/5/10/15/20/25/30/35/40/45). Perks are respec-able for Casebook Marks at any Care centre's casebook desk; the Wipe/Feed choice at Y Berllan re-specs the three agent nodes for free.

## 9. Boss battles and gym leaders

**Boss data:** `{phases:[{hpFrac, script:[Event]}], jamAgents?, arenaWeather, arenaTerrain, cannotCatch, overdriveStart}`. Events fire once when the boss's active mon crosses `hpFrac` (or on `turn N`): `say`, `setWeather`, `setTerrain`, `healSelf {frac}`, `boostSelf {stages}`, `summonAdd {species,level}` (a 2-v-1 for that phase — enemy gets a second slot that acts after the boss), `changeForm {speciesId, keepHp}` (GLITCHRA), `disableMove {name} 2`, `jamAgents 3`, `silenceAgents` (story silence; Hardened ignores), `rewriteChart {atk, def, mult}` (Mo), `forceOverdrive`, `skipPhase` (Q25 mercy: TERRATAUR has one fewer phase when `case_25_pup_returned`). Bosses have Overdrive start > 0 and phase transitions grant them a full turn heal-cap of 30%. Bosses use `smart` AI regardless of difficulty.

**Gym leaders** (canonical order, badge ids and Skill Card rewards — the leader's `tm` in ENGINE trainer data):

| # | Ch. | Town | Leader | Type | Badge / flag | Skill Card (TM) reward | Ace lvl |
|---|---|---|---|---|---|---|---|
| 1 | 2 | Wilmslow | Sysadmin Ada (she) | Electric | PACKET `badge_packet` | *Live Rail* (Electric/spec 80/100/15, par 10%) | 16 |
| 2 | 3 | Knutsford | Madam Gaskell (she) | Psychic | CIPHER `badge_cipher` | *Cranford Whisper* (Psychic/spec 75/100/15, foe spd −1 20%) | 20 |
| 3 | 4 | Congleton | Bearward Otis (he) | Normal/Ground | BEAR `badge_bear` | *Bear Hug* (Normal/phys 80/100/15, contact, trap 4) | 24 |
| 4 | 5 | Crewe | Stoker Di (she) | Fire | KERNEL `badge_kernel` | *Firebox Roar* | 28 |
| 5 | 6 | Nantwich | Brine Nell (she) | Water | TOKEN `badge_token` | *Brine Jet* | 32 |
| 6 | 7 | Northwich | Foreman Jack (he) | Rock | DAEMON `badge_daemon` | *Salt Grind* | 36 |
| 7 | 9 | Runcorn | Chemist Ria (she) | Poison | PROXY `badge_proxy` (+ Proxy Goggles) | *Proxy Cloud* (Poison/status —/—/10: weather fog 5, foe tox 30%) | 43 |
| 8 | 10 | Warrington | Netrunner Mo (she) | Cyber | ADMIN `badge_admin` (+ `all_badges`) | *Zero-Day* | 47 |

Each leader has a **house rule** displayed on the gym door:
- Wilmslow (Ada, Electric): Static terrain permanent; **Sysadmin's Reboot** — once per battle, restores all stages and PP of her active mon.
- Knutsford (Gaskell, Psychic): all monsters start with `screen spec 5`; on her last mon, Fog. 
- Congleton (Otis, Normal/Ground): 2-v-1 first phase (bear + keeper). 
- Crewe (Di, Fire): Sun set on turn 1; her signature loco changes form at 50% (charge → recharge phase). 
- Nantwich (Nell, Water): permanent Rain; healing 1/16 each turn for her Brine Body team. 
- Northwich (Jack, Rock): Salt terrain; Foreman's Whistle summons an add at 40%. 
- Runcorn (Ria, Poison): all her contact hits carry `tox 20%`; her arena disables VIGIL for the first 3 turns. 
- Warrington (Mo, Cyber): three phases across her NOC and the Transporter Bridge gondola; each phase **rewrites one row of the type chart** for the arena (`rewriteChart` boss event: e.g. Cyber resists Water for the phase); jams **all** agents until you land a super-effective hit; her ace runs Overclock and starts with 50 Overdrive.

**Other set-piece battles (STORY-BIBLE):** VEX (rival, Ch.1/3/8/12; smart AI; the Ch.12 team is hand-built under Verify, ORACLE-tuned under Challenge); the APT boss at Crewe (Ch.5, one scripted lap); Kellan at the lido (Ch.6, permanent Rain, steam heals both sides 1/16); the Understudy (AMOS; `changeForm` each phase; Ch.8/9/12/post-game); ROOT (Ch.11, wants to lose: her AI drops to *greedy* in phase 3; `root_defeated` gates the league); GLITCHRA (Ch.11, 3 phases via `changeForm`, faster/shorter or calmer/longer per `invoice_holder`; Feed makes its opening move counter your lead); the White Hats (Ch.12) — each is a **pre-battle party check** then a smart 6-v-6: Sue `no_tagged_or_tuned` (party contains no ORACLE-tuned/tagged monsters — VEX's starter line, GLITCHRA), Raj `full_hp_no_status` at the Northgate, Kim `bag_impounded` (key items and unregistered gear removed for the gauntlet), Doc `four_distinct_types` (≥4 species with pairwise distinct types); Champion VEX at the amphitheatre (`champion_result` won/lost/thrown — a deliberate loss with a healthy party sets `thrown`).

Rematches use SIDE-CONTENT §2.3's ladder: tiers 0–5, +5 levels per tier, one new team member per tier, held item/trait at tier 3, full six at tier 5 with the leader's *Anchor* item as the reward; available after 1 real day or 30 game-days.

---

## 10. Enemy AI tiers

`aiTier` per trainer (wild: `random`, route trainers: `greedy`, leaders/bosses/VEX/White Hats: `smart`; difficulty can shift tiers up).

- **random** — uniform over moves with PP; never switches, never items. 
- **greedy** — scores each move: `expectedDamage × hitChance`, +30 if it KOs, status move +15 if foe unstatused and it is turn 1–2, stat-up +10 if HP > 60%; picks argmax with 20% chance to pick second-best. Uses a heal item if HP < 25% and has one (max 2). 
- **smart** — greedy scoring plus: switch out if current matchup takes ×2 and it has a resist (weighted 40%), Protect when foe Overdrive ≥ 100, sets weather/terrain if any team member benefits, saves Overdrive for when the player's active mon HP > 50%, targets low-HP switch-ins with priority, and reads bag-item turns as free stat-up turns. Adds a 1-turn "memory" of the player's last move for `counter`.

---

## 11. Capture skill and capsule tiers

**Base formula:** `a = (3M − 2H) × rate × capsuleBonus × statusBonus × trainerBonus / (3M)`; roll 4 shakes each passing if `rand < a`. status: slp/frz ×2.5, others ×1.5. 

**Timing minigame — OFF by default** (Settings → "Capture: Auto / Timing"). When on: after the throw, a ring shrinks over 1.2s; tapping/pressing A in the green band (width scaled by *Steady Hand*) multiplies `a` by 1.5; the yellow band ×1.15; a miss ×1.0 (never worse than Auto). Auto mode applies a flat ×1.1 so it is never punished. Haptic pulse on the green band.

**Capsule tiers:** Basic ×1, Mesh ×1.5, Kernel ×2, Root (guaranteed, story-limited, 3 in the game); plus situational: **Net Capsule** ×3 on Cyber/Bug, **Night Capsule** ×3 at night, **Brine Capsule** ×3 on Water/in Rain, **Quick Capsule** ×4 turn 1 else ×1, **Friend Capsule** ×1 but caught mon starts at 150 friendship, **Heavy Capsule** +bonus by base HP. Capture XP goes to the party (see 12). Legendaries have `rate 3` and can be **re-attempted after a whiteout** at the same site (their one-shot flag becomes "fled to another landmark" and they respawn on a rotation).

---

## 12. XP, level curve, evolution

**XP gain:** `base = floor(baseExp × L_foe / 5)`; trainer battles ×1.5; boss ×2. Distributed: 100% to each participant (participants tracked in a Set-like array), 50% to non-participants (**XP share on by default**, toggleable; *Wide Share* perk raises non-participant share to 75%). Ledger held ×1.5. Traded/gifted monsters ×1.2. Levelling above the foe by 10+ scales gain by `(2L_foe+10)/(L_foe+L_user+10)` to blunt over-levelling.

**Level curve:** three growth groups per species: Fast `0.8L³`, Medium `L³`, Slow `1.25L³` (cap 100). Cats are Medium.

**Evolution methods:** `{method:'level',at}`, `{method:'item', item}` (Silk Cocoon, Salt Crystal, Copper Coil, Cipher Chip, Elm Sap Vial), `{method:'friendship', min:200, time?:'day'|'night'}`, `{method:'location', map}` (Edge Caverns → shadow forms; Anderton lift → aquatic; Jodrell → Cyber variants; Y Berllan → orchard forms), `{method:'time', at, time:'night'}`, `{method:'trade'}` (in-game NPC trades only), `{method:'move', knows}`, `{method:'weather', w:'rain', at}`. Evolution can be cancelled with B and re-offered on next level. Evolving preserves traits, temperament, friendship, held item, Overdrive signature changes to the new form's.

---

## 13. Difficulty settings

Selectable at new game and in Settings (changes apply next battle; achievements record the lowest tier used):

| | Story | Normal | Hard | Nightmare |
|---|---|---|---|---|
| Enemy levels | −10% | 0 | +10% | +20% |
| AI tier shift | −1 | 0 | +1 | +1, all trainers smart |
| Agent cooldowns | −1 | 0 | +2 | +3, agents jammed in gyms |
| XP share | 100% | 50% | 50% | 25% |
| Bag in trainer battles | ✓ | ✓ | max 3/battle | ✗ |
| Whiteout | keep money | lose 10% | lose 25% + 1 rand item | lose 50% |
| Capture | ×1.3 | ×1 | ×1 | ×0.85 |
| Boss Overdrive start | 0 | 25 | 50 | 75 |

---

## 14. Exact damage formula and stage multipliers

```
L   = attacker level
P   = move power (after hp_scaled/weight/wind/etc. modifiers)
A   = attacker atk or spa × stageMult(±6) (crit ignores negative)
D   = defender def or spd × stageMult (crit ignores positive)
base = floor(floor(floor(2L/5 + 2) * P * A / D) / 50) + 2
dmg  = base
       × weather (1.5/0.5/1.2/1.3 or 1)
       × terrain (1.3/0.9/0.8 or 1)
       × crit (1.5; Sniper 2.0)
       × roll (85..100 / 100)
       × STAB (1.5; ×1.1 more with Silk Scarf)
       × typeMultiplier (0/0.25/0.5/1/2/4; Exploit: 2→2.2)
       × burn (0.5 for physical if attacker burnt, not Brine Body)
       × screen (0.5)
       × ability/item modifiers (multiply, order-independent, floor at end)
       × difficulty (player dealt ×1 always; enemy dealt ×0.9/1/1.1/1.2)
dmg = max(1, floor(dmg))  unless typeMultiplier == 0 → 0
```

Stat stage multiplier (atk/def/spa/spd/spe): stage n ∈ [−6, 6]: `n ≥ 0 ? (2+n)/2 : 2/(2−n)`. Acc/eva: `n ≥ 0 ? (3+n)/3 : 3/(3−n)`. Status: Paralysis spe ×0.5 (25% full-para), Burn 1/16 + physical halved, Poison 1/8, Toxic n/16 escalating, Sleep 1–3 turns, Freeze 20% thaw/turn (Fire hit thaws), Confusion 2–5 turns 33% self-hit at power 40 typeless physical. Speed tie: coin flip. Turn order: priority bracket → effective spe (Rail Pass switch first) → coin.

---

## 15. Balancing targets by chapter

Chapters and level bands are STORY-BIBLE's (wild/trainer range for the chapter's main path); the gym ace sits two above the top of the band.

| Ch | Story beat | Wild lvl | Trainer lvl | Gym ace / boss | Party size expected | Notes |
|---|---|---|---|---|---|---|
| 1 | Silk and Static — Macclesfield, Bollington (no gym) | 3–8 | 4–9 | VEX 8 (canal) | 3 (starter + MEADOW + BIGBOY) | SLEET; held items from Q1; no Overdrive yet |
| 2 | The Wheel and the Edge — Wilmslow PACKET, Styal, Lindow, Alderley | 8–14 | 10–15 | Ada 16 | 3–4 | VIGIL; Overdrive unlocks with Badge 1; night tables begin |
| 3 | Picnic Blankets — Knutsford CIPHER, Tatton, Rostherne | 13–18 | 14–19 | Gaskell 20; VEX 17 | 4 | ARBITER; Kellan's first sermon; Gaskell rumour drops |
| 4 | The Dish Goes Dark — Holmes Chapel, Jodrell gate, Congleton BEAR | 17–22 | 18–23 | Otis 24 (2-v-1 phase) | 4 | SIGNAL METER, CUTOVER 38; first AMOS glimpse |
| 5 | Puppets on the Line — Sandbach, Crewe KERNEL | 21–26 | 22–27 | Di 28; APT boss 27 | 4–5 | Stuffer fog boss; Railcard; first Cyber gear |
| 6 | Brine and Perry — Nantwich TOKEN, Y Berllan | 25–30 | 26–31 | Nell 32; Kellan 30 | 5 | ClickFix boss in Rain; no encounters at Y Berllan; Wipe/Feed |
| 7 | Salt — Middlewich, Winsford, Northwich DAEMON, Anderton | 29–34 | 30–35 | Jack 36; TERRATAUR 36 (uncatchable here) | 5 | AMOS wearing Alder; agents silenced at the lift |
| 8 | The Ruin — Delamere, Tarporley, Beeston (no gym) | 33–37 | 34–38 | Understudy/VEX 38; ZEPHYRION 38 (seen) | 5–6 | fog at night; Verify/Challenge; doubles begin under Verify |
| 9 | Bridge Traffic — Frodsham, Runcorn PROXY, THE STACK | 36–41 | 37–42 | Ria 43; STACK constructs 40–44 | 6 | Proxy Goggles; eight doors; breaker (counter STOPPED) |
| 10 | Draw Your Own Conclusions — Lymm, Warrington ADMIN | 40–45 | 41–46 | Mo 47 (3 phases) | 6 | all agents jammed intro; type chart rewrites; `T-3` |
| 11 | The Sky Is Quiet — Jodrell Bank | 44–50 | 46–51 | ROOT 50; GLITCHRA 54 (3 phases) | 6 | ORACLE finale; the plug (Delete/Quarantine/Custody) |
| 12 | THE FIREWALL — Chester | 48–56 | 52–57 | White Hats 54–57; VEX ace 60 | 6 | pre-battle checks; full smart AI; Overdrive start 25 |
| PG | The Fifth Pulse — Y Berllan, Zoo, Ellesmere, Ince, Edge Caverns B3, rematches, Arena, legendary rotation | 55–70 | 60–75 | rematch tier 5 = ace +25; Obsidian 65+; remnant boss 70 | 6 | Trainer level → 50; perks fully open |

Targets assume Normal difficulty and a player who fights ~70% of visible trainers; the party average should sit 2–4 levels under the gym ace and win with abilities/gear/agents rather than over-levelling. Money curve (currency: credits): gear costs 800–3000, capsules 200/600/1200; the player should afford one piece of gear per chapter from Ch.3.

---

## 16. Side-system hooks the battle/overworld engine must expose

These are referenced by SIDE-CONTENT and STORY-BIBLE and are owned by `js/content/*` but need engine hooks; ids are canonical.

- **Casebook Marks** (`marks`, in `MQ.Inventory`): currency from bounties, quiz perfects, Knutsford sanding favours, dex milestones; spent on perk respec, cat collars, rare brew ingredients, instant brews.
- **Cat trust** (`cats.trust.meadow|bigboy`, 0–5; SIDE-CONTENT §3): battle hooks — T3 MEADOW dodges the first hit of a battle once; T3 BIGBOY Brink heals 25%; T5 cats allowed inside gyms/Arena and learn *Skitter* / *Big Sit*. Cats never enter the box; `reserve` flag keeps them out of the active six without leaving.
- **Skill Cards** (`items.kind === 'tm'`): teach a move once (consumed); the Knutsford bookshop sells them bound as "chapters"; gym leaders reward one each (§9).
- **Photo mode** (`MQ.Photo`; unlocked by Q4): battle-free; sightings fill `dex.seen` with a habitat note; photos stored as `{species, pose, phase, weather}` seeds.
- **Fishing** (`MQ.Fishing`): rod tiers Bamboo/Weighted/Carbon/Elm-handled; tables `fish_<place>` with tiers common/uncommon/rare/legendary(dawn/dusk)/ghost(night + Ghost Lens).
- **Brewing** (`MQ.Brewing`; `brewing_open`): recipes ids `brew_perry`, `brew_clarifier`, `brew_elm_stout`, `brew_damson_fire`, `brew_hedgerow_cordial`, `brew_salt_mead`, `brew_bait_tin`, `brew_cats_cup`, `brew_mamgu_cask`; real-time timers via `MQ.Clock.real`.
- **Bounties** (`MQ.Bounties`): 3 daily, seeded from real date + save seed; tiers petty/notable/warrant; located by clue text only.
- **Arena** (`MQ.Arena`; `arena_open`): tiers bronze/silver/gold/platinum/obsidian; HP refills between fights, PP does not; Overdrive carries over inside a run; engagement rules `no_items`, `one_agent`, `random_weather`.
- **Escort / Guard** (Q3): an escort NPC has a shared HP bar; in escort battles the player's menu gains **GUARD** (the escort takes no damage this turn; the active monster takes ×0.5 and gains +10 Overdrive).
- **ClickFix lure** (`lure` interaction): a sign/kiosk/poster offering a "paste this" prompt; declining counts toward achievement 5 and quest steps; accepting applies the *Lured* overworld status (next wild battle starts with the foe at +1 spe, cleared at a Care centre) — never a hard penalty.
- **SIGNAL METER** (`signal.level` 0–1 per region; from Ch.4): raises rare-table weight and agitation (foe Overdrive start +10 at high signal), reveals fog-hidden encounters as shimmer; zero after `plug_pulled`; a single pip under Quarantine; never zero under Custody.
- **CUTOVER counter** (`cutover_days`): pause-menu display driven by the story flags (38/31/24/17/12/7/STOPPED/T-3/T-0); at ≤12 faction trainers on routes respawn faster and Stuffer fog spawns on two extra routes.
- **Sandbach revive shrine** (`sandbach_shrine`): once per real day, revives all fainted party monsters at the plinth (no friendship penalty).
- **Inns** (`inn` interaction): sleep to the next band for credits; **Care centres** heal, box, swap the following cat, and host the casebook desk (respec, ranks).
- **Overworld rain**: walk speed ×0.9 unless the *Rain Cloak* trinket is worn; tall grass ×0.85 (ENGINE §5.3).
- **Trainer trinkets** (`trainer.trinkets[0..1]`, TL20/TL35): Sprint Soles, Davy Lamp, Ghost Lens, Bait Tin, Rain Cloak, Wool Cap, Field Notebook (passive overworld effects only).
- **Rematch ladder** (`rematch.<trainerId>` tier 0–5) as §9.
- **Rest points** (BIGBOY sit-downs, STORY-BIBLE §12): scripted tiles where BIGBOY sits — heal 25%, autosave, `bigboy_sat_<place>`.
