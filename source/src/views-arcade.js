/* ================= Arcade: lobby, Bug Hunt, Speed Round, Duels, Weekly ================= */
const GAMES = [
  { id: 'bughunt', i: '🐛', n: 'Bug Hunt', d: 'Click the buggy line before time runs out. Bugs you find fast score more.', best: () => S.stats.bugBest ? `Best: ${S.stats.bugBest} pts` : 'No score yet' },
  { id: 'speed', i: '⚡', n: 'Speed Round', d: '60 seconds to answer as many as you can. Wrong answers cost 3 seconds, and combos boost your score.', best: () => S.stats.speedBest ? `Best: ${S.stats.speedBest} pts` : 'No score yet' },
  { id: 'duel', i: '⚔️', n: '1v1 Duel', d: 'Same questions, head to head. Battle ByteBot, or challenge a squadmate live.', best: () => `${S.stats.duelsWon} wins / ${S.stats.duelsPlayed} played` },
  { id: 'boss', i: '👹', n: 'Boss Battles', d: 'Optional fights for every module. Beat the boss before your 3 hearts run out.', best: () => `${Object.values(S.units).filter(u => u.boss).length} / ${Object.keys(UNIT).length} beaten` },
  { id: 'weekly', i: EVENT.emoji, n: 'Weekly Challenge', d: `${EVENT.name}: the same 10 questions for everyone this week. Compare scores with your squad.`, best: () => S.weekly[EVENT.week] ? `Best: ${S.weekly[EVENT.week].best} pts` : 'Not played yet' },
  { id: 'review', i: '🔄', n: 'Mistake Review', d: 'Clear the questions you missed before. Each one you clear counts toward a badge.', best: () => `${S.mistakes.length} waiting` },
];
route('/arcade', (view) => {
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// arcade</span><h1 style="font-size:2.2rem">Arcade</h1><p class="muted">Pick a game. Every game earns XP for your level and squad leaderboard.</p>
    <div class="event" style="margin:20px 0 26px"><div class="spread"><div><span class="eyebrow">This week · ${esc(EVENT.week)}</span><h2 style="margin:0">${EVENT.emoji} ${esc(EVENT.name)}</h2><p class="muted" style="margin:6px 0 0">${esc(EVENT.blurb)}</p></div><a class="btn primary" href="#/weekly">Play the weekly challenge →</a></div></div>
    <div class="grid g3">${GAMES.filter(g => g.id !== 'boss' || S.settings.bosses).map(g => `<button class="card hover game-card" data-g="${g.id}"><span class="gi">${g.i}</span><h3>${esc(g.n)}</h3><small class="muted">${esc(g.d)}</small><span class="best">${esc(g.best())}</span></button>`).join('')}</div></div>${footer()}`;
  $$('[data-g]', view).forEach(b => b.onclick = () => {
    const g = b.dataset.g;
    if (g === 'weekly') return go('/weekly');
    if (g === 'review') return go('/quiz?mode=review');
    if (g === 'boss') return bossPicker();
    if (g === 'duel') return go('/duel');
    coursePicker(g === 'bughunt' ? 'Bug Hunt' : 'Speed Round', cid => go(`/${g}?course=${cid}`), g === 'bughunt');
  });
});
function coursePicker(title, cb, bugsOnly) {
  const opts = [['all', '🌐', 'Everything I\'ve reached', bugsOnly ? allQs(['bug']).length : allQs(['quiz', 'trace']).length], ['mine', '🎒', 'My courses', null], ...COURSES.map(c => [c.id, c.emoji, c.title, bugsOnly ? courseQs(c.id, ['bug']).length : courseQs(c.id, ['quiz', 'trace']).length])];
  const m = modal(`<h3>${esc(title)}: pick a topic</h3><p class="muted"><small>🔒 Only lessons you've reached are used, so you won't see things you haven't learned yet.</small></p><div class="stack" style="margin-top:14px">${opts.filter(([id, , , k]) => k == null || k > 0).map(([id, e, n, k]) => `<button class="btn" style="width:100%;justify-content:space-between" data-c="${id}"><span>${e} ${esc(n)}</span>${k != null ? `<small class="muted">${k} Qs</small>` : ''}</button>`).join('')}</div>`);
  $$('[data-c]', m).forEach(b => b.onclick = () => { closeModal(); cb(b.dataset.c); });
}
function poolFor(cid, types) {
  if (cid === 'all') return scopeQs(allQs(types));
  if (cid === 'mine' || cid === 'year') return scopeQs(myCourseIds().flatMap(id => courseQs(id, types)));
  return scopeQs(courseQs(cid, types));
}
function bossPicker() {
  const m = modal(`<h3>👹 Choose a boss</h3><div class="stack" style="margin-top:12px">${COURSES.map(c => `<div><b>${c.emoji} ${esc(c.title)}</b><div class="row" style="margin-top:6px">${c.units.map(u => !isReached(u.id) ? `<span class="pill" style="opacity:.5" title="Reach this module first">🔒 ${esc((BOSSES[u.id] || ['Guardian'])[0])}</span>` : `<a class="pill ${S.units[u.id]?.boss ? 'accent' : ''}" href="#/boss/${u.id}">${(BOSSES[u.id] || ['', '🛡️'])[1]} ${esc((BOSSES[u.id] || ['Guardian'])[0])}${S.units[u.id]?.boss ? ' ✓' : ''}</a>`).join('')}</div></div>`).join('')}</div>`, { wide: true });
  $$('a', m).forEach(a => a.addEventListener('click', () => closeModal()));
}

route('/bughunt', (view, p) => {
  const pool = shuffle(poolFor(p.course || 'all', ['bug']));
  if (!pool.length) { view.innerHTML = lockedNote('a course with code challenges'); return; }
  if (EVENT.bugBonus) toast('🐛 Bug Bash week', 'Bug Hunt XP is doubled!');
  runQuiz(view, {
    title: 'Bug Hunt', questions: pool.slice(0, 8), mode: 'bughunt', lives: 3, timeLimit: 120, explain: true, back: '/arcade',
    scoreFn: (q, ok, ms) => ok ? 100 + Math.max(0, 60 - Math.floor(ms / 500)) : 0,
    xpPer: () => EVENT.bugBonus ? 40 : 20,
    onFinish: (st) => {
      const best = st.score > (S.stats.bugBest || 0); if (best) S.stats.bugBest = st.score;
      if (S.stats.bugs >= 10) award('bug10'); save();
      showResult(view, st, { title: 'Bug Hunt', resultBig: st.score, resultSub: `${st.correct} bug${st.correct === 1 ? '' : 's'} squashed${st.reason === 'time' ? ' · time ran out' : st.reason === 'lives' ? ' · out of hearts' : ''}${best ? ' · 🎉 new best!' : ''}`, back: '/arcade', backLabel: 'Back to arcade', again: () => render() });
    },
  });
});

route('/speed', (view, p) => {
  const base = poolFor(p.course || 'all', ['quiz', 'trace']);
  if (!base.length) { view.innerHTML = lockedNote(); return; }
  runQuiz(view, {
    title: 'Speed Round', questions: shuffle(base), endless: true, more: () => shuffle(base), mode: 'speed', timeLimit: 60, timePenalty: 3, explain: false, back: '/arcade', confirmQuit: false,
    scoreFn: (q, ok, ms, st) => ok ? Math.round(10 * (st.combo >= 10 ? 3 : st.combo >= 5 ? 2 : st.combo >= 3 ? 1.5 : 1)) : 0,
    xpPer: () => 5,
    onFinish: (st) => {
      const best = st.score > (S.stats.speedBest || 0); if (best) S.stats.speedBest = st.score;
      if (st.correct >= 15) award('speed15'); save();
      showResult(view, st, { title: 'Speed Round', resultBig: st.score, resultSub: `${st.correct} correct · ${st.wrong} wrong · best combo ${st.maxCombo}${best ? ' · 🎉 new best!' : ''}`, back: '/arcade', backLabel: 'Back to arcade', again: () => render() });
    },
  });
});

/* ---------- Duels ---------- */
const BOTS = { easy: { n: 'ByteBot Jr.', a: '🤖', acc: .55, t: [5, 11] }, normal: { n: 'ByteBot', a: '🤖', acc: .72, t: [4, 9] }, hard: { n: 'ByteBot Prime', a: '🦾', acc: .88, t: [3, 7] } };
const duelPoints = (ok, ms) => ok ? 100 + Math.max(0, 50 - Math.floor(ms / 400)) : 0;
route('/duel', (view, p) => {
  const sq = squadState();
  view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">// 1v1 duel</span><h1 style="font-size:2.2rem">⚔️ Duel</h1><p class="muted">Both players get the same 7 questions. A correct answer is worth 100 points, plus up to 50 bonus points for speed.</p>
    <div class="card"><h3>Pick your arena</h3><label class="field"><span>Topic</span><select class="input" id="d-course"><option value="mine">🎒 My courses</option><option value="all">🌐 All courses</option>${COURSES.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.title)}</option>`).join('')}</select></label></div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>🤖 vs ByteBot</h3><p class="muted">Practice offline against a bot. It works even when the squad server is blocked.</p><div class="row">${Object.entries(BOTS).map(([k, b]) => `<button class="btn ${k === 'normal' ? 'primary' : ''}" data-bot="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div></div>
      <div class="card"><h3>👥 vs a squadmate (live)</h3>${sq.inSquad ? `<p class="muted">Create a duel, and anyone in your squad can join it from the Squad page.</p><button class="btn primary" id="d-live">Create live duel</button> <a class="btn" href="#/squad?tab=duels">Join a duel</a>` : `<p class="muted">Join a squad to duel your friends in real time.</p><a class="btn" href="#/squad">Set up a squad</a>`}</div>
    </div></div>`;
  $$('[data-bot]', view).forEach(b => b.onclick = () => go(`/duel/bot?level=${b.dataset.bot}&course=${$('#d-course', view).value}`));
  $('#d-live', view)?.addEventListener('click', () => createLiveDuel($('#d-course', view).value));
});
route('/duel/bot', (view, p) => {
  const bot = BOTS[p.level] || BOTS.normal;
  const qs = shuffle(poolFor(p.course || 'mine', ['quiz', 'trace'])).slice(0, 7);
  if (!qs.length) { view.innerHTML = lockedNote(); return; }
  const bs = { score: 0, idx: 0, last: '' }; let bt = null;
  const extra = st => `<div class="duel-vs"><div class="side-p">${avatarHtml(S.profile, 'sm')}<div style="min-width:0"><div class="nm">${esc(S.profile.name || 'You')}</div><div class="pts">${st.score} pts</div></div></div><span class="vs">VS</span><div class="side-p"><span class="avatar sm" style="border-color:var(--accent2)">${bot.a}</span><div style="min-width:0"><div class="nm">${bot.n}</div><div class="pts" id="bot-pts">${bs.score} pts ${bs.last}</div></div></div></div>`;
  const resolveBot = () => { clearTimeout(bt); if (bs.pending == null) return; const ok = Math.random() < bot.acc; bs.score += duelPoints(ok, bs.pending); bs.last = ok ? '✓' : '✗'; bs.pending = null; updateBot(); };
  const updateBot = () => { const el = $('#bot-pts', view); if (el) el.textContent = `${bs.score} pts ${bs.last}`; };
  runQuiz(view, {
    title: `Duel vs ${bot.n}`, questions: qs, mode: 'duel', back: '/duel', extra, scoreFn: (q, ok, ms) => duelPoints(ok, ms), xpPer: () => 10,
    onShow: (st, q) => { resolveBot(); bs.last = '· thinking…'; updateBot(); const t = (bot.t[0] + Math.random() * (bot.t[1] - bot.t[0])) * 1000; bs.pending = t; bt = setTimeout(resolveBot, t); },
    onAnswer: () => { },
    onAbort: () => clearTimeout(bt),
    onFinish: (st) => {
      resolveBot(); // finish the bot's last question if still pending
      const win = st.score > bs.score, tie = st.score === bs.score;
      S.stats.duelsPlayed++; if (win) { S.stats.duelsWon++; st.xp += 50; award('duel-win'); } save();
      showResult(view, st, { title: `Duel vs ${bot.n}`, resultBig: win ? '🏆' : tie ? '🤝' : '🤖', resultSub: `You ${st.score} · ${bot.n} ${bs.score} · ${win ? 'Victory!' : tie ? "It's a tie!" : `${bot.n} wins this time.`}`, back: '/duel', backLabel: 'Back', again: () => render() });
    },
  });
});

/* ---------- Weekly challenge ---------- */
route('/weekly', (view) => {
  let pool = scopeQs(EVENT.units.flatMap(u => unitQs(u)));
  const fromEvent = pool.length >= 5;
  if (!fromEvent) pool = scopeQs(allQs(['quiz', 'trace', 'bug', 'fill']));
  const qs = shuffle(pool, seeded(EVENT.week)).slice(0, 10);
  if (!qs.length) { view.innerHTML = lockedNote(); return; }
  const mine = S.weekly[EVENT.week];
  const sq = squadState();
  view.innerHTML = `<div class="wrap narrow"><div class="card" style="text-align:center"><div style="font-size:4rem">${EVENT.emoji}</div><span class="eyebrow">Weekly challenge · ${esc(EVENT.week)}</span><h1 style="font-size:2rem">${esc(EVENT.name)}</h1>
    ${fromEvent ? '' : `<p class="notice" style="text-align:left"><small>🔒 You haven't reached this week's event modules yet, so your challenge uses lessons you have reached instead.</small></p>`}
    <p class="muted">Everyone gets the same 10 questions this week. Correct answers score 100 points, plus up to 50 for speed. Your best score counts${sq.inSquad ? ' on the squad weekly leaderboard' : ''}.</p>
    <div class="row" style="justify-content:center"><span class="pill">10 questions</span><span class="pill accent">2× XP</span>${mine ? `<span class="pill">Your best: ${mine.best}</span>` : ''}<span class="pill">${daysLeftInWeek()} day${daysLeftInWeek() === 1 ? '' : 's'} left</span></div>
    <div class="row" style="justify-content:center;margin-top:20px"><button class="btn primary lg" id="w-go">${mine ? 'Try again' : 'Start'} →</button>${sq.inSquad ? '<a class="btn lg" href="#/squad?tab=weekly">Squad scores</a>' : ''}</div></div></div>`;
  $('#w-go', view).onclick = () => runQuiz(view, {
    title: `Weekly: ${EVENT.name}`, questions: qs, mode: 'weekly', seed: EVENT.week, back: '/arcade', scoreFn: (q, ok, ms) => duelPoints(ok, ms),
    onFinish: (st) => {
      const prev = S.weekly[EVENT.week]?.best || 0, best = Math.max(prev, st.score);
      S.weekly[EVENT.week] = { best, at: Date.now() }; save(); award('weekly');
      if (st.score > prev) submitWeekly(st.score, st.correct);
      showResult(view, st, { title: `Weekly: ${EVENT.name}`, resultBig: st.score, resultSub: `${st.correct}/10 correct${st.score > prev && prev ? ' · 🎉 new personal best!' : ''}`, back: '/arcade', backLabel: 'Back to arcade', again: () => render() });
    },
  });
});
