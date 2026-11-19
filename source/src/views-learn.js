/* ================= Views: home, courses, lessons, practice, notes ================= */
function courseCard(c) {
  const p = courseProgress(c);
  return `<article class="card hover course-card" style="--cc:${c.color}">
    <div class="spread"><span class="emoji">${c.emoji}</span><span class="row" style="gap:6px">${takingCourse(c.id) ? '<span class="pill accent">✓ Taking</span>' : ''}<span class="pill">${esc(c.yearLabel)}</span></span></div>
    <div><h3>${esc(c.title)}</h3><small class="muted">${esc(c.short)}</small></div>
    <div class="meta"><span class="pill">${c.units.length} units</span><span class="pill">${lessonCount(c)} lessons</span><span class="pill">${c.units.reduce((n, u) => n + u.ex.length + u.fill.length, 0)} exercises</span><span class="pill">~${Math.round(courseMins(c) / 60 * 10) / 10} hrs</span></div>
    <ol>${c.units.slice(0, 4).map(u => `<li>${esc(u.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, ''))}</li>`).join('')}</ol>
    ${p > 0 ? `<div class="bar" title="${Math.round(p * 100)}% complete"><i style="width:${p * 100}%"></i></div>` : ''}
    <div class="foot">${p > 0 || S.start[c.id] ? `<a class="btn primary sm" href="${(nextInCourse(c)?.it.href) || '#/course/' + c.id}">Continue →</a>` : `<button class="btn primary sm" onclick="startPicker('${c.id}')">Start →</button>`}<a href="#/course/${c.id}" class="mono" style="font-size:.85rem">All ${c.units.length} units</a></div>
  </article>`;
}
const YEARS = [[1, 'Freshman'], [2, 'Sophomore'], [3, 'Junior'], [4, 'Senior']];

