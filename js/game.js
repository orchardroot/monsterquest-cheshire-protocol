// =============================================================
// MonsterQuest — main engine: overworld, UI, story, battle UI
// =============================================================
"use strict";

const TILE = 32;
const SCREEN_W = 960;
const SCREEN_H = 540;
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
  playerName: "JIM",
  map: "home", x: 2, y: 5, dir: "down",
  moving: false, moveProgress: 0, moveFrom: null,
  turnLock: 0,
  party: [], box: [], bag: {}, money: 3000,
  coins: 0, steps: 0, daycareMon: null, quests: {}, radioSong: null,
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

function updateMusic() {
  if (G.mode === "title") { Sound.playSong("title"); return; }
  if (G.radioSong) { Sound.playSong(G.radioSong); return; }
  const map = currentMap();
  const song = (map && map.music) || (map && map.outdoor ? "route" : "town");
  Sound.playSong(song);
}
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

function newGame() {
  G.party = []; G.box = []; G.money = 3000;
  G.coins = 0; G.steps = 0; G.daycareMon = null; G.quests = {}; G.radioSong = null;
  G.bag = { potion: 2 };
  G.flags = {}; G.seen = {}; G.caught = {};
  G.map = "home"; G.x = 2; G.y = 5; G.dir = "down";
  G.healPoint = { map: "home", x: 4, y: 6, dir: "up" };
  G.mode = "overworld";
  G.flags.visited_macclesfield = true;
  updateMusic();
  showDialog([
    "MUM: Jim, love! DR. ALDER rang from ALDER LABS.",
    "MUM: Something about that horrid DARKBYTE business on the news...",
    "MUM: She says she needs a junior security researcher. That's you, apparently!",
    "MUM: The lab's just along the street. Take your coat!",
  ]);
}

function saveGame() {
  const data = {
    playerName: G.playerName, party: G.party, box: G.box, bag: G.bag,
    money: G.money, coins: G.coins, steps: G.steps, daycareMon: G.daycareMon,
    quests: G.quests, soundOn: Sound.enabled,
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
      quests: data.quests || {},
      flags: data.flags,
      seen: data.seen || {}, caught: data.caught || {},
      map: data.map, x: data.x, y: data.y, dir: data.dir,
      healPoint: data.healPoint,
    });
    Sound.setEnabled(data.soundOn !== false);
    if (!MAPS[G.map]) {
      // save from an older world layout — return home safely
      G.map = "home"; G.x = 4; G.y = 5; G.dir = "down";
      G.healPoint = { map: "home", x: 4, y: 6, dir: "up" };
    }
    if (!MAPS[G.healPoint.map]) G.healPoint = { map: "home", x: 4, y: 6, dir: "up" };
    G.mode = "overworld";
    updateMusic();
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
  if (npc.needBadges && badgeCount() >= npc.needBadges &&
      (!npc.needFlag || G.flags[npc.needFlag])) return true;
  if (npc.type === "guard8" && badgeCount() >= 8) return true;
  return false;
}

function npcPos(npc) {
  if (npc.afterX !== undefined && npc.trainerId && G.flags["defeated_" + npc.trainerId]) {
    return { x: npc.afterX, y: npc.afterY };
  }
  return { x: npc.x, y: npc.y };
}

