// =============================================================
// MonsterQuest v2 — js/art/monsters.js   (art workstream)
//
// MQ.MonsterArt — every species gets a front sprite (battle), a back
// sprite and a dex icon, drawn procedurally from `species.gen`
// {body, size, feats, palette} with hand-tuned overrides for the
// starters, the legendaries, the cats, GRINMALKIN and the DARKBYTE
// constructs.
//
// Public API
//   MQ.MonsterArt.sprite(id, 'front'|'back'|'icon', {shiny})  → canvas (cached)
//   MQ.MonsterArt.draw(ctx, id, kind, x, y, scale, {shiny, flip, alpha})
//   MQ.MonsterArt.silhouette(id, kind, colour)                → canvas (cached)
//   MQ.MonsterArt.palette(id, shiny)  .archetypeOf(id)  .has(id)  .ids()
//   MQ.MonsterArt.warm(ids)  .clearCache()  .stats()  .SIZES
//
// Everything is deterministic: the same species id always produces the
// same pixels, so a save file's monsters never change appearance.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const SIZES = { front: 64, back: 52, icon: 20 };

  // ---- colour slots -------------------------------------------------
  const E = 0, OUT = 1, DK = 2, MD = 3, LT = 4, AC = 5, GL = 6, EYE = 7,
        SHN = 8, SH = 9, HI = 10, TY = 11, TYL = 12, BLK = 13, WHT = 14,
        MET = 15, MEL = 16;
  const NSLOT = 17;

  // =================================================================
  // 1. Pixel grid
  // =================================================================
  function Grid(w, h) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); }
  const GP = Grid.prototype;
  GP.set = function (x, y, v) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.d[y * this.w + x] = v;
  };
  GP.get = function (x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[y * this.w + x];
  };
  // paint only where something is already drawn (shading / markings)
  GP.over = function (x, y, v) { if (this.get(x, y)) this.set(x, y, v); };
  GP.rect = function (x, y, w, h, v) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, v);
  };
  GP.ell = function (cx, cy, rx, ry, v) {
    if (rx < 0.5) rx = 0.5; if (ry < 0.5) ry = 0.5;
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) this.set(x, y, v);
      }
    }
  };
  GP.ellOver = function (cx, cy, rx, ry, v) {
    if (rx < 0.5) rx = 0.5; if (ry < 0.5) ry = 0.5;
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) this.over(x, y, v);
      }
    }
  };
  GP.line = function (x0, y0, x1, y1, v, th) {
    th = th || 1;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      if (th <= 1) this.set(x, y, v); else this.ell(x, y, th * 0.5, th * 0.5, v);
    }
  };
  GP.lineOver = function (x0, y0, x1, y1, v) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.over(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, v);
  };
  // isoceles triangle from apex (ax,ay) to a base of width bw at by
  GP.tri = function (ax, ay, bx, by, bw, v) {
    const n = Math.max(Math.abs(by - ay), 1);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const cx = ax + (bx - ax) * t, cy = ay + (by - ay) * t, hw = bw * 0.5 * t;
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) this.set(x, cy, v);
    }
  };
  GP.mirror = function () {
    const w = this.w, h = this.h, half = Math.floor(w / 2);
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < half; x++) this.d[row + w - 1 - x] = this.d[row + x];
    }
  };
  GP.outline = function (v) {
    const w = this.w, h = this.h, src = this.d, out = new Uint8Array(src);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (src[i]) continue;
        if ((x > 0 && src[i - 1]) || (x < w - 1 && src[i + 1]) ||
            (y > 0 && src[i - w]) || (y < h - 1 && src[i + w])) out[i] = v;
      }
    }
    this.d = out;
  };
  // Top-lit / bottom-shadowed volume pass over cells painted `body`.
  GP.shade = function (body) {
    const w = this.w, h = this.h, src = this.d, out = new Uint8Array(src), cx = w * 0.5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (src[i] !== body) continue;
        const up = y > 0 ? src[i - w] : 0, dn = y < h - 1 ? src[i + w] : 0;
        const lf = x > 0 ? src[i - 1] : 0, rt = x < w - 1 ? src[i + 1] : 0;
        if (!up) out[i] = LT;
        else if (!dn) out[i] = DK;
        else if (!rt && x >= cx) out[i] = DK;
        else if (!lf && x < cx) out[i] = LT;
        else if (!rt || !lf) out[i] = SH;
        else out[i] = MD;
      }
    }
    this.d = out;
  };
  GP.count = function () { let n = 0; for (let i = 0; i < this.d.length; i++) if (this.d[i]) n++; return n; };

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  GP.toCanvas = function (pal, scale) {
    scale = scale || 1;
    const c = makeCanvas(this.w * scale, this.h * scale);
    const g = c.getContext("2d");
    // one fill per colour keeps the draw-call count sane on the stub ctx
    for (let v = 1; v < NSLOT; v++) {
      const col = pal[v];
      if (!col) continue;
      let used = false;
      for (let i = 0; i < this.d.length; i++) { if (this.d[i] === v) { used = true; break; } }
      if (!used) continue;
      g.fillStyle = col;
      for (let y = 0; y < this.h; y++) {
        let run = 0;
        for (let x = 0; x <= this.w; x++) {
          const hit = x < this.w && this.d[y * this.w + x] === v;
          if (hit) run++;
          else if (run) { g.fillRect((x - run) * scale, y * scale, run * scale, scale); run = 0; }
        }
      }
    }
    return c;
  };

  // =================================================================
  // 2. Palettes
  // =================================================================
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  function hslToHex(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return U.rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
  }
  function hueShift(hex, dh, ds, dl) {
    const c = U.hexToRgb(hex);
    if (!c) return hex;
    const hsl = rgbToHsl(c.r, c.g, c.b);
    let h = (hsl[0] + dh) % 1; if (h < 0) h += 1;
    return hslToHex(h, U.clamp(hsl[1] * (1 + (ds || 0)), 0, 1), U.clamp(hsl[2] + (dl || 0), 0.04, 0.96));
  }

  const FALLBACK_PAL = ["#3f3a34", "#7c766c", "#b7b0a4", "#d8d2c4"];

  // 4 source colours [dark, mid, light, accent] → the full 17-slot ramp
  function buildPalette(base, typeCol, shiny) {
    let dark = base[0] || FALLBACK_PAL[0], mid = base[1] || FALLBACK_PAL[1];
    let light = base[2] || FALLBACK_PAL[2], acc = base[3] || FALLBACK_PAL[3];
    if (shiny) {
      const dh = shiny.dh, ds = shiny.ds, dl = shiny.dl;
      dark = hueShift(dark, dh, ds, dl * 0.4);
      mid = hueShift(mid, dh, ds, dl);
      light = hueShift(light, dh, ds, dl);
      acc = hueShift(acc, dh + 0.42, ds + 0.25, dl * 0.5);
      typeCol = hueShift(typeCol, dh, ds, dl);
    }
    const pal = new Array(NSLOT);
    pal[E] = null;
    pal[OUT] = U.shade(dark, -0.55);
    pal[DK] = dark;
    pal[MD] = mid;
    pal[LT] = light;
    pal[AC] = acc;
    pal[GL] = U.mix(acc, "#ffffff", 0.45);
    pal[EYE] = "#171420";
    pal[SHN] = "#f4f8ff";
    pal[SH] = U.mix(mid, dark, 0.55);
    pal[HI] = U.mix(light, "#ffffff", 0.5);
    pal[TY] = typeCol;
    pal[TYL] = U.mix(typeCol, "#ffffff", 0.5);
    pal[BLK] = "#100e14";
    pal[WHT] = "#f6f4ee";
    pal[MET] = U.mix(mid, "#8d97a6", 0.55);
    pal[MEL] = U.mix(light, "#dfe7f2", 0.6);
    return pal;
  }

  // =================================================================
  // 3. Body name → archetype + build hints
  // =================================================================
  // hints: stance low|tall  neck long  ears tall|round|none  horns  mane
  //        squat  wings  tail whip|bush|fan|none  legs long|short
  const B = {};
  function body(names, arch, hint) {
    const list = names.split(" ");
    for (let i = 0; i < list.length; i++) B[list[i]] = { arch: arch, hint: hint || {} };
  }
  body("cat kitten wildcat lynx", "cat");
  body("hare", "quadruped", { ears: "tall", legs: "long", tail: "none" });
  body("rat", "quadruped", { ears: "round", tail: "whip", small: true });
  body("hedgehog", "quadruped", { spines: true, squat: true });
  body("cub bear panda mossbear", "quadruped", { heavy: true, ears: "round" });
  body("beast hound", "quadruped", { fangs: true, mane: true });
  body("stag", "quadruped", { horns: "antler", legs: "long", neck: "long" });
  body("pony horse mare", "quadruped", { legs: "long", mane: true, neck: "long" });
  body("ox bull", "quadruped", { heavy: true, horns: "curved", neck: "short" });
  body("ram sheep lamb", "quadruped", { fleece: true, horns: "coil" });
  body("otter otter-pup", "quadruped", { sleek: true, tail: "whip", legs: "short" });
  body("fawn", "quadruped", { legs: "long", spots: true, ears: "tall" });
  body("giraffe", "quadruped", { neck: "long", legs: "long", spots: true });
  body("newt salamander toad", "quadruped", { stance: "low", legs: "short", squat: true });
  body("bat", "bird", { batwing: true, ears: "tall" });
  body("pigeon grouse duckling cygnet swan egret curlew heron heron-chick", "bird");
  body("owl owlet", "bird", { round: true, bigEyes: true });
  body("kestrel peregrine stormbird falconet", "bird", { raptor: true });
  body("penguin", "bird", { stance: "upright", squat: true });
  body("phoenix", "bird", { raptor: true, plume: true });
  body("griffin", "bird", { raptor: true, quad: true });
  body("moth", "insect", { wings: "moth" });
  body("beetle stag-beetle", "insect", { shell: true, mandibles: true });
  body("spider", "insect", { legs8: true });
  body("crab", "insect", { claws: true, squat: true });
  body("mite mite-queen", "insect", { legs8: true, small: true });
  body("glowworm larva worm", "serpent", { segments: true, glow: true });
  body("eel", "serpent", { fins: true, sleek: true });
  body("blob heap cloudlet particle spark star tide", "blob");
  body("loco tank-engine engine", "machine", { loco: true });
  body("turbine wheel", "machine", { wheel: true });
  body("dish", "machine", { dish: true });
  body("camera drone", "machine", { lens: true, hover: true });
  body("lever-frame sleeper spool loom brush inkwell mirror stack house viaduct helm bell", "machine", { frame: true });
  body("core", "machine", { orb: true, hover: true });
  body("imp", "biped", { small: true, horns: "small" });
  body("knight legionary centurion", "biped", { armour: true, helm: true });
  body("puppet", "biped", { strings: true, thin: true });
  body("druid lady chorister bogbody", "biped", { robe: true });
  body("golem", "biped", { armour: true, heavy: true, rock: true });
  body("drake", "biped", { wings: "bat", tail: "whip", fangs: true });
  body("husk", "ghost", { tatty: true });
  body("wraith phantom spirit lurker herald manuscript naiad", "ghost");
  body("wisp sprite", "ghost", { small: true, glow: true });
  body("fish trout salmon perch minnow sturgeon lurefish pike leviathan", "fish");
  body("treant stump acorn hedge", "plant");
  body("stone berg crystal shard dolmen cross pillar folly", "rock");
  body("gargoyle grotesque", "rock", { wings: "bat", face: true });

  const KEYWORDS = [
    ["salt", /salt|halite|rime|crust|brine-pan|crystal/],
    ["arc", /arc|spark|static|volt|lightning|charge|electr|pantograph|magnet/],
    ["ember", /ember|smoulder|firebox|flare|brazier|coal|heat|steam|boiler|furnace|kindl|white-heat/],
    ["wing", /wing|primaries|plume(?!-crest)/],
    ["fog", /fog|mist|vapour|smog|cloud|gas|fume|halo|aura|shroud|veil/],
    ["cyber", /scan|chip|port|telemetry|packet|circuit|led|lens|status|pulse|signal|render|copy|credential|waveform|static-outline|index|attention|targeted|tracker|tracking/],
    ["horn", /horn|antler|crest|crown|coil|spine|tower|capstone|stalk/],
    ["eyes", /eye|glint|goggle|lamp-eyes|visor/],
    ["metal", /plate|rivet|brass|iron|armour|steel|rail|chrome|bronze|verdigris|magnet|buffer|girder|beam/],
    ["silk", /silk|thread|web|cocoon|bobbin|shuttle|lace|spool|muslin|cloth|string|ribbon/],
    ["leaf", /moss|leaf|fern|root|bramble|thorn|vine|berry|bark|oak|seed|mistletoe|stem|reed|fungal|cap/],
    ["lamp", /lamp|lantern|glow|beacon|light|candle|luminous|brow-lamp|marsh-glow/],
    ["shell", /shell|carapace|scute|scale|chitin|hide|pelt|fleece|coat|plumage|mantle/],
    ["drip", /drip|sludge|ooze|slime|sour|poison|peat|bog|mud|weed/],
    ["stone", /stone|grit|sandstone|masonry|mortar|brick|carved|chisel|slab|column|rubble|seam/],
    ["tail", /tail/],
    ["many", /many|multi|swarm|cluster|array|nested|eight/]
  ];
  function scanFeats(feats) {
    const flags = {};
    const joined = (feats || []).join(" ").toLowerCase();
    for (let i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][1].test(joined)) flags[KEYWORDS[i][0]] = true;
    flags.raw = joined;
    return flags;
  }

  // =================================================================
  // 4. Archetype builders
  //    body(P)  — symmetric silhouette in MD (left half + centre)
  //    extra(P) — asymmetric bits, drawn after the mirror
  //    P.head   — {x,y,r} in pixels so the face layer knows where to look
  // =================================================================
  const ARCH = {};

  function A(name, def) { ARCH[name] = def; }

  // ---- quadruped ---------------------------------------------------
  A("quadruped", {
    body: function (P) {
      const f = P.f, h = P.hint, low = h.stance === "low";
      const bodyY = low ? 0.72 : 0.64, bodyRy = (h.heavy ? 0.20 : 0.17) * f, bodyRx = (h.heavy ? 0.30 : 0.27) * f;
      const legH = (h.legs === "long" ? 0.24 : h.legs === "short" ? 0.10 : 0.16) * f;
      const ground = 0.94;
      // legs (left pair; mirrored)
      const legW = (h.heavy ? 0.09 : 0.065) * f;
      P.R(0.30 - legW * 0.5, ground - legH, legW, legH, MD);
      P.R(0.19 - legW * 0.5, ground - legH * 0.92, legW, legH * 0.92, MD);
      P.E(0.30, ground - 0.01, legW * 0.75, 0.022 * f, MD);
      P.E(0.19, ground - 0.01, legW * 0.75, 0.022 * f, MD);
      // barrel
      P.E(0.5, bodyY, bodyRx, bodyRy, MD);
      if (h.fleece) { for (let i = 0; i < 5; i++) P.E(0.28 + i * 0.055, bodyY - bodyRy * 0.75, 0.055 * f, 0.05 * f, MD); }
      // neck + head
      const neckLong = h.neck === "long";
      const headY = neckLong ? 0.26 : 0.34, headR = (h.small ? 0.12 : 0.145) * f;
      P.L(0.5, bodyY - bodyRy * 0.6, 0.5, headY + headR * 0.4, MD, (neckLong ? 0.10 : 0.15) * f);
      P.E(0.5, headY, headR * 1.02, headR * 0.94, MD);
      P.E(0.5, headY + headR * 0.45, headR * 0.62, headR * 0.5, MD); // muzzle
      P.head = { x: 0.5 * P.S, y: headY * P.S, r: headR * P.S, muzzle: true };
      P.ground = ground;
      // ears
      if (h.ears === "tall") { P.T(0.40, headY - headR * 2.3, 0.44, headY - headR * 0.2, headR * 0.66, MD); }
      else if (h.ears === "round") { P.E(0.40, headY - headR * 0.78, headR * 0.42, headR * 0.42, MD); }
      else { P.T(0.41, headY - headR * 1.35, 0.44, headY - headR * 0.1, headR * 0.7, MD); }
      // horns
      if (h.horns === "antler") {
        P.L(0.44, headY - headR * 0.9, 0.34, headY - headR * 2.6, AC, 0.022 * f);
        P.L(0.38, headY - headR * 1.8, 0.30, headY - headR * 2.1, AC, 0.018 * f);
        P.L(0.365, headY - headR * 2.3, 0.30, headY - headR * 3.0, AC, 0.018 * f);
      } else if (h.horns === "curved") {
        P.L(0.40, headY - headR * 0.7, 0.29, headY - headR * 1.1, AC, 0.030 * f);
        P.L(0.29, headY - headR * 1.1, 0.25, headY - headR * 0.2, AC, 0.026 * f);
      } else if (h.horns === "coil") {
        P.E(0.36, headY + headR * 0.1, headR * 0.44, headR * 0.44, AC);
        P.E(0.36, headY + headR * 0.1, headR * 0.20, headR * 0.20, DK);
      } else if (h.horns === "small") {
        P.T(0.42, headY - headR * 1.5, 0.44, headY - headR * 0.5, headR * 0.4, AC);
      }
      if (h.mane) { for (let i = 0; i < 4; i++) P.E(0.5 - 0.035 * i, headY + headR * 0.9 + 0.02 * i, headR * 0.4, headR * 0.34, DK); }
      if (h.spines) { for (let i = 0; i < 5; i++) P.T(0.30 + i * 0.05, bodyY - bodyRy - 0.09 * f, 0.31 + i * 0.05, bodyY - bodyRy * 0.4, 0.05 * f, AC); }
    },
    extra: function (P) {
      const h = P.hint, f = P.f;
      if (h.tail === "none") return;
      const y = (h.stance === "low" ? 0.74 : 0.64);
      if (h.tail === "whip") P.L(0.76, y, 0.90, y - 0.16 * f, MD, 0.035 * f);
      else if (h.sleek) P.L(0.76, y + 0.02, 0.92, y + 0.06, MD, 0.05 * f);
      else { P.E(0.80, y - 0.05 * f, 0.055 * f, 0.07 * f, MD); P.L(0.75, y, 0.80, y - 0.04, MD, 0.05 * f); }
    }
  });

  // ---- cat ---------------------------------------------------------
  A("cat", {
    body: function (P) {
      const f = P.f, ground = 0.95;
      P.E(0.5, 0.72, 0.24 * f, 0.19 * f, MD);          // seated haunches
      P.E(0.34, 0.86, 0.075 * f, 0.055 * f, MD);        // front paw
      P.R(0.315, 0.72, 0.05 * f, 0.16 * f, MD);         // front leg
      P.E(0.5, 0.55, 0.17 * f, 0.15 * f, MD);           // chest
      const headY = 0.34, headR = 0.155 * f;
      P.E(0.5, headY, headR * 1.12, headR, MD);
      P.T(0.375, headY - headR * 1.9, 0.42, headY - headR * 0.25, headR * 0.62, MD); // ear
      P.head = { x: 0.5 * P.S, y: headY * P.S, r: headR * P.S, cat: true };
      P.ground = ground;
      P.O(0.5, headY - headR * 0.35, headR * 0.7, headR * 0.4, LT);
    },
    extra: function (P) {
      const f = P.f;
      P.L(0.74, 0.80, 0.88, 0.70, MD, 0.055 * f);
      P.L(0.88, 0.70, 0.90, 0.55, MD, 0.05 * f);
      P.E(0.895, 0.53, 0.035 * f, 0.035 * f, MD);
    }
  });

  // ---- biped -------------------------------------------------------
  A("biped", {
    body: function (P) {
      const f = P.f, h = P.hint, ground = 0.95;
      const torsoY = 0.60, torsoRx = (h.heavy ? 0.22 : h.thin ? 0.13 : 0.17) * f, torsoRy = 0.20 * f;
      // legs
      const legW = (h.heavy ? 0.09 : 0.06) * f;
      if (!h.robe) {
        P.R(0.40 - legW * 0.5, torsoY + torsoRy * 0.7, legW, 0.28 * f, MD);
        P.E(0.40, ground - 0.015, legW * 0.9, 0.025 * f, MD);
      } else {
        P.T(0.5, torsoY - torsoRy * 0.2, 0.5, ground, (torsoRx * 2.6), MD);
      }
      P.E(0.5, torsoY, torsoRx, torsoRy, MD);
      // shoulders + arms
      P.E(0.5, torsoY - torsoRy * 0.75, torsoRx * 0.95, torsoRy * 0.45, MD);
      P.L(0.5 - torsoRx * 0.85, torsoY - torsoRy * 0.55, 0.5 - torsoRx * 1.25, torsoY + torsoRy * 0.75, MD, (h.heavy ? 0.075 : 0.05) * f);
      P.E(0.5 - torsoRx * 1.3, torsoY + torsoRy * 0.85, 0.04 * f, 0.04 * f, MD);
      const headY = torsoY - torsoRy - 0.09 * f, headR = 0.125 * f;
      P.L(0.5, torsoY - torsoRy, 0.5, headY, MD, 0.06 * f);
      P.E(0.5, headY, headR, headR * 1.05, MD);
      P.head = { x: 0.5 * P.S, y: headY * P.S, r: headR * P.S };
      P.ground = ground;
      if (h.helm) {
        P.E(0.5, headY - headR * 0.25, headR * 1.12, headR * 0.8, MET);
        P.R(0.5 - headR * 1.15, headY - headR * 0.1, headR * 2.3, headR * 0.16, MEL);
        P.T(0.5, headY - headR * 2.2, 0.5, headY - headR * 0.9, headR * 0.5, AC);
      }
      if (h.armour) {
        P.R(0.5 - torsoRx * 0.8, torsoY - torsoRy * 0.4, torsoRx * 1.6, torsoRy * 1.1, MET);
        P.R(0.5 - torsoRx * 0.8, torsoY - torsoRy * 0.4, torsoRx * 1.6, 0.02 * f, MEL);
      }
      if (h.robe) {
        P.L(0.5 - torsoRx * 1.4, ground - 0.02, 0.5 + torsoRx * 1.4, ground - 0.02, DK, 0.03 * f);
        P.E(0.5, headY + headR * 0.15, headR * 1.35, headR * 1.25, DK); // hood
        P.E(0.5, headY + headR * 0.28, headR * 0.82, headR * 0.85, BLK);
        P.head.hooded = true;
      }
      if (h.horns === "small") { P.T(0.5 - headR * 0.7, headY - headR * 1.9, 0.5 - headR * 0.55, headY - headR * 0.6, headR * 0.38, AC); }
      if (h.rock) { for (let i = 0; i < 4; i++) P.E(0.5 - torsoRx * (0.9 - i * 0.2), torsoY - torsoRy * 0.9 + i * 0.05, 0.04 * f, 0.035 * f, DK); }
    },
    extra: function (P) {
      const f = P.f, h = P.hint;
      if (h.tail === "whip") { P.L(0.63, 0.74, 0.82, 0.62, MD, 0.035 * f); P.T(0.88, 0.56, 0.83, 0.62, 0.05 * f, AC); }
      if (h.strings) { for (let i = 0; i < 3; i++) P.L(0.34 + i * 0.16, 0.02, 0.34 + i * 0.16, 0.34, SHN, 0.008 * f); }
    }
  });

  // ---- serpent -----------------------------------------------------
  A("serpent", {
    body: function (P) {
      const f = P.f, S = P.S, seg = P.hint.segments;
      const th = 0.085 * f;
      let px = 0.5, py = 0.92;
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = 0.5 + Math.sin(t * Math.PI * 1.7 + 0.6) * 0.20 * f * (1 - t * 0.35);
        const y = 0.92 - t * 0.62;
        pts.push([x, y]);
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const w = th * (1.25 - i * 0.055);
        P.L(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], MD, w * 2);
      }
      P.E(0.5, 0.93, 0.16 * f, 0.045 * f, MD); // coil at the base
      const hx = pts[10][0], hy = pts[10][1] - 0.03 * f, hr = 0.115 * f;
      P.E(hx, hy, hr * 1.15, hr * 0.95, MD);
      P.head = { x: hx * S, y: hy * S, r: hr * S, asym: true };
      P.ground = 0.95;
      if (seg) for (let i = 1; i < 9; i++) P.LO(pts[i][0] - 0.07 * f, pts[i][1], pts[i][0] + 0.07 * f, pts[i][1], SH);
      if (P.hint.fins) { P.T(hx - 0.02, hy - 0.02, hx - 0.14 * f, hy - 0.12 * f, 0.10 * f, AC); }
    },
    extra: null
  });

  // ---- bird --------------------------------------------------------
  A("bird", {
    body: function (P) {
      const f = P.f, h = P.hint, S = P.S;
      const upright = h.stance === "upright" || h.squat;
      const bodyY = upright ? 0.62 : 0.63, bodyRx = (h.round ? 0.23 : 0.19) * f, bodyRy = (h.round ? 0.22 : 0.24) * f;
      // legs
      if (!h.quad) {
        P.R(0.44, bodyY + bodyRy * 0.75, 0.028 * f, 0.16 * f, AC);
        P.L(0.40, 0.945, 0.485, 0.945, AC, 0.026 * f);
      } else {
        P.R(0.36, bodyY + bodyRy * 0.5, 0.07 * f, 0.24 * f, MD);
        P.E(0.395, 0.945, 0.055 * f, 0.028 * f, AC);
      }
      P.E(0.5, bodyY, bodyRx, bodyRy, MD);
      // wings (folded, swept back)
      const wr = h.raptor ? 0.30 : 0.24;
      P.E(0.5 - bodyRx * 0.85, bodyY - bodyRy * 0.1, wr * 0.42 * f, bodyRy * 0.92, MD);
      P.T(0.5 - bodyRx * 1.05, bodyY + bodyRy * 1.05, 0.5 - bodyRx * 0.8, bodyY - bodyRy * 0.5, 0.12 * f, MD);
      const headY = bodyY - bodyRy - 0.10 * f, headR = (h.bigEyes ? 0.155 : 0.115) * f;
      P.L(0.5, bodyY - bodyRy * 0.8, 0.5, headY, MD, (h.round ? 0.14 : 0.09) * f);
      P.E(0.5, headY, headR, headR * (h.round ? 1.0 : 0.95), MD);
      P.head = { x: 0.5 * S, y: headY * S, r: headR * S, bigEyes: h.bigEyes };
      P.ground = 0.95;
      // beak
      if (h.raptor) { P.T(0.5, headY + headR * 1.25, 0.5, headY + headR * 0.15, headR * 0.62, AC); P.E(0.5, headY + headR * 1.0, headR * 0.16, headR * 0.2, DK); }
      else { P.T(0.5, headY + headR * 1.55, 0.5, headY + headR * 0.3, headR * 0.52, AC); }
      if (h.plume) { for (let i = 0; i < 3; i++) P.T(0.5 - 0.03 - i * 0.03, headY - headR * (2.4 - i * 0.4), 0.5 - i * 0.02, headY - headR * 0.5, 0.05 * f, AC); }
      if (h.ears === "tall") { P.T(0.44, headY - headR * 1.7, 0.46, headY - headR * 0.4, headR * 0.4, MD); }
    },
    extra: function (P) {
      const f = P.f, h = P.hint;
      P.T(0.60, 0.88, 0.55, 0.74, 0.14 * f, MD);
      if (h.batwing) { P.L(0.18, 0.36, 0.34, 0.52, MD, 0.03 * f); P.L(0.82, 0.36, 0.66, 0.52, MD, 0.03 * f); }
    }
  });

  // ---- insect ------------------------------------------------------
  A("insect", {
    body: function (P) {
      const f = P.f, h = P.hint, S = P.S;
      const abY = 0.72, thY = 0.52, headY = 0.32;
      const abRx = 0.20 * f, abRy = 0.17 * f;
      // legs
      const nLeg = h.legs8 ? 4 : 3;
      for (let i = 0; i < nLeg; i++) {
        const y = thY + i * 0.075 * f;
        P.L(0.5 - 0.10 * f, y, 0.5 - 0.28 * f, y + 0.10 * f, MD, 0.022 * f);
        P.L(0.5 - 0.28 * f, y + 0.10 * f, 0.5 - 0.31 * f, y + 0.19 * f, MD, 0.02 * f);
      }
      P.E(0.5, abY, abRx, abRy, MD);
      P.E(0.5, thY, 0.145 * f, 0.125 * f, MD);
      const headR = 0.115 * f;
      P.E(0.5, headY, headR * 1.1, headR, MD);
      P.head = { x: 0.5 * S, y: headY * S, r: headR * S, insect: true };
      P.ground = 0.94;
      if (h.shell) {
        P.E(0.5, abY - abRy * 0.15, abRx * 0.95, abRy * 0.9, AC);
        P.R(0.5 - 0.008 * S, (abY - abRy) * S / S, 0.016, 0, DK);
        P.L(0.5, abY - abRy * 1.0, 0.5, abY + abRy * 0.75, DK, 0.02 * f);
      }
      if (h.mandibles) { P.T(0.44, headY + headR * 1.7, 0.46, headY + headR * 0.4, headR * 0.4, AC); }
      if (h.claws) { P.E(0.5 - 0.26 * f, thY - 0.03, 0.075 * f, 0.055 * f, AC); P.T(0.5 - 0.33 * f, thY - 0.09, 0.5 - 0.28 * f, thY - 0.03, 0.05 * f, AC); }
      if (h.wings === "moth" || h.wings === true) {
        P.E(0.5 - 0.20 * f, 0.50, 0.19 * f, 0.20 * f, LT);
        P.E(0.5 - 0.15 * f, 0.68, 0.13 * f, 0.13 * f, LT);
      }
      // antennae
      P.L(0.5 - headR * 0.5, headY - headR * 0.75, 0.5 - headR * 1.9, headY - headR * 2.4, MD, 0.018 * f);
      P.E(0.5 - headR * 2.0, headY - headR * 2.6, 0.022 * f, 0.022 * f, AC);
    },
    extra: null
  });

  // ---- blob --------------------------------------------------------
  A("blob", {
    body: function (P) {
      const f = P.f, S = P.S, rnd = P.rnd;
      const cy = 0.66, rx = 0.29 * f, ry = 0.25 * f;
      P.E(0.5, cy, rx, ry, MD);
      for (let i = 0; i < 4; i++) {
        const a = 0.9 + i * 0.5;
        P.E(0.5 - Math.cos(a) * rx * 0.75, cy - Math.sin(a) * ry * 0.75, rx * (0.22 + rnd() * 0.14), ry * (0.24 + rnd() * 0.14), MD);
      }
      P.E(0.5, cy + ry * 0.85, rx * 0.95, ry * 0.35, MD);
      P.head = { x: 0.5 * S, y: (cy - ry * 0.30) * S, r: 0.17 * f * S, blob: true };
      P.ground = 0.94;
      P.O(0.5 - rx * 0.4, cy - ry * 0.45, rx * 0.26, ry * 0.20, HI);
    },
    extra: null
  });

  // ---- machine -----------------------------------------------------
  A("machine", {
    body: function (P) {
      const f = P.f, h = P.hint, S = P.S;
      const ground = 0.94;
      if (h.orb || h.hover) {
        P.E(0.5, 0.52, 0.24 * f, 0.24 * f, MET);
        P.E(0.5, 0.52, 0.15 * f, 0.15 * f, AC);
        P.E(0.5, 0.52, 0.08 * f, 0.08 * f, GL);
        for (let i = 0; i < 3; i++) P.E(0.5 - 0.28 * f, 0.44 + i * 0.09, 0.035 * f, 0.035 * f, MET);
        P.E(0.5, 0.90, 0.20 * f, 0.035 * f, DK);
        P.head = { x: 0.5 * S, y: 0.52 * S, r: 0.15 * f * S, machine: true, single: true };
      } else if (h.dish) {
        P.E(0.5, 0.42, 0.30 * f, 0.26 * f, MET);
        P.E(0.5, 0.44, 0.24 * f, 0.20 * f, MEL);
        P.L(0.5, 0.44, 0.5, 0.20, MET, 0.03 * f);
        P.E(0.5, 0.19, 0.05 * f, 0.05 * f, AC);
        P.R(0.5 - 0.05 * f, 0.62, 0.10 * f, 0.28 * f, MET);
        P.T(0.5, 0.62, 0.5, ground, 0.34 * f, MET);
        P.head = { x: 0.5 * S, y: 0.42 * S, r: 0.16 * f * S, machine: true, single: true };
      } else if (h.wheel) {
        P.E(0.5, 0.58, 0.30 * f, 0.30 * f, MET);
        P.E(0.5, 0.58, 0.20 * f, 0.20 * f, MD);
        P.E(0.5, 0.58, 0.07 * f, 0.07 * f, AC);
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI / 4;
          P.L(0.5 - Math.cos(a) * 0.27 * f, 0.58 - Math.sin(a) * 0.27 * f, 0.5 + Math.cos(a) * 0.27 * f, 0.58 + Math.sin(a) * 0.27 * f, MEL, 0.02 * f);
        }
        P.head = { x: 0.5 * S, y: 0.58 * S, r: 0.13 * f * S, machine: true, single: true };
      } else if (h.loco) {
        P.R(0.5 - 0.30 * f, 0.46, 0.60 * f, 0.30 * f, MD);         // boiler
        P.E(0.5 - 0.30 * f, 0.61, 0.09 * f, 0.15 * f, MD);
        P.R(0.5 - 0.10 * f, 0.30, 0.20 * f, 0.18 * f, MET);        // cab
        P.R(0.5 - 0.26 * f, 0.30, 0.09 * f, 0.17 * f, MET);        // chimney
        P.E(0.5 - 0.215 * f, 0.29, 0.065 * f, 0.03 * f, MET);
        P.E(0.5 - 0.14 * f, 0.83, 0.11 * f, 0.11 * f, MET);        // wheels
        P.E(0.5 + 0.16 * f, 0.85, 0.085 * f, 0.085 * f, MET);
        P.R(0.5 - 0.32 * f, 0.76, 0.64 * f, 0.05 * f, DK);
        P.head = { x: 0.5 * S, y: 0.55 * S, r: 0.14 * f * S, machine: true };
      } else if (h.lens) {
        P.R(0.5 - 0.22 * f, 0.38, 0.44 * f, 0.28 * f, MET);
        P.E(0.5, 0.52, 0.13 * f, 0.13 * f, BLK);
        P.E(0.5, 0.52, 0.085 * f, 0.085 * f, AC);
        P.E(0.5 - 0.04 * f, 0.49, 0.03 * f, 0.03 * f, SHN);
        P.L(0.5, 0.38, 0.5, 0.22, MET, 0.028 * f);
        P.R(0.5 - 0.13 * f, 0.16, 0.26 * f, 0.07 * f, MET);
        P.E(0.5, 0.86, 0.18 * f, 0.045 * f, DK);
        P.head = { x: 0.5 * S, y: 0.52 * S, r: 0.14 * f * S, machine: true, single: true, noEyes: true };
      } else {
        // frame / structure
        P.R(0.5 - 0.27 * f, 0.36, 0.54 * f, 0.50 * f, MD);
        P.R(0.5 - 0.27 * f, 0.36, 0.54 * f, 0.05 * f, MET);
        P.R(0.5 - 0.22 * f, 0.44, 0.20 * f, 0.16 * f, DK);
        P.R(0.5 - 0.30 * f, 0.86, 0.60 * f, 0.06 * f, MET);
        for (let i = 0; i < 3; i++) P.L(0.5 - 0.27 * f, 0.62 + i * 0.08, 0.5 + 0.27 * f, 0.62 + i * 0.08, SH, 0.014 * f);
        P.head = { x: 0.5 * S, y: 0.47 * S, r: 0.14 * f * S, machine: true };
      }
      P.ground = ground;
    },
    extra: null
  });

  // ---- ghost -------------------------------------------------------
  A("ghost", {
    body: function (P) {
      const f = P.f, S = P.S;
      const topY = 0.30, rx = 0.24 * f;
      P.E(0.5, 0.44, rx, 0.20 * f, MD);
      P.E(0.5, topY, 0.17 * f, 0.17 * f, MD);
      // flowing body down to a ragged hem
      P.T(0.5, 0.36, 0.5, 0.86, rx * 2.3, MD);
      const hemY = 0.86;
      for (let i = 0; i < 4; i++) {
        const x = 0.5 - 0.24 * f + i * 0.115 * f;
        P.T(x, hemY + 0.06 * f + (i % 2) * 0.03, x, hemY - 0.06, 0.10 * f, MD);
      }
      P.head = { x: 0.5 * S, y: topY * S, r: 0.155 * f * S, hollow: true };
      P.ground = 0.95;
      if (P.hint.tatty) { for (let i = 0; i < 4; i++) P.E(0.36 + i * 0.09, hemY - 0.02 - (i % 2) * 0.05, 0.03 * f, 0.045 * f, E); }
    },
    extra: null
  });

  // ---- fish --------------------------------------------------------
  A("fish", {
    body: function (P) {
      const f = P.f, S = P.S;
      const cy = 0.58, rx = 0.28 * f, ry = 0.165 * f;
      P.E(0.5, cy, rx, ry, MD);
      P.T(0.5, cy - ry - 0.14 * f, 0.5, cy - ry * 0.2, 0.22 * f, AC);          // dorsal
      P.T(0.5 - 0.10 * f, cy + ry + 0.10 * f, 0.5 - 0.10 * f, cy + ry * 0.3, 0.13 * f, AC); // pelvic
      P.head = { x: (0.5 - rx * 0.55) * S, y: (cy - ry * 0.25) * S, r: 0.10 * f * S, asym: true, fish: true };
      P.ground = 0.95;
      P.O(0.5, cy + ry * 0.45, rx * 0.85, ry * 0.35, DK);
      P.LO(0.5 - rx * 0.8, cy, 0.5 + rx * 0.9, cy - 0.01, AC);
    },
    extra: function (P) {
      const f = P.f;
      P.T(0.5 + 0.28 * f, 0.58, 0.5 + 0.42 * f, 0.58, 0.30 * f, MD);
      P.E(0.5 + 0.30 * f, 0.58, 0.04 * f, 0.08 * f, DK);
    }
  });

  // ---- plant -------------------------------------------------------
  A("plant", {
    body: function (P) {
      const f = P.f, S = P.S;
      P.R(0.5 - 0.09 * f, 0.52, 0.18 * f, 0.42 * f, MD);
      P.E(0.5, 0.93, 0.20 * f, 0.05 * f, MD);
      P.L(0.5 - 0.08 * f, 0.66, 0.5 - 0.24 * f, 0.52, MD, 0.045 * f);
      P.E(0.5, 0.36, 0.30 * f, 0.24 * f, AC);
      for (let i = 0; i < 3; i++) P.E(0.5 - 0.22 * f + i * 0.14 * f, 0.30 - (i % 2) * 0.05, 0.13 * f, 0.11 * f, AC);
      P.head = { x: 0.5 * S, y: 0.52 * S, r: 0.13 * f * S, onTrunk: true };
      P.ground = 0.95;
      for (let i = 0; i < 3; i++) P.LO(0.5 - 0.07 * f, 0.60 + i * 0.09, 0.5 + 0.07 * f, 0.60 + i * 0.09, SH);
    },
    extra: null
  });

  // ---- rock --------------------------------------------------------
  A("rock", {
    body: function (P) {
      const f = P.f, S = P.S, rnd = P.rnd;
      P.E(0.5, 0.74, 0.30 * f, 0.20 * f, MD);
      P.R(0.5 - 0.22 * f, 0.44, 0.44 * f, 0.34 * f, MD);
      P.R(0.5 - 0.15 * f, 0.28, 0.30 * f, 0.20 * f, MD);
      for (let i = 0; i < 3; i++) {
        P.E(0.5 - 0.24 * f + i * 0.09, 0.40 + rnd() * 0.2, 0.075 * f, 0.07 * f, MD);
      }
      if (P.hint.face) {
        P.head = { x: 0.5 * S, y: 0.40 * S, r: 0.14 * f * S, carved: true };
      } else {
        P.head = { x: 0.5 * S, y: 0.38 * S, r: 0.13 * f * S, carved: true };
      }
      P.ground = 0.94;
      // strata
      for (let i = 0; i < 3; i++) P.LO(0.5 - 0.26 * f, 0.55 + i * 0.09, 0.5 + 0.26 * f, 0.56 + i * 0.09, SH);
      P.O(0.5 - 0.10 * f, 0.33, 0.06 * f, 0.04 * f, HI);
    },
    extra: null
  });

  // =================================================================
  // 5. Face
  // =================================================================
  function drawFace(P) {
    const H = P.head;
    if (!H || H.noEyes) return;
    const g = P.g, S = P.S, tiny = S < 30;
    const r = H.r;
    if (H.single) {                                   // one big lens / core
      const er = Math.max(1.5, r * 0.55);
      g.ell(H.x, H.y, er, er, EYE);
      g.ell(H.x, H.y, er * 0.62, er * 0.62, GL);
      if (!tiny) g.ell(H.x - er * 0.3, H.y - er * 0.3, er * 0.22, er * 0.22, SHN);
      return;
    }
    const spread = r * (H.insect ? 0.52 : H.fish ? 0.0 : 0.46);
    const ey = H.y - r * (H.blob ? 0.05 : 0.12);
    const er = Math.max(1, r * (H.bigEyes ? 0.40 : H.insect ? 0.30 : 0.26));
    const eyeCol = H.hollow ? GL : EYE;
    for (let s = -1; s <= 1; s += 2) {
      if (H.fish && s > 0) break;                     // fish is drawn side-on
      const x = H.x + s * spread;
      if (H.hollow) { g.ell(x, ey, er * 1.25, er * 1.25, BLK); g.ell(x, ey, er * 0.7, er * 0.8, GL); }
      else {
        g.ell(x, ey, er, er * 1.12, SHN);
        g.ell(x + s * er * 0.14, ey + er * 0.1, er * 0.66, er * 0.8, eyeCol);
        if (!tiny) g.set(x - s * er * 0.35, ey - er * 0.4, SHN);
      }
    }
    if (tiny) return;
    // mouth
    if (H.cat) {
      g.line(H.x - r * 0.30, H.y + r * 0.45, H.x, H.y + r * 0.58, OUT, 1);
      g.line(H.x + r * 0.30, H.y + r * 0.45, H.x, H.y + r * 0.58, OUT, 1);
      for (let i = 0; i < 2; i++) {
        g.line(H.x - r * 0.55, H.y + r * 0.42 + i * 2, H.x - r * 1.5, H.y + r * 0.30 + i * 3, SHN, 1);
        g.line(H.x + r * 0.55, H.y + r * 0.42 + i * 2, H.x + r * 1.5, H.y + r * 0.30 + i * 3, SHN, 1);
      }
    } else if (H.muzzle) {
      g.ell(H.x, H.y + r * 0.52, r * 0.16, r * 0.12, EYE);
      g.line(H.x - r * 0.22, H.y + r * 0.76, H.x + r * 0.22, H.y + r * 0.76, OUT, 1);
    } else if (H.insect) {
      g.line(H.x - r * 0.3, H.y + r * 0.62, H.x + r * 0.3, H.y + r * 0.62, OUT, 1);
    } else if (!H.machine && !H.carved && !H.hooded) {
      g.line(H.x - r * 0.24, H.y + r * 0.6, H.x + r * 0.24, H.y + r * 0.6, OUT, 1);
    }
    if (H.fangs) { g.set(H.x - r * 0.28, H.y + r * 0.72, SHN); g.set(H.x + r * 0.28, H.y + r * 0.72, SHN); }
  }

  // back view: no face, a spine ridge and the shoulders instead
  function drawBack(P) {
    const H = P.head, g = P.g, S = P.S;
    if (!H) return;
    const r = H.r;
    if (H.hollow || H.machine) {
      g.ell(H.x, H.y, r * 0.55, r * 0.45, SH);
      return;
    }
    g.ell(H.x, H.y + r * 0.15, r * 0.72, r * 0.6, SH);
    if (S >= 30) {
      for (let i = 0; i < 5; i++) g.set(H.x, H.y + r * 1.2 + i * (S * 0.05), SH);
      g.ell(H.x - r * 0.8, H.y + r * 1.5, r * 0.35, r * 0.3, SH);
      g.ell(H.x + r * 0.8, H.y + r * 1.5, r * 0.35, r * 0.3, SH);
    }
  }

  // =================================================================
  // 6. Feature layers (types + feat keywords)
  // =================================================================
  // symmetric, volumetric bits — drawn before the mirror/shade pass
  function preFeatures(P) {
    if (P.noFeatures) return;
    const f = P.f, F = P.flags, t = P.types, has = P.hasType;
    const S = P.S, small = P.small;
    if ((has("flying") || F.wing) && !P.hint.wings && P.archName !== "bird" && P.archName !== "insect") {
      // a pair of wings sweeping up and back
      P.T(0.5 - 0.16 * f, 0.30, 0.5 - 0.30 * f, 0.58, 0.20 * f, LT);
      P.L(0.5 - 0.16 * f, 0.31, 0.5 - 0.29 * f, 0.56, MD, 0.02 * f);
    }
    if (has("water") && !small) {                        // dorsal / side fins
      P.T(0.5, 0.24, 0.5, 0.42, 0.13 * f, AC);
      P.T(0.5 - 0.29 * f, 0.66, 0.5 - 0.20 * f, 0.62, 0.14 * f, AC);
    }
    if (has("fire") || F.ember) {                        // crest of flame
      P.T(0.5, 0.10, 0.5, 0.30, 0.16 * f, TY);
      P.T(0.5 - 0.11 * f, 0.17, 0.5 - 0.08 * f, 0.31, 0.10 * f, TY);
    }
    if (has("rock") || has("ground") || F.stone) {       // shoulder plates
      P.E(0.5 - 0.26 * f, 0.50, 0.10 * f, 0.08 * f, DK);
    }
    if (F.horn && !P.hint.horns) {
      P.T(0.5 - 0.12 * f, 0.10, 0.5 - 0.09 * f, 0.30, 0.075 * f, AC);
    }
    if (F.leaf || has("grass")) {
      P.E(0.5 - 0.17 * f, 0.20, 0.085 * f, 0.055 * f, TY);
      P.E(0.5 - 0.10 * f, 0.14, 0.06 * f, 0.04 * f, TYL);
    }
  }

  // flat markings and glow — drawn after the outline pass
  function postFeatures(P) {
    if (P.noFeatures) return;
    const g = P.g, S = P.S, f = P.f, F = P.flags, has = P.hasType, rnd = P.rnd;
    const small = P.small;
    if (has("cyber") || F.cyber) {                        // circuit traces + nodes
      const n = small ? 2 : 5;
      for (let i = 0; i < n; i++) {
        const y = (0.34 + i * 0.11) * S, x0 = (0.30 + rnd() * 0.08) * S, x1 = (0.62 + rnd() * 0.10) * S;
        g.lineOver(x0, y, x0 + (x1 - x0) * 0.55, y, GL);
        g.lineOver(x0 + (x1 - x0) * 0.55, y, x0 + (x1 - x0) * 0.55, y - S * 0.05, GL);
        if (!small) g.over(x1, y - S * 0.05, TYL);
      }
      if (!small) for (let i = 0; i < 3; i++) g.ellOver((0.36 + i * 0.14) * S, (0.46 + (i % 2) * 0.16) * S, S * 0.022, S * 0.022, TYL);
    }
    if (has("electric") || F.arc) {                       // zig-zags and sparks
      const n = small ? 1 : 3;
      for (let i = 0; i < n; i++) {
        const x = (0.34 + i * 0.16) * S, y = (0.44 + i * 0.10) * S, w = S * 0.055;
        g.lineOver(x, y, x + w, y + w * 0.6, TYL);
        g.lineOver(x + w, y + w * 0.6, x + w * 0.4, y + w * 1.1, TYL);
        g.lineOver(x + w * 0.4, y + w * 1.1, x + w * 1.5, y + w * 1.9, TYL);
      }
    }
    if (F.salt || (has("rock") && F.raw.indexOf("salt") >= 0)) {   // salt crystals
      const n = small ? 2 : 6;
      for (let i = 0; i < n; i++) {
        const x = (0.26 + rnd() * 0.48) * S, y = (0.36 + rnd() * 0.44) * S, r = S * (0.018 + rnd() * 0.022);
        if (!g.get(x, y)) continue;
        g.tri(x, y - r * 2.2, x, y + r * 0.4, r * 1.6, WHT);
        g.set(x, y - r, SHN);
      }
    }
    if (F.silk && !small) {                                // silk threads
      for (let i = 0; i < 3; i++) g.line((0.22 + i * 0.02) * S, (0.30 + i * 0.20) * S, (0.78 - i * 0.02) * S, (0.26 + i * 0.20) * S, SHN, 1);
    }
    if (has("poison") || F.drip) {                         // drips
      const n = small ? 1 : 4;
      for (let i = 0; i < n; i++) {
        const x = (0.30 + i * 0.14) * S, y = (0.80 + rnd() * 0.06) * S;
        g.ellOver(x, y, S * 0.03, S * 0.035, TY);
        g.ell(x, y + S * 0.06, S * 0.018, S * 0.026, TY);
      }
    }
    if (has("psychic") && !small) {                        // halo ring
      const H = P.head;
      if (H) for (let a = 0; a < 24; a++) {
        const th = a / 24 * Math.PI * 2;
        g.set(H.x + Math.cos(th) * H.r * 1.9, H.y - H.r * 1.5 + Math.sin(th) * H.r * 0.55, TYL);
      }
    }
    if (has("ghost") || F.fog) {                           // fading hem / shroud
      for (let y = Math.floor(S * 0.82); y < S; y++) {
        for (let x = 0; x < S; x++) if (g.get(x, y) && ((x + y) & 1)) g.set(x, y, E);
      }
    }
    if (F.lamp) {
      const H = P.head;
      if (H) { g.ell(H.x, H.y - H.r * 1.35, S * 0.035, S * 0.035, GL); g.ell(H.x, H.y - H.r * 1.35, S * 0.018, S * 0.018, SHN); }
    }
    if (F.metal && !small) {
      for (let i = 0; i < 3; i++) g.lineOver((0.32) * S, (0.52 + i * 0.10) * S, (0.68) * S, (0.52 + i * 0.10) * S, MEL);
    }
    if (F.eyes && F.many && !small) {                      // extra eyes
      const H = P.head;
      if (H) for (let i = -1; i <= 1; i += 2) {
        g.ell(H.x + i * H.r * 0.92, H.y - H.r * 0.55, Math.max(1, H.r * 0.16), Math.max(1, H.r * 0.16), SHN);
        g.set(H.x + i * H.r * 0.92, H.y - H.r * 0.55, EYE);
      }
    }
    // ground shadow keeps the sprite anchored in battle
    if (P.kind === "front" && P.ground) {
      const gy = Math.round(P.ground * S) + 1;
      g.ell(S * 0.5, gy, S * 0.26, S * 0.035, SH);
    }
  }

  // =================================================================
  // 7. Hand-tuned species
  // =================================================================
  const OV = {};        // id → function(P)
  const OV_PAL = {};    // id → [dark, mid, light, accent]

  const DARKBYTE = {};
  "puppetacct botling botnetle bitmite teramite virling wormhack phishfin spearphish trojanox droneling datadrake firewaul quarkling hadronaut dishlet parabolus poltergrid peepcam panoptix chordle proxling amoslurk shardmind glitchra oracle_core glitchra_static oracle_core_p2 oracle_core_p3 understudy"
    .split(" ").forEach(function (id) { DARKBYTE[id] = true; });

  // ---- SILK line ---------------------------------------------------
  OV.silkin = function (P) {
    const f = P.f;
    for (let i = 0; i < 5; i++) P.E(0.5, 0.80 - i * 0.105, (0.20 - i * 0.012) * f, 0.075 * f, MD);
    P.E(0.5, 0.30, 0.155 * f, 0.135 * f, MD);
    P.E(0.5, 0.27, 0.10 * f, 0.07 * f, LT);
    P.head = { x: 0.5 * P.S, y: 0.30 * P.S, r: 0.145 * f * P.S, muzzle: false };
    P.ground = 0.90;
    P.L(0.5 - 0.09 * f, 0.20, 0.5 - 0.16 * f, 0.11, MD, 0.02 * f);  // stubby antenna
    P.extra = function (Q) {
      const g = Q.g, S = Q.S;
      for (let i = 0; i < 4; i++) g.ellOver((0.36 + i * 0.09) * S, (0.62 + (i % 2) * 0.12) * S, S * 0.03, S * 0.024, AC); // mulberry stain
      g.line(0.63 * S, 0.86 * S, 0.94 * S, 0.72 * S, SHN, 1);        // the thread it never lets go of
      g.line(0.94 * S, 0.72 * S, 0.86 * S, 0.60 * S, SHN, 1);
    };
  };
  OV.spindrake = function (P) {
    const f = P.f;
    P.E(0.5, 0.72, 0.19 * f, 0.17 * f, AC);                          // bobbin cocoon
    P.R(0.5 - 0.22 * f, 0.60, 0.44 * f, 0.035 * f, LT);
    P.R(0.5 - 0.22 * f, 0.86, 0.44 * f, 0.035 * f, LT);
    P.E(0.5, 0.50, 0.145 * f, 0.14 * f, MD);                         // furred thorax
    P.E(0.5 - 0.22 * f, 0.44, 0.20 * f, 0.15 * f, LT);               // wing
    P.E(0.5 - 0.16 * f, 0.62, 0.13 * f, 0.10 * f, LT);
    P.E(0.5, 0.30, 0.115 * f, 0.105 * f, MD);
    P.head = { x: 0.5 * P.S, y: 0.30 * P.S, r: 0.11 * f * P.S, insect: true };
    P.ground = 0.92;
    P.L(0.5 - 0.05 * f, 0.23, 0.5 - 0.17 * f, 0.13, MD, 0.016 * f);
    P.E(0.5 - 0.18 * f, 0.12, 0.022 * f, 0.022 * f, AC);
  };
  OV.loomoth = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5 - 0.26 * f, 0.38, 0.26 * f, 0.22 * f, LT);               // great forewing
    P.E(0.5 - 0.20 * f, 0.66, 0.19 * f, 0.16 * f, LT);               // hindwing
    P.E(0.5, 0.56, 0.11 * f, 0.22 * f, MD);                          // long furred body
    P.E(0.5, 0.30, 0.13 * f, 0.12 * f, MD);
    P.head = { x: 0.5 * S, y: 0.30 * S, r: 0.125 * f * S, insect: true, bigEyes: true };
    P.ground = 0.92;
    for (let i = 0; i < 4; i++) {
      P.L(0.5 - 0.07 * f - i * 0.03, 0.21 - i * 0.02, 0.5 - 0.22 * f - i * 0.02, 0.10 - i * 0.015, MD, 0.012 * f);
    }
    P.extra = function (Q) {                                          // punch-card holes
      const g = Q.g, SS = Q.S;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
        const x = (0.16 + c * 0.075) * SS, y = (0.28 + r * 0.075) * SS;
        if (g.get(x, y)) { g.set(x, y, E); g.set(SS - 1 - x, y, E); }
      }
    };
  };

  // ---- BRINE line --------------------------------------------------
  OV.brinewt = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.74, 0.26 * f, 0.13 * f, MD);
    P.L(0.5 - 0.20 * f, 0.80, 0.5 - 0.27 * f, 0.90, MD, 0.05 * f);
    P.E(0.5 - 0.28 * f, 0.91, 0.05 * f, 0.03 * f, MD);
    P.E(0.5, 0.50, 0.17 * f, 0.15 * f, MD);
    P.head = { x: 0.5 * S, y: 0.50 * S, r: 0.16 * f * S, muzzle: true, bigEyes: true };
    P.ground = 0.94;
    for (let i = -1; i <= 1; i += 2) {                                 // brine gills
      P.T(0.5 + i * 0.16 * f, 0.36, 0.5 + i * 0.13 * f, 0.50, 0.07 * f, AC);
      P.T(0.5 + i * 0.21 * f, 0.42, 0.5 + i * 0.15 * f, 0.52, 0.06 * f, AC);
    }
    P.extra = function (Q) { for (let i = 0; i < 5; i++) Q.g.ellOver((0.32 + i * 0.09) * Q.S, (0.70 + (i % 2) * 0.07) * Q.S, Q.S * 0.02, Q.S * 0.02, WHT); };
  };
  OV.saltander = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.70, 0.30 * f, 0.16 * f, MD);
    P.R(0.5 - 0.24 * f, 0.80, 0.08 * f, 0.13 * f, MD);
    P.R(0.5 - 0.08 * f, 0.82, 0.07 * f, 0.11 * f, MD);
    P.E(0.5, 0.44, 0.19 * f, 0.16 * f, MD);
    P.head = { x: 0.5 * S, y: 0.44 * S, r: 0.18 * f * S, muzzle: true };
    P.ground = 0.95;
    for (let i = 0; i < 4; i++) P.T(0.5 - 0.15 * f + i * 0.10 * f, 0.50, 0.5 - 0.14 * f + i * 0.10 * f, 0.62, 0.06 * f, WHT);
    P.T(0.5, 0.24, 0.5, 0.40, 0.10 * f, AC);
    P.extra = function (Q) {
      Q.g.line(0.78 * Q.S, 0.74 * Q.S, 0.95 * Q.S, 0.82 * Q.S, MD, Q.S * 0.06);
      for (let i = 0; i < 3; i++) Q.g.ell((0.28 + i * 0.10) * Q.S, 0.955 * Q.S, Q.S * 0.024, Q.S * 0.014, WHT);  // salt footprints
    };
  };
  OV.halosaur = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.68, 0.32 * f, 0.20 * f, MD);
    P.R(0.5 - 0.27 * f, 0.80, 0.10 * f, 0.15 * f, MD);
    P.R(0.5 - 0.09 * f, 0.82, 0.09 * f, 0.13 * f, MD);
    P.E(0.5, 0.40, 0.22 * f, 0.19 * f, MD);
    P.head = { x: 0.5 * S, y: 0.40 * S, r: 0.21 * f * S, muzzle: true };
    P.ground = 0.96;
    // halite crown
    for (let i = 0; i < 3; i++) P.T(0.5 - 0.16 * f + i * 0.11 * f, 0.06 + (i === 1 ? -0.05 : 0.02), 0.5 - 0.15 * f + i * 0.11 * f, 0.26, 0.085 * f, WHT);
    P.T(0.5, 0.02, 0.5, 0.24, 0.10 * f, SHN);
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      g.line(0.80 * SS, 0.70 * SS, 0.97 * SS, 0.60 * SS, MD, SS * 0.08);
      for (let i = 0; i < 7; i++) g.ell((0.30 + i * 0.07) * SS, (0.56 + (i % 3) * 0.04) * SS, SS * 0.02, SS * 0.028, WHT);
      for (let i = 0; i < 4; i++) g.ell((0.34 + i * 0.10) * SS, (0.88 + (i % 2) * 0.04) * SS, SS * 0.014, SS * 0.02, GL); // brine pours
    };
  };

  // ---- MILL FIRE line ----------------------------------------------
  OV.kindlin = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.66, 0.20 * f, 0.20 * f, MD);
    P.R(0.5 - 0.13 * f, 0.82, 0.07 * f, 0.11 * f, MD);
    P.E(0.5, 0.36, 0.16 * f, 0.15 * f, MD);
    P.T(0.5 - 0.11 * f, 0.14, 0.5 - 0.08 * f, 0.30, 0.07 * f, MD);      // ear-horn
    P.head = { x: 0.5 * S, y: 0.36 * S, r: 0.15 * f * S, fangs: true };
    P.ground = 0.94;
    P.E(0.5, 0.66, 0.10 * f, 0.09 * f, TY);                              // firebox belly
    P.E(0.5, 0.66, 0.055 * f, 0.05 * f, GL);
    P.L(0.5 - 0.19 * f, 0.60, 0.5 - 0.27 * f, 0.74, MD, 0.045 * f);
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let i = 0; i < 5; i++) g.ell((0.28 + Q.rnd() * 0.44) * SS, (0.16 + Q.rnd() * 0.14) * SS, SS * 0.02, SS * 0.026, GL);
      g.line(0.70 * SS, 0.76 * SS, 0.86 * SS, 0.66 * SS, TY, SS * 0.05);
    };
  };
  OV.stokerel = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.62, 0.26 * f, 0.24 * f, MD);
    P.R(0.5 - 0.17 * f, 0.82, 0.10 * f, 0.13 * f, MD);
    P.E(0.5, 0.28, 0.16 * f, 0.14 * f, MD);
    P.head = { x: 0.5 * S, y: 0.28 * S, r: 0.15 * f * S, fangs: true };
    P.ground = 0.95;
    P.R(0.5 - 0.14 * f, 0.54, 0.28 * f, 0.20 * f, MET);                  // furnace door
    P.E(0.5, 0.64, 0.10 * f, 0.08 * f, TY);
    P.E(0.5, 0.64, 0.05 * f, 0.04 * f, GL);
    P.L(0.5 - 0.24 * f, 0.52, 0.5 - 0.34 * f, 0.72, MD, 0.06 * f);       // shovel arm
    P.R(0.5 - 0.40 * f, 0.70, 0.11 * f, 0.09 * f, MET);
    P.extra = function (Q) { for (let i = 0; i < 6; i++) Q.g.ell((0.22 + Q.rnd() * 0.56) * Q.S, (0.08 + Q.rnd() * 0.12) * Q.S, Q.S * 0.018, Q.S * 0.024, GL); };
  };
  OV.furnacore = function (P) {
    const f = P.f, S = P.S;
    P.R(0.5 - 0.30 * f, 0.44, 0.60 * f, 0.36 * f, MD);                   // engine block
    P.R(0.5 - 0.30 * f, 0.44, 0.60 * f, 0.045 * f, MET);
    P.R(0.5 - 0.13 * f, 0.80, 0.11 * f, 0.14 * f, MET);
    P.E(0.5, 0.24, 0.17 * f, 0.15 * f, MD);
    P.head = { x: 0.5 * S, y: 0.24 * S, r: 0.16 * f * S, fangs: true };
    P.ground = 0.96;
    P.R(0.5 - 0.15 * f, 0.52, 0.30 * f, 0.22 * f, BLK);                  // firebox
    P.E(0.5, 0.63, 0.12 * f, 0.10 * f, TY);
    P.E(0.5, 0.63, 0.07 * f, 0.055 * f, GL);
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      g.ell(0.80 * SS, 0.66 * SS, 0.14 * ff * SS, 0.14 * ff * SS, MET);   // flywheel
      g.ell(0.80 * SS, 0.66 * SS, 0.09 * ff * SS, 0.09 * ff * SS, DK);
      g.ell(0.80 * SS, 0.66 * SS, 0.03 * ff * SS, 0.03 * ff * SS, GL);
      for (let i = 0; i < 4; i++) {                                       // arcing brushes
        const a = i * 1.4;
        g.line(0.20 * SS, 0.40 * SS, (0.20 + Math.cos(a) * 0.14) * SS, (0.40 - Math.abs(Math.sin(a)) * 0.16) * SS, TYL, 1);
      }
    };
  };

  // ---- Cats --------------------------------------------------------
  OV_PAL.meadow = ["#0c0b11", "#1d1b26", "#3a3746", "#7fd66b"];
  OV.meadow = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.74, 0.20 * f, 0.155 * f, MD);
    P.R(0.5 - 0.14 * f, 0.80, 0.05 * f, 0.13 * f, MD);
    P.E(0.5, 0.56, 0.145 * f, 0.13 * f, MD);
    P.E(0.5, 0.36, 0.155 * f, 0.135 * f, MD);
    P.T(0.5 - 0.145 * f, 0.14, 0.5 - 0.08 * f, 0.32, 0.10 * f, MD);
    P.head = { x: 0.5 * S, y: 0.36 * S, r: 0.15 * f * S, cat: true };
    P.ground = 0.94;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      g.line(0.66 * SS, 0.80 * SS, 0.90 * SS, 0.62 * SS, MD, SS * 0.05 * ff);   // tail, up and going
      g.line(0.90 * SS, 0.62 * SS, 0.93 * SS, 0.44 * SS, MD, SS * 0.045 * ff);
      for (let i = 0; i < 3; i++) g.line((0.14 + i * 0.03) * SS, (0.70 + i * 0.07) * SS, (0.30 + i * 0.03) * SS, (0.68 + i * 0.07) * SS, GL, 1); // speed lines
    };
  };
  OV_PAL.bigboy = ["#141218", "#2b2933", "#f0ede5", "#f6bcc9"];
  OV.bigboy = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.72, 0.31 * f, 0.24 * f, MD);
    P.E(0.5, 0.76, 0.20 * f, 0.19 * f, LT);                                  // white bib/belly
    P.E(0.5 - 0.20 * f, 0.92, 0.09 * f, 0.05 * f, LT);
    P.E(0.5, 0.40, 0.22 * f, 0.20 * f, MD);
    P.E(0.5, 0.47, 0.13 * f, 0.10 * f, LT);                                  // white muzzle
    P.T(0.5 - 0.20 * f, 0.18, 0.5 - 0.11 * f, 0.36, 0.11 * f, MD);
    P.head = { x: 0.5 * S, y: 0.40 * S, r: 0.21 * f * S, cat: true };
    P.ground = 0.97;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      g.line(0.78 * SS, 0.86 * SS, 0.95 * SS, 0.84 * SS, MD, SS * 0.07 * ff); // tail, flat on the floor
      g.ellOver(0.34 * SS, 0.34 * SS, SS * 0.06 * ff, SS * 0.05 * ff, LT);    // white blaze
    };
  };
  OV_PAL.grinmalkin = ["#221a30", "#4a3468", "#a487cc", "#f5e05a"];
  OV.grinmalkin = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.60, 0.26 * f, 0.20 * f, MD);
    P.E(0.5, 0.38, 0.24 * f, 0.20 * f, MD);
    P.T(0.5 - 0.22 * f, 0.14, 0.5 - 0.12 * f, 0.34, 0.12 * f, MD);
    P.head = { x: 0.5 * S, y: 0.38 * S, r: 0.23 * f * S, cat: true, noMouth: true };
    P.ground = 0.90;
    P.noFeatures = true;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f, cx = 0.5 * SS;
      // the grin: the only part that is ever entirely there
      const gy = 0.48 * SS, gw = 0.20 * ff * SS, gh = 0.10 * ff * SS;
      for (let x = -gw; x <= gw; x++) {
        const t = x / gw, y = gy + Math.cos(t * 1.35) * -gh + gh;
        for (let j = 0; j < Math.max(2, gh * 0.9); j++) g.set(cx + x, y + j, AC);
      }
      for (let i = -3; i <= 3; i++) {                                        // teeth
        const x = cx + i * gw / 3.4;
        const t = (x - cx) / gw, y = gy + Math.cos(t * 1.35) * -gh + gh;
        g.line(x, y, x, y + gh * 0.85, BLK, 1);
      }
      // eyes: two slow yellow crescents
      for (let s = -1; s <= 1; s += 2) {
        g.ell(cx + s * 0.11 * ff * SS, 0.32 * SS, SS * 0.035 * ff, SS * 0.030 * ff, AC);
        g.ell(cx + s * 0.11 * ff * SS, 0.325 * SS, SS * 0.012 * ff, SS * 0.026 * ff, BLK);
      }
      // and the rest of it dissolving, a checker fade from the bottom up
      for (let y = Math.floor(SS * 0.52); y < SS; y++) {
        const p = (y - SS * 0.52) / (SS * 0.48);
        for (let x = 0; x < SS; x++) {
          if (!g.get(x, y)) continue;
          if (((x * 3 + y * 5) % 17) / 17 < p * 0.95) g.set(x, y, E);
        }
      }
    };
  };
  OV_PAL.grinkit = ["#2b2338", "#553f74", "#ab90cf", "#f5e05a"];
  OV.grinkit = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.72, 0.18 * f, 0.15 * f, MD);
    P.E(0.5, 0.48, 0.19 * f, 0.17 * f, MD);
    P.T(0.5 - 0.17 * f, 0.26, 0.5 - 0.09 * f, 0.44, 0.10 * f, MD);
    P.head = { x: 0.5 * S, y: 0.48 * S, r: 0.185 * f * S, cat: true };
    P.ground = 0.90;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f, cx = 0.5 * SS, gy = 0.56 * SS, gw = 0.13 * ff * SS;
      for (let x = -gw; x <= gw; x++) g.set(cx + x, gy + Math.cos(x / gw * 1.3) * -SS * 0.05 * ff + SS * 0.05 * ff, AC);
      for (let y = Math.floor(SS * 0.72); y < SS; y++) for (let x = 0; x < SS; x++) if (g.get(x, y) && ((x + y) & 1)) g.set(x, y, E);
    };
  };

  // ---- Legendaries -------------------------------------------------
  OV_PAL.merlynx = ["#1a1730", "#3b3466", "#8c86c4", "#cfe9ff"];
  OV.merlynx = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.68, 0.28 * f, 0.19 * f, MD);
    P.E(0.5, 0.46, 0.20 * f, 0.17 * f, MD);
    P.E(0.5, 0.28, 0.19 * f, 0.16 * f, MD);
    P.T(0.5 - 0.17 * f, 0.02, 0.5 - 0.10 * f, 0.24, 0.10 * f, MD);              // tufted ear
    P.T(0.5 - 0.19 * f, 0.04, 0.5 - 0.15 * f, 0.14, 0.035 * f, AC);             // tuft
    P.E(0.5 - 0.20 * f, 0.34, 0.07 * f, 0.09 * f, LT);                          // cheek ruff
    P.head = { x: 0.5 * S, y: 0.28 * S, r: 0.185 * f * S, cat: true };
    P.ground = 0.90;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      g.line(0.74 * SS, 0.74 * SS, 0.92 * SS, 0.58 * SS, MD, SS * 0.05 * ff);
      // star-flecked coat + a ring of the Wizard's light
      for (let i = 0; i < 16; i++) {
        const x = (0.24 + Q.rnd() * 0.52) * SS, y = (0.34 + Q.rnd() * 0.50) * SS;
        if (g.get(x, y)) g.set(x, y, SHN);
      }
      for (let a = 0; a < 30; a++) {
        const th = a / 30 * Math.PI * 2;
        g.set(0.5 * SS + Math.cos(th) * 0.34 * ff * SS, 0.16 * SS + Math.sin(th) * 0.09 * ff * SS, (a & 1) ? AC : GL);
      }
      // paws fade — it is only ever half here
      for (let y = Math.floor(SS * 0.86); y < SS; y++) for (let x = 0; x < SS; x++) if (g.get(x, y) && ((x + y) & 1)) g.set(x, y, E);
    };
  };
  OV_PAL.terrataur = ["#4b4438", "#8b8069", "#ddd6c2", "#f2f6f8"];
  OV.terrataur = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.66, 0.34 * f, 0.22 * f, MD);                                     // vast body
    P.R(0.5 - 0.28 * f, 0.78, 0.12 * f, 0.17 * f, MD);
    P.R(0.5 - 0.09 * f, 0.80, 0.11 * f, 0.15 * f, MD);
    P.E(0.5, 0.36, 0.22 * f, 0.19 * f, MD);
    P.E(0.5, 0.45, 0.14 * f, 0.10 * f, LT);                                     // muzzle
    P.head = { x: 0.5 * S, y: 0.36 * S, r: 0.21 * f * S, muzzle: true };
    P.ground = 0.96;
    // cathedral horns
    P.L(0.5 - 0.18 * f, 0.28, 0.5 - 0.36 * f, 0.14, WHT, 0.055 * f);
    P.L(0.5 - 0.36 * f, 0.14, 0.5 - 0.40 * f, 0.30, WHT, 0.045 * f);
    P.T(0.5 - 0.11 * f, 0.06, 0.5 - 0.08 * f, 0.24, 0.08 * f, SHN);             // halite crown spire
    P.T(0.5, 0.00, 0.5, 0.22, 0.10 * f, SHN);
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let i = 0; i < 12; i++) {                                            // salt cathedral facets
        const x = (0.26 + Q.rnd() * 0.48) * SS, y = (0.52 + Q.rnd() * 0.32) * SS;
        if (!g.get(x, y)) continue;
        g.tri(x, y - SS * 0.05, x, y + SS * 0.01, SS * 0.035, WHT);
        g.set(x, y - SS * 0.02, SHN);
      }
      for (let i = 0; i < 3; i++) g.lineOver(0.24 * SS, (0.60 + i * 0.08) * SS, 0.76 * SS, (0.62 + i * 0.08) * SS, SH);
    };
  };
  OV_PAL.zephyrion = ["#1d2742", "#3f5c96", "#a9c8f2", "#ffe873"];
  OV.zephyrion = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.58, 0.17 * f, 0.24 * f, MD);
    P.E(0.5, 0.28, 0.135 * f, 0.125 * f, MD);
    P.T(0.5, 0.42, 0.5, 0.30, 0.09 * f, AC);                                    // beak
    // vast storm wings, swept
    P.T(0.5 - 0.14 * f, 0.42, 0.5 - 0.46 * f, 0.16, 0.30 * f, LT);
    P.T(0.5 - 0.16 * f, 0.52, 0.5 - 0.40 * f, 0.72, 0.24 * f, LT);
    P.head = { x: 0.5 * S, y: 0.28 * S, r: 0.13 * f * S, raptor: true };
    P.ground = 0.94;
    P.R(0.5 - 0.05 * f, 0.80, 0.03 * f, 0.13 * f, AC);
    P.T(0.5 - 0.06 * f, 0.10, 0.5 - 0.03 * f, 0.24, 0.05 * f, AC);              // crest
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      for (let i = 0; i < 6; i++) {                                             // lightning primaries
        const x0 = (0.10 + i * 0.03) * SS, y0 = (0.24 + i * 0.09) * SS;
        g.line(x0, y0, x0 + SS * 0.05, y0 + SS * 0.03, AC, 1);
        g.line(x0 + SS * 0.05, y0 + SS * 0.03, x0 + SS * 0.02, y0 + SS * 0.06, AC, 1);
        g.line(SS - x0, y0, SS - x0 - SS * 0.05, y0 + SS * 0.03, AC, 1);
        g.line(SS - x0 - SS * 0.05, y0 + SS * 0.03, SS - x0 - SS * 0.02, y0 + SS * 0.06, AC, 1);
      }
      for (let i = 0; i < 8; i++) g.ellOver((0.32 + Q.rnd() * 0.36) * SS, (0.44 + Q.rnd() * 0.30) * SS, SS * 0.016, SS * 0.016, GL);
    };
  };
  OV_PAL.glitchra = ["#0c1a22", "#14504f", "#2ad0b6", "#f2f7ff"];
  OV.glitchra = function (P) {
    const f = P.f, S = P.S;
    // a bird that is mostly not there — the outline of one, in static
    P.E(0.5, 0.56, 0.19 * f, 0.23 * f, MD);
    P.E(0.5, 0.27, 0.145 * f, 0.13 * f, MD);
    P.T(0.5, 0.40, 0.5, 0.30, 0.085 * f, LT);
    P.T(0.5 - 0.15 * f, 0.36, 0.5 - 0.42 * f, 0.24, 0.26 * f, MD);
    P.T(0.5 - 0.14 * f, 0.60, 0.5 - 0.34 * f, 0.78, 0.20 * f, MD);
    P.head = { x: 0.5 * S, y: 0.27 * S, r: 0.14 * f * S, hollow: true };
    P.ground = 0.94;
    P.noFeatures = true;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let y = 0; y < SS; y++) {                                            // scanline tearing
        if (y % 3 !== 0) continue;
        const sh = Math.round((Q.rnd() * 2 - 1) * SS * 0.06);
        for (let x = 0; x < SS; x++) {
          const src = g.get(x - sh, y);
          g.set(x, y, src);
        }
      }
      for (let y = 0; y < SS; y += 2) for (let x = 0; x < SS; x++) if (g.get(x, y) === MD && ((x + y) % 5 === 0)) g.set(x, y, GL);
      for (let i = 0; i < 10; i++) {                                            // detached fragments
        const x = (0.10 + Q.rnd() * 0.80) * SS, y = (0.14 + Q.rnd() * 0.72) * SS;
        g.rect(x, y, SS * 0.05, 1, GL);
      }
    };
  };
  OV.glitchra_static = function (P) { OV.glitchra(P); P.boss = true; };
  OV_PAL.glitchra_static = ["#150a1c", "#5c1550", "#e63ea0", "#fff0fb"];

  // ---- ORACLE ------------------------------------------------------
  OV_PAL.oracle_core = ["#0a1e26", "#0f6a63", "#33d9c0", "#eafff9"];
  function oracleCore(P, phase) {
    const f = P.f, S = P.S;
    // nested rings around a reading eye
    P.E(0.5, 0.50, 0.30 * f, 0.30 * f, DK);
    P.E(0.5, 0.50, 0.255 * f, 0.255 * f, MD);
    P.E(0.5, 0.50, 0.175 * f, 0.175 * f, DK);
    P.E(0.5, 0.50, 0.115 * f, 0.115 * f, AC);
    P.head = { x: 0.5 * S, y: 0.50 * S, r: 0.115 * f * S, single: true, machine: true };
    P.ground = 0.88;
    P.noFeatures = true;
    for (let i = 0; i < 6; i++) {                                               // spokes
      const a = i * Math.PI / 6;
      P.L(0.5 - Math.cos(a) * 0.30 * f, 0.50 - Math.sin(a) * 0.30 * f, 0.5 - Math.cos(a) * 0.19 * f, 0.50 - Math.sin(a) * 0.19 * f, GL, 0.02 * f);
    }
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      const rings = 1 + phase;
      for (let r = 0; r < rings; r++) {
        const rr = (0.34 + r * 0.06) * ff * SS;
        for (let a = 0; a < 64; a++) {
          const th = a / 64 * Math.PI * 2 + r * 0.4;
          if ((a + r) % (phase >= 2 ? 2 : 3) === 0) continue;
          g.set(0.5 * SS + Math.cos(th) * rr, 0.50 * SS + Math.sin(th) * rr * 0.96, r === 0 ? AC : GL);
        }
      }
      if (phase >= 1) for (let i = 0; i < 14; i++) {                            // shed fragments
        const th = Q.rnd() * Math.PI * 2, rr = (0.40 + Q.rnd() * 0.10) * ff * SS;
        g.rect(0.5 * SS + Math.cos(th) * rr, 0.50 * SS + Math.sin(th) * rr, SS * 0.045, 1, GL);
      }
      if (phase >= 2) for (let y = 0; y < SS; y += 4) g.rect(0, y, SS, 1, phase >= 2 ? SH : GL);
    };
  }
  OV.oracle_core = function (P) { oracleCore(P, 0); };
  OV.oracle_core_p2 = function (P) { oracleCore(P, 1); };
  OV.oracle_core_p3 = function (P) { oracleCore(P, 2); };
  OV_PAL.oracle_core_p2 = ["#0a1e26", "#116f5f", "#43e0a8", "#fff6d8"];
  OV_PAL.oracle_core_p3 = ["#1c0a1a", "#7a1240", "#ff5a7a", "#fff0f4"];

  OV_PAL.shardmind = ["#0d222c", "#16746a", "#3fe0c4", "#f0fffb"];
  OV.shardmind = function (P) {
    const f = P.f, S = P.S;
    P.T(0.5, 0.16, 0.5, 0.78, 0.34 * f, MD);                                     // main shard
    P.T(0.5 - 0.16 * f, 0.34, 0.5 - 0.20 * f, 0.72, 0.14 * f, DK);
    P.head = { x: 0.5 * S, y: 0.46 * S, r: 0.14 * f * S, single: true };
    P.ground = 0.86;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      for (let i = 0; i < 5; i++) {
        const x = (0.16 + i * 0.17) * SS, y = (0.24 + (i % 3) * 0.20) * SS;
        g.tri(x, y, x, y + SS * 0.10 * ff, SS * 0.05 * ff, GL);
      }
      for (let i = 0; i < 4; i++) g.lineOver(0.34 * SS, (0.34 + i * 0.11) * SS, 0.66 * SS, (0.34 + i * 0.11) * SS, GL);
    };
  };

  OV_PAL.amoslurk = ["#161428", "#33305c", "#6f6aa8", "#c8f5e8"];
  OV.amoslurk = function (P) {
    const f = P.f, S = P.S;
    P.T(0.5, 0.30, 0.5, 0.88, 0.50 * f, MD);                                     // hooded shape
    P.E(0.5, 0.32, 0.20 * f, 0.19 * f, MD);
    P.E(0.5, 0.36, 0.145 * f, 0.155 * f, BLK);                                   // where a face should be
    P.head = { x: 0.5 * S, y: 0.36 * S, r: 0.145 * f * S, hollow: true, noMouth: true };
    P.ground = 0.94;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      // a borrowed face, half-rendered, sliding off
      g.ell(0.5 * SS, 0.36 * SS, 0.11 * ff * SS, 0.13 * ff * SS, LT);
      for (let y = Math.floor(0.30 * SS); y < 0.46 * SS; y += 2) g.rect(0.5 * SS - 0.11 * ff * SS, y, 0.22 * ff * SS, 1, DK);
      for (let s = -1; s <= 1; s += 2) { g.ell(0.5 * SS + s * 0.045 * ff * SS, 0.345 * SS, SS * 0.016, SS * 0.02, GL); }
      for (let y = Math.floor(SS * 0.80); y < SS; y++) for (let x = 0; x < SS; x++) if (g.get(x, y) && ((x * 2 + y) % 3)) g.set(x, y, E);
    };
  };
  OV.understudy = function (P) { OV.amoslurk(P); P.boss = true; };
  OV_PAL.understudy = ["#1a1520", "#463a5c", "#8f83b4", "#ffe0e6"];

  // ---- DARKBYTE flagship constructs ---------------------------------
  OV.trojanox = function (P) {
    const f = P.f, S = P.S;
    P.R(0.5 - 0.30 * f, 0.46, 0.60 * f, 0.28 * f, MD);                           // timber ox body
    P.R(0.5 - 0.24 * f, 0.74, 0.09 * f, 0.18 * f, MD);
    P.R(0.5 - 0.06 * f, 0.74, 0.09 * f, 0.18 * f, MD);
    P.R(0.5 - 0.18 * f, 0.26, 0.36 * f, 0.22 * f, MD);                           // blocky head
    P.L(0.5 - 0.18 * f, 0.26, 0.5 - 0.34 * f, 0.16, MD, 0.05 * f);               // horn
    P.head = { x: 0.5 * S, y: 0.36 * S, r: 0.15 * f * S };
    P.ground = 0.94;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      for (let i = 0; i < 5; i++) g.lineOver(0.22 * SS, (0.50 + i * 0.05) * SS, 0.78 * SS, (0.50 + i * 0.05) * SS, SH); // planks
      g.rect(0.42 * SS, 0.56 * SS, 0.16 * ff * SS, 0.12 * ff * SS, BLK);         // the hatch
      g.rect(0.44 * SS, 0.58 * SS, 0.12 * ff * SS, 0.02 * ff * SS, GL);
      g.rect(0.44 * SS, 0.62 * SS, 0.08 * ff * SS, 0.02 * ff * SS, GL);
    };
  };
  OV.wormhack = function (P) {
    const f = P.f, S = P.S;
    for (let i = 0; i < 7; i++) {                                                // lateral-movement worm
      const t = i / 6;
      const x = 0.5 + Math.sin(t * 4.2) * 0.24 * f, y = 0.88 - t * 0.62;
      P.E(x, y, (0.11 - i * 0.006) * f, (0.075 - i * 0.004) * f, i % 2 ? MD : DK);
    }
    const hx = 0.5 + Math.sin(4.2) * 0.24 * f;
    P.E(hx, 0.24, 0.115 * f, 0.10 * f, MD);
    P.head = { x: hx * S, y: 0.24 * S, r: 0.11 * f * S, asym: true, fangs: true };
    P.ground = 0.94;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let i = 0; i < 8; i++) g.ellOver((0.24 + Q.rnd() * 0.52) * SS, (0.30 + Q.rnd() * 0.56) * SS, SS * 0.018, SS * 0.018, GL);
    };
  };
  OV.panoptix = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.48, 0.30 * f, 0.28 * f, MD);                                      // a ball of lenses
    P.head = { x: 0.5 * S, y: 0.48 * S, r: 0.14 * f * S, single: true };
    P.ground = 0.86;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S, ff = Q.f;
      const eyes = [[0.30, 0.36], [0.70, 0.36], [0.26, 0.58], [0.74, 0.58], [0.42, 0.68], [0.58, 0.68], [0.50, 0.26]];
      for (let i = 0; i < eyes.length; i++) {
        const x = eyes[i][0] * SS, y = eyes[i][1] * SS, r = SS * 0.055 * ff;
        g.ell(x, y, r, r, BLK); g.ell(x, y, r * 0.6, r * 0.6, GL); g.set(x - r * 0.3, y - r * 0.3, SHN);
      }
      for (let i = 0; i < 4; i++) g.line(0.5 * SS, 0.16 * SS, (0.30 + i * 0.14) * SS, 0.06 * SS, MET, 1);
    };
  };
  OV.datadrake = function (P) {
    const f = P.f, S = P.S;
    P.E(0.5, 0.62, 0.20 * f, 0.22 * f, MD);
    P.R(0.5 - 0.11 * f, 0.80, 0.08 * f, 0.14 * f, MD);
    P.E(0.5, 0.30, 0.14 * f, 0.12 * f, MD);
    P.T(0.5, 0.42, 0.5, 0.32, 0.10 * f, AC);
    P.T(0.5 - 0.14 * f, 0.34, 0.5 - 0.44 * f, 0.20, 0.28 * f, DK);                // packet-trail wings
    P.head = { x: 0.5 * S, y: 0.30 * S, r: 0.135 * f * S, fangs: true };
    P.ground = 0.94;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let i = 0; i < 8; i++) g.rect((0.08 + (i % 4) * 0.05) * SS, (0.20 + i * 0.035) * SS, SS * 0.06, 1, GL);
      for (let i = 0; i < 8; i++) g.rect((0.86 - (i % 4) * 0.05) * SS, (0.20 + i * 0.035) * SS, SS * 0.06, 1, GL);
    };
  };
  OV.steamloco_overfired = function (P) {
    ARCH.machine.body(P);
    P.boss = true;
    P.extra = function (Q) {
      const g = Q.g, SS = Q.S;
      for (let i = 0; i < 14; i++) g.ell((0.18 + Q.rnd() * 0.64) * SS, (0.04 + Q.rnd() * 0.26) * SS, SS * 0.024, SS * 0.03, GL);
      g.ellOver(0.5 * SS, 0.60 * SS, SS * 0.14, SS * 0.11, TY);
      g.ell(0.5 * SS, 0.60 * SS, SS * 0.06, SS * 0.05, SHN);
    };
  };

  // =================================================================
  // 8. Build pipeline
  // =================================================================
  const ALIAS = {};   // boss forms with no bespoke art fall back to their base
  ALIAS.steamloco_overfired = "steamloco";

  function typeColour(types) {
    const TP = (MQ.Art && MQ.Art.TYPE_PALETTES) || null;
    const t = (types && types[0]) || "normal";
    if (TP && TP[t]) return TP[t][0];
    return "#c8b088";
  }

  function specOf(id) {
    let spec = null;
    if (MQ.Data && MQ.Data.species) spec = MQ.Data.species[id] || null;
    if (!spec && ALIAS[id] && MQ.Data && MQ.Data.species) spec = MQ.Data.species[ALIAS[id]] || null;
    if (spec) return spec;
    // stand-alone fallback so art never depends on the data workstream shipping
    const rnd = U.rng(id + "|fallback");
    return { id: id, name: id, types: ["normal"], tier: "mid", gen: { body: "blob", size: 0.85, feats: ["plain"], palette: FALLBACK_PAL.slice() } };
  }

  function pen(P) {
    const g = P.g, S = P.S;
    P.E = function (fx, fy, rx, ry, v) { g.ell(fx * S, fy * S, rx * S, ry * S, v); };
    P.O = function (fx, fy, rx, ry, v) { g.ellOver(fx * S, fy * S, rx * S, ry * S, v); };
    P.R = function (fx, fy, fw, fh, v) { g.rect(fx * S, fy * S, Math.max(1, fw * S), Math.max(1, fh * S), v); };
    P.L = function (x0, y0, x1, y1, v, th) { g.line(x0 * S, y0 * S, x1 * S, y1 * S, v, Math.max(1, (th || 0.02) * S)); };
    P.LO = function (x0, y0, x1, y1, v) { g.lineOver(x0 * S, y0 * S, x1 * S, y1 * S, v); };
    P.T = function (ax, ay, bx, by, bw, v) { g.tri(ax * S, ay * S, bx * S, by * S, Math.max(1, bw * S), v); };
    P.D = function (fx, fy, v) { g.set(fx * S, fy * S, v); };
    return P;
  }

  function buildGrid(id, kind) {
    const spec = specOf(id);
    const gen = spec.gen || {};
    const S = SIZES[kind] || SIZES.front;
    const g = new Grid(S, S);
    const types = spec.types || ["normal"];
    const bodyDef = B[gen.body] || B.blob;
    const size = typeof gen.size === "number" ? gen.size : 0.85;
    let f = U.clamp(0.72 + (size - 0.62) * 0.30, 0.68, 1.0);
    if (S < 30) f = Math.min(1.0, f * 1.18);
    const P = {
      g: g, S: S, id: id, kind: kind, spec: spec, gen: gen, types: types,
      hint: bodyDef.hint || {}, archName: bodyDef.arch, f: f, size: size,
      small: S < 30, rnd: U.rng(id + "|art"), flags: scanFeats(gen.feats),
      head: null, ground: 0.94, extra: null, noFeatures: false,
      darkbyte: !!DARKBYTE[id]
    };
    P.hasType = function (t) { return types.indexOf(t) >= 0; };
    pen(P);
    const arch = ARCH[P.archName] || ARCH.blob;
    const ov = OV[id];
    if (ov) ov(P); else arch.body(P);
    preFeatures(P);
    g.mirror();
    const ex = P.extra || (ov ? null : arch.extra);
    if (ex) ex(P);
    g.shade(MD);
    g.outline(OUT);
    if (kind === "back") drawBack(P); else drawFace(P);
    postFeatures(P);
    if (P.darkbyte && !P.small) {
      // faction mark: a black lozenge with a glowing slash, low on the body
      const mx = S * 0.5, my = S * 0.84;
      g.ell(mx, my, S * 0.05, S * 0.04, BLK);
      g.line(mx - S * 0.03, my + S * 0.015, mx + S * 0.03, my - S * 0.015, GL, 1);
    }
    return { grid: g, spec: spec, types: types };
  }

  // =================================================================
  // 9. Public API
  // =================================================================
  const MA = {};
  const cache = new Map();
  let builds = 0, hits = 0;

  MA.SIZES = SIZES;
  MA.KINDS = ["front", "back", "icon"];
  MA.ARCHETYPES = Object.keys(ARCH);

  MA.archetypeOf = function (id) {
    const spec = specOf(id);
    const d = B[(spec.gen && spec.gen.body) || "blob"];
    return OV[id] ? "hand" : (d ? d.arch : "blob");
  };
  MA.isHandDrawn = function (id) { return !!OV[id]; };
  MA.has = function (id) { return !!(MQ.Data && MQ.Data.species && MQ.Data.species[id]); };
  MA.ids = function () {
    const out = [];
    if (MQ.Data && MQ.Data.species) for (const k in MQ.Data.species) if (Object.prototype.hasOwnProperty.call(MQ.Data.species, k)) out.push(k);
    return out;
  };

  MA.shinyParams = function (id) {
    const h = U.hash(String(id) + "shiny");
    const rnd = U.mulberry32(h);
    return { dh: 0.28 + rnd() * 0.44, ds: 0.12 + rnd() * 0.30, dl: (rnd() - 0.4) * 0.10 };
  };

  MA.palette = function (id, shiny) {
    const spec = specOf(id);
    const base = (spec.gen && spec.gen.palette) || FALLBACK_PAL;
    const pal = OV_PAL[id] || base;
    return buildPalette(pal, typeColour(spec.types), shiny ? MA.shinyParams(id) : null);
  };

  MA.sprite = function (id, kind, opts) {
    kind = kind || "front";
    if (!SIZES[kind]) kind = "front";
    opts = opts || {};
    const shiny = !!opts.shiny;
    const key = id + "|" + kind + (shiny ? "|s" : "");
    let c = cache.get(key);
    if (c) { hits++; return c; }
    const built = buildGrid(id, kind);
    let pal = MA.palette(id, shiny);
    if (kind === "back") {
      pal = pal.slice();
      pal[LT] = U.mix(pal[LT], pal[DK], 0.35);
      pal[MD] = U.mix(pal[MD], pal[DK], 0.30);
      pal[HI] = U.mix(pal[HI], pal[MD], 0.35);
    }
    c = built.grid.toCanvas(pal, 1);
    builds++;
    cache.set(key, c);
    return c;
  };

  MA.silhouette = function (id, kind, colour) {
    kind = kind || "front";
    const key = id + "|" + kind + "|sil" + (colour || "");
    let c = cache.get(key);
    if (c) { hits++; return c; }
    const built = buildGrid(id, kind);
    const pal = new Array(NSLOT);
    for (let i = 1; i < NSLOT; i++) pal[i] = colour || "#1b1726";
    c = built.grid.toCanvas(pal, 1);
    cache.set(key, c);
    return c;
  };

  // Draw a sprite scaled and pixel-snapped. `scale` may be fractional;
  // `x,y` is the CENTRE-BOTTOM of the sprite (where the creature stands).
  MA.draw = function (ctx, id, kind, x, y, scale, opts) {
    opts = opts || {};
    const c = opts.silhouette ? MA.silhouette(id, kind, opts.silhouette === true ? null : opts.silhouette)
                              : MA.sprite(id, kind, opts);
    if (!c) return;
    scale = scale || 1;
    const w = c.width * scale, h = c.height * scale;
    const dx = Math.round(x - w * 0.5), dy = Math.round(y - h);
    const a = opts.alpha;
    if (a !== undefined && a !== 1) { ctx.save(); ctx.globalAlpha = a; }
    if (opts.flip) {
      ctx.save();
      ctx.translate(dx + w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(c, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(c, dx, dy, w, h);
    }
    if (a !== undefined && a !== 1) ctx.restore();
    return { x: dx, y: dy, w: w, h: h };
  };

  MA.warm = function (ids) {
    const list = ids || MA.ids();
    for (let i = 0; i < list.length; i++) {
      try { MA.sprite(list[i], "front"); MA.sprite(list[i], "icon"); }
      catch (e) { MQ.warn("[MonsterArt] " + list[i] + " failed", e); }
    }
  };
  MA.clearCache = function () { cache.clear(); };
  MA.stats = function () { return { cached: cache.size, builds: builds, hits: hits, hand: Object.keys(OV).length }; };

  // exposed so js/art/people.js and tests can reuse the raster helpers
  MA.Grid = Grid;
  MA.SLOTS = { E: E, OUT: OUT, DK: DK, MD: MD, LT: LT, AC: AC, GL: GL, EYE: EYE, SHN: SHN, SH: SH, HI: HI, TY: TY, TYL: TYL, BLK: BLK, WHT: WHT, MET: MET, MEL: MEL, N: NSLOT };
  MA.makeCanvas = makeCanvas;
  MA.hueShift = hueShift;

  MQ.MonsterArt = MA;
})();
