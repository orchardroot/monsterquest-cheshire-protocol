# MonsterQuest: The Cheshire Protocol — SIDE CONTENT BIBLE (v1.1, reconciled to STORY-BIBLE chapter order)

Scope: everything outside the main chapters that keeps the player walking. Written for one player (a threat hunter who walks long distances and lives with two cats), so the systems lean on *observation, patience and pattern-matching* rather than grind. British English throughout; all names original.

Design rules for side content:
- Every quest teaches or exercises a system (listed as **Teaches**).
- Every repeatable system produces something you can *spend* elsewhere (Trust, Casebook Marks, brew ingredients, gear).
- Nothing important is missable; timed/seasonal content is a bonus lane, never a gate.
- Casebook UI: quests grouped by town, with a status pin (Open / In Hand / Closed), a "twist revealed" flag, and a Mark count. 30 cases + 8 gyms + story = one **Casebook rank** ladder (Probationer → Analyst → Senior → Lead → Principal). Cases pin to the same clue board as the main story (STORY-BIBLE §6) and some feed it (Q24's fridges feed `runcorn_fog_fridges`).
- Clocks: day/night bands and weather are the **game clock** (`MQ.Clock`, ENGINE-ARCHITECTURE §3.8; Inns skip a band); weekday/month events, bounty rotation, daily cat gifts and brewing timers use the **real clock** (`MQ.Clock.real`).
- Chapter numbers below are STORY-BIBLE chapters; "opens Ch.N" is the earliest the case can be taken. Quest ids: `case_<nn>_<slug>` (e.g. `case_01_silk_thread`).

---

## 1. THE CASEBOOK — 30 side quests

Format: **Title** — giver, town. Hook → Steps → Twist → Reward → *Teaches*.

**Cases 1–7 (Ch.1–4 towns: Macclesfield, Bollington, Poynton, Alderley Edge, Styal, Tatton)**

1. **The Silk Thread** *(opens Ch.1; closable from Ch.2 when night tables begin)* — Weaver Bronwen, Macclesfield (Paradise Mill). Silk moths (SPINDRAKE — a wild cousin of the silk-moth starter line, not the starter) have stopped visiting the mill garden. → (a) catch a Spindrake in Route tall grass at *night*, (b) return, (c) she asks for a Bollington one too — different colour morph. Twist: the moths left because a Shadow IT "smart moth-trap" is on the roof; disable it (interaction puzzle: pick the right cable colour from a hint on the box). Reward: 600 credits, HELD ITEM *Silk Wrap* (halves burn damage). *Teaches: night-only encounters, held items.*
2. **White Nancy's Watch** *(opens Ch.1)* — Ranger Kev, Bollington. Somebody keeps repainting the folly at night. → climb Kerridge Hill in the dusk/night band (game clock, or use the Inn to sleep), stake out, battle 2 ClickFix novices. Twist: the "vandal" is a kid painting a memorial for a lost cat; you can report or help him finish. Reward (help): *Trust +1 with MEADOW*, achievement seed; (report): 400 credits. *Teaches: time-of-day, choice consequences.*
3. **Middlewood Way Escort** *(opens Ch.1)* — Cyclist Priya, Bollington. Escort her along the old railway path (Middlewood Way) to Poynton — she stops every 12 tiles and monsters ambush. → 3 ambushes, keep her HP (a shared escort bar) above zero by choosing to Guard or Fight. Twist: her bike pannier contains a Credential Stuffer proxy box she was paid to "deliver"; she didn't know. Reward: 900 credits, Route unlocked (Poynton shortcut). *Teaches: escort mechanic, Guard command.*
4. **The Wizard's Well** *(opens Ch.2 after `elis_met`)* — Elis Pennant, the Old Man of the Edge, Alderley Edge. Legend says the wizard's cavalry sleep under the Edge; something is stirring the water at the Wizard's Well. → read three inscriptions on the Edge (Stormy Point, Castle Rock, the Well), order them, enter the Edge Caverns B1 side gallery with Miner-Warden Gwil. Twist: MERLYNX (the Wizard's cat) shows you a *sighting* only — you cannot catch it yet; it leaves a claw-mark you photograph. Reward: PHOTO MODE unlocked, the **Davy Lamp** from Gwil (traversal: dark levels; also reveals hidden cave-floor items). *Teaches: photo/sighting mode, landmark reading puzzles.*
5. **Quarry Bank Overtime** *(opens Ch.2 after `wheel_fridge_fixed` — the story's botnet fridge is already out)* — Wheelwright Enid, Styal. The fridge is gone and the wheel is *still* being throttled. → trace three sluice gates upstream on the Bollin, each with a mini-battle vs a Shadow IT contractor. Twist: the second "attacker" is the mill's own scheduling app misconfigured — a Shadow IT case that piggybacked on the fridge, no villain. Reward: 700 credits, TM-equivalent *Skill Card: Torrent* (Water). *Teaches: Skill Cards (teach moves).*
6. **The Deer Census, Part Two** *(opens Ch.4 after `deer_census_done` and `amos_first_glimpse`)* — Deer Warden Nerys, Tatton Park. The Ch.3 count was a botnet; now count the real herd using photo mode. → photograph 8 distinct STAGWIRE (the stag form of the PIPHART herd line) with different antler patterns; two only appear in rain. Twist: the ninth "deer" is an AMOS Lineage shapeshifter wearing a deer face; it flees and drops *Face Fragment #1* (story breadcrumb). Reward: 800 credits, *Rain Cloak* (rain no longer slows walking). *Teaches: photo mode variety scoring, weather-gated encounters.*
7. **Poynton Pool Ledger** *(opens Ch.1)* — Angler Doug, Poynton. Fishing tutorial: prove three catches from Poynton Pool. → Common, Uncommon, one Rare (needs the *Weighted Line* he lends). Twist: the Rare is wearing a tracker tag; whoever tagged it is logging Cheshire's waterways. Reward: keep the Weighted Line, *Bait Tin* recipe. *Teaches: fishing tiers, gear lending.*

**Cases 8–14 (Ch.3–7 towns: Knutsford, Congleton, Holmes Chapel, Sandbach, Great Budworth)**

8. **The Gaskell Draft** *(opens Ch.3)* — Librarian Aled, Knutsford. A manuscript page from *Cranford* has been "found" and offered for sale. → quiz-based inspection (Knutsford quiz mini-game, 5 questions on style), then confront the seller. Twist: page is a deepfake; the seller is a ClickFix mule reading a script; he'll defect if you win a battle without using an Agent. Reward: 1,000 credits, +1 perk point. *Teaches: quiz mini-game, "no-Agent" battle challenge.*
9. **Penny Farthing Rally** *(opens Ch.3)* — Rally Marshal Tomos, Knutsford (Penny Farthing Museum). Timed course through Knutsford's alleys collecting 6 pennants in 90 s. Twist: none — pure joy; but the fastest run leaderboard (local) unlocks a second course at Tatton. Reward: *Sprint Soles* (run speed +8%). *Teaches: timed traversal, run-by-deflection.*
10. **Bear of Congleton** *(opens Ch.4)* — Bearward Otis (pre-gym), Congleton. Town legend: the town sold its Bible to buy a bear. → find three "bear tokens" hidden in town (bakery, bridge, park), each behind a small errand. Twist: the tokens spell a login for the town's Wi-Fi which the ClickFix Cult have posted on lampposts — Otis asks you to *unpost* them (a mini-clean-up: 6 posters, each posts a "paste this command" lure you must decline). Reward: 900 credits, gym re-match unlocked early. *Teaches: ClickFix lure recognition (a battle-safe status), rematches.*
11. **Signal Box, Holmes Chapel** *(opens Ch.4)* — Signalwoman Dot. The box's levers move by themselves in the small hours. → sleep at the Inn to force the night band; watch; battle POLTERGRID (Cyber/Ghost-flavoured Cyber type). Twist: the box has an unpatched telemetry dongle; POLTERGRID is a wild creature nesting in the noise, not a haunting; catching it (not fainting it) is the "good" outcome. Reward: POLTERGRID capture chance, *Ghost Lens* (photo mode reveals static-creatures). *Teaches: catch-versus-defeat outcomes.*
12. **The Saxon Crosses Cipher** *(opens Ch.5)* — Historian Nia, Sandbach. The Crosses' carvings have been chalked with symbols. → photograph 4 chalked panels, decode using the market-square sign (substitution key), lead to a dead-drop in the churchyard. Twist: the drop holds a Credential Stuffer proxy list — turn it in to Brine Nell, ex-forensics, at Nantwich (opens her respect line, and White Hat Sue's at Chester) or sell it to a Shadow IT contact for 2,000. Reward: choice; the Nell path gives +1 perk point (flag `case_12_handed_in`). *Teaches: photo mode as evidence, moral choice.*
13. **Bounty: Fenced Goods** *(opens Ch.5)* — Bounty Board, Sandbach. First tutorial bounty: a named ROTTLING ("Bramble") that steals berries. → track by chewed bushes (berry nodes gone) to a route hedge; battle. Twist: it drops a Y Berllan orchard tag — it came from a Welsh orchard consignment. Reward: 500 credits, board unlocked. *Teaches: bounty board.*
14. **The Deepfake Vicar** *(opens Ch.7)* — Curate Elin, Great Budworth (St Mary and All Saints; Vicar Ffoulkes is the real vicar). Parishioners are getting video calls from "the vicar" asking for gift cards. → collect three call recordings, compare with photo-mode portrait of the real vicar (find 3 discrepancies), confront the AMOS grunt at Northwich market. Twist: the grunt has the vicar's *voice*, not face — the AMOS Lineage is upgrading. Reward: 1,200 credits, *Face Fragment #2*. *Teaches: spot-the-difference photo comparison.*

