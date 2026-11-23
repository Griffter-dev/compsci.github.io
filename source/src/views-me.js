/* ================= Profile, settings, help, onboarding ================= */
const AVATARS = ['🦊', '🐼', '🐸', '🐙', '🦉', '🐧', '🦄', '🐲', '🐺', '🦁', '🐯', '🐨', '🐵', '🦖', '🐢', '🦈', '🐝', '🦋', '👾', '🤖', '👻', '💀', '🧙', '🥷', '🧑‍💻', '🦸', '🧠', '⚡', '🔥', '🌙', '⭐', '🍕', '🌮', '🍩', '🎮', '🎧', '🛹', '⚽', '🏀', '🎸'];
const COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#16a34a', '#65a30d', '#ca8a04', '#ea580c', '#dc2626', '#db2777', '#9333ea', '#475569', '#0f766e'];

function accountCard() {
  if (!signedIn()) return `<div class="card acct-card" style="margin-top:16px"><div class="spread"><div><b>🔐 Not signed in</b><br><small class="muted">Your progress is only saved in this browser. Sign in to save it to your account and use squads.</small></div><button class="btn primary" data-acct="in">Sign in</button></div></div>`;
  return `<div class="card acct-card" style="margin-top:16px"><div class="spread"><div><small class="muted">Signed in as</small><br><b class="mono">${esc(ACC.email)}</b> ${ACC.owner ? '<span class="pill role-owner">👑 Owner</span>' : ACC.admin ? '<span class="pill role-admin">🛡 Admin</span>' : ''}<br><small class="muted">${ACC.verified ? '✅ Email verified · progress saves to your account automatically' : '⚠️ Email not verified yet. Click the link we sent you.'}</small></div>
    <div class="row">${!ACC.verified ? '<button class="btn sm primary" data-acct="re">I verified it</button><button class="btn sm" data-acct="send">Resend email</button>' : ''}${ACC.admin ? '<a class="btn sm primary" href="#/admin">🛡 Admin panel</a>' : ''}<button class="btn sm ghost" data-acct="out">Sign out</button></div></div></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-acct]'); if (!b) return;
  const a = b.dataset.acct;
  if (a === 'in') { if (S.account?.skip) { S.account = null; save(); } showAuthGate(); }
  if (a === 'out' && confirm('Sign out? Your progress is saved to your account, and this browser will be cleared.')) authSignOut();
  if (a === 're') authRecheck().then(() => toast(ACC.verified ? 'Email verified ✅' + (ACC.owner ? ' Owner tools unlocked 👑' : '') : 'Not verified yet. Check your inbox and spam folder.'));
  if (a === 'send') authResendVerify().then(() => toast('Sent! Check your inbox.')).catch(x => toast('Could not send', authErr(x)));
});
route('/profile', (view, p) => {
  const L = levelFor(S.xp), cur = xpForLevel(L), nxt = xpForLevel(L + 1);
  const acc = S.stats.answered ? Math.round(S.stats.correct / S.stats.answered * 100) : 0;
  const days = []; for (let i = 83; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push([today(d), S.days[today(d)] || 0]); }
  view.innerHTML = `<div class="wrap">
    <div class="card"><div class="row" style="gap:20px;align-items:center">${avatarHtml(S.profile, 'lg')}<div style="flex:1;min-width:220px"><h1 style="font-size:2rem;margin:0">${esc(S.profile.name || 'Student')}</h1><div class="muted">${esc(myTitle())} · ${gradeLabel(S.profile.year)}</div>${(S.profile.courses || []).length ? `<div class="row" style="gap:6px;margin-top:8px">${S.profile.courses.filter(id => COURSE[id]).map(id => `<a class="pill" href="#/course/${id}">${COURSE[id].emoji} ${esc(COURSE[id].title)}</a>`).join('')}</div>` : ''}
      <div style="margin-top:12px"><div class="spread"><b class="mono">Level ${L}</b><small class="muted mono">${fmtNum(S.xp - cur)} / ${fmtNum(nxt - cur)} XP to L${L + 1}</small></div><div class="bar" style="height:10px;margin-top:6px"><i style="width:${(S.xp - cur) / (nxt - cur) * 100}%"></i></div></div></div>
      <button class="btn" id="edit-p">✏️ Edit profile</button></div></div>
    ${squadState().configured ? accountCard() : ''}
    <div class="grid g4" style="margin:16px 0">${[['⭐', fmtNum(S.xp), 'total XP'], ['🔥', `${streakAlive()} / ${S.streak.best}`, 'streak / best'], ['📖', Object.keys(S.lessons).length, 'lessons'], ['🎯', acc + '%', `accuracy (${fmtNum(S.stats.answered)} Qs)`], ['👹', S.stats.bossWins, 'boss wins'], ['🐞', S.stats.bugs, 'bugs found'], ['⚔️', `${S.stats.duelsWon}/${S.stats.duelsPlayed}`, 'duels won'], ['⚡', S.stats.speedBest, 'speed best']].map(([i, v, l]) => `<div class="card" style="padding:14px"><div class="stat"><b>${i} ${v}</b><span>${l}</span></div></div>`).join('')}</div>
    <div class="card" style="margin-bottom:16px"><h3>Activity · last 12 weeks</h3><div style="display:grid;grid-template-rows:repeat(7,12px);grid-auto-flow:column;grid-auto-columns:12px;gap:3px;overflow-x:auto;padding:4px 0" aria-label="Study activity heatmap">${days.map(([d, x]) => `<i title="${d}: ${x} XP" style="border-radius:3px;background:${x ? `color-mix(in srgb,var(--accent) ${Math.min(100, 25 + x / 3)}%,var(--bg3))` : 'var(--bg3)'}"></i>`).join('')}</div></div>
    <h2>Badges <small class="muted mono" style="font-size:1rem">${Object.keys(S.badges).length}/${BADGES.length}</small></h2>
    <div class="badges">${BADGES.map(b => `<div class="badge ${S.badges[b.id] ? '' : 'locked'}" title="${esc(b.d)}"><span class="bi">${b.i}</span><b>${esc(b.n)}</b><small class="muted">${esc(b.d)}</small></div>`).join('')}</div>
    <h2 style="margin-top:30px">Recent activity</h2><div class="card">${S.history.length ? `<ul class="lb">${S.history.slice(0, 15).map(h => `<li><span class="who"><b style="font-weight:600">${esc(h.why)}</b><small class="muted">${timeAgo(h.t)}</small></span><span class="val" style="color:var(--accent)">+${h.xp}</span></li>`).join('')}</ul>` : '<p class="muted">Nothing yet. Go finish a lesson!</p>'}</div></div>${footer()}`;
  $('#edit-p', view).onclick = () => profileEditor(() => render());
  if (p.edit) profileEditor(() => go('/profile'));
});

function profileEditor(done) {
  const d = { ...S.profile, courses: [...(S.profile.courses || [])] };
  const m = modal(`<h3>Edit profile</h3>
    <div class="row" style="margin-bottom:14px"><span id="pe-av">${avatarHtml(d, 'lg')}</span><div style="flex:1"><label class="field"><span>Username (shown to your squad)</span><input class="input" id="pe-name" maxlength="20" value="${esc(d.name)}" placeholder="e.g. ByteSized"></label></div></div>
    <label class="field"><span>Avatar</span><div class="emoji-grid">${AVATARS.map(a => `<button type="button" data-a="${a}" class="${a === d.avatar ? 'on' : ''}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div></label>
    <label class="field"><span>Color</span><div class="swatches">${COLORS.map(c => `<button type="button" data-c="${c}" class="${c === d.color ? 'on' : ''}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div></label>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Title</span><select class="input" id="pe-title">${unlockedTitles().map(t => `<option ${t === myTitle() ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
    <label class="field"><span>Grade</span><select class="input" id="pe-year">${GRADES.map(([y, l]) => `<option value="${y}" ${y === d.year ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <label class="field"><span>Courses you're taking</span>${courseChooser(d.courses)}</label>
    <p class="muted"><small>🔒 Use a nickname, not your full real name. Level up and earn badges to unlock more titles.</small></p>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-x>Cancel</button><button class="btn primary" id="pe-save">Save</button></div>`, { wide: true });
  const upd = () => $('#pe-av', m).innerHTML = avatarHtml(d, 'lg');
  $$('[data-a]', m).forEach(b => b.onclick = () => { d.avatar = b.dataset.a; $$('[data-a]', m).forEach(x => x.classList.toggle('on', x === b)); upd(); });
  $$('[data-c]', m).forEach(b => b.onclick = () => { d.color = b.dataset.c; $$('[data-c]', m).forEach(x => x.classList.toggle('on', x === b)); upd(); });
  wireCourseChooser(m, d.courses);
  $('[data-x]', m).onclick = closeModal;
  $('#pe-save', m).onclick = () => {
    if (!d.courses.length) return toast('Pick at least one course');
    const name = $('#pe-name', m).value.trim().slice(0, 20); if (!name) return toast('Pick a username');
    Object.assign(S.profile, d, { courses: d.courses.slice(), name, title: $('#pe-title', m).value, year: +$('#pe-year', m).value }); save(); squadSync(); closeModal(); toast('Profile saved'); done && done();
  };
}

/* ---------- Settings / customization ---------- */
route('/settings', (view) => {
  const st = S.settings, t = THEMES[st.theme] || THEMES.terminal;
  const curBg = st.bg || t.bg, curFg = st.fg || t.fg, curAc = st.accent || t.accent;
  const cr = contrast(curBg, curFg);
  view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">// settings</span><h1 style="font-size:2.2rem">Customize</h1><p class="muted">Make CompSci-Study look the way you want. Changes save automatically.</p>
    <div class="card" style="margin-top:18px"><h3>🎨 Theme</h3><div class="theme-grid" style="margin-top:10px">${Object.entries(THEMES).map(([k, th]) => `<button class="theme-opt ${st.theme === k ? 'on' : ''}" data-t="${k}" aria-pressed="${st.theme === k}"><span class="pv" style="background:${th.bg}"><i style="width:40%;background:${th.accent}"></i><i style="width:25%;background:${th.accent2}"></i><i style="width:15%;background:${th.fg};opacity:.5"></i></span><span class="nm">${esc(th.name)}</span></button>`).join('')}</div></div>
    <div class="card" style="margin-top:16px"><h3>🖌️ Custom colors</h3><p class="muted"><small>These override the theme. Click reset to go back to the theme's colors.</small></p>
      <div class="toggle"><span>Accent color</span><span class="row"><input type="color" id="c-ac" value="${curAc}"><button class="btn sm ghost" data-reset="accent">Reset</button></span></div>
      <div class="toggle"><span>Background</span><span class="row"><input type="color" id="c-bg" value="${curBg}"><button class="btn sm ghost" data-reset="bg">Reset</button></span></div>
      <div class="toggle"><span>Text color</span><span class="row"><input type="color" id="c-fg" value="${curFg}"><button class="btn sm ghost" data-reset="fg">Reset</button></span></div>
      <p class="${cr < 4.5 ? '' : 'muted'}" style="margin:10px 0 0;${cr < 4.5 ? 'color:var(--warn)' : ''}"><small>Text contrast: ${cr.toFixed(1)}:1 ${cr < 4.5 ? '⚠️ This is hard to read. Aim for at least 4.5:1.' : '✓ Easy to read'}</small></p></div>
    <div class="card" style="margin-top:16px"><h3>🔤 Text</h3>
      <label class="field"><span>Font</span><select class="input" id="f-font">${[['theme', "Theme's font"], ['sans', 'Clean sans-serif'], ['mono', 'Monospace (coder)'], ['rounded', 'Rounded (friendly)'], ['serif', 'Serif (bookish)'], ['readable', 'Extra readable']].map(([v, l]) => `<option value="${v}" ${st.font === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span>Text size: <b id="sz-l">${st.size}px</b></span><input type="range" id="f-size" min="13" max="22" value="${st.size}"></label>
      <label class="field"><span>Corner roundness: <b id="rd-l">${st.radius >= 0 ? st.radius + 'px' : 'theme'}</b></span><input type="range" id="f-rad" min="-1" max="24" value="${st.radius}"></label></div>
    <div class="card" style="margin-top:16px"><h3>🎮 Games, sound & motion</h3>
      ${[['bosses', 'Boss battles (optional fights at the end of each module)'], ['sound', 'Sound effects'], ['motion', 'Animations'], ['confetti', 'Confetti celebrations']].map(([k, l]) => `<label class="toggle"><span>${l}</span><span class="switch"><input type="checkbox" data-k="${k}" ${st[k] ? 'checked' : ''}><span></span></span></label>`).join('')}
      <label class="field" style="margin-top:12px"><span>Volume</span><input type="range" id="f-vol" min="0" max="1" step=".05" value="${st.volume}"></label></div>
    <div class="card" style="margin-top:16px"><h3>🎯 Goals</h3><label class="field"><span>Daily XP goal</span><select class="input" id="f-goal">${[50, 100, 200, 300].map(g => `<option ${st.dailyGoal === g ? 'selected' : ''}>${g}</option>`).join('')}</select></label></div>
    <div class="card" style="margin-top:16px"><h3>💾 Your data</h3><p class="muted"><small>Progress is saved in this browser. Export a backup to move it to another device, like your school Chromebook and your laptop at home.</small></p>
      <div class="row"><button class="btn" id="d-exp">⬇ Export backup</button><label class="btn" style="cursor:pointer">⬆ Import backup<input type="file" accept=".json,application/json" id="d-imp" class="sr"></label><button class="btn danger" id="d-reset">Reset everything</button></div></div>
  </div>${footer()}`;
  const ch = () => { save(); applyTheme(); award('style'); };
  $$('[data-t]', view).forEach(b => b.onclick = () => { st.theme = b.dataset.t; st.bg = st.fg = st.accent = ''; st.radius = -1; ch(); render(); });
  const col = (id, key) => { $(id, view).oninput = e => { st[key] = e.target.value; ch(); }; $(id, view).onchange = () => render(); };
  col('#c-ac', 'accent'); col('#c-bg', 'bg'); col('#c-fg', 'fg');
  $$('[data-reset]', view).forEach(b => b.onclick = () => { st[b.dataset.reset] = ''; ch(); render(); });
  $('#f-font', view).onchange = e => { st.font = e.target.value; ch(); };
  $('#f-size', view).oninput = e => { st.size = +e.target.value; $('#sz-l', view).textContent = st.size + 'px'; ch(); };
  $('#f-rad', view).oninput = e => { st.radius = +e.target.value; $('#rd-l', view).textContent = st.radius >= 0 ? st.radius + 'px' : 'theme'; ch(); };
  $$('[data-k]', view).forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; save(); applyTheme(); if (i.dataset.k === 'sound' && i.checked) sfx('ok'); });
  $('#f-vol', view).onchange = e => { st.volume = +e.target.value; save(); sfx('ok'); };
  $('#f-goal', view).onchange = e => { st.dailyGoal = +e.target.value; save(); };
  $('#d-exp', view).onclick = () => { const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `compcistudy-backup-${today()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
  $('#d-imp', view).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const data = JSON.parse(await f.text()); if (!data || typeof data !== 'object' || !('xp' in data)) throw new Error('Not a CompSci-Study backup'); if (await confirmBox('Import this backup?', 'It replaces the progress saved in this browser.', 'Import')) { S = deepMerge(DEFAULT_STATE(), data); saveNow(); applyTheme(); toast('Backup imported'); render(); } } catch (err) { toast('Import failed', err.message); } };
  $('#d-reset', view).onclick = async () => { if (await confirmBox('Reset everything?', 'This deletes all your XP, progress, badges and settings in this browser. It cannot be undone.', 'Delete everything')) { await leaveSquad(); S = DEFAULT_STATE(); saveNow(); applyTheme(); location.hash = '/'; location.reload(); } };
});

/* ---------- Help / FAQ ---------- */
route('/help', (view) => {
  const faq = [
    ['How do I earn XP?', 'Lessons give 25 XP. Correct answers give 10 (multiple choice), 15 (trace) or 20 (find the bug). Beating a boss gives 150 XP the first time. Winning a duel gives 50. Units in the weekly event give 2× XP.'],
    ['How do streaks work?', 'Earn any XP on a day to keep your streak going. Miss a whole day and it resets to 0. Your best streak is saved forever.'],
    ['What are boss battles?', 'Boss battles are optional. At the end of each module you can fight its boss: you get 3 hearts, and each correct answer damages the boss. You can skip bosses, or turn them off completely in Settings.'],
    ['How are courses organized?', 'Each course is split into modules (units). A module has lessons, then coding exercises you run and test right in the browser, then fill-in-the-code exercises. After that come the unit quiz, code challenges and an optional boss. You can start a course on any module.'],
    ['How do assignments work?', 'Anyone can add items to their own plan with a due date. Squad leaders (or a teacher who creates the squad) can assign work to the whole squad. Items check themselves off when you finish them, and leaders see who finished in the Gradebook.'],
    ['Why don\'t games ask about lessons I haven\'t done?', 'On purpose! Duels, Speed Round, Bug Hunt, the weekly challenge, practice sets and boss battles only use modules you\'ve reached, so you never get quizzed on things you haven\'t learned. Module quizzes inside lessons and the AP practice exams cover everything. Starting a course at a later module counts the modules before it as reached.'],
    ['How do I send a suggestion?', 'Click the 💬 Feedback tab on the right edge of the screen (on a phone, it\'s in the menu under your avatar). Your message goes straight to the people who run the site.'],
    ['How do the AP CSA practice exams work?', 'Open Practice → AP CSA practice exams. The full exam is like exam day: Section I has 42 multiple-choice questions in 90 minutes, and Section II has 4 free-response questions in 90 minutes. Questions are drawn from all four units using the College Board weightings. You see your score by unit, review every answer, and grade your FRQs with the rubrics. There are also mini exams and unit tests, and you can leave and resume an exam later.'],
    ['What are the underlined words in lessons?', 'They\'re glossary terms. Click one to see what it means in plain English. The full list is on the Glossary page (in the menu under your avatar).'],
    ['Can I change the examples in lessons?', 'Yes! Every "Try it" box is a live editor. Change the code and press Run (or Ctrl+Enter). If something breaks, CompSci-Study explains the error in plain English. Press Reset to get the original back.'],
    ['Do the coding exercises run real code?', 'Yes! Python runs in your browser (it downloads about 10 MB the first time), and JavaScript and HTML run instantly. Java and AP pseudocode use fill-in-the-code exercises instead.'],
    ['How do squads work?', 'A squad is a study group with a 6-character code. Members share a live leaderboard, a weekly squad goal, 1v1 duels and a question bank. The person who creates the squad is the leader, and they approve new questions and can remove members.'],
    ['Is my data private?', 'Your progress is stored only in this browser. If you join a squad, your username, avatar, XP, level and streak are shared with that squad. Questions you write are shared too. No email, no real name and no tracking.'],
    ['I switched computers and my progress is gone!', 'Progress lives in each browser. Use Settings → Export backup on one device and Import on the other.'],
    ['The squad page says it can\'t connect', 'Some school networks block Google\'s Firebase servers. Everything else still works. Try from home, or ask your teacher to allow firestore.googleapis.com.'],
    ['Something is wrong in a question!', 'Tell whoever runs your CompSci-Study site. The content lives in plain text files in the GitHub repo, so it\'s easy to fix. For squad questions, use the Report button.'],
    ['Can I install it like an app?', 'Yes. In Chrome, open the ⋮ menu and choose "Install CompSci-Study" (or "Add to Home screen" on a phone).'],
    ['Keyboard shortcuts?', 'In quizzes, press 1–4 to pick an answer and Enter for the next question.'],
  ];
  view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">// help</span><h1 style="font-size:2.2rem">Help & FAQ</h1>
    <div class="stack">${faq.map(([q, a]) => `<details class="card"><summary style="cursor:pointer;font-weight:700">${esc(q)}</summary><p class="muted" style="margin:10px 0 0">${esc(a)}</p></details>`).join('')}</div>
    <div class="card" style="margin-top:20px"><h3>About CompSci-Study</h3><p class="muted">A free study site for high school computer science, built for a group of friends. AP® is a trademark of the College Board, which is not affiliated with this site. Content follows the 2025–26 AP CSA framework and the AP CSP big ideas.</p><button class="btn" id="redo-onb">Replay the welcome tour</button></div></div>${footer()}`;
  $('#redo-onb', view).onclick = () => onboarding();
});

/* ---------- Onboarding ---------- */
function onboarding() {
  const d = { name: S.profile.name, avatar: S.profile.avatar, color: S.profile.color, year: S.profile.year, courses: [...(S.profile.courses || [])], theme: S.settings.theme };
  let step = 0;
  const steps = [
    () => `<div style="text-align:center"><div style="font-size:3.4rem">&gt;_</div><h2>Welcome to CompSci-Study</h2><p class="muted">Study every high school CS class with notes, quizzes, code challenges, boss battles and duels with your friends.</p></div>
      <label class="field"><span>Pick a username</span><input class="input" id="o-name" maxlength="20" value="${esc(d.name)}" placeholder="e.g. ByteSized" autofocus></label><p class="muted"><small>🔒 Use a nickname, not your full real name. Your squad sees this name.</small></p>`,
    () => `<h2>Choose your look</h2><div class="row" style="margin-bottom:12px"><span id="o-av">${avatarHtml(d, 'lg')}</span></div><div class="emoji-grid">${AVATARS.map(a => `<button type="button" data-a="${a}" class="${a === d.avatar ? 'on' : ''}">${a}</button>`).join('')}</div><div class="swatches" style="margin-top:12px">${COLORS.map(c => `<button type="button" data-c="${c}" class="${c === d.color ? 'on' : ''}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`,
    () => `<h2>What grade are you in?</h2><div class="grid g2" style="margin-top:14px">${GRADES.map(([y, l]) => `<button class="btn lg ${d.year === y ? 'primary' : ''}" style="width:100%" data-y="${y}" aria-pressed="${d.year === y}">${l}</button>`).join('')}</div>`,
    () => `<h2>Which CS courses are you taking?</h2><p class="muted">Pick all that apply. They'll show up first on your home page and in games. You can still open any course, and change this later in your profile.</p>${courseChooser(d.courses)}`,
    () => `<h2>Pick a theme</h2><p class="muted">You can fully customize colors and fonts later in Settings.</p><div class="theme-grid">${Object.entries(THEMES).map(([k, th]) => `<button class="theme-opt ${d.theme === k ? 'on' : ''}" data-t="${k}"><span class="pv" style="background:${th.bg}"><i style="width:40%;background:${th.accent}"></i><i style="width:25%;background:${th.accent2}"></i></span><span class="nm">${esc(th.name)}</span></button>`).join('')}</div>`,
    () => `<div style="text-align:center"><div style="font-size:3.4rem">👥</div><h2>Study with friends?</h2><p class="muted">Squads have a live leaderboard, duels and a shared question bank. Set one up now or later from the Squad tab.</p></div>`,
  ];
  const draw = () => {
    const m = modal(`<div class="steps">${steps.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>${steps[step]()}
      <div class="row" style="justify-content:space-between;margin-top:20px">${step ? '<button class="btn ghost" id="o-back">← Back</button>' : '<span></span>'}
      ${step < steps.length - 1 ? '<button class="btn primary" id="o-next">Next →</button>' : '<div class="row"><button class="btn" id="o-solo">Study solo for now</button><button class="btn primary" id="o-squad">Set up a squad</button></div>'}</div>`, { dismiss: false, wide: step === 1 || step === 3 || step === 4 });
    const upd = () => { const av = $('#o-av', m); if (av) av.innerHTML = avatarHtml(d, 'lg'); };
    $$('[data-a]', m).forEach(b => b.onclick = () => { d.avatar = b.dataset.a; $$('[data-a]', m).forEach(x => x.classList.toggle('on', x === b)); upd(); });
    $$('[data-c]', m).forEach(b => b.onclick = () => { d.color = b.dataset.c; $$('[data-c]', m).forEach(x => x.classList.toggle('on', x === b)); upd(); });
    $$('[data-y]', m).forEach(b => b.onclick = () => { d.year = +b.dataset.y; draw(); });
    wireCourseChooser(m, d.courses);
    $$('[data-t]', m).forEach(b => b.onclick = () => { d.theme = b.dataset.t; S.settings.theme = d.theme; S.settings.bg = S.settings.fg = S.settings.accent = ''; applyTheme(); draw(); });
    const nameOk = () => { if (steps[step] === steps[3] && !d.courses.length) { toast('Pick at least one course', 'You can change it later.'); return false; } if (step !== 0) return true; d.name = $('#o-name', m).value.trim().slice(0, 20); if (!d.name) { toast('Pick a username first'); return false; } return true; };
    $('#o-back', m)?.addEventListener('click', () => { step--; draw(); });
    $('#o-next', m)?.addEventListener('click', () => { if (!nameOk()) return; step++; draw(); });
    $('#o-name', m)?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#o-next', m).click(); });
    const finish = (to) => { Object.assign(S.profile, { name: d.name, avatar: d.avatar, color: d.color, year: d.year, courses: d.courses.slice(), onboarded: true }); save(); modalClose = null; $('#modal-root').innerHTML = ''; toast(`Welcome, ${d.name}! 🎉`, 'Your first lesson is waiting.'); confetti(100); go(to); render(); };
    $('#o-solo', m)?.addEventListener('click', () => finish('/'));
    $('#o-squad', m)?.addEventListener('click', () => finish('/squad'));
  };
  draw();
}

/* ---------- Course picker (onboarding + profile) ---------- */
function courseChooser(sel) {
  return `<div class="grid g2" style="gap:10px;margin-top:10px" role="group" aria-label="Courses">${COURSES.map(c => `<button type="button" class="card course-pick" data-course="${c.id}" aria-pressed="${sel.includes(c.id)}" style="text-align:left;cursor:pointer;padding:14px;display:flex;gap:12px;align-items:center;border-color:${sel.includes(c.id) ? 'var(--accent)' : 'var(--border)'};box-shadow:none">
    <span style="font-size:1.7rem">${c.emoji}</span><span style="flex:1;min-width:0"><b style="display:block">${esc(c.title)}</b><small class="muted">${esc(c.short)}</small></span><span class="chk ${sel.includes(c.id) ? 'done' : ''}" style="width:22px;height:22px">${sel.includes(c.id) ? '✓' : ''}</span></button>`).join('')}</div>`;
}
function wireCourseChooser(root, sel) {
  $$('[data-course]', root).forEach(b => b.onclick = () => {
    const id = b.dataset.course, i = sel.indexOf(id);
    i >= 0 ? sel.splice(i, 1) : sel.push(id);
    const on = sel.includes(id);
    b.setAttribute('aria-pressed', on); b.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
    const k = $('.chk', b); k.classList.toggle('done', on); k.textContent = on ? '✓' : '';
  });
}
