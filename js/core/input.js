// =============================================================
// MonsterQuest v2 — MQ.Input (core)
// Unified actions + analogue axis from keyboard, canvas-drawn touch
// controls (virtual stick + A/B/START/RUN buttons) and gamepads.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U;

  const ACTIONS = ["up", "down", "left", "right", "a", "b", "start", "select", "run"];
  const DIRS = ["up", "down", "left", "right"];

  // e.code (preferred) and legacy e.key / keyCode fallbacks → action
  const KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right",
    KeyZ: "a", Enter: "a", Space: "a", NumpadEnter: "a",
    KeyX: "b", Backspace: "b",
    Escape: "start", Tab: "select",
    ShiftLeft: "run", ShiftRight: "run"
  };
  const KEYCODEMAP = {
    38: "up", 40: "down", 37: "left", 39: "right",
    87: "up", 83: "down", 65: "left", 68: "right",
    90: "a", 13: "a", 32: "a", 88: "b", 8: "b", 27: "start", 9: "select", 16: "run"
  };

  const STICK = { radius: 60, dead: 0.18, runAt: 0.8 };
  const PAD_DEAD = 0.2;
  const TAP_MS = 350, TAP_MOVE = 14;

  // ---- state ----------------------------------------------------
  const keyDown = {};     // action → bool (keyboard raw)
  const padDown = {};     // action → bool (gamepad raw)
  const touchDown = {};   // action → bool (touch buttons raw)
  const latch = {};       // action → bool (press seen since last update)
  const cur = {}, prev = {}, edge = {};
  const injected = [];    // actions injected via inject()
  for (let i = 0; i < ACTIONS.length; i++) {
    keyDown[ACTIONS[i]] = padDown[ACTIONS[i]] = touchDown[ACTIONS[i]] = false;
    latch[ACTIONS[i]] = cur[ACTIONS[i]] = prev[ACTIONS[i]] = edge[ACTIONS[i]] = false;
  }

  // Drag/wheel scrolling. Menu scenes turn the pad off (touchPad === false), so
  // without this a touch-only player cannot reach anything below the fold of a
  // long list — the Dex is 177 species. Deltas accumulate between fixed steps
  // and are published for exactly one step, like the button edges.
  const drag = { active: false, id: null, x: 0, y: 0, x0: 0, y0: 0, dx: 0, dy: 0, _dx: 0, _dy: 0, moved: false };

  const axis = { x: 0, y: 0, mag: 0, angle: 0 };
  const padAxis = { x: 0, y: 0, mag: 0 };
  const stick = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0, mag: 0 };
  const pointers = {};    // id → {x,y,t0,x0,y0,btn,isTouch}
  const tapQueue = [];    // logical points {x,y}
  const tap = { x: 0, y: 0 };
  let tapThisFrame = false;
  let tapPending = null;
  const pt = { x: 0, y: 0 };

  // touch buttons (positions computed on resize, logical px)
  const buttons = [
    { action: "a", label: "A", r: 34, r0: 34, x: 0, y: 0, color: "rgba(198,40,40,0.45)" },
    { action: "b", label: "B", r: 28, r0: 28, x: 0, y: 0, color: "rgba(42,79,168,0.45)" },
    { action: "start", label: "START", w: 78, h: 30, w0: 78, h0: 30, x: 0, y: 0, color: "rgba(90,90,120,0.45)" },
    { action: "run", label: "RUN", w: 78, h: 30, w0: 78, h0: 30, x: 0, y: 0, color: "rgba(90,90,120,0.45)" }
  ];
  const STICK_R0 = STICK.radius;

  const Input = {
    ACTIONS: ACTIONS,
    KEYMAP: KEYMAP,
    STICK: STICK,
    lastSource: "key",
    touchVisible: false,
    touchScale: 1,          // Settings "Touch layout size"
    touchSide: "left",      // which half of the screen the stick lives on
    touchAlpha: 0.85,       // Settings "Stick opacity"
    vibrateEnabled: true,
    touchAuto: true,        // auto-decide visibility until setTouchVisible() is called
    coarse: false,
    enabled: true,
    gamepadIndex: -1,
    unlocked: false,
    ready: false,
    buttons: buttons,
    stick: stick,
    axisRaw: axis
  };

  // ---- public API ------------------------------------------------
  Input.held = function (action) { return cur[action] === true; };
  Input.pressed = function (action) { return edge[action] === true; };
  Input.consume = function (action) { edge[action] = false; };
  Input.consumeAll = function () { for (let i = 0; i < ACTIONS.length; i++) edge[ACTIONS[i]] = false; tapThisFrame = false; };
  Input.axis = function () { return axis; };
  Input.dragState = function () { return drag; };
  Input.tapAt = function () { return tapThisFrame ? tap : null; };
  Input.inject = function (action) { if (ACTIONS.indexOf(action) >= 0) injected.push(action); };
  Input.vibrate = function (ms) {
    if (!Input.vibrateEnabled) return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 30); } catch (e) { /* ignore */ }
  };
  // The Settings "Touch layout size" choice, on top of the device factor below.
  Input.setTouchScale = function (k) {
    Input.touchScale = U.clamp(+k || 1, 0.6, 1.6);
    layoutButtons();
  };
  // A logical px is physically smaller on a phone than on a tablet, so the pad
  // is scaled up there to keep the buttons a real thumb wide. Never shrinks:
  // a roomy tablet keeps the sizes the art was drawn for.
  function deviceK() {
    const t = MQ.View && MQ.View.ui;
    if (!t || !t.touch) return 1;
    return U.clamp(t.touch / 44, 1, 1.5);
  }
  function effScale() { return Input.touchScale * deviceK(); }
  Input.effectiveScale = effScale;
  Input.setTouchSide = function (side) {
    Input.touchSide = side === "right" ? "right" : "left";
    layoutButtons();
  };
  Input.setTouchAlpha = function (a) { Input.touchAlpha = U.clamp(+a, 0, 1); };
  Input.setTouchVisible = function (b) {
    Input.touchAuto = (b === null || b === undefined);
    if (!Input.touchAuto) Input.touchVisible = !!b;
    else recomputeVisible();
  };
  Input.anyPressed = function () {
    for (let i = 0; i < ACTIONS.length; i++) if (edge[ACTIONS[i]]) return true;
    return tapThisFrame;
  };
  Input.dirPressed = function () {
    for (let i = 0; i < DIRS.length; i++) if (edge[DIRS[i]]) return DIRS[i];
    return null;
  };

  function recomputeVisible() {
    if (!Input.touchAuto) return;
    Input.touchVisible = Input.lastSource === "touch" || (Input.coarse && Input.lastSource !== "pad");
  }

  function gesture() {
    if (Input.unlocked) return;
    Input.unlocked = true;
    if (MQ.Audio && MQ.Audio.unlock) { try { MQ.Audio.unlock(); } catch (e) { /* ignore */ } }
    if (MQ.Events) MQ.Events.emit("gesture");
  }
  Input.gesture = gesture;
  // Later gestures also try to unlock (audio contexts can re-suspend).
  function anyGesture() {
    gesture();
    if (MQ.Audio && MQ.Audio.unlock && Input.unlocked) { try { MQ.Audio.unlock(); } catch (e) { /* ignore */ } }
  }

  // ---- keyboard --------------------------------------------------
  function keyAction(e) {
    let a = e.code ? KEYMAP[e.code] : undefined;
    if (!a && e.keyCode !== undefined) a = KEYCODEMAP[e.keyCode];
    return a || null;
  }
  function onKeyDown(e) {
    const a = keyAction(e);
    if (!a) return;
    if (e.preventDefault) e.preventDefault();
    anyGesture();
    if (Input.lastSource !== "key") { Input.lastSource = "key"; recomputeVisible(); }
    if (!keyDown[a]) latch[a] = true;
    keyDown[a] = true;
  }
  function onKeyUp(e) {
    const a = keyAction(e);
    if (!a) return;
    if (e.preventDefault) e.preventDefault();
    keyDown[a] = false;
  }
  function onBlur() {
    for (let i = 0; i < ACTIONS.length; i++) keyDown[ACTIONS[i]] = false;
    releaseAllPointers();
  }

  // ---- gamepad ---------------------------------------------------
  const PAD_BUTTONS = { 0: "a", 1: "b", 9: "start", 8: "select", 4: "run", 5: "run", 6: "run", 7: "run", 12: "up", 13: "down", 14: "left", 15: "right" };
  const PAD_KEYS = Object.keys(PAD_BUTTONS);
  function pollGamepad() {
    if (!navigator.getGamepads) return;
    let pads;
    try { pads = navigator.getGamepads(); } catch (e) { return; }
    if (!pads) return;
    let gp = null;
    if (Input.gamepadIndex >= 0 && pads[Input.gamepadIndex] && pads[Input.gamepadIndex].connected) gp = pads[Input.gamepadIndex];
    else {
      for (let i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { gp = pads[i]; Input.gamepadIndex = i; break; }
    }
    for (let i = 0; i < ACTIONS.length; i++) padDown[ACTIONS[i]] = false;
    padAxis.x = padAxis.y = padAxis.mag = 0;
    if (!gp) { Input.gamepadIndex = -1; return; }
    let any = false;
    for (let i = 0; i < PAD_KEYS.length; i++) {
      const bi = +PAD_KEYS[i];
      const b = gp.buttons[bi];
      const down = !!(b && (b.pressed || b.value > 0.5));
      if (down) { padDown[PAD_BUTTONS[bi]] = true; any = true; }
    }
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    let m = Math.sqrt(ax * ax + ay * ay);
    if (m > PAD_DEAD) {
      const k = Math.min(1, (m - PAD_DEAD) / (1 - PAD_DEAD)) / m;
      padAxis.x = ax * k; padAxis.y = ay * k; padAxis.mag = Math.min(1, m);
      any = true;
    }
    if (any) {
      if (Input.lastSource !== "pad") { Input.lastSource = "pad"; recomputeVisible(); }
      anyGesture();
    }
  }

  // ---- pointer / touch -------------------------------------------
  function layoutButtons() {
    const V = MQ.View;
    const w = V ? V.w : MQ.BASE_W, h = V ? V.h : MQ.BASE_H;
    const sl = V ? V.safe.left : 0, sr = V ? V.safe.right : 0, sb = V ? V.safe.bottom : 0;
    const k = effScale();
    STICK.radius = Math.round(STICK_R0 * k);
    const A = buttons[0], B = buttons[1], ST = buttons[2], RN = buttons[3];
    A.r = A.r0 * k; B.r = B.r0 * k;
    ST.w = ST.w0 * k; ST.h = ST.h0 * k;
    RN.w = RN.w0 * k; RN.h = RN.h0 * k;
    // The pad sits opposite the stick; mirror every x when the stick moves.
    const padRight = Input.touchSide !== "right";
    const edge = padRight ? (w - sr) : sl;
    const inward = function (d) { return padRight ? edge - d : edge + d; };
    A.x = inward(62 * k); A.y = h - sb - 96 * k;
    B.x = inward(138 * k); B.y = h - sb - 52 * k;
    ST.x = inward(84 * k) - ST.w / 2; ST.y = h - sb - 178 * k;
    RN.x = inward(84 * k + 92 * k) - RN.w / 2; RN.y = h - sb - 178 * k;
    // start/run x,y are top-left; a/b are centres
    reserve.on = !!(Input.touchVisible && !padSuppressed());
    reserve.padSide = padRight ? "right" : "left";
    reserve.padW = Math.round(224 * k);
    reserve.padH = Math.round(212 * k);
    reserve.stickW = Math.round(180 * k);
    reserve.stickH = Math.round(180 * k);
    return reserve;
  }
  // What the on-screen pad is standing on, in logical px, so HUDs and dialogue
  // boxes can keep out of its way instead of guessing a constant.
  const reserve = { on: false, padSide: "right", padW: 224, padH: 212, stickW: 180, stickH: 180 };
  Input.reserve = function () {
    reserve.on = !!(Input.touchVisible && !padSuppressed());
    return reserve;
  };
  // Width to keep clear along the bottom-right (pad) and bottom-left (stick).
  Input.padWidth = function () { return Input.reserve().on ? reserve.padW : 0; };
  Input.padHeight = function () { return Input.reserve().on ? reserve.padH : 0; };
  // The half of the screen that starts the virtual stick.
  function inStickHalf(x) {
    const w = MQ.View ? MQ.View.w : MQ.BASE_W;
    return Input.touchSide === "right" ? x > w * 0.5 : x < w * 0.5;
  }
  // Menu scenes (anything with touchPad === false) get plain taps only: the
  // stick and the A/B/START/RUN pad would sit on top of their lists.
  function padSuppressed() {
    const S = MQ.Scenes;
    if (!S || !S.top) return false;
    const top = S.top();
    return !!(top && top.touchPad === false);
  }
  Input.padSuppressed = padSuppressed;

  function hitButton(x, y) {
    if (!Input.touchVisible || padSuppressed()) return null;
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      if (b.r) {
        const dx = x - b.x, dy = y - b.y;
        if (dx * dx + dy * dy <= (b.r + 10) * (b.r + 10)) return b;
      } else if (x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 8 && y <= b.y + b.h + 8) return b;
    }
    return null;
  }
  function refreshTouchDown() {
    for (let i = 0; i < ACTIONS.length; i++) touchDown[ACTIONS[i]] = false;
    const ids = Object.keys(pointers);
    for (let i = 0; i < ids.length; i++) {
      const p = pointers[ids[i]];
      if (p && p.btn) touchDown[p.btn.action] = true;
    }
  }
  function updateStickFrom(x, y) {
    let dx = (x - stick.ox) / STICK.radius, dy = (y - stick.oy) / STICK.radius;
    let m = Math.sqrt(dx * dx + dy * dy);
    if (m > 1) { dx /= m; dy /= m; m = 1; }
    stick.x = stick.ox + dx * STICK.radius; stick.y = stick.oy + dy * STICK.radius;
    if (m < STICK.dead) { stick.vx = 0; stick.vy = 0; stick.mag = 0; return; }
    const k = (m - STICK.dead) / (1 - STICK.dead) / m;
    stick.vx = dx * k; stick.vy = dy * k; stick.mag = Math.min(1, m);
    // small clamp so a full-deflection stick reads exactly 1
    const mm = Math.sqrt(stick.vx * stick.vx + stick.vy * stick.vy);
    if (mm > 1) { stick.vx /= mm; stick.vy /= mm; }
    stick.mag = Math.min(1, mm);
  }
  function pointerDown(id, cx, cy, isTouch) {
    anyGesture();
    MQ.View.toLogical(cx, cy, pt);
    const x = pt.x, y = pt.y;
    if (isTouch && Input.lastSource !== "touch") { Input.lastSource = "touch"; recomputeVisible(); layoutButtons(); }
    let p = pointers[id];
    if (!p) p = pointers[id] = { x: 0, y: 0, x0: 0, y0: 0, t0: 0, btn: null, isTouch: false, stick: false, moved: false };
    p.x = p.x0 = x; p.y = p.y0 = y; p.t0 = U.now(); p.btn = null; p.isTouch = isTouch; p.stick = false; p.moved = false;
    const b = hitButton(x, y);
    if (b) {
      p.btn = b;
      if (!touchDown[b.action]) latch[b.action] = true;
      refreshTouchDown();
      Input.vibrate(8);
      return;
    }
    if (isTouch && Input.touchVisible && !padSuppressed() && !stick.active && inStickHalf(x)) {
      stick.active = true; stick.id = id; stick.ox = x; stick.oy = y; stick.x = x; stick.y = y;
      stick.vx = stick.vy = stick.mag = 0;
      p.stick = true;
      return;
    }
    // anything else is a candidate drag (list scrolling)
    if (!drag.active) {
      drag.active = true; drag.id = id; drag.moved = false;
      drag.x = drag.x0 = x; drag.y = drag.y0 = y;
      drag._dx = drag._dy = 0;
    }
  }
  function pointerMove(id, cx, cy) {
    const p = pointers[id];
    if (!p) return;
    MQ.View.toLogical(cx, cy, pt);
    p.x = pt.x; p.y = pt.y;
    if (!p.moved && (Math.abs(p.x - p.x0) > TAP_MOVE || Math.abs(p.y - p.y0) > TAP_MOVE)) p.moved = true;
    if (drag.active && drag.id === id) {
      drag._dx += p.x - drag.x; drag._dy += p.y - drag.y;
      drag.x = p.x; drag.y = p.y;
      if (p.moved) drag.moved = true;
    }
    if (p.stick && stick.active && stick.id === id) { updateStickFrom(p.x, p.y); return; }
    if (p.btn || (p.isTouch && Input.touchVisible)) {
      // allow sliding between buttons
      const b = hitButton(p.x, p.y);
      if (b !== p.btn) {
        p.btn = b;
        if (b && !touchDown[b.action]) latch[b.action] = true;
        refreshTouchDown();
      }
    }
  }
  function pointerUp(id) {
    const p = pointers[id];
    if (!p) return;
    const dt = U.now() - p.t0;
    if (p.stick && stick.active && stick.id === id) {
      stick.active = false; stick.id = null; stick.vx = stick.vy = stick.mag = 0;
      p.stick = false;
    }
    if (!p.btn && !p.moved && dt < TAP_MS) {
      // a tap: record for menus (one per frame; last wins)
      tapPending = tapPending || { x: 0, y: 0 };
      tapPending.x = p.x; tapPending.y = p.y;
    }
    p.btn = null;
    if (drag.active && drag.id === id) { drag.active = false; drag.id = null; }
    delete pointers[id];
    refreshTouchDown();
  }
  function releaseAllPointers() {
    const ids = Object.keys(pointers);
    for (let i = 0; i < ids.length; i++) delete pointers[ids[i]];
    stick.active = false; stick.id = null; stick.vx = stick.vy = stick.mag = 0;
    drag.active = false; drag.id = null; drag._dx = drag._dy = 0;
    refreshTouchDown();
  }
  Input.releaseAll = releaseAllPointers;

  // A wheel notch feeds the same drag channel a thumb does, so list code only
  // has to understand one thing.
  function bindWheel(canvas) {
    canvas.addEventListener("wheel", function (e) {
      if (e.preventDefault) e.preventDefault();
      MQ.View.toLogical(e.clientX, e.clientY, pt);
      const unit = e.deltaMode === 1 ? 24 : e.deltaMode === 2 ? 240 : 1;
      drag.active = true; drag.id = "wheel"; drag.moved = true;
      drag.x = drag.x0 = pt.x; drag.y = drag.y0 = pt.y;
      drag._dx -= e.deltaX * unit;
      drag._dy -= e.deltaY * unit;
      wheelIdle = 0;
    }, { passive: false });
  }
  let wheelIdle = 0;

  function bindPointer(canvas) {
    if (window.PointerEvent) {
      canvas.addEventListener("pointerdown", function (e) {
        if (e.preventDefault) e.preventDefault();
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        pointerDown(e.pointerId, e.clientX, e.clientY, e.pointerType !== "mouse");
      });
      const mv = function (e) { pointerMove(e.pointerId, e.clientX, e.clientY); };
      const up = function (e) { pointerUp(e.pointerId); };
      canvas.addEventListener("pointermove", mv);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      window.addEventListener("pointerup", up);
      canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });
      bindWheel(canvas);
    } else {
      // Legacy touch + mouse fallback
      const teach = function (fn) {
        return function (e) {
          if (e.preventDefault) e.preventDefault();
          const ts = e.changedTouches;
          for (let i = 0; i < ts.length; i++) fn(ts[i]);
        };
      };
      canvas.addEventListener("touchstart", teach(function (t) { pointerDown("t" + t.identifier, t.clientX, t.clientY, true); }), { passive: false });
      canvas.addEventListener("touchmove", teach(function (t) { pointerMove("t" + t.identifier, t.clientX, t.clientY); }), { passive: false });
      canvas.addEventListener("touchend", teach(function (t) { pointerUp("t" + t.identifier); }), { passive: false });
      canvas.addEventListener("touchcancel", teach(function (t) { pointerUp("t" + t.identifier); }), { passive: false });
      let mdown = false;
      bindWheel(canvas);
      canvas.addEventListener("mousedown", function (e) { mdown = true; pointerDown("m", e.clientX, e.clientY, false); });
      window.addEventListener("mousemove", function (e) { if (mdown) pointerMove("m", e.clientX, e.clientY); });
      window.addEventListener("mouseup", function () { if (mdown) { mdown = false; pointerUp("m"); } });
    }
  }

  // ---- per-step update (called by MQ.Loop before each fixed step) ---
  Input.update = function () {
    pollGamepad();
    // synthesise current state
    for (let i = 0; i < ACTIONS.length; i++) {
      const a = ACTIONS[i];
      prev[a] = cur[a];
      cur[a] = keyDown[a] || padDown[a] || touchDown[a] || latch[a];
      latch[a] = false;
    }
    while (injected.length) {
      const a = injected.shift();
      cur[a] = true; prev[a] = false;
    }
    // analogue axis: touch stick > gamepad stick > digital dirs
    if (stick.active && stick.mag > 0) {
      axis.x = stick.vx; axis.y = stick.vy;
    } else if (padAxis.mag > 0) {
      axis.x = padAxis.x; axis.y = padAxis.y;
    } else {
      let dx = 0, dy = 0;
      if (cur.left) dx -= 1; if (cur.right) dx += 1;
      if (cur.up) dy -= 1; if (cur.down) dy += 1;
      if (dx !== 0 && dy !== 0) { dx *= 0.70710678; dy *= 0.70710678; }
      axis.x = dx; axis.y = dy;
    }
    axis.mag = Math.min(1, Math.sqrt(axis.x * axis.x + axis.y * axis.y));
    axis.angle = axis.mag > 0 ? Math.atan2(axis.y, axis.x) : 0;
    // analogue deflection also drives digital dirs (menus, facing) and run
    if ((stick.active && stick.mag > 0) || padAxis.mag > 0) {
      const ax = Math.abs(axis.x), ay = Math.abs(axis.y);
      if (ax > 0.5 && ax >= ay * 0.7) cur[axis.x < 0 ? "left" : "right"] = true;
      if (ay > 0.5 && ay >= ax * 0.7) cur[axis.y < 0 ? "up" : "down"] = true;
      if (axis.mag > STICK.runAt) cur.run = true;
    }
    for (let i = 0; i < ACTIONS.length; i++) {
      const a = ACTIONS[i];
      edge[a] = Input.enabled && cur[a] && !prev[a];
      if (!Input.enabled) cur[a] = false;
    }
    if (!Input.enabled) { axis.x = axis.y = axis.mag = 0; }
    // taps
    if (tapPending) { tap.x = tapPending.x; tap.y = tapPending.y; tapThisFrame = true; tapPending = null; }
    else tapThisFrame = false;
    // drag: publish the movement since the last step, then start a fresh tally
    drag.dx = drag._dx; drag.dy = drag._dy;
    drag._dx = 0; drag._dy = 0;
    if (drag.id === "wheel") {
      wheelIdle = (drag.dy || drag.dx) ? 0 : wheelIdle + 1;
      if (wheelIdle > 6) { drag.active = false; drag.id = null; }
    }
    if (!Input.enabled) { drag.dx = drag.dy = 0; }
  };

  // ---- draw touch overlay (called by MQ.Loop after scenes) ---------
  Input.draw = function (ctx) {
    if (!Input.touchVisible || padSuppressed()) return;
    const V = MQ.View;
    const A0 = U.clamp(Input.touchAlpha, 0, 1);
    if (A0 <= 0.01) return;
    ctx.save();
    ctx.lineWidth = 2;
    // stick
    if (stick.active) {
      ctx.globalAlpha = 0.65 * A0;
      ctx.strokeStyle = "rgba(230,230,255,0.9)";
      ctx.fillStyle = "rgba(60,60,90,0.35)";
      ctx.beginPath(); ctx.arc(stick.ox, stick.oy, STICK.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(240,240,255,0.85)";
      ctx.beginPath(); ctx.arc(stick.x, stick.y, Math.round(22 * effScale()), 0, Math.PI * 2); ctx.fill();
    } else {
      // resting hint
      ctx.globalAlpha = 0.21 * A0;
      ctx.strokeStyle = "#e6e6ff";
      const k = effScale();
      const hx = Input.touchSide === "right" ? (V.w - V.safe.right - 110 * k) : (V.safe.left + 110 * k);
      const hy = V.h - V.safe.bottom - 110 * k;
      ctx.beginPath(); ctx.arc(hx, hy, STICK.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(hx, hy, 20 * k, 0, Math.PI * 2); ctx.stroke();
    }
    // buttons
    ctx.globalAlpha = A0;
    for (let i = 0; i < buttons.length; i++) {
      const b = buttons[i];
      const down = touchDown[b.action];
      ctx.fillStyle = down ? "rgba(220,220,255,0.6)" : b.color;
      ctx.strokeStyle = "rgba(220,220,240,0.6)";
      if (b.r) {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (MQ.Text) MQ.Text.draw(ctx, b.label, b.x, b.y - MQ.Text.px("m") / 2, { size: "m", align: "center", color: "#f4f4ff" });
      } else {
        MQ.UI && MQ.UI.roundRect ? MQ.UI.roundRect(ctx, b.x, b.y, b.w, b.h, 8) : ctx.rect(b.x, b.y, b.w, b.h);
        ctx.fill(); ctx.stroke();
        if (MQ.Text) MQ.Text.draw(ctx, b.label, b.x + b.w / 2, b.y + (b.h - MQ.Text.px("s")) / 2, { size: "s", align: "center", color: "#f4f4ff" });
      }
    }
    ctx.restore();
  };

  // ---- init ------------------------------------------------------
  Input.init = function (canvas) {
    if (Input.ready) return Input;
    Input.ready = true;
    canvas = canvas || (MQ.View && MQ.View.canvas);
    try { Input.coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches); } catch (e) { Input.coarse = false; }
    if (Input.coarse) Input.lastSource = "touch";
    recomputeVisible();
    layoutButtons();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    if (canvas) bindPointer(canvas);
    window.addEventListener("gamepadconnected", function (e) { Input.gamepadIndex = e.gamepad ? e.gamepad.index : 0; });
    window.addEventListener("gamepaddisconnected", function () { Input.gamepadIndex = -1; });
    if (MQ.Events) MQ.Events.on("resize", layoutButtons);
    return Input;
  };
  Input.layoutButtons = layoutButtons;

  MQ.Input = Input;
})();
