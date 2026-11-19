/* ================= Study views: module sidebar, lessons, coding exercises, fill-in-the-code ================= */
function moduleSidebar(c, activeKey, activeUnit) {
  return `<aside class="side" id="side" aria-label="Course modules">
    <div class="spread" style="margin:4px 8px 12px"><h4 style="margin:0">${c.emoji} ${esc(c.title)}</h4><button class="btn sm ghost side-close" onclick="document.getElementById('side').classList.remove('open')" aria-label="Close">✕</button></div>
    ${c.id === 'csa' ? `<div style="margin:0 8px 12px" class="row"><a class="btn sm" href="#/exam">📝 Practice exams</a><a class="btn sm ghost" href="#/frq">✍️ FRQs</a></div>` : ''}
    <div style="margin:0 8px 14px"><div class="bar"><i style="width:${courseProgress(c) * 100}%"></i></div><small class="muted mono">${Math.round(courseProgress(c) * 100)}% complete</small></div>
    ${c.units.map((x, xi) => { const its = unitItems(x); const dn = its.filter(itemDoneAt).length; const open = x.id === activeUnit;
      return `<div class="unit-group"><button aria-expanded="${open}" data-toggle><span>${S.start[c.id] === x.id ? '🚩 ' : ''}Module ${xi + 1} · ${esc(x.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, ''))}</span><span class="cnt">${x.weight ? `<span title="AP exam weighting">${esc(x.weight)}</span><br>` : ''}${dn}/${its.length}</span></button>
      <ul class="${open ? '' : 'hidden'}">${its.map(it => `<li><a href="${it.href}" class="${it.key === activeKey ? 'on' : ''}"><span class="chk ${itemDoneAt(it) ? 'done' : ''}">${itemDoneAt(it) ? '✓' : ''}</span><span aria-hidden="true">${it.icon}</span>${esc(it.title)}</a></li>`).join('')}
        <li><a href="#/quiz?mode=unit&units=${x.id}&types=quiz"><span class="chk ${S.units[x.id]?.quizAt ? 'done' : ''}">${S.units[x.id]?.quizAt ? '✓' : ''}</span><span aria-hidden="true">📝</span>Unit quiz</a></li>
        ${x.trace.length + x.bug.length + x.fill.length ? `<li><a href="#/quiz?mode=unit&units=${x.id}&types=trace,bug,fill"><span class="chk ${S.units[x.id]?.codeAt ? 'done' : ''}">${S.units[x.id]?.codeAt ? '✓' : ''}</span><span aria-hidden="true">🐛</span>Code challenges</a></li>` : ''}
        ${S.settings.bosses ? `<li><a href="#/boss/${x.id}"><span class="chk ${S.units[x.id]?.boss ? 'done' : ''}">${S.units[x.id]?.boss ? '✓' : ''}</span><span aria-hidden="true">👹</span>Boss battle <small class="muted">(optional)</small></a></li>` : ''}
        ${S.start[c.id] !== x.id ? `<li><a href="javascript:void 0" onclick="startAt('${c.id}','${x.id}')" class="muted"><span class="chk" style="border:0">🚩</span>Start this course here</a></li>` : ''}</ul></div>`; }).join('')}
  </aside>`;
}
function wireSidebar(view) {
  $$('[data-toggle]', view).forEach(b => b.onclick = () => { const ul = b.nextElementSibling; ul.classList.toggle('hidden'); b.setAttribute('aria-expanded', !ul.classList.contains('hidden')); });
  $('#side-btn', view)?.addEventListener('click', () => $('#side', view).classList.toggle('open'));
}
// the item after `key` inside the same course (lessons → exercises → fill-ins, module by module)
function neighbors(c, key) {
  const flat = c.units.flatMap(u => unitItems(u).map(it => ({ ...it, u })));
  const i = flat.findIndex(x => x.key === key);
  return { prev: flat[i - 1], next: flat[i + 1], cur: flat[i], pos: i, total: flat.length };
}
function goNextAfter(c, u, key) {
  const { next } = neighbors(c, key);
  if (next && next.u.id === u.id) go(next.href.slice(1));
  else go(`/unit-done/${u.id}`);
}
function assignBtn(ref) { return `<button class="btn sm ghost noprint" onclick='assignPicker(${JSON.stringify(ref)})' title="Add to a plan or assign to your squad">📌 Assign</button>`; }

