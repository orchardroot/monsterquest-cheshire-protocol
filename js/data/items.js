// =============================================================
// MonsterQuest v2 — js/data/items.js  (data workstream)
// MQ.Data.items — every item id in ROSTER §4.
//
// Shape (ENGINE §4 + ROSTER §4 kinds):
//  { name, price, kind, amount, cures, catchBonus, gearEffect, desc,
//    usableInBattle, usableInField, sellable, trinket, teaches, chapter,
//    unlocks, ingredient, brew, rodTier, pocket, sortKey }
// kind ∈ heal cure capsule gear held_consumable consumable key ingredient brew evo tm rod
// `pocket` is the bag tab the UI should file it under.
// Prices are in credits; 0 means "not sold". `sellable` defaults to price>0.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  const POCKET = {
    heal: "medicine", cure: "medicine", capsule: "capsules", gear: "gear", held_consumable: "gear",
    consumable: "medicine", key: "key", ingredient: "larder", brew: "larder", evo: "gear", tm: "cards", rod: "key"
  };

  let order = 0;
  function I(id, name, kind, price, props, desc) {
    const it = {
      name: name, kind: kind, price: price || 0, desc: desc,
      pocket: POCKET[kind] || "misc",
      usableInBattle: false, usableInField: false,
      sellable: price > 0, sortKey: order++
    };
    if (props) { const ks = Object.keys(props); for (let i = 0; i < ks.length; i++) it[ks[i]] = props[ks[i]]; }
    return D.define("items", id, it);
  }

  // =================================================================
  // 4.1 Healing & cures
  // =================================================================
  I("salve", "Salve", "heal", 200, { amount: 20, usableInBattle: true, usableInField: true }, "A field dressing and a strong word. Restores 20 HP.");
  I("tonic", "Tonic", "heal", 600, { amount: 60, usableInBattle: true, usableInField: true }, "Bitter, brown and effective. Restores 60 HP.");
  I("elixir", "Elixir", "heal", 1500, { amount: 120, usableInBattle: true, usableInField: true }, "The good stuff, kept behind the counter. Restores 120 HP.");
  I("full_restore", "Full Restore", "heal", 3000, { amount: "full", cures: ["psn", "tox", "par", "brn", "slp", "frz", "cnf"], usableInBattle: true, usableInField: true }, "Full health and every status cleared. Costs what you'd expect.");
  I("revive_salts", "Revive Salts", "heal", 1200, { revive: 0.5, friendship: -10, usableInBattle: true, usableInField: true }, "Brings a fainted monster back at half health. Tastes of the mine; they hold it against you.");
  I("antidote", "Antidote", "cure", 100, { cures: ["psn", "tox"], usableInBattle: true, usableInField: true }, "Cures poison, including the escalating sort.");
  I("burn_balm", "Burn Balm", "cure", 150, { cures: ["brn"], usableInBattle: true, usableInField: true }, "Cool grease in a tin. Cures burns.");
  I("nerve_tonic", "Nerve Tonic", "cure", 150, { cures: ["par"], usableInBattle: true, usableInField: true }, "Cures paralysis. The fizzing is normal.");
  I("smelling_salts", "Smelling Salts", "cure", 150, { cures: ["slp"], usableInBattle: true, usableInField: true }, "Wakes anything up, rudely.");
  I("thaw_flask", "Thaw Flask", "cure", 150, { cures: ["frz"], usableInBattle: true, usableInField: true }, "A flask kept far too hot. Cures freezing.");
  I("calm_drops", "Calm Drops", "cure", 150, { cures: ["cnf"], usableInBattle: true, usableInField: true }, "Two drops and a sit down. Cures confusion.");
  I("panacea", "Panacea", "cure", 500, { cures: ["psn", "tox", "par", "brn", "slp", "frz", "cnf"], usableInBattle: true, usableInField: true }, "Cures any one status. Nobody will tell you what's in it.");

  // =================================================================
  // 4.2 Capsules
  // =================================================================
  function C(id, name, price, bonus, extra, desc) {
    const p = { catchBonus: bonus, usableInBattle: true };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) p[ks[i]] = extra[ks[i]]; }
    return I(id, name, "capsule", price, p, desc);
  }
  C("capsule_basic", "Capsule", 200, 1, null, "Standard issue. Works often enough to be worth carrying twenty.");
  C("capsule_mesh", "Mesh Capsule", 600, 1.5, null, "A finer mesh holds a struggling monster half again as well.");
  C("capsule_kernel", "Kernel Capsule", 1200, 2, null, "Alder Labs' good one. Twice the hold of a standard capsule.");
  C("capsule_root", "Root Capsule", 0, 255, { guaranteed: true, sellable: false }, "Never fails. There are three in the whole county; spend them carefully.");
  C("capsule_net", "Net Capsule", 800, 1, { conditional: { types: ["cyber", "bug"], bonus: 3 } }, "Triple hold on Cyber and Bug. Mesh woven from lifted CAT5.");
  C("capsule_night", "Night Capsule", 800, 1, { conditional: { phase: ["night"], bonus: 3 } }, "Triple hold after dark. Useless at half two in the afternoon.");
  C("capsule_brine", "Brine Capsule", 800, 1, { conditional: { types: ["water"], weather: ["rain"], bonus: 3 } }, "Triple hold on Water types, or on anything at all in the rain.");
  C("capsule_quick", "Quick Capsule", 800, 1, { conditional: { turn: 1, bonus: 4 } }, "Four times the hold if thrown on the first turn. Nothing after that.");
  C("capsule_friend", "Friend Capsule", 1000, 1, { setFriendship: 150 }, "No better at catching, but whatever comes out of it already likes you.");
  C("capsule_heavy", "Heavy Capsule", 800, 1, { scaleByBaseHp: true }, "Bonus scales with the target's bulk. For the ones that don't fit.");

  // =================================================================
  // 4.3 Gear (permanent held) — SYSTEMS-SPEC §3 1-20 + side-content gear
  // =================================================================
  function GEAR(id, name, price, effect, desc, extra) {
    const p = { gearEffect: effect };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) p[ks[i]] = extra[ks[i]]; }
    return I(id, name, "gear", price, p, desc);
  }
  GEAR("silk_scarf", "Silk Scarf", 1000, { kind: "stab", mult: 1.1 }, "Macclesfield silk. Same-type moves hit 10% harder.");
  GEAR("brine_charm", "Brine Charm", 1200, { kind: "typeBoost", type: "water", mult: 1.2 }, "A pinch of Nantwich spring in a glass bead. Water moves ×1.2.");
  GEAR("ember_coal", "Ember Coal", 1200, { kind: "typeBoost", type: "fire", mult: 1.2 }, "A coal that never quite goes out. Fire moves ×1.2.");
  GEAR("copper_coil", "Copper Coil", 1200, { kind: "typeBoost", type: "electric", mult: 1.2 }, "Alderley copper, wound tight. Electric moves ×1.2.");
  GEAR("cipher_lens", "Cipher Lens", 1200, { kind: "typeBoost", type: "psychic", mult: 1.2 }, "Ground for reading other people's letters. Psychic moves ×1.2.");
  GEAR("patch_cable", "Patch Cable", 1500, { kind: "typeBoost", type: "cyber", mult: 1.2 }, "Yellow, unlabelled, load-bearing. Cyber moves ×1.2.");
  GEAR("walkers_boots", "Walker's Boots", 2500, { kind: "stat", stat: "spe", mult: 1.5, lockMove: true }, "Speed ×1.5, but the holder commits to the first move it picks until it switches.");
  GEAR("heavy_anvil", "Heavy Anvil", 2000, { kind: "stat", stat: "atk", mult: 1.3, also: { stat: "spe", mult: 0.5 } }, "Attack ×1.3, Speed halved. An honest trade.");
  GEAR("kevlar_waistcoat", "Kevlar Waistcoat", 2500, { kind: "damageTaken", phys: 0.9, spec: 0.9, noOverdrive: true }, "Takes 10% less of everything. No Overdrive — it's a waistcoat, not a mood.");
  GEAR("rail_pass", "Rail Pass", 1000, { kind: "switchPriority" }, "The holder always gets off the train first.");
  GEAR("lucky_coin", "Lucky Coin", 1500, { kind: "crit", stages: 1 }, "Worn smooth on one side. Crit stage +1.");
  GEAR("focus_band", "Focus Band (Bollington)", 2000, { kind: "survive", chance: 10 }, "A sweatband from the hill race. 10% chance to hang on at 1 HP.");
  GEAR("toxic_sachet", "Toxic Sachet", 1000, { kind: "contactBack", status: "psn", chance: 30 }, "Do not open. Contact against the holder poisons 30% of the time.");
  GEAR("rusty_nail", "Rusty Nail", 1000, { kind: "contactBack", damageFrac: 0.125 }, "From the mill floor. Anything that touches the holder loses an eighth of its health.");
  GEAR("umbrella", "Umbrella (Cheshire issue)", 800, { kind: "ignoreWeather", weather: ["rain", "fog"] }, "Rain and Fog stop applying to the holder. Standard county equipment.");
  GEAR("weathervane", "Weathervane", 1500, { kind: "weatherDuration", turns: 8 }, "Weather the holder sets lasts eight turns instead of four or five.");
  GEAR("ledger", "Ledger", 1200, { kind: "exp", mult: 1.5 }, "Everything written down. The holder earns 50% more experience.");
  GEAR("cat_bell", "Cat Bell", 800, { kind: "friendship", mult: 2, evaVsWild: 1 }, "Friendship gains doubled, and wild monsters can never quite pin the holder down.");
  GEAR("warm_blanket", "Warm Blanket", 1000, { kind: "cureEndTurn", cures: ["frz", "slp"], oncePerBattle: true }, "Cures freezing or sleep at the end of a turn, once per battle, and is not consumed.");
  GEAR("torch", "Torch", 800, { kind: "ignoreFogAccuracy" }, "The holder's accuracy stops caring about Fog.");
  GEAR("silk_wrap", "Silk Wrap", 0, { kind: "statusDamage", status: "brn", mult: 0.5 }, "Weaver Bronwen's own binding. Burn damage halved.", { chapter: 1 });
  GEAR("firebox_charm", "Firebox Charm", 0, { kind: "typeBoost", type: "fire", mult: 1.1 }, "Di's, once. Fire moves ×1.1 and a faint smell of the shed.", { chapter: "PG" });
  GEAR("hide_plate", "Hide Plate", 0, { kind: "damageTakenType", type: "rock", mult: 0.75 }, "Boiled leather over a bed-plate. Rock moves against the holder ×0.75.", { chapter: 7 });
  GEAR("beacon_ember", "Beacon Ember", 0, { kind: "typeBoost", type: "fire", mult: 1.2, atNight: true }, "Carried down from Frodsham beacon. Fire ×1.2 at night — and a Damson Fire ingredient.", { chapter: 9, ingredient: true });
  const ANCHORS = [
    ["anchor_packet", "Packet", "electric", "static", "Ada"],
    ["anchor_cipher", "Cipher", "psychic", "fog", "Gaskell"],
    ["anchor_bear", "Bear", "normal", null, "Otis"],
    ["anchor_kernel", "Kernel", "fire", "sun", "Di"],
    ["anchor_token", "Token", "water", "rain", "Nell"],
    ["anchor_daemon", "Daemon", "rock", "salt", "Jack"],
    ["anchor_proxy", "Proxy", "poison", "fog", "Ria"],
    ["anchor_admin", "Admin", "cyber", "wind", "Mo"]
  ];
  for (let i = 0; i < ANCHORS.length; i++) {
    const a = ANCHORS[i];
    GEAR(a[0], "Anchor: " + a[1], 0, { kind: "anchor", type: a[2], mult: 1.2, immuneTo: a[3] },
      "Handed over at the top of " + a[4] + "'s rematch ladder. " + a[1] + "-badge type ×1.2, and the house rule stops applying to the holder.",
      { chapter: "PG" });
  }

  // =================================================================
  // 4.4 Held consumables
  // =================================================================
  function HC(id, name, price, effect, desc, extra) {
    const p = { gearEffect: effect, consumedOnUse: true };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) p[ks[i]] = extra[ks[i]]; }
    return I(id, name, "held_consumable", price, p, desc);
  }
  HC("damson", "Damson", 150, { kind: "healAt", hpAtMost: 0.5, frac: 0.25 }, "Prestbury damson. Eaten when things get thin — restores a quarter of health.", { ingredient: true, sources: ["prestbury"] });
  HC("perry_flask", "Perry Flask", 300, { kind: "cureOnStatus" }, "A nip of Y Berllan perry cures whatever has just been inflicted.");
  HC("elm_sap", "Elm Sap", 300, { kind: "boostAt", hpAtMost: 0.25, stat: "highestAttack", delta: 1 }, "Bitter sap from the press. Below a quarter health, the best attacking stat rises.");
  HC("salt_lick", "Salt Lick", 250, { kind: "restorePp", n: 10, whenEmpty: true }, "Restores 10 PP to the first move that runs dry.");
  HC("toffee", "Toffee (Everton)", 200, { kind: "cureAndHeal", cures: ["cnf"], frac: 0.125 }, "Cures confusion and mends an eighth. Welded to the wrapper, as tradition demands.");

  // =================================================================
  // 4.5 Battle consumables
  // =================================================================
  I("boombox", "CFS-B11 Boombox", "consumable", 500, { usableInBattle: true, flee: true }, "Plays something unbearable. Any wild monster leaves immediately.");
  I("rain_jar", "Rain Jar", "consumable", 400, { usableInBattle: true, setsWeather: "rain", turns: 5, oncePerBattle: true }, "A jar of Cheshire weather. Sets Rain for five turns.");
  I("sun_lamp", "Sun Lamp", "consumable", 400, { usableInBattle: true, setsWeather: "sun", turns: 5, oncePerBattle: true }, "Sets Sun for five turns. Locals find it unsettling.");
  I("fog_machine", "Fog Machine", "consumable", 400, { usableInBattle: true, setsWeather: "fog", turns: 5, oncePerBattle: true }, "Sets Fog for five turns. Confiscated from a wedding disco.");
  I("wind_whistle", "Wind Whistle", "consumable", 400, { usableInBattle: true, setsWeather: "wind", turns: 5, oncePerBattle: true }, "One long note off the ridge. Sets Wind for five turns.");
  const TONICS = [["tonic_atk", "ATK", "atk"], ["tonic_def", "DEF", "def"], ["tonic_spa", "SPA", "spa"], ["tonic_spd", "SPD", "spd"], ["tonic_spe", "SPE", "spe"], ["tonic_acc", "ACC", "acc"]];
  for (let i = 0; i < TONICS.length; i++) {
    I(TONICS[i][0], "Brine Tonic: " + TONICS[i][1], "consumable", 350, { usableInBattle: true, stage: { stat: TONICS[i][2], delta: 1 } },
      "Nantwich brine, bottled and labelled. Raises " + TONICS[i][1] + " by one stage.");
  }
  I("x_ray_card", "X-Ray Card", "consumable", 300, { usableInBattle: true, reveal: ["moves", "ability", "gear"] }, "Holds it up to the light. One look at the foe's moves and ability.");
  I("music_box", "Music Box", "consumable", 0, { usableInBattle: true, preventFlee: 3 }, "Choirmaster Osian's. Wild monsters stay to listen for three turns.", { chapter: 7 });

  // =================================================================
  // 4.6 Evolution items
  // =================================================================
  I("silk_cocoon", "Silk Cocoon", "evo", 0, { usableInField: true, evo: true }, "A cocoon spun with nothing inside it yet. Something silk-blooded will want it.");
  I("salt_crystal", "Salt Crystal", "evo", 900, { usableInField: true, evo: true, ingredient: true, sources: ["northwich"] }, "A fist of clear halite from the galleries. Also the making of a decent mead.");
  I("copper_wire", "Copper Wire", "evo", 0, { usableInField: true, evo: true }, "Alderley copper drawn fine. Something electric will follow it.");
  I("cipher_chip", "Cipher Chip", "evo", 0, { usableInField: true, evo: true }, "Salvage from a dead HSM. Cyber lines find it very persuasive.");
  I("elm_sap_vial", "Elm Sap Vial", "evo", 0, { usableInField: true, evo: true }, "Sap from the orchard press, sealed. The trees know what it's for.");
  I("billhook_charm", "Billhook Charm", "evo", 0, { usableInField: true, evo: true }, "Cadoc's spare blade on a thong. Bramble things grow up around it.");

  // =================================================================
  // 4.7 Key items
  // =================================================================
  function K(id, name, chapter, desc, extra) {
    const p = { chapter: chapter, sellable: false };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) p[ks[i]] = extra[ks[i]]; }
    return I(id, name, "key", 0, p, desc);
  }
  K("middlewood_bike", "Middlewood Bike", 1, "Second-hand, one gear that works. Opens the cycleway sprint lanes.", { unlocks: "bike", usableInField: true });
  K("alder_contract", "Alder Labs Contract", 1, "Four pages, one signature, and a clause you should have read.");
  K("casebook", "Casebook", 1, "A ring binder that fills itself in. Opens the Casebook tab.", { usableInField: true });
  K("camera", "Camera", 1, "A film camera with a dented body. Sightings count; photographs count more.", { usableInField: true });
  K("davy_lamp", "Davy Lamp", 2, "Gwil's own, still trimmed. Lights the dark levels and the night glades.", { unlocks: "lamp", trinket: true, usableInField: true });
  K("turings_apple", "Turing's Apple", 2, "From an attic in Wilmslow. Nobody has bitten it. Collectible 2 of 25.");
  K("billhook", "Billhook", 2, "Cheshire pattern, honed on one side. Cuts a gap through any laid hedge.", { unlocks: "billhook", usableInField: true });
  K("signal_meter", "Signal Meter", 4, "A Jodrell handheld with a borrowed aerial. Shows how loud the sky is here.", { usableInField: true });
  K("face_fragment_1", "Face Fragment", 3, "A torn quarter of a photograph. Somebody's cheekbone and half a doorway.");
  K("face_fragment_2", "Face Fragment", 4, "The other quarter. The face still doesn't add up.");
  K("railcard", "Railcard", 5, "Stamped, laminated, faintly illegal. Stations become a network.", { unlocks: "railcard", usableInField: true });
  K("cambrian_ticket", "Cambrian Line Ticket", 5, "A single, one way, to a platform that isn't on the board.");
  K("conductors_whistle", "Conductor's Whistle", 5, "Blow it on a station tile and something will arrive. Eventually.", { usableInField: true });
  K("pippin_drive", "PIPPIN Drive", 6, "A drive labelled in biro. It is warm, which drives are not supposed to be.");
  K("narrowboat_licence", "Narrowboat Licence", 7, "Carys signed it herself. Canals and the Weaver open up.", { unlocks: "boat", usableInField: true });
  K("lift_pass", "Anderton Lift Pass", 7, "Beth's spare. Rides the cathedral of iron between two water levels.", { unlocks: "lift", usableInField: true });
  K("salt_mine_pass", "Salt Mine Pass", 7, "Countersigned by Mine-Captain Rhona, who wants it back.");
  K("salt_lantern", "Salt Lantern", 7, "Burns steady in the galleries. Toggle it to keep the deep things asleep.", { usableInField: true, toggle: true });
  K("waders", "Waders", 9, "Chest-high, patched at the left knee. The marsh stops being an edge.", { unlocks: "waders", usableInField: true });
  K("gritstone_grips", "Gritstone Grips", 4, "Old Bowstone's boots, resoled. Crags and quarry tops become routes.", { unlocks: "climb", usableInField: true });
  K("proxy_goggles", "Proxy Goggles", 9, "Ria's, smelling of the fume cupboard. See through a residential fog bank.", { unlocks: "goggles", usableInField: true });
  K("bunker_key", "Bunker Key", 6, "A key the size of a spanner, for a door the size of a lorry.");
  K("stack_schematics", "THE STACK Schematics", 9, "Eight doors, one of them drawn twice.");
  K("stack_lanyard", "STACK Lanyard", 9, "Printed with a name that is nearly yours.");
  K("zoo_membership", "Zoo Membership", 12, "Annual, transferable, and expiring in a fortnight.");
  K("sandstone_passport", "Sandstone Trail Passport", 8, "Stamp it at every waymark and someone will notice.", { usableInField: true });
  K("gritstone_passport", "Gritstone Trail Passport", 4, "Same idea, worse weather.", { usableInField: true });
  K("arcade_pass", "Arcade Pass", 10, "Twenty credits of tokens and a smell of hot dust.");
  for (let i = 1; i <= 4; i++) K("nino_letter_" + i, "Letter from Nino", i <= 1 ? 2 : (i === 2 ? 5 : 9), "Georgia's handwriting, biro, both sides. Letter " + i + " of five.");
  K("nino_letter_final", "Letter from Nino", "PG", "The last one. It is shorter than the others and it is the one you keep.");
  K("ghost_lens", "Ghost Lens", 4, "A cracked filter that photographs what isn't standing there.", { trinket: true, usableInField: true });
  K("field_notebook", "Field Notebook", 4, "Ruled, water-stained, and quietly encyclopaedic about hedges.", { trinket: true, usableInField: true });
  K("rain_cloak", "Rain Cloak", 3, "Waxed and unfashionable. Rain stops slowing you down.", { trinket: true, usableInField: true });
  K("sprint_soles", "Sprint Soles", 3, "Track spikes filed flat. Eight per cent faster, all day.", { trinket: true, usableInField: true });
  K("wool_cap", "Wool Cap", 6, "Farmer Bethan's, knitted badly on purpose. The party stops feeling the wind.", { trinket: true, usableInField: true });
  K("photo_album", "Sighting Album", 1, "Sticky pages, one per sighting. Fills up faster than you'd think.", { usableInField: true });

  const COLLECTIBLES = [
    "Nancy's Paint Tin", "Turing's Apple", "Lindow Torc", "Wizard's Well Coin", "Copper Knight Helm",
    "Gaskell Letter Fragment", "Penny-farthing Bell", "Tatton Bonsai", "Signal-box Lamp", "Twemlow Arch Plaque",
    "Bear-token", "Bridestones Rune", "Sandbach Cross Rubbing", "Crewe Works Nameplate", "Wybunbury Leaning Brick",
    "Brine Pool Key", "Bunker Switchboard Tag", "DeepStore File ORACLE-0", "Salt-golem Heart", "Lion Salt Works Pan",
    "Marbury Lady's Locket", "Alice Mirror Shard", "Halton Spyglass", "Old Pale Seven-Counties Medal", "Beeston Collar Tag"
  ];
  for (let i = 0; i < COLLECTIBLES.length; i++) {
    K("collectible_" + (i + 1), COLLECTIBLES[i], "var", "Collectible " + (i + 1) + " of 25. " + COLLECTIBLES[i] + " — no use whatsoever, and you will keep it forever.", { collectible: i + 1 });
  }
  const VIEWPOINTS = ["bollington", "teggs_nose", "shutlingsloe", "lyme_park", "alderley_edge", "bosley_cloud", "mow_cop", "winsford_headgear", "frodsham_hill", "delamere_old_pale", "beeston_castle", "chester_walls"];
  for (let i = 0; i < VIEWPOINTS.length; i++) {
    K("viewpoint_" + VIEWPOINTS[i], "Viewpoint Plaque", "var", "A brass plaque with the far hills named on it. Two of them are wrong.", { viewpoint: VIEWPOINTS[i] });
  }
  for (let i = 1; i <= 11; i++) {
    K("cat_token_" + i, "Cat Token", "var", "A wooden disc with a grin burnt into it. Cat " + i + " of eleven; unlocks a coat for MEADOW or BIGBOY.", { catToken: i });
  }

  // =================================================================
  // 4.8 Fishing rods
  // =================================================================
  I("rod_bamboo", "Bamboo Rod", "rod", 500, { rodTier: 1, tiers: ["common"], usableInField: true, sellable: false }, "Split cane and optimism. Reaches the common tier.");
  I("rod_weighted", "Weighted Line", "rod", 0, { rodTier: 2, tiers: ["common", "uncommon", "rare"], usableInField: true, sellable: false }, "Angler Doug lent it to you and never asked for it back.");
  I("rod_carbon", "Carbon Rod", "rod", 4000, { rodTier: 3, tiers: ["common", "uncommon", "rare", "legendary"], usableInField: true, sellable: false }, "Absurdly light. Opens the legendary table at dawn and dusk.");
  I("rod_elm", "Elm-handled Rod", "rod", 0, { rodTier: 4, tiers: ["common", "uncommon", "rare", "legendary", "ghost"], usableInField: true, sellable: false }, "Turned at Y Berllan from orchard elm. With the Ghost Lens, it catches what isn't there.");

  // =================================================================
  // 4.9 Ingredients (17) and brews (9)
  // =================================================================
  function ING(id, name, source, desc) { return I(id, name, "ingredient", 0, { ingredient: true, sources: source, sellable: true, price: 60 }, desc); }
  ING("perry_pear", "Perry Pear", ["y_berllan"], "Hard as a doorknob and useless for anything but perry, which is the point.");
  ING("apple", "Apple", ["orchard", "market"], "A Cheshire apple: small, spotty, and better than it looks.");
  ING("brine_sample", "Brine Sample", ["nantwich"], "Lido water in a screwtop. Clears things up, eventually.");
  ING("barley", "Barley", ["nantwich", "farm"], "A double handful from a field that will be houses by Christmas.");
  ING("roasted_acorn", "Roasted Acorn", ["delamere_forest", "tatton_park"], "Bitter until you roast it. Still fairly bitter.");
  ING("blackberry", "Blackberry", ["route_hedge"], "From the far side of the hedge, which is where the good ones live.");
  ING("sloe", "Sloe", ["route_hedge"], "Astringent enough to close your face. Wait for the first frost.");
  ING("honey", "Honey", ["chester", "hives"], "Rows honey, dark as tar, faintly of lime blossom.");
  ING("roe", "Roe", ["fishing"], "A fishing drop. Everything downstream wants it.");
  ING("oats", "Oats", ["market"], "Plain rolled oats. Two thirds of Cheshire runs on these.");
  ING("cream", "Cream", ["nantwich"], "From the cheese show. Thick enough to stand a spoon in.");
  ING("catmint", "Catmint", ["tatton_park"], "Do not carry this near MEADOW unless you mean it.");
  ING("timber_oak", "Oak Timber", ["delamere_forest"], "Seasoned oak, cut square. Burns slow and hot.");
  ING("timber_pine", "Pine Timber", ["delamere_forest"], "Resinous and quick. Good for starting an argument or a beacon.");
  ING("timber_birch", "Birch Timber", ["delamere_forest"], "Bark peels off in sheets that light in the rain.");

  function BREW(id, name, tier, effect, desc, extra) {
    const p = { brew: true, tier: tier, brewEffect: effect, usableInField: true, sellable: false };
    if (extra) { const ks = Object.keys(extra); for (let i = 0; i < ks.length; i++) p[ks[i]] = extra[ks[i]]; }
    return I(id, name, "brew", 0, p, desc);
  }
  BREW("brew_perry", "Perry", 1, { kind: "partyHeal", full: true, overdriveStart: 25 }, "Y Berllan perry. Party to full, and everyone starts the next fight already annoyed.", { usableInBattle: true });
  BREW("brew_clarifier", "Clarifier", 1, { kind: "partyCure" }, "Cloudy going in, clear coming out. Cures every status in the party.", { usableInBattle: true });
  BREW("brew_elm_stout", "Elm Stout", 1, { kind: "prebattle", stage: { stat: "def", delta: 1 }, turns: 3 }, "Black, flat, and structural. Defence up for the first three turns of the next battle.");
  BREW("brew_damson_fire", "Damson Fire", 2, { kind: "prebattle", typeBoost: "fire", mult: 1.2, battles: 1 }, "Damsons and a beacon ember. Fire moves ×1.2 for one battle, and heartburn for two.");
  BREW("brew_hedgerow_cordial", "Hedgerow Cordial", 2, { kind: "timed", catchMult: 1.3, realMinutes: 10 }, "Blackberry and sloe. Catch rate ×1.3 for ten real minutes.");
  BREW("brew_salt_mead", "Salt Mead", 2, { kind: "prebattle", damageTaken: { types: ["rock", "ground"], mult: 0.75 }, battles: 1 }, "Honey and halite. Rock and Ground come off you at three-quarters for one battle.");
  BREW("brew_bait_tin", "Bait Tin", 2, { kind: "fishing", rareZone: 1.5 }, "Roe and oats, gone over. Widens the rare zone on the bite bar — or wear it and never think about it again.", { trinket: true });
  BREW("brew_cats_cup", "Cat's Cup", 1, { kind: "catTrust", delta: 1, daily: true }, "Cream and catmint, warmed. Once a day, one cat thinks better of you.");
  BREW("brew_mamgu_cask", "Mam-gu's Cask", 3, { kind: "perkPoint", n: 1, weekly: true }, "Everything in the orchard, in one cask, for a week. One perk point, and a lie down.");

  // =================================================================
  // 4.10 Skill Cards (TMs)
  // =================================================================
  const GYM_TMS = {
    tm_live_rail: "Sysadmin Ada", tm_cranford_whisper: "Madam Gaskell", tm_bear_hug: "Bearward Otis",
    tm_firebox_roar: "Stoker Di", tm_brine_jet: "Brine Nell", tm_salt_grind: "Foreman Jack",
    tm_proxy_cloud: "Chemist Ria", tm_zero_day: "Netrunner Mo"
  };
  const SHOP_TMS = ["torrent", "flame_burst", "volt_strike", "petal_storm", "rock_slide", "quake", "mind_ray", "night_pulse",
    "data_stream", "hack_slash", "sludge", "wing_attack", "bug_bite", "static_wave", "toxic_dose", "sleep_powder",
    "agility", "encrypt", "firewall_up", "hedge_lay", "signal_box", "mere_mist", "ridge_gale", "beacon_light"];
  function TM(moveId, price, leader) {
    const mv = D.moves[moveId];
    const nm = mv ? mv.name : moveId;
    I("tm_" + moveId, "Skill Card: " + nm, "tm", price, {
      teaches: moveId, singleUse: true, usableInField: true, sellable: false, leader: leader || null
    }, (leader ? leader + " hands it over without ceremony. " : "A bound chapter from the Knutsford bookshop. ") + "Teaches " + nm + " once, then it's spent.");
  }
  const gymKeys = Object.keys(GYM_TMS);
  for (let i = 0; i < gymKeys.length; i++) TM(gymKeys[i].slice(3), 0, GYM_TMS[gymKeys[i]]);
  for (let i = 0; i < SHOP_TMS.length; i++) TM(SHOP_TMS[i], 2000, null);

  // =================================================================
  // Public helpers
  // =================================================================
  D.itemName = function (id) { const it = D.items[id]; return it ? it.name : String(id); };
  D.itemsOfKind = function (kind) { return D.filter("items", function (it) { return it.kind === kind; }); };
  D.shopStock = function (kinds) {
    return D.filter("items", function (it) { return it.price > 0 && (!kinds || kinds.indexOf(it.kind) >= 0); });
  };
  D.trinkets = function () { return D.filter("items", function (it) { return !!it.trinket; }); };
  D.tmForMove = function (moveId) { return D.items["tm_" + moveId] || null; };
  D.itemSellPrice = function (id) { const it = D.items[id]; return it && it.sellable ? Math.floor(it.price / 2) : 0; };
  D.itemCures = function (id, status) { const it = D.items[id]; return !!(it && it.cures && it.cures.indexOf(status) >= 0); };

  // ---- validation -------------------------------------------------
  const KINDS = { heal: 1, cure: 1, capsule: 1, gear: 1, held_consumable: 1, consumable: 1, key: 1, ingredient: 1, brew: 1, evo: 1, tm: 1, rod: 1 };
  const STATUSES = { psn: 1, tox: 1, par: 1, brn: 1, slp: 1, frz: 1, cnf: 1 };
  D.validators.push(function (err) {
    const names = {};
    D.each("items", function (it, id) {
      if (!it.name) err("items/" + id + ": missing name");
      if (!it.desc) err("items/" + id + ": missing desc");
      if (!KINDS[it.kind]) err("items/" + id + ": unknown kind '" + it.kind + "'");
      if (it.price < 0) err("items/" + id + ": negative price");
      // key items and collectibles legitimately repeat display names (Face Fragment, Letter from Nino...)
      if (it.kind !== "key" && names[it.name]) err("items/" + id + ": duplicate name '" + it.name + "' (also " + names[it.name] + ")");
      names[it.name] = id;
      if (it.cures) for (let i = 0; i < it.cures.length; i++) if (!STATUSES[it.cures[i]]) err("items/" + id + ": cures unknown status '" + it.cures[i] + "'");
      if (it.teaches && !D.moves[it.teaches]) err("items/" + id + ": teaches unknown move '" + it.teaches + "'");
      if (it.kind === "tm" && !it.teaches) err("items/" + id + ": Skill Card teaches nothing");
      if (it.gearEffect && it.gearEffect.type && !D.types[it.gearEffect.type]) err("items/" + id + ": gearEffect.type unknown '" + it.gearEffect.type + "'");
      if (it.unlocks && ["bike", "squeeze", "shove", "billhook", "lamp", "boat", "lift", "waders", "climb", "goggles", "railcard"].indexOf(it.unlocks) < 0) err("items/" + id + ": unknown traversal ability '" + it.unlocks + "'");
      if (it.kind === "capsule" && !(it.catchBonus > 0)) err("items/" + id + ": capsule with no catchBonus");
    });
    if (D.count("items") < 140) err("items: expected ~150+, found " + D.count("items"));
  });
})();
