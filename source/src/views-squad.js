/* ================= Squad UI + live duel ================= */
route('/squad', (view, p) => {
  const ss = squadState();
  const head = `<span class="eyebrow">// squad</span><h1 style="font-size:2.2rem">Squad</h1>`;
  if (!ss.configured) {
    view.innerHTML = `<div class="wrap narrow">${head}<div class="notice warn"><b>Squad features aren't switched on for this site yet.</b><p class="muted" style="margin:6px 0 0">Whoever set up this CompSci-Study site needs to connect a free Firebase database (about 20 minutes, once). The steps are in <b>SETUP.md</b> in the GitHub repo, under "Turn on squads".</p></div>
      <div class="card" style="margin-top:16px"><h3>Meanwhile, you can still:</h3><ul><li>Study every course, quiz and code challenge</li><li>Duel <a href="#/duel">ByteBot</a> in the arcade</li><li>Play the <a href="#/weekly">weekly challenge</a></li></ul></div></div>`;
    return;
  }
  if (ss.status === 'loading' || ss.status === 'off') { view.innerHTML = `<div class="wrap narrow">${head}<p class="muted">Connecting to the squad server…</p></div>`; fbInit(); return; }
  if (ss.status === 'error') {
    view.innerHTML = `<div class="wrap narrow">${head}<div class="notice warn"><b>Can't reach the squad server right now.</b><p class="muted" style="margin:6px 0 10px">Your school's network may be blocking Firebase (Google's database service), or you might be offline. Everything else in CompSci-Study still works. Try again from home, or ask your teacher about allowing <code>firestore.googleapis.com</code>.</p><small class="muted">Details: ${esc(ss.err)}</small></div><button class="btn primary" style="margin-top:14px" id="retry">Try again</button></div>`;
    $('#retry', view).onclick = () => { fbReady = null; FB.status = 'off'; fbInit(); render(); };
    return;
  }
  if (!FB.uid) {
    view.innerHTML = `<div class="wrap narrow">${head}<div class="card"><h3>🔐 Sign in to use squads</h3><p class="muted">Squads, leaderboards and duels need an account so your friends know it's really you.</p><button class="btn primary" id="sq-in">Sign in or create an account</button></div></div>`;
    $('#sq-in', view).onclick = () => { if (S.account?.skip) { S.account = null; save(); } showAuthGate(); };
    return;
  }
  if (!ss.inSquad) return squadJoinView(view, p, head);
  squadHome(view, p);
});

function squadJoinView(view, p, head) {
  view.innerHTML = `<div class="wrap narrow">${head}<p class="muted">A squad is your study group. You get a live leaderboard, 1v1 duels, a shared question bank and weekly challenges. Share the 6-character code with friends.</p>
    <div class="grid g2" style="margin-top:20px">
      <form class="card" id="f-join"><h3>🔑 Join a squad</h3><label class="field"><span>Squad code</span><input class="input mono" id="j-code" placeholder="K7Q-2MX" maxlength="8" value="${esc(fmtCode(normCode(p.join || '')))}" autocomplete="off" style="font-size:1.3rem;letter-spacing:.1em;text-transform:uppercase"></label><button class="btn primary" style="width:100%">Join squad</button></form>
      <form class="card" id="f-create"><h3>✨ Create a squad</h3><label class="field"><span>Squad name</span><input class="input" id="c-name" placeholder="The Recursive Rockets" maxlength="40"></label><button class="btn" style="width:100%">Create & become leader</button></form>
    </div>
    <p class="muted" style="margin-top:14px"><small>You'll show up to your squad as <b>${esc(S.profile.name || 'Student')}</b> ${S.profile.avatar}. You can change that in your <a href="#/profile">profile</a>. Never use your full real name.</small></p></div>`;
  $('#f-join', view).onsubmit = async e => { e.preventDefault(); const b = $('button', e.target); b.disabled = true; b.textContent = 'Joining…'; try { await joinSquad($('#j-code', view).value); toast('Welcome to the squad! 👥'); go('/squad'); } catch (err) { toast('Could not join', err.message); b.disabled = false; b.textContent = 'Join squad'; } };
  $('#f-create', view).onsubmit = async e => { e.preventDefault(); const n = $('#c-name', view).value.trim(); if (!n) return toast('Give your squad a name'); const b = $('button', e.target); b.disabled = true; b.textContent = 'Creating…'; try { const code = await createSquad(n); toast(`Squad created: ${fmtCode(code)}`, 'Share the code with your friends!'); go('/squad'); } catch (err) { toast('Could not create squad', err.message); b.disabled = false; b.textContent = 'Create & become leader'; } };
}

