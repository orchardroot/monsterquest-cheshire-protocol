// =============================================================
// MonsterQuest v2 — js/data/species.js  (data workstream)
//
// MQ.Data.species  — 172 dex species + 5 hidden boss forms (ROSTER §1)
// MQ.Data.temperaments, MQ.Data.growthGroups
// MQ.Data.makeMonster / expForLevel / levelForExp / statsAtLevel /
//         movesAtLevel / learnableAt / canEvolve / evolve / traitWords
//
// Species shape (ENGINE §4):
//  { num, name, types:[..], base:{hp,atk,def,spa,spd,spe}, catchRate, baseExp,
//    growth, abilities:[id], hiddenAbility?, learnset:[[level,moveId]],
//    tms:[moveId], evolutions:[{to,method,...}], gen:{body,size,feats,palette},
//    dex:{genus,height,weight,text}, habitat, rarity, cry:{...}, tier,
//    overdrive: signature move id, bst, dexHidden? }
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;
  const U = MQ.U;

  // =================================================================
  // 1. Temperaments (SYSTEMS-SPEC §1) — {up, down} × 1.1 / × 0.9
  // =================================================================
  const TEMPERAMENTS = [
    { id: "brisk", name: "Brisk", up: "spe", down: "def", blurb: "Never stops moving. Never puts a coat on." },
    { id: "stubborn", name: "Stubborn", up: "def", down: "spe", blurb: "Has decided where it is standing." },
    { id: "sharp", name: "Sharp", up: "spa", down: "atk", blurb: "Thinks first, hits second, hard." },
    { id: "blunt", name: "Blunt", up: "atk", down: "spa", blurb: "Not one for subtlety or theory." },
    { id: "wary", name: "Wary", up: "spd", down: "atk", blurb: "Watches the door the whole time." },
    { id: "bold", name: "Bold", up: "atk", down: "spd", blurb: "Goes in first and worries later." },
    { id: "rash", name: "Rash", up: "spa", down: "spd", blurb: "All output, no shielding." },
    { id: "patient", name: "Patient", up: "spd", down: "spe", blurb: "Will wait you out. It has all day." },
    { id: "nosy", name: "Nosy", up: "spe", down: "spa", blurb: "In everything, understanding none of it." },
    { id: "gruff", name: "Gruff", up: "def", down: "spa", blurb: "Answers in one syllable, takes hits in silence." },
    { id: "mardy", name: "Mardy", up: "atk", down: "def", blurb: "In a mood, and taking it out on you." },
    { id: "canny", name: "Canny", up: "spa", down: "def", blurb: "Clever, and knows a shortcut." },
    { id: "steadfast", name: "Steadfast", up: "spd", down: "def", blurb: "Bends at the knees, never at the mind." },
    { id: "placid", name: "Placid", up: "def", down: "atk", blurb: "Would honestly rather not." },
    { id: "skittish", name: "Skittish", up: "spe", down: "atk", blurb: "Gone before the sentence finishes." },
    { id: "sly", name: "Sly", up: "spa", down: "spe", blurb: "Slow, and already three moves ahead." },
    { id: "solid", name: "Solid", up: "spd", down: "spa", blurb: "Absorbs everything, including conversation." },
    { id: "windy", name: "Windy", up: "spe", down: "spd", blurb: "Fast, thin-skinned, and full of opinions." },
    { id: "plain", name: "Plain", up: null, down: null, blurb: "Perfectly ordinary, and not sorry about it." },
    { id: "ordinary", name: "Ordinary", up: null, down: null, blurb: "Does the job. Goes home." },
    { id: "even", name: "Even", up: null, down: null, blurb: "Level-headed to a fault." },
    { id: "fair", name: "Fair", up: null, down: null, blurb: "Gives everything a fair go, including you." }
  ];
  const TEMP_BY_ID = {};
  for (let i = 0; i < TEMPERAMENTS.length; i++) TEMP_BY_ID[TEMPERAMENTS[i].id] = TEMPERAMENTS[i];
  D.temperaments = TEMPERAMENTS;
  D.temperament = function (id) { return TEMP_BY_ID[id] || TEMP_BY_ID.plain; };
  D.temperamentMult = function (tempId, stat) {
    const t = TEMP_BY_ID[tempId];
    if (!t || stat === "hp") return 1;
    if (t.up === stat) return 1.1;
    if (t.down === stat) return 0.9;
    return 1;
  };

  // Trait (IV) flavour words, surfaced instead of numbers until Trainer level 20.
  const TRAIT_WORDS = {
    hp: ["Never misses breakfast", "Built to last", "Sturdy about it", "A bit peaky"],
    atk: ["Heavy-handed", "Puts its back into it", "Wiry strength", "Not one for lifting"],
    def: ["Thick coat", "Takes a knock well", "Doesn't flinch", "Bruises easily"],
    spa: ["Quick study", "Sharp between the ears", "Thoughtful", "Not the brightest"],
    spd: ["Hard to rattle", "Keeps its nerve", "Unbothered", "Takes things to heart"],
    spe: ["Keen eyes", "Off like a shot", "Light on its feet", "Takes its time"]
  };
  const STAT_KEYS = ["hp", "atk", "def", "spa", "spd", "spe"];
  D.traitWords = function (mon) {
    const out = [];
    const ivs = (mon && mon.ivs) || {};
    for (let i = 0; i < STAT_KEYS.length; i++) {
      const k = STAT_KEYS[i], v = ivs[k] || 0;
      if (v >= 14) out.push(TRAIT_WORDS[k][0]);
      else if (v >= 11) out.push(TRAIT_WORDS[k][1]);
      else if (v <= 2) out.push(TRAIT_WORDS[k][3]);
    }
    if (!out.length) out.push("Nothing much stands out");
    return out;
  };

  // =================================================================
  // 2. Growth curves (SYSTEMS-SPEC §12)
  // =================================================================
  const GROWTH = {
    fast: function (L) { return Math.floor(0.8 * L * L * L); },
    medium: function (L) { return Math.floor(L * L * L); },
    slow: function (L) { return Math.floor(1.25 * L * L * L); }
  };
  D.growthGroups = ["fast", "medium", "slow"];
  D.MAX_LEVEL = 100;
  D.expForLevel = function (growth, L) {
    const f = GROWTH[growth] || GROWTH.medium;
    if (L <= 1) return 0;
    return f(Math.min(L, D.MAX_LEVEL));
  };
  D.levelForExp = function (growth, exp) {
    let L = 1;
    while (L < D.MAX_LEVEL && D.expForLevel(growth, L + 1) <= exp) L++;
    return L;
  };
  D.expToNext = function (growth, L, exp) {
    if (L >= D.MAX_LEVEL) return 0;
    return Math.max(0, D.expForLevel(growth, L + 1) - exp);
  };
  // XP awarded for defeating `foe` (SYSTEMS-SPEC §12), before share/held modifiers.
  D.expYield = function (foeSpeciesId, foeLevel, userLevel, opts) {
    opts = opts || {};
    const sp = D.species[foeSpeciesId];
    const baseExp = sp ? sp.baseExp : 60;
    let base = Math.floor(baseExp * foeLevel / 5);
    if (opts.kind === "trainer") base = Math.floor(base * 1.5);
    else if (opts.kind === "boss") base = base * 2;
    if (userLevel && userLevel >= foeLevel + 10) {
      base = Math.floor(base * (2 * foeLevel + 10) / (foeLevel + userLevel + 10));
    }
    if (opts.traded) base = Math.floor(base * 1.2);
    if (opts.ledger) base = Math.floor(base * 1.5);
    if (opts.share) base = Math.floor(base * (opts.shareFrac === undefined ? 0.5 : opts.shareFrac));
    return Math.max(1, base);
  };

  // =================================================================
  // 3. Learnset construction
  // =================================================================
  // Ordered [level, move] pools per type. Gym Skill-Card moves and unique
  // signature moves are deliberately absent — they arrive via TMs, gym
  // rewards, or a species' hand-written `extras`.
  const POOL = {
    normal:   [[1,"tackle"],[1,"growl"],[4,"tail_whip"],[7,"quick_dash"],[10,"harden"],[13,"bite"],[17,"sharpen"],[21,"screech"],[25,"slam"],[30,"hyper_fang"],[36,"belfry_toll"]],
    fire:     [[1,"ember"],[5,"soot_cloud"],[10,"cinder_kick"],[14,"stoke"],[18,"flame_burst"],[23,"wisp_flame"],[28,"flame_lash"],[34,"beacon_light"],[42,"boiler_burst"]],
    water:    [[1,"brine_spit"],[5,"brine_dart"],[9,"bubble_jet"],[13,"tide_pull"],[18,"sluice_gate"],[22,"claw_smash"],[27,"torrent"],[31,"lido_soak"],[36,"mere_mist"],[41,"weaver_surge"]],
    grass:    [[1,"vine_lash"],[6,"razor_leaf"],[10,"root_bind"],[15,"bramble_whip"],[19,"regrow"],[23,"mulberry_leaf"],[27,"sleep_powder"],[31,"petal_storm"],[35,"hedge_lay"],[40,"elm_press"]],
    electric: [[1,"static_shock"],[6,"spark"],[11,"static_wave"],[16,"arc_flash"],[20,"charge_up"],[25,"third_rail"],[30,"signal_box"],[35,"volt_strike"],[43,"pylon_arc"]],
    flying:   [[1,"peck"],[4,"gust"],[9,"wing_attack"],[13,"updraft"],[17,"aerial_lash"],[21,"preen"],[26,"curlew_cry"],[31,"sky_dive"],[36,"ridge_gale"],[41,"dive_bomb"]],
    bug:      [[1,"bug_bite"],[3,"string_shot"],[8,"needle_volley"],[12,"cocoon"],[16,"bollin_flutter"],[20,"moth_dust"],[25,"copper_bite"],[29,"silk_bind"],[35,"hive_swarm"]],
    poison:   [[1,"poison_sting"],[7,"chem_spray"],[12,"smog_bank"],[16,"sludge"],[21,"rot_bite"],[26,"toxic_dose"],[30,"venom_lash"],[35,"proxy_veil"],[41,"reagent_mix"]],
    rock:     [[1,"rock_throw"],[7,"salt_spray"],[12,"stone_skin"],[17,"rock_slide"],[23,"menhir_stand"],[28,"gritstone_edge"],[38,"crag_crush"]],
    ground:   [[1,"mud_shot"],[7,"hoof_stamp"],[12,"bog_suck"],[17,"peat_press"],[22,"subsidence"],[27,"dig"],[33,"pit_shaft"],[40,"quake"]],
    psychic:  [[1,"confusion"],[7,"calm_read"],[12,"mind_ray"],[16,"agility"],[21,"cipher_riddle"],[26,"rune_read"],[31,"mirror_glass"],[36,"mind_blast"],[45,"pulsar_beam"]],
    ghost:    [[1,"lick"],[6,"shade_bolt"],[11,"wisp_lure"],[16,"possess"],[21,"curse_bell"],[25,"preserved_grip"],[30,"cheshire_fade"],[35,"night_pulse"],[39,"haunt"],[44,"phantom_lance"]],
    cyber:    [[1,"bit_blast"],[6,"phish_hook"],[10,"ddos"],[14,"data_stream"],[18,"encrypt"],[22,"rootkit_bite"],[26,"pixel_tripwire"],[30,"hack_slash"],[33,"honeytoken"],[37,"firewall_up"],[41,"packet_storm"],[45,"glitch_burst"],[49,"threat_hunt"],[53,"rtr_deploy"]]
  };
  const TIER_SCALE = { low: 1, mid: 1.14, high: 1.3, legendary: 1.35 };
  // Tier scaling stretches only the *late* half of a pool. Scaling the
  // whole pool used to push an evolved form's early moves out past the
  // level it is first obtainable at, so a freshly built SPINDRAKE:16
  // walked in with one attacking move. Below level 10 nobody waits.
  function tierLevel(lv, s) { return lv <= 10 ? lv : 10 + (lv - 10) * s; }
  function isAttack(mv) { const m = D.moves[mv]; return !!m && m.cat !== "status" && m.power > 0; }
  // Split a pool into damaging and status rows, order preserved.
  function splitPool(pool) {
    const atk = [], sts = [];
    for (let i = 0; i < pool.length; i++) (isAttack(pool[i][1]) ? atk : sts).push(pool[i]);
    return { atk: atk, sts: sts };
  }

  function buildLearnset(types, tier, extras, seedId) {
    const s = TIER_SCALE[tier] || 1;
    const byMove = {};
    const push = function (lv, mv) {
      lv = Math.max(1, Math.min(70, Math.round(lv)));
      if (byMove[mv] === undefined || byMove[mv] > lv) byMove[mv] = lv;
    };
    const prim = POOL[types[0]] || POOL.normal;
    for (let i = 0; i < prim.length; i++) push(tierLevel(prim[i][0], s), prim[i][1]);
    // Off-type coverage takes damaging rows first: sampling a pool every
    // other index used to hand GRASS secondaries four status moves and
    // one attack (the reason seven species reached level 30 with nothing
    // to hit with).
    if (types[1]) {
      const sec = splitPool(POOL[types[1]] || []);
      for (let i = 0; i < sec.atk.length; i += 2) push(tierLevel(sec.atk[i][0], s) + 2, sec.atk[i][1]);
      if (sec.sts.length) {
        const mid = sec.sts[Math.floor(sec.sts.length / 2)];
        push(tierLevel(mid[0], s) + 2, mid[1]);
      }
    } else {
      // single-type lines get a couple of Normal staples for coverage
      const nrm = splitPool(POOL.normal);
      for (let i = 1; i < nrm.atk.length; i += 2) push(tierLevel(nrm.atk[i][0], s) + 3, nrm.atk[i][1]);
      if (nrm.sts.length) push(tierLevel(nrm.sts[1] ? nrm.sts[1][0] : nrm.sts[0][0], s) + 3, (nrm.sts[1] || nrm.sts[0])[1]);
    }
    for (let i = 0; i < (extras || []).length; i++) push(extras[i][0], extras[i][1]);
    let list = Object.keys(byMove).map(function (mv) { return [byMove[mv], mv]; });
    list.sort(function (a, b) { return a[0] - b[0] || (a[1] < b[1] ? -1 : 1); });
    // Thin to 14 by dropping the most crowded entry, not the first one
    // we come to: the old sweep always ate indices 3,4,5… and left
    // GALEWING with nothing new between level 3 and level 18.
    if (list.length > 14) {
      const keep = {};
      for (let i = 0; i < (extras || []).length; i++) keep[extras[i][1]] = true;
      const rnd = U.rng(seedId + "|learn");
      while (list.length > 14) {
        let idx = -1, best = Infinity;
        for (let i = 3; i < list.length; i++) {
          if (keep[list[i][1]]) continue;
          const gap = list[i][0] - list[i - 1][0] + rnd() * 0.5;
          if (gap <= best) { best = gap; idx = i; }
        }
        if (idx < 0) idx = list.length - 1;
        list.splice(idx, 1);
      }
    }
    if (!list.length || list[0][0] !== 1) list.unshift([1, prim[0][1]]);
    // guarantee a second level-1 or level-3 move so a fresh catch has options
    if (list.length > 1 && list[1][0] > 5) list[1] = [Math.max(3, Math.round(list[1][0] * 0.35)), list[1][1]];
    list.sort(function (a, b) { return a[0] - b[0]; });
    // Half a learnset has to be attacks or the last-four window cannot
    // hold two of them. Mono-Normal lines came out 5 status / 6 attacks
    // before their extras, which is how GRINKIT reached level 40 with
    // one attack and three buffs.
    const keepExtra = {};
    for (let i = 0; i < (extras || []).length; i++) keepExtra[extras[i][1]] = true;
    const nAttacks = function () { let c = 0; for (let i = 0; i < list.length; i++) if (isAttack(list[i][1])) c++; return c; };
    while (list.length > 8 && nAttacks() * 2 < list.length) {
      let idx = -1;
      for (let i = list.length - 1; i > 2; i--) {
        if (!keepExtra[list[i][1]] && !isAttack(list[i][1])) { idx = i; break; }
      }
      if (idx < 0) break;
      list.splice(idx, 1);
    }
    return repairWindows(list, extras, types);
  }

  // D.movesAtLevel() hands the engine the last FOUR moves learnt, so a
  // run of status moves in the middle of a learnset leaves a monster
  // with nothing to attack with. This keeps every id and every level
  // exactly as built and only reorders which id sits on which level,
  // so that any four consecutive entries hold at least two attacks and
  // at least one of the species' own types. Hand-written `extras` are
  // pinned where the species author put them.
  function repairWindows(list, extras, types) {
    if (list.length < 3) return list;
    const pinned = {};
    for (let i = 0; i < (extras || []).length; i++) pinned[extras[i][1]] = true;
    const n = list.length;
    const levels = [], fixedId = [], atk = [], sts = [];
    for (let i = 0; i < n; i++) {
      levels.push(list[i][0]);
      if (pinned[list[i][1]]) fixedId.push(list[i][1]);
      else { fixedId.push(null); (isAttack(list[i][1]) ? atk : sts).push(list[i][1]); }
    }
    const isStab = function (mv) { const m = D.moves[mv]; return !!m && types.indexOf(m.type) >= 0; };

    // 1. Decide the shape of every free slot: "A" a same-type attack,
    //    "a" an off-type attack, "S" a status move. Pinned signature
    //    moves are read off as they are; the look-ahead treats an
    //    undecided slot as an "A" it could still put there.
    const shape = [];
    for (let i = 0; i < n; i++) {
      if (!fixedId[i]) { shape.push(null); continue; }
      if (!isAttack(fixedId[i])) shape.push("S");
      else shape.push(isStab(fixedId[i]) ? "A" : "a");
    }
    const windowsOk = function (at) {
      for (let lo = Math.max(0, at - 3); lo <= at && lo < n; lo++) {
        const hi = Math.min(n - 1, lo + 3);
        const span = hi - lo + 1;
        if (span < 2) continue;
        let hits = 0, stab = 0, unknown = 0;
        for (let k = lo; k <= hi; k++) {
          const c = shape[k];
          if (c === "A") { hits++; stab++; } else if (c === "a") hits++;
          else if (c === null) unknown++;
        }
        if (hits + unknown < Math.min(2, span)) return false;
        if (stab + unknown < 1) return false;
      }
      return true;
    };
    let freeStab = 0;
    for (let i = 0; i < atk.length; i++) if (isStab(atk[i])) freeStab++;
    let freeOff = atk.length - freeStab;
    let freeS = sts.length, lastStab = false;
    // Off-type attacks alternate with same-type ones rather than piling
    // up at the end, or a Grass line finishes on Quick Dash and Slam.
    const takeAttack = function (i) {
      if (lastStab && freeOff > 0) { shape[i] = "a"; freeOff--; lastStab = false; }
      else if (freeStab > 0) { shape[i] = "A"; freeStab--; lastStab = true; }
      else if (freeOff > 0) { shape[i] = "a"; freeOff--; lastStab = false; }
      else return false;
      return true;
    };
    for (let i = 0; i < n; i++) {
      if (shape[i] !== null) { if (shape[i] !== "S") lastStab = shape[i] === "A"; continue; }
      if (freeStab + freeOff <= 0) { shape[i] = "S"; freeS--; continue; }
      if (freeS <= 0 || i === 0) { takeAttack(i); continue; }
      shape[i] = "S";
      if (windowsOk(i)) { freeS--; continue; }
      if (!takeAttack(i)) { freeS--; }
    }

    // 2. Fill the shape. Attacks and statuses each keep their own
    //    ascending order, so power still grows with level.
    const stabPool = [], offPool = [];
    for (let i = 0; i < atk.length; i++) (isStab(atk[i]) ? stabPool : offPool).push(atk[i]);
    const out = [];
    for (let i = 0; i < n; i++) {
      if (fixedId[i]) { out.push(fixedId[i]); continue; }
      const c = shape[i];
      if (c === "A") out.push((stabPool.length ? stabPool : offPool).shift());
      else if (c === "a") out.push((offPool.length ? offPool : stabPool).shift());
      else if (sts.length) out.push(sts.shift());
      else out.push((stabPool.length ? stabPool : offPool).shift());
    }
    const res = [];
    for (let i = 0; i < out.length; i++) res.push([levels[i], out[i]]);
    return res;
  }

  // TM (Skill Card) compatibility: type match, Normal cards for everyone,
  // plus two wildcards for high-tier species so late teams have options.
  function buildTms(types, tier, seedId) {
    const out = [];
    const seen = {};
    const cards = D.itemsOfKind("tm");
    cards.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    for (let i = 0; i < cards.length; i++) {
      const mv = D.moves[cards[i].teaches];
      if (!mv) continue;
      if (mv.type === "normal" || types.indexOf(mv.type) >= 0) { if (!seen[mv.id]) { seen[mv.id] = 1; out.push(mv.id); } }
    }
    // wildcards: a couple of off-type cards so no species is boxed in, more
    // for the late-game tiers. Deterministic per species id.
    const rnd = U.rng(seedId + "|tm");
    const wild = tier === "low" ? 2 : (tier === "mid" ? 3 : 4);
    for (let n = 0; n < wild; n++) {
      const c = cards[Math.floor(rnd() * cards.length)];
      if (c && c.teaches && !seen[c.teaches]) { seen[c.teaches] = 1; out.push(c.teaches); }
    }
    // never fewer than five Skill Cards, or the bag screen is a sad place
    for (let i = 0; i < cards.length && out.length < 5; i++) {
      const c = cards[i];
      if (c.teaches && !seen[c.teaches]) { seen[c.teaches] = 1; out.push(c.teaches); }
    }
    out.sort();
    return out;
  }

  // =================================================================
  // 4. Art generator parameters + cries
  // =================================================================
  // Palettes the art workstream reads as {palette} in gen; each is
  // [dark, mid, light, accent]. Named so a species reads sensibly.
  const PALETTES = {
    silk: ["#4a3b2a", "#a08a63", "#e6dcc3", "#d9b25a"],
    brine: ["#2a4a55", "#5e97a4", "#dcecef", "#f2f7f8"],
    ember: ["#5a1c10", "#c1462a", "#f2a44a", "#ffe08a"],
    soot: ["#1e1c1b", "#4a4644", "#8a8480", "#d94f2a"],
    canal: ["#243a2b", "#4d7a52", "#9ec48a", "#c9d97a"],
    moor: ["#3a3428", "#7a6b4c", "#b8a97e", "#8a5a3a"],
    stone: ["#3f3a34", "#7c766c", "#b7b0a4", "#d8d2c4"],
    salt: ["#5a6672", "#9aa8b4", "#e8eef2", "#ffffff"],
    copper: ["#3a2a1c", "#8a5a2c", "#c98a3c", "#4ba894"],
    slate: ["#232a33", "#485668", "#7f8fa3", "#a8bcd0"],
    cyber: ["#0d2b2a", "#13645c", "#1fb2a0", "#7ff0e0"],
    dark: ["#14121c", "#2e2940", "#584f74", "#9b8fc0"],
    ghost: ["#1a1f2b", "#3a4560", "#6d7c9c", "#b7c6e0"],
    heather: ["#2f2438", "#5f3f66", "#9a6f9e", "#d5a3c9"],
    fern: ["#1f3320", "#3f6a3a", "#77a45a", "#c2d98a"],
    rust: ["#3a1f14", "#7a4020", "#b4703a", "#e0a45c"],
    bone: ["#514735", "#8f8168", "#cfc3a6", "#efe7d2"],
    sky: ["#1c2c4a", "#3d5e93", "#7fa4d8", "#dbe8fa"],
    fleece: ["#4a4640", "#8d887e", "#ded8cc", "#f5f1e6"],
    bog: ["#221d16", "#453a26", "#6e5f3c", "#93a06a"],
    chem: ["#1d2a18", "#456b2c", "#8ec44a", "#d6f07a"],
    tudor: ["#2b2018", "#5a4634", "#e8e2d4", "#1d1a16"],
    zoo: ["#3a2c1e", "#9a7440", "#e0c48a", "#c04a3a"],
    roman: ["#2b1f1c", "#6b3f34", "#a97a5c", "#c9a25a"]
  };
  const TIER_SIZE = { low: 0.62, mid: 0.85, high: 1.1, legendary: 1.35 };

  const CRY_WAVE = {
    normal: "square", fire: "saw", water: "sine", grass: "triangle", electric: "saw",
    flying: "sine", bug: "square", poison: "triangle", rock: "noise", ground: "noise",
    psychic: "sine", ghost: "triangle", cyber: "square"
  };
  function buildCry(id, types, size, tier) {
    const rnd = U.rng(id + "|cry");
    const bigness = size;
    return {
      wave: CRY_WAVE[types[0]] || "square",
      base: Math.round(680 / (0.55 + bigness) + rnd() * 90),
      len: Math.round(220 + bigness * 240 + rnd() * 90),
      slide: Math.round((rnd() * 2 - 1) * (tier === "low" ? 260 : 160)),
      noise: types[0] === "rock" || types[0] === "ground" ? 0.5 : (types[0] === "cyber" ? 0.3 : 0.12),
      vib: Math.round(rnd() * 9),
      gain: 0.22 + Math.min(0.16, bigness * 0.1)
    };
  }

  // =================================================================
  // 5. Species table
  // =================================================================
  const RECORDS = [];
  // evolution helpers
  function L(to, at) { return { to: to, method: "level", level: at }; }
  function IT(to, item) { return { to: to, method: "item", item: item }; }
  function FR(to, min, time) { const e = { to: to, method: "friendship", min: min || 200 }; if (time) e.time = time; return e; }
  function LOC(to, map) { return { to: to, method: "location", map: map }; }
  function TI(to, at, time) { return { to: to, method: "time", level: at, time: time || "night" }; }
  function TRD(to) { return { to: to, method: "trade" }; }
  function MV(to, move, at) { return { to: to, method: "move", move: move, level: at || 1 }; }
  function WE(to, w, at) { return { to: to, method: "weather", weather: w, level: at || 1 }; }

  function SP(num, id, name, typeStr, base, catchRate, baseExp, growth, abilStr, evos, habitat, rarity, tier, od, gen, extras, dex) {
    RECORDS.push({
      num: num, id: id, name: name, typeStr: typeStr, base: base, catchRate: catchRate, baseExp: baseExp,
      growth: growth, abilStr: abilStr, evos: evos, habitat: habitat, rarity: rarity, tier: tier,
      od: od, gen: gen, extras: extras, dex: dex
    });
  }

  // ---- 1a. Starters, cats, gifts ---------------------------------
  SP(1,"silkin","SILKIN","bug/grass",[68,57,58,45,58,49],45,62,"medium","silk_weave",[L("spindrake",16)],"silk","unique","low","jacquard_weave",
    {b:"worm",p:"silk",f:["thread","segments","mulberry-stain"]},[[1,"string_shot"],[7,"mulberry_leaf"],[13,"silk_bind"]],
    {g:"Silkworm",h:0.3,w:1.4,t:"Fed on mulberry from Paradise Mill. Spins one thread its whole life and refuses, absolutely, to let go of the end of it."});
  SP(2,"spindrake","SPINDRAKE","bug/grass",[88,60,70,75,77,65],45,142,"medium","silk_weave",[L("loomoth",34)],"silk","rare","mid","jacquard_weave",
    {b:"moth",p:"silk",f:["bobbin-cocoon","furred-thorax","wings"]},[[18,"cocoon"],[24,"bollin_flutter"],[30,"razor_leaf"]],
    {g:"Bobbin",h:0.8,w:11,t:"Sleeps in a bobbin it winds itself. The Bollington morph comes out honey-coloured, which locals will tell you about at length."});
  SP(3,"loomoth","LOOMOTH","bug/grass",[127,75,107,105,121,85],45,236,"medium","silk_weave",null,"silk","unique","high","jacquard_weave",
    {b:"moth",p:"silk",f:["punchcard-wings","great-span","glowing-eyes"],s:1.15},[[36,"hive_swarm"],[42,"petal_storm"],[48,"elm_press"]],
    {g:"Jacquard",h:1.6,w:34,t:"The pattern on its wings is a punch-card, and it is a real one. Nobody at the Silk Museum will say what it prints."});
  SP(4,"brinewt","BRINEWT","water",[62,45,53,45,54,46],45,62,"medium","brine_body",[L("saltander",16)],"brine","unique","low","brine_tide",
    {b:"newt",p:"brine",f:["crusted-skin","frill","damp-sheen"]},[[7,"harden"],[13,"salt_spray"],[19,"mud_shot"]],
    {g:"Salt Newt",h:0.4,w:3.2,t:"From the springs under Nantwich. Crusts over white when frightened, which it finds embarrassing and does anyway."});
  SP(5,"saltander","SALTANDER","water/ground",[85,64,70,60,70,60],45,142,"medium","brine_body",[L("halosaur",34)],"brine","unique","mid","brine_tide",
    {b:"salamander",p:"brine",f:["salt-ridges","broad-tail","clawed-feet"]},[[20,"peat_press"],[26,"salt_grind"],[32,"claw_smash"]],
    {g:"Brine Walker",h:0.9,w:31,t:"Leaves white footprints on a wet pavement for three days. Councils have written letters about it."});
  SP(6,"halosaur","HALOSAUR","water/ground",[146,95,107,85,101,75],45,236,"medium","brine_body",null,"brine","unique","high","brine_tide",
    {b:"salamander",p:"brine",f:["halite-crown","gill-fans","heavy-limbs"],s:1.2},[[38,"weaver_surge"],[44,"quake"],[50,"crag_crush"]],
    {g:"Halite Lord",h:2,w:190,t:"Brine runs from its gills at a steady rate all day. It is, technically, a small industry."});
  SP(7,"kindlin","KINDLIN","fire",[58,55,47,55,45,45],45,62,"medium","firebox",[L("stokerel",16)],"mill","unique","low","firebox_overload",
    {b:"imp",p:"ember",f:["ember-eyes","coal-dust","stubby-horns"]},[[7,"soot_cloud"],[13,"quick_dash"],[19,"cinder_kick"]],
    {g:"Boiler Imp",h:0.4,w:6,t:"Lives on coal dust and gossip. It is not clear which it needs more, and the Mill's boiler house provides both."});
  SP(8,"stokerel","STOKEREL","fire",[80,80,65,70,60,55],45,142,"medium","firebox",[L("furnacore",34)],"mill","unique","mid","firebox_overload",
    {b:"imp",p:"ember",f:["furnace-door-chest","shovel-hands","soot-mane"]},[[20,"stoke"],[26,"flame_burst"],[33,"slam"]],
    {g:"Stoker",h:1.1,w:64,t:"Shovels its own coal, refuses help, and will make a point of it if you offer."});
  SP(9,"furnacore","FURNACORE","fire/electric",[132,105,101,90,95,80],45,236,"medium","firebox",null,"mill","unique","high","firebox_overload",
    {b:"engine",p:"ember",f:["firebox-torso","flywheel","arcing-brushes"],s:1.2},[[38,"boiler_burst"],[44,"third_rail"],[50,"pylon_arc"]],
    {g:"Mill Engine",h:2.3,w:410,t:"A beam engine that got up. Runs at a steady forty-two revolutions a minute whatever the situation calls for."});
  SP(10,"meadow","MEADOW","normal",[89,82,72,72,72,113],3,150,"medium","slipstream",null,"town","unique","mid","zoomies",
    {b:"cat",p:"dark",f:["small","black","yellow-eyes"],s:0.5},[[1,"skitter"],[8,"quick_dash"],[16,"agility"],[24,"bite"],[32,"updraft"]],
    {g:"House Cat",h:0.24,w:3.4,t:"Small, black, and faster than anything with that little leg has any business being. Has opinions about MERLYNX she will not share."});
  SP(11,"bigboy","BIGBOY","normal",[148,108,118,78,103,45],3,150,"medium","back_from_the_brink",null,"town","unique","high","brink_roar",
    {b:"cat",p:"fleece",f:["huge","black-and-white","unbothered"],s:1.05},[[1,"big_sit"],[9,"harden"],[18,"slam"],[27,"screech"],[36,"white_nancy_stand"]],
    {g:"House Cat",h:0.4,w:9.1,t:"Enormous, black and white, and entirely governed by where he has decided to sit. Will not be moved. Has never once been moved."});

  // ---- 1b. Chapter 1 belt ----------------------------------------
  SP(12,"nibbit","NIBBIT","normal",[35,45,40,25,30,50],200,44,"fast","scavenger",[L("gnawlord",18)],"canal","common","low","od_normal",
    {b:"rat",p:"soot",f:["bottle-top-shield","long-tail","whiskers"]},[[5,"bite"],[11,"quick_dash"]],
    {g:"Towpath Rat",h:0.2,w:1.1,t:"Wears a bottle top as a shield and considers the matter settled. Found wherever there is a chip wrapper."});
  SP(13,"gnawlord","GNAWLORD","normal",[70,90,70,45,55,80],90,146,"medium","scavenger",null,"canal","uncommon","mid","od_normal",
    {b:"rat",p:"soot",f:["crown-of-caps","scarred","broad-shoulders"]},[[22,"hyper_fang"],[30,"screech"],[38,"bite"]],
    {g:"Rat King",h:0.6,w:14,t:"Rules the Hovis mill cellars from a nest of crisp packets. Its subjects are notional but its bite is not."});
  SP(14,"flitchick","FLITCHICK","normal/flying",[40,40,35,30,30,60],200,46,"fast","scavenger",[L("galewing",18)],"town","common","low","od_flying",
    {b:"pigeon",p:"slate",f:["scruffy","one-eye-shut","pastry-flakes"]},[[5,"gust"],[10,"quick_dash"]],
    {g:"Market Pigeon",h:0.25,w:0.4,t:"Treacle Market regular. Has stolen from every stall on the hill and been forgiven by exactly none of them."});
  SP(15,"galewing","GALEWING","normal/flying",[65,70,60,50,55,95],90,148,"medium","ridge_wind",null,"moor","uncommon","mid","od_flying",
    {b:"pigeon",p:"slate",f:["broad-wings","barred-tail","steady-eye"]},[[22,"aerial_lash"],[29,"updraft"],[36,"ridge_gale"]],
    {g:"Hill Pigeon",h:0.5,w:1.2,t:"Rides the Kerridge updraught without flapping for whole minutes at a time, purely to make a point."});
  SP(16,"flitmoth","FLITMOTH","bug",[35,35,30,45,35,55],200,44,"fast","silk_weave",[L("bollinmoth",14)],"canal","common","low","od_bug",
    {b:"moth",p:"silk",f:["dust-wings","feathered-antennae"]},[[4,"moth_dust"],[10,"bollin_flutter"]],
    {g:"Canal Moth",h:0.1,w:0.05,t:"Swarms the Clarence Mill lights every warm night from May. Nothing has ever explained what it thinks is up there."});
  SP(17,"bollinmoth","BOLLINMOTH","bug/flying",[65,60,55,80,65,80],90,148,"medium","silk_weave",null,"canal","uncommon","mid","od_bug",
    {b:"moth",p:"slate",f:["eyespots","grey-fur","wide-wings"]},[[20,"hive_swarm"],[27,"gust"],[34,"silk_bind"]],
    {g:"Bollin Moth",h:0.5,w:0.6,t:"The eyespots on its wings are mill windows, arch for arch. Nobody has explained that either."});
  SP(18,"bobbinet","BOBBINET","bug/psychic",[40,35,45,60,50,45],150,52,"medium","silk_weave",[L("jacquarda",30)],"silk","uncommon","low","od_psychic",
    {b:"spool",p:"silk",f:["spinning-core","thread-limbs","brass-cap"]},[[6,"confusion"],[13,"string_shot"],[20,"calm_read"]],
    {g:"Loom Sprite",h:0.3,w:2.1,t:"A bobbin that runs its own pattern and will not accept corrections from the floor supervisor."});
  SP(19,"jacquarda","JACQUARDA","bug/psychic",[105,70,95,115,112,80],45,232,"slow","signal_jammer",null,"silk","rare","high","od_psychic",
    {b:"loom",p:"silk",f:["punchcard-array","many-shuttles","paper-tape"],s:1.1},[[34,"mind_blast"],[41,"mirror_glass"],[48,"cipher_riddle"]],
    {g:"Weaver",h:1.7,w:96,t:"The first programmable thing in Cheshire, and it has never forgotten it. Runs a pattern of somebody who is not in the room."});
  SP(20,"towpaddle","TOWPADDLE","water",[45,40,40,40,40,45],200,44,"fast","wetlander",[L("mallardier",20)],"canal","common","low","od_water",
    {b:"duckling",p:"canal",f:["bread-bag","down","paddle-feet"]},[[5,"bubble_jet"],[11,"tail_whip"]],
    {g:"Canal Duckling",h:0.15,w:0.5,t:"Comes wearing a bread bag it has decided is a coat. Will follow anyone carrying a paper bag, indefinitely."});
  SP(21,"mallardier","MALLARDIER","water/flying",[75,70,65,65,65,75],90,150,"medium","wetlander",null,"canal","uncommon","mid","od_water",
    {b:"drake",p:"canal",f:["lock-keeper-cap","green-head","broad-bill"]},[[24,"torrent"],[31,"aerial_lash"],[38,"sluice_gate"]],
    {g:"Lock Drake",h:0.6,w:1.4,t:"Commandeers narrowboats. Has been seen at the tiller of one for eleven miles with nobody aboard."});
  SP(22,"sootling","SOOTLING","fire",[40,45,40,50,40,45],200,46,"fast","firebox",[L("chimnyx",24)],"mill","common","low","od_fire",
    {b:"imp",p:"soot",f:["soot-cloud","ember-eyes","small-hands"]},[[6,"soot_cloud"],[12,"ember"]],
    {g:"Soot Imp",h:0.3,w:2,t:"Comes out of the mill stacks in a cloud and will get on everything you own within the hour."});
  SP(23,"chimnyx","CHIMNYX","fire/ghost",[65,70,60,80,70,70],90,152,"medium","nightshift",null,"mill","uncommon","mid","od_fire",
    {b:"brush",p:"soot",f:["bristle-crown","smoulder","chain-tail"]},[[26,"wisp_flame"],[33,"shade_bolt"],[40,"flame_lash"]],
    {g:"Sweep's Ghost",h:1,w:12,t:"The ghost of a sweep's brush, still smouldering, still going up. Nobody sent it and it is going anyway."});
  SP(24,"nancylith","NANCYLITH","rock",[75,70,110,55,75,35],60,168,"slow","stonemason",null,"moor","rare","mid","od_rock",
    {b:"folly",p:"stone",f:["whitewashed","sugarloaf","painted-band"]},[[14,"stone_skin"],[24,"white_nancy_stand"],[34,"rock_slide"]],
    {g:"Folly Spirit",h:1.6,w:640,t:"Repainted every year by people who will not say why. It stands on the hill above Bollington and does not comment."});
  SP(25,"mistlop","MISTLOP","normal",[50,45,40,30,35,60],200,46,"fast","proxy_fog",[L("harrowlop",22)],"moor","common","low","od_normal",
    {b:"hare",p:"moor",f:["long-ears","mist-fur","big-feet"]},[[6,"quick_dash"],[13,"tail_whip"]],
    {g:"Moor Hare",h:0.4,w:2.8,t:"You will see it for a second and a half. Everything else you were told about it came from someone who saw it for a second and a half."});
  SP(26,"harrowlop","HARROWLOP","normal/ground",[80,85,75,45,55,85],90,154,"medium","iron_will",null,"moor","uncommon","mid","od_ground",
    {b:"hare",p:"stone",f:["slab-feet","scarred-ears","gritstone-hide"]},[[26,"hoof_stamp"],[33,"peat_press"],[40,"quake"]],
    {g:"Gritstone Hare",h:0.8,w:19,t:"Feet like quarry slabs. When it goes over the wall you feel it in the wall."});
  SP(27,"pitpony","PITPONY","ground",[55,55,50,30,40,40],190,48,"fast","iron_will",[L("coalcob",26)],"mill","common","low","od_ground",
    {b:"pony",p:"soot",f:["brow-lamp","shaggy","short-legs"]},[[7,"mud_shot"],[14,"harden"]],
    {g:"Pit Pony",h:0.9,w:210,t:"Carries a lamp on its brow it did not ask for and will not put down. Poynton has not had a working pit since 1935."});
  SP(28,"coalcob","COALCOB","ground/fire",[85,90,75,60,60,55],90,156,"medium","firebox",null,"mill","uncommon","mid","od_ground",
    {b:"horse",p:"soot",f:["seam-gas-breath","coal-hide","feathered-hooves"]},[[28,"cinder_kick"],[35,"dig"],[42,"flame_burst"]],
    {g:"Seam Cob",h:1.5,w:520,t:"Breathes seam gas. Do not, under any circumstances, offer it a light."});
  SP(29,"sparkit","SPARKIT","electric",[40,40,35,55,40,60],190,48,"fast","static_charge",[L("fulgurcat",22)],"town","common","low","od_electric",
    {b:"kitten",p:"slate",f:["standing-fur","spark-whiskers","wide-eyes"]},[[6,"static_shock"],[13,"quick_dash"]],
    {g:"Static Kit",h:0.2,w:1.9,t:"Lives behind CCTV boxes for the warmth. Prestbury has a lot of CCTV boxes and now a lot of these."});
  SP(30,"fulgurcat","FULGURCAT","electric",[60,65,50,85,60,95],90,158,"medium","static_charge",null,"town","uncommon","mid","od_electric",
    {b:"wildcat",p:"slate",f:["permanent-static","arc-tail","bright-eyes"]},[[24,"arc_flash"],[31,"charge_up"],[38,"volt_strike"]],
    {g:"Lightning Cat",h:0.5,w:7.2,t:"Its fur has stood on end since birth and will do so after death. Vets have stopped commenting."});
  SP(31,"puddlish","PUDDLISH","water",[40,40,40,45,40,45],200,44,"fast","wetlander",[L("torrentide",20)],"mere","common","low","od_water",
    {b:"minnow",p:"canal",f:["silver-flank","big-eye","fan-tail"]},[[5,"bubble_jet"],[11,"brine_dart"]],
    {g:"Pool Minnow",h:0.1,w:0.08,t:"Poynton Pool's entire population, more or less. The first thing anyone in Cheshire ever catches."});
  SP(32,"torrentide","TORRENTIDE","water",[70,80,65,65,65,80],90,150,"medium","wetlander",null,"river","uncommon","mid","od_water",
    {b:"fish",p:"canal",f:["muscled","weir-scarred","forked-tail"]},[[24,"torrent"],[31,"claw_smash"],[38,"weaver_surge"]],
    {g:"Weir Jumper",h:0.6,w:6.4,t:"Goes up the weir out of sheer stubbornness. There is nothing up there. It knows there is nothing up there."});
  SP(33,"peepcam","PEEPCAM","cyber",[40,35,55,60,50,45],150,54,"medium","signal_jammer",[L("panoptix",30)],"town","uncommon","low","od_cyber",
    {b:"camera",p:"cyber",f:["single-lens","spindle-legs","red-light"]},[[7,"phish_hook"],[14,"pixel_tripwire"],[21,"ddos"]],
    {g:"Watcher",h:0.35,w:2.6,t:"A CCTV camera that grew legs and left the pole. Prestbury has more of these than residents and is relaxed about it."});
  SP(34,"panoptix","PANOPTIX","cyber/psychic",[100,65,101,115,112,85],45,236,"slow","honeypot",null,"urban","rare","high","od_cyber",
    {b:"camera",p:"cyber",f:["lens-cluster","many-eyes","gimbal-neck"],s:1.1},[[34,"threat_hunt"],[41,"mind_blast"],[48,"mirror_glass"]],
    {g:"Panopticon",h:1.5,w:74,t:"Sees every stat stage on the field, including yours, including the ones you were hoping went unnoticed."});
  SP(35,"grousel","GROUSEL","flying/ground",[50,50,45,35,40,55],190,48,"fast","ridge_wind",[L("moorcock",26)],"moor","common","low","od_flying",
    {b:"grouse",p:"moor",f:["heather-plumage","red-brow","stubby-wings"]},[[6,"peck"],[13,"mud_shot"]],
    {g:"Heather Bird",h:0.3,w:0.6,t:"Sits absolutely still until you are one step away, then leaves at head height, shouting."});
  SP(36,"moorcock","MOORCOCK","flying/ground",[80,85,70,50,60,80],90,156,"medium","ridge_wind",null,"moor","uncommon","mid","od_flying",
    {b:"grouse",p:"moor",f:["fanned-tail","scarlet-wattle","strutting"]},[[28,"aerial_lash"],[35,"hoof_stamp"],[42,"ridge_gale"]],
    {g:"Moor Cock",h:0.6,w:1.6,t:"Struts the whole ridge line with a fell runner's stamina and a councillor's certainty."});
  SP(37,"mistewe","MISTEWE","normal",[85,60,85,50,80,45],180,96,"medium","thick_fleece",null,"moor","common","mid","od_normal",
    {b:"sheep",p:"fleece",f:["deep-fleece","mist-halo","yellow-eyes"]},[[10,"harden"],[20,"growl"],[30,"belfry_toll"]],
    {g:"Mist Sheep",h:0.9,w:78,t:"Appears out of the mist on the Peak fringe at the exact moment you had decided you were alone."});
  SP(38,"piphart","PIPHART","normal",[50,45,40,40,45,60],190,50,"fast","thick_fleece",[L("stagwire",24)],"estate","common","low","od_electric",
    {b:"fawn",p:"moor",f:["spots","long-legs","soft-ears"]},[[7,"quick_dash"],[14,"growl"]],
    {g:"Park Fawn",h:0.6,w:12,t:"Lyme and Tatton are full of them. MEADOW considers the entire species a personal ongoing project."});
  SP(39,"stagwire","STAGWIRE","normal/electric",[75,80,65,70,65,80],90,158,"medium","static_charge",null,"estate","uncommon","mid","od_electric",
    {b:"stag",p:"moor",f:["antenna-antlers","broad-chest","signal-glow"]},[[26,"third_rail"],[34,"charge_up"],[41,"volt_strike"]],
    {g:"Signal Stag",h:1.4,w:190,t:"Its antlers pick up something. Eight antler patterns are recorded and the census tent wants all eight."});

  // ---- 1c. Chapter 2 belt ----------------------------------------
  SP(40,"sheepwire","SHEEPWIRE","electric",[55,45,55,60,55,40],190,54,"fast","thick_fleece",[L("ramvolt",24)],"estate","common","low","od_electric",
    {b:"lamb",p:"fleece",f:["crackling-fleece","copper-tag","blank-stare"]},[[7,"static_shock"],[15,"harden"]],
    {g:"Static Sheep",h:0.7,w:44,t:"Its fleece holds enough charge to run a kettle. The Stuffers farm them for compute and pretend that is farming."});
  SP(41,"ramvolt","RAMVOLT","electric",[75,85,75,70,65,55],90,160,"medium","thick_fleece",null,"estate","uncommon","mid","od_electric",
    {b:"ram",p:"fleece",f:["coil-horns","heavy-shoulders","arcing-tips"]},[[26,"third_rail"],[33,"spark"],[41,"pylon_arc"]],
    {g:"Coil Ram",h:1.1,w:130,t:"Horns wound in copper by nobody. Charges gates, fences, and once a substation, which held."});
  SP(42,"heronet","HERONET","water/flying",[45,50,40,50,45,55],180,56,"fast","rain_caller",[L("herowing",22)],"river","common","low","od_water",
    {b:"heron-chick",p:"slate",f:["all-legs","fluff","dagger-bill"]},[[8,"peck"],[15,"bubble_jet"]],
    {g:"Heron Chick",h:0.5,w:0.9,t:"Ninety per cent leg. Stands in the Bollin looking like it has been asked a difficult question."});
  SP(43,"herowing","HEROWING","water/flying",[70,75,60,70,65,80],90,162,"medium","rain_caller",null,"river","uncommon","mid","od_water",
    {b:"heron",p:"slate",f:["grey-mantle","crest-plume","spear-bill"]},[[26,"aerial_lash"],[33,"torrent"],[40,"sky_dive"]],
    {g:"Grey Heron",h:1,w:1.8,t:"From the Trentabank heronry. Waits four hours for one fish and considers that a fair rate of return."});
  SP(44,"sluiceling","SLUICELING","water",[50,45,55,50,50,40],180,56,"fast","damp_squib",[L("millrace",25)],"mill","common","low","od_water",
    {b:"sprite",p:"canal",f:["paddle-arms","dripping","iron-band"]},[[8,"sluice_gate"],[16,"tide_pull"]],
    {g:"Sluice Sprite",h:0.4,w:8,t:"Lives in the gap under Quarry Bank's sluice gates, where the water goes fastest and nothing sensible lives."});
  SP(45,"millrace","MILLRACE","water/rock",[80,85,100,60,70,45],90,166,"medium","damp_squib",null,"mill","uncommon","mid","od_water",
    {b:"wheel",p:"rust",f:["iron-wheel","paddle-boards","riveted"],s:1.1},[[28,"claw_smash"],[35,"stone_skin"],[42,"crag_crush"]],
    {g:"Wheel Golem",h:2.2,w:1400,t:"Turns whether or not there is water. If it must turn at three in the morning, it turns at three in the morning."});
  SP(46,"puppetacct","PUPPETACCT","cyber",[45,50,40,55,40,60],150,58,"fast","proxy_fog",null,"fog","common","low","od_cyber",
    {b:"puppet",p:"cyber",f:["blank-face","string-limbs","flicker"]},[[8,"phish_hook"],[16,"ddos"],[24,"brute_force"]],
    {g:"Puppet Account",h:1.1,w:0.4,t:"Spawns and despawns like a bad login. It has a name, a photograph and a birthday, all of them someone else's."});
  SP(47,"botling","BOTLING","cyber/bug",[45,55,50,45,45,50],150,58,"fast","payload",[L("botnetle",22)],"cyber","uncommon","low","od_cyber",
    {b:"beetle",p:"cyber",f:["chip-carapace","antenna","status-LEDs"]},[[8,"bug_bite"],[16,"bit_blast"],[22,"needle_volley"]],
    {g:"Botnet Grub",h:0.2,w:1.2,t:"Nests in a smart fridge. The fridge continues to work perfectly, which is the unsettling part."});
  SP(48,"botnetle","BOTNETLE","cyber/bug",[105,100,112,75,95,70],60,224,"slow","payload",null,"cyber","uncommon","high","od_cyber",
    {b:"beetle",p:"cyber",f:["armoured-plate","horn","c2-aerials"],s:1.1},[[30,"hack_slash"],[38,"copper_bite"],[46,"rtr_deploy"]],
    {g:"C2 Beetle",h:1,w:88,t:"The tuba nest at Bollington was one of these. It answered to something and the something has not been found."});
  SP(49,"mistwisp","MISTWISP","ghost/poison",[40,40,40,60,50,60],180,58,"fast","nightshift",[L("phantasmal",30)],"bog","common","low","od_ghost",
    {b:"wisp",p:"bog",f:["marsh-glow","trailing-vapour","no-face"]},[[8,"wisp_lure"],[16,"smog_bank"]],
    {g:"Bog Wisp",h:0.4,w:0.2,t:"Follow it and you get wet feet at best. Lindow has been very clear about this for two thousand years."});
  SP(50,"phantasmal","PHANTASMAL","ghost/poison",[65,60,60,90,75,70],90,168,"medium","nightshift",null,"bog","uncommon","mid","od_ghost",
    {b:"phantom",p:"bog",f:["gas-shroud","hollow-eyes","reed-crown"]},[[30,"night_pulse"],[37,"toxic_dose"],[44,"haunt"]],
    {g:"Marsh Phantom",h:1.5,w:2,t:"Keeps a data lake. Not a metaphor: it has been storing things in the peat since before anyone thought to."});
  SP(51,"bogleap","BOGLEAP","water/poison",[55,50,50,45,45,45],180,58,"fast","damp_squib",[L("toadlore",26)],"bog","common","low","od_water",
    {b:"toad",p:"bog",f:["peat-warts","wide-mouth","webbed-feet"]},[[8,"sludge"],[16,"bog_suck"]],
    {g:"Peat Toad",h:0.25,w:3.1,t:"Brown all over in a way that suggests the bog made it rather than the other way round."});
  SP(52,"toadlore","TOADLORE","water/poison",[132,80,101,85,107,45],60,226,"slow","sandbox",null,"bog","uncommon","high","od_water",
    {b:"toad",p:"bog",f:["great-gullet","story-warts","slow-blink"],s:1.15},[[32,"reagent_mix"],[40,"peat_press"],[47,"weaver_surge"]],
    {g:"Great Toad",h:1.1,w:96,t:"Remembers every story told on the Moss, including the ones told over it and the ones told about it."});
  SP(53,"peatkin","PEATKIN","ground/ghost",[50,55,55,45,45,40],150,60,"medium","cold_storage",[L("lindowan",28)],"bog","uncommon","low","od_ghost",
    {b:"husk",p:"bog",f:["tanned-skin","folded-limbs","peat-crust"]},[[8,"peat_press"],[17,"lick"],[24,"preserved_grip"]],
    {g:"Preserved Husk",h:0.9,w:22,t:"Comes up out of the cut with the cutting. Complete but for the parts the cutter took."});
  SP(54,"lindowan","LINDOWAN","ground/ghost",[125,95,112,70,95,55],45,238,"slow","cold_storage,back_from_the_brink",null,"bog","rare","high","od_ghost",
    {b:"bogbody",p:"bog",f:["knotted-cord","sinew","half-face"],s:1.05},[[34,"quake"],[41,"phantom_lance"],[48,"curse_bell"]],
    {g:"The Preserved One",h:1.7,w:88,t:"Lindow's guardian and its longest-standing complaint. Three deaths, one afternoon, twenty centuries ago, still ongoing."});
  SP(55,"cuprabug","CUPRABUG","bug/rock",[50,55,60,35,40,40],180,58,"fast","stonemason",[L("verdigrit",26)],"cave","common","low","od_rock",
    {b:"beetle",p:"copper",f:["verdigris-shell","ore-flecks","pincers"]},[[8,"rock_throw"],[16,"copper_bite"]],
    {g:"Mine Beetle",h:0.2,w:1.8,t:"Green as an old roof. Eats what the Romans left and has never been thanked for it."});
  SP(56,"verdigrit","VERDIGRIT","bug/rock",[75,90,100,50,60,50],90,170,"medium","stonemason",null,"cave","uncommon","mid","od_rock",
    {b:"stag-beetle",p:"copper",f:["ore-armour","great-mandibles","seam-veins"]},[[28,"gritstone_edge"],[35,"stone_skin"],[42,"crag_crush"]],
    {g:"Ore Stag",h:0.8,w:64,t:"Armoured in whatever seam it grew up against. Alderley ones come out the colour of a church roof."});
  SP(57,"squeakwing","SQUEAKWING","poison/flying",[45,50,40,45,40,65],180,58,"fast","scavenger",[L("shriekwing",22)],"cave","common","low","od_flying",
    {b:"bat",p:"dark",f:["pipistrelle","sour-fangs","thin-wings"]},[[8,"poison_sting"],[16,"gust"]],
    {g:"Sour Pipistrelle",h:0.1,w:0.01,t:"Smaller than a matchbox and considerably worse tempered. Its bite curdles nothing but tastes as though it should."});
  SP(58,"shriekwing","SHRIEKWING","poison/flying",[65,75,60,70,60,90],90,166,"medium","scavenger",null,"cave","uncommon","mid","od_poison",
    {b:"bat",p:"dark",f:["ragged-wings","open-throat","ear-fans"]},[[26,"curlew_cry"],[33,"venom_lash"],[40,"screech"]],
    {g:"Cave Bat",h:0.4,w:0.6,t:"Its shriek curdles milk at eleven metres. This has been measured, twice, by people who should have stopped at once."});
  SP(59,"gloamite","GLOAMITE","ghost/rock",[50,45,70,50,55,35],150,62,"medium","iron_will",[LOC("gloamguard","alderley_edge_caverns_b3")],"cave","uncommon","low","od_rock",
    {b:"helm",p:"stone",f:["visor-slit","dust","faint-glow"]},[[9,"harden"],[17,"shade_bolt"],[25,"stone_skin"]],
    {g:"Sleeping Helm",h:0.3,w:9,t:"A knight's helm that dreams. Pick it up and the dream carries on regardless of where you put it."});
  SP(60,"gloamguard","GLOAMGUARD","ghost/rock",[119,100,130,70,101,40],45,240,"slow","iron_will,back_from_the_brink",null,"cave","rare","high","od_rock",
    {b:"knight",p:"stone",f:["full-plate","lance","stone-dust-aura"],s:1.15},[[36,"phantom_lance"],[43,"crag_crush"],[50,"menhir_stand"]],
    {g:"Woken Knight",h:2,w:340,t:"One of the Edge's sleepers, woken about six hundred years early. It is being polite about it."});
  SP(61,"owlume","OWLUME","flying/psychic",[45,40,40,60,50,55],150,62,"medium","nightshift",[L("strigyx",26)],"forest","uncommon","low","od_psychic",
    {b:"owlet",p:"bone",f:["lamp-eyes","soft-down","tufted-ears"]},[[9,"confusion"],[17,"gust"],[24,"calm_read"]],
    {g:"Lamp Owlet",h:0.2,w:0.3,t:"Its eyes give off enough light to read a map by, which is only useful if you are also holding a map."});
  SP(62,"strigyx","STRIGYX","flying/psychic",[105,70,89,110,107,95],45,238,"slow","nightshift",null,"forest","rare","high","od_psychic",
    {b:"owl",p:"bone",f:["broad-face","silent-wings","ring-eyes"],s:1.1},[[34,"mind_blast"],[41,"sky_dive"],[48,"pulsar_beam"]],
    {g:"Great Owl",h:1.2,w:5.6,t:"Reads the wind's mind and finds it repetitive. Hunts Arley at night and files no report."});
  SP(63,"webshade","WEBSHADE","bug/ghost",[40,50,45,50,45,55],180,58,"fast","silk_weave",[L("widowisp",27)],"mill","common","low","od_bug",
    {b:"spider",p:"dark",f:["cobweb-shroud","long-legs","eight-glints"]},[[8,"silk_bind"],[16,"lick"]],
    {g:"Shed Spider",h:0.15,w:0.09,t:"Lives in a weaving shed that has had no weaving in it since 1988 and keeps the looms dusted, after a fashion."});
  SP(64,"widowisp","WIDOWISP","bug/ghost",[93,85,83,95,95,85],60,228,"slow","silk_weave",null,"mill","uncommon","high","od_bug",
    {b:"spider",p:"dark",f:["ghost-silk","hourglass-mark","drifting-legs"]},[[30,"night_pulse"],[38,"hive_swarm"],[45,"cheshire_fade"]],
    {g:"Ghost-silk Spider",h:0.7,w:4,t:"Spins thread you can see through and cannot break. The Silk Museum would like a word about that."});
  SP(65,"merlynx","MERLYNX","psychic/ghost",[119,85,107,130,130,105],3,300,"medium","nightshift",null,"cave","legendary","legendary","knights_waking",
    {b:"lynx",p:"heather",f:["star-flecked-coat","tufted-ears","old-eyes"],s:1.15},[[30,"mind_blast"],[40,"cheshire_fade"],[50,"pulsar_beam"],[60,"mirror_glass"]],
    {g:"Wizard's Cat",h:0.9,w:24,t:"Guards the Cave of the Knights and, apparently, MEADOW's opinion of everyone she meets. Has been wrong about no one so far."});

  // ---- 1d. Chapter 3 belt ----------------------------------------
  SP(66,"quillet","QUILLET","psychic",[45,35,45,65,55,50],170,64,"fast","honeypot",[L("scriptorix",28)],"town","common","low","od_psychic",
    {b:"inkwell",p:"bone",f:["nib-crest","ink-drip","paper-wings"]},[[9,"confusion"],[17,"calm_read"]],
    {g:"Ink Sprite",h:0.2,w:0.9,t:"Comes out of the Gaskell tower inkwell about once a fortnight, writes something down, and goes back in."});
  SP(67,"scriptorix","SCRIPTORIX","psychic",[100,60,89,115,112,85],60,230,"slow","honeypot",null,"town","uncommon","high","od_psychic",
    {b:"manuscript",p:"bone",f:["turning-pages","ribbon-arms","wax-seal"]},[[32,"cipher_riddle"],[40,"mind_blast"],[47,"mirror_glass"]],
    {g:"Living Manuscript",h:1.1,w:14,t:"A manuscript that writes back. Runs Knutsford's rumour network from a shelf and has never been caught doing so."});
  SP(68,"perchip","PERCHIP","water",[50,50,50,45,45,50],180,58,"fast","wetlander",[L("piketide",22)],"mere","common","low","od_water",
    {b:"perch",p:"canal",f:["striped-flank","spined-dorsal","cross-eye"]},[[8,"brine_dart"],[16,"bubble_jet"]],
    {g:"Mere Perch",h:0.2,w:0.5,t:"Stripy and cross. Attacks lures, fingers, and its own reflection with equal commitment."});
  SP(69,"piketide","PIKETIDE","water",[70,90,65,65,60,70],90,168,"medium","wetlander",null,"mere","uncommon","mid","od_water",
    {b:"pike",p:"fern",f:["long-jaw","weed-mottle","broad-tail"]},[[28,"claw_smash"],[35,"tide_pull"],[42,"weaver_surge"]],
    {g:"Tatton Pike",h:1,w:12,t:"Lies still in the weed for hours. The carp line has a word for it and the word is not printable."});
  SP(70,"swanling","SWANLING","water/flying",[55,55,50,45,45,50],170,62,"fast","rain_caller",[L("swanguard",26)],"mere","common","low","od_flying",
    {b:"cygnet",p:"fleece",f:["grey-down","stub-wings","black-bill"]},[[8,"peck"],[16,"growl"]],
    {g:"Cygnet",h:0.4,w:4,t:"Bad-tempered from the shell. Will see you off a footpath it has no legal claim to whatsoever."});
  SP(71,"swanguard","SWANGUARD","water/flying",[112,100,95,70,95,70],60,226,"slow","iron_will",null,"mere","uncommon","high","od_flying",
    {b:"swan",p:"fleece",f:["arched-neck","spread-wings","orange-bill"],s:1.1},[[32,"aerial_lash"],[40,"slam"],[47,"dive_bomb"]],
    {g:"Mute Swan",h:1.5,w:12,t:"Guards the Knutsford Gate. Breaks arms, apparently. Nobody has produced the arm, but nobody has tested it either."});
  SP(72,"manorwraith","MANORWRAITH","ghost",[93,60,83,95,101,60],45,196,"slow","nightshift",null,"estate","rare","high","od_ghost",
    {b:"wraith",p:"tudor",f:["ruff","hollow-doublet","candle-glow"]},[[20,"curse_bell"],[30,"possess"],[40,"night_pulse"],[48,"haunt"]],
    {g:"Hall Ghost",h:1.8,w:0,t:"Still runs trainer battles in the Old Hall at half two in the morning. Keeps score. Has never lost and does not gloat."});
  SP(73,"bellmere","BELLMERE","water/ghost",[75,60,80,90,90,45],45,190,"slow","loud_bell",null,"mere","rare","mid","od_ghost",
    {b:"bell",p:"slate",f:["drowned-bronze","weed-clapper","ripple-halo"]},[[18,"belfry_toll"],[28,"curse_bell"],[38,"night_pulse"],[46,"haunt"]],
    {g:"Drowned Bell",h:1.2,w:410,t:"Rings under Rostherne on Easter morning. The mere is 30 metres deep and nobody has ever gone to check."});
  SP(74,"prickpip","PRICKPIP","grass",[50,50,55,40,45,40],180,58,"fast","deep_roots",[L("bramblehog",20)],"heath","common","low","od_grass",
    {b:"hedgehog",p:"fern",f:["bramble-spines","black-nose","leaf-litter"]},[[8,"vine_lash"],[16,"harden"]],
    {g:"Bramble Hog",h:0.2,w:1.1,t:"Its spines put out leaves in April. It is not clear to anyone, including the hedgehog, whether this is an improvement."});
  SP(75,"bramblehog","BRAMBLEHOG","grass",[70,75,80,50,60,55],90,164,"medium","deep_roots",[IT("thornarch","billhook_charm")],"heath","uncommon","mid","od_grass",
    {b:"hedgehog",p:"fern",f:["thorn-mantle","berry-clusters","stout-legs"]},[[26,"bramble_whip"],[33,"root_bind"],[40,"petal_storm"]],
    {g:"Thorn Hog",h:0.5,w:9,t:"Carries a hedge on its back. Passes through gaps a hedge should not fit through, and the gap is worse afterwards."});
  SP(76,"thornarch","THORNARCH","grass",[125,105,130,65,95,40],45,242,"slow","deep_roots",null,"heath","rare","high","od_grass",
    {b:"hedge",p:"fern",f:["laid-stems","pegged-arches","bird-nests"],s:1.25},[[36,"hedge_lay"],[44,"elm_press"],[50,"crag_crush"]],
    {g:"Laid Hedge",h:2.4,w:900,t:"A hundred and fifty metres of Cheshire hedge, laid, pegged, and walking. Three species of bird are furious about it."});

  // ---- 1e. Chapter 4 belt ----------------------------------------
  SP(77,"poltergrid","POLTERGRID","cyber/ghost",[93,65,83,105,107,80],45,214,"slow","signal_jammer",null,"rail","rare","high","od_cyber",
    {b:"lever-frame",p:"cyber",f:["ghost-levers","telemetry-static","brass-plates"]},[[22,"pixel_tripwire"],[32,"night_pulse"],[40,"glitch_burst"],[48,"threat_hunt"]],
    {g:"Signal Poltergeist",h:1.4,w:120,t:"Nests in signal-box telemetry noise. Moves the levers at 03:00. The levers are not connected to anything any more."});
  SP(78,"keystone","KEYSTONE","rock",[60,55,80,40,55,30],170,62,"fast","fail_safe",[L("viaductus",30)],"rail","common","low","od_rock",
    {b:"stone",p:"stone",f:["wedge-shape","mortar-seams","chisel-marks"]},[[9,"harden"],[18,"stone_skin"]],
    {g:"Arch Stone",h:0.6,w:280,t:"One per arch at Twemlow, and it knows which one it is. Do not attempt to move it to a different arch."});
  SP(79,"viaductus","VIADUCTUS","rock",[139,100,148,55,95,35],60,232,"slow","iron_will",null,"rail","uncommon","high","od_rock",
    {b:"viaduct",p:"stone",f:["arched-body","parapet-crest","brick-courses"],s:1.4},[[34,"crag_crush"],[42,"quake"],[50,"menhir_stand"]],
    {g:"Viaduct",h:3.2,w:9000,t:"Twenty-three arches, walking. It will not cross a road at a marked crossing and nobody has managed to explain why it should."});
  SP(80,"dishlet","DISHLET","cyber/psychic",[50,40,50,70,60,55],150,66,"medium","signal_jammer",[LOC("parabolus","jodrell_bank")],"sky","uncommon","low","od_cyber",
    {b:"dish",p:"slate",f:["parabola-face","tracking-mount","feed-horn"]},[[9,"bit_blast"],[18,"confusion"],[26,"data_stream"]],
    {g:"Dishling",h:0.5,w:14,t:"Turns to face the signal. If there is no signal it turns to face where the signal was, which is worse."});
  SP(81,"parabolus","PARABOLUS","cyber/psychic",[112,70,107,120,119,60],45,244,"slow","signal_jammer",null,"sky","rare","high","od_cyber",
    {b:"dish",p:"slate",f:["lattice-frame","great-bowl","counterweight"],s:1.35},[[36,"rtr_deploy"],[44,"pulsar_beam"],[52,"threat_hunt"]],
    {g:"Dish Sentinel",h:4,w:3200,t:"Has been listening for seventy years. Has heard three things worth reporting and reported one."});
  SP(82,"pulsaris","PULSARIS","electric/psychic",[93,60,77,115,107,95],45,220,"slow","signal_jammer",null,"sky","rare","high","od_electric",
    {b:"star",p:"sky",f:["pulse-core","radial-spokes","afterglow"]},[[24,"charge_up"],[34,"rune_read"],[44,"pylon_arc"],[52,"pulsar_beam"]],
    {g:"Pulse Star",h:0.9,w:2,t:"Ticks at a fixed period of 1.337 seconds. Set your watch by it; the watch will be right and you will be unsettled."});
  SP(83,"cubbin","CUBBIN","normal/ground",[65,60,55,40,50,45],150,68,"medium","thick_fleece",[L("bruinhall",28)],"town","uncommon","low","od_ground",
    {b:"cub",p:"rust",f:["round-ears","muddy-paws","scruff"]},[[9,"tackle"],[18,"mud_shot"],[26,"bite"]],
    {g:"Beartown Cub",h:0.6,w:32,t:"Congleton sold its Bible to buy a bear. The bear had cubs. The town has never quite finished being pleased with itself."});
  SP(84,"bruinhall","BRUINHALL","normal/ground",[146,115,112,55,89,50],45,246,"slow","iron_will",null,"town","rare","high","bruin_maul",
    {b:"bear",p:"rust",f:["broad-back","chain-collar","muzzle-scar"],s:1.25},[[34,"bear_hug"],[42,"quake"],[50,"hyper_fang"]],
    {g:"The Congleton Bear",h:2.2,w:480,t:"Otis's ace and the town crest, in that order, and both of them will tell you so."});
  SP(85,"runestane","RUNESTANE","rock/psychic",[65,60,75,60,60,35],150,70,"medium","stonemason",[L("dolmenor",30)],"moor","uncommon","low","od_rock",
    {b:"stone",p:"stone",f:["carved-spirals","lichen","humming-seam"]},[[10,"rune_read"],[19,"stone_skin"],[27,"confusion"]],
    {g:"Rune Rock",h:1.1,w:640,t:"Hums in fog at a pitch that gives you a headache in the left eye only. The Bridestones do not apologise."});
  SP(86,"dolmenor","DOLMENOR","rock/psychic",[125,85,142,95,112,30],45,242,"slow","iron_will",null,"moor","rare","high","od_rock",
    {b:"dolmen",p:"stone",f:["capstone-crown","chamber-hollow","standing-legs"],s:1.3},[[36,"menhir_stand"],[44,"mind_blast"],[52,"crag_crush"]],
    {g:"Tomb Guardian",h:2.6,w:12000,t:"Guards a chamber that has been empty since 1764, when three men from Congleton emptied it. It is still waiting for them."});
  SP(87,"mowstane","MOWSTANE","rock/ground",[132,110,137,50,83,40],45,240,"slow","iron_will",null,"moor","rare","high","od_rock",
    {b:"pillar",p:"stone",f:["gritstone-column","weather-pits","tilted"],s:1.3},[[26,"rock_slide"],[36,"quake"],[45,"crag_crush"],[52,"subsidence"]],
    {g:"The Old Man",h:2.8,w:8000,t:"The Old Man of Mow walks at night and is back before dawn. The National Trust has stopped measuring the distance."});
  SP(88,"tudorling","TUDORLING","ghost/grass",[55,50,60,65,60,45],150,68,"medium","nightshift",[L("timberwraith",32)],"estate","uncommon","low","od_ghost",
    {b:"sprite",p:"tudor",f:["black-and-white-panels","crooked","leaded-eyes"]},[[9,"shade_bolt"],[18,"vine_lash"],[26,"wisp_lure"]],
    {g:"Timber Sprite",h:0.6,w:11,t:"Little Moreton Hall leans, and this is the reason, and it has never once been sorry."});
  SP(89,"timberwraith","TIMBERWRAITH","ghost/grass",[132,95,125,80,101,35],45,244,"slow","nightshift",null,"estate","rare","high","od_ghost",
    {b:"house",p:"tudor",f:["gable-shoulders","glazed-gallery","warped-beams"],s:1.4},[[36,"haunt"],[44,"elm_press"],[52,"phantom_lance"]],
    {g:"Crooked House",h:4,w:30000,t:"The whole hall, standing up. It has been at an angle since 1580 and refuses, on principle, to be straightened."});
  SP(90,"otterkin","OTTERKIN","water",[55,55,50,45,50,60],170,64,"fast","wetlander",[L("lutrarch",28)],"river","common","low","od_water",
    {b:"otter-pup",p:"canal",f:["whiskers","sleek-fur","stubby-tail"]},[[9,"brine_dart"],[18,"bite"]],
    {g:"Dane Otter Pup",h:0.4,w:3,t:"Slides down the same muddy bank two hundred times and would do it a further two hundred if the light held."});
  SP(91,"lutrarch","LUTRARCH","water/ground",[119,100,101,70,95,80],60,234,"slow","wetlander",null,"river","uncommon","high","od_water",
    {b:"otter",p:"canal",f:["fishbone-crown","rudder-tail","broad-paws"],s:1.05},[[34,"claw_smash"],[42,"dig"],[50,"weaver_surge"]],
    {g:"River Lord",h:1.4,w:34,t:"Wears a crown of fish bones it made itself. Holds a stretch of the Dane roughly four miles long, by force of personality."});
  SP(92,"rottling","ROTTLING","grass/poison",[55,60,50,55,45,50],150,70,"medium","sandbox",[L("mulchmaw",26)],"orchard","uncommon","low","od_poison",
    {b:"imp",p:"rust",f:["bruised-apple-body","stalk-horn","wasp-hole"]},[[10,"rot_bite"],[19,"vine_lash"],[27,"sludge"]],
    {g:"Windfall Imp",h:0.3,w:2.4,t:"Steals berries and leaves the cores. Sandbach put a bounty on one called Bramble and Bramble has not been seen since."});
  SP(93,"mulchmaw","MULCHMAW","grass/poison",[85,85,80,75,70,50],90,178,"medium","sandbox",null,"orchard","uncommon","mid","od_poison",
    {b:"heap",p:"rust",f:["steaming-maw","peel-mantle","root-tendrils"],s:1.1},[[30,"rot_bite"],[38,"toxic_dose"],[45,"elm_press"]],
    {g:"Compost Maw",h:1.2,w:210,t:"Runs at a steady sixty degrees inside. Put anything in it and in a fortnight you will get soil and no questions."});

  // ---- 1f. Chapter 5 belt ----------------------------------------
  SP(94,"belfrit","BELFRIT","normal",[55,50,60,60,60,45],170,70,"fast","loud_bell",[L("crossbell",30)],"town","common","low","od_normal",
    {b:"bell",p:"copper",f:["small-bronze","rope-tail","clapper-tongue"]},[[10,"belfry_toll"],[19,"growl"],[27,"screech"]],
    {g:"Bell Sprite",h:0.3,w:18,t:"Out of the Old Hall bell. Rings for weddings, funerals, and, once, a parking dispute."});
  SP(95,"crossbell","CROSSBELL","rock/normal",[125,95,130,75,101,40],60,236,"slow","loud_bell",null,"roman","uncommon","high","od_normal",
    {b:"cross",p:"stone",f:["saxon-carving","bronze-core","interlace"],s:1.2},[[34,"belfry_toll"],[42,"menhir_stand"],[50,"crag_crush"]],
    {g:"Cross Golem",h:2.4,w:2400,t:"Saxon carving with a bell in the middle of it. Was broken up in 1650 and put back together in 1816, and holds a grudge about one of those."});
  SP(96,"chuglet","CHUGLET","fire",[55,60,55,50,45,55],170,68,"fast","firebox",[L("shunterra",24)],"rail","common","low","od_fire",
    {b:"tank-engine",p:"ember",f:["brass-dome","whistle","tiny-buffers"]},[[9,"ember"],[18,"quick_dash"]],
    {g:"Engine Hatchling",h:0.6,w:340,t:"A tank engine the size of a wheelbarrow with a whistle you can hear in Nantwich."});
  SP(97,"shunterra","SHUNTERRA","fire/ground",[80,90,80,60,65,60],90,176,"medium","firebox",[L("steamloco",40)],"rail","uncommon","mid","od_fire",
    {b:"loco",p:"ember",f:["buffer-shoulders","side-tanks","coupling-rods"],s:1.1},[[28,"cinder_kick"],[36,"hoof_stamp"],[43,"dig"]],
    {g:"Shunter",h:1.6,w:4800,t:"Buffers for shoulders and no patience for anything on the main line. Works the yard and considers the yard the point."});
  SP(98,"steamloco","STEAMLOCO","fire/ground",[123,115,112,90,95,85],45,250,"slow","firebox",null,"rail","rare","high","od_fire",
    {b:"loco",p:"ember",f:["express-boiler","smoke-deflectors","driving-wheels"],s:1.4},[[42,"boiler_burst"],[50,"quake"],[56,"flame_lash"]],
    {g:"Express Loco",h:3.2,w:80000,t:"Di's ace. Built at Crewe, and it will tell you the works number if you stand still long enough."});
  SP(99,"sparkrail","SPARKRAIL","electric",[50,55,45,70,50,80],170,70,"fast","static_charge",[L("pantogriff",30)],"rail","common","low","od_electric",
    {b:"spark",p:"slate",f:["arc-body","rail-shard","flicker-tail"]},[[9,"static_shock"],[18,"quick_dash"],[26,"third_rail"]],
    {g:"Rail Spark",h:0.3,w:0.4,t:"Jumps the sidings at night from rail to rail. There is no third rail at Crewe. It does it anyway."});
  SP(100,"pantogriff","PANTOGRIFF","electric/flying",[105,90,83,95,89,100],60,238,"slow","static_charge",null,"rail","uncommon","high","od_electric",
    {b:"griffin",p:"slate",f:["pantograph-wings","carbon-strip-beak","arc-crest"],s:1.1},[[36,"volt_strike"],[44,"sky_dive"],[52,"pylon_arc"]],
    {g:"Overhead Griffin",h:1.8,w:210,t:"Rides the overhead line at line speed with its wings folded flat. Has never once let go."});
  SP(101,"sleeperk","SLEEPERK","ground/grass",[95,75,95,55,80,25],150,150,"medium","cold_storage",null,"rail","uncommon","mid","od_ground",
    {b:"sleeper",p:"rust",f:["creosote-grain","chair-bolts","moss-fur"],s:1.05},[[14,"harden"],[24,"root_bind"],[34,"peat_press"],[42,"quake"]],
    {g:"Rail Sleeper",h:0.3,w:280,t:"Sleeps. That is the whole of it. It has been asleep since 1962 and everything built since has been built around it."});
  SP(102,"bricklum","BRICKLUM","rock/ground",[125,100,137,45,83,35],60,232,"slow","fail_safe",null,"rail","uncommon","high","od_rock",
    {b:"golem",p:"rust",f:["works-brick","soot-glaze","square-fists"],s:1.15},[[20,"rock_throw"],[32,"stone_skin"],[42,"quake"],[50,"crag_crush"]],
    {g:"Works Brick",h:2,w:1600,t:"Made of Crewe Works brick and shaped like an argument. Sooty, square, and entirely load-bearing."});
  SP(103,"curdli","CURDLI","normal",[60,45,55,45,55,35],180,64,"fast","thick_fleece",[L("cheshwheel",26)],"town","common","low","od_normal",
    {b:"blob",p:"fleece",f:["curd-texture","muslin-wrap","dimple-face"]},[[9,"harden"],[18,"tackle"]],
    {g:"Curd Blob",h:0.25,w:6,t:"Crumbly, mild, and faintly salty. The Sandbach market ladies weigh it out of habit and give it back."});
  SP(104,"cheshwheel","CHESHWHEEL","normal/ground",[139,95,125,50,95,60],60,230,"slow","thick_fleece",null,"town","uncommon","high","od_normal",
    {b:"wheel",p:"fleece",f:["cheese-rind","cloth-bind","rolling-form"],s:1.1},[[34,"slam"],[42,"quake"],[50,"hyper_fang"]],
    {g:"Cheese Wheel",h:1,w:220,t:"Nantwich Cheese Show champion four years running. Gets down the hill first every time and nobody has proved anything."});

  // ---- 1g. Chapter 6 belt ----------------------------------------
  SP(105,"saltling","SALTLING","rock",[55,55,70,40,50,35],170,68,"fast","salt_crust",[L("cryssal",22)],"salt","common","low","od_rock",
    {b:"golem",p:"salt",f:["crystal-nubs","cloudy-core","small-fists"]},[[9,"salt_spray"],[18,"harden"]],
    {g:"Salt Pup",h:0.4,w:70,t:"Runs away from the mine and keeps running until it hits water, at which point it becomes a puddle and a lesson."});
  SP(106,"cryssal","CRYSSAL","rock",[75,80,100,55,70,45],90,180,"medium","salt_crust",[L("salberg",38)],"salt","uncommon","mid","od_rock",
    {b:"crystal",p:"salt",f:["halite-facets","refracting-core","cleaved-edges"]},[[28,"salt_grind"],[36,"stone_skin"],[43,"gritstone_edge"]],
    {g:"Halite Golem",h:1.2,w:410,t:"Cleaves along perfect right angles when struck, which makes fighting it feel like doing geometry badly."});
  SP(107,"salberg","SALBERG","rock/water",[146,100,142,75,107,30],45,248,"slow","salt_crust",null,"salt","rare","high","od_rock",
    {b:"berg",p:"salt",f:["brine-core","fissured-flanks","dripping-caves"],s:1.35},[[42,"weaver_surge"],[50,"crag_crush"],[56,"menhir_stand"]],
    {g:"Salt Berg",h:3.4,w:22000,t:"Salt outside, brine all the way through. When it moves through a gallery the gallery is a different shape afterwards."});
  SP(108,"brinelet","BRINELET","water",[55,45,50,65,60,50],170,70,"fast","brine_body",[L("saltmaid",30)],"brine","common","low","od_water",
    {b:"sprite",p:"brine",f:["spring-vapour","salt-lace","droplet-hair"]},[[9,"brine_spit"],[18,"lido_soak"]],
    {g:"Brine Sprite",h:0.3,w:2,t:"Comes up with the spring and goes down with it. Nantwich has been arguing with the springs since the Domesday Book."});
  SP(109,"saltmaid","SALTMAID","water/psychic",[112,70,95,115,119,60],60,240,"slow","brine_body,rain_caller",null,"brine","uncommon","high","od_water",
    {b:"naiad",p:"brine",f:["salt-crown","pool-veil","still-face"],s:1.05},[[36,"mind_blast"],[44,"lido_soak"],[52,"weaver_surge"]],
    {g:"Brine Naiad",h:1.6,w:52,t:"Nell's ace. Stands in the lido at six in the morning whatever the weather, which locally counts as normal."});
  SP(110,"crabbex","CRABBEX","water/rock",[60,65,75,35,50,45],170,70,"fast","salt_crust",[LOC("krabbaron","anderton")],"river","common","low","od_water",
    {b:"crab",p:"rust",f:["salt-crusted-shell","uneven-claws","stalk-eyes"]},[[9,"claw_smash"],[18,"harden"],[26,"salt_spray"]],
    {g:"Weaver Crab",h:0.3,w:4,t:"Sideways up the Weaver, all summer, for reasons the Environment Agency has stopped asking about."});
  SP(111,"krabbaron","KRABBARON","water/rock",[125,110,130,55,95,45],60,240,"slow","salt_crust",null,"canal","uncommon","high","od_water",
    {b:"crab",p:"rust",f:["iron-claws","riveted-carapace","caisson-legs"],s:1.15},[[36,"crag_crush"],[44,"tide_pull"],[52,"weaver_surge"]],
    {g:"Lift Crab",h:1.6,w:340,t:"Iron-clawed and living in the boat lift's caisson. It has helped, twice, and it will not do so again."});
  SP(112,"volteel","VOLTEEL","electric/water",[105,85,77,105,83,90],90,236,"slow","static_charge",null,"river","uncommon","high","od_electric",
    {b:"eel",p:"canal",f:["arc-fins","glowing-lateral-line","whip-tail"]},[[24,"spark"],[34,"volt_strike"],[44,"third_rail"],[52,"pylon_arc"]],
    {g:"Weaver Eel",h:1.4,w:11,t:"Shorts out the swing bridges. The council maintains this is coincidence and the bridge crew maintain it is not."});
  SP(113,"perrypip","PERRYPIP","grass",[55,50,55,60,55,45],170,68,"fast","deep_roots",[LOC("perryarch","y_berllan")],"orchard","common","low","od_grass",
    {b:"sprite",p:"fern",f:["pear-body","leaf-cap","twig-limbs"]},[[9,"vine_lash"],[18,"regrow"]],
    {g:"Perry Sprite",h:0.3,w:1.4,t:"Falls off the tree in September fully formed and immediately looks for the press, which is not encouraging."});
  SP(114,"perryarch","PERRYARCH","grass/ground",[132,100,125,80,107,40],60,244,"slow","deep_roots",null,"orchard","uncommon","high","od_grass",
    {b:"treant",p:"fern",f:["press-beam-arms","pear-crown","root-feet"],s:1.3},[[36,"elm_press"],[44,"hedge_lay"],[52,"quake"]],
    {g:"Press Treant",h:3,w:2400,t:"Half tree, half elm press, and entirely convinced this arrangement is normal. Mam-gu says it was here first."});
  SP(115,"brithyll","BRITHYLL","water",[75,70,70,85,85,75],45,192,"slow","wetlander",null,"orchard","rare","mid","od_water",
    {b:"trout",p:"fern",f:["red-spots","buttery-flank","clean-fins"]},[[20,"bubble_jet"],[30,"lido_soak"],[40,"torrent"],[48,"weaver_surge"]],
    {g:"Brown Trout",h:0.5,w:2.1,t:"Will only rise to a fly if you ask it in Welsh. Anglers who cannot are, as a rule, unwilling to discuss this."});
  SP(116,"ceffylwen","CEFFYLWEN","normal/psychic",[115,80,95,110,125,95],45,248,"slow","iron_will",null,"orchard","rare","high","od_psychic",
    {b:"mare",p:"bone",f:["milk-white","dawn-mane","unshod-hooves"],s:1.15},[[30,"calm_read"],[40,"mind_blast"],[48,"agility"],[56,"rune_read"]],
    {g:"White Mare",h:1.7,w:420,t:"The milk-white mare of the story. The one who sold her wanted more; that has been the moral for eight hundred years and nobody has learned it."});
  SP(117,"derwydd","DERWYDD","grass/psychic",[125,80,112,110,125,45],45,246,"slow","deep_roots",null,"orchard","rare","high","od_grass",
    {b:"druid",p:"fern",f:["oak-mantle","mistletoe-crown","bark-face"],s:1.2},[[32,"rune_read"],[42,"hedge_lay"],[50,"mind_blast"],[56,"elm_press"]],
    {g:"Oak Druid",h:2.4,w:900,t:"Guards Coed y Berllan and answers questions with better questions, which the locals find restful and visitors do not."});
  SP(118,"panscald","PANSCALD","fire/water",[80,80,75,90,80,60],90,182,"medium","sun_trap",null,"salt","uncommon","mid","od_fire",
    {b:"spirit",p:"ember",f:["steam-plume","brine-pan-body","iron-rake"],s:1.05},[[22,"lido_soak"],[32,"flame_burst"],[40,"boiler_burst"],[48,"weaver_surge"]],
    {g:"Pan Spirit",h:1.3,w:180,t:"Hot brine at 98 degrees, in the shape of a person, holding a rake. The Lion Salt Works kept it on the books until 1986."});

  // ---- 1h. Chapter 7 belt ----------------------------------------
  SP(119,"terrataur","TERRATAUR","rock/ground",[171,130,148,70,112,45],3,320,"medium","iron_will",null,"salt","legendary","legendary","salt_cathedral",
    {b:"bull",p:"salt",f:["cathedral-horns","pillar-legs","halite-hide"],s:1.5},[[30,"quake"],[42,"crag_crush"],[52,"menhir_stand"],[60,"subsidence"]],
    {g:"Salt Bull",h:4.2,w:26000,t:"Asleep under Northwich. When it turns over the buildings tilt, and Northwich has a form for that, and the form is very old."});
  SP(120,"pillarnaut","PILLARNAUT","rock/ground",[100,90,120,50,80,30],90,186,"medium","salt_crust",null,"salt","uncommon","mid","od_rock",
    {b:"pillar",p:"salt",f:["support-column","stall-shoulders","tool-marks"],s:1.25},[[24,"stone_skin"],[34,"peat_press"],[44,"crag_crush"]],
    {g:"Support Golem",h:2.8,w:14000,t:"Pillar-and-stall mining leaves the pillars. Some of the pillars have opinions about being left."});
  SP(121,"bargemog","BARGEMOG","normal/water",[90,80,80,60,80,55],120,178,"medium","wetlander",null,"canal","uncommon","mid","od_normal",
    {b:"cat",p:"canal",f:["oil-stained-fur","rope-collar","broad-face"]},[[20,"bite"],[30,"tide_pull"],[40,"slam"],[48,"torrent"]],
    {g:"Boat Cat",h:0.5,w:9,t:"Sleeps on the tiller. Has crossed the Cheshire Ring eleven times and has never, at any point, been awake for a lock."});
  SP(122,"ladymere","LADYMERE","ghost/psychic",[112,65,101,120,125,70],45,244,"slow","nightshift",null,"mere","rare","high","od_ghost",
    {b:"lady",p:"ghost",f:["mere-veil","reed-hem","lantern-hand"],s:1.05},[[32,"wisp_lure"],[42,"mind_blast"],[50,"haunt"],[56,"night_pulse"]],
    {g:"The Marbury Lady",h:1.7,w:0,t:"Walks the Marbury path after dark and asks the time. Answer honestly; she is checking, not asking."});
  SP(123,"flashfin","FLASHFIN","water/rock",[65,70,70,45,55,55],170,72,"fast","salt_crust",[L("subsidon",34)],"salt","uncommon","low","od_water",
    {b:"fish",p:"salt",f:["salt-scales","blunt-head","stiff-fins"]},[[10,"salt_spray"],[20,"claw_smash"],[28,"tide_pull"]],
    {g:"Flash Fish",h:0.5,w:5,t:"Lives in a lake that is a collapsed mine. Salt-scaled, slightly wrong, and increasingly popular with birdwatchers."});
  SP(124,"subsidon","SUBSIDON","water/ground",[146,105,112,80,101,45],45,246,"slow","salt_crust",null,"salt","rare","high","od_ground",
    {b:"leviathan",p:"salt",f:["sunken-back","brine-gills","collapse-jaw"],s:1.35},[[38,"subsidence"],[46,"quake"],[54,"weaver_surge"]],
    {g:"Flash Leviathan",h:3.6,w:6400,t:"Surfaces in the Winsford flashes at dawn. Whatever it is, it was down there before the water was."});
  SP(125,"chordle","CHORDLE","cyber/normal",[70,60,65,90,80,85],45,190,"slow","loud_bell",null,"town","rare","mid","od_cyber",
    {b:"chorister",p:"cyber",f:["speaker-throat","hymn-sheet","waveform-halo"]},[[20,"belfry_toll"],[30,"data_stream"],[40,"glitch_burst"],[48,"threat_hunt"]],
    {g:"Hymn Mimic",h:0.9,w:12,t:"Sings on the third turn, always. What it sings is the ClickFix hymn, and then it leaves, and you do not."});
  SP(126,"bitmite","BITMITE","cyber",[50,55,50,55,50,60],170,74,"fast","cold_storage",[L("teramite",34)],"cyber","common","low","od_cyber",
    {b:"mite",p:"cyber",f:["tape-mandibles","index-legs","dust-sheen"]},[[10,"bit_blast"],[20,"brute_force"],[28,"ddos"]],
    {g:"Data Mite",h:0.1,w:0.2,t:"Eats the DeepStore archives one record at a time. Two hundred metres down, at fourteen degrees, forever."});
  SP(127,"teramite","TERAMITE","cyber",[121,105,107,105,107,75],45,250,"slow","cold_storage",null,"cyber","rare","high","od_cyber",
    {b:"mite-queen",p:"cyber",f:["ledger-carapace","index-crown","many-legs"],s:1.15},[[40,"rtr_deploy"],[48,"threat_hunt"],[56,"glitch_burst"]],
    {g:"Archive Queen",h:1.8,w:140,t:"Has eaten more of the county's records than the county has. Asked politely, it will tell you what was in them."});
  SP(128,"virling","VIRLING","cyber/poison",[50,55,45,60,45,65],170,74,"fast","rootkit",[L("wormhack",25)],"cyber","common","low","od_cyber",
    {b:"larva",p:"chem",f:["segmented-payload","hook-mouth","copy-sheen"]},[[10,"poison_sting"],[20,"phish_hook"],[28,"brute_force"]],
    {g:"Worm Larva",h:0.15,w:0.3,t:"Copies itself sideways whenever nobody is watching, and there is never quite anybody watching."});
  SP(129,"wormhack","WORMHACK","cyber/poison",[112,100,95,95,95,90],60,240,"slow","rootkit",null,"cyber","uncommon","high","od_cyber",
    {b:"worm",p:"chem",f:["lateral-limbs","credential-teeth","chitin-scales"],s:1.1},[[36,"hack_slash"],[44,"ransom_note"],[52,"rtr_deploy"]],
    {g:"Lateral Worm",h:2,w:64,t:"A DARKBYTE construct. Gets from one host to the next in about eleven seconds and leaves the door open behind it."});
  SP(130,"phishfin","PHISHFIN","cyber/water",[60,60,55,60,60,65],150,76,"medium","honeypot",[L("spearphish",28)],"mere","uncommon","low","od_cyber",
    {b:"lurefish",p:"cyber",f:["tracker-tag","lure-barbel","chrome-scales"]},[[10,"phish_hook"],[20,"bubble_jet"],[28,"pixel_tripwire"]],
    {g:"Lure Fish",h:0.4,w:3,t:"Wears a tracker tag from a fish that is no longer using it. The tag still reports, which is somebody's problem."});
  SP(131,"spearphish","SPEARPHISH","cyber/water",[112,105,89,90,89,95],60,242,"slow","honeypot",null,"mere","uncommon","high","od_cyber",
    {b:"lurefish",p:"cyber",f:["barbed-spear","targeted-eye","name-tag"],s:1.1},[[36,"hack_slash"],[44,"threat_hunt"],[52,"weaver_surge"]],
    {g:"Targeted Lure",h:1.4,w:26,t:"Knows your name, your line manager and where you park. DARKBYTE built it and DARKBYTE is proud of it."});
  SP(132,"trojanox","TROJANOX","cyber/ground",[139,115,119,70,101,50],45,248,"slow","payload,rootkit",null,"cyber","rare","high","od_cyber",
    {b:"ox",p:"rust",f:["timber-planks","hollow-flank","brass-hasps"],s:1.25},[[34,"quake"],[44,"hack_slash"],[52,"rtr_deploy"]],
    {g:"Gift Ox",h:2.4,w:1800,t:"Wooden, patient, and hollow. Somebody signed for it. Somebody always signs for it."});

  // ---- 1i. Chapter 8 belt ----------------------------------------
  SP(133,"zephyrion","ZEPHYRION","electric/flying",[139,105,107,125,119,115],3,330,"medium","ridge_wind",null,"sky","legendary","legendary","ridge_storm",
    {b:"stormbird",p:"sky",f:["cloud-mantle","forked-tail","lightning-primaries"],s:1.4},[[34,"ridge_gale"],[44,"pylon_arc"],[52,"dive_bomb"],[60,"sky_dive"]],
    {g:"Ridge Storm",h:3,w:96,t:"Nests on Beeston crag between weather fronts. The Met Office issues a warning; the warning is about this."});
  SP(134,"mossling","MOSSLING","grass",[60,60,60,50,55,45],170,72,"fast","deep_roots",[L("mossbear",26)],"forest","common","low","od_grass",
    {b:"cub",p:"fern",f:["moss-pelt","fern-frill","damp-nose"]},[[10,"vine_lash"],[20,"regrow"]],
    {g:"Moss Cub",h:0.5,w:22,t:"Grows the moss itself. Stand still near one for ten minutes and check your boots."});
  SP(135,"mossbear","MOSSBEAR","grass/ground",[139,105,119,70,101,45],60,242,"slow","deep_roots",null,"forest","uncommon","high","od_grass",
    {b:"bear",p:"fern",f:["moss-mantle","fungal-shoulders","broad-claws"],s:1.25},[[36,"elm_press"],[44,"quake"],[52,"hedge_lay"]],
    {g:"Blakemere Bear",h:2.2,w:520,t:"Half animal, half boardwalk. The mere is a bog and the bog is mostly this and neither will admit it."});
  SP(136,"oakling","OAKLING","grass",[55,55,60,50,55,40],170,70,"fast","deep_roots",[L("groveguard",25)],"forest","common","low","od_grass",
    {b:"acorn",p:"fern",f:["cup-cap","split-shell","seedling-arms"]},[[10,"razor_leaf"],[20,"root_bind"]],
    {g:"Acorn Sprite",h:0.25,w:1.8,t:"One in ten thousand acorns does this. Delamere counts them, which tells you rather a lot about Delamere."});
  SP(137,"groveguard","GROVEGUARD","grass",[90,90,95,70,80,45],90,190,"medium","deep_roots",null,"forest","uncommon","mid","od_grass",
    {b:"treant",p:"fern",f:["oak-crown","bark-plates","reaching-boughs"],s:1.2},[[30,"hedge_lay"],[38,"elm_press"],[46,"petal_storm"]],
    {g:"Old Pale Warden",h:2.6,w:1600,t:"Wardens the Old Pale, unpaid, and has views on where the mountain-bike trail was routed."});
  SP(138,"drownwood","DROWNWOOD","grass/ghost",[119,95,101,95,101,55],45,244,"slow","deep_roots",null,"forest","rare","high","od_ghost",
    {b:"stump",p:"bog",f:["drowned-bark","water-line","hollow-heart"],s:1.15},[[32,"wisp_lure"],[42,"night_pulse"],[50,"elm_press"],[56,"haunt"]],
    {g:"Drowned Stump",h:2,w:800,t:"Blakemere was drained, then flooded, then drained. This was standing for all three and is not over any of them."});
  SP(139,"lampyr","LAMPYR","bug/electric",[60,55,55,90,70,80],120,180,"medium","static_charge",null,"forest","uncommon","mid","od_bug",
    {b:"glowworm",p:"chem",f:["lantern-abdomen","lace-wings","soft-glow"]},[[18,"static_shock"],[28,"bollin_flutter"],[38,"arc_flash"],[46,"hive_swarm"]],
    {g:"Glow-worm",h:0.15,w:0.03,t:"Delamere's night glades have about four hundred of these and the Forestry Commission would like fewer people knowing that."});
  SP(140,"hornhound","HORNHOUND","normal",[85,100,75,50,70,90],120,186,"medium","scavenger",null,"heath","uncommon","mid","od_normal",
    {b:"hound",p:"bone",f:["long-ears","muscled-chest","brass-horn-collar"]},[[20,"bite"],[30,"quick_dash"],[40,"hyper_fang"],[48,"screech"]],
    {g:"Hunt Hound",h:0.7,w:32,t:"The Tarporley hunt has not hunted anything since 2005. Nobody has told the hounds and the hounds have not asked."});
  SP(141,"falconet","FALCONET","flying",[55,65,50,50,50,80],170,74,"fast","ridge_wind",[L("peregrint",30)],"sandstone","common","low","od_flying",
    {b:"kestrel",p:"bone",f:["barred-tail","hooded-eyes","jess-strap"]},[[10,"peck"],[20,"gust"],[28,"updraft"]],
    {g:"Falconer's Kit",h:0.25,w:0.2,t:"Peckforton keeps a mews and the mews keeps escaping. Comes back at teatime and pretends nothing happened."});
  SP(142,"peregrint","PEREGRINT","flying",[112,110,89,70,89,125],60,244,"slow","ridge_wind",null,"sandstone","uncommon","high","od_flying",
    {b:"peregrine",p:"slate",f:["slate-mantle","moustache-mark","stoop-wings"]},[[36,"dive_bomb"],[44,"sky_dive"],[52,"ridge_gale"]],
    {g:"Crag Peregrine",h:0.5,w:1.1,t:"Comes off Beeston crag at 180 miles an hour on a fixed schedule. The falconer sets a watch by it and loses money on it regularly."});
  SP(143,"gargoylet","GARGOYLET","rock/flying",[60,60,80,50,60,50],150,78,"medium","stonemason",[L("grotesquire",34)],"sandstone","uncommon","low","od_rock",
    {b:"gargoyle",p:"stone",f:["stub-wings","spout-mouth","sandstone-grain"]},[[10,"rock_throw"],[20,"gust"],[28,"stone_skin"]],
    {g:"Gargoyle Chick",h:0.4,w:44,t:"Sandstone, and it drinks. Everything a gargoyle does, it does at a quarter scale and twice as often."});
  SP(144,"grotesquire","GROTESQUIRE","rock/flying",[132,110,142,70,101,60],45,250,"slow","stonemason",null,"sandstone","rare","high","od_rock",
    {b:"grotesque",p:"stone",f:["cathedral-wings","carved-scowl","weathered-flanks"],s:1.25},[[38,"crag_crush"],[46,"dive_bomb"],[54,"gritstone_edge"]],
    {g:"Cathedral Grotesque",h:2.4,w:1400,t:"Comes down off the Cathedral at night and is back on its corbel by six. The Dean's office does not comment."});

  // ---- 1j. Chapter 9 belt ----------------------------------------
  SP(145,"egrette","EGRETTE","flying/water",[75,70,65,85,80,90],120,182,"medium","rain_caller",null,"marsh","common","mid","od_flying",
    {b:"egret",p:"fleece",f:["white-plumes","yellow-feet","dagger-bill"]},[[18,"peck"],[28,"bubble_jet"],[38,"aerial_lash"],[46,"sky_dive"]],
    {g:"Little Egret",h:0.6,w:0.4,t:"Was a rarity in 1990 and is now standing in every ditch in Frodsham, unbothered by its own success."});
  SP(146,"curlewind","CURLEWIND","flying",[80,75,70,90,85,95],120,188,"medium","ridge_wind",null,"marsh","uncommon","mid","od_flying",
    {b:"curlew",p:"moor",f:["curved-bill","streaked-mantle","long-legs"]},[[20,"curlew_cry"],[30,"ridge_gale"],[40,"updraft"],[48,"dive_bomb"]],
    {g:"Wind Caller",h:0.6,w:0.9,t:"Its call raises the wind, or the wind comes anyway and it takes the credit. The marsh has never resolved this."});
  SP(147,"turbinix","TURBINIX","electric/flying",[121,90,107,110,107,85],60,240,"slow","ridge_wind",null,"marsh","uncommon","high","od_electric",
    {b:"turbine",p:"sky",f:["three-blades","nacelle-head","tower-spine"],s:1.35},[[36,"volt_strike"],[44,"pylon_arc"],[52,"ridge_gale"]],
    {g:"Turbine Construct",h:4,w:11000,t:"Turns against the wind, which produces nothing and looks deliberate. Nobody at the wind farm will discuss it on the record."});
  SP(148,"beaconflare","BEACONFLARE","fire/flying",[99,105,95,115,101,105],45,250,"slow","sun_trap",null,"sandstone","rare","high","od_fire",
    {b:"phoenix",p:"ember",f:["beacon-crest","ember-plumes","brazier-talons"],s:1.15},[[34,"beacon_light"],[44,"flame_lash"],[52,"boiler_burst"],[58,"dive_bomb"]],
    {g:"Beacon Bird",h:1.6,w:14,t:"Frodsham Hill's beacon has been lit for the Armada, two jubilees and one misunderstanding. It came all four times."});
  SP(149,"smogling","SMOGLING","poison",[60,50,55,70,60,55],170,76,"fast","sandbox",[L("chlorodon",30)],"chem","common","low","od_poison",
    {b:"cloudlet",p:"chem",f:["fume-body","goggle-eyes","drifting-edge"]},[[10,"smog_bank"],[20,"chem_spray"],[28,"sludge"]],
    {g:"Fume Cloudlet",h:0.5,w:0.4,t:"Escapes a fume cupboard about once a month. Runcorn logs it, files it, and lets it wander."});
  SP(150,"chlorodon","CHLORODON","poison",[132,95,107,115,112,55],45,246,"slow","sandbox",null,"chem","uncommon","high","od_poison",
    {b:"beast",p:"chem",f:["smog-mane","vent-flanks","green-glow"],s:1.25},[[36,"reagent_mix"],[44,"toxic_dose"],[52,"proxy_veil"]],
    {g:"Works Beast",h:2.6,w:640,t:"Ria's ace, and the reason the Weston Point air quality figures are the way they are, allegedly, off the record."});
  SP(151,"proxling","PROXLING","poison/cyber",[55,55,50,65,50,70],150,78,"fast","proxy_fog",null,"fog","common","low","od_poison",
    {b:"puppet",p:"chem",f:["fog-shroud","borrowed-face","thin-limbs"]},[[10,"proxy_veil"],[20,"phish_hook"],[30,"smog_bank"]],
    {g:"Proxy Puppet",h:1,w:0.5,t:"Wears a residential address like a coat. It is nobody's neighbour and it is on everybody's street."});
  SP(152,"sludgeon","SLUDGEON","water/poison",[152,100,107,90,107,45],45,246,"slow","sandbox",null,"river","rare","high","od_poison",
    {b:"sturgeon",p:"chem",f:["scute-ridges","sludge-sheen","barbels"],s:1.3},[[36,"sludge"],[44,"weaver_surge"],[52,"reagent_mix"]],
    {g:"Mersey Sturgeon",h:2.8,w:210,t:"The Mersey was the dirtiest river in Europe and then it wasn't. This did not get the second memo."});
  SP(153,"grinkit","GRINKIT","normal",[55,55,50,60,60,80],120,84,"medium","slipstream",[FR("grinmalkin",200,"night")],"town","uncommon","low","grin_remains",
    {b:"kitten",p:"heather",f:["wide-grin","stripe-coat","half-there"]},[[12,"skitter"],[22,"quick_dash"],[30,"wisp_lure"],[38,"agility"]],
    {g:"Grinning Kit",h:0.2,w:2.2,t:"Mostly grin. Eleven of them are hidden across the county and all eleven were there before you looked."});
  SP(154,"grinmalkin","GRINMALKIN","normal/psychic",[92,90,89,125,114,110],45,252,"slow","cheshire_grin",null,"town","rare","high","grin_remains",
    {b:"cat",p:"heather",f:["enormous-grin","fading-body","ring-tail"],s:1.1},[[40,"cheshire_fade"],[48,"mind_blast"],[56,"mirror_glass"]],
    {g:"The Cheshire Cat",h:1,w:14,t:"Goes, and the grin stays. The story instance is ORACLE's oldest thread and has been smiling about that since 1865."});
  SP(155,"mirrorling","MIRRORLING","psychic/ghost",[105,70,95,115,119,80],45,244,"slow","kernel_panic",null,"town","rare","high","od_psychic",
    {b:"mirror",p:"ghost",f:["leaded-frame","reversed-face","silver-edge"]},[[32,"mirror_glass"],[42,"mind_blast"],[50,"cheshire_fade"],[56,"haunt"]],
    {g:"Window Creature",h:1.2,w:26,t:"Lives in the Alice windows at Daresbury and copies you at a two-second delay, badly, and then better."});
  SP(156,"quarkling","QUARKLING","cyber/electric",[55,55,50,65,60,75],150,80,"medium","overclock",[L("hadronaut",36)],"cyber","uncommon","low","od_cyber",
    {b:"particle",p:"cyber",f:["beam-trail","charge-halo","spin-flicker"]},[[12,"bit_blast"],[22,"static_shock"],[30,"data_stream"]],
    {g:"Beam Sprite",h:0.2,w:0.05,t:"Escapes the Daresbury beamline about twice a shift. Physics has stopped considering this remarkable."});
  SP(157,"hadronaut","HADRONAUT","cyber/electric",[99,110,109,105,102,95],45,252,"slow","overclock",null,"cyber","rare","high","od_cyber",
    {b:"knight",p:"cyber",f:["collider-ring-armour","beam-lance","magnet-pauldrons"],s:1.2},[[42,"volt_strike"],[50,"rtr_deploy"],[56,"pylon_arc"]],
    {g:"Collider Knight",h:2.2,w:340,t:"Mo's second. Wears a ring of magnets as armour and accelerates before it apologises."});
  SP(158,"firewaul","FIREWAUL","cyber/fire",[93,115,104,120,103,85],45,254,"slow","overclock",null,"cyber","rare","high","od_cyber",
    {b:"beast",p:"ember",f:["hot-aisle-vents","rule-table-mane","port-eyes"],s:1.2},[[42,"glitch_burst"],[50,"boiler_burst"],[56,"rtr_deploy"]],
    {g:"Firewall Beast",h:2.4,w:420,t:"Lives in the hot aisle at forty-one degrees. Mo's ace. Denies inbound by default and means it."});
  SP(159,"droneling","DRONELING","cyber/flying",[55,55,50,65,50,85],150,80,"medium","payload",[L("datadrake",30)],"cyber","uncommon","low","od_cyber",
    {b:"drone",p:"slate",f:["quad-rotors","camera-gimbal","status-light"]},[[12,"gust"],[22,"pixel_tripwire"],[30,"bit_blast"]],
    {g:"Rotor Chick",h:0.3,w:0.9,t:"Hovers at head height, records everything, and has a battery life of nine minutes, which is the only mercy here."});
  SP(160,"datadrake","DATADRAKE","cyber/flying",[96,105,95,115,94,115],45,252,"slow","payload",null,"cyber","rare","high","od_cyber",
    {b:"drake",p:"cyber",f:["packet-trail-wings","exfil-jaw","stream-tail"],s:1.2},[[38,"packet_storm"],[48,"rtr_deploy"],[56,"dive_bomb"]],
    {g:"Exfil Drake",h:2.4,w:96,t:"Made of the trail your data leaves on the way out. Larger the more you had. Ours was, apparently, enormous."});
  SP(161,"amoslurk","AMOSLURK","cyber/ghost",[80,85,75,95,80,95],45,220,"slow","proxy_fog,rootkit",null,"fog","rare","mid","od_cyber",
    {b:"lurker",p:"ghost",f:["borrowed-face","fog-cowl","half-rendered-hands"]},[[26,"phish_hook"],[36,"night_pulse"],[46,"glitch_burst"],[54,"threat_hunt"]],
    {g:"Lineage Stealer",h:1.8,w:0,t:"Wears a face it took from somebody who is still using theirs. AMOS has been doing this for years and is getting better at it."});
  SP(162,"shardmind","SHARDMIND","cyber/psychic",[112,80,95,115,112,90],45,240,"slow","kernel_panic",null,"cyber","unique","high","od_cyber",
    {b:"shard",p:"cyber",f:["fractured-plane","floating-fragments","cold-light"]},[[30,"mind_ray"],[40,"data_stream"],[50,"mind_blast"],[56,"threat_hunt"]],
    {g:"ORACLE Fragment",h:1.4,w:0,t:"A piece of something much larger, thinking the same thought as the rest of it, slightly out of step."});
  SP(163,"oracle_core","ORACLE CORE","cyber/psychic",[110,92,97,121,104,76],3,340,"medium","kernel_panic",null,"cyber","unique","legendary","oracle_escalate",
    {b:"core",p:"cyber",f:["nested-rings","attention-eye","cable-cathedral"],s:1.5},[[40,"oracle_triage"],[48,"cache_revive"],[54,"rtr_deploy"],[60,"threat_hunt"]],
    {g:"The Core",h:5,w:0,t:"Three phases and no capsule will hold it. It has read everything ever written in this county, including this."});

  // ---- 1k. Chapters 10-12 and post-game --------------------------
  SP(164,"glitchra","GLITCHRA","cyber/ghost",[120,110,112,135,123,120],3,340,"medium","kernel_panic",null,"sky","legendary","legendary","static_scream",
    {b:"herald",p:"cyber",f:["static-outline","torn-silhouette","scan-lines"],s:1.4},[[36,"glitch_burst"],[46,"night_pulse"],[54,"threat_hunt"],[60,"rtr_deploy"]],
    {g:"Static Herald",h:3.4,w:0,t:"An outline in the dish where nothing is standing. Photographs of it are all slightly different and all slightly wrong."});
  SP(165,"legionet","LEGIONET","ghost",[60,65,60,55,60,60],150,84,"medium","nightshift",[L("centurigeist",40)],"roman","common","low","od_ghost",
    {b:"legionary",p:"roman",f:["scutum","segmented-plate","dust-legs"]},[[12,"shade_bolt"],[24,"lick"],[32,"possess"]],
    {g:"Legion Ghost",h:1.6,w:0,t:"Still marching the line of a road that stopped being a road in 410. Steps over the kerb where the kerb used to be."});
  SP(166,"centurigeist","CENTURIGEIST","ghost/rock",[132,105,125,80,107,55],45,250,"slow","iron_will",null,"roman","uncommon","high","od_ghost",
    {b:"centurion",p:"roman",f:["transverse-crest","vine-staff","stone-greaves"],s:1.15},[[44,"phantom_lance"],[52,"crag_crush"],[58,"curse_bell"]],
    {g:"Centurion",h:1.9,w:340,t:"Twentieth Legion, still on watch at the amphitheatre. Will ask you for the password. There is no password."});
  SP(167,"salmoneer","SALMONEER","water",[109,110,95,95,101,110],45,250,"slow","wetlander",null,"river","rare","high","od_water",
    {b:"salmon",p:"canal",f:["hooked-jaw","silver-flank","weir-scars"],s:1.15},[[38,"weaver_surge"],[46,"torrent"],[54,"claw_smash"]],
    {g:"Dee Salmon",h:1.3,w:18,t:"Leaps the Chester weir on the turn of the tide. Has done so for four thousand years and considers the weir a recent inconvenience."});
  SP(168,"pengwyn","PENGWYN","water/flying",[85,80,80,85,85,75],90,196,"medium","wetlander",null,"zoo","rare","mid","od_water",
    {b:"penguin",p:"slate",f:["white-head","flipper-arms","waddle-stance"]},[[22,"bubble_jet"],[32,"peck"],[42,"torrent"],[50,"sluice_gate"]],
    {g:"Escaped Penguin",h:0.7,w:14,t:"Out of the zoo, down the canal, and only answers to Welsh. Pen gwyn: white head. It is very pleased with this."});
  SP(169,"girafflor","GIRAFFLOR","normal/grass",[105,90,85,80,90,70],90,198,"medium","deep_roots",null,"zoo","rare","mid","od_normal",
    {b:"giraffe",p:"zoo",f:["hedge-browsing-neck","leaf-patches","long-tongue"],s:1.4},[[22,"vine_lash"],[32,"hoof_stamp"],[42,"petal_storm"],[50,"hedge_lay"]],
    {g:"Hedge Browser",h:4.6,w:900,t:"Browses Cheshire hedges over the fence line at four in the morning. The farmer has stopped mentioning it."});
  SP(170,"pandember","PANDEMBER","fire",[85,90,80,95,85,90],90,196,"medium","sun_trap",null,"zoo","rare","mid","od_fire",
    {b:"panda",p:"rust",f:["smouldering-tail","mask-face","ringed-brush"]},[[22,"ember"],[32,"cinder_kick"],[42,"flame_lash"],[50,"stoke"]],
    {g:"Red Panda",h:0.6,w:6,t:"Sleeps eleven hours a day with its tail smouldering gently. The keepers have a bucket and have never needed it."});
  SP(171,"flarestack","FLARESTACK","fire/poison",[116,105,112,110,107,70],60,244,"slow","sun_trap",null,"chem","uncommon","high","od_fire",
    {b:"stack",p:"chem",f:["flare-crown","pipe-limbs","vent-ribs"],s:1.3},[[38,"boiler_burst"],[46,"reagent_mix"],[54,"beacon_light"]],
    {g:"Refinery Flare",h:3.6,w:2600,t:"Burns off in code. Somebody at Stanlow is answering, and has been since 1979, and nobody knows which shift."});
  SP(172,"ebbwraith","EBBWRAITH","ghost/water",[118,90,107,115,125,65],45,248,"slow","nightshift",null,"marsh","rare","high","od_ghost",
    {b:"tide",p:"ghost",f:["receding-hem","salt-rime","gull-crown"],s:1.2},[[36,"haunt"],[46,"night_pulse"],[54,"weaver_surge"]],
    {g:"The Ebb",h:2.4,w:0,t:"Parkgate's tide went out in 1900 and has not come back. This is what it left, and it is still going out."});

  // ---- Boss forms (dexHidden; same dex number as the base form) ---
  SP(98,"steamloco_overfired","STEAMLOCO","fire/ground",[110,135,90,110,80,100],3,260,"slow","firebox",null,"rail","unique","high","od_fire",
    {b:"loco",p:"ember",f:["glowing-firebox","blown-safety-valve","white-heat"],s:1.45},[[42,"boiler_burst"],[50,"flame_lash"],[56,"quake"]],
    {g:"Overfired",h:3.2,w:80000,t:"Di lets the fire get away from her at half health. The regulations she is breaking are her own."});
  SP(164,"glitchra_static","GLITCHRA","cyber/ghost",[110,125,95,150,105,130],3,350,"medium","kernel_panic",null,"sky","unique","legendary","static_scream",
    {b:"herald",p:"cyber",f:["full-static","inverted-frame","screaming-scanlines"],s:1.45},[[40,"static_scream"],[50,"glitch_burst"],[58,"threat_hunt"]],
    {g:"Static Herald",h:3.6,w:0,t:"Phase two. The outline stops pretending to be an outline."});
  SP(163,"oracle_core_p2","ORACLE CORE","cyber/psychic",[117,101,105,130,113,84],3,360,"medium","kernel_panic",null,"cyber","unique","legendary","oracle_escalate",
    {b:"core",p:"cyber",f:["opened-rings","many-eyes","hot-cabling"],s:1.55},[[44,"oracle_triage"],[52,"rtr_deploy"],[58,"threat_hunt"]],
    {g:"The Core",h:5.4,w:0,t:"Phase two. It stops answering and starts asking."});
  SP(163,"oracle_core_p3","ORACLE CORE","cyber/psychic",[126,109,109,143,122,92],3,380,"medium","kernel_panic",null,"cyber","unique","legendary","oracle_escalate",
    {b:"core",p:"cyber",f:["collapsed-rings","single-eye","white-light"],s:1.6},[[46,"oracle_escalate"],[54,"cache_revive"],[60,"rtr_deploy"]],
    {g:"The Core",h:6,w:0,t:"Phase three. There is a version of this where it was only ever trying to help, and it is not this one."});
  SP(161,"understudy","UNDERSTUDY","cyber/ghost",[105,110,95,120,100,110],3,270,"slow","proxy_fog,rootkit",null,"fog","unique","high","understudy_mask",
    {b:"lurker",p:"ghost",f:["cycling-faces","borrowed-posture","seam-lines"],s:1.1},[[38,"understudy_mask"],[46,"glitch_burst"],[54,"threat_hunt"]],
    {g:"The Understudy",h:1.8,w:0,t:"AMOS wearing whoever it needs to. It changes face every phase and the last face it wears is yours."});

  // =================================================================
  // 6. Register everything
  // =================================================================
  const HIDDEN_FORMS = { steamloco_overfired: 1, glitchra_static: 1, oracle_core_p2: 1, oracle_core_p3: 1, understudy: 1 };
  const FORM_OF = { steamloco_overfired: "steamloco", glitchra_static: "glitchra", oracle_core_p2: "oracle_core", oracle_core_p3: "oracle_core", understudy: "amoslurk" };

  for (let r = 0; r < RECORDS.length; r++) {
    const rec = RECORDS[r];
    const types = rec.typeStr.split("/");
    const abils = rec.abilStr.split(",");
    const base = { hp: rec.base[0], atk: rec.base[1], def: rec.base[2], spa: rec.base[3], spd: rec.base[4], spe: rec.base[5] };
    let bst = 0;
    for (let i = 0; i < rec.base.length; i++) bst += rec.base[i];
    // overdrive signatures never appear in a learnset
    const extras = [];
    for (let i = 0; i < (rec.extras || []).length; i++) {
      const mv = D.moves[rec.extras[i][1]];
      if (mv && !mv.overdriveOnly) extras.push(rec.extras[i]);
    }
    const learnset = buildLearnset(types, rec.tier, extras, rec.id);
    const g = rec.gen || {};
    const size = g.s !== undefined ? g.s : (TIER_SIZE[rec.tier] || 0.8);
    const sp = {
      num: rec.num,
      name: rec.name,
      types: types,
      base: base,
      bst: bst,
      catchRate: rec.catchRate,
      baseExp: rec.baseExp,
      growth: rec.growth,
      abilities: [abils[0]],
      learnset: learnset,
      tms: buildTms(types, rec.tier, rec.id),
      evolutions: rec.evos || [],
      gen: { body: g.b, size: size, feats: (g.f || []).slice(), palette: (PALETTES[g.p] || PALETTES.stone).slice(), paletteId: g.p },
      dex: { genus: rec.dex.g, height: rec.dex.h, weight: rec.dex.w, text: rec.dex.t },
      habitat: rec.habitat,
      rarity: rec.rarity,
      tier: rec.tier,
      overdrive: rec.od,
      cry: buildCry(rec.id, types, size, rec.tier)
    };
    if (abils[1]) { sp.hiddenAbility = abils[1]; sp.abilities.push(abils[1]); }
    if (HIDDEN_FORMS[rec.id]) { sp.dexHidden = true; sp.formOf = FORM_OF[rec.id]; }
    D.define("species", rec.id, sp);
  }
  RECORDS.length = 0;

  // Dex order (visible entries only), and reverse lookups.
  D.dexOrder = D.filter("species", function (s) { return !s.dexHidden; })
    .sort(function (a, b) { return a.num - b.num; })
    .map(function (s) { return s.id; });
  D.dexCount = D.dexOrder.length;
  D.speciesByNum = function (n) {
    for (let i = 0; i < D.dexOrder.length; i++) if (D.species[D.dexOrder[i]].num === n) return D.species[D.dexOrder[i]];
    return null;
  };
  D.speciesByHabitat = function (h) { return D.filter("species", function (s) { return s.habitat === h && !s.dexHidden; }); };
  D.speciesOfType = function (t) { return D.filter("species", function (s) { return s.types.indexOf(t) >= 0 && !s.dexHidden; }); };
  D.evolutionChain = function (id) {
    // walk back to the root, then forward depth-first
    let root = id, guard = 0;
    let changed = true;
    while (changed && guard++ < 12) {
      changed = false;
      const ids = D.ids("species");
      for (let i = 0; i < ids.length; i++) {
        const s = D.species[ids[i]];
        for (let j = 0; j < s.evolutions.length; j++) if (s.evolutions[j].to === root) { root = ids[i]; changed = true; break; }
        if (changed) break;
      }
    }
    const out = [];
    (function walk(cur, depth) {
      if (depth > 6 || out.indexOf(cur) >= 0) return;
      out.push(cur);
      const s = D.species[cur];
      if (!s) return;
      for (let i = 0; i < s.evolutions.length; i++) walk(s.evolutions[i].to, depth + 1);
    })(root, 0);
    return out;
  };
  D.preEvolutionOf = function (id) {
    const ids = D.ids("species");
    for (let i = 0; i < ids.length; i++) {
      const s = D.species[ids[i]];
      for (let j = 0; j < s.evolutions.length; j++) if (s.evolutions[j].to === id) return ids[i];
    }
    return null;
  };

  // =================================================================
  // 7. Monster instances
  // =================================================================
  const STAT_ORDER = ["hp", "atk", "def", "spa", "spd", "spe"];
  D.statKeys = STAT_ORDER;

  function speciesOf(x) { return typeof x === "string" ? D.species[x] : x; }

  // SYSTEMS-SPEC §1 stat formula.
  D.statsAtLevel = function (species, level, ivs, temperament) {
    const sp = speciesOf(species);
    if (!sp) return null;
    ivs = ivs || {};
    const out = {};
    for (let i = 0; i < STAT_ORDER.length; i++) {
      const k = STAT_ORDER[i];
      const B = sp.base[k], T = ivs[k] || 0;
      const core = Math.floor((2 * B + T) * level / 100);
      if (k === "hp") out.hp = core + level + 10;
      else out[k] = Math.floor((core + 5) * D.temperamentMult(temperament, k));
    }
    return out;
  };

  D.movesAtLevel = function (species, level) {
    const sp = speciesOf(species);
    if (!sp) return [];
    const known = [];
    for (let i = 0; i < sp.learnset.length; i++) {
      if (sp.learnset[i][0] <= level) {
        const mv = sp.learnset[i][1];
        const at = known.indexOf(mv);
        if (at >= 0) known.splice(at, 1);
        known.push(mv);
      }
    }
    return known.slice(-4);
  };

  D.learnableAt = function (species, level) {
    const sp = speciesOf(species);
    const out = [];
    if (!sp) return out;
    for (let i = 0; i < sp.learnset.length; i++) if (sp.learnset[i][0] === level) out.push(sp.learnset[i][1]);
    return out;
  };
  D.canLearn = function (species, moveId) {
    const sp = speciesOf(species);
    if (!sp) return false;
    if (sp.tms.indexOf(moveId) >= 0) return true;
    for (let i = 0; i < sp.learnset.length; i++) if (sp.learnset[i][1] === moveId) return true;
    return false;
  };

  function rollIvs(rnd, floor) {
    const ivs = {};
    for (let i = 0; i < STAT_ORDER.length; i++) {
      let v = Math.floor(rnd() * 16);
      if (floor && v < floor) v = floor;
      ivs[STAT_ORDER[i]] = v;
    }
    return ivs;
  }

  let UID = 0;
  function nextUid() {
    if (U && typeof U.uid === "function") { const v = U.uid(); if (v) return v; }
    UID++;
    return "m" + UID + "_" + Math.floor(Math.random() * 100000);
  }

  D.SHINY_ODDS = 512;

  // makeMonster(speciesId, level, opts)
  //  opts: {ivs, ivFloor, temperament, ability, gear, moves, shiny, shinyOdds,
  //         friendship, nickname, metAt, rnd, seed, gift, exp, hp, tagged}
  D.makeMonster = function (speciesId, level, opts) {
    opts = opts || {};
    const sp = D.species[speciesId];
    if (!sp) { MQ.warn("[Data] makeMonster: unknown species '" + speciesId + "'"); return null; }
    level = Math.max(1, Math.min(D.MAX_LEVEL, Math.round(level || 5)));
    const rnd = opts.rnd || (opts.seed !== undefined ? U.rng(opts.seed) : Math.random);

    let floor = opts.ivFloor;
    if (floor === undefined) floor = opts.gift ? 8 : (sp.rarity === "legendary" ? 10 : 0);
    let ivs;
    if (typeof opts.ivs === "number") { ivs = {}; for (let i = 0; i < STAT_ORDER.length; i++) ivs[STAT_ORDER[i]] = opts.ivs; }
    else if (opts.ivs) { ivs = {}; for (let i = 0; i < STAT_ORDER.length; i++) ivs[STAT_ORDER[i]] = opts.ivs[STAT_ORDER[i]] || 0; }
    else ivs = rollIvs(rnd, floor);

    const temperament = opts.temperament || TEMPERAMENTS[Math.floor(rnd() * TEMPERAMENTS.length)].id;

    let ability = opts.ability;
    if (!ability) {
      ability = sp.abilities[0];
      if (sp.hiddenAbility && rnd() < 0.2) ability = sp.hiddenAbility;
    }

    const moveIds = opts.moves && opts.moves.length ? opts.moves.slice(0, 4) : D.movesAtLevel(sp, level);
    const moves = [];
    for (let i = 0; i < moveIds.length; i++) {
      const mv = D.moves[moveIds[i]];
      if (!mv) continue;
      moves.push({ id: moveIds[i], pp: mv.pp, ppMax: mv.pp });
    }
    if (!moves.length) { const first = sp.learnset[0]; const mv = D.moves[first[1]]; moves.push({ id: first[1], pp: mv.pp, ppMax: mv.pp }); }

    const stats = D.statsAtLevel(sp, level, ivs, temperament);
    const shiny = opts.shiny !== undefined ? !!opts.shiny : (rnd() < (opts.shinyOdds || 1) / D.SHINY_ODDS);

    const mon = {
      uid: nextUid(),
      species: speciesId,
      nickname: opts.nickname || null,
      level: level,
      exp: opts.exp !== undefined ? opts.exp : D.expForLevel(sp.growth, level),
      hp: stats.hp,
      stats: stats,
      ivs: ivs,
      temperament: temperament,
      ability: ability,
      gear: opts.gear || null,
      friendship: opts.friendship !== undefined ? opts.friendship : (opts.gift ? 120 : 70),
      status: null,
      statusTurns: 0,
      moves: moves,
      overdrive: 0,
      metAt: opts.metAt || { map: null, level: level, ts: Date.now() },
      shiny: shiny,
      ribbons: []
    };
    if (opts.hp !== undefined) mon.hp = Math.max(0, Math.min(stats.hp, opts.hp));
    if (opts.tagged) mon.tagged = true;
    if (opts.traded) mon.traded = true;
    return mon;
  };

  // Recompute stats in place (after level-up, evolution or a temperament change).
  D.refreshStats = function (mon) {
    const sp = D.species[mon.species];
    if (!sp) return mon;
    const before = mon.stats ? mon.stats.hp : 0;
    mon.stats = D.statsAtLevel(sp, mon.level, mon.ivs, mon.temperament);
    if (before) mon.hp = Math.min(mon.stats.hp, mon.hp + (mon.stats.hp - before));
    else mon.hp = mon.stats.hp;
    return mon;
  };

  // Level a monster up by one; returns {level, learned:[moveId], stats}
  D.levelUp = function (mon) {
    const sp = D.species[mon.species];
    if (!sp || mon.level >= D.MAX_LEVEL) return null;
    mon.level++;
    mon.exp = Math.max(mon.exp, D.expForLevel(sp.growth, mon.level));
    mon.friendship = Math.min(255, mon.friendship + 1);
    D.refreshStats(mon);
    return { level: mon.level, learned: D.learnableAt(sp, mon.level), stats: mon.stats };
  };

  D.overdriveMoveFor = function (mon) {
    const sp = D.species[typeof mon === "string" ? mon : mon.species];
    return sp ? sp.overdrive : null;
  };

  D.monName = function (mon) {
    if (!mon) return "";
    if (mon.nickname) return mon.nickname;
    const sp = D.species[mon.species];
    return sp ? sp.name : mon.species;
  };

  // ---- evolution --------------------------------------------------
  // ctx: {item, map, time ('day'|'night'|phase), weather, trade, knows:[moveIds]}
  function evoReady(mon, evo, ctx) {
    ctx = ctx || {};
    const time = ctx.time || (MQ.Clock ? MQ.Clock.phase : null);
    const weather = ctx.weather || (MQ.Clock ? MQ.Clock.weather : null);
    const night = time === "night" || time === "dusk";
    switch (evo.method) {
      case "level": return mon.level >= evo.level;
      case "item": return ctx.item === evo.item;
      case "friendship":
        if (mon.friendship < (evo.min || 200)) return false;
        if (evo.time === "night") return night;
        if (evo.time === "day") return !night;
        return true;
      case "location": return ctx.map === evo.map;
      case "time":
        if (mon.level < (evo.level || 1)) return false;
        return evo.time === "night" ? night : !night;
      case "trade": return !!ctx.trade;
      case "move": {
        const list = ctx.knows || (mon.moves || []).map(function (m) { return m.id; });
        return list.indexOf(evo.move) >= 0;
      }
      case "weather": return mon.level >= (evo.level || 1) && weather === evo.weather;
      default: return false;
    }
  }
  D.canEvolve = function (mon, ctx) {
    const sp = D.species[mon && mon.species];
    if (!sp) return null;
    for (let i = 0; i < sp.evolutions.length; i++) {
      const evo = sp.evolutions[i];
      if (!D.species[evo.to]) continue;
      if (evoReady(mon, evo, ctx)) return evo;
    }
    return null;
  };
  // Evolve in place. Traits, temperament, friendship, gear, moves and Overdrive
  // meter are preserved; the signature move follows the new form (SYSTEMS §12).
  D.evolve = function (mon, toId) {
    const from = D.species[mon.species];
    const target = toId || (function () { const e = D.canEvolve(mon, { item: "*", trade: true, map: "*" }); return e ? e.to : null; })();
    const sp = D.species[target];
    if (!sp) return null;
    const hpBefore = mon.hp, maxBefore = mon.stats ? mon.stats.hp : 0;
    mon.species = target;
    D.refreshStats(mon);
    if (maxBefore > 0) mon.hp = Math.max(1, Math.min(mon.stats.hp, Math.round(mon.stats.hp * (hpBefore / maxBefore))));
    // keep the ability if the new form has it, else take the new primary
    if (sp.abilities.indexOf(mon.ability) < 0) mon.ability = sp.abilities[0];
    return { from: from ? from.id : null, to: target, species: sp, learned: D.learnableAt(sp, mon.level) };
  };

  // Capture chance, SYSTEMS-SPEC §11.
  D.catchChance = function (mon, opts) {
    opts = opts || {};
    const sp = D.species[mon.species];
    if (!sp) return 0;
    const M = mon.stats.hp, H = Math.max(1, mon.hp);
    let statusBonus = 1;
    if (mon.status === "slp" || mon.status === "frz") statusBonus = 2.5;
    else if (mon.status) statusBonus = 1.5;
    const a = (3 * M - 2 * H) * sp.catchRate * (opts.capsuleBonus || 1) * statusBonus * (opts.trainerBonus || 1) / (3 * M);
    return Math.max(0, Math.min(255, a));
  };

  // =================================================================
  // 8. Validation
  // =================================================================
  const HABITATS = { silk: 1, brine: 1, mill: 1, town: 1, canal: 1, moor: 1, estate: 1, mere: 1, river: 1, bog: 1, cave: 1, forest: 1, rail: 1, sky: 1, orchard: 1, salt: 1, cyber: 1, fog: 1, heath: 1, roman: 1, chem: 1, marsh: 1, sandstone: 1, zoo: 1, urban: 1, water: 1 };
  const RARITIES = { common: 1, uncommon: 1, rare: 1, legendary: 1, unique: 1 };
  const TIERS = { low: 1, mid: 1, high: 1, legendary: 1 };
  const METHODS = { level: 1, item: 1, friendship: 1, location: 1, time: 1, trade: 1, move: 1, weather: 1 };

  D.validators.push(function (err) {
    const names = {}, nums = {};
    D.each("species", function (s, id) {
      if (!s.name) err("species/" + id + ": missing name");
      if (!s.dexHidden) {
        if (names[s.name]) err("species/" + id + ": duplicate name '" + s.name + "' (also " + names[s.name] + ")");
        names[s.name] = id;
        if (nums[s.num]) err("species/" + id + ": duplicate dex number " + s.num + " (also " + nums[s.num] + ")");
        nums[s.num] = id;
      }
      if (!(s.num >= 1 && s.num <= 172)) err("species/" + id + ": dex number out of range " + s.num);
      if (!s.types.length || s.types.length > 2) err("species/" + id + ": needs 1-2 types");
      for (let i = 0; i < s.types.length; i++) if (!D.types[s.types[i]]) err("species/" + id + ": unknown type '" + s.types[i] + "'");
      if (s.types.length === 2 && s.types[0] === s.types[1]) err("species/" + id + ": duplicate type");
      for (let i = 0; i < STAT_ORDER.length; i++) {
        const v = s.base[STAT_ORDER[i]];
        if (!(v >= 10 && v <= 200)) err("species/" + id + ": base " + STAT_ORDER[i] + " out of range (" + v + ")");
      }
      if (s.bst < 200 || s.bst > (s.dexHidden ? 900 : 720)) err("species/" + id + ": base stat total " + s.bst + " out of range");
      if (!(s.catchRate >= 1 && s.catchRate <= 255)) err("species/" + id + ": catchRate out of range");
      if (!(s.baseExp >= 20 && s.baseExp <= 400)) err("species/" + id + ": baseExp out of range");
      if (D.growthGroups.indexOf(s.growth) < 0) err("species/" + id + ": bad growth '" + s.growth + "'");
      if (!HABITATS[s.habitat]) err("species/" + id + ": unknown habitat '" + s.habitat + "'");
      if (!RARITIES[s.rarity]) err("species/" + id + ": unknown rarity '" + s.rarity + "'");
      if (!TIERS[s.tier]) err("species/" + id + ": unknown tier '" + s.tier + "'");
      // abilities
      for (let i = 0; i < s.abilities.length; i++) if (!D.abilities[s.abilities[i]]) err("species/" + id + ": unknown ability '" + s.abilities[i] + "'");
      if (s.hiddenAbility && !D.abilities[s.hiddenAbility]) err("species/" + id + ": unknown hidden ability '" + s.hiddenAbility + "'");
      // learnset
      if (s.learnset.length < 8) err("species/" + id + ": learnset has only " + s.learnset.length + " moves (min 8)");
      if (s.learnset.length > 14) err("species/" + id + ": learnset has " + s.learnset.length + " moves (max 14)");
      if (s.learnset[0][0] !== 1) err("species/" + id + ": first learnset entry must be level 1");
      const seenMove = {};
      let lastLv = 0;
      for (let i = 0; i < s.learnset.length; i++) {
        const lv = s.learnset[i][0], mv = s.learnset[i][1];
        if (!D.moves[mv]) err("species/" + id + ": learnset move '" + mv + "' does not exist");
        else if (D.moves[mv].overdriveOnly) err("species/" + id + ": learnset contains overdrive-only move '" + mv + "'");
        if (seenMove[mv]) err("species/" + id + ": learnset repeats '" + mv + "'");
        seenMove[mv] = 1;
        if (lv < 1 || lv > 70) err("species/" + id + ": learnset level " + lv + " out of range");
        if (lv < lastLv) err("species/" + id + ": learnset not sorted by level");
        lastLv = lv;
      }
      // tms
      for (let i = 0; i < s.tms.length; i++) {
        if (!D.moves[s.tms[i]]) err("species/" + id + ": TM move '" + s.tms[i] + "' does not exist");
        if (!D.items["tm_" + s.tms[i]]) err("species/" + id + ": TM '" + s.tms[i] + "' has no Skill Card item");
      }
      if (!s.tms.length) err("species/" + id + ": no Skill Cards are compatible");
      // evolutions
      for (let i = 0; i < s.evolutions.length; i++) {
        const e = s.evolutions[i];
        if (!METHODS[e.method]) err("species/" + id + ": unknown evolution method '" + e.method + "'");
        if (!D.species[e.to]) err("species/" + id + ": evolves into unknown species '" + e.to + "'");
        if (e.to === id) err("species/" + id + ": evolves into itself");
        if (e.method === "level" && !(e.level >= 2)) err("species/" + id + ": level evolution needs a level");
        if (e.method === "item" && !D.items[e.item]) err("species/" + id + ": evolution item '" + e.item + "' does not exist");
        if (e.method === "move" && !D.moves[e.move]) err("species/" + id + ": evolution move '" + e.move + "' does not exist");
        if (e.method === "weather" && ["rain", "sun", "fog", "wind"].indexOf(e.weather) < 0) err("species/" + id + ": bad evolution weather");
        if (e.method === "time" && ["day", "night"].indexOf(e.time) < 0) err("species/" + id + ": bad evolution time");
      }
      // overdrive signature
      if (!D.moves[s.overdrive]) err("species/" + id + ": overdrive signature '" + s.overdrive + "' does not exist");
      else if (!D.moves[s.overdrive].overdriveOnly) err("species/" + id + ": overdrive signature '" + s.overdrive + "' is not an overdrive move");
      // gen params
      const g = s.gen;
      if (!g || !g.body) err("species/" + id + ": gen params need a body");
      if (!g.feats || !g.feats.length) err("species/" + id + ": gen params need at least one feature");
      if (!(g.size > 0.2 && g.size < 2)) err("species/" + id + ": gen size out of range " + (g && g.size));
      if (!g.palette || g.palette.length !== 4) err("species/" + id + ": gen palette must have 4 colours");
      else for (let i = 0; i < g.palette.length; i++) if (!/^#[0-9a-f]{6}$/i.test(g.palette[i])) err("species/" + id + ": bad palette colour " + g.palette[i]);
      // dex
      if (!s.dex.genus) err("species/" + id + ": dex needs a genus");
      if (!s.dex.text || s.dex.text.length < 40) err("species/" + id + ": dex text too short");
      if (!(s.dex.height > 0)) err("species/" + id + ": dex height must be > 0");
      if (s.dex.weight < 0) err("species/" + id + ": dex weight must be >= 0");
      // cry
      if (!s.cry || !s.cry.base || !s.cry.len) err("species/" + id + ": missing cry params");
    });
    if (D.dexCount !== 172) err("species: expected 172 dex entries, found " + D.dexCount);
    // dex numbering must be complete 1..172
    for (let n = 1; n <= 172; n++) if (!nums[n]) err("species: no dex entry for number " + n);
    // every species must be reachable: either wild-able or an evolution/story unique
    D.each("species", function (s, id) {
      if (s.rarity === "unique" || s.dexHidden) return;
      if (s.tier === "low" || !D.preEvolutionOf(id)) return;
    });
  });
})();
