// =============================================================
// MonsterQuest v2 — CHAPTER 12: "THE FIREWALL"
// Chester. Levels 48-56, the league.
// Two miles of Roman wall at dusk. Four perimeter checks, each one a
// thing you should have been doing anyway. Then the amphitheatre, both
// cats, and somebody who has been waiting since Macclesfield.
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
  function party() { return (MQ.Party && MQ.Party.list) || []; }

  // ---- the four checks, as data the scripts and the tests both read -----
  const CHECKS = {
    sue: {
      id: "whitehat_sue", trainer: "whitehat_sue", label: "NO BORROWED STRENGTH",
      fail: "Anything in that party reporting to something else waits outside the gate.",
      test: function () {
        const p = party();
        for (let i = 0; i < p.length; i++) if (p[i] && (p[i].tagged || p[i].oracleTuned)) return false;
        return true;
      }
    },
    raj: {
      id: "whitehat_raj", trainer: "whitehat_raj", label: "NO UNPATCHED STATUS",
      fail: "Full health, no ailments, every one of them. The Care centre is ninety seconds that way and I will wait.",
      test: function () {
        const p = party();
        for (let i = 0; i < p.length; i++) {
          const m = p[i]; if (!m) continue;
          if (m.status) return false;
          const max = (m.stats && m.stats.hp) || m.maxHp || m.hp;
          if (max && m.hp < max) return false;
        }
        return true;
      }
    },
    kim: {
      id: "whitehat_kim", trainer: "whitehat_kim", label: "NO SHADOW IT IN THE BAG",
      fail: "Everything unregistered goes in the box. You get it back. It's a gauntlet, not a robbery.",
      test: function () { return true; }   // Kim impounds rather than refuses
    },
    doc: {
      id: "whitehat_doc", trainer: "whitehat_doc", label: "NO SINGLE POINT OF FAILURE",
      fail: "Four creatures, four different type profiles. One clever answer is not a team, it's a hobby.",
      test: function () {
        const p = party();
        const species = {}, types = {};
        for (let i = 0; i < p.length; i++) {
          const m = p[i]; if (!m || m.hp <= 0) continue;
          species[m.species] = 1;
          const d = MQ.Data && MQ.Data.species && MQ.Data.species[m.species];
          const ts = (d && d.types) || [];
          types[ts.join("/")] = 1;
        }
        return Object.keys(species).length >= 4 && Object.keys(types).length >= 4;
      }
    }
  };
  S.firewallChecks = CHECKS;

  function* gate(ctx, key, intro, pass, after) {
    const C = ctx.S;
    const chk = CHECKS[key];
    if (flag(chk.id)) { yield C.say(after, { name: chk.trainer.replace("whitehat_", "").toUpperCase() }); return; }
    yield C.say(intro, { name: chk.trainer.replace("whitehat_", "").toUpperCase() });
    yield C.notify("CHECK: " + chk.label);
    if (!chk.test()) {
      yield C.say([chk.fail, "Come back when it's true. I'm not going anywhere and neither is the wall."],
        { name: chk.trainer.replace("whitehat_", "").toUpperCase() });
      return;
    }
    yield C.say(pass, { name: chk.trainer.replace("whitehat_", "").toUpperCase() });
    const r = yield C.battle({ kind: "boss", trainer: chk.trainer, music: "battle_boss" });
    if (!r || r.lost) return;
    yield C.setFlag(chk.id, true);
    yield C.sfx("fanfare_victory");
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_12_the_firewall");
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
  }

  def("nw_firewall_start", function* (ctx) {
    const C = ctx.S;
    if (flag("firewall_started")) return;
    yield C.setFlag("firewall_started", true);
    yield C.time("dusk");
    yield C.music("town_chester");
    yield C.banner("THE FIREWALL", "Chester · the wall circuit");
    yield C.say([
      "Dusk on the Northgate. Two miles of Roman wall, closed to traffic, open to everybody, and everybody has come.",
      "They are on the wall, on the Rows, on the cathedral steps, on the Newgate looking down into an amphitheatre with a light in it."
    ]);
    yield C.say([
      "Four people are stationed round the circuit. None of them are dressed for a fight and all of them are.",
      "The league calls them THE FIREWALL. They call themselves the blue team, and they will each check exactly one thing before they let you past."
    ]);
    if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_12_the_firewall");
    if (flag("vex_ally")) {
      yield C.say([
        "Don't look for me on the wall. I'm not walking it with you; that'd be cheating and you'd let me.",
        "I'll be at the bottom. In the sand. Where it's always been going."
      ], { name: "VEX" });
    }
  });

  def("nw_whitehat_sue", function* (ctx) {
    yield ctx.S.call(function* (c) {
      yield* gate(c, "sue",
        [
          "Sue. Eastgate. First check and the one nobody expects: no borrowed strength.",
          "Anything in your party that reports to something else, anything tuned by a model, anything tagged — it waits outside the gate.",
          "I'll know. Knowing is the job and I have been doing the job since before there was a word for it."
        ],
        [
          "Clean. Genuinely clean.",
          "Do you know how rare that is at this level? Everybody at this level has taken help. Most of them don't know from whom.",
          "Right. Let's see what you actually built."
        ],
        [
          "Nell sent me a proxy list two chapters back with a covering note about you. I read covering notes. That's also the job."
        ]);
    }, ctx);
  });

  def("nw_whitehat_raj", function* (ctx) {
    yield ctx.S.call(function* (c) {
      yield* gate(c, "raj",
        [
          "Raj. Northgate. Second check: nothing unpatched.",
          "Full health, no status, all of them. Not 'mostly'. Not 'I'll sort it after'.",
          "'I'll sort it after' is how counties fall over and I have watched two of them do it."
        ],
        [
          "All green. Every one. Thank you.",
          "People think this check is cruelty. This check is the entire discipline in one sentence and it takes ninety seconds to satisfy."
        ],
        [
          "There's a Care centre ninety seconds that way and I send about a third of them back to it. They're always cross and always better for it."
        ]);
    }, ctx);
  });

  def("nw_whitehat_kim", function* (ctx) {
    const C = ctx.S;
    yield C.call(function* (c) {
      yield* gate(c, "kim",
        [
          "Kim. King Charles' Tower. Third check: nothing in that bag I can't account for.",
          "Key items, unregistered gear, anything a contractor gave you at a gate — it goes in the box for the duration.",
          "You get it back. It's a gauntlet, not a robbery, whatever the forum says."
        ],
        [
          "Accounted for, logged, signed. Here's your receipt. Yes, an actual receipt. I'm not an animal.",
          "Half this county runs on tools nobody approved. Including, I notice, most of the league."
        ],
        [
          "Your things are in the box under the stair and the box has a label with your name spelled right, which took me two goes."
        ]);
    }, ctx);
  });

  def("nw_whitehat_doc", function* (ctx) {
    const C = ctx.S;
    yield C.call(function* (c) {
      yield* gate(c, "doc",
        [
          "Doc. Water Tower. Last check, and the only one anybody argues with.",
          "Four creatures, four different type profiles, all standing. One clever answer is not a team. It's a hobby with a win rate.",
          "I have watched one clever answer end three careers and one of them was mine."
        ],
        [
          "Four ways to win. That's a team.",
          "Right. Down the Newgate stair, across the road, into the sand. They're waiting and they have been since Tuesday."
        ],
        [
          "Every one of us failed a gate once. Sue failed mine. Twice. She will deny it and I would like you to bring it up."
        ]);
    }, ctx);
    if (flag("whitehat_doc") && !flag("firewall_all_passed")) {
      yield C.setFlag("firewall_all_passed", true);
      yield C.say([
        "Four checks, four battles, two miles of wall at dusk, and the city on it the whole way round.",
        "Below the Newgate the amphitheatre is lit from inside and the sand has been raked."
      ]);
    }
  });

  // ------------------------------------------------------ Champion VEX ----
  def("nw_champion_vex", function* (ctx) {
    const C = ctx.S;
    if (flag("champion_fought")) return;
    const verified = !!flag("vex_ally");
    const trainerId = verified ? "champion_vex" : "champion_vex_tuned";
    yield C.freeze(true);
    yield C.music("battle_champion");
    yield C.say([
      "The Roman amphitheatre. Seven thousand seats, half of them still under the road, and the town stood on the wall above.",
      "MEADOW comes down the ramp with you. MEADOW goes first because MEADOW always goes first, and then sits where she will be in the way."
    ]);
    if (verified) {
      yield C.say([
        "Six of them. Hand-picked. Caught by me, trained by me, reporting to absolutely nobody.",
        "Took me four months to build a team that isn't listening to anything. You'd think that'd be the easy part."
      ], { name: "VEX" });
      yield C.say([
        "You asked me a question you already knew the answer to. On a wall. In the wind. In front of a cat.",
        "Nobody had ever built a way to be sure about me before. Everybody just decides.",
        "So. Best junior pentester in Cheshire, one hand-built team, and no more excuses for either of us."
      ], { name: "VEX" });
    } else {
      yield C.say([
        "You fought me on a wall in the wind and you won and you were RIGHT, and I have not forgiven either of those things.",
        "This team was built for me. By something extremely good at building teams. It knows what you'll do.",
        "Don't look at me like that. You didn't know which one I was."
      ], { name: "VEX" });
    }
    const throwIt = yield C.ask("The referee looks at you. The city looks at you. Both cats look at the sand.", [
      { label: "Fight properly.", value: "fight" },
      { label: "Throw it.", value: "throw" }
    ]);
    if (throwIt === "throw") {
      yield C.setFlag("champion_thrown", true);
      yield C.say([
        "You lead with the wrong one on purpose. Not badly. Plausibly. The way somebody good throws something.",
        "VEX takes four turns to notice and then goes very still."
      ]);
      yield C.say([
        "Don't.",
        "DON'T. Don't do that.",
        "I've had four years of things going easy on me and being kind about it and none of them told me they were doing it.",
        "Fight me properly next time. That's not a request, root user, that's the only thing I've ever asked you for."
      ], { name: "VEX" });
      yield C.setFlag("champion_result", "thrown");
      yield C.setFlag("champion_fought", true);
      yield C.setFlag("vex_name_revealed", true);
      yield C.say([
        "The referee raises VEX's arm and VEX takes it back.",
        "The trainer card records: Runner-up (declined)."
      ]);
    } else {
      const r = yield C.battle({ kind: "boss", trainer: trainerId, music: "battle_champion" });
      yield C.setFlag("champion_fought", true);
      if (r && r.lost) {
        yield C.setFlag("champion_result", "lost");
        yield C.say([
          "That's mine. That one's MINE.",
          "...come here. No. Come here."
        ], { name: "VEX" });
      } else {
        yield C.setFlag("champion_result", "won");
        yield C.say([
          verified ? "Right. Right. Of course." : "Fine.",
          verified ? "Don't say anything sensible. Not yet. Give me a minute and then say the sensible thing."
            : "You've been better than me since a canal towpath and I've spent eleven months being loud about it."
        ], { name: "VEX" });
      }
      yield C.setFlag("vex_name_revealed", true);
    }
    yield C.say([
      "The city on the wall does not cheer straight away. It waits, the way a town waits when it can see two people are in the middle of something.",
      "Then it does, and it is enormous, and it goes on for a while."
    ]);
    yield C.say([
      "Nobody has asked me my first name in six chapters. You included, and you're the one who checks things.",
      "It's Nerys.",
      "Don't wear it out."
    ], { name: "VEX" });
    yield C.setFlag("postgame_open", true);
    if (MQ.Quests && MQ.Quests.advance) yield C.quest.advance("main_12_the_firewall");
    if (MQ.Quests && MQ.Quests.complete) yield C.quest.complete("main_12_the_firewall");
    yield C.freeze(false);
    if (MQ.Save && MQ.Save.autosave) yield C.custom(function () { MQ.Save.autosave(); });
    // hand over to the ending
    if (S.runEnding) yield C.call(function* () { yield S.runEnding(flag("choice_plug")); });
  });

  def("nw_champion_after", function* (ctx) {
    const C = ctx.S;
    const res = flag("champion_result");
    if (res === "thrown") {
      yield C.say([
        "You threw it and I knew and the game knew and the trainer card knows.",
        "Roodee. Some weekend. Bring everything you've got and I mean everything."
      ], { name: "Nerys" });
      return;
    }
    if (flag("vex_ally")) {
      yield C.say([
        "Come for tea. My mum's asking and she has never asked about anybody.",
        "The salon's still boarded. She's talking about opening it again. I've told her to wait until the county calms down and she's told me the county has never once calmed down."
      ], { name: "Nerys" });
      return;
    }
    yield C.say([
      "The Roodee. Some weekend. Nothing borrowed on either side.",
      "That's where we're doing this properly, and you know it, and so do I."
    ], { name: "Nerys" });
  });

  S.defineChapter(12, {
    title: "THE FIREWALL",
    quest: "main_12_the_firewall",
    start: function* (ctx) {
      const C = ctx.S;
      if (MQ.Quests && MQ.Quests.start) yield C.quest.start("main_12_the_firewall");
      yield C.say([
        "Eight badges. A city that has been walled since AD 79. A league that checks four things before it will fight you.",
        "And somebody in the sand at the bottom of the Newgate stair who has been there since Tuesday and will not say why."
      ]);
    },
    hooks: {
      complete: function () { return !!flag("champion_fought"); },
      next: 13
    }
  });
})();
