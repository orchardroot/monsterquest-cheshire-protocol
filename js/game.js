// =============================================================
// MonsterQuest — main engine: overworld, UI, story, battle UI
// =============================================================
"use strict";

const TILE = 32;
const SCREEN_W = 480;
const SCREEN_H = 384;
const SAVE_KEY = "monsterquest_save";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

buildTiles();

// ---- input ------------------------------------------------------
const KEY_MAP = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  W: "up", S: "down", A: "left", D: "right",
  z: "a", Z: "a", Enter: "a", " ": "a",
  x: "b", X: "b", Backspace: "b",
  Escape: "start",
};
const held = new Set();

window.addEventListener("keydown", (e) => {
  const btn = KEY_MAP[e.key];
  if (!btn) return;
  e.preventDefault();
  if (!e.repeat) onPress(btn);
  held.add(btn);
});
window.addEventListener("keyup", (e) => {
  const btn = KEY_MAP[e.key];
  if (btn) held.delete(btn);
});
window.addEventListener("blur", () => held.clear());

// ---- game state -------------------------------------------------
const G = {
  mode: "title",         // title | overworld | dialog | menu | party | summary | bag | dex | trainercard | shop | battle | transition
  playerName: "RILEY",
  map: "home", x: 2, y: 5, dir: "down",
  moving: false, moveProgress: 0, moveFrom: null,
  turnLock: 0,
  party: [], box: [], bag: {}, money: 3000,
  coins: 0, steps: 0, daycareMon: null,
  flags: {}, seen: {}, caught: {},
  healPoint: { map: "home", x: 4, y: 6, dir: "up" },
  battle: null,
  pendingLearns: [], pendingEvos: [],
  dialog: null, menu: null, partyUi: null, bagUi: null, shopUi: null, dexUi: null,
  titleIdx: 0, titleTick: 0,
  transition: null,

  markSeen(sp) { this.seen[sp] = true; },
  markCaught(sp) { this.seen[sp] = true; this.caught[sp] = true; },
  addItem(id, n) { this.bag[id] = (this.bag[id] || 0) + n; },
  removeItem(id, n) {
    this.bag[id] = (this.bag[id] || 0) - n;
    if (this.bag[id] <= 0) delete this.bag[id];
  },
};

function currentMap() { return MAPS[G.map]; }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

function newGame() {
  G.party = []; G.box = []; G.money = 3000;
  G.coins = 0; G.steps = 0; G.daycareMon = null;
  G.bag = { potion: 2 };
  G.flags = {}; G.seen = {}; G.caught = {};
  G.map = "home"; G.x = 2; G.y = 5; G.dir = "down";
  G.healPoint = { map: "home", x: 4, y: 6, dir: "up" };
  G.mode = "overworld";
  showDialog([
    "MOM: Oh, " + G.playerName + "! Prof. MAPLE from the LAB was looking for you.",
    "MOM: Something about choosing your very first monster... How exciting!",
    "MOM: The LAB is the big building on the right side of town.",
  ]);
}

function saveGame() {
  const data = {
    playerName: G.playerName, party: G.party, box: G.box, bag: G.bag,
    money: G.money, coins: G.coins, steps: G.steps, daycareMon: G.daycareMon,
    flags: G.flags, seen: G.seen, caught: G.caught,
    map: G.map, x: G.x, y: G.y, dir: G.dir, healPoint: G.healPoint,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}

function loadGame() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    Object.assign(G, {
      playerName: data.playerName, party: data.party, box: data.box || [],
      bag: data.bag, money: data.money, coins: data.coins || 0,
      steps: data.steps || 0, daycareMon: data.daycareMon || null,
      flags: data.flags,
      seen: data.seen || {}, caught: data.caught || {},
      map: data.map, x: data.x, y: data.y, dir: data.dir,
      healPoint: data.healPoint,
    });
    G.mode = "overworld";
    return true;
  } catch (e) { return false; }
}

// ---- text helpers -----------------------------------------------
function wrapText(text, maxChars) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if (line.length + w.length + 1 > maxChars && line) { lines.push(line); line = w; }
    else line = line ? line + " " + w : w;
  }
  if (line) lines.push(line);
  return lines;
}

// ---- dialog system ----------------------------------------------
// showDialog(pages, {choices, choiceCancel, onChoice, onDone})
function showDialog(pages, opts = {}) {
  G.prevMode = G.mode === "dialog" ? G.prevMode : G.mode;
  G.mode = "dialog";
  G.dialog = {
    pages: pages.slice(), page: 0, chars: 0,
    choices: opts.choices || null, choiceIdx: 0,
    choiceCancel: opts.choiceCancel !== false,
    onChoice: opts.onChoice || null,
    onDone: opts.onDone || null,
    showingChoices: false,
  };
}

function dialogPress(btn) {
  const d = G.dialog;
  if (!d) return;
  const fullLen = d.pages[d.page].length;
  if (d.showingChoices) {
    if (btn === "up") d.choiceIdx = (d.choiceIdx + d.choices.length - 1) % d.choices.length;
    else if (btn === "down") d.choiceIdx = (d.choiceIdx + 1) % d.choices.length;
    else if (btn === "a") { closeDialog(); if (d.onChoice) d.onChoice(d.choiceIdx); }
    else if (btn === "b" && d.choiceCancel) { closeDialog(); if (d.onChoice) d.onChoice(-1); }
    return;
  }
  if (btn === "a" || btn === "b") {
    if (d.chars < fullLen) { d.chars = fullLen; return; }
    if (d.page < d.pages.length - 1) { d.page++; d.chars = 0; return; }
    if (d.choices) { d.showingChoices = true; return; }
    closeDialog();
    if (d.onDone) d.onDone();
  }
}

function closeDialog() {
  G.dialog = null;
  G.mode = G.prevMode === "battle" ? "overworld" : (G.prevMode || "overworld");
  if (G.mode === "dialog") G.mode = "overworld";
}

// ---- transitions ------------------------------------------------
function startTransition(next) {
  G.mode = "transition";
  G.transition = { t: 0, dur: 700, next };
}

// ---- overworld movement -----------------------------------------
function passable(map, x, y) {
  if (isSolid(map, x, y)) return false;
  for (const npc of map.npcs || []) {
    if (npcHidden(npc)) continue;
    const p = npcPos(npc);
    if (p.x === x && p.y === y) return false;
  }
  return true;
}

function npcHidden(npc) {
  if (npc.hideIfFlag && G.flags[npc.hideIfFlag]) return true;
  if (npc.showIfFlag && !G.flags[npc.showIfFlag]) return true;
  if (npc.type === "legendary" && G.flags[npc.flag]) return true;
  if (npc.needBadges && badgeCount() >= npc.needBadges) return true;
  return false;
}

function npcPos(npc) {
  if (npc.afterX !== undefined && npc.trainerId && G.flags["defeated_" + npc.trainerId]) {
    return { x: npc.afterX, y: npc.afterY };
  }
  return { x: npc.x, y: npc.y };
}

const BADGES = [
  ["badge", "QUARRY"], ["badge2", "TIDE"], ["badge3", "CINDER"], ["badge4", "MIND"],
];
function badgeCount() {
  return BADGES.filter(([f]) => G.flags[f]).length;
}

const DIR_DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function updateOverworld(dt) {
  if (G.moving) {
    G.moveProgress += dt / 190;
    if (G.moveProgress >= 1) {
      G.moving = false;
      G.moveProgress = 0;
      arriveAtTile();
    }
    return;
  }
  if (G.turnLock > 0) { G.turnLock -= dt; }
  for (const dir of ["up", "down", "left", "right"]) {
    if (!held.has(dir)) continue;
    if (G.dir !== dir) {
      G.dir = dir;
      G.turnLock = 90;
      return;
    }
    if (G.turnLock > 0) return;
    const [dx, dy] = DIR_DELTA[dir];
    const nx = G.x + dx, ny = G.y + dy;
    if (passable(currentMap(), nx, ny)) {
      G.moveFrom = { x: G.x, y: G.y };
      G.x = nx; G.y = ny;
      G.moving = true;
      G.moveProgress = 0;
    }
    return;
  }
}

function arriveAtTile() {
  const map = currentMap();
  G.steps++;
  const warp = map.warps[`${G.x},${G.y}`];
  if (warp) {
    startTransition(() => {
      G.map = warp.map; G.x = warp.x; G.y = warp.y; G.dir = warp.dir;
      G.mode = "overworld";
    });
    return;
  }
  if (tileAt(map, G.x, G.y) === GRASS_TILE && map.encounters) {
    if (Math.random() < map.encounters.rate) {
      const table = map.encounters.table;
      const total = table.reduce((s, e) => s + e[3], 0);
      let roll = Math.random() * total;
      let pick = table[0];
      for (const e of table) { roll -= e[3]; if (roll <= 0) { pick = e; break; } }
      const level = pick[1] + Math.floor(Math.random() * (pick[2] - pick[1] + 1));
      startWildBattle(pick[0], level);
    }
  }
}