/* ---------- Start picker: choose which unit to begin a course on ---------- */
function startPicker(cid) {
  const c = COURSE[cid];
  const m = modal(`<span class="eyebrow">${c.emoji} ${esc(c.title)}</span><h2 style="margin-top:4px">Where do you want to start?</h2><p class="muted">Already learned some of this in class? Jump straight to the unit you're on. You can change it anytime.</p>
    <div class="stack">${c.units.map((u, i) => `<button class="card hover" data-u="${u.id}" style="width:100%;text-align:left;cursor:pointer;padding:14px 16px;display:flex;gap:14px;align-items:center;box-shadow:none"><span class="pill" style="flex:none">Module ${i + 1}</span><span style="flex:1;min-width:0"><b style="display:block">${esc(u.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, ''))}</b><small class="muted">${u.weight ? `AP weighting ${esc(u.weight)} · ` : ''}${u.lessons.length} lesson${u.lessons.length === 1 ? '' : 's'} · ${u.ex.length + u.fill.length} exercise${u.ex.length + u.fill.length === 1 ? '' : 's'}${unitProgress(u) > 0 ? ` · ${Math.round(unitProgress(u) * 100)}% done` : ''}</small></span><span aria-hidden="true">→</span></button>`).join('')}</div>`, { wide: true });
  $$('[data-u]', m).forEach(b => b.onclick = () => { closeModal(); startAt(cid, b.dataset.u); });
}
function startAt(cid, uid) {
  S.start[cid] = uid; save();
  const u = UNIT[uid], it = unitItems(u).find(x => !itemDoneAt(x)) || unitItems(u)[0];
  toast(`Starting at ${u.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, '')}`, 'Change it anytime from the course page.');
  go(it.href.slice(1));
}

