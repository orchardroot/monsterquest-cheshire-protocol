// =============================================================
// MonsterQuest — procedural tiles + character/monster pixel art
// =============================================================
"use strict";

const ART = 16;           // art resolution (16x16 pixels)

// ---- generic pixel-art renderer --------------------------------
function renderArt(art, pal, scale, flipX) {
  const c = document.createElement("canvas");
  c.width = ART * scale;
  c.height = ART * scale;
  const g = c.getContext("2d");
  for (let y = 0; y < art.length; y++) {
    const row = art[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      const color = pal[ch];
      if (!color) continue;
      const dx = flipX ? ART - 1 - x : x;
      g.fillStyle = color;
      g.fillRect(dx * scale, y * scale, scale, scale);
    }
  }
  return c;
}


// ---- procedural monster sprite compositor -----------------------
// Species without hand-drawn `art` provide `gen: {body, size, feats}`
// and get a deterministic 16x16 sprite composed here.
function hash32(s) {
  let h = 2166136261;
  for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TYPE_GEN_COLORS = {
  Normal:   ["#c8b088", "#8a7a5a", "#f0e0c0"],
  Fire:     ["#e8763a", "#a83c14", "#f8c84a"],
  Water:    ["#4a8ad8", "#25538f", "#9fd3f8"],
  Grass:    ["#5aab46", "#2e6d22", "#a5d6a7"],
  Electric: ["#f0c830", "#a8821a", "#f8ec90"],
  Flying:   ["#9a8ade", "#5a4a9e", "#d8d0f8"],
  Bug:      ["#a8b830", "#6a7a1a", "#d8e070"],
  Poison:   ["#9a4aaa", "#5c2468", "#d090e0"],
  Rock:     ["#a89468", "#6a5c3a", "#e0d4b8"],
  Ground:   ["#d0a050", "#8a6428", "#ecd09a"],
  Psychic:  ["#e8709a", "#98325a", "#f8c0d8"],
  Ghost:    ["#7a5aa8", "#41306a", "#c0aae8"],
  Cyber:    ["#28c8a0", "#0e7a62", "#a0f8e0"],
};

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * f)));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function genMonsterArt(id, sp) {
  const rnd = mulberry(hash32(id));
  const g = sp.gen || {};
  const size = g.size === undefined ? 1 : g.size;   // 0 small, 1 mid, 2 big
  const grid = Array.from({ length: 16 }, () => Array(16).fill("."));
  const half = 8;
  const set = (x, y, ch) => {
    if (x >= 0 && x < 16 && y >= 0 && y < 16 && grid[y]) grid[y][x] = ch;
  };
  const fillEllipseHalf = (cx, cy, rx, ry, ch) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < half; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) grid[y][x] = ch;
    }
  };
  const body = g.body || ["blob", "tall", "quad", "orb"][Math.floor(rnd() * 4)];
  const S = size * 0.9;
  let eyeY = 7, mouthY = 9, topY = 4;
  if (body === "blob") {
    fillEllipseHalf(7.5, 9, 4.4 + S, 4.4 + S * 0.8, "A");
    eyeY = 8 - size; mouthY = 10; topY = 9 - Math.round(4.4 + S * 0.8);
  } else if (body === "orb") {
    fillEllipseHalf(7.5, 8, 4.6 + S, 4.6 + S, "A");
    eyeY = 7 - size; mouthY = 9; topY = 8 - Math.round(4.6 + S);
  } else if (body === "tall") {
    fillEllipseHalf(7.5, 9, 3.4 + S * 0.6, 5.4 + S, "A");
    fillEllipseHalf(7.5, 5, 3 + S * 0.5, 2.6, "A");
    eyeY = 5; mouthY = 7; topY = 2;
  } else if (body === "quad") {
    fillEllipseHalf(7.5, 8.6, 4.8 + S, 3.4 + S * 0.6, "A");
    fillEllipseHalf(7.5, 5, 2.8 + S * 0.4, 2.4, "A");
    for (const lx of [4 - Math.round(S), 6]) {
      for (let y = 11; y <= 13 + Math.min(1, size); y++) { set(lx, y, "A"); set(lx + 1, y, "A"); }
    }
    eyeY = 4; mouthY = 6; topY = 2;
  } else if (body === "fish") {
    fillEllipseHalf(7.5, 8, 5 + S, 3.4 + S * 0.6, "A");
    for (let y = 4; y <= 6; y++) set(7, y - Math.min(1, size), "C");
    set(6, 5 - Math.min(1, size), "C");
    eyeY = 7; mouthY = 9; topY = 4;
  } else if (body === "serpent") {
    fillEllipseHalf(7.5, 4.5, 3, 2.6, "A");
    fillEllipseHalf(6.5, 8.5, 2.6, 2.4, "A");
    fillEllipseHalf(7.5, 12, 3.2, 2.4, "A");
    eyeY = 4; mouthY = 6; topY = 2;
  } else if (body === "winged") {
    fillEllipseHalf(7.5, 8, 3.2 + S * 0.6, 3.6 + S * 0.6, "A");
    for (let i = 0; i < 4 + size; i++) {
      for (let x = 0; x <= i; x++) set(3 - Math.min(1, size) - x, 5 + i, "C");
    }
    eyeY = 6; mouthY = 8; topY = 4;
  }
  // mirror left half to right
  for (let y = 0; y < 16; y++) for (let x = 0; x < half; x++) {
    if (grid[y][x] !== ".") grid[y][15 - x] = grid[y][x];
  }
  // features
  const feats = g.feats || [];
  const topRow = Math.max(0, topY);
  const has = (f) => feats.includes(f);
  if (has("ears"))   { set(5, topRow, "A"); set(5, topRow - 1, "A"); set(10, topRow, "A"); set(10, topRow - 1, "A"); }
  if (has("horns"))  { set(4, topRow, "C"); set(4, topRow - 1, "C"); set(11, topRow, "C"); set(11, topRow - 1, "C"); }
  if (has("antennae")) { set(5, topRow - 1, "o"); set(5, topRow - 2, "C"); set(10, topRow - 1, "o"); set(10, topRow - 2, "C"); }
  if (has("flame"))  { for (const [dx, dy] of [[6, -1], [7, -2], [8, -1], [7, -3], [9, -2]]) set(dx, topRow + dy, "C"); }
  if (has("leaf"))   { set(7, topRow - 1, "B"); set(8, topRow - 1, "B"); set(7, topRow - 2, "B"); set(6, topRow - 2, "B"); set(9, topRow - 2, "B"); }
  if (has("fins"))   { for (let y = eyeY; y < eyeY + 3; y++) { set(1, y, "C"); set(14, y, "C"); } }
  if (has("gem"))    { set(7, eyeY + 1, "C"); set(8, eyeY + 1, "C"); }
  if (has("bolt"))   { set(3, eyeY + 1, "C"); set(12, eyeY + 1, "C"); set(2, eyeY + 2, "C"); set(13, eyeY + 2, "C"); }
  if (has("rocks"))  { for (let i = 0; i < 5; i++) { const x = 3 + Math.floor(rnd() * 5); const y = mouthY + 1 + Math.floor(rnd() * 3); if (grid[y] && grid[y][x] === "A") { grid[y][x] = "B"; grid[y][15 - x] = "B"; } } }
  if (has("pixel"))  { for (let y = mouthY + 1; y < 15; y++) for (let x = 3; x < 13; x++) { if (grid[y][x] === "A" && (x + y) % 2 === 0) grid[y][x] = "B"; } }
  if (has("stripes")) { for (let y = mouthY + 1; y < 15; y += 2) for (let x = 3; x < 13; x++) { if (grid[y][x] === "A") grid[y][x] = "B"; } }
  if (has("wisp"))   { for (let x = 2; x < 14; x++) { for (let y = 15; y > 11; y--) { if (grid[y][x] !== "." && (x % 2 === 0)) { grid[y][x] = "."; break; } } } }
  if (has("tail"))   { set(13, 12, "A"); set(14, 11, "A"); set(14, 10, "C"); }
  if (has("shell"))  { for (let y = mouthY; y < 14; y++) for (let x = 4; x < 12; x++) { if (grid[y][x] === "A" && ((x - y) % 3 === 0)) grid[y][x] = "B"; } }
  if (has("screen")) { for (let y = eyeY - 1; y <= mouthY; y++) for (let x = 5; x <= 10; x++) { if (grid[y][x] !== ".") grid[y][x] = "m"; } }
  // eyes + mouth
  const eyeLX = 5, eyeRX = 10;
  if (has("screen")) {
    set(eyeLX + 1, eyeY, "C"); set(eyeRX - 1, eyeY, "C");
  } else {
    set(eyeLX, eyeY, "w"); set(eyeLX + 1, eyeY, "k");
    set(eyeRX, eyeY, "k"); set(eyeRX + 1, eyeY, "w");
    if (has("grin")) { for (let x = 5; x <= 10; x++) set(x, mouthY, "m"); set(4, mouthY - 1, "m"); set(11, mouthY - 1, "m"); }
    else { set(7, mouthY, "m"); set(8, mouthY, "m"); }
  }
  // outline pass
  const out = Array.from({ length: 16 }, () => Array(16).fill("."));
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (grid[y][x] !== ".") { out[y][x] = grid[y][x]; continue; }
    const near = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => {
      const c = grid[y + dy] && grid[y + dy][x + dx];
      return c && c !== "." && c !== "o";
    });
    if (near) out[y][x] = "o";
  }
  // palette from types with per-species jitter
  const t1 = TYPE_GEN_COLORS[sp.types[0]] || TYPE_GEN_COLORS.Normal;
  const t2 = TYPE_GEN_COLORS[sp.types[1] || sp.types[0]] || t1;
  const jit = 0.9 + rnd() * 0.25;
  const A = shade(t1[0], jit);
  return {
    art: out.map((row) => row.join("")),
    pal: {
      o: shade(t1[1], 0.42), A, B: shade(t1[1], jit), C: shade(t2[2] || t2[0], 1),
      w: "#ffffff", k: "#181818", m: shade(t1[1], 0.6),
    },
  };
}