route('/', (view) => {
  const ct = continueTarget();
  const goal = S.settings.dailyGoal, todayXp = S.days[today()] || 0;
  const lessonsDone = Object.keys(S.lessons).length, bosses = Object.values(S.units).filter(u => u.boss).length;
  const contHref = ct.href, contLabel = ct.label;
  const nextDue = typeof dueList === 'function' ? dueList().find(x => !x.done) : null;
  const sq = squadState();
  view.innerHTML = `
  <div class="wrap">
    <section class="hero grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:center;gap:40px">
      <div>
        <span class="eyebrow">$ compcistudy --years 9-12</span>
        <h1>${S.profile.name ? `Hey ${esc(S.profile.name)}.<br>` : ''}Computer science, <span class="hl">all four years.</span></h1>
        <p class="lead">Notes, practice quizzes, code challenges and arcade games for Intro Python, Web Dev, AP CSP, AP CSA, Cybersecurity and Data Structures. Study solo or battle your squad.</p>
        <div class="cta">${ct.fresh ? `<button class="btn primary lg" onclick="startPicker('${ct.c.id}')">▶ Start ${esc(ct.c.title)}</button>` : `<a class="btn primary lg" href="${contHref}">▶ Continue</a>`}<a class="btn lg" href="#/courses">See the courses</a></div>
        <div class="stats">
          <div class="stat"><b>${fmtNum(S.xp)}</b><span>XP earned</span></div>
          <div class="stat"><b>${streakAlive()}🔥</b><span>day streak</span></div>
          <div class="stat"><b>${lessonsDone}</b><span>lessons finished</span></div>
          <div class="stat"><b>${bosses}</b><span>bosses beaten</span></div>
        </div>
      </div>
      <div class="term" aria-label="Today's progress">
        <div class="tbar"><i></i><i></i><i></i><span>${esc((S.profile.name || 'student').toLowerCase().replace(/\s+/g, ''))}@compci:~</span></div>
        <div class="tbody"><span class="prompt">$</span> today --goal
Daily goal: ${Math.min(todayXp, goal)}/${goal} XP ${todayXp >= goal ? '✓ done!' : ''}
[${'█'.repeat(Math.round(Math.min(1, todayXp / goal) * 20))}${'░'.repeat(20 - Math.round(Math.min(1, todayXp / goal) * 20))}]

<span class="prompt">$</span> next
→ ${esc(ct.c.short)}: ${esc(contLabel)}

<span class="prompt">$</span> mistakes --count
${S.mistakes.length} question${S.mistakes.length === 1 ? '' : 's'} to review

<span class="prompt">$</span> event --this-week
${EVENT.emoji} ${esc(EVENT.name)} (2× XP)

<span class="prompt">$</span> <span class="cursor"></span></div>
      </div>
    </section>

    <section class="section">
      <div class="grid g3">
        <a class="card hover search-hit" href="${contHref}"><span class="eyebrow">Continue</span><h3>${esc(contLabel)}</h3><small class="muted">${esc(ct.c.title)} · ${esc(ct.u.title)}</small><div class="bar" style="margin-top:12px"><i style="width:${unitProgress(ct.u) * 100}%"></i></div></a>
        <a class="card hover search-hit" href="#/quiz?mode=review"><span class="eyebrow">Review</span><h3>${S.mistakes.length ? `${S.mistakes.length} mistakes to fix` : 'No mistakes saved yet'}</h3><small class="muted">${S.mistakes.length ? 'Questions you missed come back here until you get them right.' : 'Miss a question and it shows up here, so you can retry it later.'}</small></a>
        <a class="card hover search-hit" href="#/assignments"><span class="eyebrow">Assignments</span>${nextDue ? `<h3>${nextDue.icon} ${esc(nextDue.title)}</h3><small class="${nextDue.overdue ? '' : 'muted'}" style="${nextDue.overdue ? 'color:var(--bad)' : ''}">${esc(nextDue.dueText)} · ${esc(nextDue.from)}</small>` : `<h3>Nothing due 🎉</h3><small class="muted">Your squad leader's assignments and your own study plan show up here.</small>`}</a>
      </div>
    </section>

    <section class="section" id="courses">
      <div class="section-head"><div><span class="eyebrow">// pick a course</span><h2>${(S.profile.courses || []).length ? 'Your CS classes' : 'Every CS class, freshman to senior'}</h2></div><a href="#/courses" class="btn sm">All courses</a></div>
      ${(S.profile.courses || []).length ? `<div class="year-label">Your courses</div><div class="grid g3">${myCourseIds().map(id => courseCard(COURSE[id])).join('')}</div>` : ''}
      ${(() => { const rest = COURSES.filter(c => !takingCourse(c.id)); return rest.length ? `<div class="year-label">${(S.profile.courses || []).length ? 'More courses' : 'All courses'}</div><div class="grid g3">${rest.map(courseCard).join('')}</div>` : ''; })()}
      <p class="muted" style="margin-top:14px"><small>Taking a different class this year? <a href="#/profile?edit=1">Change your courses</a></small></p>
    </section>

    <section class="section event">
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:center">
        <div><span class="eyebrow">// weekly event · ${esc(EVENT.week)}</span><div class="big">${EVENT.emoji}</div><h2>${esc(EVENT.name)}</h2><p class="muted">${esc(EVENT.blurb)} The event changes every Monday.</p>
          <div class="row"><a class="btn primary" href="#/weekly">Play the weekly challenge</a><a class="btn" href="#/arcade">Open the arcade</a></div></div>
        <div class="stats">
          <div class="stat"><b>2×</b><span>XP on event units</span></div>
          <div class="stat"><b>${EVENT.units.length}</b><span>units included</span></div>
          <div class="stat"><b>${S.weekly[EVENT.week]?.best ?? '-'}</b><span>your best score</span></div>
          <div class="stat"><b>${daysLeftInWeek()}</b><span>day${daysLeftInWeek() === 1 ? '' : 's'} left</span></div>
        </div>
      </div>
      <div class="row" style="margin-top:16px">${EVENT.units.map(u => UNIT[u] ? `<a class="pill" href="#/learn/${u}/0">${COURSE[UNIT[u].course].emoji} ${esc(UNIT[u].title)}</a>` : '').join('')}</div>
    </section>

    <section class="section">
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">
        <div class="card"><span class="eyebrow">// squad</span>${sq.inSquad ? `<h3>${esc(sq.name || 'Your squad')}</h3><div id="home-lb"><p class="muted">Loading leaderboard…</p></div><a class="btn sm" href="#/squad">Open squad →</a>` : `<h3>Study with your friends</h3><p class="muted">Create a squad, share the code, and see a live leaderboard. You can also duel friends 1v1 and build a shared question bank.</p><a class="btn primary sm" href="#/squad">Set up a squad</a>`}</div>
        <div class="card"><span class="eyebrow">// what it costs</span><h2 style="font-size:3rem;margin:0">$0</h2><p class="muted">No ads and no subscriptions. You don't need an email, just a username. Your progress is saved in this browser.</p></div>
      </div>
    </section>

    <section class="section" style="text-align:center">
      <div class="term" style="max-width:640px;margin:0 auto 24px;text-align:left"><div class="tbar"><i></i><i></i><i></i><span>~/compci</span></div><div class="tbody"><span class="prompt">$</span> ./study.sh
Your terminal is waiting. <span class="cursor"></span></div></div>
      <div class="row" style="justify-content:center"><a class="btn primary lg" href="${contHref}">Start studying</a><a class="btn lg" href="#/arcade">Play a game</a></div>
    </section>
  </div>${footer()}`;
  if (sq.inSquad) homeLeaderboard($('#home-lb', view));
});
function daysLeftInWeek() { const d = new Date().getDay(); return d === 0 ? 1 : 8 - d; }

route('/courses', (view, p) => {
  const y = p.year === 'mine' ? 'mine' : (+p.year || 0);
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// courses</span><h1 style="font-size:2.2rem">Courses</h1><p class="muted">Pick any course. Your progress in each one is saved.</p>
    <div class="tabs" role="tablist">${[[0, 'All'], ...((S.profile.courses || []).length ? [['mine', 'My courses']] : []), ...YEARS].map(([v, l]) => `<button role="tab" class="${y === v ? 'on' : ''}" onclick="go('/courses${v ? '?year=' + v : ''}')">${l}</button>`).join('')}</div>
    <div class="grid g3">${COURSES.filter(c => !y || (y === 'mine' ? takingCourse(c.id) : false) || c.year === y || (c.id === 'web' && y === 2) || (c.id === 'cyber' && y === 4)).map(courseCard).join('')}</div></div>${footer()}`;
});

