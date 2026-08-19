// =============================================================
// MonsterQuest v2 — MQ.Progression (content)
// Trainer level curve, the three-branch perk tree, the perk-effect
// registry every other system reads, and respec costing.
// Loads BEFORE state.js (content/*.js is alphabetical) so every
// reference to MQ.Trainer is made lazily, inside a function.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const P = MQ.Progression || {};

  P.MAX_LEVEL = 50;
  P.ROW_LEVELS = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];

  // ---- trainer XP curve ------------------------------------------
  // Need to go from level n to n+1. Cumulative to 50 ≈ 6,615 XP, which
  // matches the SIDE-CONTENT source list over a full playthrough.
  P.xpForLevel = function (n) {
    if (n < 1) n = 1;
    if (n >= P.MAX_LEVEL) return Infinity;
    return 15 + 5 * (n - 1);
  };
  P.xpTotalFor = function (level) {
    let t = 0;
    for (let n = 1; n < level && n < P.MAX_LEVEL; n++) t += P.xpForLevel(n);
    return t;
  };
  P.levelForTotal = function (total) {
    let lv = 1, acc = 0;
    while (lv < P.MAX_LEVEL && acc + P.xpForLevel(lv) <= total) { acc += P.xpForLevel(lv); lv++; }
    return lv;
  };

  // XP awards by source (SYSTEMS-SPEC §8 + SIDE-CONTENT §4)
  P.XP = {
    wild: 1, trainer: 5, gym: 25, boss: 30, questStage: 10, questDone: 15,
    catch: 2, dexNew: 1, bounty: 3, warrant: 10, photo: 2, brew: 2,
    arenaTier: 20, minigame: 2, sighting: 1
  };
  // Award trainer XP for a named source. Degrades if MQ.Trainer is absent.
  P.award = function (source, n) {
    const amount = (P.XP[source] === undefined ? 0 : P.XP[source]) * (n === undefined ? 1 : n);
    if (!amount) return 0;
    if (MQ.Trainer && MQ.Trainer.addXp) return MQ.Trainer.addXp(amount, source);
    return amount;
  };

  // ---- monster level curve (SYSTEMS-SPEC §12) --------------------
  P.GROWTH = { fast: 0.8, medium: 1, slow: 1.25 };
  P.expForMonLevel = function (level, growth) {
    const k = P.GROWTH[growth] === undefined ? 1 : P.GROWTH[growth];
    return Math.floor(k * level * level * level);
  };
  P.monLevelForExp = function (exp, growth) {
    let lv = 1;
    while (lv < 100 && P.expForMonLevel(lv + 1, growth) <= exp) lv++;
    return lv;
  };
  // Stats fallback — battle/data may ship MQ.Data.statsFor; we defer to it.
  P.recalcStats = function (mon) {
    if (!mon) return null;
    if (MQ.Data && MQ.Data.statsFor) { mon.stats = MQ.Data.statsFor(mon.species, mon.level, mon.ivs); return mon.stats; }
    const sp = MQ.Data && MQ.Data.species ? MQ.Data.species[mon.species] : null;
    const base = (sp && sp.base) || { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 };
    const iv = mon.ivs || {};
    const L = mon.level || 1;
    const st = {};
    const keys = ["hp", "atk", "def", "spa", "spd", "spe"];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const b = base[k] === undefined ? 50 : base[k];
      const v = iv[k] === undefined ? 8 : iv[k];
      st[k] = k === "hp"
        ? Math.floor((2 * b + v) * L / 100) + L + 10
        : Math.floor((2 * b + v) * L / 100) + 5;
    }
    mon.stats = st;
    return st;
  };

  // ---- passive trainer-level effects (SYSTEMS-SPEC §8) -----------
  function tl() { return (MQ.Trainer && MQ.Trainer.level) || 1; }
  P.catchRateBonus = function () { return Math.min(0.30, tl() * 0.01); };          // +1%/level, cap +30%
  P.obedienceCap = function () { return 10 + 2 * tl(); };                          // traded/gifted monsters
  P.trinketSlots = function () { const l = tl(); return l >= 35 ? 2 : l >= 20 ? 1 : 0; };
  P.numericTraits = function () { return tl() >= 20; };                            // traits shown as numbers

  // =============================================================
  // PERK TREE  (SYSTEMS-SPEC §8; ids fixed by ROSTER §10)
  // Every node: id, branch, row (0-9 → unlock level ROW_LEVELS[row]),
  // ranks[] of {name, desc, effects{}}. Cost is 1 point per rank.
  // =============================================================
  const T = [];
  function node(branch, slug, row, ranks) {
    const n = { id: "perk_" + branch + "_" + slug, branch: branch, slug: slug, row: row,
      level: P.ROW_LEVELS[row], maxRank: ranks.length, cost: 1,
      name: ranks[0].name, desc: ranks[0].desc, ranks: ranks };
    T.push(n);
    return n;
  }
  const R = function (name, desc, effects) { return { name: name, desc: desc, effects: effects || {} }; };

  // ---- TRIAGE (SLEET) — offence, speed, scouting -----------------
  node("triage", "focused", 0, [R("Focused", "Everything you send out crits more often. Crit stage +1.", { critStage: 1 })]);
  node("triage", "exploit", 1, [R("Exploit", "You know where the seams are. Super-effective hits do ×2.2 instead of ×2.", { superEffective: 2.2 })]);
  node("triage", "first_strike", 2, [R("First Strike", "The first exchange is yours. +10% damage on turn one.", { turn1DamageMult: 1.1 })]);
  node("triage", "overclocker", 3, [R("Overclocker", "Overdrive builds 25% faster.", { overdriveGainMult: 1.25 })]);
  node("triage", "big_game", 4, [R("Big Game", "+10% damage against bosses and gym aces.", { bossDamageMult: 1.1 })]);
  node("triage", "tracker", 5, [
    R("Tracker", "The encounter table for the tile you are standing on is shown.", { showEncounterTable: true }),
    R("Ambush", "Against wild monsters you begin at +1 Speed stage.", { wildAmbushSpeStage: 1 })
  ]);
  node("triage", "quick_draw", 6, [R("Quick Draw", "Once per battle your first move gains +1 priority.", { quickDraw: true })]);
  node("triage", "trailblazer", 7, [
    R("Trailblazer", "You run 8% faster in the overworld. The dog-walkers notice.", { runSpeedMult: 1.08 }),
    R("Deep Cuts", "Recoil damage you take is halved.", { recoilMult: 0.5 })
  ]);
  node("triage", "sharp_triage", 8, [R("Sharp Triage", "SLEET's cooldown is one turn shorter.", { sleetCooldown: -1 })]);
  node("triage", "kill_chain", 9, [R("Kill Chain", "Each knockout grants +1 Atk and +1 SpA for the rest of the battle, and the knockout turn ignores the foe's positive stages.", { killChain: true })]);

  // ---- ESCALATE (VIGIL) — healing, status, the cats --------------
  node("escalate", "containment", 0, [R("Containment", "Status conditions inflicted on your team last one turn less.", { statusTurnsSelf: -1 })]);
  node("escalate", "patch", 1, [R("Patch", "Healing items from the bag restore 25% more.", { bagHealMult: 1.25 })]);
  node("escalate", "steady", 2, [R("Steady", "Negative stat stages applied to your monsters are halved.", { ownNegativeStageMult: 0.5 })]);
  node("escalate", "second_wind", 3, [R("Second Wind", "A monster switching in recovers 1/16 of its HP.", { switchInHealFrac: 0.0625 })]);
  node("escalate", "isolation", 4, [
    R("Isolation", "Switching out never eats a free hit.", { freeSwitch: true }),
    R("Umbrella Discipline", "Your party ignores Fog entirely.", { ignoreFog: true })
  ]);
  node("escalate", "rollback", 5, [R("Rollback", "Once per gauntlet or Arena run, revert a single faint.", { rollbackFaints: 1 })]);
  node("escalate", "fail_safe_protocol", 6, [
    R("Fail-Safe Protocol", "BIGBOY's Back from the Brink triggers twice per battle.", { brinkUses: 2 }),
    R("Quiet Cat", "MEADOW's Slipstream grants +2 instead of +1.", { meadowSlipstreamStage: 2 })
  ]);
  node("escalate", "cat_handler", 7, [
    R("Cat Handler", "Trust with MEADOW and BIGBOY grows half again as fast.", { trustGainMult: 1.5 }),
    R("Bond", "Friendship gains ×1.5 for the whole party.", { friendshipGainMult: 1.5 })
  ]);
  node("escalate", "escalation", 8, [R("Escalation", "VIGIL's cooldown is one turn shorter and it heals 10% more.", { vigilCooldown: -1, vigilHealMult: 1.1 })]);
  node("escalate", "incident_commander", 9, [R("Incident Commander", "When one of your monsters faints, the rest of the party gains +1 Def and +1 SpD.", { incidentCommander: true })]);

  // ---- ADJUDICATE (ARBITER) — control, catching, information -----
  node("adjudicate", "enumerate", 0, [R("Enumerate", "You can see the foe's move list.", { showFoeMoves: true })]);
  node("adjudicate", "fingerprint", 1, [
    R("Fingerprint", "The foe's ability and traits are visible.", { showFoeAbility: true }),
    R("Naturalist", "Your own traits and temperaments are shown as numbers.", { showOwnTraits: true })
  ]);
  node("adjudicate", "timeline", 2, [R("Timeline", "Turn order is shown before you commit.", { showTurnOrder: true })]);
  node("adjudicate", "steady_hand", 3, [R("Steady Hand", "The capture timing window is half again as wide.", { captureWindowMult: 1.5 })]);
  node("adjudicate", "soft_touch", 4, [
    R("Soft Touch", "Every capsule gets +0.2 to its catch bonus.", { capsuleBonusAdd: 0.2 }),
    R("Golden Ratio", "Rare-palette odds are doubled.", { shinyOddsMult: 2 })
  ]);
  node("adjudicate", "zero_trust", 5, [R("Zero Trust", "You ignore the foe's positive stat stages.", { ignoreFoePositiveStages: true })]);
  node("adjudicate", "phase_break", 6, [
    R("Phase Break", "Boss phase-transition healing is capped at 15% instead of 30%.", { bossPhaseHealCap: 0.15 }),
    R("Sniper", "Critical hits deal ×2 instead of ×1.5.", { critDamageMult: 2 })
  ]);
  node("adjudicate", "ledger_keeper", 7, [
    R("Ledger Keeper", "Prize money ×1.25.", { moneyMult: 1.25 }),
    R("Trader", "Shops charge you 10% less.", { shopPriceMult: 0.9 }),
    R("Wide Share", "Non-participants take 75% XP instead of 50%.", { xpShareRatio: 0.75 })
  ]);
  node("adjudicate", "iron_bell", 8, [R("Iron Bell", "ARBITER's cooldown is two turns shorter.", { arbiterCooldown: -2 })]);
  node("adjudicate", "attribution", 9, [
    R("Attribution", "Once per battle, copy the foe's stat stages wholesale.", { attribution: true }),
    R("Overkill", "25% of your Overdrive meter carries over between battles.", { overdriveCarryFrac: 0.25 })
  ]);

  P.tree = T;
  P.BRANCHES = ["triage", "escalate", "adjudicate"];
  P.BRANCH_INFO = {
    triage: { name: "TRIAGE", agent: "sleet", blurb: "Offence, speed and scouting. What you do in the first sixty seconds." },
    escalate: { name: "ESCALATE", agent: "vigil", blurb: "Healing, status and the cats. What you do when it has already gone wrong." },
    adjudicate: { name: "ADJUDICATE", agent: "arbiter", blurb: "Stat control, catching and information. What you write in the report." }
  };
  const byId = {};
  for (let i = 0; i < T.length; i++) byId[T[i].id] = T[i];
  P.nodes = byId;
  P.node = function (id) { return byId[id] || null; };
  P.branch = function (b) { return T.filter(function (n) { return n.branch === b; }); };
  P.agentNode = function (branch) { return P.branch(branch).filter(function (n) { return n.row === 8; })[0]; };

  // ---- effect registry -------------------------------------------
  // How the values of a key combine when several perks touch it.
  const KIND = {
    critStage: "add", superEffective: "max", turn1DamageMult: "mul", overdriveGainMult: "mul",
    bossDamageMult: "mul", showEncounterTable: "flag", wildAmbushSpeStage: "add", quickDraw: "flag",
    runSpeedMult: "mul", recoilMult: "mul", sleetCooldown: "add", killChain: "flag",
    statusTurnsSelf: "add", bagHealMult: "mul", ownNegativeStageMult: "mul", switchInHealFrac: "max",
    freeSwitch: "flag", ignoreFog: "flag", rollbackFaints: "add", brinkUses: "max",
    meadowSlipstreamStage: "max", trustGainMult: "mul", friendshipGainMult: "mul",
    vigilCooldown: "add", vigilHealMult: "mul", incidentCommander: "flag",
    showFoeMoves: "flag", showFoeAbility: "flag", showOwnTraits: "flag", showTurnOrder: "flag",
    captureWindowMult: "mul", capsuleBonusAdd: "add", shinyOddsMult: "mul",
    ignoreFoePositiveStages: "flag", bossPhaseHealCap: "min", critDamageMult: "max",
    moneyMult: "mul", shopPriceMult: "mul", xpShareRatio: "max",
    arbiterCooldown: "add", attribution: "flag", overdriveCarryFrac: "max"
  };
  const BASE = {
    critStage: 0, superEffective: 2, turn1DamageMult: 1, overdriveGainMult: 1, bossDamageMult: 1,
    showEncounterTable: false, wildAmbushSpeStage: 0, quickDraw: false, runSpeedMult: 1, recoilMult: 1,
    sleetCooldown: 0, killChain: false, statusTurnsSelf: 0, bagHealMult: 1, ownNegativeStageMult: 1,
    switchInHealFrac: 0, freeSwitch: false, ignoreFog: false, rollbackFaints: 0, brinkUses: 1,
    meadowSlipstreamStage: 1, trustGainMult: 1, friendshipGainMult: 1, vigilCooldown: 0, vigilHealMult: 1,
    incidentCommander: false, showFoeMoves: false, showFoeAbility: false, showOwnTraits: false,
    showTurnOrder: false, captureWindowMult: 1, capsuleBonusAdd: 0, shinyOddsMult: 1,
    ignoreFoePositiveStages: false, bossPhaseHealCap: 0.30, critDamageMult: 1.5,
    moneyMult: 1, shopPriceMult: 1, xpShareRatio: 0.5, arbiterCooldown: 0,
    attribution: false, overdriveCarryFrac: 0
  };
  P.EFFECT_KIND = KIND;
  P.EFFECT_BASE = BASE;

  // Cached fold of every owned perk rank. Invalidated on 'trainer:perks'.
  let cache = null;
  function fold() {
    if (cache) return cache;
    const out = {};
    const ks = Object.keys(BASE);
    for (let i = 0; i < ks.length; i++) out[ks[i]] = BASE[ks[i]];
    const Tr = MQ.Trainer;
    if (Tr && Tr.perkRanks) {
      const ids = Object.keys(Tr.perkRanks);
      for (let i = 0; i < ids.length; i++) {
        const n = byId[ids[i]];
        if (!n) continue;
        const rank = Tr.perkRanks[ids[i]] | 0;
        for (let r = 0; r < rank && r < n.ranks.length; r++) {
          const eff = n.ranks[r].effects;
          const eks = Object.keys(eff);
          for (let j = 0; j < eks.length; j++) {
            const k = eks[j], v = eff[k], kind = KIND[k] || "max";
            if (kind === "add") out[k] = (out[k] || 0) + v;
            else if (kind === "mul") out[k] = (out[k] === undefined ? 1 : out[k]) * v;
            else if (kind === "flag") out[k] = out[k] || !!v;
            else if (kind === "min") out[k] = Math.min(out[k] === undefined ? v : out[k], v);
            else out[k] = Math.max(out[k] === undefined ? v : out[k], v);
          }
        }
      }
    }
    cache = out;
    return out;
  }
  P.invalidate = function () { cache = null; };
  P.effects = function () { return fold(); };
  // Read one effect key (falls back to the documented base value).
  P.effect = function (key, base) {
    const f = fold();
    if (f[key] !== undefined) return f[key];
    return base !== undefined ? base : (BASE[key] !== undefined ? BASE[key] : 0);
  };
  // Does the trainer own this perk (at rank `rank`, default 1)?
  P.has = function (perkId, rank) {
    const Tr = MQ.Trainer;
    if (!Tr) return false;
    if (Tr.perkRanks && Tr.perkRanks[perkId] !== undefined) return Tr.perkRanks[perkId] >= (rank || 1);
    if (Tr.perks && Tr.perks.has) return Tr.perks.has(perkId) && (rank || 1) <= 1;
    return false;
  };
  P.rank = function (perkId) {
    const Tr = MQ.Trainer;
    if (!Tr || !Tr.perkRanks) return 0;
    return Tr.perkRanks[perkId] | 0;
  };

  // Convenience readers used by battle/overworld/UI.
  P.critStage = function () { return P.effect("critStage"); };
  P.catchMultiplier = function () { return 1 + P.catchRateBonus(); };
  P.capsuleBonus = function (base) { return (base || 1) + P.effect("capsuleBonusAdd"); };
  P.moneyMult = function () { return P.effect("moneyMult"); };
  P.shopPriceMult = function () { return P.effect("shopPriceMult"); };
  P.xpShareRatio = function () { return P.effect("xpShareRatio"); };
  P.bagHealMult = function () { return P.effect("bagHealMult"); };
  P.trustGainMult = function () { return P.effect("trustGainMult"); };
  P.runSpeedMult = function () { return P.effect("runSpeedMult"); };
  P.overdriveGainMult = function () { return P.effect("overdriveGainMult"); };
  P.superEffectiveMult = function () { return P.effect("superEffective"); };
  P.bossPhaseHealCap = function () { return P.effect("bossPhaseHealCap"); };
  P.agentCooldownMod = function (agentId) {
    if (agentId === "sleet") return P.effect("sleetCooldown");
    if (agentId === "vigil") return P.effect("vigilCooldown");
    if (agentId === "arbiter") return P.effect("arbiterCooldown");
    return 0;
  };

  // ---- buying / respec -------------------------------------------
  P.spentIn = function (branch) {
    const Tr = MQ.Trainer;
    if (!Tr || !Tr.perkRanks) return 0;
    let n = 0;
    const ids = Object.keys(Tr.perkRanks);
    for (let i = 0; i < ids.length; i++) {
      const nd = byId[ids[i]];
      if (nd && nd.branch === branch) n += Tr.perkRanks[ids[i]] | 0;
    }
    return n;
  };
  P.spentTotal = function () {
    let n = 0;
    for (let i = 0; i < P.BRANCHES.length; i++) n += P.spentIn(P.BRANCHES[i]);
    return n;
  };
  // Why can't I take this? → null when you can, otherwise a player-facing reason.
  P.blockedReason = function (perkId) {
    const n = byId[perkId];
    if (!n) return "No such perk.";
    const Tr = MQ.Trainer;
    if (!Tr) return "No trainer.";
    const rank = P.rank(perkId);
    if (rank >= n.maxRank) return "Already at full rank.";
    if (Tr.level < n.level) return "Needs Trainer Level " + n.level + ".";
    if (P.spentIn(n.branch) < n.row) return "Needs " + n.row + " points in " + P.BRANCH_INFO[n.branch].name + ".";
    if (Tr.perkPoints < n.cost) return "Not enough perk points.";
    return null;
  };
  P.canBuy = function (perkId) { return P.blockedReason(perkId) === null; };
  // Casebook Marks to wipe the tree — grows with how much you have spent.
  P.respecCost = function () { return Math.min(50, 5 + Math.floor(P.spentTotal() * 1.5)); };

  MQ.Progression = P;
  MQ.Events.on("trainer:perks", function () { P.invalidate(); });
  MQ.Events.on("load", function () { P.invalidate(); });
  MQ.Events.on("newgame", function () { P.invalidate(); });
})();
