// =============================================================
// MonsterQuest — maps, warps, NPCs, trainers, wild encounters
// =============================================================
// Tile legend:
//   .  grass          ,  flowers        =  path        w  tall grass
//   T  tree (solid)   ~  water (solid)  F  fence       S  sign
//   R  roof (solid)   B  wall (solid)   W  window      D  door (warp)
//   _  floor          r  exit rug (warp)
//   C  counter        K  bookshelf      M  machine     t  table
//   X  void (solid)
"use strict";

const MAPS = {
  // ---------------------------------------------------- town
  town: {
    name: "MAPLEWOOD TOWN",
    outdoor: true,
    fishing: { table: [["puddlish", 5, 8, 100]] },
    tiles: [
      "TTTTTTTTT=TTTTTTTTTT",
      "T........=.........T",
      "T.RRRR...=...RRRRR.T",
      "T.RRRR...=...RRRRR.T",
      "T.BWDB...=...BWDWB.T",
      "T...=....=.....=S..T",
      "T...============...T",
      "T.,,.....=......,,.T",
      "T........=..S......T",
      "T........=.........T",
      "T,,......=.....~~~.T",
      "T,,......=.....~~~.T",
      "T........=.........T",
      "T..................T",
      "TFFFFFFFFFFFFFFFFFFT",
      "TTTTTTTTTTTTTTTTTTTT",
    ],
    warps: {
      "4,4":  { map: "home", x: 4, y: 6, dir: "up" },
      "15,4": { map: "lab",  x: 5, y: 8, dir: "up" },
      "9,0":  { map: "route1", x: 9, y: 28, dir: "up" },
    },
    signs: {
      "12,8": ["MAPLEWOOD TOWN", "Where every journey begins!"],
      "16,5": ["MAPLE LAB", "Monster Research Facility"],
    },
    npcs: [
      {
        id: "assistant", x: 9, y: 1, dir: "down", sprite: "assistant",
        hideIfFlag: "starter",
        type: "dialog",
        pages: ["Whoa there! It's dangerous to go out without a monster of your own.",
                "Prof. MAPLE is waiting for you in the LAB!"],
      },
      {
        id: "villager1", x: 6, y: 9, dir: "down", sprite: "girl",
        type: "dialog",
        pages: ["Technology is amazing! You can store monsters as data in a CAPSULE."],
      },
      {
        id: "villager2", x: 13, y: 12, dir: "left", sprite: "boy",
        type: "dialog",
        pages: ["ROUTE 1 is up north. Wild monsters hide in the tall grass!",
                "Walk through it and they'll jump out at you."],
      },
    ],
  },

  // ---------------------------------------------------- player's home
  home: {
    name: "YOUR HOUSE",
    outdoor: false,
    tiles: [
      "XXXXXXXXXX",
      "XBWBBBBWBX",
      "X________X",
      "X_tt_____X",
      "X_tt_____X",
      "X________X",
      "X________X",
      "XXXXrXXXXX",
    ],
    warps: {
      "4,7": { map: "town", x: 4, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "mom", x: 6, y: 3, dir: "down", sprite: "mom",
        type: "heal",
        pages: ["MOM: Off on an adventure, sweetie?", "Rest up before you go!"],
        afterPages: ["MOM: Your monsters look happy and healthy!", "Be careful out there!"],
      },
    ],
  },

  // ---------------------------------------------------- lab
  lab: {
    name: "MAPLE LAB",
    outdoor: false,
    tiles: [
      "XXXXXXXXXXXX",
      "XBKKBBBBKKBX",
      "X__________X",
      "X_MM____MM_X",
      "X__________X",
      "X____tt____X",
      "X__________X",
      "X__________X",
      "X__________X",
      "XXXXXrXXXXXX",
    ],
    warps: {
      "5,9": { map: "town", x: 15, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "professor", x: 6, y: 4, dir: "down", sprite: "prof",
        type: "starter",
      },
      {
        id: "rival", x: 3, y: 6, dir: "right", sprite: "rival",
        type: "rival",
      },
    ],
  },

  // ---------------------------------------------------- route 1
  route1: {
    name: "ROUTE 1",
    outdoor: true,
    tiles: [
      "TTTTTTTTTT=TTTTTTTTT",
      "T.........=........T",
      "T.www.....=..www...T",
      "T.www.....=..www...T",
      "T.www.....=..www...T",
      "T.........=........T",
      "T....======........T",
      "T....=.............T",
      "T....=..wwww.......T",
      "T....=..wwww.......T",
      "T....=.............T",
      "T....=====.........T",
      "T........=.........T",
      "T.S......=..ww.....T",
      "T.www....=..ww.....T",
      "T.www....=..ww.....T",
      "T........=.........T",
      "T........=.........T",
      "T........=.wwww....T",
      "T..ww....=.wwww....T",
      "T..ww....=.........T",
      "T..ww....=.........T",
      "T........=.........T",
      "T..,,....=....,,...T",
      "T........=.........T",
      "T...wwww.=.www.....T",
      "T...wwww.=.www.....T",
      "T........=.........T",
      "T........=.........T",
      "T........=.........T",
      "TTTTTTTTT=TTTTTTTTTT",
    ],
    warps: {
      "10,0": { map: "city", x: 10, y: 14, dir: "up" },
      "9,29": { map: "town", x: 9, y: 1, dir: "down" },
      "9,30": { map: "town", x: 9, y: 1, dir: "down" },
    },
    signs: {
      "2,13": ["ROUTE 1", "MAPLEWOOD TOWN - OAKRIDGE CITY"],
    },
    encounters: {
      rate: 0.12,
      table: [
        ["nibbit", 2, 4, 30],
        ["flitchick", 2, 4, 30],
        ["buzzler", 3, 5, 15],
        ["sparkit", 3, 5, 15],
        ["psyfawn", 4, 5, 5],
        ["mistwisp", 4, 5, 5],
      ],
    },
    npcs: [
      {
        id: "trainer_mia", x: 12, y: 10, dir: "left", sprite: "girl",
        type: "trainer", trainerId: "mia",
      },
      {
        id: "trainer_ben", x: 10, y: 21, dir: "left", sprite: "boy",
        type: "trainer", trainerId: "ben",
      },
      {
        id: "hiker", x: 6, y: 17, dir: "down", sprite: "oldman",
        type: "dialog",
        pages: ["Wild monsters get tougher the further north you go.",
                "Stock up on POTIONS at the OAKRIDGE MART!"],
      },
    ],
  },

  // ---------------------------------------------------- city
  city: {
    name: "OAKRIDGE CITY",
    outdoor: true,
    tiles: [
      "TTTTTT=TTTTTTTTTTTTT",
      "T.....=............T",
      "T.RRRR=.RRRR..RRRR.T",
      "T.RRRR=.RRRR..RRRR.T",
      "T.BDWB=.BWDB..BWDB.T",
      "T..=..=...=......=.T",
      "T..===============.T",
      "T.S.......=........T",
      "T,,.......=......,,T",
      "T.........==========",
      "T,,.......=........T",
      "T.........=........T",
      "T~~~......=......~~T",
      "T~~~......=......~~T",
      "T.........=........T",
      "TTTTTTTTTT=TTTTTTTTT",
    ],
    warps: {
      "3,4":   { map: "care", x: 4, y: 6, dir: "up" },
      "10,4":  { map: "mart", x: 4, y: 6, dir: "up" },
      "16,4":  { map: "gym",  x: 5, y: 10, dir: "up" },
      "10,15": { map: "route1", x: 10, y: 1, dir: "down" },
      "6,0":   { map: "route3", x: 7, y: 22, dir: "up" },
      "19,9":  { map: "route2", x: 1, y: 7, dir: "right" },
    },
    fishing: {
      table: [["puddlish", 8, 12, 70], ["crabbex", 10, 14, 30]],
    },
    signs: {
      "2,7": ["OAKRIDGE CITY", "The stone-solid city."],
    },
    npcs: [
      {
        id: "cityguy", x: 14, y: 10, dir: "down", sprite: "boy",
        type: "dialog",
        pages: ["Leader SLATE runs the OAKRIDGE GYM.", "His ROCK-type monsters are super tough!",
                "GRASS and WATER moves will crack them right open.",
                "East of here is ROUTE 2 to SEABREEZE PORT. North leads to ECHO CAVE."],
      },
      {
        id: "citygirl", x: 5, y: 11, dir: "down", sprite: "girl",
        type: "dialog",
        pages: ["The CARE CENTER heals your monsters for free!", "It's the building on the left."],
      },
    ],
  },

  // ---------------------------------------------------- care center
  care: {
    name: "CARE CENTER",
    outdoor: false,
    tiles: [
      "XXXXXXXXXX",
      "XBWBBBBWBX",
      "X________X",
      "X_CCCCCC_X",
      "X________X",
      "X________X",
      "X________X",
      "XXXXrXXXXX",
    ],
    warps: {
      "4,7": { map: "city", x: 3, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "nurse", x: 4, y: 2, dir: "down", sprite: "nurse",
        type: "heal",
        pages: ["Welcome to the CARE CENTER!", "Let me restore your monsters to full health."],
        afterPages: ["There you go! Your monsters are fighting fit.", "Please come again!"],
      },
    ],
  },

  // ---------------------------------------------------- mart
  mart: {
    name: "OAKRIDGE MART",
    outdoor: false,
    tiles: [
      "XXXXXXXXXX",
      "XBWBBBBWBX",
      "X________X",
      "X_CCCCC__X",
      "X________X",
      "X_MM__MM_X",
      "X________X",
      "XXXXrXXXXX",
    ],
    warps: {
      "4,7": { map: "city", x: 10, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "clerk", x: 3, y: 2, dir: "down", sprite: "clerk",
        type: "shop",
        stock: ["potion", "superpotion", "antidote", "awakening", "capsule", "greatcapsule"],
      },
    ],
  },

  // ---------------------------------------------------- gym
  gym: {
    name: "OAKRIDGE GYM",
    outdoor: false,
    tiles: [
      "XXXXXXXXXXXX",
      "XBBBBBBBBBBX",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "XXXXXrXXXXXX",
    ],
    warps: {
      "5,11": { map: "city", x: 17, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "gym_rex", x: 5, y: 6, dir: "down", sprite: "boy",
        type: "trainer", trainerId: "rex",
      },
      {
        id: "leader", x: 5, y: 2, dir: "down", sprite: "leader",
        type: "trainer", trainerId: "slate",
      },
    ],
  },
};

