/* ================= Squad backend: Firebase (Firestore + anonymous auth) =================
   The site itself is static (GitHub Pages). Live squad features talk to a free Firebase
   project whose config lives in firebase-config.js. If that file is missing, or the school
   network blocks Firebase, everything else keeps working in solo mode.                    */
const FB_VERSION = '10.12.2';
const FB = { status: 'off', err: '', uid: null, db: null, f: null };
const SQ_ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const genCode = () => Array.from({ length: 6 }, () => SQ_ALPHA[Math.floor(Math.random() * SQ_ALPHA.length)]).join('');
const fmtCode = c => c ? c.slice(0, 3) + '-' + c.slice(3) : '';
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function squadState() {
  const cfg = window.COMPCI_FIREBASE_CONFIG;
  return { configured: !!(cfg && cfg.apiKey && !/PASTE/i.test(cfg.apiKey)), status: FB.status, err: FB.err, inSquad: !!S.squad?.code, code: S.squad?.code, name: S.squad?.name, isLeader: !!(S.squad && FB.uid && (S.squad.owner === FB.uid || ACC.admin)), signedIn: signedIn() };
}
const withTimeout = (p, ms, msg = 'timeout') => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);
let fbReady;
function fbInit() {
  if (fbReady) return fbReady;
  fbReady = (async () => {
    if (!squadState().configured) { FB.status = 'off'; return false; }
    FB.status = 'loading';
    try {
      const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}/`;
      const [appM, authM, fsM] = await withTimeout(Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]), 12000, 'Could not download Firebase (blocked or offline)');
      const app = appM.initializeApp(window.COMPCI_FIREBASE_CONFIG);
      const auth = authM.getAuth(app);
      FB.a = authM; FB.auth = auth; FB.f = fsM; FB.db = fsM.getFirestore(app);
      // Wait for Firebase to say who (if anyone) is already signed in on this browser.
      const user = await withTimeout(new Promise(res => { const un = authM.onAuthStateChanged(auth, u => { un(); res(u); }); }), 12000, 'Could not reach the sign-in server');
      FB.status = 'ok';
      await onAuthUser(user);
      authM.onAuthStateChanged(auth, u => { if ((u && u.uid) !== (ACC.user && ACC.user.uid)) onAuthUser(u); });
      return true;
    } catch (e) {
      console.warn('Firebase init failed', e); FB.status = 'error'; FB.err = e.code || e.message || String(e); return false;
    } finally { $('#auth-gate')?.redraw?.(); if (location.hash.startsWith('#/squad') || location.hash.startsWith('#/live') || location.hash.startsWith('#/admin')) render(); }
  })();
  return fbReady;
}
const fdoc = (...p) => FB.f.doc(FB.db, ...p);
const fcol = (...p) => FB.f.collection(FB.db, ...p);
const sqPath = () => ['squads', S.squad.code];

/* ---------- Squad membership ---------- */
async function createSquad(name) {
  await fbInit(); if (FB.status !== 'ok') throw new Error('The squad server isn\'t reachable.');
  if (!FB.uid) throw new Error('Sign in first to use squads.');
  let code;
  for (let i = 0; i < 5; i++) { code = genCode(); const s = await FB.f.getDoc(fdoc('squads', code)); if (!s.exists()) break; }
  await FB.f.setDoc(fdoc('squads', code), { name: name.slice(0, 40), owner: FB.uid, banned: [], created: FB.f.serverTimestamp() });
  await joinSquad(code);
  return code;
}
async function joinSquad(code) {
  await fbInit(); if (FB.status !== 'ok') throw new Error('The squad server isn\'t reachable.');
  if (!FB.uid) throw new Error('Sign in first to use squads.');
  code = normCode(code);
  if (code.length !== 6) throw new Error('Squad codes are 6 characters, like K7Q-2MX.');
  const snap = await FB.f.getDoc(fdoc('squads', code));
  if (!snap.exists()) throw new Error('No squad found with that code. Check for typos.');
  const d = snap.data();
  if ((d.banned || []).includes(FB.uid)) throw new Error('You were removed from this squad.');
  S.squad = { code, name: d.name, owner: d.owner, joinedAt: Date.now() }; save();
  await writeMember(true);
  award('squad'); startBankSync(); startAssignSync();
}
async function leaveSquad() {
  if (!S.squad) return;
  try { if (FB.status === 'ok') await FB.f.deleteDoc(fdoc(...sqPath(), 'members', FB.uid)); } catch (e) { }
  S.squad = null; S.squadBank = []; S.squadAssign = []; save(); stopBankSync(); stopAssignSync();
}
async function refreshSquadMeta() {
  try { const s = await FB.f.getDoc(fdoc(...sqPath())); if (s.exists()) { const d = s.data(); S.squad.name = d.name; S.squad.owner = d.owner; if ((d.banned || []).includes(FB.uid)) { toast('You were removed from the squad'); S.squad = null; } save(); } } catch (e) { }
}
function memberData() {
  return { name: S.profile.name || 'Student', avatar: S.profile.avatar, color: S.profile.color, title: myTitle(), year: S.profile.year,
    xp: S.xp, level: levelFor(S.xp), streak: streakAlive(), week: isoWeek().id, weekXp: thisIsoWeekXP(), badges: Object.keys(S.badges).length,
    bosses: Object.values(S.units).filter(u => u.boss).length, lessons: Object.keys(S.lessons).length, lastActive: Date.now(),
    assign: Object.fromEntries((S.squadAssign || []).map(a => [a.id, assignDoneAt(a)]).filter(([, at]) => at).map(([id, at]) => { const a = S.squadAssign.find(x => x.id === id); const s = assignScore(a); return [id, s != null ? { at, s } : { at }]; })) };
}
async function writeMember(isNew) {
  if (FB.status !== 'ok' || !S.squad?.code) return;
  try { await FB.f.setDoc(fdoc(...sqPath(), 'members', FB.uid), { ...memberData(), ...(isNew ? { joined: Date.now() } : {}) }, { merge: true }); } catch (e) { console.warn('member sync failed', e); }
}
let syncT;
function squadSync() { if (FB.status !== 'ok' || !S.squad?.code) return; clearTimeout(syncT); syncT = setTimeout(writeMember, 1200); }

function subMembers(cb) { return FB.f.onSnapshot(fcol(...sqPath(), 'members'), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => cb(null, e)); }
async function homeLeaderboard(el) {
  await fbInit();
  if (FB.status !== 'ok') { el.innerHTML = `<p class="muted">Squad server not reachable right now.</p>`; return; }
  try {
    const s = await FB.f.getDocs(fcol(...sqPath(), 'members'));
    const w = isoWeek().id;
    const list = s.docs.map(d => ({ id: d.id, ...d.data() })).map(m => ({ ...m, wk: m.week === w ? m.weekXp : 0 })).sort((a, b) => b.wk - a.wk).slice(0, 3);
    el.innerHTML = `<ul class="lb" style="margin:8px 0 14px">${list.map((m, i) => `<li class="${m.id === FB.uid ? 'me' : ''}"><span class="rank">${['🥇', '🥈', '🥉'][i]}</span>${avatarHtml(m, 'sm')}<span class="who"><b>${esc(m.name)}</b></span><span class="val">${fmtNum(m.wk)} XP</span></li>`).join('')}</ul><small class="muted">This week's XP</small><br>`;
  } catch (e) { el.innerHTML = `<p class="muted">Couldn't load the leaderboard.</p>`; }
}
async function kickMember(uid) {
  await FB.f.updateDoc(fdoc(...sqPath()), { banned: FB.f.arrayUnion(uid) });
  await FB.f.deleteDoc(fdoc(...sqPath(), 'members', uid));
}
async function transferLeader(uid) { await FB.f.updateDoc(fdoc(...sqPath()), { owner: uid }); S.squad.owner = uid; save(); }
async function renameSquad(name) { await FB.f.updateDoc(fdoc(...sqPath()), { name: name.slice(0, 40) }); S.squad.name = name; save(); }

/* ---------- Shared question bank ---------- */
let bankUnsub = null;
const normSquadQ = (id, d) => ({ id: 'sq-' + id, docId: id, kind: 'mcq', type: 'squad', q: d.q, code: d.code || '', lang: d.lang || 'text', choices: d.choices, a: d.a, why: d.why || 'Written by your squad.', unit: d.unit, course: d.course, authorName: d.authorName, author: d.author, status: d.status, reports: d.reports || [] });
function startBankSync() {
  if (bankUnsub || FB.status !== 'ok' || !S.squad?.code) return;
  bankUnsub = FB.f.onSnapshot(fcol(...sqPath(), 'questions'), s => {
    const all = s.docs.map(d => normSquadQ(d.id, d.data()));
    S.squadBank = all.filter(q => q.status === 'approved' && q.reports.length < 3).map(({ reports, status, ...q }) => q);
    for (const q of all) if (q.author === FB.uid && q.status === 'approved' && !S.seenApproved[q.docId]) { S.seenApproved[q.docId] = 1; award('contrib'); }
    save();
    bankListeners.forEach(f => f(all));
  }, e => console.warn('bank sync', e));
}
function stopBankSync() { bankUnsub && bankUnsub(); bankUnsub = null; }
const bankListeners = new Set();
const squadBankQs = () => (S.squadBank || []).filter(q => Array.isArray(q.choices) && q.choices.length >= 2);
const squadQ = id => squadBankQs().find(q => q.id === id);
async function addSquadQuestion(d) {
  const lead = squadState().isLeader;
  await FB.f.addDoc(fcol(...sqPath(), 'questions'), { ...d, author: FB.uid, authorName: S.profile.name || 'Student', status: lead ? 'approved' : 'pending', reports: [], created: FB.f.serverTimestamp() });
}
const approveQ = id => FB.f.updateDoc(fdoc(...sqPath(), 'questions', id), { status: 'approved' });
const deleteQ = id => FB.f.deleteDoc(fdoc(...sqPath(), 'questions', id));
const reportQ = id => FB.f.updateDoc(fdoc(...sqPath(), 'questions', id), { reports: FB.f.arrayUnion(FB.uid) });

/* ---------- Weekly challenge scores ---------- */
async function submitWeekly(score, correct) {
  await fbInit(); if (FB.status !== 'ok' || !S.squad?.code) return;
  try { await FB.f.setDoc(fdoc(...sqPath(), 'weekly', `${EVENT.week}_${FB.uid}`), { uid: FB.uid, name: S.profile.name || 'Student', avatar: S.profile.avatar, color: S.profile.color, week: EVENT.week, score, correct, at: Date.now() }); } catch (e) { console.warn(e); }
}
function subWeekly(cb) { return FB.f.onSnapshot(FB.f.query(fcol(...sqPath(), 'weekly'), FB.f.where('week', '==', EVENT.week)), s => cb(s.docs.map(d => d.data())), e => cb(null, e)); }

/* ---------- Live duels ---------- */
async function createLiveDuel(cid) {
  try {
    await fbInit(); if (FB.status !== 'ok') throw new Error('Squad server not reachable');
    const qids = shuffle(poolFor(cid, ['quiz', 'trace'])).slice(0, 7).map(q => q.id);
    if (qids.length < 3) throw new Error("Reach a few more lessons in this topic first. Duels only use lessons you've reached.");
    const ref = await FB.f.addDoc(fcol(...sqPath(), 'duels'), { host: FB.uid, hostName: S.profile.name || 'Student', hostAvatar: S.profile.avatar, hostColor: S.profile.color, guest: null, guestName: '', guestAvatar: '', guestColor: '', course: cid, qids, seed: genCode(), status: 'open', hs: 0, gs: 0, hi: 0, gi: 0, created: Date.now() });
    go('/live/' + ref.id);
  } catch (e) { toast('Could not create duel', e.message); }
}
function subDuels(cb) { return FB.f.onSnapshot(FB.f.query(fcol(...sqPath(), 'duels'), FB.f.orderBy('created', 'desc'), FB.f.limit(25)), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => cb(null, e)); }
function subDuel(id, cb) { return FB.f.onSnapshot(fdoc(...sqPath(), 'duels', id), s => cb(s.exists() ? { id: s.id, ...s.data() } : null), e => cb(null, e)); }
async function joinDuel(id) {
  const ref = fdoc(...sqPath(), 'duels', id);
  await FB.f.runTransaction(FB.db, async tx => {
    const s = await tx.get(ref); if (!s.exists()) throw new Error('Duel not found');
    const d = s.data(); if (d.guest && d.guest !== FB.uid) throw new Error('Someone already joined this duel');
    if (d.host === FB.uid) throw new Error("You can't duel yourself!");
    tx.update(ref, { guest: FB.uid, guestName: S.profile.name || 'Student', guestAvatar: S.profile.avatar, guestColor: S.profile.color, status: 'live', started: Date.now() });
  });
}
const duelAnswer = (id, isHost, pts) => FB.f.updateDoc(fdoc(...sqPath(), 'duels', id), isHost ? { hs: FB.f.increment(pts), hi: FB.f.increment(1) } : { gs: FB.f.increment(pts), gi: FB.f.increment(1) });
const duelSet = (id, data) => FB.f.updateDoc(fdoc(...sqPath(), 'duels', id), data);
const duelDelete = id => FB.f.deleteDoc(fdoc(...sqPath(), 'duels', id));

/* ---------- Squad assignments (leader assigns, everyone's app reports completion) ---------- */
let assignUnsub = null;
const assignListeners = new Set();
function startAssignSync() {
  if (assignUnsub || FB.status !== 'ok' || !S.squad?.code) return;
  assignUnsub = FB.f.onSnapshot(fcol(...sqPath(), 'assignments'), s => {
    const before = new Set((S.squadAssign || []).map(a => a.id));
    S.squadAssign = s.docs.map(d => ({ id: d.id, ...d.data() }));
    const fresh = S.squadAssign.filter(a => !before.has(a.id) && a.by !== FB.uid && before.size);
    if (fresh.length) toast(`📌 New assignment from ${fresh[0].byName || 'your leader'}`, fresh[0].title);
    save(); renderChrome(); assignListeners.forEach(f => f()); squadSync();
  }, e => console.warn('assign sync', e));
}
function stopAssignSync() { assignUnsub && assignUnsub(); assignUnsub = null; }
async function createAssignment(a) { await FB.f.addDoc(fcol(...sqPath(), 'assignments'), { ...a, by: FB.uid, byName: S.profile.name || 'Leader', created: Date.now() }); }
const deleteAssignment = id => FB.f.deleteDoc(fdoc(...sqPath(), 'assignments', id));

/* ---------- Feedback (anyone can send; only admins listed in config/admins can read) ---------- */
async function sendFeedback(fb) {
  await fbInit();
  if (FB.status !== 'ok' || !FB.uid) { S.feedbackQueue = [...(S.feedbackQueue || []), fb]; save(); return 'queued'; }
  await FB.f.addDoc(fcol('feedback'), { ...fb, uid: FB.uid, status: 'new' });
  return 'sent';
}
async function flushFeedbackQueue() {
  if (FB.status !== 'ok' || !FB.uid || !(S.feedbackQueue || []).length) return;
  const q = S.feedbackQueue.slice(); S.feedbackQueue = []; save();
  for (const fb of q) { try { await FB.f.addDoc(fcol('feedback'), { ...fb, uid: FB.uid, status: 'new' }); } catch (e) { S.feedbackQueue.push(fb); } }
  save();
}
async function isFeedbackAdmin() {
  await fbInit(); if (FB.status !== 'ok') return false;
  if (ACC.admin) return true;
  try { const s = await FB.f.getDoc(fdoc('config', 'admins')); return s.exists() && (s.data().uids || []).includes(FB.uid); } catch (e) { return false; }
}
function subFeedback(cb) { return FB.f.onSnapshot(FB.f.query(fcol('feedback'), FB.f.orderBy('created', 'desc'), FB.f.limit(300)), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => cb(null, e)); }
const updateFeedback = (id, data) => FB.f.updateDoc(fdoc('feedback', id), data);
const deleteFeedback = id => FB.f.deleteDoc(fdoc('feedback', id));
