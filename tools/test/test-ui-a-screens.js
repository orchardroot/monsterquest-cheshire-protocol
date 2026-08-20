"use strict";
// ui-a: pause hub, party, bag, settings, shop and save screens.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true;
  MQ.Dialog.autoChoice = 99;        // "Back" is always last
  stubContent(MQ);
  return env;
}
function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}
function settle(env, n) {
  let p = Promise.resolve();
  for (let i = 0; i < (n || 4); i++) p = p.then(function () { return env.tick(1); });
  return p;
}
function mon(species, level, opts) {
  const m = {
    uid: species + level, species: species, nickname: "", level: level, exp: 120,
    hp: 20, stats: { hp: 40, atk: 22, def: 18, spa: 25, spd: 20, spe: 30 },
    ivs: { hp: 12, atk: 8, def: 4, spa: 15, spd: 9, spe: 11 }, temperament: "wry",
    ability: "silk_step", gear: null, friendship: 120, status: null,
    moves: [{ id: "thread_cut", pp: 20, ppMax: 20 }], overdrive: 0,
    metAt: { map: "macclesfield", level: 5, ts: 1700000000000 }, shiny: false, ribbons: []
  };
  return Object.assign(m, opts || {});
}
// A minimal stand-in for the content/data teams so the UI has something to draw.
function stubContent(MQ) {
  MQ.Data.define("moves", "thread_cut", { name: "Thread Cut", type: "bug", cat: "phys", power: 40, acc: 100, pp: 20, desc: "A short, mean snip." });
  MQ.Data.define("moves", "live_rail", { name: "Live Rail", type: "electric", cat: "spec", power: 80, acc: 95, pp: 10, desc: "Third rail etiquette." });
  MQ.Data.define("abilities", "silk_step", { name: "Silk Step", desc: "Never quite where it was." });
  MQ.Data.define("species", "silkin", { name: "SILKIN", types: ["bug", "grass"], base: { hp: 40, atk: 30, def: 30, spa: 40, spd: 35, spe: 35 }, habitat: "silk", rarity: "unique", dex: { genus: "Silkworm", height: "0.3 m", weight: "2 kg", text: "Spins a thread it never lets go of." }, evolutions: [{ to: "spindrake", method: "level", level: 16 }] });
  MQ.Data.define("species", "meadow", { name: "MEADOW", types: ["normal"], base: { hp: 45, atk: 40, def: 30, spa: 30, spd: 35, spe: 80 }, habitat: "town", rarity: "unique", dex: { genus: "House Cat", height: "0.2 m", weight: "3 kg", text: "Small, black, absurdly fast." } });
  MQ.Data.define("items", "salve", { name: "Salve", kind: "heal", price: 200, amount: 20, desc: "Twenty points of relief.", usableInField: true });
  MQ.Data.define("items", "antidote", { name: "Antidote", kind: "cure", price: 100, cures: ["psn"], desc: "For the green ones." });
  MQ.Data.define("items", "capsule_basic", { name: "Capsule", kind: "capsule", price: 200, desc: "Standard issue." });
  MQ.Data.define("items", "silk_scarf", { name: "Silk Scarf", kind: "gear", price: 1000, desc: "Same-type moves hit harder." });
  MQ.Data.define("items", "tm_live_rail", { name: "Skill Card: Live Rail", kind: "tm", price: 2000, teaches: "live_rail", desc: "Teaches Live Rail. Once." });
  MQ.Data.define("items", "casebook", { name: "Casebook", kind: "key", price: 0, desc: "Thirty open questions." });

  const bag = { salve: 5, antidote: 2, capsule_basic: 9, silk_scarf: 1, tm_live_rail: 1, casebook: 1 };
  MQ.Inventory = {
    money: 5000,
    items: bag,
    count: function (id) { return bag[id] || 0; },
    add: function (id, n) { bag[id] = (bag[id] || 0) + (n === undefined ? 1 : n); },
    remove: function (id, n) { bag[id] = Math.max(0, (bag[id] || 0) - (n === undefined ? 1 : n)); if (!bag[id]) delete bag[id]; },
    spend: function (n) { MQ.Inventory.money -= n; }
  };
  MQ.Party = { list: [mon("silkin", 12), mon("meadow", 9, { status: "par", hp: 8 })] };
  MQ.Trainer = { name: "Jim", level: 14, badges: new Set(["badge_packet"]), perks: new Set() };
}

