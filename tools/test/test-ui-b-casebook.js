"use strict";
// ui-b: the clue board, the case list, the bounty board and the awards shelf.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true; MQ.Dialog.autoChoice = 0;
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

module.exports = function (t, assert) {

  t("the board carries a chapter for every chapter the design index names", function () {
    const MQ = boot().MQ;
    const chs = MQ.UI.Casebook.CHAPTERS;
    assert.strictEqual(chs.length, 13, "twelve chapters and the post-game");
    for (let i = 0; i < chs.length; i++) {
      assert.strictEqual(chs[i].n, i + 1, "chapters are in order");
      assert.ok(chs[i].pins.length >= 5, "chapter " + chs[i].n + " has pins");
      for (let j = 0; j < chs[i].pins.length; j++) {
        assert.ok(/^[a-z0-9_]+$/.test(chs[i].pins[j].f), "flag id " + chs[i].pins[j].f + " is snake_case");
        assert.ok(chs[i].pins[j].t && chs[i].pins[j].x, "the pin has a title and a note");
      }
    }
  });

  t("pins light up as the story sets their flags, and clues join them", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "board", chapter: 1 }); MQ.Scenes.flush();
    env.step(1); env.render();
    const quiet = env.screen.getContext("2d").calls.length;
    MQ.Flags.set("contract_signed", true);
    MQ.Flags.set("cats_joined", true);
    MQ.Quests.pinClue({ id: "clue_towpath", chapter: 1, title: "Towpath", text: "Somebody was waiting at the bridge." });
    env.step(1); env.render();
    assert.ok(env.screen.getContext("2d").calls.length > quiet, "a board with pins on it draws more");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("left and right walk the chapters, never past the one you are in", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Flags.set("chapter", 3);
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "board" }); MQ.Scenes.flush(); env.step(1);
    assert.strictEqual(MQ.UI.Casebook.chapter, 3, "it opens on the chapter you are living in");
    press(env, "right");
    assert.strictEqual(MQ.UI.Casebook.chapter, 1, "past the last unlocked chapter it wraps to one");
    press(env, "left");
    assert.strictEqual(MQ.UI.Casebook.chapter, 3, "and back round the other way");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the case list is grouped by town and filtered by state", function () {
    const env = boot();
    const MQ = env.MQ;
    const ids = Object.keys(MQ.Data.quests);
    let caseId = null;
    for (let i = 0; i < ids.length; i++) if (MQ.Data.quests[ids[i]].kind === "case") caseId = ids[i];
    assert.ok(caseId, "the data team shipped at least one case");
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "cases" }); MQ.Scenes.flush(); env.step(1); env.render();
    const cb = MQ.UI.Casebook;
    const rows = cb.caseSt.items;
    let headers = 0, cases = 0;
    for (let i = 0; i < rows.length; i++) { if (rows[i].header) headers++; else cases++; }
    assert.ok(headers > 0 && cases > 0, "towns and their cases");
    cb.caseFilter = 3; cb.rebuild();
    assert.strictEqual(cb.caseSt.items.length, 0, "nothing is closed yet");
    cb.caseFilter = 1; cb.rebuild();
    assert.ok(cb.caseSt.items.length > 0, "everything is still open");
    cb.caseFilter = 0; cb.rebuild();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("A on a case in hand toggles tracking", function () {
    const env = boot();
    const MQ = env.MQ;
    const ids = Object.keys(MQ.Data.quests);
    let caseId = null;
    for (let i = 0; i < ids.length; i++) if (MQ.Data.quests[ids[i]].kind === "case") caseId = ids[i];
    MQ.Quests.start(caseId, { force: true });
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "cases" }); MQ.Scenes.flush(); env.step(1);
    const cb = MQ.UI.Casebook;
    // walk to the started case
    let guard = 0;
    while (guard++ < 40) {
      const it = cb.caseSt.items[cb.caseSt.cursor];
      if (it && !it.header && it.data.id === caseId) break;
      press(env, "down");
    }
    const it = cb.caseSt.items[cb.caseSt.cursor];
    assert.ok(it && !it.header && it.data.id === caseId, "found the open case");
    MQ.Quests.untrack();
    press(env, "a");
    assert.strictEqual(MQ.Quests.trackedId, caseId, "A tracks it");
    press(env, "a");
    assert.strictEqual(MQ.Quests.trackedId === caseId, false, "A again stops tracking");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the bounty board lists the day's three and accepts one", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "bounties" }); MQ.Scenes.flush(); env.step(1); env.render();
    const cb = MQ.UI.Casebook;
    const board = cb.bountySt.items;
    assert.strictEqual(board.length, 3, "three a day");
    assert.strictEqual(board[0].pin, "Open");
    press(env, "a");
    assert.strictEqual(MQ.Quests.isActive(board[0].id), true, "A accepts the warrant");
    cb.rebuild();
    assert.strictEqual(cb.bountySt.items[0].pin, "In Hand", "and the board says so");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("the awards tab shows all forty with their progress", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Casebook, { tab: "awards" }); MQ.Scenes.flush(); env.step(1); env.render();
    const list = MQ.UI.Casebook.awardSt.items;
    assert.strictEqual(list.length, MQ.Achievements.list().length);
    assert.ok(list.length >= 40, "forty achievements, in the game's voice");
    for (let i = 0; i < list.length; i++) {
      assert.ok(list[i].need >= 1, list[i].id + " has a target");
      assert.ok(list[i].pct >= 0 && list[i].pct <= 1, list[i].id + " has a sane progress fraction");
    }
    MQ.Achievements.unlock(list[0].id);
    MQ.UI.Casebook.rebuild();
    assert.strictEqual(MQ.UI.Casebook.awardSt.items[0].unlocked, true, "an unlocked award reads as earned");
    env.render();
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });

  t("SELECT cycles the four tabs and each one draws", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Casebook, {}); MQ.Scenes.flush(); env.step(1);
    for (let i = 0; i < 4; i++) {
      env.render();
      press(env, "select");
    }
    assert.strictEqual(MQ.UI.Casebook.tab, 0, "four tabs, back to the board");
    MQ.Scenes.clear(); MQ.Scenes.flush();
  });
};
