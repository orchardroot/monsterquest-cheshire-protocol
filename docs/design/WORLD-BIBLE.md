# MonsterQuest: The Cheshire Protocol — WORLD BIBLE (v2)

*A Cheshire you can walk. Grid positions are (column, row) on a 14×10 world map: A–N runs west→east, 1–10 runs north→south. Chester sits west, Macclesfield east, Warrington north, Nantwich south — true to the county.*

---

## 0. Design rules for the whole region

- **No corridors.** Every route has at least one loop, one elevation change or water crossing, and one hidden pocket. Towns are built from their real street logic (Chester's Rows and wall circuit, Sandbach's cobbled square, Bollington climbing the hill), not a template.
- **Palette per town.** Each settlement gets its own tileset flavour and 4-colour accent (listed below), its own music motif, and its own NPC vocabulary.
- **Progression spine (badges):** Wilmslow PACKET → Knutsford CIPHER → Congleton BEAR → Crewe KERNEL → Nantwich TOKEN → Northwich DAEMON → Runcorn PROXY → Warrington ADMIN → Jodrell Bank (ROOT/DARKBYTE) → Chester THE FIREWALL. Post-game opens THE STACK on Ince Marshes, Hack Green, Y Berllan brewing, Mow Cop and the four legendaries' rematch trails.
- **Three long-distance trails** stitch the map for the walker: the **Gritstone Trail** (Lyme Park → Tegg's Nose → Bosley Cloud → Mow Cop), the **Sandstone Trail** (Frodsham → Delamere → Beeston/Peckforton → Bickerton) and the **Cheshire Ring canal** (Macclesfield, Trent & Mersey, Bridgewater). Completing each is a casebook quest with a viewpoint collectible at every summit.

---

## 1. Region graph

### 1a. Settlements and sites (nodes)

| # | Node | Grid | Type | Gate to enter |
|---|------|------|------|---------------|
| 1 | Macclesfield | K5 | start town, station | — |
| 2 | Bollington & White Nancy | L4 | village | — |
| 3 | Prestbury | K4 | village | — |
| 4 | Poynton | L3 | town, station | — |
| 5 | Lyme Park & The Cage | M2 | estate site | Bike or Ch.1 done |
| 6 | Tegg's Nose / Macclesfield Forest / Cat & Fiddle | L6 | upland site | Gritstone Grips |
| 7 | Wilmslow (Gym 1) | J3 | town, station | — |
| 8 | Styal & Quarry Bank Mill | J2 | village site | — |
| 9 | Lindow Moss | I3 | bog dungeon | Waders (or partial without) |
| 10 | Alderley Edge | J4 | village | — |
| 11 | Edge Caverns | J4 (under) | dungeon | Davy Lamp for deep levels |
| 12 | Knutsford (Gym 2) | H3 | town, station | — |
| 13 | Tatton Park | H2 | estate site | Knutsford visited |
| 14 | Holmes Chapel | H6 | village, station | Badge 2 |
| 15 | Jodrell Bank Observatory | I5 | story dungeon | Badge 8 for interior; grounds after Badge 2 |
| 16 | Congleton (Gym 3) | I8 | town, station | — |
| 17 | Little Moreton Hall & Mow Cop | J8/J9 | site pair | Bosley Cloud viewpoint reached |
| 18 | Sandbach | G7 | town | Badge 3 |
| 19 | Crewe (Gym 4) | F8 | town, hub station | — |
| 20 | Nantwich (Gym 5) | D8 | town, station | Badge 4 |
| 21 | Hack Green Secret Bunker | D9 | dungeon | Bunker Key (post Ch.6) |
| 22 | Middlewich | F5 | town | Badge 5 |
| 23 | Winsford & the Flashes | E6 | town, station | Badge 5 |
| 24 | Northwich (Gym 6) | F4 | town, station | — |
| 25 | Northwich Salt Mine (Marston / Lion Salt Works) | G4 | dungeon | Salt Mine Pass |
| 26 | Anderton Boat Lift & Marbury | F3 | site | Narrowboat Licence to use lift |
| 27 | Great Budworth | G3 | village | — |
| 28 | Lymm | G1 | village | Badge 6 |
| 29 | Warrington (Gym 8) | F1 | town, station | Badge 7 |
| 30 | Daresbury | E2 | village site | — |
| 31 | Runcorn (Gym 7) | D2 | town, station | Badge 6 |
| 32 | Frodsham | D3 | town, station | Badge 6 |
| 33 | Delamere Forest | D4 | forest dungeon | — |
| 34 | Tarporley | C6 | village | Badge 6 |
| 35 | Beeston Castle & Peckforton | C7 | dungeon site | Gritstone Grips for keep |
| 36 | Chester (League) | B5 | city, station | Badge 8 + ROOT defeated for The Firewall; city open after Badge 6 |
| 37 | Chester Zoo | B3 | site | Zoo Membership (side quest) |
| 38 | Ellesmere Port | B2 | town, station | Chester visited |
| 39 | Ince Marshes / THE STACK | C2 | end-game dungeon | Root Access + Waders |
| 40 | Parkgate & Burton Marsh | A3 | village site | Waders |
| 41 | Y Berllan, Ceredigion | off-map W | orchard hub | Cambrian Line ticket (Ch.4) |

### 1b. Routes, dungeons and interiors of note (edges)

| Route | Connects | Gate |
|---|---|---|
| R1 Macclesfield Canal towpath | Macclesfield ↔ Bollington | — |
| R2 Middlewood Way (Kerridge) | Bollington ↔ Poynton | Bike for the tunnel shortcut |
| R3 Gritstone Trail North | Poynton ↔ Lyme Park | — |
| R4 Bollin Valley lane | Macclesfield ↔ Prestbury | — |
| R5 Mottram lanes | Prestbury ↔ Wilmslow | — |
| R6 The Carrs | Wilmslow ↔ Styal | — |
| R7 Alderley Road & Sandhills | Wilmslow ↔ Alderley Edge | — |
| R8 Chelford Heath & Radnor Mere | Alderley Edge ↔ Knutsford | Billhook for the mere path |
| R9 Ollerton & Goostrey lanes | Knutsford ↔ Holmes Chapel | Badge 2 |
| R10 Twemlow Viaduct meadows | Holmes Chapel ↔ Jodrell Bank | — |
| R11 Brereton Heath & Astbury Mere | Holmes Chapel ↔ Congleton | — |
| D-Cloud Bosley Cloud | Congleton ↔ Tegg's Nose (upland link) | Gritstone Grips |
| R12 Biddulph Valley Way | Congleton ↔ Little Moreton/Mow Cop | — |
| R13 Wheelock canal & Rode Heath | Congleton ↔ Sandbach | Badge 3 |
| R14 Elworth cut | Sandbach ↔ Crewe | — |
| D-Works Crewe Works sheds | inside Crewe | Badge 4 story |
| R15 Willaston & Wybunbury | Crewe ↔ Nantwich | Badge 4 |
| R16 Weaver Valley (Church Minshull) | Nantwich ↔ Winsford | Badge 5 |
| R17 Booth Lane & Wheelock flight | Sandbach ↔ Middlewich | Badge 5 |
| R18 Vale Royal Locks | Winsford ↔ Northwich | Narrowboat for the river half |
| R19 Rudheath & Broken Cross | Middlewich ↔ Northwich | — |
| D-Salt Northwich Salt Mine | under Northwich/Marston | Salt Mine Pass |
| D-Lift Anderton & Marbury Park | Northwich ↔ Great Budworth (two levels) | Narrowboat for the lift |
| R20 Arley & the Bollin crossing | Great Budworth ↔ Lymm | Badge 6 |
| R21 Bridgewater towpath (Thelwall) | Lymm ↔ Warrington | Badge 7 |
| R22 Daresbury lane & Keckwick | Warrington ↔ Daresbury ↔ Runcorn | Proxy Goggles for the fog bank |
| D-Bridge Silver Jubilee Bridge & Halton Castle | inside Runcorn | Badge 7 story |
| R23 Weston & Frodsham Marsh | Runcorn ↔ Frodsham | Waders for marsh pocket |
| D-Hill Frodsham Hill & Overton Beacon | inside Frodsham; Sandstone Trail start | — |
| R24 Helsby & Manley | Frodsham ↔ Delamere | — |
| D-Forest Delamere Forest | Frodsham/Northwich/Tarporley hub | Davy Lamp for Blakemere night pocket |
| R25 Whitegate Way (old rail) | Delamere ↔ Winsford/Northwich | Bike |
| R26 Kelsall & the Sandstone Trail | Delamere ↔ Tarporley | Badge 6 |
| R27 Bunbury & the Shropshire Union | Tarporley ↔ Beeston | — |
| D-Crag Beeston Crag & Peckforton | inside Beeston | Gritstone Grips |
| R28 Tarvin & Christleton | Tarporley ↔ Chester | Badge 6 |
| D-Walls Chester walls circuit & amphitheatre | inside Chester | — |
| R29 Shropshire Union north | Chester ↔ Zoo ↔ Ellesmere Port | — |
| R30 Wirral Way & Burton Marsh | Ellesmere Port ↔ Parkgate | Waders |
| D-Stack Ince Marshes / THE STACK | Ellesmere Port ↔ Frodsham (marsh) | Root Access + Waders |
| D-Bunker Hack Green | Nantwich south | Bunker Key |
| D-Berllan Coed y Berllan (orchard wood) | at Y Berllan | Cambrian ticket |
| Rail: Macc–Wilmslow–Crewe; Crewe–Nantwich; Crewe–Sandbach–Holmes Chapel; Crewe–Winsford–Northwich–Frodsham–Runcorn(via Warrington)–Chester; Crewe–Chester; Chester–Ellesmere Port; Cambrian Line to Y Berllan | | station unlocked on foot |

---

## 2. Towns and sites

Format: **identity** — landmarks — palette/tiles — people & signature NPCs — activity — shops — hooks.

### Macclesfield (K5) — start
Silk town on the hill; the 108 Steps climb from the station to St Michael's church. **Landmarks:** Paradise Mill and Silk Museum, the 108 Steps, Treacle Market in Market Place, Hovis mill on the canal, St Michael's, Christ Church tower, the Sutton bridges of the Macclesfield Canal. **Palette:** silk-mill brick (oxblood), soot-black window heads, weaver-cottage rows with long attic windows, blue-slate roofs; interior tiles: bobbin racks, Jacquard looms. **People:** weavers, market stallholders, hill-walkers with poles. **NPCs:** *Professor Ada Silkwood* (Alder Labs, gives starters in Paradise Mill), *Treacle Tam* (market fixer, buys oddities), *Mrs Bobbin* (your neighbour, feeds MEADOW when you're away). **Activity:** Treacle Market haggling (weekly-cycle stalls with rotating stock). **Shops:** Mart, Silk Outfitters (trainer cosmetics), Capsule kiosk. **Hooks:** the 108 Steps timed sprint (bike part); missing loom pattern stolen by "a man who looked exactly like the curator" (first AMOS thread); a night-only silk moth swarm on the canal (Bollin moth line); the Hovis mill weathervane points wrong when ORACLE's signal spikes.

### Bollington & White Nancy (L4)
Mill village that climbs. **Landmarks:** White Nancy (the sugar-loaf folly on Kerridge Hill), Clarence Mill and Adelphi Mill on the canal, the Middlewood Way viaduct, Kerridge stone quarries. **Palette:** honey Kerridge gritstone, whitewash on Nancy, cotton-mill red, viaduct arches. **People:** cyclists, walkers, brass-band players. **NPCs:** *Nancy Kerridge* (paints White Nancy; her rota of paint schemes matches real commemorations), *Spokes* (bike hire; gives the **Middlewood Bike**), *Bandmaster Ollie*. **Activity:** Kerridge ridge time-trial. **Shops:** bike parts, hill café. **Hooks:** Nancy has been repainted overnight with a QR-like glyph (ClickFix lure); brass band's tuba is a Botnetle nest; a viewpoint plaque puzzle listing hills you must later stand on.

### Prestbury (K4)
Rich, quiet, watchful. **Landmarks:** Norman chapel beside St Peter's, the Bridge Hotel over the Bollin, the black-and-white Priest's House. **Palette:** cream render, black-and-white timber, box hedges, gravel drives; unusually many CCTV cameras. **People:** footballers' housekeepers, private security, a suspicious number of "consultants". **NPCs:** *Gatekeeper Ffion* (Welsh, opens a locked gate only if you answer in Welsh), *Dr Penhaligon* (retired cryptographer, offers Cipher tutorials). **Activity:** hedge-maze garden behind the Priest's House (rotates weekly). **Shops:** upmarket capsules, held-item boutique. **Hooks:** a mansion's smart-home has joined a Credential Stuffer swarm; a lost pedigree cat (unlocks a MEADOW cosmetic); the Norman chapel's night ghost is a misplaced Roman-type from Chester.

### Poynton (L3)
Old coal village turned commuter town. **Landmarks:** Poynton Pool, the shared-space roundabout (no signs — NPCs weave), Anson Engine Museum, Middlewood Way, old pit head at Lady Pit. **Palette:** dark coal seams, red brick terraces, pale pool water, engine-museum brass. **People:** engine restorers, coal-heritage volunteers, dog walkers. **NPCs:** *Stoker Bea* (Anson museum, primes the Fire storyline), *Pit-Pony Pat* (breeder of Ground-types). **Activity:** engine-restoration matching mini-game (order valves). **Shops:** Mart, engine oil (Fire held item). **Hooks:** the flooded pit shaft breathes cold at night — a sealed adit to a mini-cave; a Shadow IT commuter running a home server that keeps DDoSing the pool's ducks; museum's traction engine has been "borrowed".

### Lyme Park & The Cage (M2)
Deer park on the Peak fringe. **Landmarks:** The Cage (hunting tower on the ridge), the great house and lake, the Bowstones (Anglo-Saxon shafts on the moor), red deer herds. **Palette:** bracken amber, gritstone grey, deep formal-garden green. **People:** rangers, deer counters, National-Trust-style volunteers. **NPCs:** *Ranger Hesketh* (deer census), *Old Bowstone* (moor hermit, teaches Gritstone Grips later). **Activity:** deer census with binoculars (spot-the-stag). **Hooks:** a stag with a tracker collar transmitting to THE STACK; the Cage lights at night; Bowstones rune-rubbing (letter fragment).

### Tegg's Nose / Macclesfield Forest / Cat & Fiddle (L6)
The moor above the town. **Landmarks:** Tegg's Nose quarry and cutting machines, Ridgegate and Trentabank reservoirs (heronry), Shutlingsloe "the Cheshire Matterhorn", the Cat & Fiddle inn on the A537. **Palette:** heather purple, quarry-slab grey, conifer black, reservoir slate. **People:** fell-runners, bikers at the Cat & Fiddle. **NPCs:** *Fellrunner Nesta*, *Landlord Fiddle* (bikers' pub; runs a rematch board). **Activity:** Shutlingsloe summit dash. **Hooks:** GRINMALKIN's first sighting at the Cat & Fiddle at dusk; heronry nest thefts; the quarry cutting machine hums with the signal.

### Wilmslow (J3) — Gym 1, Electric, Sysadmin Ada (PACKET)
The commuter town where Alan Turing lived. **Landmarks:** Lindow Man's discovery site on Lindow Moss, The Carrs riverside park, St Bartholomew's, the station, Turing's house on Adlington Road. **Palette:** pale sandstone church, café-strip glass, Bollin willow-green, circuit-board floors in the gym. **People:** developers, café workers, ramblers. **NPCs:** *Sysadmin Ada* (gym: a rack-room maze where you patch cables to reach her), *Turing's Neighbour* (a very old man who gives the CIPHER hint), *Bog Body Bill* (Lindow archaeologist). **Activity:** cable-patching logic puzzle. **Shops:** Mart, Electric held items. **Hooks:** the town's Wi-Fi hotspots are all named the same (Credential Stuffer honeypot); a Carrs footbridge troll; find Turing's lost apple (item).

### Styal & Quarry Bank Mill (J2)
Water-powered mill in the Bollin gorge, aircraft overhead. **Landmarks:** Quarry Bank Mill's giant iron waterwheel, the Apprentice House, Styal village's timber cottages, the airport runway viewing mound. **Palette:** wet gorge green, mill red, wheel iron, runway concrete. **People:** mill volunteers, plane spotters, apprentice ghosts. **NPCs:** *Wheelwright Enid*, *Spotter Kwame* (logs planes = logs "flying" species). **Activity:** waterwheel timing (open sluices in rhythm). **Hooks:** the apprentices' bell rings at night by itself; a plane spotter's radio pulls in ORACLE's telemetry; the weir hides a dive pocket.

### Lindow Moss (I3) — bog dungeon
Peat bog where the bog body was found. Boardwalks that sink; safe route changes with rain. Wisps at night; Ghost/Poison/Water archetypes; the "Preserved One" mini-boss.

### Alderley Edge (J4)
Sandstone escarpment with a wizard legend and copper mines. **Landmarks:** Stormy Point, the Wizard's Well and carved face, Castle Rock, the Beacon, the Armada Beacon site, old copper mine entrances, the Wizard inn. **Palette:** rust-red sandstone, copper green stains, birch silver, mine-black. **People:** mine explorers, legend-tellers, well-heeled villagers. **NPCs:** *The Miner-Warden Gwil* (gives **Davy Lamp**), *Old Wizard Ambrose* (legend NPC; hints at MERLYNX and the sleeping knights), *Cavers' Club*. **Activity:** mine-survey mapping (fill in a grid). **Shops:** rope, lamps. **Hooks:** the sleeping-knights legend (secret chamber needs a "milk-white mare"—a certain species in party); a stolen copper ore shipment; the carved face speaks in Russian at night.

### Edge Caverns (J4, under) — dungeon
Three levels: copper workings (lamp), the Hough Level tunnel (flooded, Narrowboat later), the Cave of the Knights (MERLYNX). Loops around vertical shafts with ladders; a rope-slide shortcut back to the Beacon.

### Knutsford (H3) — Gym 2, Psychic, Madam Gaskell (CIPHER)
Georgian streets, Gaskell's town, May Day. **Landmarks:** Gaskell Memorial Tower and King's Coffee House (Italianate), King Street and Princess Street on two levels, the Penny Farthing Museum, the Heath, the Tatton gates. **Palette:** Georgian brick and white sash, Italianate cream, sanded May Day streets in coloured patterns. **People:** novelists, penny-farthing riders, sedan chairmen. **NPCs:** *Madam Gaskell* (gym: a library of moving stacks; answer letter-cipher riddles to open aisles), *Penny Farthing Percy*, *Sand-artist Mair*. **Activity:** May Day sand-pattern drawing (memory game). **Shops:** Mart, book of moves (TM equivalents as "chapters"). **Hooks:** ClickFix preachers on the Heath handing out "paste-and-run" leaflets; a letter from Georgia is misdelivered here; the Gaskell tower is a listening post.

### Tatton Park (H2)
Vast deer park and mansion. **Landmarks:** Tatton Hall, the Old Hall (Tudor), the Japanese Garden, Tatton Mere, the Knutsford Gate. **Palette:** parkland gold, mansion pale stone, mere silver, Japanese maple red. **NPCs:** *Head Gardener Su*, *Old Hall Steward*. **Activity:** fishing on Tatton Mere (best carp-line spot). **Hooks:** the deer census part 2; a stolen bonsai; a Tudor ghost trainer at night in the Old Hall.

### Holmes Chapel (H6)
Village at the viaduct. **Landmarks:** Twemlow Viaduct (23 arches over the Dane), St Luke's, the level crossing. **Palette:** brick arch red, meadow green, level-crossing white. **NPCs:** *Signalwoman Dot* (haunted signal box case), *Bakery Bev*. **Activity:** viaduct arch-counting run under the trains. **Hooks:** the signal box "ghost" is a rogue relay; a Dane flood cuts the meadows in rain.

### Jodrell Bank Observatory (I5) — story dungeon
The Lovell Telescope. **Landmarks:** the dish, the Mark II, the arboretum, the control room. **Palette:** dish white, arboretum green, 1950s control-room teal. **NPCs:** *Dr Ravi Lovell-Hart* (astronomer, whistleblower), DARKBYTE agents in ROOT's front. **Layout:** grounds loop the arboretum; interior climbs the tower and gantries; the dish bowl itself is the arena for GLITCHRA. **Hooks:** static tuned to a pulsar spells a message; night sky mini-game.

### Congleton (I8) — Gym 3, Normal/Ground, Bearward Otis (BEAR)
"Beartown", the Dane, the Cloud above. **Landmarks:** the bear statues, the Bridestones on the Cloud road, Astbury Mere, the town hall, Havannah mill. **Palette:** bear-brown, Dane olive, mere blue, market-hall Gothic. **NPCs:** *Bearward Otis* (gym: a bear-pit arena where trainers wrestle Ground-types), *Bridestone Meg*, *Mere-Warden*. **Activity:** bear-baiting replaced by bear-wrestling arm-game (timing bar). **Hooks:** the town's bear went missing (a Bear-type wandering the Cloud); Bridestones night ritual; a Shadow IT tanning salon.

### Little Moreton Hall & Mow Cop (J8/J9)
Wonky Tudor moated house; a fake castle folly on a gritstone edge. **Palette:** black-and-white timber wobbling, moat green; Mow Cop pale grit, sky. **NPCs:** *The Crooked Housekeeper*, *Old Man of Mow* (the pillar rock). **Hooks:** the moat hides a key; Mow Cop is the Gritstone Trail's end (viewpoint + ZEPHYRION rematch).

### Sandbach (G7)
Saxon crosses in a cobbled square. **Landmarks:** the two Saxon crosses, the cobbled Market Square, the Old Hall, Wheelock canal, the ancient bell. **Palette:** grey Saxon stone, cobble ochre, coaching-inn black-and-white. **NPCs:** *Runewife Hild* (rune-rubbing puzzles), *Carter Bram* (haulage). **Activity:** rune-rubbing (trace glyphs). **Hooks:** the crosses hum in the fog; the Old Hall's stolen bell; a Credential Stuffer lorry.

### Crewe (F8) — Gym 4, Fire, Stoker Di (KERNEL)
The railway town. **Landmarks:** Crewe Works, the Heritage Centre, Queen's Park lake and clock, Bentley factory, the station's grand junctions. **Palette:** rail-yard steel, signal red, works-brick sooty, park pavilion. **NPCs:** *Stoker Di* (gym: a roundhouse turntable — rotate the table to reach her), *Signalman Ted*, *Yardmaster Nkechi*. **Activity:** shunting puzzle (sokoban with wagons). **Shops:** Mart, Railcard office. **Hooks:** a locomotive species has escaped into the sheds; the Works sheds dungeon; the Cambrian line ticket to Wales.

### Nantwich (D8) — Gym 5, Water, Brine Nell (TOKEN)
Brine, timber, the Great Fire, cheese. **Landmarks:** the outdoor Brine Pool, St Mary's church, Crown Hotel and Churche's Mansion (Tudor black-and-white), Welsh Row, the Weaver bridge, the Cheese Show ground. **Palette:** brine-blue, oak-black on lime-white, thatch straw. **NPCs:** *Brine Nell* (gym: swimming lanes and lock gates), *Cheesewright Huw*, *Fire Warden Alys* (Great Fire re-enactor). **Activity:** brine-pool lengths (rhythm), cheese-show judging. **Hooks:** the 1644 battle ghost trainers at Acton; the Bunker Key trail; a rival brine-thief.

### Hack Green Secret Nuclear Bunker (D9) — dungeon
Real Cold-War bunker. Blast doors, decontamination corridors, telecoms room; the Credential Stuffers' command centre; a puzzle of switchboards; a mini-boss "Ops Room" fight in 3 phases.

### Middlewich (F5)
Roman salt town on the canals. **Landmarks:** Big Lock, the Trent & Mersey/Shropshire Union junction, the Folk & Boat festival field, St Michael's. **Palette:** brine-white salt sheds, canal boat livery reds/greens, festival bunting. **NPCs:** *Boatwoman Carys* (issues the **Narrowboat Licence** after a canal test), *Folk-fiddler Jonah*. **Activity:** lock-working timing game. **Hooks:** the boat festival's speakers repeat a lure; a Roman salt-boiler ghost.

### Winsford & the Flashes (E6)
Salt town with subsidence lakes and a working mine. **Landmarks:** Winsford Flashes, the Rock Salt Mine headgear, DeepStore archives, the Weaver. **Palette:** subsidence-water grey-green, salt-white, hi-vis orange. **NPCs:** *Mine-Captain Rhona*, *Archivist Ivo* (DeepStore; keeps a vault of old case files). **Activity:** flash fishing (unique species). **Hooks:** DeepStore holds a sealed ORACLE contract; a sinkhole opens a shortcut to the salt mine.

### Northwich (F4) — Gym 6, Rock, Foreman Jack (DAEMON)
Salt town that sank; timber-framed rebuilds. **Landmarks:** the swing bridges over the Weaver, the Lion Salt Works, Northwich's black-and-white "liftable" buildings, Neumann's Flash. **Palette:** salt-white, timber black, Weaver brown, brine-pan rust. **NPCs:** *Foreman Jack* (gym: a salt-crust floor that cracks; find the safe path), *Salt Pan Sal*, *Bridge Keeper*. **Activity:** salt-panning (skim). **Hooks:** buildings tilt when TERRATAUR stirs; Salt Mine Pass quest; swing-bridge sabotage.

### Northwich Salt Mine (G4) — dungeon
Pillar-and-stall galleries as a grid maze, brine lake with a boat, DARKBYTE sub-hideout, TERRATAUR's lair. Rock/Ground/Steel archetypes; salt golems.

### Anderton Boat Lift & Marbury (F3)
The "cathedral of the canals" lifting boats 50 ft between Weaver and Trent & Mersey. **Palette:** iron black and Victorian green, Weaver mist, Marbury beech. **NPCs:** *Lift Engineer Beth*, *Marbury Warden*. **Activity:** the Lift itself as a two-level puzzle. **Hooks:** Budworth Mere monster rumours; the Marbury Lady ghost.

### Great Budworth (G3)
Postcard estate village. **Palette:** brick and mullioned windows, cobble. **NPCs:** *Vicar Ffoulkes* (deepfake vicar case), *Ringing Master*. **Hooks:** the deepfake vicar; a bell-ringing rhythm game.

### Lymm (G1)
Cross, dam, canal. **Landmarks:** Lymm Cross, Lymm Dam, the Bridgewater canal through the village, Thelwall viaduct visible. **Palette:** sandstone cross, dam-water dark, canal cottages. **NPCs:** *Dam-Warden Ollie*, *Canal Cook*. **Activity:** dam fishing; boat rally. **Hooks:** the dam's sluice hides a letter; a Runcorn-fog spillover.

### Warrington (F1) — Gym 8, Cyber, Netrunner Mo (ADMIN)
Big, brash, wired. **Landmarks:** the Golden Gates and Town Hall, Bank Quay transporter bridge, Walton Hall gardens, the Mersey, Warrington market. **Palette:** gold gates, town-hall stone, transporter-bridge steel, neon market. **NPCs:** *Netrunner Mo* (gym: a NOC with firewalls you must route packets around — the Cyber gym is deliberately here), *Market Marge*, *Bridge Rigger*. **Activity:** packet-routing puzzle. **Hooks:** the transporter bridge as fast-travel bridge to nowhere; the market's lying arcade kiosk; a Shadow IT nightclub.

### Daresbury (E2)
Lewis Carroll's birthplace; particle-physics lab. **Landmarks:** All Saints church with the Alice windows, the Sci-Tech Daresbury tower, the Bridgewater canal. **Palette:** stained-glass jewel tones, lab white, canal. **NPCs:** *Dr Hatter Quill* (physicist), *Grinning verger*. **Hooks:** GRINMALKIN's home; a mirror-world puzzle in the church; the lab's beamline as a Cyber-type nursery.

### Runcorn (D2) — Gym 7, Poison, Chemist Ria (PROXY)
Chemical town with two bridges. **Landmarks:** Silver Jubilee Bridge, the Mersey Gateway, Halton Castle on its hill, Norton Priory, Widnes across the water. **Palette:** bridge green, chemical-works chrome, castle brown, proxy fog. **NPCs:** *Chemist Ria* (gym: reagent lab where fumes are the walls), *Castle Constable*, *Priory Gardener*. **Activity:** reagent mixing. **Hooks:** the fog is the Credential Stuffers' residential proxy; Halton Castle spyglass; Norton Priory's stone giant.

### Frodsham (D3)
Market town under a wooded hill. **Landmarks:** Frodsham Hill and war memorial viewpoint, Overton, the Sandstone Trail's first stile, the Marsh with wind turbines, Helsby Hill opposite. **Palette:** sandstone red, hill green, marsh grey, turbine white. **NPCs:** *Trail-Warden Gethin* (Sandstone Trail passport), *Marsh Birder*. **Activity:** hill fell-run; marsh bird-watch. **Hooks:** the turbines turn against the wind; a beacon-lighting chain.

### Delamere Forest (D4) — forest dungeon
Old royal forest. **Landmarks:** Blakemere Moss (drowned wood), the Old Pale summit and its "seven counties" plaque, Eddisbury hillfort, the Whitegate Way. **Palette:** pine, moss, black bog water. **NPCs:** *Ranger Ivy*, *Trail Racers*. **Hooks:** ZEPHYRION sightings; a night-only glade.

### Tarporley (C6)
Georgian high street, hunt town. **Palette:** brick, coaching inns, hunting green. **NPCs:** *Hedge-layer Cadoc* (teaches **Billhook**), *Hunt Master*. **Hooks:** hedge-laying contest; stolen horses.

### Beeston Castle & Peckforton (C7)
Ruined castle on a crag; Victorian castle opposite. **Landmarks:** Beeston keep and well (Richard II's treasure legend), Peckforton Castle, the Bunbury locks. **Palette:** crag red, keep grey, mist. **NPCs:** *Custodian Roz*, *Peckforton Falconer*. **Hooks:** ZEPHYRION's ruin; the well treasure (Strength + Lamp).

### Chester (B5) — League: THE FIREWALL
Roman walls, Tudor Rows, red sandstone. **Landmarks:** the full wall circuit, Eastgate Clock, the Rows, the Cathedral, the Roman amphitheatre, the Roodee racecourse, the Groves and Dee weir, Grosvenor Bridge, the Cross. **Palette:** red sandstone, black-and-white Rows, cathedral gold, Dee green. **NPCs:** the WHITE HATS (Sue/Raj/Kim/Doc) in the Cathedral chapter house, *VEX* at the amphitheatre arena, *Town Crier*, *Rows Merchant*. **Activity:** wall-circuit timed lap; racecourse betting mini-game. **Shops:** everything. **Hooks:** Roman ghost legion; the clock's chime; VEX's final rival arc.

### Chester Zoo (B3)
**Palette:** enclosure green, keeper khaki. **NPCs:** *Keeper Ama* (escaped penguin case). **Activity:** animal-care rounds; a "dex" of zoo species that grants trade partners.

### Ellesmere Port (B2)
Canal port and refinery. **Landmarks:** National Waterways Museum boats, the canal basin, Stanlow's flare stacks, Cheshire Oaks. **Palette:** basin brick, boat livery, refinery orange glow. **NPCs:** *Museum Bosun*, *Outlet Hustler*. **Hooks:** the flare signals in code; a historic boat rally.

### Ince Marshes / THE STACK (C2) — end-game dungeon
A hyperscale datacentre on the marsh. **Palette:** grey aluminium, blinking blue, cooling steam. Loops of server halls, a cooling lake, the ORACLE core. Root Access unlocks each hall.

### Parkgate & Burton Marsh (A3)
Dee-estuary former port; the sea went out. **Palette:** sea-wall sandstone, marsh gold, ice-cream pastel. **NPCs:** *Ice-cream Ceinwen* (Welsh coast lore), *Marsh Egret Watcher*. **Hooks:** the tide that never comes back; a Wales-facing letter.

### Y Berllan, Ceredigion (off-map)
The family orchard. **Landmarks:** the elm perry press, the orchard rows, Coed y Berllan wood, the farmhouse. **Palette:** apple-blossom pink, elm brown, Welsh slate, sea haze. **NPCs:** *Nain* (grandmother, Welsh dialogue), *Press-hand Dai*, *the letters from Georgia arrive here*. **Activity:** brewing perry/stout (multi-stage fermentation with real-time waits; held-item drinks). **Hooks:** the orchard's guardian; a Welsh-only riddle for a rare species.

---

## 3. Routes and dungeons

Encounter archetypes by biome (species detailing left to the creature designer): **Moor/Grit** — grouse-birds, hares, mist-sheep; night: wisps. **Silk/Mill** — moths, rats, loom-sprites. **Bog** — wisps, newts, preserved husks. **Sandstone/Cave** — copper beetles, bats, knight-ghosts. **Estate park** — deer, boar, herons, carp. **Rail** — steam-locos, sparks, sleepers. **Salt/Brine** — golems, brine sprites, salt-crabs. **Canal** — pike, eels, moorhens, boat-cats. **Marsh** — egrets, eels, wind-wisps. **Chemical/Fog** — Poison clouds, proxy-puppets. **Digital/Infra** — Trojanox, Phishfin, Botnetle, Wormhack near masts, labs and datacentres. **Roman/Saxon** — legionary ghosts, rune-stones. Rain boosts Water/Electric; fog spawns Poison/Cyber; night doubles Ghost/Dark; dawn = birds.

- **R1 Macclesfield Canal:** towpath loop over Sutton bridges with a hidden lock-keeper's garden. Silk moths, ducks. Trainers: canal anglers. Landmark: Hovis mill. Secret: rope-locked island (Narrowboat).
- **R2 Middlewood Way:** old railway cutting with tunnel and viaduct top; two tiers. Bike tunnel shortcut. Trainers: cyclists (chase you). Secret: Nancy's paint cache in the quarry.
- **R3 Gritstone Trail North:** climbs to Lyme's Bowstones; wind meter; deer crossings. Trainers: hikers. Secret: cave behind The Cage.
- **R4 Bollin Valley:** riverside meadows with fords that flood in rain. Herons, moths. Secret: mill-race pocket.
- **R5 Mottram lanes:** hedgerow lattice — a maze of lanes; Billhook opens diagonals. Trainers: gardeners.
- **R6 The Carrs:** park with paths on both banks; stepping stones. Fishing.
- **Lindow Moss:** boardwalk maze; three sinking tiles change with rain; Preserved One boss.
- **R7 Sandhills:** birchwood ridge with the Beacon spur; sunset-only species.
- **R8 Chelford Heath & Radnor Mere:** heath rings the mere; a mere-path needs Billhook; night: mere-mist Ghost.
- **R9 Ollerton/Goostrey:** farm lanes with a level crossing gate (train timing).
- **R10 Twemlow meadows:** under the 23 arches; each arch a mini-pocket; a flood variant.
- **R11 Brereton Heath & Astbury Mere:** two lakes, one path each side; hidden birdhide.
- **Bosley Cloud:** grit edge switchbacks; Grips ladder; summit viewpoint; ZEPHYRION wind.
- **R12 Biddulph Valley Way:** railway path with tramway remains, into the Hall's moat garden.
- **R13 Wheelock canal:** lock flight; boats as moving platforms.
- **R14 Elworth cut:** rail-side embankment; sparks at night.
- **Crewe Works:** sheds grid, turntable, roundhouse; Fire/Steel; shunting puzzles.
- **R15 Willaston/Wybunbury:** the leaning tower of Wybunbury as a landmark; church-yard night pocket.
- **Hack Green:** blast doors, telecoms floor, ops room; three-phase boss; puzzles with switchboards.
- **R16 Weaver Valley:** river meanders with two crossings and an aqueduct; Water heavy.
- **R17 Booth Lane:** canal + old salt works ruins.
- **R18 Vale Royal Locks:** river cliffs; boat half; hidden abbey site.
- **R19 Rudheath:** heathland with subsidence flashes appearing on revisits.
- **Salt Mine:** grid galleries; boat lake; hideout; TERRATAUR.
- **Anderton/Marbury:** two-level map linked only by the lift; Marbury beech avenues; ghost.
- **R20 Arley:** estate lanes and a Bollin footbridge; owl night.
- **R21 Bridgewater towpath:** Thelwall viaduct roar; boat trainers.
- **R22 Daresbury lane:** fog bank; Cyber spawns near the lab.
- **Runcorn bridges/Halton Castle:** climb the hill, cross the bridge walkway; fog clears at top.
- **R23 Frodsham Marsh:** turbines, ditches, tide pockets; Waders.
- **Frodsham Hill:** switchbacks to the memorial; view unlocks trail passport.
- **R24 Helsby:** crag walk, cave nook.
- **Delamere Forest:** hub with 4 exits; Blakemere boardwalk; Old Pale summit; night glade.
- **R25 Whitegate Way:** flat rail path with bike sprint; old station.
- **R26 Kelsall/Sandstone Trail:** ridge with hillfort loop.
- **R27 Bunbury:** watermill and locks.
- **Beeston/Peckforton:** crag ascent, keep, well; falconer.
- **R28 Tarvin/Christleton:** flat lanes into Chester's canal cutting.
- **Chester walls:** raised loop above the city, towers as pockets, amphitheatre arena.
- **R29 Shropshire Union north:** canal to Zoo and Port.
- **R30 Wirral Way/Burton Marsh:** marsh with tide-timed path; egrets.
- **THE STACK:** server halls, cooling lake, ORACLE core; final loops.
- **Coed y Berllan:** orchard rows to a small Welsh wood; hidden guardian.

---

## 4. Traversal abilities

| Ability | Cheshire flavour | Source | Opens |
|---|---|---|---|
| **Middlewood Bike** | cycle hire, Bollington | Spokes | speed on cycleways/towpaths, tunnel shortcut |
| **MEADOW Squeeze** | small black cat slips through railings, cat-flaps, culverts | Ch.1 | side pockets everywhere |
| **BIGBOY Shove** | the big cat pushes boulders/wheelie bins | Badge 3 | rock puzzles, Beeston well |
| **Billhook** | hedge-laying | Tarporley (early via Prestbury lesson) | hedge gaps, mere paths |
| **Davy Lamp** | copper-mine lamp | Alderley | dark levels, night glades |
| **Narrowboat Licence** | canal boating | Middlewich, Badge 5 | all canals, Weaver, lift |
| **Anderton Lift Pass** | vertical boat lift | Anderton | Weaver↔canal levels |
| **Waders** | marsh boots | Frodsham | Lindow, Frodsham Marsh, Burton, Ince |
| **Gritstone Grips** | climbing | Old Bowstone, Badge 6 | Tegg's Nose, Cloud, Beeston keep, Mow Cop |
| **Proxy Goggles** | see through Stuffers' fog | Runcorn, Badge 7 | fog routes |
| **Railcard / Cambrian Ticket** | stations; Wales | Crewe | fast travel; Y Berllan |
| **Root Access** | story keycard | Jodrell | THE STACK |
| Keys: Salt Mine Pass, Bunker Key, Zoo Membership, Sandstone/Gritstone passports | | | |

---

## 5. 25 collectibles and secrets

1. Nancy's Paint Tin (quarry cache). 2. Turing's Apple (Wilmslow attic). 3. Lindow torc (bog). 4. Wizard's Well coin (say the Welsh line). 5. Copper Knight helm (Cave of the Knights). 6. Gaskell letter fragment 1/5 (tower). 7. Penny-farthing bell. 8. Tatton bonsai. 9. Signal-box lamp. 10. Twemlow arch #13 plaque. 11. Bear-token (Congleton bear on the Cloud). 12. Bridestones rune. 13. Sandbach cross rubbing. 14. Crewe Works nameplate. 15. Wybunbury leaning brick. 16. Brine pool key. 17. Bunker switchboard tag. 18. DeepStore file "ORACLE-0". 19. Salt-golem heart. 20. Lion Salt Works pan. 21. Marbury Lady's locket. 22. Alice mirror shard (Daresbury). 23. Halton spyglass. 24. Old Pale seven-counties medal. 25. Beeston well "treasure" (a cat collar tag).
Plus: **eleven cats to find** across the map (each a Grinmalkin cousin, gives a MEADOW/BIGBOY skin), **twelve viewpoints** (all summits and towers), and the **five Georgia letters** (Knutsford, Lymm dam, Parkgate, Y Berllan, Chester walls).

---

## 6. Fast travel

**Rail (Railcard):** Macclesfield · Poynton · Wilmslow · Knutsford · Holmes Chapel · Congleton · Crewe (hub) · Nantwich · Winsford · Northwich · Frodsham · Runcorn · Warrington · Chester · Ellesmere Port; each unlocked by visiting on foot; Cambrian Line from Crewe to Y Berllan after Ch.4. **Canal boats (Narrowboat):** moorings at Macclesfield, Bollington, Congleton, Middlewich, Anderton, Lymm, Warrington, Daresbury, Runcorn, Ellesmere Port, Chester — moving through the Cheshire Ring as a slow, scenic alternative with random boat trainers. **Anderton Lift** as a vertical portal. **Beacons** (Alderley, Frodsham, Old Pale, White Nancy, The Cage): once lit, warp between them for the walker's shortcut in the post-game.