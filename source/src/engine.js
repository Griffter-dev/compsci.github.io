/* ================= Quiz engine (used by practice, games, bosses, duels) ================= */
const XP_BY_TYPE = { quiz: 10, trace: 15, bug: 20, fill: 15, squad: 10 };
const evMult = q => (EVENT.units.includes(q.unit) ? 2 : 1);

function runQuiz(view, o) {
  const st = {
    idx: 0, score: 0, correct: 0, wrong: 0, combo: 0, maxCombo: 0, lives: o.lives ?? Infinity,
    timeLeft: o.timeLimit ?? null, start: Date.now(), qStart: Date.now(), answered: false, results: [], xp: 0, done: false,
    bossHp: o.boss ? 100 : 0,
  };
  const qs = o.questions.slice();
  const rnd = o.seed ? seeded(o.seed) : Math.random;
  const order = qs.map(q => q.kind === 'mcq' ? (o.shuffleChoices === false ? q.choices.map((_, i) => i) : choiceOrder(q, rnd)) : null);
  let timer = null, autoT = null;
  const finish = (reason) => {
    if (st.done) return; st.done = true;
    clearInterval(timer); clearTimeout(autoT); document.removeEventListener('keydown', onKey);
    st.reason = reason; st.elapsed = (Date.now() - st.start) / 1000;
    o.onFinish ? o.onFinish(st, view) : showResult(view, st, o);
  };
  onLeave(() => { st.done = true; clearInterval(timer); clearTimeout(autoT); document.removeEventListener('keydown', onKey); o.onAbort && o.onAbort(st); });

  if (st.timeLeft != null) {
    timer = setInterval(() => {
      st.timeLeft = Math.max(0, st.timeLeft - 0.25);
      const t = $('#q-timer', view);
      if (t) { t.textContent = Math.ceil(st.timeLeft) + 's'; t.classList.toggle('low', st.timeLeft <= 10); }
      if (st.timeLeft <= 10 && Math.abs(st.timeLeft - Math.round(st.timeLeft)) < 0.01 && st.timeLeft > 0) sfx('tick');
      if (st.timeLeft <= 0) finish('time');
    }, 250);
  }

  function header() {
    const total = o.endless ? null : qs.length;
    const pct = total ? (st.idx / total) * 100 : 0;
    return `<div class="qhead">
      <button class="btn ghost sm" id="q-quit" aria-label="Quit">✕ Quit</button>
      ${total ? `<div class="bar" aria-label="Progress"><i style="width:${pct}%"></i></div><span class="mono muted">${Math.min(st.idx + 1, total)}/${total}</span>` : `<div style="flex:1"></div><span class="mono">Score: <b>${st.score}</b></span>`}
      ${st.combo >= 3 ? `<span class="combo">×${comboMult()} combo</span>` : ''}
      ${o.lives != null ? `<span class="hearts" aria-label="${st.lives} lives">${'❤️'.repeat(Math.max(0, st.lives))}${'🖤'.repeat(Math.max(0, o.lives - st.lives))}</span>` : ''}
      ${st.timeLeft != null ? `<span class="timer" id="q-timer">${Math.ceil(st.timeLeft)}s</span>` : ''}
    </div>
    ${o.boss ? `<div class="boss" id="boss"><span class="face">${o.boss.face}</span><div class="hp"><div class="spread"><b>${esc(o.boss.name)}</b><span class="mono">${Math.ceil(st.bossHp)} HP</span></div><div class="bar"><i style="width:${st.bossHp}%"></i></div></div></div>` : ''}
    ${o.extra ? `<div id="q-extra">${o.extra(st)}</div>` : ''}`;
  }
  const quit = async () => { if (o.confirmQuit === false || !st.results.length || await confirmBox('Quit this round?', 'Your progress in this round will be lost.', 'Quit')) { st.done = true; clearInterval(timer); clearTimeout(autoT); o.onQuit && o.onQuit(st); go(o.back || '/practice'); } };
  const comboMult = () => st.combo >= 10 ? 3 : st.combo >= 5 ? 2 : st.combo >= 3 ? 1.5 : 1;

  function show() {
    if (st.done) return;
    if (st.idx >= qs.length) { if (o.endless && o.more) { qs.push(...o.more()); order.push(...qs.slice(order.length).map(q => q.kind === 'mcq' ? choiceOrder(q) : null)); } else return finish('done'); }
    const q = qs[st.idx]; st.answered = false; st.qStart = Date.now();
    const typeLabel = q.type === 'trace' ? 'Trace the code' : q.type === 'bug' ? 'Find the bug' : q.type === 'fill' ? 'Fill in the code' : q.type === 'squad' ? `Squad question · by ${esc(q.authorName || 'a squadmate')}` : 'Question';
    const src = UNIT[q.unit] ? `${COURSE[q.course].short} · ${UNIT[q.unit].title}` : '';
    view.innerHTML = `<div class="wrap"><div class="qcard">${header()}
      <div class="card" id="qbox" data-qid="${esc(q.id)}">
        <div class="spread" style="margin-bottom:10px"><span class="pill accent">${typeLabel}</span>${src ? `<small class="muted">${esc(src)}</small>` : ''}</div>
        <div class="qtext">${fmt(q.q)}${qPts(q)}</div>
        ${q.kind === 'fill' ? `<div id="q-fill">${fillHtml(q, 'qb')}</div><div class="row" style="justify-content:flex-end"><button class="btn primary" id="q-check">✓ Check</button></div>` : q.kind === 'bug' ? bugHtml(q) : qExtra(q) + `<div class="choices${q.sheet && q.choices.every(c => c.length < 34) ? ' grid2' : ''}" role="group" aria-label="Answer choices">${order[st.idx].map((ci, k) => `<button class="choice" data-ci="${ci}"><span class="key">${q.sheet ? 'ABCDE'[k] : k + 1}</span><span>${fmt(q.choices[ci])}</span></button>`).join('')}</div>`}
        <div id="q-after"></div>
      </div></div></div>`;
    $('#q-quit', view).onclick = quit;
    $$('.choice', view).forEach(b => b.onclick = () => answer(+b.dataset.ci === q.a, b, q));
    $$('.buglines button', view).forEach(b => b.onclick = () => answer(q.lines.includes(+b.dataset.ln), b, q));
    if (q.kind === 'fill') { const fb = $('#q-fill', view); $$('.blank', fb).forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#q-check', view).click(); })); $('.blank', fb)?.focus(); $('#q-check', view).onclick = () => { const ok = checkFill(fb, q); if (!ok) revealFill(fb, q); $$('.blank', fb).forEach(i => i.disabled = true); $('#q-check', view).remove(); answer(ok, null, q); }; }
    o.onShow && o.onShow(st, q);
  }
  function bugHtml(q) {
    const lines = q.code.split('\n');
    return `<p class="muted" style="margin-top:-6px">Click the line with the bug.</p><ol class="buglines" aria-label="Code lines">${lines.map((l, i) => `<li><button data-ln="${i + 1}"><span class="ln">${i + 1}</span><span>${highlight(l, q.lang) || ' '}</span></button></li>`).join('')}</ol>`;
  }
  function answer(ok, btn, q) {
    if (st.answered || st.done) return; st.answered = true;
    const ms = Date.now() - st.qStart;
    $$('.choice, .buglines button', view).forEach(b => b.disabled = true);
    if (q.kind === 'mcq') { btn.classList.add(ok ? 'right' : 'wrong'); if (!ok) $(`.choice[data-ci="${q.a}"]`, view)?.classList.add('right'); }
    else if (q.kind === 'fill') { }
    else { btn.classList.add(ok ? 'right' : 'wrong'); if (!ok) q.lines.forEach(n => $(`.buglines button[data-ln="${n}"]`, view)?.classList.add('right')); }
    $('#qbox', view).classList.add(ok ? 'flash-ok' : 'flash-bad');
    sfx(ok ? 'ok' : 'bad');
    if (ok) { st.correct++; st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo); } else { st.wrong++; st.combo = 0; if (o.lives != null) st.lives--; }
    if (o.record !== false) recordAnswer(q, ok);
    if (ok && o.mode === 'review') clearMistake(q.id);
    if (ok && q.kind === 'bug') S.stats.bugs++;
    st.results.push({ id: q.id, ok, ms });
    const gained = o.scoreFn ? o.scoreFn(q, ok, ms, st) : (ok ? 1 : 0);
    st.score += gained;
    if (ok) st.xp += (o.xpPer ? o.xpPer(q, ms, st) : XP_BY_TYPE[q.type] || 10) * evMult(q);
    if (o.boss && ok) { st.bossHp = Math.max(0, st.bossHp - o.boss.dmg); const b = $('#boss', view); if (b) { b.classList.add('hit'); $('.bar>i', b).style.width = st.bossHp + '%'; $('.mono', b).textContent = Math.ceil(st.bossHp) + ' HP'; } sfx('hit'); }
    if (o.timePenalty && !ok && st.timeLeft != null) st.timeLeft = Math.max(0, st.timeLeft - o.timePenalty);
    o.onAnswer && o.onAnswer(q, ok, ms, st);
    const head = $('.qhead', view); if (head) { const tmp = document.createElement('div'); tmp.innerHTML = header(); head.replaceWith(tmp.firstElementChild); $('#q-quit', view).onclick = quit; }
    const gameOver = (o.lives != null && st.lives <= 0) || (o.boss && st.bossHp <= 0);
    if (o.explain === false) { autoT = setTimeout(() => { st.idx++; gameOver ? finish(o.boss && st.bossHp <= 0 ? 'win' : 'lives') : show(); }, ok ? 450 : 900); return; }
    const after = $('#q-after', view);
    after.innerHTML = `<div class="explain ${ok ? '' : 'no'}"><b>${ok ? pick(['Correct!', 'Nice!', 'Nailed it!', 'Yes!', 'Exactly.']) : 'Not quite.'}</b>${q.fix ? `<div class="fixline">✔ ${esc(q.fix)}</div>` : ''}<div style="margin-top:6px">${fmt(q.why || '')}</div></div>
      <div class="qfoot"><button class="btn primary" id="q-next" autofocus>${gameOver || st.idx + 1 >= qs.length && !o.endless ? 'See results' : 'Next'} →</button></div>`;
    const nx = $('#q-next', view); nx.focus();
    nx.onclick = () => { st.idx++; gameOver ? finish(o.boss && st.bossHp <= 0 ? 'win' : 'lives') : show(); };
  }
  function onKey(e) {
    if (e.target.matches('input,textarea,select') || $('.modal')) return;
    const kk = /^[a-e]$/i.test(e.key) ? 'abcde'.indexOf(e.key.toLowerCase()) + 1 : +e.key; if (kk >= 1 && kk <= 6 && !e.ctrlKey && !e.metaKey) { const b = $$('.choice', view)[kk - 1]; if (b && !b.disabled) b.click(); }
    else if ((e.key === 'Enter' || e.key === ' ') && st.answered) { const n = $('#q-next', view); if (n && document.activeElement !== n) { e.preventDefault(); n.click(); } }
  }
  document.addEventListener('keydown', onKey);
  if (!qs.length) { view.innerHTML = `<div class="wrap empty"><span class="big">🫙</span><h2>No questions here yet</h2><p>Try picking a different course or unit.</p><a class="btn primary" href="#/practice">Back to practice</a></div>`; return; }
  show();
  return st;
}

