# MonsterQuest: The Cheshire Protocol

A retro monster-catching RPG set across the real towns and villages of
**Cheshire, England** — with a cybersecurity twist. Built entirely with
vanilla JavaScript and HTML5 canvas: no dependencies, no build step, no
audio files (the chiptune soundtrack is synthesized live in WebAudio).

All creatures, names, sprites, maps, music and art are original.

## The story

You are **JIM**, a junior security researcher from Macclesfield. The
hacker collective **DARKBYTE** has hijacked the great radio telescope at
**Jodrell Bank** and is broadcasting a rogue signal that agitates the
region's monsters. Dr. Alder of Alder Labs hands you a partner monster
and a mission: audit every gym in Cheshire, collect all **8 access
badges**, shut down DARKBYTE's broadcast, and take on the league behind
Chester's ancient walls — **THE FIREWALL** — where your rival, the
insufferable hacker **VEX**, sits as Champion.

## The region

**18 towns and villages**, all real Cheshire places:

Macclesfield (start) · Bollington · Prestbury · Wilmslow · Alderley Edge ·
Knutsford · Holmes Chapel · Congleton · Sandbach · Crewe · Nantwich ·
Middlewich · Northwich · Frodsham · Runcorn · Warrington · Tarporley ·
Chester

Plus landmark sites: the **Edge Caverns** under Alderley (home of
MERLYNX, the Wizard's cat), the **Northwich Salt Mine** (DARKBYTE's
sub-hideout and TERRATAUR's lair), **Delamere Forest**, **Beeston
Castle** (ZEPHYRION's ruin), and **Jodrell Bank Observatory** — the
story's climax, where GLITCHRA waits in the static.

### The 8 gyms

| Town | Leader | Type | Badge |
|------|--------|------|-------|
| Wilmslow | Sysadmin Ada | Electric | PACKET |
| Knutsford | Madam Gaskell | Psychic | CIPHER |
| Congleton | Bearward Otis | Normal/Ground | BEAR |
| Crewe | Stoker Di | Fire | KERNEL |
| Nantwich | Brine Nell | Water | TOKEN |
| Northwich | Foreman Jack | Rock | DAEMON |
| Runcorn | Chemist Ria | Poison | PROXY |
| Warrington | Netrunner Mo | **Cyber** | ADMIN |

Then the **WHITE HATS** (Sue, Raj, Kim, Doc) and **Champion VEX** at
Chester — gated behind all 8 badges *and* defeating ROOT at Jodrell Bank.

## Features

- **103 original monsters** across 13 types, including the new **Cyber
  type**, three-stage starter lines, the grinning **GRINMALKIN** of
  Cheshire-cat legend, silk moths for Macclesfield, salt golems for
  Northwich, a steam locomotive for Crewe, and DARKBYTE's digital
  constructs (Trojanox, Phishfin, Botnetle, Wormhack...)
- **4 catchable legendaries**: Merlynx, Terrataur, Zephyrion, Glitchra —
  one-shot encounters
- **Chiptune soundtrack + SFX**, all synthesized in WebAudio: title,
  town, route, cave, battle, league, and villain themes, plus victory
  jingles, hit/faint/catch/level-up effects. Toggle in the pause menu.
- **Rail fast travel** between Macclesfield, Wilmslow, Crewe, Warrington
  and Chester — unlocked per station as you visit on foot
- Gen-1-style battle engine: STAB, full type chart, crits, stat stages,
  priority, status conditions, catching (4 capsule tiers), day care,
  fishing, berry bushes, brine-pool healing, arcade slots, quiz master,
  in-game trade, whiteout/respawn, Monster Dex, 8-badge trainer card
- **Save/Load** via localStorage

## How to play

```bash
python3 -m http.server 8000   # or just open index.html
```

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Z / Enter / Space | Confirm (A) |
| X / Backspace | Cancel (B) |
| Esc | Pause menu |

On phones an on-screen D-pad, A/B and MENU buttons appear automatically.

## Play on Android

- **Sideload APK**: every push builds a signed, fully offline
  `monsterquest.apk` and publishes it to the repo's Releases under the
  rolling tag **`apk-latest`**. Download it on your phone, open it, allow
  "install unknown apps". The hardware back button acts as B. (Builds use
  a throwaway signing key by default — uninstall the previous build
  before installing a new one, or set the `ANDROID_KEYSTORE_B64` /
  `ANDROID_KEYSTORE_PASS` repo secrets for stable upgrades.)
- **PWA**: host over HTTPS (a GitHub Pages workflow is included — enable
  Pages once under *Settings → Pages → Source: GitHub Actions*), open in
  Chrome, and *Add to Home screen* for a fullscreen offline install.

## Project layout

```
index.html      canvas + touch controls + PWA shell
js/audio.js     WebAudio chiptune sequencer + SFX
js/data.js      types, moves, 103 species (stats, learnsets, art), items
js/maps.js      the Cheshire world: town/route/cave factories, trainers
js/sprites.js   tile renderer, character art, procedural monster sprites
js/battle.js    turn-based battle engine
js/game.js      overworld, UI, story scripting, activities, main loop
android/        WebView wrapper project (built by CI into the APK)
```
