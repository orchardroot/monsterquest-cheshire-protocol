// =============================================================
// MonsterQuest v2 — MQ.Dialog (core): dialogue box scene
// say(pages, opts) → Promise; typewriter, pages, name tag,
// portrait, choices (keys/pad/tap), auto-wrap via MQ.Text.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;

  const Dialog = {
    auto: false,            // headless/skip mode: reveal instantly and auto-advance
    autoChoice: 0,          // choice index picked in auto mode
    speed: 1,               // multiplier (settings)
    CPS: 45,                // chars per second at speed 1
    LINES: 3,
    active: 0
  };

  function makeScene(pages, opts, resolve) {
    if (typeof pages === "string") pages = [pages];
    if (!pages || !pages.length) pages = [""];
    opts = opts || {};
    const sc = {
      id: "dialog",
      transparent: true,
      updateBelow: !!opts.updateBelow,
      pages: pages.map(String),
      opts: opts,
      pageIdx: 0,
      lines: [],            // wrapped lines of current page
      chars: 0,             // revealed char count (float)
      total: 0,
      done: false,
      choosing: false,
      menu: null,
      box: { x: 0, y: 0, w: 0, h: 0, tx: 0 },
      resolve: resolve,
      result: undefined,
      blip: 0
    };

    sc.layout = function () {
      const V = MQ.View;
      const w = Math.min(V.w - 20, 940);
      const h = 142;
      sc.box.w = w; sc.box.h = h;
      sc.box.x = Math.round((V.w - w) / 2);
      sc.box.y = opts.position === "top" ? Math.round(V.safe.top + 12) : Math.round(V.h - V.safe.bottom - h - 10);
      sc.box.tx = 26 + (opts.portrait ? 110 : 0);
      sc.repage();
    };
    // Wrap the current page's text; overflow beyond LINES lines spills into extra pages.
    sc.repage = function () {
      const maxW = sc.box.w - sc.box.tx - 40;
      const wrapped = T.wrap(sc.pages[sc.pageIdx], maxW, "m");
      if (wrapped.length > Dialog.LINES) {
        const rest = wrapped.slice(Dialog.LINES).join(" ");
        sc.pages.splice(sc.pageIdx + 1, 0, rest);
        sc.lines = wrapped.slice(0, Dialog.LINES);
      } else sc.lines = wrapped;
      sc.total = 0;
      for (let i = 0; i < sc.lines.length; i++) sc.total += sc.lines[i].length;
    };
    sc.enter = function () {
      Dialog.active++;
      sc.chars = 0;
      sc.layout();
      if (opts.sfx !== false && MQ.Audio && MQ.Audio.sfx && opts.openSfx) MQ.Audio.sfx(opts.openSfx);
    };
    sc.exit = function () { Dialog.active--; };
    sc.onResize = function () { const p = sc.pageIdx; sc.layout(); sc.pageIdx = p; };

    sc.finishPage = function () { sc.chars = sc.total; };
    sc.isLast = function () { return sc.pageIdx >= sc.pages.length - 1; };
    sc.advance = function () {
      if (!sc.isLast()) {
        sc.pageIdx++;
        sc.chars = 0;
        sc.repage();
        return;
      }
      if (opts.choices && opts.choices.length && !sc.choosing) {
        sc.choosing = true;
        sc.menu = UI.menuState(opts.choices, { cancel: !!opts.cancel });
        return;
      }
      sc.close(undefined);
    };
    sc.close = function (value) {
      if (sc.done) return;
      sc.done = true;
      sc.result = value;
      MQ.Scenes.pop(value);
    };

    sc.update = function (dt) {
      const I = MQ.Input;
      if (sc.done) return;
      // typewriter
      if (sc.chars < sc.total) {
        const cps = Dialog.CPS * (opts.speed || Dialog.speed);
        if (Dialog.auto || cps >= 900) sc.chars = sc.total;
        else {
          const before = Math.floor(sc.chars);
          sc.chars = Math.min(sc.total, sc.chars + cps * dt / 1000);
          if (Math.floor(sc.chars) > before && MQ.Audio && MQ.Audio.sfx && opts.sfx !== false) {
            sc.blip++;
            if (sc.blip % 3 === 0) MQ.Audio.sfx(opts.sfx || "text");
          }
        }
      }
      if (Dialog.auto) {
        if (sc.choosing) {
          const ch = opts.choices[U.clamp(Dialog.autoChoice, 0, opts.choices.length - 1)];
          sc.close(ch && typeof ch === "object" && ch.value !== undefined ? ch.value : ch);
        } else sc.advance();
        return;
      }
      if (sc.choosing) {
        const r = sc.menu.update();
        if (r && r.selected !== undefined) {
          if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("confirm");
          sc.close(r.value);
        } else if (r && r.cancel) {
          sc.close(opts.cancelValue);
        }
        return;
      }
      const tp = I.tapAt();
      const tapped = !!tp;
      if (I.pressed("a") || tapped) {
        I.consume("a");
        if (sc.chars < sc.total) sc.finishPage();
        else { if (MQ.Audio && MQ.Audio.sfx) MQ.Audio.sfx("confirm"); sc.advance(); }
      } else if (I.pressed("b")) {
        I.consume("b");
        if (sc.chars < sc.total) sc.finishPage();
        else sc.advance();
      }
    };

    sc.draw = function (ctx) {
      const b = sc.box;
      const V = MQ.View;
      // dim behind slightly when choices are up
      UI.box(ctx, b.x, b.y, b.w, b.h, { style: opts.style || "default" });
      // name tag
      if (opts.name) {
        const nw = T.width(opts.name, "m") + 30;
        const ny = b.y - 34;
        UI.box(ctx, b.x + 16, ny, nw, 40, { style: "dark" });
        T.draw(ctx, opts.name, b.x + 31, ny + 11, { size: "m", color: "#ffe6a0" });
      }
      // portrait
      if (opts.portrait) {
        const px = b.x + 18, py = b.y + 18, ps = 106;
        ctx.fillStyle = "#282838"; ctx.fillRect(px, py, ps, ps);
        const p = opts.portrait;
        if (typeof p === "function") p(ctx, px, py, ps);
        else if (p && p.width) ctx.drawImage(p, px, py, ps, ps);
        else if (typeof p === "string" && MQ.PeopleArt && MQ.PeopleArt.portrait) {
          const cv = MQ.PeopleArt.portrait(p);
          if (cv) ctx.drawImage(cv, px, py, ps, ps);
        }
      }
      // text lines with reveal
      let remaining = Math.floor(sc.chars);
      const lh = 32;
      for (let i = 0; i < sc.lines.length; i++) {
        const ln = sc.lines[i];
        if (remaining <= 0) break;
        const shown = remaining >= ln.length ? ln : ln.slice(0, remaining);
        T.draw(ctx, shown, b.x + b.tx, b.y + 24 + i * lh, { size: "m", color: "#202030" });
        remaining -= ln.length;
      }
      if (sc.chars >= sc.total && !sc.choosing) UI.advanceArrow(ctx, b.x + b.w - 42, b.y + b.h - 26);
      if (sc.choosing && sc.menu) {
        const items = opts.choices;
        let mw = 200;
        for (let i = 0; i < items.length; i++) mw = Math.max(mw, T.width(typeof items[i] === "string" ? items[i] : items[i].label, "m") + 70);
        const mh = items.length * 34 + 28;
        const mx = b.x + b.w - mw - 6, my = opts.position === "top" ? b.y + b.h + 8 : b.y - mh - 8;
        UI.menu(sc.menu, ctx, items, { x: mx, y: my, w: mw, rowH: 34, style: opts.style || "default" });
      }
    };
    return sc;
  }

  Dialog.say = function (pages, opts) {
    return new Promise(function (resolve) {
      const sc = makeScene(pages, opts, resolve);
      MQ.Scenes.pushP(sc).then(function (v) { resolve(v); });
    });
  };
  Dialog.ask = function (question, choices, opts) {
    opts = opts || {};
    opts.choices = choices;
    return Dialog.say(question, opts);
  };
  Dialog.confirm = function (question, opts) {
    return Dialog.ask(question, [{ label: "Yes", value: true }, { label: "No", value: false }], opts).then(function (v) { return v === true; });
  };
  Dialog.notify = function (text, ms) { UI.toast(text, ms); };
  Dialog.banner = function (title, subtitle, ms) { UI.banner(title, subtitle, ms); };
  Dialog.isOpen = function () { return Dialog.active > 0; };
  Dialog.makeScene = makeScene;

  MQ.Dialog = Dialog;
})();