const spriteCache = new Map();
function monsterSprite(speciesId, scale, flipX) {
  const key = `${speciesId}:${scale}:${!!flipX}`;
  if (!spriteCache.has(key)) {
    const sp = SPECIES[speciesId];
    let art = sp.art, pal = sp.pal;
    if (!art) {
      const gen = genMonsterArt(speciesId, sp);
      art = gen.art; pal = gen.pal;
    }
    spriteCache.set(key, renderArt(art, pal, scale, flipX));
  }
  return spriteCache.get(key);
}

// ---- people -----------------------------------------------------
// chars: o outline, H hair, S skin, k eye, J shirt, P pants
const PERSON_ART = {
  down: [
    "....oooooo......",
    "...oHHHHHHo.....",
    "..oHHHHHHHHo....",
    "..oHHHHHHHHo....",
    "..oHSSSSSSHo....",
    "..oSSkSSkSSo....",
    "...oSSSSSSo.....",
    "....oSSSSo......",
    "...oJJJJJJo.....",
    "..oJJJJJJJJo....",
    "..oSJJJJJJSo....",
    "..oSJJJJJJSo....",
    "...oPPPPPPo.....",
    "...oPP..PPo.....",
    "...oo....oo.....",
    "................",
  ],
  up: [
    "....oooooo......",
    "...oHHHHHHo.....",
    "..oHHHHHHHHo....",
    "..oHHHHHHHHo....",
    "..oHHHHHHHHo....",
    "..oHHHHHHHHo....",
    "...oHHHHHHo.....",
    "....oSSSSo......",
    "...oJJJJJJo.....",
    "..oJJJJJJJJo....",
    "..oSJJJJJJSo....",
    "..oSJJJJJJSo....",
    "...oPPPPPPo.....",
    "...oPP..PPo.....",
    "...oo....oo.....",
    "................",
  ],
  left: [
    "....oooooo......",
    "...oHHHHHHo.....",
    "..oHHHHHHHHo....",
    "..oHHHHHHHHo....",
    "..oSSSSHHHHo....",
    "..oSkSSSHHHo....",
    "..oSSSSSHHo.....",
    "....oSSSo.......",
    "...oJJJJJo......",
    "..oJJJJJJJo.....",
    "..oSJJJJJJo.....",
    "..oJJJJJJJo.....",
    "...oPPPPPo......",
    "...oPPoPPo......",
    "...ooo.ooo......",
    "................",
  ],
};

