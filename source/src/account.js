/* ================= Accounts: email sign-in, cloud progress, owner/admin roles =================
   People sign in with an email + password (or Google). Their progress is saved to
   Firestore under users/{uid}, so it follows them to any device.
   OWNER_EMAILS get full owner/admin powers automatically once their email is verified
   (Google sign-ins are verified already). The same list is in firestore.rules, which is
   what actually enforces it on the server.                                              */
const OWNER_EMAILS = ['francescovic0525@gmail.com', '129fcapone@frhsd.com'];
const ACC = { user: null, email: '', verified: false, owner: false, admin: false, extraAdmins: [], ready: false };
const signedIn = () => !!(ACC.user && !ACC.user.isAnonymous);

function computeRoles() {
  const u = ACC.user;
  ACC.email = (u && !u.isAnonymous && u.email || '').toLowerCase();
  ACC.verified = !!(u && u.emailVerified);
  ACC.owner = !!(ACC.email && ACC.verified && OWNER_EMAILS.includes(ACC.email));
  ACC.admin = ACC.owner || !!(ACC.email && ACC.verified && ACC.extraAdmins.includes(ACC.email));
  S.account = signedIn() ? { email: ACC.email, uid: u.uid } : (S.account?.skip ? S.account : null);
}

async function loadAdminList() {
  if (FB.status !== 'ok' || !signedIn()) return;
  try { const s = await FB.f.getDoc(fdoc('config', 'admins')); ACC.extraAdmins = s.exists() ? (s.data().emails || []).map(e => String(e).toLowerCase()) : []; } catch (e) { ACC.extraAdmins = []; }
  computeRoles();
}

// Called by fbInit whenever Firebase reports who is signed in (or that nobody is).
async function onAuthUser(user) {
  const was = ACC.user?.uid;
  ACC.user = user; FB.uid = user ? user.uid : null; ACC.ready = true;
  computeRoles();
  if (signedIn()) {
    if (was !== user.uid) await cloudLoad();
    await loadAdminList();
    if (S.squad?.code) { refreshSquadMeta(); writeMember(); startBankSync(); startAssignSync(); }
    flushFeedbackQueue();
    closeAuthGate();
    if (!S.profile.onboarded && !$('.modal')) setTimeout(() => { if (!S.profile.onboarded && !$('.modal')) onboarding(); }, 250);
  }
  saveNow(); renderChrome(); if (!$('#auth-gate')) render();
  maybeShowGate();
}

/* ---------- Cloud progress ---------- */
const cloudRefs = () => [fdoc('users', FB.uid), fdoc('users', FB.uid, 'private', 'progress')];
let cloudT = null, cloudBusy = false;
function cloudSave(now) {
  if (!signedIn() || FB.status !== 'ok') return;
  clearTimeout(cloudT);
  const go = async () => {
    if (cloudBusy) { cloudT = setTimeout(go, 1500); return; }
    cloudBusy = true;
    try {
      const copy = { ...S }; delete copy.examDraft;
      let state = JSON.stringify(copy);
      if (state.length > 900000) { copy.drafts = {}; state = JSON.stringify(copy); }
      const [pub, priv] = cloudRefs();
      await FB.f.setDoc(priv, { state, savedAt: S.savedAt || Date.now() });
      await FB.f.setDoc(pub, { email: ACC.email, name: S.profile.name || '', avatar: S.profile.avatar || '🦊', xp: S.xp || 0, level: levelFor(S.xp || 0), courses: S.profile.courses || [], squad: S.squad?.code || '', updated: Date.now() }, { merge: true });
    } catch (e) { console.warn('cloud save failed', e); }
    cloudBusy = false;
  };
  if (now) return go();
  cloudT = setTimeout(go, 4000);
}
async function cloudLoad() {
  try {
    const snap = await FB.f.getDoc(cloudRefs()[1]);
    if (snap.exists()) {
      const cloud = JSON.parse(snap.data().state || '{}');
      const localIsOther = S.account?.uid && S.account.uid !== FB.uid;
      const useCloud = localIsOther || !S.profile.onboarded || (cloud.xp || 0) >= (S.xp || 0) || (cloud.savedAt || 0) > (S.savedAt || 0);
      if (useCloud) {
        S = deepMerge(DEFAULT_STATE(), cloud); computeRoles(); saveNow(); applyTheme();
        if (S.profile.onboarded) { $('#modal-root').innerHTML = ''; modalClose = null; }
        toast('Progress loaded', 'Welcome back' + (S.profile.name ? ', ' + S.profile.name : '') + '!');
        return;
      }
    }
    cloudSave(true);   // first sign-in on this account: upload what's on this device
  } catch (e) { console.warn('cloud load failed', e); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cloudSave(true); });