// ---- interaction ------------------------------------------------
function interact() {
  const map = currentMap();
  const [dx, dy] = DIR_DELTA[G.dir];
  let tx = G.x + dx, ty = G.y + dy;

  const npcAt = (x, y) => (map.npcs || []).find((n) => {
    if (npcHidden(n)) return false;
    const p = npcPos(n);
    return p.x === x && p.y === y;
  });
  let npc = npcAt(tx, ty);
  // talk across counters
  if (!npc && tileAt(map, tx, ty) === "C") npc = npcAt(tx + dx, ty + dy);
  if (npc) { talkToNpc(npc); return; }

  const sign = map.signs && map.signs[`${tx},${ty}`];
  if (sign) { showDialog(sign); return; }
  const t = tileAt(map, tx, ty);
  if (t === "K") showDialog(["Shelves stuffed with monster research journals."]);
  else if (t === "M") {
    if (map.slotsOnMachines) openSlots();
    else showDialog(["Complicated machinery. Better not touch it."]);
  } else if (t === "b") {
    pickBerry(tx, ty);
  } else if (t === "~") {
    if (map.hotSpring) {
      showDialog(["You dip your team into the steaming spring...", "Ahhh. Everyone is fully rested!"], {
        onDone: () => {
          healParty();
          G.healPoint = { map: G.map, x: G.x, y: G.y, dir: G.dir };
        },
      });
    } else if (map.fishing && G.bag.oldrod) startFishing();
    else if (map.fishing) showDialog(["Fish are splashing out there...", "If only you had a fishing rod!"]);
    else showDialog(["The water is calm and clear."]);
  }
}

function faceNpcToPlayer(npc) {
  if (npc.x < G.x) npc.dir = "right";
  else if (npc.x > G.x) npc.dir = "left";
  else if (npc.y < G.y) npc.dir = "down";
  else npc.dir = "up";
}

function talkToNpc(npc) {
  faceNpcToPlayer(npc);
  switch (npc.type) {
    case "dialog":
      showDialog(npc.pages);
      break;
    case "heal": {
      showDialog(npc.pages, {
        onDone: () => {
          healParty();
          G.healPoint = { map: G.map, x: G.x, y: G.y, dir: G.dir };
          showDialog(npc.afterPages);
        },
      });
      break;
    }
    case "shop":
      showDialog(["Welcome! How can I help you?"], { onDone: () => openShop(npc.stock) });
      break;
    case "trainer":
      handleTrainerNpc(npc);
      break;
    case "starter":
      handleProfessor();
      break;
    case "rival":
      handleRival();
      break;
    case "rival2":
      showDialog([
        "AXEL: Well, well. Look who crawled out of MAPLEWOOD.",
        "AXEL: I've been training NONSTOP since the lab.",
        "AXEL: Time to prove I'm the better trainer!",
      ], { onDone: () => startTrainerBattle("rival2", rival2Trainer()) });
      break;
    case "champion":
      handleChampion();
      break;
    case "guard":
      showDialog([
        "GUARD: Halt! Beyond this point lies the LEAGUE gauntlet.",
        `GUARD: Only trainers holding all 4 badges may pass. You have ${badgeCount()}.`,
      ]);
      break;
    case "fisher":
      if (!G.bag.oldrod) {
        showDialog([
          "FISHERMAN: The fish are wild today!", "What's that? You don't have a rod?",
          "FISHERMAN: Here, take my OLD ROD. I've got a better one anyway.",
          G.playerName + " received the OLD ROD!",
          "FISHERMAN: Face the water, press Z, and strike the moment you feel a bite!",
        ], { onDone: () => G.addItem("oldrod", 1) });
      } else {
        showDialog(["FISHERMAN: Strike the instant you see the [!]", "Different waters hide different fish!"]);
      }
      break;
    case "trade":
      handleTrade(npc);
      break;
    case "daycare":
      handleDaycare();
      break;
    case "coins":
      handleCoinClerk();
      break;
    case "prizes":
      handlePrizeClerk(npc);
      break;
    case "quiz":
      handleQuiz();
      break;
    case "legendary":
      showDialog(npc.pages, {
        onDone: () => {
          G.legendaryFlag = npc.flag;
          startWildBattle(npc.monster, npc.level);
        },
      });
      break;
  }
}

// ---- activities -------------------------------------------------
function handleTrade(npc) {
  const wantName = SPECIES[npc.wants].name;
  const giveName = SPECIES[npc.gives].name;
  if (G.flags["traded_" + npc.id]) {
    showDialog([`How's my old ${wantName} doing?`, `Take good care of it — and of ${giveName} too!`]);
    return;
  }
  const idx = G.party.findIndex((m) => m.species === npc.wants);
  if (idx === -1) {
    showDialog([`I'll trade you my rare ${giveName} for a ${wantName}.`,
      `Catch one and come see me!`]);
    return;
  }
  showDialog([`Ooh, that's a fine ${wantName}!`, `Trade it for my ${giveName}?`], {
    choices: ["YES", "NO"], choiceCancel: false,
    onChoice: (i) => {
      if (i !== 0) { showDialog(["Aw. Offer stands if you change your mind!"]); return; }
      const traded = G.party[idx];
      const incoming = makeMonster(npc.gives, Math.max(15, traded.level));
      G.party[idx] = incoming;
      G.markCaught(npc.gives);
      G.flags["traded_" + npc.id] = true;
      showDialog([
        `${G.playerName} traded ${traded.nickname} for ${incoming.nickname}!`,
        `Take good care of ${incoming.nickname}!`,
      ]);
    },
  });
}

function handleDaycare() {
  const dc = G.daycareMon;
  if (!dc) {
    if (G.party.length < 2) {
      showDialog(["DAY CARE: I could raise a monster for you...",
        "But I can't take your only partner!"]);
      return;
    }
    showDialog(["DAY CARE: I can raise one of your monsters.",
      "It gains experience with every step you take outside. Interested?"], {
      choices: ["YES", "NO"], choiceCancel: false,
      onChoice: (i) => {
        if (i !== 0) { showDialog(["Come back anytime!"]); return; }
        openParty("daycareDrop");
      },
    });
    return;
  }
  const mon = dc.mon;
  const gained = G.steps - dc.steps;
  let simLevel = mon.level, simExp = mon.exp + gained;
  while (simLevel < 100 && simExp >= expForLevel(simLevel + 1)) simLevel++;
  const levels = simLevel - mon.level;
  const fee = 100 + levels * 100;
  showDialog([
    `DAY CARE: ${mon.nickname} has been doing great!`,
    levels > 0 ? `It grew ${levels} level${levels > 1 ? "s" : ""} — now level ${simLevel}!` : "It hasn't grown much yet. Keep walking!",
    `Take it back for $${fee}?`,
  ], {
    choices: ["YES", "NO"], choiceCancel: false,
    onChoice: (i) => {
      if (i !== 0) { showDialog([`DAY CARE: We'll keep ${mon.nickname} happy!`]); return; }
      if (G.money < fee) { showDialog(["DAY CARE: Oh dear, you're short on cash.", "Come back when you can pay!"]); return; }
      if (G.party.length >= 6) { showDialog(["DAY CARE: Your party is full!", "Make room first."]); return; }
      G.money -= fee;
      mon.exp += gained;
      while (mon.level < 100 && mon.exp >= expForLevel(mon.level + 1)) {
        mon.level++;
        for (const [lvl, mid] of SPECIES[mon.species].learnset) {
          if (lvl === mon.level && mon.moves.length < 4 && !mon.moves.some((m) => m.id === mid)) {
            mon.moves.push({ id: mid, pp: MOVES[mid].pp });
          }
        }
      }
      const oldMax = mon.stats.hp;
      mon.stats = statsAtLevel(mon.species, mon.level);
      mon.hp = Math.min(mon.stats.hp, mon.hp + Math.max(0, mon.stats.hp - oldMax));
      G.party.push(mon);
      G.daycareMon = null;
      showDialog([`${mon.nickname} returned to the party!`, "DAY CARE: Come again soon!"]);
    },
  });
}

function handleCoinClerk() {
  showDialog([`Welcome to the ARCADE! Coins: ${G.coins}. Slots cost 3 coins a spin.`], {
    choices: ["10 COINS $200", "50 COINS $1000", "CANCEL"], choiceCancel: false,
    onChoice: (i) => {
      const deals = [[10, 200], [50, 1000]];
      if (i < 0 || i >= deals.length) return;
      const [coins, price] = deals[i];
      if (G.money < price) { showDialog(["You don't have enough money!"]); return; }
      G.money -= price;
      G.coins += coins;
      showDialog([`Bought ${coins} coins! You now have ${G.coins}.`, "The slot machines await!"]);
    },
  });
}

function handlePrizeClerk(npc) {
  const labels = npc.prizes.map((p) =>
    (p.item ? ITEMS[p.item].name : SPECIES[p.monster].name) + " " + p.cost + "c");
  showDialog([`Prize counter! You have ${G.coins} coins.`], {
    choices: labels.concat(["CANCEL"]), choiceCancel: false,
    onChoice: (i) => {
      if (i < 0 || i >= npc.prizes.length) return;
      const prize = npc.prizes[i];
      if (G.coins < prize.cost) { showDialog(["You don't have enough coins!"]); return; }
      G.coins -= prize.cost;
      if (prize.item) {
        G.addItem(prize.item, 1);
        showDialog([`${G.playerName} received a ${ITEMS[prize.item].name}!`]);
      } else {
        const mon = makeMonster(prize.monster, prize.level);
        G.markCaught(prize.monster);
        if (G.party.length < 6) {
          G.party.push(mon);
          showDialog([`${SPECIES[prize.monster].name} joined your party!`, "It hums with digital energy..."]);
        } else {
          G.box.push(mon);
          showDialog([`${SPECIES[prize.monster].name} was sent to the STORAGE BOX.`]);
        }
      }
    },
  });
}

function handleQuiz() {
  if (G.flags.quizDone) {
    showDialog(["QUIZ MASTER: You aced my quiz, smarty!", "Study hard, battle harder!"]);
    return;
  }
  showDialog(["QUIZ MASTER: Care to test your monster knowledge?",
    `Answer all ${QUIZ.questions.length} questions right and win $${QUIZ.reward} plus prizes!`], {
    choices: ["BRING IT ON", "NO THANKS"], choiceCancel: false,
    onChoice: (i) => { if (i === 0) askQuizQuestion(0); },
  });
}

