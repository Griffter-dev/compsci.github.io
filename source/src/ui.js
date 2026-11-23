/* ================= UI helpers: toasts, modals, router, chrome, code ================= */
function toast(title, body = '', kind = '') {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `<b>${esc(title)}</b>${body ? `<small>${esc(body)}</small>` : ''}`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, kind === 'badge' || kind === 'level' ? 4200 : 2600);
}
let modalClose = null;
function modal(html, { wide = false, onClose, dismiss = true } = {}) {
  closeModal();
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-back"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const back = $('.modal-back', root);
  const prevFocus = document.activeElement;
  modalClose = () => { root.innerHTML = ''; modalClose = null; document.removeEventListener('keydown', onKey); onClose && onClose(); prevFocus?.focus?.(); };
  const onKey = e => { if (e.key === 'Escape' && dismiss) closeModal(); };
  document.addEventListener('keydown', onKey);
  if (dismiss) back.addEventListener('click', e => { if (e.target === back) closeModal(); });
  setTimeout(() => ($('[autofocus]', root) || $('button, input, select, textarea, a', root))?.focus(), 30);
  return $('.modal', root);
}
function closeModal() { modalClose && modalClose(); }
function confirmBox(title, body, okLabel = 'Yes') {
  return new Promise(res => {
    const m = modal(`<h3>${esc(title)}</h3><p class="muted">${esc(body)}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-x>Cancel</button><button class="btn primary" data-ok>${esc(okLabel)}</button></div>`, { onClose: () => res(false) });
    $('[data-x]', m).onclick = () => closeModal();
    $('[data-ok]', m).onclick = () => { res(true); modalClose = null; $('#modal-root').innerHTML = ''; };
  });
}
const avatarHtml = (p, cls = '') => `<span class="avatar ${cls}" style="background:${esc(p?.color || '#7c3aed')}33;border-color:${esc(p?.color || '#7c3aed')}" aria-hidden="true">${esc(p?.avatar || '🙂')}</span>`;

