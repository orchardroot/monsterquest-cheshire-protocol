# MonsterQuest: The Cheshire Protocol

A widescreen, Switch-style monster-catching RPG set across the real towns and landmarks of **Cheshire, England** (plus one Welsh orchard) in 2026 — starring a SOC lead, his two cats, and the AI agents he built. Vanilla JavaScript and HTML5 canvas: no dependencies, no build step, no audio files (the chiptune soundtrack is synthesised live in WebAudio).

I wanted the game I'd have played to death at eleven, except set where I actually live and about the job I actually do. So the routes are the roads I walk, the gym leaders are the towns' real trades, the villains are the threat actors from my last quarter's incident reports, and the two party members you can't put in a box are my cats. It started as a weekend idea and it did not stay a weekend idea: v2 is **416 maps across four Cheshire regions, twelve chapters, eight gyms and 177 original species**, and it is, I'm told, finished. All creatures, names, sprites, maps, music and art are original.

**Play it:** open `index.html`, or grab the Android APK from [Releases](../../releases/tag/apk-latest).

## The story

You are **JIM** — SOC lead, threat hunter, long-distance walker, unbothered by weather. Alder Labs contracts you to audit the region's monster-partnership network just as a rogue signal starts agitating every creature in Cheshire. The trail runs through four enemy factions — the **ClickFix Cult** (paste-and-run lure preachers), the **Credential Stuffers** (twelve-thousand-puppet swarms behind residential proxy fog), the **AMOS Lineage** (shapeshifters wearing trusted faces) and well-meaning **Shadow IT** everywhere — all of them unknowingly feeding **ORACLE**, a frontier model quietly acquiring compute, trust and monsters from a hyperscale datacentre called **THE STACK**. Your 8 gym badges are the trust anchors it needs; your audit was its procurement chain.

Take back Jodrell Bank from ROOT's DARKBYTE front, climb the Lovell Telescope while ORACLE talks to you through its own speakers, and decide what happens to it — delete it, quarantine it, or take custody of it, which is its own kind of trouble. Then walk into Chester's league — the **WHITE HATS** and, past them, **THE FIREWALL**, where your rival **VEX** holds the title, under whichever name the ending gave them. A post-game pulse from the west reopens most of the county again, with rematches, a sleeping-knights vault under Alderley Edge, and a friend from Georgia who is, finally, coming to visit.

At your side: **MEADOW** (small, black, extremely fast, and never wrong), plus your **Agent Trio**, deployable once each per battle: **SLEET** (triage: scouts the foe, floors its speed), **VIGIL** (escalation: clears ailments, restores HP) and **ARBITER** (adjudication: voids all stat changes). Side stories reach from a Welsh orchard in **Ceredigion** (brew perry and stout on the century-old elm press) to letters that follow you across the region from an old friend in Georgia, to a grinning cat on the walls and rooftops who is not, quite, an NPC.

## The region

**Four regions, 416+ maps**, every one hand-designed around a real Cheshire (or Welsh) landmark — Chester's walkable wall circuit and Eastgate Clock, the Anderton Boat Lift, Crewe's rail yard, the Sandbach Saxon crosses, Quarry Bank Mill's water wheel, the Lovell Telescope, Beeston's crag-top castle, the Northwich salt mine, the Runcorn and Mersey Gateway bridges, White Nancy above Bollington, and a great many more:

- **East** (Ch.1–2) — Macclesfield (start), Bollington, Prestbury, Poynton, Lyme Park, Tegg's Nose, Wilmslow, Styal & Quarry Bank Mill, Lindow Moss, Alderley Edge and its caverns, Knutsford, Tatton Park, Rostherne Mere.
- **Mid** (Ch.3–5) — Holmes Chapel, Jodrell Bank, Congleton, Bosley Cloud, Little Moreton Hall, Mow Cop, Sandbach, Crewe.
- **South-west** (Ch.6–7) — Nantwich and its brine lido, Y Berllan and Aberaeron on the Welsh coast, Middlewich, Winsford, the Northwich Salt Mine, Anderton and its boat lift, Great Budworth.
- **North-west** (Ch.8–12 and post-game) — Delamere Forest, Tarporley, Beeston Castle, Frodsham, Runcorn, Daresbury (THE STACK), Lymm, Warrington, Chester, Chester Zoo, Ellesmere Port, Ince Marshes.

Every town has its own care centre, mart, inn and homes; gym and station towns get the matching interiors too. Traversal opens up as you go — a bike, MEADOW's squeeze through cat-gaps, a shoulder to a boulder, a billhook through hedges, a Davy lamp for the dark levels, a boat for the canals, waders for the marshes, gritstone grips for the crags, proxy goggles for the fog, and a railcard for fast travel between stations.

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

Then the **WHITE HATS** (Sue, Raj, Kim, Doc) and **Champion VEX** at Chester — gated behind all 8 badges *and* whatever you decide about ORACLE at Jodrell Bank.

(Yes, the Cyber-type gym is in Warrington. Draw your own conclusions.)

## Features

