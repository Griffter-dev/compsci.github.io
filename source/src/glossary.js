/* ================= Glossary: clickable terms in lessons + glossary page ================= */
const GLOSS = (window.GLOSSARY || []).map(g => ({ ...g, forms: [g.term, ...g.aliases] }));
const NO_AUTO = new Set(['value', 'values', 'type', 'types', 'block', 'blocks', 'return', 'returns', 'else', 'list', 'lists', 'index', 'bug', 'bugs', 'debug', 'mod', 'remainder', 'iterate', 'instance', 'instances', 'objects', 'object', 'int', 'str', 'dict', 'bool', 'indent', 'double', 'doubles', 'exception', 'exceptions', 'iteration', 'loop', 'loops', 'nesting', 'selection', 'array', 'arrays']);
const glossFind = word => { const w = word.toLowerCase(); return GLOSS.find(g => g.forms.some(f => f.toLowerCase() === w)); };
function linkGlossary(root) {
  if (!GLOSS.length) return;
  const used = new Set();
  const forms = GLOSS.flatMap(g => g.forms.filter(f => !NO_AUTO.has(f.toLowerCase())).map(f => [f, g])).sort((a, b) => b[0].length - a[0].length);
  const re = new RegExp('\\b(' + forms.map(([f]) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('code,pre,a,button,h1,h2,h3,h4,th,textarea,.lq,.iq,.gl,.choice,.explain,.example') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    let n = node;
    for (let guard = 0; guard < 6 && n; guard++) {
      const m = n.textContent.match(re); if (!m) break;
      const g = glossFind(m[1]); if (!g || used.has(g.term)) {
        // skip this match: split after it and keep scanning the rest
        const rest = n.splitText(m.index + m[1].length); n = rest; continue;
      }
      used.add(g.term);
      const mid = n.splitText(m.index), after = mid.splitText(m[1].length);
      const b = document.createElement('button'); b.className = 'gl'; b.type = 'button'; b.dataset.term = g.term; b.textContent = mid.textContent; b.setAttribute('aria-label', `${mid.textContent}: show definition`);
      mid.replaceWith(b); n = after;
    }
  }
}
function glossPop(btn) {
  $('.gl-pop')?.remove();
  const g = GLOSS.find(x => x.term === btn.dataset.term); if (!g) return;
  const pop = document.createElement('div'); pop.className = 'gl-pop'; pop.setAttribute('role', 'dialog');
  pop.innerHTML = `<b>${esc(g.term)}</b><p>${fmt(g.def)}</p><a href="#/glossary?q=${encodeURIComponent(g.term)}">Open glossary →</a>`;
  document.body.appendChild(pop);
  const r = btn.getBoundingClientRect(), w = Math.min(320, innerWidth - 20);
  pop.style.width = w + 'px'; pop.style.left = clamp(r.left + scrollX, 10, innerWidth - w - 10) + 'px'; pop.style.top = (r.bottom + scrollY + 8) + 'px';
}
document.addEventListener('click', e => {
  const b = e.target.closest('.gl'); if (b) { e.preventDefault(); glossPop(b); return; }
  if (!e.target.closest('.gl-pop')) $('.gl-pop')?.remove();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('.gl-pop')?.remove(); });
window.addEventListener('hashchange', () => $('.gl-pop')?.remove());

route('/glossary', (view, p) => {
  view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">// glossary</span><h1 style="font-size:2.2rem">Glossary</h1><p class="muted">Every CS word you'll meet, in plain English. In lessons, click any <button class="gl" type="button" data-term="variable">underlined word</button> to see its meaning.</p>
    <input class="input" id="g-q" type="search" placeholder="Search terms…" value="${esc(p.q || '')}" aria-label="Search glossary" style="font-size:1.05rem;padding:12px 14px;margin:8px 0 18px"><dl class="gloss" id="g-list"></dl></div>${footer()}`;
  const draw = () => {
    const q = $('#g-q', view).value.trim().toLowerCase();
    const list = GLOSS.filter(g => !q || g.forms.some(f => f.toLowerCase().includes(q)) || g.def.toLowerCase().includes(q)).sort((a, b) => a.term.localeCompare(b.term));
    $('#g-list', view).innerHTML = list.map(g => `<div class="card" style="padding:14px 16px"><dt><b>${esc(g.term)}</b>${g.aliases.length ? ` <small class="muted">· ${esc(g.aliases.slice(0, 4).join(', '))}</small>` : ''}</dt><dd style="margin:6px 0 0">${fmt(g.def)}</dd></div>`).join('') || '<div class="empty">No matching terms.</div>';
  };
  $('#g-q', view).oninput = draw; draw();
});
