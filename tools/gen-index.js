// MonsterQuest v2 — regenerate the <script> block in index.html (between
// <!-- SCRIPTS --> markers) and the ASSETS list in sw.js from the js/ tree,
// honouring the load order in docs/design/ENGINE-ARCHITECTURE.md §2.
// Usage: node tools/gen-index.js [--check]
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SW_CACHE = "mq2-1";

// Contract order. Entries ending in "/" mean "all files in that dir, alphabetical".
const ORDER = [
  "core/ns", "core/util", "core/events", "core/view", "core/input", "core/loop", "core/scene", "core/text", "core/ui", "core/dialog", "core/script", "core/flags", "core/clock", "core/save", "core/registry",
  "art/sprites", "art/tiles", "art/monsters", "art/people", "art/fx",
  "audio/audio", "audio/songs", "audio/sfx",
  "data/types", "data/moves", "data/abilities", "data/items", "data/species", "data/encounters", "data/encounters_east", "data/trainers", "data/trainers_east", "data/quests", "data/achievements", "data/dialogue",
  "world/mapformat", "world/npc", "world/interact", "world/encounters", "world/overworld", "world/maps/",
  "battle/effects", "battle/ai", "battle/engine", "battle/scene",
  "content/", "ui/", "story/main", "story/npcs", "story/chapters/",
  "boot"
];

function exists(rel) { return fs.existsSync(path.join(ROOT, "js", rel)); }
function listDir(rel) {
  const dir = path.join(ROOT, "js", rel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).sort().map(function (f) { return rel + f; });
}

function scriptFiles() {
  const out = [];
  const seen = {};
  for (let i = 0; i < ORDER.length; i++) {
    const e = ORDER[i];
    if (e.slice(-1) === "/") {
      const files = listDir(e);
      for (let j = 0; j < files.length; j++) if (!seen[files[j]]) { seen[files[j]] = true; out.push("js/" + files[j]); }
    } else if (exists(e + ".js")) {
      if (!seen[e + ".js"]) { seen[e + ".js"] = true; out.push("js/" + e + ".js"); }
    }
  }
  // Warn about new-tree files not covered by the contract order (old js/*.js are intentionally excluded)
  const walk = function (dir, rel) {
    const items = fs.readdirSync(dir);
    for (let i = 0; i < items.length; i++) {
      const p = path.join(dir, items[i]);
      const r = rel + items[i];
      if (fs.statSync(p).isDirectory()) walk(p, r + "/");
      else if (/\.js$/.test(items[i]) && rel !== "" && !seen[r]) console.warn("gen-index: js/" + r + " is not in the contract order; not included");
    }
  };
  walk(path.join(ROOT, "js"), "");
  return out;
}

function main() {
  const check = process.argv.indexOf("--check") >= 0;
  const files = scriptFiles();
  const tags = files.map(function (f) { return '  <script src="' + f + '"></script>'; }).join("\n");
  const indexPath = path.join(ROOT, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  const re = /(<!-- SCRIPTS -->)([\s\S]*?)(<!-- \/SCRIPTS -->)/;
  if (!re.test(html)) throw new Error("index.html lacks <!-- SCRIPTS --> ... <!-- /SCRIPTS --> markers");
  const newHtml = html.replace(re, "$1\n" + tags + "\n  $3");
  // sw.js asset list
  const swPath = path.join(ROOT, "sw.js");
  let sw = fs.readFileSync(swPath, "utf8");
  const assets = [".", "index.html", "manifest.webmanifest", "css/style.css"].concat(files).concat(["icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"]);
  const list = "const ASSETS = [\n" + assets.map(function (a) { return '  "' + a + '",'; }).join("\n") + "\n];";
  const newSw = sw.replace(/const ASSETS = \[[\s\S]*?\];/, list).replace(/const CACHE = "[^"]*";/, 'const CACHE = "' + SW_CACHE + '";');
  if (check) {
    const ok = newHtml === html && newSw === sw;
    console.log(ok ? "gen-index: up to date (" + files.length + " scripts)" : "gen-index: OUT OF DATE — run node tools/gen-index.js");
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(indexPath, newHtml);
  fs.writeFileSync(swPath, newSw);
  console.log("gen-index: wrote " + files.length + " script tags to index.html and " + assets.length + " assets to sw.js");
}

module.exports = { scriptFiles: scriptFiles, ORDER: ORDER };
if (require.main === module) main();