/* ---------- Lesson (bite-sized, quizzes sprinkled through it, runnable examples, glossary) ---------- */
route('/learn/:uid/:li', (view, p) => {
  const u = UNIT[p.uid]; if (!u) return;
  const c = COURSE[u.course], li = clamp(+p.li || 0, 0, u.lessons.length - 1), L = u.lessons[li], key = `${u.id}:${li}`;
  const { prev } = neighbors(c, key);
  const done = lessonDone(c.id, u.id, li);
  const lessonNo = c.units.slice(0, c.units.indexOf(u)).reduce((n, x) => n + x.lessons.length, 0) + li + 1;
  let quizzes = L.quizzes || [], html = L.html;
  if (!quizzes.length) {
    quizzes = shuffle(u.quiz, seeded(key)).slice(0, 2);
    const parts = html.split(/(?=<h3)/);
    if (parts.length >= 3 && quizzes.length > 1) { parts.splice(Math.ceil(parts.length / 2), 0, '<div class="lq" data-lq="0"></div>'); html = parts.join('') + '<div class="lq" data-lq="1"></div>'; }
    else html += quizzes.map((_, i) => `<div class="lq" data-lq="${i}"></div>`).join('');
  }
  const last = li === u.lessons.length - 1;
  const practices = unitItems(u).filter(it => it.k !== 'lesson');
  view.innerHTML = `<div class="viewer">${moduleSidebar(c, key, u.id)}
    <article class="lesson gd">
      <div class="crumb"><button class="btn sm side-toggle" id="side-btn">☰ Lessons</button><a href="#/course/${c.id}">${esc(c.title)}</a> / <span>${esc(u.title)}</span></div>
      <header class="lesson-head"><span class="eyebrow">Lesson ${lessonNo} of ${lessonCount(c)}</span><h1>${esc(L.title)}</h1>
        <div class="spread"><div class="row" style="gap:8px">${(L.skills || []).map(skillChip).join('')}<span class="pill">⏱ ${L.mins} min</span><span class="pill">❓ ${quizzes.length} quick quiz${quizzes.length === 1 ? '' : 'zes'}</span>${EVENT.units.includes(u.id) ? '<span class="pill accent">2× XP</span>' : ''}${done ? '<span class="pill accent">✓ Completed</span>' : ''}</div>${assignBtn({ course: c.id, unit: u.id, kind: 'lesson', ref: key })}</div></header>
      <div class="prose" id="prose">${html}</div>
      ${last && practices.length ? `<section class="practices noprint"><span class="eyebrow">// practices</span><h2>Put it into practice</h2><p class="muted">You've finished the reading for this module. Now write some code! Each practice checks your work automatically, and there are hints if you get stuck.</p>
        <div class="grid g2">${practices.map(it => `<a class="card hover search-hit practice-card" href="${it.href}"><span class="chk ${itemDoneAt(it) ? 'done' : ''}">${itemDoneAt(it) ? '✓' : ''}</span><span style="font-size:1.5rem">${it.icon}</span><span style="flex:1;min-width:0"><b>${esc(it.title)}</b><br><small class="muted">${it.k === 'ex' ? 'Coding practice' : 'Fill in the code'} · ${it.mins} min</small></span><span aria-hidden="true">→</span></a>`).join('')}</div></section>` : ''}
      <div class="lesson-nav">
        ${prev ? `<a class="btn" href="${prev.href}">← Previous</a>` : '<span></span>'}
        <button class="btn primary" id="done-btn">${done ? 'Next →' : last && practices.length ? 'Complete lesson & start practicing →' : 'Complete lesson & continue →'}</button>
      </div>
    </article></div>`;
  $$('.lq', view).forEach(el => { const q = quizzes[+el.dataset.lq]; if (q) el.outerHTML = inlineQ(q, +el.dataset.lq); else el.remove(); });
  wireSidebar(view); wireInlineQs(view, quizzes); linkGlossary($('#prose', view));
  $('#done-btn', view).onclick = () => { markLesson(u.id, li); goNextAfter(c, u, key); };
});
function inlineQ(q, i) {
  return `<div class="iq" data-i="${i}" role="group" aria-label="Quiz"><span class="iq-tag">❓ Quiz</span><div class="qtext" style="font-size:1.02rem;margin-top:6px">${fmt(q.q)}${qPts(q)}</div>${qExtra(q)}<div class="choices" style="margin-top:8px">${choiceOrder(q, seeded(q.id)).map(k => `<button class="choice" data-k="${k}" style="padding:9px 14px"><span>${fmt(q.choices[k])}</span></button>`).join('')}</div><div class="iq-after"></div></div>`;
}
function wireInlineQs(view, qs) {
  $$('.iq', view).forEach(box => {
    const q = qs[+box.dataset.i];
    $$('.choice', box).forEach(b => b.onclick = () => {
      const ok = +b.dataset.k === q.a; recordAnswer(q, ok); sfx(ok ? 'ok' : 'bad');
      $$('.choice', box).forEach(x => x.disabled = true);
      b.classList.add(ok ? 'right' : 'wrong'); if (!ok) $(`.choice[data-k="${q.a}"]`, box).classList.add('right');
      $('.iq-after', box).innerHTML = `<div class="explain ${ok ? '' : 'no'}" style="margin-top:10px"><b>${ok ? pick(['Correct!', 'Nice!', 'You got it!']) : "Not quite. Here's why:"}</b>${fmt(q.why)}${ok ? '' : '<div style="margin-top:8px"><button class="btn sm" data-retry>↻ Try again</button></div>'}</div>`;
      $('[data-retry]', box)?.addEventListener('click', () => { $$('.choice', box).forEach(x => { x.disabled = false; x.classList.remove('right', 'wrong'); }); $('.iq-after', box).innerHTML = ''; });
      box.classList.add(ok ? 'iq-ok' : 'iq-no');
      if (ok) addXP(5, 'Lesson quiz', q.unit);
    });
  });
}