route('/course/:id', (view, p) => {
  const c = COURSE[p.id]; if (!c) return;
  view.innerHTML = `<div class="wrap">
    <div class="crumb"><a href="#/courses">Courses</a> / ${esc(c.title)}</div>
    <div class="spread" style="align-items:flex-start"><div><span style="font-size:3rem">${c.emoji}</span><h1 style="font-size:2.3rem">${esc(c.title)}</h1><p class="muted" style="max-width:640px">${esc(c.blurb)}</p>
      <div class="row"><span class="pill">${esc(c.yearLabel)}</span><span class="pill">${c.units.length} units</span><span class="pill">${lessonCount(c)} lessons</span><span class="pill">${courseQs(c.id).length} practice questions</span></div></div>
      <div class="card" style="min-width:240px"><b>${Math.round(courseProgress(c) * 100)}% complete</b><div class="bar" style="margin:10px 0 14px"><i style="width:${courseProgress(c) * 100}%"></i></div><div class="stack">${courseProgress(c) > 0 || S.start[c.id] ? `<a class="btn primary" style="width:100%" href="${nextInCourse(c)?.it.href || '#/learn/' + c.units[0].id + '/0'}">Continue →</a>` : `<button class="btn primary" style="width:100%" onclick="startPicker('${c.id}')">Start course →</button>`}<a class="btn" style="width:100%" href="#/quiz?mode=practice&course=${c.id}&n=10">Quick quiz (10)</a>${c.id === 'csa' ? `<a class="btn" style="width:100%" href="#/exam">📝 Practice exams</a><a class="btn" style="width:100%" href="#/frq">✍️ FRQ practice</a>` : ''}<a class="btn ghost" style="width:100%" href="#/cheatsheet/${c.id}">🖨 Course cheat sheet</a></div></div>
    </div>
    <div class="stack" style="margin-top:30px">${c.units.map((u, ui) => {
      const boss = S.units[u.id]?.boss, nc = u.trace.length + u.bug.length + u.fill.length, isStart = S.start[c.id] === u.id;
      return `<div class="card" id="unit-${u.id}"><div class="spread"><div><span class="pill">Module ${ui + 1}</span>${u.weight ? ` <span class="pill accent" title="AP exam weighting">AP exam ${esc(u.weight)}</span>` : ''}${isStart ? ' <span class="pill accent">Your starting unit</span>' : ''}<h3 style="margin-top:8px">${esc(u.title)}</h3></div><div class="row"><span class="mono muted">${Math.round(unitProgress(u) * 100)}%</span><button class="btn sm" onclick="startAt('${c.id}','${u.id}')">${isStart ? '▶ Go' : 'Start here'}</button><button class="btn sm ghost" onclick="assignPicker({course:'${c.id}',unit:'${u.id}'})" title="Assign">📌 Assign</button></div></div>
        <ul style="list-style:none;padding:0;margin:12px 0">${unitItems(u).map(it => `<li style="margin:6px 0"><a href="${it.href}" class="row" style="text-decoration:none;color:var(--fg);gap:10px;flex-wrap:nowrap"><span class="chk ${itemDoneAt(it) ? 'done' : ''}">${itemDoneAt(it) ? '✓' : ''}</span><span>${it.icon}</span><span style="flex:1">${esc(it.title)}</span><small class="muted">${it.mins} min</small></a></li>`).join('')}</ul>
        <div class="row"><a class="btn sm" href="#/quiz?mode=unit&units=${u.id}&types=quiz">📝 Unit quiz (${u.quiz.length})${S.units[u.id]?.quizBest != null ? ' · best ' + Math.round(S.units[u.id].quizBest * 100) + '%' : ''}</a>${nc ? `<a class="btn sm" href="#/quiz?mode=unit&units=${u.id}&types=trace,bug,fill">🐛 Code challenges (${nc})</a>` : ''}${S.settings.bosses ? `<a class="btn sm ghost" href="#/boss/${u.id}">${boss ? '🏆 Boss beaten · rematch' : '👹 Boss battle (optional)'}</a>` : ''}<a class="btn sm ghost" href="#/cheatsheet/${u.id}">🖨 Cheat sheet</a></div></div>`;
    }).join('')}</div></div>${footer()}`;
});

