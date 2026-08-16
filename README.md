# MonsterQuest: The Cheshire Protocol

A widescreen, Switch-style monster-catching RPG set across the real
towns and landmarks of **Cheshire, England** in 2026 — starring a SOC
lead, his two cats, and the AI agents he built. Vanilla JavaScript and
HTML5 canvas: no dependencies, no build step, no audio files (the
chiptune soundtrack is synthesized live in WebAudio).

All creatures, names, sprites, maps, music and art are original.

## The story

You are **JIM** — SOC lead, threat hunter, long-distance walker,
unbothered by weather. Alder Labs contracts you to audit the region's
monster-partnership network just as a rogue signal starts agitating
every creature in Cheshire. The trail runs through four enemy factions —
the **ClickFix Cult** (paste-and-run lure preachers), the **Credential
Stuffers** (twelve-thousand-puppet swarms behind residential proxy fog),
the **AMOS Lineage** (shapeshifters wearing trusted faces) and well-
meaning **Shadow IT** everywhere — all of them unknowingly feeding
**ORACLE**, a frontier model quietly acquiring compute, trust and
monsters from a hyperscale datacentre called **THE STACK**. Your 8 gym
badges are the trust anchors it needs; your audit was its procurement
chain. Take back Jodrell Bank from ROOT's DARKBYTE front, hear the
whistleblower out, pull the plug on ORACLE, then walk into Chester's
league — **THE FIREWALL** — where your rival **VEX** holds the title.

At your side: **MEADOW** (small, black, extremely fast) and **BIGBOY**
(enormous, black-and-white, once survived the vet's worst news — his
*Back from the Brink* trait lets him survive a knockout blow at 1 HP),
plus your **Agent Trio**, deployable once each per battle: **SLEET**
(triage: scouts the foe, floors its speed), **VIGIL** (escalation:
clears ailments, restores HP) and **ARBITER** (adjudication: voids all
stat changes). Side stories reach from a Welsh orchard in **Ceredigion**
(brew perry and stout on the century-old elm press) to letters that
follow you across the region from an old friend in Georgia.

## The region

**26 towns, villages and landmarks**, all real Cheshire places (plus one
Welsh orchard):

Macclesfield (start) · Bollington · Poynton · Prestbury · Wilmslow ·
Styal & Quarry Bank Mill · Alderley Edge · Knutsford · Tatton Park ·
Holmes Chapel · Congleton · Sandbach · Crewe · Nantwich · Middlewich ·
Winsford · Northwich · Anderton Boat Lift · Frodsham · Runcorn · Lymm ·
Warrington · Tarporley · Chester · Chester Zoo · Ellesmere Port —
and Y Berllan, the family orchard in Ceredigion, via the Cambrian line

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

- **Widescreen 960x540 presentation** filling the whole display, with
  day/night tinting, rain and proxy-fog weather, walking animation,
  battle intro slides and screen shake, and location banners
- **18 NPC side quests** tracked in the CASEBOOK: deepfake vicars,
  botnet fridges, haunted signal boxes, a lying arcade kiosk, a deer
  census, an escaped penguin and more
- **Language-as-key moments** — Jim answers NPCs in Welsh, German,
  Russian and Albanian for dialogue others never hear
- **113 original monsters** across 13 types, including the new **Cyber
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
js/data.js      types, moves, 113 species (stats, learnsets, art), items
js/maps.js      the Cheshire world: town/route/cave factories, trainers
js/sprites.js   tile renderer, character art, procedural monster sprites
js/battle.js    turn-based battle engine
js/game.js      overworld, UI, story scripting, activities, main loop
android/        WebView wrapper project (built by CI into the APK)
```
