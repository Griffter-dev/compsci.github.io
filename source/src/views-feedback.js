/* ================= Feedback tab + owner inbox ================= */
const FB_TYPES = [['idea', '💡', 'Suggestion'], ['bug', '🐛', 'Something is broken'], ['content', '📚', 'A lesson or question is wrong'], ['love', '❤️', 'Something I like']];
route('/feedback', (view, p) => {
  const from = p.from || S.lastPage || '';
  const sent = (S.feedbackSent || []).slice(-5).reverse();
  view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">// feedback</span><h1 style="font-size:2.2rem">💬 Feedback & suggestions</h1>
    <p class="muted">Got an idea, found a bug, or spotted a wrong answer? Tell us! Every message goes straight to the people who run CompciStudy.</p>
    <form class="card" id="fb-form">
      <fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:600;margin-bottom:8px">What kind of feedback?</legend><div class="grid g2" style="gap:8px">${FB_TYPES.map(([v, i, l], k) => `<label class="card fb-type" style="padding:12px;display:flex;gap:10px;align-items:center;cursor:pointer;box-shadow:none"><input type="radio" name="fb-t" value="${v}" ${k === 0 ? 'checked' : ''}> <span style="font-size:1.3rem">${i}</span> ${l}</label>`).join('')}</div></fieldset>
      <label class="field"><span>Your message</span><textarea class="input" id="fb-msg" required maxlength="1500" rows="5" style="font-family:var(--font);font-size:1rem" placeholder="e.g. It would be cool if duels had a 3-player mode!"></textarea><small class="muted" id="fb-count">0/1500</small></label>
      <label class="field"><span>Which page is this about? <small class="muted">(optional)</small></span><input class="input" id="fb-page" maxlength="120" value="${esc(from)}" placeholder="e.g. AP CS A › 2.4 Nested if Statements"></label>
      <label class="toggle" style="border:0"><span>Send anonymously <small class="muted">(don't include my username)</small></span><span class="switch"><input type="checkbox" id="fb-anon"><span></span></span></label>
      <div class="row" style="justify-content:flex-end"><button class="btn primary" id="fb-send">Send feedback</button></div>
    </form>
    ${sent.length ? `<h3 style="margin-top:24px">Your recent feedback</h3><div class="stack">${sent.map(f => `<div class="card" style="padding:12px 14px"><small class="muted">${(FB_TYPES.find(t => t[0] === f.type) || ['', '💬'])[1]} ${new Date(f.created).toLocaleDateString()} · ${f.state === 'queued' ? '⏳ will send when the server is reachable' : '✓ sent'}</small><div>${esc(f.message)}</div></div>`).join('')}</div>` : ''}
    <p style="margin-top:20px"><a href="#/feedback/inbox" class="muted"><small>🔐 Site owner? Open the feedback inbox</small></a></p></div>${footer()}`;
  const msg = $('#fb-msg', view);
  msg.oninput = () => $('#fb-count', view).textContent = `${msg.value.length}/1500`;
  $('#fb-form', view).onsubmit = async e => {
    e.preventDefault();
    const text = msg.value.trim(); if (text.length < 3) return toast('Write a little more first');
    const anon = $('#fb-anon', view).checked;
    const fb = { type: $('input[name=fb-t]:checked', view).value, message: text.slice(0, 1500), page: $('#fb-page', view).value.trim().slice(0, 120), name: anon ? '' : (S.profile.name || '').slice(0, 20), squad: anon ? '' : (S.squad?.name || ''), created: Date.now(), app: 'web' };
    const b = $('#fb-send', view); b.disabled = true; b.textContent = 'Sending…';
    let state;
    try { state = await sendFeedback(fb); } catch (err) { S.feedbackQueue = [...(S.feedbackQueue || []), fb]; state = 'queued'; }
    S.feedbackSent = [...(S.feedbackSent || []), { ...fb, state }].slice(-20); save();
    toast(state === 'sent' ? 'Thanks! Feedback sent 💬' : 'Saved! It will send automatically', state === 'sent' ? 'We read every message.' : "The feedback server isn't reachable right now.");
    confetti(40); render();
  };
});
route('/feedback/inbox', (view) => {
  const ss = squadState();
  if (!ss.configured) { view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Feedback inbox</h1><div class="notice warn">The inbox needs the free Firebase setup (see <b>SETUP.md</b> → "Turn on squads"). Until then, feedback is saved on each person's device and sends automatically once Firebase is on.</div></div>`; return; }
  view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Feedback inbox</h1><p class="muted">Checking access…</p></div>`;
  isFeedbackAdmin().then(ok => {
    if (!ok) {
      view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Feedback inbox</h1><div class="card"><p>Only site owners can read feedback. To make <b>this browser</b> an owner, add this ID in Firebase:</p><pre class="console" style="user-select:all">${esc(FB.uid || '(not connected)')}</pre><ol class="muted"><li>Firebase console → <b>Firestore Database</b> → <b>Start collection</b> named <code>config</code></li><li>Document ID <code>admins</code>, with a field <code>uids</code> of type <b>array</b></li><li>Add the ID above as a string in that array, then <a href="#/feedback/inbox">reload this page</a></li></ol><small class="muted">The ID belongs to this browser. If you clear your browser data or use another device, add that new ID too.</small></div></div>`;
      return;
    }
    let filter = 'new';
    view.innerHTML = `<div class="wrap"><div class="spread"><div><span class="eyebrow">// owner only</span><h1 style="font-size:2rem;margin:0">🔐 Feedback inbox</h1></div><div class="tabs" style="margin:0"><button data-f="new" class="on">New</button><button data-f="done">Done</button><button data-f="all">All</button></div></div><div id="fb-list" style="margin-top:16px"><p class="muted">Loading…</p></div></div>`;
    let items = [];
    const draw = () => {
      const list = items.filter(f => filter === 'all' || (filter === 'new' ? f.status !== 'done' : f.status === 'done'));
      $('#fb-list', view).innerHTML = list.length ? list.map(f => `<div class="card fb-item ${f.status === 'done' ? 'done' : ''}"><div class="spread"><b>${(FB_TYPES.find(t => t[0] === f.type) || ['', '💬', 'Feedback'])[1]} ${esc((FB_TYPES.find(t => t[0] === f.type) || ['', '', 'Feedback'])[2])}</b><small class="muted">${new Date(f.created).toLocaleString()}</small></div><p style="white-space:pre-wrap;margin:8px 0">${esc(f.message)}</p><small class="muted">${f.name ? `👤 ${esc(f.name)}` : '👤 anonymous'}${f.squad ? ` · 👥 ${esc(f.squad)}` : ''}${f.page ? ` · 📍 ${esc(f.page)}` : ''}</small><div class="row" style="margin-top:10px"><button class="btn sm" data-done="${f.id}">${f.status === 'done' ? '↺ Mark as new' : '✓ Mark done'}</button><button class="btn sm ghost" data-del="${f.id}">🗑 Delete</button></div></div>`).join('') : '<div class="empty card">No feedback here. 🎉</div>';
      $$('[data-done]', view).forEach(b => b.onclick = () => { const f = items.find(x => x.id === b.dataset.done); updateFeedback(f.id, { status: f.status === 'done' ? 'new' : 'done' }).catch(e => toast('Error', e.message)); });
      $$('[data-del]', view).forEach(b => b.onclick = async () => { if (await confirmBox('Delete this feedback?', 'It will be removed permanently.', 'Delete')) deleteFeedback(b.dataset.del).catch(e => toast('Error', e.message)); });
    };
    $$('[data-f]', view).forEach(b => b.onclick = () => { filter = b.dataset.f; $$('[data-f]', view).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const un = subFeedback((list, err) => { if (!list) { $('#fb-list', view).innerHTML = `<div class="notice warn">${esc(err?.message || 'Error')}</div>`; return; } items = list; draw(); });
    onLeave(un);
  });
});
