// =============================================================
// MonsterQuest v2 — MQ.Text (core): crisp monospace text
// sizes: s=14, m=18, l=26 logical px. Font "Courier New" bold.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;

  const SIZES = { s: 14, m: 18, l: 26, xl: 40 };
  const FAMILY = '"Courier New", Courier, monospace';
  const fontCache = {};      // px → font string
  const charW = {};          // px → advance width of one glyph (monospace)
  let measureCtx = null;

  // Every size runs through the view's text scale, so one setting (and the
  // automatic step-up on physically small screens) moves all of the type
  // together. Rounded to whole logical px so the glyph cache stays small.
  function scale() {
    const V = MQ.View;
    const k = (V && V.ui && V.ui.text) || 1;
    return (k > 0) ? k : 1;
  }
  function px(size) {
    const base = (typeof size === "number") ? size : (SIZES[size] || SIZES.m);
    const k = scale();
    return k === 1 ? base : Math.max(8, Math.round(base * k));
  }
  function font(p) {
    return fontCache[p] || (fontCache[p] = "bold " + p + "px " + FAMILY);
  }
  function glyphW(p) {
    if (charW[p]) return charW[p];
    let w = 0;
    try {
      if (!measureCtx) {
        const c = document.createElement("canvas");
        measureCtx = c.getContext("2d");
      }
      if (measureCtx) {
        measureCtx.font = font(p);
        w = measureCtx.measureText("MMMMMMMMMM").width / 10;
      }
    } catch (e) { w = 0; }
    if (!w || !isFinite(w)) w = p * 0.6;
    charW[p] = w;
    return w;
  }

  const Text = {
    SIZES: SIZES,
    FAMILY: FAMILY,
    px: px,
    scale: scale,
    font: font,
    lineHeight: function (size) { return Math.round(px(size) * 1.3); },
    width: function (str, size) { return str.length * glyphW(px(size)); },
    charWidth: function (size) { return glyphW(px(size)); },

    // Word-wrap to maxWidth (logical px). Honours explicit "\n". Returns string[].
    wrap: function (str, maxWidth, size) {
      const cw = glyphW(px(size));
      const maxChars = Math.max(1, Math.floor(maxWidth / cw));
      const out = [];
      const paras = String(str).split("\n");
      for (let p = 0; p < paras.length; p++) {
        const words = paras[p].split(" ");
        let line = "";
        for (let i = 0; i < words.length; i++) {
          let w = words[i];
          while (w.length > maxChars) {   // hard-break very long words
            if (line) { out.push(line); line = ""; }
            out.push(w.slice(0, maxChars));
            w = w.slice(maxChars);
          }
          if (!line) line = w;
          else if (line.length + 1 + w.length <= maxChars) line += " " + w;
          else { out.push(line); line = w; }
        }
        out.push(line);
      }
      return out;
    },

    // draw(ctx, str, x, y, {size, color, align:'left'|'center'|'right', shadow, maxWidth, alpha})
    // Baseline is top. Returns drawn width.
    draw: function (ctx, str, x, y, o) {
      if (str === undefined || str === null) return 0;
      str = String(str);
      const p = px(o && o.size);
      ctx.font = font(p);
      ctx.textBaseline = "top";
      const align = (o && o.align) || "left";
      ctx.textAlign = align;
      const w = str.length * glyphW(p);
      x = Math.round(x); y = Math.round(y);
      const mw = o && o.maxWidth;
      if (o && o.alpha !== undefined) { ctx.save(); ctx.globalAlpha = o.alpha; }
      if (o && o.shadow) {
        ctx.fillStyle = typeof o.shadow === "string" ? o.shadow : "rgba(0,0,0,0.6)";
        if (mw && w > mw) ctx.fillText(str, x + 1, y + 2, mw); else ctx.fillText(str, x + 1, y + 2);
      }
      ctx.fillStyle = (o && o.color) || "#f0f0f8";
      if (mw && w > mw) ctx.fillText(str, x, y, mw); else ctx.fillText(str, x, y);
      if (o && o.alpha !== undefined) ctx.restore();
      ctx.textAlign = "left";
      return mw && w > mw ? mw : w;
    },

    // Draw wrapped paragraph; returns number of lines drawn.
    drawWrapped: function (ctx, str, x, y, maxWidth, o) {
      const lines = Text.wrap(str, maxWidth, o && o.size);
      const lh = (o && o.lineHeight) || Text.lineHeight(o && o.size);
      for (let i = 0; i < lines.length; i++) Text.draw(ctx, lines[i], x, y + i * lh, o);
      return lines.length;
    },

    // Chars-per-line helper for typewriter code
    charsPerLine: function (maxWidth, size) { return Math.max(1, Math.floor(maxWidth / glyphW(px(size)))); }
  };

  MQ.Text = Text;
})();