/* ---------- Practice hub ---------- */
route('/practice', (view, p) => {
  const myCourses = COURSES;
  const sb = squadBankQs();
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// practice</span><h1 style="font-size:2.2rem">Practice</h1><p class="muted">Quizzes like the real exams, with an explanation for every answer.</p>
    <div class="grid g4" style="margin:22px 0 34px">
      <a class="card hover search-hit" href="#/quiz?mode=review"><div style="font-size:2rem">🔄</div><h3>Review mistakes</h3><small class="muted">${S.mistakes.length} saved. Answer one correctly to clear it.</small></a>
      <a class="card hover search-hit" href="#/quiz?mode=practice&daily=1&n=10"><div style="font-size:2rem">🎲</div><h3>Daily mix</h3><small class="muted">10 questions from the courses you're taking.</small></a>
      <a class="card hover search-hit" href="#/exam"><div style="font-size:2rem">📝</div><h3>AP CSA practice exams</h3><small class="muted">Timed full exams (42 MCQ + 4 FRQs), mini exams, unit tests and optional FRQ practice.</small></a>
      <a class="card hover search-hit" href="#/quiz?mode=topic&topic=if&n=15"><div style="font-size:2rem">🔀</div><h3>If statements (all courses)</h3><small class="muted">if, else, elif, booleans, and/or/not, switch and ternaries in Python, Java, JavaScript and AP pseudocode.</small></a>
      <a class="card hover search-hit" href="#/quiz?mode=squad"><div style="font-size:2rem">👥</div><h3>Squad question bank</h3><small class="muted">${sb.length ? sb.length + ' questions written by your squad' : 'Questions your squad writes show up here'}</small></a>
    </div>
    <div class="card"><h3>Build a practice set</h3>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">
        <label class="field"><span>Course</span><select class="input" id="p-course">${myCourses.map(c => `<option value="${c.id}" ${c.id === (p.course || continueTarget().c.id) ? 'selected' : ''}>${c.emoji} ${esc(c.title)}${takingCourse(c.id) ? ' ✓' : ''}</option>`).join('')}</select></label>
        <label class="field"><span>Question type</span><select class="input" id="p-types"><option value="quiz,trace,bug">Mixed</option><option value="quiz">Multiple choice</option><option value="trace,bug">Code challenges (trace + bug)</option><option value="trace">Trace the code</option><option value="bug">Find the bug</option></select></label>
        <label class="field"><span>How many</span><select class="input" id="p-n"><option>5</option><option selected>10</option><option>20</option><option value="999">All</option></select></label>
      </div>
      <div class="field"><span style="display:block;font-weight:600;margin-bottom:6px">Units</span><div class="row" id="p-units"></div></div>
      <label class="toggle" style="border:0"><span>Include squad-written questions</span><span class="switch"><input type="checkbox" id="p-sq" ${S.settings.squadQs ? 'checked' : ''}><span></span></span></label>
      <div class="row" style="justify-content:flex-end"><button class="btn primary lg" id="p-go">Start practice →</button></div>
    </div></div>${footer()}`;
  const units = () => { const c = COURSE[$('#p-course', view).value]; $('#p-units', view).innerHTML = c.units.map((u, i) => isReached(u.id) ? `<label class="pill" style="cursor:pointer;padding:6px 12px"><input type="checkbox" value="${u.id}" checked> ${esc(u.title)}</label>` : `<span class="pill" style="opacity:.5;padding:6px 12px" title="Reach this module first">🔒 ${esc(u.title)}</span>`).join('') + `<small class="muted" style="flex-basis:100%">🔒 Practice only uses modules you've reached. Start or continue a course to unlock more.</small>`; };
  units(); $('#p-course', view).onchange = units;
  $('#p-sq', view).onchange = e => { S.settings.squadQs = e.target.checked; save(); };
  $('#p-go', view).onclick = () => {
    const us = $$('#p-units input:checked', view).map(i => i.value);
    if (!us.length) return toast('Pick at least one unit');
    go(`/quiz?mode=practice&units=${us.join(',')}&types=${$('#p-types', view).value}&n=${$('#p-n', view).value}`);
  };
});