**Cases 15–21 (Ch.5–7 towns: Crewe, Nantwich, Middlewich, Winsford)**

15. **Timetable Tangle** *(opens Ch.5)* — Dispatcher Mags, Crewe. Trains are colliding *in the schedule*. → rail-timetable puzzle mini-game (slot 6 trains into 4 platforms with no overlap; three rounds). Twist: the corruption follows a pattern — every 13th minute; ORACLE's heartbeat. Reward: rail fast travel gains Crewe hub for free, *Conductor's Whistle* (call a train from any station tile). *Teaches: timetable puzzle, fast travel.*
16. **Stoker's Rematch Ladder** *(opens Ch.5 after `badge_kernel`)* — Stoker Di, Crewe. After her badge: a growing rematch chain (levels +5 each, up to 5 tiers). Twist: at tier 4 she brings a monster you *released* earlier if you ever released one (she "found it by the line"). Reward per tier: escalating Skill Cards; tier 5: *Firebox Charm* (Fire moves +10%). *Teaches: rematchable trainers with growth.*
17. **Brine of Nantwich** *(opens Ch.6; the brewing step needs `brewing_open` from the Y Berllan story later in the chapter)* — Lido Keeper Wyn. The outdoor brine pool is turning cloudy: something's dissolving. → collect 3 water samples (fishing rod on the pool), brew a *Clarifier* at Y Berllan (the first recipe you learn on the press), pour it in. Twist: the cloudiness is a swarm of SALTLINGs breeding — the fix upsets Foreman Jack in Northwich (they're his mine's runaways). Reward: brine-pool healing becomes free permanently, *Clarifier* recipe learned. *Teaches: brewing (unlocked by the story), cross-town consequence.*
18. **Nantwich Ram, Missing** *(opens Ch.6)* — Farmer Bethan, near Nantwich. Prize ram stolen; hoofprints lead to a Credential Stuffer proxy farm on the route. → detective steps: photograph prints, match to 1 of 3 route pens, defeat 2 grunts. Twist: the ram was collateral — pens are storing kidnapped SHEEPWIRE for botnet compute; you release 6 (each a guaranteed catch attempt). Reward: 1,000 credits, *Wool Cap* (cold-weather buff). *Teaches: multi-catch reward, tracking.*
19. **Middlewich Salt Roads** *(opens Ch.7)* — Carter Emrys, Middlewich. Deliver 3 salt casks along the Roman salt route to Northwich before they dissolve in the rain (real weather roll: rain = 60 s timer, dry = no timer). Twist: a Shadow IT drone tries to reroute you; ignore it and the drone reveals a hidden path along the Trent & Mersey Canal. Reward: 800 credits, canal path. *Teaches: weather-timed delivery.*
20. **The Winsford Flashes** *(opens Ch.7)* — Birder Lowri, Winsford. Something big is surfacing in the flashes (real flooded salt-subsidence lakes). → fishing at three flash sites in the dawn band (game clock, or via the Inn) with the *Weighted Line*. Twist: the "big thing" is TERRATAUR's shed hide, not the legendary; it's the first tell that Northwich mine goes deeper. Reward: *Hide Plate* (held: Rock resistance), Legendary Rare fishing table unlocked. *Teaches: dawn window, fishing Legendary tier.*
21. **The Whistle Test** *(opens Ch.7)* — Choirmaster Osian, Middlewich. He needs a chord — a Cyber creature that sings on the third turn. → find and catch a CHORDLE (Cyber; all its moves carry the `sound` flag) using a *Music Box* item so it stays 3 turns without fleeing. Twist: CHORDLE mimics the note pattern of the ClickFix hymn — his choir has been unwitting broadcasters. Reward: 700 credits, *Overdrive gain +5%* when a status move lands. *Teaches: flee-prone catches, Overdrive.*

