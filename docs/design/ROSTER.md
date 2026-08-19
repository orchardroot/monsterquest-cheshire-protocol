# MonsterQuest: The Cheshire Protocol — ROSTER (shared id vocabulary, v2)

*This is the contract every workstream codes against. Every id here is **final**: `snake_case`, ASCII, unique within its table. Implementers add fields (stats, learnsets, art, scripts) but never rename an id. Where a design doc used a different spelling, this file wins and the deviation is noted. British English in display strings.*

Conventions used throughout:
- **Types (13):** `normal fire water grass electric flying bug poison rock ground psychic ghost cyber` (lower-case ids; display capitalised). Type chart = `js/data.js` TYPE_CHART carried forward.
- **Chapters / level bands** (STORY-BIBLE §7 is canonical): Ch1 3–8 · Ch2 8–14 · Ch3 13–18 · Ch4 17–22 · Ch5 21–26 · Ch6 25–30 · Ch7 29–34 · Ch8 33–37 · Ch9 36–41 · Ch10 40–45 · Ch11 44–50 · Ch12 48–56 · PG 55–70.
- **Rarity:** `common | uncommon | rare | legendary | unique` (unique = story-gift/boss-only, never in wild tables).
- **BST tier:** low ≤ 300 · mid 301–400 · high 401–500 · legendary > 500. Six stats `hp atk def spa spd spe`.
- **Habitat tags** (species `habitat`, also used by encounter table ids): `town silk mill moor bog cave sandstone estate mere rail salt brine canal river marsh fog cyber roman orchard forest heath zoo urban station chem sky`.
- **Evolution methods** (SYSTEMS-SPEC §12): `level:N` · `item:<item_id>` · `friendship[:day|night]` · `location:<map_id>` · `time:night@N` · `trade` · `move:<move_id>` · `weather:rain@N`.

---

## 1. SPECIES (172)

Dex order = roughly the order the player meets them. `overdrive` = the line's Overdrive signature move id (see §2.15). Story/boss forms are listed with `form:` in the evolution column and are not counted as dex entries.

### 1a. Starters, cats, gifts

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 001 | `silkin` | SILKIN | bug/grass | silk | unique | → `spindrake` level:16 | low | `jacquard_weave` | Mulberry-fed silkworm from Paradise Mill; spins a thread it never lets go of | Ch1 Macclesfield (starter) |
| 002 | `spindrake` | SPINDRAKE | bug/grass | silk | rare (wild night morph R1/Bollington) | → `loomoth` level:34 | mid | `jacquard_weave` | Silk moth in a bobbin cocoon; the Bollington morph is honey-coloured | Ch1 starter; wild Ch1 night |
| 003 | `loomoth` | LOOMOTH | bug/grass | silk | unique | — | high | `jacquard_weave` | Jacquard-winged great moth; punch-card patterns on its wings | Ch4 (evolve) |
| 004 | `brinewt` | BRINEWT | water | brine | unique | → `saltander` level:16 | low | `brine_tide` | Salt-newt from the Nantwich brine springs; skin crusts white when scared | Ch1 Macclesfield (starter) |
| 005 | `saltander` | SALTANDER | water/ground | brine | unique | → `halosaur` level:34 | mid | `brine_tide` | Bigger, muddier, brine-crusted; leaves salt footprints | Ch2 (evolve) |
| 006 | `halosaur` | HALOSAUR | water/ground | brine | unique | — | high | `brine_tide` | Great salt-newt with a halite crown; brine pours from its gills | Ch4 (evolve) |
| 007 | `kindlin` | KINDLIN | fire | mill | unique | → `stokerel` level:16 | low | `firebox_overload` | Mill-ember imp from a boiler house; lives on coal dust and gossip | Ch1 Macclesfield (starter) |
| 008 | `stokerel` | STOKEREL | fire | mill | unique | → `furnacore` level:34 | mid | `firebox_overload` | Furnace-doored bruiser; shovels its own coal | Ch2 (evolve) |
| 009 | `furnacore` | FURNACORE | fire/electric | mill | unique | — | high | `firebox_overload` | Mill engine come alive: firebox, flywheel, arcing brushes | Ch4 (evolve) |
| 010 | `meadow` | MEADOW | normal | town | unique | — | mid | `zoomies` | Small black cat, absurdly fast; ability `slipstream`; never boxed | Ch1 gift |
| 011 | `bigboy` | BIGBOY | normal | town | unique | — | high | `brink_roar` | Huge black-and-white cat; ability `back_from_the_brink`; sits down when he likes | Ch1 gift |

### 1b. Chapter 1 belt — Macclesfield, Bollington, Prestbury, Poynton, Lyme (Lv 3–8)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 012 | `nibbit` | NIBBIT | normal | canal | common | → `gnawlord` level:18 | low | `od_normal` | Towpath rat with a bottle-top shield | Ch1 R1 |
| 013 | `gnawlord` | GNAWLORD | normal | canal | uncommon | — | mid | `od_normal` | Rat king of the Hovis mill cellars | Ch3 |
| 014 | `flitchick` | FLITCHICK | normal/flying | town | common | → `galewing` level:18 | low | `od_flying` | Treacle Market pigeon; steals pastry | Ch1 Macclesfield |
| 015 | `galewing` | GALEWING | normal/flying | moor | uncommon | — | mid | `od_flying` | Broad-winged hill pigeon riding the Kerridge updraught | Ch3 |
| 016 | `flitmoth` | FLITMOTH | bug | canal | common (night) | → `bollinmoth` level:14 | low | `od_bug` | Canal silk-moth; swarms Clarence Mill lights | Ch1 R1 night |
| 017 | `bollinmoth` | BOLLINMOTH | bug/flying | canal | uncommon (night) | — | mid | `od_bug` | Big grey Bollin moth with mill-window eyespots | Ch2 R4 night |
| 018 | `bobbinet` | BOBBINET | bug/psychic | silk | uncommon | → `jacquarda` level:30 | low | `od_psychic` | Loom-sprite: a bobbin that runs its own pattern | Ch1 Paradise Mill |
| 019 | `jacquarda` | JACQUARDA | bug/psychic | silk | rare | — | high | `od_psychic` | Punch-card weaver; the first programmable thing in Cheshire | Ch5 |
| 020 | `towpaddle` | TOWPADDLE | water | canal | common | → `mallardier` level:20 | low | `od_water` | Canal duckling in a bread-bag | Ch1 R1 |
| 021 | `mallardier` | MALLARDIER | water/flying | canal | uncommon | — | mid | `od_water` | Drake in a lock-keeper's cap; commandeers narrowboats | Ch3 |
| 022 | `sootling` | SOOTLING | fire | mill | common | → `chimnyx` level:24 | low | `od_fire` | Chimney-soot imp from the mill stacks | Ch1 Macclesfield |
| 023 | `chimnyx` | CHIMNYX | fire/ghost | mill | uncommon | — | mid | `od_fire` | Ghost of a chimney sweep's brush, still smouldering | Ch4 |
| 024 | `nancylith` | NANCYLITH | rock | moor | rare | — | mid | `od_rock` | Sugar-loaf folly spirit off White Nancy; repainted every year | Ch1 Kerridge Hill |
| 025 | `mistlop` | MISTLOP | normal | moor | common | → `harrowlop` level:22 | low | `od_normal` | Moor hare that hides in mist | Ch1 R2 |
| 026 | `harrowlop` | HARROWLOP | normal/ground | moor | uncommon | — | mid | `od_ground` | Gritstone hare with quarry-slab feet | Ch3 |
| 027 | `pitpony` | PITPONY | ground | mill | common | → `coalcob` level:26 | low | `od_ground` | Poynton pit pony, lamp on its brow | Ch1 Poynton |
| 028 | `coalcob` | COALCOB | ground/fire | mill | uncommon | — | mid | `od_ground` | Coal-black cob that breathes seam gas | Ch4 |
| 029 | `sparkit` | SPARKIT | electric | town | common | → `fulgurcat` level:22 | low | `od_electric` | Static kitten that lives behind CCTV boxes | Ch1 Prestbury |
| 030 | `fulgurcat` | FULGURCAT | electric | town | uncommon | — | mid | `od_electric` | Lightning wildcat; fur stands on end permanently | Ch3 |
| 031 | `puddlish` | PUDDLISH | water | mere | common | → `torrentide` level:20 | low | `od_water` | Poynton Pool minnow (fishing tutorial) | Ch1 Poynton Pool |
| 032 | `torrentide` | TORRENTIDE | water | river | uncommon | — | mid | `od_water` | Weir-jumping river fish | Ch3 |
| 033 | `peepcam` | PEEPCAM | cyber | town | uncommon | → `panoptix` level:30 | low | `od_cyber` | A CCTV camera that grew legs; Prestbury has too many | Ch1 Prestbury |
| 034 | `panoptix` | PANOPTIX | cyber/psychic | urban | rare | — | high | `od_cyber` | Many-lensed watcher; sees every stat stage | Ch5 |
| 035 | `grousel` | GROUSEL | flying/ground | moor | common | → `moorcock` level:26 | low | `od_flying` | Red grouse in the heather | Ch1 R3 |
| 036 | `moorcock` | MOORCOCK | flying/ground | moor | uncommon | — | mid | `od_flying` | Strutting moor bird with a fell-runner's stamina | Ch4 |
| 037 | `mistewe` | MISTEWE | normal | moor | common | — | mid | `od_normal` | Mist-sheep of the Peak fringe; ability `thick_fleece` | Ch1 R3 |
| 038 | `piphart` | PIPHART | normal | estate | common | → `stagwire` level:24 | low | `od_electric` | Lyme/Tatton fawn; MEADOW chases them | Ch1 Lyme Park |
| 039 | `stagwire` | STAGWIRE | normal/electric | estate | uncommon | — | mid | `od_electric` | Red stag whose antlers pick up the signal; census species (8 antler patterns) | Ch3 Tatton |

### 1c. Chapter 2 belt — Wilmslow, Styal, Lindow Moss, Alderley Edge, Edge Caverns (Lv 8–14)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 040 | `sheepwire` | SHEEPWIRE | electric | estate | common | → `ramvolt` level:24 | low | `od_electric` | Farm sheep with a fleece full of static; the Stuffers farm them for compute | Ch2 R6 |
| 041 | `ramvolt` | RAMVOLT | electric | estate | uncommon | — | mid | `od_electric` | Ram with copper-coil horns | Ch4 |
| 042 | `heronet` | HERONET | water/flying | river | common | → `herowing` level:22 | low | `od_water` | Bollin heron chick, all legs | Ch2 The Carrs |
| 043 | `herowing` | HEROWING | water/flying | river | uncommon | — | mid | `od_water` | Grey heron of the Trentabank heronry | Ch3 |
| 044 | `sluiceling` | SLUICELING | water | mill | common | → `millrace` level:25 | low | `od_water` | Water-wheel sprite from Quarry Bank's sluices | Ch2 Styal |
| 045 | `millrace` | MILLRACE | water/rock | mill | uncommon | — | mid | `od_water` | Iron-wheel golem; turns at 3am if it must | Ch4 |
| 046 | `puppetacct` | PUPPETACCT | cyber | fog | common (fog only) | — | low | `od_cyber` | Credential Stuffer puppet; spawns and despawns like a bad login | Ch2 Lindow fog |
| 047 | `botling` | BOTLING | cyber/bug | cyber | uncommon | → `botnetle` level:22 | low | `od_cyber` | Botnet beetle nesting in a smart fridge | Ch2 Styal |
| 048 | `botnetle` | BOTNETLE | cyber/bug | cyber | uncommon | — | high | `od_cyber` | Armoured C2 beetle; the tuba nest at Bollington | Ch5 |
| 049 | `mistwisp` | MISTWISP | ghost/poison | bog | common (night) | → `phantasmal` level:30 | low | `od_ghost` | Bog wisp of Lindow Moss | Ch2 Lindow |
| 050 | `phantasmal` | PHANTASMAL | ghost/poison | bog | uncommon | — | mid | `od_ghost` | Marsh-gas phantom that keeps a data lake | Ch6 |
| 051 | `bogleap` | BOGLEAP | water/poison | bog | common | → `toadlore` level:26 | low | `od_water` | Peat-brown newt-toad | Ch2 Lindow |
| 052 | `toadlore` | TOADLORE | water/poison | bog | uncommon | — | high | `od_water` | Great toad that remembers every story told on the Moss | Ch4 |
| 053 | `peatkin` | PEATKIN | ground/ghost | bog | uncommon | → `lindowan` level:28 | low | `od_ghost` | Preserved husk in the peat | Ch2 Lindow |
| 054 | `lindowan` | LINDOWAN | ground/ghost | bog | rare | — | high | `od_ghost` | The Preserved One — Lindow's bog-body guardian (mini-boss) | Ch2 Lindow boss |
| 055 | `cuprabug` | CUPRABUG | bug/rock | cave | common | → `verdigrit` level:26 | low | `od_rock` | Copper-mine beetle with a verdigris shell | Ch2 Edge Caverns |
| 056 | `verdigrit` | VERDIGRIT | bug/rock | cave | uncommon | — | mid | `od_rock` | Ore-armoured stag beetle; ability `stonemason` | Ch5 |
| 057 | `squeakwing` | SQUEAKWING | poison/flying | cave | common | → `shriekwing` level:22 | low | `od_flying` | Pipistrelle with a sour bite | Ch2 Edge Caverns |
| 058 | `shriekwing` | SHRIEKWING | poison/flying | cave | uncommon | — | mid | `od_poison` | Cave bat whose shriek curdles milk | Ch4 |
| 059 | `gloamite` | GLOAMITE | ghost/rock | cave | uncommon | → `gloamguard` location:edge_caverns_knights | low | `od_rock` | A sleeping knight's helm that dreams | Ch2 Edge Caverns |
| 060 | `gloamguard` | GLOAMGUARD | ghost/rock | cave | rare | — | high | `od_rock` | One of the Edge's sleeping knights, woken early | Ch8 |
| 061 | `owlume` | OWLUME | flying/psychic | forest | uncommon (dusk/night) | → `strigyx` level:26 | low | `od_psychic` | Sandhills owlet with lamp-glow eyes | Ch2 R7 dusk |
| 062 | `strigyx` | STRIGYX | flying/psychic | forest | rare | — | high | `od_psychic` | Great owl that reads the wind's mind | Ch8 Arley night |
| 063 | `webshade` | WEBSHADE | bug/ghost | mill | common (night) | → `widowisp` level:27 | low | `od_bug` | Cobweb spider from a derelict weaving shed | Ch2 Styal night |
| 064 | `widowisp` | WIDOWISP | bug/ghost | mill | uncommon | — | high | `od_bug` | Ghost-silk spider; ability `silk_weave` | Ch6 |
| 065 | `merlynx` | MERLYNX | psychic/ghost | cave | legendary | — | legendary | `knights_waking` | The Wizard's cat; guards the Cave of the Knights and MEADOW's opinion of everyone | Ch2 sighting; PG catchable |

