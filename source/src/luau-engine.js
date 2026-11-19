// ---- luau engine ----
/* ================= LuauVM: a small Luau interpreter for the browser =================
   Luau source -> tokens -> AST -> JavaScript generator functions.
   Every Luau function becomes a JS generator, so any call can yield (task.wait, coroutines).
   Numbers are JS doubles, strings are JS strings, nil is undefined, tables are LuaTable. */
(function (root) {
'use strict';

/* ---------------- Values ---------------- */
let TID = 0;
class LuaTable {
  constructor() { this.arr = []; this.hash = new Map(); this.mt = null; this.id = ++TID; this.frozen = false; }
  static normKey(k) { if (typeof k === 'number' && Object.is(k, -0)) return 0; return k; }
  get(k) {
    if (typeof k === 'number') { if (Number.isInteger(k) && k >= 1 && k <= this.arr.length) return this.arr[k - 1]; k = LuaTable.normKey(k); }
    return this.hash.get(k);
  }
  set(k, v) {
    if (this.frozen) throw new LuaError('attempt to modify a readonly table');
    if (k === undefined) throw new LuaError('table index is nil');
    if (typeof k === 'number') {
      if (Number.isNaN(k)) throw new LuaError('table index is NaN');
      k = LuaTable.normKey(k);
      if (Number.isInteger(k) && k >= 1) {
        const n = this.arr.length;
        if (k <= n) {
          if (v === undefined && k === n) { this.arr.pop(); while (this.arr.length && this.arr[this.arr.length - 1] === undefined) this.arr.pop(); }
          else this.arr[k - 1] = v;
          return;
        }
        if (k === n + 1 && v !== undefined) {
          this.arr.push(v); this.hash.delete(k);
          let nk = k + 1; while (this.hash.has(nk)) { this.arr.push(this.hash.get(nk)); this.hash.delete(nk); nk++; }
          return;
        }
      }
    }
    if (v === undefined) this.hash.delete(k); else this.hash.set(k, v);
  }
  length() { let n = this.arr.length; while (n > 0 && this.arr[n - 1] === undefined) n--; return n; }
  *entries() {
    const arr = this.arr.slice();
    for (let i = 0; i < arr.length; i++) if (arr[i] !== undefined) yield [i + 1, arr[i]];
    for (const [k, v] of [...this.hash]) if (this.hash.has(k)) yield [k, this.hash.get(k)];
  }
  next(key) {
    let i = 0;
    if (key !== undefined) {
      if (typeof key === 'number' && Number.isInteger(key) && key >= 1 && key <= this.arr.length) i = key;
      else {
        const keys = [...this.hash.keys()]; const p = keys.indexOf(LuaTable.normKey(key));
        if (p < 0) throw new LuaError('invalid key to \'next\'');
        for (let j = p + 1; j < keys.length; j++) return [keys[j], this.hash.get(keys[j])];
        return [undefined];
      }
    }
    for (; i < this.arr.length; i++) if (this.arr[i] !== undefined) return [i + 1, this.arr[i]];
    const first = this.hash.keys().next();
    if (!first.done) { if (key === undefined || (typeof key === 'number' && key <= this.arr.length)) return [first.value, this.hash.get(first.value)]; }
    return [undefined];
  }
  static from(list) { const t = new LuaTable(); for (const v of list) t.arr.push(v); while (t.arr.length && t.arr[t.arr.length - 1] === undefined) t.arr.pop(); return t; }
  static dict(obj) { const t = new LuaTable(); for (const k in obj) t.set(k, obj[k]); return t; }
}
class LuaFn { constructor(gen, name, chunk, line) { this.gen = gen; this.name = name || 'anonymous'; this.chunk = chunk; this.line = line; this.id = ++TID; } }
class NativeFn {
  constructor(name, fn) { this.name = name; this.fn = fn; this.isGen = fn && fn.constructor && fn.constructor.name === 'GeneratorFunction'; this.id = ++TID; }
}
class LuaError extends Error {
  constructor(value, traceback) { super(typeof value === 'string' ? value : 'error object'); this.value = value; this.luaTrace = traceback; }
}
class Coroutine { constructor(fn) { this.fn = fn; this.status = 'suspended'; this.gen = null; this.id = ++TID; } }

const truthy = v => v !== undefined && v !== false && v !== null;

/* ---------------- Lexer ---------------- */
const KEYWORDS = new Set(['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while']);
class SyntaxErr extends Error { constructor(msg, line) { super(msg); this.line = line; } }

function lex(src, lineOffset = 0) {
  const toks = []; let i = 0, line = 1 + lineOffset; const n = src.length;
  const push = (type, value, extra) => toks.push(Object.assign({ type, value, line }, extra));
  const isDigit = c => c >= '0' && c <= '9';
  const isIdStart = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const isId = c => isIdStart(c) || isDigit(c);
  function longBracket() { // at '[', returns level or -1
    let j = i + 1, lvl = 0; while (src[j] === '=') { lvl++; j++; }
    return src[j] === '[' ? lvl : -1;
  }
  function readLong(lvl) {
    const startLine = line;
    i += lvl + 2; if (src[i] === '\r') i++; if (src[i] === '\n') { i++; line++; }
    const close = ']' + '='.repeat(lvl) + ']'; const e = src.indexOf(close, i);
    if (e < 0) throw new SyntaxErr('unfinished long string or comment (started on line ' + startLine + ')', startLine);
    const s = src.slice(i, e); for (const ch of s) if (ch === '\n') line++;
    i = e + close.length; return s;
  }
  function readEscape(q) {
    i++; const c = src[i];
    const map = { n: '\n', t: '\t', r: '\r', a: '\x07', b: '\b', f: '\f', v: '\v', '\\': '\\', '"': '"', "'": "'", '`': '`', '{': '{', '}': '}' };
    if (c in map) { i++; return map[c]; }
    if (c === '\n') { i++; line++; return '\n'; }
    if (c === 'x') { const h = src.substr(i + 1, 2); i += 3; return String.fromCharCode(parseInt(h, 16)); }
    if (c === 'z') { i++; while (i < n && /\s/.test(src[i])) { if (src[i] === '\n') line++; i++; } return ''; }
    if (c === 'u' && src[i + 1] === '{') { const e = src.indexOf('}', i); const cp = parseInt(src.slice(i + 2, e), 16); i = e + 1; return String.fromCodePoint(cp); }
    if (isDigit(c)) { let d = ''; while (d.length < 3 && isDigit(src[i])) d += src[i++]; return String.fromCharCode(+d); }
    throw new SyntaxErr('invalid escape sequence \\' + c, line);
  }
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '-' && src[i + 1] === '-') {
      i += 2;
      if (src[i] === '[') { const lvl = longBracket(); if (lvl >= 0) { readLong(lvl); continue; } }
      while (i < n && src[i] !== '\n') i++; continue;
    }
    if (isIdStart(c)) { let j = i; while (j < n && isId(src[j])) j++; const w = src.slice(i, j); i = j; if (KEYWORDS.has(w)) push('kw', w); else push('name', w); continue; }
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
      let j = i, v;
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) { j = i + 2; while (/[0-9a-fA-F_]/.test(src[j] || '')) j++; v = parseInt(src.slice(i + 2, j).replace(/_/g, ''), 16); }
      else if (c === '0' && (src[i + 1] === 'b' || src[i + 1] === 'B')) { j = i + 2; while (/[01_]/.test(src[j] || '')) j++; v = parseInt(src.slice(i + 2, j).replace(/_/g, ''), 2); }
      else {
        while (/[0-9_]/.test(src[j] || '')) j++;
        if (src[j] === '.' && src[j + 1] !== '.') { j++; while (/[0-9_]/.test(src[j] || '')) j++; }
        if (src[j] === 'e' || src[j] === 'E') { j++; if (src[j] === '+' || src[j] === '-') j++; while (isDigit(src[j] || '')) j++; }
        v = Number(src.slice(i, j).replace(/_/g, ''));
      }
      if (isIdStart(src[j] || '')) throw new SyntaxErr(`malformed number near '${src.slice(i, j + 1)}'`, line);
      i = j; push('number', v); continue;
    }
    if (c === '"' || c === "'") {
      const q = c; let s = ''; i++;
      while (true) {
        if (i >= n || src[i] === '\n') throw new SyntaxErr('unfinished string (missing closing ' + q + ')', line);
        const ch = src[i];
        if (ch === q) { i++; break; }
        if (ch === '\\') { s += readEscape(q); continue; }
        s += ch; i++;
      }
      push('string', s); continue;
    }
    if (c === '`') {
      const parts = []; let s = ''; i++; const startLine = line;
      while (true) {
        if (i >= n) throw new SyntaxErr('unfinished interpolated string (missing closing `)', startLine);
        const ch = src[i];
        if (ch === '`') { i++; break; }
        if (ch === '\\') { s += readEscape('`'); continue; }
        if (ch === '{') {
          parts.push(s); s = ''; i++;
          let depth = 1, j = i; const exprLine = line;
          while (j < n && depth > 0) {
            const d = src[j];
            if (d === '{') depth++; else if (d === '}') depth--; else if (d === '"' || d === "'") { const q2 = d; j++; while (j < n && src[j] !== q2) { if (src[j] === '\\') j++; j++; } }
            else if (d === '\n') line++;
            if (depth > 0) j++;
          }
          if (depth > 0) throw new SyntaxErr('unfinished { in interpolated string', exprLine);
          parts.push({ src: src.slice(i, j), line: exprLine }); i = j + 1; continue;
        }
        if (ch === '\n') line++;
        s += ch; i++;
      }
      parts.push(s); push('interp', parts); continue;
    }
    if (c === '[') { const lvl = longBracket(); if (lvl >= 0) { push('string', readLong(lvl)); continue; } }
    const three = src.substr(i, 3), two = src.substr(i, 2);
    if (['...', '//=', '..='].includes(three)) { push('op', three); i += 3; continue; }
    if (['==', '~=', '<=', '>=', '..', '::', '->', '+=', '-=', '*=', '/=', '%=', '^=', '//'].includes(two)) { push('op', two); i += 2; continue; }
    if (two === '!=') throw new SyntaxErr("Luau uses ~= for 'not equal', not !=", line);
    if (two === '&&' || two === '||') throw new SyntaxErr(`Luau uses the words 'and' / 'or', not ${two}`, line);
    if ('+-*/%^#<>=(){}[];:,.?|&'.includes(c)) { push('op', c); i++; continue; }
    if (c === '!') throw new SyntaxErr("Luau uses the word 'not' instead of !", line);
    throw new SyntaxErr(`unexpected symbol '${c}'`, line);
  }
  push('eof', null);
  return toks;
}

/* ---------------- Parser ---------------- */
const BINPRI = { or: [1, 1], and: [2, 2], '<': [3, 3], '>': [3, 3], '<=': [3, 3], '>=': [3, 3], '~=': [3, 3], '==': [3, 3], '..': [5, 4], '+': [6, 6], '-': [6, 6], '*': [7, 7], '/': [7, 7], '//': [7, 7], '%': [7, 7], '^': [10, 9] };
const UNARY_PRI = 8;

function parse(src, lineOffset = 0) {
  const toks = lex(src, lineOffset); let p = 0;
  const peek = (o = 0) => toks[p + o];
  const next = () => toks[p++];
  const is = (type, value) => { const t = toks[p]; return t.type === type && (value === undefined || t.value === value); };
  const isOp = v => is('op', v), isKw = v => is('kw', v);
  const desc = t => t.type === 'eof' ? '<eof>' : t.type === 'string' ? `"${t.value}"` : t.type === 'interp' ? 'interpolated string' : String(t.value);
  function fail(msg, t = toks[p]) { throw new SyntaxErr(msg, t.line); }
  function expect(type, value, ctx) {
    const t = toks[p];
    if (t.type === type && (value === undefined || t.value === value)) { p++; return t; }
    const want = value || type;
    let hint = '';
    if (want === 'then' && (t.value === '{' || t.value === ':')) hint = " (Luau if statements use 'then', not { or :)";
    else if ((want === 'then' || want === 'do') && t.value === '=') hint = " (use == to compare two values; a single = stores a value)";
    else if (want === 'do' && (t.value === '{' || t.value === ':')) hint = " (Luau loops use 'do', not { or :)";
    else if (want === 'end' && t.type === 'eof') hint = '';
    fail(`Expected '${want}'${ctx ? ' ' + ctx : ''}, got '${desc(t)}'${hint}`, t);
  }
  const expectName = ctx => { const t = toks[p]; if (t.type === 'name') { p++; return t.value; } fail(`Expected identifier${ctx ? ' ' + ctx : ''}, got '${desc(t)}'`, t); };

  // ---- type annotations are parsed and thrown away ----
  function skipBalanced(open, close) { let d = 0; do { const t = next(); if (t.type === 'eof') fail(`Expected '${close}' to close type`); if (t.type === 'op' && t.value === open) d++; else if (t.type === 'op' && t.value === close) d--; } while (d > 0); }
  function skipTypePrimary() {
    const t = peek();
    if (t.type === 'op' && t.value === '?') { next(); return; }
    if (t.type === 'op' && t.value === '(') { skipBalanced('(', ')'); if (isOp('->')) { next(); skipType(); } return; }
    if (t.type === 'op' && t.value === '<') { skipBalanced('<', '>'); if (isOp('(')) { skipBalanced('(', ')'); if (isOp('->')) { next(); skipType(); } } return; }
    if (t.type === 'op' && t.value === '{') { skipBalanced('{', '}'); return; }
    if (t.type === 'op' && t.value === '...') { next(); if (is('name') || isOp('(') || isOp('{')) skipTypePrimary(); return; }
    if (t.type === 'string' || (t.type === 'kw' && (t.value === 'nil' || t.value === 'true' || t.value === 'false'))) { next(); return; }
    if (t.type === 'name') {
      next();
      if (t.value === 'typeof' && isOp('(')) { skipBalanced('(', ')'); return; }
      while (isOp('.')) { next(); expectName('in type'); }
      if (isOp('<')) skipBalanced('<', '>');
      return;
    }
    fail(`Expected type, got '${desc(t)}'`);
  }
  function skipType() {
    if (isOp('|') || isOp('&')) next();
    skipTypePrimary();
    while (isOp('?')) next();
    while (isOp('|') || isOp('&')) { next(); skipTypePrimary(); while (isOp('?')) next(); }
  }
  function skipReturnType() { if (isOp(':')) { next(); if (isOp('(')) { skipBalanced('(', ')'); if (isOp('->')) { next(); skipType(); } } else skipType(); } }

  function block(terminators) {
    const body = [];
    while (true) {
      const t = peek();
      if (t.type === 'eof' || (t.type === 'kw' && terminators.includes(t.value))) break;
      if (t.type === 'kw' && t.value === 'return') { body.push(retStat()); if (isOp(';')) next(); break; }
      const s = statement(); if (s) body.push(s);
    }
    return body;
  }
  function retStat() {
    const line = next().line; let exprs = [];
    const t = peek();
    if (!(t.type === 'eof' || (t.type === 'kw' && ['end', 'else', 'elseif', 'until'].includes(t.value)) || (t.type === 'op' && t.value === ';'))) exprs = exprList();
    const after = peek();
    if (!(after.type === 'eof' || (after.type === 'kw' && ['end', 'else', 'elseif', 'until'].includes(after.value)) || (after.type === 'op' && after.value === ';')))
      fail(`Expected <eof> or 'end' after return, got '${desc(after)}' (return must be the last line in its block)`, after);
    return { k: 'Return', exprs, line };
  }
  function funcBody(line, isMethod, name) {
    if (isOp('<')) skipBalanced('<', '>');
    expect('op', '(', `to start the function's parameters`);
    const params = []; let vararg = false;
    if (isMethod) params.push('self');
    if (!isOp(')')) {
      while (true) {
        if (isOp('...')) { next(); vararg = true; if (isOp(':')) { next(); skipType(); } break; }
        params.push(expectName('in function parameters'));
        if (isOp(':')) { next(); skipType(); }
        if (!isOp(',')) break; next();
      }
    }
    expect('op', ')', 'to close the function parameters');
    skipReturnType();
    const body = block(['end']);
    expect('kw', 'end', `to close the function that started on line ${line}`);
    return { k: 'Function', params, vararg, body, line, name };
  }
  function statement() {
    const t = peek(), line = t.line;
    if (t.type === 'op' && t.value === ';') { next(); return null; }
    if (t.type === 'kw') {
      switch (t.value) {
        case 'local': {
          next();
          if (isKw('function')) { next(); const name = expectName('after local function'); const f = funcBody(line, false, name); return { k: 'LocalFunction', name, func: f, line }; }
          const names = [];
          do { if (names.length) next(); names.push(expectName('after local')); if (isOp(':')) { next(); skipType(); } if (isOp('<')) skipBalanced('<', '>'); } while (isOp(','));
          let exprs = [];
          if (isOp('=')) { next(); exprs = exprList(); }
          return { k: 'Local', names, exprs, line };
        }
        case 'function': {
          next();
          let target = { k: 'Name', name: expectName('after function'), line }; let fname = target.name, isMethod = false;
          while (isOp('.')) { next(); const key = expectName(); fname += '.' + key; target = { k: 'Index', obj: target, key: { k: 'String', value: key }, line }; }
          if (isOp(':')) { next(); const key = expectName(); fname += ':' + key; target = { k: 'Index', obj: target, key: { k: 'String', value: key }, line }; isMethod = true; }
          const f = funcBody(line, isMethod, fname);
          return { k: 'Assign', targets: [target], exprs: [f], line };
        }
        case 'if': {
          next(); const clauses = [];
          const cond = expr(); expect('kw', 'then', 'after the if condition'); const body = block(['elseif', 'else', 'end']);
          clauses.push({ cond, body }); let orelse = null;
          while (true) {
            if (isKw('elseif')) { next(); const c = expr(); expect('kw', 'then', 'after the elseif condition'); clauses.push({ cond: c, body: block(['elseif', 'else', 'end']) }); continue; }
            if (isKw('else')) { next(); orelse = block(['end']); }
            break;
          }
          expect('kw', 'end', `to close the if statement that started on line ${line}`);
          return { k: 'If', clauses, orelse, line };
        }
        case 'while': { next(); const cond = expr(); expect('kw', 'do', 'after the while condition'); const body = block(['end']); expect('kw', 'end', `to close the while loop that started on line ${line}`); return { k: 'While', cond, body, line }; }
        case 'repeat': { next(); const body = block(['until']); expect('kw', 'until', `to close the repeat loop that started on line ${line}`); const cond = expr(); return { k: 'Repeat', body, cond, line }; }
        case 'do': { next(); const body = block(['end']); expect('kw', 'end', `to close the do block that started on line ${line}`); return { k: 'Do', body, line }; }
        case 'for': {
          next(); const n1 = expectName('after for'); if (isOp(':')) { next(); skipType(); }
          if (isOp('=')) {
            next(); const start = expr(); expect('op', ',', 'in the numeric for loop (for i = start, stop do)'); const stop = expr(); let step = null;
            if (isOp(',')) { next(); step = expr(); }
            expect('kw', 'do', 'after the for loop header'); const body = block(['end']); expect('kw', 'end', `to close the for loop that started on line ${line}`);
            return { k: 'NumFor', var: n1, start, stop, step, body, line };
          }
          const names = [n1];
          while (isOp(',')) { next(); names.push(expectName('in for loop')); if (isOp(':')) { next(); skipType(); } }
          expect('kw', 'in', "in the for loop (for key, value in table do)"); const exprs = exprList();
          expect('kw', 'do', 'after the for loop header'); const body = block(['end']); expect('kw', 'end', `to close the for loop that started on line ${line}`);
          return { k: 'GenFor', names, exprs, body, line };
        }
        case 'break': next(); return { k: 'Break', line };
        case 'return': fail("'return' must be the last statement in its block");
        default: fail(`Unexpected '${t.value}'`);
      }
    }
    if (t.type === 'name') {
      if (t.value === 'continue') {
        const n2 = peek(1);
        if (!(n2.type === 'op' && ['(', '=', '.', '[', ':', ',', '{', '+=', '-='].includes(n2.value)) && n2.type !== 'string') { next(); return { k: 'Continue', line }; }
      }
      if ((t.value === 'type' || t.value === 'export') && peek(1).type === 'name') {
        if (t.value === 'export') next();
        if (peek().value === 'type' && peek(1).type === 'name') {
          next(); next(); if (isOp('<')) skipBalanced('<', '>'); expect('op', '=', 'in type alias'); skipType(); return null;
        }
      }
    }
    // expression statement: call or assignment
    const e = suffixedExpr();
    if (isOp('=') || isOp(',')) {
      const targets = [e];
      while (isOp(',')) { next(); targets.push(suffixedExpr()); }
      for (const tg of targets) if (tg.k !== 'Name' && tg.k !== 'Index') fail('Cannot assign to this expression', t);
      expect('op', '=');
      return { k: 'Assign', targets, exprs: exprList(), line };
    }
    const cop = peek();
    if (cop.type === 'op' && ['+=', '-=', '*=', '/=', '//=', '%=', '^=', '..='].includes(cop.value)) {
      if (e.k !== 'Name' && e.k !== 'Index') fail('Cannot assign to this expression');
      next(); const v = expr();
      return { k: 'CompoundAssign', target: e, op: cop.value.slice(0, -1), expr: v, line };
    }
    if (e.k !== 'Call' && e.k !== 'MethodCall') {
      if (cop.type === 'op' && cop.value === '++') fail('Luau has no ++ operator. Use x += 1 instead.');
      fail(e.k === 'Name' ? `Incomplete statement: expected assignment or a function call (did you mean ${e.name}(...) or ${e.name} = ...?)` : 'Incomplete statement: expected assignment or a function call', t);
    }
    return { k: 'CallStat', call: e, line };
  }
  function exprList() { const l = [expr()]; while (isOp(',')) { next(); l.push(expr()); } return l; }
  function primaryExpr() {
    const t = peek();
    if (t.type === 'name') { next(); return { k: 'Name', name: t.value, line: t.line }; }
    if (t.type === 'op' && t.value === '(') { next(); const e = expr(); expect('op', ')', 'to close the ('); return { k: 'Paren', expr: e, line: t.line }; }
    fail(`Expected identifier when parsing expression, got '${desc(t)}'`);
  }
  function callArgs() {
    const t = peek();
    if (t.type === 'string') { next(); return [{ k: 'String', value: t.value }]; }
    if (t.type === 'interp') return [simpleExpr()];
    if (t.type === 'op' && t.value === '{') return [tableCons()];
    expect('op', '(');
    if (isOp(')')) { next(); return []; }
    const args = exprList(); expect('op', ')', 'to close the function call'); return args;
  }
  function suffixedExpr() {
    let e = primaryExpr();
    while (true) {
      const t = peek();
      if (t.type === 'op' && t.value === '.') { next(); const key = expectName('after .'); e = { k: 'Index', obj: e, key: { k: 'String', value: key }, line: t.line, dot: true }; continue; }
      if (t.type === 'op' && t.value === '[') { next(); const key = expr(); expect('op', ']'); e = { k: 'Index', obj: e, key, line: t.line }; continue; }
      if (t.type === 'op' && t.value === ':') {
        if (peek(1).type !== 'name') break;
        next(); const name = expectName(); const n2 = peek();
        if (!(n2.type === 'string' || n2.type === 'interp' || (n2.type === 'op' && (n2.value === '(' || n2.value === '{')))) fail(`Expected '(' to call method ${name}, got '${desc(n2)}'`);
        e = { k: 'MethodCall', obj: e, name, args: callArgs(), line: t.line }; continue;
      }
      if ((t.type === 'op' && (t.value === '(' || t.value === '{')) || t.type === 'string' || t.type === 'interp') {
        if (t.type === 'op' && t.value === '(' && t.line !== toks[p - 1].line && e.k !== 'Paren') { /* ambiguous; Luau treats as call too */ }
        e = { k: 'Call', fn: e, args: callArgs(), line: t.line }; continue;
      }
      break;
    }
    return e;
  }
  function tableCons() {
    const line = expect('op', '{').line; const items = [];
    while (!isOp('}')) {
      if (isOp('[')) { next(); const k = expr(); expect('op', ']'); expect('op', '=', 'in table'); items.push({ k: 'Keyed', key: k, value: expr() }); }
      else if (is('name') && peek(1).type === 'op' && peek(1).value === '=') { const k = next().value; next(); items.push({ k: 'Keyed', key: { k: 'String', value: k }, value: expr() }); }
      else items.push({ k: 'Pos', value: expr() });
      if (isOp(',') || isOp(';')) { next(); continue; }
      if (!isOp('}')) fail(`Expected ',' or '}' in table (started on line ${line}), got '${desc(peek())}'`);
    }
    next();
    return { k: 'Table', items, line };
  }
  function simpleExpr() {
    const t = peek();
    if (t.type === 'number') { next(); return { k: 'Number', value: t.value }; }
    if (t.type === 'string') { next(); return { k: 'String', value: t.value }; }
    if (t.type === 'interp') {
      next();
      const parts = t.value.map(x => typeof x === 'string' ? { k: 'String', value: x } : (() => { const sub = parse('return ' + x.src, x.line - 1); return sub.body[0].exprs[0]; })());
      return { k: 'Interp', parts, line: t.line };
    }
    if (t.type === 'kw') {
      if (t.value === 'nil') { next(); return { k: 'Nil' }; }
      if (t.value === 'true') { next(); return { k: 'True' }; }
      if (t.value === 'false') { next(); return { k: 'False' }; }
      if (t.value === 'function') { next(); return funcBody(t.line, false, null); }
      if (t.value === 'if') {
        next(); const cond = expr(); expect('kw', 'then', 'in if-expression'); const a = expr(); const elifs = [];
        while (isKw('elseif')) { next(); const c = expr(); expect('kw', 'then', 'in if-expression'); elifs.push([c, expr()]); }
        expect('kw', 'else', "in if-expression (an if-expression must have an 'else')"); let b = expr();
        for (let i = elifs.length - 1; i >= 0; i--) b = { k: 'IfExpr', cond: elifs[i][0], a: elifs[i][1], b };
        return { k: 'IfExpr', cond, a, b, line: t.line };
      }
    }
    if (t.type === 'op' && t.value === '...') { next(); return { k: 'Vararg', line: t.line }; }
    if (t.type === 'op' && t.value === '{') return tableCons();
    return suffixedExpr();
  }
  function expr(limit = 0) {
    let left; const t = peek();
    if ((t.type === 'kw' && t.value === 'not') || (t.type === 'op' && (t.value === '-' || t.value === '#'))) {
      next(); const operand = expr(UNARY_PRI); left = { k: 'Unop', op: t.value, expr: operand, line: t.line };
    } else left = simpleExpr();
    while (isOp('::')) { next(); skipType(); }
    while (true) {
      const o = peek(); const op = o.type === 'op' || o.type === 'kw' ? o.value : null;
      const pri = op && BINPRI[op];
      if (!pri || pri[0] <= limit) break;
      next(); const right = expr(pri[1]);
      left = { k: 'Binop', op, left, right, line: o.line };
    }
    return left;
  }
  const body = block([]);
  if (!is('eof')) fail(`Expected <eof>, got '${desc(peek())}'` + (peek().value === 'end' ? " (there is an extra 'end')" : ''));
  return { k: 'Chunk', body };
}

/* ---------------- Code generation (AST -> JS) ---------------- */
const JS_RESERVED = new Set('break case catch class const continue debugger default delete do else enum export extends false finally for function if import in instanceof new null return super switch this throw true try typeof var void while with yield let static implements interface package private protected public await arguments eval undefined NaN Infinity'.split(' '));
function compile(ast, chunkName) {
  let uid = 0;
  const fnStack = [];
  let scopes = [];
  const pushScope = () => scopes.push(new Map());
  const popScope = () => scopes.pop();
  function declare(name) { const js = (JS_RESERVED.has(name) || name.startsWith('$') ? '_' : '') + name.replace(/[^A-Za-z0-9_]/g, '_') + '$' + (++uid); scopes[scopes.length - 1].set(name, js); return js; }
  function resolve(name) { for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return scopes[i].get(name); return null; }
  const tmp = () => { const n = '$t' + (++uid); fnStack[fnStack.length - 1].temps.push(n); return n; };
  const Q = s => JSON.stringify(s);
  const isMulti = e => e && (e.k === 'Call' || e.k === 'MethodCall' || e.k === 'Vararg');
  function calleeDesc(e) {
    if (e.k === 'Name') return (resolve(e.name) ? 'local ' : 'global ') + `'${e.name}'`;
    if (e.k === 'Index' && e.key.k === 'String') return `field '${e.key.value}'`;
    return '';
  }
  // multi-valued expression -> JS array expression
  function multi(e) {
    if (e.k === 'Call') return `(yield* $call(${expr(e.fn)}, ${argList(e.args)}, ${e.line}, ${Q(calleeDesc(e.fn))}))`;
    if (e.k === 'MethodCall') return `(yield* $callm(${expr(e.obj)}, ${Q(e.name)}, ${argList(e.args)}, ${e.line}))`;
    if (e.k === 'Vararg') { if (!fnStack[fnStack.length - 1].vararg) throw new SyntaxErr("Cannot use '...' outside of a vararg function", e.line); return '$va'; }
    return `[${expr(e)}]`;
  }
  function argList(args) {
    if (!args.length) return '[]';
    const last = args[args.length - 1];
    const head = args.slice(0, -1).map(expr);
    if (isMulti(last)) return head.length ? `[${head.join(', ')}, ...${multi(last)}]` : multi(last);
    return `[${[...head, expr(last)].join(', ')}]`;
  }
  function expr(e) {
    switch (e.k) {
      case 'Nil': return 'undefined';
      case 'True': return 'true';
      case 'False': return 'false';
      case 'Number': return Object.is(e.value, -0) ? '-0' : e.value === Infinity ? 'Infinity' : String(e.value);
      case 'String': return Q(e.value);
      case 'Vararg': return `${multi(e)}[0]`;
      case 'Paren': return isMulti(e.expr) ? `${multi(e.expr)}[0]` : expr(e.expr);
      case 'Call': case 'MethodCall': return `${multi(e)}[0]`;
      case 'Name': { const js = resolve(e.name); return js ? js : `$gg(${Q(e.name)})`; }
      case 'Index': return `$idx(${expr(e.obj)}, ${expr(e.key)}, ${e.line})`;
      case 'Function': return func(e);
      case 'Interp': return `$interp([${e.parts.map(expr).join(', ')}])`;
      case 'IfExpr': return `($tr(${expr(e.cond)}) ? ${expr(e.a)} : ${expr(e.b)})`;
      case 'Table': {
        const pos = e.items.filter(i => i.k === 'Pos'), keyed = e.items.filter(i => i.k === 'Keyed');
        let arr;
        if (pos.length && isMulti(pos[pos.length - 1].value)) { const h = pos.slice(0, -1).map(i => expr(i.value)); arr = h.length ? `[${h.join(', ')}, ...${multi(pos[pos.length - 1].value)}]` : multi(pos[pos.length - 1].value); }
        else arr = `[${pos.map(i => expr(i.value)).join(', ')}]`;
        return `$tbl(${arr}, [${keyed.map(i => `[${expr(i.key)}, ${expr(i.value)}]`).join(', ')}])`;
      }
      case 'Unop': {
        const v = expr(e.expr);
        if (e.op === 'not') return `!$tr(${v})`;
        if (e.op === '-') return `$unm(${v})`;
        return `$len(${v})`;
      }
      case 'Binop': {
        const op = e.op;
        if (op === 'and') { const t = tmp(); return `(!$tr(${t} = ${expr(e.left)}) ? ${t} : ${expr(e.right)})`; }
        if (op === 'or') { const t = tmp(); return `($tr(${t} = ${expr(e.left)}) ? ${t} : ${expr(e.right)})`; }
        const a = expr(e.left), b = expr(e.right);
        switch (op) {
          case '+': return `$add(${a}, ${b})`; case '-': return `$sub(${a}, ${b})`; case '*': return `$mul(${a}, ${b})`;
          case '/': return `$div(${a}, ${b})`; case '//': return `$idiv(${a}, ${b})`; case '%': return `$mod(${a}, ${b})`; case '^': return `$pow(${a}, ${b})`;
          case '..': return `$cat(${a}, ${b})`;
          case '==': return `$eq(${a}, ${b})`; case '~=': return `!$eq(${a}, ${b})`;
          case '<': return `$lt(${a}, ${b})`; case '<=': return `$le(${a}, ${b})`; case '>': return `$lt(${b}, ${a})`; case '>=': return `$le(${b}, ${a})`;
        }
      }
    }
    throw new SyntaxErr('cannot compile expression ' + e.k, e.line);
  }
  function func(f) {
    const ctx = { temps: [], vararg: f.vararg }; fnStack.push(ctx);
    const saved = scopes; scopes = [...scopes]; pushScope();
    const pnames = f.params.map(declare);
    const pre = pnames.map((pn, i) => `let ${pn} = $a[${i}];`).join(' ') + (f.vararg ? ` let $va = $a.slice(${pnames.length});` : '');
    const body = stmts(f.body);
    popScope(); scopes = saved; fnStack.pop();
    return `$fn(function* ($a) { ${ctx.temps.length ? 'var ' + ctx.temps.join(', ') + ';' : ''} ${pre} $ent(); ${body} return []; }, ${Q(f.name || 'anonymous')}, ${f.line})`;
  }
  function assignTo(target, val) {
    if (target.k === 'Name') { const js = resolve(target.name); return js ? `${js} = ${val};` : `$gs(${Q(target.name)}, ${val});`; }
    return `$set(${expr(target.obj)}, ${expr(target.key)}, ${val}, ${target.line});`;
  }
  function stmts(list) { return list.map(stmt).join('\n'); }
  function blockOf(list) { pushScope(); const s = stmts(list); popScope(); return s; }
  const L = line => `$L(${line});`;
  function stmt(s) {
    switch (s.k) {
      case 'Local': {
        const vals = s.exprs;
        if (s.names.length === 1 && vals.length <= 1) { const v = vals.length ? expr(vals[0]) : 'undefined'; const js = declare(s.names[0]); return `${L(s.line)} let ${js} = ${v};`; }
        const t = tmp(); const code = `${L(s.line)} ${t} = ${argList(vals)};`;
        const decls = s.names.map((n, i) => `let ${declare(n)} = ${t}[${i}];`).join(' ');
        return code + ' ' + decls;
      }
      case 'LocalFunction': { const js = declare(s.name); return `${L(s.line)} let ${js}; ${js} = ${func(s.func)};`; }
      case 'Assign': {
        if (s.targets.length === 1 && s.exprs.length === 1) {
          const tg = s.targets[0];
          if (tg.k === 'Index') { const o = tmp(), k = tmp(); return `${L(s.line)} ${o} = ${expr(tg.obj)}; ${k} = ${expr(tg.key)}; $set(${o}, ${k}, ${expr(s.exprs[0])}, ${s.line});`; }
          return `${L(s.line)} ${assignTo(tg, expr(s.exprs[0]))}`;
        }
        // evaluate targets' objects/keys, then values, then assign
        let code = L(s.line) + ' ';
        const tgs = s.targets.map(tg => {
          if (tg.k === 'Index') { const o = tmp(), k = tmp(); code += `${o} = ${expr(tg.obj)}; ${k} = ${expr(tg.key)}; `; return { idx: true, o, k, line: tg.line }; }
          return { tg };
        });
        const vt = tmp(); code += `${vt} = ${argList(s.exprs)}; `;
        tgs.forEach((t, i) => { code += t.idx ? `$set(${t.o}, ${t.k}, ${vt}[${i}], ${t.line}); ` : assignTo(t.tg, `${vt}[${i}]`) + ' '; });
        return code;
      }
      case 'CompoundAssign': {
        const fn = { '+': '$add', '-': '$sub', '*': '$mul', '/': '$div', '//': '$idiv', '%': '$mod', '^': '$pow', '..': '$cat' }[s.op];
        const tg = s.target;
        if (tg.k === 'Name') { const cur = expr(tg); return `${L(s.line)} ${assignTo(tg, `${fn}(${cur}, ${expr(s.expr)})`)}`; }
        const o = tmp(), k = tmp();
        return `${L(s.line)} ${o} = ${expr(tg.obj)}; ${k} = ${expr(tg.key)}; $set(${o}, ${k}, ${fn}($idx(${o}, ${k}, ${s.line}), ${expr(s.expr)}), ${s.line});`;
      }
      case 'CallStat': return `${L(s.line)} ${multi(s.call)};`;
      case 'Do': return `{ ${blockOf(s.body)} }`;
      case 'If': {
        let code = L(s.line) + ' ';
        s.clauses.forEach((c, i) => { code += `${i ? ' else ' : ''}if ($tr(${expr(c.cond)})) { ${blockOf(c.body)} }`; });
        if (s.orelse) code += ` else { ${blockOf(s.orelse)} }`;
        return code;
      }
      case 'While': return `${L(s.line)} while ($tr(${expr(s.cond)})) { $tick(${s.line}); ${blockOf(s.body)} }`;
      case 'Repeat': {
        pushScope(); const body = stmts(s.body); const cond = expr(s.cond); popScope();
        return `${L(s.line)} while (true) { $tick(${s.line}); ${body} if ($tr(${cond})) break; }`;
      }
      case 'NumFor': {
        const a = tmp(), b = tmp(), c = tmp(), i = tmp();
        const head = `${L(s.line)} ${a} = $forNum(${expr(s.start)}, 'initial'); ${b} = $forNum(${expr(s.stop)}, 'limit'); ${c} = ${s.step ? `$forNum(${expr(s.step)}, 'step')` : '1'}; if (${c} === 0) $rt('for loop step cannot be zero');`;
        pushScope(); const v = declare(s.var); const body = stmts(s.body); popScope();
        return `${head} for (${i} = ${a}; ${c} > 0 ? ${i} <= ${b} : ${i} >= ${b}; ${i} += ${c}) { $tick(${s.line}); let ${v} = ${i}; ${body} }`;
      }
      case 'GenFor': {
        const it = tmp(), r = tmp();
        const head = `${L(s.line)} ${it} = $iter(${argList(s.exprs)});`;
        pushScope(); const vs = s.names.map(declare); const body = stmts(s.body); popScope();
        return `${head} while (true) { if (${it}.fast) { ${r} = ${it}.fast.next(); if (${r}.done) break; ${r} = ${r}.value; } else { ${r} = yield* $call(${it}.f, [${it}.s, ${it}.c], ${s.line}, 'iterator'); if (${r}[0] === undefined) break; ${it}.c = ${r}[0]; } $tick(${s.line}); ${vs.map((v, i) => `let ${v} = ${r}[${i}];`).join(' ')} ${body} }`;
      }
      case 'Return': {
        if (s.exprs.length === 1 && (s.exprs[0].k === 'Call' || s.exprs[0].k === 'MethodCall')) return `${L(s.line)} return ${multi(s.exprs[0])};`;
        return `${L(s.line)} return ${argList(s.exprs)};`;
      }
      case 'Break': return 'break;';
      case 'Continue': return 'continue;';
    }
    throw new SyntaxErr('cannot compile statement ' + s.k, s.line);
  }
  const main = func({ params: [], vararg: true, body: ast.body, line: 0, name: 'main chunk' });
  return main;
}