function showResult(view, st, o, extraHtml = '') {
  const total = st.results.length, pct = total ? Math.round(st.correct / total * 100) : 0;
  const xp = st.xp > 0 ? addXP(st.xp, o.title || 'Practice') : 0;
  if (o.mode === 'practice' || o.mode === 'review' || o.mode === 'unit') { award('first-quiz'); if (total >= 5 && st.correct === total) { award('perfect'); S.stats.perfect++; } }
  if (pct >= 80 && total >= 3) { confetti(80); sfx('win'); }
  const missed = st.results.filter(r => !r.ok).map(r => Q[r.id] || squadQ(r.id)).filter(Boolean);
  view.innerHTML = `<div class="wrap narrow"><div class="result card">
    <span class="eyebrow">${esc(o.title || 'Results')}</span>
    <div class="score">${o.resultBig ?? pct + '%'}</div>
    <p class="muted">${o.resultSub ?? `${st.correct} of ${total} correct${st.maxCombo >= 3 ? ` · best combo ${st.maxCombo}` : ''}`}</p>
    ${xp ? `<div class="xpgain">+${xp} XP</div>` : ''}
    ${extraHtml}
    <div class="row" style="justify-content:center;margin-top:10px">
      ${o.again ? `<button class="btn primary" id="r-again">↻ Play again</button>` : ''}
      <a class="btn" href="#${o.back || '/practice'}">${esc(o.backLabel || 'Done')}</a>
    </div></div>
    ${missed.length ? `<h3 style="margin-top:30px">Review what you missed</h3><div class="stack">${missed.map(q => `<div class="card"><div class="qtext" style="font-size:1rem">${fmt(q.q)}</div>${q.code ? (q.kind === 'fill' ? codeBlock(q.code.replace(/\u0000(\d+)\u0000/g, (_, b) => '[' + q.blanks[+b][0] + ']'), q.lang, false) : qExtra(q)) : qExtra(q)}<div class="explain"><b>Answer: ${q.kind === 'bug' ? 'line ' + q.lines.join(' or ') : q.kind === 'fill' ? 'see the [bracketed] blanks' : fmt(q.choices[q.a])}</b>${q.fix ? `<div class="fixline">✔ ${esc(q.fix)}</div>` : ''}${fmt(q.why)}</div></div>`).join('')}</div>
      <p style="margin-top:14px"><a href="#/quiz?mode=review">Practice your mistakes later →</a></p>` : ''}
  </div>`;
  if (o.again) $('#r-again', view).onclick = () => o.again();
}