route('/quiz', (view, p) => {
  const types = (p.types || 'quiz,trace,bug').split(',');
  let pool = [], title = 'Practice', back = '/practice';
  if (p.mode === 'review') { pool = S.mistakes.map(id => Q[id] || squadQ(id)).filter(Boolean); title = 'Mistake review'; if (!pool.length) { view.innerHTML = `<div class="wrap empty"><span class="big">🎉</span><h2>No mistakes to review</h2><p>Questions you miss will show up here so you can try them again.</p><a class="btn primary" href="#/practice">Practice something</a></div>`; return; } }
  else if (p.mode === 'squad') { pool = squadBankQs(); title = 'Squad question bank'; if (!pool.length) { view.innerHTML = `<div class="wrap empty"><span class="big">✍️</span><h2>The squad bank is empty</h2><p>Join a squad and write questions for each other in the Squad tab.</p><a class="btn primary" href="#/squad">Go to Squad</a></div>`; return; } }
  else if (p.mode === 'topic' && p.topic === 'if') {
    const core = ['py2', 'csa2'], re = /\bif\b|\belif\b|\belse\b|\bIF\b|\bELSE\b|boolean|\band\b|\bor\b|\bnot\b|&&|\|\||switch|ternary|condition|truthy|falsy|De Morgan|short-circuit/i;
    pool = allQs(['quiz', 'trace', 'bug', 'fill']).filter(q => core.includes(q.unit) || (['web3', 'csp3', 'csp1', 'py3'].includes(q.unit) && re.test(q.q + ' ' + (q.code || '') + ' ' + (q.why || ''))));
    title = 'If statements: all courses';
  }
  else if (p.daily) { const rnd = seeded(today() + S.profile.name); const cs = myCourseIds(); pool = shuffle([...allQs(types).filter(q => cs.includes(q.course)), ...EVENT.units.flatMap(u => unitQs(u)).filter(q => cs.includes(q.course))], rnd); title = 'Daily mix'; }
  else if (p.units) { pool = p.units.split(',').flatMap(u => unitQs(u, types)); title = p.mode === 'unit' ? `${UNIT[p.units]?.title || 'Unit'} · ${types.includes('quiz') ? 'Quiz' : 'Code challenges'}` : 'Practice set'; if (p.mode === 'unit') back = `/course/${UNIT[p.units]?.course}`; }
  else if (p.course) { pool = courseQs(p.course, types); title = COURSE[p.course]?.title + ' quiz'; back = `/course/${p.course}`; }
  else pool = allQs(types);
  // games & practice only use modules you've reached (module quizzes and your own mistakes are exempt)
  const scoped = p.mode !== 'unit' && p.mode !== 'review';
  if (scoped) pool = scopeQs(pool);
  if (scoped && !pool.length) { view.innerHTML = lockedNote(p.course ? COURSE[p.course]?.title : 'any course'); return; }
  if (S.settings.squadQs && p.mode === 'practice' && p.units) pool.push(...squadBankQs().filter(q => p.units.split(',').includes(q.unit)));
  const n = +p.n || (p.mode === 'unit' ? 999 : 10);
  if (p.mode === 'unit' && p.n) back = `/learn/${p.units}/0`;
  const qs = shuffle([...new Map(pool.map(q => [q.id, q])).values()]).slice(0, n);
  const unitMode = p.mode === 'unit' && UNIT[p.units];
  runQuiz(view, { title, questions: qs, mode: p.mode || 'practice', back, backLabel: 'Back', again: () => render(),
    onFinish: unitMode ? (st) => {
      const pct = st.results.length ? st.correct / st.results.length : 0, rec = S.units[p.units] = S.units[p.units] || {};
      const kind = types.includes('quiz') ? 'quiz' : 'code';
      if (!p.n || +p.n >= 999) { rec[kind + 'Best'] = Math.max(rec[kind + 'Best'] || 0, pct); if (pct >= 0.7 && !rec[kind + 'At']) rec[kind + 'At'] = Date.now(); save(); squadSync(); }
      showResult(view, st, { title, mode: 'unit', back, backLabel: 'Back to course', again: () => render() }, pct >= 0.7 || p.n ? '' : `<p class="muted">Score 70% or higher to count this ${kind === 'quiz' ? 'quiz' : 'challenge set'} as complete.</p>`);
    } : null });
});