// ---- Trainers ---------------------------------------------------
const TRAINERS = {
  mia: {
    name: "LASS MIA",
    party: [["flitchick", 5], ["sparkit", 5]],
    payout: 300,
    intro: ["Hi! Are you a new trainer?", "Let's see what you've got!"],
    winMsg: ["Aww, my cuties lost!"],
    after: ["Your monsters are well trained.", "Keep it up!"],
  },
  ben: {
    name: "BUG FAN BEN",
    party: [["buzzler", 5], ["buzzler", 6]],
    payout: 350,
    intro: ["Bugs are the BEST!", "My BUZZLER will sting you good!"],
    winMsg: ["Stung by defeat..."],
    after: ["Someday I'll find a golden BUZZLER.", "It's out there. I know it."],
  },
  rex: {
    name: "ROCKBOY REX",
    party: [["boulderhorn", 8]],
    payout: 500,
    intro: ["You want to challenge Leader SLATE?", "You'll have to get through me first!"],
    winMsg: ["Crushed like gravel..."],
    after: ["SLATE's monsters hit way harder than mine.", "Good luck!"],
  },
  slate: {
    name: "LEADER SLATE",
    isLeader: true,
    badge: { flag: "badge", name: "QUARRY BADGE" },
    party: [["boulderhorn", 10], ["boulderhorn", 12]],
    payout: 1500,
    intro: ["So you're the kid from MAPLEWOOD.", "I'm SLATE! My rock-hard monsters have flattened every challenger.",
            "Show me what you're made of!"],
    winMsg: ["Impossible! My rocks... crumbled!"],
    after: ["You have real talent, kid.", "Take the QUARRY BADGE with pride!"],
  },
};