**Cases 22–26 (Ch.7–9 towns: Anderton, Northwich, Delamere, Frodsham, Runcorn)**

22. **Lift Logic** *(opens Ch.7)* — Lift Engineer Beth, Anderton Boat Lift. The lift's caissons are out of balance. → boat-lift puzzle mini-game (weight-balancing: place cargo crates so both caissons match; 3 rounds, last one with hidden weights revealed via photo mode). Twist: one crate is a DARKBYTE server; balancing it "correctly" ships it — the alternative is to fail the round on purpose and let it be inspected. Reward: 1,000 credits, canal ferry between Anderton and Northwich; choosing to fail earns +1 perk point. *Teaches: puzzle + moral choice.*
23. **Frodsham Hill Beacon** *(opens Ch.9)* — Beacon Keeper Ivor, Frodsham. Rebuild the hill's beacon; needs 3 timber types from Delamere Forest and one spark from a Fire type at *night* while it's not raining. Twist: lighting the beacon triggers a one-time regional event: a flock of night-only creatures crosses the Mersey — a 10-minute encounter bonanza. Reward: *Beacon Ember* (Fire held), sighting entries. *Teaches: gathering, condition stacking, one-shot events.*
24. **Runcorn Bridge Gauntlet** *(opens Ch.9)* — Bridge Warden Cerys, Runcorn. Cross the Silver Jubilee Bridge on foot; six trainers block the walkway, one per span, no healing between; each defeated trainer's fridge goes dark (feeds `runcorn_fog_fridges`). Twist: if `vex_ally` (Verify), the sixth is VEX in a hood, testing you; beat them and they say nothing — their first respect. If not, the sixth is the Understudy wearing VEX's face, and drops it. Reward: 1,500 credits, ARENA unlocked at Warrington (`arena_open`). *Teaches: gauntlet format.*
25. **The Weaver Hall Ghost** *(opens Ch.7)* — Curator Mari, Northwich (Weaver Hall Museum). Museum objects moving at closing. → three night-band visits (game clock or Inn), each reveals a route the "ghost" takes; end at the Salt Mine's Marston back stair. Twist: it's a lost SALTLING pup homing to TERRATAUR's lair; carry it back down and the boss fight later has one fewer phase. Reward: *Salt Lantern* (mine encounter rate –30% toggle). *Teaches: night visits, mercy affecting a boss.*
26. **Delamere Watch** *(opens Ch.8)* — Forester Owain, Delamere. Repeatable-ish: photograph 12 sightings across the forest's Blakemere Moss, the trails and Old Pale hill; three are weekend-only (real clock: Sat/Sun). Twist: sighting 12 is your own reflection in the Moss showing you with a monster you don't own yet — a foreshadow. Reward: *Field Notebook* upgrade (dex shows habitats). *Teaches: weekday gating, dex habitats.*