function askQuizQuestion(i) {
  if (i >= QUIZ.questions.length) {
    G.money += QUIZ.reward;
    G.addItem("greatcapsule", 3);
    G.flags.quizDone = true;
    showDialog([
      "QUIZ MASTER: Perfect score! Incredible!",
      `${G.playerName} won $${QUIZ.reward} and 3 GREAT CAPSULES!`,
    ]);
    return;
  }
  const q = QUIZ.questions[i];
  showDialog([`Q${i + 1}: ${q.q}`], {
    choices: q.options, choiceCancel: false,
    onChoice: (c) => {
      if (c === q.answer) showDialog(["Correct!"], { onDone: () => askQuizQuestion(i + 1) });
      else showDialog(["WRONG! Hit the books and try again!"]);
    },
  });
}

function pickBerry(tx, ty) {
  const key = `berry_${G.map}_${tx}_${ty}`;
  const last = G.flags[key];
  if (last !== undefined && G.steps - last < 400) {
    showDialog(["The bush is still regrowing its berries..."]);
    return;
  }
  G.flags[key] = G.steps;
  const n = 1 + Math.floor(Math.random() * 2);
  G.addItem("berry", n);
  showDialog([`${G.playerName} picked ${n} BERR${n > 1 ? "IES" : "Y"}!`]);
}

// ---- fishing minigame -------------------------------------------
function startFishing() {
  G.mode = "fishing";
  G.fishing = { phase: "wait", t: 0, wait: 900 + Math.random() * 1800 };
}

function fishingPress(btn) {
  const f = G.fishing;
  if (!f) return;
  if (btn === "b") { G.fishing = null; G.mode = "overworld"; return; }
  if (btn !== "a") return;
  if (f.phase === "wait") {
    G.fishing = null; G.mode = "overworld";
    showDialog(["Nothing's biting yet...", "Patience is the angler's art."]);
  } else if (f.phase === "bite") {
    G.fishing = null;
    const table = currentMap().fishing.table;
    const total = table.reduce((s, e) => s + e[3], 0);
    let roll = Math.random() * total;
    let pick = table[0];
    for (const e of table) { roll -= e[3]; if (roll <= 0) { pick = e; break; } }
    const level = pick[1] + Math.floor(Math.random() * (pick[2] - pick[1] + 1));
    startWildBattle(pick[0], level);
  }
}

// ---- slot machines ----------------------------------------------
const SLOT_STRIP = [0, 1, 2, 3, 4, 2, 3, 1, 4, 2, 3, 4, 1, 2, 3, 2, 4, 3, 1, 2];
const SLOT_GLYPHS = ["7", "\u2605", "\u25CF", "\u25B2", "\u25A0"];
const SLOT_COLORS = ["#e8b400", "#e8d030", "#d84a3a", "#4a90d8", "#7b2fa2"];

function openSlots() {
  if (G.coins < 3) {
    showDialog(["This slot machine takes 3 coins a spin.",
      G.coins === 0 ? "You don't have any coins! Buy some at the counter." : `You only have ${G.coins} coins.`]);
    return;
  }
  G.coins -= 3;
  G.mode = "slots";
  G.slots = {
    pos: [Math.random() * 20, Math.random() * 20, Math.random() * 20],
    spinning: [true, true, true],
    next: 0,
    msg: null,
  };
}

function slotsPress(btn) {
  const s = G.slots;
  if (!s) return;
  if (btn === "b") { G.slots = null; G.mode = "overworld"; return; }
  if (btn !== "a") return;
  if (s.next < 3) {
    s.spinning[s.next] = false;
    s.pos[s.next] = Math.floor(s.pos[s.next]);
    s.next++;
    if (s.next === 3) {
      const syms = s.pos.map((p) => SLOT_STRIP[Math.floor(p) % 20]);
      let payout = 0;
      if (syms[0] === 0 && syms[1] === 0 && syms[2] === 0) payout = 300;
      else if (syms[0] === syms[1] && syms[1] === syms[2]) payout = 60;
      else if (syms.filter((x) => x === 0).length === 2) payout = 20;
      else if (syms[0] === syms[1] || syms[1] === syms[2] || syms[0] === syms[2]) payout = 5;
      G.coins += payout;
      s.msg = payout > 0 ? `WIN! +${payout} coins!` : "No luck...";
    }
  } else {
    // respin
    if (G.coins < 3) { G.slots = null; G.mode = "overworld"; showDialog(["Out of coins!", "Buy more at the counter."]); return; }
    G.coins -= 3;
    G.slots = {
      pos: [Math.random() * 20, Math.random() * 20, Math.random() * 20],
      spinning: [true, true, true],
      next: 0,
      msg: null,
    };
  }
}

// ---- champion ---------------------------------------------------
function rival2Trainer() {
  const opp = RIVAL_COUNTER[G.flags.starter] || "cindercub";
  return {
    name: "RIVAL AXEL",
    party: [[opp, 14], ["nibbit", 12], ["flitchick", 12]],
    payout: 900,
    intro: [],
    winMsg: ["Tch! You got lucky AGAIN!", "Next time. NEXT TIME."],
    after: [],
  };
}

function championTrainer() {
  const base = RIVAL_COUNTER[G.flags.starter] || "cindercub";
  const evo = SPECIES[base].evolvesTo || base;
  return {
    name: "CHAMPION AXEL",
    party: [["gnawlord", 30], ["galewing", 30], ["fulgurcat", 31], [evo, 33]],
    payout: 6000,
    intro: [],
    winMsg: ["No... my perfect team...", "You really are the better trainer."],
    after: [],
  };
}

function handleChampion() {
  if (G.flags.champion) {
    showDialog(["AXEL: The title's yours, champ. For now.",
      "AXEL: I'll train until I take it back!"]);
    return;
  }
  showDialog([
    "AXEL: ...I knew it would be you climbing that corridor.",
    "AXEL: While you collected badges, I beat the ELITE and became CHAMPION.",
    "AXEL: This is it. Everything since the lab comes down to this battle.",
    "AXEL: No excuses. No luck. Show me everything!",
  ], { onDone: () => startTrainerBattle("champion", championTrainer()) });
}

function healParty() {
  for (const m of G.party) {
    m.hp = m.stats.hp;
    m.status = null;
    m.sleepTurns = 0;
    for (const mv of m.moves) mv.pp = MOVES[mv.id].pp;
  }
}

// ---- trainers ---------------------------------------------------
function handleTrainerNpc(npc) {
  const tr = TRAINERS[npc.trainerId];
  if (G.flags["defeated_" + npc.trainerId]) {
    showDialog(tr.after.map((l) => `${tr.name}: ${l}`));
    return;
  }
  if (G.party.length === 0) {
    showDialog([`${tr.name}: Come back when you have a monster of your own!`]);
    return;
  }
  showDialog(tr.intro.map((l) => `${tr.name}: ${l}`), {
    onDone: () => startTrainerBattle(npc.trainerId, tr),
  });
}

function rivalTrainer() {
  const opp = RIVAL_COUNTER[G.flags.starter] || "cindercub";
  return {
    name: "RIVAL AXEL",
    party: [[opp, 5]],
    payout: 280,
    intro: [],
    winMsg: ["Hmph! I must have picked the wrong monster!"],
    after: ["Next time I'll crush you.", "I'm off to train. Later, loser!"],
  };
}

function handleProfessor() {
  if (!G.flags.starter) {
    showDialog([
      "MAPLE: Ah, " + G.playerName + "! Welcome to my lab!",
      "MAPLE: I study monsters — amazing creatures that live all around us.",
      "MAPLE: You're old enough for your first partner now. Go on, choose one!",
    ], { onDone: chooseStarter });
  } else if (!G.flags.badge) {
    const starterName = SPECIES[G.flags.starter].name;
    showDialog([
      "MAPLE: How is " + starterName + " doing?",
      "MAPLE: Head north through ROUTE 1 to reach OAKRIDGE CITY.",
      "MAPLE: Beat Leader SLATE at the gym and earn the QUARRY BADGE!",
    ]);
  } else {
    showDialog([
      "MAPLE: The QUARRY BADGE! Incredible work, " + G.playerName + "!",
      "MAPLE: You've taken your first step toward becoming a champion.",
    ]);
  }
}

function chooseStarter() {
  const options = ["SPROUTLE", "CINDERCUB", "AQUAFIN"];
  const ids = ["sproutle", "cindercub", "aquafin"];
  const blurbs = {
    sproutle: "the GRASS-type seed monster",
    cindercub: "the FIRE-type ember cub",
    aquafin: "the WATER-type pond hopper",
  };
  showDialog(["MAPLE: Which monster will you choose?"], {
    choices: options,
    choiceCancel: false,
    onChoice: (i) => {
      const id = ids[i];
      showDialog([`MAPLE: ${SPECIES[id].name}, ${blurbs[id]}. Is this the one?`], {
        choices: ["YES", "NO"],
        choiceCancel: false,
        onChoice: (yes) => {
          if (yes !== 0) { chooseStarter(); return; }
          G.flags.starter = id;
          G.party = [makeMonster(id, 5)];
          G.markCaught(id);
          G.addItem("capsule", 5);
          showDialog([
            `${G.playerName} received ${SPECIES[id].name}!`,
            "MAPLE: Here — take these 5 CAPSULES too. Throw one at a weakened wild monster to catch it!",
            "MAPLE: Fill the DEX for me, won't you?",
          ], { onDone: rivalAmbush });
        },
      });
    },
  });
}

