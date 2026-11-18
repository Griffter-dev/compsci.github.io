/* ================= Code editor + runners (Python via Pyodide, JS in a worker, HTML in a frame) ================= */
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/';

/* ---------- Editor: textarea with a highlighted layer underneath ---------- */
function mountEditor(host, { code = '', lang = 'python', onChange } = {}) {
  host.innerHTML = `<div class="editor" data-lang="${esc(lang)}"><div class="ed-scroll"><div class="ed-gutter" aria-hidden="true"></div><div class="ed-inner"><pre class="ed-hl" aria-hidden="true"><code></code></pre><textarea class="ed-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Code editor. Press Escape then Tab to leave the editor."></textarea></div></div></div>`;
  const ta = $('.ed-ta', host), hl = $('.ed-hl code', host), gut = $('.ed-gutter', host);
  const indent = lang === 'python' || lang === 'java' ? '    ' : '  ';
  let escaped = false;
  const paint = () => {
    hl.innerHTML = highlight(ta.value, lang) + '\n ';
    const n = ta.value.split('\n').length;
    gut.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join('');
  };
  ta.value = code; paint();
  ta.addEventListener('input', () => { paint(); onChange && onChange(ta.value); });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Escape') { escaped = true; return; }
    if (e.key === 'Tab' && !escaped) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en, value: v } = ta;
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      if (e.shiftKey) { if (v.slice(ls, ls + indent.length) === indent) { ta.setRangeText('', ls, ls + indent.length, 'preserve'); ta.selectionStart = ta.selectionEnd = Math.max(ls, s - indent.length); } }
      else if (s !== en && v.slice(s, en).includes('\n')) { const block = v.slice(ls, en).split('\n').map(l => indent + l).join('\n'); ta.setRangeText(block, ls, en, 'select'); }
      else ta.setRangeText(indent, s, en, 'end');
      ta.dispatchEvent(new Event('input')); return;
    }
    escaped = false;
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const { selectionStart: s, value: v } = ta;
      const line = v.slice(v.lastIndexOf('\n', s - 1) + 1, s);
      let ind = line.match(/^\s*/)[0];
      if (/[:{\[(]\s*$/.test(line)) ind += indent;
      ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input'));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); host.dispatchEvent(new CustomEvent('run')); }
  });
  return { get value() { return ta.value; }, set value(v) { ta.value = v; paint(); }, focus: () => ta.focus(), el: ta };
}

