# MonsterQuest: The Cheshire Protocol — Battle & Systems Spec (v2)

Scope: the turn-based core stays Gen-1-shaped (types, STAB, stages, status, catching, evolution, 4 moves, XP). Everything below is additive RPG depth, specified tightly enough to code in ES2015 with no allocations in the hot path (all lookups are static tables; per-battle state lives in plain objects created once at battle start).

---

## 1. Stats, traits, temperaments

**Six stats: `hp, atk, def, spa, spd, spe`.** Split `spc` into Special Attack / Special Defence. Justification: with abilities, held gear and a perk tree the single `spc` stat makes every special-attacker a wall for free (Gen-1's Psychic problem) and leaves no room for "glass cannon" vs "tank" special designs; a split gives 6 axes for temperaments to trade against, and Cyber (a special-leaning type) needs a defensive counterpart. Existing species get migrated by `spa = spc, spd = round((spc+def)/2)` as a starting point, then hand-tuned for ~30 flagship species.

**Stat formula (level L, base B, trait T 0–15, temperament multiplier N):**
- `hp = floor((2B + T) * L / 100) + L + 10`
- other = `floor((floor((2B + T) * L / 100) + 5) * N)`

**Traits (IV-like).** Each monster rolls six integers 0–15 at creation. Traits are surfaced in the summary screen as flavour words rather than numbers ("Keen eyes" = high spe, "Thick coat" = high def, "Never misses breakfast" = high hp), unlocking numeric display at Trainer level 20. Story gifts (starter, MEADOW, BIGBOY, whistleblower gift) roll a floor of 8. Legendaries roll a floor of 10.

**Temperaments (natures).** 20 temperaments; each is `{up, down}` over `atk|def|spa|spd|spe` (×1.1 / ×0.9) with 4 neutral. Names are Cheshire-flavoured: *Brisk* (+spe −def), *Stubborn* (+def −spe), *Sharp* (+spa −atk), *Blunt* (+atk −spa), *Wary* (+spd −atk), *Bold* (+atk −spd), *Rash* (+spa −spd), *Patient* (+spd −spe), *Nosy* (+spe −spa), *Gruff* (+def −spa), *Mardy* (+atk −def), *Canny* (+spa −def), *Steadfast* (+spd −def), *Placid* (+def −atk), *Skittish* (+spe −atk), *Sly* (+spa −spe), *Solid* (+spd −spa), *Windy* (+spe −spd), plus neutral *Plain*, *Ordinary*, *Even*, *Fair*. Temperament also biases AI-side flavour lines and the "likes/dislikes" of Y Berllan snacks (a snack that matches `up` gives +2 friendship instead of +1).

**Friendship** 0–255 per monster (start 70; gifts 120). +1 per level-up, +2 per snack, +3 per gym win in party, −5 per faint, −10 per bitter medicine (Revive Salts). Drives friendship evolutions and the *Bond* perks.

---

## 2. Abilities (30)

Every species has one fixed ability (a few have a rare second on catch, 20%). Ability hooks: `onSwitchIn, onBeforeMove, onModifyDamage(dealt/taken), onAfterHit, onStatusApply, onEndTurn, onFaint, onWeather, onStageChange`.

| # | Ability | Rule |
|---|---|---|
| 1 | **Back from the Brink** | Once per battle, a hit that would KO from ≥50% HP leaves 1 HP. (BIGBOY, plus 2 rare species.) |
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
| 15 | **Thick Fleece** | Ice/Water/Wind chip damage nullified; takes ×0.9 from special moves. |
| 16 | **Iron Will** | Cannot be Flinched; cannot have stats lowered by foe. |
| 17 | **Nightshift** | +1 priority on status moves at night (in-game clock 20:00–06:00). |
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

**Battle consumables (bag):** Potion tiers (Salve 20 / Tonic 60 / Elixir 120 / Full Restore all+status), Antidote-class cures per status, **Revive Salts** (½ HP, −friendship), **Boombox** (flee wild guaranteed), **Rain Cloak / Sun Lamp / Fog Machine / Wind Whistle** (set weather 5 turns, once per battle), **Stat Tonics** (+1 stage, atk/def/spa/spd/spe/acc; Nantwich brine sells them), **X-Ray Card** (reveal foe's moves & ability, 1 use). Using a bag item costs the turn; the AI at *smart* tier reads item use as a free hit.

---

## 4. Move effects schema

A move is `{name, type, kind:'phys'|'spec'|'status', power, acc, pp, priority, flags:{contact,sound,charge,recharge,protect_ok}, crit:0|1|2, effects:[Effect,...]}`. `effects` are applied in order after the hit resolves (or immediately for status moves). Every effect has an optional `chance` (default 100) and `target:'self'|'foe'`.

**Effect types (`t`):**
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

Cooldowns tick at end of turn; start at 0 each battle. Boss scripts may **jam** agents for N turns (ORACLE, THE STACK). Difficulty *Hard* adds +2 to all cooldowns.

---

## 7. OVERDRIVE meter

Per-monster meter 0–100, resets each battle. Gains: +8 taking a hit, +12 taking a super-effective hit, +6 dealing damage, +15 when an ally faints, +20 landing a KO, plus move `overdrive` effects. Some gear/perks modify gain. At 100, the **OVERDRIVE** menu option lights up: using it fires the species' **signature move** (each evolutionary line has one, ~130 total, defined like normal moves with `overdriveOnly:true`, typically power 120–150 or a big status swing; MEADOW: *Zoomies* — priority +2, 3 hits, spe +1; BIGBOY: *Brink Roar* — heal 50%, def/spd +1, foe atk −1). Overdrive moves ignore `protect`, cannot miss, do not use PP, and drain the meter to 0. Enemy monsters at *greedy*/*smart* AI tiers and all bosses also build Overdrive (visible small bar), so the player can plan around it (e.g. switch or Protect on the turn it fills). Kevlar Waistcoat disables it.

---

## 8. Trainer level & perks

The trainer has a level 1–50 with its own XP: +1 per wild win, +5 per trainer win, +25 per gym, +10 per quest stage, +2 per catch, +1 per new dex entry. Every level grants 1 **perk point**; three trees of 10 perks each (unlock rows every 5 levels), plus passive **Trainer Level effects**: catch rate +1% per level (cap +30%), obedience cap for traded/gifted monsters `10 + 2×TL`.

- **Hunter** (offence): *Focused* (crit stage +1 for all), *Exploit* (super-effective ×2.2 instead of 2), *First Strike* (+10% dmg turn 1), *Overclocker* (Overdrive gain ×1.25), *Big Game* (dmg ×1.1 vs bosses), *Pack Tactics* (+5% per fainted ally, max 15%), *Deep Cuts* (recoil halved), *Sniper* (crit ×2), *Zero Trust* (ignore foe positive stages), *Overkill* (Overdrive carries over 25% to next battle). 
- **Warden** (defence/support): *Triage* (VIGIL cooldown −1), *Field Medic* (bag heals ×1.25), *Steady* (own negative stages halved), *Second Wind* (switch-in heals 1/16), *Umbrella Discipline* (party ignores Fog), *Long Walker* (party spe +5% overworld-rain battles), *Fail-Safe Protocol* (Brink works twice per battle for BIGBOY), *Cold Case* (immune to Freeze), *Quiet Cat* (MEADOW gets a free Slipstream +2), *Iron Bell* (ARBITER cooldown −2). 
- **Handler** (capture/growth): *Steady Hand* (capture timing window ×1.5), *Soft Touch* (capsule bonus +0.2), *Wide Share* (XP share to all party at 50%), *Ledger Keeper* (money ×1.25), *Bond* (friendship gains ×1.5), *Naturalist* (traits shown, temperament shown), *Night Owl* (night encounters spawn rare tables), *Trader* (shops −10%), *Second Chance* (fainted monster keeps XP earned), *Golden Ratio* (shiny/rare-palette odds ×2).

Perks are respec-able at the Chester Zoo NPC for 500 coins.

---

## 9. Boss battles and gym leaders

**Boss data:** `{phases:[{hpFrac, script:[Event]}], jamAgents?, arenaWeather, arenaTerrain, cannotCatch, overdriveStart}`. Events fire once when the boss's active mon crosses `hpFrac` (or on `turn N`): `say`, `setWeather`, `setTerrain`, `healSelf {frac}`, `boostSelf {stages}`, `summonAdd {species,level}` (a 2-v-1 for that phase — enemy gets a second slot that acts after the boss), `changeForm {speciesId, keepHp}` (GLITCHRA), `disableMove {name} 2`, `jamAgents 3`, `forceOverdrive`. Bosses have Overdrive start > 0 and phase transitions grant them a full turn heal-cap of 30%. Bosses use `smart` AI regardless of difficulty.

**Gym leaders** each have a **house rule** displayed on the gym door:
- Wilmslow (Ada, Electric): Static terrain permanent; **Sysadmin's Reboot** — once per battle, restores all stages and PP of her active mon.
- Knutsford (Gaskell, Psychic): all monsters start with `screen spec 5`; on her last mon, Fog. 
- Congleton (Otis, Normal/Ground): 2-v-1 first phase (bear + keeper). 
- Crewe (Di, Fire): Sun set on turn 1; her signature loco changes form at 50% (charge → recharge phase). 
- Nantwich (Nell, Water): permanent Rain; healing 1/16 each turn for her Brine Body team. 
- Northwich (Jack, Rock): Salt terrain; Foreman's Whistle summons an add at 40%. 
- Runcorn (Ria, Poison): all her contact hits carry `tox 20%`; her arena disables VIGIL for the first 3 turns. 
- Warrington (Mo, Cyber): jams **all** agents until you land a super-effective hit; his ace runs Overclock and starts with 50 Overdrive.

Rematches (post-badge, weekly in-game) use levels +15 and full-6 parties.

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

| Ch | Story beat | Wild lvl | Trainer lvl | Gym ace | Party size expected | Notes |
|---|---|---|---|---|---|---|
| 1 | Macclesfield → Bollington → Wilmslow (PACKET) | 2–8 | 4–9 | 12 | 2–3 | Starter + MEADOW; first agent SLEET after gym 1 |
| 2 | Prestbury/Alderley Edge → Knutsford (CIPHER) | 8–14 | 10–16 | 18 | 3–4 | BIGBOY joins; Overdrive unlocks; VIGIL |
| 3 | Styal/Tatton/Holmes Chapel → Congleton (BEAR) | 13–20 | 15–22 | 24 | 4 | Held items unlock (Quarry Bank shop) |
| 4 | Sandbach → Crewe (KERNEL) → Nantwich (TOKEN) | 19–28 | 22–31 | 30, 33 | 4–5 | ARBITER; first Cyber gear; ClickFix boss |
| 5 | Middlewich/Winsford → Northwich (DAEMON), Salt Mine | 27–34 | 30–37 | 38 | 5 | TERRATAUR; Credential Stuffer fog boss |
| 6 | Anderton → Frodsham → Runcorn (PROXY) → Lymm | 33–40 | 36–43 | 44 | 5–6 | AMOS shapeshifter boss (form changes) |
| 7 | Warrington (ADMIN) → Delamere → Beeston | 39–46 | 42–49 | 50 | 6 | ZEPHYRION; agents jammed intro |
| 8 | Jodrell Bank (ROOT/GLITCHRA), THE STACK | 45–52 | 48–55 | boss 56 (3 phases) | 6 | ORACLE finale, phases + adds |
| 9 | Chester: White Hats + VEX | — | 54–60 | VEX ace 64 | 6 | Full smart AI, Overdrive start 25 |
| PG | Y Berllan, rematches, gauntlet, legendary rotation | 55–75 | 60–80 | rematch 70+ | 6 | Trainer level → 50; perks fully open |

Targets assume Normal difficulty and a player who fights ~70% of visible trainers; the party average should sit 2–4 levels under the gym ace and win with abilities/gear/agents rather than over-levelling. Money curve: gear costs 800–3000, capsules 200/600/1200; the player should afford one piece of gear per chapter from ch.3.