// Rival party depends on the player's starter (type advantage vs you)
const RIVAL_COUNTER = { sproutle: "cindercub", cindercub: "aquafin", aquafin: "sproutle" };

// =============================================================
// EXPANSION — new routes, cities, cave, plateau & activities
// =============================================================
// Extra tiles: b berry bush (solid)  G rock (solid)  c cave floor

const INTERIOR_HOUSE = [
  "XXXXXXXXXX",
  "XBWBBBBWBX",
  "X________X",
  "X________X",
  "X________X",
  "X________X",
  "X________X",
  "XXXXrXXXXX",
];

function makeCare(city, ex, ey) {
  return {
    name: "CARE CENTER", outdoor: false,
    tiles: [
      "XXXXXXXXXX",
      "XBWBBBBWBX",
      "X________X",
      "X_CCCCCC_X",
      "X________X",
      "X________X",
      "X________X",
      "XXXXrXXXXX",
    ],
    warps: { "4,7": { map: city, x: ex, y: ey, dir: "down" } },
    signs: {},
    npcs: [{
      id: city + "_nurse", x: 4, y: 2, dir: "down", sprite: "nurse",
      type: "heal",
      pages: ["Welcome to the CARE CENTER!", "Let me restore your monsters to full health."],
      afterPages: ["There you go! Your monsters are fighting fit.", "Please come again!"],
    }],
  };
}

function makeMart(city, ex, ey, stock) {
  return {
    name: "MART", outdoor: false,
    tiles: [
      "XXXXXXXXXX",
      "XBWBBBBWBX",
      "X________X",
      "X_CCCCC__X",
      "X________X",
      "X_MM__MM_X",
      "X________X",
      "XXXXrXXXXX",
    ],
    warps: { "4,7": { map: city, x: ex, y: ey, dir: "down" } },
    signs: {},
    npcs: [{ id: city + "_clerk", x: 3, y: 2, dir: "down", sprite: "clerk", type: "shop", stock }],
  };
}

function makeGym(city, ex, ey, leaderId, trainerId) {
  const npcs = [];
  if (trainerId) {
    npcs.push({ id: city + "_gymtrainer", x: 5, y: 6, dir: "down", sprite: "boy", type: "trainer", trainerId });
  }
  npcs.push({ id: city + "_leader", x: 5, y: 2, dir: "down", sprite: "leader", type: "trainer", trainerId: leaderId });
  return {
    name: "GYM", outdoor: false,
    tiles: [
      "XXXXXXXXXXXX",
      "XBBBBBBBBBBX",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "XXXXXrXXXXXX",
    ],
    warps: { "5,11": { map: city, x: ex, y: ey, dir: "down" } },
    signs: {},
    npcs,
  };
}