function rivalAmbush() {
  showDialog([
    "AXEL: Hold it right there, " + G.playerName + "!",
    "AXEL: Grandpa gave ME a monster too — and mine's way better!",
    "AXEL: Let's battle, right here, right now!",
  ], { onDone: () => startTrainerBattle("rival", rivalTrainer()) });
}

function handleRival() {
  if (!G.flags.starter) {
    showDialog(["AXEL: I'm getting MY monster first!", "AXEL: Out of the way!"]);
  } else if (!G.flags.rivalBeaten) {
    showDialog(["AXEL: Ready for a rematch already?"], {
      onDone: () => startTrainerBattle("rival", rivalTrainer()),
    });
  } else {
    showDialog(["AXEL: Next time I'll crush you.", "AXEL: I'm off to train. Later, loser!"]);
  }
}

// ---- battles ----------------------------------------------------
const battleUi = {
  phase: "msg", msg: "", menuIdx: 0, moveIdx: 0, bagIdx: 0,
  dispHpP: 0, dispHpE: 0,
};

function startWildBattle(speciesId, level) {
  const enemy = makeMonster(speciesId, level);
  startTransition(() => beginBattle({ mode: "wild", enemyParty: [enemy] }));
}

function startTrainerBattle(trainerKey, trainerData) {
  G.currentTrainerKey = trainerKey;
  const party = trainerData.party.map(([sp, lvl]) => makeMonster(sp, lvl));
  startTransition(() => beginBattle({ mode: "trainer", trainer: trainerData, enemyParty: party }));
}

function beginBattle(opts) {
  G.mode = "battle";
  G.battle = new Battle(G, opts);
  battleUi.menuIdx = 0; battleUi.moveIdx = 0; battleUi.bagIdx = 0;
  battleUi.dispHpP = G.battle.player.hp;
  battleUi.dispHpE = G.battle.enemy.hp;
  battlePump();
}

function battlePump() {
  const b = G.battle;
  while (true) {
    if (b.queueDone()) {
      if (b.afterQueue === "end") { endBattle(); return; }
      if (b.afterQueue === "forceSwitch") { openParty("forceSwitch"); return; }
      battleUi.phase = "menu";
      battleUi.menuIdx = 0;
      return;
    }
    const text = b.advance();
    if (text) { battleUi.msg = text; battleUi.phase = "msg"; return; }
  }
}

const BADGE_HINTS = {
  badge:  "Head east to SEABREEZE PORT — Leader MARINA awaits!",
  badge2: "ECHO CAVE, north of OAKRIDGE, tunnels through to EMBERFALL VILLAGE.",
  badge3: "Follow ROUTE 4 west to WILLOWMERE CITY for your final badge!",
  badge4: "All 4 badges! The LEAGUE at CROWN PLATEAU awaits, champion-to-be!",
};

function endBattle() {
  const b = G.battle;
  const res = b.result;
  const trainerKey = G.currentTrainerKey;
  const badge = b.trainer && b.trainer.badge;
  for (const m of G.party) delete m.faintedShown;
  G.battle = null;
  G.currentTrainerKey = null;
  G.mode = "overworld";

  const legendFlag = G.legendaryFlag;
  G.legendaryFlag = null;
  if (legendFlag && (res === "win" || res === "caught")) {
    G.flags[legendFlag] = true;
  }

  if (res === "lose") {
    G.pendingLearns = []; G.pendingEvos = [];
    whiteout();
    return;
  }
  if (res === "win" && b.mode === "trainer" && trainerKey) {
    G.flags["defeated_" + trainerKey] = true;
    if (trainerKey === "rival") G.flags.rivalBeaten = true;
    if (trainerKey === "rival2") G.flags.rival2Beaten = true;
    if (trainerKey === "champion") {
      showDialog([
        "AXEL: I can't believe it. I threw everything at you...",
        "AXEL: The LEAGUE has a new CHAMPION.",
        G.playerName + " became the MONSTERQUEST CHAMPION!",
      ], { onDone: () => { G.flags.champion = true; G.mode = "fame"; } });
      return;
    }
    if (badge && !G.flags[badge.flag]) {
      showDialog([
        `${b.trainer.name.replace("LEADER ", "")}: You've earned this.`,
        `${G.playerName} received the ${badge.name}!`,
        BADGE_HINTS[badge.flag],
      ], { onDone: () => { G.flags[badge.flag] = true; processPending(); } });
      return;
    }
  }
  processPending();
}

function whiteout() {
  G.money = Math.floor(G.money / 2);
  healParty();
  const hp = G.healPoint;
  G.map = hp.map; G.x = hp.x; G.y = hp.y; G.dir = hp.dir;
  showDialog([
    G.playerName + " blacked out and rushed to safety...",
    "The monsters were fully healed.",
  ]);
}

function processPending() {
  if (G.pendingLearns.length > 0) {
    const { mon, moveId } = G.pendingLearns.shift();
    const move = MOVES[moveId];
    if (mon.moves.some((m) => m.id === moveId)) { processPending(); return; }
    if (mon.moves.length < 4) {
      mon.moves.push({ id: moveId, pp: move.pp });
      showDialog([`${mon.nickname} learned ${move.name}!`], { onDone: processPending });
    } else {
      showDialog([
        `${mon.nickname} wants to learn ${move.name}, but it already knows 4 moves.`,
        `Forget a move to make room for ${move.name}?`,
      ], {
        choices: mon.moves.map((m) => MOVES[m.id].name).concat(["GIVE UP"]),
        choiceCancel: false,
        onChoice: (i) => {
          if (i >= 0 && i < 4) {
            const old = MOVES[mon.moves[i].id].name;
            mon.moves[i] = { id: moveId, pp: move.pp };
            showDialog([`${mon.nickname} forgot ${old} and learned ${move.name}!`], { onDone: processPending });
          } else {
            showDialog([`${mon.nickname} did not learn ${move.name}.`], { onDone: processPending });
          }
        },
      });
    }
    return;
  }
  if (G.pendingEvos.length > 0) {
    const { mon, to } = G.pendingEvos.shift();
    const oldName = SPECIES[mon.species].name;
    showDialog([`What? ${mon.nickname} is evolving!`], {
      onDone: () => {
        const hpFrac = mon.hp / mon.stats.hp;
        if (mon.nickname === oldName) mon.nickname = SPECIES[to].name;
        mon.species = to;
        mon.stats = statsAtLevel(to, mon.level);
        mon.hp = Math.max(1, Math.round(mon.stats.hp * hpFrac));
        G.markCaught(to);
        showDialog([`${mon.nickname === oldName ? oldName : mon.nickname} evolved into ${SPECIES[to].name}!`], { onDone: processPending });
      },
    });
    return;
  }
}

// ---- menus ------------------------------------------------------
const MENU_ITEMS = ["MONSTERS", "BAG", "DEX", "TRAINER", "SAVE", "CLOSE"];

function openMenu() {
  G.mode = "menu";
  G.menu = { idx: 0 };
}

