'use strict';
/* ================= Core: utils, state, content index, XP, themes, sound ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// inline formatting for question text: `code` and **bold**
const fmt = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>');
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a, rnd = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function seeded(seed) { let s = 0; for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return { id: `${t.getUTCFullYear()}-W${String(wk).padStart(2, '0')}`, n: t.getUTCFullYear() * 53 + wk };
}
function timeAgo(ts) { if (!ts) return ''; const s = (Date.now() - ts) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; }
const fmtNum = n => Number(n || 0).toLocaleString();

/* ---------- Content index ---------- */
const COURSES = window.COURSES || [];
const COURSE = {}, UNIT = {}, Q = {}, EX = {};
for (const c of COURSES) {
  COURSE[c.id] = c;
  c.units.forEach((u, ui) => {
    u.course = c.id; u.index = ui; UNIT[u.id] = u;
    for (const q of [...u.quiz, ...u.trace, ...u.bug, ...u.fill]) { q.unit = u.id; q.course = c.id; Q[q.id] = q; }
    for (const e of u.ex) { e.course = c.id; EX[e.id] = e; }
    for (const l of u.lessons) for (const q of (l.quizzes || [])) { q.unit = u.id; q.course = c.id; Q[q.id] = q; }
  });
}
const unitQs = (uid, types = ['quiz', 'trace', 'bug', 'fill']) => { const u = UNIT[uid]; return u ? types.flatMap(t => u[t]) : []; };
const courseQs = (cid, types) => (COURSE[cid]?.units || []).flatMap(u => unitQs(u.id, types));
const allQs = types => COURSES.flatMap(c => courseQs(c.id, types));
const GRADES = [[1, '9th grade'], [2, '10th grade'], [3, '11th grade'], [4, '12th grade']];
const gradeLabel = y => (GRADES.find(g => g[0] === y) || GRADES[0])[1];
// courses the student said they're taking (falls back to every course)
const myCourseIds = () => { const ids = (S.profile.courses || []).filter(id => COURSE[id]); return ids.length ? ids : COURSES.map(c => c.id); };
const takingCourse = id => (S.profile.courses || []).includes(id);
const lessonCount = c => c.units.reduce((n, u) => n + u.lessons.length, 0);
const courseMins = c => c.units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.mins, 0) + 5, 0);

/* ---------- Persistent state ---------- */
const STORE_KEY = 'compcistudy.v1';
const DEFAULT_STATE = () => ({
  v: 1, created: Date.now(),
  profile: { name: '', avatar: '🦊', color: '#7c3aed', title: '', year: 1, courses: [], onboarded: false },
  settings: { bosses: true, theme: 'terminal', accent: '', bg: '', fg: '', font: 'theme', size: 16, radius: -1, sound: true, volume: 0.5, motion: true, confetti: true, dailyGoal: 100, squadQs: true },
  xp: 0, days: {}, streak: { count: 0, best: 0, last: '' },
  lessons: {}, units: {}, answers: {}, mistakes: [], badges: {},
  stats: { answered: 0, correct: 0, bugs: 0, speedBest: 0, bugBest: 0, duelsWon: 0, duelsPlayed: 0, bossWins: 0, reviewCleared: 0, perfect: 0 },
  history: [], weekly: {}, squad: null, squadBank: [], seenApproved: {},
  exercises: {}, fills: {}, drafts: {}, start: {}, plan: [], squadAssign: [],
});
let S;
function load() {
  try { const raw = localStorage.getItem(STORE_KEY); S = raw ? deepMerge(DEFAULT_STATE(), JSON.parse(raw)) : DEFAULT_STATE(); }
  catch (e) { S = DEFAULT_STATE(); }
}
function deepMerge(base, over) {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = deepMerge(base[k], over[k]);
    else base[k] = over[k];
  }
  return base;
}
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 150); }
function saveNow() { S.savedAt = Date.now(); try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } if (typeof cloudSave === 'function') cloudSave(); }
load();

