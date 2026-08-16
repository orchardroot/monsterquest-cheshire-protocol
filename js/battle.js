// =============================================================
// MonsterQuest — turn-based battle engine (Gen-1 style rules)
// =============================================================
"use strict";

const STRUGGLE = { name: "Struggle", type: "Normal", kind: "phys", power: 50, acc: 100, pp: Infinity };

function stageMult(stage) {
  return Math.max(2, 2 + stage) / Math.max(2, 2 - stage);
}

class Battle {
  // opts: { mode:"wild"|"trainer", enemyParty:[monster], trainer?, game }
  constructor(game, opts) {
    this.game = game;
    this.mode = opts.mode;
    this.trainer = opts.trainer || null;
    this.enemyParty = opts.enemyParty;
    this.enemyIndex = 0;
    this.playerIndex = game.party.findIndex((m) => m.hp > 0);
    this.queue = [];         // [{text, apply}]
    this.phase = "msg";      // msg | menu | moves | party | bag | ended
    this.afterQueue = "menu";
    this.result = null;      // "win" | "lose" | "caught" | "ran"
    this.runAttempts = 0;
    this.playerStages = { atk: 0, def: 0, spd: 0 };
    this.enemyStages = { atk: 0, def: 0, spd: 0 };
    this.hitFlash = null;    // "player" | "enemy"
    this.expEarned = new Map();

    const enemy = this.enemy;
    game.markSeen(enemy.species);
    if (this.mode === "wild") {
      this.say(`Wild ${SPECIES[enemy.species].name} appeared!`);
    } else {
      this.say(`${this.trainer.name} wants to battle!`);
      this.say(`${this.trainer.name} sent out ${SPECIES[enemy.species].name}!`);
    }
    this.say(`Go! ${this.player.nickname}!`);
  }

  get player() { return this.game.party[this.playerIndex]; }
  get enemy() { return this.enemyParty[this.enemyIndex]; }

  say(text, apply) { this.queue.push({ text, apply }); }

