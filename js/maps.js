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
      "TTTTTTTTTTTTTTTTTTTT",
      "T..................T",
      "T.RRRR..RRRR..RRRR.T",
      "T.RRRR..RRRR..RRRR.T",
      "T.BDWB..BWDB..BWDB.T",
      "T..=......=......=.T",
      "T..===============.T",
      "T.S.......=........T",
      "T,,.......=......,,T",
      "T.........=........T",
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
      "17,4":  { map: "gym",  x: 5, y: 10, dir: "up" },
      "10,15": { map: "route1", x: 10, y: 1, dir: "down" },
    },
    signs: {
      "2,7": ["OAKRIDGE CITY", "The stone-solid city."],
    },
    npcs: [
      {
        id: "cityguy", x: 14, y: 9, dir: "down", sprite: "boy",
        type: "dialog",
        pages: ["Leader SLATE runs the OAKRIDGE GYM.", "His ROCK-type monsters are super tough!",
                "GRASS and WATER moves will crack them right open."],
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