/* ---------- Levels, titles ---------- */
const levelFor = xp => Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2);
const xpForLevel = L => 100 * L * (L - 1) / 2;
const TITLES = [[1, 'Hello, World'], [2, 'Print Statement'], [3, 'Loop Learner'], [5, 'Bug Squasher'], [7, 'Function Fanatic'], [9, 'Array Ace'], [12, 'Algorithm Architect'], [15, 'Recursion Royalty'], [18, 'Big-O Boss'], [22, 'Compile Legend'], [30, 'Senior Dev (Honorary)']];
const unlockedTitles = () => TITLES.filter(([L]) => levelFor(S.xp) >= L).map(t => t[1]).concat(Object.keys(S.badges).length >= 10 ? ['Badge Collector'] : [], S.stats.bossWins >= 5 ? ['Boss Slayer'] : [], S.stats.duelsWon >= 5 ? ['Duel Champion'] : []);
const myTitle = () => S.profile.title && unlockedTitles().includes(S.profile.title) ? S.profile.title : unlockedTitles().slice(-1)[0] || 'Hello, World';

/* ---------- Weekly events ---------- */
const EVENTS = [
  { id: 'loops', name: 'Loop-de-Loop Week', emoji: '🔁', units: ['py3', 'csa2', 'csp3'], blurb: 'Loops everywhere. 2× XP on loop units.' },
  { id: 'bits', name: 'Bit Blitz', emoji: '💾', units: ['csp2', 'ds1'], blurb: 'Binary, data and Big-O. 2× XP.' },
  { id: 'crypto', name: 'Crypto Week', emoji: '🗝️', units: ['cy3', 'cy2', 'csp5'], blurb: 'Ciphers, hashes and passwords. 2× XP.' },
  { id: 'objects', name: 'Object Week', emoji: '🧱', units: ['csa1', 'csa3'], blurb: 'Classes and objects in Java. 2× XP.' },
  { id: 'web', name: 'Web Week', emoji: '🕸️', units: ['web1', 'web2', 'web3', 'web4'], blurb: 'HTML, CSS and JS. 2× XP.' },
  { id: 'bugbash', name: 'Bug Bash', emoji: '🐛', units: ['py5', 'web3', 'csa4', 'ds2'], blurb: 'Bug Hunt pays 2× XP all week.', bugBonus: true },
  { id: 'recursion', name: 'Recursion Week', emoji: '🌀', units: ['csa4', 'ds4', 'ds3'], blurb: 'Recursion Week: see Recursion Week. 2× XP.' },
  { id: 'net', name: 'Network Week', emoji: '📡', units: ['csp4', 'cy4'], blurb: 'Packets, protocols and firewalls. 2× XP.' },
  { id: 'py', name: 'Python Party', emoji: '🐍', units: ['py1', 'py2', 'py4'], blurb: 'Back to basics with Python. 2× XP.' },
  { id: 'arrays', name: 'Collection Week', emoji: '📚', units: ['csa4', 'py5', 'ds2'], blurb: 'Arrays, lists and collections. 2× XP.' },
];
function currentEvent() {
  const w = isoWeek(); const m = new Date().getMonth();
  if (m === 3 || (m === 4 && new Date().getDate() <= 15)) return { id: 'cram', name: 'AP Exam Cram', emoji: '📝', units: ['csp1', 'csp2', 'csp3', 'csp4', 'csp5', 'csa1', 'csa2', 'csa3', 'csa4'], blurb: 'AP exam season! 2× XP on every AP unit.', week: w.id };
  return { ...EVENTS[w.n % EVENTS.length], week: w.id };
}
const EVENT = currentEvent();