/* ---------- Syntax highlighting (tiny, dependency-free) ---------- */
const KW = {
  luau: 'and break do else elseif end false for function if in local nil not or repeat return then true until while continue self',
  python: 'def return if elif else for while in range not and or True False None import from class print len break continue pass lambda with as is try except self',
  java: 'public private protected static void int double boolean char long String new return if else for while do class final this null true false import throws extends implements ArrayList Integer Double',
  js: 'let const var function return if else for of in while do true false null undefined new class this console document typeof async await',
  pseudo: 'IF ELSE REPEAT TIMES UNTIL FOR EACH IN PROCEDURE RETURN DISPLAY INPUT AND OR NOT MOD APPEND INSERT REMOVE LENGTH RANDOM',
  sql: 'SELECT FROM WHERE AND OR INSERT INTO UPDATE DELETE VALUES SET',
  bash: 'chmod ls cd sudo cat echo',
};
KW.javascript = KW.js;
function highlight(code, lang) {
  lang = (lang || '').toLowerCase();
  if (lang === 'html') return esc(code).replace(/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w-]*)|(\s)([a-z-]+)(=)(&quot;[^&]*?&quot;|"[^"]*")/g,
    (m, c, lt, tag, sp, attr, eq, val) => c ? `<span class="tk-c">${c}</span>` : lt ? `${lt}<span class="tk-t">${tag}</span>` : `${sp}<span class="tk-f">${attr}</span>${eq}<span class="tk-s">${val}</span>`);
  const kws = new Set((KW[lang] || '').split(' ').filter(Boolean));
  const com = lang === 'luau' ? '--\\[\\[[\\s\\S]*?\\]\\]|--.*' : lang === 'python' || lang === 'bash' ? '#.*' : lang === 'css' ? '\\/\\*[\\s\\S]*?\\*\\/' : lang === 'sql' ? '--.*' : '\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/';
  const re = new RegExp(`(${com})|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`[^\`]*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\\s*\\()?|([A-Za-z_][A-Za-z0-9_]*)`, 'g');
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index)); last = re.lastIndex;
    const [all, c, s, n, w] = m;
    if (c) out += `<span class="tk-c">${esc(c)}</span>`;
    else if (s) out += `<span class="tk-s">${esc(s)}</span>`;
    else if (n) out += `<span class="tk-n">${esc(n)}</span>`;
    else if (kws.has(all)) out += `<span class="tk-k">${esc(all)}</span>`;
    else if (w && /^\s*\(/.test(code.slice(last))) out += `<span class="tk-f">${esc(all)}</span>`;
    else if ((lang === 'java' || lang === 'luau') && /^[A-Z]/.test(all)) out += `<span class="tk-t">${esc(all)}</span>`;
    else out += esc(all);
  }
  return out + esc(code.slice(last));
}
const LANG_LABEL = { luau: 'luau', python: 'python', java: 'java', js: 'javascript', javascript: 'javascript', html: 'html', css: 'css', pseudo: 'AP pseudocode', bash: 'terminal', sql: 'sql', text: 'text', '': 'text' };
/* Question body below the stem: code, call table, I/II/III options, then the ask line (AP-quiz-sheet style). */
function qExtra(q) {
  let h = q.code ? codeBlock(q.code, q.lang, false) : '';
  if (q.table && q.table.length) h += `<div class="qtable-wrap"><table class="qtable"><thead><tr>${q.table[0].map(c => `<th>${fmt(c)}</th>`).join('')}</tr></thead><tbody>${q.table.slice(1).map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (q.ask) h += `<p class="qask">${fmt(q.ask)}</p>`;
  if (q.opts) h += `<div class="qopts">${q.opts.map(o => `<div class="qopt"><b class="qopt-n">${o.n}.</b><div style="min-width:0">${o.text ? `<span>${fmt(o.text)}</span>` : ''}${o.code ? codeBlock(o.code, o.lang, false) : ''}</div></div>`).join('')}</div>`;
  return h;
}
const qPts = q => q.sheet ? `<span class="qpts">(${q.pts || 1} pt${(q.pts || 1) > 1 ? 's' : ''})</span>` : '';
const choiceOrder = (q, rnd) => q.sheet ? q.choices.map((_, i) => i) : shuffle(q.choices.map((_, i) => i), rnd);
function codeBlock(code, lang, copy = true) {
  return `<pre class="code"><div class="chead"><span>${esc(LANG_LABEL[lang] || lang)}</span>${copy ? '<button type="button" data-copy>copy</button>' : ''}</div><code>${highlight(code, lang)}</code></pre>`;
}
// upgrade marked-rendered <pre><code class="language-x"> blocks
function enhanceCode(root) {
  let luauSetup = null;
  $$('pre:not(.ed-hl):not(.console):not(.code) > code', root).forEach(el => {
    const pre = el.parentElement; if (pre.classList.contains('code')) return;
    const lang = (el.className.match(/language-([\w-]+)/) || [])[1] || 'text';
    const code = el.textContent.replace(/\n$/, '');
    if (lang === 'luau-setup') { luauSetup = code; pre.remove(); return; }
    if (/-(run|visual)$/.test(lang)) { const host = document.createElement('div'); pre.replaceWith(host); if (lang.startsWith('luau')) { host.dataset.visual = /-visual$/.test(lang) ? '1' : ''; if (luauSetup) { host.dataset.setup = luauSetup; luauSetup = null; } } mountExample(host, code, lang.replace(/-(run|visual)$/, '').replace('javascript', 'js')); return; }
    const tmp = document.createElement('div'); tmp.innerHTML = codeBlock(code, lang);
    pre.replaceWith(tmp.firstChild);
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const text = b.closest('pre').querySelector('code').textContent;
  navigator.clipboard?.writeText(text).then(() => { b.textContent = 'copied!'; setTimeout(() => b.textContent = 'copy', 1200); }, () => { });
});

/* ---------- Router ---------- */
const ROUTES = [];
function route(pattern, fn) { const keys = []; const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$'); ROUTES.push({ re, keys, fn }); }
let cleanup = [];
function onLeave(fn) { cleanup.push(fn); }
function go(path) { if (location.hash === '#' + path) render(); else location.hash = path; }
function render() {
  cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = [];
  closeModal();
  const path = decodeURIComponent(location.hash.slice(1) || '/');
  const [p, qs] = path.split('?');
  const params = Object.fromEntries(new URLSearchParams(qs || ''));
  const view = $('#view');
  view.innerHTML = '';
  for (const r of ROUTES) {
    const m = p.match(r.re);
    if (m) { r.keys.forEach((k, i) => params[k] = m[i + 1]); r.fn(view, params); break; }
  }
  if (!view.innerHTML) { view.innerHTML = `<div class="wrap empty"><span class="big">🧭</span><h2>404: page not found</h2><p>That page doesn't exist.</p><a class="btn primary" href="#/">Go home</a></div>`; }
  enhanceCode(view);
  renderChrome();
  if (!params.keep) window.scrollTo(0, 0);
  view.focus({ preventScroll: true });
}
window.addEventListener('hashchange', render);