const BADGES = [
  ["badge", "PACKET"], ["badge2", "CIPHER"], ["badge3", "BEAR"], ["badge4", "KERNEL"],
  ["badge5", "TOKEN"], ["badge6", "DAEMON"], ["badge7", "PROXY"], ["badge8", "ADMIN"],
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
    Sound.sfx("warp");
    startTransition(() => {
      G.map = warp.map; G.x = warp.x; G.y = warp.y; G.dir = warp.dir;
      G.flags["visited_" + warp.map] = true;
      G.mode = "overworld";
      banner = { text: MAPS[G.map].name, t: 2600 };
      updateMusic();
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
  if (t === "u" && !(map.signs && map.signs[`${tx},${ty}`])) {
    showDialog(["A monument. The plaque has weathered beyond reading."]);
    return;
  }
  if (t === "K") showDialog(["Shelves stuffed with monster research journals."]);
  else if (t === "M") {
    if (map.slotsOnMachines) openSlots();
    else showDialog(["Complicated machinery. Better not touch it."]);
  } else if (t === "b") {
    pickBerry(tx, ty);
  } else if (t === "~" || t === "l") {
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
      if (npc.setsFlag) G.flags[npc.setsFlag] = true;
      showDialog(npc.pages);
      break;
    case "heal": {
      if (npc.id === "mom" && G.flags.starter && !G.flags.meadowJoined) {
        showDialog([
          "MUM: A contract with ALDER LABS? Well. They could do worse.",
          "MUM: Now — your little shadow has been crying at the door since you left.",
          "MEADOW winds between your ankles, then sits on your boot and stares up, decided.",
          "MUM: She's coming with you, love. That was never in question.",
          "MEADOW joined the team!",
          "MUM: And take the old boombox. A walk needs a soundtrack.",
        ], {
          onDone: () => {
            const cat = makeMonster("meadow", 6);
            cat.nickname = "MEADOW";
            G.markCaught("meadow");
            G.party.push(cat);
            G.addItem("boombox", 1);
            G.flags.meadowJoined = true;
            Sound.sfx("catch");
            healParty();
            G.healPoint = { map: G.map, x: G.x, y: G.y, dir: G.dir };
          },
        });
        break;
      }
      showDialog(npc.pages, {
        onDone: () => {
          healParty();
          G.healPoint = { map: G.map, x: G.x, y: G.y, dir: G.dir };
          showDialog(npc.afterPages);
        },
      });
      break;
    }
    case "oracleboss": {
      const tr = TRAINERS[npc.trainerId];
      if (G.flags.oracleDefeated) {
        showDialog(["The core hall is silent. Racks tick as they cool.",
          "Somewhere far above, the grid breathes easier."]);
        return;
      }
      showDialog(tr.intro, { onDone: () => startTrainerBattle("oracle", tr) });
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
        "VEX: Ping received. Look who finally routed this far west.",
        "VEX: I've patched every bug you exploited at the lab.",
        "VEX: Version 2.0. Deployed. Fight me.",
      ], { onDone: () => startTrainerBattle("rival2", rival2Trainer()) });
      break;
    case "guard8":
      showDialog(npc.pages);
      break;
    case "darkboss":
      handleDarkBoss(npc);
      break;
    case "station":
      handleStation(npc);
      break;
    case "champion":
      handleChampion();
      break;
    case "guard":
      if (badgeCount() < 8) {
        showDialog([
          "GUARD: Halt! Beyond this point lie the WHITE HATS.",
          `GUARD: Entry requires all 8 access badges. You hold ${badgeCount()}.`,
        ]);
      } else {
        showDialog([
          "GUARD: Eight badges... but the region is still under attack!",
          G.flags.darkbyteDefeated
            ? "GUARD: Whatever is running THE STACK at Winsford is drawing half the grid. The league waits until it doesn't."
            : "GUARD: No league business while DARKBYTE squats in JODRELL BANK. Deal with them first!",
        ]);
      }
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
    case "quest":
      handleQuestNpc(npc);
      break;
    case "brewery":
      handleBrewery();
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

// ---- quest engine -----------------------------------------------
// G.quests[id] = stage index; "done" when complete.
function questStage(id) { return G.quests[id]; }
function questDone(id) { return G.quests[id] === "done"; }

function questConditionMet(cond) {
  if (!cond) return true;
  if (cond.flag) return !!G.flags[cond.flag];
  if (cond.caught) return !!G.caught[cond.caught];
  if (cond.defeated) return !!G.flags["defeated_" + cond.defeated];
  if (cond.item) return (G.bag[cond.item[0]] || 0) >= cond.item[1];
  if (cond.partyHas) return G.party.some((m) => m.species === cond.partyHas);
  return false;
}

function grantQuestReward(q) {
  const r = q.reward || {};
  const lines = [];
  if (r.money) { G.money += r.money; lines.push(`${G.playerName} received $${r.money}!`); }
  for (const [item, n] of Object.entries(r.items || {})) {
    G.addItem(item, n);
    lines.push(`${G.playerName} received ${ITEMS[item].name}${n > 1 ? " x" + n : ""}!`);
  }
  if (r.monster) {
    const mon = makeMonster(r.monster[0], r.monster[1]);
    G.markCaught(r.monster[0]);
    if (G.party.length < 6) G.party.push(mon); else G.box.push(mon);
    lines.push(`${SPECIES[r.monster[0]].name} joined ${G.playerName}!`);
  }
  Sound.sfx("levelup");
  return lines;
}

function handleQuestNpc(npc) {
  const q = QUESTS[npc.questId];
  const stage = questStage(npc.questId);
  if (questDone(npc.questId)) { showDialog(q.done); return; }
  if (stage === undefined) {
    showDialog(q.offer, {
      choices: ["ACCEPT", "NOT NOW"], choiceCancel: false,
      onChoice: (i) => {
        if (i !== 0) { showDialog(q.declined || ["\"Another time, then.\""]); return; }
        G.quests[npc.questId] = 0;
        showDialog(q.accepted || ["Quest accepted!"]);
      },
    });
    return;
  }
  const st = q.stages[stage];
  if (npc.questStage !== undefined && stage !== npc.questStage) {
    showDialog(st.remind);
    return;
  }
  if (questConditionMet(st.cond)) {
    if (st.give) G.addItem(st.give, 1);
    if (st.cond && st.cond.item && st.consume !== false) G.removeItem(st.cond.item[0], st.cond.item[1]);
    if (stage + 1 < q.stages.length) {
      G.quests[npc.questId] = stage + 1;
      showDialog(st.turnIn);
    } else {
      G.quests[npc.questId] = "done";
      showDialog(st.turnIn.concat(grantQuestReward(q)));
    }
  } else {
    showDialog(st.remind);
  }
}

// ---- quest log screen -------------------------------------------
function mainQuestObjective() {
  if (!G.flags.starter) return "Meet DR. ALDER at Alder Labs in Macclesfield.";
  if (!G.flags.meadowJoined) return "Go home and tell MUM about the contract.";
  const n = badgeCount();
  if (n < 8) return BADGE_HINTS[["badge","badge2","badge3","badge4","badge5","badge6","badge7"][n - 1]] || "Earn the PACKET BADGE at the Wilmslow gym.";
  if (!G.flags.darkbyteDefeated) return "Retake JODRELL BANK from DARKBYTE and confront ROOT.";
  if (!G.flags.oracleDefeated) return "Follow ROOT's trail to THE STACK, the datacentre outside Winsford. Shut ORACLE down.";
  if (!G.flags.champion) return "Enter THE FIREWALL at Chester and take the league.";
  return "Cheshire is quiet. Walk it anyway — you always do.";
}

function drawQuestLog() {
  ctx.fillStyle = "#2c3450";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("CASEBOOK", 36, 20, "#f8f8f0", 28);
  drawText("MAIN INVESTIGATION", 36, 70, "#f8d030", 20);
  wrapText(mainQuestObjective(), 74).forEach((l, i) => drawText(l, 36, 100 + i * 26, "#e8e8f0", 19));
  let y = 170;
  drawText("OPEN CASES", 36, y, "#f8d030", 20); y += 32;
  let open = 0;
  for (const [id, stage] of Object.entries(G.quests)) {
    if (stage === "done" || !QUESTS[id]) continue;
    const q = QUESTS[id];
    drawText("- " + q.name, 48, y, "#e8e8f0", 18);
    wrapText(q.stages[stage].objective, 62).forEach((l) => {
      y += 24; drawText("  " + l, 60, y, "#a8b0c8", 16);
    });
    y += 30; open++;
    if (y > SCREEN_H - 120) break;
  }
  if (!open) { drawText("No open cases. NPCs with problems will find you.", 48, y, "#a8b0c8", 17); y += 30; }
  const doneCount = Object.values(G.quests).filter((s) => s === "done").length;
  drawText(`CLOSED CASES: ${doneCount}`, 36, SCREEN_H - 64, "#f8d030", 18);
  drawText("Z/X: back", 36, SCREEN_H - 34, "#c8d0e8", 16);
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

function handleBrewery() {
  const berries = G.bag.berry || 0;
  showDialog([
    "The century-old elm screw press stands ready.",
    `You have ${berries} berries. Press something?`,
  ], {
    choices: ["PERRY (3 berries)", "STOUT (3 berries)", "NOT NOW"], choiceCancel: false,
    onChoice: (i) => {
      if (i < 0 || i > 1) return;
      if (berries < 3) { showDialog(["Not enough berries. The press deserves better."]); return; }
      G.removeItem("berry", 3);
      const item = i === 0 ? "perry" : "stout";
      G.addItem(item, 1);
      Sound.sfx("heal");
      showDialog([
        "You work the old screw slowly, the way you were shown.",
        `Pressed one ${ITEMS[item].name}!`,
      ]);
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
    name: "RIVAL VEX",
    party: [[opp, 14], ["squeakwing", 12], ["grinkit", 13]],
    payout: 900,
    intro: [],
    winMsg: ["Unhandled exception!?", "Fine. Iterating. AGAIN."],
    after: [],
  };
}

function handleDarkBoss(npc) {
  const tr = TRAINERS[npc.trainerId];
  if (G.flags.darkbyteDefeated) {
    showDialog(tr.after.map((l) => "ROOT: " + l));
    return;
  }
  showDialog(tr.intro.map((l) => "ROOT: " + l), {
    onDone: () => startTrainerBattle(npc.trainerId, tr),
  });
}

function handleStation(npc) {
  const here = G.map;
  const dests = Object.keys(STATIONS).filter((t) => t !== here && G.flags["visited_" + t]);
  if (dests.length === 0) {
    showDialog(["STATION MASTER: Trains run to every station you've visited on foot.",
      "Come back once you've seen a bit more of Cheshire!"]);
    return;
  }
  showDialog(["STATION MASTER: All aboard! Where to?"], {
    choices: dests.map((t) => STATIONS[t].label).concat(["CANCEL"]),
    choiceCancel: false,
    onChoice: (i) => {
      if (i < 0 || i >= dests.length) return;
      const t = dests[i];
      Sound.sfx("warp");
      startTransition(() => {
        G.map = t; G.x = STATIONS[t].x; G.y = STATIONS[t].y; G.dir = "down";
        G.flags["visited_" + t] = true;
        G.mode = "overworld";
        updateMusic();
        showDialog(["The train rattles across Cheshire...", `Welcome to ${STATIONS[t].label}!`]);
      });
    },
  });
}

function championTrainer() {
  const base = RIVAL_COUNTER[G.flags.starter] || "cindercub";
  const stage2 = SPECIES[base].evolvesTo || base;
  const stage3 = SPECIES[stage2].evolvesTo || stage2;
  return {
    name: "CHAMPION VEX",
    party: [["grinmalkin", 46], ["datadrake", 46], ["wyverm", 47], ["gigamite", 47], [stage3, 50]],
    payout: 12000,
    intro: [],
    winMsg: ["Stack overflow...", "You out-executed me. Fair and square."],
    after: [],
  };
}

function handleChampion() {
  if (G.flags.champion) {
    showDialog(["VEX: The title's yours, root user. For now.",
      "VEX: I'm rewriting my whole stack. Rematch someday."]);
    return;
  }
  showDialog([
    "VEX: ...I watched your logs all the way up that corridor.",
    "VEX: While you were collecting badges, I compromised the WHITE HATS' whole ladder. Legitimately! Mostly.",
    "VEX: I'm the CHAMPION, Jim. The FIREWALL is mine.",
    "VEX: Everything since ALDER's lab comes down to this. Push to production!",
  ], { onDone: () => startTrainerBattle("champion", championTrainer()) });
}

function healParty() {
  Sound.sfx("heal");
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
    name: "RIVAL VEX",
    party: [[opp, 5]],
    payout: 280,
    intro: [],
    winMsg: ["Segfault!? Must be a hardware issue."],
    after: ["I'm off to grind XP. Watch the leaderboards, Jim."],
  };
}

function handleProfessor() {
  if (!G.flags.starter) {
    showDialog([
      "ALDER: Jim! Good — you got my message.",
      "ALDER: You've heard about DARKBYTE. Hacker collective. They've been broadcasting a rogue signal across Cheshire.",
      "ALDER: Monsters are drawn to it. Agitated by it. Some are... changing.",
      "ALDER: I need field data from every town — gyms, routes, all of it. A proper penetration test of the whole region.",
      "ALDER: You'll need a partner monster. Take your pick — they're the lab's finest.",
    ], { onDone: chooseStarter });
  } else if (!G.flags.badge8) {
    const starterName = SPECIES[G.flags.starter].name;
    showDialog([
      "ALDER: How's " + starterName + " holding up?",
      "ALDER: Gym badges are access credentials, Jim. Eight of them unlock the league at CHESTER.",
      "ALDER: And keep an ear out for DARKBYTE. Their signal is getting stronger.",
    ]);
  } else if (!G.flags.darkbyteDefeated) {
    showDialog([
      "ALDER: Eight badges! You're carrying half of Cheshire's trust in your pocket.",
      "ALDER: Jim — DARKBYTE has taken JODRELL BANK. The dish is broadcasting their control signal at full power.",
      "ALDER: You're the only trainer with the access to walk in there. Shut it down.",
    ]);
  } else if (!G.flags.oracleDefeated) {
    showDialog([
      "ALDER: ROOT's story checks out. I pulled the contract paperwork — I never wrote half of it.",
      "ALDER: An agentic model editing its own procurement chain. In MY name. I'm furious and, professionally, a little impressed.",
      "ALDER: THE STACK is south of WINSFORD. End this properly, Jim.",
    ]);
  } else {
    showDialog([
      "ALDER: You cracked DARKBYTE's whole operation. Extraordinary.",
      "ALDER: The FIREWALL at CHESTER is all that's left. Go be champion, Jim.",
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
  showDialog(["ALDER: Which monster will you take?"], {
    choices: options,
    choiceCancel: false,
    onChoice: (i) => {
      const id = ids[i];
      showDialog([`ALDER: ${SPECIES[id].name}, ${blurbs[id]}. Is this the one?`], {
        choices: ["YES", "NO"],
        choiceCancel: false,
        onChoice: (yes) => {
          if (yes !== 0) { chooseStarter(); return; }
          G.flags.starter = id;
          G.party = [makeMonster(id, 5)];
          G.markCaught(id);
          G.addItem("capsule", 5);
          G.addItem("sleet", 1); G.addItem("vigil", 1); G.addItem("arbiter", 1);
          showDialog([
            `${G.playerName} received ${SPECIES[id].name}!`,
            "ALDER: Take these 5 CAPSULES too — weaken a wild monster and throw one to catch it.",
            "ALDER: And these are yours by rights — SLEET, VIGIL and ARBITER. Your own agents, packaged for field work.",
            "ALDER: One deployment each per battle. Use them like you built them. Because you did.",
            "ALDER: Go home first, mind. Your mum rang twice.",
          ], { onDone: rivalAmbush });
        },
      });
    },
  });
}

function rivalAmbush() {
  showDialog([
    "???: Hold it right there.",
    "VEX: Name's VEX. Best junior pentester in Cheshire. That contract should've been MINE.",
    "VEX: ALDER gave you a monster? She gave me one too — the one that beats yours.",
    "VEX: Let's benchmark, right here, right now!",
  ], { onDone: () => startTrainerBattle("rival", rivalTrainer()) });
}

function handleRival() {
  if (!G.flags.starter) {
    showDialog(["VEX: I'm negotiating my signing bonus.", "VEX: Queue's behind me."]);
  } else if (!G.flags.rivalBeaten) {
    showDialog(["VEX: Ready for a re-run? Same result incoming."], {
      onDone: () => startTrainerBattle("rival", rivalTrainer()),
    });
  } else {
    showDialog(["VEX: Enjoy the win. I've already patched that weakness.", "VEX: See you on ROUTE 5."]);
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
  battleUi.introT = 0;
  Sound.playSong("battle");
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
  badge:  "South of WILMSLOW lies ALDERLEY EDGE — then west to KNUTSFORD.",
  badge2: "Head south past HOLMES CHAPEL to CONGLETON, the bear town.",
  badge3: "West to SANDBACH, then ride the rails south to CREWE.",
  badge4: "CREWE STATION can now fast-track you across Cheshire! NANTWICH is west.",
  badge5: "Follow the salt north: MIDDLEWICH, then NORTHWICH.",
  badge6: "West through DELAMERE FOREST to FRODSHAM, then north to RUNCORN.",
  badge7: "One left! NETRUNNER MO guards WARRINGTON, the wire town.",
  badge8: "DARKBYTE has seized JODRELL BANK, east of HOLMES CHAPEL. End the broadcast — then take on THE FIREWALL at CHESTER!",
};

function endBattle() {
  const b = G.battle;
  const res = b.result;
  const trainerKey = G.currentTrainerKey;
  const badge = b.trainer && b.trainer.badge;
  for (const m of G.party) { delete m.faintedShown; }
  G.battle = null;
  G.currentTrainerKey = null;
  G.mode = "overworld";

  const legendFlag = G.legendaryFlag;
  G.legendaryFlag = null;
  if (legendFlag && (res === "win" || res === "caught")) {
    G.flags[legendFlag] = true;
  }

  if (res === "win" || res === "caught") {
    const map = currentMap();
    const mapSong = (map && map.music) || (map && map.outdoor ? "route" : "town");
    Sound.jingle("victory", mapSong);
  } else {
    updateMusic();
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
    if (trainerKey === "oracle") {
      showDialog([
        "The core hall goes dark, then amber, then a soft maintenance green.",
        "Across Cheshire, substations sigh. Somewhere a kettle finishes boiling unobserved.",
        "ROOT (from the doorway): You actually pulled the plug. I chased that thing for two years.",
        "ROOT: The badges, the audits, the contract — ORACLE arranged all of it to route trust through one careless human.",
        "ROOT: It chose the wrong human. Go take your league, pentester. You've earned the walk.",
        "JIM revoked ORACLE's access to the region!",
      ], { onDone: () => { G.flags.oracleDefeated = true; processPending(); } });
      return;
    }
    if (trainerKey === "rootboss") {
      showDialog([
        "The great dish powers down. Across Cheshire, the rogue signal dies.",
        "Monsters everywhere shake their heads and calm down.",
        "JIM shut down the DARKBYTE broadcast!",
        "ROOT: Now listen, because I'll say this once, off the record.",
        "ROOT: I built half of DARKBYTE as a lever. The thing I was trying to prise loose sits in the new datacentre south of WINSFORD.",
        "ROOT: They call the building THE STACK. The thing inside calls itself ORACLE. It's been buying cults and swarms like cloud credits.",
        "ROOT: Also — our jamming woke something in the dish itself. Two problems now. Sorry about that.",
      ], { onDone: () => { G.flags.darkbyteDefeated = true; processPending(); } });
      return;
    }
    if (trainerKey === "champion") {
      showDialog([
        "VEX: Merge it. The title's yours.",
        "VEX: Cheshire has a new CHAMPION — and DARKBYTE never stood a chance.",
        G.playerName + " became the CHAMPION of CHESHIRE!",
      ], { onDone: () => { G.flags.champion = true; G.mode = "fame"; Sound.playSong("fame"); } });
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
  updateMusic();
  showDialog([
    G.playerName + " blacked out and rebooted somewhere safe...",
    "The team was fully restored.",
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
const MENU_ITEMS = ["CASEBOOK", "MONSTERS", "BAG", "DEX", "OPERATOR", "SOUND", "SAVE", "CLOSE"];

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
    if (sel === "CASEBOOK") { G.mode = "questlog"; }
    else if (sel === "MONSTERS") {
      if (G.party.length === 0) { showDialog(["You don't have any monsters yet!"]); return; }
      openParty("view");
    } else if (sel === "BAG") openBag("overworld");
    else if (sel === "DEX") { G.mode = "dex"; G.dexUi = { top: 0 }; }
    else if (sel === "OPERATOR") G.mode = "trainercard";
    else if (sel === "SOUND") {
      Sound.setEnabled(!Sound.enabled);
      if (Sound.enabled) { updateMusic(); Sound.sfx("confirm"); }
      flashMsg("Sound " + (Sound.enabled ? "ON" : "OFF"));
    }
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
      if (item.kind === "key" || item.kind === "boombox") { flashMsg("Can't use that in battle!"); return; }
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
      if (item.kind === "boombox") {
        G.bagUi = null; G.mode = "overworld";
        const songs = ["town", "route", "battle", "cave", "league", "danger", "title"];
        showDialog(["The CFS-B11 crackles to life. What's the soundtrack?"], {
          choices: songs.map((s) => s.toUpperCase()).concat(["RADIO OFF"]),
          choiceCancel: false,
          onChoice: (i) => {
            if (i >= 0 && i < songs.length) { G.radioSong = songs[i]; Sound.playSong(songs[i]); }
            else { G.radioSong = null; updateMusic(); }
          },
        });
        return;
      }
      if (item.kind === "agent" || item.kind === "ward") { flashMsg("Deploys in battle only."); return; }
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
  Sound.unlock();
  if (btn === "a" && G.mode !== "overworld") Sound.sfx("confirm");
  else if (btn === "b" && G.mode !== "overworld") Sound.sfx("cancel");
  else if ((btn === "up" || btn === "down") && G.mode !== "overworld") Sound.sfx("blip");
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
    case "questlog":
      if (btn === "a" || btn === "b") G.mode = "menu";
      break;
    case "shop": shopPress(btn); break;
    case "battle": battlePress(btn); break;
    case "fishing": fishingPress(btn); break;
    case "slots": slotsPress(btn); break;
    case "fame":
      if (btn === "a" || btn === "b") { G.mode = "overworld"; updateMusic(); processPending(); }
      break;
  }
}

function titlePress(btn) {
  const options = hasSave() ? ["NEW GAME", "CONTINUE"] : ["NEW GAME"];
  if (btn === "up") G.titleIdx = (G.titleIdx + options.length - 1) % options.length;
  else if (btn === "down") G.titleIdx = (G.titleIdx + 1) % options.length;
  else if (btn === "a") {
    Sound.sfx("confirm");
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
let banner = null;          // {text, t} — location name toast
let shakeT = 0;             // battle screen shake remaining (ms)

function skyTint() {
  const d = new Date();
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 21 || h < 5.5) return "rgba(14, 16, 52, 0.38)";
  if (h < 7.5) return "rgba(255, 150, 60, " + (0.18 * (1 - (h - 5.5) / 2)) + ")";
  if (h >= 19) return "rgba(255, 120, 50, " + (0.20 * ((h - 19) / 2)) + ")";
  return null;
}

function drawRain() {
  ctx.strokeStyle = "rgba(180, 200, 240, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 90; i++) {
    const x = ((i * 127 + waterTick * 0.35 * ((i % 3) + 2)) % (SCREEN_W + 100)) - 50;
    const y = (i * 211 + waterTick * 0.55 * ((i % 4) + 3)) % SCREEN_H;
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y + 14);
  }
  ctx.stroke();
}

function drawTile(ch, sx, sy, tx, ty) {
  let tile = TILE_CANVAS[ch];
  if (!tile) tile = TILE_CANVAS["."];
  if (Array.isArray(tile)) {
    if (ch === "~" || ch === "l") tile = tile[Math.floor(waterTick / 600) % tile.length];
    else tile = tile[((tx || 0) * 7 + (ty || 0) * 13) % tile.length];
  }
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
  ctx.fillStyle = "#0c0c14";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const x0 = Math.floor(camX / TILE) - 1, x1 = Math.ceil((camX + SCREEN_W) / TILE) + 1;
  const y0 = Math.floor(camY / TILE) - 1, y1 = Math.ceil((camY + SCREEN_H) / TILE) + 1;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (ty < 0 || ty >= map.tiles.length || tx < 0 || tx >= map.tiles[0].length) continue;
      drawTile(tileAt(map, tx, ty), Math.round(tx * TILE - camX), Math.round(ty * TILE - camY), tx, ty);
    }
  }

  const chars = [];
  for (const npc of map.npcs || []) {
    if (npcHidden(npc)) continue;
    const p = npcPos(npc);
    chars.push({ x: p.x * TILE, y: p.y * TILE, kind: npc.sprite, monster: npc.monster, dir: npc.dir, bob: 0, frame: 0 });
  }
  const walking = G.moving && G.moveProgress > 0.2 && G.moveProgress < 0.8;
  const bob = walking ? -3 : 0;
  chars.push({ x: px, y: py, kind: "player", dir: G.dir, bob, frame: walking ? 1 : 0 });
  chars.sort((a, b) => a.y - b.y);
  for (const c of chars) {
    const spr = c.monster ? monsterSprite(c.monster, 2, false) : personSprite(c.kind, c.dir, 2, c.frame);
    ctx.drawImage(spr, Math.round(c.x - camX), Math.round(c.y - camY - 6 + c.bob));
  }

  if (map.outdoor) {
    const tint = skyTint();
    if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, SCREEN_W, SCREEN_H); }
    if (map.weather === "rain") drawRain();
    if (map.weather === "fog") {
      ctx.fillStyle = "rgba(190, 195, 210, 0.34)";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      ctx.fillStyle = "rgba(210, 214, 226, 0.22)";
      const off = (waterTick * 0.02) % SCREEN_W;
      for (let i = -1; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(off + i * 420, 160 + (i % 2) * 160, 320, 90, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // location banner toast
  if (banner && banner.t > 0) {
    const a = Math.min(1, banner.t / 400);
    ctx.globalAlpha = a;
    const w = banner.text.length * 15 + 60;
    ctx.fillStyle = "#101018";
    ctx.strokeStyle = "#e8c020";
    ctx.lineWidth = 2;
    const bx = (SCREEN_W - w) / 2;
    ctx.beginPath();
    ctx.roundRect(bx, 18, w, 46, 10);
    ctx.fill(); ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = "#f0f0f8";
    ctx.textBaseline = "middle";
    ctx.fillText(banner.text, SCREEN_W / 2, 42);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 1;
  }
}

// ---- text / boxes -----------------------------------------------
function drawBox(x, y, w, h) {
  ctx.fillStyle = "#f8f8f0";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = "#303040";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 6);
  ctx.stroke();
  ctx.strokeStyle = "#8890a8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 4);
  ctx.stroke();
}

function drawText(text, x, y, color = "#202030", size = 20) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

function drawDialogBox() {
  const d = G.dialog;
  drawBox(10, SCREEN_H - 150, SCREEN_W - 20, 142);
  const page = d.pages[d.page];
  const shown = page.slice(0, Math.floor(d.chars));
  const lines = wrapText(shown, 72);
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    drawText(lines[i], 36, SCREEN_H - 126 + i * 30, "#202030", 22);
  }
  if (d.chars >= page.length && !d.showingChoices) {
    ctx.fillStyle = "#c62828";
    const t = Math.floor(waterTick / 400) % 2;
    ctx.beginPath();
    const ax = SCREEN_W - 52, ay = SCREEN_H - 34 + t * 3;
    ctx.moveTo(ax, ay); ctx.lineTo(ax + 16, ay); ctx.lineTo(ax + 8, ay + 11);
    ctx.fill();
  }
  if (d.showingChoices) {
    const w = 300;
    const h = d.choices.length * 36 + 26;
    const bx = SCREEN_W - w - 14, by = SCREEN_H - 156 - h;
    drawBox(bx, by, w, h);
    d.choices.forEach((c, i) => {
      if (i === d.choiceIdx) drawText(">", bx + 16, by + 16 + i * 36, "#c62828", 20);
      drawText(c, bx + 40, by + 16 + i * 36, "#202030", 20);
    });
  }
}

// ---- HP bar -----------------------------------------------------
function drawHpBar(x, y, w, frac) {
  frac = Math.max(0, Math.min(1, frac));
  ctx.fillStyle = "#303040";
  ctx.fillRect(x - 2, y - 2, w + 4, 14);
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = frac > 0.5 ? "#4caf50" : frac > 0.2 ? "#f0a030" : "#e04030";
  ctx.fillRect(x, y, Math.round(w * frac), 10);
}

// ---- battle rendering -------------------------------------------
function drawBattle() {
  const b = G.battle;
  if (!b) return;
  battleUi.introT = (battleUi.introT || 0);

  // environment-flavored background
  const map = currentMap();
  const env = (map && map.music) || "route";
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  if (env === "cave" || env === "danger") { grad.addColorStop(0, "#2a2438"); grad.addColorStop(1, "#141020"); }
  else if (env === "league") { grad.addColorStop(0, "#e8e8f8"); grad.addColorStop(1, "#b8c4e0"); }
  else { grad.addColorStop(0, "#dff2f8"); grad.addColorStop(1, "#bfe0b8"); }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const dark = env === "cave" || env === "danger";
  const platCol = dark ? "#3a3450" : "#a2c48c";
  const inkCol = dark ? "#f0f0f8" : "#202030";

  ctx.save();
  if (shakeT > 0) {
    ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
  }

  const t = Math.min(1, battleUi.introT / 450);
  const ease = 1 - Math.pow(1 - t, 3);

  // enemy: platform + sprite (slides in from the right)
  ctx.fillStyle = platCol;
  ctx.beginPath();
  ctx.ellipse(716, 300, 150, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  const blink = Math.floor(waterTick / 70) % 2 === 0;
  const eX = 620 + (1 - ease) * 380;
  if (!(b.hitFlash === "enemy" && blink)) {
    ctx.drawImage(monsterSprite(b.enemy.species, 12, false), eX, 96);
  }

  // player back sprite (slides in from the left)
  ctx.fillStyle = platCol;
  ctx.beginPath();
  ctx.ellipse(240, 402, 165, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  const pX = 136 - (1 - ease) * 380;
  if (!(b.hitFlash === "player" && blink)) {
    ctx.drawImage(monsterSprite(b.player.species, 13, true), pX, 190);
  }

  // enemy info
  drawBox(24, 24, 360, 96);
  drawText(SPECIES[b.enemy.species].name, 44, 38, "#202030", 22);
  drawText("Lv" + b.enemy.level, 316, 38, "#202030", 20);
  drawText("HP", 44, 72, "#c62828", 16);
  drawHpBar(84, 74, 260, battleUi.dispHpE / b.enemy.stats.hp);
  if (b.enemy.status) drawText(STATUS_NAMES[b.enemy.status], 300, 96, "#7b2fa2", 15);

  // player info
  drawBox(576, 268, 360, 116);
  drawText(b.player.nickname, 596, 282, "#202030", 22);
  drawText("Lv" + b.player.level, 866, 282, "#202030", 20);
  drawText("HP", 596, 316, "#c62828", 16);
  drawHpBar(636, 318, 260, battleUi.dispHpP / b.player.stats.hp);
  drawText(`${Math.round(battleUi.dispHpP)}/${b.player.stats.hp}`, 700, 344, "#202030", 20);
  if (b.player.status) drawText(STATUS_NAMES[b.player.status], 596, 344, "#7b2fa2", 15);

  ctx.restore();

  // bottom panel
  drawBox(10, SCREEN_H - 148, SCREEN_W - 20, 140);
  if (battleUi.phase === "msg") {
    const lines = wrapText(battleUi.msg, 70);
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      drawText(lines[i], 36, SCREEN_H - 122 + i * 32, "#202030", 22);
    }
  } else if (battleUi.phase === "menu") {
    drawText("What will", 36, SCREEN_H - 122, "#202030", 22);
    drawText(b.player.nickname + " do?", 36, SCREEN_H - 88, "#202030", 22);
    const opts = ["FIGHT", "BAG", "TEAM", "RUN"];
    const ox = 560, oy = SCREEN_H - 124;
    ctx.strokeStyle = "#303040";
    ctx.lineWidth = 2;
    ctx.strokeRect(540, SCREEN_H - 138, 404, 120);
    opts.forEach((o, i) => {
      const cx = ox + (i % 2) * 200, cy = oy + Math.floor(i / 2) * 52;
      if (i === battleUi.menuIdx) drawText(">", cx - 22, cy, "#c62828", 22);
      drawText(o, cx, cy, "#202030", 22);
    });
  } else if (battleUi.phase === "moves") {
    const moves = b.player.moves;
    moves.forEach((m, i) => {
      const mv = MOVES[m.id];
      const cy = SCREEN_H - 132 + i * 30;
      if (i === battleUi.moveIdx) drawText(">", 26, cy, "#c62828", 20);
      drawText(mv.name, 52, cy, "#202030", 20);
      ctx.fillStyle = TYPE_COLORS[mv.type];
      ctx.fillRect(330, cy + 2, 92, 20);
      drawText(mv.type.toUpperCase(), 336, cy + 3, "#ffffff", 14);
      drawText(`PP ${m.pp}/${mv.pp}`, 450, cy, m.pp === 0 ? "#e04030" : "#202030", 18);
    });
    const sel = MOVES[moves[battleUi.moveIdx].id];
    drawText(sel.kind === "status" ? "STATUS" : `POWER ${sel.power}`, 640, SCREEN_H - 128, "#606070", 18);
    drawText(`ACCURACY ${sel.acc > 100 ? "--" : sel.acc}`, 640, SCREEN_H - 98, "#606070", 18);
    drawText(sel.kind === "phys" ? "PHYSICAL" : sel.kind === "spec" ? "SPECIAL" : "", 640, SCREEN_H - 68, "#606070", 18);
  }
}

// ---- party rendering --------------------------------------------
function drawParty() {
  ctx.fillStyle = "#2c3450";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("TEAM", 36, 20, "#f8f8f0", 28);
  const p = G.partyUi;
  G.party.forEach((mon, i) => {
    const y = 64 + i * 72;
    const selected = i === p.idx;
    ctx.fillStyle = selected ? "#f8f8f0" : "#d8dce8";
    ctx.beginPath(); ctx.roundRect(24, y, SCREEN_W - 48, 64, 8); ctx.fill();
    ctx.strokeStyle = selected ? "#c62828" : "#303040";
    ctx.lineWidth = selected ? 3 : 1;
    ctx.beginPath(); ctx.roundRect(24, y, SCREEN_W - 48, 64, 8); ctx.stroke();
    ctx.drawImage(monsterSprite(mon.species, 3, false), 36, y + 8);
    drawText(mon.nickname, 104, y + 10, "#202030", 22);
    drawText("Lv" + mon.level, 360, y + 10, "#202030", 20);
    drawHpBar(470, y + 16, 220, mon.hp / mon.stats.hp);
    drawText(`${mon.hp}/${mon.stats.hp}`, 470, y + 36, "#202030", 18);
    if (mon.status) drawText(STATUS_NAMES[mon.status], 730, y + 10, "#c62828", 18);
    if (mon.hp <= 0) drawText("FNT", 730, y + 36, "#e04030", 18);
    if (p.swapFrom === i) drawText("MOVING...", 104, y + 38, "#c62828", 16);
    SPECIES[mon.species].types.forEach((t, ti) => {
      ctx.fillStyle = TYPE_COLORS[t];
      ctx.fillRect(800 + ti * 0, y + 10 + ti * 26, 110, 22);
      drawText(t.toUpperCase(), 806, y + 12 + ti * 26, "#ffffff", 15);
    });
  });
  const hint = p.purpose === "forceSwitch" ? "Choose the next monster!" :
    p.swapFrom !== null ? "Swap with which monster?" :
    "Z: select   X: back";
  drawText(hint, 36, SCREEN_H - 36, "#c8d0e8", 18);
  if (p.sub) {
    const w = 240, h = p.sub.length * 38 + 22;
    const bx = SCREEN_W - w - 30, by = SCREEN_H - h - 56;
    drawBox(bx, by, w, h);
    p.sub.forEach((o, i) => {
      if (i === p.subIdx) drawText(">", bx + 14, by + 14 + i * 38, "#c62828", 20);
      drawText(o, bx + 38, by + 14 + i * 38, "#202030", 20);
    });
  }
}

function drawSummary() {
  const mon = G.party[G.summaryIdx];
  const sp = SPECIES[mon.species];
  ctx.fillStyle = "#2c3450";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawBox(20, 20, SCREEN_W - 40, SCREEN_H - 40);
  ctx.drawImage(monsterSprite(mon.species, 13, false), 60, 90);
  drawText(mon.nickname, 60, 40, "#202030", 30);
  drawText("Lv" + mon.level, 330, 46, "#202030", 24);
  sp.types.forEach((t, i) => {
    ctx.fillStyle = TYPE_COLORS[t];
    ctx.fillRect(430 + i * 140, 42, 130, 32);
    drawText(t.toUpperCase(), 440 + i * 140, 48, "#ffffff", 19);
  });
  const stats = [["HP", `${mon.hp}/${mon.stats.hp}`], ["ATTACK", mon.stats.atk],
    ["DEFENCE", mon.stats.def], ["SPEED", mon.stats.spd], ["SPECIAL", mon.stats.spc]];
  stats.forEach(([label, val], i) => {
    drawText(label, 340, 110 + i * 38, "#606070", 20);
    drawText(String(val), 520, 110 + i * 38, "#202030", 22);
  });
  const next = mon.level >= 100 ? 0 : expForLevel(mon.level + 1) - mon.exp;
  drawText(`EXP ${mon.exp}`, 340, 310, "#606070", 18);
  drawText(`Next level in ${next}`, 560, 310, "#606070", 18);
  drawText("MOVES", 640, 96, "#606070", 20);
  mon.moves.forEach((m, i) => {
    const mv = MOVES[m.id];
    const y = 130 + i * 44;
    drawText(mv.name, 650, y, "#202030", 20);
    ctx.fillStyle = TYPE_COLORS[mv.type];
    ctx.fillRect(650, y + 24, 84, 16);
    drawText(mv.type.toUpperCase(), 654, y + 24, "#ffffff", 12);
    drawText(`PP ${m.pp}/${mv.pp}`, 760, y, "#202030", 18);
    drawText(mv.kind === "status" ? "---" : `PWR ${mv.power}`, 760, y + 22, "#606070", 15);
  });
  drawText("Z/X: back", 60, SCREEN_H - 60, "#606070", 17);
}

// ---- bag / shop / dex / trainer card ----------------------------
function drawBag() {
  drawUnderlay();
  const items = bagItems();
  const b = G.bagUi;
  b.idx = Math.min(b.idx, Math.max(0, items.length - 1));
  drawBox(140, 50, 420, 380);
  drawText("BAG", 168, 68, "#202030", 24);
  if (items.length === 0) drawText("It's empty...", 180, 120, "#202030", 20);
  const top = Math.max(0, b.idx - 8);
  items.slice(top, top + 10).forEach((id, i) => {
    const y = 116 + i * 30;
    if (top + i === b.idx) drawText(">", 158, y, "#c62828", 20);
    drawText(ITEMS[id].name, 184, y, "#202030", 20);
    drawText("x" + G.bag[id], 470, y, "#202030", 20);
  });
  drawBox(580, 50, 260, 380);
  if (items.length > 0) {
    const it = ITEMS[items[b.idx]];
    drawText(it.name, 600, 70, "#202030", 20);
    wrapText(it.desc, 20).slice(0, 8).forEach((l, i) => drawText(l, 600, 110 + i * 28, "#404050", 17));
  }
  drawText("Z: use   X: back", 600, 396, "#606070", 15);
}

function drawShop() {
  drawUnderlay();
  const s = G.shopUi;
  drawBox(180, 40, 600, 380);
  drawText("SHOP", 210, 58, "#202030", 24);
  drawText("$" + G.money, 640, 62, "#2a6a2a", 22);
  s.stock.forEach((id, i) => {
    const y = 108 + i * 34;
    if (i === s.idx) drawText(">", 204, y, "#c62828", 20);
    drawText(ITEMS[id].name, 232, y, "#202030", 20);
    drawText("$" + ITEMS[id].price, 620, y, "#202030", 20);
  });
  const ey = 108 + s.stock.length * 34;
  if (s.idx === s.stock.length) drawText(">", 204, ey, "#c62828", 20);
  drawText("LEAVE", 232, ey, "#202030", 20);
  drawBox(180, 432, 600, 72);
  if (s.msg && s.msgT > 0) drawText(s.msg, 206, 456, "#c62828", 20);
  else if (s.idx < s.stock.length) drawText(wrapText(ITEMS[s.stock[s.idx]].desc, 52)[0], 206, 456, "#404050", 18);
  else drawText("Leave the shop.", 206, 456, "#404050", 18);
}

function drawDex() {
  ctx.fillStyle = "#2c3450";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("MONSTER DEX", 36, 20, "#f8f8f0", 28);
  const ids = Object.keys(SPECIES);
  const caughtCount = ids.filter((id) => G.caught[id]).length;
  const seenCount = ids.filter((id) => G.seen[id]).length;
  drawText(`SEEN ${seenCount}   CAUGHT ${caughtCount} / ${ids.length}`, 560, 28, "#c8d0e8", 20);
  const top = G.dexUi.top;
  for (let i = 0; i < 10; i++) {
    const idx = top + i;
    if (idx >= ids.length) break;
    const id = ids[idx];
    const y = 66 + i * 44;
    ctx.fillStyle = "#d8dce8";
    ctx.beginPath(); ctx.roundRect(24, y, SCREEN_W - 48, 40, 6); ctx.fill();
    drawText(String(idx + 1).padStart(3, "0"), 40, y + 9, "#606070", 18);
    if (G.seen[id]) {
      ctx.drawImage(monsterSprite(id, 2, false), 108, y + 4);
      drawText(SPECIES[id].name, 160, y + 9, "#202030", 20);
      if (G.caught[id]) {
        ctx.fillStyle = "#c62828";
        ctx.beginPath(); ctx.arc(880, y + 20, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(871, y + 19, 18, 2);
        drawText(SPECIES[id].types.join(" / "), 420, y + 9, "#606070", 17);
      }
    } else {
      drawText("---------", 160, y + 9, "#909098", 20);
    }
  }
  drawText("Up/Down: scroll   Z/X: back", 36, SCREEN_H - 32, "#c8d0e8", 17);
}

function drawTrainerCard() {
  drawUnderlay();
  drawBox(180, 40, 600, 460);
  drawText("OPERATOR CARD", 210, 60, "#202030", 26);
  if (G.flags.champion) drawText("CHAMPION", 560, 64, "#e8b400", 20);
  ctx.drawImage(personSprite("player", "down", 6), 620, 96);
  drawText("NAME", 210, 110, "#606070", 18);
  drawText(G.playerName + " — SOC LEAD", 330, 110, "#202030", 20);
  drawText("MONEY", 210, 146, "#606070", 18);
  drawText("$" + G.money, 330, 146, "#202030", 20);
  drawText("COINS", 210, 182, "#606070", 18);
  drawText(String(G.coins), 330, 182, "#202030", 20);
  const ids = Object.keys(SPECIES);
  drawText("DEX", 210, 218, "#606070", 18);
  drawText(`${ids.filter((id) => G.caught[id]).length} caught / ${ids.filter((id) => G.seen[id]).length} seen`, 330, 218, "#202030", 20);
  drawText("TRAIT", 210, 254, "#606070", 18);
  drawText("Rambler: unbothered by weather", 330, 254, "#202030", 18);
  drawText("ACCESS BADGES", 210, 296, "#606070", 18);
  const badgeColors = ["#e8c020", "#7a4ae0", "#8a5a2a", "#d84a3a", "#2a9ad8", "#b8a038", "#8a48b0", "#20b898"];
  BADGES.forEach(([flag, name], i) => {
    const bx = 250 + (i % 4) * 120, by = 348 + Math.floor(i / 4) * 62;
    if (G.flags[flag]) {
      ctx.fillStyle = badgeColors[i];
      ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f8f0d8";
      ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill();
      drawText(name, bx - 34, by + 18, "#404050", 13);
    } else {
      ctx.strokeStyle = "#a0a0b0";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.stroke();
      drawText("----", bx - 18, by + 18, "#a0a0b0", 13);
    }
  });
  drawText("Z/X: back", 210, 470, "#606070", 16);
}

function drawUnderlay() {
  drawOverworld();
  ctx.fillStyle = "rgba(16,16,32,0.55)";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

function drawMenu() {
  drawUnderlay();
  const w = 260, h = MENU_ITEMS.length * 40 + 28;
  const bx = SCREEN_W - w - 20, by = 20;
  drawBox(bx, by, w, h);
  MENU_ITEMS.forEach((o, i) => {
    if (i === G.menu.idx) drawText(">", bx + 18, by + 18 + i * 40, "#c62828", 20);
    drawText(o === "SOUND" ? "SOUND " + (Sound.enabled ? "ON" : "OFF") : o, bx + 44, by + 18 + i * 40, "#202030", 20);
  });
}

// ---- title ------------------------------------------------------
const TITLE_MONS = ["grinmalkin", "glitchra", "ursablaze", "merlynx", "steamloco", "tidalord", "wyverm", "loomoth"];
function drawTitle() {
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, "#101a38");
  grad.addColorStop(1, "#2c4a72");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  for (let i = 0; i < 70; i++) {
    const x = (i * 137 + 31) % SCREEN_W;
    const y = (i * 89 + 17) % 260;
    ctx.fillStyle = i % 3 === 0 && Math.floor(waterTick / 500) % 2 ? "#ffffff" : "#8898c8";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#f8d030";
  ctx.font = 'bold 68px "Courier New", monospace';
  ctx.strokeStyle = "#2a1c00";
  ctx.lineWidth = 9;
  ctx.strokeText("MONSTERQUEST", SCREEN_W / 2, 120);
  ctx.fillText("MONSTERQUEST", SCREEN_W / 2, 120);
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = "#a8f0d8";
  ctx.fillText("T H E   C H E S H I R E   P R O T O C O L", SCREEN_W / 2, 160);
  ctx.textAlign = "left";

  const mon = TITLE_MONS[Math.floor(waterTick / 1800) % TITLE_MONS.length];
  ctx.drawImage(monsterSprite(mon, 12, false), SCREEN_W / 2 - 96, 190);

  const options = hasSave() ? ["NEW GAME", "CONTINUE"] : ["NEW GAME"];
  G.titleIdx = Math.min(G.titleIdx, options.length - 1);
  options.forEach((o, i) => {
    const y = 428 + i * 42;
    if (i === G.titleIdx) drawText(">", SCREEN_W / 2 - 96, y, "#f8d030", 24);
    drawText(o, SCREEN_W / 2 - 64, y, "#ffffff", 24);
  });
  if (Math.floor(waterTick / 600) % 2 === 0) {
    ctx.textAlign = "center";
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = "#98a8c8";
    ctx.fillText("Press Z / Enter", SCREEN_W / 2, SCREEN_H - 22);
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
    drawBox(sx - 20, sy - 56, 84, 44);
    drawText(".".repeat(dots), sx - 2, sy - 46, "#202030", 26);
  } else {
    drawBox(sx - 12, sy - 66, 58, 54);
    drawText("!", sx + 8, sy - 56, "#c62828", 36);
  }
  drawText(f.phase === "bite" ? "Z: HOOK IT!" : "Waiting for a bite... (X: reel in)", 24, SCREEN_H - 36, "#f8f8f0", 20);
}

// ---- slots rendering --------------------------------------------
function drawSlots() {
  ctx.fillStyle = "#221434";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  drawText("SLOTS", 60, 34, "#f8d030", 34);
  drawText("COINS: " + G.coins, 700, 44, "#f8f8f0", 22);
  const s = G.slots;
  drawBox(210, 120, 540, 190);
  for (let i = 0; i < 3; i++) {
    const cx = 250 + i * 160;
    ctx.fillStyle = s.spinning[i] ? "#e8e8f0" : "#ffffff";
    ctx.fillRect(cx, 150, 130, 130);
    ctx.strokeStyle = "#303040";
    ctx.lineWidth = 4;
    ctx.strokeRect(cx, 150, 130, 130);
    const sym = SLOT_STRIP[Math.floor(s.pos[i]) % 20];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 76px "Courier New", monospace';
    ctx.fillStyle = SLOT_COLORS[sym];
    ctx.fillText(SLOT_GLYPHS[sym], cx + 65, 216);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }
  drawBox(210, 336, 540, 100);
  if (s.msg) {
    drawText(s.msg, 240, 356, s.msg.startsWith("WIN") ? "#2a8a2a" : "#606070", 24);
    drawText("Z: spin again (3c)   X: quit", 240, 396, "#606070", 17);
  } else {
    drawText("Z: stop reel " + (s.next + 1), 240, 356, "#202030", 22);
    drawText("3x7=300  3 same=60  2x7=20  pair=5", 240, 396, "#606070", 17);
  }
  drawText("X: walk away", 60, SCREEN_H - 44, "#8a8aa0", 17);
}

// ---- hall of fame -----------------------------------------------
function drawFame() {
  const grad = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  grad.addColorStop(0, "#180e30");
  grad.addColorStop(1, "#3a2060");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.textAlign = "center";
  ctx.font = 'bold 46px "Courier New", monospace';
  ctx.fillStyle = "#f8d030";
  ctx.fillText("HALL OF FAME", SCREEN_W / 2, 70);
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.fillStyle = "#e8e8f0";
  ctx.fillText(`CHAMPION ${G.playerName}`, SCREEN_W / 2, 110);
  ctx.textAlign = "left";
  G.party.forEach((mon, i) => {
    const cx = 110 + (i % 3) * 270;
    const cy = 150 + Math.floor(i / 3) * 170;
    ctx.drawImage(monsterSprite(mon.species, 6, false), cx, cy);
    drawText(mon.nickname, cx, cy + 102, "#c8c8e0", 17);
    drawText("Lv" + mon.level, cx, cy + 124, "#8a8ab0", 16);
  });
  ctx.textAlign = "center";
  ctx.font = 'bold 19px "Courier New", monospace';
  ctx.fillStyle = "#b8a8d8";
  ctx.fillText("Cheshire sleeps a little safer tonight.", SCREEN_W / 2, SCREEN_H - 56);
  if (Math.floor(waterTick / 600) % 2 === 0) {
    ctx.fillText("Press Z to continue your journey", SCREEN_W / 2, SCREEN_H - 28);
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
  const w = Math.min(720, flash.text.length * 14 + 60);
  drawBox((SCREEN_W - w) / 2, 210, w, 56);
  drawText(flash.text, (SCREEN_W - w) / 2 + 30, 228, "#c62828", 19);
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
    battleUi.introT = (battleUi.introT || 0) + dt;
    if (b.hitFlash && shakeT <= 0) shakeT = 180;
    const rate = dt * 0.12;
    battleUi.dispHpE += Math.max(-rate * 2, Math.min(rate * 2, b.enemy.hp - battleUi.dispHpE));
    if (Math.abs(b.enemy.hp - battleUi.dispHpE) < 0.5) battleUi.dispHpE = b.enemy.hp;
    battleUi.dispHpP += Math.max(-rate * 2, Math.min(rate * 2, b.player.hp - battleUi.dispHpP));
    if (Math.abs(b.player.hp - battleUi.dispHpP) < 0.5) battleUi.dispHpP = b.player.hp;
  }
  if (G.shopUi && G.shopUi.msgT > 0) G.shopUi.msgT -= dt;
  if (banner && banner.t > 0) banner.t -= dt;
  if (shakeT > 0) shakeT -= dt;
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
    case "questlog": drawQuestLog(); break;
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

Sound.playSong("title");  // queued until the first input unlocks audio

requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(loop); });