/* ---------- Badges ---------- */
const BADGES = [
  { id: 'first-lesson', i: '📖', n: 'First Steps', d: 'Finish your first lesson' },
  { id: 'first-quiz', i: '✅', n: 'Quiz Taker', d: 'Finish a practice quiz' },
  { id: 'perfect', i: '💯', n: 'Flawless', d: 'Get 100% on a quiz of 5+ questions' },
  { id: 'streak3', i: '🔥', n: 'On Fire', d: '3-day streak' },
  { id: 'streak7', i: '☄️', n: 'Week Warrior', d: '7-day streak' },
  { id: 'streak30', i: '🌋', n: 'Unstoppable', d: '30-day streak' },
  { id: 'boss1', i: '⚔️', n: 'Boss Slayer', d: 'Beat a boss battle' },
  { id: 'boss5', i: '👑', n: 'Boss Royalty', d: 'Beat 5 different bosses' },
  { id: 'course-master', i: '🎓', n: 'Course Master', d: 'Beat every boss in one course' },
  { id: 'bug10', i: '🐞', n: 'Exterminator', d: 'Find 10 bugs' },
  { id: 'speed15', i: '⚡', n: 'Speed Demon', d: 'Score 15+ in a Speed Round' },
  { id: 'duel-win', i: '🤺', n: 'Duelist', d: 'Win a 1v1 duel' },
  { id: 'squad', i: '👥', n: 'Squad Up', d: 'Join a squad' },
  { id: 'contrib', i: '✍️', n: 'Question Writer', d: 'Get a question approved for your squad bank' },
  { id: 'weekly', i: '🗓️', n: 'Weekly Regular', d: 'Finish a weekly challenge' },
  { id: 'polyglot', i: '🌍', n: 'Polyglot', d: 'Study lessons in 3 different courses' },
  { id: 'complete', i: '🏁', n: 'Completionist', d: 'Finish every lesson in a course' },
  { id: 'review10', i: '🔄', n: 'Comeback Kid', d: 'Clear 10 questions from your mistakes' },
  { id: 'night', i: '🦉', n: 'Night Owl', d: 'Study after 10 PM' },
  { id: 'early', i: '🐦', n: 'Early Bird', d: 'Study before 7 AM' },
  { id: 'style', i: '🎨', n: 'Stylist', d: 'Customize your theme' },
  { id: 'level10', i: '🚀', n: 'Double Digits', d: 'Reach level 10' },
];
function award(id) {
  if (S.badges[id]) return;
  const b = BADGES.find(x => x.id === id); if (!b) return;
  S.badges[id] = Date.now(); save();
  toast(`${b.i} Badge unlocked: ${b.n}`, b.d, 'badge');
  sfx('level'); confetti(60);
  if (typeof squadSync === 'function') squadSync();
}

