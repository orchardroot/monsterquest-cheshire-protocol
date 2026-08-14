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

const spriteCache = new Map();
function monsterSprite(speciesId, scale, flipX) {
  const key = `${speciesId}:${scale}:${!!flipX}`;
  if (!spriteCache.has(key)) {
    const sp = SPECIES[speciesId];
    spriteCache.set(key, renderArt(sp.art, sp.pal, scale, flipX));
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
  elite:     { o: "#1a1a2a", H: "#6a2aa8", S: "#f0c8a0", k: "#1a1a1a", J: "#38205a", P: "#1a1a2a" },
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