const PEOPLE_PALETTES = {
  player:    { o: "#1a1a2a", H: "#c62828", S: "#f0c8a0", k: "#1a1a1a", J: "#2a4fa8", P: "#3a3a4a" },
  rival:     { o: "#1a1a2a", H: "#6a4a2a", S: "#f0c8a0", k: "#1a1a1a", J: "#7b2fa2", P: "#3a3a4a" },
  prof:      { o: "#1a1a2a", H: "#9a9aa8", S: "#f0c8a0", k: "#1a1a1a", J: "#f0f0f0", P: "#6a5a3a" },
  assistant: { o: "#1a1a2a", H: "#2a2a2a", S: "#f0c8a0", k: "#1a1a1a", J: "#e8e8f0", P: "#4a4a5a" },
  mom:       { o: "#1a1a2a", H: "#8a5a2a", S: "#f0c8a0", k: "#1a1a1a", J: "#e87aa8", P: "#8a4a6a" },
  nurse:     { o: "#1a1a2a", H: "#f0a8c8", S: "#f0c8a0", k: "#1a1a1a", J: "#ffffff", P: "#e87aa8" },
  clerk:     { o: "#1a1a2a", H: "#3a3a3a", S: "#f0c8a0", k: "#1a1a1a", J: "#3a6ac8", P: "#2a2a3a" },
  girl:      { o: "#1a1a2a", H: "#e8c85a", S: "#f0c8a0", k: "#1a1a1a", J: "#2aa89a", P: "#c85a7a" },
  boy:       { o: "#1a1a2a", H: "#2a2a2a", S: "#f0c8a0", k: "#1a1a1a", J: "#4a9a3a", P: "#5a4a3a" },
  oldman:    { o: "#1a1a2a", H: "#c8c8c8", S: "#e8c098", k: "#1a1a1a", J: "#8a6a4a", P: "#4a4a4a" },
  leader:    { o: "#1a1a2a", H: "#2a2a2a", S: "#e0b890", k: "#1a1a1a", J: "#e07a2a", P: "#6a5a4a" },
  fisher:    { o: "#1a1a2a", H: "#c8c8c8", S: "#e0b890", k: "#1a1a1a", J: "#2a6ac8", P: "#3a5a2a" },
  guard:     { o: "#1a1a2a", H: "#3a3a3a", S: "#f0c8a0", k: "#1a1a1a", J: "#b82828", P: "#2a2a3a" },
  elite:     { o: "#1a1a2a", H: "#f0f0f0", S: "#f0c8a0", k: "#1a1a1a", J: "#f8f8f8", P: "#c8c8d8" },
  grunt:     { o: "#0a1a12", H: "#101014", S: "#d8b890", k: "#1a1a1a", J: "#103028", P: "#0a0a0a" },
  boss:      { o: "#0a1a12", H: "#28c8a0", S: "#e0c098", k: "#1a1a1a", J: "#101418", P: "#28322e" },
  wizard:    { o: "#1a1a2a", H: "#e8e8e8", S: "#e8c098", k: "#1a1a1a", J: "#3a2a7a", P: "#28205a" },
};

