// =============================================================
// MonsterQuest v2 — MQ.Story: chapter scripts (ENGINE-ARCHITECTURE §8).
// The story workstream has not been built out yet (no region towns, no
// dialogue chapters); this is the minimal opening so a new game is
// actually playable end to end: a starter monster and a place to stand.
// Chapter and NPC scripts here use ONLY the MQ.Script command library +
// MQ.Flags/Quests/Inventory/Party APIs, per contract.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;
  const Story = MQ.Story = MQ.Story || {};
  Story.npcScripts = Story.npcScripts || {};
  Story.chapters = Story.chapters || {};

  const STARTERS = { silkin: "Silkin", brinewt: "Brinewt", kindlin: "Kindlin" };

  function* chapter1(ctx) {
    const S = (ctx && ctx.S) || MQ.Script.cmds;
    if (!MQ.Flags.get("contract_signed")) {
      const choice = yield S.ask("Alder Labs, Macclesfield. Ink's barely dry on the contract — pick a monster to put through its paces.", [
        { label: "SILKIN (Bug/Grass)", value: "silkin" },
        { label: "BRINEWT (Water)", value: "brinewt" },
        { label: "KINDLIN (Fire)", value: "kindlin" }
      ]);
      const species = STARTERS[choice] ? choice : "silkin";
      yield S.giveMonster({ species: species, level: 5, nickname: STARTERS[species] });
      yield S.setFlag("starter_chosen", species);
      yield S.setFlag("contract_signed", true);
      yield S.say(["That's the paperwork done. Macclesfield's out there — go and see what it makes of you."], { name: "Dr Alder" });
    }
  }

  Story.chapters[1] = { title: "Silk and Static", start: chapter1 };
})();