function menuPress(btn) {
  const m = G.menu;
  if (btn === "up") m.idx = (m.idx + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
  else if (btn === "down") m.idx = (m.idx + 1) % MENU_ITEMS.length;
  else if (btn === "b" || btn === "start") { G.mode = "overworld"; G.menu = null; }
  else if (btn === "a") {
    const sel = MENU_ITEMS[m.idx];
    if (sel === "MONSTERS") {
      if (G.party.length === 0) { showDialog(["You don't have any monsters yet!"]); return; }
      openParty("view");
    } else if (sel === "BAG") openBag("overworld");
    else if (sel === "DEX") { G.mode = "dex"; G.dexUi = { top: 0 }; }
    else if (sel === "TRAINER") G.mode = "trainercard";
    else if (sel === "SAVE") {
      const ok = saveGame();
      showDialog([ok ? G.playerName + " saved the game!" : "Save failed! (storage unavailable)"]);
    } else { G.mode = "overworld"; G.menu = null; }
  }
}

// ---- party ------------------------------------------------------
// purpose: view | battleSwitch | forceSwitch | item
function openParty(purpose, itemId) {
  G.mode = "party";
  G.partyUi = { idx: 0, purpose, itemId, sub: null, subIdx: 0, swapFrom: null };
}

function partyPress(btn) {
  const p = G.partyUi;
  const n = G.party.length;
  if (p.sub) {
    if (btn === "up") p.subIdx = (p.subIdx + p.sub.length - 1) % p.sub.length;
    else if (btn === "down") p.subIdx = (p.subIdx + 1) % p.sub.length;
    else if (btn === "b") p.sub = null;
    else if (btn === "a") {
      const sel = p.sub[p.subIdx];
      p.sub = null;
      if (sel === "SUMMARY") { G.mode = "summary"; G.summaryIdx = p.idx; }
      else if (sel === "MOVE") { p.swapFrom = p.idx; }
    }
    return;
  }
  if (btn === "up") p.idx = (p.idx + n - 1) % n;
  else if (btn === "down") p.idx = (p.idx + 1) % n;
  else if (btn === "b") {
    if (p.swapFrom !== null) { p.swapFrom = null; return; }
    if (p.purpose === "forceSwitch") return; // must pick
    if (p.purpose === "battleSwitch") { G.mode = "battle"; battleUi.phase = "menu"; }
    else if (p.purpose === "item") openBag(G.battle ? "battle" : "overworld");
    else if (p.purpose === "daycareDrop") { G.mode = "overworld"; }
    else { G.mode = "menu"; }
    G.partyUi = null;
  } else if (btn === "a") {
    const mon = G.party[p.idx];
    if (p.swapFrom !== null) {
      const a = p.swapFrom, b = p.idx;
      [G.party[a], G.party[b]] = [G.party[b], G.party[a]];
      p.swapFrom = null;
      return;
    }
    if (p.purpose === "view") {
      p.sub = n > 1 ? ["SUMMARY", "MOVE", "CANCEL"] : ["SUMMARY", "CANCEL"];
      p.subIdx = 0;
    } else if (p.purpose === "battleSwitch" || p.purpose === "forceSwitch") {
      if (mon.hp <= 0) { flashMsg("It has no energy left!"); return; }
      if (p.purpose === "battleSwitch" && p.idx === G.battle.playerIndex) { flashMsg("It's already out!"); return; }
      const idx = p.idx;
      const purpose = p.purpose;
      G.partyUi = null;
      G.mode = "battle";
      if (purpose === "forceSwitch") { G.battle.forceSwitch(idx); battlePump(); }
      else { G.battle.playerTurn({ type: "switch", index: idx }); battlePump(); }
    } else if (p.purpose === "item") {
      useItemOnMonster(p.itemId, p.idx);
    } else if (p.purpose === "daycareDrop") {
      if (G.party.length < 2) { flashMsg("You can't hand over your only monster!"); return; }
      const dropped = G.party.splice(p.idx, 1)[0];
      G.daycareMon = { mon: dropped, steps: G.steps };
      G.partyUi = null;
      showDialog([
        `DAY CARE: We'll take wonderful care of ${dropped.nickname}!`,
        "Come back after a nice long walk!",
      ], { onDone: () => { G.mode = "overworld"; } });
    }
  }
}

let flash = null;
function flashMsg(text) { flash = { text, t: 1200 }; }

function useItemOnMonster(itemId, index) {
  const item = ITEMS[itemId];
  const mon = G.party[index];
  if (item.kind === "heal") {
    if (mon.hp <= 0) { flashMsg("It's fainted! It needs a CARE CENTER."); return; }
    if (mon.hp >= mon.stats.hp) { flashMsg("HP is already full!"); return; }
    mon.hp = Math.min(mon.stats.hp, mon.hp + item.amount);
    G.removeItem(itemId, 1);
    G.partyUi = null;
    showDialog([`${mon.nickname} recovered some HP!`], { onDone: () => { G.mode = "overworld"; } });
  } else if (item.kind === "cure") {
    if (!item.cures.includes(mon.status)) { flashMsg("It won't have any effect."); return; }
    mon.status = null; mon.sleepTurns = 0;
    G.removeItem(itemId, 1);
    G.partyUi = null;
    showDialog([`${mon.nickname} feels much better!`], { onDone: () => { G.mode = "overworld"; } });
  }
}

// ---- bag --------------------------------------------------------
function bagItems() {
  return Object.keys(ITEMS).filter((id) => G.bag[id] > 0);
}

function openBag(context) {
  G.mode = "bag";
  G.bagUi = { idx: 0, context };
}

function bagPress(btn) {
  const b = G.bagUi;
  const items = bagItems();
  if (btn === "b") {
    const wasBattle = b.context === "battle";
    G.bagUi = null;
    if (wasBattle) { G.mode = "battle"; battleUi.phase = "menu"; }
    else G.mode = "menu";
    return;
  }
  if (items.length === 0) return;
  if (btn === "up") b.idx = (b.idx + items.length - 1) % items.length;
  else if (btn === "down") b.idx = (b.idx + 1) % items.length;
  else if (btn === "a") {
    b.idx = Math.min(b.idx, items.length - 1);
    const id = items[b.idx];
    const item = ITEMS[id];
    if (b.context === "battle") {
      if (item.kind === "key") { flashMsg("Can't use that in battle!"); return; }
      if (item.kind === "ball") {
        G.bagUi = null; G.mode = "battle";
        G.battle.playerTurn({ type: "item", id });
        battlePump();
      } else {
        const target = G.battle.playerIndex;
        const mon = G.party[target];
        if (item.kind === "heal" && mon.hp >= mon.stats.hp) { flashMsg("HP is already full!"); return; }
        if (item.kind === "cure" && !item.cures.includes(mon.status)) { flashMsg("It won't have any effect."); return; }
        G.bagUi = null; G.mode = "battle";
        G.battle.playerTurn({ type: "item", id, target });
        battlePump();
      }
    } else {
      if (item.kind === "ball") { flashMsg("Can't use that here!"); return; }
      if (item.kind === "key") { flashMsg(item.desc); return; }
      if (G.party.length === 0) { flashMsg("You have no monsters!"); return; }
      openParty("item", id);
    }
  }
}

// ---- shop -------------------------------------------------------
function openShop(stock) {
  G.mode = "shop";
  G.shopUi = { idx: 0, stock, msg: null, msgT: 0 };
}

function shopPress(btn) {
  const s = G.shopUi;
  const n = s.stock.length + 1; // + EXIT
  if (btn === "up") s.idx = (s.idx + n - 1) % n;
  else if (btn === "down") s.idx = (s.idx + 1) % n;
  else if (btn === "b") { G.shopUi = null; G.mode = "overworld"; showDialog(["Come again soon!"]); }
  else if (btn === "a") {
    if (s.idx === s.stock.length) { G.shopUi = null; G.mode = "overworld"; showDialog(["Come again soon!"]); return; }
    const id = s.stock[s.idx];
    const item = ITEMS[id];
    if (G.money < item.price) { s.msg = "Not enough money!"; s.msgT = 1400; return; }
    G.money -= item.price;
    G.addItem(id, 1);
    s.msg = `Bought a ${item.name}!`;
    s.msgT = 1400;
  }
}

// ---- battle input -----------------------------------------------
function battlePress(btn) {
  const b = G.battle;
  if (!b) return;
  if (battleUi.phase === "msg") {
    if (btn === "a" || btn === "b") battlePump();
    return;
  }
  if (battleUi.phase === "menu") {
    const grid = { up: -2, down: 2, left: -1, right: 1 };
    if (btn in grid) {
      const next = battleUi.menuIdx + grid[btn];
      if (next >= 0 && next < 4) battleUi.menuIdx = next;
    } else if (btn === "a") {
      const sel = ["FIGHT", "BAG", "TEAM", "RUN"][battleUi.menuIdx];
      if (sel === "FIGHT") {
        if (b.player.moves.every((m) => m.pp <= 0)) {
          b.playerTurn({ type: "move", slot: "struggle" });
          battlePump();
          return;
        }
        battleUi.phase = "moves";
        battleUi.moveIdx = 0;
      } else if (sel === "BAG") openBag("battle");
      else if (sel === "TEAM") openParty("battleSwitch");
      else if (sel === "RUN") { b.playerTurn({ type: "run" }); battlePump(); }
    }
    return;
  }
  if (battleUi.phase === "moves") {
    const moves = b.player.moves;
    if (btn === "up") battleUi.moveIdx = (battleUi.moveIdx + moves.length - 1) % moves.length;
    else if (btn === "down") battleUi.moveIdx = (battleUi.moveIdx + 1) % moves.length;
    else if (btn === "b") battleUi.phase = "menu";
    else if (btn === "a") {
      const slot = moves[battleUi.moveIdx];
      if (slot.pp <= 0) { flashMsg("No PP left for this move!"); return; }
      battleUi.phase = "msg";
      b.playerTurn({ type: "move", slot });
      battlePump();
    }
    return;
  }
}

// ---- central input dispatch -------------------------------------
function onPress(btn) {
  switch (G.mode) {
    case "title": titlePress(btn); break;
    case "overworld":
      if (btn === "a") interact();
      else if (btn === "start") openMenu();
      break;
    case "dialog": dialogPress(btn); break;
    case "menu": menuPress(btn); break;
    case "party": partyPress(btn); break;
    case "summary":
      if (btn === "a" || btn === "b") { G.mode = G.partyUi ? "party" : "menu"; }
      break;
    case "bag": bagPress(btn); break;
    case "dex": dexPress(btn); break;
    case "trainercard":
      if (btn === "a" || btn === "b") G.mode = "menu";
      break;
    case "shop": shopPress(btn); break;
    case "battle": battlePress(btn); break;
    case "fishing": fishingPress(btn); break;
    case "slots": slotsPress(btn); break;
    case "fame":
      if (btn === "a" || btn === "b") { G.mode = "overworld"; processPending(); }
      break;
  }
}

function titlePress(btn) {
  const options = hasSave() ? ["NEW GAME", "CONTINUE"] : ["NEW GAME"];
  if (btn === "up") G.titleIdx = (G.titleIdx + options.length - 1) % options.length;
  else if (btn === "down") G.titleIdx = (G.titleIdx + 1) % options.length;
  else if (btn === "a") {
    if (options[G.titleIdx] === "CONTINUE") {
      if (!loadGame()) newGame();
    } else newGame();
  }
}

function dexPress(btn) {
  const d = G.dexUi;
  const ids = Object.keys(SPECIES);
  if (btn === "up") d.top = Math.max(0, d.top - 1);
  else if (btn === "down") d.top = Math.min(Math.max(0, ids.length - 9), d.top + 1);
  else if (btn === "a" || btn === "b") { G.mode = "menu"; G.dexUi = null; }
}

// =============================================================
// RENDERING
// =============================================================
let waterTick = 0;

function drawTile(ch, sx, sy) {
  let tile = TILE_CANVAS[ch];
  if (!tile) tile = TILE_CANVAS["."];
  if (Array.isArray(tile)) tile = tile[Math.floor(waterTick / 600) % tile.length];
  ctx.drawImage(tile, sx, sy, TILE, TILE);
}

function cameraOffset() {
  const map = currentMap();
  const mw = map.tiles[0].length * TILE;
  const mh = map.tiles.length * TILE;
  // player pixel position (interpolated)
  let px = G.x * TILE, py = G.y * TILE;
  if (G.moving && G.moveFrom) {
    px = (G.moveFrom.x + (G.x - G.moveFrom.x) * G.moveProgress) * TILE;
    py = (G.moveFrom.y + (G.y - G.moveFrom.y) * G.moveProgress) * TILE;
  }
  let camX = px + TILE / 2 - SCREEN_W / 2;
  let camY = py + TILE / 2 - SCREEN_H / 2;
  if (mw <= SCREEN_W) camX = (mw - SCREEN_W) / 2;
  else camX = Math.max(0, Math.min(mw - SCREEN_W, camX));
  if (mh <= SCREEN_H) camY = (mh - SCREEN_H) / 2;
  else camY = Math.max(0, Math.min(mh - SCREEN_H, camY));
  return { camX, camY, px, py };
}

function drawOverworld() {
  const map = currentMap();
  const { camX, camY, px, py } = cameraOffset();
  ctx.fillStyle = "#101018";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const x0 = Math.floor(camX / TILE) - 1, x1 = Math.ceil((camX + SCREEN_W) / TILE) + 1;
  const y0 = Math.floor(camY / TILE) - 1, y1 = Math.ceil((camY + SCREEN_H) / TILE) + 1;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (ty < 0 || ty >= map.tiles.length || tx < 0 || tx >= map.tiles[0].length) continue;
      drawTile(tileAt(map, tx, ty), Math.round(tx * TILE - camX), Math.round(ty * TILE - camY));
    }
  }

  // characters, sorted by y for overlap
  const chars = [];
  for (const npc of map.npcs || []) {
    if (npcHidden(npc)) continue;
    const p = npcPos(npc);
    chars.push({ x: p.x * TILE, y: p.y * TILE, kind: npc.sprite, monster: npc.monster, dir: npc.dir, bob: 0 });
  }
  const bob = G.moving && G.moveProgress > 0.25 && G.moveProgress < 0.75 ? -3 : 0;
  chars.push({ x: px, y: py, kind: "player", dir: G.dir, bob });
  chars.sort((a, b) => a.y - b.y);
  for (const c of chars) {
    const spr = c.monster ? monsterSprite(c.monster, 2, false) : personSprite(c.kind, c.dir, 2);
    ctx.drawImage(spr, Math.round(c.x - camX), Math.round(c.y - camY - 6 + c.bob));
  }

  // map name banner (briefly could be added; skipped)
}

