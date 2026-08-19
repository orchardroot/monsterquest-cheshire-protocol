// =============================================================
// MonsterQuest v2 — js/art/people.js   (art workstream)
//
// MQ.PeopleArt — 4-direction walk sheets for every sprite id in
// ROSTER §6, plus 32x32 dialogue portraits for the cast.
//
// Public API
//   MQ.PeopleArt.frame(spriteId, dir, frame)   → canvas (cached)
//   MQ.PeopleArt.sheet(spriteId)               → canvas, 3 cols x 4 rows
//   MQ.PeopleArt.portrait(key)                 → 32x32 canvas (cached)
//   MQ.PeopleArt.size(spriteId)  .has(id)  .ids()  .warm()  .stats()
//   MQ.PeopleArt.DIRS = ['down','left','right','up']   FRAMES = 3
//
// dir  = 'down'|'up'|'left'|'right'   frame = 0 (stand) | 1 | 2 (steps)
// Palette variants: pass 'npc_walker#1' for the second colourway.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const MA = MQ.MonsterArt;
  const Grid = MA.Grid;
  const makeCanvas = MA.makeCanvas;

  const DIRS = ["down", "left", "right", "up"];
  const FRAMES = 3;

  // ---- colour slots -------------------------------------------------
  const _ = 0, OUT = 1, SK = 2, SKD = 3, HR = 4, HRD = 5, TOP = 6, TOPD = 7,
        BOT = 8, BOTD = 9, SHOE = 10, AC = 11, AC2 = 12, EYE = 13, WHT = 14, GLOW = 15;
  const NSLOT = 16;

  // ---- shorthand colours ---------------------------------------------
  const S = { pale: "#f2cdaa", tan: "#dfab7d", mid: "#c98a5e", deep: "#8f5c3b", dark: "#6b4229" };
  const H = {
    black: "#241d1d", brown: "#4a3020", ginger: "#a84c22", blond: "#d8b366", grey: "#98928c",
    white: "#e4e0d8", teal: "#2c8f88", purple: "#6c4090", red: "#8e2f2f", sand: "#b99a68"
  };
  const C = {
    forest: "#3d5f4a", navy: "#2f3a55", maroon: "#6b2f38", rust: "#a8532a", mustard: "#c39a30",
    slate: "#4a5361", cream: "#e2d9c4", grey: "#6d6a66", black: "#241f28", white: "#eceae2",
    hivis: "#e8e02c", lab: "#e6ecef", denim: "#3c5b84", plum: "#5a3466", olive: "#6a6c38",
    teal: "#2a7f78", pink: "#c96a8a", coal: "#31302f", brick: "#8a4436", ice: "#bcd8e6",
    cyber: "#1fb2a0", darkbyte: "#132a2a", tweed: "#7b6a4a", brown: "#5a4028"
  };

  // =================================================================
  // 1. Sprite definitions
  // =================================================================
  const defs = {};
  function P(id, d) { d.kind = "human"; d.id = id; defs[id] = d; return d; }
  function ANI(id, d) { d.kind = "animal"; d.id = id; defs[id] = d; return d; }
  function VEH(id, d) { d.kind = "vehicle"; d.id = id; defs[id] = d; return d; }
  function OBJ(id, d) { d.kind = "object"; d.id = id; defs[id] = d; return d; }

  // ---- player & cast -------------------------------------------------
  P("player",      { skin: S.tan, hair: H.brown, style: "short", top: C.forest, bot: C.slate, shoe: "#2b2521", acc: C.rust, pack: true, tired: true, face: "jim" });
  P("player_bike", { skin: S.tan, hair: H.brown, style: "helmet", top: C.rust, bot: C.navy, shoe: "#2b2521", acc: C.hivis, bike: true, face: "jim" });
  P("player_boat", { skin: S.tan, hair: H.brown, style: "short", top: C.navy, bot: C.slate, shoe: "#2b2521", acc: C.rust, tiller: true, face: "jim" });
  P("mum",         { skin: S.tan, hair: H.grey, style: "bun", top: C.plum, bot: C.grey, shoe: "#3a3230", acc: C.cream });
  P("mrs_bobbin",  { skin: S.pale, hair: H.white, style: "bun", top: C.maroon, bot: C.tweed, shoe: "#3a3230", acc: C.mustard, small: true });
  P("vex",         { skin: S.mid, hair: H.red, style: "short", top: "#2a2230", bot: "#1f1c26", shoe: "#d9463c", acc: "#e8483e", hoodie: true, face: "vex" });
  P("vex_hood",    { skin: S.mid, hair: H.red, style: "hood", top: "#1d1a24", bot: "#1f1c26", shoe: "#d9463c", acc: "#e8483e", hoodie: true, face: "vex" });
  P("alder",       { skin: S.pale, hair: H.grey, style: "long", top: "#7a6448", bot: C.cream, shoe: "#4a3f34", acc: C.teal, cardigan: true, face: "alder" });
  P("ada",         { skin: S.deep, hair: H.black, style: "short", top: C.navy, bot: C.slate, shoe: "#2b2b30", acc: C.mustard, lanyard: true });
  P("gaskell",     { skin: S.pale, hair: H.grey, style: "bonnet", top: "#4c3357", bot: "#3b2a44", shoe: "#2c2430", acc: C.cream, skirt: true });
  P("otis",        { skin: S.mid, hair: H.brown, style: "short", top: "#6b4526", bot: "#4a3421", shoe: "#33261a", acc: C.mustard, broad: true, beard: true });
  P("di",          { skin: S.tan, hair: H.black, style: "cap", top: "#3a3f48", bot: "#3a3f48", shoe: "#241f1c", acc: C.rust, overalls: true, sooty: true });
  P("nell",        { skin: S.pale, hair: H.blond, style: "swimcap", top: "#1f5f76", bot: "#1a4a5c", shoe: "#2a3a44", acc: C.ice });
  P("jack",        { skin: S.mid, hair: H.grey, style: "hardhat", top: C.hivis, bot: C.slate, shoe: "#2b2521", acc: "#f2f24a", broad: true });
  P("ria",         { skin: S.deep, hair: H.black, style: "bun", top: C.lab, bot: C.navy, shoe: "#33333a", acc: "#7ad14a", labcoat: true });
  P("mo",          { skin: S.deep, hair: H.teal, style: "headset", top: "#20303c", bot: "#1b2630", shoe: "#2a3038", acc: C.cyber, glow: true });
  P("root",        { skin: S.pale, hair: H.grey, style: "short", top: "#4d4a44", bot: "#3a3833", shoe: "#2b2825", acc: C.mustard, face: "root" });
  P("root_hivis",  { skin: S.pale, hair: H.grey, style: "hood", top: C.hivis, bot: "#3a3833", shoe: "#2b2825", acc: "#f2f24a", face: "root" });
  P("elis",        { skin: S.pale, hair: H.white, style: "cap", top: "#4a5a48", bot: "#5a5140", shoe: "#33291f", acc: C.tweed, coat: true, beard: true });
  P("mamgu",       { skin: S.tan, hair: H.white, style: "bun", top: "#4a6b3c", bot: "#5c4b32", shoe: "#3a2f24", acc: "#c9503a", skirt: true, small: true });
  P("dai",         { skin: S.tan, hair: H.brown, style: "cap", top: "#7a5c33", bot: "#4a4033", shoe: "#33291f", acc: C.mustard, broad: true });
  P("sue",         { skin: S.pale, hair: H.ginger, style: "short", top: "#2f5f8a", bot: C.navy, shoe: "#2b2b30", acc: C.white, lanyard: true });
  P("raj",         { skin: S.deep, hair: H.black, style: "short", top: "#2f5f8a", bot: C.navy, shoe: "#2b2b30", acc: C.white, lanyard: true });
  P("kim",         { skin: S.tan, hair: H.black, style: "long", top: "#2f5f8a", bot: C.navy, shoe: "#2b2b30", acc: C.white, lanyard: true });
  P("doc",         { skin: S.mid, hair: H.grey, style: "short", top: "#2f5f8a", bot: C.navy, shoe: "#2b2b30", acc: C.white, lanyard: true, glasses: true });
  P("kellan",      { skin: S.pale, hair: H.brown, style: "long", top: "#c9c2a8", bot: "#8a7f62", shoe: "#4a3f30", acc: "#e8c24a", robe: true });
  P("twelve_k",    { skin: S.tan, hair: H.black, style: "short", top: "#2a2f38", bot: "#22262d", shoe: "#2a2a30", acc: C.cyber, lanyard: true, glasses: true });
  P("npc_nurse",   { skin: S.pale, hair: H.brown, style: "bun", top: C.white, bot: "#cfd8dc", shoe: "#dfe4e6", acc: "#e05a6a" });
  P("npc_sysadmin",{ skin: S.mid, hair: H.black, style: "short", top: "#31384a", bot: "#282d38", shoe: "#2a2a30", acc: C.mustard, lanyard: true });
  P("npc_stoker",  { skin: S.tan, hair: H.brown, style: "cap", top: "#4a4640", bot: "#3a3833", shoe: "#241f1c", acc: C.rust, sooty: true, overalls: true });
  P("treacle_tam", { skin: S.mid, hair: H.ginger, style: "cap", top: "#8a4a26", bot: "#4a3a28", shoe: "#33291f", acc: C.mustard, apron: true });
  P("spokes",      { skin: S.tan, hair: H.blond, style: "helmet", top: "#2f7f6a", bot: C.navy, shoe: "#2b2521", acc: C.hivis });

  // impostors: palette-shifted duplicates of the face they are wearing
  const IMPOSTOR = { alder_impostor: "alder", root_impostor: "root", vex_impostor: "vex", jim_impostor: "player" };

  // ---- trainer classes (2 colourways each via '#1') --------------------
  const CLASSES = [
    ["npc_walker",     { skin: S.tan,  hair: H.brown, style: "hat",     top: "#5a6b4a", bot: "#6a5f48", shoe: "#3a2f24", acc: C.rust, pack: true, tool: "pole" }],
    ["npc_cyclist",    { skin: S.pale, hair: H.blond, style: "helmet",  top: "#c9432f", bot: "#22252c", shoe: "#2b2521", acc: C.hivis }],
    ["npc_fisher",     { skin: S.mid,  hair: H.grey,  style: "hat",     top: "#3f5a6b", bot: "#3a4048", shoe: "#2a3033", acc: C.mustard, tool: "rod" }],
    ["npc_weaver",     { skin: S.pale, hair: H.brown, style: "bun",     top: "#8a6a9a", bot: "#4a3f52", shoe: "#3a3038", acc: C.cream, apron: true }],
    ["npc_shopkeep",   { skin: S.tan,  hair: H.ginger,style: "short",   top: "#a8532a", bot: "#4a3a28", shoe: "#33291f", acc: C.mustard, apron: true }],
    ["npc_dev",        { skin: S.pale, hair: H.black, style: "short",   top: "#2c3440", bot: "#22262d", shoe: "#2a2a30", acc: C.cyber, glasses: true }],
    ["npc_ranger",     { skin: S.deep, hair: H.black, style: "hat",     top: "#3a5c38", bot: "#4a4630", shoe: "#33291f", acc: C.mustard, tool: "scope" }],
    ["npc_miner",      { skin: S.tan,  hair: H.brown, style: "hardhat", top: "#4a4438", bot: "#3a352c", shoe: "#241f1c", acc: "#f2d24a", lamp: true, sooty: true }],
    ["npc_caver",      { skin: S.pale, hair: H.black, style: "hardhat", top: "#2f4a5a", bot: "#2a3540", shoe: "#241f1c", acc: "#f2d24a", lamp: true }],
    ["npc_historian",  { skin: S.pale, hair: H.grey,  style: "short",   top: "#5a4a6a", bot: "#3f3548", shoe: "#332c38", acc: C.cream, glasses: true, tool: "book" }],
    ["npc_signaller",  { skin: S.mid,  hair: H.brown, style: "cap",     top: "#2f3a55", bot: "#2a3145", shoe: "#242830", acc: C.mustard, tool: "lever" }],
    ["npc_boater",     { skin: S.tan,  hair: H.grey,  style: "cap",     top: "#2f5f6b", bot: "#3a4048", shoe: "#2a3033", acc: "#c94a3a" }],
    ["npc_saltworker", { skin: S.deep, hair: H.black, style: "hardhat", top: C.hivis, bot: "#4a4a52", shoe: "#2b2b30", acc: "#f2f24a" }],
    ["npc_chemist",    { skin: S.pale, hair: H.brown, style: "short",   top: C.lab,   bot: "#3a4048", shoe: "#33333a", acc: "#8ad14a", labcoat: true, glasses: true }],
    ["npc_birder",     { skin: S.tan,  hair: H.blond, style: "hat",     top: "#4a5a3a", bot: "#4a4630", shoe: "#33291f", acc: C.tweed, tool: "scope" }],
    ["npc_fellrunner", { skin: S.pale, hair: H.ginger,style: "short",   top: "#d9483c", bot: "#22252c", shoe: "#e8e02c", acc: C.hivis, slim: true }],
    ["npc_farmer",     { skin: S.mid,  hair: H.brown, style: "cap",     top: "#6a5a3a", bot: "#3f4a33", shoe: "#33291f", acc: C.mustard, broad: true }],
    ["npc_bandsman",   { skin: S.pale, hair: H.black, style: "peaked",  top: "#2a2f4a", bot: "#22263a", shoe: "#241f1c", acc: "#e8c24a", tool: "horn" }],
    ["npc_kid",        { skin: S.tan,  hair: H.brown, style: "short",   top: "#e8a83c", bot: "#2f5f8a", shoe: "#d9463c", acc: C.white, small: true }],
    ["npc_granny",     { skin: S.pale, hair: H.white, style: "bun",     top: "#8a5a7a", bot: "#4a3f52", shoe: "#3a3038", acc: C.cream, small: true, skirt: true }],
    ["npc_cultist",    { skin: S.pale, hair: H.brown, style: "hood",    top: "#c9c2a8", bot: "#8a7f62", shoe: "#4a3f30", acc: "#e8c24a", robe: true }],
    ["npc_stuffer",    { skin: S.mid,  hair: H.black, style: "cap",     top: "#3a2f4a", bot: "#22262d", shoe: "#2a2a30", acc: "#a84ad9", hoodie: true }],
    ["npc_shadow_it",  { skin: S.tan,  hair: H.grey,  style: "short",   top: "#4a4a52", bot: "#33333a", shoe: "#2a2a30", acc: C.cyber, lanyard: true }],
    ["npc_amos",       { skin: "#b9a8b4", hair: H.black, style: "hood", top: "#2a2634", bot: "#1f1c26", shoe: "#241f28", acc: "#8ad9c4", faceless: true }],
    ["npc_darkbyte",   { skin: S.mid,  hair: H.black, style: "hardhat", top: C.hivis, bot: C.darkbyte, shoe: "#1a1f1f", acc: C.cyber, mark: true }],
    ["npc_whitehat",   { skin: S.pale, hair: H.brown, style: "short",   top: "#2f5f8a", bot: C.navy, shoe: "#2b2b30", acc: C.white, lanyard: true }],
    ["npc_ghost_trainer", { skin: "#b8c6d8", hair: H.white, style: "helm", top: "#5a6478", bot: "#48506a", shoe: "#3a4055", acc: "#c8dcf0", ghostly: true }]
  ];
  for (let i = 0; i < CLASSES.length; i++) P(CLASSES[i][0], CLASSES[i][1]);
  defs.npc_vex = defs.vex;

  // ---- animals ---------------------------------------------------------
  ANI("cat_meadow",  { body: "cat", dark: "#0e0d13", mid: "#1f1d28", light: "#3a3746", acc: "#7fd66b", scale: 0.78, fast: true });
  ANI("cat_bigboy",  { body: "cat", dark: "#171520", mid: "#2b2933", light: "#efece4", acc: "#f6bcc9", scale: 1.18, patches: true, slow: true });
  ANI("cat_grinkit", { body: "cat", dark: "#2b2338", mid: "#553f74", light: "#ab90cf", acc: "#f5e05a", scale: 0.72, grin: true });
  ANI("dog",         { body: "dog", dark: "#3a2a1c", mid: "#7a5a34", light: "#c2a06a", acc: "#e2d8c4", scale: 0.95 });
  ANI("deer",        { body: "deer", dark: "#4a3524", mid: "#8a6540", light: "#c8a173", acc: "#efe6d2", scale: 1.15 });
  ANI("sheep",       { body: "sheep", dark: "#57524a", mid: "#a9a297", light: "#e6e0d2", acc: "#3a332c", scale: 1.0 });
  ANI("duck",        { body: "duck", dark: "#22301f", mid: "#3f6a3a", light: "#c8b98a", acc: "#e8a83c", scale: 0.7 });
  ANI("heron",       { body: "heron", dark: "#3a4250", mid: "#7d8794", light: "#dfe4ea", acc: "#e8c24a", scale: 1.3 });

  // ---- vehicles & objects ----------------------------------------------
  VEH("boat_narrow",      { kindOf: "boat", dark: "#1f3a3f", mid: "#2f6b5c", light: "#8ac4a0", acc: "#c94a3a", w: 44, h: 22 });
  VEH("boat_lift_caisson",{ kindOf: "caisson", dark: "#2a2f36", mid: "#556070", light: "#98a6b8", acc: "#e8c24a", w: 44, h: 26 });
  VEH("train",            { kindOf: "carriage", dark: "#2a2028", mid: "#6b3038", light: "#c8b8a8", acc: "#e8d24a", w: 44, h: 22 });
  VEH("train_loco",       { kindOf: "loco", dark: "#1c1a18", mid: "#2f3f36", light: "#8a9a90", acc: "#c94a2a", w: 44, h: 24 });
  VEH("train_apt",        { kindOf: "apt", dark: "#20242c", mid: "#5a6470", light: "#e2e6ea", acc: "#c94a3a", w: 44, h: 22 });
  OBJ("oracle_terminal",  { kindOf: "terminal", dark: "#0a1e26", mid: "#12564f", light: "#2fc8ae", acc: "#eafff9", w: 16, h: 24 });
  OBJ("grinmalkin_wall",  { kindOf: "grin", dark: "#1a1424", mid: "#4a3468", light: "#a487cc", acc: "#f5e05a", w: 24, h: 16 });

  // second colourways for the trainer classes
  function variantOf(base, n) {
    const d = {};
    for (const k in base) if (Object.prototype.hasOwnProperty.call(base, k)) d[k] = base[k];
    const rnd = U.rng(base.id + "|var" + n);
    const dh = 0.30 + rnd() * 0.40;
    d.skin = MA.hueShift(base.skin, (rnd() - 0.5) * 0.03, -0.05, (rnd() - 0.5) * 0.08);
    d.hair = MA.hueShift(base.hair, dh * 0.4, 0, (rnd() - 0.5) * 0.10);
    d.top = MA.hueShift(base.top, dh, 0.05, 0);
    d.bot = MA.hueShift(base.bot, dh * 0.6, 0, 0);
    d.acc = MA.hueShift(base.acc, dh * 1.2, 0.10, 0);
    return d;
  }

  // =================================================================
  // 2. Palettes + grid helpers
  // =================================================================
  function humanPal(d) {
    const pal = new Array(NSLOT);
    const acc = d.acc || "#c9762f";
    pal[_] = null;
    pal[OUT] = "#191420";
    pal[SK] = d.skin; pal[SKD] = U.shade(d.skin, -0.22);
    pal[HR] = d.hair; pal[HRD] = U.shade(d.hair, -0.32);
    pal[TOP] = d.top; pal[TOPD] = U.shade(d.top, -0.28);
    pal[BOT] = d.bot; pal[BOTD] = U.shade(d.bot, -0.28);
    pal[SHOE] = d.shoe || "#2a2521";
    pal[AC] = acc; pal[AC2] = U.mix(acc, "#ffffff", 0.45);
    pal[EYE] = "#1a1620"; pal[WHT] = "#f4f2ea";
    pal[GLOW] = U.mix(acc, "#ffffff", 0.55);
    return pal;
  }
  function thingPal(d) {
    const pal = new Array(NSLOT);
    pal[_] = null;
    pal[OUT] = U.shade(d.dark, -0.5);
    pal[SKD] = d.dark; pal[SK] = d.mid;
    pal[HRD] = d.dark; pal[HR] = d.mid;
    pal[TOPD] = d.dark; pal[TOP] = d.mid;
    pal[BOTD] = U.shade(d.mid, -0.2); pal[BOT] = d.light;
    pal[SHOE] = d.dark;
    pal[AC] = d.acc; pal[AC2] = U.mix(d.acc, "#ffffff", 0.45);
    pal[EYE] = "#12101a"; pal[WHT] = d.light;
    pal[GLOW] = U.mix(d.acc, "#ffffff", 0.55);
    return pal;
  }
  function flipGrid(g) {
    const o = new Grid(g.w, g.h);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.d[y * g.w + x] = g.d[y * g.w + (g.w - 1 - x)];
    return o;
  }

  // =================================================================
  // 3. Humans — 16 x 22, four directions, three frames
  // =================================================================
  const HW = 16, HH = 22;

  function hairTop(g, d, dir) {
    const st = d.style;
    if (st === "bald") return;
    if (st === "hardhat") {
      g.ell(7.5, 3.4, 4.4, 2.6, AC); g.rect(3, 3.4, 10, 1, AC); g.rect(3, 4.2, 10, 1, AC2);
      if (d.lamp) { g.rect(7, 2.4, 2, 1, GLOW); }
      return;
    }
    if (st === "helmet") { g.ell(7.5, 3.2, 4.3, 2.8, AC); g.rect(4, 2.8, 7, 1, AC2); g.rect(3, 5.2, 10, 1, HRD); return; }
    if (st === "helm") { g.ell(7.5, 4.2, 4.2, 4.0, AC); g.rect(6.5, 4, 2, 5, OUT); g.rect(3.5, 6, 8, 1, AC2); return; }
    if (st === "cap" || st === "peaked") {
      g.rect(3.5, 1.8, 9, 2.4, HRD); g.ell(7.5, 2.6, 4.4, 1.9, HRD);
      if (dir !== "up") g.rect(3, 4.0, 10, 1, HR);
      if (st === "peaked") g.rect(6.5, 2.0, 3, 1, AC);
      return;
    }
    if (st === "hat") { g.ell(7.5, 3.2, 3.8, 2.4, HRD); g.rect(2, 4.6, 12, 1.2, HRD); return; }
    if (st === "bonnet") { g.ell(7.5, 3.6, 4.6, 3.6, WHT); g.ell(7.5, 5.0, 3.2, 2.6, SK); g.rect(2.5, 5.2, 2, 4, WHT); g.rect(11.5, 5.2, 2, 4, WHT); return; }
    if (st === "swimcap") { g.ell(7.5, 3.6, 4.2, 3.0, AC); g.rect(3.5, 3.0, 9, 1, AC2); return; }
    if (st === "hood") {
      g.ell(7.5, 4.6, 5.0, 4.4, TOPD); g.ell(7.5, 5.6, 3.4, 3.2, d.faceless ? OUT : SK);
      g.rect(3, 8.4, 10, 1.4, TOPD);
      return;
    }
    if (st === "headset") { g.ell(7.5, 3.6, 4.0, 3.0, HR); g.rect(3, 4.6, 1.6, 2.4, AC); g.rect(11.4, 4.6, 1.6, 2.4, AC); g.rect(3, 3.6, 10, 1, AC2); g.rect(4, 6.4, 2, 1, GLOW); return; }
    if (st === "bun") { g.ell(7.5, 3.8, 4.2, 3.2, HR); g.ell(7.5, 1.6, 2.4, 1.8, HRD); if (dir !== "up") g.rect(3.4, 4.6, 1.6, 3, HR), g.rect(11, 4.6, 1.6, 3, HR); return; }
    if (st === "long") { g.ell(7.5, 3.8, 4.3, 3.3, HR); g.rect(2.8, 4.4, 2.2, 6.5, HR); g.rect(11, 4.4, 2.2, 6.5, HR); g.rect(2.8, 4.4, 1, 6.5, HRD); return; }
    // short
    g.ell(7.5, 3.6, 4.2, 3.0, HR);
    g.rect(3.4, 4.2, 1.4, 2.4, HR); g.rect(11.2, 4.2, 1.4, 2.4, HR);
    if (dir === "up") g.ell(7.5, 4.8, 4.2, 3.2, HR);
  }

  function torso(g, d, dir, fr) {
    const bob = fr ? 0 : 0;
    const wide = d.broad ? 1 : d.slim || d.small ? -1 : 0;
    const x0 = 5 - wide * 0.5, w = 6 + wide;
    // legs first (behind the coat)
    const legY = 16.5;
    let lA = 0, lB = 0;
    if (fr === 1) { lA = -1; lB = 0; } else if (fr === 2) { lA = 0; lB = -1; }
    g.rect(6, legY + Math.max(0, lA), 2, 4.5 + lA * 0.5, BOT);
    g.rect(8, legY + Math.max(0, lB), 2, 4.5 + lB * 0.5, BOTD);
    g.rect(5.6, 20.4 + lA, 2.6, 1.6, SHOE);
    g.rect(7.8, 20.4 + lB, 2.6, 1.6, SHOE);
    // body
    g.rect(x0, 9.6, w, 7.4, TOP);
    g.rect(x0, 9.6, w, 1, TOPD);
    g.ell(7.5, 10.4, w * 0.55, 1.4, TOP);
    // arms
    const swing = fr === 1 ? 1 : fr === 2 ? -1 : 0;
    g.rect(x0 - 1.4, 10.4 + swing * 0.5, 1.6, 5.4, TOPD);
    g.rect(x0 + w - 0.2, 10.4 - swing * 0.5, 1.6, 5.4, TOPD);
    g.rect(x0 - 1.4, 15.4 + swing * 0.5, 1.6, 1.4, SK);
    g.rect(x0 + w - 0.2, 15.4 - swing * 0.5, 1.6, 1.4, SK);
    return { x0: x0, w: w, bob: bob };
  }

  function clothing(g, d, dir, fr, t) {
    if (d.labcoat) { g.rect(t.x0, 10.6, t.w, 8.4, WHT); g.rect(7.2, 10.6, 0.8, 8.4, BOTD); g.rect(t.x0 - 1.2, 11, 1.4, 5, WHT); g.rect(t.x0 + t.w, 11, 1.4, 5, WHT); }
    if (d.overalls) { g.rect(t.x0 + 0.6, 11.4, t.w - 1.2, 6, BOT); g.rect(t.x0 + 1.4, 9.8, 1, 2, BOT); g.rect(t.x0 + t.w - 2.4, 9.8, 1, 2, BOT); g.rect(t.x0 + 2.6, 12.6, 2.4, 2, BOTD); }
    if (d.apron) { g.rect(t.x0 + 0.8, 12, t.w - 1.6, 6.4, WHT); g.rect(t.x0 + 0.8, 12, t.w - 1.6, 1, AC2); }
    if (d.skirt || d.robe) { for (let i = 0; i < 5; i++) g.rect(4.2 - i * 0.2, 15.6 + i, 7.6 + i * 0.4, 1.2, d.robe ? TOP : BOT); g.rect(4, 20.4, 8, 1, d.robe ? TOPD : BOTD); }
    if (d.cardigan) { g.rect(t.x0, 10.6, 1.6, 7, AC); g.rect(t.x0 + t.w - 1.6, 10.6, 1.6, 7, AC); }
    if (d.coat) { g.rect(t.x0 - 0.6, 10.6, t.w + 1.2, 9, TOPD); g.rect(7.2, 11, 0.8, 8, TOP); }
    if (d.hoodie && d.style !== "hood") { g.rect(t.x0 + 1, 9.4, t.w - 2, 1.6, TOPD); g.rect(6.6, 11, 0.6, 3, AC); g.rect(8.4, 11, 0.6, 3, AC); }
    if (d.lanyard) { g.rect(6.4, 10.4, 0.8, 2.6, AC); g.rect(8.6, 10.4, 0.8, 2.6, AC); g.rect(6.8, 12.8, 2.4, 1.8, AC2); }
    if (d.pack && dir !== "down") { g.rect(4.4, 10.4, 7.2, 6.4, AC); g.rect(4.4, 10.4, 7.2, 1, AC2); g.rect(6.4, 13.4, 3.2, 2, TOPD); }
    if (d.pack && dir === "down") { g.rect(4.6, 10.2, 1.2, 5.4, AC); g.rect(10.2, 10.2, 1.2, 5.4, AC); }
    if (d.mark) { g.ell(7.5, 13, 1.6, 1.2, OUT); g.rect(6.6, 12.8, 1.8, 0.6, GLOW); }
    if (d.sooty) { for (let i = 0; i < 4; i++) g.set(5 + i * 2, 12 + (i % 2) * 3, BOTD); }
    if (d.glow) { g.rect(t.x0 + 1, 11.4, t.w - 2, 0.8, GLOW); g.rect(t.x0 + 2, 13.4, t.w - 4, 0.8, GLOW); }
  }

  function tools(g, d, dir, fr) {
    const t = d.tool;
    if (!t) return;
    if (dir === "up") return;
    if (t === "pole") { g.rect(12.4, 8, 0.9, 13, AC); }
    else if (t === "rod") { g.line(12.4, 14, 15.4, 4, AC, 1); g.line(15.4, 4, 15.6, 8, WHT, 1); }
    else if (t === "scope") { g.rect(11.6, 11.4, 3.4, 1.6, OUT); g.rect(14.4, 11.2, 0.8, 2, AC); }
    else if (t === "book") { g.rect(11.4, 12.4, 3.2, 3, WHT); g.rect(11.4, 12.4, 0.8, 3, AC); }
    else if (t === "lever") { g.rect(12.6, 9, 0.9, 8, AC); g.ell(13, 8.6, 1.2, 1, AC2); }
    else if (t === "horn") { g.ell(12.6, 12.6, 2.2, 2.2, AC); g.ell(12.6, 12.6, 1.1, 1.1, OUT); }
  }

  function face(g, d, dir) {
    if (dir === "up") return;
    if (d.faceless) { g.rect(5.6, 5, 4.8, 2.4, OUT); g.rect(6.2, 5.6, 1, 1, GLOW); g.rect(9, 5.6, 1, 1, GLOW); return; }
    const ey = 5.6;
    if (dir === "down") {
      g.rect(5.8, ey, 1.4, 1.6, WHT); g.rect(9.0, ey, 1.4, 1.6, WHT);
      g.rect(6.1, ey + 0.4, 0.9, 1.1, EYE); g.rect(9.3, ey + 0.4, 0.9, 1.1, EYE);
      if (d.tired) { g.rect(5.8, ey + 1.8, 1.4, 0.5, SKD); g.rect(9.0, ey + 1.8, 1.4, 0.5, SKD); }
      g.rect(6.8, 8.0, 2, 0.6, SKD);
      if (d.glasses) { g.rect(5.4, ey - 0.4, 2.2, 2.6, OUT); g.rect(8.7, ey - 0.4, 2.2, 2.6, OUT); g.rect(5.9, ey, 1.4, 1.6, WHT); g.rect(9.1, ey, 1.4, 1.6, WHT); g.rect(7.5, ey + 0.5, 1.4, 0.6, OUT); }
      if (d.beard) { g.rect(5.2, 7.2, 5.6, 2.4, HRD); g.rect(6.6, 7.6, 2.8, 1, SKD); }
    } else {
      g.rect(5.0, ey, 1.6, 1.8, WHT); g.rect(5.2, ey + 0.4, 1, 1.2, EYE);
      g.rect(3.6, 6.4, 1.2, 1, SK);   // nose
      g.rect(4.4, 8.0, 1.8, 0.6, SKD);
      if (d.glasses) { g.rect(4.4, ey - 0.4, 2.8, 2.6, OUT); g.rect(4.9, ey, 1.8, 1.6, WHT); }
      if (d.beard) { g.rect(3.6, 7.0, 4, 2.4, HRD); }
    }
  }

  function drawHuman(d, dir, fr) {
    const g = new Grid(HW, HH);
    const headY = 5.4;
    if (dir === "left") {
      // profile: shift the whole figure a touch and narrow the shoulders
      const t = torso(g, d, dir, fr);
      g.ell(6.8, headY, 3.7, 4.0, SK);
      g.rect(6.4, 9.0, 2.4, 1.2, SKD);
      hairTop(g, d, dir);
      clothing(g, d, dir, fr, t);
      face(g, d, dir);
      tools(g, d, dir, fr);
    } else {
      const t = torso(g, d, dir, fr);
      g.ell(7.5, headY, 3.9, 4.1, SK);
      g.rect(6.6, 9.0, 2, 1.2, SKD);
      hairTop(g, d, dir);
      clothing(g, d, dir, fr, t);
      face(g, d, dir);
      tools(g, d, dir, fr);
    }
    if (d.bike) { g.ell(4, 19.5, 2.6, 2.4, OUT); g.ell(12, 19.5, 2.6, 2.4, OUT); g.rect(4, 17.4, 8, 1, AC); }
    if (d.tiller) { g.rect(11.6, 12, 3.4, 0.9, AC); }
    g.shade(0);
    g.outline(OUT);
    if (d.ghostly) { for (let y = 12; y < HH; y++) for (let x = 0; x < HW; x++) if (g.get(x, y) && ((x + y) & 1)) g.set(x, y, 0); }
    return g;
  }

  // =================================================================
  // 4. Animals — 16 x 16
  // =================================================================
  const AW = 16, AH = 16;
  function drawAnimal(d, dir, fr) {
    const g = new Grid(AW, AH);
    const s = d.scale || 1, k = d.body;
    const step = fr === 1 ? 1 : fr === 2 ? -1 : 0;
    const tall = k === "deer" || k === "heron";
    const bodyY = tall ? 8.5 : 10.5, bodyRx = 4.4 * s, bodyRy = (tall ? 2.6 : 3.0) * s;
    const legLen = tall ? 5.2 : 3.0;

    if (k === "duck") {
      g.ell(8, 10.5, 4.2 * s, 3.2 * s, SK);
      g.ell(8, 11.6, 3.2 * s, 2.0 * s, WHT);
      g.ell(dir === "left" ? 5.4 : 8, 6.6, 2.4 * s, 2.2 * s, SKD);
      if (dir === "left") g.rect(2.4, 6.6, 2.6, 1.2, AC); else if (dir === "down") g.rect(7, 7.6, 2, 1.2, AC);
      g.rect(6 + step, 13.4, 1, 1.6, AC); g.rect(9 - step, 13.4, 1, 1.6, AC);
    } else if (k === "heron") {
      g.ell(8, 10.5, 3.4, 3.0, SK);
      g.rect(7.4, 4.2, 1.4, 6, SK);
      g.ell(dir === "left" ? 6.4 : 8, 3.4, 1.9, 1.7, WHT);
      if (dir === "left") g.rect(2.6, 3.4, 3.8, 0.9, AC); else if (dir === "down") g.rect(7.4, 4.2, 1.2, 2.6, AC);
      g.rect(6.6 + step, 13, 0.9, 3, AC); g.rect(9 - step, 13, 0.9, 3, AC);
      g.tri(8, 2.0, 8, 4.0, 1.6, WHT);
    } else {
      // four-legged: cat, dog, deer, sheep
      const sideOn = dir === "left" || dir === "right";
      if (k === "sheep") {
        for (let i = 0; i < 5; i++) g.ell(5 + i * 1.6, bodyY - 1.4 + (i % 2) * 0.8, 2.0 * s, 1.9 * s, WHT);
        g.ell(8, bodyY, bodyRx, bodyRy, WHT);
      } else {
        g.ell(8, bodyY, bodyRx, bodyRy, SK);
      }
      const hx = sideOn ? 8 - bodyRx * 0.85 : 8;
      const hy = sideOn ? bodyY - bodyRy * 1.0 : bodyY - bodyRy * 1.55;
      const hr = (k === "deer" ? 2.0 : 2.4) * s;
      if (k === "deer" && sideOn) g.rect(hx - 0.4, hy, 1.6, 3.2, SK);
      g.ell(hx, hy, hr, hr * 0.92, k === "sheep" ? SKD : SK);
      // ears / antlers
      if (k === "cat") { g.tri(hx - hr * 0.75, hy - hr * 1.7, hx - hr * 0.5, hy, hr * 0.8, SKD); if (!sideOn) g.tri(hx + hr * 0.75, hy - hr * 1.7, hx + hr * 0.5, hy, hr * 0.8, SKD); }
      else if (k === "deer") { g.line(hx - 0.8, hy - hr, hx - 2.2, hy - hr * 2.4, AC, 1); g.line(hx + 0.8, hy - hr, hx + 2.2, hy - hr * 2.4, AC, 1); }
      else if (k === "dog") { g.ell(hx - hr * 0.85, hy - hr * 0.25, hr * 0.45, hr * 0.8, SKD); if (!sideOn) g.ell(hx + hr * 0.85, hy - hr * 0.25, hr * 0.45, hr * 0.8, SKD); }
      else { g.ell(hx - hr * 0.9, hy, hr * 0.5, hr * 0.4, SKD); if (!sideOn) g.ell(hx + hr * 0.9, hy, hr * 0.5, hr * 0.4, SKD); }
      // legs
      const ly = bodyY + bodyRy * 0.7;
      g.rect(5.4 + step * 0.8, ly, 1.3 * s, legLen, SKD);
      g.rect(9.4 - step * 0.8, ly, 1.3 * s, legLen, SKD);
      if (!sideOn) { g.rect(6.6 - step * 0.6, ly, 1.2 * s, legLen * 0.9, SKD); g.rect(8.4 + step * 0.6, ly, 1.2 * s, legLen * 0.9, SKD); }
      // tail
      if (k === "cat") { const tx = sideOn ? 8 + bodyRx * 0.9 : 8 + bodyRx * 0.7; g.line(tx, bodyY, tx + 2.4, bodyY - (d.fast ? 4.2 : 1.2), SKD, 1); }
      else if (k === "dog") g.line(8 + bodyRx * 0.8, bodyY - 0.6, 8 + bodyRx * 1.4, bodyY - 3.0, SKD, 1);
      // face
      if (dir !== "up") {
        const ex = sideOn ? hx - hr * 0.35 : hx;
        const sp = sideOn ? 0 : hr * 0.45;
        for (let sgn = -1; sgn <= 1; sgn += 2) {
          if (sideOn && sgn > 0) break;
          g.set(ex + sgn * sp, hy - 0.2, k === "cat" ? AC : EYE);
        }
        g.set(hx, hy + hr * 0.55, EYE);
      }
      if (d.patches) { g.ell(8, bodyY + 1.0, bodyRx * 0.55, bodyRy * 0.6, WHT); g.ell(hx, hy + hr * 0.5, hr * 0.5, hr * 0.4, WHT); }
      if (d.grin) { g.line(hx - hr * 0.6, hy + hr * 0.5, hx + hr * 0.6, hy + hr * 0.5, AC, 1); }
    }
    g.shade(0);
    g.outline(OUT);
    return g;
  }

  // =================================================================
  // 5. Vehicles & objects
  // =================================================================
  function drawVehicle(d, dir, fr) {
    const w = d.w || 44, h = d.h || 22;
    const g = new Grid(w, h);
    const side = dir === "left" || dir === "right";
    const k = d.kindOf;
    if (k === "terminal") {
      g.rect(2, 4, 12, 16, SK);
      g.rect(3, 6, 10, 8, SKD);
      const on = fr !== 1;
      for (let i = 0; i < 3; i++) g.rect(4, 7.5 + i * 2, on ? 8 - i * 2 : 5, 1, AC);
      g.rect(2, 20, 12, 3, SKD);
      g.rect(4, 2, 8, 2, on ? GLOW : SKD);
    } else if (k === "grin") {
      const open = 1 + fr * 0.25;
      for (let x = -9; x <= 9; x++) {
        const y = 8 + Math.cos(x / 9 * 1.35) * -4 * open + 4 * open;
        g.set(w / 2 + x, y, AC); g.set(w / 2 + x, y + 1, AC); g.set(w / 2 + x, y + 2, AC);
      }
      for (let i = -3; i <= 3; i++) {
        const x = i * 2.6, y = 8 + Math.cos(x / 9 * 1.35) * -4 * open + 4 * open;
        g.set(w / 2 + x, y, OUT); g.set(w / 2 + x, y + 1, OUT); g.set(w / 2 + x, y + 2, OUT);
      }
      if (fr === 2) { g.ell(w / 2 - 5, 3, 1.6, 1.2, AC); g.ell(w / 2 + 5, 3, 1.6, 1.2, AC); }
      return g;
    } else if (!side) {
      // end-on view: a narrow slab
      const cw = Math.round(w * 0.34);
      g.rect((w - cw) / 2, 3, cw, h - 7, SK);
      g.rect((w - cw) / 2, 3, cw, 2, SKD);
      g.rect((w - cw) / 2 + 2, 7, cw - 4, 5, BOT);
      g.rect((w - cw) / 2, h - 4, cw, 3, SKD);
      if (k === "loco") g.rect(w / 2 - 2, 0, 4, 3, SKD);
    } else {
      if (k === "boat") {
        g.rect(1, 8, w - 2, 8, SK);
        g.tri(w - 1, 12, w - 8, 12, 8, SK);
        g.rect(4, 4, w - 14, 5, SKD);
        for (let i = 0; i < 4; i++) g.rect(6 + i * 7, 5, 3, 3, BOT);
        g.rect(2, 15, w - 4, 2, SKD);
        g.rect(w - 10, 3, 2, 5, AC);
        for (let i = 0; i < 3; i++) g.rect(5 + i * 9, 10, 5, 3, AC);
      } else if (k === "caisson") {
        g.rect(2, 6, w - 4, 12, SK);
        g.rect(2, 6, w - 4, 2, BOT);
        g.rect(2, 16, w - 4, 2, SKD);
        for (let i = 0; i < 5; i++) g.rect(4 + i * 8, 8, 1.4, 8, SKD);
        g.rect(0, 2, w, 2, AC);
        g.rect(6, 0, 2, 3, SKD); g.rect(w - 8, 0, 2, 3, SKD);
      } else if (k === "loco") {
        g.rect(2, 8, w - 12, 9, SK);
        g.rect(w - 16, 3, 13, 9, SKD);
        for (let i = 0; i < 2; i++) g.rect(w - 13 + i * 5, 5, 3, 3, BOT);
        g.rect(3, 2, 4, 7, SKD); g.rect(2, 1, 6, 2, SK);
        g.rect(10, 5, 3, 3, AC);
        g.rect(1, 16, w - 2, 2, SKD);
        const wo = fr * 1.2;
        g.ell(8 + wo, 19, 3.2, 3.2, SKD); g.ell(18 + wo, 19, 3.2, 3.2, SKD); g.ell(29 + wo, 19, 2.4, 2.4, SKD);
        g.rect(6, 18.6, 26, 1, AC);
      } else {
        // carriage / APT
        g.rect(1, 4, w - 2, 13, SK);
        g.rect(1, 4, w - 2, 2.4, k === "apt" ? BOT : SKD);
        g.rect(1, 14, w - 2, 1.6, AC);
        for (let i = 0; i < 5; i++) g.rect(3.5 + i * 8, 7, 5, 5, BOT);
        g.rect(1, 17, w - 2, 2, SKD);
        const wo = fr * 1.2;
        g.ell(8 + wo, 19.5, 2.4, 2.4, SKD); g.ell(w - 10 + wo, 19.5, 2.4, 2.4, SKD);
        if (k === "apt") { g.rect(0, 4, 3, 13, BOT); }
      }
    }
    g.shade(0);
    g.outline(OUT);
    return g;
  }

  // =================================================================
  // 6. Portraits — 32 x 32 faces for the dialogue box
  // =================================================================
  const PW = 32, PH = 32;
  const PORTRAIT_ALIAS = {
    jim: "player", wren_alder: "alder", dr_alder: "alder", nesta: "mamgu",
    elis_pennant: "elis", madam_gaskell: "gaskell", netrunner_mo: "mo",
    brine_nell: "nell", stoker_di: "di", foreman_jack: "jack", chemist_ria: "ria",
    bearward_otis: "otis", sysadmin_ada: "ada", brother_kellan: "kellan",
    understudy: "npc_amos", the_understudy: "npc_amos", meadow: "cat_meadow",
    bigboy: "cat_bigboy", nurse: "npc_nurse", twelvek: "twelve_k"
  };

  function portraitHuman(d) {
    const g = new Grid(PW, PH);
    // shoulders
    g.ell(16, 34, 13, 9, TOP);
    g.rect(3, 27, 26, 5, TOP);
    g.rect(3, 27, 26, 1.4, TOPD);
    g.rect(13.5, 22, 5, 4, SKD);
    // head
    g.ell(16, 14.5, 8.6, 9.4, SK);
    g.ell(13, 12, 4, 4.6, SK);
    // hair
    const st = d.style;
    if (st === "hardhat") { g.ell(16, 8.4, 10, 6, AC); g.rect(5, 8.4, 22, 2.4, AC); g.rect(5, 10.4, 22, 1.4, AC2); }
    else if (st === "helmet") { g.ell(16, 8, 9.8, 6.4, AC); g.rect(7, 6.6, 18, 2, AC2); }
    else if (st === "helm") { g.ell(16, 12, 9.6, 10, AC); g.rect(14.4, 10, 3.2, 13, OUT); g.rect(7, 15, 18, 2, AC2); }
    else if (st === "cap" || st === "peaked") { g.ell(16, 7.6, 9.6, 5.4, HRD); g.rect(5, 9.4, 22, 2.4, HRD); if (st === "peaked") g.rect(13, 6, 6, 2, AC); }
    else if (st === "hat") { g.ell(16, 8, 8.6, 5.2, HRD); g.rect(2, 11.4, 28, 2.6, HRD); }
    else if (st === "bonnet") { g.ell(16, 10, 10.6, 9.4, WHT); g.ell(16, 14.6, 7.4, 7.2, SK); g.rect(3, 12, 4, 10, WHT); g.rect(25, 12, 4, 10, WHT); }
    else if (st === "swimcap") { g.ell(16, 9.4, 9.4, 7, AC); g.rect(7, 7.6, 18, 2, AC2); }
    else if (st === "hood") { g.ell(16, 12, 11.4, 11.4, TOPD); g.ell(16, 15, 7.8, 8, d.faceless ? OUT : SK); g.rect(4, 22, 24, 3.4, TOPD); }
    else if (st === "headset") { g.ell(16, 9, 9, 6.6, HR); g.rect(4, 12, 3.6, 6, AC); g.rect(24.4, 12, 3.6, 6, AC); g.rect(6, 9, 20, 2, AC2); g.rect(7, 17, 4, 2, GLOW); }
    else if (st === "bun") { g.ell(16, 9.4, 9.4, 7.2, HR); g.ell(16, 3.4, 5, 3.8, HRD); }
    else if (st === "long") { g.ell(16, 9, 9.6, 7.4, HR); g.rect(4.4, 11, 5, 15, HR); g.rect(23, 11, 5, 15, HR); }
    else if (st !== "bald") { g.ell(16, 8.6, 9.4, 6.6, HR); g.rect(6, 10, 3.4, 6, HR); g.rect(23, 10, 3.4, 6, HR); }
    // eyes
    if (d.faceless) {
      g.rect(9, 12, 14, 6, OUT);
      g.rect(11, 14, 3, 2, GLOW); g.rect(19, 14, 3, 2, GLOW);
      for (let y = 10; y < 24; y += 3) g.rect(8, y, 16, 1, TOPD);
    } else {
      g.ell(12.2, 14.6, 2.4, 2.2, WHT); g.ell(19.8, 14.6, 2.4, 2.2, WHT);
      g.ell(12.6, 15, 1.4, 1.6, EYE); g.ell(20.2, 15, 1.4, 1.6, EYE);
      g.set(11.8, 14, WHT); g.set(19.4, 14, WHT);
      g.rect(10.2, 11.6, 4, 1.2, HRD); g.rect(17.8, 11.6, 4, 1.2, HRD);   // brows
      if (d.tired) { g.rect(10.6, 17.4, 3.6, 1, SKD); g.rect(18.2, 17.4, 3.6, 1, SKD); }
      g.rect(15.2, 17, 1.6, 2.4, SKD);                                     // nose
      g.rect(13.4, 20.6, 5.2, 1.2, SKD);                                   // mouth
      if (d.glasses) {
        g.rect(9, 12.6, 6.6, 5.2, OUT); g.rect(16.4, 12.6, 6.6, 5.2, OUT);
        g.rect(10, 13.4, 5, 3.6, WHT); g.rect(17.4, 13.4, 5, 3.6, WHT);
        g.ell(12.6, 15.2, 1.4, 1.6, EYE); g.ell(20, 15.2, 1.4, 1.6, EYE);
        g.rect(15.6, 14.6, 1.4, 1, OUT);
      }
      if (d.beard) { g.rect(8.6, 19, 15, 6, HRD); g.rect(12.6, 19.6, 7, 2.6, SK); g.rect(13.4, 20.8, 5.2, 1.2, SKD); }
    }
    if (d.lanyard) { g.rect(10, 27, 2.4, 5, AC); g.rect(20, 27, 2.4, 5, AC); }
    if (d.labcoat) { g.rect(3, 27, 26, 5, WHT); g.rect(15, 27, 2, 5, BOTD); }
    if (d.mark) { g.ell(16, 29.5, 3, 2.2, OUT); g.rect(14, 29, 4, 1, GLOW); }
    if (d.glow) { g.rect(5, 28.4, 22, 1, GLOW); }
    g.shade(0);
    g.outline(OUT);
    if (d.ghostly) for (let y = 20; y < PH; y++) for (let x = 0; x < PW; x++) if (g.get(x, y) && ((x + y) & 1)) g.set(x, y, 0);
    return g;
  }

  function portraitCat(d) {
    const g = new Grid(PW, PH);
    g.ell(16, 26, 12, 8, SK);
    g.ell(16, 16, 10.4, 9.4, SK);
    g.tri(7.5, 2, 11, 14, 6.6, SKD); g.tri(24.5, 2, 21, 14, 6.6, SKD);
    g.tri(8.5, 5, 11, 13, 3.4, AC); g.tri(23.5, 5, 21, 13, 3.4, AC);
    if (d.patches) { g.ell(16, 20, 6.4, 5, WHT); g.ell(16, 28, 7, 5, WHT); }
    g.ell(12, 15, 2.6, 3, AC); g.ell(20, 15, 2.6, 3, AC);
    g.ell(12, 15.6, 1.1, 2.4, EYE); g.ell(20, 15.6, 1.1, 2.4, EYE);
    g.set(11.2, 14, WHT); g.set(19.2, 14, WHT);
    g.ell(16, 20, 1.6, 1.2, d.grin ? AC : EYE);
    g.line(14.4, 21.6, 16, 22.6, OUT, 1); g.line(17.6, 21.6, 16, 22.6, OUT, 1);
    if (d.grin) { for (let x = -7; x <= 7; x++) g.set(16 + x, 22 + Math.cos(x / 7 * 1.3) * -2.6 + 2.6, AC); }
    for (let i = 0; i < 3; i++) {
      g.line(9, 20 + i * 1.4, 1.5, 17.5 + i * 2.2, WHT, 1);
      g.line(23, 20 + i * 1.4, 30.5, 17.5 + i * 2.2, WHT, 1);
    }
    g.shade(0);
    g.outline(OUT);
    return g;
  }

  function portraitSigil(kind) {
    const cols = {
      oracle: ["#0a1e26", "#12564f", "#2fc8ae", "#eafff9"],
      sleet: ["#101c2a", "#1d4a72", "#4aa8e0", "#dff0ff"],
      vigil: ["#2a1a0e", "#7a4a1c", "#e8a03c", "#fff0d8"],
      arbiter: ["#1c1c22", "#43444e", "#8b8d99", "#f0f0f4"],
      grinmalkin: ["#1a1424", "#4a3468", "#a487cc", "#f5e05a"]
    };
    const c = cols[kind] || cols.oracle;
    const g = new Grid(PW, PH);
    const pal = thingPal({ dark: c[0], mid: c[1], light: c[2], acc: c[3] });
    if (kind === "grinmalkin") {
      g.ell(16, 16, 13, 13, SKD);
      for (let x = -10; x <= 10; x++) { const y = 20 + Math.cos(x / 10 * 1.35) * -5 + 5; g.set(16 + x, y, AC); g.set(16 + x, y + 1, AC); g.set(16 + x, y + 2, AC); }
      for (let i = -4; i <= 4; i++) { const x = i * 2.4, y = 20 + Math.cos(x / 10 * 1.35) * -5 + 5; g.set(16 + x, y, OUT); g.set(16 + x, y + 1, OUT); g.set(16 + x, y + 2, OUT); }
      g.ell(11, 11, 2.6, 2.2, AC); g.ell(21, 11, 2.6, 2.2, AC);
      g.ell(11, 11.4, 1, 2, OUT); g.ell(21, 11.4, 1, 2, OUT);
    } else if (kind === "sleet") {
      g.ell(16, 16, 13, 13, SKD);
      for (let i = 0; i < 3; i++) { g.tri(16, 8 + i * 6, 16, 13 + i * 6, 16, SK); }
      g.rect(4, 15, 24, 1.4, AC);
    } else if (kind === "vigil") {
      g.ell(16, 16, 13, 13, SKD);
      g.ell(16, 16, 8.4, 8.4, SK);
      g.ell(16, 16, 4, 4, AC);
      for (let a = 0; a < 12; a++) { const th = a / 12 * Math.PI * 2; g.set(16 + Math.cos(th) * 11.4, 16 + Math.sin(th) * 11.4, AC); }
    } else if (kind === "arbiter") {
      g.ell(16, 16, 13, 13, SKD);
      g.rect(15, 6, 2, 20, SK);
      g.rect(6, 11, 20, 1.6, SK);
      g.ell(8, 16, 4, 2.4, AC); g.ell(24, 16, 4, 2.4, AC);
    } else {
      g.ell(16, 16, 13, 13, SKD);
      for (let r = 0; r < 3; r++) {
        const rr = 11.5 - r * 3.4;
        for (let a = 0; a < 48; a++) {
          if ((a + r * 3) % 5 === 0) continue;
          const th = a / 48 * Math.PI * 2;
          g.set(16 + Math.cos(th) * rr, 16 + Math.sin(th) * rr, r === 1 ? AC : SK);
        }
      }
      g.ell(16, 16, 2.6, 2.6, AC);
    }
    g.outline(OUT);
    return { grid: g, pal: pal };
  }

  // =================================================================
  // 7. Public API
  // =================================================================
  const PA = {};
  const cache = new Map();
  let builds = 0, hits = 0;

  PA.DIRS = DIRS;
  PA.FRAMES = FRAMES;
  PA.defs = defs;

  function resolve(id) {
    let vid = null, base = String(id);
    const hash = base.indexOf("#");
    if (hash > 0) { vid = base.slice(hash + 1); base = base.slice(0, hash); }
    if (IMPOSTOR[base]) {
      const src = defs[IMPOSTOR[base]];
      if (src) { const d = variantOf(src, "impostor"); d.kind = src.kind; d.id = base; d.impostor = true; d.ghostly = true; return d; }
    }
    let d = defs[base];
    if (!d) return null;
    if (vid) { const v = variantOf(d, vid); v.kind = d.kind; v.id = base + "#" + vid; return v; }
    return d;
  }

  PA.has = function (id) { return !!resolve(id); };
  PA.ids = function () { return Object.keys(defs).concat(Object.keys(IMPOSTOR)); };
  PA.size = function (id) {
    const d = resolve(id);
    if (!d) return { w: HW, h: HH };
    if (d.kind === "animal") return { w: AW, h: AH };
    if (d.kind === "vehicle" || d.kind === "object") return { w: d.w || 44, h: d.h || 22 };
    return { w: HW, h: HH };
  };

  function buildGrid(d, dir, fr) {
    if (d.kind === "animal") return drawAnimal(d, dir, fr);
    if (d.kind === "vehicle" || d.kind === "object") return drawVehicle(d, dir, fr);
    return drawHuman(d, dir, fr);
  }

  PA.frame = function (id, dir, fr) {
    dir = DIRS.indexOf(dir) >= 0 ? dir : "down";
    fr = ((fr | 0) % FRAMES + FRAMES) % FRAMES;
    const key = id + "|" + dir + "|" + fr;
    let c = cache.get(key);
    if (c) { hits++; return c; }
    const d = resolve(id);
    if (!d) {
      c = makeCanvas(HW, HH);
      cache.set(key, c);
      return c;
    }
    let g = buildGrid(d, dir === "right" ? "left" : dir, fr);
    if (dir === "right") g = flipGrid(g);
    const pal = d.kind === "human" ? humanPal(d) : thingPal(d);
    c = g.toCanvas(pal, 1);
    builds++;
    cache.set(key, c);
    return c;
  };

  // whole sheet: 3 columns (frames) x 4 rows (down, left, right, up)
  PA.sheet = function (id) {
    const key = id + "|sheet";
    let c = cache.get(key);
    if (c) { hits++; return c; }
    const d = resolve(id);
    const sz = PA.size(id);
    const big = new Grid(sz.w * FRAMES, sz.h * DIRS.length);
    if (d) {
      for (let r = 0; r < DIRS.length; r++) {
        for (let f = 0; f < FRAMES; f++) {
          const dir = DIRS[r];
          let g = buildGrid(d, dir === "right" ? "left" : dir, f);
          if (dir === "right") g = flipGrid(g);
          for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
            const v = g.d[y * g.w + x];
            if (v) big.d[(r * sz.h + y) * big.w + (f * sz.w + x)] = v;
          }
        }
      }
    }
    const pal = d ? (d.kind === "human" ? humanPal(d) : thingPal(d)) : humanPal({ skin: "#888", hair: "#444", top: "#666", bot: "#444" });
    c = big.toCanvas(pal, 1);
    cache.set(key, c);
    return c;
  };

  PA.portrait = function (key) {
    key = String(key || "player");
    const ck = "portrait|" + key;
    let c = cache.get(ck);
    if (c) { hits++; return c; }
    const id = PORTRAIT_ALIAS[key] || key;
    let g = null, pal = null;
    if (id === "oracle" || id === "pippin" || id === "oracle_terminal" || id === "sleet" || id === "vigil" || id === "arbiter" || id === "grinmalkin" || id === "grinmalkin_wall") {
      const kind = (id === "oracle_terminal" || id === "pippin") ? "oracle" : (id === "grinmalkin_wall" ? "grinmalkin" : id);
      const s = portraitSigil(kind);
      g = s.grid; pal = s.pal;
    } else {
      const d = resolve(id);
      if (d && d.kind === "animal") { g = portraitCat(d); pal = thingPal(d); }
      else if (d && d.kind === "human") { g = portraitHuman(d); pal = humanPal(d); }
      else if (MQ.MonsterArt && MQ.MonsterArt.has && MQ.MonsterArt.has(id)) {
        c = MQ.MonsterArt.sprite(id, "icon");
        cache.set(ck, c);
        return c;
      } else { const s = portraitSigil("oracle"); g = s.grid; pal = s.pal; }
    }
    c = g.toCanvas(pal, 1);
    builds++;
    cache.set(ck, c);
    return c;
  };

  // Draw a walk frame with its feet at (x, y).
  PA.draw = function (ctx, id, dir, fr, x, y, scale) {
    const c = PA.frame(id, dir, fr);
    if (!c) return;
    scale = scale || 2;
    const w = c.width * scale, h = c.height * scale;
    ctx.drawImage(c, Math.round(x - w * 0.5), Math.round(y - h), w, h);
  };

  PA.warm = function (ids) {
    const list = ids || ["player", "cat_meadow", "cat_bigboy", "vex", "npc_walker"];
    for (let i = 0; i < list.length; i++) {
      for (let r = 0; r < DIRS.length; r++) for (let f = 0; f < FRAMES; f++) {
        try { PA.frame(list[i], DIRS[r], f); } catch (e) { MQ.warn("[PeopleArt] " + list[i] + " failed", e); }
      }
    }
    try { PA.portrait("player"); } catch (e) { /* never fatal */ }
  };
  PA.clearCache = function () { cache.clear(); };
  PA.stats = function () { return { cached: cache.size, builds: builds, hits: hits, sprites: Object.keys(defs).length }; };

  MQ.PeopleArt = PA;
})();