Object.assign(MAPS, {
  // ---------------------------------------------------- route 2 (east, to Seabreeze)
  route2: {
    name: "ROUTE 2",
    outdoor: true,
    tiles: [
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
      "T............,,.................ww.T",
      "T..www..........wwww............ww.T",
      "T..www...b......wwww.......www.....T",
      "T..www..........wwww.......www.....T",
      "T..........................www.....T",
      "T..................................T",
      "====================================",
      "T..................................T",
      "T.....wwww.............wwww........T",
      "T.....wwww....,,...b...wwww........T",
      "T.....wwww.............wwww......S.T",
      "T..................................T",
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    ],
    warps: {
      "0,7":  { map: "city", x: 18, y: 9, dir: "left" },
      "35,7": { map: "seabreeze", x: 1, y: 8, dir: "right" },
    },
    signs: {
      "33,11": ["ROUTE 2", "OAKRIDGE CITY - SEABREEZE PORT"],
    },
    encounters: {
      rate: 0.12,
      table: [
        ["puddlish", 8, 11, 25],
        ["oakling", 8, 11, 25],
        ["flitchick", 9, 12, 20],
        ["buzzler", 9, 12, 15],
        ["sparkit", 10, 12, 15],
      ],
    },
    npcs: [
      { id: "rival2", x: 6, y: 7, dir: "left", sprite: "rival", type: "rival2", hideIfFlag: "rival2Beaten" },
      { id: "trainer_finn", x: 14, y: 8, dir: "up", sprite: "boy", type: "trainer", trainerId: "finn" },
      { id: "trainer_june", x: 24, y: 6, dir: "down", sprite: "girl", type: "trainer", trainerId: "june" },
    ],
  },

  // ---------------------------------------------------- Seabreeze Port
  seabreeze: {
    name: "SEABREEZE PORT",
    outdoor: true,
    tiles: [
      "TTTTTTTTTTTTTTTTTTTT~~~~",
      "T.RRRR..RRRR..RRRR..~~~~",
      "T.RRRR..RRRR..RRRR..~~~~",
      "T.BDWB..BWDB..BWDB..~~~~",
      "T..=......=......=..~~~~",
      "T..===============..~~~~",
      "T.........,,.......~~~~~",
      "T.S................~~~~~",
      "==================.~~~~~",
      "T.................~~~~~~",
      "T....,,...========~~~~~~",
      "T.................~~~~~~",
      "T,,...............~~~~~~",
      "T.....============~~~~~~",
      "T.................~~~~~~",
      "TTTTTTTTTTTTTTTTTT~~~~~~",
    ],
    warps: {
      "0,8":  { map: "route2", x: 34, y: 7, dir: "left" },
      "3,3":  { map: "care2", x: 4, y: 6, dir: "up" },
      "10,3": { map: "mart2", x: 4, y: 6, dir: "up" },
      "16,3": { map: "gym2",  x: 5, y: 10, dir: "up" },
    },
    signs: {
      "2,7": ["SEABREEZE PORT", "Where the land meets the waves."],
    },
    fishing: {
      table: [["puddlish", 10, 15, 55], ["crabbex", 12, 16, 35], ["torrentide", 20, 22, 10]],
    },
    npcs: [
      {
        id: "fisherman", x: 16, y: 10, dir: "right", sprite: "fisher",
        type: "fisher",
      },
      {
        id: "trader", x: 16, y: 13, dir: "right", sprite: "oldman",
        type: "trade", gives: "chompkin", wants: "buzzler",
      },
      {
        id: "portgirl", x: 6, y: 12, dir: "down", sprite: "girl",
        type: "dialog",
        pages: ["Leader MARINA's WATER monsters flow like the tide.",
                "GRASS and ELECTRIC moves will shock her out of rhythm!"],
      },
    ],
  },
  care2: null, mart2: null, gym2: null,

  // ---------------------------------------------------- route 3 (north, to Echo Cave)
  route3: {
    name: "ROUTE 3",
    outdoor: true,
    tiles: [
      "TTTTTTTTTTTTTT",
      "T....GGGGG...T",
      "T....GGDGG...T",
      "T......=.....T",
      "T..www.=.b...T",
      "T..www.=.....T",
      "T......=.....T",
      "T.RRRR.=.....T",
      "T.RRRR.=.www.T",
      "T.BDWB.=.www.T",
      "T..=...=.www.T",
      "T..=====.....T",
      "T......=.....T",
      "T.S....=.....T",
      "T......=..b..T",
      "T.www..=.....T",
      "T.www..=.....T",
      "T.www..=.....T",
      "T......=.....T",
      "T..,,..=.....T",
      "T......=.....T",
      "T......=.....T",
      "T......=.....T",
      "TTTTTTT=TTTTTT",
    ],
    warps: {
      "7,23": { map: "city", x: 6, y: 1, dir: "down" },
      "7,2":  { map: "echocave", x: 4, y: 16, dir: "up" },
      "3,9":  { map: "daycare", x: 4, y: 6, dir: "up" },
    },
    signs: {
      "2,13": ["ROUTE 3", "ECHO CAVE ahead. Bring light and courage!"],
    },
    encounters: {
      rate: 0.12,
      table: [
        ["nibbit", 10, 13, 30],
        ["boulderhorn", 10, 14, 30],
        ["squeakwing", 11, 14, 30],
        ["oakling", 11, 13, 10],
      ],
    },
    npcs: [
      { id: "trainer_cliff", x: 10, y: 15, dir: "left", sprite: "oldman", type: "trainer", trainerId: "cliff" },
      {
        id: "daycaresign", x: 6, y: 10, dir: "down", sprite: "girl",
        type: "dialog",
        pages: ["That house is the DAY CARE.", "They'll raise a monster for you while you walk around!"],
      },
    ],
  },
  daycare: null,

  // ---------------------------------------------------- Echo Cave
  echocave: {
    name: "ECHO CAVE",
    outdoor: false,
    encounterEverywhere: true,
    tiles: [
      "XXXXXXXXXXXXXXXXXXXcXXXX",
      "XccccccGGccccccccccccccX",
      "XcGGccccccccGGGccGGccccX",
      "XccccGGccccccccccccGGccX",
      "XccGcccccGGccGGccccccccX",
      "XccccccccccccccccGGccccX",
      "XcGGccGGGccGGccccccccGcX",
      "XccccccccccccccGGccccccX",
      "XccGGcccGGcccccccccGGccX",
      "XccccccccccccGGccccccccX",
      "XcGGccGGGGcccccccccccccX",
      "XccccccccccccGGGGcGGGGGX",
      "XcGGccccccccGccccccccccX",
      "XccccGGcccccGccccccccccX",
      "XccGcccccGccGccccccccccX",
      "XcccccccccccGccccccccccX",
      "XcGGccGGccccGccccccccccX",
      "XXXXcXXXXXXXXXXXXXXXXXXX",
    ],
    warps: {
      "4,17": { map: "route3", x: 7, y: 3, dir: "down" },
      "19,0": { map: "emberfall", x: 9, y: 14, dir: "up" },
    },
    signs: {},
    encounters: {
      rate: 0.1,
      table: [
        ["squeakwing", 14, 17, 40],
        ["boulderhorn", 14, 18, 30],
        ["mistwisp", 15, 18, 20],
        ["lavaslug", 16, 18, 10],
      ],
    },
    npcs: [
      { id: "trainer_gus", x: 10, y: 8, dir: "down", sprite: "boy", type: "trainer", trainerId: "gus" },
      {
        id: "terrataur", x: 17, y: 13, dir: "down", monster: "terrataur",
        type: "legendary", level: 30, flag: "terrataurGone",
        pages: ["A massive boulder... no, it's ALIVE!", "TERRATAUR, the ancient guardian of ECHO CAVE, blocks the path!"],
      },
      {
        id: "caveguy", x: 3, y: 3, dir: "down", sprite: "oldman",
        type: "dialog",
        pages: ["Wild monsters lurk everywhere in this cave, not just in grass!",
                "They say an ancient guardian sleeps in the southeast corner..."],
      },
    ],
  },

  // ---------------------------------------------------- Emberfall Village
  emberfall: {
    name: "EMBERFALL VILLAGE",
    outdoor: true,
    hotSpring: true,
    tiles: [
      "TTTTTTTTTTTTTTTTTTTT",
      "T..................T",
      "T.RRRR..RRRR..RRRR.T",
      "T.RRRR..RRRR..RRRR.T",
      "T.BDWB..BWDB..BWDB.T",
      "T..=......=......=.T",
      "=..===============.T",
      "T.........=........T",
      "T.~~......=....,,..T",
      "T.~~......=........T",
      "T.........=..S.....T",
      "T,,.......=........T",
      "T.........=........T",
      "T.........=........T",
      "T.........=........T",
      "TTTTTTTTT=TTTTTTTTTT",
    ],
    warps: {
      "0,6":  { map: "route4", x: 30, y: 6, dir: "left" },
      "9,15": { map: "echocave", x: 19, y: 1, dir: "down" },
      "3,4":  { map: "care3", x: 4, y: 6, dir: "up" },
      "10,4": { map: "mart3", x: 4, y: 6, dir: "up" },
      "16,4": { map: "gym3",  x: 5, y: 10, dir: "up" },
    },
    signs: {
      "13,10": ["EMBERFALL VILLAGE", "Warmed by the mountain's heart.",
                "The HOT SPRING soothes tired monsters — take a dip!"],
    },
    npcs: [
      {
        id: "springlady", x: 4, y: 9, dir: "left", sprite: "mom",
        type: "dialog",
        pages: ["This HOT SPRING is a gift from the volcano.",
                "Press Z facing the water and your whole team will feel brand new!"],
      },
      {
        id: "embergu", x: 14, y: 12, dir: "down", sprite: "boy",
        type: "dialog",
        pages: ["Leader BLAZE's FIRE monsters burn white-hot.",
                "WATER, ROCK or GROUND moves will cool them off!"],
      },
    ],
  },
  care3: null, mart3: null, gym3: null,

  // ---------------------------------------------------- route 4 (west of Emberfall)
  route4: {
    name: "ROUTE 4",
    outdoor: true,
    tiles: [
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
      "T....www.......,,..............T",
      "T....www...........wwww......b.T",
      "T....www...........wwww........T",
      "T..................wwww........T",
      "T..............................T",
      "================================",
      "T..............................T",
      "T...wwww............b..........T",
      "T...wwww.....S.........wwww....T",
      "T...wwww...............wwww....T",
      "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",
    ],
    warps: {
      "31,6": { map: "emberfall", x: 1, y: 6, dir: "right" },
      "0,6":  { map: "willowmere", x: 22, y: 6, dir: "left" },
    },
    signs: {
      "13,9": ["ROUTE 4", "WILLOWMERE CITY - EMBERFALL VILLAGE"],
    },
    encounters: {
      rate: 0.12,
      table: [
        ["flarepup", 15, 18, 30],
        ["oakling", 15, 18, 30],
        ["squeakwing", 16, 19, 20],
        ["petalfae", 16, 18, 10],
        ["sparkit", 16, 18, 10],
      ],
    },
    npcs: [
      { id: "trainer_todd", x: 10, y: 7, dir: "up", sprite: "boy", type: "trainer", trainerId: "todd" },
      { id: "trainer_ivy", x: 22, y: 7, dir: "up", sprite: "girl", type: "trainer", trainerId: "ivy" },
    ],
  },

  // ---------------------------------------------------- Willowmere City
  willowmere: {
    name: "WILLOWMERE CITY",
    outdoor: true,
    tiles: [
      "TTTTTT=TTTTTTTTTTTTTTTTT",
      "T.....=................T",
      "T.RRRR=.RRRR..RRRR.....T",
      "T.RRRR=.RRRR..RRRR.....T",
      "T.BDWB=.BWDB..BWDB.....T",
      "T..=..=...=......=.....T",
      "T..=====================",
      "T......................T",
      "T..S..........RRRRRR...T",
      "T,,...........RRRRRR...T",
      "T.............BBDWBB...T",
      "T.........,,....=......T",
      "T...~~~~~~.............T",
      "T..~~~~~~~~....,,......T",
      "T..~~~~~~~~............T",
      "T...~~~~~~.............T",
      "T......................T",
      "TTTTTTTTTTTTTTTTTTTTTTTT",
    ],
    warps: {
      "6,0":  { map: "route5", x: 6, y: 18, dir: "up" },
      "23,6": { map: "route4", x: 1, y: 6, dir: "right" },
      "3,4":  { map: "care4", x: 4, y: 6, dir: "up" },
      "10,4": { map: "mart4", x: 4, y: 6, dir: "up" },
      "16,4": { map: "gym4",  x: 5, y: 10, dir: "up" },
      "16,10": { map: "arcade", x: 6, y: 8, dir: "up" },
    },
    signs: {
      "3,8": ["WILLOWMERE CITY", "The city on the silver lake.",
              "ARCADE: slots, prizes and fun!"],
    },
    fishing: {
      table: [["puddlish", 14, 18, 50], ["torrentide", 20, 24, 30], ["crabbex", 16, 20, 20]],
    },
    npcs: [
      {
        id: "quizmaster", x: 14, y: 13, dir: "left", sprite: "prof",
        type: "quiz",
      },
      {
        id: "lakegirl", x: 12, y: 16, dir: "up", sprite: "girl",
        type: "dialog",
        pages: ["Leader FAE reads minds... or so they say.",
                "Her PSYCHIC monsters crumble against BUG and GHOST moves!"],
      },
    ],
  },
  care4: null, mart4: null, gym4: null,

  // ---------------------------------------------------- arcade
  arcade: {
    name: "WILLOWMERE ARCADE",
    outdoor: false,
    tiles: [
      "XXXXXXXXXXXXXX",
      "XBWBBBBBBBBWBX",
      "X____________X",
      "X_CCCC__CCCC_X",
      "X____________X",
      "X_MM_MM_MM_MMX",
      "X____________X",
      "X_MM_MM_MM_MMX",
      "X____________X",
      "XXXXXXrXXXXXXX",
    ],
    warps: {
      "6,9": { map: "willowmere", x: 16, y: 11, dir: "down" },
    },
    signs: {},
    slotsOnMachines: true,
    npcs: [
      { id: "coinclerk", x: 3, y: 2, dir: "down", sprite: "clerk", type: "coins" },
      {
        id: "prizeclerk", x: 10, y: 2, dir: "down", sprite: "girl", type: "prizes",
        prizes: [
          { item: "greatcapsule", cost: 25 },
          { item: "hyperpotion", cost: 60 },
          { monster: "pixelit", level: 15, cost: 700 },
        ],
      },
      {
        id: "gambler", x: 4, y: 6, dir: "right", sprite: "oldman",
        type: "dialog",
        pages: ["I've been at this slot machine for 30 years.", "Today feels lucky. Today feels REAL lucky."],
      },
    ],
  },

  // ---------------------------------------------------- route 5 (to Crown Plateau)
  route5: {
    name: "ROUTE 5",
    outdoor: true,
    tiles: [
      "TTTTTT=TTTTTTT",
      "T.....=......T",
      "T.www.=.www..T",
      "T.www.=.www..T",
      "T.....=......T",
      "T.....=...b..T",
      "T.....=......T",
      "T.www.=......T",
      "T.www.=.www..T",
      "T.....=.www..T",
      "T..S..=......T",
      "T.....=......T",
      "T.....=......T",
      "T.www.=.,,...T",
      "T.www.=......T",
      "T.....=......T",
      "T.....=.www..T",
      "T.....=.www..T",
      "T.....=......T",
      "TTTTTT=TTTTTTT",
    ],
    warps: {
      "6,0":  { map: "crownplateau", x: 7, y: 12, dir: "up" },
      "6,19": { map: "willowmere", x: 6, y: 1, dir: "down" },
    },
    signs: {
      "3,10": ["ROUTE 5", "CROWN PLATEAU: home of the CHAMPION.", "Only the strongest climb this far!"],
    },
    encounters: {
      rate: 0.13,
      table: [
        ["galewing", 20, 24, 25],
        ["gnawlord", 20, 24, 20],
        ["psyfawn", 20, 23, 20],
        ["petalfae", 20, 23, 15],
        ["mistwisp", 21, 24, 15],
        ["boulderhorn", 21, 24, 5],
      ],
    },
    npcs: [
      { id: "trainer_luna", x: 8, y: 6, dir: "left", sprite: "girl", type: "trainer", trainerId: "luna" },
      { id: "trainer_boris", x: 4, y: 13, dir: "right", sprite: "boy", type: "trainer", trainerId: "boris" },
    ],
  },

  // ---------------------------------------------------- Crown Plateau
  crownplateau: {
    name: "CROWN PLATEAU",
    outdoor: true,
    tiles: [
      "TTTTTTTTTTTTTTTT",
      "T..............T",
      "T....RRRRRR....T",
      "T....RRRRRR....T",
      "T....BBDWBB....T",
      "T......=...,,..T",
      "T..,,..=.......T",
      "T......=....S..T",
      "T......=.......T",
      "T......=.......T",
      "T......=.......T",
      "T......=.......T",
      "T......=.......T",
      "TTTTTTT=TTTTTTTT",
    ],
    warps: {
      "7,4":  { map: "leaguehall", x: 6, y: 14, dir: "up" },
      "7,13": { map: "route5", x: 6, y: 1, dir: "down" },
    },
    signs: {
      "12,7": ["CROWN PLATEAU", "MONSTER LEAGUE HQ.", "The shrine of the storm bird lies east."],
    },
    npcs: [
      {
        id: "zephyrion", x: 12, y: 10, dir: "down", monster: "zephyrion",
        type: "legendary", level: 35, flag: "zephyrionGone",
        pages: ["The air crackles with static...", "ZEPHYRION, the storm bird of legend, descends from the clouds!"],
      },
    ],
  },

  // ---------------------------------------------------- League Hall
  leaguehall: {
    name: "MONSTER LEAGUE",
    outdoor: false,
    tiles: [
      "XXXXXXXXXXXX",
      "XBBBBBBBBBBX",
      "X__________X",
      "X_M______M_X",
      "X__________X",
      "XMMMMM_MMMMX",
      "X__________X",
      "X__________X",
      "XMMMMM_MMMMX",
      "X__________X",
      "X__________X",
      "XMMMMM_MMMMX",
      "X__________X",
      "X__________X",
      "X__________X",
      "XXXXXXrXXXXX",
    ],
    warps: {
      "6,15": { map: "crownplateau", x: 7, y: 5, dir: "down" },
    },
    signs: {},
    npcs: [
      {
        id: "leagueguard", x: 6, y: 12, dir: "down", sprite: "guard",
        type: "guard", needBadges: 4,
      },
      {
        id: "leaguenurse", x: 2, y: 13, dir: "right", sprite: "nurse",
        type: "heal",
        pages: ["Challengers get free care here.", "Let me heal your team before the gauntlet!"],
        afterPages: ["All patched up.", "The ELITE trainers ahead show no mercy. Good luck!"],
      },
      {
        id: "elite_noa", x: 6, y: 10, dir: "down", sprite: "elite",
        type: "trainer", trainerId: "noa", afterX: 2, afterY: 10,
      },
      {
        id: "elite_orion", x: 6, y: 7, dir: "down", sprite: "elite",
        type: "trainer", trainerId: "orion", afterX: 9, afterY: 7,
      },
      {
        id: "champion", x: 5, y: 2, dir: "down", sprite: "rival",
        type: "champion",
      },
    ],
  },
});

