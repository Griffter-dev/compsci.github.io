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
  const com = lang === 'python' || lang === 'bash' ? '#.*' : lang === 'css' ? '\\/\\*[\\s\\S]*?\\*\\/' : lang === 'sql' ? '--.*' : '\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/';
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
    else if (lang === 'java' && /^[A-Z]/.test(all)) out += `<span class="tk-t">${esc(all)}</span>`;
    else out += esc(all);
  }
  return out + esc(code.slice(last));
}
const LANG_LABEL = { python: 'python', java: 'java', js: 'javascript', javascript: 'javascript', html: 'html', css: 'css', pseudo: 'AP pseudocode', bash: 'terminal', sql: 'sql', text: 'text', '': 'text' };
function codeBlock(code, lang, copy = true) {
  return `<pre class="code"><div class="chead"><span>${esc(LANG_LABEL[lang] || lang)}</span>${copy ? '<button type="button" data-copy>copy</button>' : ''}</div><code>${highlight(code, lang)}</code></pre>`;
}
// upgrade marked-rendered <pre><code class="language-x"> blocks
function enhanceCode(root) {
  $$('pre:not(.ed-hl):not(.console):not(.code) > code', root).forEach(el => {
    const pre = el.parentElement; if (pre.classList.contains('code')) return;
    const lang = (el.className.match(/language-([\w-]+)/) || [])[1] || 'text';
    const code = el.textContent.replace(/\n$/, '');
    if (/-(run|visual)$/.test(lang)) { const host = document.createElement('div'); pre.replaceWith(host); mountExample(host, code, lang.replace(/-(run|visual)$/, '').replace('javascript', 'js')); return; }
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
const DESK_NAV = [['/courses', 'Courses'], ['/practice', 'Practice'], ['/assignments', 'Assignments'], ['/arcade', 'Arcade'], ['/squad', 'Squad'], ['/notes', 'Notes']];
function renderChrome() {
  const p = (location.hash.slice(1) || '/').split('?')[0];
  const active = href => href === '/' ? p === '/' : p.startsWith(href) || (href === '/courses' && (p.startsWith('/course') || p.startsWith('/learn') || p.startsWith('/ex/') || p.startsWith('/unit-done')));
  const due = typeof dueBadgeCount === 'function' ? dueBadgeCount() : 0;
  const tag = h => h === '/arcade' ? '<span class="tag">2×</span>' : h === '/assignments' && due ? `<span class="tag due">${due}</span>` : '';
  const st = streakAlive(), L = levelFor(S.xp);
  $('#topbar').innerHTML = `
    <a class="logo" href="#/" aria-label="CompciStudy home"><span class="mark">&gt;_</span><span>Compci<b>Study</b></span></a>
    <nav class="navlinks" aria-label="Main">${DESK_NAV.map(([h, n]) => `<a href="#${h}" class="${active(h) ? 'on' : ''}">${n}${tag(h)}</a>`).join('')}</nav>
    <div class="topright">
      <span class="chip" title="Day streak">🔥 ${st}</span>
      <span class="chip xp" title="Level ${L}">⭐ ${fmtNum(S.xp)} XP · L${L}</span>
      <button class="iconbtn" id="me-btn" aria-label="Open profile menu" aria-haspopup="true">${avatarHtml(S.profile)}</button>
    </div>`;
  $('#tabbar').innerHTML = NAV.map(([h, n, i]) => `<a href="#${h}" class="${active(h) ? 'on' : ''}"><span class="i">${i}${h === '/assignments' && due ? `<span class="tbadge">${due}</span>` : ''}</span>${n}</a>`).join('');
  $('#me-btn').onclick = e => { e.stopPropagation(); toggleMenu(); };
  let tab = $('#fb-tab'); if (!tab) { tab = document.createElement('a'); tab.id = 'fb-tab'; tab.className = 'fb-tab noprint'; tab.innerHTML = '💬 Feedback'; document.body.appendChild(tab); }
  tab.classList.toggle('hidden', p.startsWith('/feedback') || p.startsWith('/exam/run'));
  tab.href = `#/feedback?from=${encodeURIComponent(pageLabel())}`;
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
    <a href="#/profile" role="menuitem">👤 Profile & badges</a><a href="#/practice" role="menuitem">🎯 Practice</a><a href="#/assignments" role="menuitem">📋 Assignments</a><a href="#/notes" role="menuitem">📝 Notes & cheat sheets</a><a href="#/glossary" role="menuitem">📖 Glossary</a><a href="#/settings" role="menuitem">🎨 Customize & settings</a><a href="#/feedback" role="menuitem">💬 Feedback</a><a href="#/help" role="menuitem">❓ Help & FAQ</a>`;
  document.body.appendChild(m);
  $('a', m).focus();
  const off = e => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', off); } };
  setTimeout(() => document.addEventListener('click', off), 0);
  m.addEventListener('click', e => { if (e.target.closest('a')) m.remove(); });
}
function footer() {
  return `<footer class="footer"><div class="cols"><div><b class="mono">Compci<span style="color:var(--accent)">Study</span></b><br>Made by students, for students. Free forever.</div>
  <div><a href="#/courses">Courses</a><a href="#/assignments">Assignments</a><a href="#/arcade">Arcade</a><a href="#/squad">Squad</a><a href="#/notes">Notes</a><a href="#/glossary">Glossary</a><a href="#/feedback">Feedback</a><a href="#/help">Help & FAQ</a><a href="#/settings">Settings</a></div></div></footer>`;
}
