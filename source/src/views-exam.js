/* ================= AP CSA practice exams + FRQ practice ================= */
const FRQ_LIST = window.FRQS || [];
const FRQ_TYPES = { 1: 'Methods and Control Structures', 2: 'Class Design', 3: 'Data Analysis with ArrayList', 4: '2D Array' };
const FRQ_POINTS = { 1: 7, 2: 7, 3: 5, 4: 6 };
const PRACTICES = { 1: 'Design Code', 2: 'Develop Code', 3: 'Analyze Code', 4: 'Document Code and Computing Systems', 5: 'Use Computers Responsibly' };
const CSA_WEIGHT = { csa1: 0.20, csa2: 0.30, csa3: 0.14, csa4: 0.36 };   // midpoints of 15–25 / 25–35 / 10–18 / 30–40
const EXAM_MODES = {
  full: { name: 'Full practice exam', n: 42, mins: 90, frq: true, blurb: 'Section I: 42 multiple-choice questions in 90 minutes. Section II: 4 free-response questions in 90 minutes. Just like exam day.' },
  section1: { name: 'Section I only', n: 42, mins: 90, blurb: '42 multiple-choice questions in 90 minutes.' },
  mini: { name: 'Mini exam', n: 14, mins: 30, blurb: '14 questions in 30 minutes, with the same unit mix. Great for a quick check.' },
  unit: { name: 'Unit test', n: 15, mins: 35, blurb: '15 questions from one unit in 35 minutes.' },
};
const skillChip = s => `<span class="pill skill" title="${/^\d\.[A-Z]$/.test(s) ? `Practice ${esc(s[0])}: ${esc(PRACTICES[s[0]] || '')}` : esc(s)}">${esc(s)}</span>`;
function csaMcqPool(unitId) {
  const c = COURSE.csa; if (!c) return [];
  return c.units.filter(u => !unitId || u.id === unitId).flatMap(u => [...u.quiz, ...u.trace, ...u.lessons.flatMap(l => (l.quizzes || []).map(q => ({ ...q, unit: u.id, course: 'csa' })))]).filter(q => q.kind === 'mcq');
}
function buildExamQs(mode, unitId, seed) {
  const rnd = seeded(seed);
  const n = EXAM_MODES[mode].n;
  if (mode === 'unit') return shuffle(csaMcqPool(unitId), rnd).slice(0, n);
  const units = Object.keys(CSA_WEIGHT);
  // largest-remainder rounding so the unit mix matches the weightings as closely as possible
  const exact = units.map(u => CSA_WEIGHT[u] * n), counts = exact.map(Math.floor);
  let left = n - counts.reduce((a, b) => a + b, 0);
  exact.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => counts[i]++);
  const qs = units.flatMap((u, i) => shuffle(csaMcqPool(u), rnd).slice(0, counts[i]));
  return shuffle(qs, rnd);
}
const qById = id => { for (const q of csaMcqPool()) if (q.id === id) return q; return Q[id]; };
function estScore(pct) { return pct >= 0.70 ? 5 : pct >= 0.57 ? 4 : pct >= 0.44 ? 3 : pct >= 0.30 ? 2 : 1; }
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------- Exam center ---------- */
route('/exam', (view) => {
  const c = COURSE.csa;
  const hist = (S.exams || []).slice().reverse();
  const draft = S.examDraft;
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// AP CSA exam prep</span><h1 style="font-size:2.2rem">☕ AP CSA Practice Exams</h1>
    <p class="muted" style="max-width:720px">Practice under real conditions. The AP CS A exam has <b>Section I</b> (42 multiple-choice questions, 90 minutes, 55% of your score) and <b>Section II</b> (4 free-response questions, 90 minutes, 45%). Questions are drawn from all four units, using the College Board's unit weightings.</p>
    <div class="card ap-strip" style="margin:14px 0"><div class="spread"><div><b>✍️ Looking for FRQ practice?</b><br><small class="muted">${FRQ_LIST.length} free-response questions, 2 of each official type, with sample solutions and scoring rubrics.</small></div><a class="btn primary" href="#/frq">Open FRQ practice →</a></div></div>
    ${draft ? `<div class="notice ok" style="margin:16px 0"><b>You have an exam in progress:</b> ${esc(EXAM_MODES[draft.mode]?.name || 'Exam')}, ${draft.section === 2 ? 'Section II' : `${Object.keys(draft.answers).length}/${draft.qids.length} answered`}. <a class="btn sm primary" href="#/exam/run">Resume →</a> <button class="btn sm ghost" id="discard">Discard</button></div>` : ''}
    <div class="grid g2" style="margin-top:18px">
      ${['full', 'section1', 'mini'].map(k => `<div class="card"><h3>${k === 'full' ? '📝' : k === 'mini' ? '⚡' : '🅰️'} ${EXAM_MODES[k].name}</h3><p class="muted">${EXAM_MODES[k].blurb}</p><button class="btn ${k === 'full' ? 'primary' : ''}" data-start="${k}">Start</button></div>`).join('')}
      <div class="card"><h3>🎯 Unit test</h3><p class="muted">${EXAM_MODES.unit.blurb}</p><div class="row"><select class="input" id="ut-unit" style="width:auto">${c.units.map(u => `<option value="${u.id}">${esc(u.title)}</option>`).join('')}</select><button class="btn" data-start="unit">Start</button></div></div>
      <a class="card hover search-hit" href="#/frq"><h3>✍️ FRQ practice (optional)</h3><p class="muted">${FRQ_LIST.length} original free-response questions in the official format, with sample solutions and scoring rubrics so you can grade yourself.</p><span class="btn sm">Open FRQs →</span></a>
    </div>
    <div class="card" style="margin-top:18px"><h3>📊 Exam weighting</h3><div class="grid g4" style="margin-top:10px">${c.units.map(u => `<div><b>${esc(u.title.replace(/^Unit \d+: /, ''))}</b><br><span class="pill accent">${esc(u.weight)}</span></div>`).join('')}</div>
      <p class="muted" style="margin:12px 0 0"><small>FRQs: Q1 Methods and Control Structures (7 pts), Q2 Class Design (7), Q3 Data Analysis with ArrayList (5), Q4 2D Array (6).</small></p></div>
    <h2 style="margin-top:30px">Your results</h2>
    ${hist.length ? `<div class="card" style="padding:0;overflow-x:auto"><table class="gb"><thead><tr><th>Date</th><th>Exam</th><th>Section I</th><th>Section II</th><th>Est. AP score*</th></tr></thead><tbody>${hist.map(h => `<tr><td class="gb-name">${new Date(h.at).toLocaleDateString()}</td><td>${esc(h.name)}</td><td>${h.mcq.correct}/${h.mcq.total} (${Math.round(h.mcq.correct / h.mcq.total * 100)}%)</td><td>${h.frq != null ? `${h.frq}/25` : '–'}</td><td><b>${h.est}</b></td></tr>`).join('')}</tbody></table></div><p class="muted"><small>*A rough estimate based on your percentage. It isn't an official College Board conversion.</small></p>` : '<div class="empty card">No practice exams yet. Your scores will show up here.</div>'}
  </div>${footer()}`;
  $$('[data-start]', view).forEach(b => b.onclick = async () => {
    if (S.examDraft && !(await confirmBox('Start a new exam?', 'Your exam in progress will be discarded.', 'Start new'))) return;
    const mode = b.dataset.start, unit = mode === 'unit' ? $('#ut-unit', view).value : null, seed = Date.now().toString(36);
    const qs = buildExamQs(mode, unit, seed);
    S.examDraft = { mode, unit, seed, qids: qs.map(q => q.id), answers: {}, flags: [], cur: 0, section: 1, endsAt: Date.now() + EXAM_MODES[mode].mins * 60000, started: Date.now() };
    save(); go('/exam/run');
  });
  $('#discard', view)?.addEventListener('click', async () => { if (await confirmBox('Discard this exam?', 'Your answers will be lost.', 'Discard')) { S.examDraft = null; save(); render(); } });
});

/* ---------- Section I runner (navigator, flags, timer, no feedback until the end) ---------- */
route('/exam/run', (view) => {
  const d = S.examDraft; if (!d) return go('/exam');
  if (d.section >= 2) return frqSection(view, d);
  const qs = d.qids.map(qById).filter(Boolean);
  const order = qs.map(q => choiceOrder(q, seeded(d.seed + q.id)));
  let timer;
  const left = () => Math.max(0, (d.endsAt - Date.now()) / 1000);
  const draw = () => {
    const i = d.cur, q = qs[i];
    view.innerHTML = `<div class="wrap exam"><div class="exam-top"><div><b>${esc(EXAM_MODES[d.mode].name)}</b> · Section I<br><small class="muted">Question ${i + 1} of ${qs.length} · ${Object.keys(d.answers).length} answered</small></div><div class="timer" id="ex-timer">${fmtTime(left())}</div><button class="btn sm primary" id="ex-review">Review & submit</button></div>
      <div class="exam-grid">
        <div class="card" id="qbox" data-qid="${esc(q.id)}"><div class="spread" style="margin-bottom:8px"><span class="pill">${esc(UNIT[q.unit]?.title.replace(/^Unit (\d+):.*/, 'Unit $1') || '')}</span><button class="btn sm ghost ${d.flags.includes(i) ? 'flagged' : ''}" id="flag">${d.flags.includes(i) ? '🚩 Flagged' : '⚑ Flag for review'}</button></div>
          <div class="qtext">${fmt(q.q)}${qPts(q)}</div>${qExtra(q)}
          <div class="choices">${order[i].map((ci, k) => `<button class="choice ${d.answers[i] === ci ? 'picked' : ''}" data-ci="${ci}" aria-pressed="${d.answers[i] === ci}"><span class="key">${'ABCDE'[k]}</span><span>${fmt(q.choices[ci])}</span></button>`).join('')}</div>
          <div class="qfoot" style="justify-content:space-between"><button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>← Previous</button><button class="btn primary" id="next">${i === qs.length - 1 ? 'Review & submit' : 'Next →'}</button></div></div>
        <aside class="card navgrid" aria-label="Question navigator"><b>Questions</b><div class="nav-nums">${qs.map((_, k) => `<button class="${k === i ? 'cur' : ''} ${d.answers[k] != null ? 'ans' : ''} ${d.flags.includes(k) ? 'flag' : ''}" data-go="${k}" aria-label="Question ${k + 1}">${k + 1}</button>`).join('')}</div><small class="muted">■ answered · 🚩 flagged</small></aside>
      </div></div>`;
    $$('.choice', view).forEach(b => b.onclick = () => { d.answers[i] = +b.dataset.ci; save(); sfx('click'); draw(); });
    $('#flag', view).onclick = () => { const k = d.flags.indexOf(i); k >= 0 ? d.flags.splice(k, 1) : d.flags.push(i); save(); draw(); };
    $('#prev', view).onclick = () => { d.cur = Math.max(0, i - 1); save(); draw(); };
    $('#next', view).onclick = () => { if (i === qs.length - 1) review(); else { d.cur = i + 1; save(); draw(); } };
    $('#ex-review', view).onclick = review;
    $$('[data-go]', view).forEach(b => b.onclick = () => { d.cur = +b.dataset.go; save(); draw(); });
  };
  const review = () => {
    const un = qs.length - Object.keys(d.answers).length;
    const m = modal(`<h3>Submit Section I?</h3><p>${un ? `<b>${un} question${un === 1 ? ' is' : 's are'} unanswered.</b> On the real exam, there's no penalty for guessing.` : 'You answered every question.'} ${d.flags.length ? `You flagged ${d.flags.length} for review.` : ''}</p><p class="muted">Time left: ${fmtTime(left())}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-x>Keep working</button><button class="btn primary" id="do-submit">Submit</button></div>`);
    $('[data-x]', m).onclick = closeModal; $('#do-submit', m).onclick = () => { closeModal(); finish(); };
  };
  const finish = () => {
    clearInterval(timer);
    let correct = 0; const byUnit = {};
    qs.forEach((q, i) => { const ok = d.answers[i] === q.a; if (ok) correct++; const u = byUnit[q.unit] = byUnit[q.unit] || { c: 0, n: 0 }; u.n++; if (ok) u.c++; recordAnswer(q, ok); });
    d.result = { correct, total: qs.length, byUnit };
    addXP(Math.round(correct * 6), `Practice exam: ${EXAM_MODES[d.mode].name}`);
    if (EXAM_MODES[d.mode].frq) { d.section = 2; d.frqIds = [1, 2, 3, 4].map(t => pick(FRQ_LIST.filter(f => f.q === t))?.id).filter(Boolean); d.frqCode = {}; d.endsAt = Date.now() + 90 * 60000; save(); return mcqResults(view, d, qs, order, true); }
    const est = estScore(correct / qs.length);
    S.exams = [...(S.exams || []), { at: Date.now(), name: EXAM_MODES[d.mode].name + (d.unit ? ` (${UNIT[d.unit].title.replace(/:.*/, '')})` : ''), mcq: { correct, total: qs.length }, frq: null, est }];
    S.examDraft = null; save();
    mcqResults(view, d, qs, order, false);
  };
  draw();
  timer = setInterval(() => { const t = $('#ex-timer', view); if (!t) return; const l = left(); t.textContent = fmtTime(l); t.classList.toggle('low', l < 300); if (l <= 0) { clearInterval(timer); toast("⏰ Time's up!", 'Section I was submitted automatically.'); finish(); } }, 500);
  onLeave(() => clearInterval(timer));
  const onKey = e => { if ($('.modal') || e.target.matches('input,textarea')) return; const k = 'abcde'.indexOf(e.key.toLowerCase()); if (k >= 0) $$('.choice', view)[k]?.click(); if (e.key === 'ArrowRight') $('#next', view)?.click(); if (e.key === 'ArrowLeft') $('#prev', view)?.click(); };
  document.addEventListener('keydown', onKey); onLeave(() => document.removeEventListener('keydown', onKey));
});

function mcqResults(view, d, qs, order, toFrq) {
  const r = d.result, pct = r.correct / r.total;
  if (pct >= 0.7) confetti(120);
  view.innerHTML = `<div class="wrap narrow"><div class="card result"><span class="eyebrow">${esc(EXAM_MODES[d.mode].name)} · Section I</span><div class="score">${r.correct}/${r.total}</div><p class="muted">${Math.round(pct * 100)}% correct${toFrq ? '' : ` · estimated AP score* <b>${estScore(pct)}</b>`}</p>
    <table class="gb" style="margin:14px 0"><thead><tr><th>Unit</th><th>Correct</th><th>%</th></tr></thead><tbody>${Object.entries(r.byUnit).sort().map(([u, v]) => `<tr><td class="gb-name">${esc(UNIT[u].title)}</td><td>${v.c}/${v.n}</td><td class="${v.c / v.n >= 0.7 ? 'gb-ok' : v.c / v.n >= 0.5 ? 'gb-late' : 'gb-miss'}">${Math.round(v.c / v.n * 100)}%</td></tr>`).join('')}</tbody></table>
    ${toFrq ? `<p><b>Next: Section II.</b> You'll have 90 minutes for 4 free-response questions. Afterward, you'll grade yourself with the scoring rubrics.</p><div class="row" style="justify-content:center"><button class="btn primary lg" onclick="go('/exam/run')">Start Section II →</button></div>` : `<div class="row" style="justify-content:center"><a class="btn primary" href="#/exam">Back to exams</a><a class="btn" href="#/quiz?mode=review">Practice my mistakes</a></div><p class="muted"><small>*A rough estimate, not an official College Board conversion.</small></p>`}</div>
    <h3 style="margin-top:26px">Review answers</h3><div class="tabs"><button class="on" data-f="wrong">Missed (${r.total - r.correct})</button><button data-f="all">All ${r.total}</button></div><div id="rv"></div></div>`;
  const drawRv = f => { $('#rv', view).innerHTML = qs.map((q, i) => ({ q, i })).filter(({ q, i }) => f === 'all' || d.answers[i] !== q.a).map(({ q, i }) => { const mine = d.answers[i]; const ok = mine === q.a; return `<div class="card" style="margin-bottom:10px"><small class="muted">Q${i + 1} · ${esc(UNIT[q.unit]?.title || '')}</small><div class="qtext" style="font-size:1rem">${fmt(q.q)}</div>${qExtra(q)}<p style="margin:6px 0">${ok ? '✅' : '❌'} Your answer: ${mine == null ? '<i>none</i>' : `<b>${'ABCDE'[order[i].indexOf(mine)]}</b>. ${fmt(q.choices[mine])}`}${ok ? '' : `<br>✔ Correct: <b>${'ABCDE'[order[i].indexOf(q.a)]}</b>. ${fmt(q.choices[q.a])}`}</p><div class="explain ${ok ? '' : 'no'}">${fmt(q.why)}</div></div>`; }).join('') || '<div class="empty">Perfect score! 🎉</div>'; };
  $$('[data-f]', view).forEach(b => b.onclick = () => { $$('[data-f]', view).forEach(x => x.classList.toggle('on', x === b)); drawRv(b.dataset.f); });
  drawRv('wrong');
}

/* ---------- Section II (4 FRQs, one of each type) ---------- */
function frqSection(view, d) {
  const frqs = d.frqIds.map(id => FRQ_LIST.find(f => f.id === id)).filter(Boolean);
  let cur = d.frqCur || 0, timer;
  const left = () => Math.max(0, (d.endsAt - Date.now()) / 1000);
  const draw = () => {
    const f = frqs[cur];
    view.innerHTML = `<div class="wrap exam"><div class="exam-top"><div><b>${esc(EXAM_MODES[d.mode].name)}</b> · Section II<br><small class="muted">Free response · Question ${cur + 1} of 4 · about 22 minutes each</small></div><div class="timer" id="ex-timer">${fmtTime(left())}</div><button class="btn sm primary" id="frq-submit">Submit Section II</button></div>
      <div class="tabs">${frqs.map((x, k) => `<button class="${k === cur ? 'on' : ''}" data-q="${k}">Q${x.q} · ${esc(FRQ_TYPES[x.q])}</button>`).join('')}</div>
      ${frqBody(f, d.frqCode, false)}</div>`;
    wireFrqEditors(view, f, d.frqCode, () => save());
    $$('[data-q]', view).forEach(b => b.onclick = () => { cur = d.frqCur = +b.dataset.q; save(); draw(); });
    $('#frq-submit', view).onclick = async () => { if (await confirmBox('Submit Section II?', 'Next, you\'ll compare your code with the sample solutions and score yourself with the rubrics.', 'Submit')) finish(); };
  };
  const finish = () => { clearInterval(timer); d.section = 3; save(); selfScore(view, d, frqs); };
  if (d.section === 3) return selfScore(view, d, frqs);
  draw();
  timer = setInterval(() => { const t = $('#ex-timer', view); if (!t) return; const l = left(); t.textContent = fmtTime(l); t.classList.toggle('low', l < 300); if (l <= 0) { clearInterval(timer); toast("⏰ Time's up!", 'Section II was submitted.'); finish(); } }, 500);
  onLeave(() => clearInterval(timer));
}
function frqBody(f, codeStore, reveal) {
  return `<div class="frq"><div class="card frq-scen"><span class="eyebrow">Question ${f.q} · ${esc(FRQ_TYPES[f.q])} · ${f.parts.reduce((n, p) => n + p.points, 0)} points</span><h2 style="margin:4px 0 10px">${esc(f.title)}</h2><div class="prose">${f.scenario}</div></div>
    ${f.parts.map(p => `<div class="card frq-part"><h3>${f.parts.length > 1 ? `Part (${esc(p.label)})` : 'Your task'} <span class="pill">${p.points} point${p.points === 1 ? '' : 's'}</span></h3><div class="prose">${p.prompt}</div>
      <div class="frq-ed" data-part="${esc(p.label)}"></div>
      ${reveal ? `<div class="frq-reveal"><h4>Sample solution</h4>${codeBlock(p.solution, 'java')}<h4>Scoring rubric</h4><ul class="rubric">${p.rubric.map((r, k) => `<li><label><input type="checkbox" data-rub="${esc(p.label)}:${k}" data-pts="${r.pts}"> <b>+${r.pts}</b> ${fmt(r.text)}</label></li>`).join('')}</ul></div>` : ''}</div>`).join('')}</div>`;
}
function wireFrqEditors(view, f, store, onSave) {
  store[f.id] = store[f.id] || {};
  $$('.frq-ed', view).forEach(host => { const p = f.parts.find(x => x.label === host.dataset.part); const key = p.label; mountEditor(host, { code: store[f.id][key] ?? p.starter, lang: 'java', onChange: v => { store[f.id][key] = v; onSave(); } }); });
}
function selfScore(view, d, frqs) {
  let i = 0;
  const scores = d.frqScores = d.frqScores || {};
  const draw = () => {
    const f = frqs[i];
    view.innerHTML = `<div class="wrap exam"><div class="exam-top"><div><b>Score yourself</b> · Section II<br><small class="muted">Check each rubric point your code earned. Be honest: that's how you improve!</small></div><span class="pill accent" id="tot">0/25</span></div>
      <div class="tabs">${frqs.map((x, k) => `<button class="${k === i ? 'on' : ''}" data-q="${k}">Q${x.q} ${scores[x.id] != null ? `· ${scores[x.id]}/${FRQ_POINTS[x.q]}` : ''}</button>`).join('')}</div>
      ${frqBody(f, d.frqCode, true)}
      <div class="row" style="justify-content:space-between;margin-top:14px">${i > 0 ? '<button class="btn" id="sp">← Previous</button>' : '<span></span>'}<button class="btn primary" id="sn">${i < frqs.length - 1 ? 'Next question →' : 'Finish & see my score'}</button></div></div>`;
    wireFrqEditors(view, f, d.frqCode, () => save());
    const boxes = $$('[data-rub]', view);
    (d.frqChecks?.[f.id] || []).forEach(k => { const b = boxes.find(x => x.dataset.rub === k); if (b) b.checked = true; });
    const upd = () => { d.frqChecks = d.frqChecks || {}; d.frqChecks[f.id] = boxes.filter(b => b.checked).map(b => b.dataset.rub); scores[f.id] = boxes.filter(b => b.checked).reduce((n, b) => n + +b.dataset.pts, 0); save(); $('#tot', view).textContent = `${Object.values(scores).reduce((a, b) => a + b, 0)}/25`; };
    boxes.forEach(b => b.onchange = upd); upd();
    $$('[data-q]', view).forEach(b => b.onclick = () => { i = +b.dataset.q; draw(); });
    $('#sp', view)?.addEventListener('click', () => { i--; draw(); });
    $('#sn', view).onclick = () => { if (i < frqs.length - 1) { i++; draw(); } else done(); };
  };
  const done = () => {
    const frq = Object.values(scores).reduce((a, b) => a + b, 0), mcqPct = d.result.correct / d.result.total;
    const composite = mcqPct * 55 + frq / 25 * 45, est = estScore(composite / 100);
    S.exams = [...(S.exams || []), { at: Date.now(), name: EXAM_MODES[d.mode].name, mcq: { correct: d.result.correct, total: d.result.total }, frq, est }];
    for (const f of frqs) { S.frqBest = S.frqBest || {}; S.frqBest[f.id] = Math.max(S.frqBest[f.id] || 0, scores[f.id] || 0); }
    addXP(frq * 8, 'Practice exam: free response');
    S.examDraft = null; save(); if (est >= 4) confetti(150);
    view.innerHTML = `<div class="wrap narrow"><div class="card result"><span class="eyebrow">Full practice exam · final report</span><div class="score">${est}</div><p class="muted">Estimated AP score*</p>
      <table class="gb" style="margin:14px 0"><tbody><tr><td class="gb-name">Section I (multiple choice)</td><td>${d.result.correct}/${d.result.total}</td><td>${Math.round(mcqPct * 55)} / 55</td></tr><tr><td class="gb-name">Section II (free response)</td><td>${frq}/25</td><td>${Math.round(frq / 25 * 45)} / 45</td></tr><tr><td class="gb-name"><b>Composite</b></td><td></td><td><b>${Math.round(composite)} / 100</b></td></tr></tbody></table>
      <p class="muted"><small>*A rough estimate. The College Board sets real score cutoffs each year, and they aren't public in advance.</small></p>
      <div class="row" style="justify-content:center"><a class="btn primary" href="#/exam">Back to exams</a><a class="btn" href="#/frq">More FRQ practice</a></div></div></div>`;
  };
  draw();
}

/* ---------- FRQ practice (standalone) ---------- */
route('/frq', (view) => {
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// optional practice</span><h1 style="font-size:2.2rem">✍️ AP CSA FRQ practice</h1>
    <p class="muted" style="max-width:720px">Original free-response questions in the 2025–26 format. Write your answer in the editor, then reveal the sample solution and scoring rubric to grade yourself. Aim for about 22 minutes per question. Java doesn't run in the browser here, so this works just like the real exam: you write the code and check it against the rubric.</p>
    ${[1, 2, 3, 4].map(t => `<h3 style="margin-top:24px">Question ${t}: ${esc(FRQ_TYPES[t])} <span class="pill">${FRQ_POINTS[t]} points</span></h3><div class="grid g2">${FRQ_LIST.filter(f => f.q === t).map(f => `<a class="card hover search-hit" href="#/frq/${f.id}"><b>${esc(f.title)}</b><br><small class="muted">${f.parts.length > 1 ? `Parts ${f.parts.map(p => `(${p.label})`).join(' ')}` : 'One part'} · ${f.parts.reduce((n, p) => n + p.points, 0)} pts${S.frqBest?.[f.id] != null ? ` · your best: ${S.frqBest[f.id]}` : ''}</small></a>`).join('')}</div>`).join('')}
    <p style="margin-top:24px"><a class="btn" href="#/exam">← Practice exams</a></p></div>${footer()}`;
});
route('/frq/:id', (view, p) => {
  const f = FRQ_LIST.find(x => x.id === p.id); if (!f) return;
  S.frqDrafts = S.frqDrafts || {};
  let reveal = false, timer, t0 = Date.now(), timing = false;
  const total = f.parts.reduce((n, x) => n + x.points, 0);
  const draw = () => {
    view.innerHTML = `<div class="wrap exam"><div class="exam-top"><div><a href="#/frq">← All FRQs</a><br><small class="muted">Practice · Q${f.q} ${esc(FRQ_TYPES[f.q])}</small></div><div class="row"><span class="timer" id="ex-timer">${timing ? '22:30' : ''}</span>${!reveal ? `<button class="btn sm ghost" id="tm">${timing ? '⏹ Stop timer' : '⏱ Start 22:30 timer'}</button>` : ''}<button class="btn sm primary" id="rv">${reveal ? '↺ Try again' : '✓ Check my answer'}</button></div></div>
      ${frqBody(f, S.frqDrafts, reveal)}${reveal ? `<div class="card" style="margin-top:14px;text-align:center"><b>Your score: <span id="mine">0</span>/${total}</b><br><small class="muted">Check each rubric point your code earned.</small></div>` : ''}</div>`;
    wireFrqEditors(view, f, S.frqDrafts, save);
    $('#rv', view).onclick = async () => { if (!reveal) { reveal = true; clearInterval(timer); timing = false; draw(); } else if (await confirmBox('Try again?', 'Your code stays in the editor, and the rubric checkboxes reset.', 'OK')) { reveal = false; draw(); } };
    $('#tm', view)?.addEventListener('click', () => { timing = !timing; clearInterval(timer); if (timing) { t0 = Date.now(); timer = setInterval(() => { const l = Math.max(0, 1350 - (Date.now() - t0) / 1000); const el = $('#ex-timer', view); if (el) { el.textContent = fmtTime(l); el.classList.toggle('low', l < 120); } if (l <= 0) { clearInterval(timer); toast("⏰ Time's up!", 'On exam day, move on to the next question.'); } }, 500); } draw(); });
    const boxes = $$('[data-rub]', view);
    boxes.forEach(b => b.onchange = () => { const sc = boxes.filter(x => x.checked).reduce((n, x) => n + +x.dataset.pts, 0); $('#mine', view).textContent = sc; S.frqBest = S.frqBest || {}; const first = S.frqBest[f.id] == null; S.frqBest[f.id] = Math.max(S.frqBest[f.id] || 0, sc); save(); if (first && sc) addXP(30, `FRQ practice: ${f.title}`); });
  };
  draw(); onLeave(() => clearInterval(timer));
});