/* ---------- Boss battles ---------- */
const BOSSES = { py1: ['Type Error Troll', '👺'], py2: ['The Elif Hydra', '🐉'], py3: ['The Infinite Loop', '🌀'], py4: ['None the Nameless', '👻'], py5: ['Index Out-of-Range-r', '🦂'],
  web1: ['Div Soup Demon', '🍲'], web2: ['Specificity Specter', '👻'], web3: ['Coercion Chimera', '🦎'], web4: ['The XSS Phantom', '🕷️'],
  csp1: ['Logic Error Lich', '🧟'], csp2: ['Overflow Ogre', '👹'], csp3: ['The Undecidable', '🧙'], csp4: ['Packet Loss Kraken', '🐙'], csp5: ['Phish King', '🦈'],
  csa1: ['NullPointer Knight', '🤺'], csa2: ['Off-By-One Golem', '🗿'], csa3: ['Shadow Variable', '🥷'], csa4: ['StackOverflow Titan', '🦖'],
  cy1: ['Worm Queen', '🪱'], cy2: ['Rainbow Table Wraith', '🌈'], cy3: ['Caesar\'s Ghost', '🏛️'], cy4: ['SQL Injector', '💉'],
  ds1: ['Big-O Behemoth', '🦣'], ds2: ['Dangling Pointer', '🪝'], ds3: ['Unbalanced Tree Ent', '🌳'], ds4: ['Quicksort Worst Case', '🐌'] };
