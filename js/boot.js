// =============================================================
// MonsterQuest v2 — MQ.Boot (core): start-up sequence
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;

  const Boot = { started: false, ready: false };

  // Any subsystem exposing `saveProvider = {save, load}` gets registered
  // under its lower-cased namespace key (e.g. MQ.Party → 'party') unless it
  // registered itself already.
  Boot.registerProviders = function () {
    if (!MQ.Save) return;
    const ks = Object.keys(MQ);
    for (let i = 0; i < ks.length; i++) {
      const sys = MQ[ks[i]];
      if (!sys || typeof sys !== "object" || !sys.saveProvider) continue;
      const key = sys.saveKey || ks[i].toLowerCase();
      if (!MQ.Save.providers[key]) MQ.Save.register(key, sys.saveProvider);
    }
  };

  Boot.buildArt = function () {
    try { if (MQ.Tiles && MQ.Tiles.warm) MQ.Tiles.warm(); } catch (e) { MQ.warn("[Boot] Tiles.warm failed", e); }
    try { if (MQ.Art && MQ.Art.warm) MQ.Art.warm(); } catch (e) { MQ.warn("[Boot] Art.warm failed", e); }
    try { if (MQ.PeopleArt && MQ.PeopleArt.warm) MQ.PeopleArt.warm(); } catch (e) { MQ.warn("[Boot] PeopleArt.warm failed", e); }
  };

  Boot.init = function () {
    if (Boot.ready) return;
    Boot.ready = true;
    MQ.View.init();
    MQ.Input.init(MQ.View.canvas);
    Boot.buildArt();
    Boot.registerProviders();
    if (MQ.Settings && MQ.Settings.load) { try { MQ.Settings.load(); } catch (e) { MQ.warn("[Boot] settings load failed", e); } }
    if (MQ.Audio && MQ.Audio.init) { try { MQ.Audio.init(); } catch (e) { MQ.warn("[Boot] audio init failed", e); } }
    MQ.Events.emit("boot");
    const title = (MQ.UI && MQ.UI.Title) ? MQ.UI.Title : Boot.placeholderTitle();
    MQ.Scenes.push(title);
    MQ.Loop.start();
    MQ.log("[Boot] MonsterQuest v" + MQ.VERSION + " started; " + MQ.View.w + "x" + MQ.View.h + " logical @" + MQ.View.S.toFixed(3) + "x dpr " + MQ.View.dpr);
  };

  Boot.start = function () {
    if (window.__MQ_NO_BOOT || Boot.started) return;
    Boot.started = true;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", Boot.init);
    else Boot.init();
  };

  // ---- built-in placeholder title (used until MQ.UI.Title exists) -----
  Boot.placeholderTitle = function () {
    const U = MQ.U, T = MQ.Text, UI = MQ.UI;
    const WALK = 4.2 * MQ.TILE / 1000, RUN = 7.0 * MQ.TILE / 1000;   // px per ms
    const sc = {
      id: "title_placeholder",
      px: 0, py: 0, dir: "down", moving: false, animT: 0, frame: 0,
      demoT: 0, sprite: null, tiles: null,
      enter: function () {
        sc.px = MQ.View.w / 2; sc.py = MQ.View.h / 2 + 40;
        if (MQ.Art && MQ.Art.render) {
          const art = [
            "....bbbbbbbb....", "...bhhhhhhhhb...", "..bhhhhhhhhhhb..", "..bhssssssssHb..",
            "..bhsEssssEsHb..", "..bhssssssssHb..", "...bssssssssb...", "....ssrrrrss....",
            "...rrrrrrrrrr...", "..srrrrrrrrrrs..", "..srrrrrrrrrrs..", "...rrrrrrrrrr...",
            "....pppppppp....", "....ppp..ppp....", "....ppp..ppp....", "...kkk....kkk..."
          ];
          const pal = { b: "#3a2818", h: "#a0602a", s: "#f4c8a0", E: "#202030", H: "#e0a880", r: "#c62828", p: "#2a4fa8", k: "#302020" };
          sc.sprite = MQ.Art.render(art, pal, 3);
        }
        if (MQ.Tiles && MQ.Tiles.get) {
          sc.tiles = ["grass", "grass_tall", "path_dirt", "path_cobble", "water", "tree_oak", "wall_brick_red", "roof_slate", "door_wood", "salt_flat", "rail_track_h", "dish"];
        }
      },
      update: function (dt) {
        const I = MQ.Input;
        const ax = I.axis();
        const speed = I.held("run") ? RUN : WALK;
        if (ax.mag > 0) {
          sc.px += ax.x * ax.mag * speed * dt;
          sc.py += ax.y * ax.mag * speed * dt;
          sc.dir = U.dirFrom(ax.x, ax.y);
          sc.moving = true;
          sc.animT += dt;
        } else { sc.moving = false; sc.animT = 0; }
        const V = MQ.View;
        sc.px = U.clamp(sc.px, 24, V.w - 24); sc.py = U.clamp(sc.py, 24, V.h - 24);
        sc.frame = Math.floor(sc.animT / 140) % 4;
        if (I.pressed("a") || I.pressed("start")) {
          I.consume("a"); I.consume("start");
          MQ.Dialog.say(["MonsterQuest v2 foundation is running.", "This placeholder title stands in until MQ.UI.Title arrives. Move with the stick, WASD or a gamepad."], { name: "Engine" })
            .then(function () { return MQ.Dialog.ask("Try a transition?", [{ label: "Fade", value: "fade" }, { label: "Wipe", value: "wipe" }, { label: "Battle", value: "battle" }, { label: "No thanks", value: null }]); })
            .then(function (v) { if (v) MQ.Scenes.transition(v, 900); if (v === "battle") MQ.Scenes.shake(500, 8); });
        }
        if (I.pressed("select")) { I.consume("select"); MQ.UI.toast("Toast at " + MQ.Clock.timeString()); MQ.Dialog.banner("Cheshire", "Foundation build"); }
        sc.demoT += dt;
      },
      draw: function (ctx) {
        const V = MQ.View;
        const w = V.w, h = V.h;
        // background gradient bands
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#1a1a3a"); g.addColorStop(1, "#0a2a1a");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        // subtle grid so scaling can be seen
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
        for (let x = 0; x < w; x += MQ.TILE) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
        for (let y = 0; y < h; y += MQ.TILE) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
        // tile strip
        if (sc.tiles) {
          const tx0 = Math.round(w / 2 - sc.tiles.length * 20);
          for (let i = 0; i < sc.tiles.length; i++) {
            const cv = MQ.Tiles.get(sc.tiles[i], Math.floor(sc.demoT / 400), i);
            if (cv) ctx.drawImage(cv, tx0 + i * 40, V.safe.top + 120, 32, 32);
          }
        }
        T.draw(ctx, "MonsterQuest v2 — foundation", w / 2, V.safe.top + 40, { size: "l", align: "center", color: "#ffe6a0", shadow: true });
        T.draw(ctx, "The Cheshire Protocol", w / 2, V.safe.top + 76, { size: "m", align: "center", color: "#c8c8e0" });
        const hint = MQ.Input.lastSource === "touch" ? "Stick to move  •  A: dialog  •  START" : MQ.Input.lastSource === "pad" ? "Left stick to move  •  A: dialog  •  Start" : "WASD/Arrows move  •  Shift run  •  Z/Enter dialog  •  Tab toast";
        T.draw(ctx, hint, w / 2, h - V.safe.bottom - 34, { size: "s", align: "center", color: "#9a9ab8" });
        T.draw(ctx, V.W + "x" + V.H + " css  " + Math.round(V.w) + "x" + Math.round(V.h) + " logical  S=" + V.S.toFixed(2) + " dpr=" + V.dpr + "  " + MQ.Loop.fps + "fps  " + MQ.Clock.timeString() + " " + MQ.Clock.phase, V.safe.left + 12, h - V.safe.bottom - 22, { size: "s", color: "#6a6a88" });
        // test sprite
        const bob = sc.moving ? (sc.frame % 2) * 2 : 0;
        if (sc.sprite) {
          ctx.drawImage(sc.sprite, Math.round(sc.px - 24), Math.round(sc.py - 40 - bob), 48, 48);
        } else {
          ctx.fillStyle = "#c62828"; ctx.fillRect(Math.round(sc.px - 12), Math.round(sc.py - 12 - bob), 24, 24);
        }
        // facing marker
        const dv = U.dirVec[sc.dir];
        ctx.fillStyle = "#fff"; ctx.fillRect(Math.round(sc.px + dv[0] * 20 - 2), Math.round(sc.py + dv[1] * 20 - 2), 4, 4);
        // axis readout
        const ax = MQ.Input.axis();
        T.draw(ctx, "axis " + ax.x.toFixed(2) + "," + ax.y.toFixed(2) + " mag " + ax.mag.toFixed(2) + (MQ.Input.held("run") ? " RUN" : ""), V.safe.left + 12, V.safe.top + 12, { size: "s", color: "#8a8aa8" });
      }
    };
    return sc;
  };

  MQ.Boot = Boot;
})();
