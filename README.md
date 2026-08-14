# MonsterQuest

A retro monster-catching RPG in the spirit of the classic Game Boy games —
built entirely with vanilla JavaScript and HTML5 canvas. No dependencies,
no build step: open `index.html` in any modern browser and play.

All creatures, names, sprites, maps and art are original.

## How to play

```bash
# any static server works; or just double-click index.html
python3 -m http.server 8000
# then open http://localhost:8000
```

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Z / Enter / Space | Confirm (A) |
| X / Backspace | Cancel (B) |
| Esc | Open pause menu |

## The adventure

1. Wake up at home in **Maplewood Town** and pick your starter at
   **Prof. Maple's lab** — **Sproutle** (Grass), **Cindercub** (Fire) or
   **Aquafin** (Water) — then beat your rival **Axel**.
2. Travel north through **Route 1** to **Oakridge City** and beat
   **Leader Slate** (Rock) for the **Quarry Badge**.
3. Head east along **Route 2** — past a rival ambush — to **Seabreeze
   Port**: get the **Old Rod**, trade for a rare monster, and beat
   **Leader Marina** (Water) for the **Tide Badge**.
4. Climb **Route 3** (drop a monster at the **Day Care**!) and brave the
   winding **Echo Cave**, where wild monsters strike anywhere and an
   ancient guardian sleeps in the depths...
5. Emerge in **Emberfall Village**: soak your team in the free **hot
   spring** and take the **Cinder Badge** from **Leader Blaze** (Fire).
6. Follow **Route 4** to lakeside **Willowmere City**: play the
   **Arcade slots** for coin prizes, ace the **Quiz Master**'s challenge,
   and earn the **Mind Badge** from **Leader Fae** (Psychic).
7. With all 4 badges, climb **Route 5** to **Crown Plateau**: face the
   storm-bird shrine, run the **Elite gauntlet**, and take the title from
   the **Champion** to enter the **Hall of Fame**.

## World

**5 towns/cities** (Maplewood, Oakridge, Seabreeze, Emberfall, Willowmere),
**5 routes**, a multi-level **cave dungeon**, and the **Crown Plateau**
league — 29 maps in all, fully connected and walkable.

## Activities

- **Fishing** — get the Old Rod in Seabreeze; face any fishable water,
  cast, and strike when the `!` bites. Different waters hide different
  fish (ponds, harbor, lake).
- **Arcade** — buy coins, play the 3-reel slot machines, and trade
  winnings for prizes including the digital monster **Pixelit**.
- **Day Care** — leave a monster on Route 3; it gains experience for
  every step you take, for a modest fee.
- **In-game trade** — a collector in Seabreeze will swap his **Chompkin**
  for a Buzzler.
- **Berry bushes** — pick free healing berries along the routes; they
  regrow after enough steps.
- **Hot spring** — Emberfall's spring fully heals your team, free.
- **Quiz Master** — answer all of Willowmere's quiz questions for cash
  and capsules.
- **Legendaries** — one-shot encounters with **Terrataur** (Echo Cave
  depths) and **Zephyrion** (Crown Plateau shrine). Catch them or lose
  them forever.
- **Rival battles** — Axel fights you three times, ending as League
  Champion with a full team.

## Features

- **34 original monsters** with hand-drawn pixel sprites, 12 elemental
  types, evolution lines, and per-species level-up learnsets
- **Authentic Gen-1-style battle engine**: physical/special split, STAB,
  full type chart, speed-based critical hits, stat stages, priority
  moves, healing moves, accuracy checks
- **Status conditions** (poison, burn, paralysis, sleep) with in-battle
  and end-of-turn effects
- **Catching** with HP/status/ball-modified formula, 4 capsule tiers,
  party of 6 + storage box
- **Experience & leveling** (medium-fast curve), move learning with
  forget-a-move prompts, post-battle evolutions
- **4 gym leaders + Elite gauntlet + Champion**, 20+ trainers, dynamic
  rival team based on your starter choice
- **Items & economy**: potions (4 tiers), status cures, berries,
  capsules, arcade coins; per-city marts with escalating stock
- **Care Centers in every city**, whiteout/respawn, Monster Dex
  (seen/caught), trainer card with badge case, party reordering
- **Save/Load** via `localStorage`

## Project layout

```
index.html      canvas + shell
js/data.js      type chart, moves, species (stats, learnsets, pixel art), items
js/maps.js      maps, warps, NPCs, trainers, encounters, quiz data
js/sprites.js   procedural tile renderer + character/monster sprite cache
js/battle.js    turn-based battle engine (damage, status, catching, exp)
js/game.js      overworld, UI screens, activities, story scripting, main loop
```