const personCache = new Map();
function personSprite(kind, dir, scale) {
  const flip = dir === "right";
  const artDir = dir === "right" ? "left" : dir;
  const key = `${kind}:${artDir}:${flip}:${scale}`;
  if (!personCache.has(key)) {
    personCache.set(key, renderArt(PERSON_ART[artDir], PEOPLE_PALETTES[kind] || PEOPLE_PALETTES.boy, scale, flip));
  }
  return personCache.get(key);
}

// ---- tiles ------------------------------------------------------
// Each tile is drawn once onto a 16x16 canvas, then blitted scaled.
function makeTile(draw) {
  const c = document.createElement("canvas");
  c.width = ART;
  c.height = ART;
  const g = c.getContext("2d");
  draw(g);
  return c;
}

function px(g, x, y, w, h, color) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

const TILE_CANVAS = {};

function buildTiles() {
  TILE_CANVAS["."] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#7ec850");
    px(g, 2, 3, 1, 1, "#68b03c"); px(g, 6, 7, 1, 1, "#68b03c");
    px(g, 11, 4, 1, 1, "#68b03c"); px(g, 13, 12, 1, 1, "#68b03c");
    px(g, 4, 13, 1, 1, "#68b03c"); px(g, 9, 10, 1, 1, "#8fd862");
    px(g, 14, 8, 1, 1, "#8fd862"); px(g, 1, 9, 1, 1, "#8fd862");
  });
  TILE_CANVAS[","] = makeTile((g) => {
    g.drawImage(TILE_CANVAS["."], 0, 0);
    px(g, 3, 3, 2, 2, "#f06292"); px(g, 4, 4, 1, 1, "#fff176");
    px(g, 10, 9, 2, 2, "#f06292"); px(g, 11, 10, 1, 1, "#fff176");
    px(g, 12, 3, 2, 2, "#fff176"); px(g, 5, 11, 2, 2, "#fff176");
  });
  TILE_CANVAS["="] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#e0c88a");
    px(g, 3, 4, 2, 1, "#c8ac6a"); px(g, 10, 8, 2, 1, "#c8ac6a");
    px(g, 6, 12, 2, 1, "#c8ac6a"); px(g, 12, 2, 1, 1, "#f0dca8");
    px(g, 2, 10, 1, 1, "#f0dca8"); px(g, 8, 5, 1, 1, "#f0dca8");
  });
  TILE_CANVAS["w"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#5aa834");
    for (let i = 0; i < 4; i++) {
      px(g, i * 4, 2, 2, 5, "#3e8824");
      px(g, i * 4 + 2, 8, 2, 6, "#3e8824");
      px(g, i * 4 + 1, 1, 1, 3, "#78c04e");
      px(g, i * 4 + 3, 7, 1, 3, "#78c04e");
    }
  });
  TILE_CANVAS["T"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#68b03c");
    px(g, 6, 11, 4, 5, "#7a5230");
    px(g, 1, 2, 14, 10, "#2e7d32");
    px(g, 3, 0, 10, 4, "#2e7d32");
    px(g, 2, 3, 4, 3, "#43a047"); px(g, 9, 5, 4, 3, "#43a047");
    px(g, 5, 1, 5, 2, "#43a047"); px(g, 1, 8, 3, 2, "#1b5e20");
    px(g, 11, 9, 3, 2, "#1b5e20");
  });
  TILE_CANVAS["~"] = [
    makeTile((g) => {
      px(g, 0, 0, 16, 16, "#4a90d8");
      px(g, 2, 3, 5, 1, "#7ab8f0"); px(g, 9, 8, 5, 1, "#7ab8f0");
      px(g, 4, 12, 5, 1, "#7ab8f0"); px(g, 11, 1, 3, 1, "#2a6ab8");
    }),
    makeTile((g) => {
      px(g, 0, 0, 16, 16, "#4a90d8");
      px(g, 4, 4, 5, 1, "#7ab8f0"); px(g, 10, 10, 5, 1, "#7ab8f0");
      px(g, 1, 12, 5, 1, "#7ab8f0"); px(g, 8, 1, 3, 1, "#2a6ab8");
    }),
  ];
  TILE_CANVAS["F"] = makeTile((g) => {
    g.drawImage(TILE_CANVAS["."], 0, 0);
    px(g, 1, 4, 14, 3, "#a8783c");
    px(g, 1, 9, 14, 2, "#a8783c");
    px(g, 2, 3, 2, 10, "#8a5c2a"); px(g, 12, 3, 2, 10, "#8a5c2a");
  });
  TILE_CANVAS["S"] = makeTile((g) => {
    g.drawImage(TILE_CANVAS["."], 0, 0);
    px(g, 7, 9, 2, 6, "#7a5230");
    px(g, 2, 2, 12, 8, "#a8783c");
    px(g, 3, 3, 10, 6, "#d8b478");
    px(g, 4, 4, 8, 1, "#8a5c2a"); px(g, 4, 6, 8, 1, "#8a5c2a");
  });
  TILE_CANVAS["R"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#d84a3a");
    px(g, 0, 3, 16, 1, "#a83428"); px(g, 0, 8, 16, 1, "#a83428");
    px(g, 0, 13, 16, 1, "#a83428");
    px(g, 0, 0, 16, 1, "#f07a5a");
  });
  TILE_CANVAS["B"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#e8dcc0");
    px(g, 0, 0, 16, 2, "#c8b890");
    px(g, 4, 2, 1, 14, "#d0c0a0"); px(g, 11, 2, 1, 14, "#d0c0a0");
    px(g, 0, 15, 16, 1, "#b0a080");
  });
  TILE_CANVAS["W"] = makeTile((g) => {
    g.drawImage(TILE_CANVAS["B"], 0, 0);
    px(g, 3, 4, 10, 8, "#2a3a5a");
    px(g, 4, 5, 8, 6, "#4a6a9a");
    px(g, 7, 5, 1, 6, "#2a3a5a"); px(g, 4, 8, 8, 1, "#2a3a5a");
  });
  TILE_CANVAS["D"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#e8dcc0");
    px(g, 2, 1, 12, 15, "#6a4226");
    px(g, 3, 2, 10, 14, "#8a5c34");
    px(g, 10, 8, 2, 2, "#e8c85a");
  });
  TILE_CANVAS["_"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#e0c090");
    px(g, 0, 7, 16, 1, "#c8a870");
    px(g, 0, 15, 16, 1, "#c8a870");
    px(g, 7, 0, 1, 8, "#c8a870"); px(g, 12, 8, 1, 8, "#c8a870");
  });
  TILE_CANVAS["r"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#4a8a6a");
    px(g, 1, 1, 14, 14, "#5aa87a");
    px(g, 3, 3, 10, 10, "#4a8a6a");
    px(g, 5, 5, 6, 6, "#5aa87a");
  });
  TILE_CANVAS["C"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#a8783c");
    px(g, 0, 0, 16, 5, "#d8b478");
    px(g, 0, 5, 16, 1, "#8a5c2a");
    px(g, 3, 8, 2, 6, "#8a5c2a"); px(g, 11, 8, 2, 6, "#8a5c2a");
  });
  TILE_CANVAS["K"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#8a5c34");
    px(g, 1, 1, 14, 6, "#6a4226");
    px(g, 1, 9, 14, 6, "#6a4226");
    const colors = ["#c62828", "#2a4fa8", "#4a9a3a", "#e8c85a", "#7b2fa2"];
    for (let i = 0; i < 5; i++) {
      px(g, 2 + i * 2.5, 2, 2, 5, colors[i]);
      px(g, 2 + i * 2.5, 10, 2, 5, colors[(i + 2) % 5]);
    }
  });
  TILE_CANVAS["M"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#9a9aa8");
    px(g, 1, 1, 14, 14, "#c8c8d8");
    px(g, 3, 3, 10, 5, "#2a3a4a");
    px(g, 4, 4, 3, 2, "#4ae88a");
    px(g, 3, 10, 3, 3, "#c62828"); px(g, 8, 10, 3, 3, "#e8c85a");
  });
  TILE_CANVAS["t"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#e0c090");
    px(g, 1, 1, 14, 14, "#a8783c");
    px(g, 2, 2, 12, 12, "#d8b478");
  });
  TILE_CANVAS["X"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#101018");
  });
  TILE_CANVAS["b"] = makeTile((g) => {
    g.drawImage(TILE_CANVAS["."], 0, 0);
    px(g, 2, 4, 12, 10, "#2e7d32");
    px(g, 4, 2, 8, 4, "#2e7d32");
    px(g, 3, 5, 4, 3, "#43a047");
    px(g, 9, 8, 4, 3, "#43a047");
    px(g, 5, 7, 3, 3, "#c62828");
    px(g, 10, 4, 3, 3, "#c62828");
    px(g, 6, 11, 3, 3, "#c62828");
  });
  TILE_CANVAS["G"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#2a2430");
    px(g, 1, 3, 14, 12, "#6a6278");
    px(g, 3, 1, 10, 4, "#6a6278");
    px(g, 3, 4, 5, 4, "#8a8298");
    px(g, 9, 7, 4, 3, "#8a8298");
    px(g, 2, 10, 4, 3, "#4a4458");
    px(g, 10, 11, 4, 3, "#4a4458");
  });
  TILE_CANVAS["c"] = makeTile((g) => {
    px(g, 0, 0, 16, 16, "#4a4054");
    px(g, 2, 3, 2, 1, "#5a5068"); px(g, 9, 6, 2, 1, "#5a5068");
    px(g, 5, 11, 2, 1, "#5a5068"); px(g, 12, 13, 2, 1, "#3a3444");
    px(g, 3, 8, 1, 1, "#3a3444"); px(g, 13, 2, 1, 1, "#3a3444");
  });
}

const SOLID_TILES = new Set(["T", "~", "F", "S", "R", "B", "W", "C", "K", "M", "t", "X", "b", "G"]);
const GRASS_TILE = "w";

function tileAt(map, x, y) {
  if (y < 0 || y >= map.tiles.length) return "X";
  const row = map.tiles[y];
  if (x < 0 || x >= row.length) return "X";
  return row[x];
}

function isSolid(map, x, y) {
  return SOLID_TILES.has(tileAt(map, x, y));
}