function squadHome(view, p) {
  const tab = p.tab || 'board';
  const link = `${location.origin}${location.pathname}#/squad?join=${S.squad.code}`;
  view.innerHTML = `<div class="wrap">
    <div class="spread" style="align-items:flex-start"><div><span class="eyebrow">// squad</span><h1 style="font-size:2.2rem;margin-bottom:6px">${esc(S.squad.name || 'Squad')}</h1>
      <div class="row"><span class="pill accent" style="font-size:1rem;padding:5px 14px">${fmtCode(S.squad.code)}</span><button class="btn sm" id="copy-code">Copy invite link</button>${squadState().isLeader ? '<span class="pill">👑 You\'re the leader</span>' : ''}<span class="pill" id="m-count">… members</span></div></div>
      <a class="btn primary" href="#/duel">⚔️ Duel</a></div>
    <div class="tabs" style="margin-top:22px" role="tablist">${[['board', '🏆 Leaderboard'], ['duels', '⚔️ Duels'], ['bank', '✍️ Question bank'], ['weekly', `${EVENT.emoji} Weekly`], ['manage', '⚙️ Squad settings']].map(([k, l]) => `<button role="tab" class="${tab === k ? 'on' : ''}" onclick="go('/squad?tab=${k}')">${l}</button>`).join('')}</div>
    <div id="sq-body"><p class="muted">Loading…</p></div></div>`;
  $('#copy-code', view).onclick = () => { const txt = `Join my CompSci-Study squad "${S.squad.name}"! Code: ${fmtCode(S.squad.code)}\n${link}`; navigator.clipboard?.writeText(txt).then(() => toast('Invite copied!', 'Paste it in your group chat.'), () => modal(`<h3>Invite link</h3><textarea class="input" readonly>${esc(txt)}</textarea>`)); };
  const body = $('#sq-body', view);
  const mUn = subMembers((list) => { if (list) $('#m-count', view) && ($('#m-count', view).textContent = `${list.length} member${list.length === 1 ? '' : 's'}`); });
  onLeave(mUn);
  ({ board: tabBoard, duels: tabDuels, bank: tabBank, weekly: tabWeekly, manage: tabManage }[tab] || tabBoard)(body, p);
}

