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

1. Wake up at home in **Maplewood Town** and visit **Prof. Maple's lab**.
2. Choose one of three starters — **Sproutle** (Grass), **Cindercub** (Fire)
   or **Aquafin** (Water) — and beat your rival **Axel**.
3. Head north through **Route 1**: catch wild monsters in the tall grass and
   defeat trainers for prize money.
4. In **Oakridge City**, heal at the Care Center, shop at the Mart, then
   challenge **Leader Slate** at the gym for the **Quarry Badge**.

## Features

- **15 original monsters** with hand-drawn pixel sprites, 12 elemental types,
  evolutions, and per-species level-up learnsets
- **Authentic Gen-1-style battle engine**: physical/special split by move,
  STAB, type effectiveness chart, critical hits (speed-based, high-crit
  moves), stat stages, accuracy checks, priority moves
- **Status conditions**: poison, burn, paralysis, sleep — with in-battle and
  end-of-turn effects
- **Catching** with HP/status/ball-modified catch formula, party of 6 +
  storage box
- **Experience & leveling** (medium-fast curve), move learning with
  forget-a-move prompts, and evolutions after battle
- **Trainer battles** with multi-monster teams, a rival battle, and a gym
  leader finale
- **Overworld**: tile-based maps, tall-grass random encounters, warps and
  interiors, NPCs, signs, talking across counters
- **Items & economy**: potions, status cures, capsules; earn money from
  trainers, spend it at the Mart
- **Care Center healing, whiteout/respawn**, Monster Dex (seen/caught),
  trainer card, party management with reordering
- **Save/Load** via `localStorage` (Save from the pause menu, Continue on the
  title screen)

## Project layout

```
index.html      canvas + shell
js/data.js      type chart, moves, species (stats, learnsets, pixel art), items
js/maps.js      maps, warps, NPCs, trainers, wild encounter tables
js/sprites.js   procedural tile renderer + character/monster sprite cache
js/battle.js    turn-based battle engine (damage, status, catching, exp)
js/game.js      overworld, UI screens, dialog/story scripting, main loop
```