### 1d. Chapter 3 belt — Knutsford, Tatton, Rostherne, Chelford (Lv 13–18)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 066 | `quillet` | QUILLET | psychic | town | common | → `scriptorix` level:28 | low | `od_psychic` | Inkwell sprite from the Gaskell tower | Ch3 Knutsford |
| 067 | `scriptorix` | SCRIPTORIX | psychic | town | uncommon | — | high | `od_psychic` | A manuscript that writes back; runs Knutsford's rumour network | Ch5 |
| 068 | `perchip` | PERCHIP | water | mere | common | → `piketide` level:22 | low | `od_water` | Mere perch, stripy and cross | Ch3 Tatton Mere |
| 069 | `piketide` | PIKETIDE | water | mere | uncommon | — | mid | `od_water` | Tatton pike; the carp-line's worst enemy | Ch4 |
| 070 | `swanling` | SWANLING | water/flying | mere | common | → `swanguard` level:26 | low | `od_flying` | Cygnet with a bad temper | Ch3 Tatton |
| 071 | `swanguard` | SWANGUARD | water/flying | mere | uncommon | — | high | `od_flying` | Mute swan of the Knutsford Gate; breaks arms, apparently | Ch6 |
| 072 | `manorwraith` | MANORWRAITH | ghost | estate | rare (night) | — | high | `od_ghost` | Tudor ghost trainer of the Old Hall | Ch3 Tatton night |
| 073 | `bellmere` | BELLMERE | water/ghost | mere | rare | — | mid | `od_ghost` | The drowned bell of Rostherne; rings under the water | Ch3 Rostherne |
| 074 | `prickpip` | PRICKPIP | grass | heath | common | → `bramblehog` level:20 | low | `od_grass` | Hedgehog with bramble spines | Ch3 R8 |
| 075 | `bramblehog` | BRAMBLEHOG | grass | heath | uncommon | → `thornarch` item:billhook_charm | mid | `od_grass` | Bramble-backed hedgehog | Ch4 |
| 076 | `thornarch` | THORNARCH | grass | heath | rare | — | high | `od_grass` | Laid-hedge colossus; ability `deep_roots` | Ch8 Tarporley |

### 1e. Chapter 4 belt — Holmes Chapel, Jodrell grounds, Congleton, the Cloud, Mow Cop, Little Moreton (Lv 17–22)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 077 | `poltergrid` | POLTERGRID | cyber/ghost | rail | rare (night) | — | high | `od_cyber` | Nests in signal-box telemetry noise; moves the levers at 03:00 | Ch4 Holmes Chapel night |
| 078 | `keystone` | KEYSTONE | rock | rail | common | → `viaductus` level:30 | low | `od_rock` | Viaduct-arch sprite; one per arch at Twemlow | Ch4 R10 |
| 079 | `viaductus` | VIADUCTUS | rock | rail | uncommon | — | high | `od_rock` | Twenty-three arches walking | Ch7 |
| 080 | `dishlet` | DISHLET | cyber/psychic | sky | uncommon | → `parabolus` location:jodrell_grounds | low | `od_cyber` | Small radio-dish creature; turns to face the signal | Ch4 Jodrell grounds |
| 081 | `parabolus` | PARABOLUS | cyber/psychic | sky | rare | — | high | `od_cyber` | Lovell-dish sentinel; listens for seventy years | Ch10 |
| 082 | `pulsaris` | PULSARIS | electric/psychic | sky | rare (night) | — | high | `od_electric` | Static tuned to a pulsar; ticks in a fixed period | Ch4 Jodrell night |
| 083 | `cubbin` | CUBBIN | normal/ground | town | uncommon | → `bruinhall` level:28 | low | `od_ground` | Beartown cub; the town sold its Bible for it | Ch4 Congleton |
| 084 | `bruinhall` | BRUINHALL | normal/ground | town | rare | — | high | `od_ground` | The Congleton Bear; Otis's ace | Ch4 gym; wild on the Cloud |
| 085 | `runestane` | RUNESTANE | rock/psychic | moor | uncommon | → `dolmenor` level:30 | low | `od_rock` | Bridestone rune-rock that hums in fog | Ch4 the Cloud |
| 086 | `dolmenor` | DOLMENOR | rock/psychic | moor | rare | — | high | `od_rock` | Chambered-tomb guardian | Ch8 |
| 087 | `mowstane` | MOWSTANE | rock/ground | moor | rare | — | high | `od_rock` | The Old Man of Mow: a gritstone pillar that walks at night | Ch4 Mow Cop |
| 088 | `tudorling` | TUDORLING | ghost/grass | estate | uncommon | → `timberwraith` level:32 | low | `od_ghost` | Wonky black-and-white timber sprite of Little Moreton Hall | Ch4 Little Moreton |
| 089 | `timberwraith` | TIMBERWRAITH | ghost/grass | estate | rare | — | high | `od_ghost` | The whole crooked house, standing up | Ch8 |
| 090 | `otterkin` | OTTERKIN | water | river | common | → `lutrarch` level:28 | low | `od_water` | Dane otter pup | Ch4 R11 |
| 091 | `lutrarch` | LUTRARCH | water/ground | river | uncommon | — | high | `od_water` | River-lord otter with a fish-bone crown | Ch7 |
| 092 | `rottling` | ROTTLING | grass/poison | orchard | uncommon | → `mulchmaw` level:26 | low | `od_poison` | Rotten-apple imp that steals berries (Bounty "Bramble") | Ch4 Sandbach bounty |
| 093 | `mulchmaw` | MULCHMAW | grass/poison | orchard | uncommon | — | mid | `od_poison` | Compost-heap maw | Ch6 |