/* ---------- Exercise (code) and Fill in the code ---------- */
route('/ex/:id', (view, p) => {
  const e = EX[p.id], f = !e && Q[p.id]?.kind === 'fill' ? Q[p.id] : null;
  if (!e && !f) return;
  const item = e || f, u = UNIT[item.unit], c = COURSE[u.course];
  const { prev, pos, total } = neighbors(c, item.id);
  const head = (kindLabel, done) => `<div class="crumb"><button class="btn sm side-toggle" id="side-btn">☰ Modules</button><a href="#/course/${c.id}">${esc(c.title)}</a> / <span>${esc(u.title)}</span> / <span>Item ${pos + 1} of ${total}</span></div>
    <div class="spread"><div class="row" style="gap:10px"><span class="pill">${kindLabel}</span>${done ? '<span class="pill accent">✓ Completed</span>' : ''}</div>${assignBtn({ course: c.id, unit: u.id, kind: e ? 'ex' : 'fill', ref: item.id })}</div>`;
  if (f) return fillView(view, f, u, c, head, prev);
  const draft = S.drafts[e.id] ?? S.exercises[e.id]?.code ?? e.starter;
  const runnable = e.lang === 'python' || e.lang === 'js';
  view.innerHTML = `<div class="viewer ex-viewer">${moduleSidebar(c, e.id, u.id)}
    <div class="ex-wrap">${head(`💻 Coding exercise · ${LANG_LABEL[e.lang] || e.lang}`, !!S.exercises[e.id])}
      <div class="ex-grid">
        <section class="ex-left">
          <h1 style="font-size:1.6rem;margin:10px 0 12px">${esc(e.title)}</h1>
          <div class="ex-sec"><h3>🎯 Goal</h3><div class="prose" id="goal">${e.prompt}</div></div>
          <h3 style="margin-top:22px">✓ Checks <small class="muted" style="font-weight:500;font-size:.8rem">Your code must pass all of these</small></h3>
          <ul class="tests" id="tests">${e.tests.map((t, i) => `<li data-t="${i}"><span class="ti">○</span><span>${esc(testLabel(t, e.lang))}</span></li>`).join('')}</ul>
          <h3 style="margin-top:22px">💡 Stuck?</h3>
          <div id="hint-box"></div>
          <div class="row" style="margin-top:8px"><button class="btn sm" id="hint">💡 Show hint 1 of ${(e.hints && e.hints.length) || 1}</button><button class="btn sm ghost" id="sol">👀 Solution</button></div>
          <div class="lesson-nav">${prev ? `<a class="btn" href="${prev.href}">← Previous</a>` : '<span></span>'}<button class="btn" id="ex-next">${S.exercises[e.id] ? 'Next →' : 'Skip for now →'}</button></div>
        </section>
        <section class="ex-right">
          <div class="ex-bar"><span class="mono muted" style="font-size:.8rem">${e.lang === 'html' ? 'index.html' : e.lang === 'js' ? 'main.js' : 'main.py'}</span><div class="row" style="gap:8px">
            <button class="btn sm ghost" id="reset" title="Reset to starter code">↺ Reset</button>
            ${e.lang !== 'html' ? '<button class="btn sm" id="run" title="Ctrl+Enter">▶ Run</button>' : '<button class="btn sm" id="run">▶ Preview</button>'}
            <button class="btn sm primary" id="test">✓ Run tests</button></div></div>
          <div id="ed"></div>
          ${e.lang === 'python' ? `<details class="stdin"><summary>Program input (for <code>input()</code>)</summary><textarea class="input" id="stdin" rows="2" placeholder="One line per input() call"></textarea></details>` : ''}
          ${e.lang === 'html' ? '<div class="ex-label">Preview</div><iframe class="preview" id="frame" sandbox="allow-scripts allow-same-origin" title="Preview of your page"></iframe>' : ''}
          <div class="ex-label">Output</div><pre class="console" id="out" aria-live="polite">${runnable ? 'Press ▶ Run to see what your code prints.' : 'Press ✓ Run tests to check your page.'}</pre>
        </section>
      </div></div></div>`;
  wireSidebar(view); linkGlossary($('#goal', view));
  const ed = mountEditor($('#ed', view), { code: draft, lang: e.lang === 'js' ? 'js' : e.lang, onChange: v => { S.drafts[e.id] = v; save(); } });
  const out = $('#out', view);
  let fails = 0;
  const show = (r, mode) => {
    const lines = [];
    if (r.out) lines.push(esc(r.out.replace(/\n$/, '')));
    if (r.err) lines.push(`<span class="c-err">${esc(r.err)}${r.line && !/line \d/.test(r.err) ? ` (line ${r.line})` : ''}</span>${explainError(r.err)}`);
    if (!lines.length) lines.push(`<span class="muted">${mode === 'run' ? '(no output)' : ''}</span>`);
    out.innerHTML = lines.join('\n');
  };
  const status = s => { out.innerHTML = s === 'loading' ? '<span class="muted">⏳ Loading Python. The first time takes a few seconds (about 10 MB)…</span>' : '<span class="muted">Running…</span>'; };
  const busy = on => $$('#run, #test', view).forEach(b => b.disabled = on);
  $('#ed', view).addEventListener('run', () => $('#run', view)?.click());
  $('#run', view).onclick = async () => {
    busy(true); status('running');
    const r = e.lang === 'html' ? await runHtml($('#frame', view), ed.value, []) : await runCode(e.lang, ed.value, { stdin: $('#stdin', view)?.value || '', onStatus: status });
    show(r, 'run'); busy(false);
  };
  $('#test', view).onclick = async () => {
    busy(true); status('running');
    const r = e.lang === 'html' ? await runHtml($('#frame', view), ed.value, e.tests) : await runCode(e.lang, ed.value, { tests: e.tests, stdin: $('#stdin', view)?.value || '', onStatus: status });
    show(r, 'test'); busy(false);
    const res = (r.res || []).map(x => r.err && !x[0] && !r.timeout ? [false, 'Your code has an error. Fix it first (see Output).'] : x);
    $$('#tests li', view).forEach((li, i) => { const [ok, msg] = res[i] || [false, '']; li.className = ok ? 'pass' : 'fail'; $('.ti', li).textContent = ok ? '✓' : '✗'; li.title = msg; let m = $('.tm', li); if (!ok && msg && msg !== testLabel(e.tests[i], e.lang)) { if (!m) { m = document.createElement('small'); m.className = 'tm'; li.appendChild(m); } m.textContent = msg; } else m?.remove(); });
    const passed = res.filter(x => x[0]).length;
    if (res.length && passed === res.length) {
      const first = !S.exercises[e.id]; markExercise(e.id, ed.value); sfx('win'); confetti(first ? 120 : 40);
      out.innerHTML += `\n<span class="c-ok">✓ All ${res.length} tests passed!${first ? ' +40 XP' : ''}</span>`;
      $('#ex-next', view).textContent = 'Next →'; $('#ex-next', view).classList.add('primary');
    } else if (!r.blocked) { fails++; sfx('bad'); out.innerHTML += `\n<span class="c-err">${passed}/${res.length} tests passed.</span>${fails >= 2 ? ' <span class="muted">Stuck? Try the 💡 hint.</span>' : ''}`; }
  };
  $('#reset', view).onclick = async () => { if (await confirmBox('Reset your code?', 'This replaces your code with the starter code.', 'Reset')) { ed.value = e.starter; delete S.drafts[e.id]; save(); } };
  const hints = e.hints && e.hints.length ? e.hints : [e.hint || 'Re-read the goal and check each test message.'];
  let shown = 0;
  $('#hint', view).onclick = () => {
    if (shown >= hints.length) return;
    $('#hint-box', view).insertAdjacentHTML('beforeend', `<div class="explain" style="border-left-color:var(--warn);margin-bottom:8px"><b>💡 Hint ${shown + 1}</b>${fmt(hints[shown])}</div>`);
    shown++; const b = $('#hint', view); if (shown >= hints.length) { b.disabled = true; b.textContent = '💡 No more hints'; } else b.textContent = `💡 Show hint ${shown + 1} of ${hints.length}`;
  };
  $('#sol', view).onclick = async () => { if (S.exercises[e.id] || await confirmBox('Show the solution?', 'Try the hint first! Seeing the answer too early makes it harder to learn.', 'Show it')) $('#hint-box', view).insertAdjacentHTML('beforeend', `<div class="explain"><b>👀 One possible solution</b>${codeBlock(e.solution, e.lang)}</div>`); };
  $('#ex-next', view).onclick = () => goNextAfter(c, u, e.id);
});
function testLabel(t, lang) {
  const m = lang === 'python' ? t.match(/,\s*(["'])(.*)\1\s*$/) : t.match(/,\s*(["'])(.*)\1\s*\)\s*\)?\s*$/);
  return m ? m[2].replace(/\\"/g, '"') : t;
}

function fillHtml(q, prefix = 'b') {
  const parts = q.code.split('\u0000');
  let h = '';
  parts.forEach((seg, i) => {
    if (i % 2 === 0) h += highlight(seg, q.lang);
    else { const b = +seg, w = Math.max(3, ...q.blanks[b].map(a => a.length)) + 1; h += `<input class="blank" id="${prefix}${b}" data-b="${b}" size="${w}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Blank ${b + 1}">`; }
  });
  return `<pre class="code fill"><div class="chead"><span>${esc(LANG_LABEL[q.lang] || q.lang)}</span></div><code>${h}</code></pre>`;
}
const normAns = (s, lang) => { s = String(s).replace(/\s+/g, ''); return lang === 'text' || lang === 'pseudo' ? s.toLowerCase() : s; };
function checkFill(root, q) {
  let all = true;
  $$('.blank', root).forEach(inp => { const ok = q.blanks[+inp.dataset.b].some(a => normAns(a, q.lang) === normAns(inp.value, q.lang)); inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok); if (!ok) all = false; });
  return all;
}
function revealFill(root, q) { $$('.blank', root).forEach(inp => { if (!inp.classList.contains('right')) { inp.value = q.blanks[+inp.dataset.b][0]; inp.classList.remove('wrong'); inp.classList.add('shown'); } }); }
function fillView(view, q, u, c, head, prev) {
  view.innerHTML = `<div class="viewer">${moduleSidebar(c, q.id, u.id)}<article class="lesson">${head('🧩 Fill in the code', !!S.fills[q.id])}
    <h1 style="font-size:1.6rem;margin:14px 0 10px">${esc(q.title || 'Fill in the code')}</h1><div class="qtext">${fmt(q.q)}${qPts(q)}</div>
    <div id="fill">${fillHtml(q)}</div>
    <div id="fill-after"></div>
    <div class="row" style="margin-top:12px"><button class="btn primary" id="check">✓ Check</button><button class="btn ghost" id="reveal" disabled>👀 Show answers</button></div>
    <div class="lesson-nav">${prev ? `<a class="btn" href="${prev.href}">← Previous</a>` : '<span></span>'}<button class="btn" id="f-next">${S.fills[q.id] ? 'Next →' : 'Skip for now →'}</button></div></article></div>`;
  wireSidebar(view);
  let tries = 0;
  const box = $('#fill', view);
  $$('.blank', box).forEach(inp => inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#check', view).click(); }));
  $('.blank', box)?.focus();
  $('#check', view).onclick = () => {
    tries++; const ok = checkFill(box, q); recordAnswer(q, ok); sfx(ok ? 'win' : 'bad');
    if (ok) { const first = !S.fills[q.id]; markFill(q.id); if (first) confetti(60); $('#f-next', view).textContent = 'Next →'; $('#f-next', view).classList.add('primary'); }
    $('#fill-after', view).innerHTML = `<div class="explain ${ok ? '' : 'no'}"><b>${ok ? 'All correct!' : `Not yet. The red blanks need another look.${tries >= 2 ? ' You can show the answers now.' : ''}`}</b>${ok ? fmt(q.why) : ''}</div>`;
    $('#reveal', view).disabled = ok || tries < 2;
  };
  $('#reveal', view).onclick = () => { revealFill(box, q); $('#fill-after', view).innerHTML = `<div class="explain no"><b>Answers shown</b>${fmt(q.why)}<br><small class="muted">Type them in yourself and press Check to complete this exercise.</small></div>`; $$('.blank.shown', box).forEach(i => { i.addEventListener('input', () => i.classList.remove('shown'), { once: true }); }); };
  $('#f-next', view).onclick = () => goNextAfter(c, u, q.id);
}

/* ---------- Module complete ---------- */
route('/unit-done/:uid', (view, p) => {
  const u = UNIT[p.uid]; if (!u) return;
  const c = COURSE[u.course], ui = c.units.indexOf(u), nextU = c.units[ui + 1];
  const its = unitItems(u), dn = its.filter(itemDoneAt).length, all = dn === its.length;
  if (all) confetti(80);
  const [bn, bf] = BOSSES[u.id] || ['Unit Guardian', '🛡️'];
  view.innerHTML = `<div class="wrap narrow"><div class="card" style="text-align:center"><div style="font-size:4rem">${all ? '🎉' : '📦'}</div><span class="eyebrow">Module ${ui + 1} · ${esc(c.title)}</span><h1 style="font-size:2rem">${all ? 'Module complete!' : 'End of module'}</h1><p class="muted">${esc(u.title)}: ${dn}/${its.length} items done${all ? '' : `. You skipped ${its.length - dn}, and you can come back anytime`}.</p></div>
    <h3 style="margin-top:26px">What's next? Pick one:</h3>
    <div class="grid g2">
      ${nextU ? `<a class="card hover search-hit" href="${unitItems(nextU)[0].href}"><div style="font-size:2rem">➡️</div><h3>Next module</h3><small class="muted">${esc(nextU.title)}</small></a>` : `<a class="card hover search-hit" href="#/course/${c.id}"><div style="font-size:2rem">🏁</div><h3>Course overview</h3><small class="muted">You reached the last module!</small></a>`}
      <a class="card hover search-hit" href="#/quiz?mode=unit&units=${u.id}&types=quiz"><div style="font-size:2rem">📝</div><h3>Take the unit quiz</h3><small class="muted">${u.quiz.length} questions · score 70% to check it off${S.units[u.id]?.quizBest != null ? ` · best ${Math.round(S.units[u.id].quizBest * 100)}%` : ''}</small></a>
      ${u.trace.length + u.bug.length + u.fill.length ? `<a class="card hover search-hit" href="#/quiz?mode=unit&units=${u.id}&types=trace,bug,fill"><div style="font-size:2rem">🐛</div><h3>Code challenges</h3><small class="muted">Trace the code, find the bug and fill in the blanks</small></a>` : ''}
      ${S.settings.bosses ? `<a class="card hover search-hit" href="#/boss/${u.id}"><div style="font-size:2rem">${bf}</div><h3>Fight the boss <span class="pill">optional</span></h3><small class="muted">${esc(bn)}${S.units[u.id]?.boss ? ' · already beaten 🏆' : ' · +150 XP if you win'}</small></a>` : ''}
    </div></div>`;
});