// ---- text / boxes -----------------------------------------------
function drawBox(x, y, w, h) {
  ctx.fillStyle = "#f8f8f0";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#303040";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
  ctx.strokeStyle = "#8890a8";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
}

function drawText(text, x, y, color = "#202030", size = 16) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

function drawDialogBox() {
  const d = G.dialog;
  drawBox(4, SCREEN_H - 110, SCREEN_W - 8, 106);
  const page = d.pages[d.page];
  const shown = page.slice(0, Math.floor(d.chars));
  const lines = wrapText(shown, 42);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    drawText(lines[i], 22, SCREEN_H - 92 + i * 26);
  }
  if (d.chars >= page.length && !d.showingChoices) {
    ctx.fillStyle = "#c62828";
    const t = Math.floor(waterTick / 400) % 2;
    ctx.beginPath();
    const ax = SCREEN_W - 32, ay = SCREEN_H - 26 + t * 2;
    ctx.moveTo(ax, ay); ctx.lineTo(ax + 12, ay); ctx.lineTo(ax + 6, ay + 8);
    ctx.fill();
  }
  if (d.showingChoices) {
    const w = 190;
    const h = d.choices.length * 28 + 20;
    const bx = SCREEN_W - w - 8, by = SCREEN_H - 114 - h;
    drawBox(bx, by, w, h);
    d.choices.forEach((c, i) => {
      if (i === d.choiceIdx) drawText(">", bx + 12, by + 12 + i * 28, "#c62828");
      drawText(c, bx + 30, by + 12 + i * 28);
    });
  }
}

// ---- HP bar -----------------------------------------------------
function drawHpBar(x, y, w, frac) {
  frac = Math.max(0, Math.min(1, frac));
  ctx.fillStyle = "#303040";
  ctx.fillRect(x - 1, y - 1, w + 2, 8);
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(x, y, w, 6);
  ctx.fillStyle = frac > 0.5 ? "#4caf50" : frac > 0.2 ? "#f0a030" : "#e04030";
  ctx.fillRect(x, y, Math.round(w * frac), 6);
}

// ---- battle rendering -------------------------------------------
function drawBattle() {
  const b = G.battle;
  if (!b) return;
  // background
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, "#e8f4f8");
  grad.addColorStop(1, "#c8e0c8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const blink = Math.floor(waterTick / 70) % 2 === 0;

  // enemy platform + sprite
  ctx.fillStyle = "#a8c890";
  ctx.beginPath();
  ctx.ellipse(356, 148, 92, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!(b.hitFlash === "enemy" && blink)) {
    ctx.drawImage(monsterSprite(b.enemy.species, 7, false), 300, 40);
  }

  // player platform + back sprite
  ctx.fillStyle = "#a8c890";
  ctx.beginPath();
  ctx.ellipse(120, 268, 100, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!(b.hitFlash === "player" && blink)) {
    ctx.drawImage(monsterSprite(b.player.species, 8, true), 56, 148);
  }

  // enemy info box
  drawBox(10, 14, 220, 68);
  drawText(SPECIES[b.enemy.species].name, 24, 24, "#202030", 15);
  drawText("Lv" + b.enemy.level, 178, 24, "#202030", 14);
  drawHpBar(52, 52, 150, battleUi.dispHpE / b.enemy.stats.hp);
  drawText("HP", 26, 46, "#c62828", 13);
  if (b.enemy.status) drawText(STATUS_NAMES[b.enemy.status], 24, 62, "#7b2fa2", 13);

  // player info box
  drawBox(250, 186, 222, 82);
  drawText(b.player.nickname, 264, 196, "#202030", 15);
  drawText("Lv" + b.player.level, 420, 196, "#202030", 14);
  drawHpBar(292, 224, 150, battleUi.dispHpP / b.player.stats.hp);
  drawText("HP", 266, 218, "#c62828", 13);
  drawText(`${Math.round(battleUi.dispHpP)}/${b.player.stats.hp}`, 330, 236, "#202030", 14);
  if (b.player.status) drawText(STATUS_NAMES[b.player.status], 264, 236, "#7b2fa2", 13);

  // bottom box
  drawBox(4, SCREEN_H - 110, SCREEN_W - 8, 106);
  if (battleUi.phase === "msg") {
    const lines = wrapText(battleUi.msg, 42);
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      drawText(lines[i], 22, SCREEN_H - 92 + i * 26);
    }
  } else if (battleUi.phase === "menu") {
    drawText("What will", 22, SCREEN_H - 92);
    drawText(b.player.nickname + " do?", 22, SCREEN_H - 66);
    const opts = ["FIGHT", "BAG", "TEAM", "RUN"];
    const ox = 250, oy = SCREEN_H - 96;
    ctx.strokeStyle = "#303040";
    ctx.strokeRect(240, SCREEN_H - 104, 234, 94);
    opts.forEach((o, i) => {
      const cx = ox + (i % 2) * 115, cy = oy + Math.floor(i / 2) * 40;
      if (i === battleUi.menuIdx) drawText(">", cx - 14, cy, "#c62828");
      drawText(o, cx, cy);
    });
  } else if (battleUi.phase === "moves") {
    const moves = b.player.moves;
    moves.forEach((m, i) => {
      const mv = MOVES[m.id];
      const cy = SCREEN_H - 98 + i * 23;
      if (i === battleUi.moveIdx) drawText(">", 16, cy, "#c62828");
      drawText(mv.name, 34, cy, "#202030", 15);
      drawText(mv.type.toUpperCase().slice(0, 3), 240, cy, TYPE_COLORS[mv.type], 13);
      drawText(`PP ${m.pp}/${mv.pp}`, 300, cy, m.pp === 0 ? "#e04030" : "#202030", 14);
    });
    const sel = MOVES[moves[battleUi.moveIdx].id];
    drawText(sel.kind === "status" ? "STATUS" : `PWR ${sel.power}`, 396, SCREEN_H - 98, "#606070", 13);
    drawText(`ACC ${sel.acc > 100 ? "--" : sel.acc}`, 396, SCREEN_H - 76, "#606070", 13);
  }
}

