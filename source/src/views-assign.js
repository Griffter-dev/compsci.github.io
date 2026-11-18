/* ================= Assignments (like JuiceMind): personal plan + squad assignments + gradebook ================= */
const KIND = { lesson: ['📖', 'Lesson'], ex: ['💻', 'Coding exercise'], fill: ['🧩', 'Fill in the code'], quiz: ['📝', 'Unit quiz (70%+)'], code: ['🐛', 'Code challenges (70%+)'], boss: ['👹', 'Boss battle'], unit: ['📦', 'Whole module'] };
function assignHref(a) {
  if (a.kind === 'lesson') { const [u, i] = a.ref.split(':'); return `#/learn/${u}/${i}`; }
  if (a.kind === 'ex' || a.kind === 'fill') return `#/ex/${a.ref}`;
  if (a.kind === 'quiz') return `#/quiz?mode=unit&units=${a.ref}&types=quiz`;
  if (a.kind === 'code') return `#/quiz?mode=unit&units=${a.ref}&types=trace,bug,fill`;
  if (a.kind === 'boss') return `#/boss/${a.ref}`;
  const u = UNIT[a.ref]; return u ? (unitItems(u).find(x => !itemDoneAt(x)) || unitItems(u)[0]).href : '#/';
}
function assignDoneAt(a) {
  switch (a.kind) {
    case 'lesson': return S.lessons[a.ref] || null;
    case 'ex': return S.exercises[a.ref]?.at || null;
    case 'fill': return S.fills[a.ref]?.at || null;
    case 'quiz': return S.units[a.ref]?.quizAt || null;
    case 'code': return S.units[a.ref]?.codeAt || null;
    case 'boss': return S.units[a.ref]?.boss || null;
    case 'unit': { const u = UNIT[a.ref]; return u && unitDone(u) ? Math.max(...unitItems(u).map(itemDoneAt)) : null; }
  }
  return null;
}
const assignScore = a => a.kind === 'quiz' ? S.units[a.ref]?.quizBest : a.kind === 'code' ? S.units[a.ref]?.codeBest : null;
function dueText(due, doneAt) {
  if (!due) return 'No due date';
  const d = new Date(due), now = Date.now(), days = Math.round((new Date(today(d)) - new Date(today())) / 86400000);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (doneAt) return doneAt > due ? `Turned in late (due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })})` : `Done ✓ (due ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
  if (due < now) { const late = Math.max(0, -days); return late ? `Overdue by ${late} day${late === 1 ? '' : 's'}` : `Was due today at ${time}`; }
  if (days === 0) return `Due today at ${time}`;
  if (days === 1) return `Due tomorrow at ${time}`;
  if (days < 7) return `Due ${d.toLocaleDateString([], { weekday: 'long' })} at ${time}`;
  return `Due ${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;
}
function dueList() {
  const all = [...(S.plan || []).map(a => ({ ...a, src: 'plan' })), ...(squadState().inSquad ? (S.squadAssign || []).map(a => ({ ...a, src: 'squad' })) : [])];
  return all.filter(a => a.kind === 'unit' || a.kind === 'quiz' || a.kind === 'code' || a.kind === 'boss' ? UNIT[a.ref] : a.kind === 'lesson' ? UNIT[a.ref.split(':')[0]] : (EX[a.ref] || Q[a.ref])).map(a => {
    const doneAt = assignDoneAt(a), now = Date.now();
    return { ...a, done: !!doneAt, doneAt, late: !!(doneAt && a.due && doneAt > a.due), overdue: !doneAt && a.due && a.due < now, soon: !doneAt && a.due && a.due - now < 3 * 86400000,
      icon: KIND[a.kind]?.[0] || '📌', href: assignHref(a), dueText: dueText(a.due, doneAt), from: a.src === 'plan' ? 'My plan' : `Squad · from ${a.byName || 'leader'}`, score: assignScore(a) };
  }).sort((x, y) => (x.done - y.done) || ((x.due || 9e15) - (y.due || 9e15)));
}
const dueBadgeCount = () => { try { return dueList().filter(a => !a.done && (a.overdue || a.soon)).length; } catch (e) { return 0; } };

/* ---------- Assign picker ---------- */
function assignPicker(pre = {}) {
  const ss = squadState(), canSquad = ss.inSquad && ss.isLeader && FB.status === 'ok';
  const d = new Date(); d.setDate(d.getDate() + 7);
  const m = modal(`<h2>📌 Assign</h2><p class="muted">${canSquad ? 'Add it to your own plan, or assign it to everyone in your squad.' : 'Add it to your study plan with a due date. Squad leaders can also assign work to the whole squad.'}</p>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Course</span><select class="input" id="a-c">${COURSES.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.title)}</option>`).join('')}</select></label><label class="field"><span>Module</span><select class="input" id="a-u"></select></label></div>
    <label class="field"><span>What to do</span><select class="input" id="a-i"></select></label>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Due date</span><input class="input" type="date" id="a-d" value="${today(d)}"></label><label class="field"><span>Time</span><input class="input" type="time" id="a-t" value="23:59"></label></div>
    <label class="toggle" style="border:0;padding-top:0"><span>No due date</span><span class="switch"><input type="checkbox" id="a-nodue"><span></span></span></label>
    <label class="field"><span>Note (optional)</span><input class="input" id="a-n" maxlength="140" placeholder="e.g. Finish before Friday's quiz!"></label>
    ${canSquad ? `<fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:600;margin-bottom:6px">Assign to</legend><label class="row" style="gap:8px;margin-bottom:6px"><input type="radio" name="a-who" value="squad" checked> 👥 Everyone in ${esc(ss.name || 'my squad')}</label><label class="row" style="gap:8px"><input type="radio" name="a-who" value="plan"> 📋 Just me (my plan)</label></fieldset>` : ''}
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-x>Cancel</button><button class="btn primary" id="a-save">Assign</button></div>`, { wide: true });
  const cSel = $('#a-c', m), uSel = $('#a-u', m), iSel = $('#a-i', m);
  const fillUnits = () => { const c = COURSE[cSel.value]; uSel.innerHTML = c.units.map((u, i) => `<option value="${u.id}">Module ${i + 1}: ${esc(u.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, ''))}</option>`).join(''); };
  const fillItems = () => { const u = UNIT[uSel.value]; iSel.innerHTML = [`<option value="unit|${u.id}">📦 Whole module (all lessons + exercises)</option>`, ...unitItems(u).map(it => `<option value="${it.k}|${it.key}">${it.icon} ${esc(it.title)}</option>`), `<option value="quiz|${u.id}">📝 Unit quiz (score 70%+)</option>`, u.trace.length + u.bug.length + u.fill.length ? `<option value="code|${u.id}">🐛 Code challenges (score 70%+)</option>` : '', S.settings.bosses ? `<option value="boss|${u.id}">👹 Boss battle</option>` : ''].join(''); };
  if (pre.course) cSel.value = pre.course; fillUnits(); if (pre.unit) uSel.value = pre.unit; fillItems();
  if (pre.kind && pre.ref) iSel.value = `${pre.kind}|${pre.ref}`;
  cSel.onchange = () => { fillUnits(); fillItems(); }; uSel.onchange = fillItems;
  $('#a-nodue', m).onchange = e => { $('#a-d', m).disabled = $('#a-t', m).disabled = e.target.checked; };
  $('[data-x]', m).onclick = closeModal;
  $('#a-save', m).onclick = async () => {
    const [kind, ref] = iSel.value.split('|');
    const due = $('#a-nodue', m).checked ? null : new Date(`${$('#a-d', m).value}T${$('#a-t', m).value || '23:59'}`).getTime();
    if (due != null && isNaN(due)) return toast('Pick a valid due date');
    const u = UNIT[kind === 'lesson' ? ref.split(':')[0] : (EX[ref]?.unit || Q[ref]?.unit || ref)];
    const label = iSel.selectedOptions[0].textContent.replace(/^\S+\s/, '').replace(/\s*\(score 70%\+\)/, '');
    const a = { kind, ref, course: u.course, unit: u.id, title: kind === 'unit' ? `${u.title}` : kind === 'quiz' || kind === 'code' || kind === 'boss' ? `${label}: ${u.title.replace(/^(Unit \d+|Big Idea \d+):\s*/, '')}` : label, due, note: $('#a-n', m).value.trim() };
    const who = $('input[name=a-who]:checked', m)?.value || 'plan';
    try {
      if (who === 'squad') { await createAssignment(a); toast('Assigned to your squad 👥', a.title); }
      else { S.plan.push({ ...a, id: 'p-' + Date.now().toString(36), created: Date.now() }); save(); toast('Added to your plan 📋', a.title); }
      closeModal(); renderChrome(); if (location.hash.startsWith('#/assignments')) render();
    } catch (e) { toast('Could not assign', e.message); }
  };
}

/* ---------- Assignments page ---------- */
route('/assignments', (view, p) => {
  const ss = squadState(), lead = ss.inSquad && ss.isLeader && FB.status === 'ok';
  const tab = p.tab === 'grades' && lead ? 'grades' : 'list';
  view.innerHTML = `<div class="wrap"><div class="spread"><div><span class="eyebrow">// assignments</span><h1 style="font-size:2.2rem;margin:0">Assignments</h1></div><button class="btn primary" onclick="assignPicker()">＋ ${lead ? 'Assign' : 'Add to my plan'}</button></div>
    <p class="muted">${ss.inSquad ? `Work from ${esc(ss.name || 'your squad')}'s leader shows up here next to your own plan. Items check themselves off when you finish them.` : 'Plan your studying: add lessons, exercises or quizzes with due dates. If you join a squad, work your squad leader assigns shows up here too.'}</p>
    ${lead ? `<div class="tabs"><button class="${tab === 'list' ? 'on' : ''}" onclick="go('/assignments')">📋 My list</button><button class="${tab === 'grades' ? 'on' : ''}" onclick="go('/assignments?tab=grades')">📊 Gradebook</button></div>` : ''}
    <div id="as-body"></div></div>${footer()}`;
  const body = $('#as-body', view);
  if (tab === 'grades') return gradebook(body);
  const draw = () => {
    const list = dueList();
    const groups = [['🔴 Overdue', list.filter(a => a.overdue)], ['⏳ Upcoming', list.filter(a => !a.done && !a.overdue && a.due)], ['🗂️ No due date', list.filter(a => !a.done && !a.due)], ['✅ Done', list.filter(a => a.done)]];
    body.innerHTML = list.length ? groups.filter(g => g[1].length).map(([h, items]) => `<h3 style="margin-top:22px">${h} <small class="muted mono">${items.length}</small></h3><div class="stack">${items.map(a => assignRow(a, lead)).join('')}</div>`).join('')
      : `<div class="empty card"><span class="big">📋</span><h3>Nothing assigned yet</h3><p>Plan your week: pick lessons or exercises and give them due dates.</p><button class="btn primary" onclick="assignPicker()">＋ Add to my plan</button></div>`;
    $$('[data-del]', body).forEach(b => b.onclick = async () => {
      const [src, id] = b.dataset.del.split('|');
      if (!(await confirmBox('Remove this assignment?', src === 'squad' ? 'This removes it for everyone in the squad.' : 'It will be removed from your plan.', 'Remove'))) return;
      if (src === 'plan') { S.plan = S.plan.filter(x => x.id !== id); save(); draw(); renderChrome(); }
      else deleteAssignment(id).then(() => toast('Removed')).catch(e => toast('Error', e.message));
    });
  };
  draw();
  if (ss.inSquad) { assignListeners.add(draw); onLeave(() => assignListeners.delete(draw)); startAssignSync(); }
});
function assignRow(a, lead) {
  const c = COURSE[a.course];
  return `<div class="card as-row ${a.overdue ? 'overdue' : ''} ${a.done ? 'done' : ''}"><span class="as-ic">${a.done ? '✅' : a.icon}</span>
    <div style="flex:1;min-width:0"><b style="display:block">${esc(a.title)}</b><small class="muted">${c ? c.emoji + ' ' + esc(c.title) + ' · ' : ''}${esc(KIND[a.kind]?.[1] || '')}${a.score != null ? ` · best ${Math.round(a.score * 100)}%` : ''}</small>
      ${a.note ? `<div class="as-note">“${esc(a.note)}”</div>` : ''}
      <div class="row" style="gap:6px;margin-top:6px"><span class="pill ${a.overdue ? 'bad' : a.late ? 'warn' : a.done ? 'accent' : ''}">${esc(a.dueText)}</span><span class="pill">${a.src === 'plan' ? '📋' : '👥'} ${esc(a.from)}</span></div></div>
    <div class="row" style="flex:none">${a.done ? `<a class="btn sm ghost" href="${a.href}">Review</a>` : `<a class="btn sm primary" href="${a.href}">Start →</a>`}${a.src === 'plan' || lead ? `<button class="btn sm ghost" data-del="${a.src}|${esc(a.id)}" aria-label="Remove">🗑</button>` : ''}</div></div>`;
}
function gradebook(body) {
  body.innerHTML = '<p class="muted">Loading the gradebook…</p>';
  let members = null;
  const draw = () => {
    if (!members) return;
    const as = (S.squadAssign || []).slice().sort((a, b) => (a.due || 9e15) - (b.due || 9e15));
    if (!as.length) { body.innerHTML = `<div class="empty card"><span class="big">📊</span><h3>No squad assignments yet</h3><p>Assign a lesson, exercise or quiz to your squad and track who finished it here.</p><button class="btn primary" onclick="assignPicker()">＋ Assign</button></div>`; return; }
    const cell = (m, a) => { const r = m.assign?.[a.id]; if (!r) return a.due && a.due < Date.now() ? '<td class="gb-miss" title="Missing">✗</td>' : '<td class="gb-none">–</td>'; const late = a.due && r.at > a.due; return `<td class="${late ? 'gb-late' : 'gb-ok'}" title="${late ? 'Late' : 'On time'} · ${new Date(r.at).toLocaleString()}">${r.s != null ? Math.round(r.s * 100) + '%' : '✓'}${late ? '<sup>late</sup>' : ''}</td>`; };
    body.innerHTML = `<div class="card" style="overflow-x:auto;padding:0"><table class="gb"><thead><tr><th>Student</th>${as.map(a => `<th title="${esc(a.title)}"><span>${KIND[a.kind]?.[0] || ''} ${esc(a.title.length > 26 ? a.title.slice(0, 24) + '…' : a.title)}</span><small>${a.due ? new Date(a.due).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'no due date'} · ${members.filter(m => m.assign?.[a.id]).length}/${members.length} done</small></th>`).join('')}</tr></thead>
      <tbody>${members.map(m => `<tr><td class="gb-name">${avatarHtml(m, 'sm')} ${esc(m.name)}</td>${as.map(a => cell(m, a)).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="muted"><small>✓ done on time · <span style="color:var(--warn)">late</span> turned in after the due date · <span style="color:var(--bad)">✗</span> missing and past due · – not done yet. Quiz and code-challenge cells show the best score. Each student's app updates this automatically.</small></p>`;
  };
  const un = subMembers(list => { if (list) { members = list.sort((a, b) => a.name.localeCompare(b.name)); draw(); } });
  assignListeners.add(draw); onLeave(() => { un(); assignListeners.delete(draw); });
  startAssignSync();
}