/* ---------- Workers ---------- */
const PY_WORKER = `
let py = null, loading = null;
async function boot(url) { importScripts(url + 'pyodide.js'); py = await loadPyodide({ indexURL: url }); }
const HARNESS = \`
import sys, io, json, traceback
__p = json.loads(__payload)
__buf = io.StringIO()
sys.stdout = __buf
sys.stderr = __buf
sys.stdin = io.StringIO(__p["stdin"])
__g = {"__name__": "__main__"}
__err = None
__line = None
try:
    exec(compile(__p["code"], "main.py", "exec"), __g)
except BaseException as e:
    __tb = traceback.extract_tb(e.__traceback__)
    for fr in __tb:
        if fr.filename == "main.py": __line = fr.lineno
    if isinstance(e, SyntaxError): __line = e.lineno
    __err = type(e).__name__ + ": " + str(e)
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
__g["__out"] = __buf.getvalue()
__res = []
for __t in __p["tests"]:
    try:
        exec(__t, __g)
        __res.append([True, ""])
    except AssertionError as e:
        __res.append([False, str(e) or "Test failed"])
    except BaseException as e:
        __res.append([False, type(e).__name__ + ": " + str(e)])
json.dumps({"out": __g["__out"], "err": __err, "line": __line, "res": __res})
\`;
onmessage = async (e) => {
  const { url, code, tests, stdin } = e.data;
  try {
    if (!py) { loading = loading || boot(url); await loading; postMessage({ type: 'ready' }); }
    if (code == null) return;
    py.globals.set('__payload', JSON.stringify({ code, tests: tests || [], stdin: stdin || '' }));
    const r = JSON.parse(py.runPython(HARNESS));
    postMessage({ type: 'done', ...r });
  } catch (err) { postMessage({ type: 'fatal', error: String(err && err.message || err) }); }
};`;
const JS_WORKER = `
onmessage = (e) => {
  const { code, tests } = e.data; const out = []; let err = null, line = null;
  const fmt = v => { try { return typeof v === 'string' ? v : JSON.stringify(v) ?? String(v); } catch { return String(v); } };
  const con = { log: (...a) => out.push(a.map(fmt).join(' ')), error: (...a) => out.push(a.map(fmt).join(' ')), warn: (...a) => out.push(a.map(fmt).join(' ')) };
  const body = code + '\\n;return [' + (tests || []).map(t => '(()=>{try{' + t + ';return [true,""]}catch(e){return [false,e.message]}})').join(',') + '].map(f=>f());';
  let res = [];
  try { res = new Function('console', 'assert', body)(con, (c, m) => { if (!c) throw new Error(m || 'Test failed'); }); }
  catch (ex) { err = ex.name + ': ' + ex.message; const m = String(ex.stack || '').match(/<anonymous>:(\\d+)/); if (m) line = +m[1] - 2; res = (tests || []).map(() => [false, 'Your code crashed before the tests ran']); }
  postMessage({ type: 'done', out: out.join('\\n'), err, line, res });
};`;
const workerFrom = src => new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
let pyW = null, pyReady = false;
function runCode(lang, code, { tests = [], stdin = '', onStatus } = {}) {
  return new Promise(resolve => {
    let w, timer;
    const isPy = lang === 'python';
    if (isPy) { if (!pyW) { pyW = workerFrom(PY_WORKER); pyReady = false; } w = pyW; }
    else w = workerFrom(JS_WORKER);
    const kill = (msg) => { w.terminate(); if (isPy) { pyW = null; pyReady = false; } resolve({ out: '', err: msg, res: tests.map(() => [false, msg]), timeout: true }); };
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => kill('Timed out after 8 seconds. Is there an infinite loop, or is your code too slow?'), 8000); };
    w.onmessage = e => {
      const d = e.data;
      if (d.type === 'ready') { pyReady = true; onStatus && onStatus('running'); arm(); return; }
      clearTimeout(timer); if (!isPy) w.terminate();
      if (d.type === 'fatal') { if (isPy) { pyW.terminate(); pyW = null; } resolve({ out: '', err: /importScripts|NetworkError|Failed to fetch|load/i.test(d.error) ? 'Could not download Python. Your network may block cdn.jsdelivr.net, or you might be offline.' : d.error, res: tests.map(() => [false, 'Could not run']), blocked: true }); return; }
      resolve(d);
    };
    w.onerror = e => { clearTimeout(timer); resolve({ out: '', err: e.message || 'Worker error', res: tests.map(() => [false, 'Could not run']) }); };
    if (isPy && !pyReady) { onStatus && onStatus('loading'); timer = setTimeout(() => kill('Python took too long to load. Check your connection and try again.'), 45000); }
    else arm();
    w.postMessage({ url: PYODIDE_URL, code, tests, stdin });
  });
}
function runHtml(frame, code, tests = []) {
  return new Promise(resolve => {
    const pre = `<script>window.__logs=[];['log','error','warn'].forEach(k=>{const o=console[k];console[k]=(...a)=>{__logs.push(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '));o.apply(console,a)}});window.onerror=(m,s,l)=>{__logs.push('Error: '+m+(l?' (line '+l+')':''))};<\/script>`;
    frame.onload = () => setTimeout(() => {
      let res = [], out = '';
      try {
        const doc = frame.contentDocument, win = frame.contentWindow;
        res = tests.map(t => { try { new Function('doc', 'win', 'assert', t)(doc, win, (c, m) => { if (!c) throw new Error(m || 'Test failed'); }); return [true, '']; } catch (e) { return [false, e.message]; } });
        out = (win.__logs || []).join('\n');
      } catch (e) { res = tests.map(() => [false, 'Preview could not be checked']); }
      resolve({ out, err: null, res });
    }, 120);
    frame.srcdoc = (/<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, m => m + pre) : pre + code);
  });
}