// ---- party rendering --------------------------------------------
function drawParty() {
  ctx.fillStyle = "#38405a";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("MONSTERS", 20, 12, "#f8f8f0", 20);
  const p = G.partyUi;
  G.party.forEach((mon, i) => {
    const y = 44 + i * 52;
    const selected = i === p.idx;
    ctx.fillStyle = selected ? "#f8f8f0" : "#d8dce8";
    ctx.fillRect(12, y, SCREEN_W - 24, 46);
    ctx.strokeStyle = selected ? "#c62828" : "#303040";
    ctx.lineWidth = selected ? 3 : 1;
    ctx.strokeRect(12, y, SCREEN_W - 24, 46);
    ctx.drawImage(monsterSprite(mon.species, 2, false), 20, y + 6);
    drawText(mon.nickname, 64, y + 6, "#202030", 15);
    drawText("Lv" + mon.level, 200, y + 6, "#202030", 14);
    drawHpBar(268, y + 12, 130, mon.hp / mon.stats.hp);
    drawText(`${mon.hp}/${mon.stats.hp}`, 268, y + 24, "#202030", 13);
    if (mon.status) drawText(STATUS_NAMES[mon.status], 410, y + 6, "#c62828", 13);
    if (mon.hp <= 0) drawText("FNT", 410, y + 24, "#e04030", 13);
    if (p.swapFrom === i) drawText("MOVING...", 64, y + 24, "#c62828", 12);
  });
  const hint = p.purpose === "forceSwitch" ? "Choose the next monster!" :
    p.swapFrom !== null ? "Swap with which monster?" :
    "Z: select   X: back";
  drawText(hint, 20, SCREEN_H - 28, "#c8d0e8", 14);
  if (p.sub) {
    const w = 170, h = p.sub.length * 28 + 16;
    const bx = SCREEN_W - w - 16, by = SCREEN_H - h - 40;
    drawBox(bx, by, w, h);
    p.sub.forEach((o, i) => {
      if (i === p.subIdx) drawText(">", bx + 10, by + 10 + i * 28, "#c62828");
      drawText(o, bx + 28, by + 10 + i * 28);
    });
  }
}

function drawSummary() {
  const mon = G.party[G.summaryIdx];
  const sp = SPECIES[mon.species];
  ctx.fillStyle = "#38405a";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawBox(10, 10, SCREEN_W - 20, SCREEN_H - 20);
  ctx.drawImage(monsterSprite(mon.species, 7, false), 28, 40);
  drawText(mon.nickname, 30, 16, "#202030", 20);
  drawText("Lv" + mon.level, 200, 18, "#202030", 16);
  sp.types.forEach((t, i) => {
    ctx.fillStyle = TYPE_COLORS[t];
    ctx.fillRect(260 + i * 90, 16, 84, 22);
    drawText(t.toUpperCase(), 266 + i * 90, 19, "#ffffff", 14);
  });
  const stats = [["HP", `${mon.hp}/${mon.stats.hp}`], ["ATTACK", mon.stats.atk],
    ["DEFENSE", mon.stats.def], ["SPEED", mon.stats.spd], ["SPECIAL", mon.stats.spc]];
  stats.forEach(([label, val], i) => {
    drawText(label, 170, 52 + i * 24, "#606070", 14);
    drawText(String(val), 280, 52 + i * 24, "#202030", 15);
  });
  const next = mon.level >= 100 ? 0 : expForLevel(mon.level + 1) - mon.exp;
  drawText(`EXP ${mon.exp}`, 170, 176, "#606070", 13);
  drawText(`Next Lv in ${next}`, 300, 176, "#606070", 13);
  drawText("MOVES", 30, 208, "#606070", 14);
  mon.moves.forEach((m, i) => {
    const mv = MOVES[m.id];
    const y = 232 + i * 26;
    drawText(mv.name, 40, y, "#202030", 15);
    drawText(mv.type.toUpperCase().slice(0, 3), 220, y, TYPE_COLORS[mv.type], 13);
    drawText(`PP ${m.pp}/${mv.pp}`, 290, y, "#202030", 14);
    drawText(mv.kind === "status" ? "---" : `PWR ${mv.power}`, 396, y, "#606070", 13);
  });
  drawText("Z/X: back", 30, SCREEN_H - 40, "#606070", 13);
}

// ---- bag / shop / dex / trainer card ----------------------------
function drawBag() {
  drawUnderlay();
  const items = bagItems();
  const b = G.bagUi;
  b.idx = Math.min(b.idx, Math.max(0, items.length - 1));
  drawBox(90, 40, 300, 250);
  drawText("BAG", 110, 52, "#202030", 18);
  if (items.length === 0) drawText("It's empty...", 120, 90);
  items.forEach((id, i) => {
    const y = 86 + i * 28;
    if (i === b.idx) drawText(">", 104, y, "#c62828");
    drawText(ITEMS[id].name, 122, y);
    drawText("x" + G.bag[id], 320, y);
  });
  drawBox(90, 296, 300, 60);
  if (items.length > 0) {
    const lines = wrapText(ITEMS[items[b.idx]].desc, 32);
    lines.slice(0, 2).forEach((l, i) => drawText(l, 104, 308 + i * 22, "#404050", 14));
  }
}

function drawShop() {
  drawUnderlay();
  const s = G.shopUi;
  drawBox(60, 30, 360, 260);
  drawText("MART", 80, 42, "#202030", 18);
  drawText("$" + G.money, 320, 42, "#2a6a2a", 16);
  s.stock.forEach((id, i) => {
    const y = 76 + i * 28;
    if (i === s.idx) drawText(">", 74, y, "#c62828");
    drawText(ITEMS[id].name, 92, y);
    drawText("$" + ITEMS[id].price, 320, y);
  });
  const ey = 76 + s.stock.length * 28;
  if (s.idx === s.stock.length) drawText(">", 74, ey, "#c62828");
  drawText("EXIT", 92, ey);
  drawBox(60, 298, 360, 58);
  if (s.msg && s.msgT > 0) drawText(s.msg, 76, 316, "#c62828", 15);
  else if (s.idx < s.stock.length) {
    drawText(wrapText(ITEMS[s.stock[s.idx]].desc, 40)[0], 76, 316, "#404050", 14);
  } else drawText("Leave the shop.", 76, 316, "#404050", 14);
}

function drawDex() {
  ctx.fillStyle = "#38405a";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("MONSTER DEX", 20, 12, "#f8f8f0", 20);
  const ids = Object.keys(SPECIES);
  const caughtCount = ids.filter((id) => G.caught[id]).length;
  const seenCount = ids.filter((id) => G.seen[id]).length;
  drawText(`SEEN ${seenCount}   CAUGHT ${caughtCount}`, 260, 16, "#c8d0e8", 14);
  const top = G.dexUi.top;
  for (let i = 0; i < 9; i++) {
    const idx = top + i;
    if (idx >= ids.length) break;
    const id = ids[idx];
    const y = 48 + i * 34;
    ctx.fillStyle = "#d8dce8";
    ctx.fillRect(12, y, SCREEN_W - 24, 30);
    drawText(String(idx + 1).padStart(3, "0"), 24, y + 6, "#606070", 14);
    if (G.seen[id]) {
      ctx.drawImage(monsterSprite(id, 1.5, false), 70, y + 3);
      drawText(SPECIES[id].name, 110, y + 6, "#202030", 15);
      if (G.caught[id]) {
        ctx.fillStyle = "#c62828";
        ctx.beginPath(); ctx.arc(420, y + 15, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(413, y + 14, 14, 2);
        drawText(SPECIES[id].types.join("/"), 240, y + 6, "#606070", 13);
      }
    } else {
      drawText("-----", 110, y + 6, "#909098", 15);
    }
  }
  drawText("Up/Down: scroll   Z/X: back", 20, SCREEN_H - 28, "#c8d0e8", 14);
}

function drawTrainerCard() {
  drawUnderlay();
  drawBox(60, 40, 360, 300);
  drawText("TRAINER CARD", 80, 54, "#202030", 18);
  if (G.flags.champion) drawText("CHAMPION", 290, 56, "#e8b400", 15);
  ctx.drawImage(personSprite("player", "down", 4), 330, 80);
  drawText("NAME", 80, 96, "#606070", 14);
  drawText(G.playerName, 180, 96);
  drawText("MONEY", 80, 124, "#606070", 14);
  drawText("$" + G.money, 180, 124);
  drawText("COINS", 80, 152, "#606070", 14);
  drawText(String(G.coins), 180, 152);
  const ids = Object.keys(SPECIES);
  drawText("DEX", 80, 180, "#606070", 14);
  drawText(`${ids.filter((id) => G.caught[id]).length} caught / ${ids.filter((id) => G.seen[id]).length} seen`, 180, 180);
  drawText("BADGES", 80, 212, "#606070", 14);
  const badgeColors = ["#b8a038", "#4a90d8", "#d84a3a", "#e07ab8"];
  BADGES.forEach(([flag, name], i) => {
    const bx = 96 + i * 82, by = 248;
    if (G.flags[flag]) {
      ctx.fillStyle = badgeColors[i];
      ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f8f0d8";
      ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2); ctx.fill();
      drawText(name, bx - 24, by + 18, "#404050", 11);
    } else {
      ctx.strokeStyle = "#a0a0b0";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.stroke();
      drawText("----", bx - 16, by + 18, "#a0a0b0", 11);
    }
  });
  drawText("Z/X: back", 80, 310, "#606070", 13);
}