MAPS.care2 = makeCare("seabreeze", 3, 4);
MAPS.mart2 = makeMart("seabreeze", 10, 4, ["potion", "superpotion", "antidote", "awakening", "capsule", "greatcapsule"]);
MAPS.gym2 = makeGym("seabreeze", 16, 4, "marina", "lily");
MAPS.care3 = makeCare("emberfall", 3, 5);
MAPS.mart3 = makeMart("emberfall", 10, 5, ["potion", "superpotion", "antidote", "awakening", "greatcapsule"]);
MAPS.gym3 = makeGym("emberfall", 16, 5, "blaze", "kai");
MAPS.care4 = makeCare("willowmere", 3, 5);
MAPS.mart4 = makeMart("willowmere", 10, 5, ["superpotion", "hyperpotion", "awakening", "greatcapsule", "ultracapsule"]);
MAPS.gym4 = makeGym("willowmere", 16, 5, "fae", "nova");
MAPS.daycare = {
  name: "DAY CARE", outdoor: false,
  tiles: INTERIOR_HOUSE,
  warps: { "4,7": { map: "route3", x: 3, y: 10, dir: "down" } },
  signs: {},
  npcs: [{ id: "daycareman", x: 4, y: 3, dir: "down", sprite: "oldman", type: "daycare" }],
};