function tabBoard(body, p) {
  let metric = p.m || 'week';
  const w = isoWeek().id;
  const un = subMembers((list, err) => {
    if (!list) { body.innerHTML = `<div class="notice warn">Couldn't load members: ${esc(err?.message || '')}</div>`; return; }
    list = list.map(m => ({ ...m, wk: m.week === w ? (m.weekXp || 0) : 0 }));
    const val = m => metric === 'week' ? m.wk : metric === 'all' ? m.xp || 0 : metric === 'streak' ? m.streak || 0 : m.bosses || 0;
    const unit = { week: 'XP', all: 'XP', streak: '🔥', bosses: '👹' }[metric];
    list.sort((a, b) => val(b) - val(a));
    const total = list.reduce((n, m) => n + m.wk, 0), goal = Math.max(500, list.length * 400);
    body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;align-items:start">
      <div class="card"><div class="tabs" style="margin-bottom:12px">${[['week', 'This week'], ['all', 'All-time XP'], ['streak', 'Streaks'], ['bosses', 'Bosses']].map(([k, l]) => `<button class="${metric === k ? 'on' : ''}" data-m="${k}">${l}</button>`).join('')}</div>
        <ol class="lb">${list.map((m, i) => `<li class="${m.id === FB.uid ? 'me' : ''}"><span class="rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>${avatarHtml(m)}<span class="who"><b>${esc(m.name)}${m.id === S.squad.owner ? ' 👑' : ''}</b><small class="muted">L${m.level || 1} · ${esc(m.title || '')} · ${timeAgo(m.lastActive)}</small></span><span class="val">${fmtNum(val(m))} ${unit}</span></li>`).join('') || '<li>No members yet</li>'}</ol></div>
      <div class="stack"><div class="card"><span class="eyebrow">// squad goal · ${esc(w)}</span><h3>Earn ${fmtNum(goal)} XP together this week</h3><div class="bar" style="height:14px;margin:12px 0"><i style="width:${Math.min(100, total / goal * 100)}%"></i></div><p class="muted" style="margin:0">${fmtNum(total)} / ${fmtNum(goal)} XP ${total >= goal ? '🎉 Goal smashed!' : `· ${fmtNum(goal - total)} to go`}</p></div>
        <div class="card"><h3>Your stats</h3><div class="stats" style="gap:24px"><div class="stat"><b>${fmtNum(thisIsoWeekXP())}</b><span>XP this week</span></div><div class="stat"><b>${streakAlive()}🔥</b><span>streak</span></div><div class="stat"><b>L${levelFor(S.xp)}</b><span>level</span></div></div></div></div></div>`;
    $$('[data-m]', body).forEach(b => b.onclick = () => { metric = b.dataset.m; un(); tabBoard(body, { m: metric }); });
  });
  onLeave(un);
  writeMember();
}

function tabDuels(body) {
  body.innerHTML = `<div class="card" style="margin-bottom:16px"><div class="spread"><div><h3>Start a live duel</h3><small class="muted">7 questions, same for both players. The fastest correct answers win.</small></div><div class="row"><select class="input" id="ld-course" style="width:auto"><option value="mine">🎒 My courses</option><option value="all">🌐 All courses</option>${COURSES.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.title)}</option>`).join('')}</select><button class="btn primary" id="ld-go">Create duel</button></div></div></div><div id="dl"><p class="muted">Loading duels…</p></div>`;
  $('#ld-go', body).onclick = () => createLiveDuel($('#ld-course', body).value);
  const un = subDuels((list, err) => {
    const el = $('#dl', body); if (!el) return;
    if (!list) { el.innerHTML = `<div class="notice warn">Couldn't load duels: ${esc(err?.message || '')}</div>`; return; }
    const fresh = d => Date.now() - (d.created || 0) < 30 * 60 * 1000;
    const open = list.filter(d => d.status === 'open' && fresh(d)), live = list.filter(d => d.status === 'live' && fresh(d)), done = list.filter(d => d.status === 'done').slice(0, 8);
    const row = (d, btn) => `<li><span class="rank">⚔️</span><span class="who"><b>${esc(d.hostName)} ${d.guestName ? 'vs ' + esc(d.guestName) : ''}</b><small class="muted">${esc(COURSE[d.course]?.title || (d.course === 'all' ? 'All courses' : 'Mixed'))} · ${timeAgo(d.created)}</small></span>${btn}</li>`;
    el.innerHTML = `<h3>Open duels</h3><ul class="lb">${open.map(d => row(d, d.host === FB.uid ? `<a class="btn sm" href="#/live/${d.id}">Waiting…</a>` : `<a class="btn sm primary" href="#/live/${d.id}?join=1">Join</a>`)).join('') || '<li class="muted">No open duels. Create one above!</li>'}</ul>
      ${live.length ? `<h3 style="margin-top:20px">Live now</h3><ul class="lb">${live.map(d => row(d, `<span class="val">${d.hs}-${d.gs}</span> <a class="btn sm" href="#/live/${d.id}">${d.host === FB.uid || d.guest === FB.uid ? 'Rejoin' : 'Watch'}</a>`)).join('')}</ul>` : ''}
      ${done.length ? `<h3 style="margin-top:20px">Recent results</h3><ul class="lb">${done.map(d => row(d, `<span class="val">${d.hs > d.gs ? '🏆 ' + esc(d.hostName) : d.gs > d.hs ? '🏆 ' + esc(d.guestName) : '🤝 tie'} · ${d.hs}-${d.gs}</span>`)).join('')}</ul>` : ''}`;
  });
  onLeave(un);
}

function tabBank(body) {
  const lead = squadState().isLeader;
  body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;align-items:start">
    <form class="card" id="qf"><h3>✍️ Write a question</h3><p class="muted"><small>${lead ? 'As leader, your questions go straight into the bank.' : 'The squad leader approves questions before they appear for everyone.'}</small></p>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><label class="field"><span>Course</span><select class="input" id="qf-c">${COURSES.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.short)}</option>`).join('')}</select></label><label class="field"><span>Unit</span><select class="input" id="qf-u"></select></label></div>
      <label class="field"><span>Question</span><textarea class="input" id="qf-q" required maxlength="400" style="font-family:var(--font)" placeholder="What does 17 % 5 evaluate to?"></textarea></label>
      <details><summary class="muted" style="cursor:pointer;margin-bottom:10px">+ Add a code snippet (optional)</summary><label class="field"><span>Language</span><select class="input" id="qf-l"><option value="python">Python</option><option value="java">Java</option><option value="js">JavaScript</option><option value="html">HTML</option><option value="css">CSS</option><option value="pseudo">AP pseudocode</option><option value="text">Plain text</option></select></label><label class="field"><span>Code</span><textarea class="input" id="qf-code" maxlength="1200"></textarea></label></details>
      <fieldset style="border:0;padding:0;margin:0 0 14px"><legend style="font-weight:600;margin-bottom:6px">Answers (pick the correct one)</legend>${[0, 1, 2, 3].map(i => `<div class="row" style="margin-bottom:8px;flex-wrap:nowrap"><input type="radio" name="qf-a" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="Answer ${i + 1} is correct"><input class="input" id="qf-a${i}" maxlength="160" placeholder="Answer ${i + 1}${i > 1 ? ' (optional)' : ''}" ${i < 2 ? 'required' : ''}></div>`).join('')}</fieldset>
      <label class="field"><span>Explanation</span><input class="input" id="qf-why" maxlength="300" placeholder="Why is that the answer?"></label>
      <button class="btn primary" style="width:100%">Submit question</button></form>
    <div><div class="spread"><h3>Squad bank</h3><a class="btn sm primary" href="#/quiz?mode=squad">Practice all →</a></div><div id="bank-list"><p class="muted">Loading…</p></div></div></div>`;
  const units = () => { $('#qf-u', body).innerHTML = COURSE[$('#qf-c', body).value].units.map(u => `<option value="${u.id}">${esc(u.title)}</option>`).join(''); };
  units(); $('#qf-c', body).onchange = units;
  $('#qf', body).onsubmit = async e => {
    e.preventDefault();
    const choices = [0, 1, 2, 3].map(i => $(`#qf-a${i}`, body).value.trim());
    let a = +$('input[name=qf-a]:checked', body).value;
    if (!choices[a]) return toast('The correct answer is empty', 'Fill it in or pick another one.');
    const kept = choices.map((c, i) => [c, i]).filter(([c]) => c); a = kept.findIndex(([, i]) => i === a);
    const code = $('#qf-code', body).value.replace(/\s+$/, '');
    const b = $('#qf button.primary', body); b.disabled = true;
    try {
      await addSquadQuestion({ course: $('#qf-c', body).value, unit: $('#qf-u', body).value, q: $('#qf-q', body).value.trim(), code, lang: code ? $('#qf-l', body).value : '', choices: kept.map(([c]) => c), a, why: $('#qf-why', body).value.trim() });
      toast(lead ? 'Question added to the bank ✅' : 'Question submitted for approval ✍️'); e.target.reset(); units();
    } catch (err) { toast('Could not submit', err.message); }
    b.disabled = false;
  };
  const draw = all => {
    const el = $('#bank-list', body); if (!el) return;
    const pending = all.filter(q => q.status === 'pending' && (lead || q.author === FB.uid));
    const ok = all.filter(q => q.status === 'approved');
    const card = (q, actions) => `<div class="card" style="padding:14px;margin-top:10px"><small class="muted">${COURSE[q.course]?.emoji || ''} ${esc(UNIT[q.unit]?.title || '')} · by ${esc(q.authorName)}${q.reports.length ? ` · ⚠️ ${q.reports.length} report${q.reports.length > 1 ? 's' : ''}` : ''}</small><div style="font-weight:600;margin:4px 0">${fmt(q.q)}</div>${q.code ? codeBlock(q.code, q.lang, false) : ''}<ol style="margin:6px 0;padding-left:1.3em">${q.choices.map((c, i) => `<li ${i === q.a ? 'style="color:var(--ok);font-weight:700"' : ''}>${fmt(c)}</li>`).join('')}</ol><div class="row">${actions}</div></div>`;
    el.innerHTML = `${pending.length ? `<h4 style="margin-top:12px">${lead ? '⏳ Waiting for your approval' : '⏳ Your pending questions'}</h4>${pending.map(q => card(q, lead ? `<button class="btn sm primary" data-ap="${q.docId}">Approve</button><button class="btn sm danger" data-del="${q.docId}">Reject</button>` : '<small class="muted">Waiting for the leader…</small>')).join('')}` : ''}
      ${ok.length ? ok.map(q => card(q, `${q.reports.length >= 3 ? '<small class="muted">Hidden after 3 reports</small>' : ''}${!q.reports.includes(FB.uid) && q.author !== FB.uid ? `<button class="btn sm ghost" data-rep="${q.docId}">⚠️ Report</button>` : ''}${lead || q.author === FB.uid ? `<button class="btn sm ghost" data-del="${q.docId}">🗑 Delete</button>` : ''}`)).join('') : '<div class="empty"><span class="big">🫙</span>No questions yet. Write the first one!</div>'}`;
    $$('[data-ap]', el).forEach(b => b.onclick = () => approveQ(b.dataset.ap).then(() => toast('Approved')).catch(e => toast('Error', e.message)));
    $$('[data-del]', el).forEach(b => b.onclick = async () => { if (await confirmBox('Delete this question?', 'This removes it for everyone.', 'Delete')) deleteQ(b.dataset.del).catch(e => toast('Error', e.message)); });
    $$('[data-rep]', el).forEach(b => b.onclick = async () => { if (await confirmBox('Report this question?', 'Report it if it\'s wrong, mean or spam. Questions with 3 reports get hidden.', 'Report')) reportQ(b.dataset.rep).then(() => toast('Reported. Thanks!')).catch(e => toast('Error', e.message)); });
  };
  bankListeners.add(draw); onLeave(() => bankListeners.delete(draw));
  startBankSync();
  FB.f.getDocs(fcol(...sqPath(), 'questions')).then(s => draw(s.docs.map(d => normSquadQ(d.id, d.data())))).catch(e => { const el = $('#bank-list', body); if (el) el.innerHTML = `<div class="notice warn">${esc(e.message)}</div>`; });
}