/* ---------- Friendly error explanations ---------- */
const ERR_HELP = [
  [/expected ':'/, "Lines that start with <code>if</code>, <code>elif</code>, <code>else</code>, <code>for</code>, <code>while</code> or <code>def</code> must end with a colon <code>:</code>."],
  [/IndentationError: expected an indented block/, "After a line that ends in a colon, the next line must be indented (4 spaces)."],
  [/IndentationError: unexpected indent/, "This line is indented but shouldn't be. Line it up with the code around it."],
  [/IndentationError: unindent does not match|TabError/, "The indentation doesn't line up. Lines in the same block need exactly the same number of spaces."],
  [/Maybe you meant '==' or ':='|cannot assign to/, "To <b>compare</b> two values, use <code>==</code>. A single <code>=</code> <b>stores</b> a value."],
  [/unterminated string|EOL while scanning/, "A string is missing its closing quote mark."],
  [/was never closed|unexpected EOF/, "A bracket <code>( [ {</code> was opened but never closed."],
  [/invalid syntax|SyntaxError/, "Python couldn't understand this line. Check for a missing colon, quote, bracket or operator."],
  [/NameError: name '(\w+)' is not defined/, "Python doesn't know the name <code>$1</code>. Check the spelling and capital letters, and make sure you created it before using it. If you meant text, put it in quotes."],
  [/can only concatenate str|unsupported operand type\(s\) for \+: 'int' and 'str'|must be str, not int/, "You're mixing text and numbers. Convert first with <code>str(...)</code> or <code>int(...)</code>."],
  [/'(<|>|<=|>=)' not supported between/, "You're comparing two different kinds of values (like a number and text). Convert one so they match."],
  [/missing \d+ required positional argument/, "You called a function without giving it all the values (arguments) it needs."],
  [/ZeroDivisionError|division by zero/, "You divided by zero. Check the number you're dividing by first, maybe with an <code>if</code> statement!"],
  [/IndexError|index out of range/, "You used an index that doesn't exist. Indexes start at 0 and end at <code>len(...) - 1</code>."],
  [/KeyError/, "That key isn't in the dictionary. Check the spelling, or use <code>.get(key, default)</code>."],
  [/AttributeError: '(\w+)' object has no attribute '(\w+)'/, "A <code>$1</code> doesn't have <code>.$2</code>. Check the method name."],
  [/ValueError: invalid literal for int/, "<code>int()</code> can only convert text that looks like a whole number."],
  [/RecursionError|Maximum call stack/, "A function keeps calling itself forever. Add or fix the base case."],
  [/ReferenceError: (\w+) is not defined/, "JavaScript doesn't know <code>$1</code>. Check the spelling, and declare it with <code>let</code> or <code>const</code> first."],
  [/TypeError: (\S+) is not a function/, "<code>$1</code> isn't a function. Check the name, or whether you added <code>()</code> to something that isn't a function."],
  [/Assignment to constant variable/, "You can't change a <code>const</code>. Use <code>let</code> if the value needs to change."],
  [/Unexpected token|Unexpected end of input/, "JavaScript found something it didn't expect. Look for a missing <code>)</code>, <code>}</code> or quote."],
  [/Timed out/, "Your code ran too long. Check that every loop has a way to stop: does the condition ever become False?"],
];
function explainError(err) {
  if (!err) return '';
  for (const [re, msg] of ERR_HELP) { const m = err.match(re); if (m) return `<div class="err-help">💡 <b>What this means:</b> ${msg.replace(/\$(\d)/g, (_, i) => esc(m[+i] || ''))}<br><small class="muted">Errors are normal. Every programmer sees them all day. Read the line number, fix it, and run again!</small></div>`; }
  return '';
}
/* ---------- Runnable examples inside lessons ---------- */
function mountExample(host, code, lang) {
  host.className = 'example';
  host.innerHTML = `<div class="exm-head"><span class="mono">▶ Try it · ${esc(LANG_LABEL[lang] || lang)}</span><div class="row" style="gap:6px"><button class="btn sm ghost" data-reset title="Reset the example">↺ Reset</button><button class="btn sm primary" data-run title="Ctrl+Enter">▶ Run</button></div></div><div class="exm-ed"></div><pre class="console exm-out" aria-live="polite"><span class="muted">Press Run, then change the code and run it again!</span></pre>`;
  const ed = mountEditor($('.exm-ed', host), { code, lang });
  const out = $('.exm-out', host), run = $('[data-run]', host);
  const go = async () => {
    run.disabled = true; out.innerHTML = '<span class="muted">Running…</span>';
    const r = await runCode(lang, ed.value, { onStatus: s => { if (s === 'loading') out.innerHTML = '<span class="muted">⏳ Loading Python (first time only)…</span>'; } });
    out.innerHTML = (r.out ? esc(r.out.replace(/\n$/, '')) : '') + (r.err ? `${r.out ? '\n' : ''}<span class="c-err">${esc(r.err)}${r.line && !/line \d/.test(r.err) ? ` (line ${r.line})` : ''}</span>${explainError(r.err)}` : '') || '<span class="muted">(no output)</span>';
    run.disabled = false;
    if (!r.err && !r.blocked) { const k = 'ex:' + location.hash; if (!S.answers[k]) { S.answers[k] = { c: 1, w: 0 }; addXP(2, 'Ran an example'); } }
  };
  run.onclick = go; host.addEventListener('run', go);
  $('[data-reset]', host).onclick = () => { ed.value = code; out.innerHTML = '<span class="muted">Reset! Press Run.</span>'; };
}