/* ---------- Chrome: top bar + mobile tab bar ---------- */
const NAV = [['/', 'Home', '🏠'], ['/courses', 'Courses', '📚'], ['/assignments', 'Assigned', '📋'], ['/arcade', 'Arcade', '🕹️'], ['/squad', 'Squad', '👥']];
const NAV_SHORT = { 'AP Exam & FRQs': 'AP Exam', 'Assignments': 'Assigned' };
const DESK_NAV = [['/courses', 'Courses', '📚'], ['/practice', 'Practice', '🎯'], ['/exam', 'AP Exam & FRQs', '📝'], ['/assignments', 'Assignments', '📋'], ['/arcade', 'Arcade', '🕹️'], ['/squad', 'Squad', '👥'], ['/class-notes', 'Class Notes', '🗒️'], ['/feedback', 'Feedback', '💬']];
function renderChrome() {
  const p = (location.hash.slice(1) || '/').split('?')[0];
  const active = href => href === '/exam' ? (p.startsWith('/exam') || p.startsWith('/frq')) : href === '/' ? p === '/' : p.startsWith(href) || (href === '/courses' && (p.startsWith('/course') || p.startsWith('/learn') || p.startsWith('/ex/') || p.startsWith('/unit-done')));
  const due = typeof dueBadgeCount === 'function' ? dueBadgeCount() : 0;
  const tag = h => h === '/arcade' ? '<span class="tag">2×</span>' : h === '/assignments' && due ? `<span class="tag due">${due}</span>` : '';
  const st = streakAlive(), L = levelFor(S.xp);
  $('#topbar').innerHTML = `
    <a class="logo" href="#/" aria-label="CompSci-Study home"><span class="mark">&gt;_</span><span>CompSci-<b>Study</b></span></a>
    <nav class="navlinks" aria-label="Main">${DESK_NAV.map(([h, n, i]) => `<a href="#${h === '/feedback' ? '/feedback?from=' + encodeURIComponent(pageLabel()) : h}" class="${active(h) ? 'on' : ''}" title="${n}"><span class="ni" aria-hidden="true">${i}</span><span class="nl">${n}</span><span class="ns">${NAV_SHORT[n] || n}</span>${tag(h)}</a>`).join('')}</nav>
    <div class="topright">
      <button class="chip search-btn" id="search-btn" aria-label="Search lessons, practices and units (shortcut: /)" title="Search  ( / )">🔍 <span class="search-lbl">Search</span><kbd>/</kbd></button>
      <span class="chip" title="Day streak">🔥 ${st}</span>
      <span class="chip xp" title="Level ${L}">⭐ ${fmtNum(S.xp)} XP · L${L}</span>
      <button class="iconbtn" id="me-btn" aria-label="Open profile menu" aria-haspopup="true">${avatarHtml(S.profile)}</button>
    </div>`;
  $('#tabbar').innerHTML = NAV.map(([h, n, i]) => `<a href="#${h}" class="${active(h) ? 'on' : ''}"><span class="i">${i}${h === '/assignments' && due ? `<span class="tbadge">${due}</span>` : ''}</span>${n}</a>`).join('');
  $('#me-btn').onclick = e => { e.stopPropagation(); toggleMenu(); };
  $('#search-btn').onclick = e => { e.stopPropagation(); openSearch(); };
}
// a friendly name for the current page (sent along with feedback)
function pageLabel() {
  const p = (location.hash.slice(1) || '/').split('?')[0].split('/').filter(Boolean);
  try {
    if (p[0] === 'learn' && UNIT[p[1]]) { const u = UNIT[p[1]]; return `${COURSE[u.course].title} › ${u.lessons[+p[2]]?.title || u.title}`; }
    if (p[0] === 'ex') { const it = EX[p[1]] || Q[p[1]]; return it ? `${COURSE[it.course].title} › ${it.title}` : ''; }
    if (p[0] === 'course' && COURSE[p[1]]) return COURSE[p[1]].title;
    if (p[0] === 'frq') return 'FRQ practice' + (p[1] ? ' › ' + ((window.FRQS || []).find(f => f.id === p[1])?.title || '') : '');
    return p[0] ? p[0][0].toUpperCase() + p[0].slice(1) : 'Home';
  } catch (e) { return ''; }
}
function toggleMenu() {
  const ex = $('.menu'); if (ex) { ex.remove(); return; }
  const m = document.createElement('div'); m.className = 'menu'; m.setAttribute('role', 'menu');
  m.innerHTML = `<div style="padding:8px 12px"><b>${esc(S.profile.name || 'Student')}</b><br><small>${esc(myTitle())} · Level ${levelFor(S.xp)}</small></div><hr>
    ${signedIn() ? `<div class="menu-acct"><small class="muted">Signed in as</small><b>${esc(ACC.email)}</b>${ACC.owner ? '<span class="pill role-owner">👑 Owner</span>' : ACC.admin ? '<span class="pill role-admin">🛡 Admin</span>' : ''}</div>` : ''}${ACC.admin ? '<a href="#/admin" role="menuitem">🛡 Admin panel</a>' : ''}<a href="#/profile" role="menuitem">👤 Profile & badges</a><a href="#/practice" role="menuitem">🎯 Practice</a><a href="#/exam" role="menuitem">📝 AP Exam & FRQs</a><a href="#/assignments" role="menuitem">📋 Assignments</a><a href="#/class-notes" role="menuitem">🗒️ Class Notes</a><a href="#/glossary" role="menuitem">📖 Glossary</a><a href="#/settings" role="menuitem">🎨 Customize & settings</a><a href="#/feedback?from=${encodeURIComponent(pageLabel())}" role="menuitem">💬 Feedback</a><a href="#/help" role="menuitem">❓ Help & FAQ</a>`;
  document.body.appendChild(m);
  $('a', m).focus();
  const off = e => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', off); } };
  setTimeout(() => document.addEventListener('click', off), 0);
  m.addEventListener('click', e => { if (e.target.closest('a')) m.remove(); });
}
function footer() {
  return `<footer class="footer"><div class="cols"><div><b class="mono">CompSci-<span style="color:var(--accent)">Study</span></b><br>Made by students, for students. Free forever.</div>
  <div><a href="#/courses">Courses</a><a href="#/assignments">Assignments</a><a href="#/arcade">Arcade</a><a href="#/squad">Squad</a><a href="#/class-notes">Class Notes</a><a href="#/glossary">Glossary</a><a href="#/feedback">Feedback</a><a href="#/help">Help & FAQ</a><a href="#/settings">Settings</a></div></div></footer>`;
}

