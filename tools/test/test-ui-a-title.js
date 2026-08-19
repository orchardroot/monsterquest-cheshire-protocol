"use strict";
// ui-a: MQ.UI.Title — slots, menu navigation, name entry, difficulty, credits.
const H = require("../headless");

function boot() {
  const env = H.load();
  const MQ = env.MQ;
  MQ.View.init(); MQ.Input.init();
  MQ.Dialog.auto = true;
  MQ.Dialog.autoChoice = 0;
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
function writeSlot(env, slot, obj) {
  env.window.localStorage.setItem("mq2_slot_" + slot, typeof obj === "string" ? obj : JSON.stringify(obj));
}
const GOOD = {
  version: 2, ts: 1700000000000, playtime: 3900000,
  summary: { name: "JIM", badges: 3, chapter: 5, party: ["silkin", "meadow"], map: "macclesfield", level: 12 },
  data: { flags: {} }
};

module.exports = function (t, assert) {

  t("Boot pushes MQ.UI.Title as a scene; it enters and draws", function () {
    const env = boot();
    const MQ = env.MQ;
    assert.ok(MQ.UI.Title, "MQ.UI.Title exists");
    assert.strictEqual(MQ.UI.Title.id, "title");
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    assert.strictEqual(MQ.Scenes.top(), MQ.UI.Title);
    env.step(3);
    env.render();
    assert.strictEqual(MQ.Scenes.depth(), 1, "nothing blew up and nothing was pushed");
  });

  t("with no saves Continue is disabled and the cursor starts on New Game", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    assert.strictEqual(MQ.UI.Title.hasSave, false);
    assert.strictEqual(MQ.UI.Title.items[0].value, "continue");
    assert.strictEqual(MQ.UI.Title.items[0].disabled, true);
    assert.strictEqual(MQ.UI.Title.st.cursor, 1, "starts on New Game");
  });

  t("a legacy or corrupt slot never counts as loadable", function () {
    const env = boot();
    const MQ = env.MQ;
    writeSlot(env, 1, { version: 1, ts: 1, summary: {}, data: {} });
    writeSlot(env, 2, "{not json at all");
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    const slots = MQ.Save.slots();
    assert.strictEqual(slots[0].legacy, true);
    assert.strictEqual(slots[1].corrupt, true);
    assert.strictEqual(MQ.UI.Title.hasSave, false, "Continue stays shut");
  });

  t("a version 2 slot enables Continue and shows its summary", function () {
    const env = boot();
    const MQ = env.MQ;
    writeSlot(env, 1, GOOD);
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    assert.strictEqual(MQ.UI.Title.hasSave, true);
    assert.strictEqual(MQ.UI.Title.items[0].disabled, false);
    assert.strictEqual(MQ.UI.Title.st.cursor, 0, "starts on Continue");
    env.render();
  });

  t("keys navigate the title menu to every item in order", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    const seen = [];
    for (let i = 0; i < 4; i++) {
      seen.push(MQ.UI.Title.items[MQ.UI.Title.st.cursor].value);
      press(env, "down");
    }
    assert.deepStrictEqual(seen, ["new", "settings", "credits", "continue"]);
  });

  t("A on New Game opens name entry; typing on a real keyboard works", function () {
    const env = boot();
    const MQ = env.MQ;
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    press(env, "a");                    // cursor is on New Game
    return settle(env, 2).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "name_entry");
      assert.strictEqual(MQ.UI.NameEntry.value, "Jim", "seeded with the default");
      // physical typing
      env.fire("keydown", { key: "Backspace", code: "Backspace", preventDefault: function () {} });
      env.fire("keydown", { key: "Backspace", code: "Backspace", preventDefault: function () {} });
      env.fire("keydown", { key: "Backspace", code: "Backspace", preventDefault: function () {} });
      env.fire("keydown", { key: "N", code: "KeyN", preventDefault: function () {} });
      env.fire("keydown", { key: "e", code: "KeyE", preventDefault: function () {} });
      env.fire("keydown", { key: "s", code: "KeyS", preventDefault: function () {} });
      env.fire("keydown", { key: "t", code: "KeyT", preventDefault: function () {} });
      env.fire("keydown", { key: "a", code: "KeyA", preventDefault: function () {} });
      assert.strictEqual(MQ.UI.NameEntry.value, "Nesta");
      env.render();
      env.step(4);
      env.fire("keydown", { key: "Enter", code: "Enter", preventDefault: function () {} });
      env.step(2);
      return settle(env, 3);
    }).then(function () {
      assert.notStrictEqual(MQ.Scenes.top().id, "name_entry", "name entry closed");
      assert.strictEqual(MQ.Scenes.top().id, "difficulty", "difficulty comes next");
      assert.strictEqual(MQ.UI.Difficulty.st.items.length, 4);
    });
  });

  t("the on-screen keyboard types and deletes for touch/pad players", function () {
    const env = boot();
    const MQ = env.MQ;
    return MQ.UI.NameEntry.open({ initial: "", max: 6 }).then(function () { /* resolved below */ }),
      (function () {
        MQ.Scenes.flush(); env.step(1);
        assert.strictEqual(MQ.Scenes.top().id, "name_entry");
        // cursor starts on 'A'
        press(env, "a");
        assert.strictEqual(MQ.UI.NameEntry.value, "A");
        press(env, "right");
        press(env, "a");
        assert.strictEqual(MQ.UI.NameEntry.value, "AB");
        // walk down to DEL on the command row and press it
        const keys = MQ.UI.NameEntry.keys;
        let delIdx = -1;
        for (let i = 0; i < keys.length; i++) if (keys[i].value === "del") delIdx = i;
        MQ.UI.NameEntry.st.setCursor(delIdx);
        press(env, "a");
        assert.strictEqual(MQ.UI.NameEntry.value, "A");
        // shift toggles the case of the letter keys
        let shiftIdx = -1;
        for (let i = 0; i < keys.length; i++) if (keys[i].value === "shift") shiftIdx = i;
        MQ.UI.NameEntry.st.setCursor(shiftIdx);
        press(env, "a");
        assert.strictEqual(MQ.UI.NameEntry.keys[0].label, "a", "lower case now");
        env.render();
        MQ.Scenes.pop(null); MQ.Scenes.flush();
      })();
  });

  t("Continue opens the load screen; a corrupt pick offers a new game instead", function () {
    const env = boot();
    const MQ = env.MQ;
    writeSlot(env, 1, GOOD);
    writeSlot(env, 3, "rubbish");
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    press(env, "a");                    // Continue
    return settle(env, 2).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "save_screen");
      assert.strictEqual(MQ.UI.Save.mode, "load");
      assert.strictEqual(MQ.UI.Save.entries.length, 4, "three slots plus autosave");
      env.render();
      // pick the corrupt slot 3
      MQ.UI.Save.st.setCursor(2);
      press(env, "a");
      return settle(env, 20);
    }).then(function () {
      // auto-dialog says its piece and then confirms "yes" -> name entry
      assert.strictEqual(MQ.Scenes.top().id, "name_entry", "corrupt save funnels into a new game");
    });
  });

  t("Continue loads a good slot and hands off", function () {
    const env = boot();
    const MQ = env.MQ;
    writeSlot(env, 1, GOOD);
    let handed = null;
    MQ.UI.Title.onStart = function (info) { handed = info; };
    MQ.Scenes.push(MQ.UI.Title); MQ.Scenes.flush();
    env.step(1);
    press(env, "a");
    return settle(env, 2).then(function () {
      assert.strictEqual(MQ.Scenes.top().id, "save_screen");
      MQ.UI.Save.st.setCursor(0);
      press(env, "a");
      return settle(env, 4);
    }).then(function () {
      env.step(60);                     // let the fade reach its midpoint
      return settle(env, 4);
    }).then(function () {
      assert.ok(handed, "the hand-off hook fired");
      assert.strictEqual(handed.newGame, false);
      assert.strictEqual(handed.slot, 1);
      MQ.UI.Title.onStart = null;
    });
  });

  t("credits scroll and close", function () {
    const env = boot();
    const MQ = env.MQ;
    return MQ.UI.Credits.open().then(function (r) {
      assert.strictEqual(r, null);
    }), (function () {
      MQ.Scenes.flush();
      env.step(10);
      env.render();
      assert.ok(MQ.UI.Credits.y > 0, "it is moving");
      press(env, "b");
      MQ.Scenes.flush();
      assert.strictEqual(MQ.Scenes.depth(), 0);
    })();
  });

  t("difficulty picker offers the four tiers from SYSTEMS-SPEC 13", function () {
    const env = boot();
    const MQ = env.MQ;
    const ids = [];
    for (let i = 0; i < MQ.UI.DIFFICULTIES.length; i++) ids.push(MQ.UI.DIFFICULTIES[i].id);
    assert.deepStrictEqual(ids, ["story", "normal", "hard", "nightmare"]);
    MQ.Scenes.push(MQ.UI.Difficulty, {}); MQ.Scenes.flush();
    env.step(1); env.render();
    press(env, "down"); press(env, "down");
    assert.strictEqual(MQ.UI.Difficulty.st.cursor, 3);
    press(env, "a");
    MQ.Scenes.flush();
    assert.strictEqual(MQ.Scenes.depth(), 0);
  });
};