// ---- new trainers ----------------------------------------------
Object.assign(TRAINERS, {
  finn: {
    name: "SAILOR FINN",
    party: [["puddlish", 12], ["crabbex", 13]],
    payout: 600,
    intro: ["Ahoy! The sea toughens monsters up!", "Let me show you!"],
    winMsg: ["Blown clean out of the water!"],
    after: ["The fishing off SEABREEZE's docks is world class.", "Get a rod and try it!"],
  },
  june: {
    name: "PICNICKER JUNE",
    party: [["flitchick", 12], ["oakling", 12]],
    payout: 550,
    intro: ["A trainer! Perfect timing.", "My monsters needed the exercise!"],
    winMsg: ["Well, that ruined the picnic."],
    after: ["There are BERRY bushes along the routes.", "Pick them — they grow back after a while!"],
  },
  cliff: {
    name: "HIKER CLIFF",
    party: [["boulderhorn", 13], ["nibbit", 13]],
    payout: 700,
    intro: ["These mountain paths make legs AND monsters strong!", "Feel the burn!"],
    winMsg: ["My legs gave out..."],
    after: ["ECHO CAVE is a maze. Wild monsters can jump you anywhere in there!"],
  },
  gus: {
    name: "SPELUNKER GUS",
    party: [["squeakwing", 15], ["boulderhorn", 15]],
    payout: 800,
    intro: ["You hear those echoes?", "That's the sound of you losing!"],
    winMsg: ["The echoes mock me..."],
    after: ["Legend says an ancient guardian sleeps deep in this cave.", "Southeast corner. If you dare."],
  },
  todd: {
    name: "CAMPER TODD",
    party: [["flarepup", 16], ["nibbit", 15]],
    payout: 800,
    intro: ["Nothing beats a campfire and a good battle!", "You're on!"],
    winMsg: ["My marshmallows burned..."],
    after: ["EMBERFALL's hot spring fully heals your team.", "Better than any potion!"],
  },
  ivy: {
    name: "RANGER IVY",
    party: [["oakling", 17], ["petalfae", 16]],
    payout: 850,
    intro: ["I protect these woods.", "Show me you respect nature's strength!"],
    winMsg: ["The forest has more to teach me."],
    after: ["PETALFAE only appears near flower fields.", "It's rare — bring plenty of CAPSULES."],
  },
  luna: {
    name: "ACE LUNA",
    party: [["galewing", 24], ["fulgurcat", 24]],
    payout: 1400,
    intro: ["Only serious trainers climb ROUTE 5.", "Prove you belong here!"],
    winMsg: ["Impressive. Truly."],
    after: ["The CHAMPION waits at the top of the plateau.", "Nobody has beaten him yet."],
  },
  boris: {
    name: "ACE BORIS",
    party: [["groveguard", 25], ["boulderhorn", 24]],
    payout: 1400,
    intro: ["Defense wins championships!", "Try to crack my wall!"],
    winMsg: ["The wall... crumbled."],
    after: ["Beat all 4 gyms? The LEAGUE guard won't let you through otherwise."],
  },
  lily: {
    name: "SWIMMER LILY",
    party: [["puddlish", 14]],
    payout: 700,
    intro: ["The water's lovely today!", "Let's make a splash!"],
    winMsg: ["Glub glub..."],
    after: ["MARINA is way stronger than me. Watch out for her TIDALFIN!"],
  },
  kai: {
    name: "BURNER KAI",
    party: [["flarepup", 19]],
    payout: 900,
    intro: ["Feel the heat of the EMBERFALL GYM!", "Burn, baby, burn!"],
    winMsg: ["Burnt out..."],
    after: ["BLAZE's INFERNHOUND is the real deal.", "Don't bring anything flammable."],
  },
  nova: {
    name: "MYSTIC NOVA",
    party: [["psyfawn", 22]],
    payout: 1000,
    intro: ["I foresaw your arrival...", "But did I foresee your defeat?"],
    winMsg: ["I did not foresee that."],
    after: ["FAE's mind is on another plane entirely.", "Her PSYELK strikes before you can think."],
  },
  marina: {
    name: "LEADER MARINA",
    isLeader: true,
    badge: { flag: "badge2", name: "TIDE BADGE" },
    party: [["crabbex", 16], ["tidalfin", 18]],
    payout: 2000,
    intro: ["Welcome to SEABREEZE GYM, sweeper of the tides.",
            "My monsters flow like water — relentless and unstoppable.", "Can you swim against the current?"],
    winMsg: ["The tide... has turned!"],
    after: ["The TIDE BADGE suits you.", "The sea bows to no one — but today, it bows to you."],
  },
  blaze: {
    name: "LEADER BLAZE",
    isLeader: true,
    badge: { flag: "badge3", name: "CINDER BADGE" },
    party: [["flarepup", 20], ["lavaslug", 21], ["infernhound", 23]],
    payout: 2500,
    intro: ["EMBERFALL GYM burns all challengers to ash.",
            "My hounds have never lost at home.", "Let's turn up the heat!"],
    winMsg: ["My fire... extinguished!"],
    after: ["Take the CINDER BADGE — it's still warm.", "You fight with a fire of your own, kid."],
  },
  fae: {
    name: "LEADER FAE",
    isLeader: true,
    badge: { flag: "badge4", name: "MIND BADGE" },
    party: [["petalfae", 24], ["mistwisp", 25], ["psyelk", 27]],
    payout: 3000,
    intro: ["I knew you would come. I saw it in a dream.",
            "The WILLOWMERE GYM tests not strength... but will.", "Open your mind — and lose it!"],
    winMsg: ["My visions... shattered!"],
    after: ["The MIND BADGE is yours — I foresaw that too, in the end.",
            "With 4 badges, the LEAGUE at CROWN PLATEAU will admit you."],
  },
  noa: {
    name: "ELITE NOA",
    party: [["shriekwing", 28], ["phantasmal", 29], ["venomdrone", 28]],
    payout: 3500,
    intro: ["Welcome to the gauntlet, challenger.",
            "I am NOA of the ELITE. My poisons seep into every plan.", "Endure this... if you can."],
    winMsg: ["Antidote... please..."],
    after: ["ORION awaits ahead.", "His power makes mine look gentle."],
  },
  orion: {
    name: "ELITE ORION",
    party: [["boulderhorn", 29], ["gnawlord", 29], ["infernhound", 30]],
    payout: 3500,
    intro: ["So NOA fell. No matter.",
            "I am ORION, the final wall before the CHAMPION.", "Break yourself against me!"],
    winMsg: ["The wall breaks...!"],
    after: ["Only the CHAMPION remains.", "You may regret meeting him."],
  },
});

// ---- quiz data --------------------------------------------------
const QUIZ = {
  reward: 1000,
  questions: [
    {
      q: "Which type is SUPER EFFECTIVE against WATER monsters?",
      options: ["GRASS", "FIRE", "NORMAL"],
      answer: 0,
    },
    {
      q: "Which badge does Leader SLATE of OAKRIDGE award?",
      options: ["TIDE BADGE", "QUARRY BADGE", "MIND BADGE"],
      answer: 1,
    },
    {
      q: "Sleeping monsters are easier to catch. True or false?",
      options: ["TRUE", "FALSE"],
      answer: 0,
    },
  ],
};