### 1f. Chapter 5 belt — Sandbach, Crewe, Wybunbury (Lv 21–26)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 094 | `belfrit` | BELFRIT | normal | town | common | → `crossbell` level:30 | low | `od_normal` | Bell-sprite from the Sandbach Old Hall bell; sound moves | Ch5 Sandbach |
| 095 | `crossbell` | CROSSBELL | rock/normal | roman | uncommon | — | high | `od_normal` | Saxon-cross bell-golem; ability `loud_bell` | Ch7 |
| 096 | `chuglet` | CHUGLET | fire | rail | common | → `shunterra` level:24 | low | `od_fire` | Tank-engine hatchling with a whistle | Ch5 R14 |
| 097 | `shunterra` | SHUNTERRA | fire/ground | rail | uncommon | → `steamloco` level:40 | mid | `od_fire` | Shunting loco with buffers for shoulders | Ch5 Crewe Works |
| 098 | `steamloco` | STEAMLOCO | fire/ground | rail | rare | form:`steamloco_overfired` (Di's ace at 50%; changeForm keepHp) | high | `od_fire` | Express steam locomotive; Di's ace | Ch5 gym; wild PG Crewe Works |
| 099 | `sparkrail` | SPARKRAIL | electric | rail | common (night) | → `pantogriff` level:30 | low | `od_electric` | Third-rail spark that jumps the sidings | Ch5 R14 night |
| 100 | `pantogriff` | PANTOGRIFF | electric/flying | rail | uncommon | — | high | `od_electric` | Pantograph griffin that rides the overhead line | Ch7 |
| 101 | `sleeperk` | SLEEPERK | ground/grass | rail | uncommon | — | mid | `od_ground` | Creosoted rail sleeper that sleeps; ability `cold_storage` | Ch5 R14 |
| 102 | `bricklum` | BRICKLUM | rock/ground | rail | uncommon | — | high | `od_rock` | Works-brick golem, sooty and square | Ch5 Crewe Works |
| 103 | `curdli` | CURDLI | normal | town | common | → `cheshwheel` level:26 | low | `od_normal` | Cheese-curd blob | Ch5 Sandbach market |
| 104 | `cheshwheel` | CHESHWHEEL | normal/ground | town | uncommon | — | high | `od_normal` | Rolling Cheshire cheese wheel; Nantwich Cheese Show champion | Ch6 |

### 1g. Chapter 6 belt — Nantwich, Y Berllan (Lv 25–30)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 105 | `saltling` | SALTLING | rock | salt | common | → `cryssal` level:22 | low | `od_rock` | Salt-golem pup; runs away from the mine | Ch6 Nantwich lido |
| 106 | `cryssal` | CRYSSAL | rock | salt | uncommon | → `salberg` level:38 | mid | `od_rock` | Halite crystal golem; ability `salt_crust` | Ch6 |
| 107 | `salberg` | SALBERG | rock/water | salt | rare | — | high | `od_rock` | Salt berg with a brine core | Ch7 Salt Mine |
| 108 | `brinelet` | BRINELET | water | brine | common | → `saltmaid` level:30 | low | `od_water` | Brine sprite from the springs; ability `brine_body` | Ch6 Nantwich |
| 109 | `saltmaid` | SALTMAID | water/psychic | brine | uncommon | — | high | `od_water` | Brine-pool naiad; Nell's ace | Ch6 gym |
| 110 | `crabbex` | CRABBEX | water/rock | river | common | → `krabbaron` location:anderton_lift | low | `od_water` | Weaver salt-crab | Ch6 R16 |
| 111 | `krabbaron` | KRABBARON | water/rock | canal | uncommon | — | high | `od_water` | Boat-lift crab, iron-clawed | Ch7 Anderton |
| 112 | `volteel` | VOLTEEL | electric/water | river | uncommon | — | high | `od_electric` | Weaver eel that shorts out swing bridges | Ch6 R16 (fishing) |
| 113 | `perrypip` | PERRYPIP | grass | orchard | common | → `perryarch` location:y_berllan_orchard | low | `od_grass` | Perry-pear sprite from Y Berllan | Ch6 Y Berllan |
| 114 | `perryarch` | PERRYARCH | grass/ground | orchard | uncommon | — | high | `od_grass` | Elm-press treant; ability `deep_roots` | Ch6 Y Berllan |
| 115 | `brithyll` | BRITHYLL | water | orchard | rare | — | mid | `od_water` | Welsh brown trout from the orchard pond (Welsh-only riddle) | Ch6 Y Berllan pond |
| 116 | `ceffylwen` | CEFFYLWEN | normal/psychic | orchard | rare | — | high | `od_psychic` | The milk-white mare of the legend; opens the knights' chamber | Ch6 Y Berllan (Welsh riddle) |
| 117 | `derwydd` | DERWYDD | grass/psychic | orchard | rare | — | high | `od_grass` | Oak-druid guardian of Coed y Berllan | Ch6 Coed y Berllan |
| 118 | `panscald` | PANSCALD | fire/water | salt | uncommon | — | mid | `od_fire` | Hot brine-pan spirit from the Lion Salt Works | Ch6 Nantwich; Ch7 Northwich |

### 1h. Chapter 7 belt — Middlewich, Winsford, Northwich, Salt Mine, Anderton, Marbury, Great Budworth (Lv 29–34)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 119 | `terrataur` | TERRATAUR | rock/ground | salt | legendary | — | legendary | `salt_cathedral` | Salt-cathedral bull asleep under Northwich; buildings tilt when it turns | Ch7 Salt Mine |
| 120 | `pillarnaut` | PILLARNAUT | rock/ground | salt | uncommon | — | mid | `od_rock` | Pillar-and-stall support golem | Ch7 Salt Mine |
| 121 | `bargemog` | BARGEMOG | normal/water | canal | uncommon | — | mid | `od_normal` | Narrowboat cat; sleeps on the tiller | Ch7 canals |
| 122 | `ladymere` | LADYMERE | ghost/psychic | mere | rare (night) | — | high | `od_ghost` | The Marbury Lady | Ch7 Marbury night |
| 123 | `flashfin` | FLASHFIN | water/rock | salt | uncommon | → `subsidon` level:34 | low | `od_water` | Winsford Flashes fish, salt-scaled | Ch7 Winsford (fishing) |
| 124 | `subsidon` | SUBSIDON | water/ground | salt | rare (dawn) | — | high | `od_ground` | The thing that surfaces in the flashes | Ch7 Winsford dawn (fishing) |
| 125 | `chordle` | CHORDLE | cyber/normal | town | rare | — | mid | `od_cyber` | Sings on the third turn; mimics the ClickFix hymn (Q21, flees) | Ch7 Middlewich |
| 126 | `bitmite` | BITMITE | cyber | cyber | common | → `teramite` level:34 | low | `od_cyber` | Data mite from the DeepStore archives | Ch7 Winsford DeepStore |
| 127 | `teramite` | TERAMITE | cyber | cyber | rare | — | high | `od_cyber` | Archive-devouring mite queen | Ch9 THE STACK |
| 128 | `virling` | VIRLING | cyber/poison | cyber | common | → `wormhack` level:25 | low | `od_cyber` | Self-replicating worm larva | Ch7 masts |
| 129 | `wormhack` | WORMHACK | cyber/poison | cyber | uncommon | — | high | `od_cyber` | Lateral-movement worm; DARKBYTE construct | Ch7 hideout |
| 130 | `phishfin` | PHISHFIN | cyber/water | mere | uncommon | → `spearphish` level:28 | low | `od_cyber` | Lure-fish wearing a tracker tag | Ch7 Winsford (fishing) |
| 131 | `spearphish` | SPEARPHISH | cyber/water | mere | uncommon | — | high | `od_cyber` | Targeted lure-fish; DARKBYTE construct | Ch7 |
| 132 | `trojanox` | TROJANOX | cyber/ground | cyber | rare | — | high | `od_cyber` | Wooden-ox construct hiding a payload; ability `payload` | Ch7 DARKBYTE hideout |

### 1i. Chapter 8 belt — Delamere, Tarporley, Beeston, Peckforton (Lv 33–37)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 133 | `zephyrion` | ZEPHYRION | electric/flying | sky | legendary | — | legendary | `ridge_storm` | Ridge-wind storm bird; nests on Beeston crag; ability `ridge_wind` | Ch8 Beeston |
| 134 | `mossling` | MOSSLING | grass | forest | common | → `mossbear` level:26 | low | `od_grass` | Moss-covered cub | Ch8 Delamere |
| 135 | `mossbear` | MOSSBEAR | grass/ground | forest | uncommon | — | high | `od_grass` | Blakemere moss bear; ability `deep_roots` | Ch8 Delamere |
| 136 | `oakling` | OAKLING | grass | forest | common | → `groveguard` level:25 | low | `od_grass` | Acorn sprite | Ch8 Delamere |
| 137 | `groveguard` | GROVEGUARD | grass | forest | uncommon | — | mid | `od_grass` | Old Pale oak-warden | Ch8 |
| 138 | `drownwood` | DROWNWOOD | grass/ghost | forest | rare (night) | — | high | `od_ghost` | Drowned-wood stump from Blakemere Moss | Ch8 Delamere night glade |
| 139 | `lampyr` | LAMPYR | bug/electric | forest | uncommon (night) | — | mid | `od_bug` | Glow-worm lantern | Ch8 Delamere night |
| 140 | `hornhound` | HORNHOUND | normal | heath | uncommon | — | mid | `od_normal` | Tarporley hunt hound; ability `scavenger` | Ch8 Tarporley |
| 141 | `falconet` | FALCONET | flying | sandstone | common | → `peregrint` level:30 | low | `od_flying` | Falconer's kestrel-kit | Ch8 Peckforton |
| 142 | `peregrint` | PEREGRINT | flying | sandstone | uncommon | — | high | `od_flying` | Peregrine of Beeston crag; ability `ridge_wind` (rare second) | Ch8 |
| 143 | `gargoylet` | GARGOYLET | rock/flying | sandstone | uncommon | → `grotesquire` level:34 | low | `od_rock` | Sandstone gargoyle chick | Ch8 Beeston |
| 144 | `grotesquire` | GROTESQUIRE | rock/flying | sandstone | rare | — | high | `od_rock` | Cathedral grotesque, come down for the night | Ch12 Chester |

### 1j. Chapter 9 belt — Frodsham, Runcorn, Daresbury, THE STACK, Helsby marsh (Lv 36–41)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 145 | `egrette` | EGRETTE | flying/water | marsh | common | — | mid | `od_flying` | Little egret of Frodsham Marsh | Ch9 R23 |
| 146 | `curlewind` | CURLEWIND | flying | marsh | uncommon | — | mid | `od_flying` | Curlew whose call raises the wind; ability `ridge_wind` | Ch9 R23 |
| 147 | `turbinix` | TURBINIX | electric/flying | marsh | uncommon | — | high | `od_electric` | Wind-turbine construct that turns against the wind | Ch9 Frodsham Marsh |
| 148 | `beaconflare` | BEACONFLARE | fire/flying | sandstone | rare (event) | — | high | `od_fire` | Beacon-fire phoenix from Frodsham Hill | Ch9 beacon event |
| 149 | `smogling` | SMOGLING | poison | chem | common | → `chlorodon` level:30 | low | `od_poison` | Fume-cupboard cloudlet | Ch9 Runcorn |
| 150 | `chlorodon` | CHLORODON | poison | chem | uncommon | — | high | `od_poison` | Chemical-works smog beast; Ria's ace | Ch9 gym |
| 151 | `proxling` | PROXLING | poison/cyber | fog | common (fog only) | — | low | `od_poison` | Residential-proxy puppet in the fog; ability `proxy_fog` | Ch9 R22 fog |
| 152 | `sludgeon` | SLUDGEON | water/poison | river | rare | — | high | `od_poison` | Mersey sturgeon, sludge-scaled (Poison morph fishing) | Ch9 Mersey (fishing) |
| 153 | `grinkit` | GRINKIT | normal | town | uncommon | → `grinmalkin` friendship:night + location:daresbury_church | low | `grin_remains` | A kitten that is mostly grin; the eleven hidden cats are grinkits | Ch9 Daresbury (and 11 hidden across map) |
| 154 | `grinmalkin` | GRINMALKIN | normal/psychic | town | rare | — | high | `grin_remains` | The Cheshire Cat; ability `cheshire_grin`; the story instance is ORACLE's oldest thread | Ch9 Daresbury (story NPC from Ch1) |
| 155 | `mirrorling` | MIRRORLING | psychic/ghost | town | rare | — | high | `od_psychic` | Alice-window mirror creature | Ch9 Daresbury church |
| 156 | `quarkling` | QUARKLING | cyber/electric | cyber | uncommon | → `hadronaut` level:36 | low | `od_cyber` | Beamline particle sprite | Ch9 Daresbury lab |
| 157 | `hadronaut` | HADRONAUT | cyber/electric | cyber | rare | — | high | `od_cyber` | Collider knight; Mo's second | Ch10 |
| 158 | `firewaul` | FIREWAUL | cyber/fire | cyber | rare | — | high | `od_cyber` | Hot-aisle firewall beast; ability `overclock`; Mo's ace | Ch9 THE STACK / Ch10 gym |
| 159 | `droneling` | DRONELING | cyber/flying | cyber | uncommon | → `datadrake` level:30 | low | `od_cyber` | Quad-rotor drone chick | Ch9 THE STACK |
| 160 | `datadrake` | DATADRAKE | cyber/flying | cyber | rare | — | high | `od_cyber` | Exfil dragon made of packet trails | Ch10 |
| 161 | `amoslurk` | AMOSLURK | cyber/ghost | fog | rare | form:`understudy` (boss; changeForm cycles faces) | mid | `od_cyber` | AMOS Lineage stealer wearing a borrowed face | Ch4 glimpse; Ch7+ battles |
| 162 | `shardmind` | SHARDMIND | cyber/psychic | cyber | unique | — | high | `od_cyber` | ORACLE fragment; boss add | Ch9/Ch11 boss adds |
| 163 | `oracle_core` | ORACLE CORE | cyber/psychic | cyber | unique | form:`oracle_core_p2`,`oracle_core_p3` | legendary | `oracle_escalate` | ORACLE's core; three-phase finale boss (cannotCatch) | Ch9/Ch11/PG |

### 1k. Chapters 10–12 and post-game — Lymm, Warrington, Jodrell, Chester, Zoo, Ellesmere Port, Parkgate (Lv 40–70)

| # | id | Name | Types | Habitat | Rarity | Evolution | Tier | Overdrive | Concept | First found |
|---|---|---|---|---|---|---|---|---|---|---|
| 164 | `glitchra` | GLITCHRA | cyber/ghost | sky | legendary | form:`glitchra_static` (boss phase 2/3) | legendary | `static_scream` | Static outline in the dish; ORACLE's herald | Ch10 Lymm sighting; Ch11 boss; PG catchable |
| 165 | `legionet` | LEGIONET | ghost | roman | common (night) | → `centurigeist` level:40 | low | `od_ghost` | Roman legionary ghost from the amphitheatre | Ch12 Chester walls night |
| 166 | `centurigeist` | CENTURIGEIST | ghost/rock | roman | uncommon | — | high | `od_ghost` | Centurion of the Twentieth, still on watch | Ch12 |
| 167 | `salmoneer` | SALMONEER | water | river | rare (dawn/dusk) | — | high | `od_water` | Dee salmon that leaps the weir | Ch12 Chester Dee (Legendary fishing table) |
| 168 | `pengwyn` | PENGWYN | water/flying | zoo | rare | — | mid | `od_water` | Escaped zoo penguin, Welsh-speaking (pen gwyn = white head) | PG Chester Zoo |
| 169 | `girafflor` | GIRAFFLOR | normal/grass | zoo | rare | — | mid | `od_normal` | Zoo giraffe browsing Cheshire hedges | PG Chester Zoo |
| 170 | `pandember` | PANDEMBER | fire | zoo | rare | — | mid | `od_fire` | Red panda with a smouldering tail | PG Chester Zoo |
| 171 | `flarestack` | FLARESTACK | fire/poison | chem | uncommon | — | high | `od_fire` | Refinery flare that signals in code | PG Ellesmere Port |
| 172 | `ebbwraith` | EBBWRAITH | ghost/water | marsh | rare (dusk) | — | high | `od_ghost` | The tide that never came back | PG Parkgate |


### 1l. Species notes for implementers

- **Story instances.** `meadow`, `bigboy`, the three starter lines, `merlynx`, `terrataur`, `zephyrion`, `glitchra`, `grinmalkin` (story), `oracle_core`, `shardmind`, `amoslurk` (boss form `understudy`) are created by scripts, never rolled from wild tables (except where the table lists them explicitly, e.g. `spindrake` night morph, `grinkit`).
- **Boss forms** are separate species entries with the same dex number and `dexHidden:true`: `steamloco_overfired`, `glitchra_static`, `oracle_core_p2`, `oracle_core_p3`, `understudy`.
- **VEX's team** (ids only; levels per STORY-BIBLE bands): starter `stokerel`→`furnacore` if the player took `silkin`; `silkin` line if player took `brinewt`; `brinewt` line if player took `kindlin` (VEX takes the one that beats yours — "tagged" flag `tagged:true` on the instance). Ch1: starter L5. Ch3: starter, `flitchick`, `sparkit`. Ch5: starter, `galewing`, `fulgurcat`, `stagwire`. Ch8 (Understudy copy): mirror of the current VEX party. Ch12 hand-built (Verify): `furnacore`/`loomoth`/`halosaur` (ace, L64), `strigyx`, `stagwire`, `krabbaron`, `datadrake`, `bruinhall`. Ch12 ORACLE-tuned (Challenge): ace, `parabolus`, `teramite`, `wormhack`, `gloamguard`, `panoptix`.
- **DARKBYTE constructs** (Cyber, spawn near masts/labs/hideouts/THE STACK): `puppetacct`, `botling`, `botnetle`, `bitmite`, `teramite`, `virling`, `wormhack`, `phishfin`, `spearphish`, `trojanox`, `droneling`, `datadrake`, `firewaul`, `quarkling`, `hadronaut`, `dishlet`, `parabolus`, `poltergrid`, `peepcam`, `panoptix`, `chordle`, `proxling`, `amoslurk`, `shardmind`, `glitchra`, `oracle_core`. Cyber is 26/172 (15%) and mostly uncommon/rare — "Cyber rarer" holds because pure-Cyber commons are fog/infra-gated.
- **Type coverage** (primary or secondary): bug 14 · grass 20 · water 38 · ground 24 · fire 14 · electric 15 · normal 24 · flying 27 · psychic 21 · ghost 23 · rock 24 · cyber 26 · poison 15.
- **Ability assignment (fixed, one per species; rare second in brackets):** `back_from_the_brink` bigboy [gloamguard, lindowan] · `slipstream` meadow, grinkit · `silk_weave` silkin line, widowisp · `brine_body` brinewt line, brinelet/saltmaid · `salt_crust` saltling line, pillarnaut, crossbell · `firebox` kindlin line, chuglet line · `overclock` firewaul, hadronaut · `sandbox` toadlore, chlorodon · `rootkit` wormhack, trojanox [amoslurk] · `honeypot` phishfin line, panoptix · `proxy_fog` proxling, puppetacct, amoslurk · `rain_caller` heronet line, saltmaid (2nd), egrette · `ridge_wind` zephyrion, curlewind, peregrint (2nd), turbinix · `damp_squib` sluiceling line, bogleap line · `thick_fleece` mistewe, sheepwire line, cubbin line · `iron_will` bruinhall, mowstane, viaductus, dolmenor · `nightshift` owlume line, manorwraith, ladymere, chimnyx · `cheshire_grin` grinmalkin · `deep_roots` thornarch, perryarch, mossbear, derwydd, groveguard · `static_charge` sparkit line, sparkrail line, stagwire, volteel · `signal_jammer` poltergrid, dishlet line, pulsaris · `scavenger` hornhound, nibbit line, shriekwing, spearphish · `wetlander` otterkin line, towpaddle line, brithyll, salmoneer · `sun_trap` panscald, beaconflare, flarestack, pandember · `cold_storage` sleeperk, bitmite line, teramite · `payload` trojanox (primary), droneling line, botling line · `fail_safe` bricklum, keystone line, cryssal, salberg · `loud_bell` belfrit line, bellmere, chordle · `stonemason` verdigrit, gargoylet line, nancylith, runestane · `kernel_panic` glitchra, teramite, shardmind, oracle_core, mirrorling. Every remaining species takes the most thematic of the above (see species table `concept`); the data workstream fills the exact per-species field.
- **Growth groups:** starters, cats, legendaries `medium`; commons `fast`; rares/high-tier `slow`.

---

## 2. MOVES (166)

Schema per SYSTEMS-SPEC §4 / ENGINE-ARCHITECTURE §4. Columns: **Cat** phys/spec/status · **Pow** — for status · **Acc** `—` = never miss (`acc:999`) · **Pri** priority · **Flags** `c` contact, `s` sound, `ch` charge, `rc` recharge, `p` protect_ok, `od` overdriveOnly. **Effects** use the spec's effect kinds; `%` = chance; target is foe unless `self`.

### 2.1 Normal (15)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `tackle` | Tackle | normal | phys | 40 | 100 | 35 | 0 | c | — | Full-body shove |
| `scratch` | Scratch | normal | phys | 40 | 100 | 35 | 0 | c | — | Quick claws |
| `quick_dash` | Quick Dash | normal | phys | 40 | 100 | 30 | +1 | c | — | Strikes first, always |
| `bite` | Bite | normal | phys | 60 | 100 | 25 | 0 | c | flinch 30% | A hard bite; may flinch |
| `hyper_fang` | Hyper Fang | normal | phys | 80 | 90 | 15 | 0 | c | flinch 10% | Rat-king fangs |
| `slam` | Slam | normal | phys | 80 | 90 | 20 | 0 | c | — | Body slam |
| `growl` | Growl | normal | status | — | 100 | 40 | 0 | s | stage foe atk −1 | Lowers foe attack |
| `tail_whip` | Tail Whip | normal | status | — | 100 | 30 | 0 | — | stage foe def −1 | Lowers foe defence |
| `sharpen` | Sharpen | normal | status | — | — | 30 | 0 | — | stage self atk +1 | Raises own attack |
| `harden` | Harden | normal | status | — | — | 30 | 0 | — | stage self def +1 | Raises own defence |
| `screech` | Screech | normal | status | — | 85 | 30 | 0 | s | stage foe def −2 | Ear-splitting; def −2 |
| `white_nancy_stand` | White Nancy Stand | normal | status | — | — | 5 | +4 | — | endure; overdrive +25 | Stand like the folly: survive at 1 HP, gain Overdrive |
| `belfry_toll` | Belfry Toll | normal | spec | 75 | 100 | 15 | 0 | s | stage foe spd −1 20% | Sandbach bell peal |
| `skitter` | Skitter | normal | status | — | — | 20 | +1 | — | stage self eva +1, spe +1 | MEADOW's dart-and-vanish |
| `big_sit` | Big Sit | normal | status | — | — | 5 | 0 | — | cleanse foe stages (reset foe stages only); stage self def +2 | BIGBOY sits on the problem (cat trust 5) |

### 2.2 Fire (10)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `ember` | Ember | fire | spec | 40 | 100 | 25 | 0 | — | status brn 10% | Small flame |
| `cinder_kick` | Cinder Kick | fire | phys | 60 | 100 | 20 | 0 | c | status brn 10% | Kick of hot cinders |
| `flame_burst` | Flame Burst | fire | spec | 70 | 100 | 15 | 0 | — | status brn 10% | Bursting fireball |
| `flame_lash` | Flame Lash | fire | spec | 85 | 100 | 10 | 0 | — | status brn 10% | Whip of flame |
| `firebox_roar` | Firebox Roar | fire | spec | 90 | 100 | 10 | 0 | s | status brn 20%; recharge if Rain | Loco firebox opened wide |
| `boiler_burst` | Boiler Burst | fire | spec | 110 | 85 | 5 | 0 | rc | recharge | Steam-and-fire overpressure |
| `wisp_flame` | Wisp Flame | fire | status | — | 85 | 15 | 0 | — | status brn | Blue flame that burns |
| `stoke` | Stoke | fire | status | — | — | 20 | 0 | — | stage self atk +1, spe +1 | Shovel more coal |
| `soot_cloud` | Soot Cloud | fire | status | — | 100 | 20 | 0 | — | stage foe acc −1 | Chimney soot in the eyes |
| `beacon_light` | Beacon Light | fire | status | — | — | 5 | 0 | — | weather sun 5 | Light the hill beacon: Sun |

### 2.3 Water (11)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `brine_spit` | Brine Spit | water | spec | 40 | 100 | 25 | 0 | — | — | Squirt of salt water |
| `brine_dart` | Brine Dart | water | phys | 40 | 100 | 20 | +1 | c | — | Fast watery lunge |
| `bubble_jet` | Bubble Jet | water | spec | 65 | 100 | 20 | 0 | — | stage foe spe −1 10% | Stream of bubbles |
| `claw_smash` | Claw Smash | water | phys | 75 | 95 | 15 | 0 | c | high_crit 1 | Crab-claw crack |
| `torrent` | Torrent | water | spec | 80 | 100 | 15 | 0 | — | — | Skill Card move: mill-race torrent |
| `brine_jet` | Brine Jet | water | spec | 80 | 100 | 10 | 0 | — | weather rain 5 if not raining; else stage self spe +1 | Nantwich brine under pressure |
| `weaver_surge` | Weaver Surge | water | spec | 90 | 100 | 10 | 0 | — | — | The Weaver in spate |
| `mere_mist` | Mere Mist | water | status | — | — | 5 | 0 | — | weather rain 5 | Cheshire default weather |
| `lido_soak` | Lido Soak | water | status | — | — | 10 | 0 | — | heal 0.5 self | Steam off the brine pool |
| `tide_pull` | Tide Pull | water | phys | 35 | 90 | 15 | 0 | c | trap 4 | Drags and holds |
| `sluice_gate` | Sluice Gate | water | status | — | — | 15 | 0 | — | screen phys 5 | Iron gate halves physical damage |

### 2.4 Grass (10)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `vine_lash` | Vine Lash | grass | phys | 45 | 100 | 25 | 0 | c | — | Whipping vine |
| `razor_leaf` | Razor Leaf | grass | spec | 55 | 95 | 25 | 0 | — | high_crit 1 | Sharp leaves |
| `bramble_whip` | Bramble Whip | grass | phys | 70 | 100 | 15 | 0 | c | stage foe spe −1 20% | Thorny lash |
| `petal_storm` | Petal Storm | grass | spec | 80 | 100 | 10 | 0 | — | — | Blossom gale |
| `elm_press` | Elm Press | grass | phys | 85 | 100 | 10 | 0 | c | drain 0.5 | The orchard press: crush and drink |
| `sleep_powder` | Sleep Powder | grass | status | — | 75 | 15 | 0 | — | status slp | Drowsy spores |
| `regrow` | Regrow | grass | status | — | — | 10 | 0 | — | heal 0.5 self | Fresh shoots |
| `root_bind` | Root Bind | grass | status | — | 90 | 15 | 0 | — | trap 4 | Roots hold the foe |
| `hedge_lay` | Hedge Lay | grass | status | — | — | 10 | 0 | — | terrain grass 5; stage self def +1 | Laid hedge: Grass terrain, def up |
| `mulberry_leaf` | Mulberry Leaf | grass | status | — | — | 10 | 0 | — | heal 0.25 self; cleanse self | Silkworm's supper |

### 2.5 Electric (9)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `static_shock` | Static Shock | electric | spec | 40 | 100 | 30 | 0 | — | status par 10% | Fleece static |
| `spark` | Spark | electric | phys | 65 | 100 | 20 | 0 | c | status par 30% | Charged tackle |
| `arc_flash` | Arc Flash | electric | spec | 70 | 100 | 15 | 0 | — | flinch 20% | Blinding arc |
| `third_rail` | Third Rail | electric | phys | 80 | 100 | 15 | 0 | c | status par 20% | Don't touch it |
| `volt_strike` | Volt Strike | electric | spec | 85 | 100 | 10 | 0 | — | status par 10% | Direct bolt |
| `pylon_arc` | Pylon Arc | electric | spec | 110 | 70 | 5 | 0 | — | status par 30% | Pylon-to-pylon discharge |
| `static_wave` | Static Wave | electric | status | — | 90 | 20 | 0 | — | status par | Paralysing wave |
| `signal_box` | Signal Box | electric | status | — | — | 10 | 0 | — | terrain static 5; stage self spe +1 | Set the levers: Static terrain |
| `charge_up` | Charge Up | electric | status | — | — | 20 | 0 | — | stage self spa +1, spd +1 | Store a charge |

### 2.6 Flying (10)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `gust` | Gust | flying | spec | 40 | 100 | 35 | 0 | — | — | Puff of wind |
| `peck` | Peck | flying | phys | 35 | 100 | 35 | 0 | c | — | Sharp beak |
| `wing_attack` | Wing Attack | flying | phys | 60 | 100 | 30 | 0 | c | — | Wing buffet |
| `aerial_lash` | Aerial Lash | flying | phys | 70 | 100 | 15 | 0 | c | — | Diving strike |
| `curlew_cry` | Curlew Cry | flying | spec | 75 | 100 | 15 | 0 | s | stage foe spd −1 20% | Wild moor call |
| `sky_dive` | Sky Dive | flying | phys | 90 | 95 | 10 | 0 | c, ch | charge 1 semiInvuln | Up, then down hard |
| `dive_bomb` | Dive Bomb | flying | phys | 100 | 90 | 10 | 0 | c | recoil 0.25 | Reckless plunge |
| `ridge_gale` | Ridge Gale | flying | status | — | — | 5 | 0 | — | weather wind 4 | Call the ridge wind |
| `updraft` | Updraft | flying | status | — | — | 20 | 0 | — | stage self spe +2 | Ride the thermal |
| `preen` | Preen | flying | status | — | — | 10 | 0 | — | heal 0.5 self | Tidy feathers, recover |

### 2.7 Bug (9)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `bug_bite` | Bug Bite | bug | phys | 60 | 100 | 20 | 0 | c | — | Mandible bite |
| `needle_volley` | Needle Volley | bug | phys | 25 | 95 | 20 | 0 | — | multihit 2–5 | Volley of pins |
| `bollin_flutter` | Bollin Flutter | bug | spec | 60 | 100 | 20 | 0 | — | stage foe spe −1 30% | Moth-dust wingbeat |
| `copper_bite` | Copper Bite | bug | phys | 75 | 100 | 15 | 0 | c | stage foe def −1 20% | Verdigris mandibles |
| `hive_swarm` | Hive Swarm | bug | spec | 80 | 100 | 10 | 0 | s | — | The whole nest at once |
| `string_shot` | String Shot | bug | status | — | 95 | 40 | 0 | — | stage foe spe −2 | Sticky thread |
| `silk_bind` | Silk Bind | bug | status | — | 90 | 15 | 0 | — | trap 4 | Wrapped in silk |
| `cocoon` | Cocoon | bug | status | — | — | 20 | 0 | — | stage self def +1, spd +1 | Spin a shell |
| `moth_dust` | Moth Dust | bug | status | — | 75 | 15 | 0 | — | status cnf | Powdered scales confuse |

### 2.8 Poison (9)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `poison_sting` | Poison Sting | poison | phys | 15 | 100 | 35 | 0 | c | status psn 30% | Small venomous jab |
| `chem_spray` | Chem Spray | poison | spec | 55 | 100 | 20 | 0 | — | stage foe spd −1 30% | Reagent mist |
| `sludge` | Sludge | poison | spec | 65 | 100 | 20 | 0 | — | status psn 30% | Mersey sludge |
| `rot_bite` | Rot Bite | poison | phys | 70 | 100 | 15 | 0 | c | status psn 20% | Compost fangs |
| `smog_bank` | Smog Bank | poison | spec | 70 | 100 | 15 | 0 | — | stage foe acc −1 30% | Chemical-works smog |
| `venom_lash` | Venom Lash | poison | phys | 75 | 100 | 15 | 0 | c | status psn 10% | Venom-slick whip |
| `reagent_mix` | Reagent Mix | poison | spec | 90 | 95 | 10 | 0 | — | status psn 20% | Ria's fume cupboard |
| `toxic_dose` | Toxic Dose | poison | status | — | 90 | 10 | 0 | — | status tox | Escalating poison |
| `proxy_veil` | Proxy Veil | poison | status | — | — | 5 | 0 | — | weather fog 4; stage self eva +1 | Residential-proxy fog |

### 2.9 Rock (8)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `rock_throw` | Rock Throw | rock | phys | 50 | 90 | 20 | 0 | — | — | Lobbed stone |
| `salt_spray` | Salt Spray | rock | spec | 60 | 100 | 20 | 0 | — | stage foe spd −1 20% | Stinging salt |
| `rock_slide` | Rock Slide | rock | phys | 75 | 90 | 10 | 0 | — | flinch 30% | Kerridge quarry slide |
| `salt_grind` | Salt Grind | rock | phys | 75 | 95 | 15 | 0 | c | terrain salt 5; high_crit 1 | Salt-pan grinding |
| `gritstone_edge` | Gritstone Edge | rock | phys | 80 | 100 | 10 | 0 | c | high_crit 1 | Edge-of-the-crag strike |
| `crag_crush` | Crag Crush | rock | phys | 100 | 80 | 5 | 0 | c | — | Whole-crag slam |
| `stone_skin` | Stone Skin | rock | status | — | — | 20 | 0 | — | stage self def +2 | Sandstone hide |
| `menhir_stand` | Menhir Stand | rock | status | — | — | 10 | 0 | — | screen spec 5; stage self def +1 | Standing-stone ward |

### 2.10 Ground (9)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `mud_shot` | Mud Shot | ground | spec | 55 | 95 | 15 | 0 | — | stage foe spe −1 30% | Peaty mud |
| `hoof_stamp` | Hoof Stamp | ground | phys | 65 | 100 | 20 | 0 | c | stage foe spe −1 20% | Stag/pony stamp |
| `bog_suck` | Bog Suck | ground | phys | 65 | 100 | 10 | 0 | c | drain 0.5 | Lindow's pull |
| `peat_press` | Peat Press | ground | phys | 75 | 100 | 15 | 0 | c | stage foe spd −1 20% | Pressed and preserved |
| `dig` | Dig | ground | phys | 80 | 100 | 10 | 0 | c, ch | charge 1 semiInvuln | Under, then up |
| `quake` | Quake | ground | phys | 100 | 100 | 10 | 0 | — | — | The ground shifts |
| `pit_shaft` | Pit Shaft | ground | spec | 90 | 90 | 10 | 0 | — | — | Cold breath of the flooded pit |
| `subsidence` | Subsidence | ground | status | — | 100 | 15 | 0 | — | stage foe def −1, acc −1 | The buildings tilt |
| `sink_hole` | Sink Hole | ground | status | — | 30 | 5 | 0 | — | ohko | Winsford subsidence — one-hit KO |

### 2.11 Psychic (9)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `confusion` | Confusion | psychic | spec | 50 | 100 | 25 | 0 | — | status cnf 10% | Mild psychic push |
| `rune_read` | Rune Read | psychic | spec | 60 | — | 20 | 0 | — | never_miss | Read the Bridestones aloud |
| `mind_ray` | Mind Ray | psychic | spec | 65 | 100 | 20 | 0 | — | status cnf 10% | Beam of thought |
| `mind_blast` | Mind Blast | psychic | spec | 90 | 100 | 10 | 0 | — | stage foe spd −1 10% | Full psychic blast |
| `pulsar_beam` | Pulsar Beam | psychic | spec | 120 | 90 | 5 | 0 | ch | charge 1 | Tuned to a pulsar; fires next tick |
| `agility` | Agility | psychic | status | — | — | 30 | 0 | — | stage self spe +2 | Mind over legs |
| `calm_read` | Calm Read | psychic | status | — | — | 20 | 0 | — | stage self spa +1, spd +1 | Sit and read |
| `cipher_riddle` | Cipher Riddle | psychic | status | — | 80 | 15 | 0 | s | status cnf | Gaskell's letter-cipher |
| `mirror_glass` | Mirror Glass | psychic | status | — | — | 10 | 0 | — | copy_stages | Copy the foe's stat stages |

### 2.12 Ghost (10)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `lick` | Lick | ghost | phys | 30 | 100 | 30 | 0 | c | status par 30% | Cold tongue |
| `shade_bolt` | Shade Bolt | ghost | spec | 60 | 100 | 20 | 0 | — | — | Bolt of shadow |
| `preserved_grip` | Preserved Grip | ghost | phys | 70 | 100 | 15 | 0 | c | trap 4 | Bog-body handshake |
| `possess` | Possess | ghost | spec | 75 | 100 | 15 | 0 | — | flinch 20% | Brief possession |
| `night_pulse` | Night Pulse | ghost | spec | 80 | 100 | 10 | 0 | — | — | Pulse of dark |
| `phantom_lance` | Phantom Lance | ghost | phys | 90 | 100 | 10 | 0 | c | — | Sleeping knight's lance |
| `haunt` | Haunt | ghost | spec | — | — | 15 | 0 | — | fixed level; never_miss | Damage equal to user's level |
| `cheshire_fade` | Cheshire Fade | ghost | status | — | — | 10 | 0 | — | stage self eva +1; terrain silk 5 | Fade to a grin |
| `curse_bell` | Curse Bell | ghost | status | — | 100 | 15 | 0 | s | stage foe atk −1, spa −1 | Drowned bell tolls |
| `wisp_lure` | Wisp Lure | ghost | status | — | 85 | 15 | 0 | — | status cnf | Follow the light |

### 2.13 Cyber (18)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `bit_blast` | Bit Blast | cyber | spec | 40 | 100 | 30 | 0 | — | — | Burst of bits |
| `brute_force` | Brute Force | cyber | phys | 25 | 90 | 15 | 0 | c | multihit 2–5 | Try every password |
| `phish_hook` | Phish Hook | cyber | spec | 55 | 95 | 20 | 0 | — | stage foe spa −1 30% | Lure with a hook in it |
| `data_stream` | Data Stream | cyber | spec | 65 | 100 | 20 | 0 | — | — | Stream of packets |
| `rootkit_bite` | Rootkit Bite | cyber | phys | 65 | 100 | 15 | 0 | c | stage foe eva −1 100% | Reveals the hidden |
| `hack_slash` | Hack Slash | cyber | phys | 70 | 100 | 15 | 0 | c | — | Quick and dirty |
| `threat_hunt` | Threat Hunt | cyber | spec | 70 | — | 10 | 0 | — | never_miss; high_crit 1 | Finds what hides |
| `packet_storm` | Packet Storm | cyber | spec | 70 | 100 | 15 | 0 | — | weather wind 4 on hit; ×1.3 in Wind | Flood the link |
| `glitch_burst` | Glitch Burst | cyber | phys | 85 | 90 | 10 | 0 | — | status cnf 10% | Corrupted frames |
| `rtr_deploy` | RTR Deploy | cyber | spec | 90 | 100 | 10 | 0 | — | — | Real-time response, deployed |
| `zero_day` | Zero-Day | cyber | spec | 110 | 80 | 5 | 0 | ch | charge 1; stage self spd −1 | Unpatched, unstoppable |
| `ddos` | DDoS | cyber | status | — | 90 | 20 | 0 | — | stage foe spe −2 | Flood them off the wire |
| `encrypt` | Encrypt | cyber | status | — | — | 20 | 0 | — | stage self def +1, spd +1 | Wrap in cipher |
| `firewall_up` | Firewall Up | cyber | status | — | — | 15 | 0 | — | screen spec 5; overdrive +10 | Deny inbound |
| `patch_tuesday` | Patch Tuesday | cyber | status | — | — | 10 | 0 | — | heal 0.5 self; cleanse self; usable every other turn | Reboot required |
| `ransom_note` | Ransom Note | cyber | status | — | 85 | 10 | 0 | — | status tox; trap 4 | Encrypted, and you're not leaving |
| `honeytoken` | Honeytoken | cyber | status | — | 100 | 10 | 0 | — | taunt 3 | Bait: foe can't use status moves |
| `pixel_tripwire` | Pixel Tripwire | cyber | status | — | 90 | 10 | 0 | — | terrain static 5; stage foe spe −1 | Tracking pixel underfoot |

### 2.14 Boss-only / scripted (3)

| id | Name | Type | Cat | Pow | Acc | PP | Pri | Flags | Effects | One-liner |
|---|---|---|---|---|---|---|---|---|---|---|
| `oracle_triage` | Oracle Triage | cyber | status | — | — | 5 | 0 | — | agent (SLEET-like reveal + foe spe −2) | ORACLE reads your party |
| `cache_revive` | Cache Revive | cyber | status | — | — | 5 | 0 | — | heal 0.3 self; summon handled by phase script | Checkpoint restored from the salt |
| `sysadmin_reboot` | Sysadmin's Reboot | electric | status | — | — | 1 | +3 | — | cleanse self stages; restore all PP self | Ada's house rule, once per battle |

### 2.15 Overdrive signatures (`overdriveOnly:true`, ignore protect, never miss, no PP) (26)

Generic per-type signatures are used by every line whose species table `overdrive` says `od_<type>`; the type is the species' primary type. Unique signatures follow.

| id | Name | Type | Cat | Pow | Effects | Line |
|---|---|---|---|---|---|---|
| `od_normal` | Treacle Rush | normal | phys | 130 | stage self spe +1 | generic |
| `od_fire` | Mill Blaze | fire | spec | 130 | status brn 30% | generic |
| `od_water` | Weaver Flood | water | spec | 130 | weather rain 5 | generic |
| `od_grass` | Hedgerow Wall | grass | phys | 120 | heal 0.25 self | generic |
| `od_electric` | Pylon Overload | electric | spec | 130 | status par 30% | generic |
| `od_flying` | Gale Force | flying | phys | 130 | weather wind 4 | generic |
| `od_bug` | Swarm Season | bug | phys | 40 | multihit 3–3 (fixed 3 hits); stage foe spe −1 | generic |
| `od_poison` | Fume Cupboard | poison | spec | 120 | status tox 50% | generic |
| `od_rock` | Kerridge Fall | rock | phys | 130 | flinch 30% | generic |
| `od_ground` | Subsidence Quake | ground | phys | 130 | terrain salt 5 | generic |
| `od_psychic` | Cranford Rumour | psychic | spec | 130 | stage foe spd −1 | generic |
| `od_ghost` | Grave Bell | ghost | spec | 130 | status cnf 30% | generic |
| `od_cyber` | Root Shell | cyber | spec | 130 | pp_drain 2 on the foe's last-used move | generic |
| `zoomies` | Zoomies | normal | phys | 40 | priority +2; multihit 3–3; stage self spe +1 | `meadow` |
| `brink_roar` | Brink Roar | normal | status | — | heal 0.5 self; stage self def +1, spd +1; stage foe atk −1 | `bigboy` |
| `jacquard_weave` | Jacquard Weave | bug | spec | 130 | terrain silk 5; stage foe spe −1 | `silkin` line |
| `brine_tide` | Brine Tide | water | spec | 130 | weather rain 8; stage self spd +1 | `brinewt` line |
| `firebox_overload` | Firebox Overload | fire | spec | 140 | status brn 30%; stage self spe −1 | `kindlin` line |
| `grin_remains` | The Grin Remains | ghost | status | — | heal 0.5 self; stage self eva +2; status cnf foe 100% | `grinkit` line |
| `knights_waking` | Knights Waking | psychic | spec | 150 | status slp 30% | `merlynx` |
| `salt_cathedral` | Salt Cathedral | rock | phys | 150 | terrain salt 5; stage self def +1 | `terrataur` |
| `ridge_storm` | Ridge Storm | electric | spec | 140 | weather wind 8; status par 20% | `zephyrion` |
| `static_scream` | Static Scream | cyber | spec | 140 | sound; status cnf 30%; pp_drain 1 | `glitchra` |
| `oracle_escalate` | Escalate | cyber | status | — | agent: jam player agents 3; heal 0.3 self; boostSelf spa +1 | `oracle_core` (boss) |
| `understudy_mask` | Borrowed Face | cyber | spec | 120 | copy_stages; type becomes the foe's primary type for damage | `amoslurk`/`understudy` |
| `bruin_maul` | Beartown Maul | normal | phys | 140 | flinch 30%; stage self def −1 | `cubbin` line (Otis's ace overrides `od_ground`) |

---

## 3. ABILITIES (30, ids fixed)

Hook names per SYSTEMS-SPEC §2. `impl` key in `abilities.js` = the id.

| id | Name | Rule summary |
|---|---|---|
| `back_from_the_brink` | Back from the Brink | Once per battle a hit that would KO from ≥50% HP leaves 1 HP (BIGBOY; upgrade flag `bigboy_shield` lets it shield an ally once) |
| `slipstream` | Slipstream | +1 spe stage on switch-in |
| `silk_weave` | Silk Weave | Contact moves against holder: 30% attacker spe −1 |
| `brine_body` | Brine Body | Immune to Burn; heals 1/16 per turn in Rain |
| `salt_crust` | Salt Crust | Takes ×0.75 from Rock/Ground; off while Wet terrain |
| `firebox` | Firebox | Fire moves ×1.5 when HP ≤ 1/3 |
| `overclock` | Overclock | Cyber moves ×1.3; 1/16 recoil each Cyber hit |
| `sandbox` | Sandbox | Immune to Poison/Toxic; Poison-type moves against it ×0.5 |
| `rootkit` | Rootkit | On switch-in, foe's ability suppressed 3 turns (`abilityOff`) |
| `honeypot` | Honeypot | If targeted by a status move, its user loses 1 stage of its highest attacking stat instead |
| `proxy_fog` | Proxy Fog | Sets Fog 4 turns on switch-in |
| `rain_caller` | Rain Caller | Sets Rain 5 turns on switch-in |
| `ridge_wind` | Ridge Wind | Sets Wind 4 turns on switch-in |
| `damp_squib` | Damp Squib | Fire moves against holder ×0.5 in Rain |
| `thick_fleece` | Thick Fleece | Ice/Water/Wind chip nullified; special moves ×0.9 |
| `iron_will` | Iron Will | Cannot flinch; foe cannot lower its stats |
| `nightshift` | Nightshift | +1 priority on status moves at night (20:00–06:00) |
| `cheshire_grin` | Cheshire Grin | 25% any hit dealt confuses target |
| `deep_roots` | Deep Roots | Immune to forced switch; heals 1/8 at end of turn on Grass terrain |
| `static_charge` | Static Charge | Contact against holder: 30% Paralysis |
| `signal_jammer` | Signal Jammer | Foe's `charge` moves fail 30% |
| `scavenger` | Scavenger | On KO, heals 1/4 max HP |
| `wetlander` | Wetlander | spe ×1.5 in Rain |
| `sun_trap` | Sun Trap | spa ×1.5 in Sun |
| `cold_storage` | Cold Storage | Cannot be Frozen or Slept while HP > 1/2 |
| `payload` | Payload | First damaging move each time it enters battle ×1.5 |
| `fail_safe` | Fail-Safe | First time HP < 1/4: def +2, spd +2 |
| `loud_bell` | Loud Bell | Sound moves ×1.3; immune to sound moves |
| `stonemason` | Stonemason | Rock moves ×1.2; Rock moves never miss in Wind |
| `kernel_panic` | Kernel Panic | On faint, the move that KO'd it loses all PP |

---

## 4. ITEMS (149 listed + patterned key items)

`kind` ∈ `heal cure capsule gear held_consumable consumable key ingredient brew evo tm rod`. Price `—` = not sold (0). Gear/held ids match SYSTEMS-SPEC §3 (deviation: evolution items get distinct ids so `copper_coil` gear ≠ `copper_wire` evo).

### 4.1 Healing & cures

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `salve` | Salve | heal | 200 | +20 HP |
| `tonic` | Tonic | heal | 600 | +60 HP |
| `elixir` | Elixir | heal | 1500 | +120 HP |
| `full_restore` | Full Restore | heal | 3000 | Full HP + cure all |
| `revive_salts` | Revive Salts | heal | 1200 | Revive at ½ HP; friendship −10 |
| `antidote` | Antidote | cure | 100 | Cures psn/tox |
| `burn_balm` | Burn Balm | cure | 150 | Cures brn |
| `nerve_tonic` | Nerve Tonic | cure | 150 | Cures par |
| `smelling_salts` | Smelling Salts | cure | 150 | Cures slp |
| `thaw_flask` | Thaw Flask | cure | 150 | Cures frz |
| `calm_drops` | Calm Drops | cure | 150 | Cures cnf |
| `panacea` | Panacea | cure | 500 | Cures any status |

### 4.2 Capsules

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `capsule_basic` | Capsule | capsule | 200 | ×1 |
| `capsule_mesh` | Mesh Capsule | capsule | 600 | ×1.5 |
| `capsule_kernel` | Kernel Capsule | capsule | 1200 | ×2 |
| `capsule_root` | Root Capsule | capsule | — | Guaranteed; 3 in the game |
| `capsule_net` | Net Capsule | capsule | 800 | ×3 vs Cyber/Bug |
| `capsule_night` | Night Capsule | capsule | 800 | ×3 at night |
| `capsule_brine` | Brine Capsule | capsule | 800 | ×3 vs Water or in Rain |
| `capsule_quick` | Quick Capsule | capsule | 800 | ×4 turn 1, else ×1 |
| `capsule_friend` | Friend Capsule | capsule | 1000 | ×1; caught mon friendship 150 |
| `capsule_heavy` | Heavy Capsule | capsule | 800 | Bonus scales with base HP |

### 4.3 Gear (permanent held) — SYSTEMS-SPEC 1–20 plus side-content gear

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `silk_scarf` | Silk Scarf | gear | 1000 | STAB ×1.1 |
| `brine_charm` | Brine Charm | gear | 1200 | Water ×1.2 |
| `ember_coal` | Ember Coal | gear | 1200 | Fire ×1.2 |
| `copper_coil` | Copper Coil | gear | 1200 | Electric ×1.2 |
| `cipher_lens` | Cipher Lens | gear | 1200 | Psychic ×1.2 |
| `patch_cable` | Patch Cable | gear | 1500 | Cyber ×1.2 |
| `walkers_boots` | Walker's Boots | gear | 2500 | spe ×1.5; locked to first move |
| `heavy_anvil` | Heavy Anvil | gear | 2000 | atk ×1.3, spe ×0.5 |
| `kevlar_waistcoat` | Kevlar Waistcoat | gear | 2500 | ×0.9 phys & spec taken; no Overdrive |
| `rail_pass` | Rail Pass | gear | 1000 | Switch-out has +priority |
| `lucky_coin` | Lucky Coin | gear | 1500 | Crit stage +1 |
| `focus_band` | Focus Band (Bollington) | gear | 2000 | 10% survive at 1 HP |
| `toxic_sachet` | Toxic Sachet | gear | 1000 | Contact vs holder 30% psn |
| `rusty_nail` | Rusty Nail | gear | 1000 | Contact vs holder: 1/8 to attacker |
| `umbrella` | Umbrella (Cheshire issue) | gear | 800 | Ignore Rain/Fog on self |
| `weathervane` | Weathervane | gear | 1500 | Holder's weather lasts 8 turns |
| `ledger` | Ledger | gear | 1200 | XP ×1.5 |
| `cat_bell` | Cat Bell | gear | 800 | Friendship ×2; eva +1 on switch-in vs wild |
| `warm_blanket` | Warm Blanket | gear | 1000 | Cures frz/slp end of turn once per battle |
| `torch` | Torch | gear | 800 | Accuracy ignores Fog |
| `silk_wrap` | Silk Wrap | gear | — | Burn damage halved (Q1) |
| `firebox_charm` | Firebox Charm | gear | — | Fire moves ×1.1 (Di rematch tier 5) |
| `hide_plate` | Hide Plate | gear | — | Rock moves against holder ×0.75 (Q20) |
| `beacon_ember` | Beacon Ember | gear | — | Fire ×1.1; also Damson Fire ingredient (Q23) |
| `wool_cap` | Wool Cap | gear | — | Ice/Wind chip nullified; spd ×1.1 in Wind (Q18) |
| `anchor_packet` `anchor_cipher` `anchor_bear` `anchor_kernel` `anchor_token` `anchor_daemon` `anchor_proxy` `anchor_admin` | Anchor: <badge> | gear | — | Leader rematch tier 5 uniques: type ×1.3 for that leader's type, holder immune to that type's status |

### 4.4 Held consumables (SYSTEMS-SPEC 21–25)

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `damson` | Damson | held_consumable | 150 | Heals 1/4 at HP ≤ 1/2; also a brew ingredient |
| `perry_flask` | Perry Flask | held_consumable | 300 | Cures status when applied |
| `elm_sap` | Elm Sap | held_consumable | 300 | HP ≤ 1/4: +1 highest attacking stat |
| `salt_lick` | Salt Lick | held_consumable | 250 | Restores 10 PP to first move to hit 0 |
| `toffee` | Toffee (Everton) | held_consumable | 200 | Cures cnf, heals 1/8 |

### 4.5 Battle consumables

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `boombox` | CFS-B11 Boombox | consumable | 500 | Guaranteed flee from wild |
| `storm_glass` | Storm Glass | consumable | 400 | Set Rain 5 (once per battle) |
| `sun_lamp` | Sun Lamp | consumable | 400 | Set Sun 5 |
| `fog_machine` | Fog Machine | consumable | 400 | Set Fog 5 |
| `wind_whistle` | Wind Whistle | consumable | 400 | Set Wind 5 |
| `tonic_atk` `tonic_def` `tonic_spa` `tonic_spd` `tonic_spe` `tonic_acc` | Brine Tonic: ATK/DEF/SPA/SPD/SPE/ACC | consumable | 350 | +1 stage (Nantwich) |
| `x_ray_card` | X-Ray Card | consumable | 300 | Reveal foe moves & ability |
| `music_box` | Music Box | consumable | — | Wild foe cannot flee for 3 turns (Q21) |

### 4.6 Evolution items

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `silk_cocoon` | Silk Cocoon | evo | — | Evolves silk/bug lines flagged `item:silk_cocoon` |
| `salt_crystal` | Salt Crystal | evo | 900 | Evo item; also Salt Mead ingredient |
| `copper_wire` | Copper Wire | evo | — | Evo item (Alderley copper) |
| `cipher_chip` | Cipher Chip | evo | — | Evo item (Cyber variants) |
| `elm_sap_vial` | Elm Sap Vial | evo | — | Evo item (orchard forms) |
| `billhook_charm` | Billhook Charm | evo | — | `bramblehog` → `thornarch` (Tarporley) |

### 4.7 Key items (traversal, story, side)

| id | Name | Kind | Chapter | Effect |
|---|---|---|---|---|
| `middlewood_bike` | Middlewood Bike | key | 1 | Cycleway speed, tunnel shortcut |
| `alder_contract` | Alder Labs Contract | key | 1 | Story |
| `casebook` | Casebook | key | 1 | Opens Casebook tab |
| `camera` | Camera | key | 1 | Photo mode (Q4) |
| `davy_lamp` | Davy Lamp | key | 2 | Dark levels, night glades (= "Cave Lamp") |
| `turings_apple` | Turing's Apple | key | 2 | Collectible #2 |
| `billhook` | Billhook | key | 2/8 | Hedge gaps, mere paths |
| `signal_meter` | Jodrell Handheld | key | 4 | SIGNAL METER layer |
| `face_fragment_1` `face_fragment_2` | Face Fragment | key | 3/4 | AMOS breadcrumbs |
| `railcard` | Railcard | key | 5 | Station fast travel |
| `cambrian_ticket` | Cambrian Line Ticket | key | 5 | Y Berllan |
| `conductors_whistle` | Conductor's Whistle | key | 5 | Call a train from any station tile (Q15) |
| `pippin_drive` | PIPPIN Drive | key | 6 | Story |
| `narrowboat_licence` | Narrowboat Licence | key | 7 | Canals, Weaver |
| `lift_pass` | Anderton Lift Pass | key | 7 | Boat lift levels |
| `salt_mine_pass` | Salt Mine Pass | key | 7 | Salt Mine |
| `salt_lantern` | Salt Lantern | key | 7 | Mine encounter rate −30% toggle (Q25) |
| `waders` | Waders | key | 9 | Marsh tiles |
| `gritstone_grips` | Gritstone Grips | key | 7/8 | Climbing |
| `proxy_goggles` | Proxy Goggles | key | 9 | Fog routes |
| `bunker_key` | Bunker Key | key | 9 | Hack Green |
| `stack_schematics` | THE STACK Schematics | key | 9 | Story |
| `root_access` | Root Access | key | 11 | THE STACK halls |
| `zoo_membership` | Zoo Membership | key | 12/PG | Chester Zoo |
| `sandstone_passport` `gritstone_passport` `ring_passport` | Trail Passport | key | var | Trail quests |
| `arcade_pass` | Arcade Pass | key | 10 | Warrington arcade |
| `nino_letter_1` … `nino_letter_5` | Letter from Nino | key | 2/5/9/12/PG | Story letters (Georgia) |
| `ghost_lens` | Ghost Lens | key | 4 | Photo mode reveals static creatures |
| `field_notebook` | Field Notebook | key | 4 | Dex habitats / ripe bushes |
| `rain_cloak` | Rain Cloak | key | 3 | Trainer trinket: rain no longer slows walking |
| `sprint_soles` | Sprint Soles | key | 3 | Trainer trinket: run +8% |
| `weighted_line` | Weighted Line | key | 1 | see rods |
| `photo_album` | Sighting Album | key | 1 | Photo storage |
| `collectible_<n>` (1–25) | see WORLD-BIBLE §5 | key | var | e.g. `collectible_1` Nancy's Paint Tin … `collectible_25` Beeston collar tag |
| `viewpoint_<map>` (12) | Viewpoint plaque | key | var | Summit collectibles |
| `cat_token_<n>` (1–11) | Cat token | key | var | Hidden grinkit cats → MEADOW/BIGBOY skins |

### 4.8 Fishing rods

| id | Name | Kind | Price | Effect |
|---|---|---|---|---|
| `rod_bamboo` | Bamboo Rod | rod | 500 | Common tier |
| `rod_weighted` | Weighted Line | rod | — | Common+Uncommon+Rare (Q7 lend→keep) |
| `rod_carbon` | Carbon Rod | rod | 4000 | + Legendary table (dawn/dusk) |
| `rod_elm` | Elm-handled Rod | rod | — | + Ghost tier at night with `ghost_lens`; brewed at Y Berllan |

### 4.9 Ingredients (14) and brews (9)

| id | Name | Kind | Source | Used in |
|---|---|---|---|---|
| `perry_pear` | Perry Pear | ingredient | Y Berllan trees (daily) | perry, nains_cask |
| `apple` | Apple | ingredient | orchards, markets | clarifier |
| `brine_sample` | Brine Sample | ingredient | Nantwich lido (rod) | clarifier |
| `barley` | Barley | ingredient | Nantwich Saturday market, farms | elm_stout |
| `roasted_acorn` | Roasted Acorn | ingredient | Delamere/Tatton bushes | elm_stout |
| `damson` | Damson | held_consumable/ingredient | Prestbury | damson_fire |
| `blackberry` | Blackberry | ingredient | route hedges | hedgerow_cordial |
| `sloe` | Sloe | ingredient | routes | hedgerow_cordial |
| `honey` | Honey | ingredient | Chester Rows, hives | salt_mead |
| `salt_crystal` | Salt Crystal | evo/ingredient | Northwich | salt_mead |
| `roe` | Roe | ingredient | fishing drop | bait_tin |
| `oats` | Oats | ingredient | markets | bait_tin |
| `cream` | Cream | ingredient | Nantwich cheese show | cats_cup |
| `catmint` | Catmint | ingredient | Tatton | cats_cup |
| `timber_oak` `timber_pine` `timber_birch` | Timber | ingredient | Delamere | Q23 beacon |
| `perry` | Perry | brew | tier 1 | Party full HP + Overdrive starts 25 |
| `clarifier` | Clarifier | brew | tier 1 | Cures all status (party) |
| `elm_stout` | Elm Stout | brew | tier 1 | Def +1 first 3 turns |
| `damson_fire` | Damson Fire | brew | tier 2 | Fire ×1.2 one battle |
| `hedgerow_cordial` | Hedgerow Cordial | brew | tier 2 | Catch ×1.3 for 10 real minutes |
| `salt_mead` | Salt Mead | brew | tier 2 | Rock/Ground ×0.75 taken one battle |
| `bait_tin` | Bait Tin | brew | tier 2 | Fishing Rare zone widened |
| `cats_cup` | Cat's Cup | brew | tier 1 | Cat trust +1 (daily) |
| `nains_cask` | Nain's Cask | brew | tier 3 | +1 perk point weekly |

### 4.10 Skill Cards (TMs)

Convention: `skill_<move_id>`, kind `tm`, teaches `<move_id>`, single-use, price 2000 in Knutsford "book of moves" or quest rewards. Shipped set (24): `skill_torrent skill_flame_burst skill_volt_strike skill_petal_storm skill_rock_slide skill_quake skill_mind_ray skill_night_pulse skill_data_stream skill_hack_slash skill_sludge skill_wing_attack skill_bug_bite skill_static_wave skill_toxic_dose skill_sleep_powder skill_agility skill_encrypt skill_firewall_up skill_hedge_lay skill_signal_box skill_mere_mist skill_ridge_gale skill_beacon_light`.

---

## 5. TRAINER CLASSES (29)

Sprite ids reference §6. `ai` per SYSTEMS-SPEC §10 (leaders/bosses smart).

| id | Display | Sprite | Flavour | Typical types |
|---|---|---|---|---|
| `walker` | Walker | `npc_walker` | Poles, flask, opinions about stiles | normal, flying, ground |
| `cyclist` | Cyclist | `npc_cyclist` | Middlewood Way; chases you | electric, flying, normal |
| `angler` | Angler | `npc_fisher` | Towpath, tin of maggots | water |
| `weaver` | Weaver | `npc_weaver` | Silk-mill hands, bobbin in pocket | bug, psychic |
| `stallholder` | Stallholder | `npc_shopkeep` | Treacle Market, will haggle | normal, grass |
| `developer` | Developer | `npc_dev` | Wilmslow café laptop | electric, cyber |
| `ranger` | Ranger | `npc_ranger` | Deer counts, binoculars | normal, grass, flying |
| `miner` | Miner | `npc_miner` | Copper/salt, lamp on | rock, ground |
| `caver` | Caver | `npc_caver` | Edge Caverns club | rock, ghost, poison |
| `historian` | Historian | `npc_historian` | Crosses, runes, Gaskell | psychic, rock, ghost |
| `signaller` | Signaller | `npc_signaller` | Boxes, levers, timetables | electric, fire, rock |
| `boater` | Boater | `npc_boater` | Narrowboat crew, moving platforms | water, normal |
| `saltworker` | Salt Worker | `npc_saltworker` | Brine pans, hi-vis | rock, water |
| `chemist` | Chemist | `npc_chemist` | Runcorn labs | poison |
| `birder` | Birder | `npc_birder` | Marsh hides, scope | flying, water |
| `fellrunner` | Fell-runner | `npc_fellrunner` | Shutlingsloe in 40 minutes | flying, normal, electric |
| `farmer` | Farmer | `npc_farmer` | Sheep, rams, hedges | normal, grass, electric |
| `bandsman` | Bandsman | `npc_bandsman` | Bollington brass | normal (sound), bug |
| `kid` | Kid | `npc_kid` | Poynton pool, wants a rematch | any low-tier |
| `granny` | Granny | `npc_granny` | Knutsford, deceptively strong | psychic, normal |
| `cultist` | ClickFix Novice / Preacher | `npc_cultist` | "Paste this and be cleansed" | psychic, bug, poison |
| `stuffer` | Credential Stuffer | `npc_stuffer` | Sixth-former with a proxy box | cyber (`puppetacct`, `botling`), poison |
| `shadow_it` | Shadow IT Contractor | `npc_shadow_it` | Unofficial, unpatched, unbothered | cyber, electric |
| `amos_impostor` | Understudy | `npc_amos` | Wears someone's face; battles use `amoslurk` | cyber, ghost |
| `darkbyte_agent` | DARKBYTE Agent | `npc_darkbyte` | Hi-vis "maintenance" | cyber (constructs), rock |
| `white_hat` | White Hat | `npc_whitehat` | Chester blue team | balanced |
| `gym_leader` | Gym Leader | per-leader | Ada/Gaskell/Otis/Di/Nell/Jack/Ria/Mo | badge type |
| `rival` | Rival | `npc_vex` | VEX | mixed |
| `ghost_trainer` | Ghost Trainer | `npc_ghost_trainer` | Old Hall Tudor / Acton 1644 / Roman legion (night) | ghost |


---

## 6. NPC / PLAYER SPRITE IDS (80)

Sprite sheets are procedural (`art/sprites.js`); id = sheet key. Player/cats have 4-dir walk+run; NPCs 4-dir walk unless `still`.

| id | Description |
|---|---|
| `player` | JIM: walker's jacket, day-pack, tired |
| `player_bike` | Jim on the Middlewood Bike |
| `player_boat` | Jim at a narrowboat tiller (with `boat_narrow`) |
| `mum` | Jim's mum (phone calls; Macclesfield flat) |
| `mrs_bobbin` | Neighbour who feeds MEADOW |
| `vex` | VEX: hoodie, capital-letter confidence |
| `vex_hood` | VEX hooded (Runcorn bridge) |
| `alder` | Dr Wren Alder, cardigan and tea |
| `ada` | Sysadmin Ada, rack-room lanyard |
| `gaskell` | Madam Gaskell, Cranford bonnet |
| `otis` | Bearward Otis, bear-brown coat |
| `di` | Stoker Di, overalls, oily rag |
| `nell` | Brine Nell, swimming cap |
| `jack` | Foreman Jack, hi-vis, spirit level |
| `ria` | Chemist Ria, lab coat |
| `mo` | Netrunner Mo, headset |
| `root` | ROOT: hi-vis, fifties, sardonic |
| `alder_impostor` `root_impostor` `vex_impostor` `jim_impostor` | Understudy wearing faces (palette-shifted duplicates) |
| `elis` | Elis Pennant, good coat, Stormy Point |
| `mam_gu` | Mam-gu (Nesta) — SIDE-CONTENT calls her Nain; one sprite, one id |
| `dai` | Press-hand Dai |
| `sue` `raj` `kim` `doc` | White Hats |
| `kellan` | Brother Kellan, picnic-blanket prophet |
| `twelvek` | TWELVE-K, STACK lanyard |
| `whistleblower` | alias of `root` for Ch4 gate scene (hi-vis, hood) |
| `npc_walker` `npc_cyclist` `npc_fisher` `npc_weaver` `npc_shopkeep` `npc_dev` `npc_ranger` `npc_miner` `npc_caver` `npc_historian` `npc_signaller` `npc_boater` `npc_saltworker` `npc_chemist` `npc_birder` `npc_fellrunner` `npc_farmer` `npc_bandsman` `npc_kid` `npc_granny` `npc_cultist` `npc_stuffer` `npc_shadow_it` `npc_amos` `npc_darkbyte` `npc_whitehat` `npc_ghost_trainer` `npc_vex` | Trainer-class sprites (generic; `npc_vex` = `vex`); each has 2 palette variants |
| `npc_nurse` | Care-centre nurse (VIGIL asks if you've eaten) |
| `npc_sysadmin` | Generic sysadmin (gym 1 trainers) |
| `npc_stoker` | Generic stoker (gym 4 trainers) |
| `treacle_tam` | Treacle Tam (market fixer) |
| `spokes` | Bike hire |
| `cat_meadow` | MEADOW: small black cat, fast walk cycle, sit, sniff |
| `cat_bigboy` | BIGBOY: huge black-and-white, slow walk, sit, purr |
| `cat_grinkit` | Hidden cats (grin overlay) |
| `dog` | Village dog |
| `deer` | Tatton/Lyme deer (overworld herd) |
| `sheep` | Farm sheep (overworld) |
| `duck` | Canal duck |
| `heron` | Bollin heron (overworld ambience) |
| `boat_narrow` | Narrowboat (rideable) |
| `boat_lift_caisson` | Anderton caisson (moving platform) |
| `train` | Passenger train (stations, level crossings) |
| `train_loco` | Di's loco (cutscene) |
| `train_apt` | Tilting APT (Ch5 boss deck) |
| `oracle_terminal` | ORACLE speaking terminal (glow) |
| `grinmalkin_wall` | GRINMALKIN grin overlay on walls/roofs/clock |

---

## 7. SONG IDS (38)

WebAudio synth motifs. `MQ.Songs[id] = {bpm, key, tracks…}`. Town motifs share a 4-bar county theme in different modes.

| id | Where | Mood / motif |
|---|---|---|
| `title` | Title screen | County theme, slow, rain pads |
| `town_macc` | Macclesfield | Loom-clack percussion, oxblood brass; the county theme in Dorian |
| `town_bollington` | Bollington/White Nancy | Brass band march, tuba bass |
| `town_prestbury` | Prestbury/Poynton | Quiet strings, gravel-drive hush; Poynton adds an engine chug layer |
| `town_wilmslow` | Wilmslow | Café-clean synth, 8-bit clicks (Turing) |
| `town_alderley` | Alderley Edge | Copper-mine drone, wizard bell |
| `town_knutsford` | Knutsford/Tatton | Harpsichord Cranford waltz, May Day bells |
| `town_congleton` | Congleton/Holmes Chapel/Sandbach | Bear-drum lumber, church bell; Sandbach variant adds cross-hum |
| `town_crewe` | Crewe | Rail rhythm, signal whistle, steam hiss |
| `town_nantwich` | Nantwich | Brine-drip marimba, Tudor lute |
| `town_northwich` | Northwich/Middlewich/Winsford | Salt-pan clank, subsidence bass slide |
| `town_frodsham` | Frodsham/Runcorn/Daresbury | Estuary wind, turbine pulse; Runcorn variant adds fog filter |
| `town_warrington` | Warrington/Lymm | Neon market beat, transporter-bridge creak |
| `town_chester` | Chester | Roman brass, cathedral organ, the county theme in Ionian |
| `town_zoo` | Chester Zoo / Ellesmere Port / Parkgate | Playful marimba; Port variant flare hum |
| `town_berllan` | Y Berllan | Welsh harp, elm-press creak, sea haze |
| `route_east` | Ch1–2 routes (moor, canal, mill) | Walking pulse, flute |
| `route_mid` | Ch3–5 routes (estate, heath, rail) | Strings + rail snare |
| `route_salt` | Ch6–7 routes (brine, salt, canal) | Marimba + water |
| `route_west` | Ch8–12 routes (forest, sandstone, marsh) | Wind pads, low brass |
| `dungeon_cave` | Edge Caverns, Salt Mine, Hack Green, Beeston well | Drips, drone, distant knights |
| `dungeon_bog` | Lindow, Delamere night, Ince marsh | Wet, uneasy, wisp bells |
| `dungeon_stack` | THE STACK / Jodrell interior | Server hum, cooling fans, ORACLE's 4-note tag |
| `battle_wild` | Wild battles | Brisk county theme, drums |
| `battle_trainer` | Trainer battles | Same, higher energy |
| `battle_gym` | Gym leaders | Leader tag intro + badge-type timbre |
| `battle_boss` | Bosses (Preserved One, APT, Kellan, Understudy, ROOT) | Phased: adds a track per phase |
| `battle_legendary` | MERLYNX/TERRATAUR/ZEPHYRION/GLITCHRA | Slow, huge, choir pad |
| `battle_vex` | VEX rival | Swagger riff; cracks in Ch8 (minor key) |
| `battle_champion` | Chester amphitheatre | County theme full, both cats' motifs |
| `cutscene_signal` | White Nancy, Rostherne, boat-lift silence, dish turn | ORACLE's tag over silence; music drops out |
| `cutscene_orchard` | Y Berllan evening, vet story, credits (Elm Press ending) | Harp + purr synth |
| `credits` | Endings | County theme reprise; variant per ending flag |
| `fanfare_badge` `fanfare_evolve` `fanfare_catch` `fanfare_heal` `fanfare_quest` | Stingers | Short |

---

## 8. SFX IDS (55)

`MQ.Sfx.play(id)`; all synthesised.

`ui_move` `ui_select` `ui_back` `ui_error` `ui_open` `ui_close` `text_tick` `step_grass` `step_stone` `step_wood` `step_water` `step_salt` `door` `warp` `ledge_hop` `bike_bell` `boat_chug` `train_pass` `train_whistle` `level_crossing` `rain` `wind` `fog_hum` `thunder` `signal_pulse` (SIGNAL METER shimmer) `oracle_tag` (4-note) `agent_sleet` `agent_vigil` `agent_arbiter` `agent_pippin` `overdrive_ready` `overdrive_fire` `hit_normal` `hit_super` `hit_weak` `crit` `faint` `capsule_throw` `capsule_shake` `capsule_catch` `capsule_break` `heal` `status_apply` `stage_up` `stage_down` `evolve` `cat_meow` `cat_purr` `cat_sit` `bell_toll` `camera_shutter` `fish_bite` `brew_bubble` `coin` `achievement`.

---

## 9. ENCOUNTER TABLES

**Id convention:** `enc_<area>_<zone>[_<variant>]` where `<area>` = the map id stem (below), `<zone>` ∈ `grass water cave fish`, `<variant>` ∈ `night rain fog` (day/dry/clear is the unsuffixed table). Rules: night tables replace day between 20:00–06:00 (dusk 18–21 uses day tables with `time:['dusk']` weights); rain/fog tables *overlay* (weighted 50% with base) when that weather is active; a map that lacks a variant falls back to its base table. Fishing tables use rod tiers: `tier:'common'|'uncommon'|'rare'|'legendary'|'ghost'` per row.

**Map id stems (areas):** `macclesfield r1_canal r2_middlewood r3_gritstone_n r4_bollin r5_mottram bollington prestbury poynton lyme_park teggs_nose wilmslow r6_carrs styal lindow_moss r7_sandhills alderley_edge edge_caverns_copper edge_caverns_hough edge_caverns_knights r8_chelford knutsford tatton_park rostherne r9_ollerton r10_twemlow r11_brereton holmes_chapel jodrell_grounds jodrell_interior congleton bosley_cloud r12_biddulph little_moreton mow_cop r13_wheelock sandbach r14_elworth crewe crewe_works r15_wybunbury nantwich hack_green r16_weaver r17_booth_lane middlewich winsford r18_vale_royal r19_rudheath northwich salt_mine anderton_lift marbury great_budworth r20_arley lymm r21_bridgewater warrington daresbury r22_daresbury_lane runcorn halton_castle r23_frodsham_marsh frodsham frodsham_hill r24_helsby delamere r25_whitegate tarporley r26_kelsall r27_bunbury beeston r28_tarvin chester chester_walls r29_shropshire_union chester_zoo ellesmere_port r30_wirral_way parkgate ince_marshes the_stack y_berllan_orchard coed_y_berllan daresbury_church`.

Level ranges follow the chapter bands. Weights `w` are left to the data workstream except where noted; species listed first are the most common.

| Table id | Lv | Species (4–8) |
|---|---|---|
| `enc_r1_canal_grass` | 3–6 | nibbit, towpaddle, flitchick, mistlop, sootling, sparkit |
| `enc_r1_canal_grass_night` | 3–7 | flitmoth, nibbit, spindrake (rare morph), bollinmoth, webshade |
| `enc_r1_canal_water` | 4–7 | towpaddle, puddlish, heronet |
| `enc_r1_canal_fish` | 4–8 | puddlish (common), perchip (uncommon), torrentide (rare) |
| `enc_r2_middlewood_grass` | 4–7 | mistlop, flitchick, grousel, nibbit, mistewe, keystone |
| `enc_r2_middlewood_grass_night` | 4–8 | flitmoth, mistlop, sootling, nancylith (rare, dusk) |
| `enc_r3_gritstone_n_grass` | 5–8 | grousel, mistewe, mistlop, galewing, piphart, harrowlop |
| `enc_r3_gritstone_n_grass_rain` | 5–8 | mistewe, heronet, grousel, sheepwire |
| `enc_r4_bollin_grass` | 4–7 | heronet, nibbit, flitchick, prickpip, sootling, bobbinet |
| `enc_r4_bollin_water` | 5–8 | towpaddle, puddlish, heronet, otterkin |
| `enc_r4_bollin_grass_night` | 5–8 | flitmoth, bollinmoth, mistwisp, spindrake |
| `enc_r5_mottram_grass` | 5–8 | prickpip, sparkit, flitchick, piphart, peepcam (uncommon), pitpony |
| `enc_poynton_water` / `enc_poynton_fish` | 4–8 | puddlish, torrentide, perchip; fish: puddlish/perchip/torrentide (rare, tagged) |
| `enc_lyme_park_grass` | 6–9 | piphart, stagwire (uncommon), grousel, mistewe, galewing, moorcock |
| `enc_teggs_nose_grass` | 12–20 (later gate) | moorcock, harrowlop, galewing, nancylith, runestane, gargoylet |
| `enc_r6_carrs_grass` | 8–11 | sheepwire, heronet, flitchick, sparkit, botling, puddlish |
| `enc_r6_carrs_fish` | 8–12 | perchip, puddlish, torrentide, piketide (rare) |
| `enc_styal_grass` | 8–12 | sluiceling, botling, sheepwire, webshade (night), sootling |
| `enc_styal_water` | 9–12 | sluiceling, heronet, otterkin |
| `enc_lindow_moss_grass` | 9–13 | mistwisp, bogleap, peatkin, puppetacct (fog), sheepwire |
| `enc_lindow_moss_grass_night` | 10–14 | mistwisp, peatkin, phantasmal (rare), lindowan (boss only, scripted) |
| `enc_lindow_moss_grass_fog` | 10–14 | puppetacct, proxling, mistwisp |
| `enc_r7_sandhills_grass` | 9–13 | owlume (dusk), prickpip, cuprabug, mistlop, sparkit |
| `enc_alderley_edge_grass` | 10–13 | cuprabug, squeakwing, prickpip, owlume, sparkit |
| `enc_edge_caverns_copper_cave` | 10–14 | cuprabug, squeakwing, gloamite, verdigrit (rare) |
| `enc_edge_caverns_hough_water` | 30–36 (Narrowboat) | crabbex, bellmere (rare), otterkin, gloamite |
| `enc_edge_caverns_knights_cave` | 55–65 (PG) | gloamguard, dolmenor, mowstane, timberwraith, strigyx, merlynx (scripted) |
| `enc_r8_chelford_grass` | 12–16 | prickpip, bramblehog, quillet, sheepwire, piphart, owlume |
| `enc_r8_chelford_grass_night` | 12–16 | mistwisp, owlume, bellmere (rare, mere path) |
| `enc_tatton_park_grass` | 13–17 | piphart, stagwire, swanling, quillet, sheepwire, ramvolt |
| `enc_tatton_park_grass_rain` | 13–17 | stagwire (rain-only antler patterns), heronet, swanling |
| `enc_tatton_park_water` / `_fish` | 13–18 | swanling, perchip, piketide, heronet |
| `enc_rostherne_water` | 14–18 | bellmere (rare), swanling, piketide, dishlet |
| `enc_r9_ollerton_grass` | 14–18 | sheepwire, ramvolt, piphart, quillet, curdli |
| `enc_r10_twemlow_grass` | 16–20 | keystone, heronet, otterkin, sparkrail (night), quillet |
| `enc_r10_twemlow_grass_rain` | 16–20 | otterkin, heronet, keystone (flood variant) |
| `enc_r11_brereton_grass` | 16–20 | otterkin, prickpip, bramblehog, swanling, tudorling |
| `enc_holmes_chapel_grass_night` | 17–21 | poltergrid (rare), sparkrail, keystone |
| `enc_jodrell_grounds_grass` | 17–21 | dishlet, quillet, piphart, oakling |
| `enc_jodrell_grounds_grass_night` | 18–22 | pulsaris (rare), dishlet, owlume |
| `enc_congleton_grass` | 18–22 | cubbin (uncommon), otterkin, prickpip, curdli, belfrit |
| `enc_bosley_cloud_grass` | 19–23 | runestane, moorcock, harrowlop, bruinhall (rare, wandering bear), galewing |
| `enc_r12_biddulph_grass` | 19–23 | tudorling, keystone, prickpip, sparkrail |
| `enc_little_moreton_grass_night` | 20–24 | tudorling, timberwraith (rare), mistwisp |
| `enc_mow_cop_grass` | 20–24 | mowstane (rare, night), runestane, moorcock, gargoylet |
| `enc_r13_wheelock_grass` / `_water` | 21–25 | belfrit, curdli, towpaddle, mallardier, crabbex |
| `enc_sandbach_grass` | 21–25 | belfrit, curdli, rottling (bounty), quillet |
| `enc_r14_elworth_grass` | 22–26 | chuglet, sleeperk, keystone, sparkrail |
| `enc_r14_elworth_grass_night` | 22–26 | sparkrail, poltergrid (rare), chuglet |
| `enc_crewe_works_cave` | 23–27 | chuglet, shunterra, bricklum, sleeperk, steamloco (PG only) |
| `enc_r15_wybunbury_grass` | 23–27 | curdli, cheshwheel (rare), sheepwire, ramvolt, rottling |
| `enc_r15_wybunbury_grass_night` | 23–27 | mistwisp, phantasmal, gloamite |
| `enc_nantwich_water` / `_fish` | 25–29 | brinelet, saltling, crabbex, volteel (fish rare) |
| `enc_hack_green_cave` | 40–46 (PG gate) | puppetacct, wormhack, teramite, trojanox, gloamite |
| `enc_r16_weaver_water` / `_fish` | 25–30 | crabbex, otterkin, volteel, torrentide, panscald (rare) |
| `enc_r16_weaver_grass` | 25–30 | brinelet, saltling, sheepwire, mallardier |
| `enc_r17_booth_lane_grass` | 27–31 | saltling, cryssal, keystone, bitmite |
| `enc_middlewich_grass_night` | 28–32 | chordle (rare), mistwisp, phantasmal |
| `enc_winsford_fish` | 28–33 | flashfin (uncommon), phishfin, subsidon (rare, dawn), volteel |
| `enc_winsford_cave` (DeepStore) | 28–33 | bitmite, teramite (rare), virling, cryssal |
| `enc_r18_vale_royal_water` | 28–33 | crabbex, mallardier, otterkin, torrentide |
| `enc_r19_rudheath_grass` | 28–33 | saltling, cryssal, sheepwire, flashfin (flash pools) |
| `enc_northwich_grass` | 29–33 | saltling, cryssal, brinelet, panscald |
| `enc_salt_mine_cave` | 30–34 | saltling, cryssal, pillarnaut, salberg (rare), virling, wormhack |
| `enc_salt_mine_water` | 30–34 | crabbex, salberg, brinelet |
| `enc_anderton_lift_water` | 30–34 | krabbaron, mallardier, crabbex, bargemog (uncommon) |
| `enc_marbury_grass` / `_night` | 30–34 | owlume, strigyx, ladymere (rare, night) |
| `enc_r20_arley_grass_night` | 31–35 | strigyx, owlume, mistwisp, bargemog |
| `enc_delamere_grass` | 33–37 | mossling, oakling, groveguard, lampyr (night), hornhound |
| `enc_delamere_grass_night` | 33–37 | lampyr, drownwood (rare), owlume, mossbear |
| `enc_delamere_water` | 33–37 | otterkin, lutrarch, drownwood (rare) |
| `enc_r24_helsby_grass` | 34–38 | gargoylet, falconet, mossling, cuprabug |
| `enc_r26_kelsall_grass` | 34–38 | falconet, groveguard, thornarch (rare), hornhound |
| `enc_r27_bunbury_water` | 34–38 | mallardier, otterkin, torrentide, crabbex |
| `enc_beeston_grass` | 35–39 | gargoylet, falconet, peregrint, mossbear, gloamite |
| `enc_beeston_cave` | 35–39 | gloamite, gargoylet, cuprabug, gloamguard (rare) |
| `enc_r23_frodsham_marsh_grass` | 36–40 | egrette, curlewind, bogleap, turbinix, sheepwire |
| `enc_r23_frodsham_marsh_grass_night` | 36–40 | mistwisp, egrette, phantasmal, beaconflare (beacon event only) |
| `enc_frodsham_hill_grass` | 36–40 | falconet, peregrint, gargoylet, moorcock |
| `enc_r22_daresbury_lane_grass_fog` | 37–41 | proxling, puppetacct, botnetle, quarkling |
| `enc_daresbury_grass` | 37–41 | quarkling, grinkit (uncommon), mirrorling (rare), sparkit |
| `enc_runcorn_grass` | 37–41 | smogling, proxling, botnetle, chlorodon (rare) |
| `enc_runcorn_fish` (Mersey) | 37–42 | sludgeon (rare), volteel, torrentide (poison morph flag) |
| `enc_the_stack_cave` | 38–42 / PG 55–65 | trojanox, botnetle, wormhack, firewaul (rare), droneling, teramite, shardmind (boss add only) |
| `enc_lymm_water` / `_fish` | 40–44 | bellmere, piketide, otterkin, volteel; fish rare `salmoneer` |
| `enc_lymm_water_night` | 40–44 | volteel, piketide, glitchra (sighting only, scripted) |
| `enc_r21_bridgewater_water` | 40–44 | bargemog, mallardier, krabbaron |
| `enc_warrington_grass` | 41–45 | peepcam, panoptix, botnetle, droneling, datadrake (rare) |
| `enc_jodrell_interior_cave` | 44–50 | dishlet, parabolus, teramite, wormhack, shardmind (adds), glitchra (boss) |
| `enc_r28_tarvin_grass` | 44–48 | falconet, hornhound, sheepwire, groveguard |
| `enc_chester_walls_grass_night` | 48–54 | legionet, centurigeist (rare), gargoylet, grotesquire (rare) |
| `enc_chester_fish` (Dee) | 48–56 | salmoneer (legendary table dawn/dusk), piketide, volteel |
| `enc_r29_shropshire_union_water` | 50–56 | bargemog, krabbaron, mallardier |
| `enc_chester_zoo_grass` | 55–60 | pengwyn, girafflor, pandember (each scripted "escapee" encounter, then rare wild) |
| `enc_ellesmere_port_grass` | 55–60 | flarestack, botnetle, bargemog, krabbaron |
| `enc_r30_wirral_way_grass` / `enc_parkgate_grass` | 55–62 | egrette, curlewind, crabbex, ebbwraith (rare dusk) |
| `enc_ince_marshes_grass_fog` | 58–66 | proxling, puppetacct, turbinix, egrette, teramite |
| `enc_y_berllan_orchard_grass` | 26–32 (no wild until Ch6 end; PG 55–65) | perrypip, prickpip, rottling, mulchmaw, ceffylwen (riddle only) |
| `enc_y_berllan_orchard_fish` | 26–32 | brithyll (rare, Welsh-only), puddlish, torrentide |
| `enc_coed_y_berllan_grass` | 28–34 | perryarch, oakling, derwydd (rare), owlume |
| `enc_coed_y_berllan_grass_night` | 28–34 | owlume, strigyx, mistwisp |

Every species name above is an id from §1. Wild `spindrake` and `grinkit` are the only starter/gift-line species that appear in tables.

---

## 10. FLAG / QUEST / ACHIEVEMENT ID CONVENTIONS

**Flags** (`MQ.Flags`): story flags use exactly STORY-BIBLE §10 ids (`contract_signed`, `starter_chosen`, `badge_packet` … `badge_admin`, `all_badges`, `choice_agents`, `choice_vex`, `choice_plug`, `invoice_holder`, `champion_result`, `postgame_open`, PG flags `fifth_pulse penguin_case ellesmere_mirror lymm_pumps_talk amos_jim_face knights_hall_open merlynx_on_press roodee_rematch nino_letter_final`). Additional conventions:
- Trainer beaten: `t_<trainer_id>`; rematch tier: `t_<trainer_id>_tier` (0–5).
- Item pickup: `item_<map>_<n>`; hidden: `hitem_<map>_<n>`.
- Trigger seen: `seen_<map>_<name>`; NPC talked once: `npc_<npc_id>_met`.
- Traversal unlocks live in `MQ.Overworld.state.abilities` with the key-item ids from §4.7 (`middlewood_bike`, `davy_lamp`, `billhook`, `narrowboat_licence`, `lift_pass`, `waders`, `gritstone_grips`, `proxy_goggles`, `railcard`, `cambrian_ticket`, `root_access`) plus `meadow_squeeze`, `bigboy_shove`.
- Legendary state: `leg_<species>_state` ∈ `unseen | seen | fled | caught` and `leg_<species>_site` (rotation index).
- Counters (`MQ.Flags.add`): `count_puppets_beaten`, `count_amos_exposed`, `count_lures_refused`, `count_brink_saves`, `count_overdrives`, `count_lido_heals`, `count_bounties`, `count_warrants`, `count_photos`, `steps_total`, `steps_rain`, `runcorn_fog_fridges`, `stack_doors_opened`, `cutover_days`.

**Quests** (`MQ.Quests`): main chapters `main_ch01` … `main_ch12`, `main_pg`; casebook cases `case_<nn>_<slug>` for SIDE-CONTENT §1: `case_01_silk_thread case_02_white_nancy_watch case_03_middlewood_escort case_04_wizards_well case_05_quarry_bank_overtime case_06_deer_census case_07_poynton_pool_ledger case_08_gaskell_draft case_09_penny_farthing_rally case_10_bear_of_congleton case_11_signal_box case_12_saxon_crosses_cipher case_13_bounty_fenced_goods case_14_deepfake_vicar case_15_timetable_tangle case_16_stokers_ladder case_17_brine_of_nantwich case_18_nantwich_ram case_19_middlewich_salt_roads case_20_winsford_flashes case_21_whistle_test case_22_lift_logic case_23_frodsham_beacon case_24_runcorn_gauntlet case_25_weaver_hall_ghost case_26_delamere_watch case_27_lymm_dam_reflection case_28_wire_arcade case_29_chester_walls_round case_30_elm_press`; bounties `bounty_<species>_<n>` (generated, `kind:'bounty'`); trails `trail_gritstone trail_sandstone trail_ring`; season cases `season_<mm>_<slug>` (e.g. `season_01_wassail`, `season_05_mayday`, `season_10_static_surge`); epilogues `epilogue_<slug>`. Quest stage ids are `s1..sN` within a quest; completion sets flag `q_<quest_id>_done`.

**Achievements** (`MQ.Achievements`, SIDE-CONTENT §2.9 order): `ach_first_triage ach_walked_not_ran ach_bothered_by_weather ach_unbothered_by_weather ach_paste_refused ach_not_today_botnet ach_trust_anchor ach_eight_anchors ach_cranford_correspondent ach_bear_necessity ach_salt_of_the_earth ach_sighted_not_cited ach_ghost_in_the_signal_box ach_brine_time ach_balanced_caissons ach_on_time_every_time ach_wallwalker ach_small_black_fast ach_back_from_the_brink ach_big_boy_energy ach_first_press ach_nain_would_approve ach_cambrian_line ach_ambidextrous ach_ticket_to_ride ach_twelve_thousand_puppets ach_wearing_a_trusted_face ach_shadow_it_sunlit ach_bounty_hunter ach_warrant_served ach_arena_bronze ach_arena_silver ach_arena_gold ach_arena_platinum ach_arena_obsidian ach_casebook_closed ach_full_dex ach_overdriven ach_principal ach_cheshire_protocol`.

**Badges:** `packet cipher bear kernel token daemon proxy admin` (flag `badge_<id>`). **Agents:** `sleet vigil arbiter pippin`. **Perk ids:** `perk_<tree>_<slug>` with trees `hunter warden handler` (SYSTEMS-SPEC names win over SIDE-CONTENT's Analyst/Responder labels; SIDE-CONTENT's `Analyst`/`Responder` reward points map to `warden`/`handler`). **Temperaments:** lower-case of SYSTEMS-SPEC §1 names (`brisk stubborn sharp blunt wary bold rash patient nosy gruff mardy canny steadfast placid skittish sly solid windy plain ordinary even fair`). **Weather:** `rain sun fog wind`. **Terrain:** `grass wet salt static silk`. **Statuses:** `psn tox par brn slp frz cnf`. **Difficulty:** `story normal hard nightmare`. **Trainer ids:** `<class>_<map>_<n>` for route trainers, `leader_<name>` (`leader_ada` …), `vex_ch01` … `vex_champion`, `boss_<slug>` (`boss_lindowan boss_apt boss_kellan_lido boss_understudy_beeston boss_hack_green boss_gateway boss_root boss_glitchra boss_oracle boss_stack_remnant`), `whitehat_sue` … `whitehat_doc`.
