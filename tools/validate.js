// MonsterQuest v2 — data/world validation. Exit 1 on any error.
// Usage: node tools/validate.js
"use strict";
const H = require("./headless");
const env = H.load();
const MQ = env.MQ;
const errors = [];
try { MQ.Data.validate().forEach(function (e) { errors.push(e); }); }
catch (e) { errors.push("MQ.Data.validate threw: " + e.message); }
// World.validate is registered as a Data validator; run it directly too if the registration is missing
if (MQ.World && MQ.World.validate && !(MQ.Data.validators.length)) MQ.World.validate().forEach(function (e) { errors.push(e); });
const nMaps = MQ.World ? MQ.World.ids().length : 0;
const nTiles = MQ.Tiles ? MQ.Tiles.count() : 0;
const counts = MQ.Data.KINDS.map(function (k) { return k + "=" + MQ.Data.count(k); }).join(" ");
if (errors.length) {
  console.error("validate: " + errors.length + " problem(s):");
  errors.forEach(function (e) { console.error("  - " + e); });
  process.exit(1);
}
console.log("validate: OK — " + env.files.length + " scripts, " + nMaps + " maps, " + nTiles + " tiles, " + counts);