/* ---------- XP, streaks ---------- */
function addXP(amount, why, unitId) {
  amount = Math.round(amount);
  if (unitId && EVENT.units.includes(unitId)) amount *= 2;
  if (amount <= 0) return 0;
  const before = levelFor(S.xp);
  S.xp += amount;
  const d = today();
  S.days[d] = (S.days[d] || 0) + amount;
  // streak
  if (S.streak.last !== d) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak.count = S.streak.last === today(y) ? S.streak.count + 1 : 1;
    S.streak.last = d; S.streak.best = Math.max(S.streak.best, S.streak.count);
    if (S.streak.count >= 3) award('streak3');
    if (S.streak.count >= 7) award('streak7');
    if (S.streak.count >= 30) award('streak30');
  }
  const h = new Date().getHours(); if (h >= 22) award('night'); if (h < 7) award('early');
  if (why) { S.history.unshift({ t: Date.now(), why, xp: amount }); S.history = S.history.slice(0, 60); }
  const after = levelFor(S.xp);
  save(); renderChrome();
  if (after > before) { toast(`⬆️ Level ${after}!`, `You're now "${unlockedTitles().slice(-1)[0]}" (or pick a title in your profile).`, 'level'); sfx('level'); confetti(120); if (after >= 10) award('level10'); }
  if (typeof squadSync === 'function') squadSync();
  return amount;
}
function streakAlive() { const d = today(); const y = new Date(); y.setDate(y.getDate() - 1); return S.streak.last === d || S.streak.last === today(y) ? S.streak.count : 0; }
function weekXP() { let n = 0; const now = new Date(); for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(now.getDate() - i); n += S.days[today(d)] || 0; } return n; }
function thisIsoWeekXP() { const w = isoWeek().id; let n = 0; for (const [d, x] of Object.entries(S.days)) { const [Y, M, D] = d.split('-').map(Number); if (isoWeek(new Date(Y, M - 1, D)).id === w) n += x; } return n; }
function recordAnswer(q, ok) {
  S.stats.answered++; if (ok) S.stats.correct++;
  const a = S.answers[q.id] || (S.answers[q.id] = { c: 0, w: 0 });
  ok ? a.c++ : a.w++;
  const i = S.mistakes.indexOf(q.id);
  if (!ok && i < 0) S.mistakes.push(q.id);
  save();
}
function clearMistake(id) { const i = S.mistakes.indexOf(id); if (i >= 0) { S.mistakes.splice(i, 1); S.stats.reviewCleared++; if (S.stats.reviewCleared >= 10) award('review10'); save(); } }
function lessonDone(cid, uid, li) { return !!S.lessons[`${uid}:${li}`]; }
/* Each unit is a "module" (like JuiceMind): lessons, then coding exercises, then fill-in-the-code. */
function unitItems(u) {
  return [
    ...u.lessons.map((l, i) => ({ k: 'lesson', key: `${u.id}:${i}`, title: l.title, href: `#/learn/${u.id}/${i}`, icon: '📖', mins: l.mins })),
    ...u.ex.map(e => ({ k: 'ex', key: e.id, title: e.title, href: `#/ex/${e.id}`, icon: '💻', mins: e.mins })),
    ...u.fill.map(f => ({ k: 'fill', key: f.id, title: f.title || 'Fill in the code', href: `#/ex/${f.id}`, icon: '🧩', mins: 4 })),
  ];
}
function itemDoneAt(it) { return it.k === 'lesson' ? S.lessons[it.key] : it.k === 'ex' ? S.exercises[it.key]?.at : S.fills[it.key]?.at; }
function unitProgress(u) { const its = unitItems(u); return its.length ? its.filter(itemDoneAt).length / its.length : 0; }
function courseProgress(c) { const its = c.units.flatMap(unitItems); return its.length ? its.filter(itemDoneAt).length / its.length : 0; }
const unitDone = u => unitItems(u).every(itemDoneAt);
function afterItemDone(u) {
  award('first-lesson');
  const courses = new Set([...Object.keys(S.lessons).map(k => UNIT[k.split(':')[0]]?.course), ...Object.keys(S.exercises).map(k => EX[k]?.course)].filter(Boolean));
  if (courses.size >= 3) award('polyglot');
  const c = COURSE[u.course];
  if (c.units.every(unitDone)) award('complete');
  if (typeof squadSync === 'function') squadSync();
}
function markLesson(uid, li) {
  const key = `${uid}:${li}`; if (S.lessons[key]) return;
  S.lessons[key] = Date.now();
  addXP(25, `Lesson: ${UNIT[uid].lessons[li].title}`, uid);
  afterItemDone(UNIT[uid]);
}
function markExercise(id, code) {
  const e = EX[id]; const first = !S.exercises[id];
  S.exercises[id] = { at: S.exercises[id]?.at || Date.now(), code }; save();
  if (first) { addXP(40, `Exercise: ${e.title}`, e.unit); afterItemDone(UNIT[e.unit]); }
}
function markFill(id) {
  const q = Q[id]; if (S.fills[id]) return;
  S.fills[id] = { at: Date.now() }; save();
  addXP(20, `Fill in the code: ${q.title || 'exercise'}`, q.unit); afterItemDone(UNIT[q.unit]);
}
// ordered units of a course, starting from the unit the student chose to start on
function unitsFromStart(c) { const si = Math.max(0, c.units.findIndex(u => u.id === S.start[c.id])); return [...c.units.slice(si), ...c.units.slice(0, si)]; }
function nextInCourse(c) {
  for (const u of unitsFromStart(c)) { const it = unitItems(u).find(x => !itemDoneAt(x)); if (it) return { c, u, it }; }
  return null;
}
/* ---------- "Reached" scope: games & practice only use modules you've reached ----------
   A module counts as reached if you've finished anything in it, it's the module you're on now,
   or it comes before the furthest module you've reached (including the module you chose to start on). */
function reachedUnits(c) {
  const started = c.units.findIndex(u => u.id === S.start[c.id]);
  let max = Math.max(started, ...c.units.map((u, i) => unitItems(u).some(itemDoneAt) || S.units[u.id]?.quizAt || S.units[u.id]?.boss ? i : -1));
  if (max < 0) return [];
  const nx = nextInCourse(c); if (nx) max = Math.max(max, c.units.indexOf(nx.u));
  return c.units.slice(0, max + 1).map(u => u.id);
}
function reachedSet() {
  const ids = COURSES.flatMap(reachedUnits);
  if (!ids.length) { const c = COURSE[myCourseIds()[0]] || COURSES[0]; ids.push((c.units.find(u => u.id === S.start[c.id]) || c.units[0]).id); }  // brand new: the module you're on
  return new Set(ids);
}
const isReached = uid => reachedSet().has(uid);
const scopeQs = qs => { const r = reachedSet(); return qs.filter(q => r.has(q.unit)); };
function lockedNote(what = 'any course') { return `<div class="wrap narrow"><div class="card empty"><span class="big">🔒</span><h2>Nothing to play here yet</h2><p>Games and practice only use lessons you've reached, so you won't get questions on things you haven't learned. Finish a lesson in ${esc(what)} to unlock questions.</p><a class="btn primary" href="${continueTarget().href}">Continue learning →</a></div></div>`; }

