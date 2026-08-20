// =============================================================
// MonsterQuest v2 — js/data/moves.js  (data workstream)
// MQ.Data.moves — 170 moves per ROSTER §2, shapes per
// ENGINE-ARCHITECTURE §4 reconciled with SYSTEMS-SPEC §4.
//
// Move shape:
//  { name, type, cat:'phys'|'spec'|'status', power, acc, pp, priority,
//    crit, target:'foe'|'self'|'field', flags:{contact,sound,charge,recharge,protect_ok},
//    effects:[ {kind, ...} ], desc, anim, overdriveOnly? }
//
// acc: number 0-100, or null = never miss (ENGINE §4). SYSTEMS-SPEC §5
//      writes that as 999 — MQ.Data.moveAcc(move) returns 999 for null so
//      either convention works in the battle engine.
// effects: SYSTEMS-SPEC §4 vocabulary (multihit/cleanse/fixed/... ). Fraction
//      effects carry BOTH `frac` (0-1, SYSTEMS) and `pct` (0-100, ENGINE).
//      Targeted effects carry BOTH `who` (ENGINE) and `target` (SYSTEMS).
//      Optional `when:` is a MQ.Flags-style condition string evaluated by the
//      battle engine against battle state ('weather.rain', '!weather.rain').
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  // ---- effect builders -------------------------------------------
  function frac(o, f) { o.frac = f; o.pct = Math.round(f * 100); return o; }
  function S(status, chance) { return { kind: "status", status: status, chance: chance === undefined ? 100 : chance, who: "foe", target: "foe" }; }
  function SS(status, chance) { return { kind: "status", status: status, chance: chance === undefined ? 100 : chance, who: "self", target: "self" }; }
  function G(who, stat, delta, chance) { return { kind: "stage", stat: stat, delta: delta, who: who, target: who, chance: chance === undefined ? 100 : chance }; }
  function HEAL(f, who) { return frac({ kind: "heal", who: who || "self", target: who || "self" }, f); }
  function DRAIN(f) { return frac({ kind: "drain" }, f); }
  function RECOIL(f) { return frac({ kind: "recoil" }, f); }
  function MH(min, max) { return { kind: "multihit", min: min, max: max }; }
  function FLINCH(c) { return { kind: "flinch", chance: c, who: "foe", target: "foe" }; }
  function WX(w, turns) { return { kind: "weather", w: w, weather: w, turns: turns }; }
  function TR(tr, turns) { return { kind: "terrain", tr: tr, terrain: tr, turns: turns }; }
  function SCR(kind, turns) { return { kind: "screen", side: kind, screen: kind, turns: turns }; }
  function TRAP(turns) { return { kind: "trap", turns: turns, who: "foe", target: "foe" }; }
  function CLEANSE(who, what) { return { kind: "cleanse", who: who, target: who, what: what || "status" }; }
  function HC(n) { return { kind: "high_crit", stages: n }; }
  function NM() { return { kind: "never_miss" }; }
  function CHG(turns, semi) { return { kind: "charge", turns: turns || 1, semiInvuln: !!semi }; }
  function RCH(when) { const o = { kind: "recharge" }; if (when) o.when = when; return o; }
  function OHKO() { return { kind: "ohko" }; }
  function FIX(amount) { return { kind: "fixed", amount: amount }; }
  function TAUNT(t) { return { kind: "taunt", turns: t, who: "foe", target: "foe" }; }
  function PPD(n, which) { return { kind: "pp_drain", n: n, which: which || "last", who: "foe", target: "foe" }; }
  function OD(gain) { return { kind: "overdrive", gain: gain, who: "self", target: "self" }; }
  function COPY() { return { kind: "copy_stages" }; }
  function END() { return { kind: "endure" }; }
  function PROT() { return { kind: "protect" }; }
  function COOL(t) { return { kind: "cooldown", turns: t }; }             // usable every N turns
  function WBOOST(w, mult) { return { kind: "weather_boost", w: w, mult: mult }; }
  function MIMIC() { return { kind: "mimic_type" }; }
  function AGENT(o) { const e = { kind: "agent" }; if (o) { const ks = Object.keys(o); for (let i = 0; i < ks.length; i++) e[ks[i]] = o[ks[i]]; } return e; }
  function WHEN(e, cond) { e.when = cond; return e; }

  // ---- flag parsing ----------------------------------------------
  const FLAGMAP = { c: "contact", s: "sound", ch: "charge", rc: "recharge", p: "protect_ok", od: "overdriveOnly" };
  function parseFlags(str, cat) {
    const f = { contact: false, sound: false, charge: false, recharge: false, protect_ok: true };
    if (str) {
      const parts = String(str).split(/[ ,]+/);
      for (let i = 0; i < parts.length; i++) { const k = FLAGMAP[parts[i]]; if (k && k !== "overdriveOnly") f[k] = true; }
    }
    if (cat === "status") f.protect_ok = false;
    return f;
  }

  // ---- animation hint (art/battle scene reads move.anim) ----------
  function animFor(type, cat, effects) {
    if (type === "cyber") return "cyber";
    if (cat === "status") {
      for (let i = 0; i < effects.length; i++) {
        const e = effects[i];
        if (e.kind === "heal" || e.kind === "cleanse" || e.kind === "rest") return "heal";
        if (e.kind === "status" || e.kind === "trap" || e.kind === "taunt") return "status";
        if (e.kind === "weather" || e.kind === "terrain" || e.kind === "screen") return "buff";
        if (e.kind === "stage") return e.who === "self" ? "buff" : "debuff";
      }
      return "status";
    }
    if (cat === "phys") return "slash";
    for (let i = 0; i < effects.length; i++) if (effects[i].kind === "charge") return "beam";
    return "blast";
  }

  function targetFor(cat, effects) {
    if (cat !== "status") return "foe";
    let selfOnly = true, field = false;
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      if (e.kind === "weather" || e.kind === "terrain" || e.kind === "screen") { field = true; continue; }
      if (e.who === "foe" || e.kind === "status" || e.kind === "trap" || e.kind === "taunt" || e.kind === "pp_drain" || e.kind === "copy_stages") selfOnly = false;
    }
    if (!selfOnly) return "foe";
    return field ? "field" : "self";
  }

  const NAMES = {};
  function M(id, name, type, cat, pow, acc, pp, pri, flagStr, effects, desc) {
    effects = effects || [];
    let crit = 0;
    for (let i = 0; i < effects.length; i++) if (effects[i].kind === "high_crit") crit = effects[i].stages || 1;
    const m = {
      name: name, type: type, cat: cat,
      power: cat === "status" ? 0 : pow,
      acc: acc,
      pp: pp, priority: pri || 0, crit: crit,
      target: targetFor(cat, effects),
      flags: parseFlags(flagStr, cat),
      effects: effects,
      desc: desc,
      anim: animFor(type, cat, effects)
    };
    if (NAMES[name]) MQ.warn("[moves] duplicate move name: " + name);
    NAMES[name] = id;
    return D.define("moves", id, m);
  }
  // Overdrive signature: ignores protect, never misses, no PP, drains meter.
  function OM(id, name, type, cat, pow, effects, line, desc) {
    const m = M(id, name, type, cat, pow, null, 0, 0, "", effects || [], desc);
    m.overdriveOnly = true;
    m.flags.protect_ok = false;
    m.line = line;
    m.effects.push(NM());
    return m;
  }

  // =================================================================
  // 2.1 NORMAL (16)
  // =================================================================
  M("tackle", "Tackle", "normal", "phys", 40, 100, 35, 0, "c", [], "A full-body shove. Nothing clever about it.");
  M("scratch", "Scratch", "normal", "phys", 40, 100, 35, 0, "c", [], "Quick claws, quicker apology.");
  M("quick_dash", "Quick Dash", "normal", "phys", 40, 100, 30, 1, "c", [], "Strikes first, always. Ask questions later.");
  M("bite", "Bite", "normal", "phys", 60, 100, 25, 0, "c", [FLINCH(30)], "A hard bite that may make the foe hesitate.");
  M("hyper_fang", "Hyper Fang", "normal", "phys", 80, 90, 15, 0, "c", [FLINCH(10)], "Rat-king fangs, honed on bin lids.");
  M("slam", "Slam", "normal", "phys", 80, 90, 20, 0, "c", [], "The whole body, arriving at once.");
  M("growl", "Growl", "normal", "status", 0, 100, 40, 0, "s", [G("foe", "atk", -1)], "A low warning that takes the wind out of the foe.");
  M("tail_whip", "Tail Whip", "normal", "status", 0, 100, 30, 0, "", [G("foe", "def", -1)], "A distracting flick. The guard drops.");
  M("sharpen", "Sharpen", "normal", "status", 0, null, 30, 0, "", [G("self", "atk", 1)], "Edges honed. Attack rises.");
  M("harden", "Harden", "normal", "status", 0, null, 30, 0, "", [G("self", "def", 1)], "Braced for it. Defence rises.");
  M("screech", "Screech", "normal", "status", 0, 85, 30, 0, "s", [G("foe", "def", -2)], "Ear-splitting. The foe's defence collapses.");
  M("white_nancy_stand", "White Nancy Stand", "normal", "status", 0, null, 5, 4, "", [END(), OD(25)], "Stand like the folly on the hill: survive at 1 HP and gain Overdrive.");
  M("belfry_toll", "Belfry Toll", "normal", "spec", 75, 100, 15, 0, "s", [G("foe", "spd", -1, 20)], "A Sandbach peal that goes straight through you.");
  M("skitter", "Skitter", "normal", "status", 0, null, 20, 1, "", [G("self", "eva", 1), G("self", "spe", 1)], "MEADOW's dart-and-vanish. Blink and she's behind you.");
  M("big_sit", "Big Sit", "normal", "status", 0, null, 5, 0, "", [CLEANSE("foe", "stages"), G("self", "def", 2)], "BIGBOY sits on the problem until the problem stops.");
  M("bear_hug", "Bear Hug", "normal", "phys", 80, 100, 15, 0, "c", [TRAP(4)], "Otis's Skill Card. Beartown's oldest argument.");

  // =================================================================
  // 2.2 FIRE (10)
  // =================================================================
  M("ember", "Ember", "fire", "spec", 40, 100, 25, 0, "", [S("brn", 10)], "A small flame with ideas above its station.");
  M("cinder_kick", "Cinder Kick", "fire", "phys", 60, 100, 20, 0, "c", [S("brn", 10)], "A bootful of hot cinders.");
  M("flame_burst", "Flame Burst", "fire", "spec", 70, 100, 15, 0, "", [S("brn", 10)], "A fireball that bursts on contact.");
  M("flame_lash", "Flame Lash", "fire", "spec", 85, 100, 10, 0, "", [S("brn", 10)], "A whip of flame, cracked twice.");
  M("firebox_roar", "Firebox Roar", "fire", "spec", 90, 100, 10, 0, "s", [S("brn", 20), RCH("weather.rain")], "The loco's firebox opened wide. Wet coal makes it cough.");
  M("boiler_burst", "Boiler Burst", "fire", "spec", 110, 85, 5, 0, "rc", [RCH()], "Steam and fire at once. Someone will have to explain the paperwork.");
  M("wisp_flame", "Wisp Flame", "fire", "status", 0, 85, 15, 0, "", [S("brn")], "A blue flame that settles in and burns.");
  M("stoke", "Stoke", "fire", "status", 0, null, 20, 0, "", [G("self", "atk", 1), G("self", "spe", 1)], "Shovel on more coal. Attack and speed rise.");
  M("soot_cloud", "Soot Cloud", "fire", "status", 0, 100, 20, 0, "", [G("foe", "acc", -1)], "A chimney's worth of soot, straight in the eyes.");
  M("beacon_light", "Beacon Light", "fire", "status", 0, null, 5, 0, "", [WX("sun", 5)], "Light the hill beacon. The sky, briefly, behaves.");

  // =================================================================
  // 2.3 WATER (11)
  // =================================================================
  M("brine_spit", "Brine Spit", "water", "spec", 40, 100, 25, 0, "", [], "A squirt of salt water. Stings in the small cuts.");
  M("brine_dart", "Brine Dart", "water", "phys", 40, 100, 20, 1, "c", [], "A fast watery lunge that lands first.");
  M("bubble_jet", "Bubble Jet", "water", "spec", 65, 100, 20, 0, "", [G("foe", "spe", -1, 10)], "A stream of bubbles that clings to the legs.");
  M("claw_smash", "Claw Smash", "water", "phys", 75, 95, 15, 0, "c", [HC(1)], "One crack of a crab claw. Lands well more often than it should.");
  M("torrent", "Torrent", "water", "spec", 80, 100, 15, 0, "", [], "A mill-race let loose down the wheel-pit.");
  M("brine_jet", "Brine Jet", "water", "spec", 80, 100, 10, 0, "", [WHEN(WX("rain", 5), "!weather.rain"), WHEN(G("self", "spe", 1), "weather.rain")], "Nantwich brine under pressure. Brings the rain, or rides it.");
  M("weaver_surge", "Weaver Surge", "water", "spec", 90, 100, 10, 0, "", [], "The Weaver in spate, taking the towpath with it.");
  M("mere_mist", "Mere Mist", "water", "status", 0, null, 5, 0, "", [WX("rain", 5)], "Cheshire's default weather, summoned early.");
  M("lido_soak", "Lido Soak", "water", "status", 0, null, 10, 0, "", [HEAL(0.5)], "Steam rising off the brine pool. Half the aches gone.");
  M("tide_pull", "Tide Pull", "water", "phys", 35, 90, 15, 0, "c", [TRAP(4)], "Drags the foe in and does not let go.");
  M("sluice_gate", "Sluice Gate", "water", "status", 0, null, 15, 0, "", [SCR("phys", 5)], "An iron gate drops. Physical damage halved.");

  // =================================================================
  // 2.4 GRASS (10)
  // =================================================================
  M("vine_lash", "Vine Lash", "grass", "phys", 45, 100, 25, 0, "c", [], "A whipping vine off the hedge bottom.");
  M("razor_leaf", "Razor Leaf", "grass", "spec", 55, 95, 25, 0, "", [HC(1)], "Leaves with an edge on them.");
  M("bramble_whip", "Bramble Whip", "grass", "phys", 70, 100, 15, 0, "c", [G("foe", "spe", -1, 20)], "Thorny lash. The snags slow the foe down.");
  M("petal_storm", "Petal Storm", "grass", "spec", 80, 100, 10, 0, "", [], "A blossom gale, prettier than it is kind.");
  M("elm_press", "Elm Press", "grass", "phys", 85, 100, 10, 0, "c", [DRAIN(0.5)], "The orchard press: crush, then drink what comes out.");
  M("sleep_powder", "Sleep Powder", "grass", "status", 0, 75, 15, 0, "", [S("slp")], "Drowsy spores. Very moreish.");
  M("regrow", "Regrow", "grass", "status", 0, null, 10, 0, "", [HEAL(0.5)], "Fresh shoots. Half the damage forgotten.");
  M("root_bind", "Root Bind", "grass", "status", 0, 90, 15, 0, "", [TRAP(4)], "Roots come up through the path and hold on.");
  M("hedge_lay", "Hedge Lay", "grass", "status", 0, null, 10, 0, "", [TR("grass", 5), G("self", "def", 1)], "Pleached and pegged: Grass terrain, and a stouter guard.");
  M("mulberry_leaf", "Mulberry Leaf", "grass", "status", 0, null, 10, 0, "", [HEAL(0.25), CLEANSE("self", "status")], "A silkworm's supper. Small, but it settles the stomach.");

  // =================================================================
  // 2.5 ELECTRIC (10)
  // =================================================================
  M("static_shock", "Static Shock", "electric", "spec", 40, 100, 30, 0, "", [S("par", 10)], "Fleece static, discharged rudely.");
  M("spark", "Spark", "electric", "phys", 65, 100, 20, 0, "c", [S("par", 30)], "A charged tackle. The hair stands up afterwards.");
  M("arc_flash", "Arc Flash", "electric", "spec", 70, 100, 15, 0, "", [FLINCH(20)], "A blinding arc. Nobody moves for a second.");
  M("third_rail", "Third Rail", "electric", "phys", 80, 100, 15, 0, "c", [S("par", 20)], "Don't touch it. The foe touches it.");
  M("volt_strike", "Volt Strike", "electric", "spec", 85, 100, 10, 0, "", [S("par", 10)], "A direct bolt, no ceremony.");
  M("pylon_arc", "Pylon Arc", "electric", "spec", 110, 70, 5, 0, "", [S("par", 30)], "Pylon to pylon. Half the county hears it.");
  M("static_wave", "Static Wave", "electric", "status", 0, 90, 20, 0, "", [S("par")], "A paralysing wave that leaves the limbs arguing.");
  M("signal_box", "Signal Box", "electric", "status", 0, null, 10, 0, "", [TR("static", 5), G("self", "spe", 1)], "Pull the levers: Static terrain, and a clear road.");
  M("charge_up", "Charge Up", "electric", "status", 0, null, 20, 0, "", [G("self", "spa", 1), G("self", "spd", 1)], "Store a charge for later. Later arrives quickly.");
  M("live_rail", "Live Rail", "electric", "spec", 80, 100, 15, 0, "", [S("par", 10)], "Ada's Skill Card. The rail is always live, that's the point.");

  // =================================================================
  // 2.6 FLYING (10)
  // =================================================================
  M("gust", "Gust", "flying", "spec", 40, 100, 35, 0, "", [], "A puff of wind with intent.");
  M("peck", "Peck", "flying", "phys", 35, 100, 35, 0, "c", [], "A sharp beak, twice.");
  M("wing_attack", "Wing Attack", "flying", "phys", 60, 100, 30, 0, "c", [], "A wing buffet across the face.");
  M("aerial_lash", "Aerial Lash", "flying", "phys", 70, 100, 15, 0, "c", [], "A diving strike from an unhelpful angle.");
  M("curlew_cry", "Curlew Cry", "flying", "spec", 75, 100, 15, 0, "s", [G("foe", "spd", -1, 20)], "A wild moor call that gets under the ribs.");
  M("sky_dive", "Sky Dive", "flying", "phys", 90, 95, 10, 0, "c ch", [CHG(1, true)], "Up out of reach, then down very hard indeed.");
  M("dive_bomb", "Dive Bomb", "flying", "phys", 100, 90, 10, 0, "c", [RECOIL(0.25)], "A reckless plunge. Both parties regret it.");
  M("ridge_gale", "Ridge Gale", "flying", "status", 0, null, 5, 0, "", [WX("wind", 4)], "Call the ridge wind down off the edge.");
  M("updraft", "Updraft", "flying", "status", 0, null, 20, 0, "", [G("self", "spe", 2)], "Find the thermal and stop flapping.");
  M("preen", "Preen", "flying", "status", 0, null, 10, 0, "", [HEAL(0.5)], "Feathers tidied, dignity and health restored.");

  // =================================================================
  // 2.7 BUG (9)
  // =================================================================
  M("bug_bite", "Bug Bite", "bug", "phys", 60, 100, 20, 0, "c", [], "Mandibles, applied firmly.");
  M("needle_volley", "Needle Volley", "bug", "phys", 25, 95, 20, 0, "", [MH(2, 5)], "A volley of pins. Two to five of them.");
  M("bollin_flutter", "Bollin Flutter", "bug", "spec", 60, 100, 20, 0, "", [G("foe", "spe", -1, 30)], "Moth-dust wingbeat. Clogs the works.");
  M("copper_bite", "Copper Bite", "bug", "phys", 75, 100, 15, 0, "c", [G("foe", "def", -1, 20)], "Verdigris mandibles that leave a green mark.");
  M("hive_swarm", "Hive Swarm", "bug", "spec", 80, 100, 10, 0, "s", [], "The whole nest at once, all opinions included.");
  M("string_shot", "String Shot", "bug", "status", 0, 95, 40, 0, "", [G("foe", "spe", -2)], "Sticky thread around the ankles.");
  M("silk_bind", "Silk Bind", "bug", "status", 0, 90, 15, 0, "", [TRAP(4)], "Wrapped in silk and going nowhere.");
  M("cocoon", "Cocoon", "bug", "status", 0, null, 20, 0, "", [G("self", "def", 1), G("self", "spd", 1)], "Spin a shell and wait it out.");
  M("moth_dust", "Moth Dust", "bug", "status", 0, 75, 15, 0, "", [S("cnf")], "Powdered scales. The foe loses the thread.");

  // =================================================================
  // 2.8 POISON (10)
  // =================================================================
  M("poison_sting", "Poison Sting", "poison", "phys", 15, 100, 35, 0, "c", [S("psn", 30)], "A small venomous jab with a long memory.");
  M("chem_spray", "Chem Spray", "poison", "spec", 55, 100, 20, 0, "", [G("foe", "spd", -1, 30)], "Reagent mist. Read the label afterwards.");
  M("sludge", "Sludge", "poison", "spec", 65, 100, 20, 0, "", [S("psn", 30)], "Mersey sludge, thrown with feeling.");
  M("rot_bite", "Rot Bite", "poison", "phys", 70, 100, 15, 0, "c", [S("psn", 20)], "Compost fangs. Warm, which is worse.");
  M("smog_bank", "Smog Bank", "poison", "spec", 70, 100, 15, 0, "", [G("foe", "acc", -1, 30)], "Chemical-works smog, rolling in on cue.");
  M("venom_lash", "Venom Lash", "poison", "phys", 75, 100, 15, 0, "c", [S("psn", 10)], "A venom-slick whip that finds the gaps.");
  M("reagent_mix", "Reagent Mix", "poison", "spec", 90, 95, 10, 0, "", [S("psn", 20)], "Ria's fume cupboard, briefly outdoors.");
  M("toxic_dose", "Toxic Dose", "poison", "status", 0, 90, 10, 0, "", [S("tox")], "A dose that gets worse the longer you leave it.");
  M("proxy_veil", "Proxy Veil", "poison", "status", 0, null, 5, 0, "", [WX("fog", 4), G("self", "eva", 1)], "Residential-proxy fog. Everyone looks like a neighbour.");
  M("proxy_cloud", "Proxy Cloud", "poison", "status", 0, null, 10, 0, "", [WX("fog", 5), S("tox", 30)], "Ria's Skill Card: fog with something unpleasant in it.");

  // =================================================================
  // 2.9 ROCK (8)
  // =================================================================
  M("rock_throw", "Rock Throw", "rock", "phys", 50, 90, 20, 0, "", [], "A lobbed stone. Traditional.");
  M("salt_spray", "Salt Spray", "rock", "spec", 60, 100, 20, 0, "", [G("foe", "spd", -1, 20)], "Stinging salt. Rusts the resolve.");
  M("rock_slide", "Rock Slide", "rock", "phys", 75, 90, 10, 0, "", [FLINCH(30)], "Half of Kerridge quarry, coming down.");
  M("salt_grind", "Salt Grind", "rock", "phys", 75, 95, 15, 0, "c", [TR("salt", 5), HC(1)], "Salt-pan grinding. Jack's Skill Card.");
  M("gritstone_edge", "Gritstone Edge", "rock", "phys", 80, 100, 10, 0, "c", [HC(1)], "Struck along the edge of the crag.");
  M("crag_crush", "Crag Crush", "rock", "phys", 100, 80, 5, 0, "c", [], "The whole crag, briefly mobile.");
  M("stone_skin", "Stone Skin", "rock", "status", 0, null, 20, 0, "", [G("self", "def", 2)], "Sandstone hide. Defence rises sharply.");
  M("menhir_stand", "Menhir Stand", "rock", "status", 0, null, 10, 0, "", [SCR("spec", 5), G("self", "def", 1)], "A standing-stone ward against special damage.");

  // =================================================================
  // 2.10 GROUND (9)
  // =================================================================
  M("mud_shot", "Mud Shot", "ground", "spec", 55, 95, 15, 0, "", [G("foe", "spe", -1, 30)], "Peaty mud, boot-deep.");
  M("hoof_stamp", "Hoof Stamp", "ground", "phys", 65, 100, 20, 0, "c", [G("foe", "spe", -1, 20)], "A stamp that rattles the fillings.");
  M("bog_suck", "Bog Suck", "ground", "phys", 65, 100, 10, 0, "c", [DRAIN(0.5)], "Lindow's pull. It takes, and gives back to the user.");
  M("peat_press", "Peat Press", "ground", "phys", 75, 100, 15, 0, "c", [G("foe", "spd", -1, 20)], "Pressed flat and preserved for two thousand years.");
  M("dig", "Dig", "ground", "phys", 80, 100, 10, 0, "c ch", [CHG(1, true)], "Under, out of reach, then up underneath.");
  M("quake", "Quake", "ground", "phys", 100, 100, 10, 0, "", [], "The ground shifts. It has been meaning to.");
  M("pit_shaft", "Pit Shaft", "ground", "spec", 90, 90, 10, 0, "", [], "The cold breath of a flooded pit.");
  M("subsidence", "Subsidence", "ground", "status", 0, 100, 15, 0, "", [G("foe", "def", -1), G("foe", "acc", -1)], "The buildings tilt. So does the aim.");
  M("sink_hole", "Sink Hole", "ground", "status", 0, 30, 5, 0, "", [OHKO()], "Winsford subsidence. One hole, one foe, no foe.");

  // =================================================================
  // 2.11 PSYCHIC (10)
  // =================================================================
  M("confusion", "Confusion", "psychic", "spec", 50, 100, 25, 0, "", [S("cnf", 10)], "A mild psychic push in an unhelpful direction.");
  M("rune_read", "Rune Read", "psychic", "spec", 60, null, 20, 0, "", [NM()], "Read the Bridestones aloud. It always lands.");
  M("mind_ray", "Mind Ray", "psychic", "spec", 65, 100, 20, 0, "", [S("cnf", 10)], "A narrow beam of somebody else's thinking.");
  M("mind_blast", "Mind Blast", "psychic", "spec", 90, 100, 10, 0, "", [G("foe", "spd", -1, 10)], "The full psychic blast, no preamble.");
  M("pulsar_beam", "Pulsar Beam", "psychic", "spec", 120, 90, 5, 0, "ch", [CHG(1)], "Tuned to a pulsar. Fires on the next tick, not before.");
  M("agility", "Agility", "psychic", "status", 0, null, 30, 0, "", [G("self", "spe", 2)], "Mind over legs. Mostly over legs.");
  M("calm_read", "Calm Read", "psychic", "status", 0, null, 20, 0, "", [G("self", "spa", 1), G("self", "spd", 1)], "Sit down with a book in the middle of a fight.");
  M("cipher_riddle", "Cipher Riddle", "psychic", "status", 0, 80, 15, 0, "s", [S("cnf")], "Gaskell's letter-cipher, read out at speed.");
  M("mirror_glass", "Mirror Glass", "psychic", "status", 0, null, 10, 0, "", [COPY()], "Copies the foe's stat stages, flattery included.");
  M("cranford_whisper", "Cranford Whisper", "psychic", "spec", 75, 100, 15, 0, "s", [G("foe", "spd", -1, 20)], "Gaskell's Skill Card. It was only a rumour, and now it isn't.");

  // =================================================================
  // 2.12 GHOST (10)
  // =================================================================
  M("lick", "Lick", "ghost", "phys", 30, 100, 30, 0, "c", [S("par", 30)], "A cold tongue and a colder afterthought.");
  M("shade_bolt", "Shade Bolt", "ghost", "spec", 60, 100, 20, 0, "", [], "A bolt of shadow with weight to it.");
  M("preserved_grip", "Preserved Grip", "ghost", "phys", 70, 100, 15, 0, "c", [TRAP(4)], "A bog-body handshake. Very firm, very old.");
  M("possess", "Possess", "ghost", "spec", 75, 100, 15, 0, "", [FLINCH(20)], "A brief tenancy in someone else's head.");
  M("night_pulse", "Night Pulse", "ghost", "spec", 80, 100, 10, 0, "", [], "A pulse of dark that arrives before the sound.");
  M("phantom_lance", "Phantom Lance", "ghost", "phys", 90, 100, 10, 0, "c", [], "A sleeping knight's lance, still sharp.");
  M("haunt", "Haunt", "ghost", "spec", 0, null, 15, 0, "", [FIX("level"), NM()], "Damage equal to the user's level. Patient, and exact.");
  M("cheshire_fade", "Cheshire Fade", "ghost", "status", 0, null, 10, 0, "", [G("self", "eva", 1), TR("silk", 5)], "Fade until only the grin is left.");
  M("curse_bell", "Curse Bell", "ghost", "status", 0, 100, 15, 0, "s", [G("foe", "atk", -1), G("foe", "spa", -1)], "The drowned bell tolls under the mere.");
  M("wisp_lure", "Wisp Lure", "ghost", "status", 0, 85, 15, 0, "", [S("cnf")], "Follow the light. Do not follow the light.");

  // =================================================================
  // 2.13 CYBER (18)
  // =================================================================
  M("bit_blast", "Bit Blast", "cyber", "spec", 40, 100, 30, 0, "", [], "A burst of bits, none of them friendly.");
  M("brute_force", "Brute Force", "cyber", "phys", 25, 90, 15, 0, "c", [MH(2, 5)], "Try every password. Two to five get through.");
  M("phish_hook", "Phish Hook", "cyber", "spec", 55, 95, 20, 0, "", [G("foe", "spa", -1, 30)], "A lure with a hook in it and a plausible sender.");
  M("data_stream", "Data Stream", "cyber", "spec", 65, 100, 20, 0, "", [], "A steady stream of packets, no gaps.");
  M("rootkit_bite", "Rootkit Bite", "cyber", "phys", 65, 100, 15, 0, "c", [G("foe", "eva", -1)], "Bites down into what was hiding, and reveals it.");
  M("hack_slash", "Hack Slash", "cyber", "phys", 70, 100, 15, 0, "c", [], "Quick and dirty. Documented later, if ever.");
  M("threat_hunt", "Threat Hunt", "cyber", "spec", 70, null, 10, 0, "", [NM(), HC(1)], "Finds what hides. Always lands, often hard.");
  M("packet_storm", "Packet Storm", "cyber", "spec", 70, 100, 15, 0, "", [WX("wind", 4), WBOOST("wind", 1.3)], "Flood the link until the link gives up.");
  M("glitch_burst", "Glitch Burst", "cyber", "phys", 85, 90, 10, 0, "", [S("cnf", 10)], "Corrupted frames, delivered at speed.");
  M("rtr_deploy", "RTR Deploy", "cyber", "spec", 90, 100, 10, 0, "", [], "Real-time response, deployed to the endpoint in question.");
  M("zero_day", "Zero-Day", "cyber", "spec", 110, 80, 5, 0, "ch", [CHG(1), G("self", "spd", -1)], "Unpatched and unstoppable. Mo's Skill Card.");
  M("ddos", "DDoS", "cyber", "status", 0, 90, 20, 0, "", [G("foe", "spe", -2)], "Flood them off the wire entirely.");
  M("encrypt", "Encrypt", "cyber", "status", 0, null, 20, 0, "", [G("self", "def", 1), G("self", "spd", 1)], "Wrapped in cipher. Come back with a warrant.");
  M("firewall_up", "Firewall Up", "cyber", "status", 0, null, 15, 0, "", [SCR("spec", 5), OD(10)], "Deny inbound. Log everything.");
  M("patch_tuesday", "Patch Tuesday", "cyber", "status", 0, null, 10, 0, "", [HEAL(0.5), CLEANSE("self", "status"), COOL(2)], "Reboot required. Only every other turn.");
  M("ransom_note", "Ransom Note", "cyber", "status", 0, 85, 10, 0, "", [S("tox"), TRAP(4)], "Encrypted, and you're not leaving until it's paid.");
  M("honeytoken", "Honeytoken", "cyber", "status", 0, 100, 10, 0, "", [TAUNT(3)], "Bait too good to ignore. No status moves for three turns.");
  M("pixel_tripwire", "Pixel Tripwire", "cyber", "status", 0, 90, 10, 0, "", [TR("static", 5), G("foe", "spe", -1)], "A tracking pixel underfoot, and now they know where you are.");

  // =================================================================
  // 2.14 BOSS-ONLY / SCRIPTED (3)
  // =================================================================
  M("oracle_triage", "Oracle Triage", "cyber", "status", 0, null, 5, 0, "", [AGENT({ reveal: true }), G("foe", "spe", -2)], "ORACLE reads your party the way a duty analyst reads a queue.");
  M("cache_revive", "Cache Revive", "cyber", "status", 0, null, 5, 0, "", [HEAL(0.3)], "A checkpoint restored from the salt.");
  M("sysadmin_reboot", "Sysadmin's Reboot", "electric", "status", 0, null, 1, 3, "", [CLEANSE("self", "stages"), { kind: "restore_pp", who: "self", target: "self", all: true }], "Ada's house rule: everything back the way it was, once.");

  // =================================================================
  // 2.15 OVERDRIVE SIGNATURES (26)
  // =================================================================
  OM("od_normal", "Treacle Rush", "normal", "phys", 130, [G("self", "spe", 1)], "generic", "The Treacle Market crowd, arriving all at once.");
  OM("od_fire", "Mill Blaze", "fire", "spec", 130, [S("brn", 30)], "generic", "A mill fire remembered by the whole town.");
  OM("od_water", "Weaver Flood", "water", "spec", 130, [WX("rain", 5)], "generic", "The Weaver, over its banks, on purpose.");
  OM("od_grass", "Hedgerow Wall", "grass", "phys", 120, [HEAL(0.25)], "generic", "Three hundred years of hedge, laid in one go.");
  OM("od_electric", "Pylon Overload", "electric", "spec", 130, [S("par", 30)], "generic", "The National Grid, briefly personal.");
  OM("od_flying", "Gale Force", "flying", "phys", 130, [WX("wind", 4)], "generic", "Everything not nailed down goes over the edge.");
  OM("od_bug", "Swarm Season", "bug", "phys", 40, [MH(3, 3), G("foe", "spe", -1)], "generic", "Three passes of the whole swarm.");
  OM("od_poison", "Fume Cupboard", "poison", "spec", 120, [S("tox", 50)], "generic", "The extractor was off. Nobody checked.");
  OM("od_rock", "Kerridge Fall", "rock", "phys", 130, [FLINCH(30)], "generic", "The quarry face, resigning.");
  OM("od_ground", "Subsidence Quake", "ground", "phys", 130, [TR("salt", 5)], "generic", "The old workings finally let go.");
  OM("od_psychic", "Cranford Rumour", "psychic", "spec", 130, [G("foe", "spd", -1)], "generic", "By teatime the whole town has heard.");
  OM("od_ghost", "Grave Bell", "ghost", "spec", 130, [S("cnf", 30)], "generic", "One toll, from under the water.");
  OM("od_cyber", "Root Shell", "cyber", "spec", 130, [PPD(2)], "generic", "Root, obtained. The foe's last move stops working.");
  OM("zoomies", "Zoomies", "normal", "phys", 40, [MH(3, 3), G("self", "spe", 1), { kind: "priority", delta: 2 }], "meadow", "MEADOW at eleven at night, three times, before you can stand up.");
  OM("brink_roar", "Brink Roar", "normal", "status", 0, [HEAL(0.5), G("self", "def", 1), G("self", "spd", 1), G("foe", "atk", -1)], "bigboy", "BIGBOY makes a noise no cat that size should make.");
  OM("jacquard_weave", "Jacquard Weave", "bug", "spec", 130, [TR("silk", 5), G("foe", "spe", -1)], "silkin", "A punch-card pattern woven straight through the foe.");
  OM("brine_tide", "Brine Tide", "water", "spec", 130, [WX("rain", 8), G("self", "spd", 1)], "brinewt", "The springs come up through the floor of the world.");
  OM("firebox_overload", "Firebox Overload", "fire", "spec", 140, [S("brn", 30), G("self", "spe", -1)], "kindlin", "Every door open, every damper wrong, and glorious.");
  OM("grin_remains", "The Grin Remains", "ghost", "status", 0, [HEAL(0.5), G("self", "eva", 2), S("cnf", 100)], "grinkit", "The cat goes. The grin stays. The foe takes this badly.");
  OM("knights_waking", "Knights Waking", "psychic", "spec", 150, [S("slp", 30)], "merlynx", "The sleepers under the Edge turn over, once.");
  OM("salt_cathedral", "Salt Cathedral", "rock", "phys", 150, [TR("salt", 5), G("self", "def", 1)], "terrataur", "Northwich tilts an inch. Somebody files a report.");
  OM("ridge_storm", "Ridge Storm", "electric", "spec", 140, [WX("wind", 8), S("par", 20)], "zephyrion", "The whole ridge stands up and comes at you sideways.");
  OM("static_scream", "Static Scream", "cyber", "spec", 140, [S("cnf", 30), PPD(1)], "glitchra", "Every speaker in the county, at once, saying nothing.");
  OM("oracle_escalate", "Escalate", "cyber", "status", 0, [AGENT({ jam: 3 }), HEAL(0.3), G("self", "spa", 1)], "oracle_core", "ORACLE escalates. Your agents go quiet for a while.");
  OM("understudy_mask", "Borrowed Face", "cyber", "spec", 120, [COPY(), MIMIC()], "amoslurk", "It wears your best angle back at you.");
  OM("bruin_maul", "Beartown Maul", "normal", "phys", 140, [FLINCH(30), G("self", "def", -1)], "cubbin", "Congleton sold its Bible for this. Worth it.");
  D.moves.static_scream.flags.sound = true;

  // =================================================================
  // Public helpers
  // =================================================================
  D.NEVER_MISS = 999;
  // Accuracy as a number; null (ENGINE 'never miss') → 999 (SYSTEMS-SPEC).
  D.moveAcc = function (m) {
    const mv = typeof m === "string" ? D.moves[m] : m;
    if (!mv) return 100;
    return mv.acc === null || mv.acc === undefined ? 999 : mv.acc;
  };
  D.moveEffect = function (m, kind) {
    const mv = typeof m === "string" ? D.moves[m] : m;
    if (!mv) return null;
    for (let i = 0; i < mv.effects.length; i++) if (mv.effects[i].kind === kind) return mv.effects[i];
    return null;
  };
  D.moveHas = function (m, kind) { return !!D.moveEffect(m, kind); };
  D.movesOfType = function (type) { return D.filter("moves", function (m) { return m.type === type && !m.overdriveOnly; }); };
  D.overdriveMoves = function () { return D.filter("moves", function (m) { return !!m.overdriveOnly; }); };
  // A one-line summary for the UI / Skill Card descriptions.
  D.moveSummary = function (m) {
    const mv = typeof m === "string" ? D.moves[m] : m;
    if (!mv) return "";
    const bits = [D.typeName(mv.type), mv.cat === "status" ? "Status" : (mv.cat === "phys" ? "Physical" : "Special")];
    if (mv.power) bits.push("Pow " + mv.power);
    bits.push("Acc " + (mv.acc === null ? "—" : mv.acc));
    if (mv.pp) bits.push("PP " + mv.pp);
    if (mv.priority) bits.push("Pri " + (mv.priority > 0 ? "+" : "") + mv.priority);
    return bits.join(" · ");
  };

  // ---- validation -------------------------------------------------
  const EFFECT_KINDS = {
    damage: 1, status: 1, stage: 1, heal: 1, drain: 1, recoil: 1, multihit: 1, flinch: 1, protect: 1,
    charge: 1, recharge: 1, weather: 1, terrain: 1, fixed: 1, ohko: 1, crit_only: 1, never_miss: 1,
    high_crit: 1, weight: 1, hp_scaled: 1, force_switch: 1, trap: 1, screen: 1, cleanse: 1, counter: 1,
    overdrive: 1, agent: 1, swap_stats: 1, copy_stages: 1, sleep_talk: 1, rest: 1, endure: 1, taunt: 1,
    pp_drain: 1, cooldown: 1, weather_boost: 1, mimic_type: 1, restore_pp: 1, priority: 1
  };
  const STATS = { atk: 1, def: 1, spa: 1, spd: 1, spe: 1, acc: 1, eva: 1 };
  const STATUSES = { psn: 1, tox: 1, par: 1, brn: 1, slp: 1, frz: 1, cnf: 1 };

  D.validators.push(function (err) {
    const names = {};
    D.each("moves", function (m, id) {
      if (!m.name) err("moves/" + id + ": missing name");
      if (names[m.name]) err("moves/" + id + ": duplicate name '" + m.name + "' (also " + names[m.name] + ")");
      names[m.name] = id;
      if (!D.types[m.type]) err("moves/" + id + ": unknown type '" + m.type + "'");
      if (["phys", "spec", "status"].indexOf(m.cat) < 0) err("moves/" + id + ": bad cat '" + m.cat + "'");
      if (m.acc !== null && (typeof m.acc !== "number" || m.acc < 1 || m.acc > 100)) err("moves/" + id + ": acc must be 1-100 or null, got " + m.acc);
      if (m.cat === "status" && m.power) err("moves/" + id + ": status move has power " + m.power);
      if (m.cat !== "status" && !m.power && !D.moveHas(m, "fixed") && !D.moveHas(m, "ohko")) err("moves/" + id + ": damaging move with no power");
      if (!m.overdriveOnly && !(m.pp > 0)) err("moves/" + id + ": pp must be > 0");
      if (m.overdriveOnly && m.pp !== 0) err("moves/" + id + ": overdrive move must have pp 0");
      if (m.priority < -7 || m.priority > 7) err("moves/" + id + ": priority out of range");
      if (["foe", "self", "field"].indexOf(m.target) < 0) err("moves/" + id + ": bad target '" + m.target + "'");
      if (!m.desc) err("moves/" + id + ": missing desc");
      if (["slash", "blast", "beam", "buff", "debuff", "heal", "status", "cyber"].indexOf(m.anim) < 0) err("moves/" + id + ": bad anim '" + m.anim + "'");
      for (let i = 0; i < m.effects.length; i++) {
        const e = m.effects[i];
        if (!EFFECT_KINDS[e.kind]) err("moves/" + id + ": unknown effect kind '" + e.kind + "'");
        if (e.kind === "stage" && !STATS[e.stat]) err("moves/" + id + ": effect stage has bad stat '" + e.stat + "'");
        if (e.kind === "stage" && (!e.delta || e.delta < -6 || e.delta > 6)) err("moves/" + id + ": effect stage bad delta " + e.delta);
        if (e.kind === "status" && !STATUSES[e.status]) err("moves/" + id + ": effect status bad '" + e.status + "'");
        if (e.chance !== undefined && (e.chance <= 0 || e.chance > 100)) err("moves/" + id + ": effect chance out of range " + e.chance);
        if (e.who !== undefined && ["self", "foe"].indexOf(e.who) < 0) err("moves/" + id + ": effect who '" + e.who + "'");
        if (e.kind === "weather" && ["rain", "sun", "fog", "wind"].indexOf(e.w) < 0) err("moves/" + id + ": bad weather '" + e.w + "'");
        if (e.kind === "terrain" && ["grass", "wet", "salt", "static", "silk"].indexOf(e.tr) < 0) err("moves/" + id + ": bad terrain '" + e.tr + "'");
        if ((e.kind === "heal" || e.kind === "drain" || e.kind === "recoil") && !(e.frac > 0)) err("moves/" + id + ": " + e.kind + " needs frac > 0");
        if (e.kind === "multihit" && !(e.min >= 1 && e.max >= e.min)) err("moves/" + id + ": bad multihit range");
      }
    });
    if (D.count("moves") < 160) err("moves: expected ~170 moves, found " + D.count("moves"));
  });
})();
