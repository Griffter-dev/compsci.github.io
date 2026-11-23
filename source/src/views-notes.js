/* ================= Class Notes: notes from class for every course, by unit, with practice questions ================= */
const CLASS_NOTES = window.CLASS_NOTES || [];
const NOTES_BY_UNIT = {};
for (const n of CLASS_NOTES) {
  (NOTES_BY_UNIT[n.unit] = NOTES_BY_UNIT[n.unit] || []).push(n);
  const u = UNIT[n.unit];
  for (const q of n.questions) { q.unit = n.unit; q.course = u ? u.course : ''; Q[q.id] = q; }
}
const cnDate = d => new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const cnShort = t => t.replace(/^(Unit \d+|Big Idea \d+|Module \d+):\s*/, '');

route('/notes', (view, p) => { go('/class-notes' + (p.q ? '?q=' + encodeURIComponent(p.q) : '')); });

route('/class-notes', (view, p) => {
  const total = CLASS_NOTES.length;
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// class notes</span><h1 style="font-size:2.2rem">🗒️ Class Notes</h1>
    <div class="spread"><p class="muted" style="margin:0">Notes from class for every course, organized by unit, with practice questions. ${total ? `${total} class${total === 1 ? '' : 'es'} of notes so far.` : ''}</p><span class="row" style="gap:6px"><button class="btn sm primary" id="cn-suggest">✍️ Suggest notes</button>${typeof ACC !== 'undefined' && ACC.admin ? '<a class="btn sm" href="#/class-notes/inbox">🔐 Notes inbox</a>' : ''}</span></div>
    <input class="input" id="cn-q" type="search" placeholder="Search class notes and lessons, like 'constructor' or 'for loop'" value="${esc(p.q || '')}" aria-label="Search notes" style="font-size:1.1rem;padding:14px 16px;margin:10px 0 20px">
    <div id="cn-res"></div>
    <div id="cn-browse">${COURSES.slice().sort((a, b) => (b.units.some(u => NOTES_BY_UNIT[u.id]) ? 1 : 0) - (a.units.some(u => NOTES_BY_UNIT[u.id]) ? 1 : 0)).map(c => {
      const withNotes = c.units.filter(u => NOTES_BY_UNIT[u.id]).length;
      return `<section class="card cn-course" style="--cc:${esc(c.color || 'var(--accent)')}"><div class="spread"><h2>${c.emoji} ${esc(c.title)}</h2><span class="row" style="gap:6px">${withNotes ? `<span class="pill accent">${withNotes} unit${withNotes === 1 ? '' : 's'} with notes</span>` : ''}<a class="btn sm ghost" href="#/cheatsheet/${c.id}">🖨 Cheat sheet</a></span></div>
        <div class="grid g3 cn-units">${c.units.map((u, i) => { const ns = NOTES_BY_UNIT[u.id] || []; const qn = ns.reduce((a, n) => a + n.questions.length, 0);
          return `<a class="cn-unit${ns.length ? '' : ' cn-empty'}" href="#/class-notes/${u.id}"><span class="cn-num">${i + 1}</span><span class="cn-ut"><b>${esc(cnShort(u.title))}</b><small class="muted">${ns.length ? `${ns.length} class${ns.length === 1 ? '' : 'es'} · ${qn} questions` : 'No notes yet'}</small></span></a>`; }).join('')}</div></section>`;
    }).join('')}</div></div>${footer()}`;
  const inp = $('#cn-q', view);
  const doSearch = () => {
    const q = inp.value.trim().toLowerCase(), res = $('#cn-res', view);
    $('#cn-browse', view).classList.toggle('hidden', !!q);
    if (!q) { res.innerHTML = ''; return; }
    const terms = q.split(/\s+/).filter(Boolean), hits = [];
    const snip = (text, t) => { const i = text.toLowerCase().indexOf(t); return text.slice(Math.max(0, i - 60), i + 140); };
    for (const n of CLASS_NOTES) { const hay = (n.title + ' ' + n.text).toLowerCase(); if (terms.every(t => hay.includes(t))) { const u = UNIT[n.unit], c = u && COURSE[u.course]; hits.push({ score: 20 + (n.title.toLowerCase().includes(q) ? 10 : 0), href: `#/class-notes/${n.unit}`, kind: '🗒️ Class notes', where: `${c ? c.emoji + ' ' + c.title + ' · ' : ''}${u ? u.title : ''} · ${cnDate(n.date)}`, title: n.title, snip: snip(n.text, terms[0]) }); } }
    for (const c of COURSES) for (const u of c.units) u.lessons.forEach((l, i) => {
      const hay = (l.title + ' ' + l.text).toLowerCase();
      if (terms.every(t => hay.includes(t))) hits.push({ score: (l.title.toLowerCase().includes(q) ? 10 : 0) + terms.length, href: `#/learn/${u.id}/${i}`, kind: '📖 Lesson', where: `${c.emoji} ${c.title} · ${u.title}`, title: l.title, snip: snip(l.text, terms[0]) });
    });
    hits.sort((a, b) => b.score - a.score);
    const mark = s => { let h = esc(s); for (const t of terms) h = h.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`); return h; };
    res.innerHTML = hits.length ? `<p class="muted">${hits.length} result${hits.length === 1 ? '' : 's'}</p><div class="stack">${hits.slice(0, 40).map(h => `<a class="card hover search-hit" href="${h.href}"><small class="muted">${h.kind} · ${esc(h.where)}</small><h3 style="margin:4px 0">${mark(h.title)}</h3><small>…${mark(h.snip)}…</small></a>`).join('')}</div>` : '<div class="empty">No matches. Try a shorter word.</div>';
  };
  inp.oninput = doSearch; doSearch();
  $('#cn-suggest', view).onclick = () => suggestNotes((COURSES.find(c => c.units.some(u => NOTES_BY_UNIT[u.id])) || COURSES[0]).units[0].id);
});


/* ---------- Notes suggestions: students send notes, owners review them in the Notes inbox ---------- */
const CN_ASKED = new Set();   // units we already asked about this visit
function suggestNotes(unitId) {
  const u = UNIT[unitId], c = u && COURSE[u.course];
  const units = c ? c.units : [];
  const m = modal(`<span class="eyebrow">✍️ Suggest class notes</span><h2 style="margin-top:4px">Share your notes</h2>
    <p class="muted">Paste or type your notes from class. They go to the site owner, who reviews them, makes them better and adds them to Class Notes for everyone.</p>
    <form id="ns-form">
      <label class="field"><span>Unit</span><select class="input" id="ns-unit">${COURSES.map(cc => `<optgroup label="${esc(cc.emoji + ' ' + cc.title)}">${cc.units.map(x => `<option value="${x.id}" ${x.id === unitId ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <div class="grid g2" style="gap:10px"><label class="field"><span>Class date</span><input class="input" type="date" id="ns-date" value="${today()}"></label>
      <label class="field"><span>Topic <small class="muted">(optional)</small></span><input class="input" id="ns-title" maxlength="100" placeholder="e.g. Constructors and getters"></label></div>
      <label class="field"><span>Your notes</span><textarea class="input" id="ns-text" required maxlength="20000" rows="10" style="font-family:var(--font);font-size:.95rem" placeholder="Paste or type your notes here…" autofocus></textarea><small class="muted" id="ns-count">0/20000</small></label>
      <label class="toggle" style="border:0"><span>Send anonymously <small class="muted">(don't include my name)</small></span><span class="switch"><input type="checkbox" id="ns-anon"><span></span></span></label>
      <div class="row" style="justify-content:flex-end;margin-top:8px"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn primary" id="ns-send">Send notes</button></div>
    </form>`, { wide: true });
  const ta = $('#ns-text', m);
  ta.oninput = () => $('#ns-count', m).textContent = `${ta.value.length}/20000`;
  $('[data-x]', m).onclick = () => closeModal();
  $('#ns-form', m).onsubmit = async e => {
    e.preventDefault();
    const text = ta.value.trim(); if (text.length < 10) return toast('Add a bit more first', 'Your notes need at least a sentence or two.');
    const uid = $('#ns-unit', m).value, uu = UNIT[uid];
    const ns = { unit: uid, unitTitle: uu ? uu.title : '', course: uu ? uu.course : '', courseTitle: uu ? COURSE[uu.course].title : '', date: $('#ns-date', m).value || today(), title: $('#ns-title', m).value.trim().slice(0, 100), text: text.slice(0, 20000), name: $('#ns-anon', m).checked ? '' : (S.profile.name || '').slice(0, 40), created: Date.now() };
    const b = $('#ns-send', m); b.disabled = true; b.textContent = 'Sending…';
    let state;
    try { state = await sendNoteSuggestion(ns); } catch (err) { S.noteQueue = [...(S.noteQueue || []), ns]; save(); state = 'queued'; }
    S.notesSent = [...(S.notesSent || []), { unit: uid, date: ns.date, title: ns.title, created: ns.created, state }].slice(-20); save();
    closeModal();
    toast(state === 'sent' ? 'Thanks! Your notes were sent 🗒️' : 'Saved! Your notes will send automatically', state === 'sent' ? 'The site owner will review them.' : "The notes server isn't reachable right now.");
    confetti(40);
  };
}
function askToSuggest(unitId) {
  if (S.settings.noNotesPrompt || CN_ASKED.has(unitId)) return;
  CN_ASKED.add(unitId);
  const u = UNIT[unitId];
  const m = modal(`<div style="text-align:center"><div style="font-size:2.6rem">🗒️</div><h2 style="margin:6px 0">Have notes for this unit?</h2>
    <p class="muted">If you took notes in class on <b>${esc(u.title)}</b>, you can send them in. The best ones get cleaned up and added here for everyone, with practice questions.</p>
    <div class="row" style="justify-content:center;margin-top:14px"><button class="btn primary" data-yes>✍️ Add my notes</button><button class="btn" data-no>Not now</button></div>
    <label style="display:inline-flex;gap:8px;align-items:center;margin-top:14px;font-size:.85rem;color:var(--muted);cursor:pointer"><input type="checkbox" data-never> Don't ask me again</label></div>`);
  const never = () => { if ($('[data-never]', m).checked) { S.settings.noNotesPrompt = true; save(); } };
  $('[data-yes]', m).onclick = () => { never(); suggestNotes(unitId); };
  $('[data-no]', m).onclick = () => { never(); closeModal(); };
}
const NS_STATUS = [['new', '🆕 New'], ['reviewed', '👀 Reviewed'], ['added', '✅ Added'], ['all', 'All']];
route('/class-notes/inbox', (view) => {
  const ss = squadState();
  if (!ss.configured) { view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Notes inbox</h1><div class="notice warn">The inbox needs the free Firebase setup (see <b>SETUP.md</b>).</div></div>`; return; }
  view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Notes inbox</h1><p class="muted">Checking access…</p></div>`;
  isFeedbackAdmin().then(ok => {
    if (!ok) { view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🔐 Notes inbox</h1><div class="card"><p>Only site owners and admins can read suggested notes. Sign in with an owner or admin account to open it.</p><a class="btn" href="#/class-notes">← Class Notes</a></div></div>`; return; }
    let filter = 'new', items = [], editing = null;
    view.innerHTML = `<div class="wrap"><div class="spread"><div><span class="eyebrow">// owner only</span><h1 style="font-size:2rem;margin:0">🔐 Notes inbox</h1><p class="muted" style="margin:4px 0 0">Notes students suggested. Review them, edit if you want, then copy them and send them to Claude to polish and add to Class Notes.</p></div>
      <div class="tabs" style="margin:0">${NS_STATUS.map(([k, l]) => `<button data-f="${k}" class="${k === filter ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="ns-list" style="margin-top:16px"><p class="muted">Loading…</p></div></div>${footer()}`;
    const fmtFor = n => `Class notes suggestion\nCourse: ${n.courseTitle || n.course}\nUnit: ${n.unitTitle || n.unit} (${n.unit})\nClass date: ${n.date}${n.title ? `\nTopic: ${n.title}` : ''}\n\n${n.text}`;
    const draw = () => {
      const list = items.filter(n => filter === 'all' || (n.status || 'new') === filter);
      $('#ns-list', view).innerHTML = list.length ? list.map(n => `<div class="card ns-item ns-${n.status || 'new'}" style="margin-bottom:12px">
        <div class="spread"><div><b>${esc(n.title || 'Notes')}</b> <span class="pill">${esc(NS_STATUS.find(x => x[0] === (n.status || 'new'))[1])}</span><br><small class="muted">${esc(n.courseTitle || '')} › ${esc(n.unitTitle || n.unit)} · class on ${esc(n.date || '')}</small></div><small class="muted">${new Date(n.created).toLocaleString()}<br>${n.name ? '👤 ' + esc(n.name) : '👤 anonymous'}</small></div>
        ${editing === n.id ? `<textarea class="input" data-edit="${n.id}" rows="14" style="margin:10px 0;font-family:var(--font)">${esc(n.text)}</textarea>` : `<div class="ns-text">${esc(n.text)}</div>`}
        <div class="row" style="margin-top:10px">${editing === n.id ? `<button class="btn sm primary" data-save="${n.id}">💾 Save edits</button><button class="btn sm ghost" data-cancel>Cancel</button>` : `<button class="btn sm primary" data-copy="${n.id}">📋 Copy for Claude</button><button class="btn sm" data-ed="${n.id}">✏️ Edit</button>`}
          ${(n.status || 'new') !== 'reviewed' ? `<button class="btn sm" data-st="reviewed" data-id="${n.id}">👀 Mark reviewed</button>` : ''}${(n.status || 'new') !== 'added' ? `<button class="btn sm" data-st="added" data-id="${n.id}">✅ Mark added</button>` : ''}${(n.status || 'new') !== 'new' ? `<button class="btn sm ghost" data-st="new" data-id="${n.id}">↺ Mark new</button>` : ''}
          <a class="btn sm ghost" href="#/class-notes/${esc(n.unit)}">🔗 Unit</a><button class="btn sm ghost" data-del="${n.id}">🗑 Delete</button></div></div>`).join('') : '<div class="empty card">Nothing here. 🎉</div>';
      $$('[data-copy]', view).forEach(b => b.onclick = () => { const n = items.find(x => x.id === b.dataset.copy); navigator.clipboard.writeText(fmtFor(n)).then(() => toast('Copied!', 'Paste it into your chat with Claude to have it polished and added.'), () => toast('Could not copy', 'Select the text and copy it by hand.')); if ((n.status || 'new') === 'new') updateNoteSuggestion(n.id, { status: 'reviewed' }).catch(() => { }); });
      $$('[data-ed]', view).forEach(b => b.onclick = () => { editing = b.dataset.ed; draw(); });
      $$('[data-cancel]', view).forEach(b => b.onclick = () => { editing = null; draw(); });
      $$('[data-save]', view).forEach(b => b.onclick = () => { const t = $(`[data-edit="${b.dataset.save}"]`, view).value; updateNoteSuggestion(b.dataset.save, { text: t.slice(0, 20000), edited: Date.now() }).then(() => { editing = null; toast('Saved'); }).catch(e => toast('Error', e.message)); });
      $$('[data-st]', view).forEach(b => b.onclick = () => updateNoteSuggestion(b.dataset.id, { status: b.dataset.st }).catch(e => toast('Error', e.message)));
      $$('[data-del]', view).forEach(b => b.onclick = async () => { if (await confirmBox('Delete these notes?', 'They will be removed permanently.', 'Delete')) deleteNoteSuggestion(b.dataset.del).catch(e => toast('Error', e.message)); });
    };
    $$('[data-f]', view).forEach(b => b.onclick = () => { filter = b.dataset.f; $$('[data-f]', view).forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const un = subNoteSuggestions((list, err) => { if (!list) { $('#ns-list', view).innerHTML = `<div class="notice warn">${esc(err?.message || 'Error')}${/permission/i.test(err?.message || '') ? '<br>Update your Firestore rules: paste the new <b>firestore.rules</b> file into Firebase → Firestore Database → Rules → Publish.' : ''}</div>`; return; } items = list; if (editing === null) draw(); });
    onLeave(un);
  });
});

route('/class-notes/:uid', (view, p) => {
  const u = UNIT[p.uid]; if (!u) return;
  const c = COURSE[u.course];
  const notes = (NOTES_BY_UNIT[u.id] || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const allQs = []; let qi = 0;
  notes.forEach(n => n.questions.forEach(q => allQs.push(q)));
  const ui = c.units.indexOf(u), prev = c.units[ui - 1], next = c.units[ui + 1];
  view.innerHTML = `<div class="wrap narrow cn-page"><div class="crumb"><a href="#/class-notes">Class Notes</a> / <span>${c.emoji} ${esc(c.title)}</span></div>
    <div class="spread"><h1 style="font-size:2rem;margin:6px 0">${esc(u.title)}</h1><span class="row" style="gap:6px"><button class="btn sm primary" id="cn-suggest">✍️ Suggest notes</button><a class="btn sm" href="#/learn/${u.id}/0">📖 Study this unit →</a></span></div>
    ${notes.length ? notes.map((n, si) => `<details class="card cn-session" ${si === 0 ? 'open' : ''}><summary><span class="pill">🗓 ${esc(cnDate(n.date))}</span><b>${esc(n.title)}</b><small class="muted">${n.questions.length} questions</small></summary>
      <div class="prose cn-notes">${n.html}</div>
      ${n.questions.length ? `<section class="cn-qs"><h2>✏️ Check your understanding</h2><p class="muted">Answer these to make sure the notes stuck. Wrong answers go to your mistake review.</p>${n.questions.map(q => inlineQ(q, qi++)).join('')}</section>` : ''}</details>`).join('')
      : `<div class="empty card"><span class="big">🗒️</span><h2>No class notes for this unit yet</h2><p>Notes will show up here after they're added. Meanwhile, the unit's lessons are a good place to study.</p><div class="row" style="justify-content:center"><button class="btn primary" id="cn-suggest2">✍️ Suggest notes for this unit</button><a class="btn" href="#/learn/${u.id}/0">Open the lessons →</a></div></div>`}
    <div class="lesson-nav noprint">${prev ? `<a class="btn" href="#/class-notes/${prev.id}">← ${esc(cnShort(prev.title))}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/class-notes/${next.id}">${esc(cnShort(next.title))} →</a>` : '<span></span>'}</div>
    </div>${footer()}`;
  wireInlineQs(view, allQs);
  $$('.cn-notes', view).forEach(el => linkGlossary(el));
  ['#cn-suggest', '#cn-suggest2'].forEach(sel => { const b = $(sel, view); if (b) b.onclick = () => suggestNotes(u.id); });
  setTimeout(() => { if (location.hash.startsWith('#/class-notes/' + u.id) && !$('.modal')) askToSuggest(u.id); }, 400);
});
