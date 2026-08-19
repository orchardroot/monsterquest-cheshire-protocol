// =============================================================
// MonsterQuest v2 — MQ.UI.Shop (ui): buying and selling with
// quantities, stock lists passed in by the caller, and a visible
// shop variant (chemist, market, chapters, press, rods, arena).
// MQ.UI.Shop.open({name, variant, stock, greeting, sellRate, currency})
//   stock = [{id, price?, stock?, cond?}]  -> Promise<void>
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const U = MQ.U, T = MQ.Text, UI = MQ.UI;
  function TH() { return UI.Theme; }

  const VARIANTS = {
    mart: { name: "General Store", accent: "#c9a34a", icon: "bag", currency: "credits", greeting: "Morning. Everything on the shelf is on the shelf.", bye: "Mind how you go." },
    chemist: { name: "Chemist", accent: "#5fc96a", icon: "heart", currency: "credits", greeting: "Anything you take, read the label first.", bye: "Don't exceed the stated dose." },
    market: { name: "Market Stall", accent: "#e2703f", icon: "coin", currency: "credits", greeting: "Saturday prices. Saturday attitude.", bye: "Go on then." },
    bookshop: { name: "Chapters", accent: "#6b5a86", icon: "book", currency: "credits", greeting: "Skill Cards behind the counter. Please don't fold them.", bye: "Read the small print." },
    brewery: { name: "The Press", accent: "#4f9d4f", icon: "fish", currency: "credits", greeting: "Perry, cordial, and whatever the trees felt like this year.", bye: "Diolch." },
    rods: { name: "Tackle", accent: "#3f7fd0", icon: "fish", currency: "credits", greeting: "Rods, line, and no promises about the fish.", bye: "Tight lines." },
    arena: { name: "Arena Exchange", accent: "#e05252", icon: "sword", currency: "chips", greeting: "Chips only. The bank does not take credits here.", bye: "Next bout's in ten." },
    bounty: { name: "Casebook Desk", accent: "#3fe0c8", icon: "quest", currency: "marks", greeting: "Marks buy favours, not forgiveness.", bye: "File it properly next time." }
  };

  function itemData(id) { try { return (MQ.Data && MQ.Data.items && MQ.Data.items[id]) || null; } catch (e) { return null; } }
  function itemName(id) { const it = itemData(id); return (it && it.name) || TH().titleCase(id); }
  function symbolFor(cur) { return cur === "chips" ? " chips" : cur === "marks" ? " marks" : "cr"; }

  function wallet(cur) {
    try {
      if (cur === "credits") return (MQ.Inventory && MQ.Inventory.money) || 0;
      if (MQ.Trainer && MQ.Trainer[cur] !== undefined) return MQ.Trainer[cur];
      if (MQ.Flags && MQ.Flags.get) return MQ.Flags.get(cur) || 0;
    } catch (e) { /* ignore */ }
    return 0;
  }
  function spend(cur, n) {
    try {
      if (cur === "credits") {
        if (MQ.Inventory && MQ.Inventory.spend) { MQ.Inventory.spend(n); return true; }
        if (MQ.Inventory && MQ.Inventory.money !== undefined) { MQ.Inventory.money -= n; return true; }
        return false;
      }
      if (MQ.Trainer && MQ.Trainer[cur] !== undefined) { MQ.Trainer[cur] -= n; return true; }
      if (MQ.Flags && MQ.Flags.add) { MQ.Flags.add(cur, -n); return true; }
    } catch (e) { /* ignore */ }
    return false;
  }
  function earn(cur, n) { return spend(cur, -n); }
  function discount() {
    try {
      const p = MQ.Trainer && MQ.Trainer.perks;
      if (p && p.has && p.has("perk_adjudicate_trader")) return 0.9;
    } catch (e) { /* ignore */ }
    return 1;
  }

  // Sellable stock from the inventory
  function sellRows(rate) {
    const out = [];
    const all = UI.Bag && UI.Bag.entries ? UI.Bag.entries() : [];
    for (let i = 0; i < all.length; i++) {
      const it = itemData(all[i].id);
      if (!it) continue;
      if (it.kind === "key" || it.kind === "rod") continue;
      if (it.sellable === false) continue;
      const price = Math.max(1, Math.floor((it.price || 0) * rate));
      if (!it.price) continue;
      out.push({ id: all[i].id, n: all[i].n, price: price, label: itemName(all[i].id), right: price + "cr", have: all[i].n });
    }
    out.sort(function (a, b) { return a.label < b.label ? -1 : 1; });
    return out;
  }

  const sc = {
    id: "shop", tab: 0, st: null, rows: [], busy: false,
    variant: "mart", def: VARIANTS.mart, shopName: "", stock: [], sellRate: 0.5, currency: "credits", greeting: ""
  };
  const TABS = ["Buy", "Sell", "Leave"];
  const HINTS = [{ btn: "a", label: "Choose" }, { btn: "b", label: "Leave" }, { btn: "lr", label: "Buy / Sell" }];

  sc.buyRows = function () {
    const out = [];
    const disc = discount();
    for (let i = 0; i < sc.stock.length; i++) {
      const s = sc.stock[i];
      const id = typeof s === "string" ? s : s.id;
      const it = itemData(id);
      if (s.cond && MQ.Flags && MQ.Flags.test && !MQ.Flags.test(s.cond)) continue;
      const base = (s.price !== undefined ? s.price : (it && it.price)) || 0;
      const price = Math.max(1, Math.round(base * disc));
      const left = s.stock === undefined ? -1 : s.stock;
      if (left === 0) continue;
      out.push({
        id: id, price: price, label: itemName(id), stockLeft: left,
        right: price + symbolFor(sc.currency), src: s
      });
    }
    return out;
  };

  sc.rebuild = function () {
    sc.rows = sc.tab === 0 ? sc.buyRows() : sc.tab === 1 ? sellRows(sc.sellRate) : [];
    if (!sc.st) sc.st = UI.menuState(sc.rows, { visible: 8 });
    else sc.st.setItems(sc.rows);
    if (sc.st.cursor >= sc.rows.length) sc.st.setCursor(Math.max(0, sc.rows.length - 1));
  };

  sc.enter = function (params) {
    params = params || {};
    sc.variant = params.variant || "mart";
    sc.def = VARIANTS[sc.variant] || VARIANTS.mart;
    sc.shopName = params.name || sc.def.name;
    sc.stock = params.stock || [];
    sc.sellRate = params.sellRate === undefined ? 0.5 : params.sellRate;
    sc.currency = params.currency || sc.def.currency;
    sc.greeting = params.greeting || sc.def.greeting;
    sc.tab = 0;
    sc.busy = false;
    sc.rebuild();
    // mark the variant so the world can tell where the player has traded
    try { if (MQ.Flags && MQ.Flags.set) MQ.Flags.set("shop_seen_" + sc.variant, true); } catch (e) { /* ignore */ }
    TH().sfx("ui_open");
    TH().toast(sc.greeting, 3000);
  };
  sc.resume = function () { sc.busy = false; sc.rebuild(); };

  sc.buy = function (row) {
    const Theme = TH();
    const have = wallet(sc.currency);
    const afford = Math.floor(have / row.price);
    if (afford < 1) { Theme.sfx("ui_error"); Theme.say(["Not with that in your pocket, it isn't."], { name: sc.shopName }); return; }
    const cap = row.stockLeft > 0 ? Math.min(afford, row.stockLeft) : Math.min(afford, 99);
    sc.busy = true;
    UI.Quantity.open({
      max: cap, price: row.price, unit: symbolFor(sc.currency),
      label: "How many " + row.label + "?",
      sub: "You have " + U.fmtNum(have) + symbolFor(sc.currency) + (row.stockLeft > 0 ? "   |   " + row.stockLeft + " in stock" : "")
    }).then(function (n) {
      if (!n) { sc.busy = false; return; }
      const cost = n * row.price;
      return Theme.confirm(n + " " + row.label + " for " + U.fmtNum(cost) + symbolFor(sc.currency) + "?").then(function (yes) {
        sc.busy = false;
        if (!yes) return;
        if (wallet(sc.currency) < cost) { Theme.sfx("ui_error"); Theme.toast("Short."); return; }
        if (!spend(sc.currency, cost)) { Theme.sfx("ui_error"); Theme.toast("The till is not connected."); return; }
        try { if (MQ.Inventory && MQ.Inventory.add) MQ.Inventory.add(row.id, n); } catch (e) { /* ignore */ }
        if (row.src && row.src.stock !== undefined && row.src.stock > 0) row.src.stock -= n;
        Theme.sfx("coin");
        Theme.toast("Bought " + n + " " + row.label + ".");
        sc.rebuild();
      });
    });
  };

  sc.sell = function (row) {
    const Theme = TH();
    sc.busy = true;
    UI.Quantity.open({
      max: row.have, price: row.price, unit: symbolFor("credits"),
      label: "Sell how many " + row.label + "?",
      sub: "They go for " + row.price + "cr each. You have " + row.have + "."
    }).then(function (n) {
      if (!n) { sc.busy = false; return; }
      const take = n * row.price;
      return Theme.confirm("Sell " + n + " " + row.label + " for " + U.fmtNum(take) + "cr?").then(function (yes) {
        sc.busy = false;
        if (!yes) return;
        try { if (MQ.Inventory && MQ.Inventory.remove) MQ.Inventory.remove(row.id, n); } catch (e) { /* ignore */ }
        earn("credits", take);
        Theme.sfx("coin");
        Theme.toast("Sold. " + U.fmtNum(take) + "cr.");
        sc.rebuild();
      });
    });
  };

  sc.setTab = function (i) {
    if (i === 2) { sc.leave(); return; }
    sc.tab = i;
    sc.rebuild();
    TH().sfx("ui_move");
  };
  sc.leave = function () {
    TH().sfx("ui_close");
    TH().toast(sc.def.bye);
    MQ.Scenes.pop(null);
  };

  sc.update = function () {
    if (sc.busy) return;
    const I = MQ.Input, Theme = TH();
    const tab = Theme.tabTapped();
    if (tab >= 0) { sc.setTab(tab); return; }
    if (I.pressed("left")) { I.consume("left"); sc.setTab(sc.tab === 0 ? 1 : 0); return; }
    if (I.pressed("right")) { I.consume("right"); sc.setTab(sc.tab === 0 ? 1 : 0); return; }
    if (I.pressed("select")) { I.consume("select"); sc.setTab(sc.tab === 0 ? 1 : 0); return; }
    const res = sc.st.update();
    if (res) {
      if (res.cancel) { sc.leave(); return; }
      if (res.selected !== undefined) {
        const row = sc.rows[res.selected];
        if (!row) return;
        if (sc.tab === 0) sc.buy(row); else sc.sell(row);
        return;
      }
    }
    if (Theme.backPressed()) sc.leave();
  };

  sc.draw = function (ctx) {
    const Theme = TH(), C = Theme.C, m = Theme.m();
    Theme.backdrop(ctx, { top: "#1e1a2c", bottom: "#161a14" });
    const have = wallet(sc.currency);
    Theme.header(ctx, {
      title: sc.shopName, sub: sc.def.name, icon: sc.def.icon, accent: sc.def.accent,
      right: U.fmtNum(have) + symbolFor(sc.currency)
    });
    const top = Theme.headerBottom();
    const th = Theme.tabStrip(ctx, TABS, sc.tab, { x: m.l, y: top, w: Math.min(360, m.cw) });
    const y0 = top + th + 8;
    const bot = Theme.footerTop() - 6;
    const listW = m.cw * 0.58;
    Theme.list(sc.st, ctx, {
      x: m.l, y: y0, w: listW, h: bot - y0, rowH: Math.round(38 * m.k), gap: 4,
      empty: sc.tab === 0 ? "The shelves are bare today." : "Nothing here is worth selling."
    });
    const px = m.l + listW + 20, pw = m.r - px;
    Theme.panel(ctx, px, y0, pw, bot - y0, { accent: sc.def.accent });
    const row = sc.rows[sc.st.cursor];
    if (row) {
      const it = itemData(row.id) || {};
      T.draw(ctx, row.label, px + 14, y0 + 14, { size: "m", color: C.brassLit, maxWidth: pw - 28 });
      T.draw(ctx, Theme.titleCase(it.kind || "item"), px + 14, y0 + 38, { size: "s", color: C.textDim });
      T.drawWrapped(ctx, it.desc || "No note written.", px + 14, y0 + 60, pw - 28, { size: "s", color: C.text });
      const py = y0 + (bot - y0) - 74;
      T.draw(ctx, (sc.tab === 0 ? "Price " : "They pay ") + U.fmtNum(row.price) + symbolFor(sc.tab === 0 ? sc.currency : "credits"), px + 14, py, { size: "m", color: C.brassLit });
      if (sc.tab === 0) {
        const afford = Math.floor(have / row.price);
        T.draw(ctx, "You can afford " + afford + (row.stockLeft > 0 ? "   |   " + row.stockLeft + " left" : ""), px + 14, py + 24, { size: "s", color: afford ? C.textDim : C.bad });
      } else {
        T.draw(ctx, "You have " + row.have, px + 14, py + 24, { size: "s", color: C.textDim });
      }
      if (discount() < 1) T.draw(ctx, "Trader perk applied", px + 14, py + 46, { size: "s", color: C.good });
    } else {
      T.drawWrapped(ctx, sc.greeting, px + 14, y0 + 16, pw - 28, { size: "s", color: C.textDim });
    }
    Theme.footer(ctx, HINTS);
  };

  sc.open = function (opts) { return MQ.Scenes.pushP(sc, opts || {}); };
  sc.VARIANTS = VARIANTS;
  UI.Shop = sc;
})();