function tabWeekly(body) {
  body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;align-items:start"><div class="event"><div class="big">${EVENT.emoji}</div><h2>${esc(EVENT.name)}</h2><p class="muted">${esc(EVENT.blurb)}</p><a class="btn primary" href="#/weekly">${S.weekly[EVENT.week] ? 'Beat your score' : 'Play now'} →</a></div><div class="card"><h3>Squad scores · ${esc(EVENT.week)}</h3><div id="wk"><p class="muted">Loading…</p></div></div></div>`;
  const un = subWeekly((list, err) => {
    const el = $('#wk', body); if (!el) return;
    if (!list) { el.innerHTML = `<div class="notice warn">${esc(err?.message || 'Error')}</div>`; return; }
    list.sort((a, b) => b.score - a.score);
    el.innerHTML = list.length ? `<ol class="lb">${list.map((m, i) => `<li class="${m.uid === FB.uid ? 'me' : ''}"><span class="rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>${avatarHtml(m, 'sm')}<span class="who"><b>${esc(m.name)}</b><small class="muted">${m.correct}/10 correct</small></span><span class="val">${m.score}</span></li>`).join('')}</ol>` : '<div class="empty">Nobody has played this week yet. Be the first!</div>';
  });
  onLeave(un);
}

function tabManage(body) {
  const lead = squadState().isLeader;
  body.innerHTML = `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;align-items:start">
    <div class="card"><h3>Squad</h3>${lead ? `<label class="field"><span>Squad name</span><div class="row" style="flex-wrap:nowrap"><input class="input" id="sq-name" value="${esc(S.squad.name)}" maxlength="40"><button class="btn" id="sq-rename">Save</button></div></label>` : `<p>Name: <b>${esc(S.squad.name)}</b></p>`}
      <p class="muted"><small>Squad code: <b class="mono">${fmtCode(S.squad.code)}</b>. Anyone with this code can join.</small></p><button class="btn danger" id="sq-leave">Leave squad</button></div>
    <div class="card"><h3>Members</h3><div id="mm"><p class="muted">Loading…</p></div>${lead ? '<p class="muted"><small>👑 As leader, you can remove members or hand leadership to someone else.</small></p>' : ''}</div></div>`;
  if (lead) $('#sq-rename', body).onclick = () => renameSquad($('#sq-name', body).value.trim() || S.squad.name).then(() => { toast('Renamed'); render(); });
  $('#sq-leave', body).onclick = async () => { if (await confirmBox('Leave this squad?', 'You can rejoin later with the code, unless the leader removed you.', 'Leave')) { await leaveSquad(); toast('You left the squad'); go('/squad'); } };
  const un = subMembers(list => {
    const el = $('#mm', body); if (!el || !list) return;
    el.innerHTML = `<ul class="lb">${list.map(m => `<li>${avatarHtml(m, 'sm')}<span class="who"><b>${esc(m.name)}${m.id === S.squad.owner ? ' 👑' : ''}${m.id === FB.uid ? ' (you)' : ''}</b><small class="muted">joined ${timeAgo(m.joined)}</small></span>${lead && m.id !== FB.uid ? `<button class="btn sm ghost" data-lead="${m.id}" title="Make leader">👑</button><button class="btn sm danger" data-kick="${m.id}">Remove</button>` : ''}</li>`).join('')}</ul>`;
    $$('[data-kick]', el).forEach(b => b.onclick = async () => { if (await confirmBox('Remove this member?', 'They won\'t be able to rejoin with the code.', 'Remove')) kickMember(b.dataset.kick).then(() => toast('Removed')).catch(e => toast('Error', e.message)); });
    $$('[data-lead]', el).forEach(b => b.onclick = async () => { if (await confirmBox('Make them the leader?', 'You will no longer be the leader.', 'Transfer')) transferLeader(b.dataset.lead).then(() => { toast('Leadership transferred'); render(); }).catch(e => toast('Error', e.message)); });
  });
  onLeave(un);
}

