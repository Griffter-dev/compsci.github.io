/* ================= Boot ================= */
applyTheme();
render();
if (squadState().configured) {
  if (!S.account?.email && !S.account?.skip) showAuthGate();   // sign in first; onboarding comes after
  fbInit();
}
if (!S.profile.onboarded && !$('#auth-gate')) setTimeout(onboarding, 300);
// register service worker for offline use / install (only works when hosted, e.g. GitHub Pages)
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|claudeusercontent/.test(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
}
// keep streak display fresh if the tab stays open past midnight
setInterval(renderChrome, 60 * 1000);
window.addEventListener('storage', e => { if (e.key === STORE_KEY) { load(); applyTheme(); render(); } });