route('/boss/:uid', (view, p) => {
  const u = UNIT[p.uid]; if (!u) return;
  const [name, face] = BOSSES[u.id] || ['Unit Guardian', '🛡️'];
  if (!isReached(u.id)) { view.innerHTML = `<div class="wrap narrow"><div class="card empty"><span class="big">🔒</span><h2>${esc((BOSSES[u.id] || ['This boss'])[0])} is locked</h2><p>Reach <b>${esc(u.title)}</b> first. Boss battles only use lessons you've already learned.</p><button class="btn primary" onclick="startAt('${u.course}','${u.id}')">Start this module</button></div></div>`; return; }
  const pool = shuffle(unitQs(u.id));
  const need = Math.min(8, Math.max(4, pool.length - 3));
  const beaten = S.units[u.id]?.boss;
  view.innerHTML = `<div class="wrap narrow"><div class="card" style="text-align:center">
    <div style="font-size:5rem;line-height:1">${face}</div><span class="eyebrow">Boss battle · ${esc(COURSE[u.course].short)}</span><h1 style="font-size:2rem">${esc(name)}</h1>
    <p class="muted">Guardian of <b>${esc(u.title)}</b>. Land <b>${need}</b> correct answers to drain its HP. You have <b>3 hearts</b>, and every wrong answer costs one.</p>
    <div class="row" style="justify-content:center"><span class="pill">${pool.length} questions in the deck</span><span class="pill accent">Win: +150 XP</span>${beaten ? '<span class="pill">🏆 already beaten</span>' : ''}</div>
    <div class="row" style="justify-content:center;margin-top:20px"><button class="btn primary lg" id="fight">⚔️ Fight!</button><a class="btn lg" href="#/learn/${u.id}/0">Study first</a></div></div></div>`;
  $('#fight', view).onclick = () => runQuiz(view, {
    title: `Boss: ${name}`, questions: pool, mode: 'boss', lives: 3, boss: { name, face, dmg: 100 / need }, back: `/course/${u.course}`,
    onFinish: (st) => {
      const win = st.reason === 'win';
      if (win) {
        const first = !S.units[u.id]?.boss;
        S.units[u.id] = { ...(S.units[u.id] || {}), boss: S.units[u.id]?.boss || Date.now() };
        S.stats.bossWins++; save();
        st.xp += first ? 150 : 40;
        award('boss1');
        if (Object.values(S.units).filter(x => x.boss).length >= 5) award('boss5');
        if (COURSE[u.course].units.every(x => S.units[x.id]?.boss)) award('course-master');
      }
      showResult(view, st, { title: win ? `${name} defeated!` : `${name} wins this round`, resultBig: win ? '🏆' : '💀', resultSub: win ? `You beat the boss with ${st.lives} heart${st.lives === 1 ? '' : 's'} left.` : `You got ${st.correct} hits in. Study the unit and try again!`, back: `/course/${u.course}`, backLabel: 'Back to course', again: () => render() });
    },
  });
});

