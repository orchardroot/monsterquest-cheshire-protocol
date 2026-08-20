"use strict";
// ui-b: the dex grid, its filters, the entry pages and the milestones.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true;
  return env;
}
function press(env, action, n) {
  for (let i = 0; i < (n || 1); i++) { env.MQ.Input.inject(action); env.step(1); }
}

module.exports = function (t, assert) {

  t("the grid lists the whole dex and counts seen/caught honestly", function () {
    const env = boot();
    const MQ = env.MQ, Dex = MQ.UI.Dex;
    Dex.filter.status = "all"; Dex.filter.type = null; Dex.filter.habitat = null; Dex.filter.region = null; Dex.filter.sort = "num";
    const all = Dex.listIds();
    assert.strictEqual(all.length, MQ.Data.dexOrder.length, "every dex species is listed");
    Dex.filter.status = "caught";
    assert.strictEqual(Dex.listIds().length, 0, "nothing is caught on a fresh save");
    MQ.Trainer.record("silkin", { map: "macclesfield", level: 5 });
    MQ.Trainer.see("flitchick", { map: "macclesfield", habitat: "town" });
    assert.strictEqual(Dex.listIds().join(","), "silkin", "caught filter finds the one we caught");
    Dex.filter.status = "seen";
    assert.strictEqual(Dex.listIds().length, 2, "seen counts the caught one too");
    Dex.filter.status = "missing";
    assert.strictEqual(Dex.listIds().indexOf("silkin"), -1, "missing hides what we hold");
    Dex.filter.status = "all";
  });

  t("filters by type, habitat and region each narrow the list", function () {
    const env = boot();
    const MQ = env.MQ, Dex = MQ.UI.Dex;
    Dex.filter.status = "all"; Dex.filter.sort = "num";
    Dex.filter.type = null; Dex.filter.habitat = null; Dex.filter.region = null;
    const all = Dex.listIds().length;
    Dex.filter.type = "cyber";
    const cyber = Dex.listIds();
    assert.ok(cyber.length > 0 && cyber.length < all, "cyber is a real subset");
    for (let i = 0; i < cyber.length; i++) assert.ok(MQ.Data.species[cyber[i]].types.indexOf("cyber") >= 0);
    Dex.filter.type = null; Dex.filter.habitat = "salt";
    const salt = Dex.listIds();
    assert.ok(salt.length > 0 && salt.length < all);
    Dex.filter.habitat = null; Dex.filter.region = "east";
    const east = Dex.listIds();
    assert.ok(east.length > 0 && east.length < all, "the east region has its own residents");
    for (let i = 0; i < east.length; i++) assert.ok(Dex.regionsOf(east[i]).east, east[i] + " really lives in the east");
    Dex.filter.region = null;
    Dex.filter.sort = "name";
    const byName = Dex.listIds();
    assert.ok(MQ.Data.species[byName[0]].name <= MQ.Data.species[byName[1]].name, "name order sorts");
    Dex.filter.sort = "num";
  });

  t("where-to-find is built from the real maps and encounter tables", function () {
    const env = boot();
    const MQ = env.MQ, Dex = MQ.UI.Dex;
    const table = MQ.Data.encounters["macclesfield_grass"];
    const first = table.table[0].species;
    const rows = Dex.whereToFind(first);
    assert.ok(rows && rows.length, "the species knows where it lives");
    let found = false;
    for (let i = 0; i < rows.length; i++) if (rows[i].map === "macclesfield" && rows[i].zone === "grass") found = true;
    assert.ok(found, "Macclesfield grass is listed for " + first);
    assert.ok(rows[0].share > 0 && rows[0].share <= 1, "the share is a probability");
    assert.strictEqual(Dex.whereToFind("no_such_species"), null, "unknown species get nothing rather than a crash");
  });

  t("the grid opens an entry, and the entry pages all draw", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Trainer.record("silkin", { map: "macclesfield", level: 5 });
    MQ.Scenes.push(MQ.UI.Dex, {}); MQ.Scenes.flush(); env.step(1); env.render();
    press(env, "a");
    MQ.Scenes.flush();
    assert.strictEqual(MQ.Scenes.top().id, "dex_entry", "A opens the entry page");
    for (let p = 0; p < 5; p++) { MQ.UI.DexEntry.page = p; env.step(1); env.render(); }
    press(env, "right"); assert.strictEqual(MQ.UI.DexEntry.page, 0, "pages wrap round");
    press(env, "select");
    assert.strictEqual(MQ.UI.DexEntry.index, 1, "SELECT walks to the next entry");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("an unseen entry keeps its secrets", function () {
    const env = boot();
    const MQ = env.MQ;
    const id = MQ.Data.dexOrder[40];
    MQ.Scenes.push(MQ.UI.DexEntry, { list: [id], index: 0 }); MQ.Scenes.flush();
    env.step(1); env.render();
    const drawn = env.screen.getContext("2d").calls.length;
    assert.ok(drawn > 0, "something is drawn");
    MQ.Trainer.record(id, { map: "bollington", level: 9 });
    env.step(1); env.render();
    assert.ok(env.screen.getContext("2d").calls.length > drawn, "a caught entry draws more than a blank one");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the entry plays a cry for anything we have met", function () {
    const env = boot();
    const MQ = env.MQ;
    const cries = [];
    const real = MQ.Audio.cry;
    MQ.Audio.cry = function (id) { cries.push(id); };
    MQ.Trainer.see("silkin", { map: "macclesfield" });
    MQ.Scenes.push(MQ.UI.DexEntry, { list: ["silkin"], index: 0 }); MQ.Scenes.flush(); env.step(1);
    assert.deepStrictEqual(cries, ["silkin"], "entering cries once");
    press(env, "a");
    assert.strictEqual(cries.length, 2, "A cries again");
    MQ.Audio.cry = real;
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the filter screen changes the filter and hands it back", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.DexFilter, { filter: { status: "all", type: null, habitat: null, region: null, sort: "num" } });
    MQ.Scenes.flush(); env.step(1); env.render();
    press(env, "right");                       // status: all -> seen
    assert.strictEqual(MQ.UI.DexFilter.work.status, "seen");
    press(env, "down"); press(env, "right");   // type: any -> first type
    assert.ok(MQ.UI.DexFilter.work.type, "a type is chosen");
    press(env, "select");
    assert.strictEqual(MQ.UI.DexFilter.work.status, "all", "SELECT clears back to everything");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("milestones track the real dex counters", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.DexMilestones, {}); MQ.Scenes.flush();
    env.step(1); env.render();
    for (let i = 0; i < 3; i++) { MQ.UI.DexMilestones.tab = i; env.step(1); env.render(); }
    assert.ok(MQ.Trainer.dexMilestones.length >= 7, "the seven SIDE-CONTENT milestones are there to draw");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("MQ.UI.Dex.entry jumps straight to one species", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.UI.Dex.entry("loomoth");
    MQ.Scenes.flush(); env.step(1);
    assert.strictEqual(MQ.Scenes.top().id, "dex_entry");
    assert.strictEqual(MQ.UI.DexEntry.species(), "loomoth");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });
};