/* ---------- Sign in / sign up / sign out ---------- */
const AUTH_MSG = {
  'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'No account with that email. Create one instead?',
  'auth/email-already-in-use': 'That email already has an account. Sign in instead.', 'auth/credential-already-in-use': 'That account is already in use. Sign in instead.',
  'auth/weak-password': 'Passwords need at least 6 characters.', 'auth/invalid-email': 'That doesn\'t look like an email address.', 'auth/missing-password': 'Type your password.',
  'auth/too-many-requests': 'Too many tries. Wait a minute and try again.', 'auth/network-request-failed': 'Can\'t reach the sign-in server. Check your internet.',
  'auth/popup-blocked': 'The browser blocked the Google window. Allow pop-ups for this site and try again.', 'auth/popup-closed-by-user': 'The Google window was closed before signing in.',
  'auth/operation-not-allowed': 'This sign-in method isn\'t switched on yet. The site owner needs to enable it in Firebase → Authentication → Sign-in method.',
  'auth/unauthorized-domain': 'This website isn\'t on Firebase\'s list of allowed sites yet. The site owner needs to add it in Firebase → Authentication → Settings → Authorized domains.',
};
const authErr = e => AUTH_MSG[e?.code] || (e?.message || String(e)).replace(/^Firebase: /, '');

async function authSignUp(email, pw) {
  const A = FB.a, auth = FB.auth;
  const cred = A.EmailAuthProvider.credential(email, pw);
  const r = auth.currentUser?.isAnonymous ? await A.linkWithCredential(auth.currentUser, cred) : await A.createUserWithEmailAndPassword(auth, email, pw);
  try { await A.sendEmailVerification(r.user); } catch (e) { }
  await onAuthUser(r.user);
  return r.user;
}
async function authSignIn(email, pw) { const r = await FB.a.signInWithEmailAndPassword(FB.auth, email, pw); await onAuthUser(r.user); return r.user; }
async function authGoogle() {
  const A = FB.a, auth = FB.auth, prov = new A.GoogleAuthProvider();
  prov.setCustomParameters({ prompt: 'select_account' });
  let r;
  try { r = auth.currentUser?.isAnonymous ? await A.linkWithPopup(auth.currentUser, prov) : await A.signInWithPopup(auth, prov); }
  catch (e) {
    if (e.code !== 'auth/credential-already-in-use') throw e;
    r = await A.signInWithCredential(auth, A.GoogleAuthProvider.credentialFromError(e));
  }
  await onAuthUser(r.user); return r.user;
}
async function authReset(email) { await FB.a.sendPasswordResetEmail(FB.auth, email); }
async function authResendVerify() { if (FB.auth?.currentUser) await FB.a.sendEmailVerification(FB.auth.currentUser); }
async function authRecheck() { if (!FB.auth?.currentUser) return; await FB.auth.currentUser.reload(); await FB.auth.currentUser.getIdToken(true); ACC.user = FB.auth.currentUser; computeRoles(); await loadAdminList(); renderChrome(); render(); }
async function authSignOut() {
  await cloudSave(true);
  try { stopBankSync?.(); stopAssignSync?.(); } catch (e) { }
  await FB.a.signOut(FB.auth);
  try { localStorage.removeItem(STORE_KEY); } catch (e) { }
  location.hash = '#/'; location.reload();
}

