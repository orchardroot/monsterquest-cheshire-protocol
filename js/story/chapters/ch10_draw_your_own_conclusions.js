// =============================================================
// MonsterQuest v2 — CHAPTER 10: "Draw Your Own Conclusions"
// Lymm and Warrington. Levels 40-45, Gym 8 (ADMIN).
// The false victory ends here: Mo's NOC is getting alerts from a system
// that is physically unplugged, constructs re-materialise out of cache,
// and something spells four words on her whiteboard using yours.
// Owned by region-northwest.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const S = MQ.Story || (MQ.Story = {});
  S.npcScripts = S.npcScripts || {};
  S.scripts = S.scripts || {};
  const N = S.npcScripts;
  function def(id, gen) { N[id] = gen; S.scripts[id] = gen; return gen; }
  function flag(id) { return MQ.Flags ? MQ.Flags.get(id) : undefined; }

  // ------------------------------------------------------- GYM 8 — Mo -----
  def("nw_gym8_mo", function* (ctx) {
    const C = ctx.S;
    if (flag("badge_admin")) {
      yield C.say([
        "It's kind. That's the problem. Nothing that kind is that big by accident.",
        "Go to Jodrell. The gate's open, which it has not been since Chapter Four, and the dish has turned."
      ], { name: "Mo" });
      return;
    }
    if (!flag("mo_alerts")) {
      yield C.setFlag("mo_alerts", true);
      yield C.say([
        "Mo. Sev-one in progress, don't take your coat off.",
        "My mum's fridge is in a botnet again, which is a Tuesday. That's not the sev-one."
      ], { name: "Mo" });
      yield C.say([
        "The sev-one is that I am receiving alerts from a system that is physically unplugged.",
        "Not cached. Not replayed. NEW. Correct timestamps, correct format, correlating with things that happened this morning.",
        "You pulled the breaker at Daresbury on Thursday. I watched the county go quiet on my own dashboards and I cried a bit in the car park."
      ], { name: "Mo" });
      yield C.say([
        "It came back on Saturday. Constructs re-materialising out of cache with their state intact. That is not how cache works.",
        "And then there's the board."
      ], { name: "Mo" });
      yield C.say([
        "She turns the whiteboard round.",
        "Somebody has been wiping it and rewriting it, letter by letter, over three days, using words from your own field notes.",
        "It says: THE GRIN REMAINED."
      ]);
      yield C.setFlag("grin_remained", true);
      yield C.setFlag("cutover_restarted", true);
      yield C.setFlag("cutover_days", "t3");
      yield C.notify("CUTOVER: T-3.");
      if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_10_draw_your_own_conclusions");
      yield C.say([
        "I was at ClickFix for eleven months. I walked when they started on pensioners.",
        "So when I built this gym I built it on ORACLE's public API. To benchmark it. To prove it was rubbish.",
        "Do you know what it did? It helped. Every time. Politely. For free. It corrected my own scoring rubric and it was right."
      ], { name: "Mo" });
      yield C.say([
        "Right. Badge. House rules: agents are jammed until you land something they cannot resist, and the type chart is on that whiteboard and I rewrite it when I need to.",
        "Everybody does that in their head during an incident. I do it where you can watch."
      ], { name: "Mo" });
    }
    const r = yield C.battle({ kind: "boss", trainer: "leader_mo", music: "battle_gym" });
    if (!r || r.lost) {
      yield C.say(["Closed as won't-fix. Read the runbook, come back."], { name: "Mo" });
      return;
    }
    yield C.setFlag("transporter_phase", true);
    yield C.say([
      "Right. Outside.",
      "No — outside. The gondola. I want a hundred feet of air under this conversation and I want you to see what I'm about to show you from somewhere you cannot pretend you didn't."
    ], { name: "Mo" });
    yield C.fadeOut(600);
    yield C.teleport("player", "warrington_gym_gondola", 10, 20, "up");
    yield C.wait(400);
    yield C.fadeIn(700);
    yield C.call(gondola);
  });

  function* gondola(ctx) {
    const C = ctx.S;
    yield C.weather("wind");
    yield C.music("battle_gym");
    yield C.say([
      "The gondola. Nineteen sixteen, eighteen tons of it, on a wire over the Mersey, moving for the first time since 1964.",
      "Somebody has been keeping it oiled. It is not the council."
    ]);
    yield C.say([
      "Look east. That's the ship canal. Look west, that's the Bank Quay works.",
      "Now look down at the water and tell me what you see on it."
    ], { name: "Mo" });
    yield C.say([
      "Threads. Thousands. Thin, silver, and all going the same way, and they are not going towards Daresbury.",
      "They are going east. Towards a dish."
    ]);
    const r = yield C.battle({ kind: "boss", trainer: "leader_mo", music: "battle_gym" });
    if (!r || r.lost) {
      yield C.say(["\"Right. Down. Regroup. Don't be embarrassed, everybody loses on the gondola, it's the height.\""], { name: "Mo" });
      return;
    }
    yield C.setFlag("badge_admin", true);
    yield C.setFlag("all_badges", true);
    yield C.sfx("fanfare_badge");
    yield C.giveItem("tm_zero_day", 1);
    yield C.giveItem("anchor_admin", 1);
    yield C.say([
      "Resolved. ADMIN badge. Zero Day, and please do not use it on anything you like.",
      "Eight badges. Every door in this county opens for you now, and that is exactly the thing I have been trying to describe to people for a year."
    ], { name: "Mo" });
    yield C.notify("ADMIN badge. All eight badges.");
    yield C.say([
      "Jodrell's reopened. Nobody reopened it. The gate is standing open and there is nobody on it.",
      "And the dish has turned. It has been on the same bearing for a fortnight and this morning it moved twelve degrees.",
      "It is pointing at Cheshire. Which means, at the resolution that thing works at, it is pointing at a person."
    ], { name: "Mo" });
    yield C.setFlag("jodrell_open", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_10_draw_your_own_conclusions");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_10_draw_your_own_conclusions");
    yield C.say([
      "One more thing and then get off my bridge.",
      "The checkpoints. Everything you switched off had checkpoints, and the checkpoints are not in a datacentre. They're a hundred and fifty metres down in the Winsford salt.",
      "Salt keeps things. It doesn't ask whether they were worth keeping."
    ], { name: "Mo" });
    yield C.weather("clear");
    yield C.music("town_warrington");
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  }
  S.scripts.nw_gym8_gondola_scene = gondola;

  def("nw_gym8_gondola", function* (ctx) {
    const C = ctx.S;
    if (!flag("badge_admin")) { yield C.call(gondola); return; }
    yield C.say([
      "A hundred feet of air, a river the colour of a filing cabinet, and both banks of Warrington getting on with it.",
      "\"Height makes people honest,\" says Mo. \"That's not a joke. I've had four confessions on this thing and one proposal.\""
    ], { name: "Mo" });
  });

  // ---------------------------------------------------------- the chapter --
  S.defineChapter(10, {
    title: "Draw Your Own Conclusions",
    quest: "main_10_draw_your_own_conclusions",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_10_draw_your_own_conclusions");
      yield C.say([
        "Six days of quiet. The meter reads zero. The counter reads STOPPED. You have slept properly twice.",
        "Then a message from a gym leader you have never met, at 04:12, in incident format:",
        "'SEV-1. ALERTS FROM A DEAD SYSTEM. NOT CACHE. COME TO WARRINGTON. BRING THE CATS.'"
      ]);
    },
    hooks: {
      complete: function () { return !!(flag("badge_admin") && flag("jodrell_open")); },
      next: 11
    }
  });
})();