/* ---------- Live duel ---------- */
route('/live/:id', (view, p) => {
  const ss = squadState();
  if (!ss.inSquad) { go('/squad'); return; }
  if (FB.status !== 'ok') { view.innerHTML = `<div class="wrap narrow"><p class="muted">Connecting…</p></div>`; fbInit().then(ok => ok ? render() : go('/squad')); return; }
  let d = null, playing = false, finished = false, recorded = false, myScore = 0;
  const isHost = () => d && d.host === FB.uid, isGuest = () => d && d.guest === FB.uid;
  const opp = () => isHost() ? { name: d.guestName || '…', avatar: d.guestAvatar || '❔', color: d.guestColor, score: d.gs, idx: d.gi } : { name: d.hostName, avatar: d.hostAvatar, color: d.hostColor, score: d.hs, idx: d.hi };
  const vsBar = () => { const o = opp(); return `<div class="duel-vs"><div class="side-p">${avatarHtml(S.profile, 'sm')}<div style="min-width:0"><div class="nm">${esc(S.profile.name || 'You')}</div><div class="pts">${isHost() ? d.hs : d.gs} pts</div></div></div><span class="vs">VS</span><div class="side-p">${avatarHtml(o, 'sm')}<div style="min-width:0"><div class="nm">${esc(o.name)}</div><div class="pts">${o.score} pts · Q${Math.min(o.idx + 1, d.qids.length)}/${d.qids.length}</div></div></div></div>`; };
  const un = subDuel(p.id, async (doc, err) => {
    if (err) { view.innerHTML = `<div class="wrap narrow"><div class="notice warn">${esc(err.message)}</div></div>`; return; }
    if (!doc) { if (!finished) view.innerHTML = `<div class="wrap narrow empty"><span class="big">💨</span><h2>This duel was cancelled</h2><a class="btn primary" href="#/squad?tab=duels">Back to duels</a></div>`; return; }
    d = doc;
    if (playing) { const x = $('#q-extra', view); if (x) x.innerHTML = vsBar(); return; }
    if (finished) return showEnd();
    if (d.status === 'open') {
      if (isHost()) {
        view.innerHTML = `<div class="wrap narrow"><div class="card" style="text-align:center"><div style="font-size:4rem">⏳</div><h2>Waiting for an opponent…</h2><p class="muted">Squadmates can join from <b>Squad → Duels</b>. Tell them in your group chat!</p><button class="btn danger" id="cancel">Cancel duel</button></div></div>`;
        $('#cancel', view).onclick = () => { duelDelete(d.id); go('/squad?tab=duels'); };
      } else {
        view.innerHTML = `<div class="wrap narrow"><div class="card" style="text-align:center">${avatarHtml({ avatar: d.hostAvatar, color: d.hostColor }, 'lg')}<h2 style="margin-top:12px">${esc(d.hostName)} challenges you!</h2><p class="muted">7 questions · ${esc(COURSE[d.course]?.title || 'Mixed topics')}</p><button class="btn primary lg" id="join">⚔️ Accept duel</button></div></div>`;
        $('#join', view).onclick = () => joinDuel(d.id).catch(e => toast('Could not join', e.message));
        if (p.join) { p.join = 0; joinDuel(d.id).catch(e => toast('Could not join', e.message)); }
      }
      return;
    }
    if ((d.status === 'live') && (isHost() || isGuest())) {
      const myIdx = isHost() ? d.hi : d.gi;
      if (myIdx >= d.qids.length) { finished = true; return showEnd(); }
      playing = true; startPlay(myIdx); return;
    }
    // spectator or finished
    finished = true; showEnd();
  });
  onLeave(un);
  function startPlay(fromIdx) {
    if (fromIdx === 0) { sfx('level'); toast('⚔️ Duel started!', `vs ${opp().name}`); }
    const qs = d.qids.map(id => Q[id]).filter(Boolean).slice(fromIdx);
    runQuiz(view, {
      title: 'Live duel', questions: qs, mode: 'duel', seed: d.seed, back: '/squad?tab=duels', extra: () => vsBar(), explain: true,
      scoreFn: (q, ok, ms) => duelPoints(ok, ms), xpPer: () => 10,
      onAnswer: (q, ok, ms) => { const pts = duelPoints(ok, ms); myScore += pts; duelAnswer(d.id, isHost(), pts).catch(e => toast('Sync error', e.message)); },
      onQuit: () => { },
      onFinish: (st) => { playing = false; finished = true; if (st.xp) addXP(st.xp, 'Live duel'); showEnd(); },
    });
  }
  function showEnd() {
    const N = d.qids.length, both = d.hi >= N && d.gi >= N, me = isHost() || isGuest();
    if (both && d.status !== 'done' && me) duelSet(d.id, { status: 'done' }).catch(() => { });
    const myS = isHost() ? d.hs : d.gs, oS = opp().score;
    if (both && me && !recorded) {
      recorded = true; S.stats.duelsPlayed++;
      if (myS > oS) { S.stats.duelsWon++; addXP(50, 'Won a live duel'); award('duel-win'); confetti(150); sfx('win'); }
      save();
    }
    if (!me) {
      view.innerHTML = `<div class="wrap narrow"><span class="eyebrow">Spectating</span><h2>${esc(d.hostName)} vs ${esc(d.guestName || '…')}</h2><div class="duel-vs"><div class="side-p">${avatarHtml({ avatar: d.hostAvatar, color: d.hostColor }, 'sm')}<div><div class="nm">${esc(d.hostName)}</div><div class="pts">${d.hs} pts · Q${Math.min(d.hi + 1, N)}</div></div></div><span class="vs">VS</span><div class="side-p">${avatarHtml({ avatar: d.guestAvatar, color: d.guestColor }, 'sm')}<div><div class="nm">${esc(d.guestName)}</div><div class="pts">${d.gs} pts · Q${Math.min(d.gi + 1, N)}</div></div></div></div><p class="muted" style="text-align:center">${both ? 'Final!' : 'Live, updating in real time…'}</p><a class="btn" href="#/squad?tab=duels">Back to duels</a></div>`;
      return;
    }
    view.innerHTML = `<div class="wrap narrow"><div class="result card"><span class="eyebrow">Live duel</span>${vsBar()}
      ${both ? `<div class="score">${myS > oS ? '🏆' : myS === oS ? '🤝' : '😤'}</div><p class="muted">${myS > oS ? 'You win! +50 XP' : myS === oS ? "It's a tie!" : `${esc(opp().name)} wins. Rematch?`}</p>` : `<div class="score" style="font-size:3rem">⏳</div><p class="muted">You finished! Waiting for ${esc(opp().name)}… (${Math.min(opp().idx, N)}/${N})</p>`}
      <div class="row" style="justify-content:center"><a class="btn primary" href="#/squad?tab=duels">Back to duels</a><button class="btn" id="rematch">⚔️ New duel</button></div></div></div>`;
    $('#rematch', view).onclick = () => createLiveDuel(d.course);
  }
});