function continueTarget() {
  const recent = [...Object.entries(S.lessons).map(([k, t]) => [UNIT[k.split(':')[0]]?.course, t]), ...Object.entries(S.exercises).map(([k, v]) => [EX[k]?.course, v.at]), ...Object.entries(S.fills).map(([k, v]) => [Q[k]?.course, v.at])].filter(x => x[0]).sort((a, b) => b[1] - a[1]);
  const order = [...new Set([...(recent.length ? [recent[0][0]] : []), ...Object.keys(S.start).filter(id => COURSE[id]), ...myCourseIds()])];
  for (const id of order) { const n = nextInCourse(COURSE[id]); if (n) return { c: n.c, u: n.u, href: n.it.href, label: n.it.title, fresh: !recent.length && !S.start[id] }; }
  const c = COURSE[order[0]] || COURSES[0];
  return { c, u: c.units[0], href: `#/course/${c.id}`, label: 'Review ' + c.title, done: true };
}

/* ---------- Themes ---------- */
const THEMES = {
  terminal: { name: 'Terminal', cls: 'dark', bg: '#050407', bg2: '#0e0d14', bg3: '#17151f', fg: '#ecebf3', muted: '#9a97ab', accent: '#39ff88', accent2: '#22d3ee', border: '#26232f', codebg: '#0a0910', font: 'sans', head: 'mono', radius: 12 },
  midnight: { name: 'Midnight', cls: 'dark', bg: '#0b1020', bg2: '#121a30', bg3: '#1b2540', fg: '#e8ecf8', muted: '#97a3c2', accent: '#818cf8', accent2: '#38bdf8', border: '#25304d', codebg: '#0a0f1e', font: 'sans', head: 'sans', radius: 14 },
  clean: { name: 'Clean Light', cls: 'light', bg: '#f7f8fa', bg2: '#ffffff', bg3: '#eef1f5', fg: '#16181d', muted: '#5b6472', accent: '#2563eb', accent2: '#0891b2', border: '#dde2ea', codebg: '#f3f5f9', font: 'sans', head: 'sans', radius: 12 },
  playful: { name: 'Playful', cls: 'light', bg: '#fff7fb', bg2: '#ffffff', bg3: '#fdeaf4', fg: '#2a1a3a', muted: '#7a6690', accent: '#a855f7', accent2: '#ec4899', border: '#f2d7ea', codebg: '#faf3ff', font: 'rounded', head: 'rounded', radius: 20 },
  retro: { name: 'Retro Pixel', cls: 'dark theme-retro', bg: '#0b0b2b', bg2: '#15154a', bg3: '#22226a', fg: '#f4f4ff', muted: '#a9a9e0', accent: '#ffd23f', accent2: '#3ee0ff', border: '#3b3ba0', codebg: '#08081f', font: 'mono', head: 'mono', radius: 0 },
  ocean: { name: 'Ocean', cls: 'dark', bg: '#03191e', bg2: '#082a31', bg3: '#0e3a43', fg: '#e3f6f8', muted: '#8fb8bf', accent: '#2dd4bf', accent2: '#60a5fa', border: '#16474f', codebg: '#021317', font: 'sans', head: 'sans', radius: 14 },
  sunset: { name: 'Sunset', cls: 'dark', bg: '#1a0f14', bg2: '#26151c', bg3: '#341d27', fg: '#fdeee6', muted: '#c49f9a', accent: '#fb923c', accent2: '#f472b6', border: '#47293a', codebg: '#140b0f', font: 'sans', head: 'sans', radius: 14 },
  contrast: { name: 'High Contrast', cls: 'dark', bg: '#000000', bg2: '#0a0a0a', bg3: '#1a1a1a', fg: '#ffffff', muted: '#d4d4d4', accent: '#ffe600', accent2: '#00e5ff', border: '#ffffff', codebg: '#000000', font: 'sans', head: 'sans', radius: 6 },
};
const FONTS = {
  sans: 'ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  mono: 'ui-monospace,"SFMono-Regular","Cascadia Code",Consolas,Menlo,monospace',
  rounded: 'ui-rounded,"SF Pro Rounded","Nunito","Varela Round","Trebuchet MS",system-ui,sans-serif',
  serif: 'ui-serif,Georgia,Cambria,"Times New Roman",serif',
  readable: 'Verdana,"Atkinson Hyperlegible",Tahoma,system-ui,sans-serif',
};
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function lum(h) { const [r, g, b] = hexToRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; }
function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); }
function applyTheme() {
  const st = S.settings, t = THEMES[st.theme] || THEMES.terminal, r = document.documentElement.style;
  const bg = st.bg || t.bg, fg = st.fg || t.fg, accent = st.accent || t.accent;
  const light = lum(bg) > 0.4;
  const mixBase = light ? '#000' : '#fff';
  r.setProperty('--bg', bg);
  r.setProperty('--bg2', st.bg ? `color-mix(in srgb, ${bg} ${light ? 96 : 92}%, ${mixBase})` : t.bg2);
  r.setProperty('--bg3', st.bg ? `color-mix(in srgb, ${bg} ${light ? 91 : 85}%, ${mixBase})` : t.bg3);
  r.setProperty('--border', st.bg ? `color-mix(in srgb, ${bg} ${light ? 84 : 78}%, ${mixBase})` : t.border);
  r.setProperty('--code-bg', st.bg ? `color-mix(in srgb, ${bg} 94%, #000)` : t.codebg);
  r.setProperty('--fg', fg);
  r.setProperty('--muted', st.fg ? `color-mix(in srgb, ${fg} 62%, ${bg})` : t.muted);
  r.setProperty('--accent', accent);
  r.setProperty('--accent2', t.accent2);
  r.setProperty('--on-accent', lum(accent) > 0.35 ? '#0a0a0a' : '#ffffff');
  r.setProperty('--ok', light ? '#16a34a' : '#39d98a');
  r.setProperty('--bad', light ? '#dc2626' : '#ff5c7a');
  r.setProperty('--warn', light ? '#b45309' : '#ffcc4d');
  const f = st.font === 'theme' ? t.font : st.font;
  r.setProperty('--font', FONTS[f] || FONTS.sans);
  r.setProperty('--head', st.font === 'theme' ? FONTS[t.head] : FONTS[f]);
  r.setProperty('--size', clamp(+st.size || 16, 13, 22) + 'px');
  r.setProperty('--radius', (st.radius >= 0 ? st.radius : t.radius) + 'px');
  r.setProperty('--shadow', light ? '0 1px 2px rgba(0,0,0,.05),0 6px 20px rgba(0,0,0,.06)' : '0 1px 0 rgba(255,255,255,.03),0 8px 30px rgba(0,0,0,.35)');
  document.body.className = `${light ? 'light' : 'dark'} ${t.cls.includes('theme-') ? t.cls.split(' ').find(c => c.startsWith('theme-')) : ''} theme-${st.theme} ${st.motion ? 'auto-motion' : 'no-motion'}`;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg);
}