/* ---------- The sign-in screen ---------- */
function closeAuthGate() { $('#auth-gate')?.remove(); document.body.classList.remove('gated'); }
function maybeShowGate() {
  if (signedIn() || S.account?.skip || $('#auth-gate')) return;
  if (!squadState().configured) return;                // no Firebase on this copy of the site: nothing to sign in to
  showAuthGate();
}
function showAuthGate(mode = 'in') {
  closeAuthGate();
  const g = document.createElement('div'); g.id = 'auth-gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); g.setAttribute('aria-label', 'Sign in');
  document.body.appendChild(g); document.body.classList.add('gated');
  const draw = () => {
    const up = mode === 'up', st = FB.status;
    g.innerHTML = `<div class="ag-card">
      <div class="logo" style="justify-content:center;margin-bottom:6px"><span class="mark">&gt;_</span><span>CompSci-<b>Study</b></span></div>
      <h1>${mode === 'reset' ? 'Reset your password' : up ? 'Create your account' : 'Sign in'}</h1>
      <p class="muted" style="margin:0 0 16px">${mode === 'reset' ? 'We\'ll email you a link to choose a new password.' : 'Your progress is saved to your account, so it follows you to any device.'}</p>
      ${st === 'loading' || st === 'off' && !ACC.ready ? '<p class="muted">⏳ Connecting…</p>' : ''}
      ${st === 'error' ? `<div class="notice warn" style="text-align:left"><b>Can't reach the sign-in server.</b><br><small>${esc(FB.err)}. Your school network may block it. You can still study without an account.</small></div>` : ''}
      <form id="ag-form" class="stack" style="gap:10px;text-align:left" novalidate>
        <label class="ag-l">Email<input class="input" id="ag-email" type="email" autocomplete="email" required value="${esc(g.dataset.email || '')}"></label>
        ${mode === 'reset' ? '' : `<label class="ag-l">Password<input class="input" id="ag-pw" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" minlength="6" required></label>`}
        ${up ? '<label class="ag-l">Confirm password<input class="input" id="ag-pw2" type="password" autocomplete="new-password" required></label>' : ''}
        <p id="ag-msg" class="ag-msg" role="alert"></p>
        <button class="btn primary" type="submit" style="width:100%;justify-content:center" ${st === 'ok' ? '' : 'disabled'}>${mode === 'reset' ? 'Send reset link' : up ? 'Create account' : 'Sign in'}</button>
      </form>
      ${mode === 'reset' ? '' : `<div class="ag-or"><span>or</span></div><button class="btn" id="ag-google" style="width:100%;justify-content:center" ${st === 'ok' ? '' : 'disabled'}><b style="color:#4285f4">G</b>&nbsp; Continue with Google</button>`}
      <div class="ag-links">
        ${mode === 'in' ? '<a href="#" data-m="up">New here? <b>Create an account</b></a><a href="#" data-m="reset">Forgot password?</a>' : '<a href="#" data-m="in">← Back to sign in</a>'}
      </div>
      <a href="#" id="ag-skip" class="ag-skip">Continue without an account</a>
      <small class="muted ag-note">Without an account, progress is only saved in this browser and squads are turned off.</small>
    </div>`;
    const msg = (t, ok) => { const m = $('#ag-msg', g); m.textContent = t; m.className = 'ag-msg' + (ok ? ' ok' : ''); };
    $$('[data-m]', g).forEach(a => a.onclick = ev => { ev.preventDefault(); g.dataset.email = $('#ag-email', g).value; mode = a.dataset.m; draw(); });
    $('#ag-skip', g).onclick = ev => { ev.preventDefault(); S.account = { skip: true }; save(); closeAuthGate(); if (!S.profile.onboarded) onboarding(); };
    const busy = on => $$('button', g).forEach(b => b.disabled = on || FB.status !== 'ok');
    $('#ag-form', g).onsubmit = async ev => {
      ev.preventDefault();
      const email = $('#ag-email', g).value.trim(), pw = $('#ag-pw', g)?.value || '';
      if (!/^\S+@\S+\.\S+$/.test(email)) return msg('Type a full email address.');
      if (mode === 'up' && pw !== $('#ag-pw2', g).value) return msg('The two passwords don\'t match.');
      busy(true); msg(mode === 'reset' ? 'Sending…' : 'Signing in…', true);
      try {
        if (mode === 'reset') { await authReset(email); msg('Check your inbox for the reset link.', true); busy(false); return; }
        const user = mode === 'up' ? await authSignUp(email, pw) : await authSignIn(email, pw);
        afterSignIn(user, mode === 'up');
      } catch (e) { msg(authErr(e)); busy(false); }
    };
    const gb = $('#ag-google', g); if (gb) gb.onclick = async () => { busy(true); msg(''); try { afterSignIn(await authGoogle(), false); } catch (e) { msg(authErr(e)); busy(false); } };
    setTimeout(() => $('#ag-email', g)?.focus(), 30);
  };
  g.redraw = draw; draw();
}
function afterSignIn(user, isNew) {
  closeAuthGate();
  const email = (user.email || '').toLowerCase();
  if (OWNER_EMAILS.includes(email) && !user.emailVerified) toast('Verify your email to unlock owner tools', 'We sent a link to ' + email + '. Click it, then press "I verified it" on your profile.');
  else if (ACC.owner) toast('👑 Welcome back, owner', 'You have full owner and admin access.');
  else if (isNew) toast('Account created! 🎉', 'Check your inbox to verify your email.');
}
