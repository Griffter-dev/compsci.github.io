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
    <p class="muted">Notes from class for every course, organized by unit, with practice questions. ${total ? `${total} class${total === 1 ? '' : 'es'} of notes so far.` : ''}</p>
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
});

route('/class-notes/:uid', (view, p) => {
  const u = UNIT[p.uid]; if (!u) return;
  const c = COURSE[u.course];
  const notes = (NOTES_BY_UNIT[u.id] || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const allQs = []; let qi = 0;
  notes.forEach(n => n.questions.forEach(q => allQs.push(q)));
  const ui = c.units.indexOf(u), prev = c.units[ui - 1], next = c.units[ui + 1];
  view.innerHTML = `<div class="wrap narrow cn-page"><div class="crumb"><a href="#/class-notes">Class Notes</a> / <span>${c.emoji} ${esc(c.title)}</span></div>
    <div class="spread"><h1 style="font-size:2rem;margin:6px 0">${esc(u.title)}</h1><a class="btn sm" href="#/learn/${u.id}/0">📖 Study this unit →</a></div>
    ${notes.length ? notes.map((n, si) => `<details class="card cn-session" ${si === 0 ? 'open' : ''}><summary><span class="pill">🗓 ${esc(cnDate(n.date))}</span><b>${esc(n.title)}</b><small class="muted">${n.questions.length} questions</small></summary>
      <div class="prose cn-notes">${n.html}</div>
      ${n.questions.length ? `<section class="cn-qs"><h2>✏️ Check your understanding</h2><p class="muted">Answer these to make sure the notes stuck. Wrong answers go to your mistake review.</p>${n.questions.map(q => inlineQ(q, qi++)).join('')}</section>` : ''}</details>`).join('')
      : `<div class="empty card"><span class="big">🗒️</span><h2>No class notes for this unit yet</h2><p>Notes will show up here after they're added. Meanwhile, the unit's lessons are a good place to study.</p><a class="btn primary" href="#/learn/${u.id}/0">Open the lessons →</a></div>`}
    <div class="lesson-nav noprint">${prev ? `<a class="btn" href="#/class-notes/${prev.id}">← ${esc(cnShort(prev.title))}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/class-notes/${next.id}">${esc(cnShort(next.title))} →</a>` : '<span></span>'}</div>
    </div>${footer()}`;
  wireInlineQs(view, allQs);
  $$('.cn-notes', view).forEach(el => linkGlossary(el));
});