/* ---------- Sound (Web Audio, no files) ---------- */
let AC;
function sfx(kind) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { ok: [[660, 0], [880, .08]], bad: [[220, 0], [160, .1]], click: [[520, 0]], level: [[523, 0], [659, .1], [784, .2], [1047, .3]], tick: [[1200, 0]], hit: [[300, 0], [180, .06]], win: [[523, 0], [659, .12], [784, .24], [1047, .36], [1319, .5]] }[kind] || [[440, 0]];
    const vol = clamp(S.settings.volume ?? .5, 0, 1) * .18;
    for (const [f, t] of notes) {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = kind === 'bad' || kind === 'hit' ? 'sawtooth' : 'square';
      o.frequency.value = f; g.gain.value = 0;
      o.connect(g); g.connect(AC.destination);
      const t0 = AC.currentTime + t;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + (kind === 'tick' ? .05 : .16));
      o.start(t0); o.stop(t0 + .2);
    }
  } catch (e) { }
}

/* ---------- Confetti ---------- */
function confetti(n = 100) {
  if (!S.settings.confetti || !S.settings.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement);
  const colors = [cs.getPropertyValue('--accent'), cs.getPropertyValue('--accent2'), '#ffcc4d', '#ff5c7a', '#a855f7'];
  const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 4, c: pick(colors), a: Math.random() * 6, va: (Math.random() - .5) * .3 }));
  let frames = 0;
  (function step() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) { p.x += p.vx; p.y += p.vy; p.vy += .35; p.vx *= .99; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); }
    if (++frames < 150) requestAnimationFrame(step); else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}