function drawUnderlay() {
  drawOverworld();
  ctx.fillStyle = "rgba(16,16,32,0.55)";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

function drawMenu() {
  drawUnderlay();
  const w = 180, h = MENU_ITEMS.length * 30 + 24;
  const bx = SCREEN_W - w - 12, by = 12;
  drawBox(bx, by, w, h);
  MENU_ITEMS.forEach((o, i) => {
    if (i === G.menu.idx) drawText(">", bx + 14, by + 14 + i * 30, "#c62828");
    drawText(o, bx + 34, by + 14 + i * 30);
  });
}

// ---- title ------------------------------------------------------
const TITLE_MONS = ["pyroursa", "tidalfin", "bloomurk", "gnawlord", "sparkit", "mistwisp"];
function drawTitle() {
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, "#182848");
  grad.addColorStop(1, "#38608a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  // stars
  for (let i = 0; i < 40; i++) {
    const x = (i * 137 + 31) % SCREEN_W;
    const y = (i * 89 + 17) % 180;
    ctx.fillStyle = i % 3 === 0 && Math.floor(waterTick / 500) % 2 ? "#ffffff" : "#8898c8";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#f8d030";
  ctx.font = 'bold 44px "Courier New", monospace';
  ctx.strokeStyle = "#3a2a00";
  ctx.lineWidth = 6;
  ctx.strokeText("MONSTERQUEST", SCREEN_W / 2, 92);
  ctx.fillText("MONSTERQUEST", SCREEN_W / 2, 92);
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = "#c8d8f0";
  ctx.fillText("A retro monster-catching adventure", SCREEN_W / 2, 134);
  ctx.textAlign = "left";

  const mon = TITLE_MONS[Math.floor(waterTick / 1800) % TITLE_MONS.length];
  ctx.drawImage(monsterSprite(mon, 8, false), SCREEN_W / 2 - 64, 152);

  const options = hasSave() ? ["NEW GAME", "CONTINUE"] : ["NEW GAME"];
  G.titleIdx = Math.min(G.titleIdx, options.length - 1);
  options.forEach((o, i) => {
    const y = 296 + i * 32;
    if (i === G.titleIdx) drawText(">", SCREEN_W / 2 - 70, y, "#f8d030", 18);
    drawText(o, SCREEN_W / 2 - 48, y, "#ffffff", 18);
  });
  if (Math.floor(waterTick / 600) % 2 === 0) {
    ctx.textAlign = "center";
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = "#98a8c8";
    ctx.fillText("Press Z / Enter", SCREEN_W / 2, 366);
    ctx.textAlign = "left";
  }
}

// ---- fishing rendering ------------------------------------------
function drawFishing() {
  drawOverworld();
  const f = G.fishing;
  const { camX, camY, px, py } = cameraOffset();
  const sx = Math.round(px - camX), sy = Math.round(py - camY);
  if (f.phase === "wait") {
    const dots = 1 + (Math.floor(f.t / 400) % 3);
    drawBox(sx - 14, sy - 44, 60, 34);
    drawText(".".repeat(dots), sx, sy - 38, "#202030", 18);
  } else {
    drawBox(sx - 8, sy - 52, 44, 42);
    drawText("!", sx + 6, sy - 44, "#c62828", 26);
  }
  drawText(f.phase === "bite" ? "Z: HOOK IT!" : "Waiting for a bite... (X: reel in)", 16, SCREEN_H - 28, "#f8f8f0", 14);
}

// ---- slots rendering --------------------------------------------
function drawSlots() {
  ctx.fillStyle = "#2a1a3a";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("SLOTS", 30, 20, "#f8d030", 24);
  drawText("COINS: " + G.coins, 330, 26, "#f8f8f0", 16);
  const s = G.slots;
  drawBox(70, 90, 340, 130);
  for (let i = 0; i < 3; i++) {
    const cx = 100 + i * 110;
    ctx.fillStyle = s.spinning[i] ? "#e8e8f0" : "#ffffff";
    ctx.fillRect(cx, 110, 80, 90);
    ctx.strokeStyle = "#303040";
    ctx.lineWidth = 3;
    ctx.strokeRect(cx, 110, 80, 90);
    const sym = SLOT_STRIP[Math.floor(s.pos[i]) % 20];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 52px "Courier New", monospace';
    ctx.fillStyle = SLOT_COLORS[sym];
    ctx.fillText(SLOT_GLYPHS[sym], cx + 40, 155);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }
  drawBox(70, 240, 340, 70);
  if (s.msg) {
    drawText(s.msg, 90, 254, s.msg.startsWith("WIN") ? "#2a8a2a" : "#606070", 17);
    drawText("Z: spin again (3c)   X: quit", 90, 282, "#606070", 13);
  } else {
    drawText("Z: stop reel " + (s.next + 1), 90, 254, "#202030", 16);
    drawText("3x7=300  3 same=60  2x7=20  pair=5", 90, 282, "#606070", 13);
  }
  drawText("X: walk away", 30, SCREEN_H - 30, "#8a8aa0", 13);
}

// ---- hall of fame -----------------------------------------------
function drawFame() {
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, "#1a1030");
  grad.addColorStop(1, "#3a2060");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = "center";
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillStyle = "#f8d030";
  ctx.fillText("HALL OF FAME", SCREEN_W / 2, 56);
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillStyle = "#e8e8f0";
  ctx.fillText(`CHAMPION ${G.playerName}`, SCREEN_W / 2, 88);
  ctx.textAlign = "left";
  G.party.forEach((mon, i) => {
    const cx = 40 + (i % 3) * 150;
    const cy = 110 + Math.floor(i / 3) * 110;
    ctx.drawImage(monsterSprite(mon.species, 4, false), cx, cy);
    drawText(mon.nickname, cx, cy + 68, "#c8c8e0", 12);
    drawText("Lv" + mon.level, cx, cy + 84, "#8a8ab0", 12);
  });
  ctx.textAlign = "center";
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = "#b8a8d8";
  ctx.fillText("Thanks for playing MONSTERQUEST!", SCREEN_W / 2, 348);
  if (Math.floor(waterTick / 600) % 2 === 0) {
    ctx.fillText("Press Z to continue your journey", SCREEN_W / 2, 370);
  }
  ctx.textAlign = "left";
}

// ---- transition -------------------------------------------------
function drawTransition() {
  const t = G.transition;
  const on = Math.floor(t.t / 120) % 2 === 0;
  if (on) {
    ctx.fillStyle = "#101018";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
}

// ---- flash message ----------------------------------------------
function drawFlash() {
  if (!flash) return;
  const w = Math.min(440, flash.text.length * 11 + 40);
  drawBox((SCREEN_W - w) / 2, 150, w, 44);
  drawText(flash.text, (SCREEN_W - w) / 2 + 20, 164, "#c62828", 14);
}

// ---- main loop --------------------------------------------------
let lastTime = 0;
function loop(now) {
  const dt = Math.min(50, now - lastTime);
  lastTime = now;
  waterTick += dt;

  // updates
  if (G.mode === "overworld") updateOverworld(dt);
  if (G.mode === "dialog" && G.dialog) {
    const page = G.dialog.pages[G.dialog.page];
    if (G.dialog.chars < page.length) G.dialog.chars = Math.min(page.length, G.dialog.chars + dt * 0.06);
  }
  if (G.mode === "transition") {
    G.transition.t += dt;
    if (G.transition.t >= G.transition.dur) {
      const next = G.transition.next;
      G.transition = null;
      G.mode = "overworld";
      next();
    }
  }
  if (G.battle) {
    const b = G.battle;
    const rate = dt * 0.12;
    battleUi.dispHpE += Math.max(-rate * 2, Math.min(rate * 2, b.enemy.hp - battleUi.dispHpE));
    if (Math.abs(b.enemy.hp - battleUi.dispHpE) < 0.5) battleUi.dispHpE = b.enemy.hp;
    battleUi.dispHpP += Math.max(-rate * 2, Math.min(rate * 2, b.player.hp - battleUi.dispHpP));
    if (Math.abs(b.player.hp - battleUi.dispHpP) < 0.5) battleUi.dispHpP = b.player.hp;
  }
  if (G.shopUi && G.shopUi.msgT > 0) G.shopUi.msgT -= dt;
  if (G.mode === "fishing" && G.fishing) {
    const f = G.fishing;
    f.t += dt;
    if (f.phase === "wait" && f.t >= f.wait) { f.phase = "bite"; f.t = 0; }
    else if (f.phase === "bite" && f.t > 700) {
      G.fishing = null; G.mode = "overworld";
      showDialog(["Oh no! It got away!", "You have to hook it the instant it bites."]);
    }
  }
  if (G.mode === "slots" && G.slots) {
    const s = G.slots;
    for (let i = 0; i < 3; i++) if (s.spinning[i]) s.pos[i] += dt * 0.018;
  }
  if (flash) { flash.t -= dt; if (flash.t <= 0) flash = null; }

  // render
  switch (G.mode) {
    case "title": drawTitle(); break;
    case "overworld": drawOverworld(); break;
    case "dialog":
      if (G.battle) drawBattle(); else drawOverworld();
      drawDialogBox();
      break;
    case "menu": drawMenu(); break;
    case "party": drawParty(); break;
    case "summary": drawSummary(); break;
    case "bag": drawBag(); break;
    case "dex": drawDex(); break;
    case "trainercard": drawTrainerCard(); break;
    case "shop": drawShop(); break;
    case "battle": drawBattle(); break;
    case "fishing": drawFishing(); break;
    case "slots": drawSlots(); break;
    case "fame": drawFame(); break;
    case "transition":
      drawOverworld();
      drawTransition();
      break;
  }
  drawFlash();
  requestAnimationFrame(loop);
}

// ---- touch controls ---------------------------------------------
// On-screen buttons mirror the keyboard: d-pad presses go into `held`
// (so hold-to-walk works) and also fire onPress for menu navigation.
(function initTouchControls() {
  const container = document.getElementById("touch");
  if (!container) return;
  const DIRS = new Set(["up", "down", "left", "right"]);
  for (const el of container.querySelectorAll(".tbtn")) {
    const btn = el.dataset.btn;
    const activate = (e) => {
      e.preventDefault();
      el.classList.add("pressed");
      onPress(btn);
      if (DIRS.has(btn)) held.add(btn);
    };
    const release = (e) => {
      if (e) e.preventDefault();
      el.classList.remove("pressed");
      if (DIRS.has(btn)) held.delete(btn);
    };
    el.addEventListener("pointerdown", activate);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("pointerleave", release);
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  }
})();

requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(loop); });
