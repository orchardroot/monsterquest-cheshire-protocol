// MonsterQuest v2 — tiny test runner. Usage: node tools/test/run.js [filter]
"use strict";
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const filter = process.argv[2] || "";
const dir = __dirname;
const files = fs.readdirSync(dir).filter(function (f) { return /^test-.*\.js$/.test(f) && f.indexOf(filter) >= 0; }).sort();
let pass = 0, fail = 0;
const failures = [];

function runFile(f) {
  const tests = [];
  const t = function (name, fn) { tests.push({ name: name, fn: fn }); };
  require(path.join(dir, f))(t, assert);
  let chain = Promise.resolve();
  tests.forEach(function (tc) {
    chain = chain.then(function () {
      return Promise.resolve().then(function () { return tc.fn(); }).then(function () {
        pass++; console.log("  ok   " + tc.name);
      }, function (e) {
        fail++; failures.push(f + " › " + tc.name + ": " + (e && e.stack || e));
        console.log("  FAIL " + tc.name + "\n       " + (e && e.message || e));
      });
    });
  });
  return chain;
}

let all = Promise.resolve();
let finished = false;
files.forEach(function (f) { all = all.then(function () { console.log(f); return runFile(f); }); });
all.then(function () {
  finished = true;
  console.log("\n" + pass + " passed, " + fail + " failed");
  if (fail) { console.log("\nFailures:\n" + failures.join("\n\n")); process.exit(1); }
});
// A test that awaits something nothing will ever resolve drains the event
// loop and node exits 0 with no summary — which reads as a pass. Say so.
process.on("beforeExit", function () {
  if (finished) return;
  console.log("\nFAIL the runner stalled: a test's promise never settled (" + pass + " passed, " + fail + " failed so far)");
  process.exit(1);
});