**Cases 27–30 (Ch.10–12 and Y Berllan: Lymm, Warrington, Chester, Y Berllan)**

27. **Lymm Dam Reflection** *(opens Ch.10)* — Painter Rhian, Lymm. Paint the dam at four times of day (photo mode at dawn/day/dusk/night). Twist: the night photo shows a fifth figure standing on the dam — GLITCHRA's static outline, first ever sighting. Reward: *Dex art unlock*, 1,000 credits, glimpse-only Legendary entry. *Teaches: four-slot time schedule.*
28. **Warrington Wire Arcade** *(opens Ch.10; this is the lying kiosk of the Ch.10 story)* — Cabinet Op. Sian, Warrington. Beat three cabinets (see mini-games) at Bronze; then the kiosk offers "unlimited tokens if you paste this into your Trainer card". Twist: the kiosk is a lying ClickFix cabinet; refusing three times flips it to reveal a hidden fourth cabinet. Reward: *Arcade Pass*, cosmetic cat collar. *Teaches: arcade mini-games, refusing lures.*
29. **Chester Walls Round** *(opens when the city opens, Badge 6; the story's own wall gauntlet is Ch.12)* — Watchman Idris, Chester. Complete the full 2-mile wall circuit without leaving the wall, hitting Eastgate Clock, King Charles' Tower, the Roodee, the Water Tower — 8 checkpoints; trainers appear on the wall on Wednesdays (real clock) as a "training day". Twist: at the Water Tower, a DARKBYTE dead-drop note in ROOT's hand is pinned; it names Alder Labs as VEX's sponsor and the endpoint VEX's starter reports to. Reward: *Wallwalker* title, +1 perk point. *Teaches: checkpoint traversal, weekday content.*
30. **Y Berllan: The Elm Press** *(opens Ch.6 after `brewing_open`; completable from Ch.8)* — Mam-gu (Nesta), Y Berllan, Ceredigion (via Cambrian line). The century-old press works, but it has run on a cracked plate for years and cannot take a full pressing (tier 3). Restore it: three parts scattered across Cheshire (a cast plate from Crewe yard, an elm beam from Delamere, screw thread from Northwich). Steps require Welsh dialogue for the last part (language key). Twist: while pressing, a letter arrives from Nino in Tbilisi — she has traced THE STACK's Georgian shell company (the one she named in letter #2) to a registered address that is a PO box in Daresbury; and something at that address has been asking about Jim, in his voice. Reward: brewing tier 3, *Mam-gu's Blessing* (all brew durations −50%), story hook for the finale. *Teaches: brewing mastery, cross-region fetch with meaning.*

Distribution: 6 fetch/gather, 4 escort/traversal, 7 detective, 4 gauntlet/battle, 4 timed, 5 explicit choice — with several hybrids.

---

## 2. REPEATABLE SYSTEMS

### 2.1 Bounty Board (Sandbach, then every town hall)
- 3 active bounties, rotate daily (seeded from real date + save seed so no reroll-scumming). Tiers: Petty (named common wild, +50% level), Notable (rare morph, appears only in a specific weather/time), Warrant (mini-boss with a trait; once per week, high pay).
- Bounties are located by clue text ("chewed berries on the Bollin path", "hums near the Boat Lift at night"), never a map marker — a threat-hunt vibe.
- Payout: credits + *Casebook Marks* (currency for perk respec, cat collars, brew rare ingredients, Knutsford favours). Weekly Warrant grants a gear piece. Under Quarantine (Choice 3) ORACLE also posts bounties in log format from the shed at Y Berllan.

### 2.2 The Warrington Arena (unlocked by Q24)
- Ranked gauntlets (the Arena opens in Ch.9/10 at Lv 36–45, so): **Bronze** (3 fights, L38), **Silver** (5, L45), **Gold** (7, L52, no items), **Platinum** (9, L58, one Agent only), **Obsidian** (post-game, 12, L65+, random weather each fight, boss with phases at 12).
- Restrictions per tier displayed as an "engagement rule"; parties refill HP but not PP between fights; Overdrive carries over.
- Rewards: Arena Chips → exchange for held items unavailable elsewhere and cosmetic titles; first clear of each tier gives a perk point.

### 2.3 Rematchable Trainers with growth
- 8 gym leaders + 12 named route trainers get a rematch tier (0–5). Each tier: +5 levels, one new team member, and at tier 3 a held item / trait; tier 5 = full six. Rematches available after 1 real day (or 30 game-days, whichever comes first). This is the rematch model SYSTEMS-SPEC §9 uses.
- Leaders' rematch tier 5 gives a unique *Anchor* held item themed to their badge.

### 2.4 Fishing
- Rod tiers: Bamboo → Weighted Line → Carbon → Elm-handled (brewed at Y Berllan). Minigame: a bite bar; press when the marker crosses the highlighted zone; rarer fish have narrower zones and 2–3 hits.
- Rarity tiers: Common / Uncommon / Rare / Legendary-table (dawn/dusk only) / Ghost (night, needs Ghost Lens).
- Locations & specialities: Poynton Pool (tutorial), Lymm Dam (Uncommon Grass/Water), River Weaver at Northwich (salt species), Winsford Flashes (Rare, dawn), Trent & Mersey Canal by Anderton (Ghost bottles = items), the Dee at Chester (Legendary table), the Mersey at Runcorn (Poison morphs), Y Berllan pond (Welsh-only species, needed for dex).
- Fish also drop brew ingredients (roe, scales) and can be *sold* to Angler Doug for a scaling price.

### 2.5 Brewing at Y Berllan (unlocked by the Ch.6 story, `brewing_open`; Q17 teaches the first recipe; tiers 1–3, tier 3 via Q30)
- Elm press + fermenting barrels (3, later 5). Choose recipe → wait real time (10 min / 1 hr / 4 hr — never longer; brew continues while app is closed by comparing timestamps) or pay Mam-gu a Mark to finish instantly once a day.
- Recipes (ingredients → effect): *Perry* (perry pears ×3 → party HP full + Overdrive 25% start), *Clarifier* (brine sample + apple → cures all status), *Elm Stout* (barley + roasted acorn → Def +1 stage first 3 turns), *Damson Fire* (damsons + Beacon ember → Fire moves +20% one battle), *Hedgerow Cordial* (blackberries + sloe → catch rate ×1.3 for 10 min real time), *Salt Mead* (honey + salt crystal → Rock/Ground resistance), *Bait Tin* (roe + oats → fishing Rare zone widened), *Cat's Cup* (cream + catmint → cat trust +1, daily), *Mam-gu's Cask* (tier 3, all above ingredients → +1 perk point, once per week). Brews are bag consumables in battle terms (SYSTEMS-SPEC §3): *Perry* and *Clarifier* are usable in battle; the rest are pre-battle buffs with a real-time or one-battle duration.
- Ingredient sources: berry bushes (respawn on step count), orchard trees (daily), fishing drops, bounty rewards, market stalls (Nantwich Saturday market, Chester Rows).

### 2.6 Berry & ingredient gathering
- 14 hedge/orchard ingredients across the region, each with a home biome (sloe on routes, salt crystal in Northwich, catmint at Tatton, damsons at Prestbury). Bushes regrow every 400 steps; the *Field Notebook* shows which are ripe. Cats sniff out hidden nodes (2.10).

### 2.7 Photo / Sighting mode (from Q4)
- Press the camera to enter a still-frame; pan a small viewfinder, tap to shoot. Photos score on subject rarity, distance, time-of-day, and whether the creature is "posing" (idle animation state). Sightings fill a *Seen* entry with a habitat note even if not caught.
- Sighting Album: every species at least once (113), 20 landmarks, and 5 secret shots (such as VEX at the Eastgate Clock at midnight, or GRINMALKIN in the brine). Photos are stored as compact seeds (species id + pose + time), not pixels, to keep saves small.

### 2.8 Dex completion milestones
Seen 25 → *Field Notebook*; Caught 25 → Marks ×5; Caught 50 → +1 perk point; Seen all Cyber types → *Ghost Lens*; Caught 75 → gear *Dex Bandolier* (2nd held item slot? no — instead 1 extra capsule per catch); Caught 100 → hatch a *shiny-morph* egg; Caught all 113 → MERLYNX is waiting on the elm press at Y Berllan (post-game re-encounter, catchable; `merlynx_on_press`).

### 2.9 Achievements (40) — in the game's voice
1. First Triage · 2. Walked, Not Ran (10,000 tiles) · 3. Bothered By Weather (walk 1,000 tiles in rain) · 4. Unbothered By Weather (5,000) · 5. Paste Refused (decline 10 ClickFix lures) · 6. Not Today, Botnet · 7. Trust Anchor (badge 1) · 8. Eight Anchors · 9. Cranford Correspondent (Knutsford quiz perfect) · 10. The Bear Necessity · 11. Salt of the Earth (10 salt species) · 12. Sighted, Not Cited (50 photos) · 13. Ghost in the Signal Box · 14. Brine Time (100 heals at the lido) · 15. Balanced Caissons · 16. On Time, Every Time (timetable perfect) · 17. Wallwalker · 18. Small Black Fast (MEADOW trust 5) · 19. Every Stopping Place (MEADOW sits in all six rest points) · 20. Best Dressed (all ten collars owned) · 21. First Press (brew) · 22. Mam-gu Would Approve (Mam-gu's Cask) · 23. Cambrian Line · 24. Ambidextrous (answer in all 4 languages) · 25. Ticket to Ride (all stations) · 26. Twelve Thousand Puppets (defeat 100 Credential Stuffer grunts) · 27. Wearing A Trusted Face (expose 5 AMOS impostors) · 28. Shadow IT, Sunlit (close all Shadow IT cases) · 29. Bounty Hunter (25 bounties) · 30. Warrant Served (5 Warrants) · 31. Bronze/Silver/Gold/Platinum Warrington (one each, four achievements 31–34) · 35. Obsidian · 36. Casebook Closed (all 30) · 37. Full Dex · 38. Overdriven (100 Overdrives) · 39. Triage/Escalate/Adjudicate Principal (max a perk branch) · 40. The Cheshire Protocol (true ending + post-game boss).

### 2.10 Real-clock daily & seasonal
- **Day/night** (game clock): 4 bands (dawn 05:00–08:00, day 08:00–18:00, dusk 18:00–21:00, night 21:00–05:00 — the same bands SYSTEMS-SPEC abilities such as Nightshift use). Night has different encounter tables and NPCs (night tables begin in Ch.2); Inns let you sleep to skip bands (costs a little money) so nothing is hard-locked to a wall-clock.
- **Weekday** (real clock): Wednesday wall training day (Chester); Saturday market (Nantwich, rare ingredients); Sunday deer rut (Tatton, STAGWIRE alpha bounty); Friday arcade double tokens.
- **Monthly** (real clock): one *Season Case* per calendar month rotating through 12 mini-events (Jan Wassail at Y Berllan; May Knutsford Royal May Day parade quiz; June Frodsham hill fair; Oct Halloween static-creature surge; Nov Chester Christmas market; Dec Wassail 2). Missed months return next year; each gives a cosmetic + Marks.
- **Daily login-ish**: the cats bring a "gift" each new real day (an ingredient/capsule) — only when you actually talk to them.

### 2.11 Mini-games (4)
1. **Warrington Wire Arcade** — three cabinets: *Packet Run* (endless runner, tap to jump/dodge on a lane), *Salt Rush* (match-3-lite with cascade), *Type Trainer* (a type-effectiveness reflex quiz — the game's own tutorial dressed as a cabinet). Tokens → cosmetics, Skill Cards.
2. **Knutsford Quiz** (Madam Gaskell's rooms) — 5-question rounds on Cheshire places, monster types and Gaskell trivia; Perfect run daily rewards Marks.
3. **Anderton Boat Lift puzzle** — weight balancing across two caissons; later variants add "wet" crates that gain weight over time.
4. **Crewe Timetable puzzle** — platform allocation grid; late rounds add a "delay" card that shifts a train.

---

## 3. COMPANION CAT: MEADOW

- **Following**: MEADOW walks behind you (call her in or let her go by whistling in the pause menu). She moves fast and darts ahead when idle, then gives up on you and sits down when you stop.
- **Sniffing**: an idle animation + a paw-print emote when within 3 tiles of a hidden item, ripe ingredient, or a Bounty clue. Tap the cat to reveal. MEADOW smells *items/ingredients* first; with nothing left to dig up she reads the grass instead, and the prompt reveals the encounter species chance for the tile.
- **Cat-only paths**: `k` tiles (cat gaps in fences, hedge tunnels, wall tops). Send the cat through with a button; the cat retrieves an item or triggers a lever, sometimes battling a small creature alone (auto-resolved with trust as the stat).
- **Trust levels (0–5)**: earned by feeding (Cat's Cup, fish), winning with her in the active slot, choosing kind quest options, daily gifts. Perks: T1 sniff range 5; T2 she carries a held item; T3 she dodges the first hit of a battle once per fight; T4 she can be sent to auto-fish/gather while you're elsewhere (real-time timers); T5 she can accompany you *inside* gyms and the Arena, and learns a signature *regular* move (*Skitter* — priority +1, steals 1 spe stage). Her Overdrive signature (SYSTEMS-SPEC §7) is separate: *Zoomies*.
- Battle: MEADOW is a party member with a fixed species but grows like the others; she never goes to the box, and can be set to "reserve" without leaving.

---

## 4. TRAINER PROGRESSION

- **Trainer Level 1–50**: XP from battles won (not per-monster), cases closed, bounties, photos, brews (exact values in SYSTEMS-SPEC §8). Each level: +1 perk point (5 more from Marks/quests). Every monster has its one held slot from the start (Q1 teaches it); Trainer level gates *trinket* slots (L20: trinket slot on the trainer; L35: second trinket).
- **Perk tree, three branches named for Jim's job and mirroring the Agent Trio** (canonical names from STORY-BIBLE §6; the full 10-perk lists and ids are SYSTEMS-SPEC §8 — this is the flavour summary):
  - **TRIAGE** (SLEET; offence, speed, scouting): Tracker (encounter tables shown per tile), Quick Draw (first move +1 priority once per battle), Overclocker (Overdrive gain +), Focused (crit rate +), Ambush (start battle at +1 Spe vs wild), Trailblazer (run speed), Exploit, agent node *Sharp Triage* (SLEET cooldown −1), capstone *Kill Chain* (chain KOs raise atk).
  - **ESCALATE** (VIGIL; healing, status, the cats): Containment (status inflicted on you lasts 1 turn less), Backup (VIGIL heals more), Isolation (switch-out is free of the free hit), Rollback (revert one faint per gauntlet), Patch (potions +25%), Cat Handler (trust gain ×1.5), Fail-Safe Protocol (Brink twice), agent node *Escalation* (VIGIL cooldown −1), capstone *Incident Commander* (all party +1 Def when a mon faints).
  - **ADJUDICATE** (ARBITER; stat control, catching, boss phase breaks, information): Enumerate (see enemy moves), Fingerprint (traits visible), Timeline (see turn order), Steady Hand (capture window), Soft Touch (capsule bonus), Zero Trust (ignore foe positive stages), Phase Break (boss phase heals capped lower), agent node *Iron Bell* (ARBITER cooldown −2), capstone *Attribution* (once per battle copy the foe's stat stages).
  - The Y Berllan choice (Wipe/Feed) re-specs the three agent nodes for free.
- **Gear/held items**: 1 per mon (list in SYSTEMS-SPEC §3); sources: quests, Arena Chips, brewing, Warrants. Trainer trinkets (worn by Jim, not a monster): *Sprint Soles*, *Davy Lamp*, *Ghost Lens*, *Bait Tin*, *Rain Cloak* (rain no longer slows walking; distinct from the *Rain Jar* battle item), *Wool Cap*, *Field Notebook*.
- **Money sinks** (currency: *credits*): Inn sleeps (band skip), rail fares, brew barrels (upgrade to 5), rod tiers, Arena entry, respec (Casebook Marks, at any Care centre's casebook desk), house in Macclesfield (cosmetic + trophy room), donation to Frodsham beacon (cosmetic sky), cat collars, dex prints.

---

## 5. POST-GAME PLAN

1. **The Stack, Cold** — after the credits, THE STACK at Daresbury re-opens as a dungeon of 5 floors (racks as maze), night-only weather inside ("cooling fog"), the AMOS remnant wearing Jim's face as a 3-phase boss (`amos_jim_face`, Achievement 40).
2. **Legendary Round Two** — MERLYNX (full dex, on the press at Y Berllan), TERRATAUR (Marston depth 3), ZEPHYRION (Beeston/Mow Cop at storm weather), GLITCHRA (Jodrell dish, night band; first catchable right after Ch.11) become properly catchable, each with a skill-check catch; the sleeping knights' hall in the Edge Caverns guards their legendary-tier variants (`knights_hall_open`).
3. **VEX rematches** — weekly, escalating; under Challenge the Roodee rematch (`roodee_rematch`) is where the reconciliation happens; VEX's independent audit league follows.
4. **Obsidian Arena**, rematch tier 5 for all leaders, Bounty Warrants tier 2.
5. **Casebook Epilogues** — 6 short returns (Priya's bike shop, the memorial cat, the choir) that pay in cosmetics.
6. **New Game+**: keep dex, cats' trust, perk points halved; enemy levels +10; Nightmare difficulty (SYSTEMS-SPEC §13) offered by default.
7. **The Fifth Pulse** (STORY-BIBLE §7 post-game): Chester Zoo penguin case, Ellesmere Port salt-tier mirror, Ince Marshes listening post, the walk from Aberaeron to the orchard, Nino's last letter.

---

## 6. REWARD PACING TABLE

| Chapter (STORY-BIBLE) | Region | Monster Lv band | Trainer L target | Cases opening | Systems unlocked | Marquee reward |
|---|---|---|---|---|---|---|
| 1 Silk and Static | Macclesfield, Bollington (Poynton, Prestbury, Lyme optional) | 3–8 | 1–4 | Q1, Q2, Q3, Q7 | fishing tier 1, cat sniffing, held items, CASEBOOK, SLEET | Silk Wrap, first perk points |
| 2 The Wheel and the Edge | Wilmslow, Styal, Lindow Moss, Alderley Edge | 8–14 | 4–8 | Q4, Q5 | photo mode, Davy Lamp, night tables, OVERDRIVE, VIGIL, Billhook | Badge PACKET, Weighted Line |
| 3 Picnic Blankets | Knutsford, Tatton, Rostherne | 13–18 | 8–12 | Q8, Q9 | quiz, sand-pattern favours, Gaskell rumour drops, ARBITER | Badge CIPHER, Sprint Soles |
| 4 The Dish Goes Dark | Holmes Chapel, Jodrell gate, Congleton | 17–22 | 12–16 | Q6, Q10, Q11 | SIGNAL METER, CUTOVER counter, rematches, Shove, Gritstone Grips (optional) | Badge BEAR, Ghost Lens |
| 5 Puppets on the Line | Sandbach, Crewe | 21–26 | 16–20 | Q12, Q13, Q15, Q16 | bounty board, rail hub + Railcard, timetable puzzle, Skill Cards, revive shrine | Badge KERNEL, Conductor's Whistle, first Warrant |
| 6 Brine and Perry | Nantwich, Y Berllan | 25–30 | 20–24 | Q17, Q18, Q30 (opens) | brewing tier 1–2, Hack Green key | Badge TOKEN, Clarifier |
| 7 Salt | Middlewich, Winsford, Northwich, Anderton | 29–34 | 24–28 | Q14, Q19, Q20, Q21, Q22, Q25 | Narrowboat, Salt Mine, boat-lift puzzle, Lift Pass, night visits | Badge DAEMON, Salt Lantern, Legendary fishing table |
| 8 The Ruin | Delamere, Tarporley, Beeston | 33–37 | 28–31 | Q26 (Q30 completable) | VEX double battles (Verify), Beeston rematch arena, dex habitats | Field Notebook, brewing tier 3 |
| 9 Bridge Traffic | Frodsham, Runcorn, THE STACK | 36–41 | 31–35 | Q23, Q24 | Waders, Proxy Goggles, Arena (Bronze/Silver), one-shot events | Badge PROXY, Arena Chips |
| 10 Draw Your Own Conclusions | Lymm, Warrington | 40–45 | 35–39 | Q27, Q28 | arcade, Gold/Platinum, weekday events | Badge ADMIN, Arcade Pass |
| 11 The Sky Is Quiet | Jodrell Bank | 44–50 | 39–43 | — | ending branch, PIPPIN (Custody) | GLITCHRA catchable |
| 12 THE FIREWALL | Chester (city open from Badge 6) | 48–56 | 43–47 | Q29 | wall circuit, White Hat checks | Wallwalker, 2nd trinket slot, ending |
| Post | The Stack (cold), Zoo, Ellesmere Port, Ince, Edge Caverns B3, Y Berllan | 55–70 | 47–50 | Epilogues | Obsidian, NG+, Legendary catches, gym tier 5 | Full dex → MERLYNX on the press |

Cadence targets: a new system or a case twist every ~20 minutes of play; a perk point at least every 45 minutes; a Warrant/gauntlet-scale "boss" every ~2 hours; a real-clock hook visible on the map every session.