/* ---------------- Runtime ---------------- */
const fmtNum = n => {
  if (Number.isNaN(n)) return 'nan';
  if (n === Infinity) return 'inf'; if (n === -Infinity) return '-inf';
  if (Number.isInteger(n) && Math.abs(n) < 1e16) return String(n);
  const a = Math.abs(n);
  if (a !== 0 && (a >= 1e16 || a < 1e-5)) { return n.toExponential().replace(/e([+-])(\d)$/, 'e$10$2'); }
  return String(n);
};
const hexId = id => '0x' + (0x10000000 + id * 40).toString(16).padStart(16, '0');
function typeName(v) {
  if (v === undefined || v === null) return 'nil';
  const t = typeof v;
  if (t === 'boolean') return 'boolean'; if (t === 'number') return 'number'; if (t === 'string') return 'string';
  if (v instanceof LuaTable) return 'table';
  if (v instanceof LuaFn || v instanceof NativeFn) return 'function';
  if (v instanceof Coroutine) return 'thread';
  return 'userdata';
}
function luaTypeof(v) { if (v && typeof v === 'object' && v.__rbxType) return v.__rbxType; return typeName(v); }

class Runtime {
  constructor(opts = {}) {
    this.out = opts.out || ((kind, text) => console.log(text));
    this.builtins = new Map();
    this.maxSteps = opts.maxSteps || 4e6;
    this.steps = 0;
    this.line = 0; this.chunk = '';
    this.stringMeta = null;
    this.timeFn = opts.time || (() => 0);
    this.rng = mulberry(opts.seed || (Date.now() & 0xffffffff));
    this.installStd();
  }
  // ---- errors ----
  rt(msg) { throw new LuaError(this.pos() + msg); }
  pos() { return this.chunk ? `${this.chunk}:${this.line}: ` : ''; }
  // ---- core ops ----
  tostr(v) {
    switch (typeName(v)) {
      case 'nil': return 'nil'; case 'boolean': return String(v); case 'number': return fmtNum(v); case 'string': return v;
      case 'table': { const mt = v.mt; const h = mt && mt.get('__tostring'); if (h) return String(this.callSync(h, [v])[0]); const nm = mt && mt.get('__type'); return (typeof nm === 'string' ? nm : 'table') + ': ' + hexId(v.id); }
      case 'function': return 'function: ' + hexId(v.id);
      case 'thread': return 'thread: ' + hexId(v.id);
      default: if (v.luaToString) return v.luaToString(); return 'userdata: ' + hexId(v.id || 1);
    }
  }
  tonum(v) {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') { const s = v.trim(); if (!s) return undefined; let n; if (/^-?0x[0-9a-f]+$/i.test(s)) n = parseInt(s, 16); else if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) || /^[-+]?(inf|nan)$/i.test(s)) n = Number(s.replace(/inf/i, 'Infinity')); return n === undefined || Number.isNaN(n) && !/nan/i.test(s) ? undefined : n; }
    return undefined;
  }
  meta(v, ev) { if (v instanceof LuaTable) return v.mt ? v.mt.get(ev) : undefined; if (typeof v === 'string' && this.stringMeta) return this.stringMeta.get(ev); return undefined; }
  arith(op, a, b) {
    const sym = { __add: '+', __sub: '-', __mul: '*', __div: '/', __idiv: '//', __mod: '%', __pow: '^', __unm: '-' }[op];
    if (a && typeof a === 'object' && a.luaArith) { const r = a.luaArith(op, a, b); if (r !== undefined) return r; }
    if (b && typeof b === 'object' && b.luaArith) { const r = b.luaArith(op, a, b); if (r !== undefined) return r; }
    const h = this.meta(a, op) || this.meta(b, op);
    if (h) return this.callSync(h, [a, b])[0];
    const na = this.tonum(a), nb = this.tonum(b);
    if (na !== undefined && nb !== undefined) return this.numop(op, na, nb);
    const bad = na === undefined ? a : b;
    const other = na === undefined ? b : a;
    if (typeof bad === 'string') this.rt(`attempt to perform arithmetic (${sym.trim()}) on string "${bad.length > 30 ? bad.slice(0, 30) + '…' : bad}" (it is not a number)` );
    this.rt(`attempt to perform arithmetic (${sym}) on ${luaTypeof(a)} and ${luaTypeof(b)}`);
  }
  numop(op, a, b) {
    switch (op) {
      case '__add': return a + b; case '__sub': return a - b; case '__mul': return a * b; case '__div': return a / b;
      case '__idiv': return Math.floor(a / b); case '__mod': return b === Infinity ? (a >= 0 ? a : b) : b === -Infinity ? (a <= 0 ? a : b) : a - Math.floor(a / b) * b; case '__pow': return Math.pow(a, b);
    }
  }
  eq(a, b) {
    if (a === b) return true;
    const ta = typeof a;
    if (ta !== 'object' || typeof b !== 'object' || a === undefined || b === undefined || a === null || b === null) return false;
    if (a.luaEq && a.constructor === b.constructor) return a.luaEq(b);
    if (a instanceof LuaTable && b instanceof LuaTable) { const h = this.meta(a, '__eq') || this.meta(b, '__eq'); if (h) return truthy(this.callSync(h, [a, b])[0]); }
    return false;
  }
  lt(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a < b;
    if (typeof a === 'string' && typeof b === 'string') return a < b;
    const h = this.meta(a, '__lt') || this.meta(b, '__lt'); if (h) return truthy(this.callSync(h, [a, b])[0]);
    this.rt(`attempt to compare ${luaTypeof(a)} < ${luaTypeof(b)}`);
  }
  le(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return a <= b;
    if (typeof a === 'string' && typeof b === 'string') return a <= b;
    const h = this.meta(a, '__le') || this.meta(b, '__le'); if (h) return truthy(this.callSync(h, [a, b])[0]);
    this.rt(`attempt to compare ${luaTypeof(a)} <= ${luaTypeof(b)}`);
  }
  len(v) {
    if (typeof v === 'string') return v.length;
    if (v instanceof LuaTable) { const h = this.meta(v, '__len'); if (h) return this.callSync(h, [v])[0]; return v.length(); }
    this.rt(`attempt to get length of a ${luaTypeof(v)} value`);
  }
  cat(a, b) {
    const ok = x => typeof x === 'string' || typeof x === 'number';
    if (ok(a) && ok(b)) return (typeof a === 'number' ? fmtNum(a) : a) + (typeof b === 'number' ? fmtNum(b) : b);
    const h = this.meta(a, '__concat') || this.meta(b, '__concat'); if (h) return this.callSync(h, [a, b])[0];
    const bad = ok(a) ? b : a;
    this.rt(`attempt to concatenate ${luaTypeof(ok(a) ? a : a)} with ${luaTypeof(b)}` + (bad === undefined ? ' (one side is nil, so check that variable has a value)' : typeName(bad) === 'boolean' ? ' (use tostring() to turn it into text)' : (bad && bad.__rbxType) ? ' (use tostring() or .Name)' : ''));
  }
  index(o, k) {
    if (o instanceof LuaTable) {
      const v = o.get(k); if (v !== undefined) return v;
      if (!o.mt) return undefined;
      const h = o.mt.get('__index'); if (h === undefined) return undefined;
      if (h instanceof LuaTable) return this.index(h, k);
      if (h instanceof LuaFn || h instanceof NativeFn) return this.callSync(h, [o, k])[0];
      return this.index(h, k);
    }
    if (typeof o === 'string') { const lib = this.builtins.get('string'); return lib.get(k); }
    if (o && typeof o === 'object' && o.luaGet) return o.luaGet(k, this);
    if (o === undefined || o === null) this.rt(`attempt to index nil with ${typeof k === 'string' ? `'${k}'` : this.tostr(k)}`);
    this.rt(`attempt to index ${luaTypeof(o)} with ${typeof k === 'string' ? `'${k}'` : this.tostr(k)}`);
  }
  setindex(o, k, v) {
    if (o instanceof LuaTable) {
      if (o.mt && o.get(k) === undefined) {
        const h = o.mt.get('__newindex');
        if (h instanceof LuaTable) return this.setindex(h, k, v);
        if (h) { this.callSync(h, [o, k, v]); return; }
      }
      return o.set(k, v);
    }
    if (o && typeof o === 'object' && o.luaSet) return o.luaSet(k, v, this);
    if (o === undefined || o === null) this.rt(`attempt to index nil with ${typeof k === 'string' ? `'${k}'` : this.tostr(k)}`);
    this.rt(`attempt to index ${luaTypeof(o)} with ${typeof k === 'string' ? `'${k}'` : this.tostr(k)}`);
  }
  *call(f, args, line, desc) {
    if (f instanceof LuaFn) return yield* f.gen(args);
    if (f instanceof NativeFn) {
      if (f.isGen) return (yield* f.fn.call(this, args)) || [];
      const r = f.fn.call(this, args); return r === undefined ? [] : r;
    }
    const h = this.meta(f, '__call');
    if (h) return yield* this.call(h, [f, ...args], line, desc);
    if (line) this.line = line;
    this.rt(`attempt to call a ${luaTypeof(f)} value${desc ? ` (${desc})` : ''}`);
  }
  callSync(f, args) {
    const g = this.call(f, args); let r = g.next();
    if (!r.done) this.rt('attempt to yield across metamethod/C-call boundary (you cannot task.wait() here)');
    return r.value;
  }
  // ---- compile & load ----
  load(src, chunkName, env) {
    let ast;
    try { ast = parse(src); }
    catch (e) { if (e instanceof SyntaxErr) { const err = new LuaError(`${chunkName}:${e.line}: ${e.message}`); err.syntax = true; err.line = e.line; throw err; } throw e; }
    const js = compile(ast, chunkName);
    const R = this;
    const G = env || new Map();
    const helpers = {
      $call: (f, a, l, d) => R.call(f, a, l, d),
      $callm: function* (o, name, a, l) {
        const f = R.index(o, name);
        if (f === undefined) { R.line = l; R.rt(o && o.__rbxType === 'Instance' ? `${name} is not a valid member of ${o.ClassName} "${o.getFullName()}"` : `attempt to call missing method '${name}' of ${luaTypeof(o)}`); }
        return yield* R.call(f, [o, ...a], l, `method '${name}'`);
      },
      $idx: (o, k, l) => { if (o === undefined || o === null) R.line = l; return R.index(o, k); },
      $set: (o, k, v, l) => { if (o === undefined || o === null) R.line = l; R.setindex(o, k, v); },
      $gg: name => { const v = G.get(name); return v !== undefined ? v : R.builtins.get(name); },
      $gs: (name, v) => { if (v === undefined) G.delete(name); else G.set(name, v); },
      $fn: (gen, name, line) => new LuaFn(gen, name, chunkName, line),
      $tbl: (arr, keyed) => { const t = LuaTable.from(arr); for (const [k, v] of keyed) { if (k === undefined) R.rt('table index is nil'); t.set(k, v); } return t; },
      $tr: truthy,
      $add: (a, b) => typeof a === 'number' && typeof b === 'number' ? a + b : R.arith('__add', a, b),
      $sub: (a, b) => typeof a === 'number' && typeof b === 'number' ? a - b : R.arith('__sub', a, b),
      $mul: (a, b) => typeof a === 'number' && typeof b === 'number' ? a * b : R.arith('__mul', a, b),
      $div: (a, b) => typeof a === 'number' && typeof b === 'number' ? a / b : R.arith('__div', a, b),
      $idiv: (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.floor(a / b) : R.arith('__idiv', a, b),
      $mod: (a, b) => typeof a === 'number' && typeof b === 'number' ? R.numop('__mod', a, b) : R.arith('__mod', a, b),
      $pow: (a, b) => typeof a === 'number' && typeof b === 'number' ? Math.pow(a, b) : R.arith('__pow', a, b),
      $unm: a => typeof a === 'number' ? -a : (a && a.luaArith ? a.luaArith('__unm', a, a) : R.meta(a, '__unm') ? R.callSync(R.meta(a, '__unm'), [a, a])[0] : R.arith('__unm', a, 0)),
      $len: v => R.len(v),
      $cat: (a, b) => R.cat(a, b),
      $eq: (a, b) => R.eq(a, b), $lt: (a, b) => R.lt(a, b), $le: (a, b) => R.le(a, b),
      $interp: parts => parts.map(p => R.tostr(p)).join(''),
      $L: line => { R.line = line; R.chunk = chunkName; if (++R.steps > R.maxSteps) R.timeout(); },
      $tick: line => { if (++R.steps > R.maxSteps) { R.line = line; R.timeout(); } },
      $ent: () => { R.chunk = chunkName; },
      $rt: msg => R.rt(msg),
      $forNum: (v, what) => { const n = R.tonum(v); if (n === undefined) R.rt(`invalid 'for' ${what} (number expected, got ${luaTypeof(v)})`); return n; },
      $iter: vals => R.makeIter(vals),
    };
    const names = Object.keys(helpers);
    let mainFn;
    try { mainFn = new Function(...names, 'return ' + js)(...names.map(n => helpers[n])); }
    catch (e) { const err = new LuaError(`${chunkName}: internal compile error: ${e.message}`); throw err; }
    mainFn.name = chunkName; mainFn.chunk = chunkName;
    // depth tracking: wrap gen to decrement on exit
    return mainFn;
  }
  timeout() { this.steps = 0; const e = new LuaError(`${this.pos()}Script timeout: exhausted allowed execution time (is there a loop without task.wait()?)`); e.timeout = true; throw e; }
  makeIter(vals) {
    let [f, s, c] = vals;
    if (f instanceof LuaTable) {
      const h = this.meta(f, '__iter');
      if (h) { [f, s, c] = this.callSync(h, [f]); return { f, s, c }; }
      if (f.mt && f.mt.get('__call')) return { f, s, c };
      return { fast: f.entries() };
    }
    if (f === this.NEXT && s instanceof LuaTable && c === undefined) return { fast: s.entries() };
    if (f === this.INEXT && s instanceof LuaTable) { const t = s, R = this; return { fast: (function* () { for (let i = 1; ; i++) { const v = R.index(t, i); if (v === undefined) return; yield [i, v]; } })() }; }
    if (f instanceof LuaFn || f instanceof NativeFn) return { f, s, c };
    if (f && f.luaIter) return { fast: f.luaIter() };
    this.rt(`attempt to iterate over a ${luaTypeof(f)} value` + (f && f.__rbxType === 'Instance' ? ' (use :GetChildren() to loop over its children)' : ''));
  }
  // ---- std library ----
  def(name, fn) { const f = new NativeFn(name, fn); this.builtins.set(name, f); return f; }
  lib(name, fns) { const t = new LuaTable(); for (const k in fns) t.set(k, fns[k] instanceof NativeFn || fns[k] instanceof LuaTable || typeof fns[k] !== 'function' ? fns[k] : new NativeFn(name + '.' + k, fns[k])); this.builtins.set(name, t); return t; }
  installStd() {
    const R = this;
    const argErr = (n, fname, expected, got) => R.rt(`invalid argument #${n} to '${fname}' (${expected} expected, got ${got === undefined ? 'nil' : luaTypeof(got)})`);
    const chkNum = (v, n, fname) => { const x = R.tonum(v); if (x === undefined) argErr(n, fname, 'number', v); return x; };
    const optNum = (v, n, fname, d) => v === undefined ? d : chkNum(v, n, fname);
    const chkStr = (v, n, fname) => { if (typeof v === 'string') return v; if (typeof v === 'number') return fmtNum(v); argErr(n, fname, 'string', v); };
    const chkTab = (v, n, fname) => { if (!(v instanceof LuaTable)) argErr(n, fname, 'table', v); return v; };
    R.chkNum = chkNum; R.chkStr = chkStr;

    R.def('print', function (a) { R.out('print', a.map(v => R.tostr(v)).join(' ')); return []; });
    R.def('warn', function (a) { R.out('warn', a.map(v => R.tostr(v)).join(' ')); return []; });
    R.def('error', function (a) {
      let [msg, level] = a; if (level === undefined) level = 1;
      if (typeof msg === 'string' && level > 0) msg = R.pos() + msg;
      throw new LuaError(msg);
    });
    R.def('assert', function (a) { if (!truthy(a[0])) { const m = a.length > 1 ? a[1] : 'assertion failed!'; throw new LuaError(typeof m === 'string' ? m : m); } return a; });
    R.def('type', a => { if (!a.length) R.rt("missing argument #1 to 'type'"); return [typeName(a[0])]; });
    R.def('typeof', a => [luaTypeof(a[0])]);
    R.def('tostring', a => [R.tostr(a[0])]);
    R.def('tonumber', a => {
      const [v, base] = a;
      if (base !== undefined) { const s = String(v).trim().toLowerCase(); if (!new RegExp('^-?[' + '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base) + ']+$').test(s)) return [undefined]; return [parseInt(s, base)]; }
      return [R.tonum(v)];
    });
    R.NEXT = R.def('next', a => { const t = chkTab(a[0], 1, 'next'); return t.next(a[1]); });
    R.INEXT = new NativeFn('ipairs_iter', a => { const i = a[1] + 1; const v = R.index(a[0], i); return v === undefined ? [undefined] : [i, v]; });
    R.def('pairs', a => { const t = a[0]; if (!(t instanceof LuaTable)) { if (t && t.luaIter) return [t]; argErr(1, 'pairs', 'table', t); } return [R.NEXT, t, undefined]; });
    R.def('ipairs', a => { const t = a[0]; if (!(t instanceof LuaTable)) argErr(1, 'ipairs', 'table', t); return [R.INEXT, t, 0]; });
    R.def('select', a => { const n = a[0]; if (n === '#') return [a.length - 1]; const i = chkNum(n, 1, 'select'); if (i < 0) return a.slice(a.length + i); if (i === 0) R.rt("bad argument #1 to 'select' (index out of range)"); return a.slice(i); });
    R.def('unpack', a => { const t = chkTab(a[0], 1, 'unpack'); const i = optNum(a[1], 2, 'unpack', 1), j = optNum(a[2], 3, 'unpack', t.length()); const r = []; for (let k = i; k <= j; k++) r.push(t.get(k)); return r; });
    R.def('rawget', a => [chkTab(a[0], 1, 'rawget').get(a[1])]);
    R.def('rawset', a => { chkTab(a[0], 1, 'rawset').set(a[1], a[2]); return [a[0]]; });
    R.def('rawequal', a => [a[0] === a[1]]);
    R.def('rawlen', a => [a[0] instanceof LuaTable ? a[0].length() : typeof a[0] === 'string' ? a[0].length : 0]);
    R.def('setmetatable', a => { const t = chkTab(a[0], 1, 'setmetatable'); if (t.mt && t.mt.get('__metatable') !== undefined) R.rt('cannot change a protected metatable'); const m = a[1]; if (m !== undefined && !(m instanceof LuaTable)) argErr(2, 'setmetatable', 'nil or table', m); t.mt = m || null; return [t]; });
    R.def('getmetatable', a => { const t = a[0]; if (t instanceof LuaTable && t.mt) { const p = t.mt.get('__metatable'); return [p !== undefined ? p : t.mt]; } return [undefined]; });
    R.def('pcall', function* (a) {
      const [f, ...rest] = a;
      try { const r = yield* R.call(f, rest); return [true, ...r]; }
      catch (e) { if (e && e.timeout) throw e; if (e instanceof RangeError) return [false, R.pos() + 'stack overflow'];  if (e instanceof LuaError) return [false, e.value]; if (e && e.kill) throw e; return [false, String(e && e.message || e)]; }
    });
    R.def('xpcall', function* (a) {
      const [f, h, ...rest] = a;
      try { const r = yield* R.call(f, rest); return [true, ...r]; }
      catch (e) { if (e && (e.timeout || e.kill)) throw e; const v = e instanceof LuaError ? e.value : String(e && e.message || e); const r = yield* R.call(h, [v]); return [false, ...r]; }
    });
    R.builtins.set('_VERSION', 'Luau');
    R.builtins.set('_G', new LuaTable());

    // ---- math ----
    const m = (fn, name) => a => [fn(...a.map((v, i) => chkNum(v, i + 1, 'math.' + name)))];
    let rng = R.rng;
    const perm = []; for (let i = 0; i < 256; i++) perm[i] = i; { const r2 = mulberry(1337); for (let i = 255; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; } }
    const grad = (h, x, y, z) => { const u = (h & 15) < 8 ? x : y, v = (h & 15) < 4 ? y : ((h & 15) === 12 || (h & 15) === 14) ? x : z; return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => a + t * (b - a);
    const P = i => perm[i & 255];
    const noise = (x, y = 0, z = 0) => {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      const u = fade(x), v = fade(y), w = fade(z);
      const A = P(X) + Y, AA = P(A) + Z, AB = P(A + 1) + Z, B = P(X + 1) + Y, BA = P(B) + Z, BB = P(B + 1) + Z;
      return lerp(lerp(lerp(grad(P(AA), x, y, z), grad(P(BA), x - 1, y, z), u), lerp(grad(P(AB), x, y - 1, z), grad(P(BB), x - 1, y - 1, z), u), v),
        lerp(lerp(grad(P(AA + 1), x, y, z - 1), grad(P(BA + 1), x - 1, y, z - 1), u), lerp(grad(P(AB + 1), x, y - 1, z - 1), grad(P(BB + 1), x - 1, y - 1, z - 1), u), v), w);
    };
    R.lib('math', {
      abs: m(Math.abs, 'abs'), ceil: m(Math.ceil, 'ceil'), floor: m(Math.floor, 'floor'), sqrt: m(Math.sqrt, 'sqrt'),
      sin: m(Math.sin, 'sin'), cos: m(Math.cos, 'cos'), tan: m(Math.tan, 'tan'), asin: m(Math.asin, 'asin'), acos: m(Math.acos, 'acos'),
      atan: a => [a[1] !== undefined ? Math.atan2(chkNum(a[0], 1, 'math.atan'), chkNum(a[1], 2, 'math.atan')) : Math.atan(chkNum(a[0], 1, 'math.atan'))],
      atan2: m(Math.atan2, 'atan2'), exp: m(Math.exp, 'exp'), sinh: m(Math.sinh, 'sinh'), cosh: m(Math.cosh, 'cosh'), tanh: m(Math.tanh, 'tanh'),
      log: a => { const x = chkNum(a[0], 1, 'math.log'); if (a[1] === undefined) return [Math.log(x)]; const b = chkNum(a[1], 2, 'math.log'); return [b === 2 ? Math.log2(x) : b === 10 ? Math.log10(x) : Math.log(x) / Math.log(b)]; },
      log10: m(Math.log10, 'log10'), pow: m(Math.pow, 'pow'),
      fmod: a => { const x = chkNum(a[0], 1, 'math.fmod'), y = chkNum(a[1], 2, 'math.fmod'); return [x % y]; },
      modf: a => { const x = chkNum(a[0], 1, 'math.modf'); const i = x >= 0 ? Math.floor(x) : Math.ceil(x); return [i, x - i]; },
      min: a => { if (!a.length) R.rt("missing argument #1 to 'min'"); return [Math.min(...a.map((v, i) => chkNum(v, i + 1, 'math.min')))]; },
      max: a => { if (!a.length) R.rt("missing argument #1 to 'max'"); return [Math.max(...a.map((v, i) => chkNum(v, i + 1, 'math.max')))]; },
      rad: m(x => x * Math.PI / 180, 'rad'), deg: m(x => x * 180 / Math.PI, 'deg'),
      clamp: a => { const x = chkNum(a[0], 1, 'math.clamp'), lo = chkNum(a[1], 2, 'math.clamp'), hi = chkNum(a[2], 3, 'math.clamp'); if (lo > hi) R.rt("invalid argument #3 to 'clamp' (max must be greater than or equal to min)"); return [Math.min(hi, Math.max(lo, x))]; },
      sign: m(x => x > 0 ? 1 : x < 0 ? -1 : 0, 'sign'),
      round: m(x => x >= 0 ? Math.floor(x + 0.5) : -Math.floor(-x + 0.5), 'round'),
      noise: a => [noise(chkNum(a[0], 1, 'math.noise'), optNum(a[1], 2, 'math.noise', 0), optNum(a[2], 3, 'math.noise', 0))],
      random: a => {
        if (!a.length) return [rng()];
        let lo = 1, hi;
        if (a.length === 1) hi = chkNum(a[0], 1, 'math.random'); else { lo = chkNum(a[0], 1, 'math.random'); hi = chkNum(a[1], 2, 'math.random'); }
        lo = Math.floor(lo); hi = Math.floor(hi);
        if (lo > hi) R.rt("invalid argument #2 to 'random' (interval is empty)");
        return [lo + Math.floor(rng() * (hi - lo + 1))];
      },
      randomseed: a => { rng = mulberry(Math.floor(chkNum(a[0], 1, 'math.randomseed'))); return []; },
      huge: Infinity, pi: Math.PI, maxinteger: 9007199254740991, mininteger: -9007199254740991,
    });

    // ---- string ----
    const strLib = R.lib('string', {
      len: a => [chkStr(a[0], 1, 'string.len').length],
      upper: a => [chkStr(a[0], 1, 'string.upper').toUpperCase()],
      lower: a => [chkStr(a[0], 1, 'string.lower').toLowerCase()],
      reverse: a => [[...chkStr(a[0], 1, 'string.reverse')].reverse().join('')],
      rep: a => { const s = chkStr(a[0], 1, 'string.rep'), n = Math.floor(chkNum(a[1], 2, 'string.rep')); const sep = a[2] === undefined ? '' : chkStr(a[2], 3, 'string.rep'); if (n <= 0) return ['']; if (s.length * n > 5e6) R.rt('string.rep result is too large'); return [Array(n).fill(s).join(sep)]; },
      sub: a => { const s = chkStr(a[0], 1, 'string.sub'); let [i, j] = [optNum(a[1], 2, 'string.sub', 1), optNum(a[2], 3, 'string.sub', -1)]; const L = s.length; if (i < 0) i = Math.max(L + i + 1, 1); else if (i === 0) i = 1; if (j < 0) j = L + j + 1; else if (j > L) j = L; return [i > j ? '' : s.slice(i - 1, j)]; },
      byte: a => { const s = chkStr(a[0], 1, 'string.byte'); let i = optNum(a[1], 2, 'string.byte', 1); let j = optNum(a[2], 3, 'string.byte', i); if (i < 0) i = s.length + i + 1; if (j < 0) j = s.length + j + 1; const r = []; for (let k = i; k <= j && k <= s.length; k++) r.push(s.charCodeAt(k - 1)); return r; },
      char: a => [String.fromCharCode(...a.map((v, i) => chkNum(v, i + 1, 'string.char')))],
      format: a => [strFormat(R, chkStr(a[0], 1, 'string.format'), a.slice(1))],
      split: a => { const s = chkStr(a[0], 1, 'string.split'); const sep = a[1] === undefined ? ',' : chkStr(a[1], 2, 'string.split'); return [LuaTable.from(sep === '' ? [...s] : s.split(sep))]; },
      find: a => { const s = chkStr(a[0], 1, 'string.find'), pat = chkStr(a[1], 2, 'string.find'); let init = optNum(a[2], 3, 'string.find', 1); if (init < 0) init = Math.max(1, s.length + init + 1); if (init > s.length + 1) return [undefined];
        if (truthy(a[3]) || !/[\^$*+?.()[\]%-]/.test(pat)) { const i = s.indexOf(pat, init - 1); return i < 0 ? [undefined] : [i + 1, i + pat.length]; }
        const re = luaPattern(R, pat, 'g'); re.lastIndex = init - 1; const mm = execAt(re, s, init - 1, pat); if (!mm) return [undefined]; return [mm.index + 1, mm.index + mm[0].length, ...caps(mm)]; },
      match: a => { const s = chkStr(a[0], 1, 'string.match'), pat = chkStr(a[1], 2, 'string.match'); let init = optNum(a[2], 3, 'string.match', 1); if (init < 0) init = Math.max(1, s.length + init + 1);
        const re = luaPattern(R, pat, 'g'); const mm = execAt(re, s, init - 1, pat); if (!mm) return [undefined]; const c = caps(mm); return c.length ? c : [mm[0]]; },
      gmatch: a => { const s = chkStr(a[0], 1, 'string.gmatch'), pat = chkStr(a[1], 2, 'string.gmatch'); const re = luaPattern(R, pat.replace(/^\^/, '%^'), 'g'); let pos = 0;
        return [new NativeFn('gmatch_iter', () => { if (pos > s.length) return [undefined]; const mm = execAt(re, s, pos, pat); if (!mm) { pos = s.length + 1; return [undefined]; } pos = mm.index + mm[0].length + (mm[0].length === 0 ? 1 : 0); const c = caps(mm); return c.length ? c : [mm[0]]; })]; },
      gsub: a => { const s = chkStr(a[0], 1, 'string.gsub'), pat = chkStr(a[1], 2, 'string.gsub'), repl = a[2]; const maxN = a[3] === undefined ? Infinity : chkNum(a[3], 4, 'string.gsub');
        const re = luaPattern(R, pat, 'g'); let out = '', pos = 0, count = 0;
        while (count < maxN && pos <= s.length) {
          const mm = execAt(re, s, pos, pat); if (!mm) break;
          out += s.slice(pos, mm.index); const whole = mm[0], c = caps(mm); let rep;
          if (typeof repl === 'string' || typeof repl === 'number') rep = String(repl).replace(/%([0-9%])/g, (_, d) => d === '%' ? '%' : d === '0' ? whole : R.tostr(c[+d - 1] !== undefined ? c[+d - 1] : (+d === 1 ? whole : '')));
          else if (repl instanceof LuaTable) rep = R.index(repl, c.length ? c[0] : whole);
          else if (repl instanceof LuaFn || repl instanceof NativeFn) rep = R.callSync(repl, c.length ? c : [whole])[0];
          else argErr(3, 'string.gsub', 'string/function/table', repl);
          out += (rep === undefined || rep === false) ? whole : R.tostr(rep); count++;
          if (whole.length === 0) { if (mm.index < s.length) out += s[mm.index]; pos = mm.index + 1; } else pos = mm.index + whole.length;
          if (pat.startsWith('^')) break;
        }
        out += s.slice(pos); return [out, count]; },
    });
    R.stringMeta = new LuaTable(); R.stringMeta.set('__index', strLib);

    // ---- table ----
    R.lib('table', {
      insert: a => { const t = chkTab(a[0], 1, 'table.insert'); if (a.length === 2) { t.set(t.length() + 1, a[1]); return []; } if (a.length !== 3) R.rt("wrong number of arguments to 'insert'"); const pos = chkNum(a[1], 2, 'table.insert'); const n = t.length(); if (pos < 1 || pos > n + 1) R.rt("bad argument #2 to 'insert' (position out of bounds)"); for (let i = n; i >= pos; i--) t.set(i + 1, t.get(i)); t.set(pos, a[2]); return []; },
      remove: a => { const t = chkTab(a[0], 1, 'table.remove'); const n = t.length(); if (n === 0 && a[1] === undefined) return [undefined]; const pos = a[1] === undefined ? n : chkNum(a[1], 2, 'table.remove'); if (n + 1 === pos) { const v = t.get(pos); t.set(pos, undefined); return [v]; } if (pos < 1 || pos > n + 1) R.rt("bad argument #2 to 'remove' (position out of bounds)"); const v = t.get(pos); for (let i = pos; i < n; i++) t.set(i, t.get(i + 1)); t.set(n, undefined); return [v]; },
      concat: a => { const t = chkTab(a[0], 1, 'table.concat'); const sep = a[1] === undefined ? '' : chkStr(a[1], 2, 'table.concat'); const i = optNum(a[2], 3, 'table.concat', 1), j = optNum(a[3], 4, 'table.concat', t.length()); const parts = []; for (let k = i; k <= j; k++) { const v = t.get(k); if (typeof v !== 'string' && typeof v !== 'number') R.rt(`invalid value (at index ${k}) in table for 'concat' (got ${luaTypeof(v)})`); parts.push(typeof v === 'number' ? fmtNum(v) : v); } return [parts.join(sep)]; },
      sort: a => { const t = chkTab(a[0], 1, 'table.sort'); const cmp = a[1]; const n = t.length(); const arr = []; for (let i = 1; i <= n; i++) arr.push(t.get(i));
        const less = cmp !== undefined ? (x, y) => truthy(R.callSync(cmp, [x, y])[0]) : (x, y) => R.lt(x, y);
        arr.sort((x, y) => less(x, y) ? -1 : less(y, x) ? 1 : 0); arr.forEach((v, i) => t.set(i + 1, v)); return []; },
      find: a => { const t = chkTab(a[0], 1, 'table.find'); const init = optNum(a[2], 3, 'table.find', 1); for (let i = init; i <= t.length(); i++) if (R.eq(t.get(i), a[1])) return [i]; return [undefined]; },
      clear: a => { const t = chkTab(a[0], 1, 'table.clear'); t.arr = []; t.hash.clear(); return []; },
      clone: a => { const t = chkTab(a[0], 1, 'table.clone'); const c = new LuaTable(); c.arr = t.arr.slice(); c.hash = new Map(t.hash); c.mt = t.mt; return [c]; },
      create: a => { const n = chkNum(a[0], 1, 'table.create'); return [LuaTable.from(Array(Math.max(0, n)).fill(a[1]))]; },
      unpack: a => R.builtins.get('unpack').fn(a),
      pack: a => { const t = LuaTable.from(a); t.set('n', a.length); return [t]; },
      freeze: a => { chkTab(a[0], 1, 'table.freeze').frozen = true; return [a[0]]; },
      isfrozen: a => [!!chkTab(a[0], 1, 'table.isfrozen').frozen],
      maxn: a => { const t = chkTab(a[0], 1, 'table.maxn'); let mx = t.length(); for (const k of t.hash.keys()) if (typeof k === 'number' && k > mx) mx = k; return [mx]; },
      move: a => { const t = chkTab(a[0], 1, 'table.move'); const f = chkNum(a[1], 2, 'table.move'), e = chkNum(a[2], 3, 'table.move'), tpos = chkNum(a[3], 4, 'table.move'); const t2 = a[4] || t; const vals = []; for (let i = f; i <= e; i++) vals.push(t.get(i)); vals.forEach((v, i) => t2.set(tpos + i, v)); return [t2]; },
    });

    // ---- os / time ----
    R.lib('os', {
      time: a => { if (a[0] instanceof LuaTable) { const t = a[0]; return [Math.floor(new Date(t.get('year'), (t.get('month') || 1) - 1, t.get('day') || 1, t.get('hour') ?? 12, t.get('min') || 0, t.get('sec') || 0).getTime() / 1000)]; } return [Math.floor(Date.now() / 1000)]; },
      clock: () => [performance.now() / 1000],
      date: a => { const fmt = a[0] || '%c'; const d = a[1] !== undefined ? new Date(a[1] * 1000) : new Date(); if (String(fmt).replace('!', '') === '*t') return [LuaTable.dict({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), min: d.getMinutes(), sec: d.getSeconds(), wday: d.getDay() + 1, yday: Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), isdst: false })]; const p = n => String(n).padStart(2, '0'); return [String(fmt).replace(/%([YmdHMSpAaBbcxX%])/g, (_, c) => ({ Y: d.getFullYear(), m: p(d.getMonth() + 1), d: p(d.getDate()), H: p(d.getHours()), M: p(d.getMinutes()), S: p(d.getSeconds()), p: d.getHours() < 12 ? 'AM' : 'PM', A: d.toLocaleDateString('en', { weekday: 'long' }), a: d.toLocaleDateString('en', { weekday: 'short' }), B: d.toLocaleDateString('en', { month: 'long' }), b: d.toLocaleDateString('en', { month: 'short' }), c: d.toLocaleString(), x: d.toLocaleDateString(), X: d.toLocaleTimeString(), '%': '%' })[c])]; },
      difftime: a => [chkNum(a[0], 1, 'os.difftime') - optNum(a[1], 2, 'os.difftime', 0)],
    });
    R.def('tick', () => [Date.now() / 1000]);

    // ---- coroutine ----
    const resumeCo = function* (co, args) {
      if (co.status === 'dead') return [false, 'cannot resume dead coroutine'];
      if (co.status === 'running') return [false, 'cannot resume non-suspended coroutine'];
      if (co.status === 'normal') return [false, 'cannot resume non-suspended coroutine'];
      const prev = R.currentCo; R.currentCo = co; if (prev) prev.status = 'normal';
      co.status = 'running';
      let send = args;
      try {
        if (!co.gen) { co.gen = R.call(co.fn, args); send = undefined; }
        while (true) {
          const r = co.gen.next(send);
          if (r.done) { co.status = 'dead'; return [true, ...(r.value || [])]; }
          const req = r.value;
          if (req && req.type === 'coyield') { co.status = 'suspended'; return [true, ...req.vals]; }
          // a scheduler request (like task.wait) passes through to the real thread
          co.status = 'normal'; R.currentCo = prev;
          send = yield req;
          R.currentCo = co; co.status = 'running';
        }
      } catch (e) {
        co.status = 'dead'; if (e && (e.timeout || e.kill)) throw e;
        return [false, e instanceof LuaError ? e.value : String(e && e.message || e)];
      } finally { if (R.currentCo === co) R.currentCo = prev; if (prev) prev.status = 'running'; }
    };
    R.lib('coroutine', {
      create: a => { const f = a[0]; if (!(f instanceof LuaFn || f instanceof NativeFn)) argErr(1, 'coroutine.create', 'function', f); return [new Coroutine(f)]; },
      resume: new NativeFn('coroutine.resume', function* (a) { const co = a[0]; if (!(co instanceof Coroutine)) argErr(1, 'coroutine.resume', 'thread', co); return yield* resumeCo(co, a.slice(1)); }),
      yield: new NativeFn('coroutine.yield', function* (a) { if (!R.currentCo) R.rt('attempt to yield from outside a coroutine'); const v = yield { type: 'coyield', vals: a }; return v || []; }),
      status: a => { const co = a[0]; if (!(co instanceof Coroutine)) argErr(1, 'coroutine.status', 'thread', co); return [co.status]; },
      running: () => [R.currentCo, !R.currentCo],
      isyieldable: () => [true],
      wrap: a => { const co = new Coroutine(a[0]); return [new NativeFn('wrapped', function* (args) { const r = yield* resumeCo(co, args); if (!r[0]) throw new LuaError(r[1]); return r.slice(1); })]; },
      close: a => { a[0].status = 'dead'; return [true]; },
    });
  }
}

function mulberry(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------------- Lua patterns -> JS RegExp ---------------- */
const PAT_CACHE = new Map();
const CLASSES = { a: 'A-Za-z', d: '0-9', l: 'a-z', u: 'A-Z', s: '\\s', w: 'A-Za-z0-9', x: '0-9A-Fa-f', p: '!-\\/:-@\\[-`{-~', c: '\\x00-\\x1f\\x7f', g: '!-~' };
function luaPattern(R, pat, flags) {
  const key = pat + '|' + flags; if (PAT_CACHE.has(key)) { const re = PAT_CACHE.get(key); re.lastIndex = 0; return re; }
  let out = '', i = 0; const n = pat.length;
  const esc = c => /[\\^$.*+?()[\]{}|\/-]/.test(c) ? '\\' + c : c;
  const cls = (c, inSet) => { const lc = c.toLowerCase(); if (CLASSES[lc]) { if (c === lc) return inSet ? CLASSES[lc] : `[${CLASSES[lc]}]`; return inSet ? null : `[^${CLASSES[lc]}]`; } return esc(c); };
  let anchored = false;
  if (pat[0] === '^') { anchored = true; i = 1; }
  while (i < n) {
    const c = pat[i];
    let atom;
    if (c === '%') {
      const d = pat[i + 1]; if (d === undefined) R.rt('malformed pattern (ends with \'%\')');
      if (d === 'b') R.rt('%b patterns are not supported in this simulator');
      if (d === 'f') { i += 2; const e = pat.indexOf(']', i + 1); const set = pat.slice(i, e + 1); i = e + 1; const s = setToRe(set); out += `(?<!${s})(?=${s})`; continue; }
      if (/[1-9]/.test(d)) { atom = '\\' + d; i += 2; }
      else { atom = cls(d, false); i += 2; }
    } else if (c === '[') {
      let j = i + 1; if (pat[j] === '^') j++; if (pat[j] === ']') j++;
      while (j < n && pat[j] !== ']') { if (pat[j] === '%') j++; j++; }
      if (j >= n) R.rt('malformed pattern (missing \']\')');
      atom = setToRe(pat.slice(i, j + 1)); i = j + 1;
    } else if (c === '.') { atom = '[\\s\\S]'; i++; }
    else if (c === '(') { if (pat[i + 1] === ')') { out += '()'; i += 2; continue; } out += '('; i++; continue; }
    else if (c === ')') { out += ')'; i++; continue; }
    else if (c === '$' && i === n - 1) { out += '$'; i++; continue; }
    else { atom = esc(c); i++; }
    const q = pat[i];
    if (q === '*' || q === '+' || q === '?') { out += atom + q; i++; }
    else if (q === '-') { out += atom + '*?'; i++; }
    else out += atom;
  }
  function setToRe(set) {
    let inner = set.slice(1, -1), neg = false, o = '';
    if (inner[0] === '^') { neg = true; inner = inner.slice(1); }
    for (let k = 0; k < inner.length; k++) {
      const ch = inner[k];
      if (ch === '%') { const d = inner[++k]; const lc = d.toLowerCase(); if (CLASSES[lc] && d === lc) o += CLASSES[lc]; else if (CLASSES[lc]) o += { A: '\\P{L}', D: '\\D', S: '\\S', W: '\\W' }[d] || ''; else o += '\\' + d; }
      else if (ch === '-' && k > 0 && k < inner.length - 1) o += '-';
      else o += /[\\\]\[^-]/.test(ch) ? '\\' + ch : ch;
    }
    return `[${neg ? '^' : ''}${o}]`;
  }
  let re;
  try { re = new RegExp((anchored ? '^' : '') + out, flags + (/\\P\{/.test(out) ? 'u' : '')); } catch (e) { R.rt('malformed pattern: ' + pat); }
  re.anchored = anchored;
  PAT_CACHE.set(key, re); return re;
}
function execAt(re, s, pos, pat) {
  if (re.anchored) { if (pos !== 0) { const re2 = new RegExp(re.source.replace(/^\^/, ''), 'y'); re2.lastIndex = pos; return re2.exec(s); } re.lastIndex = 0; return re.exec(s); }
  re.lastIndex = pos; return re.exec(s);
}
function caps(mm) { return mm.slice(1); }

/* ---------------- string.format ---------------- */
function strFormat(R, fmt, args) {
  let ai = 0;
  return fmt.replace(/%([-+ #0]*)(\d*)(?:\.(\d+))?([diouxXeEfgGqscaA%])/g, (whole, flags, width, prec, conv) => {
    if (conv === '%') return '%';
    if (ai >= args.length) R.rt(`invalid argument #${ai + 2} to 'format' (missing argument)`);
    const v = args[ai++]; let s;
    const num = () => { const n = R.tonum(v); if (n === undefined) R.rt(`invalid argument #${ai + 1} to 'format' (number expected, got ${luaTypeof(v)})`); return n; };
    switch (conv) {
      case 'd': case 'i': { const n = num(); if (!Number.isInteger(n)) R.rt(`invalid argument #${ai + 1} to 'format' (number has no integer representation)`); s = String(Math.abs(n)); if (prec) s = s.padStart(+prec, '0'); s = (n < 0 ? '-' : flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') + s; break; }
      case 'u': s = String(Math.floor(num())); break;
      case 'o': s = Math.floor(num()).toString(8); break;
      case 'x': s = Math.floor(num()).toString(16); break;
      case 'X': s = Math.floor(num()).toString(16).toUpperCase(); break;
      case 'c': s = String.fromCharCode(num()); break;
      case 'f': { const n = num(); s = n.toFixed(prec === undefined ? 6 : +prec); if (n >= 0 && flags.includes('+')) s = '+' + s; break; }
      case 'e': case 'E': { s = num().toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, 'e$10$2'); if (conv === 'E') s = s.toUpperCase(); break; }
      case 'g': case 'G': { const n = num(); const p = prec === undefined ? 6 : +prec || 1; s = Number(n.toPrecision(p)).toString(); if (Math.abs(n) >= Math.pow(10, p) || (Math.abs(n) < 1e-4 && n !== 0)) s = n.toExponential(p - 1).replace(/\.?0+e/, 'e').replace(/e([+-])(\d)$/, 'e$10$2'); if (conv === 'G') s = s.toUpperCase(); break; }
      case 'q': s = '"' + R.tostr(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"'; break;
      case 's': s = R.tostr(v); if (prec !== undefined) s = s.slice(0, +prec); break;
      default: s = R.tostr(v);
    }
    if (width && s.length < +width) s = flags.includes('-') ? s.padEnd(+width) : (flags.includes('0') && /[dfeEgGxXo]/.test(conv) ? (s[0] === '-' ? '-' + s.slice(1).padStart(+width - 1, '0') : s.padStart(+width, '0')) : s.padStart(+width));
    return s;
  });
}

/* ---------------- Scheduler: threads, task library ---------------- */
// A Thread drives a Luau generator. Yields are requests: {type:'wait', t} etc.
let THID = 0;
class Thread {
  constructor(gen, name, script) { this.gen = gen; this.name = name; this.script = script; this.status = 'ready'; this.wake = 0; this.send = undefined; this.id = ++THID; this.__rbxType = 'thread'; this.waitStart = 0; }
}
class Scheduler {
  constructor(R, opts = {}) {
    this.R = R; this.threads = []; this.now = 0; this.onError = opts.onError || ((e, th) => R.out('error', errText(e)));
    this.deferred = [];
    R.sched = this;
    this.installTask();
  }
  spawn(fn, args, name, script, delay = 0) {
    const R = this.R;
    const gen = (function* () { return yield* R.call(fn, args || []); })();
    const th = new Thread(gen, name || (fn && fn.name), script);
    th.wake = this.now + delay; th.status = delay > 0 ? 'waiting' : 'ready';
    this.threads.push(th); return th;
  }
  // run one thread until it yields or finishes
  resume(th) {
    const R = this.R;
    if (th.status === 'dead') return;
    const prevTh = R.curThread, prevLine = R.line, prevChunk = R.chunk, prevSteps = R.steps;
    R.steps = 0; R.curThread = th;
    const prevCo = R.currentCo; R.currentCo = null;
    try {
      const r = th.gen.next(th.send); th.send = undefined;
      if (r.done) { th.status = 'dead'; }
      else {
        const req = r.value;
        if (req && req.type === 'wait') { th.status = 'waiting'; th.waitStart = this.now; th.wake = this.now + Math.max(req.t, 0); th.waitKind = 'time'; }
        else if (req && req.type === 'signal') { th.status = 'signal'; th.waitKind = 'signal'; req.register(th); }
        else if (req && req.type === 'coyield') { th.status = 'dead'; R.out('error', 'attempt to yield from outside a coroutine'); }
        else if (req && req.type === 'suspend') { th.status = 'suspended'; }
        else { th.status = 'ready'; }
      }
    } catch (e) {
      th.status = 'dead';
      if (!(e && e.kill)) this.onError(e, th);
    } finally { R.curThread = prevTh; R.currentCo = prevCo; R.line = prevLine; R.chunk = prevChunk; if (prevTh) R.steps = prevSteps; }
  }
  wakeWith(th, vals) { if (th.status === 'dead') return; th.send = vals; th.status = 'ready'; }
  // advance the clock and run everything that is due
  step(dt) {
    this.now += dt;
    let guard = 0;
    while (guard++ < 1000) {
      const ready = this.threads.filter(t => t.status === 'ready' || (t.status === 'waiting' && t.wake <= this.now + 1e-9));
      if (!ready.length) break;
      ready.sort((a, b) => (a.status === 'waiting' ? a.wake : -1) - (b.status === 'waiting' ? b.wake : -1) || a.id - b.id);
      for (const th of ready) {
        if (th.status === 'waiting') { if (th.wake > this.now + 1e-9) continue; th.send = [this.now - th.waitStart]; th.status = 'ready'; }
        if (th.status === 'ready') this.resume(th);
      }
    }
    this.threads = this.threads.filter(t => t.status !== 'dead');
  }
  busy() { return this.threads.some(t => t.status === 'ready' || t.status === 'waiting'); }
  nextWake() { let w = Infinity; for (const t of this.threads) { if (t.status === 'ready') return this.now; if (t.status === 'waiting') w = Math.min(w, t.wake); } return w; }
  killAll() { for (const t of this.threads) t.status = 'dead'; this.threads = []; }
  installTask() {
    const R = this.R, S = this;
    const fnArg = (f, name) => { if (!(f instanceof LuaFn || f instanceof NativeFn || f instanceof Coroutine)) R.rt(`invalid argument #1 to '${name}' (function expected, got ${luaTypeof(f)})`); };
    const runCo = (co, args) => { // wrap a coroutine object as a thread
      return S.spawn(new NativeFn('co', function* () { return yield* R.call(R.builtins.get('coroutine').get('resume'), [co, ...args]); }), [], 'coroutine', R.curThread && R.curThread.script);
    };
    const wait = new NativeFn('task.wait', function* (a) {
      let t = a[0] === undefined ? 0 : R.tonum(a[0]); if (t === undefined) R.rt(`invalid argument #1 to 'wait' (number expected, got ${luaTypeof(a[0])})`);
      const r = yield { type: 'wait', t: Math.max(t, 1 / 60) };
      return r || [t];
    });
    R.lib('task', {
      wait,
      spawn: new NativeFn('task.spawn', function* (a) {
        const [f, ...args] = a; fnArg(f, 'spawn');
        const th = f instanceof Coroutine ? runCo(f, args) : S.spawn(f, args, 'task.spawn', R.curThread && R.curThread.script);
        S.resume(th); // runs immediately until its first yield
        return [th];
      }),
      defer: a => { const [f, ...args] = a; fnArg(f, 'defer'); const th = f instanceof Coroutine ? runCo(f, args) : S.spawn(f, args, 'task.defer', R.curThread && R.curThread.script); return [th]; },
      delay: a => { const [t, f, ...args] = a; fnArg(f, 'delay'); const th = S.spawn(f, args, 'task.delay', R.curThread && R.curThread.script, Math.max(R.tonum(t) || 0, 0)); return [th]; },
      cancel: a => { const th = a[0]; if (th && th instanceof Thread) th.status = 'dead'; return []; },
    });
    R.builtins.set('wait', wait);
    R.def('spawn', a => { const th = S.spawn(a[0], [], 'spawn'); th.wake = S.now + 0.03; th.status = 'waiting'; return []; });
    R.def('delay', a => { S.spawn(a[1], [], 'delay', null, R.tonum(a[0]) || 0); return []; });
    R.def('time', () => [S.now]);
    R.def('elapsedTime', () => [S.now]);
  }
}
function errText(e) {
  if (e instanceof LuaError) { const v = e.value; return typeof v === 'string' ? v : (v && v.luaToString ? v.luaToString() : String(v && typeof v === 'object' && v instanceof LuaTable ? 'error object (a table)' : v)); }
  if (e instanceof RangeError) return 'stack overflow (a function keeps calling itself; check your base case)';
  return 'internal error: ' + (e && e.message || e);
}

root.LuauVM = { LuaTable, LuaFn, NativeFn, LuaError, Coroutine, Runtime, Scheduler, Thread, parse, compile, lex, truthy, typeName, luaTypeof, fmtNum, errText, SyntaxErr };
})(typeof window !== 'undefined' ? window : globalThis);

/* ================= RobloxSim: a tiny Roblox-like world for Luau scripts =================
   Data types (Vector3, Color3, CFrame, UDim2, ...), Instances, services, events,
   simple physics, a player character, tweens, remotes and a fake DataStore. No DOM here. */
(function (root) {
'use strict';
const { LuaTable, NativeFn, LuaFn, LuaError, Runtime, Scheduler, truthy, luaTypeof, fmtNum, errText } = root.LuauVM;

const num = (R, v, what) => { const n = R.tonum(v); if (n === undefined) R.rt(`${what} expected number, got ${luaTypeof(v)}`); return n; };
const fmt = n => { const r = Math.round(n * 1000) / 1000; return fmtNum(Object.is(r, -0) ? 0 : r); };
const deg = r => r * 180 / Math.PI, rad = d => d * Math.PI / 180;

/* ---------------- method helper ---------------- */
function method(typeName, name, check, fn) {
  const isGen = fn.constructor.name === 'GeneratorFunction';
  const bad = (R, self) => R.rt(self === undefined || !check(self) ? `Expected ':' not '.' calling member function ${name}` : `invalid self`);
  return new NativeFn(name, isGen ? function* (a) { if (!check(a[0])) bad(this, a[0]); return yield* fn.call(this, a[0], a.slice(1), this); } : function (a) { if (!check(a[0])) bad(this, a[0]); return fn.call(this, a[0], a.slice(1), this); });
}

/* ---------------- Vector3 / Vector2 ---------------- */
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.X = x; this.Y = y; this.Z = z; }
  get __rbxType() { return 'Vector3'; }
  get mag() { return Math.hypot(this.X, this.Y, this.Z); }
  add(o) { return new Vector3(this.X + o.X, this.Y + o.Y, this.Z + o.Z); }
  sub(o) { return new Vector3(this.X - o.X, this.Y - o.Y, this.Z - o.Z); }
  mul(k) { return new Vector3(this.X * k, this.Y * k, this.Z * k); }
  dot(o) { return this.X * o.X + this.Y * o.Y + this.Z * o.Z; }
  cross(o) { return new Vector3(this.Y * o.Z - this.Z * o.Y, this.Z * o.X - this.X * o.Z, this.X * o.Y - this.Y * o.X); }
  unit() { const m = this.mag; return m ? this.mul(1 / m) : new Vector3(NaN, NaN, NaN); }
  lerp(o, t) { return new Vector3(this.X + (o.X - this.X) * t, this.Y + (o.Y - this.Y) * t, this.Z + (o.Z - this.Z) * t); }
  luaEq(o) { return this.X === o.X && this.Y === o.Y && this.Z === o.Z; }
  luaToString() { return `${fmt(this.X)}, ${fmt(this.Y)}, ${fmt(this.Z)}`; }
  luaArith(op, a, b) {
    const V = x => x instanceof Vector3;
    if (op === '__unm') return a.mul(-1);
    if (op === '__add') { if (V(a) && V(b)) return a.add(b); }
    if (op === '__sub') { if (V(a) && V(b)) return a.sub(b); }
    if (op === '__mul') { if (V(a) && V(b)) return new Vector3(a.X * b.X, a.Y * b.Y, a.Z * b.Z); if (V(a) && typeof b === 'number') return a.mul(b); if (V(b) && typeof a === 'number') return b.mul(a); }
    if (op === '__div') { if (V(a) && V(b)) return new Vector3(a.X / b.X, a.Y / b.Y, a.Z / b.Z); if (V(a) && typeof b === 'number') return a.mul(1 / b); if (V(b) && typeof a === 'number') return new Vector3(a / b.X, a / b.Y, a / b.Z); }
    if (op === '__idiv') { if (V(a) && typeof b === 'number') return new Vector3(Math.floor(a.X / b), Math.floor(a.Y / b), Math.floor(a.Z / b)); }
    if (a instanceof CFrame || b instanceof CFrame) return undefined;
    throw new LuaError(`attempt to perform arithmetic (${{ __add: '+', __sub: '-', __mul: '*', __div: '/', __idiv: '//', __mod: '%', __pow: '^' }[op]}) on ${luaTypeof(a)} and ${luaTypeof(b)}`);
  }
  luaGet(k, R) {
    switch (k) {
      case 'X': case 'x': return this.X; case 'Y': case 'y': return this.Y; case 'Z': case 'z': return this.Z;
      case 'Magnitude': case 'magnitude': return this.mag;
      case 'Unit': case 'unit': return this.unit();
    }
    const m = V3_METHODS[k]; if (m) return m;
    R.rt(`${k} is not a valid member of Vector3`);
  }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to (Vector3 values can't be changed; make a new one with Vector3.new)`); }
}
const isV3 = v => v instanceof Vector3;
const V3_METHODS = {
  Dot: method('Vector3', 'Dot', isV3, (s, [o], R) => [s.dot(o)]),
  Cross: method('Vector3', 'Cross', isV3, (s, [o]) => [s.cross(o)]),
  Lerp: method('Vector3', 'Lerp', isV3, (s, [o, t], R) => [s.lerp(o, num(R, t, 'Lerp'))]),
  FuzzyEq: method('Vector3', 'FuzzyEq', isV3, (s, [o, e]) => [s.sub(o).mag <= (e || 1e-5)]),
  Abs: method('Vector3', 'Abs', isV3, s => [new Vector3(Math.abs(s.X), Math.abs(s.Y), Math.abs(s.Z))]),
  Floor: method('Vector3', 'Floor', isV3, s => [new Vector3(Math.floor(s.X), Math.floor(s.Y), Math.floor(s.Z))]),
  Ceil: method('Vector3', 'Ceil', isV3, s => [new Vector3(Math.ceil(s.X), Math.ceil(s.Y), Math.ceil(s.Z))]),
  Max: method('Vector3', 'Max', isV3, (s, [o]) => [new Vector3(Math.max(s.X, o.X), Math.max(s.Y, o.Y), Math.max(s.Z, o.Z))]),
  Min: method('Vector3', 'Min', isV3, (s, [o]) => [new Vector3(Math.min(s.X, o.X), Math.min(s.Y, o.Y), Math.min(s.Z, o.Z))]),
  Angle: method('Vector3', 'Angle', isV3, (s, [o]) => [Math.acos(Math.max(-1, Math.min(1, s.dot(o) / (s.mag * o.mag || 1))))]),
};
class Vector2 {
  constructor(x = 0, y = 0) { this.X = x; this.Y = y; }
  get __rbxType() { return 'Vector2'; }
  luaEq(o) { return this.X === o.X && this.Y === o.Y; }
  luaToString() { return `${fmt(this.X)}, ${fmt(this.Y)}`; }
  luaArith(op, a, b) {
    const V = x => x instanceof Vector2;
    if (op === '__unm') return new Vector2(-a.X, -a.Y);
    if (op === '__add' && V(a) && V(b)) return new Vector2(a.X + b.X, a.Y + b.Y);
    if (op === '__sub' && V(a) && V(b)) return new Vector2(a.X - b.X, a.Y - b.Y);
    if (op === '__mul') { if (V(a) && typeof b === 'number') return new Vector2(a.X * b, a.Y * b); if (V(b) && typeof a === 'number') return new Vector2(b.X * a, b.Y * a); if (V(a) && V(b)) return new Vector2(a.X * b.X, a.Y * b.Y); }
    if (op === '__div' && V(a) && typeof b === 'number') return new Vector2(a.X / b, a.Y / b);
    throw new LuaError(`attempt to perform arithmetic on ${luaTypeof(a)} and ${luaTypeof(b)}`);
  }
  luaGet(k, R) { if (k === 'X' || k === 'x') return this.X; if (k === 'Y' || k === 'y') return this.Y; if (k === 'Magnitude') return Math.hypot(this.X, this.Y); if (k === 'Unit') { const m = Math.hypot(this.X, this.Y); return new Vector2(this.X / m, this.Y / m); } R.rt(`${k} is not a valid member of Vector2`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
}

/* ---------------- Color3 / BrickColor ---------------- */
class Color3 {
  constructor(r = 0, g = 0, b = 0) { this.R = r; this.G = g; this.B = b; }
  get __rbxType() { return 'Color3'; }
  luaEq(o) { return Math.abs(this.R - o.R) < 1e-6 && Math.abs(this.G - o.G) < 1e-6 && Math.abs(this.B - o.B) < 1e-6; }
  luaToString() { return `${fmt(this.R)}, ${fmt(this.G)}, ${fmt(this.B)}`; }
  lerp(o, t) { return new Color3(this.R + (o.R - this.R) * t, this.G + (o.G - this.G) * t, this.B + (o.B - this.B) * t); }
  css(k = 1) { const c = x => Math.round(Math.max(0, Math.min(1, x * k)) * 255); return `rgb(${c(this.R)},${c(this.G)},${c(this.B)})`; }
  toHSV() { const r = this.R, g = this.G, b = this.B, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; if (h < 0) h += 1; } return [h, mx ? d / mx : 0, mx]; }
  luaGet(k, R) {
    switch (k) { case 'R': case 'r': return this.R; case 'G': case 'g': return this.G; case 'B': case 'b': return this.B; }
    if (k === 'Lerp') return C3_LERP; if (k === 'ToHSV') return C3_HSV; if (k === 'ToHex') return C3_HEX;
    R.rt(`${k} is not a valid member of Color3`);
  }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to (make a new color with Color3.new or Color3.fromRGB)`); }
}
const isC3 = v => v instanceof Color3;
const C3_LERP = method('Color3', 'Lerp', isC3, (s, [o, t], R) => [s.lerp(o, num(R, t, 'Lerp'))]);
const C3_HSV = method('Color3', 'ToHSV', isC3, s => s.toHSV());
const C3_HEX = method('Color3', 'ToHex', isC3, s => [[s.R, s.G, s.B].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')]);
const fromHSV = (h, s, v) => { h = ((h % 1) + 1) % 1; const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s); const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6]; return new Color3(r, g, b); };
const BRICK = {
  'White': [242, 243, 243], 'Grey': [161, 165, 162], 'Light stone grey': [229, 228, 223], 'Medium stone grey': [163, 162, 165], 'Dark stone grey': [99, 95, 98], 'Black': [27, 42, 53], 'Really black': [17, 17, 17], 'Institutional white': [248, 248, 248],
  'Bright red': [196, 40, 28], 'Really red': [255, 0, 0], 'Crimson': [151, 0, 0], 'Persimmon': [255, 89, 89], 'Bright orange': [218, 133, 65], 'Neon orange': [213, 115, 61], 'Deep orange': [255, 176, 0], 'Bright yellow': [245, 205, 48], 'New Yeller': [255, 255, 0], 'Gold': [239, 184, 56],
  'Bright green': [75, 151, 75], 'Lime green': [0, 255, 0], 'Dark green': [40, 127, 71], 'Earth green': [39, 70, 45], 'Sea green': [52, 142, 64], 'Bright yellowish green': [164, 189, 71], 'Shamrock': [91, 154, 76],
  'Bright blue': [13, 105, 172], 'Really blue': [0, 0, 255], 'Deep blue': [33, 84, 185], 'Navy blue': [0, 32, 96], 'Cyan': [4, 175, 236], 'Toothpaste': [0, 255, 255], 'Pastel blue': [128, 187, 219], 'Electric blue': [9, 137, 207], 'Teal': [18, 238, 212],
  'Bright violet': [107, 50, 124], 'Royal purple': [98, 37, 209], 'Magenta': [170, 0, 170], 'Hot pink': [255, 0, 191], 'Pink': [255, 102, 204], 'Carnation pink': [255, 152, 220], 'Lavender': [140, 91, 159],
  'Reddish brown': [105, 64, 40], 'Brown': [124, 92, 70], 'Nougat': [204, 142, 105], 'Brick yellow': [215, 197, 154], 'Sand red': [149, 121, 119], 'Burnt Sienna': [143, 76, 42], 'Pine Cone': [108, 88, 75], 'CGA brown': [170, 85, 0],
};
class BrickColor {
  constructor(name) { this.Name = name; const [r, g, b] = BRICK[name]; this.Color = new Color3(r / 255, g / 255, b / 255); }
  get __rbxType() { return 'BrickColor'; }
  luaEq(o) { return this.Name === o.Name; }
  luaToString() { return this.Name; }
  luaGet(k, R) { if (k === 'Name') return this.Name; if (k === 'Color') return this.Color; if (k === 'r') return this.Color.R; if (k === 'g') return this.Color.G; if (k === 'b') return this.Color.B; if (k === 'Number') return Object.keys(BRICK).indexOf(this.Name) + 1; R.rt(`${k} is not a valid member of BrickColor`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
  static closest(c) { let best = 'Medium stone grey', bd = Infinity; for (const [n, [r, g, b]] of Object.entries(BRICK)) { const d = (r / 255 - c.R) ** 2 + (g / 255 - c.G) ** 2 + (b / 255 - c.B) ** 2; if (d < bd) { bd = d; best = n; } } return new BrickColor(best); }
}

/* ---------------- CFrame ---------------- */
const mat = { I: () => [1, 0, 0, 0, 1, 0, 0, 0, 1],
  mul(a, b) { const r = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]; return r; },
  vec(a, x, y, z) { return [a[0] * x + a[1] * y + a[2] * z, a[3] * x + a[4] * y + a[5] * z, a[6] * x + a[7] * y + a[8] * z]; },
  T(a) { return [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]]; },
  rx(t) { const c = Math.cos(t), s = Math.sin(t); return [1, 0, 0, 0, c, -s, 0, s, c]; },
  ry(t) { const c = Math.cos(t), s = Math.sin(t); return [c, 0, s, 0, 1, 0, -s, 0, c]; },
  rz(t) { const c = Math.cos(t), s = Math.sin(t); return [c, -s, 0, s, c, 0, 0, 0, 1]; },
  xyz(x, y, z) { return mat.mul(mat.mul(mat.rx(x), mat.ry(y)), mat.rz(z)); },
  yxz(x, y, z) { return mat.mul(mat.mul(mat.ry(y), mat.rx(x)), mat.rz(z)); },
  toYXZ(m) { const x = Math.asin(Math.max(-1, Math.min(1, -m[5]))); return [x, Math.atan2(m[2], m[8]), Math.atan2(m[3], m[4])]; },
  toXYZ(m) { const y = Math.asin(Math.max(-1, Math.min(1, m[2]))); return [Math.atan2(-m[5], m[8]), y, Math.atan2(-m[1], m[0])]; },
};
class CFrame {
  constructor(x = 0, y = 0, z = 0, R = mat.I()) { this.x = x; this.y = y; this.z = z; this.R = R; }
  get __rbxType() { return 'CFrame'; }
  get pos() { return new Vector3(this.x, this.y, this.z); }
  mul(o) { const p = mat.vec(this.R, o.x, o.y, o.z); return new CFrame(p[0] + this.x, p[1] + this.y, p[2] + this.z, mat.mul(this.R, o.R)); }
  point(v) { const p = mat.vec(this.R, v.X, v.Y, v.Z); return new Vector3(p[0] + this.x, p[1] + this.y, p[2] + this.z); }
  inverse() { const T = mat.T(this.R); const p = mat.vec(T, -this.x, -this.y, -this.z); return new CFrame(p[0], p[1], p[2], T); }
  lerp(o, t) { // position lerp + rotation via orthonormalized matrix lerp
    const R = this.R.map((v, i) => v + (o.R[i] - v) * t);
    const c0 = norm3([R[0], R[3], R[6]]); let c1 = [R[1], R[4], R[7]]; const d = c0[0] * c1[0] + c0[1] * c1[1] + c0[2] * c1[2]; c1 = norm3([c1[0] - d * c0[0], c1[1] - d * c0[1], c1[2] - d * c0[2]]);
    const c2 = [c0[1] * c1[2] - c0[2] * c1[1], c0[2] * c1[0] - c0[0] * c1[2], c0[0] * c1[1] - c0[1] * c1[0]];
    return new CFrame(this.x + (o.x - this.x) * t, this.y + (o.y - this.y) * t, this.z + (o.z - this.z) * t, [c0[0], c1[0], c2[0], c0[1], c1[1], c2[1], c0[2], c1[2], c2[2]]);
  }
  col(i) { return new Vector3(this.R[i], this.R[3 + i], this.R[6 + i]); }
  luaEq(o) { return this.x === o.x && this.y === o.y && this.z === o.z && this.R.every((v, i) => v === o.R[i]); }
  luaToString() { return [this.x, this.y, this.z, ...this.R].map(fmt).join(', '); }
  luaArith(op, a, b) {
    if (op === '__mul' && a instanceof CFrame && b instanceof CFrame) return a.mul(b);
    if (op === '__mul' && a instanceof CFrame && b instanceof Vector3) return a.point(b);
    if (op === '__add' && a instanceof CFrame && b instanceof Vector3) return new CFrame(a.x + b.X, a.y + b.Y, a.z + b.Z, a.R);
    if (op === '__sub' && a instanceof CFrame && b instanceof Vector3) return new CFrame(a.x - b.X, a.y - b.Y, a.z - b.Z, a.R);
    throw new LuaError(`attempt to perform arithmetic (${{ __add: '+', __sub: '-', __mul: '*', __div: '/' }[op] || op}) on ${luaTypeof(a)} and ${luaTypeof(b)}`);
  }
  luaGet(k, R) {
    switch (k) {
      case 'Position': case 'p': return this.pos; case 'X': return this.x; case 'Y': return this.y; case 'Z': return this.z;
      case 'LookVector': case 'lookVector': return this.col(2).mul(-1); case 'RightVector': return this.col(0); case 'UpVector': return this.col(1);
      case 'XVector': return this.col(0); case 'YVector': return this.col(1); case 'ZVector': return this.col(2);
      case 'Rotation': return new CFrame(0, 0, 0, this.R);
    }
    const m = CF_METHODS[k]; if (m) return m;
    R.rt(`${k} is not a valid member of CFrame`);
  }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to (CFrame values can't be changed; make a new one)`); }
}
function norm3(v) { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; }
const isCF = v => v instanceof CFrame;
const lookAt = (eye, target, up = new Vector3(0, 1, 0)) => {
  let f = target.sub(eye).unit(); if (!Number.isFinite(f.X)) f = new Vector3(0, 0, -1);
  let r = f.cross(up); if (r.mag < 1e-6) r = f.cross(new Vector3(0, 0, 1)); r = r.unit(); const u = r.cross(f);
  return new CFrame(eye.X, eye.Y, eye.Z, [r.X, u.X, -f.X, r.Y, u.Y, -f.Y, r.Z, u.Z, -f.Z]);
};
const CF_METHODS = {
  Inverse: method('CFrame', 'Inverse', isCF, s => [s.inverse()]),
  Lerp: method('CFrame', 'Lerp', isCF, (s, [o, t], R) => [s.lerp(o, num(R, t, 'Lerp'))]),
  ToWorldSpace: method('CFrame', 'ToWorldSpace', isCF, (s, [o]) => [s.mul(o)]),
  ToObjectSpace: method('CFrame', 'ToObjectSpace', isCF, (s, [o]) => [s.inverse().mul(o)]),
  PointToWorldSpace: method('CFrame', 'PointToWorldSpace', isCF, (s, [v]) => [s.point(v)]),
  PointToObjectSpace: method('CFrame', 'PointToObjectSpace', isCF, (s, [v]) => [s.inverse().point(v)]),
  VectorToWorldSpace: method('CFrame', 'VectorToWorldSpace', isCF, (s, [v]) => { const p = mat.vec(s.R, v.X, v.Y, v.Z); return [new Vector3(...p)]; }),
  ToEulerAnglesXYZ: method('CFrame', 'ToEulerAnglesXYZ', isCF, s => mat.toXYZ(s.R)),
  ToEulerAnglesYXZ: method('CFrame', 'ToEulerAnglesYXZ', isCF, s => mat.toYXZ(s.R)),
  ToOrientation: method('CFrame', 'ToOrientation', isCF, s => mat.toYXZ(s.R)),
  GetComponents: method('CFrame', 'GetComponents', isCF, s => [s.x, s.y, s.z, ...s.R]),
};

/* ---------------- UDim / UDim2 ---------------- */
class UDim { constructor(s = 0, o = 0) { this.Scale = s; this.Offset = o; } get __rbxType() { return 'UDim'; } luaEq(o) { return this.Scale === o.Scale && this.Offset === o.Offset; } luaToString() { return `${fmt(this.Scale)}, ${fmt(this.Offset)}`; } luaGet(k, R) { if (k === 'Scale') return this.Scale; if (k === 'Offset') return this.Offset; R.rt(`${k} is not a valid member of UDim`); } luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
  luaArith(op, a, b) { if (op === '__add') return new UDim(a.Scale + b.Scale, a.Offset + b.Offset); if (op === '__sub') return new UDim(a.Scale - b.Scale, a.Offset - b.Offset); throw new LuaError('attempt to perform arithmetic on UDim'); } }
class UDim2 {
  constructor(xs = 0, xo = 0, ys = 0, yo = 0) { this.X = new UDim(xs, xo); this.Y = new UDim(ys, yo); }
  get __rbxType() { return 'UDim2'; }
  luaEq(o) { return this.X.luaEq(o.X) && this.Y.luaEq(o.Y); }
  luaToString() { return `{${this.X.luaToString()}}, {${this.Y.luaToString()}}`; }
  lerp(o, t) { const L = (a, b) => a + (b - a) * t; return new UDim2(L(this.X.Scale, o.X.Scale), L(this.X.Offset, o.X.Offset), L(this.Y.Scale, o.Y.Scale), L(this.Y.Offset, o.Y.Offset)); }
  luaArith(op, a, b) { if (op === '__add') return new UDim2(a.X.Scale + b.X.Scale, a.X.Offset + b.X.Offset, a.Y.Scale + b.Y.Scale, a.Y.Offset + b.Y.Offset); if (op === '__sub') return new UDim2(a.X.Scale - b.X.Scale, a.X.Offset - b.X.Offset, a.Y.Scale - b.Y.Scale, a.Y.Offset - b.Y.Offset); throw new LuaError('attempt to perform arithmetic on UDim2'); }
  luaGet(k, R) { if (k === 'X' || k === 'Width') return this.X; if (k === 'Y' || k === 'Height') return this.Y; if (k === 'Lerp') return U2_LERP; R.rt(`${k} is not a valid member of UDim2`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
}
const U2_LERP = method('UDim2', 'Lerp', v => v instanceof UDim2, (s, [o, t]) => [s.lerp(o, t)]);

/* ---------------- TweenInfo ---------------- */
class TweenInfo {
  constructor(time = 1, style, dir, repeatCount = 0, reverses = false, delay = 0) { this.Time = time; this.EasingStyle = style || ENUM.get('EasingStyle', 'Quad'); this.EasingDirection = dir || ENUM.get('EasingDirection', 'Out'); this.RepeatCount = repeatCount; this.Reverses = reverses; this.DelayTime = delay; }
  get __rbxType() { return 'TweenInfo'; }
  luaToString() { return `Time:${fmt(this.Time)} DelayTime:${fmt(this.DelayTime)} RepeatCount:${this.RepeatCount} Reverses:${this.Reverses} EasingDirection:${this.EasingDirection.Name} EasingStyle:${this.EasingStyle.Name}`; }
  luaGet(k, R) { if (k in this) return this[k]; R.rt(`${k} is not a valid member of TweenInfo`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
}

/* ---------------- Enums ---------------- */
const ENUM_LISTS = {
  Material: 'Plastic SmoothPlastic Neon Wood WoodPlanks Marble Slate Concrete Granite Brick Pebble Cobblestone Rock Sandstone Basalt CrackedLava Asphalt LeafyGrass Salt Limestone Pavement CorrodedMetal DiamondPlate Foil Metal Grass Sand Fabric Ice Glacier Snow Mud Ground Glass ForceField Air Water Cardboard Carpet CeramicTiles ClayRoofTiles RoofShingles Leather Plaster Rubber',
  PartType: 'Ball Block Cylinder Wedge CornerWedge',
  EasingStyle: 'Linear Sine Back Quad Quart Quint Bounce Elastic Exponential Circular Cubic',
  EasingDirection: 'In Out InOut',
  PlaybackState: 'Begin Delayed Playing Paused Completed Cancelled',
  KeyCode: 'Unknown Backspace Tab Return Escape Space Zero One Two Three Four Five Six Seven Eight Nine A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Up Down Left Right LeftShift RightShift LeftControl RightControl LeftAlt F1 F2 F3 F4 ButtonA ButtonB ButtonX ButtonY',
  UserInputType: 'MouseButton1 MouseButton2 MouseButton3 MouseWheel MouseMovement Touch Keyboard Focus Gamepad1 None',
  UserInputState: 'Begin Change End Cancel None',
  HumanoidStateType: 'FallingDown Ragdoll GettingUp Jumping Swimming Freefall Flying Landed Running RunningNoPhysics StrafingNoPhysics Climbing Seated PlatformStanding Dead Physics None',
  Font: 'Legacy Arial ArialBold SourceSans SourceSansBold SourceSansLight SourceSansItalic Bodoni Garamond Cartoon Code Highway SciFi Arcade Fantasy Antique Gotham GothamMedium GothamBold GothamBlack AmaticSC Bangers Creepster DenkOne Fondamento FredokaOne GrenzeGotisch IndieFlower JosefinSans Jura Kalam LuckiestGuy Merriweather Michroma Nunito Oswald PatrickHand PermanentMarker Roboto RobotoCondensed RobotoMono Sarpanch SpecialElite TitilliumWeb Ubuntu BuilderSans BuilderSansMedium BuilderSansBold BuilderSansExtraBold',
  TextXAlignment: 'Left Center Right', TextYAlignment: 'Top Center Bottom',
  NormalId: 'Right Top Back Left Bottom Front',
  SurfaceType: 'Smooth Glue Weld Studs Inlet Universal Hinge Motor SteppingMotor SmoothNoOutlines',
  CoreGuiType: 'PlayerList Health Backpack Chat All EmotesMenu SelfView Captures',
  RaycastFilterType: 'Exclude Include Blacklist Whitelist',
  ZIndexBehavior: 'Global Sibling', SortOrder: 'LayoutOrder Name Custom', FillDirection: 'Horizontal Vertical',
  RigType: 'R6 R15', HumanoidRigType: 'R6 R15', AutomaticSize: 'None X Y XY', ScaleType: 'Stretch Slice Tile Fit Crop',
  ProximityPromptStyle: 'Default Custom', KeyboardKeyCode: '',
};
class EnumItem {
  constructor(type, name, value) { this.EnumType = type; this.Name = name; this.Value = value; }
  get __rbxType() { return 'EnumItem'; }
  luaToString() { return `Enum.${this.EnumType}.${this.Name}`; }
  luaGet(k, R) { if (k === 'Name') return this.Name; if (k === 'Value') return this.Value; if (k === 'EnumType') return ENUM.type(this.EnumType); if (k === 'IsA') return EI_ISA; R.rt(`${k} is not a valid member of "Enum.${this.EnumType}.${this.Name}"`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
}
const EI_ISA = method('EnumItem', 'IsA', v => v instanceof EnumItem, (s, [t]) => [s.EnumType === t]);
class EnumType {
  constructor(name) { this.name = name; this.items = new Map(); const list = (ENUM_LISTS[name] || '').split(' ').filter(Boolean); list.forEach((n, i) => this.items.set(n, new EnumItem(name, n, i))); this.strict = list.length > 0; }
  get __rbxType() { return 'Enum'; }
  luaToString() { return this.name; }
  luaGet(k, R) {
    if (k === 'GetEnumItems') return new NativeFn('GetEnumItems', () => [LuaTable.from([...this.items.values()])]);
    if (k === 'FromName') return new NativeFn('FromName', a => [this.items.get(a[1])]);
    let it = this.items.get(k);
    if (!it) { if (this.strict) R.rt(`${k} is not a valid member of "Enum.${this.name}"`); it = new EnumItem(this.name, k, this.items.size); this.items.set(k, it); }
    return it;
  }
  luaSet(k, v, R) { R.rt('cannot assign to Enum'); }
}
const ENUM = {
  types: new Map(),
  type(name) { if (!this.types.has(name)) this.types.set(name, new EnumType(name)); return this.types.get(name); },
  get(t, n) { return this.type(t).luaGet(n, { rt: m => { throw new LuaError(m); } }); },
};
const ENUMS_ROOT = { __rbxType: 'Enums', luaToString: () => 'Enums', luaGet(k) { return ENUM.type(k); }, luaSet(k, v, R) { R.rt('cannot assign to Enum'); } };
// accept EnumItem, its name, or its number
function toEnum(R, type, v, prop) {
  if (v instanceof EnumItem) { if (v.EnumType !== type) R.rt(`Unable to assign property ${prop}. Enum.${type} expected, got Enum.${v.EnumType}`); return v; }
  const T = ENUM.type(type);
  if (typeof v === 'string') { const it = T.items.get(v); if (!it) R.rt(`Unable to assign property ${prop}. "${v}" is not a valid Enum.${type}`); return it; }
  if (typeof v === 'number') { for (const it of T.items.values()) if (it.Value === v) return it; }
  R.rt(`Unable to assign property ${prop}. EnumItem expected, got ${luaTypeof(v)}`);
}

/* ---------------- Signals ---------------- */
class Connection {
  constructor(sig, fn, script) { this.sig = sig; this.fn = fn; this.script = script; this.Connected = true; }
  get __rbxType() { return 'RBXScriptConnection'; }
  luaToString() { return 'Connection'; }
  luaGet(k, R) { if (k === 'Connected') return this.Connected; if (k === 'Disconnect' || k === 'disconnect') return CONN_DISCONNECT; R.rt(`${k} is not a valid member of RBXScriptConnection`); }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
  disconnect() { if (!this.Connected) return; this.Connected = false; const i = this.sig.conns.indexOf(this); if (i >= 0) this.sig.conns.splice(i, 1); }
}
const CONN_DISCONNECT = method('RBXScriptConnection', 'Disconnect', v => v instanceof Connection, s => { s.disconnect(); return []; });
class Signal {
  constructor(W, name) { this.W = W; this.name = name; this.conns = []; this.waiters = []; }
  get __rbxType() { return 'RBXScriptSignal'; }
  luaToString() { return 'Signal ' + this.name; }
  luaGet(k, R) {
    switch (k) { case 'Connect': case 'connect': return SIG_CONNECT; case 'Once': return SIG_ONCE; case 'Wait': case 'wait': return SIG_WAIT; case 'ConnectParallel': return SIG_CONNECT; }
    R.rt(`${k} is not a valid member of RBXScriptSignal`);
  }
  luaSet(k, v, R) { R.rt(`${k} cannot be assigned to`); }
  connect(fn, once) { const R = this.W.R; const c = new Connection(this, fn, R.curThread && R.curThread.script); c.once = once; this.conns.push(c); return c; }
  fire(...args) {
    const W = this.W; if (W.stopped) return;
    for (const c of this.conns.slice()) {
      if (!c.Connected) continue;
      if (c.once) c.disconnect();
      if (typeof c.fn === 'function') { c.fn(...args); continue; }
      const th = W.S.spawn(c.fn, args, this.name, c.script);
      W.S.resume(th);
    }
    const ws = this.waiters; this.waiters = [];
    for (const th of ws) W.S.wakeWith(th, args);
  }
}
const isSig = v => v instanceof Signal;
const SIG_CONNECT = method('RBXScriptSignal', 'Connect', isSig, (s, [fn], R) => { if (!(fn instanceof LuaFn || fn instanceof NativeFn)) R.rt(`Attempt to connect failed: Passed value is not a function (got ${luaTypeof(fn)})`); return [s.connect(fn)]; });
const SIG_ONCE = method('RBXScriptSignal', 'Once', isSig, (s, [fn], R) => { if (!(fn instanceof LuaFn || fn instanceof NativeFn)) R.rt('Attempt to connect failed: Passed value is not a function'); return [s.connect(fn, true)]; });
const SIG_WAIT = method('RBXScriptSignal', 'Wait', isSig, function* (s) { const r = yield { type: 'signal', register: th => s.waiters.push(th) }; return r || []; });

/* ---------------- Instance class system ---------------- */
const CLS = {};
function defClass(name, base, def = {}) {
  CLS[name] = { name, baseName: base, base: base ? CLS[base] || null : null, props: def.props || {}, methods: {}, rawMethods: def.methods || {}, events: def.events || [], creatable: def.creatable !== false, init: def.init, service: def.service };
  return CLS[name];
}
function isA(cls, name) { for (let c = cls; c; c = c.base) if (c.name === name) return true; return false; }
function findProp(cls, k) { for (let c = cls; c; c = c.base) if (c.props[k]) return c.props[k]; return null; }
function findMethod(cls, k) {
  for (let c = cls; c; c = c.base) if (c.rawMethods[k]) {
    if (!c.methods[k]) c.methods[k] = method(c.name, k, v => v instanceof Instance && isA(v.cls, c.name), c.rawMethods[k]);
    return c.methods[k];
  }
  return null;
}
function hasEvent(cls, k) { for (let c = cls; c; c = c.base) if (c.events.includes(k)) return true; return false; }

let IID = 0;
class Instance {
  constructor(W, className) {
    this.W = W; this.cls = CLS[className]; this.ClassName = className; this.p = { Name: className }; this.children = []; this.parent = null; this.id = ++IID; this.sigs = {}; this.attrs = new Map(); this.tags = new Set(); this.destroyed = false; this.parentLocked = false;
    const chain = []; for (let c = this.cls; c; c = c.base) chain.unshift(c);
    for (const c of chain) for (const [k, d] of Object.entries(c.props)) if ('def' in d) this.p[k] = typeof d.def === 'function' ? d.def(this) : d.def;
    for (const c of chain) if (c.init) c.init(this);
    W.allInstances.add(this);
  }
  get __rbxType() { return 'Instance'; }
  get Name() { return this.p.Name; }
  isA(n) { return isA(this.cls, n); }
  sig(name) { return this.sigs[name] || (this.sigs[name] = new Signal(this.W, name)); }
  getFullName() { const parts = []; for (let i = this; i && i.ClassName !== 'DataModel'; i = i.parent) parts.unshift(i.p.Name); return parts.join('.'); }
  luaToString() { return this.p.Name; }
  luaGet(k, R) {
    if (typeof k !== 'string') R.rt(`invalid key to Instance (${luaTypeof(k)})`);
    const pd = findProp(this.cls, k);
    if (pd) { if (pd.client && !this.W.isClient(R)) return undefined; return pd.get ? pd.get(this, R) : this.p[k]; }
    if (k === 'Parent') return this.parent || undefined;
    const m = findMethod(this.cls, k); if (m) return m;
    if (hasEvent(this.cls, k)) return this.sig(k);
    const child = this.children.find(c => c.p.Name === k); if (child) return child;
    R.rt(`${k} is not a valid member of ${this.ClassName} "${this.getFullName()}"` + this.memberHint(k));
  }
  memberHint(k) {
    const lower = k.toLowerCase();
    for (let c = this.cls; c; c = c.base) {
      for (const n of [...Object.keys(c.props), ...Object.keys(c.rawMethods), ...c.events]) if (n.toLowerCase() === lower) return ` (did you mean ${n}? Names are case-sensitive)`;
    }
    if (this.children.length && this.isA('Instance')) return '';
    return '';
  }
  luaSet(k, v, R) {
    if (k === 'Parent') { this.setParent(v === undefined ? null : v, R); return; }
    const pd = findProp(this.cls, k);
    if (!pd) { if (findMethod(this.cls, k) || hasEvent(this.cls, k)) R.rt(`Unable to assign property ${k}. It is a ${findMethod(this.cls, k) ? 'method' : 'event'}, not a property`); R.rt(`${k} is not a valid member of ${this.ClassName} "${this.getFullName()}"` + this.memberHint(k)); }
    if (pd.ro) R.rt(`Unable to assign property ${k}. Property is read only`);
    v = checkType(R, pd.type, v, k);
    if (pd.set) pd.set(this, v, R); else this.p[k] = v;
    this.changed(k);
  }
  changed(k) {
    if (this.W.stopped) return;
    if (this.sigs.Changed) { if (this.isA('ValueBase')) { if (k === 'Value') this.sigs.Changed.fire(this.p.Value); } else this.sigs.Changed.fire(k); }
    const ps = this.propSigs && this.propSigs[k]; if (ps) ps.fire();
    this.W.dirty = true;
  }
  setRaw(k, v) { this.p[k] = v; this.changed(k); }
  setParent(np, R) {
    if (np !== null && !(np instanceof Instance)) R.rt(`Unable to assign property Parent. Instance expected, got ${luaTypeof(np)}`);
    if (this.parentLocked) R.rt(`The Parent property of ${this.p.Name} is locked, current parent: NULL, new parent ${np ? np.p.Name : 'NULL'}`);
    if (np === this.parent) return;
    for (let a = np; a; a = a.parent) if (a === this) R.rt(`Attempt to set ${this.getFullName()} as its own parent`);
    if (this.ClassName === 'DataModel' || (this.cls.service && this.parent)) R.rt(`The Parent property of ${this.p.Name} is locked`);
    const old = this.parent;
    if (old) { old.children.splice(old.children.indexOf(this), 1); this.W.onRemoved(this, old); old.sigs.ChildRemoved && old.sigs.ChildRemoved.fire(this); for (let a = old; a; a = a.parent) a.sigs.DescendantRemoving && a.sigs.DescendantRemoving.fire(this); }
    this.parent = np;
    if (np) { np.children.push(this); this.W.onAdded(this, np); np.sigs.ChildAdded && np.sigs.ChildAdded.fire(this); for (let a = np; a; a = a.parent) a.sigs.DescendantAdded && a.sigs.DescendantAdded.fire(this); }
    this.sigs.AncestryChanged && this.sigs.AncestryChanged.fire(this, np || undefined);
    this.changed('Parent');
  }
  descendants() { const out = []; const rec = i => { for (const c of i.children) { out.push(c); rec(c); } }; rec(this); return out; }
  destroy(R) {
    if (this.destroyed) return;
    this.sigs.Destroying && this.sigs.Destroying.fire();
    for (const c of this.children.slice()) c.destroy(R);
    if (this.parent) this.setParent(null, R);
    this.parentLocked = true; this.destroyed = true;
    for (const s of Object.values(this.sigs)) s.conns.slice().forEach(c => c.disconnect());
    this.W.allInstances.delete(this);
  }
  clone(R) {
    if (this.cls.service || this.ClassName === 'Player' || this.ClassName === 'DataModel') return undefined;
    const c = new Instance(this.W, this.ClassName);
    for (const k in this.p) { const v = this.p[k]; c.p[k] = v instanceof LuaTable ? v : v; }
    c.attrs = new Map(this.attrs); c.tags = new Set(this.tags);
    if (this.scriptSource !== undefined) { c.scriptSource = this.scriptSource; c.scriptKind = this.scriptKind; }
    for (const ch of this.children) { const cc = ch.clone(R); if (cc) cc.setParent(c, R); }
    if (this.cloneHook) this.cloneHook(c);
    return c;
  }
}

function checkType(R, type, v, k) {
  const bad = exp => R.rt(`Unable to assign property ${k}. ${exp} expected, got ${v === undefined ? 'nil' : luaTypeof(v)}`);
  if (!type) return v;
  if (type === 'string') { if (typeof v === 'number') return fmtNum(v); if (typeof v !== 'string') bad('string'); return v; }
  if (type === 'number') { const n = R.tonum(v); if (n === undefined) bad('number'); return n; }
  if (type === 'int') { const n = R.tonum(v); if (n === undefined) bad('number'); return n < 0 ? Math.ceil(n) : Math.floor(n); }
  if (type === 'boolean') { if (typeof v !== 'boolean') bad('bool'); return v; }
  if (type === 'Vector3') { if (!(v instanceof Vector3)) bad('Vector3'); return v; }
  if (type === 'Vector2') { if (!(v instanceof Vector2)) bad('Vector2'); return v; }
  if (type === 'Color3') { if (!(v instanceof Color3)) bad(v instanceof BrickColor ? 'Color3 (use BrickColor property, or .Color)' : 'Color3'); return v; }
  if (type === 'BrickColor') { if (!(v instanceof BrickColor)) bad(v instanceof Color3 ? 'BrickColor (use the Color property for Color3)' : 'BrickColor'); return v; }
  if (type === 'CFrame') { if (!(v instanceof CFrame)) bad('CFrame'); return v; }
  if (type === 'UDim2') { if (!(v instanceof UDim2)) bad('UDim2'); return v; }
  if (type === 'UDim') { if (!(v instanceof UDim)) bad('UDim'); return v; }
  if (type === 'Instance?') { if (v !== undefined && !(v instanceof Instance)) bad('Instance'); return v; }
  if (type === 'function?') { if (v !== undefined && !(v instanceof LuaFn || v instanceof NativeFn)) bad('function'); return v; }
  if (type === 'any') return v;
  if (type.startsWith('Enum.')) return toEnum(R, type.slice(5), v, k);
  return v;
}

/* ---------------- Class definitions ---------------- */
const P = (type, def, extra) => Object.assign(def === undefined ? { type } : { type, def }, extra || {});
defClass('Instance', null, {
  props: { Name: P('string'), ClassName: { ro: true, get: i => i.ClassName }, Archivable: P('boolean', true) },
  events: ['Changed', 'ChildAdded', 'ChildRemoved', 'DescendantAdded', 'DescendantRemoving', 'Destroying', 'AncestryChanged', 'AttributeChanged'],
  creatable: false,
  methods: {
    FindFirstChild(s, [name, recursive]) { const list = truthy(recursive) ? s.descendants() : s.children; return [list.find(c => c.p.Name === name)]; },
    FindFirstChildOfClass(s, [cn]) { return [s.children.find(c => c.ClassName === cn)]; },
    FindFirstChildWhichIsA(s, [cn, rec]) { const list = truthy(rec) ? s.descendants() : s.children; return [list.find(c => c.isA(cn))]; },
    FindFirstAncestor(s, [n]) { for (let a = s.parent; a; a = a.parent) if (a.p.Name === n) return [a]; return [undefined]; },
    FindFirstAncestorOfClass(s, [n]) { for (let a = s.parent; a; a = a.parent) if (a.ClassName === n) return [a]; return [undefined]; },
    FindFirstAncestorWhichIsA(s, [n]) { for (let a = s.parent; a; a = a.parent) if (a.isA(n)) return [a]; return [undefined]; },
    FindFirstDescendant(s, [n]) { return [s.descendants().find(c => c.p.Name === n)]; },
    *WaitForChild(s, [name, timeout]) {
      const R = s.W.R; let c = s.children.find(x => x.p.Name === name); if (c) return [c];
      const start = s.W.S.now; let warned = false;
      while (true) {
        yield { type: 'wait', t: 1 / 30 };
        c = s.children.find(x => x.p.Name === name); if (c) return [c];
        if (timeout !== undefined && s.W.S.now - start >= timeout) return [undefined];
        if (!warned && timeout === undefined && s.W.S.now - start > 5) { warned = true; s.W.out('warn', `Infinite yield possible on '${s.getFullName()}:WaitForChild("${name}")'`); }
      }
    },
    GetChildren(s) { return [LuaTable.from(s.children.slice())]; },
    GetDescendants(s) { return [LuaTable.from(s.descendants())]; },
    IsA(s, [n]) { return [s.isA(n)]; },
    IsDescendantOf(s, [a]) { for (let x = s.parent; x; x = x.parent) if (x === a) return [true]; return [false]; },
    IsAncestorOf(s, [d]) { for (let x = d && d.parent; x; x = x.parent) if (x === s) return [true]; return [false]; },
    Destroy(s, a, R) { if (s.cls.service || s.ClassName === 'DataModel') R.rt(`Cannot destroy ${s.ClassName}`); if (s.ClassName === 'Player') R.rt('Cannot destroy a Player. Use player:Kick() instead.'); s.destroy(R); return []; },
    Remove(s, a, R) { s.setParent(null, R); return []; },
    Clone(s, a, R) { return [s.clone(R)]; },
    ClearAllChildren(s, a, R) { for (const c of s.children.slice()) c.destroy(R); return []; },
    GetFullName(s) { return [s.getFullName()]; },
    GetAttribute(s, [k]) { return [s.attrs.get(k)]; },
    SetAttribute(s, [k, v], R) { if (typeof k !== 'string') R.rt('Attribute name must be a string'); if (v !== undefined && !['number', 'string', 'boolean'].includes(typeof v) && !(v instanceof Vector3 || v instanceof Color3 || v instanceof BrickColor || v instanceof UDim2 || v instanceof CFrame)) R.rt(`${luaTypeof(v)} is not a supported attribute type`); if (v === undefined) s.attrs.delete(k); else s.attrs.set(k, v); s.sigs.AttributeChanged && s.sigs.AttributeChanged.fire(k); s.attrSigs && s.attrSigs[k] && s.attrSigs[k].fire(); return []; },
    GetAttributes(s) { const t = new LuaTable(); for (const [k, v] of s.attrs) t.set(k, v); return [t]; },
    GetAttributeChangedSignal(s, [k]) { s.attrSigs = s.attrSigs || {}; return [s.attrSigs[k] || (s.attrSigs[k] = new Signal(s.W, 'AttributeChanged:' + k))]; },
    GetPropertyChangedSignal(s, [k], R) { if (!findProp(s.cls, k) && k !== 'Parent') R.rt(`${k} is not a valid property name.`); s.propSigs = s.propSigs || {}; return [s.propSigs[k] || (s.propSigs[k] = new Signal(s.W, 'Changed:' + k))]; },
    AddTag(s, [t]) { s.tags.add(t); s.W.tagAdded(s, t); return []; },
    RemoveTag(s, [t]) { s.tags.delete(t); return []; },
    HasTag(s, [t]) { return [s.tags.has(t)]; },
    GetTags(s) { return [LuaTable.from([...s.tags])]; },
  },
});
defClass('DataModel', 'Instance', {
  creatable: false,
  props: { Workspace: { ro: true, get: i => i.W.workspace }, PlaceId: { ro: true, get: () => 0 }, GameId: { ro: true, get: () => 0 }, JobId: { ro: true, get: () => '' }, CreatorId: { ro: true, get: () => 0 } },
  methods: {
    GetService(s, [n], R) { const sv = s.W.services[n]; if (!sv) R.rt(`'${n}' is not a valid Service name` + (s.W.services[n + 's'] ? ` (did you mean "${n}s"?)` : '')); return [sv]; },
    FindService(s, [n]) { return [s.W.services[n]]; },
    BindToClose(s, [fn]) { s.W.closeHandlers.push(fn); return []; },
    IsLoaded() { return [true]; },
  },
  events: ['Loaded'],
});
const svc = (name, def = {}) => defClass(name, def.base || 'Instance', Object.assign({ creatable: false, service: true }, def));
svc('Workspace', {
  base: 'Model',
  props: { Gravity: P('number', 196.2), FallenPartsDestroyHeight: P('number', -100), CurrentCamera: { ro: true, get: () => undefined }, DistributedGameTime: { ro: true, get: i => i.W.S.now } },
  methods: {
    GetServerTimeNow(s) { return [Date.now() / 1000]; },
    Raycast(s, [origin, dir, params]) { const h = s.W.raycast(origin, dir, params); return [h]; },
    GetPartBoundsInBox(s, [cf, size]) { const lo = cf.pos.sub(size.mul(0.5)), hi = cf.pos.add(size.mul(0.5)); return [LuaTable.from(s.W.parts().filter(p => { const b = s.W.aabb(p); return b.max.X > lo.X && b.min.X < hi.X && b.max.Y > lo.Y && b.min.Y < hi.Y && b.max.Z > lo.Z && b.min.Z < hi.Z; }))]; },
  },
});
svc('Players', {
  props: {
    LocalPlayer: { ro: true, get: (i, R) => i.W.isClient(R) ? i.W.player || undefined : undefined },
    RespawnTime: P('number', 3), MaxPlayers: { ro: true, get: () => 1 }, CharacterAutoLoads: P('boolean', true),
  },
  events: ['PlayerAdded', 'PlayerRemoving'],
  methods: {
    GetPlayers(s) { return [LuaTable.from(s.children.filter(c => c.ClassName === 'Player'))]; },
    GetPlayerFromCharacter(s, [ch]) { const p = s.children.find(c => c.ClassName === 'Player' && c.p.Character === ch && ch); return [p]; },
    GetPlayerByUserId(s, [id]) { return [s.children.find(c => c.ClassName === 'Player' && c.p.UserId === id)]; },
  },
});
['ReplicatedStorage', 'ServerScriptService', 'ServerStorage', 'StarterGui', 'StarterPack', 'SoundService', 'Teams', 'Chat', 'TextChatService', 'MarketplaceService', 'HttpService', 'PathfindingService', 'ReplicatedFirst'].forEach(n => svc(n));
svc('StarterPlayer', { props: { CharacterWalkSpeed: P('number', 16), CharacterJumpPower: P('number', 50) } });
defClass('StarterPlayerScripts', 'Instance', { creatable: false }); defClass('StarterCharacterScripts', 'Instance', { creatable: false });
defClass('PlayerScripts', 'Instance', { creatable: false }); defClass('PlayerGui', 'Instance', { creatable: false }); defClass('Backpack', 'Instance', { creatable: false });
svc('Lighting', {
  props: {
    ClockTime: P('number', 14, { set: (i, v) => { i.p.ClockTime = ((v % 24) + 24) % 24; } }),
    TimeOfDay: { type: 'string', get: i => { const t = i.p.ClockTime; const h = Math.floor(t), m = Math.floor((t - h) * 60), sec = Math.floor(((t - h) * 60 - m) * 60); return [h, m, sec].map(x => String(x).padStart(2, '0')).join(':'); }, set: (i, v) => { const [h, m, s] = String(v).split(':').map(Number); i.p.ClockTime = (h || 0) + (m || 0) / 60 + (s || 0) / 3600; } },
    Brightness: P('number', 2), Ambient: P('Color3', () => new Color3(0.27, 0.27, 0.27)), OutdoorAmbient: P('Color3', () => new Color3(0.5, 0.5, 0.5)),
    FogEnd: P('number', 100000), FogStart: P('number', 0), FogColor: P('Color3', () => new Color3(0.75, 0.75, 0.75)), GlobalShadows: P('boolean', true),
  },
  methods: { GetMinutesAfterMidnight(s) { return [s.p.ClockTime * 60]; }, SetMinutesAfterMidnight(s, [m]) { s.p.ClockTime = (((m / 60) % 24) + 24) % 24; s.changed('ClockTime'); return []; } },
});
svc('RunService', {
  events: ['Heartbeat', 'Stepped', 'RenderStepped', 'PreSimulation', 'PostSimulation'],
  methods: { IsServer(s, a, R) { return [!s.W.isClient(R)]; }, IsClient(s, a, R) { return [s.W.isClient(R)]; }, IsStudio() { return [true]; }, IsRunning() { return [true]; }, BindToRenderStep(s, [n, p, fn]) { s.sig('RenderStepped').connect(fn); return []; } },
});
svc('Debris', { methods: { AddItem(s, [inst, t], R) { const W = s.W; W.S.spawn(new NativeFn('Debris', () => { if (inst && !inst.destroyed) inst.destroy(R); return []; }), [], 'Debris', null, t === undefined ? 10 : t); return []; } } });
svc('CollectionService', {
  methods: {
    AddTag(s, [i, t]) { i.tags.add(t); s.W.tagAdded(i, t); return []; }, RemoveTag(s, [i, t]) { i.tags.delete(t); return []; }, HasTag(s, [i, t]) { return [i.tags.has(t)]; },
    GetTagged(s, [t]) { return [LuaTable.from([...s.W.allInstances].filter(i => i.tags.has(t) && !i.destroyed && i.parent))]; }, GetTags(s, [i]) { return [LuaTable.from([...i.tags])]; },
    GetInstanceAddedSignal(s, [t]) { s.W.tagSigs[t] = s.W.tagSigs[t] || new Signal(s.W, 'TagAdded'); return [s.W.tagSigs[t]]; },
    GetInstanceRemovedSignal(s, [t]) { return [new Signal(s.W, 'TagRemoved')]; },
  },
});
svc('UserInputService', {
  props: { TouchEnabled: { ro: true, get: () => false }, KeyboardEnabled: { ro: true, get: () => true }, MouseEnabled: { ro: true, get: () => true }, GamepadEnabled: { ro: true, get: () => false } },
  events: ['InputBegan', 'InputEnded', 'InputChanged', 'JumpRequest', 'TouchTap'],
  methods: { IsKeyDown(s, [k]) { return [!!(k && s.W.keysDown.has(k.Name))]; }, GetMouseLocation(s) { return [new Vector2(s.W.mouse.x, s.W.mouse.y)]; } },
});
svc('TweenService', {
  methods: {
    Create(s, [inst, info, goals], R) {
      if (!(inst instanceof Instance)) R.rt('TweenService:Create() argument #1 must be an Instance');
      if (!(info instanceof TweenInfo)) R.rt('TweenService:Create() argument #2 must be a TweenInfo (use TweenInfo.new(seconds))');
      if (!(goals instanceof LuaTable)) R.rt('TweenService:Create() argument #3 must be a table of properties, like {Position = Vector3.new(0, 10, 0)}');
      const props = [];
      for (const [k, v] of goals.entries()) { const pd = findProp(inst.cls, k); if (!pd) R.rt(`TweenService:Create property named '${k}' cannot be tweened due to type mismatch (property is not a valid member of ${inst.ClassName})`); props.push([k, checkType(R, pd.type, v, k)]); }
      const tw = new Instance(s.W, 'Tween'); tw.p.Name = 'Tween'; tw.tw = { inst, info, props, t: 0, from: null, state: 'Begin', rep: 0, back: false };
      return [tw];
    },
    GetValue(s, [alpha, style, dir]) { return [ease(style.Name, dir.Name, alpha)]; },
  },
});
defClass('Tween', 'Instance', {
  creatable: false,
  props: { PlaybackState: { ro: true, get: i => ENUM.get('PlaybackState', i.tw.state) }, Instance: { ro: true, get: i => i.tw.inst }, TweenInfo: { ro: true, get: i => i.tw.info } },
  events: ['Completed'],
  methods: {
    Play(s) { const tw = s.tw; if (tw.state === 'Playing') return []; if (tw.state !== 'Paused') { tw.t = -tw.info.DelayTime; tw.from = null; tw.rep = 0; tw.back = false; } tw.state = 'Playing'; s.W.tweens.add(s); return []; },
    Pause(s) { if (s.tw.state === 'Playing') s.tw.state = 'Paused'; return []; },
    Cancel(s) { s.tw.state = 'Cancelled'; s.W.tweens.delete(s); s.sig('Completed').fire(ENUM.get('PlaybackState', 'Cancelled')); return []; },
  },
});
svc('DataStoreService', {
  methods: {
    GetDataStore(s, [name, scope]) { const ds = new Instance(s.W, 'DataStore'); ds.p.Name = String(name); ds.storeKey = String(name) + '/' + (scope || 'global'); return [ds]; },
    GetOrderedDataStore(s, [name]) { const ds = new Instance(s.W, 'OrderedDataStore'); ds.p.Name = String(name); ds.storeKey = 'ordered:' + name; return [ds]; },
    GetGlobalDataStore(s) { const ds = new Instance(s.W, 'DataStore'); ds.p.Name = 'GlobalDataStore'; ds.storeKey = 'global'; return [ds]; },
  },
});
const dsDelay = function* (W) { yield { type: 'wait', t: 0.15 }; if (W.dsFail) throw new LuaError('502: API Services rejected request (simulated failure)'); };
const dsMethods = {
  *GetAsync(s, [key], R) { yield* dsDelay(s.W); return [fromJSON(s.W.dsGet(s.storeKey, keyStr(R, key)))]; },
  *SetAsync(s, [key, value], R) { yield* dsDelay(s.W); s.W.dsSet(s.storeKey, keyStr(R, key), toJSON(R, value)); return []; },
  *UpdateAsync(s, [key, fn], R) { yield* dsDelay(s.W); const k = keyStr(R, key); const old = fromJSON(s.W.dsGet(s.storeKey, k)); const r = yield* R.call(fn, [old]); if (r[0] !== undefined) s.W.dsSet(s.storeKey, k, toJSON(R, r[0])); return [r[0]]; },
  *IncrementAsync(s, [key, delta], R) { yield* dsDelay(s.W); const k = keyStr(R, key); const v = (fromJSON(s.W.dsGet(s.storeKey, k)) || 0) + (delta === undefined ? 1 : delta); s.W.dsSet(s.storeKey, k, v); return [v]; },
  *RemoveAsync(s, [key], R) { yield* dsDelay(s.W); const k = keyStr(R, key); const old = fromJSON(s.W.dsGet(s.storeKey, k)); s.W.dsSet(s.storeKey, k, undefined); return [old]; },
};
defClass('DataStore', 'Instance', { creatable: false, methods: dsMethods });
defClass('OrderedDataStore', 'Instance', { creatable: false, methods: Object.assign({}, dsMethods, {
  *GetSortedAsync(s, [asc, size], R) { yield* dsDelay(s.W); const all = s.W.dsAll(s.storeKey).sort((a, b) => truthy(asc) ? a[1] - b[1] : b[1] - a[1]).slice(0, size || 10); const page = LuaTable.from(all.map(([k, v]) => LuaTable.dict({ key: k, value: v }))); const pages = new Instance(s.W, 'DataStorePages'); pages.page = page; return [pages]; },
}) });
defClass('DataStorePages', 'Instance', { creatable: false, props: { IsFinished: { ro: true, get: () => true } }, methods: { GetCurrentPage(s) { return [s.page]; }, *AdvanceToNextPageAsync() { return []; } } });
const keyStr = (R, k) => { if (typeof k === 'number') return fmtNum(k); if (typeof k !== 'string') R.rt('DataStore key must be a string'); if (k.length > 50) R.rt('DataStore key is too long (50 characters max)'); return k; };
function toJSON(R, v, depth = 0) {
  if (depth > 20) R.rt('Cannot store a table nested this deep');
  if (v === undefined || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
  if (v instanceof LuaTable) { const n = v.length(); const isArr = v.hash.size === 0; if (isArr) return { __arr: v.arr.slice(0, n).map(x => toJSON(R, x, depth + 1)) }; const o = {}; for (const [k, x] of v.entries()) { if (typeof k !== 'string' && typeof k !== 'number') R.rt('DataStore tables can only have string or number keys'); o[String(k)] = toJSON(R, x, depth + 1); } return { __obj: o }; }
  R.rt(`Cannot store ${luaTypeof(v)} in a DataStore. Only numbers, strings, booleans and tables of those can be saved` + (v instanceof Instance ? ' (save the .Value instead of the Instance)' : ''));
}
function fromJSON(v) {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'object') return v;
  if (v.__arr) return LuaTable.from(v.__arr.map(fromJSON));
  const t = new LuaTable(); for (const k in v.__obj) t.set(/^\d+$/.test(k) ? +k : k, fromJSON(v.__obj[k])); return t;
}

// ---- 3D parts ----
const shapeOf = p => p.ClassName === 'WedgePart' ? 'Wedge' : p.p.Shape ? p.p.Shape.Name : 'Block';
defClass('PVInstance', 'Instance', { creatable: false });
defClass('BasePart', 'PVInstance', {
  creatable: false,
  init: i => { i.cf = new CFrame(0, 0, 0); i.vel = new Vector3(); i.W.partsDirty = true; },
  props: {
    Position: { type: 'Vector3', get: i => i.cf.pos, set: (i, v) => { i.cf = new CFrame(v.X, v.Y, v.Z, i.cf.R); i.W.movedPart(i); } },
    CFrame: { type: 'CFrame', get: i => i.cf, set: (i, v) => { i.cf = v; i.W.movedPart(i); } },
    Orientation: { type: 'Vector3', get: i => { const [x, y, z] = mat.toYXZ(i.cf.R); return new Vector3(deg(x), deg(y), deg(z)); }, set: (i, v) => { i.cf = new CFrame(i.cf.x, i.cf.y, i.cf.z, mat.yxz(rad(v.X), rad(v.Y), rad(v.Z))); i.W.movedPart(i); } },
    Rotation: { type: 'Vector3', get: i => { const [x, y, z] = mat.toXYZ(i.cf.R); return new Vector3(deg(x), deg(y), deg(z)); }, set: (i, v) => { i.cf = new CFrame(i.cf.x, i.cf.y, i.cf.z, mat.xyz(rad(v.X), rad(v.Y), rad(v.Z))); } },
    Size: P('Vector3', () => new Vector3(4, 1, 2), { set: (i, v) => { i.p.Size = new Vector3(Math.max(0.001, Math.abs(v.X)), Math.max(0.001, Math.abs(v.Y)), Math.max(0.001, Math.abs(v.Z))); if (i.p.Shape && i.p.Shape.Name === 'Ball') { const m = Math.min(i.p.Size.X, i.p.Size.Y, i.p.Size.Z); i.p.Size = new Vector3(m, m, m); } } }),
    Color: P('Color3', () => new Color3(163 / 255, 162 / 255, 165 / 255)),
    BrickColor: { type: 'BrickColor', get: i => BrickColor.closest(i.p.Color), set: (i, v) => { i.p.Color = v.Color; } },
    Transparency: P('number', 0), Reflectance: P('number', 0),
    Anchored: P('boolean', false, { set: (i, v) => { i.p.Anchored = v; if (v) i.vel = new Vector3(); } }),
    CanCollide: P('boolean', true), CanTouch: P('boolean', true), CanQuery: P('boolean', true), CastShadow: P('boolean', true), Locked: P('boolean', false), Massless: P('boolean', false),
    Material: P('Enum.Material', () => ENUM.get('Material', 'Plastic')),
    AssemblyLinearVelocity: { type: 'Vector3', get: i => i.vel, set: (i, v) => { i.vel = v; } },
    Velocity: { type: 'Vector3', get: i => i.vel, set: (i, v) => { i.vel = v; } },
    AssemblyAngularVelocity: P('Vector3', () => new Vector3()),
    Mass: { ro: true, get: i => i.p.Size.X * i.p.Size.Y * i.p.Size.Z * 0.7 },
    TopSurface: P('Enum.SurfaceType', () => ENUM.get('SurfaceType', 'Smooth')), BottomSurface: P('Enum.SurfaceType', () => ENUM.get('SurfaceType', 'Smooth')),
  },
  events: ['Touched', 'TouchEnded'],
  methods: {
    GetMass(s) { return [s.p.Size.X * s.p.Size.Y * s.p.Size.Z * 0.7]; },
    GetTouchingParts(s) { return [LuaTable.from([...s.W.contactsOf(s)])]; },
    ApplyImpulse(s, [v]) { const m = s.p.Size.X * s.p.Size.Y * s.p.Size.Z * 0.7; s.vel = s.vel.add(v.mul(1 / m)); return []; },
    PivotTo(s, [cf]) { s.cf = cf; s.W.movedPart(s); return []; },
    GetPivot(s) { return [s.cf]; },
    BreakJoints() { return []; }, MakeJoints() { return []; },
    SetNetworkOwner() { return []; }, GetNetworkOwner() { return [undefined]; },
  },
});
defClass('Part', 'BasePart', { props: { Shape: P('Enum.PartType', () => ENUM.get('PartType', 'Block'), { set: (i, v) => { i.p.Shape = v; if (v.Name === 'Ball') { const m = Math.min(i.p.Size.X, i.p.Size.Y, i.p.Size.Z); i.p.Size = new Vector3(m, m, m); } } }) } });
defClass('WedgePart', 'BasePart');
defClass('TrussPart', 'BasePart', { init: i => { i.p.Size = new Vector3(2, 10, 2); } });
defClass('MeshPart', 'BasePart', { props: { MeshId: P('string', '') } });
defClass('SpawnLocation', 'Part', { props: { Enabled: P('boolean', true), Neutral: P('boolean', true), Duration: P('number', 0) }, init: i => { i.p.Size = new Vector3(12, 1, 12); i.p.Anchored = true; } });
defClass('Model', 'PVInstance', {
  props: { PrimaryPart: P('Instance?', undefined), WorldPivot: { type: 'CFrame', get: i => i.pivot() } },
  methods: {
    MoveTo(s, [pos]) { const pv = s.pivot(); s.shift(pos.sub(pv.pos).add(new Vector3(0, s.bboxHalfHeight(), 0))); return []; },
    PivotTo(s, [cf]) { const pv = s.pivot(); const delta = cf.mul(pv.inverse()); for (const p of s.descendants().filter(d => d.isA('BasePart'))) { p.cf = delta.mul(p.cf); s.W.movedPart(p); } return []; },
    GetPivot(s) { return [s.pivot()]; },
    SetPrimaryPartCFrame(s, [cf]) { const m = findMethod(s.cls, 'PivotTo'); return m.fn.call(s.W.R, [s, cf]); },
    GetBoundingBox(s) { const b = s.W.bboxOf(s.descendants().filter(d => d.isA('BasePart'))); if (!b) return [new CFrame(), new Vector3()]; return [new CFrame((b.min.X + b.max.X) / 2, (b.min.Y + b.max.Y) / 2, (b.min.Z + b.max.Z) / 2), b.max.sub(b.min)]; },
    GetExtentsSize(s) { const b = s.W.bboxOf(s.descendants().filter(d => d.isA('BasePart'))); return [b ? b.max.sub(b.min) : new Vector3()]; },
    BreakJoints() { return []; },
  },
});
Instance.prototype.pivot = function () { if (this.p.PrimaryPart) return this.p.PrimaryPart.cf; const b = this.W.bboxOf(this.descendants().filter(d => d.isA('BasePart'))); return b ? new CFrame((b.min.X + b.max.X) / 2, (b.min.Y + b.max.Y) / 2, (b.min.Z + b.max.Z) / 2) : new CFrame(); };
Instance.prototype.shift = function (d) { for (const p of this.descendants().filter(x => x.isA('BasePart'))) { p.cf = new CFrame(p.cf.x + d.X, p.cf.y + d.Y, p.cf.z + d.Z, p.cf.R); this.W.movedPart(p); } };
Instance.prototype.bboxHalfHeight = function () { const b = this.W.bboxOf(this.descendants().filter(d => d.isA('BasePart'))); return b ? (b.max.Y - b.min.Y) / 2 : 0; };
defClass('Folder', 'Instance'); defClass('Configuration', 'Instance');
defClass('ValueBase', 'Instance', { creatable: false });
defClass('IntValue', 'ValueBase', { props: { Value: P('int', 0) } });
defClass('NumberValue', 'ValueBase', { props: { Value: P('number', 0) } });
defClass('StringValue', 'ValueBase', { props: { Value: P('string', '') } });
defClass('BoolValue', 'ValueBase', { props: { Value: P('boolean', false) } });
defClass('ObjectValue', 'ValueBase', { props: { Value: P('Instance?', undefined) } });
defClass('Vector3Value', 'ValueBase', { props: { Value: P('Vector3', () => new Vector3()) } });
defClass('Color3Value', 'ValueBase', { props: { Value: P('Color3', () => new Color3()) } });
defClass('CFrameValue', 'ValueBase', { props: { Value: P('CFrame', () => new CFrame()) } });

defClass('ClickDetector', 'Instance', { props: { MaxActivationDistance: P('number', 32), CursorIcon: P('string', '') }, events: ['MouseClick', 'RightMouseClick', 'MouseHoverEnter', 'MouseHoverLeave'] });
defClass('ProximityPrompt', 'Instance', {
  props: { ActionText: P('string', 'Interact'), ObjectText: P('string', ''), HoldDuration: P('number', 0), MaxActivationDistance: P('number', 10), Enabled: P('boolean', true), KeyboardKeyCode: P('Enum.KeyCode', () => ENUM.get('KeyCode', 'E')), RequiresLineOfSight: P('boolean', true), Style: P('Enum.ProximityPromptStyle', () => ENUM.get('ProximityPromptStyle', 'Default')) },
  events: ['Triggered', 'TriggerEnded', 'PromptShown', 'PromptHidden', 'PromptButtonHoldBegan', 'PromptButtonHoldEnded'],
  methods: { InputHoldBegin() { return []; }, InputHoldEnd() { return []; } },
});
defClass('Humanoid', 'Instance', {
  props: {
    Health: P('number', 100, { set: (i, v) => { const old = i.p.Health; i.p.Health = Math.max(0, Math.min(i.p.MaxHealth, v)); if (i.p.Health !== old) { i.sig('HealthChanged').fire(i.p.Health); if (i.p.Health <= 0 && !i.dead) i.W.killHumanoid(i); } } }),
    MaxHealth: P('number', 100), WalkSpeed: P('number', 16), JumpPower: P('number', 50), JumpHeight: P('number', 7.2), UseJumpPower: P('boolean', true),
    DisplayName: P('string', ''), HipHeight: P('number', 0), AutoRotate: P('boolean', true), Sit: P('boolean', false), PlatformStand: P('boolean', false),
    Jump: { type: 'boolean', get: i => !!i.jumpReq, set: (i, v) => { i.jumpReq = v; } },
    MoveDirection: { ro: true, get: i => i.moveDir || new Vector3() },
    FloorMaterial: { ro: true, get: i => i.floor ? i.floor.p.Material : ENUM.get('Material', 'Air') },
    RootPart: { ro: true, get: i => i.parent && i.parent.children.find(c => c.p.Name === 'HumanoidRootPart') },
    RigType: { ro: true, get: () => ENUM.get('HumanoidRigType', 'R6') },
    WalkToPoint: P('Vector3', () => new Vector3()),
  },
  events: ['Died', 'HealthChanged', 'Jumping', 'Running', 'Touched', 'StateChanged', 'MoveToFinished', 'FreeFalling', 'Seated'],
  methods: {
    TakeDamage(s, [n], R) { if (s.parent && s.parent.children.some(c => c.ClassName === 'ForceField')) return []; s.W.R.setindex(s, 'Health', s.p.Health - num(R, n, 'TakeDamage')); return []; },
    MoveTo(s, [pos, part]) { s.moveTarget = pos; return []; },
    Move(s, [dir]) { s.scriptMove = dir; return []; },
    GetState(s) { return [ENUM.get('HumanoidStateType', s.dead ? 'Dead' : s.grounded ? 'Running' : 'Freefall')]; },
    ChangeState(s, [st]) { if (st && st.Name === 'Jumping') s.jumpReq = true; if (st && st.Name === 'Dead') s.W.R.setindex(s, 'Health', 0); return []; },
    SetStateEnabled() { return []; },
    LoadAnimation(s) { const a = new Instance(s.W, 'AnimationTrack'); return [a]; },
    EquipTool() { return []; }, UnequipTools() { return []; },
  },
});
defClass('Animator', 'Instance'); defClass('Animation', 'Instance', { props: { AnimationId: P('string', '') } });
defClass('AnimationTrack', 'Instance', { creatable: false, props: { IsPlaying: P('boolean', false), Length: { ro: true, get: () => 1 } }, events: ['Stopped', 'Ended'], methods: { Play(s) { s.p.IsPlaying = true; return []; }, Stop(s) { s.p.IsPlaying = false; return []; }, AdjustSpeed() { return []; } } });
defClass('ForceField', 'Instance', { props: { Visible: P('boolean', true) } });
defClass('Sound', 'Instance', {
  props: { SoundId: P('string', ''), Volume: P('number', 0.5), Looped: P('boolean', false), Playing: P('boolean', false), PlaybackSpeed: P('number', 1), TimePosition: P('number', 0), TimeLength: { ro: true, get: () => 1 } },
  events: ['Ended', 'Played', 'Loaded'],
  methods: { Play(s) { s.p.Playing = true; s.W.sound && s.W.sound(s); return []; }, Stop(s) { s.p.Playing = false; return []; }, Pause(s) { s.p.Playing = false; return []; }, Resume(s) { s.p.Playing = true; return []; } },
});
defClass('PointLight', 'Instance', { props: { Brightness: P('number', 1), Range: P('number', 8), Color: P('Color3', () => new Color3(1, 1, 1)), Enabled: P('boolean', true) } });
defClass('SurfaceLight', 'Instance', { props: { Brightness: P('number', 1), Range: P('number', 8), Color: P('Color3', () => new Color3(1, 1, 1)), Enabled: P('boolean', true) } });
defClass('Fire', 'Instance', { props: { Size: P('number', 5), Heat: P('number', 9), Color: P('Color3', () => new Color3(0.93, 0.5, 0.17)), Enabled: P('boolean', true) } });
defClass('Smoke', 'Instance', { props: { Size: P('number', 1), Color: P('Color3', () => new Color3(0.8, 0.8, 0.8)), Enabled: P('boolean', true) } });
defClass('Sparkles', 'Instance', { props: { SparkleColor: P('Color3', () => new Color3(0.56, 0.35, 1)), Enabled: P('boolean', true) } });
defClass('ParticleEmitter', 'Instance', { props: { Rate: P('number', 20), Enabled: P('boolean', true), Color: P('any', undefined), Texture: P('string', '') }, methods: { Emit() { return []; }, Clear() { return []; } } });
defClass('Decal', 'Instance', { props: { Texture: P('string', ''), Transparency: P('number', 0), Face: P('Enum.NormalId', () => ENUM.get('NormalId', 'Front')) } });
defClass('Attachment', 'Instance', { props: { Position: P('Vector3', () => new Vector3()), CFrame: P('CFrame', () => new CFrame()) } });
defClass('Weld', 'Instance', { props: { Part0: P('Instance?'), Part1: P('Instance?'), C0: P('CFrame', () => new CFrame()), C1: P('CFrame', () => new CFrame()) } });
defClass('WeldConstraint', 'Instance', { props: { Part0: P('Instance?'), Part1: P('Instance?'), Enabled: P('boolean', true) } });
defClass('Tool', 'Instance', { props: { RequiresHandle: P('boolean', true), CanBeDropped: P('boolean', true), ToolTip: P('string', '') }, events: ['Activated', 'Deactivated', 'Equipped', 'Unequipped'] });
defClass('Team', 'Instance', { props: { TeamColor: P('BrickColor', () => new BrickColor('White')), AutoAssignable: P('boolean', true) } });

// ---- networking ----
defClass('RemoteEvent', 'Instance', {
  events: ['OnServerEvent', 'OnClientEvent'],
  methods: {
    FireServer(s, args, R) { if (!s.W.isClient(R)) R.rt('FireServer can only be called from the client (a LocalScript)'); const W = s.W; checkRemoteArgs(R, args); W.later(0.05, () => s.sig('OnServerEvent').fire(W.player, ...args)); return []; },
    FireClient(s, [plr, ...args], R) { if (s.W.isClient(R)) R.rt('FireClient can only be called from the server'); if (!(plr instanceof Instance) || plr.ClassName !== 'Player') R.rt('FireClient: player argument must be a Player'); checkRemoteArgs(R, args); s.W.later(0.05, () => s.sig('OnClientEvent').fire(...args)); return []; },
    FireAllClients(s, args, R) { if (s.W.isClient(R)) R.rt('FireAllClients can only be called from the server'); checkRemoteArgs(R, args); s.W.later(0.05, () => s.sig('OnClientEvent').fire(...args)); return []; },
  },
});
defClass('UnreliableRemoteEvent', 'RemoteEvent');
function checkRemoteArgs(R, args) { for (const a of args) if (a instanceof LuaFn || a instanceof NativeFn) R.rt('Functions cannot be sent through a RemoteEvent'); }
defClass('RemoteFunction', 'Instance', {
  props: { OnServerInvoke: P('function?', undefined), OnClientInvoke: P('function?', undefined) },
  methods: {
    *InvokeServer(s, args, R) {
      if (!s.W.isClient(R)) R.rt('InvokeServer can only be called from the client');
      yield { type: 'wait', t: 0.05 };
      let tries = 0; while (!s.p.OnServerInvoke && tries++ < 600) yield { type: 'wait', t: 1 / 30 };
      if (!s.p.OnServerInvoke) R.rt('OnServerInvoke is not set on ' + s.p.Name);
      const r = yield* R.call(s.p.OnServerInvoke, [s.W.player, ...args]); yield { type: 'wait', t: 0.05 }; return r;
    },
    *InvokeClient(s, [plr, ...args], R) { yield { type: 'wait', t: 0.05 }; if (!s.p.OnClientInvoke) R.rt('OnClientInvoke is not set'); return yield* R.call(s.p.OnClientInvoke, args); },
  },
});
defClass('BindableEvent', 'Instance', { events: ['Event'], methods: { Fire(s, args) { s.sig('Event').fire(...args); return []; } } });
defClass('BindableFunction', 'Instance', { props: { OnInvoke: P('function?', undefined) }, methods: { *Invoke(s, args, R) { if (!s.p.OnInvoke) R.rt('OnInvoke is not set'); return yield* R.call(s.p.OnInvoke, args); } } });
defClass('LuaSourceContainer', 'Instance', { creatable: false });
defClass('BaseScript', 'LuaSourceContainer', { creatable: false, props: { Disabled: P('boolean', false, { set: (i, v) => { i.p.Disabled = v; i.p.Enabled = !v; } }), Enabled: P('boolean', true, { set: (i, v) => { i.p.Enabled = v; i.p.Disabled = !v; } }), RunContext: P('any', undefined) } });
defClass('Script', 'BaseScript'); defClass('LocalScript', 'BaseScript');
defClass('ModuleScript', 'LuaSourceContainer');

// ---- GUI ----
defClass('LayerCollector', 'Instance', { creatable: false, props: { Enabled: P('boolean', true), ResetOnSpawn: P('boolean', true) } });
defClass('ScreenGui', 'LayerCollector', { props: { DisplayOrder: P('number', 0), IgnoreGuiInset: P('boolean', false), ZIndexBehavior: P('Enum.ZIndexBehavior', () => ENUM.get('ZIndexBehavior', 'Sibling')) } });
defClass('BillboardGui', 'LayerCollector', { props: { Adornee: P('Instance?'), Size: P('UDim2', () => new UDim2(0, 100, 0, 50)), StudsOffset: P('Vector3', () => new Vector3()), AlwaysOnTop: P('boolean', false), MaxDistance: P('number', Infinity) } });
defClass('SurfaceGui', 'LayerCollector', { props: { Face: P('Enum.NormalId', () => ENUM.get('NormalId', 'Front')) } });
defClass('GuiObject', 'Instance', {
  creatable: false,
  props: {
    Position: P('UDim2', () => new UDim2()), Size: P('UDim2', () => new UDim2(0, 100, 0, 100)), AnchorPoint: P('Vector2', () => new Vector2()),
    BackgroundColor3: P('Color3', () => new Color3(1, 1, 1)), BackgroundTransparency: P('number', 0), BorderSizePixel: P('number', 1), BorderColor3: P('Color3', () => new Color3(0.1, 0.16, 0.2)),
    Visible: P('boolean', true), ZIndex: P('number', 1), LayoutOrder: P('number', 0), Rotation: P('number', 0), ClipsDescendants: P('boolean', false), Active: P('boolean', false),
    AbsoluteSize: { ro: true, get: i => i.W.guiAbs(i).size }, AbsolutePosition: { ro: true, get: i => i.W.guiAbs(i).pos },
  },
  events: ['MouseEnter', 'MouseLeave', 'InputBegan', 'InputEnded'],
  methods: { TweenPosition(s, [pos, dir, style, t]) { tweenGui(s, { Position: pos }, t); return [true]; }, TweenSize(s, [size, dir, style, t]) { tweenGui(s, { Size: size }, t); return [true]; } },
});
function tweenGui(s, goals, t = 1) { const tw = new Instance(s.W, 'Tween'); tw.tw = { inst: s, info: new TweenInfo(t), props: Object.entries(goals), t: 0, state: 'Playing', rep: 0 }; s.W.tweens.add(tw); }
defClass('Frame', 'GuiObject'); defClass('ScrollingFrame', 'GuiObject', { props: { CanvasSize: P('UDim2', () => new UDim2()) } });
const TEXT_PROPS = { Text: P('string', 'Label'), TextColor3: P('Color3', () => new Color3(0.1, 0.1, 0.1)), TextSize: P('number', 14), TextScaled: P('boolean', false), TextWrapped: P('boolean', false), Font: P('Enum.Font', () => ENUM.get('Font', 'SourceSans')), FontFace: P('any', undefined), TextXAlignment: P('Enum.TextXAlignment', () => ENUM.get('TextXAlignment', 'Center')), TextYAlignment: P('Enum.TextYAlignment', () => ENUM.get('TextYAlignment', 'Center')), TextTransparency: P('number', 0), TextStrokeTransparency: P('number', 1), RichText: P('boolean', false) };
defClass('TextLabel', 'GuiObject', { props: Object.assign({}, TEXT_PROPS) });
defClass('GuiButton', 'GuiObject', { creatable: false, props: { AutoButtonColor: P('boolean', true), Modal: P('boolean', false) }, events: ['MouseButton1Click', 'MouseButton1Down', 'MouseButton1Up', 'MouseButton2Click', 'Activated'] });
defClass('TextButton', 'GuiButton', { props: Object.assign({}, TEXT_PROPS, { Text: P('string', 'Button') }) });
defClass('ImageButton', 'GuiButton', { props: { Image: P('string', ''), ImageColor3: P('Color3', () => new Color3(1, 1, 1)) } });
defClass('ImageLabel', 'GuiObject', { props: { Image: P('string', ''), ImageColor3: P('Color3', () => new Color3(1, 1, 1)), ImageTransparency: P('number', 0) } });
defClass('TextBox', 'GuiObject', { props: Object.assign({}, TEXT_PROPS, { Text: P('string', ''), PlaceholderText: P('string', ''), ClearTextOnFocus: P('boolean', true) }), events: ['FocusLost', 'Focused'], methods: { CaptureFocus() { return []; }, ReleaseFocus() { return []; }, IsFocused() { return [false]; } } });
defClass('UICorner', 'Instance', { props: { CornerRadius: P('UDim', () => new UDim(0, 8)) } });
defClass('UIStroke', 'Instance', { props: { Thickness: P('number', 1), Color: P('Color3', () => new Color3(0, 0, 0)), Transparency: P('number', 0) } });
defClass('UIPadding', 'Instance', { props: { PaddingTop: P('UDim', () => new UDim()), PaddingBottom: P('UDim', () => new UDim()), PaddingLeft: P('UDim', () => new UDim()), PaddingRight: P('UDim', () => new UDim()) } });
defClass('UIListLayout', 'Instance', { props: { Padding: P('UDim', () => new UDim()), FillDirection: P('Enum.FillDirection', () => ENUM.get('FillDirection', 'Vertical')), SortOrder: P('Enum.SortOrder', () => ENUM.get('SortOrder', 'LayoutOrder')) } });
defClass('UIGradient', 'Instance', { props: { Rotation: P('number', 0), Color: P('any', undefined) } });
defClass('UIAspectRatioConstraint', 'Instance', { props: { AspectRatio: P('number', 1) } });
defClass('Player', 'Instance', {
  creatable: false,
  props: {
    UserId: { ro: true, get: i => i.p.UserId }, DisplayName: P('string', ''), Character: P('Instance?', undefined), AccountAge: { ro: true, get: () => 365 },
    Team: P('Instance?', undefined), TeamColor: P('BrickColor', () => new BrickColor('White')), RespawnLocation: P('Instance?', undefined), Neutral: P('boolean', true), MembershipType: { ro: true, get: () => ENUM.get('MembershipType', 'None') },
  },
  events: ['CharacterAdded', 'CharacterRemoving', 'Chatted', 'Idled'],
  methods: {
    LoadCharacter(s) { s.W.spawnCharacter(); return []; },
    Kick(s, [msg]) { s.W.kick(msg); return []; },
    GetMouse(s) { return [s.W.mouseObj()]; },
    IsInGroup() { return [false]; }, GetRankInGroup() { return [0]; }, GetRoleInGroup() { return ['Guest']; },
  },
});
defClass('Mouse', 'Instance', { creatable: false, props: { Hit: { ro: true, get: i => i.W.mouseHit() }, Target: { ro: true, get: i => i.W.mouseTarget() }, X: { ro: true, get: i => i.W.mouse.x }, Y: { ro: true, get: i => i.W.mouse.y } }, events: ['Button1Down', 'Button1Up', 'Move'] });

for (const c of Object.values(CLS)) if (c.baseName && !c.base) c.base = CLS[c.baseName];

/* ---------------- easing ---------------- */
function ease(style, dir, t) {
  const f = {
    Linear: x => x, Sine: x => 1 - Math.cos(x * Math.PI / 2), Quad: x => x * x, Cubic: x => x * x * x, Quart: x => x ** 4, Quint: x => x ** 5,
    Exponential: x => x === 0 ? 0 : Math.pow(2, 10 * (x - 1)), Circular: x => 1 - Math.sqrt(1 - x * x),
    Back: x => x * x * (2.70158 * x - 1.70158),
    Elastic: x => x === 0 || x === 1 ? x : -Math.pow(2, 10 * (x - 1)) * Math.sin((x - 1.075) * (2 * Math.PI) / 0.3),
    Bounce: x => 1 - bounceOut(1 - x),
  }[style] || (x => x);
  if (dir === 'In') return f(t);
  if (dir === 'Out') return 1 - f(1 - t);
  return t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2;
}
function bounceOut(x) { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; }
function lerpVal(a, b, t) {
  if (typeof a === 'number') return a + (b - a) * t;
  if (a instanceof Vector3) return a.lerp(b, t);
  if (a instanceof Color3) return a.lerp(b, t);
  if (a instanceof CFrame) return a.lerp(b, t);
  if (a instanceof UDim2) return a.lerp(b, t);
  if (a instanceof Vector2) return new Vector2(a.X + (b.X - a.X) * t, a.Y + (b.Y - a.Y) * t);
  return t < 1 ? a : b;
}

/* ================= World ================= */
const DS_KEY = 'compsci-study.luau.datastore';
class World {
  constructor(opts = {}) {
    this.opts = opts;
    this.outLines = [];
    this.out = (kind, text) => { this.outLines.push({ kind, text }); if (opts.out) opts.out(kind, text); };
    this.R = new Runtime({ out: this.out, seed: opts.seed });
    this.S = new Scheduler(this.R, { onError: (e, th) => this.out('error', errText(e)) });
    this.allInstances = new Set(); this.tweens = new Set(); this.contacts = new Map(); this.keysDown = new Set(); this.closeHandlers = []; this.tagSigs = {};
    this.mouse = { x: 0, y: 0 }; this.input = { x: 0, z: 0, jump: false }; this.camYaw = 0;
    this.headless = !!opts.headless; this.stopped = false; this.player = null; this.modules = new Map(); this.timers = [];
    this.dsMem = opts.dsMemory ? {} : null;
    this.installGlobals();
    this.buildGame();
  }
  isClient(R) { const th = (R || this.R).curThread; return !!(th && th.script && th.script.scriptKind === 'LocalScript'); }
  later(t, fn) { this.timers.push({ at: this.S.now + t, fn }); }
  // ---- data store backing (localStorage, or memory for tests) ----
  dsLoad() { if (this.dsMem) return this.dsMem; try { return JSON.parse(localStorage.getItem(DS_KEY) || '{}'); } catch (e) { return {}; } }
  dsSave(d) { if (this.dsMem) { this.dsMem = d; return; } try { localStorage.setItem(DS_KEY, JSON.stringify(d)); } catch (e) { } }
  dsGet(store, key) { const d = this.dsLoad(); return d[store] ? d[store][key] : undefined; }
  dsSet(store, key, v) { const d = this.dsLoad(); d[store] = d[store] || {}; if (v === undefined) delete d[store][key]; else d[store][key] = v; this.dsSave(d); }
  dsAll(store) { const d = this.dsLoad(); return Object.entries(d[store] || {}).filter(([k, v]) => typeof v === 'number'); }
  // ---- global API ----
  installGlobals() {
    const R = this.R, W = this, B = R.builtins;
    const lib = (name, fns) => { const t = new LuaTable(); for (const k in fns) { const v = fns[k]; t.set(k, typeof v === 'function' ? new NativeFn(name + '.' + k, v) : v); } t.frozen = true; B.set(name, t); return t; };
    const n = (v, i, f) => v === undefined ? 0 : R.chkNum(v, i, f);
    lib('Vector3', {
      new: a => [new Vector3(n(a[0], 1, 'Vector3.new'), n(a[1], 2, 'Vector3.new'), n(a[2], 3, 'Vector3.new'))],
      zero: new Vector3(0, 0, 0), one: new Vector3(1, 1, 1), xAxis: new Vector3(1, 0, 0), yAxis: new Vector3(0, 1, 0), zAxis: new Vector3(0, 0, 1),
      FromNormalId: a => [{ Right: new Vector3(1, 0, 0), Left: new Vector3(-1, 0, 0), Top: new Vector3(0, 1, 0), Bottom: new Vector3(0, -1, 0), Back: new Vector3(0, 0, 1), Front: new Vector3(0, 0, -1) }[a[0].Name]],
    });
    lib('Vector2', { new: a => [new Vector2(n(a[0], 1, 'Vector2.new'), n(a[1], 2, 'Vector2.new'))], zero: new Vector2(), one: new Vector2(1, 1) });
    const c01 = (v, i, f) => R.chkNum(v === undefined ? 0 : v, i, f);
    lib('Color3', {
      new: a => [new Color3(c01(a[0], 1, 'Color3.new'), c01(a[1], 2, 'Color3.new'), c01(a[2], 3, 'Color3.new'))],
      fromRGB: a => [new Color3(c01(a[0], 1, 'Color3.fromRGB') / 255, c01(a[1], 2, 'Color3.fromRGB') / 255, c01(a[2], 3, 'Color3.fromRGB') / 255)],
      fromHSV: a => [fromHSV(c01(a[0], 1, 'fromHSV'), c01(a[1], 2, 'fromHSV'), c01(a[2], 3, 'fromHSV'))],
      fromHex: a => { const h = String(a[0]).replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(h)) R.rt('Unable to convert characters to hex value'); return [new Color3(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255)]; },
      toHSV: a => a[0].toHSV(),
    });
    const bc = name => () => [new BrickColor(name)];
    lib('BrickColor', {
      new: a => { if (typeof a[0] === 'string') { if (!BRICK[a[0]]) { W.out('warn', `BrickColor "${a[0]}" is not a known color name, using Medium stone grey`); return [new BrickColor('Medium stone grey')]; } return [new BrickColor(a[0])]; } if (a[0] instanceof Color3) return [BrickColor.closest(a[0])]; if (a.length >= 3) return [BrickColor.closest(new Color3(a[0], a[1], a[2]))]; return [new BrickColor('Medium stone grey')]; },
      random: () => { const k = Object.keys(BRICK); return [new BrickColor(k[Math.floor(R.rng() * k.length)])]; },
      palette: a => [new BrickColor(Object.keys(BRICK)[a[0] % Object.keys(BRICK).length])],
      White: bc('White'), Black: bc('Black'), Red: bc('Bright red'), Green: bc('Bright green'), Blue: bc('Bright blue'), Yellow: bc('Bright yellow'), Gray: bc('Medium stone grey'), DarkGray: bc('Dark stone grey'),
    });
    lib('CFrame', {
      new: a => {
        if (a.length === 0) return [new CFrame()];
        if (a[0] instanceof Vector3) { if (a[1] instanceof Vector3) return [lookAt(a[0], a[1])]; return [new CFrame(a[0].X, a[0].Y, a[0].Z)]; }
        if (a.length >= 12) return [new CFrame(a[0], a[1], a[2], a.slice(3, 12))];
        if (a.length === 7) { const [x, y, z, qx, qy, qz, qw] = a; return [new CFrame(x, y, z, [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw), 2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw), 2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy)])]; }
        return [new CFrame(n(a[0], 1, 'CFrame.new'), n(a[1], 2, 'CFrame.new'), n(a[2], 3, 'CFrame.new'))];
      },
      Angles: a => [new CFrame(0, 0, 0, mat.xyz(n(a[0], 1, 'CFrame.Angles'), n(a[1], 2, 'CFrame.Angles'), n(a[2], 3, 'CFrame.Angles')))],
      fromEulerAnglesXYZ: a => [new CFrame(0, 0, 0, mat.xyz(n(a[0]), n(a[1]), n(a[2])))],
      fromEulerAnglesYXZ: a => [new CFrame(0, 0, 0, mat.yxz(n(a[0]), n(a[1]), n(a[2])))],
      fromOrientation: a => [new CFrame(0, 0, 0, mat.yxz(n(a[0]), n(a[1]), n(a[2])))],
      lookAt: a => [lookAt(a[0], a[1], a[2])],
      fromAxisAngle: a => { const ax = a[0].unit(), t = a[1]; const c = Math.cos(t), s = Math.sin(t), C = 1 - c, x = ax.X, y = ax.Y, z = ax.Z; return [new CFrame(0, 0, 0, [x * x * C + c, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, y * y * C + c, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, z * z * C + c])]; },
      identity: new CFrame(),
    });
    lib('UDim2', {
      new: a => [new UDim2(n(a[0]), n(a[1]), n(a[2]), n(a[3]))],
      fromScale: a => [new UDim2(n(a[0]), 0, n(a[1]), 0)], fromOffset: a => [new UDim2(0, n(a[0]), 0, n(a[1]))],
    });
    lib('UDim', { new: a => [new UDim(n(a[0]), n(a[1]))] });
    lib('TweenInfo', { new: a => [new TweenInfo(a[0] === undefined ? 1 : R.chkNum(a[0], 1, 'TweenInfo.new'), a[1], a[2], a[3] || 0, !!a[4], a[5] || 0)] });
    lib('NumberRange', { new: a => [LuaTable.dict({ Min: a[0], Max: a[1] === undefined ? a[0] : a[1] })] });
    lib('ColorSequence', { new: a => [a[0]] });
    lib('NumberSequence', { new: a => [a[0]] });
    lib('RaycastParams', { new: () => { const t = LuaTable.dict({ FilterDescendantsInstances: new LuaTable(), FilterType: ENUM.get('RaycastFilterType', 'Exclude'), IgnoreWater: false }); return [t]; } });
    lib('OverlapParams', { new: () => [new LuaTable()] });
    lib('Random', { new: a => { const seed = a[0] === undefined ? Math.floor(Math.random() * 1e9) : a[0]; let s = seed >>> 0; const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; const o = new LuaTable(); o.set('NextInteger', new NativeFn('NextInteger', b => [b[1] + Math.floor(rnd() * (b[2] - b[1] + 1))])); o.set('NextNumber', new NativeFn('NextNumber', b => [b[1] === undefined ? rnd() : b[1] + rnd() * (b[2] - b[1])])); return [o]; } });
    B.set('Enum', ENUMS_ROOT);
    lib('Instance', {
      new: a => {
        const [cn, parent] = a;
        if (typeof cn !== 'string') R.rt(`invalid argument #1 to 'new' (string expected, got ${luaTypeof(cn)})`);
        const c = CLS[cn];
        if (!c) { const near = Object.keys(CLS).find(k => k.toLowerCase() === cn.toLowerCase()); R.rt(`Unable to create an Instance of type "${cn}"` + (near ? ` (did you mean "${near}"? Class names are case-sensitive)` : '')); }
        if (!c.creatable) R.rt(`Unable to create an Instance of type "${cn}" (it is created by Roblox, not by scripts)`);
        const inst = new Instance(W, cn);
        if (parent !== undefined) inst.setParent(parent, R);
        return [inst];
      },
    });
    R.def('require', function* (a) {
      const m = a[0];
      if (!(m instanceof Instance) || m.ClassName !== 'ModuleScript') R.rt('Attempted to call require with invalid argument(s). Pass a ModuleScript, like require(game.ReplicatedStorage.MyModule)');
      if (W.modules.has(m)) { const st = W.modules.get(m); if (st.loading) R.rt('Requested module was required recursively'); return [st.value]; }
      const st = { loading: true }; W.modules.set(m, st);
      const fn = R.load(m.scriptSource || 'return {}', m.getFullName(), W.envFor(m));
      const r = yield* R.call(fn, []);
      st.loading = false;
      if (r.length !== 1) R.rt(`Module code did not return exactly one value (${m.getFullName()})`);
      st.value = r[0]; return [r[0]];
    });
    R.builtins.set('shared', new LuaTable());
    R.def('settings', () => [new LuaTable()]);
    R.def('UserSettings', () => [new LuaTable()]);
    R.def('version', () => ['0.700.0.0']);
  }
  envFor(scriptInst) { const env = new Map(); env.set('script', scriptInst); return env; }
  // ---- game tree ----
  buildGame() {
    const R = this.R, W = this;
    const game = this.game = new Instance(this, 'DataModel'); game.p.Name = 'Game';
    this.services = {};
    const order = ['Workspace', 'Players', 'Lighting', 'ReplicatedFirst', 'ReplicatedStorage', 'ServerScriptService', 'ServerStorage', 'StarterGui', 'StarterPack', 'StarterPlayer', 'SoundService', 'Teams', 'TextChatService', 'RunService', 'TweenService', 'Debris', 'DataStoreService', 'UserInputService', 'CollectionService', 'MarketplaceService', 'HttpService', 'PathfindingService', 'Chat'];
    for (const n of order) { const s = new Instance(this, n); s.p.Name = n; this.services[n] = s; s.setParent(game, R); }
    this.workspace = this.services.Workspace;
    const sps = new Instance(this, 'StarterPlayerScripts'); sps.p.Name = 'StarterPlayerScripts'; sps.setParent(this.services.StarterPlayer, R);
    const scs = new Instance(this, 'StarterCharacterScripts'); scs.p.Name = 'StarterCharacterScripts'; scs.setParent(this.services.StarterPlayer, R);
    R.builtins.set('game', game); R.builtins.set('Game', game);
    R.builtins.set('workspace', this.workspace); R.builtins.set('Workspace', this.workspace);
    const cam = new Instance(this, 'Folder'); cam.p.Name = 'Camera'; cam.isCamera = true; cam.setParent(this.workspace, R);
    if (this.opts.empty) return;
    const base = new Instance(this, 'Part'); base.p.Name = 'Baseplate'; base.p.Size = new Vector3(256, 16, 256); base.cf = new CFrame(0, -8, 0); base.p.Anchored = true; base.p.Locked = true; base.p.Color = new Color3(99 / 255, 95 / 255, 98 / 255); base.isBaseplate = true; base.setParent(this.workspace, R);
    const sp = new Instance(this, 'SpawnLocation'); sp.p.Name = 'SpawnLocation'; sp.cf = new CFrame(0, 0.5, 24); sp.setParent(this.workspace, R);
  }
  onAdded(inst, parent) { this.partsDirty = true; this.dirty = true; }
  onRemoved(inst, parent) { this.partsDirty = true; if (inst.isA('BasePart')) this.contacts.forEach((v, k) => { if (k.includes('#' + inst.id + '#')) this.contacts.delete(k); }); this.dirty = true; }
  movedPart(p) { this.dirty = true; }
  tagAdded(i, t) { const s = this.tagSigs[t]; if (s) s.fire(i); }
  parts() {
    if (this.partsDirty || !this._parts) { this._parts = this.workspace.descendants().filter(d => d.isA('BasePart')); this.partsDirty = false; }
    return this._parts;
  }
  aabb(p) {
    const s = p.p.Size, h = [s.X / 2, s.Y / 2, s.Z / 2], R = p.cf.R;
    const ex = Math.abs(R[0]) * h[0] + Math.abs(R[1]) * h[1] + Math.abs(R[2]) * h[2];
    const ey = Math.abs(R[3]) * h[0] + Math.abs(R[4]) * h[1] + Math.abs(R[5]) * h[2];
    const ez = Math.abs(R[6]) * h[0] + Math.abs(R[7]) * h[1] + Math.abs(R[8]) * h[2];
    return { min: new Vector3(p.cf.x - ex, p.cf.y - ey, p.cf.z - ez), max: new Vector3(p.cf.x + ex, p.cf.y + ey, p.cf.z + ez) };
  }
  bboxOf(list) { if (!list.length) return null; let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity]; for (const p of list) { const b = this.aabb(p); mn = [Math.min(mn[0], b.min.X), Math.min(mn[1], b.min.Y), Math.min(mn[2], b.min.Z)]; mx = [Math.max(mx[0], b.max.X), Math.max(mx[1], b.max.Y), Math.max(mx[2], b.max.Z)]; } return { min: new Vector3(...mn), max: new Vector3(...mx) }; }
  // top surface height of a part at world (x, z), or null if outside it
  topAt(p, x, z) {
    const b = this.aabb(p);
    if (shapeOf(p) !== 'Wedge') return b.max.Y;
    const inv = p.cf.inverse(); const l = inv.point(new Vector3(x, p.cf.y, z)); const s = p.p.Size;
    const t = Math.max(0, Math.min(1, l.Z / s.Z + 0.5));
    return p.cf.y - s.Y / 2 + s.Y * t + 0.01;
  }
  // ---- scripts ----
  // scripts: [{kind:'Script'|'LocalScript'|'ModuleScript', name, parentPath, source, firstLine}]
  resolvePath(path) {
    const segs = path.split('.').filter(Boolean); if (!segs.length) return null;
    let cur = segs[0] === 'game' ? this.game : (this.services[segs[0]] || (segs[0] === 'workspace' ? this.workspace : null));
    if (!cur) return null;
    for (const s of segs.slice(segs[0] === 'game' ? 1 : 1)) { cur = cur.children.find(c => c.p.Name === s); if (!cur) return null; }
    return cur;
  }
  addScripts(list) {
    const R = this.R; this.pendingLocal = [];
    const made = [];
    for (const sc of list) {
      const inst = new Instance(this, sc.kind); inst.p.Name = sc.name; inst.scriptSource = sc.source; inst.scriptKind = sc.kind; inst.lineOffset = sc.firstLine || 0;
      made.push({ inst, sc });
    }
    // modules first (so require works), then scripts get parented
    for (const { inst, sc } of made) {
      let parent;
      if (sc.parentPath) { parent = this.resolvePath(sc.parentPath); }
      else parent = sc.kind === 'LocalScript' ? this.services.StarterPlayer.children.find(c => c.p.Name === 'StarterPlayerScripts') : sc.kind === 'ModuleScript' ? this.services.ReplicatedStorage : this.services.ServerScriptService;
      inst.wantParent = sc.parentPath; inst.setParent(parent || null, R);
    }
    this.scriptsList = made.map(m => m.inst);
    return made.map(m => m.inst);
  }
  runScript(inst) {
    const R = this.R;
    if (!inst.parent && inst.wantParent) { const p = this.resolvePath(inst.wantParent); if (p) inst.setParent(p, R); else { this.out('error', `Could not find ${inst.wantParent} for ${inst.p.Name}. Make sure it exists before this script runs.`); return; } }
    let fn;
    try { fn = R.load(padLines(inst.scriptSource, inst.lineOffset), inst.getFullName(), this.envFor(inst)); }
    catch (e) { this.out('error', errText(e)); return; }
    const th = this.S.spawn(fn, [], inst.p.Name, inst);
    this.S.resume(th);
  }
  start(scripts) {
    const insts = this.addScripts(scripts);
    // server scripts run first, in order
    for (const i of insts) if (i.scriptKind === 'Script') this.runScript(i);
    // the player joins right after
    this.later(0.05, () => this.addPlayer());
  }
  // ---- player & character ----
  addPlayer() {
    if (this.player || this.stopped || this.opts.noPlayer) return;
    const R = this.R;
    const pl = new Instance(this, 'Player'); pl.p.Name = this.opts.playerName || 'Player1'; pl.p.DisplayName = pl.p.Name; pl.p.UserId = 314159;
    const ps = new Instance(this, 'PlayerScripts'); ps.p.Name = 'PlayerScripts'; ps.setParent(pl, R);
    const pg = new Instance(this, 'PlayerGui'); pg.p.Name = 'PlayerGui'; pg.setParent(pl, R);
    const bp = new Instance(this, 'Backpack'); bp.p.Name = 'Backpack'; bp.setParent(pl, R);
    this.player = pl;
    pl.setParent(this.services.Players, R);
    this.services.Players.sig('PlayerAdded').fire(pl);
    // copy StarterGui, run LocalScripts in StarterPlayerScripts
    this.copyStarterGui();
    const sps = this.services.StarterPlayer.children.find(c => c.p.Name === 'StarterPlayerScripts');
    for (const s of sps.children.slice()) if (s.scriptKind === 'LocalScript') { const c = s.clone(R); c.lineOffset = s.lineOffset; c.setParent(ps, R); this.runScript(c); }
    for (const s of (this.scriptsList || [])) if (s.scriptKind === 'LocalScript' && s.parent && s.parent.ClassName === 'StarterGui') { /* handled by gui copy */ }
    this.later(0.02, () => this.spawnCharacter());
  }
  copyStarterGui() {
    const R = this.R, pg = this.player && this.player.children.find(c => c.ClassName === 'PlayerGui'); if (!pg) return;
    for (const g of this.services.StarterGui.children) {
      if (g.ClassName !== 'ScreenGui' && g.scriptKind !== 'LocalScript') continue;
      if (pg.children.some(c => c.cloneOf === g) && !g.p.ResetOnSpawn) continue;
      pg.children.filter(c => c.cloneOf === g).forEach(c => c.destroy(R));
      const c = g.clone(R); c.cloneOf = g; c.setParent(pg, R);
      for (const s of [c, ...c.descendants()]) if (s.scriptKind === 'LocalScript') { const orig = [g, ...g.descendants()].find(o => o.scriptSource === s.scriptSource); s.lineOffset = orig ? orig.lineOffset : 0; this.runScript(s); }
    }
  }
  spawnCharacter() {
    const R = this.R, pl = this.player; if (!pl || this.stopped) return;
    const old = pl.p.Character; if (old && !old.destroyed) { pl.sig('CharacterRemoving').fire(old); old.destroy(R); }
    const ch = new Instance(this, 'Model'); ch.p.Name = pl.p.Name; ch.isCharacter = true;
    const mk = (name, size, color, transp = 0) => { const p = new Instance(this, 'Part'); p.p.Name = name; p.p.Size = size; p.p.Color = color; p.p.Transparency = transp; p.charPart = true; p.p.CanCollide = name !== 'HumanoidRootPart' ? false : true; p.setParent(ch, R); return p; };
    const yellow = new Color3(245 / 255, 205 / 255, 48 / 255), blue = new Color3(13 / 255, 105 / 255, 172 / 255), green = new Color3(164 / 255, 189 / 255, 71 / 255);
    const root = mk('HumanoidRootPart', new Vector3(2, 2, 1), blue, 1);
    mk('Torso', new Vector3(2, 2, 1), blue); const head = mk('Head', new Vector3(2, 1, 1), yellow);
    mk('Left Arm', new Vector3(1, 2, 1), yellow); mk('Right Arm', new Vector3(1, 2, 1), yellow);
    mk('Left Leg', new Vector3(1, 2, 1), green); mk('Right Leg', new Vector3(1, 2, 1), green);
    const hum = new Instance(this, 'Humanoid'); hum.p.Name = 'Humanoid'; hum.p.DisplayName = pl.p.DisplayName;
    hum.p.WalkSpeed = this.services.StarterPlayer.p.CharacterWalkSpeed; hum.p.JumpPower = this.services.StarterPlayer.p.CharacterJumpPower;
    hum.setParent(ch, R);
    ch.p.PrimaryPart = root;
    // spawn point
    const spawns = this.parts().filter(p => p.ClassName === 'SpawnLocation' && p.p.Enabled);
    const sp = pl.p.RespawnLocation && !pl.p.RespawnLocation.destroyed ? pl.p.RespawnLocation : spawns[0];
    let pos = sp ? new Vector3(sp.cf.x, this.aabb(sp).max.Y + 3, sp.cf.z) : new Vector3(0, 10, 0);
    ch.state = { vel: new Vector3(), yaw: 0, grounded: false, walk: 0, deadT: 0 };
    root.cf = new CFrame(pos.X, pos.Y, pos.Z, mat.ry(0));
    this.poseCharacter(ch, 0);
    // starter character scripts
    const scs = this.services.StarterPlayer.children.find(c => c.p.Name === 'StarterCharacterScripts');
    const chScripts = [];
    for (const s of scs.children) if (s.scriptSource !== undefined) { const c = s.clone(R); c.lineOffset = s.lineOffset; c.setParent(ch, R); chScripts.push(c); }
    ch.setParent(this.workspace, R);
    pl.setRaw('Character', ch);
    this.copyStarterGui();
    pl.sig('CharacterAdded').fire(ch);
    for (const c of chScripts) this.runScript(c);
    this.camReset = true;
  }
  poseCharacter(ch, t) {
    const root = ch.children.find(c => c.p.Name === 'HumanoidRootPart'); if (!root) return;
    const st = ch.state || { walk: 0 }; const sw = Math.sin(st.walk) * 0.7 * Math.min(1, st.speed || 0);
    const at = (name, ox, oy, oz, rx = 0) => { const p = ch.children.find(c => c.p.Name === name); if (!p || p.broken) return; const pivotY = oy + 1; let cf = root.cf.mul(new CFrame(ox, pivotY, oz)).mul(new CFrame(0, 0, 0, mat.rx(rx))).mul(new CFrame(0, -1, 0)); if (name === 'Torso' || name === 'Head') cf = root.cf.mul(new CFrame(ox, oy, oz)); p.cf = cf; };
    at('Torso', 0, 0, 0); at('Head', 0, 1.5, 0);
    at('Left Arm', -1.5, 0, 0, sw); at('Right Arm', 1.5, 0, 0, -sw);
    at('Left Leg', -0.5, -2, 0, -sw); at('Right Leg', 0.5, -2, 0, sw);
  }
  killHumanoid(h) {
    if (h.dead) return; h.dead = true;
    h.sig('Died').fire();
    const ch = h.parent;
    if (ch && ch.isCharacter) {
      for (const p of ch.children) if (p.isA('BasePart') && p.p.Name !== 'HumanoidRootPart') { p.broken = true; p.vel = new Vector3((this.R.rng() - 0.5) * 20, 20 + this.R.rng() * 15, (this.R.rng() - 0.5) * 20); p.spin = (this.R.rng() - 0.5) * 8; }
      if (ch === (this.player && this.player.p.Character)) this.later(this.services.Players.p.RespawnTime, () => { if (this.services.Players.p.CharacterAutoLoads) this.spawnCharacter(); });
    }
  }
  kick(msg) { this.kicked = msg || 'You were kicked from this experience'; this.out('warn', 'Player kicked: ' + this.kicked); const pl = this.player; if (pl) { this.services.Players.sig('PlayerRemoving').fire(pl); if (pl.p.Character) pl.p.Character.destroy(this.R); pl.parentLocked = false; pl.setParent(null, this.R); this.player = null; } }
  mouseObj() { if (!this._mouse) { this._mouse = new Instance(this, 'Mouse'); } return this._mouse; }
  mouseHit() { return this.mouseHitCF || new CFrame(); }
  mouseTarget() { return this.mouseTargetPart; }
  raycast(origin, dir, params) {
    let best = null;
    const excl = params instanceof LuaTable ? params.get('FilterDescendantsInstances') : null;
    const exList = excl instanceof LuaTable ? [...excl.entries()].map(e => e[1]) : [];
    const isInc = params instanceof LuaTable && params.get('FilterType') && /Include|Whitelist/.test(params.get('FilterType').Name);
    const skip = p => { const hit = exList.some(e => e === p || p.descendants && false || isDesc(p, e)); return isInc ? !hit : hit; };
    for (const p of this.parts()) {
      if (!p.p.CanQuery || skip(p)) continue;
      const b = this.aabb(p); let tmin = 0, tmax = 1; let nAxis = null;
      const o = [origin.X, origin.Y, origin.Z], d = [dir.X, dir.Y, dir.Z], mn = [b.min.X, b.min.Y, b.min.Z], mx = [b.max.X, b.max.Y, b.max.Z];
      let ok = true, enterAxis = 0, enterSign = 0;
      for (let a = 0; a < 3; a++) {
        if (Math.abs(d[a]) < 1e-9) { if (o[a] < mn[a] || o[a] > mx[a]) { ok = false; break; } continue; }
        let t1 = (mn[a] - o[a]) / d[a], t2 = (mx[a] - o[a]) / d[a]; let sgn = -1; if (t1 > t2) { [t1, t2] = [t2, t1]; sgn = 1; }
        if (t1 > tmin) { tmin = t1; enterAxis = a; enterSign = sgn; } tmax = Math.min(tmax, t2); if (tmin > tmax) { ok = false; break; }
      }
      if (ok && (!best || tmin < best.t)) best = { t: tmin, p, axis: enterAxis, sign: enterSign };
    }
    if (!best) return undefined;
    const pos = origin.add(dir.mul(best.t)); const nrm = [0, 0, 0]; nrm[best.axis] = best.sign;
    return LuaTable.dict({ Instance: best.p, Position: pos, Normal: new Vector3(...nrm), Distance: dir.mag * best.t, Material: best.p.p.Material });
  }
  contactsOf(p) { const s = new Set(); for (const k of this.contacts.keys()) { const [a, b] = k.split('|'); if (a === '#' + p.id + '#') s.add(this.byId(b)); else if (b === '#' + p.id + '#') s.add(this.byId(a)); } s.delete(undefined); return s; }
  byId(tag) { const id = +tag.replace(/#/g, ''); for (const i of this.allInstances) if (i.id === id) return i; }
  guiAbs(g) { const W = this.viewW || 640, H = this.viewH || 360; const pos = g.p.Position, size = g.p.Size; return { size: new Vector2(size.X.Scale * W + size.X.Offset, size.Y.Scale * H + size.Y.Offset), pos: new Vector2(pos.X.Scale * W + pos.X.Offset, pos.Y.Scale * H + pos.Y.Offset) }; }

  /* ---------------- simulation step ---------------- */
  step(dt) {
    if (this.stopped) return;
    dt = Math.min(dt, 1 / 20);
    const R = this.R, S = this.S;
    const rs = this.services.RunService;
    rs.sigs.Stepped && rs.sigs.Stepped.fire(S.now, dt);
    // timers (network latency, respawn)
    const due = this.timers.filter(t => t.at <= S.now + dt); this.timers = this.timers.filter(t => t.at > S.now + dt);
    S.step(dt);
    for (const t of due) { try { t.fn(); } catch (e) { this.out('error', errText(e)); } }
    this.physics(dt);
    this.stepTweens(dt);
    this.touches();
    rs.sigs.Heartbeat && rs.sigs.Heartbeat.fire(dt);
    rs.sigs.PostSimulation && rs.sigs.PostSimulation.fire(dt);
    if (!this.headless) rs.sigs.RenderStepped && rs.sigs.RenderStepped.fire(dt);
    S.step(0);
  }
  stepTweens(dt) {
    for (const tw of [...this.tweens]) {
      const T = tw.tw; if (T.state !== 'Playing') continue;
      const inst = T.inst; if (inst.destroyed) { this.tweens.delete(tw); continue; }
      if (!T.from) { if (T.t + dt < 0) { T.t += dt; continue; } T.from = T.props.map(([k]) => this.R.index(inst, k)); }
      T.t += dt; const dur = Math.max(T.info.Time, 1e-6);
      let a = Math.min(1, Math.max(0, T.t / dur)); const al = ease(T.info.EasingStyle.Name, T.info.EasingDirection.Name, T.back ? 1 - a : a);
      T.props.forEach(([k, goal], i) => { const v = lerpVal(T.from[i], goal, al); const pd = findProp(inst.cls, k); if (pd && pd.set) pd.set(inst, v, this.R); else inst.p[k] = v; inst.changed(k); });
      if (a >= 1) {
        if (T.info.Reverses && !T.back) { T.back = true; T.t = 0; continue; }
        if (T.info.RepeatCount < 0 || T.rep < T.info.RepeatCount) { T.rep++; T.back = false; T.t = -T.info.DelayTime; continue; }
        T.state = 'Completed'; this.tweens.delete(tw); tw.sig('Completed').fire(ENUM.get('PlaybackState', 'Completed'));
      }
    }
  }
  solids(except) { return this.parts().filter(p => p.p.CanCollide && !p.charPart && p !== except && !p.broken); }
  physics(dt) {
    const g = this.workspace.p.Gravity;
    const fallY = this.workspace.p.FallenPartsDestroyHeight;
    const parts = this.parts();
    // loose (unanchored) parts
    for (const p of parts) {
      if (p.p.Anchored || p.charPart || p.destroyed) continue;
      if (p.isA('BasePart') && p.parent && p.parent.isCharacter) continue;
      if (p.restT > 0.5 && p.vel.mag < 0.01 && !this.dirty) continue;
      let v = p.vel; v = new Vector3(v.X, v.Y - g * dt, v.Z);
      const b = this.aabb(p); const half = b.max.sub(b.min).mul(0.5);
      let pos = p.cf.pos; const solids = this.solids(p).filter(o => o !== p);
      const moveAxis = (axis, d) => {
        const np = new Vector3(pos.X + (axis === 0 ? d : 0), pos.Y + (axis === 1 ? d : 0), pos.Z + (axis === 2 ? d : 0));
        const mn = np.sub(half), mx = np.add(half);
        for (const o of solids) { const ob = this.aabb(o); if (mx.X > ob.min.X + 1e-4 && mn.X < ob.max.X - 1e-4 && mx.Y > ob.min.Y + 1e-4 && mn.Y < ob.max.Y - 1e-4 && mx.Z > ob.min.Z + 1e-4 && mn.Z < ob.max.Z - 1e-4) {
          if (axis === 1) { if (d < 0) { pos = new Vector3(pos.X, ob.max.Y + half.Y, pos.Z); p.grounded = o; } else pos = new Vector3(pos.X, ob.min.Y - half.Y, pos.Z); return false; }
          return false;
        } }
        pos = np; return true;
      };
      // un-stick if overlapping something already (e.g. spawned inside the baseplate)
      const ob0 = solids.find(o => { const ob = this.aabb(o), mn = pos.sub(half), mx = pos.add(half); return mx.X > ob.min.X + 0.01 && mn.X < ob.max.X - 0.01 && mx.Y > ob.min.Y + 0.01 && mn.Y < ob.max.Y - 0.01 && mx.Z > ob.min.Z + 0.01 && mn.Z < ob.max.Z - 0.01; });
      if (ob0 && p.p.CanCollide) { const ob = this.aabb(ob0); pos = new Vector3(pos.X, ob.max.Y + half.Y, pos.Z); v = new Vector3(v.X, 0, v.Z); }
      p.grounded = null;
      if (!p.p.CanCollide) { pos = pos.add(v.mul(dt)); }
      else {
        if (!moveAxis(1, v.Y * dt)) v = new Vector3(v.X, 0, v.Z);
        if (!moveAxis(0, v.X * dt)) v = new Vector3(-v.X * 0.3, v.Y, v.Z);
        if (!moveAxis(2, v.Z * dt)) v = new Vector3(v.X, v.Y, -v.Z * 0.3);
        if (p.grounded) { const f = Math.pow(0.02, dt); v = new Vector3(v.X * f, v.Y, v.Z * f); if (Math.abs(v.X) < 0.05) v = new Vector3(0, v.Y, v.Z); if (Math.abs(v.Z) < 0.05) v = new Vector3(v.X, v.Y, 0); }
      }
      p.vel = v;
      let R = p.cf.R; if (p.broken && p.spin) R = mat.mul(R, mat.rx(p.spin * dt));
      p.cf = new CFrame(pos.X, pos.Y, pos.Z, R);
      p.restT = v.mag < 0.01 ? (p.restT || 0) + dt : 0;
      if (pos.Y < fallY) { p.destroy(this.R); }
    }
    // character
    const pl = this.player, ch = pl && pl.p.Character;
    if (ch && !ch.destroyed && ch.parent) this.moveCharacter(ch, dt, g, fallY);
    // broken limbs fall
    for (const p of parts) if (p.broken && !p.destroyed) { p.vel = new Vector3(p.vel.X * 0.99, p.vel.Y - g * dt, p.vel.Z * 0.99); let np = p.cf.pos.add(p.vel.mul(dt)); const top = this.groundBelow(np, 0.5, p); if (np.Y - 0.5 < top) { np = new Vector3(np.X, top + 0.5, np.Z); p.vel = new Vector3(p.vel.X * 0.5, -p.vel.Y * 0.3, p.vel.Z * 0.5); } p.cf = new CFrame(np.X, np.Y, np.Z, mat.mul(p.cf.R, mat.rx((p.spin || 0) * dt))); }
    this.dirty = false;
  }
  groundBelow(pos, halfW, except) { let top = -Infinity; for (const o of this.solids(except)) { const ob = this.aabb(o); if (pos.X + halfW > ob.min.X && pos.X - halfW < ob.max.X && pos.Z + halfW > ob.min.Z && pos.Z - halfW < ob.max.Z) { const t = this.topAt(o, pos.X, pos.Z); if (t <= pos.Y + 0.6 && t > top) top = t; } } return top; }
  moveCharacter(ch, dt, g, fallY) {
    const root = ch.children.find(c => c.p.Name === 'HumanoidRootPart'), hum = ch.children.find(c => c.ClassName === 'Humanoid');
    if (!root) return;
    const st = ch.state;
    if (!hum || hum.dead) { st.deadT += dt; return; }
    // input -> move direction (relative to camera yaw)
    let ix = this.input.x, iz = this.input.z;
    let dir = new Vector3();
    if (hum.scriptMove && hum.scriptMove.mag > 0) dir = hum.scriptMove.unit();
    else if (hum.moveTarget) { const d = hum.moveTarget.sub(root.cf.pos); const flat = new Vector3(d.X, 0, d.Z); if (flat.mag < 1) { hum.moveTarget = null; hum.sig('MoveToFinished').fire(true); } else dir = flat.unit(); }
    if (ix || iz) { const cy = this.camYaw, f = new Vector3(-Math.sin(cy), 0, -Math.cos(cy)), r = new Vector3(Math.cos(cy), 0, -Math.sin(cy)); dir = f.mul(-iz).add(r.mul(ix)); if (dir.mag > 0) dir = dir.unit(); hum.moveTarget = null; }
    hum.moveDir = dir;
    const speed = hum.p.WalkSpeed;
    let v = st.vel; v = new Vector3(dir.X * speed, v.Y - g * dt, dir.Z * speed);
    const wantJump = this.input.jump || hum.jumpReq;
    if (wantJump && st.grounded && hum.p.JumpPower > 0) { v = new Vector3(v.X, hum.p.UseJumpPower ? hum.p.JumpPower : Math.sqrt(2 * g * hum.p.JumpHeight), v.Z); st.grounded = false; hum.sig('Jumping').fire(true); hum.jumpReq = false; this.input.jumpUsed = true; }
    if (dir.mag > 0) { const target = Math.atan2(-dir.X, -dir.Z); let d = target - st.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; st.yaw += d * Math.min(1, dt * 12); }
    // positions: root center; feet = y - 3; head top = y + 2
    let pos = root.cf.pos; const hw = 0.9;
    const solids = this.solids(null).filter(p => !(p.parent && p.parent.isCharacter));
    const boxes = solids.map(o => ({ o, b: this.aabb(o) }));
    const overlapsAt = (P, stepUp) => { for (const { o, b } of boxes) { if (P.X + hw > b.min.X && P.X - hw < b.max.X && P.Z + hw > b.min.Z && P.Z - hw < b.max.Z) { const top = this.topAt(o, P.X, P.Z); const bot = b.min.Y; if (P.Y + 2 > bot + 0.01 && P.Y - 3 < top - 0.01) { if (top - (P.Y - 3) <= stepUp) continue; return o; } } } return null; };
    // horizontal with step-up and pushing loose parts
    for (const axis of [0, 2]) {
      const d = (axis === 0 ? v.X : v.Z) * dt; if (!d) continue;
      const np = axis === 0 ? new Vector3(pos.X + d, pos.Y, pos.Z) : new Vector3(pos.X, pos.Y, pos.Z + d);
      const hit = overlapsAt(np, st.grounded ? 1.1 : 0.3);
      if (!hit) pos = np;
      else if (!hit.p.Anchored) { hit.vel = new Vector3(axis === 0 ? v.X * 1.1 : hit.vel.X, hit.vel.Y + 2, axis === 2 ? v.Z * 1.1 : hit.vel.Z); hit.restT = 0; }
    }
    // step up onto small ledges
    if (st.grounded) { const top = this.groundBelow(new Vector3(pos.X, pos.Y - 3 + 1.1, pos.Z), hw, null); if (top > pos.Y - 3 && top - (pos.Y - 3) <= 1.1) pos = new Vector3(pos.X, top + 3, pos.Z); }
    // vertical
    let ny = pos.Y + v.Y * dt;
    st.grounded = false; hum.floor = null;
    if (v.Y <= 0) {
      let best = -Infinity, floor = null;
      for (const { o, b } of boxes) { if (pos.X + hw > b.min.X && pos.X - hw < b.max.X && pos.Z + hw > b.min.Z && pos.Z - hw < b.max.Z) { const top = this.topAt(o, pos.X, pos.Z); if (top <= pos.Y - 3 + 0.05 + (o.ClassName === 'WedgePart' ? 0.6 : 0) && top >= ny - 3 - 0.05 && top > best) { best = top; floor = o; } } }
      if (floor) { ny = best + 3; v = new Vector3(v.X, 0, v.Z); st.grounded = true; hum.floor = floor; if (!floor.p.Anchored && floor.vel.mag > 0) { ny += floor.vel.Y * dt; } }
    } else {
      for (const { o, b } of boxes) { if (pos.X + hw > b.min.X && pos.X - hw < b.max.X && pos.Z + hw > b.min.Z && pos.Z - hw < b.max.Z) { if (b.min.Y >= pos.Y + 2 - 0.05 && b.min.Y < ny + 2) { ny = b.min.Y - 2; v = new Vector3(v.X, 0, v.Z); } } }
    }
    // ride moving anchored platforms (tweened): follow their delta
    if (hum.floor && hum.floor.lastPos) { const d = hum.floor.cf.pos.sub(hum.floor.lastPos); if (d.mag < 5) { pos = new Vector3(pos.X + d.X, pos.Y, pos.Z + d.Z); ny += d.Y; } }
    for (const p of this.parts()) if (p.p.Anchored) p.lastPos = p.cf.pos;
    pos = new Vector3(pos.X, ny, pos.Z);
    st.vel = v; st.speed = Math.hypot(v.X, v.Z) / Math.max(1, speed); if (st.speed > 0.05 && st.grounded) st.walk += dt * 10; else st.walk *= 0.8;
    root.cf = new CFrame(pos.X, pos.Y, pos.Z, mat.ry(st.yaw));
    this.poseCharacter(ch, 0);
    if (pos.Y < fallY) { if (!hum.dead) this.R.setindex(hum, 'Health', 0); }
    // proximity prompts
    this.nearPrompt = null; let bestD = Infinity;
    for (const pr of this.allInstances) if (pr.ClassName === 'ProximityPrompt' && pr.p.Enabled && pr.parent && pr.parent.isA && pr.parent.isA('BasePart') && isDesc(pr, this.workspace)) { const d = pr.parent.cf.pos.sub(pos).mag; if (d <= pr.p.MaxActivationDistance && d < bestD) { bestD = d; this.nearPrompt = pr; } }
    if (this.nearPrompt !== this.shownPrompt) { if (this.shownPrompt && !this.shownPrompt.destroyed) this.shownPrompt.sig('PromptHidden').fire(); if (this.nearPrompt) this.nearPrompt.sig('PromptShown').fire(); this.shownPrompt = this.nearPrompt; }
  }
  triggerPrompt(pr) { pr = pr || this.nearPrompt; if (!pr || !this.player) return; pr.sig('Triggered').fire(this.player); pr.sig('TriggerEnded').fire(this.player); }
  touches() {
    const parts = this.parts(); const now = new Set();
    const ch = this.player && this.player.p.Character;
    const limbs = ch && !ch.destroyed ? ch.children.filter(c => c.isA('BasePart') && !c.broken) : [];
    const hum = ch && ch.children.find(c => c.ClassName === 'Humanoid');
    const overlap = (a, b, e = 0.06) => a.max.X > b.min.X - e && a.min.X < b.max.X + e && a.max.Y > b.min.Y - e && a.min.Y < b.max.Y + e && a.max.Z > b.min.Z - e && a.min.Z < b.max.Z + e;
    const others = parts.filter(p => !(p.parent && p.parent.isCharacter) && p.p.CanTouch && !p.destroyed);
    const pairs = [];
    for (const l of limbs) { const lb = this.aabb(l); for (const p of others) { if (overlap(lb, this.aabb(p))) pairs.push([l, p]); } }
    const loose = others.filter(p => !p.p.Anchored);
    for (const a of loose) { const ab = this.aabb(a); for (const b of others) if (b !== a && (b.p.Anchored || b.id > a.id) && overlap(ab, this.aabb(b), 0.02)) pairs.push([a, b]); }
    for (const [a, b] of pairs) {
      const key = '#' + a.id + '#|#' + b.id + '#'; now.add(key);
      if (!this.contacts.has(key)) {
        this.contacts.set(key, true);
        if (!a.destroyed && !b.destroyed) { b.sigs.Touched && b.sigs.Touched.fire(a); a.sigs.Touched && a.sigs.Touched.fire(b); if (a.charPart && hum && hum.sigs.Touched) hum.sigs.Touched.fire(b, a); }
      }
    }
    for (const key of [...this.contacts.keys()]) if (!now.has(key)) { this.contacts.delete(key); const [ai, bi] = key.split('|'); const a = this.byIdFast(ai), b = this.byIdFast(bi); if (a && b) { b.sigs.TouchEnded && b.sigs.TouchEnded.fire(a); a.sigs.TouchEnded && a.sigs.TouchEnded.fire(b); } }
  }
  byIdFast(tag) { const id = +tag.replace(/#/g, ''); return this.parts().find(p => p.id === id) || (this.player && this.player.p.Character && this.player.p.Character.children.find(c => c.id === id)); }
  // ---- input from the UI ----
  keyEvent(name, down) {
    const uis = this.services.UserInputService; const kc = ENUM.type('KeyCode').items.get(name); if (!kc) return;
    if (down) this.keysDown.add(name); else this.keysDown.delete(name);
    const io = inputObject(kc, down);
    uis.sig(down ? 'InputBegan' : 'InputEnded').fire(io, false);
    if (down && name === 'E' && this.nearPrompt) this.triggerPrompt();
    if (down && name === 'Space') uis.sigs.JumpRequest && uis.sigs.JumpRequest.fire();
  }
  clickPart(part) {
    const uis = this.services.UserInputService;
    uis.sig('InputBegan').fire(inputObject(null, true, 'MouseButton1'), false);
    if (this._mouse) this._mouse.sig('Button1Down').fire();
    if (!part) return;
    const cd = part.children.find(c => c.ClassName === 'ClickDetector') || (part.parent && part.parent.ClassName === 'Model' && part.parent.children.find(c => c.ClassName === 'ClickDetector'));
    if (cd && this.player) {
      const ch = this.player.p.Character; const root = ch && ch.children.find(c => c.p.Name === 'HumanoidRootPart');
      if (!root || root.cf.pos.sub(part.cf.pos).mag <= cd.p.MaxActivationDistance + Math.max(part.p.Size.X, part.p.Size.Z) / 2) cd.sig('MouseClick').fire(this.player);
      else this.out('info', `(Too far away to click ${part.p.Name}. Walk closer: MaxActivationDistance is ${cd.p.MaxActivationDistance} studs)`);
    }
  }
  clickGui(btn) { if (!btn || btn.destroyed) return; btn.sig('MouseButton1Down').fire(); btn.sig('MouseButton1Up').fire(); btn.sig('MouseButton1Click').fire(); btn.sig('Activated').fire(inputObject(null, true, 'MouseButton1'), 1); }
  stop() {
    if (this.stopped) return;
    const pl = this.player;
    if (pl) { try { this.services.Players.sig('PlayerRemoving').fire(pl); } catch (e) { } }
    for (const fn of this.closeHandlers) { try { const th = this.S.spawn(fn, [], 'BindToClose'); this.S.resume(th); for (let i = 0; i < 20 && th.status !== 'dead'; i++) this.S.step(0.2); } catch (e) { } }
    this.stopped = true; this.S.killAll();
  }
}
function isDesc(i, anc) { for (let a = i; a; a = a.parent) if (a === anc) return true; return false; }
function inputObject(kc, down, type) { const t = new LuaTable(); t.set('KeyCode', kc || ENUM.get('KeyCode', 'Unknown')); t.set('UserInputType', ENUM.get('UserInputType', type || 'Keyboard')); t.set('UserInputState', ENUM.get('UserInputState', down ? 'Begin' : 'End')); t.set('Position', new Vector3()); return t; }
function padLines(src, n) { return n > 0 ? '\n'.repeat(n) + src : src; }

/* ---------------- script headers: split one editor into several scripts ---------------- */
// --!Script                      -> Script in ServerScriptService
// --!Script Workspace.Lava       -> Script inside that object (script.Parent is Lava)
// --!LocalScript                 -> LocalScript in StarterPlayerScripts
// --!LocalScript StarterGui.Shop -> LocalScript inside a ScreenGui
// --!ModuleScript ReplicatedStorage.Coins -> ModuleScript named Coins
function splitScripts(code) {
  const lines = code.split('\n'); const out = []; let cur = null; let pre = [];
  const head = /^\s*--!\s*(Script|LocalScript|ModuleScript)\b\s*([\w.]*)\s*(?:--.*)?$/;
  lines.forEach((ln, i) => {
    const m = ln.match(head);
    if (m) {
      if (cur) out.push(cur);
      let kind = m[1], path = m[2] || '', name = kind, parentPath = '';
      if (kind === 'ModuleScript') { const segs = path.split('.').filter(Boolean); if (segs.length >= 2) { name = segs.pop(); parentPath = segs.join('.'); } else if (segs.length === 1) { name = segs[0]; parentPath = 'ReplicatedStorage'; } else { name = 'ModuleScript'; parentPath = 'ReplicatedStorage'; } }
      else parentPath = path;
      cur = { kind, name, parentPath, source: '', firstLine: i + 1, lines: [] };
      return;
    }
    if (cur) cur.lines.push(ln); else pre.push(ln);
  });
  if (cur) out.push(cur);
  if (!out.length) return [{ kind: 'Script', name: 'Script', parentPath: '', source: code, firstLine: 0 }];
  const hasPre = pre.some(l => l.trim() && !/^\s*--/.test(l));
  for (const s of out) s.source = s.lines.join('\n');
  if (hasPre) out.unshift({ kind: 'Script', name: 'Script', parentPath: '', source: pre.join('\n'), firstLine: 0 });
  return out;
}

root.RobloxSim = { World, Vector3, Vector2, Color3, BrickColor, CFrame, UDim2, UDim, TweenInfo, EnumItem, ENUM, Instance, Signal, CLS, mat, splitScripts, shapeOf, isDesc, ease };
})(typeof window !== 'undefined' ? window : globalThis);

/* ================= LuauUI: 3D view, Explorer, Output, and test runner ================= */
(function (root) {
'use strict';
const { World, Vector3, Color3, CFrame, mat, splitScripts, shapeOf, isDesc } = root.RobloxSim;
const { LuaTable, NativeFn, LuaError, errText } = root.LuauVM;
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- Renderer ---------------- */
const BOX_FACES = [ // [corner indices], outward normal
  [[4, 5, 7, 6], [1, 0, 0]], [[1, 0, 2, 3], [-1, 0, 0]], [[2, 6, 7, 3], [0, 1, 0]], [[0, 1, 5, 4], [0, -1, 0]], [[1, 3, 7, 5], [0, 0, 1]], [[0, 4, 6, 2], [0, 0, -1]],
];
const CORNERS = [[-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1]];
class Renderer {
  constructor(canvas, world) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.W = world;
    this.cam = { yaw: 0, pitch: 0.42, dist: 30, target: new Vector3(0, 3, 10) };
    this.drawn = []; this.fov = 70 * Math.PI / 180;
  }
  resize() {
    const r = this.cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(200, Math.round(r.width)), h = Math.max(150, Math.round(r.height));
    if (this.cv.width !== Math.round(w * dpr) || this.cv.height !== Math.round(h * dpr)) { this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr); }
    this.w = w; this.h = h; this.dpr = dpr; this.W.viewW = w; this.W.viewH = h;
  }
  setupCam() {
    const W = this.W, c = this.cam;
    const ch = W.player && W.player.p.Character, root = ch && !ch.destroyed && ch.children.find(x => x.p.Name === 'HumanoidRootPart');
    if (root) { const t = root.cf.pos.add(new Vector3(0, 1.5, 0)); c.target = W.camReset ? t : c.target.lerp(t, 0.25); if (W.camReset) { c.yaw = 0; W.camReset = false; } }
    W.camYaw = c.yaw;
    const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    this.eye = new Vector3(c.target.X + Math.sin(c.yaw) * cp * c.dist, c.target.Y + sp * c.dist, c.target.Z + Math.cos(c.yaw) * cp * c.dist);
    const F = c.target.sub(this.eye).unit(); const Rt = F.cross(new Vector3(0, 1, 0)).unit(); const U = Rt.cross(F);
    this.F = F; this.Rt = Rt; this.U = U; this.f = (this.h / 2) / Math.tan(this.fov / 2);
  }
  toCam(p) { const d = p.sub(this.eye); return [d.dot(this.Rt), d.dot(this.U), d.dot(this.F)]; }
  proj(c) { return [this.w / 2 + c[0] * this.f / c[2], this.h / 2 - c[1] * this.f / c[2]]; }
  clip(poly) { // poly: camera-space points; clip against z > near
    const near = 0.2, out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ain = a[2] > near, bin = b[2] > near;
      if (ain) out.push(a);
      if (ain !== bin) { const t = (near - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, near]); }
    }
    return out;
  }
  daylight() { const L = this.W.services.Lighting; const t = L.p.ClockTime; const d = Math.max(0, Math.min(1, (Math.sin((t - 6) / 12 * Math.PI) + 0.25) / 0.6)); return 0.38 + 0.62 * d * Math.min(1.2, L.p.Brightness / 2 + 0.4); }
  sky() {
    const ctx = this.ctx, t = this.W.services.Lighting.p.ClockTime;
    const day = Math.max(0, Math.min(1, (Math.sin((t - 6) / 12 * Math.PI) + 0.15) / 0.5));
    const dusk = Math.max(0, 1 - Math.abs(Math.sin((t - 6) / 12 * Math.PI)) * 3) * (t > 4 && t < 20 ? 1 : 0);
    const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
    let top = mix([10, 14, 38], [92, 160, 235], day), bot = mix([28, 32, 64], [205, 228, 250], day);
    if (dusk > 0) { top = mix(top, [90, 80, 150], dusk * 0.6); bot = mix(bot, [250, 150, 90], dusk * 0.8); }
    const g = ctx.createLinearGradient(0, 0, 0, this.h); g.addColorStop(0, `rgb(${top})`); g.addColorStop(1, `rgb(${bot})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
    if (day < 0.3) { ctx.fillStyle = `rgba(255,255,255,${(0.3 - day) * 2.5})`; for (let i = 0; i < 60; i++) { const x = (i * 97.3 % 1) * this.w, y = ((i * 57.7) % 1) * this.h * 0.6; ctx.fillRect((x + i * 37) % this.w, (y + i * 13) % (this.h * 0.6), 1.4, 1.4); } }
  }
  shade(color, n, light, k = 1) {
    const L = [0.35, 0.85, 0.4]; const len = Math.hypot(...L);
    let d = (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / len;
    const s = (0.58 + 0.42 * Math.max(0, d)) * light * k;
    return [color.R * s, color.G * s, color.B * s];
  }
  partPolys(p) {
    const s = p.p.Size, h = [s.X / 2, s.Y / 2, s.Z / 2], R = p.cf.R, o = [p.cf.x, p.cf.y, p.cf.z];
    const w = l => { const v = mat.vec(R, l[0], l[1], l[2]); return new Vector3(v[0] + o[0], v[1] + o[1], v[2] + o[2]); };
    const shape = shapeOf(p);
    const faces = [];
    if (shape === 'Wedge') {
      const V = [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [-1, 1, 1], [1, 1, 1]].map(c => w([c[0] * h[0], c[1] * h[1], c[2] * h[2]]));
      const sl = norm([0, s.Z, -s.Y]);
      faces.push([[V[0], V[3], V[2], V[1]], [0, -1, 0]], [[V[3], V[4], V[5], V[2]], [0, 0, 1]], [[V[0], V[4], V[3]], [-1, 0, 0]], [[V[1], V[2], V[5]], [1, 0, 0]], [[V[0], V[1], V[5], V[4]], sl]);
    } else if (shape === 'Cylinder') {
      const N = 14, r = Math.min(h[1], h[2]); const ringA = [], ringB = [];
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; const y = Math.cos(a) * r, z = Math.sin(a) * r; ringA.push(w([-h[0], y, z])); ringB.push(w([h[0], y, z])); }
      for (let i = 0; i < N; i++) { const j = (i + 1) % N; const a = (i + 0.5) / N * Math.PI * 2; faces.push([[ringA[i], ringB[i], ringB[j], ringA[j]], [0, Math.cos(a), Math.sin(a)]]); }
      faces.push([ringB.slice(), [1, 0, 0]], [ringA.slice().reverse(), [-1, 0, 0]]);
    } else {
      const V = CORNERS.map(c => w([c[0] * h[0], c[1] * h[1], c[2] * h[2]]));
      for (const [idx, n] of BOX_FACES) faces.push([idx.map(i => V[i]), n]);
    }
    return faces.map(([pts, n]) => [pts, mat.vec(R, n[0], n[1], n[2])]);
  }
  draw() {
    this.resize(); this.setupCam();
    const ctx = this.ctx, W = this.W; ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sky();
    const light = this.daylight();
    const parts = W.parts().filter(p => p.p.Transparency < 0.99 && !p.destroyed && !(p.p.Name === 'HumanoidRootPart' && p.charPart));
    const eye = this.eye;
    const items = parts.map(p => {
      const s = p.p.Size, big = Math.max(s.X, s.Y, s.Z) > 30;
      let key;
      if (big) { const b = W.aabb(p); key = -Infinity; for (const c of CORNERS) { const q = new Vector3(c[0] < 0 ? b.min.X : b.max.X, c[1] < 0 ? b.min.Y : b.max.Y, c[2] < 0 ? b.min.Z : b.max.Z); key = Math.max(key, q.sub(eye).mag); } key += 1000; }
      else key = p.cf.pos.sub(eye).mag;
      return { p, key };
    }).sort((a, b) => b.key - a.key);
    this.drawn = [];
    const ch = W.player && W.player.p.Character;
    let shadowDone = false;
    for (const { p, key } of items) {
      if (!shadowDone && ch && p.parent === ch && key < 1000) { this.shadow(ch); shadowDone = true; }
      this.drawPart(p, light);
      if (p.isBaseplate) this.grid(p);
    }
    if (!shadowDone && ch) this.shadow(ch);
    this.labels(ch);
  }
  drawPart(p, light) {
    const ctx = this.ctx; const shape = shapeOf(p); const col = p.p.Color; const mat2 = p.p.Material.Name;
    const neon = mat2 === 'Neon', glass = mat2 === 'Glass', ff = mat2 === 'ForceField';
    const alpha = (1 - p.p.Transparency) * (glass ? 0.55 : ff ? 0.35 : 1);
    if (alpha <= 0.01) return;
    if (shape === 'Ball') return this.drawBall(p, light, alpha, neon);
    const polys = this.partPolys(p);
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineJoin = 'round';
    if (neon) { ctx.shadowColor = col.css(1.1); ctx.shadowBlur = 14; }
    const isHead = p.p.Name === 'Head' && p.charPart && shape === 'Block';
    for (let fi = 0; fi < polys.length; fi++) {
      const [pts, n] = polys[fi];
      const c = pts.reduce((a, q) => a.add(q), new Vector3()).mul(1 / pts.length);
      if (n[0] * (this.eye.X - c.X) + n[1] * (this.eye.Y - c.Y) + n[2] * (this.eye.Z - c.Z) <= 0) continue;
      let cp = pts.map(q => this.toCam(q)); cp = this.clip(cp); if (cp.length < 3) continue;
      const sp = cp.map(q => this.proj(q));
      const rgb = neon ? [col.R * 1.15, col.G * 1.15, col.B * 1.15] : this.shade(col, n, light, matTint(mat2));
      ctx.fillStyle = `rgb(${rgb.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255))})`;
      ctx.beginPath(); ctx.moveTo(sp[0][0], sp[0][1]); for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i][0], sp[i][1]); ctx.closePath(); ctx.fill();
      if (!neon && shape !== 'Cylinder') { ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; ctx.stroke(); }
      this.drawn.push({ p, sp });
      if (isHead && fi === 5) this.face(p);
      if (mat2 === 'Wood' || mat2 === 'WoodPlanks' || mat2 === 'Brick' || mat2 === 'Grass' || mat2 === 'Sand') this.texture(sp, mat2);
    }
    ctx.restore();
    if (p.ClassName === 'SpawnLocation') this.spawnMark(p);
    if (p.children.some(c => (c.ClassName === 'PointLight' || c.ClassName === 'SurfaceLight') && c.p.Enabled)) this.glow(p);
    if (p.children.some(c => c.ClassName === 'Fire' && c.p.Enabled)) this.fire(p);
  }
  texture(sp, m) {
    const ctx = this.ctx; ctx.save(); ctx.clip(); ctx.globalAlpha *= 0.18; ctx.strokeStyle = m === 'Grass' ? '#2c5' : '#000'; ctx.lineWidth = 1;
    const xs = sp.map(q => q[0]), ys = sp.map(q => q[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const step = m === 'Brick' ? 8 : 6;
    ctx.beginPath(); for (let y = y0; y < y1; y += step) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    if (m === 'Brick') for (let y = y0, r = 0; y < y1; y += step, r++) for (let x = x0 + (r % 2) * 8; x < x1; x += 16) { ctx.moveTo(x, y); ctx.lineTo(x, y + step); }
    ctx.stroke(); ctx.restore();
  }
  face(head) {
    const ctx = this.ctx; const pts = [[-0.35, 0.12, -0.51], [0.35, 0.12, -0.51]].map(l => this.toCam(head.cf.point(new Vector3(...l))));
    if (pts.some(q => q[2] < 0.3)) return;
    const r = Math.max(1, 0.09 * this.f / pts[0][2]);
    ctx.save(); ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.fillStyle = '#111';
    for (const q of pts) { const s = this.proj(q); ctx.beginPath(); ctx.ellipse(s[0], s[1], r * 0.8, r * 1.3, 0, 0, 7); ctx.fill(); }
    const m = [[-0.4, -0.12, -0.51], [0, -0.3, -0.51], [0.4, -0.12, -0.51]].map(l => this.proj(this.toCam(head.cf.point(new Vector3(...l)))));
    ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(1, r * 0.6); ctx.beginPath(); ctx.moveTo(m[0][0], m[0][1]); ctx.quadraticCurveTo(m[1][0], m[1][1] + (m[1][1] - (m[0][1] + m[2][1]) / 2), m[2][0], m[2][1]); ctx.stroke(); ctx.restore();
  }
  drawBall(p, light, alpha, neon) {
    const ctx = this.ctx; const c = this.toCam(p.cf.pos); if (c[2] < 0.3) return;
    const r = p.p.Size.X / 2 * this.f / c[2]; const s = this.proj(c); const col = p.p.Color;
    ctx.save(); ctx.globalAlpha = alpha;
    if (neon) { ctx.shadowColor = col.css(1.1); ctx.shadowBlur = 16; }
    const g = ctx.createRadialGradient(s[0] - r * 0.35, s[1] - r * 0.4, r * 0.1, s[0], s[1], r);
    g.addColorStop(0, col.css(neon ? 1.3 : 1.25 * light)); g.addColorStop(1, col.css(neon ? 1 : 0.55 * light));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s[0], s[1], Math.max(0.5, r), 0, Math.PI * 2); ctx.fill(); ctx.restore();
    this.drawn.push({ p, circle: [s[0], s[1], r] });
  }
  grid(base) {
    const ctx = this.ctx; const top = this.W.aabb(base).max.Y + 0.02; const b = this.W.aabb(base);
    const cx = Math.round(this.cam.target.X / 4) * 4, cz = Math.round(this.cam.target.Z / 4) * 4, R = 72;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1; ctx.beginPath();
    const line = (a, c) => { let p1 = this.toCam(a), p2 = this.toCam(c); if (p1[2] < 0.2 && p2[2] < 0.2) return; if (p1[2] < 0.2 || p2[2] < 0.2) { const t = (0.2 - p1[2]) / (p2[2] - p1[2]); const q = [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t, 0.2]; if (p1[2] < 0.2) p1 = q; else p2 = q; } const s1 = this.proj(p1), s2 = this.proj(p2); ctx.moveTo(s1[0], s1[1]); ctx.lineTo(s2[0], s2[1]); };
    for (let x = Math.max(b.min.X, cx - R); x <= Math.min(b.max.X, cx + R); x += 4) line(new Vector3(x, top, Math.max(b.min.Z, cz - R)), new Vector3(x, top, Math.min(b.max.Z, cz + R)));
    for (let z = Math.max(b.min.Z, cz - R); z <= Math.min(b.max.Z, cz + R); z += 4) line(new Vector3(Math.max(b.min.X, cx - R), top, z), new Vector3(Math.min(b.max.X, cx + R), top, z));
    ctx.stroke(); ctx.restore();
  }
  spawnMark(p) {
    const top = this.W.aabb(p).max.Y + 0.03; const c = p.cf.pos; const r = Math.min(p.p.Size.X, p.p.Size.Z) * 0.3;
    const pts = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; pts.push(this.toCam(new Vector3(c.X + Math.cos(a) * r, top, c.Z + Math.sin(a) * r))); }
    if (pts.some(q => q[2] < 0.2)) return; const sp = pts.map(q => this.proj(q));
    const ctx = this.ctx; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); sp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.stroke(); ctx.restore();
  }
  glow(p) { const c = this.toCam(p.cf.pos); if (c[2] < 0.3) return; const s = this.proj(c); const L = p.children.find(x => x.ClassName === 'PointLight' || x.ClassName === 'SurfaceLight'); const r = L.p.Range * this.f / c[2]; const ctx = this.ctx; const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r); g.addColorStop(0, L.p.Color.css().replace('rgb', 'rgba').replace(')', `,${Math.min(0.5, L.p.Brightness * 0.15)})`)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, 7); ctx.fill(); ctx.restore(); }
  fire(p) { const top = this.W.aabb(p).max.Y; const c = this.toCam(new Vector3(p.cf.x, top + 1, p.cf.z)); if (c[2] < 0.3) return; const s = this.proj(c); const k = this.f / c[2]; const ctx = this.ctx; const t = performance.now() / 120; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const r = (1.2 + Math.sin(t + i) * 0.3) * k * (1 - i * 0.12); ctx.fillStyle = `rgba(255,${120 + i * 20},40,0.25)`; ctx.beginPath(); ctx.ellipse(s[0] + Math.sin(t * 1.3 + i) * k * 0.2, s[1] - i * k * 0.35, r * 0.6, r, 0, 0, 7); ctx.fill(); } ctx.restore(); }
  shadow(ch) {
    const root = ch.children.find(c => c.p.Name === 'HumanoidRootPart'); if (!root) return;
    const pos = root.cf.pos; const top = this.W.groundBelow(new Vector3(pos.X, pos.Y - 3 + 0.1, pos.Z), 0.5, null); if (!Number.isFinite(top)) return;
    const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; pts.push(this.toCam(new Vector3(pos.X + Math.cos(a) * 1.4, top + 0.03, pos.Z + Math.sin(a) * 0.9))); }
    if (pts.some(q => q[2] < 0.2)) return; const sp = pts.map(q => this.proj(q)); const ctx = this.ctx;
    ctx.save(); ctx.fillStyle = `rgba(0,0,0,${Math.max(0.08, 0.3 - (pos.Y - 3 - top) * 0.02)})`; ctx.beginPath(); sp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.fill(); ctx.restore();
  }
  labels(ch) {
    this.labelPos = null;
    if (ch && !ch.destroyed) { const head = ch.children.find(c => c.p.Name === 'Head'); if (head && !head.broken) { const c = this.toCam(head.cf.pos.add(new Vector3(0, 1.6, 0))); if (c[2] > 0.3) this.labelPos = this.proj(c); } }
    this.promptPos = null; const pr = this.W.nearPrompt;
    if (pr && pr.parent) { const c = this.toCam(pr.parent.cf.pos.add(new Vector3(0, pr.parent.p.Size.Y / 2 + 1.5, 0))); if (c[2] > 0.3) this.promptPos = this.proj(c); }
  }
  pick(x, y) {
    for (let i = this.drawn.length - 1; i >= 0; i--) {
      const d = this.drawn[i];
      if (d.circle) { if (Math.hypot(x - d.circle[0], y - d.circle[1]) <= d.circle[2]) return d.p; continue; }
      if (inPoly(x, y, d.sp)) return d.p;
    }
    return null;
  }
}
function norm(v) { const m = Math.hypot(...v) || 1; return v.map(x => x / m); }
function matTint(m) { return { Neon: 1.2, SmoothPlastic: 1.02, Glass: 1.1, Ice: 1.08, Metal: 0.92, DiamondPlate: 0.92, Slate: 0.85, Rock: 0.85, Basalt: 0.8, Asphalt: 0.82, CrackedLava: 0.95 }[m] || 1; }
function inPoly(x, y, pts) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }

/* ---------------- Output console ---------------- */
function writeLine(el, kind, text) {
  if (!el) return;
  if (el.dataset.fresh) { el.innerHTML = ''; delete el.dataset.fresh; }
  if (el.childElementCount > 400) el.firstElementChild.remove();
  const d = document.createElement('div'); d.className = 'lo lo-' + kind; d.textContent = text;
  if (kind === 'error' && root.explainLuauError) { const h = root.explainLuauError(text); if (h) d.insertAdjacentHTML('beforeend', h); }
  el.appendChild(d); el.scrollTop = el.scrollHeight;
}

/* ---------------- Explorer ---------------- */
const ICON = { Workspace: '🌐', Players: '👥', Player: '🙂', Lighting: '💡', ReplicatedStorage: '📦', ServerScriptService: '🗄️', ServerStorage: '🗃️', StarterGui: '🖼️', StarterPlayer: '🧍', Part: '🧱', SpawnLocation: '🏁', WedgePart: '📐', Model: '🧩', Folder: '📁', Script: '📜', LocalScript: '📘', ModuleScript: '📗', Humanoid: '🫀', IntValue: '🔢', NumberValue: '🔢', StringValue: '🔤', BoolValue: '☑️', RemoteEvent: '📡', RemoteFunction: '📞', BindableEvent: '🔔', ScreenGui: '🖥️', TextLabel: '🏷️', TextButton: '🔘', Frame: '▭', ClickDetector: '🖱️', ProximityPrompt: '⌨️', Sound: '🔊', PointLight: '💡', Fire: '🔥', PlayerGui: '🖼️', PlayerScripts: '📚', Backpack: '🎒', Camera: '🎥' };
const SHOW_SERVICES = ['Workspace', 'Players', 'Lighting', 'ReplicatedStorage', 'ServerScriptService', 'ServerStorage', 'StarterGui', 'StarterPlayer'];
function propList(inst) {
  const keys = ['Name', 'ClassName'];
  const want = { BasePart: ['Position', 'Size', 'Color', 'BrickColor', 'Material', 'Transparency', 'Anchored', 'CanCollide', 'Orientation', 'Shape'], ValueBase: ['Value'], Humanoid: ['Health', 'MaxHealth', 'WalkSpeed', 'JumpPower'], Player: ['UserId', 'Character'], Lighting: ['ClockTime', 'Brightness'], GuiObject: ['Position', 'Size', 'Visible', 'BackgroundColor3'], TextLabel: ['Text'], TextButton: ['Text'], ClickDetector: ['MaxActivationDistance'], ProximityPrompt: ['ActionText', 'HoldDuration', 'MaxActivationDistance'], Workspace: ['Gravity'], Players: ['RespawnTime'] };
  for (const [cls, ks] of Object.entries(want)) if (inst.isA(cls)) for (const k of ks) if (!keys.includes(k)) keys.push(k);
  return keys.map(k => { let v; try { v = inst.W.R.index(inst, k); } catch (e) { return null; } return [k, v]; }).filter(Boolean);
}
function fmtVal(R, v) { if (v === undefined) return 'nil'; if (v && v.__rbxType === 'Instance') return v.p.Name; if (v instanceof Color3) return `<span class="lx-sw" style="background:${v.css()}"></span>[${Math.round(v.R * 255)}, ${Math.round(v.G * 255)}, ${Math.round(v.B * 255)}]`; return escH(R.tostr(v)); }

/* ---------------- Keyboard map ---------------- */
const KEYMAP = { Space: 'Space', Enter: 'Return', Escape: 'Escape', Backspace: 'Backspace', Tab: 'Tab', ShiftLeft: 'LeftShift', ShiftRight: 'RightShift', ControlLeft: 'LeftControl', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Digit0: 'Zero', Digit1: 'One', Digit2: 'Two', Digit3: 'Three', Digit4: 'Four', Digit5: 'Five', Digit6: 'Six', Digit7: 'Seven', Digit8: 'Eight', Digit9: 'Nine', F1: 'F1', F2: 'F2' };
const keyName = e => KEYMAP[e.code] || (e.code.startsWith('Key') ? e.code.slice(3) : null);

/* ---------------- The play area ---------------- */
let ACTIVE = null;
class Stage {
  // host: element to fill. opts: { consoleEl, mode: 'world'|'console', setup, height, onRun }
  constructor(host, opts = {}) {
    this.host = host; this.opts = opts; this.mode = opts.mode || 'world';
    if (this.mode === 'world') {
      host.classList.add('lx-stage-wrap');
      host.innerHTML = `<div class="lx-bar"><span class="lx-status mono"><i class="lx-dot"></i><span class="lx-st">Ready</span></span><span class="lx-tools"><button type="button" class="btn sm ghost" data-x="explorer" title="Show the Explorer, like in Roblox Studio">🗂 Explorer</button><button type="button" class="btn sm ghost" data-x="cam" title="Reset the camera">🎥</button><button type="button" class="btn sm ghost" data-x="full" title="Full screen">⛶</button><button type="button" class="btn sm ghost" data-x="stop" title="Stop the game">■ Stop</button></span></div>
        <div class="lx-body"><div class="lx-stage" tabindex="0" aria-label="3D game view. Click to focus, then use W A S D or the arrow keys to move and Space to jump. Drag to turn the camera, scroll to zoom.">
          <canvas class="lx-canvas"></canvas><div class="lx-gui"></div><div class="lx-lb"></div><div class="lx-hp"></div><div class="lx-name"></div><div class="lx-prompt"></div>
          <div class="lx-hint">Press ▶ Run to start the game</div><div class="lx-msg"></div>
          <div class="lx-touch"><button data-k="up">▲</button><button data-k="left">◀</button><button data-k="down">▼</button><button data-k="right">▶</button></div><div class="lx-touch lx-tjump"><button data-k="jump">Jump</button></div>
        </div><aside class="lx-explorer hidden" aria-label="Explorer"><div class="lx-ex-tree"></div><div class="lx-ex-props"></div></aside></div>
        <div class="lx-help muted">🎮 Click the game, then <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to move, <kbd>Space</kbd> to jump, <kbd>E</kbd> to interact. Drag to look around, scroll to zoom, click parts to click them.</div>`;
      this.stage = host.querySelector('.lx-stage'); this.canvas = host.querySelector('.lx-canvas'); this.guiEl = host.querySelector('.lx-gui');
      if (opts.height) this.stage.style.height = opts.height + 'px';
      this.wireStage();
    }
    this.consoleEl = opts.consoleEl;
  }
  status(text, kind) { const s = this.host.querySelector('.lx-st'); if (s) s.textContent = text; this.host.classList.toggle('lx-running', kind === 'run'); }
  run(code) {
    this.stop(true);
    if (ACTIVE && ACTIVE !== this) ACTIVE.stop(); ACTIVE = this;
    if (this.consoleEl) { this.consoleEl.innerHTML = ''; }
    const lines = [];
    const out = (k, t) => { lines.push({ k, t }); writeLine(this.consoleEl, k, t); };
    const W = this.world = new World({ out, playerName: this.opts.playerName, noPlayer: this.mode === 'console', empty: this.mode === 'console' });
    installHelpers(W, lines);
    if (this.mode === 'world') { this.rend = new Renderer(this.canvas, W); this.host.querySelector('.lx-hint').style.display = 'none'; this.host.querySelector('.lx-msg').textContent = ''; this.guiEls = new Map(); this.guiEl.innerHTML = ''; }
    const scripts = splitScripts(code);
    if (this.opts.setup) scripts.unshift({ kind: 'Script', name: 'Setup', parentPath: 'ServerStorage', source: this.opts.setup, firstLine: 0, hidden: true });
    try { this.setupFirst(W, scripts); }
    catch (e) { out('error', errText(e)); }
    this.running = true; this.status(this.mode === 'console' ? 'Running…' : 'Playing', 'run');
    this.last = performance.now(); this.startT = this.last;
    const loop = now => {
      if (!this.running) return;
      const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
      try {
        let left = dt; while (left > 1e-6) { const s = Math.min(left, 1 / 30); W.step(s); left -= s; }
        if (this.mode === 'world') { this.rend.draw(); this.overlay(); if (this.exOpen && now - (this.exT || 0) > 600) { this.exT = now; this.explorer(); } }
      } catch (e) { out('error', 'Simulator error: ' + (e && e.message || e)); console.error(e); this.stop(); return; }
      if (this.mode === 'console' && !W.S.threads.length && !W.timers.length) { this.finish('Done'); return; }
      if (this.mode === 'console' && now - this.startT > 60000) { out('warn', 'Stopped after 60 seconds.'); this.finish('Stopped'); return; }
      if (W.kicked) { this.host.querySelector('.lx-msg').textContent = 'Disconnected: ' + W.kicked; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
    if (this.mode === 'world') setTimeout(() => this.stage.focus({ preventScroll: true }), 50);
  }
  setupFirst(W, scripts) {
    const setup = scripts.find(s => s.hidden);
    if (setup) {
      const fn = W.R.load(setup.source, 'Setup', W.envFor(null));
      const th = W.S.spawn(fn, [], 'Setup'); W.S.resume(th);
      scripts = scripts.filter(s => !s.hidden);
    }
    W.start(scripts);
  }
  finish(msg) { this.running = false; cancelAnimationFrame(this.raf); this.status(msg); if (this.world) this.world.stop(); if (this.consoleEl && !this.consoleEl.childElementCount) this.consoleEl.innerHTML = '<span class="muted">(no output)</span>'; }
  stop(silent) {
    if (!this.world) return;
    this.running = false; cancelAnimationFrame(this.raf);
    try { this.world.stop(); } catch (e) { }
    if (!silent) this.status('Stopped');
    if (ACTIVE === this) ACTIVE = null;
  }
  wireStage() {
    const st = this.stage, host = this.host;
    host.querySelector('[data-x="stop"]').onclick = () => this.stop();
    host.querySelector('[data-x="cam"]').onclick = () => { if (this.rend) { this.rend.cam.yaw = 0; this.rend.cam.pitch = 0.42; this.rend.cam.dist = 30; } st.focus(); };
    host.querySelector('[data-x="full"]').onclick = () => { const el = host; if (document.fullscreenElement) document.exitFullscreen(); else (el.requestFullscreen || el.webkitRequestFullscreen || (() => { })).call(el); };
    host.querySelector('[data-x="explorer"]').onclick = () => { this.exOpen = !this.exOpen; host.querySelector('.lx-explorer').classList.toggle('hidden', !this.exOpen); this.exT = 0; if (this.exOpen) this.explorer(); };
    const keys = new Set();
    const sync = () => { if (!this.world) return; const I = this.world.input; I.x = (keys.has('D') || keys.has('Right') ? 1 : 0) - (keys.has('A') || keys.has('Left') ? 1 : 0); I.z = (keys.has('S') || keys.has('Down') ? 1 : 0) - (keys.has('W') || keys.has('Up') ? 1 : 0); I.jump = keys.has('Space'); };
    st.addEventListener('keydown', e => { const k = keyName(e); if (!k) return; if (['Space', 'Up', 'Down', 'Left', 'Right'].includes(k)) e.preventDefault(); if (!keys.has(k)) { keys.add(k); this.world && this.running && this.world.keyEvent(k, true); } sync(); });
    st.addEventListener('keyup', e => { const k = keyName(e); if (!k) return; keys.delete(k); this.world && this.running && this.world.keyEvent(k, false); sync(); });
    st.addEventListener('blur', () => { keys.clear(); sync(); });
    let drag = null;
    st.addEventListener('pointerdown', e => { if (e.target.closest('.lx-gui button, .lx-touch, .lx-prompt')) return; st.focus({ preventScroll: true }); drag = { x: e.clientX, y: e.clientY, moved: 0, yaw: this.rend && this.rend.cam.yaw, pitch: this.rend && this.rend.cam.pitch }; try { st.setPointerCapture(e.pointerId); } catch (er) { } });
    st.addEventListener('pointermove', e => {
      if (this.rend && this.world) { const r = st.getBoundingClientRect(); this.world.mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; }
      if (!drag || !this.rend) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      this.rend.cam.yaw = drag.yaw - dx * 0.008; this.rend.cam.pitch = Math.max(-0.1, Math.min(1.45, drag.pitch + dy * 0.006));
    });
    st.addEventListener('pointerup', e => {
      if (drag && drag.moved < 5 && this.rend && this.world && this.running) { const r = st.getBoundingClientRect(); const part = this.rend.pick(e.clientX - r.left, e.clientY - r.top); this.world.mouseTargetPart = part || undefined; this.world.clickPart(part); }
      drag = null;
    });
    st.addEventListener('wheel', e => { if (!this.rend || document.activeElement !== st) return; e.preventDefault(); this.rend.cam.dist = Math.max(6, Math.min(120, this.rend.cam.dist * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });
    host.querySelectorAll('.lx-touch button').forEach(b => {
      const k = { up: 'W', down: 'S', left: 'A', right: 'D', jump: 'Space' }[b.dataset.k];
      b.addEventListener('pointerdown', e => { e.preventDefault(); keys.add(k); sync(); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { keys.delete(k); sync(); }));
    });
    host.querySelector('.lx-prompt').addEventListener('click', () => this.world && this.world.triggerPrompt());
    this.io = new IntersectionObserver(es => { for (const en of es) if (!en.isIntersecting && this.running && this.mode === 'world') { this.stop(); this.status('Paused (scrolled away). Press ▶ Run to play again.'); } }, { threshold: 0 });
    this.io.observe(st);
  }
  overlay() {
    const W = this.world, R = W.R, host = this.host;
    // leaderboard
    const pl = W.player; const ls = pl && pl.children.find(c => c.p.Name === 'leaderstats');
    const lb = host.querySelector('.lx-lb');
    if (ls && ls.children.some(c => c.isA('ValueBase'))) {
      const stats = ls.children.filter(c => c.isA('ValueBase')).slice(0, 4);
      const html = `<table><tr><th>${escH(pl.p.Name)}</th></tr></table>`;
      const sig = stats.map(s => s.p.Name + '=' + R.tostr(s.p.Value)).join('|') + pl.p.Name;
      if (lb.dataset.sig !== sig) { lb.dataset.sig = sig; lb.innerHTML = `<table><thead><tr><th>Player</th>${stats.map(s => `<th>${escH(s.p.Name)}</th>`).join('')}</tr></thead><tbody><tr><td>${escH(pl.p.Name)}</td>${stats.map(s => `<td>${escH(typeof s.p.Value === 'number' ? R.tostr(s.p.Value) : s.p.Value && s.p.Value.p ? s.p.Value.p.Name : R.tostr(s.p.Value))}</td>`).join('')}</tr></tbody></table>`; }
      lb.style.display = '';
    } else lb.style.display = 'none';
    // health
    const ch = pl && pl.p.Character, hum = ch && ch.children.find(c => c.ClassName === 'Humanoid');
    const hp = host.querySelector('.lx-hp');
    if (hum && hum.p.Health < hum.p.MaxHealth) { const f = hum.p.Health / hum.p.MaxHealth; hp.style.display = ''; hp.innerHTML = `<span>${hum.dead ? '💀' : '❤️'}</span><b><i style="width:${f * 100}%;background:${f > 0.5 ? '#3c3' : f > 0.25 ? '#fc3' : '#f33'}"></i></b>`; }
    else hp.style.display = 'none';
    // name tag & prompt
    const nm = host.querySelector('.lx-name');
    if (this.rend.labelPos && pl) { nm.style.display = ''; nm.textContent = (hum && hum.p.DisplayName) || pl.p.Name; nm.style.transform = `translate(${this.rend.labelPos[0]}px, ${this.rend.labelPos[1]}px) translate(-50%, -100%)`; } else nm.style.display = 'none';
    const pe = host.querySelector('.lx-prompt'); const pr = W.nearPrompt;
    if (pr && this.rend.promptPos) { pe.style.display = ''; pe.innerHTML = `<kbd>${escH(pr.p.KeyboardKeyCode.Name)}</kbd><span><small>${escH(pr.p.ObjectText)}</small>${escH(pr.p.ActionText)}</span>`; pe.style.transform = `translate(${this.rend.promptPos[0]}px, ${this.rend.promptPos[1]}px) translate(-50%, -100%)`; } else pe.style.display = 'none';
    // GUI
    this.renderGui();
  }
  renderGui() {
    const W = this.world, pl = W.player; const pg = pl && pl.children.find(c => c.ClassName === 'PlayerGui');
    const seen = new Set();
    const w = this.rend.w, h = this.rend.h;
    const draw = (inst, parentEl, pw, ph) => {
      if (!inst.isA('GuiObject')) { if (inst.ClassName === 'ScreenGui') { if (!inst.p.Enabled) return; for (const c of inst.children) draw(c, this.guiEl, w, h); } return; }
      seen.add(inst.id);
      let el = this.guiEls.get(inst.id);
      if (!el || el.parentElement !== parentEl) { if (el) el.remove(); el = document.createElement(inst.isA('GuiButton') ? 'button' : 'div'); el.className = 'lx-g'; if (inst.isA('GuiButton')) { el.type = 'button'; el.onclick = ev => { ev.stopPropagation(); W.clickGui(inst); this.stage.focus({ preventScroll: true }); }; } parentEl.appendChild(el); this.guiEls.set(inst.id, el); }
      const p = inst.p; const sx = p.Size.X.Scale * pw + p.Size.X.Offset, sy = p.Size.Y.Scale * ph + p.Size.Y.Offset;
      const x = p.Position.X.Scale * pw + p.Position.X.Offset - p.AnchorPoint.X * sx, y = p.Position.Y.Scale * ph + p.Position.Y.Offset - p.AnchorPoint.Y * sy;
      const corner = inst.children.find(c => c.ClassName === 'UICorner'); const stroke = inst.children.find(c => c.ClassName === 'UIStroke');
      const st = el.style;
      st.display = p.Visible ? '' : 'none'; st.left = x + 'px'; st.top = y + 'px'; st.width = sx + 'px'; st.height = sy + 'px'; st.zIndex = p.ZIndex;
      st.background = p.BackgroundColor3.css(); st.opacity = 1; st.backgroundColor = `rgba(${[p.BackgroundColor3.R, p.BackgroundColor3.G, p.BackgroundColor3.B].map(v => Math.round(v * 255))},${1 - p.BackgroundTransparency})`;
      st.borderRadius = corner ? (corner.p.CornerRadius.Scale * Math.min(sx, sy) + corner.p.CornerRadius.Offset) + 'px' : '0';
      st.boxShadow = stroke ? `0 0 0 ${stroke.p.Thickness}px ${stroke.p.Color.css()}` : (p.BorderSizePixel && p.BackgroundTransparency < 1 ? `inset 0 0 0 ${p.BorderSizePixel}px ${p.BorderColor3.css()}` : 'none');
      st.transform = p.Rotation ? `rotate(${p.Rotation}deg)` : '';
      if ('Text' in p) {
        if (el.textContent !== p.Text) el.textContent = p.Text;
        st.color = `rgba(${[p.TextColor3.R, p.TextColor3.G, p.TextColor3.B].map(v => Math.round(v * 255))},${1 - p.TextTransparency})`;
        st.fontSize = (p.TextScaled ? Math.max(8, Math.min(sy * 0.62, sx / Math.max(1, p.Text.length) * 1.7)) : p.TextSize) + 'px';
        st.justifyContent = { Left: 'flex-start', Center: 'center', Right: 'flex-end' }[p.TextXAlignment.Name];
        st.fontWeight = /Bold|Black|Bangers|Luckiest|Fredoka/.test(p.Font.Name) ? '800' : '600';
        st.whiteSpace = p.TextWrapped || p.TextScaled ? 'normal' : 'nowrap';
      }
      st.pointerEvents = inst.isA('GuiButton') ? 'auto' : 'none';
      for (const c of inst.children) draw(c, el, sx, sy);
    };
    if (pg) for (const g of pg.children) if (g.ClassName === 'ScreenGui') draw(g, this.guiEl, w, h);
    for (const [id, el] of this.guiEls) if (!seen.has(id)) { el.remove(); this.guiEls.delete(id); }
  }
  explorer() {
    const W = this.world; if (!W) return; const box = this.host.querySelector('.lx-ex-tree');
    this.exExpanded = this.exExpanded || new Set(['Workspace', 'Players']);
    const row = (inst, depth) => {
      if (inst.isCamera) return '';
      const kids = inst.children.filter(c => !c.isCamera);
      const key = inst.cls.service ? inst.ClassName : inst.id; const open = this.exExpanded.has(key);
      const sel = this.exSel === inst;
      let h = `<div class="lx-ex-row${sel ? ' on' : ''}" data-id="${inst.id}" style="padding-left:${6 + depth * 14}px">${kids.length ? `<button type="button" class="lx-ex-tg" data-tg="${key}">${open ? '▾' : '▸'}</button>` : '<span class="lx-ex-tg"></span>'}<span>${ICON[inst.ClassName] || (inst.isA('BasePart') ? '🧱' : inst.isA('GuiObject') ? '▭' : '◽')}</span> ${escH(inst.p.Name)}</div>`;
      if (open) for (const c of kids.slice(0, 200)) h += row(c, depth + 1);
      return h;
    };
    box.innerHTML = '<div class="lx-ex-head">Explorer</div>' + SHOW_SERVICES.map(n => W.services[n]).map(s => row(s, 0)).join('');
    box.querySelectorAll('[data-tg]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = isNaN(+b.dataset.tg) ? b.dataset.tg : +b.dataset.tg; if (this.exExpanded.has(k)) this.exExpanded.delete(k); else this.exExpanded.add(k); this.explorer(); });
    box.querySelectorAll('.lx-ex-row').forEach(r => r.onclick = () => { const id = +r.dataset.id; for (const i of W.allInstances) if (i.id === id) this.exSel = i; this.explorer(); });
    const pbox = this.host.querySelector('.lx-ex-props');
    if (this.exSel && !this.exSel.destroyed) pbox.innerHTML = `<div class="lx-ex-head">Properties · ${escH(this.exSel.p.Name)}</div>` + propList(this.exSel).map(([k, v]) => `<div class="lx-ex-p"><span>${escH(k)}</span><b>${fmtVal(W.R, v)}</b></div>`).join('');
    else pbox.innerHTML = '<div class="lx-ex-head">Properties</div><div class="muted" style="padding:6px 8px;font-size:.78rem">Click an object to see its properties.</div>';
  }
  destroy() { this.stop(true); this.io && this.io.disconnect(); }
}


/* ---------------- Helpers (used by tests and hidden setup code) ---------------- */
function installHelpers(W, lines) {
  const R = W.R, B = R.builtins;
  const outText = () => lines.filter(l => l.k === 'print').map(l => l.t).join('\n');
  const limbOf = () => { const ch = W.player && W.player.p.Character; return ch && ch.children.find(c => c.p.Name === 'Left Leg'); };
  const def = (n, f) => B.set(n, new NativeFn(n, f));
  def('__out', () => [outText()]);
  def('__errors', () => [lines.filter(l => l.k === 'error').map(l => l.t).join('\n')]);
  def('__warns', () => [lines.filter(l => l.k === 'warn').map(l => l.t).join('\n')]);
  def('__player', () => [W.player || undefined]);
  def('__char', () => [W.player && W.player.p.Character || undefined]);
  def('__touch', a => { const part = a[0]; if (!part) throw new LuaError('__touch: that part does not exist'); const limb = limbOf(); if (!limb) return []; part.sig('Touched').fire(limb); limb.sig('Touched').fire(part); return []; });
  def('__untouch', a => { const part = a[0], limb = limbOf(); if (part && limb) part.sig('TouchEnded').fire(limb); return []; });
  def('__click', a => { const part = a[0]; if (!part) throw new LuaError('__click: that part does not exist'); const cd = part.children.find(c => c.ClassName === 'ClickDetector'); if (cd) cd.sig('MouseClick').fire(W.player); return []; });
  def('__key', a => { W.keyEvent(a[0], true); W.keyEvent(a[0], false); return []; });
  def('__press', a => { if (!a[0]) throw new LuaError('__press: that button does not exist'); W.clickGui(a[0]); return []; });
  def('__prompt', a => { W.triggerPrompt(a[0]); return []; });
  def('__fireServer', a => { const [re, ...args] = a; if (!re) throw new LuaError('__fireServer: that RemoteEvent does not exist'); re.sig('OnServerEvent').fire(W.player, ...args); return []; });
  def('__leave', () => { if (W.player) W.services.Players.sig('PlayerRemoving').fire(W.player); return []; });
  def('__dsGet', a => { const v = W.dsGet(String(a[0]) + '/global', String(a[1])); return [v && typeof v === 'object' ? undefined : v]; });
  def('__dsSet', a => { W.dsSet(String(a[0]) + '/global', String(a[1]), a[2]); return []; });
  def('__teleport', a => { const ch = W.player && W.player.p.Character; const root = ch && ch.children.find(c => c.p.Name === 'HumanoidRootPart'); if (root) { root.cf = new CFrame(a[0].X, a[0].Y, a[0].Z, root.cf.R); ch.state.vel = new Vector3(); } return []; });
  def('__gui', a => { const pg = W.player && W.player.children.find(c => c.ClassName === 'PlayerGui'); if (!pg) return [undefined]; return [pg.descendants().find(d => d.p.Name === a[0])]; });
}

/* ---------------- Tests (headless, fast-forwarded) ---------------- */
// mode 'world': run the code, let the game settle, then run each test as its own server script.
// mode 'inline': tests are appended to the end of the code (to reach local functions).
function runTests(code, tests, opts = {}) {
  const lines = [];
  const W = new World({ headless: true, dsMemory: true, seed: 12345, out: (k, t) => lines.push({ k, t }), playerName: opts.playerName });
  const R = W.R, S = W.S, B = R.builtins;
  installHelpers(W, lines);
  const advance = (secs, until) => { const n = Math.ceil(secs * 30); for (let i = 0; i < n; i++) { W.step(1 / 30); if (until && until()) break; } };
  let res = [], err = null, line = null;
  const scripts = splitScripts(code);
  try {
    if (opts.setup) { const fn = R.load(opts.setup, 'Setup', W.envFor(null)); const th = S.spawn(fn, [], 'Setup'); S.resume(th); }
    if (opts.mode === 'inline') {
      const results = tests.map(() => [false, 'This test did not run (did your code finish? check for errors above)']);
      B.set('__t', new NativeFn('__t', function* (a) { const [i, f] = a; try { yield* R.call(f, []); results[i] = [true, '']; } catch (e) { if (e && e.timeout) throw e; results[i] = [false, cleanMsg(errText(e))]; } return []; }));
      const main = scripts.find(s => s.kind === 'Script') || scripts[0];
      main.source = main.source + '\n' + tests.map((t, i) => `__t(${i}, function() ${t} end)`).join('\n');
      W.start(scripts);
      advance(opts.settle || 3, () => !S.threads.length && !W.timers.length && W.player);
      res = results;
    } else {
      W.start(scripts);
      advance(opts.settle || 1.5);
      for (const t of tests) {
        let fn;
        try { fn = R.load(t, 'Test', W.envFor(null)); } catch (e) { res.push([false, 'Test could not compile: ' + errText(e)]); continue; }
        let r = null;
        const th = S.spawn(new NativeFn('test', function* () { try { yield* R.call(fn, []); r = [true, '']; } catch (e) { if (e && e.timeout) throw e; r = [false, cleanMsg(errText(e))]; } return []; }), [], 'Test', null);
        S.resume(th);
        advance(opts.testTime || 12, () => r !== null);
        res.push(r || [false, 'The test timed out (the game never did what the test was waiting for)']);
      }
    }
  } catch (e) { err = errText(e); }
  const errLine = lines.find(l => l.k === 'error');
  if (!err && errLine) err = errLine.t;
  W.stop();
  return { out: lines.filter(l => l.k !== 'error').map(l => (l.k === 'warn' ? '⚠ ' : '') + l.t).join('\n'), err, line, res };
}
function cleanMsg(m) { return String(m).replace(/^Test:\d+: /, ''); }

/* ---------------- Mount helpers used by the app ---------------- */
// Lesson example: editor + (world | console)
function mountExample(host, code, lang, opts = {}) {
  const mode = opts.visual ? 'world' : 'console';
  host.className = 'example lx-example' + (mode === 'world' ? ' lx-visual' : '');
  host.innerHTML = `<div class="exm-head"><span class="mono">▶ Try it · ${mode === 'world' ? 'Luau + 3D world' : 'Luau'}</span><div class="row" style="gap:6px"><button class="btn sm ghost" data-reset title="Reset the example">↺ Reset</button><button class="btn sm primary" data-run title="Ctrl+Enter">▶ Run</button></div></div>
    <div class="lx-split"><div class="exm-ed"></div>${mode === 'world' ? '<div class="lx-world"></div>' : ''}</div><div class="lx-outhead mono">Output</div><pre class="console exm-out lx-out" aria-live="polite"><span class="muted">Press Run, then change the code and run it again!</span></pre>`;
  const ed = opts.mountEditor($q('.exm-ed', host), { code, lang: 'luau' });
  const out = $q('.exm-out', host);
  const stage = new Stage(mode === 'world' ? $q('.lx-world', host) : document.createElement('div'), { mode, consoleEl: out, setup: opts.setup, height: 300 });
  const go = () => { stage.run(ed.value); opts.onRun && opts.onRun(); };
  $q('[data-run]', host).onclick = go; host.addEventListener('run', go);
  $q('[data-reset]', host).onclick = () => { stage.stop(); ed.value = code; out.innerHTML = '<span class="muted">Reset! Press Run.</span>'; };
  return stage;
}
const $q = (s, el) => el.querySelector(s);

root.LuauUI = { Stage, Renderer, runTests, mountExample, writeLine };
})(typeof window !== 'undefined' ? window : globalThis);