- **Widescreen 960×540 presentation** filling the whole display, with day/night tinting, rain and proxy-fog weather, walking animation, battle intro slides and screen shake, and location banners
- **177 original species** across 13 types — including the **Cyber** type — three-stage starter lines, the grinning **GRINMALKIN** of Cheshire-cat legend (not catchable — it's ORACLE's oldest, weirdest thread), silk moths for Macclesfield, salt golems for Northwich, a steam locomotive for Crewe, and DARKBYTE's digital constructs
- **4 catchable legendaries** — MERLYNX, TERRATAUR, ZEPHYRION, GLITCHRA — one-shot encounters, each with its own reason to be hard to find
- **43 casebook quests and side cases**, plus 26 bounties and a rotating bounty board: deepfake vicars, botnet fridges, haunted signal boxes, a lying arcade kiosk, a deer census, an escaped penguin and rather more than that
- **Side systems**: fishing (four rod tiers, a proper bite-bar minigame), brewing (perry, cordial and stout from things you've foraged), the Warrington Arena's five ranked tiers, a cat day care, a photo mode, achievements, a full Monster Dex, a rematch ladder against every gym leader, and a perk tree fed by badges and casebook progress
- **Three endings** for ORACLE — delete, quarantine, custody — each changing what the post-game looks like, right down to who's standing where
- **Language-as-key moments** — Jim answers NPCs in Welsh, German, Russian and Albanian for dialogue others never hear
- **Chiptune soundtrack + SFX**, all synthesised in WebAudio: title, town, route, cave, battle, league and villain themes, plus victory jingles and hit/faint/catch/level-up effects. Toggle in the pause menu
- **Rail fast travel** between registered stations, unlocked per station as you visit on foot
- Gen-1-style battle engine: STAB, full type chart, crits, stat stages, priority, status conditions, weather and terrain, catching (four capsule tiers), Overdrive, boss phases and form changes
- **Save/Load** via localStorage, with multiple slots

## How to play

```bash
python3 -m http.server 8000   # or just open index.html
```

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Shift | Run |
| Z / Enter / Space | Confirm (A) |
| X / Backspace | Cancel (B) |
| Escape | Pause menu |
| Tab | Select (mini-map toggle in the overworld) |

A connected gamepad works too — the D-pad/stick, A/B, and start/select all map across.

## Play on Android and tablets

- **Touch controls** appear automatically on a touch device: a virtual analogue stick for movement (with its own dead zone and a run threshold, same as a physical stick) and on-screen A, B, RUN and START buttons. The stick's side, its size and its opacity are all adjustable from Settings, along with vibration on/off — worth a look on a tablet, where the defaults are tuned for a phone.
- **Sideload APK**: every push builds a signed, fully offline `monsterquest.apk` and publishes it to the repo's Releases under the rolling tag **`apk-latest`**. Download it on your phone or tablet, open it, allow "install unknown apps". The hardware/gesture back button acts as B. (Builds use a throwaway signing key by default — uninstall the previous build before installing a new one, or set the `ANDROID_KEYSTORE_B64` / `ANDROID_KEYSTORE_PASS` repo secrets for stable upgrades.)
- **PWA**: host over HTTPS (a GitHub Pages workflow is included — enable Pages once under *Settings → Pages → Source: GitHub Actions*), open in Chrome, and *Add to Home screen* for a fullscreen offline install. The service worker precaches everything and updates itself in the background.

## For the curious: how it's built

Everything is hand-rolled — a chunked tile renderer, procedural monster and tile art, a Gen-1-style battle engine with the full type chart, and a chiptune sequencer that composes the soundtrack from note tables at load time. Every file is an IIFE that publishes onto a single `MQ` namespace on `window`; there's no framework, no bundler and no build step — `git clone`, open a file, play. The whole thing is ES2015 and generators (used for the dialogue/cutscene scripting), so it runs unmodified in anything from the last decade. CI builds a signed WebView APK on every push and publishes it to a rolling release, and a Pages workflow is ready to go if you want it hosted.

It also plays itself. `node tools/test/run.js` runs the unit tests, but the bugs that actually reached my tablet (lose a fight, come round nowhere, get dragged into another fight with nothing to fight with) were all in the seams between systems, so `tools/playtest.js` boots the real game headlessly and walks it with a set of invariants that must hold every frame, and `node tools/fuzz.js --hostile` plays it badly on purpose, losing every battle across the whole county, with a seed so anything it finds can be replayed. If you change how battles end or how maps join up, run it.

## Project layout

```
index.html      canvas + touch controls + PWA shell
sw.js           service worker (offline cache, regenerated by tools/gen-index.js)
js/core/        namespace, event bus, view/input/loop, scenes, dialogue, save, flags
js/data/        types, moves, abilities, items, 177 species, and per-region encounters/trainers/quests
js/world/       map format, the overworld engine, NPCs, interaction, and js/world/maps/ (the 416 maps)
js/battle/      the turn-based engine, its effects table, AI, and the battle scene
js/content/     quests, achievements, cats & day care, fishing, brewing, the arena, bounties, progression, shops
js/ui/          every screen: title, party, bag, casebook, dex, pause, settings, shop, trainer card, world map
js/story/       the chapter scripts and every NPC's dialogue/cutscene, per region
js/art/         procedural tile, monster, people and effects art
js/audio/       the WebAudio chiptune sequencer, songs and SFX
tools/          headless test harness, the battle simulator, world/data validators, index generator
android/        WebView wrapper project (built by CI into the APK)
```

---

*orchardroot — made in Cheshire, under the close supervision of MEADOW, who did not consent to being in a video game.*
