// =============================================================
// MonsterQuest v2 — MQ.Overworld: the walking-around scene
// Free 8-way pixel movement, sliding collision, ledges, water and crags,
// a soft look-ahead camera, chunk-cached layered rendering, animated tiles,
// NPCs and trainer sight-lines, the cats at your heel, wild encounters,
// weather and light, and the HUD (banner, tracker, mini-map, SIGNAL, CUTOVER).
// Owned by: world workstream. Scene id: 'overworld' (MQ.Clock keys off it).
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;
  const T = MQ.TILE;                     // 32 logical px per tile

  const O = { id: "overworld" };

  // ---- tuning (ENGINE-ARCHITECTURE §5.3) ---------------------------------
  const WALK = 4.2 * T;                  // px/s
  const RUN = 7.0 * T;
  const BOX_W = 20, BOX_H = 14;          // feet box
  const HALF_W = BOX_W / 2, HALF_H = BOX_H / 2;
  const GRASS_MULT = 0.85, RAIN_MULT = 0.9, BOAT_MULT = 0.85, BIKE_MULT = 1.22;
  const CHUNK = 8, CHUNK_PX = CHUNK * T;
  const CAM_LOOKAHEAD = 44, CAM_SMOOTH = 0.0012;
  const HOP_MS = 400, HOP_DIST = T * 1.5;
  const ANIM_MS = 220;

  O.TUNING = { WALK: WALK, RUN: RUN, BOX_W: BOX_W, BOX_H: BOX_H, CHUNK: CHUNK };

  // ---- state -------------------------------------------------------------
  O.state = {
    map: null, px: 0, py: 0, dir: "down",
    abilities: new Set(), steps: 0,
    boating: false, respawn: null, visited: {}
  };

  const player = {
    id: "player", x: 0, y: 0, px: 0, py: 0, dir: "down",
    sprite: "player", frame: 0, animT: 0, moving: false, running: false,
    hop: null, speed: 0, vx: 0, vy: 0, cat: false, def: {}, scripted: null,
    bob: 0, sitting: false, emoteKind: null, emoteT: 0, emoteMs: 0, hidden: false, active: true
  };
  O.player = player;

  let map = null;                        // current map def
  let rt = null;                         // World.prepare(map)
  let npcs = [];                         // live MQ.NPC entities on this map
  const npcById = {};
  let cats = [];                         // follower entities
  let frozen = false, busy = 0, hudHidden = false, minimapOn = false;
  let animFrame = 0, timeAcc = 0;
  let lastTileX = -1, lastTileY = -1;
  let stepSfxAcc = 0;
  const drawList = [];
  const trigBuf = [];

  O.freeze = function (b) { frozen = b !== false; if (frozen) { player.vx = 0; player.vy = 0; } };
  O.frozen = function () { return frozen; };
  O.hideHud = function (b) { hudHidden = b !== false; };
  O.busy = function () { return busy > 0; };
  function hold() { busy++; }
  function release() { busy = Math.max(0, busy - 1); }

  O.locked = function () {
    return frozen || busy > 0 ||
      (MQ.Script && MQ.Script.busy()) ||
      (MQ.Dialog && MQ.Dialog.isOpen()) ||
      MQ.Scenes.top() !== O;
  };

  // ---- collision ---------------------------------------------------------
  function blockedTile(x, y) {
    if (!rt) return true;
    return MQ.World.blocked(map, x, y, O.state.abilities);
  }
  O.blockedTile = blockedTile;

  // Is the 20x14 feet box clear at pixel centre (px, py)?
  function boxClear(px, py) {
    const x0 = Math.floor((px - HALF_W + 0.001) / T), x1 = Math.floor((px + HALF_W - 0.001) / T);
    const y0 = Math.floor((py - HALF_H + 0.001) / T), y1 = Math.floor((py + HALF_H - 0.001) / T);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (blockedTile(x, y)) return false;
      if (npcSolidAt(x, y)) return false;
    }
    return true;
  }
  O.boxClear = boxClear;

  function npcSolidAt(x, y) {
    for (let i = 0; i < npcs.length; i++) {
      const e = npcs[i];
      if (!e.solid || !MQ.NPC.visible(e)) continue;
      if (e.x === x && e.y === y) return true;
      if (e.moving && (e.x - e.mdx) === x && (e.y - e.mdy) === y) return true;
    }
    return false;
  }

  // ---- map loading -------------------------------------------------------
  const chunkCache = {};                 // "layer:cx,cy" → {canvas, anim:[]}
  let chunkKeys = [];

  function clearChunks() {
    const ks = Object.keys(chunkCache);
    for (let i = 0; i < ks.length; i++) delete chunkCache[ks[i]];
    chunkKeys.length = 0;
    minimapCanvas = null;
  }
  O.invalidateChunks = clearChunks;

  function makeCanvas(w, h) {
    if (MQ.Art && MQ.Art.canvas) return MQ.Art.canvas(w, h);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  function buildChunk(layer, cx, cy) {
    const key = layer + ":" + cx + "," + cy;
    const c = makeCanvas(CHUNK_PX, CHUNK_PX);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    const anim = [];
    const arr = rt[layer];
    const x0 = cx * CHUNK, y0 = cy * CHUNK;
    for (let y = 0; y < CHUNK; y++) {
      const ty = y0 + y;
      if (ty >= rt.h) break;
      for (let x = 0; x < CHUNK; x++) {
        const tx = x0 + x;
        if (tx >= rt.w) break;
        const id = arr[ty * rt.w + tx];
        if (!id) continue;
        const props = MQ.Tiles.props(id);
        if (props && props.anim && props.anim.length > 1) { anim.push(tx, ty, x * T, y * T); continue; }
        const seed = (tx * 73856093) ^ (ty * 19349663);
        const src = MQ.Tiles.get(id, 0, seed & 0x7fffffff);
        if (src) g.drawImage(src, 0, 0, 16, 16, x * T, y * T, T, T);
      }
    }
    const entry = { canvas: c, anim: anim, layer: layer, cx: cx, cy: cy };
    chunkCache[key] = entry;
    chunkKeys.push(key);
    if (chunkKeys.length > 160) {         // simple LRU-ish cap for big maps
      const drop = chunkKeys.shift();
      delete chunkCache[drop];
    }
    return entry;
  }

  function getChunk(layer, cx, cy) {
    const key = layer + ":" + cx + "," + cy;
    return chunkCache[key] || buildChunk(layer, cx, cy);
  }

  // Change a tile at runtime (boulders, opened gates, story damage).
  O.setTile = function (x, y, tileId, layer) {
    layer = layer || "ground";
    const i = MQ.World.idx(map, x, y);
    if (i < 0 || !rt) return false;
    rt[layer][i] = tileId;
    const props = tileId ? MQ.Tiles.props(tileId) : null;
    if (layer !== "over") {
      rt.solid[i] = props && (props.solid || props.water) ? 1 : 0;
      rt.water[i] = props && props.water ? 1 : 0;
      rt.zone[i] = props && props.encounter === "grass" ? 1 : props && props.encounter === "water" ? 2 : props && props.encounter === "cave" ? 3 : 0;
      rt.interact[i] = (props && props.interact) || null;
      rt.slow[i] = props && props.grass ? 1 : 0;
      if (!tileId) { rt.solid[i] = 1; rt.voidCell[i] = 1; } else rt.voidCell[i] = 0;
    }
    const key = layer + ":" + Math.floor(x / CHUNK) + "," + Math.floor(y / CHUNK);
    delete chunkCache[key];
    minimapCanvas = null;
    return true;
  };

  // ---- loading a map -----------------------------------------------------
  function loadMap(id, keepEntities) {
    const m = MQ.World.get(id);
    if (!m) { MQ.warn("[Overworld] no such map: " + id); return false; }
    map = m;
    rt = MQ.World.prepare(m);
    O.state.map = id;
    zoom = fitZoom();
    clearChunks();
    if (!keepEntities) spawnNpcs();
    lastTileX = -1; lastTileY = -1;
    O.state.visited[id] = (O.state.visited[id] || 0) + 1;
    // clock zone + weather + music + ambience
    if (MQ.Clock) MQ.Clock.setZone(m.outdoor === false ? "indoor" : (m.weatherZone || m.region || "default"));
    if (MQ.Audio && MQ.Audio.playSong && m.music) MQ.Audio.playSong(m.music);
    MQ.Events.emit("map", { map: id, def: m });
    return true;
  }
  O.currentMap = function () { return map; };

  function spawnNpcs() {
    npcs.length = 0;
    const ks = Object.keys(npcById);
    for (let i = 0; i < ks.length; i++) delete npcById[ks[i]];
    const defs = (map && map.npcs) || [];
    for (let i = 0; i < defs.length; i++) addNpcFromDef(defs[i]);
    // NPCs the story spawned onto this map at runtime
    for (let i = 0; i < spawned.length; i++) if (spawned[i].map === map.id) addNpcFromDef(spawned[i].def, true);
  }
  const spawned = [];                   // runtime-spawned NPCs, persisted in the save

  function addNpcFromDef(def, runtime) {
    const e = MQ.NPC.create(def, map.id);
    e.runtime = !!runtime;
    npcs.push(e);
    npcById[e.id] = e;
    return e;
  }

  // ---- camera ------------------------------------------------------------
  const cam = { x: 0, y: 0, lx: 0, ly: 0, follow: true, pan: null };
  O.camera = cam;

  // World zoom. Small maps (shops, front rooms, lab floors) used to be drawn 1:1
  // and sat in a big black frame on a 1280x800 screen. We scale the whole world
  // up by a fixed step so the room fills as much of the view as it can without
  // cropping, and letterbox whatever is left with a room-appropriate backdrop.
  // The camera and every tile->screen sum below work in WORLD px; viewW()/viewH()
  // are the world-space viewport (screenW()/screenH() are the real screen).
  // Eighth steps: T is 32, so every step lands a tile on a whole number of
  // screen pixels (32 * 0.125 = 4) — no seams between chunk blits, no blur.
  const ZOOM_STEPS = (function () {
    const a = [];
    for (let k = 8; k <= 32; k++) a.push(k / 8);   // 1.0 .. 4.0
    return a;
  })();
  let zoom = 1;
  O.zoom = function () { return zoom; };

  function screenW() { return MQ.View.w; }
  function screenH() { return MQ.View.h; }
  function viewW() { return MQ.View.w / zoom; }
  function viewH() { return MQ.View.h / zoom; }

  // Largest step that still shows the whole map: never crops, never below 1.
  function fitZoom() {
    if (!rt) return 1;
    const mw = rt.w * T, mh = rt.h * T;
    if (mw <= 0 || mh <= 0) return 1;
    const fit = Math.min(screenW() / mw, screenH() / mh);
    let z = 1;
    for (let i = 0; i < ZOOM_STEPS.length; i++) if (ZOOM_STEPS[i] <= fit + 1e-6) z = ZOOM_STEPS[i];
    return z;
  }
  function applyZoom() {
    const z = fitZoom();
    if (z === zoom) return false;
    zoom = z;
    clampCam();
    return true;
  }
  O.applyZoom = applyZoom;

  // Camera offset snapped so that the scaled result lands on whole screen pixels
  // — integer-ish steps keep the pixel art crisp at 1.5x/2x/3x.
  function camOx() { return Math.round(cam.x * zoom) / zoom; }
  function camOy() { return Math.round(cam.y * zoom) / zoom; }

  // Public tile/world <-> screen maths, so interaction, picking, the mini-map
  // and FX all agree with what was actually drawn.
  O.toScreen = function (wx, wy) { return { x: (wx - camOx()) * zoom, y: (wy - camOy()) * zoom }; };
  O.toWorld = function (sx, sy) { return { x: sx / zoom + camOx(), y: sy / zoom + camOy() }; };
  O.tileToScreen = function (tx, ty) { return O.toScreen(tx * T + T / 2, ty * T + T / 2); };
  O.tileAtScreen = function (sx, sy) {
    const w = O.toWorld(sx, sy);
    return { x: Math.floor(w.x / T), y: Math.floor(w.y / T) };
  };
  // Where the map itself sits on screen (the rest of the view is letterbox).
  O.mapScreenRect = function () {
    if (!rt) return { x: 0, y: 0, w: 0, h: 0 };
    const p = O.toScreen(0, 0);
    return { x: p.x, y: p.y, w: rt.w * T * zoom, h: rt.h * T * zoom };
  };

  function clampCam() {
    const mw = rt ? rt.w * T : 0, mh = rt ? rt.h * T : 0;
    const vw = viewW(), vh = viewH();
    cam.x = mw <= vw ? (mw - vw) / 2 : U.clamp(cam.x, 0, mw - vw);
    cam.y = mh <= vh ? (mh - vh) / 2 : U.clamp(cam.y, 0, mh - vh);
  }

  function snapCamera() {
    const v = U.dirVec[player.dir] || [0, 1];
    cam.lx = v[0] * CAM_LOOKAHEAD; cam.ly = v[1] * CAM_LOOKAHEAD;
    cam.x = player.px + cam.lx - viewW() / 2;
    cam.y = player.py + cam.ly - viewH() / 2;
    clampCam();
  }
  O.snapCamera = snapCamera;

  function updateCamera(dt) {
    if (cam.pan) {
      const p = cam.pan;
      p.t += dt;
      const k = U.clamp(p.t / p.ms, 0, 1);
      const e = U.ease.inOutQuad(k);
      cam.x = U.lerp(p.fx, p.tx, e);
      cam.y = U.lerp(p.fy, p.ty, e);
      clampCam();
      if (k >= 1) { const done = p.resolve; cam.pan = null; if (done) done(); }
      return;
    }
    if (!cam.follow) return;
    const v = U.dirVec[player.dir] || [0, 1];
    const moving = player.moving || player.hop;
    const targetLx = moving ? v[0] * CAM_LOOKAHEAD : 0;
    const targetLy = moving ? v[1] * CAM_LOOKAHEAD : 0;
    const lk = 1 - Math.pow(0.02, dt / 1000);
    cam.lx += (targetLx - cam.lx) * lk;
    cam.ly += (targetLy - cam.ly) * lk;
    const tx = player.px + cam.lx - viewW() / 2;
    const ty = player.py + cam.ly - viewH() / 2;
    const k = 1 - Math.pow(CAM_SMOOTH, dt / 1000);
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;
    clampCam();
  }

  O.cameraTo = function (x, y, ms) {
    // x,y in tiles (script command `camera(x,y,ms)`)
    return new Promise(function (resolve) {
      cam.follow = false;
      cam.pan = { fx: cam.x, fy: cam.y, tx: x * T + T / 2 - viewW() / 2, ty: y * T + T / 2 - viewH() / 2, ms: ms || 800, t: 0, resolve: resolve };
      if (!ms) { cam.x = cam.pan.tx; cam.y = cam.pan.ty; clampCam(); cam.pan = null; resolve(); }
    });
  };
  O.cameraFollow = function () { cam.follow = true; cam.pan = null; return Promise.resolve(); };

  // ---- movement ----------------------------------------------------------
  function speedHere() {
    let s = player.running ? RUN : WALK;
    const i = MQ.World.idx(map, player.x, player.y);
    if (i >= 0 && rt.slow[i]) s *= GRASS_MULT;
    if (map.outdoor !== false && MQ.Clock && MQ.Clock.weatherOf(map.weatherZone) === "rain" && !hasTrinket("rain_cloak")) s *= RAIN_MULT;
    if (O.state.boating) s *= BOAT_MULT;
    else if (player.running && O.state.abilities.has("bike")) s *= BIKE_MULT;
    return s;
  }
  function hasTrinket(id) {
    if (MQ.Trainer && MQ.Trainer.trinkets && MQ.Trainer.trinkets.indexOf) return MQ.Trainer.trinkets.indexOf(id) >= 0;
    return !!MQ.Flags.get("trinket_" + id);
  }

  function tryMove(dx, dy) {
    let moved = false;
    if (dx) {
      if (boxClear(player.px + dx, player.py)) { player.px += dx; moved = true; }
      else {
        // slide up to the wall, then try a small corner assist so doorways forgive
        const step = U.sign(dx);
        let k = Math.abs(dx);
        while (k > 0.5) { k *= 0.5; if (boxClear(player.px + step * k, player.py)) { player.px += step * k; moved = true; break; } }
        if (!moved && !dy) {
          for (let n = 1; n <= 3; n++) {
            if (boxClear(player.px + dx, player.py + n * 2) && boxClear(player.px, player.py + n * 2)) { player.py += n * 2; moved = true; break; }
            if (boxClear(player.px + dx, player.py - n * 2) && boxClear(player.px, player.py - n * 2)) { player.py -= n * 2; moved = true; break; }
          }
        }
      }
    }
    if (dy) {
      if (boxClear(player.px, player.py + dy)) { player.py += dy; moved = true; }
      else {
        const step = U.sign(dy);
        let k = Math.abs(dy);
        let ok = false;
        while (k > 0.5) { k *= 0.5; if (boxClear(player.px, player.py + step * k)) { player.py += step * k; ok = true; break; } }
        if (!ok && !dx) {
          for (let n = 1; n <= 3; n++) {
            if (boxClear(player.px + n * 2, player.py + dy) && boxClear(player.px + n * 2, player.py)) { player.px += n * 2; ok = true; break; }
            if (boxClear(player.px - n * 2, player.py + dy) && boxClear(player.px - n * 2, player.py)) { player.px -= n * 2; ok = true; break; }
          }
        }
        moved = moved || ok;
      }
    }
    return moved;
  }

  function startHop(dir) {
    const v = U.dirVec[dir];
    player.hop = { dir: dir, t: 0, fx: player.px, fy: player.py, tx: player.px + v[0] * HOP_DIST, ty: player.py + v[1] * HOP_DIST };
    player.dir = dir;
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("ledge_hop");
  }

  function updateHop(dt) {
    const h = player.hop;
    h.t += dt;
    const k = U.clamp(h.t / HOP_MS, 0, 1);
    player.px = U.lerp(h.fx, h.tx, k);
    player.py = U.lerp(h.fy, h.ty, k);
    player.bob = -Math.sin(k * Math.PI) * 16;
    player.animT += dt;
    player.frame = 1;
    if (k >= 1) {
      player.hop = null; player.bob = 0;
      for (let i = 0; i < 5; i++) emitParticle(player.px + (i - 2) * 5, player.py, 2, (i - 2) * 26, -40, 300);
      syncTile(true);
    }
  }

  // Ledge in front? (auto-hop, down-only unless the tile says otherwise)
  function ledgeAhead(dir) {
    const v = U.dirVec[dir];
    if (!v) return false;
    const nx = Math.floor((player.px + v[0] * (HALF_W + 6)) / T);
    const ny = Math.floor((player.py + v[1] * (HALF_H + 6)) / T);
    const l = MQ.World.ledgeAt(map, nx, ny);
    if (!l || l !== dir) return false;
    // the landing tile must be clear
    const lx = Math.floor((player.px + v[0] * HOP_DIST) / T), ly = Math.floor((player.py + v[1] * HOP_DIST) / T);
    return !blockedTile(lx, ly);
  }

  // Would this step put the feet box into a ledge from its blind side?
  function ledgeBlocked(dir, dx, dy) {
    const px = player.px + dx, py = player.py + dy;
    const x0 = Math.floor((px - HALF_W + 0.001) / T), x1 = Math.floor((px + HALF_W - 0.001) / T);
    const y0 = Math.floor((py - HALF_H + 0.001) / T), y1 = Math.floor((py + HALF_H - 0.001) / T);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (MQ.World.ledgeBlocks(map, x, y, dir)) return true;
    }
    return false;
  }

  function updatePlayer(dt) {
    if (player.hop) { updateHop(dt); return; }
    if (player.scripted) { updateScriptedMove(dt); return; }
    const ax = MQ.Input.axis();
    let vx = ax.x, vy = ax.y;
    const mag = ax.mag;
    if (mag < 0.2) { vx = 0; vy = 0; }
    player.running = MQ.Input.held("run") || (MQ.Input.lastSource !== "key" && mag > 0.85);
    if (!vx && !vy) {
      player.moving = false;
      player.frame = 0;
      player.animT = 0;
      return;
    }
    // normalise so diagonals aren't quicker
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 1) { vx /= len; vy /= len; }
    const dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : (vy < 0 ? "up" : "down");
    player.dir = dir;
    if (ledgeAhead(dir)) { startHop(dir); return; }
    const s = speedHere() * (dt / 1000);
    if (vx && ledgeBlocked(vx < 0 ? "left" : "right", vx * s, 0)) vx = 0;
    if (vy && ledgeBlocked(vy < 0 ? "up" : "down", 0, vy * s)) vy = 0;
    if (!vx && !vy) { player.moving = false; return; }
    const moved = tryMove(vx * s, vy * s);
    player.moving = moved;
    if (moved) {
      player.animT += dt * (player.running ? 1.5 : 1);
      player.frame = MQ.NPC.FRAMES[Math.floor(player.animT / 120) % 4];
      footstep(dt);
      walkParticles(dt);
      if (!O.state.boating) {
        const g = rt.ground[MQ.World.idx(map, player.x, player.y)] || "";
        const cycleway = g === "towpath" || g === "path_tarmac" || g === "road" || g === "rail_track_h";
        player.sprite = (player.running && O.state.abilities.has("bike") && cycleway) ? "player_bike" : "player";
      }
    } else {
      player.frame = MQ.NPC.FRAMES[Math.floor((player.animT += dt * 0.4) / 200) % 4];
      bumpHint(dir);
    }
    syncTile(false);
  }

  let bumpT = 0;
  function bumpHint(dir) {
    bumpT += 1;
    if (bumpT < 26) return;
    bumpT = 0;
    const v = U.dirVec[dir];
    const nx = Math.floor((player.px + v[0] * (HALF_W + 6)) / T), ny = Math.floor((player.py + v[1] * (HALF_H + 6)) / T);
    const why = MQ.World.blockReason(map, nx, ny, O.state.abilities);
    if (!why || why === "solid") return;
    const lines = {
      water: "Deep water. You'd want a boat, or gills.",
      climb: "Good holds — if you had the grips for it.",
      catgap: "A gap a cat could manage. You could not.",
      bog: "The bog swallows your boot to the ankle. Waders, then.",
      hedge: "Hawthorn, laid tight. A billhook would open it."
    };
    if (lines[why] && MQ.Dialog) MQ.Dialog.notify(lines[why]);
  }

  function footstep(dt) {
    stepSfxAcc += dt;
    const gap = player.running ? 220 : 340;
    if (stepSfxAcc < gap) return;
    stepSfxAcc = 0;
    if (!MQ.Audio || !MQ.Audio.sfx) return;
    const g = rt.ground[MQ.World.idx(map, player.x, player.y)] || "";
    let s = "step_grass";
    if (g.indexOf("path") === 0 || g.indexOf("pavement") === 0 || g.indexOf("floor_stone") === 0 || g.indexOf("cobble") >= 0) s = "step_stone";
    else if (g.indexOf("floor_wood") === 0 || g.indexOf("bridge_wood") === 0 || g.indexOf("platform") === 0) s = "step_wood";
    else if (g.indexOf("salt") === 0) s = "step_salt";
    else if (g.indexOf("water") === 0 || g.indexOf("shallow") === 0) s = "step_water";
    MQ.Audio.sfx(s);
  }

  // ---- scripted movement (MQ.Script `move`) ------------------------------
  function updateScriptedMove(dt) {
    const sc = player.scripted;
    const tx = sc.tx * T + T / 2, ty = sc.ty * T + T / 2;
    const dx = tx - player.px, dy = ty - player.py;
    const d = Math.sqrt(dx * dx + dy * dy);
    const s = (sc.speed || WALK) * (dt / 1000);
    if (d <= s) {
      player.px = tx; player.py = ty;
      syncTile(false);
      nextScriptedStep();
      return;
    }
    player.px += dx / d * s; player.py += dy / d * s;
    player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    player.moving = true;
    player.animT += dt;
    player.frame = MQ.NPC.FRAMES[Math.floor(player.animT / 120) % 4];
    syncTile(false);
  }

  function nextScriptedStep() {
    const sc = player.scripted;
    if (!sc) return;
    if (!sc.queue.length) {
      player.scripted = null;
      player.moving = false;
      player.frame = 0;
      if (sc.resolve) sc.resolve();
      return;
    }
    const next = sc.queue.shift();
    sc.tx = next.x; sc.ty = next.y;
  }

  // ---- tile-enter events -------------------------------------------------
  function syncTile(force) {
    const nx = Math.floor(player.px / T), ny = Math.floor(player.py / T);
    if (!force && nx === player.x && ny === player.y) return;
    player.x = nx; player.y = ny;
    O.state.px = player.px; O.state.py = player.py; O.state.dir = player.dir;
    if (nx === lastTileX && ny === lastTileY) return;
    lastTileX = nx; lastTileY = ny;
    onTileEnter(nx, ny);
  }

  function onTileEnter(x, y) {
    O.state.steps++;
    MQ.Events.emit("step", { map: map.id, x: x, y: y, steps: O.state.steps });
    // the boat picks you up at the water's edge and drops you on dry land
    const onWater = !!rt.water[MQ.World.idx(map, x, y)];
    if (O.state.boating && !onWater) O.setBoat(false);
    else if (!O.state.boating && onWater && O.state.abilities.has("boat")) O.setBoat(true);
    // warps (doors, stairs, cave mouths, map edges)
    const w = MQ.World.warpAt(map, x, y);
    if (w && w.kind !== "look") {
      if (!w.cond || MQ.Flags.test(w.cond)) {
        O.warp(w.to, w.tx, w.ty, w.dir || player.dir, { fade: w.kind !== "edge", kind: w.kind });
        return;
      }
    }
    // triggers
    MQ.World.triggersAt(map, x, y, trigBuf);
    for (let i = 0; i < trigBuf.length; i++) {
      const tr = trigBuf[i];
      if (tr.kind === "interact") continue;
      if (tr.once && MQ.Flags.get(tr.once)) continue;
      if (tr.cond && !MQ.Flags.test(tr.cond)) continue;
      if (tr.once) MQ.Flags.set(tr.once, true);
      runTrigger(tr);
      return;
    }
    // wild encounters
    if (!O.locked()) {
      const enc = MQ.Encounters.step(map, x, y, { boating: O.state.boating });
      if (enc) { startWild(enc); return; }
    }
    if (MQ.Quests && MQ.Quests.check) MQ.Quests.check();
  }

  function runTrigger(tr) {
    const scripts = (MQ.Story && (MQ.Story.npcScripts || MQ.Story.scripts)) || null;
    const fn = scripts && (scripts[tr.script] || (MQ.Story.scripts && MQ.Story.scripts[tr.script]));
    MQ.Events.emit("trigger", { map: map.id, trigger: tr });
    if (!fn) { if (tr.say && MQ.Dialog) MQ.Dialog.say(tr.say); return; }
    MQ.Script.run(fn, { map: map, player: player, trigger: tr, S: MQ.Script.cmds });
  }

  function startWild(enc) {
    hold();
    const world = makeWorldCtx();
    const trans = MQ.Scenes.transition ? MQ.Scenes.transition("battle", 420) : Promise.resolve();
    trans.then(function () {
      if (MQ.Audio && MQ.Audio.playSong) MQ.Audio.playSong(enc.rare ? "battle_legendary" : "battle_wild");
      return MQ.Interact.wildBattle(world, enc);
    }).then(function () {
      release();
      if (MQ.Audio && MQ.Audio.playSong && map.music) MQ.Audio.playSong(map.music);
      if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    }, function (e) { release(); MQ.warn("[Overworld] wild battle failed", e); });
  }

  // ---- warping -----------------------------------------------------------
  O.warp = function (mapId, x, y, dir, opts) {
    opts = opts || {};
    if (!MQ.World.has(mapId)) { MQ.warn("[Overworld] warp to unknown map " + mapId); return Promise.resolve(); }
    hold();
    const fade = opts.fade !== false;
    if (MQ.Audio && MQ.Audio.sfx && opts.kind === "door") MQ.Audio.sfx("door");
    else if (MQ.Audio && MQ.Audio.sfx && fade) MQ.Audio.sfx("warp");
    const cover = fade ? (MQ.Scenes.transition ? MQ.Scenes.transition(opts.transition || "fade", opts.ms || 320) : Promise.resolve()) : Promise.resolve();
    return cover.then(function () {
      const wasMap = O.state.map;
      loadMap(mapId, false);
      O.place(x, y, dir || "down");
      snapCamera();
      MQ.NPC.trailReset(player.px, player.py, player.dir);
      resetCats();
      if (wasMap !== mapId) banner();
      release();
      if (MQ.Save && MQ.Save.autosave && opts.autosave !== false) MQ.Save.autosave();
      MQ.Events.emit("warp", { from: wasMap, to: mapId, x: x, y: y });
    });
  };

  O.place = function (x, y, dir) {
    player.x = x | 0; player.y = y | 0;
    player.px = player.x * T + T / 2; player.py = player.y * T + T / 2;
    player.dir = dir || player.dir;
    player.hop = null; player.scripted = null; player.moving = false;
    lastTileX = player.x; lastTileY = player.y;
    O.state.px = player.px; O.state.py = player.py; O.state.dir = player.dir;
    O.state.boating = O.state.boating && rt && !!rt.water[MQ.World.idx(map, player.x, player.y)];
  };

  O.spawn = function (mapId, x, y, dir) {
    const id = mapId || O.state.map || MQ.World.ids()[0];
    loadMap(id, false);
    const sp = (x === undefined) ? MQ.World.spawnOf(map) : { x: x, y: y };
    O.place(sp.x, sp.y, dir || "down");
    snapCamera();
    MQ.NPC.trailReset(player.px, player.py, player.dir);
    resetCats();
    return map;
  };

  function banner() {
    if (hudHidden) return;
    const sub = map.landmark ? map.landmark.name : (map.outdoor === false ? "Inside" : (MQ.Clock ? MQ.Clock.timeString() : ""));
    if (MQ.UI && MQ.UI.banner) MQ.UI.banner(map.name || map.id, sub);
  };

  // ---- boat / shove / climb ----------------------------------------------
  O.setBoat = function (on) {
    O.state.boating = !!on;
    player.sprite = on ? "player_boat" : "player";
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx(on ? "boat_chug" : "step_wood");
    MQ.Events.emit("boat", { on: !!on });
  };

  // BIGBOY leans on a boulder: shove it one tile away from the player.
  O.shove = function (x, y) {
    const v = U.dirVec[player.dir];
    const nx = x + v[0], ny = y + v[1];
    if (blockedTile(nx, ny)) return false;
    const id = rt.ground[MQ.World.idx(map, x, y)];
    O.setTile(x, y, map.underBoulder || "path_dirt");
    O.setTile(nx, ny, id);
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("hit_normal");
    MQ.Scenes.shake(180, 3);
    return true;
  };

  O.climbAt = function (x, y) {
    // step over a climbable crag: land on the far side
    const v = U.dirVec[player.dir];
    const lx = x + v[0], ly = y + v[1];
    if (blockedTile(lx, ly)) return MQ.Dialog ? MQ.Dialog.say("You get halfway up and think better of it.") : Promise.resolve();
    hold();
    return new Promise(function (resolve) {
      const from = { x: player.px, y: player.py };
      const to = { x: lx * T + T / 2, y: ly * T + T / 2 };
      const t0 = MQ.Loop.time;
      const tick = function () {
        const k = U.clamp((MQ.Loop.time - t0) / 700, 0, 1);
        player.px = U.lerp(from.x, to.x, k);
        player.py = U.lerp(from.y, to.y, k);
        player.bob = -Math.sin(k * Math.PI) * 10;
        if (k < 1) { climbTick = tick; return; }
        climbTick = null; player.bob = 0; syncTile(true); release(); resolve();
      };
      climbTick = tick;
    });
  };
  let climbTick = null;

  // ---- NPC plumbing ------------------------------------------------------
  function makeWorldCtx() {
    worldCtx.map = map;
    worldCtx.player = player;
    worldCtx.frozen = O.locked();
    return worldCtx;
  }
  const worldCtx = {
    map: null, player: player, frozen: false,
    can: function (x, y, e) {
      if (MQ.World.blocked(map, x, y, null)) return false;
      if (x === player.x && y === player.y) return false;
      if (npcSolidAt(x, y)) return false;
      return true;
    },
    npcAt: function (x, y) { return O.npcAt(x, y); },
    restPoint: function (x, y) {
      const ps = map && map.restPoints;
      if (!ps) return null;
      for (let i = 0; i < ps.length; i++) if (Math.abs(ps[i].x - x) + Math.abs(ps[i].y - y) <= 1) return ps[i];
      return null;
    },
    sniff: function (cat) {
      // MEADOW smells items; BIGBOY smells creatures (SIDE-CONTENT §3)
      const range = 3 + (MQ.Flags.get("trust_" + cat.cat) >= 1 ? 2 : 0);
      if (cat.cat === "meadow") {
        const items = map.items || [];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (MQ.Flags.get(it.flag)) continue;
          if (Math.abs(it.x - cat.x) + Math.abs(it.y - cat.y) <= range) return it;
        }
        return null;
      }
      const zone = MQ.World.zoneAt(map, cat.x, cat.y);
      return zone ? { zone: zone } : null;
    }
  };

  O.npcAt = function (x, y) {
    for (let i = 0; i < npcs.length; i++) {
      const e = npcs[i];
      if (!MQ.NPC.visible(e)) continue;
      if (e.x === x && e.y === y) return e;
      if (e.moving && (e.x - e.mdx) === x && (e.y - e.mdy) === y) return e;
    }
    for (let i = 0; i < cats.length; i++) if (cats[i].x === x && cats[i].y === y) return cats[i];
    return null;
  };
  O.getNpc = function (id) { return npcById[id] || null; };
  O.npcs = function () { return npcs; };

  O.spawnNpc = function (def) {
    if (!def || !def.id) return null;
    const mapId = def.map || O.state.map;
    spawned.push({ map: mapId, def: def });
    if (mapId === O.state.map) return addNpcFromDef(def, true);
    return null;
  };
  O.removeNpc = function (id) {
    const e = npcById[id];
    if (e) { U.remove(npcs, e); delete npcById[id]; }
    for (let i = spawned.length - 1; i >= 0; i--) if (spawned[i].def.id === id) spawned.splice(i, 1);
    MQ.Flags.set("npc_gone_" + id, true);
    return !!e;
  };
  O.showNpc = function (id, show) {
    const e = npcById[id];
    if (e) e.hidden = show === false;
    return !!e;
  };
  O.placeNpc = function (id, mapId, x, y, dir) {
    const e = npcById[id];
    if (!e) return false;
    if (mapId && mapId !== O.state.map) { O.removeNpc(id); return false; }
    e.x = x | 0; e.y = y | 0;
    e.px = e.x * T + T / 2; e.py = e.y * T + T / 2;
    e.home.x = e.x; e.home.y = e.y;
    e.moving = false;
    if (dir) e.dir = dir;
    return true;
  };
  O.faceEntity = function (who, dir) {
    if (who === "player") { player.dir = dir; O.state.dir = dir; return Promise.resolve(); }
    const e = npcById[who] || catById(who);
    if (e) MQ.NPC.face(e, dir);
    return Promise.resolve();
  };

  function catById(id) {
    for (let i = 0; i < cats.length; i++) if (cats[i].id === id || cats[i].cat === id) return cats[i];
    return null;
  }

  // moveEntity('player'|npcId, path, opts) → Promise
  // path = ['up','up','left'] | [[x,y],...] | [{x,y},...] | {x,y} (A* route)
  O.moveEntity = function (who, path, opts) {
    opts = opts || {};
    const e = who === "player" ? player : (npcById[who] || catById(who));
    if (!e) return Promise.resolve();
    const pts = resolvePath(e, path, opts);
    if (!pts.length) return Promise.resolve();
    // Not on stage (no map loaded, or the overworld isn't in the scene stack):
    // nothing is ticking us, so land the entity on the final tile and resolve.
    if (!map || !MQ.Scenes.has(O.id)) {
      const end = pts[pts.length - 1];
      if (e === player) { O.state.px = end.x * T + T / 2; O.state.py = end.y * T + T / 2; if (map) O.place(end.x, end.y, e.dir); }
      else { e.x = end.x; e.y = end.y; e.px = end.x * T + T / 2; e.py = end.y * T + T / 2; }
      return Promise.resolve();
    }
    const speed = opts.speed === "run" ? RUN : opts.speed === "slow" ? WALK * 0.6 : (typeof opts.speed === "number" ? opts.speed * T : WALK);
    if (e === player) {
      return new Promise(function (resolve) {
        player.scripted = { queue: pts, tx: e.x, ty: e.y, speed: speed, resolve: resolve };
        nextScriptedStep();
      });
    }
    return new Promise(function (resolve) {
      e.scriptCtl = { queue: pts, speed: speed, resolve: resolve };
    });
  };

  function resolvePath(e, path, opts) {
    const out = [];
    if (!path) return out;
    if (!Array.isArray(path)) path = [path];
    let cx = e.x, cy = e.y;
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      if (typeof p === "string") {
        const n = opts.repeat || 1;
        for (let k = 0; k < n; k++) {
          const v = U.dirVec[p];
          if (!v) break;
          cx += v[0]; cy += v[1];
          out.push({ x: cx, y: cy });
        }
      } else if (Array.isArray(p)) { cx = p[0]; cy = p[1]; out.push({ x: cx, y: cy }); }
      else if (p && typeof p.x === "number") {
        if (opts.route) {
          const route = MQ.World.findPath(map, cx, cy, p.x, p.y, { abilities: O.state.abilities });
          if (route) for (let k = 0; k < route.length; k++) { out.push(route[k]); cx = route[k].x; cy = route[k].y; }
        } else { cx = p.x; cy = p.y; out.push({ x: cx, y: cy }); }
      }
    }
    return out;
  }

  function updateNpcScriptMove(e, dt) {
    const sc = e.scriptCtl;
    if (!sc) return false;
    if (e.moving) { MQ.NPC.advance(e, dt); return true; }
    if (!sc.queue.length) { e.scriptCtl = null; e.frame = 0; if (sc.resolve) sc.resolve(); return true; }
    const next = sc.queue[0];
    const dx = next.x - e.x, dy = next.y - e.y;
    if (!dx && !dy) { sc.queue.shift(); return true; }
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    if (!MQ.NPC.step(e, dir, null, sc.speed / T)) { sc.queue.shift(); }
    else sc.queue.shift();
    return true;
  }

  // ---- trainer sight-lines ------------------------------------------------
  function checkSightLines() {
    if (O.locked()) return;
    for (let i = 0; i < npcs.length; i++) {
      const e = npcs[i];
      const d = MQ.NPC.sightCheck(e, player, blockedTile);
      if (d) { challenge(e, d); return; }
    }
  }

  function challenge(e, dist) {
    e.spotted = true;
    hold();
    MQ.NPC.emote(e, "!", 1000);
    if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("ui_error");
    const path = [];
    const v = U.dirVec[e.dir];
    for (let i = 1; i < dist; i++) path.push({ x: e.x + v[0] * i, y: e.y + v[1] * i });
    const world = makeWorldCtx();
    const gen = function* (ctx) {
      const S = ctx.S;
      yield S.wait(700);
      if (path.length) yield O.moveEntity(e.id, path, { speed: "run" });
      MQ.NPC.faceTowards(e, player.x, player.y);
      player.dir = U.opposite[e.dir] || player.dir;
      yield MQ.Interact.trainerBattle(world, e, true);
    };
    MQ.Script.run(gen, { npc: e, map: map, player: player, S: MQ.Script.cmds }).then(function () {
      release();
    }, function (err) { release(); MQ.warn("[Overworld] challenge failed", err); });
  }

  // ---- cats ---------------------------------------------------------------
  function resetCats() {
    const want = MQ.NPC.followingCats();
    cats.length = 0;
    for (let i = 0; i < want.length && i < 2; i++) {
      const c = MQ.NPC.makeCat(want[i]);
      if (!c) continue;
      c.px = player.px; c.py = player.py;
      c.x = player.x; c.y = player.y;
      cats.push(c);
    }
  }
  O.cats = function () { return cats; };
  O.getCat = function (which) { return catById(which); };

  // MEADOW Squeeze: send the small cat through a `k` gap to fetch what's
  // behind it (SIDE-CONTENT §3, DESIGN-INDEX §3).
  O.sendCat = function (x, y, which) {
    const gap = MQ.World.catGapAt(map, x, y);
    if (!gap) return Promise.resolve(false);
    const cat = catById(which || "meadow") || cats[0];
    if (!cat) return Promise.resolve(false);
    if (gap.flag && MQ.Flags.get(gap.flag)) {
      return (MQ.Dialog ? MQ.Dialog.say("Nothing left through there but cobwebs.") : Promise.resolve()).then(function () { return false; });
    }
    const v = U.dirVec[player.dir] || [0, 1];
    const beyond = { x: x + v[0], y: y + v[1] };
    hold();
    const gen = function* (ctx) {
      const S = ctx.S;
      MQ.NPC.emote(cat, "!", 600);
      if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("cat_meow");
      yield O.moveEntity(cat.id, [{ x: x, y: y }], { speed: 5 });
      yield S.wait(220);
      yield O.moveEntity(cat.id, [beyond], { speed: 5 });
      yield S.wait(700);
      MQ.NPC.emote(cat, "paw", 900);
      yield S.wait(400);
      yield O.moveEntity(cat.id, [{ x: x, y: y }, { x: player.x, y: player.y }], { speed: 5 });
      if (gap.flag) MQ.Flags.set(gap.flag, true);
      if (gap.item) yield S.giveItem(gap.item, gap.n || 1);
      if (gap.lever) MQ.Events.emit("lever", { map: map.id, id: gap.lever });
      if (gap.tile) O.setTile(gap.tx === undefined ? x : gap.tx, gap.ty === undefined ? y : gap.ty, gap.tile);
      MQ.Events.emit("catgap:done", { map: map.id, x: x, y: y, gap: gap });
      yield S.say(gap.say || ["MEADOW slips through, has a good long think about it, and comes back with something."]);
      return true;
    };
    return MQ.Script.run(gen, { map: map, player: player, S: MQ.Script.cmds }).then(function (r) {
      cat.scriptCtl = null;
      release();
      return r;
    }, function (e) { cat.scriptCtl = null; release(); MQ.warn("[Overworld] cat errand failed", e); return false; });
  };
  O.refreshCats = resetCats;
  O.catSit = function () { for (let i = 0; i < cats.length; i++) { cats[i].sitting = true; cats[i].idleT = 3000; } };

  // BIGBOY's rest points: heal a bit, autosave, set the flag (SYSTEMS-SPEC §16)
  MQ.Events.on("cat:rest", function (d) {
    if (!d || !d.point || d.cat !== "bigboy") return;
    const p = d.point;
    if (p.flag && MQ.Flags.get(p.flag)) return;
    if (p.flag) MQ.Flags.set(p.flag, true);
    if (MQ.Party && MQ.Party.healPct) MQ.Party.healPct(0.25);
    if (MQ.Save && MQ.Save.autosave) MQ.Save.autosave();
    if (MQ.Dialog) MQ.Dialog.notify("BIGBOY sits down. Everyone feels better for it.");
  });

  // ---- buttons -----------------------------------------------------------
  function handleButtons() {
    if (MQ.Input.pressed("a")) {
      MQ.Input.consume("a");
      const r = MQ.Interact.press(makeWorldCtx());
      if (r && typeof r.then === "function") { hold(); r.then(release, function (e) { release(); MQ.warn("[Overworld] interact failed", e); }); }
      return;
    }
    if (MQ.Input.pressed("start")) {
      MQ.Input.consume("start");
      if (MQ.UI && MQ.UI.Pause) MQ.Scenes.push(MQ.UI.Pause);
      else if (MQ.Dialog) MQ.Dialog.notify("Pause menu not fitted yet.");
      return;
    }
    if (MQ.Input.pressed("select")) {
      MQ.Input.consume("select");
      O.toggleMinimap();
      if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("ui_open");
    }
  }
  O.toggleMinimap = function (on) {
    minimapOn = on === undefined ? !minimapOn : !!on;
    if (MQ.UI && MQ.UI.HUD && MQ.UI.HUD.setMiniMap) MQ.UI.HUD.setMiniMap(minimapOn);
    return minimapOn;
  };

  // ---- scene hooks -------------------------------------------------------
  let lastDt = 16.7;

  O.enter = function (params) {
    params = params || {};
    if (params.map) O.spawn(params.map, params.x, params.y, params.dir);
    else if (O.state.map && MQ.World.has(O.state.map)) {
      loadMap(O.state.map, false);
      player.px = O.state.px; player.py = O.state.py; player.dir = O.state.dir;
      player.x = Math.floor(player.px / T); player.y = Math.floor(player.py / T);
      lastTileX = player.x; lastTileY = player.y;
      snapCamera();
      MQ.NPC.trailReset(player.px, player.py, player.dir);
      resetCats();
    } else O.spawn(MQ.World.has("demo_field") ? "demo_field" : MQ.World.ids()[0]);
    frozen = false; busy = 0;
    if (MQ.Clock) MQ.Clock.running = true;
    banner();
    MQ.Events.emit("overworld:enter", { map: O.state.map });
  };

  O.exit = function () {
    if (MQ.Clock) MQ.Clock.running = false;
    MQ.Events.emit("overworld:exit", { map: O.state.map });
  };

  O.resume = function () { if (MQ.Input) MQ.Input.consumeAll(); };
  O.onResize = function () { snapCamera(); };

  O.update = function (dt) {
    lastDt = dt;
    timeAcc += dt;
    animFrame = (timeAcc / ANIM_MS) | 0;
    if (!map) return;
    if (climbTick) climbTick();
    const locked = O.locked();
    if (!locked) { updatePlayer(dt); handleButtons(); }
    else if (player.hop) updateHop(dt);
    else if (player.scripted) updateScriptedMove(dt);
    else { player.moving = false; player.frame = player.frame || 0; }

    const w = makeWorldCtx();
    for (let i = 0; i < npcs.length; i++) {
      const e = npcs[i];
      if (!updateNpcScriptMove(e, dt)) MQ.NPC.update(e, dt, w);
    }
    MQ.NPC.trailPush(player.px, player.py, player.dir);
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      if (c.scriptCtl) updateNpcScriptMove(c, dt);
      else MQ.NPC.updateFollower(c, dt, w);
    }
    updateParticles(dt);
    if (MQ.FX && MQ.FX.update) MQ.FX.update(dt);
    if (!locked) checkSightLines();
    updateCamera(dt);
  };

  // ---- rendering ---------------------------------------------------------
  function drawLayer(ctx, layer, ox, oy) {
    const vw = viewW(), vh = viewH();
    const cx0 = Math.max(0, Math.floor(ox / CHUNK_PX)), cx1 = Math.min(Math.ceil(rt.w / CHUNK) - 1, Math.floor((ox + vw) / CHUNK_PX));
    const cy0 = Math.max(0, Math.floor(oy / CHUNK_PX)), cy1 = Math.min(Math.ceil(rt.h / CHUNK) - 1, Math.floor((oy + vh) / CHUNK_PX));
    for (let cy = cy0; cy <= cy1; cy++) {
      for (let cx = cx0; cx <= cx1; cx++) {
        const ch = getChunk(layer, cx, cy);
        ctx.drawImage(ch.canvas, cx * CHUNK_PX - ox, cy * CHUNK_PX - oy);
        const a = ch.anim;
        for (let i = 0; i < a.length; i += 4) {
          const tx = a[i], ty = a[i + 1];
          const id = rt[layer][ty * rt.w + tx];
          if (!id) continue;
          const props = MQ.Tiles.props(id);
          const frames = props && props.anim ? props.anim.length : 1;
          const seed = ((tx * 73856093) ^ (ty * 19349663)) & 0x7fffffff;
          const src = MQ.Tiles.get(id, animFrame % frames, seed);
          if (src) ctx.drawImage(src, 0, 0, 16, 16, tx * T - ox, ty * T - oy, T, T);
        }
      }
    }
  }

  function drawItems(ctx, ox, oy) {
    const items = map.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.hidden || MQ.Flags.get(it.flag)) continue;
      const x = it.x * T + T / 2 - ox, y = it.y * T + T / 2 - oy;
      if (x < -T || y < -T || x > viewW() + T || y > viewH() + T) continue;
      const bob = Math.sin((timeAcc + i * 400) / 500) * 2;
      ctx.fillStyle = "#20202a";
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.ellipse(x, y + 8, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#e8e4d0";
      ctx.fillRect(Math.round(x - 6), Math.round(y - 6 + bob), 12, 12);
      ctx.fillStyle = "#c04040";
      ctx.fillRect(Math.round(x - 6), Math.round(y - 6 + bob), 12, 6);
      ctx.fillStyle = "#20202a";
      ctx.fillRect(Math.round(x - 6), Math.round(y - 1 + bob), 12, 2);
    }
  }

  function drawPlayerSprite(ctx, ox, oy) {
    const x = Math.round(player.px - ox), y = Math.round(player.py - oy) + 6;
    if (O.state.boating) {
      ctx.fillStyle = "#20603a";
      ctx.fillRect(x - 16, y - 12, 32, 16);
      ctx.fillStyle = "#c8a040";
      ctx.fillRect(x - 16, y - 12, 32, 3);
    }
    const art = MQ.PeopleArt;
    if (art && art.get) {
      const c = art.get(player.sprite, player.dir, player.frame, null);
      if (c) { ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height + 4 + player.bob)); return; }
    }
    MQ.NPC.drawPerson(ctx, "player", player.dir, player.frame, x, y + (player.bob || 0), { bob: 0 });
  }

  function drawEntities(ctx, ox, oy) {
    drawList.length = 0;
    for (let i = 0; i < npcs.length; i++) if (MQ.NPC.visible(npcs[i])) drawList.push(npcs[i]);
    for (let i = 0; i < cats.length; i++) drawList.push(cats[i]);
    drawList.push(player);
    drawList.sort(function (a, b) { return a.py - b.py; });
    const vw = viewW(), vh = viewH();
    for (let i = 0; i < drawList.length; i++) {
      const e = drawList[i];
      const sx = e.px - ox, sy = e.py - oy;
      if (sx < -T * 2 || sy < -T * 3 || sx > vw + T * 2 || sy > vh + T * 2) continue;
      if (e === player) drawPlayerSprite(ctx, ox, oy);
      else MQ.NPC.draw(ctx, e, ox, oy);
    }
  }

  // ---- weather + light ---------------------------------------------------
  const RAIN_N = 130, SNOW_N = 90;
  const rainX = new Float32Array(RAIN_N), rainY = new Float32Array(RAIN_N), rainL = new Float32Array(RAIN_N);
  const snowX = new Float32Array(SNOW_N), snowY = new Float32Array(SNOW_N), snowP = new Float32Array(SNOW_N);
  let weatherInit = false;
  function initWeather() {
    for (let i = 0; i < RAIN_N; i++) { rainX[i] = Math.random() * 1400; rainY[i] = Math.random() * 800; rainL[i] = 10 + Math.random() * 14; }
    for (let i = 0; i < SNOW_N; i++) { snowX[i] = Math.random() * 1400; snowY[i] = Math.random() * 800; snowP[i] = Math.random() * 6.28; }
    weatherInit = true;
  }

  let lightCanvas = null, lightGlow = null;
  function glowSprite() {
    if (lightGlow) return lightGlow;
    const s = 128;
    const c = makeCanvas(s, s);
    const g = c.getContext("2d");
    const grd = g.createLinearGradient ? null : null;
    // radial falloff drawn as concentric circles (works with any 2d stub)
    for (let r = s / 2; r > 0; r -= 2) {
      g.globalAlpha = 0.05;
      g.fillStyle = "#fff";
      g.beginPath(); g.arc(s / 2, s / 2, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    lightGlow = c;
    return c;
  }

  function drawWeather(ctx, dt, ox, oy) {
    const vw = viewW(), vh = viewH();
    const outdoor = map.outdoor !== false;
    const kind = outdoor && MQ.Clock ? MQ.Clock.weatherOf(map.weatherZone) : "clear";
    if (MQ.FX && MQ.FX.drawWeather) {
      if (MQ.FX.setWeather) MQ.FX.setWeather(kind);
      MQ.FX.drawWeather(ctx);
    }
    else if (outdoor && kind !== "clear") {
      if (!weatherInit) initWeather();
      if (kind === "rain") {
        ctx.strokeStyle = "rgba(180,205,235,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < RAIN_N; i++) {
          rainY[i] += (620 + rainL[i] * 14) * dt / 1000;
          rainX[i] -= 130 * dt / 1000;
          if (rainY[i] > vh) { rainY[i] = -20; rainX[i] = Math.random() * vw; }
          if (rainX[i] < -20) rainX[i] = vw + 10;
          ctx.moveTo(rainX[i], rainY[i]);
          ctx.lineTo(rainX[i] + 3, rainY[i] + rainL[i]);
        }
        ctx.stroke();
        ctx.fillStyle = "rgba(40,60,90,0.16)";
        ctx.fillRect(0, 0, vw, vh);
      } else if (kind === "snow") {
        if (!weatherInit) initWeather();
        ctx.fillStyle = "rgba(245,248,255,0.85)";
        for (let i = 0; i < SNOW_N; i++) {
          snowY[i] += 60 * dt / 1000;
          snowX[i] += Math.sin(timeAcc / 900 + snowP[i]) * 18 * dt / 1000;
          if (snowY[i] > vh) { snowY[i] = -6; snowX[i] = Math.random() * vw; }
          ctx.fillRect(snowX[i] | 0, snowY[i] | 0, 2, 2);
        }
        ctx.fillStyle = "rgba(220,230,255,0.12)";
        ctx.fillRect(0, 0, vw, vh);
      } else if (kind === "fog") {
        const band = vh / 3;
        for (let i = 0; i < 3; i++) {
          const off = ((timeAcc / (30 + i * 12)) % (vw + 400)) - 200;
          ctx.fillStyle = i === 1 ? "rgba(205,210,215,0.30)" : "rgba(215,220,225,0.22)";
          ctx.fillRect(-200 + off * 0.2, i * band, vw + 400, band);
        }
        ctx.fillStyle = "rgba(210,215,220,0.18)";
        ctx.fillRect(0, 0, vw, vh);
      } else if (kind === "wind") {
        ctx.strokeStyle = "rgba(230,230,210,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 22; i++) {
          const y = ((i * 61) % vh);
          const x = ((timeAcc * (0.5 + (i % 3) * 0.16) + i * 137) % (vw + 200)) - 100;
          ctx.moveTo(x, y); ctx.lineTo(x + 26 + (i % 4) * 8, y - 3);
        }
        ctx.stroke();
      } else if (kind === "sun") {
        ctx.fillStyle = "rgba(255,225,150,0.13)";
        ctx.fillRect(0, 0, vw, vh);
      }
    }

    // time-of-day tint + lamps
    const phase = MQ.Clock ? MQ.Clock.phase : "day";
    const tint = outdoor ? (MQ.Clock ? MQ.Clock.tint(phase) : "rgba(0,0,0,0)") : (map.dark ? "rgba(6,8,18,0.62)" : "rgba(0,0,0,0)");
    if (tint && tint !== "rgba(0,0,0,0)") {
      const lights = collectLights(ox, oy);
      if (lights.length && (phase === "night" || phase === "dusk" || map.dark)) {
        if (!lightCanvas || lightCanvas.width !== Math.ceil(vw) || lightCanvas.height !== Math.ceil(vh)) lightCanvas = makeCanvas(Math.ceil(vw), Math.ceil(vh));
        const g = lightCanvas.getContext("2d");
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, vw, vh);
        g.fillStyle = tint;
        g.fillRect(0, 0, vw, vh);
        g.globalCompositeOperation = "destination-out";
        const glow = glowSprite();
        for (let i = 0; i < lights.length; i += 2) g.drawImage(glow, lights[i] - 64, lights[i + 1] - 64);
        g.globalCompositeOperation = "source-over";
        ctx.drawImage(lightCanvas, 0, 0);
      } else {
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, vw, vh);
      }
    }

    // SIGNAL METER shimmer (STORY-BIBLE §6): ORACLE's attention, drawn as scanlines
    const sig = MQ.Encounters.signalLevel();
    if (sig > 0.02) {
      ctx.globalAlpha = 0.05 + sig * 0.09;
      ctx.fillStyle = "#40e0c0";
      const off = (timeAcc / 26) % 8;
      for (let y = -8 + off; y < vh; y += 8) ctx.fillRect(0, y, vw, 1);
      ctx.globalAlpha = 1;
      // …and, at strength, a shimmer over the tiles that are hiding something
      if (sig > 0.3) {
        const r = 7;
        const x0 = Math.max(0, player.x - r), x1 = Math.min(rt.w - 1, player.x + r);
        const y0 = Math.max(0, player.y - r), y1 = Math.min(rt.h - 1, player.y + r);
        ctx.fillStyle = "#7cf0d8";
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
          if (!rt.zone[ty * rt.w + tx]) continue;
          const phase = ((tx * 7 + ty * 13) % 10) / 10;
          const a = Math.sin(timeAcc / 420 + phase * 6.28);
          if (a < 0.55) continue;
          ctx.globalAlpha = (a - 0.55) * sig * 0.7;
          ctx.fillRect(tx * T + 8 - ox, ty * T + 8 - oy, 3, 3);
          ctx.fillRect(tx * T + 20 - ox, ty * T + 18 - oy, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  const lightBuf = [];
  function collectLights(ox, oy) {
    lightBuf.length = 0;
    if (!rt.lightCount) return lightBuf;
    const vw = viewW(), vh = viewH();
    const x0 = Math.max(0, Math.floor(ox / T) - 1), x1 = Math.min(rt.w - 1, Math.ceil((ox + vw) / T));
    const y0 = Math.max(0, Math.floor(oy / T) - 1), y1 = Math.min(rt.h - 1, Math.ceil((oy + vh) / T));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (!rt.light[y * rt.w + x]) continue;
      lightBuf.push(x * T + T / 2 - ox, y * T + T / 2 - oy);
      if (lightBuf.length >= 40) return lightBuf;
    }
    return lightBuf;
  }

  // ---- particles ---------------------------------------------------------
  // A fixed pool: grass rustle, running dust, the puff of a ledge landing.
  const PN = 28;
  const pX = new Float32Array(PN), pY = new Float32Array(PN), pVX = new Float32Array(PN), pVY = new Float32Array(PN);
  const pL = new Float32Array(PN), pM = new Float32Array(PN), pK = new Uint8Array(PN);
  let pNext = 0;
  function emitParticle(x, y, kind, vx, vy, ms) {
    const i = pNext = (pNext + 1) % PN;
    pX[i] = x; pY[i] = y; pVX[i] = vx || 0; pVY[i] = vy || 0;
    pL[i] = ms || 320; pM[i] = pL[i]; pK[i] = kind;
  }
  O.emitParticle = emitParticle;
  function updateParticles(dt) {
    for (let i = 0; i < PN; i++) {
      if (pL[i] <= 0) continue;
      pL[i] -= dt;
      pX[i] += pVX[i] * dt / 1000;
      pY[i] += pVY[i] * dt / 1000;
      pVY[i] += 90 * dt / 1000;
    }
  }
  function drawParticles(ctx, ox, oy) {
    for (let i = 0; i < PN; i++) {
      if (pL[i] <= 0) continue;
      const k = pL[i] / pM[i];
      ctx.globalAlpha = U.clamp(k, 0, 1) * 0.8;
      ctx.fillStyle = pK[i] === 1 ? "#8ad06a" : pK[i] === 2 ? "#c8b48a" : "#dfe7ef";
      const s = pK[i] === 1 ? 3 : 2;
      ctx.fillRect(Math.round(pX[i] - ox), Math.round(pY[i] - oy), s, s);
    }
    ctx.globalAlpha = 1;
  }

  let rustleAcc = 0;
  function walkParticles(dt) {
    rustleAcc += dt;
    if (rustleAcc < (player.running ? 110 : 190)) return;
    rustleAcc = 0;
    const i = MQ.World.idx(map, player.x, player.y);
    if (i < 0) return;
    const spread = (Math.random() - 0.5) * 26;
    if (rt.slow[i]) emitParticle(player.px + spread, player.py - 2, 1, spread * 0.6, -34, 380);
    else if (player.running) emitParticle(player.px + spread * 0.4, player.py, 2, spread * 0.5, -18, 260);
  }

  // ---- mini-map (fallback only — MQ.UI.HUD.miniMap is the real one) ------
  let minimapCanvas = null;
  const MM_SCALE = 3;
  function buildMinimap() {
    const c = makeCanvas(rt.w * MM_SCALE, rt.h * MM_SCALE);
    const g = c.getContext("2d");
    for (let y = 0; y < rt.h; y++) for (let x = 0; x < rt.w; x++) {
      const i = y * rt.w + x;
      const id = rt.deco[i] || rt.ground[i];
      if (!id) continue;
      const p = MQ.Tiles.props(id);
      let col = (p && p.color) || "#555";
      if (rt.water[i]) col = "#3a6a9a";
      else if (rt.solid[i]) col = U.shade(col, 0.62);
      else if (rt.zone[i] === 1) col = U.shade(col, 1.05);
      g.fillStyle = col;
      g.fillRect(x * MM_SCALE, y * MM_SCALE, MM_SCALE, MM_SCALE);
    }
    minimapCanvas = c;
    return c;
  }

  function drawMinimapFallback(ctx) {
    const c = minimapCanvas || buildMinimap();
    const vw = screenW(), vh = screenH();
    const maxW = Math.min(vw * 0.34, 260), maxH = Math.min(vh * 0.42, 200);
    const k = Math.min(maxW / c.width, maxH / c.height, 1.6);
    const w = Math.round(c.width * k), h = Math.round(c.height * k);
    const x = Math.round(vw - w - 16 - MQ.View.safe.right), y = Math.round(vh - h - 16 - MQ.View.safe.bottom);
    MQ.UI.box(ctx, x - 6, y - 22, w + 12, h + 28, { style: "dark", alpha: 0.86 });
    MQ.Text.draw(ctx, (map.name || map.id).toUpperCase(), x, y - 18, { size: "s", color: "#c8e0d0" });
    ctx.drawImage(c, x, y, w, h);
    // warps
    const warps = MQ.World.allWarps(map);
    ctx.fillStyle = "#e0c040";
    for (let i = 0; i < warps.length; i++) {
      if (warps[i].generated) continue;
      ctx.fillRect(Math.round(x + warps[i].x * MM_SCALE * k) - 1, Math.round(y + warps[i].y * MM_SCALE * k) - 1, 3, 3);
    }
    // npcs
    ctx.fillStyle = "#f08040";
    for (let i = 0; i < npcs.length; i++) {
      const e = npcs[i];
      if (!MQ.NPC.visible(e)) continue;
      ctx.fillRect(Math.round(x + e.x * MM_SCALE * k), Math.round(y + e.y * MM_SCALE * k), 2, 2);
    }
    // player, blinking
    if ((timeAcc / 400 | 0) % 2 === 0) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(Math.round(x + player.x * MM_SCALE * k) - 2, Math.round(y + player.y * MM_SCALE * k) - 2, 5, 5);
    }
  }

  // ---- HUD -----------------------------------------------------------
  // The quest tracker, SIGNAL METER, CUTOVER counter and mini-map all live
  // in MQ.UI.HUD (ui-b) — HUD.corner() draws the standard arrangement.
  // This is a fallback only, for a build with ui/hud.js missing: it repeats
  // the same four widgets by hand so the overworld degrades rather than
  // going blank, same as everywhere else that checks a system exists first.
  function cutoverLabel() {
    const v = MQ.Flags.get("cutover_days");
    if (v === undefined || v === false) return null;
    if (v === "stopped") return "CUTOVER  STOPPED";
    if (v === "t3") return "CUTOVER  T-3";
    if (v === "t0") return "CUTOVER  T-0";
    return "CUTOVER  T-" + v;
  }

  // Draws the fallback tracker/signal/cutover/minimap and returns the y just
  // below whatever it drew top-left, so the clock chip can sit clear of it.
  function drawHudFallback(ctx, top, vw) {
    const right = vw - 12 - MQ.View.safe.right;

    // SIGNAL METER (Ch.4+)
    let y = top;
    const sig = MQ.Encounters.signalLevel();
    if (MQ.Flags.get("signal_meter") || sig > 0) {
      const w = 118;
      MQ.UI.box(ctx, right - w, y, w, 26, { style: "dark", alpha: 0.7 });
      MQ.Text.draw(ctx, "SIGNAL", right - w + 8, y + 6, { size: "s", color: "#8ad8c0" });
      MQ.UI.gauge(ctx, right - w + 58, y + 8, 52, 9, sig, { color: sig > 0.66 ? "#e04060" : sig > 0.33 ? "#e0b040" : "#40e0c0", bg: "#12202a" });
      y += 32;
    }

    // CUTOVER counter (Ch.4+)
    const cut = cutoverLabel();
    if (cut) {
      const w = MQ.Text.width(cut, "s") + 18;
      MQ.UI.box(ctx, right - w, y, w, 24, { style: "danger", alpha: 0.78 });
      MQ.Text.draw(ctx, cut, right - w + 9, y + 5, { size: "s", color: "#ffd0d0" });
      y += 30;
    }

    // quest tracker
    let leftY = top;
    const tracked = (MQ.Quests && MQ.Quests.tracked) ? MQ.Quests.tracked() : null;
    if (tracked && tracked.length) {
      const q = tracked[0];
      const title = q.name || q.title || "Case";
      const line = q.text || q.stageText || "";
      const w = Math.max(MQ.Text.width(title, "s"), MQ.Text.width(line, "s")) + 22;
      const x = 12 + MQ.View.safe.left;
      const h = line ? 46 : 28;
      MQ.UI.box(ctx, x, top, Math.min(w, vw * 0.42), h, { style: "dark", alpha: 0.72 });
      MQ.Text.draw(ctx, title, x + 10, top + 6, { size: "s", color: "#e0c060", maxWidth: vw * 0.4 });
      if (line) MQ.Text.draw(ctx, line, x + 10, top + 24, { size: "s", color: "#d8d8d0", maxWidth: vw * 0.4 });
      leftY = top + h + 6;
    }

    if (minimapOn) drawMinimapFallback(ctx);
    return leftY;
  }

  function drawHud(ctx) {
    const vw = screenW();
    const top = 12 + MQ.View.safe.top;

    const hasHud = !!(MQ.UI && MQ.UI.HUD && MQ.UI.HUD.corner);
    const clockY = hasHud ? MQ.UI.HUD.corner(ctx) : drawHudFallback(ctx, top, vw);

    // clock + weather chip — not one of MQ.UI.HUD's widgets, so it always
    // draws here; top-left, below wherever the quest tracker left off, so it
    // never lands under HUD.corner's SIGNAL/CUTOVER (top-right) or mini-map
    // (bottom-right) — or under the touch stick/buttons, which only ever
    // live in the bottom corners.
    if (MQ.Clock) {
      const kind = map.outdoor === false ? "indoor" : MQ.Clock.weatherOf(map.weatherZone);
      const label = MQ.Clock.timeString() + "  " + weatherGlyph(kind);
      const w = MQ.Text.width(label, "s") + 18;
      const x = 12 + MQ.View.safe.left, y = clockY > top ? clockY : top;
      MQ.UI.box(ctx, x, y, w, 24, { style: "dark", alpha: 0.7 });
      MQ.Text.draw(ctx, label, x + 9, y + 5, { size: "s", color: "#e8e8e0" });
    }
  }

  function weatherGlyph(kind) {
    return kind === "rain" ? "rain" : kind === "fog" ? "fog" : kind === "snow" ? "snow" :
      kind === "wind" ? "wind" : kind === "sun" ? "sun" : kind === "indoor" ? "in" : "clear";
  }

  // The frame around a map that cannot fill the view. Raw black looked like a
  // bug; a darkened wash of the room's own ground colour reads as a mount.
  function frameColor() {
    const base = map.bg || (map.outdoor === false ? "#12121a" : "#25412a");
    return U.shade ? U.shade(base, 0.42) : "#0b0b12";
  }

  function drawBackdrop(ctx) {
    const sw = screenW(), sh = screenH();
    const r = O.mapScreenRect();
    if (r.x <= 0.5 && r.y <= 0.5 && r.w >= sw - 0.5 && r.h >= sh - 0.5) return; // map covers the view
    ctx.fillStyle = frameColor();
    ctx.fillRect(0, 0, sw, sh);
    // a hairline so the room reads as mounted rather than floating
    ctx.strokeStyle = U.shade ? U.shade(frameColor(), 1.6) : "#2a2a36";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(r.x) - 0.5, Math.round(r.y) - 0.5, Math.round(r.w) + 1, Math.round(r.h) + 1);
  }

  O.draw = function (ctx) {
    if (!map || !rt) return;
    const z = zoom;
    const ox = camOx(), oy = camOy();
    drawBackdrop(ctx);
    if (z !== 1) { ctx.save(); ctx.scale(z, z); }
    // the map's own ground colour, only where the map actually is
    const mw = rt.w * T, mh = rt.h * T;
    const bx = Math.max(0, -ox), by = Math.max(0, -oy);
    ctx.fillStyle = map.bg || (map.outdoor === false ? "#12121a" : "#25412a");
    ctx.fillRect(bx, by, Math.min(viewW() - bx, mw - Math.max(0, ox)), Math.min(viewH() - by, mh - Math.max(0, oy)));
    drawLayer(ctx, "ground", ox, oy);
    drawLayer(ctx, "deco", ox, oy);
    drawItems(ctx, ox, oy);
    drawEntities(ctx, ox, oy);
    drawParticles(ctx, ox, oy);
    drawLayer(ctx, "over", ox, oy);
    drawWeather(ctx, lastDt, ox, oy);
    if (z !== 1) ctx.restore();
    if (!hudHidden) drawHud(ctx);
  };

  // A resize can change which zoom step fits; keep the camera honest.
  MQ.Events.on("resize", function () {
    if (!rt) return;
    if (applyZoom()) clampCam();
  });

  // ---- abilities ----------------------------------------------------------
  O.unlock = function (id) {
    O.state.abilities.add(id);
    MQ.Flags.set("unlock_" + id, true);
    MQ.Events.emit("unlock", { id: id });
    return true;
  };
  O.hasAbility = function (id) { return O.state.abilities.has(id); };

  // ---- save provider ------------------------------------------------------
  O.saveKey = "overworld";
  O.saveProvider = {
    save: function () {
      const ab = [];
      O.state.abilities.forEach(function (a) { ab.push(a); });
      const sp = [];
      for (let i = 0; i < spawned.length; i++) sp.push({ map: spawned[i].map, def: spawned[i].def });
      return {
        map: O.state.map, px: O.state.px, py: O.state.py, dir: O.state.dir,
        steps: O.state.steps, abilities: ab, boating: O.state.boating,
        respawn: O.state.respawn, visited: O.state.visited, spawned: sp
      };
    },
    load: function (o) {
      O.state.abilities = new Set();
      O.state.steps = 0; O.state.boating = false; O.state.respawn = null; O.state.visited = {};
      spawned.length = 0;
      if (!o) { O.state.map = null; O.state.px = 0; O.state.py = 0; O.state.dir = "down"; return; }
      O.state.map = o.map || null;
      O.state.px = o.px || 0; O.state.py = o.py || 0; O.state.dir = o.dir || "down";
      O.state.steps = o.steps || 0;
      O.state.boating = !!o.boating;
      O.state.respawn = o.respawn || null;
      O.state.visited = o.visited || {};
      const ab = o.abilities || [];
      for (let i = 0; i < ab.length; i++) O.state.abilities.add(ab[i]);
      const sp = o.spawned || [];
      for (let i = 0; i < sp.length; i++) spawned.push(sp[i]);
      if (O.state.map && MQ.World.has(O.state.map) && MQ.Scenes.top() === O) {
        loadMap(O.state.map, false);
        player.px = O.state.px; player.py = O.state.py; player.dir = O.state.dir;
        player.x = Math.floor(player.px / T); player.y = Math.floor(player.py / T);
        lastTileX = player.x; lastTileY = player.y;      // restoring is not a step
        snapCamera(); MQ.NPC.trailReset(player.px, player.py, player.dir); resetCats();
      }
      player.sprite = O.state.boating ? "player_boat" : "player";
    }
  };

  // Fast travel (rail, beacons, the Anderton lift): drop in at the spawn point.
  O.warpTo = function (mapId, opts) {
    const m = MQ.World.get(mapId);
    if (!m) return Promise.resolve(false);
    const sp = MQ.World.spawnOf(m);
    return O.warp(mapId, sp.x, sp.y, "down", opts || { fade: true });
  };

  // Party wipe / faint: back to the last care centre (or the map's heal point).
  O.recover = function () {
    const r = O.state.respawn || (map && map.healPoint ? { map: map.id, x: map.healPoint.x, y: map.healPoint.y, dir: "down" } : null);
    if (!r) return Promise.resolve();
    return O.warp(r.map, r.x, r.y, r.dir || "down", { fade: true }).then(function () {
      if (MQ.Party && MQ.Party.heal) MQ.Party.heal();
      if (MQ.Dialog) MQ.Dialog.say("You come round on a bench with a cup of tea you don't remember accepting.");
    });
  };

  // A lost battle walks you back to the last place that had a kettle.
  MQ.Events.on("battle:end", function (d) {
    if (!d || d.outcome !== "lose") return;
    if (MQ.Scenes.top() !== O && !MQ.Scenes.has(O.id)) return;
    O.recover();
  });

  // Weather turning is worth a line — it changes how you walk and what spawns.
  const WEATHER_LINES = {
    rain: "Rain sets in. The path turns to soup.",
    fog: "Fog comes down off the moss. You can hear more than you can see.",
    wind: "The wind gets up. Somewhere a gate bangs.",
    snow: "Snow, of all things. It won't lie long.",
    sun: "The cloud breaks. Cheshire, briefly, in colour.",
    clear: "The weather settles."
  };
  MQ.Events.on("weather", function (d) {
    if (!d || !map || map.outdoor === false) return;
    if (MQ.Scenes.top() !== O || hudHidden) return;
    if (d.zone && map.weatherZone && d.zone !== map.weatherZone) return;
    const line = WEATHER_LINES[d.weather];
    if (line && MQ.Dialog) MQ.Dialog.notify(line);
    if (MQ.Audio && MQ.Audio.sfx && (d.weather === "rain" || d.weather === "wind")) MQ.Audio.sfx(d.weather);
  });

  // Jim's own palette — a walker's jacket, not a random NPC's.
  (function () {
    const p = MQ.NPC && MQ.NPC.palette ? MQ.NPC.palette("player") : null;
    if (p) { p.jacket = "#2f5d7a"; p.legs = "#3a3f4a"; p.hair = "#3a2a20"; p.skin = "#e8c8a8"; }
    const b = MQ.NPC && MQ.NPC.palette ? MQ.NPC.palette("player_boat") : null;
    if (b) { b.jacket = "#2f5d7a"; b.legs = "#3a3f4a"; b.hair = "#3a2a20"; b.skin = "#e8c8a8"; }
  })();

  MQ.Overworld = O;
})();