  // ---- queue pump (UI calls on A press) -------------------------
  advance() {
    if (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item.apply) item.apply();
      return item.text;
    }
    return null;
  }

  queueDone() { return this.queue.length === 0; }

  // ---- stat helpers ---------------------------------------------
  effStat(mon, stages, stat) {
    let v = mon.stats[stat] * stageMult(stages[stat]);
    if (stat === "atk" && mon.status === "brn") v = Math.floor(v / 2);
    if (stat === "spd" && mon.status === "par") v = Math.floor(v / 4);
    return Math.max(1, Math.floor(v));
  }

  // ---- damage ---------------------------------------------------
  computeDamage(attacker, defender, atkStages, defStages, move) {
    const sp = SPECIES[attacker.species];
    const baseSpd = sp.base[3];
    let critChance = baseSpd / 512;
    if (move.highCrit) critChance = Math.min(0.9, critChance * 8);
    const crit = Math.random() < critChance;

    let a, d;
    if (move.kind === "phys") {
      a = crit ? attacker.stats.atk : this.effStat(attacker, atkStages, "atk");
      d = crit ? defender.stats.def : this.effStat(defender, defStages, "def");
    } else {
      a = attacker.stats.spc;
      d = defender.stats.spc;
    }
    const L = crit ? attacker.level * 2 : attacker.level;
    let dmg = Math.floor(Math.floor((Math.floor((2 * L) / 5 + 2) * move.power * a) / d) / 50) + 2;
    if (sp.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);
    const typeMult = typeMultiplier(move.type, SPECIES[defender.species].types);
    dmg = Math.floor(dmg * typeMult);
    dmg = Math.floor((dmg * (217 + Math.floor(Math.random() * 39))) / 255);
    if (typeMult > 0) dmg = Math.max(1, dmg);
    return { dmg, crit, typeMult };
  }

  // ---- one side uses a move -------------------------------------
  useMove(who, moveSlot) {
    const isPlayer = who === "player";
    const attacker = isPlayer ? this.player : this.enemy;
    const defender = isPlayer ? this.enemy : this.player;
    const atkStages = isPlayer ? this.playerStages : this.enemyStages;
    const defStages = isPlayer ? this.enemyStages : this.playerStages;
    const attackerName = isPlayer ? attacker.nickname : `Enemy ${SPECIES[attacker.species].name}`;
    const defenderName = isPlayer ? `Enemy ${SPECIES[defender.species].name}` : defender.nickname;

    // sleep / paralysis checks
    if (attacker.status === "slp") {
      if (attacker.sleepTurns > 0) {
        attacker.sleepTurns--;
        this.say(`${attackerName} is fast asleep!`);
        return;
      }
      attacker.status = null;
      this.say(`${attackerName} woke up!`);
    }
    if (attacker.status === "par" && Math.random() < 0.25) {
      this.say(`${attackerName} is fully paralyzed!`);
      return;
    }

    const move = moveSlot === "struggle" ? STRUGGLE : MOVES[moveSlot.id];
    if (moveSlot !== "struggle") moveSlot.pp = Math.max(0, moveSlot.pp - 1);
    this.say(`${attackerName} used ${move.name}!`);

    // accuracy
    if (move.acc < 999 && Math.random() * 100 >= move.acc) {
      this.say(`But it missed!`);
      return;
    }

    if (move.kind === "status") {
      if (move.heal) {
        const amount = Math.min(attacker.stats.hp - attacker.hp, Math.floor(attacker.stats.hp * move.heal));
        if (amount <= 0) this.say(`But it failed!`);
        else {
          attacker.hp = Math.min(attacker.stats.hp, attacker.hp + amount);
          this.say(`${attackerName} regained health!`);
        }
        return;
      }
      if (move.stat) {
        const target = move.stat.who === "self" ? attacker : defender;
        const targetStages = move.stat.who === "self" ? atkStages : defStages;
        const targetName = move.stat.who === "self" ? attackerName : defenderName;
        const s = move.stat.stat;
        const before = targetStages[s];
        const after = Math.max(-6, Math.min(6, before + move.stat.delta));
        if (before === after) {
          this.say(`But nothing happened!`);
        } else {
          targetStages[s] = after;
          const statNames = { atk: "ATTACK", def: "DEFENSE", spd: "SPEED" };
          const verb = move.stat.delta > 0 ? "rose" : "fell";
          const adverb = Math.abs(move.stat.delta) > 1 ? " sharply" : "";
          this.say(`${targetName}'s ${statNames[s]}${adverb} ${verb}!`);
        }
      } else if (move.effect) {
        this.applyStatus(defender, defenderName, move.effect, true);
      }
      return;
    }

    // damaging move
    const { dmg, crit, typeMult } = this.computeDamage(attacker, defender, atkStages, defStages, move);
    if (typeMult === 0) {
      this.say(`It doesn't affect ${defenderName}...`);
      return;
    }
    const flashTarget = isPlayer ? "enemy" : "player";
    let dealt = dmg;
    // Bigboy's "Back from the Brink": once per battle, survive a KO hit at 1 HP
    if (SPECIES[defender.species].brink && !defender.brinkUsed && defender.hp > 1 && dealt >= defender.hp) {
      dealt = defender.hp - 1;
      defender.brinkUsed = true;
      defender.hp = Math.max(0, defender.hp - dealt);
      this.say(`${defenderName} refuses to go down — back from the brink!`);
    } else {
      defender.hp = Math.max(0, defender.hp - dealt);
    }
    this.queue.push({
      text: null, // silent entry: flash + thud when the attack lands on screen
      apply: () => {
        this.hitFlash = flashTarget;
        if (typeof Sound !== "undefined") Sound.sfx(typeMult > 1 ? "hit2" : "hit");
        setTimeout(() => { this.hitFlash = null; }, 260);
      },
    });
    if (crit) this.say("A critical hit!");
    if (typeMult > 1) this.say("It's super effective!");
    if (typeMult < 1) this.say("It's not very effective...");
    if (move.effect && defender.hp > 0) {
      this.applyStatus(defender, defenderName, move.effect, false);
    }
  }

  applyStatus(target, targetName, effect, announceFail) {
    if (Math.random() * 100 >= effect.chance) return;
    if (this.wardActive && this.game.party.includes(target)) {
      this.say(`The PI WARD absorbed the effect!`);
      return;
    }
    if (target.status) {
      if (announceFail) this.say(`But it failed!`);
      return;
    }
    const texts = {
      psn: `${targetName} was poisoned!`,
      par: `${targetName} is paralyzed! It may not attack!`,
      brn: `${targetName} was burned!`,
      slp: `${targetName} fell asleep!`,
    };
    target.status = effect.status;
    if (effect.status === "slp") target.sleepTurns = 1 + Math.floor(Math.random() * 3);
    this.say(texts[effect.status]);
  }

  endOfTurnStatus(mon, name) {
    if (mon.hp <= 0) return;
    if (mon.status === "psn" || mon.status === "brn") {
      const chip = Math.max(1, Math.floor(mon.stats.hp / 16));
      const label = mon.status === "psn" ? "poison" : "its burn";
      mon.hp = Math.max(0, mon.hp - chip);
      this.say(`${name} is hurt by ${label}!`);
    }
  }

  // ---- turn resolution ------------------------------------------
  enemyPickMove() {
    const usable = this.enemy.moves.filter((m) => m.pp > 0);
    if (usable.length === 0) return "struggle";
    return usable[Math.floor(Math.random() * usable.length)];
  }

  playerTurn(action) {
    // action: {type:"move", slot} | {type:"switch", index} | {type:"item", id} | {type:"run"}
    this.phase = "msg";
    this.afterQueue = "menu";

    if (action.type === "run") {
      if (this.mode === "trainer") {
        this.say(`No! There's no running from a trainer battle!`);
        return;
      }
      this.runAttempts++;
      const pSpd = this.effStat(this.player, this.playerStages, "spd");
      const eSpd = Math.max(1, this.effStat(this.enemy, this.enemyStages, "spd"));
      const odds = pSpd >= eSpd ? 1 : pSpd / eSpd * 0.7 + this.runAttempts * 0.15;
      if (Math.random() < odds) {
        this.say(`Got away safely!`, () => { this.result = "ran"; });
        this.afterQueue = "end";
        return;
      }
      this.say(`Can't escape!`);
      this.enemyAct();
      this.endTurn();
      return;
    }

    if (action.type === "switch") {
      const incoming = this.game.party[action.index];
      this.say(`${this.player.nickname}, come back!`);
      this.playerIndex = action.index;
      this.playerStages = { atk: 0, def: 0, spd: 0 };
      this.say(`Go! ${incoming.nickname}!`);
      this.enemyAct();
      this.endTurn();
      return;
    }

    if (action.type === "item") {
      this.useItemInBattle(action.id, action.target);
      if (this.result) { this.afterQueue = "end"; return; }
      this.enemyAct();
      this.endTurn();
      return;
    }

    // move vs move: order by priority then speed
    const pMove = action.slot === "struggle" ? STRUGGLE : MOVES[action.slot.id];
    const ePick = this.enemyPickMove();
    const eMove = ePick === "struggle" ? STRUGGLE : MOVES[ePick.id];
    const pSpd = this.effStat(this.player, this.playerStages, "spd");
    const eSpd = this.effStat(this.enemy, this.enemyStages, "spd");
    const pPrio = pMove.priority || 0;
    const ePrio = eMove.priority || 0;
    let playerFirst;
    if (pPrio !== ePrio) playerFirst = pPrio > ePrio;
    else if (pSpd !== eSpd) playerFirst = pSpd > eSpd;
    else playerFirst = Math.random() < 0.5;

    if (playerFirst) {
      this.useMove("player", action.slot);
      this.checkEnemyFaint();
      if (!this.result && this.enemy.hp > 0) {
        this.useMove("enemy", ePick);
        this.checkPlayerFaint();
      }
    } else {
      this.useMove("enemy", ePick);
      this.checkPlayerFaint();
      if (!this.result && this.player.hp > 0) {
        this.useMove("player", action.slot);
        this.checkEnemyFaint();
      }
    }
    this.endTurn();
  }

  enemyAct() {
    if (this.enemy.hp <= 0) return;
    const pick = this.enemyPickMove();
    this.useMove("enemy", pick);
    this.checkPlayerFaint();
  }

  endTurn() {
    if (this.result) { this.afterQueue = "end"; return; }
    // end-of-turn chip damage (skip if battle already decided)
    const pName = this.player.nickname;
    const eName = `Enemy ${SPECIES[this.enemy.species].name}`;
    if (this.player.hp > 0 && this.enemy.hp > 0) {
      this.endOfTurnStatus(this.player, pName);
      this.checkPlayerFaint();
      if (!this.result) {
        this.endOfTurnStatus(this.enemy, eName);
        this.checkEnemyFaint();
      }
    }
    if (!this.result && this.afterQueue !== "forceSwitch") this.afterQueue = this.afterQueue === "end" ? "end" : "menu";
  }

  // ---- faint handling -------------------------------------------
  checkEnemyFaint() {
    const enemy = this.enemy;
    if (enemy.hp > 0 || enemy.fainted) return;
    enemy.fainted = true;
    this.say(`Enemy ${SPECIES[enemy.species].name} fainted!`, () => {
      if (typeof Sound !== "undefined") Sound.sfx("faint");
    });
    this.grantExp(enemy);
    const next = this.enemyParty.findIndex((m) => m.hp > 0);
    if (next === -1) {
      if (this.mode === "trainer") {
        this.say(`${this.game.playerName} defeated ${this.trainer.name}!`);
        for (const line of this.trainer.winMsg) this.say(`${this.trainer.name}: ${line}`);
        this.say(`${this.game.playerName} got $${this.trainer.payout} for winning!`, () => {
          this.game.money += this.trainer.payout;
        });
      }
      this.result = "win";
      this.afterQueue = "end";
    } else if (this.mode === "trainer") {
      this.say(`${this.trainer.name} sent out ${SPECIES[this.enemyParty[next].species].name}!`, () => {
        this.enemyIndex = next;
        this.enemyStages = { atk: 0, def: 0, spd: 0 };
        this.game.markSeen(this.enemyParty[next].species);
      });
    }
  }

  checkPlayerFaint() {
    const mon = this.player;
    if (mon.hp > 0 || mon.faintedShown) return;
    mon.faintedShown = true;
    this.say(`${mon.nickname} fainted!`, () => {
      if (typeof Sound !== "undefined") Sound.sfx("faint");
    });
    const hasMore = this.game.party.some((m) => m.hp > 0);
    if (!hasMore) {
      this.say(`${this.game.playerName} is out of usable monsters!`);
      this.say(`${this.game.playerName} whited out!`, () => { this.result = "lose"; });
      this.afterQueue = "end";
    } else {
      this.afterQueue = "forceSwitch";
    }
  }

  forceSwitch(index) {
    const incoming = this.game.party[index];
    delete incoming.faintedShown;
    this.phase = "msg";
    this.afterQueue = "menu";
    this.playerIndex = index;
    this.playerStages = { atk: 0, def: 0, spd: 0 };
    this.say(`Go! ${incoming.nickname}!`);
  }

  // ---- experience / leveling ------------------------------------
  grantExp(defeated) {
    const mon = this.player;
    if (mon.hp <= 0) return;
    const gain = Math.max(1, Math.floor((SPECIES[defeated.species].baseExp * defeated.level) / 7));
    mon.exp += gain;
    this.say(`${mon.nickname} gained ${gain} EXP!`);
    while (mon.level < 100 && mon.exp >= expForLevel(mon.level + 1)) {
      mon.level++;
      const oldMax = mon.stats.hp;
      mon.stats = statsAtLevel(mon.species, mon.level);
      mon.hp = Math.min(mon.stats.hp, mon.hp + (mon.stats.hp - oldMax));
      this.say(`${mon.nickname} grew to level ${mon.level}!`, () => {
        if (typeof Sound !== "undefined") Sound.sfx("levelup");
      });
      for (const [lvl, moveId] of SPECIES[mon.species].learnset) {
        if (lvl === mon.level && !mon.moves.some((m) => m.id === moveId)) {
          this.game.pendingLearns.push({ mon, moveId });
        }
      }
      const sp = SPECIES[mon.species];
      if (sp.evolvesTo && mon.level >= sp.evolveLevel) {
        if (!this.game.pendingEvos.some((e) => e.mon === mon)) {
          this.game.pendingEvos.push({ mon, to: sp.evolvesTo });
        }
      }
    }
  }

  // ---- items in battle ------------------------------------------
  useItemInBattle(itemId, targetIndex) {
    const item = ITEMS[itemId];
    if (item.kind === "ball") {
      if (this.mode === "trainer") {
        this.say(`The trainer blocked the CAPSULE!`, );
        this.say(`Don't be a thief!`);
        return;
      }
      this.game.removeItem(itemId, 1);
      this.throwBall(item);
      return;
    }
    if (item.kind === "agent") {
      this.usedAgents = this.usedAgents || {};
      if (this.usedAgents[itemId]) {
        this.say(`${item.name} has already run this battle.`);
        return;
      }
      this.usedAgents[itemId] = true;
      if (itemId === "sleet") {
        const e = this.enemy;
        this.enemyStages.spd = Math.max(-6, this.enemyStages.spd - 2);
        this.say(`SLEET triages the target...`);
        this.say(`${SPECIES[e.species].name}: Lv${e.level}. HP ${e.hp}/${e.stats.hp}. Moves: ${e.moves.map((m) => MOVES[m.id].name).join(", ")}.`);
        this.say(`Enemy ${SPECIES[e.species].name}'s SPEED fell sharply!`);
      } else if (itemId === "vigil") {
        for (const m of this.game.party) {
          if (m.hp > 0) { m.status = null; m.sleepTurns = 0; }
        }
        const mon = this.player;
        const healed = Math.min(mon.stats.hp - mon.hp, Math.floor(mon.stats.hp / 2));
        mon.hp += healed;
        this.say(`VIGIL escalates: ailments cleared, ${mon.nickname} recovered ${healed} HP.`);
      } else if (itemId === "arbiter") {
        this.playerStages = { atk: 0, def: 0, spd: 0 };
        this.enemyStages = { atk: 0, def: 0, spd: 0 };
        this.say(`ARBITER adjudicates: all stat changes are struck out.`);
      }
      return;
    }
    if (item.kind === "ward") {
      this.game.removeItem(itemId, 1);
      this.wardActive = true;
      this.say(`${this.game.playerName} raised the PI WARD!`);
      this.say(`The team is immune to ailments this battle.`);
      return;
    }
    const target = this.game.party[targetIndex !== undefined ? targetIndex : this.playerIndex];
    if (item.kind === "heal") {
      const healed = Math.min(item.amount, target.stats.hp - target.hp);
      this.game.removeItem(itemId, 1);
      target.hp = Math.min(target.stats.hp, target.hp + item.amount);
      this.say(`${this.game.playerName} used ${item.name}!`);
      this.say(`${target.nickname} recovered ${healed} HP!`);
    } else if (item.kind === "cure") {
      this.game.removeItem(itemId, 1);
      if (item.cures.includes(target.status)) { target.status = null; target.sleepTurns = 0; }
      this.say(`${this.game.playerName} used ${item.name}!`);
      this.say(`${target.nickname} feels much better!`);
    }
  }

  throwBall(item) {
    const enemy = this.enemy;
    this.say(`${this.game.playerName} threw a ${item.name}!`, () => {
      if (typeof Sound !== "undefined") Sound.sfx("throw");
    });
    const M = enemy.stats.hp, H = enemy.hp;
    const rate = SPECIES[enemy.species].catchRate;
    let a = ((3 * M - 2 * H) * rate * item.bonus) / (3 * M);
    if (enemy.status === "slp") a *= 2;
    else if (enemy.status) a *= 1.5;
    const caught = Math.random() * 255 < a;
    const shakes = caught ? 3 : Math.min(2, Math.floor((a / 255) * 4 * Math.random()));
    for (let i = 0; i < shakes; i++) this.say(`...it shook!`, () => {
      if (typeof Sound !== "undefined") Sound.sfx("shake");
    });
    if (caught) {
      this.say(`Gotcha! ${SPECIES[enemy.species].name} was caught!`, () => {
        if (typeof Sound !== "undefined") Sound.sfx("catch");
        this.game.markCaught(enemy.species);
        enemy.fainted = false;
        delete enemy.faintedShown;
        if (this.game.party.length < 6) {
          this.game.party.push(enemy);
        }
      });
      if (this.game.party.length >= 6) {
        this.say(`It was sent to the STORAGE BOX.`, () => { this.game.box.push(enemy); });
      }
      this.result = "caught";
      this.afterQueue = "end";
    } else {
      this.say(`Oh no! It broke free!`);
    }
  }
}
