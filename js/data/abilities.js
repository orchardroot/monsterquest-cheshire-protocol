// =============================================================
// MonsterQuest v2 — js/data/abilities.js  (data workstream)
// MQ.Data.abilities — the 30 abilities of ROSTER §3 / SYSTEMS-SPEC §2.
//
// This file DECLARES abilities only: name, player-facing desc, `impl` key
// (always === id) and the hook names the battle layer must wire up.
// The rules themselves live in js/battle/effects.js keyed by `impl`.
// `params` carries the numbers so the battle layer never hard-codes them.
//
// Hook vocabulary (SYSTEMS-SPEC §2):
//   onSwitchIn onBeforeMove onModifyDamage onAfterHit onStatusApply
//   onEndTurn onFaint onWeather onStageChange onModifyStat onKO onTryHit
// Suppression: `Rootkit` sets mon.abilityOff = 3; every hook checks it first.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const D = MQ.Data;

  function A(id, name, hooks, params, desc, flavour) {
    return D.define("abilities", id, {
      name: name,
      impl: id,
      hooks: hooks,
      params: params || {},
      desc: desc,
      flavour: flavour || ""
    });
  }

  A("back_from_the_brink", "Back from the Brink",
    ["onTryHit", "onFaint"], { oncePerBattle: true, minHpFrac: 0.5, twicePerk: "perk_escalate_fail_safe_protocol" },
    "Once per battle, a hit that would knock it out from over half health leaves it on 1 HP.",
    "It has done this before. It will do it again. It is not sorry.");

  A("slipstream", "Slipstream",
    ["onSwitchIn"], { stat: "spe", delta: 1, perkDelta: 2, perk: "perk_escalate_quiet_cat" },
    "Speed rises by one stage the moment it enters battle.",
    "She was already gone when you looked.");

  A("silk_weave", "Silk Weave",
    ["onAfterHit"], { chance: 30, stat: "spe", delta: -1, requires: "contact" },
    "Contact moves used against it have a 30% chance to drop the attacker's Speed.",
    "The thread is on you now. It has been for a while.");

  A("brine_body", "Brine Body",
    ["onStatusApply", "onEndTurn", "onWeather"], { immune: ["brn"], healFrac: 0.0625, healWeather: "rain" },
    "Cannot be burnt, and recovers a sixteenth of its health each turn in Rain.",
    "Salt in the skin. Nothing catches light.");

  A("salt_crust", "Salt Crust",
    ["onModifyDamage"], { mult: 0.75, vs: ["rock", "ground"], offTerrain: "wet" },
    "Takes three-quarters damage from Rock and Ground moves. The crust dissolves on Wet terrain.",
    "White, flaking, structural.");

  A("firebox", "Firebox",
    ["onModifyDamage"], { mult: 1.5, type: "fire", hpAtMost: 0.3334 },
    "Fire moves hit half again as hard when its health is a third or less.",
    "The doors come open when the pressure drops.");

  A("overclock", "Overclock",
    ["onModifyDamage", "onAfterHit"], { mult: 1.3, type: "cyber", recoilFrac: 0.0625 },
    "Cyber moves deal 30% more, at the cost of a sixteenth of its own health each time one lands.",
    "Thermals are a suggestion.");

  A("sandbox", "Sandbox",
    ["onStatusApply", "onModifyDamage"], { immune: ["psn", "tox"], mult: 0.5, vs: ["poison"] },
    "Immune to Poison and Toxic, and takes half damage from Poison moves.",
    "Detonate it in here. See if we care.");

  A("rootkit", "Rootkit",
    ["onSwitchIn"], { suppressTurns: 3 },
    "On entering battle, suppresses the opposing monster's ability for three turns.",
    "It was in the boot sector before you got here.");

  A("honeypot", "Honeypot",
    ["onTryHit"], { redirect: "status", stat: "highestAttack", delta: -1 },
    "When targeted by a status move, the move fails and its user loses a stage of its best attacking stat instead.",
    "You went for the obvious one. Of course you did.");

  A("proxy_fog", "Proxy Fog",
    ["onSwitchIn"], { weather: "fog", turns: 4 },
    "Draws in Fog for four turns on entering battle.",
    "Every address a neighbour's. Every neighbour a stranger.");

  A("rain_caller", "Rain Caller",
    ["onSwitchIn"], { weather: "rain", turns: 5 },
    "Brings Rain for five turns on entering battle.",
    "In Cheshire this counts as doing nothing at all.");

  A("ridge_wind", "Ridge Wind",
    ["onSwitchIn"], { weather: "wind", turns: 4 },
    "Calls the ridge Wind for four turns on entering battle.",
    "Off the edge, straight through the fleece.");

  A("damp_squib", "Damp Squib",
    ["onModifyDamage"], { mult: 0.5, vs: ["fire"], weather: "rain" },
    "Fire moves used against it deal half damage while it is raining.",
    "Nothing lights. Nothing ever lights.");

  A("thick_fleece", "Thick Fleece",
    ["onModifyDamage", "onEndTurn", "onWeather"], { mult: 0.9, vsCat: "spec", nullifyChip: ["water", "wind", "cold"] },
    "Weather chip damage does nothing, and special moves deal 10% less.",
    "Four inches of wool and an opinion.");

  A("iron_will", "Iron Will",
    ["onTryHit", "onStageChange"], { noFlinch: true, noFoeDrops: true },
    "Cannot be made to flinch, and the foe cannot lower its stats.",
    "It has been stood there since 1873.");

  A("nightshift", "Nightshift",
    ["onBeforeMove"], { priorityDelta: 1, cat: "status", nightFrom: 20 * 60, nightTo: 6 * 60 },
    "Its status moves go first at night.",
    "Half two in the morning and wide awake, thanks.");

  A("cheshire_grin", "Cheshire Grin",
    ["onAfterHit"], { chance: 25, status: "cnf" },
    "Any hit it lands has a one-in-four chance of leaving the target confused.",
    "It is smiling. That is the whole problem.");

  A("deep_roots", "Deep Roots",
    ["onTryHit", "onEndTurn"], { noForceSwitch: true, healFrac: 0.125, healTerrain: "grass" },
    "Cannot be forced out, and recovers an eighth of its health each turn on Grass terrain.",
    "Laid, pegged and staying.");

  A("static_charge", "Static Charge",
    ["onAfterHit"], { chance: 30, status: "par", requires: "contact" },
    "Contact moves used against it have a 30% chance of paralysing the attacker.",
    "Everything in the shed clicks when you walk past.");

  A("signal_jammer", "Signal Jammer",
    ["onBeforeMove"], { chance: 30, failFlag: "charge" },
    "The foe's charging moves fail 30% of the time.",
    "Something in the noise floor eats the handshake.");

  A("scavenger", "Scavenger",
    ["onKO"], { healFrac: 0.25 },
    "Recovers a quarter of its health whenever it knocks a foe out.",
    "Waste not.");

  A("wetlander", "Wetlander",
    ["onModifyStat", "onWeather"], { stat: "spe", mult: 1.5, weather: "rain" },
    "Half again as fast in the Rain.",
    "Bred for a county that is mostly puddle.");

  A("sun_trap", "Sun Trap",
    ["onModifyStat", "onWeather"], { stat: "spa", mult: 1.5, weather: "sun" },
    "Special Attack rises by half in the Sun.",
    "Three days a year, and it makes the most of them.");

  A("cold_storage", "Cold Storage",
    ["onStatusApply"], { immune: ["frz", "slp"], whileHpAbove: 0.5 },
    "Cannot be frozen or put to sleep while over half health.",
    "Kept at four degrees, indefinitely.");

  A("payload", "Payload",
    ["onModifyDamage"], { mult: 1.5, firstDamagingMove: true },
    "The first damaging move it uses each time it enters battle deals half again as much.",
    "It only had one job, and it brought it with it.");

  A("fail_safe", "Fail-Safe",
    ["onEndTurn", "onAfterHit"], { hpBelow: 0.25, stages: { def: 2, spd: 2 }, once: true },
    "The first time its health drops below a quarter, Defence and Special Defence rise sharply.",
    "The interlock trips. It always trips.");

  A("loud_bell", "Loud Bell",
    ["onModifyDamage", "onTryHit"], { mult: 1.3, flag: "sound", immuneToSound: true },
    "Sound moves it uses deal 30% more; sound moves used against it do nothing.",
    "You cannot deafen a bell.");

  A("stonemason", "Stonemason",
    ["onModifyDamage", "onBeforeMove"], { mult: 1.2, type: "rock", neverMissWeather: "wind" },
    "Rock moves deal 20% more, and never miss in the Wind.",
    "Measured once. Cut once.");

  A("kernel_panic", "Kernel Panic",
    ["onFaint"], { drainAll: true },
    "When it faints, the move that finished it loses all its PP.",
    "It takes the log file with it.");

  // ---- helpers ----------------------------------------------------
  D.abilityName = function (id) { const a = D.abilities[id]; return a ? a.name : String(id); };
  D.abilityDesc = function (id) { const a = D.abilities[id]; return a ? a.desc : ""; };
  D.abilitiesWithHook = function (hook) {
    return D.filter("abilities", function (a) { return a.hooks.indexOf(hook) >= 0; });
  };

  // ---- validation -------------------------------------------------
  const HOOKS = {
    onSwitchIn: 1, onBeforeMove: 1, onModifyDamage: 1, onAfterHit: 1, onStatusApply: 1,
    onEndTurn: 1, onFaint: 1, onWeather: 1, onStageChange: 1, onModifyStat: 1, onKO: 1, onTryHit: 1
  };
  D.validators.push(function (err) {
    const names = {};
    D.each("abilities", function (a, id) {
      if (!a.name) err("abilities/" + id + ": missing name");
      if (names[a.name]) err("abilities/" + id + ": duplicate name '" + a.name + "'");
      names[a.name] = id;
      if (a.impl !== id) err("abilities/" + id + ": impl key '" + a.impl + "' must equal the id");
      if (!a.desc) err("abilities/" + id + ": missing desc");
      if (!a.hooks || !a.hooks.length) err("abilities/" + id + ": declares no hooks");
      for (let i = 0; i < (a.hooks || []).length; i++) if (!HOOKS[a.hooks[i]]) err("abilities/" + id + ": unknown hook '" + a.hooks[i] + "'");
      const p = a.params || {};
      if (p.type && !D.types[p.type]) err("abilities/" + id + ": params.type unknown type '" + p.type + "'");
      if (p.vs) for (let j = 0; j < p.vs.length; j++) if (!D.types[p.vs[j]]) err("abilities/" + id + ": params.vs unknown type '" + p.vs[j] + "'");
      if (p.weather && ["rain", "sun", "fog", "wind"].indexOf(p.weather) < 0) err("abilities/" + id + ": bad params.weather");
    });
    if (D.count("abilities") !== 30) err("abilities: expected 30, found " + D.count("abilities"));
  });
})();