module.exports = function (t, assert) {

  t("every screen publishes on MQ.UI as a scene with an opener", function () {
    const env = boot();
    const UI = env.MQ.UI;
    const names = ["Theme", "Title", "Pause", "Party", "PartySummary", "Bag", "Quantity", "MoveReplace", "Settings", "Shop", "Save", "NameEntry", "Credits", "Difficulty"];
    for (let i = 0; i < names.length; i++) assert.ok(UI[names[i]], "MQ.UI." + names[i] + " exists");
    const scenes = ["Pause", "Party", "Bag", "Settings", "Shop", "Save"];
    for (let i = 0; i < scenes.length; i++) {
      assert.strictEqual(typeof UI[scenes[i]].open, "function", names[i] + ".open");
      assert.strictEqual(typeof UI[scenes[i]].draw, "function");
      assert.strictEqual(typeof UI[scenes[i]].update, "function");
    }
  });

  t("every screen pushes, updates, draws and pops without throwing", function () {
    const env = boot();
    const MQ = env.MQ;
    const cases = [
      [MQ.UI.Pause, undefined],
      [MQ.UI.Party, { mode: "menu" }],
      [MQ.UI.PartySummary, { mons: MQ.Party.list, index: 0 }],
      [MQ.UI.Bag, { mode: "field" }],
      [MQ.UI.Settings, {}],
      [MQ.UI.Shop, { variant: "chemist", stock: [{ id: "salve" }, { id: "antidote" }] }],
      [MQ.UI.Save, { mode: "save" }],
      [MQ.UI.Quantity, { max: 10, price: 200 }],
      [MQ.UI.MoveReplace, { mon: MQ.Party.list[0], moveId: "live_rail" }]
    ];
    for (let i = 0; i < cases.length; i++) {
      MQ.Scenes.push(cases[i][0], cases[i][1]); MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.top(), cases[i][0], cases[i][0].id + " on top");
      env.step(2);
      env.render();
      MQ.Scenes.pop(null); MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.depth(), 0, cases[i][0].id + " popped clean");
    }
  });

  t("pause hub lists all nine tabs and reports the ones nobody has built", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Pause); MQ.Scenes.flush();
    env.step(1);
    const ids = [];
    for (let i = 0; i < MQ.UI.Pause.TABS.length; i++) ids.push(MQ.UI.Pause.TABS[i].id);
    assert.strictEqual(ids.join(","), "party,bag,dex,casebook,map,trainer,perks,settings,save");
    const items = MQ.UI.Pause.items;
    assert.strictEqual(items[0].disabled, false, "party is ours, so it works");
    // ui-b has since landed js/ui/dex.js, so the Dex tab is fitted rather than greyed.
    assert.strictEqual(items[2].disabled, !MQ.UI.Dex, "the Dex tab is greyed only while nobody has built it");
    env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("pause navigation reaches Bag and opens it", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Pause); MQ.Scenes.flush();
    env.step(1);
    press(env, "down");                   // party -> bag
    assert.strictEqual(MQ.UI.Pause.items[MQ.UI.Pause.st.cursor].value, "bag");
    press(env, "a");
    MQ.Scenes.flush();
    assert.strictEqual(MQ.Scenes.top().id, "bag");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("pause shows the CUTOVER counter and SIGNAL pip only once the flags are set", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Pause); MQ.Scenes.flush();
    env.step(1); env.render();
    const quiet = env.screen.getContext("2d").calls.length;
    MQ.Flags.set("cutover_started", true);
    MQ.Flags.set("cutover_days", 12);
    MQ.Flags.set("signal_meter", true);
    env.step(1); env.render();
    assert.ok(env.screen.getContext("2d").calls.length > quiet, "more is drawn once the story turns them on");
    MQ.Flags.set("cutover_days", "stopped");
    env.step(1); env.render();
    MQ.Flags.set("cutover_days", "t0");
    env.step(1); env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("quick slots register an item from the bag and count it", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Pause); MQ.Scenes.flush();
    env.step(1);
    MQ.UI.Pause.quick[0] = null;
    MQ.UI.Pause.focus = 1; MQ.UI.Pause.slot = 0;
    MQ.UI.Bag.pocket = 1;
    press(env, "a");                       // empty slot -> bag in pick mode
    return settle(env, 2).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "bag");
      assert.strictEqual(MQ.UI.Bag.mode, "pick");
      press(env, "a");                     // choose the first row
      return settle(env, 3);
    }).then(function () {
      assert.ok(MQ.UI.Pause.quick[0], "something got registered: " + MQ.UI.Pause.quick[0]);
      env.render();
      MQ.Scenes.clear(); MQ.Scenes.flush();
    });
  });

  t("party list shows the party, and select mode resolves with an index", function () {
    const env = boot();
    const MQ = env.MQ;
    const p = MQ.UI.Party.open({ mode: "select", title: "Who?" });
    MQ.Scenes.flush();
    env.step(1);
    assert.strictEqual(MQ.UI.Party.mons.length, 2);
    env.render();
    press(env, "down");
    assert.strictEqual(MQ.UI.Party.st.cursor, 1);
    press(env, "a");
    MQ.Scenes.flush();
    return p.then(function (idx) { assert.strictEqual(idx, 1); });
  });

  t("summary pages step through stats, moves, dex and ribbons", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.PartySummary, { mons: MQ.Party.list, index: 0 }); MQ.Scenes.flush();
    const seen = [];
    for (let i = 0; i < 5; i++) { env.step(1); env.render(); seen.push(MQ.UI.PartySummary.page); press(env, "right"); }
    assert.strictEqual(seen.join(","), "0,1,2,3,0", "four pages, wrapping");
    press(env, "select");
    assert.strictEqual(MQ.UI.PartySummary.idx, 1, "select walks to the next monster");
    env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("party reorder moves a monster and keeps the list intact", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Party, { mode: "menu" }); MQ.Scenes.flush();
    env.step(1);
    MQ.UI.Party.reorder = 0;               // pick up the leader
    press(env, "down");
    press(env, "a");                       // drop into slot 2
    assert.strictEqual(MQ.Party.list.length, 2);
    assert.strictEqual(MQ.Party.list[0].species, "meadow", "meadow is now in front");
    assert.strictEqual(MQ.UI.Party.reorder, -1);
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("bag sorts items into pockets and moves between them", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Bag, { mode: "field" }); MQ.Scenes.flush();
    env.step(1);
    const ids = MQ.UI.Bag.POCKETS.map(function (p) { return p.id; }).join(",");
    assert.strictEqual(ids, "items,medicine,capsules,gear,cards,brewing,keys");
    MQ.UI.Bag.pocket = 1; MQ.UI.Bag.rebuild();
    const meds = MQ.UI.Bag.rows.map(function (r) { return r.id; }).sort().join(",");
    assert.strictEqual(meds, "antidote,salve", "medicine pocket holds the heals and cures");
    env.render();
    press(env, "right");
    assert.strictEqual(MQ.UI.Bag.pocket, 2, "right steps to the next pocket");
    assert.strictEqual(MQ.UI.Bag.rows[0].id, "capsule_basic");
    MQ.UI.Bag.pocket = 6; MQ.UI.Bag.rebuild();
    assert.strictEqual(MQ.UI.Bag.rows[0].id, "casebook", "key items get their own pocket");
    env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("Skill Card teaching adds a move when there is room", function () {
    const env = boot();
    const MQ = env.MQ;
    const target = MQ.Party.list[0];
    assert.strictEqual(target.moves.length, 1);
    MQ.Scenes.push(MQ.UI.Bag, { mode: "field", pocket: 4 }); MQ.Scenes.flush();
    env.step(1);
    assert.strictEqual(MQ.UI.Bag.rows[0].id, "tm_live_rail");
    MQ.Dialog.autoChoice = 0;              // "Teach it"
    press(env, "a");
    return settle(env, 4).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "party", "asks who should learn it");
      press(env, "a");                     // the first monster
      return settle(env, 4);
    }).then(function () {
      assert.strictEqual(target.moves.length, 2, "learned it");
      assert.strictEqual(target.moves[1].id, "live_rail");
      assert.strictEqual(MQ.Inventory.count("tm_live_rail"), 0, "the card is used up");
      MQ.Dialog.autoChoice = 99;
      MQ.Scenes.clear(); MQ.Scenes.flush();
    });
  });

  t("a full moveset routes through the replace screen", function () {
    const env = boot();
    const MQ = env.MQ;
    const target = MQ.Party.list[0];
    target.moves = [
      { id: "thread_cut", pp: 20, ppMax: 20 }, { id: "thread_cut", pp: 20, ppMax: 20 },
      { id: "thread_cut", pp: 20, ppMax: 20 }, { id: "thread_cut", pp: 20, ppMax: 20 }
    ];
    MQ.Scenes.push(MQ.UI.MoveReplace, { mon: target, moveId: "live_rail" }); MQ.Scenes.flush();
    env.step(1); env.render();
    assert.strictEqual(MQ.UI.MoveReplace.st.items.length, 5, "four moves plus 'don't learn'");
    press(env, "a");
    MQ.Scenes.flush();
    assert.strictEqual(MQ.Scenes.depth(), 0);
  });

  t("settings hold every field, change on left/right and persist", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Settings, {}); MQ.Scenes.flush();
    env.step(1); env.render();
    const ids = MQ.UI.Settings.OPTIONS.map(function (o) { return o.id; });
    const wanted = ["textSpeed", "music", "sfx", "difficulty", "battleAnim", "runMode", "touchSize", "touchSide", "stickOpacity", "screenShake"];
    for (let i = 0; i < wanted.length; i++) assert.ok(ids.indexOf(wanted[i]) >= 0, wanted[i] + " is offered");
    assert.strictEqual(MQ.UI.Settings.get("textSpeed"), "normal");
    press(env, "right");
    assert.strictEqual(MQ.UI.Settings.get("textSpeed"), "fast");
    assert.ok(MQ.Dialog.speed > 1, "the live preview and the real dialogue box agree");
    const raw = env.window.localStorage.getItem("mq2_settings");
    assert.ok(raw && JSON.parse(raw).textSpeed === "fast", "written to mq2_settings");
    press(env, "down"); press(env, "right");
    assert.strictEqual(MQ.UI.Settings.get("music"), 8);
    env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("settings reach touch layout size, side and stick opacity with a live preview", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Settings, {}); MQ.Scenes.flush();
    env.step(1);
    const ids = MQ.UI.Settings.OPTIONS.map(function (o) { return o.id; });
    MQ.UI.Settings.st.setCursor(ids.indexOf("touchSide"));
    env.step(1); env.render();
    assert.strictEqual(MQ.UI.Settings.get("touchSide"), "left");
    press(env, "right");
    assert.strictEqual(MQ.UI.Settings.get("touchSide"), "right");
    MQ.UI.Settings.st.setCursor(ids.indexOf("stickOpacity"));
    env.step(1); env.render();
    press(env, "left");
    assert.strictEqual(MQ.UI.Settings.get("stickOpacity"), 5);
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("shop marks its variant, buys with a quantity and takes the money", function () {
    const env = boot();
    const MQ = env.MQ;
    const before = MQ.Inventory.money;
    MQ.Dialog.autoChoice = 0;                 // say yes to the confirmations
    const p = MQ.UI.Shop.open({ name: "Bollington Chemist", variant: "chemist", stock: [{ id: "salve" }, { id: "antidote", stock: 3 }] });
    MQ.Scenes.flush();
    env.step(1); env.render();
    assert.strictEqual(MQ.Flags.get("shop_seen_chemist"), true, "the variant is recorded");
    assert.strictEqual(MQ.UI.Shop.rows.length, 2);
    assert.strictEqual(MQ.UI.Shop.rows[0].price, 200);
    press(env, "a");
    return settle(env, 3).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "quantity");
      press(env, "up"); press(env, "up");   // three salves
      assert.strictEqual(MQ.UI.Quantity.n, 3);
      env.render();
      press(env, "a");
      return settle(env, 4);
    }).then(function () {
      assert.strictEqual(MQ.Inventory.count("salve"), 8, "five plus three");
      assert.strictEqual(MQ.Inventory.money, before - 600);
      press(env, "b");                       // leave
      MQ.Scenes.flush();
      return p;
    });
  });

  t("shop sells from the bag at half price", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Shop, { variant: "mart", stock: [{ id: "salve" }] }); MQ.Scenes.flush();
    env.step(1);
    MQ.UI.Shop.setTab(1);
    const row = MQ.UI.Shop.rows[0];
    assert.ok(row, "something to sell");
    assert.strictEqual(row.price, Math.floor((MQ.Data.items[row.id].price || 0) / 2));
    env.render();
    MQ.Scenes.pop(null); MQ.Scenes.flush();
  });

  t("save screen writes a slot and asks before overwriting", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Dialog.autoChoice = 0;                 // say yes to the overwrite
    MQ.Save.register("test", { save: function () { return { ok: 1 }; }, load: function () {} });
    const p = MQ.UI.Save.open({ mode: "save" });
    MQ.Scenes.flush();
    env.step(1); env.render();
    assert.strictEqual(MQ.UI.Save.entries.length, 4);
    assert.strictEqual(MQ.UI.Save.entries[3].slot, "auto");
    assert.strictEqual(MQ.UI.Save.entries[3].disabled, true, "autosave is not hand-written");
    press(env, "a");
    return settle(env, 4).then(function () {
      assert.ok(env.window.localStorage.getItem("mq2_slot_1"), "slot 1 written");
      return p;
    }).then(function () {
      // second pass: the slot is occupied, so it must confirm
      const p2 = MQ.UI.Save.open({ mode: "save" });
      MQ.Scenes.flush();
      env.step(1);
      assert.strictEqual(MQ.UI.Save.entries[0].empty, false);
      press(env, "a");
      return settle(env, 6).then(function () { return p2; });
    }).then(function () {
      const env2 = MQ.Save.read(1);
      assert.strictEqual(env2.version, 2);
      assert.strictEqual(env2.data.test.ok, 1);
    });
  });

  t("every screen survives a resize to a different logical size", function () {
    const env = boot();
    const MQ = env.MQ;
    const scenes = [MQ.UI.Pause, MQ.UI.Party, MQ.UI.Bag, MQ.UI.Settings, MQ.UI.Save, MQ.UI.Title];
    env.window.innerWidth = 800; env.window.innerHeight = 1280;   // portrait tablet
    MQ.View.resize();
    for (let i = 0; i < scenes.length; i++) {
      MQ.Scenes.push(scenes[i], scenes[i] === MQ.UI.Save ? { mode: "load" } : undefined); MQ.Scenes.flush();
      env.step(1); env.render();
      MQ.Scenes.pop(null); MQ.Scenes.flush();
    }
    assert.ok(MQ.View.w >= 960 || MQ.View.h >= 540);
    assert.strictEqual(MQ.Scenes.depth(), 0);
  });
};
