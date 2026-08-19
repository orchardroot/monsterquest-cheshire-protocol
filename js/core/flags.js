// =============================================================
// MonsterQuest v2 — MQ.Flags (core): story flags/counters and
// condition expressions ("badge_3 && !met_vex && quest.x>=2").
// Small tokenizer + recursive-descent parser; no eval.
// =============================================================
(function () {
  "use strict";
  const MQ = window.MQ;

  const store = {};
  const cache = {};       // expr string → AST
  let cacheN = 0;

  const Flags = { store: store };

  Flags.get = function (id) { return store[id]; };
  Flags.has = function (id) { return !!store[id]; };
  Flags.set = function (id, val) {
    if (val === undefined) val = true;
    const old = store[id];
    if (val === false || val === null) delete store[id]; else store[id] = val;
    if (old !== val && MQ.Events) MQ.Events.emit("flag", { id: id, value: val, old: old });
    return val;
  };
  Flags.clear = function (id) { Flags.set(id, false); };
  Flags.add = function (id, n) {
    const v = (typeof store[id] === "number" ? store[id] : 0) + (n === undefined ? 1 : n);
    return Flags.set(id, v);
  };
  Flags.toggle = function (id) { return Flags.set(id, !store[id]); };
  Flags.all = function () { return store; };
  Flags.reset = function () { const ks = Object.keys(store); for (let i = 0; i < ks.length; i++) delete store[ks[i]]; };
  Object.defineProperty(Flags, "chapter", {
    get: function () { return typeof store.chapter === "number" ? store.chapter : 0; },
    set: function (v) { Flags.set("chapter", v); }
  });

  // ---- identifier resolvers (extendable by other systems) --------
  // resolvers[prefix](rest, args) — rest = path after the prefix (may be ""), args = call args (or null)
  Flags.resolvers = {
    quest: function (rest) {
      if (MQ.Quests && MQ.Quests.stage) { const s = MQ.Quests.stage(rest); return typeof s === "number" ? s : -1; }
      const v = store["quest_" + rest];
      return typeof v === "number" ? v : -1;
    },
    item: function (rest) {
      if (MQ.Inventory && MQ.Inventory.count) return MQ.Inventory.count(rest) || 0;
      return typeof store["item_" + rest] === "number" ? store["item_" + rest] : 0;
    },
    badges: function () {
      if (MQ.Trainer && MQ.Trainer.badges) return MQ.Trainer.badges.size !== undefined ? MQ.Trainer.badges.size : MQ.Trainer.badges.length || 0;
      return typeof store.badges === "number" ? store.badges : 0;
    },
    chapter: function () { return Flags.chapter; },
    party: function (rest, args) {
      if (rest === "has") {
        const sp = args && args.length ? args[0] : null;
        if (MQ.Party && MQ.Party.has) return !!MQ.Party.has(sp);
        if (MQ.Party && MQ.Party.list) { for (let i = 0; i < MQ.Party.list.length; i++) if (MQ.Party.list[i].species === sp) return true; }
        return false;
      }
      if (rest === "size") return MQ.Party && MQ.Party.list ? MQ.Party.list.length : 0;
      return false;
    },
    time: function (rest) { return !!(MQ.Clock && MQ.Clock.phase === rest); },
    weather: function (rest) { return !!(MQ.Clock && MQ.Clock.weather === rest); },
    money: function () { return MQ.Inventory && typeof MQ.Inventory.money === "number" ? MQ.Inventory.money : 0; },
    "true": function () { return true; },
    "false": function () { return false; }
  };

  function resolveIdent(name, args) {
    const dot = name.indexOf(".");
    const head = dot >= 0 ? name.slice(0, dot) : name;
    const rest = dot >= 0 ? name.slice(dot + 1) : "";
    const r = Flags.resolvers[head];
    if (r) return r(rest, args);
    const v = store[name];
    return v === undefined ? false : v;
  }

  // ---- tokenizer -------------------------------------------------
  const isIdStart = function (c) { return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_"; };
  const isId = function (c) { return isIdStart(c) || (c >= "0" && c <= "9") || c === "." ; };
  const isDigit = function (c) { return c >= "0" && c <= "9"; };

  function tokenize(src) {
    const toks = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") { i++; continue; }
      if (isDigit(c) || (c === "-" && isDigit(src[i + 1] || "") && (toks.length === 0 || toks[toks.length - 1].t === "op" || toks[toks.length - 1].v === "(" || toks[toks.length - 1].v === ","))) {
        let j = i + 1;
        while (j < n && (isDigit(src[j]) || src[j] === ".")) j++;
        toks.push({ t: "num", v: parseFloat(src.slice(i, j)) });
        i = j; continue;
      }
      if (c === "'" || c === '"') {
        let j = i + 1;
        while (j < n && src[j] !== c) j++;
        toks.push({ t: "str", v: src.slice(i + 1, j) });
        i = j + 1; continue;
      }
      if (isIdStart(c)) {
        let j = i + 1;
        while (j < n && isId(src[j])) j++;
        toks.push({ t: "id", v: src.slice(i, j) });
        i = j; continue;
      }
      const two = src.substr(i, 2);
      if (two === "&&" || two === "||" || two === "==" || two === "!=" || two === ">=" || two === "<=") { toks.push({ t: "op", v: two }); i += 2; continue; }
      if (c === "!" || c === ">" || c === "<" || c === "(" || c === ")" || c === "," || c === "+" || c === "-") { toks.push({ t: c === "(" || c === ")" || c === "," ? "p" : "op", v: c }); i++; continue; }
      throw new Error("Flags: bad char '" + c + "' in \"" + src + "\"");
    }
    return toks;
  }

  // ---- parser → AST ------------------------------------------------
  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = function () { return toks[p]; };
    const next = function () { return toks[p++]; };
    const accept = function (t, v) { const k = toks[p]; if (k && k.t === t && (v === undefined || k.v === v)) { p++; return k; } return null; };
    const expect = function (t, v) { const k = accept(t, v); if (!k) throw new Error("Flags: expected " + (v || t) + " in \"" + src + "\""); return k; };

    function parseOr() {
      let left = parseAnd();
      while (accept("op", "||")) left = { k: "or", a: left, b: parseAnd() };
      return left;
    }
    function parseAnd() {
      let left = parseUnary();
      while (accept("op", "&&")) left = { k: "and", a: left, b: parseUnary() };
      return left;
    }
    function parseUnary() {
      if (accept("op", "!")) return { k: "not", a: parseUnary() };
      return parseCmp();
    }
    function parseCmp() {
      const left = parseSum();
      const k = peek();
      if (k && k.t === "op" && (k.v === "==" || k.v === "!=" || k.v === ">=" || k.v === "<=" || k.v === ">" || k.v === "<")) {
        next();
        return { k: "cmp", op: k.v, a: left, b: parseSum() };
      }
      return left;
    }
    function parseSum() {
      let left = parsePrimary();
      let k;
      while ((k = peek()) && k.t === "op" && (k.v === "+" || k.v === "-")) {
        next();
        left = { k: "sum", op: k.v, a: left, b: parsePrimary() };
      }
      return left;
    }
    function parsePrimary() {
      const k = next();
      if (!k) throw new Error("Flags: unexpected end in \"" + src + "\"");
      if (k.t === "num") return { k: "lit", v: k.v };
      if (k.t === "str") return { k: "lit", v: k.v };
      if (k.t === "p" && k.v === "(") { const e = parseOr(); expect("p", ")"); return e; }
      if (k.t === "id") {
        if (accept("p", "(")) {
          const args = [];
          if (!accept("p", ")")) {
            do {
              const a = next();
              if (!a) throw new Error("Flags: bad call args in \"" + src + "\"");
              args.push(a.t === "id" ? a.v : a.v);
            } while (accept("p", ","));
            expect("p", ")");
          }
          return { k: "call", name: k.v, args: args };
        }
        return { k: "id", name: k.v };
      }
      throw new Error("Flags: unexpected token '" + k.v + "' in \"" + src + "\"");
    }
    const ast = parseOr();
    if (p < toks.length) throw new Error("Flags: trailing tokens in \"" + src + "\"");
    return ast;
  }

  function norm(v) { return v === undefined || v === null ? false : v; }
  function evalNode(n) {
    switch (n.k) {
      case "lit": return n.v;
      case "id": return resolveIdent(n.name, null);
      case "call": return resolveIdent(n.name, n.args);
      case "not": return !truthy(evalNode(n.a));
      case "and": return truthy(evalNode(n.a)) ? truthy(evalNode(n.b)) : false;
      case "or": return truthy(evalNode(n.a)) ? true : truthy(evalNode(n.b));
      case "sum": { const a = +norm(evalNode(n.a)) || 0, b = +norm(evalNode(n.b)) || 0; return n.op === "+" ? a + b : a - b; }
      case "cmp": {
        let a = norm(evalNode(n.a)), b = norm(evalNode(n.b));
        if (typeof a === "number" && typeof b !== "number") b = b === true ? 1 : b === false ? 0 : (isNaN(+b) ? b : +b);
        if (typeof b === "number" && typeof a !== "number") a = a === true ? 1 : a === false ? 0 : (isNaN(+a) ? a : +a);
        switch (n.op) {
          case "==": return a === b;
          case "!=": return a !== b;
          case ">=": return a >= b;
          case "<=": return a <= b;
          case ">": return a > b;
          case "<": return a < b;
        }
      }
    }
    return false;
  }
  function truthy(v) { return !!v; }

  Flags.compile = function (expr) {
    let ast = cache[expr];
    if (!ast) {
      ast = parse(expr);
      if (cacheN > 2000) { const ks = Object.keys(cache); for (let i = 0; i < ks.length; i++) delete cache[ks[i]]; cacheN = 0; }
      cache[expr] = ast; cacheN++;
    }
    return ast;
  };
  // test(expr) → boolean; expr may be: string | boolean | function | undefined (→ true)
  Flags.test = function (expr) {
    if (expr === undefined || expr === null || expr === "") return true;
    if (typeof expr === "boolean") return expr;
    if (typeof expr === "function") return !!expr();
    try { return truthy(evalNode(Flags.compile(String(expr)))); }
    catch (e) { MQ.warn(e.message); return false; }
  };
  // evaluate(expr) → raw value (numbers etc.)
  Flags.eval = function (expr) { return evalNode(Flags.compile(String(expr))); };
  Flags.parse = parse;
  Flags.tokenize = tokenize;

  // save provider
  if (MQ.Save && MQ.Save.register) {
    MQ.Save.register("flags", { save: function () { return MQ.U.deepClone(store); }, load: function (o) { Flags.reset(); if (o) Object.assign(store, o); } });
  } else {
    // save.js loads after flags.js; it will pick this up via MQ.Flags.saveProvider
    Flags.saveProvider = { save: function () { return MQ.U.deepClone(store); }, load: function (o) { Flags.reset(); if (o) Object.assign(store, o); } };
  }

  MQ.Flags = Flags;
})();
