/* ================= Admin panel (owners + admins only) ================= */
route('/admin', (view) => {
  if (!ACC.admin) {
    view.innerHTML = `<div class="wrap narrow"><h1 style="font-size:2rem">🛡 Admin panel</h1><div class="card"><p>${!signedIn() ? 'Sign in with an owner or admin email to use the admin panel.' : !ACC.verified && (OWNER_EMAILS.includes(ACC.email) || ACC.extraAdmins.includes(ACC.email)) ? `Your email <b>${esc(ACC.email)}</b> isn't verified yet. Click the link we emailed you, then press the button below.` : 'Your account doesn\'t have admin access.'}</p>
      <div class="row">${!signedIn() ? '<button class="btn primary" id="ad-in">Sign in</button>' : !ACC.verified && (OWNER_EMAILS.includes(ACC.email) || ACC.extraAdmins.includes(ACC.email)) ? '<button class="btn primary" id="ad-re">I verified it</button><button class="btn" id="ad-send">Resend the email</button>' : ''}</div></div></div>`;
    $('#ad-in', view)?.addEventListener('click', () => showAuthGate());
    $('#ad-re', view)?.addEventListener('click', () => authRecheck().then(() => toast(ACC.admin ? 'Admin access unlocked 👑' : 'Still not verified. Check your inbox (and spam).')));
    $('#ad-send', view)?.addEventListener('click', () => authResendVerify().then(() => toast('Sent! Check your inbox.')));
    return;
  }
  let tab = 'users';
  view.innerHTML = `<div class="wrap"><span class="eyebrow">// admin</span>
    <div class="spread"><h1 style="font-size:2.2rem;margin:4px 0">🛡 Admin panel</h1><span class="pill ${ACC.owner ? 'role-owner' : 'role-admin'}">${ACC.owner ? '👑 Owner' : '🛡 Admin'} · ${esc(ACC.email)}</span></div>
    <div class="row tabs" style="margin:14px 0" role="tablist">
      <button class="btn sm" data-t="users">👤 Users</button><button class="btn sm" data-t="squads">👥 All squads</button>
      <a class="btn sm" href="#/feedback/inbox">💬 Feedback inbox</a><a class="btn sm" href="#/class-notes/inbox">🗒️ Notes inbox</a>${ACC.owner ? '<button class="btn sm" data-t="admins">🛡 Admins</button>' : ''}</div>
    <div id="ad-body"><p class="muted">Loading…</p></div></div>`;
  const body = $('#ad-body', view);
  const when = t => t ? new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  const role = e => OWNER_EMAILS.includes(e) ? '<span class="pill role-owner">👑 Owner</span>' : ACC.extraAdmins.includes(e) ? '<span class="pill role-admin">🛡 Admin</span>' : '';
  const draw = async () => {
    $$('[data-t]', view).forEach(b => b.classList.toggle('primary', b.dataset.t === tab));
    body.innerHTML = '<p class="muted">Loading…</p>';
    await fbInit();
    try {
      if (tab === 'users') {
        const s = await FB.f.getDocs(FB.f.query(fcol('users'), FB.f.orderBy('updated', 'desc'), FB.f.limit(500)));
        const us = s.docs.map(d => ({ id: d.id, ...d.data() }));
        body.innerHTML = `<p class="muted">${us.length} account${us.length === 1 ? '' : 's'} · most recently active first</p>
          <div class="card" style="overflow-x:auto"><table class="admin-t"><thead><tr><th></th><th>Name</th><th>Email</th><th>Level</th><th>XP</th><th>Squad</th><th>Last active</th></tr></thead><tbody>
          ${us.map(u => `<tr><td>${esc(u.avatar || '🦊')}</td><td><b>${esc(u.name || '(no name)')}</b> ${role(u.email)}</td><td class="mono">${esc(u.email || '')}</td><td>${u.level || 1}</td><td>${fmtNum(u.xp)}</td><td class="mono">${u.squad ? fmtCode(u.squad) : '—'}</td><td>${when(u.updated)}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Nobody has signed in yet.</td></tr>'}
          </tbody></table></div>`;
      } else if (tab === 'squads') {
        const s = await FB.f.getDocs(fcol('squads'));
        const sq = s.docs.map(d => ({ code: d.id, ...d.data() }));
        const counts = await Promise.all(sq.map(x => FB.f.getDocs(fcol('squads', x.code, 'members')).then(r => r.docs.length).catch(() => '?')));
        body.innerHTML = `<p class="muted">${sq.length} squad${sq.length === 1 ? '' : 's'}. As an admin you have leader powers in every squad: approve or delete questions, kick members, assign work and start events.</p>
          <div class="stack">${sq.map((x, i) => `<div class="card spread"><div><b>${esc(x.name || 'Squad')}</b> <span class="pill">${fmtCode(x.code)}</span><br><small class="muted">${counts[i]} member${counts[i] === 1 ? '' : 's'}</small></div>
            <div class="row"><button class="btn sm primary" data-open="${x.code}">Open</button><button class="btn sm ghost" data-del="${x.code}">🗑 Delete</button></div></div>`).join('') || '<p class="muted">No squads yet.</p>'}</div>`;
        $$('[data-open]', body).forEach(b => b.onclick = async () => {
          const x = sq.find(q => q.code === b.dataset.open);
          if (S.squad?.code && S.squad.code !== x.code && !confirm(`Switch from ${S.squad.name} to ${x.name}? You'll show up as a member there.`)) return;
          try { await joinSquad(x.code); go('/squad'); } catch (e) { toast('Could not open squad', e.message); }
        });
        $$('[data-del]', body).forEach(b => b.onclick = async () => {
          const x = sq.find(q => q.code === b.dataset.del);
          if (prompt(`This permanently deletes the squad "${x.name}". Type its code (${x.code}) to confirm.`)?.toUpperCase().replace(/[^A-Z0-9]/g, '') !== x.code) return;
          try { await FB.f.deleteDoc(fdoc('squads', x.code)); toast('Squad deleted'); draw(); } catch (e) { toast('Could not delete', e.message); }
        });
      } else if (tab === 'admins' && ACC.owner) {
        await loadAdminList();
        body.innerHTML = `<div class="card"><h3>Owners</h3><p class="muted">Owners are set in the site's code and security rules and always have full access:</p><ul>${OWNER_EMAILS.map(e => `<li class="mono">${esc(e)}</li>`).join('')}</ul>
          <h3 style="margin-top:20px">Admins</h3><p class="muted">Admins can read feedback, see all users and squads, and act as leader in any squad. They can't add or remove other admins.</p>
          <ul id="ad-list">${ACC.extraAdmins.map(e => `<li class="spread"><span class="mono">${esc(e)}</span><button class="btn sm ghost" data-rm="${esc(e)}">Remove</button></li>`).join('') || '<li class="muted">No extra admins yet.</li>'}</ul>
          <form id="ad-add" class="row" style="margin-top:10px"><input class="input" id="ad-email" type="email" placeholder="friend@example.com" style="flex:1;min-width:200px" required><button class="btn primary">Add admin</button></form></div>`;
        const saveList = async list => { await FB.f.setDoc(fdoc('config', 'admins'), { emails: list }, { merge: true }); await loadAdminList(); draw(); };
        $('#ad-add', body).onsubmit = ev => { ev.preventDefault(); const e = $('#ad-email', body).value.trim().toLowerCase(); if (e && !ACC.extraAdmins.includes(e)) saveList([...ACC.extraAdmins, e]).then(() => toast('Admin added', e + ' gets admin tools the next time they sign in.')).catch(x => toast('Could not save', x.message)); };
        $$('[data-rm]', body).forEach(b => b.onclick = () => saveList(ACC.extraAdmins.filter(x => x !== b.dataset.rm)).catch(x => toast('Could not save', x.message)));
      }
    } catch (e) {
      body.innerHTML = `<div class="notice warn"><b>Couldn't load this.</b><br><small>${esc(e.code || e.message)}</small><p style="margin:8px 0 0">If it says "permission denied", the new security rules haven't been published yet. Open Firebase → Firestore Database → Rules, paste in <code>firestore.rules</code> from the repo, and press Publish.</p></div>`;
    }
  };
  $$('[data-t]', view).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
  draw();
});