/* ---------- Search (button left of the streak counter, or press / or Ctrl+K) ---------- */
let SEARCH_INDEX = null;
function buildSearchIndex() {
  const idx = [];
  const add = (kind, icon, title, sub, href, text = '', boost = 0) => idx.push({ kind, icon, title, sub, href, t: title.toLowerCase(), s: (sub + ' ' + text).toLowerCase(), boost });
  for (const c of COURSES) {
    add('Course', c.emoji, c.title, `${c.short} · ${c.yearLabel}`, `#/course/${c.id}`, c.blurb, 3);
    c.units.forEach((u, ui) => {
      add('Unit', '📦', u.title, `${c.title} · Module ${ui + 1}${u.weight ? ' · AP ' + u.weight : ''}`, `#/course/${c.id}`, u.lessons.map(l => l.title).join(' '), 2);
      u.lessons.forEach((l, li) => add('Lesson', '📖', l.title, `${c.title} › ${u.title}`, `#/learn/${u.id}/${li}`, l.text.slice(0, 1500), 1));
      u.ex.forEach(e => add('Coding practice', '💻', e.title, `${c.title} › ${u.title}`, `#/ex/${e.id}`, e.prompt.replace(/<[^>]+>/g, ' '), 1));
      u.fill.forEach(f => add('Fill in the code', '🧩', f.title || 'Fill in the code', `${c.title} › ${u.title}`, `#/ex/${f.id}`, f.q, 0));
      add('Unit quiz', '📝', `${u.title}: unit quiz`, c.title, `#/quiz?mode=unit&units=${u.id}&types=quiz`, 'quiz test practice', 0);
      if (S.settings.bosses) add('Boss battle', '👹', `${(BOSSES[u.id] || ['Unit boss'])[0]} (boss)`, `${c.title} › ${u.title}`, `#/boss/${u.id}`, 'boss battle fight', -1);
    });
  }
  for (const n of (window.CLASS_NOTES || [])) { const u = UNIT[n.unit], c = u && COURSE[u.course]; add('Class notes', '🗒️', n.title, `${c ? c.title + ' › ' : ''}${u ? u.title : ''}`, `#/class-notes/${n.unit}`, n.text.slice(0, 1500), 2); }
  for (const f of (window.FRQS || [])) add('FRQ', '✍️', `FRQ: ${f.title}`, `AP CSA · Q${f.q} ${FRQ_TYPES[f.q]}`, `#/frq/${f.id}`, 'free response frq ' + f.scenario.replace(/<[^>]+>/g, ' ').slice(0, 600), 2);
  [['📝', 'AP CSA practice exams', 'Full exam, Section I, mini exam, unit tests', '#/exam', 'ap exam practice test mcq'],
   ['✍️', 'FRQ practice', 'All AP CSA free-response questions', '#/frq', 'frq free response'],
   ['🎯', 'Practice', 'Build a practice set, daily mix, review mistakes', '#/practice', 'quiz practice review'],
   ['🔄', 'Review my mistakes', 'Retry questions you missed', '#/quiz?mode=review', 'mistakes review'],
   ['🕹️', 'Arcade', 'Bug Hunt, Speed Round, Duels, Weekly challenge', '#/arcade', 'games bug hunt speed duel'],
   ['⚔️', '1v1 Duels', 'Duel ByteBot or a squadmate', '#/duel', 'duel versus'],
   ['📋', 'Assignments', 'Your plan and squad assignments', '#/assignments', 'homework due'],
   ['👥', 'Squad', 'Leaderboard, duels, question bank', '#/squad', 'friends leaderboard'],
   ['🗒️', 'Class Notes', 'Notes from class for every course, with questions', '#/class-notes', 'notes class notes cheat sheet print'],
   ['📖', 'Glossary', 'Every CS term in plain English', '#/glossary', 'glossary words definitions'],
   ['💬', 'Feedback', 'Send a suggestion or report a problem', '#/feedback', 'feedback suggestion bug'],
   ['🎨', 'Settings', 'Themes, colors, fonts, sound', '#/settings', 'theme customize settings'],
   ['👤', 'Profile & badges', 'Level, badges, stats', '#/profile', 'profile badges'],
  ].forEach(([i, t, s, h, x]) => add('Page', i, t, s, h, x, 1));
  for (const g of (window.GLOSSARY || [])) add('Glossary', '🔤', g.term, g.def, `#/glossary?q=${encodeURIComponent(g.term)}`, g.aliases.join(' '), -1);
  return idx;
}
function searchIndex(q) {
  SEARCH_INDEX = SEARCH_INDEX || buildSearchIndex();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean); if (!terms.length) return [];
  const out = [];
  for (const it of SEARCH_INDEX) {
    let score = 0, ok = true;
    for (const t of terms) {
      if (it.t.includes(t)) score += it.t.startsWith(t) || it.t.includes(' ' + t) ? 12 : 8;
      else if (it.s.includes(t)) score += 2;
      else { ok = false; break; }
    }
    if (ok) { if (it.t === q.toLowerCase()) score += 20; out.push([score + it.boost, it]); }
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, 40).map(x => x[1]);
}
function openSearch(initial = '') {
  const m = modal(`<div class="search-box"><input class="input" id="sq" type="search" placeholder="Search lessons, practices, units, FRQs, glossary…" value="${esc(initial)}" autocomplete="off" aria-label="Search" autofocus><div id="sr" class="search-results" role="listbox"></div><small class="muted">↑ ↓ to move · Enter to open · Esc to close</small></div>`, { wide: true });
  m.classList.add('search-modal');
  const inp = $('#sq', m), box = $('#sr', m); let sel = 0, res = [];
  const hl = s => { let h = esc(s); for (const t of inp.value.trim().split(/\s+/).filter(Boolean)) h = h.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), x => `<mark>${x}</mark>`); return h; };
  const draw = () => {
    const q = inp.value.trim();
    res = q ? searchIndex(q) : [];
    if (!q) { const ct = continueTarget(); box.innerHTML = `<div class="muted" style="padding:10px 4px">Try <b>if statements</b>, <b>ArrayList</b>, <b>binary search</b>, <b>FRQ</b> or <b>2D array</b>.</div><a class="sr-item" href="${ct.href}"><span class="sr-ic">▶</span><span><b>Continue: ${esc(ct.label)}</b><small>${esc(ct.c.title)}</small></span></a>`; return; }
    sel = Math.min(sel, Math.max(0, res.length - 1));
    box.innerHTML = res.length ? res.map((r, i) => `<a class="sr-item ${i === sel ? 'sel' : ''}" href="${r.href}" role="option" aria-selected="${i === sel}" data-i="${i}"><span class="sr-ic">${r.icon}</span><span style="min-width:0"><b>${hl(r.title)}</b><small>${esc(r.kind)} · ${esc(r.sub.slice(0, 90))}</small></span></a>`).join('') : `<div class="empty">No results for "${esc(q)}".</div>`;
    $$('.sr-item', box).forEach(a => a.addEventListener('click', () => closeModal()));
  };
  inp.oninput = () => { sel = 0; draw(); };
  inp.onkeydown = e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + res.length) % Math.max(1, res.length); draw(); $('.sr-item.sel', box)?.scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { const r = res[sel]; if (r) { closeModal(); location.hash = r.href.slice(1); } }
  };
  draw(); setTimeout(() => inp.focus(), 40);
}
document.addEventListener('keydown', e => {
  if ($('.modal')) return;
  if ((e.key === '/' && !e.target.matches('input,textarea,select,[contenteditable]')) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); }
});