/* ---------- Notes & cheat sheets ---------- */
route('/notes', (view, p) => {
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// notes</span><h1 style="font-size:2.2rem">Notes & cheat sheets</h1>
    <input class="input" id="n-q" type="search" placeholder="Search all notes, like 'binary search' or 'substring'" value="${esc(p.q || '')}" aria-label="Search notes" style="font-size:1.1rem;padding:14px 16px;margin:10px 0 20px">
    <div id="n-res"></div>
    <div id="n-browse">${COURSES.map(c => `<div class="card" style="margin-bottom:14px"><div class="spread"><h3>${c.emoji} ${esc(c.title)}</h3><a class="btn sm" href="#/cheatsheet/${c.id}">🖨 Whole course</a></div>
      <div class="grid g2" style="margin-top:10px">${c.units.map(u => `<div><b>${esc(u.title)}</b> <a href="#/cheatsheet/${u.id}" style="font-size:.85rem">cheat sheet</a><ul style="margin:6px 0;padding-left:1.2em">${u.lessons.map((l, i) => `<li><a href="#/learn/${u.id}/${i}">${esc(l.title)}</a></li>`).join('')}</ul></div>`).join('')}</div></div>`).join('')}</div></div>${footer()}`;
  const inp = $('#n-q', view);
  const doSearch = () => {
    const q = inp.value.trim().toLowerCase(); const res = $('#n-res', view);
    $('#n-browse', view).classList.toggle('hidden', !!q);
    if (!q) { res.innerHTML = ''; return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const hits = [];
    for (const c of COURSES) for (const u of c.units) u.lessons.forEach((l, i) => {
      const hay = (l.title + ' ' + l.text).toLowerCase();
      if (terms.every(t => hay.includes(t))) { const idx = hay.indexOf(terms[0]); hits.push({ c, u, l, i, score: (l.title.toLowerCase().includes(q) ? 10 : 0) + terms.length, snip: l.text.slice(Math.max(0, idx - (l.title.length + 60)), idx - l.title.length + 140) }); }
    });
    hits.sort((a, b) => b.score - a.score);
    const mark = s => { let h = esc(s); for (const t of terms) h = h.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`); return h; };
    res.innerHTML = hits.length ? `<p class="muted">${hits.length} result${hits.length === 1 ? '' : 's'}</p><div class="stack">${hits.slice(0, 30).map(h => `<a class="card hover search-hit" href="#/learn/${h.u.id}/${h.i}"><small class="muted">${h.c.emoji} ${esc(h.c.title)} · ${esc(h.u.title)}</small><h3 style="margin:4px 0">${mark(h.l.title)}</h3><small>…${mark(h.snip)}…</small></a>`).join('')}</div>` : `<div class="empty"><span class="big">🔍</span>No notes match "${esc(q)}".</div>`;
  };
  inp.oninput = doSearch; doSearch(); inp.focus();
});
route('/cheatsheet/:id', (view, p) => {
  const c = COURSE[p.id], u = UNIT[p.id];
  const units = c ? c.units : u ? [u] : []; if (!units.length) return;
  const course = c || COURSE[u.course];
  view.innerHTML = `<div class="wrap narrow"><div class="spread noprint"><a href="#/course/${course.id}">← ${esc(course.title)}</a><button class="btn primary" onclick="print()">🖨 Print / Save as PDF</button></div>
    <h1 style="font-size:2rem;margin-top:16px">${course.emoji} ${esc(c ? course.title : u.title)}: cheat sheet</h1>
    ${units.map(x => `<h2 style="margin-top:28px;border-bottom:1px solid var(--border);padding-bottom:6px">${esc(x.title)}</h2>${x.lessons.map(l => `<h3 style="margin-top:18px">${esc(l.title)}</h3><div class="prose">${l.html}</div>`).join('')}`).join('')}</div>`;
});
