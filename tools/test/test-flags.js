"use strict";
const H = require("../headless");
module.exports = function (t, assert) {
  const env = H.load();
  const F = env.MQ.Flags;
  t("flags set/get/add/clear", function () {
    F.reset();
    F.set("badge_1"); assert.strictEqual(F.get("badge_1"), true);
    F.add("steps", 3); F.add("steps", 2); assert.strictEqual(F.get("steps"), 5);
    F.clear("badge_1"); assert.strictEqual(F.get("badge_1"), undefined);
    F.chapter = 3; assert.strictEqual(F.chapter, 3);
  });
  t("expression parser: boolean ops and precedence", function () {
    F.reset(); F.set("a"); F.set("b"); F.set("n", 4);
    assert.strictEqual(F.test("a && b"), true);
    assert.strictEqual(F.test("a && !b"), false);
    assert.strictEqual(F.test("!a || b"), true);
    assert.strictEqual(F.test("a && (c || b)"), true);
    assert.strictEqual(F.test("a && c || b"), true);
    assert.strictEqual(F.test("!(a && b)"), false);
    assert.strictEqual(F.test("missing"), false);
    assert.strictEqual(F.test("!missing"), true);
    assert.strictEqual(F.test(""), true);
    assert.strictEqual(F.test(undefined), true);
  });
  t("comparisons and numbers", function () {
    F.reset(); F.set("n", 4); F.set("s", "hi");
    assert.strictEqual(F.test("n >= 4"), true);
    assert.strictEqual(F.test("n > 4"), false);
    assert.strictEqual(F.test("n == 4"), true);
    assert.strictEqual(F.test("n != 4"), false);
    assert.strictEqual(F.test("n < 10 && n > 2"), true);
    assert.strictEqual(F.test("s == 'hi'"), true);
    assert.strictEqual(F.test("missing == 0"), true);
    assert.strictEqual(F.test("n + 1 == 5"), true);
    assert.strictEqual(F.test("n == -4"), false);
  });
  t("dotted resolvers: quest/item/badges/chapter/party/time/weather", function () {
    F.reset(); F.chapter = 2;
    assert.strictEqual(F.test("quest.brine_bandits >= 2"), false);      // -1 default
    F.set("quest_brine_bandits", 2);
    assert.strictEqual(F.test("quest.brine_bandits >= 2"), true);
    F.set("item_potion", 3);
    assert.strictEqual(F.test("item.potion > 2"), true);
    assert.strictEqual(F.test("badges >= 1"), false);
    F.set("badges", 3); assert.strictEqual(F.test("badges >= 3"), true);
    assert.strictEqual(F.test("chapter == 2"), true);
    assert.strictEqual(F.test("party.has(silkmoth)"), false);
    env.MQ.Party = { has: function (sp) { return sp === "silkmoth"; } };
    assert.strictEqual(F.test("party.has(silkmoth)"), true);
    assert.strictEqual(F.test("party.has('silkmoth')"), true);
    env.MQ.Clock.setPhase("night");
    assert.strictEqual(F.test("time.night"), true);
    assert.strictEqual(F.test("time.day"), false);
    env.MQ.Clock.setWeather("rain");
    assert.strictEqual(F.test("weather.rain && time.night"), true);
    assert.strictEqual(F.test("badge_3 && !met_vex_2 && quest.brine_bandits>=2"), false);
    F.set("badge_3"); assert.strictEqual(F.test("badge_3 && !met_vex_2 && quest.brine_bandits>=2"), true);
  });
  t("bad expressions return false without throwing", function () {
    assert.strictEqual(F.test("a &&"), false);
    assert.strictEqual(F.test("(a"), false);
    assert.strictEqual(F.test("a $ b"), false);
    assert.throws(function () { F.parse("a &&"); });
  });
  t("flag events fire", function () {
    let got = null;
    env.MQ.Events.on("flag", function (d) { got = d; });
    F.set("evt", 7);
    assert.strictEqual(got.id, "evt"); assert.strictEqual(got.value, 7);
  });
};
